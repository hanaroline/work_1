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
            ('모닝 마켓 브리핑 · 9/7', 'Morning Market Briefing · Sep 7',
             '가장 최신 발행본. 매 영업일 아침 새 아티팩트로 올라옵니다. 8월 말부터 '
             '장마감 「핵심본」이 따로 나옵니다.',
             'The latest edition. A new artifact goes up each business morning; a condensed '
             'market-close edition has been running since late August.',
             '모닝 시황 브리핑', 'Morning briefing',
             '2026-09-07', 'd50802dd-1522-439f-bd70-2920fb476a71', False),
            ('브리핑 목록', 'Briefing Index',
             '발행한 브리핑을 날짜·판별로 늘어놓은 최신 목록 화면. 일자별 발행본은 '
             '이미 각각 아티팩트로 올라가 있어 다시 올리지 않았고, 여기서 찾습니다.',
             'The current list of every published briefing by date and edition. Each dated '
             'edition already has its own artifact and was not republished — find them here.',
             '모닝 시황 브리핑', 'Morning briefing',
             '2026-08-30', 'd71cdafd-9cd4-4eea-8500-a37da78b8f47', False),
            ('브리핑 아카이브 (8월 중순판)', 'Briefing Archive (mid-Aug)',
             '검색으로 찾는 초기 아카이브 화면. 8/17 이후 발행분은 위 브리핑 목록이 최신입니다.',
             'The earlier searchable archive. For anything after Aug 17 the briefing index '
             'above is current.',
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
             '주식·ETF·펀드·채권을 한 화면에 모아 고객별로 브리핑을 만듭니다. v2026.08.21. '
             '8/31 에 「연금 상품조회」 링크 단추가 붙었지만 같은 서버의 다른 화면을 '
             '가리켜 아티팩트에서는 열리지 않으므로, 이 아티팩트는 그 전 판으로 둡니다.',
             'Equities, ETFs, funds and bonds on one screen, per client. v2026.08.21. A '
             'pension-lookup button added on Aug 31 points at another page on the same local '
             'server and cannot work inside an artifact, so this artifact stays on the '
             'earlier build.',
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
            ('은퇴자산 운용 제안서 · v2', 'Retirement Income Proposal · v2',
             '한 가구의 은퇴 현금흐름을 5단계로 배치하고, 신규 주식 편입 없이 이자·배당·'
             '옵션프리미엄으로 목표 연 7.0%를 맞춘 제안서. 취급 주의 — 특정 가구의 '
             '자산 내역이 담겨 있어 상담 관계 밖으로 돌리면 안 됩니다.',
             'One household\'s retirement cash flow staged over five phases, hitting a 7.0% '
             'target from interest, dividends and option premium with no new equity. '
             'Handle with care — it contains that household\'s asset detail; do not circulate.',
             '은퇴자산 설계 제안서', 'Retirement asset proposal',
             '2026-09-07', 'a4d9d351-0a19-4ac7-b9f4-f9c17b8c964c', True),
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
            ('ELS 상품 조회 · 최신판', 'ELS Product Finder',
             '구조 설명·조건 필터·상환 시뮬레이터. 9/6 수집분 21건으로 갈아 끼웠습니다. '
             '제목의 「8월 최종판」은 달이 바뀌어 「최신판」으로 바꿨고 링크는 그대로입니다.',
             'Structure explainer, term filters and redemption simulator, refreshed to the '
             '21 notes collected on Sep 6. Renamed from the August-specific title; same link.',
             'ELS 상품 통합 조회', 'ELS product search',
             '2026-09-06', 'e8a6b160-154a-4cfa-921f-edc368cf58a4', True),
            ('ELS 상품 구조 한눈에 보기', 'ELS Structures at a Glance',
             '기초자산·조기상환·손익 구조를 처음 배우는 사람 기준으로 설명합니다.',
             'Underlyings, early redemption and payoff explained for a first-time reader.',
             'ELS 상품 구조 설명 페이지', 'ELS structure page',
             '2026-08-20', 'c3969a8b-8ddc-4f39-aba4-77677e8d3aff', False),
            ('ELS 주간 제안서 · 8/24 판매분', 'ELS Weekly Proposal · Aug 24 offering',
             '제38031~38047회 17종. 쿠폰이 높으면 정말 더 위험한지 손실 확률로 검증한 절과 '
             '숙려기간을 감안한 실제 청약 마감일(8/25)을 앞세운 판. 추천 3종.',
             'Seventeen notes (series 38031–38047), now testing whether a higher coupon really '
             'means more risk using loss probability, and leading with the real subscription '
             'deadline (Aug 25) once the cooling-off period is counted. Three picks.',
             'ELS 상품 구조 설명 페이지', 'ELS structure page',
             '2026-08-25', '292b0dbd-65ef-405c-b8fd-d7843d8f61d3', False),
            ('ELS 세일즈 제안서 · 제38070~38089회', 'ELS Sales Deck · series 38070–38089',
             '20종을 수익률이 아니라 손실 확률로 줄 세운 제안서 6장. 백테스트(과거 20년)와 '
             '시뮬레이션(10만 번)이 어긋나는 상품을 따로 짚고, 성향별 추천 3종·권하지 않는 '
             '4종·고객 반응별 대응 스크립트를 담았습니다. PPTX·PDF 원본 첨부.',
             'Twenty notes ranked by loss probability rather than coupon, over six slides — '
             'flagging where the 20-year backtest and the 100,000-path simulation disagree, '
             'with three picks, four to avoid and objection-handling scripts. PPTX and PDF '
             'attached.',
             'ELS 상품 구조 설명 페이지', 'ELS structure page',
             '2026-09-01', '3a975c54-1bd5-403b-8aa8-25ff4e3ac517', True),
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
             '조회수·목표주가 변경·복수 커버리지로 그날 리포트를 고릅니다. 9/4 자 90건, '
             '수집 전체 316건을 파일에 담았습니다. 수집에 실패한 출처가 있으면 '
             '「이 판에는 OO가 빠졌습니다」를 머리에 띄웁니다.',
             'Picks the day\'s reports by views, target-price changes and shared coverage. '
             'Carries the Sep 4 edition (90 reports, 316 collected) in the file, and now '
             'names any source that failed to collect at the top of the page.',
             '증권사 리포트 자동 요약', 'Report auto-summary',
             '2026-09-04', 'e0d4d73a-22db-4d93-a0c5-6ab177711daa', True),
            ('ETF 편입종목 조회', 'ETF Holdings Lookup',
             '국내·미국·홍콩·일본·중국 상장 ETF 1,348종목의 상위 10개 편입종목과 비중. '
             '겹침 비교·종목 역조회·랭킹까지. 8/31 수집분, 총수익률 단일 기준. '
             '「사용법」 탭이 붙었지만 화면 그림·PDF 단추는 원본 파일에만 실려 아티팩트에서는 '
             '글만 보입니다 — 그림이 있는 판은 아래 사용법 항목입니다.',
             'Top-10 holdings and weights for 1,348 ETFs listed in Korea, the US, Hong Kong, '
             'Japan and China, with overlap comparison, reverse lookup and rankings. Aug 31 '
             'data, total-return basis only. The new How-to tab carries text only here — the '
             'screenshots live in the separate guide below.',
             'ETF 편입종목 조회 도구', 'ETF holdings lookup tool',
             '2026-08-31', 'c3f08597-8d47-45ce-ba27-17fd26a63dc7', True),
            ('ETF 편입종목 조회 사용법', 'ETF Holdings Lookup · How-to',
             '화면 여섯 개를 실제 화면 그림 8장과 함께 짚어 주는 안내서. 「숫자를 읽기 전에」 '
             '절에는 만들면서 실제로 틀렸던 것들 — 기준일 하루 차이로 1개월 수익률이 '
             '-4.98%와 +5.14%로 갈린 사례 같은 것 — 을 적었습니다.',
             'A walkthrough of all six screens with eight real screenshots. The "before you '
             'read the numbers" section records what actually went wrong while building it — '
             'such as one day of base-date difference flipping a 1-month return.',
             'ETF 편입종목 조회 도구', 'ETF holdings lookup tool',
             '2026-08-31', 'f38b7755-cfef-4f6d-9359-a4116b847084', True),
            ('국내 설정 공모펀드 조회', 'Korean Public Fund Finder',
             '공모펀드 3,192개를 투자 지역·유형으로 가른 화면. 단일 파일이 28.5MB 라 '
             '아티팩트 상한(16MB)을 넘어 올릴 수 없습니다. 저장소 '
             'claude/fund-search-tool 의 fund-search.html 을 내려받아 열면 됩니다.',
             '3,192 Korean public funds split by investment region and type. The single file '
             'is 28.5MB — past the 16MB artifact limit, so it cannot be published here. '
             'Download fund-search.html from the claude/fund-search-tool branch.',
             '펀드조회 화면', 'Fund search screen',
             '2026-08-31', None, ('아티팩트 불가 · 저장소', 'Too large · in repo')),
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
            ('완전판매 스크립트 자동완성', 'Compliance Script Builder',
             '상품군·시나리오를 고르면 미스터리쇼핑 평가표 순서대로 읽을 문장이 자동 '
             '완성됩니다. 상품 1,511건과 투자설명서 항목을 파일에 담아 인터넷 없이 동작하고, '
             '큰 글씨 프롬프터·셀프채점·투자설명서 PDF 판독까지 한 파일입니다. '
             '「사내 상품 API」와 파일 내려받기 단추는 아티팩트에서 동작하지 않습니다.',
             'Pick a product group and scenario and the script to read is filled in, in the '
             'order the mystery-shopping sheet checks. 1,511 products and their prospectus '
             'fields are embedded, so it runs offline, with a large-type prompter, self-scoring '
             'and client-side prospectus PDF parsing. The internal product API and the file '
             'download buttons do not work inside an artifact.',
             '완전판매 스크립트 자동화 시스템', 'Compliance script automation',
             '2026-09-06', '6e974295-f4c2-49e3-8bea-33775ef7ca4b', True),
            ('마포WM 모바일 창구', 'Mapo WM Mobile Desk',
             '고객에게 문자로 보내는 한 장. 비대면 계좌개설 6종과 자주 찾는 업무 7종을 '
             '눌러 바로 진행하게 만들었습니다. 링크는 마포WM으로 개설되는 실제 계좌개설 '
             '주소이고 원본이 검색 노출을 막아 둔 페이지이니, 링크를 넓게 돌리지 마십시오.',
             'The one-pager sent to clients by text: six online account-opening flows and '
             'seven common service tasks, each one tap away. The links are live '
             'account-opening URLs tied to the branch and the page itself is noindexed — do '
             'not circulate the link widely.',
             '개별 홈페이지/서버 구축', 'Individual homepage / server',
             '2026-09-05', '7b5fe21e-f844-4f2f-9fd5-2ee873d3d647', True),
            ('영업 지원 도구', 'Sales Toolkit',
             '종목 리포트·상품 비교기·연금 절세 시뮬레이터·반대매매 리스크 계산기를 한 파일에.',
             'Equity report, product comparison, pension tax simulator and margin-call '
             'risk calculator in one file.',
             '작업 검토 및 제안', 'Work review & recommendations',
             '2026-07-29', 'a86d0d0e-b723-42c5-b7d8-5a64262489b9', True),
            ('대주주 양도세 원문 대조', 'Major-Shareholder CGT · Source Check',
             '국가법령정보센터에서 소득세법·조세특례제한법 등 원문을 받아 대주주 양도세 '
             '설명을 조문과 한 줄씩 맞춰 본 자료. 오류 2건을 고치고 빠진 3건을 채웠습니다.',
             'Major-shareholder capital gains tax checked line by line against the statutes '
             'pulled from the national law database. Two errors corrected, three gaps closed.',
             '국가법령정보센터 법령 조회', 'National law database lookup',
             '2026-08-30', '2e47eb36-ab99-4c84-9390-55c52527e1a4', False),
            ('2026 세제 세미나 검증본', '2026 Tax Seminar · Verified',
             '세무·부동산 세제 자료를 원문 대조로 검증한 판.',
             'Tax and property-tax material verified line by line against the source.',
             '세무 자료 검증 · 부동산 세제 자료 검증', 'Tax document verification',
             '2026-08-22', '80f98891-6920-42a0-9cdc-a548f564db29', False),
        ]),
    dict(
        ko='엑셀 산식 · 업무 매뉴얼', en='Excel Formulas & Work Manuals',
        leadko='영업점에서 쓰는 엑셀 산식을 한 벌로 묶은 자료입니다. 이 세션은 브랜치를 '
               '푸시하지 않아 저장소에 파일이 없고, 아티팩트가 원본입니다.',
        leaden='One coherent set of the Excel formulas used at a branch. This session never '
               'pushed a branch, so no file exists in the repository — the artifacts are the '
               'original.',
        items=[
            ('산식 길잡이', 'Formula Wayfinder',
             '함수 이름을 몰라도 하려는 일을 문장으로 고르면 산식을 순서대로 꺼내 줍니다. '
             '41개 업무 8분류. 이 묶음의 입구로 쓰는 최종본.',
             'Pick what you are trying to do in plain language and it lays out the formulas in '
             'order — no function names needed. 41 tasks in 8 groups; the finished entry point '
             'to this set.',
             '엑셀 함수 및 계산식 정리', 'Excel functions & formulas',
             '2026-08-25', '4188685b-2521-4240-a3ef-987a8fd0b034', False),
            ('엑셀 산식 원장 합본', 'Formula Ledger · Combined',
             '1권·2권을 한 권으로 묶은 전체 참조. 21분류 169항목. 검색이 유사어·오타·초성'
             '(ㅁㅋㄹ → 매크로)을 받아 줍니다.',
             'Volumes 1 and 2 merged into the full reference — 21 groups, 169 entries. Search '
             'tolerates synonyms, typos and Korean initials.',
             '엑셀 함수 및 계산식 정리', 'Excel functions & formulas',
             '2026-08-25', '94e6f911-801c-40f6-8099-196a8c7d0c9c', False),
            ('엑셀 산식 도해', 'Formula Diagrams',
             '수식이 어느 칸을 집고 무슨 일을 하는지 18장의 그림으로 먼저 보여 줍니다. '
             '초록이 수식이 실제로 건드리는 곳입니다.',
             'Eighteen diagrams showing which cells a formula touches and what it does, before '
             'the syntax. Green marks what the formula actually reads.',
             '엑셀 함수 및 계산식 정리', 'Excel functions & formulas',
             '2026-08-25', 'c2ddc566-2f52-42b9-b549-bdb8b86ba271', False),
            ('엑셀 산식 원장 · 제1권', 'Formula Ledger · Volume 1',
             '함수·재무 계산 기본편. 내용은 위 합본에 그대로 들어가 있습니다.',
             'The functions and financial-calculation volume. Its content is carried in the '
             'combined edition above.',
             '엑셀 함수 및 계산식 정리', 'Excel functions & formulas',
             '2026-08-24', 'ccb64920-9f9e-4045-91ac-d5809128a878', False),
            ('영업점 산식 원장 · 제2권', 'Branch Formula Ledger · Volume 2',
             '파워 쿼리·매크로 자동화와 고객·만기·실적 관리 산식. 6분류 48항목. '
             '내용은 위 합본에 그대로 들어가 있습니다.',
             'Power Query and macro automation plus client, maturity and performance formulas — '
             '6 groups, 48 entries. Also carried in the combined edition above.',
             '엑셀 함수 및 계산식 정리', 'Excel functions & formulas',
             '2026-08-25', '23202724-7f0d-4318-93d5-f9b438106ff3', False),
        ]),
    dict(
        ko='세미나 · 발표자료 · 영상', en='Seminars, Decks & Video',
        leadko='PPTX·MP4 원본은 아티팩트로 바로 열 수 없어, 슬라이드 텍스트와 차트를 '
               '추출한 보관본을 만들고 원본 파일을 붙였습니다.',
        leaden='PPTX and MP4 originals cannot open as an artifact, so each page carries the '
               'extracted slide text and charts with the original file attached.',
        items=[
            ('2026 하반기 시장 팩트시트', 'H2 2026 Market Factsheet',
             '세미나 의뢰서가 전제한 “2026년 금리인하”가 1차 자료와 반대라는 점부터 짚고, '
             '미국·한국 매크로·섹터·리스크를 확인된 수치로만 정리했습니다. 출처 30건.',
             'Opens by flagging that the seminar brief\'s premise of 2026 rate cuts contradicts '
             'the primary sources, then sets out US and Korean macro, sectors and risks using '
             'only verified figures. Thirty sources.',
             '투자 세미나 팩트시트', 'Investment seminar factsheet',
             '2026-08-26', '7b47b6a1-ed09-4e4c-a5c6-5cc8b2da293b', False),
            ('반도체·코스피 팩트시트', 'Semiconductor & KOSPI Factsheet',
             '7월 급락을 통과한 시점의 반도체 사이클 위치. 목표주가가 210만~470만원으로 '
             '2.2배 벌어져 컨센서스가 없다는 사실까지 그대로 실었습니다. 출처 33건.',
             'Where the semiconductor cycle stands after the July selloff — including that '
             'target prices span 2.1–4.7m won, a 2.2× spread with no consensus. 33 sources.',
             '투자 세미나 팩트시트', 'Investment seminar factsheet',
             '2026-08-26', '03bc8628-27ec-48d8-8e15-634043688b66', False),
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
    ('미국 100대 기업 정보 조회 화면', 'US top-100 companies dashboard',
     '9월 8일 기준 아직 진행 중인 세션입니다. 최종본이 정해지면 다음 갱신에 싣습니다.',
     'Still in progress as of Sep 8; it goes in once the session settles on a final build.'),
    ('초기 작업 검증 프로세스', 'Initial work validation process',
     '브리핑 생성 파이프라인에 검증 관문을 붙인 작업입니다. 훅·워크플로·점검 스크립트가 '
     '결과물이라 화면으로 볼 산출물이 없습니다.',
     'Added a validation gate to the briefing pipeline. The output is hooks, a workflow and '
     'check scripts — nothing to view as a page.'),
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
h.append(bi('클로드 코드 세션 44개가 남긴 최종 작업본을 주제별로 모았습니다. '
            '제목을 누르면 해당 아티팩트가 열립니다.',
            'The final deliverable of every one of 44 Claude Code sessions, grouped by '
            'subject. Each title opens its artifact.', 'p', 'sub'))

h.append('<div class="stats">')
for kolab, enlab, val in [('세션', 'Sessions', '44'),
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
            # 아티팩트가 없는 항목의 꼬리표. is_new 에 (한글, 영문) 짝을 넣어
            # 두면 그것을 쓰고, 아니면 기본값(아카이브 참조)을 쓴다.
            lab = is_new if isinstance(is_new, tuple) else ('아래 아카이브', 'See archive')
            h.append('<span class="chip old">%s</span>' % bi(lab[0], lab[1]))
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
h.append(bi('기준 2026-09-08 · 저장소 <code>hanaroline/work_1</code> · '
            '세션별 브랜치의 마지막 커밋에서 산출물을 뽑았습니다. 이 색인은 월·목 아침에 '
            '스스로 갱신됩니다.',
            'As of 2026-09-08 · repository <code>hanaroline/work_1</code> · deliverables taken '
            'from the last commit on each session branch. This index refreshes itself on '
            'Monday and Thursday mornings.', 'p'))
h.append(bi('세션 목록에는 최근 35개가 잡힙니다. 그보다 앞선 브랜치 두 개'
            '(<code>singgil-parkzai-brochure</code>, <code>new-session-5tllo8</code>)의 '
            '산출물도 함께 실었습니다. 엑셀 산식 계열은 브랜치가 푸시되지 않아 아티팩트가 '
            '원본이고, 팩트시트 2건은 아티팩트 목록에서 찾았으나 어느 세션이 만들었는지는 '
            '세션 목록으로 확인되지 않았습니다.',
            'The session list returns the most recent 35. Two older branches '
            '(<code>singgil-parkzai-brochure</code>, <code>new-session-5tllo8</code>) are '
            'included here as well. The Excel formula set has no pushed branch, so its '
            'artifacts are the original; the two factsheets were found in the artifact list '
            'but the session that produced them could not be identified from the session '
            'listing.', 'p'))
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
