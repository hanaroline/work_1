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
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone

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
    # 채권 변동성 — 주식의 VIX 에 해당한다. 금리가 내린 날 변동성까지 죽었으면
    # 안도이고, 금리는 내렸는데 변동성이 살아 있으면 관망이다. 둘은 다른 얘기다.
    "move": "^MOVE",
    # 지수선물 — 브리핑을 쓰는 시각에 유일하게 살아 있는 미국 가격
    "sp500_fut": "ES=F", "nasdaq_fut": "NQ=F", "dow_fut": "YM=F", "russell_fut": "RTY=F",
    # 연방기금 금리선물 — 내재 정책금리(100 - 가격)를 계산해 인하 기대를 가늠한다
    "fedfunds_fut": "ZQ=F",
    # 코스피200 현물 — 선물(naver_futures)에는 일별 계열이 없어 기간 수익률을
    # 낼 수 없다. 선물을 이야기할 때 되짚을 기준이 여기 있어야 한다.
    "kospi200": "^KS200",
}

# 값이 「가격」이 아니라 「금리(%)」인 심볼. 기간 변화를 수익률(%)이 아니라
# bp 로 낸다. 4.20 → 4.50 은 「+7.1%」가 아니라 「+30bp」다.
YIELD_SYMBOLS = {"^TNX", "^IRX", "^FVX", "^TYX"}

# 환율 — 달러 상대 통화쌍. 원화 크로스는 여기서 받지 않고 아래에서 **계산**한다.
# 국내에서 고시하는 원/엔·원/위안·원/유로가 실제로 그렇게 만들어진다(재정환율).
# 야후에 `JPYKRW=X` 같은 직접 심볼이 있기는 하나 호가가 얇고 결측이 잦다.
YAHOO_FX = {
    "usdbrl": "BRL=X",        # 브라질 국채를 든 고객이 실제로 보는 환율
    "audusd": "AUDUSD=X",
    "usdchf": "CHF=X",        # 안전자산 쏠림을 원화와 떼어 보는 대조군
    "usdinr": "INR=X",
    "usdvnd": "VND=X",
}

# 환율 표 — (키, 한글, 영문, 계산법, 배수, 설명)
#
# 계산법이 문자열이면 `indices`/`fx_pairs` 에서 그대로 가져온다. 튜플이면
# 원/달러에서 재정환율을 만든다: ("div", x) 는 원/달러 ÷ x, ("mul", x) 는 곱한다.
# 야후가 달러당 통화로 주는 쌍(JPY=X, CNY=X, BRL=X)은 나누고, 통화당 달러로
# 주는 쌍(EURUSD=X, AUDUSD=X, GBPUSD=X)은 곱한다.
#
# 배수는 **표시 단위**다. 원/엔은 1엔이 9.4원이라 자릿수가 안 맞는다. 국내는
# 100엔당으로 고시한다. 배수는 수준값에만 곱한다 — 등락률과 기간 수익률은
# 비율이라 배수에 영향받지 않는다.
FX_ROWS = [
    ("usdkrw", "원/달러", "KRW/USD", "usdkrw", 1,
     ("수입 물가와 외국인 수급을 동시에 흔드는 단일 변수",
      "The single variable that moves import prices and foreign flows at once")),
    ("jpykrw", "원/100엔", "KRW/100JPY", ("div", "usdjpy"), 100,
     ("엔 대비 원화. 일본 여행·엔화 예금과 수출 경쟁력이 함께 걸린다",
      "Won against yen — travel, yen deposits and export competitiveness")),
    ("cnykrw", "원/위안", "KRW/CNY", ("div", "usdcny"), 1,
     ("중국 경기와 원화가 같이 움직인다. 원화의 대리 통화로 읽힌다",
      "Won tracks the yuan; the won trades as a China proxy")),
    ("eurkrw", "원/유로", "KRW/EUR", ("mul", "eurusd"), 1,
     ("유럽 펀드·유로 표시 자산의 원화 환산값",
      "Won value of European funds and euro-denominated assets")),
    ("brlkrw", "원/헤알", "KRW/BRL", ("div", "usdbrl"), 1,
     ("브라질 국채 투자의 손익을 실제로 가르는 환율. 이자보다 크게 움직인다",
      "The rate that actually decides Brazilian bond P&L — it swings more than the coupon")),
    ("audkrw", "원/호주달러", "KRW/AUD", ("mul", "audusd"), 1,
     ("호주 자원·배당 상품의 환산 기준. 원자재 값과 같이 간다",
      "Conversion base for Australian resource and dividend products; tracks commodities")),
    ("dxy", "달러인덱스", "Dollar Index", "dxy", 1,
     ("주요 6개 통화 대비 달러. 원화가 약해진 것인지 달러가 세진 것인지 가른다",
      "Dollar against six majors — separates a weak won from a strong dollar")),
    ("eurusd", "유로/달러", "EUR/USD", "eurusd", 1,
     ("달러인덱스의 절반 이상을 차지한다. 사실상 달러의 반대편",
      "Over half the dollar index — effectively the other side of the dollar")),
    ("usdjpy", "달러/엔", "USD/JPY", "usdjpy", 1,
     ("일본은행 정책과 엔 캐리 자금의 방향계",
      "Barometer for BOJ policy and yen-carry money")),
    ("usdcny", "달러/위안", "USD/CNY", "usdcny", 1,
     ("인민은행 고시가 상단을 정한다. 위안 약세는 원화 약세로 옮는다",
      "PBOC fixing caps it; yuan weakness spills into the won")),
    ("usdbrl", "달러/헤알", "USD/BRL", "usdbrl", 1,
     ("헤알 자체의 강약. 원/헤알에서 원화 몫을 걷어낸 값",
      "The real's own strength, with the won's part stripped out")),
    ("gbpusd", "파운드/달러", "GBP/USD", "gbpusd", 1,
     ("영란은행 금리 경로가 실린다", "Carries the Bank of England rate path")),
    ("usdchf", "달러/스위스프랑", "USD/CHF", "usdchf", 1,
     ("위험회피의 온도계. 프랑이 세지면 돈이 숨는 중이다",
      "Risk-off thermometer — a strong franc means money is hiding")),
    ("usdtwd", "달러/대만달러", "USD/TWD", "usdtwd", 1,
     ("반도체 수출국 통화. 원화와 가장 비슷하게 움직인다",
      "The other semiconductor exporter's currency; the closest match to the won")),
    ("usdinr", "달러/루피", "USD/INR", "usdinr", 1,
     ("인도 펀드의 환 손익", "Currency P&L on India funds")),
    ("usdvnd", "달러/동", "USD/VND", "usdvnd", 1,
     ("베트남 펀드의 환 손익", "Currency P&L on Vietnam funds")),
]

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
    "LG전자": ("가전·TV·전장. 전장(차량 부품)이 성장축",
             "Appliances, TVs and auto parts; components are the growth engine"),
    "삼성에스디에스": ("IT 서비스·물류 BPO. 그룹 시스템 통합",
                 "IT services and logistics BPO; the group's systems integrator"),
    "SK스퀘어": ("SK하이닉스를 거느린 투자지주",
               "Investment holding company; SK hynix is its main asset"),
    "LG화학": ("석유화학·첨단소재. LG에너지솔루션 최대주주",
             "Petrochemicals and advanced materials; owns most of LG Energy Solution"),
    "삼성SDI": ("이차전지 셀·전자재료. 각형 배터리 중심",
              "Battery cells and electronic materials; focused on prismatic cells"),
    "POSCO홀딩스": ("철강 + 리튬·니켈 등 이차전지 소재 지주",
                 "Steel plus a battery-materials arm (lithium, nickel)"),
    "기아": ("완성차. 현대차그룹, 미국·유럽 판매 비중이 큼",
           "Automaker in the Hyundai group; large US and European sales"),
    "현대모비스": ("자동차 부품·모듈. 현대차·기아 공급",
               "Auto parts and modules supplied to Hyundai and Kia"),
    "신한지주": ("은행 중심 금융지주. KB금융과 1·2위 다툼",
              "Bank-led financial group; vies with KB for the top spot"),
    "하나금융지주": ("은행 중심 금융지주. 외환·기업금융 강점",
                "Bank-led financial group; strong in FX and corporate banking"),
    "우리금융지주": ("은행 비중이 가장 큰 금융지주. 증권업 재진출",
                "The most bank-weighted financial group; re-entering brokerage"),
    "메리츠금융지주": ("보험·증권 통합 지주. 높은 주주환원율",
                 "Insurance and brokerage holding company; high shareholder returns"),
    "삼성생명": ("국내 최대 생명보험사. 삼성전자 지분 보유",
              "Korea's largest life insurer; holds a stake in Samsung Electronics"),
    "삼성화재": ("국내 최대 손해보험사",
              "Korea's largest non-life insurer"),
    "HD현대중공업": ("조선. LNG선·특수선 수주 잔고가 실적을 좌우",
                 "Shipbuilding; LNG and naval order backlog drives earnings"),
    "두산에너빌리티": ("발전 설비. 원전·가스터빈, SMR 기대주",
                 "Power plant equipment; nuclear, gas turbines and SMRs"),
    "카카오": ("카카오톡 기반 플랫폼·핀테크·콘텐츠",
            "KakaoTalk-based platform, fintech and content"),
    "크래프톤": ("배틀그라운드 개발사. 해외 매출 비중이 높음",
             "Maker of PUBG; most revenue comes from overseas"),
    "SK텔레콤": ("이동통신 1위. 배당 매력이 큰 방어주",
              "The largest mobile carrier; a defensive, high-dividend name"),
    "삼성물산": ("건설·상사·패션. 삼성그룹 지배구조의 정점",
              "Construction, trading and fashion; top of the Samsung ownership chain"),
    "KT&G": ("담배·홍삼. 경기와 무관한 현금창출력",
             "Tobacco and red ginseng; cash generation independent of the cycle"),
    "SK이노베이션": ("정유·석유화학 + 배터리(SK온). 유가에 연동",
                 "Refining and chemicals plus batteries (SK On); tracks crude"),
    "한국전력": ("전력 독점 공급. 요금과 연료비 차이가 실적",
              "The electricity monopoly; earnings are the tariff-fuel cost gap"),
    "HMM": ("컨테이너 해운. 운임 지수에 실적이 직결",
            "Container shipping; earnings track freight rates"),
    "알테오젠": ("피하주사 전환 기술(ALT-B4) 라이선스. 코스닥 대표주",
              "Subcutaneous-conversion technology licensing; a KOSDAQ bellwether"),
    "에코프로비엠": ("이차전지 양극재. 하이니켈 중심",
                "Cathode materials for batteries, weighted to high-nickel"),
    "에코프로": ("에코프로비엠 등을 거느린 이차전지 소재 지주",
             "Battery-materials holding company; parent of Ecopro BM"),
    "HLB": ("항암 신약(리보세라닙) 개발. 허가 이벤트에 크게 움직임",
            "Oncology drug developer; moves sharply on regulatory events"),
    "리노공업": ("반도체 검사용 프로브핀. 높은 이익률",
              "Probe pins for chip testing; very high margins"),
    "레인보우로보틱스": ("협동로봇·휴머노이드. 삼성전자가 최대주주",
                   "Collaborative robots and humanoids; Samsung is top shareholder"),
    "펄어비스": ("검은사막 개발사. 신작 붉은사막에 기대",
             "Maker of Black Desert; hopes rest on Crimson Desert"),
    "실리콘투": ("K뷰티 화장품 역직구 유통. 미국 매출 급증",
             "Cross-border distributor of K-beauty; US sales growing fast"),
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
    # --- 미국 업종 ETF (S&P500 섹터) ---
    # 「기술이 올랐다」로는 응대가 안 된다. 무엇이 들어 있는 묶음인지 적어 둔다.
    "기술": ("S&P500 기술업종(XLK). 애플·MS·엔비디아가 큰 비중",
           "S&P 500 technology (XLK); Apple, Microsoft and Nvidia dominate"),
    "금융": ("S&P500 금융업종(XLF). 은행·보험·카드. 금리와 경기에 민감",
           "S&P 500 financials (XLF); banks, insurers and card networks"),
    "에너지": ("S&P500 에너지업종(XLE). 유가에 직접 연동",
            "S&P 500 energy (XLE); moves directly with crude"),
    "헬스케어": ("S&P500 헬스케어(XLV). 제약·의료기기·보험",
              "S&P 500 health care (XLV); pharma, devices and insurers"),
    "임의소비재": ("S&P500 경기소비재(XLY). 아마존·테슬라 비중이 큼",
                "S&P 500 consumer discretionary (XLY); Amazon and Tesla heavy"),
    "필수소비재": ("S&P500 필수소비재(XLP). 식품·생활용품. 대표적 방어업종",
                "S&P 500 consumer staples (XLP); the classic defensive sector"),
    "산업재": ("S&P500 산업재(XLI). 항공·기계·운송·방산",
            "S&P 500 industrials (XLI); aerospace, machinery and transport"),
    "소재": ("S&P500 소재업종(XLB). 화학·금속. 중국 경기에 민감",
           "S&P 500 materials (XLB); chemicals and metals, China-sensitive"),
    "유틸리티": ("S&P500 유틸리티(XLU). 전력·가스. 금리 내리면 유리",
              "S&P 500 utilities (XLU); benefits when rates fall"),
    "부동산": ("S&P500 부동산·리츠(XLRE). 금리에 가장 민감한 업종",
            "S&P 500 real estate (XLRE); the most rate-sensitive sector"),
    "커뮤니케이션": ("S&P500 커뮤니케이션(XLC). 알파벳·메타·넷플릭스",
                 "S&P 500 communication services (XLC); Alphabet, Meta, Netflix"),
    # --- 국내 상장 ETF ---
    "KODEX 200": ("코스피200을 그대로 따라가는 대표 지수 ETF",
                  "The benchmark ETF tracking the KOSPI 200"),
    "TIGER 200": ("코스피200 추종. KODEX 200과 같은 지수, 운용사만 다름",
                  "Also tracks the KOSPI 200; a different manager, same index"),
    "KODEX 코스닥150": ("코스닥150 추종. 중소형·바이오 비중이 큼",
                     "Tracks the KOSDAQ 150; heavy in small caps and biotech"),
    "KODEX 레버리지": ("코스피200 일간 수익률의 2배. 변동성이 크고 장기보유에 불리",
                    "Twice the KOSPI 200's daily move; unsuited to long holding"),
    "KODEX 200선물인버스2X": ("코스피200 일간 수익률의 -2배. 하락에 베팅하는 상품",
                          "Minus twice the KOSPI 200's daily move; a bearish bet"),
    "KODEX 반도체": ("국내 반도체 종목 묶음. 삼성전자·SK하이닉스 비중이 큼",
                  "A basket of Korean chip names, led by Samsung and SK hynix"),
    "TIGER 미국S&P500": ("미국 S&P500 추종. 환헤지를 하지 않아 환율도 같이 반영",
                      "Tracks the S&P 500 unhedged, so the won-dollar rate feeds in"),
    "TIGER 미국나스닥100": ("나스닥100 추종. 미국 기술주 집중",
                        "Tracks the Nasdaq 100; concentrated in US tech"),
    "TIGER 미국필라델피아반도체나스닥": ("필라델피아 반도체지수(SOX) 추종",
                                "Tracks the Philadelphia Semiconductor Index (SOX)"),
    "TIGER 리츠부동산인프라": ("국내 리츠·인프라 묶음. 배당과 금리에 민감",
                         "Korean REITs and infrastructure; driven by yield and rates"),
    "KODEX 미국채10년선물": ("미 국채 10년 선물. 금리가 내리면 오른다",
                        "US 10-year Treasury futures; rises when yields fall"),
    "KODEX 골드선물(H)": ("국제 금 선물, 환헤지형. 금값만 따라간다",
                      "Gold futures, currency-hedged, so only bullion moves it"),
}


def attach_note(name, quote):
    """시세에 회사 한 줄 설명을 붙인다. 없으면 조용히 넘어간다."""
    note = STOCK_NOTES.get(name)
    if note and quote:
        quote["note_ko"], quote["note_en"] = note
    return quote


# 시가총액 상위 — 야후는 코스피 종목에 .KS, 코스닥에 .KQ 를 쓴다
#
# 열 종목만 담던 것을 넓혔다. 고객이 들고 있는 종목이 표에 없으면 응대할 때
# 매번 따로 찾아야 했다. 코스피 대형주에 업종을 골고루 깔고(반도체·자동차·
# 금융·화학·조선·방산·통신·유통), 코스닥 상위를 붙였다.
YAHOO_STOCKS = {
    # --- 반도체·IT ---
    "삼성전자": "005930.KS", "SK하이닉스": "000660.KS",
    "삼성전기": "009150.KS", "LG전자": "066570.KS",
    "삼성에스디에스": "018260.KS", "SK스퀘어": "402340.KS",
    # --- 이차전지·화학 ---
    "LG에너지솔루션": "373220.KS", "LG화학": "051910.KS",
    "삼성SDI": "006400.KS", "POSCO홀딩스": "005490.KS",
    # --- 바이오·제약 ---
    "삼성바이오로직스": "207940.KS", "셀트리온": "068270.KS",
    # --- 자동차 ---
    "현대차": "005380.KS", "기아": "000270.KS", "현대모비스": "012330.KS",
    # --- 금융 ---
    "KB금융": "105560.KS", "신한지주": "055550.KS",
    "하나금융지주": "086790.KS", "우리금융지주": "316140.KS",
    "메리츠금융지주": "138040.KS", "삼성생명": "032830.KS",
    "삼성화재": "000810.KS",
    # --- 조선·방산·기계·원전 ---
    "한화에어로스페이스": "012450.KS", "HD현대중공업": "329180.KS",
    "두산에너빌리티": "034020.KS",
    # --- 인터넷·게임·통신 ---
    "NAVER": "035420.KS", "카카오": "035720.KS",
    "크래프톤": "259960.KS", "SK텔레콤": "017670.KS",
    # --- 지주·소비재·에너지·운송 ---
    "삼성물산": "028260.KS", "KT&G": "033780.KS",
    "SK이노베이션": "096770.KS", "한국전력": "015760.KS",
    "HMM": "011200.KS",
    # --- 코스닥 상위 ---
    "알테오젠": "196170.KQ", "에코프로비엠": "247540.KQ",
    "에코프로": "086520.KQ", "HLB": "028300.KQ",
    "리노공업": "058470.KQ", "레인보우로보틱스": "277810.KQ",
    "펄어비스": "263750.KQ", "실리콘투": "257720.KQ",
}

# 국내 상장 ETF — 고객이 실제로 사는 물건이다. 지수·업종·해외·채권·원자재를
# 한 줄씩 깔아 「무엇을 사면 이 시황을 사는 것인지」가 표에서 바로 보이게 한다.
YAHOO_KR_ETF = {
    "KODEX 200": "069500.KS", "TIGER 200": "102110.KS",
    "KODEX 코스닥150": "229200.KS", "KODEX 레버리지": "122630.KS",
    "KODEX 200선물인버스2X": "252670.KS",
    "KODEX 반도체": "091160.KS",
    "TIGER 미국S&P500": "360750.KS", "TIGER 미국나스닥100": "133690.KS",
    "TIGER 미국필라델피아반도체나스닥": "381180.KS",
    "TIGER 리츠부동산인프라": "329200.KS",
    "KODEX 미국채10년선물": "308620.KS",
    "KODEX 골드선물(H)": "132030.KS",
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


_DROP_TAGS = re.compile(r"(?is)<(script|style|noscript|template)\b[^>]*>.*?</\1\s*>")
_UNCLOSED_SCRIPT = re.compile(r"(?is)<(script|style)\b[^>]*>.*")


def _text(fragment):
    """태그를 걷어내고 글자만 남긴다.

    **<script>·<style> 는 태그만 지우면 안 되고 내용째 지워야 한다.** 태그만
    지우면 자바스크립트 소스가 본문 자리에 그대로 남는다. 네이버 뉴스 기사에서
    실제로 그랬다 — 나흘 동안 기사 「본문」이 페이지 스크립트였다.
    """
    frag = _DROP_TAGS.sub(" ", fragment)
    frag = _UNCLOSED_SCRIPT.sub(" ", frag)          # 닫히지 않은 채 잘린 조각
    # 문단 구분을 살려 둔다 — 다 지우면 한 줄로 붙어 인용하기 어렵다
    frag = re.sub(r"(?i)<br\s*/?>|</(p|div|li|h\d|article|tr)\s*>", "\n", frag)
    txt = html_mod.unescape(re.sub(r"<[^>]*>", " ", frag)).replace("\xa0", " ")
    txt = re.sub(r"[ \t​]+", " ", txt)
    return re.sub(r"\n{3,}", "\n\n", txt).strip()


def _slice_tag(html, needle):
    """`needle`(예: id="dic_area") 을 품은 태그의 여는 곳부터 짝이 맞는 닫는
    곳까지 잘라낸다.

    비탐욕 정규식으로 `</div>` 까지 자르면 안 된다 — 기사 본문 안에 이미지·
    표 컨테이너가 겹겹이 들어 있어 첫 `</div>` 에서 잘려 나간다. 같은 이름의
    태그를 세어 짝을 맞춘다.
    """
    i = html.find(needle)
    if i < 0:
        return None
    start = html.rfind("<", 0, i)
    if start < 0:
        return None
    m = re.match(r"<([a-zA-Z][\w-]*)", html[start:])
    if not m:
        return None
    tag = m.group(1)
    pat = re.compile(r"(?i)<(/?)%s\b" % re.escape(tag))
    depth = 0
    for mm in pat.finditer(html, start):
        depth += -1 if mm.group(1) else 1
        if depth == 0:
            return html[start:mm.end() + html[mm.end():].find(">") + 1]
    return html[start:]                              # 닫히지 않았으면 끝까지


def _num(x):
    return round(x, 4) if isinstance(x, float) else x


def _months_before(d, n):
    """d 에서 n 개월 전 같은 날. 말일 보정(3/31 - 1개월 = 2/28)."""
    y, m = d.year, d.month - n
    while m <= 0:
        y -= 1
        m += 12
    for day in range(d.day, 0, -1):
        try:
            return date(y, m, day)
        except ValueError:
            continue
    return date(y, m, 1)


def _iso(s):
    """'2026-08-14' 문자열을 date 로. 못 읽으면 None."""
    try:
        return date(*(int(x) for x in s.split("-")))
    except (ValueError, TypeError, AttributeError):
        return None


def _perf(bars, last_close, as_bp=False):
    """기간 수익률(%) — 달력으로 되짚어 그 날 **이전의 마지막 실봉**과 견준다.

    `as_bp=True` 면 비율이 아니라 **차이(bp)** 를 낸다. 금리에 %  수익률을
    붙이면 읽을 수 없는 숫자가 된다 — 4.20% 가 4.50% 가 된 것을 「+7.1%」라고
    적으면 아무도 못 알아본다. 금리는 「+30bp」다.

    거래일 수로 세지 않는다. 휴장일이 나라마다 달라 같은 「1개월」이 시장마다
    다른 기간이 되기 때문이다. 기준일이 휴장이면 그 앞의 마지막 거래일을 쓴다.

    bars 는 (date, close) 오름차순. 되짚을 구간이 자료 범위를 벗어나면 그
    항목만 빠진다 — 상장한 지 얼마 안 된 종목에서 그렇다.
    """
    if not bars or not last_close:
        return None
    d0 = bars[-1][0]

    def ref_before(target):
        v = None
        for dt, c in bars:
            if dt <= target:
                v = c
            else:
                break
        return v

    def diff(r):
        return round((last_close - r) * 100, 1) if as_bp else round((last_close / r - 1) * 100, 2)

    out = {}
    for key, back in (("w1", lambda: d0 - timedelta(days=7)),
                      ("m1", lambda: _months_before(d0, 1)),
                      ("m3", lambda: _months_before(d0, 3)),
                      ("m6", lambda: _months_before(d0, 6)),
                      ("y1", lambda: _months_before(d0, 12))):
        r = ref_before(back())
        if r:
            out[key] = diff(r)
    r = ref_before(date(d0.year, 1, 1) - timedelta(days=1))   # 전년 마지막 거래일
    if r:
        out["ytd"] = diff(r)
    if out:
        out["unit"] = "bp" if as_bp else "%"
        out["from"] = bars[0][0].isoformat()                  # 자료가 닿는 가장 이른 날
    return out or None


def yahoo_quote(symbol):
    """일봉 2개를 받아 종가·전일대비·OHLC·거래량을 만든다.

    **마지막 봉의 종가가 비어 있어도 그 날을 버리지 않는다.** 지수 심볼은
    장이 끝난 뒤에도 일봉 종가가 한동안 `null` 로 오고 마감가는 `meta` 에만
    실린다. 8월 11일 아침에 ^KS11 ^KQ11 ^N225 ^HSI 000001.SS ^TWII ^BSESN
    ^AXJO ^STOXX 가 **전부** 그랬고, 같은 거래소의 개별 종목(005930.KS,
    7203.T, 600519.SS)은 멀쩡했다. 빈 봉을 건너뛰면 8월 7일 값을 8월 10일
    값으로 읽게 된다 — 실제로 그렇게 나갔다.

    그래서 마지막 봉이 비었고 `meta` 가 **같은 날** 장을 마쳤다고 하면
    `regularMarketPrice` 를 종가로 쓴다. 날짜가 어긋나면(아직 열리지 않은
    날의 빈 봉) 종전대로 마지막 실봉으로 물러선다.

    빈 봉인지 견주는 **날짜 비교만** 거래소 현지로 한다. 유럽은 취리히
    17:30 마감이 KST 로 다음 날 00:30 이라, KST 로 비교하면 같은 날인데도
    어긋난 것으로 보인다. 내보내는 `date` 는 종전대로 KST 다 — 지수는 두
    기준이 어차피 같고, 환율은 다르기 때문이다. `KRW=X` 는 거래소가
    Europe/London 인 24시간 시세라 마지막 봉이 **진행 중인 호가**인데,
    현지 기준으로 적으면 그 호가가 전날 마감인 것처럼 보인다.
    """
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol) + "?range=2y&interval=1d")
    j = json.loads(_get(url))
    res = j["chart"]["result"][0]
    meta = res["meta"]
    q = res["indicators"]["quote"][0]
    ts = res["timestamp"]

    off = meta.get("gmtoffset")
    ex_tz = timezone(timedelta(seconds=off)) if isinstance(off, int) else KST

    def day(t):                       # 내보내는 날짜 — KST
        return datetime.fromtimestamp(t, KST).strftime("%Y-%m-%d")

    def day_ex(t):                    # 빈 봉 대조용 날짜 — 거래소 현지
        return datetime.fromtimestamp(t, ex_tz).strftime("%Y-%m-%d")

    have = [i for i, c in enumerate(q["close"]) if c is not None]      # 실봉
    tail = len(ts) - 1                                                  # 마지막 봉
    rmt, rmp = meta.get("regularMarketTime"), meta.get("regularMarketPrice")

    # 마지막 봉이 비었는데 meta 가 그 날 마감을 들고 있는가
    from_meta = (tail >= 0 and q["close"][tail] is None
                 and rmt and rmp is not None and day_ex(ts[tail]) == day_ex(rmt))

    if from_meta:
        last = tail
        close = rmp
        prev_close = (q["close"][have[-1]] if have else meta.get("chartPreviousClose"))
        # 빈 봉은 OHLC 도 비어 있는 일이 많다. meta 에 있으면 그것을 쓴다.
        o = q["open"][last] if q["open"][last] is not None else meta.get("regularMarketOpen")
        hi = q["high"][last] if q["high"][last] is not None else meta.get("regularMarketDayHigh")
        lo = q["low"][last] if q["low"][last] is not None else meta.get("regularMarketDayLow")
        vol = q["volume"][last] if q["volume"][last] is not None else meta.get("regularMarketVolume")
    else:
        if not have:
            raise ValueError("no close data")
        last = have[-1]
        prev = have[-2] if len(have) > 1 else None
        close = q["close"][last]
        prev_close = q["close"][prev] if prev is not None else meta.get("chartPreviousClose")
        o, hi, lo, vol = (q["open"][last], q["high"][last],
                          q["low"][last], q["volume"][last])

    change = close - prev_close if prev_close else None
    out = {
        "symbol": symbol,
        "date": day(ts[last]),
        "close": _num(close),
        "open": _num(o),
        "high": _num(hi),
        "low": _num(lo),
        "volume": vol,
        "prev_close": _num(prev_close),
        "change": _num(change),
        "change_pct": _num(change / prev_close * 100) if prev_close else None,
        "currency": meta.get("currency"),
    }
    if from_meta:
        # 브리핑 검증 노트에서 구분할 수 있게 남긴다
        out["quote_basis"] = "meta.regularMarketPrice (일봉 종가 미기재)"

    # 기간 수익률 — 2년치 일봉에서 계산해 요약만 싣는다(원본 계열은 싣지 않는다)
    bars = [(datetime.fromtimestamp(ts[i], ex_tz).date(), q["close"][i]) for i in have]
    if from_meta:
        bars.append((datetime.fromtimestamp(ts[last], ex_tz).date(), close))
    perf = _perf(bars, close, as_bp=symbol in YIELD_SYMBOLS)
    if perf:
        out["perf"] = perf
    if symbol in YIELD_SYMBOLS:
        out["quote_kind"] = "yield_pct"    # 값 자체가 % 다. 등락은 bp 로 읽는다.
        if change is not None:
            out["change_bp"] = round(change * 100, 1)
    return out


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


def _investor_urls(now, back=0):
    """bizdate 없이 부르면 표 껍데기(1.6KB)만 오므로 날짜를 붙여 부른다.

    한 번 부르면 **열 줄**만 온다. 더 거슬러 올라가려면 bizdate 를 뒤로 옮겨
    다시 불러야 한다 — `back` 이 그 일수다.
    """
    base = "https://finance.naver.com/sise/investorDealTrendDay.naver"
    days = [(now - timedelta(days=back + i)).strftime("%Y%m%d") for i in range(0, 5)]
    return ["%s?bizdate=%s&sosok=" % (base, d) for d in days]


def naver_investors(now, dump_dir=None):
    """투자자별 매매동향 — 개인/외국인/기관 순매수, 단위 억원. 약 한 달치.

    화면 한 장에 **열 줄**만 나오므로 bizdate 를 2주씩 뒤로 옮겨 세 번 부르고
    날짜로 합친다. 「이번 주 내내 외국인이 샀는가」를 말하려면 열 줄로는 모자란다.
    """
    seen, merged = set(), []
    for back in (0, 14, 28):
        try:
            for r in _naver_investors_page(now, dump_dir, back):
                if r["date"] not in seen:
                    seen.add(r["date"])
                    merged.append(r)
        except Exception as e:                                # noqa: BLE001
            if not merged:
                raise
            merged[0].setdefault("partial", str(e)[:80])
    merged.sort(key=lambda r: r["date"], reverse=True)
    return merged


def _naver_investors_page(now, dump_dir=None, back=0):
    """투자자별 매매동향 한 장(열 줄).

    페이지 구조가 바뀌면 파싱이 빗나가므로, 실패 시 원본 HTML을 남겨
    다음 실행 때 무엇을 봐야 하는지 알 수 있게 한다.
    """
    errors = []
    for n_url, url in enumerate(_investor_urls(now, back)):
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
            return out
        errors.append("%s -> 날짜 행 없음(%d bytes)" % (url.split("?")[0][-32:], len(s)))
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            fn = os.path.join(dump_dir, "investors_%d_try%d.html" % (back, n_url))
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


# 샘플 인증키는 **호출당 10건**까지다. ecos.bok.or.kr 에서 무료 인증키를 받아
# ECOS_API_KEY 로 넣으면 한 번에 다 온다 — 그러면 국내 금리 기간 변화를 월평균이
# 아니라 일별 실측으로 낼 수 있다.
ECOS_KEY = (os.environ.get("ECOS_API_KEY") or "").strip() or "sample"
ECOS_ROWS = 10 if ECOS_KEY == "sample" else 900


def _ecos_url(service, tail, start=1, rows=None):
    rows = rows or ECOS_ROWS
    return ("https://ecos.bok.or.kr/api/%s/%s/json/kr/%d/%d/%s"
            % (service, ECOS_KEY, start, start + rows - 1, tail))


def _ecos_at(code, target, span=16):
    """`target` 그 날 **이전의 마지막 실측 금리**를 한 번의 호출로 받는다.

    817Y002 는 일별 계열만 있다 — 월별(M)로 부르면 빈 응답이 온다. 그리고
    샘플 인증키는 호출당 10건이라 2년치를 한꺼번에 받을 수 없다. 그래서
    기준일마다 짧은 창(기본 16일)을 따로 부른다. 창 안의 마지막 값이 곧
    그 시점의 금리다 — 월평균이 아니라 **일별 실측**이다.
    """
    tail = "817Y002/D/%s/%s/%s" % ((target - timedelta(days=span)).strftime("%Y%m%d"),
                                   target.strftime("%Y%m%d"), code)
    url = _ecos_url("StatisticSearch", tail, rows=10)
    for attempt in (0, 1):                    # ECOS 는 자주 끊긴다. 한 번은 다시 본다.
        try:
            j = json.loads(_get(url, timeout=30))
            break
        except Exception:                                          # noqa: BLE001
            if attempt:
                raise
            time.sleep(2)
    rows = (j.get("StatisticSearch", {}) or {}).get("row", [])
    for r in reversed(rows):
        try:
            return float(r["DATA_VALUE"])
        except (KeyError, ValueError, TypeError):
            continue
    return None


def _ecos_targets(d0):
    """되짚을 기준일. 달력으로 센다(4-3절과 같다). 1주는 여기 없다 — 이미
    받아 둔 10영업일 계열에서 공짜로 뽑는다."""
    return {"m1": _months_before(d0, 1), "m3": _months_before(d0, 3),
            "m6": _months_before(d0, 6), "y1": _months_before(d0, 12),
            "ytd": date(d0.year, 1, 1) - timedelta(days=1)}


def _ecos_perf_bulk(code, now, spot):
    """정식 인증키가 있을 때 — **한 번의 호출**로 13개월치를 받아 모든 구간을
    그 안에서 뽑는다. 샘플 키(호출당 10행)로는 못 하는 방식이라 갈라 둔다."""
    d0 = now.date()
    start = _months_before(d0, 13)
    tail = "817Y002/D/%s/%s/%s" % (start.strftime("%Y%m%d"), d0.strftime("%Y%m%d"), code)
    j = json.loads(_get(_ecos_url("StatisticSearch", tail, rows=900), timeout=60))
    bars = []
    for r in (j.get("StatisticSearch", {}) or {}).get("row", []):
        t = str(r.get("TIME") or "")
        try:
            bars.append((date(int(t[:4]), int(t[4:6]), int(t[6:8])),
                         float(r["DATA_VALUE"])))
        except (KeyError, ValueError, TypeError):
            continue
    bars.sort()
    if len(bars) < 3:
        return None
    p = _perf(bars, spot, as_bp=True)
    if p:
        p["basis"] = "일별 실측 대비 (한국은행 ECOS 817Y002, 13개월 일괄)"
    return p


def _ecos_perf(code, now, spot, wants=None):
    """국내 금리의 기간 변화(bp). 되짚는 기준은 달력이다(4-3절과 같다).

    `wants` 로 어느 구간을 되짚을지 줄일 수 있다 — 샘플 인증키에서는 구간
    하나가 곧 호출 하나라, 계열이 늘면 예산을 나눠 써야 한다.
    """
    d0 = now.date()
    tg = _ecos_targets(d0)
    keys = tuple(wants) if wants is not None else tuple(tg)
    out = {}
    for key in keys:
        target = tg.get(key)
        if target is None:
            continue
        try:
            v = _ecos_at(code, target)
        except Exception:                                      # noqa: BLE001
            continue
        if v:
            out[key] = round((spot - v) * 100, 1)
    if out:
        out["unit"] = "bp"
        out["basis"] = "일별 실측 대비 (한국은행 ECOS 817Y002)"
    return out or None


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
        j = json.loads(_get(_ecos_url("StatisticItemList", "817Y002", rows=100),
                            timeout=60))
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
        url = _ecos_url("StatisticSearch",
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

    # 기간 변화(bp). 예전에는 ktb3y·ktb10y **두 가지만** 되짚었다. 샘플
    # 인증키가 호출당 10행이라 기준일마다 따로 불러야 했고, 여섯 계열을 다
    # 하면 서른 번이 되어 ECOS 가 끊겼기 때문이다. 그 결과 브리핑의 국고채
    # 1년·5년, 회사채, CD 91일에는 기간 변화 칸이 늘 비어 있었다.
    #
    # 이제 두 갈래로 나눈다.
    #  · 정식 인증키(ECOS_API_KEY)가 있으면 계열당 **한 번**에 13개월치를 받아
    #    모든 구간을 그 안에서 뽑는다 — 여섯 번이면 끝이고 구간도 다 채운다.
    #  · 샘플 키면 1주는 이미 받아 둔 10영업일 계열에서 **공짜로** 뽑고(여섯
    #    계열 전부), 나머지 구간은 호출 예산 안에서 되짚는다.
    full = ECOS_KEY != "sample"
    budget = [40 if full else 22]                 # 남은 호출 수. 0 이 되면 멈춘다.
    for key in ("ktb3y", "ktb10y", "ktb1y", "ktb5y", "corp3y", "cd91"):
        if key not in out or key not in tried:
            continue
        spot = out[key]["value"]
        ser = out[key].get("series") or []
        p = None
        if full:
            try:
                budget[0] -= 1
                p = _ecos_perf_bulk(tried[key], now, spot)
            except Exception as e:                            # noqa: BLE001
                errs.append("%s 기간변화(일괄) -> %s" % (key, str(e)[:60]))
        if p is None:
            # 앞의 둘은 브리핑이 늘 인용하므로 여섯 구간을 다 되짚고, 나머지
            # 넷은 실제로 싣는 세 구간만 본다. 예산이 마르면 1주만 남는다.
            wants = ("m1", "m3", "m6", "y1", "ytd") if key in ("ktb3y", "ktb10y") \
                else ("m1", "m3", "ytd")
            wants = wants[:max(0, budget[0])]
            budget[0] -= len(wants)
            try:
                p = _ecos_perf(tried[key], now, spot, wants=wants) if wants else None
            except Exception as e:                            # noqa: BLE001
                errs.append("%s 기간변화 -> %s" % (key, str(e)[:60]))
                p = None
        # 1주는 받아 둔 10영업일 계열에서 바로 뽑는다(추가 호출 없음).
        # 되짚기가 통째로 실패해도 이것만은 여섯 계열 모두에 붙는다.
        if len(ser) >= 6:
            p = p or {"unit": "bp", "basis": "일별 실측 대비 (한국은행 ECOS 817Y002)"}
            p.setdefault("w1", round((spot - ser[-6]["value"]) * 100, 1))
        if p:
            out[key]["perf"] = p
        else:
            errs.append("%s 기간변화 -> 되짚은 값이 하나도 없다" % key)

    if errs:
        out["notes"] = errs[:12]          # 성공해도 무엇이 빠졌는지는 남긴다
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

    # 열 이름을 읽어 **이름으로** 담는다. 자리번호로 담으면 네이버가 열을 하나
    # 끼워 넣는 순간 「주식형펀드」 자리에 미수금이 들어와도 아무도 모른다.
    # 읽어 낸 이름은 그대로 내보내 눈으로 대조할 수 있게 한다.
    head = []
    for tr in re.findall(r"(?is)<tr[^>]*>.*?</tr>", tbl.group(0) if tbl else html):
        hs = [re.sub(r"\s+", " ", _text(c)).strip()
              for c in re.findall(r"(?is)<th[^>]*>(.*?)</th>", tr)]
        if len(hs) >= 4:
            head = hs
            break

    # **자리번호로 담는다.** 이름으로 담으려다 한 번 틀렸다 — 이 표의 머리는
    # 두 줄짜리 묶음머리(날짜 | 고객예탁금 | 신용잔고 | 펀드)라, 이름이 붙은
    # 열과 실제 값 칸의 자리가 다르다. 이름만 보고 매기면 신용잔고 자리에
    # 예탁금 전일대비가 들어온다(실제로 들어왔다).
    #
    # 읽어 낸 머리행은 진단용으로 그대로 내보낸다. 「미수금」이 여기 없다는
    # 것이 곧 이 원천에 미수금이 없다는 증거다.
    series = []
    for r in rows[:20]:
        y, m, d = r[0].split(".")
        series.append({
            "date": "20%s-%s-%s" % (y, m, d),
            "deposit": n(r[1]), "deposit_chg": n(r[2]),          # 고객예탁금
            "credit_balance": n(r[3]), "credit_chg": n(r[4]),    # 신용잔고
            "fund_equity": n(r[5]), "fund_mixed": n(r[7]), "fund_bond": n(r[9]),
        })

    # 자리배치가 밀렸는지 값으로 잡는다. 예탁금은 조 단위(수십만 억원)이고
    # 신용잔고는 그보다 한 자리 작다. 신용잔고가 예탁금 증감과 같으면 밀린 것이다.
    s0 = series[0]
    if s0.get("credit_balance") is not None and s0["credit_balance"] == s0.get("deposit_chg"):
        raise ValueError("증시자금동향 열이 밀렸다 — 머리행 %s" % head)
    # 네이버 표의 「전일대비」(*_chg) 는 **부호가 없는 절대값**이다. 줄어든 날에도
    # 양수로 실려, 그대로 옮기면 감소가 증가로 나간다 — 8월 13일 판에서 예탁금
    # 3조 4,884억 「감소」를 「+34,884 증가」로 내보냈다. 값끼리 빼서 부호를 만든다.
    for i, r in enumerate(series):
        nxt = series[i + 1] if i + 1 < len(series) else None
        if not nxt:
            continue
        for base in ("deposit", "credit_balance", "margin_due",
                     "fund_equity", "fund_mixed", "fund_bond"):
            a, b = r.get(base), nxt.get(base)
            if a is not None and b is not None:
                r[base + "_delta"] = round(a - b, 1)

    return {"unit": "억원", "latest": series[0], "series": series,
            "columns": head,
            "source_url": "https://finance.naver.com/sise/sise_deposit.naver",
            "note": "신용잔고는 결제일 기준이라 종가일보다 1~2영업일 늦게 반영된다",
            "delta_note": "*_chg 는 네이버가 준 **절대값**이라 부호가 없다. 증감은 반드시 "
                          "*_delta (앞뒤 값의 차) 를 쓸 것",
            "missing": "미수금·반대매매는 이 표에 없다. 머리행이 날짜/고객예탁금/신용잔고/펀드 "
                       "뿐인 것으로 확인했다. 금투협(freesis.kofia.or.kr) 소관인데 웹방화벽이 "
                       "막는다 — 브리핑에서는 NOT FOUND 로 두고 신용잔고를 대용으로 쓸 것"}


_FUT_SENT = re.compile(r"[^.。\n]{0,110}선물[^.。\n]{0,150}?(?:계약|억원)[^.。\n]{0,60}")
_CREDIT_SENT = re.compile(
    r"[^.。\n]{0,90}(?:반대매매|미수금|신용거래융자|신용융자|예탁금)[^.。\n]{0,140}")


# 외국계 IB · 해외 투자전문가. 이름이 나온 **문장**을 통째로 건져 둔다.
#
# 브리핑에 "골드만삭스는 …" 을 쓰려면 그 말이 실제로 어느 기사 어느 문장에
# 있었는지가 있어야 한다. 기억으로 쓰면 출처를 댈 수 없다. 이름만 세는 것도
# 소용없다 — 문장이 있어야 인용이 된다.
_IB_NAMES = (
    # 투자은행 · 운용사
    "골드만삭스", "모건스탠리", "JP모건", "JP모간", "제이피모건", "뱅크오브아메리카",
    "BofA", "씨티", "시티그룹", "UBS", "도이체방크", "도이치방크", "바클레이스",
    "노무라", "미즈호", "HSBC", "BNP", "소시에테제네랄", "웰스파고", "제프리스",
    "번스타인", "번스타인리서치", "에버코어", "파이퍼샌들러", "레이먼드제임스",
    "블랙록", "뱅가드", "피델리티", "핌코", "PIMCO", "브리지워터", "인베스코",
    "칼라일", "블랙스톤", "KKR", "아폴로", "맥쿼리", "슈로더", "얼라이언스번스타인",
    # 사람
    "레이 달리오", "제프리 건들락", "빌 애크먼", "워런 버핏", "캐시 우드",
    "모하메드 엘에리언", "엘 에리언", "제러미 시걸", "래리 서머스", "제이미 다이먼",
    "데이비드 솔로몬", "켄 그리핀", "스탠리 드러켄밀러", "하워드 막스",
    "톰 리", "에드 야데니", "마이크 윌슨", "데이비드 코스틴", "사비타 서브라마니안",
)
_IB_SENT = re.compile(
    r"[^.。\n]{0,120}(?:" + "|".join(re.escape(x) for x in _IB_NAMES)
    + r")[^.。\n]{0,200}")

# 증권업종 — 미래에셋증권과 그 동종 상장사. 종목 뉴스 페이지에서 회사 자체의
# 이슈(실적·인수·제재·인사·자사주 등)를 받는다. 리서치 자료가 아니라 **회사
# 소식**이다.
MIRAE_CODE = "006800"
BROKER_CODES = {
    "006800": "미래에셋증권", "016360": "삼성증권", "005940": "NH투자증권",
    "039490": "키움증권", "071050": "한국금융지주", "008560": "메리츠증권",
    "003540": "대신증권", "003470": "유안타증권", "001720": "신영증권",
    "030610": "교보증권", "003530": "한화투자증권", "016610": "DB금융투자",
    "001510": "SK증권", "078020": "LS증권", "001500": "현대차증권",
    "030210": "다올투자증권", "001200": "유진투자증권", "003960": "iM증권",
}

_BODY_IDS = ('id="dic_area"', 'id="newsct_article"', 'id="articleBodyContents"',
             'id="comp_news_article"', 'class="newsct_article')

_TAIL_CUT = re.compile(
    r"(?m)^\s*(?:Copyright|저작권자|무단\s*전재|ⓒ|Ⓒ|▶|☞|\[ⓒ|<저작권자).*$")


def _news_body(html):
    """기사 몸통만 잘라 글자로 돌려준다. (본문, 어디서 건졌는지) 를 준다.

    껍데기 전체를 `_text` 에 넣으면 메뉴·안내문·연관기사가 섞인다. 본문
    컨테이너를 먼저 집어내고, 끝에 붙는 저작권 문구는 잘라 버린다.
    """
    for needle in _BODY_IDS:
        frag = _slice_tag(html, needle)
        if frag and len(frag) > 200:
            body = _text(frag)
            body = _TAIL_CUT.split(body)[0].strip()
            if len(body) >= 120:
                return body, needle.split('"')[-1] or needle
    # 마지막 수단 — 예전 방식. 무엇으로 건졌는지 남겨 품질을 눈으로 본다.
    # 여기서도 저작권 꼬리말은 잘라야 한다. 위쪽 길에만 잘라 두어서, 본문이
    # 짧아 fallback 으로 떨어진 기사(단신 공시가 그렇다)는 「…무단전재 및
    # 재배포 금지」까지 본문으로 들고 왔다.
    body = _text(html)
    i = body.find("기사원문")
    body = (body[i:] if i > 0 else body)
    return _TAIL_CUT.split(body)[0].strip(), "fallback"


def _news_title(html, default=""):
    for needle in ('id="title_area"', 'class="media_end_head_headline"'):
        frag = _slice_tag(html, needle)
        if frag:
            t = _text(frag).strip()
            if t:
                return t[:200]
    return default


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
            page = _get(url, referer="https://finance.naver.com/")
        except Exception:                                          # noqa: BLE001
            continue
        core, how = _news_body(page)
        arts.append({"title": _news_title(page, title), "url": url,
                     "chars": len(core), "extracted": how,
                     "body": core[:6000]})
        for m in _FUT_SENT.finditer(core):
            s = m.group(0).strip()
            if re.search(r"[\d,]{3,}\s*계약", s) or "선물시장" in s:
                fut.append({"title": title, "url": url, "sentence": s[:300]})
        for m in _CREDIT_SENT.finditer(core):
            s = m.group(0).strip()
            if re.search(r"\d", s) and "본문 바로가기" not in s:
                credit.append({"title": title, "url": url, "sentence": s[:300]})
    # 본문 추출이 깨지면 조용히 망가진다 — 「본문」 자리에 스크립트가 실려도
    # 글자 수는 오히려 늘어나기 때문이다. 어디서 건졌는지를 세어 같이 낸다.
    tally = {}
    for a in arts:
        tally[a["extracted"]] = tally.get(a["extracted"], 0) + 1
    if arts and tally.get("fallback", 0) > len(arts) // 2:
        raise ValueError("기사 본문 컨테이너를 못 찾았다 — 네이버 뉴스 구조가 바뀐 듯하다"
                         " (%d/%d 이 fallback)" % (tally["fallback"], len(arts)))
    return {"date": now.strftime("%Y-%m-%d"), "count": len(arts),
            "extraction": tally,
            "articles": arts, "futures_mentions": fut[:8],
            "credit_mentions": credit[:8]}


def _item_news_links(code, pages=1):
    """종목 뉴스 목록 — 그 회사 **자체**에 관한 기사다.

    finance.naver.com 의 종목 뉴스는 iframe 으로 실려 있어 사람이 보는 주소로는
    목록이 안 나온다. iframe 이 부르는 주소를 직접 부른다.
    """
    links, errs = [], []
    for page in range(1, pages + 1):
        try:
            s = _get("https://finance.naver.com/item/news_news.naver"
                     "?code=%s&page=%d&clusterId=" % (code, page),
                     referer="https://finance.naver.com/item/news.naver?code=" + code,
                     encoding="cp949")
        except Exception as e:                                     # noqa: BLE001
            errs.append(str(e)[:60])
            break

        def add(oid, aid):
            u = "https://n.news.naver.com/mnews/article/%s/%s" % (oid, aid)
            if u not in links:
                links.append(u)

        # 이 목록의 주소는 `article_id` 가 **먼저** 온다 — mainnews 쪽과 같은
        # 차례다(naver_news 가 그렇게 읽고 있어 검증된 모양이다). `&amp;` 로
        # 이스케이프되어 오는 경우까지 함께 받는다.
        for aid, oid in re.findall(r"article_id=(\d+)(?:&amp;|&)office_id=(\d+)", s):
            add(oid, aid)
        for oid, aid in re.findall(r"office_id=(\d+)(?:&amp;|&)article_id=(\d+)", s):
            add(oid, aid)
        for oid, aid in re.findall(r"/mnews/article/(\d+)/(\d+)", s):
            add(oid, aid)
    if errs and not links:
        raise ValueError("종목 %s 뉴스 목록: %s" % (code, errs[0]))
    return links


def broker_news(now, per_peer=2, mirae_n=8, peers=8):
    """증권업종과 미래에셋증권 **자체**의 이슈.

    지금까지 브리핑에는 증권업이 「업종 등락률 한 줄」로만 나왔다. 정작 이
    회사가 속한 업종에 무슨 일이 있었는지, 미래에셋증권 자체에 무슨 일이
    있었는지는 어디에도 없었다.

    **리서치 자료가 아니다.** 미래에셋증권이 낸 종목·시황 리포트는 여기서
    받지 않는다 — 회사 자체의 소식(실적·인수·제재·인사·자사주·신사업)과
    업종 전반의 이슈를 받는다.
    """
    out = {"date": now.strftime("%Y-%m-%d"), "mirae": [], "sector": [],
           "peers_seen": [], "errors": []}
    seen = set()

    def take(url, company, bucket):
        if url in seen:
            return
        seen.add(url)
        try:
            page = _get(url, referer="https://finance.naver.com/")
        except Exception as e:                                     # noqa: BLE001
            out["errors"].append("%s %s" % (company, str(e)[:40]))
            return
        core, how = _news_body(page)
        if len(core) < 120:                       # 껍데기만 온 것은 버린다
            return
        bucket.append({"company": company, "title": _news_title(page),
                       "url": url, "chars": len(core), "extracted": how,
                       "body": core[:5000]})

    for u in _item_news_links(MIRAE_CODE, pages=2)[:mirae_n]:
        take(u, "미래에셋증권", out["mirae"])

    for code, name in list(BROKER_CODES.items()):
        if code == MIRAE_CODE:
            continue
        if len(out["peers_seen"]) >= peers:
            break
        got = len(out["sector"])
        for u in _item_news_links(code)[:per_peer]:
            take(u, name, out["sector"])
        if len(out["sector"]) > got:
            out["peers_seen"].append(name)

    out["count"] = len(out["mirae"]) + len(out["sector"])
    if not out["count"]:
        raise ValueError("증권업종 기사를 하나도 받지 못했다 (네이버 종목뉴스 구조 변경?)")
    return out


def ib_mentions(*article_groups):
    """모아 둔 기사 본문에서 **외국계 IB·해외 투자전문가가 말한 문장**을 뽑는다.

    새로 받아 오는 것이 없다 — 이미 받은 본문을 훑을 뿐이라 비용이 0 이다.
    이름별로 묶어 두므로 「골드만삭스가 뭐라 했나」를 바로 찾을 수 있다.
    """
    hits, by_name = [], {}
    for arts in article_groups:
        for a in arts or []:
            body = a.get("body") or ""
            for m in _IB_SENT.finditer(body):
                s = re.sub(r"\s+", " ", m.group(0)).strip()
                if len(s) < 20 or not any(x in s for x in _IB_NAMES):
                    continue
                # 한 문장에 이름이 둘 이상 나오면(「브리지워터를 설립한 레이
                # 달리오」) **먼저 나온 쪽**을 대표로 삼는다. _IB_NAMES 의
                # 나열 순서로 고르면 엉뚱한 이름이 붙는다.
                found = sorted(((s.index(x), x) for x in _IB_NAMES if x in s))
                who = found[0][1]
                row = {"who": who, "sentence": s[:400],
                       "also": [x for _, x in found[1:]],
                       "title": a.get("title"), "url": a.get("url")}
                if any(h["sentence"] == row["sentence"] for h in hits):
                    continue
                hits.append(row)
                by_name.setdefault(who, []).append(len(hits) - 1)
    return {"count": len(hits), "names": sorted(by_name),
            "by_name": {k: v for k, v in sorted(by_name.items())},
            "mentions": hits[:40]}


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

    # 기간 변화 — 곡선 전체를 만기별로 되짚는다. 단위는 bp 다.
    # CSV 는 해마다 끊겨 있어 1년·연초대비를 내려면 전년 것도 있어야 한다.
    # 전년 요청이 실패해도 나머지 구간은 그대로 낸다.
    hist = [parse(r) for r in rows[1:] if len(r) > 1]
    hist += _treasury_prev_year(year, "daily_treasury_yield_curve", parse, res)

    perf = {}
    for k in want:
        bars = sorted((_iso(h["date"]), h[k]) for h in hist if k in h and _iso(h["date"]))
        if len(bars) > 2:
            p = _perf(bars, bars[-1][1], as_bp=True)
            if p:
                perf[k] = p
    if perf:
        res["perf"] = perf
    return res


def treasury_real_yields(now):
    """미 국채 실질수익률 곡선(TIPS) — 명목 곡선과 같은 재무부 CSV, type 만 다르다.

    명목금리만 보면 금리가 내린 이유가 성장 전망인지 물가 전망인지 갈리지 않는다.
    명목 − 실질 이 곧 기대인플레이션(브레이크이븐)이라, 이 한 번의 요청으로
    실질금리와 기대인플레이션을 같이 얻는다. FRED 의 T10YIE 를 쓰면 될 일이지만
    FRED 는 러너에서 계속 타임아웃이라 이미 잘 붙는 호스트로 대신한다.

    만기는 5·7·10·20·30년만 있다 — TIPS 가 그 만기로만 발행되기 때문이다.
    """
    year = now.strftime("%Y")
    csv_text = _get(
        "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/"
        "daily-treasury-rates.csv/%s/all?type=daily_treasury_real_yield_curve"
        "&field_tdr_date_value=%s&page&_format=csv" % (year, year), timeout=50)
    rows = list(csv.reader(io.StringIO(csv_text)))
    if len(rows) < 2:
        raise ValueError("재무부 실질금리 CSV 행 없음 (%d bytes)" % len(csv_text))
    head = [h.strip() for h in rows[0]]
    want = {"ust5y": "5 YR", "ust7y": "7 YR", "ust10y": "10 YR",
            "ust20y": "20 YR", "ust30y": "30 YR"}

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

    latest = parse(rows[1])
    prev = parse(rows[2]) if len(rows) > 2 else {}
    if "ust10y" not in latest:
        raise ValueError("실질 10년물 없음: %s" % head[:8])
    res = {"unit": "%", "date": latest["date"], "prev_date": prev.get("date"),
           "curve": {k: v for k, v in latest.items() if k != "date"},
           "prev_curve": {k: v for k, v in prev.items() if k != "date"},
           "source_url": "https://home.treasury.gov (Daily Treasury Real Yield Curve)"}
    res["change_bp"] = {k: round((latest[k] - prev[k]) * 100)
                        for k in want if k in latest and k in prev}

    # 기간 변화(bp). 명목 곡선과 똑같이 되짚는다 — 여기 CSV 에도 연중 일별
    # 이력이 통째로 들어 있는데 그동안 최신 두 줄만 쓰고 버렸다. 명목에는
    # 기간 변화가 붙고 실질에는 안 붙어서, 브리핑에서 "명목은 20bp 올랐는데
    # 실질은?" 을 물으면 답할 수 없었다.
    hist = [parse(r) for r in rows[1:] if len(r) > 1]
    hist += _treasury_prev_year(year, "daily_treasury_real_yield_curve", parse, res)
    perf = {}
    for k in want:
        bars = sorted((_iso(h["date"]), h[k]) for h in hist if k in h and _iso(h["date"]))
        if len(bars) > 2:
            p = _perf(bars, bars[-1][1], as_bp=True)
            if p:
                perf[k] = p
    if perf:
        res["perf"] = perf
    return res


def _treasury_prev_year(year, csv_type, parse, res):
    """재무부 CSV 는 해마다 끊겨 있다. 1년·연초 대비를 내려면 전년 것도 있어야
    한다. 전년 요청이 실패해도 나머지 구간은 그대로 낸다 — 되짚기가 짧아질 뿐
    수치가 틀어지지는 않는다."""
    try:
        text = _get(
            "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/"
            "daily-treasury-rates.csv/%d/all?type=%s"
            "&field_tdr_date_value=%d&page&_format=csv"
            % (int(year) - 1, csv_type, int(year) - 1), timeout=50)
        prows = list(csv.reader(io.StringIO(text)))
        return [parse(r) for r in prows[1:] if len(r) > 1]
    except Exception as e:                                       # noqa: BLE001
        res["perf_note"] = "전년 곡선을 못 받아 1년·연초 대비는 빠질 수 있다: %s" % str(e)[:60]
        return []


def breakeven_perf(nominal, real):
    """기대인플레이션의 기간 변화 = 명목 변화 − 실질 변화 (같은 만기, bp).

    브레이크이븐 자체가 두 곡선의 차라서 기간 변화도 차로 낼 수 있다 —
    따로 받을 원천이 없다. 한쪽 만기가 비면 그 만기만 빠진다.
    """
    npf = (nominal or {}).get("perf") or {}
    rpf = (real or {}).get("perf") or {}
    out = {}
    for k in set(npf) & set(rpf):
        row = {}
        for h in ("w1", "m1", "m3", "m6", "y1", "ytd"):
            a, b = npf[k].get(h), rpf[k].get(h)
            if a is not None and b is not None:
                row[h] = round(a - b, 1)
        if row:
            row["unit"] = "bp"
            row["basis"] = "명목 기간변화 − 실질 기간변화"
            out[k] = row
    return out or None


def nyfed_effr():
    """실효 연방기금금리(EFFR) — 뉴욕연은 공개 API. 인증키가 필요 없다.

    지금까지 정책금리 실측치가 없어서 선물 내재금리를 1개월물 국채와 견주는
    우회를 썼는데, 그 비교는 틀린 답을 준다 — 단기 국채는 정책금리 위에서
    거래되는 게 보통이라 "선물이 국채보다 낮다" 를 완화 기대로 읽으면 안 된다.
    EFFR 이 있으면 선물 내재금리와 직접 견줄 수 있다.

    하루 지연 공표라 발표일(effectiveDate)이 시세일보다 하루 이르다.
    """
    # 400 영업일치를 한 번에 받는다. 다섯 줄만 받던 때는 기간 변화를 낼 수가
    # 없었다 — 같은 호출에 숫자만 더 딸려 오므로 값이 공짜다.
    j = json.loads(_get("https://markets.newyorkfed.org/api/rates/unsecured/"
                        "effr/last/400.json", timeout=40))
    rows = [r for r in j.get("refRates", []) if r.get("type") == "EFFR"]
    if not rows:
        raise ValueError("EFFR 행 없음")
    last = rows[0]
    out = {"effr_pct": float(last["percentRate"]),
           "date": last.get("effectiveDate"),
           "percentile_1": last.get("percentPercentile1"),
           "percentile_99": last.get("percentPercentile99"),
           "volume_bn_usd": last.get("volumeInBillions"),
           "note": "실효 연방기금금리. 하루 지연 공표라 시세일보다 하루 이르다",
           "source_url": "https://markets.newyorkfed.org/api/rates/unsecured/effr"}
    bars = []
    for r in rows:
        d = _iso(r.get("effectiveDate"))
        try:
            v = float(r["percentRate"])
        except (KeyError, TypeError, ValueError):
            continue
        if d:
            bars.append((d, v))
    bars.sort()
    if len(bars) > 2:
        p = _perf(bars, bars[-1][1], as_bp=True)
        if p:
            out["perf"] = p
            out["series_days"] = len(bars)
    return out


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
    # 종가. 그동안 이 블록에는 시가·고가·저가·전일종가만 있고 **종가가
    # 없어서** 브리핑의 선물 줄이 늘 NOT FOUND 였다. 응답에서 현재가가 어느
    # 이름으로 오는지 확정할 수 없어 널리 쓰이는 이름을 차례로 본다.
    # 하나도 못 찾으면 원문을 남겨 다음번에 이름을 고칠 수 있게 한다.
    for cand in ("closePrice", "currentPrice", "tradePrice", "nowPrice"):
        c = n(info.get(cand)) if cand in info else n(j.get(cand))
        if c:
            out["close"] = c
            out["close_field"] = cand
            break
    else:
        out["close_note"] = "현재가 필드를 못 찾았다. 후보: %s" % ", ".join(sorted(info)[:12])
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "futures_fields.json"), "w",
                      encoding="utf-8") as f:
                json.dump({"totalInfos": info, "top_level": sorted(j)}, f,
                          ensure_ascii=False, indent=1)
    if out.get("close") and prev:
        out["change"] = round(out["close"] - prev, 2)
        out["change_pct"] = round((out["close"] / prev - 1) * 100, 2)
    # 기간 수익률은 이 응답에 계열이 없어 낼 수 없다. 지어내지 않고 밝힌다.
    out["perf_note"] = ("이 응답에는 일별 계열이 없어 기간 수익률을 낼 수 없다. "
                        "현물 코스피200 지수(indices.kospi200)로 대신 보십시오")

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


def attach_history_perf(out, path="data/market/history.json"):
    """쌓아 둔 history.json 으로 **네이버 스냅숏 항목들의 기간 변화**를 만든다.

    네이버는 「오늘 값」만 준다. 업종 등락률·예탁금·신용잔고·국내 금리가 다
    그렇고, 그래서 브리핑의 이 표들만 기간 수익률 칸이 늘 비어 있었다.
    그런데 그 값들은 이미 날마다 history.json 에 쌓이고 있다 — 새로 받을
    것 없이 그 파일만 읽으면 된다.

    `update_history` 보다 **먼저** 돌려야 한다. 오늘 값은 아직 파일에 없으므로
    여기서 계열 끝에 붙여 쓴다.

    닿는 구간까지만 낸다. 넉 달치(120행)만 남기므로 1년·연초 대비는 파일이
    그만큼 쌓인 뒤에야 나온다 — 없는 구간은 지어내지 않고 뺀다.
    """
    try:
        with open(path, encoding="utf-8") as f:
            rows = json.load(f).get("rows") or []
    except (OSError, ValueError):
        return
    kd = (out.get("indices", {}).get("kospi") or {}).get("date")
    rows = [r for r in rows if r.get("date") != kd]      # 오늘 행은 아래에서 새로 붙인다
    hits = []

    # ── 업종 등락률 ────────────────────────────────────────────────
    # 업종은 **지수가 아니라 일간 등락률**로만 온다. 그래서 기간 수익률은 두
    # 값의 비가 아니라 **일간 등락률을 이어 곱한 것**이다. 착각하기 쉬운 자리라
    # 단위에 basis 를 붙여 둔다.
    today_sec = {s["name"]: s.get("change_pct")
                 for s in (out.get("sectors") or {}).get("all") or [] if s.get("name")}
    if today_sec and rows:
        hist = [(r["date"], r.get("sectors") or {}) for r in rows if r.get("sectors")]
        spans = {"w1": 5, "m1": 20, "m3": 60}
        for s in (out.get("sectors") or {}).get("all") or []:
            nm = s.get("name")
            if nm is None or s.get("change_pct") is None:
                continue
            p = {}
            for key, ndays in spans.items():
                take = [h[1].get(nm) for h in hist[-(ndays - 1):]] if ndays > 1 else []
                take = [x for x in take if x is not None] + [s["change_pct"]]
                # 쌓인 날이 모자라면 그 구간은 **뺀다**. 10일치를 「3개월」이라
                # 적으면 1개월과 3개월이 같은 숫자로 나와 거짓이 된다.
                if len(take) < ndays * 0.8:
                    continue
                acc = 1.0
                for x in take:
                    acc *= (1 + x / 100.0)
                p[key] = round((acc - 1) * 100, 2)
                p[key + "_days"] = len(take)
            if p:
                p["unit"] = "%"
                p["basis"] = "일간 등락률 누적(지수 계열이 아님). 쌓인 날수만큼만 낸다"
                s["perf"] = p
        hits.append("sectors")

    # ── 예탁금 · 신용잔고 · 펀드 ─────────────────────────────────────
    # 자체 series 가 20영업일이라 3개월은 history 를 함께 봐야 닿는다.
    mf = (out.get("money_flow") or {}).get("latest") or {}
    if mf:
        own = {r.get("date"): r for r in (out.get("money_flow") or {}).get("series") or []}
        for r in rows:
            m = r.get("money_flow") or {}
            if m.get("date") and m["date"] not in own:
                own[m["date"]] = m
        perf = {}
        for field in ("deposit", "credit_balance", "fund_equity"):
            bars = sorted((_iso(d), v[field]) for d, v in own.items()
                          if _iso(d) and v.get(field) is not None)
            if len(bars) < 3 or mf.get(field) is None:
                continue
            p = _perf(bars, mf[field])
            if not p:
                continue
            # 금액이라 증감률보다 **증감액(억원)** 이 먼저 읽힌다. 둘 다 낸다.
            d0 = bars[-1][0]
            for key, back in (("w1", d0 - timedelta(days=7)),
                              ("m1", _months_before(d0, 1)),
                              ("m3", _months_before(d0, 3))):
                ref = None
                for dt, c in bars:
                    if dt <= back:
                        ref = c
                    else:
                        break
                if ref is not None:
                    p[key + "_delta"] = round(mf[field] - ref, 1)
            p["basis"] = "금투협 결제일 기준. 증감액 단위는 억원"
            perf[field] = p
        if perf:
            out["money_flow"]["perf"] = perf
            hits.append("money_flow")

    # ── 국내 금리(네이버 스냅숏) ─────────────────────────────────────
    # ECOS 가 되짚어 주는 것은 국고채·회사채·CD 뿐이다. 콜금리와 코픽스는
    # 어느 원천에도 계열이 없어 여기서만 기간 변화가 나온다.
    rk = out.get("rates_kr") or {}
    if rk and rows:
        perf = {}
        for field in ("ktb1y", "ktb3y", "ktb5y", "ktb10y", "cd91", "call",
                      "corp3y", "cofix_new", "cofix_balance"):
            if rk.get(field) is None:
                continue
            bars = sorted((_iso(r["date"]), (r.get("rates_kr") or {})[field])
                          for r in rows
                          if _iso(r.get("date")) and (r.get("rates_kr") or {}).get(field) is not None)
            bars.append((_iso(kd) or date.today(), rk[field]))
            if len(bars) < 3:
                continue
            p = _perf(bars, rk[field], as_bp=True)
            if p:
                p["basis"] = "네이버 시장지표 누적본(history.json) 대비"
                perf[field] = p
        if perf:
            out["rates_kr"]["perf"] = perf
            hits.append("rates_kr")

    if hits:
        out.setdefault("sources", {})["derived:history_perf"] = {
            "ok": True, "blocks": hits, "history_rows": len(rows)}


def update_history(out, path="data/market/history.json"):
    """날마다 바뀌는 몇 가지를 한 파일에 쌓아 둔다.

    지금까지는 등락 종목 수·업종 등락률·투자자별 수급의 **추이**를 쓰려면
    날짜별 스냅숏(2026-08-13.json 같은 것)을 하나씩 열어 손으로 이어 붙여야
    했다. 그 계열을 여기에 모아 두면 한 파일만 읽으면 된다.

    시세일(코스피 일봉 날짜)을 열쇠로 삼아 덮어쓴다 — 하루에 여러 번 돌아도
    행이 늘지 않는다. 넉 달치(120행)만 남긴다.
    """
    kd = (out.get("indices", {}).get("kospi") or {}).get("date")
    if not kd:
        return
    mi = out.get("market_internals") or {}
    mf = (out.get("money_flow") or {}).get("latest") or {}
    inv = out.get("investors_kospi") or []          # 최신이 맨 앞인 리스트다
    row = {"date": kd, "collected_kst": out["generated_at_kst"]}
    for k in ("kospi", "kosdaq"):
        q = out.get("indices", {}).get(k) or {}
        if q.get("close"):
            row[k] = {"close": q["close"], "change_pct": q.get("change_pct")}
        b = (mi.get(k) or {}).get("breadth")
        if b:
            row.setdefault("breadth", {})[k] = b
    if out.get("sectors", {}).get("all"):
        row["sectors"] = {s["name"]: s.get("change_pct")
                          for s in out["sectors"]["all"] if s.get("name")}
    if mf:
        row["money_flow"] = {k: mf.get(k) for k in
                             ("date", "deposit", "deposit_delta", "credit_balance",
                              "credit_balance_delta", "margin_due", "margin_due_delta",
                              "fund_equity") if k in mf}
    if inv:
        row["investors_kospi"] = {k: inv[0].get(k)
                                  for k in ("date", "retail", "foreign", "institution")}
    rk = out.get("rates_kr") or {}
    if rk:
        # cofix_balance 도 쌓는다 — 빠져 있어서 잔액 기준 코픽스만 기간 변화를
        # 낼 수 없었다. 주택담보대출 이야기에 늘 같이 나오는 값이다.
        row["rates_kr"] = {k: rk[k] for k in
                           ("ktb1y", "ktb3y", "ktb5y", "ktb10y", "cd91", "call",
                            "corp3y", "cofix_new", "cofix_balance") if k in rk}
    won = (out.get("usdkrw_naver") or {}).get("rate")
    if won:
        row["usdkrw"] = won

    try:
        with open(path, encoding="utf-8") as f:
            hist = json.load(f)
        rows = [r for r in hist.get("rows", []) if r.get("date") != kd]
    except (OSError, ValueError):
        rows = []
    rows.append(row)
    rows.sort(key=lambda r: r["date"])
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"note": "날짜별 시장 내부 지표 누적본. 최신이 맨 아래다.",
                   "unit": "등락 종목 수는 개, 수급·예탁금은 억원",
                   "count": len(rows[-120:]), "rows": rows[-120:]},
                  f, ensure_ascii=False, indent=1)


def _cross_perf(a, b, op):
    """두 통화쌍의 기간 수익률에서 재정환율의 기간 수익률을 만든다.

    크로스 = A ÷ B 이면 크로스의 배수는 A 배수 ÷ B 배수다. 그래서
    (1+ra)/(1+rb) − 1 이 된다. 곱셈 쪽은 (1+ra)(1+rb) − 1.
    **수준값을 나눠 만든 뒤 다시 기간 수익률을 재는 것과 같은 값**이고,
    일봉을 두 벌 더 받지 않아도 된다.

    기준일이 하루쯤 어긋날 수 있다 — 24시간 시장이라 둘 다 같은 봉을 쓰지만
    한쪽만 결측인 날이 있다. 그래서 기간이 양쪽에 다 있을 때만 낸다.
    """
    if not a or not b:
        return None
    out = {}
    for k in ("w1", "m1", "m3", "m6", "y1", "ytd"):
        ra, rb = a.get(k), b.get(k)
        if ra is None or rb is None:
            continue
        f = (1 + ra / 100.0) * (1 + rb / 100.0) if op == "mul" \
            else (1 + ra / 100.0) / (1 + rb / 100.0)
        out[k] = round((f - 1) * 100, 2)
    if not out:
        return None
    out["unit"] = "%"
    froms = [x.get("from") for x in (a, b) if x.get("from")]
    if froms:
        out["from"] = max(froms)
    return out


def build_fx(out):
    """환율 표를 한 덩어리로 만든다 — 수준·전일대비·기간 추이를 한 줄에.

    원화 크로스(원/엔·원/위안·원/유로·원/헤알·원/호주달러)는 받아 오지 않고
    원/달러에서 만든다. 국내 고시 환율이 그렇게 만들어지기 때문이다 — 원화는
    달러 말고는 직접 거래되는 시장이 사실상 없어서, 나머지는 전부 달러를
    거쳐 계산한 **재정환율**이다. 계산해서 쓰는 게 편법이 아니라 정공법이다.
    """
    src = dict(out.get("indices") or {})
    src.update(out.get("fx_pairs") or {})
    base = src.get("usdkrw") or {}
    rows, missing = [], []

    for key, ko, en, how, mul, note in FX_ROWS:
        if isinstance(how, str):
            q = src.get(how)
            if not q or q.get("close") is None:
                missing.append(ko)
                continue
            row = {"key": key, "name_ko": ko, "name_en": en,
                   "symbol": q.get("symbol"), "date": q.get("date"),
                   "close": q.get("close"), "prev_close": q.get("prev_close"),
                   "change": q.get("change"), "change_pct": q.get("change_pct"),
                   "basis": "야후 직접"}
            if q.get("perf"):
                row["perf"] = q["perf"]
        else:
            op, other = how
            leg = src.get(other) or {}
            if not base.get("close") or not leg.get("close"):
                missing.append(ko)
                continue
            def cross(x, y):
                return x * y if op == "mul" else x / y
            close = cross(base["close"], leg["close"])
            prev = None
            if base.get("prev_close") and leg.get("prev_close"):
                prev = cross(base["prev_close"], leg["prev_close"])
            row = {"key": key, "name_ko": ko, "name_en": en,
                   "symbol": "%s %s %s" % (base.get("symbol"),
                                           "×" if op == "mul" else "÷",
                                           leg.get("symbol")),
                   "date": base.get("date"),
                   "close": _num(close), "prev_close": _num(prev),
                   "change": _num(close - prev) if prev else None,
                   "change_pct": _num((close / prev - 1) * 100) if prev else None,
                   "basis": "재정환율(USD 경유 계산)"}
            p = _cross_perf(base.get("perf"), leg.get("perf"), op)
            if p:
                row["perf"] = p
            if leg.get("date") and base.get("date") and leg["date"] != base["date"]:
                row["date_note"] = "두 다리의 기준일이 다르다: %s / %s" % (
                    base["date"], leg["date"])
        if mul != 1:
            for k in ("close", "prev_close", "change"):
                if row.get(k) is not None:
                    row[k] = _num(row[k] * mul)
            row["scale"] = mul
            row["scale_note"] = "국내 고시 관행에 맞춰 %d배로 적는다(등락률은 배수와 무관)" % mul
        row["note_ko"], row["note_en"] = note
        rows.append(row)

    if not rows:
        return None
    res = {"rows": rows,
           "note": "원화 크로스는 원/달러에서 계산한 재정환율입니다. "
                   "국내 고시 환율과 소수점 아래에서 다를 수 있습니다.",
           "source": "Yahoo Finance 일봉 (기간은 달력 기준, 휴장이면 직전 거래일)"}
    if missing:
        res["missing"] = missing
    return res


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

    # 환율 — 원화 크로스를 만들 달러 상대 통화쌍. 나머지 다리는 indices 에 있다.
    for name, sym in YAHOO_FX.items():
        v, st = run(name, yahoo_quote, sym)
        out["sources"]["yahoo:fx:" + sym] = st
        if v:
            out.setdefault("fx_pairs", {})[name] = v

    # 국내 상장 ETF — 고객이 실제로 사는 물건
    for name, sym in YAHOO_KR_ETF.items():
        v, st = run(name, yahoo_quote, sym)
        out["sources"]["yahoo:etf:" + sym] = st
        if v:
            out.setdefault("kr_etf", {})[name] = attach_note(name, v)

    # 미국 업종 ETF · 미국 개별 종목 — 모닝 브리핑에서 국내 개장 전 흐름을 본다
    for name, sym in YAHOO_US_SECTORS.items():
        v, st = run(name, yahoo_quote, sym)
        out["sources"]["yahoo:sector:" + sym] = st
        if v:
            out.setdefault("us_sectors", {})[name] = attach_note(name, v)
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

    # 실질금리(TIPS)와 기대인플레이션 — 같은 재무부 CSV, type 만 다르다
    v, st = run("treasury_real", treasury_real_yields, now)
    out["sources"]["treasury:real_curve"] = st
    if v:
        out["rates_us_real"] = v
        # 기대인플레이션 = 명목 − 실질. 두 곡선의 기준일이 같을 때만 낸다.
        nom = out.get("rates_us", {})
        if nom.get("date") == v.get("date"):
            bei = {k: round(nom["curve"][k] - v["curve"][k], 3)
                   for k in v["curve"] if k in nom.get("curve", {})}
            out["breakeven"] = {
                "unit": "%", "date": v["date"], "curve": bei,
                "note": "기대인플레이션(브레이크이븐) = 명목 국채금리 − 물가연동채(TIPS) 실질금리",
                "source_url": "https://home.treasury.gov (명목·실질 곡선 차)",
            }
            bp_ = breakeven_perf(nom, v)
            if bp_:
                out["breakeven"]["perf"] = bp_
            nc, rc = nom.get("prev_curve") or {}, v.get("prev_curve") or {}
            chg = {k: round((bei[k] - (nc[k] - rc[k])) * 100)
                   for k in bei if k in nc and k in rc}
            if chg:
                out["breakeven"]["change_bp"] = chg

    # 실효 연방기금금리 — 선물 내재금리를 견줄 실측 정책금리
    v, st = run("nyfed_effr", nyfed_effr)
    out["sources"]["nyfed:effr"] = st
    if v:
        out["policy_rate_us"] = v

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
        implied = round(100 - ff["close"], 4)
        out["fed_implied"] = {
            "contract_price": ff["close"],
            "implied_rate_pct": implied,
            "quote_date": ff.get("date"),
            "note": "해당 결제월의 평균 연방기금금리 기대치. policy_rate_us.effr 와 견주십시오 "
                    "— 단기 국채와 견주면 안 됩니다(국채는 정책금리 위에서 거래되는 게 보통)",
            "source": "CBOT 30일 연방기금 금리선물 (ZQ=F)",
        }
        # 실측 정책금리 대비 몇 bp 인지까지 내준다. 부호가 곧 인상/인하 기대다.
        eff = out.get("policy_rate_us", {}).get("effr_pct")
        if eff is not None:
            out["fed_implied"]["effr_pct"] = eff
            out["fed_implied"]["vs_effr_bp"] = round((implied - eff) * 100)
        # 기간 변화(bp). ZQ=F 의 perf 는 **가격** 등락률(%)이라 그대로 쓰면 안
        # 된다 — 내재금리는 100 − 가격이므로 가격이 오르면 금리는 내린다.
        # 등락률로 그때의 가격을 되짚어 금리 차이로 바꾼다.
        pp = ff.get("perf") or {}
        rp = {}
        for h in ("w1", "m1", "m3", "m6", "y1", "ytd"):
            v = pp.get(h)
            if v is None or v <= -100:
                continue
            then_price = ff["close"] / (1 + v / 100.0)
            rp[h] = round(((100 - ff["close"]) - (100 - then_price)) * 100, 1)
        if rp:
            rp["unit"] = "bp"
            rp["basis"] = "내재금리(100 − 가격) 기준. 선물 가격 등락률에서 되짚었다"
            out["fed_implied"]["perf"] = rp

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

    # 증권업종과 미래에셋증권 **자체**의 이슈. 리서치 자료가 아니라 회사 소식이다.
    v, st = run("broker_news", broker_news, now)
    out["sources"]["naver:broker_news"] = st
    if v:
        out["broker_news"] = v

    # 외국계 IB · 해외 투자전문가가 말한 문장. 받아 둔 본문을 훑을 뿐이라 공짜다.
    try:
        ib = ib_mentions((out.get("news") or {}).get("articles"),
                         (out.get("broker_news") or {}).get("mirae"),
                         (out.get("broker_news") or {}).get("sector"))
        if ib["count"]:
            out["ib_mentions"] = ib
        out["sources"]["derived:ib_mentions"] = {"ok": bool(ib["count"]),
                                                 "count": ib["count"],
                                                 "names": ib["names"][:12]}
        if not ib["count"]:
            out["sources"]["derived:ib_mentions"]["error"] = \
                "오늘 기사 본문에 외국계 IB·전문가 언급이 없다"
    except Exception as e:                                        # noqa: BLE001
        out["sources"]["derived:ib_mentions"] = {
            "ok": False, "error": "%s: %s" % (type(e).__name__, e)}

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

    # 환율 표 — 위에서 받은 통화쌍을 모아 원화 크로스까지 만든다
    try:
        fx = build_fx(out)
        if fx:
            out["fx"] = fx
        out["sources"]["derived:fx"] = {"ok": bool(fx),
                                        "rows": len(fx["rows"]) if fx else 0}
    except Exception as e:                                        # noqa: BLE001
        out["sources"]["derived:fx"] = {"ok": False,
                                        "error": "%s: %s" % (type(e).__name__, e)}

    # 네이버 스냅숏 항목의 기간 변화 — 쌓아 둔 history.json 으로 만든다.
    # 반드시 latest.json 을 쓰기 **전에**, update_history 보다 **먼저** 돈다.
    try:
        attach_history_perf(out)
    except Exception as e:                                        # noqa: BLE001
        out["sources"]["derived:history_perf"] = {
            "ok": False, "error": "%s: %s" % (type(e).__name__, e)}

    ok = sum(1 for s in out["sources"].values() if s["ok"])
    out["summary"] = {"sources_tried": len(out["sources"]), "sources_ok": ok}

    os.makedirs("data/market", exist_ok=True)
    stamp = now.strftime("%Y-%m-%d")
    for path in ("data/market/latest.json", "data/market/%s.json" % stamp):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)

    # 시장 내부 지표 추이 — 스냅숏을 손으로 이어 붙이지 않아도 되게 쌓아 둔다
    try:
        update_history(out)
    except Exception as e:                                    # noqa: BLE001
        print("!! history 갱신 실패: %s" % e)

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
