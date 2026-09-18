#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""국내 종목의 **일봉 전체(시·고·저·종·거래량)** 를 네이버에서 받는다.

왜 만드는가
──────────────────────────────────────────────────────────────────────
이 도구의 지표는 모두 야후 일봉으로 셈한다. 그런데 수급 검산에서 **두 출처가
종가를 다르게 본다**는 것이 드러났다 — 종목일의 15~20% 에서 중앙 0.94% 어긋나고,
어떤 날은 네이버 종가가 야후 **저가보다 낮았다**(같은 세션 가격이면 불가능하다).
2026-09-17 삼성전자는 야후 252,500(-0.39%) · 네이버 256,000(+0.99%) 로 **하루 등락의
부호가 뒤집혔다.**

어느 쪽이 맞는지는 한쪽 자료만으로 가릴 수 없다. 그래서 네이버 일봉을 **따로 받아**
맞대 본다.

**수급 자료의 종가를 쓰면 안 되는 까닭.** data/flows/kr100.json 에도 종가가 있지만
거기에는 시·고·저·거래량이 없다. ATR·ADX·스토캐스틱·MFI·OBV·매물대·거래량 z점수가
전부 그것들을 쓴다. 네이버 종가에 야후 고저를 붙이면 **종가가 고저 범위를 벗어난 봉**이
만들어진다 — 위에 적은 대로 실제로 일어나는 일이다. 그래서 한 출처에서 다섯 칸을
통째로 받는다.

받는 곳 — 세 길을 차례로 시험한다
──────────────────────────────────────────────────────────────────────
이 세션은 네이버로 나가는 길이 막혀 있어(CONNECT 403) **셋 중 무엇이 살아 있는지
확인하지 못했다.** 그래서 하나를 고르지 않고 셋을 차례로 시험하게 두고, 어느 것이
쓰였는지 산출물에 적는다. 러너가 처음 도는 날 답이 나온다.

  1. api.finance.naver.com/siseJson.naver   — 홑따옴표 JS 배열. 한 번에 몇 해치
  2. m.stock.naver.com/api/stock/<code>/price — JSON. 쪽 단위
  3. fchart.stock.naver.com/sise.nhn        — XML. 옛길이지만 오래 살아 있다

쓰는 법
  python3 scripts/fetch_kr_prices_naver.py                 # KR100 전부, 2년
  python3 scripts/fetch_kr_prices_naver.py --limit 5       # 다섯 종목만
  python3 scripts/fetch_kr_prices_naver.py --years 1

주의
  받은 것을 **바로 쓰지 않는다.** verify_kr_prices_naver.py 가 야후와 맞대 보고
  얼마나 어긋나는지 재기 전까지는 참고 자료다. 지표의 기준을 바꾸는 것은 그 다음이다.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
OUT = os.path.join(ROOT, 'data', 'prices_naver', 'kr100.json')

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/125.0 Safari/537.36')
TIMEOUT = 20
SLEEP = 0.35          # 네이버를 쉬지 않고 때리지 않는다
REFERER = 'https://finance.naver.com/'


def kst_now():
    return datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S')


def _get(url, encoding='utf-8'):
    h = {'User-Agent': UA, 'Accept': '*/*',
         'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8', 'Referer': REFERER}
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read().decode(encoding, 'replace')


# ─────────────────────────────────────────────────────────────────────
# 파서 — 길마다 하나씩. **네트워크 없이 시험할 수 있게 떼어 둔다.**
# ─────────────────────────────────────────────────────────────────────

def _num(x):
    if x is None:
        return None
    s = str(x).replace(',', '').replace('+', '').strip().strip("'\"")
    if not s or s in ('-', 'null', 'None'):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _day(s):
    """'20260917' 또는 '2026.09.17' 또는 '2026-09-17' → '2026-09-17'."""
    s = str(s).strip().strip("'\"").replace('.', '').replace('-', '')
    if not re.fullmatch(r'\d{8}', s):
        return None
    return '%s-%s-%s' % (s[:4], s[4:6], s[6:])


def _row(d, o, h, l, c, v):
    """다섯 칸이 다 있고 말이 되는 봉만 통과시킨다.

    **여기서 거르는 것이 중요하다.** 칸이 밀려 읽히면 고가가 저가보다 낮은 따위의
    봉이 나오는데, 그것을 그대로 쌓으면 나중에 어디부터 틀렸는지 가릴 수 없다.
    """
    if d is None or None in (o, h, l, c) or 0 in (o, h, l, c):
        return None
    if h < l or h < max(o, c) or l > min(o, c):
        return None
    return {'d': d, 'o': o, 'h': h, 'l': l, 'c': c, 'v': v or 0}


def parse_sisejson(text):
    """길 1 — `[['날짜','시가','고가','저가','종가','거래량','외국인소진율'], [...]]`.

    홑따옴표라 json 으로 바로 못 읽는다. 대괄호 덩어리를 하나씩 끊어 읽는다.
    """
    rows = []
    for m in re.finditer(r'\[([^\[\]]+)\]', text):
        parts = [p.strip() for p in m.group(1).split(',')]
        if len(parts) < 6:
            continue
        d = _day(parts[0])
        if d is None:                      # 머리글 줄
            continue
        r = _row(d, _num(parts[1]), _num(parts[2]), _num(parts[3]),
                 _num(parts[4]), _num(parts[5]))
        if r:
            rows.append(r)
    return rows


def parse_mobile_price(text):
    """길 2 — m.stock.naver.com 의 JSON.

    응답이 리스트일 때와 {'datas': [...]} 처럼 감싸여 올 때가 모두 있다.
    """
    try:
        doc = json.loads(text)
    except ValueError:
        return []
    if isinstance(doc, dict):
        for k in ('datas', 'priceInfos', 'result', 'items', 'list'):
            if isinstance(doc.get(k), list):
                doc = doc[k]
                break
        else:
            return []
    rows = []
    for it in doc if isinstance(doc, list) else []:
        if not isinstance(it, dict):
            continue
        d = _day(it.get('localTradedAt') or it.get('bizdate') or
                 it.get('tradeDate') or it.get('dt') or '')
        r = _row(d,
                 _num(it.get('openPrice') or it.get('ov')),
                 _num(it.get('highPrice') or it.get('hv')),
                 _num(it.get('lowPrice') or it.get('lv')),
                 _num(it.get('closePrice') or it.get('nv')),
                 _num(it.get('accumulatedTradingVolume') or it.get('aq')))
        if r:
            rows.append(r)
    return rows


def parse_fchart_xml(text):
    """길 3 — `<item data="20260917|257000|259000|251500|252500|12925345" />`."""
    rows = []
    for m in re.finditer(r'data="([^"]+)"', text):
        parts = m.group(1).split('|')
        if len(parts) < 6:
            continue
        d = _day(parts[0])
        r = _row(d, _num(parts[1]), _num(parts[2]), _num(parts[3]),
                 _num(parts[4]), _num(parts[5]))
        if r:
            rows.append(r)
    return rows


# ─────────────────────────────────────────────────────────────────────
# 받아 오기
# ─────────────────────────────────────────────────────────────────────

ROUTES = [
    ('siseJson',
     lambda code, days: 'https://api.finance.naver.com/siseJson.naver'
                        '?symbol=%s&requestType=1&startTime=%s&endTime=%s&timeframe=day'
                        % (code, days[0], days[1]),
     parse_sisejson, 'utf-8'),
    ('mobile',
     lambda code, days: 'https://m.stock.naver.com/api/stock/%s/price'
                        '?pageSize=500&page=1' % code,
     parse_mobile_price, 'utf-8'),
    ('fchart',
     lambda code, days: 'https://fchart.stock.naver.com/sise.nhn'
                        '?symbol=%s&timeframe=day&count=600&requestType=0' % code,
     parse_fchart_xml, 'euc-kr'),
]


def fetch_one(code, span):
    """세 길을 차례로 밟아 **가장 많이 받아 온 길**을 쓴다.

    첫 길이 몇 줄만 주고 성공해 버리면 짧은 이력으로 지표를 셈하게 된다.
    그래서 성공을 「예외가 안 났다」가 아니라 「쓸 만큼 받았다」로 본다.
    """
    best, best_route, errors = [], None, []
    for name, mk, parse, enc in ROUTES:
        try:
            rows = parse(_get(mk(code, span), encoding=enc))
        except Exception as e:                                  # noqa: BLE001
            errors.append('%s: %s' % (name, type(e).__name__))
            continue
        if len(rows) > len(best):
            best, best_route = rows, name
        if len(best) >= 400:          # 넉넉하다 — 더 볼 것 없다
            break
    return best, best_route, errors


def universe():
    """대상 종목 (야후심볼, 6자리 코드) 목록.

    **build_signals 의 것을 그대로 쓴다.** 처음에는 여기서 COMPANIES 를 json 으로
    읽으려다 러너에서 0 초 만에 터졌다 — 그 배열은 JS 주석과 홑따옴표가 섞여 있어
    JSON 이 아니다. build_signals.load_names 가 이미 정규식으로 그 일을 하고 있었고,
    같은 일을 하는 파서를 두 벌 두면 목록 꼴이 바뀔 때 한쪽만 고쳐져 어긋난다.
    """
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import build_signals as B
    names = B.load_names('KR')
    if not names:
        raise SystemExit('kr-top100.html 에서 종목 목록을 읽지 못했습니다')
    return [(sym, sym.split('.')[0]) for sym in sorted(names)
            if sym.endswith(('.KS', '.KQ'))]


def merge(old, sym, rows):
    """날짜로 합친다 — 새 값이 이긴다. 여러 번 돌아도 덧나지 않는다."""
    cur = {}
    o = (old or {}).get(sym)
    if o:
        for i, d in enumerate(o['d']):
            cur[d] = {k: o[k][i] for k in ('o', 'h', 'l', 'c', 'v')}
    for r in rows:
        cur[r['d']] = {k: r[k] for k in ('o', 'h', 'l', 'c', 'v')}
    ds = sorted(cur)
    out = {'d': ds}
    for k in ('o', 'h', 'l', 'c', 'v'):
        out[k] = [cur[d][k] for d in ds]
    return out


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--years', type=int, default=2)
    ap.add_argument('--out', default=OUT)
    a = ap.parse_args(argv)

    today = datetime.now(KST)
    span = ((today - timedelta(days=int(a.years * 372))).strftime('%Y%m%d'),
            today.strftime('%Y%m%d'))

    old = {}
    if os.path.exists(a.out):
        old = (json.load(open(a.out, encoding='utf-8')) or {}).get('stocks') or {}

    syms = universe()
    if a.limit:
        syms = syms[:a.limit]

    stocks, routes, failed = {}, {}, []
    for i, (sym, code) in enumerate(syms):
        rows, route, errs = fetch_one(code, span)
        if not rows:
            failed.append('%s (%s)' % (sym, '; '.join(errs) or '빈 응답'))
        else:
            stocks[sym] = merge(old, sym, rows)
            routes[route] = routes.get(route, 0) + 1
        if (i + 1) % 20 == 0:
            sys.stderr.write('  %d/%d\n' % (i + 1, len(syms)))
        time.sleep(SLEEP)

    # 못 받은 종목은 예전 것이라도 남긴다 — 하루 못 받았다고 이력을 버리지 않는다
    for sym, v in (old or {}).items():
        stocks.setdefault(sym, v)

    days = sorted({d for s in stocks.values() for d in s['d']})
    doc = {
        'generated_at_kst': kst_now(),
        'source': '네이버 금융 일봉',
        'routes_used': routes,
        'unit': {'o': '시가(원)', 'h': '고가(원)', 'l': '저가(원)',
                 'c': '종가(원)', 'v': '거래량(주)'},
        'note': ('야후 일봉과 맞대 보려고 따로 받은 것입니다. '
                 'verify_kr_prices_naver.py 가 얼마나 어긋나는지 재기 전까지는 '
                 '**참고 자료이며 지표의 기준이 아닙니다.**'),
        'coverage': {'stocks': len(stocks), 'fetched_today': len(routes and stocks),
                     'days': len(days),
                     'from': days[0] if days else None,
                     'to': days[-1] if days else None,
                     'failed': len(failed)},
        'stocks': stocks,
    }
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(doc, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False)

    sys.stderr.write('종목 %d · 날짜 %d (%s ~ %s) · 길 %s\n'
                     % (len(stocks), len(days), doc['coverage']['from'],
                        doc['coverage']['to'], json.dumps(routes, ensure_ascii=False)))
    if failed:
        sys.stderr.write('못 받은 종목 %d: %s\n' % (len(failed), ', '.join(failed[:8])))
    print('썼다: %s' % a.out)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
