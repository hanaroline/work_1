#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETF 속보기 검산 — 망 없이 돈다. 어긋나면 나가는 값이 1.

  python3 scripts/check_etf_holdings.py            # 자체 시험 + 구워진 etf-holdings.html 검사
  python3 scripts/check_etf_holdings.py --selftest # 자체 시험만

자체 시험
  · 파서가 탐색 때 떠 둔 실제 응답(tools/etf-holdings-discovery/)을 제대로 읽는가
  · 수익률 엔진이 합성 계열에서 누적·연환산을 맞게 내는가, 상장 전 기간을 비우는가
  · 테마 규칙 자체 시험

구워진 파일 검사
  · 바깥 주소를 부르는 태그가 하나도 없는가 (src/href/url()/@import 가 http 로 가는 것)
  · 16MB 를 넘지 않는가
  · 레코드마다: 수익률 칸 10개, 비중은 0~100 또는 비어 있음, 'ok' 면 비중이 하나 이상,
    중국 본토는 구성이 비어 있고 'cn', 「펀드 전체 기준」·거래 정지에는 까닭이 적혀 있는가
  · 받은 수가 목록의 95% 이상인가 (조용히 반쯤 빈 판이 나가지 않게)
  · 한국 수익률 대조(네이버 ↔ 직접 셈)가 0.5%p 안인가
"""

import argparse
import json
import os
import re
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import etf_themes as T
import fetch_etf_holdings as F

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'etf-holdings.html')
DISC = os.path.join(ROOT, 'tools', 'etf-holdings-discovery')
BAD = []


def bad(msg):
    BAD.append(msg)
    print('  ✗', msg)


def good(msg):
    print('  ✓', msg)


def disc(name):
    with open(os.path.join(DISC, name), encoding='utf-8') as f:
        return json.loads(f.read().split('\n', 3)[3])


def selftest():
    print('자체 시험')
    a = F.parse_naver_analysis(disc('nv_etfAnalysis_069500.txt'))
    (good if a['h_status'] == 'ok' and a['hold'][0] == {'k': 'KR:005930', 'n': '삼성전자', 'w': 34.17}
     else bad)('네이버 etfAnalysis — KODEX 200 1위 삼성전자 34.17%')
    (good if a['aum'] == 24_945_000_000_000 else bad)('순자산총액 「24조 9,450억」 → %s' % a['aum'])
    (good if a['ret']['1y'] == 135.09 and a['ret']['10y'] == 17.88 else bad)('기간 수익률 10칸을 옮김')
    b = F.parse_naver_analysis(disc('nv_etfAnalysis_360750.txt'))
    (good if b['h_status'] == 'noweight' and all(h['w'] is None for h in b['hold']) else bad)(
        '비중이 「-」인 ETF 는 noweight — 0 으로 읽지 않음')
    y = F.parse_yahoo_summary(disc('y_qs_2800.HK.txt'))
    (good if y['h_status'] == 'ok' and y['hold'][1]['k'] == 'HK:0700' and y['hold'][3]['k'] == 'HK:0939'
     else bad)('야후 보유 종목 심볼 정규화 (0700.HK·00939 → HK:0700·HK:0939)')
    c = F.parse_yahoo_summary(disc('y_qs_510300.SS.txt'))
    (good if c['h_status'] == 'none' and not c['hold'] else bad)('중국 본토 — 야후도 구성을 안 줌')
    for s, want in [('005930.KS', 'KR:005930'), ('NVDA', 'US:NVDA'), ('BRK.B', 'US:BRK-B'), ('6857.T', 'JP:6857'),
                    ('HSBA.L', 'L:HSBA')]:
        got = F.holding_key_from_yahoo(s, '')
        (good if got == want else bad)('열쇠 %s → %s' % (s, got))
    for n, want in [('KODEX 레버리지', 1), ('KODEX 200선물인버스2X', -1), ('iShares Short Treasury Bond ETF', 0),
                    ('Vanguard Short-Term Bond ETF', 0), ('ProShares UltraShort QQQ', -1), ('SPDR S&P 500 ETF', 0),
                    ('Direxion Daily Semiconductor Bull 3X Shares', 1), ('Direxion Daily Semiconductor Bear 3X Shares', -1)]:
        got = F.leverage_flag(n)[0]
        (good if got == want else bad)('레버리지 판정 %s → %s' % (n, got))
    # 수익률 엔진 — 하루 0.03% 씩 오르는 평일 계열
    ser, d, v = [], date(2015, 1, 1), 100.0
    while d <= date(2026, 9, 28):
        if d.weekday() < 5:
            ser.append((d.isoformat(), v))
            v *= 1.0003
        d += timedelta(days=1)
    r, at = F.returns_from_series(ser)
    (good if at == '2026-09-28' and r['1d'] == 0.03 else bad)('엔진: 기준일과 1일')
    (good if abs(r['10y'] - r['1y']) < 0.05 else bad)('엔진: 10년 연환산 ≈ 1년 누적 (%s vs %s)' % (r['10y'], r['1y']))
    young, _ = F.returns_from_series([x for x in ser if x[0] >= '2025-01-01'])
    (good if young['3y'] is None and young['5y'] is None and young['1y'] is not None else bad)(
        '엔진: 상장 전 기간은 비움 (지어내지 않음)')
    gap = [x for x in ser if not ('2023-06-01' <= x[0] <= '2023-10-15')]
    g, _ = F.returns_from_series(gap)
    (good if g['3y'] is None else bad)('엔진: 기준일 앞 자료가 빠져 있으면 비움')
    (good if F.parse_korean_amount('950억') == 95e9 and F.parse_korean_amount('-') is None else bad)('금액 읽기')
    (good if T._selftest() == 0 else bad)('테마 규칙 자체 시험')


def check_page():
    print('구워진 파일 검사')
    if not os.path.exists(PAGE):
        bad('etf-holdings.html 이 없다')
        return
    size = os.path.getsize(PAGE)
    (good if size < 16e6 else bad)('크기 %.1f MB < 16 MB' % (size / 1e6))
    s = open(PAGE, encoding='utf-8').read()
    m = re.search(r'<script id="etf-data" type="application/json">(.*?)</script>', s, re.S)
    if not m:
        bad('자료 덩이를 못 찾음')
        return
    shell = s[:m.start()] + s[m.end():]
    ext = re.findall(r'''(?:src|href)\s*=\s*["']\s*(?:https?:)?//[^"']+|url\(\s*["']?(?:https?:)?//[^)]+|@import''', shell, re.I)
    (good if not ext else bad)('바깥 주소를 부르는 곳 없음 %s' % ext[:3])
    D = json.loads(m.group(1).replace('<\\/', '</'))
    E, H, M = D['E'], D['H'], D['meta']
    probs = []
    for e in E:
        if len(e['r']) != 10:
            probs.append('%s 수익률 칸 %d' % (e['k'], len(e['r'])))
        for i, w in e['h']:
            if not 0 <= i < len(H):
                probs.append('%s 없는 보유 종목 번호' % e['k'])
            if w is not None and not (-5 <= w <= 100.5):
                probs.append('%s 비중 %s' % (e['k'], w))
        if e['hs'] == 'ok' and not any(w is not None for _, w in e['h']):
            probs.append('%s ok 인데 비중 없음' % e['k'])
        if e['m'] == 'CN' and (e['hs'] != 'cn' or e['h']):
            probs.append('%s 중국 본토인데 구성이 있음' % e['k'])
        if e.get('ab') == 'fund' and not e.get('abw'):
            probs.append('%s 펀드 전체 기준 까닭 없음' % e['k'])
        if e.get('st') == 1 and not e.get('stw'):
            probs.append('%s 거래 정지 까닭 없음' % e['k'])
        if e.get('alt'):
            probs.append('%s 다른 출처로 메운 값 — 화면이 출처를 적는지 확인할 것' % e['k'])
    (good if not probs else bad)('레코드 %d 개 모양 %s' % (len(E), probs[:5]))
    for mk, info in (M.get('markets') or {}).items():
        n, nl = info.get('n') or 0, info.get('n_list') or 0
        (good if nl and n >= 0.95 * nl else bad)('%s 받은 수 %d / 목록 %d' % (mk, n, nl))
    v = M.get('verify_kr') or {}
    if v.get('n'):
        (good if v.get('max_abs_diff') is not None and v['max_abs_diff'] <= 0.5 else bad)(
            '한국 수익률 대조 %d종 — 최대 차이 %s%%p (0.5 이내)' % (v['n'], v.get('max_abs_diff')))
    cov = {}
    for e in E:
        c = cov.setdefault(e['m'], {'n': 0, 'ok': 0, 'noweight': 0, 'ret1y': 0, 'aum': 0, 'fund': 0, 'halt': 0, 'lev': 0})
        c['n'] += 1
        c['ok'] += e['hs'] == 'ok'
        c['noweight'] += e['hs'] == 'noweight'
        c['ret1y'] += e['r'][6] is not None
        c['aum'] += e.get('aumK') is not None
        c['fund'] += e.get('ab') == 'fund'
        c['halt'] += e.get('st') == 1
        c['lev'] += bool(e.get('lv'))
    print('  확보율')
    for mk, c in cov.items():
        print('    %s  %5d개 · 구성(비중) %d · 이름만 %d · 1년 수익률 %d · 규모 %d · 펀드전체 %d · 정지/무거래 %d · 레버리지·인버스 %d'
              % (mk, c['n'], c['ok'], c['noweight'], c['ret1y'], c['aum'], c['fund'], c['halt'], c['lev']))
    return cov


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--selftest', action='store_true')
    a = ap.parse_args()
    selftest()
    if not a.selftest:
        check_page()
    if BAD:
        print('\n실패 %d' % len(BAD))
        return 1
    print('\n모두 통과')
    return 0


if __name__ == '__main__':
    sys.exit(main())
