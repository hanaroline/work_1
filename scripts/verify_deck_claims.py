#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""슬라이드에 인쇄될 모든 수치를 원자료에서 다시 뽑아 대조한다.

홍보용 자료는 남에게 보이는 자료다. 여기 실린 숫자가 하나라도 틀리면
그 자리에서 신뢰를 잃는다 — 그런데 이 자료가 자랑하는 것이 바로 「숫자를
다시 센다」는 점이므로, 자랑하는 자료의 숫자가 틀리는 것은 가장 나쁘다.

    python3 scripts/verify_deck_claims.py docs/deck/claims.json

대장(claims.json)의 각 항목은 이렇게 생겼다:

    {"id": "누적리포트", "value": 1713, "how": "cum_reports",
     "text": "저장된 날짜 판 전부에서 주소로 중복을 지운 리포트 수"}

`how` 는 아래 DERIVE 에 있는 이름이어야 한다. 대장에만 있고 여기 없는
계산법은 통과시키지 않는다 — 손으로 적은 숫자가 검산을 건너뛰는 길을
막는 것이 이 스크립트의 요점이다.
"""

import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fetch_reports import pool_key                                # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "reports")


def _latest():
    with open(os.path.join(DATA, "latest.json"), encoding="utf-8") as f:
        return json.load(f)


def _day_files():
    return sorted(glob.glob(os.path.join(DATA, "20??-??-??.json")))


def cum_reports():
    """저장된 날짜 판 전부에서 주소로 중복을 지운 리포트 수."""
    box = set()
    for f in _day_files():
        with open(f, encoding="utf-8") as fh:
            for r in json.load(fh).get("reports", []):
                box.add(pool_key(r))
    return len(box)


def day_snapshots():
    return len(_day_files())


def collected_today():
    return _latest()["summary"]["count_report_date"]


def collected_total():
    return _latest()["summary"]["count_collected"]


def weekly_count():
    return _latest()["weekly"]["count"]


def live_sources():
    """이번 판에서 살아서 한 건이라도 준 원천 칸의 수."""
    return sum(1 for v in _latest()["sources"].values()
               if isinstance(v, dict) and v.get("ok") and (v.get("count") or 0) > 0)


def detail_opened():
    return _latest()["extraction"]["detail_opened"]


def summarized():
    return _latest()["extraction"]["summarized"]


def _verify_rows():
    with open(os.path.join(DATA, "verify.txt"), encoding="utf-8") as f:
        return re.findall(r"^\s+(OK|!!)\s+([가나다라마바사])(\d+)", f.read(), re.M)


def checks_total():
    return len(_verify_rows())


def checks_failed():
    return sum(1 for r in _verify_rows() if r[0] == "!!")


def _quote_line():
    with open(os.path.join(DATA, "verify.txt"), encoding="utf-8") as f:
        m = re.search(r"다1 요약이 본문 문장만으로 되짚어짐\s+—\s+대조\s*(\d+)대목"
                      r"\s*·\s*확인\s*(\d+)\s*·[^·]*?(\d+)\s*·\s*어긋남\s*(\d+)", f.read())
    if not m:
        raise ValueError("재검산 파일에서 다1 줄을 찾지 못했다")
    return [int(x) for x in m.groups()]


def quote_compared():
    return _quote_line()[0]


def quote_verified():
    return _quote_line()[1]


def quote_mismatch():
    return _quote_line()[3]


def code_lines():
    """수집기 + 검산기 + 화면 + PDF 만드는 스크립트의 줄 수."""
    n = 0
    for p in ("scripts/fetch_reports.py", "scripts/verify_reports.py",
              "docs/reports/index.html", "scripts/reports_to_pdf.mjs"):
        with open(os.path.join(ROOT, p), encoding="utf-8") as f:
            n += sum(1 for _ in f)
    return n


DERIVE = {
    "cum_reports": cum_reports,
    "day_snapshots": day_snapshots,
    "collected_today": collected_today,
    "collected_total": collected_total,
    "weekly_count": weekly_count,
    "live_sources": live_sources,
    "detail_opened": detail_opened,
    "summarized": summarized,
    "checks_total": checks_total,
    "checks_failed": checks_failed,
    "quote_compared": quote_compared,
    "quote_verified": quote_verified,
    "quote_mismatch": quote_mismatch,
    "code_lines": code_lines,
}


def main(path):
    with open(path, encoding="utf-8") as f:
        claims = json.load(f)

    bad = 0
    print("주장 대장 검산 — %d개\n" % len(claims))
    for c in claims:
        how = c.get("how")
        fn = DERIVE.get(how)
        if fn is None:
            print("  !!  %-14s 계산법 '%s' 이 없다 — 손으로 적은 숫자는 싣지 않는다"
                  % (c["id"], how))
            bad += 1
            continue
        got = fn()
        if got == c["value"]:
            print("  OK  %-14s %s  (%s)" % (c["id"], format(got, ","), c.get("text", "")))
        else:
            print("  !!  %-14s 대장 %s · 다시 뽑은 값 %s"
                  % (c["id"], format(c["value"], ","), format(got, ",")))
            bad += 1

    unused = sorted(set(DERIVE) - {c.get("how") for c in claims})
    if unused:
        print("\n(대장에 쓰이지 않은 계산법: %s)" % ", ".join(unused))

    print()
    if bad:
        print("어긋난 주장 %d개 — 슬라이드를 내지 말 것" % bad)
        return 1
    print("모두 맞음")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "docs/deck/claims.json"))
