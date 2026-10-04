#!/usr/bin/env python3
"""막힌 원천의 우회로 후보를 러너에서 실측한다 (정찰 전용 — seed 를 손대지 않는다).

왜 따로 있나
  fetch_calendar.py 는 *받아서 반영하는* 일을 한다. 그래서 "어느 주소가 되는지"를
  알아보려면 그때마다 코드를 고쳐야 하고, 고친 코드는 되든 안 되든 seed 에 손댈 수
  있는 상태로 올라간다. 정찰은 정찰만 하는 것이 안전하다. 이 스크립트는 **읽기만**
  한다 — 어떤 파일도 고치지 않고, 결과만 적어 준다.

왜 러너에서만 뜻이 있나
  Claude 세션은 이그레스 정책으로 ecb.europa.eu·boj.or.jp·bok.or.kr·bls.gov·
  stlouisfed.org 에 아예 붙지 못한다(게이트웨이가 CONNECT 에 403, 2026-10-04 재확인:
  일곱 호스트 모두 curl 종료코드 000). 그러니 "이 주소면 될 것 같다"는 세션에서 확인할
  수 없다. 러너에서 돌려 실제 응답을 봐야 한다.

무엇을 보는가
  주소마다 (1) HTTP 상태와 content-type, (2) 본문 길이, (3) 날짜 표기가 몇 개나 잡히는지,
  (4) 자바스크립트로 그리는 판이면 그 페이지가 무엇을 더 받아 오는지(.json·.ics·.xml·.pdf
  링크)를 긁어 준다. (4)가 핵심이다 — JS 로 그리는 페이지는 거의 언제나 정적 데이터
  파일을 하나 받아 오고, 그 파일은 파서가 쓰기 훨씬 좋다.

  403 은 머리글(User-Agent 따위) 때문일 때가 있어 같은 주소를 머리글 두 벌로 시험한다.

쓰는 법
  python3 scripts/probe_calendar_sources.py                 # 전부
  python3 scripts/probe_calendar_sources.py --only ecb,bls
  python3 scripts/probe_calendar_sources.py --out data/calendar/probe-report.json
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 머리글 두 벌. 403 이 IP 때문인지 머리글 때문인지를 가른다.
HEADERS = {
    "plain": {
        "User-Agent": ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"),
        "Accept": "text/html,application/json",
        "Accept-Language": "en,ko;q=0.8",
    },
    "browser": {
        "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"),
        "Accept": ("text/html,application/xhtml+xml,application/xml;q=0.9,"
                   "image/avif,image/webp,*/*;q=0.8"),
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    },
}

DATE_SHAPES = (
    ("D Month YYYY", r"\d{1,2}\s+[A-Z][a-z]{2,8}\s+20\d{2}"),
    ("Month D, YYYY", r"[A-Z][a-z]{2,8}\s+\d{1,2},?\s+20\d{2}"),
    ("Month D-D", r"[A-Z][a-z]{2,8}\s+\d{1,2}\s*[-–]\s*\d{1,2}"),
    ("YYYY.MM.DD", r"20\d{2}[.\-/]\s?\d{1,2}[.\-/]\s?\d{1,2}"),
    ("YYYY년 M월 D일", r"20\d{2}년\s*\d{1,2}월\s*\d{1,2}일"),
    ("ISO", r"20\d{2}-\d{2}-\d{2}"),
    ("ICS DTSTART", r"DTSTART[^:]*:20\d{6}"),
)

# 정찰 대상. 주석은 "왜 이 주소를 넣었나"다 — 다음 사람이 지우거나 더할 때 쓴다.
CANDIDATES = {
    "ecb": [
        # 지금 쓰는 주소(자바스크립트로 그린다고 적어 둔 것) — 그대로 다시 확인한다
        "https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html",
        "https://www.ecb.europa.eu/press/calendars/mgcgc/html/mgcgc_2026.en.html",
        "https://www.ecb.europa.eu/press/calendars/mgcgc/html/mgcgc_2027.en.html",
        # 회의일을 알리는 보도자료는 정적 HTML 이다. 해마다 주소가 달라 목록부터 본다
        "https://www.ecb.europa.eu/press/pr/date/2026/html/index.en.html",
        "https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr260630~9f54a0a4fb.en.html",
        # 보도자료 RSS — 정적이고 가볍다
        "https://www.ecb.europa.eu/rss/press.html",
    ],
    "boj": [
        "https://www.boj.or.jp/en/mopo/mpmsche_minu/index.htm",
        # 'Scheduled Dates of MPMs' 참고자료 목록. 해마다 PDF 하나가 올라온다
        "https://www.boj.or.jp/en/mopo/mpmsche_minu/m_ref/index.htm",
        # 2027년 일정 PDF (2026-07-31 공표분)
        "https://www.boj.or.jp/en/mopo/mpmsche_minu/m_ref/mref260731a.pdf",
        "https://www.boj.or.jp/en/rss/whatsnew.xml",
    ],
    "bok": [
        "https://www.bok.or.kr/portal/singl/crncyPolicyDrcMtg/listYear.do?menuNo=200755&mtgSe=A",
        # 영문 포털에 같은 일정이 표로 있는지 본다
        "https://www.bok.or.kr/eng/main/contents.do?menuNo=400069",
        "https://www.bok.or.kr/eng/singl/crncyPolicyDrcMtg/listYear.do?menuNo=400069&mtgSe=A",
    ],
    "bls": [
        # 러너 IP 에 403 을 준 주소들 — 머리글을 바꾸면 달라지는지 본다
        "https://www.bls.gov/schedule/news_release/cpi.htm",
        "https://www.bls.gov/schedule/news_release/empsit.htm",
        # 해당 연도 전체 일정 한 장
        "https://www.bls.gov/schedule/news_release/2026_sched.htm",
        "https://www.bls.gov/schedule/news_release/2027_sched.htm",
        # BLS 가 내주는 달력 구독 파일. 있으면 파싱이 가장 쉽다
        "https://www.bls.gov/schedule/news_release/bls.ics",
        "https://www.bls.gov/schedule/schedule.ics",
        # 자료 API 는 다른 호스트다. 차단이 호스트 단위인지 가른다
        "https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0",
    ],
}

DATA_LINK = re.compile(
    r"""["'(]([^"'()\s]+\.(?:json|ics|xml|pdf|csv)(?:\?[^"'()\s]*)?)["')]""", re.I)


def strip_tags(html):
    html = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
    html = re.sub(r"(?s)<[^>]+>", " ", html)
    html = (html.replace("&nbsp;", " ").replace("&amp;", "&")
                .replace("&ndash;", "-").replace("&mdash;", "-"))
    return re.sub(r"\s+", " ", html).strip()


def get(url, headers, timeout=25):
    """받아 본다. 실패도 결과다 — 던지지 않고 적어 돌려준다."""
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read()
            return {"status": r.status, "ctype": r.headers.get("Content-Type", ""),
                    "bytes": len(raw), "body": raw}
    except urllib.error.HTTPError as e:
        raw = b""
        try:
            raw = e.read()
        except Exception:                                      # noqa: BLE001
            pass
        return {"status": e.code, "ctype": e.headers.get("Content-Type", "") if e.headers else "",
                "bytes": len(raw), "body": raw, "error": "HTTP %s %s" % (e.code, e.reason)}
    except Exception as e:                                     # noqa: BLE001
        return {"status": None, "ctype": "", "bytes": 0, "body": b"",
                "error": "%s: %s" % (type(e).__name__, e)}


def look(url, res):
    """받은 것이 쓸 만한지 본다 — 날짜가 몇 개 잡히고, 무엇을 더 받아 오는가."""
    body = res.pop("body", b"")
    out = dict(res)
    if not body:
        return out

    head = body[:4]
    if head == b"%PDF":
        out["kind"] = "pdf"
        # 표준 라이브러리만 쓴다. FlateDecode 스트림을 풀어 글자를 찾아본다.
        import zlib
        text = []
        for m in re.finditer(rb"stream\r?\n(.*?)endstream", body, re.S):
            try:
                text.append(zlib.decompress(m.group(1)))
            except Exception:                                  # noqa: BLE001
                continue
        blob = b"\n".join(text)
        # PDF 글자는 (…) Tj 꼴로 들어 있다
        words = re.findall(rb"\(((?:[^()\\]|\\.)*)\)\s*Tj", blob)
        txt = " ".join(w.decode("latin-1", "replace") for w in words)
        out["pdfStreams"] = len(text)
        out["textChars"] = len(txt)
        out["sample"] = txt[:400]
        body_text = txt
    else:
        raw = body.decode("utf-8", "replace")
        out["kind"] = ("ics" if raw.lstrip().startswith("BEGIN:VCALENDAR")
                       else "json" if raw.lstrip()[:1] in "[{"
                       else "xml" if raw.lstrip().startswith("<?xml") else "html")
        body_text = raw if out["kind"] in ("ics", "json") else strip_tags(raw)
        out["textChars"] = len(body_text)
        out["sample"] = body_text[:400]
        t = re.search(r"(?is)<title[^>]*>(.*?)</title>", raw)
        if t:
            out["title"] = strip_tags(t.group(1))[:120]
        # JS 로 그리는 판이면 여기에 진짜 데이터 주소가 들어 있다
        links = []
        for m in DATA_LINK.finditer(raw):
            u = m.group(1)
            if u.startswith("//"):
                u = "https:" + u
            elif u.startswith("/"):
                u = re.match(r"(https://[^/]+)", url).group(1) + u
            if u not in links:
                links.append(u)
        if links:
            out["dataLinks"] = links[:25]

    shapes = {}
    for label, pat in DATE_SHAPES:
        hits = re.findall(pat, body_text)
        if hits:
            shapes[label] = {"n": len(hits), "eg": [str(h)[:28] for h in hits[:4]]}
    out["shapes"] = shapes
    out["dateHits"] = sum(v["n"] for v in shapes.values())
    return out


def verdict(rows):
    """이 원천이 뚫렸는가. 날짜가 잡힌 주소가 하나라도 있으면 길이 있는 것이다."""
    best = max((r.get("dateHits", 0) for r in rows), default=0)
    if best >= 6:
        return "길이 있다 — 날짜가 잡히는 주소를 찾았다"
    if any(r.get("dataLinks") for r in rows):
        return "단서 있다 — 페이지가 받아 오는 데이터 파일을 더 따라가야 한다"
    got = [r.get("status") for r in rows if r.get("status")]
    if not got:
        # 한 번도 응답을 못 받았다. 사이트가 거부한 것과 다르다 — 여기서 돌린 곳이
        # 그 호스트에 아예 못 붙는 것일 수 있다(세션 컨테이너가 그렇다). 가려서 적는다.
        return "응답을 못 받았다 — 망에서 이 호스트에 붙지 못했을 수 있다 (러너에서 다시 보라)"
    if all(s in (401, 403, 429) for s in got):
        return "막혔다 — 사이트가 전부 거부(401/403/429)"
    return "아직 못 뚫었다"


def main(argv=None):
    ap = argparse.ArgumentParser(description="막힌 원천의 우회로 후보를 실측한다")
    ap.add_argument("--only", default="", help="쉼표로 구분한 원천 이름 (ecb,boj,bok,bls)")
    ap.add_argument("--out", default="", help="결과 JSON 을 적을 경로")
    ap.add_argument("--timeout", type=int, default=25)
    args = ap.parse_args(argv)

    only = {x.strip() for x in args.only.split(",") if x.strip()}
    report = {
        "ranAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "note": ("막힌 원천의 우회로 후보를 받아 본 결과. 정찰 전용이라 seed 는 손대지 "
                 "않는다. dateHits 가 크면 그 주소에 파서를 붙일 수 있다."),
        "sources": {},
    }

    for name, urls in CANDIDATES.items():
        if only and name not in only:
            continue
        print("\n=== %s ===" % name)
        rows = []
        for url in urls:
            for hname, hdrs in HEADERS.items():
                res = get(url, hdrs, args.timeout)
                row = look(url, res)
                row["url"] = url
                row["headers"] = hname
                rows.append(row)
                print("  %-7s %-5s %-9s %7s바이트 날짜 %3d개  %s"
                      % (hname, row.get("status"), row.get("kind", "-"),
                         row.get("bytes", 0), row.get("dateHits", 0), url))
                if row.get("error"):
                    print("          %s" % row["error"])
                if row.get("shapes"):
                    for label, v in row["shapes"].items():
                        print("          %-16s %3d개 — %s" % (label, v["n"], v["eg"]))
                if row.get("dataLinks"):
                    print("          받아 오는 파일: %s" % row["dataLinks"][:8])
                if row.get("sample"):
                    print("          맛보기: %s" % row["sample"][:200])
                # 200 을 평범한 머리글로 이미 받았으면 두 번째 머리글은 건너뛴다
                if row.get("status") == 200 and hname == "plain":
                    break
                time.sleep(1)
        report["sources"][name] = {"verdict": verdict(rows), "tried": rows}
        print("  -> %s" % report["sources"][name]["verdict"])

    print("\n=== 요약 ===")
    for name, s in report["sources"].items():
        print("  %-5s %s" % (name, s["verdict"]))

    if args.out:
        path = args.out if os.path.isabs(args.out) else os.path.join(ROOT, args.out)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=1, sort_keys=True)
            f.write("\n")
        print("\n적었다: %s" % path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
