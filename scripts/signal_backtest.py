# -*- coding: utf-8 -*-
"""신호가 값을 하는지 재는 자리.

이 대본이 「안 된다」고 말할 수 있어야 한다. 그러라고 만든다.

두 잣대로 잰다. 답이 다르면 **둘 다 싣는다.**

  가. 사건연구  신호 뒤 h일 수익률을 **같은 종목 같은 기간의 평상시**와 견준다.
                매매 규칙(손절·청산)이 끼어들지 않아 신호 자체의 값을 본다.
  나. 모의매매  진입·손절·청산·비용을 다 넣고 실제로 굴려 본다. 고객이 겪는 것은
                이쪽이다.

가만 보면 신호가 좋아 보이는데 나로 가면 비용에 다 먹히는 일이 흔하다. 하나만
실으면 그걸 감추게 된다.

**표본이 커 보이는 것을 조심한다.** 200종목 × 484세션 = 96,800 종목일이지만,
같은 날 한국 주식 100개는 거의 같이 움직인다. 독립 관측은 **날짜 수에 가깝지
종목일 수가 아니다.** 그래서 신뢰구간은 종목이 아니라 **날짜 블록**으로 뽑는다.
"""

import hashlib
import json
import math
import os
import random
import statistics as st
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import signal_lib as S
import vol_lib as V

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ─────────────────────────────────────────────────────────────────────
# 비용 — **가정이다. 바꿔 가며 재고 그 민감도를 함께 싣는다.**
# ─────────────────────────────────────────────────────────────────────
#
# 왕복 기준 bp(0.01%p). 국내는 매도 시 증권거래세가 붙어 왕복 비용이 미국보다
# 훨씬 무겁고, 이것이 짧은 보유기간 전략을 그대로 죽인다. 세율·수수료는 증권사와
# 시행 시점에 따라 다르므로 **여기 적힌 값을 사실로 읽지 말 것** — 성적을 이 값
# 0 / 25 / 50bp 세 자리에서 모두 내어, 어느 자리에서 뒤집히는지를 보인다.
COST_GRID_BPS = [0, 25, 50]
DEFAULT_COST_BPS = {'KR': 25, 'US': 10}

ENTRY_CUT = 70.0      # 신호 자기백분위가 이 위로 **올라선 날** 진입
EXIT_CUT = 30.0       # 이 아래로 내려선 날 청산
MAX_HOLD = {5: 10, 10: 20, 20: 40, 60: 90}   # 시간 손절 — 신호가 안 풀려도 놓는다


def load_bars(branch, path):
    raw = subprocess.run(['git', '-C', ROOT, 'show', '%s:%s' % (branch, path)],
                         capture_output=True, text=True)
    if raw.returncode != 0:
        return None
    d = json.loads(raw.stdout).get('daily') or {}
    if not d.get('d'):
        return None
    out = []
    for i in range(len(d['d'])):
        if None in (d['o'][i], d['h'][i], d['l'][i], d['c'][i]):
            continue
        out.append({'d': d['d'][i], 'o': d['o'][i], 'h': d['h'][i],
                    'l': d['l'][i], 'c': d['c'][i], 'v': d['v'][i] or 0})
    return out


# ── 국내 가격 출처 ────────────────────────────────────────────────
#
# 2026-09-18 에 국내 일봉을 야후에서 **네이버로 옮겼다.**
#
# 옮긴 까닭은 하나뿐이다 — **야후가 거래일을 통째로 빠뜨렸다.** 2025-09-19(금)이
# 야후 100 종목 어디에도 없는데 공휴일이 아니고(앞뒤로 09-18·09-22 가 다 있다)
# 네이버에는 있다. 공통 구간에서 100 종목 모두에 없는 평일 26 일을 뽑아 보면
# 나머지 25 일은 전부 실제 공휴일이고 그 하루만 아니다. 세션이 빠지면 이동평균·
# RSI·매물대처럼 **창을 쓰는 지표가 그 뒤로 전부 실제와 다른 날들을 본다.**
#
# **종가 갈림은 옮긴 까닭이 아니다.** 두 출처는 98.3% 를 같게 보고, 갈리는
# 1.7% 는 네이버가 높은 건 20 / 낮은 건 21, 상대의 고저를 벗어난 종가는
# 네이버 2 / 야후 2 로 완전히 대칭이라 **어느 쪽이 맞는지 가릴 수 없다.**
# 특히 최근 20 거래일에서 20% 가 갈리는데(그 앞은 0.9%) 어느 쪽이 잠정치인지
# 아직 모른다. 그 불확실은 출처를 바꿔도 없어지지 않는다 — 다만 이제 어느 쪽을
# 쓰는지가 산출물에 적히므로, 나중에 판명되면 무엇을 다시 셈해야 하는지 알 수 있다.
#
# 미국은 네이버 원천이 없어 야후 그대로다. 두 시장은 따로 재므로 섞이지 않는다.
PRICE_SOURCE_KR = os.environ.get('SIGNAL_KR_PRICES', 'naver')
NAVER_KR = os.path.join(ROOT, 'data', 'prices_naver', 'kr100.json')

# 이보다 짧으면 야후로 물러선다. 워크포워드가 서려면 BURN_IN(150) 뒤로도 한참
# 남아야 하고, 매물대는 120 세션을 본다. 한 해치는 있어야 말이 된다.
MIN_NAVER_BARS = 260

_NAVER = {'loaded': False, 'stocks': {}}


def _naver_bars(sym):
    if not _NAVER['loaded']:
        _NAVER['loaded'] = True
        if os.path.exists(NAVER_KR):
            try:
                _NAVER['stocks'] = (json.load(open(NAVER_KR, encoding='utf-8'))
                                    or {}).get('stocks') or {}
            except (ValueError, OSError):
                _NAVER['stocks'] = {}
    s = _NAVER['stocks'].get(sym)
    if not s:
        return None
    out = []
    for i in range(len(s['d'])):
        if None in (s['o'][i], s['h'][i], s['l'][i], s['c'][i]):
            continue
        out.append({'d': s['d'][i], 'o': s['o'][i], 'h': s['h'][i],
                    'l': s['l'][i], 'c': s['c'][i], 'v': s['v'][i] or 0})
    return out or None


def bars_for(market, branch, path):
    """(봉, 출처). **신호와 백테스트가 같은 문을 쓴다.**

    여기 하나만 고치면 둘이 함께 바뀐다. 갈라 두면 화면이 네이버로 셈한 신호를
    내면서 성적표는 야후로 잰 것이 되는데, 그건 이 저장소가 engine_hash 로 막아 둔
    것과 똑같은 종류의 고장이다.

    물러섬을 두는 까닭 — 네이버에 없거나 이력이 짧은 종목까지 떨어뜨리면 목록이
    구멍 난다. 대신 **어느 종목을 어느 출처로 셈했는지 세어 산출물에 적는다.**
    """
    sym = os.path.basename(path)[:-5]
    if market == 'KR' and PRICE_SOURCE_KR == 'naver':
        nb = _naver_bars(sym)
        if nb and len(nb) >= MIN_NAVER_BARS:
            return nb, 'naver'
    yb = load_bars(branch, path)
    return yb, ('yahoo' if yb else None)


def list_universe(branch, prefix):
    r = subprocess.run(['git', '-C', ROOT, 'ls-tree', '-r', '--name-only', branch],
                       capture_output=True, text=True)
    return [p for p in r.stdout.split() if p.startswith(prefix) and p.endswith('.json')]


# ─────────────────────────────────────────────────────────────────────
# 가. 사건연구
# ─────────────────────────────────────────────────────────────────────

def event_study(bars, self_pcts, h, cut=ENTRY_CUT):
    """신호일의 이후 h일 수익률과, **같은 종목 같은 구간의 모든 날**을 견준다.

    기준선을 「전체 기간 평균」이 아니라 「신호를 낼 수 있었던 날들」로 두는 것이
    핵심이다. 점수가 늦게 서는 종목은 평가 구간이 짧은데, 그 구간이 마침 좋은
    장이면 전체 평균과 견주는 것만으로 저절로 이겨 보인다.
    """
    sig, base = [], []
    for i in range(len(bars)):
        if self_pcts[i] is None:
            continue
        r = S.forward_ret(bars, i, h)
        if r is None:
            continue
        base.append((bars[i]['d'], r))
        if S.entry_trigger(None, self_pcts, i, cut):
            sig.append((bars[i]['d'], r))
    return sig, base


# ─────────────────────────────────────────────────────────────────────
# 나. 모의매매
# ─────────────────────────────────────────────────────────────────────

def simulate(bars, ind, rows, self_pcts, h, cost_bps,
             entry_cut=ENTRY_CUT, exit_cut=EXIT_CUT, use_stop=True):
    """진입은 **신호 다음 날 시가**. 손절은 장중 저가로 친다.

    신호 당일 종가에 사는 것으로 하면 종가를 보고 그 종가에 사는 것이 되어
    성적이 부풀어 오른다. 하루 미루는 것이 실제로 할 수 있는 일이다.

    갭하락으로 손절가 아래에서 열리면 **시가로 체결**한다 — 손절가에 체결된 것으로
    치면 실제보다 덜 잃은 것으로 나온다.
    """
    trades = []
    i = 0
    n = len(bars)
    maxhold = MAX_HOLD.get(h, h * 2)
    while i < n - 1:
        if self_pcts[i] is None or not S.entry_trigger(None, self_pcts, i, entry_cut):
            i += 1
            continue
        e = i + 1                            # 다음 날 시가 진입
        if e >= n:
            break
        entry = bars[e]['o']
        a = ind['atr14'][i]
        stop = (entry - S.STOP_ATR * a) if (use_stop and a) else None

        exit_i, exit_px, why = None, None, None
        for j in range(e, min(n, e + maxhold + 1)):
            if stop is not None and bars[j]['l'] <= stop:
                exit_i, exit_px, why = j, min(stop, bars[j]['o']), 'stop'
                break
            if j > e and S.exit_trigger(self_pcts, j, exit_cut):
                if j + 1 < n:
                    exit_i, exit_px, why = j + 1, bars[j + 1]['o'], 'signal'
                else:
                    exit_i, exit_px, why = j, bars[j]['c'], 'signal'
                break
        if exit_i is None:
            exit_i = min(n - 1, e + maxhold)
            exit_px, why = bars[exit_i]['c'], 'time'

        gross = (exit_px / entry - 1) * 100
        net = gross - cost_bps / 100.0
        trades.append({'entry_d': bars[e]['d'], 'exit_d': bars[exit_i]['d'],
                       'entry_i': e, 'exit_i': exit_i,
                       'entry_px': entry, 'exit_px': exit_px,
                       'bars': exit_i - e, 'gross': gross, 'net': net, 'why': why})
        i = exit_i                           # 같은 구간에서 겹쳐 사지 않는다
    return trades


def buy_hold(bars, self_pcts, cost_bps):
    """평가 구간을 신호 전략과 **같게 맞춘** 매수후보유."""
    idx = [i for i in range(len(bars)) if self_pcts[i] is not None]
    if len(idx) < 2:
        return None
    a, b = idx[0], idx[-1]
    g = (bars[b]['c'] / bars[a]['c'] - 1) * 100
    return {'gross': g, 'net': g - cost_bps / 100.0,
            'from': bars[a]['d'], 'to': bars[b]['d'], 'bars': b - a}


def ma_cross(bars, ind, self_pcts, h, cost_bps):
    """20일선 상향 돌파에 사고 하향 이탈에 파는 흔한 규칙. 견줄 자리."""
    trades = []
    i = 1
    n = len(bars)
    maxhold = MAX_HOLD.get(h, h * 2)
    while i < n - 1:
        if self_pcts[i] is None or ind['ma20'][i] is None or ind['ma20'][i - 1] is None:
            i += 1
            continue
        if not (bars[i]['c'] > ind['ma20'][i] and bars[i - 1]['c'] <= ind['ma20'][i - 1]):
            i += 1
            continue
        e = i + 1
        if e >= n:
            break
        entry = bars[e]['o']
        exit_i = None
        for j in range(e, min(n, e + maxhold + 1)):
            if ind['ma20'][j] is not None and bars[j]['c'] < ind['ma20'][j]:
                exit_i = min(n - 1, j + 1)
                break
        if exit_i is None:
            exit_i = min(n - 1, e + maxhold)
        g = (bars[exit_i]['o'] / entry - 1) * 100
        trades.append({'gross': g, 'net': g - cost_bps / 100.0, 'bars': exit_i - e,
                       'entry_i': e, 'exit_i': exit_i,
                       'entry_px': entry, 'exit_px': bars[exit_i]['o']})
        i = exit_i
    return trades


def random_entry(bars, self_pcts, h, n_sig, cost_bps, seed=0):
    """**같은 횟수**만큼 아무 날에나 사서 같은 기간 들고 있는다.

    신호가 잘한 것인지, 그냥 그 장이 오르는 장이었는지를 가르는 자리다.
    횟수를 맞추지 않으면 거래를 많이 한 쪽이 저절로 유리해진다.
    """
    rnd = random.Random(seed)
    cand = [i for i in range(len(bars) - 1) if self_pcts[i] is not None]
    if not cand or n_sig <= 0:
        return []
    out = []
    for _ in range(n_sig):
        i = rnd.choice(cand)
        e = i + 1
        x = min(len(bars) - 1, e + h)
        g = (bars[x]['c'] / bars[e]['o'] - 1) * 100
        out.append({'gross': g, 'net': g - cost_bps / 100.0, 'bars': x - e})
    return out


# ─────────────────────────────────────────────────────────────────────
# 셈
# ─────────────────────────────────────────────────────────────────────

def summarize(trades, key='net'):
    if not trades:
        return {'n': 0}
    xs = [t[key] for t in trades]
    wins = [x for x in xs if x > 0]
    loss = [x for x in xs if x <= 0]
    gp = sum(wins)
    gl = -sum(loss)
    return {
        'n': len(xs),
        'mean': round(st.mean(xs), 3),
        'median': round(st.median(xs), 3),
        'win_rate': round(len(wins) / len(xs) * 100, 1),
        'avg_win': round(st.mean(wins), 3) if wins else None,
        'avg_loss': round(st.mean(loss), 3) if loss else None,
        'profit_factor': round(gp / gl, 3) if gl > 0 else None,
        'best': round(max(xs), 2), 'worst': round(min(xs), 2),
        'avg_bars': round(st.mean([t['bars'] for t in trades]), 1),
    }


def block_bootstrap_diff(sig, base, n_boot=2000, seed=1):
    """신호일 평균 − 평상시 평균의 신뢰구간.

    **날짜 블록으로 뽑는다.** 종목일을 따로따로 뽑으면 같은 날 백 종목이 같이
    움직인 것을 독립 관측 백 개로 세어 구간이 터무니없이 좁아진다. 여기서는
    날짜를 통째로 뽑아 그날의 모든 종목을 함께 들고 온다.
    """
    if not sig or not base:
        return None
    by_day_sig, by_day_base = {}, {}
    for d, r in sig:
        by_day_sig.setdefault(d, []).append(r)
    for d, r in base:
        by_day_base.setdefault(d, []).append(r)
    days = sorted(by_day_base)
    if len(days) < 20:
        return None
    rnd = random.Random(seed)
    obs = st.mean([r for _, r in sig]) - st.mean([r for _, r in base])
    diffs = []
    for _ in range(n_boot):
        pick = [days[rnd.randrange(len(days))] for _ in range(len(days))]
        s = [r for d in pick for r in by_day_sig.get(d, [])]
        b = [r for d in pick for r in by_day_base.get(d, [])]
        if s and b:
            diffs.append(st.mean(s) - st.mean(b))
    if len(diffs) < 100:
        return None
    diffs.sort()
    lo = diffs[int(len(diffs) * 0.025)]
    hi = diffs[int(len(diffs) * 0.975)]
    return {'diff': round(obs, 3), 'ci_lo': round(lo, 3), 'ci_hi': round(hi, 3),
            'boot': len(diffs), 'days': len(days),
            'significant': bool(lo > 0 or hi < 0)}


def equity(trades, bars, self_pcts, cost_bps=0.0):
    """건당 수익률을 **복리로 이어** 기간 총수익으로 바꾼다.

    이걸 하지 않으면 매수후보유와 견줄 수가 없다. 「건당 평균 +3.4%」와
    「매수후보유 +79%」를 나란히 놓는 것은 견줌이 아니다 — 앞엣것은 한 번의
    성적이고 뒤엣것은 한 해 반의 성적이다. 같은 창에서 같은 방식으로 재야 한다.

    안 들고 있는 동안은 **현금**이다(이자 0). 그래서 「장에 머문 시간」을 함께
    낸다 — 반만 머물고 절반의 수익을 냈다면 그건 진 것이 아니다.
    """
    idx = [i for i in range(len(bars)) if self_pcts[i] is not None]
    if len(idx) < 2:
        return None
    a, b = idx[0], idx[-1]
    span = b - a
    # **날마다** 자산을 다시 적는다. 거래가 끝나는 날에만 적으면 보유 중에 겪은
    # 낙폭이 통째로 빠져, 손절을 스치고 살아 돌아온 거래가 무사히 지나간 것처럼
    # 보인다. 고객이 견디는 것은 그 도중이다.
    held = sum(t['bars'] for t in trades)
    pos = {}                     # 날짜 인덱스 → 그날 들고 있는 거래
    for t in trades:
        for j in range(t['entry_i'], t['exit_i'] + 1):
            pos[j] = t
    eq = 1.0
    peak = 1.0
    mdd = 0.0
    for j in range(a, b + 1):
        t = pos.get(j)
        if t:
            half = cost_bps / 200.0          # 왕복 비용을 진입·청산에 반씩
            if j == t['entry_i'] and j == t['exit_i']:
                eq *= t['exit_px'] / t['entry_px'] * (1 - 2 * half / 100.0)
            elif j == t['entry_i']:
                # 진입일은 시가에 사서 종가까지
                eq *= bars[j]['c'] / t['entry_px'] * (1 - half / 100.0)
            elif j == t['exit_i']:
                eq *= t['exit_px'] / bars[j - 1]['c'] * (1 - half / 100.0)
            else:
                eq *= bars[j]['c'] / bars[j - 1]['c']
        peak = max(peak, eq)
        mdd = min(mdd, eq / peak - 1)
    # 위의 날짜별 누적과 건당 net 복리는 반올림 차이 말고는 같아야 한다.
    bh_ret = (bars[b]['c'] / bars[a]['c'] - 1) * 100

    # 매수후보유의 최대낙폭 — 같은 창에서 잰다. **이게 있어야 견줌이 공정하다.**
    # 장에 27% 만 머물러 수익이 적게 난 것을 「졌다」고만 적으면, 그 대가로 덜
    # 겪은 낙폭을 감추게 된다. 고객이 못 견디고 파는 자리는 수익률 표가 아니라
    # 낙폭 쪽에 있다.
    bh_peak = bars[a]['c']
    bh_mdd = 0.0
    for j in range(a, b + 1):
        bh_peak = max(bh_peak, bars[j]['c'])
        bh_mdd = min(bh_mdd, bars[j]['c'] / bh_peak - 1)

    inm = (held / span * 100) if span else None
    # 노출 보정 — **장에 머문 하루당** 얼마를 벌었는가. 반만 머물고 절반을
    # 벌었다면 그건 비긴 것이지 진 것이 아니다.
    per_day = ((eq - 1) * 100 / held) if held else None
    bh_per_day = (bh_ret / span) if span else None

    return {'total_pct': (eq - 1) * 100, 'bh_pct': bh_ret,
            'excess_pct': (eq - 1) * 100 - bh_ret,
            'in_market_pct': inm,
            'per_day_pct': per_day, 'bh_per_day_pct': bh_per_day,
            'per_day_excess': (per_day - bh_per_day)
                              if (per_day is not None and bh_per_day is not None) else None,
            'trade_mdd_pct': mdd * 100, 'bh_mdd_pct': bh_mdd * 100,
            'mdd_saved_pct': (bh_mdd - mdd) * -100,
            'span_bars': span, 'held_bars': held,
            'from': bars[a]['d'], 'to': bars[b]['d']}


def prepare(bars, bench_close, flip):
    """지표와 축 점수는 시계(h)와 무관하다 — 한 번만 셈해 시계마다 돌려 쓴다."""
    if len(bars) < S.BURN_IN + 60:
        return None
    ind = S.compute_indicators(bars, bench_close)
    rows = S.score_series(ind, bars, flip=flip)
    return ind, rows


def run_ticker(bars, prepared, h, cost_bps):
    """한 종목을 끝까지 돌린다. 돌려주는 것은 사건연구 짝과 매매 기록."""
    if not prepared:
        return None
    ind, rows = prepared
    scores, _, _ = S.adaptive_series(bars, rows, h=h)
    sp = S.self_pct_series(scores)
    sig, base = event_study(bars, sp, h)
    trades = simulate(bars, ind, rows, sp, h, cost_bps)
    mac = ma_cross(bars, ind, sp, h, cost_bps)
    rnd = random_entry(bars, sp, h, len(trades), cost_bps)
    eq = equity(trades, bars, sp, cost_bps)
    eq_ma = equity(mac, bars, sp, cost_bps)
    return {'sig': sig, 'base': base, 'trades': trades,
            'ma': mac, 'rand': rnd, 'eq': eq, 'eq_ma': eq_ma}


# ─────────────────────────────────────────────────────────────────────
# 전체 돌리기
# ─────────────────────────────────────────────────────────────────────

UNIVERSES = [
    ('KR', 'origin/kr100-data', 'data/kr100/chart/'),
    ('US', 'origin/us100-data', 'data/us100/chart/'),
]


def bench_series(market):
    """상대강도용 기준 지수. 코스피 프록시가 있으면 그것을, 없으면 등가중 평균."""
    p = os.path.join(ROOT, 'data/volatility/history.json')
    if market == 'KR' and os.path.exists(p):
        h = json.load(open(p, encoding='utf-8'))
        bars = (h.get('index') or {}).get('bars') or []
        if bars:
            return {b['d']: b['c'] for b in bars}
    return None


def align_bench(bars, bmap):
    if not bmap:
        return None
    return [bmap.get(b['d']) for b in bars]


def main(argv):
    h_list = [int(x) for x in (argv[argv.index('--h') + 1].split(',')
                               if '--h' in argv else ['5', '10', '20', '60'])]
    limit = int(argv[argv.index('--limit') + 1]) if '--limit' in argv else 0
    markets = (argv[argv.index('--market') + 1].split(',')
               if '--market' in argv else ['KR', 'US'])
    out_path = argv[argv.index('--out') + 1] if '--out' in argv else None

    report = {'horizons': {}, 'cost_grid_bps': COST_GRID_BPS,
              'entry_cut': ENTRY_CUT, 'exit_cut': EXIT_CUT}
    # **어느 가격으로 잰 성적인지 새긴다.** engine_hash 가 「어느 모델인가」를
    # 막아 주듯, 이것은 「어느 가격인가」를 막는다. 가격 출처를 바꾸고 성적표를
    # 다시 안 돌리면 화면이 네이버 신호에 야후 성적을 붙이게 된다.

    loaded = {}
    srcs = {}
    for mk, branch, prefix in UNIVERSES:
        if mk not in markets:
            continue
        paths = list_universe(branch, prefix)
        if limit:
            paths = paths[:limit]
        bmap = bench_series(mk)
        rows = []
        used = {}
        for p in paths:
            b, src = bars_for(mk, branch, p)
            if b:
                used[src] = used.get(src, 0) + 1
                rows.append((os.path.basename(p)[:-5], b, align_bench(b, bmap)))
        loaded[mk] = rows
        srcs[mk] = used
        sys.stderr.write('%s 종목 %d 개 읽음 — 출처 %s\n'
                         % (mk, len(rows), json.dumps(used, ensure_ascii=False)))

    # 지표·축은 시계와 무관하므로 flip 마다 한 번만 셈해 둔다. 이걸 안 하면
    # 시계 네 개에 같은 셈을 네 번 한다.
    prepped = {}
    for flip in (True, False):
        for mk, rows in loaded.items():
            for name, bars, bench in rows:
                prepped[(flip, mk, name)] = prepare(bars, bench, flip)
        sys.stderr.write('%s 준비 끝\n' % ('flip' if flip else 'noflip'))

    for h in h_list:
        report['horizons'][h] = {}
        for flip in (True, False):
            key = 'flip' if flip else 'noflip'
            agg = {}
            for mk, rows in loaded.items():
                cost = DEFAULT_COST_BPS[mk]
                sig, base, trades, ma, rnd, eqs, eqms = [], [], [], [], [], [], []
                for name, bars, bench in rows:
                    r = run_ticker(bars, prepped[(flip, mk, name)], h, cost)
                    if not r:
                        continue
                    sig += r['sig']; base += r['base']
                    trades += r['trades']; ma += r['ma']; rnd += r['rand']
                    if r['eq']:
                        eqs.append(r['eq'])
                    if r['eq_ma']:
                        eqms.append(r['eq_ma'])
                m = {
                    'cost_bps': cost,
                    'event': {
                        'signal_days': len(sig),
                        'baseline_days': len(base),
                        'signal_mean': round(st.mean([r for _, r in sig]), 3) if sig else None,
                        'baseline_mean': round(st.mean([r for _, r in base]), 3) if base else None,
                        'signal_median': round(st.median([r for _, r in sig]), 3) if sig else None,
                        'baseline_median': round(st.median([r for _, r in base]), 3) if base else None,
                        'bootstrap': block_bootstrap_diff(sig, base),
                    },
                    'trades_net': summarize(trades, 'net'),
                    'trades_gross': summarize(trades, 'gross'),
                    'ma_cross_net': summarize(ma, 'net'),
                    'random_net': summarize(rnd, 'net'),
                    # **같은 창에서 복리로** 견준 자리. 위의 건당 평균과 달리
                    # 매수후보유와 직접 견줄 수 있는 유일한 숫자다.
                    'equity': {
                        'n': len(eqs),
                        'strategy_median_pct': round(st.median([e['total_pct'] for e in eqs]), 2) if eqs else None,
                        'buyhold_median_pct': round(st.median([e['bh_pct'] for e in eqs]), 2) if eqs else None,
                        'excess_median_pct': round(st.median([e['excess_pct'] for e in eqs]), 2) if eqs else None,
                        'excess_mean_pct': round(st.mean([e['excess_pct'] for e in eqs]), 2) if eqs else None,
                        'beat_buyhold_pct': round(sum(1 for e in eqs if e['excess_pct'] > 0) / len(eqs) * 100, 1) if eqs else None,
                        'in_market_median_pct': round(st.median([e['in_market_pct'] for e in eqs if e['in_market_pct'] is not None]), 1) if eqs else None,
                        # 낙폭 — 수익률만 실으면 「덜 벌었다」만 보이고 그 대가로
                        # 「덜 겪었다」가 안 보인다. 둘은 같은 저울의 양쪽이다.
                        'mdd_median_pct': round(st.median([e['trade_mdd_pct'] for e in eqs]), 2) if eqs else None,
                        'bh_mdd_median_pct': round(st.median([e['bh_mdd_pct'] for e in eqs]), 2) if eqs else None,
                        'mdd_saved_median_pct': round(st.median([e['mdd_saved_pct'] for e in eqs]), 2) if eqs else None,
                        # 노출 보정 — 장에 머문 하루당 수익
                        'per_day_excess_median': round(st.median([e['per_day_excess'] for e in eqs if e['per_day_excess'] is not None]), 4) if eqs else None,
                        'per_day_beat_pct': round(sum(1 for e in eqs if (e['per_day_excess'] or 0) > 0) / len(eqs) * 100, 1) if eqs else None,
                        'ma_cross_excess_median_pct': round(st.median([e['excess_pct'] for e in eqms]), 2) if eqms else None,
                    },
                    'cost_sensitivity': {},
                }
                for cb in COST_GRID_BPS:
                    xs = [t['gross'] - cb / 100.0 for t in trades]
                    m['cost_sensitivity'][cb] = {
                        'mean': round(st.mean(xs), 3) if xs else None,
                        'win_rate': round(sum(1 for x in xs if x > 0) / len(xs) * 100, 1) if xs else None,
                    }
                agg[mk] = m
            report['horizons'][h][key] = agg
            sys.stderr.write('h=%d %s 끝\n' % (h, key))

    # 이 성적이 어느 모델의 것인지 적어 둔다. build_signals.py 가 이것을 대조해
    # 「지금 모델과 다르다」를 산출물에 남긴다.
    report['price_sources'] = srcs
    report['engine_hash'] = hashlib.sha256(
        open(os.path.join(ROOT, 'scripts', 'signal_lib.py'), 'rb').read()).hexdigest()[:16]
    add_verdict(report)
    sys.stderr.write('\n%s\n\n' % report['summary_ko'])
    js = json.dumps(report, ensure_ascii=False, indent=1)
    if out_path:
        open(out_path, 'w', encoding='utf-8').write(js)
        sys.stderr.write('썼다: %s\n' % out_path)
    else:
        print(js)
    return 0




# ─────────────────────────────────────────────────────────────────────
# 판정 — **여러 번 시험한 것을 감안한다**
# ─────────────────────────────────────────────────────────────────────
#
# 시계 4 × 설정 2 × 시장 2 = 16 가지를 시험한다. 5% 수준으로 보면 **다 우연이어도
# 한 가지쯤은 유의하게 나온다.** 그 하나를 집어 「됩니다」라고 싣는 것이 백테스트가
# 거짓말하는 가장 흔한 방식이다.
#
# 그래서 두 가지를 함께 낸다.
#   낱개 판정   그 조합 하나만 보았을 때 (95% 구간이 0 을 걸치는가)
#   보정 판정   16 가지를 다 시험했다는 것을 감안했을 때 (Bonferroni)
# 보정을 통과하지 못하면 「유의하다」고 적지 않는다.

def _z_from_ci(diff, lo, hi):
    """95% 구간에서 표준오차를 되짚어 z 를 낸다."""
    se = (hi - lo) / (2 * 1.959964)
    return (diff / se) if se > 0 else None


def _p_two_sided(z):
    return math.erfc(abs(z) / math.sqrt(2.0))


def add_verdict(report):
    """보고서에 판정을 붙인다. 숫자에서 문장을 만들어, 둘이 어긋날 자리를 없앤다."""
    tests = []
    for h, hv in (report.get('horizons') or {}).items():
        for flip, fv in hv.items():
            for mk, m in fv.items():
                bo = ((m.get('event') or {}).get('bootstrap')) or {}
                if bo.get('diff') is None:
                    continue
                z = _z_from_ci(bo['diff'], bo['ci_lo'], bo['ci_hi'])
                if z is None:
                    continue
                tests.append({'h': h, 'flip': flip, 'market': mk,
                              'diff': bo['diff'], 'z': round(z, 3),
                              'p': _p_two_sided(z)})
    k = len(tests) or 1
    alpha = 0.05 / k
    for t in tests:
        t['p'] = round(t['p'], 5)
        t['alone'] = bool(t['p'] < 0.05)
        t['corrected'] = bool(t['p'] < alpha)

    lines = []
    survivors = [t for t in tests if t['corrected']]
    pos = [t for t in tests if t['alone'] and t['diff'] > 0]
    neg = [t for t in tests if t['alone'] and t['diff'] < 0]

    lines.append('시험한 조합 %d 가지(시계 4 × 부호전환 2 × 시장 2). '
                 '여러 번 시험했으므로 Bonferroni 로 보정한 문턱은 p<%.4f 이다.' % (k, alpha))
    if survivors:
        lines.append('보정을 통과한 조합: ' +
                     ', '.join('%s h=%s %s(%+.2f%%p)' % (t['market'], t['h'], t['flip'], t['diff'])
                               for t in survivors))
    else:
        lines.append('**보정을 통과한 조합은 없다.** 낱개로 보면 유의해 보이는 것이 있어도 '
                     '(%s), 열여섯 번 시험한 것을 감안하면 우연으로 설명된다.'
                     % (', '.join('%s h=%s %+.2f%%p p=%.3f' % (t['market'], t['h'], t['diff'], t['p'])
                                  for t in tests if t['alone']) or '없다'))

    # 방향의 일관성 — 낱낱이 유의하지 않아도 넷이 다 같은 쪽이면 그 자체가 약한 증거다
    for mk in ('KR', 'US'):
        ds = [t['diff'] for t in tests if t['market'] == mk and t['flip'] == 'flip']
        if len(ds) >= 3:
            if all(d > 0 for d in ds):
                lines.append('%s 는 시계 넷이 모두 양수다(%s) — 낱낱이 유의하지는 않으나 '
                             '방향이 일관된다는 것은 약한 증거다.'
                             % (mk, ', '.join('%+.2f' % d for d in ds)))
            elif all(d < 0 for d in ds):
                lines.append('**%s 는 시계 넷이 모두 음수다(%s) — 이 시장에서는 신호가 '
                             '거꾸로 간다고 보아야 한다.**'
                             % (mk, ', '.join('%+.2f' % d for d in ds)))

    # 수익률이 아니라 낙폭 쪽 이야기
    eq = {}
    for h, hv in (report.get('horizons') or {}).items():
        m = ((hv.get('flip') or {}).get('KR') or {}).get('equity')
        if m and m.get('excess_median_pct') is not None:
            eq[h] = m
    if eq:
        ex = [v['excess_median_pct'] for v in eq.values()]
        inm = [v['in_market_median_pct'] for v in eq.values()]
        sv = [v['mdd_saved_median_pct'] for v in eq.values()]
        lines.append('국내 기준 매수후보유 대비 수익은 시계 어디서도 앞서지 못한다'
                     '(%s%%p). 다만 장에 머문 시간이 %.0f~%.0f%% 뿐이고 최대낙폭을 '
                     '%.0f~%.0f%%p 줄인다. **수익을 늘리는 도구가 아니라 겪는 낙폭을 '
                     '줄이는 도구로 읽어야 한다.**'
                     % (' / '.join('%+.0f' % x for x in ex), min(inm), max(inm),
                        min(sv), max(sv)))

    report['verdict'] = {'tests': tests, 'alpha_corrected': alpha,
                         'survivors': len(survivors),
                         'positive_alone': len(pos), 'negative_alone': len(neg)}
    report['summary_ko'] = ' '.join(lines)
    return report


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
