#!/usr/bin/env python3
"""radio.html + data/radio/*.json → radio-standalone.html (한 파일)

radio.html 은 data/radio/*.json 을 fetch 하므로 로컬 서버로 열어야 한다.
이 스크립트는 그 데이터를 파일 안에 넣어, 더블클릭으로 열어도 도는 한 판을 만든다.
scripts/make_standalone.py 와 같은 구실이다.

    python3 scripts/make_radio_standalone.py

주의: 라이브 영상 ID 는 방송마다 새로 생긴다. 이 파일에 박히는 ID 는 만든 시각의
것이므로, 시간이 지나면 그 방송은 끝나 있다. 화면은 그때 공식 사이트로 넘긴다.
최신 상태가 필요하면 radio.html 을 로컬 서버로 열거나 이 파일을 다시 만든다.
"""

import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "radio.html"
OUT = ROOT / "radio-standalone.html"
KST = timezone(timedelta(hours=9))


def read_json(path, default):
    try:
        return json.loads((ROOT / path).read_text(encoding="utf-8"))
    except Exception:
        return default


def main():
    html = SRC.read_text(encoding="utf-8")

    channels = read_json("data/radio/channels.json", {"channels": []}).get("channels", [])
    live = read_json("data/radio/live.json", {"live": []}).get("live", [])
    stations = read_json("data/radio/stations.json", {"stations": []}).get("stations", [])

    built = datetime.now(KST).strftime("%Y-%m-%d %H:%M KST")
    payload = {
        "built": built,
        "channels": channels,
        "live": live,
        # 목록이 너무 길면 파일이 무거워진다. 표를 많이 받는 순으로 앞쪽만 넣는다.
        "stations": stations[:250],
    }

    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    # </script> 가 데이터 안에 들어가면 스크립트가 거기서 끊긴다.
    blob = blob.replace("</", "<\\/")

    inline = (
        "<script>\n"
        "/* 단일 파일 판 — 만든 시각 " + built + "\n"
        "   라이브 영상 ID 는 만든 시각의 것이라 시간이 지나면 끝난 방송일 수 있다.\n"
        "   그때 화면은 공식 사이트로 넘긴다. */\n"
        "window.RADIO_DATA = " + blob + ";\n"
        "</script>\n"
    )

    if "window.RADIO_DATA =" in html:
        raise SystemExit("radio.html 에 이미 데이터가 박혀 있다 — 원본을 확인하라")

    # 앱 스크립트보다 먼저 놓아야 한다.
    marker = "<script>\n(function () {\n  'use strict';"
    if marker not in html:
        raise SystemExit("radio.html 의 스크립트 시작 지점을 찾지 못했다")
    html = html.replace(marker, inline + marker, 1)

    html = html.replace(
        "<title>라디오 · TV 온에어</title>",
        "<title>라디오 · TV 온에어 (단일 파일)</title>",
    )

    # 단일 파일에서는 '로컬 서버로 열라'는 안내가 맞지 않는다.
    html = html.replace(
        "채널 목록을 읽지 못했습니다.<br>로컬 서버로 열어야 합니다 — <code>python3 -m http.server</code>",
        "이 갈래에 채널이 없습니다.",
    )

    OUT.write_text(html, encoding="utf-8")

    live_ids = {l["channel"] for l in live}
    tv = sum(1 for c in channels if c.get("band") == "tv")
    print(f"{OUT.name} — 채널 {len(channels)}개(TV {tv}) · 라이브 {len(live_ids)}개 · "
          f"공개 스트림 {len(payload['stations'])}개 · {OUT.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
