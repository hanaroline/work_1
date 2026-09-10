#!/usr/bin/env python3
"""일정 데이터를 화면 파일 안에 심어 파일 하나로 만든다 — 인터넷이 막힌 PC 용.

`file://` 로 열린 페이지는 옆에 있는 JSON 도 브라우저 보안정책에 막혀 못 읽는다. 그래서
`market-calendar.html` 의 `var INLINE = null; /*__CALENDAR_INLINE__*/` 자리에 데이터를
그대로 넣은 판을 따로 만든다. 화면은 INLINE 이 있으면 네트워크를 쓰지 않는다.

실적발표일은 여전히 빠진다 — 그 스냅샷은 데이터 브랜치에 있고 오프라인 판에 넣으면
파일이 수 MB 로 붇는다. 화면의 ⑥ 섹션이 "받지 못했다" 로 안내한다.

쓰는 법
  python scripts/inline_calendar.py
  python scripts/inline_calendar.py --out /tmp/market-calendar-offline.html
"""

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "market-calendar.html")
DATA = os.path.join(ROOT, "data", "calendar", "latest.json")
MARKER = "var INLINE = null; /*__CALENDAR_INLINE__*/"


def main(argv=None):
    ap = argparse.ArgumentParser(description="오프라인 단일 파일을 만든다")
    ap.add_argument("--page", default=PAGE)
    ap.add_argument("--data", default=DATA)
    ap.add_argument("--out", default=os.path.join(ROOT, "market-calendar-offline.html"))
    args = ap.parse_args(argv)

    src = open(args.page, encoding="utf-8").read()
    if MARKER not in src:
        raise SystemExit("화면 파일에서 심을 자리를 못 찾았다 — %s" % MARKER)

    data = json.load(open(args.data, encoding="utf-8"))
    if not data.get("events"):
        raise SystemExit("일정이 비어 있다 — 먼저 scripts/build_calendar.py 를 돌리십시오")

    # </script> 가 문자열 안에 있으면 브라우저가 스크립트를 그 자리에서 끊는다.
    # 유니코드 이스케이프로 바꿔 두면 JSON 으로도, 자바스크립트로도 같은 값이다.
    blob = (json.dumps(data, ensure_ascii=False, separators=(",", ":"))
            .replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029"))

    out = src.replace(MARKER, "var INLINE = %s; /* 오프라인 판 — 심은 데이터 */" % blob, 1)
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(out)

    print("%s — %.1fMB (일정 %d건, 기준 %s)"
          % (args.out, os.path.getsize(args.out) / 1048576.0,
             len(data["events"]), data.get("builtAt")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
