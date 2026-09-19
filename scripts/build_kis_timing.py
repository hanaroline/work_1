# -*- coding: utf-8 -*-
"""오늘의 매매 세팅 — **어떤 종목을 얼마에 사고, 어디서 자르고, 언제 파는가.**

`data/kis_timing/latest.json` 한 장에 담는다. 화면은 이것만 읽는다 — 화면이
지표를 다시 셈하면 백테스트와 다른 값을 낼 자리가 생긴다.

## 무엇을 싣는가

    합의 매수   백테스트를 통과한 전략 K개 이상이 **같은 날 같은 종목**에 BUY
    합의 청산   같은 전략들이 K개 이상 SELL — 들고 있다면 내려놓을 자리
    전략별 신호 10종 각각이 오늘 무엇을 가리키는지 (성적이 나쁜 것도 그대로 싣는다)

**성적이 나쁜 전략의 신호도 싣는 까닭.** 빼 버리면 화면이 「한투 전략빌더 10종」이
아니라 「내가 고른 5종」이 된다. 대신 **성적표를 신호 옆에 붙여** 어느 것이
검증을 통과했는지 한눈에 보이게 한다. 고르는 일은 읽는 사람이 한다.

## 가격은 무엇을 적는가

신호는 **종가로 확정**되고 매수는 **다음 거래일 시가**에 일어난다. 그러니 오늘
화면에 찍히는 손절가·목표가는 「신호일 종가를 진입가로 가정한」 값이다. 실제
체결가는 다음 날 시가라서 달라진다 — **화면에 그렇게 적는다.** 적지 않으면
읽는 사람이 이 숫자를 지정가로 착각한다.
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kis_strategy_lib as K
import kis_timing_data as D
import kis_timing_backtest as B

ROOT = D.ROOT
KST = timezone(timedelta(hours=9))
OUT_DIR = os.path.join(ROOT, 'data', 'kis_timing')
BACKTEST = os.path.join(OUT_DIR, 'backtest.json')

# 합의 문턱. 백테스트에서 K=2 가 네 시장 모두 거래수와 초과수익을 함께 갖춘
# 유일한 자리였다. K=1 은 초과수익이 얇고 K=3 은 시장에 따라 거래가 열 몇 건까지
# 줄어 성적을 말할 수 없다.
K_LIVE = 2

# 마지막 봉이 시장 최신일보다 이만큼 뒤처지면 「묵은 자료」로 표시한다.
STALE_BARS = 3

# 원본 전략빌더에는 **비중 규칙이 없다.** 아래는 이 저장소가 덧붙인 것이고,
# 산출물에 그렇게 적는다. 계좌의 1% 를 한 번의 손절에 거는 흔한 규율이다.
RISK_PER_TRADE = 1.0


def _fmt(px):
    if px is None:
        return None
    return round(px, 2 if px < 1000 else 0)


def plan(it, mk, members, acts_all, grade):
    """한 종목의 오늘 자리. 신호가 없으면 None."""
    bars = it['bars']
    i = len(bars) - 1
    buys = [s for s in members if acts_all[s][i] == 'BUY']
    sells = [s for s in members if acts_all[s][i] == 'SELL']
    other_buy = [s['id'] for s in K.STRATEGIES
                 if s['id'] not in members and acts_all[s['id']][i] == 'BUY']
    other_sell = [s['id'] for s in K.STRATEGIES
                  if s['id'] not in members and acts_all[s['id']][i] == 'SELL']
    if not (buys or sells or other_buy or other_sell):
        return None

    close = bars[i]['c']
    stop = close * (1 - B.CONSENSUS_STOP / 100.0)
    # 세 단계로 나눈다. K개가 모인 날은 드물어서(종목·날 기준 1~2%) 합의만 실으면
    # 대부분의 날에 화면이 빈다. 한 전략만 켜진 자리는 **관찰**로 따로 둔다 —
    # 빼지도 않고, 합의와 같은 칸에 섞지도 않는다.
    if len(buys) >= K_LIVE and len(buys) >= len(sells):
        side = 'BUY'
    elif len(sells) >= K_LIVE:
        side = 'SELL'
    elif buys and not sells:
        side = 'WATCH_BUY'
    elif sells and not buys:
        side = 'WATCH_SELL'
    else:
        side = None
    hold = side in ('BUY', 'WATCH_BUY')

    return {
        'symbol': it['symbol'], 'code': it['code'], 'name': it['name'],
        'market': mk, 'asof': bars[i]['d'],
        'close': _fmt(close),
        'change_pct': round((bars[i]['c'] / bars[i - 1]['c'] - 1) * 100, 2) if i else None,
        'buy_hits': buys, 'sell_hits': sells,
        'other_buy': other_buy, 'other_sell': other_sell,
        'side': side,
        # 손절가는 **신호일 종가를 진입가로 가정한** 값이다. 실제 진입은 다음
        # 거래일 시가이므로 체결 뒤 그 가격으로 다시 잡아야 한다.
        'stop_ref': _fmt(stop) if hold else None,
        'stop_pct': B.CONSENSUS_STOP if hold else None,
        'weight_hint': (round(RISK_PER_TRADE / B.CONSENSUS_STOP * 100, 1)
                        if side == 'BUY' else None),
        'grade': grade,
    }


def main():
    if not os.path.exists(BACKTEST):
        raise SystemExit('%s 가 없습니다 — 먼저 scripts/kis_timing_backtest.py 를 돌리십시오'
                         % os.path.relpath(BACKTEST, ROOT))
    bt = json.load(open(BACKTEST, encoding='utf-8'))
    uni, meta = D.load_universe()

    cons = {}
    for c in bt['consensus']:
        cons[(c['market'], c['k'], c.get('scope'))] = c
    grades = {(g['market'], g['strategy']): g for g in bt['grades']}

    out = {
        'generated_at_kst': datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S'),
        'source': bt['source'],
        'rule': {
            'k': K_LIVE,
            'entry': '신호 다음 거래일 시가',
            'stop_loss_pct': B.CONSENSUS_STOP,
            'exit': '합의 청산(K개 이상 SELL) · 손절 %s%% · 최장 %d 거래일'
                    % (B.CONSENSUS_STOP, B.MAX_HOLD),
            'member_rule': '학습·검증 두 구간 모두 초과수익이 양수인 전략만',
            'price_note': '화면의 손절가는 신호일 종가를 진입가로 가정한 값입니다. '
                          '실제 진입은 다음 거래일 시가이므로 체결 뒤 다시 잡으십시오.',
            'weight_note': '비중 힌트는 원본 전략빌더에 없는 것으로, 1회 손절에 '
                           '계좌의 %s%% 를 거는 규율에서 나온 값입니다.' % RISK_PER_TRADE,
        },
        'backtest_assumptions': bt['assumptions'],
        'strategies': bt['strategies'],
        'markets': {}, 'data_notes': meta,
    }

    for mk in D.MARKET_ORDER:
        rows = uni.get(mk) or []
        if not rows:
            continue
        members = bt['picked_live'].get(mk) or []
        g_full = cons.get((mk, K_LIVE, 'full'))
        g_test = cons.get((mk, K_LIVE, 'test'))
        latest = max(it['bars'][-1]['d'] for it in rows)
        # **하루 뒤처진 것을 묵은 자료라 부르지 않는다.** 해외ETF 우주에는 도쿄·홍콩·
        # 시드니 상장분이 섞여 있어 미국 상장분보다 늘 하루 앞선 날짜를 갖는다.
        # 그걸 결손으로 찍으면 정상인 종목 열다섯 개에 경고가 붙는다. 시장 전체의
        # 거래일을 세어 STALE_BARS 일 넘게 뒤처진 것만 표시한다.
        market_days = sorted({b['d'] for it in rows for b in it['bars'][-STALE_BARS - 2:]})

        plans, stale = [], []
        for it in rows:
            acts_all = K.all_actions(it['bars'])
            p = plan(it, mk, members, acts_all,
                     {'trades': (g_full or {}).get('trades'),
                      'win_rate': (g_full or {}).get('win_rate'),
                      'avg': (g_full or {}).get('avg'),
                      'edge': (g_full or {}).get('edge')})
            if p is None:
                continue
            behind = sum(1 for d in market_days if d > p['asof'])
            if behind > STALE_BARS:
                p['stale'] = behind
                stale.append({'symbol': it['symbol'], 'name': it['name'],
                              'asof': p['asof'], 'behind': behind})
            plans.append(p)

        def _pick(side, key):
            return sorted([p for p in plans if p['side'] == side],
                          key=lambda p: (-len(p[key]), p['name']))

        buys, sells = _pick('BUY', 'buy_hits'), _pick('SELL', 'sell_hits')
        watch_buy, watch_sell = _pick('WATCH_BUY', 'buy_hits'), _pick('WATCH_SELL', 'sell_hits')

        by_strategy = {}
        for s in K.STRATEGIES:
            sid = s['id']
            b = [p['symbol'] for p in plans if sid in p['buy_hits'] or sid in p['other_buy']]
            sl = [p['symbol'] for p in plans if sid in p['sell_hits'] or sid in p['other_sell']]
            g = grades.get((mk, sid))
            by_strategy[sid] = {
                'buy': b, 'sell': sl,
                'member': sid in members,
                'grade': ({'trades': g.get('trades'), 'win_rate': g.get('win_rate'),
                           'avg': g.get('avg'), 'edge': g.get('edge'),
                           'train_edge': (g.get('train') or {}).get('edge'),
                           'test_edge': (g.get('test') or {}).get('edge')} if g else None),
            }

        out['markets'][mk] = {
            'label': D.MARKETS[mk]['label'], 'kind': D.MARKETS[mk]['kind'],
            'currency': D.MARKETS[mk]['currency'],
            'count': len(rows), 'asof': latest,
            'universe': bt['universe'].get(mk),
            'members': members,
            'member_names': [K.BY_ID[m]['name'] for m in members],
            'consensus_full': g_full, 'consensus_test': g_test,
            'buy': buys, 'sell': sells,
            'watch_buy': watch_buy, 'watch_sell': watch_sell,
            'by_strategy': by_strategy,
            'stale': stale,
            'names': {it['symbol']: it['name'] for it in rows},
        }

        sys.stderr.write('%-9s 합의매수 %2d · 합의청산 %2d · 관찰매수 %3d · 관찰청산 %3d\n'
                         % (D.MARKETS[mk]['label'], len(buys), len(sells),
                            len(watch_buy), len(watch_sell)))

    # 돌파 실패는 매도 전용이라 합의에 들어가지 않는다. 신호와 **성적**을 따로 싣는다.
    out['sell_only'] = bt['sell_only']

    os.makedirs(OUT_DIR, exist_ok=True)
    p = os.path.join(OUT_DIR, 'latest.json')
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    sys.stderr.write('%s 에 적었습니다\n' % os.path.relpath(p, ROOT))


if __name__ == '__main__':
    main()
