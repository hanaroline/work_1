# -*- coding: utf-8 -*-
"""승률을 높일 수 있는가 — 청산 규칙을 훑어 답한다.

「승률 높은 전략을 만들어 달라」는 말은 자주 나온다. 이 대본은 그 물음에
**의견이 아니라 자료로** 답한다.

## 무엇을 하는가

**진입은 건드리지 않는다.** 합의 K=2 가 내는 자리를 그대로 쓰고 익절·손절만
바꿔 가며 잰다. 그래야 승률이 오르내리는 까닭이 오롯이 청산 규칙임이 분명해진다.
진입까지 함께 흔들면 무엇 때문에 달라졌는지 말할 수 없다.

**검증구간에서만 잰다.** 학습구간은 합의 멤버를 고르는 데 이미 썼다.

## 무엇을 보게 되는가

승률은 **쉽게 올라간다.** 익절을 +1% 로 좁히고 손절을 −20% 로 넓히면 국내ETF
에서 승률이 90% 를 넘는다. 그런데 같은 칸에서 이길 때는 +1% 를 벌고 질 때는
−8% 를 잃는다 — **한 번 지면 여덟 번 이긴 것이 날아간다.**

이건 고장이 아니라 **맞바꿈**이다. 승률과 한 번의 크기는 같이 올릴 수 없다.
익절을 좁히면 이기는 횟수가 늘고 한 번의 크기가 줄며, 손절을 넓히면 지는 횟수가
줄고 한 번의 손실이 커진다. 어느 쪽을 택하든 **기대값은 그 맞바꿈 뒤에 남는
것**이고, 그게 이 표의 마지막 두 칸이다.

## 왜 여기서 고른 값을 실전에 넣지 않는가

서른여섯 칸을 재고 그 중 가장 좋은 것을 고르면 **그건 자료에 맞춰 깎은 것**이다.
이 저장소가 매매 신호 절에 적어 둔 것과 같은 함정이다 — 「여러 번 시험한 것을
보정하면 유의한 조합이 하나도 없습니다」. 이 대본은 **맞바꿈의 모양을 보여 주는
도구**이지 설정을 고르는 도구가 아니다. 실전 규칙은 원본 프리셋의 것을 쓴다.

쓰는 법
  python3 scripts/kis_timing_exit_sweep.py                 # 국내ETF
  python3 scripts/kis_timing_exit_sweep.py --market KR_STOCK
  python3 scripts/kis_timing_exit_sweep.py --k 3
"""

import argparse
import os
import statistics as st
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kis_strategy_lib as K
import kis_timing_data as D
import kis_timing_backtest as B

TAKE_PROFITS = [1, 2, 3, 5, 10, None]
STOP_LOSSES = [2, 3, 5, 8, 12, 20]
MIN_TRADES = B.MIN_TRADES


def span_years(cut, rows):
    last = max(it['bars'][-1]['d'] for it in rows)
    d0 = date(*map(int, cut.split('-')))
    d1 = date(*map(int, last.split('-')))
    return (d1 - d0).days / 365.25, last


def measure(rows, acts, spans, tp, sl, cost, warm, yrs):
    trades = []
    for i, it in enumerate(rows):
        lo, hi = spans[i]
        trades += [t for t in B.simulate(it['bars'], acts[i], sl, tp, cost, lo, hi)
                   if not t['open']]
    if len(trades) < MIN_TRADES:
        return None
    rets = [t['ret'] for t in trades]
    held = [t['held'] for t in trades]
    wins = [r for r in rets if r > 0]
    losses = [r for r in rets if r <= 0]
    hold_med = max(1, int(round(st.median(held))))
    base = B.baseline([it['bars'] for it in rows], hold_med, cost, warm, spans)
    edge = st.mean(rets) - base['avg']
    per_yr = len(trades) / len(rows) / yrs
    return {
        'tp': tp, 'sl': sl, 'trades': len(trades),
        'win_rate': sum(1 for r in rets if r > 0) / len(rets) * 100.0,
        'avg': st.mean(rets),
        'avg_win': st.mean(wins) if wins else 0.0,
        'avg_loss': st.mean(losses) if losses else 0.0,
        'worst': min(rets),
        # **한 번 지면 몇 번 이긴 것이 날아가는가.** 승률만 보면 안 보이는 수다.
        'lose_costs': (abs(st.mean(losses)) / st.mean(wins)) if (wins and losses) else None,
        'base': base['avg'], 'edge': edge,
        'edge_per_year': edge * per_yr, 'trades_per_year': per_yr,
        'hold_median': hold_med,
    }


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--market', default='KR_ETF', choices=list(D.MARKETS))
    ap.add_argument('--k', type=int, default=2)
    a = ap.parse_args(argv)

    bt_path = os.path.join(D.ROOT, 'data', 'kis_timing', 'backtest.json')
    if not os.path.exists(bt_path):
        raise SystemExit('성적표가 없습니다 — 먼저 kis_timing_backtest.py 를 돌리십시오')
    import json
    members = (json.load(open(bt_path, encoding='utf-8'))
               .get('picked_live') or {}).get(a.market) or []
    if len(members) < a.k:
        raise SystemExit('%s 의 합의 멤버가 %d 종뿐이라 K=%d 를 잴 수 없습니다'
                         % (a.market, len(members), a.k))

    uni, _ = D.load_universe()
    rows = uni[a.market]
    cost = B.COST_BPS[a.market]
    _, test, cut = B.split_spans(rows)
    warm = max(K.BY_ID[s]['warmup'] for s in members)
    acts = {i: B.consensus_actions(it['bars'], members, a.k) for i, it in enumerate(rows)}
    yrs, last = span_years(cut, rows)

    print('%s · 합의 K=%d (%s)' % (D.MARKETS[a.market]['label'], a.k,
                                   ' + '.join(K.BY_ID[s]['name'] for s in members)))
    print('검증구간 %s ~ %s (%.2f 해 · %d 종목) · 왕복비용 %dbp'
          % (cut, last, yrs, len(rows), cost))
    print('**진입은 그대로 두고 청산 규칙만 바꾼 것입니다.**\n')

    out = []
    for sl in STOP_LOSSES:
        for tp in TAKE_PROFITS:
            r = measure(rows, acts, test, tp, sl, cost, warm, yrs)
            if r:
                out.append(r)
    out.sort(key=lambda r: -r['win_rate'])

    print('%-22s %6s %7s %9s %9s %9s %8s %10s %12s' % (
        '청산 규칙', '거래', '승률', '이길 때', '질 때', '최악',
        '한 번 짐', '초과/거래', '초과/해·종목'))
    for r in out:
        label = ('익절 +%s%% / 손절 −%s%%' % (r['tp'], r['sl']) if r['tp']
                 else '익절 없음 / 손절 −%s%%' % r['sl'])
        print('%-22s %6d %6.1f%% %+8.2f%% %+8.2f%% %+8.2f%% %7s %+9.2f%%p %+11.1f%%p' % (
            label, r['trades'], r['win_rate'], r['avg_win'], r['avg_loss'], r['worst'],
            ('%.1f번' % r['lose_costs']) if r['lose_costs'] else '—',
            r['edge'], r['edge_per_year']))

    best_wr = out[0]
    best_edge = max(out, key=lambda r: r['edge_per_year'])
    print()
    print('승률이 가장 높은 칸 : %s → 승률 %.1f%% · 초과 %+.1f%%p/해'
          % (('익절 +%s%% / 손절 −%s%%' % (best_wr['tp'], best_wr['sl'])
              if best_wr['tp'] else '익절 없음 / 손절 −%s%%' % best_wr['sl']),
             best_wr['win_rate'], best_wr['edge_per_year']))
    print('돈이 가장 되는 칸  : %s → 승률 %.1f%% · 초과 %+.1f%%p/해'
          % (('익절 +%s%% / 손절 −%s%%' % (best_edge['tp'], best_edge['sl'])
              if best_edge['tp'] else '익절 없음 / 손절 −%s%%' % best_edge['sl']),
             best_edge['win_rate'], best_edge['edge_per_year']))
    print()
    print('**이 표에서 고른 값을 실전에 넣지 마십시오.** %d 칸을 재고 가장 좋은 것을'
          % len(out))
    print('고르면 그건 자료에 맞춰 깎은 것입니다. 이 표는 맞바꿈의 모양을 보여 줄 뿐입니다.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
