#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""고객 제안서 — 자산배분 규칙과 셈. 화면과 엑셀이 **모두 이것만 본다.**

왜 규칙을 파일 하나에 모으나
──────────────────────────────────────────────────────────────────────
산출물이 둘(화면·엑셀)인데 배분 규칙을 저마다 들고 있으면 **언젠가 조용히
어긋난다.** 같은 고객에게 화면과 엑셀이 다른 비중을 보여 주는 날이 온다는 뜻이다.
이 저장소가 fund-weekly.yml 머리말에 적어 둔 것과 같은 경계다 —

    여기에 베껴 두면 두 벌이 되어 언젠가 조용히 어긋난다 — 그게 이 프로젝트에서
    제일 비싼 종류의 고장이다.

그래서 규칙은 여기 한 번만 적고, `data/proposal/policy.json` 으로 내보낸다.
파이썬(엑셀)은 이 모듈을 부르고, 화면(자바스크립트)은 그 JSON 을 읽는다.

**과거 실적과 기대수익률을 갈라 놓은 까닭** — 이것이 이 파일에서 제일 중요하다
──────────────────────────────────────────────────────────────────────
유니버스의 국내주식 1 년 수익률 중앙값은 35.8% 다. 이 숫자를 「기대수익률」이라
부르며 제안서에 실으면 고객은 앞으로도 그만큼 번다고 읽는다. **최근 1 년이
그랬다는 뜻일 뿐이다.** 한 해 실적을 미래 기대치로 옮겨 적는 것은 이 업에서
가장 흔하고 가장 비싼 거짓말이다.

그래서 둘을 다른 칸에 둔다.

  · **과거 1년 실적** — 유니버스에서 잰 값. 출처와 기준일이 있다. 사실이다.
  · **기대수익률**   — 사람이 넣는 **가정**이다. 어디서 온 가정인지 적는다.
                       비워 두면 셈하지 않는다. 기본값을 몰래 넣지 않는다.

기대수익률에 기본값을 두지 않는 것이 번거로워 보이지만, 기본값을 두는 순간
그 숫자가 어디서 왔는지 아무도 묻지 않게 된다.

**위험은 셀 수 있는 것만 센다**
──────────────────────────────────────────────────────────────────────
펀드는 기준가 이력이 7 거래일뿐이라 변동성을 못 낸다(universe 가 그렇게 적어
둔다). 그래서 펀드가 섞인 포트폴리오의 변동성은 **부분만 셈되고**, 셈한 몫이
얼마인지를 함께 내놓는다. 「포트폴리오 변동성 12.3%」라고만 적으면 그 안에
못 잰 40% 가 숨는다.
"""

import json
import math
import os
import re
from datetime import datetime, timedelta, timezone

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import proposal_metrics as MET                                     # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
UNIVERSE = os.path.join(ROOT, "data", "proposal", "universe.json")
POLICY_OUT = os.path.join(ROOT, "data", "proposal", "policy.json")

CLASSES = ["국내주식", "해외주식", "국내ETF", "해외ETF", "국내펀드", "해외펀드", "현금"]

# ── 위험성향별 자산군 비중 ───────────────────────────────────────────
#
# 표준투자권유준칙의 다섯 등급을 따른다. 비중은 **위험자산 총량**을 성향에 맞춰
# 정하고, 그 안을 국내·해외와 상품유형으로 나눈 것이다.
#
# 이 표는 시장 전망이 아니라 **성향에 대한 규칙**이다. 전망으로 비중을 흔들면
# 같은 고객이 같은 성향인데 달마다 다른 제안을 받는다.
PROFILES = {
    1: {"name": "안정형", "desc": "원금 손실을 감내하기 어렵다",
        "w": {"국내주식": 0, "해외주식": 0, "국내ETF": 5, "해외ETF": 5,
              "국내펀드": 20, "해외펀드": 10, "현금": 60}},
    2: {"name": "안정추구형", "desc": "약간의 손실은 감내할 수 있다",
        "w": {"국내주식": 0, "해외주식": 5, "국내ETF": 10, "해외ETF": 10,
              "국내펀드": 25, "해외펀드": 15, "현금": 35}},
    3: {"name": "위험중립형", "desc": "수익을 위해 상응하는 위험을 진다",
        "w": {"국내주식": 5, "해외주식": 10, "국내ETF": 15, "해외ETF": 15,
              "국내펀드": 20, "해외펀드": 20, "현금": 15}},
    4: {"name": "적극투자형", "desc": "높은 수익을 위해 큰 손실도 감내한다",
        "w": {"국내주식": 15, "해외주식": 20, "국내ETF": 15, "해외ETF": 20,
              "국내펀드": 10, "해외펀드": 15, "현금": 5}},
    5: {"name": "공격투자형", "desc": "원금 손실 위험을 적극 감수한다",
        "w": {"국내주식": 25, "해외주식": 30, "국내ETF": 15, "해외ETF": 20,
              "국내펀드": 5, "해외펀드": 5, "현금": 0}},
}

# ── 투자기간 보정 ────────────────────────────────────────────────────
#
# 기간이 짧으면 위험자산을 줄인다. 3 년 안에 쓸 돈으로 주식을 담으면 하락장에
# 걸렸을 때 회복을 기다릴 시간이 없다 — 손실이 아니라 **확정 손실**이 된다.
#
# 줄인 몫은 현금으로 보낸다. 늘리지는 않는다 — 기간이 길다고 성향보다 더
# 위험하게 가는 것은 성향을 무시하는 것이다.
HORIZON = [
    (1,  0.40, "1년 이내 — 위험자산을 성향의 40%까지만 담습니다"),
    (3,  0.70, "3년 이내 — 위험자산을 성향의 70%까지만 담습니다"),
    (5,  0.90, "5년 이내 — 위험자산을 성향의 90%까지 담습니다"),
    (99, 1.00, "5년 초과 — 성향 그대로 담습니다"),
]

RISKY = [c for c in CLASSES if c != "현금"]


_RF_CACHE = [None]


def _rf():
    """위험조정에 쓰는 무위험수익률 — cma.json 의 실측을 쓴다(없으면 기본값)."""
    if _RF_CACHE[0] is None:
        try:
            doc = json.load(open(CMA_PATH, encoding="utf-8"))
            _RF_CACHE[0] = (doc.get("빌딩블록_메타") or {}).get("rf") or MET.RF_DEFAULT
        except (OSError, ValueError):
            _RF_CACHE[0] = MET.RF_DEFAULT
    return _RF_CACHE[0]


def horizon_factor(years):
    for cap, factor, note in HORIZON:
        if years <= cap:
            return factor, note
    return 1.0, HORIZON[-1][2]


def allocate(risk, years, available=None):
    """성향과 기간으로 자산군 비중을 정한다.

    `available` 은 지금 자료가 있는 자산군의 집합이다. 자료가 없는 자산군
    (예: 아직 안 받은 해외ETF)에 비중을 주면 **살 수 없는 것을 권하는 제안서**가
    된다. 그래서 그 몫은 같은 성격의 자산군으로 옮기고, 옮겼다는 사실을 적는다.
    """
    prof = PROFILES[int(risk)]
    w = dict(prof["w"])
    notes = []

    factor, hnote = horizon_factor(years)
    if factor < 1.0:
        moved = 0.0
        for c in RISKY:
            cut = w[c] * (1 - factor)
            w[c] -= cut
            moved += cut
        w["현금"] += moved
        notes.append(hnote + " (위험자산 %.0f%%p 를 현금으로 옮겼습니다)" % moved)
    else:
        notes.append(hnote)

    if available is not None:
        # 자료 없는 자산군 → 짝이 되는 자산군으로. 짝도 없으면 현금으로.
        PAIR = {"해외ETF": "해외펀드", "국내ETF": "국내펀드",
                "해외펀드": "해외ETF", "국내펀드": "국내ETF",
                "국내주식": "국내ETF", "해외주식": "해외ETF"}
        for c in RISKY:
            if c in available or w[c] <= 0:
                continue
            tgt = PAIR.get(c)
            dest = tgt if (tgt in available) else "현금"
            notes.append("**%s 는 지금 자료가 없어 제안에서 뺐습니다** — "
                         "그 몫 %.0f%%p 를 %s 로 옮겼습니다." % (c, w[c], dest))
            w[dest] = w.get(dest, 0) + w[c]
            w[c] = 0

    total = sum(w.values())
    if total and abs(total - 100) > 1e-9:
        w = {k: v * 100 / total for k, v in w.items()}
    return {k: round(v, 2) for k, v in w.items()}, prof, notes


def target_weights(target_return, expected, available):
    """목표 수익률을 노리려면 어떤 비중이 필요한지 **역산**한다.

    ⚠ 이 방향은 위험하다. 목표를 올리면 기계적으로 위험자산이 늘어나는데,
    그것을 「이렇게 하면 목표를 번다」로 읽으면 안 된다. 그래서 이 함수는
    비중만 돌려주고, **판정은 부르는 쪽이 위험과 함께 보여 주게** 한다.

    셈하는 법 — 위험자산 묶음과 현금 사이의 비율만 움직인다. 위험자산 안의
    구성은 성향 표를 그대로 쓴다. 목표를 맞추려고 자산군 하나에 몰아주면
    분산이 깨지는데, 그것은 목표 달성이 아니라 다른 위험을 지는 것이다.
    """
    if not expected:
        return None, "기대수익률 가정이 없어 역산할 수 없습니다."
    base = {c: expected.get(c) for c in RISKY if c in available
            and isinstance(expected.get(c), (int, float))}
    if not base:
        return None, "기대수익률 가정이 있는 자산군이 없습니다."

    # 위험자산 묶음의 기대수익률 — 성향 3(위험중립형) 구성을 기준으로 잡는다
    ref = PROFILES[3]["w"]
    tot = sum(ref[c] for c in base) or 1
    risky_ret = sum(expected[c] * ref[c] for c in base) / tot
    cash_ret = expected.get("현금", 0) or 0

    if risky_ret <= cash_ret:
        return None, ("가정한 위험자산 기대수익률(%.1f%%)이 현금(%.1f%%)보다 "
                      "높지 않아 역산할 수 없습니다." % (risky_ret, cash_ret))

    share = (target_return - cash_ret) / (risky_ret - cash_ret)
    note = None
    if share > 1:
        note = ("목표 %.1f%% 는 가정한 위험자산 기대수익률 %.1f%% 를 넘습니다 — "
                "**현금을 0 으로 해도 닿지 않습니다.** 목표를 낮추거나 "
                "기대수익률 가정을 다시 보셔야 합니다." % (target_return, risky_ret))
        share = 1.0
    if share < 0:
        share = 0.0

    w = {c: ref[c] * share * 100 / tot for c in base}
    w["현금"] = 100 - sum(w.values())
    for c in CLASSES:
        w.setdefault(c, 0.0)
    return {k: round(v, 2) for k, v in w.items()}, note


# ── 기대수익률과 실제 노출 ───────────────────────────────────────────

CMA_PATH = os.path.join(ROOT, "data", "proposal", "cma.json")


def cma(method="빌딩블록"):
    """자산군별 기대수익률 **가정**을 읽어 온다(proposal_cma.py 가 만든다).

    `method` 는 「빌딩블록」또는 「장기실적」. 기본은 빌딩블록이다 — 장기실적은
    창(2018~2026)이 강세장 한 국면에 갇혀 있어 주식이 18% 대로 나오고, 그것을
    고객 제안서의 기준선으로 쓰면 과대약속이 된다. 자세한 근거는 cma.json 의
    「견주기」와 proposal_cma.py 머리말에 있다.

    파일이 없으면 **빈 dict 를 돌려준다.** 기대수익률을 몰래 지어내지 않는다.
    """
    if not os.path.exists(CMA_PATH):
        return {}, None
    doc = json.load(open(CMA_PATH, encoding="utf-8"))
    block = doc.get(method) or {}
    out = {c: v.get("value") for c, v in block.items()
           if isinstance(v, dict) and v.get("value") is not None}
    return out, doc.get("generated_at_kst")


def sleeve_exposure(products):
    """상품 묶음의 노출을 평균한다(같은 비중으로 담는다고 보고)."""
    tot, out = 0.0, {}
    for p in products:
        e = p.get("노출") or {}
        if not e:
            continue
        for c, v in e.items():
            out[c] = out.get(c, 0.0) + v
        tot += 1
    if not tot:
        return {}
    return {c: v / tot for c, v in out.items()}


def real_exposure(weights, picked):
    """**제안서가 실제로 무엇에 투자하는지.**

    자산군 이름(국내ETF·국내펀드…)은 포장지다. 「국내ETF 15%」가 미국 지수로
    채워지면 도넛은 국내라고 하는데 고객 돈은 미국에 가 있다. 그래서 담긴
    상품의 노출로 다시 셈해, 이름이 아니라 **내용**을 보여 준다.

    `picked` 는 {자산군: [상품…]}. 자산군에 고른 상품이 없으면 그 비중은
    「미배정」으로 남긴다 — 임의로 어딘가에 넣지 않는다.
    """
    out, unknown = {}, 0.0
    for cls, w in (weights or {}).items():
        if w <= 0:
            continue
        if cls == "현금":
            out["현금성"] = out.get("현금성", 0.0) + w
            continue
        e = sleeve_exposure(picked.get(cls) or [])
        if not e:
            unknown += w
            continue
        for c, share in e.items():
            out[c] = out.get(c, 0.0) + w * share
    res = {c: round(v, 2) for c, v in sorted(out.items(), key=lambda kv: -kv[1])}
    if unknown > 0.005:
        res["미배정"] = round(unknown, 2)
    return res


def expected_from_exposure(expo, table):
    """노출 × 기대수익률 → 포트폴리오 기대수익률. 덮은 비중도 함께 돌려준다."""
    tot, cov = 0.0, 0.0
    for c, w in (expo or {}).items():
        v = table.get(c)
        if isinstance(v, (int, float)):
            tot += v * w / 100
            cov += w
    return (round(tot, 2) if cov else None), round(cov, 2)


# ── 포트폴리오 지표 ──────────────────────────────────────────────────

def portfolio(weights, classes):
    """비중과 자산군 집계로 포트폴리오 지표를 낸다.

    **셈한 몫을 함께 돌려주는 것이 요점이다.** 펀드는 변동성이 없으므로
    변동성은 포트폴리오의 일부만 덮는다. 「변동성 12.3%」라고만 적으면 그 안에
    못 잰 몫이 숨는다.

    상관관계는 셈하지 않는다 — 자산군 사이 상관을 내려면 자산군마다 하나의
    대표 계열이 있어야 하는데 지금은 없다. 그래서 **분산효과를 뺀 가중합**을
    내고, 그것이 실제보다 높게 나온다는 것을 적어 둔다. 낮게 보이게 만드는
    것보다 높게 두는 편이 고객에게 안전하다.
    """
    out = {"과거1년실적": 0.0, "실적덮은비중": 0.0,
           "변동성_가중합": 0.0, "변동성덮은비중": 0.0,
           "최대낙폭_가중합": 0.0, "낙폭덮은비중": 0.0,
           "현금비중": weights.get("현금", 0.0)}
    for cls, wgt in weights.items():
        if cls == "현금" or wgt <= 0:
            continue
        s = classes.get(cls) or {}
        r, v, m = s.get("ret1y_중앙값"), s.get("vol_중앙값"), s.get("mdd_중앙값")
        if isinstance(r, (int, float)):
            out["과거1년실적"] += r * wgt / 100
            out["실적덮은비중"] += wgt
        if isinstance(v, (int, float)):
            out["변동성_가중합"] += v * wgt / 100
            out["변동성덮은비중"] += wgt
        if isinstance(m, (int, float)):
            out["최대낙폭_가중합"] += m * wgt / 100
            out["낙폭덮은비중"] += wgt
    for k in ("과거1년실적", "변동성_가중합", "최대낙폭_가중합"):
        out[k] = round(out[k], 2)
    return out


# 한 자산군 안에서 같은 것을 여러 번 담지 않기 위한 상한.
MAX_PER_SECTOR = 2      # 국내주식 — 같은 업종
MAX_PER_GROUP = 1       # 같은 기업집단(삼성·SK·현대차…)
MAX_PER_HOUSE = 2       # 같은 운용사·발행사
MAX_PER_TRACK = 1       # 같은 기초지수(S&P500·나스닥100·코스피200…)
MAX_PER_EXPOSURE = 2    # 같은 노출(주식/채권/대체)

# **업종 코드가 다르다고 다른 베팅인 것은 아니다.** 반도체 둘을 막았더니
# 삼성전기(전기전자)와 SK스퀘어(지주, 하이닉스 지주회사)가 그 자리를 채워
# 다섯 중 넷이 여전히 같은 반도체 사슬이었다. 값사슬이 같은 업종은 묶어 센다.
# 기업집단(지배구조) 표. 업종 코드가 못 잡는 「같은 베팅」을 잡는 자리다 —
# SK스퀘어는 업종이 「지주」지만 실질은 SK하이닉스 지분이고, 삼성전기는
# 「전기전자」지만 삼성전자 공급망이다. 표는 data 에 두어 코드를 안 고치고도
# 갱신할 수 있게 했다(기업집단 편입·제외는 해마다 바뀐다).
GROUPS_PATH = os.path.join(ROOT, "data", "proposal", "kr_groups.json")
_GROUPS = None


def groups():
    global _GROUPS
    if _GROUPS is None:
        try:
            _GROUPS = json.load(open(GROUPS_PATH, encoding="utf-8")).get("그룹") or {}
        except (OSError, ValueError):
            _GROUPS = {}
    return _GROUPS


SECTOR_GROUP = {
    "반도체": "반도체·전기전자", "전기전자": "반도체·전기전자", "IT": "반도체·전기전자",
    "2차전지": "2차전지·화학", "화학": "2차전지·화학",
    "건설": "건설·중공업", "중공업": "건설·중공업",
    "바이오": "헬스케어", "헬스케어": "헬스케어",
}

# 기초지수를 이름에서 알아본다. 「같은 지수를 운용사만 바꿔 두 번」을 막는
# 자리다 — TIGER 미국S&P500 과 KODEX 미국S&P500 이 나란히 실리던 고장.
_TRACK_PAT = [
    ("S&P500", r"S&P\s*500|SP500|에스앤피\s*500"),
    ("나스닥100", r"나스닥\s*100|NASDAQ\s*100|QQQ"),
    ("코스피200", r"코스피\s*200|KOSPI\s*200|\b200\b"),
    ("코스닥150", r"코스닥\s*150|KOSDAQ\s*150"),
    ("다우", r"다우|DOW"),
    ("필라델피아반도체", r"필라델피아|SOX"),
    ("니케이225", r"니케이|NIKKEI"),
    ("차이나항셍", r"항셍|HANG\s*SENG|차이나H"),
    ("인도니프티", r"니프티|NIFTY"),
    ("글로벌전체", r"ACWI|WORLD|전세계|글로벌\s*분산"),
]


def _track(name):
    """이 상품이 따라가는 지수. 알 수 없으면 None(제한하지 않는다)."""
    n = name or ""
    for key, pat in _TRACK_PAT:
        if re.search(pat, n, re.I):
            return key
    return None


def pick_products(products, cls, n=5, prefer=None):
    """자산군에서 제안할 상품을 고른다.

    고르는 기준은 **규모와 보수**다. 수익률 순으로 고르지 않는다 — 최근 1 년
    잘 오른 것을 위에 올리면 제안서가 늘 「지난해 제일 많이 오른 것」을 권하게
    되고, 그것은 고객에게 가장 비싼 습관이다.

    **그런데 규모 순만으로는 모자랐다.** 규모 순으로 다섯을 뽑았더니 이런 것이
    나왔다.

        국내주식  삼성전자 · SK하이닉스 · SK스퀘어 · 삼성전기 · 현대차
                  → 다섯 중 넷이 사실상 같은 반도체 베팅이다.
        국내ETF   TIGER 미국S&P500 · KODEX 미국S&P500
                  TIGER 미국나스닥100 · KODEX 미국나스닥100 · KODEX 머니마켓액티브
                  → 같은 지수를 운용사만 바꿔 두 번씩. 한국 주식은 0%.

    고객은 다섯 종목을 보고 분산됐다고 믿는데 실제로는 한 가지를 네 번 산
    것이다. 그래서 규모 순으로 훑되 **같은 것이 겹치면 건너뛴다** — 업종·운용사·
    기초지수마다 상한을 둔다. 상한에 걸려 뺀 것은 `skipped` 로 셀 수 있다.

    자산군 불일치(「국내ETF」에 미국 지수, 「국내펀드」에 MMF)는 여기가 아니라
    유니버스를 만들 때 노출로 재분류하며 이미 걸러진다.
    """
    # 노출을 못 가린 상품은 제안하지 않는다. 무엇에 투자하는지 우리도
    # 모르는 것을 고객에게 권할 수는 없다(사모재간접이 여기 걸린다).
    items = [p for p in products
             if p.get("cls") == cls and (p.get("노출") or not p.get("flags")
                                         or "노출_미분류" not in p["flags"])]
    # **규모는 문턱이지 순위가 아니다.** 너무 작으면 못 사는 것이지, 클수록
    # 좋은 것이 아니다. 자산군의 중앙값 규모에 한참 못 미치는 것만 뒤로 민다.
    sizes = sorted(x for x in (p.get("size") or 0 for p in items) if x > 0)
    floor = sizes[len(sizes) // 10] if len(sizes) >= 10 else 0

    # **점수로 줄을 세운다.** 예전에는 규모 순이었다 — 집중·중복 상한을 씌워도
    # 순위 기준이 규모라 결국 「제일 큰 다섯」이었고, 성과도 위험도 보지 않았다.
    # 이제 다년 위험조정 점수(MET.score)로 세운다. tier 가 앞선다 —
    # 여러 해를 잰 상품이 1 해만 잰 상품보다 먼저다.
    MET.rank_class(items, rf=_rf())
    ranked = []
    for p in items:
        small = 1 if (p.get("size") or 0) < floor else 0
        sc = p.get("점수")
        ranked.append((small, p.get("측정등급") or 9,
                       -(sc if sc is not None else -1),
                       -(p.get("size") or 0), p))
    if prefer == "저보수":
        ranked.sort(key=lambda t: (t[0], t[4].get("feeMin") is None,
                                   t[4].get("feeMin") or 9e9, t[2]))
    else:
        ranked.sort(key=lambda t: t[:4])
    items = [t[4] for t in ranked]

    # 노출이 한 가지뿐인 자산군(국내주식·해외주식)에서는 노출 상한이 뜻이
    # 없다 — 모두가 같은 노출이라 셋째부터 전부 걸린다.
    kinds = {max((p.get("노출") or {"?": 1}).items(), key=lambda kv: kv[1])[0]
             for p in items}
    use_expo = len(kinds) > 1

    # **상한을 단계로 푼다.** 예전에는 상한에 걸린 것을 spare 에 모았다가 수가
    # 모자라면 그대로 되메웠는데, 그러면 단일 노출 자산군에서 원래 순서가
    # 통째로 복원돼 상한이 아무 일도 하지 않았다. 이제 덜 중요한 상한부터
    # 하나씩 풀어 가며 다시 고른다 — 같은 지수 중복이 가장 나쁘므로 마지막에 푼다.
    steps = [set()]
    order = (["expo"] if use_expo else []) + ["house", "sector", "group", "track"]
    for i in range(len(order)):
        steps.append(set(order[:i + 1]))

    for off in steps:
        out, sector, house, track, expo, grp_n = [], {}, {}, {}, {}, {}
        for p in items:
            if len(out) >= n:
                break
            raw = p.get("type") if p.get("kind") == "주식" else None
            sec = SECTOR_GROUP.get(raw, raw)
            grp = groups().get(p.get("name")) if p.get("kind") == "주식" else None
            h = p.get("company")
            t = _track(p.get("name"))
            e = max((p.get("노출") or {"?": 1}).items(), key=lambda kv: kv[1])[0]
            if "group" not in off and grp and grp_n.get(grp, 0) >= MAX_PER_GROUP:
                continue
            if "sector" not in off and sec and sector.get(sec, 0) >= MAX_PER_SECTOR:
                continue
            if "house" not in off and h and house.get(h, 0) >= MAX_PER_HOUSE:
                continue
            if "track" not in off and t and track.get(t, 0) >= MAX_PER_TRACK:
                continue
            if ("expo" not in off and use_expo
                    and expo.get(e, 0) >= MAX_PER_EXPOSURE):
                continue
            out.append(p)
            expo[e] = expo.get(e, 0) + 1
            if grp:
                grp_n[grp] = grp_n.get(grp, 0) + 1
            if sec:
                sector[sec] = sector.get(sec, 0) + 1
            if h:
                house[h] = house.get(h, 0) + 1
            if t:
                track[t] = track.get(t, 0) + 1
        if len(out) >= n:
            break
    return out[:n]


def load_universe(path=UNIVERSE):
    if not os.path.exists(path):
        raise SystemExit("유니버스가 없습니다: %s\n  먼저 "
                         "python3 scripts/build_proposal_universe.py 를 돌리십시오."
                         % path)
    with open(path, encoding="utf-8") as fp:
        return json.load(fp)


def export_policy(path=POLICY_OUT):
    """화면(자바스크립트)이 읽을 규칙 파일. 규칙은 여기 한 번만 적힌다."""
    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "classes": CLASSES,
        "profiles": PROFILES,
        "horizon": [{"upTo": c, "factor": f, "note": n} for c, f, n in HORIZON],
        "notes": {
            "기대수익률": ("기대수익률은 **사람이 넣는 가정**입니다. 과거 실적을 "
                           "기대수익률로 옮겨 적지 않습니다 — 최근 1 년이 그랬다는 "
                           "것과 앞으로 그러리라는 것은 다른 말입니다."),
            "변동성": ("자산군 사이 상관관계를 셈하지 않은 **가중합**입니다. "
                       "분산효과가 빠져 있어 실제보다 높게 나옵니다. 낮게 보이게 "
                       "만드는 것보다 높게 두는 편이 안전합니다."),
            "펀드": ("펀드는 기준가 이력이 7 거래일뿐이라 변동성을 셈하지 "
                     "않습니다. 그래서 포트폴리오 변동성은 일부만 덮으며, "
                     "덮은 비중을 함께 적습니다."),
            "상품선정": ("규모와 보수로 고릅니다. 수익률 순으로 고르지 않습니다 — "
                         "지난해 제일 많이 오른 것을 권하는 습관이 고객에게 "
                         "가장 비쌉니다."),
        },
    }
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, indent=1)
    return path


if __name__ == "__main__":
    u = load_universe()
    avail = {c for c, s in u["자산군"].items() if s.get("종목수")}
    print("자료 있는 자산군: %s\n" % ", ".join(sorted(avail)))
    for r in (1, 3, 5):
        w, prof, notes = allocate(r, 10, avail)
        m = portfolio(w, u["자산군"])
        print("성향 %d %s" % (r, prof["name"]))
        print("  " + " · ".join("%s %.0f%%" % (k, v) for k, v in w.items() if v > 0))
        print("  과거1년 실적(가중) %.1f%% — 덮은 비중 %.0f%% | 변동성(가중합) %.1f%% "
              "— 덮은 비중 %.0f%%"
              % (m["과거1년실적"], m["실적덮은비중"],
                 m["변동성_가중합"], m["변동성덮은비중"]))
        for n in notes:
            print("  · %s" % n)
        print()
    print("규칙 파일: %s" % os.path.relpath(export_policy(), ROOT))
