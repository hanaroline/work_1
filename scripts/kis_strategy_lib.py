# -*- coding: utf-8 -*-
"""한국투자증권 전략빌더 기본 전략 10종 — 일봉 위에서 돌리는 판.

공식 저장소 <https://github.com/koreainvestment/open-trading-api> 의
`strategy_builder/` 를 옮긴 것이다. 세 자리를 맞대어 읽고 베꼈다.

    strategy/strategy_01..10_*.py   실행 엔진 — 조건문과 기본값
    strategy_core/preset/*.py       빌더 프리셋 — 진입/청산/**리스크 규칙**
    core/indicators.py              지표 셈법

**왜 베끼는가.** 원본은 한투 오픈API 에 붙어 「지금」 한 종목의 신호 하나를 낸다.
여기서 필요한 것은 그 반대다 — 종목 276개의 **모든 날**에 신호를 다시 깔아
성적을 재야 한다. 원본 구조로는 그게 안 된다(API 호출이 하루 한 점이다).
그래서 조건은 그대로 두고 **시계열 위에서 도는 꼴**로만 바꾼다.

**베끼면서 고친 자리는 세 곳뿐이고, 셋 다 아래에 적어 둔다.** 조용히 고치면
「한투 전략을 돌렸다」는 말이 거짓이 된다.

    1. 모멘텀 — 단위 (calc_returns 는 소수, 기준값은 퍼센트. 원본대로면 안 켜진다)
    2. 52주 신고가 — 현재가 API 대신 일봉 252봉의 전고
    3. 변동성 확장 — 프리셋의 절대 기준(0.02) 대신 실행 엔진의 상대 기준(최저×1.1)

원본에 없는 지표를 더하지 않았다. RSI 도 MACD 도 넣지 않는다 — 넣는 순간
「전략빌더 10종」이 아니라 내가 만든 다른 것이 된다.
"""

import math
import statistics as st


# ─────────────────────────────────────────────────────────────────────
# 지표 — core/indicators.py 를 그대로
# ─────────────────────────────────────────────────────────────────────

def sma(xs, n):
    """단순이동평균. pandas `rolling(n).mean()` 과 같게 n 개가 차야 값을 낸다."""
    out = [None] * len(xs)
    if n <= 0 or len(xs) < n:
        return out
    acc = sum(xs[:n])
    out[n - 1] = acc / n
    for i in range(n, len(xs)):
        acc += xs[i] - xs[i - n]
        out[i] = acc / n
    return out


def roc_pct(closes, n):
    """N일 수익률(%). `calc_returns` 는 소수를 내지만 여기서는 퍼센트로 낸다.

    **고친 자리 1.** 원본 `strategy_02_momentum.py` 는 소수(0.30)를 퍼센트
    기준값(30)과 견준다 — `latest_return >= 30` 은 60일에 3000% 오른 종목을
    찾는 조건이라 현실에서 켜지지 않는다. 프리셋의 라벨이 「매수 기준(%)」이고
    빌더가 내보내는 DSL 도 `roc(60) > 30` 이므로, **빌더의 뜻**을 따라 퍼센트로
    맞췄다. 기준값 30/−20 은 손대지 않았다.
    """
    out = [None] * len(closes)
    for i in range(n, len(closes)):
        p = closes[i - n]
        if p:
            out[i] = (closes[i] / p - 1.0) * 100.0
    return out


def disparity(closes, n):
    """이격도 = 종가 / 이동평균 × 100. 100 이 평균, 넘으면 과매수 쪽이다."""
    ma = sma(closes, n)
    out = [None] * len(closes)
    for i in range(len(closes)):
        if ma[i]:
            out[i] = closes[i] / ma[i] * 100.0
    return out


def ret_std(closes, n):
    """일간 수익률의 표준편차(n일). `calc_volatility` 와 같이 **표본** 표준편차다.

    pandas `Series.std()` 의 기본이 ddof=1 이라 그쪽을 따른다. ddof 를 0 으로
    두면 값이 조금씩 작아지고, 「변동성 최저의 1.1배」라는 문턱이 미묘하게
    헐거워진다.
    """
    chg = [None] * len(closes)
    for i in range(1, len(closes)):
        if closes[i - 1]:
            chg[i] = closes[i] / closes[i - 1] - 1.0
    out = [None] * len(closes)
    for i in range(len(closes)):
        w = chg[i - n + 1:i + 1]
        if len(w) == n and None not in w:
            out[i] = st.stdev(w)
    return out


def change_pct(closes):
    """전일 대비 등락률(%)."""
    out = [None] * len(closes)
    for i in range(1, len(closes)):
        if closes[i - 1]:
            out[i] = (closes[i] / closes[i - 1] - 1.0) * 100.0
    return out


def consecutive(closes, direction):
    """연속 상승/하락 일수. `calc_consecutive_days` 를 매 봉마다 낸 것이다."""
    out = [0] * len(closes)
    for i in range(1, len(closes)):
        up = closes[i] > closes[i - 1]
        dn = closes[i] < closes[i - 1]
        hit = up if direction == 'up' else dn
        out[i] = out[i - 1] + 1 if hit else 0
    return out


def ibs(highs, lows, closes):
    """강한 종가 비율 = (종가−저가) / (고가−저가). 고가=저가면 0.5."""
    out = [None] * len(closes)
    for i in range(len(closes)):
        h, l, c = highs[i], lows[i], closes[i]
        if h is None or l is None or c is None:
            continue
        out[i] = 0.5 if h == l else (c - l) / (h - l)
    return out


def rolling_max(xs, n, shift=0):
    """직전 n봉의 최대. `shift=1` 이면 **오늘을 빼고** 어제까지를 본다."""
    out = [None] * len(xs)
    for i in range(len(xs)):
        hi = i - shift
        lo = hi - n + 1
        if lo < 0:
            continue
        w = [v for v in xs[lo:hi + 1] if v is not None]
        if len(w) == n:
            out[i] = max(w)
    return out


# ─────────────────────────────────────────────────────────────────────
# 전략 10종
# ─────────────────────────────────────────────────────────────────────
#
# 각 전략은 다음을 갖는다.
#   id / name / category   원본의 것 그대로
#   params                 원본 기본값 그대로 (바꾸지 않았다)
#   risk                   프리셋 `builder_state['risk']` 그대로 — **이게 타이밍이다**
#   rule                   사람이 읽는 조건문
#   actions(bars)          봉마다 'BUY' / 'SELL' / None
#
# **리스크 규칙을 빼놓지 않는 까닭.** 「언제 사느냐」만 있고 「어디서 자르느냐」가
# 없으면 그건 전략이 아니라 관전평이다. 원본 프리셋은 전략마다 손절·익절을
# 다르게 잡아 두었다(추세형 5%, 단타형 3%). 그 숫자가 화면의 손절가·목표가가 된다.

def _bar_cols(bars):
    return ([b['o'] for b in bars], [b['h'] for b in bars],
            [b['l'] for b in bars], [b['c'] for b in bars])


def _golden_cross(bars, short_period=5, long_period=20):
    _, _, _, c = _bar_cols(bars)
    f, s = sma(c, short_period), sma(c, long_period)
    out = [None] * len(bars)
    for i in range(1, len(bars)):
        if None in (f[i], s[i], f[i - 1], s[i - 1]):
            continue
        if f[i - 1] < s[i - 1] and f[i] > s[i]:
            out[i] = 'BUY'
        elif f[i - 1] > s[i - 1] and f[i] < s[i]:
            out[i] = 'SELL'
    return out


def _momentum(bars, lookback_days=60, buy_threshold=30.0, sell_threshold=-20.0):
    _, _, _, c = _bar_cols(bars)
    r = roc_pct(c, lookback_days)
    out = [None] * len(bars)
    for i in range(len(bars)):
        if r[i] is None:
            continue
        if r[i] >= buy_threshold:
            out[i] = 'BUY'
        elif r[i] <= sell_threshold:
            out[i] = 'SELL'
    return out


def _week52_high(bars, breakout_margin=0.0):
    """**고친 자리 2.** 원본은 현재가 API 가 주는 52주 고가를 쓴다(일봉을 안 본다).

    일봉만 있는 여기서는 **오늘을 뺀 직전 252봉의 고가**를 전고로 본다.
    오늘을 넣으면 종가 > 오늘고가 가 되어 영영 안 켜진다 — 뺄 수밖에 없다.
    """
    _, h, _, c = _bar_cols(bars)
    hi = rolling_max(h, 252, shift=1)
    out = [None] * len(bars)
    for i in range(len(bars)):
        if hi[i] is None:
            continue
        if c[i] > hi[i] * (1 + breakout_margin / 100.0):
            out[i] = 'BUY'
        elif c[i] < hi[i]:
            out[i] = 'SELL'
    return out


def _consecutive(bars, buy_days=5, sell_days=5):
    _, _, _, c = _bar_cols(bars)
    up, dn = consecutive(c, 'up'), consecutive(c, 'down')
    out = [None] * len(bars)
    for i in range(len(bars)):
        if up[i] >= buy_days:
            out[i] = 'BUY'
        elif dn[i] >= sell_days:
            out[i] = 'SELL'
    return out


def _disparity(bars, period=20, oversold_threshold=90.0, overbought_threshold=110.0):
    _, _, _, c = _bar_cols(bars)
    d = disparity(c, period)
    out = [None] * len(bars)
    for i in range(len(bars)):
        if d[i] is None:
            continue
        if d[i] < oversold_threshold:
            out[i] = 'BUY'
        elif d[i] > overbought_threshold:
            out[i] = 'SELL'
    return out


def _breakout_fail(bars, lookback_days=20, fail_within_days=3, fail_threshold=-3.0):
    """전고를 뚫고 올라섰다가 되밀린 자리. **매도(청산)만 낸다** — 원본도 그렇다."""
    _, h, _, c = _bar_cols(bars)
    out = [None] * len(bars)
    for i in range(lookback_days + fail_within_days, len(bars)):
        recent = max(h[i - fail_within_days + 1:i + 1])
        prev = max(h[i - fail_within_days - lookback_days + 1:i - fail_within_days + 1])
        if recent > prev and (c[i] - recent) / recent * 100.0 <= fail_threshold:
            out[i] = 'SELL'
    return out


def _strong_close(bars, min_close_ratio=0.8):
    o, h, l, c = _bar_cols(bars)
    v = ibs(h, l, c)
    out = [None] * len(bars)
    for i in range(len(bars)):
        if v[i] is None:
            continue
        if v[i] >= min_close_ratio:
            out[i] = 'BUY'
        elif v[i] < 0.5:
            out[i] = 'SELL'
    return out


def _volatility(bars, lookback_days=10, breakout_pct=3.0):
    """**고친 자리 3.** 프리셋은 `변동성 < 0.02` 라는 **절대** 문턱을 쓴다.

    그 값은 종목마다 뜻이 다르다 — 채권 ETF 는 늘 0.02 아래라 조건이 없는 것과
    같고, 나스닥 2배 ETF 는 조용할 때조차 0.02 위라 영영 안 켜진다. 실행 엔진
    `strategy_08_volatility.py` 는 그 자리를 **직전 10봉 최저 변동성의 1.1배**라는
    상대 기준으로 쓴다. 「변동성 최저에서 돌파」라는 이름에 맞는 쪽도 그쪽이라
    실행 엔진을 따랐다.
    """
    _, _, _, c = _bar_cols(bars)
    vol = ret_std(c, lookback_days)
    chg = change_pct(c)
    out = [None] * len(bars)
    for i in range(len(bars)):
        if chg[i] is None:
            continue
        if vol[i] is not None:
            w = [v for v in vol[i - lookback_days + 1:i + 1] if v is not None]
            if len(w) == lookback_days and vol[i] <= min(w) * 1.1 and chg[i] >= breakout_pct:
                out[i] = 'BUY'
                continue
        if chg[i] <= -breakout_pct:
            out[i] = 'SELL'
    return out


def _mean_reversion(bars, period=5, buy_threshold=-3.0, sell_threshold=3.0):
    _, _, _, c = _bar_cols(bars)
    ma = sma(c, period)
    out = [None] * len(bars)
    for i in range(len(bars)):
        if not ma[i]:
            continue
        dev = (c[i] - ma[i]) / ma[i] * 100.0
        if dev <= buy_threshold:
            out[i] = 'BUY'
        elif dev >= sell_threshold:
            out[i] = 'SELL'
    return out


def _trend_filter(bars, ma_period=60):
    _, _, _, c = _bar_cols(bars)
    ma = sma(c, ma_period)
    chg = change_pct(c)
    out = [None] * len(bars)
    for i in range(len(bars)):
        if ma[i] is None or chg[i] is None:
            continue
        if c[i] > ma[i] and chg[i] > 0:
            out[i] = 'BUY'
        elif c[i] < ma[i] and chg[i] < 0:
            out[i] = 'SELL'
    return out


STRATEGIES = [
    {
        'id': 'golden_cross', 'no': 1, 'name': '골든크로스', 'category': '추세추종',
        'desc': '단기 MA가 장기 MA를 상향 돌파 시 매수',
        'params': {'short_period': 5, 'long_period': 20},
        'risk': {'stop_loss': 5.0, 'take_profit': None},
        'buy_rule': '5일선이 20일선을 아래에서 위로 뚫는 날',
        'sell_rule': '5일선이 20일선을 위에서 아래로 뚫는 날',
        'warmup': 21, 'fn': _golden_cross,
    },
    {
        'id': 'momentum', 'no': 2, 'name': '모멘텀', 'category': '추세추종',
        'desc': 'N일 수익률 기준 매수/매도',
        'params': {'lookback_days': 60, 'buy_threshold': 30.0, 'sell_threshold': -20.0},
        'risk': {'stop_loss': 5.0, 'take_profit': None},
        'buy_rule': '60일 수익률이 +30% 이상',
        'sell_rule': '60일 수익률이 −20% 이하',
        'warmup': 61, 'fn': _momentum,
    },
    {
        'id': 'week52_high', 'no': 3, 'name': '52주 신고가', 'category': '돌파매매',
        'desc': '52주 최고가 돌파 시 매수',
        'params': {'breakout_margin': 0.0},
        'risk': {'stop_loss': 5.0, 'take_profit': 15.0},
        'buy_rule': '종가가 직전 252봉 최고가를 넘어선 날',
        'sell_rule': '종가가 그 전고 아래로 되돌아온 날',
        'warmup': 253, 'fn': _week52_high,
    },
    {
        'id': 'consecutive', 'no': 4, 'name': '연속 상승/하락', 'category': '패턴',
        'desc': 'N일 연속 상승 시 매수',
        'params': {'buy_days': 5, 'sell_days': 5},
        'risk': {'stop_loss': 5.0, 'take_profit': None},
        'buy_rule': '5일 연속 오른 날',
        'sell_rule': '5일 연속 내린 날',
        'warmup': 6, 'fn': _consecutive,
    },
    {
        'id': 'disparity', 'no': 5, 'name': '이격도', 'category': '역추세',
        'desc': 'MA 대비 이격 기준 매수/매도',
        'params': {'period': 20, 'oversold_threshold': 90.0, 'overbought_threshold': 110.0},
        'risk': {'stop_loss': 5.0, 'take_profit': 10.0},
        'buy_rule': '종가가 20일선의 90% 아래 (과매도)',
        'sell_rule': '종가가 20일선의 110% 위 (과매수)',
        'warmup': 21, 'fn': _disparity,
    },
    {
        'id': 'breakout_fail', 'no': 6, 'name': '돌파 실패', 'category': '손절',
        'desc': '전고점 돌파 실패 시 매도',
        'params': {'lookback_days': 20, 'fail_within_days': 3, 'fail_threshold': -3.0},
        'risk': {'stop_loss': 3.0, 'take_profit': None},
        'buy_rule': None,
        'sell_rule': '최근 3봉이 직전 20봉 전고를 넘었는데 종가가 그 고점 대비 −3% 이하',
        'warmup': 24, 'fn': _breakout_fail,
    },
    {
        'id': 'strong_close', 'no': 7, 'name': '강한 종가', 'category': '모멘텀',
        'desc': '당일 고가 대비 종가 위치로 매수 (장마감 후 권장)',
        'params': {'min_close_ratio': 0.8},
        'risk': {'stop_loss': 3.0, 'take_profit': 5.0},
        'buy_rule': '당일 봉에서 종가가 위쪽 20% 안에 닫힘 (IBS ≥ 0.8)',
        'sell_rule': '종가가 봉의 아래 절반에 닫힘 (IBS < 0.5)',
        'warmup': 1, 'fn': _strong_close,
    },
    {
        'id': 'volatility', 'no': 8, 'name': '변동성 확장', 'category': '돌파매매',
        'desc': '변동성 최저에서 돌파 시 매수',
        'params': {'lookback_days': 10, 'breakout_pct': 3.0},
        'risk': {'stop_loss': 3.0, 'take_profit': None},
        'buy_rule': '10일 변동성이 직전 10봉 최저의 1.1배 이내인데 당일 +3% 이상',
        'sell_rule': '당일 −3% 이하',
        'warmup': 21, 'fn': _volatility,
    },
    {
        'id': 'mean_reversion', 'no': 9, 'name': '평균회귀', 'category': '역추세',
        'desc': 'N일 평균 대비 이탈 시 매매',
        'params': {'period': 5, 'buy_threshold': -3.0, 'sell_threshold': 3.0},
        'risk': {'stop_loss': 3.0, 'take_profit': 3.0},
        'buy_rule': '종가가 5일평균 대비 −3% 이하로 벌어진 날',
        'sell_rule': '종가가 5일평균 대비 +3% 이상으로 벌어진 날',
        'warmup': 6, 'fn': _mean_reversion,
    },
    {
        'id': 'trend_filter', 'no': 10, 'name': '추세 필터', 'category': '추세추종',
        'desc': 'MA 위/아래 추세 방향 매매',
        'params': {'ma_period': 60},
        'risk': {'stop_loss': 5.0, 'take_profit': None},
        'buy_rule': '종가가 60일선 위에 있고 당일 상승',
        'sell_rule': '종가가 60일선 아래에 있고 당일 하락',
        'warmup': 61, 'fn': _trend_filter,
    },
]

BY_ID = {s['id']: s for s in STRATEGIES}

# 매수 신호를 내지 않는 전략. 성적을 재는 방법이 다르다 — 「사서 얼마 벌었나」가
# 아니라 「이 신호 뒤에 정말 떨어졌나」를 본다.
SELL_ONLY = [s['id'] for s in STRATEGIES if s['buy_rule'] is None]

# 가장 긴 준비 기간. 이보다 짧은 일봉으로는 10종을 나란히 셀 수 없다.
MAX_WARMUP = max(s['warmup'] for s in STRATEGIES)


def actions(bars, sid):
    """봉마다 'BUY' / 'SELL' / None. 원본 기본값으로 돈다."""
    s = BY_ID[sid]
    return s['fn'](bars, **s['params'])


def all_actions(bars):
    """전략 10종을 한 번에. {전략id: [봉별 신호]}"""
    return {s['id']: s['fn'](bars, **s['params']) for s in STRATEGIES}


def spec_json():
    """화면·산출물에 실을 전략 명세(함수를 뺀 것)."""
    out = []
    for s in STRATEGIES:
        out.append({k: v for k, v in s.items() if k != 'fn'})
    return out
