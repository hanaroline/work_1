#!/usr/bin/env python3
"""증시 일정 캘린더를 점검한다 — 산출물 검사 + 수집 파서의 모의 응답 검증.

두 가지를 한다.

1) `data/calendar/latest.json` 검사
   스키마·중복·과거 날짜·출처 누락·확정도 값·KST 환산·휴장일 보정을 본다. 여기서 걸리는
   것은 화면에 그대로 나가는 흠이므로 실패로 끝낸다(종료코드 1).

2) `scripts/fetch_calendar.py` 파서의 모의 응답 검증
   대상 사이트는 이 세션에서 못 받는다(CONNECT 403). 파서를 실측 없이 그냥 두면 첫 러너
   실행에서 조용히 빈 값을 뱉는지조차 알 수 없으므로, 실제 페이지 구조를 흉내낸 조각을
   넣어 기대한 날짜가 나오는지 본다. 러너가 한 번 돌면 report 가 진짜 검증이 된다.

쓰는 법
  python scripts/check_calendar.py
  python scripts/check_calendar.py --only data      # 산출물만
  python scripts/check_calendar.py --only parsers   # 파서만
"""

import argparse
import json
import os
import re
import sys
from datetime import date, datetime, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

LATEST = os.path.join(ROOT, "data", "calendar", "latest.json")
CONFIRMED = {"official", "websearch", "tentative", "estimate", "rule"}
CATEGORIES = {"policy", "indicator", "earnings", "conference", "supply", "holiday", "other"}

FAILS, WARNS = [], []


def bad(msg):
    FAILS.append(msg)


def warn(msg):
    WARNS.append(msg)


# ------------------------------------------------------------ 1) 산출물 검사

def check_data():
    d = json.load(open(LATEST, encoding="utf-8"))
    evs = d.get("events") or []
    if not evs:
        bad("events 가 비었다")
        return

    print("일정 %d건 · 기준 %s · 구간 %s~%s"
          % (len(evs), d.get("builtAt"), d["window"]["from"], d["window"]["to"]))

    lo, hi = d["window"]["from"], d["window"]["to"]
    ids, dup = set(), 0
    per_cat, per_conf = {}, {}
    no_url, no_source, bad_kst = [], [], []

    for e in evs:
        for k in ("id", "date", "category", "importance", "title_ko", "title_en", "confirmed"):
            if e.get(k) in (None, ""):
                bad("%s: 필수 항목 %s 이 비었다" % (e.get("id", "?"), k))

        if e["id"] in ids:
            dup += 1
            bad("id 중복: %s" % e["id"])
        ids.add(e["id"])

        if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(e["date"])):
            bad("%s: date 형식이 아니다 — %r" % (e["id"], e["date"]))
            continue
        if not (lo <= e["date"] <= hi):
            bad("%s: 조회 구간 밖이다 — %s" % (e["id"], e["date"]))
        if e.get("end_date") and e["end_date"] < e["date"]:
            bad("%s: end_date 가 date 보다 앞이다" % e["id"])

        if e["category"] not in CATEGORIES:
            bad("%s: 모르는 category — %s" % (e["id"], e["category"]))
        if e["confirmed"] not in CONFIRMED:
            bad("%s: 모르는 confirmed — %s" % (e["id"], e["confirmed"]))
        if e["importance"] not in (1, 2, 3):
            bad("%s: importance 가 1~3 이 아니다 — %r" % (e["id"], e["importance"]))

        per_cat[e["category"]] = per_cat.get(e["category"], 0) + 1
        per_conf[e["confirmed"]] = per_conf.get(e["confirmed"], 0) + 1

        if not e.get("url"):
            no_url.append(e["id"])
        if not e.get("source"):
            no_source.append(e["id"])
        if not e.get("source_en"):
            bad("%s: source_en 이 없다 — 영문 모드에 한글이 남는다" % e["id"])
        # 한국어 설명만 있고 영문 짝이 없으면 영문 모드에 그 문장이 한글로 남는다.
        # 실적 일정 166건에서 실제로 그렇게 샜다(2026-09-10).
        if e.get("detail_ko") and not e.get("detail_en"):
            bad("%s: detail_en 이 없다 — 영문 모드에 한글 설명이 남는다" % e["id"])

        # 시각이 있으면 KST 환산이 있어야 하고, 그 반대도 성립해야 한다.
        if e.get("time_local") and e.get("tz") and not e.get("time_kst"):
            bad("%s: 현지 시각은 있는데 KST 환산이 없다" % e["id"])
        if e.get("time_kst"):
            if not re.match(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$", e["time_kst"]):
                bad("%s: time_kst 형식이 아니다 — %r" % (e["id"], e["time_kst"]))
            else:
                # 환산일이 일정일과 이틀 이상 벌어지면 시간대 계산이 잘못된 것이다.
                gap = abs((date.fromisoformat(e["time_kst"][:10]) -
                           date.fromisoformat(e["date"])).days)
                if gap > 1:
                    bad_kst.append("%s (%s → KST %s)" % (e["id"], e["date"], e["time_kst"]))

    if bad_kst:
        for x in bad_kst:
            bad("KST 환산일이 일정일과 너무 벌어졌다: %s" % x)

    if no_url:
        bad("출처 링크가 없는 일정 %d건 — %s" % (len(no_url), ", ".join(no_url[:5])))
    if no_source:
        bad("출처 이름이 없는 일정 %d건 — %s" % (len(no_source), ", ".join(no_source[:5])))

    print("  분류    " + " · ".join("%s %d" % kv for kv in sorted(per_cat.items())))
    print("  확정도  " + " · ".join("%s %d" % kv for kv in sorted(per_conf.items())))

    # 정렬이 날짜순인지 — 화면이 이 순서를 그대로 믿는다.
    if [e["date"] for e in evs] != sorted(e["date"] for e in evs):
        bad("events 가 날짜순이 아니다")

    # 확정 일정이 하나도 없으면 화면 ① 이 텅 빈다.
    hard = sum(1 for e in evs if e["confirmed"] in ("official", "websearch", "tentative"))
    if hard < 20:
        bad("확정·교차확인 일정이 %d건뿐이다 — 규칙 추정만 남았는지 확인" % hard)

    # 같은 지표가 같은 달에 두 번 들어오면 한 달에 두 번 발표되는 것처럼 읽힌다.
    seen = {}
    for e in evs:
        tag = next((t for t in e.get("tags", []) if t.startswith(("us-", "kr-", "eu-", "jp-", "cn-"))), None)
        if not tag or e["category"] != "indicator":
            continue
        if tag in ("us-claims",):                     # 주간 지표는 당연히 여러 번이다
            continue
        key = (tag, e["date"][:7])
        seen.setdefault(key, []).append(e["id"])
    for (tag, month), got in sorted(seen.items()):
        if len(got) > 1:
            bad("%s 가 %s 에 %d번 들어왔다 — %s" % (tag, month, len(got), ", ".join(got)))

    # 만기일이 휴장일에 걸려 있으면 보정이 안 된 것이다.
    closed = {}
    for m in d.get("holidays", []):
        for day in m.get("days", []):
            if day.get("kind") == "full":
                closed.setdefault(m["key"], set()).add(day["date"])
    for e in evs:
        if e["category"] != "supply":
            continue
        if e["date"] in closed.get(e["country"], set()):
            bad("%s: 만기·리밸런싱이 %s 시장 휴장일(%s)에 있다 — 보정 실패"
                % (e["id"], e["country"], e["date"]))
        if date.fromisoformat(e["date"]).weekday() >= 5:
            bad("%s: 만기·리밸런싱이 주말(%s)에 있다" % (e["id"], e["date"]))

    # 같은 중앙은행의 정책 회의가 겹치면 페이지의 엉뚱한 대목을 회의로 읽은 것이다.
    # 2026-09-10 러너 실행에서 FOMC 2027년 1월에 겹치는 회의가 둘 들어왔던 자리다.
    banks = {}
    for e in evs:
        if e["category"] != "policy":
            continue
        # 블랙아웃은 회의를 품는 구간이라 겹치는 것이 정의다 — 결정일끼리만 견준다.
        if "blackout" in e.get("tags", []):
            continue
        key = next((t for t in e.get("tags", [])
                    if t in ("fed", "boe", "boj", "bok", "ecb", "pboc")), None)
        if key:
            banks.setdefault(key, []).append(e)
    for key, rows in banks.items():
        rows.sort(key=lambda x: x["date"])
        for a, b2 in zip(rows, rows[1:]):
            if b2["date"] <= (a.get("end_date") or a["date"]):
                bad("%s 정책 회의가 겹친다 — %s~%s 와 %s"
                    % (key, a["date"], a.get("end_date") or a["date"], b2["date"]))

    # 휴장일의 kind 가 요일과 어긋나면 표기가 틀린 것이다 — 'weekend' 는 원래 쉬는 날이라는
    # 뜻이고, 평일에 그렇게 적히면 그 시장이 정상 개장하는 것처럼 읽힌다.
    for m in d.get("holidays", []):
        for day in m.get("days", []):
            wd = date.fromisoformat(day["date"]).weekday()
            if wd >= 5 and day.get("kind") != "weekend":
                bad("%s %s(%s)은 주말인데 kind=%s 다" % (m["key"], day["date"], day.get("ko"),
                                                       day.get("kind")))
            if wd < 5 and day.get("kind") == "weekend":
                bad("%s %s(%s)은 평일인데 kind=weekend 다" % (m["key"], day["date"], day.get("ko")))

    # undated 는 날짜가 없어야 한다 — 여기에 날짜가 들어오면 캘린더에 들어가야 할 것이다.
    for u in d.get("undated", []):
        if not u.get("url"):
            bad("undated 항목에 링크가 없다 — %s" % u.get("name_ko"))
    print("  날짜 미확인 항목 %d개" % len(d.get("undated", [])))

    if d.get("gaps"):
        print("  빈 곳으로 기록된 것 %d개" % len(d["gaps"]))

    # 화면이 쓰는 부속 자료
    for k in ("confirmed_legend", "confirmed_legend_en", "company_names",
              "indicators", "banks", "holidays", "earnings_snapshot_bases"):
        if not d.get(k):
            bad("latest.json 에 %s 가 없다 — 화면의 한 섹션이 빈다" % k)
    if len(d.get("confirmed_legend", {})) != len(d.get("confirmed_legend_en", {})):
        bad("확정도 설명의 한/영 항목 수가 다르다")

    # 영문 필드가 한국어 그대로면 영문 모드에 한글이 남는다.
    ko_in_en = [e["id"] for e in evs
                if e.get("title_en") and re.search(r"[가-힣]", e["title_en"])
                and e["category"] not in ("earnings",)]
    if ko_in_en:
        warn("title_en 에 한글이 남은 일정 %d건 — %s"
             % (len(ko_in_en), ", ".join(ko_in_en[:5])))


# --------------------------------------------- 2) 파서의 모의 응답 검증

# 아래 조각은 첫 러너 실행이 남긴 진단(probe)을 보고 **실제 페이지 구조에 맞춰** 고쳤다.
# 처음에는 짐작으로 썼는데, 그 짐작이 틀려서 다섯 곳이 HTTP 200 을 받고도 0건을 뱉었다.
#   FOMC   연도 헤딩 안에 태그가 하나 더 끼어 있다
#   BOE    연도는 '2026 confirmed dates' 헤딩에 있고 날짜에는 안 붙는다
#   BOJ    연도는 <h2>2026</h2> 에 있고 날짜에는 안 붙는다

FOMC_HTML = """
<h3>Meeting calendars, statements, and minutes (2021-2027)</h3>
<div class="panel panel-default">
  <div class="panel-heading"><h4 class="panel-title"><a href="#a2026">2026 FOMC Meetings</a></h4></div>
  <div class="panel-body">
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>January</strong></div>
      <div class="fomc-meeting__date">27-28</div>
      <div class="fomc-meeting__minutes"><a href="/x.htm">Minutes</a>
        (Released February 18, 2026)</div>
    </div>
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>March</strong></div>
      <div class="fomc-meeting__date">17-18*</div>
      <div class="fomc-meeting__minutes">(Released April 08, 2026)</div>
    </div>
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>April/May</strong></div>
      <div class="fomc-meeting__date">28-29</div>
    </div>
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>June</strong></div>
      <div class="fomc-meeting__date">16-17*</div>
    </div>
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>July</strong></div>
      <div class="fomc-meeting__date">28-29</div>
    </div>
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>September</strong></div>
      <div class="fomc-meeting__date">15-16*</div>
    </div>
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>October</strong></div>
      <div class="fomc-meeting__date">27-28</div>
    </div>
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>December</strong></div>
      <div class="fomc-meeting__date">8-9*</div>
    </div>
  </div>
</div>
<div class="panel panel-default">
  <div class="panel-heading"><h4 class="panel-title"><span>2027 FOMC Meetings</span></h4></div>
  <div class="panel-body">
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>January</strong></div>
      <div class="fomc-meeting__date">26-27</div>
    </div>
    <div class="row fomc-meeting">
      <div class="fomc-meeting__month"><strong>April/May</strong></div>
      <div class="fomc-meeting__date">27-28</div>
    </div>
    <p class="note">Organizational business is taken up January 25-26 alongside
       the first meeting.</p>
  </div>
</div>
"""

ECB_HTML = """
<table class="ecb-table"><tbody>
<tr><td>9-10 September 2026</td><td>Governing Council monetary policy meeting, Frankfurt</td></tr>
<tr><td>24 September 2026</td><td>Governing Council meeting (non-monetary policy)</td></tr>
<tr><td>28-29 October 2026</td><td>Governing Council monetary policy meeting</td></tr>
<tr><td>16-17 December 2026</td><td>Governing Council monetary policy meeting</td></tr>
<tr><td>3-4 February 2027</td><td>Governing Council monetary policy meeting</td></tr>
<tr><td>17-18 March 2027</td><td>Governing Council monetary policy meeting</td></tr>
<tr><td>28-29 April 2027</td><td>Governing Council monetary policy meeting</td></tr>
<tr><td>9-10 June 2027</td><td>Governing Council monetary policy meeting</td></tr>
</tbody></table>
"""

BOE_HTML = """
<h1>Monetary Policy Committee dates for 2026 and 2027</h1>
<h2>2026 confirmed dates</h2>
<table><tbody>
<tr><th>MPC announcement</th><th>Minutes</th></tr>
<tr><td>Thursday 5 February</td><td>with Monetary Policy Report</td></tr>
<tr><td>Thursday 19 March</td><td></td></tr>
<tr><td>Thursday 30 April</td><td>with Monetary Policy Report</td></tr>
<tr><td>Thursday 18 June</td><td></td></tr>
<tr><td>Thursday 30 July</td><td>with Monetary Policy Report</td></tr>
<tr><td>Thursday 17 September</td><td></td></tr>
<tr><td>Thursday 5 November</td><td>with Monetary Policy Report</td></tr>
<tr><td>Thursday 17 December</td><td></td></tr>
</tbody></table>
<h2>2027 provisional dates</h2>
<table><tbody>
<tr><td>Thursday 4 February</td><td></td></tr>
<tr><td>Thursday 18 March</td><td></td></tr>
</tbody></table>
"""

BOJ_HTML = """
<h1>Monetary Policy Meetings</h1>
<h2>2026</h2>
<table><tbody>
<tr><th>Meeting</th><th>Minutes released</th></tr>
<tr><td>January 22 and 23</td><td>March 20</td></tr>
<tr><td>March 18 and 19</td><td>May 8</td></tr>
<tr><td>April 27 and 28</td><td>June 19</td></tr>
<tr><td>June 15 and 16</td><td>August 3</td></tr>
<tr><td>July 30 and 31</td><td>September 24</td></tr>
<tr><td>September 17 and 18</td><td>November 6</td></tr>
<tr><td>October 29 and 30</td><td>December 22</td></tr>
<tr><td>December 17 and 18</td><td>January 29</td></tr>
</tbody></table>
<h2>2027</h2>
<table><tbody>
<tr><td>January 21 and 22</td><td>March 19</td></tr>
</tbody></table>
"""

BOK_HTML = """
<table><tbody>
<tr><td>통화정책방향 결정회의</td><td>2026.10.22</td><td>의사록 공개 2026.11.10</td></tr>
<tr><td>통화정책방향 결정회의</td><td>2026.11.26</td><td>의사록 공개 2026.12.15</td></tr>
<tr><td>통화정책방향 결정회의</td><td>2027.01.14</td><td></td></tr>
<tr><td>통화정책방향 결정회의</td><td>2027.02.25</td><td></td></tr>
<tr><td>통화정책방향 결정회의</td><td>2027.04.15</td><td></td></tr>
<tr><td>통화정책방향 결정회의</td><td>2027.05.27</td><td></td></tr>
<tr><td>통화정책방향 결정회의</td><td>2027.07.15</td><td></td></tr>
<tr><td>통화정책방향 결정회의</td><td>2027.08.26</td><td></td></tr>
</tbody></table>
"""

BLS_HTML = """
<table><tbody>
<tr><td>Consumer Price Index for August 2026</td><td>Friday, September 11, 2026</td><td>8:30 AM</td></tr>
<tr><td>Consumer Price Index for September 2026</td><td>Wednesday, October 14, 2026</td><td>8:30 AM</td></tr>
<tr><td>Consumer Price Index for October 2026</td><td>Wednesday, November 11, 2026</td><td>8:30 AM</td></tr>
<tr><td>Consumer Price Index for November 2026</td><td>Thursday, December 10, 2026</td><td>8:30 AM</td></tr>
<tr><td>Consumer Price Index for December 2026</td><td>Wednesday, January 13, 2027</td><td>8:30 AM</td></tr>
<tr><td>Consumer Price Index for January 2027</td><td>Wednesday, February 10, 2027</td><td>8:30 AM</td></tr>
<tr><td>Consumer Price Index for February 2027</td><td>Wednesday, March 10, 2027</td><td>8:30 AM</td></tr>
</tbody></table>
"""

BROKEN_HTML = "<html><body><p>Sorry, this page has moved.</p></body></html>"


def check_parsers():
    import fetch_calendar as fc

    def run(name, fn, html, want_first, want_min, want_flag=None):
        try:
            got = fn(html)
        except fc.Skip as e:
            bad("파서 %s: 모의 응답에서 걸러졌다 — %s" % (name, e))
            return
        except Exception as e:                                # noqa: BLE001
            bad("파서 %s: 모의 응답에서 터졌다 — %s: %s" % (name, type(e).__name__, e))
            return
        if len(got) < want_min:
            bad("파서 %s: %d건만 읽었다 (%d건 이상 기대)" % (name, len(got), want_min))
        first = got[0]
        if isinstance(first, dict) and "start" in first:
            actual = (first["start"], first["end"])
        else:
            actual = first
        if actual != want_first:
            bad("파서 %s: 첫 항목이 %r 인데 %r 를 기대했다" % (name, actual, want_first))
        if want_flag is not None:
            flags = [m.get("sep") for m in got[:want_flag[0]]]
            if flags != want_flag[1]:
                bad("파서 %s: 전망 동반 표시가 %r 인데 %r 를 기대했다"
                    % (name, flags, want_flag[1]))
        print("  %-8s %d건 · 첫 항목 %s" % (name, len(got), actual))

    print("모의 응답으로 파서 검증")
    run("fomc", fc.parse_fomc, FOMC_HTML, ("2026-01-27", "2026-01-28"), 9,
        (4, [False, True, False, True]))
    run("ecb", fc.parse_ecb, ECB_HTML, ("2026-09-09", "2026-09-10"), 7)
    run("boe", fc.parse_boe, BOE_HTML, ("2026-02-05", "2026-02-05"), 8)
    run("boj", fc.parse_boj, BOJ_HTML, ("2026-01-22", "2026-01-23"), 8)
    run("bok", fc.parse_bok, BOK_HTML, ("2026-10-22", "2026-10-22"), 8)
    run("bls", fc.parse_bls, BLS_HTML, "2026-09-11", 7)

    # ECB 는 '비통화정책 회의'(9/24)를 걸러야 한다.
    ecb = fc.parse_ecb(ECB_HTML)
    if any(m["start"] == "2026-09-24" for m in ecb):
        bad("파서 ecb: 비통화정책 회의(2026-09-24)를 걸러내지 못했다")
    # BOJ 는 하루짜리 의사록 공표일을 회의로 잡아서는 안 된다.
    boj = fc.parse_boj(BOJ_HTML)
    if any(m["start"] == m["end"] for m in boj):
        bad("파서 boj: 하루짜리 항목(의사록 공표일)이 회의로 들어왔다")
    if any(m["start"] == "2026-03-20" for m in boj):
        bad("파서 boj: 의사록 공표일 2026-03-20 을 회의로 잡았다")
    # BOK 는 의사록 공개일을 회의로 잡아서는 안 된다.
    bok = fc.parse_bok(BOK_HTML)
    if any(m["start"] == "2026-11-10" for m in bok):
        bad("파서 bok: 의사록 공개일 2026-11-10 을 회의로 잡았다")

    # FOMC — 정례 회의는 화요일에 시작한다. 러너 실행에서 2027년 1월에 겹치는 회의가
    # 둘 들어왔던 자리다(페이지 다른 대목의 '월 일자').
    fomc = fc.parse_fomc(FOMC_HTML)
    if any(m["start"] == "2027-01-25" for m in fomc):
        bad("파서 fomc: 화요일이 아닌 2027-01-25 를 회의로 잡았다")
    from datetime import date as _date
    off = [m["start"] for m in fomc if _date.fromisoformat(m["start"]).weekday() != 1]
    if off:
        bad("파서 fomc: 화요일에 시작하지 않는 회의가 있다 — %s" % off)
    for a, b in zip(fomc, fomc[1:]):
        if b["start"] <= a["end"]:
            bad("파서 fomc: 회의가 겹친다 — %s~%s 와 %s~%s"
                % (a["start"], a["end"], b["start"], b["end"]))

    # BOE — 전망보고서 동반 여부를 달로 짐작하지 않고 본문에서 읽어야 한다.
    boe = {m["start"]: m for m in fc.parse_boe(BOE_HTML)}
    for day, want in (("2026-02-05", True), ("2026-04-30", True), ("2026-07-30", True),
                      ("2026-03-19", False), ("2026-06-18", False), ("2026-12-17", False)):
        got = boe.get(day, {}).get("sep")
        if got is not want:
            bad("파서 boe: %s 의 전망보고서 동반 표시가 %r 인데 %r 를 기대했다"
                % (day, got, want))
    # 페이지에 그 문구가 아예 없으면 아무 것도 주장하지 않아야 한다(False 도 주장이다).
    no_mpr = fc.parse_boe(BOE_HTML.replace("with Monetary Policy Report", ""))
    if any(m["sep"] is not None for m in no_mpr):
        bad("파서 boe: 전망보고서 문구가 없는 페이지에서 동반 여부를 단정했다")

    # 페이지가 바뀐 상황 — 반드시 Skip 이어야 한다(빈 값으로 seed 를 덮어쓰면 안 된다).
    print("페이지가 바뀐 상황 — 모두 걸러져야 한다")
    for name, fn in (("fomc", fc.parse_fomc), ("ecb", fc.parse_ecb), ("boe", fc.parse_boe),
                     ("boj", fc.parse_boj), ("bok", fc.parse_bok), ("bls", fc.parse_bls)):
        try:
            fn(BROKEN_HTML)
            bad("파서 %s: 구조가 바뀐 페이지를 통과시켰다 — seed 를 덮어쓸 위험" % name)
        except fc.Skip:
            print("  %-8s 걸러짐 (정상)" % name)
        except Exception as e:                                # noqa: BLE001
            bad("파서 %s: 걸러지는 대신 터졌다 — %s" % (name, type(e).__name__))

    # 반영 단계도 본다 — 구간 밖 회의만 오면 seed 를 갈아끼우지 않아야 한다.
    cb = json.load(open(os.path.join(ROOT, "data", "calendar", "seed",
                                     "centralbanks.json"), encoding="utf-8"))
    far = [{"start": "2035-01-01", "end": "2035-01-02", "sep": False,
            "presser": True, "confirmed": "official"}]
    try:
        fc.apply_bank(cb, "fed", far, {})
        bad("apply_bank: 먼 미래 회의만 왔는데도 seed 를 갈아끼웠다")
    except fc.Skip:
        print("  apply_bank 구간 밖 입력 걸러짐 (정상)")

    # 파서가 연도 구획 안의 '월 일자' 를 그러모으는 방식이라, 엉뚱한 표를 읽으면 날짜
    # 형식은 멀쩡한데 개수가 먼저 어긋난다. 연간 횟수 검사가 그것을 잡아야 한다.
    from datetime import date as _d, timedelta as _td
    nxt = _d.today().year + 1
    flood = [{"start": "%d-%02d-%02d" % (nxt, (i % 12) + 1, (i % 27) + 1),
              "end": "%d-%02d-%02d" % (nxt, (i % 12) + 1, (i % 27) + 1),
              "sep": False, "presser": True, "confirmed": "official"} for i in range(30)]
    try:
        fc.apply_bank(json.loads(json.dumps(cb)), "fed", flood, {})
        bad("apply_bank: 연 8회 기관에 30건이 들어왔는데 통과시켰다")
    except fc.Skip as e:
        print("  apply_bank 연간 횟수 검사 걸러짐 (정상) — %s" % e)

    # 반대로 정상 개수는 통과해야 한다(검사가 지나치게 빡빡하면 수집이 영영 안 된다).
    ok8 = [{"start": "%d-%02d-15" % (nxt, mth), "end": "%d-%02d-16" % (nxt, mth),
            "sep": mth in (3, 6, 9, 12), "presser": True, "confirmed": "official"}
           for mth in (1, 3, 4, 6, 7, 9, 10, 12)]
    try:
        n, _ = fc.apply_bank(json.loads(json.dumps(cb)), "fed", ok8, {})
        print("  apply_bank 정상 8회 통과 (정상) — %d건" % n)
    except fc.Skip as e:
        bad("apply_bank: 연 8회 정상 입력을 걸러냈다 — %s" % e)


def main(argv=None):
    ap = argparse.ArgumentParser(description="증시 일정 캘린더를 점검한다")
    ap.add_argument("--only", choices=["data", "parsers"], default=None)
    args = ap.parse_args(argv)

    if args.only in (None, "data"):
        print("=== 산출물 검사 (data/calendar/latest.json) ===")
        check_data()
        print()
    if args.only in (None, "parsers"):
        print("=== 수집 파서 검증 (모의 응답) ===")
        check_parsers()
        print()

    if WARNS:
        print("경고 %d개" % len(WARNS))
        for w in WARNS:
            print("  - " + w)
    if FAILS:
        print("실패 %d개" % len(FAILS))
        for f in FAILS:
            print("  - " + f)
        return 1
    print("모두 통과")
    return 0


if __name__ == "__main__":
    sys.exit(main())
