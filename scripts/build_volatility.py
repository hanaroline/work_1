# -*- coding: utf-8 -*-
"""네 축을 합쳐 경보 점수·시나리오·백테스트를 낸다 — data/volatility/latest.json

    python3 scripts/build_vol_history.py      # 먼저 이력을 모으고
    python3 scripts/build_volatility.py       # 그 위에서 셈한다

화면(docs/volatility/index.html)이 읽는 파일 하나를 만든다. 화면은 셈을 하지
않는다 — 브라우저에서 다시 셈하면 검산 스크립트가 대조할 자리가 없어진다.

내보내는 것.
  score      오늘의 합산 경보 점수와 네 축, 국면
  indicators 오늘의 지표 값 원본(화면에 그대로 찍히는 수)
  timeline   최근 구간의 날짜별 점수·축·종가 (그림용)
  scenarios  같은 국면이던 과거의 이후 5·10·20일 실제 분포
  backtest   문턱별 포착률·오경보율, 잡은 사건 목록
  notes      고객 응대에 쓸 문장 — **모두 위 수치에서 조립한 것**이다

문장을 짓는 모델은 여기 없다. 러너에 모델이 없기도 하고, 지어낸 문장이 수치
자리에 앉는 것이 이 일에서 가장 위험한 흠이기 때문이다. 아래 `notes` 는 셈한
값을 틀에 끼워 만든 것이고, 틀마다 근거가 되는 수를 함께 싣는다.
"""
import os, sys, json, datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vol_lib as V
import vol_backtest as B

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = datetime.timezone(datetime.timedelta(hours=9))
TIMELINE_DAYS = 260          # 그림에 싣는 구간. 파일이 커지면 화면이 느려진다.


def log(*a):
    print(*a, file=sys.stderr)


# 파일에 적을 때마다 바뀌는 칸. 내용을 견줄 때는 빼고 본다.
VOLATILE = ('generated_at_kst',)


def write_if_changed(path, doc, volatile=VOLATILE):
    """**바뀐 것이 시각뿐이면 파일을 건드리지 않는다.**

    까닭은 build_vol_history.py 의 같은 함수에 적어 두었다 — 요약하면, 이 갱신은
    하루에 예닐곱 번 도는데 지수 일봉이 그대로면 모델도 그대로라 `generated_at_kst`
    한 칸만 달라진 판이 매번 커밋됐다. 게다가 줄바꿈 없는 한 줄 JSON 이라 git 이
    줄 델타를 못 만들어, 한 글자가 달라도 80KB 가 통째로 새로 쌓인다.
    """
    new = {k: v for k, v in doc.items() if k not in volatile}
    if os.path.exists(path):
        try:
            old = json.load(open(path, encoding='utf-8'))
            if {k: v for k, v in old.items() if k not in volatile} == new:
                return False
        except ValueError:
            pass                      # 깨진 파일이면 새로 쓴다
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
    return True


# ─────────────────────────────────────────────────────────────────────
# 수급 계열을 지수 날짜에 맞춰 세운다
# ─────────────────────────────────────────────────────────────────────

def align_flows(bars, flows):
    """날짜로 맞춘다. 없는 날은 None 이다 — **앞 값으로 메우지 않는다.**

    수급은 하루치가 그날의 사실이라, 빠진 날을 앞 값으로 채우면 있지도 않은
    순매수를 만들어 내는 셈이 된다. 누적도 창이 다 차야만 셈한다.
    """
    idx = {b['d']: i for i, b in enumerate(bars)}
    n = len(bars)
    col = lambda: [None] * n

    foreign, inst, retail = col(), col(), col()
    for r in flows.get('investors') or []:
        i = idx.get(r['d'])
        if i is not None:
            foreign[i] = r.get('foreign')
            inst[i] = r.get('institution')
            retail[i] = r.get('retail')

    deposit, credit = col(), col()
    for r in flows.get('money') or []:
        i = idx.get(r['d'])
        if i is not None:
            deposit[i] = r.get('deposit')
            credit[i] = r.get('credit')

    def cum(series, w):
        out = [None] * n
        for i in range(w - 1, n):
            win = series[i - w + 1:i + 1]
            if all(x is not None for x in win):
                out[i] = sum(win)
        return out

    def chg(series, w):
        """w일 전 대비 증감률(%). 예탁금·신용은 잔액이라 차이를 봐야 한다."""
        out = [None] * n
        for i in range(w, n):
            a, b = series[i], series[i - w]
            if a is not None and b:
                out[i] = (a / b - 1) * 100
        return out

    return {
        'foreign': foreign, 'inst': inst, 'retail': retail,
        'deposit': deposit, 'credit': credit,
        'foreign_cum5': cum(foreign, 5), 'foreign_cum20': cum(foreign, 20),
        'inst_cum5': cum(inst, 5),
        'deposit_chg20': chg(deposit, 20), 'credit_chg20': chg(credit, 20),
    }


def aux_percentiles(bars, aux):
    """VIX 를 지수 날짜에 맞추고 백분위를 낸다.

    두 달치뿐이라 백분위 표본(60)에 못 미치는 날이 대부분이다 — 그런 날은
    None 이 나오고 변동성 축은 나머지 셋으로만 셈한다. 스냅숏이 쌓이면
    저절로 살아난다.
    """
    idx = {b['d']: i for i, b in enumerate(bars)}
    n = len(bars)
    vix = [None] * n
    for r in aux.get('vix') or []:
        i = idx.get(r['d'])
        if i is not None:
            vix[i] = r['c']
    out = {}
    for i in range(n):
        p = V.pct_rank(vix, i, window=252, min_obs=40)
        if p is not None:
            out[i] = {'vix_pct': p}
    return out, vix


# ─────────────────────────────────────────────────────────────────────
# 문장 조립
# ─────────────────────────────────────────────────────────────────────

def build_notes(cur, ind, i, scen, bt, flow_cov, total, self_pct, alert, weights,
                absent, fit, flow_in_score, total_ex_flow):
    """고객 응대용 문장. 틀에 수를 끼운 것이고, 근거 수를 함께 싣는다."""
    out = []
    g = V.grade_of(self_pct)
    ph = V.PHASES.get(cur['phase'])

    txt = '경보 점수 %.0f점 — %s' % (total, g or '등급 미정')
    if self_pct is not None:
        txt += ' (두 해 이력의 상위 %.0f%%)' % (100 - self_pct)
    txt += '. ' + (ph[1] if ph else '')
    out.append({
        'kind': '판정',
        'text': txt,
        'basis': {'total': round(total, 1), 'grade': g,
                  'self_pct': None if self_pct is None else round(self_pct, 1),
                  'alert': alert, 'phase': cur['phase'],
                  'axes': {k: (None if cur[v] is None else round(cur[v], 1))
                           for k, v in (('변동성', 'v'), ('압축', 'c'),
                                        ('모멘텀', 'm'), ('수급', 'f'))}},
    })

    ko = {'volatility': '변동성', 'compression': '가격압축',
          'momentum': '모멘텀', 'flow': '자금수급'}
    if weights:
        top = sorted(weights.items(), key=lambda x: -x[1])
        s = '지금 가중치는 ' + ', '.join('%s %.0f%%' % (ko[k], w * 100) for k, w in top)
        # 가중치가 무엇에서 왔는지 갈라 적는다. 「잰 값」과 「사전값」을 뭉뚱그리면
        # 재어 보지도 않은 축의 가중치를 실력으로 읽는다.
        thin = [ko[k] for k in weights
                if (fit.get(k) or {}).get('lambda', 0) < 0.35]
        if thin:
            s += ('. 다만 %s 축은 표본이 얕아 **잰 값이 아니라 사전값(균등 25%%)이 '
                  '거의 그대로 들어간 것**입니다 — 실력을 확인한 가중치가 아닙니다'
                  % '·'.join(thin))
        out.append({'kind': '가중치', 'text': s + '.',
                    'basis': {'weights': weights,
                              'lambda': {k: (fit.get(k) or {}).get('lambda') for k in weights},
                              'thin': thin}})

    # 증거가 얕은 축이 위험을 가리키면 그것부터 말한다. 이제는 점수에 **들어가
    # 있지만**, 그 몫이 사전값에서 온 것이라는 사실은 따로 알려야 한다.
    for k, wt in sorted((weights or {}).items(), key=lambda x: -x[1]):
        key = {'volatility': 'v', 'compression': 'c', 'momentum': 'm', 'flow': 'f'}[k]
        val = cur[key]
        lam = (fit.get(k) or {}).get('lambda', 1.0)
        if val is not None and val >= 70 and lam < 0.35:
            out.append({
                'kind': '별도경고',
                'text': ('%s 축이 %.0f점으로 높고, 가중치 %.0f%%로 점수에 들어가 있습니다. '
                         '다만 이 축은 자료가 %d 일뿐이라 **그 가중치가 사전값에서 온 것**이고 '
                         '과거 실적으로 확인된 것이 아닙니다 — 점수 하나로 갈음하지 말고 '
                         '이 축을 직접 보십시오.'
                         % (ko[k], val, wt * 100, flow_cov)),
                'basis': {'axis': ko[k], 'score': round(val, 1), 'weight': round(wt, 4),
                          'lambda': lam, 'sessions': flow_cov},
            })

    # 수급이 점수를 얼마나 밀어올렸는지, 그리고 그 점수를 견주는 이력이 어떤
    # 판인지. 둘을 함께 적지 않으면 「57점」이 두 해 내내 같은 셈법으로 나온
    # 값인 줄로 읽힌다.
    if total_ex_flow is not None and cur['f'] is not None:
        out.append({
            'kind': '수급반영',
            'text': ('수급 축을 넣어 점수가 %.0f점에서 **%.0f점**이 됐습니다(%+.0f점). '
                     '다만 수급이 점수에 들어간 날은 두 해 이력 가운데 %d 일뿐이라, '
                     '문턱과 백분위를 재는 이력의 대부분은 수급이 빠진 판입니다 — '
                     '오늘 점수를 그 이력과 견줄 때 이만큼 감안하십시오.'
                     % (total_ex_flow, total, total - total_ex_flow, flow_in_score)),
            'basis': {'total': round(total, 1), 'without_flow': round(total_ex_flow, 1),
                      'delta': round(total - total_ex_flow, 1),
                      'flow_in_score_sessions': flow_in_score},
        })

    # 그날 값이 아예 없어 빠진 축이 있으면 적는다
    if absent:
        out.append({
            'kind': '한계',
            'text': ('%s 축은 오늘 값이 없어 점수에서 빠졌습니다 — 남은 축의 가중치를 다시 '
                     '나눠 셈했습니다.' % '·'.join(ko[k] for k in absent)),
            'basis': {'absent': absent, 'weights': weights},
        })

    # 점수를 끌어올린 축이 무엇인가 — 점수에 실제로 들어간 축 가운데서 고른다.
    inside = set(weights or {})
    axes = [('volatility', cur['v'], '변동성', '이미 흔들리는 폭이 제 이력의 위쪽에 있습니다'),
            ('compression', cur['c'], '가격압축', '밴드가 좁아졌습니다 — 방향은 아직 없고 힘만 쌓인 자리입니다'),
            ('momentum', cur['m'], '모멘텀', '추세가 아래로 기울었습니다'),
            ('flow', cur['f'], '자금수급', '자금이 빠지는 쪽입니다')]
    cand = [a for a in axes if a[1] is not None and a[0] in inside and (weights or {}).get(a[0], 0) > 0]
    if cand:
        top = max(cand, key=lambda x: x[1])
        out.append({'kind': '주도축',
                    'text': '점수에 든 축 가운데 %s이 %.0f점으로 가장 높습니다 — %s'
                            % (top[2], top[1], top[3]),
                    'basis': {'axis': top[2], 'score': round(top[1], 1)}})

    # 시나리오 — 10거래일을 대표로 싣는다
    h10 = (scen.get('horizons') or {}).get('10') or {}
    if h10.get('prob') and h10.get('thresholds_pct'):
        t = h10['thresholds_pct']
        p = h10['prob']['crash']
        b = h10['baseline']['prob']['crash'] if h10.get('baseline', {}).get('prob') else None
        s = ('앞으로 10거래일 안에 %.1f%% 이상 밀릴 확률은 과거 같은 국면에서 %.0f%% 였습니다'
             % (abs(t['crash']), p))
        if b is not None:
            s += ' (아무 날이나 집었을 때는 %.0f%%)' % b
        s += '. 같은 국면 표본 %d 일.' % h10['n']
        out.append({'kind': '시나리오', 'text': s,
                    'basis': {'horizon': 10, 'crash_pct': p, 'baseline_pct': b,
                              'n': h10['n'], 'threshold_pct': t['crash']}})
    elif h10.get('insufficient'):
        out.append({'kind': '시나리오',
                    'text': '같은 국면이던 과거가 %d 일뿐이라 확률을 내지 않습니다 (최소 %d 일).'
                            % (h10.get('n', 0), h10.get('min_sample', B.MIN_SAMPLE)),
                    'basis': {'n': h10.get('n', 0)}})

    # 백테스트가 말해 주는 이 문턱의 실력
    ab = (bt or {}).get('abs') or {}
    det = ab.get('detection') or {}
    pr = ab.get('precision') or {}
    if det.get('recall_pct') is not None:
        out.append({
            'kind': '실력',
            'text': ('이 문턱은 두 해 가운데 점수가 매겨진 구간(%s~%s)의 급락 %d 건 '
                     '— 10거래일 안에 10%% 이상 밀린 경우 — 가운데 %d 건을 중앙값 %s거래일 앞서 잡았습니다. '
                     '경보가 뜬 날의 %.0f%% 가 실제로 급락으로 이어졌고, 아무 날이나 집었을 때는 '
                     '%.0f%% 였습니다(리프트 %+.1f%%p).'
                     % (ab.get('from', ''), ab.get('to', ''), det['events_in_scored_range'],
                        det['caught'], det.get('median_lead_sessions'),
                        pr.get('followed_by_event_pct', 0), pr.get('baseline_pct', 0),
                        pr.get('lift_pp', 0))),
            'basis': {'recall_pct': det['recall_pct'],
                      'events': det['events_in_scored_range'], 'caught': det['caught'],
                      'precision_pct': pr.get('followed_by_event_pct'),
                      'baseline_pct': pr.get('baseline_pct'), 'lift_pp': pr.get('lift_pp')},
        })
        sg = ((bt or {}).get('sigma') or {}).get('precision') or {}
        out.append({
            'kind': '한계',
            'text': ('세 가지를 분명히 해 두십시오. (1) 경보는 **방향을 맞히는 장치가 아니라 대비를 '
                     '앞당기는 장치**입니다 — 경보 뒤 %.0f%% 는 급락으로 가지 않았습니다. '
                     '(2) 낙폭을 그날 변동성으로 나눠 재면(σ 기준) 리프트가 %+.1f%%p 로, '
                     '**「변동성이 높아졌다」는 것 이상을 알아낸다고는 아직 말하지 못합니다.** '
                     '(3) 급락 표본이 %d 건뿐이라 포착률 %.0f%% 의 오차가 큽니다.'
                     % (pr.get('false_alarm_pct', 0), sg.get('lift_pp', 0),
                        det['events_in_scored_range'], det['recall_pct'])),
            'basis': {'events': det['events_in_scored_range'],
                      'false_alarm_pct': pr.get('false_alarm_pct'),
                      'sigma_lift_pp': sg.get('lift_pp')},
        })
    return out


# ─────────────────────────────────────────────────────────────────────

def main(argv):
    hist_path = 'data/volatility/history.json'
    out_path = 'data/volatility/latest.json'
    threshold = 80.0          # 경보 문턱 — 점수가 제 과거 상위 20% 안에 들면 경보
    for k, a in enumerate(argv):
        if a == '--history':
            hist_path = argv[k + 1]
        elif a == '--out':
            out_path = argv[k + 1]
        elif a == '--threshold':
            threshold = float(argv[k + 1])

    hist = json.load(open(os.path.join(ROOT, hist_path), encoding='utf-8'))
    bars = hist['index']['bars']
    if len(bars) < 80:
        raise SystemExit('일봉이 %d 개뿐입니다 — 지표를 세울 수 없습니다' % len(bars))
    log('· 일봉 %d (%s ~ %s)' % (len(bars), bars[0]['d'], bars[-1]['d']))

    ind = V.compute_indicators(bars)
    flow = align_flows(bars, hist.get('flows') or {})
    auxp, vix_series = aux_percentiles(bars, hist.get('aux') or {})
    rows = V.score_series(ind, flow, auxp)

    # 워크포워드 가중 — 머리에 세우는 점수. 축마다 「그 점수가 높던 날 뒤가
    # 실제로 나빴는가」를 **과거만으로** 재서 가중치를 정한다.
    adaptive, wmap, whist, absent = V.adaptive_series(bars, rows)

    equal = [r['total'] for r in rows]
    scored = [k for k in range(len(bars)) if adaptive[k] is not None]
    if not scored:
        raise SystemExit('워크포워드 가중치를 세울 만큼 이력이 깊지 않습니다')
    i = len(bars) - 1
    if adaptive[i] is None:
        i = scored[-1]
        log('! 마지막 날은 점수를 못 냈습니다 — %s 로 물러섭니다' % bars[i]['d'])
    cur = rows[i]
    log('· 오늘 %s: 적응 %.1f / 균등 %s (V %s C %s M %s F %s) 국면 %s'
        % (bars[i]['d'], adaptive[i],
           ('%.1f' % equal[i]) if equal[i] is not None else '—',
           *[('%.0f' % cur[k]) if cur[k] is not None else '—' for k in 'vcmf'],
           cur['phase']))
    log('· 오늘 가중치: %s' % wmap[i])

    scen = B.scenarios(bars, rows, i, ind['rv20'])
    # 두 잣대로 각각 낸다 — 절대 낙폭(고객이 겪는 것)과 σ 기준(더 엄한 시험).
    bt = {m: B.backtest(bars, adaptive, ind['rv20'], label='적응 가중',
                        pct=threshold, mode=m)
          for m in ('abs', 'sigma')}
    sw = {m: B.sweep(bars, adaptive, ind['rv20'], mode=m) for m in ('abs', 'sigma')}
    # 같은 잣대·같은 구간으로 여럿을 견준다 — 합친 것이 정말 나은지 여기서만 드러난다
    cand = [
        ('적응 가중', adaptive),
        ('균등 가중', equal),
        ('변동성 축 단독', [r['v'] for r in rows]),
        ('압축 축 단독', [r['c'] for r in rows]),
        ('모멘텀 축 단독', [r['m'] for r in rows]),
    ]
    cmp_rows = {m: B.compare(bars, cand, ind['rv20'], pct=threshold, mode=m)
                for m in ('abs', 'sigma')}
    flags, cuts = B.alert_flags(adaptive, threshold)
    flow_cov = sum(1 for x in flow['foreign'] if x is not None)
    # 수급 축이 실제로 점수에 **들어간** 날. 원자료가 있는 날(flow_cov)과 다르다 —
    # 누적과 z점수가 앞자락을 먹기 때문이다. 문턱·백분위를 재는 이력의 대부분은
    # 수급이 빠진 판이므로, 이 수를 숨기면 오늘 점수를 이력과 견줄 수 없다.
    flow_in_score = sum(1 for r in rows if r['f'] is not None)

    # 수급을 뺀 오늘 점수 — 수급이 점수를 얼마나 밀어올렸는지 보이려는 것이다
    w_now = wmap[i] or {}
    ex = {k: v for k, v in w_now.items() if k != 'flow'}
    tw_ex = sum(ex.values())
    keymap = {'volatility': 'v', 'compression': 'c', 'momentum': 'm'}
    total_ex_flow = (sum(v * cur[keymap[k]] for k, v in ex.items()) / tw_ex
                     if tw_ex else None)

    # 점수 자체의 백분위 — 등급을 여기서 매긴다. 「65점」은 셈법을 바꾸면 뜻이
    # 달라지지만 「제 이력의 상위 12%」는 바뀌지 않는다.
    self_pct = V.pct_rank(adaptive, i, window=len(bars), min_obs=120)

    # 타임라인 — 그림에 싣는 구간만
    lo = max(0, len(bars) - TIMELINE_DAYS)
    timeline = []
    for k in range(lo, len(bars)):
        r = rows[k]
        rnd = lambda x: None if x is None else round(x, 1)
        timeline.append({
            'd': bars[k]['d'], 'c': round(bars[k]['c'], 2),
            'total': rnd(adaptive[k]), 'equal': rnd(r['total']),
            'cut': rnd(cuts[k]), 'alert': bool(flags[k]),
            'v': rnd(r['v']), 'c_': rnd(r['c']),
            'm': rnd(r['m']), 'f': rnd(r['f']), 'phase': r['phase'],
            'bbw': rnd(ind['bbw'][k]), 'rv20': rnd(ind['rv20'][k]),
            'rsi': rnd(ind['rsi14'][k]),
            'macd_hist': None if ind['macd_hist'][k] is None else round(ind['macd_hist'][k], 2),
            'sq': bool(ind['squeeze'][k]) if ind['squeeze'][k] is not None else None,
        })

    now = datetime.datetime.now(KST)
    pick = lambda s: None if s[i] is None else round(s[i], 2)
    doc = {
        'generated_at_kst': now.strftime('%Y-%m-%d %H:%M:%S'),
        'asof': bars[i]['d'],
        'index': {
            'name': hist['index']['name'],
            'close': round(bars[i]['c'], 2),
            'change_pct': pick(ind['ret_pct']),
            'basis': hist['index']['basis'],
            'validation': hist['index']['validation'],
        },
        'score': {
            'total': round(adaptive[i], 1),
            'self_pct': None if self_pct is None else round(self_pct, 1),
            'grade': V.grade_of(self_pct),
            'grade_note': V.GRADE_NOTE,
            'alert': bool(flags[i]),
            'alert_threshold': None if cuts[i] is None else round(cuts[i], 1),
            'equal_total': None if equal[i] is None else round(equal[i], 1),
            'total_ex_flow': None if total_ex_flow is None else round(total_ex_flow, 1),
            'flow_in_score_sessions': flow_in_score,
            'adaptive_weights': wmap[i],
            'axes_absent': absent[i] or [],
            'adaptive_fit': whist[-1] if whist else None,
            'adaptive_note': ('가중치는 축마다 「그 점수가 높던 날 뒤가 실제로 얼마나 밀렸는가」의 '
                              '순위상관을 **과거만으로** 재고, 그것을 **증거의 힘(λ)만큼** 사전값'
                              '(균등 25%)과 섞어 정한다. λ 는 중첩을 감안한 유효관측으로 잰다 — '
                              '표본이 얕은 축은 잰 값이 아니라 사전값 쪽으로 가고, 자료가 쌓이는 만큼 '
                              '저절로 잰 값이 사전값을 밀어낸다. 한 달에 한 번 다시 잰다.'),
            'phase': cur['phase'],
            'phase_label': (V.PHASES.get(cur['phase']) or ('—', ''))[0],
            'phase_note': (V.PHASES.get(cur['phase']) or ('', ''))[1],
            'axes': {
                'volatility': {'score': None if cur['v'] is None else round(cur['v'], 1),
                               'label': '변동성', 'parts': _round(cur['parts']['volatility'])},
                'compression': {'score': None if cur['c'] is None else round(cur['c'], 1),
                                'label': '가격압축', 'parts': _round(cur['parts']['compression'])},
                'momentum': {'score': None if cur['m'] is None else round(cur['m'], 1),
                             'label': '모멘텀', 'parts': _round(cur['parts']['momentum'])},
                'flow': {'score': None if cur['f'] is None else round(cur['f'], 1),
                         'label': '자금수급', 'parts': _round(cur['parts']['flow'])},
            },
            'weights_used': cur['weights_used'],
            'axes_missing': cur['axes_missing'],
            'weight_note': V.WEIGHT_NOTE,
            'meaning_note': ('점수는 각 지표가 **제 과거 안에서** 어디쯤인지를 모아 만든 값이다. '
                             '오늘의 %.0f점은 「지표들이 제 이력의 이만큼 나쁜 쪽에 들어와 있다」는 '
                             '뜻이지 **급락 확률 %.0f%% 라는 뜻이 아니다.** 확률은 아래 시나리오에서 '
                             '따로 낸다.' % (adaptive[i], adaptive[i])),
        },
        'indicators': {
            'rv5': pick(ind['rv5']), 'rv20': pick(ind['rv20']), 'rv60': pick(ind['rv60']),
            'rv_ratio': pick(ind['rv_ratio']),
            'atr14': pick(ind['atr14']), 'atrp': pick(ind['atrp']),
            'bbw': pick(ind['bbw']), 'pctb': pick(ind['pctb']),
            'bb_up': pick(ind['bb_up']), 'bb_lo': pick(ind['bb_lo']), 'bb_mid': pick(ind['bb_mid']),
            'squeeze': ind['squeeze'][i], 'squeeze_days': ind['squeeze_days'][i],
            'nr7': ind['nr7'][i],
            'rsi14': pick(ind['rsi14']),
            'macd': pick(ind['macd']), 'macd_signal': pick(ind['macd_signal']),
            'macd_hist': pick(ind['macd_hist']),
            'ma20': pick(ind['ma20']), 'ma60': pick(ind['ma60']),
            'disparity20': pick(ind['disparity20']), 'disparity60': pick(ind['disparity60']),
            'ret20': pick(ind['ret20']), 'drawdown60': pick(ind['drawdown60']),
            'vix': None if vix_series[i] is None else round(vix_series[i], 2),
            'foreign_cum5': _n(flow['foreign_cum5'][i]),
            'foreign_cum20': _n(flow['foreign_cum20'][i]),
            'inst_cum5': _n(flow['inst_cum5'][i]),
            'deposit': _n(flow['deposit'][i]), 'deposit_chg20': _r(flow['deposit_chg20'][i]),
            'credit': _n(flow['credit'][i]), 'credit_chg20': _r(flow['credit_chg20'][i]),
            'unit_note': '누적 순매수·예탁금·신용잔고는 억원. 변동성·밴드폭은 %.',
        },
        'timeline': timeline,
        'scenarios': scen,
        'backtest': bt,
        'sweep': sw,
        'compare': cmp_rows,
        'weight_history': whist,
        'coverage': {
            'index_sessions': len(bars),
            'scored_sessions': len(scored),
            'scored_from': bars[scored[0]]['d'],
            'flow_sessions': flow_cov,
            'flow_in_score_sessions': flow_in_score,
            'vix_sessions': sum(1 for x in vix_series if x is not None),
            'source': hist['coverage'],
            'note': ('가격 세 축(변동성·압축·모멘텀)은 %d 세션 위에서 셈했고, 수급 축이 점수에 '
                     '들어간 날은 %d 일이다(원자료는 %d 일이지만 누적·z점수 창이 앞자락을 먹는다). '
                     '그래서 **문턱과 백분위를 재는 이력의 대부분은 수급이 빠진 판**이고, '
                     '아래 백테스트 성적도 사실상 가격 세 축의 성적이다 — 수급이 든 채로 겪은 '
                     '급락 사건이 아직 표본이 못 된다.'
                     % (len(scored), flow_in_score, flow_cov)),
        },
        'notes': build_notes(cur, ind, i, scen, bt, flow_cov,
                             adaptive[i], self_pct, bool(flags[i]), wmap[i],
                             absent[i], (whist[-1] if whist else {}).get('detail') or {},
                             flow_in_score, total_ex_flow),
        'config': {
            'equal_weights': V.WEIGHTS, 'alert_pct': threshold,
            'min_sample': B.MIN_SAMPLE, 'horizons': B.HORIZONS,
            'crash_sigma': B.CRASH_SIGMA, 'move_sigma': B.MOVE_SIGMA,
            'event_window': B.EVENT_WINDOW, 'lookback_sessions': B.LOOKBACK,
            'pct_rank_window': 252, 'pct_rank_min_obs': 60,
            'burn_in': V.BURN_IN, 'refit_every': V.REFIT_EVERY,
            'prior': V.PRIOR, 'k_pseudo': V.K_PSEUDO, 'fit_horizon': 10,
            'min_fit_obs': V.MIN_FIT_OBS, 'flow_min_obs': V.FLOW_MIN_OBS,
        },
    }

    path = os.path.join(ROOT, out_path)
    if write_if_changed(path, doc):
        log('· %s (%.0f KB)' % (out_path, os.path.getsize(path) / 1024))
    else:
        log('· %s — 시각 말고 달라진 것이 없어 그대로 둔다' % out_path)

    # 날짜판도 남긴다 — **그날 무엇이라 말했는지**를 나중에 되짚어 보려는 것이다.
    # 통판을 그대로 복사하지는 않는다. 타임라인·백테스트·문턱 훑기는 이력이 있으면
    # 언제든 다시 셈할 수 있는 것이라, 날마다 75KB 씩 쌓을 까닭이 없다.
    # 남기는 것은 「그날의 판정」뿐이다.
    keep = ('generated_at_kst', 'asof', 'index', 'score', 'indicators',
            'scenarios', 'coverage', 'notes', 'config')
    dated = os.path.join(ROOT, os.path.dirname(out_path), '%s.json' % bars[i]['d'])
    if write_if_changed(dated, {k: doc[k] for k in keep}):
        log('· %s (그날의 판정만, %.0f KB)'
            % (os.path.basename(dated), os.path.getsize(dated) / 1024))
    else:
        log('· %s — 그대로 둔다' % os.path.basename(dated))
    return 0


def _round(parts):
    return {k: (None if v is None else round(v, 1)) for k, v in (parts or {}).items()}


def _n(x):
    return None if x is None else round(x)


def _r(x):
    return None if x is None else round(x, 2)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
