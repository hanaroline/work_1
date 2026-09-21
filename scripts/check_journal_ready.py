#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""**지금 시장일지를 내도 되는가**를 가린다.

16:00 에 냈다가 알게 된 것이 있다. 마감 시각이 지났다고 자료가 다 찬 것이
아니다.

  ① 네이버는 **시간외단일가(16:00~18:00)까지 `marketStatus: OPEN`** 으로
     준다. 「장이 닫혔는가」를 그 칸으로 가리면 영원히 닫히지 않는다.
     갈라 주는 것은 `tradingSessionType` 이다 — 정규장이면 REGULAR_MARKET,
     끝나면 AFTER_MARKET 이다.
  ② 종목별 수급은 **주체마다 따로 찬다.** 2026-09-21 16:07 에 외국인은
     당일(잠정)이었는데 기관은 아직 **전 거래일** 것이었다. 그대로 냈으면
     한 표에 오늘 외국인과 어제 기관이 나란히 실릴 뻔했다.

그래서 넷을 본다. 하나라도 어긋나면 **내지 않고 기다린다** — 시장일지가
늦는 것은 고칠 수 있지만, 어제 기관 수급을 오늘 것이라 말한 판은 고칠 수
없다.

  1. 정규장이 끝났는가
  2. 순위 파일의 기준일이 오늘인가
  3. 외국인·기관 **둘 다** 오늘 기준인가, 그리고 잠정치가 아닌가
  4. 시세 파일의 종가일도 오늘인가 — 산출물 이름이 그 날짜로 붙으므로,
     여기가 어긋나면 오늘 순위가 지난 거래일 이름표를 달고 나간다
  5. 오늘 판이 이미 있지는 않은가 (있으면 다시 짓지 않는다)

끝 상태 0 이면 내도 된다. 1 이면 아직이다. 2 면 오늘 판이 이미 있다.
  --allow-estimated 를 주면 ③ 의 「잠정치가 아닌가」만 눈감는다(손으로
  부를 때). 기준일이 어긋나는 것은 그래도 막는다.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
JOURNAL = "data/journal/latest.json"
MARKET = "data/market/latest.json"
DOCS = "docs/journal"

# 정규장이 도는 동안의 값들. 이 가운데 하나면 아직 마감이 아니다.
RUNNING = {"REGULAR_MARKET", "PRE_MARKET", "BEFORE_MARKET", "OPENING_AUCTION"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--allow-estimated", action="store_true")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    def say(s):
        if not args.quiet:
            print(s, flush=True)

    if not os.path.exists(JOURNAL):
        say("순위 파일이 없습니다 — 먼저 scripts/fetch_journal.py 를 돌리십시오")
        return 1
    with open(JOURNAL, encoding="utf-8") as fh:
        jr = json.load(fh)

    today = datetime.now(KST).strftime("%Y-%m-%d")
    bd = jr.get("bizdate")
    session = str(jr.get("session") or "")
    status = str(jr.get("market_status") or "")

    # 1. 정규장이 끝났는가
    if session in RUNNING:
        say(f"아직 정규장입니다 ({session} · {status}) — 내지 않습니다")
        return 1
    say(f"정규장 종료 확인 ({session} · {status})")

    # 2. 순위 파일의 기준일
    if bd != today:
        say(f"순위 파일 기준일이 {bd} 로 오늘({today})이 아닙니다 — 내지 않습니다")
        return 1
    say(f"순위 기준일 {bd}")

    # 3. 두 주체가 다 찼는가
    late = []
    for mkt, o in (jr.get("investor_rank") or {}).items():
        if not o:
            late.append(f"{mkt} 수급 없음")
            continue
        for side, s in (o.get("sides") or {}).items():
            sbd = str(s.get("bizdate") or "")
            if sbd and sbd != today.replace("-", ""):
                late.append(f"{mkt} {side} 기준일 {sbd}")
            elif s.get("estimated") and not args.allow_estimated:
                late.append(f"{mkt} {side} 잠정치(estimated)")
    if late:
        say("종목별 수급이 아직 덜 찼습니다 — " + " · ".join(late))
        say("내지 않고 다음 판을 기다립니다. 한 표에 오늘과 어제를 함께 실을 수 없습니다.")
        return 1
    say("외국인·기관 종목별 수급이 모두 오늘 확정치입니다")

    # 4. 시세 파일의 종가일
    if os.path.exists(MARKET):
        with open(MARKET, encoding="utf-8") as fh:
            kd = ((json.load(fh).get("indices") or {}).get("kospi") or {}).get("date")
        if kd != today:
            say(f"시세 파일의 코스피 종가일이 {kd} 로 오늘({today})이 아닙니다 — "
                "그대로 지으면 오늘 순위가 지난 거래일 이름표를 답니다")
            return 1
        say(f"시세 파일 종가일 {kd}")
    else:
        say("시세 파일이 없습니다")
        return 1

    # 5. 오늘 판이 이미 있는가
    out = os.path.join(DOCS, f"{today}.html")
    if os.path.exists(out):
        say(f"오늘 판이 이미 있습니다 ({out}) — 다시 짓지 않습니다")
        return 2

    say("내도 됩니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
