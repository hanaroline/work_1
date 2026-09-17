#!/usr/bin/env python3
"""미국 주요기업 실적 어닝스 인텔리전스 — 주장 대장 + 화면 데이터 생성.

이 파일이 수치의 단일 출처다. 화면(earnings-intel.html)이 읽는 JSON 과
검산용 주장 대장(claims.json)이 모두 여기서 나온다. 화면에 손으로 숫자를
적지 않는 것이 이 구조의 전부다.

    python3 scripts/build_earnings.py          # 대장 + 화면 데이터 생성
"""
from __future__ import annotations

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "earnings"
ASOF = "2026-09-17"

# 컨센서스는 제공사마다 다르다(LSEG · Zacks · StreetAccount · Visible Alpha).
# 한 기업 안에서는 한 출처를 쓰고, 기업 간 비교는 "서프라이즈율"로만 한다.
SERIES = {
    "분기 매출": "기업 발표 실적치 (보도자료·8-K 기준)",
    "매출 컨센서스": "인용 기사에 명시된 제공사 (기업마다 상이 — 각 행의 출처 참조)",
    "EPS 컨센서스": "인용 기사에 명시된 제공사 (기업마다 상이)",
    "가이던스": "기업이 직접 제시한 전망 (애널리스트 추정치가 아님)",
    "밸류에이션": "stockanalysis.com 한 곳 · 2026-09-17 기준 (제공사 혼용 금지)",
    "LTM": "stockanalysis.com 한 곳 · 2026-09-17 조회 (분기 실적치와는 계열이 다름)",
    "시세": "stockanalysis.com 한 곳 · 종목마다 화면 기준일이 달라 각 행에 기준일을 남김",
}
SERIES_EN = {
    "Quarterly revenue": "As reported by the company (press release / 8-K)",
    "Revenue consensus": "The provider named in the cited article — differs by company; see each row's source",
    "EPS consensus": "The provider named in the cited article — differs by company",
    "Guidance": "Issued by the company itself, not an analyst estimate",
    "Valuation": "stockanalysis.com only · as of 2026-09-17 (never mixed across providers)",
    "LTM": "stockanalysis.com only · retrieved 2026-09-17 (a different series from the reported quarter)",
    "Market data": "stockanalysis.com only · the provider stamps a different date per ticker, kept on each row",
}

# ---------------------------------------------------------------- 기업 데이터
# rev/cons 단위 = 10억 달러(USD bn). cons=None 은 확인 실패 → 화면에서 n/a.
# guide: +1 상향·컨센상회 / 0 유지·단순제시 / -1 하향·약세 / None 미제시
C = [
 dict(t="NVDA", ko="엔비디아", en="NVIDIA", sec="정보기술", sub="반도체",
   per="FY27 Q2", pend="2026-07-26", rep="2026-08-26",
   rev=96.22, cons=92.17, yoy=106.0, eps=2.22, epsc=2.10,
   guide=0, gtxt="Q3 FY27 매출 1,080억달러 ±2%", gkind="차기분기",
   note="데이터센터 890억달러(+117% YoY), GAAP·non-GAAP 총이익률 75.0%",
   src="https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027",
   csrc="https://www.cnbc.com/2026/08/26/nvidia-nvda-earnings-report-q2-2027-live-updates.html", tier=1),
 dict(t="MSFT", ko="마이크로소프트", en="Microsoft", sec="정보기술", sub="소프트웨어",
   per="FY26 Q4", pend="2026-06-30", rep="2026-07-29",
   rev=90.01, cons=87.62, yoy=18.0, eps=4.74, epsc=4.24,
   guide=1, gtxt="Q1 FY27 Azure 성장률 +45%(cc) — 컨센 41.4% 상회", gkind="차기분기",
   note="Azure +43%, FY26 Azure 연매출 1,000억달러 돌파(+41%)",
   src="https://www.microsoft.com/en-us/investor/earnings/fy-2026-q4/press-release-webcast",
   csrc="https://www.cnbc.com/2026/07/29/microsoft-msft-q4-earnings-report-2026.html", tier=1),
 dict(t="AAPL", ko="애플", en="Apple", sec="정보기술", sub="하드웨어",
   per="FY26 Q3", pend="2026-06-27", rep="2026-07-30",
   rev=109.42, cons=108.65, yoy=16.0, eps=1.91, epsc=1.89,
   guide=-1, gtxt="당분기 가이던스 약세 — 공급 제약 언급(수치 미제시)", gkind="정성",
   note="iPhone +22%(6월분기 최대), Mac 104억달러 +29%, 서비스 307억달러",
   src="https://www.apple.com/newsroom/2026/07/apple-reports-third-quarter-results/",
   csrc="https://www.cnbc.com/2026/07/30/apple-earnings-live-updates.html", tier=1),
 dict(t="GOOGL", ko="알파벳", en="Alphabet", sec="커뮤니케이션", sub="인터넷",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-22",
   rev=119.8, cons=116.93, yoy=24.0, eps=None, epsc=None,
   guide=None, gtxt="분기 매출 가이던스 미제시(사규) — 2026 캡엑스 상향 발표", gkind="미제시",
   note="구글클라우드 248억달러 +82%, 클라우드 영업이익 88억달러(전년 28억)",
   src="https://s206.q4cdn.com/479360582/files/doc_financials/2026/q2/2026q2-alphabet-earnings-release.pdf",
   csrc="https://www.cnbc.com/2026/07/22/google-earnings-q2-goog-live-updates.html", tier=1,
   nextrep="2026-10-27", nextconf="2차"),
 dict(t="AMZN", ko="아마존", en="Amazon", sec="경기소비재", sub="이커머스·클라우드",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-30",
   rev=200.6, cons=196.47, yoy=20.0, eps=None, epsc=None,
   guide=0, gtxt="Q3 매출 1,970~2,020억달러, 영업이익 225~265억달러", gkind="차기분기",
   note="AWS +36.7%(18개분기 최고, 컨센 31%), AWS 연환산 1,690억달러, 백로그 4,960억달러",
   src="https://www.sec.gov/Archives/edgar/data/1018724/000101872426000024/amzn-20260630xex991.htm",
   csrc="https://www.cnbc.com/2026/07/30/amazon-amzn-q2-earnings-report-2026.html", tier=1),
 dict(t="META", ko="메타", en="Meta Platforms", sec="커뮤니케이션", sub="인터넷",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-29",
   rev=60.80, cons=60.17, yoy=28.0, eps=6.18, epsc=7.22,
   guide=0, gtxt="Q3 매출 610~640억달러(환율 약 1%p 역풍 가정)", gkind="차기분기",
   note="캡엑스 310.8억달러, FCF 7.84억달러, DAP 36.0억명 +3% — 매출 상회·EPS 하회",
   src="https://www.sec.gov/Archives/edgar/data/1326801/000162828026050596/meta-06302026xexhibit991.htm",
   csrc="https://www.tipranks.com/stocks/meta/earnings/q2-2026-report", tier=1,
   epsnote="GAAP 희석 EPS 와 LSEG 컨센서스 비교 — 조정 기준 아님"),
 dict(t="AVGO", ko="브로드컴", en="Broadcom", sec="정보기술", sub="반도체",
   per="FY26 Q3", pend="2026-08-02", rep="2026-09-02",
   rev=29.6, cons=None, yoy=86.0, eps=None, epsc=None,
   guide=1, gtxt="Q4 매출 348억달러(+93%), AI 217억달러 / FY26 AI 매출 약 580억달러로 상향", gkind="차기분기+연간상향",
   note="AI 반도체 167억달러 +221%(QoQ +54%), 반도체 208억달러 +127%, 영업이익 201억달러 +92%",
   src="https://investors.broadcom.com/news-releases/news-release-details/broadcom-inc-announces-third-quarter-fiscal-year-2026-financial",
   csrc="https://www.cnbc.com/2026/09/02/broadcom-avgo-q3-earnings-report-2026.html", tier=1),
 dict(t="TSLA", ko="테슬라", en="Tesla", sec="경기소비재", sub="자동차",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-22",
   rev=28.24, cons=26.43, consderived=True, yoy=26.0, eps=0.33, epsc=0.54,
   guide=None, gtxt="구체 수치 가이던스 확인되지 않음", gkind="미제시",
   note="인도 480,126대 +25%(예상 약 406,600대), 영업이익률 1.4%, FCF -10.9억달러",
   src="https://assets-ir.tesla.com/tesla-contents/IR/TSLA-Q2-2026-Update.pdf",
   csrc="https://www.cnbc.com/2026/07/22/tesla-tsla-q2-2026-earnings-report.html", tier=1,
   nextrep="2026-10-28", nextconf="2차",
   consnote="기사에 '컨센 대비 +6.84%' 만 명시 — 컨센서스 금액은 역산값",
   epsnote="조정 EPS. 다른 보도는 컨센 0.51달러 — 제공사 상이"),
 dict(t="AMD", ko="AMD", en="AMD", sec="정보기술", sub="반도체",
   per="CY26 Q2", pend="2026-06-27", rep="2026-08-04",
   rev=11.5, cons=11.3, yoy=50.0, eps=1.66, epsc=1.62,
   guide=0, gtxt="Q3 매출 130억달러 ±3억달러(중간값 +41% YoY)", gkind="차기분기",
   note="데이터센터 67억달러 +107%(컨센 65억), GAAP EPS 1.38",
   src="https://www.sec.gov/Archives/edgar/data/0000002488/000000248826000121/amdq22026earningsslidesf.htm",
   csrc="https://qz.com/amd-record-revenue-data-center-earnings-q2-2026-080426", tier=1),
 dict(t="ORCL", ko="오라클", en="Oracle", sec="정보기술", sub="소프트웨어",
   per="FY27 Q1", pend="2026-08-31", rep="2026-09-10",
   rev=19.3, cons=19.13, yoy=30.0, eps=None, epsc=None,
   guide=0, gtxt="RPO 의 매출 전환 가속 전망(정성) — 분기 매출 수치 미확보", gkind="정성",
   note="클라우드 116억달러 +62%, IaaS 74억달러 +121%, RPO 6,640억달러(+2,090억 YoY), 신규 AI 계약 300억달러+",
   src="https://www.oracle.com/news/announcement/q1fy27-earnings-release-2026-09-10/",
   csrc="https://www.fool.com/earnings/call-transcripts/2026/09/11/oracle-orcl-q1-2027-earnings-call-transcript/", tier=1),
 dict(t="CRM", ko="세일즈포스", en="Salesforce", sec="정보기술", sub="소프트웨어",
   per="FY27 Q2", pend="2026-07-31", rep="2026-08-26",
   rev=11.35, cons=11.32, yoy=11.0, eps=None, epsc=None,
   guide=1, gtxt="FY27 매출 461~464억달러로 상향(+11~12%)", gkind="연간상향",
   note="Agentforce ARR 15억달러+ (+240%), Agentforce+Data360 ARR 39억달러 (+210%)",
   src="https://www.salesforce.com/news/press-releases/2026/08/26/fy27-q2-earnings/",
   csrc="https://www.cnbc.com/2026/08/26/salesforce-crm-q2-earnings-report-2027.html", tier=1,
   warn="non-GAAP EPS 의 약 43% 가 전략투자 평가익 26억달러 — 영업 실적과 분리해 볼 것"),
 dict(t="PLTR", ko="팔란티어", en="Palantir", sec="정보기술", sub="소프트웨어",
   per="CY26 Q2", pend="2026-06-30", rep="2026-08-03",
   rev=1.94, cons=1.80, yoy=93.0, eps=None, epsc=None,
   guide=1, gtxt="FY26 매출 81.5~81.6억달러로 상향(종전 76.5~76.6억)", gkind="연간상향",
   note="미국 상업부문 7.64억달러 +149%, TCV 33.7억달러 +49%",
   src="https://www.sec.gov/Archives/edgar/data/0001321655/000132165526000039/a2026q2ex991pressrelease.htm",
   csrc="https://www.cnbc.com/2026/08/03/palantir-pltr-earnings-q2-2026.html", tier=1),
 dict(t="INTC", ko="인텔", en="Intel", sec="정보기술", sub="반도체",
   per="CY26 Q2", pend="2026-06-27", rep="2026-07-23",
   rev=16.1, cons=14.42, yoy=25.4, eps=0.42, epsc=0.21,
   guide=0, gtxt="Q3 매출 158~168억달러, non-GAAP EPS 0.38달러", gkind="차기분기",
   note="15년 만의 최고 성장률. DCAI 63억달러 +59%, CCG 89억달러 +13%, 파운드리 58억달러 +31%",
   src="https://www.intc.com/news-events/press-releases/detail/1776/intel-reports-second-quarter-2026-financial-results",
   csrc="https://www.cnbc.com/2026/07/23/intel-intc-earnings-report-q2-2026.html", tier=1),
 dict(t="MU", ko="마이크론", en="Micron", sec="정보기술", sub="반도체",
   per="FY26 Q3", pend="2026-05-28", rep="2026-06-25", repapprox=True,
   rev=41.5, cons=None, yoy=None, eps=25.11, epsc=None,
   guide=1, gtxt="Q4 FY26 매출 500억달러 — 컨센 434.5억달러를 65.5억 상회", gkind="차기분기",
   note="DRAM 313억달러(매출의 76%) +343% YoY, 총이익률 84.9%, HBM4 12단 램프 진행",
   src="https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Record-Results-for-the-Third-Quarter-of-Fiscal-2026/default.aspx",
   csrc="https://tradethepool.com/fundamental/micron-q3-fy2026-earnings-revenue-ai-boom-guidance/", tier=1,
   nextrep="2026-09-30", nextconf="확정",
   nextsrc="https://investors.micron.com/news/press-release/2026/Micron-Technology-to-Report-Fiscal-Fourth-Quarter-Results-on-September-30-2026/default.aspx"),
 dict(t="NFLX", ko="넷플릭스", en="Netflix", sec="커뮤니케이션", sub="미디어",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-16",
   rev=12.56, cons=12.59, yoy=13.0, eps=None, epsc=None,
   guide=0, gtxt="FY26 매출 510~514억달러로 범위 축소(종전 507~517억, 중간값 동일)", gkind="연간유지",
   note="시즌 내 몇 안 되는 매출 컨센서스 하회 사례. 광고 매출 2026년 약 30억달러 목표 유지, 영업이익률 목표 31.5%",
   src="https://s22.q4cdn.com/959853165/files/doc_financials/2026/q2/FINAL-Q2-26-Shareholder-Letter.pdf",
   csrc="https://www.cnbc.com/2026/07/16/netflix-nflx-earnings-q2-2026.html", tier=1),
 dict(t="JPM", ko="JP모건", en="JPMorgan Chase", sec="금융", sub="은행",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-14",
   rev=57.3, cons=None, yoy=28.0, eps=7.70, epsc=None,
   guide=1, gtxt="FY26 순이자이익 약 1,055억달러로 상향(3개월 전 1,030억)", gkind="연간상향",
   note="순이익 212억달러 +41%, ROE 24%, 순이자이익 256억달러 +10%",
   src="https://www.jpmorganchase.com/content/dam/jpmc/jpmorgan-chase-and-co/investor-relations/documents/quarterly-earnings/2026/2nd-quarter/6cded9fd-a164-4e6c-8cff-377357cf105c.pdf",
   csrc="https://www.cnbc.com/2026/07/13/bank-earnings-jpmorgan-chase-goldman-sachs-bank-of-america.html", tier=1,
   nextrep="2026-10-13", nextconf="확정",
   nextsrc="https://www.jpmorganchase.com/ir/news/2025/jpmc-announces-conference-calls-to-review-first-quarter-second-quarter-third-quarter-and-fourth-quarter-2026-earnings",
   consnote="매출 컨센서스가 출처마다 51.35 / 58.02 / 57.3 십억달러로 엇갈림(기준 상이) — 확인 실패로 처리",
   epsnote="'컨센 대비 +31.7%' 보도가 있으나 특이항목 포함 기준이 불명 — 서프라이즈 미산출"),
 dict(t="GS", ko="골드만삭스", en="Goldman Sachs", sec="금융", sub="투자은행",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-14",
   rev=20.34, cons=None, yoy=39.0, eps=20.98, epsc=14.47,
   guide=None, gtxt="가이던스 미제시(업종 관행)", gkind="미제시",
   note="순이익 66.3억달러(전년 37.2억), ROE 23.5%, 주식 74.2억달러 +72%, FICC 45.9억달러 +32%, IB 수수료 34.0억달러 +55%",
   src="https://www.goldmansachs.com/pressroom/press-releases/2026/2026-07-14-q2-results",
   csrc="https://finance.yahoo.com/markets/stocks/articles/goldman-q2-earnings-beat-solid-133500401.html", tier=1,
   consnote="매출 컨센서스 15.77십억달러 보도는 서프라이즈율(+26.2%)과 계산이 맞지 않아 채택하지 않음",
   epsnote="Zacks 컨센서스 기준"),
 dict(t="LLY", ko="일라이 릴리", en="Eli Lilly", sec="헬스케어", sub="제약",
   per="CY26 Q2", pend="2026-06-30", rep="2026-08-05",
   rev=22.97, cons=20.73, yoy=48.0, eps=8.38, epsc=6.01,
   guide=1, gtxt="FY26 매출 850~870억달러로 상향(종전 820~850억), EPS 35.50~36.50달러", gkind="연간상향",
   note="마운자로 99억달러 +91%, 미국 젭바운드 49억달러 +44%, 합산 149억달러(증가분 63억)",
   src="https://investor.lilly.com/news-releases/news-release-details/lilly-reports-second-quarter-2026-financial-results-raises-full",
   csrc="https://www.cnbc.com/2026/08/05/eli-lilly-lly-earnings-q2-2026.html", tier=1),
 dict(t="UNH", ko="유나이티드헬스", en="UnitedHealth", sec="헬스케어", sub="관리의료",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-16",
   rev=112.0, cons=110.9, yoy=0.4, eps=None, epsc=None,
   guide=1, gtxt="FY26 조정 EPS 19.50~20.00달러로 상향(종전 18.25달러 초과), MCR 88.1%±25bp 로 개선(종전 88.8%±50bp)", gkind="연간상향",
   note="매출은 거의 제자리(1,116→1,120억달러)이나 영업이익 80억달러(전년 52억, +55%) — 매출이 아니라 마진의 분기",
   src="https://www.sec.gov/Archives/edgar/data/0000731766/000073176626000191/uhgearnings_q22026vpower.htm",
   csrc="https://www.cnbc.com/2026/07/16/unitedhealth-group-unh-earnings-q2-2026.html", tier=1),
 dict(t="JNJ", ko="존슨앤드존슨", en="Johnson & Johnson", sec="헬스케어", sub="제약·의료기기",
   per="CY26 Q2", pend="2026-06-28", rep="2026-07-15",
   rev=25.3, cons=25.02, yoy=6.6, eps=2.90, epsc=2.86,
   guide=1, gtxt="FY26 보고 매출 1,008~1,014억달러로 상향(+7.0~7.6%), 조정 EPS 11.50~11.65달러(종전 11.30~11.50)", gkind="연간상향",
   note="메드테크 +4.5%. 연매출 10억달러 이상 제품·플랫폼 28개 — 1,000억달러 고지 가시권",
   src="https://www.investor.jnj.com/investor-news/news-details/2026/Johnson--Johnson-reports-Q2-2026-results-raises-2026-outlook/default.aspx",
   csrc="https://www.cnbc.com/2026/07/15/johnson-johnson-jnj-q2-earnings.html", tier=1),
 dict(t="WMT", ko="월마트", en="Walmart", sec="필수소비재", sub="종합소매",
   per="FY27 Q2", pend="2026-07-31", rep="2026-08-20",
   rev=187.9, cons=186.3, yoy=5.9, eps=0.81, epsc=0.73,
   guide=1, gtxt="FY27 매출 +4~5%(cc)로 상향(종전 +3.5~4.5%), 조정 EPS 2.80~2.87달러(종전 2.75~2.85)", gkind="연간상향",
   note="미국 동일점포 +2.6%(거래건수 주도, 건강·웰니스 80bp 역풍). 이커머스·광고·멤버십 + 관세 환급 효과",
   src="https://corporate.walmart.com/news/2026/08/20/walmart-releases-q2-fy27-earnings",
   csrc="https://www.cnbc.com/2026/08/20/walmart-wmt-q2-2027-earnings.html", tier=1,
   consnote="Zacks 컨센서스 기준. 다른 출처는 실적 187.94 / 컨센 186.77십억달러"),
 dict(t="COST", ko="코스트코", en="Costco", sec="필수소비재", sub="창고형할인",
   per="FY26 Q4 (16주)", pend="2026-08-30", rep=None,
   rev=93.9, cons=94.55, yoy=11.3, eps=None, epsc=None,
   guide=None, gtxt="정식 실적발표 전 — 가이던스 없음", gkind="발표전",
   note="월별 매출 공시로 순매출은 공개(FY26 연간 2,973억달러 +10.2%). 정식 발표는 9/24",
   src="https://theshelbyreport.com/2026/09/15/costco-caps-fy26-with-297-3b-in-sales-up-10-2-percent/",
   csrc="https://finance.yahoo.com/markets/stocks/articles/expect-costco-wholesales-q4-2026-134037110.html", tier=2,
   upcoming=True, nextrep="2026-09-24", nextconf="확정",
   nextsrc="https://investor.costco.com/events-and-presentations/events/event-details/2026/Q4-2026-Earnings-Call/default.aspx",
   consnote="컨센서스는 94.2~94.9십억달러 구간의 중간값. 정식 실적발표(9/24) 전이라 실제치와의 대조는 미확정"),
 dict(t="HD", ko="홈디포", en="Home Depot", sec="경기소비재", sub="주택개량",
   per="FY26 Q2", pend="2026-08-02", rep="2026-08-18",
   rev=47.9, cons=None, yoy=5.7, eps=None, epsc=None,
   guide=0, gtxt="FY26 가이던스 유지(재확인)", gkind="연간유지",
   note="동일점포 +1.7%(예상 +0.9% 상회, StreetAccount), 미국 +1.3%. 조정 EPS 4.92달러(전년 4.68)",
   src="https://corporate.homedepot.com/news/earnings/home-depot-announces-second-quarter-2026-earnings",
   csrc="https://www.cnbc.com/2026/08/18/home-depot-hd-q2-2026-earnings.html", tier=1,
   consnote="매출 컨센서스는 확인되지 않음. 동일점포 컨센서스(+0.9%)만 확인"),
 dict(t="CAT", ko="캐터필러", en="Caterpillar", sec="산업재", sub="기계",
   per="CY26 Q2", pend="2026-06-30", rep="2026-08-04",
   rev=20.5, cons=19.24, consderived=True, yoy=24.0, eps=8.17, epsc=6.19,
   guide=1, gtxt="FY26 매출 성장률을 mid~high teens 로 상향(4월 대비)", gkind="연간상향",
   note="백로그 720억달러 +92%(전분기比 +94억). 관세 비용 FY26 약 22억달러로 하향(종전 25억), 분기 4억달러(예상 7억)",
   src="https://www.cnbc.com/2026/08/04/caterpillar-cat-q2-2026-earnings.html",
   csrc="https://www.investing.com/news/transcripts/earnings-call-transcript-caterpillar-q2-2026-beats-forecasts-shares-jump-9-93CH-4834724", tier=2,
   consnote="기사에 '컨센 대비 +12.6억달러' 만 명시 — 컨센서스 금액은 역산값"),
 dict(t="XOM", ko="엑슨모빌", en="ExxonMobil", sec="에너지", sub="종합에너지",
   per="CY26 Q2", pend="2026-06-30", rep="2026-07-31",
   rev=116.0, cons=None, yoy=None, eps=3.52, epsc=3.56,
   guide=None, gtxt="가이던스 미제시(업종 관행)", gkind="미제시",
   note="순이익 145억달러(+105% YoY), 업스트림 79.3억달러 +54.7%, 생산 4,514 koebd(20여년 내 최고), 영업현금흐름 235.6억달러",
   src="https://investor.exxonmobil.com/company-information/press-releases/detail/1208/exxonmobil-announces-second-quarter-2026-results",
   csrc="https://www.ogj.com/general-interest/companies/news/55394938/exxonmobil-second-quarter-earnings-climb-to-145-billion-on-rising-oil-prices-record-permian-output", tier=1,
   consnote="'매출 114.53 vs 컨센 109.94십억달러' 보도는 SNS 단독 출처이고 회사 발표(매출·기타수익 1,160억달러)와 기준이 달라 채택하지 않음"),
]

# ---------------------------------------------------------------- 영문 문구
# 한/영 토글용. 수치·약자·티커는 양쪽 동일하게 둔다.
EN = {
 "NVDA": ("Q3 FY27 revenue $108B ±2%",
          "Data Center $89.0B (+117% YoY); GAAP and non-GAAP gross margin both 75.0%"),
 "MSFT": ("Q1 FY27 Azure growth +45% cc — above the 41.4% consensus",
          "Azure +43%; FY26 Azure revenue passed $100B (+41%)"),
 "AAPL": ("Soft guidance for the current quarter, citing supply constraints (no figure given)",
          "iPhone +22% (June-quarter record); Mac $10.4B +29%; Services $30.7B"),
 "GOOGL": ("No quarterly revenue guidance (company policy); raised 2026 capex",
           "Google Cloud $24.8B +82%; Cloud operating income $8.8B (vs $2.8B a year ago)"),
 "AMZN": ("Q3 net sales $197–202B; operating income $22.5–26.5B",
          "AWS +36.7%, fastest in 18 quarters (consensus 31%); AWS run rate $169B; backlog $496B"),
 "META": ("Q3 revenue $61–64B (assumes ~1pp FX headwind)",
          "Capex $31.08B; FCF $784M; DAP 3.60B +3% — revenue beat, EPS missed"),
 "AVGO": ("Q4 revenue $34.8B (+93%), AI $21.7B; FY26 AI revenue guidance raised to ~$58B",
          "AI semiconductors $16.7B +221% (+54% QoQ); semis $20.8B +127%; operating income $20.1B +92%"),
 "TSLA": ("No specific numeric guidance identified",
          "Deliveries 480,126 +25% (vs ~406,600 expected); operating margin 1.4%; FCF -$1.09B"),
 "AMD": ("Q3 revenue ~$13B ±$300M (midpoint +41% YoY)",
         "Data Center $6.7B +107% (consensus $6.5B); GAAP EPS $1.38"),
 "ORCL": ("Qualitative: RPO-to-revenue conversion expected to accelerate (no revenue figure)",
          "Cloud $11.6B +62%; IaaS $7.4B +121%; RPO $664B (+$209B YoY); $30B+ new AI contracts"),
 "CRM": ("FY27 revenue raised to $46.1–46.4B (+11–12%)",
         "Agentforce ARR above $1.5B (+240%); Agentforce + Data 360 ARR $3.9B (+210%)"),
 "PLTR": ("FY26 revenue raised to $8.15–8.16B (from $7.65–7.66B)",
          "US commercial $764M +149%; TCV $3.37B +49%"),
 "INTC": ("Q3 revenue $15.8–16.8B; non-GAAP EPS $0.38",
          "Fastest growth in 15 years. DCAI $6.3B +59%; CCG $8.9B +13%; Foundry $5.8B +31%"),
 "MU": ("Q4 FY26 revenue $50B — $6.55B above the $43.45B consensus",
        "DRAM $31.3B (76% of revenue) +343% YoY; gross margin 84.9%; HBM4 12-high ramping"),
 "NFLX": ("FY26 revenue narrowed to $51.0–51.4B (from $50.7–51.7B; same midpoint)",
          "One of the few revenue misses this season. Ads on track for ~$3B in 2026; 31.5% margin target"),
 "JPM": ("FY26 net interest income raised to ~$105.5B (from $103B three months earlier)",
         "Net income $21.2B +41%; ROE 24%; net interest income $25.6B +10%"),
 "GS": ("No guidance issued (sector practice)",
        "Net earnings $6.63B (vs $3.72B); ROE 23.5%; Equities $7.42B +72%; FICC $4.59B +32%; IB fees $3.40B +55%"),
 "LLY": ("FY26 revenue raised to $85–87B (from $82–85B); EPS $35.50–36.50",
         "Mounjaro $9.9B +91%; US Zepbound $4.9B +44%; combined $14.9B ($6.3B of the growth)"),
 "UNH": ("FY26 adjusted EPS raised to $19.50–20.00 (from above $18.25); MCR 88.1% ±25bp (from 88.8% ±50bp)",
         "Revenue nearly flat ($111.6B → $112.0B) but operating earnings $8.0B vs $5.2B (+55%) — a margin quarter, not a revenue one"),
 "JNJ": ("FY26 reported sales raised to $100.8–101.4B (+7.0–7.6%); adjusted EPS $11.50–11.65 (from $11.30–11.50)",
         "MedTech +4.5%. 28 products and platforms above $1B in annual sales — $100B in sight"),
 "WMT": ("FY27 net sales raised to +4–5% cc (from +3.5–4.5%); adjusted EPS $2.80–2.87 (from $2.75–2.85)",
         "US comps +2.6%, transaction-led (80bp health & wellness headwind). E-commerce, ads, membership plus tariff refunds"),
 "COST": ("Ahead of the formal release — no guidance",
          "Net sales already public via monthly disclosure (FY26 $297.3B +10.2%). Formal release Sept 24"),
 "HD": ("FY26 guidance reaffirmed",
        "Comps +1.7% vs +0.9% expected (StreetAccount); US +1.3%. Adjusted EPS $4.92 (vs $4.68)"),
 "CAT": ("FY26 sales growth raised to mid-to-high teens (from the April outlook)",
         "Backlog $72B +92% (+$9.4B QoQ). FY26 tariff cost cut to ~$2.2B (from $2.5B); $400M in the quarter vs $700M expected"),
 "XOM": ("No guidance issued (sector practice)",
         "Net income $14.5B (+105% YoY); Upstream $7.93B +54.7%; production 4,514 koebd, highest in over two decades; operating cash flow $23.56B"),
}
for _c in C:
    _g, _n = EN.get(_c["t"], ("", ""))
    _c["gtxt_en"], _c["note_en"] = _g, _n

# 확인 실패 사유(영문). 한글 주석과 한 쌍으로 유지한다.
CN_EN = {
 "TSLA": "the article gives only '+6.84% versus consensus' — the consensus figure is back-calculated",
 "JPM": "revenue consensus differs across sources ($51.35B / $58.02B / $57.3B, different bases) — treated as unverified",
 "GS": "the reported $15.77B consensus does not reconcile with the stated +26.2% surprise, so it was not used",
 "WMT": "Zacks consensus. Another source gives $187.94B actual against $186.77B consensus",
 "COST": "midpoint of the $94.2–94.9B consensus range. Ahead of the Sept 24 release, the comparison is provisional",
 "HD": "revenue consensus not found; only the comparable-sales consensus (+0.9%) was verified",
 "XOM": "the '$114.53B vs $109.94B consensus' report is a single social-media source and uses a different basis "
        "from the company release (revenues and other income $116.0B), so it was not used",
 "CAT": "the article gives only '+$1.26B versus consensus' — the consensus figure is back-calculated",
}
PER_EN = {"FY26 Q4 (16주)": "FY26 Q4 (16 wks)"}
for _c in C:
    _c["consnote_en"] = CN_EN.get(_c["t"], "")
    _c["per_en"] = PER_EN.get(_c["per"], _c["per"])

# ---------------------------------------------------------------- 밸류에이션
# 선행 P/E · PEG 는 **한 제공사(stockanalysis.com) 한 날짜**로 통일했다.
# 이유는 계열 혼용 사고다. 같은 시점 NVDA 선행 P/E 가 출처마다
# 18.12 / 23.8 / 24.50 / 48.30 (2.7배 차이), PLTR 은 P/E 147.69 / 177.89 / 249 로
# 엇갈렸다. 섞으면 순위가 통째로 바뀌므로 절대 섞지 않는다.
#
# 점수에는 **선행 P/E 만** 쓴다. PEG 는 제공사가 산식을 공개하지 않아
# 화면에 참고로만 싣고 점수에는 넣지 않는다.
VAL_SRC = "https://stockanalysis.com/stocks/%s/statistics/"
VAL_ASOF = "2026-09-17"
VAL = {   # 티커: (선행 P/E, PEG)
 "NVDA": (18.12, 0.35), "MSFT": (24.93, 1.55), "AAPL": (34.33, 3.25),
 "GOOGL": (25.39, 1.93), "AMZN": (28.76, 1.38), "META": (20.80, 1.04),
 "AVGO": (23.55, 0.50), "TSLA": (188.57, 6.97), "AMD": (42.61, 0.65),
 "ORCL": (19.10, 0.65), "CRM": (17.45, 1.08), "PLTR": (97.87, 1.82),
 "INTC": (None, None), "MU": (7.07, 0.04), "NFLX": (22.34, 1.05),
 "JPM": (14.96, 1.48), "GS": (14.89, 1.03), "LLY": (28.18, 1.33),
 "UNH": (22.37, 1.73), "JNJ": (24.06, 2.96), "WMT": (35.74, 3.48),
 "COST": (43.25, 4.00), "HD": (21.73, 4.04), "CAT": (28.32, 1.54),
 "XOM": (13.76, 1.20),
}
VAL_NOTE = {
 "INTC": ("직전 12개월 적자(매출 570.3억달러, 손실 -112.9억달러, EPS -2.30달러)로 "
          "P/E 가 성립하지 않는다. 선행 P/E 도 제공사 화면에서 확인되지 않았다."),
 "MU": "PEG 0.04 는 예상 이익 증가율이 극단적으로 커서 나온 값 — 배수 자체로 읽지 말 것.",
 "TSLA": "선행 P/E 188.57 은 이익 기저가 얕아 나온 값 — 이익이 회복되면 크게 움직인다.",
}
# 선행 P/E 를 0~100 으로 환산하는 고정 구간(하우스 기준).
# 지수 배수를 기준점으로 쓰지 않은 이유: 이번 수집에서 S&P500 선행 P/E 가
# 19.1 / 22.4 / 22.9 / 25.6 으로 엇갈려 기준점으로 삼을 수 없었다.
VAL_BAND = (12.0, 45.0)     # 12배 이하 100점, 45배 이상 0점 — 절대 기준(참고용)

# ---------------------------------------------------------------- 섹터 중립화
# 절대 배수로 점수를 내면 은행·에너지가 구조적으로 유리해진다. 그래서 점수는
# **섹터 대비 상대배수**(기업 선행 P/E ÷ 섹터 중앙값)로 낸다.
#
# 섹터 기준배수를 밖에서 구하지 못했다. 찾은 섹터 배수는 2025년 11월 기준이라
# 회사 배수(2026-09-17)와 시점이 어긋나 쓸 수 없었다. 그래서 **같은 제공사·
# 같은 날짜로 섹터별 대형주를 더 받아 중앙값을 직접 만든다.**
#
# 아래는 화면에 실리지 않고 기준배수 계산에만 쓰는 동종업체다. 대시보드
# 25개사가 얇은 섹터(산업재·에너지는 1개사뿐)를 메우는 것이 목적이다.
#
# 밸류에이션 기준그룹(vgrp)은 기본이 섹터지만, 한 섹터 안에서 배수 수준이
# 갈리는 곳은 하위업종으로 쪼갠다. 커뮤니케이션서비스가 그렇다 — 통신주가
# 중앙값을 끌어내려 알파벳이 V 14 점까지 떨어졌는데, 이는 알파벳이 비싸서가
# 아니라 비교 대상이 통신주였기 때문이다.
VGROUP = {
 "GOOGL": "커뮤니케이션 · 인터넷",
 "META":  "커뮤니케이션 · 인터넷",
 "NFLX":  "커뮤니케이션 · 인터넷",
}
VGROUP_EN = {
 "정보기술": "Information Technology", "경기소비재": "Consumer Discretionary",
 "헬스케어": "Health Care", "금융": "Financials", "필수소비재": "Consumer Staples",
 "산업재": "Industrials", "에너지": "Energy",
 "커뮤니케이션 · 인터넷": "Comm. Services · Internet",
 "커뮤니케이션 · 통신미디어": "Comm. Services · Telecom & Media",
}
PEERS = {
 "정보기술":   {"CSCO": 25.87, "IBM": 18.41, "TXN": 35.27, "QCOM": 17.97},
 # 커뮤니케이션서비스는 두 그룹으로 나눈다. 아래 '통신미디어' 그룹에는
 # 이 화면에 실린 기업이 없지만, 왜 쪼갰는지 보이도록 함께 계산해 싣는다.
 "커뮤니케이션 · 인터넷":   {"SPOT": 33.19, "PINS": 10.90, "MTCH": 13.99,
                       "RDDT": 26.11, "EA": 24.56},
 "커뮤니케이션 · 통신미디어": {"VZ": 8.50, "T": 9.66, "TMUS": 13.84, "CMCSA": 7.51,
                       "CHTR": 2.87, "DIS": 14.15, "FOXA": 11.34},
 "경기소비재": {"MCD": 19.05, "NKE": 21.62, "LOW": 16.34, "SBUX": 35.23},
 "헬스케어":   {"ABBV": 17.46, "MRK": 15.13, "PFE": 8.55, "TMO": 23.22},
 "금융":      {"BAC": 12.63, "WFC": 10.25, "MS": 17.80, "C": 11.29},
 "필수소비재": {"PG": 20.98, "KO": 26.38, "PEP": 16.16, "PM": 21.11,
              "MO": 10.40, "MDLZ": 19.95, "CL": 23.73},
 "산업재":    {"GE": 47.61, "RTX": 27.22, "BA": 173.65, "UNP": 21.07,
              "DE": 30.78, "LMT": 19.66, "ETN": 25.97},
 "에너지":    {"CVX": 13.51, "COP": 12.80, "SLB": 19.02, "EOG": 12.80},
}
# 상대배수를 0~100 으로 환산하는 구간. 섹터 중앙값의 절반이면 100점,
# 두 배면 0점. 중앙값과 같으면(1.0배) 67점이 아니라 (2.0-1.0)/1.5 = 67점 —
# 중립 지점이 50점이 아닌 것은 위쪽(비쌈)이 아래쪽(쌈)보다 폭이 넓기 때문이다.
REL_BAND = (0.5, 2.0)
MIN_PEERS = 5   # 이 아래면 섹터 중앙값을 만들지 않는다


# 기준그룹별로 남겨 둘 단서 — 대장 note 와 화면 각주에 함께 실린다.
VG_NOTE = {
 "커뮤니케이션 · 인터넷":
   " · 커뮤니케이션서비스를 인터넷과 통신미디어로 나눈 뒤의 그룹이다. "
   "나누기 전 섹터 중앙값은 14.15배였고, 그 기준으로는 알파벳 V 가 14점까지 떨어졌다.",
 "커뮤니케이션 · 통신미디어":
   " · 이 그룹에는 대시보드 수록 기업이 없다(대조용). CHTR 2.87배는 이례적으로 낮으나 "
   "중앙값이 흡수한다. WBD 는 제공사 값이 상장지마다 811~1,014배로 어긋나 제외했다.",
}


# ---------------------------------------------------------------- 기간 확장
# 분기 한 점만 보면 그 분기가 좋았는지만 알 수 있고 '추세'는 안 보인다.
# LTM(최근 12개월) 매출·성장률을 같은 제공사·같은 날짜로 함께 받아
#   가속도 = 직전분기 YoY − LTM YoY
# 를 만든다. 두 점뿐이지만 방향은 읽힌다.
#
# 분기별 시계열을 쓰지 않은 이유: 검색 요약이 회계분기 라벨을 섞는다.
# (NVDA 의 FY27 Q2 를 'Q1 FY2026' 으로, 2025년 분기를 2026년으로 표기한 사례 확인)
# 라벨이 틀린 시계열은 없느니만 못해서 채택하지 않았다.
LTM_SRC = "https://stockanalysis.com/stocks/%s/revenue/"
LTM = {   # 티커: (LTM 매출 USD bn, LTM 성장률 %)
 "NVDA": (302.97, 83.38), "MSFT": (331.84, 17.79), "AAPL": (466.82, 14.24),
 "GOOGL": (445.87, 20.05), "AMZN": (775.68, 15.77), "META": (228.25, 27.65),
 "AVGO": (75.47, 94.17), "TSLA": (103.62, 9.37), "AMD": (41.31, 39.54),
 "ORCL": (71.78, 21.62), "CRM": (43.94, 11.23), "PLTR": (5.22, 67.71),
 "INTC": (57.03, 7.47), "MU": (90.27, 166.98), "NFLX": (48.37, 16.02),
 "JPM": (186.33, 13.79), "GS": (66.20, 17.77), "LLY": (79.67, 49.58),
 "UNH": (450.13, 6.46), "JNJ": (97.93, 8.06), "WMT": (735.84, 6.16),
 "COST": (293.59, 9.23), "HD": (169.18, 2.50), "CAT": (74.73, 18.36),
 "XOM": (361.06, 9.62),
}
# 가속도는 계열이 다른 두 값의 차다 — 분기 YoY 는 회사 발표, LTM YoY 는
# 집계사이트 산정. 매출 정의가 어긋날 수 있는 곳은 따로 단서를 단다.
LTM_NOTE = {
 "JPM": "회사 발표 총순영업수익(57.3십억달러)과 집계사이트의 매출 정의가 달라 "
        "가속도는 방향만 참고할 것",
 "GS":  "회사 발표 순영업수익과 집계사이트의 매출 정의가 달라 가속도는 방향만 참고할 것",
 "MU":  "LTM +166.98% 는 메모리 업사이클 구간의 값 — 기저효과가 크다",
 "HD":  "같은 제공사의 통계 화면에서는 LTM 매출이 166.59십억달러로 조회된 적이 있다"
        "(조회 시점 차이). 이 화면은 매출 화면 값으로 통일한다",
 "ORCL": "같은 제공사의 통계 화면에는 LTM 매출이 67.36십억달러로 실려 있다"
         "(화면별 산정 차이). 이 화면은 매출 화면 값으로 통일한다 — P/S 도 이 값으로 나눈다",
}
ACCEL_BAND = 2.0    # ±2%p 안쪽이면 '유지'로 본다

# ---------------------------------------------------- 밸류에이션 지표 확장
# 표에 선행 P/E · PEG 만 있으면 '이익 기준' 한 축만 보인다. 매출을 다루는
# 화면인 만큼 **매출 기준 배수(P/S)** 를, 그리고 자본구조·감가상각 차이를
# 걷어낸 **EV/EBITDA** 를 함께 싣는다.
#
# P/S 는 제공사 요약에 실리지 않아 직접 계산한다 — 시가총액 ÷ LTM 매출.
# 분자·분모가 모두 같은 제공사라 계열은 지켜진다. 대신 두 값의 기준일이
# 서로 다를 수 있다(시가총액은 가격, LTM 은 분기 합산).
#
# 시가총액·EV/EBITDA 는 가격을 타고 매일 움직인다. 제공사 화면이 찍어 준
# 기준일이 종목마다 달라(8/31~9/17) 하루로 맞추지 못했다. 맞춘 척하지 않고
# 어긋난 종목은 기준일을 그대로 남긴다.
MCAP_SRC = "https://stockanalysis.com/stocks/%s/market-cap/"
MCAP = {   # 티커: 시가총액 USD bn
 "NVDA": 5270.0, "MSFT": 3660.0, "AAPL": 4550.0, "GOOGL": 4140.0,
 "AMZN": 2830.0, "META": 1720.0, "AVGO": 1770.0, "TSLA": 1410.0,
 "AMD": 850.67, "ORCL": 457.36, "CRM": 210.40, "PLTR": 409.24,
 "INTC": 530.97, "MU": 1150.0, "NFLX": 334.45, "JPM": 946.37,
 "GS": 314.46, "LLY": 1020.0, "UNH": 386.29, "JNJ": 651.25,
 "WMT": 850.02, "COST": 420.30, "HD": 331.00, "CAT": 374.15,
 "XOM": 683.19,
}
# 제공사 화면이 다른 날짜를 찍어 준 종목만 따로 적는다(나머지는 VAL_ASOF).
MCAP_ASOF = {
 "NVDA": "2026-09-11", "NFLX": "2026-09-14", "AMD": "2026-09-09",
 "PLTR": "2026-09-08", "JPM": "2026-08-31",
}
MCAP_NOTE = {
 "JPM": "제공사 화면 기준일이 8월 31일로 다른 종목보다 보름 이르다 — P/S 도 그만큼 옛값이다",
 "AMD": "같은 제공사의 다른 화면에서는 8월 24일 기준 750.81십억달러였다(가격 변동)",
 "PLTR": "같은 제공사의 8월 통계 화면에서는 447.67십억달러였다(가격 변동)",
 "CRM": "같은 제공사의 8월 25일 화면에서는 168.46십억달러였다(가격 변동)",
 "COST": "같은 제공사의 8월 20일 화면에서는 413.99십억달러였다(가격 변동)",
}
EVEB = {   # 티커: EV/EBITDA 배 — 확인 못 한 곳은 None
 "NVDA": 26.07, "MSFT": 19.09, "AAPL": 27.11, "GOOGL": 23.20,
 "AMZN": None, "META": 15.84, "AVGO": 43.08, "TSLA": 128.34,
 "AMD": 79.87, "ORCL": 33.57, "CRM": 19.62, "PLTR": 164.67,
 "INTC": 32.75, "MU": 16.48, "NFLX": 22.40, "JPM": None,
 "GS": None, "LLY": 25.65, "UNH": 20.32, "JNJ": 19.49,
 "WMT": 20.73, "COST": 29.63, "HD": 15.76, "CAT": 25.44,
 "XOM": 10.52,
}
EVEB_NOTE = {
 "AMZN": "미국 상장분 값이 제공사 요약에 실리지 않았다(해외 상장분은 14.48~17.12로 엇갈림) — 싣지 않는다",
 "JPM": "은행은 EBITDA 가 영업성과를 대표하지 않아 이 지표를 쓰지 않는다",
 "GS": "은행은 EBITDA 가 영업성과를 대표하지 않아 이 지표를 쓰지 않는다",
 "JNJ": "미국 상장분 19.49배 기준. 같은 제공사라도 상장지별로 12.69~16.42배까지 달라 미국분으로 통일했다",
 "ORCL": "제공사 통계 화면에 직접 실리지 않아 같은 제공사 비율 화면 값을 썼다",
 "TSLA": "128배는 이익 기저가 얕아 벌어진 값 — 배수 자체로 읽지 말 것",
 "PLTR": "165배는 배수라기보다 성장 기대가 반영된 값",
}
EVEB_NOTE_EN = {
 "AMZN": "the US listing's figure was not in the provider's summary (foreign listings ranged 14.48–17.12), so it is left out",
 "JPM": "EBITDA does not represent operating performance at a bank, so the metric is not used",
 "GS": "EBITDA does not represent operating performance at a bank, so the metric is not used",
 "JNJ": "on the US listing, 19.49x. The same provider shows 12.69–16.42x on other listings, so the US one is used",
 "ORCL": "not carried on the provider's statistics page, so the same provider's ratios page was used",
 "TSLA": "128x reflects a thin earnings base — do not read it as a multiple on its own",
 "PLTR": "165x reflects growth expectations more than a multiple",
}
# P/S 도 점수에는 넣지 않는다. V 점수는 지금처럼 **섹터 대비 선행 P/E** 한 축만
# 쓴다 — 지표를 늘린다고 점수를 늘리면 같은 비쌈을 두 번 세게 된다.

# --- 미래 방향 -------------------------------------------------------------
# 서드파티의 분기·연간 컨센서스는 확보하지 못했다(제공사 페이지 요약에 수치가
# 실리지 않음). 대신 **회사가 수치로 제시한 차기 분기 매출 가이던스**만 모은다.
# 이건 1차 출처이고 이미 위 gtxt 에 문장으로 들어 있는 값을, 숫자로 다시 세운 것이다.
# 범위로 제시된 것은 중간값을 쓰고 범위를 함께 남긴다.
GNEXT = {   # 티커: (중간값 USD bn, 표기, 대상 분기)
 "NVDA": (108.0, "1,080억달러 ±2%", "Q3 FY27"),
 "AVGO": (34.8,  "348억달러", "Q4 FY26"),
 "AMZN": (199.5, "1,970~2,020억달러", "Q3 CY26"),
 "META": (62.5,  "610~640억달러", "Q3 CY26"),
 "AMD":  (13.0,  "130억달러 ±3억달러", "Q3 CY26"),
 "INTC": (16.3,  "158~168억달러", "Q3 CY26"),
 "MU":   (50.0,  "500억달러", "Q4 FY26"),
}
GNEXT_EN = {
 "NVDA": "$108B ±2%", "AVGO": "$34.8B", "AMZN": "$197–202B", "META": "$61–64B",
 "AMD": "$13B ±$0.3B", "INTC": "$15.8–16.8B", "MU": "$50B",
}

# ---------------------------------------------------------------- 스코어
# 두 축을 따로 내고 합친다.
#   실적 모멘텀 — 발표된 실적만. 가격은 들어가지 않는다.
#   밸류에이션  — 가격 부담만. 실적은 들어가지 않는다.
BANDS = {"surprise": (-3.0, 8.0), "yoy": (-5.0, 60.0), "eps": (-10.0, 30.0)}
W = {"surprise": 25.0, "yoy": 35.0, "guide": 25.0, "eps": 15.0}
MIN_COVERAGE = 50.0   # 이 아래면 모멘텀 점수를 공표하지 않는다
MIX = {"momentum": 70.0, "valuation": 30.0}   # 투자매력도 결합 비중


def band(v, lo, hi):
    return max(0.0, min(100.0, (v - lo) / (hi - lo) * 100.0))


def score(c):
    """가중치는 '확인된 축' 사이에서만 재분배한다. 미확인을 0점으로 깔면
    데이터가 없는 기업이 나쁜 기업으로 둔갑한다."""
    parts, wsum = {}, 0.0
    if c.get("surprise") is not None:
        parts["surprise"] = band(c["surprise"], *BANDS["surprise"]); wsum += W["surprise"]
    if c.get("yoy") is not None:
        parts["yoy"] = band(c["yoy"], *BANDS["yoy"]); wsum += W["yoy"]
    if c.get("guide") is not None:
        parts["guide"] = {1: 100.0, 0: 50.0, -1: 0.0}[c["guide"]]; wsum += W["guide"]
    if c.get("epssurprise") is not None:
        parts["eps"] = band(c["epssurprise"], *BANDS["eps"]); wsum += W["eps"]
    if not wsum:
        return None, 0.0, parts
    tot = sum(parts[k] * W[k] for k in parts) / wsum
    # 커버리지가 낮으면 점수를 내지 않는다. 축 하나로 100점을 주면
    # '자료가 적은 기업'이 '좋은 기업'으로 둔갑한다.
    if wsum < MIN_COVERAGE:
        return None, round(wsum, 0), {k: round(v, 1) for k, v in parts.items()}
    return round(tot, 1), round(wsum, 0), {k: round(v, 1) for k, v in parts.items()}


for c in C:
    c["surprise"] = round((c["rev"] / c["cons"] - 1) * 100, 2) if c.get("cons") else None
    c["epssurprise"] = (round((c["eps"] / c["epsc"] - 1) * 100, 2)
                        if c.get("eps") is not None and c.get("epsc") else None)
    c["score"], c["coverage"], c["scoreparts"] = score(c)

    ltm, ltmg = LTM.get(c["t"], (None, None))
    c["ltm"], c["ltmg"], c["ltmnote"] = ltm, ltmg, LTM_NOTE.get(c["t"], "")
    # 가속도 = 직전분기 YoY − LTM YoY. 양수면 최근 분기가 지난 1년보다 빠르다.
    c["accel"] = (round(c["yoy"] - ltmg, 1)
                  if c.get("yoy") is not None and ltmg is not None else None)
    c["trend"] = (None if c["accel"] is None else
                  "up" if c["accel"] > ACCEL_BAND else
                  "down" if c["accel"] < -ACCEL_BAND else "flat")

    g = GNEXT.get(c["t"])
    c["gnext"], c["gnexttxt"], c["gnextper"] = (g if g else (None, None, None))
    c["gnexten"] = GNEXT_EN.get(c["t"])
    # 회사 가이던스 중간값이 직전 분기 대비 몇 % 인가 — 검증된 두 수의 나눗셈
    c["gnextqoq"] = (round((c["gnext"] / c["rev"] - 1) * 100, 1)
                     if c.get("gnext") and c.get("rev") else None)

    fpe, peg = VAL.get(c["t"], (None, None))
    c["fpe"], c["peg"], c["valnote"] = fpe, peg, VAL_NOTE.get(c["t"], "")

    c["mcap"] = MCAP.get(c["t"])
    c["mcapasof"] = MCAP_ASOF.get(c["t"], VAL_ASOF)
    c["mcapnote"] = MCAP_NOTE.get(c["t"], "")
    c["eveb"] = EVEB.get(c["t"])
    c["evebnote"] = EVEB_NOTE.get(c["t"], "")
    c["evebnote_en"] = EVEB_NOTE_EN.get(c["t"], "")
    # P/S = 시가총액 ÷ LTM 매출. 제공사가 주지 않아 직접 나눈 값이다.
    c["ps"] = (round(c["mcap"] / c["ltm"], 2)
               if c.get("mcap") and c.get("ltm") else None)
    # 배수가 낮을수록 높은 점수 — band() 를 뒤집어 쓴다.
    c["valabs"] = (round(100.0 - band(fpe, *VAL_BAND), 1)
                   if fpe is not None else None)

# --- 섹터 기준배수(중앙값)와 섹터 중립 V 점수 -------------------------------
def median(xs):
    xs = sorted(xs)
    n = len(xs)
    return None if not n else (xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2.0)


for c in C:
    c["vgrp"] = VGROUP.get(c["t"], c["sec"])

SECBENCH = {}
for _g in sorted({c["vgrp"] for c in C} | set(PEERS)):
    own = {c["t"]: c["fpe"] for c in C if c["vgrp"] == _g and c["fpe"] is not None}
    pool = dict(own); pool.update(PEERS.get(_g, {}))
    med = median(list(pool.values())) if len(pool) >= MIN_PEERS else None
    SECBENCH[_g] = dict(
        sec=_g, secEn=VGROUP_EN.get(_g, _g),
        median=(round(med, 2) if med is not None else None),
        n=len(pool), nOwn=len(own), nPeer=len(pool) - len(own),
        lo=(round(min(pool.values()), 2) if pool else None),
        hi=(round(max(pool.values()), 2) if pool else None),
        members=sorted(pool.items(), key=lambda kv: kv[1]))

for c in C:
    b = SECBENCH[c["vgrp"]]
    # 상대배수 = 기업 선행 P/E ÷ 섹터 중앙값. 1.0 이면 섹터 평균 수준.
    c["relpe"] = (round(c["fpe"] / b["median"], 2)
                  if c["fpe"] is not None and b["median"] else None)
    c["valscore"] = (round(100.0 - band(c["relpe"], *REL_BAND), 1)
                     if c["relpe"] is not None else None)
    c["secmed"] = b["median"]
    c["vgrpEn"] = b["secEn"]
    # 투자매력도는 두 축이 모두 있어야 낸다. 한쪽만으로 합성하면
    # 그 기업만 다른 잣대로 재는 것이 된다.
    c["appeal"] = (round(c["score"] * MIX["momentum"] / 100.0
                         + c["valscore"] * MIX["valuation"] / 100.0, 1)
                   if c["score"] is not None and c["valscore"] is not None else None)
    c["appealgap"] = ("momentum" if c["score"] is None else
                      "valuation" if c["valscore"] is None else None)


# ------------------------------------------------- 지수 레벨 집계 (외부 기관)
# 제공사마다 대상 유니버스와 산정 방식이 달라 한 칸에 섞지 않는다.
# 각 항목에 '누가 · 언제 기준 · 무엇을' 을 붙여서 넘긴다.
INDEX = [
 dict(k="rev_beat", ko="매출 컨센서스 상회 기업 비율", en="Companies beating revenue estimates",
      v="80%", ref="5년 평균 70% · 10년 평균 68%", ref_en="5-yr avg 70% · 10-yr avg 68%",
      who="FactSet Earnings Insight", scope="S&P 500 · 2026년 2분기",
      scope_en="S&P 500 · Q2 2026", url="https://www.factset.com/earningsinsight"),
 dict(k="rev_surp", ko="매출 실제치의 추정치 대비 상회폭", en="Aggregate revenue surprise",
      v="+2.8%", ref="5년 평균 +1.9% · 10년 평균 +1.6%", ref_en="5-yr avg +1.9% · 10-yr avg +1.6%",
      who="FactSet Earnings Insight", scope="S&P 500 · 2026년 2분기",
      scope_en="S&P 500 · Q2 2026", url="https://www.factset.com/earningsinsight"),
 dict(k="rev_growth", ko="지수 매출 성장률(YoY)", en="Index revenue growth (YoY)",
      v="12.8%", ref="2022년 2분기(13.9%) 이후 최고 · 2개분기 연속 두 자릿수",
      ref_en="Highest since Q2 2022 (13.9%) · second straight double-digit quarter",
      who="FactSet Earnings Insight", scope="S&P 500 · 2026년 2분기",
      scope_en="S&P 500 · Q2 2026",
      url="https://insight.factset.com/sp-500-reporting-highest-revenue-growth-in-3-years"),
 dict(k="eps_growth", ko="지수 이익 성장률(YoY)", en="Index earnings growth (YoY)",
      v="37.9%", ref="알파벳 제외 시 25.9% — 한 기업이 12%p 를 끌어올림",
      ref_en="25.9% excluding Alphabet — one company adds 12pp",
      who="FactSet Earnings Insight", scope="S&P 500 · 2026년 2분기",
      scope_en="S&P 500 · Q2 2026", url="https://www.factset.com/earningsinsight"),
 dict(k="q3_eps", ko="차기 분기 이익 성장률 전망", en="Next-quarter earnings growth estimate",
      v="28.7%", ref="6월 30일 기준 26.6% 에서 상향 · 예상 이익 7,960억달러",
      ref_en="Up from 26.6% as of June 30 · estimated earnings $796.0B",
      who="FactSet Earnings Insight", scope="S&P 500 · 2026년 3분기 추정",
      scope_en="S&P 500 · Q3 2026 estimate", url="https://www.factset.com/earningsinsight"),
 dict(k="q3_zacks", ko="차기 분기 매출 성장률 전망", en="Next-quarter revenue growth estimate",
      v="10.9%", ref="이익 +22.6% 동반 · FactSet 과 유니버스·산정방식이 달라 위 수치와 직접 비교 불가",
      ref_en="With earnings +22.6% · different universe and method from FactSet, not directly comparable",
      who="Zacks Q3 Earnings Preview", scope="2026년 3분기 추정",
      scope_en="Q3 2026 estimate",
      url="https://finance.yahoo.com/markets/stocks/articles/q3-earnings-preview-high-expectations-203800936.html"),
]

# ---------------------------------------------------------------- 주장 대장
claims, derived = [], []
for c in C:
    tag = c["t"]
    claims.append(dict(
        id=f"{tag}_REV", kind="reported_result", metric="분기 매출",
        text=f"{c['ko']} {c['per']} 매출", value=c["rev"], unit="USD bn",
        series=SERIES["분기 매출"], as_of=c["rep"] or ASOF, tier=c["tier"],
        source_url=c["src"], verdict="confirmed", render="assert",
        printed_on=["table-main", "chart-sector"]))
    if c.get("cons"):
        unv = bool(c.get("consderived"))
        claims.append(dict(
            id=f"{tag}_CONS", kind="consensus", metric="매출 컨센서스",
            text=f"{c['ko']} {c['per']} 매출 컨센서스", value=c["cons"], unit="USD bn",
            series=SERIES["매출 컨센서스"], as_of=c["rep"] or ASOF,
            tier=c["tier"], source_url=c["csrc"],
            verdict="confirmed", render="marked" if unv else "assert",
            note=c.get("consnote", ""), printed_on=["table-main"]))
        derived.append(dict(id=f"D_{tag}_SURP", kind="pct_change",
                            **{"from": f"{tag}_CONS", "to": f"{tag}_REV"},
                            printed=c["surprise"], tolerance=0.05))
    else:
        claims.append(dict(
            id=f"{tag}_CONS", kind="consensus", metric="매출 컨센서스",
            text=f"{c['ko']} {c['per']} 매출 컨센서스", value=0, unit="USD bn",
            series=SERIES["매출 컨센서스"], as_of=ASOF, tier=c["tier"],
            source_url=c["csrc"], verdict="unverified", render="omit",
            note=c.get("consnote", "공개 자료에서 확인되지 않음"), printed_on=[]))
    if c.get("guide") is not None or c.get("gkind") in ("미제시", "발표전"):
        claims.append(dict(
            id=f"{tag}_GUIDE", kind="company_guidance", metric="가이던스",
            text=f"{c['ko']} 가이던스 — {c['gtxt']}",
            value=({1: 1, 0: 0, -1: -1}[c["guide"]] if c.get("guide") is not None else 0),
            unit="방향(+1/0/-1)", series=SERIES["가이던스"],
            as_of=c["rep"] or ASOF, tier=c["tier"], source_url=c["src"],
            announced_on=c["rep"] or ASOF,
            attributed_to=f"{c['en']} (회사 발표)",
            target_period=c["gkind"],
            revision=({1: "up", 0: "unchanged", -1: "down"}[c["guide"]]
                      if c.get("guide") is not None else "new"),
            verdict="confirmed", render="assert", printed_on=["table-main"]))
    if c.get("gnext") is not None:
        claims.append(dict(
            id=f"{tag}_GNEXT", kind="company_guidance", metric="차기분기 매출 가이던스",
            text=f"{c['ko']} {c['gnextper']} 매출 가이던스 — {c['gnexttxt']}",
            value=c["gnext"], unit="USD bn", series=SERIES["가이던스"],
            as_of=c["rep"] or ASOF, tier=c["tier"], source_url=c["src"],
            announced_on=c["rep"] or ASOF, attributed_to=f"{c['en']} (회사 발표)",
            target_period=c["gnextper"], revision="new",
            verdict="confirmed", render="assert",
            note="범위로 제시된 것은 중간값. 애널리스트 추정치가 아니라 회사가 제시한 수치다",
            printed_on=["forward-path"]))
        derived.append(dict(id=f"D_{tag}_GQOQ", kind="pct_change",
                            **{"from": f"{tag}_REV", "to": f"{tag}_GNEXT"},
                            printed=c["gnextqoq"], tolerance=0.05))
    if c.get("ltm") is not None:
        claims.append(dict(
            id=f"{tag}_LTM", kind="reported_result", metric="LTM 매출",
            text=f"{c['ko']} 최근 12개월 매출", value=c["ltm"], unit="USD bn",
            series=SERIES["LTM"], as_of=VAL_ASOF, tier=3,
            source_url=LTM_SRC % c["t"].lower(), verdict="confirmed", render="marked",
            note="집계사이트가 분기 실적을 합산해 산정한 값. 회사가 그대로 발표한 수치가 아니다"
                 + ((" — " + c["ltmnote"]) if c.get("ltmnote") else ""),
            printed_on=["table-main", "chart-trend"]))
        claims.append(dict(
            id=f"{tag}_LTMG", kind="reported_result", metric="LTM 성장률",
            text=f"{c['ko']} 최근 12개월 매출 성장률", value=c["ltmg"], unit="%",
            series=SERIES["LTM"], as_of=VAL_ASOF, tier=3,
            source_url=LTM_SRC % c["t"].lower(), verdict="confirmed", render="marked",
            note="가속도(분기 YoY − LTM YoY)의 분모가 되는 값. 분기 YoY 는 회사 발표라 "
                 "두 값의 계열이 다르다 — 방향 판정에만 쓴다",
            printed_on=["table-main", "chart-trend"]))
    # 밸류에이션 — 집계사이트 한 곳이 유일한 근거라 tier 3 이고, 회사가 발표한
    # 값이 아니다. 'marked'(참고 표기)로만 인쇄하고 화면에서도 실적치와 구분한다.
    for key, cid, metric, label, where, memo in (
        ("fpe", "FPE", "선행 P/E", "선행 P/E", ["table-main", "rank-appeal"],
         "집계사이트 한 곳의 당일 값. 제공사마다 선행 이익 기준이 달라 다른 곳 수치와 섞지 말 것"),
        ("peg", "PEG", "PEG", "PEG", ["table-main"],
         "제공사 산정. 산식(예상 이익 증가율의 기간·기준)이 공개돼 있지 않아 "
         "점수에는 넣지 않고 참고로만 싣는다"),
    ):
        if c.get(key) is None:
            continue
        claims.append(dict(
            id=f"{tag}_{cid}", kind="market_multiple", metric=metric,
            text=f"{c['ko']} {label}", value=c[key], unit="배",
            series=SERIES["밸류에이션"], as_of=VAL_ASOF, tier=3,
            source_url=VAL_SRC % c["t"].lower(),
            verdict="confirmed", render="marked",
            note=memo + ((" — " + c["valnote"]) if c.get("valnote") else ""),
            printed_on=where))
    # 시가총액 — 배수가 아니라 가격 × 주식수다. P/S 의 분자이기도 해서
    # 기준일을 종목마다 그대로 남긴다.
    if c.get("mcap") is not None:
        claims.append(dict(
            id=f"{tag}_MCAP", kind="market_data", metric="시가총액",
            text=f"{c['ko']} 시가총액", value=c["mcap"], unit="USD bn",
            series=SERIES["시세"], as_of=c["mcapasof"], tier=3,
            source_url=MCAP_SRC % c["t"].lower(), verdict="confirmed", render="marked",
            note="가격에 따라 매일 움직이는 값. 제공사 화면이 찍어 준 기준일을 그대로 쓴다"
                 + ((" — " + c["mcapnote"]) if c.get("mcapnote") else ""),
            printed_on=["table-main"]))
        if c.get("ps") is not None:
            derived.append(dict(id=f"D_{tag}_PS", kind="ratio",
                                numerator=f"{tag}_MCAP", denominator=f"{tag}_LTM",
                                printed=c["ps"], tolerance=0.02))
    if c.get("eveb") is not None:
        claims.append(dict(
            id=f"{tag}_EVEB", kind="market_multiple", metric="EV/EBITDA",
            text=f"{c['ko']} EV/EBITDA", value=c["eveb"], unit="배",
            series=SERIES["밸류에이션"], as_of=VAL_ASOF, tier=3,
            source_url=VAL_SRC % c["t"].lower(), verdict="confirmed", render="marked",
            note="제공사 산정. 자본구조·감가상각 차이를 걷어낸 배수라 P/E 와 순위가 다를 수 있다"
                 + ((" — " + c["evebnote"]) if c.get("evebnote") else ""),
            printed_on=["table-main"]))
    elif c.get("evebnote"):
        claims.append(dict(
            id=f"{tag}_EVEB", kind="market_multiple", metric="EV/EBITDA",
            text=f"{c['ko']} EV/EBITDA", value=0, unit="배",
            series=SERIES["밸류에이션"], as_of=VAL_ASOF, tier=3,
            source_url=VAL_SRC % c["t"].lower(), verdict="unverified", render="omit",
            note=c["evebnote"], printed_on=[]))

for _sec, _b in sorted(SECBENCH.items()):
    if _b["median"] is None:
        continue
    for _tk, _v in _b["members"]:
        if any(c["t"] == _tk for c in C):
            continue          # 대시보드 기업은 이미 위에서 등록됨
        claims.append(dict(
            id=f"PEER_{_tk}_FPE", kind="market_multiple", metric="선행 P/E",
            text=f"{_tk} 선행 P/E (섹터 기준배수 산출용)", value=_v, unit="배",
            series=SERIES["밸류에이션"], as_of=VAL_ASOF, tier=3,
            source_url=VAL_SRC % _tk.lower(), verdict="confirmed", render="marked",
            note=f"{_sec} 기준배수 계산에만 쓰는 동종업체. 화면의 기업 표에는 실리지 않는다.",
            printed_on=["sector-benchmark"]))
    claims.append(dict(
        id=f"SECMED_{abs(hash(_sec)) % 100000}", kind="derived_benchmark",
        metric="섹터 기준배수", text=f"{_sec} 기준 선행 P/E 중앙값",
        value=_b["median"], unit="배", series=SERIES["밸류에이션"],
        as_of=VAL_ASOF, tier=3, source_url=VAL_SRC % "xom",
        verdict="confirmed", render="marked",
        note=("대형주 %d개사(대시보드 %d + 동종업체 %d)의 중앙값 — 섹터 지수의 배수가 아니다. "
              "구성: %s%s" % (_b["n"], _b["nOwn"], _b["nPeer"],
                            ", ".join("%s %.2f" % m for m in _b["members"]),
                            VG_NOTE.get(_sec, ""))),
        printed_on=["sector-benchmark", "table-main"]))

ledger = dict(
    deliverable="미국 주요기업 실적 어닝스 인텔리전스 대시보드 (earnings-intel.html)",
    as_of=ASOF, series_policy=SERIES, claims=claims, derived=derived,
    unit_policy={"분기 매출": "USD bn", "매출 컨센서스": "USD bn",
                 "가이던스": "방향(+1/0/-1)", "선행 P/E": "배", "PEG": "배", "섹터 기준배수": "배",
                 "LTM 매출": "USD bn", "LTM 성장률": "%",
                 "시가총액": "USD bn", "EV/EBITDA": "배", "P/S": "배"})

OUT.mkdir(parents=True, exist_ok=True)
(OUT / "claims.json").write_text(json.dumps(ledger, ensure_ascii=False, indent=1), "utf-8")

# ---------------------------------------------------------------- 화면 데이터
VG_ORDER = ["정보기술", "커뮤니케이션 · 인터넷", "커뮤니케이션 · 통신미디어",
            "경기소비재", "헬스케어", "금융", "필수소비재", "산업재", "에너지"]
SEC_ORDER = ["정보기술", "커뮤니케이션", "경기소비재", "헬스케어", "금융",
             "필수소비재", "산업재", "에너지"]
sectors = []
for s in SEC_ORDER:
    m = [c for c in C if c["sec"] == s]
    y = [c["yoy"] for c in m if c.get("yoy") is not None]
    rv = [c["rev"] for c in m]
    sp = [c["surprise"] for c in m if c.get("surprise") is not None]
    sectors.append(dict(sec=s, n=len(m), rev=round(sum(rv), 1),
                        yoy=round(sum(y) / len(y), 1) if y else None, yoyn=len(y),
                        surp=round(sum(sp) / len(sp), 2) if sp else None, surpn=len(sp),
                        tickers=[c["t"] for c in m]))

cov = dict(total=len(C),
           rev=sum(1 for c in C if c.get("rev") is not None),
           cons=sum(1 for c in C if c.get("cons")),
           yoy=sum(1 for c in C if c.get("yoy") is not None),
           guide=sum(1 for c in C if c.get("guide") is not None),
           eps=sum(1 for c in C if c.get("epssurprise") is not None),
           fpe=sum(1 for c in C if c.get("fpe") is not None),
           ps=sum(1 for c in C if c.get("ps") is not None),
           eveb=sum(1 for c in C if c.get("eveb") is not None),
           ltm=sum(1 for c in C if c.get("ltm") is not None),
           accel=sum(1 for c in C if c.get("accel") is not None),
           gnext=sum(1 for c in C if c.get("gnext") is not None),
           appeal=sum(1 for c in C if c.get("appeal") is not None))

keys = ("t ko en sec sub per pend rep repapprox rev cons consderived surprise yoy eps epsc "
        "epssurprise guide gtxt gkind note warn src csrc tier score coverage scoreparts "
        "upcoming nextrep nextconf nextsrc consnote epsnote gtxt_en note_en consnote_en per_en "
        "fpe peg valscore valabs relpe secmed vgrp vgrpEn appeal appealgap valnote "
        "mcap mcapasof mcapnote eveb evebnote evebnote_en ps "
        "ltm ltmg accel trend ltmnote gnext gnexttxt gnextper gnexten gnextqoq").split()
payload = dict(
    asOf=ASOF,
    generated="scripts/build_earnings.py",
    season=dict(prev="2026년 2분기(캘린더) 실적 시즌", nextq="2026년 3분기(캘린더) 실적 시즌"),
    weights=W, bands=BANDS, minCoverage=MIN_COVERAGE, seriesPolicy=SERIES,
    valBand=VAL_BAND, relBand=REL_BAND, mix=MIX, valAsOf=VAL_ASOF,
    accelBand=ACCEL_BAND,
    secBench=[SECBENCH[k] for k in VG_ORDER if k in SECBENCH],
    seriesPolicyEn=SERIES_EN, coverage=cov,
    index=INDEX,
    companies=[{k: c.get(k) for k in keys} for c in C],
    sectors=sectors)
(OUT / "latest.json").write_text(json.dumps(payload, ensure_ascii=False, indent=1), "utf-8")

# 화면은 인터넷·서버 없이 파일 하나로 열려야 한다 — 데이터를 HTML 안에 박는다.
PAGE = ROOT / "earnings-intel.html"
if PAGE.exists():
    html = PAGE.read_text("utf-8")
    a = '<script id="earnings-data" type="application/json">'
    b = "</script>"
    i = html.find(a)
    if i < 0:
        raise SystemExit("earnings-intel.html 에 데이터 자리(#earnings-data)가 없다")
    j = html.find(b, i)
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    PAGE.write_text(html[:i + len(a)] + "\n" + blob + "\n" + html[j:], "utf-8")
    print("earnings-intel.html 에 데이터 주입 (%.0f KB)" % (len(blob) / 1024))

print("기업 %d사 · claim %d건 · derived %d건" % (len(C), len(claims), len(derived)))
print("컨센서스 확인 %d/%d · YoY 확인 %d/%d · 가이던스 확인 %d/%d · EPS 서프라이즈 %d/%d"
      % (cov["cons"], cov["total"], cov["yoy"], cov["total"],
         cov["guide"], cov["total"], cov["eps"], cov["total"]))
print("선행 P/E 확인 %d/%d · LTM %d/%d · 가속도 산출 %d/%d · 투자매력도 %d/%d"
      % (cov["fpe"], cov["total"], cov["ltm"], cov["total"],
         cov["accel"], cov["total"], cov["appeal"], cov["total"]))
print("P/S 산출 %d/%d · EV/EBITDA 확인 %d/%d  (둘 다 점수에는 넣지 않음)"
      % (cov["ps"], cov["total"], cov["eveb"], cov["total"]))
_up = [c for c in C if c.get("trend") == "up"]
_dn = [c for c in C if c.get("trend") == "down"]
print("  가속 %d사: %s" % (len(_up), " ".join(
    "%s(%+.0f%%p)" % (c["t"], c["accel"]) for c in sorted(_up, key=lambda x: -x["accel"]))))
print("차기분기 수치 가이던스 %d사:" % cov["gnext"])
for c in sorted([c for c in C if c.get("gnextqoq") is not None],
                key=lambda x: -x["gnextqoq"]):
    print("  %-6s %7.2f → %7.2f  (%+.1f%% QoQ)  %s"
          % (c["t"], c["rev"], c["gnext"], c["gnextqoq"], c["gnextper"]))
print("  둔화 %d사: %s" % (len(_dn), " ".join(
    "%s(%+.0f%%p)" % (c["t"], c["accel"]) for c in sorted(_dn, key=lambda x: x["accel"]))))
print("기준그룹 배수(선행 P/E 중앙값):")
for _k in VG_ORDER:
    _b = SECBENCH.get(_k)
    if _b:
        print("  %-22s %6.2f배  (대형주 %d사 = 수록 %d + 동종 %d, 범위 %.1f~%.1f)"
              % (_k, _b["median"], _b["n"], _b["nOwn"], _b["nPeer"], _b["lo"], _b["hi"]))
print("  %-6s %7s %7s %7s   %s" % ("티커", "매력도", "모멘텀", "밸류", "선행 P/E"))
for c in sorted([c for c in C if c["appeal"] is not None],
                key=lambda x: -x["appeal"])[:10]:
    print("  %-6s %7.1f %7.1f %7.1f   %6.2f배 (섹터 대비 %.2f배, 절대 V %.0f)"
          % (c["t"], c["appeal"], c["score"], c["valscore"], c["fpe"],
             c["relpe"], c["valabs"]))
miss = [c for c in C if c["appeal"] is None]
print("  미산출 %d사: %s" % (len(miss), ", ".join(
    "%s(%s)" % (c["t"], "모멘텀" if c["appealgap"] == "momentum" else "밸류") for c in miss)))
