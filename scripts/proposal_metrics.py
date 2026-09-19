#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""상품을 **여러 해 성과와 위험으로** 재고, 그것으로 점수를 매긴다.

무엇이 잘못됐었나
──────────────────────────────────────────────────────────────────────
상품을 **규모 순**으로 골랐다. 집중·중복 상한을 씌웠지만 순위 기준 자체가
규모여서, 제안서의 상품 다섯은 결국 「제일 큰 다섯」이었다. 성과도 위험도
보지 않은 것이다.

규모 순을 썼던 까닭은 있다 — 수익률 순으로 고르면 **지난해 제일 많이 오른
것**을 권하게 되고, 그 습관이 고객에게 가장 비싸다. 하지만 그 대안이 규모일
필요는 없었다. 1 년 수익률 추종과 **다년 위험조정 평가**는 다른 것이다.

어떻게 재나
──────────────────────────────────────────────────────────────────────
· **여러 창으로 본다** — 1·3·5 해. 한 창만 보면 그 창의 국면을 성격으로
  착각한다. 해외채권을 3.4 해로 쟀더니 -6% 가 나온 일이 그 예다.
· **수익만 보지 않는다** — 연변동성, 최대낙폭, 그리고 위험 한 단위당 초과수익
  (샤프 비슷한 값)을 함께 본다.
· **비용은 확실한 마이너스다** — 수익률은 가정이지만 보수는 반드시 나간다.
· **규모는 순위가 아니라 문턱이다** — 너무 작으면 못 사는 것이지, 클수록
  좋은 것이 아니다.

무엇을 하지 않나
──────────────────────────────────────────────────────────────────────
· **못 잰 것을 지어내지 않는다.** 펀드는 원천이 기준가를 7 거래일만 주므로
  다년 지표가 없다. 그런 상품은 **낮은 점수를 주는 대신 「못 쟀다」고 적고**,
  잴 수 있는 것(보수·1 년 수익률·위험등급)만으로 따로 줄을 세운다.
· **점수를 수익률 예측으로 쓰지 않는다.** 이 점수는 「같은 자산군 안에서 어느
  것을 먼저 보여 줄까」를 정할 뿐이다.
"""

import math

TRADING_DAYS = 252
WINDOWS = [(1, 252), (3, 756), (5, 1260)]     # (해, 거래일)

# 점수를 섞는 무게. **수익보다 위험·비용에 더 기울여 둔다** — 수익은 지나간
# 것이고 비용은 앞으로 반드시 나가는 것이므로.
WEIGHTS = {
    "risk_adj": 0.40,      # 위험 한 단위당 초과수익
    "mdd": 0.20,           # 최대낙폭이 얕을수록
    "cost": 0.20,          # 보수가 쌀수록
    "consistency": 0.20,   # 창이 바뀌어도 성과가 유지되는가
}

# 위험조정에 쓰는 무위험수익률의 기본값. proposal_cma 가 실측을 주면 그것을 쓴다.
RF_DEFAULT = 2.8


def cagr(closes, days_span):
    if len(closes) < 2 or not closes[0] or closes[0] <= 0:
        return None
    years = days_span / 365.25
    if years <= 0:
        return None
    return ((closes[-1] / closes[0]) ** (1 / years) - 1) * 100


def annual_vol(closes):
    if len(closes) < 60:
        return None
    rets = []
    for i in range(1, len(closes)):
        a, b = closes[i - 1], closes[i]
        if a and b and a > 0 and b > 0:
            rets.append(math.log(b / a))
    if len(rets) < 60:
        return None
    mu = sum(rets) / len(rets)
    var = sum((x - mu) ** 2 for x in rets) / (len(rets) - 1)
    return math.sqrt(var) * math.sqrt(TRADING_DAYS) * 100


def max_drawdown(closes):
    if len(closes) < 20:
        return None
    peak, mdd = None, 0.0
    for c in closes:
        if not c or c <= 0:
            continue
        peak = c if peak is None else max(peak, c)
        mdd = min(mdd, (c - peak) / peak)
    return mdd * 100


def measure(dates, closes):
    """한 종목의 다년 지표. 봉이 모자란 창은 **비워 둔다**.

    창을 거래일 수로 자른다 — 달력으로 자르면 휴장일 탓에 창마다 표본 수가
    들쭉날쭉해진다.
    """
    out = {"bars": len(closes), "from": dates[0] if dates else None,
           "to": dates[-1] if dates else None, "창": {}}
    for years, need in WINDOWS:
        if len(closes) <= need:
            continue
        seg = closes[-(need + 1):]
        segd = dates[-(need + 1):]
        try:
            span = (_d(segd[-1]) - _d(segd[0])).days
        except Exception:                                         # noqa: BLE001
            span = need / TRADING_DAYS * 365.25
        out["창"][str(years)] = {
            "cagr": _r(cagr(seg, span)),
            "vol": _r(annual_vol(seg)),
            "mdd": _r(max_drawdown(seg)),
        }
    return out


def _d(s):
    from datetime import datetime
    s = s.replace("-", "")
    return datetime.strptime(s, "%Y%m%d")


def _r(v, n=2):
    return None if v is None else round(v, n)


def longest(m):
    """가장 긴 창의 지표. 5 해가 있으면 5 해, 없으면 3 해, 없으면 1 해."""
    for years, _ in reversed(WINDOWS):
        w = (m.get("창") or {}).get(str(years))
        if w and w.get("cagr") is not None:
            return years, w
    return None, None


def risk_adjusted(w, rf):
    """위험 한 단위당 초과수익. 변동성을 못 재면 None."""
    if not w or w.get("cagr") is None or not w.get("vol"):
        return None
    return (w["cagr"] - rf) / w["vol"]


def consistency(m):
    """창이 바뀌어도 성과가 유지되는가 — 창별 CAGR 의 **최솟값**을 본다.

    평균이 아니라 최솟값을 쓰는 까닭: 5 해 평균이 좋아도 최근 1 해가 무너진
    상품은 고객에게 권하기 어렵다. 제일 나쁜 창이 그 상품의 바닥이다.
    """
    vals = [w["cagr"] for w in (m.get("창") or {}).values()
            if w.get("cagr") is not None]
    if not vals:
        return None, 0
    return min(vals), len(vals)


def _pct(vals):
    """값 목록 → 백분위(0~1) 목록. None 은 None 으로 남긴다.

    **절대 기준 대신 백분위를 쓴다.** 처음에는 「보수 0.02~2%를 0~1 로」처럼
    절대 구간으로 정규화했는데, 그러면 구간을 잘못 잡은 항목에서 모두가 끝값에
    몰려 점수가 1.0 으로 포화됐다(삼성전자 274% 같은 값이 그랬다). 자산군 안의
    상대 순위는 구간을 몰라도 늘 변별된다.
    """
    idx = [i for i, v in enumerate(vals) if v is not None]
    out = [None] * len(vals)
    if not idx:
        return out
    if len(idx) == 1:
        out[idx[0]] = 0.5
        return out
    order = sorted(idx, key=lambda i: vals[i])
    for rank, i in enumerate(order):
        out[i] = rank / (len(order) - 1)
    return out


def components(p, rf):
    """상품 하나의 **원값**들. 점수로 바꾸는 것은 자산군 단위에서 한다.

    부호를 여기서 맞춰 둔다 — 클수록 좋은 쪽으로. 최대낙폭은 -40% 보다
    -10% 가 좋으므로 그대로 두면 되고, 보수는 낮을수록 좋으므로 뒤집는다.
    """
    m = p.get("지표") or {}
    years, w = longest(m)
    worst, nwin = consistency(m)
    fee = p.get("feeMin")
    out = {
        "risk_adj": risk_adjusted(w, rf),
        "mdd": (w or {}).get("mdd"),
        "cost": (-fee) if isinstance(fee, (int, float)) else None,
        "consistency": worst if (worst is not None and nwin >= 2) else None,
    }
    why = []
    if out["risk_adj"] is not None:
        why.append("%d해 연%.1f%% · 변동성 %.1f%% (위험대비 %.2f)"
                   % (years, w["cagr"], w["vol"], out["risk_adj"]))
    if out["mdd"] is not None:
        why.append("최대낙폭 %.0f%%" % out["mdd"])
    if out["cost"] is not None:
        why.append("보수 %.2f%%" % fee)
    if out["consistency"] is not None:
        why.append("가장 나쁜 창 연%.1f%%" % worst)

    tier = 1 if (years or 0) >= 3 else (2 if years else 3)
    if tier == 3:
        # 시세가 없는 상품(펀드). **위험을 못 재므로 수익률을 앞세우지 않는다.**
        # 확실한 것(보수)과 원천이 준 위험등급을 먼저 보고, 1 해 수익률은
        # 보조로만 쓴다 — 여기서 수익률을 앞세우면 그것이 바로 수익률 추종이다.
        rg = p.get("riskGrade")
        r1 = p.get("ret1y")
        out = {
            "cost": out["cost"],
            # 위험등급은 1(고위험)~6(저위험)이 흔한 꼴이다. 낮은 위험을 선호.
            "mdd": (rg if isinstance(rg, (int, float)) else None),
            "risk_adj": (r1 / 100.0) if isinstance(r1, (int, float)) else None,
            "consistency": None,
        }
        why = []
        if isinstance(fee, (int, float)):
            why.append("보수 %.2f%%" % fee)
        if isinstance(rg, (int, float)):
            why.append("위험등급 %s" % rg)
        if isinstance(r1, (int, float)):
            why.append("과거 1해 %.1f%%" % r1)
        why.append("**시세가 없어 변동성·낙폭을 못 쟀습니다**")
    return out, " · ".join(why), tier


def rank_class(products, rf=RF_DEFAULT):
    """한 자산군 안에서 점수를 매긴다 — 항목마다 백분위를 내고 무게로 섞는다.

    각 상품에 `점수`·`점수근거`·`측정등급`을 달아 준다(제자리 수정).
    """
    if not products:
        return products
    comp, whys, tiers = [], [], []
    for p in products:
        c, w, t = components(p, rf)
        comp.append(c)
        whys.append(w)
        tiers.append(t)
    pcts = {k: _pct([c.get(k) for c in comp]) for k in WEIGHTS}
    for i, p in enumerate(products):
        parts = {k: pcts[k][i] for k in WEIGHTS if pcts[k][i] is not None}
        tot = sum(WEIGHTS[k] for k in parts)
        p["점수"] = (round(sum(WEIGHTS[k] * parts[k] for k in parts) / tot, 4)
                     if tot else None)
        p["점수근거"] = whys[i]
        p["측정등급"] = tiers[i]
    return products


def _norm(v, lo, hi):
    """lo~hi 를 0~1 로. 범위 밖은 끝값으로 자른다."""
    if v is None or hi <= lo:
        return None
    return max(0.0, min(1.0, (v - lo) / (hi - lo)))


def score(p, rf=RF_DEFAULT):
    """상품 하나의 점수(0~1)와 그 근거. 못 잰 것은 근거에 적는다.

    돌려주는 것
      score  0~1, 잴 수 없으면 None
      why    사람이 읽는 근거 — 화면·엑셀에 그대로 싣는다
      parts  항목별 점수(설명용)
      tier   1=다년 측정 · 2=1해만 · 3=시세 없음(펀드)
    """
    m = p.get("지표") or {}
    years, w = longest(m)
    parts, why = {}, []

    # ① 위험 한 단위당 초과수익
    ra = risk_adjusted(w, rf)
    if ra is not None:
        parts["risk_adj"] = _norm(ra, -0.2, 1.2)
        why.append("%d해 연%.1f%% · 변동성 %.1f%% (위험대비 %.2f)"
                   % (years, w["cagr"], w["vol"], ra))

    # ② 최대낙폭 — 얕을수록 좋다
    if w and w.get("mdd") is not None:
        parts["mdd"] = _norm(w["mdd"], -60, -5)
        why.append("최대낙폭 %.0f%%" % w["mdd"])

    # ③ 비용 — 쌀수록 좋다. 수익률은 가정이지만 보수는 반드시 나간다.
    fee = p.get("feeMin")
    if isinstance(fee, (int, float)):
        parts["cost"] = _norm(-fee, -2.0, -0.02)
        why.append("보수 %.2f%%" % fee)

    # ④ 창이 바뀌어도 버티는가
    worst, nwin = consistency(m)
    if worst is not None and nwin >= 2:
        parts["consistency"] = _norm(worst, -20, 20)
        why.append("가장 나쁜 창 연%.1f%%" % worst)

    if not parts:
        # 시세가 없는 상품(펀드). 잴 수 있는 것만으로 따로 줄을 세운다.
        r1 = p.get("ret1y")
        if isinstance(r1, (int, float)):
            parts["risk_adj"] = _norm(r1 / 20.0, -0.5, 1.5)
            why.append("과거 1해 %.1f%% (시세가 없어 위험을 못 쟀습니다)" % r1)
        if isinstance(fee, (int, float)):
            parts["cost"] = _norm(-fee, -2.0, -0.02)
            why.append("보수 %.2f%%" % fee)
        if not parts:
            return None, "잴 수 있는 값이 없습니다", {}, 3
        tier = 3
    else:
        tier = 1 if (years or 0) >= 3 else 2

    # 있는 항목의 무게만으로 다시 정규화한다 — 없는 항목 때문에 점수가
    # 깎이면, 자료가 부실한 상품이 아니라 **자료가 부실한 것**이 벌을 받는다.
    tot = sum(WEIGHTS[k] for k in parts if parts[k] is not None)
    if not tot:
        return None, "잴 수 있는 값이 없습니다", {}, tier
    s = sum(WEIGHTS[k] * parts[k] for k in parts if parts[k] is not None) / tot
    return round(s, 4), " · ".join(why), parts, tier
