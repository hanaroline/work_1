#!/usr/bin/env python3
"""장 마감 시세를 모아 data/market/ 아래에 JSON으로 저장한다.

이 스크립트는 GitHub Actions 러너에서 돈다. 브리핑을 만드는 Claude 세션은
사내 이그레스 정책 때문에 KRX·네이버·야후에 직접 붙지 못하므로, 러너가 대신
받아 저장소에 커밋하고 세션은 커밋된 파일을 읽는다.

원천이 하나 죽어도 나머지는 그대로 저장한다. 각 원천의 성공/실패는 결과
JSON의 "sources" 에 남기므로, 브리핑은 무엇이 확보됐고 무엇이 비었는지
그대로 알 수 있다.
"""

import html as html_mod
import csv
import io
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")
TIMEOUT = 20

# 지수·환율·원자재 — 야후 심볼
YAHOO_INDEX = {
    "kospi": "^KS11", "kosdaq": "^KQ11", "usdkrw": "KRW=X",
    "sp500": "^GSPC", "nasdaq": "^IXIC", "dow": "^DJI", "sox": "^SOX",
    "vix": "^VIX", "dxy": "DX-Y.NYB", "usdjpy": "JPY=X",
    "wti": "CL=F", "brent": "BZ=F", "gold": "GC=F",
    # ^IRX 는 2년물이 아니라 13주(3개월)물이다. 2년물은 야후에 지수 심볼이 없어
    # 미 재무부 원본 곡선으로 따로 받는다. 아래는 야후에 실제로 있는 만기만 적는다.
    "ust10y": "^TNX", "ust3m": "^IRX", "ust5y": "^FVX", "ust30y": "^TYX",
    # --- 아래는 모닝 브리핑용 (07:00 KST 시점에 미국장이 끝나 있고 선물이 열려 있다) ---
    "russell": "^RUT", "silver": "SI=F", "copper": "HG=F", "natgas": "NG=F",
    "nikkei": "^N225", "hangseng": "^HSI", "shanghai": "000001.SS", "taiwan": "^TWII",
    "eurostoxx": "^STOXX50E", "dax": "^GDAXI", "ftse": "^FTSE",
    "eurusd": "EURUSD=X", "usdcny": "CNY=X", "btc": "BTC-USD",
    # --- 토요일 해외 증시 브리핑용 ---
    # 유럽은 유로스톡스50(대형 50종목)만으로 부족하다. 기사에 가장 많이 나오는
    # 광의 지수는 STOXX 600 이고, 국가별로는 프랑스·이탈리아·스페인·스위스가
    # 빠지면 "유럽 증시" 라고 부르기 어렵다.
    "stoxx600": "^STOXX", "cac": "^FCHI", "ftsemib": "FTSEMIB.MI",
    "ibex": "^IBEX", "smi": "^SSMI", "aex": "^AEX",
    "sensex": "^BSESN", "asx200": "^AXJO",
    "eth": "ETH-USD", "platinum": "PL=F", "usdtwd": "TWD=X", "gbpusd": "GBPUSD=X",
    # 지수선물 — 브리핑을 쓰는 시각에 유일하게 살아 있는 미국 가격
    "sp500_fut": "ES=F", "nasdaq_fut": "NQ=F", "dow_fut": "YM=F", "russell_fut": "RTY=F",
    # 연방기금 금리선물 — 내재 정책금리(100 - 가격)를 계산해 인하 기대를 가늠한다
    "fedfunds_fut": "ZQ=F",
}

# 미국 업종 — S&P500 섹터 ETF. 국내 개장 전 어느 업종에 돈이 붙었는지 본다.
YAHOO_US_SECTORS = {
    "기술": "XLK", "금융": "XLF", "에너지": "XLE", "헬스케어": "XLV",
    "임의소비재": "XLY", "필수소비재": "XLP", "산업재": "XLI", "소재": "XLB",
    "유틸리티": "XLU", "부동산": "XLRE", "커뮤니케이션": "XLC",
}

# 국내 반도체·수출주와 직접 엮이는 미국 종목
YAHOO_US_STOCKS = {
    "엔비디아": "NVDA", "애플": "AAPL", "마이크로소프트": "MSFT",
    "브로드컴": "AVGO", "AMD": "AMD", "마이크론": "MU", "TSMC": "TSM",
    "알파벳": "GOOGL", "아마존": "AMZN", "메타": "META", "테슬라": "TSLA",
    "ASML": "ASML",
}

# 유럽 대형주 — 유럽 증시가 왜 올랐는지/내렸는지를 종목으로 설명하려면 필요하다.
# 접미사가 거래소를 가리킨다: .DE 프랑크푸르트, .PA 파리, .AS 암스테르담,
# .L 런던, .SW 취리히, .MI 밀라노, .CO 코펜하겐.
YAHOO_EU_STOCKS = {
    "SAP": "SAP.DE", "인피니언": "IFX.DE", "지멘스": "SIE.DE",
    "ASML": "ASML.AS", "LVMH": "MC.PA", "로레알": "OR.PA",
    "네슬레": "NESN.SW", "노보노디스크": "NOVO-B.CO",
    "쉘": "SHEL.L", "아스트라제네카": "AZN.L", "HSBC": "HSBA.L",
    "노바티스": "NOVN.SW",
}

# 일본 대형주 — 접미사 .T 는 도쿄증권거래소다. 통화는 엔.
# 도쿄일렉트론·어드반테스트·신에쓰화학은 국내 반도체 장비·소재와 직접 겹치는
# 비교군이라 반도체 얘기를 할 때 같이 봐야 한다.
YAHOO_JP_STOCKS = {
    "도요타": "7203.T", "소니": "6758.T", "도쿄일렉트론": "8035.T",
    "어드반테스트": "6857.T", "소프트뱅크그룹": "9984.T", "키엔스": "6861.T",
    "미쓰비시UFJ": "8306.T", "패스트리테일링": "9983.T",
    "히타치": "6501.T", "신에쓰화학": "4063.T",
}

# 중국 대형주 — 홍콩 상장은 .HK(통화 HKD), 본토는 상하이 .SS / 선전 .SZ(통화 CNY).
# 같은 회사가 양쪽에 상장된 경우가 있어 어느 시장 값인지 반드시 밝혀야 한다.
YAHOO_CN_STOCKS = {
    "텐센트": "0700.HK", "알리바바": "9988.HK", "BYD": "1211.HK",
    "샤오미": "1810.HK", "메이투안": "3690.HK", "SMIC": "0981.HK",
    "중국건설은행": "0939.HK", "중국해양석유": "0883.HK",
    "귀주모태": "600519.SS", "CATL": "300750.SZ",
}

# 종목 한 줄 설명 — 표에 이름만 있으면 고객 응대에서 "이 회사가 뭐 하는 곳이냐"
# 를 매번 다시 찾게 된다. 시세와 함께 내보내 브리핑이 그대로 쓰게 한다.
# 시황이 아니라 사업 내용이다. 실적·주가 전망은 여기 넣지 않는다 —
# 그런 것은 날마다 바뀌고, 이 표는 바뀌지 않는 것만 담는다.
STOCK_NOTES = {
    # --- 국내 ---
    "삼성전자": ("메모리·파운드리·스마트폰. 코스피 시총 1위",
              "Memory, foundry and handsets; largest KOSPI constituent"),
    "SK하이닉스": ("D램·낸드. HBM 시장 선두권, 엔비디아 주요 공급사",
                "DRAM and NAND; a leader in HBM and a key Nvidia supplier"),
    "LG에너지솔루션": ("이차전지 셀. 완성차에 배터리 공급",
                  "Battery cells supplied to global automakers"),
    "삼성바이오로직스": ("바이오의약품 위탁생산(CDMO) 세계 최대급",
                   "One of the world's largest biologics CDMOs"),
    "현대차": ("완성차. 미국·인도 판매 비중이 큼",
            "Automaker with heavy exposure to the US and India"),
    "KB금융": ("은행 중심 금융지주. 금리에 실적이 직결",
             "Bank-led financial group; earnings track interest rates"),
    "한화에어로스페이스": ("항공엔진·방산. 유럽 수출 확대",
                    "Aero engines and defence; expanding European exports"),
    "삼성전기": ("MLCC·반도체 기판. 삼성전자 공급망",
              "MLCCs and semiconductor substrates; Samsung supply chain"),
    "NAVER": ("검색·커머스·핀테크. 국내 최대 인터넷 기업",
              "Search, commerce and fintech; Korea's largest internet firm"),
    "셀트리온": ("바이오시밀러. 미국·유럽 처방 확대",
              "Biosimilars, with prescriptions growing in the US and Europe"),
    # --- 미국 ---
    "엔비디아": ("AI 가속기(GPU) 사실상 표준. HBM 최대 수요처",
              "The de facto standard in AI accelerators; largest HBM buyer"),
    "애플": ("아이폰 중심. 서비스 매출 비중 확대",
           "iPhone-centred, with a growing services mix"),
    "마이크로소프트": ("애저 클라우드·오피스. AI 인프라 대규모 투자",
                 "Azure cloud and Office; a major AI infrastructure spender"),
    "브로드컴": ("맞춤형 AI 칩(ASIC)·네트워크 반도체",
              "Custom AI silicon (ASICs) and networking chips"),
    "AMD": ("CPU·AI 가속기. 엔비디아의 대항마",
            "CPUs and AI accelerators; Nvidia's main challenger"),
    "마이크론": ("미국 유일의 대형 D램 업체. HBM에서 국내 업체와 경쟁",
              "The only large US DRAM maker; competes with Korea in HBM"),
    "TSMC": ("세계 1위 파운드리. 엔비디아·애플 칩을 위탁생산",
             "The largest foundry; makes Nvidia and Apple silicon"),
    "알파벳": ("구글 검색·유튜브·클라우드. 자체 AI 칩(TPU) 보유",
            "Google search, YouTube and cloud; builds its own TPUs"),
    "아마존": ("전자상거래 + AWS 클라우드",
            "E-commerce plus AWS cloud"),
    "메타": ("페이스북·인스타그램. AI 인프라 투자 확대",
           "Facebook and Instagram; scaling AI infrastructure"),
    "테슬라": ("전기차·에너지저장. 자율주행 기대가 밸류에이션에 반영",
            "EVs and energy storage; valuation carries autonomy expectations"),
    "ASML": ("EUV 노광장비 독점. 첨단 반도체 생산의 병목",
             "Monopoly in EUV lithography; the bottleneck in leading-edge chips"),
    # --- 유럽 ---
    "SAP": ("기업용 소프트웨어(ERP). 유럽 최대 IT 기업",
            "Enterprise software (ERP); Europe's largest tech company"),
    "인피니언": ("차량용·전력 반도체",
             "Automotive and power semiconductors"),
    "지멘스": ("산업 자동화·전력 설비",
            "Industrial automation and power equipment"),
    "LVMH": ("루이비통·디올 등 명품. 중국 소비에 민감",
             "Louis Vuitton and Dior; sensitive to Chinese consumption"),
    "로레알": ("화장품 세계 1위",
            "The world's largest cosmetics group"),
    "네슬레": ("세계 최대 식품기업",
            "The world's largest food company"),
    "노보노디스크": ("비만·당뇨 치료제(위고비·오젬픽)",
                "Obesity and diabetes drugs (Wegovy, Ozempic)"),
    "쉘": ("석유·가스 메이저. 유가에 연동",
          "Oil and gas major; moves with crude"),
    "아스트라제네카": ("항암제 중심 제약",
                 "Pharma, weighted to oncology"),
    "HSBC": ("아시아 비중이 큰 영국계 은행",
             "UK-listed bank with heavy Asian exposure"),
    "노바티스": ("스위스 제약. 항암·심혈관",
             "Swiss pharma; oncology and cardiovascular"),
    # --- 일본 ---
    "도요타": ("세계 판매 1위 완성차. 하이브리드 강세",
            "The world's biggest carmaker by volume; strong in hybrids"),
    "소니": ("이미지센서·게임·엔터. 스마트폰 카메라 센서 1위",
           "Image sensors, games and entertainment; leads phone camera sensors"),
    "도쿄일렉트론": ("반도체 장비. 국내 장비주의 직접 비교군",
                "Semiconductor equipment; the comparable for Korean toolmakers"),
    "어드반테스트": ("반도체 검사장비. HBM 수요에 민감",
                "Chip test equipment; sensitive to HBM demand"),
    "소프트뱅크그룹": ("투자지주. 암(Arm) 최대 주주",
                  "Investment holding company; Arm's largest shareholder"),
    "키엔스": ("공장 자동화 센서. 높은 이익률로 유명",
            "Factory-automation sensors, known for very high margins"),
    "미쓰비시UFJ": ("일본 최대 금융그룹. 금리 인상 수혜",
                 "Japan's largest banking group; benefits from higher rates"),
    "패스트리테일링": ("유니클로 모회사",
                 "Owner of Uniqlo"),
    "히타치": ("전력·철도·IT 인프라",
            "Power, rail and IT infrastructure"),
    "신에쓰화학": ("반도체 웨이퍼 세계 1위",
               "The world's largest supplier of silicon wafers"),
    # --- 중국 ---
    "텐센트": ("위챗·게임. 중국 최대 인터넷 기업",
            "WeChat and games; China's largest internet company"),
    "알리바바": ("전자상거래·클라우드",
             "E-commerce and cloud"),
    "BYD": ("전기차 판매 세계 최대급. 배터리를 자체 생산",
            "Among the world's largest EV sellers; makes its own batteries"),
    "샤오미": ("스마트폰·가전에서 전기차로 확장",
            "Phones and appliances, expanding into EVs"),
    "메이투안": ("배달·생활 서비스 플랫폼",
             "Food delivery and local-services platform"),
    "SMIC": ("중국 최대 파운드리. 미국 수출규제 대상",
             "China's largest foundry; subject to US export controls"),
    "중국건설은행": ("4대 국유은행의 하나. 부동산 대출 비중이 큼",
                "One of the big four state banks; large property loan book"),
    "중국해양석유": ("해양 원유·가스 개발",
                "Offshore oil and gas exploration and production"),
    "귀주모태": ("백주(마오타이) 1위. 중국 소비심리의 대표 지표",
             "The top baijiu maker; a bellwether for Chinese consumption"),
    "CATL": ("세계 1위 배터리 제조사. 국내 배터리사의 최대 경쟁자",
             "The world's largest battery maker; Korea's chief rival"),
}


def attach_note(name, quote):
    """시세에 회사 한 줄 설명을 붙인다. 없으면 조용히 넘어간다."""
    note = STOCK_NOTES.get(name)
    if note and quote:
        quote["note_ko"], quote["note_en"] = note
    return quote


# 시가총액 상위 — 야후는 코스피 종목에 .KS, 코스닥에 .KQ 를 쓴다
YAHOO_STOCKS = {
    "삼성전자": "005930.KS", "SK하이닉스": "000660.KS",
    "LG에너지솔루션": "373220.KS", "삼성바이오로직스": "207940.KS",
    "현대차": "005380.KS", "KB금융": "105560.KS",
    "한화에어로스페이스": "012450.KS", "삼성전기": "009150.KS",
    "셀트리온": "068270.KS", "NAVER": "035420.KS",
}


def _get(url, data=None, headers=None, referer=None, encoding="utf-8", timeout=None):
    """finance.naver.com 계열은 EUC-KR 이므로 encoding='cp949' 로 부른다."""
    h = {"User-Agent": UA, "Accept": "*/*",
         "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    if referer:
        h["Referer"] = referer
    if headers:
        h.update(headers)
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=h)
    with urllib.request.urlopen(req, timeout=timeout or TIMEOUT) as r:
        return r.read().decode(encoding, "replace")


def _text(fragment):
    return html_mod.unescape(re.sub(r"<[^>]*>", " ", fragment)).replace("\xa0", " ").strip()


def _num(x):
    return round(x, 4) if isinstance(x, float) else x


def yahoo_quote(symbol):
    """일봉 2개를 받아 종가·전일대비·OHLC·거래량을 만든다."""
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol) + "?range=5d&interval=1d")
    j = json.loads(_get(url))
    res = j["chart"]["result"][0]
    meta = res["meta"]
    q = res["indicators"]["quote"][0]
    ts = res["timestamp"]

    # 마지막으로 종가가 있는 인덱스
    idx = [i for i, c in enumerate(q["close"]) if c is not None]
    if not idx:
        raise ValueError("no close data")
    last = idx[-1]
    prev = idx[-2] if len(idx) > 1 else None

    close = q["close"][last]
    prev_close = q["close"][prev] if prev is not None else meta.get("chartPreviousClose")
    change = close - prev_close if prev_close else None
    return {
        "symbol": symbol,
        "date": datetime.fromtimestamp(ts[last], KST).strftime("%Y-%m-%d"),
        "close": _num(close),
        "open": _num(q["open"][last]),
        "high": _num(q["high"][last]),
        "low": _num(q["low"][last]),
        "volume": q["volume"][last],
        "prev_close": _num(prev_close),
        "change": _num(change),
        "change_pct": _num(change / prev_close * 100) if prev_close else None,
        "currency": meta.get("currency"),
    }


def naver_sectors():
    """업종별 등락률 — 네이버 업종 시세 페이지(EUC-KR HTML)를 파싱한다."""
    s = _get("https://finance.naver.com/sise/sise_group.naver?type=upjong",
             referer="https://finance.naver.com/", encoding="cp949")
    out = []
    for row in re.findall(r"<tr>(.*?)</tr>", s, re.S):
        m = re.search(r"sise_group_detail[^>]*>(.*?)</a>", row, re.S)
        if not m:
            continue
        pct = re.search(r"([+\-]?\d+\.\d+)%", row)
        if not pct:
            continue
        out.append({"name": _text(m.group(1)), "change_pct": float(pct.group(1))})
    if not out:
        raise ValueError("업종 행을 찾지 못함")
    out.sort(key=lambda d: d["change_pct"], reverse=True)
    return out


def _investor_urls(now):
    """bizdate 없이 부르면 표 껍데기(1.6KB)만 오므로 날짜를 붙여 부른다."""
    base = "https://finance.naver.com/sise/investorDealTrendDay.naver"
    days = [(now - timedelta(days=i)).strftime("%Y%m%d") for i in range(0, 5)]
    return ["%s?bizdate=%s&sosok=" % (base, d) for d in days]


def naver_investors(now, dump_dir=None):
    """투자자별 매매동향 — 개인/외국인/기관 순매수, 단위 억원.

    페이지 구조가 바뀌면 파싱이 빗나가므로, 실패 시 원본 HTML을 남겨
    다음 실행 때 무엇을 봐야 하는지 알 수 있게 한다.
    """
    errors = []
    for n_url, url in enumerate(_investor_urls(now)):
        try:
            s = _get(url, referer="https://finance.naver.com/sise/", encoding="cp949")
        except Exception as e:                                # noqa: BLE001
            errors.append("%s -> %s" % (url.split("?")[0][-32:], e))
            continue

        out = []
        for row in re.findall(r"<tr[^>]*>(.*?)</tr>", s, re.S):
            cells = [c for c in
                     (_text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)) if c]
            if len(cells) < 4:
                continue
            # 첫 칸이 날짜인 행만 (YY.MM.DD 또는 YYYY.MM.DD)
            if not re.match(r"^\d{2,4}\.\d{2}\.\d{2}$", cells[0]):
                continue

            def n(x):
                x = x.replace(",", "").replace("+", "").strip()
                try:
                    return int(x)
                except ValueError:
                    return None

            vals = [n(c) for c in cells[1:4]]
            if all(v is None for v in vals):
                continue
            out.append({"date": cells[0], "retail": vals[0],
                        "foreign": vals[1], "institution": vals[2],
                        "unit": "억원", "source_url": url})
        if out:
            return out[:6]
        errors.append("%s -> 날짜 행 없음(%d bytes)" % (url.split("?")[0][-32:], len(s)))
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            fn = os.path.join(dump_dir, "investors_try%d.html" % n_url)
            with open(fn, "w", encoding="utf-8") as f:
                f.write(s[:400000])
    raise ValueError(" | ".join(errors))



def _first_int(text, label, window=40):
    """라벨 뒤 window 글자 안에서 첫 정수를 뽑는다. 마크업이 아니라 텍스트를 본다."""
    i = text.find(label)
    if i < 0:
        return None
    m = re.search(r"([\d][\d,]*)", text[i + len(label): i + len(label) + window])
    return int(m.group(1).replace(",", "")) if m else None


def _first_float(text, label, window=40):
    i = text.find(label)
    if i < 0:
        return None
    m = re.search(r"([\d]+\.[\d]+)", text[i + len(label): i + len(label) + window])
    return float(m.group(1)) if m else None


def _signed(text, label):
    """라벨 뒤에서 부호 있는 정수를 뽑는다. 예: '외국인 -8,651 억'."""
    m = re.search(re.escape(label) + r"\s*([+\-\u2212]?[\d,]+)", text)
    if not m:
        return None
    v = m.group(1).replace(",", "").replace("\u2212", "-").lstrip("+")
    try:
        return int(v)
    except ValueError:
        return None


def _rate(text, *label_words):
    """공백이 들쭉날쭉한 라벨을 느슨하게 찾아 실수를 뽑는다."""
    pat = r"\s*".join(re.escape(w) for w in label_words) + r"\s*([\d,]+\.[\d]+)"
    m = re.search(pat, text)
    return float(m.group(1).replace(",", "")) if m else None


def naver_market_page(code, dump_dir=None):
    """sise_index.naver 한 장에서 네 가지를 한 번에 뽑는다.

    등락 종목 수, 투자자별 매매동향, 프로그램 매매동향, 장중 고저.
    code 는 KOSPI 또는 KOSDAQ.
    """
    url = "https://finance.naver.com/sise/sise_index.naver?code=%s" % code
    s = _get(url, referer="https://finance.naver.com/sise/", encoding="cp949")
    t = re.sub(r"\s+", " ", _text(s))

    breadth = {}
    for label, key in (("상한종목수", "limit_up"), ("상승종목수", "advancing"),
                       ("보합종목수", "unchanged"), ("하락종목수", "declining"),
                       ("하한종목수", "limit_down")):
        v = _signed(t, label)
        if v is not None:
            breadth[key] = v

    flows = {}
    if "투자자별 매매동향" in t:
        seg = t[t.index("투자자별 매매동향"):]
        for label, key in (("개인", "retail"), ("외국인", "foreign"),
                           ("기관", "institution")):
            v = _signed(seg, label)
            if v is not None:
                flows[key] = v

    program = {}
    if "프로그램 매매동향" in t:
        pseg = t[t.index("프로그램 매매동향"):]
        # '차익' 은 '비차익' 의 일부이므로 앞에 '비' 가 없는 경우만 잡는다
        m = re.search(r"(?<!비)차익\s*([+\-\u2212]?[\d,]+)", pseg)
        if m:
            program["arb"] = int(m.group(1).replace(",", "").replace("\u2212", "-").lstrip("+"))
        for label, key in (("비차익", "non_arb"), ("전체", "total")):
            v = _signed(pseg, label)
            if v is not None:
                program[key] = v

    out = {"source_url": url, "unit": "억원"}
    if breadth:
        out["breadth"] = breadth
    if flows:
        out["investor_flows"] = flows
    if program:
        out["program_trading"] = program
    hi, lo = _rate(t, "장중최고"), _rate(t, "장중최저")
    if hi and lo:
        out["intraday"] = {"high": hi, "low": lo}
    y_hi, y_lo = _rate(t, "52주최고"), _rate(t, "52주최저")
    if y_hi and y_lo:
        out["fifty_two_week"] = {"high": y_hi, "low": y_lo}

    if len(out) <= 2:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "market_%s.html" % code), "w",
                      encoding="utf-8") as f:
                f.write(s[:400000])
        raise ValueError("아무 항목도 못 찾음 (%d bytes)" % len(s))
    return out


BOND_LABELS = (
    (("CD금리", "(91일)"), "cd91"),
    (("콜", "금리"), "call"),
    (("국고채", "(3년)"), "ktb3y"),
    (("회사채", "(3년)"), "corp3y"),
    (("COFIX", "잔액"), "cofix_balance"),
    (("COFIX", "신규취급액"), "cofix_new"),
)
KTB10Y_URLS = [
    "https://finance.naver.com/marketindex/interestDetail.naver?marketindexCd=IRR_GOVT10Y",
    "https://kr.investing.com/rates-bonds/south-korea-10-year-bond-yield",
]


def naver_rates(dump_dir=None):
    """국내 시장금리 — 네이버 시장지표의 국내시장금리 표."""
    url = "https://finance.naver.com/marketindex/"
    s = _get(url, referer="https://finance.naver.com/", encoding="cp949")
    t = re.sub(r"\s+", " ", _text(s))
    out = {}
    for words, key in BOND_LABELS:
        v = _rate(t, *words)
        if v is not None and 0 < v < 20:
            out[key] = v
    if not out:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "rates.html"), "w", encoding="utf-8") as f:
                f.write(s[:400000])
        raise ValueError("금리 라벨 없음 (%d bytes)" % len(s))
    out["source_url"] = url
    out["unit"] = "%"

    # 국고채 10년은 이 표에 없다. 후보를 따로 시도하고 실패해도 넘어간다.
    for n, u10 in enumerate(KTB10Y_URLS):
        try:
            s10 = _get(u10, referer="https://finance.naver.com/marketindex/",
                       encoding="cp949" if "naver" in u10 else "utf-8")
        except Exception as e:                                # noqa: BLE001
            out.setdefault("ktb10y_errors", []).append("%s -> %s" % (u10[-34:], e))
            continue
        t10 = re.sub(r"\s+", " ", _text(s10))
        v = _rate(t10, "국고채", "(10년)") or _rate(t10, "10년")
        if v and 0 < v < 20:
            out["ktb10y"] = v
            out["ktb10y_source"] = u10
            break
        out.setdefault("ktb10y_errors", []).append(
            "%s -> 값 없음(%d bytes)" % (u10[-34:], len(s10)))
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "ktb10y_try%d.html" % n), "w",
                      encoding="utf-8") as f:
                f.write(s10[:300000])
    return out


LIMIT_URLS = {
    "upper": ["https://finance.naver.com/sise/sise_upper.naver"],
    "lower": ["https://finance.naver.com/sise/sise_lower.naver"],
}


def naver_limit_names(kind, dump_dir=None):
    """상한가·하한가 종목명. kind 는 'upper' 또는 'lower'."""
    errors = []
    for n, url in enumerate(LIMIT_URLS[kind]):
        try:
            s = _get(url, referer="https://finance.naver.com/sise/", encoding="cp949")
        except Exception as e:                                # noqa: BLE001
            errors.append("%s -> %s" % (url[-24:], e))
            continue
        names, seen = [], set()
        for m in re.finditer(r'/item/main\.naver\?code=(\d{6})"[^>]*>([^<]+)</a>', s):
            code, name = m.group(1), _text(m.group(2))
            if name and code not in seen:
                seen.add(code)
                names.append({"code": code, "name": name})
        if names:
            return {"names": names[:40], "count": len(names), "source_url": url}
        # 해당 종목이 하나도 없는 날은 링크가 없는 것이 정상이다.
        # 페이지가 온전히 내려왔으면 0건으로 처리하고, 껍데기만 왔으면 실패로 본다.
        if len(s) > 20000:
            return {"names": [], "count": 0, "source_url": url,
                    "note": "해당 종목 없음"}
        errors.append("%s -> 종목 링크 없음(%d bytes)" % (url[-24:], len(s)))
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "limit_%s_try%d.html" % (kind, n)), "w",
                      encoding="utf-8") as f:
                f.write(s[:300000])
    raise ValueError(" | ".join(errors))


def yahoo_intraday_at(symbol, target_date, hhmm="15:30"):
    """KST 특정 시각의 5분봉 종가. 유가·금의 '국내 마감 시점' 값을 만든다."""
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol) + "?range=5d&interval=5m")
    j = json.loads(_get(url))
    res = j["chart"]["result"][0]
    q = res["indicators"]["quote"][0]
    ts = res["timestamp"]
    hh, mm = (int(x) for x in hhmm.split(":"))
    best, best_gap = None, None
    for i, t in enumerate(ts):
        if q["close"][i] is None:
            continue
        dt = datetime.fromtimestamp(t, KST)
        if dt.strftime("%Y-%m-%d") != target_date:
            continue
        gap = abs((dt.hour * 60 + dt.minute) - (hh * 60 + mm))
        if best_gap is None or gap < best_gap:
            best, best_gap = (dt, q["close"][i]), gap
    if best is None or best_gap > 30:
        raise ValueError("%s: %s %s 부근 5분봉 없음" % (symbol, target_date, hhmm))
    return {"symbol": symbol, "at_kst": best[0].strftime("%Y-%m-%d %H:%M"),
            "close": _num(best[1]), "minutes_off": best_gap}


def naver_usdkrw():
    """네이버 시장지표의 미국 USD 매매기준율 — 원/달러 두 번째 출처."""
    s = _get("https://finance.naver.com/marketindex/",
             referer="https://finance.naver.com/", encoding="cp949")
    t = re.sub(r"\s+", " ", _text(s))
    m = re.search(r"미국\s*USD\s*([\d,]+\.[\d]+)", t)
    if not m:
        raise ValueError("미국 USD 라벨 없음 (%d bytes)" % len(s))
    return {"rate": float(m.group(1).replace(",", "")),
            "source_url": "https://finance.naver.com/marketindex/",
            "note": "매매기준율"}


ECOS = "https://ecos.bok.or.kr/api/%s/sample/json/kr/1/10/%s"


def ecos_rates(now, dump_dir=None):
    """한국은행 ECOS 일별 시장금리(817Y002).

    샘플 인증키는 호출당 10건까지만 허용한다. 그래서 항목 목록을 먼저 받아
    국고채 계열 코드를 찾은 뒤, 항목별로 최근 10영업일을 따로 부른다.
    """
    end = now.strftime("%Y%m%d")
    start = (now - timedelta(days=12)).strftime("%Y%m%d")

    # 1) 항목 코드 목록
    items = {}
    try:
        j = json.loads(_get(ECOS % ("StatisticItemList", "817Y002"), timeout=60))
        for row in (j.get("StatisticItemList", {}) or {}).get("row", []):
            items[row.get("ITEM_NAME", "")] = row.get("ITEM_CODE", "")
    except Exception as e:                                    # noqa: BLE001
        items = {}
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "ecos_items_err.txt"), "w",
                      encoding="utf-8") as f:
                f.write(str(e))

    # 목록에서 못 찾으면 널리 쓰이는 코드를 후보로 쓴다.
    #
    # 010320000 은 AA- 가 아니라 BBB- 다. 예전에 이 코드를 "회사채(3년,AA-)" 로
    # 적어 뒀는데, ECOS 가 돌려주는 항목명은 "회사채(3년, BBB-)" 이고 값도
    # 10.246% 로 네이버의 AA-(4.44%)와 6%p 가까이 벌어진다. 라벨만 믿고 쓰면
    # 브리핑에 "회사채 AA- 10.25%" 가 나간다. AA- 는 코드를 확신할 수 없으므로
    # 후보값 없이 항목목록에서만 찾고, 못 찾으면 조용히 빼는 대신 오류로 남긴다
    # (네이버 rates_kr.corp3y 가 AA- 를 채우고 있다).
    wanted = {"ktb1y": ("국고채(1년)", "010190000"),
              "ktb3y": ("국고채(3년)", "010200000"),
              "ktb5y": ("국고채(5년)", "010200001"),
              "ktb10y": ("국고채(10년)", "010210000"),
              "corp3y": ("회사채(3년,BBB-)", "010320000"),
              "corp3y_aa": ("회사채(3년,AA-)", None),
              "cd91": ("CD(91일)", "010502000")}

    def _norm(t):
        """항목명 비교용 — ECOS 는 "회사채(3년, BBB-)" 처럼 공백을 섞어 준다."""
        return (t or "").replace(" ", "")

    out, tried, errs = {}, {}, []
    for key, (name, fallback) in wanted.items():
        head, grade = name.split("(")[0], _norm(name.split("(")[1].rstrip(")"))
        code = next((c for n, c in items.items()
                     if head in n and grade in _norm(n)), fallback)
        if code is None:
            errs.append("%s -> 항목목록에서 %s 를 찾지 못했다" % (key, name))
            continue
        url = ECOS % ("StatisticSearch",
                      "817Y002/D/%s/%s/%s" % (start, end, code))
        tried[key] = code
        try:
            j = json.loads(_get(url, timeout=60))
        except Exception as e:                                # noqa: BLE001
            errs.append("%s(%s) -> %s" % (key, code, e))
            continue
        rows = (j.get("StatisticSearch", {}) or {}).get("row", [])
        if not rows:
            errs.append("%s(%s) -> %s" % (key, code,
                        json.dumps(j, ensure_ascii=False)[:160]))
            continue
        last = rows[-1]
        # 코드가 기대한 항목을 돌려줬는지 확인한다. 등급이 다른 계열을 받아
        # 놓고 라벨만 우리 것으로 붙이면 틀린 값이 조용히 브리핑까지 간다.
        if grade and grade not in _norm(last.get("ITEM_NAME1")):
            errs.append("%s(%s) -> 항목명 불일치: 기대 %s, 응답 %s"
                        % (key, code, grade, last.get("ITEM_NAME1")))
            continue
        try:
            # 전 거래일 값도 같이 남긴다. 모닝 브리핑은 지난 거래일을 다루므로
            # 최신치만 있으면 "묵은 값"으로 적을 수밖에 없다.
            series = []
            for r in rows:
                try:
                    series.append({"date": r.get("TIME"),
                                   "value": float(r["DATA_VALUE"])})
                except (KeyError, ValueError, TypeError):
                    continue
            out[key] = {"value": float(last["DATA_VALUE"]),
                        "date": last.get("TIME"),
                        "item": last.get("ITEM_NAME1"), "code": code,
                        "series": series[-10:]}
        except (KeyError, ValueError, TypeError):
            continue
    if not out:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "ecos_debug.json"), "w",
                      encoding="utf-8") as f:
                json.dump({"items_found": items, "codes_tried": tried,
                           "errors": errs}, f, ensure_ascii=False, indent=2)
        raise ValueError("ECOS 실패 (항목목록 %d건) — %s" % (len(items), " | ".join(errs)[:400]))
    out["source"] = "한국은행 ECOS 817Y002 (샘플 인증키)"
    return out


def krx_futures_investors(now, dump_dir=None):
    """선물 투자자별 거래실적 — KRX OTP 발급 후 CSV 내려받는 정식 경로."""
    d = now.strftime("%Y%m%d")
    gen = "http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd"
    dl = "http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd"
    ref = "http://data.krx.co.kr/contents/MDC/MDI/mainChart/index.cmd"
    params = {"locale": "ko_KR", "trdDd": d, "prodId": "KRDRVFUK2I",
              "mktTpCd": "T", "share": "1", "money": "1", "csvxls_isNo": "false",
              "name": "fileDown", "url": "dbms/MDC/STAT/standard/MDCSTAT12502"}
    otp = _get(gen + "?" + urllib.parse.urlencode(params), referer=ref).strip()
    if not otp or "<" in otp[:20]:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "krx_otp.txt"), "w", encoding="utf-8") as f:
                f.write(otp[:20000])
        raise ValueError("OTP 발급 실패 (%d bytes)" % len(otp))
    csv = _get(dl, data={"code": otp}, referer=ref, encoding="cp949")
    rows = [r for r in csv.splitlines() if r.strip()]
    if len(rows) < 2:
        raise ValueError("CSV 행 없음 (%d bytes)" % len(csv))
    return {"header": rows[0], "rows": rows[1:20], "trdDd": d}


def naver_money_flow(dump_dir=None):
    """증시자금동향 — 고객예탁금·신용잔고·펀드 설정액.

    반대매매 금액은 이 표에 없다(금투협 통계 소관). 신용잔고는 결제일 기준이라
    당일 종가 대비 하루이틀 늦게 실린다. 그래서 날짜를 값과 같이 돌려준다.
    """
    html = _get("https://finance.naver.com/sise/sise_deposit.naver", encoding="cp949")
    tbl = re.search(r"(?is)<table[^>]*>(?:(?!</table>).)*?증시자금동향.*?</table>", html)
    if not tbl:
        tbl = re.search(r"(?is)<table.*?</table>", html)
    rows = []
    for tr in re.findall(r"(?is)<tr[^>]*>.*?</tr>", tbl.group(0) if tbl else html):
        cells = []
        for c in re.findall(r"(?is)<t[dh][^>]*>(.*?)</t[dh]>", tr):
            c = re.sub(r"&nbsp;?", " ", re.sub(r"(?s)<[^>]+>", " ", c))
            cells.append(re.sub(r"\s+", " ", c).strip())
        if len(cells) >= 11 and re.match(r"^\d\d\.\d\d\.\d\d$", cells[0]):
            rows.append(cells)
    if not rows:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "deposit.html"), "w", encoding="utf-8") as f:
                f.write(html[:400000])
        raise ValueError("증시자금동향 행 없음 (%d bytes)" % len(html))

    def n(x):
        try:
            return float(x.replace(",", ""))
        except ValueError:
            return None

    series = []
    for r in rows[:10]:
        y, m, d = r[0].split(".")
        series.append({
            "date": "20%s-%s-%s" % (y, m, d),
            "deposit": n(r[1]), "deposit_chg": n(r[2]),          # 고객예탁금
            "credit_balance": n(r[3]), "credit_chg": n(r[4]),    # 신용잔고
            "fund_equity": n(r[5]), "fund_mixed": n(r[7]), "fund_bond": n(r[9]),
        })
    return {"unit": "억원", "latest": series[0], "series": series,
            "source_url": "https://finance.naver.com/sise/sise_deposit.naver",
            "note": "신용잔고는 결제일 기준이라 종가일보다 1~2영업일 늦게 반영된다"}


_FUT_SENT = re.compile(r"[^.。\n]{0,110}선물[^.。\n]{0,150}?(?:계약|억원)[^.。\n]{0,60}")
_CREDIT_SENT = re.compile(
    r"[^.。\n]{0,90}(?:반대매매|미수금|신용거래융자|신용융자|예탁금)[^.。\n]{0,140}")


def naver_news(now, limit=24):
    """그날 증시 기사 본문을 받아 둔다.

    브리핑 세션은 사내 이그레스 정책 때문에 언론사 사이트에 직접 못 붙는다.
    검색 요약 대신 원문을 인용할 수 있도록 본문과 URL을 같이 저장한다.
    선물 수급·신용융자처럼 시세 화면에 없는 수치도 여기서 건진다.
    """
    lst = _get("https://finance.naver.com/news/mainnews.naver?date="
               + now.strftime("%Y-%m-%d"), encoding="cp949")
    links = []
    for aid, oid, title in re.findall(
            r'article_id=(\d+)[^"]*?office_id=(\d+)[^"]*"[^>]*>\s*([^<]{4,90})', lst):
        url = "https://n.news.naver.com/mnews/article/%s/%s" % (oid, aid)
        if url not in [u for _, u in links]:
            links.append((_text(title).strip(), url))
    if not links:
        raise ValueError("기사 목록 없음 (%d bytes)" % len(lst))

    arts, fut, credit = [], [], []
    for title, url in links[:limit]:
        try:
            body = _text(_get(url, referer="https://finance.naver.com/"))
        except Exception:                                          # noqa: BLE001
            continue
        # 네이버 뉴스 껍데기(메뉴·안내문)를 걷어내고 기사 몸통만 남긴다
        i = body.find("기사원문")
        core = body[i:] if i > 0 else body
        arts.append({"title": title, "url": url, "chars": len(core),
                     "body": core[:6000]})
        for m in _FUT_SENT.finditer(core):
            s = m.group(0).strip()
            if re.search(r"[\d,]{3,}\s*계약", s) or "선물시장" in s:
                fut.append({"title": title, "url": url, "sentence": s[:300]})
        for m in _CREDIT_SENT.finditer(core):
            s = m.group(0).strip()
            if re.search(r"\d", s) and "본문 바로가기" not in s:
                credit.append({"title": title, "url": url, "sentence": s[:300]})
    return {"date": now.strftime("%Y-%m-%d"), "count": len(arts),
            "articles": arts, "futures_mentions": fut[:8],
            "credit_mentions": credit[:8]}


def treasury_yields(now):
    """미 국채 수익률 곡선 — 미 재무부가 직접 내는 CSV. 인증키가 필요 없다.

    야후에는 2년물 지수 심볼이 없다(^IRX 는 3개월물이다). 2년물은 모닝 브리핑에서
    연준 경로를 이야기할 때 반드시 쓰는 값이다. FRED 는 러너에서 계속 끊겨
    재무부 원본을 쓴다. 전 만기가 한 번에 오고 연중 일별 이력까지 들어 있어
    전일 대비와 10년-2년 스프레드를 직접 계산할 수 있다.
    """
    year = now.strftime("%Y")
    csv_text = _get(
        "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/"
        "daily-treasury-rates.csv/%s/all?type=daily_treasury_yield_curve"
        "&field_tdr_date_value=%s&page&_format=csv" % (year, year), timeout=50)
    rows = list(csv.reader(io.StringIO(csv_text)))
    if len(rows) < 2:
        raise ValueError("재무부 CSV 행 없음 (%d bytes)" % len(csv_text))
    head = [h.strip() for h in rows[0]]
    want = {"ust1m": "1 Mo", "ust3m": "3 Mo", "ust6m": "6 Mo", "ust1y": "1 Yr",
            "ust2y": "2 Yr", "ust3y": "3 Yr", "ust5y": "5 Yr", "ust7y": "7 Yr",
            "ust10y": "10 Yr", "ust20y": "20 Yr", "ust30y": "30 Yr"}

    def parse(row):
        d = dict(zip(head, [c.strip() for c in row]))
        out = {}
        for key, col in want.items():
            try:
                out[key] = float(d[col])
            except (KeyError, ValueError):
                pass
        raw = d.get(head[0], "")
        try:                                        # 08/07/2026 -> 2026-08-07
            mm, dd, yy = raw.split("/")
            out["date"] = "%s-%s-%s" % (yy, mm, dd)
        except ValueError:
            out["date"] = raw
        return out

    # 최신 행이 맨 위다. 전일 대비를 내려면 두 줄이 필요하다.
    latest = parse(rows[1])
    prev = parse(rows[2]) if len(rows) > 2 else {}
    if "ust2y" not in latest or "ust10y" not in latest:
        raise ValueError("2년물/10년물 없음: %s" % head[:14])
    res = {"unit": "%", "date": latest["date"], "prev_date": prev.get("date"),
           "curve": {k: v for k, v in latest.items() if k != "date"},
           "prev_curve": {k: v for k, v in prev.items() if k != "date"},
           "source_url": "https://home.treasury.gov (Daily Treasury Yield Curve)"}
    res["change_bp"] = {
        k: round((latest[k] - prev[k]) * 100)
        for k in want if k in latest and k in prev}
    res["spread_10y_2y_bp"] = round((latest["ust10y"] - latest["ust2y"]) * 100)
    res["inverted"] = res["spread_10y_2y_bp"] < 0
    return res


def naver_index_daily(code, pages=2):
    """지수 일별시세 — 날짜별 종가·거래량·거래대금.

    야후는 거래대금을 주지 않는다. 주간 기준선을 잡거나 지난 거래일 수치를
    되짚을 때(모닝 브리핑은 전 거래일을 다룬다) 이 이력이 필요하다.
    """
    rows = []
    for page in range(1, pages + 1):
        s = _get("https://finance.naver.com/sise/sise_index_day.naver?code=%s&page=%d"
                 % (code, page), referer="https://finance.naver.com/sise/",
                 encoding="cp949")
        for tr in re.findall(r"(?is)<tr[^>]*>.*?</tr>", s):
            cells = [c for c in (_text(c) for c in
                                 re.findall(r"(?is)<td[^>]*>(.*?)</td>", tr)) if c]
            if len(cells) < 6 or not re.match(r"^\d{4}\.\d{2}\.\d{2}$", cells[0]):
                continue

            def n(x):
                try:
                    return float(x.replace(",", "").replace("%", "").replace("+", ""))
                except ValueError:
                    return None

            rows.append({
                "date": cells[0].replace(".", "-"),
                "close": n(cells[1]),
                "change_pct": n(cells[3]),
                "volume_k_shares": n(cells[4]),      # 천주
                "value_mn_krw": n(cells[5]),         # 백만원
            })
    if not rows:
        raise ValueError("일별시세 행 없음")
    seen, uniq = set(), []
    for r in rows:
        if r["date"] not in seen:
            seen.add(r["date"])
            uniq.append(r)
    return {"code": code, "unit": {"volume": "천주", "value": "백만원"},
            "series": uniq[:20],
            "source_url": "https://finance.naver.com/sise/sise_index_day.naver?code=" + code}


def naver_vkospi():
    """VKOSPI — 코스피200 변동성지수. 야후에 없어 네이버 모바일에서 받는다."""
    errors = []
    for code in ("VKOSPI", "VKOSPI200"):
        try:
            j = json.loads(_get(
                "https://m.stock.naver.com/api/index/%s/integration" % code,
                referer="https://m.stock.naver.com/"))
        except Exception as e:                                     # noqa: BLE001
            errors.append("%s -> %s" % (code, str(e)[:40]))
            continue
        info = {t.get("code"): t.get("value") for t in j.get("totalInfos") or []}
        if not info:
            errors.append("%s -> totalInfos 없음" % code)
            continue

        def n(x):
            try:
                return float(str(x).replace(",", ""))
            except (TypeError, ValueError):
                return None

        return {"code": code, "name": j.get("stockName"),
                "prev_close": n(info.get("lastClosePrice")),
                "open": n(info.get("openPrice")), "high": n(info.get("highPrice")),
                "low": n(info.get("lowPrice")),
                "source_url": "https://m.stock.naver.com/api/index/%s/integration" % code}
    raise ValueError(
        "네이버는 VKOSPI 를 취급하지 않는다(지수 코드가 KOSPI/KOSDAQ/FUT/KPI100/"
        "KPI200/KVALUE 뿐). 야후 미수록, 인베스팅 403, stooq 자바스크립트 차단. "
        "KRX 오픈API 무료 인증키(KRX_AUTH_KEY)를 넣으면 열린다. 시도: "
        + "; ".join(errors))


def naver_futures(dump_dir=None):
    """코스피200 선물 — 시세와 투자자별 순매수.

    데스크톱 네이버에는 선물 투자자별 화면이 없다. 모바일 쪽 JSON 에만 있다.
    단위: `dealTrendInfo` 는 억원이다. 같은 필드를 코스피 현물에서 부르면
    개인 +2,675 / 외국인 -8,651 / 기관 +5,854 가 나오는데, 이는
    investorDealTrendDay.naver 가 "(단위:억원)" 이라고 못박아 둔 값과 같다.
    선물 화면에는 단위 표기가 없어 이 대조로 정한 것이다.
    """
    j = json.loads(_get("https://m.stock.naver.com/api/index/FUT/integration",
                        referer="https://m.stock.naver.com/"))
    d = j.get("dealTrendInfo") or {}
    if not d.get("bizdate"):
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "futures.json"), "w", encoding="utf-8") as f:
                json.dump(j, f, ensure_ascii=False)
        raise ValueError("dealTrendInfo 없음")

    def n(x):
        try:
            return float(str(x).replace(",", "").replace("+", ""))
        except ValueError:
            return None

    info = {t.get("code"): t.get("value") for t in j.get("totalInfos") or []}
    vol = n(info.get("accumulatedTradingVolume"))
    val = n(re.sub(r"[^\d.]", "", info.get("accumulatedTradingValue") or ""))
    prev = n(info.get("lastClosePrice"))
    out = {
        "bizdate": d["bizdate"], "month": j.get("month"),
        "investors": {"retail": n(d.get("personalValue")),
                      "foreign": n(d.get("foreignValue")),
                      "institution": n(d.get("institutionalValue"))},
        "investor_unit": "억원",
        "prev_close": prev, "open": n(info.get("openPrice")),
        "high": n(info.get("highPrice")), "low": n(info.get("lowPrice")),
        "volume_contracts": vol, "value_mn_krw": val,
        "source_url": "https://m.stock.naver.com/api/index/FUT/integration",
    }
    # 대금 / 거래량 / 지수 로 승수를 되짚어 자료가 서로 맞는지 확인해 둔다
    if vol and val and prev:
        out["implied_multiplier"] = round(val * 1e6 / vol / prev)
    return out


def krx_openapi(now, key=None):
    """KRX 공식 오픈API. 인증키가 있으면 선물 투자자별을 정식으로 받는다.

    키가 없으면 서버가 무엇을 요구하는지 그대로 기록해 둔다 — 남은 공백이
    '막혀서'가 아니라 '키 한 장이 없어서'임을 눈으로 확인할 수 있게.
    """
    url = ("https://data-dbg.krx.co.kr/svc/apis/drv/fut_bydd_trd?basDd="
           + now.strftime("%Y%m%d"))
    body = _get(url, headers={"AUTH_KEY": key} if key else None, timeout=30)
    j = json.loads(body)
    rows = j.get("OutBlock_1")
    if not rows:
        raise ValueError("응답에 자료 없음: %s" % json.dumps(j, ensure_ascii=False)[:200])
    return {"rows": rows[:40], "basDd": now.strftime("%Y%m%d")}


def krx_json(bld, **params):
    """KRX 정보데이터시스템 JSON 엔드포인트."""
    p = {"bld": bld, "locale": "ko_KR", "csvxls_isNo": "false"}
    p.update(params)
    j = json.loads(_get(
        "https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd",
        data=p, referer="https://data.krx.co.kr/contents/MDC/MDI/mainChart/index.cmd",
        headers={"X-Requested-With": "XMLHttpRequest",
                 "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                 "Origin": "https://data.krx.co.kr"}))
    rows = j.get("OutBlock_1") or j.get("output") or j.get("block1")
    if not rows:
        raise ValueError("빈 응답: keys=%s" % list(j)[:6])
    return rows


def run(label, fn, *a, **k):
    """원천 하나를 시도하고 (값, 상태) 를 돌려준다. 실패해도 죽지 않는다."""
    try:
        v = fn(*a, **k)
        return v, {"ok": True}
    except urllib.error.HTTPError as e:
        return None, {"ok": False, "error": "HTTP %s" % e.code}
    except Exception as e:                                    # noqa: BLE001
        return None, {"ok": False, "error": "%s: %s" % (type(e).__name__, e)}


def main():
    now = datetime.now(KST)
    out = {
        "generated_at_kst": now.strftime("%Y-%m-%d %H:%M:%S"),
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
        "sources": {},
        "indices": {},
        "stocks": {},
    }

    for name, sym in YAHOO_INDEX.items():
        v, st = run(name, yahoo_quote, sym)
        if v:
            out["indices"][name] = v
        out["sources"]["yahoo:" + name] = st

    for name, sym in YAHOO_STOCKS.items():
        v, st = run(name, yahoo_quote, sym)
        if v:
            out["stocks"][name] = attach_note(name, v)
        out["sources"]["yahoo:" + sym] = st

    # 미국 업종 ETF · 미국 개별 종목 — 모닝 브리핑에서 국내 개장 전 흐름을 본다
    for name, sym in YAHOO_US_SECTORS.items():
        v, st = run(name, yahoo_quote, sym)
        out["sources"]["yahoo:sector:" + sym] = st
        if v:
            out.setdefault("us_sectors", {})[name] = v
    for name, sym in YAHOO_US_STOCKS.items():
        v, st = run(name, yahoo_quote, sym)
        out["sources"]["yahoo:us:" + sym] = st
        if v:
            out.setdefault("us_stocks", {})[name] = attach_note(name, v)
    for name, sym in YAHOO_EU_STOCKS.items():
        v, st = run(name, yahoo_quote, sym)
        out["sources"]["yahoo:eu:" + sym] = st
        if v:
            out.setdefault("eu_stocks", {})[name] = attach_note(name, v)
    for name, sym in YAHOO_JP_STOCKS.items():
        v, st = run(name, yahoo_quote, sym)
        out["sources"]["yahoo:jp:" + sym] = st
        if v:
            out.setdefault("jp_stocks", {})[name] = attach_note(name, v)
    for name, sym in YAHOO_CN_STOCKS.items():
        v, st = run(name, yahoo_quote, sym)
        out["sources"]["yahoo:cn:" + sym] = st
        if v:
            out.setdefault("cn_stocks", {})[name] = attach_note(name, v)

    # 미 국채 — 야후에 2년물 심볼이 없어 재무부 원본 곡선을 받는다
    v, st = run("treasury", treasury_yields, now)
    out["sources"]["treasury:curve"] = st
    if v:
        out["rates_us"] = v

    # 지수 일별시세 — 거래대금은 야후에 없고, 전 거래일을 되짚을 때 필요하다
    for code in ("KOSPI", "KOSDAQ"):
        v, st = run("daily", naver_index_daily, code)
        out["sources"]["naver:daily:" + code] = st
        if v:
            out.setdefault("index_daily", {})[code.lower()] = v

    # VKOSPI — 야후에 없다
    v, st = run("vkospi", naver_vkospi)
    out["sources"]["naver:vkospi"] = st
    if v:
        out["vkospi"] = v

    # 연방기금 금리선물에서 시장이 보는 정책금리를 되짚는다 (내재금리 = 100 - 가격)
    ff = out["indices"].get("fedfunds_fut")
    if ff and ff.get("close"):
        out["fed_implied"] = {
            "contract_price": ff["close"],
            "implied_rate_pct": round(100 - ff["close"], 4),
            "note": "해당 결제월의 평균 연방기금금리 기대치. 현 정책금리와 비교해 인하 기대를 읽는다",
            "source": "CBOT 30일 연방기금 금리선물 (ZQ=F)",
        }

    # 네이버 — 야후에 없는 업종별 등락률과 투자자별 수급
    v, st = run("sectors", naver_sectors)
    out["sources"]["naver:sectors"] = st
    if v:
        out["sectors"] = {"all": v, "top5": v[:5], "bottom5": v[-5:]}

    v, st = run("investors", naver_investors, now, "data/market/raw")
    out["sources"]["naver:investors"] = st
    if v:
        out["investors_kospi"] = v

    # 지수 페이지 한 장에서 등락 종목 수·투자자별·프로그램 매매·장중 고저
    for code in ("KOSPI", "KOSDAQ"):
        v, st = run("market", naver_market_page, code, "data/market/raw")
        out["sources"]["naver:market:" + code] = st
        if v:
            out.setdefault("market_internals", {})[code.lower()] = v

    # 국내 시장금리
    v, st = run("rates", naver_rates, "data/market/raw")
    out["sources"]["naver:rates"] = st
    if v:
        out["rates_kr"] = v

    # 유가·금의 국내 마감(15:30 KST) 시점 값 — 5분봉에서 뽑는다
    kd = (out.get("indices", {}).get("kospi") or {}).get("date")
    if kd:
        for name, sym in (("wti", "CL=F"), ("brent", "BZ=F"), ("gold", "GC=F")):
            v, st = run(name, yahoo_intraday_at, sym, kd, "15:30")
            out["sources"]["yahoo:1530:" + name] = st
            if v:
                out.setdefault("at_kr_close", {})[name] = v

    # 원/달러 두 번째 출처
    v, st = run("usdkrw2", naver_usdkrw)
    out["sources"]["naver:usdkrw"] = st
    if v:
        out["usdkrw_naver"] = v

    # 국고채 만기별 — 한국은행 ECOS
    v, st = run("ecos", ecos_rates, now, "data/market/raw")
    out["sources"]["ecos:rates"] = st
    if v:
        out["rates_ecos"] = v
        for key in ("ktb1y", "ktb5y", "ktb10y"):
            if key in v:
                out.setdefault("rates_kr", {})[key] = v[key]["value"]

    # 선물 투자자별 — KRX OTP 정식 경로
    v, st = run("futures", krx_futures_investors, now, "data/market/raw")
    out["sources"]["krx:futures_investors"] = st
    if v:
        out["futures_investors"] = v

    # 선물 투자자별 — 데스크톱에는 없고 모바일 JSON 에만 있다
    v, st = run("futures_naver", naver_futures, "data/market/raw")
    out["sources"]["naver:futures"] = st
    if v:
        out["futures"] = v

    # 증시자금동향 — 고객예탁금·신용잔고
    v, st = run("moneyflow", naver_money_flow, "data/market/raw")
    out["sources"]["naver:money_flow"] = st
    if v:
        out["money_flow"] = v

    # 그날 증시 기사 본문 — 시세 화면에 없는 수치(선물 수급·반대매매)를 여기서 건진다
    v, st = run("news", naver_news, now)
    out["sources"]["naver:news"] = st
    if v:
        out["news"] = v

    # KRX 공식 오픈API — 인증키(KRX_AUTH_KEY)가 있으면 선물 투자자별이 열린다
    v, st = run("krx_openapi", krx_openapi, now, os.environ.get("KRX_AUTH_KEY"))
    out["sources"]["krx:openapi"] = st
    if v:
        out["krx_futures"] = v

    # 상한가·하한가 종목명 (개수는 market_internals.breadth 에 있다)
    for kind in ("upper", "lower"):
        v, st = run("limit", naver_limit_names, kind, "data/market/raw")
        out["sources"]["naver:limit:" + kind] = st
        if v:
            out.setdefault("limit_names", {})[kind] = v

    # KRX — 러너 IP를 막는 것으로 보인다(400 -> 헤더 보강 후 403).
    # 한 번만 시도해 상태를 기록하고, 실패해도 나머지 원천으로 진행한다.
    v, st = run("allstocks", krx_json, "dbms/MDC/STAT/standard/MDCSTAT01501",
                mktId="ALL", trdDd=now.strftime("%Y%m%d"), share="1", money="1")
    out["sources"]["krx:allstocks"] = st
    if v:
        out.setdefault("krx", {})["allstocks"] = v[:60]

    ok = sum(1 for s in out["sources"].values() if s["ok"])
    out["summary"] = {"sources_tried": len(out["sources"]), "sources_ok": ok}

    os.makedirs("data/market", exist_ok=True)
    stamp = now.strftime("%Y-%m-%d")
    for path in ("data/market/latest.json", "data/market/%s.json" % stamp):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)

    print("=== 원천별 결과 ===")
    for k, v in sorted(out["sources"].items()):
        print(("  OK   " if v["ok"] else "  FAIL ") + k
              + ("" if v["ok"] else "  <- " + v["error"]))
    print("\n%d/%d 성공" % (ok, len(out["sources"])))
    for k in ("kospi", "kosdaq", "usdkrw"):
        if k in out["indices"]:
            i = out["indices"][k]
            print("  %s %s  close=%s  chg=%s (%s%%)  vol=%s"
                  % (k, i["date"], i["close"], i["change"], i["change_pct"], i["volume"]))

    # 아무것도 못 받으면 실패로 끝내 워크플로가 빨갛게 뜨도록 한다
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
