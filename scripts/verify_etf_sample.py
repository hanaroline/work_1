#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""표본 대조 — 화면에 실린 숫자를 **다른 1차 원천**에 대고 맞춘다 (러너에서).

  · KODEX 200 (069500) · TIGER 200 (102110)  상위 10종목 비중
        화면(네이버) ↔ 한국거래소 ETF 구성종목(PDF) 공시
  · SPY  상위 10종목 비중
        화면(야후) ↔ 운용사 State Street 의 일별 보유 종목 파일
  · SPY  기간 수익률
        화면 엔진(야후 배당 보정 종가로 셈) ↔ 야후가 싣는 모닝스타 총수익률(같은 기준일로 맞춰)

결과는 tools/etf-holdings-discovery/verify_sample.json. 비교는 check 가 아니라 **기록**이다 —
기준일이 서로 하루 이틀 다를 수 있어서, 어긋남을 숨기지 않고 날짜와 함께 적는다.
"""

import io
import json
import os
import re
import sys
import time
import urllib.parse
import zipfile
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_etf_holdings as F

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'etf-holdings-discovery', 'verify_sample.json')
KST = timezone(timedelta(hours=9))


def krx_pdf(isin, day):
    url = 'http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd'
    body = urllib.parse.urlencode({'bld': 'dbms/MDC/STAT/standard/MDCSTAT05001', 'locale': 'ko_KR',
                                   'trdDd': day, 'isuCd': isin, 'share': '1', 'money': '1',
                                   'csvxls_isNo': 'false'}).encode()
    raw = F._req(url, data=body, headers={
        'Referer': 'http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201030108',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest'})
    d = json.loads(raw.decode('utf-8', 'replace'))
    rows = d.get('output') or d.get('OutBlock_1') or []
    return rows, d


def xlsx_rows(blob):
    z = zipfile.ZipFile(io.BytesIO(blob))
    ss = []
    if 'xl/sharedStrings.xml' in z.namelist():
        x = z.read('xl/sharedStrings.xml').decode('utf-8')
        for si in re.findall(r'<si>(.*?)</si>', x, re.S):
            ss.append(''.join(re.findall(r'<t[^>]*>(.*?)</t>', si, re.S)))
    sheet = [n for n in z.namelist() if n.startswith('xl/worksheets/sheet')][0]
    x = z.read(sheet).decode('utf-8')
    rows = []
    for r in re.findall(r'<row[^>]*>(.*?)</row>', x, re.S):
        cells = []
        for attrs, v in re.findall(r'<c([^>]*)>(?:<f>.*?</f>)?(?:<v>(.*?)</v>|<is>.*?</is>)?</c>', r, re.S):
            if 't="s"' in attrs and v:
                cells.append(ss[int(v)])
            else:
                cells.append(v)
        rows.append(cells)
    return rows


def main():
    res = {'at': datetime.now(KST).strftime('%Y-%m-%d %H:%M KST')}
    F.init_crumb()

    # ── 국내: 네이버 ↔ 거래소 PDF
    res['kr'] = []
    for code, isin in (('069500', 'KR7069500007'), ('102110', 'KR7102110004')):
        row = {'code': code}
        try:
            nv = F.parse_naver_analysis(F.get_json('https://m.stock.naver.com/api/stock/%s/etfAnalysis' % code))
            row['naver'] = [(h['n'], h['w']) for h in nv['hold']]
        except Exception as e:                              # noqa: BLE001
            row['naver_err'] = str(e)
        for back in range(0, 6):
            day = (datetime.now(KST) - timedelta(days=back)).strftime('%Y%m%d')
            try:
                rows, raw = krx_pdf(isin, day)
            except Exception as e:                          # noqa: BLE001
                row['krx_err'] = str(e)
                break
            if rows:
                rows = sorted(rows, key=lambda r: -(F.num(r.get('COMPST_RTO')) or 0))
                row['krx_day'] = day
                row['krx'] = [(r.get('COMPST_ISU_NM'), F.num(r.get('COMPST_RTO'))) for r in rows[:12]]
                break
            row['krx_raw_head'] = json.dumps(raw, ensure_ascii=False)[:300]
            time.sleep(0.5)
        res['kr'].append(row)
        print(json.dumps(row, ensure_ascii=False)[:1200], flush=True)

    # ── 미국: 야후 ↔ State Street
    spy = {}
    try:
        y = F.parse_yahoo_summary(F.yq('/v10/finance/quoteSummary/SPY?modules=topHoldings,fundProfile,fundPerformance,price'
                                       '&formatted=false'))
        spy['yahoo'] = [(h['n'], h['s'], h['w']) for h in y['hold']]
    except Exception as e:                                  # noqa: BLE001
        spy['yahoo_err'] = str(e)
    try:
        blob = F._req('https://www.ssga.com/us/en/intermediary/library-content/products/fund-data/etfs/us/'
                      'holdings-daily-us-en-spy.xlsx')
        rows = xlsx_rows(blob)
        spy['ssga_head'] = [r for r in rows[:5]]
        hdr = next(i for i, r in enumerate(rows) if r and 'Weight' in r)
        cols = rows[hdr]
        iname, itk, iw = cols.index('Name'), cols.index('Ticker'), cols.index('Weight')
        hold = [(r[iname], r[itk], F.num(r[iw])) for r in rows[hdr + 1:] if len(r) > iw and F.num(r[iw]) is not None]
        spy['ssga'] = sorted(hold, key=lambda x: -x[2])[:12]
    except Exception as e:                                  # noqa: BLE001
        spy['ssga_err'] = str(e)

    # ── 미국: 수익률 엔진 ↔ 모닝스타 (같은 기준일)
    try:
        fp = ((F.yq('/v10/finance/quoteSummary/SPY?modules=fundPerformance&formatted=false')['quoteSummary']
               ['result'][0])['fundPerformance'])
        tr = fp['trailingReturns']
        as_of = datetime.fromtimestamp(tr['asOfDate'], timezone.utc).strftime('%Y-%m-%d')
        p1 = int((datetime.now(timezone.utc) - timedelta(days=366 * 10 + 30)).timestamp())
        ser, _ = F.parse_yahoo_chart(F.yq('/v8/finance/chart/SPY?period1=%d&period2=%d&interval=1d&events=div,split'
                                          '&includeAdjustedClose=true' % (p1, int(time.time()))))
        mine, at = F.returns_from_series([x for x in ser if x[0] <= as_of])
        ms = {'1m': tr.get('oneMonth'), '3m': tr.get('threeMonth'), 'ytd': tr.get('ytd'), '1y': tr.get('oneYear'),
              '3y': tr.get('threeYear'), '5y': tr.get('fiveYear'), '10y': tr.get('tenYear')}
        spy['returns'] = {'as_of': as_of, 'engine_at': at,
                          'rows': {p: {'engine': mine[p], 'morningstar': None if v is None else round(v * 100, 2),
                                       'diff': None if v is None or mine[p] is None else round(mine[p] - v * 100, 2)}
                                   for p, v in ms.items()}}
    except Exception as e:                                  # noqa: BLE001
        spy['returns_err'] = str(e)
    res['spy'] = spy
    print(json.dumps(spy, ensure_ascii=False)[:3000], flush=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == '__main__':
    sys.exit(main())
