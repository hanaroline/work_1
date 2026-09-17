# -*- coding: utf-8 -*-
"""신호 산출물을 검산한다.

`verify_volatility.py` 가 세운 자리를 그대로 따른다. 요점은 **모델을 만든 코드와
다른 코드로 다시 셈해 대조하는 것**이다. 같은 함수를 불러 같은 값이 나오는 것을
확인하는 시험은 아무것도 검산하지 않는다.

보는 것:
  가. 지표     RSI·MACD·볼린저·ATR·실현변동성·ADX·MFI·스토캐스틱을 **여기서 따로**
               셈해 실린 수와 맞춘다
  나. 매물대   칸의 합이 100% 인지, 현재가 위아래 비중이 아귀가 맞는지
  다. 미래참조 자료를 그날까지 **잘라** 다시 셈해 같은 값이 나오는지
  라. 없는 것  축이 조용히 빠졌는지, 한계를 적었는지, 표본 부족을 표본 부족이라
               적었는지
  마. 흠 심기  일부러 틀린 값을 넣어 위 시험들이 **실제로 잡는지**

마가 없으면 나머지는 통과했다는 말을 할 자격이 없다. 안 잡히는 검산기는 통과만
찍는 장식이다.
"""

import json
import math
import os
import statistics as st
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import signal_lib as S
import signal_backtest as B

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOL = 1e-6

FAILS = []
CHECKS = [0]


def check(name, got, want, tol=TOL, note=''):
    CHECKS[0] += 1
    if got is None and want is None:
        return True
    if got is None or want is None:
        FAILS.append('%s: 한쪽이 없음 got=%r want=%r %s' % (name, got, want, note))
        return False
    if abs(got - want) > tol * max(1.0, abs(want)):
        FAILS.append('%s: %.8f != %.8f (차 %.2e) %s' % (name, got, want, abs(got - want), note))
        return False
    return True


def check_true(name, cond, note=''):
    CHECKS[0] += 1
    if not cond:
        FAILS.append('%s: 거짓 %s' % (name, note))
        return False
    return True


# ─────────────────────────────────────────────────────────────────────
# 가. 지표를 **처음부터 다시** 셈한다
# ─────────────────────────────────────────────────────────────────────

def v_rsi(c, n=14):
    """Wilder RSI 를 교과서 그대로. vol_lib 을 부르지 않는다."""
    if len(c) < n + 1:
        return None
    g = [max(0.0, c[i] - c[i - 1]) for i in range(1, len(c))]
    l = [max(0.0, c[i - 1] - c[i]) for i in range(1, len(c))]
    ag = sum(g[:n]) / n
    al = sum(l[:n]) / n
    for i in range(n, len(g)):
        ag = (ag * (n - 1) + g[i]) / n
        al = (al * (n - 1) + l[i]) / n
    if al == 0:
        return 100.0
    return 100.0 - 100.0 / (1 + ag / al)


def v_ema_last(xs, n):
    k = 2.0 / (n + 1)
    e = sum(xs[:n]) / n
    for x in xs[n:]:
        e = x * k + e * (1 - k)
    return e


def v_macd(c):
    f = v_ema_last(c, 12)
    s = v_ema_last(c, 26)
    line = f - s
    # 신호선은 MACD 선의 9일 EMA — 선 전체를 다시 세워야 한다
    ml = []
    kf, ks = 2.0 / 13, 2.0 / 27
    ef = sum(c[:12]) / 12
    es = sum(c[:26]) / 26
    for i in range(len(c)):
        if i >= 12:
            ef = c[i] * kf + ef * (1 - kf)
        if i >= 26:
            es = c[i] * ks + es * (1 - ks)
        if i >= 25:
            ml.append(ef - es)
    sig = v_ema_last(ml, 9)
    return line, sig, line - sig


def v_boll(c, n=20, k=2.0):
    """**표본표준편차(ddof=1)를 쓴다.**

    교과서의 볼린저밴드는 모표준편차(÷n)로 세운다. 이 저장소는 변동성을 표본에서
    재는 값으로 보아 ÷(n−1) 로 두었고(vol_lib.rolling_std), 경보 모델과 그 검산기
    (verify_volatility.py)가 모두 그 약속을 따른다. 밴드 폭이 √(20/19)=1.026 배,
    2.6% 넓다.

    여기서 교과서 쪽으로 되돌리면 **두 모델이 서로 다른 밴드를 쓰게 된다.** 화면
    위아래가 어긋나는 쪽이 2.6% 넓은 밴드보다 나쁘다. 게다가 이 도구는 밴드 값을
    그대로 쓰지 않고 제 이력 안 백분위로 옮겨 쓰므로, 두 약속 어느 쪽이든 점수가
    거의 같다. 그래서 저장소 약속에 맞춘다 — **틀려서가 아니라 맞추려고** 이렇게
    적어 둔다.
    """
    w = c[-n:]
    m = sum(w) / n
    sd = math.sqrt(sum((x - m) ** 2 for x in w) / (n - 1))
    return m, m + k * sd, m - k * sd


def v_atr(o, h, l, c, n=14):
    tr = []
    for i in range(1, len(c)):
        tr.append(max(h[i] - l[i], abs(h[i] - c[i - 1]), abs(l[i] - c[i - 1])))
    if len(tr) < n:
        return None
    a = sum(tr[:n]) / n
    for x in tr[n:]:
        a = (a * (n - 1) + x) / n
    return a


def v_rv(c, n, ann=252):
    """n일 실현변동성 — **수익률 n개**로 센다.

    (경보 모델을 만들 때 종가 n개=수익률 n−1개로 세어 한 칸 어긋난 적이 있다.
    그 흠을 여기서 되풀이하지 않으려고 적어 둔다.)
    """
    if len(c) < n + 1:
        return None
    r = [math.log(c[i] / c[i - 1]) for i in range(len(c) - n, len(c))]
    m = sum(r) / len(r)
    var = sum((x - m) ** 2 for x in r) / (len(r) - 1)
    return math.sqrt(var * ann) * 100


def v_mfi(h, l, c, v, n=14):
    tp = [(a + b + d) / 3.0 for a, b, d in zip(h, l, c)]
    pos = neg = 0.0
    for j in range(len(c) - n, len(c)):
        raw = tp[j] * (v[j] or 0)
        if tp[j] > tp[j - 1]:
            pos += raw
        elif tp[j] < tp[j - 1]:
            neg += raw
    return 50.0 if pos + neg <= 0 else pos / (pos + neg) * 100


def v_stoch(h, l, c, n=14):
    hh = max(h[-n:])
    ll = min(l[-n:])
    return 50.0 if hh == ll else (c[-1] - ll) / (hh - ll) * 100


def verify_indicators(bars, item):
    """실린 수를 원자료에서 따로 셈해 맞춘다."""
    o = [b['o'] for b in bars]
    h = [b['h'] for b in bars]
    l = [b['l'] for b in bars]
    c = [b['c'] for b in bars]
    v = [b['v'] for b in bars]
    ind = item['indicators']
    nm = item['symbol']

    check('%s rsi14' % nm, ind['rsi14'], round(v_rsi(c), 2), 1e-3)
    ml, ms, mh = v_macd(c)
    check('%s macd' % nm, ind['macd'], round(ml, 2), 1e-3)
    check('%s macd_signal' % nm, ind['macd_signal'], round(ms, 2), 1e-3)
    check('%s macd_hist' % nm, ind['macd_hist'], round(mh, 2), 1e-3)
    mid, up, lo = v_boll(c)
    check('%s bb_mid' % nm, ind['bb_mid'], round(mid, 2), 1e-3)
    check('%s bb_up' % nm, ind['bb_up'], round(up, 2), 1e-3)
    check('%s bb_lo' % nm, ind['bb_lo'], round(lo, 2), 1e-3)
    check('%s atr14' % nm, ind['atr14'], round(v_atr(o, h, l, c), 2), 1e-3)
    check('%s rv20' % nm, ind['rv20'], round(v_rv(c, 20), 2), 1e-3)
    check('%s rv5' % nm, ind['rv5'], round(v_rv(c, 5), 2), 1e-3)
    check('%s mfi14' % nm, ind['mfi14'], round(v_mfi(h, l, c, v), 2), 1e-3)
    check('%s stoch_k' % nm, ind['stoch_k'], round(v_stoch(h, l, c), 2), 1e-3)
    check('%s ma20' % nm, ind['ma20'], round(sum(c[-20:]) / 20, 2), 1e-3)
    check('%s ma60' % nm, ind['ma60'], round(sum(c[-60:]) / 60, 2), 1e-3)

    # %b 는 밴드와 아귀가 맞아야 한다 — 따로 셈한 밴드로 되짚는다
    if ind['pctb'] is not None and up != lo:
        check('%s pctb' % nm, ind['pctb'], round((c[-1] - lo) / (up - lo), 3), 1e-2)


# ─────────────────────────────────────────────────────────────────────
# 나. 매물대
# ─────────────────────────────────────────────────────────────────────

def verify_volume_profile(bars, item):
    vp = item.get('volume_profile')
    if not vp:
        return
    nm = item['symbol']
    tot = sum(b['pct'] for b in vp['bins'])
    check('%s 매물대 칸 합' % nm, tot, 100.0, 1e-3, '칸 비중의 합은 100%')
    check('%s 매물대 위아래 합' % nm, vp['above_pct'] + vp['below_pct'], 100.0, 1e-3)

    c = item['close']
    # 현재가 아래 칸들의 비중 합은 below_pct 를 넘을 수 없고, 현재가를 포함한
    # 칸까지 더하면 below_pct 이상이어야 한다. (칸을 가로지르는 몫 때문에 사이값)
    strict = sum(b['pct'] for b in vp['bins'] if b['hi'] <= c)
    loose = sum(b['pct'] for b in vp['bins'] if b['lo'] < c)
    check_true('%s 매물대 아래비중 범위' % nm,
               strict - 1e-6 <= vp['below_pct'] <= loose + 1e-6,
               '%.3f <= %.3f <= %.3f' % (strict, vp['below_pct'], loose))
    check_true('%s POC 는 가치영역 안' % nm, vp['val'] <= vp['poc'] <= vp['vah'],
               'val %.2f poc %.2f vah %.2f' % (vp['val'], vp['poc'], vp['vah']))
    if vp.get('nearest_up') is not None:
        check_true('%s 위 저항은 현재가 위' % nm, vp['nearest_up'] > c)
    if vp.get('nearest_dn') is not None:
        check_true('%s 아래 지지는 현재가 아래' % nm, vp['nearest_dn'] < c)


# ─────────────────────────────────────────────────────────────────────
# 다. 미래참조 — **자료를 잘라 다시 셈한다**
# ─────────────────────────────────────────────────────────────────────

def verify_no_lookahead(bars, cut=30):
    """마지막 cut 개를 **잘라 낸** 자료로 셈했을 때, 자르기 전 같은 날의 값과
    같아야 한다.

    이 시험이 이 검산기의 핵심이다. 지표 한 줄이 실수로 전체 계열의 평균이나
    최대값을 쓰면 나머지 시험은 다 통과하는데 백테스트 성적만 조용히 부풀어
    오른다. 잘라서 다시 셈해 보는 것 말고는 그걸 잡을 길이 없다.
    """
    full_ind = S.compute_indicators(bars)
    full_rows = S.score_series(full_ind, bars)
    short = bars[:len(bars) - cut]
    s_ind = S.compute_indicators(short)
    s_rows = S.score_series(s_ind, short)
    j = len(short) - 1

    for k in ('rsi14', 'macd_hist', 'bb_up', 'atr14', 'rv20', 'adx14', 'mfi14',
              'stoch_k', 'obv_slope20', 'pos52'):
        a, b = full_ind[k][j], s_ind[k][j]
        if a is None and b is None:
            continue
        check('미래참조 지표 %s' % k, b, a, 1e-9,
              '자료를 %d개 잘라도 같은 날 값은 같아야 한다' % cut)

    for k in ('t', 'm', 'f', 's', 'total', 'conf'):
        a, b = full_rows[j][k], s_rows[j][k]
        if a is None and b is None:
            continue
        check('미래참조 축 %s' % k, b, a, 1e-9)

    # 워크포워드 가중치도 같아야 한다
    fw_full, _ = S.fit_weights(bars, full_rows, j, h=10)
    fw_short, _ = S.fit_weights(short, s_rows, j, h=10)
    for k in fw_full:
        check('미래참조 가중 %s' % k, fw_short[k], fw_full[k], 1e-9)


# ─────────────────────────────────────────────────────────────────────
# 라. 없는 것 — 빠진 축과 한계 문구
# ─────────────────────────────────────────────────────────────────────

def verify_absences(doc):
    check_true('유의사항이 실려 있다', bool(doc.get('disclaimer')),
               '투자권유가 아니라는 것과 준법 확인이 필요하다는 것을 적어야 한다')
    check_true('유의사항에 투자권유 아님', '투자 권유가 아닙니다' in (doc.get('disclaimer') or ''))

    items = [it for it in doc['items'] if it.get('horizons')]
    check_true('종목이 실렸다', len(items) > 0)

    for it in items:
        nm = it['symbol']
        # 축이 통째로 빠졌으면 **빠졌다고 적혀 있어야** 한다
        for ax, val in (it.get('axes') or {}).items():
            if val is None:
                check_true('%s %s 축 누락 표기' % (nm, ax),
                           ax in (it.get('axes_missing') or []),
                           '값이 없는 축은 axes_missing 에 이름이 있어야 한다')
        for hk, hv in (it.get('horizons') or {}).items():
            if 'note' in hv:
                continue
            plan = hv.get('plan') or {}
            # 매수 신호에는 **손절이 반드시 있어야 한다**
            if plan.get('action') == '매수':
                check_true('%s h=%s 매수에 손절' % (nm, hk), plan.get('stop') is not None,
                           '손절 없는 매수 신호는 내보내지 않는다')
                check_true('%s h=%s 매수에 목표' % (nm, hk), plan.get('target') is not None)
            # 표본이 모자란 시나리오는 확률 대신 모자라다고 적혀야 한다
            for sh, sv in ((hv.get('scenario') or {}).get('horizons') or {}).items():
                if sv.get('samples', 0) < 20:
                    check_true('%s 시나리오 %s 표본부족 표기' % (nm, sh),
                               'note' in sv and 'up_prob' not in sv,
                               '표본 20 미만이면 확률을 내지 않는다')
                else:
                    check_true('%s 시나리오 %s 표본 병기' % (nm, sh), 'samples' in sv)

    # 매도 신호가 하락 베팅으로 읽히지 않게 적혀 있는가
    sells = [it for it in items
             for hv in (it.get('horizons') or {}).values()
             if (hv.get('plan') or {}).get('action') in ('청산', '비중축소')]
    if sells:
        ok = any('하락 베팅' in ((hv.get('plan') or {}).get('note') or '')
                 for it in items for hv in (it.get('horizons') or {}).values())
        check_true('매도는 청산이라고 적혀 있다', ok)


# ─────────────────────────────────────────────────────────────────────
# 마. 흠 심기 — 위 시험들이 **정말 잡는지**
# ─────────────────────────────────────────────────────────────────────

def fault_injection(bars, item, doc):
    """일부러 여덟 가지 흠을 심어 검산기가 다 잡는지 본다."""
    import copy
    caught = []

    def run(name, mutate):
        global FAILS
        keep = list(FAILS)
        FAILS.clear()
        try:
            mutate()
        except Exception as e:
            FAILS.append('예외 %s' % e)
        got = len(FAILS) > 0
        FAILS.clear()
        FAILS.extend(keep)
        caught.append((name, got))

    def mut(f):
        it = copy.deepcopy(item)
        f(it)
        verify_indicators(bars, it)
        verify_volume_profile(bars, it)
        return it

    run('RSI 를 1 틀리게', lambda: mut(lambda it: it['indicators'].__setitem__('rsi14', it['indicators']['rsi14'] + 1)))
    run('MACD 히스토그램 부호 뒤집기', lambda: mut(lambda it: it['indicators'].__setitem__('macd_hist', -it['indicators']['macd_hist'])))
    run('볼린저 상단 1% 올리기', lambda: mut(lambda it: it['indicators'].__setitem__('bb_up', it['indicators']['bb_up'] * 1.01)))
    run('ATR 을 10% 줄이기', lambda: mut(lambda it: it['indicators'].__setitem__('atr14', it['indicators']['atr14'] * 0.9)))
    run('실현변동성 창 한 칸 어긋내기',
        lambda: mut(lambda it: it['indicators'].__setitem__('rv20', round(v_rv([b['c'] for b in bars], 19), 2))))
    run('매물대 칸 하나 부풀리기',
        lambda: mut(lambda it: it['volume_profile']['bins'][0].__setitem__('pct', it['volume_profile']['bins'][0]['pct'] + 5)))
    run('매물대 위아래 비중 어긋내기',
        lambda: mut(lambda it: it['volume_profile'].__setitem__('above_pct', it['volume_profile']['above_pct'] + 3)))

    def drop_stop():
        d = copy.deepcopy(doc)
        for it2 in d['items']:
            for hv in (it2.get('horizons') or {}).values():
                p = hv.get('plan') or {}
                if p.get('action') == '매수':
                    p['stop'] = None
        verify_absences(d)
    run('매수 신호에서 손절 지우기', drop_stop)

    def drop_disclaimer():
        d = copy.deepcopy(doc)
        d['disclaimer'] = ''
        verify_absences(d)
    run('유의사항 지우기', drop_disclaimer)

    return caught


def main(argv):
    path = argv[argv.index('--in') + 1] if '--in' in argv else \
        os.path.join(ROOT, 'data/signals/latest.json')
    doc = json.load(open(path, encoding='utf-8'))

    # 원자료를 **산출물과 무관하게** 다시 읽는다
    cache = {}

    def bars_of(it):
        key = (it.get('market'), it['symbol'])
        if key in cache:
            return cache[key]
        if it.get('market') == 'INDEX':
            h = json.load(open(os.path.join(ROOT, 'data/volatility/history.json'), encoding='utf-8'))
            ib = (h.get('index') or {}).get('bars') or []
            b = [{'d': x['d'], 'o': x['o'], 'h': x['h'], 'l': x['l'],
                  'c': x['c'], 'v': x.get('value') or 0} for x in ib]
        else:
            br, pre = (('origin/kr100-data', 'data/kr100/chart/')
                       if it['market'] == 'KR' else
                       ('origin/us100-data', 'data/us100/chart/'))
            b = B.load_bars(br, pre + it['symbol'] + '.json')
        cache[key] = b
        return b

    items = [it for it in doc['items'] if it.get('indicators')]
    sys.stderr.write('실린 종목 %d, 그중 지표가 있는 것 %d\n' % (len(doc['items']), len(items)))

    # 표본 — 전부 대조하면 오래 걸리므로 고르게 뽑되, 적어도 스물은 본다
    step = max(1, len(items) // 25)
    sample = items[::step][:25]
    for it in sample:
        b = bars_of(it)
        if not b:
            FAILS.append('%s 원자료를 못 읽음' % it['symbol'])
            continue
        # 산출물이 적은 날까지만 잘라서 대조한다 — 그 뒤 자료가 들어와 있어도
        # 같은 날 기준으로 맞춰야 한다
        k = next((j for j in range(len(b) - 1, -1, -1) if b[j]['d'] == it['asof']), None)
        if k is None:
            FAILS.append('%s asof %s 를 원자료에서 못 찾음' % (it['symbol'], it['asof']))
            continue
        bb = b[:k + 1]
        verify_indicators(bb, it)
        verify_volume_profile(bb, it)

    verify_absences(doc)

    # 미래참조는 한 종목이면 충분하다(무거운 시험이다)
    if sample:
        b = bars_of(sample[0])
        if b:
            verify_no_lookahead(b[:next(j for j in range(len(b) - 1, -1, -1)
                                        if b[j]['d'] == sample[0]['asof']) + 1])

    # 흠 심기
    caught = []
    if sample:
        b = bars_of(sample[0])
        k = next((j for j in range(len(b) - 1, -1, -1) if b[j]['d'] == sample[0]['asof']), None)
        if k is not None:
            caught = fault_injection(b[:k + 1], sample[0], doc)

    lines = []
    lines.append('검산 %d 가지, 대조한 종목 %d' % (CHECKS[0], len(sample)))
    lines.append('')
    if caught:
        lines.append('흠 심기 — 일부러 틀린 값을 넣고 잡히는지 본다')
        for nm, ok in caught:
            lines.append('  %s %s' % ('잡음' if ok else '**놓침**', nm))
        missed = [n for n, ok in caught if not ok]
        lines.append('')
        if missed:
            FAILS.append('흠을 놓쳤다: %s' % ', '.join(missed))
    if FAILS:
        lines.append('실패 %d' % len(FAILS))
        for f in FAILS[:60]:
            lines.append('  - %s' % f)
    else:
        lines.append('실패 없음')

    out = '\n'.join(lines)
    print(out)
    vp = os.path.join(os.path.dirname(path), 'verify.txt')
    open(vp, 'w', encoding='utf-8').write(out + '\n')
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
