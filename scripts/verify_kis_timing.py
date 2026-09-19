# -*- coding: utf-8 -*-
"""산출물을 **다시 셈해서** 대조한다. 같은 코드로 두 번 부르는 것은 검산이 아니다.

여기의 지표는 `kis_strategy_lib` 을 **쓰지 않고** 다시 쓴 것이다. 일부러 느리고
순진하게 — 매 봉에서 창을 통째로 다시 자른다. 빠른 쪽(누적합을 굴리는 SMA,
직전 값을 물려받는 연속일수)에 미끄러진 자리가 있으면 여기서 갈린다.

여섯 가지를 본다.

    1. 지표      독립 구현과 라이브러리가 같은 값을 내는가
    2. 신호      화면에 올라간 매수/청산 종목이 정말 그 조건을 만족하는가
    3. 성적표    백테스트 몇 칸을 다시 돌려 같은 수가 나오는가
    4. 가격      화면의 종가가 원본 일봉의 마지막 봉과 같은가
    5. 산술      손절가 = 종가 × (1 − 손절%) 가 맞는가
    6. 칸 나눔   합의/관찰이 겹치지 않는가, 멤버가 백테스트가 고른 것과 같은가

한 줄이라도 FAIL 이면 산출물을 내보내지 않는다 — 조용히 틀린 매수 신호가
나가는 것보다 소리를 내고 멈추는 편이 낫다.
"""

import json
import math
import os
import random
import statistics as st
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kis_strategy_lib as K
import kis_timing_data as D
import kis_timing_backtest as B

ROOT = D.ROOT
OUT_DIR = os.path.join(ROOT, 'data', 'kis_timing')
EPS = 1e-9

lines = []
fails = 0


def check(ok, label, detail=''):
    global fails
    if not ok:
        fails += 1
    lines.append('%s  %s%s' % ('PASS' if ok else 'FAIL', label,
                               ('  — ' + detail) if detail else ''))
    return ok


def close_to(a, b, tol=1e-6):
    if a is None or b is None:
        return a is b
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))


# ─────────────────────────────────────────────────────────────────────
# 1. 지표 — 순진한 독립 구현
# ─────────────────────────────────────────────────────────────────────

def naive_sma(xs, n):
    return [None if i + 1 < n else sum(xs[i - n + 1:i + 1]) / n for i in range(len(xs))]


def naive_disparity(xs, n):
    ma = naive_sma(xs, n)
    return [None if not ma[i] else xs[i] / ma[i] * 100.0 for i in range(len(xs))]


def naive_roc(xs, n):
    return [None if (i < n or not xs[i - n]) else (xs[i] - xs[i - n]) / xs[i - n] * 100.0
            for i in range(len(xs))]


def naive_std(xs, n):
    out = []
    for i in range(len(xs)):
        if i < n:
            out.append(None)
            continue
        r = [(xs[j] - xs[j - 1]) / xs[j - 1] for j in range(i - n + 1, i + 1)]
        m = sum(r) / n
        out.append(math.sqrt(sum((v - m) ** 2 for v in r) / (n - 1)))
    return out


def naive_consec(xs, up):
    out = []
    for i in range(len(xs)):
        c = 0
        j = i
        while j > 0 and ((xs[j] > xs[j - 1]) if up else (xs[j] < xs[j - 1])):
            c += 1
            j -= 1
        out.append(c)
    return out


def verify_indicators(uni):
    rng = random.Random(20260919)
    picks = []
    for mk in D.MARKET_ORDER:
        rows = uni.get(mk) or []
        picks += rng.sample(rows, min(4, len(rows)))
    bad = []
    for it in picks:
        c = [b['c'] for b in it['bars']]
        h = [b['h'] for b in it['bars']]
        l = [b['l'] for b in it['bars']]
        pairs = [
            ('sma20', K.sma(c, 20), naive_sma(c, 20)),
            ('sma60', K.sma(c, 60), naive_sma(c, 60)),
            ('disparity5', K.disparity(c, 5), naive_disparity(c, 5)),
            ('roc60', K.roc_pct(c, 60), naive_roc(c, 60)),
            ('std10', K.ret_std(c, 10), naive_std(c, 10)),
            ('consec_up', K.consecutive(c, 'up'), naive_consec(c, True)),
            ('consec_down', K.consecutive(c, 'down'), naive_consec(c, False)),
            ('ibs', K.ibs(h, l, c),
             [0.5 if h[i] == l[i] else (c[i] - l[i]) / (h[i] - l[i]) for i in range(len(c))]),
        ]
        for nm, a, b in pairs:
            for i in range(len(c)):
                if (a[i] is None) != (b[i] is None):
                    bad.append('%s %s[%d] 한쪽만 None' % (it['symbol'], nm, i))
                    break
                if a[i] is not None and not close_to(a[i], b[i], 1e-9):
                    bad.append('%s %s[%d] %r vs %r' % (it['symbol'], nm, i, a[i], b[i]))
                    break
    check(not bad, '지표 %d 종목 × 8개를 독립 구현과 대조' % len(picks),
          '; '.join(bad[:3]) if bad else '')


# ─────────────────────────────────────────────────────────────────────
# 2. 신호 — 화면에 올라간 종목이 정말 그 조건인가
# ─────────────────────────────────────────────────────────────────────

def _holds(bars, sid, i, want):
    """전략 조건을 **말 그대로** 다시 확인한다. actions() 를 부르지 않는다."""
    c = [b['c'] for b in bars]
    h = [b['h'] for b in bars]
    l = [b['l'] for b in bars]
    if sid == 'golden_cross':
        f, s = naive_sma(c, 5), naive_sma(c, 20)
        if None in (f[i], s[i], f[i - 1], s[i - 1]):
            return False
        return (f[i - 1] < s[i - 1] and f[i] > s[i]) if want == 'BUY' else \
               (f[i - 1] > s[i - 1] and f[i] < s[i])
    if sid == 'momentum':
        r = naive_roc(c, 60)[i]
        return r is not None and (r >= 30 if want == 'BUY' else r <= -20)
    if sid == 'week52_high':
        if i < 252:
            return False
        hh = max(h[i - 252:i])
        return (c[i] > hh) if want == 'BUY' else (c[i] < hh)
    if sid == 'consecutive':
        n = naive_consec(c, want == 'BUY')[i]
        return n >= 5
    if sid == 'disparity':
        d = naive_disparity(c, 20)[i]
        return d is not None and (d < 90 if want == 'BUY' else d > 110)
    if sid == 'strong_close':
        v = 0.5 if h[i] == l[i] else (c[i] - l[i]) / (h[i] - l[i])
        return v >= 0.8 if want == 'BUY' else v < 0.5
    if sid == 'volatility':
        chg = (c[i] / c[i - 1] - 1) * 100
        vol = naive_std(c, 10)
        w = vol[i - 9:i + 1]
        fired = (vol[i] is not None and None not in w and len(w) == 10
                 and vol[i] <= min(w) * 1.1 and chg >= 3)
        return fired if want == 'BUY' else (not fired and chg <= -3)
    if sid == 'mean_reversion':
        ma = naive_sma(c, 5)[i]
        if not ma:
            return False
        dev = (c[i] - ma) / ma * 100
        return dev <= -3 if want == 'BUY' else dev >= 3
    if sid == 'trend_filter':
        ma = naive_sma(c, 60)[i]
        if ma is None:
            return False
        chg = c[i] - c[i - 1]
        return (c[i] > ma and chg > 0) if want == 'BUY' else (c[i] < ma and chg < 0)
    if sid == 'breakout_fail':
        if i < 24 or want != 'SELL':
            return False
        rec = max(h[i - 2:i + 1])
        prv = max(h[i - 22:i - 2])
        return rec > prv and (c[i] - rec) / rec * 100 <= -3
    raise AssertionError('모르는 전략 %s' % sid)


def verify_signals(doc, uni):
    by_sym = {}
    for mk in D.MARKET_ORDER:
        for it in (uni.get(mk) or []):
            by_sym[(mk, it['symbol'])] = it
    bad, n = [], 0
    for mk, m in doc['markets'].items():
        for key, hits, want in (('buy', 'buy_hits', 'BUY'), ('sell', 'sell_hits', 'SELL'),
                                ('watch_buy', 'buy_hits', 'BUY'),
                                ('watch_sell', 'sell_hits', 'SELL')):
            for p in m.get(key) or []:
                it = by_sym.get((mk, p['symbol']))
                if not it:
                    bad.append('%s 우주에 없음' % p['symbol'])
                    continue
                i = len(it['bars']) - 1
                for sid in p[hits]:
                    n += 1
                    if not _holds(it['bars'], sid, i, want):
                        bad.append('%s/%s %s 조건 불성립' % (p['symbol'], sid, want))
    check(not bad, '화면의 신호 %d 건이 조건을 만족' % n, '; '.join(bad[:3]))


# ─────────────────────────────────────────────────────────────────────
# 3. 성적표 — 무작위로 몇 칸을 다시 돌린다
# ─────────────────────────────────────────────────────────────────────

def verify_grades(bt, uni):
    rng = random.Random(4)
    picks = rng.sample(bt['grades'], min(5, len(bt['grades'])))
    bad = []
    for g in picks:
        rows = uni.get(g['market']) or []
        if not rows:
            continue
        re = B.grade(g['market'], g['strategy'], rows, B.COST_BPS[g['market']])
        for k in ('trades', 'win_rate', 'avg', 'edge', 'hold_median'):
            if re.get(k) != g.get(k):
                bad.append('%s/%s %s %r vs %r' % (g['market'], g['strategy'], k,
                                                  g.get(k), re.get(k)))
    check(not bad, '성적표 %d 칸을 다시 돌려 대조' % len(picks), '; '.join(bad[:3]))


# ─────────────────────────────────────────────────────────────────────
# 4~6. 가격 · 산술 · 칸 나눔
# ─────────────────────────────────────────────────────────────────────

def verify_prices(doc, uni):
    by_sym = {}
    for mk in D.MARKET_ORDER:
        for it in (uni.get(mk) or []):
            by_sym[(mk, it['symbol'])] = it
    bad, n = [], 0
    for mk, m in doc['markets'].items():
        for key in ('buy', 'sell', 'watch_buy', 'watch_sell'):
            for p in m.get(key) or []:
                it = by_sym.get((mk, p['symbol']))
                if not it:
                    continue
                b = it['bars'][-1]
                n += 1
                if b['d'] != p['asof']:
                    bad.append('%s 기준일 %s vs %s' % (p['symbol'], p['asof'], b['d']))
                want = round(b['c'], 2 if b['c'] < 1000 else 0)
                if not close_to(p['close'], want, 1e-9):
                    bad.append('%s 종가 %r vs %r' % (p['symbol'], p['close'], want))
    check(not bad, '종가·기준일 %d 건이 원본 일봉과 일치' % n, '; '.join(bad[:3]))


def verify_arith(doc):
    bad, n = [], 0
    stop = doc['rule']['stop_loss_pct']
    for mk, m in doc['markets'].items():
        for key in ('buy', 'watch_buy'):
            for p in m.get(key) or []:
                if p.get('stop_ref') is None:
                    bad.append('%s 손절가 없음' % p['symbol'])
                    continue
                n += 1
                px = p['close']
                want = px * (1 - stop / 100.0)
                want = round(want, 2 if want < 1000 else 0)
                if not close_to(p['stop_ref'], want, 1e-9):
                    bad.append('%s 손절가 %r vs %r' % (p['symbol'], p['stop_ref'], want))
        for key in ('sell', 'watch_sell'):
            for p in m.get(key) or []:
                if p.get('stop_ref') is not None:
                    bad.append('%s 청산 항목에 손절가가 붙음' % p['symbol'])
    check(not bad, '손절가 %d 건이 종가 × (1 − %s%%)' % (n, stop), '; '.join(bad[:3]))


def verify_buckets(doc, bt):
    bad = []
    for mk, m in doc['markets'].items():
        if m['members'] != (bt['picked_live'].get(mk) or []):
            bad.append('%s 멤버가 백테스트 선정과 다름' % mk)
        seen = {}
        for key in ('buy', 'sell', 'watch_buy', 'watch_sell'):
            for p in m.get(key) or []:
                if p['symbol'] in seen:
                    bad.append('%s 가 %s 와 %s 에 겹침' % (p['symbol'], seen[p['symbol']], key))
                seen[p['symbol']] = key
        k = doc['rule']['k']
        for p in m.get('buy') or []:
            if len(p['buy_hits']) < k:
                bad.append('%s 합의매수인데 신호 %d 개' % (p['symbol'], len(p['buy_hits'])))
        for p in m.get('watch_buy') or []:
            if len(p['buy_hits']) >= k or p['sell_hits']:
                bad.append('%s 관찰매수 자리가 아님' % p['symbol'])
        for sid in m['members']:
            if sid not in K.BY_ID:
                bad.append('%s 모르는 전략' % sid)
    check(not bad, '합의/관찰 칸 나눔과 멤버 선정', '; '.join(bad[:3]))


def verify_strategy_count(bt):
    ids = [s['id'] for s in bt['strategies']]
    check(len(ids) == 10 and len(set(ids)) == 10,
          '전략이 10종인가', '%d 종: %s' % (len(ids), ','.join(ids)))


def main():
    bt = json.load(open(os.path.join(OUT_DIR, 'backtest.json'), encoding='utf-8'))
    doc = json.load(open(os.path.join(OUT_DIR, 'latest.json'), encoding='utf-8'))
    uni, _ = D.load_universe()

    lines.append('한국투자증권 전략빌더 10종 — 매매 타이밍 산출물 검산')
    lines.append('백테스트 %s · 세팅 %s' % (bt['generated_at_kst'], doc['generated_at_kst']))
    lines.append('')

    verify_strategy_count(bt)
    verify_indicators(uni)
    verify_signals(doc, uni)
    verify_grades(bt, uni)
    verify_prices(doc, uni)
    verify_arith(doc)
    verify_buckets(doc, bt)

    lines.append('')
    lines.append('결과: %s' % ('모두 통과' if not fails else '%d 건 FAIL' % fails))
    txt = '\n'.join(lines) + '\n'
    with open(os.path.join(OUT_DIR, 'verify.txt'), 'w', encoding='utf-8') as f:
        f.write(txt)
    sys.stdout.write(txt)
    _ = st
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
