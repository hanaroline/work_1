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
  python3 scripts/probe_calendar_sources.py --dump data/calendar/probe-dump

--dump 이 왜 있나
  세션은 러너가 올린 artifact 를 내려받지 못한다(블롭 저장소로 넘어가는데 그리로는
  못 간다). 그래서 파서를 쓰려면 본문을 **가지에 적어** 보내야 한다. 원본 바이트 대신
  **풀어 놓은 글자**만 적는다 — 작고, 사람이 읽어 확인할 수 있고, 파서를 붙일 때
  "이 글자에서 이 날짜가 나온다"를 눈으로 맞춰 볼 수 있다. 짐작으로 파서를 쓰지 않기
  위한 장치다.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
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
        # [2차] 1차에서 200 이 뜬 보도자료가 딸고 있던 부속 PDF.
        # 제목이 'indicative operational calendars for 2027' 이었다 — 회의일이
        # 여기 들어 있는지 본문을 받아 눈으로 본다.
        "https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr260630_annex~d20c0ea013.en.pdf",
        # [3차] 2차에서 답이 나왔다 — 저 보도자료 **본문**에 「지급준비금 적립기간」
        # 표가 있고, 그 첫 칸이 'Relevant Governing Council meeting' 이다.
        # 곧 2027년 통화정책회의일 여덟 개가 거기 적혀 있다. 그런데 저 주소는
        # 해마다 바뀌는 해시가 붙어 손으로 넣어야 한다. 해마다 저절로 찾아낼
        # **고정 주소**가 있는지 본다.
        #   - reserve: 적립기간 달력 상설 페이지. 같은 표가 있을 것이다
        #   - index_include: 연도별 보도자료 목록의 서버가 그려 주는 조각.
        #     여기서 'operational calendars' 제목을 찾아 해시 주소를 얻는다
        "https://www.ecb.europa.eu/press/calendars/reserve/html/index.en.html",
        "https://www.ecb.europa.eu/press/pr/date/2026/html/index_include.en.html",
        "https://www.ecb.europa.eu/press/pr/date/2027/html/index_include.en.html",
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
        # [2차] 1차에서 목록 페이지가 뷰어로 감싸 내보내던 첨부 PDF 의 진짜 주소.
        # "일정은 첨부파일에만 있다"고 막아 두었던 바로 그 파일이다 — 받아지는지 본다.
        ("https://www.bok.or.kr/fileSrc/portal/f514048c945f4e19ba9688a0a3ecb105/2/"
         "700fe0a2c066401a81cde04c70a18336.pdf"),
        ("https://www.bok.or.kr/fileSrc/portal/f514048c945f4e19ba9688a0a3ecb105/4/"
         "ac49e187828c45369f9fda8f4276c744.pdf"),
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

# 한국은행은 첨부 PDF 를 pdf.js 뷰어로 감싸 내보낸다.
#   /static/jslibrary/pdfjs/viewer.html?file=%2FfileSrc%2F...%2F3f2a.pdf
# 뷰어 주소가 아니라 file= 안의 진짜 주소를 받아야 한다.
PDFJS_WRAP = re.compile(r"/pdfjs/viewer\.html\?file=(.+)$", re.I)


def unwrap(url):
    """pdf.js 뷰어 주소면 속의 진짜 파일 주소로 바꾼다. 아니면 그대로 둔다."""
    m = PDFJS_WRAP.search(url)
    if not m:
        return url
    inner = urllib.parse.unquote(m.group(1))
    if inner.startswith("http"):
        return inner
    return re.match(r"(https?://[^/]+)", url).group(1) + inner


def looks_textual(raw):
    """풀지 못한 스트림이 '글자 뭉치'인지 '이진 덩어리'인지 가른다.

    PDF 의 글자 스트림은 풀어 놓으면 `BT /F1 12 Tf (…) Tj ET` 같은 아스키다.
    그림·글꼴 스트림은 아무 바이트나 들어 있다. 앞 4KB 만 보고, 볼 수 있는
    아스키가 9할을 넘고 글자 연산자가 하나라도 보일 때만 받는다.
    """
    head = raw[:4096]
    if not head:
        return False
    ok = sum(1 for b in head if 32 <= b < 127 or b in (9, 10, 13))
    if ok / len(head) < 0.90:
        return False
    return bool(re.search(rb"\bT[Jjfdm]\b|\bBT\b", head))


def pdf_text(body):
    """PDF 에서 글자를 꺼낸다. 표준 라이브러리만 쓴다.

    앞서 BOJ 의 mref260731a.pdf 에서 0자가 나왔다. 글자를 `(…) Tj` 꼴로만 찾았기
    때문이다. 실제로는 `[(a) -2 (b)] TJ` 로 토막 내 쓰는 판이 더 흔하고, 압축하지
    않은 스트림도 있다. 둘 다 본다.
    """
    import zlib
    chunks = []
    for m in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", body, re.S):
        raw = m.group(1)
        try:
            chunks.append(zlib.decompress(raw))
        except Exception:                                      # noqa: BLE001
            # 압축하지 않은 스트림일 수 있다. 다만 그림·글꼴 스트림을 그대로
            # 넣으면 아래 정규식이 이진 쓰레기를 "글자"로 뱉는다 — 2차에서 한국은행
            # 첨부가 그렇게 나왔다. 날짜 정규식이 그 쓰레기를 물면 없는 날짜를
            # 지어내게 된다. 그래서 **글자처럼 생긴 것만** 받는다.
            if looks_textual(raw):
                chunks.append(raw)
    blob = b"\n".join(chunks)

    out = []
    # `(…) Tj` 와 `[(…) n (…)] TJ` 를 모두 받는다. TJ 는 조각을 이어 붙인다.
    for m in re.finditer(rb"\[(.*?)\]\s*TJ|\(((?:[^()\\]|\\.)*)\)\s*Tj", blob, re.S):
        if m.group(1) is not None:
            parts = re.findall(rb"\(((?:[^()\\]|\\.)*)\)", m.group(1))
            out.append(b"".join(parts))
        else:
            out.append(m.group(2))
    txt = b" ".join(out).decode("latin-1", "replace")
    # PDF 이스케이프를 푼다
    txt = (txt.replace("\\(", "(").replace("\\)", ")").replace("\\\\", "\\")
              .replace("\\n", " ").replace("\\r", " ").replace("\\t", " "))
    return len(chunks), re.sub(r"\s+", " ", txt).strip()


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
        nstreams, txt = pdf_text(body)
        out["pdfStreams"] = nstreams
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
    out["_text"] = body_text          # --dump 용. 보고서에는 넣지 않는다(크다)
    return out


def write_dump(dump_dir, source, url, hname, text, limit):
    """받은 글자를 사람이 읽을 수 있게 적어 둔다.

    파일 이름에 주소를 알아볼 만큼 남긴다. 머리글 종류도 넣는다 — 같은 주소가
    머리글에 따라 다른 것을 내주는 곳(bls.gov)이 있기 때문이다.
    """
    tail = re.sub(r"^https?://", "", url)
    tail = re.sub(r"[^A-Za-z0-9._-]+", "_", tail)[:90]
    path = os.path.join(dump_dir, "%s__%s__%s.txt" % (source, hname, tail))
    body = text[:limit]
    with open(path, "w", encoding="utf-8") as f:
        f.write("# 원천: %s\n# 주소: %s\n# 머리글: %s\n# 글자수: %d (적은 것 %d)\n\n"
                % (source, url, hname, len(text), len(body)))
        f.write(body)
        if len(text) > limit:
            f.write("\n\n[...%d자 더 있다 — --dump-max 를 올려라]\n" % (len(text) - limit))
    return path


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
    ap.add_argument("--dump", default="",
                    help="받은 본문의 글자를 이 디렉터리에 적는다 (파서를 쓸 때 쓴다)")
    ap.add_argument("--dump-max", type=int, default=120_000,
                    help="한 파일에 적을 글자 수 상한 (기본 12만자)")
    ap.add_argument("--timeout", type=int, default=25)
    args = ap.parse_args(argv)

    dump_dir = ""
    if args.dump:
        dump_dir = args.dump if os.path.isabs(args.dump) else os.path.join(ROOT, args.dump)
        os.makedirs(dump_dir, exist_ok=True)

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
        for raw_url in urls:
            url = unwrap(raw_url)
            for hname, hdrs in HEADERS.items():
                res = get(url, hdrs, args.timeout)
                row = look(url, res)
                row["url"] = url
                row["headers"] = hname
                text = row.pop("_text", "")
                if dump_dir and text and row.get("status") == 200:
                    write_dump(dump_dir, name, url, hname, text, args.dump_max)
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
