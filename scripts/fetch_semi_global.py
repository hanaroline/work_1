#!/usr/bin/env python3
"""해외(미국·일본·중국) 반도체 소부장 맵의 시장 지표를 모아 각 HTML 에 넣는다.

  tools/semi-global/<cc>.js 의 CO 목록(야후 심볼 y)
  → 야후 v7 quote(40개씩 묶어서) + v8 일봉 2년
  → data/semi-global-<cc>.json · data/semi-global-<cc>-report.md
  → semi-<cc>.html 의 /*METRICS-BEGIN*/…/*METRICS-END*/ 자리

받는 칸
  quote : 현재가·전일 대비·시가총액·PER(후행)·PBR·EPS(후행)·BPS·배당수익률(야후 기준, 이미 % 단위)
  일봉  : 1개월·3개월·연초 대비 수익률, 52주 최고·최저(일봉 고가·저가), 마지막 거래일

틀린 값보다 빈칸이 낫다
  · 야후가 돌려준 회사 이름이 데이터 파일의 영문명과 이어지지 않으면 그 회사 칸을 통째로 비운다
    (심볼이 다른 회사로 넘어간 경우 — ARTR 사례).
  · 마지막 거래일이 그 시장의 가장 최근 거래일보다 7일 넘게 뒤처지면(거래정지 등) 비운다.
  · 통화가 그 나라 통화가 아니면 비운다.
  · 받지 못한 칸은 None 으로 둔다. 다른 원천에서 메우거나 추정하지 않는다.

쓰는 법
  python3 scripts/fetch_semi_global.py --market us          # 한 나라
  python3 scripts/fetch_semi_global.py --market all         # 세 나라
  python3 scripts/fetch_semi_global.py --market jp --limit 5   # 시험(앞 5곳만, 파일은 안 씀)
  python3 scripts/fetch_semi_global.py --selftest           # 이름 대조·계산 자체 시험(네트워크 없음)

표준 라이브러리만 쓴다. 야후 접속 도우미는 fetch_us100.py, 일봉 계산은 fetch_semi_metrics.py 것을 쓴다.
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_us100 as Y  # noqa: E402
from fetch_semi_metrics import calc_from_candles, pos52, MARK_RE  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
MARKETS = {
    'us': {'cur': 'USD', 'tz': -5, 'name': '미국'},
    'jp': {'cur': 'JPY', 'tz': 9, 'name': '일본'},
    'cn': {'cur': 'CNY', 'tz': 8, 'name': '중국'},
}
EX_LABEL = {'NMS': 'NASDAQ', 'NGM': 'NASDAQ', 'NCM': 'NASDAQ', 'NYQ': 'NYSE', 'ASE': 'NYSE American',
            'JPX': 'TSE', 'SHH': 'SSE', 'SHZ': 'SZSE'}
STALE_DAYS = 7
CHUNK = 40
CO_RE = re.compile(r"^'([^']+)':\{y:'([^']+)',c:'([^']*)',m:'[^']*',e:'([^']*)'", re.M)

# 회사 이름 대조에서 빼는 흔한 낱말(이것만 겹치면 같은 회사로 보지 않는다)
GENERIC = set('''
inc corp corporation co company ltd limited plc holdings holding group the and of
technology technologies tech international industries industry systems system electronics electronic
materials material semiconductor semiconductors equipment precision science sciences new
shanghai shenzhen beijing jiangsu zhejiang hangzhou ningbo kunshan wuhan hubei guangdong tianshui shenyang
japan nippon tokyo america american china chinese formerly
advanced research chemical chemicals test control gas photomask microelectronics kogyo
'''.split())


def tokens(s):
    """흔하지 않은 낱말을 나온 순서대로."""
    s = (s or '').lower().replace('&', ' and ')
    return [t for t in re.findall(r'[a-z0-9]+', s) if len(t) >= 3 and t not in GENERIC]


def same_company(ours, *yahoo):
    """데이터 파일 영문명의 첫 고유 낱말이 야후 이름에 있거나, 야후 이름의 첫 고유 낱말이 우리 이름에
    있으면 같은 회사로 본다. 'Lam Research' ↔ 'ACM Research' 처럼 뒷낱말만 겹치는 경우는 다르다고 본다.
    낱말이 붙어 쓰인 경우를 위해 공백을 지운 이름끼리의 앞머리 일치도 본다."""
    a = tokens(ours)
    flat = lambda s: re.sub(r'[^a-z0-9]', '', (s or '').lower())
    for y in yahoo:
        b = tokens(y)
        if a and b and (a[0] in b or b[0] in a):
            return True
        fa, fy = flat(ours), flat(y)
        if len(fa) >= 5 and fy.startswith(fa):
            return True
    return False


def universe(cc):
    with open(os.path.join(ROOT, 'tools', 'semi-global', '%s.js' % cc), encoding='utf-8') as f:
        text = f.read()
    rows = [{'n': m.group(1), 'y': m.group(2), 'c': m.group(3), 'e': m.group(4)} for m in CO_RE.finditer(text)]
    if not rows:
        raise SystemExit('%s.js 에서 기업 목록을 읽지 못했습니다' % cc)
    return rows


def fetch_quotes(syms):
    out, errors = {}, []
    for i in range(0, len(syms), CHUNK):
        part = syms[i:i + CHUNK]
        path = ('/v7/finance/quote?symbols=' + ','.join(urllib.parse.quote(x) for x in part) +
                '&crumb=' + urllib.parse.quote(Y.CRUMB or ''))
        try:
            j = Y.yget(path)
            for r in (j.get('quoteResponse') or {}).get('result') or []:
                out[r.get('symbol')] = r
        except Exception as e:                   # noqa: BLE001 — 한 묶음이 실패해도 나머지는 간다
            errors.append('quote %s…: %s' % (part[0], e))
        time.sleep(1)
    return out, errors


def candles(sym):
    o, meta, _, _ = Y.fetch_chart(sym, '2y', '1d')
    rows = [{'d': d, 'c': c, 'h': h if h is not None else c, 'l': l if l is not None else c}
            for d, c, h, l in zip(o['d'], o['c'], o['h'], o['l']) if c]
    return rows, meta


def num(v, nd):
    if v is None or isinstance(v, bool):
        return None
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    if v != v or v in (float('inf'), float('-inf')):
        return None
    return round(v, nd)


def shape(q, cand, cur):
    """야후 원문 한 종목 → 화면 칸. 값이 없거나 이상하면 None."""
    price = num(q.get('regularMarketPrice'), 4)
    per = num(q.get('trailingPE'), 2)
    pbr = num(q.get('priceToBook'), 2)
    mcap = q.get('marketCap')
    r = {
        'price': price,
        'chg': num(q.get('regularMarketChange'), 4),
        'chgPct': num(q.get('regularMarketChangePercent'), 2),
        'mcap': round(mcap / 1e6) if isinstance(mcap, (int, float)) and mcap > 0 else None,   # 현지 통화 백만 단위
        'per': per if per is not None and per > 0 else None,
        'pbr': pbr if pbr is not None and pbr > 0 else None,
        'eps': num(q.get('epsTrailingTwelveMonths'), 4),
        'bps': num(q.get('bookValue'), 4),
        'dy': num(q.get('dividendYield'), 2),
        'ex': EX_LABEL.get(q.get('exchange'), q.get('fullExchangeName')),
        'cur': q.get('currency'),
        'tradedAt': None,
    }
    t = q.get('regularMarketTime')
    if isinstance(t, (int, float)):
        r['tradedAt'] = datetime.fromtimestamp(t, KST).strftime('%Y-%m-%d %H:%M KST')
    c = calc_from_candles(cand, None) if cand else {}
    r['r1m'], r['r3m'], r['rytd'] = c.get('r1m'), c.get('r3m'), c.get('rytd')
    r['hi52'], r['lo52'] = c.get('hi52c'), c.get('lo52c')
    r['lastDay'] = c.get('lastDay')
    if r['hi52'] is not None and price is not None:
        # 장중 값이 일봉에 아직 없으면 오늘 가격이 52주 범위를 넘을 수 있다 — 위치만 0~100 으로 묶는다
        r['pos52'] = pos52(price, r['hi52'], r['lo52'])
    else:
        r['pos52'] = None
    if r['dy'] is not None and r['dy'] < 0:
        r['dy'] = None
    return r


def blank(reason):
    return {'_blank': reason}


def collect(cc, limit=0):
    rows = universe(cc)
    if limit:
        rows = rows[:limit]
    cfg = MARKETS[cc]
    quotes, errors = fetch_quotes([r['y'] for r in rows])
    co, notes, raw = {}, [], {}
    for r in rows:
        q = quotes.get(r['y'])
        if not q:
            co[r['n']] = blank('quote 없음')
            continue
        yname = q.get('longName') or q.get('shortName')
        raw[r['n']] = {'y': r['y'], 'longName': q.get('longName'), 'shortName': q.get('shortName'),
                       'exchange': q.get('exchange'), 'currency': q.get('currency'),
                       'marketState': q.get('marketState')}
        if not same_company(r['e'], q.get('longName'), q.get('shortName')):
            co[r['n']] = blank('이름 불일치: 데이터 파일 "%s" ↔ 야후 "%s"' % (r['e'], yname))
            continue
        if q.get('currency') != cfg['cur']:
            co[r['n']] = blank('통화 %s (기대 %s)' % (q.get('currency'), cfg['cur']))
            continue
        cand = []
        try:
            cand, _ = candles(r['y'])
        except Exception as e:                   # noqa: BLE001
            errors.append('chart %s: %s' % (r['y'], e))
        time.sleep(Y.PAUSE)
        co[r['n']] = shape(q, cand, cfg['cur'])
        co[r['n']]['_state'] = q.get('marketState')

    # 시장의 가장 최근 거래일 — 그보다 7일 넘게 뒤처진 종목은 비운다
    days = sorted(v['lastDay'] for v in co.values() if v.get('lastDay'))
    as_of = days[-1] if days else None
    if as_of:
        cut = (datetime.strptime(as_of, '%Y-%m-%d') - timedelta(days=STALE_DAYS)).strftime('%Y-%m-%d')
        for n, v in list(co.items()):
            if v.get('lastDay') and v['lastDay'] < cut:
                co[n] = blank('마지막 거래일 %s — 시장 최근일 %s 보다 %d일 넘게 뒤처짐' % (v['lastDay'], as_of, STALE_DAYS))
    intraday = any(v.get('_state') == 'REGULAR' for v in co.values())
    for v in co.values():
        v.pop('_state', None)
    for n, v in co.items():
        if '_blank' in v:
            notes.append('%s: %s' % (n, v['_blank']))
    payload = {
        'market': cc,
        'asOf': as_of,
        'generated': datetime.now(KST).strftime('%Y-%m-%d %H:%M KST'),
        'intraday': intraday,
        'sources': {'quote': 'Yahoo Finance v7 quote', 'candle': 'Yahoo Finance v8 chart (2y, 1d)'},
        'co': {n: ({} if '_blank' in v else v) for n, v in co.items()},
        'blanked': notes,
        'errors': errors,
        'raw': raw,
    }
    return payload, rows


KEEP = ('price', 'chg', 'chgPct', 'mcap', 'per', 'pbr', 'eps', 'bps', 'dy', 'hi52', 'lo52', 'pos52',
        'r1m', 'r3m', 'rytd', 'lastDay', 'tradedAt', 'ex', 'cur')


def slim(p):
    return {'asOf': p['asOf'], 'generated': p['generated'], 'intraday': p['intraday'], 'sources': p['sources'],
            'co': {n: {k: v.get(k) for k in KEEP} for n, v in p['co'].items() if v}}


def inject(html_text, payload):
    blob = '/*METRICS-BEGIN*/window.SEMI_METRICS=%s;/*METRICS-END*/' % (
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
    if not MARK_RE.search(html_text):
        raise SystemExit('HTML 에 /*METRICS-BEGIN*/ 표지가 없습니다')
    return MARK_RE.sub(lambda _: blob, html_text, count=1)


FIELDS = ('price', 'mcap', 'per', 'pbr', 'eps', 'bps', 'dy', 'r1m', 'r3m', 'rytd', 'hi52', 'pos52')


def report(cc, p, rows):
    n = len(rows)
    lines = ['# %s 반도체 소부장 맵 — 지표 수집 보고' % MARKETS[cc]['name'], '',
             '- 기준 거래일: %s · 수집: %s%s' % (p['asOf'], p['generated'], ' · 장중 값 섞임' if p['intraday'] else ''),
             '- 원천: %s / %s' % (p['sources']['quote'], p['sources']['candle']), '',
             '## 칸별로 채운 수', '', '| 칸 | 채움 | 빈칸 |', '|---|---:|---:|']
    for f in FIELDS:
        k = sum(1 for v in p['co'].values() if v and v.get(f) is not None)
        lines.append('| %s | %d | %d |' % (f, k, n - k))
    lines += ['', '## 통째로 비운 회사 (%d)' % len(p['blanked']), '']
    lines += ['- ' + x for x in p['blanked']] or ['- 없음']
    lines += ['', '## 칸별 빈 회사', '']
    for f in ('per', 'pbr', 'dy', 'r3m', 'hi52'):
        miss = [r['n'] for r in rows if p['co'].get(r['n']) and p['co'][r['n']].get(f) is None]
        lines.append('- %s: %s' % (f, ', '.join(miss) if miss else '없음'))
    lines += ['', '## 오류 (%d)' % len(p['errors']), '']
    lines += ['- ' + x for x in p['errors']] or ['- 없음']
    lines += ['', '## 야후가 돌려준 이름', '', '| 기업 | 심볼 | 야후 longName | 거래소 | 통화 |', '|---|---|---|---|---|']
    for r in rows:
        x = p['raw'].get(r['n']) or {}
        lines.append('| %s | %s | %s | %s | %s |' % (r['n'], r['y'], x.get('longName') or x.get('shortName') or '–',
                                                    x.get('exchange') or '–', x.get('currency') or '–'))
    return '\n'.join(lines) + '\n'


def run(cc, limit):
    print('== %s' % cc, flush=True)
    p, rows = collect(cc, limit)
    filled = sum(1 for v in p['co'].values() if v and v.get('price') is not None)
    print('  기준일 %s · 가격 채움 %d/%d · 통째로 비움 %d · 오류 %d' %
          (p['asOf'], filled, len(rows), len(p['blanked']), len(p['errors'])), flush=True)
    for x in p['blanked'] + p['errors']:
        print('  - ' + x, flush=True)
    if limit:
        print(json.dumps(slim(p), ensure_ascii=False)[:1500])
        return 0
    if filled == 0:
        print('  가격을 하나도 못 받았습니다 — 기존 파일을 건드리지 않습니다', flush=True)
        return 1
    data = os.path.join(ROOT, 'data')
    with open(os.path.join(data, 'semi-global-%s.json' % cc), 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False, indent=1)
        f.write('\n')
    with open(os.path.join(data, 'semi-global-%s-report.md' % cc), 'w', encoding='utf-8') as f:
        f.write(report(cc, p, rows))
    html = os.path.join(ROOT, 'semi-%s.html' % cc)
    with open(html, encoding='utf-8') as f:
        text = f.read()
    with open(html, 'w', encoding='utf-8') as f:
        f.write(inject(text, slim(p)))
    return 0


def selftest():
    ok = True
    pairs = [
        ('Ningbo Jiangfeng Electronic Materials (Konfoong)', 'Konfoong Materials International Co., Ltd', True),
        ('Vital Deeptech (formerly Wanye Enterprises)', 'Shanghai Vital Deeptech Co., Ltd.', True),
        ('Hangzhou Lion Microelectronics', 'Hangzhou Lion Electronics Co.,Ltd', True),
        ('Arteris', 'AirTrona International, Inc.', False),
        ('Tokyo Electron', 'Tokyo Electron Limited', True),
        ('Shin-Etsu Chemical', 'Shin-Etsu Chemical Co., Ltd.', True),
        ('Applied Materials', 'Air Products and Chemicals, Inc.', False),
        ('Lam Research', 'ACM Research, Inc.', False),
        ('Advanced Energy Industries', 'Advanced Micro-Fabrication Equipment Inc. Chi', False),
        ('Hangzhou Lion Microelectronics', 'Anji Microelectronics Technology (Shanghai) C', False),
        ('Suzhou Jinhong Gas', 'Jinhong Gas Co.,Ltd.', True),
        ('Japan Electronic Materials', 'Japan Electronic Materials Corporation', True),
        ('Japan Electronic Materials', 'Japan Material Co., Ltd.', False),
        ('Suzhou Jinhong Gas', 'Guangdong Huate Gas Co., Ltd', False),
    ]
    for a, b, want in pairs:
        got = same_company(a, b)
        ok &= got == want
        print('%s  %s ↔ %s' % ('통과' if got == want else '실패', a, b))
    return 0 if ok else 1


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--market', default='all', choices=['us', 'jp', 'cn', 'all'])
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--selftest', action='store_true')
    a = ap.parse_args(argv)
    if a.selftest:
        return selftest()
    Y.init_crumb()
    rc = 0
    for cc in (('us', 'jp', 'cn') if a.market == 'all' else (a.market,)):
        rc |= run(cc, a.limit)
    return rc


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
