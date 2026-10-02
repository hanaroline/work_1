# -*- coding: utf-8 -*-
"""매수/매도 타이밍 신호 엔진.

`vol_lib` 이 만든 경보 모델과 **묻는 것이 다르다.** 경보는 「얼마나 위험한가」를
0~100 으로 내고 방향을 말하지 않는다. 여기서는 「지금 사야 하는가 팔아야 하는가」를
−100(매도) ~ +100(매수) 으로 낸다. 그래서 축도 방향을 갖는다.

지표 셈법은 vol_lib 을 그대로 쓴다. 같은 RSI 를 두 벌 만들어 두면 언젠가 갈라지고,
갈라진 뒤에는 화면과 백테스트가 서로 다른 신호를 내게 된다.

**점수는 타이밍이 아니다.** 「82점」은 언제 사서 어디서 손절할지를 말해 주지 않는다.
그래서 이 모듈은 점수에서 멈추지 않고 진입·손절·청산·비중까지 숫자로 낸다
(`plan_of`). 손절 없이 나가는 매수 신호는 신호가 아니라 감상이다.
"""

import math
import statistics as st

import vol_lib as V


# 네 시계를 나란히 낸다. 하나를 고르지 않는 까닭은 같은 종목이 5일과 60일에서
# 서로 다른 쪽을 가리키는 일이 흔하고, **그 어긋남 자체가 정보**이기 때문이다.
# (「단기 과열이지만 중기 추세는 살아 있다」는 한 숫자로 못 하는 말이다.)
HORIZONS = [5, 10, 20, 60]

# 매도 신호는 **보유 청산**이다. 하락 베팅이 아니다 — 국내 개인 계좌에서 숏은
# 사실상 인버스 ETF 를 사는 것이고 비용·추적오차 가정이 통째로 달라진다.
SHORT_ALLOWED = False


# ─────────────────────────────────────────────────────────────────────
# 지표 — vol_lib 에 없는 것만
# ─────────────────────────────────────────────────────────────────────

def obv(closes, vols):
    """누적 거래량. 오른 날 거래량을 더하고 내린 날 것을 뺀다.

    가격이 제자리인데 OBV 가 오르면 **조용히 모으는 중**이라고 읽는 지표다.
    그 읽기가 맞는지는 백테스트가 따로 답한다 — 여기서는 셈만 한다.
    """
    out = [None] * len(closes)
    if not closes:
        return out
    acc = 0.0
    out[0] = 0.0
    for i in range(1, len(closes)):
        v = vols[i] or 0
        if closes[i] > closes[i - 1]:
            acc += v
        elif closes[i] < closes[i - 1]:
            acc -= v
        out[i] = acc
    return out


def mfi(highs, lows, closes, vols, n=14):
    """자금흐름지수. 거래대금에 방향을 붙인 RSI 라고 보면 된다.

    RSI 와 달리 **거래량이 실린 움직임만** 센다. 거래 없이 흐른 가격은 약하게 잡힌다.
    """
    out = [None] * len(closes)
    tp = [(h + l + c) / 3.0 for h, l, c in zip(highs, lows, closes)]
    raw = [t * (v or 0) for t, v in zip(tp, vols)]
    for i in range(n, len(closes)):
        pos = neg = 0.0
        for j in range(i - n + 1, i + 1):
            if tp[j] > tp[j - 1]:
                pos += raw[j]
            elif tp[j] < tp[j - 1]:
                neg += raw[j]
        if pos + neg <= 0:
            out[i] = 50.0
        else:
            out[i] = pos / (pos + neg) * 100.0
    return out


def adx(opens, highs, lows, closes, n=14):
    """추세의 **세기**(ADX)와 **방향**(+DI, −DI).

    이 모듈에서 ADX 가 하는 일은 하나 더 있다 — 모멘텀 축의 **부호를 정한다**.
    추세장에서 RSI 70 은 「더 간다」이고 횡보장에서 RSI 70 은 「되돌린다」인데,
    대부분의 도구가 이걸 하나로 고정해 두고 틀린다. 가르는 잣대가 필요하고
    ADX 가 그 자리에 있다. (`axis_momentum` 주석 참고)
    """
    n_ = len(closes)
    pdm = [None] * n_
    ndm = [None] * n_
    tr = V.true_range(opens, highs, lows, closes)
    for i in range(1, n_):
        up = highs[i] - highs[i - 1]
        dn = lows[i - 1] - lows[i]
        pdm[i] = up if (up > dn and up > 0) else 0.0
        ndm[i] = dn if (dn > up and dn > 0) else 0.0

    def wilder(xs):
        out = [None] * n_
        acc = None
        for i in range(n_):
            x = xs[i]
            if x is None:
                continue
            if acc is None:
                # 첫 n 개가 모이면 그때부터 흘린다
                seed = [v for v in xs[max(0, i - n + 1):i + 1] if v is not None]
                if len(seed) < n:
                    continue
                acc = sum(seed)
            else:
                acc = acc - acc / n + x
            out[i] = acc
        return out

    str_ = wilder(tr)
    spdm = wilder(pdm)
    sndm = wilder(ndm)

    pdi = [None] * n_
    ndi = [None] * n_
    dx = [None] * n_
    for i in range(n_):
        if str_[i] and spdm[i] is not None and sndm[i] is not None:
            pdi[i] = spdm[i] / str_[i] * 100
            ndi[i] = sndm[i] / str_[i] * 100
            s = pdi[i] + ndi[i]
            dx[i] = (abs(pdi[i] - ndi[i]) / s * 100) if s else 0.0

    adx_ = [None] * n_
    acc = None
    cnt = 0
    for i in range(n_):
        if dx[i] is None:
            continue
        cnt += 1
        if acc is None:
            seed = [v for v in dx[max(0, i - n + 1):i + 1] if v is not None]
            if len(seed) < n:
                continue
            acc = sum(seed) / n
        else:
            acc = (acc * (n - 1) + dx[i]) / n
        adx_[i] = acc
    return adx_, pdi, ndi


def stochastic(highs, lows, closes, n=14, d=3):
    """스토캐스틱 %K, %D — n일 범위 안에서 오늘 종가가 어디쯤인가."""
    k = [None] * len(closes)
    for i in range(n - 1, len(closes)):
        hh = max(highs[i - n + 1:i + 1])
        ll = min(lows[i - n + 1:i + 1])
        k[i] = 50.0 if hh == ll else (closes[i] - ll) / (hh - ll) * 100
    # V.sma 는 None 을 만나면 죽는다. %K 는 앞쪽이 None 이므로 여기서 따로 센다.
    dd = [None] * len(closes)
    for i in range(len(closes)):
        w = k[max(0, i - d + 1):i + 1]
        if len(w) == d and all(x is not None for x in w):
            dd[i] = sum(w) / d
    return k, dd


def rel_strength(closes, bench, n=20):
    """지수 대비 초과수익(%p). 자기만 보면 「장이 좋아서 오른 것」을 실력으로 읽는다."""
    out = [None] * len(closes)
    if not bench:
        return out
    for i in range(n, min(len(closes), len(bench))):
        if closes[i - n] and bench[i - n] and bench[i]:
            out[i] = ((closes[i] / closes[i - n]) - (bench[i] / bench[i - n])) * 100
    return out


def volume_zscore(vols, i, window=60, min_obs=20):
    """오늘 거래량이 제 평소보다 몇 σ 인가."""
    return V.zscore([float(v or 0) for v in vols], i, window=window, min_obs=min_obs)


# ─────────────────────────────────────────────────────────────────────
# 매물대 — 어느 가격대에 물량이 쌓여 있는가
# ─────────────────────────────────────────────────────────────────────

VP_LOOKBACK = 120     # 반년. 더 늘리면 지금과 무관한 옛 가격대가 저항 행세를 한다.
VP_BINS = 24


def volume_profile(bars, i, lookback=VP_LOOKBACK, bins=VP_BINS):
    """i 일까지 **뒤돌아본** 물량표. 미래 봉은 한 개도 쓰지 않는다.

    일봉밖에 없으므로 하루 거래대금을 그날 고가~저가에 **고르게 펴서** 칸에 담는다.
    실제로는 시가·종가 근처에 몰리지만, 분봉이 없는 자리에서 그걸 흉내 내면
    근거 없는 정교함이 된다. 고르게 펴는 쪽이 틀리더라도 정직하게 틀린다.

    돌려주는 것은 **칸과 그 무게뿐**이다. 현재가 기준의 저항·지지는 `vp_at` 이
    읽는다 — 이 함수는 무거워 며칠에 한 번만 부르고, 저것은 날마다 부르기 때문이다.
    """
    lo_i = max(0, i - lookback + 1)
    seg = bars[lo_i:i + 1]
    if len(seg) < 20:
        return None
    lo = min(b['l'] for b in seg)
    hi = max(b['h'] for b in seg)
    if not (hi > lo):
        return None
    width = (hi - lo) / bins
    buckets = [0.0] * bins

    for b in seg:
        bl, bh = b['l'], b['h']
        # 거래대금으로 잰다. 주가 수준이 크게 달라진 구간에서 주식수로 재면
        # 쌌던 시절의 물량이 부풀어 보인다.
        val = (b['v'] or 0) * ((bh + bl) / 2.0)
        if val <= 0:
            continue
        if bh <= bl:
            k = min(bins - 1, max(0, int((bl - lo) / width)))
            buckets[k] += val
            continue
        k0 = min(bins - 1, max(0, int((bl - lo) / width)))
        k1 = min(bins - 1, max(0, int((bh - lo) / width)))
        span = bh - bl
        for k in range(k0, k1 + 1):
            klo = lo + k * width
            khi = klo + width
            ov = min(bh, khi) - max(bl, klo)
            if ov > 0:
                buckets[k] += val * (ov / span)

    total = sum(buckets)
    if total <= 0:
        return None

    return {'lo': lo, 'hi': hi, 'bins': bins, 'width': width,
            'buckets': buckets, 'total': total, 'sessions': len(seg)}


def vp_at(vb, close):
    """쌓인 물량표 `vb` 를 **오늘 종가** 기준으로 읽는다.

    물량표를 세는 것과 그것을 읽는 것을 나눈 까닭 — 물량표는 무거워서 며칠에 한 번만
    다시 세도 되지만, **현재가 위아래 비중은 날마다 달라진다.** 처음에는 둘을 한
    함수에 두고 닷새마다 통째로 다시 셌는데, 그러면 사이의 나흘은 **닷새 전 종가로
    잰 저항·지지**를 오늘 것인 양 내놓는다. 검산기가 「아래 비중이 있을 수 있는
    범위를 벗어난다」로 이걸 잡았다. 값이 조금 틀리는 것이 아니라 **지지선이
    현재가 위에 찍히는** 일까지 났다.
    """
    if not vb:
        return None
    bins, width, lo = vb['bins'], vb['width'], vb['lo']
    buckets, total = vb['buckets'], vb['total']

    poc_k = max(range(bins), key=lambda k: buckets[k])
    poc = lo + (poc_k + 0.5) * width

    # 가치영역 — POC 에서 양옆으로 두꺼운 칸부터 70% 를 채운다
    taken = {poc_k}
    acc = buckets[poc_k]
    while acc < total * 0.70:
        cands = [k for k in range(bins) if k not in taken]
        if not cands:
            break
        k = max(cands, key=lambda k: buckets[k])
        taken.add(k)
        acc += buckets[k]
    val_ = lo + min(taken) * width
    vah = lo + (max(taken) + 1) * width

    c = close
    above = below = 0.0
    for k in range(bins):
        klo = lo + k * width
        khi = klo + width
        if khi <= c:
            below += buckets[k]
        elif klo >= c:
            above += buckets[k]
        else:                       # 현재가가 가로지르는 칸은 갈라 담는다
            f = (c - klo) / width
            below += buckets[k] * f
            above += buckets[k] * (1 - f)

    up_ks = [k for k in range(bins) if lo + (k + 0.5) * width > c]
    dn_ks = [k for k in range(bins) if lo + (k + 0.5) * width < c]
    n_up = max(up_ks, key=lambda k: buckets[k]) if up_ks else None
    n_dn = max(dn_ks, key=lambda k: buckets[k]) if dn_ks else None

    return {
        'lo': lo, 'hi': vb['hi'], 'bins': bins, 'width': width,
        'buckets': buckets, 'total': total,
        'poc': poc, 'val': val_, 'vah': vah,
        'above_pct': above / total * 100,
        'below_pct': below / total * 100,
        'nearest_up': (lo + (n_up + 0.5) * width) if n_up is not None else None,
        'nearest_dn': (lo + (n_dn + 0.5) * width) if n_dn is not None else None,
        'sessions': vb['sessions'],
    }


# ─────────────────────────────────────────────────────────────────────
# 지표 묶음
# ─────────────────────────────────────────────────────────────────────

def compute_indicators(bars, bench_close=None):
    """vol_lib 지표에 방향용 지표를 얹는다."""
    ind = V.compute_indicators(bars)
    o = ind['open']
    h = ind['high']
    l = ind['low']
    c = ind['close']
    v = [b.get('v') for b in bars]

    ind['volume'] = v
    ind['obv'] = obv(c, v)
    ind['mfi14'] = mfi(h, l, c, v, 14)
    a, pdi, ndi = adx(o, h, l, c, 14)
    ind['adx14'], ind['plus_di'], ind['minus_di'] = a, pdi, ndi
    ind['stoch_k'], ind['stoch_d'] = stochastic(h, l, c, 14, 3)
    ind['ma5'] = V.sma(c, 5)
    ind['ma120'] = V.sma(c, 120)
    ind['rs20'] = rel_strength(c, bench_close, 20) if bench_close else [None] * len(c)

    # OBV 기울기 — 수준이 아니라 방향을 본다. OBV 의 절대값은 표본 시작점에
    # 달려 있어 그 자체로는 아무 뜻이 없다.
    ind['obv_slope20'] = [None] * len(c)
    for i in range(20, len(c)):
        a0, a1 = ind['obv'][i - 20], ind['obv'][i]
        if a0 is not None and a1 is not None:
            # 거래량 규모로 나눠 종목 간 견줄 수 있게 만든다
            base = st.mean([abs(x or 0) for x in v[max(0, i - 20):i + 1]]) or 1.0
            ind['obv_slope20'][i] = (a1 - a0) / (base * 20)

    # 52주 자리 — 0(저점) ~ 100(고점)
    ind['pos52'] = [None] * len(c)
    for i in range(len(c)):
        lo_i = max(0, i - 251)
        if i - lo_i < 60:
            continue
        hh = max(h[lo_i:i + 1])
        ll = min(l[lo_i:i + 1])
        ind['pos52'][i] = 50.0 if hh == ll else (c[i] - ll) / (hh - ll) * 100

    ind['ret5'] = [None] * len(c)
    for i in range(5, len(c)):
        ind['ret5'][i] = (c[i] / c[i - 5] - 1) * 100
    return ind


# ─────────────────────────────────────────────────────────────────────
# 방향 축 — −100(매도) ~ +100(매수)
# ─────────────────────────────────────────────────────────────────────

def sym_rank(series, i, window=252, min_obs=60):
    """제 과거 안 백분위를 −100~+100 으로 편다. 없으면 None (0 이 아니다).

    **고정 문턱을 쓰지 않는 까닭.** 「RSI 30 이하 과매도」 같은 자리는 변동성이
    연 15% 인 종목과 70% 인 종목에서 뜻이 전혀 다르다. 제 이력 안 자리로 옮기면
    종목을 바꿔도 같은 뜻이 된다.
    """
    p = V.pct_rank(series, i, window=window, min_obs=min_obs)
    return None if p is None else (p - 50.0) * 2.0


def _mean(vals):
    xs = [x for x in vals if x is not None]
    return (sum(xs) / len(xs)) if xs else None


def trend_tilt(ind, i):
    """추세장인가 횡보장인가 — −1(완전 횡보) ~ +1(완전 추세).

    ADX 20 아래를 횡보, 30 위를 추세로 보고 사이는 선형으로 섞는다. 이 값이
    모멘텀 축의 **부호**가 된다.

    **이 장치가 정말 보탬이 되는지는 따로 재야 한다.** signal_backtest 가
    부호전환을 켠 판과 끈 판을 나란히 돌린다 — 안 나으면 뺀다.
    """
    a = ind['adx14'][i]
    if a is None:
        return None
    # ADX 20 → −1(횡보), 25 → 0(반반), 30 → +1(추세). 사이는 선형.
    return max(-1.0, min(1.0, (a - 25.0) / 5.0))


def axis_trend(ind, i):
    """축 하나 — **추세가 어느 쪽인가.** 양수면 위."""
    parts = {}
    c = ind['close'][i]
    ma20, ma60 = ind['ma20'][i], ind['ma60'][i]
    if c and ma20 and ma60:
        # 정배열 +100 / 역배열 −100 / 섞이면 그 사이
        up = (1 if c > ma20 else -1) + (1 if ma20 > ma60 else -1) + (1 if c > ma60 else -1)
        parts['align'] = up / 3.0 * 100

    if ind['macd_hist'][i] is not None:
        parts['macd_hist'] = sym_rank(ind['macd_hist'], i)
    if ind['ma20_slope'][i] is not None:
        parts['ma20_slope'] = sym_rank(ind['ma20_slope'], i)
    if ind['disparity60'][i] is not None:
        parts['disparity60'] = sym_rank(ind['disparity60'], i)

    a, p, m = ind['adx14'][i], ind['plus_di'][i], ind['minus_di'][i]
    if None not in (a, p, m):
        # 방향은 DI 가, 세기는 ADX 가 정한다. 추세가 약하면 이 몫도 작아진다.
        s = p + m
        d = ((p - m) / s) if s else 0.0
        parts['di'] = d * min(1.0, a / 40.0) * 100

    if ind['rs20'][i] is not None:
        parts['rs20'] = sym_rank(ind['rs20'], i)
    return _mean(parts.values()), parts


def axis_momentum(ind, i, flip=True):
    """축 둘 — **모멘텀.** 부호가 국면에 따라 뒤집힌다.

    추세장에서 RSI 70 은 「올라타라」이고 횡보장에서는 「되돌린다」이다. 이걸
    하나로 고정하면 둘 중 한 장세에서 반드시 틀린다. `trend_tilt` 로 섞는다.

    flip=False 로 두면 **언제나 순추세**로 읽는다 — 백테스트에서 이 장치가
    값을 하는지 견주는 자리다.
    """
    raw = {}
    if ind['rsi14'][i] is not None:
        raw['rsi'] = (ind['rsi14'][i] - 50.0) * 2.0
    if ind['stoch_k'][i] is not None:
        raw['stoch'] = (ind['stoch_k'][i] - 50.0) * 2.0
    if ind['pctb'][i] is not None:
        raw['pctb'] = max(-100.0, min(100.0, (ind['pctb'][i] - 0.5) * 200))
    if ind['ret20'][i] is not None:
        raw['ret20'] = sym_rank(ind['ret20'], i)
    if ind['ret5'][i] is not None:
        raw['ret5'] = sym_rank(ind['ret5'], i)
    if not raw:
        return None, {}

    if not flip:
        return _mean(raw.values()), dict(raw)

    tilt = trend_tilt(ind, i)
    if tilt is None:
        return None, {}
    # ret20 은 추세 그 자체라 되돌림 쪽으로 뒤집지 않는다. 뒤집으면 「20일 많이
    # 올랐으니 판다」가 되어 추세 축과 정면으로 부딪힌다.
    parts = {}
    for k, v in raw.items():
        if v is None:
            parts[k] = None
            continue
        parts[k] = v if k == 'ret20' else v * tilt
    parts['_tilt'] = tilt * 100
    out = _mean([v for k, v in parts.items() if not k.startswith('_')])
    return out, parts


def axis_flow(ind, i, flow=None):
    """축 셋 — **돈이 들어오는가.**

    종목별 외국인·기관 순매수는 이 저장소에 **이력이 없다**(오늘부터 쌓는다).
    없는 동안에는 거래량이 실린 지표(OBV·MFI·거래량 z)만으로 셈하고, 수급
    원자료가 들어오면 같은 축에 얹힌다. 없는 것을 0 으로 채우지 않는다 —
    채우면 자료 없는 종목이 저절로 중립으로 보인다.
    """
    parts = {}
    if ind['obv_slope20'][i] is not None:
        parts['obv'] = sym_rank(ind['obv_slope20'], i)
    if ind['mfi14'][i] is not None:
        parts['mfi'] = (ind['mfi14'][i] - 50.0) * 2.0
    vz = volume_zscore(ind['volume'], i)
    if vz is not None and ind['ret5'][i] is not None:
        # 거래량은 그 자체로 방향이 없다. **오른 날 터졌는가 내린 날 터졌는가**
        # 를 보아야 뜻이 생긴다.
        sign = 1.0 if ind['ret5'][i] > 0 else -1.0
        parts['volume'] = max(-100.0, min(100.0, vz * 30.0)) * sign

    if flow:
        for key, name in (('foreign_cum5', 'foreign5'), ('foreign_cum20', 'foreign20'),
                          ('inst_cum5', 'inst5'), ('inst_cum20', 'inst20')):
            if not flow.get(key):
                continue
            z = V.zscore(flow[key], i, min_obs=V.FLOW_MIN_OBS)
            if z is not None:
                parts[name] = max(-100.0, min(100.0, z * 40.0))
    return _mean(parts.values()), parts


def axis_supply(ind, vp, i):
    """축 넷 — **매물대.** 머리 위에 물량이 많으면 오르기 힘들다."""
    if not vp:
        return None, {}
    parts = {}
    # 위 물량이 적을수록 양수. 위아래가 반반이면 0.
    parts['overhead'] = vp['below_pct'] - vp['above_pct']

    c = ind['close'][i]
    if vp['poc'] and c:
        # POC 위에 있으면 그 자리가 지지가 된다. 다만 너무 멀면 뜻이 옅어져
        # ATR 로 재서 자른다.
        a = ind['atr14'][i]
        if a:
            d = (c - vp['poc']) / a
            parts['poc'] = max(-100.0, min(100.0, d * 25.0))

    # 가치영역 돌파는 그 자체로 신호다
    if c > vp['vah']:
        parts['va'] = 60.0
    elif c < vp['val']:
        parts['va'] = -60.0
    else:
        parts['va'] = 0.0
    return _mean(parts.values()), parts


def confidence(ind, i, axes):
    """0~100. **방향이 아니라 얼마나 믿을 만한가.**

    두 가지를 곱한다.
      압축   눌려 있을수록 곧 크게 움직인다 → 신호가 값을 할 자리다
      일치도 축들이 서로 반대를 가리키면 깎는다 — 네 축이 −80,+70 으로 갈려
             평균이 0 근처로 나온 것과, 넷이 다 0 근처인 것은 전혀 다른 상태다

    압축을 **방향 점수에 넣지 않는** 까닭도 여기 있다. 눌린 것은 곧 움직인다는
    말이지 어디로 움직인다는 말이 아니다.
    """
    comp, _ = V.axis_compression(ind, i)
    vals = [v for v in axes.values() if v is not None]
    if len(vals) < 2:
        agree = None
    else:
        sd = st.pstdev(vals)
        # 표준편차 0 → 100점, 80 이상으로 갈리면 0점
        agree = max(0.0, 100.0 - sd / 80.0 * 100.0)
    parts = {'compression': comp, 'agreement': agree,
             'axes_present': len(vals) / 4.0 * 100}
    return _mean(parts.values()), parts


AXIS_KEYS = [('t', 'trend'), ('m', 'momentum'), ('f', 'flow'), ('s', 'supply')]
PRIOR = {'trend': 0.25, 'momentum': 0.25, 'flow': 0.25, 'supply': 0.25}


def composite(axes, weights=None):
    """있는 축만으로 셈하고 가중치를 다시 나눈다. 없는 축을 0 으로 채우지 않는다."""
    w = weights or PRIOR
    have = {k: v for k, v in axes.items() if v is not None}
    if not have:
        return None, {}, sorted(PRIOR)
    tw = sum(w.get(k, 0.0) for k in have)
    if tw <= 0:
        return None, {}, sorted(set(PRIOR) - set(have))
    score = sum(w.get(k, 0.0) * v for k, v in have.items()) / tw
    used = {k: round(w.get(k, 0.0) / tw, 4) for k in have}
    return score, used, sorted(set(PRIOR) - set(have))


# ─────────────────────────────────────────────────────────────────────
# 신호 등급
# ─────────────────────────────────────────────────────────────────────

# 점수 자체가 아니라 **제 이력 안 자리**로 등급을 매긴다. 「+40점」은 셈법을
# 바꾸면 뜻이 달라지지만 「제 이력 상위 10%」는 그대로다.
BANDS = [(90, 'strong_buy', '적극 매수'),
         (70, 'buy', '매수'),
         (30, 'hold', '중립'),
         (10, 'reduce', '비중축소'),
         (0, 'sell', '매도')]


def band_of(self_pct):
    if self_pct is None:
        return None, None
    for cut, key, label in BANDS:
        if self_pct >= cut:
            return key, label
    return 'sell', '매도'


def score_series(ind, bars, flow=None, flip=True, vp_every=5):
    """모든 날의 축·합산·확신도를 셈한다. 백테스트가 이것을 그대로 먹는다.

    물량표를 세는 것은 느리므로(칸 24 × 되돌아보기 120) `vp_every` 일마다 다시
    세지만, **현재가 기준의 저항·지지는 날마다 다시 읽는다**(`vp_at`). 처음에는
    둘을 함께 닷새마다 셌다가, 사이 나흘이 닷새 전 종가로 잰 지지선을 내놓는 흠을
    검산기가 잡았다.
    """
    n = len(ind['close'])
    rows = []
    vb = None
    for i in range(n):
        if i % vp_every == 0 or vb is None:
            vb = volume_profile(bars, i)
        vp = vp_at(vb, ind['close'][i])
        t, tp = axis_trend(ind, i)
        m, mp = axis_momentum(ind, i, flip=flip)
        f, fp = axis_flow(ind, i, flow)
        s, sp = axis_supply(ind, vp, i)
        axes = {'trend': t, 'momentum': m, 'flow': f, 'supply': s}
        tot, used, missing = composite(axes)
        conf, cparts = confidence(ind, i, axes)
        rows.append({
            'i': i, 't': t, 'm': m, 'f': f, 's': s,
            'total': tot, 'weights_used': used, 'axes_missing': missing,
            'conf': conf, 'conf_parts': cparts, 'vp': vp,
            'parts': {'trend': tp, 'momentum': mp, 'flow': fp, 'supply': sp},
        })
    return rows


# ─────────────────────────────────────────────────────────────────────
# 워크포워드 가중 — 목표는 「이후 수익률」
# ─────────────────────────────────────────────────────────────────────

BURN_IN = 150
REFIT_EVERY = 20
MIN_FIT_OBS = 12
K_PSEUDO = 10.0


def forward_ret(bars, j, h):
    """j 일 종가 대비 이후 h 거래일 종가 수익률(%)."""
    if j + h >= len(bars):
        return None
    return (bars[j + h]['c'] / bars[j]['c'] - 1) * 100


def fit_weights(bars, rows, t, h=10, prior=None, k=K_PSEUDO):
    """t 시점 가중치. **t 보다 앞서고 결과가 이미 드러난 날만** 쓴다(j+h < t).

    vol_lib.fit_weights 와 같은 꼴이되 목표가 다르다 — 거기서는 「이후 낙폭」,
    여기서는 「이후 수익률」이다.

    **음수 상관을 뒤집지 않는다.** 어떤 축의 ρ 가 −0.2 로 나왔다고 부호를 뒤집어
    쓰면 두 해치 자료에 맞춘 것이 되기 쉽다. 양수 몫만 쓰고 음수는 사전값 쪽에
    남긴다. 대신 잰 값은 산출물에 그대로 적어 둔다 — 뒤집어야 할 만큼 꾸준히
    음수라면 자료가 쌓이면서 드러날 것이다.
    """
    prior = prior or PRIOR
    fitted, detail, lam_raw = {}, {}, {}
    for key, name in AXIS_KEYS:
        xs, ys = [], []
        for j in range(max(0, t - h)):
            if rows[j][key] is None:
                continue
            r = forward_ret(bars, j, h)
            if r is None:
                continue
            xs.append(rows[j][key])
            ys.append(r)
        n = len(xs)
        if n >= MIN_FIT_OBS:
            rho = V.spearman(xs, ys)
            ne = V.effective_n(n, h)
            lam = V.evidence(n, h, k)
            # **잰 상관을 제 표준오차만큼 깎아서 쓴다.**
            #
            # 이게 없으면 ρ=0.05 인 축과 ρ=0.00 인 축이 92% 대 2.5% 로 갈린다 —
            # 몫을 양수 부분의 비율로 나누기 때문에, 하나만 간신히 양수면 그것이
            # 다 가져간다. 그런데 유효관측 87개에서 순위상관의 표준오차는 0.11
            # 이라, ρ=0.05 는 **0 과 구별되지 않는 값**이다. 구별되지 않는 것으로
            # 가중치를 92% 주는 것은 잡음을 실력으로 읽는 일이다.
            #
            # 그래서 |ρ| 에서 표준오차 하나를 빼고 남는 만큼만 쓴다. 표준오차를
            # 못 넘는 축은 0 이 되어 사전값 쪽에 남는다. 넷이 다 0 이면 균등가중
            # 그대로 간다 — 아무것도 재지 못했을 때 돌아갈 자리가 거기다.
            se = 1.0 / math.sqrt(max(1.0, ne - 1.0))
            rho_adj = max(0.0, abs(rho) - se) * (1.0 if rho >= 0 else -1.0)
            fitted[name] = max(0.0, rho_adj)
            lam_raw[name] = lam
            detail[name] = {'rho': round(rho, 4), 'se': round(se, 4),
                            'rho_adj': round(rho_adj, 4), 'n': n,
                            'n_eff': round(ne, 1),
                            'lambda': round(lam, 3)}
        else:
            lam_raw[name] = 0.0
            detail[name] = {'rho': None, 'n': n, 'n_eff': None, 'lambda': 0.0,
                            'note': '표본 %d 일 — 상관을 재지 못해 사전값으로 넣습니다' % n}

    s = sum(fitted.values())
    share = {k2: v / s for k2, v in fitted.items()} if s > 0 else {}

    # **쏠리는 정도를 잰 상관의 크기만큼으로 묶는다.**
    #
    # 표준오차를 못 넘는 상관을 0 으로 둔 뒤에도 문제가 남아 있었다. 몫을 양수
    # 부분의 **비율**로 나누므로, 넷 가운데 하나만 문턱을 넘으면 그 하나가 share
    # 1.0 을 가져가고 가중치 80~92% 가 된다. 문턱을 넘었다는 것은 「0 은 아닌 것
    # 같다」는 뜻이지 「이 축 하나가 다 설명한다」는 뜻이 아니다.
    #
    # 그래서 한 겹 더 둔다. 잰 상관을 다 더한 값(0~1)을 **증거의 총량**으로 보고,
    # 그만큼만 쏠린 몫 쪽으로 간다. ρ_adj 가 0.065 면 쏠림도 6.5% 만 먹는다.
    # 새로 고를 값이 없다 — 상관의 크기가 곧 쏠릴 만큼이다.
    #
    # 이 겹이 없을 때 이 자료에서 코스피 프록시의 매물대 축이 80%, 어떤 종목은
    # 자금수급 축이 92% 를 가져갔다. 그 값들은 ρ=0.22 로 잰 것이다.
    strength = min(1.0, sum(fitted.values()))
    if share:
        share = {k2: strength * v + (1 - strength) * prior[k2]
                 for k2, v in ((k3, share.get(k3, 0.0)) for k3 in prior)}

    w = {}
    for _, name in AXIS_KEYS:
        # **표시용으로 반올림한 값을 도로 읽어 쓰지 않는다.**
        # vol_lib.fit_weights 는 `detail[name]['lambda']`(세 자리로 반올림된 것)를
        # 도로 읽어 셈에 쓴다. 눈에 안 띄는 실수다 — 가중치가 1e-4 쯤 달라질 뿐이라
        # 아무 데서도 터지지 않는다. 파이썬과 JS 를 맞추는 골든벡터 대조가 이걸
        # 잡았다. 여기서는 반올림 안 된 값을 쓴다.
        lam = lam_raw[name]
        w[name] = lam * share.get(name, 0.0) + (1 - lam) * prior[name]
        detail[name]['fitted_share'] = round(share.get(name, 0.0), 4) if share else None
        detail[name]['prior'] = prior[name]
    tot = sum(w.values())
    w = {k2: v / tot for k2, v in w.items()} if tot else dict(prior)
    for name in w:
        detail[name]['weight'] = round(w[name], 4)
    return w, detail


def adaptive_series(bars, rows, h=10, burn=BURN_IN, refit=REFIT_EVERY):
    """날마다 점수를 낸다. 가중치는 한 달에 한 번 과거만으로 다시 잰다."""
    n = len(bars)
    score = [None] * n
    wmap = [None] * n
    history = []
    cur = None
    for t in range(n):
        if t >= burn and (t - burn) % refit == 0:
            cur, detail = fit_weights(bars, rows, t, h)
            history.append({'d': bars[t]['d'],
                            'weights': {k: round(v, 4) for k, v in cur.items()},
                            'detail': detail})
        if cur:
            axes = {name: rows[t][key] for key, name in AXIS_KEYS}
            sc, used, _ = composite(axes, cur)
            score[t] = sc
            wmap[t] = used
    return score, wmap, history


# ─────────────────────────────────────────────────────────────────────
# 매매 계획 — 점수를 숫자로 바꾸는 자리
# ─────────────────────────────────────────────────────────────────────

STOP_ATR = 2.0        # 손절 폭. 2×ATR 는 하루 등락에 털리지 않으면서 -10% 언저리다.
TRAIL_ATR = 3.0       # 이익 구간 트레일링
TARGET_VOL = 20.0     # 연 20% 를 목표 변동성으로 두고 비중을 정한다
MAX_WEIGHT = 1.0


def plan_of(ind, row, i, horizon, self_pct):
    """진입·손절·청산·비중을 숫자로 낸다.

    **손절을 언제나 함께 낸다.** 매수 신호만 주고 손절을 안 주면, 신호가 틀렸을
    때 얼마를 잃는지가 정해지지 않는다 — 그건 신호가 아니다.

    비중은 변동성 타겟팅이다. 연 60% 로 흔들리는 종목과 15% 짜리를 같은 금액으로
    들면 앞엣것이 손익을 통째로 좌우한다.
    """
    band, label = band_of(self_pct)
    c = ind['close'][i]
    a = ind['atr14'][i]
    rv = ind['rv20'][i]
    vp = row.get('vp')

    out = {'band': band, 'band_label': label, 'horizon': horizon,
           'score': row['total'], 'self_pct': self_pct, 'conf': row['conf'],
           'close': c}
    if band is None or c is None:
        out['note'] = '표본이 모자라 계획을 내지 않습니다'
        return out

    if band in ('strong_buy', 'buy'):
        out['action'] = '매수'
        # 손절은 둘 가운데 **가까운** 쪽 — 매물대 지지가 ATR 손절보다 위면
        # 그쪽이 먼저 깨지는 자리다.
        stops = []
        if a:
            stops.append(c - STOP_ATR * a)
        if vp and vp.get('nearest_dn') and vp['nearest_dn'] < c:
            stops.append(vp['nearest_dn'] * 0.995)
        out['stop'] = max(stops) if stops else None
        # 목표는 머리 위 매물대. 없으면 손절폭의 1.5배.
        if vp and vp.get('nearest_up') and vp['nearest_up'] > c:
            out['target'] = vp['nearest_up']
        elif out['stop']:
            out['target'] = c + (c - out['stop']) * 1.5
        out['trail'] = (c - TRAIL_ATR * a) if a else None
    elif band in ('sell', 'reduce'):
        out['action'] = '비중축소' if band == 'reduce' else '청산'
        out['stop'] = None
        out['target'] = None
        out['note'] = '보유분 정리 신호입니다. 하락 베팅 신호가 아닙니다.'
    else:
        out['action'] = '관망'

    if out.get('stop') and c:
        out['stop_pct'] = (out['stop'] / c - 1) * 100
    if out.get('target') and c:
        out['target_pct'] = (out['target'] / c - 1) * 100
    if out.get('stop') and out.get('target') and c:
        risk = c - out['stop']
        rew = out['target'] - c
        out['rr'] = round(rew / risk, 2) if risk > 0 else None

    # 비중 — 변동성 타겟 × 확신도
    if rv and rv > 0 and band in ('strong_buy', 'buy'):
        w = TARGET_VOL / rv
        if row['conf'] is not None:
            w *= max(0.0, min(1.0, row['conf'] / 100.0))
        out['weight'] = round(min(MAX_WEIGHT, w), 3)
        out['weight_note'] = ('연 %.0f%% 변동성을 목표로 잡고 이 종목의 20일 실현변동성 '
                              '%.0f%% 와 확신도로 줄인 값입니다.' % (TARGET_VOL, rv))
    elif band in ('strong_buy', 'buy'):
        out['weight'] = None
        out['weight_note'] = '변동성을 재지 못해 비중을 내지 않습니다'
    return out


def entry_trigger(scores, self_pcts, i, cut=70.0):
    """**상향 돌파한 날만** 진입으로 친다.

    점수가 높은 날을 모두 진입으로 세면, 한 번 오른 뒤 여러 날 높게 머무는 구간이
    진입 여러 건으로 부풀어 성적이 왜곡된다. 타이밍은 「높다」가 아니라
    「높아졌다」이다.
    """
    if i == 0 or self_pcts[i] is None or self_pcts[i - 1] is None:
        return False
    return self_pcts[i] >= cut and self_pcts[i - 1] < cut


def exit_trigger(self_pcts, i, cut=30.0):
    """하향 이탈."""
    if i == 0 or self_pcts[i] is None or self_pcts[i - 1] is None:
        return False
    return self_pcts[i] < cut and self_pcts[i - 1] >= cut


def self_pct_series(scores, window=252, min_obs=60):
    """점수의 **제 이력 안 자리**. 오늘까지만 보고 잰다(미래 참조 없음)."""
    out = [None] * len(scores)
    for i in range(len(scores)):
        out[i] = V.pct_rank(scores, i, window=window, min_obs=min_obs)
    return out
