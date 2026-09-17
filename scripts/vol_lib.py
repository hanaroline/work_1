# -*- coding: utf-8 -*-
"""보조지표 계산과 네 축 스코어링 — 화면과 검산 스크립트가 함께 쓰는 셈틀.

여기에 든 것은 셈뿐이다. 받아 오는 일은 build_vol_history.py, 내보내는 일은
build_volatility.py 가 한다. 갈라 둔 까닭은 **검산 스크립트가 같은 셈을 다시
돌려 대조**할 수 있게 하려는 것이다 — 같은 함수를 쓰면 대조가 아니라 복사가
되므로, verify_volatility.py 는 여기 있는 함수를 쓰지 않고 따로 셈한다.

용어 하나. 이 파일에서 **점수는 모두 「위험 쪽으로 얼마나 기울었는가」** 이다.
0 이 가장 평온하고 100 이 가장 위태롭다. 지표의 부호가 제각각이라 이 방향을
한 번 정해 두지 않으면 합산에서 뒤섞인다.

표준 라이브러리만 쓴다.
"""
import math
import statistics as st

# ─────────────────────────────────────────────────────────────────────
# 기본 지표
# ─────────────────────────────────────────────────────────────────────


def sma(xs, n):
    """단순이동평균. 앞의 n-1 자리는 None 이다 — 0 으로 채우면 지표가 거짓말한다."""
    out = [None] * len(xs)
    s = 0.0
    for i, x in enumerate(xs):
        s += x
        if i >= n:
            s -= xs[i - n]
        if i >= n - 1:
            out[i] = s / n
    return out


def ema(xs, n):
    out = [None] * len(xs)
    if len(xs) < n:
        return out
    k = 2.0 / (n + 1)
    prev = sum(xs[:n]) / n          # 첫 값은 단순평균으로 띄운다(관례)
    out[n - 1] = prev
    for i in range(n, len(xs)):
        prev = xs[i] * k + prev * (1 - k)
        out[i] = prev
    return out


def rolling_std(xs, n):
    """표본표준편차(ddof=1). 변동성은 표본에서 재는 것이라 모표준편차를 쓰지 않는다."""
    out = [None] * len(xs)
    for i in range(n - 1, len(xs)):
        w = xs[i - n + 1:i + 1]
        out[i] = st.stdev(w) if len(w) > 1 else 0.0
    return out


def log_returns(closes):
    out = [None]
    for a, b in zip(closes, closes[1:]):
        out.append(math.log(b / a) if a > 0 and b > 0 else None)
    return out


def realized_vol(closes, n, ann=252):
    """연율화 실현변동성(%). 로그수익률의 표준편차 × √252."""
    r = log_returns(closes)
    out = [None] * len(closes)
    for i in range(len(closes)):
        w = [x for x in r[max(0, i - n + 1):i + 1] if x is not None]
        if len(w) >= max(5, n // 2):
            out[i] = st.stdev(w) * math.sqrt(ann) * 100 if len(w) > 1 else None
    return out


def true_range(o, h, l, c):
    out = [None] * len(c)
    for i in range(len(c)):
        if i == 0:
            out[i] = h[i] - l[i]
        else:
            pc = c[i - 1]
            out[i] = max(h[i] - l[i], abs(h[i] - pc), abs(l[i] - pc))
    return out


def atr(o, h, l, c, n=14):
    """Wilder 평활. 단순평균으로 하면 값이 하루 만에 튄다."""
    tr = true_range(o, h, l, c)
    out = [None] * len(c)
    if len(c) < n:
        return out
    prev = sum(tr[:n]) / n
    out[n - 1] = prev
    for i in range(n, len(c)):
        prev = (prev * (n - 1) + tr[i]) / n
        out[i] = prev
    return out


def rsi(closes, n=14):
    """Wilder RSI. 상승·하락폭을 각각 평활한다."""
    out = [None] * len(closes)
    if len(closes) <= n:
        return out
    gains = losses = 0.0
    for i in range(1, n + 1):
        d = closes[i] - closes[i - 1]
        gains += max(d, 0.0)
        losses += max(-d, 0.0)
    ag, al = gains / n, losses / n
    out[n] = 100.0 if al == 0 else 100 - 100 / (1 + ag / al)
    for i in range(n + 1, len(closes)):
        d = closes[i] - closes[i - 1]
        ag = (ag * (n - 1) + max(d, 0.0)) / n
        al = (al * (n - 1) + max(-d, 0.0)) / n
        out[i] = 100.0 if al == 0 else 100 - 100 / (1 + ag / al)
    return out


def macd(closes, fast=12, slow=26, sig=9):
    ef, es = ema(closes, fast), ema(closes, slow)
    line = [(a - b) if (a is not None and b is not None) else None for a, b in zip(ef, es)]
    have = [x for x in line if x is not None]
    off = len(line) - len(have)
    sg = ema(have, sig)
    signal = [None] * off + sg
    hist = [(a - b) if (a is not None and b is not None) else None
            for a, b in zip(line, signal)]
    return line, signal, hist


def bollinger(closes, n=20, k=2.0):
    mid = sma(closes, n)
    sd = rolling_std(closes, n)
    up = [(m + k * s) if (m is not None and s is not None) else None for m, s in zip(mid, sd)]
    lo = [(m - k * s) if (m is not None and s is not None) else None for m, s in zip(mid, sd)]
    # 밴드폭은 **중심선으로 나눈 비율(%)** 이다. 절대폭으로 두면 지수 수준이
    # 두 배가 된 구간과 예전 구간을 견줄 수 없다.
    bw = [((u - l) / m * 100) if (u is not None and m) else None
          for u, l, m in zip(up, lo, mid)]
    pb = [((c - l) / (u - l)) if (u is not None and u != l) else None
          for c, u, l in zip(closes, up, lo)]
    return mid, up, lo, bw, pb


def keltner(o, h, l, c, n=20, mult=1.5):
    mid = ema(c, n)
    a = atr(o, h, l, c, n)
    up = [(m + mult * x) if (m is not None and x is not None) else None for m, x in zip(mid, a)]
    lo = [(m - mult * x) if (m is not None and x is not None) else None for m, x in zip(mid, a)]
    return mid, up, lo


def squeeze(bb_up, bb_lo, kc_up, kc_lo):
    """볼린저가 켈트너 **안으로** 들어간 날 = 스퀴즈. 변동성이 말라붙은 상태다."""
    out = []
    for bu, bl, ku, kl in zip(bb_up, bb_lo, kc_up, kc_lo):
        out.append(None if None in (bu, bl, ku, kl) else (bu < ku and bl > kl))
    return out


def squeeze_days(sq):
    """스퀴즈가 며칠째인가. 오래 눌릴수록 풀릴 때 크게 움직인다."""
    out, run = [], 0
    for s in sq:
        run = (run + 1) if s else 0
        out.append(run if s is not None else None)
    return out


def nr7(h, l):
    """오늘 일중 변동폭이 이레 가운데 가장 좁은가."""
    rng = [a - b for a, b in zip(h, l)]
    out = [None] * len(rng)
    for i in range(6, len(rng)):
        out[i] = rng[i] == min(rng[i - 6:i + 1])
    return out


def drawdown(closes, n=60):
    """최근 n일 고점 대비 낙폭(%). 음수다."""
    out = [None] * len(closes)
    for i in range(len(closes)):
        w = closes[max(0, i - n + 1):i + 1]
        if len(w) >= 10:
            pk = max(w)
            out[i] = (closes[i] / pk - 1) * 100 if pk else None
    return out


# ─────────────────────────────────────────────────────────────────────
# 백분위 — 점수의 바탕
# ─────────────────────────────────────────────────────────────────────

def pct_rank(series, i, window=252, min_obs=60):
    """series[i] 가 **자기 과거** 안에서 몇 번째인가(0~100).

    고정 문턱(「RSI 30 이하면 과매도」) 대신 백분위를 쓰는 까닭 —
    지수 수준도 변동성 수준도 해마다 달라, 2024년에 위태롭던 값이 2026년에는
    예사인 일이 생긴다. 백분위는 그 계열이 **제 이력 안에서** 어디쯤인지만
    묻기 때문에 눈금이 옮겨져도 뜻이 흔들리지 않는다.

    미래를 보지 않는다 — i 시점까지만 쓴다. 백테스트가 성립하려면 이게 지켜져야
    한다. 표본이 min_obs 에 못 미치면 None 을 낸다(0 이 아니다).
    """
    v = series[i]
    if v is None:
        return None
    lo = max(0, i - window + 1)
    w = [x for x in series[lo:i + 1] if x is not None]
    if len(w) < min_obs:
        return None
    below = sum(1 for x in w if x < v)
    ties = sum(1 for x in w if x == v)
    return (below + 0.5 * ties) / len(w) * 100


def zscore(series, i, window=60, min_obs=20):
    v = series[i]
    if v is None:
        return None
    lo = max(0, i - window + 1)
    w = [x for x in series[lo:i + 1] if x is not None]
    if len(w) < min_obs:
        return None
    m = st.mean(w)
    s = st.stdev(w) if len(w) > 1 else 0.0
    return (v - m) / s if s else 0.0


def clamp(x, lo=0.0, hi=100.0):
    return max(lo, min(hi, x))


def mean_of(vals):
    """None 을 **빼고** 평균한다. 없는 값을 0 으로 채우면 없는 것이 '안전하다'는
    뜻이 되어 버린다 — 자료가 빠진 날 점수가 저절로 내려가는 사고가 여기서 난다."""
    xs = [x for x in vals if x is not None]
    return (sum(xs) / len(xs)) if xs else None


# ─────────────────────────────────────────────────────────────────────
# 네 축
# ─────────────────────────────────────────────────────────────────────

WEIGHTS = {'volatility': 0.25, 'compression': 0.25, 'momentum': 0.25, 'flow': 0.25}
WEIGHT_NOTE = ('균등가중은 **기준선**이다 — 아무것도 맞추지 않은 상태의 점수. '
               '머리에 세우는 점수는 아래 워크포워드 가중(adaptive)이고, 둘을 나란히 내는 까닭은 '
               '가중치를 맞춘 것이 정말 보탬이 됐는지 견줄 자리가 있어야 하기 때문이다.')

# 등급은 **점수의 자기 백분위**로 매긴다. 「65점」은 셈법을 바꾸면 뜻이 달라지지만
# 「제 이력의 상위 5%」는 셈법이 바뀌어도 그대로다. 고객에게 옮길 때도 이쪽이
# 옳다 — 「경계」가 「이만한 자리는 두 해에 스무 날쯤 나온다」로 풀리기 때문이다.
GRADES = [(95, '위험'), (85, '경계'), (70, '주의'), (40, '관심'), (0, '안정')]
GRADE_NOTE = '등급은 오늘 점수가 제 이력에서 몇 번째인가로 매긴다(점수 자체의 자리가 아니다).'


def grade_of(self_pct):
    """self_pct 는 점수의 자기 백분위(0~100). 없으면 등급도 없다."""
    if self_pct is None:
        return None
    for cut, name in GRADES:
        if self_pct >= cut:
            return name
    return '안정'


def compute_indicators(bars):
    """일봉에서 지표를 모두 뽑아 {이름: 계열} 로 돌려준다."""
    o = [b['o'] for b in bars]
    h = [b['h'] for b in bars]
    l = [b['l'] for b in bars]
    c = [b['c'] for b in bars]

    bb_mid, bb_up, bb_lo, bbw, pb = bollinger(c, 20, 2.0)
    kc_mid, kc_up, kc_lo = keltner(o, h, l, c, 20, 1.5)
    sq = squeeze(bb_up, bb_lo, kc_up, kc_lo)
    ml, ms, mh = macd(c)
    a14 = atr(o, h, l, c, 14)

    ind = {
        'close': c, 'open': o, 'high': h, 'low': l,
        'ret_pct': [None] + [(b / a - 1) * 100 for a, b in zip(c, c[1:])],
        'rv5': realized_vol(c, 5), 'rv20': realized_vol(c, 20), 'rv60': realized_vol(c, 60),
        'atr14': a14,
        'atrp': [(x / y * 100) if (x is not None and y) else None for x, y in zip(a14, c)],
        'bb_mid': bb_mid, 'bb_up': bb_up, 'bb_lo': bb_lo, 'bbw': bbw, 'pctb': pb,
        'kc_up': kc_up, 'kc_lo': kc_lo,
        'squeeze': sq, 'squeeze_days': squeeze_days(sq), 'nr7': nr7(h, l),
        'macd': ml, 'macd_signal': ms, 'macd_hist': mh,
        'rsi14': rsi(c, 14),
        'ma20': sma(c, 20), 'ma60': sma(c, 60),
        'drawdown60': drawdown(c, 60),
    }
    ind['rv_ratio'] = [(x / y) if (x is not None and y) else None
                       for x, y in zip(ind['rv5'], ind['rv20'])]
    ind['disparity20'] = [(x / y * 100 - 100) if (y) else None
                          for x, y in zip(c, ind['ma20'])]
    ind['disparity60'] = [(x / y * 100 - 100) if (y) else None
                          for x, y in zip(c, ind['ma60'])]
    # 20일 기울기 — 추세가 도는 것을 수준보다 먼저 보여 준다
    ind['ma20_slope'] = [None] * len(c)
    for i in range(len(c)):
        a, b = ind['ma20'][i], ind['ma20'][i - 5] if i >= 5 else None
        if a is not None and b:
            ind['ma20_slope'][i] = (a / b - 1) * 100
    ind['ret20'] = [None] * len(c)
    for i in range(20, len(c)):
        ind['ret20'][i] = (c[i] / c[i - 20] - 1) * 100
    return ind


def axis_volatility(ind, i, aux=None):
    """축 하나 — **지금 얼마나 흔들리고 있는가.**

    이미 벌어지고 있는 흔들림을 잰다. 앞으로 벌어질 것은 축 둘(압축)이 잰다.
    """
    parts = {}
    parts['rv20'] = pct_rank(ind['rv20'], i)
    parts['atrp'] = pct_rank(ind['atrp'], i)
    # 단기가 장기보다 얼마나 앞서 뛰는가 — 갓 불붙은 변동성을 잡는 자리다
    parts['rv_ratio'] = pct_rank(ind['rv_ratio'], i)
    if aux and aux.get('vix_pct') is not None:
        parts['vix'] = aux['vix_pct']
    return mean_of(parts.values()), parts


def axis_compression(ind, i):
    """축 둘 — **얼마나 눌려 있는가.** 눌린 만큼 풀릴 때 크게 간다.

    밴드폭 백분위를 **뒤집어** 쓴다(좁을수록 높은 점수). 스퀴즈가 며칠째인지,
    오늘이 NR7 인지를 보태되, 보탬은 제한을 둔다 — 눌린 것은 방향을 말해 주지
    않으므로 이 축만으로 경보를 울리면 안 된다.
    """
    parts = {}
    bw = pct_rank(ind['bbw'], i)
    parts['bbw_inv'] = (100 - bw) if bw is not None else None
    sqd = ind['squeeze_days'][i]
    if sqd is not None:
        # 열흘 눌리면 만점. 그 위로는 더 주지 않는다 — 오래 눌린다고 끝없이
        # 위험해지는 것이 아니라 어느 지점부터는 그냥 조용한 장세다.
        parts['squeeze'] = clamp(sqd / 10.0 * 100)
    if ind['nr7'][i] is not None:
        parts['nr7'] = 100.0 if ind['nr7'][i] else 0.0
    # 밴드폭이 **줄어드는 중**인가 — 수준보다 방향이 먼저 온다
    if i >= 5 and ind['bbw'][i] is not None and ind['bbw'][i - 5]:
        chg = ind['bbw'][i] / ind['bbw'][i - 5] - 1
        parts['bbw_trend'] = clamp(50 - chg * 250)
    return mean_of(parts.values()), parts


def axis_momentum(ind, i):
    """축 셋 — **추세가 아래로 꺾였는가.**

    과열(RSI 높음)은 여기 넣지 않는다. 과열은 하락 모멘텀이 아니라 다른 종류의
    위험이고, 섞으면 「많이 올라서 위험」과 「떨어지는 중이라 위험」이 한 숫자에
    포개져 무슨 말인지 알 수 없게 된다. 과열은 따로 깃발로 낸다.
    """
    parts = {}
    mh = ind['macd_hist'][i]
    if mh is not None:
        r = pct_rank(ind['macd_hist'], i)
        parts['macd_hist'] = (100 - r) if r is not None else None
    rs = ind['rsi14'][i]
    if rs is not None:
        # RSI 는 이미 0~100 자리에 있다. 뒤집으면 그대로 하락 압력이 된다.
        parts['rsi'] = 100 - rs
    d20 = ind['disparity20'][i]
    if d20 is not None:
        r = pct_rank(ind['disparity20'], i)
        parts['disparity20'] = (100 - r) if r is not None else None
    sl = ind['ma20_slope'][i]
    if sl is not None:
        r = pct_rank(ind['ma20_slope'], i)
        parts['ma20_slope'] = (100 - r) if r is not None else None
    r20 = ind['ret20'][i]
    if r20 is not None:
        r = pct_rank(ind['ret20'], i)
        parts['ret20'] = (100 - r) if r is not None else None
    return mean_of(parts.values()), parts


def axis_flow(flow_ind, i):
    """축 넷 — **돈이 들어오는가 나가는가.**

    쓰는 값은 넷이다. 외국인·기관 누적 순매수(빠지면 위험), 고객예탁금 증감
    (마르면 위험), 신용잔고 증감(**빨리 늘어도 위험**하다 — 빚으로 산 물량은
    떨어질 때 강제로 나온다).

    자료가 없으면 None 이다. 0 이 아니다 — 없는 것을 '중립'으로 놓으면 수급이
    안 들어온 날 점수가 저절로 내려간다.
    """
    if flow_ind is None:
        return None, {}
    parts = {}
    for key, name in (('foreign_cum5', 'foreign5'), ('foreign_cum20', 'foreign20'),
                      ('inst_cum5', 'inst5')):
        z = zscore(flow_ind[key], i) if flow_ind.get(key) else None
        if z is not None:
            # z −2 → 100점, z +2 → 0점. 자른 자리를 넘는 값은 그대로 끝이다.
            parts[name] = clamp(50 - z * 25)
    if flow_ind.get('deposit_chg20'):
        z = zscore(flow_ind['deposit_chg20'], i)
        if z is not None:
            parts['deposit'] = clamp(50 - z * 25)
    if flow_ind.get('credit_chg20'):
        z = zscore(flow_ind['credit_chg20'], i)
        if z is not None:
            # 부호를 뒤집지 않는다 — 신용이 **불어나는** 쪽이 위험이다
            parts['credit'] = clamp(50 + z * 25)
    return mean_of(parts.values()), parts


def composite(axes):
    """네 축을 하나로. **있는 축만으로 셈하고 가중치를 다시 나눈다.**

    없는 축을 50 으로 채우지 않는다. 채우면 자료가 빠진 날마다 점수가 한가운데로
    끌려가 경보가 무뎌진다. 대신 어느 축으로 셈했는지를 같이 낸다.
    """
    have = {k: v for k, v in axes.items() if v is not None}
    if not have:
        return None, {}, []
    tw = sum(WEIGHTS[k] for k in have)
    score = sum(WEIGHTS[k] * v for k, v in have.items()) / tw
    used = {k: round(WEIGHTS[k] / tw, 4) for k in have}
    return score, used, sorted(set(WEIGHTS) - set(have))


# ─────────────────────────────────────────────────────────────────────
# 국면 — 점수 하나로는 못 하는 말
# ─────────────────────────────────────────────────────────────────────

PHASES = {
    'coiled':   ('압축 대기', '변동성이 마르고 밴드가 좁혀졌다. 방향은 아직 없고 에너지만 쌓인 자리다.'),
    'breaking': ('하락 전개', '변동성이 살아 있는 채로 추세가 아래를 향한다. 이미 벌어지는 중이다.'),
    'unwind':   ('변동성 확산', '변동성이 크게 벌어졌다. 방향이 분명치 않아 양쪽으로 다 튄다.'),
    'calm':     ('안정', '눌리지도 흔들리지도 않았다.'),
    'drift':    ('완만 상승', '변동성이 낮고 추세가 위를 향한다.'),
}


def phase_of(v, c, m):
    """(변동성, 압축, 모멘텀) 으로 국면을 가른다.

    시나리오 확률은 **이 국면을 열쇠로** 과거를 뒤진다. 점수 하나로 묶으면
    「압축 70점」과 「하락 70점」이 한 통에 들어가 버리는데, 그 둘의 이후는
    전혀 다르다.
    """
    if None in (v, c, m):
        return None
    if c >= 60 and v <= 45:
        return 'coiled'
    if m >= 60 and v >= 50:
        return 'breaking'
    if v >= 65:
        return 'unwind'
    if m <= 40 and v <= 45:
        return 'drift'
    return 'calm'


def score_series(ind, flow_ind=None, aux_pct=None):
    """모든 날에 대해 축·합산·국면을 셈한다. 백테스트가 이것을 그대로 쓴다."""
    n = len(ind['close'])
    rows = []
    for i in range(n):
        v, vp = axis_volatility(ind, i, (aux_pct or {}).get(i))
        c, cp = axis_compression(ind, i)
        m, mp = axis_momentum(ind, i)
        f, fp = axis_flow(flow_ind, i) if flow_ind else (None, {})
        tot, used, missing = composite({'volatility': v, 'compression': c,
                                        'momentum': m, 'flow': f})
        rows.append({
            'i': i,
            'v': v, 'c': c, 'm': m, 'f': f,
            'total': tot, 'weights_used': used, 'axes_missing': missing,
            'phase': phase_of(v, c, m),
            'parts': {'volatility': vp, 'compression': cp, 'momentum': mp, 'flow': fp},
        })
    return rows


# ─────────────────────────────────────────────────────────────────────
# 워크포워드 가중 — 어느 축이 실제로 앞일을 말해 주는가를 과거에서만 재서 정한다
# ─────────────────────────────────────────────────────────────────────

AXIS_KEYS = [('v', 'volatility'), ('c', 'compression'), ('m', 'momentum'), ('f', 'flow')]
BURN_IN = 150        # 이만큼 쌓이기 전에는 가중치를 재지 않는다. 484 세션뿐이라 1년(250)을
                     # 태우면 평가할 구간이 남지 않는다 — 여기서도 표본이 발목을 잡는다.
REFIT_EVERY = 20     # 한 달에 한 번 다시 잰다. 날마다 고치면 점수가 널뛴다.
MIN_FIT_OBS = 60     # 축 하나를 재는 데 필요한 최소 관측


def spearman(xs, ys):
    """순위상관. 지표와 뒷일의 관계는 곧지 않으므로(한쪽 끝에서만 듣는다) 값이
    아니라 순위로 잰다."""
    if len(xs) < 3:
        return 0.0

    def rank(v):
        order = sorted(range(len(v)), key=lambda i: v[i])
        r = [0] * len(v)
        for p, i in enumerate(order):
            r[i] = p
        return r

    a, b = rank(xs), rank(ys)
    ma, mb = st.mean(a), st.mean(b)
    sa, sb = st.pstdev(a), st.pstdev(b)
    if not sa or not sb:
        return 0.0
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / len(a) / (sa * sb)


def forward_min(bars, j, h):
    """j 일 종가 대비 이후 h 거래일 **저가** 최저치(%). 음수다."""
    if j + h >= len(bars):
        return None
    c0 = bars[j]['c']
    return (min(b['l'] for b in bars[j + 1:j + h + 1]) / c0 - 1) * 100


def adaptive_series(bars, rows, h=10, burn=BURN_IN, refit=REFIT_EVERY):
    """축마다 「그 점수가 높던 날 뒤가 실제로 나빴는가」를 재서 가중치로 삼는다.

    **미래를 보지 않는다.** t 일의 가중치는 t 보다 앞선 날 가운데 **결과가 이미
    드러난 날**(j + h < t)만으로 잰다. 그래서 백테스트에 그대로 얹어도 성적이
    부풀지 않는다.

    가중치는 순위상관의 **양수 부분**을 정규화한 값이다. 상관이 0 이하인 축은
    가중치 0 — 뒷일을 말해 주지 못한 축을 억지로 끼워 넣지 않는다. 이 저장소의
    자료에서는 압축 축이 실제로 0 으로 떨어진다(그 사실 자체가 산출물이다).

    돌려주는 것: (점수 계열, 날짜별 가중치, 가중치를 다시 잰 기록)
    """
    n = len(bars)
    score = [None] * n
    wmap = [None] * n
    unfit = [None] * n
    history = []
    cur, cur_unfit = None, []
    for t in range(n):
        if t >= burn and (t - burn) % refit == 0:
            w, detail, miss = {}, {}, []
            for key, name in AXIS_KEYS:
                xs, ys = [], []
                for j in range(t - h):           # 결과가 드러난 날만
                    if rows[j][key] is None:
                        continue
                    f = forward_min(bars, j, h)
                    if f is None:
                        continue
                    xs.append(rows[j][key])
                    ys.append(-f)                # 많이 밀릴수록 큰 값
                if len(xs) >= MIN_FIT_OBS:
                    r = spearman(xs, ys)
                    w[name] = max(0.0, r)
                    detail[name] = {'rho': round(r, 4), 'n': len(xs)}
                else:
                    # **재지 못한 축과 재어 보니 0 인 축은 다르다.** 앞의 것은
                    # 아직 모르는 것이고 뒤의 것은 알아낸 것이다 — 섞어 두면
                    # 화면에서 「수급은 쓸모없다」고 잘못 읽힌다.
                    miss.append(name)
                    detail[name] = {'rho': None, 'n': len(xs),
                                    'note': '표본 %d 일 — %d 일이 되어야 잽니다' % (len(xs), MIN_FIT_OBS)}
            s = sum(w.values())
            cur = {k: v / s for k, v in w.items()} if s > 0 else None
            cur_unfit = miss
            history.append({'d': bars[t]['d'],
                            'weights': {k: round(v, 4) for k, v in (cur or {}).items()},
                            'unfitted': miss, 'detail': detail})
        if cur:
            # 가중치 0 인 축도 **자리는 남긴다** — 0 이라는 것이 산출물이다
            have = {k: rows[t][key] for key, k in AXIS_KEYS
                    if k in cur and rows[t][key] is not None}
            tw = sum(cur[k] for k in have)
            if tw > 0:
                score[t] = sum(cur[k] * have[k] for k in have) / tw
                wmap[t] = {k: round(cur[k] / tw, 4) for k in have}
                unfit[t] = list(cur_unfit)
    return score, wmap, history, unfit
