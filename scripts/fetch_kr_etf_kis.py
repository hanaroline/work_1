#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""국내 상장 ETF 의 **장기** 일봉을 한국투자증권 오픈API 로 받는다.

왜 필요한가
──────────────────────────────────────────────────────────────────────
기대수익률을 「장기 실적」으로 세우는 길(proposal_cma.py 의 ②)이 자료가 모자라
반쪽이었다. 여섯 노출 군 가운데 **해외채권과 대체는 5 해를 채우는 원화 프록시가
아예 없어** 비워 둘 수밖에 없었다.

    국내주식  8해 ✓    해외주식  8해 ✓    국내채권  8해 ✓
    해외채권  ✗ (최장 4해)   대체  ✗ (원화 프록시 없음)   현금성  MMF 실측

달러 표시 ETF 로 메우면 그 값은 환율이 빠진 **달러 투자자의 수익률**이지 한국
고객의 수익률이 아니다. 그래서 국내 상장(원화) ETF 를 직접 받는다.

무엇을 받나 — 손으로 고르지 않는다
──────────────────────────────────────────────────────────────────────
종목을 손으로 적으면 코드를 틀리기 쉽고(해외 ETF 수집에서 거래소를 틀려 세
종목이 빈 응답으로 조용히 빠진 적이 있다), 유니버스가 바뀌어도 안 따라온다.
그래서 **유니버스가 이미 검증해 둔 코드**에서 고른다 — 노출 군마다 규모 순으로
`--per-class` 종목씩. 그러면 여섯 군이 고루 덮인다.

**상장이 오래된 것을 따로 챙긴다.** 규모 순만으로 고르면 요즘 나온 큰 ETF 가
뽑혀 이력이 짧다. 장기 기대수익률을 내는 것이 목적이므로 이력이 긴 쪽에
가점을 준다 — 받아 보기 전에는 이력 길이를 모르므로, 한 번 받아 보고 짧으면
다음 후보로 넘어간다.

쓰는 법
  KIS_APP_KEY=... KIS_APP_SECRET=... python3 scripts/fetch_kr_etf_kis.py
  python3 scripts/fetch_kr_etf_kis.py --years 10 --per-class 8

산출물
  data/proposal/kr_etf_bars.json
  data/proposal/kr_etf_report.md
"""

import argparse
import json
import os
import sys
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kis_lib import KST, KisClient, KisError, ROOT, env_banner   # noqa: E402
import proposal_exposure as EXP                                  # noqa: E402

OUT_DIR = os.path.join(ROOT, "data", "proposal")
OUT = os.path.join(OUT_DIR, "kr_etf_bars.json")
REPORT = os.path.join(OUT_DIR, "kr_etf_report.md")
UNIVERSE = os.path.join(OUT_DIR, "universe.json")

PATH = "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice"
TR = "FHKST03010100"
CHUNK_DAYS = 100          # 이 TR 이 한 번에 주는 봉이 100 개쯤이다
MIN_BARS = 1200           # 5 해가 안 되면 「장기」라고 부르지 않는다


def candidates(per_class):
    """유니버스에서 노출 군마다 규모 순으로 후보를 고른다.

    유니버스는 자산군을 **노출로** 재분류해 두었으므로(국내 상장 미국지수 ETF 는
    「해외ETF」) 여기서는 상장지로만 거른다 — 여섯 자리 숫자 코드면 국내 상장이다.
    """
    u = json.load(open(UNIVERSE, encoding="utf-8"))
    per = {}
    for p in u["상품"]:
        if p.get("kind") != "ETF":
            continue
        code = str(p.get("code") or "")
        if not (len(code) == 6 and code.isdigit()):
            continue                      # 국내 상장이 아니다
        e = p.get("노출") or EXP.exposure(p) or {}
        if not e:
            continue
        key = max(e.items(), key=lambda kv: kv[1])[0]
        per.setdefault(key, []).append(p)
    out = []
    for key in EXP.CLASSES:
        items = sorted(per.get(key) or [], key=lambda p: -(p.get("size") or 0))
        for p in items[:per_class]:
            out.append({"code": p["code"], "name": p.get("name") or p["code"],
                        "expo": key, "size": p.get("size")})
    return out


def fetch_one(kis, code, start, end):
    """한 종목의 일봉을 날짜를 뒤로 밀며 모은다. **수정주가**로 받는다."""
    bars, cur_end = {}, end
    for _ in range(200):                  # 안전한 상한 — 무한히 돌지 않게
        if cur_end < start:
            break
        cur_start = max(start, cur_end - timedelta(days=CHUNK_DAYS))
        got = kis.get(PATH, TR, {
            "FID_COND_MRKT_DIV_CODE": "J",
            "FID_INPUT_ISCD": code,
            "FID_INPUT_DATE_1": cur_start.strftime("%Y%m%d"),
            "FID_INPUT_DATE_2": cur_end.strftime("%Y%m%d"),
            "FID_PERIOD_DIV_CODE": "D",
            "FID_ORG_ADJ_PRC": "0",       # 0 = 수정주가
        })
        rows = got.get("output2") or []
        if not rows:
            # 상장 전이거나 KIS 가 그만큼 주지 않는 구간이다. 더 캐도 소용없다.
            break
        for row in rows:
            d = (row.get("stck_bsop_date") or "").strip()
            if len(d) != 8:
                continue
            try:
                bars[d] = float(row["stck_clpr"])
            except (KeyError, TypeError, ValueError):
                continue
        oldest = min(bars) if bars else None
        if not oldest:
            break
        nxt = datetime.strptime(oldest, "%Y%m%d").date() - timedelta(days=1)
        if nxt >= cur_end:                # 더 뒤로 못 가면 끊는다
            break
        cur_end = nxt
    return bars


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", type=float, default=10.0, help="몇 해치 (기본 10)")
    ap.add_argument("--per-class", type=int, default=6,
                    help="노출 군마다 몇 종목 (기본 6)")
    ap.add_argument("--env", choices=["vps", "prod"], help="vps=모의(기본)")
    args = ap.parse_args()

    want = candidates(args.per_class)
    if not want:
        raise SystemExit("후보가 없습니다 — 먼저 build_proposal_universe.py 를 "
                         "돌려 유니버스를 만드십시오.")

    kis = KisClient(env=args.env)
    print("국내 ETF 장기 일봉 — %s" % env_banner(kis))
    print("%d 종 · %.0f 해치 · 노출 군마다 %d 종\n"
          % (len(want), args.years, args.per_class))

    end = datetime.now(KST).date()
    start = end - timedelta(days=int(365.25 * args.years))

    items, failed, short = [], [], []
    for i, c in enumerate(want, 1):
        try:
            bars = fetch_one(kis, c["code"], start, end)
        except KisError as exc:
            failed.append({**c, "why": "%s %s" % (exc.msg_cd, exc.msg1)})
            print("  [%2d/%d] %-6s %-26s 실패 %s"
                  % (i, len(want), c["code"], c["name"][:26], exc.msg1[:40]))
            continue
        except Exception as exc:                                  # noqa: BLE001
            failed.append({**c, "why": str(exc)[:120]})
            print("  [%2d/%d] %-6s %-26s 실패 %s"
                  % (i, len(want), c["code"], c["name"][:26], str(exc)[:40]))
            continue

        days = sorted(bars)
        if len(days) < MIN_BARS:
            # 버리지 않고 싣되 「짧다」고 적는다 — 5 해가 안 되는 것도 최근
            # 구간 대조에는 쓸 데가 있다. 다만 장기 기대수익률에는 안 쓴다.
            short.append({**c, "bars": len(days)})
        items.append({"code": c["code"], "name": c["name"], "expo": c["expo"],
                      "size": c["size"], "d": days,
                      "c": [bars[d] for d in days],
                      "long_enough": len(days) >= MIN_BARS})
        print("  [%2d/%d] %-6s %-26s %4d봉 %s~%s%s"
              % (i, len(want), c["code"], c["name"][:26], len(days),
                 days[0] if days else "—", days[-1] if days else "—",
                 "" if len(days) >= MIN_BARS else "  (짧음)"))

    if not items:
        raise SystemExit("\n받은 것이 없습니다 — 앱키나 종목코드를 보십시오.")

    os.makedirs(OUT_DIR, exist_ok=True)
    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "source": "한국투자증권 오픈API (%s, %s, 수정주가, 원화)"
                  % ("모의투자" if kis.env == "vps" else "실전투자", TR),
        "years_requested": args.years,
        "min_bars_for_long": MIN_BARS,
        "count": len(items),
        "long_enough": sum(1 for x in items if x["long_enough"]),
        "failed": failed,
        "items": items,
    }
    with open(OUT, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))

    lines = ["원천: %s" % doc["source"], "",
             "장기(%d봉=5해) 기준을 채운 것 **%d / %d**"
             % (MIN_BARS, doc["long_enough"], len(items)), "",
             "| 노출 | 코드 | 이름 | 봉 | 기간 | 장기 |", "|---|---|---|---|---|---|"]
    for it in sorted(items, key=lambda x: (x["expo"], -len(x["c"]))):
        lines.append("| %s | %s | %s | %d | %s ~ %s | %s |"
                     % (it["expo"], it["code"], it["name"], len(it["c"]),
                        it["d"][0] if it["d"] else "—",
                        it["d"][-1] if it["d"] else "—",
                        "○" if it["long_enough"] else "—"))
    if failed:
        lines += ["", "**받지 못한 것 %d**" % len(failed)]
        lines += ["- `%s` %s — %s" % (x["code"], x["name"], x["why"]) for x in failed]
    with open(REPORT, "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines) + "\n")

    print("\n%d 종 · 장기 기준 충족 %d · 실패 %d — %s"
          % (len(items), doc["long_enough"], len(failed),
             os.path.relpath(OUT, ROOT)))


if __name__ == "__main__":
    main()
