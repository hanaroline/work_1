#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""**네이버 ETF 수익률에 분배금이 들어 있는가** — 재서 가린다.

화면의 수익률은 한 가지(분배금 포함 총수익)로 통일한다. 국내 ETF 는 네이버
etfAnalysis 가 기간별 수익률을 주는데, 그 값이 가격만 본 것인지 분배금까지 넣은
것인지 원천이 적어 주지 않는다. 짐작으로 고르면 국내와 해외가 서로 다른 수익률로
한 표에 오르게 된다.

그래서 분배가 큰 ETF(월 커버드콜 등)와 분배가 거의 없는 ETF 를 섞어
  ① 네이버 일봉 종가만으로 셈한 1년 가격 수익률
  ② 거기에 야후의 분배 기록을 재투자로 넣은 1년 총수익
  ③ 네이버 etfAnalysis 의 Y1 값 (시장가격·NAV 두 줄)
을 나란히 적는다. ③이 ①에 붙으면 가격 수익률이고 ②에 붙으면 총수익이다.

덤으로 중국 본토 ETF 목록을 야후 스크리너에서 받을 수 있는지도 본다 —
야후는 상해·심천 ETF 를 quoteType EQUITY 로 둔다(510300.SS 로 확인).
"""

import json
import os
import re
import sys
import time
import urllib.parse
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import probe_etf_holdings as P

OUT = os.path.join(P.OUT, 'tr_test.json')
CODES = ['498400', '069500', '458730', '360750', '305080', '441680', '472150', '0086B0']


def naver_closes(code, start):
    url = ('https://api.finance.naver.com/siseJson.naver?symbol=%s&requestType=1&startTime=%s'
           '&endTime=%s&timeframe=day' % (code, start, date.today().strftime('%Y%m%d')))
    st, body, _, _ = P.fetch(url)
    rows = re.findall(r'\["(\d{8})",\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)', body.decode('utf-8', 'replace'))
    return {d: float(c) for d, c in rows}


def yahoo_divs(sym):
    st, body, _, _ = P.fetch('https://query1.finance.yahoo.com/v8/finance/chart/%s?range=2y&interval=1d'
                             '&events=div,split&includeAdjustedClose=true' % sym)
    try:
        r = json.loads(body)['chart']['result'][0]
    except Exception:                                       # noqa: BLE001
        return None, None
    divs = {}
    for v in ((r.get('events') or {}).get('dividends') or {}).values():
        d = time.strftime('%Y%m%d', time.gmtime(v['date'] + 9 * 3600))
        divs[d] = v['amount']
    ts = r.get('timestamp') or []
    q = r['indicators']
    adj = (q.get('adjclose') or [{}])[0].get('adjclose') or []
    cl = q['quote'][0]['close']
    series = {time.strftime('%Y%m%d', time.gmtime(t + 9 * 3600)): (c, a) for t, c, a in zip(ts, cl, adj)}
    return divs, series


def main():
    cr = P.crumb()
    res = {'at': time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()), 'rows': []}
    start = (date.today() - timedelta(days=420)).strftime('%Y%m%d')
    for code in CODES:
        st, body, _, _ = P.fetch('https://m.stock.naver.com/api/stock/%s/etfAnalysis' % code)
        try:
            an = json.loads(body)
        except Exception:                                   # noqa: BLE001
            an = {}
        px = naver_closes(code, start)
        divs, yser = yahoo_divs(code + '.KS')
        row = {'code': code, 'name': an.get('itemName'),
               'naver_ref': an.get('returnPerformanceReferenceDate'),
               'naver_price': {x['periodTypeCode']: x['value'] for x in an.get('returnPerformanceList') or []},
               'naver_nav': {x['periodTypeCode']: x['value'] for x in an.get('navPerformanceList') or []},
               'dividend': an.get('dividend'), 'n_closes': len(px), 'yahoo_divs': divs}
        ref = (an.get('returnPerformanceReferenceDate') or '').replace('.', '')
        days = sorted(px)
        if ref and days:
            end = max(d for d in days if d <= ref) if any(d <= ref for d in days) else None
            y0 = (date(int(ref[:4]) - 1, int(ref[4:6]), int(ref[6:8]))).strftime('%Y%m%d')
            base = max((d for d in days if d <= y0), default=None)
            if end and base:
                pr = px[end] / px[base] - 1
                f = 1.0
                for d in days:
                    if base < d <= end and divs and d in divs:
                        prev = max(x for x in days if x < d)
                        f *= 1 + divs[d] / px[prev]
                row.update({'base': base, 'end': end, 'price_ret_1y': round(pr * 100, 2),
                            'tr_1y_with_yahoo_divs': round(((1 + pr) * f - 1) * 100, 2)})
        if yser:
            yd = sorted(yser)
            row['yahoo_rows'] = len(yd)
            if row.get('base') and row.get('end') and row['base'] in yser and row['end'] in yser:
                (c0, a0), (c1, a1) = yser[row['base']], yser[row['end']]
                if c0 and c1 and a0 and a1:
                    row['yahoo_price_1y'] = round((c1 / c0 - 1) * 100, 2)
                    row['yahoo_adj_1y'] = round((a1 / a0 - 1) * 100, 2)
        res['rows'].append(row)
        print(json.dumps({k: row.get(k) for k in ('code', 'name', 'price_ret_1y', 'tr_1y_with_yahoo_divs',
                                                  'yahoo_price_1y', 'yahoo_adj_1y')}, ensure_ascii=False),
              row['naver_price'].get('Y1'), row['naver_nav'].get('Y1'), flush=True)
        time.sleep(0.4)

    # 중국 본토 목록 — 야후 스크리너 EQUITY + 거래소
    res['cn'] = {}
    for ex in ('SHH', 'SHZ'):
        payload = {'size': 250, 'offset': 0, 'sortField': 'intradaymarketcap', 'sortType': 'DESC',
                   'quoteType': 'EQUITY', 'topOperator': 'AND',
                   'query': {'operator': 'AND', 'operands': [
                       {'operator': 'eq', 'operands': ['exchange', ex]}]},
                   'userId': '', 'userIdType': 'guid'}
        url = ('https://query2.finance.yahoo.com/v1/finance/screener?crumb=' + urllib.parse.quote(cr or '')
               + '&lang=en-US&region=US&formatted=false')
        st, body, _, _ = P.fetch(url, json.dumps(payload).encode(), {'Content-Type': 'application/json'})
        try:
            r = json.loads(body)['finance']['result'][0]
            qs = r['quotes']
            res['cn'][ex] = {'total': r.get('total'), 'n': len(qs),
                             'etf_like': [(q['symbol'], q.get('longName')) for q in qs
                                          if 'ETF' in (q.get('longName') or q.get('shortName') or '')][:20]}
        except Exception as e:                              # noqa: BLE001
            res['cn'][ex] = {'status': st, 'err': str(e), 'body': body[:300].decode('utf-8', 'replace')}
        print(ex, res['cn'][ex].get('total'), flush=True)
    # 중국 개별 심볼 몇 개를 v7 quote 로 — 목록을 코드 범위로 훑을 수 있는가
    syms = ','.join(['510300.SS', '510500.SS', '588000.SS', '159915.SZ', '159919.SZ', '512480.SS'])
    st, body, _, _ = P.fetch('https://query2.finance.yahoo.com/v7/finance/quote?symbols=%s&crumb=%s'
                             % (syms, urllib.parse.quote(cr or '')))
    try:
        res['cn']['quote'] = [(q['symbol'], q.get('quoteType'), q.get('longName'), q.get('regularMarketTime'))
                              for q in json.loads(body)['quoteResponse']['result']]
    except Exception as e:                                  # noqa: BLE001
        res['cn']['quote'] = str(e)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == '__main__':
    sys.exit(main())
