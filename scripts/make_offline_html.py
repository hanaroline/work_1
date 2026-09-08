#!/usr/bin/env python3
"""us-top100.html + 수집한 데이터 → us-top100-offline.html (파일 하나, 인터넷 불필요).

왜 이런 파일이 필요한가
  인터넷이 막힌 업무용 PC 에서는 화면이 어떤 경로로도 데이터를 못 받는다.
  파일 옆에 json 을 같이 두는 것도 안 된다 — 브라우저는 file:// 로 열린 페이지가
  옆 파일을 fetch 하는 것을 CORS 로 막는다(origin 'null'). 그래서 데이터를
  HTML 안에 넣어 두는 수밖에 없다.

하는 일
  data/us100/{latest.json, quotes.json, ranking.json, chart/*.json} 을 하나의 JSON 으로 접어
  <script id="us100-embedded" type="application/json"> 블록으로 <body> 바로 뒤에 심는다.
  화면(us-top100.html)은 그 블록이 있으면 먼저 그리고, 인터넷이 되는 자리에서는
  더 새 파일이 오면 그 위에 덮는다.

쓰는 법
  python scripts/make_offline_html.py                     # 저장소의 data/us100 을 사용
  python scripts/make_offline_html.py --out /tmp/a.html   # 출력 경로 지정
  python scripts/make_offline_html.py --no-charts         # 차트 시계열을 빼고 가볍게

주의
  내장된 값은 만든 시점에 고정된다. 화면 배지가 "내장 스냅샷 09.08 17:08" 로
  그 시점을 밝히므로, 오래된 파일을 실시간 시세로 착각할 일은 없다.
  새 값이 필요하면 이 파일을 다시 만들어 옮겨야 한다.
"""

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "us-top100.html")
DATA = os.path.join(ROOT, "data", "us100")
ANCHOR = "<body>"


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--page", default=PAGE)
    ap.add_argument("--data", default=DATA)
    ap.add_argument("--out", default=os.path.join(ROOT, "us-top100-offline.html"))
    ap.add_argument("--no-charts", action="store_true", help="차트 시계열을 넣지 않는다(파일이 1/4 로 작아진다)")
    a = ap.parse_args()

    with open(a.page, encoding="utf-8") as f:
        html = f.read()
    if ANCHOR not in html:
        print("페이지에서 <body> 를 찾지 못했다", file=sys.stderr)
        return 2

    bundle = {"builtBy": "scripts/make_offline_html.py"}

    latest_path = os.path.join(a.data, "latest.json")
    if not os.path.exists(latest_path):
        print("%s 가 없다 — 먼저 데이터를 받아 두어야 한다"
              "(git checkout origin/us100-data -- data/us100)" % latest_path, file=sys.stderr)
        return 1
    latest = load(latest_path)
    if not latest.get("companies"):
        print("latest.json 이 스냅샷 형식이 아니다(안내 파일일 수 있다)", file=sys.stderr)
        return 1
    bundle["latest"] = latest

    quotes_path = os.path.join(a.data, "quotes.json")
    if os.path.exists(quotes_path):
        q = load(quotes_path)
        if q.get("quotes"):
            bundle["quotes"] = q

    rank_path = os.path.join(a.data, "ranking.json")
    if os.path.exists(rank_path):
        try:
            r = load(rank_path)
            if r.get("builtAt"):
                bundle["ranking"] = r
        except Exception:                     # noqa: BLE001 — 없으면 그냥 넘어간다
            pass

    charts = {}
    if not a.no_charts:
        cdir = os.path.join(a.data, "chart")
        for name in sorted(os.listdir(cdir)) if os.path.isdir(cdir) else []:
            if not name.endswith(".json"):
                continue
            j = load(os.path.join(cdir, name))
            if j.get("daily") or j.get("monthly"):
                charts[name[:-5]] = j
    if charts:
        bundle["charts"] = charts

    blob = json.dumps(bundle, ensure_ascii=False, separators=(",", ":"))
    # 뉴스 제목 같은 문자열에 </script> 가 들어 있으면 블록이 그 자리에서 끊긴다.
    # JSON 문법을 지키면서 안전하게 바꾸는 방법은 "</" 를 "<\/" 로 적는 것이다.
    blob = blob.replace("</", "<\\/")

    block = ('<script id="us100-embedded" type="application/json">' + blob + "</script>\n")
    out_html = html.replace(ANCHOR, ANCHOR + "\n" + block, 1)

    with open(a.out, "w", encoding="utf-8") as f:
        f.write(out_html)

    mb = os.path.getsize(a.out) / 1024 / 1024
    print("만들었다: %s (%.1f MB)" % (a.out, mb))
    print("  수집 시각: 지표 %s · 가격 %s"
          % (latest.get("fetchedAt"), (bundle.get("quotes") or {}).get("fetchedAt", "(없음)")))
    print("  담긴 것: 기업 %d · 차트 %d" % (len(latest["companies"]), len(charts)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
