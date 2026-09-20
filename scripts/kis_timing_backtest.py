# -*- coding: utf-8 -*-
"""전략 10종을 네 시장에 대고 재 본다 — **먹히는 자리만 추천으로 올리기 위해서다.**

「골든크로스로 사세요」는 누구나 할 수 있는 말이다. 이 대본이 하는 일은 그 말에
숫자를 붙이는 것이다 — 국내주식 100종목 2년치에서 골든크로스가 **몇 번 켜졌고,
그 중 몇 번이 돈이 됐고, 아무 날에나 사서 같은 기간 들고 있은 것보다 나았는가.**

마지막 절이 요점이다. **대조군 없는 승률은 아무 말도 아니다.** 상승장에서는
아무 날에나 사도 55% 가 이긴다. 승률 55% 전략은 그 장에서 0을 번 것이다.
그래서 전략마다 **같은 시장·같은 보유기간의 무작위 진입**을 나란히 재고,
둘의 차이(초과수익)로 순위를 매긴다.

## 매매를 어떻게 흉내내는가

    신호(종가)  →  **다음 거래일 시가**에 산다
                   신호가 뜬 날 종가에 사는 것으로 치면 그날 종가를 미리 아는
                   셈이 된다. 장 끝나고 신호를 보고 다음 날 사는 것이 실제다.
    보유 중     →  매 봉에서 손절·익절을 **장중 고저**로 본다
                   저가가 손절선을 찍으면 거기서 잘린다. 같은 봉에서 익절선도
                   닿았다면 **손절 쪽을 택한다** — 어느 쪽이 먼저였는지 일봉으로는
                   알 수 없고, 모를 때 유리한 쪽을 고르면 성적이 부풀기 때문이다.
                   시가가 이미 선을 넘겨 열렸으면 그 시가로 잘린다(갭).
    청산 신호   →  **다음 거래일 시가**에 판다. 매수와 같은 규칙이다.
    안 끝나면   →  120 거래일에서 끊는다. 「청산 조건이 영영 안 와서 3년을 들고
                   있었다」는 성적은 전략의 성적이 아니다.

비용은 왕복 한 번으로 친다(아래 COST_BPS). **가정이고, 실제 세율·수수료와 다를
수 있다.** 그래서 산출물에는 비용 전(gross)과 비용 후(net)를 함께 싣는다.
"""

import json
import os
import statistics as st
import sys
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kis_strategy_lib as K
import kis_timing_data as D

ROOT = D.ROOT
KST = timezone(timedelta(hours=9))
OUT_DIR = os.path.join(ROOT, 'data', 'kis_timing')

# 왕복 거래비용(bp). **가정이다.** 매매세·수수료·호가 슬리피지를 뭉뚱그린 값이고
# 실제 계좌의 것과 다르다. 고치려면 여기만 고치면 백테스트와 화면이 함께 바뀐다.
# 국내상장 해외ETF 는 국내 ETF 와 같은 문으로 사고 판다(증권거래세 없음,
# 국내 위탁수수료). 그래서 KR_ETF 와 같은 값을 쓴다.
COST_BPS = {'KR_STOCK': 25, 'US_STOCK': 15, 'KR_ETF': 10, 'KR_OV_ETF': 10, 'OV_ETF': 15}

# 청산 조건이 오지 않아도 여기서 끊는다.
MAX_HOLD = 120

# 이보다 거래가 적으면 성적을 **내지 않는다**. 12번 중 8번 이겼다는 말은
# 승률 67% 가 아니라 표본이 없다는 말이다.
MIN_TRADES = 30

# 매도 전용 전략(돌파 실패)은 이 시계로 앞을 본다.
SELL_HORIZONS = [5, 10, 20]


def _pct(a, b):
    return (b / a - 1.0) * 100.0


def simulate(bars, acts, stop_loss, take_profit, cost_bps, lo=0, hi=None):
    """한 종목·한 전략의 매매를 돌린다. 체결된 거래 목록을 낸다.

    `lo`/`hi` 는 **진입을 받는 구간**이다. 학습구간에서 고른 전략을 검증구간에서
    다시 재기 위해 나눈다. 지표는 봉 전체로 셈한다 — 검증구간 첫날의 60일선이
    없으면 그건 전략의 성적이 아니라 자료의 사정이 된다.
    """
    trades = []
    n = len(bars)
    hi = n if hi is None else min(hi, n)
    i = max(lo, 0)
    while i < hi - 1:
        if acts[i] != 'BUY':
            i += 1
            continue
        e = i + 1                       # 진입 봉 — 신호 다음 거래일
        entry = bars[e]['o']
        if not entry:
            i += 1
            continue
        stop = entry * (1 - stop_loss / 100.0) if stop_loss else None
        targ = entry * (1 + take_profit / 100.0) if take_profit else None

        exit_px = exit_i = None
        why = None
        j = e
        while j < n:
            b = bars[j]
            # 갭으로 이미 선을 넘겨 열렸으면 시가가 체결가다.
            if stop is not None and b['o'] <= stop:
                exit_px, exit_i, why = b['o'], j, '손절(갭)'
                break
            if targ is not None and b['o'] >= targ:
                exit_px, exit_i, why = b['o'], j, '익절(갭)'
                break
            # 같은 봉에서 둘 다 닿으면 손절 쪽을 택한다 — 유리한 쪽을 고르지 않는다.
            if stop is not None and b['l'] <= stop:
                exit_px, exit_i, why = stop, j, '손절'
                break
            if targ is not None and b['h'] >= targ:
                exit_px, exit_i, why = targ, j, '익절'
                break
            if acts[j] == 'SELL' and j > e and j + 1 < n:
                exit_px, exit_i, why = bars[j + 1]['o'], j + 1, '청산신호'
                break
            if j - e + 1 >= MAX_HOLD:
                exit_px, exit_i, why = b['c'], j, '기간만료'
                break
            j += 1

        if exit_px is None:             # 자료 끝까지 안 끝난 거래 — 성적에 넣지 않는다
            trades.append({'open': True, 'entry_d': bars[e]['d'], 'entry': entry,
                           'mark': bars[n - 1]['c'], 'held': n - 1 - e,
                           'ret': _pct(entry, bars[n - 1]['c']) - cost_bps / 100.0})
            break

        gross = _pct(entry, exit_px)
        trades.append({'open': False, 'entry_d': bars[e]['d'], 'exit_d': bars[exit_i]['d'],
                       'entry': entry, 'exit': exit_px, 'held': exit_i - e,
                       'why': why, 'gross': gross, 'ret': gross - cost_bps / 100.0})
        i = exit_i                      # 청산한 봉부터 다시 신호를 본다
    return trades


def baseline(universe_bars, hold, cost_bps, warmup, spans=None):
    """대조군 — **아무 날에나 사서 hold 거래일 뒤에 판다.**

    전략과 같은 문으로 사고 판다(시가 진입·시가 청산, 같은 비용). 다른 것은
    「언제」뿐이다. 그래서 둘의 차이는 오롯이 타이밍의 값이 된다.

    `spans` 를 주면 전략과 **같은 구간**에서만 잰다. 학습구간의 전략 성적을
    검증구간의 대조군과 견주면 두 시장을 비교한 셈이 되어 아무 말도 아니게 된다.
    """
    rs = []
    for k, bars in enumerate(universe_bars):
        n = len(bars)
        lo, hi = (spans[k] if spans else (warmup + 1, n))
        for e in range(max(lo, warmup + 1), min(hi, n - hold)):
            a, b = bars[e]['o'], bars[e + hold]['o']
            if a and b:
                rs.append(_pct(a, b) - cost_bps / 100.0)
    if not rs:
        return None
    return {'n': len(rs), 'avg': st.mean(rs), 'median': st.median(rs),
            'win_rate': sum(1 for r in rs if r > 0) / len(rs) * 100.0, 'hold': hold}


def forward_returns(universe, sid, horizons, cost_bps):
    """매도 전용 전략의 성적 — **신호 뒤에 정말 떨어졌는가.**

    사는 전략이 아니므로 「얼마 벌었나」를 물을 수 없다. 대신 신호가 뜬 뒤
    5·10·20 거래일의 수익률을 재고, 같은 시장의 아무 날과 견준다. 그 자리에서
    들고 있었으면 잃었을 돈이 곧 이 신호의 값이다. (음수여야 쓸모가 있다.)
    """
    warm = K.BY_ID[sid]['warmup']
    hits = {h: [] for h in horizons}
    fired = 0
    for it in universe:
        bars = it['bars']
        acts = K.actions(bars, sid)
        n = len(bars)
        for i in range(warm, n - 1):
            if acts[i] != 'SELL':
                continue
            fired += 1
            for h in horizons:
                if i + 1 + h < n:
                    a, b = bars[i + 1]['o'], bars[i + 1 + h]['o']
                    if a and b:
                        hits[h].append(_pct(a, b))
    out = {'fired': fired, 'horizons': {}}
    ub = [it['bars'] for it in universe]
    for h in horizons:
        rs = hits[h]
        base = baseline(ub, h, 0.0, warm)      # 비용 없이 — 방향만 본다
        out['horizons'][str(h)] = {
            'n': len(rs),
            'avg': round(st.mean(rs), 3) if rs else None,
            'median': round(st.median(rs), 3) if rs else None,
            'down_rate': round(sum(1 for r in rs if r < 0) / len(rs) * 100.0, 1) if rs else None,
            'base_avg': round(base['avg'], 3) if base else None,
            'edge': round(st.mean(rs) - base['avg'], 3) if (rs and base) else None,
        }
    return out


def _stats(market, label, name, category, trades, universe, spans, cost_bps, warmup,
           per_symbol=None):
    """거래 목록 → 성적표. 전략이든 합의든 **같은 잣대로 잰다.**"""
    if not trades:
        return {'market': market, 'strategy': label, 'name': name, 'trades': 0,
                'usable': False, 'why': '신호가 한 번도 켜지지 않았습니다'}

    rets = [t['ret'] for t in trades]
    gross = [t['gross'] for t in trades]
    held = [t['held'] for t in trades]
    wins = [r for r in rets if r > 0]
    losses = [r for r in rets if r <= 0]
    hold_med = max(1, int(round(st.median(held))))
    base = baseline([it['bars'] for it in universe], hold_med, cost_bps, warmup, spans)

    why_counts = {}
    for t in trades:
        why_counts[t['why']] = why_counts.get(t['why'], 0) + 1

    avg = st.mean(rets)
    edge = (avg - base['avg']) if base else None
    return {
        'market': market, 'strategy': label, 'name': name, 'category': category,
        'trades': len(trades),
        'symbols_fired': len(per_symbol or {}),
        'win_rate': round(sum(1 for r in rets if r > 0) / len(rets) * 100.0, 1),
        'avg': round(avg, 2),
        'avg_gross': round(st.mean(gross), 2),
        'median': round(st.median(rets), 2),
        'best': round(max(rets), 2), 'worst': round(min(rets), 2),
        'avg_win': round(st.mean(wins), 2) if wins else None,
        'avg_loss': round(st.mean(losses), 2) if losses else None,
        'profit_factor': (round(sum(wins) / abs(sum(losses)), 2)
                          if losses and sum(losses) else None),
        'hold_avg': round(st.mean(held), 1), 'hold_median': hold_med,
        'exit_mix': why_counts,
        'base': ({'avg': round(base['avg'], 2), 'win_rate': round(base['win_rate'], 1),
                  'n': base['n'], 'hold': base['hold']} if base else None),
        'edge': round(edge, 2) if edge is not None else None,
        'usable': bool(len(trades) >= MIN_TRADES and edge is not None and edge > 0),
        'per_symbol': per_symbol or {},
    }


def grade(market, sid, universe, cost_bps, spans=None):
    """한 시장·한 전략의 성적표. `spans` 가 있으면 그 구간의 진입만 센다."""
    s = K.BY_ID[sid]
    trades, per_symbol = [], {}
    for k, it in enumerate(universe):
        lo, hi = (spans[k] if spans else (0, None))
        tr = simulate(it['bars'], K.actions(it['bars'], sid),
                      s['risk']['stop_loss'], s['risk']['take_profit'], cost_bps, lo, hi)
        closed = [t for t in tr if not t['open']]
        trades.extend(closed)
        if closed:
            per_symbol[it['symbol']] = {
                'n': len(closed),
                'avg': round(st.mean([t['ret'] for t in closed]), 2),
                'win': round(sum(1 for t in closed if t['ret'] > 0) / len(closed) * 100.0, 1),
            }
    return _stats(market, sid, s['name'], s['category'], trades, universe, spans,
                  cost_bps, s['warmup'], per_symbol)


# ─────────────────────────────────────────────────────────────────────
# 합의 — **이 저장소가 내놓는 전략은 이것이다**
# ─────────────────────────────────────────────────────────────────────
#
# 10종 중 하나를 골라 쓰는 것은 「전략빌더를 썼다」이지 「전략을 만들었다」가
# 아니다. 여기서 만드는 것은 그 위의 한 겹이다.
#
#   ① 학습구간에서 **초과수익이 양수인 전략만** 남긴다 (시장마다 다르게 남는다)
#   ② 남은 전략 중 **K개 이상이 같은 날 BUY** 하면 산다
#   ③ 손절 5%(프리셋 최빈값) / K개 이상 SELL 하면 판다 / 120 거래일 만료
#
# **왜 합의인가.** 10종은 서로 다른 것을 본다 — 추세(골든크로스·추세필터),
# 되돌림(이격도·평균회귀), 돌파(52주·변동성). 서로 다른 잣대가 같은 날 같은
# 종목을 가리키면 그건 한 잣대의 우연이 아닐 공산이 크다. 그 짐작이 맞는지는
# 검증구간이 답한다 — K=1·2·3 을 나란히 재서 **정말 나아지는지** 본다.
#
# **왜 학습/검증을 나누는가.** 안 나누면 「초과수익 양수인 전략만 골랐다」가
# 곧 「이미 이긴 것만 골랐다」가 된다. 그렇게 고른 조합의 성적은 미래에 대해
# 아무 말도 하지 않는다.

CONSENSUS_STOP = 5.0
CONSENSUS_K = [1, 2, 3]


def consensus_actions(bars, sids, k):
    """K개 이상이 같은 날 BUY 면 'BUY', K개 이상이 SELL 이면 'SELL'."""
    per = {sid: K.actions(bars, sid) for sid in sids}
    out = [None] * len(bars)
    for i in range(len(bars)):
        b = sum(1 for sid in sids if per[sid][i] == 'BUY')
        s = sum(1 for sid in sids if per[sid][i] == 'SELL')
        if b >= k and b >= s:
            out[i] = 'BUY'
        elif s >= k:
            out[i] = 'SELL'
    return out


def grade_consensus(market, universe, sids, k, cost_bps, spans=None, scope='test'):
    warm = max(K.BY_ID[s]['warmup'] for s in sids)
    trades, per_symbol = [], {}
    for idx, it in enumerate(universe):
        lo, hi = (spans[idx] if spans else (0, None))
        acts = consensus_actions(it['bars'], sids, k)
        tr = simulate(it['bars'], acts, CONSENSUS_STOP, None, cost_bps, lo, hi)
        closed = [t for t in tr if not t['open']]
        trades.extend(closed)
        if closed:
            per_symbol[it['symbol']] = {'n': len(closed),
                                        'avg': round(st.mean([t['ret'] for t in closed]), 2)}
    g = _stats(market, 'consensus_k%d' % k, '합의 K=%d' % k, '조합', trades,
               universe, spans, cost_bps, warm, per_symbol)
    g['members'] = sids
    g['k'] = k
    g['scope'] = scope
    return g


TRAIN_FRACTION = 0.6


def split_spans(rows):
    """시장 전체 거래일의 60% 지점에서 자른다. (학습 구간, 검증 구간, 자른 날)

    종목마다 이력 길이가 달라 **날짜로 자른다.** 봉 개수로 자르면 2000봉짜리
    ETF 와 400봉짜리 주식이 서로 다른 해를 검증구간으로 갖게 되고, 그러면
    「검증구간 성적」이 종목마다 다른 장세를 잰 것이 되어 합칠 수 없다.
    """
    dates = sorted({b['d'] for it in rows for b in it['bars']})
    cut = dates[int(len(dates) * TRAIN_FRACTION)]
    train, test = [], []
    for it in rows:
        ds = [b['d'] for b in it['bars']]
        m = len(ds)
        c = next((i for i, d in enumerate(ds) if d >= cut), m)
        train.append((0, c))
        test.append((c, m))
    return train, test, cut


def run(limit_market=None):
    uni, meta = D.load_universe()
    out = {
        'generated_at_kst': datetime.now(KST).strftime('%Y-%m-%d %H:%M:%S'),
        'source': '한국투자증권 전략빌더 기본 전략 10종 (github.com/koreainvestment/open-trading-api)',
        'assumptions': {
            '진입': '신호 다음 거래일 시가',
            '청산': '청산 신호 다음 거래일 시가 / 손절·익절은 장중 고저 / 최장 %d 거래일' % MAX_HOLD,
            '같은봉 손절익절': '손절 우선 (유리한 쪽을 고르지 않는다)',
            '왕복비용_bp': COST_BPS,
            '비용주의': '왕복비용은 가정입니다. 실제 매매세·수수료·슬리피지와 다를 수 있습니다.',
            '최소거래수': MIN_TRADES,
            '대조군': '같은 시장·같은 구간·같은 보유일수의 무작위 진입(모든 종목·모든 날)',
            '학습검증': '시장별 거래일의 앞 %d%% 로 전략을 고르고, 뒤 %d%% 로 다시 잽니다'
                        % (TRAIN_FRACTION * 100, (1 - TRAIN_FRACTION) * 100),
            '합의손절': '%s%%' % CONSENSUS_STOP,
        },
        'universe': {}, 'data_notes': meta,
        'strategies': K.spec_json(),
        'grades': [], 'sell_only': [], 'consensus': [],
        # picked      — 학습구간만 보고 고른 것. 검증구간 성적이 이것의 성적표다.
        # picked_live — **오늘 내는 신호는 이쪽을 쓴다.** 학습·검증 **두 구간 모두**
        #               초과수익이 양수인 것만 남긴다. 「한 구간에서 크게 이겼다」는
        #               자주 우연이지만 「두 장세에서 모두 이겼다」는 덜 그렇다.
        #               전 구간 초과수익만 보면 한쪽에서 크게 번 것이 반대쪽의
        #               손실을 덮어 버려, 무너진 전략이 목록에 남는다.
        'picked': {}, 'picked_live': {},
    }

    for mk in D.MARKET_ORDER:
        if limit_market and mk != limit_market:
            continue
        rows = uni[mk]
        if not rows:
            continue
        train, test, cut = split_spans(rows)
        out['universe'][mk] = {
            'label': D.MARKETS[mk]['label'], 'count': len(rows),
            'from': min(it['bars'][0]['d'] for it in rows),
            'to': max(it['bars'][-1]['d'] for it in rows),
            'bars_min': min(len(it['bars']) for it in rows),
            'bars_max': max(len(it['bars']) for it in rows),
            'split_at': cut,
        }
        cost = COST_BPS[mk]
        sys.stderr.write('\n[%s] %d 종목 · 학습 ~%s · 검증 %s~\n'
                         % (D.MARKETS[mk]['label'], len(rows), cut, cut))

        picked, picked_live = [], []
        for s in K.STRATEGIES:
            if s['id'] in K.SELL_ONLY:
                r = forward_returns(rows, s['id'], SELL_HORIZONS, cost)
                r.update({'market': mk, 'strategy': s['id'], 'name': s['name'],
                          'category': s['category']})
                out['sell_only'].append(r)
                continue
            gt = grade(mk, s['id'], rows, cost, train)
            gv = grade(mk, s['id'], rows, cost, test)
            g = grade(mk, s['id'], rows, cost)          # 전 구간 — 화면에 쓰는 성적
            g['train'] = {k: gt.get(k) for k in ('trades', 'win_rate', 'avg', 'edge', 'usable')}
            g['test'] = {k: gv.get(k) for k in ('trades', 'win_rate', 'avg', 'edge', 'usable')}
            out['grades'].append(g)
            if gt.get('usable'):
                picked.append(s['id'])
            if (g.get('usable') and (gt.get('edge') or 0) > 0 and (gv.get('edge') or 0) > 0):
                picked_live.append(s['id'])
            sys.stderr.write('  %-14s 전구간 거래%5s 승률%5s 평균%6s 초과%6s │ 학습 초과%6s │ 검증 초과%6s %s\n' % (
                s['id'], g.get('trades'), g.get('win_rate'), g.get('avg'), g.get('edge'),
                gt.get('edge'), gv.get('edge'), '★' if gt.get('usable') else ''))

        out['picked'][mk] = picked
        out['picked_live'][mk] = picked_live
        if picked:
            for k in CONSENSUS_K:
                if k > len(picked):
                    break
                c = grade_consensus(mk, rows, picked, k, cost, test, 'test')
                out['consensus'].append(c)
                sys.stderr.write('  합의 K=%d 검증 │ 거래%5s 승률%5s 평균%6s 초과%6s  (%s)\n' % (
                    k, c.get('trades'), c.get('win_rate'), c.get('avg'), c.get('edge'),
                    '+'.join(picked)))
        for k in CONSENSUS_K:
            if k > len(picked_live):
                break
            c = grade_consensus(mk, rows, picked_live, k, cost, None, 'full')
            out['consensus'].append(c)
            sys.stderr.write('  합의 K=%d 전구간│ 거래%5s 승률%5s 평균%6s 초과%6s  (%s)\n' % (
                k, c.get('trades'), c.get('win_rate'), c.get('avg'), c.get('edge'),
                '+'.join(picked_live)))
    return out


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    doc = run()
    p = os.path.join(OUT_DIR, 'backtest.json')
    # 성적표도 시각 말고 달라진 것이 없으면 그대로 둔다. 이 대본은 단추로만
    # 도니 날마다 쌓이지는 않지만, 봉이 안 자란 날 눌러도 171KB 가 통째로 새로
    # 쌓이는 것은 세팅 쪽과 똑같은 고장이다.
    if D.write_if_changed(p, doc):
        sys.stderr.write('\n%s 에 적었습니다 (%d 성적표)\n'
                         % (os.path.relpath(p, ROOT), len(doc['grades'])))
    else:
        sys.stderr.write('\n%s — 시각 말고 달라진 것이 없어 그대로 둡니다 (%d 성적표)\n'
                         % (os.path.relpath(p, ROOT), len(doc['grades'])))


if __name__ == '__main__':
    main()
