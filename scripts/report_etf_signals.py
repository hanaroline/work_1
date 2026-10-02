#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETF 신호판을 사람이 읽는 꼴로 펴 낸다.

숫자를 새로 만들지 않는다 — signals.json / overlap.json 에 있는 것만 줄을 세우고
묶어 보인다. **여기서 셈을 하나라도 하면 화면과 글이 다른 값을 낼 자리가 생긴다.**

  python3 scripts/report_etf_signals.py             # 전부
  python3 scripts/report_etf_signals.py --top 15    # 위아래 열다섯씩
"""

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIG = os.path.join(ROOT, 'data', 'etf', 'signals.json')
OVL = os.path.join(ROOT, 'data', 'etf', 'overlap.json')

BAND_KO = {'strong_buy': '적극 매수', 'buy': '매수', 'neutral': '중립',
           'sell': '매도', 'strong_sell': '적극 매도'}


def band(it):
    h = (it.get('horizons') or {}).get('20') or (it.get('horizons') or {}).get(20) or {}
    p = h.get('plan') or {}
    return p.get('band_label') or BAND_KO.get(p.get('band') or '', '—')


def score(it, h=20):
    hs = it.get('horizons') or {}
    hv = hs.get(str(h)) or hs.get(h) or {}
    return hv.get('score')


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--top', type=int, default=0)
    ap.add_argument('--signals', default=SIG)
    ap.add_argument('--overlap', default=OVL)
    a = ap.parse_args(argv)

    sg = json.load(open(a.signals, encoding='utf-8'))
    full = [x for x in sg['items'] if x['tier'] == 'full']
    part = [x for x in sg['items'] if x['tier'] == 'partial']
    short = [x for x in sg['items'] if x['tier'] == 'short']

    print('산출 %s · 가격 %s · 엔진 %s'
          % (sg['generated_at_kst'], sg.get('prices_generated_at_kst'),
             sg.get('engine_hash')))
    print('온전 %d · 부분 %d · 짧음 %d · 못받음 %d'
          % (len(full), len(part), len(short), len(sg.get('missing') or [])))
    print()

    rows = sorted([x for x in full if score(x) is not None],
                  key=lambda x: -score(x))
    show = rows if not a.top else rows[:a.top] + [None] + rows[-a.top:]
    print('%-4s %-9s %-34s %7s %7s %6s %6s %6s %6s %5s %s'
          % ('#', '티커', '이름', '20일', '자기%', '추세', '모멘', '수급', '매물', '확신', '신호대'))
    for i, it in enumerate(show):
        if it is None:
            print('  …')
            continue
        ax = it.get('axes') or {}
        h = (it.get('horizons') or {}).get('20') or {}
        print('%-4d %-9s %-34s %7.1f %7s %6s %6s %6s %6s %5s %s'
              % (it['no'], it['ticker'], it['name'][:34], score(it),
                 _f(h.get('self_pct')), _f(ax.get('trend')), _f(ax.get('momentum')),
                 _f(ax.get('flow')), _f(ax.get('supply')), _f(it.get('conf')),
                 band(it)))
    print()

    if part:
        print('── 부분 등급 (축만, 신호대 없음) ' + '─' * 30)
        for it in sorted(part, key=lambda x: x['no']):
            ax = it.get('axes') or {}
            print('%-4d %-9s %-34s 세션%4d  추세 %s · 모멘 %s · 매물 %s'
                  % (it['no'], it['ticker'], it['name'][:34], it['sessions'],
                     _f(ax.get('trend')), _f(ax.get('momentum')), _f(ax.get('supply'))))
        print()
    if short:
        print('── 짧음 등급 (점수 없음) ' + '─' * 38)
        for it in sorted(short, key=lambda x: x['no']):
            print('%-4d %-9s %-34s 세션%4d  상장 %s'
                  % (it['no'], it['ticker'], it['name'][:34], it['sessions'],
                     it.get('listed_from')))
        print()
    for m in sg.get('missing') or []:
        print('못받음 — %s %s: %s' % (m['ticker'], m['name'], m.get('reason')))

    if os.path.exists(a.overlap):
        ov = json.load(open(a.overlap, encoding='utf-8'))
        print()
        print('── 겹침: %d 종목이 사실상 %d 덩이 (ρ≥%.2f) %s'
              % (sum(c['n'] for c in ov['clusters']), ov['cluster_count'],
                 ov['cluster_cut'], '─' * 12))
        for c in ov['clusters']:
            if c['n'] < 2:
                continue
            print('  [%d] %s' % (c['n'], ' / '.join(m['name'] for m in c['members'])))
        for h in ov.get('hedge') or []:
            print('  환헤지 %s — %s ρ%.3f · %s ρ%.3f (차 %+.3f, 주간 %d관측)'
                  % (h['what'], h['plain_name'], h['rho_plain'],
                     h['hedged_name'], h['rho_hedged'], h['gap'], h['obs']))
    return 0


def _f(x):
    return '—' if x is None else ('%.0f' % x if abs(x) >= 10 else '%.1f' % x)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
