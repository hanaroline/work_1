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

import html as html_mod
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

# 목록 여섯 판. 이름 / 목록 URL / 상세 URL 앞자리 / 몇 쪽까지 받을지 /
# 모바일 API 의 길 이름.
# 종목분석은 하루에 백 건이 넘어 세 쪽을 받고, 나머지는 한 쪽이면 넉넉하다.
CATEGORIES = [
    ("종목분석", "company_list.naver", "company_read.naver", 3, "company"),
    ("산업분석", "industry_list.naver", "industry_read.naver", 2, "industry"),
    # 시황정보의 API 길 이름은 marketInfo 가 아니라 market 이다(탐색으로 확인).
    ("시황정보", "market_info_list.naver", "market_info_read.naver", 1, "market"),
    ("투자정보", "invest_list.naver", "invest_read.naver", 1, "invest"),
    ("경제분석", "economy_list.naver", "economy_read.naver", 1, "economy"),
    ("채권분석", "debenture_list.naver", "debenture_read.naver", 1, "debenture"),
]

# 네이버 모바일은 같은 목록을 **JSON 으로** 준다. HTML 표를 긁는 것보다
# 훨씬 튼튼하고, 무엇보다 **제목이 잘리지 않는다**(목록 HTML 은 「…여전..」
# 처럼 잘라 준다). 다만 첨부 PDF 주소는 JSON 에 없어 HTML 목록에서 따로
# 가져와 nid 로 이어 붙인다.
NAVER_API = "https://m.stock.naver.com/api/research/%s?page=%d&pageSize=%d"

# 상세 본문을 몇 건까지 열어 볼지. 한 건에 1초 남짓 걸리므로 상한을 둔다.
# 나머지는 제목·증권사·목표주가만 담긴 채로 목록에 남는다(요약은 비어 있다).
#
# 한 건에 0.6초쯤 걸린다. 120건이면 수집 전체가 2분 안쪽이라 넉넉하다.
DETAIL_LIMIT = int(os.environ.get("REPORTS_DETAIL_LIMIT", "120"))

# 본문을 여는 차례에 판마다 몫을 준다. 조회수만으로 줄을 세우면 종목분석이
# 상한을 다 먹고 시황·투자·경제·채권 판은 한 건도 못 연다 — 실제로 그랬고,
# 「주요 리포트」에 요약 없는 카드가 여럿 올라왔다. 한 바퀴에 종목분석 넷,
# 산업분석 둘, 나머지 하나씩 연다.
#
# 종목분석에 몫을 크게 주는 까닭은 목표주가·투자의견이 거기서만 나오기
# 때문이다. 셋으로 줄였더니 목표주가가 열여섯 건에서 열 건으로 떨어졌다.
DETAIL_SHARE = {"종목분석": 4, "산업분석": 2}

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

# 「투자의견」 바로 옆에서 쓰는 말들. 「보유」는 넣지 않는다 — 등급으로 쓰는
# 일보다 「보유계약」·「대량보유」로 쓰는 일이 훨씬 많다.
OPINIONS = [
    ("매도", r"매도|SELL|Sell|시장수익률\s*하회|Underperform"),   # 「하회」를 먼저 본다
    ("매수", r"매수|BUY|Buy|적극매수|STRONG\s*BUY"),
    ("비중확대", r"비중\s*확대|Overweight|OVERWEIGHT"),
    ("비중축소", r"비중\s*축소|Underweight|UNDERWEIGHT"),
    ("중립", r"중립|HOLD|Hold|Neutral|NEUTRAL|시장수익률|Marketperform"),
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
    """증권사 칸. 열 위치가 판마다 달라(종목분석에만 「종목명」이 앞에 있다)
    **작성일 칸을 먼저 찾고 그 앞의 빈칸 아닌 칸**을 집는다.

    열 순서는 어느 판이나 … 증권사 · 첨부 · 작성일 · 조회수 이고, 첨부 칸은
    글자가 없다. 그래서 날짜 바로 앞의 글자 있는 칸이 곧 증권사다. 이름표로만
    찾으면 「한국IR협의회」처럼 증권사가 아닌 발간처를 통째로 놓친다 —
    실제로 다섯 건이 비어 있었다.
    """
    di = next((i for i, c in enumerate(cells) if _DATE.search(c)), None)
    if di is not None:
        for c in reversed(cells[:di]):
            c = c.strip()
            if c and len(c) <= 20 and not _INT.match(c):
                return c
    # 열 구성이 바뀌었을 때를 위한 대비 — 이름으로 찾는다.
    for c in cells:
        c = c.strip()
        if not c or len(c) > 20 or _DATE.search(c):
            continue
        if BROKER.fullmatch(c) or c.endswith("증권"):
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


def api_rows(name, api_path, read_path, pages, per_page=30):
    """모바일 JSON 목록. 실패하면 예외를 던져 HTML 목록으로 넘긴다."""
    rows, seen = [], set()
    for page in range(1, pages + 1):
        body = _get(NAVER_API % (api_path, page, per_page),
                    referer="https://m.stock.naver.com/")
        got = json.loads(body)
        if not isinstance(got, list) or not got:
            if page == 1:
                raise ValueError("%s API 가 빈 목록을 줬다" % name)
            break
        for it in got:
            nid = str(it.get("researchId") or "")
            if not nid or nid in seen:
                continue
            seen.add(nid)
            code = (it.get("itemCode") or "").strip()
            try:
                views = int(str(it.get("readCount") or "").replace(",", ""))
            except ValueError:
                views = None
            rows.append({
                "nid": nid, "category": name, "title": (it.get("title") or "").strip(),
                "url": BASE + read_path + "?nid=" + nid,
                "stock": {"code": code, "name": it.get("itemName")} if code else None,
                # 산업분석은 category 칸에 업종이 온다(「철강금속」). 판 이름과
                # 같으면 알맹이가 없는 것이니 버린다.
                "sector": it.get("category") if it.get("category") != name else None,
                "broker": (it.get("brokerName") or "").strip() or None,
                "date": (it.get("writeDate") or "").strip() or None,
                "views": views, "pdf": None, "mobile_url": it.get("endUrl"),
                "source": "네이버 리서치", "via": "api",
            })
    if not rows:
        raise ValueError("%s API 에서 한 줄도 못 얻었다" % name)
    return rows


def html_rows(name, list_path, read_path, pages, dump_dir=None):
    """예전 길 — 목록 HTML 표. API 가 막혔을 때 쓰고, 평소에는 첨부 PDF
    주소만 여기서 얻어 API 줄에 이어 붙인다."""
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
            r["source"] = "네이버 리서치"
            r["via"] = "html"
            rows.append(r)
    return rows


def fetch_category(name, list_path, read_path, pages, api_path, dump_dir=None):
    """한 판을 받는다. JSON 을 앞에 세우고 HTML 로 첨부를 채운다.

    돌려주는 것은 (줄 목록, 어떻게 받았는지) 이다.
    """
    how = "api"
    try:
        rows = api_rows(name, api_path, read_path, pages)
    except Exception as api_err:                                # noqa: BLE001
        # API 가 막히면 예전 길로 간다. 화면은 그대로 뜬다.
        rows = html_rows(name, list_path, read_path, pages, dump_dir)
        for r in rows:
            r["api_error"] = "%s: %s" % (type(api_err).__name__, api_err)
        return rows, "html(api 실패)"

    # 첨부 PDF 는 JSON 에 없다. HTML 목록에서 nid→pdf 만 얻어 이어 붙인다.
    try:
        pdfs = {r["nid"]: r["pdf"] for r in html_rows(name, list_path, read_path, pages)
                if r.get("pdf")}
        for r in rows:
            if pdfs.get(r["nid"]):
                r["pdf"] = pdfs[r["nid"]]
        how = "api+html첨부"
    except Exception:                                           # noqa: BLE001
        pass                                     # 첨부는 상세에서도 채워진다
    return rows, how


# ------------------------------------------------ 미래에셋증권 리서치 (하우스)

# 우리 하우스 리포트는 네이버를 거치지 않고 원천에서 받는다. 여기에만 있는 것:
#   · **애널리스트 실명** — 네이버 리서치에는 없다
#   · 하우스가 낸 원문 PDF 주소
#   · 제목에 박힌 종목코드와 투자의견 — 「SMIC (00981 HK/매수)」
#   · 해외 종목 커버리지 — 네이버 리서치 목록에는 없다
MIRAE_LIST = "https://securities.miraeasset.com/bbs/board/message/list.do?categoryId=%s"
# 쪽 넘김 인자 이름을 모른다. pageIndex 를 믿고 여섯 쪽을 부른 판에서 오히려
# 건수가 줄었다 — 인자가 먹히지 않으면 모든 쪽이 첫 쪽과 같아 헛돈다.
# 그래서 후보를 차례로 대 보고 **새 줄을 물어오는 것**을 골라 쓴다.
MIRAE_PAGE_PARAMS = ("pageIndex", "page", "currentPageNo", "startPage")
MIRAE_VIEW = ("https://securities.miraeasset.com/bbs/board/message/view.do"
              "?messageId=%s&categoryId=%s")
MIRAE_BOARDS = [("리서치 리포트", "1521", 6)]        # 한 쪽에 다섯 줄쯤 온다

_MIRAE_A = re.compile(
    r"""(?is)<a\s+href="javascript:view\('(\d+)','[^']*'\)"[^>]*>(.*?)</a>""")
_MIRAE_PDF = re.compile(r"""(?i)downConfirm\('([^']+\.pdf[^']*)'""")
# 「SMIC (00981 HK/매수)」 · 「삼성전자 (005930/매수)」 에서 종목·코드·의견을 뗀다
_MIRAE_HEAD = re.compile(r"^(.*?)\s*\(([0-9A-Z]{5,8})(?:\s+[A-Z]{2})?\s*/\s*([^)]+)\)\s*$")


def parse_mirae(html, board, category_id):
    rows = []
    for row in _ROW.findall(html):
        m = _MIRAE_A.search(row)
        if not m:
            continue
        mid, inner = m.group(1), m.group(2)
        # 제목 줄은 <b>종목 (코드/의견)</b><br/>리포트 제목 꼴이다.
        part = re.split(r"(?i)<br\s*/?>", inner, 1)
        head = _text(part[0]).strip()
        tail = _text(part[1]).strip() if len(part) > 1 else ""
        stock, opinion = None, None
        hm = _MIRAE_HEAD.match(head) if tail else None
        if hm:
            stock = {"code": hm.group(2), "name": hm.group(1).strip()}
            opinion = hm.group(3).strip()
            title = tail
        elif tail:
            # 종목물이 아니면 앞머리는 연재물 이름이다(「월스트리트파인더 Ep.202」).
            # 종목으로 앉히면 있지도 않은 종목이 생긴다.
            title = head + " — " + tail
        else:
            title = head
        cells = [_text(c).strip() for c in _TD.findall(row)]
        date = next((c for c in cells if re.fullmatch(r"\d{4}-\d{2}-\d{2}", c)), None)
        # 마지막 칸이 작성자다 — 애널리스트 실명.
        analyst = cells[-1] if cells and 1 <= len(cells[-1]) <= 12 else None
        pdf = _MIRAE_PDF.search(row)
        rows.append({
            "nid": "mirae-" + mid, "category": board, "title": title,
            "url": MIRAE_VIEW % (mid, category_id),
            "stock": stock, "broker": "미래에셋증권", "analyst": analyst,
            "opinion": opinion, "date": date, "views": None,
            "pdf": pdf.group(1) if pdf else None,
            "source": "미래에셋증권 리서치", "via": "html",
        })
    return rows


def _mirae_page(cid, board, param, page):
    url = MIRAE_LIST % cid
    if page > 1:
        url += "&%s=%d" % (param, page)
    html = _get(url, encoding="cp949", referer="https://securities.miraeasset.com/")
    return parse_mirae(html, board, cid), html


def fetch_mirae(dump_dir=None):
    """하우스 목록을 받는다. (줄 목록, 어떻게 받았는지) 를 돌려준다."""
    rows, seen, used, first_n = [], set(), None, 0

    def add(got):
        n = 0
        for r in got:
            if r["nid"] in seen:
                continue
            seen.add(r["nid"])
            rows.append(r)
            n += 1
        return n

    for board, cid, pages in MIRAE_BOARDS:
        first, html = _mirae_page(cid, board, "pageIndex", 1)
        if not first:
            if dump_dir:
                _dump(dump_dir, "mirae_%s_p1.html" % cid, html)
            raise ValueError("미래에셋 목록에서 줄을 못 찾았다 (%d bytes)" % len(html))
        first_n = max(first_n, len(first))
        add(first)

        # 두 쪽째를 후보 인자로 한 번씩 불러 본다. 새 줄이 오는 것이 진짜다.
        if used is None:
            for param in MIRAE_PAGE_PARAMS:
                try:
                    got, _ = _mirae_page(cid, board, param, 2)
                except Exception:                               # noqa: BLE001
                    continue
                if add(got):
                    used = param
                    break
            if used is None:
                continue                     # 쪽 넘김이 없는 게시판 — 첫 쪽만 쓴다
        for page in range(3, pages + 1):
            try:
                got, _ = _mirae_page(cid, board, used, page)
            except Exception:                                   # noqa: BLE001
                break
            if not add(got):
                break                        # 더 나올 것이 없다
    if not rows:
        raise ValueError("미래에셋 리서치에서 한 줄도 못 얻었다")
    return rows, {"page_param": used or "(쪽 넘김 없음)", "first_page_rows": first_n}


def _key(title):
    """같은 리포트인지 견주는 열쇠. 띄어쓰기·문장부호는 지운다."""
    return re.sub(r"[^0-9A-Za-z가-힣]", "", title or "").lower()


def merge_house(reports, house):
    """하우스 리포트를 네이버 줄에 포개고, 없는 것은 새로 세운다.

    같은 리포트가 두 곳에 다 있으면 **하나로 합친다** — 네이버 쪽에는 본문
    요약이, 하우스 쪽에는 애널리스트 실명과 원문 PDF가 있어 둘 다 아깝다.
    """
    idx = {}
    for r in reports:
        if r.get("broker") == "미래에셋증권" and r.get("title"):
            idx.setdefault(_key(r["title"]), r)
    added, merged = 0, 0
    for h in house:
        mate = idx.get(_key(h["title"]))
        if mate:
            merged += 1
            if h.get("analyst"):
                mate["analyst"] = h["analyst"]
            if h.get("pdf"):
                mate["house_pdf"] = h["pdf"]
            mate["house_url"] = h["url"]
            if h.get("opinion") and not mate.get("opinion"):
                mate["opinion"] = h["opinion"]
            mate["source"] = "네이버 리서치 + 미래에셋증권"
        else:
            added += 1
            reports.append(h)
    return {"merged": merged, "added": added}


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


def full_title(html, short):
    """목록에 잘려 실린 제목(「…기대도 여전..」)을 상세 페이지에서 되찾는다.

    상세 페이지의 어느 태그에 제목이 들어 있는지는 네이버가 바꿀 수 있으므로
    자리를 외우지 않는다. **잘린 제목의 앞머리로 시작하는 가장 긴 글자**를
    페이지 안에서 찾는다. 못 찾으면 잘린 채로 둔다.
    """
    # 잘리기 전까지 보이는 대목은 진짜 제목의 앞부분 **그대로**다. 그것으로
    # 시작하고 그보다 긴 한 줄만 후보로 삼는다 — 열두 자만 맞춰 보면 엉뚱한
    # 줄이 걸린다.
    prefix = re.sub(r"[.…]{2,}\s*$", "", short).strip()
    if len(prefix) < 6:
        return short
    cands = []

    def keep(t):
        t = re.sub(r"\s+", " ", t).strip()
        # 브라우저 탭 제목에는 사이트 이름이 붙는다 — 「… : Npay 증권」.
        t = re.sub(r"\s*[:｜|]\s*(Npay|네이버(페이)?)\s*증권\s*$", "", t).strip()
        if t.startswith(prefix) and len(prefix) < len(t) < 200:
            cands.append(t)

    # 가장 확실한 길 — 쪽 안에서 그 대목이 나오는 자리를 찾아 **다음 태그가
    # 열릴 때까지** 이어 읽는다. 상세 쪽의 제목은 태그에 싸여 있지 않고
    # <span><em>종목명</em></span> 과 <p class="source"> 사이에 맨몸으로
    # 놓여 있어(러너가 남긴 덤프에서 확인) 태그를 훑는 것만으로는 못 집는다.
    for m in re.finditer(re.escape(prefix), html):
        keep(html_mod.unescape(html[m.start():].split("<", 1)[0]))
    # 태그마다 따로 훑는다. 한 번에 훑으면 바깥 <th> 가 안쪽 <strong> 을
    # 삼켜 버려(정규식은 앞 매치 뒤부터 이어 찾는다) 제목만 담은 태그를
    # 영영 못 본다 — 실제로 그랬다.
    for tag in ("strong", "h1", "h2", "h3", "h4", "title", "th", "td"):
        for m in re.finditer(r"(?is)<%s[^>]*>(.*?)</%s\s*>" % (tag, tag), html):
            # 제목은 한 줄이다. 제목만 담은 태그가 따로 없고 증권사·작성일까지
            # 한 상자에 들어 있을 수 있으므로 **첫 줄만** 본다. 처음엔 여러
            # 줄짜리 후보를 통째로 버렸는데, 그 바람에 스물세 건이 잘린 채로
            # 남았다. 여는 태그 앞에도 줄을 끊어야 제목과 출처가 갈린다 —
            # `_text` 는 닫는 태그에서만 줄을 바꾸기 때문이다.
            frag = re.sub(r"(?i)<(p|div|span|br|em|small|a)\b", r"\n<\1", m.group(1))
            keep(_text(frag).strip().split("\n")[0])
    if not cands:
        return short
    # 가장 짧은 것을 고른다 — 제목만 담은 가장 안쪽 자리다. **다만 그것도
    # 잘려 있으면 안 된다**: 상세 쪽의 <title> 은 목록보다 길게, 그러나 여전히
    # 잘린 채로 실린다. 짧은 것부터 고르다 보니 다섯 건이 「…읽을 수 ..」로
    # 남았다. 잘리지 않은 후보를 먼저 보고, 없을 때만 잘린 것을 쓴다.
    whole = [t for t in cands if not re.search(r"[.…]{2,}$", t.rstrip())]
    return min(whole or cands, key=len)


def fetch_detail(rep, dump_dir=None):
    """리포트 한 건의 본문을 받아 요약·목표주가·투자의견을 채운다."""
    html = _get(rep["url"], encoding="cp949", referer=BASE + "company_list.naver")
    if rep["title"].rstrip().endswith(".."):
        got = full_title(html, rep["title"])
        if got != rep["title"]:
            rep["title_full"] = True
        elif dump_dir:
            # 되찾지 못했으면 그 쪽을 남긴다 — 마크업을 보고 고칠 수 있게.
            _dump(dump_dir, "title_%s.html" % rep["nid"], html)
        rep["title"] = got
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
        s = re.sub(r"''+|``+", "'", s)               # ''매수'' 처럼 겹친 따옴표
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


# 「목표주가 280만원」을 280 으로 읽으면 안 된다 — 만·억을 같이 집는다.
# 조사가 끼어들므로(「목표주가를 95,000원으로」) 사이를 열어 두되, 열두 자로
# 막아 뒤 문장의 숫자를 끌어오지 않게 한다.
_TP_UNIT = re.compile(r"(?:목표\s*(?:주가|가)|TP)[^\d]{0,12}?([\d,]+(?:\.\d+)?)\s*(만|억)?\s*원")
_TP_COLON = re.compile(r"(?:목표\s*(?:주가|가)|TP)\s*[:：]\s*([\d,]+(?:\.\d+)?)(?![\d,]*\s*[만억])")
_UNIT = {"만": 10_000, "억": 100_000_000}


def target_price(body, title=""):
    """목표주가. 원 단위 정수로. 못 찾으면 None."""
    for text in (title, body[:1500], body):
        for pat in (_TP_UNIT, _TP_COLON):
            m = pat.search(text)
            if not m:
                continue
            try:
                v = float(m.group(1).replace(",", ""))
            except ValueError:
                continue
            unit = m.group(2) if m.re is _TP_UNIT else None
            v *= _UNIT.get(unit or "", 1)
            if 100 <= v <= 100_000_000:
                return int(round(v))
    return None


# 「보유」·「중립」·「비중 축소」는 본문 아무 데서나 주우면 안 된다 —
# 「보유계약 CSM」, 「대량보유 공시」, 「판매 비중 축소」가 죄다 투자의견으로
# 둔갑했다. 그래서 **「투자의견」 가까이에서만** 온갖 말을 인정하고, 본문
# 아무 데서나 줍는 것은 혼자 서도 뜻이 분명한 말로 한정한다.
#
# 「투자의견을 기존 Outperform에서 BUY로 상향한다」처럼 사이에 말이 끼므로
# 뒤로 서른 자까지 본다.
_OP_NEAR = re.compile(r"투자의견[^.\n]{0,30}")
# \b 를 쓰면 안 된다 — 파이썬의 \w 에는 한글이 들어가서 「BUY로」에 경계가
# 서지 않는다. 실제로 BUY 를 못 잡았다. 앞뒤로 라틴 글자만 막는다.
_LAT = r"(?<![A-Za-z])%s(?![A-Za-z])"
_OP_STANDALONE = [
    ("매수", _LAT % "BUY" + r"|" + _LAT % "Buy" + r"|매수\s*(?:의견|유지|추천)|의견\s*매수"),
    ("비중확대", _LAT % "(?:Overweight|OVERWEIGHT)"),
    ("비중축소", _LAT % "(?:Underweight|UNDERWEIGHT)"),
    ("매도", _LAT % "SELL" + r"|" + _LAT % "Sell" + r"|" + _LAT % "Underperform"
             + r"|시장수익률\s*하회"),
    ("중립", _LAT % "Marketperform"),
]


def opinion(body, title=""):
    # 「투자의견」이 붙은 자리는 본문 어디에 있든 믿을 수 있다. 창 안에 등급이
    # 둘 이상 보이면(「중립을 유지하나 매수 관점에서는…」) **먼저 나온 것**을
    # 취한다 — 목록 차례가 아니라 글의 차례가 곧 뜻이다.
    for m in _OP_NEAR.finditer(title + " " + body):
        win = m.group(0)[4:]
        hits = [(mm.start(), label) for label, pat in OPINIONS
                for mm in [re.search(pat, win)] if mm]
        if hits:
            return min(hits)[1]
    # 혼자 서는 말은 앞머리에서만 줍는다 — 뒤로 갈수록 남의 얘기가 섞인다.
    head = title + " " + body[:1200]
    for label, pat in _OP_STANDALONE:
        if re.search(pat, head):
            return label
    return None


# ---------------------------------------------------------------- 하루치 판

def latest_day(reports):
    """리포트가 실제로 올라온 가장 최근 날짜.

    **오늘 날짜로 세면 안 된다.** 휴장일·주말에는 그날 올라온 것이 하나도
    없어 「오늘 0건」이 된다. 실제로 8월 15일(광복절)에 그랬다. 사람이 알고
    싶은 것은 「가장 최근에 나온 리포트가 며칠 치이고 몇 건인가」이다.
    """
    days = [r.get("date") for r in reports if r.get("date")]
    return max(days) if days else None


def digest(reports, day):
    """그날 판의 머리 요약. 화면 맨 위와 브리핑이 그대로 쓴다."""
    todays = [r for r in reports if r.get("date") == day]
    base = todays or reports
    by_cat, by_broker, stocks, by_source = {}, {}, {}, {}
    for r in base:
        by_cat[r["category"]] = by_cat.get(r["category"], 0) + 1
        src = r.get("source") or "-"
        by_source[src] = by_source.get(src, 0) + 1
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
        "report_date": day,
        "count_report_date": len(todays),
        "count_collected": len(reports),
        "by_category": by_cat,
        "by_source": by_source,
        "by_broker": sorted(({"broker": b, "count": c} for b, c in by_broker.items()),
                            key=lambda e: -e["count"])[:20],
        "crowded_stocks": crowd,
        "target_moves": moves,
    }


def detail_order(reports, day):
    """본문을 열 차례. 판마다 몫을 주어 번갈아 연다(DETAIL_SHARE).

    판 안에서는 「가장 최근 날짜 → 조회수」 순이다.
    """
    groups = {}
    for r in reports:
        groups.setdefault(r["category"], []).append(r)
    for g in groups.values():
        g.sort(key=lambda r: (r.get("date") != day, -(r.get("views") or 0)))
    # 목록에 적힌 차례(CATEGORIES)를 지켜 돌아야 판마다 결과가 흔들리지 않는다.
    names = [c[0] for c in CATEGORIES if c[0] in groups]
    out, pos = [], {n: 0 for n in names}
    while len(out) < len(reports):
        moved = False
        for name in names:
            for _ in range(DETAIL_SHARE.get(name, 1)):
                i = pos[name]
                if i < len(groups[name]):
                    out.append(groups[name][i])
                    pos[name] = i + 1
                    moved = True
        if not moved:
            break
    return out


def pick_highlights(reports, day, n=12):
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
        if r.get("date") == day:
            sc += 3.0
        sc += min((r.get("views") or 0) / 400.0, 4.0)
        if r.get("target_move"):
            sc += 2.5
        if r.get("target_price"):
            sc += 1.0
        # 요약 없는 카드가 「주요」에 올라오면 화면이 빈 채로 뜬다. 본문을
        # 읽어 둔 것을 크게 앞세운다.
        if r.get("summary"):
            sc += 3.0
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
        "source": "네이버 금융 리서치 · 미래에셋증권 리서치",
        "sources": {},
        "reports": [],
    }

    reports = []
    for name, list_path, read_path, pages, api_path in CATEGORIES:
        key = "네이버 리서치:" + name
        try:
            got, how = fetch_category(name, list_path, read_path, pages,
                                      api_path, dump_dir=RAW_DIR)
            reports.extend(got)
            out["sources"][key] = {"ok": True, "count": len(got), "via": how}
        except urllib.error.HTTPError as e:
            out["sources"][key] = {"ok": False, "error": "HTTP %s" % e.code}
        except Exception as e:                                   # noqa: BLE001
            out["sources"][key] = {"ok": False, "error": "%s: %s" % (type(e).__name__, e)}

    # 하우스(미래에셋) 리포트는 원천에서 직접 받아 포갠다. 실명·원문 PDF가
    # 여기에만 있고, 네이버 목록에 없는 해외 종목도 여기서 들어온다.
    try:
        house, how = fetch_mirae(dump_dir=RAW_DIR)
        stat = merge_house(reports, house)
        rec = {"ok": True, "count": len(house), "via": "html",
               "merged_into_naver": stat["merged"], "new": stat["added"]}
        rec.update(how)
        out["sources"]["미래에셋증권 리서치"] = rec
    except urllib.error.HTTPError as e:
        out["sources"]["미래에셋증권 리서치"] = {"ok": False, "error": "HTTP %s" % e.code}
    except Exception as e:                                       # noqa: BLE001
        out["sources"]["미래에셋증권 리서치"] = {
            "ok": False, "error": "%s: %s" % (type(e).__name__, e)}

    if not reports:
        raise SystemExit("리포트를 한 건도 받지 못했다 — 목록 구조가 바뀌었을 수 있다. "
                         "data/reports/raw 의 덤프를 보십시오.")

    # 가장 최근 날짜 것부터, 그다음 조회수 순으로 본문을 연다. 상한에 걸린
    # 나머지는 목록 정보(제목·증권사·PDF 링크)만 담긴 채로 남는다.
    day = latest_day(reports) or today
    out["report_date"] = day
    order = detail_order(reports, day)
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
    opened_reps = [r for r in reports if r.get("extracted")]
    out["extraction"] = {
        "detail_opened": opened, "summarized": summarized, "detail_failed": failed,
        # 목록의 제목은 잘려 온다. 본문을 연 것 중 몇 건을 되찾았는지 센다.
        "titles_recovered": sum(1 for r in opened_reps if r.get("title_full")),
        "titles_truncated": sum(1 for r in opened_reps if r["title"].rstrip().endswith("..")),
    }
    if opened >= 5 and summarized < opened // 2:
        out["extraction"]["warning"] = ("본문에서 요약을 못 만든 건이 절반을 넘는다 "
                                        "— 상세 페이지 구조가 바뀐 듯하다")

    reports.sort(key=lambda r: (r.get("date") or "", r.get("views") or 0), reverse=True)
    out["reports"] = reports
    out["summary"] = digest(reports, day)
    out["highlights"] = pick_highlights(reports, day)

    day_path = os.path.join(OUT_DIR, today + ".json")
    for path in (day_path, os.path.join(OUT_DIR, "latest.json")):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
    write_index(OUT_DIR)

    s = out["summary"]
    print("리포트 %d건 (%s 자 %d건) · 본문 %d건 요약 %d건"
          % (s["count_collected"], s["report_date"], s["count_report_date"], opened, summarized))
    for k, v in sorted(out["sources"].items()):
        print("  %-24s %s" % (k, ("%d건 (%s)" % (v["count"], v.get("via", "-"))
                                  if v["ok"] else "실패 " + v["error"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
