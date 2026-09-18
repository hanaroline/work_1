#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""국내 일봉을 **한국투자증권 오픈API** 에서 받는다 — 야후·네이버를 심판할 제3의 잣대.

왜 만드는가
──────────────────────────────────────────────────────────────────────
야후와 네이버가 갈리는데 어느 쪽이 맞는지 **가리지 못한 채** 남아 있다.
data/prices_naver/verify.txt 가 그 막다른 골목을 이렇게 적어 두었다:

    두 출처가 종가를 91.9% 만 같게 봅니다(어긋난 1565 건, 중앙 0.96% · 최대 34.93%).
    상대의 고저 범위를 벗어난 종가는 네이버 629 건 · 야후 629 건입니다.
    어느 쪽으로도 쏠리지 않아 **이 자료만으로는 심판할 수 없습니다.**

629 대 629 는 우연이라기엔 너무 반듯하다. 두 벤더가 서로를 벗어난 횟수가 같다는
것은 **둘 다 상대 기준으로는 틀렸다**는 뜻일 뿐, 누가 옳은지는 말해 주지 않는다.
심판하려면 세 번째 자료가 있어야 하고, 증권사가 직접 주는 시세가 그 자리에 맞다.

수정주가를 반드시 맞춰야 한다
──────────────────────────────────────────────────────────────────────
최대 34.93% 라는 갈림은 시세 오류라기보다 **액면분할·권리락을 한쪽만 반영한**
모양에 가깝다. 그래서 이 수집기는 `FID_ORG_ADJ_PRC` 를 산출물에 적어 둔다.
무엇으로 받았는지 모르면 대조가 오염된다 — 기준이 다른 자료를 맞대 놓고
「어긋났다」고 세는 꼴이 된다.

쓰는 법
  KIS_APP_KEY=... KIS_APP_SECRET=... python3 scripts/fetch_kr_prices_kis.py
  python3 scripts/fetch_kr_prices_kis.py --limit 5        # 다섯 종목만
  python3 scripts/fetch_kr_prices_kis.py --adj 1          # 원주가로
  python3 scripts/fetch_kr_prices_kis.py --env prod       # 실전 앱키로

산출물
  data/prices_kis/kr100.json   네이버 판과 **같은 모양** — 대조기가 똑같이 읽는다
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kis_lib import KST, KisClient, KisError, ROOT, env_banner   # noqa: E402

NAVER = os.path.join(ROOT, "data", "prices_naver", "kr100.json")
OUT_DIR = os.path.join(ROOT, "data", "prices_kis")
OUT = os.path.join(OUT_DIR, "kr100.json")

PATH = "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice"
TR = "FHKST03010100"

# 이 TR 은 한 번에 100 봉까지 준다. 496 봉을 받으려면 날짜를 잘라 여러 번 부른다.
CHUNK_DAYS = 100


def universe(limit=0):
    """대조 상대와 **같은 종목·같은 심볼 표기**를 쓴다.

    네이버 판의 키를 그대로 가져온다(`000100.KS`). 목록을 따로 만들면 두 자료의
    종목이 어긋나 대조가 헛돈다.
    """
    with open(NAVER, encoding="utf-8") as fp:
        doc = json.load(fp)
    syms = list(doc["stocks"].keys())
    if limit:
        syms = syms[:limit]
    return syms, doc.get("coverage", {})


def code_of(sym):
    """`000100.KS` → `000100`. KIS 는 여섯 자리 종목코드만 받는다."""
    return sym.split(".")[0]


def fetch_one(kis, sym, start, end, adj):
    """한 종목의 일봉을 날짜를 잘라 가며 모은다. 날짜→봉 으로 모아 중복을 없앤다."""
    code = code_of(sym)
    bars = {}
    cur_end = end
    while cur_end >= start:
        cur_start = max(start, cur_end - timedelta(days=CHUNK_DAYS))
        params = {
            "FID_COND_MRKT_DIV_CODE": "J",         # J = 주식·ETF (코스피/코스닥 공통)
            "FID_INPUT_ISCD": code,
            "FID_INPUT_DATE_1": cur_start.strftime("%Y%m%d"),
            "FID_INPUT_DATE_2": cur_end.strftime("%Y%m%d"),
            "FID_PERIOD_DIV_CODE": "D",            # 일봉
            "FID_ORG_ADJ_PRC": adj,                # 0 수정주가 / 1 원주가
        }
        got = kis.get(PATH, TR, params)
        rows = got.get("output2") or []
        if not rows:
            # 빈 구간은 상장 전이거나 KIS 가 그만큼 주지 않는 것이다. 더 캐도
            # 소용없으므로 멈춘다 — 안 그러면 없는 과거를 하염없이 두드린다.
            break

        for row in rows:
            date = (row.get("stck_bsop_date") or "").strip()
            if len(date) != 8:
                continue
            try:
                bars[date] = (
                    float(row["stck_oprc"]), float(row["stck_hgpr"]),
                    float(row["stck_lwpr"]), float(row["stck_clpr"]),
                    float(row.get("acml_vol") or 0),
                )
            except (KeyError, TypeError, ValueError):
                continue

        oldest = min(bars) if bars else None
        if not oldest:
            break
        nxt = datetime.strptime(oldest, "%Y%m%d").date() - timedelta(days=1)
        if nxt >= cur_end:          # 더 뒤로 못 가면 무한히 돈다 — 끊는다
            break
        cur_end = nxt
    return bars


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="몇 종목만 (0 이면 전부)")
    ap.add_argument("--adj", choices=["0", "1"], default="0",
                    help="0 수정주가(기본) / 1 원주가")
    ap.add_argument("--env", choices=["vps", "prod"], help="vps=모의(기본)")
    args = ap.parse_args()

    syms, cov = universe(args.limit)
    # 대조 상대와 **같은 기간**을 받는다. 기간이 다르면 겹치는 날만 세게 되어
    # 표본이 조용히 줄어든다.
    start = datetime.strptime(cov.get("from", "2024-09-03"), "%Y-%m-%d").date()
    end = datetime.now(KST).date()

    kis = KisClient(env=args.env)
    print("KIS 국내 일봉 수집 — %s" % env_banner(kis))
    print("종목 %d · 기간 %s ~ %s · 수정주가=%s\n"
          % (len(syms), start, end, "예" if args.adj == "0" else "아니오"))

    stocks, failed = {}, []
    for i, sym in enumerate(syms, 1):
        try:
            bars = fetch_one(kis, sym, start, end, args.adj)
        except KisError as exc:
            failed.append({"sym": sym, "why": "%s %s" % (exc.msg_cd, exc.msg1)})
            print("  [%3d/%d] %-12s 실패 %s" % (i, len(syms), sym, exc.msg1[:60]))
            continue
        except Exception as exc:                                   # noqa: BLE001
            failed.append({"sym": sym, "why": "%s: %s"
                           % (type(exc).__name__, str(exc)[:120])})
            print("  [%3d/%d] %-12s 실패 %s" % (i, len(syms), sym,
                                                str(exc)[:60]))
            continue

        if not bars:
            failed.append({"sym": sym, "why": "봉이 하나도 없다"})
            print("  [%3d/%d] %-12s 빈 응답" % (i, len(syms), sym))
            continue

        days = sorted(bars)
        stocks[sym] = {
            "d": [datetime.strptime(x, "%Y%m%d").strftime("%Y-%m-%d")
                  for x in days],
            "o": [bars[x][0] for x in days],
            "h": [bars[x][1] for x in days],
            "l": [bars[x][2] for x in days],
            "c": [bars[x][3] for x in days],
            "v": [bars[x][4] for x in days],
        }
        print("  [%3d/%d] %-12s %d봉 (%s ~ %s)"
              % (i, len(syms), sym, len(days),
                 stocks[sym]["d"][0], stocks[sym]["d"][-1]))

    if not stocks:
        raise SystemExit("\n받은 것이 없다. 모의투자에서 이 TR 이 막혔을 수 있다 — "
                         "tools/kis-discovery/report.md 를 본다.")

    all_days = sorted({d for s in stocks.values() for d in s["d"]})
    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "source": "한국투자증권 오픈API (%s)" % ("모의투자" if kis.env == "vps"
                                                else "실전투자"),
        "tr_id": TR,
        "adjusted": args.adj == "0",
        "unit": {"o": "시가(원)", "h": "고가(원)", "l": "저가(원)",
                 "c": "종가(원)", "v": "거래량(주)"},
        "note": ("야후·네이버를 심판하려고 받은 증권사 원본입니다. "
                 "FID_ORG_ADJ_PRC=%s 로 받았으며, 대조 상대와 수정주가 기준이 "
                 "다르면 대조가 오염되므로 이 값을 반드시 함께 봅니다." % args.adj),
        "coverage": {
            "stocks": len(stocks),
            "days": len(all_days),
            "from": all_days[0] if all_days else None,
            "to": all_days[-1] if all_days else None,
            "failed": len(failed),
        },
        "failed": failed,
        "stocks": stocks,
    }

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))

    print("\n%d 종목 · %d 거래일 · 실패 %d — %s"
          % (len(stocks), len(all_days), len(failed),
             os.path.relpath(OUT, ROOT)))
    if failed:
        print("실패한 종목:")
        for f in failed[:10]:
            print("  %-12s %s" % (f["sym"], f["why"]))


if __name__ == "__main__":
    main()
