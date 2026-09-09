#!/usr/bin/env python3
"""증시 일정 캘린더의 데이터를 한 파일로 합친다 — `market-calendar.html` 이 읽는 판.

들어오는 것
  data/calendar/seed/centralbanks.json    중앙은행 정책결정일 (사람이 확인해 넣고 러너가 덮어씀)
  data/calendar/seed/indicators.json      경제지표 정의 + 확인된 발표일 + '통상 이 무렵' 규칙
  data/calendar/seed/conferences.json     제약·바이오 학회 · 산업 콘퍼런스
  data/calendar/seed/market-events.json   만기·지수변경·입찰 등 수급/제도
  data/market/holidays.json               6개 시장 휴장일   ← 이미 있는 파일을 그대로 쓴다
  data/kr100/latest.json                  국내 100대 기업 실적발표일 ← 이미 있는 스냅샷
  data/us100/latest.json                  미국 100대 기업 실적발표일 ← 이미 있는 스냅샷
  data/market/latest.json                 정책금리·연방기금선물 내재금리(FOMC 카드 맥락용)

나가는 것
  data/calendar/latest.json               합친 일정 + 미확인 목록 + 수집 상태

지키는 것
  - **날짜를 지어내지 않는다.** 규칙으로 만든 날짜는 confirmed="rule" 로 찍어 확정 일정과
    구분하고, 화면이 "추정" 배지를 붙인다. 확인 못 한 학회·제도 일정은 events 에 넣지 않고
    undated 로 내려보내 이름과 공식 링크만 보여준다.
  - 만기일이 휴장일과 겹치면 앞 영업일로 당긴다(국내·미국 파생 규칙). LPR 처럼 뒤로 미는
    것은 shift="next" 로 따로 적는다. 판단 근거는 holidays.json 하나뿐이다.
  - 시각은 현지 시각과 함께 **KST 로 환산해** 넣는다. 브라우저에 시간대 데이터를 두지 않기
    위함이다. 발표 시각이 공표돼 있지 않은 일정(BOJ·금통위)은 비워 둔다 — 추정하지 않는다.

쓰는 법
  python scripts/build_calendar.py
  python scripts/build_calendar.py --days 730      # 더 먼 미래까지
"""

import argparse
import calendar as _cal
import json
import os
import re
import sys
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED_DIR = os.path.join(ROOT, "data", "calendar", "seed")
OUT_PATH = os.path.join(ROOT, "data", "calendar", "latest.json")

KST = ZoneInfo("Asia/Seoul")

# 규칙으로 날짜를 만들 창. 확정 일정은 seed 에 있는 만큼 다 담고, 규칙 추정은 여기까지만
# 만든다 — 1년 뒤 CPI 발표일을 규칙으로 찍어 두는 것은 정보가 아니라 소음이다.
RULE_DAYS_AHEAD = 180
RULE_DAYS_AHEAD_WEEKLY = 60          # 주간 지표(실업수당청구)는 더 짧게

CATEGORIES = ("policy", "indicator", "earnings", "conference", "supply", "holiday", "other")


# ------------------------------------------------------------------ 유틸

def load_json(path, sources, key, required=False):
    """읽지 못해도 죽지 않는다 — 어느 입력이 빠졌는지 sources 에 남기고 넘어간다."""
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        sources[key] = {"ok": False, "why": "파일 없음"}
        if required:
            raise SystemExit("필수 입력이 없다: %s" % path)
        return None
    except Exception as e:                                   # noqa: BLE001
        sources[key] = {"ok": False, "why": "읽지 못함 — %s" % e}
        if required:
            raise SystemExit("필수 입력을 읽지 못했다: %s (%s)" % (path, e))
        return None
    # kr100/us100 은 코드 브랜치에 {"movedTo": …} 안내 파일만 있고 실물은 데이터 브랜치에 있다.
    if isinstance(data, dict) and data.get("movedTo"):
        sources[key] = {"ok": False, "why": "데이터 브랜치에 있음 (%s)" % data["movedTo"]}
        return None
    sources[key] = {"ok": True}
    return data


def d(s):
    return date.fromisoformat(s)


def to_kst(day, time_local, tz):
    """현지 날짜·시각을 KST 문자열로. 시각이 없으면 None — 자정으로 가정하지 않는다."""
    if not time_local or not tz:
        return None
    try:
        hh, mm = (int(x) for x in time_local.split(":")[:2])
        local = datetime.combine(day, time(hh, mm), tzinfo=ZoneInfo(tz))
    except Exception:                                        # noqa: BLE001
        return None
    return local.astimezone(KST).strftime("%Y-%m-%d %H:%M")


# ------------------------------------------------------- 휴장일과 영업일

def build_holiday_index(hol):
    """{시장키: {'YYYY-MM-DD': kind}}. kind='weekend' 는 원래 휴장이라 따로 셈하지 않는다."""
    idx = {}
    if not hol:
        return idx
    for m in hol.get("markets", []):
        idx[m["key"]] = {day["date"]: day.get("kind", "full") for day in m.get("days", [])}
    return idx


def is_closed(day, market, hidx):
    if day.weekday() >= 5:
        return True
    return hidx.get(market, {}).get(day.isoformat()) == "full"


def shift_business(day, market, hidx, direction="prev"):
    step = timedelta(days=-1 if direction == "prev" else 1)
    moved = day
    for _ in range(15):
        if not is_closed(moved, market, hidx):
            return moved
        moved += step
    return day


# --------------------------------------------------------- 규칙 → 날짜들

def month_range(start, end):
    y, m = start.year, start.month
    while (y, m) <= (end.year, end.month):
        yield y, m
        m += 1
        if m == 13:
            y, m = y + 1, 1


def nth_weekday(y, m, nth, weekday):
    first = date(y, m, 1)
    offset = (weekday - first.weekday()) % 7
    day = first + timedelta(days=offset + 7 * (nth - 1))
    return day if day.month == m else None


def nth_business_day(y, m, nth, market, hidx, from_end=False):
    days = [date(y, m, i) for i in range(1, _cal.monthrange(y, m)[1] + 1)]
    biz = [x for x in days if not is_closed(x, market, hidx)]
    if from_end:
        biz = list(reversed(biz))
    return biz[nth - 1] if len(biz) >= nth else None


def expand_rule(rule, start, end, market, hidx, months=None, shift="prev"):
    """규칙을 날짜 목록으로. months 가 있으면 그 달만 만든다."""
    kind = rule.get("kind")
    out = []

    if kind == "weekly":
        wd = rule.get("weekday", 3)
        day = start + timedelta(days=(wd - start.weekday()) % 7)
        while day <= end:
            out.append(day)
            day += timedelta(days=7)
        return out

    for y, m in month_range(start, end):
        if months and months != "all" and m not in months:
            continue
        day = None
        if kind == "nth-weekday":
            day = nth_weekday(y, m, rule.get("nth", 1), rule.get("weekday", 0))
        elif kind == "first-friday":
            day = nth_weekday(y, m, 1, 4)
        elif kind == "day-of-month":
            dom = rule.get("day", 1)
            dom = min(dom, _cal.monthrange(y, m)[1])
            day = date(y, m, dom)
            if rule.get("business_day"):
                day = shift_business(day, market, hidx, "next")
        elif kind == "month-end":
            day = date(y, m, _cal.monthrange(y, m)[1]) + timedelta(days=rule.get("offset", 0))
        elif kind == "nth-business-day":
            day = nth_business_day(y, m, rule.get("nth", 1), market, hidx)
        elif kind == "nth-last-business-day":
            day = nth_business_day(y, m, rule.get("nth", 1), market, hidx, from_end=True)
        else:
            continue                                          # quarterly 등은 규칙으로 안 만든다
        if day and start <= day <= end:
            out.append(day)
    if shift:
        out = [shift_business(x, market, hidx, shift) for x in out]
    return out


# ------------------------------------------------------------ 이벤트 조립

def ev(**kw):
    e = {
        "id": kw["id"], "date": kw["date"], "end_date": kw.get("end_date"),
        "country": kw.get("country", "global"), "category": kw["category"],
        "importance": kw.get("importance", 1),
        "title_ko": kw["title_ko"], "title_en": kw.get("title_en") or kw["title_ko"],
        "org": kw.get("org"), "org_en": kw.get("org_en"),
        "detail_ko": kw.get("detail_ko"), "detail_en": kw.get("detail_en"),
        "time_local": kw.get("time_local"), "tz": kw.get("tz"), "time_kst": kw.get("time_kst"),
        "url": kw.get("url"), "source": kw.get("source"),
        "confirmed": kw.get("confirmed", "rule"),
        "tags": kw.get("tags") or [],
    }
    return e


def add_central_banks(cb, events, start, end):
    if not cb:
        return
    fomc_meetings = []
    for bank in cb.get("banks", []):
        tz = bank.get("tz")
        t = bank.get("decision_time_local")
        for mt in bank.get("meetings", []):
            day = d(mt["end"])
            if not (start <= day <= end):
                continue
            multi = mt["start"] != mt["end"]
            bits = []
            if mt.get("presser"):
                bits.append("기자회견")
            if mt.get("sep"):
                bits.append("경제전망 동시 발표")
            if multi:
                bits.append("%s~%s 이틀 회의의 둘째 날" % (mt["start"][5:], mt["end"][5:]))
            if mt.get("note_ko"):
                bits.append(mt["note_ko"])
            bits_en = []
            if mt.get("presser"):
                bits_en.append("press conference")
            if mt.get("sep"):
                bits_en.append("projections released")
            events.append(ev(
                id="policy-%s-%s" % (bank["key"], mt["end"]),
                date=mt["end"], end_date=None,
                country=bank["country"], category="policy",
                importance=bank.get("importance", 2),
                title_ko="%s 정책금리 결정" % bank["name_ko"],
                title_en="%s rate decision" % bank["name_en"],
                org=bank["name_ko"], org_en=bank["name_en"],
                detail_ko=" · ".join(bits) or bank.get("time_note_ko"),
                detail_en=" · ".join(bits_en) or bank.get("time_note_en"),
                time_local=t, tz=tz, time_kst=to_kst(day, t, tz),
                url=bank.get("url"), source=bank.get("source"),
                confirmed=mt.get("confirmed", "websearch"),
                tags=["central-bank", bank["key"]] + (["sep"] if mt.get("sep") else []),
            ))
            if bank["key"] == "fed":
                fomc_meetings.append(mt)
    return fomc_meetings


def add_fed_derived(cb, fomc_meetings, events, start, end):
    """FOMC 의사록(3주 뒤)과 베이지북(2주 전 수요일). 회의 일정에서 계산한다."""
    if not cb or not fomc_meetings:
        return
    fed = next((b for b in cb.get("banks", []) if b["key"] == "fed"), None)
    if not fed:
        return
    tz, t = fed.get("tz"), "14:00"
    for mt in fomc_meetings:
        base = d(mt["end"])

        minutes = base + timedelta(weeks=3)
        if start <= minutes <= end:
            events.append(ev(
                id="indicator-fomc-minutes-%s" % minutes.isoformat(),
                date=minutes.isoformat(), country="us", category="indicator", importance=2,
                title_ko="FOMC 의사록 공개 (%s 회의)" % mt["end"][5:].replace("-", "/"),
                title_en="FOMC minutes (%s meeting)" % mt["end"],
                org="美 연방준비제도", org_en="Federal Reserve",
                detail_ko="회의 종료 3주 뒤 공개 — 성명서에 없던 위원 간 의견 분포가 드러난다",
                detail_en="Released three weeks after the meeting",
                time_local=t, tz=tz, time_kst=to_kst(minutes, t, tz),
                url=fed.get("url"), source=fed.get("source"),
                confirmed="rule", tags=["fed", "minutes"],
            ))

        # 베이지북 — 회의 2주 전 수요일
        target = base - timedelta(weeks=2)
        beige = target - timedelta(days=(target.weekday() - 2) % 7)
        if start <= beige <= end:
            events.append(ev(
                id="indicator-beige-book-%s" % beige.isoformat(),
                date=beige.isoformat(), country="us", category="indicator", importance=1,
                title_ko="연준 베이지북",
                title_en="Federal Reserve Beige Book",
                org="美 연방준비제도", org_en="Federal Reserve",
                detail_ko="%s FOMC 를 앞둔 지역 경기 서술" % mt["end"][5:].replace("-", "/"),
                detail_en="Regional economic conditions ahead of the %s FOMC" % mt["end"],
                time_local=t, tz=tz, time_kst=to_kst(beige, t, tz),
                url="https://www.federalreserve.gov/monetarypolicy/beige-book-default.htm",
                source="Federal Reserve", confirmed="rule", tags=["fed", "beige-book"],
            ))


def add_indicators(ind, events, start, end, hidx):
    if not ind:
        return
    for it in ind.get("indicators", []):
        tz, t = it.get("tz"), it.get("time_local")
        market = it["country"] if it["country"] in hidx else "us"

        seen = set()
        for kd in it.get("known_dates", []):
            day = d(kd["date"])
            seen.add(day)
            if not (start <= day <= end):
                continue
            events.append(ev(
                id="indicator-%s-%s" % (it["id"], kd["date"]),
                date=kd["date"], country=it["country"], category="indicator",
                importance=it.get("importance", 1),
                title_ko=it["name_ko"] + (" (%s)" % kd["ref_ko"] if kd.get("ref_ko") else ""),
                title_en=it["name_en"],
                org=it.get("org"), org_en=it.get("org_en"),
                detail_ko=it.get("why_ko"), detail_en=None,
                time_local=t, tz=tz, time_kst=to_kst(day, t, tz),
                url=it.get("calendar_url") or it.get("url"), source=it.get("org"),
                confirmed=kd.get("confirmed", "websearch"),
                tags=["indicator", it["id"]],
            ))

        rule = it.get("rule") or {}
        if rule.get("kind") in (None, "quarterly"):
            continue
        horizon = RULE_DAYS_AHEAD_WEEKLY if rule["kind"] == "weekly" else RULE_DAYS_AHEAD
        rule_end = min(end, date.today() + timedelta(days=horizon))
        for day in expand_rule(rule, start, rule_end, market, hidx, shift=None):
            if day in seen:
                continue
            events.append(ev(
                id="indicator-%s-%s" % (it["id"], day.isoformat()),
                date=day.isoformat(), country=it["country"], category="indicator",
                importance=it.get("importance", 1),
                title_ko=it["name_ko"], title_en=it["name_en"],
                org=it.get("org"), org_en=it.get("org_en"),
                detail_ko=it.get("rule_note_ko"), detail_en=None,
                time_local=t, tz=tz, time_kst=to_kst(day, t, tz),
                url=it.get("calendar_url") or it.get("url"), source=it.get("org"),
                confirmed="rule", tags=["indicator", it["id"]],
            ))


def add_conferences(cf, events, start, end):
    if not cf:
        return
    for c in cf.get("dated", []):
        day = d(c["start"])
        if not (start <= day <= end) and not (d(c["end"]) >= start and day <= end):
            continue
        events.append(ev(
            id=c["id"], date=c["start"], end_date=c["end"],
            country=c.get("country_code", "global"), category="conference",
            importance=c.get("importance", 1),
            title_ko=c["name_ko"], title_en=c["name_en"],
            org=c.get("abbr"), org_en=c.get("abbr"),
            detail_ko="%s · %s" % (c.get("field_ko", ""), c.get("city", "")),
            detail_en="%s · %s" % (c.get("field_en", ""), c.get("city_en", "")),
            url=c.get("url"), source=c.get("source"),
            confirmed=c.get("confirmed", "websearch"),
            tags=["conference", "bio", (c.get("abbr") or "").lower()],
        ))


def add_market_rules(me, events, start, end, hidx):
    if not me:
        return
    for r in me.get("rules", []):
        market = r["country"] if r["country"] in hidx else "us"
        months = r.get("months", "all")
        tz, t = r.get("tz"), r.get("time_local")
        shift = "next" if r["id"] == "pboc-lpr" else "prev"
        rule_end = min(end, date.today() + timedelta(days=RULE_DAYS_AHEAD))
        for day in expand_rule(r["rule"], start, rule_end, market, hidx, months, shift=shift):
            events.append(ev(
                id="%s-%s" % (r["id"], day.isoformat()),
                date=day.isoformat(), country=r["country"],
                category="policy" if r["id"] == "pboc-lpr" else "supply",
                importance=r.get("importance", 1),
                title_ko=r["name_ko"], title_en=r["name_en"],
                org=r.get("source"), org_en=None,
                detail_ko="%s · %s" % (r.get("rule_note_ko", ""), r.get("why_ko", "")),
                detail_en=None,
                time_local=t, tz=tz, time_kst=to_kst(day, t, tz),
                url=r.get("url"), source=r.get("source"),
                confirmed="rule", tags=["supply", r["id"]],
            ))

    for p in me.get("policy_events", []):
        if p.get("confirmed") != "rule":
            continue                                    # 잭슨홀처럼 날짜 없는 것은 undated 로


def add_holidays(hol, events, start, end):
    if not hol:
        return
    names = {m["key"]: m for m in hol.get("markets", [])}
    for key, m in names.items():
        for day in m.get("days", []):
            dt = d(day["date"])
            if not (start <= dt <= end):
                continue
            kinds = hol.get("kinds", {})
            events.append(ev(
                id="holiday-%s-%s" % (key, day["date"]),
                date=day["date"], country=key if key != "eu" else "eu",
                category="holiday",
                importance=2 if day.get("kind") == "full" else 1,
                title_ko="%s %s — %s" % (m["name_ko"], day["ko"], kinds.get(day.get("kind"), "휴장")),
                title_en="%s %s — %s" % (m["name_en"], day["en"], day.get("kind", "closed")),
                org=m["name_ko"], org_en=m["name_en"],
                detail_ko=None, detail_en=None,
                url=(hol.get("sources") or [None])[0], source="data/market/holidays.json",
                confirmed="official", tags=["holiday", key, day.get("kind", "full")],
            ))


def read_company_names(page_path, market, sources):
    """화면 파일(kr-top100.html · us-top100.html)의 COMPANIES 에서 종목명을 읽는다.

    실적발표일은 데이터 브랜치에 있어 이 빌더가 못 읽는 날이 많다. 그때 브라우저가 직접
    받아 그리는데, 종목명이 없으면 티커만 나온다. 그래서 이름 표는 스냅샷과 무관하게
    항상 latest.json 에 넣어 둔다.
    """
    names = {}
    try:
        src = open(page_path, encoding="utf-8").read()
        m = re.search(r"var COMPANIES = \[(.*?)\n\];", src, re.S)
        if not m:
            sources["names:" + market] = {"ok": False, "why": "COMPANIES 배열을 찾지 못했다"}
            return names
        for sym, en1, en2, ko, sector in re.findall(
                r"\[\s*'([^']+)'\s*,\s*(?:'([^']*)'|\"([^\"]*)\")\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*\]",
                m.group(1)):
            names[sym] = {"ko": ko or (en1 or en2), "en": en1 or en2,
                          "market": market, "sector": sector}
        sources["names:" + market] = {"ok": True, "count": len(names)}
    except Exception as e:                                   # noqa: BLE001
        sources["names:" + market] = {"ok": False, "why": str(e)}
    return names


def add_earnings(snap, names, market, events, start, end):
    """kr100/us100 스냅샷의 실적발표일."""
    if not snap:
        return 0
    tz = "Asia/Seoul" if market == "kr" else "America/New_York"
    added = 0
    for sym, payload in (snap.get("companies") or {}).items():
        cal = (payload or {}).get("calendar") or {}
        dates = [x for x in (cal.get("dates") or []) if x]
        if not dates:
            continue
        # 제공사가 날짜를 두 개 주면 '이 구간 중 하루'라는 뜻이다 — 확정이 아니므로 추정으로 둔다.
        estimate = bool(cal.get("estimate")) or len(dates) > 1
        try:
            day = datetime.fromtimestamp(int(dates[0]), timezone.utc).date()
        except Exception:                                    # noqa: BLE001
            continue
        if not (start <= day <= end):
            continue
        nm = names.get(sym, {})
        label = nm.get("ko") or sym
        rng = ""
        if len(dates) > 1:
            try:
                last = datetime.fromtimestamp(int(dates[-1]), timezone.utc).date()
                if last != day:
                    rng = " (%s~%s 구간 추정)" % (day.isoformat()[5:], last.isoformat()[5:])
            except Exception:                                # noqa: BLE001
                pass
        ir = ((payload or {}).get("profile") or {}).get("irWebsite")
        events.append(ev(
            id="earnings-%s-%s" % (sym, day.isoformat()),
            date=day.isoformat(), country=market, category="earnings",
            importance=2 if market == "kr" else 1,
            title_ko="%s 실적발표%s" % (label, rng),
            title_en="%s earnings%s" % (nm.get("en") or sym, rng),
            org=sym, org_en=sym,
            detail_ko=("컨퍼런스콜 시각은 이 화면이 쓰는 소스에 없다 — 회사 IR 공지를 보십시오"
                       if ir else "회사 IR 공지가 원문이다"),
            detail_en=None,
            time_local=None, tz=tz, time_kst=None,
            url=ir or ("https://finance.yahoo.com/quote/%s" % sym),
            source="%s 스냅샷 (data/%s100/latest.json)" % (market.upper(), market),
            confirmed="estimate" if estimate else "official",
            tags=["earnings", market, sym],
        ))
        added += 1
    return added


def collect_undated(cf, me):
    """날짜를 확인하지 못한 것들 — events 에 넣지 않고 이름·링크만 보여준다."""
    out = []
    if cf:
        for c in cf.get("undated", []):
            out.append({"group": "bio", "abbr": c.get("abbr"), "name_ko": c["name_ko"],
                        "name_en": c.get("name_en"), "note_ko": "%s · %s" % (c.get("field_ko", ""), c.get("typical_ko", "")),
                        "url": c.get("url"), "importance": c.get("importance", 1)})
        for c in cf.get("industry", []):
            out.append({"group": "industry", "abbr": c.get("abbr"), "name_ko": c["name_ko"],
                        "name_en": c.get("name_en"), "note_ko": "%s · %s" % (c.get("field_ko", ""), c.get("typical_ko", "")),
                        "url": c.get("url"), "importance": c.get("importance", 1)})
    if me:
        for r in me.get("index_reviews", []):
            out.append({"group": "index", "abbr": None, "name_ko": r["name_ko"],
                        "name_en": r.get("name_en"), "note_ko": r.get("schedule_note_ko"),
                        "url": r.get("url"), "importance": r.get("importance", 1)})
        for l in me.get("links", []):
            out.append({"group": "link", "abbr": None, "name_ko": l["name_ko"], "name_en": None,
                        "note_ko": l.get("note_ko"), "url": l.get("url"),
                        "importance": l.get("importance", 1)})
        for p in me.get("policy_events", []):
            if p.get("confirmed") == "undated":
                out.append({"group": "policy", "abbr": None, "name_ko": p["name_ko"],
                            "name_en": p.get("name_en"), "note_ko": p.get("schedule_note_ko"),
                            "url": p.get("url"), "importance": p.get("importance", 1)})
    return out


# ---------------------------------------------------------------- main

def main(argv=None):
    ap = argparse.ArgumentParser(description="증시 일정 캘린더 데이터를 만든다")
    ap.add_argument("--days", type=int, default=500, help="앞으로 며칠까지 담을지 (기본 500)")
    ap.add_argument("--back", type=int, default=45, help="지난 며칠까지 담을지 (기본 45)")
    ap.add_argument("--out", default=OUT_PATH)
    args = ap.parse_args(argv)

    today = date.today()
    start, end = today - timedelta(days=args.back), today + timedelta(days=args.days)

    sources = {}
    cb = load_json(os.path.join(SEED_DIR, "centralbanks.json"), sources, "seed:centralbanks", True)
    ind = load_json(os.path.join(SEED_DIR, "indicators.json"), sources, "seed:indicators", True)
    cf = load_json(os.path.join(SEED_DIR, "conferences.json"), sources, "seed:conferences", True)
    me = load_json(os.path.join(SEED_DIR, "market-events.json"), sources, "seed:market-events", True)
    hol = load_json(os.path.join(ROOT, "data", "market", "holidays.json"), sources, "holidays")
    kr = load_json(os.path.join(ROOT, "data", "kr100", "latest.json"), sources, "kr100")
    us = load_json(os.path.join(ROOT, "data", "us100", "latest.json"), sources, "us100")
    mkt = load_json(os.path.join(ROOT, "data", "market", "latest.json"), sources, "market")

    hidx = build_holiday_index(hol)
    events = []

    fomc = add_central_banks(cb, events, start, end) or []
    add_fed_derived(cb, fomc, events, start, end)
    add_indicators(ind, events, start, end, hidx)
    add_conferences(cf, events, start, end)
    add_market_rules(me, events, start, end, hidx)
    add_holidays(hol, events, start, end)
    names = {}
    names.update(read_company_names(os.path.join(ROOT, "kr-top100.html"), "kr", sources))
    names.update(read_company_names(os.path.join(ROOT, "us-top100.html"), "us", sources))
    kr_n = add_earnings(kr, names, "kr", events, start, end)
    us_n = add_earnings(us, names, "us", events, start, end)

    # 같은 id 가 두 번 들어오면(seed 와 규칙이 겹칠 때) 확정 쪽을 남긴다.
    rank = {"official": 3, "websearch": 2, "tentative": 2, "estimate": 1, "rule": 0}
    best = {}
    for e in events:
        prev = best.get(e["id"])
        if prev is None or rank.get(e["confirmed"], 0) > rank.get(prev["confirmed"], 0):
            best[e["id"]] = e
    events = sorted(best.values(), key=lambda x: (x["date"], -x["importance"], x["title_ko"]))

    context = {}
    if mkt:
        context = {
            "policy_rate_us": mkt.get("policy_rate_us"),
            "fed_implied": mkt.get("fed_implied"),
            "rates_kr": mkt.get("rates_kr"),
            "asof_kst": mkt.get("generated_at_kst"),
        }

    counts = {}
    for c in CATEGORIES:
        counts[c] = sum(1 for e in events if e["category"] == c)
    counts["total"] = len(events)
    counts["confirmed"] = {k: sum(1 for e in events if e["confirmed"] == k)
                           for k in ("official", "websearch", "tentative", "estimate", "rule")}

    gaps = []
    for key, st in sources.items():
        if not st.get("ok"):
            gaps.append("%s — %s" % (key, st.get("why")))
    if cb:
        for bank in cb.get("banks", []):
            if bank.get("gap_note_ko"):
                gaps.append("%s: %s" % (bank["name_ko"], bank["gap_note_ko"]))
    if not kr_n:
        gaps.append("국내 실적발표일이 비었다 — data/kr100/latest.json 이 데이터 브랜치에 있는지 확인")
    if not us_n:
        gaps.append("미국 실적발표일이 비었다 — data/us100/latest.json 이 데이터 브랜치에 있는지 확인")

    out = {
        "builtAt": datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),
        "builtAtUtc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "window": {"from": start.isoformat(), "to": end.isoformat()},
        "note": ("증시 일정 캘린더. confirmed 는 official(공식 확인) · websearch(검색 교차 확인) · "
                 "tentative(기관이 잠정으로 공표) · estimate(제공사 추정 구간) · rule(규칙으로 만든 날짜) 다. "
                 "확정이 아닌 것은 화면에서 배지로 구분한다."),
        "confirmed_legend": {
            "official": "공식 일정에서 확인",
            "websearch": "검색으로 교차 확인 — 공식 페이지 재확인 전",
            "tentative": "기관이 스스로 '잠정'으로 공표",
            "estimate": "데이터 제공사의 추정 구간 (실적발표일)",
            "rule": "발표 주기 규칙으로 만든 날짜 — 확정 아님",
        },
        "counts": counts,
        "sources": sources,
        "gaps": gaps,
        "context": context,
        "holidays": (hol or {}).get("markets", []),
        "holiday_kinds": (hol or {}).get("kinds", {}),
        "company_names": names,
        "earnings_snapshot_bases": {
            "kr": ["https://raw.githubusercontent.com/hanaroline/work_1/kr100-data/data/kr100/",
                   "data/kr100/"],
            "us": ["https://raw.githubusercontent.com/hanaroline/work_1/us100-data/data/us100/",
                   "data/us100/"],
        },
        "indicators": [{k: v for k, v in i.items()
                        if k not in ("known_dates", "rule", "fred_release_id")}
                       for i in (ind or {}).get("indicators", [])],
        "banks": [{k: v for k, v in b.items() if k != "meetings"} for b in (cb or {}).get("banks", [])],
        "undated": collect_undated(cf, me),
        "events": events,
    }

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write("\n")

    print("일정 %d건 — %s" % (len(events), ", ".join(
        "%s %d" % (k, counts[k]) for k in CATEGORIES if counts[k])))
    print("확정도: " + ", ".join("%s %d" % (k, v) for k, v in counts["confirmed"].items() if v))
    if gaps:
        print("빈 곳 %d개:" % len(gaps))
        for g in gaps:
            print("  - " + g)
    return 0


if __name__ == "__main__":
    sys.exit(main())
