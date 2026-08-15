#!/usr/bin/env python3
"""증권사 리서치 리포트를 하루치 모아 요약해 data/reports/ 아래에 저장한다.

시세 수집기(fetch_market.py)와 같은 자리에서 도는 형제 스크립트다. 브리핑을
만드는 Claude 세션은 사내 이그레스 정책 때문에 네이버에 직접 붙지 못하므로,
GitHub Actions 러너가 대신 받아 저장소에 커밋하고 세션·화면은 커밋된 JSON을
읽는다.

**요약은 러너에서 규칙으로 만든다.** 러너에는 모델이 없으므로 문장을 새로
쓰지 않고, 리포트 본문에서 **원문 문장을 그대로 골라 낸다**(추출 요약).
지어낸 문장이 리포트 요약 자리에 앉는 것보다, 원문 두세 줄이 그대로 실리는
편이 안전하다. 브리핑 세션이 이 JSON을 읽어 사람 말로 다듬는 것은 그다음
일이다(docs/briefing-playbook.md 「증권사 리포트 요약」 항).

받는 것:
  종목분석 · 산업분석 · 시황정보 · 투자정보 · 경제분석 · 채권분석

내는 것:
  data/reports/YYYY-MM-DD.json   그날 판
  data/reports/latest.json       가장 최근 판 (화면이 읽는 파일)
  data/reports/index.json        날짜 목록 (화면의 지난 판 이동)

각 리포트에는 **세부 리포트로 가는 두 개의 길**을 같이 담는다 —
`url`(네이버 상세 페이지)과 `pdf`(증권사 원문 PDF). 화면에서 제목을 누르면
`url` 로, 「원문 PDF」를 누르면 `pdf` 로 간다.
"""

import json
import os
import re
import sys
import urllib.error
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fetch_market import _get, _slice_tag, _text            # noqa: E402

KST = timezone(timedelta(hours=9))
OUT_DIR = "data/reports"
RAW_DIR = "data/reports/raw"
BASE = "https://finance.naver.com/research/"

# 목록 여섯 판. 이름 / 목록 URL / 상세 URL 앞자리 / 몇 쪽까지 받을지.
# 종목분석은 하루에 백 건이 넘어 두 쪽을 받고, 나머지는 한 쪽이면 넉넉하다.
CATEGORIES = [
    ("종목분석", "company_list.naver", "company_read.naver", 3),
    ("산업분석", "industry_list.naver", "industry_read.naver", 2),
    ("시황정보", "market_info_list.naver", "market_info_read.naver", 1),
    ("투자정보", "invest_list.naver", "invest_read.naver", 1),
    ("경제분석", "economy_list.naver", "economy_read.naver", 1),
    ("채권분석", "debenture_list.naver", "debenture_read.naver", 1),
]

# 상세 본문을 몇 건까지 열어 볼지. 한 건에 1초 남짓 걸리므로 상한을 둔다.
# 나머지는 제목·증권사·목표주가만 담긴 채로 목록에 남는다(요약은 비어 있다).
DETAIL_LIMIT = int(os.environ.get("REPORTS_DETAIL_LIMIT", "60"))

_ROW = re.compile(r"(?is)<tr[^>]*>(.*?)</tr>")
_TD = re.compile(r"(?is)<t[dh][^>]*>(.*?)</t[dh]>")
_PDF = re.compile(r'(?i)href="([^"]+\.pdf)"')
_CODE = re.compile(r"[?&]code=(\d{6})")
_DATE = re.compile(r"\b(\d{2})\.(\d{2})\.(\d{2})\b")
_INT = re.compile(r"^[\d,]+$")

# 증권사 이름. 목록의 「증권사」 칸이 어느 열인지 판마다 달라, 이름으로 찾는다.
BROKER = re.compile(
    r"(미래에셋|삼성|한국투자|NH투자|KB|신한투자|하나|키움|메리츠|대신|유안타|"
    r"IBK투자|현대차|iM|LS|다올|한화투자|한화|교보|SK|유진투자|상상인|BNK|흥국|"
    r"부국|DS|LIG|카카오페이|토스|신영|이베스트|유안타|케이프|하이투자|대신)"
    r"(증권|투자증권)?")

# 본문에서 걷어낼 꼬리말. 리포트 끝에는 어디나 고지 문구가 붙는다.
_TAIL_CUT = re.compile(
    r"(본\s*조사분석자료는|본\s*자료는\s*투자|당사는\s*본|Compliance\s*Notice|"
    r"준법감시인|투자등급\s*및\s*적용|본 자료에 게재된 내용)")

# 요약에서 아예 뺄 줄 — 애널리스트 연락처, 등급표, 표 부스러기.
_DROP_LINE = re.compile(
    r"(연락처|02-\d{3,4}-\d{4}|@[a-z]+\.com|Tel\.|E-mail|"
    r"^\s*[\d,.\s%▲▼△▽\-+()]+\s*$|투자의견\s*비율|매수\s*중립\s*매도)")

# 요약 문장을 고르는 데 쓰는 저울. 리포트에서 사람이 먼저 읽는 것들이다.
WEIGHT = [
    (re.compile(r"목표주가|목표가|TP\b"), 3.0),
    (re.compile(r"투자의견"), 2.5),
    (re.compile(r"상향|하향|상승여력|저평가|고평가"), 2.0),
    (re.compile(r"영업이익|매출액|순이익|실적|어닝"), 1.8),
    (re.compile(r"전망|예상|추정|가이던스"), 1.2),
    (re.compile(r"수혜|모멘텀|주가|밸류에이션|멀티플"), 1.0),
    (re.compile(r"컨센서스|시장\s*기대"), 1.0),
    (re.compile(r"리스크|우려|부진|둔화"), 0.8),
]

OPINIONS = [
    ("매수", r"매수|BUY|Buy|적극매수|STRONG\s*BUY"),
    ("비중확대", r"비중\s*확대|Overweight|OVERWEIGHT"),
    ("중립", r"중립|HOLD|Hold|보유|Neutral|NEUTRAL|시장수익률\b|Marketperform"),
    ("비중축소", r"비중\s*축소|Underweight|UNDERWEIGHT"),
    ("매도", r"매도|SELL|Sell|시장수익률\s*하회|Underperform"),
]


# ---------------------------------------------------------------- 목록

def _list_url(path, page):
    return BASE + path + ("?page=%d" % page)


def _abs(href):
    if not href:
        return None
    href = href.replace("&amp;", "&").strip()
    if href.startswith("http"):
        return href
    if href.startswith("/"):
        return "https://finance.naver.com" + href
    return BASE + href


def _row_date(cells):
    """작성일 칸(26.08.14)을 ISO 로. 못 찾으면 None."""
    for c in cells:
        m = _DATE.search(c)
        if m:
            yy, mm, dd = (int(x) for x in m.groups())
            return "%04d-%02d-%02d" % (2000 + yy, mm, dd)
    return None


def _row_broker(cells):
    """증권사 칸. 열 위치가 판마다 달라 이름으로 찾는다."""
    for c in cells:
        c = c.strip()
        if not c or len(c) > 20 or _DATE.search(c):
            continue
        if BROKER.fullmatch(c) or (BROKER.match(c) and c.endswith("증권")):
            return c
    # 이름표에 없는 곳(새로 생긴 증권사 등)도 놓치지 않는다 — 「증권」으로 끝나는
    # 짧은 칸이면 그것이 증권사다.
    for c in cells:
        c = c.strip()
        if 2 < len(c) <= 12 and (c.endswith("증권") or c.endswith("투자증권")):
            return c
    return None


def parse_list(html, read_path):
    """목록 한 쪽에서 리포트 줄을 뽑는다.

    열 순서는 판마다 다르다(종목분석은 「종목명」이 앞에 하나 더 있다).
    그래서 열 번호로 집지 않고 **줄 안에서 생김새로 찾는다** — 상세 링크,
    PDF 링크, 여섯 자리 종목코드, 날짜꼴, 증권사 이름.
    """
    out = []
    read_link = re.compile(
        r'(?is)href="([^"]*%s[^"]*nid=(\d+)[^"]*)"[^>]*>(.*?)</a>' % re.escape(read_path))
    for row in _ROW.findall(html):
        m = read_link.search(row)
        if not m:
            continue
        href, nid, title = m.group(1), m.group(2), _text(m.group(3)).strip()
        if not title:
            continue
        cells = [_text(c).strip() for c in _TD.findall(row)]
        pdf = _PDF.search(row)
        code = _CODE.search(row)
        stock = None
        if code:
            # 종목 링크의 글자가 종목명이다.
            sm = re.search(r'(?is)href="[^"]*code=%s[^"]*"[^>]*>(.*?)</a>' % code.group(1), row)
            stock = {"code": code.group(1), "name": _text(sm.group(1)).strip() if sm else None}
        views = None
        for c in reversed(cells):
            if _INT.match(c) and "," in c or (_INT.match(c) and len(c) <= 7 and not _DATE.search(c)):
                try:
                    views = int(c.replace(",", ""))
                except ValueError:
                    views = None
                break
        out.append({
            "nid": nid, "title": title, "url": _abs(href),
            "stock": stock, "broker": _row_broker(cells),
            "date": _row_date(cells), "views": views,
            "pdf": _abs(pdf.group(1)) if pdf else None,
        })
    return out


def fetch_category(name, list_path, read_path, pages, dump_dir=None):
    rows, seen = [], set()
    for page in range(1, pages + 1):
        html = _get(_list_url(list_path, page), encoding="cp949",
                    referer="https://finance.naver.com/research/")
        got = parse_list(html, read_path)
        if not got:
            if dump_dir:
                _dump(dump_dir, "list_%s_p%d.html" % (list_path.split("_")[0], page), html)
            if page == 1:
                raise ValueError("%s 목록에서 리포트 줄을 못 찾았다 (%d bytes)" % (name, len(html)))
            break
        for r in got:
            if r["nid"] in seen:
                continue
            seen.add(r["nid"])
            r["category"] = name
            rows.append(r)
    return rows


# ---------------------------------------------------------------- 상세

_BODY_NEEDLES = ('class="view_cnt"', 'class="view_con"', 'id="contentarea_left"',
                 'class="box_type_m"')


def parse_detail(html):
    """상세 페이지에서 리포트 본문 글자를 뽑는다. (본문, 어디서 건졌는지)."""
    best, how = "", "none"
    for needle in _BODY_NEEDLES:
        frag = _slice_tag(html, needle)
        if not frag:
            continue
        body = _TAIL_CUT.split(_text(frag))[0].strip()
        if len(body) > len(best):
            best, how = body, needle.split('"')[-2] if '"' in needle else needle
        if len(best) >= 300:
            break
    return best, how


def fetch_detail(rep, dump_dir=None):
    """리포트 한 건의 본문을 받아 요약·목표주가·투자의견을 채운다."""
    html = _get(rep["url"], encoding="cp949", referer=BASE + "company_list.naver")
    body, how = parse_detail(html)
    if len(body) < 80:
        if dump_dir:
            _dump(dump_dir, "detail_%s.html" % rep["nid"], html)
        rep["extracted"] = how
        return rep
    if not rep.get("pdf"):
        m = _PDF.search(html)
        if m:
            rep["pdf"] = _abs(m.group(1))
    rep["extracted"] = how
    rep["body_chars"] = len(body)
    rep["summary"] = summarize(body)
    rep["excerpt"] = body[:1200]
    tp = target_price(body, rep["title"])
    if tp:
        rep["target_price"] = tp
    op = opinion(body, rep["title"])
    if op:
        rep["opinion"] = op
    move = re.search(r"목표주가[^.\n]{0,40}?(상향|하향|유지)", body)
    if move:
        rep["target_move"] = move.group(1)
    return rep


# ---------------------------------------------------------------- 요약

_SENT_SPLIT = re.compile(r"(?<=다\.)\s+|(?<=[.!?])\s+|\n+")


def _sentences(body):
    out = []
    for s in _SENT_SPLIT.split(body):
        s = re.sub(r"\s+", " ", s).strip(" ·-|")
        if not (20 <= len(s) <= 200):
            continue
        if _DROP_LINE.search(s):
            continue
        # 숫자·기호만 있는 표 부스러기를 걸러 낸다.
        if len(re.sub(r"[^가-힣A-Za-z]", "", s)) < 8:
            continue
        out.append(s)
    return out


def summarize(body, take=3):
    """본문에서 **원문 문장 세 줄**을 골라 원래 순서대로 잇는다.

    새 문장을 짓지 않는다. 목표주가·투자의견·실적처럼 사람이 먼저 보는 말이
    든 문장에 점수를 얹고, 리포트 첫머리에 가까울수록 조금 더 준다.
    """
    sents = _sentences(body)
    if not sents:
        return ""
    scored = []
    for i, s in enumerate(sents):
        sc = 1.0 / (1 + i * 0.12)                    # 앞자리 가산
        for pat, w in WEIGHT:
            if pat.search(s):
                sc += w
        if re.search(r"\d", s):
            sc += 0.4
        scored.append((sc, i, s))
    top = sorted(scored, reverse=True)[:take]
    return " ".join(s for _, _, s in sorted(top, key=lambda t: t[1]))


def target_price(body, title=""):
    """목표주가. 원 단위 정수로. 못 찾으면 None."""
    for text in (title, body[:1500], body):
        # 「목표주가를 95,000원으로」처럼 조사가 끼어들므로 사이를 열어 둔다.
        # 다만 열두 자로 막아 뒤 문장의 숫자를 끌어오지 않게 한다.
        m = re.search(r"목표\s*(?:주가|가)[^\d]{0,12}?([\d,]{3,12})\s*원", text)
        if not m:
            m = re.search(r"(?:TP|목표주가)\s*[:：]?\s*([\d,]{3,12})", text)
        if m:
            try:
                v = int(m.group(1).replace(",", ""))
            except ValueError:
                continue
            if 100 <= v <= 10_000_000:
                return v
    return None


def opinion(body, title=""):
    head = title + " " + body[:1200]
    m = re.search(r"투자의견[^가-힣A-Za-z]{0,10}([가-힣A-Za-z ]{2,12})", head)
    probe = m.group(1) if m else head
    for label, pat in OPINIONS:
        if re.search(pat, probe):
            return label
    if m:
        for label, pat in OPINIONS:
            if re.search(pat, head):
                return label
    return None


# ---------------------------------------------------------------- 하루치 판

def digest(reports, today):
    """그날 판의 머리 요약. 화면 맨 위와 브리핑이 그대로 쓴다."""
    todays = [r for r in reports if r.get("date") == today]
    base = todays or reports
    by_cat, by_broker, stocks = {}, {}, {}
    for r in base:
        by_cat[r["category"]] = by_cat.get(r["category"], 0) + 1
        if r.get("broker"):
            by_broker[r["broker"]] = by_broker.get(r["broker"], 0) + 1
        st = r.get("stock") or {}
        if st.get("code"):
            e = stocks.setdefault(st["code"], {"code": st["code"], "name": st.get("name"),
                                               "count": 0, "brokers": [], "targets": []})
            e["count"] += 1
            if r.get("broker") and r["broker"] not in e["brokers"]:
                e["brokers"].append(r["broker"])
            if r.get("target_price"):
                e["targets"].append(r["target_price"])
    for e in stocks.values():
        if e["targets"]:
            e["target_avg"] = int(sum(e["targets"]) / len(e["targets"]))
            e["target_min"], e["target_max"] = min(e["targets"]), max(e["targets"])
        e.pop("targets", None)

    # 여러 증권사가 같은 날 같은 종목을 함께 다뤘다면 그날의 이야깃거리다.
    crowd = sorted((e for e in stocks.values() if e["count"] >= 2),
                   key=lambda e: -e["count"])[:12]
    moves = [{"title": r["title"], "broker": r.get("broker"), "url": r["url"],
              "stock": (r.get("stock") or {}).get("name"),
              "target_price": r.get("target_price"), "move": r["target_move"]}
             for r in base if r.get("target_move")][:20]
    return {
        "date": today,
        "count_today": len(todays),
        "count_collected": len(reports),
        "by_category": by_cat,
        "by_broker": sorted(({"broker": b, "count": c} for b, c in by_broker.items()),
                            key=lambda e: -e["count"])[:20],
        "crowded_stocks": crowd,
        "target_moves": moves,
    }


def pick_highlights(reports, today, n=12):
    """「주요」 리포트를 고른다.

    조회수만으로 고르면 종목분석만 남는다. 판을 섞어 담고, 목표주가를
    건드린 리포트와 여러 증권사가 함께 본 종목을 앞으로 당긴다.
    """
    counts = {}
    for r in reports:
        st = (r.get("stock") or {}).get("code")
        if st:
            counts[st] = counts.get(st, 0) + 1
    scored = []
    for r in reports:
        sc = 0.0
        if r.get("date") == today:
            sc += 3.0
        sc += min((r.get("views") or 0) / 400.0, 4.0)
        if r.get("target_move"):
            sc += 2.5
        if r.get("target_price"):
            sc += 1.0
        if r.get("summary"):
            sc += 1.5
        sc += min(counts.get((r.get("stock") or {}).get("code"), 0) * 0.6, 2.4)
        scored.append((sc, r))
    scored.sort(key=lambda t: -t[0])
    out, seen_cat = [], {}
    for sc, r in scored:
        c = r["category"]
        # 한 판이 넷을 넘게 차지하지 않도록 막는다.
        if seen_cat.get(c, 0) >= 4:
            continue
        seen_cat[c] = seen_cat.get(c, 0) + 1
        out.append(r["nid"])
        if len(out) >= n:
            break
    return out


# ---------------------------------------------------------------- 저장

def _dump(dump_dir, name, text):
    try:
        os.makedirs(dump_dir, exist_ok=True)
        with open(os.path.join(dump_dir, name), "w", encoding="utf-8") as f:
            f.write(text[:400_000])
    except OSError:
        pass


def write_index(out_dir):
    """지난 판 목록. 화면의 날짜 이동에 쓴다."""
    days = sorted((f[:-5] for f in os.listdir(out_dir)
                   if re.fullmatch(r"\d{4}-\d{2}-\d{2}\.json", f)), reverse=True)
    with open(os.path.join(out_dir, "index.json"), "w", encoding="utf-8") as f:
        json.dump({"days": days[:180]}, f, ensure_ascii=False, indent=1)
    return days


def main():
    now = datetime.now(KST)
    today = now.strftime("%Y-%m-%d")
    os.makedirs(OUT_DIR, exist_ok=True)

    out = {
        "date": today,
        "generated_at_kst": now.strftime("%Y-%m-%d %H:%M:%S"),
        "source": "네이버 금융 리서치 (finance.naver.com/research)",
        "sources": {},
        "reports": [],
    }

    reports = []
    for name, list_path, read_path, pages in CATEGORIES:
        try:
            got = fetch_category(name, list_path, read_path, pages, dump_dir=RAW_DIR)
            reports.extend(got)
            out["sources"]["naver:" + list_path] = {"ok": True, "count": len(got)}
        except urllib.error.HTTPError as e:
            out["sources"]["naver:" + list_path] = {"ok": False, "error": "HTTP %s" % e.code}
        except Exception as e:                                   # noqa: BLE001
            out["sources"]["naver:" + list_path] = {
                "ok": False, "error": "%s: %s" % (type(e).__name__, e)}

    if not reports:
        raise SystemExit("리포트를 한 건도 받지 못했다 — 목록 구조가 바뀌었을 수 있다. "
                         "data/reports/raw 의 덤프를 보십시오.")

    # 오늘 것부터, 그다음 조회수 순으로 본문을 연다. 상한에 걸린 나머지는
    # 목록 정보(제목·증권사·PDF 링크)만 담긴 채로 남는다.
    order = sorted(reports, key=lambda r: (r.get("date") != today, -(r.get("views") or 0)))
    opened, failed = 0, 0
    for r in order:
        if opened >= DETAIL_LIMIT:
            break
        try:
            fetch_detail(r, dump_dir=RAW_DIR)
            opened += 1
        except Exception as e:                                   # noqa: BLE001
            r["detail_error"] = "%s: %s" % (type(e).__name__, e)
            failed += 1
            if failed >= 8:
                break

    # 본문 추출이 깨지면 조용히 망가진다 — 요약 자리가 빈 채로 화면이 뜬다.
    # 몇 건을 열어 몇 건에서 요약이 나왔는지 같이 남겨 눈으로 본다.
    summarized = sum(1 for r in reports if r.get("summary"))
    out["extraction"] = {"detail_opened": opened, "summarized": summarized,
                         "detail_failed": failed}
    if opened >= 5 and summarized < opened // 2:
        out["extraction"]["warning"] = ("본문에서 요약을 못 만든 건이 절반을 넘는다 "
                                        "— 상세 페이지 구조가 바뀐 듯하다")

    reports.sort(key=lambda r: (r.get("date") or "", r.get("views") or 0), reverse=True)
    out["reports"] = reports
    out["summary"] = digest(reports, today)
    out["highlights"] = pick_highlights(reports, today)

    day_path = os.path.join(OUT_DIR, today + ".json")
    for path in (day_path, os.path.join(OUT_DIR, "latest.json")):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
    write_index(OUT_DIR)

    s = out["summary"]
    print("리포트 %d건 (오늘 %d건) · 본문 %d건 요약 %d건"
          % (s["count_collected"], s["count_today"], opened, summarized))
    for k, v in sorted(out["sources"].items()):
        print("  %-34s %s" % (k, "%d건" % v["count"] if v["ok"] else "실패 " + v["error"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
