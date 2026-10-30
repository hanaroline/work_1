#!/usr/bin/env python3
"""해외 반도체 소부장 맵 — 야후 시세 정찰(러너에서 한 번 돌리고 지운다).

후보 심볼마다 v7 quote 의 이름·거래소·통화와 지표 칸(시총·PER·PBR·EPS·BPS·배당·52주·
첫 거래일)이 오는지, v8 일봉 1년 치가 오는지 본다. 표준 라이브러리만 쓴다.
"""
import json, os, sys, time, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_us100 as F

SYMS = {
 'us': 'AMAT LRCX KLAC TER ENTG MKSI AEIS ICHR UCTT ACLS VECO PLAB Q ACMR ONTO APD KLIC ASYS FORM COHU AEHR AMKR SNPS CDNS PDFS RMBS ARTR AIP CEVA INTT NVMI CAMT NDSN CVV',
 'jp': '8035.T 6525.T 7735.T 6590.T 6728.T 6361.T 6383.T 6323.T 6890.T 6856.T 6370.T 6368.T 4063.T 3436.T 5384.T 4186.T 7731.T 7751.T 7741.T 7912.T 6951.T 6925.T 6920.T 4004.T 4109.T 4047.T 4091.T 4401.T 4369.T 4021.T 6146.T 7729.T 6315.T 4062.T 2802.T 4203.T 4626.T 3110.T 6857.T 6871.T 6855.T 6526.T 4901.T 429A.T',
 'cn': '688409.SS 300666.SZ 688596.SS 603690.SS 300260.SZ 688126.SS 605358.SS 688120.SS 688019.SS 300054.SZ 002371.SZ 688729.SS 600641.SS 688072.SS 688012.SS 688147.SS 688037.SS 300346.SZ 603650.SS 688138.SS 688082.SS 688361.SS 300567.SZ 688268.SS 002409.SZ 688106.SS 002916.SZ 002436.SZ 300604.SZ 688200.SS 600584.SS 002156.SZ 002185.SZ 301269.SZ 688521.SS 688206.SS 600206.SS 300236.SZ',
}
FIELDS = ['longName', 'shortName', 'exchange', 'fullExchangeName', 'currency', 'quoteType', 'marketState',
          'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent', 'regularMarketTime',
          'marketCap', 'trailingPE', 'forwardPE', 'priceToBook', 'epsTrailingTwelveMonths', 'bookValue',
          'dividendYield', 'trailingAnnualDividendYield', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow',
          'firstTradeDateMilliseconds', 'sharesOutstanding', 'exchangeTimezoneName']

def main():
    F.init_crumb()
    out = {}
    for mk, s in SYMS.items():
        syms = s.split()
        for i in range(0, len(syms), 40):
            part = syms[i:i + 40]
            path = ('/v7/finance/quote?symbols=' + ','.join(urllib.parse.quote(x) for x in part) +
                    '&crumb=' + urllib.parse.quote(F.CRUMB or ''))
            try:
                j = F.yget(path)
                for r in (j.get('quoteResponse') or {}).get('result') or []:
                    out[r['symbol']] = {k: r.get(k) for k in FIELDS}
            except Exception as e:
                print('quote 실패', mk, i, e)
            time.sleep(1)
        miss = [x for x in syms if x not in out]
        print('\n== %s: quote %d/%d, 빈 심볼 %s' % (mk, len(syms) - len(miss), len(syms), miss))
        for x in syms:
            r = out.get(x)
            if not r:
                continue
            have = [k for k in FIELDS[7:] if r.get(k) is not None]
            print('%-10s | %-45s | %s %s | 없음: %s' % (x, (r['longName'] or r['shortName'] or '')[:45], r['exchange'], r['currency'],
                  ','.join(k for k in FIELDS[7:] if r.get(k) is None)))
    # 일봉 표본
    for x in ['AMAT', '8035.T', '002371.SZ', '688012.SS']:
        try:
            o, meta, _, _ = F.fetch_chart(x, '1y', '1d')
            print('chart', x, len(o['d']), o['d'][0], o['d'][-1], o['c'][-1], meta.get('currency'))
        except Exception as e:
            print('chart 실패', x, e)
        time.sleep(0.5)
    print('\n표본 원문 AMAT:', json.dumps(out.get('AMAT'), ensure_ascii=False))
    print('표본 원문 8035.T:', json.dumps(out.get('8035.T'), ensure_ascii=False))
    print('표본 원문 002371.SZ:', json.dumps(out.get('002371.SZ'), ensure_ascii=False))

main()
