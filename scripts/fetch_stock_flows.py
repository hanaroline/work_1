# -*- coding: utf-8 -*-
"""종목별 외국인·기관 순매수를 모은다.

**이 저장소에 없던 자료다.** 지금까지 종목별 수급은 `index.html` 이 브라우저에서
네이버를 직접 불러 그때그때 보여 줄 뿐이라 서버에 쌓인 것이 없었다. 그래서 신호
모델의 자금수급 축은 거래량이 실린 지표(OBV·MFI·거래량 z)만으로 셈해 왔다.

여기서 모아 `data/flows/kr100.json` 에 **쌓는다.** 쌓이는 만큼 신호의 수급 축에
저절로 들어가고, 증거가 두터워지는 만큼 가중치도 저절로 올라간다(λ) — 넘어야 할
문턱은 없다.

**지어내지 않는다.** 받지 못한 날은 없는 채로 둔다. 0 으로 채우면 「외국인이
사지도 팔지도 않았다」가 되어, 자료가 빠진 날마다 수급 축이 중립으로 끌려간다.

─────────────────────────────────────────────────────────────────────
**이 대본은 만든 자리에서 실제로 돌려 보지 못했다.**

만든 세션은 finance.naver.com·m.stock.naver.com 으로 나가는 길이 막혀 있었다
(에이전트 프록시가 CONNECT 에 403). 그래서 살아 있는 응답에 대고 맞춰 본 적이
없고, 필드 이름은 index.html 이 쓰고 있는 것을 그대로 가져왔을 뿐이다.

그런 처지에서 할 수 있는 것은 **파서가 틀렸을 때 조용히 지나가지 않게** 하는
것이다. 세 겹을 둔다.

  하나. 받은 것이 비었거나 죄다 0 이면 **실패로 끝낸다.** 빈 판을 커밋하지 않는다.
  둘.   실린 종가가 kr100-data 가지의 일봉 종가와 맞는지 본다 — 날짜·종목을 잘못
        짚었거나 표의 칸을 밀려 읽었으면 여기서 어긋난다.
  셋.   **KR100 외국인 순매수의 합이 이미 갖고 있는 시장 전체 수급과 같이 움직이는지**
        본다. 단위를 잘못 잡았거나(주식수↔금액) 부호를 뒤집었으면 상관이 무너진다.
        이 셋째가 제일 세다 — 내 파싱 가정에 기대지 않고 **다른 출처와 맞대 보는**
        유일한 자리다.

셋 다 워크플로에서 돌고, 통과하지 못하면 커밋하지 않는다.
─────────────────────────────────────────────────────────────────────
"""

import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
OUT = os.path.join(ROOT, 'data', 'flows', 'kr100.json')

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/125.0 Safari/537.36')
TIMEOUT = 20

# 네이버를 한꺼번에 때리지 않는다. 백 종목을 쉬지 않고 부르면 막힌다.
SLEEP = 0.35


def kst_now():
    return datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S')


def _get(url, referer=None, encoding='utf-8'):
    h = {'User-Agent': UA, 'Accept': '*/*',
         'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'}
    if referer:
        h['Referer'] = referer
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read().decode(encoding, 'replace')


def universe():
    """KR100 목록. 화면(kr-top100.html)의 COMPANIES 를 읽는다 — 목록을 두 군데
    적어 두면 바뀔 때 한쪽만 고쳐져 어긋난다."""
    p = os.path.join(ROOT, 'kr-top100.html')
    txt = open(p, encoding='utf-8').read()
    m = re.search(r'var COMPANIES = \[(.*?)\n\];', txt, re.S)
    if not m:
        return []
    out = []
    for sym, en, ko in re.findall(r"\['([^']+)','([^']*)','([^']*)'", m.group(1)):
        out.append((sym, (ko or en).strip()))
    return out


# ─────────────────────────────────────────────────────────────────────
# 출처 하나 — 모바일 JSON
# ─────────────────────────────────────────────────────────────────────

def _num(x):
    if x is None:
        return None
    if isinstance(x, (int, float)):
        return float(x)
    s = str(x).replace(',', '').replace('%', '').strip()
    if not s or s in ('-', '--'):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def parse_trend_json(doc):
    """`m.stock.naver.com/api/stock/<코드>/trend` 응답을 읽는다.

    필드 이름은 index.html 이 쓰고 있는 것과 같다 — 그 화면이 실제로 이 응답으로
    수급 차트를 그리고 있으므로, 적어도 이름은 맞다고 볼 근거가 있다.

    순매수는 **주식수**로 온다(`...PureBuyQuant`). 종가를 곱해 억원으로 바꾼다.
    화면도 같은 셈을 한다.
    """
    rows = doc
    if isinstance(doc, dict):
        rows = doc.get('dealTrendInfos') or doc.get('trendInfos') or doc.get('result') or []
    if not isinstance(rows, list):
        return []
    out = []
    for t in rows:
        if not isinstance(t, dict):
            continue
        d = t.get('bizdate') or t.get('localTradedAt') or t.get('date')
        if not d:
            continue
        d = re.sub(r'^(\d{4})(\d{2})(\d{2})$', r'\1-\2-\3', str(d)[:10])
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', d):
            continue
        c = _num(t.get('closePrice'))
        fq = _num(t.get('foreignerPureBuyQuant'))
        iq = _num(t.get('organPureBuyQuant'))
        pq = _num(t.get('individualPureBuyQuant'))
        rr = _num(t.get('foreignerHoldRatio'))
        if c is None or (fq is None and iq is None):
            continue
        out.append({
            'd': d, 'c': c,
            'f': None if fq is None else round(fq * c / 1e8, 2),
            'i': None if iq is None else round(iq * c / 1e8, 2),
            'p': None if pq is None else round(pq * c / 1e8, 2),
            'r': None if rr is None else round(rr, 2),
        })
    return out


# ─────────────────────────────────────────────────────────────────────
# 출처 둘 — 옛 HTML 표 (이력을 더 뒤로 긁을 수 있다)
# ─────────────────────────────────────────────────────────────────────

_ROW = re.compile(r'(?is)<tr[^>]*>(.*?)</tr>')
_CELL = re.compile(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>')


def parse_frgn_html(html):
    """`finance.naver.com/item/frgn.naver?code=...&page=N` 의 표.

    칸 차례: 날짜 · 종가 · 전일비 · 등락률 · 거래량 · 기관 순매매량 ·
             외국인 순매매량 · 외국인 보유주수 · 외국인 보유율

    **칸 수로 거르고 날짜 꼴로 다시 거른다.** 네이버 표에는 머리글·구분선 행이
    섞여 있고, 페이지 틀이 바뀌면 칸이 밀린다. 밀린 채로 읽으면 거래량을 순매수로
    적게 되는데 그건 조용히 틀리는 종류라, 위에 적은 둘째·셋째 검증이 그걸 잡는다.
    """
    out = []
    for tr in _ROW.findall(html):
        cells = [re.sub(r'<[^>]*>', '', c).replace('\xa0', ' ').strip()
                 for c in _CELL.findall(tr)]
        if len(cells) < 9:
            continue
        d = cells[0].replace('.', '-')
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', d):
            continue
        c = _num(cells[1])
        iq = _num(cells[5])
        fq = _num(cells[6])
        rr = _num(cells[8])
        if c is None or (fq is None and iq is None):
            continue
        out.append({
            'd': d, 'c': c,
            'f': None if fq is None else round(fq * c / 1e8, 2),
            'i': None if iq is None else round(iq * c / 1e8, 2),
            'p': None,
            'r': rr,
        })
    return out


def fetch_one(code, pages=1):
    """한 종목. JSON 을 먼저 보고, 없거나 얇으면 HTML 로 더 긁는다.

    돌려주는 것: (행 목록, 어느 출처에서 얼마나 왔는지)
    """
    got = {}
    used = {}
    try:
        doc = json.loads(_get('https://m.stock.naver.com/api/stock/%s/trend' % code,
                              referer='https://m.stock.naver.com/'))
        rows = parse_trend_json(doc)
        for r in rows:
            got[r['d']] = r
        used['json'] = len(rows)
    except Exception as e:
        used['json_error'] = str(e)[:80]

    if pages > 0:
        n = 0
        for pg in range(1, pages + 1):
            try:
                html = _get('https://finance.naver.com/item/frgn.naver?code=%s&page=%d'
                            % (code, pg),
                            referer='https://finance.naver.com/item/frgn.naver?code=%s' % code,
                            encoding='cp949')
                rows = parse_frgn_html(html)
                if not rows:
                    break
                for r in rows:
                    # JSON 이 이미 채운 날은 덮어쓰지 않는다 — 개인 순매수까지
                    # 갖고 있는 쪽이 JSON 이다.
                    got.setdefault(r['d'], r)
                n += len(rows)
                time.sleep(SLEEP)
            except Exception as e:
                used['html_error'] = str(e)[:80]
                break
        used['html'] = n

    return sorted(got.values(), key=lambda r: r['d']), used


# ─────────────────────────────────────────────────────────────────────
# 쌓기
# ─────────────────────────────────────────────────────────────────────

def load_existing():
    if not os.path.exists(OUT):
        return {}
    try:
        return (json.load(open(OUT, encoding='utf-8')).get('stocks') or {})
    except Exception:
        return {}


def merge(old, sym, rows):
    """날짜를 열쇠로 합친다. 다시 돌려도 겹치지 않고, 빈 날은 나중에 메워진다."""
    cur = old.get(sym) or {}
    by = {}
    ds = cur.get('d') or []
    for k, d in enumerate(ds):
        by[d] = {'d': d,
                 'c': (cur.get('c') or [None] * len(ds))[k],
                 'f': (cur.get('f') or [None] * len(ds))[k],
                 'i': (cur.get('i') or [None] * len(ds))[k],
                 'p': (cur.get('p') or [None] * len(ds))[k],
                 'r': (cur.get('r') or [None] * len(ds))[k]}
    for r in rows:
        by[r['d']] = r
    out = [by[d] for d in sorted(by)]
    return {k: [r[k] for r in out] for k in ('d', 'c', 'f', 'i', 'p', 'r')}


def main(argv):
    pages = int(argv[argv.index('--pages') + 1]) if '--pages' in argv else 0
    limit = int(argv[argv.index('--limit') + 1]) if '--limit' in argv else 0
    out_path = argv[argv.index('--out') + 1] if '--out' in argv else OUT

    uni = universe()
    if limit:
        uni = uni[:limit]
    if not uni:
        sys.stderr.write('::error::종목 목록을 읽지 못했습니다\n')
        return 1

    old = load_existing()
    stocks = {}
    diag = {}
    fresh = 0
    for sym, name in uni:
        code = sym.split('.')[0]
        try:
            rows, used = fetch_one(code, pages=pages)
        except Exception as e:
            diag[sym] = {'error': str(e)[:100]}
            rows, used = [], {'error': str(e)[:100]}
        diag[sym] = used
        if rows:
            fresh += 1
        stocks[sym] = merge(old, sym, rows)
        time.sleep(SLEEP)

    # 첫째 검증 — 빈 판을 커밋하지 않는다
    nonzero = 0
    for sym, s in stocks.items():
        if any(x not in (None, 0) for x in (s.get('f') or [])):
            nonzero += 1
    sys.stderr.write('새로 받은 종목 %d / %d, 0 이 아닌 수급이 있는 종목 %d\n'
                     % (fresh, len(uni), nonzero))
    if fresh == 0 or nonzero == 0:
        sys.stderr.write('::error::수급을 하나도 받지 못했거나 죄다 0 입니다 — '
                         '빈 판을 커밋하지 않습니다\n')
        for sym, d in list(diag.items())[:5]:
            sys.stderr.write('  %s %s\n' % (sym, d))
        return 1

    days = sorted({d for s in stocks.values() for d in (s.get('d') or [])})
    doc = {
        'generated_at_kst': kst_now(),
        'source': ('m.stock.naver.com/api/stock/<코드>/trend (주 출처) · '
                   'finance.naver.com/item/frgn.naver (이력 보강)'),
        'unit': {'f': '억원(외국인 순매수)', 'i': '억원(기관 순매수)',
                 'p': '억원(개인 순매수)', 'r': '외국인 보유율 %', 'c': '종가(원)'},
        'derivation': ('순매수는 원자료가 **주식수**로 준다. 종가를 곱해 억원으로 '
                       '바꾼 값이다(수량 × 종가 ÷ 1e8). index.html 이 화면에 쓰는 '
                       '셈과 같다.'),
        'coverage': {'stocks': len(stocks), 'fetched_today': fresh,
                     'days': len(days),
                     'from': days[0] if days else None,
                     'to': days[-1] if days else None},
        'note': ('없는 날은 **없는 채로 둔다.** 0 으로 채우면 「사지도 팔지도 '
                 '않았다」가 되어 자료가 빠진 날마다 수급 축이 중립으로 끌려간다.'),
        'stocks': stocks,
        'diag': diag,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    json.dump(doc, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False,
              separators=(',', ':'))
    sys.stderr.write('썼다: %s (종목 %d, 날짜 %d)\n'
                     % (out_path, len(stocks), len(days)))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
