# -*- coding: utf-8 -*-
"""시세 파일이 이번 브리핑에 쓸 만큼 새것인지 본다.

브리핑 루틴은 글을 쓰기 전에 이것부터 돌린다. 예약(schedule) 수집은 늦게
도는 일이 잦아서, 루틴이 파일을 열었을 때 아직 전날 값만 들어 있는 경우가
있다. 실제로 8월 10일에는 15:40 예약이 17:15 에 돌아 16:00 장마감 루틴이
금요일 값을 보고 있었다.

    python3 scripts/check_market_fresh.py close     # 국내 마감 기준
    python3 scripts/check_market_fresh.py morning   # 미국 마감 기준
    python3 scripts/check_market_fresh.py --wait close   # 새것이 될 때까지 기다린다

끝 상태(exit code)
    0  쓸 수 있다
    1  낡았다 — scripts/request_market_refresh.sh 로 수집을 부른다
    2  파일을 읽을 수 없다

수집기는 언제나 **main** 에 커밋하므로 여기서도 origin/main 을 본다. 작업
브랜치에 있어도 상관없다. main 쪽이 더 새것이면 작업본
`data/market/latest.json` 을 그것으로 맞춰 준다(--no-sync 로 끌 수 있다).
브리핑을 쓰는 쪽은 작업본을 읽기 때문이다.

수집 자체는 여기서 하지 않는다. `scripts/request_market_refresh.sh` 가 한다.
"""
import argparse
import datetime
import json
import os
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REL = "data/market/latest.json"
PATH = os.path.join(ROOT, REL)
KST = datetime.timezone(datetime.timedelta(hours=9))


def prev_business_day(d):
    """직전 영업일. 휴장일은 보지 못하므로 주말만 건너뛴다."""
    d -= datetime.timedelta(days=1)
    while d.weekday() >= 5:
        d -= datetime.timedelta(days=1)
    return d


def this_or_prev_business_day(d):
    """오늘이 주말이면 직전 금요일."""
    while d.weekday() >= 5:
        d -= datetime.timedelta(days=1)
    return d


# 뽑는 함수는 (항목 이름, 날짜, 꼭 맞아야 하는가) 를 준다.
# 꼭 맞아야 하는 항목이 하나라도 어긋나면 낡은 것으로 본다.

def us_close(j):
    ix = j.get("indices", {})
    return [("indices.sp500", (ix.get("sp500") or {}).get("date"), True),
            ("indices.nasdaq", (ix.get("nasdaq") or {}).get("date"), True)]


def kr_close(j):
    """국내 마감. 두 원천을 함께 본다.

    `index_daily`(거래소 일별시세)가 기준이고 `indices.kospi`(야후 ^KS11)는
    참고다. 야후는 장이 끝난 뒤에도 지수 일봉 종가를 한동안 `null` 로 주고
    마감가를 `meta` 에만 싣는데, 빈 봉을 건너뛰던 수집기가 8월 11일 아침에
    8월 7일 값을 8월 10일 값으로 읽었다. 수집기는 고쳤다(meta 로 채운다).

    그래도 참고로 남겨 둔다. 야후가 또 다른 방식으로 어긋날 때 이 줄이
    먼저 보여 주고, 이것 하나 때문에 브리핑을 막지는 않기 위해서다.
    """
    ser = ((j.get("index_daily", {}).get("kospi") or {}).get("series") or [{}])
    return [("index_daily.kospi[0]", ser[0].get("date"), True),
            ("indices.kospi", (j.get("indices", {}).get("kospi") or {}).get("date"), False)]


# 판별 규칙. (이름, 기대 날짜를 구하는 함수, 항목을 뽑는 함수)
CHECKS = {
    # 장마감 — 오늘 국내 마감이 들어와 있어야 한다. 미국은 아직 안 열렸다.
    "close": [("국내 오늘 마감", this_or_prev_business_day, kr_close)],
    # 모닝 — 간밤 미국 마감과 어제 국내 마감이 둘 다 있어야 한다.
    "morning": [("미국 직전 마감", prev_business_day, us_close),
                ("국내 직전 마감", prev_business_day, kr_close)],
}

# 수집 «시각» 의 하한. 날짜만 보면 장중 스냅숏이 통과한다.
#
# 날짜 검사만으로는 부족하다는 것이 사흘 연속 드러났다. 8/27 에는 12:03,
# 8/28 에는 15:03, 8/31 에는 09:24 에 찍힌 파일이 모두 「쓸 수 있다」로
# 통과했다 — 셋 다 15:30 마감 «전» 이라 종가도 수급도 그날 것이 아니었다.
# 8/27 판은 거래대금이 13.23조(정상 22~26조)인 것과 index_daily 와 indices
# 의 종가가 어긋난 것으로 겨우 알아챘다. 사람이 알아채는 데 기대면 안 된다.
#
# 기준은 «그 판이 다루는 장» 의 마감이다. 토요일에 도는 주말 판은 기대
# 날짜가 금요일이므로 금요일 15:30 이 하한이 되어 그대로 통과한다.
SESSION_FLOOR = {
    "close": datetime.time(15, 30),   # 국내 정규장 마감
    "morning": None,                  # 간밤 미국 마감이 날짜로 이미 걸러진다
}


def capture_time(j):
    """`generated_at_kst` 를 datetime 으로. 못 읽으면 None."""
    s = (j.get("generated_at_kst") or "").strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
        try:
            return datetime.datetime.strptime(s, fmt).replace(tzinfo=KST)
        except ValueError:
            pass
    return None


def load(use_main=True):
    """origin/main 의 시세 파일을 읽는다. 실패하면 작업본으로 물러선다."""
    if use_main:
        r = subprocess.run(["git", "-C", ROOT, "show", "origin/main:" + REL],
                           capture_output=True)
        if r.returncode == 0:
            try:
                return json.loads(r.stdout.decode("utf-8")), r.stdout
            except ValueError:
                pass
    try:
        with open(PATH, "rb") as f:
            raw = f.read()
        return json.loads(raw.decode("utf-8")), raw
    except Exception as e:
        return e, None


def inspect(session, today, use_main=True):
    """(쓸 수 있는가, 줄 목록, origin/main 원문) 을 준다."""
    j, raw = load(use_main)
    if isinstance(j, Exception):
        return None, ["시세 파일을 읽지 못했다: %s" % j], None

    lines = ["수집 시각 %s (origin/main)" % j.get("generated_at_kst", "?")]
    ok = True
    last_want = None
    for label, want_fn, pick in CHECKS[session]:
        want_d = want_fn(today)
        last_want = want_d
        want = want_d.isoformat()
        lines.append("%s — 기대 %s" % (label, want))
        for name, got, required in pick(j):
            hit = (got == want)
            if required and not hit:
                ok = False
            mark = "O" if hit else ("X" if required else "~")
            lines.append("  %s %-22s %s%s"
                         % (mark, name, got, "" if hit or required else "  (참고 항목)"))

    # 날짜가 맞아도 **마감 전에 찍힌 것**이면 그날 값이 아니다.
    floor_t = SESSION_FLOOR.get(session)
    if floor_t is not None and last_want is not None:
        cap = capture_time(j)
        floor = datetime.datetime.combine(last_want, floor_t, tzinfo=KST)
        if cap is None:
            ok = False
            lines.append("  X 수집 시각을 읽지 못했다 — 마감 전 자료인지 가릴 수 없다")
        elif cap < floor:
            ok = False
            lines.append("  X 마감 전 스냅숏 — %s 에 찍혔고 하한은 %s 다"
                         % (cap.strftime("%m-%d %H:%M"), floor.strftime("%m-%d %H:%M")))
            lines.append("    날짜만 맞고 종가&middot;수급은 그날 것이 아니다.".replace("&middot;", "·"))
        else:
            lines.append("  O 마감 뒤 수집          %s (하한 %s)"
                         % (cap.strftime("%m-%d %H:%M"), floor.strftime("%H:%M")))
    return ok, lines, raw


def sync(raw):
    """origin/main 쪽이 다르면 작업본을 그것으로 맞춘다."""
    try:
        with open(PATH, "rb") as f:
            if f.read() == raw:
                return False
    except Exception:
        pass
    with open(PATH, "wb") as f:
        f.write(raw)
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("session", choices=sorted(CHECKS))
    ap.add_argument("--wait", action="store_true", help="새것이 될 때까지 기다린다")
    ap.add_argument("--timeout", type=int, default=420, help="기다리는 한도(초). 기본 7분")
    ap.add_argument("--interval", type=int, default=20, help="다시 보는 간격(초)")
    ap.add_argument("--no-sync", action="store_true", help="작업본을 건드리지 않는다")
    a = ap.parse_args()

    today = datetime.datetime.now(KST).date()
    subprocess.run(["git", "-C", ROOT, "fetch", "origin", "main", "-q"],
                   capture_output=True)
    ok, lines, raw = inspect(a.session, today)
    if ok is None:
        print("\n".join(lines))
        return 2

    def finish(ok, lines, raw):
        print("\n".join(lines))
        if raw is not None and not a.no_sync and sync(raw):
            print("작업본 %s 을 origin/main 것으로 맞췄다." % REL)
        if ok:
            print("판정: 쓸 수 있다")
            return 0
        print("판정: 낡았다 — bash scripts/request_market_refresh.sh 로 수집을 부르십시오")
        print("      (휴장일이면 원래 갱신되지 않습니다. 기대 날짜가 휴장인지 먼저 보십시오.)")
        return 1

    if ok or not a.wait:
        return finish(ok, lines, raw)

    print("\n".join(lines))
    print("낡았다. 최대 %d초 기다린다." % a.timeout)
    end = time.time() + a.timeout
    while time.time() < end:
        time.sleep(a.interval)
        subprocess.run(["git", "-C", ROOT, "fetch", "origin", "main", "-q"],
                       capture_output=True)
        ok, lines, raw = inspect(a.session, today)
        print("  %s 확인 — %s (남은 %ds)"
              % (datetime.datetime.now(KST).strftime("%H:%M:%S"),
                 "갱신됨" if ok else "아직", max(int(end - time.time()), 0)))
        if ok:
            return finish(True, lines, raw)
    return finish(False, lines, raw)


if __name__ == "__main__":
    sys.exit(main())
