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

받아오는 곳
  FOMC        federalreserve.gov/monetarypolicy/fomccalendars.htm        (HTML)
  ECB         ecb.europa.eu/press/calendars/mgcgc/html/index.en.html     (HTML)
  BOE         bankofengland.co.uk/monetary-policy/upcoming-mpc-dates     (HTML)
  BOJ         boj.or.jp/en/mopo/mpmsche_minu/index.htm                   (HTML)
  한국은행     bok.or.kr 통화정책방향 결정회의 일정                          (HTML)
  BLS         bls.gov/schedule/news_release/{cpi,empsit,ppi}.htm         (HTML)
  미국채 입찰   treasurydirect.gov/TA_WS/securities/upcoming               (JSON, 키 불필요)
  FRED        api.stlouisfed.org/fred/release/dates                      (JSON, FRED_API_KEY 있을 때만)

쓰는 법
  python scripts/fetch_calendar.py                # 전부 받아 seed 갱신 + latest.json 재빌드
  python scripts/fetch_calendar.py --dry-run      # 받아서 견주기만 하고 파일은 안 고친다
  python scripts/fetch_calendar.py --only fomc,bls
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

    # 원본 HTML 에서 날짜 둘레를 그대로 떠 온다 — 어떤 태그·클래스에 담겨 있는지가
    # 파서를 고칠 때 필요한 전부다.
    for m in list(re.finditer(r"20\d{2}", html))[:4]:
        lo, hi = max(0, m.start() - 160), min(len(html), m.end() + 160)
        chunk = re.sub(r"\s+", " ", html[lo:hi])
        info["around"].append(chunk)
        print("  [probe] 둘레: …%s…" % chunk)
    return info


# ------------------------------------------------------------------ 파서들
#
# 아래 파서는 **이 세션에서 실측하지 못했다**(대상 사이트가 전부 CONNECT 403).
# 첫 러너 실행이 곧 검증이며, 실패하면 report 에 남고 seed 는 손대지 않는다.

def parse_fomc(html):
    """연도 구획별로 '월 + 일자범위' 를 읽는다. SEP 회의는 별표(*)가 붙는다."""
    out = []
    # <h4>2026 FOMC Meetings</h4> … 다음 <h4> 까지가 그 연도 구획이다.
    chunks = re.split(r"(?i)<h4[^>]*>\s*(\d{4})\s+FOMC\s+Meetings", html)
    need(len(chunks) >= 3, "연도 구획(<h4>YYYY FOMC Meetings</h4>)을 못 찾았다")
    for i in range(1, len(chunks) - 1, 2):
        year, body = chunks[i], chunks[i + 1]
        months = re.findall(r'(?is)fomc-meeting__month[^>]*>(.*?)</div>', body)
        dates = re.findall(r'(?is)fomc-meeting__date[^>]*>(.*?)</div>', body)
        if not months or len(months) != len(dates):
            continue
        for mtxt, dtxt in zip(months, dates):
            mname = strip_tags(mtxt).strip().lower().rstrip("*").strip()
            mon = MONTHS.get(mname) or MONTHS.get(mname[:3])
            dtxt = strip_tags(dtxt)
            sep = "*" in dtxt
            nums = re.findall(r"\d+", dtxt)
            if not mon or not nums:
                continue
            start = mk(year, mon, nums[0])
            end = mk(year, mon, nums[-1]) if len(nums) > 1 else start
            if start and end:
                out.append({"start": start, "end": end, "sep": sep, "presser": True,
                            "confirmed": "official"})
    need(len(out) >= 8, "회의를 %d개만 읽었다 (8개 이상이어야 한다)" % len(out))
    return out


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
    """'Thursday 5 February 2026' 꼴의 발표일. MPR 동반 여부는 페이지에 적히지 않아 비워 둔다."""
    text = strip_tags(html)
    out = []
    for m in re.finditer(r"(?:Mon|Tues|Wednes|Thurs|Fri)day\s+(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})",
                         text):
        day, mname, year = m.groups()
        mon = MONTHS.get(mname.lower())
        iso = mk(year, mon, day) if mon else None
        if iso:
            out.append({"start": iso, "end": iso, "sep": mon in (2, 5, 8, 11),
                        "presser": mon in (2, 5, 8, 11), "confirmed": "official"})
    need(len(out) >= 6, "MPC 발표일을 %d개만 읽었다" % len(out))
    return out


def parse_boj(html):
    """'January 22 and 23, 2026' 꼴.

    같은 페이지에 의사록·주요의견 공표일도 하루짜리 날짜로 적혀 있다. 금융정책결정회의는
    **언제나 이틀**이므로 이틀 범위만 받아 그 둘을 가른다 — 하루짜리는 회의가 아니다.
    """
    text = strip_tags(html)
    out, seen = [], set()
    for m in re.finditer(
            r"([A-Z][a-z]+)\s+(\d{1,2})\s*(?:and|,|-)\s*(\d{1,2})\s*,\s*(\d{4})", text):
        mname, d1, d2, year = m.groups()
        mon = MONTHS.get(mname.lower())
        if not mon:
            continue
        start, end = mk(year, mon, d1), mk(year, mon, d2)
        if not (start and end) or start >= end or (date.fromisoformat(end) -
                                                   date.fromisoformat(start)).days != 1:
            continue                      # 이틀 연속이 아니면 회의 일정이 아니다
        if start in seen:
            continue
        seen.add(start)
        out.append({"start": start, "end": end, "sep": mon in (1, 4, 7, 10),
                    "presser": True, "confirmed": "official"})
    need(len(out) >= 6, "이틀짜리 금융정책결정회의를 %d개만 읽었다" % len(out))
    return out


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

SOURCES = [
    ("fomc", "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"),
    ("ecb", "https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html"),
    ("boe", "https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates"),
    ("boj", "https://www.boj.or.jp/en/mopo/mpmsche_minu/index.htm"),
    ("bok", "https://www.bok.or.kr/portal/singl/crncyPolicyDrcMtg/listYear.do?menuNo=200755&mtgSe=A"),
    ("bls:us-cpi", "https://www.bls.gov/schedule/news_release/cpi.htm"),
    ("bls:us-empsit", "https://www.bls.gov/schedule/news_release/empsit.htm"),
    ("bls:us-ppi", "https://www.bls.gov/schedule/news_release/ppi.htm"),
    ("treasury", "https://www.treasurydirect.gov/TA_WS/securities/upcoming?format=json"),
]
FRED_RELEASES = {"us-pce": 54, "us-gdp": 53, "us-retail": 8}


def main(argv=None):
    ap = argparse.ArgumentParser(description="증시 일정의 확정 날짜를 원문에서 받는다")
    ap.add_argument("--dry-run", action="store_true", help="받아서 견주기만 하고 파일은 안 고친다")
    ap.add_argument("--only", default="", help="쉼표로 구른 경로 이름만 받는다 (fomc,ecb,bls,…)")
    ap.add_argument("--no-build", action="store_true", help="latest.json 재빌드를 건너뛴다")
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

    for name, url in SOURCES:
        short = name.split(":")[0]
        if only and short not in only and name not in only:
            continue
        rep = {"url": url, "ok": False}
        report["sources"][name] = rep
        html = None
        try:
            if short == "treasury":
                rows = fetch_treasury()
                n, diffs = apply_auctions(me, rows, rep)
                touched["me"] = True
            else:
                html = http(url)
                rep["bytes"] = len(html)
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
            rep.update({"ok": True, "count": n, "changes": diffs})
            print("[ok]   %-16s %d건%s" % (name, n, (" · " + "; ".join(diffs)) if diffs else ""))
        except Skip as e:
            rep["why"] = "믿을 수 없어 반영하지 않았다 — %s" % e
            print("[skip] %-16s %s" % (name, e))
            # HTTP 는 됐는데 0건이면 페이지 구조가 파서의 가정과 다른 것이다. 그 구조를
            # 여기서 남겨 두지 않으면 무엇을 고쳐야 하는지 알 수 없다.
            if html is not None:
                try:
                    rep["probe"] = probe(name, html)
                except Exception as pe:                       # noqa: BLE001
                    rep["probeError"] = str(pe)
        except Exception as e:                                # noqa: BLE001
            rep["why"] = "받지 못했다 — %s: %s" % (type(e).__name__, e)
            print("[fail] %-16s %s" % (name, rep["why"]))

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
