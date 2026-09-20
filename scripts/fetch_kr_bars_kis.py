#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""국내 상장 종목·ETF 의 **다년 일봉**을 한국투자증권 오픈API 로 받는다.

왜 다시 만드나
──────────────────────────────────────────────────────────────────────
상품을 규모 순으로 고르고 있었다. 집중·중복 상한을 씌워도 **순위 기준 자체가
규모**라, 「여러 해 성과와 위험을 보고 고른다」와는 거리가 멀었다. 위험조정
점수로 고르려면 종목마다 다년 일봉이 있어야 하는데, 실태가 이랬다.

    국내ETF   80 종 중 과거 1 년 수익률이 있는 것 25 종 — 일봉은 **아예 없음**
    해외ETF  153 종 중                        60 종 — 일봉은 **아예 없음**
    국내주식 100 종 — 2 년치뿐
    해외주식 100 종 — 2 년치뿐
    펀드     957 종 — 달 간격 기준가로 잰다(fetch_fund_nav.py)

ETF 는 ETFCHECK 메타(규모·보수)만 있고 시세가 없었다. 그래서 제안서의 「과거
1 년」 칸에 「—」가 찍혀 나갔다.

중간에 끊겨도 잃지 않는다
──────────────────────────────────────────────────────────────────────
모의투자는 초당 한 건이라 수백 종을 받으면 몇 시간이 걸린다. 러너가 시간
제한에 걸리면 받은 것을 통째로 잃는데, 그러면 다시 몇 시간이다. 그래서
**받는 대로 파일에 쓰고**, 다시 돌리면 **이미 충분히 받은 종목은 건너뛴다.**

쓰는 법
  KIS_APP_KEY=... KIS_APP_SECRET=... python3 scripts/fetch_kr_bars_kis.py
  python3 scripts/fetch_kr_bars_kis.py --kind etf --years 10
  python3 scripts/fetch_kr_bars_kis.py --limit 20     # 자산군마다 20 종만(시험)

산출물
  data/proposal/kr_bars.json        (코드 → 일봉)
  data/proposal/kr_bars_report.md
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kis_lib import KST, KisClient, KisError, ROOT, env_banner   # noqa: E402
import proposal_exposure as EXP                                  # noqa: E402

OUT_DIR = os.path.join(ROOT, "data", "proposal")
OUT = os.path.join(OUT_DIR, "kr_bars.json")
REPORT = os.path.join(OUT_DIR, "kr_bars_report.md")
UNIVERSE = os.path.join(OUT_DIR, "universe.json")

PATH = "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice"
TR = "FHKST03010100"
CHUNK_DAYS = 100          # 이 TR 이 한 번에 주는 봉이 100 개쯤이다
SAVE_EVERY = 5            # 다섯 종목마다 저장 — 끊겨도 잃지 않게


def targets(kind, limit):
    """유니버스에서 **국내 상장**(여섯 자리 숫자 코드) 종목을 고른다.

    자산군은 노출로 재분류돼 있으므로(국내 상장 미국지수 ETF 는 「해외ETF」)
    여기서는 상장지로만 거른다. 펀드는 애초에 일봉이 없다.
    """
    u = json.load(open(UNIVERSE, encoding="utf-8"))
    per = {}
    for p in u["상품"]:
        k = p.get("kind")
        if k not in ("ETF", "주식"):
            continue
        if kind == "etf" and k != "ETF":
            continue
        if kind == "stock" and k != "주식":
            continue
        # 코드 모양이 원천마다 다르다 — 「005930.KS」(야후 꼴)·「A133690」
        # (ETFCHECK 꼴)·「133690」. KIS 는 여섯 자리만 받으므로 벗겨 낸다.
        code = str(p.get("code") or "").split(".")[0].lstrip("A")
        if not (len(code) == 6 and code.isdigit()):
            continue                      # 국내 상장이 아니다
        # 현금성은 상품으로 권하지 않으므로 시세를 받을 까닭이 없다.
        if p.get("cls") == "현금성":
            continue
        per.setdefault(p.get("cls"), []).append(dict(p, code=code))
    out = []
    for cls, items in sorted(per.items()):
        items.sort(key=lambda p: -(p.get("size") or 0))
        for p in (items[:limit] if limit else items):
            out.append({"code": p["code"], "name": p.get("name") or p["code"],
                        "cls": cls, "kind": p.get("kind"),
                        "size": p.get("size")})
    return out


def fetch_one(kis, code, start, end):
    """한 종목의 일봉. 날짜를 뒤로 밀며 모은다. **수정주가**로 받는다."""
    bars, cur_end = {}, end
    for _ in range(260):                  # 안전한 상한 — 무한히 돌지 않게
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
            break                          # 상장 전이거나 더 줄 것이 없다
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
        if nxt >= cur_end:
            break
        cur_end = nxt
    return bars


def load_existing():
    if not os.path.exists(OUT):
        return {}
    try:
        return json.load(open(OUT, encoding="utf-8")).get("items") or {}
    except ValueError:
        return {}


def save(items, years, env):
    os.makedirs(OUT_DIR, exist_ok=True)
    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "source": "한국투자증권 오픈API (%s, %s, 수정주가, 원화)"
                  % ("모의투자" if env == "vps" else "실전투자", TR),
        "years_requested": years,
        "count": len(items),
        "items": items,
    }
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, OUT)          # 쓰다 끊겨도 원본이 안 깨지게


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", type=float, default=10.0)
    ap.add_argument("--kind", choices=["all", "etf", "stock"], default="all")
    ap.add_argument("--limit", type=int, default=0,
                    help="자산군마다 몇 종만 (0=전부)")
    ap.add_argument("--env", choices=["vps", "prod"])
    ap.add_argument("--redo", action="store_true",
                    help="이미 받은 것도 다시 받는다")
    args = ap.parse_args()

    want = targets(args.kind, args.limit)
    if not want:
        raise SystemExit("받을 종목이 없습니다 — 먼저 유니버스를 만드십시오.")

    items = {} if args.redo else load_existing()
    kis = KisClient(env=args.env)
    print("국내 상장 일봉 — %s" % env_banner(kis))
    print("%d 종 · %.0f 해치 · 이미 받은 것 %d 종\n"
          % (len(want), args.years, len(items)))

    end = datetime.now(KST).date()
    start = end - timedelta(days=int(365.25 * args.years))
    # 이미 받아 둔 것이 요청 기간을 웬만큼 덮으면 건너뛴다. 「웬만큼」은
    # 상장이 늦은 종목까지 매번 다시 받지 않도록 넉넉히 잡는다.
    want_from = start.strftime("%Y%m%d")

    done, skipped, failed = 0, 0, []
    for i, t in enumerate(want, 1):
        have = items.get(t["code"])
        if have and (have["d"][0] <= want_from or have.get("complete")):
            skipped += 1
            continue
        try:
            bars = fetch_one(kis, t["code"], start, end)
        except KisError as exc:
            failed.append({**t, "why": "%s %s" % (exc.msg_cd, exc.msg1)})
            print("  [%3d/%d] %-6s %-24s 실패 %s"
                  % (i, len(want), t["code"], t["name"][:24], exc.msg1[:36]))
            continue
        except Exception as exc:                                  # noqa: BLE001
            failed.append({**t, "why": str(exc)[:120]})
            print("  [%3d/%d] %-6s %-24s 실패 %s"
                  % (i, len(want), t["code"], t["name"][:24], str(exc)[:36]))
            continue

        d = sorted(bars)
        if not d:
            failed.append({**t, "why": "봉이 없습니다"})
            continue
        items[t["code"]] = {
            "name": t["name"], "cls": t["cls"], "kind": t["kind"],
            "d": d, "c": [bars[x] for x in d],
            # 요청 기간의 처음까지 닿았으면 더 캘 것이 없다는 뜻이다.
            "complete": d[0] <= want_from,
        }
        done += 1
        print("  [%3d/%d] %-6s %-24s %4d봉 %s~%s"
              % (i, len(want), t["code"], t["name"][:24], len(d), d[0], d[-1]))
        if done % SAVE_EVERY == 0:
            save(items, args.years, kis.env)

    save(items, args.years, kis.env)

    # 보고서 — 자산군마다 몇 해치가 모였는지
    import collections
    per = collections.defaultdict(list)
    for v in items.values():
        per[v["cls"]].append(len(v["d"]))
    lines = ["원천: 한국투자증권 오픈API (%s, 수정주가)" % kis.env, "",
             "이번에 받음 **%d** · 건너뜀 %d · 실패 %d · 누적 **%d 종**"
             % (done, skipped, len(failed), len(items)), "",
             "| 자산군 | 종목 | 5해↑ | 3해↑ | 중앙 봉수 |", "|---|---|---|---|---|"]
    for cls in sorted(per):
        n = sorted(per[cls])
        lines.append("| %s | %d | %d | %d | %d |"
                     % (cls, len(n), sum(1 for x in n if x >= 1200),
                        sum(1 for x in n if x >= 700), n[len(n) // 2]))
    if failed:
        lines += ["", "**받지 못한 것 %d**" % len(failed)]
        lines += ["- `%s` %s — %s" % (x["code"], x["name"], x["why"])
                  for x in failed[:40]]
    with open(REPORT, "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines) + "\n")

    print("\n받음 %d · 건너뜀 %d · 실패 %d · 누적 %d 종 — %s"
          % (done, skipped, len(failed), len(items), os.path.relpath(OUT, ROOT)))


if __name__ == "__main__":
    main()
