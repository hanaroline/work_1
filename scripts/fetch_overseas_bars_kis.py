#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""해외 상장 **주식**의 다년 일봉을 한국투자증권 오픈API 로 받는다.

왜 필요한가
──────────────────────────────────────────────────────────────────────
국내 상장분은 `fetch_kr_bars_kis.py` 로 10 해치를 받아, 상품을 여러 해의
위험조정 성과로 고를 수 있게 됐다. 그런데 **해외주식 100 종만 아직 1 해치**다
— 원천(us100-data)이 500 봉만 주기 때문이다. 그래서 제안서에서 해외주식만
「1해 실측」으로 남고, 1 해는 너무 짧아 운이 실적처럼 보인다.

    국내주식 100 종 — 5 해 실측 ✓
    국내ETF   80 종 — 5·3 해 실측 ✓
    해외ETF  153 종 — 3 해 실측 ✓
    해외주식 100 종 — **1 해뿐** ← 이것을 고친다
    펀드     957 종 — 달 간격 기준가로 잰다(fetch_fund_nav.py)

거래소를 모르면 **찾아낸다**
──────────────────────────────────────────────────────────────────────
이 TR 은 거래소(EXCD)를 반드시 받는데, 원천에는 심볼만 있고 거래소가 없다.
그리고 **거래소를 틀리면 오류가 아니라 빈 응답이 온다** — 해외 ETF 를 받을
때 SHY·IEF·TLT 를 AMS 로 넣었다가 셋 다 봉 0 개로 돌아왔고, 하마터면 채권
자산군에 국채가 통째로 빠진 채 제안서가 나갈 뻔했다.

그래서 짐작하지 않고 **차례로 찔러 본다**(NAS→NYS→AMS). 한 번 찾은 거래소는
산출물에 적어 두므로 다시 돌릴 때는 찔러 보지 않는다.

중간에 끊겨도 잃지 않는다
──────────────────────────────────────────────────────────────────────
모의투자는 초당 한 건이다. 100 종 × 5 해면 한 종목마다 열세 번쯤 불러야
하니 1,300 번, 25 분쯤이다. 러너가 시간 제한에 걸리면 받은 것을 통째로 잃는데
그러면 또 25 분이다. 그래서 **받는 대로 파일에 쓰고**, 다시 돌리면 **이미
충분히 받은 종목은 건너뛴다.**

한계 — **현지통화 기준이다**
──────────────────────────────────────────────────────────────────────
받는 종가는 달러다. 그래서 여기서 나오는 연평균·변동성은 **달러 기준**이고,
원화로 투자하는 고객이 실제로 겪는 것과는 환율만큼 다르다. 지금 쓰는 원천
(야후 500 봉)도 달러 기준이라 이 점은 달라지지 않지만, 옳아서 그런 것이
아니라 아직 못 고친 것이다. 제대로 하려면 10 해치 원/달러 일별 환율이
있어야 한다 — 없는 것을 지어내지 않고 이렇게 적어 둔다.

쓰는 법
  KIS_APP_KEY=... KIS_APP_SECRET=... python3 scripts/fetch_overseas_bars_kis.py
  python3 scripts/fetch_overseas_bars_kis.py --years 10
  python3 scripts/fetch_overseas_bars_kis.py --limit 5      # 다섯 종만(시험)

산출물
  data/proposal/overseas_bars.json        (심볼 → 일봉)
  data/proposal/overseas_bars_report.md
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kis_lib import KST, KisClient, KisError, ROOT, env_banner   # noqa: E402

OUT_DIR = os.path.join(ROOT, "data", "proposal")
OUT = os.path.join(OUT_DIR, "overseas_bars.json")
REPORT = os.path.join(OUT_DIR, "overseas_bars_report.md")
UNIVERSE = os.path.join(OUT_DIR, "universe.json")

PATH = "/uapi/overseas-price/v1/quotations/dailyprice"
TR = "HHDFS76240000"
SAVE_EVERY = 5            # 다섯 종목마다 저장 — 끊겨도 잃지 않게
MIN_BARS = 60             # 석 달이 안 되면 변동성을 낼 수 없다

# 찔러 볼 차례. 미국 대형주는 대개 나스닥 아니면 뉴욕이고, 아멕스(NYSE Arca)는
# ETF 가 많다. 그래서 맞을 확률이 높은 것부터 본다 — 첫 판에 맞으면 한 번도
# 더 부르지 않는다.
EXCHANGES = ["NAS", "NYS", "AMS"]


def targets(limit):
    """유니버스에서 **해외 상장 주식**을 고른다.

    국내 상장분은 `fetch_kr_bars_kis.py` 몫이므로 여기서는 건드리지 않는다.
    여섯 자리 숫자 코드(국내)는 걸러 낸다.
    """
    u = json.load(open(UNIVERSE, encoding="utf-8"))
    out = []
    for p in u["상품"]:
        if p.get("kind") != "주식" or p.get("region") != "overseas":
            continue
        code = str(p.get("code") or "").split(".")[0].strip().upper()
        if not code or code.isdigit():
            continue                      # 국내 상장이다
        out.append({"symbol": code, "name": p.get("name") or code,
                    "cls": p.get("cls"), "size": p.get("size")})
    # 규모 순으로 훑는다. 시간 제한에 걸려 도중에 끊기더라도 큰 것부터
    # 남도록 — 제안서에 오를 확률이 높은 순서다.
    out.sort(key=lambda p: -(p.get("size") or 0))
    return out[:limit] if limit else out


def fetch_chunk(kis, symbol, excd, bymd):
    """한 번 부른다. 이 TR 은 한 번에 100 봉쯤 준다."""
    got = kis.get(PATH, TR, {
        "AUTH": "", "EXCD": excd, "SYMB": symbol,
        "GUBN": "0",                     # 0 일봉
        "BYMD": bymd,                    # 비우면 최근부터
        "MODP": "1",                     # 1 수정주가 — 분할·배당 반영
    })
    rows = got.get("output2") or []
    out = {}
    for r in rows:
        d = (r.get("xymd") or "").strip()
        if len(d) != 8:
            continue
        try:
            out[d] = float(r["clos"])
        except (KeyError, TypeError, ValueError):
            continue
    return out


def symbol_forms(symbol):
    """찔러 볼 심볼 모양. 보통은 하나지만 **종류주는 구분자가 원천마다 다르다.**

    첫 수집에서 `BRK-B`(버크셔 해서웨이 B) 하나만 못 받았다 — 거래소 세 곳이
    모두 빈 응답이었다. 야후는 `BRK-B`, 거래소 원장은 `BRK.B`, 붙여 쓰는
    곳도 있다. 어느 것이 맞는지 짐작하지 않고 차례로 찔러 본다.
    """
    s = symbol.upper()
    if "-" not in s and "." not in s and "/" not in s:
        return [s]
    base = s.replace("-", "").replace(".", "").replace("/", "")
    stem, _, cls = s.replace(".", "-").replace("/", "-").partition("-")
    forms = [s, "%s.%s" % (stem, cls), "%s/%s" % (stem, cls), base]
    out = []
    for x in forms:                       # 중복은 부르지 않는다 — 호출이 비싸다
        if x and x not in out:
            out.append(x)
    return out


def fetch_one(kis, symbol, excd, want_from):
    """한 종목의 일봉. 날짜를 뒤로 밀며 모은다.

    `excd` 를 모르면(None) 차례로 찔러 본다. **거래소가 틀리면 오류가 아니라
    빈 응답**이 오므로, 첫 판이 비면 다음 거래소로 넘어간다. 찾은 거래소와
    실제로 통한 심볼을 함께 돌려준다 — 부른 쪽이 적어 두었다가 다음에 쓴다.
    """
    tries = [excd] if excd else EXCHANGES
    bars, used, sym = {}, None, symbol
    for cand in tries:
        for form in symbol_forms(symbol):
            first = fetch_chunk(kis, form, cand, "")
            if first:
                bars, used, sym = first, cand, form
                break
        if bars:
            break
    if not bars:
        return None, symbol, {}, []
    symbol = sym

    for _ in range(40):                  # 안전한 상한 — 무한히 돌지 않게
        oldest = min(bars)
        if oldest <= want_from:
            break
        bymd = (datetime.strptime(oldest, "%Y%m%d")
                - timedelta(days=1)).strftime("%Y%m%d")
        got = fetch_chunk(kis, symbol, used, bymd)
        new = {d: c for d, c in got.items() if d not in bars}
        if not new:
            # 상장 전까지 캐 들어간 것이다. 한 번 더 확인하지 않는다 —
            # 이 TR 은 줄 것이 없으면 계속 빈 응답을 준다.
            break
        bars.update(new)

    days = sorted(d for d in bars if d >= want_from)
    return used, symbol, bars, days


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
        "source": "한국투자증권 오픈API (%s, %s, 수정주가, 현지통화)"
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
    ap.add_argument("--limit", type=int, default=0, help="몇 종만 (0=전부)")
    ap.add_argument("--env", choices=["vps", "prod"])
    ap.add_argument("--redo", action="store_true",
                    help="이미 받은 것도 다시 받는다")
    args = ap.parse_args()

    want = targets(args.limit)
    if not want:
        raise SystemExit("받을 종목이 없습니다 — 먼저 유니버스를 만드십시오.")

    items = {} if args.redo else load_existing()
    kis = KisClient(env=args.env)
    print("해외 상장 주식 일봉 — %s" % env_banner(kis))
    print("%d 종 · %.0f 해치 · 이미 받은 것 %d 종\n"
          % (len(want), args.years, len(items)))

    end = datetime.now(KST).date()
    want_from = (end - timedelta(days=int(365.25 * args.years))).strftime("%Y%m%d")

    done, skipped, failed = 0, 0, []
    for i, t in enumerate(want, 1):
        sym = t["symbol"]
        have = items.get(sym)
        if have and (have["d"][0] <= want_from or have.get("complete")):
            skipped += 1
            continue
        # 전에 찾아 둔 거래소가 있으면 다시 찔러 보지 않는다.
        known = (have or {}).get("excd")
        # 전에 통한 심볼 모양이 있으면 그것부터 쓴다 — 헛호출을 아낀다.
        ask = (have or {}).get("kisSymbol") or sym
        try:
            excd, used_sym, _bars, days = fetch_one(kis, ask, known, want_from)
        except KisError as exc:
            failed.append({**t, "why": "%s %s" % (exc.msg_cd, exc.msg1)})
            print("  [%3d/%d] %-6s %-20s 실패 %s"
                  % (i, len(want), sym, t["name"][:20], exc.msg1[:36]))
            continue
        except Exception as exc:                                  # noqa: BLE001
            failed.append({**t, "why": str(exc)[:120]})
            print("  [%3d/%d] %-6s %-20s 실패 %s"
                  % (i, len(want), sym, t["name"][:20], str(exc)[:36]))
            continue

        if not excd:
            # 세 거래소 모두 빈 응답 — 상장폐지·심볼 변경·모의투자 미지원 중
            # 하나다. 짐작해서 적지 않고 못 받은 것으로 남긴다.
            failed.append({**t, "why": "거래소 세 곳 모두 빈 응답"})
            print("  [%3d/%d] %-6s %-20s 거래소를 못 찾음"
                  % (i, len(want), sym, t["name"][:20]))
            continue
        if len(days) < MIN_BARS:
            failed.append({**t, "why": "봉 %d 개뿐" % len(days)})
            print("  [%3d/%d] %-6s %-20s 봉 %d 개뿐 — 제외"
                  % (i, len(want), sym, t["name"][:20], len(days)))
            continue

        # **열쇠는 유니버스의 심볼로 둔다.** 통한 모양(BRK.B)이 아니라 원천이
        # 쓰는 모양(BRK-B)이어야 유니버스가 찾는다. 통한 모양은 따로 적어 둔다.
        items[sym] = {
            "name": t["name"], "cls": t["cls"], "kind": "주식", "excd": excd,
            "d": days, "c": [_bars[x] for x in days],
            # 요청 기간의 처음까지 닿았으면 더 캘 것이 없다는 뜻이다.
            "complete": days[0] <= want_from,
        }
        if used_sym != sym:
            items[sym]["kisSymbol"] = used_sym
        done += 1
        print("  [%3d/%d] %-6s %-20s %s %4d봉 %s~%s%s"
              % (i, len(want), sym, t["name"][:20], excd,
                 len(days), days[0], days[-1],
                 "" if used_sym == sym else "  (KIS: %s)" % used_sym))
        if done % SAVE_EVERY == 0:
            save(items, args.years, kis.env)

    save(items, args.years, kis.env)

    n = sorted(len(v["d"]) for v in items.values())
    lines = ["원천: 한국투자증권 오픈API (%s, 수정주가)" % kis.env, "",
             "이번에 받음 **%d** · 건너뜀 %d · 실패 %d · 누적 **%d 종**"
             % (done, skipped, len(failed), len(items)), ""]
    if n:
        lines += ["| 종목 | 5해↑ | 3해↑ | 1해↑ | 중앙 봉수 |", "|---|---|---|---|---|",
                  "| %d | %d | %d | %d | %d |"
                  % (len(n), sum(1 for x in n if x >= 1200),
                     sum(1 for x in n if x >= 700),
                     sum(1 for x in n if x >= 240), n[len(n) // 2])]
    if failed:
        lines += ["", "**받지 못한 것 %d**" % len(failed)]
        lines += ["- `%s` %s — %s" % (x["symbol"], x["name"], x["why"])
                  for x in failed[:40]]
    with open(REPORT, "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines) + "\n")

    print("\n받음 %d · 건너뜀 %d · 실패 %d · 누적 %d 종 — %s"
          % (done, skipped, len(failed), len(items), os.path.relpath(OUT, ROOT)))


if __name__ == "__main__":
    main()
