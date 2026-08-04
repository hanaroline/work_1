/*
 * 데이터센터 밸류체인 — 단계 정의 + 국내(KR) 종목
 * ------------------------------------------------
 * 스키마
 *   STAGES: [{ id, no, name, nameEn, desc, descEn, driver, driverEn }]
 *   DC_KR / DC_GLOBAL: [{
 *     id      : 고유 키(국내=6자리 코드, 해외=티커)
 *     name    : 종목명(한글) / nameEn: 영문명
 *     tk      : 화면 표기 티커      mkt: 시장(KOSPI/KOSDAQ/NASDAQ/NYSE/TWSE/TSE/...)
 *     region  : 'KR' | 'US' | 'TW' | 'JP' | 'EU' | 'CN'
 *     tier    : '대형' | '중형'      (시가총액/시장 지위 기준 표기)
 *     stages  : 밸류체인 단계 id 배열(복수 가능 — 실제로 여러 단계에 걸친 기업)
 *     pos     : 밸류체인 내 포지션(짧게) / posEn
 *     sum     : 한 줄 요약 / sumEn
 *     pts     : 데이터센터 연관 포인트 2개 / ptsEn
 *     prod    : 주요 제품·서비스 태그 / prodEn
 *     edge    : 경쟁 지위 한 줄 / edgeEn
 *     ysym    : Yahoo Finance 심볼(시세 조회용)
 *   }]
 *
 * 종목 선정 기준: 각 단계에서 시장 지위(점유율·수주·고객)를 확보한 대형주 중심.
 * 국내 일부 단계는 대형주 부재로 해당 분야 1위 중형주를 '중형'으로 표기해 포함.
 * 수치(주가·시가총액)는 데이터에 넣지 않고 조회 시점에 실시간으로 불러온다.
 */

window.DC_STAGES = [
  {
    id: "chip", no: "01",
    name: "AI 반도체 · 연산", nameEn: "AI silicon & compute",
    desc: "GPU·AI 가속기·CPU와 이를 만드는 파운드리. 데이터센터 투자액의 절반 이상이 여기서 소비된다.",
    descEn: "GPUs, AI accelerators, CPUs and the foundries that build them — over half of data center capex lands here.",
    driver: "가속기 출하량 · 파운드리 선단 공정 캐파",
    driverEn: "Accelerator shipments, leading-edge foundry capacity"
  },
  {
    id: "memory", no: "02",
    name: "메모리 · 스토리지", nameEn: "Memory & storage",
    desc: "HBM·서버 DRAM·eSSD·니어라인 HDD. 가속기 1장당 메모리 탑재량이 세대마다 늘어난다.",
    descEn: "HBM, server DRAM, eSSD and nearline HDD — memory content per accelerator rises every generation.",
    driver: "HBM 세대 전환 · 서버 DRAM 가격",
    driverEn: "HBM generation shifts, server DRAM pricing"
  },
  {
    id: "board", no: "03",
    name: "기판 · 후공정 · 부품", nameEn: "Substrate, packaging & components",
    desc: "FC-BGA·고다층 MLB·메모리 기판과 HBM 적층 장비, 고속 커넥터. AI 서버의 병목이 자주 생기는 구간.",
    descEn: "FC-BGA, high-layer-count MLB, memory substrates, HBM stacking tools and high-speed connectors — a frequent bottleneck.",
    driver: "층수·면적 증가 · 패키징 캐파",
    driverEn: "Layer count and area growth, packaging capacity"
  },
  {
    id: "server", no: "04",
    name: "서버 · 시스템", nameEn: "Servers & systems",
    desc: "AI 서버·랙 스케일 시스템을 설계·조립해 하이퍼스케일러에 공급하는 OEM·ODM과 랙·함체.",
    descEn: "OEM/ODM builders of AI servers and rack-scale systems, plus racks and enclosures, shipping to hyperscalers.",
    driver: "랙 출하량 · 액체냉각 랙 전환",
    driverEn: "Rack shipments, transition to liquid-cooled racks"
  },
  {
    id: "network", no: "05",
    name: "네트워크 · 광통신", nameEn: "Networking & optics",
    desc: "이더넷 스위치, 800G 광트랜시버, 광섬유·케이블. 클러스터가 커질수록 필요량이 비선형으로 늘어난다.",
    descEn: "Ethernet switches, 800G optics, fiber and cable — demand scales non-linearly with cluster size.",
    driver: "스케일아웃 클러스터 규모 · 800G/1.6T 전환",
    driverEn: "Scale-out cluster size, 800G/1.6T transition"
  },
  {
    id: "power", no: "06",
    name: "전력 · 에너지", nameEn: "Power & energy",
    desc: "발전(가스터빈·원전·연료전지)부터 변압기·배전반·UPS·비상발전기까지. 지금 밸류체인의 최대 병목.",
    descEn: "From generation (gas turbines, nuclear, fuel cells) to transformers, switchgear, UPS and standby gensets — today's tightest bottleneck.",
    driver: "계통 접속 대기 · 변압기 리드타임",
    driverEn: "Grid interconnection queues, transformer lead times"
  },
  {
    id: "cooling", no: "07",
    name: "냉각 · 공조", nameEn: "Cooling & thermal",
    desc: "칠러·CDU·액침냉각. 랙 전력밀도가 100kW를 넘어서며 공기냉각에서 액체냉각으로 표준이 이동 중.",
    descEn: "Chillers, CDUs and immersion cooling — as rack density passes 100kW the standard is shifting from air to liquid.",
    driver: "랙 전력밀도 · 액체냉각 채택률",
    driverEn: "Rack power density, liquid cooling adoption"
  },
  {
    id: "epc", no: "08",
    name: "건설 · EPC", nameEn: "Construction & EPC",
    desc: "부지 확보부터 전기·기계 설비 시공, 시운전까지. 착공에서 가동까지의 리드타임을 결정한다.",
    descEn: "Site through electrical/mechanical installation and commissioning — this sets the lead time from groundbreaking to live load.",
    driver: "신규 착공 규모 · 전기공사 인력",
    driverEn: "New starts, electrical labor availability"
  },
  {
    id: "ops", no: "09",
    name: "운영 · 코로케이션 · 클라우드", nameEn: "Operators, colocation & cloud",
    desc: "데이터센터를 소유·임대·운영하는 사업자와, 밸류체인 전체의 수요를 만드는 클라우드·AI 사업자.",
    descEn: "Owners, landlords and operators of data centers — and the cloud/AI buyers whose capex funds the entire chain.",
    driver: "하이퍼스케일러 capex · 계약 임대율",
    driverEn: "Hyperscaler capex, contracted lease rates"
  }
];

window.DC_KR = [
  {
    id: "005930", name: "삼성전자", nameEn: "Samsung Electronics", tk: "005930", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["chip", "memory"], ysym: "005930.KS",
    pos: "메모리 · 파운드리 · eSSD", posEn: "Memory, foundry, eSSD",
    sum: "HBM·서버 DRAM·eSSD와 파운드리를 한 회사가 모두 공급하는 국내 유일 사업자.",
    sumEn: "The only Korean company supplying HBM, server DRAM, eSSD and foundry services all at once.",
    pts: [
      "AI 서버용 HBM·DDR5·eSSD 공급, 자체 파운드리로 AI 가속기 위탁생산도 병행",
      "메모리 가격 사이클과 파운드리 수주가 실적을 동시에 좌우"
    ],
    ptsEn: [
      "Supplies HBM, DDR5 and eSSD for AI servers while also fabricating accelerators in its own foundry",
      "Earnings hinge on both the memory pricing cycle and foundry order flow"
    ],
    prod: ["HBM", "서버 DRAM", "eSSD", "파운드리", "이미지센서"],
    prodEn: ["HBM", "Server DRAM", "eSSD", "Foundry", "Image sensors"],
    edge: "메모리와 선단 파운드리를 동시에 보유한 세계 2개 회사 중 하나",
    edgeEn: "One of only two firms worldwide holding both memory and leading-edge foundry"
  },
  {
    id: "000660", name: "SK하이닉스", nameEn: "SK hynix", tk: "000660", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["memory"], ysym: "000660.KS",
    pos: "HBM · 서버 DRAM", posEn: "HBM, server DRAM",
    sum: "HBM 시장 선두 사업자로, AI 가속기 메모리 공급의 핵심 축.",
    sumEn: "The HBM market leader and the pivotal memory supplier to AI accelerators.",
    pts: [
      "HBM은 고객과 물량·가격을 사전 계약하는 구조로 일반 D램보다 수익 변동성이 낮음",
      "가속기 세대 전환(HBM3E→HBM4)마다 단가와 점유율이 재조정"
    ],
    ptsEn: [
      "HBM ships under pre-agreed volume and price terms, damping the usual DRAM volatility",
      "Each accelerator generation (HBM3E to HBM4) resets pricing and share"
    ],
    prod: ["HBM", "서버 DRAM", "eSSD", "SOCAMM"],
    prodEn: ["HBM", "Server DRAM", "eSSD", "SOCAMM"],
    edge: "HBM 점유율 글로벌 1위권, 주요 가속기 업체의 최우선 공급사",
    edgeEn: "Top-ranked in global HBM share and lead supplier to the major accelerator vendors"
  },
  {
    id: "042700", name: "한미반도체", nameEn: "Hanmi Semiconductor", tk: "042700", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["board"], ysym: "042700.KS",
    pos: "HBM 적층 장비(TC 본더)", posEn: "HBM stacking tools (TC bonder)",
    sum: "HBM D램을 쌓아 붙이는 TC 본더의 세계 선두 공급사.",
    sumEn: "The world's leading supplier of the TC bonders that stack HBM DRAM dies.",
    pts: [
      "HBM 캐파 증설이 곧 장비 발주 — 메모리사의 투자 계획에 실적이 직결",
      "본딩 방식 변화(TC 본딩 → 하이브리드 본딩) 대응이 중장기 관전 포인트"
    ],
    ptsEn: [
      "Every HBM capacity addition becomes a tool order, tying results directly to memory capex",
      "The shift from thermo-compression toward hybrid bonding is the key medium-term watch item"
    ],
    prod: ["TC 본더", "듀얼 TC 본더", "비전 플레이스먼트", "쏘잉"],
    prodEn: ["TC bonder", "Dual TC bonder", "Vision placement", "Sawing"],
    edge: "HBM용 TC 본더 시장 사실상 표준 장비 공급사",
    edgeEn: "De facto standard tool supplier for HBM thermo-compression bonding"
  },
  {
    id: "009150", name: "삼성전기", nameEn: "Samsung Electro-Mechanics", tk: "009150", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["board"], ysym: "009150.KS",
    pos: "FC-BGA 기판 · MLCC", posEn: "FC-BGA substrates, MLCC",
    sum: "AI 가속기·서버 CPU를 얹는 고다층 FC-BGA 기판과 전장용 MLCC 공급사.",
    sumEn: "Supplier of the high-layer FC-BGA substrates that carry accelerators and server CPUs, plus MLCCs.",
    pts: [
      "서버·AI용 FC-BGA는 층수·면적이 커질수록 단가가 오르는 고부가 제품",
      "MLCC도 서버 전원단 사용량이 늘어 데이터센터 수요에 연동"
    ],
    ptsEn: [
      "Server and AI FC-BGA carries higher pricing as layer count and body size grow",
      "MLCC content in server power stages is rising alongside data center demand"
    ],
    prod: ["FC-BGA", "MLCC", "패키지 기판", "카메라 모듈"],
    prodEn: ["FC-BGA", "MLCC", "Package substrates", "Camera modules"],
    edge: "국내 FC-BGA 최대 공급사, 일본·대만 업체와 상위권 경쟁",
    edgeEn: "Korea's largest FC-BGA supplier, competing at the top with Japanese and Taiwanese peers"
  },
  {
    id: "007660", name: "이수페타시스", nameEn: "Isu Petasys", tk: "007660", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["board", "network"], ysym: "007660.KS",
    pos: "고다층 MLB(스위치·가속기 보드)", posEn: "High-layer MLB for switches and accelerators",
    sum: "AI 스위치·가속기 보드에 쓰이는 고다층 인쇄회로기판(MLB)의 소수 공급사.",
    sumEn: "One of few suppliers of the high-layer-count PCBs used in AI switch and accelerator boards.",
    pts: [
      "북미 하이퍼스케일러·네트워크 업체를 직접 고객으로 두고 층수 상승의 수혜",
      "증설 캐파가 곧 매출 상한 — 신규 공장 가동 시점이 중요 변수"
    ],
    ptsEn: [
      "Sells directly to North American hyperscalers and networking vendors, benefiting from rising layer counts",
      "Revenue is capped by capacity, so new plant ramp timing is the key variable"
    ],
    prod: ["18층 이상 MLB", "네트워크 스위치 보드", "가속기 보드"],
    prodEn: ["18+ layer MLB", "Network switch boards", "Accelerator boards"],
    edge: "고다층 MLB 글로벌 상위권, AI 스위치 보드 핵심 벤더",
    edgeEn: "Global top-tier in high-layer MLB and a core vendor for AI switch boards"
  },
  {
    id: "222800", name: "심텍", nameEn: "Simmtech", tk: "222800", mkt: "KOSDAQ",
    region: "KR", tier: "중형", stages: ["board", "memory"], ysym: "222800.KQ",
    pos: "메모리 모듈 기판", posEn: "Memory module substrates",
    sum: "서버 DRAM 모듈·SSD용 패키지 기판에 특화된 메모리 기판 전문업체.",
    sumEn: "A memory-substrate specialist focused on package substrates for server DRAM modules and SSDs.",
    pts: [
      "서버 모듈·SOCAMM 등 AI 서버 메모리 폼팩터 변화의 직접 수혜 구간",
      "메모리 출하량에 연동되는 구조로 D램 사이클 민감도가 높음"
    ],
    ptsEn: [
      "Directly exposed to new AI-server memory form factors such as server modules and SOCAMM",
      "Volume-linked to memory shipments, so sensitivity to the DRAM cycle is high"
    ],
    prod: ["메모리 모듈 PCB", "SSD 기판", "FC-CSP", "SOCAMM 기판"],
    prodEn: ["Memory module PCB", "SSD substrates", "FC-CSP", "SOCAMM substrates"],
    edge: "메모리 모듈 기판 세계 1위권 점유율",
    edgeEn: "Top-ranked global share in memory module substrates"
  },
  {
    id: "353200", name: "대덕전자", nameEn: "Daeduck Electronics", tk: "353200", mkt: "KOSPI",
    region: "KR", tier: "중형", stages: ["board"], ysym: "353200.KS",
    pos: "FC-BGA · 메모리 기판", posEn: "FC-BGA, memory substrates",
    sum: "FC-BGA와 메모리 기판을 함께 하는 국내 2위권 패키지 기판 업체.",
    sumEn: "Korea's number-two package substrate maker, spanning FC-BGA and memory substrates.",
    pts: [
      "서버·네트워크용 고부가 기판 비중 확대가 수익성 개선의 축",
      "FC-BGA 신규 라인 가동률이 실적 레버리지를 결정"
    ],
    ptsEn: [
      "Margin improvement rests on a growing mix of high-value server and networking substrates",
      "Utilization of new FC-BGA lines drives the earnings leverage"
    ],
    prod: ["FC-BGA", "메모리 기판", "RF 패키지", "다층 PCB"],
    prodEn: ["FC-BGA", "Memory substrates", "RF packages", "Multilayer PCB"],
    edge: "국내 패키지 기판 2위, 서버용 고다층 라인 확대 중",
    edgeEn: "Korea's second-largest package substrate maker, expanding server-grade high-layer lines"
  },
  {
    id: "000150", name: "두산", nameEn: "Doosan", tk: "000150", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["board"], ysym: "000150.KS",
    pos: "AI 가속기용 동박적층판(CCL)", posEn: "CCL for AI accelerators",
    sum: "전자BG가 고속 신호용 동박적층판(CCL)을 공급, 지주부문은 두산에너빌리티 등을 보유.",
    sumEn: "Its electronics unit supplies high-speed copper-clad laminate, while the holding arm owns Doosan Enerbility and others.",
    pts: [
      "고다층 MLB·가속기 보드의 소재 단계로, 층수 상승 시 소재 단가도 상승",
      "지주회사로서 발전(두산에너빌리티) 밸류체인 노출도 함께 보유"
    ],
    ptsEn: [
      "Sits upstream of high-layer MLB and accelerator boards, with material pricing rising alongside layer counts",
      "As a holding company it also carries exposure to power generation via Doosan Enerbility"
    ],
    prod: ["저손실 CCL", "빌드업 필름", "전자소재"],
    prodEn: ["Low-loss CCL", "Build-up film", "Electronic materials"],
    edge: "고속·저손실 CCL 글로벌 소수 공급사",
    edgeEn: "One of few global suppliers of high-speed, low-loss CCL"
  },
  {
    id: "178320", name: "서진시스템", nameEn: "Seojin System", tk: "178320", mkt: "KOSDAQ",
    region: "KR", tier: "중형", stages: ["server"], ysym: "178320.KQ",
    pos: "서버 랙 · 함체 · 케이스", posEn: "Server racks, enclosures, casings",
    sum: "통신장비·ESS 함체에서 출발해 서버 랙·구조물로 확장한 금속 가공 업체.",
    sumEn: "A metal fabricator that expanded from telecom and ESS enclosures into server racks and structures.",
    pts: [
      "AI 랙은 무게·발열이 커져 구조물·수냉 매니폴드 등 기구 부품 사양이 상승",
      "ESS 함체 수요와 데이터센터 수요가 함께 붙는 구조"
    ],
    ptsEn: [
      "Heavier, hotter AI racks raise the spec for structures and liquid-cooling manifolds",
      "ESS enclosure demand and data center demand stack on the same production base"
    ],
    prod: ["서버 랙", "ESS 함체", "통신장비 케이스", "정밀 가공"],
    prodEn: ["Server racks", "ESS enclosures", "Telecom casings", "Precision machining"],
    edge: "국내 대형 금속 함체 가공 캐파 보유",
    edgeEn: "Holds among Korea's largest metal enclosure fabrication capacity"
  },
  {
    id: "138080", name: "오이솔루션", nameEn: "OE Solutions", tk: "138080", mkt: "KOSDAQ",
    region: "KR", tier: "중형", stages: ["network"], ysym: "138080.KQ",
    pos: "광트랜시버", posEn: "Optical transceivers",
    sum: "국내 최대 광트랜시버 업체로, 통신용에서 데이터센터용으로 축을 옮기는 중.",
    sumEn: "Korea's largest optical transceiver maker, pivoting from telecom to data center applications.",
    pts: [
      "AI 클러스터는 GPU 수보다 빠르게 광모듈 수가 늘어나는 구조",
      "800G급 데이터센터 제품 진입 여부가 밸류에이션의 핵심 변수"
    ],
    ptsEn: [
      "Optical module counts in AI clusters grow faster than GPU counts",
      "Qualification into 800G data center products is the key valuation driver"
    ],
    prod: ["광트랜시버", "5G 프론트홀", "데이터센터 광모듈"],
    prodEn: ["Optical transceivers", "5G fronthaul", "Data center optics"],
    edge: "국내 광트랜시버 1위, 국산화 대표 업체",
    edgeEn: "Korea's number-one optical transceiver vendor and the flagship localization play"
  },
  {
    id: "010170", name: "대한광통신", nameEn: "Taihan Fiberoptics", tk: "010170", mkt: "KOSPI",
    region: "KR", tier: "중형", stages: ["network"], ysym: "010170.KS",
    pos: "광섬유 · 광케이블", posEn: "Optical fiber and cable",
    sum: "원재료부터 광섬유·광케이블까지 일괄 생산하는 국내 유일 업체.",
    sumEn: "The only Korean firm producing optical fiber and cable end-to-end from raw materials.",
    pts: [
      "데이터센터 내·간 연결에 쓰이는 초고밀도 케이블 수요 확대",
      "광섬유 가격 사이클과 빅테크 발주 시점에 실적 민감"
    ],
    ptsEn: [
      "Demand is expanding for ultra-high-density cable used inside and between data centers",
      "Earnings track the fiber pricing cycle and big-tech order timing"
    ],
    prod: ["광섬유", "초고밀도 광케이블", "광튜브"],
    prodEn: ["Optical fiber", "Ultra-high-density cable", "Micro-duct cable"],
    edge: "광섬유 수직계열화, 해외 빅테크 데이터센터 케이블 공급 이력",
    edgeEn: "Vertically integrated in fiber, with a track record supplying overseas big-tech data centers"
  },
  {
    id: "267260", name: "HD현대일렉트릭", nameEn: "HD Hyundai Electric", tk: "267260", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["power"], ysym: "267260.KS",
    pos: "초고압 변압기 · 배전", posEn: "Ultra-high-voltage transformers, distribution",
    sum: "북미 데이터센터·전력망 교체 수요를 받는 국내 대표 초고압 변압기 업체.",
    sumEn: "Korea's flagship UHV transformer maker, riding North American data center and grid replacement demand.",
    pts: [
      "변압기는 리드타임이 수년 단위로 길어져 수주잔고가 곧 실적 가시성",
      "미국 현지 생산·증설 여부가 관세·물류 리스크의 완충 장치"
    ],
    ptsEn: [
      "Multi-year transformer lead times turn the order backlog into earnings visibility",
      "US local production and expansion buffer tariff and logistics risk"
    ],
    prod: ["초고압 변압기", "고압 차단기", "회전기", "배전기기"],
    prodEn: ["UHV transformers", "HV breakers", "Rotating machines", "Distribution gear"],
    edge: "국내 변압기 1위, 북미 매출 비중 최상위",
    edgeEn: "Korea's top transformer maker with the highest North American revenue mix"
  },
  {
    id: "298040", name: "효성중공업", nameEn: "HS Hyosung Heavy Industries", tk: "298040", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["power"], ysym: "298040.KS",
    pos: "변압기 · GIS · 계통 솔루션", posEn: "Transformers, GIS, grid solutions",
    sum: "변압기와 가스절연개폐장치(GIS)를 함께 공급하는 전력기기 대형주.",
    sumEn: "A large-cap power equipment maker supplying both transformers and gas-insulated switchgear.",
    pts: [
      "데이터센터 수전 설비는 변압기+개폐장치 패키지 발주가 일반적",
      "미국·중동 수주잔고와 건설부문 실적이 함께 반영"
    ],
    ptsEn: [
      "Data center intake substations are typically ordered as transformer plus switchgear packages",
      "Results combine US and Middle East backlog with the construction division"
    ],
    prod: ["초고압 변압기", "GIS", "STATCOM", "ESS"],
    prodEn: ["UHV transformers", "GIS", "STATCOM", "ESS"],
    edge: "변압기·GIS 동시 공급 역량, 미국 현지 공장 보유",
    edgeEn: "Able to bundle transformers and GIS, with US manufacturing on the ground"
  },
  {
    id: "010120", name: "LS ELECTRIC", nameEn: "LS Electric", tk: "010120", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["power"], ysym: "010120.KS",
    pos: "배전 · UPS · 전력 솔루션", posEn: "Distribution, UPS, power solutions",
    sum: "배전기기·전력 자동화에서 데이터센터 수배전 솔루션까지 확장한 전력기기 업체.",
    sumEn: "A power equipment maker extending from distribution gear and automation into data center power solutions.",
    pts: [
      "데이터센터 내부 배전반·UPS·전력 관리까지 묶어서 공급 가능",
      "북미 배전 시장 진출과 국내 데이터센터 수주가 성장 축"
    ],
    ptsEn: [
      "Can bundle in-building switchboards, UPS and power management",
      "Growth rests on North American distribution entry and domestic data center orders"
    ],
    prod: ["배전반", "UPS", "전력 자동화", "저압 기기"],
    prodEn: ["Switchboards", "UPS", "Power automation", "Low-voltage gear"],
    edge: "국내 저압·배전기기 1위 사업자",
    edgeEn: "Korea's number one in low-voltage and distribution equipment"
  },
  {
    id: "006260", name: "LS", nameEn: "LS Corp.", tk: "006260", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["power"], ysym: "006260.KS",
    pos: "초고압 케이블(LS전선) 지주", posEn: "Holding company for LS Cable UHV",
    sum: "비상장 LS전선을 통해 초고압 전력케이블·해저케이블에 노출된 지주회사.",
    sumEn: "A holding company with exposure to UHV power and submarine cable through unlisted LS Cable.",
    pts: [
      "데이터센터 단지 수전을 위한 초고압 케이블·접속재 수요 확대",
      "미국 해저·전력 케이블 공장 투자로 현지 수요 대응"
    ],
    ptsEn: [
      "Rising demand for UHV cable and accessories to feed data center campuses",
      "US cable plant investment positions it for local demand"
    ],
    prod: ["초고압 케이블", "해저 케이블", "전선 접속재", "동제련"],
    prodEn: ["UHV cable", "Submarine cable", "Cable accessories", "Copper smelting"],
    edge: "국내 전선 1위(LS전선) 보유 지주",
    edgeEn: "Holding company of LS Cable, Korea's largest wire and cable maker"
  },
  {
    id: "001440", name: "대한전선", nameEn: "Taihan Cable & Solution", tk: "001440", mkt: "KOSPI",
    region: "KR", tier: "중형", stages: ["power"], ysym: "001440.KS",
    pos: "초고압 전력케이블", posEn: "UHV power cable",
    sum: "북미·중동 전력망 프로젝트를 확대하는 국내 2위 전선업체.",
    sumEn: "Korea's second-largest cable maker, growing in North American and Middle East grid projects.",
    pts: [
      "데이터센터 증설은 송배전 케이블 물량 증가로 직결",
      "미국 공장 증설과 해저케이블 진입이 중장기 축"
    ],
    ptsEn: [
      "Data center build-outs translate directly into transmission and distribution cable volume",
      "US capacity additions and submarine cable entry are the medium-term drivers"
    ],
    prod: ["초고압 케이블", "배전 케이블", "해저 케이블", "버스덕트"],
    prodEn: ["UHV cable", "Distribution cable", "Submarine cable", "Busduct"],
    edge: "국내 전선 2위, 미국 현지 생산 확대",
    edgeEn: "Korea's number-two cable maker, scaling US local production"
  },
  {
    id: "103590", name: "일진전기", nameEn: "Iljin Electric", tk: "103590", mkt: "KOSPI",
    region: "KR", tier: "중형", stages: ["power"], ysym: "103590.KS",
    pos: "변압기 · 전선", posEn: "Transformers and cable",
    sum: "변압기와 전선을 함께 생산하며 미국 수출 비중을 늘려온 전력기기 업체.",
    sumEn: "A power equipment maker producing both transformers and cable, with a growing US export mix.",
    pts: [
      "미국 노후 전력망 교체·데이터센터 수전 수요를 동시 수취",
      "변압기 캐파 증설 속도가 매출 성장의 상한"
    ],
    ptsEn: [
      "Captures both US grid replacement and data center intake demand",
      "Transformer capacity additions cap the revenue trajectory"
    ],
    prod: ["전력용 변압기", "배전 변압기", "가공선", "전력 케이블"],
    prodEn: ["Power transformers", "Distribution transformers", "Overhead conductors", "Power cable"],
    edge: "변압기·전선 동시 생산, 미국 매출 비중 상위",
    edgeEn: "Produces both transformers and cable with a high US revenue mix"
  },
  {
    id: "062040", name: "산일전기", nameEn: "Sanil Electric", tk: "062040", mkt: "KOSPI",
    region: "KR", tier: "중형", stages: ["power"], ysym: "062040.KS",
    pos: "미국향 배전 변압기", posEn: "Distribution transformers for the US",
    sum: "매출 대부분이 변압기이고 그 대부분이 미국 수출인 배전 변압기 전문업체.",
    sumEn: "A distribution transformer specialist whose revenue is mostly transformers, mostly exported to the US.",
    pts: [
      "미국 데이터센터·신재생 접속용 배전 변압기 수요에 직접 노출",
      "연료전지·발전 설비 업체와의 공급 계약이 수주 가시성을 높임"
    ],
    ptsEn: [
      "Direct exposure to US data center and renewable interconnection transformer demand",
      "Supply agreements with fuel cell and generation vendors add backlog visibility"
    ],
    prod: ["배전 변압기", "몰드 변압기", "특수 변압기"],
    prodEn: ["Distribution transformers", "Cast-resin transformers", "Specialty transformers"],
    edge: "미국 배전 변압기 니치에서 높은 수익성 유지",
    edgeEn: "Sustains high margins in the US distribution transformer niche"
  },
  {
    id: "034020", name: "두산에너빌리티", nameEn: "Doosan Enerbility", tk: "034020", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["power"], ysym: "034020.KS",
    pos: "가스터빈 · 원전 · SMR", posEn: "Gas turbines, nuclear, SMR",
    sum: "데이터센터 전력원으로 부각된 가스터빈과 원전·SMR 주기기를 만드는 국내 유일 업체.",
    sumEn: "Korea's only maker of the gas turbines and nuclear/SMR main equipment now sought as data center power.",
    pts: [
      "계통 접속 대기가 길어질수록 자체 발전(가스터빈·SMR) 수요가 부각",
      "SMR 파운드리 역할로 해외 원전 스타트업 물량도 수취"
    ],
    ptsEn: [
      "Longer interconnection queues push demand toward on-site generation such as gas turbines and SMRs",
      "Its SMR foundry role also captures volume from overseas nuclear developers"
    ],
    prod: ["대형 가스터빈", "원자로 주기기", "SMR", "HRSG"],
    prodEn: ["Heavy-duty gas turbines", "Nuclear main equipment", "SMR", "HRSG"],
    edge: "가스터빈 자체 모델 보유 세계 5개 회사 중 하나, SMR 제작 캐파 세계 최상위",
    edgeEn: "One of five firms worldwide with its own heavy gas turbine, and top-tier SMR fabrication capacity"
  },
  {
    id: "015760", name: "한국전력", nameEn: "KEPCO", tk: "015760", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["power", "ops"], ysym: "015760.KS",
    pos: "전력 공급 · 계통 접속", posEn: "Power supply and grid interconnection",
    sum: "국내 데이터센터의 계통 접속과 전력 요금을 결정하는 송배전 독점 사업자.",
    sumEn: "The transmission and distribution monopoly that decides interconnection and tariffs for Korean data centers.",
    pts: [
      "수도권 계통 여유 부족이 국내 데이터센터 입지·착공 속도를 좌우",
      "전기요금 체계와 접속 규정이 데이터센터 운영비의 핵심 변수"
    ],
    ptsEn: [
      "Limited capital-region grid headroom shapes where and how fast Korean data centers get built",
      "Tariff design and interconnection rules are the core driver of operating cost"
    ],
    prod: ["송배전망", "전력 판매", "계통 접속"],
    prodEn: ["T&D network", "Power sales", "Grid interconnection"],
    edge: "국내 송배전 독점, 데이터센터 전력 공급의 관문",
    edgeEn: "Monopoly over Korean T&D and the gateway for data center power"
  },
  {
    id: "119850", name: "지엔씨에너지", nameEn: "GnC Energy", tk: "119850", mkt: "KOSDAQ",
    region: "KR", tier: "중형", stages: ["power"], ysym: "119850.KQ",
    pos: "데이터센터 비상발전기", posEn: "Data center standby generators",
    sum: "데이터센터용 비상발전기 국내 1위 업체로, 대형 AI 데이터센터 공급 이력 보유.",
    sumEn: "Korea's leading data center standby generator maker with a record of supplying large AI data centers.",
    pts: [
      "데이터센터는 전원 이중화가 필수여서 IT 용량 증가가 곧 발전기 수요",
      "단일 프로젝트 규모가 커 수주 공시가 실적 가시성을 크게 바꿈"
    ],
    ptsEn: [
      "Power redundancy is mandatory, so IT capacity growth maps straight to genset demand",
      "Project sizes are large enough that single order announcements reset visibility"
    ],
    prod: ["디젤 비상발전기", "가스터빈 발전기", "바이오가스 발전"],
    prodEn: ["Diesel standby gensets", "Gas turbine gensets", "Biogas generation"],
    edge: "국내 데이터센터 비상발전기 시장 점유율 1위",
    edgeEn: "Number-one share of Korea's data center standby generator market"
  },
  {
    id: "066570", name: "LG전자", nameEn: "LG Electronics", tk: "066570", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["cooling"], ysym: "066570.KS",
    pos: "칠러 · 데이터센터 공조", posEn: "Chillers and data center HVAC",
    sum: "냉난방공조(HVAC) 사업을 데이터센터 냉각으로 확장하는 국내 최대 공조 사업자.",
    sumEn: "Korea's largest HVAC player, extending its business into data center cooling.",
    pts: [
      "터보 칠러·CDU·액체냉각 솔루션으로 랙 고밀도화 대응",
      "가전 사이클과 분리된 B2B 성장축으로 자리매김하는 과정"
    ],
    ptsEn: [
      "Turbo chillers, CDUs and liquid cooling address rising rack density",
      "Positioned as a B2B growth engine decoupled from the appliance cycle"
    ],
    prod: ["터보 칠러", "CDU", "액체냉각", "항온항습기"],
    prodEn: ["Turbo chillers", "CDU", "Liquid cooling", "Precision AC"],
    edge: "국내 최대 공조 캐파, 글로벌 HVAC 업체와 데이터센터에서 직접 경쟁",
    edgeEn: "Korea's largest HVAC capacity, competing head-on with global players in data centers"
  },
  {
    id: "096770", name: "SK이노베이션", nameEn: "SK Innovation", tk: "096770", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["cooling"], ysym: "096770.KS",
    pos: "액침냉각유(SK엔무브)", posEn: "Immersion cooling fluids (SK Enmove)",
    sum: "자회사 SK엔무브를 통해 데이터센터 액침냉각용 특수 유체를 공급.",
    sumEn: "Supplies specialty immersion cooling fluids for data centers through its SK Enmove unit.",
    pts: [
      "액침냉각은 전력 사용 효율(PUE) 개선 폭이 커 채택 논의가 확대",
      "윤활기유 사업의 고부가 확장으로 정유 사이클 의존도를 낮추는 시도"
    ],
    ptsEn: [
      "Immersion cooling offers large PUE gains, widening adoption discussions",
      "A high-value extension of the base-oil business that dilutes refining cycle dependence"
    ],
    prod: ["액침냉각 유체", "윤활기유", "정유", "배터리"],
    prodEn: ["Immersion cooling fluid", "Base oils", "Refining", "Batteries"],
    edge: "고급 윤활기유 기반 액침냉각 유체 글로벌 선도 그룹",
    edgeEn: "Among the global leaders in immersion cooling fluids built on premium base oils"
  },
  {
    id: "036200", name: "유니셈", nameEn: "Unisem", tk: "036200", mkt: "KOSDAQ",
    region: "KR", tier: "중형", stages: ["cooling"], ysym: "036200.KQ",
    pos: "산업용 칠러", posEn: "Industrial chillers",
    sum: "반도체 공정용 칠러·스크러버 업체로, 데이터센터 냉각 장비로 영역을 넓히는 중.",
    sumEn: "A semiconductor chiller and scrubber maker moving into data center cooling equipment.",
    pts: [
      "정밀 온도제어 칠러 기술을 데이터센터 CDU·수냉 설비에 전용 가능",
      "반도체 투자 사이클과 데이터센터 수요가 이중 성장축"
    ],
    ptsEn: [
      "Precision temperature-control know-how transfers to data center CDUs and liquid loops",
      "Twin drivers: the semiconductor capex cycle and data center demand"
    ],
    prod: ["칠러", "스크러버", "냉각 설비"],
    prodEn: ["Chillers", "Scrubbers", "Cooling systems"],
    edge: "국내 반도체 칠러 상위 공급사",
    edgeEn: "A top domestic supplier of semiconductor chillers"
  },
  {
    id: "083450", name: "GST", nameEn: "Global Standard Technology", tk: "083450", mkt: "KOSDAQ",
    region: "KR", tier: "중형", stages: ["cooling"], ysym: "083450.KQ",
    pos: "칠러 · 스크러버", posEn: "Chillers and scrubbers",
    sum: "국내 유일 수준으로 글로벌 반도체 업체에 칠러·스크러버를 수출하는 장비사.",
    sumEn: "A rare Korean equipment maker exporting chillers and scrubbers to global chipmakers.",
    pts: [
      "친환경 CO2 칠러 등 저전력 냉각 기술이 데이터센터로 확장 가능",
      "해외 고객(대만·미국) 비중이 높아 글로벌 투자 사이클에 연동"
    ],
    ptsEn: [
      "Low-power cooling technology such as CO2 chillers is extendable to data centers",
      "A high overseas customer mix ties results to the global capex cycle"
    ],
    prod: ["칠러", "스크러버", "CO2 칠러"],
    prodEn: ["Chillers", "Scrubbers", "CO2 chillers"],
    edge: "글로벌 파운드리·메모리에 칠러를 수출하는 국내 소수 업체",
    edgeEn: "One of few Korean vendors exporting chillers to global foundry and memory fabs"
  },
  {
    id: "053080", name: "케이엔솔", nameEn: "KNSOL", tk: "053080", mkt: "KOSDAQ",
    region: "KR", tier: "중형", stages: ["cooling", "epc"], ysym: "053080.KQ",
    pos: "데이터센터 냉각 · IT 인프라 구축", posEn: "Data center cooling and IT infrastructure",
    sum: "IT 인프라 구축·운영 사업자로 글로벌 액침냉각 업체와 협력해 국내 시장에 진입.",
    sumEn: "An IT infrastructure builder and operator entering immersion cooling via a global partnership.",
    pts: [
      "설계·구축·운영을 함께 하는 구조로 냉각 설비 매출이 프로젝트에 붙어 들어감",
      "액침냉각은 초기 시장이라 레퍼런스 확보 여부가 관건"
    ],
    ptsEn: [
      "Design, build and operate scope lets cooling hardware ride along with projects",
      "Immersion cooling is early-stage, so reference wins are the gating factor"
    ],
    prod: ["액침냉각", "IT 인프라 구축", "데이터센터 운영"],
    prodEn: ["Immersion cooling", "IT infrastructure", "Data center operations"],
    edge: "글로벌 액침냉각 업체와 국내 파트너십 확보",
    edgeEn: "Holds a domestic partnership with a global immersion cooling vendor"
  },
  {
    id: "028260", name: "삼성물산", nameEn: "Samsung C&T", tk: "028260", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["epc"], ysym: "028260.KS",
    pos: "데이터센터 시공 · 개발", posEn: "Data center construction and development",
    sum: "반도체 팹 시공 경험을 데이터센터로 확장하는 국내 최대 건설·상사 그룹.",
    sumEn: "Korea's largest construction and trading group, extending fab construction know-how to data centers.",
    pts: [
      "초순수·전기·클린룸 등 팹 시공 역량이 데이터센터 설비 공사와 직결",
      "그룹 물량과 해외 개발 프로젝트를 함께 수취"
    ],
    ptsEn: [
      "Fab-grade utilities, electrical and cleanroom capability maps onto data center works",
      "Captures both in-group volume and overseas development projects"
    ],
    prod: ["건축·플랜트 시공", "데이터센터", "상사", "에너지"],
    prodEn: ["Building and plant EPC", "Data centers", "Trading", "Energy"],
    edge: "국내 최상위 시공 능력, 첨단 설비 공사 레퍼런스 보유",
    edgeEn: "Top-tier Korean contractor with advanced facility references"
  },
  {
    id: "000720", name: "현대건설", nameEn: "Hyundai E&C", tk: "000720", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["epc"], ysym: "000720.KS",
    pos: "데이터센터 · 발전 시공", posEn: "Data center and power plant construction",
    sum: "원전·발전 시공 역량을 데이터센터 전력 인프라 공사로 연결하는 대형 건설사.",
    sumEn: "A major contractor linking nuclear and power plant capability into data center power infrastructure.",
    pts: [
      "발전·송전 시공과 데이터센터 수전 설비 공사가 같은 인력·장비 풀 사용",
      "SMR·원전 등 전력 공급 측 프로젝트에도 동시 노출"
    ],
    ptsEn: [
      "Power and transmission works share the same crews and equipment as data center intake facilities",
      "Also exposed to supply-side projects such as SMR and nuclear"
    ],
    prod: ["건축", "발전 플랜트", "원전", "인프라"],
    prodEn: ["Building", "Power plants", "Nuclear", "Infrastructure"],
    edge: "원전·발전 시공 국내 최상위 트랙레코드",
    edgeEn: "Korea's leading track record in nuclear and power plant construction"
  },
  {
    id: "028050", name: "삼성E&A", nameEn: "Samsung E&A", tk: "028050", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["epc"], ysym: "028050.KS",
    pos: "플랜트 · 전력 설비 EPC", posEn: "Plant and power facility EPC",
    sum: "화공·산업 플랜트 EPC 역량으로 데이터센터 전력·유틸리티 공사에 참여.",
    sumEn: "Brings chemical and industrial plant EPC capability to data center power and utility works.",
    pts: [
      "유틸리티·전력 설비 설계 역량이 대형 데이터센터 단지에서 요구되는 사양",
      "그룹 반도체 투자와 해외 플랜트 수주가 실적의 두 축"
    ],
    ptsEn: [
      "Utility and power design capability matches what large campuses require",
      "Earnings rest on in-group semiconductor capex and overseas plant awards"
    ],
    prod: ["화공 플랜트", "산업 플랜트", "유틸리티", "친환경"],
    prodEn: ["Chemical plants", "Industrial plants", "Utilities", "Green solutions"],
    edge: "국내 플랜트 EPC 최상위, 그룹 첨단 시설 공사 담당",
    edgeEn: "A top Korean plant EPC contractor handling the group's advanced facilities"
  },
  {
    id: "006360", name: "GS건설", nameEn: "GS E&C", tk: "006360", mkt: "KOSPI",
    region: "KR", tier: "중형", stages: ["epc"], ysym: "006360.KS",
    pos: "데이터센터 시공", posEn: "Data center construction",
    sum: "건축·플랜트 시공사로 국내 데이터센터 건설 수주에 참여하는 대형 건설사.",
    sumEn: "A large contractor participating in domestic data center construction awards.",
    pts: [
      "주택 경기 의존도를 낮추는 비주택 수주로 데이터센터가 활용",
      "전기·기계 설비 협력사 네트워크가 공기 단축의 관건"
    ],
    ptsEn: [
      "Data centers serve as non-residential backlog that dilutes housing dependence",
      "Electrical and mechanical subcontractor networks decide schedule compression"
    ],
    prod: ["건축", "플랜트", "인프라", "신사업"],
    prodEn: ["Building", "Plant", "Infrastructure", "New businesses"],
    edge: "국내 상위 시공 능력 순위 보유",
    edgeEn: "Ranks among Korea's top contractors by capability"
  },
  {
    id: "035420", name: "NAVER", nameEn: "NAVER", tk: "035420", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["ops"], ysym: "035420.KS",
    pos: "자체 데이터센터 · 클라우드", posEn: "Own data centers and cloud",
    sum: "국내 최대 자체 데이터센터를 운영하며 AI·클라우드 수요를 직접 만드는 사업자.",
    sumEn: "Operates Korea's largest self-built data centers and generates AI and cloud demand directly.",
    pts: [
      "자체 데이터센터 운영으로 GPU·전력·냉각 발주의 국내 최대 수요처 중 하나",
      "소버린 AI·공공 클라우드 수요가 설비 투자 규모를 좌우"
    ],
    ptsEn: [
      "Self-operated facilities make it one of Korea's largest buyers of GPUs, power and cooling",
      "Sovereign AI and public cloud demand set the capex scale"
    ],
    prod: ["데이터센터(각)", "네이버클라우드", "AI 모델", "검색·커머스"],
    prodEn: ["GAK data centers", "NAVER Cloud", "AI models", "Search and commerce"],
    edge: "국내 인터넷 1위, 자체 초대형 데이터센터 보유",
    edgeEn: "Korea's leading internet platform with its own hyperscale data centers"
  },
  {
    id: "017670", name: "SK텔레콤", nameEn: "SK Telecom", tk: "017670", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["ops"], ysym: "017670.KS",
    pos: "AI 데이터센터 · IDC", posEn: "AI data centers and IDC",
    sum: "SK브로드밴드 IDC와 AI 데이터센터 사업을 함께 추진하는 통신 대형주.",
    sumEn: "A large-cap telco running SK Broadband IDC alongside a dedicated AI data center push.",
    pts: [
      "GPU 임대(GPUaaS)·AI 데이터센터로 IDC를 고부가 사업으로 전환하는 시도",
      "그룹 차원의 대규모 AI 데이터센터 프로젝트 노출"
    ],
    ptsEn: [
      "Moving IDC up the value chain via GPU-as-a-service and AI data centers",
      "Exposed to group-level large-scale AI data center projects"
    ],
    prod: ["IDC", "AI 데이터센터", "GPUaaS", "이동통신"],
    prodEn: ["IDC", "AI data centers", "GPUaaS", "Mobile"],
    edge: "국내 이동통신 1위, 그룹 AI 데이터센터 전략의 축",
    edgeEn: "Korea's top mobile carrier and the hub of its group's AI data center strategy"
  },
  {
    id: "030200", name: "KT", nameEn: "KT", tk: "030200", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["ops"], ysym: "030200.KS",
    pos: "IDC · 클라우드", posEn: "IDC and cloud",
    sum: "전국 IDC와 kt cloud를 보유해 국내 코로케이션 시장 상위를 점하는 통신사.",
    sumEn: "A telco holding nationwide IDC assets and kt cloud, ranking high in domestic colocation.",
    pts: [
      "통신국사 부지·전력 인프라가 데이터센터 확장의 구조적 이점",
      "글로벌 빅테크와의 AI 협력이 클라우드 수요의 변수"
    ],
    ptsEn: [
      "Legacy exchange sites and power infrastructure give a structural expansion advantage",
      "AI partnerships with global big tech shape cloud demand"
    ],
    prod: ["IDC", "kt cloud", "통신", "AI 서비스"],
    prodEn: ["IDC", "kt cloud", "Telecom", "AI services"],
    edge: "국내 코로케이션 캐파 상위, 전국 통신 인프라 보유",
    edgeEn: "Top-ranked domestic colocation capacity with nationwide network assets"
  },
  {
    id: "032640", name: "LG유플러스", nameEn: "LG Uplus", tk: "032640", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["ops"], ysym: "032640.KS",
    pos: "IDC 코로케이션", posEn: "IDC colocation",
    sum: "수도권 대형 IDC를 증설하며 코로케이션 매출을 키우는 통신사.",
    sumEn: "A telco growing colocation revenue by adding large capital-region IDC capacity.",
    pts: [
      "IDC는 통신 대비 이익률이 높고 계약 기간이 길어 실적 안정성에 기여",
      "수도권 전력 확보 여부가 증설 속도의 제약"
    ],
    ptsEn: [
      "IDC carries higher margins and longer contracts than telecom, aiding earnings stability",
      "Securing capital-region power constrains the pace of expansion"
    ],
    prod: ["IDC", "기업 회선", "통신", "AI 솔루션"],
    prodEn: ["IDC", "Enterprise lines", "Telecom", "AI solutions"],
    edge: "수도권 하이퍼스케일 IDC 보유",
    edgeEn: "Owns hyperscale IDC capacity in the capital region"
  },
  {
    id: "018260", name: "삼성SDS", nameEn: "Samsung SDS", tk: "018260", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["ops"], ysym: "018260.KS",
    pos: "클라우드 · 자체 데이터센터", posEn: "Cloud and own data centers",
    sum: "자체 데이터센터 기반 클라우드(SCP)와 IT 서비스를 제공하는 그룹 IT 계열사.",
    sumEn: "The group IT arm providing cloud (SCP) and IT services from its own data centers.",
    pts: [
      "그룹 물량 기반의 안정적 클라우드 수요와 GPU 인프라 투자 병행",
      "생성형 AI 도입 프로젝트가 IT 서비스 단가를 끌어올리는 구조"
    ],
    ptsEn: [
      "Stable in-group cloud demand alongside GPU infrastructure investment",
      "Generative AI adoption projects lift IT services pricing"
    ],
    prod: ["클라우드(SCP)", "데이터센터", "IT 서비스", "물류 플랫폼"],
    prodEn: ["Cloud (SCP)", "Data centers", "IT services", "Logistics platform"],
    edge: "국내 IT 서비스 1위, 자체 데이터센터·클라우드 동시 보유",
    edgeEn: "Korea's top IT services firm with both data centers and its own cloud"
  },
  {
    id: "064400", name: "LG씨엔에스", nameEn: "LG CNS", tk: "064400", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["ops", "epc"], ysym: "064400.KS",
    pos: "클라우드 전환 · DC 구축 운영", posEn: "Cloud transformation, DC build and operate",
    sum: "클라우드·AI 전환 사업과 데이터센터 설계·구축·운영을 함께 수행하는 IT 서비스 대형주.",
    sumEn: "A large-cap IT services firm doing cloud/AI transformation plus data center design, build and operate.",
    pts: [
      "데이터센터 구축(설계·시공 관리)과 운영을 묶어 수주하는 사업 구조",
      "그룹 및 공공·금융 클라우드 전환 프로젝트가 매출 축"
    ],
    ptsEn: [
      "Wins work bundling data center build management with ongoing operations",
      "In-group plus public and financial cloud migrations drive revenue"
    ],
    prod: ["클라우드 전환", "데이터센터 구축·운영", "AI 플랫폼", "스마트 엔지니어링"],
    prodEn: ["Cloud migration", "DC build and operate", "AI platforms", "Smart engineering"],
    edge: "국내 IT 서비스 상위, 데이터센터 구축·운영 레퍼런스 다수",
    edgeEn: "A leading Korean IT services firm with many data center build and operate references"
  },
  {
    id: "093320", name: "케이아이엔엑스", nameEn: "KINX", tk: "093320", mkt: "KOSDAQ",
    region: "KR", tier: "중형", stages: ["ops"], ysym: "093320.KQ",
    pos: "IX · 코로케이션", posEn: "Internet exchange and colocation",
    sum: "국내 유일 중립 인터넷 익스체인지(IX) 사업자로 코로케이션·클라우드 연결을 제공.",
    sumEn: "Korea's only neutral internet exchange operator, offering colocation and cloud connectivity.",
    pts: [
      "트래픽 증가가 곧 IX·회선 매출 — 통신사 대비 중립성이 경쟁력",
      "자체 데이터센터 증설로 코로케이션 매출 비중 확대"
    ],
    ptsEn: [
      "Traffic growth converts into IX and transit revenue, with neutrality as its edge over carriers",
      "New self-built capacity is lifting the colocation revenue mix"
    ],
    prod: ["IX", "코로케이션", "CDN", "클라우드 연결"],
    prodEn: ["IX", "Colocation", "CDN", "Cloud connect"],
    edge: "국내 유일 중립 IX 사업자",
    edgeEn: "The only neutral IX operator in Korea"
  },
  {
    id: "000880", name: "한화", nameEn: "Hanwha Corp.", tk: "000880", mkt: "KOSPI",
    region: "KR", tier: "대형", stages: ["power", "board"], ysym: "000880.KS",
    pos: "터보 기기 · 반도체 장비(자회사)", posEn: "Turbomachinery and semiconductor tools (subsidiaries)",
    sum: "한화파워시스템의 압축기·터보 설비와 한화세미텍의 HBM 본더를 보유한 지주 성격 사업회사.",
    sumEn: "A holding-style operating company with Hanwha Power Systems turbomachinery and Hanwha Semitech HBM bonders.",
    pts: [
      "발전·공정용 압축기와 데이터센터 유틸리티 설비 수요에 노출",
      "자회사 HBM 본더 사업이 메모리 장비 시장의 신규 진입자"
    ],
    ptsEn: [
      "Exposure to compressors for power and process use, plus data center utility equipment",
      "Its subsidiary's HBM bonder business is a new entrant in memory tooling"
    ],
    prod: ["터보 압축기", "HBM 본더", "방산", "화학"],
    prodEn: ["Turbo compressors", "HBM bonders", "Defense", "Chemicals"],
    edge: "그룹 차원의 발전·기계·반도체 장비 포트폴리오",
    edgeEn: "Group-level portfolio spanning power, machinery and semiconductor tools"
  }
];
