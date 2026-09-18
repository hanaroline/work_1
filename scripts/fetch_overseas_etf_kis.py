#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""해외 ETF 일봉을 한국투자증권 오픈API 로 받는다 — 제안서의 마지막 자산군.

왜 목록을 손으로 고르나
──────────────────────────────────────────────────────────────────────
us100-data 에는 **미국 주식 100 종목**이 있고 ETF 는 없다. 해외 ETF 는 따로
받아야 하는데, 「전 종목」을 받을 까닭이 없다 — 고객 제안서에 올릴 것은
자산군을 대표하는 소수의 큰 ETF 다. 그래서 자산군별로 대표 종목을 골라 둔다.

고른 기준은 하나다 — **자산군을 빠짐없이 덮되 겹치지 않게.** 주식(미국·선진·신흥),
채권(국채 단·중·장기, 회사채, 하이일드), 대체(금·은·원자재·리츠), 배당.
종목을 늘리는 것은 쉽지만, 겹치는 것을 나란히 올리면 고객은 분산됐다고 믿는데
실제로는 같은 것을 두 번 산 것이 된다.

거래소 코드는 실측으로 정했다 — 2026-09-18 관찰에서 SPY·GLD·USO 는 AMS,
QQQ 는 NAS 로 값이 나왔다(tools/kis-discovery/report.md).

쓰는 법
  KIS_APP_KEY=... KIS_APP_SECRET=... python3 scripts/fetch_overseas_etf_kis.py
  python3 scripts/fetch_overseas_etf_kis.py --years 1

산출물
  data/proposal/overseas_etf.json
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kis_lib import KST, KisClient, KisError, ROOT, env_banner   # noqa: E402

OUT_DIR = os.path.join(ROOT, "data", "proposal")
OUT = os.path.join(OUT_DIR, "overseas_etf.json")

PATH = "/uapi/overseas-price/v1/quotations/dailyprice"
TR = "HHDFS76240000"

# (심볼, 거래소, 이름, 자산군)
#
# 거래소 — NAS 나스닥 · NYS 뉴욕 · AMS 아멕스(NYSE Arca 포함).
# 아래 대부분이 NYSE Arca 상장이라 AMS 다. 틀리면 응답이 비므로 바로 드러난다.
UNIVERSE = [
    # 주식
    ("SPY", "AMS", "SPDR S&P 500", "equity"),
    ("QQQ", "NAS", "Invesco QQQ (나스닥100)", "equity"),
    ("VTI", "AMS", "Vanguard 미국 전체시장", "equity"),
    ("IWM", "AMS", "iShares 러셀2000 (미국 중소형)", "equity"),
    ("VEA", "AMS", "Vanguard 선진국(미국 제외)", "equity"),
    ("VWO", "AMS", "Vanguard 신흥국", "equity"),
    # 채권
    ("SHY", "AMS", "iShares 미국채 1-3년", "bond"),
    ("IEF", "AMS", "iShares 미국채 7-10년", "bond"),
    ("TLT", "AMS", "iShares 미국채 20년+", "bond"),
    ("AGG", "AMS", "iShares 미국 종합채권", "bond"),
    ("LQD", "AMS", "iShares 투자등급 회사채", "bond"),
    ("HYG", "AMS", "iShares 하이일드 회사채", "bond"),
    # 대체
    ("GLD", "AMS", "SPDR 금", "alternative"),
    ("SLV", "AMS", "iShares 은", "alternative"),
    ("USO", "AMS", "United States 원유", "alternative"),
    ("DBC", "AMS", "Invesco 원자재", "alternative"),
    ("VNQ", "AMS", "Vanguard 미국 리츠", "alternative"),
    # 배당
    ("SCHD", "AMS", "Schwab 미국 배당주", "equity"),
    ("VIG", "AMS", "Vanguard 배당성장", "equity"),
]


def fetch_one(kis, symbol, excd, years):
    """한 종목의 일봉을 모은다. 이 TR 은 한 번에 100 봉쯤 주므로 날짜를 뒤로
    밀며 여러 번 부른다. 더 캘 것이 없으면 멈춘다."""
    want_from = (datetime.now(KST) - timedelta(days=int(365.25 * years))).date()
    bars, bymd = {}, ""
    for _ in range(40):                      # 안전한 상한 — 무한히 돌지 않게
        got = kis.get(PATH, TR, {
            "AUTH": "", "EXCD": excd, "SYMB": symbol,
            "GUBN": "0",                     # 0 일봉
            "BYMD": bymd,                    # 비우면 최근부터
            "MODP": "1",                     # 1 수정주가 — 분할·배당 반영
        })
        rows = got.get("output2") or []
        rows = [r for r in rows if (r.get("xymd") or "").strip()]
        if not rows:
            break
        new = 0
        for r in rows:
            d = r["xymd"].strip()
            if d in bars:
                continue
            try:
                bars[d] = float(r["clos"])
            except (KeyError, TypeError, ValueError):
                continue
            new += 1
        oldest = min(bars)
        if new == 0 or oldest <= want_from.strftime("%Y%m%d"):
            break
        bymd = (datetime.strptime(oldest, "%Y%m%d")
                - timedelta(days=1)).strftime("%Y%m%d")
    days = sorted(d for d in bars if d >= want_from.strftime("%Y%m%d"))
    return days, [bars[d] for d in days]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", type=float, default=3.0, help="몇 해치 (기본 3)")
    ap.add_argument("--env", choices=["vps", "prod"], help="vps=모의(기본)")
    args = ap.parse_args()

    kis = KisClient(env=args.env)
    print("해외 ETF 일봉 — %s" % env_banner(kis))
    print("%d 종 · %.1f 해치\n" % (len(UNIVERSE), args.years))

    items, failed = [], []
    for i, (sym, excd, name, cls) in enumerate(UNIVERSE, 1):
        try:
            days, closes = fetch_one(kis, sym, excd, args.years)
        except KisError as exc:
            failed.append({"symbol": sym, "why": "%s %s" % (exc.msg_cd, exc.msg1)})
            print("  [%2d/%d] %-5s 실패 %s" % (i, len(UNIVERSE), sym, exc.msg1[:50]))
            continue
        except Exception as exc:                                   # noqa: BLE001
            failed.append({"symbol": sym, "why": str(exc)[:120]})
            print("  [%2d/%d] %-5s 실패 %s" % (i, len(UNIVERSE), sym, str(exc)[:50]))
            continue

        if len(closes) < 60:
            # 석 달이 안 되면 변동성을 낼 수 없다. 반쪽짜리를 싣느니 뺀다.
            failed.append({"symbol": sym, "why": "봉 %d 개뿐" % len(closes)})
            print("  [%2d/%d] %-5s 봉 %d 개뿐 — 제외" % (i, len(UNIVERSE), sym,
                                                        len(closes)))
            continue

        items.append({"symbol": sym, "exchange": excd, "name": name,
                      "assetClass": cls, "d": days, "c": closes})
        print("  [%2d/%d] %-5s %4d봉 (%s ~ %s)"
              % (i, len(UNIVERSE), sym, len(days), days[0], days[-1]))

    if not items:
        raise SystemExit("\n받은 것이 없습니다 — 거래소 코드나 앱키를 보십시오.")

    os.makedirs(OUT_DIR, exist_ok=True)
    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "source": "한국투자증권 오픈API (%s, %s, 수정주가)"
                  % ("모의투자" if kis.env == "vps" else "실전투자", TR),
        "years_requested": args.years,
        "count": len(items),
        "failed": failed,
        "items": items,
    }
    with open(OUT, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))

    print("\n%d 종 · 실패 %d — %s"
          % (len(items), len(failed), os.path.relpath(OUT, ROOT)))
    for f in failed:
        print("  %-5s %s" % (f["symbol"], f["why"]))


if __name__ == "__main__":
    main()
