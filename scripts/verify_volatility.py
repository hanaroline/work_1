# -*- coding: utf-8 -*-
"""실린 수를 원자료에 대고 맞춘다 — 변동성 모델 재검산.

    python3 scripts/verify_volatility.py [data/volatility/latest.json] [data/volatility/history.json]

어긋난 것이 있으면 나가는 값이 1 이다. **산출물을 내기 전에 여기부터 본다.**

이 파일은 `vol_lib` 를 **부르지 않는다.** 같은 함수를 부르면 대조가 아니라 복사가
되기 때문이다. 지표도 점수도 여기서 손으로 다시 셈해 견준다 — 손으로 셈한 것이
틀렸다면 그것도 여기서 드러난다.

무엇을 보는가.

| 갈래 | 보는 것 |
|---|---|
| 가. 자료 | 봉의 날짜 차례·중복·결측, 프록시 검증값(상관·추적오차)을 다시 셈 |
| 나. 지표 | RSI·MACD·볼린저·ATR·실현변동성을 따로 셈해 실린 값과 대조 |
| 다. 점수 | 네 축과 합산 점수를 백분위부터 다시 쌓아 대조 |
| 라. 미래 참조 | **자료를 그날까지만 잘라 다시 셈해도 같은 점수가 나오는가** |
| 마. 시나리오 | 확률의 분모·분자를 세어 대조, 표본 하한이 지켜졌는가 |
| 바. 백테스트 | 사건 수·포착 수·정밀도·기준선을 다시 셈 |
| 사. 없는 것 | 축이 조용히 빠졌는가, 표본이 모자란데 확률이 찍혔는가 |

**라가 이 검산의 핵심이다.** 백테스트 성적이 부풀려지는 가장 흔한 길은 지표가
슬그머니 미래를 보는 것인데, 그건 값을 아무리 들여다봐도 안 보인다. 자료를
잘라서 다시 셈해 보는 것만이 잡아낸다.

**사는 「없는 것」을 보는 묶음이다.** 가~바는 실린 것을 대조하므로 자료가 통째로
빠지면 대조할 것이 없어 조용히 통과한다.

표준 라이브러리만 쓴다.
"""
import os, sys, json, math
import statistics as st

TOL = 0.01          # 실수 대조 허용 오차. 내보낼 때 반올림하므로 그만큼은 벌어진다.
TOL_LOOSE = 0.6     # 백분위·점수처럼 여러 번 반올림된 값

ok_n, bad = 0, []


def check(name, got, want, tol=TOL, note=''):
    global ok_n
    if got is None and want is None:
        ok_n += 1
        return True
    if got is None or want is None:
        bad.append((name, got, want, note or '한쪽이 비었습니다'))
        return False
    if abs(float(got) - float(want)) <= tol:
        ok_n += 1
        return True
    bad.append((name, got, want, note))
    return False


def check_eq(name, got, want, note=''):
    global ok_n
    if got == want:
        ok_n += 1
        return True
    bad.append((name, got, want, note))
    return False


# ─────────────────────────────────────────────────────────────────────
# 손으로 다시 셈하는 지표 — vol_lib 과 다른 길로 쓴다
# ─────────────────────────────────────────────────────────────────────

def v_rsi(c, n=14):
    """Wilder RSI. vol_lib 은 누적 평활로 도는데 여기서는 같은 정의를 그대로 옮긴다."""
    if len(c) <= n:
        return None
    d = [c[i] - c[i - 1] for i in range(1, len(c))]
    ag = sum(x for x in d[:n] if x > 0) / n
    al = sum(-x for x in d[:n] if x < 0) / n
    for x in d[n:]:
        ag = (ag * (n - 1) + (x if x > 0 else 0)) / n
        al = (al * (n - 1) + (-x if x < 0 else 0)) / n
    return 100.0 if al == 0 else 100 - 100 / (1 + ag / al)


def v_ema_last(xs, n):
    if len(xs) < n:
        return None
    k = 2.0 / (n + 1)
    e = sum(xs[:n]) / n
    for x in xs[n:]:
        e = x * k + e * (1 - k)
    return e


def v_macd(c):
    """MACD 선·신호·히스토그램의 마지막 값."""
    ef = [v_ema_last(c[:i + 1], 12) for i in range(len(c))]
    es = [v_ema_last(c[:i + 1], 26) for i in range(len(c))]
    line = [(a - b) if (a is not None and b is not None) else None for a, b in zip(ef, es)]
    have = [x for x in line if x is not None]
    sig = v_ema_last(have, 9)
    return line[-1], sig, (line[-1] - sig) if (line[-1] is not None and sig is not None) else None


def v_boll(c, n=20, k=2.0):
    w = c[-n:]
    m = sum(w) / n
    sd = st.stdev(w)
    up, lo = m + k * sd, m - k * sd
    return m, up, lo, (up - lo) / m * 100, (c[-1] - lo) / (up - lo)


def v_atr(o, h, l, c, n=14):
    tr = []
    for i in range(len(c)):
        tr.append(h[i] - l[i] if i == 0 else
                  max(h[i] - l[i], abs(h[i] - c[i - 1]), abs(l[i] - c[i - 1])))
    a = sum(tr[:n]) / n
    for x in tr[n:]:
        a = (a * (n - 1) + x) / n
    return a


def v_rv(c, n):
    """연율 실현변동성 — **최근 n개의 수익률**(종가 n+1개)을 쓴다.

    처음에 종가를 n 개 집어 수익률 n−1 개로 셌다가 여기서 걸렸다. 「20일
    변동성」은 20일치 수익률이지 20일치 종가가 아니다 — 하루 차이지만 큰 날이
    하나 들고 나면서 41.4% 와 35.7% 로 갈렸다.
    """
    r = [math.log(c[i] / c[i - 1]) for i in range(len(c) - n, len(c))]
    return st.stdev(r) * math.sqrt(252) * 100


def v_pct_rank(series, i, window=252, min_obs=60):
    v = series[i]
    if v is None:
        return None
    w = [x for x in series[max(0, i - window + 1):i + 1] if x is not None]
    if len(w) < min_obs:
        return None
    return (sum(1 for x in w if x < v) + 0.5 * sum(1 for x in w if x == v)) / len(w) * 100


# ─────────────────────────────────────────────────────────────────────

def main(argv):
    lat_p = argv[0] if argv else 'data/volatility/latest.json'
    his_p = argv[1] if len(argv) > 1 else 'data/volatility/history.json'
    L = json.load(open(lat_p, encoding='utf-8'))
    H = json.load(open(his_p, encoding='utf-8'))
    bars = H['index']['bars']
    o = [b['o'] for b in bars]; h = [b['h'] for b in bars]
    lo = [b['l'] for b in bars]; c = [b['c'] for b in bars]

    # i — 실린 값이 어느 날의 것인가
    i = next((k for k, b in enumerate(bars) if b['d'] == L['asof']), None)
    if i is None:
        print('!! latest.json 의 asof(%s) 가 이력에 없습니다' % L['asof'])
        return 1
    print('· 대조 기준일 %s (봉 %d/%d)' % (L['asof'], i + 1, len(bars)))

    # ── 가. 자료 ──────────────────────────────────────────────────
    ds = [b['d'] for b in bars]
    check_eq('가.날짜 오름차순', ds == sorted(ds), True)
    check_eq('가.날짜 중복 없음', len(set(ds)), len(ds))
    check_eq('가.빈 봉 없음',
             sum(1 for b in bars if None in (b['o'], b['h'], b['l'], b['c'])), 0)
    check_eq('가.고가≥저가', sum(1 for b in bars if b['h'] < b['l']), 0)
    check_eq('가.종가가 고저 사이',
             sum(1 for b in bars if not (b['l'] - 1e-6 <= b['c'] <= b['h'] + 1e-6)), 0)

    # 프록시 검증값을 다시 셈한다
    val = H['index']['validation']
    P = {b['d']: b['c'] for b in bars}
    R = {r['d']: r['c'] for r in H.get('real_kospi') or []}
    ov = sorted(set(P) & set(R))
    pr = [R[b] / R[a] - 1 for a, b in zip(ov, ov[1:])]
    pi = [P[b] / P[a] - 1 for a, b in zip(ov, ov[1:])]
    check_eq('가.겹친 수익률 쌍 수', len(pr), val.get('return_pairs'))
    if len(pr) >= 10:
        mr, mi = st.mean(pr), st.mean(pi)
        sr, si = st.pstdev(pr), st.pstdev(pi)
        cov = sum((x - mr) * (y - mi) for x, y in zip(pr, pi)) / len(pr)
        check('가.일간수익률 상관', cov / (sr * si), val.get('corr_daily_return'), 0.0002)
        check('가.추적오차(%)', st.pstdev([x - y for x, y in zip(pr, pi)]) * 100,
              val.get('tracking_error_pct'), 0.002)
        if (val.get('corr_daily_return') or 0) < 0.97:
            bad.append(('가.프록시 자격', val.get('corr_daily_return'), '≥0.97',
                        '상관이 낮아 코스피를 대신할 수 없습니다'))

    # ── 나. 지표 ──────────────────────────────────────────────────
    I = L['indicators']
    cc, oo, hh, ll = c[:i + 1], o[:i + 1], h[:i + 1], lo[:i + 1]
    check('나.RSI(14)', v_rsi(cc), I.get('rsi14'))
    ml, ms, mh = v_macd(cc)
    check('나.MACD 선', ml, I.get('macd'), 0.05)
    check('나.MACD 신호', ms, I.get('macd_signal'), 0.05)
    check('나.MACD 히스토그램', mh, I.get('macd_hist'), 0.05)
    bm, bu, bl, bw, pb = v_boll(cc)
    check('나.볼린저 중심', bm, I.get('bb_mid'), 0.05)
    check('나.볼린저 상단', bu, I.get('bb_up'), 0.05)
    check('나.볼린저 하단', bl, I.get('bb_lo'), 0.05)
    check('나.밴드폭(%)', bw, I.get('bbw'))
    check('나.%b', pb, I.get('pctb'))
    check('나.ATR(14)', v_atr(oo, hh, ll, cc), I.get('atr14'), 0.05)
    check('나.ATR 비율(%)', v_atr(oo, hh, ll, cc) / cc[-1] * 100, I.get('atrp'))
    for n, key in ((5, 'rv5'), (20, 'rv20'), (60, 'rv60')):
        check('나.실현변동성 %d일' % n, v_rv(cc, n), I.get(key), 0.02)
    check('나.MA20', sum(cc[-20:]) / 20, I.get('ma20'), 0.05)
    check('나.MA60', sum(cc[-60:]) / 60, I.get('ma60'), 0.05)
    check('나.20일 이격도(%)', cc[-1] / (sum(cc[-20:]) / 20) * 100 - 100, I.get('disparity20'))
    check('나.20일 수익률(%)', (cc[-1] / cc[-21] - 1) * 100, I.get('ret20'))
    check('나.60일 고점 대비(%)', (cc[-1] / max(cc[-60:]) - 1) * 100, I.get('drawdown60'))

    # ── 다. 점수 ──────────────────────────────────────────────────
    # 축을 이루는 조각(parts)이 그 축 점수의 평균인가 — 합산 규칙을 대조한다
    for key, ko in (('volatility', '변동성'), ('compression', '가격압축'),
                    ('momentum', '모멘텀'), ('flow', '자금수급')):
        a = L['score']['axes'][key]
        parts = [v for v in (a.get('parts') or {}).values() if v is not None]
        if a.get('score') is None:
            check_eq('다.%s 축이 비면 조각도 없다' % ko, len(parts), 0,
                     '점수가 없는데 조각이 남아 있습니다')
        elif parts:
            check('다.%s 축 = 조각 평균' % ko, sum(parts) / len(parts), a['score'], TOL_LOOSE)

    # 합산이 가중치대로인가
    s = L['score']
    w = s.get('adaptive_weights') or {}
    if w:
        tot = sum(w.values())
        check('다.가중치 합 = 1', tot, 1.0, 0.002)
        acc = 0.0
        for k, wt in w.items():
            sc = (s['axes'].get(k) or {}).get('score')
            if sc is None:
                bad.append(('다.가중치는 있는데 축이 빔', k, None, '있을 수 없는 짝입니다'))
                continue
            acc += wt * sc
        check('다.합산 = Σ(가중치×축)', acc, s['total'], TOL_LOOSE)

    # 등급이 자기 백분위대로 붙었는가
    tl = L.get('timeline') or []
    if s.get('self_pct') is not None:
        cuts = [(95, '위험'), (85, '경계'), (70, '주의'), (40, '관심'), (0, '안정')]
        want = next(nm for cut, nm in cuts if s['self_pct'] >= cut)
        check_eq('다.등급', s.get('grade'), want)

    # ── 라. 미래 참조 ─────────────────────────────────────────────
    # **자료를 그날까지만 잘라도 같은 값이 나와야 한다.**
    # 지표가 슬그머니 미래를 보면 여기서 걸린다.
    for back in (0, 5, 20):
        k = i - back
        if k < 80:
            continue
        cut_c = c[:k + 1]
        row = next((r for r in tl if r['d'] == bars[k]['d']), None)
        if row is None:
            continue
        check('라.RSI 재현(%s)' % bars[k]['d'], v_rsi(cut_c), row.get('rsi'), 0.06)
        check('라.밴드폭 재현(%s)' % bars[k]['d'], v_boll(cut_c)[3], row.get('bbw'), 0.06)
        check('라.실현변동성 재현(%s)' % bars[k]['d'], v_rv(cut_c, 20), row.get('rv20'), 0.06)
        _, _, mhk = v_macd(cut_c)
        check('라.MACD 히스토그램 재현(%s)' % bars[k]['d'], mhk, row.get('macd_hist'), 0.06)

    # 백분위도 미래를 보지 않는가 — 밴드폭 백분위를 직접 쌓아 본다
    bws = []
    for k in range(len(bars)):
        bws.append(v_boll(c[:k + 1])[3] if k >= 19 else None)
    p_now = v_pct_rank(bws, i)
    if p_now is not None:
        cpart = (L['score']['axes']['compression'].get('parts') or {}).get('bbw_inv')
        check('라.밴드폭 백분위(뒤집은 값)', 100 - p_now, cpart, TOL_LOOSE)

    # ── 마. 시나리오 ──────────────────────────────────────────────
    sc = L.get('scenarios') or {}
    cfg = L.get('config') or {}
    for hz, d in (sc.get('horizons') or {}).items():
        if d.get('insufficient'):
            check_eq('마.%s일 표본 부족 판정' % hz, d['n'] < cfg.get('min_sample', 20), True,
                     '표본이 하한을 넘는데 부족으로 적혔습니다')
            continue
        if 'prob' not in d:
            continue
        # 표본 하한이 지켜졌는가
        check_eq('마.%s일 표본 하한' % hz, d['n'] >= cfg.get('min_sample', 20), True,
                 '표본이 %d 뿐인데 확률이 찍혔습니다' % d['n'])
        # 확률의 합이 100 인가, 개수와 맞는가
        check('마.%s일 확률 합' % hz, sum(d['prob'].values()), 100.0, 0.4)
        check_eq('마.%s일 분류 개수 합' % hz, sum(d['count'].values()), d['n'])
        for k, cnt in d['count'].items():
            check('마.%s일 %s 확률=개수/표본' % (hz, k), cnt / d['n'] * 100, d['prob'][k], 0.06)
        # 리프트가 조건부−무조건부인가
        for k in d.get('lift', {}):
            check('마.%s일 %s 리프트' % (hz, k),
                  d['prob'][k] - d['baseline']['prob'][k], d['lift'][k], 0.11)
        # 경계가 그날 변동성의 σ 배인가
        t = d.get('thresholds_pct') or {}
        if t and I.get('rv20'):
            sg = I['rv20'] * math.sqrt(int(hz) / 252.0)
            check('마.%s일 1σ' % hz, sg, t.get('sigma'), 0.02)
            check('마.%s일 급락 경계' % hz, -cfg.get('crash_sigma', 1.5) * sg, t.get('crash'), 0.06)

    # ── 바. 백테스트 ──────────────────────────────────────────────
    for mode in ('abs', 'sigma'):
        bt = (L.get('backtest') or {}).get(mode) or {}
        det = bt.get('detection') or {}
        ev = det.get('events') or []
        if ev:
            check_eq('바.%s 사건 수' % mode, len(ev), det.get('events_in_scored_range'))
            check_eq('바.%s 포착 수' % mode, sum(1 for e in ev if e['caught']), det.get('caught'))
            if det.get('recall_pct') is not None:
                check('바.%s 포착률' % mode,
                      sum(1 for e in ev if e['caught']) / len(ev) * 100, det['recall_pct'], 0.06)
            # 사건이 겹치지 않는가 — 저점 뒤에 다음 사건이 서야 한다
            for a, b in zip(ev, ev[1:]):
                if b['start_date'] <= a['trough_date']:
                    bad.append(('바.%s 사건 겹침' % mode, b['start_date'], '> ' + a['trough_date'],
                                '한 번의 하락이 여러 건으로 세어졌습니다'))
            # 실린 낙폭이 실제 봉과 맞는가
            for e in ev[:12]:
                k = next((x for x, b in enumerate(bars) if b['d'] == e['start_date']), None)
                if k is None:
                    continue
                seg = bars[k + 1:k + 1 + (det.get('window') or 10)]
                if not seg:
                    continue
                dd = (min(b['l'] for b in seg) / bars[k]['c'] - 1) * 100
                check('바.%s 낙폭(%s)' % (mode, e['start_date']), dd, e['drop_pct'], 0.02)
        pr_ = bt.get('precision') or {}
        if pr_:
            check('바.%s 헛울림+적중=100' % mode,
                  pr_['followed_by_event_pct'] + pr_['false_alarm_pct'], 100.0, 0.11)
            check('바.%s 리프트' % mode,
                  pr_['followed_by_event_pct'] - pr_['baseline_pct'], pr_['lift_pp'], 0.11)

    # 견주는 표는 **같은 구간**이어야 한다
    for mode, rows in (L.get('compare') or {}).items():
        rs = [r for r in rows if not r.get('insufficient')]
        if len(rs) > 1:
            check_eq('바.%s 비교 구간이 같다' % mode,
                     len(set((r['from'], r['to'], r['events']) for r in rs)), 1,
                     '계열마다 평가 구간이 달라 견줄 수 없습니다')

    # ── 사. 없는 것 ───────────────────────────────────────────────
    cov = L.get('coverage') or {}
    unfit = s.get('adaptive_unfitted') or []
    notes = L.get('notes') or []
    kinds = set(n.get('kind') for n in notes)
    # **글월을 낱말로 찾지 않는다.** 처음에 「'표본'이라는 말이 어딘가 있는가」로
    # 보았더니, 한계 문장을 통째로 지워도 시나리오 문장에 든 「같은 국면 표본
    # 21일」이 걸려 검사가 통과했다. 갈래(kind)로 본다.
    for k in unfit:
        # 점수에 못 들어간 축은 가중치에도 없어야 한다
        check_eq('사.%s 축이 가중치에서 빠졌다' % k, k in w, False,
                 '표본이 모자라다면서 가중치에 들어 있습니다')
        check_eq('사.%s 축이 빠진 사실을 적었다' % k, '가중치' in kinds, True,
                 '축이 조용히 빠졌습니다 — 화면이 안전하다고 잘못 읽힙니다')
        # 그 축이 위험을 가리키는데 점수에 없다면 따로 경고해야 한다
        sc_k = (s['axes'].get(k) or {}).get('score')
        if sc_k is not None and sc_k >= 70:
            check_eq('사.%s 축(%.0f점)을 따로 경고했다' % (k, sc_k), '별도경고' in kinds, True,
                     '점수에 안 든 축이 70점을 넘는데 따로 알리지 않았습니다')
    # 축이 넷 다 비면 점수가 있을 수 없다
    have_ax = sum(1 for a in s['axes'].values() if a.get('score') is not None)
    check_eq('사.축이 하나도 없으면 점수도 없다',
             (have_ax == 0 and s.get('total') is not None), False)
    # 자료가 아예 안 들어온 축이 있는가 (있으면 알린다 — 흠은 아니다)
    empty = [k for k, a in s['axes'].items() if a.get('score') is None]
    # 이력이 얕으면 성적을 믿지 말라고 적었는가
    n_ev = (((L.get('backtest') or {}).get('abs') or {}).get('detection') or {}).get(
        'events_in_scored_range', 0)
    if n_ev < 20:
        check_eq('사.표본이 얕다는 것을 적었다', '한계' in kinds, True,
                 '급락 표본이 %d 건뿐인데 한계 문장이 없습니다' % n_ev)
    # 백테스트를 실었다면 실력 문장도 있어야 한다 — 성적만 표로 두고 말을 안 하면
    # 화면을 급히 넘기는 사람이 「검증된 모델」로 읽는다
    if n_ev:
        check_eq('사.실력을 문장으로도 적었다', '실력' in kinds, True)

    # ── 결과 ──────────────────────────────────────────────────────
    print('맞은 짝 %d개' % ok_n)
    print('어긋난 짝 %d개' % len(bad))
    for name, got, want, note in bad:
        print('\n  ! %s' % name)
        print('    판=%s  자료=%s' % (got, want))
        if note:
            print('    %s' % note)

    print()
    print('— 참고 (흠이 아니라 형편) —')
    print('  지수 %d 세션, 점수 %d 일, 수급 %d 일, VIX %d 일'
          % (cov.get('index_sessions', 0), cov.get('scored_sessions', 0),
             cov.get('flow_sessions', 0), cov.get('vix_sessions', 0)))
    print('  급락 사건 %d 건 — 스물이 안 되면 포착률의 오차가 큽니다' % n_ev)
    if empty:
        print('  값이 없어 빈 축: %s' % ', '.join(empty))
    if unfit:
        print('  표본이 모자라 점수에 못 든 축: %s' % ', '.join(unfit))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
