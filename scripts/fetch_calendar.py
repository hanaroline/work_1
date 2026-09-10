#!/usr/bin/env python3
"""증시 일정의 확정 날짜를 발표기관 원문에서 받아 seed 를 갱신한다 (GitHub Actions 러너용).

왜 러너에서 도나
  Claude 세션은 이그레스 정책으로 federalreserve.gov·bok.or.kr·bls.gov 에 붙지 못한다
  (게이트웨이가 CONNECT 에 403). 그래서 seed 의 날짜는 검색으로 교차 확인한 값이고
  confirmed 가 "websearch" 다. 러너는 그 정책 밖에서 돌므로 여기서 공식 페이지를 받아
  "official" 로 올린다. 화면은 그 차이를 배지로 보여준다.

이 스크립트가 지키는 것 — **의심스러우면 덮어쓰지 않는다**
  HTML 을 긁는 경로는 상대가 페이지 구조를 바꾸면 조용히 빈 값을 뱉는다. 그때 seed 를
  덮어쓰면 검색으로 확인해 둔 날짜까지 사라진다. 그래서 파서마다 최소 건수와 날짜 범위를
  검사해 통과할 때만 반영하고, 실패는 data/calendar/fetch-report.json 과 Actions 요약에
  남긴다. 실패해도 종료코드는 0 이다 — 한 경로가 막혔다고 나머지 수집을 실패로 만들지 않는다.

  받은 날짜가 seed 와 다르면 **그 차이를 report 에 적는다**. 조용히 바뀌면 어느 날 일정이
  왜 달라졌는지 알 수 없다.

받아오는 곳 (2026-09-10 러너에서 실측)
  FOMC        federalreserve.gov/monetarypolicy/fomccalendars.htm        O
  BOE         bankofengland.co.uk/monetary-policy/upcoming-mpc-dates     O
  미국채 입찰   treasurydirect.gov/TA_WS/securities/upcoming (공개 JSON)     O
  FRED        api.stlouisfed.org/fred/release/dates                      FRED_API_KEY 있을 때만
  BLS         bls.gov/schedule/news_release/{cpi,empsit,ppi}.htm         403 (러너 IP 차단)
  ECB·BOJ·한국은행                                                        받을 수 없다 → BLOCKED 참고

쓰는 법
  python scripts/fetch_calendar.py                    # 전부 받아 seed 갱신 + latest.json 재빌드
  python scripts/fetch_calendar.py --dry-run          # 받아서 견주기만 하고 파일은 안 고친다
  python scripts/fetch_calendar.py --only fomc,boe
  python scripts/fetch_calendar.py --try-blocked      # 못 받는다고 적어 둔 곳도 다시 시험
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED_DIR = os.path.join(ROOT, "data", "calendar", "seed")
REPORT_PATH = os.path.join(ROOT, "data", "calendar", "fetch-report.json")

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/124.0 Safari/537.36")

MONTHS = {m.lower(): i for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"], 1)}
MONTHS.update({m[:3].lower(): i for m, i in list(MONTHS.items())})


# ------------------------------------------------------------------ 잔심부름

def http(url, timeout=25, tries=3, accept="text/html,application/json"):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": UA, "Accept": accept, "Accept-Language": "en,ko;q=0.8"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                raw = r.read()
            return raw.decode("utf-8", "replace")
        except Exception as e:                                # noqa: BLE001
            last = e
            if i < tries - 1:
                time.sleep(2 * (i + 1))
    raise last


def strip_tags(html):
    html = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
    html = re.sub(r"(?s)<[^>]+>", " ", html)
    html = (html.replace("&nbsp;", " ").replace("&amp;", "&")
                .replace("&ndash;", "-").replace("&mdash;", "-")
                .replace("–", "-").replace("—", "-"))
    return re.sub(r"\s+", " ", html).strip()


def mk(y, mon, day):
    try:
        return date(int(y), int(mon), int(day)).isoformat()
    except ValueError:
        return None


class Skip(Exception):
    """받았지만 믿을 수 없다 — seed 를 그대로 둔다."""


def need(cond, why):
    if not cond:
        raise Skip(why)


# 파서가 0건을 뱉었을 때 찾아볼 날짜 표기들. 페이지가 어떤 꼴로 날짜를 적는지 알아야
# 파서를 그 꼴에 맞출 수 있다.
DATE_SHAPES = (
    ("D Month YYYY", r"\d{1,2}\s+[A-Z][a-z]{2,8}\s+20\d{2}"),
    ("Month D, YYYY", r"[A-Z][a-z]{2,8}\s+\d{1,2},?\s+20\d{2}"),
    ("Month D-D", r"[A-Z][a-z]{2,8}\s+\d{1,2}\s*[-–]\s*\d{1,2}"),
    ("YYYY.MM.DD", r"20\d{2}[.\-/]\s?\d{1,2}[.\-/]\s?\d{1,2}"),
    ("YYYY년 M월 D일", r"20\d{2}년\s*\d{1,2}월\s*\d{1,2}일"),
    ("ISO", r"20\d{2}-\d{2}-\d{2}"),
)


def probe(name, html):
    """파서가 걸러졌을 때 받은 페이지가 어떻게 생겼는지 남긴다.

    HTTP 는 200 인데 0건이 나오는 것은 페이지 구조가 파서의 가정과 다르다는 뜻이다.
    그 자리에서 구조를 로그와 report 에 적어 두지 않으면, 세션에서 그 사이트에 붙지
    못하는 한(CONNECT 403) 무엇을 고쳐야 하는지 영영 알 수 없다.
    """
    text = strip_tags(html)
    title = re.search(r"(?is)<title[^>]*>(.*?)</title>", html)
    heads = [strip_tags(h)[:70] for h in
             re.findall(r"(?is)<h[1-4][^>]*>(.*?)</h[1-4]>", html)[:8]]
    info = {
        "title": strip_tags(title.group(1))[:120] if title else None,
        "bytes": len(html),
        "textChars": len(text),
        "headings": heads,
        "sample": text[:500],
        "shapes": {},
        "around": [],
    }
    print("  [probe] %s — %d바이트, 본문 %d자, title=%r"
          % (name, len(html), len(text), info["title"]))
    if heads:
        print("  [probe] 헤딩: " + " / ".join(heads[:5]))
    print("  [probe] 본문 앞부분: " + text[:260])

    for label, pat in DATE_SHAPES:
        hits = re.findall(pat, text)
        if hits:
            info["shapes"][label] = {"n": len(hits), "e.g.": hits[:4]}
            print("  [probe] 날짜꼴 %-16s %3d개 — %s" % (label, len(hits), hits[:4]))

    # 날짜가 있는 자리를 찾아 그 둘레만 떠 온다. 처음에는 그냥 '20xx' 가 처음 나오는
    # 곳을 떴는데, 그건 언제나 머리말·내비게이션이라 아무 쓸모가 없었다(첫 진단에서
    # 다섯 곳 모두 그랬다). 날짜 표기가 실제로 있는 자리를 찾아야 한다.
    anchor = None
    for _, pat in DATE_SHAPES:
        m = re.search(pat, html)
        if m and (anchor is None or m.start() < anchor):
            anchor = m.start()
    if anchor is None:                      # 날짜가 아예 없다 — 자바스크립트로 그리는 판
        m = re.search(r"통화정책|Meeting|meeting|Calendar|calendar", html)
        anchor = m.start() if m else 0
    for off in (0, 1500, 4000):
        lo, hi = max(0, anchor + off - 200), min(len(html), anchor + off + 700)
        if lo >= len(html):
            break
        chunk = re.sub(r"\s+", " ", html[lo:hi])
        info["around"].append(chunk)
        print("  [probe] 둘레(+%d): …%s…" % (off, chunk))

    # 본문 텍스트에서 날짜가 몰려 있는 대목. 파서를 어떤 꼴에 맞춰야 하는지가 여기 보인다.
    tpos = None
    for _, pat in DATE_SHAPES:
        m = re.search(pat, text)
        if m and (tpos is None or m.start() < tpos):
            tpos = m.start()
    if tpos is not None:
        info["textAroundDates"] = text[max(0, tpos - 200):tpos + 1800]
        print("  [probe] 날짜 둘레 본문: " + info["textAroundDates"][:900])
    return info


# ------------------------------------------------------------------ 파서들
#
# 클래스 이름과 태그 구조에 기대지 않는다. 첫 러너 실행에서 다섯 곳이 HTTP 200 을 받고도
# 0건을 뱉었는데, 그 까닭이 전부 구조 가정이었다 —
#   FOMC   <h4> 바로 뒤에 연도가 오리라 봤지만 태그가 하나 더 끼어 있었다
#   BOE·BOJ 날짜에 연도가 안 붙어 있다. 연도는 구획 헤딩('2026 confirmed dates'·'2026')에 있다
# 기관이 페이지를 다시 만들어도 '연도'라는 글자와 '월 일자' 표기는 남는다. 거기에 기댄다.


def year_sections(html, mark_pat):
    """연도 표시를 기준으로 원본 HTML 을 잘라 [(연도, 그 구획의 본문 텍스트)] 로 준다."""
    marks = [(m.start(), m.group(1)) for m in re.finditer(mark_pat, html)]
    out = []
    for i, (pos, year) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(html)
        out.append((year, strip_tags(html[pos:end])))
    return out


def span_dates(year, mon1, d1, mon2, d2):
    """'April/May 30-1' 처럼 달을 넘기는 회의를 제자리에 놓는다.

    끝일이 시작일보다 크면 같은 달 안의 이틀이고(April/May 28-29 → 4월 28~29),
    작으면 다음 달로 넘어간 것이다(April/May 30-1 → 4월 30 ~ 5월 1).
    """
    start = mk(year, mon1, d1)
    if int(d2) >= int(d1):
        return start, mk(year, mon1, d2)
    ey, em = int(year), (mon2 if mon2 and mon2 != mon1 else mon1 % 12 + 1)
    if em == 1 and mon1 == 12:
        ey += 1
    return start, mk(ey, em, d2)


def parse_fomc(html):
    """'2026 FOMC Meetings' 구획 안에서 'January 27-28' 꼴을 읽는다. SEP 회의엔 별표."""
    secs = year_sections(html, r"(20\d{2})\s+FOMC\s+Meetings")
    need(secs, "'YYYY FOMC Meetings' 표시를 못 찾았다")
    out, seen = [], set()
    for year, text in secs:
        for m in re.finditer(
                r"([A-Z][a-z]{2,8})(?:\s*/\s*([A-Z][a-z]{2,8}))?\s+"
                r"(\d{1,2})\s*-\s*(\d{1,2})\s*(\*?)", text):
            m1, m2, d1, d2, star = m.groups()
            mon1 = MONTHS.get(m1.lower())
            if not mon1:
                continue
            mon2 = MONTHS.get((m2 or "").lower())
            start, end = span_dates(year, mon1, d1, mon2, d2)
            if not (start and end) or start in seen:
                continue
            # 정례 FOMC 는 화요일에 시작하는 이틀 회의다. 이 규칙을 걸지 않았더니
            # 2027년 1월에 겹치는 회의가 둘(01-25~26 과 01-26~27) 들어왔다 —
            # 페이지의 다른 대목에서 온 '월 일자' 였다.
            if date.fromisoformat(start).weekday() != 1:
                continue
            seen.add(start)
            out.append({"start": start, "end": end, "sep": star == "*",
                        "presser": True, "confirmed": "official"})
    need(len(out) >= 8,
         "화요일에 시작하는 이틀 회의를 %d개만 읽었다 (8개 이상이어야 한다)" % len(out))
    return sorted(out, key=lambda x: x["start"])


def parse_ecb(html):
    """'Governing Council monetary policy meeting' 이 붙은 행의 날짜만 읽는다."""
    text = strip_tags(html)
    out = []
    # "29-30 April 2026 … monetary policy meeting" 또는 "10 June 2026 …"
    for m in re.finditer(
            r"(\d{1,2})(?:\s*-\s*(\d{1,2}))?\s+([A-Z][a-z]+)\s+(\d{4})"
            r"(?=[^0-9]{0,140}?monetary policy meeting)", text):
        d1, d2, mname, year = m.groups()
        mon = MONTHS.get(mname.lower())
        if not mon:
            continue
        start = mk(year, mon, d1)
        end = mk(year, mon, d2 or d1)
        if start and end:
            out.append({"start": start, "end": end, "sep": mon in (3, 6, 9, 12),
                        "presser": True, "confirmed": "official"})
    need(len(out) >= 6, "정책이사회 회의를 %d개만 읽었다" % len(out))
    return out


def parse_boe(html):
    """'2026 confirmed dates' 구획 안의 'Thursday 5 February' 꼴.

    이 페이지는 날짜에 연도를 붙이지 않는다 — 연도는 구획 헤딩에 있다. 그래서 연도가
    붙은 날짜만 찾던 첫 판은 0건이었다.
    """
    secs = year_sections(html, r"(20\d{2})\s+(?:confirmed|provisional|indicative|announcement)")
    need(secs, "'YYYY confirmed dates' 같은 연도 구획을 못 찾았다")
    # 전망보고서(MPR) 동반 여부를 '2·5·8·11월' 로 짐작했더니 2026년 4월 30일·7월 30일을
    # 놓쳤다. 영란은행은 해마다 그 달이 조금씩 옮겨간다. 짐작하지 않고 날짜 뒤에 그
    # 문구가 붙어 있는지를 본다. 문구가 페이지에 아예 없으면 아무 것도 주장하지 않는다.
    has_mpr_text = "Monetary Policy Report" in strip_tags(html)
    out, seen = [], set()
    for year, text in secs:
        hits = list(re.finditer(
            r"(?:Mon|Tues|Wednes|Thurs|Fri)day\s+(\d{1,2})\s+([A-Z][a-z]{2,8})"
            r"(?:\s+(20\d{2}))?", text))
        for i, m in enumerate(hits):
            day, mname, inline_year = m.groups()
            mon = MONTHS.get(mname.lower())
            iso = mk(inline_year or year, mon, day) if mon else None
            if not iso or iso in seen:
                continue
            seen.add(iso)
            # 이 날짜의 칸만 본다. 90자로 잘랐더니 다음 행의 문구까지 딸려 들어와
            # 3월·6월 회의에 전망보고서가 붙은 것처럼 읽혔다.
            stop = hits[i + 1].start() if i + 1 < len(hits) else len(text)
            near = text[m.end():min(stop, m.end() + 90)]
            mpr = ("Monetary Policy Report" in near) if has_mpr_text else None
            out.append({"start": iso, "end": iso, "sep": mpr, "presser": mpr,
                        "confirmed": "official"})
    need(len(out) >= 6, "MPC 발표일을 %d개만 읽었다" % len(out))
    return sorted(out, key=lambda x: x["start"])


def parse_boj(html):
    """연도 헤딩(<h2>2026</h2>) 아래의 'January 22 and 23' 꼴.

    이 페이지도 날짜에 연도를 붙이지 않아, 연도까지 요구하던 첫 판은 0건이었다.
    같은 페이지에 의사록·주요의견 공표일이 하루짜리 날짜로 함께 적혀 있는데,
    금융정책결정회의는 **언제나 이틀**이므로 이틀 연속만 받아 그 둘을 가른다.
    """
    secs = year_sections(html, r"<h[1-4][^>]*>\s*(20\d{2})\s*</h[1-4]>")
    if not secs:                          # 연도 헤딩을 못 찾으면 페이지 전체를 한 구획으로
        secs = [(None, strip_tags(html))]
    out, seen = [], set()
    for year, text in secs:
        for m in re.finditer(
                r"([A-Z][a-z]{2,8})\s+(\d{1,2})\s*(?:and|,|-|and\s+)\s*(\d{1,2})"
                r"(?:\s*,\s*(20\d{2}))?", text):
            mname, d1, d2, inline_year = m.groups()
            mon = MONTHS.get(mname.lower())
            yr = inline_year or year
            if not mon or not yr:
                continue
            start, end = mk(yr, mon, d1), mk(yr, mon, d2)
            if not (start and end) or start >= end:
                continue
            if (date.fromisoformat(end) - date.fromisoformat(start)).days != 1:
                continue                  # 이틀 연속이 아니면 회의 일정이 아니다
            if start in seen:
                continue
            seen.add(start)
            out.append({"start": start, "end": end, "sep": mon in (1, 4, 7, 10),
                        "presser": True, "confirmed": "official"})
    need(len(out) >= 6, "이틀짜리 금융정책결정회의를 %d개만 읽었다" % len(out))
    return sorted(out, key=lambda x: x["start"])


BOK_DATE = r"(20\d{2})[.\-년]\s*(\d{1,2})[.\-월]\s*(\d{1,2})"


def parse_bok(html):
    """한국은행 통화정책방향 결정회의 일정. '2026.10.22' · '2026년 10월 22일' 꼴.

    같은 행에 의사록 공개일이 함께 적혀 있다("… 2026.10.22 … 의사록 공개 2026.11.10").
    날짜만 그러모으면 그 공개일까지 회의로 들어온다. 그래서 '통화정책' 을 만난 지점부터
    다음 '통화정책' 까지를 한 행으로 보고, 그 안에서 '의사록' 뒤쪽을 잘라낸 다음 **첫
    날짜 하나만** 받는다.

    페이지가 날짜를 라벨 앞에 두는 판이라면 위 방식으로 아무것도 못 읽으므로, 그때는
    '날짜 바로 뒤에 통화정책이 오는' 꼴로 한 번 더 훑는다.
    """
    text = strip_tags(html)
    out, seen = [], set()

    def take(iso):
        if iso and iso not in seen:
            seen.add(iso)
            out.append({"start": iso, "end": iso, "sep": False, "presser": True,
                        "confirmed": "official"})

    for chunk in re.split(r"통화정책", text)[1:]:
        head = re.split(r"의사록|공개\s*예정|게시일", chunk)[0][:140]
        m = re.search(BOK_DATE, head)
        if m:
            take(mk(*m.groups()))

    if len(out) < 6:                       # 라벨이 날짜 뒤에 오는 판
        for m in re.finditer(BOK_DATE + r"(?=\s*통화정책)", text):
            take(mk(*m.groups()))

    out.sort(key=lambda x: x["start"])
    need(len(out) >= 6, "금통위 일정을 %d개만 읽었다" % len(out))
    return out


def parse_bls(html):
    """BLS 발표일정 표 — 'Friday, September 11, 2026' 과 참조 기간을 함께 읽는다."""
    text = strip_tags(html)
    out, seen = [], set()
    for m in re.finditer(
            r"(?:for|,)?\s*(?:Mon|Tues|Wednes|Thurs|Fri)day,\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})",
            text):
        mname, day, year = m.groups()
        mon = MONTHS.get(mname.lower())
        iso = mk(year, mon, day) if mon else None
        if iso and iso not in seen:
            seen.add(iso)
            out.append(iso)
    need(len(out) >= 6, "발표일을 %d개만 읽었다" % len(out))
    return sorted(out)


def fetch_treasury():
    """미국채 예정 입찰. 공개 JSON 이라 파서가 깨질 위험이 가장 낮은 경로다."""
    raw = http("https://www.treasurydirect.gov/TA_WS/securities/upcoming?format=json",
               accept="application/json")
    rows = json.loads(raw)
    need(isinstance(rows, list) and rows, "예정 입찰이 빈 목록이다")
    out = []
    for r in rows:
        d = (r.get("auctionDate") or "")[:10]
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", d):
            continue
        out.append({"date": d,
                    "term": (r.get("securityTerm") or "").strip(),
                    "type": (r.get("securityType") or "").strip(),
                    "cusip": r.get("cusip") or None})
    need(len(out) >= 3, "입찰을 %d건만 읽었다" % len(out))
    out.sort(key=lambda x: (x["date"], x["term"]))
    return out


def fetch_fred_dates(release_id, key):
    url = ("https://api.stlouisfed.org/fred/release/dates?release_id=%d&api_key=%s"
           "&file_type=json&include_release_dates_with_no_data=true&sort_order=asc"
           "&realtime_start=%s" % (release_id, key, date.today().isoformat()))
    j = json.loads(http(url, accept="application/json"))
    dates = [r["date"] for r in j.get("release_dates", []) if r.get("date")]
    need(dates, "release_id=%d 에 예정 발표일이 없다" % release_id)
    return sorted(dates)


# ------------------------------------------------------------------ 반영

def apply_bank(seed, key, meetings, rep, horizon_days=900):
    """받은 회의 일정을 해당 중앙은행에 반영한다. 과거·너무 먼 미래는 버린다."""
    bank = next((b for b in seed["banks"] if b["key"] == key), None)
    if bank is None:
        rep["note"] = "seed 에 %s 가 없다" % key
        return 0, []
    lo = (date.today() - timedelta(days=120)).isoformat()
    hi = (date.today() + timedelta(days=horizon_days)).isoformat()
    fresh = [m for m in meetings if lo <= m["start"] <= hi]
    need(len(fresh) >= 3, "조회 구간(%s~%s) 안의 회의가 %d개뿐이다" % (lo, hi, len(fresh)))

    # 연간 횟수로 한 번 더 거른다. 파서가 연도 구획 안의 '월 일자' 를 그러모으는 방식이라,
    # 페이지가 바뀌어 엉뚱한 표를 읽으면 날짜 형식은 멀쩡한데 개수가 먼저 어긋난다.
    per_year = bank.get("meetings_per_year")
    if per_year:
        years = {}
        for m in fresh:
            years[m["start"][:4]] = years.get(m["start"][:4], 0) + 1
        # 구간의 양 끝 해는 잘려 들어오므로, 온전히 담긴 해만 본다.
        full = [y for y in years if lo[:4] < y < hi[:4]]
        for y in full:
            need(per_year - 2 <= years[y] <= per_year + 3,
                 "%s년 회의가 %d개다 — 연 %d회 기관에서 나올 수 없는 수다(엉뚱한 표를 읽었을 것)"
                 % (y, years[y], per_year))

    old = {m["end"]: m for m in bank.get("meetings", [])}
    new = {m["end"]: m for m in fresh}
    diffs = []
    for d in sorted(set(old) - set(new)):
        if d >= date.today().isoformat():
            diffs.append("seed 에만 있던 %s (공식 페이지에 없다 — 바뀌었는지 확인)" % d)
    for d in sorted(set(new) - set(old)):
        diffs.append("새로 확인한 %s" % d)
    for d in sorted(set(new) & set(old)):
        if old[d].get("start") != new[d].get("start"):
            diffs.append("%s 회의 시작일 %s → %s" % (d, old[d].get("start"), new[d]["start"]))

    # 공식 페이지에서 확인한 것으로 갈아끼우고, 구간 밖의 seed 항목(먼 미래 잠정 일정)은 남긴다.
    keep = [m for m in bank.get("meetings", []) if not (lo <= m["start"] <= hi)]
    bank["meetings"] = sorted(keep + fresh, key=lambda m: m["start"])
    bank["fetched_at"] = date.today().isoformat()
    if key == "bok" and bank.get("gap_note_ko") and len(fresh) >= 8:
        bank.pop("gap_note_ko", None)
        bank.pop("gap_note_en", None)
        diffs.append("금통위 일정이 채워져 gap_note 를 지웠다")
    return len(fresh), diffs


def apply_indicator_dates(seed, ind_id, dates, rep, keep_months=14):
    """지표의 known_dates 를 공식 발표일로 갈아끼운다."""
    it = next((x for x in seed["indicators"] if x["id"] == ind_id), None)
    if it is None:
        rep["note"] = "seed 에 %s 가 없다" % ind_id
        return 0, []
    lo = (date.today() - timedelta(days=45)).isoformat()
    hi = (date.today() + timedelta(days=31 * keep_months)).isoformat()
    fresh = [d for d in dates if lo <= d <= hi]
    need(len(fresh) >= 3, "구간 안의 발표일이 %d개뿐이다" % len(fresh))

    old = {k["date"] for k in it.get("known_dates", [])}
    diffs = ["새로 확인한 %s" % d for d in sorted(set(fresh) - old)]
    diffs += ["seed 에만 있던 %s" % d for d in sorted(old - set(fresh)) if d >= date.today().isoformat()]
    it["known_dates"] = [{"date": d, "confirmed": "official"} for d in sorted(fresh)]
    it["fetched_at"] = date.today().isoformat()
    return len(fresh), diffs


def apply_auctions(seed, rows, rep):
    """미국채 입찰 — market-events.json 의 links 항목 아래 예정 목록으로 둔다.

    입찰은 종목마다 하루에 여러 건이라 events 로 펼치면 캘린더가 입찰로 덮인다. 그래서
    날짜별로 묶어 요약만 담는다.
    """
    link = next((l for l in seed["links"] if l["id"] == "us-treasury-auction"), None)
    need(link is not None, "seed 에 us-treasury-auction 이 없다")
    by_day = {}
    for r in rows:
        by_day.setdefault(r["date"], []).append(r["term"])
    link["upcoming"] = [{"date": d, "terms": sorted(set(t)), "n": len(t)}
                        for d, t in sorted(by_day.items())]
    link["fetched_at"] = date.today().isoformat()
    return len(by_day), ["예정 입찰일 %d일분" % len(by_day)]


# ------------------------------------------------------------------ main

# 경로마다 주소를 여러 개 둘 수 있다. 앞의 것부터 받아 파서를 태우고, 검사를 통과한
# 첫 응답을 쓴다. ECB·한국은행은 첫 주소가 자바스크립트로 그리는 판이라 본문에 날짜가
# 아예 없었다(첫 러너 실행에서 확인). 정적으로 내려오는 다른 주소를 뒤에 붙여 둔다.
SOURCES = [
    ("fomc", ["https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"]),
    ("ecb", ["https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html",
             "https://www.ecb.europa.eu/press/calendars/mgcgc/html/mgcgc_2026.en.html",
             "https://www.ecb.europa.eu/press/calendars/mgcgc/html/mgcgc_2027.en.html"]),
    ("boe", ["https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates"]),
    ("boj", ["https://www.boj.or.jp/en/mopo/mpmsche_minu/index.htm",
             "https://www.boj.or.jp/en/mopo/mpmsche_minu/index_2026.htm"]),
    ("bok", ["https://www.bok.or.kr/portal/singl/crncyPolicyDrcMtg/listYear.do?menuNo=200755&mtgSe=A",
             "https://www.bok.or.kr/portal/main/contents.do?menuNo=200755",
             "https://www.bok.or.kr/portal/bbs/B0000502/view.do?menuNo=201265&nttId=10094300"]),
    ("bls:us-cpi", ["https://www.bls.gov/schedule/news_release/cpi.htm"]),
    ("bls:us-empsit", ["https://www.bls.gov/schedule/news_release/empsit.htm"]),
    ("bls:us-ppi", ["https://www.bls.gov/schedule/news_release/ppi.htm"]),
    ("treasury", ["https://www.treasurydirect.gov/TA_WS/securities/upcoming?format=json"]),
]

# 러너에서 실제로 받아 본 결과, 아래 셋은 이 방식으로 받을 수 없다. 매주 90초를 들여
# 같은 사실을 다시 알아낼 이유가 없어 요청을 걸지 않는다. 기관이 페이지를 정적으로 바꾸면
# 다시 되니, `--try-blocked` 로 언제든 시험해 볼 수 있게 주소는 SOURCES 에 남겨 둔다.
BLOCKED = {
    "ecb": "정책이사회 일정표가 본문에 없다 — 자바스크립트로 그린다"
           " (2026-09-10 러너 확인: 본문 18,492자에 회의 날짜 0건)",
    "boj": "회의 일정표가 본문에 없다 — 자바스크립트로 그린다"
           " (2026-09-10 러너 확인: 연도 헤딩은 있으나 '월 일자' 표기 0건)",
    "bok": "일정이 보도자료의 첨부파일(hwp·pdf)에만 있다"
           " (2026-09-10 러너 확인: 본문은 '자세한 내용은 첨부파일을 참고' 뿐이고,"
           " 목록 페이지의 날짜는 의결사항·보도자료 등록일이라 회의일이 아니다)",
}

# BLS 는 러너 IP 에 403 을 준다(첫 러너 실행에서 세 경로 모두). 페이지를 아예 못 받으니
# 파서로는 풀리지 않는다. 같은 통계를 FRED 가 API 로 주므로, 무료 키를 넣으면 그 길로
# CPI·고용상황까지 채워진다.
FRED_RELEASES = {"us-cpi": 10, "us-empsit": 50, "us-pce": 54, "us-gdp": 53, "us-retail": 8}


def describe(e):
    if isinstance(e, Skip):
        return "믿을 수 없어 반영하지 않았다 — %s" % e
    return "받지 못했다 — %s: %s" % (type(e).__name__, e)


def main(argv=None):
    ap = argparse.ArgumentParser(description="증시 일정의 확정 날짜를 원문에서 받는다")
    ap.add_argument("--dry-run", action="store_true", help="받아서 견주기만 하고 파일은 안 고친다")
    ap.add_argument("--only", default="", help="쉼표로 구른 경로 이름만 받는다 (fomc,ecb,bls,…)")
    ap.add_argument("--no-build", action="store_true", help="latest.json 재빌드를 건너뛴다")
    ap.add_argument("--try-blocked", action="store_true",
                    help="받을 수 없다고 적어 둔 경로(ECB·BOJ·한국은행)도 다시 시험한다")
    args = ap.parse_args(argv)

    only = {x.strip() for x in args.only.split(",") if x.strip()}

    cb_path = os.path.join(SEED_DIR, "centralbanks.json")
    ind_path = os.path.join(SEED_DIR, "indicators.json")
    me_path = os.path.join(SEED_DIR, "market-events.json")
    cb = json.load(open(cb_path, encoding="utf-8"))
    ind = json.load(open(ind_path, encoding="utf-8"))
    me = json.load(open(me_path, encoding="utf-8"))

    report = {
        "ranAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "note": ("발표기관 원문에서 확정 날짜를 받아 seed 를 갱신한 결과. ok=false 인 경로는 "
                 "seed 를 손대지 않았다 — 검색으로 확인해 둔 날짜가 그대로 남아 있다."),
        "dryRun": bool(args.dry_run),
        "sources": {},
    }
    touched = {"cb": False, "ind": False, "me": False}

    for name, urls in SOURCES:
        short = name.split(":")[0]
        if only and short not in only and name not in only:
            continue
        rep = {"urls": urls, "ok": False}
        report["sources"][name] = rep

        if short in BLOCKED and not args.try_blocked:
            rep["blocked"] = True
            rep["why"] = "받을 수 없는 경로라 요청하지 않았다 — %s" % BLOCKED[short]
            rep["hint"] = "다시 시험하려면: python scripts/fetch_calendar.py --try-blocked --only " + short
            print("[block] %-15s %s" % (name, BLOCKED[short][:80]))
            continue

        if short == "treasury":
            try:
                rows = fetch_treasury()
                n, diffs = apply_auctions(me, rows, rep)
                touched["me"] = True
                rep.update({"ok": True, "url": urls[0], "count": n, "changes": diffs})
                print("[ok]   %-16s %d건 · %s" % (name, n, "; ".join(diffs)))
            except Exception as e:                            # noqa: BLE001
                rep["why"] = describe(e)
                print("[fail] %-16s %s" % (name, rep["why"]))
            continue

        # 주소를 앞에서부터 받아 본다. 받아서 파서까지 통과한 첫 응답만 반영한다.
        tried = []
        for url in urls:
            html = None
            try:
                html = http(url)
                if short == "bls":
                    dates = parse_bls(html)
                    n, diffs = apply_indicator_dates(ind, name.split(":", 1)[1], dates, rep)
                    touched["ind"] = True
                else:
                    parser = {"fomc": parse_fomc, "ecb": parse_ecb,
                              "boe": parse_boe, "boj": parse_boj, "bok": parse_bok}[short]
                    meetings = parser(html)
                    bank = {"fomc": "fed"}.get(short, short)
                    n, diffs = apply_bank(cb, bank, meetings, rep)
                    touched["cb"] = True
                rep.update({"ok": True, "url": url, "bytes": len(html),
                            "count": n, "changes": diffs})
                print("[ok]   %-16s %d건%s" % (name, n, (" · " + "; ".join(diffs)) if diffs else ""))
                break
            except Exception as e:                            # noqa: BLE001
                why = describe(e)
                entry = {"url": url, "why": why}
                # HTTP 는 됐는데 0건이면 페이지 구조가 파서의 가정과 다른 것이다.
                # 그 구조를 남겨 두지 않으면 무엇을 고쳐야 하는지 알 수 없다.
                if isinstance(e, Skip) and html is not None:
                    try:
                        entry["probe"] = probe(name, html)
                    except Exception as pe:                   # noqa: BLE001
                        entry["probeError"] = str(pe)
                tried.append(entry)
                print("[%s] %-16s %s" % ("skip" if isinstance(e, Skip) else "fail", name, why))
        if not rep["ok"]:
            rep["tried"] = tried
            rep["why"] = tried[-1]["why"] if tried else "받아 볼 주소가 없다"

    key = os.environ.get("FRED_API_KEY", "").strip()
    if key and (not only or "fred" in only):
        for ind_id, rid in FRED_RELEASES.items():
            nm = "fred:%s" % ind_id
            rep = {"release_id": rid, "ok": False}
            report["sources"][nm] = rep
            try:
                dates = fetch_fred_dates(rid, key)
                n, diffs = apply_indicator_dates(ind, ind_id, dates, rep)
                touched["ind"] = True
                rep.update({"ok": True, "count": n, "changes": diffs})
                print("[ok]   %-16s %d건" % (nm, n))
            except Skip as e:
                rep["why"] = "믿을 수 없어 반영하지 않았다 — %s" % e
                print("[skip] %-16s %s" % (nm, e))
            except Exception as e:                            # noqa: BLE001
                rep["why"] = "받지 못했다 — %s: %s" % (type(e).__name__, e)
                print("[fail] %-16s %s" % (nm, rep["why"]))
    elif not key:
        report["sources"]["fred"] = {"ok": False,
                                     "why": "FRED_API_KEY 가 없어 건너뛰었다 (무료 키로 켤 수 있다)"}
        print("[skip] fred             FRED_API_KEY 없음")

    ok = sum(1 for v in report["sources"].values() if v.get("ok"))
    report["summary"] = {"sources": len(report["sources"]), "ok": ok,
                         "failed": len(report["sources"]) - ok}

    if args.dry_run:
        print("\n--dry-run 이라 파일을 고치지 않는다")
    else:
        if touched["cb"]:
            write_json(cb_path, cb)
        if touched["ind"]:
            write_json(ind_path, ind)
        if touched["me"]:
            write_json(me_path, me)
        write_json(REPORT_PATH, report)

    print("\n경로 %d개 중 %d개 성공" % (report["summary"]["sources"], ok))
    for name, v in report["sources"].items():
        if not v.get("ok"):
            print("  실패/건너뜀 %s — %s" % (name, v.get("why")))

    if not args.dry_run and not args.no_build:
        print()
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import build_calendar
        build_calendar.main([])
    return 0


def write_json(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


if __name__ == "__main__":
    sys.exit(main())
