#!/usr/bin/env python3
# 세션 산출물 자료실 — 주제별 색인 아티팩트
import base64, html, os

BASE = os.path.dirname(os.path.abspath(__file__))
DECKS = os.path.join(BASE, 'decks')
OUT = os.path.join(BASE, 'pages')
os.makedirs(OUT, exist_ok=True)
A = 'https://claude.ai/code/artifact/'


def art(uid):
    return A + uid


# ─── 주제별 산출물 ────────────────────────────────────────────────
# (제목ko, 제목en, 설명ko, 설명en, 세션ko, 세션en, 날짜, uid|None, 신규여부)
GROUPS = [
    dict(
        ko='시황 · 브리핑', en='Market Briefings',
        leadko='매일 발행하는 모닝·장마감·해외 브리핑과 그 파이프라인이 거쳐 온 판들입니다.',
        leaden='The daily morning, market-close and overseas briefings, plus the '
               'earlier generations of the pipeline that produces them.',
        items=[
            ('모닝 브리핑 첫 판 · 2026-08-04', 'First Morning Briefing · 2026-08-04',
             '한/영 병기와 항목별 근거 패널 구조를 처음 세운 판.',
             'The edition that established the bilingual layout and per-item evidence panel.',
             '자동 증시시황 수집 및 브리핑', 'Auto market briefing',
             '2026-08-06', '52dcf057-d3b2-421c-a418-1741e617e27f', True),
            ('모닝 · 장마감 브리핑 (8/6~8/22)', 'Morning & Close Briefings (Aug 6–22)',
             '일자별 발행본 21건이 이미 아티팩트로 올라가 있어 다시 올리지 않았습니다. '
             '아래 브리핑 아카이브에서 한 번에 찾습니다.',
             'Twenty-one dated editions already exist as artifacts and were not republished; '
             'the briefing archive below indexes them all.',
             '모닝 시황 브리핑 · 마포WM 장마감 브리핑', 'Morning / close briefing sessions',
             '2026-08-22', None, False),
            ('브리핑 아카이브', 'Briefing Archive',
             '발행한 모든 브리핑을 날짜·판·소제목으로 검색하는 색인 화면.',
             'Searchable index of every published briefing by date, edition and headline.',
             '새로운 프로젝트 추천', 'New project recommendation',
             '2026-08-17', 'c33e2992-1bc7-47ef-98ed-25dc750b7965', True),
            ('주간 마켓 다이제스트 · 2026-W33', 'Weekly Market Digest · 2026-W33',
             '일간과 별도로 만든 유일한 주간 판(8/10~8/14).',
             'The only weekly edition produced alongside the dailies (Aug 10–14).',
             '새로운 프로젝트 추천', 'New project recommendation',
             '2026-08-17', '45054867-2a98-4733-9ed7-43a269f6cbd1', True),
            ('브리핑 개편안', 'Briefing Redesign',
             '현행 브리핑의 구조를 다시 짠 개편 시안.',
             'Proposal that restructures the current briefing format.',
             '모닝 시황 브리핑', 'Morning briefing',
             '2026-08-22', '4694c9cc-d07f-4d10-af16-db2d6ef3085d', False),
            ('해외 증시 브리핑 (베타) · 8/22', 'Overseas Briefing (Beta) · Aug 22',
             '개편안을 실제 시세로 처음 구현한 베타 시안.',
             'First beta built on live prices from the redesign.',
             '모닝 시황 브리핑', 'Morning briefing',
             '2026-08-22', '961b8d2b-624f-4fd1-80ee-e6e242b93f99', False),
            ('증권사 아침 시황 종합', 'Broker Morning Wrap',
             '여러 증권사·매체의 아침 시황을 한 화면에 모으는 수집기.',
             'Collector that gathers morning commentary from multiple brokers into one screen.',
             '블룸버그 브리핑 자동 번역 및 요약', 'Bloomberg briefing auto-translate',
             '2026-07-27', 'a89553cf-9f85-46b0-8b7e-b8eb4ec4d952', True),
            ('Bloomberg 브리핑 · 미리보기', 'Bloomberg Briefing · Preview',
             '원문을 붙여넣으면 한국어 한 장 요약을 만드는 아침 번역 도구.',
             'Paste the source and get a one-page Korean summary each morning.',
             '블룸버그 브리핑 자동 번역 및 요약', 'Bloomberg briefing auto-translate',
             '2026-07-27', '6ba8c13c-26b1-41e9-91f7-ad8be51bf834', False),
        ]),
    dict(
        ko='보유자산 · 포트폴리오', en='Holdings & Portfolio',
        leadko='고객 보유 내역을 넣어 브리핑·점검 리포트를 만드는 도구들입니다.',
        leaden='Tools that turn a client\'s holdings into a briefing or a check-up report.',
        items=[
            ('보유자산 통합 브리핑', 'Client Holdings Briefing',
             '주식·ETF·펀드·채권을 한 화면에 모아 고객별로 브리핑을 만듭니다. v2026.08.21.',
             'Equities, ETFs, funds and bonds on one screen, per client. v2026.08.21.',
             'Asset briefing dashboard setup', 'Asset briefing dashboard setup',
             '2026-08-21', '15a26735-c8c5-428c-aec8-7ab437e4f04d', True),
            ('보유자산 브리핑 7월판', 'Holdings Briefing · July',
             '같은 도구의 첫 단일 파일 판. v2026.07.27.',
             'The first single-file generation of the same tool. v2026.07.27.',
             '미래에셋증권 시세 데이터 통합', 'Quote data integration',
             '2026-08-05', 'e34b5f2b-f58a-44a9-abf0-04af84d21990', True),
            ('포트폴리오 점검', 'Portfolio Check',
             '보유 내역의 편중·환노출·ELS 낙인 여력을 한 장으로 진단합니다.',
             'Concentration, FX exposure and ELS knock-in headroom, diagnosed on one page.',
             '새로운 프로젝트 추천', 'New project recommendation',
             '2026-08-17', 'ab051636-2c6e-4e33-a6fe-4955c1130655', True),
            ('마켓 모니터', 'Market Monitor',
             '시장 온도·수급·업종 강약을 누적 데이터로 봅니다.',
             'Market temperature, flows and sector strength from accumulated data.',
             '새로운 프로젝트 추천', 'New project recommendation',
             '2026-08-17', '323b2c82-af94-49c2-bca8-04605a0bf903', True),
        ]),
    dict(
        ko='ELS · 상품 제안', en='ELS & Product Proposals',
        leadko='ELS 회차 분석과 고객 제안서 계열입니다. 조건·공정가액·낙인 여력을 원문에서 뽑아 씁니다.',
        leaden='ELS issue analysis and client proposals, with terms, fair value and '
               'knock-in headroom taken from the filings.',
        items=[
            ('ELS 상품 조회 · 8/21판', 'ELS Product Finder · Aug 21',
             '구조 설명·조건 필터·상환 시뮬레이터를 갖춘 최신판.',
             'Latest edition with structure explainer, term filters and redemption simulator.',
             'ELS 상품 통합 조회', 'ELS product search',
             '2026-08-21', 'e8a6b160-154a-4cfa-921f-edc368cf58a4', True),
            ('ELS 상품 구조 한눈에 보기', 'ELS Structures at a Glance',
             '기초자산·조기상환·손익 구조를 처음 배우는 사람 기준으로 설명합니다.',
             'Underlyings, early redemption and payoff explained for a first-time reader.',
             'ELS 상품 구조 설명 페이지', 'ELS structure page',
             '2026-08-20', 'c3969a8b-8ddc-4f39-aba4-77677e8d3aff', False),
            ('ELS 주간 제안서', 'ELS Weekly Proposal',
             '제38031~38047회 17종을 조건·가격·과거 성과로 갈라 추천 3종을 골랐습니다.',
             'Seventeen notes (series 38031–38047) split by terms, price and history, with three picks.',
             'ELS 상품 구조 설명 페이지', 'ELS structure page',
             '2026-08-21', '292b0dbd-65ef-405c-b8fd-d7843d8f61d3', False),
            ('ELS 세일즈 분석 8월 4주', 'ELS Sales Analysis · Aug W4',
             '투자설명서에서 공정가액·적용 변동성·리자드 조항을 꺼내 16건을 다시 읽었습니다.',
             'Sixteen notes re-read from the prospectus: fair value, applied vol, lizard clauses.',
             'ELS 상품 구조 설명 페이지', 'ELS structure page',
             '2026-08-21', '8d533746-9e53-444b-86a6-7f5e39f01d4c', False),
            ('8월 ELS 37건 비교분석', 'August ELS · 37 Notes Compared',
             '쿠폰이 아니라 기초자산이 과거 어디까지 내려갔는지로 줄을 세웠습니다.',
             'Ranked by how far the underlyings actually fell in the past, not by coupon.',
             'ELS 상품 구조 설명 페이지', 'ELS structure page',
             '2026-08-21', '4b4bcb92-2b53-4402-9c9a-3d999101cd45', False),
            ('고객 상품 제안서 생성기', 'Client Proposal Builder',
             '고객 정보·위험성향을 넣으면 자산배분·상품구성·절세계좌안이 담긴 제안서가 나옵니다.',
             'Enter client details and risk profile to get allocation, product mix and tax-account plan.',
             '고객 상품 제안서 생성 도구', 'Customer proposal generator',
             '2026-08-15', '009eca34-5931-471e-acf2-1965a1a839f6', True),
            ('IRP 계좌 운용상품 제안서', 'IRP Product Proposal',
             '세제·운용규제 정리와 성향별 ETF·펀드·TDF 포트폴리오.',
             'Tax and regulatory constraints, plus ETF/fund/TDF portfolios by risk profile.',
             'IPR account product proposals', 'IRP account products',
             '2026-07-14', '3c999e69-3f9a-4854-a0e2-247438b7e542', True),
            ('퇴직연금 DC 제안서', 'DC Pension Proposal',
             '위험자산 30·50·70% 세 가지 포트폴리오, 표지 포함 4장. 원본은 아래 원본 파일에 있습니다.',
             'Three portfolios at 30/50/70% risk assets, four slides including the cover. '
             'Originals in the file section below.',
             'IRP product proposal PPT', 'IRP proposal PPT',
             '2026-07-14', '22e1a511-05da-44ec-b31a-cee7d144ae98', True),
        ]),
    dict(
        ko='조회 화면 · 대시보드', en='Search Screens & Dashboards',
        leadko='종목·상품을 찾아 읽는 화면들입니다. 실시간 시세는 외부 API 를 쓰므로 '
               '아티팩트에서는 화면 구조만 동작합니다.',
        leaden='Screens for finding and reading securities and products. Live quotes call '
               'external APIs, so inside an artifact only the screen itself works.',
        items=[
            ('금융상품 통합조회', 'Product Finder',
             'ELS·펀드·채권·ETF 를 조건으로 좁혀 찾고 비교하는 화면.',
             'Filter and compare ELS, funds, bonds and ETFs in one screen.',
             '미래에셋증권 금융상품 조회 화면', 'Product dashboard',
             '2026-08-05', 'fb2600c7-6cbe-42af-afca-475ec314a3c5', False),
            ('종목 통합 리포트 · 실시간 조회', 'Equity Report · Live',
             '종목명·코드로 시세·재무·리포트·뉴스를 한 화면에 모읍니다.',
             'Prices, financials, broker reports and news for a ticker in one screen.',
             '조회 사이트 구축', 'Query site builder',
             '2026-07-25', 'c7e658bd-43c8-46e4-88cb-8870ea93f526', True),
            ('종목 통합 리포트 초판', 'Equity Report · First Edition',
             '같은 도구의 첫 판. 이후 브랜드 적용판과 영업 툴킷으로 이어집니다.',
             'The first generation, later rebranded and folded into the sales toolkit.',
             'Stock report dashboard', 'Stock report dashboard',
             '2026-07-09', '35df2517-e8f5-4ae4-ae3e-a9d48b9daa1b', True),
            ('데이터센터 밸류체인 종목 맵', 'Data Center Value Chain Map',
             '국내외 데이터센터 밸류체인 종목을 맵·표·카드로 훑고 비교합니다.',
             'Korean and global data-center value chain names as a map, table and cards.',
             '데이터센터 밸류체인 맵', 'Data center value chain map',
             '2026-08-05', 'b563f426-4248-467e-af3f-bc6c750de2b5', True),
            ('증권사 리포트 다이제스트', 'Broker Report Digest',
             '조회수·목표주가 변경·복수 커버리지로 오늘의 리포트를 고릅니다.',
             'Picks the day\'s reports by views, target-price changes and shared coverage.',
             '증권사 리포트 자동 요약', 'Report auto-summary',
             '2026-08-21', 'e0d4d73a-22db-4d93-a0c5-6ab177711daa', True),
        ]),
    dict(
        ko='세금 · 계산기 · 영업 도구', en='Tax, Calculators & Sales Tools',
        leadko='상담 자리에서 바로 숫자를 뽑는 도구들입니다.',
        leaden='Tools that produce a number on the spot during a client conversation.',
        items=[
            ('부동산 세금 계산기', 'Property Tax Calculator',
             '2026년 세제개편안 기준 취득세·재산세·종부세·양도세를 조건별로 산출. 상한 장치 3종 포함.',
             'Acquisition, property, comprehensive and capital gains tax under the 2026 reform bill, '
             'including the three cap mechanisms.',
             '부동산 세금 계산기', 'Real estate tax calculator',
             '2026-08-07', '5897de59-de5a-4f82-8775-d8307d6f20bd', True),
            ('영업 지원 도구', 'Sales Toolkit',
             '종목 리포트·상품 비교기·연금 절세 시뮬레이터·반대매매 리스크 계산기를 한 파일에.',
             'Equity report, product comparison, pension tax simulator and margin-call '
             'risk calculator in one file.',
             '작업 검토 및 제안', 'Work review & recommendations',
             '2026-07-29', 'a86d0d0e-b723-42c5-b7d8-5a64262489b9', True),
            ('2026 세제 세미나 검증본', '2026 Tax Seminar · Verified',
             '세무·부동산 세제 자료를 원문 대조로 검증한 판.',
             'Tax and property-tax material verified line by line against the source.',
             '세무 자료 검증 · 부동산 세제 자료 검증', 'Tax document verification',
             '2026-08-22', '80f98891-6920-42a0-9cdc-a548f564db29', False),
        ]),
    dict(
        ko='세미나 · 발표자료 · 영상', en='Seminars, Decks & Video',
        leadko='PPTX·MP4 원본은 아티팩트로 바로 열 수 없어, 슬라이드 텍스트와 차트를 '
               '추출한 보관본을 만들고 원본 파일을 붙였습니다.',
        leaden='PPTX and MP4 originals cannot open as an artifact, so each page carries the '
               'extracted slide text and charts with the original file attached.',
        items=[
            ('반도체 프라이머 2026', 'Semiconductor Primer 2026',
             '산업 구조·밸류체인·사이클을 30장으로 정리한 교육 자료. 검증본 두 판 모두 첨부.',
             'Industry structure, value chain and cycle in 30 slides. Both verified '
             'editions attached.',
             '반도체 자료 검증 및 화면 수정 (2건)', 'Semiconductor review (2 sessions)',
             '2026-08-03', '42c7cc1a-2ddc-48ec-a560-a5cfd224eaaa', True),
            ('반도체 고객세미나 7월판', 'Semiconductor Client Seminar · July',
             '2026.7.15 고객 세미나 강의안 19장. 원본 차트 9개 포함.',
             'The July 15 client seminar deck, 19 slides with all nine original charts.',
             'Data update to July 2026', 'Data update to July 2026',
             '2026-07-14', '602079f3-0b9e-4bcd-9912-4907a4237bc3', True),
            ('반도체 투자 세미나 7·29판', 'Semiconductor Seminar · Jul 29',
             '급락 뒤 반등 국면과 실적 슈퍼위크를 앞둔 시점의 강의안 16장.',
             'Sixteen slides for the rebound after the selloff, ahead of earnings week.',
             '반도체 세미나 강의안 PPT', 'Semiconductor seminar PPT',
             '2026-07-28', '0e319240-562a-4331-ba3e-cfcf111d99d8', True),
            ('반도체 투자 세미나 강의안 (미리보기)', 'Semiconductor Seminar (Preview)',
             '같은 강의안의 화면 미리보기.',
             'A screen preview of the same deck.',
             '반도체 세미나 강의안 PPT', 'Semiconductor seminar PPT',
             '2026-07-28', '9b45cbdf-ee9e-4e1f-addd-5127bb883818', False),
            ('부동산 세금 설명 영상', 'Property Tax Explainer',
             '살 때·가질 때·팔 때·빌려줄 때 단계별 세금과 규제를 다룬 3분 36초 강의형 영상.',
             'A 3:36 explainer covering tax and rules at each stage: buying, holding, '
             'selling, letting.',
             '동영상 제작', 'Video creation',
             '2026-07-28', '1a896c1f-dba8-4095-b749-30b44b0aab71', True),
            ('AI 투자 트렌드 숏폼', 'AI Investment Trends · Short',
             '2026년 AI 투자가 인프라에서 수익화로 넘어가는 국면을 31.7초 세로 영상으로.',
             'The 2026 shift from AI infrastructure to monetization, in a 31.7-second vertical clip.',
             '동영상 제작', 'Video creation',
             '2026-07-28', '16428998-4c7f-4ae9-9d9a-785cbe5f03f4', True),
        ]),
    dict(
        ko='자료실 · 사내 공유', en='Shared Libraries',
        leadko='만든 자료를 부서에 돌리는 두 가지 방식 — 저장소 기반과 파일 한 개 기반입니다.',
        leaden='Two ways to circulate finished material inside the team — repository-backed, '
               'or a single self-contained file.',
        items=[
            ('부서 자료실', 'Department Library',
             '저장소에 넣은 자료를 분류별로 모아 목록으로 보여 줍니다.',
             'Lists material committed to the repository, grouped by category.',
             '부서 내 공유 저장소 설정', 'Department shared storage',
             '2026-08-12', '8d317770-d6a5-4c8b-b365-2a7549330eb9', False),
            ('팀 자료실', 'Team File Room',
             '파일을 담아 암호(AES-256)로 잠근 단일 HTML 을 만드는 빈 틀. 인터넷 없이 동작합니다.',
             'A blank shell that packs files into one AES-256 encrypted HTML. Works offline.',
             '내부망 파일 공유 사이트', 'Intranet file sharing',
             '2026-08-13', 'bf2d05de-fe34-41bf-b40e-93daa21c2556', True),
        ]),
    dict(
        ko='그 밖의 작업', en='Other Work',
        leadko='업무 계열이 아니거나 한 번으로 끝난 작업들입니다.',
        leaden='One-off work and pieces outside the main business lines.',
        items=[
            ('신길파크자이 브로슈어', 'Singgil Park Xi Brochure',
             '신풍역 개발 계획과 시세 포지션을 한 장에 담은 홍보·참고용 자료. v5.',
             'Station redevelopment plans and price positioning on one page. v5.',
             '신길파크자이 브로슈어', 'Singgil brochure',
             '2026-07-12', '17c78672-8a92-4ad8-8270-87af3afbebd4', True),
            ('테트리스', 'Tetris',
             '홀드·하드드롭·모바일 조작까지 갖춘 단일 파일 게임.',
             'Single-file game with hold, hard drop and touch controls.',
             'Tetris game', 'Tetris game',
             '2026-07-09', '1cdb0e41-4561-4c00-9e3a-a9d6edce444a', True),
            ('갤러그', 'Galaga',
             '같은 세션에서 이어 만든 아케이드 슈터.',
             'An arcade shooter built in the same session.',
             'Tetris game', 'Tetris game',
             '2026-07-09', '189bc251-61dc-409b-9b78-df39b8f0a092', True),
        ]),
]

# 원본 파일 (아티팩트 페이지로 열 수 없는 바이너리)
FILES = [
    ('f-dcpdf', 'dc-proposal.pdf', '퇴직연금DC_제안서_위험자산비중별_202607.pdf',
     '퇴직연금 DC 제안서 · PDF 4장', 'DC pension proposal · PDF, 4 pages'),
    ('f-dcppt', 'dc-proposal.pptx', '퇴직연금DC_제안서_위험자산비중별_202607.pptx',
     '퇴직연금 DC 제안서 · PPTX 원본', 'DC pension proposal · PPTX source'),
]

# 아티팩트가 없는 세션 (정직한 결산)
NOARTIFACT = [
    ('주식 투자 자료 검증 · 2건', 'Stock material verification (2 sessions)',
     '남의 자료를 원문과 대조해 고친 작업입니다. 결과가 검증 대상 자료에 반영돼 별도 산출물이 없습니다.',
     'Line-by-line verification of existing material; the result went back into that '
     'material, so there is no separate deliverable.'),
    ('제약바이오 자료 검증', 'Pharma/biotech verification',
     '같은 성격의 검증 작업입니다.',
     'Verification work of the same kind.'),
    ('최종본 파일 확인', 'Final file check',
     '어느 파일이 최종본인지 가려낸 점검 작업입니다.',
     'A check to establish which file was the final version.'),
]

CSS = """
:root{
  --orange:#F58220; --orange-active:#CB6015; --orange-soft:#FAB072;
  --blue:#043B72; --canvas:#FFFFFF; --soft:#ECEFF4; --subtle:#F7F8FA;
  --hair:#CDCECB; --hair-soft:#E5E4E1; --ink:#1A1A1A; --body:#3D3D3D;
  --muted:#6C6C6C; --muted-soft:#84888B; --err:#C62828;
  --kr:'Noto Sans KR','Spoqa Han Sans Neo','Apple SD Gothic Neo',sans-serif;
  --en:'Inter','Aptos','Segoe UI',system-ui,sans-serif;
  --space-section:104px; --space-block:56px;
}
@media (max-width:768px){:root{--space-section:72px;--space-block:36px}}
*{box-sizing:border-box}
body{margin:0;background:var(--canvas);color:var(--body);font-family:var(--kr);
  font-size:19px;line-height:1.65;-webkit-font-smoothing:antialiased}
html[lang="en"] body{font-family:var(--en)}
.page{max-width:1200px;margin:0 auto;padding:0 32px 96px}
@media (max-width:768px){.page{padding:0 20px 64px}body{font-size:17px}}

.topbar{display:flex;align-items:flex-start;justify-content:space-between;
  gap:19px;padding:38px 0 0}
.tag{display:inline-block;font-family:var(--en);font-size:12px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--orange);
  border:1px solid var(--orange);border-radius:2px;padding:3px 9px;white-space:nowrap}
.lang{display:inline-flex;border:1px solid var(--hair);border-radius:2px;
  overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);background:#fff;flex:none}
.lang button{font-family:var(--en);font-size:14px;font-weight:500;letter-spacing:.5px;
  padding:10px 17px;border:0;background:#fff;color:var(--muted);cursor:pointer}
.lang button+button{border-left:1px solid var(--hair)}
.lang button[aria-checked="true"]{background:var(--orange);color:#fff}
.lang button:not([aria-checked="true"]):hover{background:var(--subtle);color:var(--ink)}
.lang button:focus-visible{outline:2px solid var(--orange);outline-offset:-2px}

h1{font-size:48px;font-weight:700;line-height:1.15;letter-spacing:-.5px;
  color:var(--ink);margin:24px 0 0;text-wrap:balance}
@media (max-width:768px){h1{font-size:34px}}
.sub{font-size:19px;color:var(--muted);margin:19px 0 0;max-width:64ch}
.stats{display:flex;flex-wrap:wrap;gap:38px;margin:38px 0 0;padding:24px 0;
  border-top:1px solid var(--hair-soft);border-bottom:1px solid var(--hair-soft)}
.stat .lbl{display:block;font-size:16px;font-weight:500;letter-spacing:.6px;
  color:var(--muted-soft)}
.stat b{display:block;font-family:var(--en);font-size:48px;font-weight:700;
  line-height:1.05;color:var(--blue);font-variant-numeric:tabular-nums;margin-top:6px}
@media (max-width:768px){.stat b{font-size:34px}}

.note{background:var(--subtle);border-left:2px solid var(--orange);
  border-radius:0 4px 4px 0;padding:24px 28px;margin:38px 0 0;font-size:17px}
.note p{margin:0}.note p+p{margin-top:12px}
.note b{color:var(--ink)}

section.grp{margin-top:var(--space-section)}
.rule{height:1px;background:var(--orange)}
h2{font-size:26px;font-weight:600;color:var(--ink);margin:19px 0 0}
@media (max-width:768px){h2{font-size:22px}}
.lead{font-size:17px;color:var(--muted);margin:10px 0 0;max-width:70ch}

.rows{margin-top:28px;border-top:1px solid var(--hair-soft)}
.row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 24px;
  padding:19px 0;border-bottom:1px solid var(--hair-soft)}
.row:hover{background:var(--subtle)}
.row .t{grid-column:1;min-width:0}
.row .d,.row .s{grid-column:1}
.row a{font-size:19px;font-weight:600;color:var(--blue);text-decoration:none;
  border-bottom:1px solid transparent}
.row a:hover{color:var(--orange-active);border-bottom-color:var(--orange)}
.row a:focus-visible{outline:2px solid var(--orange);outline-offset:2px}
.row .noa{font-size:19px;font-weight:600;color:var(--ink)}
.row .d{font-size:17px;color:var(--body);margin:5px 0 0}
.row .s{font-size:14px;color:var(--muted-soft);margin:6px 0 0}
.row .s em{font-style:normal;color:var(--muted)}
.row .side{grid-column:2;grid-row:1 / span 3;display:flex;flex-direction:column;
  align-items:flex-end;gap:7px;text-align:right}
.date{font-family:var(--en);font-size:14px;color:var(--muted-soft);
  font-variant-numeric:tabular-nums;white-space:nowrap}
.chip{font-size:12px;font-weight:600;letter-spacing:.04em;padding:2px 8px;
  border-radius:2px;white-space:nowrap}
.chip.new{background:var(--orange);color:#fff}
.chip.old{background:var(--soft);color:var(--muted)}
@media (max-width:640px){
  .row{grid-template-columns:1fr}
  .row .side{grid-column:1;grid-row:auto;flex-direction:row;align-items:center;
    justify-content:flex-start;text-align:left;margin-top:4px}
}

.tablewrap{overflow-x:auto;margin-top:28px}
table{width:100%;border-collapse:collapse;border:1px solid var(--hair);font-size:17px}
thead th{background:var(--orange-soft);color:var(--ink);font-weight:700;font-size:16px;
  text-align:left;padding:11px 14px;border:1px solid var(--hair)}
tbody td{padding:11px 14px;border:1px solid var(--hair-soft);vertical-align:middle}
tbody tr:hover{background:var(--subtle)}
td.num{font-family:var(--en);text-align:right;font-variant-numeric:tabular-nums;
  white-space:nowrap}
button.dl{font-family:inherit;font-size:16px;font-weight:500;color:#fff;
  background:var(--orange);border:0;border-radius:2px;padding:9px 17px;cursor:pointer;
  white-space:nowrap}
button.dl:hover{background:var(--orange-active)}
button.dl:focus-visible{outline:2px solid var(--orange);outline-offset:2px}
button.dl[disabled]{background:var(--hair);cursor:not-allowed}
.dlmsg{font-size:15px;color:var(--muted);margin:14px 0 0}
.dlmsg.err{color:var(--err)}
code{font-family:var(--en);font-size:.88em;background:var(--soft);padding:2px 6px;
  border-radius:2px;color:var(--ink);word-break:break-all}

footer{margin-top:var(--space-section);padding-top:24px;
  border-top:1px solid var(--hair-soft);font-size:14px;color:var(--muted-soft)}
footer p{margin:0;max-width:80ch}footer p+p{margin-top:8px}

[data-lang="en"]{display:none}
html[lang="en"] [data-lang="ko"]{display:none}
html[lang="en"] [data-lang="en"]{display:revert}

@media print{
  .lang{display:none!important}
  button.dl{display:none!important}
  body{font-size:12pt;line-height:1.4}
  .page{max-width:100%;padding:0}
  .row,table{page-break-inside:avoid}
  h2{page-break-after:avoid}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
"""

JS = """
(function(){
  var root=document.documentElement, btns=[].slice.call(document.querySelectorAll('.lang button'));
  function set(l,store){
    root.setAttribute('lang',l);
    btns.forEach(function(b){b.setAttribute('aria-checked', b.dataset.l===l?'true':'false');});
    if(store){ try{ localStorage.setItem('mas-hub-lang', l); }catch(e){} }
  }
  btns.forEach(function(b){ b.addEventListener('click', function(){ set(b.dataset.l,true); }); });
  var saved=null; try{ saved=localStorage.getItem('mas-hub-lang'); }catch(e){}
  set(saved==='en'?'en':'ko', false);

  function b64(id){
    var bin=atob(document.getElementById(id).textContent.trim()), n=bin.length, u=new Uint8Array(n);
    for(var i=0;i<n;i++) u[i]=bin.charCodeAt(i);
    return u;
  }
  function msg(t,isErr){
    var el=document.getElementById('dlmsg');
    el.textContent=t; el.className='dlmsg'+(isErr?' err':'');
  }
  (async function(){
    var ns = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    var btns=[].slice.call(document.querySelectorAll('button.dl'));
    if(!btns.length) return;
    if(!ns){
      btns.forEach(function(b){b.disabled=true;});
      msg(root.getAttribute('lang')==='en'
        ? 'Saving files is unavailable in this view — take the originals from the repository paths below.'
        : '이 화면에서는 원본 내려받기를 쓸 수 없습니다. 아래 저장소 경로에서 파일을 받으세요.', false);
      return;
    }
    btns.forEach(function(btn){
      btn.addEventListener('click', async function(){
        var en = root.getAttribute('lang')==='en';
        btn.disabled=true;
        msg(en?'Asked the viewer to confirm the download.':'내려받기 확인창을 띄웠습니다.', false);
        try{
          await ns.save({filename:btn.dataset.name, data:b64(btn.dataset.file)});
          msg(en?'Saved.':'저장했습니다.', false);
        }catch(e){
          var c=(e&&e.code)||'unavailable';
          var t = c==='extension_not_enabled'
              ? (en?'PDF and PPTX saves are not enabled in this view — use the repository paths below.'
                   :'PDF·PPTX 내려받기가 이 화면에서 허용되지 않습니다. 아래 저장소 경로에서 원본을 받으세요.')
            : c==='declined' ? (en?'Download cancelled.':'내려받기를 취소했습니다.')
            : c==='rate_limited' ? (en?'Try again in a moment.':'잠시 뒤 다시 눌러 주세요.')
            : (en?'Saving is unavailable — use the repository paths below.'
                 :'내려받기를 쓸 수 없습니다. 아래 저장소 경로에서 원본을 받으세요.');
          msg(t, c!=='declined');
        }finally{ btn.disabled=false; }
      });
    });
  })();
})();
"""


def esc(s):
    return html.escape(s, quote=False)


def bi(ko, en, tag='span', cls=None):
    c = ' class="%s"' % cls if cls else ''
    return ('<{t}{c} data-lang="ko">{k}</{t}><{t}{c} data-lang="en">{e}</{t}>'
            .format(t=tag, c=c, k=ko, e=en))


rows_total = sum(len(g['items']) for g in GROUPS)
new_count = sum(1 for g in GROUPS for it in g['items'] if it[8])

h = []
h.append('<title>세션 산출물 자료실</title>')
h.append('<link rel="preconnect" href="https://fonts.googleapis.com">')
h.append('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
h.append('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=Noto+Sans+KR:wght@400;500;600;700&family=Inter:wght@400;500;600;700'
         '&display=swap">')
h.append('<style>%s</style>' % CSS)
h.append('<div class="page">')

h.append('<div class="topbar">')
h.append('<span class="tag">' + bi('사내한 · 작업 색인', 'Internal · Work index') + '</span>')
h.append('<div class="lang" role="radiogroup" aria-label="언어 선택 / Language">'
         '<button type="button" role="radio" data-l="ko" aria-checked="true">KO</button>'
         '<button type="button" role="radio" data-l="en" aria-checked="false">EN</button>'
         '</div>')
h.append('</div>')

h.append(bi('세션 산출물 자료실', 'Session Work Library', 'h1'))
h.append(bi('클로드 코드 세션 35개가 남긴 최종 작업본을 주제별로 모았습니다. '
            '제목을 누르면 해당 아티팩트가 열립니다.',
            'The final deliverable of every one of 35 Claude Code sessions, grouped by '
            'subject. Each title opens its artifact.', 'p', 'sub'))

h.append('<div class="stats">')
for kolab, enlab, val in [('세션', 'Sessions', '35'),
                          ('주제', 'Subjects', str(len(GROUPS))),
                          ('새로 올린 아티팩트', 'Newly published', str(new_count)),
                          ('색인에 실은 항목', 'Indexed items', str(rows_total))]:
    h.append('<div class="stat"><span class="lbl">%s</span><b>%s</b></div>'
             % (bi(kolab, enlab), val))
h.append('</div>')

h.append('<div class="note">')
h.append(bi('각 세션의 브랜치에서 <b>마지막 커밋 기준의 최종 산출물</b>만 골랐습니다. '
            '중간 판과 실험본은 넣지 않았습니다. 이미 아티팩트로 올라가 있던 자료는 '
            '다시 올리지 않고 그 링크를 그대로 씁니다.',
            'For each session I took only the <b>final deliverable at its last commit</b> — '
            'no intermediate or experimental versions. Material that already had an artifact '
            'is linked, not republished.', 'p'))
h.append(bi('실시간 시세를 불러오는 화면은 아티팩트 안에서 외부 요청이 막히므로 '
            '화면 구조와 예시 데이터까지만 동작합니다. CSV·엑셀 저장 버튼도 아티팩트에서는 '
            '눌리지 않습니다. 실제로 돌려 보려면 저장소에서 파일을 열어야 합니다.',
            'Screens that fetch live quotes only work as far as their layout and sample data: '
            'artifacts block outbound requests. CSV and Excel buttons are inert here too — '
            'open the file from the repository to use them.', 'p'))
h.append('</div>')

for g in GROUPS:
    h.append('<section class="grp"><div class="rule"></div>')
    h.append(bi(g['ko'], g['en'], 'h2'))
    h.append(bi(g['leadko'], g['leaden'], 'p', 'lead'))
    h.append('<div class="rows">')
    for (tko, ten, dko, den, sko, sen, date, uid, is_new) in g['items']:
        h.append('<div class="row"><div class="t">')
        if uid:
            h.append('<a href="%s" target="_blank" rel="noopener">%s</a>'
                     % (art(uid), bi(esc(tko), esc(ten))))
        else:
            h.append(bi(esc(tko), esc(ten), 'span', 'noa'))
        h.append('</div>')
        h.append(bi(esc(dko), esc(den), 'p', 'd'))
        h.append('<p class="s">%s</p>' % bi('세션 <em>%s</em>' % esc(sko),
                                            'Session <em>%s</em>' % esc(sen)))
        h.append('<div class="side"><span class="date">%s</span>' % date)
        if uid:
            h.append('<span class="chip %s">%s</span>'
                     % ('new' if is_new else 'old',
                        bi('신규', 'New') if is_new else bi('기존', 'Existing')))
        else:
            h.append('<span class="chip old">%s</span>' % bi('아래 아카이브', 'See archive'))
        h.append('</div></div>')
    h.append('</div></section>')

# 원본 파일
h.append('<section class="grp"><div class="rule"></div>')
h.append(bi('원본 파일', 'Original Files', 'h2'))
h.append(bi('아티팩트 페이지로는 열 수 없는 파일입니다. 다른 발표자료·영상 원본은 각 '
            '아티팩트 안에 붙여 두었습니다.',
            'Files that cannot open as an artifact page. Every other deck and video original '
            'is attached inside its own artifact.', 'p', 'lead'))
h.append('<div class="tablewrap"><table><thead><tr>')
h.append('<th>%s</th><th>%s</th><th>%s</th><th></th></tr></thead><tbody>'
         % (bi('자료', 'Item'), bi('파일', 'File'), bi('용량', 'Size')))
for fid, src, fname, dko, den in FILES:
    size = '%.0fKB' % (os.path.getsize(os.path.join(DECKS, src)) / 1024)
    h.append('<tr><td>%s</td><td><code>%s</code></td><td class="num">%s</td>'
             '<td><button class="dl" data-file="%s" data-name="%s">%s</button></td></tr>'
             % (bi(esc(dko), esc(den)), esc(fname), size, fid, esc(fname),
                bi('내려받기', 'Save')))
h.append('</tbody></table></div><p class="dlmsg" id="dlmsg"></p></section>')

# 아티팩트 없는 세션
h.append('<section class="grp"><div class="rule"></div>')
h.append(bi('아티팩트가 없는 세션', 'Sessions Without an Artifact', 'h2'))
h.append(bi('네 개 세션은 남길 산출물 파일이 없어 링크가 없습니다. 무엇을 했는지만 적어 둡니다.',
            'Four sessions produced no file to keep, so they have no link. Recorded here for '
            'completeness.', 'p', 'lead'))
h.append('<div class="rows">')
for (tko, ten, dko, den) in NOARTIFACT:
    h.append('<div class="row"><div class="t">%s</div>' % bi(esc(tko), esc(ten), 'span', 'noa'))
    h.append(bi(esc(dko), esc(den), 'p', 'd'))
    h.append('<p class="s">%s</p>' % bi('검증 · 점검 작업', 'Verification / review work'))
    h.append('<div class="side"><span class="chip old">%s</span></div></div>'
             % bi('산출물 없음', 'No file'))
h.append('</div></section>')

h.append('<footer>')
h.append(bi('기준 2026-08-22 · 저장소 <code>hanaroline/work_1</code> · '
            '세션별 브랜치의 마지막 커밋에서 산출물을 뽑았습니다.',
            'As of 2026-08-22 · repository <code>hanaroline/work_1</code> · deliverables taken '
            'from the last commit on each session branch.', 'p'))
h.append(bi('세션 목록에는 최근 35개가 잡힙니다. 그보다 앞선 브랜치 두 개'
            '(<code>singgil-parkzai-brochure</code>, <code>new-session-5tllo8</code>)의 '
            '산출물도 함께 실었습니다.',
            'The session list returns the most recent 35. Two older branches '
            '(<code>singgil-parkzai-brochure</code>, <code>new-session-5tllo8</code>) are '
            'included here as well.', 'p'))
h.append(bi('모든 아티팩트는 기본이 비공개입니다. 부서 밖으로 링크를 돌리기 전에 각 '
            '아티팩트의 공유 설정을 확인하십시오.',
            'Every artifact is private by default. Check each artifact\'s sharing setting '
            'before passing a link outside the team.', 'p'))
h.append(bi('자료의 수치는 각 산출물의 작성 시점 기준입니다. 투자 권유·세무 자문이 아닙니다.',
            'Figures are as of each deliverable\'s own date. None of this is investment advice '
            'or a tax opinion.', 'p'))
h.append('</footer></div>')

for fid, src, fname, dko, den in FILES:
    h.append('<script type="application/octet-stream-base64" id="%s">%s</script>'
             % (fid, base64.b64encode(open(os.path.join(DECKS, src), 'rb').read()).decode()))
h.append('<script>%s</script>' % JS)

p = os.path.join(OUT, 'hub.html')
open(p, 'w', encoding='utf-8').write('\n'.join(h))
print('hub.html', os.path.getsize(p) // 1024, 'KB', '| rows:', rows_total, '| new:', new_count)
