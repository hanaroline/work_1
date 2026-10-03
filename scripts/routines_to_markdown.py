#!/usr/bin/env python3
"""예약(Routine) 목록 JSON → 보관용 마크다운 문서.

왜 손으로 적지 않는가
  예약 지시문은 «원문 그대로» 가 생명이다. 사람이(또는 모델이) 옮겨 적으면
  줄바꿈 하나, 따옴표 하나가 달라지고 그만큼 결과가 달라진다. 그래서 이 스크립트가
  JSON 에서 꺼낸 글자를 그대로 코드블록에 넣는다. 요약하지 않는다.

쓰는 법
  1) Claude 세션에서 예약 목록을 받는다(도구 결과가 파일로 저장된다):
       mcp__Claude_Code_Remote__list_triggers(limit=100, include_completed=True)
  2) 그 파일 경로를 넘긴다:
       python3 scripts/routines_to_markdown.py <받은.json> \
           --out docs/handover/예약-전체목록.md

  JSON 은 {"data": [ {...}, ... ]} 또는 예약 배열 자체면 된다.

담는 것
  살아 있는 예약은 설정과 **지시문 전문**을, 폐기된 예약은 부록에 같은 방식으로.
  이미 발사된 일회성 알림(send_later)은 수가 많고 쓸모가 없으므로 수만 센다.
"""

import argparse
import datetime
import json
import os
import sys

DOW_KO = ["일", "월", "화", "수", "목", "금", "토"]


def kst(iso):
    """RFC3339 → '2026-10-01 13:24 KST'. 못 읽으면 원문 그대로."""
    if not iso:
        return "—"
    s = iso.replace("Z", "+00:00")
    # 초 아래 자릿수가 6자리를 넘으면 fromisoformat 이 거부한다
    if "." in s:
        head, _, tail = s.partition(".")
        frac = tail[:6]
        rest = tail[len(tail.rstrip("0123456789")) * 0:]
        off = tail[len(frac):] if len(tail) > 6 else ""
        for i, ch in enumerate(tail):
            if not ch.isdigit():
                off = tail[i:]
                break
        s = "%s.%s%s" % (head, frac.ljust(6, "0"), off)
    try:
        d = datetime.datetime.fromisoformat(s)
    except ValueError:
        return iso
    d = d.astimezone(datetime.timezone(datetime.timedelta(hours=9)))
    return d.strftime("%Y-%m-%d %H:%M KST")


def _dows(field, shift):
    """cron 요일 필드를 한국어로. shift 는 UTC→KST 에서 날짜가 넘어갔는지."""
    if field in ("*", "?"):
        return "매일"
    out = []
    for part in field.split(","):
        if "-" in part:
            a, b = part.split("-", 1)
            try:
                a, b = int(a), int(b)
            except ValueError:
                return field
            rng = []
            i = a
            while True:
                rng.append(i % 7)
                if i % 7 == b % 7:
                    break
                i += 1
                if len(rng) > 7:
                    break
            out.extend(rng)
        else:
            try:
                out.append(int(part) % 7)
            except ValueError:
                return field
    out = [(d + shift) % 7 for d in out]
    if sorted(set(out)) == [1, 2, 3, 4, 5]:
        return "평일(월~금)"
    if len(out) > 2 and out == sorted(out) and out[-1] - out[0] == len(out) - 1:
        return "%s~%s요일" % (DOW_KO[out[0]], DOW_KO[out[-1]])
    return "·".join(DOW_KO[d] + "요일" for d in out)


def cron_ko(expr):
    """UTC 크론 다섯 칸 → 한국 시각으로 읽은 한 줄."""
    if not expr:
        return "—"
    if expr.startswith("CRON_TZ="):      # 지금은 쓰지 않지만 들어오면 손대지 않는다
        return expr
    f = expr.split()
    if len(f) != 5:
        return expr
    mi, hh, dom, mon, dow = f
    try:
        m, h = int(mi), int(hh)
    except ValueError:
        return expr + " (UTC)"
    kh = h + 9
    shift = kh // 24
    kh %= 24
    when = _dows(dow, shift) if dom in ("*", "?") else "%s일" % dom
    return "%s %02d:%02d KST  (UTC `%s`)" % (when, kh, m, expr)


def connectors(t):
    """커넥터는 문자열일 때도, {name: …} 꼴일 때도 온다."""
    out = []
    for c in t.get("mcp_connections") or []:
        out.append(c if isinstance(c, str) else (c.get("name") or c.get("connector_uuid") or "?"))
    return ", ".join(out)


def target(t):
    if t.get("persistent_session_id"):
        return "지정한 창으로 전달 — `%s`" % t["persistent_session_id"]
    if t.get("persist_session"):
        return "이 예약을 만든 창으로 전달"
    return "**매번 새 창**"


def section(t, level="###"):
    ds = t.get("derived_state") or {}
    lr = t.get("last_run") or {}
    out = []
    out.append("%s %s" % (level, t.get("name") or "(이름 없음)"))
    out.append("")
    rows = [
        ("예약 ID", "`%s`" % t.get("id", "")),
        ("주기", cron_ko(t.get("cron_expression")) if t.get("cron_expression")
         else ("일회성 — %s" % kst(t.get("run_once_at")))),
        ("켜짐", "예" if t.get("enabled") else "아니오"),
        ("전달 방식", target(t)),
        ("연동 커넥터", connectors(t) or "없음"),
        ("모델 지정", ds.get("model") or "(기본값)"),
        ("만든 날", kst(t.get("created_at"))),
        ("마지막 고친 날", kst(t.get("updated_at"))),
        ("마지막 실행", "%s · %s" % (
            (lr.get("status") or "").replace("ROUTINE_RUN_STATUS_", "") or "기록 없음",
            kst(lr.get("fired_at")))),
    ]
    if t.get("ended_reason"):
        rows.append(("끝난 이유", "`%s`" % t["ended_reason"]))
    out.append("| 항목 | 값 |")
    out.append("|---|---|")
    for k, v in rows:
        out.append("| %s | %s |" % (k, v))
    out.append("")
    out.append("**지시문 전문**")
    out.append("")
    out.append("````")
    out.append((ds.get("prompt") or "(지시문이 비어 있습니다)").rstrip())
    out.append("````")
    out.append("")
    return out


def build(trigs, now, notes=None):
    live_rec = [t for t in trigs if t.get("cron_expression") and t.get("enabled")]
    live_one = [t for t in trigs if not t.get("cron_expression") and t.get("enabled")]
    dead_rec = [t for t in trigs if t.get("cron_expression") and not t.get("enabled")]
    fired = [t for t in trigs if not t.get("cron_expression") and not t.get("enabled")]

    live_rec.sort(key=lambda t: (t.get("cron_expression") or ""))
    live_one.sort(key=lambda t: (t.get("run_once_at") or ""))
    dead_rec.sort(key=lambda t: (t.get("cron_expression") or ""))

    L = []
    L.append("# 예약(Routine) 전체 목록 — 지시문 원문 보관본")
    L.append("")
    L.append("**뽑은 때 %s · 계정 `hanaroline` (송재섭, 마포WM)**" % now)
    L.append("")
    L.append("예약은 **Claude 계정에 묶여 있어 계정을 옮기면 사라집니다.** 저장소는 그대로")
    L.append("남지만 «매일 07:30 에 무엇을 시켰는지»는 남지 않습니다. 그래서 설정과")
    L.append("**지시문 전문**을 여기에 그대로 옮겨 둡니다.")
    L.append("")
    L.append("> 이 문서는 `scripts/routines_to_markdown.py` 가 예약 목록 JSON 에서 뽑아")
    L.append("> 만든 것입니다. 지시문은 **한 글자도 고치지 않았습니다** — 요약하거나 줄이면")
    L.append("> 그만큼 결과가 나빠집니다. 새 계정에서는 아래 글을 **그대로 복사**하십시오.")
    L.append("")
    L.append("| | 수 |")
    L.append("|---|---|")
    L.append("| 살아 있는 반복 예약 | **%d** |" % len(live_rec))
    L.append("| 예정된 일회성 | %d |" % len(live_one))
    L.append("| 꺼둔 반복 예약(폐기·대체) | %d |" % len(dead_rec))
    L.append("| 이미 발사된 일회성 알림 | %d |" % len(fired))
    L.append("")
    if notes:
        L.append("---")
        L.append("")
        L.append(notes.rstrip())
        L.append("")
    L.append("---")
    L.append("")
    L.append("## 한눈에 보기 — 살아 있는 예약")
    L.append("")
    L.append("| 한국 시각 | 이름 | 전달 | 마지막 실행 |")
    L.append("|---|---|---|---|")
    for t in sorted(live_rec + live_one, key=lambda x: cron_ko(x.get("cron_expression"))):
        lr = t.get("last_run") or {}
        st = (lr.get("status") or "").replace("ROUTINE_RUN_STATUS_", "") or "—"
        when = cron_ko(t.get("cron_expression")).split("  (UTC")[0] if t.get("cron_expression") \
            else ("일회 " + kst(t.get("run_once_at")))
        tg = "새 창" if not (t.get("persist_session") or t.get("persistent_session_id")) \
            else ("전용 창" if t.get("persistent_session_id") else "만든 창")
        L.append("| %s | %s | %s | %s %s |" % (when, t.get("name"), tg, st, kst(lr.get("fired_at"))))
    L.append("")
    L.append("---")
    L.append("")
    L.append("## 1. 살아 있는 반복 예약")
    L.append("")
    for t in live_rec:
        L.extend(section(t))
        L.append("---")
        L.append("")
    if live_one:
        L.append("## 2. 예정된 일회성")
        L.append("")
        for t in live_one:
            L.extend(section(t))
            L.append("---")
            L.append("")
    L.append("## 부록 A. 꺼둔 예약 — 왜 남겨 두는가")
    L.append("")
    L.append("대체된 구판입니다. **다시 만들 필요는 없습니다.** 다만 현행판이 왜 지금")
    L.append("모습인지는 구판과 견주어 보아야 알 수 있어, 지시문을 함께 남깁니다.")
    L.append("")
    for t in dead_rec:
        L.extend(section(t, "###"))
        L.append("---")
        L.append("")
    L.append("## 부록 B. 이미 발사된 일회성 알림 %d건" % len(fired))
    L.append("")
    L.append("«이따 다시 알려 줘» 류의 `send_later` 알림입니다. 한 번 울리고 스스로")
    L.append("꺼지므로 **옮길 것이 없습니다.** 목록만 적어 둡니다.")
    L.append("")
    if fired:
        L.append("| 울린 때 | 이름 |")
        L.append("|---|---|")
        for t in sorted(fired, key=lambda x: x.get("run_once_at") or "", reverse=True):
            L.append("| %s | %s |" % (kst(t.get("run_once_at")), (t.get("name") or "")[:70]))
        L.append("")
    return "\n".join(L) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("json", help="list_triggers 결과 파일")
    ap.add_argument("--out", required=True)
    ap.add_argument("--notes", help="요약 표 뒤에 끼워 넣을 손으로 쓴 메모(마크다운). "
                                    "다시 뽑아도 지워지지 않게 따로 둔다.")
    a = ap.parse_args()

    raw = json.load(open(a.json, encoding="utf-8"))
    trigs = raw["data"] if isinstance(raw, dict) and "data" in raw else raw
    if not isinstance(trigs, list):
        sys.exit("예약 배열을 찾지 못했다")

    notes = open(a.notes, encoding="utf-8").read() if a.notes else None
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
    doc = build(trigs, now.strftime("%Y-%m-%d %H:%M KST"), notes)

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        f.write(doc)
    print("만들었다: %s (%d자 · 예약 %d개)" % (a.out, len(doc), len(trigs)))


if __name__ == "__main__":
    main()
