# -*- coding: utf-8 -*-
"""시세 파일이 이번 브리핑에 쓸 만큼 새것인지 본다.

브리핑 루틴은 글을 쓰기 전에 이것부터 돌린다. 예약(schedule) 수집은 늦게
도는 일이 잦아서, 루틴이 파일을 열었을 때 아직 전날 값만 들어 있는 경우가
있다. 실제로 8월 10일에는 15:40 예약이 17:15 에 돌아 16:00 장마감 루틴이
금요일 값을 보고 있었다.

    python scripts/check_market_fresh.py close     # 국내 마감 기준
    python scripts/check_market_fresh.py morning   # 미국 마감 기준
    python scripts/check_market_fresh.py --wait close   # 새것이 될 때까지 기다린다

끝 상태(exit code)
    0  쓸 수 있다
    1  낡았다 — 수집 워크플로를 발동해야 한다
    2  파일이 없거나 읽을 수 없다

--wait 는 origin 을 다시 받아가며 최대 --timeout 초까지 기다린다. 세션이
수집 워크플로를 발동한 뒤에 쓰라고 만든 것이다. 발동 자체는 여기서 하지
않는다 — 러너 토큰이 없다. 세션이 GitHub 도구로 직접 발동한다.
"""
import argparse
import datetime
import json
import os
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "data", "market", "latest.json")
KST = datetime.timezone(datetime.timedelta(hours=9))

# 판별에 쓰는 항목. 그 판이 다루는 시장의 마감일을 본다.
CHECKS = {
    # 장마감 브리핑 — 국내 마감이 오늘 것이어야 한다.
    "close": [("indices", "kospi"), ("indices", "kosdaq")],
    # 모닝 브리핑 — 간밤 미국 마감이 들어와 있어야 한다. 국내는 아직 안 열렸다.
    "morning": [("indices", "sp500"), ("indices", "nasdaq")],
}


def last_us_session(today):
    """미국 직전 정규장 날짜. 한국 아침 기준이면 대개 어제, 월요일이면 금요일."""
    d = today - datetime.timedelta(days=1)
    while d.weekday() >= 5:                      # 토·일은 건너뛴다
        d -= datetime.timedelta(days=1)
    return d


def last_kr_session(today):
    """국내 직전 정규장 날짜. 주말이면 금요일."""
    d = today
    while d.weekday() >= 5:
        d -= datetime.timedelta(days=1)
    return d


def read():
    try:
        with open(PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:                       # 없거나 깨졌다
        return e


def inspect(session, today):
    """(쓸 수 있는가, 줄 목록) 을 준다."""
    j = read()
    if isinstance(j, Exception):
        return None, ["시세 파일을 읽지 못했다: %s" % j]

    want = last_kr_session(today) if session == "close" else last_us_session(today)
    want_s = want.isoformat()
    lines = ["기대 마감일 %s (%s 기준)" % (want_s, "국내" if session == "close" else "미국"),
             "수집 시각   %s" % j.get("generated_at_kst", "?")]
    ok = True
    for group, key in CHECKS[session]:
        got = (j.get(group, {}).get(key) or {}).get("date")
        mark = "O" if got == want_s else "X"
        if got != want_s:
            ok = False
        lines.append("  %s %s.%s = %s" % (mark, group, key, got))
    return ok, lines


def fetch_origin():
    """origin 의 현재 브랜치를 다시 받아 작업본을 맞춘다."""
    br = subprocess.run(["git", "-C", ROOT, "rev-parse", "--abbrev-ref", "HEAD"],
                        capture_output=True, text=True).stdout.strip()
    for cmd in (["git", "-C", ROOT, "fetch", "origin", br, "-q"],
                ["git", "-C", ROOT, "merge", "--ff-only", "origin/" + br, "-q"]):
        subprocess.run(cmd, capture_output=True, text=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("session", choices=sorted(CHECKS))
    ap.add_argument("--wait", action="store_true", help="새것이 될 때까지 기다린다")
    ap.add_argument("--timeout", type=int, default=420, help="기다리는 한도(초). 기본 7분")
    ap.add_argument("--interval", type=int, default=20, help="다시 보는 간격(초)")
    a = ap.parse_args()

    today = datetime.datetime.now(KST).date()
    ok, lines = inspect(a.session, today)
    if ok is None:
        print("\n".join(lines))
        return 2
    if ok or not a.wait:
        print("\n".join(lines))
        print("판정: " + ("쓸 수 있다" if ok else "낡았다 — 수집 워크플로를 발동하십시오"))
        return 0 if ok else 1

    end = time.time() + a.timeout
    print("\n".join(lines))
    print("낡았다. 최대 %d초 기다린다." % a.timeout)
    while time.time() < end:
        time.sleep(a.interval)
        fetch_origin()
        ok, lines = inspect(a.session, today)
        left = int(end - time.time())
        print("  %s 확인 — %s (남은 %ds)" % (datetime.datetime.now(KST).strftime("%H:%M:%S"),
                                          "갱신됨" if ok else "아직", max(left, 0)))
        if ok:
            print("\n".join(lines))
            print("판정: 쓸 수 있다")
            return 0
    print("\n".join(lines))
    print("판정: 시간 안에 갱신되지 않았다 — 낡은 값으로 쓰지 말고 브리핑에 그 사실을 적으십시오")
    print("      (휴장일이면 원래 갱신되지 않습니다. 기대 마감일이 휴장인지 먼저 보십시오.)")
    return 1


if __name__ == "__main__":
    sys.exit(main())
