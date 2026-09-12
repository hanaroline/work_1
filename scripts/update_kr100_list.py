#!/usr/bin/env python3
"""국내 100대 기업 **대상 목록을 자동으로 갈아 끼운다** — 주 1회.

무엇을 하나
  목록 점검(scripts/check_kr100_ranking.py)이 만든 data/kr100/ranking.json 을 읽어
  시가총액 순위에서 밀린 종목을 빼고 새로 올라온 종목을 넣는다. 새 종목에 필요한
  한글 자산(검색 키워드·"기업 한눈에" 개요)은 **수집한 값으로 지어 함께 넣는다.**
  고치는 곳은 kr-top100.html 의 COMPANIES · KEYWORDS · PROFILE_KO · CMP_PRESETS 다.

왜 예전에는 자동으로 하지 않았나
  키워드와 개요가 사람이 쓴 글이어서, 자동 교체는 "개요가 빈 종목이 조용히 섞여
  들어오는" 방식이 됐다. 그래서 이 스크립트는 **개요를 만들지 못하면 그 종목을 넣지
  않는다.** 자동으로 쓴 개요는 수집한 사실(업종·매출·영업이익률·시총 순위·본사·
  임직원 수·주요제품)만으로 짓고, 사람이 쓴 글이 아니라는 것을 화면에 밝힌다
  (PROFILE_KO 항목의 네 번째 자리 'auto'). 나중에 사람이 문장을 고치면 그 표시만
  지우면 된다.

교체 규칙
  · 들어오려면 **{ADD_RANK}위 안**, 나가려면 **{DROP_RANK}위 밖**이어야 한다.
    사이의 완충 구간이 경계에서 매주 오가는 종목(100위 언저리)을 걸러 준다.
  · 한 번에 최대 {MAX_SWAP}종목만 바꾼다. 순위 원천이 하루 이상해도 목록이 통째로
    흔들리지 않게 하는 제동이다.
  · 들어올 종목과 나갈 종목의 수를 맞춰 목록은 늘 100개다.
  · **데이터를 실제로 받아 본 뒤에만 넣는다.** 시세나 기업 프로필을 못 받은 후보는
    건너뛰고 다음 주에 다시 본다.

쓰는 법
  python scripts/update_kr100_list.py            # 실제로 고친다
  python scripts/update_kr100_list.py --dry-run  # 무엇을 바꿀지만 적는다(파일은 그대로)
  python scripts/update_kr100_list.py --check    # 지금 파일의 앞뒤가 맞는지만 본다

내놓는 것
  kr-top100.html          — 고쳐진 화면 파일
  data/kr100/list-change.json — 무엇을 왜 바꿨는지(화면 ⑩ 섹션·요약이 읽는다)
  종료 코드 0 = 성공(바꿨든 안 바꿨든). 0 이 아니면 아무것도 고치지 않았다.
"""

import argparse
import datetime
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_kr100                                          # noqa: E402  국내 시장 프로필
import fetch_us100 as F                                     # noqa: E402  수집 엔진

ADD_RANK = 90            # 이 안에 들어와야 자리를 얻는다
DROP_RANK = 110          # 이 밖으로 밀려야 자리를 잃는다
MAX_SWAP = 5             # 한 번에 바꾸는 최대 종목 수
LIST_SIZE = 100

SYM_RE = re.compile(r"^(\d{6})\.(KS|KQ)$")


# ---------------------------------------------------------------- 표기

def won(v):
    """조·억원으로 적는다 — 화면의 표기와 같은 규칙."""
    if v is None:
        return None
    a = abs(v)
    if a >= 1e12:
        return "%s조원" % format(round(a / 1e12, 0 if a >= 1e14 else 1), ",")
    if a >= 1e8:
        return "%s억원" % format(int(round(a / 1e8)), ",")
    return "%s원" % format(int(round(a)), ",")


def has_hangul(s):
    return bool(s) and bool(re.search(r"[가-힣]", s))


def clean_en(name):
    """영문 사명에서 법인 형태 꼬리를 떼어 목록에 쓰기 좋게 만든다."""
    s = re.sub(r"\s*,?\s*(Co\.?,?\s*Ltd\.?|Corp\.?|Corporation|Inc\.?|Company|Limited|"
               r"Holdings? Co\.?,?\s*Ltd\.?|PLC)\s*$", "", (name or "").strip(), flags=re.I)
    return re.sub(r"\s{2,}", " ", s).strip(" .,") or (name or "").strip()


# ---------------------------------------------------------------- 업종 분류
# 야후의 industry(영문)를 이 화면의 업종 코드 14개로 옮긴다. 화면의 SECTORS 와 같은 코드다.
INDUSTRY_SECTOR = [
    (r"semiconductor equipment|semiconductor materials", "semi"),
    (r"semiconductor", "semi"),
    (r"consumer electronics|electronic components|computer hardware|"
     r"electronics & computer distribution|scientific & technical instruments", "elec"),
    (r"auto manufacturers|auto parts|auto & truck|rubber", "auto"),
    (r"aerospace & defense|specialty industrial machinery|farm & heavy construction|"
     r"industrial distribution|metal fabrication|tools & accessories|"
     r"electrical equipment|pollution & treatment", "heavy"),
    (r"oil & gas refining|oil & gas integrated|oil & gas e&p|oil & gas midstream|"
     r"specialty chemicals|chemicals|agricultural inputs", "chem"),
    (r"steel|other industrial metals|copper|aluminum|coking coal|gold|silver", "steel"),
    (r"drug manufacturers|biotechnology|diagnostics & research|medical devices|"
     r"medical instruments|pharmaceutical retailers|healthcare", "bio"),
    (r"internet content|software|electronic gaming|information technology services|"
     r"internet retail", "it"),
    (r"banks|insurance|capital markets|asset management|credit services|"
     r"financial data|financial conglomerates|mortgage finance", "fin"),
    (r"tobacco|household & personal|packaged foods|beverages|farm products|"
     r"apparel|footwear|luxury goods|specialty retail|department stores|"
     r"grocery stores|discount stores|personal services|restaurants|leisure|"
     r"furnishings|home improvement|education|security & protection|"
     r"staffing & employment|consulting services|specialty business services|"
     r"rental & leasing|waste management|travel services", "cons"),
    (r"engineering & construction|airlines|marine shipping|integrated freight|"
     r"railroads|trucking|utilities|building products|infrastructure|"
     r"residential construction|real estate", "infra"),
    (r"telecom services|entertainment|broadcasting|advertising agencies|publishing|"
     r"electronic gaming & multimedia", "tel"),
    (r"conglomerates|shell companies", "hold"),
]

# 사명으로 바로 알 수 있는 것은 야후 분류보다 앞세운다 — 국내 지주·금융은 야후가
# "Conglomerates"·"Banks" 로 뭉뚱그리는 일이 잦다.
NAME_SECTOR = [
    (r"지주|홀딩스|Holdings?$", "hold"),
    (r"은행|금융지주|증권|보험|화재|생명|캐피탈|카드", "fin"),
    (r"제약|바이오|팜$|메디", "bio"),
    (r"전선|케이블|중공업|조선|항공우주|방산", "heavy"),
    (r"건설|산업개발|엔지니어링", "infra"),
    (r"텔레콤|통신", "tel"),
]

# 야후 sector(대분류) — industry 로도 못 정했을 때의 마지막 단계
SECTOR_SECTOR = {
    "Technology": "it", "Industrials": "heavy", "Financial Services": "fin",
    "Healthcare": "bio", "Consumer Cyclical": "cons", "Consumer Defensive": "cons",
    "Basic Materials": "chem", "Energy": "chem", "Utilities": "infra",
    "Communication Services": "tel", "Real Estate": "infra",
}

# 업종 코드의 한글 이름 — 화면의 SECTORS 와 같게 둔다(짧은 쪽)
SECTOR_KO = {
    "semi": "반도체", "elec": "전기전자", "bat": "2차전지", "auto": "자동차",
    "heavy": "조선 · 기계 · 방산", "chem": "화학 · 정유", "steel": "철강 · 비철",
    "bio": "제약 · 바이오", "it": "인터넷 · 소프트웨어", "fin": "금융",
    "cons": "소비재 · 서비스", "infra": "건설 · 운송", "tel": "통신 · 미디어",
    "hold": "지주회사",
}

# 업종 코드별 기본 검색어 — 화면의 KEYWORDS 에 이미 쓰던 말들에서 가져왔다
SECTOR_WORDS = {
    "semi": "반도체", "elec": "전기전자 부품", "bat": "2차전지 배터리",
    "auto": "자동차 부품", "heavy": "기계 조선 방산 전력기기", "chem": "화학 정유",
    "steel": "철강 비철금속", "bio": "제약 바이오", "it": "인터넷 소프트웨어 IT서비스",
    "fin": "금융", "cons": "소비재 유통", "infra": "건설 운송 유틸리티",
    "tel": "통신 미디어", "hold": "지주",
}

# 화면에 한 줄로 적을 주력사업 — 야후 industry 의 한글 표기
INDUSTRY_KO = {
    "semiconductors": "반도체", "semiconductor equipment & materials": "반도체 장비 · 소재",
    "consumer electronics": "가전 · 전자기기", "electronic components": "전자부품",
    "computer hardware": "컴퓨터 하드웨어", "auto manufacturers": "완성차",
    "auto parts": "자동차 부품", "aerospace & defense": "항공우주 · 방산",
    "specialty industrial machinery": "산업기계", "farm & heavy construction machinery": "건설기계",
    "electrical equipment & parts": "전력기기 · 전기설비", "metal fabrication": "금속가공",
    "specialty chemicals": "정밀화학", "chemicals": "화학",
    "oil & gas refining & marketing": "정유", "steel": "철강",
    "other industrial metals & mining": "비철금속", "copper": "구리 제련",
    "drug manufacturers - general": "제약", "drug manufacturers - specialty & generic": "제약",
    "biotechnology": "바이오", "diagnostics & research": "진단 · 연구",
    "medical devices": "의료기기", "internet content & information": "인터넷 서비스",
    "software - application": "소프트웨어", "software - infrastructure": "소프트웨어",
    "electronic gaming & multimedia": "게임", "information technology services": "IT 서비스",
    "banks - regional": "은행", "banks - diversified": "은행",
    "insurance - life": "생명보험", "insurance - property & casualty": "손해보험",
    "insurance - diversified": "보험", "capital markets": "증권",
    "asset management": "자산운용", "credit services": "여신 · 결제",
    "tobacco": "담배", "household & personal products": "생활용품 · 화장품",
    "packaged foods": "식품", "beverages - non-alcoholic": "음료",
    "apparel manufacturing": "의류", "specialty retail": "유통",
    "engineering & construction": "건설 · 플랜트", "airlines": "항공",
    "marine shipping": "해운", "integrated freight & logistics": "물류",
    "utilities - regulated electric": "전력", "utilities - independent power producers": "발전",
    "telecom services": "통신", "entertainment": "엔터테인먼트",
    "conglomerates": "지주 · 복합기업", "shell companies": "지주회사",
    "security & protection services": "보안 · 시설관리",
    "specialty business services": "기업 서비스", "consulting services": "컨설팅",
    "rental & leasing services": "렌탈 · 리스", "railroads": "철도",
    "trucking": "운송", "building products & equipment": "건자재",
    "residential construction": "주택건설", "industrial distribution": "산업재 유통",
    "scientific & technical instruments": "계측 · 정밀기기",
    "communication equipment": "통신장비", "solar": "태양광",
    "waste management": "환경 · 폐기물",
}


# 영문 기업 개요에 나오는 말 → 한글 검색어. KIND 의 "주요제품" 을 못 받는 자리
# (GitHub 러너에서 403)에서 키워드를 채우는 길이다. 국내 화면에서 사람이 실제로
# 쳐 볼 만한 말만 넣는다 — 원문에 없는 말은 넣지 않으므로 지어낸 것이 아니다.
DESC_KO = [
    (r"\bfoundr", "파운드리"), (r"\bwafer", "웨이퍼"), (r"\bmemory\b|\bdram\b", "메모리"),
    (r"\bsemiconductor", "반도체"), (r"\blaser", "레이저"), (r"\bdisplay", "디스플레이"),
    (r"\bbatter", "배터리"), (r"cathode", "양극재"), (r"anode", "음극재"),
    (r"secondary cell|lithium", "2차전지"), (r"\bnuclear", "원자력"),
    (r"power plant|power generation", "발전소"), (r"transformer", "변압기"),
    (r"switchgear|substation", "전력기기"), (r"\bcable\b|\bwire\b", "전선"),
    (r"shipbuild|shipyard|\bvessel", "조선"), (r"\blng\b", "LNG"),
    (r"defen[cs]e|missile|weapon", "방산"), (r"aerospace|aircraft|satellite", "항공우주"),
    (r"\brobot", "로봇"), (r"construction|engineering, procurement", "건설"),
    (r"\bplant\b|\bepc\b", "플랜트"), (r"refin(e|ing)|petroleum", "정유"),
    (r"petrochemical|chemical", "화학"), (r"\bsteel\b", "철강"), (r"\bzinc\b|smelt", "제련"),
    (r"pharmaceutic|\bdrug", "제약"), (r"biosimilar", "바이오시밀러"),
    (r"\bbiotech|biolog", "바이오"), (r"vaccine", "백신"),
    (r"cosmetic|skin care|beauty", "화장품"), (r"\bfood\b|noodle|confection", "식품"),
    (r"tobacco|cigarette", "담배"), (r"\bretail|department store|convenience store", "유통"),
    (r"\bbank(ing)?\b", "은행"), (r"life insurance", "생명보험"),
    (r"non-life|property and casualty|casualty insurance", "손해보험"),
    (r"\binsurance\b", "보험"), (r"securities|brokerage", "증권"),
    (r"asset management", "자산운용"), (r"\bcard\b|payment", "결제"),
    (r"\bgame|gaming", "게임"), (r"\bcloud\b", "클라우드"),
    (r"\bsoftware\b|system integration", "소프트웨어"), (r"\bsearch engine|portal", "포털"),
    (r"e-?commerce", "커머스"), (r"telecommunication|wireless|mobile network", "통신"),
    (r"\biptv\b|broadcast", "미디어"), (r"entertainment|music|artist", "엔터"),
    (r"\bairline|air transport", "항공"), (r"shipping|container", "해운"),
    (r"logistic|freight", "물류"), (r"\bautomobile|\bvehicle|passenger car", "자동차"),
    (r"\btire\b|\btyre\b", "타이어"), (r"electric vehicle|\bev\b", "전기차"),
    (r"excavator|construction equipment", "건설기계"), (r"\bcamera module", "카메라모듈"),
    (r"printed circuit|substrate", "기판"), (r"\bmlcc\b|capacitor", "MLCC"),
    (r"\bsolar\b|photovoltaic", "태양광"), (r"\bsecurity\b|surveillance", "보안"),
    (r"holding company|investment holding", "지주"),
]


def desc_words(desc, limit=6):
    """영문 개요에서 한글 검색어를 뽑는다. 원문에 있는 말만 옮긴다."""
    out = []
    low = (desc or "").lower()
    for pat, ko in DESC_KO:
        if ko not in out and re.search(pat, low):
            out.append(ko)
            if len(out) >= limit:
                break
    return out


def pick_sector(profile, ko, en):
    """이 화면의 업종 코드를 고른다 — 사명 → 야후 industry → 야후 sector 순."""
    name = (ko or "") + " " + (en or "")
    for pat, code in NAME_SECTOR:
        if re.search(pat, name, re.I):
            return code, "사명"
    ind = (profile.get("industry") or "").lower()
    for pat, code in INDUSTRY_SECTOR:
        if re.search(pat, ind):
            return code, "industry=%s" % profile.get("industry")
    sec = SECTOR_SECTOR.get(profile.get("sector") or "")
    if sec:
        return sec, "sector=%s" % profile.get("sector")
    return "cons", "기본값"


def industry_ko(profile, sector):
    ind = (profile.get("industry") or "").strip()
    return INDUSTRY_KO.get(ind.lower()) or SECTOR_KO.get(sector) or "기타"


# ---------------------------------------------------------------- 한글 사명·주요제품
# 야후는 국내 종목의 이름을 영문으로 준다. 화면의 목록·한글 뉴스 검색은 한글 사명으로
# 도니까, 아래 순서로 찾아보고 끝내 못 찾으면 영문명을 그대로 쓴다(비워 두지 않는다).

_KIND_CACHE = {}


def kind_table():
    """상장법인 목록(KIND) — {종목코드: {name, industry, product}}.

    한국거래소 상장공시시스템이 내려 주는 전 상장사 표다. 한글 **정식 사명**과
    **업종·주요제품**이 함께 있어, 자동으로 지은 개요의 살이 된다.
    한 번만 받아 두고 쓴다. 못 받으면 빈 표를 돌려주고 다음 원천으로 넘어간다.

    **GitHub 러너에서는 HTTP 403 이 온다**(2026-09-12 확인). 거래소가 클라우드 IP 를
    막는 것이어서 data.krx.co.kr 과 같은 사정이다 — 헤더로 풀리는 문제가 아니다.
    그래서 예약 실행에서는 한글 사명을 야후(ko-KR)에서 받고, 주요제품은 비운 채
    영문 개요에서 뽑은 말로 키워드를 채운다. 국내 IP 가 나가는 자리에서 손으로 돌리면
    이 표가 열려 더 좋은 이름·키워드가 들어간다.
    """
    if _KIND_CACHE:
        return _KIND_CACHE.get("rows", {})
    rows = {}
    url = ("https://kind.krx.co.kr/corpgeneral/corpList.do"
           "?method=download&searchType=13&marketType=")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": F.UA})
        with urllib.request.urlopen(req, timeout=F.TIMEOUT) as r:
            body = r.read()
        html = body.decode("euc-kr", "replace")
        # 이 파일은 대문자 태그(<TR><TD>)로 온다 — 대소문자를 가리면 한 줄도 못 읽는다.
        trs = re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.S | re.I)
        for tr in trs[1:]:
            tds = [re.sub(r"<[^>]+>", "", td).replace("&amp;", "&").replace("&nbsp;", " ").strip()
                   for td in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S | re.I)]
            if len(tds) < 4 or not re.fullmatch(r"\d{6}", tds[1]):
                continue
            rows[tds[1]] = {"name": tds[0], "industry": tds[2], "product": tds[3]}
        print("  KIND 상장법인 목록 %d개 확보 (%.0fKB · 행 %d)"
              % (len(rows), len(body) / 1024, len(trs)), flush=True)
        if not rows:
            print("  KIND 응답 앞부분: %s" % html[:200].replace("\n", " "), flush=True)
    except Exception as e:                                  # noqa: BLE001
        print("  KIND 상장법인 목록을 못 받았다 — %s" % e, flush=True)
    _KIND_CACHE["rows"] = rows
    return rows


def yahoo_names(sym, locale):
    """야후가 그 지역 말로 주는 이름들. locale='ko' 면 한글, 'en' 이면 영문이 온다."""
    lang, region = ("ko-KR", "KR") if locale == "ko" else ("en-US", "US")
    out = []
    for path in (
        "/v1/finance/search?q=%s&lang=%s&region=%s&quotesCount=8&newsCount=0"
        % (sym.split(".")[0], lang, region),
        "/v7/finance/quote?symbols=%s&lang=%s&region=%s%s"
        % (urllib.parse.quote(sym), lang, region,
           "&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""),
    ):
        try:
            j = F.yget(path)
        except Exception:                                   # noqa: BLE001
            continue
        rows = (j.get("quotes") or []) + (((j.get("quoteResponse") or {}).get("result")) or [])
        for r in rows:
            if (r.get("symbol") or "") != sym:
                continue
            for k in ("shortname", "longname", "shortName", "longName"):
                v = (r.get(k) or "").strip()
                if v and v not in out:
                    out.append(v)
    return out


def strip_corp(name):
    """한글 사명에서 법인 형태 표기를 뗀다 — '한국전력기술(주)' → '한국전력기술'."""
    s = re.sub(r"\s*(\(주\)|㈜|주식회사)\s*$", "", (name or "").strip())
    s = re.sub(r"^\s*(\(주\)|㈜|주식회사)\s*", "", s)
    return s.strip() or (name or "").strip()


def korean_name(sym, en):
    """한글 사명. 못 찾으면 영문명을 그대로 쓴다 — 목록이 비는 것보다 낫다."""
    code = sym.split(".")[0]
    row = kind_table().get(code)
    if row and has_hangul(row.get("name")):
        return strip_corp(row["name"]), "KIND"
    try:
        v = next((n for n in yahoo_names(sym, "ko") if has_hangul(n)), None)
    except Exception:                                       # noqa: BLE001
        v = None
    if v:
        return strip_corp(v), "야후(ko-KR)"
    return clean_en(en) or code, "영문명 그대로"


def english_name(sym, given):
    """영문 사명. 스크리너가 준 이름이 있으면 그것을, 없으면 야후에 영어로 물어본다."""
    given = clean_en(given)
    if given and not SYM_RE.match(given):
        return given
    try:
        v = next((n for n in yahoo_names(sym, "en") if not has_hangul(n)), None)
    except Exception:                                       # noqa: BLE001
        v = None
    return clean_en(v) or sym.split(".")[0]


# ---------------------------------------------------------------- 새 종목의 한글 자산

def make_keywords(sym, ko, en, sector, profile):
    """검색 키워드 — 업종 기본어 + 야후 업종 + KIND 주요제품에서 뽑은 말."""
    words = []

    def add(s):
        for w in re.split(r"[,\s·/()]+", str(s or "")):
            w = w.strip(" .,·")
            if len(w) >= 2 and w not in words and not re.fullmatch(r"[0-9.]+", w):
                words.append(w)

    add(SECTOR_WORDS.get(sector, ""))
    add(industry_ko(profile, sector))
    row = kind_table().get(sym.split(".")[0]) or {}
    add(row.get("product"))
    add(row.get("industry"))
    for w in desc_words(profile.get("desc") or profile.get("summary")):
        add(w)
    # 줄여 부르는 말('삼전' 같은 것)은 자동으로 짓지 않는다 — 사람이 KEYWORDS 에
    # 덧붙이면 된다. 어설프게 잘라 넣으면 검색에 걸리지 않는 말만 늘어난다.
    return " ".join(words[:14])


def make_profile_ko(sym, ko, en, sector, payload, rank):
    """기업 한눈에 — [주력사업 한 줄, 개요, 사업 키워드, 'auto'].

    **수집한 값만으로 쓴다.** 없는 사실은 문장에서 빼고 지어내지 않는다.
    네 번째 자리의 'auto' 는 사람이 쓴 글이 아니라는 표시이고, 화면이 그대로 밝힌다.
    """
    p = payload.get("profile") or {}
    q = payload.get("quote") or {}
    row = kind_table().get(sym.split(".")[0]) or {}
    ind = industry_ko(p, sector)
    market = "코스닥" if sym.endswith(".KQ") else "코스피"

    bits = []
    bits.append("%s 상장 %s 기업입니다." % (market, ind))
    if row.get("product"):
        bits.append("상장공시시스템에 적힌 주요제품은 %s입니다." % row["product"].strip(" ."))
    rev, opm = q.get("revenue"), q.get("opMargin")
    if rev:
        s = "최근 12개월 매출은 %s" % won(rev)
        if opm is not None:
            s += ", 영업이익률은 %.1f%%" % opm
        bits.append(s + "입니다.")
    if q.get("cap"):
        s = "시가총액은 %s" % won(q["cap"])
        if rank:
            s += "으로 국내 %d위" % rank
        bits.append(s + "입니다.")
    # 본사 소재지는 바로 아래 기본 정보 표에 그대로 있으므로 문장에 또 적지 않는다
    # (야후가 로마자로 주어 한글 문장에 어색하게 섞인다).
    if p.get("employees"):
        bits.append("임직원은 %s명입니다." % format(int(p["employees"]), ","))
    bits.append("이 문단은 사람이 쓴 요약이 아니라 수집한 값으로 지은 것입니다. "
                "사업 구조 설명은 아래 ‘영문 원문 개요’를 함께 보십시오.")

    tags = [ind]
    for s in (row.get("product") or "").split(","):
        s = s.strip()
        if s and s not in tags:
            tags.append(s)
    for w in desc_words(p.get("desc") or p.get("summary")) + SECTOR_WORDS.get(sector, "").split(" "):
        if w and w not in tags and len(tags) < 5:
            tags.append(w)

    head = ind if not row.get("industry") else "%s — %s" % (ind, row["industry"].strip())
    return [head[:60], " ".join(bits), ", ".join(tags[:5]), "auto"]


# ---------------------------------------------------------------- HTML 읽고 쓰기

def find_block(src, name):
    """var <name> = [ ... ] / { ... } 의 여는 괄호와 닫는 괄호 위치."""
    m = re.search(r"var %s = ([\[{])" % re.escape(name), src)
    if not m:
        raise SystemExit("kr-top100.html 에서 %s 를 찾지 못했다" % name)
    i = m.end() - 1
    op = src[i]
    cl = {"[": "]", "{": "}"}[op]
    depth = 0
    for j in range(i, len(src)):
        if src[j] == op:
            depth += 1
        elif src[j] == cl:
            depth -= 1
            if depth == 0:
                return i, j
    raise SystemExit("%s 블록의 끝을 찾지 못했다" % name)


def obj_entries(body):
    """객체 본문을 [(키, 값 원문)] 으로 나눈다. 값 원문은 손대지 않고 그대로 보존한다.

    사람이 쓴 문장을 다시 찍어 내면 따옴표·줄바꿈이 달라지므로, 고치지 않는 항목은
    원문 그대로 옮긴다.
    """
    lines = body.split("\n")
    out, key, buf = [], None, []
    for ln in lines:
        m = re.match(r"^  '([^']+)': (.*)$", ln)
        if m:
            if key is not None:
                out.append((key, "\n".join(buf)))
            key, buf = m.group(1), [m.group(2)]
        elif key is not None:
            buf.append(ln)
    if key is not None:
        out.append((key, "\n".join(buf)))
    return [(k, v.rstrip().rstrip(",")) for k, v in out if k]


def render_obj(entries):
    return "{\n" + ",\n".join("  '%s': %s" % (k, v) for k, v in entries) + "\n}"


def js_str(s):
    """작은따옴표 문자열 — 화면 파일의 표기에 맞춘다."""
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def companies_block(src):
    """COMPANIES 의 (머리 주석, [(심볼, 줄 원문)])."""
    i, j = find_block(src, "COMPANIES")
    body = src[i + 1:j]
    head, rows = [], []
    for ln in body.split("\n"):
        m = re.match(r"^  \['([^']+)',", ln)
        if m:
            rows.append((m.group(1), ln.rstrip().rstrip(",")))
        elif not rows and ln.strip():
            head.append(ln)
    return (i, j), "\n".join(head), rows


def company_line(sym, en, ko, sector):
    return "  [%s,%s,%s,%s]" % (js_str(sym), js_str(en), js_str(ko), js_str(sector))


# ---------------------------------------------------------------- 점검

def verify(src):
    """앞뒤가 맞는지 본다 — 어긋나면 이유를 돌려준다(빈 목록이면 통과)."""
    bad = []
    (_, _), _, rows = companies_block(src)
    syms = [s for s, _ in rows]
    if len(syms) != LIST_SIZE:
        bad.append("COMPANIES 가 %d개다(%d개여야 한다)" % (len(syms), LIST_SIZE))
    if len(set(syms)) != len(syms):
        dup = sorted({s for s in syms if syms.count(s) > 1})
        bad.append("COMPANIES 에 같은 종목이 두 번 있다 — " + ", ".join(dup))
    for s in syms:
        if not SYM_RE.match(s):
            bad.append("심볼 형태가 아니다 — " + s)

    i, j = find_block(src, "SECTORS")
    sectors = set(re.findall(r"^  (\w+):", src[i:j], re.M))
    for s, ln in rows:
        m = re.search(r",'(\w+)'\]$", ln) or re.search(r", *'(\w+)' *\]$", ln)
        if m and m.group(1) not in sectors:
            bad.append("%s 의 업종 코드 %s 가 SECTORS 에 없다" % (s, m.group(1)))

    for name in ("KEYWORDS", "PROFILE_KO"):
        i, j = find_block(src, name)
        keys = [k for k, _ in obj_entries(src[i + 1:j])]
        missing = [s for s in syms if s not in keys]
        extra = [k for k in keys if k not in syms]
        if missing:
            bad.append("%s 에 없는 종목 %d개 — %s" % (name, len(missing), ", ".join(missing[:8])))
        if extra:
            bad.append("%s 에 목록에 없는 종목 %d개 — %s" % (name, len(extra), ", ".join(extra[:8])))

    i, j = find_block(src, "CMP_PRESETS")
    for s in set(re.findall(r"'(\d{6}\.K[SQ])'", src[i:j])):
        if s not in syms:
            bad.append("기본 비교 조합이 목록에 없는 %s 를 가리킨다" % s)
    return bad


# ---------------------------------------------------------------- 교체 결정

def plan(rows, ranking):
    """무엇을 빼고 무엇을 넣을지 정한다. (나갈 것, 들어올 것, 사람이 읽을 설명)"""
    have = [s for s, _ in rows]
    our_rank = ranking.get("ourRanks") or {}
    cand = [a for a in (ranking.get("add") or [])
            if a.get("rank") and a["rank"] <= ADD_RANK and a["sym"] not in have]
    cand.sort(key=lambda a: a["rank"])

    # 나갈 후보 — 순위를 모르는 종목(상장폐지·합병·코드 변경)이 가장 먼저다
    unknown = [s for s in have if our_rank.get(s) is None]
    fallen = sorted([s for s in have if (our_rank.get(s) or 0) > DROP_RANK],
                    key=lambda s: -(our_rank.get(s) or 0))
    droppable = unknown + fallen

    n = min(len(cand), len(droppable), MAX_SWAP)
    notes = []
    if not cand:
        notes.append("%d위 안에 새로 들어온 종목이 없다" % ADD_RANK)
    if not droppable:
        notes.append("%d위 밖으로 밀린 종목이 없다" % DROP_RANK)
    if len(cand) > n or len(droppable) > n:
        notes.append("한 번에 %d종목까지만 바꾼다(후보 %d · 밀린 종목 %d)"
                     % (MAX_SWAP, len(cand), len(droppable)))
    return droppable[:n], cand[:n], notes


# ---------------------------------------------------------------- 새 종목 한 곳

def build_entry(a):
    """후보 한 종목의 목록 항목을 만든다. 하나라도 모자라면 None — 그 종목은 넣지 않는다.

    a = {"sym":…, "name": 스크리너가 준 영문명, "rank":…, "cap":…}
    """
    sym = a["sym"]
    print("\n  + %-11s %s (%s위) — 데이터 확인" % (sym, a.get("name") or "", a.get("rank")), flush=True)
    try:
        payload, status, _chart = F.fetch_one({"sym": sym, "en": clean_en(a.get("name")),
                                               "ko": a.get("name") or sym, "sector": "cons"})
    except Exception as e:                                  # noqa: BLE001
        print("    시세를 못 받았다 — %s (다음 주에 다시 본다)" % e, flush=True)
        return None
    if status.get("chart") is not True:
        print("    시세를 못 받았다 — %s (다음 주에 다시 본다)" % status.get("chart"), flush=True)
        return None
    profile = payload.get("profile") or {}
    if not (profile.get("industry") or profile.get("sector")):
        print("    기업 프로필이 비어 업종을 정할 수 없다 (다음 주에 다시 본다)", flush=True)
        return None
    ko, ko_src = korean_name(sym, a.get("name"))
    en = english_name(sym, a.get("name")) or ko
    sector, why = pick_sector(profile, ko, en)
    prof = make_profile_ko(sym, ko, en, sector, payload, a.get("rank"))
    kw = make_keywords(sym, ko, en, sector, profile)
    if not kw or not prof[1]:
        print("    키워드·개요를 짓지 못했다 (다음 주에 다시 본다)", flush=True)
        return None
    print("    한글명 %s (%s) · 영문명 %s" % (ko, ko_src, en), flush=True)
    print("    업종   %s (%s)" % (sector, why), flush=True)
    print("    키워드 %s" % kw, flush=True)
    print("    개요   %s" % prof[1], flush=True)
    return {"sym": sym, "en": en, "ko": ko, "sector": sector,
            "rank": a.get("rank"), "cap": a.get("cap"),
            "koSource": ko_src, "keywords": kw, "profile": prof}


def probe(syms):
    """목록은 건드리지 않고, 그 종목이 들어온다면 무엇이 적힐지 지어만 본다.

    새 후보의 한글명·업종 판정이 그럴듯한지 사람이 미리 보라고 둔 길이다.
    """
    F.init_crumb(rounds=2)
    kind_table()
    for sym in syms:
        build_entry({"sym": resolve(sym), "name": None, "rank": None, "cap": None})
    print("\n--probe 라 목록은 건드리지 않았다", flush=True)
    return 0


def resolve(v):
    """'052690' 처럼 코드만 줘도 되게 한다 — 시장 접미사(.KS/.KQ)는 야후 검색에서 얻는다.

    두 접미사를 차례로 찔러 보는 방법은 못 쓴다 — 야후가 상장되지 않은 쪽에도 빈 차트를
    돌려주는 일이 있어(039030.KS) 엉뚱한 시장으로 굳는다.
    """
    v = str(v).strip().upper()
    if SYM_RE.match(v) or not re.fullmatch(r"\d{6}", v):
        return v
    try:
        j = F.yget("/v1/finance/search?q=%s&quotesCount=10&newsCount=0" % v)
        for r in (j.get("quotes") or []):
            if SYM_RE.match(r.get("symbol") or "") and (r.get("symbol") or "").startswith(v + "."):
                return r["symbol"]
    except Exception as e:                                  # noqa: BLE001
        print("  %s 의 시장을 찾지 못했다 — %s" % (v, e), flush=True)
    return v + ".KS"


# ---------------------------------------------------------------- 본체

def main(argv=None):

    global MAX_SWAP, ADD_RANK, DROP_RANK
    ap = argparse.ArgumentParser(description="국내 100대 기업 대상 목록 주간 자동 갱신")
    ap.add_argument("--dry-run", action="store_true", help="무엇을 바꿀지만 적고 파일은 그대로 둔다")
    ap.add_argument("--check", action="store_true", help="지금 파일의 앞뒤가 맞는지만 본다")
    ap.add_argument("--probe", metavar="심볼[,심볼…]",
                    help="그 종목이 들어온다면 어떤 한글명·업종·키워드·개요가 될지 지어만 본다")
    ap.add_argument("--max-swap", type=int, default=MAX_SWAP, help="한 번에 바꿀 최대 종목 수")
    ap.add_argument("--add-rank", type=int, default=ADD_RANK, help="이 안에 들어와야 자리를 얻는다")
    ap.add_argument("--drop-rank", type=int, default=DROP_RANK, help="이 밖으로 밀려야 자리를 잃는다")
    args = ap.parse_args(argv)

    fetch_kr100.configure()
    src = open(F.PAGE, encoding="utf-8").read()

    bad = verify(src)
    if bad:
        for b in bad:
            print("::error::" + b)
        raise SystemExit("지금 화면 파일부터 앞뒤가 맞지 않는다 — 목록을 고치지 않는다")
    print("점검 통과: 목록 100종목 · 키워드·개요·기본 조합이 모두 맞는다", flush=True)
    if args.check:
        return 0
    if args.probe:
        return probe([s.strip() for s in args.probe.split(",") if s.strip()])
    MAX_SWAP, ADD_RANK, DROP_RANK = args.max_swap, args.add_rank, args.drop_rank
    if (ADD_RANK, DROP_RANK, MAX_SWAP) != (90, 110, 5):
        print("교체 기준: %d위 안이면 들어오고, %d위 밖이면 나간다(최대 %d종목)"
              % (ADD_RANK, DROP_RANK, MAX_SWAP), flush=True)

    rank_path = os.path.join(F.OUT_DIR, "ranking.json")
    try:
        ranking = json.load(open(rank_path, encoding="utf-8"))
    except Exception as e:                                  # noqa: BLE001
        print("::warning::목록 점검 결과를 읽지 못해 갱신을 건너뛴다 — %s" % e)
        return 0
    if ranking.get("movedTo") or not ranking.get("ourRanks"):
        print("::warning::목록 점검 결과가 아직 없다(안내 파일) — 갱신을 건너뛴다")
        return 0
    print("목록 점검 %s · 유니버스 %s종목" % (ranking.get("builtAt"), ranking.get("universe")), flush=True)

    (ci, cj), head, rows = companies_block(src)
    drops, adds, notes = plan(rows, ranking)
    for n in notes:
        print("  " + n, flush=True)
    if not adds:
        print("::notice::바꿀 것이 없다 — 목록을 그대로 둔다")
        write_change(ranking, [], [], notes)
        return 0

    ko_map = {s: (re.search(r",'([^']*)','\w+'\]$", ln).group(1)
                  if re.search(r",'([^']*)','\w+'\]$", ln) else s) for s, ln in rows}
    print("\n나갈 종목 %d · 들어올 종목 %d" % (len(drops), len(adds)), flush=True)
    for s in drops:
        print("  − %-11s %-16s 현재 %s위" % (s, ko_map.get(s, ""),
                                           (ranking.get("ourRanks") or {}).get(s) or "미확인"), flush=True)

    # 새 종목의 데이터를 실제로 받아 본다 — 받히지 않으면 넣지 않는다
    F.init_crumb(rounds=2)
    kind_table()
    accepted = [e for e in (build_entry(a) for a in adds) if e]

    if not accepted:
        print("::warning::들어올 종목의 데이터를 하나도 확인하지 못해 목록을 그대로 둔다")
        write_change(ranking, [], [], notes + ["새 종목의 데이터를 받지 못했다"])
        return 0

    drops = drops[:len(accepted)]                # 넣은 만큼만 뺀다 — 목록은 늘 100개
    src2 = apply_changes(src, drops, accepted, ranking)

    bad = verify(src2)
    if bad:
        for b in bad:
            print("::error::" + b)
        raise SystemExit("고친 결과가 앞뒤가 맞지 않는다 — 파일을 쓰지 않는다")

    if args.dry_run:
        print("\n--dry-run 이라 파일은 그대로 둔다", flush=True)
    else:
        with open(F.PAGE, "w", encoding="utf-8") as f:
            f.write(src2)
        print("\nkr-top100.html 갱신 — %d종목 교체" % len(accepted), flush=True)
    write_change(ranking, drops, accepted, notes, ko_map)
    summary(drops, accepted, ko_map)
    return 0


def sector_map(rows):
    out = {}
    for s, ln in rows:
        m = re.search(r",'(\w+)'\]$", ln)
        if m:
            out[s] = m.group(1)
    return out


def apply_changes(src, drops, accepted, ranking):
    """COMPANIES · KEYWORDS · PROFILE_KO · CMP_PRESETS 를 한꺼번에 고친다."""
    drop_set = set(drops)
    old_sector = sector_map(companies_block(src)[2])       # 빠지는 종목의 업종(조합 교체에 쓴다)

    # 1) COMPANIES — 뺄 것을 빼고 넣을 것을 넣은 뒤, 점검 시점 시총 순위로 다시 늘어놓는다
    (ci, cj), head, rows = companies_block(src)
    rows = [(s, ln) for s, ln in rows if s not in drop_set]
    for a in accepted:
        rows.append((a["sym"], company_line(a["sym"], a["en"], a["ko"], a["sector"])))
    rank = dict(ranking.get("ourRanks") or {})
    for a in accepted:
        rank[a["sym"]] = a.get("rank")
    rows.sort(key=lambda r: (rank.get(r[0]) is None, rank.get(r[0]) or 9999, r[0]))
    block = "[\n" + head + "\n" + ",\n".join(ln for _, ln in rows) + "\n]"
    src = src[:ci] + block + src[cj + 1:]

    # 2) KEYWORDS · PROFILE_KO — 뺀 종목의 항목을 지우고 새 종목의 항목을 덧붙인다.
    #    남는 항목의 원문은 손대지 않는다(사람이 쓴 문장이 그대로 남아야 한다).
    for name, new_val in (("KEYWORDS", lambda a: js_str(a["keywords"])),
                          ("PROFILE_KO", lambda a: "[%s,\n    %s,\n    %s, 'auto']"
                                                   % (js_str(a["profile"][0]), js_str(a["profile"][1]),
                                                      js_str(a["profile"][2])))):
        i, j = find_block(src, name)
        entries = [(k, v) for k, v in obj_entries(src[i + 1:j]) if k not in drop_set]
        entries += [(a["sym"], new_val(a)) for a in accepted]
        src = src[:i] + render_obj(entries) + src[j + 1:]

    # 3) 기본 비교 조합 — 빠진 종목이 남아 있으면 같은 업종의 다른 종목으로 바꾼다.
    #    그대로 두면 데이터 없는 칩이 조합에 남는다(2026-09 에 실제로 겪은 일이다).
    i, j = find_block(src, "CMP_PRESETS")
    preset = src[i:j + 1]
    if drop_set & set(re.findall(r"'(\d{6}\.K[SQ])'", preset)):
        # 남은 목록에서 같은 업종의 다른 종목을 시총 순위대로 고른다
        by_sector = {}
        for s, sec in sector_map(companies_block(src)[2]).items():
            by_sector.setdefault(sec, []).append(s)
        lines = preset.split("\n")
        for n, line in enumerate(lines):
            for s in sorted(drop_set & set(re.findall(r"'(\d{6}\.K[SQ])'", line))):
                used = set(re.findall(r"'(\d{6}\.K[SQ])'", line))
                alt = next((x for x in by_sector.get(old_sector.get(s), []) if x not in used), None)
                if alt:
                    line = line.replace("'%s'" % s, "'%s'" % alt)
                else:
                    line = re.sub(r",\s*'%s'" % re.escape(s), "", line)
                    line = re.sub(r"'%s',\s*" % re.escape(s), "", line)
                print("  기본 비교 조합: %s → %s" % (s, alt or "빼냄"), flush=True)
            if len(re.findall(r"'(\d{6}\.K[SQ])'", line)) == 1:
                print("::warning::기본 비교 조합에 종목이 하나만 남았다 — %s" % line.strip())
            lines[n] = line
        src = src[:i] + "\n".join(lines) + src[j + 1:]
    return src


def write_change(ranking, drops, accepted, notes, ko_map=None):
    """무엇을 왜 바꿨는지 남긴다 — 데이터 브랜치에 함께 올라가고 요약이 읽는다."""
    ko_map = ko_map or {}
    out = {
        "builtAt": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
                   .isoformat().replace("+00:00", "Z"),
        "rule": {"addRank": ADD_RANK, "dropRank": DROP_RANK, "maxSwap": MAX_SWAP},
        "rankingAt": (ranking or {}).get("builtAt"),
        "changed": len(accepted),
        "notes": notes,
        "removed": [{"sym": s, "ko": ko_map.get(s, s),
                     "rank": ((ranking or {}).get("ourRanks") or {}).get(s)} for s in drops],
        "added": [{"sym": a["sym"], "ko": a["ko"], "en": a["en"], "sector": a["sector"],
                   "rank": a["rank"], "cap": a["cap"], "koSource": a["koSource"],
                   "autoProfile": True} for a in accepted],
        "note": ("주간 자동 갱신(scripts/update_kr100_list.py)이 남긴 기록이다. "
                 "새로 들어온 종목의 한글 개요는 수집한 값으로 지은 것이고, "
                 "화면에 '자동 작성'으로 밝힌다."),
    }
    os.makedirs(F.OUT_DIR, exist_ok=True)
    with open(os.path.join(F.OUT_DIR, "list-change.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))


def summary(drops, accepted, ko_map):
    lines = ["| 나간 종목 | 들어온 종목 | 업종 | 순위 | 한글명 출처 |", "|---|---|---|---|---|"]
    for s, a in zip(drops, accepted):
        lines.append("| `%s` %s | `%s` %s | %s | %s위 | %s |"
                     % (s.split(".")[0], ko_map.get(s, ""), a["sym"].split(".")[0], a["ko"],
                        a["sector"], a["rank"], a["koSource"]))
    msg = "대상 목록 %d종목 교체" % len(accepted)
    print("::notice::" + msg)
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with io.open(path, "a", encoding="utf-8") as f:
            f.write("### 주간 목록 자동 갱신\n\n" + msg + "\n\n" + "\n".join(lines) +
                    "\n\n새로 들어온 종목의 한글 개요는 수집한 값으로 지은 것입니다"
                    "(화면에 '자동 작성'으로 밝힙니다). 문장을 사람이 고치려면 "
                    "`kr-top100.html` 의 `PROFILE_KO` 에서 네 번째 자리의 `'auto'` 를 지우면 됩니다.\n")


if __name__ == "__main__":
    raise SystemExit(main())
