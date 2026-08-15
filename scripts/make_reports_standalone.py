#!/usr/bin/env python3
"""리포트 다이제스트를 **한 파일**로 묶는다.

`docs/reports/index.html` 은 `data/reports/*.json` 을 fetch 로 읽으므로 로컬
서버가 있어야 열린다. 사내 메일로 건네 받아 두 번 클릭해 여는 용도로는
데이터까지 안에 들어 있어야 한다. 이 스크립트가 그 한 파일을 만든다.

    python3 scripts/make_reports_standalone.py                # 최신 판
    python3 scripts/make_reports_standalone.py 2026-08-15     # 그날 판
    python3 scripts/make_reports_standalone.py 최신 out/      # 낼 곳 지정

원본(index.html)은 건드리지 않는다. 화면 쪽 `getJSON` 이 `window.__INLINE__`
을 먼저 보게 돼 있어, 넣어 두기만 하면 서버 없이도 그대로 돈다.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "docs", "reports", "index.html")
DATA = os.path.join(ROOT, "data", "reports")


def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else ""
    name = "latest.json" if arg in ("", "최신", "latest") else arg + ".json"
    src = os.path.join(DATA, name)
    if not os.path.isfile(src):
        have = sorted(f[:-5] for f in os.listdir(DATA) if re.fullmatch(r"\d{4}-\d{2}-\d{2}\.json", f))
        sys.exit("%s 이 없다. 있는 날짜: %s" % (src, ", ".join(have) or "(아직 없음)"))

    day = json.load(open(src, encoding="utf-8"))
    page = open(PAGE, encoding="utf-8").read()

    # 지난 판 고르개에는 지금 넣은 하루만 담는다 — 다른 날은 파일에 없다.
    only = re.sub(r"\.json$", "", os.path.basename(src))
    inlined = {"latest.json": day, os.path.basename(src): day,
               "index.json": {"days": [] if only == "latest" else [only]}}
    # </script> 가 글자 안에 들어 있으면 스크립트가 거기서 끊긴다. 막아 둔다.
    blob = json.dumps(inlined, ensure_ascii=False).replace("</", "<\\/")
    inline = ("<script>window.__INLINE__ = %s;\n"
              "window.__NO_DASH__ = true;   // 대시보드는 같이 오지 않는다\n"
              "</script>\n" % blob)
    page = page.replace("<script>\n(function () {", inline + "<script>\n(function () {", 1)

    stamp = (day.get("summary") or {}).get("report_date") or day.get("date")
    page = page.replace("<title>증권사 리포트 다이제스트</title>",
                        "<title>증권사 리포트 다이제스트 %s</title>" % stamp)

    outdir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "out")
    os.makedirs(outdir, exist_ok=True)
    out = os.path.join(outdir, "미래에셋_증권사리포트_%s.html" % stamp.replace("-", ""))
    with open(out, "w", encoding="utf-8") as f:
        f.write(page)

    s = day.get("summary") or {}
    print("만듦: %s (%.0f KB)" % (out, os.path.getsize(out) / 1024))
    print("담긴 것: %s 자 %s건 / 수집 전체 %s건"
          % (s.get("report_date"), s.get("count_report_date"), s.get("count_collected")))


if __name__ == "__main__":
    main()
