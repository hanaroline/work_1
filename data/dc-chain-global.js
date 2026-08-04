/*
 * 데이터센터 밸류체인 — 해외(글로벌) 종목
 * ---------------------------------------
 * 스키마는 data/dc-chain.js 상단 주석 참조.
 * 선정 기준: 각 단계에서 글로벌 점유율·수주잔고·고객 기반을 확보한 대형주 중심.
 * 티커는 Yahoo Finance 심볼 기준(예: 2330.TW, 6501.T, ABBN.SW).
 */

window.DC_GLOBAL = [
  {
    id: "NVDA", name: "엔비디아", nameEn: "NVIDIA", tk: "NVDA", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["chip", "server", "network"], ysym: "NVDA",
    pos: "AI 가속기 · 랙 스케일 시스템", posEn: "AI accelerators and rack-scale systems",
    sum: "AI 가속기와 이를 묶은 랙 시스템·네트워킹까지 제공하는 밸류체인의 기준점.",
    sumEn: "The reference point of the chain, supplying accelerators plus the rack systems and networking around them.",
    pts: [
      "GPU 단품이 아닌 랙 단위 플랫폼 판매로 전력·냉각·네트워크 사양까지 규정",
      "이 회사의 출하 계획이 하위 밸류체인 전체의 수요 기준선"
    ],
    ptsEn: [
      "Sells rack-level platforms rather than standalone GPUs, dictating power, cooling and network specs",
      "Its shipment plan is the demand baseline for the entire downstream chain"
    ],
    prod: ["AI GPU", "랙 스케일 시스템", "이더넷·인피니밴드", "CUDA"],
    prodEn: ["AI GPUs", "Rack-scale systems", "Ethernet and InfiniBand", "CUDA"],
    edge: "AI 가속기 점유율 압도적 1위, 소프트웨어 생태계 장벽 보유",
    edgeEn: "Dominant accelerator share reinforced by a software ecosystem moat"
  },
  {
    id: "AVGO", name: "브로드컴", nameEn: "Broadcom", tk: "AVGO", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["chip", "network"], ysym: "AVGO",
    pos: "커스텀 ASIC · 이더넷 스위치칩", posEn: "Custom ASICs and Ethernet switch silicon",
    sum: "하이퍼스케일러 맞춤형 AI 칩(ASIC)과 데이터센터 스위치 칩의 최대 공급사.",
    sumEn: "The largest supplier of hyperscaler custom AI ASICs and data center switch silicon.",
    pts: [
      "빅테크 자체 칩 전략의 설계 파트너 — GPU 대안 수요를 흡수",
      "스위치칩(Tomahawk 계열)으로 네트워크 단계도 동시 장악"
    ],
    ptsEn: [
      "Design partner for big tech's in-house silicon, absorbing demand for GPU alternatives",
      "Also dominates networking through its Tomahawk-class switch chips"
    ],
    prod: ["커스텀 AI ASIC", "이더넷 스위치칩", "옵티컬 DSP", "인프라 SW"],
    prodEn: ["Custom AI ASICs", "Ethernet switch silicon", "Optical DSP", "Infrastructure software"],
    edge: "커스텀 AI 칩·데이터센터 스위치칩 양쪽에서 1위",
    edgeEn: "Number one in both custom AI silicon and data center switch chips"
  },
  {
    id: "AMD", name: "AMD", nameEn: "AMD", tk: "AMD", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["chip"], ysym: "AMD",
    pos: "AI 가속기 · 서버 CPU", posEn: "AI accelerators and server CPUs",
    sum: "서버 CPU 점유율을 늘리며 AI 가속기(MI 시리즈)로 2위 공급자 자리를 노리는 사업자.",
    sumEn: "Gaining server CPU share while positioning its MI-series accelerators as the number-two option.",
    pts: [
      "하이퍼스케일러의 공급망 이원화 수요가 구조적 기회",
      "서버 CPU는 AI 서버에도 반드시 탑재되어 물량이 함께 증가"
    ],
    ptsEn: [
      "Hyperscalers' desire for a second source is the structural opportunity",
      "Server CPUs ship inside AI servers too, so volumes rise together"
    ],
    prod: ["AI 가속기(MI)", "서버 CPU(EPYC)", "DPU", "FPGA"],
    prodEn: ["MI accelerators", "EPYC server CPUs", "DPUs", "FPGAs"],
    edge: "x86 서버 CPU 점유율 지속 확대, 가속기 2위 진입 시도",
    edgeEn: "Steadily gaining x86 server CPU share while pushing for the number-two accelerator slot"
  },
  {
    id: "TSM", name: "TSMC", nameEn: "TSMC", tk: "TSM", mkt: "NYSE(ADR)",
    region: "TW", tier: "대형", stages: ["chip", "board"], ysym: "TSM",
    pos: "선단 파운드리 · 첨단 패키징", posEn: "Leading-edge foundry and advanced packaging",
    sum: "AI 가속기 대부분을 위탁생산하고 첨단 패키징(CoWoS)까지 담당하는 사실상 단일 관문.",
    sumEn: "The effective single gateway fabricating most AI accelerators and providing advanced CoWoS packaging.",
    pts: [
      "선단 공정과 CoWoS 캐파가 업계 전체 가속기 출하량의 물리적 상한",
      "가격 결정력이 높아 AI 사이클에서 마진이 함께 개선"
    ],
    ptsEn: [
      "Leading-edge and CoWoS capacity is the physical ceiling on industry accelerator output",
      "Strong pricing power means margins expand with the AI cycle"
    ],
    prod: ["3/5nm 파운드리", "CoWoS", "SoIC", "특수 공정"],
    prodEn: ["3/5nm foundry", "CoWoS", "SoIC", "Specialty nodes"],
    edge: "선단 파운드리 점유율 압도적 1위, 첨단 패키징 캐파 최대",
    edgeEn: "Overwhelming leading-edge foundry share and the largest advanced packaging capacity"
  },
  {
    id: "MRVL", name: "마벨", nameEn: "Marvell", tk: "MRVL", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["chip", "network"], ysym: "MRVL",
    pos: "커스텀 실리콘 · 광 DSP", posEn: "Custom silicon and optical DSP",
    sum: "커스텀 AI 칩과 광통신용 DSP·리타이머를 공급하는 데이터센터 반도체 업체.",
    sumEn: "A data center semiconductor firm supplying custom AI silicon plus optical DSPs and retimers.",
    pts: [
      "800G/1.6T 광모듈 전환에서 DSP 수요가 함께 증가",
      "커스텀 칩 수주는 프로젝트 단위로 실적 변동성이 큼"
    ],
    ptsEn: [
      "The 800G/1.6T optics transition pulls DSP demand along with it",
      "Custom silicon wins are project-based, making results lumpy"
    ],
    prod: ["커스텀 AI 실리콘", "광 DSP", "리타이머", "스토리지 컨트롤러"],
    prodEn: ["Custom AI silicon", "Optical DSP", "Retimers", "Storage controllers"],
    edge: "데이터센터 광 DSP 시장 상위권, 커스텀 칩 2위 사업자",
    edgeEn: "A top vendor in data center optical DSP and the number-two custom silicon house"
  },
  {
    id: "MU", name: "마이크론", nameEn: "Micron", tk: "MU", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["memory"], ysym: "MU",
    pos: "HBM · 서버 DRAM", posEn: "HBM and server DRAM",
    sum: "HBM·서버 DRAM 3강 구도의 미국 사업자로 국내 메모리 업체의 직접 경쟁자.",
    sumEn: "The US member of the HBM and server DRAM big three and a direct rival to the Korean memory makers.",
    pts: [
      "HBM 캐파 선판매 구조로 가격 하락 리스크가 상대적으로 제한",
      "미국 내 생산 확대는 정책 지원과 고객 조달 다변화 수요에 부합"
    ],
    ptsEn: [
      "Pre-sold HBM capacity limits downside price risk relative to commodity DRAM",
      "US capacity expansion aligns with policy support and customer sourcing diversification"
    ],
    prod: ["HBM", "서버 DRAM", "데이터센터 SSD", "고용량 모듈"],
    prodEn: ["HBM", "Server DRAM", "Data center SSD", "High-capacity modules"],
    edge: "HBM·서버 D램 글로벌 3강, 미국 내 생산 기반 보유",
    edgeEn: "One of three global HBM and server DRAM suppliers, with US manufacturing"
  },
  {
    id: "STX", name: "시게이트", nameEn: "Seagate", tk: "STX", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["memory"], ysym: "STX",
    pos: "니어라인 HDD", posEn: "Nearline HDD",
    sum: "AI 학습 데이터를 보관하는 대용량 니어라인 HDD의 양대 공급사 중 하나.",
    sumEn: "One of two suppliers of the high-capacity nearline HDDs that store AI training data.",
    pts: [
      "AI는 학습·추론 데이터 축적을 요구해 저비용 대용량 저장 수요가 재부각",
      "HDD 공급이 사실상 2개 회사로 제한돼 가격 협상력이 높아진 국면"
    ],
    ptsEn: [
      "AI accumulates training and inference data, reviving demand for low-cost bulk storage",
      "Supply concentrated in two vendors has strengthened pricing power"
    ],
    prod: ["니어라인 HDD", "HAMR 드라이브", "스토리지 시스템"],
    prodEn: ["Nearline HDD", "HAMR drives", "Storage systems"],
    edge: "니어라인 HDD 사실상 2개 사업자 구도의 한 축",
    edgeEn: "Half of the effective duopoly in nearline HDD"
  },
  {
    id: "4062.T", name: "이비덴", nameEn: "Ibiden", tk: "4062.T", mkt: "TSE",
    region: "JP", tier: "대형", stages: ["board"], ysym: "4062.T",
    pos: "고사양 FC-BGA 기판", posEn: "High-end FC-BGA substrates",
    sum: "AI 가속기·서버 CPU용 최상위 FC-BGA 기판의 대표 공급사.",
    sumEn: "The benchmark supplier of top-end FC-BGA substrates for AI accelerators and server CPUs.",
    pts: [
      "가속기 면적 확대로 대형 기판 캐파가 병목 — 증설분이 곧 수주",
      "선단 고객사 인증 기간이 길어 진입장벽이 높음"
    ],
    ptsEn: [
      "Larger accelerator die area makes big-body substrate capacity a bottleneck, so additions are pre-sold",
      "Long qualification cycles at leading customers keep barriers high"
    ],
    prod: ["FC-BGA", "빌드업 기판", "세라믹 부품"],
    prodEn: ["FC-BGA", "Build-up substrates", "Ceramic components"],
    edge: "고사양 FC-BGA 기판 글로벌 1위권",
    edgeEn: "Global number one in high-end FC-BGA substrates"
  },
  {
    id: "APH", name: "앰피놀", nameEn: "Amphenol", tk: "APH", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["board", "network"], ysym: "APH",
    pos: "고속 커넥터 · 케이블 어셈블리", posEn: "High-speed connectors and cable assemblies",
    sum: "AI 랙 내부 고속 신호를 연결하는 커넥터·구리 케이블의 글로벌 최대 공급사.",
    sumEn: "The largest global supplier of the connectors and copper cabling that carry high-speed signals inside AI racks.",
    pts: [
      "랙 내부 연결이 구리 케이블 어셈블리로 늘어나며 단가·물량 동시 상승",
      "전원 커넥터·백플레인까지 포함해 랙당 채택 금액이 커지는 구조"
    ],
    ptsEn: [
      "More in-rack copper cable assemblies lift both price and volume",
      "Power connectors and backplanes push content per rack higher"
    ],
    prod: ["고속 커넥터", "DAC 케이블", "백플레인", "전원 커넥터"],
    prodEn: ["High-speed connectors", "DAC cables", "Backplanes", "Power connectors"],
    edge: "커넥터 시장 글로벌 1위, AI 랙 내 채택 금액 최상위",
    edgeEn: "Global connector leader with the highest content share inside AI racks"
  },
  {
    id: "DELL", name: "델 테크놀로지스", nameEn: "Dell Technologies", tk: "DELL", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["server"], ysym: "DELL",
    pos: "AI 서버 OEM", posEn: "AI server OEM",
    sum: "하이퍼스케일러와 기업 고객 모두에 AI 서버를 공급하는 최대 OEM.",
    sumEn: "The largest OEM shipping AI servers to both hyperscalers and enterprises.",
    pts: [
      "AI 서버는 매출은 크지만 마진이 낮아 믹스와 서비스 부착률이 관건",
      "기업용 AI 도입 확산 시 고마진 스토리지·서비스가 함께 증가"
    ],
    ptsEn: [
      "AI servers add revenue at thin margins, so mix and services attach rate matter",
      "Broader enterprise AI adoption pulls higher-margin storage and services along"
    ],
    prod: ["AI 서버", "스토리지", "서버 서비스", "PC"],
    prodEn: ["AI servers", "Storage", "Server services", "PCs"],
    edge: "서버 OEM 글로벌 1위권, 대형 AI 클러스터 수주 이력",
    edgeEn: "A top-ranked global server OEM with large AI cluster wins"
  },
  {
    id: "SMCI", name: "슈퍼마이크로", nameEn: "Super Micro Computer", tk: "SMCI", mkt: "NASDAQ",
    region: "US", tier: "중형", stages: ["server", "cooling"], ysym: "SMCI",
    pos: "AI 서버 · 수냉 랙", posEn: "AI servers and liquid-cooled racks",
    sum: "신규 가속기 플랫폼을 빠르게 제품화하고 수냉 랙을 함께 공급하는 서버 업체.",
    sumEn: "A server vendor that productizes new accelerator platforms fast and ships liquid-cooled racks with them.",
    pts: [
      "직수냉(DLC) 랙 비중 확대가 차별화 포인트",
      "부품 수급과 선주문 조달이 실적 변동성의 주요 원인"
    ],
    ptsEn: [
      "A rising share of direct liquid cooling racks is the differentiator",
      "Component sourcing and pre-buys drive earnings volatility"
    ],
    prod: ["AI 서버", "DLC 수냉 랙", "스토리지 서버"],
    prodEn: ["AI servers", "DLC liquid-cooled racks", "Storage servers"],
    edge: "신규 플랫폼 출시 속도와 수냉 랙 공급 역량",
    edgeEn: "Speed to market on new platforms plus liquid-cooled rack capability"
  },
  {
    id: "2317.TW", name: "훙하이(폭스콘)", nameEn: "Hon Hai (Foxconn)", tk: "2317.TW", mkt: "TWSE",
    region: "TW", tier: "대형", stages: ["server"], ysym: "2317.TW",
    pos: "AI 서버 ODM 1위", posEn: "Top AI server ODM",
    sum: "AI 서버·랙 조립 물량의 최대 축을 담당하는 세계 최대 전자 수탁생산 업체.",
    sumEn: "The world's largest contract manufacturer and the biggest single builder of AI server racks.",
    pts: [
      "랙 단위 완제품(L10~L11) 조립으로 대당 매출이 크게 상승",
      "멕시코·미국 등 현지 생산 확장으로 고객 인접 공급 대응"
    ],
    ptsEn: [
      "Building complete racks at L10 to L11 sharply raises revenue per unit",
      "Local capacity in Mexico and the US supports customer-adjacent supply"
    ],
    prod: ["AI 서버 랙", "서버 보드", "전자 수탁생산"],
    prodEn: ["AI server racks", "Server boards", "Contract manufacturing"],
    edge: "AI 서버 랙 조립 점유율 세계 1위",
    edgeEn: "World's largest share of AI server rack assembly"
  },
  {
    id: "2382.TW", name: "콴타컴퓨터", nameEn: "Quanta Computer", tk: "2382.TW", mkt: "TWSE",
    region: "TW", tier: "대형", stages: ["server"], ysym: "2382.TW",
    pos: "AI 서버 ODM", posEn: "AI server ODM",
    sum: "북미 하이퍼스케일러를 주요 고객으로 하는 대만 AI 서버 ODM 상위 사업자.",
    sumEn: "A leading Taiwanese AI server ODM serving North American hyperscalers.",
    pts: [
      "고객사 클라우드 capex와 출하 스케줄에 실적이 직접 연동",
      "수냉 랙 전환 대응 여부가 점유율 변동 요인"
    ],
    ptsEn: [
      "Results track customer cloud capex and shipment schedules directly",
      "Readiness for liquid-cooled racks decides share shifts"
    ],
    prod: ["AI 서버", "서버 랙", "노트북 ODM"],
    prodEn: ["AI servers", "Server racks", "Notebook ODM"],
    edge: "하이퍼스케일러 서버 ODM 상위권 점유율",
    edgeEn: "Top-tier share in hyperscaler server ODM"
  },
  {
    id: "6669.TW", name: "위윈(Wiwynn)", nameEn: "Wiwynn", tk: "6669.TW", mkt: "TWSE",
    region: "TW", tier: "대형", stages: ["server"], ysym: "6669.TW",
    pos: "하이퍼스케일 전용 ODM", posEn: "Hyperscale-dedicated ODM",
    sum: "클라우드 사업자 맞춤 서버·랙만 만드는 하이퍼스케일 전용 ODM.",
    sumEn: "An ODM building only custom servers and racks for cloud operators.",
    pts: [
      "소수 대형 고객 집중 구조로 수주 가시성은 높고 고객 리스크는 큼",
      "커스텀 설계·수냉 대응 역량이 진입장벽"
    ],
    ptsEn: [
      "Concentration in a few large customers gives visibility but raises customer risk",
      "Custom design and liquid cooling capability form the barrier to entry"
    ],
    prod: ["커스텀 서버", "랙 통합", "수냉 시스템"],
    prodEn: ["Custom servers", "Rack integration", "Liquid cooling systems"],
    edge: "하이퍼스케일 커스텀 서버 전문 상위 ODM",
    edgeEn: "A leading ODM specialized in hyperscale custom servers"
  },
  {
    id: "2308.TW", name: "델타일렉트로닉스", nameEn: "Delta Electronics", tk: "2308.TW", mkt: "TWSE",
    region: "TW", tier: "대형", stages: ["server", "power", "cooling"], ysym: "2308.TW",
    pos: "서버 전원 · 냉각 · 인프라", posEn: "Server power, cooling and infrastructure",
    sum: "AI 서버 전원장치(PSU)부터 랙 전력 분배·냉각까지 공급하는 전력전자 업체.",
    sumEn: "A power electronics maker spanning AI server PSUs, rack power distribution and cooling.",
    pts: [
      "랙 전력이 커질수록 고효율 PSU·전력 분배 단가가 함께 상승",
      "냉각(CDU·팬)까지 묶어 랙 인프라 통합 공급이 가능"
    ],
    ptsEn: [
      "Higher rack power lifts pricing for high-efficiency PSUs and power distribution",
      "Bundling cooling such as CDUs and fans enables integrated rack infrastructure supply"
    ],
    prod: ["서버 PSU", "전력 분배", "CDU·팬", "UPS"],
    prodEn: ["Server PSUs", "Power distribution", "CDUs and fans", "UPS"],
    edge: "서버 전원장치 글로벌 1위권, 랙 인프라 통합 역량",
    edgeEn: "Global leader in server PSUs with integrated rack infrastructure capability"
  },
  {
    id: "ANET", name: "아리스타 네트웍스", nameEn: "Arista Networks", tk: "ANET", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["network"], ysym: "ANET",
    pos: "데이터센터 이더넷 스위치", posEn: "Data center Ethernet switching",
    sum: "하이퍼스케일러 AI 클러스터의 이더넷 스위치를 공급하는 대표 네트워크 업체.",
    sumEn: "The flagship networking vendor supplying Ethernet switches for hyperscaler AI clusters.",
    pts: [
      "AI 클러스터 백엔드 네트워크가 이더넷으로 이동하며 수요 확대",
      "소수 대형 고객 비중이 높아 발주 스케줄에 실적이 민감"
    ],
    ptsEn: [
      "AI cluster back-end networks shifting to Ethernet expands the addressable demand",
      "High concentration in a few large customers makes results order-schedule sensitive"
    ],
    prod: ["800G 스위치", "네트워크 OS", "클러스터 관리"],
    prodEn: ["800G switches", "Network OS", "Cluster management"],
    edge: "데이터센터 고속 이더넷 스위치 점유율 1위권",
    edgeEn: "Top share in high-speed data center Ethernet switching"
  },
  {
    id: "CSCO", name: "시스코", nameEn: "Cisco", tk: "CSCO", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["network"], ysym: "CSCO",
    pos: "네트워크 · 보안 · 광", posEn: "Networking, security and optics",
    sum: "AI 데이터센터용 스위치·광 모듈·보안을 함께 공급하는 종합 네트워크 업체.",
    sumEn: "A full-stack networking vendor bundling AI data center switches, optics and security.",
    pts: [
      "기업·통신사 네트워크 기반 위에 AI 인프라 수주를 추가하는 구조",
      "광 모듈·실리콘 내재화로 스위치 원가 경쟁력 확보"
    ],
    ptsEn: [
      "Adds AI infrastructure orders on top of an installed enterprise and carrier base",
      "In-house optics and silicon underpin switch cost competitiveness"
    ],
    prod: ["데이터센터 스위치", "라우터", "광 모듈", "보안"],
    prodEn: ["Data center switches", "Routers", "Optics", "Security"],
    edge: "네트워크 장비 최대 설치 기반과 종합 포트폴리오",
    edgeEn: "The largest installed base in networking with a full portfolio"
  },
  {
    id: "COHR", name: "코히런트", nameEn: "Coherent", tk: "COHR", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["network"], ysym: "COHR",
    pos: "광 트랜시버 · 광부품", posEn: "Optical transceivers and photonics",
    sum: "데이터센터용 800G급 광 트랜시버와 광원(레이저)을 함께 공급하는 광부품 업체.",
    sumEn: "A photonics supplier providing both 800G-class data center transceivers and the lasers inside them.",
    pts: [
      "광모듈 수요는 클러스터 규모에 비선형으로 증가",
      "레이저 칩 내재화로 공급 병목 국면에서 유리"
    ],
    ptsEn: [
      "Optical module demand grows non-linearly with cluster size",
      "In-house laser chips are an advantage when supply is tight"
    ],
    prod: ["800G 트랜시버", "레이저 칩", "광 스위칭", "산업용 레이저"],
    prodEn: ["800G transceivers", "Laser chips", "Optical switching", "Industrial lasers"],
    edge: "데이터센터 광 트랜시버 글로벌 상위권, 수직계열화",
    edgeEn: "A top-tier data center transceiver vendor with vertical integration"
  },
  {
    id: "5803.T", name: "후지쿠라", nameEn: "Fujikura", tk: "5803.T", mkt: "TSE",
    region: "JP", tier: "대형", stages: ["network"], ysym: "5803.T",
    pos: "광섬유 · 초고밀도 케이블", posEn: "Optical fiber and ultra-high-density cable",
    sum: "데이터센터 내·간 배선용 초고밀도 광케이블과 융착접속기의 대표 공급사.",
    sumEn: "A benchmark supplier of ultra-high-density fiber cable and fusion splicers for data center wiring.",
    pts: [
      "케이블 굵기를 줄이는 초고밀도 제품이 데이터센터 배선의 표준으로 채택",
      "융착접속기까지 공급해 시공 단계 부가가치도 수취"
    ],
    ptsEn: [
      "Ultra-high-density cable that reduces bundle diameter is becoming the wiring standard",
      "Also supplies fusion splicers, capturing value at the installation stage"
    ],
    prod: ["초고밀도 광케이블", "광섬유", "융착접속기", "커넥터"],
    prodEn: ["Ultra-high-density cable", "Optical fiber", "Fusion splicers", "Connectors"],
    edge: "데이터센터용 초고밀도 광케이블 글로벌 선두",
    edgeEn: "Global leader in ultra-high-density data center fiber cable"
  },
  {
    id: "ETN", name: "이튼", nameEn: "Eaton", tk: "ETN", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["power"], ysym: "ETN",
    pos: "전력 배분 · UPS · 스위치기어", posEn: "Power distribution, UPS, switchgear",
    sum: "데이터센터 수전부터 랙 배전까지 전력 인프라를 묶어 공급하는 글로벌 전력기기 대표주.",
    sumEn: "The bellwether global power equipment name bundling infrastructure from grid intake to rack distribution.",
    pts: [
      "데이터센터 관련 수주잔고가 실적 가시성의 핵심 지표",
      "북미 전력 인프라 교체 수요와 데이터센터 수요가 중첩"
    ],
    ptsEn: [
      "Data center backlog is the key indicator of earnings visibility",
      "North American grid replacement demand overlaps with data center demand"
    ],
    prod: ["스위치기어", "UPS", "버스웨이", "변압기"],
    prodEn: ["Switchgear", "UPS", "Busway", "Transformers"],
    edge: "데이터센터 전력 인프라 원스톱 공급 역량 1위권",
    edgeEn: "Top-ranked one-stop supplier of data center electrical infrastructure"
  },
  {
    id: "VRT", name: "버티브", nameEn: "Vertiv", tk: "VRT", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["power", "cooling"], ysym: "VRT",
    pos: "데이터센터 전력 + 냉각 전문", posEn: "Data center power and cooling specialist",
    sum: "데이터센터 전력·냉각 설비만 전문으로 하는 순수 플레이 사업자.",
    sumEn: "A pure-play vendor focused solely on data center power and cooling infrastructure.",
    pts: [
      "액체냉각(CDU·매니폴드)과 전력 설비를 함께 공급하는 구조가 강점",
      "수주잔고·수주율(book-to-bill)이 업종 선행지표로 활용"
    ],
    ptsEn: [
      "Its edge is supplying liquid cooling (CDUs, manifolds) together with electrical gear",
      "Backlog and book-to-bill are treated as sector leading indicators"
    ],
    prod: ["CDU·액체냉각", "정밀공조", "UPS", "랙 전력분배"],
    prodEn: ["CDUs and liquid cooling", "Precision cooling", "UPS", "Rack PDU"],
    edge: "데이터센터 전력·열관리 순수 플레이 1위",
    edgeEn: "The leading pure-play in data center power and thermal management"
  },
  {
    id: "SU.PA", name: "슈나이더 일렉트릭", nameEn: "Schneider Electric", tk: "SU.PA", mkt: "Euronext",
    region: "EU", tier: "대형", stages: ["power", "cooling"], ysym: "SU.PA",
    pos: "전력관리 · 데이터센터 설비", posEn: "Energy management and data center systems",
    sum: "전력관리 소프트웨어부터 UPS·냉각까지 데이터센터 설비를 통합 공급하는 유럽 대표주.",
    sumEn: "The European bellwether integrating energy management software with UPS and cooling for data centers.",
    pts: [
      "설비 + 전력관리 SW를 함께 공급해 운영 단계 매출도 확보",
      "AI 데이터센터 표준 설계(레퍼런스 아키텍처) 제공으로 수요 선점"
    ],
    ptsEn: [
      "Bundling hardware with management software secures operating-phase revenue",
      "Publishing AI data center reference designs helps capture demand early"
    ],
    prod: ["UPS", "스위치기어", "액체냉각", "DCIM 소프트웨어"],
    prodEn: ["UPS", "Switchgear", "Liquid cooling", "DCIM software"],
    edge: "데이터센터 전력·설비 글로벌 1위권, 소프트웨어까지 통합",
    edgeEn: "A global leader in data center electrical systems, integrated with software"
  },
  {
    id: "ABBN.SW", name: "ABB", nameEn: "ABB", tk: "ABBN.SW", mkt: "SIX",
    region: "EU", tier: "대형", stages: ["power"], ysym: "ABBN.SW",
    pos: "전기화 · 배전 · 모션", posEn: "Electrification, distribution, motion",
    sum: "배전·전기화 설비의 글로벌 상위 사업자로 데이터센터 전력 부문 수주를 확대.",
    sumEn: "A global top-tier electrification and distribution player expanding data center power orders.",
    pts: [
      "중저압 배전 설비의 표준 공급사로 데이터센터 물량을 폭넓게 수취",
      "전기화(Electrification) 부문 성장률이 데이터센터 노출도의 지표"
    ],
    ptsEn: [
      "As a standard supplier of MV/LV distribution gear it captures broad data center volume",
      "Electrification segment growth is the proxy for data center exposure"
    ],
    prod: ["중저압 배전", "스위치기어", "모터·드라이브", "자동화"],
    prodEn: ["MV/LV distribution", "Switchgear", "Motors and drives", "Automation"],
    edge: "배전·전기화 설비 글로벌 상위 3사",
    edgeEn: "Among the global top three in distribution and electrification equipment"
  },
  {
    id: "ENR.DE", name: "지멘스에너지", nameEn: "Siemens Energy", tk: "ENR.DE", mkt: "XETRA",
    region: "EU", tier: "대형", stages: ["power"], ysym: "ENR.DE",
    pos: "가스터빈 · 계통 설비", posEn: "Gas turbines and grid technology",
    sum: "가스터빈과 송배전 설비를 함께 공급해 데이터센터 전력 병목의 양쪽을 담당.",
    sumEn: "Supplies both gas turbines and grid technology, addressing both sides of the data center power bottleneck.",
    pts: [
      "가스터빈 수주잔고가 수년치로 쌓여 가격 결정력이 개선",
      "계통(Grid Technologies) 부문이 변압기·개폐장치 수요를 수취"
    ],
    ptsEn: [
      "A multi-year gas turbine backlog has improved pricing power",
      "Its Grid Technologies unit captures transformer and switchgear demand"
    ],
    prod: ["대형 가스터빈", "변압기", "HVDC", "그리드 설비"],
    prodEn: ["Heavy-duty gas turbines", "Transformers", "HVDC", "Grid equipment"],
    edge: "가스터빈·계통 설비 동시 보유한 세계 소수 업체",
    edgeEn: "One of few firms holding both gas turbines and grid equipment"
  },
  {
    id: "GEV", name: "GE 버노바", nameEn: "GE Vernova", tk: "GEV", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["power"], ysym: "GEV",
    pos: "가스터빈 · 전력 설비", posEn: "Gas turbines and electrification",
    sum: "가스터빈 세계 최상위 공급사로 데이터센터 전용 발전 수요의 최대 수혜 후보.",
    sumEn: "A top global gas turbine supplier and a prime beneficiary of dedicated data center generation demand.",
    pts: [
      "가스터빈 슬롯이 수년간 매진돼 신규 계약 단가가 상승",
      "전력화(Electrification) 부문에서 변압기·개폐장치도 함께 공급"
    ],
    ptsEn: [
      "Turbine slots sold out for years have lifted new contract pricing",
      "Its Electrification arm also supplies transformers and switchgear"
    ],
    prod: ["가스터빈", "그리드 설비", "풍력", "원자력"],
    prodEn: ["Gas turbines", "Grid equipment", "Wind", "Nuclear"],
    edge: "가스터빈 글로벌 점유율 최상위",
    edgeEn: "Highest-tier global gas turbine share"
  },
  {
    id: "6501.T", name: "히타치", nameEn: "Hitachi", tk: "6501.T", mkt: "TSE",
    region: "JP", tier: "대형", stages: ["power"], ysym: "6501.T",
    pos: "히타치에너지(변압기·HVDC)", posEn: "Hitachi Energy (transformers, HVDC)",
    sum: "자회사 히타치에너지를 통해 변압기·HVDC 등 계통 설비 글로벌 1위권을 점유.",
    sumEn: "Through Hitachi Energy it holds a global top position in transformers and HVDC grid equipment.",
    pts: [
      "변압기 리드타임 장기화로 수주잔고와 가격이 동시에 상승",
      "IT(디지털) 부문과 전력 부문을 함께 보유한 복합 노출"
    ],
    ptsEn: [
      "Extended transformer lead times are lifting both backlog and pricing",
      "Combined exposure through its digital IT and power segments"
    ],
    prod: ["변압기", "HVDC", "스위치기어", "디지털 IT"],
    prodEn: ["Transformers", "HVDC", "Switchgear", "Digital IT"],
    edge: "계통용 변압기·HVDC 글로벌 1위권",
    edgeEn: "Global number one tier in grid transformers and HVDC"
  },
  {
    id: "PRY.MI", name: "프리즈미안", nameEn: "Prysmian", tk: "PRY.MI", mkt: "Borsa Italiana",
    region: "EU", tier: "대형", stages: ["power"], ysym: "PRY.MI",
    pos: "전력 케이블 · 광케이블", posEn: "Power cable and optical cable",
    sum: "전력 케이블 세계 1위 업체로 데이터센터 수전·계통 보강 물량을 수취.",
    sumEn: "The world's largest power cable maker, capturing data center intake and grid reinforcement volume.",
    pts: [
      "전력 케이블과 데이터센터용 광케이블을 동시에 보유",
      "북미 계통 투자 확대가 수주잔고의 주요 동력"
    ],
    ptsEn: [
      "Holds both power cable and data center optical cable lines",
      "Expanding North American grid investment is the main backlog driver"
    ],
    prod: ["초고압 케이블", "해저 케이블", "광케이블", "배전 케이블"],
    prodEn: ["UHV cable", "Submarine cable", "Optical cable", "Distribution cable"],
    edge: "전력 케이블 글로벌 점유율 1위",
    edgeEn: "Number one global share in power cable"
  },
  {
    id: "CEG", name: "컨스텔레이션 에너지", nameEn: "Constellation Energy", tk: "CEG", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["power"], ysym: "CEG",
    pos: "원전 기반 무탄소 전력 공급", posEn: "Carbon-free nuclear power supply",
    sum: "미국 최대 원전 발전 사업자로 하이퍼스케일러와 장기 전력계약을 체결.",
    sumEn: "The largest US nuclear generator, signing long-term power agreements with hyperscalers.",
    pts: [
      "24시간 무탄소 전력이라는 희소 자원 보유 — 데이터센터가 프리미엄 지불",
      "장기 PPA 체결이 발전 단가와 실적 가시성을 동시에 개선"
    ],
    ptsEn: [
      "Owns the scarce resource of around-the-clock carbon-free power, for which data centers pay a premium",
      "Long-term PPAs improve both realized pricing and earnings visibility"
    ],
    prod: ["원자력 발전", "장기 PPA", "소매 전력"],
    prodEn: ["Nuclear generation", "Long-term PPAs", "Retail power"],
    edge: "미국 최대 원전 포트폴리오 보유",
    edgeEn: "Holds the largest US nuclear fleet"
  },
  {
    id: "VST", name: "비스트라", nameEn: "Vistra", tk: "VST", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["power"], ysym: "VST",
    pos: "발전 · 전력 판매", posEn: "Generation and retail power",
    sum: "원전·가스 발전을 보유한 미국 대형 발전 사업자로 데이터센터 전력 수요의 수혜주.",
    sumEn: "A large US generator with nuclear and gas assets, geared to data center power demand.",
    pts: [
      "전력 도매가격 상승이 기존 발전 자산의 수익을 그대로 확대",
      "데이터센터 인접 부지의 직접 공급(behind-the-meter) 논의가 촉매"
    ],
    ptsEn: [
      "Higher wholesale power prices flow straight through to existing assets",
      "Behind-the-meter supply discussions at adjacent sites act as a catalyst"
    ],
    prod: ["원자력", "가스 발전", "소매 전력", "ESS"],
    prodEn: ["Nuclear", "Gas generation", "Retail power", "Storage"],
    edge: "미국 대형 발전 포트폴리오와 소매 채널 동시 보유",
    edgeEn: "Combines a large US generation fleet with retail channels"
  },
  {
    id: "BE", name: "블룸에너지", nameEn: "Bloom Energy", tk: "BE", mkt: "NYSE",
    region: "US", tier: "중형", stages: ["power"], ysym: "BE",
    pos: "연료전지 온사이트 발전", posEn: "On-site fuel cell power",
    sum: "계통 접속을 기다리지 않고 부지에서 전력을 만드는 연료전지 공급사.",
    sumEn: "A fuel cell supplier that generates power on site without waiting for grid interconnection.",
    pts: [
      "계통 대기 기간이 길어질수록 온사이트 발전의 상대 가치가 상승",
      "데이터센터 사업자와의 대형 공급 계약이 실적 변곡점"
    ],
    ptsEn: [
      "The longer interconnection queues get, the more valuable on-site generation becomes",
      "Large supply agreements with data center operators are the earnings inflection"
    ],
    prod: ["고체산화물 연료전지", "온사이트 전력", "전해조"],
    prodEn: ["Solid oxide fuel cells", "On-site power", "Electrolyzers"],
    edge: "데이터센터용 상용 연료전지 공급 실적 보유",
    edgeEn: "Has a commercial track record supplying fuel cells to data centers"
  },
  {
    id: "7011.T", name: "미쓰비시중공업", nameEn: "Mitsubishi Heavy Industries", tk: "7011.T", mkt: "TSE",
    region: "JP", tier: "대형", stages: ["power"], ysym: "7011.T",
    pos: "가스터빈 · 원전", posEn: "Gas turbines and nuclear",
    sum: "대형 가스터빈 세계 3강 중 하나로 데이터센터용 발전 설비 수주를 확대.",
    sumEn: "One of three global heavy gas turbine makers, expanding data center generation orders.",
    pts: [
      "고효율 대형 가스터빈 슬롯이 수년간 확보돼 가격 협상력 상승",
      "원전·에너지 전환 설비까지 포트폴리오 보유"
    ],
    ptsEn: [
      "Multi-year sold-out slots for high-efficiency turbines strengthen pricing power",
      "Portfolio also spans nuclear and energy transition equipment"
    ],
    prod: ["대형 가스터빈", "원자력", "발전 서비스", "방산"],
    prodEn: ["Heavy gas turbines", "Nuclear", "Power services", "Defense"],
    edge: "대형 가스터빈 세계 3강",
    edgeEn: "One of the world's three heavy-duty gas turbine makers"
  },
  {
    id: "JCI", name: "존슨콘트롤즈", nameEn: "Johnson Controls", tk: "JCI", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["cooling"], ysym: "JCI",
    pos: "대형 칠러 · 빌딩 설비", posEn: "Large chillers and building systems",
    sum: "데이터센터 냉각의 기본 설비인 대형 칠러·공조 시스템의 글로벌 상위 공급사.",
    sumEn: "A global top supplier of the large chillers and HVAC systems that anchor data center cooling.",
    pts: [
      "액체냉각으로 전환해도 열을 최종 배출하는 칠러 수요는 유지·증가",
      "데이터센터 전용 제품군과 서비스 계약이 반복 매출 기반"
    ],
    ptsEn: [
      "Even with liquid cooling, chillers that reject the heat remain necessary and growing",
      "Data center product lines plus service contracts build recurring revenue"
    ],
    prod: ["대형 칠러", "공조 시스템", "빌딩 제어", "서비스"],
    prodEn: ["Large chillers", "HVAC systems", "Building controls", "Service"],
    edge: "대형 칠러·빌딩 설비 글로벌 상위권",
    edgeEn: "Global top tier in large chillers and building systems"
  },
  {
    id: "TT", name: "트레인 테크놀로지스", nameEn: "Trane Technologies", tk: "TT", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["cooling"], ysym: "TT",
    pos: "상업용 공조 · 열관리", posEn: "Commercial HVAC and thermal management",
    sum: "상업용 공조 대표 업체로 데이터센터 등 고부가 응용 비중을 늘리는 중.",
    sumEn: "A leading commercial HVAC name growing its mix of high-value applications such as data centers.",
    pts: [
      "데이터센터·산업용 등 상업 부문 수주잔고가 실적 가시성의 축",
      "고효율 설비 교체 수요가 규제 강화와 함께 확대"
    ],
    ptsEn: [
      "Commercial backlog including data centers underpins earnings visibility",
      "High-efficiency replacement demand grows alongside tightening regulation"
    ],
    prod: ["상업용 공조", "칠러", "열관리 솔루션", "서비스"],
    prodEn: ["Commercial HVAC", "Chillers", "Thermal solutions", "Service"],
    edge: "상업용 공조 시장 상위권, 고효율 제품 프리미엄",
    edgeEn: "Top-tier commercial HVAC with a high-efficiency product premium"
  },
  {
    id: "6367.T", name: "다이킨", nameEn: "Daikin Industries", tk: "6367.T", mkt: "TSE",
    region: "JP", tier: "대형", stages: ["cooling"], ysym: "6367.T",
    pos: "공조 세계 1위", posEn: "Global HVAC leader",
    sum: "세계 최대 공조 업체로 데이터센터용 대형 냉각 설비 사업을 확대.",
    sumEn: "The world's largest HVAC maker, expanding into large-scale data center cooling.",
    pts: [
      "글로벌 공조 캐파와 냉매 기술을 함께 보유",
      "데이터센터·산업용 비중 확대가 주택용 사이클 의존도를 낮춤"
    ],
    ptsEn: [
      "Combines global HVAC capacity with proprietary refrigerant technology",
      "A rising data center and industrial mix reduces dependence on the residential cycle"
    ],
    prod: ["칠러", "공조 시스템", "냉매", "히트펌프"],
    prodEn: ["Chillers", "HVAC systems", "Refrigerants", "Heat pumps"],
    edge: "공조 시장 글로벌 점유율 1위",
    edgeEn: "Number one global share in HVAC"
  },
  {
    id: "PWR", name: "콴타 서비시스", nameEn: "Quanta Services", tk: "PWR", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["epc", "power"], ysym: "PWR",
    pos: "전력망 · 전기공사 EPC", posEn: "Grid and electrical infrastructure EPC",
    sum: "북미 최대 전력망·전기공사 시공사로 데이터센터 접속 공사를 직접 수행.",
    sumEn: "North America's largest grid and electrical contractor, executing the interconnection work itself.",
    pts: [
      "숙련 전기공 인력 자체 보유가 공기 단축의 핵심 경쟁력",
      "송전·변전·데이터센터 접속을 묶어 수주하는 구조"
    ],
    ptsEn: [
      "Owning a skilled electrical workforce is the core advantage in schedule compression",
      "Wins bundled scopes across transmission, substations and data center interconnection"
    ],
    prod: ["송배전 시공", "변전소", "전기공사", "재생에너지 EPC"],
    prodEn: ["T&D construction", "Substations", "Electrical works", "Renewables EPC"],
    edge: "북미 전력 인프라 시공 점유율 1위",
    edgeEn: "Number one share in North American power infrastructure construction"
  },
  {
    id: "EME", name: "EMCOR 그룹", nameEn: "EMCOR Group", tk: "EME", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["epc"], ysym: "EME",
    pos: "전기 · 기계 설비 시공", posEn: "Electrical and mechanical construction",
    sum: "데이터센터 전기·기계 설비 시공을 담당하는 미국 대표 설비 시공사.",
    sumEn: "A leading US specialty contractor handling data center electrical and mechanical installation.",
    pts: [
      "데이터센터 부문 수주잔고 증가가 실적 성장의 직접 동력",
      "설비 시공은 인력 확보가 경쟁력이라 진입장벽이 존재"
    ],
    ptsEn: [
      "Growth in data center backlog is the direct earnings driver",
      "Labor availability is the competitive barrier in specialty installation"
    ],
    prod: ["전기 설비 시공", "기계 설비 시공", "시설 서비스"],
    prodEn: ["Electrical construction", "Mechanical construction", "Facilities services"],
    edge: "미국 설비 시공 최대 사업자 중 하나",
    edgeEn: "One of the largest US specialty contractors"
  },
  {
    id: "FIX", name: "컴포트 시스템즈", nameEn: "Comfort Systems USA", tk: "FIX", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["epc", "cooling"], ysym: "FIX",
    pos: "기계 · 공조 설비 시공", posEn: "Mechanical and HVAC construction",
    sum: "데이터센터·산업 시설의 공조·기계 설비를 모듈 방식으로 시공하는 업체.",
    sumEn: "A contractor delivering HVAC and mechanical systems for data centers and industrial plants, including modular builds.",
    pts: [
      "모듈러 사전제작으로 현장 공기를 단축, 대형 프로젝트에서 선호",
      "기술·산업 부문(데이터센터 포함) 수주잔고가 성장의 축"
    ],
    ptsEn: [
      "Modular prefabrication shortens site schedules, a preference on large projects",
      "Technology and industrial backlog including data centers drives growth"
    ],
    prod: ["공조 설비 시공", "모듈러 프리팹", "배관", "유지보수"],
    prodEn: ["HVAC construction", "Modular prefab", "Piping", "Maintenance"],
    edge: "데이터센터 기계 설비 시공에서 높은 수주잔고 성장",
    edgeEn: "Fast backlog growth in data center mechanical construction"
  },
  {
    id: "EQIX", name: "에퀴닉스", nameEn: "Equinix", tk: "EQIX", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["ops"], ysym: "EQIX",
    pos: "글로벌 코로케이션 · 상호접속", posEn: "Global colocation and interconnection",
    sum: "세계 최대 코로케이션 사업자로 상호접속(인터커넥션) 매출이 차별화 포인트.",
    sumEn: "The world's largest colocation operator, differentiated by interconnection revenue.",
    pts: [
      "네트워크·클라우드가 모이는 거점 특성상 고객 이탈률이 낮음",
      "전력 확보량(MW)과 계약 임대율이 성장의 실질 제약"
    ],
    ptsEn: [
      "As the meeting point for networks and clouds, churn stays low",
      "Secured megawatts and contracted lease rates are the real growth constraint"
    ],
    prod: ["코로케이션", "인터커넥션", "xScale 하이퍼스케일"],
    prodEn: ["Colocation", "Interconnection", "xScale hyperscale"],
    edge: "코로케이션·상호접속 글로벌 1위",
    edgeEn: "Global number one in colocation and interconnection"
  },
  {
    id: "DLR", name: "디지털 리얼티", nameEn: "Digital Realty", tk: "DLR", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["ops"], ysym: "DLR",
    pos: "하이퍼스케일 데이터센터 리츠", posEn: "Hyperscale data center REIT",
    sum: "하이퍼스케일러에 대규모 용량을 장기 임대하는 데이터센터 리츠.",
    sumEn: "A data center REIT leasing large blocks of capacity to hyperscalers on long terms.",
    pts: [
      "신규 임대 단가 상승과 재계약 스프레드가 실적의 핵심 지표",
      "전력 확보된 부지(파워드 셸)가 사실상의 희소 자산"
    ],
    ptsEn: [
      "New lease pricing and renewal spreads are the key metrics",
      "Powered land with secured electricity is the genuinely scarce asset"
    ],
    prod: ["하이퍼스케일 임대", "코로케이션", "데이터센터 개발"],
    prodEn: ["Hyperscale leasing", "Colocation", "Development"],
    edge: "글로벌 데이터센터 리츠 상위 2사",
    edgeEn: "One of the two largest global data center REITs"
  },
  {
    id: "IRM", name: "아이언마운틴", nameEn: "Iron Mountain", tk: "IRM", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["ops"], ysym: "IRM",
    pos: "문서보관 + 데이터센터 리츠", posEn: "Records management plus data center REIT",
    sum: "기존 문서보관 사업의 현금흐름으로 데이터센터 용량을 증설하는 리츠.",
    sumEn: "A REIT funding data center expansion with cash flow from its records management business.",
    pts: [
      "안정적 본업 현금흐름이 데이터센터 개발 자금 조달의 강점",
      "데이터센터 부문 임대 계약 잔고가 성장의 선행 지표"
    ],
    ptsEn: [
      "Stable legacy cash flow is an advantage in funding development",
      "Its data center leasing backlog leads the growth trajectory"
    ],
    prod: ["데이터센터 임대", "문서 보관", "자산 처분(ITAD)"],
    prodEn: ["Data center leasing", "Records storage", "ITAD"],
    edge: "본업 현금흐름 기반의 데이터센터 증설 여력",
    edgeEn: "Capacity to fund data center growth from core cash flow"
  },
  {
    id: "CRWV", name: "코어위브", nameEn: "CoreWeave", tk: "CRWV", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["ops"], ysym: "CRWV",
    pos: "GPU 전용 클라우드(네오클라우드)", posEn: "GPU-specialized cloud (neocloud)",
    sum: "GPU 인프라만 임대하는 전문 클라우드 사업자로 AI 수요를 직접 흡수.",
    sumEn: "A specialist cloud renting GPU infrastructure only, absorbing AI demand directly.",
    pts: [
      "장기 계약 기반 GPU 임대로 매출 가시성은 높으나 부채·설비 부담이 큼",
      "GPU 조달 우선순위와 데이터센터 전력 확보가 성장의 관건"
    ],
    ptsEn: [
      "Long-term GPU contracts give revenue visibility but carry heavy debt and capex",
      "Priority access to GPUs and secured power decide the growth ceiling"
    ],
    prod: ["GPU 클라우드", "AI 학습 인프라", "추론 서비스"],
    prodEn: ["GPU cloud", "AI training infrastructure", "Inference services"],
    edge: "GPU 전용 클라우드 최대 사업자",
    edgeEn: "The largest GPU-specialized cloud operator"
  },
  {
    id: "MSFT", name: "마이크로소프트", nameEn: "Microsoft", tk: "MSFT", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["ops"], ysym: "MSFT",
    pos: "하이퍼스케일러(수요)", posEn: "Hyperscaler (demand side)",
    sum: "Azure와 AI 서비스를 위해 데이터센터에 최대 규모로 투자하는 수요의 원천.",
    sumEn: "A primary source of demand, investing at maximum scale in data centers for Azure and AI services.",
    pts: [
      "설비투자(capex) 가이던스가 밸류체인 전체의 수요 전망을 좌우",
      "자체 칩·자체 데이터센터 설계로 공급사 협상력을 확보"
    ],
    ptsEn: [
      "Its capex guidance sets the demand outlook for the entire chain",
      "In-house silicon and data center designs give it leverage over suppliers"
    ],
    prod: ["Azure", "AI 서비스", "자체 데이터센터", "소프트웨어"],
    prodEn: ["Azure", "AI services", "Own data centers", "Software"],
    edge: "클라우드 설비투자 규모 세계 최상위",
    edgeEn: "Among the world's largest cloud capex spenders"
  },
  {
    id: "AMZN", name: "아마존", nameEn: "Amazon", tk: "AMZN", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["ops", "chip"], ysym: "AMZN",
    pos: "하이퍼스케일러 + 자체 칩", posEn: "Hyperscaler plus in-house silicon",
    sum: "AWS로 최대 클라우드 점유율을 보유하고 자체 AI 칩까지 설계하는 사업자.",
    sumEn: "Holds the largest cloud share via AWS while also designing its own AI silicon.",
    pts: [
      "자체 가속기(트레이니엄 계열)로 GPU 의존도를 낮추는 전략",
      "AWS capex 증가는 전력·냉각·서버 밸류체인 전반의 수요"
    ],
    ptsEn: [
      "In-house accelerators such as the Trainium line reduce GPU dependence",
      "Rising AWS capex is demand for the whole power, cooling and server chain"
    ],
    prod: ["AWS", "자체 AI 칩", "데이터센터", "리테일"],
    prodEn: ["AWS", "In-house AI chips", "Data centers", "Retail"],
    edge: "클라우드 점유율 1위, 자체 칩 설계 역량 보유",
    edgeEn: "Number one cloud share with in-house silicon design"
  },
  {
    id: "GOOGL", name: "알파벳", nameEn: "Alphabet", tk: "GOOGL", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["ops", "chip"], ysym: "GOOGL",
    pos: "하이퍼스케일러 + TPU", posEn: "Hyperscaler plus TPU",
    sum: "자체 AI 칩(TPU)을 가장 오래 운영해온 하이퍼스케일러.",
    sumEn: "The hyperscaler with the longest-running in-house AI silicon program (TPU).",
    pts: [
      "TPU 자체 설계로 커스텀 ASIC 밸류체인의 최대 수요처",
      "검색·클라우드·AI 모델을 모두 보유해 인프라 활용률이 높음"
    ],
    ptsEn: [
      "TPU design makes it the largest buyer in the custom ASIC chain",
      "Owning search, cloud and models keeps infrastructure utilization high"
    ],
    prod: ["Google Cloud", "TPU", "데이터센터", "AI 모델"],
    prodEn: ["Google Cloud", "TPU", "Data centers", "AI models"],
    edge: "자체 AI 가속기 최장 운영 이력, 클라우드 3강",
    edgeEn: "The longest track record in in-house accelerators and a top-three cloud"
  },
  {
    id: "META", name: "메타", nameEn: "Meta Platforms", tk: "META", mkt: "NASDAQ",
    region: "US", tier: "대형", stages: ["ops"], ysym: "META",
    pos: "자체 AI 클러스터(수요)", posEn: "Own AI clusters (demand side)",
    sum: "외부 판매 없이 자체 AI 학습을 위해 대규모 데이터센터를 짓는 최대 단일 수요처 중 하나.",
    sumEn: "One of the largest single buyers, building huge data centers purely for its own AI training.",
    pts: [
      "클라우드 매출이 없어 capex가 곧 자체 사용 — 수요의 순수 지표",
      "초대형 단일 캠퍼스 프로젝트가 전력·냉각 발주의 대형 이벤트"
    ],
    ptsEn: [
      "With no cloud revenue, its capex is pure own-use demand",
      "Gigawatt-scale single campuses become major power and cooling order events"
    ],
    prod: ["자체 데이터센터", "AI 모델", "광고 플랫폼"],
    prodEn: ["Own data centers", "AI models", "Advertising platform"],
    edge: "자체 사용 목적 AI 인프라 투자 규모 최상위",
    edgeEn: "Top-tier scale of AI infrastructure investment for own use"
  },
  {
    id: "ORCL", name: "오라클", nameEn: "Oracle", tk: "ORCL", mkt: "NYSE",
    region: "US", tier: "대형", stages: ["ops"], ysym: "ORCL",
    pos: "AI 클라우드 계약 잔고", posEn: "AI cloud contracted backlog",
    sum: "대형 AI 사업자와의 장기 클라우드 계약을 기반으로 데이터센터를 급증설하는 사업자.",
    sumEn: "Scaling data centers rapidly on the back of long-term cloud contracts with major AI firms.",
    pts: [
      "계약 잔고(RPO)가 증설 계획과 차입 규모를 결정",
      "임대·전력 확보 속도가 매출 인식 시점의 제약"
    ],
    ptsEn: [
      "Contracted backlog (RPO) sets both the build plan and the borrowing need",
      "Leasing and power procurement pace constrain when revenue is recognized"
    ],
    prod: ["OCI 클라우드", "데이터베이스", "AI 인프라 임대"],
    prodEn: ["OCI cloud", "Database", "AI infrastructure leasing"],
    edge: "대형 AI 고객 장기 계약 잔고 확보",
    edgeEn: "Holds long-term contracted backlog with major AI customers"
  }
];
