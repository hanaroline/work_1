#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""자산군별 **기대수익률**을 두 가지 방식으로 낸다 — 그리고 견준다.

왜 두 가지인가
──────────────────────────────────────────────────────────────────────
기대수익률은 자산배분의 기준선이다. 그런데 이 값은 **잴 수 있는 것이 아니라
가정하는 것**이라, 어떻게 세웠는지를 밝히지 않으면 숫자만 남고 근거가 사라진다.
그래서 서로 다른 두 길로 세워 보고, 어긋나는 곳을 본다.

  ① 빌딩블록   무위험수익률(실측) + 자산군별 리스크프리미엄(가정)
  ② 장기 실적   자산군 대표 ETF 의 장기 연평균(실측)

①은 미래를 보는 눈이고 ②는 지나간 것을 재는 자다. 둘이 크게 어긋나면 어느
한쪽이 틀린 것이 아니라, **지난 기간이 특이했다**는 뜻일 때가 많다.

지키는 것
──────────────────────────────────────────────────────────────────────
· **원화로 잰다.** 달러 표시 ETF 로 재면 그 값은 달러 투자자의 수익률이다.
  한국 고객에게는 환율이 섞인 원화 수익률이 진짜다. 그래서 장기 실적은
  **국내 상장 원화 ETF** 만 쓴다. 원화 프록시가 없는 자산군은 **비워 둔다** —
  달러 값을 원화인 척 적지 않는다.

· **배당을 못 더한 것을 밝힌다.** 쓰는 일봉은 분배금이 반영되지 않은 가격
  수익률이다. 그만큼 **실제보다 낮게** 나온다. 낮게 나오는 편향은 높게
  나오는 편향보다 안전하지만, 편향이 있다는 사실은 적는다.

· **프리미엄은 가정이라고 적는다.** PREMIUM 표는 회사 전망이 아니다.
  자산배분본부 CMA 가 있으면 그 값으로 갈아 끼우는 자리다.

쓰는 법
  python3 scripts/proposal_cma.py              # 두 방식 견주기
  python3 scripts/proposal_cma.py --json       # 기계가 읽을 꼴로
"""

import argparse
import json
import math
import os
import statistics
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from proposal_exposure import CLASSES                            # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
ETF_PRICES = os.path.join(ROOT, "data", "etf", "prices.json")
KIS_ETF = os.path.join(ROOT, "data", "proposal", "kr_etf_bars.json")
UNIVERSE = os.path.join(ROOT, "data", "proposal", "universe.json")
OUT = os.path.join(ROOT, "data", "proposal", "cma.json")

TRADING_DAYS = 252
MIN_BARS = 1200          # 5 해는 있어야 「장기」라고 부를 만하다

# ── ① 빌딩블록 ──────────────────────────────────────────────────────
#
# **이 표는 가정이다.** 회사(자산배분본부)의 CMA 가 있으면 여기를 갈아 끼운다.
# 값은 장기 리스크프리미엄의 통상 범위에서 잡았고, 근거는 산출물에 함께 적는다.
# 숫자를 바꾸고 싶으면 여기 한 곳만 고치면 세 산출물이 같이 따라온다.
PREMIUM = {
    "국내주식": 5.0,      # 주식 리스크프리미엄
    "해외주식": 5.0,      # 환헤지 안 함 — 장기 환율 표류는 0 으로 가정
    "국내채권": 0.8,      # 듀레이션(기간) 프리미엄
    "해외채권": 1.0,      # 기간 + 신용
    "대체": 2.0,          # 금·원자재·리츠를 섞은 몫
    "현금성": 0.0,        # 무위험수익률 그 자체
}
PREMIUM_NOTE = ("리스크프리미엄은 **가정**입니다. 회사 자산배분본부의 "
                "장기 기대수익률(CMA)이 있으면 그 값으로 바꿔 쓰십시오 — "
                "scripts/proposal_cma.py 의 PREMIUM 한 곳만 고치면 "
                "화면·엑셀이 같이 따라옵니다.")

# ── ② 장기 실적의 프록시 ────────────────────────────────────────────
#
# 국내 상장 **원화** ETF 만 쓴다. 이름은 data/etf/prices.json 의 것 그대로다.
PROXY = {
    "국내주식": ["TIGER 200", "ACE 코스피", "TIGER 코리아TOP10", "TIGER 코스닥150"],
    "해외주식": ["TIGER 미국S&P500", "TIGER 미국나스닥100", "TIGER 일본니케이225"],
    "국내채권": ["TIGER 중장기국채"],
    # 해외채권·대체는 5 해를 채우는 원화 프록시가 없다. 비워 둔다 —
    # 달러 표시 ETF 로 대신하면 그 값은 환율이 빠진 남의 수익률이다.
    "해외채권": [],
    "대체": [],
    "현금성": [],          # MMF 실측으로 따로 잡는다
}


def cagr(closes, days):
    """연평균 복리 수익률(%)."""
    if len(closes) < 2 or not closes[0] or closes[0] <= 0:
        return None
    years = days / 365.25
    if years <= 0:
        return None
    return ((closes[-1] / closes[0]) ** (1 / years) - 1) * 100


def load_proxies():
    """원화 프록시 일봉을 두 곳에서 모은다.

      · data/etf/prices.json            네이버·야후로 받아 둔 76 종(최대 8 해)
      · data/proposal/kr_etf_bars.json  KIS 로 받은 국내 상장 ETF(최대 10 해)

    **KIS 쪽이 이긴다.** 증권사 시세이고 수정주가이며, 무엇보다 노출 군마다
    고르게 받아 두어 해외채권·대체처럼 비어 있던 칸을 메운다. KIS 자료는
    노출 군(expo)을 달고 오므로 프록시 목록에 손으로 적지 않아도 편입된다.
    """
    out, srcs, kis_gen = {}, [], None
    if os.path.exists(ETF_PRICES):
        doc = json.load(open(ETF_PRICES, encoding="utf-8"))
        for v in (doc.get("items") or {}).values():
            b = v.get("bars") or {}
            d, c = b.get("d") or [], b.get("c") or []
            if len(d) != len(c) or len(d) < 2:
                continue
            out[v["name"]] = {"d": d, "c": c, "scope": v.get("scope"),
                              "from": v.get("from"), "to": v.get("to"),
                              "expo": None}
        srcs.append(str(doc.get("source")))
    if os.path.exists(KIS_ETF):
        doc = json.load(open(KIS_ETF, encoding="utf-8"))
        kis_gen = doc.get("generated_at_kst")
        for v in doc.get("items") or []:
            d, c = v.get("d") or [], v.get("c") or []
            if len(d) != len(c) or len(d) < 2:
                continue
            # KIS 는 YYYYMMDD 로 준다 — 다른 원천과 꼴을 맞춘다.
            d = ["%s-%s-%s" % (x[:4], x[4:6], x[6:8]) if len(x) == 8 else x
                 for x in d]
            out[v["name"]] = {"d": d, "c": c, "scope": "KR", "from": d[0],
                              "to": d[-1], "expo": v.get("expo")}
        srcs.append(str(doc.get("source")))
    if not out:
        return {}
    return out, " + ".join(srcs), kis_gen


def risk_free():
    """무위험수익률을 **실측**한다 — MMF 1 년 수익률의 중앙값.

    국고채 금리 시계열이 저장소에 없다. 대신 MMF 는 사실상 단기 국공채·통안채를
    담으므로, 그 1 년 실적이 무위험수익률에 가장 가까운 실측치다. 짐작이 아니라
    잰 값이라는 점이 중요하다.
    """
    u = json.load(open(UNIVERSE, encoding="utf-8"))
    rs = [p["ret1y"] for p in u["상품"]
          if (p.get("type") or "") == "MMF" and isinstance(p.get("ret1y"), (int, float))]
    if not rs:
        return None, 0, None
    src = next((p.get("src") for p in u["상품"]
                if (p.get("type") or "") == "MMF"), None)
    return statistics.median(rs), len(rs), src


def building_block():
    rf, n, src = risk_free()
    out = {}
    for c in CLASSES:
        out[c] = {
            "value": None if rf is None else round(rf + PREMIUM[c], 2),
            "rf": None if rf is None else round(rf, 2),
            "premium": PREMIUM[c],
            "basis": "무위험수익률(MMF %d종 1년 중앙값) + 리스크프리미엄(가정)" % n,
            "src": src,
        }
    return out, {"rf": None if rf is None else round(rf, 2), "rf_n": n,
                 "rf_src": src, "note": PREMIUM_NOTE}


def long_run():
    got = load_proxies()
    if not got:
        return {c: {"value": None, "why": "data/etf/prices.json 이 없습니다"}
                for c in CLASSES}, {}
    bars, src, gen = got
    out, used = {}, {}
    for c in CLASSES:
        vals, detail = [], []
        # 손으로 적어 둔 프록시 + KIS 가 그 노출 군으로 받아 둔 것. 손 목록은
        # 자료가 없던 시절의 것이라 해외채권·대체가 비어 있다.
        hand = PROXY.get(c) or []
        auto = sorted(nm for nm, b in bars.items()
                      if b.get("expo") == c and len(b["d"]) >= MIN_BARS
                      and nm not in hand)
        for nm in hand + auto:
            b = bars.get(nm)
            if not b:
                detail.append({"name": nm, "why": "프록시를 찾지 못했습니다"})
                continue
            if len(b["d"]) < MIN_BARS:
                detail.append({"name": nm, "bars": len(b["d"]),
                               "why": "5해가 안 됩니다"})
                continue
            d0 = datetime.strptime(b["d"][0], "%Y-%m-%d")
            d1 = datetime.strptime(b["d"][-1], "%Y-%m-%d")
            v = cagr(b["c"], (d1 - d0).days)
            if v is None:
                continue
            vals.append(v)
            detail.append({"name": nm, "cagr": round(v, 2), "bars": len(b["d"]),
                           "from": b["d"][0], "to": b["d"][-1]})
        if vals:
            out[c] = {"value": round(statistics.median(vals), 2),
                      "n": len(vals),
                      "spread": round(max(vals) - min(vals), 2),
                      "basis": "국내 상장 원화 ETF %d종의 장기 연평균(중앙값)" % len(vals)}
        else:
            out[c] = {"value": None,
                      "why": "5해를 채우는 **원화** 프록시가 없습니다 — "
                             "달러 ETF 로 대신하면 환율이 빠진 남의 수익률이 됩니다"}
        used[c] = detail

    # 현금성은 프록시가 아니라 실측 단기금리를 쓴다.
    rf, n, rfsrc = risk_free()
    if rf is not None:
        out["현금성"] = {"value": round(rf, 2), "n": n,
                         "basis": "MMF %d종 1년 수익률 중앙값(실측)" % n}
    return out, {"proxies": used, "src": src, "generated": gen,
                 "note": ("쓰는 일봉은 **분배금이 빠진 가격 수익률**입니다. "
                          "그만큼 실제보다 낮게 나옵니다.")}


def compare():
    bb, bbmeta = building_block()
    lr, lrmeta = long_run()
    rows = []
    for c in CLASSES:
        a = bb[c]["value"]
        b = lr[c]["value"]
        rows.append({"cls": c, "빌딩블록": a, "장기실적": b,
                     "차이": None if (a is None or b is None) else round(b - a, 2),
                     "장기_사유": lr[c].get("why")})
    return {"generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
            "빌딩블록": bb, "빌딩블록_메타": bbmeta,
            "장기실적": lr, "장기실적_메타": lrmeta,
            "견주기": rows}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--save", action="store_true", help="data/proposal/cma.json 에 씁니다")
    args = ap.parse_args()
    doc = compare()
    if args.save:
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        with open(OUT, "w", encoding="utf-8") as fp:
            json.dump(doc, fp, ensure_ascii=False, indent=1)
    if args.json:
        print(json.dumps(doc, ensure_ascii=False, indent=1))
        return

    bbm = doc["빌딩블록_메타"]
    print("자산군별 기대수익률 — 두 방식 견주기")
    print("=" * 62)
    print("무위험수익률(실측) %.2f%%  — MMF %d종 1년 중앙값" % (bbm["rf"], bbm["rf_n"]))
    print("   출처: %s\n" % str(bbm["rf_src"])[:56])
    print("  %-8s %10s %10s %8s" % ("자산군", "① 빌딩블록", "② 장기실적", "차이"))
    print("  " + "-" * 40)
    for r in doc["견주기"]:
        a = "%8.2f%%" % r["빌딩블록"] if r["빌딩블록"] is not None else "       —"
        b = "%8.2f%%" % r["장기실적"] if r["장기실적"] is not None else "       —"
        df = "%+7.1f%%p" % r["차이"] if r["차이"] is not None else "       —"
        print("  %-8s %10s %10s %8s" % (r["cls"], a, b, df))
    print()
    print("② 가 쓴 프록시")
    for c, det in doc["장기실적_메타"].get("proxies", {}).items():
        for x in det:
            if "cagr" in x:
                print("   %-8s %-24s %6.2f%%  %s~%s (%d봉)"
                      % (c, x["name"][:24], x["cagr"], x["from"], x["to"], x["bars"]))
            else:
                print("   %-8s %-24s %s" % (c, x["name"][:24], x.get("why")))
    print()
    for r in doc["견주기"]:
        if r["장기_사유"]:
            print("   ※ %s — %s" % (r["cls"], r["장기_사유"].replace("**", "")))
    print("\n   ※ %s" % doc["장기실적_메타"]["note"].replace("**", ""))
    print("   ※ %s" % bbm["note"].replace("**", ""))


if __name__ == "__main__":
    main()
