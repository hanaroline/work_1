#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""**분배금이 신호를 얼마나 밀어내렸는가** — 배당 보정 일봉으로 다시 셈해 견준다.

왜 재는가
──────────────────────────────────────────────────────────────────────
이 도구의 지표는 **가격**만 본다. 그런데 ETF 는 분배금을 떼면서 그만큼 가격이
내려간다. 총수익이 그대로여도 가격 차트는 계단처럼 깎여 내려가고, 추세·모멘텀
축은 그것을 **하락 추세로 읽는다.**

첫 판에서 미국 국채 ETF 두 종목이 76 종목 가운데 꼴찌였다(SHY −68.8, IEF −57.2).
분배가 잦고 가격 변동이 작은 종목일수록 이 몫이 크게 먹힌다 — 연 3.6%p 의 드리프트는
S&P500 에게는 잔물결이지만 연 변동이 1% 대인 단기국채에게는 추세 그 자체다.

그래서 **짐작하지 않고 다시 셈한다.** 야후가 배당 보정 종가(adjclose)를 함께 주므로,
날마다 보정비(adjclose/close)를 시·고·저에 똑같이 곱해 보정 봉을 만들고 같은 엔진에
먹인다. 두 점수의 차이가 곧 분배금이 밀어낸 몫이다.

**국내 55종은 이렇게 잴 수 없다** — 네이버가 보정 계열을 주지 않는다. 못 재는 것을
0 으로 적지 않는다. 다만 국내 채권형·배당형에도 같은 일이 일어나고 있다는 것은
해외분의 결과로 미루어 알 수 있고, 그 사실을 적어 둔다.

  python3 scripts/etf_adjusted_check.py
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_signals as BS
import build_etf_signals as BE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRICES = os.path.join(ROOT, 'data', 'etf', 'prices.json')
SIGNALS = os.path.join(ROOT, 'data', 'etf', 'signals.json')
OUT = os.path.join(ROOT, 'data', 'etf', 'adjusted.json')


def adjusted_bars(rec):
    """보정비를 시·고·저·종에 **똑같이** 곱한다.

    종가만 바꾸면 종가가 고저 범위를 벗어난 봉이 생기고 ATR·스토캐스틱·매물대가
    전부 어그러진다. 하루 안의 비율 관계는 그대로 두고 수준만 옮긴다 — 보정 일봉을
    만드는 정석이다.
    """
    b, adj = rec['bars'], rec.get('adjclose')
    if not adj or len(adj) != len(b['d']):
        return None
    out = []
    for i in range(len(b['d'])):
        c, a = b['c'][i], adj[i]
        if not c or not a or c <= 0:
            return None
        f = a / c
        out.append({'d': b['d'][i], 'o': b['o'][i] * f, 'h': b['h'][i] * f,
                    'l': b['l'][i] * f, 'c': a, 'v': b['v'][i] or 0})
    return out


def score20(it):
    hs = (it or {}).get('horizons') or {}
    return (hs.get('20') or hs.get(20) or {}).get('score')


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--prices', default=PRICES)
    ap.add_argument('--signals', default=SIGNALS)
    ap.add_argument('--out', default=OUT)
    a = ap.parse_args(argv)

    px = json.load(open(a.prices, encoding='utf-8'))
    sg = json.load(open(a.signals, encoding='utf-8'))
    base = {x['ticker']: x for x in sg['items']}

    rows, skipped = [], []
    for tk, rec in sorted(px['items'].items()):
        it = base.get(tk)
        if not it or it.get('tier') != 'full':
            continue
        bars = adjusted_bars(rec)
        if not bars:
            skipped.append(tk)
            continue
        r = BS.one(bars, None, rec['name'], tk, rec['scope'])
        s0, s1 = score20(it), score20(r)
        if s0 is None or s1 is None:
            skipped.append(tk)
            continue
        ax0, ax1 = it.get('axes') or {}, r.get('axes') or {}
        d = rec.get('adjclose')
        rows.append({
            'ticker': tk, 'name': rec['name'], 'group': rec['group'],
            'score_price': round(s0, 1), 'score_adjusted': round(s1, 1),
            'shift': round(s1 - s0, 1),
            'trend_price': ax0.get('trend'), 'trend_adjusted': ax1.get('trend'),
            'band_price': ((it.get('horizons') or {}).get('20') or {}).get('plan', {}).get('band_label'),
            'band_adjusted': ((r.get('horizons') or {}).get(20) or {}).get('plan', {}).get('band_label'),
            'drag_1y': (it.get('distribution') or {}).get('drag_1y'),
        })

    rows.sort(key=lambda r: -r['shift'])
    flips = [r for r in rows if r['band_price'] != r['band_adjusted']]
    doc = {
        'generated_from': px.get('generated_at_kst'),
        'method': ('야후 배당 보정 종가(adjclose)로 보정비를 만들어 시·고·저·종에 똑같이 '
                   '곱한 뒤 같은 엔진에 먹였습니다. 두 점수의 차이가 분배금이 밀어낸 '
                   '몫입니다.'),
        'coverage': {'measured': len(rows), 'skipped': len(skipped),
                     'note': ('국내 55종은 네이버가 보정 계열을 주지 않아 잴 수 없습니다. '
                              '**못 잰 것을 0 으로 적지 않았습니다** — 국내 채권형·배당형 '
                              'ETF 에도 같은 일이 일어나고 있을 것이나 그 크기는 여기서 '
                              '재지 못했습니다.')},
        'summary': {
            'shift_max': rows[0]['shift'] if rows else None,
            'shift_max_ticker': rows[0]['ticker'] if rows else None,
            'band_flips': len(flips),
            'over_10': sum(1 for r in rows if r['shift'] >= 10),
        },
        'rows': rows,
    }
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(doc, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False)

    print('%-6s %-34s %8s %8s %8s %s' %
          ('티커', '이름', '가격', '보정', '차이', '신호대 (가격 → 보정)'))
    for r in rows:
        print('%-6s %-34s %8.1f %8.1f %+8.1f %s'
              % (r['ticker'], r['name'][:34], r['score_price'], r['score_adjusted'],
                 r['shift'],
                 ('%s → %s' % (r['band_price'], r['band_adjusted']))
                 if r['band_price'] != r['band_adjusted'] else ''))
    print()
    print('잰 것 %d · 못 잰 것 %d (국내는 보정 계열이 없습니다)' % (len(rows), len(skipped)))
    print('신호대가 바뀐 종목 %d' % len(flips))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
