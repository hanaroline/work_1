#!/usr/bin/env python3
"""반도체 소부장 맵(semi-supply-chain.html) 시장 지표 수집기.

무엇을 하나
  화면의 `const CO = {...}` 에 실린 상장사(종목코드 있는 곳)마다
    · 현재가·전일대비·등락률·시가총액·PER·PBR·EPS·BPS·외국인 소진율  ← 네이버 증권 basic / integration
    · 1개월·3개월·연초 대비 수익률, 52주 최고·최저와 현재 위치(%)     ← 네이버 일봉
    · 상장일                         ← KIND 상장법인목록(거래소) + 다음 금융 시세 API 대조
  를 모아 data/semi-metrics.json 에 쓰고, 같은 내용을 HTML 의 표지 사이
  (/*METRICS-BEGIN*/ … /*METRICS-END*/) 에 끼워 넣는다 — 화면 한 장만 받아 가도 보이게.

지키는 것
  · **못 받은 값은 null 로 둔다.** 문자열을 숫자로 못 읽으면 지어내지 않고 비운다.
    원래 문자열은 raw 에 같이 남긴다(화면이 아닌 검증용).
  · 응답의 종목명이 화면의 회사명과 다르면 그 종목의 값을 쓰지 않는다(코드 오기 방어).
  · 상장일은 두 곳(KIND·다음)이 같을 때 쓰고, 어긋나면 비운다. 한 곳만 주면 그 값을 쓰되
    어디서 왔는지 listedSrc 에 남긴다. 둘 다 못 받으면 지난 실행 값을 이어 쓴다.
  · 표준 라이브러리만 쓴다. 이 세션 샌드박스에서는 네이버·KIS 가 막혀 있으므로
    실제 수집은 GitHub Actions 러너에서 돈다(.github/workflows/semi-metrics.yml).

쓰는 법
  python3 scripts/fetch_semi_metrics.py                 # 수집 → json + HTML 반영
  python3 scripts/fetch_semi_metrics.py --limit 3       # 앞의 3곳만(시험)
  python3 scripts/fetch_semi_metrics.py --inject-only   # 있는 json 을 HTML 에만 다시 넣기
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_kr_prices_naver import _get, _num, fetch_one, KST, UA  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'semi-supply-chain.html')
OUT = os.path.join(ROOT, 'data', 'semi-metrics.json')
REPORT = os.path.join(ROOT, 'data', 'semi-metrics-report.md')
SLEEP = 0.35
FIRST_RAW = []      # 첫 응답의 totalInfos 원문 — 보고서에 남겨 키 이름을 확인한다

BASIC = 'https://m.stock.naver.com/api/stock/%s/basic'
INTEG = 'https://m.stock.naver.com/api/stock/%s/integration'
MARK_RE = re.compile(r'/\*METRICS-BEGIN\*/.*?/\*METRICS-END\*/', re.S)


# ─────────────────────────────────────────────────────────────────────
# 대상 — HTML 의 CO 블록에서 (회사명, 코드, 시장) 을 읽는다
# ─────────────────────────────────────────────────────────────────────

def universe(html_text):
    m = re.search(r'const CO = \{(.*?)\n\};', html_text, re.S)
    if not m:
        raise SystemExit('semi-supply-chain.html 에서 CO 블록을 찾지 못했습니다')
    out = []
    for g in re.finditer(r"^'([^']+)':\{e:'[^']*',c:'(\d{6})?',m:'([A-Z]*)'",
                         m.group(1), re.M):
        if g.group(2):
            out.append((g.group(1), g.group(2), g.group(3)))
    return out


# ─────────────────────────────────────────────────────────────────────
# 파서 — 네트워크 없이 시험할 수 있게 떼어 둔다
# ─────────────────────────────────────────────────────────────────────

def parse_eok(s):
    """'1조 2,345억' · '2,345억' · '12.3조' → 억 원 단위 숫자. 못 읽으면 None."""
    if s is None:
        return None
    t = str(s).replace(',', '').replace(' ', '').replace('원', '')
    m = re.fullmatch(r'(?:(\d+(?:\.\d+)?)조)?(?:(\d+(?:\.\d+)?)억)?', t)
    if not m or not (m.group(1) or m.group(2)):
        return None
    return round(float(m.group(1) or 0) * 10000 + float(m.group(2) or 0), 1)


def parse_unit(s):
    """'12.34배' · '1,234원' · '12.34%' · '-' → 숫자 또는 None."""
    if s is None:
        return None
    t = re.sub(r'(배|원|%)$', '', str(s).strip())
    return _num(t)


# integration.totalInfos 의 항목 — code 로 먼저 찾고, 없으면 한글 key 로 찾는다.
INFO_KEYS = {
    'mcap':  (('marketValue',), ('시총', '시가총액'), parse_eok),
    'per':   (('per',), ('PER',), parse_unit),
    'eps':   (('eps',), ('EPS',), parse_unit),
    'pbr':   (('pbr',), ('PBR',), parse_unit),
    'bps':   (('bps',), ('BPS',), parse_unit),
    'frgn':  (('foreignRate',), ('외인소진율', '외국인소진율', '외국인 소진율'), parse_unit),
    # highPriceOf52Weeks 는 '원주가 기준'(수정 전)이다. 액면분할·병합 뒤엔 크게 어긋난다
    'hi52':  (('highPriceOf52WeeksAdjusted',), ('52주 최고',), parse_unit),
    'lo52':  (('lowPriceOf52WeeksAdjusted',), ('52주 최저',), parse_unit),
}


def parse_integration(doc):
    infos = (doc or {}).get('totalInfos') or []
    by_code = {str(t.get('code')): t.get('value') for t in infos if isinstance(t, dict)}
    by_key = {str(t.get('key')).strip(): t.get('value') for t in infos if isinstance(t, dict)}
    vals, raw = {}, {}
    for k, (codes, labels, fn) in INFO_KEYS.items():
        s = next((by_code[c] for c in codes if c in by_code), None)
        if s is None:
            s = next((by_key[l] for l in labels if l in by_key), None)
        raw[k] = s
        vals[k] = fn(s)
    name = (doc or {}).get('stockName')
    return vals, raw, name


def parse_basic(doc):
    doc = doc or {}
    cmp_ = doc.get('compareToPreviousPrice') or {}
    sign = 1
    if str(cmp_.get('code')) in ('4', '5') or str(cmp_.get('name')) in ('FALLING', 'LOWER_LIMIT'):
        sign = -1
    chg = _num(doc.get('compareToPreviousClosePrice'))
    if chg is not None and chg > 0:
        chg *= sign
    pct = _num(doc.get('fluctuationsRatio'))
    if pct is not None and pct > 0:
        pct *= sign
    return {
        'price': _num(doc.get('closePrice')),
        'chg': chg,
        'chgPct': pct,
        'tradedAt': doc.get('localTradedAt'),
        'status': doc.get('marketStatus'),
    }, doc.get('stockName')


def _close_on_or_before(rows, day):
    """day('YYYY-MM-DD') 당일이나 그 앞의 마지막 종가."""
    best = None
    for r in rows:
        if r['d'] <= day:
            best = r
        else:
            break
    return best


def calc_from_candles(rows, today):
    """일봉에서 수익률·52주 고저를 셈한다. 이력이 모자라면 그 칸은 None."""
    rows = sorted(rows, key=lambda r: r['d'])
    out = {'r1m': None, 'r3m': None, 'rytd': None, 'hi52c': None, 'lo52c': None,
           'lastDay': None, 'lastClose': None}
    if not rows:
        return out
    last = rows[-1]
    out['lastDay'], out['lastClose'] = last['d'], last['c']

    def ret(base_day):
        if rows[0]['d'] > base_day:          # 이력이 그만큼 길지 않다
            return None
        b = _close_on_or_before(rows, base_day)
        if not b or not b['c']:
            return None
        return round((last['c'] / b['c'] - 1) * 100, 2)

    ld = datetime.strptime(last['d'], '%Y-%m-%d')
    out['r1m'] = ret((ld - timedelta(days=30)).strftime('%Y-%m-%d'))
    out['r3m'] = ret((ld - timedelta(days=91)).strftime('%Y-%m-%d'))
    out['rytd'] = ret('%d-12-31' % (ld.year - 1))
    since = (ld - timedelta(days=365)).strftime('%Y-%m-%d')
    yr = [r for r in rows if r['d'] > since]
    if rows[0]['d'] <= since and yr:         # 1년 치가 다 있을 때만
        out['hi52c'] = max(r['h'] for r in yr)
        out['lo52c'] = min(r['l'] for r in yr)
    return out


def pos52(price, hi, lo):
    if None in (price, hi, lo) or hi <= lo:
        return None
    return round(max(0.0, min(100.0, (price - lo) / (hi - lo) * 100)), 1)


def same_name(a, b):
    norm = lambda s: re.sub(r'[\s()㈜]|주식회사', '', str(s or '')).upper()
    return norm(a) == norm(b)


# ─────────────────────────────────────────────────────────────────────
# 상장일 — KIND 상장법인목록(한 번 받음) + 다음 시세 API(종목마다) 대조.
# 저장소 KIS 키는 모의투자용이라 상품기본조회(CTPF1002R)를 못 쓴다(EGW02004·EGW02006).
# KIND 는 2026-09 엔 러너에 403 이었으나 2026-10-30 정찰에서 200 으로 열렸다.
# ─────────────────────────────────────────────────────────────────────

KIND_URL = 'https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13&marketType='
DAUM_URL = 'https://finance.daum.net/api/quotes/A%s?summary=false'
DATE_RE = re.compile(r'(19|20)\d\d-[01]\d-[0-3]\d')


def parse_kind(html):
    """KIND 내려받기 표 → {코드: (회사명, 'YYYY-MM-DD' 또는 None)}. 대문자 태그로 올 때가 있다.

    열 순서가 바뀐 적이 있다(시장구분 열이 끼어듦) — 칸 번호 대신 첫 6자리 숫자 칸을
    종목코드로, 그 뒤 첫 날짜 칸을 상장일로 읽는다. 회사명은 첫 칸.
    """
    out = {}
    for tr in re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.S | re.I):
        tds = [re.sub(r'<[^>]+>', '', td).replace('&amp;', '&').replace('&nbsp;', ' ').strip()
               for td in re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S | re.I)]
        ci = next((i for i, t in enumerate(tds) if i and re.fullmatch(r'\d{6}', t)), None)
        if ci is None:
            continue
        day = next((t for t in tds[ci + 1:] if DATE_RE.fullmatch(t)), None)
        out[tds[ci]] = (tds[0], day)
    return out


def fetch_kind():
    try:
        req = urllib.request.Request(KIND_URL, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            html = r.read().decode('euc-kr', 'replace')
        rows = parse_kind(html)
        if rows:
            return rows, 'KIND %d사' % len(rows)
        tr = re.search(r'<tr[^>]*>.*?</tr>.*?<tr[^>]*>(.*?)</tr>', html, re.S | re.I)
        snip = re.sub(r'\s+', ' ', tr.group(1) if tr else html[:300])[:300].replace('|', '/')
        return {}, 'KIND 응답(%d자)에 표 없음 — 둘째 행: %s' % (len(html), snip)
    except Exception as e:                                       # noqa: BLE001
        return {}, 'KIND 못 받음: %s' % (str(e)[:60] or type(e).__name__)


def parse_daum(doc):
    """다음 시세 API 응답 → (종목명, 상장일)."""
    v = str(doc.get('listingDate') or '').strip()[:10]
    return doc.get('name'), (v if DATE_RE.fullmatch(v) else None)


def fetch_daum(code):
    req = urllib.request.Request(DAUM_URL % code, headers={
        'User-Agent': UA, 'Accept': 'application/json',
        'Referer': 'https://finance.daum.net/quotes/A%s' % code})
    with urllib.request.urlopen(req, timeout=20) as r:
        return parse_daum(json.loads(r.read().decode('utf-8', 'replace')))


def decide_listed(name, kind_row, daum, old):
    """(값, 출처, 오류) — 어긋나면 비우고, 회사명이 다른 응답은 버린다."""
    errs = []
    k = d = None
    if kind_row:
        if same_name(kind_row[0], name):
            k = kind_row[1]
        else:
            errs.append('KIND 사명 불일치(%s) — 상장일 버림' % kind_row[0])
    if daum:
        if not daum[0] or same_name(daum[0], name):
            d = daum[1]
        else:
            errs.append('다음 종목명 불일치(%s) — 상장일 버림' % daum[0])
    if k and d:
        if k == d:
            return k, 'kind+daum', errs
        return None, None, errs + ['상장일 어긋남: KIND %s / 다음 %s — 비움' % (k, d)]
    if k:
        return k, 'kind', errs
    if d:
        return d, 'daum', errs
    return old, ('prev' if old else None), errs


# ─────────────────────────────────────────────────────────────────────

def collect_one(name, code, market, today, span, kind, old_listed):
    rec = {'code': code, 'market': market, 'errors': []}
    vals_i, raw_i, nm_i = {}, {}, None
    vals_b, nm_b = {}, None
    try:
        vals_b, nm_b = parse_basic(json.loads(_get(BASIC % code)))
    except Exception as e:                                       # noqa: BLE001
        rec['errors'].append('basic: %s' % type(e).__name__)
    time.sleep(SLEEP)
    try:
        doc_i = json.loads(_get(INTEG % code))
        vals_i, raw_i, nm_i = parse_integration(doc_i)
        if not FIRST_RAW:
            FIRST_RAW.append({'name': name, 'totalInfos': doc_i.get('totalInfos')})
    except Exception as e:                                       # noqa: BLE001
        rec['errors'].append('integration: %s' % type(e).__name__)
    time.sleep(SLEEP)

    got = nm_b or nm_i
    rec['naverName'] = got
    mismatch = bool(got and not same_name(got, name))
    if mismatch:
        rec['errors'].append('종목명 불일치: 화면 %s / 응답 %s — 값 버림' % (name, got))
        vals_b, vals_i, raw_i = {}, {}, {}

    rows, route, errs = fetch_one(code, span)
    rec['errors'] += ['candle %s' % x for x in errs]
    if mismatch:
        rows = []
    cd = calc_from_candles(rows, today)
    time.sleep(SLEEP)

    price = vals_b.get('price')
    if price is None:
        price = cd['lastClose']
    hi = cd['hi52c'] if cd['hi52c'] is not None else vals_i.get('hi52')
    lo = cd['lo52c'] if cd['lo52c'] is not None else vals_i.get('lo52')
    rec.update({
        'price': price, 'chg': vals_b.get('chg'), 'chgPct': vals_b.get('chgPct'),
        'tradedAt': vals_b.get('tradedAt'), 'status': vals_b.get('status'),
        'mcap': vals_i.get('mcap'), 'per': vals_i.get('per'), 'pbr': vals_i.get('pbr'),
        'eps': vals_i.get('eps'), 'bps': vals_i.get('bps'), 'frgn': vals_i.get('frgn'),
        'hi52': hi, 'lo52': lo,
        'hi52src': 'candle' if cd['hi52c'] is not None else ('naver' if hi is not None else None),
        'pos52': pos52(price, hi, lo),
        'r1m': cd['r1m'], 'r3m': cd['r3m'], 'rytd': cd['rytd'],
        'lastDay': cd['lastDay'], 'candleRoute': route,
        'raw': raw_i,
    })

    daum = None
    try:
        daum = fetch_daum(code)
    except Exception as e:                                       # noqa: BLE001
        rec['errors'].append('daum: %s' % (str(e)[:60] or type(e).__name__))
    time.sleep(SLEEP)
    rec['listed'], rec['listedSrc'], errs = decide_listed(name, kind.get(code), daum, old_listed)
    rec['errors'] += errs
    return rec


def inject(html_text, payload):
    blob = '/*METRICS-BEGIN*/window.SEMI_METRICS=%s;/*METRICS-END*/' % (
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
    if not MARK_RE.search(html_text):
        raise SystemExit('HTML 에 /*METRICS-BEGIN*/ 표지가 없습니다')
    return MARK_RE.sub(lambda _: blob, html_text, count=1)


def slim(payload):
    """HTML 에는 화면이 쓰는 칸만 넣는다(raw·errors 는 json 에만)."""
    keep = ('price', 'chg', 'chgPct', 'mcap', 'per', 'pbr', 'eps', 'bps', 'frgn',
            'hi52', 'lo52', 'pos52', 'r1m', 'r3m', 'rytd', 'lastDay', 'listed', 'tradedAt')
    return {'asOf': payload['asOf'], 'generated': payload['generated'],
            'intraday': payload.get('intraday', False),
            'sources': payload['sources'],
            'co': {n: {k: r.get(k) for k in keep} for n, r in payload['co'].items()}}


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--inject-only', action='store_true')
    ap.add_argument('--html', default=HTML)
    ap.add_argument('--out', default=OUT)
    a = ap.parse_args(argv)

    with open(a.html, encoding='utf-8') as f:
        html_text = f.read()

    if a.inject_only:
        with open(a.out, encoding='utf-8') as f:
            payload = json.load(f)
        with open(a.html, 'w', encoding='utf-8') as f:
            f.write(inject(html_text, slim(payload)))
        print('HTML 에 다시 넣음: %d곳' % len(payload['co']))
        return 0

    old = {}
    if os.path.exists(a.out):
        try:
            with open(a.out, encoding='utf-8') as f:
                old = json.load(f).get('co') or {}
        except Exception:                                        # noqa: BLE001
            old = {}

    targets = universe(html_text)
    if a.limit:
        targets = targets[:a.limit]
    today = datetime.now(KST)
    span = ((today - timedelta(days=420)).strftime('%Y%m%d'), today.strftime('%Y%m%d'))
    kind, kind_note = fetch_kind()
    print(kind_note, flush=True)

    co, lines = {}, []
    for i, (name, code, market) in enumerate(targets, 1):
        rec = collect_one(name, code, market, today, span, kind,
                          (old.get(name) or {}).get('listed'))
        co[name] = rec
        filled = sum(rec.get(k) is not None for k in ('price', 'mcap', 'per', 'pbr', 'frgn', 'r1m', 'pos52'))
        lines.append('| %s | %s | %d/7 | %s |' % (name, code, filled, '; '.join(rec['errors']) or ''))
        print('[%d/%d] %s %s  %d/7  %s' % (i, len(targets), name, code, filled,
                                          '; '.join(rec['errors'])), flush=True)

    days = sorted({r['lastDay'] for r in co.values() if r.get('lastDay')})
    payload = {
        'asOf': days[-1] if days else None,
        # 장중에 돌리면 값이 종가가 아니다 — 화면이 '종가' 대신 '장중'으로 적게 한다
        'intraday': any(r.get('status') == 'OPEN' for r in co.values()),
        'generated': today.strftime('%Y-%m-%d %H:%M KST'),
        'sources': {
            'quote': 'm.stock.naver.com/api/stock/<코드>/basic · /integration',
            'candle': '네이버 증권 일봉 (fetch_kr_prices_naver.fetch_one)',
            'listed': 'KIND 상장법인목록(kind.krx.co.kr) · 다음 금융 시세 API 대조 — %s' % kind_note,
        },
        'co': co,
    }
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    with open(a.html, 'w', encoding='utf-8') as f:
        f.write(inject(html_text, slim(payload)))

    n = len(co)
    cnt = lambda k: sum(r.get(k) is not None for r in co.values())
    sample = FIRST_RAW[0] if FIRST_RAW else None
    with open(REPORT, 'w', encoding='utf-8') as f:
        f.write('# 반도체 소부장 지표 수집 %s\n\n' % payload['generated'])
        f.write('기준 거래일 %s · 대상 %d곳 · %s\n\n' % (payload['asOf'], n, kind_note))
        srcs = {}
        for r in co.values():
            srcs[r.get('listedSrc')] = srcs.get(r.get('listedSrc'), 0) + 1
        f.write('상장일 출처: %s\n\n' % ' · '.join('%s %d' % (k or '없음', v) for k, v in sorted(srcs.items(), key=lambda x: str(x[0]))))
        f.write('| 항목 | 채움 |\n|---|---|\n')
        for k in ('price', 'chgPct', 'mcap', 'per', 'pbr', 'eps', 'bps', 'frgn',
                  'pos52', 'r1m', 'r3m', 'rytd', 'listed'):
            f.write('| %s | %d/%d |\n' % (k, cnt(k), n))
        f.write('\n첫 응답 integration totalInfos 원문(키 이름 확인용): `%s`\n\n' % json.dumps(sample, ensure_ascii=False))
        f.write('| 회사 | 코드 | 채움 | 오류 |\n|---|---|---|---|\n')
        f.write('\n'.join(lines) + '\n')
    print('완료: %d곳, 기준일 %s' % (n, payload['asOf']))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
