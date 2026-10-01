# -*- coding: utf-8 -*-
"""시나리오 확률과 백테스트 — 「그래서 앞으로 어떻게 되는가」를 과거로 답한다.

두 가지를 한다.

**시나리오.** 오늘과 **같은 국면이던 과거 날들**을 모아, 그 뒤 5·10·20 거래일에
실제로 무슨 일이 있었는지를 센다. 지어낸 확률이 아니라 **센 빈도**다. 같은 국면이
스무 날도 안 되면 확률을 내지 않고 「표본 부족」이라고 적는다 — 열 개 중 셋이
급락이었다고 30% 라 적는 것이 이 일에서 가장 흔한 거짓말이다.

**백테스트.** 둘로 나눠 본다.
  - 경보가 떴을 때 그 뒤가 정말 나빴는가(무조건부 기준선과 견준다)
  - 실제 급락을 **미리** 잡았는가(포착률), 그리고 헛울림은 얼마였는가(오경보율)
둘째가 본령이다. 첫째만 보면 「이미 떨어지는 중이라 경보가 떴고 더 떨어졌다」를
예측으로 착각한다.

문턱을 하나만 정하지 않고 50~85 를 훑어 표로 낸다. 포착률과 정밀도는 맞바꾸는
관계라, 어디에 설지는 쓰는 사람이 정할 일이다.

표준 라이브러리만 쓴다.
"""
import math
import statistics as st

# 이 아래로는 확률을 내지 않는다. 스물은 관대한 자리다 — 셋 가운데 하나가
# 틀려도 확률이 5%p 씩 흔들린다. 그래도 아무 말도 못 하는 것보다는 낫다고 보아
# 스물로 두고, 표본 수를 **언제나 확률 옆에 함께 적는다.**
MIN_SAMPLE = 20

HORIZONS = [5, 10, 20]

# 시나리오 이름과, 그 경계를 **오늘의 변동성 몇 배로** 둘 것인가.
#
# 고정 퍼센트(-5% 따위)로 가르지 않는 까닭 — 연 70% 로 흔들리는 장에서 20일
# ±3% 는 아무 일도 아니고, 연 12% 짜리 장에서는 큰 사건이다. 같은 잣대로 두면
# 변동성이 높던 구간의 날들이 죄다 「급락」으로 분류되어 확률이 부풀려진다.
# 그래서 경계를 그날의 실현변동성으로 재서 σ 단위로 둔다.
SCEN = [
    ('급락', 'crash',   '10거래일 안에 아래로 크게 밀림'),
    ('약세', 'down',    '완만한 하락'),
    ('횡보', 'flat',    '방향 없이 머묾'),
    ('상승', 'up',      '위로 벌어짐'),
]
CRASH_SIGMA = 1.5     # 급락: 기간 중 **저가** 기준 −1.5σ 이하
MOVE_SIGMA = 0.5      # 약세·상승: 종가 기준 ±0.5σ


def sigma_h(rv_ann_pct, h):
    """연율 변동성(%)을 h 거래일 표준편차(%)로 되돌린다."""
    if rv_ann_pct is None:
        return None
    return rv_ann_pct * math.sqrt(h / 252.0)


def forward(bars, j, h):
    """j 일에서 h 거래일 뒤까지 실제로 무슨 일이 있었는가."""
    if j + h >= len(bars):
        return None
    c0 = bars[j]['c']
    seg = bars[j + 1:j + h + 1]
    return {
        'ret': (bars[j + h]['c'] / c0 - 1) * 100,
        'min': (min(b['l'] for b in seg) / c0 - 1) * 100,   # 기간 중 최저 — 저가로 잰다
        'max': (max(b['h'] for b in seg) / c0 - 1) * 100,
    }


def classify(fwd, sg):
    """실제 결과를 네 시나리오 가운데 하나로 가른다.

    급락을 **먼저** 본다. 크게 밀렸다가 되돌아 종가가 제자리인 날은 「횡보」가
    아니다 — 그 사이에 고객이 전화를 건다.
    """
    if sg is None or sg <= 0:
        return None
    if fwd['min'] <= -CRASH_SIGMA * sg:
        return 'crash'
    if fwd['ret'] <= -MOVE_SIGMA * sg:
        return 'down'
    if fwd['ret'] >= MOVE_SIGMA * sg:
        return 'up'
    return 'flat'


def _dist(samples):
    """표본 묶음에서 확률과 분포를 낸다."""
    n = len(samples)
    out = {'n': n}
    if n < MIN_SAMPLE:
        out['insufficient'] = True
        out['min_sample'] = MIN_SAMPLE
        return out
    cnt = {k: 0 for _, k, _ in SCEN}
    for s in samples:
        if s['class'] in cnt:
            cnt[s['class']] += 1
    out['prob'] = {k: round(cnt[k] / n * 100, 1) for k in cnt}
    out['count'] = cnt
    rets = sorted(s['fwd']['ret'] for s in samples)
    mins = sorted(s['fwd']['min'] for s in samples)
    out['ret'] = {
        'median': round(st.median(rets), 2),
        'q25': round(rets[int(n * 0.25)], 2),
        'q75': round(rets[int(n * 0.75)], 2),
        'worst': round(rets[0], 2),
        'best': round(rets[-1], 2),
    }
    out['drawdown'] = {
        'median': round(st.median(mins), 2),
        'worst': round(mins[0], 2),
    }
    return out


def scenarios(bars, rows, i, rv20, horizons=HORIZONS):
    """오늘(i)과 같은 국면이던 과거를 모아 앞일의 분포를 낸다.

    **오늘보다 앞선 날만 쓴다.** 백테스트를 돌릴 때 이 함수가 미래를 보면
    성적이 통째로 거짓이 된다.
    """
    ph = rows[i]['phase']
    out = {'phase': ph, 'horizons': {}}
    if ph is None:
        out['insufficient'] = True
        out['reason'] = '국면을 가를 지표가 아직 모자랍니다'
        return out

    for h in horizons:
        cond, base = [], []
        for j in range(len(bars)):
            if j >= i:
                break                      # 오늘과 미래는 보지 않는다
            fwd = forward(bars, j, h)
            if fwd is None:
                continue
            sg = sigma_h(rv20[j], h)
            cl = classify(fwd, sg)
            if cl is None:
                continue
            rec = {'j': j, 'd': bars[j]['d'], 'fwd': fwd, 'class': cl}
            base.append(rec)
            if rows[j]['phase'] == ph:
                cond.append(rec)

        d = _dist(cond)
        b = _dist(base)
        # 오늘의 변동성으로 환산한 경계 — 화면에서 %로 읽히게 하려는 것이다
        sg_now = sigma_h(rv20[i], h)
        d['thresholds_pct'] = None if not sg_now else {
            'crash': round(-CRASH_SIGMA * sg_now, 1),
            'down': round(-MOVE_SIGMA * sg_now, 1),
            'up': round(MOVE_SIGMA * sg_now, 1),
            'sigma': round(sg_now, 2),
        }
        d['baseline'] = b
        if 'prob' in d and 'prob' in b:
            # **기준선과의 차이가 이 모델이 보태는 전부다.** 급락 확률 12% 는
            # 그 자체로 아무 말도 아니고, 평소가 8% 였다는 것과 나란히 놓아야
            # 비로소 뜻이 생긴다.
            d['lift'] = {k: round(d['prob'][k] - b['prob'][k], 1) for k in d['prob']}
        out['horizons'][str(h)] = d
    return out


# ─────────────────────────────────────────────────────────────────────
# 백테스트
# ─────────────────────────────────────────────────────────────────────

EVENT_WINDOW = 10
LOOKBACK = 5           # 사건 며칠 전까지의 경보를 「미리 잡았다」로 칠 것인가
ALERT_PCT = 80.0       # 경보 문턱 — 점수가 **제 과거의 상위 20%** 에 들면 경보


# 급락 사건을 두 가지로 센다. **둘 다 내고 둘 다 보여 준다.**
#
#   abs   10거래일 안에 −10%. 고객이 실제로 겪는 낙폭이고, 「급락을 미리 알려
#         달라」는 요구가 가리키는 것도 이쪽이다.
#   sigma 10거래일 안에 −1.5σ(그날 실현변동성 기준). 이쪽은 더 엄한 잣대다 —
#         변동성이 높으면 큰 낙폭도 예사이므로 그 몫을 빼고 나서도 실력이
#         남는지를 묻는다.
#
# 둘의 답이 다르다. 이 저장소 자료에서 적응 가중 점수는 abs 기준으로는 기준선을
# 10%p 앞서지만 sigma 기준으로는 앞서지 못한다. 그 말은 **「지수가 크게 빠질
# 국면을 가려낸다」는 맞고 「변동성이 높아진 것 이상을 알아낸다」는 아직 못
# 보였다**는 뜻이다. 한쪽만 실으면 둘 중 하나를 감추게 된다.
EVENT_DROP = 10.0


def find_events(bars, rv20, window=EVENT_WINDOW, mode='abs',
                drop=EVENT_DROP, sigma=CRASH_SIGMA):
    """실제 급락 사건을 집는다.

    **사건이 겹치지 않게 한다.** 한 번 크게 미끄러지는 동안 날마다 조건이
    성립해 사건이 열 개로 세어지면 포착률이 저절로 올라간다. 그래서 사건이
    잡히면 그 국면(저점까지)을 통째로 건너뛴다.
    """
    ev = []
    i = 0
    while i < len(bars) - 1:
        seg = bars[i + 1:i + 1 + window]
        if not seg:
            break
        cut = _cut(rv20, i, window, mode, drop, sigma)
        if cut is None:
            i += 1
            continue
        lows = [b['l'] for b in seg]
        trough = min(lows)
        dd = (trough / bars[i]['c'] - 1) * 100
        if dd <= cut:
            k = i + 1 + lows.index(trough)
            ev.append({'start': i, 'start_date': bars[i]['d'],
                       'trough': k, 'trough_date': bars[k]['d'],
                       'drop_pct': round(dd, 2),
                       'threshold_pct': round(cut, 2),
                       'sessions': k - i})
            i = k + 1            # 저점 다음 날부터 다시 본다
        else:
            i += 1
    return ev


def _cut(rv20, i, window, mode, drop, sigma):
    """i 일에 「급락」이라 부를 낙폭의 경계(%). 음수다."""
    if mode == 'abs':
        return -drop
    sg = sigma_h(rv20[i], window)
    return None if not sg or sg <= 0 else -sigma * sg


def event_def(mode, drop=EVENT_DROP, sigma=CRASH_SIGMA, window=EVENT_WINDOW):
    if mode == 'abs':
        return '이후 %d 거래일 저가가 −%.0f%% 이하 (절대 낙폭)' % (window, drop)
    return '이후 %d 거래일 저가가 −%.1fσ 이하 (그날 변동성 기준)' % (window, sigma)


CUT_WINDOW = 250     # 문턱을 재는 되돌아보기 창(약 1년)
CUT_MIN_OBS = 60


def alert_flags(score, pct=ALERT_PCT, window=CUT_WINDOW, min_obs=CUT_MIN_OBS):
    """경보일을 가린다 — 점수가 **최근 1년의 제 분포** 상위 (100-pct)% 안에 들면 경보.

    「70점 넘으면 경보」처럼 고정된 자리를 쓰지 않는 까닭. 점수는 지표의
    백분위를 모아 만든 값이라 가중치를 바꾸면 분포가 통째로 옮겨 간다.
    같은 70 점이 어떤 셈법에서는 상위 3%, 다른 셈법에서는 상위 30% 다 —
    그러면 두 셈법의 성적을 견줄 수 없다. 상위 몇 %로 두면 **경보를 똑같이
    자주 울리게 맞춘 채** 실력만 견줄 수 있다.

    창을 **고정 길이로 되돌아본다**(처음부터 쌓지 않는다). 처음부터 쌓으면
    점수 분포가 뒤로 갈수록 옮겨 갈 때 문턱이 옛 분포에 붙박여, 상위 20% 로
    두었는데 실제로는 절반이 경보가 되는 일이 생긴다. 실제로 그랬다.

    문턱도 과거만으로 정한다(미래를 보지 않는다).
    """
    n = len(score)
    flags = [False] * n
    cuts = [None] * n
    for i in range(n):
        if score[i] is None:
            continue
        w = sorted(x for x in score[max(0, i - window):i] if x is not None)
        if len(w) < min_obs:
            continue
        cuts[i] = w[min(len(w) - 1, int(len(w) * pct / 100))]
        flags[i] = score[i] >= cuts[i]
    return flags, cuts


def backtest(bars, score, rv20, label='', pct=ALERT_PCT, horizons=HORIZONS,
             window=EVENT_WINDOW, lookback=LOOKBACK, span=None,
             mode='abs', drop=EVENT_DROP):
    """점수 계열 하나를 놓고 성적을 낸다.

    `score` 는 무엇이든 된다 — 균등합산이든 워크포워드든 변동성 축 하나든.
    같은 잣대로 여럿을 재어 견주라고 이렇게 열어 두었다.

    `span` 은 (시작, 끝) 자리 번호다. 여럿을 견줄 때 **평가 구간을 같게
    묶으려고** 둔다 — 계열마다 점수가 시작되는 날이 다르면 겪은 사건 수가
    달라져, 포착률 40% 와 100% 가 나란히 찍혀도 서로 견줄 수 없는 수가 된다.
    """
    flags, cuts = alert_flags(score, pct)
    scored = [i for i in range(len(bars)) if score[i] is not None and cuts[i] is not None]
    if span:
        scored = [i for i in scored if span[0] <= i <= span[1]]
    if not scored:
        return {'insufficient': True, 'reason': '문턱을 세울 만큼 점수가 쌓이지 않았습니다',
                'label': label}

    lo_s, hi_s = scored[0], scored[-1]
    sig = set(i for i in scored if flags[i])
    out = {
        'label': label,
        'alert_pct': pct,
        'threshold_note': '점수가 제 과거 상위 %.0f%% 안에 들면 경보' % (100 - pct),
        'threshold_now': None if cuts[scored[-1]] is None else round(cuts[scored[-1]], 1),
        'scored_sessions': len(scored),
        'from': bars[scored[0]]['d'], 'to': bars[scored[-1]]['d'],
        'signal_days': len(sig),
        'signal_share_pct': round(len(sig) / len(scored) * 100, 1),
    }

    # 가. 경보 뒤 성적 — 기준선과 견준다
    fw = {}
    for h in horizons:
        on, off = [], []
        for i in scored:
            f = forward(bars, i, h)
            if f is None:
                continue
            (on if i in sig else off).append(f)
        e = {'n_signal': len(on), 'n_other': len(off)}
        if len(on) >= MIN_SAMPLE and len(off) >= MIN_SAMPLE:
            e['signal'] = {
                'median_ret': round(st.median([x['ret'] for x in on]), 2),
                'median_drawdown': round(st.median([x['min'] for x in on]), 2),
                'p_drop5': round(sum(1 for x in on if x['min'] <= -5) / len(on) * 100, 1),
            }
            e['other'] = {
                'median_ret': round(st.median([x['ret'] for x in off]), 2),
                'median_drawdown': round(st.median([x['min'] for x in off]), 2),
                'p_drop5': round(sum(1 for x in off if x['min'] <= -5) / len(off) * 100, 1),
            }
            e['gap_drawdown'] = round(e['signal']['median_drawdown']
                                      - e['other']['median_drawdown'], 2)
        else:
            e['insufficient'] = True
            e['min_sample'] = MIN_SAMPLE
        fw[str(h)] = e
    out['forward'] = fw

    # 나. 사건을 미리 잡았는가
    events = find_events(bars, rv20, window, mode, drop)
    lo, hi = lo_s, hi_s
    in_range = []
    for ev in events:
        s = ev['start']
        if not (lo <= s <= hi):
            continue
        hit = [k for k in range(max(0, s - lookback), s + 1) if k in sig]
        in_range.append({'start_date': ev['start_date'], 'trough_date': ev['trough_date'],
                         'drop_pct': ev['drop_pct'], 'threshold_pct': ev['threshold_pct'],
                         'caught': bool(hit),
                         'lead_sessions': (s - hit[0]) if hit else None,
                         'score_at_start': (None if score[s] is None else round(score[s], 1))})

    det = {'events_total': len(events), 'events_in_scored_range': len(in_range),
           'mode': mode, 'event_def': event_def(mode, drop, window=window),
           'window': window, 'lookback_sessions': lookback}
    if in_range:
        c = sum(1 for e in in_range if e['caught'])
        det['caught'] = c
        det['recall_pct'] = round(c / len(in_range) * 100, 1)
        det['median_lead_sessions'] = (round(st.median([e['lead_sessions'] for e in in_range
                                                       if e['lead_sessions'] is not None]), 1)
                                       if any(e['lead_sessions'] is not None for e in in_range)
                                       else None)
    else:
        det['insufficient'] = True
        det['reason'] = '점수가 매겨진 구간 안에 급락 사건이 없습니다'
    det['events'] = in_range
    out['detection'] = det

    # 다. 헛울림 — 경보가 떴는데 아무 일도 없던 비율
    def hit(i):
        f = forward(bars, i, window)
        cut = _cut(rv20, i, window, mode, drop, CRASH_SIGMA)
        return f is not None and cut is not None and f['min'] <= cut

    if sig:
        ok = sum(1 for i in sorted(sig) if hit(i))
        base_ok = sum(1 for i in scored if hit(i))
        prec = ok / len(sig) * 100
        base = base_ok / len(scored) * 100
        out['precision'] = {
            'n_signals': len(sig),
            'followed_by_event_pct': round(prec, 1),
            'false_alarm_pct': round(100 - prec, 1),
            'baseline_pct': round(base, 1),
            'lift_pp': round(prec - base, 1),
            'note': ('경보일로부터 %s 로 셌다. 기준선은 아무 날이나 집었을 때의 같은 비율이다 — '
                     '**리프트가 0 이하면 이 점수는 아무것도 보태지 않은 것이다.**'
                     % event_def(mode, drop, window=window)),
        }
    return out


def compare(bars, series_map, rv20, pct=ALERT_PCT, **kw):
    """여러 점수를 같은 잣대로 재어 나란히 놓는다.

    이 표가 이 도구에서 가장 정직한 자리다. 「네 축을 합쳤다」가 정말 한 축보다
    나은지는 여기서만 드러나고, 실제로 이 저장소 자료에서는 **균등가중 합산이
    변동성 축 하나보다 못하다.** 그 사실을 감추지 않으려고 표로 낸다.
    """
    # 모든 계열이 점수를 갖는 **공통 구간**을 먼저 구한다. 이것을 하지 않으면
    # 늦게 시작하는 계열일수록 겪은 사건이 적어 포착률이 저절로 높아진다 —
    # 실제로 적응 가중이 사건 4건에 100%, 변동성 단독이 9건에 89% 로 찍혀
    # 앞의 것이 나아 보였다. 같은 구간에서 다시 재면 순서가 뒤집힌다.
    starts, ends = [], []
    for _, ser in series_map:
        _, cuts = alert_flags(ser, pct)
        ok = [i for i in range(len(bars)) if ser[i] is not None and cuts[i] is not None]
        if not ok:
            continue
        starts.append(ok[0]); ends.append(ok[-1])
    span = (max(starts), min(ends)) if starts else None

    out = []
    for label, ser in series_map:
        b = backtest(bars, ser, rv20, label=label, pct=pct, span=span, **kw)
        if b.get('insufficient'):
            out.append({'label': label, 'insufficient': True, 'reason': b.get('reason')})
            continue
        d, p = b.get('detection') or {}, b.get('precision') or {}
        out.append({
            'label': label,
            'from': b['from'], 'to': b['to'], 'scored_sessions': b['scored_sessions'],
            'signal_days': b['signal_days'], 'signal_share_pct': b['signal_share_pct'],
            'events': d.get('events_in_scored_range'), 'caught': d.get('caught'),
            'recall_pct': d.get('recall_pct'),
            'median_lead_sessions': d.get('median_lead_sessions'),
            'precision_pct': p.get('followed_by_event_pct'),
            'baseline_pct': p.get('baseline_pct'), 'lift_pp': p.get('lift_pp'),
        })
    return out


def sweep(bars, score, rv20, pcts=(70, 75, 80, 85, 90, 95), **kw):
    """경보를 얼마나 자주 울릴 것인가를 훑는다 — 포착률과 정밀도는 맞바꾼다."""
    out = []
    for p in pcts:
        b = backtest(bars, score, rv20, pct=float(p), **kw)
        if b.get('insufficient'):
            continue
        d, pr = b.get('detection') or {}, b.get('precision') or {}
        out.append({
            'alert_pct': p,
            'top_share': '상위 %d%%' % (100 - p),
            'threshold_now': b.get('threshold_now'),
            'signal_days': b['signal_days'], 'signal_share_pct': b['signal_share_pct'],
            'recall_pct': d.get('recall_pct'),
            'precision_pct': pr.get('followed_by_event_pct'),
            'baseline_pct': pr.get('baseline_pct'), 'lift_pp': pr.get('lift_pp'),
            'median_lead_sessions': d.get('median_lead_sessions'),
        })
    return out
