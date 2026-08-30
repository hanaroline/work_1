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
import time
import urllib.error
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fetch_market import _get, _slice_tag, _text            # noqa: E402


def _get_retry(url, tries=3, **kw):
    """몇 번 더 두드린다.

    미래에셋 쪽은 이따금 TLS 를 끊는다 — 8/28 12:09 판에서 첫 쪽이
    UNEXPECTED_EOF 로 죽자 하우스 원천이 통째로 날아갔고, 그 바람에 글로벌
    판(해외 리포트의 유일한 길)까지 함께 잃었다. 한 번 실패로 원천을
    통째로 놓치지 않게 한다.
    """
    last = None
    for i in range(tries):
        try:
            return _get(url, **kw)
        except Exception as e:                                 # noqa: BLE001
            last = e
            if i + 1 < tries:
                time.sleep(1.5 * (i + 1))
    raise last

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
DETAIL_LIMIT = int(os.environ.get("REPORTS_DETAIL_LIMIT", "150"))

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
    r"준법감시인|투자등급\s*및\s*적용|본 자료에 게재된 내용|"
    # 네이버가 본문 아래 붙이는 고지. 요약이 세 줄일 때는 여기까지 닿지
    # 않아 몰랐는데, 여섯 줄로 늘리자 요약 뒤쪽을 통째로 차지했다.
    r"보고서의\s*내용은\s*투자판단|KRP\s*보고서는|네이버\(주\)와\s*작성)")

# 요약에서 아예 뺄 줄 — 애널리스트 연락처, 등급표, 표 부스러기, 그리고
# **쪽 머리글**. 「신한투자증권 | 2026.08.14 | 조회 3128」이 요약 첫 줄로
# 올라온 판이 있었다. 본문이 아니라 상세 쪽의 제목 밑 한 줄이다.
_DROP_LINE = re.compile(
    r"(연락처|02-\d{3,4}-\d{4}|@[a-z]+\.com|Tel\.|E-mail|"
    r"^\s*[\d,.\s%▲▼△▽\-+()]+\s*$|투자의견\s*비율|매수\s*중립\s*매도|"
    r"증권\s*\|?\s*\d{4}[.\-]\d{2}[.\-]\d{2}|조회\s*[\d,]{2,}|"
    # 첨부 파일 이름이 본문 사이에 끼어 있다 — 20260819_B45_cylee_76.pdf.
    # 앞 문장이 마침표로 끝나면 이것이 한 「문장」으로 잘려 요약에 실린다.
    r"\.[Pp][Dd][Ff](?![가-힣A-Za-z])|\d{8}_[A-Za-z0-9_]{3,}|"
    # 본문 상자를 못 찾아 쪽 전체가 잡히면 사이트 길잡이줄이 첫 문장이 된다
    # — 「증권홈 > 리서치 > 경제분석 리포트 …」.
    r"증권홈\s*>|>\s*리서치\s*>)")

# 본문 상자 안에는 첨부 파일 링크가 함께 들어 있다. 그 링크의 **글자**가
# 파일 이름이라, 「…실적에 직접 반영되고 있음. 20260819_B45_cylee_76.pdf」
# 처럼 본문에 끼어 한 문장으로 잘려 요약에 실린 판이 있었다(8/19 판 6건).
# 파일 이름에 한글과 공백이 든 것도 있어(제목을 그대로 쓴 것) 글자만 보고
# 잘라 내기 어렵다 — 태그째로 걷어낸다.
_PDF_A = re.compile(r'(?is)<a\b[^>]*(?:\.pdf|attachment|downConfirm)[^>]*>.*?</a\s*>'
                    r'|<a\b[^>]*>[^<]{0,120}?\.pdf\s*</a\s*>')

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
# (판 이름, categoryId, 쪽 수, 해외물인가)
# 1525 는 **글로벌 리서치** 판이다 — 「중국 반도체 기업 답사기」, 「글로벌
# 로보틱스: 휴머노이드 붐은 온다」처럼 해외 기업·업종을 다룬다. 국내 리서치
# 목록(네이버)에는 없는 것들이라, 이 판이 해외 리포트의 유일한 길이다.
MIRAE_BOARDS = [("리서치 리포트", "1521", 6, False),
                ("글로벌 리서치", "1525", 4, True)]

_MIRAE_A = re.compile(
    r"""(?is)<a\s+href="javascript:view\('(\d+)','[^']*'\)"[^>]*>(.*?)</a>""")
_MIRAE_PDF = re.compile(r"""(?i)downConfirm\('([^']+\.pdf[^']*)'""")
# 「SMIC (00981 HK/매수)」 · 「삼성전자 (005930/매수)」 에서 종목·코드·의견을 뗀다
_MIRAE_HEAD = re.compile(r"^(.*?)\s*\(([0-9A-Z]{5,8})(?:\s+[A-Z]{2})?\s*/\s*([^)]+)\)\s*$")


def parse_mirae(html, board, category_id, overseas=False):
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
        row_overseas = overseas
        if hm:
            stock = {"code": hm.group(2), "name": hm.group(1).strip()}
            opinion = hm.group(3).strip()
            title = tail
            # 「SMIC (00981 HK/매수)」 — 시장 꼬리표가 붙으면 해외 종목이다.
            if re.search(r"\(\s*[0-9A-Z]{5,8}\s+[A-Z]{2}\s*/", head):
                row_overseas = True
        elif tail:
            # 종목물이 아니면 앞머리는 연재물 이름이다(「월스트리트파인더 Ep.202」).
            # 종목으로 앉히면 있지도 않은 종목이 생긴다.
            title = head + " — " + tail
        else:
            title = head
        cells = [_text(c).strip() for c in _TD.findall(row)]
        # 날짜 칸이 늘 붙임표 꼴은 아니다 — 글로벌 판의 한 줄이 점 꼴로 와서
        # 날짜 없는 리포트가 됐고, 그러면 그날 셈에도 한 주 셈에도 들지 못한다.
        date = None
        for c in cells:
            dm = re.fullmatch(r"(\d{4})[-./](\d{2})[-./](\d{2})", c)
            if dm:
                date = "%s-%s-%s" % dm.groups()
                break
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
            "overseas": row_overseas or None,
        })
    return rows


def _mirae_page(cid, board, param, page, overseas=False):
    url = MIRAE_LIST % cid
    if page > 1:
        url += "&%s=%d" % (param, page)
    html = _get_retry(url, encoding="cp949", referer="https://securities.miraeasset.com/")
    return parse_mirae(html, board, cid, overseas), html


def fetch_mirae(dump_dir=None):
    """하우스 목록을 받는다. (줄 목록, 어떻게 받았는지) 를 돌려준다."""
    rows, seen, first_n = [], set(), 0
    used_by_board = {}

    def add(got):
        n = 0
        for r in got:
            if r["nid"] in seen:
                continue
            seen.add(r["nid"])
            rows.append(r)
            n += 1
        return n

    board_err = {}
    for board, cid, pages, overseas in MIRAE_BOARDS:
        # 판 하나가 죽어도 나머지는 살린다. 예전에는 첫 판이 넘어지면
        # 하우스 원천이 통째로 날아갔다.
        try:
            first, html = _mirae_page(cid, board, "pageIndex", 1, overseas)
        except Exception as e:                                  # noqa: BLE001
            board_err[board] = "%s: %s" % (type(e).__name__, e)
            continue
        if not first:
            if dump_dir:
                _dump(dump_dir, "mirae_%s_p1.html" % cid, html)
            board_err[board] = "줄을 못 찾았다 (%d bytes)" % len(html)
            continue
        first_n = max(first_n, len(first))
        add(first)

        # 두 쪽째를 후보 인자로 한 번씩 불러 본다. 새 줄이 오는 것이 진짜다.
        # 판마다 따로 찾는다 — 게시판이 다르면 인자도 다를 수 있다.
        used = used_by_board.get(cid)
        if used is None:
            for param in MIRAE_PAGE_PARAMS:
                try:
                    got, _ = _mirae_page(cid, board, param, 2, overseas)
                except Exception:                               # noqa: BLE001
                    continue
                if add(got):
                    used = param
                    break
            if used is None:
                continue                     # 쪽 넘김이 없는 게시판 — 첫 쪽만 쓴다
            used_by_board[cid] = used
        for page in range(3, pages + 1):
            try:
                got, _ = _mirae_page(cid, board, used, page, overseas)
            except Exception:                                   # noqa: BLE001
                break
            if not add(got):
                break                        # 더 나올 것이 없다
    if not rows:
        raise ValueError("미래에셋 리서치에서 한 줄도 못 얻었다")

    # 같은 리포트가 공저자 수만큼 줄로 서는 일이 있다(SMIC 리포트가 강민희·
    # 정태준 두 줄로 왔다). 제목과 날짜가 같으면 한 줄로 모으고 이름만 잇는다.
    uniq, by_key = [], {}
    for r in rows:
        k = (_key(r["title"]), r.get("date"))
        mate = by_key.get(k)
        if not mate:
            by_key[k] = r
            uniq.append(r)
            continue
        for who in (r.get("analyst") or "").split(","):
            who = who.strip()
            if who and who not in (mate.get("analyst") or ""):
                mate["analyst"] = (mate.get("analyst") + ", " + who) if mate.get("analyst") else who
        if r.get("pdf") and not mate.get("pdf"):
            mate["pdf"] = r["pdf"]
    return uniq, {"page_param": used or "(쪽 넘김 없음)",
                  "first_page_rows": first_n, "rows_before_dedupe": len(rows),
                  "boards": len(MIRAE_BOARDS) - len(board_err),
                  "board_errors": board_err or None}


def _key(title):
    """같은 리포트인지 견주는 열쇠. 띄어쓰기·문장부호는 지운다."""
    return re.sub(r"[^0-9A-Za-z가-힣]", "", title or "").lower()


# ---------------------------------------------------------------- 하나증권
#
# 세 번째 원천. 3차 탐색에서 증권사 자체 게시판 열한 곳을 찔러 본 결과
# **여기만 열렸다**(삼성·NH·한투·유안타·메리츠 404, KB 500, 대신 403).
# 표가 아니라 <ul><li> 얼개라 <tr> 세기로는 빈 쪽처럼 보였다.
#
# 목록에서 제목·날짜·작성부서·원문 PDF 를 얻는다. 목표주가는 목록에 없다.
HANA_LIST = "https://www.hanaw.com/main/research/research/list.cmd"
HANA_BASE = "https://www.hanaw.com"
_HANA_ITEM = re.compile(
    r'(?is)<h3>\s*<a[^>]*\bid="(\d+)_(\d+)"[^>]*>(.*?)</a>\s*</h3>(.*?)(?=<h3>|\Z)')
_HANA_DATE = re.compile(r"(\d{4})\.(\d{2})\.(\d{2})")
_HANA_NAME = re.compile(r'(?is)<span class="none m-name">(.*?)</span>')
_HANA_DESC = re.compile(r'(?is)<li class="[^"]*j_bbsContn[^"]*">(.*?)</li>')
# 「Nvidia (NVDA.US)」·「리더드라이브(688017.CH)」처럼 해외 종목을 다룬 줄이
# 섞여 있다. 티커 꼬리표로 가려 낸다 — 국내 리포트 목록(네이버)에 없는 것들이라
# 이 줄들이 해외 리포트의 큰 몫이다.
_OVERSEAS = re.compile(r"\(([A-Z0-9]{1,8})\.(US|CH|HK|JP|TW|DE|LN|KS|KQ)\)", re.I)
_HANA_PDF = re.compile(r'(?i)href="(/main/research/research/download\.cmd\?[^"]+)"')


def parse_hana(html):
    rows = []
    for m in _HANA_ITEM.finditer(html):
        bbs_cd, seq, title_raw, block = m.groups()
        title = re.sub(r"\s+", " ", _text(title_raw)).strip()
        if not title:
            continue
        d = _HANA_DATE.search(block)
        date = "%s-%s-%s" % d.groups() if d else None
        who = _HANA_NAME.search(block)
        desc = _HANA_DESC.search(block)
        pdf = _HANA_PDF.search(block)
        ov = _OVERSEAS.search(title)
        stock = None
        if ov and ov.group(2).upper() not in ("KS", "KQ"):
            stock = {"code": ov.group(1).upper(), "name": title.split("(")[0].strip()}
        # 목록 쪽에는 리포트마다 따로 열리는 주소가 없다 — 제목을 누르면 그
        # 자리에서 펼쳐질 뿐이라, 걸개 주소를 그대로 쓰면 마흔아홉 장의 카드가
        # 모두 같은 곳을 가리킨다(8/29 판이 그랬다). 내려받기 주소가 곧 그
        # 리포트이므로 그것을 원문 자리로 삼는다.
        pdf_url = (HANA_BASE + html_mod.unescape(pdf.group(1))) if pdf else None
        rows.append({
            "nid": "hana-" + seq,
            "category": "해외 리서치" if stock else "리서치 리포트",
            "title": title,
            "url": pdf_url or (HANA_BASE + "/main/research/research/RC_000000_M.cmd"),
            "stock": stock, "broker": "하나증권",
            "analyst": (_text(who.group(1)).strip() if who else None),
            "opinion": None, "date": date, "views": None,
            "pdf": pdf_url,
            "desc": (re.sub(r"\s+", " ", _text(desc.group(1))).strip() if desc else None),
            "overseas": bool(stock) or None,
            "source": "하나증권 리서치", "via": "html",
        })
    return rows


def fetch_hana(pages=5, dump_dir=None):
    """한 쪽에 열 줄이다. `curPage` 로 넘긴다(목록 쪽의 doSearch 에서 확인).

    한 쪽만 받으면 그날 자가 두어 건뿐이라 해외 리포트가 거의 안 잡힌다 —
    NVDA.US·688017.CH 같은 줄은 하루 이틀 전 자리에 있다.
    """
    rows, seen, first_html = [], set(), None
    for page in range(1, pages + 1):
        url = HANA_LIST if page == 1 else HANA_LIST + "?curPage=%d" % page
        try:
            html = _get_retry(url, encoding="utf-8", referer=HANA_BASE + "/")
        except Exception:                                      # noqa: BLE001
            break
        if page == 1:
            first_html = html
        got = [r for r in parse_hana(html) if r["nid"] not in seen]
        if not got:
            break                            # 쪽 넘김이 먹지 않거나 끝이다
        for r in got:
            seen.add(r["nid"])
        rows.extend(got)
    if not rows:
        if dump_dir and first_html:
            _dump(dump_dir, "hana_list.html", first_html)
        raise ValueError("하나증권 목록에서 줄을 못 찾았다")
    return rows, {"rows": len(rows), "pages": page}


def merge_source(reports, rows, broker, label):
    """다른 원천의 줄을 네이버 줄에 포갠다 — 겹치면 합치고, 없으면 세운다.

    네이버 쪽에는 본문 요약과 조회수가, 증권사 쪽에는 실명과 원문 PDF가 있다.
    """
    idx = {}
    for r in reports:
        if r.get("broker") == broker and r.get("title"):
            idx.setdefault(_key(r["title"]), r)
    added, merged = 0, 0
    for h in rows:
        mate = idx.get(_key(h["title"]))
        if mate:
            merged += 1
            if h.get("analyst") and not mate.get("analyst"):
                mate["analyst"] = h["analyst"]
            if h.get("pdf") and not mate.get("pdf"):
                mate["pdf"] = h["pdf"]
            mate["source"] = "네이버 리서치 + " + broker
        else:
            added += 1
            reports.append(h)
    return {"merged": merged, "added": added}


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
        body = _TAIL_CUT.split(_text(_PDF_A.sub(" ", frag)))[0].strip()
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
        # 제목이 <meta content="…"/> 같은 **속성값** 안에 들어 있으면, 다음
        # 태그까지 읽는 아래 길이 닫는 따옴표와 꺾쇠까지 물고 온다 —
        # 「… 높을 수도... : Npay 증권"/>」 로 앞면에 뜬 판이 있었다.
        t = re.sub(r"[\"']\s*/?>?\s*$", "", t).strip()
        # 브라우저 탭 제목에는 사이트 이름이 붙는다 — 「… : Npay 증권」.
        t = re.sub(r"\s*[:｜|]\s*(Npay|네이버(페이)?)\s*증권\s*$", "", t).strip()
        # 잘린 제목에 말줄임표만 더 붙은 것은 되찾은 것이 아니다. 후보로
        # 두면 「가장 짧은 것」 자리를 차지해 진짜 제목을 밀어낸다.
        if re.sub(r"[.…]+\s*$", "", t).strip() == prefix:
            return
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


def fetch_detail(rep, dump_dir=None, alien=()):
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
    lines = summarize(body, rep["title"], alien=alien)
    if lines:
        # 첫 줄은 대개 판단(목표주가·투자의견)이다. 따로 두어 카드에서
        # 굵게 세운다 — 종이로 훑을 때 한 줄만 보고도 넘어갈 수 있게.
        rep["lead"] = lines[0]
        rep["summary"] = " ".join(lines)
    facts = key_facts(body)
    if facts:
        rep["facts"] = facts
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
        # 통째로 따옴표에 싸인 문장이 있다. 양끝을 털어야 「" 또한,」 처럼
        # 어정쩡하게 시작하지 않는다.
        s = re.sub(r"\s+", " ", s).strip(" ·-|\"'“”")
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


# 요약을 채울 갈래와 그 몫. 점수만 보고 위에서 여섯 줄을 끊으면 목표주가
# 이야기만 여섯 줄이 된다 — 실제로 「NDR 후기: 눈높이 하향 반영 완료」가
# 한 카드 안에 두 번 실린 판이 있었다. 갈래마다 몫을 주어 판단·실적·전망·
# 위험이 고루 들어가게 한다.
BUCKETS = [
    ("판단", re.compile(r"목표\s*(주가|가)|투자의견|TP\b|상향|하향|매수|중립|"
                        r"비중\s*확대|비중\s*축소|밸류에이션|목표\s*배수"), 2),
    ("실적", re.compile(r"영업이익|매출액|순이익|실적|어닝|EPS|BPS|OPM|마진|"
                        r"컨센서스|가이던스"), 2),
    ("전망", re.compile(r"전망|예상|추정|모멘텀|수혜|성장|확대|개선|회복|"
                        r"수주|출시|증설"), 2),
    ("위험", re.compile(r"리스크|우려|부진|둔화|감소|하락|불확실|경쟁\s*심화|"
                        r"제한적"), 1),
]

_WORD = re.compile(r"[가-힣A-Za-z0-9]{2,}")


def _keyset(s):
    return set(_WORD.findall(s))


def _too_alike(a_keys, b_keys):
    """두 문장이 사실상 같은 말인지. 겹치는 낱말 비율로 본다."""
    if not a_keys or not b_keys:
        return False
    common = len(a_keys & b_keys)
    return common / min(len(a_keys), len(b_keys)) >= 0.75


def summarize(body, title="", take=6, alien=()):
    """본문에서 **원문 문장 여섯 줄**을 골라 원래 순서대로 잇는다.

    새 문장을 짓지 않는다. 목표주가·투자의견·실적처럼 사람이 먼저 보는 말이
    든 문장에 점수를 얹고, 리포트 첫머리에 가까울수록 조금 더 준다.

    세 줄이던 것을 여섯 줄로 늘렸다 — PDF 로만 보는 사람은 「세부 리포트」를
    누를 수 없어, 카드만 읽고도 무슨 이야기인지 알아야 하기 때문이다.
    다만 길이만 늘리면 같은 말이 되풀이되므로 갈래별 몫(BUCKETS)을 두고,
    제목과 겹치는 문장과 서로 비슷한 문장은 버린다.

    `alien` 은 **다른 리포트들의 제목** 낱말꾸러미다. 상세 쪽 본문 상자에는
    「이런 리포트도」 목록이 함께 들어 있어, 본문이 짧은 리포트에서는 옆
    리포트의 제목이 요약으로 올라온다 — 대신증권 건설 리포트 요약에 엉뚱한
    SK텔레콤 제목이 실렸다. 남의 제목과 닮은 문장은 버린다.
    """
    sents = _sentences(body)
    if not sents:
        return ""
    tkeys = _keyset(title or "")
    scored = []
    for i, s in enumerate(sents):
        keys = _keyset(s)
        # 제목을 그대로 옮긴 문장은 한 줄을 버리는 셈이다.
        if tkeys and _too_alike(keys, tkeys):
            continue
        if any(_too_alike(keys, a) for a in alien):
            continue
        sc = 1.0 / (1 + i * 0.12)                    # 앞자리 가산
        for pat, w in WEIGHT:
            if pat.search(s):
                sc += w
        if re.search(r"\d", s):
            sc += 0.4
        scored.append((sc, i, s, keys))
    if not scored:
        return ""
    scored.sort(key=lambda t: (-t[0], t[1]))

    picked, used, quota = [], [], {b[0]: b[2] for b in BUCKETS}

    def try_take(s, i, keys, respect_quota):
        if len(picked) >= take:
            return False
        if any(_too_alike(keys, k) for k in used):
            return False
        if respect_quota:
            for name, pat, _ in BUCKETS:
                if pat.search(s):
                    if quota[name] <= 0:
                        return False
                    quota[name] -= 1
                    break
        picked.append((i, s))
        used.append(keys)
        return True

    for sc, i, s, keys in scored:
        try_take(s, i, keys, True)
    # 몫을 지키다 여섯 줄을 못 채우면 남은 자리는 점수순으로 메운다.
    if len(picked) < take:
        got = {i for i, _ in picked}
        for sc, i, s, keys in scored:
            if i not in got:
                try_take(s, i, keys, False)
    return [s for _, s in sorted(picked)]


# 원문에 **적혀 있는** 값만 옮긴다. 셈은 하지 않는다 — 나눗셈 한 번이라도
# 하면 그 숫자는 리포트가 한 말이 아니라 이 스크립트가 한 말이 된다.
_FACTS = [
    ("상승여력", re.compile(r"(?:상승\s*여력|업사이드|괴리율)[^\d%\n]{0,10}"
                            r"([+-]?\d+(?:\.\d+)?\s*%)")),
    ("배당수익률", re.compile(r"배당\s*수익률[^\d%\n]{0,10}([\d.]+\s*%)")),
    ("목표배수", re.compile(r"(?:Target|목표|적용)\s*(PER|PBR|EV/EBITDA|P/E|P/B)"
                            r"[^\d\n]{0,10}([\d.]+\s*배)", re.I)),
    ("밸류에이션", re.compile(r"(?<![A-Za-z])(PER|PBR|EV/EBITDA)"
                             r"[^\d\n]{0,10}([\d.]+\s*배)")),
]


def key_facts(body, limit=3):
    """본문에 적힌 숫자 몇을 그대로 집어 온다 — 카드에 한 줄로 세울 것."""
    out, seen = [], set()
    for name, pat in _FACTS:
        m = pat.search(body)
        if not m:
            continue
        g = m.groups()
        label = name if len(g) == 1 else g[0].upper()
        value = re.sub(r"\s+", "", g[-1])
        if label in seen:
            continue
        seen.add(label)
        out.append({"k": label, "v": value})
        if len(out) >= limit:
            break
    return out


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


# 리포트 무더기에서 「무슨 이야기가 많았나」를 뽑을 주제 사전.
#
# 낱말 빈도를 그냥 세면 「투자」·「전망」·「기업」 같은 말만 올라온다. 세는
# 대상을 미리 정해 두어야 읽을 만한 것이 나온다. 사전이므로 여기 없는 주제는
# 잡히지 않는다 — 새 주제가 뜨면 여기에 한 줄 더한다.
THEMES = [
    ("AI·데이터센터", r"\bAI\b|인공지능|데이터센터|가속기|HBM|추론|LLM|하이퍼스케일"),
    ("반도체", r"반도체|파운드리|메모리|D램|DRAM|낸드|NAND|웨이퍼|팹리스|소부장"),
    ("2차전지", r"2차\s*전지|이차전지|배터리|양극재|음극재|전해질|리튬|EV\b"),
    ("ESS·전력", r"\bESS\b|전력망|송배전|변압기|전력기기|계통|신재생|태양광|풍력"),
    ("원전", r"원전|원자력|SMR|웨스팅하우스"),
    ("방산", r"방산|방위산업|무기|자주포|미사일|잠수함|K9|천궁"),
    ("조선·해운", r"조선|해운|선박|LNG선|컨테이너선|수주잔고"),
    ("바이오·제약", r"바이오|제약|신약|임상|FDA|비만|항체|CDMO|위탁생산"),
    ("자동차", r"자동차|완성차|전기차|하이브리드|부품사|모빌리티"),
    ("로봇", r"로봇|휴머노이드|협동로봇"),
    ("인터넷·플랫폼", r"플랫폼|커머스|광고|인터넷|콘텐츠|게임"),
    ("금융·은행", r"은행|증권주|보험|금융지주|카드사|캐피탈"),
    ("주주환원", r"주주환원|자사주|배당|소각|밸류업|인적분할|물적분할|지배구조"),
    ("금리·통화정책", r"금리|기준금리|연준|FOMC|한국은행|통화정책|국채|채권시장"),
    ("환율·외환", r"환율|원/달러|달러화|외환|엔화|위안화"),
    ("건설·부동산", r"건설|건자재|부동산|분양|리츠|주택"),
    ("화학·정유", r"화학|정유|석유화학|정제마진|나프타|스프레드"),
    ("철강·금속", r"철강|금속|알루미늄|구리|비철|원료탄"),
    ("소비·유통", r"유통|소비재|화장품|음식료|면세|편의점|리테일"),
    ("통신", r"통신|이동통신|5G|6G|광통신|네트워크\s*장비"),
]
THEMES = [(name, re.compile(pat)) for name, pat in THEMES]


def theme_counts(rows, limit=8):
    """리포트 무더기에 어떤 주제가 몇 건씩 있었는지."""
    out = []
    for name, pat in THEMES:
        n = sum(1 for r in rows
                if pat.search(r.get("title") or "")
                or pat.search(r.get("summary") or "")
                or pat.search((r.get("sector") or "")))
        if n:
            out.append({"theme": name, "count": n})
    out.sort(key=lambda e: -e["count"])
    return out[:limit]


def _josa(word, pair="이/가"):
    """받침을 보고 조사를 고른다 — 「종목분석가」·「16건가」로 나가지 않게."""
    with_batchim, without = pair.split("/")
    if not word:
        return without
    ch = word[-1]
    if "가" <= ch <= "힣":
        return with_batchim if (ord(ch) - 0xAC00) % 28 else without
    if ch.isdigit():
        # 숫자는 읽는 소리로 가른다 — 0·1·3·6·7·8 은 받침이 있다.
        return with_batchim if ch in "013678" else without
    return with_batchim


def _ko_list(names, limit=4):
    names = [n for n in names if n]
    if not names:
        return ""
    head = "·".join(names[:limit])
    return head + (" 외 %d" % (len(names) - limit) if len(names) > limit else "")


THEME_PAT = dict(THEMES)


def _pick_lines(rows, per=3, max_broker=1, used=None):
    """리포트 무더기에서 **읽을 만한 문장**을 골라 온다.

    문장은 짓지 않는다. 각 리포트가 이미 뽑아 둔 첫 줄(`lead`, 대개 판단
    문장)을 증권사·종목과 함께 그대로 옮긴다. 한 증권사가 한 주제를 다
    차지하지 않게 몫을 두고, 서로 닮은 문장은 버린다 — 같은 사건을 여러
    곳이 같은 말로 쓰는 일이 흔하다.
    """
    picks, by_broker = [], {}
    used = [] if used is None else used     # 주제끼리도 나눠 쓴다(아래 설명)
    for r in sorted(rows, key=lambda r: (-(r.get("_w") or 1), -(r.get("views") or 0))):
        line = (r.get("lead") or "").strip(" ■◆▶●○·-–—*")
        if len(line) < 25:
            continue
        # 「KOSPI 6,912pt (+1.53%), KOSDAQ 837pt (+1.30%)」 같은 시세 나열은
        # 주제 이야기가 아니다. 글자가 절반은 되어야 읽을 거리로 친다.
        if len(re.sub(r"[^가-힣]", "", line)) < len(line) * 0.35:
            continue
        b = r.get("broker") or "-"
        if by_broker.get(b, 0) >= max_broker:
            continue
        keys = _keyset(line)
        if any(_too_alike(keys, k) for k in used):
            continue
        by_broker[b] = by_broker.get(b, 0) + 1
        used.append(keys)
        picks.append({
            "broker": b,
            "stock": (r.get("stock") or {}).get("name"),
            "title": r["title"],
            "url": r["url"],
            "views": r.get("views"),
            "text": line,
        })
        if len(picks) >= per:
            break
    return picks


def theme_brief(rows, themes, top=5, per=3, used=None):
    """주제마다 **실제 리포트 문장**을 붙여 읽을 거리로 만든다.

    「한눈에」는 몇 건인지만 말한다. 정작 알고 싶은 것은 무슨 이야기인가다.
    주제별로 그 주제를 다룬 리포트를 모아, 가장 많이 읽힌 것부터 판단
    문장을 옮긴다. 어느 증권사가 무엇을 말했는지가 남아야 쓸모가 있다.
    """
    out = []
    # 주제를 넘나들며 같은 문장이 되풀이되는 것을 막는다. 시황 리포트 한 건이
    # 금리·반도체·금융에 다 걸려, 같은 줄이 세 주제에 실린 판이 있었다.
    used = [] if used is None else used
    for t in themes[:top]:
        pat = THEME_PAT.get(t["theme"])
        if not pat:
            continue
        hit = []
        for r in rows:
            in_title = bool(pat.search(r.get("title") or ""))
            if not in_title and not pat.search(r.get("summary") or ""):
                continue
            # 제목에 든 것이 그 주제를 **다룬** 리포트다. 본문에 한 번 스친
            # 것보다 앞세운다 — 그러지 않으면 시황 리포트가 모든 주제를
            # 차지한다.
            r = dict(r, _w=2 if in_title else 1)
            hit.append(r)
        lines = _pick_lines(hit, per=per, used=used)
        if not lines:
            continue
        brokers = []
        for r in hit:
            if r.get("broker") and r["broker"] not in brokers:
                brokers.append(r["broker"])
        out.append({"theme": t["theme"], "count": t["count"],
                    "brokers": brokers[:6], "points": lines})
    return out


def move_brief(rows, moves, limit=8, used=None):
    """목표주가를 올리거나 내린 리포트마다 **그 까닭 한 줄**을 붙인다."""
    by_url = {r["url"]: r for r in rows}
    used = [] if used is None else used
    out = []
    for mv in moves:
        if mv.get("move") not in ("상향", "하향"):
            continue
        r = by_url.get(mv.get("url"))
        why = ""
        if r:
            # 상향·하향이라는 말이 든 문장을 우선으로 고른다 — 그것이 까닭이다.
            for s in re.split(r"(?<=다\.)\s+|(?<=[.!?])\s+", r.get("summary") or ""):
                if re.search(r"상향|하향|목표\s*주가", s) and len(s) >= 20:
                    why = s.strip()
                    break
            if not why:
                why = r.get("lead") or ""
        if why:
            used.append(_keyset(why))
        out.append({"move": mv["move"], "stock": mv.get("stock"),
                    "target_price": mv.get("target_price"), "broker": mv.get("broker"),
                    "title": mv.get("title"), "url": mv.get("url"), "why": why})
        if len(out) >= limit:
            break
    return out


def crowd_brief(rows, crowd, limit=4, per=3, used=None):
    """여러 곳이 함께 본 종목마다 증권사별 한 줄 — 시각차가 드러나야 한다."""
    out = []
    for c in crowd[:limit]:
        hit = [r for r in rows if (r.get("stock") or {}).get("code") == c.get("code")]
        lines = _pick_lines(hit, per=per, used=used)
        if len(lines) < 2:
            continue
        out.append({"name": c.get("name") or c.get("code"), "count": c["count"],
                    "target_avg": c.get("target_avg"), "target_min": c.get("target_min"),
                    "target_max": c.get("target_max"), "points": lines})
    return out


def overview(rows, label, moves=None, crowd=None):
    """리포트 무더기의 **서두 총평**.

    PDF 로만 보는 사람은 카드를 하나하나 짚어 보기 전에 「오늘(이번 주)
    무슨 이야기가 많았나」를 먼저 알고 싶어 한다. 새 사실을 지어내지 않고,
    이미 센 것(건수·갈래·주제·목표주가·겹친 종목)을 문장으로 엮는다.
    """
    if not rows:
        return None
    cats = {}
    for r in rows:
        cats[r["category"]] = cats.get(r["category"], 0) + 1
    top_cat = sorted(cats.items(), key=lambda t: -t[1])
    themes = theme_counts(rows)
    moves = moves or []
    ups = [m for m in moves if m.get("move") == "상향"]
    dns = [m for m in moves if m.get("move") == "하향"]
    crowd = crowd or []

    parts = ["%s 리포트는 %d건입니다." % (label, len(rows))]
    if top_cat:
        parts.append("갈래로는 %s%s %d건으로 가장 많습니다."
                     % (top_cat[0][0], _josa(top_cat[0][0]), top_cat[0][1]))
    if themes:
        lst = _ko_list(["%s %d건" % (t["theme"], t["count"]) for t in themes[:3]], 3)
        parts.append("주제로는 %s%s 앞섰습니다." % (lst, _josa(lst)))
    if ups or dns:
        bits = []
        if ups:
            bits.append("%d건 상향(%s)" % (len(ups), _ko_list([m.get("stock") for m in ups], 3)))
        if dns:
            bits.append("%d건 하향(%s)" % (len(dns), _ko_list([m.get("stock") for m in dns], 3)))
        parts.append("목표주가는 " + ", ".join(bits) + "입니다.")
    else:
        parts.append("목표주가를 올리거나 내린 리포트는 없습니다.")
    if crowd:
        parts.append("여러 증권사가 함께 본 종목은 %s입니다."
                     % _ko_list(["%s %d곳" % (c.get("name") or c.get("code"), c["count"])
                                 for c in crowd], 3))
    # 논점·목표주가·종목이 같은 문장을 나눠 쓰지 않게 한 자리에 모아 둔다.
    # **목표주가를 먼저 짓는다** — 그 줄이 그날 가장 중요한 대목이고, 주제
    # 쪽에서 먼저 집어 가면 한 쪽에 같은 문장이 두 번 실린다(실제로 그랬다).
    shared = []
    mv = move_brief(rows, moves, used=shared)
    return {
        "text": " ".join(parts),
        "themes": themes,
        # 몇 건인지 다음에 **무슨 이야기인지**가 와야 한다. 아래 셋이 그것이다.
        "moves": mv,
        "brief": theme_brief(rows, themes, used=shared),
        "crowd": crowd_brief(rows, crowd, used=shared),
        "by_category": sorted(({"category": c, "count": n} for c, n in cats.items()),
                              key=lambda e: -e["count"]),
    }


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
        "overview": overview(todays or base, day + " 자", moves, crowd),
        "count_overseas": sum(1 for r in (todays or base) if r.get("overseas")),
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

    **그날 자 리포트에서만 고른다.** 처음에는 전체에서 고르며 그날 것에
    점수만 얹었는데, 아침에는 오늘 리포트의 조회수가 아직 낮아 며칠 묵은
    리포트가 조회수로 이겼다 — 8/20 08:56 판에서 「오늘의 주요」 열두 장
    가운데 열 장이 8/14·8/18 자였다. 그날 것이 아예 없을 때(있을 수
    없지만)만 전체로 물러난다.
    """
    pool = [r for r in reports if r.get("date") == day] or reports
    counts = {}
    for r in pool:
        st = (r.get("stock") or {}).get("code")
        if st:
            counts[st] = counts.get(st, 0) + 1
    scored = []
    for r in pool:
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


# ---------------------------------------------------------------- 주간

WEEK_SPAN = 7          # 오늘을 넣어 이레
WEEKLY_TAKE = 18
WEEKLY_CAT_CAP = 5

# 여러 판을 합칠 때, 뒤늦게 채워진 것은 살리고 조회수는 큰 쪽을 남긴다.
#
# excerpt·body_chars 가 함께 따라와야 한다. 요약만 옮기고 근거를 두고 오면,
# 그 줄은 「본문에 없는 문장」이 되어 검산에서 걸린다 — 실제로 8/31 판에서
# 앞선 판의 요약이 발췌 없이 건너와 한 건이 그렇게 잡혔다. 옮긴 문장의
# 출처를 대지 못하는 자료는 내지 않는다.
_CARRY = ("summary", "lead", "facts", "excerpt", "body_chars", "extracted",
          "target_price", "opinion", "target_move",
          "analyst", "pdf", "house_pdf", "sector", "stock")


def _absorb(old, new):
    if (new.get("views") or 0) > (old.get("views") or 0):
        old["views"] = new["views"]
    for k in _CARRY:
        if not old.get(k) and new.get(k):
            old[k] = new[k]
    # 제목은 되찾은 쪽(잘리지 않은 쪽)이 낫다.
    if old["title"].rstrip().endswith("..") and not new["title"].rstrip().endswith(".."):
        old["title"] = new["title"]


def pool_key(r):
    """한 주 무더기에서 리포트를 가리키는 이름 — 원문 주소.

    nid 하나로는 모자랐다. 원천마다 매기는 번호가 따로라 네이버의 95903 과
    다른 곳의 95903 이 같은 칸을 다투고, 그러면 한 건이 조용히 사라진다
    (8/29 판에서 한 주 셈이 347 이어야 할 자리에 346 이 찍혔다).

    그렇다고 원천 이름을 붙여도 안 된다. 그 이름은 **변한다** — 같은 리포트가
    오늘은 「네이버 리서치」였다가, 하우스 목록에도 실린 날에는 「네이버 리서치
    + 하나증권」이 된다. 판마다 이름이 달라지면 한 리포트가 두 칸을 차지해
    한 주 셈이 부풀었다(8/31 판 344 대 343).

    주소는 변하지 않고 리포트마다 하나뿐이다. 그것을 이름으로 쓴다.
    """
    return r.get("url") or ("%s|%s" % (r.get("source") or "-", r.get("nid")))


def drop_unsourced(r):
    """근거 없는 요약은 지운다.

    지난 판에서 넘어온 줄 가운데, 요약은 있는데 그 요약을 떠온 본문 발췌가
    없는 것이 있다(발췌를 딸려 보내기 전에 만들어진 판이다). 그런 문장은
    어디서 왔는지 댈 수 없다 — 지우면 다음 판에서 본문을 다시 열어 제대로
    채운다. 남겨 두면 근거 없이 인쇄된다.
    """
    if r.get("summary") and not r.get("excerpt"):
        for k in ("summary", "lead", "facts", "extracted", "body_chars"):
            r.pop(k, None)
    return r


def merge_today(reports, out_dir, today):
    """오늘 앞선 판에서 받아 둔 줄을 이번 판에 포갠다.

    목록에서 밀려난 리포트를 잃지 않기 위한 것이다. 새로 받은 것을 앞에
    두고, 지난 판에만 있던 줄을 뒤에 잇는다(요약·조회수는 `_absorb` 가
    좋은 쪽을 남긴다).
    """
    path = os.path.join(out_dir, today + ".json")
    if not os.path.exists(path):
        return reports
    try:
        with open(path, encoding="utf-8") as f:
            old = json.load(f).get("reports", [])
    except (OSError, ValueError):
        return reports
    seen = {pool_key(r): r for r in reports}
    added = 0
    for r in old:
        if not r.get("nid"):
            continue
        drop_unsourced(r)
        cur = seen.get(pool_key(r))
        if cur is None:
            seen[pool_key(r)] = dict(r)
            reports.append(dict(r))
            added += 1
        else:
            _absorb(cur, r)
    if added:
        print("오늘 앞선 판에서 %d건을 이어 받았다" % added)
    return reports


def load_history(out_dir, since):
    """지난 판들에서 `since` 이후 리포트를 모아 온다.

    한 판에 담기는 것은 네이버 목록의 앞쪽 몇 쪽뿐이라, 엿새 전 리포트는
    이미 목록에서 밀려나 오늘 판에 없다. 날짜별로 남겨 둔 지난 판을 합쳐야
    한 주가 온전해진다.
    """
    merged = {}
    for f in sorted(os.listdir(out_dir)):
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}\.json", f):
            continue
        try:
            with open(os.path.join(out_dir, f), encoding="utf-8") as fh:
                got = json.load(fh)
        except (OSError, ValueError):
            continue
        for r in got.get("reports", []):
            if not r.get("nid") or (r.get("date") or "") < since:
                continue
            drop_unsourced(r)
            k = pool_key(r)
            old = merged.get(k)
            if old is None:
                merged[k] = dict(r)
            else:
                _absorb(old, r)
    return merged


def weekly(reports, day, out_dir):
    """한 주 동안 가장 많이 읽힌 리포트와 그 주의 셈."""
    since = (datetime.strptime(day, "%Y-%m-%d")
             - timedelta(days=WEEK_SPAN - 1)).strftime("%Y-%m-%d")
    pool = load_history(out_dir, since)
    for r in reports:                       # 오늘 판이 가장 새것이다
        if not r.get("nid") or (r.get("date") or "") < since:
            continue
        old = pool.get(pool_key(r))
        if old is None:
            pool[pool_key(r)] = dict(r)
        else:
            _absorb(old, r)

    rows = [r for r in pool.values() if since <= (r.get("date") or "") <= day]
    rows.sort(key=lambda r: (-(r.get("views") or 0), r.get("date") or ""))

    top, seen_cat = [], {}
    for r in rows:
        c = r.get("category") or "-"
        if seen_cat.get(c, 0) >= WEEKLY_CAT_CAP:
            continue
        seen_cat[c] = seen_cat.get(c, 0) + 1
        top.append(pool_key(r))
        if len(top) >= WEEKLY_TAKE:
            break

    brokers, stocks, moves = {}, {}, []
    for r in rows:
        b = r.get("broker")
        if b:
            brokers[b] = brokers.get(b, 0) + 1
        st = r.get("stock") or {}
        if st.get("code"):
            e = stocks.setdefault(st["code"], {"code": st["code"], "name": st.get("name"),
                                               "count": 0, "brokers": []})
            e["count"] += 1
            if r.get("broker") and r["broker"] not in e["brokers"]:
                e["brokers"].append(r["broker"])
        if r.get("target_move") in ("상향", "하향"):
            moves.append({"move": r["target_move"], "stock": st.get("name"),
                          "target_price": r.get("target_price"), "broker": r.get("broker"),
                          "title": r["title"], "url": r["url"], "date": r.get("date")})

    moves.sort(key=lambda m: (m["move"] != "상향", m.get("date") or ""), reverse=False)
    days = sorted({r["date"] for r in rows if r.get("date")})
    crowd = sorted((e for e in stocks.values() if e["count"] >= 2),
                   key=lambda e: -e["count"])[:12]
    return {
        "overview": overview(rows, "%s~%s 한 주" % (since[5:], day[5:]), moves, crowd),
        "since": since, "until": day,
        "days": days,
        "count": len(rows),
        "count_summarized": sum(1 for r in rows if r.get("summary")),
        "count_overseas": sum(1 for r in rows if r.get("overseas")),
        "top": top,
        "reports": [pool[n] for n in top],
        "by_broker": [{"broker": b, "count": c}
                      for b, c in sorted(brokers.items(), key=lambda t: -t[1])[:8]],
        "top_stocks": sorted(stocks.values(), key=lambda e: -e["count"])[:8],
        "moves_up": sum(1 for m in moves if m["move"] == "상향"),
        "moves_down": sum(1 for m in moves if m["move"] == "하향"),
        "moves": moves[:20],
    }


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

    # 하나증권 자체 게시판. 증권사 자체 게시판 열한 곳 가운데 유일하게
    # 열린 곳이다(3차 탐색). 해외 종목 리포트(NVDA.US 등)가 여기에 있다.
    try:
        hana, how = fetch_hana(dump_dir=RAW_DIR)
        stat = merge_source(reports, hana, "하나증권", "하나증권 리서치")
        rec = {"ok": True, "count": len(hana), "via": "html",
               "merged_into_naver": stat["merged"], "new": stat["added"]}
        rec.update(how)
        out["sources"]["하나증권 리서치"] = rec
    except urllib.error.HTTPError as e:
        out["sources"]["하나증권 리서치"] = {"ok": False, "error": "HTTP %s" % e.code}
    except Exception as e:                                       # noqa: BLE001
        out["sources"]["하나증권 리서치"] = {
            "ok": False, "error": "%s: %s" % (type(e).__name__, e)}

    if not reports:
        raise SystemExit("리포트를 한 건도 받지 못했다 — 목록 구조가 바뀌었을 수 있다. "
                         "data/reports/raw 의 덤프를 보십시오.")

    # 하루에 네 번 돈다. 그때마다 그날 판을 덮어써 왔는데, 목록은 흐르는
    # 물이라 아침에 앞쪽에 있던 리포트가 저녁 목록에서는 밀려나 있다 —
    # 덮어쓰면 그 리포트가 기록에서 사라진다. 8/31 08:12 판에서 한 주 셈이
    # 334 로 찍혔는데 그 파일로 다시 세면 333 이었던 것이 그 자국이다.
    # 오늘 몫은 **더해서** 남긴다. 조회수는 큰 쪽, 요약은 있는 쪽을 살린다.
    reports = merge_today(reports, OUT_DIR, today)

    # 가장 최근 날짜 것부터, 그다음 조회수 순으로 본문을 연다. 상한에 걸린
    # 나머지는 목록 정보(제목·증권사·PDF 링크)만 담긴 채로 남는다.
    day = latest_day(reports) or today
    out["report_date"] = day
    order = detail_order(reports, day)
    # 주간 인기 리포트도 본문이 있어야 한 장으로 읽힌다. 갈래마다 몫을 주어
    # 도는 탓에 경제분석·시황정보의 주간 상위가 번번이 상한 밖으로 밀렸다
    # — 열여덟 장 가운데 일곱 장이 요약 없이 남았다. 먼저 연다.
    hot = set(weekly(reports, day, OUT_DIR)["top"])
    order = ([r for r in order if pool_key(r) in hot]
             + [r for r in order if pool_key(r) not in hot])
    # 상세 쪽 본문 상자에는 「이런 리포트도」 목록이 딸려 온다. 다른 리포트의
    # 제목을 미리 챙겨 두었다가, 요약으로 올라오려 하면 막는다.
    title_keys = {r["nid"]: _keyset(r["title"]) for r in reports}
    opened, failed = 0, 0
    for r in order:
        if opened >= DETAIL_LIMIT:
            break
        try:
            alien = [k for n, k in title_keys.items() if n != r["nid"]]
            fetch_detail(r, dump_dir=RAW_DIR, alien=alien)
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
    # 주간은 오늘 판만으로는 안 된다 — 지난 판을 합쳐야 이레가 채워진다.
    out["weekly"] = weekly(reports, day, OUT_DIR)

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
