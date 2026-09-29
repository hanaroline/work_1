#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETF 구성종목 화면을 만들기 전에 **어느 원천이 무엇을 주는지** 먼저 본다.

클로드 세션은 이그레스 정책 때문에 네이버·야후 어디에도 못 붙는다(CONNECT 403).
그래서 러너가 후보 주소를 한 바퀴 돌며 응답의 머리만 떠서
tools/etf-holdings-discovery/ 에 남긴다. 수집기의 파서는 이 기록을 보고 짠다 —
짐작한 필드 이름으로 파서를 짜면 빈 칸이 「원천이 안 준 것」인지 「내가 잘못
읽은 것」인지 가릴 수 없다.

  python3 scripts/probe_etf_holdings.py
"""

import http.cookiejar
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'etf-holdings-discovery')
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/125.0 Safari/537.36')
KEEP = 6000          # 응답마다 앞에서 이만큼만 남긴다

_CJ = http.cookiejar.CookieJar()
_OP = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_CJ))


def fetch(url, data=None, headers=None, enc='utf-8'):
    h = {'User-Agent': UA, 'Accept': '*/*', 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'}
    if 'naver' in url:
        h['Referer'] = 'https://m.stock.naver.com/'
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, headers=h)
    t0 = time.time()
    try:
        with _OP.open(req, timeout=30) as r:
            body = r.read()
            return r.status, body, round(time.time() - t0, 2), r.headers.get('Content-Type')
    except urllib.error.HTTPError as e:
        return e.code, e.read() or b'', round(time.time() - t0, 2), None
    except Exception as e:                                  # noqa: BLE001
        return None, str(e).encode(), round(time.time() - t0, 2), None


def crumb():
    for u in ('https://fc.yahoo.com/', 'https://finance.yahoo.com/quote/SPY/'):
        fetch(u)
    for host in ('query2', 'query1'):
        st, b, _, _ = fetch('https://%s.finance.yahoo.com/v1/test/getcrumb' % host)
        v = b.decode('utf-8', 'replace').strip()
        if st == 200 and v and len(v) < 40 and '<' not in v:
            return v
    return None


KR = ['069500', '091160', '360750', '305720', '122630', '139260']
Y_SYMS = ['SPY', 'VTI', 'SOXX', 'TQQQ', '2800.HK', '3033.HK', '1321.T', '1306.T',
          '510300.SS', '159915.SZ', '069500.KS']
NV_WORLD = ['SPY', 'SOXX', 'QQQ', 'VTI', '2800.HK', '1321.T']


def probes(cr):
    out = []
    # ── 국내 · 네이버 ────────────────────────────────────────────
    out.append(('nv_etf_list', 'https://finance.naver.com/api/sise/etfItemList.nhn?etfType=0'
                '&targetColumn=market_sum&sortOrder=desc', 'euc-kr'))
    for c in KR[:3]:
        for tag, tpl in [
            ('nv_etfAnalysis', 'https://m.stock.naver.com/api/stock/%s/etfAnalysis'),
            ('nv_integration', 'https://m.stock.naver.com/api/stock/%s/integration'),
            ('nv_basic', 'https://m.stock.naver.com/api/stock/%s/basic'),
            ('nv_etfComponent', 'https://m.stock.naver.com/api/stock/%s/etfComponent'),
            ('nv_dividend', 'https://m.stock.naver.com/api/stock/%s/dividend'),
            ('nv_dividendHist', 'https://m.stock.naver.com/api/stock/%s/dividend/history'),
            ('nv_etfDividend', 'https://m.stock.naver.com/api/stock/%s/etfDividend'),
            ('nv_finance', 'https://m.stock.naver.com/api/stock/%s/finance/annual'),
            ('nv_wise_etf', 'https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd=%s'),
            ('nv_item_main', 'https://finance.naver.com/item/main.naver?code=%s'),
            ('nv_item_coinfo', 'https://finance.naver.com/item/coinfo.naver?code=%s'),
        ]:
            enc = 'euc-kr' if 'finance.naver.com/item' in tpl else 'utf-8'
            out.append(('%s_%s' % (tag, c), tpl % c, enc))
    out.append(('nv_sisejson_069500', 'https://api.finance.naver.com/siseJson.naver?symbol=069500'
                '&requestType=1&startTime=20150101&endTime=20260929&timeframe=day', 'utf-8'))
    out.append(('nv_wise_dps_069500', 'https://navercomp.wisereport.co.kr/v2/ETF/ETFdps.aspx?cmp_cd=069500', 'utf-8'))
    # ── 해외 · 네이버 해외주식 ────────────────────────────────────
    for s in NV_WORLD:
        for tag, tpl in [
            ('nvw_basic', 'https://api.stock.naver.com/stock/%s/basic'),
            ('nvw_integration', 'https://api.stock.naver.com/stock/%s/integration'),
            ('nvw_etf', 'https://api.stock.naver.com/etf/%s/basic'),
            ('nvw_etfAnalysis', 'https://api.stock.naver.com/stock/%s/etfAnalysis'),
        ]:
            out.append(('%s_%s' % (tag, s), tpl % s, 'utf-8'))
    out.append(('nvw_search_SPY', 'https://m.stock.naver.com/front-api/search/autoComplete?query=SPY&target=stock,index,marketindicator', 'utf-8'))
    out.append(('nvw_basic_SPY.K', 'https://api.stock.naver.com/stock/SPY.K/basic', 'utf-8'))
    out.append(('nvw_integ_SPY.K', 'https://api.stock.naver.com/stock/SPY.K/integration', 'utf-8'))
    out.append(('nvw_etf_SPY.K', 'https://api.stock.naver.com/etf/SPY.K/basic', 'utf-8'))
    out.append(('nvw_integ_SOXX.O', 'https://api.stock.naver.com/stock/SOXX.O/integration', 'utf-8'))
    out.append(('nvw_integ_2800.HK', 'https://api.stock.naver.com/stock/2800.HK/integration', 'utf-8'))
    out.append(('nvw_integ_1321.T', 'https://api.stock.naver.com/stock/1321.T/integration', 'utf-8'))
    out.append(('nvw_integ_510300.SS', 'https://api.stock.naver.com/stock/510300.SS/integration', 'utf-8'))
    # ── 야후 ───────────────────────────────────────────────────
    q = ('&crumb=' + urllib.parse.quote(cr)) if cr else ''
    for s in Y_SYMS:
        out.append(('y_qs_%s' % s, 'https://query2.finance.yahoo.com/v10/finance/quoteSummary/%s'
                    '?modules=topHoldings,fundProfile,defaultKeyStatistics,summaryDetail,price,'
                    'quoteType,fundPerformance,assetProfile&formatted=false%s' % (s, q), 'utf-8'))
    for s in ['SPY', '2800.HK', '1321.T', '510300.SS', '069500.KS']:
        out.append(('y_chart_%s' % s, 'https://query1.finance.yahoo.com/v8/finance/chart/%s'
                    '?range=10y&interval=1d&events=div,split&includeAdjustedClose=true' % s, 'utf-8'))
    out.append(('y_quote_multi', 'https://query2.finance.yahoo.com/v7/finance/quote?symbols='
                'SPY,VTI,2800.HK,1321.T,510300.SS,069500.KS%s' % q, 'utf-8'))
    # ── 목록 ───────────────────────────────────────────────────
    out.append(('nasdaq_etf_list', 'https://api.nasdaq.com/api/screener/etf?download=true', 'utf-8'))
    out.append(('hkex_list', 'https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx', None))
    out.append(('jpx_etf_list', 'https://www.jpx.co.jp/english/equities/products/etfs/issues/01.html', 'utf-8'))
    out.append(('em_cn_etf', 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&po=1&np=1'
                '&fltt=2&invt=2&fid=f20&fs=b:MK0021,b:MK0022,b:MK0023,b:MK0024'
                '&fields=f12,f13,f14,f2,f3,f20,f21', 'utf-8'))
    out.append(('sa_spy_holdings', 'https://stockanalysis.com/etf/spy/holdings/', 'utf-8'))
    out.append(('sa_etf_list', 'https://stockanalysis.com/api/screener/e/f?m=aum&s=desc&c=no,s,n,aum&i=etf', 'utf-8'))
    return out


def yahoo_screener(cr, region):
    payload = {'size': 5, 'offset': 0, 'sortField': 'fundnetassets', 'sortType': 'DESC',
               'quoteType': 'ETF', 'topOperator': 'AND',
               'query': {'operator': 'AND', 'operands': [
                   {'operator': 'eq', 'operands': ['region', region]}]},
               'userId': '', 'userIdType': 'guid'}
    url = ('https://query2.finance.yahoo.com/v1/finance/screener?crumb=' + urllib.parse.quote(cr or '')
           + '&lang=en-US&region=US&formatted=false')
    return fetch(url, json.dumps(payload).encode(), {'Content-Type': 'application/json'})


def main():
    os.makedirs(OUT, exist_ok=True)
    cr = crumb()
    print('crumb:', bool(cr))
    summary = {'crumb': bool(cr), 'at': time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()), 'rows': []}
    for tag, url, enc in probes(cr):
        st, body, sec, ctype = fetch(url)
        if enc is None:
            text = '<binary %d bytes, starts %r>' % (len(body), body[:8])
        else:
            text = body.decode(enc, 'replace')
        row = {'tag': tag, 'url': url, 'status': st, 'bytes': len(body), 'sec': sec, 'ctype': ctype}
        summary['rows'].append(row)
        print('%-28s %s %7d  %s' % (tag, st, len(body), url[:90]), flush=True)
        with open(os.path.join(OUT, tag.replace('/', '_') + '.txt'), 'w', encoding='utf-8') as f:
            f.write('%s\nstatus=%s bytes=%d\n\n' % (url, st, len(body)))
            f.write(text[:KEEP])
            if len(text) > KEEP * 2:
                f.write('\n\n...[중략]...\n\n' + text[-1500:])
        time.sleep(0.3)
    for region in ('us', 'hk', 'jp', 'cn', 'kr'):
        st, body, sec, _ = yahoo_screener(cr, region)
        text = body.decode('utf-8', 'replace')
        summary['rows'].append({'tag': 'y_screener_' + region, 'status': st, 'bytes': len(body)})
        print('y_screener_%s %s %d' % (region, st, len(body)), flush=True)
        with open(os.path.join(OUT, 'y_screener_%s.txt' % region), 'w', encoding='utf-8') as f:
            f.write(text[:KEEP * 2])
    with open(os.path.join(OUT, 'summary.json'), 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == '__main__':
    sys.exit(main())
