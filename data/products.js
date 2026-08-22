/* ============================================================================
 * 미래에셋증권 금융상품 통합조회 — 데이터 · 필터 스키마 · 한/영 사전
 * ----------------------------------------------------------------------------
 * 여기에 담긴 상품 정보는 화면 검증용 "샘플(예시) 데이터" 입니다.
 * 실제 판매 상품·수익률·조건이 아니며, 실서비스 연동 시에는
 *   MASP.PRODUCTS  <-  사내 상품 API 응답
 * 으로 교체하면 화면 로직은 그대로 재사용됩니다. (필드명은 아래 정의를 따름)
 * ========================================================================== */
var MASP = (function () {
  'use strict';

  /* 조회 기준일 — 실행하는 날의 날짜를 쓴다.
     수치는 종목코드 시드 기반이라 날짜가 바뀌어도 그대로 유지되고,
     청약기간·만기 같은 날짜 항목만 기준일에 맞춰 이동한다. */
  var AS_OF = (function () {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  })();

  /* ---------------------------------------------------------------- 코드 테이블 */
  /* [코드, 한국어, English] 형태로 관리하고 opts() 로 필터 옵션으로 변환한다. */
  var CATEGORIES = [
    ['all', '전체', 'All products'],
    ['fund', '펀드', 'Funds'],
    ['etf', 'ETF·ETN', 'ETF·ETN'],
    ['els', 'ELS·DLS', 'ELS·DLS'],
    ['bond', '채권', 'Bonds'],
    ['rp', 'RP·CMA', 'RP·CMA'],
    ['wrap', '랩·신탁', 'Wrap·Trust'],
    ['pension', '연금·절세', 'Pension·ISA']
  ];

  var REGION = [
    ['kr', '국내', 'Korea'], ['us', '미국', 'United States'], ['cn', '중국', 'China'],
    ['jp', '일본', 'Japan'], ['in', '인도', 'India'], ['eu', '유럽', 'Europe'],
    ['em', '신흥국', 'Emerging'], ['gl', '글로벌', 'Global']
  ];
  var ASSET = [
    ['eq', '주식', 'Equity'], ['bd', '채권', 'Fixed income'], ['mx', '혼합·자산배분', 'Multi-asset'],
    ['alt', '대체·부동산', 'Alternatives'], ['mm', '단기금융', 'Money market'], ['der', '파생결합', 'Structured']
  ];
  var STATUS = [
    ['open', '모집·청약중', 'Open'], ['closing', '마감임박', 'Closing soon'],
    ['sale', '판매중', 'On sale'], ['closed', '판매종료', 'Closed']
  ];
  var CHANNEL = [
    ['online', '온라인', 'Online'], ['app', 'M-STOCK', 'M-STOCK app'], ['branch', '영업점', 'Branch']
  ];
  var TAX = [
    ['isa', 'ISA 편입', 'ISA eligible'], ['pension', '연금계좌', 'Pension account'],
    ['sep', '분리과세·비과세', 'Tax-advantaged'], ['none', '해당없음', 'None']
  ];
  var CCY = [
    ['KRW', '원화', 'KRW'], ['USD', '미국 달러', 'USD'], ['EUR', '유로', 'EUR'], ['BRL', '브라질 헤알', 'BRL']
  ];
  /* 위험등급은 국내 규정과 동일하게 1등급(매우 높은 위험) ~ 6등급(매우 낮은 위험) */
  var RISK = [
    ['1', '1등급 매우높은위험', 'Grade 1 Very high'], ['2', '2등급 높은위험', 'Grade 2 High'],
    ['3', '3등급 다소높은위험', 'Grade 3 Moderately high'], ['4', '4등급 보통위험', 'Grade 4 Moderate'],
    ['5', '5등급 낮은위험', 'Grade 5 Low'], ['6', '6등급 매우낮은위험', 'Grade 6 Very low']
  ];
  var FUND_TYPE = [
    ['eqf', '주식형', 'Equity'], ['bdf', '채권형', 'Fixed income'], ['mxf', '혼합형', 'Balanced'],
    ['fof', '재간접(FoF)', 'Fund of funds'], ['ref', '부동산·대체', 'Real estate·Alts'],
    ['mmf', 'MMF', 'MMF'], ['tdf', 'TDF', 'TDF']
  ];
  var ETF_BRAND = [
    ['TIGER', 'TIGER', 'TIGER'], ['KODEX', 'KODEX', 'KODEX'], ['ACE', 'ACE', 'ACE'],
    ['RISE', 'RISE', 'RISE'], ['PLUS', 'PLUS', 'PLUS'], ['SOL', 'SOL', 'SOL']
  ];
  var ELS_TYPE = [
    ['step', '스텝다운', 'Step-down'], ['lizard', '리자드', 'Lizard'],
    ['month', '월지급식', 'Monthly income'], ['dls', 'DLS(금리·상품)', 'DLS (rates·commodity)'],
    ['elb', 'ELB(원금지급형)', 'ELB (principal-protected)']
  ];
  var UNDERLYING = [
    ['KOSPI200', 'KOSPI200', 'KOSPI200'], ['SPX', 'S&P500', 'S&P500'],
    ['SX5E', 'EuroStoxx50', 'EuroStoxx50'], ['HSCEI', 'HSCEI', 'HSCEI'],
    ['NKY', 'Nikkei225', 'Nikkei225'], ['NVDA', 'NVIDIA', 'NVIDIA'],
    ['TSLA', 'Tesla', 'Tesla'], ['AAPL', 'Apple', 'Apple'],
    ['CMS', 'CMS 금리', 'CMS rate'], ['WTI', 'WTI 원유', 'WTI crude']
  ];
  var RATING = [
    ['AAA', 'AAA', 'AAA'], ['AA+', 'AA+', 'AA+'], ['AA', 'AA', 'AA'], ['AA-', 'AA-', 'AA-'],
    ['A+', 'A+', 'A+'], ['A', 'A', 'A'], ['BBB+', 'BBB+', 'BBB+'], ['BBB', 'BBB', 'BBB']
  ];
  var BOND_TYPE = [
    ['gov', '국고·통안채', 'Government'], ['muni', '지방·특수채', 'Public'],
    ['corp', '회사채', 'Corporate'], ['card', '여전·카드채', 'Capital·Card'],
    ['fx', '외화채권', 'FX bond'], ['sub', '신종자본증권', 'Hybrid capital']
  ];
  var RP_TYPE = [
    ['free', '수시형 RP', 'Open-term RP'], ['fix', '약정형 RP', 'Fixed-term RP'],
    ['fxrp', '외화 RP', 'FX RP'], ['cma', 'CMA', 'CMA']
  ];
  var WRAP_TYPE = [
    ['wrap', '일임형 랩', 'Discretionary wrap'], ['robo', '로보 랩', 'Robo wrap'],
    ['trust', '특정금전신탁', 'Money trust'], ['isawrap', 'ISA 일임', 'ISA discretionary']
  ];
  var PEN_TYPE = [
    ['irp', 'IRP', 'IRP'], ['psave', '연금저축', 'Pension savings'],
    ['isa', 'ISA', 'ISA'], ['dc', 'DC 제도', 'DC plan']
  ];

  function opts(table) {
    return table.map(function (r) { return { id: r[0], label: [r[1], r[2]] }; });
  }
  function labelOf(table, code) {
    for (var i = 0; i < table.length; i++) if (table[i][0] === code) return [table[i][1], table[i][2]];
    return [code, code];
  }

  /* ------------------------------------------------------------------ 한/영 사전 */
  var I18N = {
    'app.brand': ['미래에셋증권', 'Mirae Asset Securities'],
    'app.title': ['금융상품 통합조회', 'Integrated Product Finder'],
    'app.lead': ['펀드·ETF·ELS·채권·RP·랩/신탁·연금까지 전 상품군을 한 화면에서 검색하고, 최대 4개까지 나란히 비교합니다.',
      'Search every product line - funds, ETFs, ELS, bonds, RP, wrap/trust and pension - on a single screen, and compare up to four side by side.'],
    'app.asof': ['조회 기준', 'As of'],
    'app.sample': ['샘플 데이터', 'Sample data'],
    'app.sampleNote': ['본 화면의 수치는 검증용 예시입니다.', 'Figures on this screen are illustrative examples.'],
    'nav.stock': ['종목 리포트', 'Stock report'],
    'nav.print': ['인쇄', 'Print'],
    'nav.csv': ['CSV 저장', 'Export CSV'],

    'search.label': ['통합검색', 'Search'],
    'search.ph': ['상품명 · 종목코드 · 운용사/발행사 · 기초자산', 'Product name, code, provider or underlying'],
    'search.go': ['조회', 'Search'],
    'search.reset': ['전체 초기화', 'Reset all'],
    'search.quick': ['빠른 조건', 'Quick picks'],
    'quick.open': ['청약 진행중', 'Subscription open'],
    'quick.closing': ['마감 7일 이내', 'Closing within 7 days'],
    'quick.lowrisk': ['저위험(4~6등급)', 'Lower risk (4-6)'],
    'quick.tax': ['절세계좌 편입', 'Tax-advantaged'],
    'quick.online': ['온라인 전용', 'Online only'],
    'quick.top': ['1년 수익률 상위', 'Top 1Y return'],

    'kpi.total': ['조회 결과', 'Results'],
    'kpi.open': ['모집·청약중', 'Open now'],
    'kpi.closing': ['마감임박', 'Closing soon'],
    'kpi.avg': ['평균 1년 수익률', 'Average 1Y return'],
    'kpi.watch': ['관심상품', 'Watchlist'],
    'kpi.unit.cnt': ['건', ''],

    'filter.title': ['상세조건', 'Filters'],
    'filter.clear': ['조건 해제', 'Clear'],
    'filter.common': ['공통 조건', 'Common'],
    'filter.cat': ['상품군 조건', 'Category filters'],
    'filter.min': ['최소', 'Min'],
    'filter.max': ['최대', 'Max'],
    'filter.applied': ['적용된 조건', 'Applied filters'],
    'filter.none': ['적용된 조건 없음', 'No filters applied'],

    'watch.title': ['관심상품', 'Watchlist'],
    'watch.empty': ['표에서 ★ 를 눌러 관심상품으로 담아 두세요.', 'Use the star in the table to save products here.'],
    'watch.clear': ['비우기', 'Clear'],

    'result.title': ['상품 목록', 'Product list'],
    'result.count': ['총 %d건', '%d results'],
    'result.of': ['%s / %s 건 표시', 'Showing %s of %s'],
    'result.empty': ['조건에 맞는 상품이 없습니다. 조건을 완화해 보세요.', 'No products match these filters. Try relaxing them.'],
    'sort.label': ['정렬', 'Sort'],
    'sort.ret1y': ['1년 수익률 높은순', '1Y return - high'],
    'sort.ret3m': ['3개월 수익률 높은순', '3M return - high'],
    'sort.rate': ['제시·약정수익률 높은순', 'Offered rate - high'],
    'sort.fee': ['보수·비용 낮은순', 'Fee - low'],
    'sort.aum': ['설정·순자산 큰순', 'Assets - large'],
    'sort.risk': ['위험등급 낮은순', 'Risk - low'],
    'sort.deadline': ['마감 임박순', 'Deadline - soonest'],
    'sort.name': ['상품명', 'Name'],
    'view.table': ['표', 'Table'],
    'view.card': ['카드', 'Cards'],
    'page.prev': ['이전', 'Prev'],
    'page.next': ['다음', 'Next'],

    'col.watch': ['관심', 'Watch'],
    'col.name': ['상품명', 'Product'],
    'col.cat': ['상품군', 'Category'],
    'col.type': ['유형', 'Type'],
    'col.provider': ['운용사·발행사', 'Provider'],
    'col.risk': ['위험등급', 'Risk'],
    'col.region': ['투자지역', 'Region'],
    'col.trend': ['1년 추이', '1Y trend'],
    'col.ret3m': ['3개월', '3M'],
    'col.ret6m': ['6개월', '6M'],
    'col.ret1y': ['1년', '1Y'],
    'col.ret3y': ['3년', '3Y'],
    'col.fee': ['총보수', 'Total fee'],
    'col.aum': ['설정액', 'Fund assets'],
    'col.nav': ['순자산·순자산가치', 'NAV'],
    'col.price': ['현재가', 'Price'],
    'col.dist': ['분배율', 'Dist. yield'],
    'col.index': ['기초지수', 'Index'],
    'col.underlying': ['기초자산', 'Underlying'],
    'col.coupon': ['제시수익률', 'Offered coupon'],
    'col.barrier': ['최초 배리어', 'First barrier'],
    'col.knockin': ['원금손실조건', 'Knock-in'],
    'col.maturity': ['만기', 'Maturity'],
    'col.deadline': ['청약마감', 'Subscription ends'],
    'col.rating': ['신용등급', 'Rating'],
    'col.ytm': ['매매수익률', 'Yield (YTM)'],
    'col.residual': ['잔존기간', 'Residual'],
    'col.cycle': ['이자지급', 'Coupon freq.'],
    'col.term': ['약정기간', 'Term'],
    'col.rate': ['약정수익률', 'Rate'],
    'col.strategy': ['운용전략', 'Strategy'],
    'col.mgmtfee': ['일임·신탁보수', 'Mgmt fee'],
    'col.min': ['최소가입', 'Minimum'],
    'col.tax': ['세제', 'Tax'],
    'col.status': ['판매상태', 'Status'],
    'col.act': ['비교', 'Compare'],

    'cal.title': ['청약·모집 캘린더', 'Subscription calendar'],
    'cal.lead': ['ELS/DLS·공모펀드 등 기간이 정해진 상품의 마감일 순서입니다.', 'Deadline order for time-limited offerings such as ELS/DLS and public funds.'],
    'cal.dleft': ['D-%d', 'D-%d'],
    'cal.today': ['오늘 마감', 'Ends today'],
    'cal.empty': ['진행중인 청약이 없습니다.', 'No open subscriptions.'],

    'tray.title': ['비교함', 'Compare tray'],
    'tray.hint': ['최대 4개까지 담을 수 있습니다.', 'Up to four products.'],
    'tray.go': ['비교하기', 'Compare'],
    'tray.clear': ['비우기', 'Clear'],
    'cmp.title': ['상품 비교', 'Product comparison'],
    'cmp.rebase': ['기준시점 100 환산 수익률', 'Return indexed to 100'],
    'cmp.metric': ['항목', 'Metric'],
    'cmp.need': ['비교할 상품을 2개 이상 담아 주세요.', 'Add at least two products to compare.'],

    'detail.title': ['상품 상세', 'Product detail'],
    'detail.key': ['핵심지표', 'Key metrics'],
    'detail.perf': ['수익률 추이', 'Performance'],
    'detail.perfNote': ['최근 12개월, 기준시점 100 환산 · 벤치마크 대비', 'Last 12 months indexed to 100 vs benchmark'],
    'detail.bench': ['비교지수', 'Benchmark'],
    'detail.risk': ['위험 · 등급', 'Risk profile'],
    'detail.cost': ['비용 · 가입조건', 'Costs & terms'],
    'detail.comp': ['자산 구성', 'Composition'],
    'detail.payoff': ['손익구조', 'Payoff structure'],
    'detail.payoffNote': ['조기상환 평가일마다 배리어 이상이면 제시수익률로 상환됩니다.', 'Redeemed at the offered coupon when the underlying is at or above the barrier on an observation date.'],
    'detail.doc': ['서류 · 공시', 'Documents'],
    'detail.doc1': ['투자설명서', 'Prospectus'],
    'detail.doc2': ['간이투자설명서', 'Summary prospectus'],
    'detail.doc3': ['상품 요약 설명서', 'Product summary'],
    'detail.act': ['가입·청약', 'Invest'],
    'detail.close': ['닫기', 'Close'],
    'detail.addcmp': ['비교함에 담기', 'Add to compare'],
    'detail.incmp': ['비교함에 담김', 'In compare tray'],
    'detail.sd': ['표준편차(3년)', 'Std. dev (3Y)'],
    'detail.sharpe': ['샤프지수', 'Sharpe ratio'],
    'detail.mdd': ['최대낙폭', 'Max drawdown'],
    'detail.launch': ['설정·발행일', 'Inception'],
    'detail.channel': ['판매채널', 'Channels'],
    'detail.ccy': ['거래통화', 'Currency'],

    'notice.title': ['투자 유의사항', 'Important notices'],
    'notice.1': ['금융투자상품은 예금자보호법에 따라 보호되지 않으며, 원금 손실이 발생할 수 있습니다.',
      'Financial investment products are not protected by the Depositor Protection Act and may incur loss of principal.'],
    'notice.2': ['ELS/DLS 등 파생결합증권은 기초자산 가격에 따라 원금의 전부 또는 일부 손실이 발생할 수 있습니다.',
      'Derivative-linked securities such as ELS/DLS may lose all or part of the principal depending on the underlying asset.'],
    'notice.3': ['과거 수익률은 미래 수익을 보장하지 않으며, 표시된 수익률은 세전 기준입니다.',
      'Past performance does not guarantee future results; returns shown are before tax.'],
    'notice.4': ['가입 전 투자설명서와 상품 요약 설명서를 반드시 확인하시기 바랍니다.',
      'Please read the prospectus and product summary before investing.'],
    'notice.5': ['본 화면은 정보 제공 목적의 참고 자료이며, 화면의 모든 수치는 샘플 데이터입니다.',
      'This screen is for reference only and every figure shown is sample data.'],

    'unit.won': ['원', 'KRW'],
    'unit.man': ['만원', 'KRW 10k'],
    'unit.eok': ['억원', 'KRW 100m'],
    'unit.m': ['개월', 'months'],
    'unit.y': ['년', 'years'],
    'unit.d': ['일', 'days'],
    'val.none': ['해당없음', 'N/A'],
    'val.noKnockIn': ['노낙인', 'No knock-in'],
    'val.knockIn': ['낙인 %d%', 'Knock-in %d%'],
    'val.dash': ['—', '—']
  };

  /* --------------------------------------------------------------- 필터 스키마 */
  /* type: chips(다중선택) | range(최소/최대) — 화면은 이 스키마만 보고 렌더한다. */
  var FILTER_SCHEMA = {
    common: [
      { id: 'risk', type: 'chips', label: ['위험등급', 'Risk grade'], options: opts(RISK), cols: 1 },
      { id: 'region', type: 'chips', label: ['투자지역', 'Region'], options: opts(REGION), cols: 2 },
      { id: 'asset', type: 'chips', label: ['자산유형', 'Asset class'], options: opts(ASSET), cols: 2 },
      { id: 'status', type: 'chips', label: ['판매상태', 'Status'], options: opts(STATUS), cols: 2 },
      { id: 'tax', type: 'chips', label: ['세제혜택', 'Tax benefit'], options: opts(TAX), cols: 2 },
      { id: 'channel', type: 'chips', label: ['판매채널', 'Channel'], options: opts(CHANNEL), cols: 2 },
      { id: 'currency', type: 'chips', label: ['거래통화', 'Currency'], options: opts(CCY), cols: 2 },
      { id: 'minAmount', type: 'range', label: ['최소가입금액', 'Minimum investment'], unit: ['만원', 'KRW 10k'], step: 10 }
    ],
    fund: [
      { id: 'fundType', type: 'chips', label: ['펀드유형', 'Fund type'], options: opts(FUND_TYPE), cols: 2 },
      { id: 'ret1y', type: 'range', label: ['1년 수익률', '1Y return'], unit: ['%', '%'], step: 1 },
      { id: 'fee', type: 'range', label: ['총보수', 'Total fee'], unit: ['%', '%'], step: 0.1 },
      { id: 'aum', type: 'range', label: ['설정액', 'Fund assets'], unit: ['억원', 'KRW 100m'], step: 100 }
    ],
    etf: [
      { id: 'etfBrand', type: 'chips', label: ['브랜드', 'Brand'], options: opts(ETF_BRAND), cols: 3 },
      { id: 'hedged', type: 'chips', label: ['환헤지', 'FX hedge'], options: [{ id: 'h', label: ['환헤지(H)', 'Hedged (H)'] }, { id: 'uh', label: ['환노출', 'Unhedged'] }], cols: 2 },
      { id: 'ret1y', type: 'range', label: ['1년 수익률', '1Y return'], unit: ['%', '%'], step: 1 },
      { id: 'fee', type: 'range', label: ['총보수', 'Total fee'], unit: ['%', '%'], step: 0.05 },
      { id: 'dist', type: 'range', label: ['분배율', 'Distribution yield'], unit: ['%', '%'], step: 0.5 }
    ],
    els: [
      { id: 'elsType', type: 'chips', label: ['상품유형', 'Structure'], options: opts(ELS_TYPE), cols: 2 },
      { id: 'underlying', type: 'chips', label: ['기초자산', 'Underlying'], options: opts(UNDERLYING), cols: 2 },
      { id: 'coupon', type: 'range', label: ['제시수익률(연)', 'Offered coupon (p.a.)'], unit: ['%', '%'], step: 1 },
      { id: 'barrier', type: 'range', label: ['최초 배리어', 'First barrier'], unit: ['%', '%'], step: 5 },
      { id: 'knockInFree', type: 'chips', label: ['원금손실조건', 'Knock-in'], options: [{ id: 'y', label: ['노낙인', 'No knock-in'] }, { id: 'n', label: ['낙인형', 'With knock-in'] }], cols: 2 },
      { id: 'maturityM', type: 'range', label: ['만기', 'Maturity'], unit: ['개월', 'months'], step: 6 }
    ],
    bond: [
      { id: 'bondType', type: 'chips', label: ['채권종류', 'Bond type'], options: opts(BOND_TYPE), cols: 2 },
      { id: 'rating', type: 'chips', label: ['신용등급', 'Credit rating'], options: opts(RATING), cols: 4 },
      { id: 'ytm', type: 'range', label: ['매매수익률', 'Yield (YTM)'], unit: ['%', '%'], step: 0.5 },
      { id: 'residualY', type: 'range', label: ['잔존기간', 'Residual maturity'], unit: ['년', 'years'], step: 1 },
      { id: 'coupon', type: 'range', label: ['표면금리', 'Coupon rate'], unit: ['%', '%'], step: 0.5 }
    ],
    rp: [
      { id: 'rpType', type: 'chips', label: ['상품유형', 'Product type'], options: opts(RP_TYPE), cols: 2 },
      { id: 'rate', type: 'range', label: ['약정수익률(연)', 'Rate (p.a.)'], unit: ['%', '%'], step: 0.1 },
      { id: 'termD', type: 'range', label: ['약정기간', 'Term'], unit: ['일', 'days'], step: 30 }
    ],
    wrap: [
      { id: 'wrapType', type: 'chips', label: ['상품유형', 'Product type'], options: opts(WRAP_TYPE), cols: 2 },
      { id: 'ret1y', type: 'range', label: ['1년 수익률', '1Y return'], unit: ['%', '%'], step: 1 },
      { id: 'mgmtFee', type: 'range', label: ['일임·신탁보수', 'Mgmt fee'], unit: ['%', '%'], step: 0.1 }
    ],
    pension: [
      { id: 'penType', type: 'chips', label: ['계좌유형', 'Account type'], options: opts(PEN_TYPE), cols: 2 },
      { id: 'ret1y', type: 'range', label: ['1년 수익률', '1Y return'], unit: ['%', '%'], step: 1 },
      { id: 'fee', type: 'range', label: ['총보수', 'Total fee'], unit: ['%', '%'], step: 0.1 }
    ]
  };

  /* ------------------------------------------------------------ 샘플 데이터 생성 */
  /* 종목코드/인덱스를 시드로 쓰는 결정적 생성기 — 새로고침해도 값이 바뀌지 않는다. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function num(rng, min, max, dec) {
    var v = min + rng() * (max - min), p = Math.pow(10, dec || 0);
    return Math.round(v * p) / p;
  }
  /* 월간 13포인트(=최근 12개월) 지수 시계열. 위험등급이 높을수록 변동성이 크다. */
  function series(rng, drift, vol) {
    var v = 100, out = [100];
    for (var i = 1; i < 13; i++) {
      v = v * (1 + drift / 1200 + (rng() - 0.48) * vol / 100);
      out.push(Math.round(v * 100) / 100);
    }
    return out;
  }
  function chg(s, back) {
    var n = s.length - 1, from = s[Math.max(0, n - back)];
    return Math.round((s[n] / from - 1) * 1000) / 10;
  }
  function mdd(s) {
    var peak = s[0], worst = 0;
    for (var i = 1; i < s.length; i++) {
      if (s[i] > peak) peak = s[i];
      var dd = (s[i] / peak - 1) * 100;
      if (dd < worst) worst = dd;
    }
    return Math.round(worst * 10) / 10;
  }
  function addDays(iso, d) {
    var t = new Date(iso + 'T00:00:00Z');
    t.setUTCDate(t.getUTCDate() + d);
    return t.toISOString().slice(0, 10);
  }
  function addMonths(iso, m) {
    var t = new Date(iso + 'T00:00:00Z');
    t.setUTCMonth(t.getUTCMonth() + m);
    return t.toISOString().slice(0, 10);
  }

  /* --- 이름 조합용 풀 ------------------------------------------------------- */
  var HOUSE = [
    ['미래에셋', 'Mirae Asset'], ['삼성', 'Samsung'], ['KB', 'KB'], ['한국투자', 'Korea Investment'],
    ['신한', 'Shinhan'], ['피델리티', 'Fidelity'], ['슈로더', 'Schroder'], ['JP모간', 'J.P. Morgan'],
    ['블랙록', 'BlackRock'], ['AB', 'AB']
  ];
  /* [한글테마, 영문테마, 투자지역, 자산유형] */
  var THEME = [
    ['미국테크', 'US Tech', 'us', 'eq'], ['글로벌 배당', 'Global Dividend', 'gl', 'eq'],
    ['인디아 중소형', 'India Small-Mid Cap', 'in', 'eq'], ['차이나 그로스', 'China Growth', 'cn', 'eq'],
    ['코어 배당주', 'Core Dividend', 'kr', 'eq'], ['글로벌 하이일드', 'Global High Yield', 'gl', 'bd'],
    ['단기 우량채', 'Short-Term IG Bond', 'kr', 'bd'], ['글로벌 리츠', 'Global REITs', 'gl', 'alt'],
    ['AI 밸류체인', 'AI Value Chain', 'gl', 'eq'], ['반도체 코어', 'Semiconductor Core', 'gl', 'eq'],
    ['글로벌 헬스케어', 'Global Healthcare', 'gl', 'eq'], ['유럽 인프라', 'European Infrastructure', 'eu', 'alt'],
    ['일본 가치주', 'Japan Value', 'jp', 'eq'], ['신흥국 국채', 'EM Sovereign Bond', 'em', 'bd'],
    ['글로벌 멀티에셋', 'Global Multi-Asset', 'gl', 'mx'], ['국내 성장주', 'Korea Growth', 'kr', 'eq'],
    ['글로벌 인컴', 'Global Income', 'gl', 'mx'], ['미국 우량채', 'US IG Bond', 'us', 'bd'],
    ['국내 액티브', 'Korea Active', 'kr', 'eq'], ['원화 머니마켓', 'KRW Money Market', 'kr', 'mm']
  ];
  var FORM = {
    eq: [['증권자투자신탁(주식)', 'Equity Fund', 'eqf'], ['증권자투자신탁(주식-재간접형)', 'Equity FoF', 'fof']],
    bd: [['증권자투자신탁(채권)', 'Bond Fund', 'bdf'], ['증권자투자신탁(채권-재간접형)', 'Bond FoF', 'fof']],
    mx: [['증권자투자신탁(채권혼합)', 'Bond-Mixed Fund', 'mxf'], ['증권자투자신탁(주식혼합)', 'Equity-Mixed Fund', 'mxf']],
    alt: [['부동산투자신탁(재간접형)', 'Real Estate FoF', 'ref'], ['특별자산투자신탁', 'Special Asset Fund', 'ref']],
    mm: [['머니마켓펀드', 'Money Market Fund', 'mmf']]
  };
  var CLASS = ['C-e', 'A-e', 'S', 'C-P2'];
  var ETF_THEME = [
    ['미국S&P500', 'US S&P500', 'us', 'eq', 'S&P500'], ['미국나스닥100', 'US Nasdaq100', 'us', 'eq', 'Nasdaq100'],
    ['코스피200', 'KOSPI200', 'kr', 'eq', 'KOSPI200'], ['미국배당다우존스', 'US Dividend Dow Jones', 'us', 'eq', 'Dow Jones US Dividend 100'],
    ['글로벌AI반도체', 'Global AI Semiconductor', 'gl', 'eq', 'Solactive AI Semi'],
    ['인도Nifty50', 'India Nifty50', 'in', 'eq', 'Nifty50'], ['일본TOPIX', 'Japan TOPIX', 'jp', 'eq', 'TOPIX'],
    ['유럽STOXX50', 'Europe STOXX50', 'eu', 'eq', 'EuroStoxx50'], ['차이나전기차', 'China EV', 'cn', 'eq', 'Solactive China EV'],
    ['국고채10년', 'KTB 10Y', 'kr', 'bd', 'KTB Index 10Y'], ['미국채30년', 'US Treasury 30Y', 'us', 'bd', 'ICE US Treasury 30Y'],
    ['단기통화안정채권', 'Short-Term MSB', 'kr', 'mm', 'KAP MSB'], ['글로벌리츠', 'Global REITs', 'gl', 'alt', 'FTSE EPRA Nareit'],
    ['코리아밸류업', 'Korea Value-up', 'kr', 'eq', 'KRX Value-up'], ['미국빅테크TOP10', 'US Big Tech Top10', 'us', 'eq', 'Solactive US Big Tech']
  ];
  var ISSUER = [
    ['대한민국(국고)', 'Republic of Korea', 'gov'], ['한국은행(통안)', 'Bank of Korea', 'gov'],
    ['한국전력공사', 'KEPCO', 'muni'], ['한국주택금융공사', 'Korea Housing Finance', 'muni'],
    ['현대자동차', 'Hyundai Motor', 'corp'], ['SK하이닉스', 'SK hynix', 'corp'],
    ['LG에너지솔루션', 'LG Energy Solution', 'corp'], ['롯데지주', 'Lotte Corp', 'corp'],
    ['현대캐피탈', 'Hyundai Capital', 'card'], ['신한카드', 'Shinhan Card', 'card'],
    ['미국 재무부', 'US Treasury', 'fx'], ['브라질 재무부', 'Brazil Treasury', 'fx'],
    ['우리금융지주', 'Woori Financial', 'sub'], ['하나금융지주', 'Hana Financial', 'sub']
  ];
  var STRATEGY = [
    ['글로벌 코어 자산배분', 'Global Core Allocation'], ['국내 배당가치', 'Korea Dividend Value'],
    ['AI 퀀트 알파', 'AI Quant Alpha'], ['글로벌 채권 인컴', 'Global Bond Income'],
    ['미국 성장주 집중', 'US Growth Focus'], ['ETF 자산배분', 'ETF Allocation'],
    ['국내 채권 안정', 'Korea Bond Stable'], ['글로벌 인프라·리츠', 'Global Infra & REITs']
  ];
  var PEN_PORT = [
    ['생애주기 TDF 2045', 'Lifecycle TDF 2045', 'tdf'], ['생애주기 TDF 2035', 'Lifecycle TDF 2035', 'tdf'],
    ['글로벌 배당 인컴', 'Global Dividend Income', 'eqf'], ['안정형 채권 코어', 'Conservative Bond Core', 'bdf'],
    ['미국 대표지수 ETF', 'US Core Index ETF', 'eqf'], ['위험중립 자산배분', 'Balanced Allocation', 'mxf'],
    ['디딤 안정추구', 'Steady Growth', 'mxf']
  ];

  function riskVol(risk) { return [0, 7.0, 5.4, 4.2, 2.8, 1.6, 0.7][risk]; }

  var PRODUCTS = [];
  var seq = 0;
  function push(p) { p.id = p.cat + '-' + (++seq); PRODUCTS.push(p); return p; }

  /* --- 펀드 40건 ----------------------------------------------------------- */
  (function () {
    for (var i = 0; i < 40; i++) {
      var rng = mulberry32(1000 + i * 7);
      var h = HOUSE[i % HOUSE.length], t = THEME[(i * 3 + 1) % THEME.length];
      var forms = FORM[t[3]], f = forms[i % forms.length];
      var cls = CLASS[i % CLASS.length];
      var risk = t[3] === 'mm' ? 6 : t[3] === 'bd' ? (i % 2 ? 5 : 4) : t[3] === 'mx' ? 4 : (i % 3 === 0 ? 1 : 2);
      var s = series(rng, t[3] === 'eq' ? num(rng, -4, 26, 1) : t[3] === 'bd' ? num(rng, 1, 7, 1) : num(rng, 0, 12, 1), riskVol(risk));
      var b = series(mulberry32(9000 + i), 8, riskVol(risk) * 0.8);
      var ft = t[1].indexOf('TDF') >= 0 ? 'tdf' : f[2];
      push({
        cat: 'fund',
        name: [h[0] + ' ' + t[0] + ' ' + f[0] + ' ' + cls, h[1] + ' ' + t[1] + ' ' + f[1] + ' ' + cls],
        code: 'K' + (55000 + i * 13),
        provider: [h[0] + '자산운용', h[1] + ' Asset Management'],
        risk: risk, region: t[2], asset: t[3], fundType: ft,
        status: i % 11 === 0 ? 'open' : i % 17 === 0 ? 'closed' : 'sale',
        currency: t[2] === 'kr' ? 'KRW' : (i % 3 ? 'KRW' : 'USD'),
        tax: i % 4 === 0 ? ['isa', 'pension'] : i % 4 === 1 ? ['isa'] : i % 4 === 2 ? ['pension'] : ['none'],
        channel: i % 5 === 0 ? ['online', 'app'] : ['online', 'app', 'branch'],
        minAmount: [1, 10, 50, 100][i % 4],
        fee: num(rng, 0.15, 1.65, 2),
        aum: Math.round(num(rng, 120, 42000, 0)),
        nav: Math.round(num(rng, 950, 2400, 0)),
        series: s, bench: b,
        benchName: [t[0] + ' 비교지수', t[1] + ' benchmark'],
        sharpe: num(rng, -0.3, 1.9, 2),
        stdev: num(rng, 1.2, 22, 1),
        launch: addMonths(AS_OF, -Math.round(num(rng, 14, 130, 0))),
        holdings: [
          [['주식', 'Equity'], t[3] === 'eq' ? 92 : t[3] === 'mx' ? 42 : 4],
          [['채권', 'Fixed income'], t[3] === 'bd' ? 94 : t[3] === 'mx' ? 48 : 3],
          [['대체·리츠', 'Alternatives'], t[3] === 'alt' ? 88 : 2],
          [['유동성', 'Cash'], 5]
        ]
      });
    }
  })();

  /* --- ETF·ETN 30건 -------------------------------------------------------- */
  (function () {
    for (var i = 0; i < 30; i++) {
      var rng = mulberry32(2000 + i * 11);
      var brand = ETF_BRAND[i % ETF_BRAND.length][0];
      var t = ETF_THEME[(i * 7 + 2) % ETF_THEME.length];
      var isEtn = i % 10 === 9;
      var hedged = i % 6 === 0 && t[2] !== 'kr';
      var risk = t[3] === 'eq' ? (i % 4 === 0 ? 1 : 2) : t[3] === 'bd' ? 4 : t[3] === 'mm' ? 6 : 3;
      var s = series(rng, t[3] === 'eq' ? num(rng, -2, 30, 1) : num(rng, 1, 9, 1), riskVol(risk));
      var b = series(mulberry32(9500 + i), 9, riskVol(risk) * 0.9);
      push({
        cat: 'etf',
        name: [brand + ' ' + t[0] + (hedged ? '(H)' : '') + (isEtn ? ' ETN' : ''),
          brand + ' ' + t[1] + (hedged ? ' (H)' : '') + (isEtn ? ' ETN' : '')],
        code: (isEtn ? '55' : '4') + (10000 + i * 137),
        provider: [HOUSE[i % HOUSE.length][0] + '자산운용', HOUSE[i % HOUSE.length][1] + ' Asset Management'],
        risk: risk, region: t[2], asset: t[3], etfBrand: brand,
        etfIndex: t[4], hedged: hedged ? 'h' : 'uh',
        status: 'sale',
        currency: 'KRW',
        tax: i % 3 === 0 ? ['isa', 'pension'] : ['isa'],
        channel: ['online', 'app', 'branch'],
        minAmount: 1,
        fee: num(rng, 0.008, 0.68, 3),
        aum: Math.round(num(rng, 80, 68000, 0)),
        price: Math.round(num(rng, 5200, 42000, 0)),
        dist: num(rng, 0, 8.4, 2),
        series: s, bench: b,
        benchName: [t[4] + ' 지수', t[4] + ' index'],
        sharpe: num(rng, -0.2, 2.1, 2),
        stdev: num(rng, 1.0, 24, 1),
        launch: addMonths(AS_OF, -Math.round(num(rng, 8, 120, 0))),
        holdings: [
          [['주식', 'Equity'], t[3] === 'eq' ? 99 : 1],
          [['채권', 'Fixed income'], t[3] === 'bd' || t[3] === 'mm' ? 98 : 0],
          [['대체·리츠', 'Alternatives'], t[3] === 'alt' ? 97 : 0],
          [['유동성', 'Cash'], 2]
        ]
      });
    }
  })();

  /* --- ELS·DLS 26건 -------------------------------------------------------- */
  (function () {
    for (var i = 0; i < 26; i++) {
      var rng = mulberry32(3000 + i * 5);
      var type = ELS_TYPE[(i * 3) % ELS_TYPE.length][0];
      var nU = type === 'dls' ? 1 : (i % 3) + 2;
      var us = [];
      for (var k = 0; k < nU; k++) {
        /* DLS 는 금리·상품(CMS·WTI)만, ELS/ELB 는 지수·개별주식(앞 8종)만 기초자산으로 쓴다 */
        var u = type === 'dls' ? UNDERLYING[8 + ((i + k) % 2)][0] : UNDERLYING[(i * 4 + k * 3) % 8][0];
        if (us.indexOf(u) < 0) us.push(u);
      }
      var elb = type === 'elb';
      var risk = elb ? 5 : type === 'dls' ? 2 : nU >= 3 ? 1 : 2;
      var coupon = elb ? num(rng, 3.1, 5.2, 2) : num(rng, 5.6, 18.5, 2);
      var barrier = elb ? null : [95, 90, 85, 80][i % 4];
      var ki = elb ? null : (i % 3 === 0 ? null : [45, 50, 55][i % 3]);
      var endD = Math.round(num(rng, 1, 34, 0));
      var s = series(rng, coupon, 0.35);
      push({
        cat: 'els',
        name: ['미래에셋증권 제' + (32100 + i * 3) + '회 ' + (type === 'dls' ? 'DLS' : elb ? 'ELB' : 'ELS'),
          'Mirae Asset Securities ' + (type === 'dls' ? 'DLS' : elb ? 'ELB' : 'ELS') + ' No.' + (32100 + i * 3)],
        code: 'S' + (78000 + i * 7),
        provider: ['미래에셋증권', 'Mirae Asset Securities'],
        risk: risk, region: us.indexOf('KOSPI200') >= 0 ? 'kr' : 'gl', asset: 'der',
        elsType: type, underlying: us,
        coupon: coupon, barrier: barrier, knockIn: ki, knockInFree: ki ? 'n' : 'y',
        maturityM: [12, 18, 24, 36][i % 4], earlyM: type === 'month' ? 1 : [4, 6][i % 2],
        status: endD <= 7 ? 'closing' : 'open',
        subStart: addDays(AS_OF, -Math.round(num(rng, 1, 6, 0))),
        subEnd: addDays(AS_OF, endD),
        deadlineD: endD,
        currency: i % 9 === 0 ? 'USD' : 'KRW',
        tax: i % 5 === 0 ? ['sep'] : ['none'],
        channel: i % 4 === 0 ? ['online', 'app'] : ['online', 'app', 'branch'],
        minAmount: [10, 100, 500][i % 3],
        fee: num(rng, 0.4, 1.6, 2),
        aum: Math.round(num(rng, 30, 1800, 0)),
        series: s, bench: series(mulberry32(9700 + i), 3.4, 0.2),
        benchName: ['정기예금(연 3.4%)', 'Time deposit (3.4% p.a.)'],
        launch: addDays(AS_OF, endD + 3),
        obs: [1, 2, 3, 4, 5, 6]
      });
    }
  })();

  /* --- 채권 24건 ----------------------------------------------------------- */
  (function () {
    for (var i = 0; i < 24; i++) {
      var rng = mulberry32(4000 + i * 3);
      var iss = ISSUER[(i * 5) % ISSUER.length];
      var bt = iss[2];
      var rating = bt === 'gov' ? 'AAA' : bt === 'muni' ? 'AAA' : bt === 'sub' ? 'A' :
        RATING[2 + (i % 5)][0];
      var risk = bt === 'gov' ? 6 : bt === 'muni' ? 5 : bt === 'sub' ? 3 : rating.charAt(0) === 'A' ? 4 : 3;
      var resid = num(rng, 0.3, 21, 1);
      var ccy = bt === 'fx' ? (iss[0].indexOf('브라질') >= 0 ? 'BRL' : 'USD') : 'KRW';
      var ytm = ccy === 'BRL' ? num(rng, 10.5, 13.8, 2) : ccy === 'USD' ? num(rng, 3.9, 5.6, 2) :
        bt === 'gov' ? num(rng, 2.6, 3.5, 2) : bt === 'sub' ? num(rng, 4.6, 6.4, 2) : num(rng, 3.2, 5.4, 2);
      var s = series(rng, ytm, 0.5);
      push({
        cat: 'bond',
        name: [iss[0] + ' ' + (bt === 'gov' ? '국고채권 0' + (2500 + i) + '-' + (2609 + i) : bt === 'fx' ? '외화표시채권 ' + (2031 + i % 8) + '년 만기' : '제' + (300 + i) + '-' + (i % 3 + 1) + '회'),
          iss[1] + ' ' + (bt === 'gov' ? 'KTB 0' + (2500 + i) : bt === 'fx' ? 'FX bond mat. ' + (2031 + i % 8) : 'Series ' + (300 + i) + '-' + (i % 3 + 1))],
        code: 'KR' + (1035000 + i * 271),
        provider: [iss[0], iss[1]],
        risk: risk, region: bt === 'fx' ? (ccy === 'BRL' ? 'em' : 'us') : 'kr', asset: 'bd',
        bondType: bt, rating: rating,
        ytm: ytm, coupon: num(rng, 1.2, Math.max(2, ytm + 1), 2),
        residualY: resid, maturity: addMonths(AS_OF, Math.round(resid * 12)),
        cycle: bt === 'gov' ? 6 : [3, 6][i % 2],
        status: i % 13 === 0 ? 'closing' : 'sale',
        currency: ccy,
        tax: bt === 'fx' && ccy === 'BRL' ? ['sep'] : i % 3 === 0 ? ['isa'] : ['none'],
        channel: i % 3 === 0 ? ['online', 'app'] : ['online', 'app', 'branch'],
        minAmount: bt === 'gov' ? 1 : [10, 100, 1000][i % 3],
        aum: Math.round(num(rng, 50, 5000, 0)),
        price: num(rng, 8900, 10600, 0),
        series: s, bench: series(mulberry32(9800 + i), 3.1, 0.3),
        benchName: ['국고채 3년', 'KTB 3Y'],
        launch: addMonths(AS_OF, -Math.round(num(rng, 3, 60, 0)))
      });
    }
  })();

  /* --- RP·CMA 12건 --------------------------------------------------------- */
  (function () {
    var defs = [
      ['free', '원화 수시형 RP', 'KRW Open-term RP', 0, 'KRW'],
      ['fix', '원화 약정형 RP 30일', 'KRW Fixed-term RP 30D', 30, 'KRW'],
      ['fix', '원화 약정형 RP 91일', 'KRW Fixed-term RP 91D', 91, 'KRW'],
      ['fix', '원화 약정형 RP 181일', 'KRW Fixed-term RP 181D', 181, 'KRW'],
      ['fix', '원화 약정형 RP 365일', 'KRW Fixed-term RP 365D', 365, 'KRW'],
      ['fxrp', '외화(USD) 수시형 RP', 'USD Open-term RP', 0, 'USD'],
      ['fxrp', '외화(USD) 약정형 RP 91일', 'USD Fixed-term RP 91D', 91, 'USD'],
      ['fxrp', '외화(EUR) 약정형 RP 181일', 'EUR Fixed-term RP 181D', 181, 'EUR'],
      ['cma', 'CMA-RP형', 'CMA RP type', 0, 'KRW'],
      ['cma', 'CMA-MMW형', 'CMA MMW type', 0, 'KRW'],
      ['cma', 'CMA-MMF형', 'CMA MMF type', 0, 'KRW'],
      ['cma', '외화 CMA(USD)', 'FX CMA (USD)', 0, 'USD']
    ];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i], rng = mulberry32(5000 + i * 17);
      var rate = d[4] === 'USD' ? num(rng, 3.8, 4.7, 2) : d[4] === 'EUR' ? num(rng, 2.1, 2.9, 2) :
        d[3] === 0 ? num(rng, 2.1, 2.9, 2) : num(rng, 2.8, 3.6, 2);
      push({
        cat: 'rp',
        name: [d[1], d[2]],
        code: 'RP' + (100 + i),
        provider: ['미래에셋증권', 'Mirae Asset Securities'],
        risk: d[0] === 'cma' ? 6 : 5, region: d[4] === 'KRW' ? 'kr' : 'gl',
        asset: 'mm', rpType: d[0],
        rate: rate, termD: d[3],
        status: 'sale', currency: d[4],
        tax: ['none'], channel: ['online', 'app', 'branch'],
        minAmount: d[0] === 'cma' ? 1 : d[3] === 0 ? 1 : 100,
        aum: Math.round(num(rng, 2000, 90000, 0)),
        series: null, bench: null,
        launch: addMonths(AS_OF, -Math.round(num(rng, 24, 140, 0)))
      });
    }
  })();

  /* --- 랩·신탁 12건 -------------------------------------------------------- */
  (function () {
    for (var i = 0; i < 12; i++) {
      var rng = mulberry32(6000 + i * 13);
      var wt = WRAP_TYPE[i % WRAP_TYPE.length][0];
      var st = STRATEGY[(i * 3) % STRATEGY.length];
      var risk = wt === 'trust' ? (i % 2 ? 5 : 4) : (i % 3 === 0 ? 2 : 3);
      var s = series(rng, num(rng, 2, 19, 1), riskVol(risk));
      push({
        cat: 'wrap',
        name: ['미래에셋 ' + st[0] + ' ' + (wt === 'trust' ? '특정금전신탁' : wt === 'robo' ? '로보랩' : wt === 'isawrap' ? 'ISA 일임랩' : '랩어카운트'),
          'Mirae Asset ' + st[1] + ' ' + (wt === 'trust' ? 'Money Trust' : wt === 'robo' ? 'Robo Wrap' : wt === 'isawrap' ? 'ISA Discretionary' : 'Wrap Account')],
        code: 'W' + (900 + i * 3),
        provider: ['미래에셋증권', 'Mirae Asset Securities'],
        risk: risk, region: st[1].indexOf('Korea') >= 0 ? 'kr' : 'gl',
        asset: st[1].indexOf('Bond') >= 0 ? 'bd' : st[1].indexOf('Allocation') >= 0 ? 'mx' : 'eq',
        wrapType: wt, strategy: st,
        status: i % 7 === 0 ? 'open' : 'sale',
        currency: 'KRW',
        tax: wt === 'isawrap' ? ['isa'] : i % 3 === 0 ? ['isa'] : ['none'],
        channel: wt === 'robo' ? ['online', 'app'] : ['online', 'app', 'branch'],
        minAmount: wt === 'robo' ? 30 : wt === 'isawrap' ? 100 : [500, 1000, 3000][i % 3],
        mgmtFee: num(rng, 0.3, 2.2, 2),
        aum: Math.round(num(rng, 60, 12000, 0)),
        series: s, bench: series(mulberry32(9900 + i), 8, riskVol(risk) * 0.8),
        benchName: ['자산배분 비교지수', 'Allocation benchmark'],
        sharpe: num(rng, 0.1, 1.7, 2),
        stdev: num(rng, 2, 18, 1),
        launch: addMonths(AS_OF, -Math.round(num(rng, 10, 96, 0))),
        holdings: [
          [['주식', 'Equity'], st[1].indexOf('Bond') >= 0 ? 12 : st[1].indexOf('Allocation') >= 0 ? 55 : 88],
          [['채권', 'Fixed income'], st[1].indexOf('Bond') >= 0 ? 84 : st[1].indexOf('Allocation') >= 0 ? 38 : 6],
          [['대체·리츠', 'Alternatives'], st[1].indexOf('Infra') >= 0 ? 70 : 2],
          [['유동성', 'Cash'], 4]
        ]
      });
    }
  })();

  /* --- 연금·절세 14건 ------------------------------------------------------ */
  (function () {
    for (var i = 0; i < 14; i++) {
      var rng = mulberry32(7000 + i * 19);
      var pt = PEN_TYPE[i % PEN_TYPE.length][0];
      var pp = PEN_PORT[(i * 3) % PEN_PORT.length];
      var risk = pp[2] === 'bdf' ? 5 : pp[2] === 'mxf' || pp[2] === 'tdf' ? 4 : 2;
      var s = series(rng, num(rng, 3, 17, 1), riskVol(risk));
      push({
        cat: 'pension',
        name: [(pt === 'irp' ? 'IRP' : pt === 'psave' ? '연금저축' : pt === 'isa' ? 'ISA' : 'DC') + ' ' + pp[0] + ' 포트폴리오',
          (pt === 'irp' ? 'IRP' : pt === 'psave' ? 'Pension Savings' : pt === 'isa' ? 'ISA' : 'DC') + ' ' + pp[1] + ' Portfolio'],
        code: 'P' + (400 + i * 3),
        provider: ['미래에셋증권', 'Mirae Asset Securities'],
        risk: risk, region: pp[1].indexOf('US') >= 0 ? 'us' : 'gl',
        asset: pp[2] === 'bdf' ? 'bd' : pp[2] === 'eqf' ? 'eq' : 'mx',
        penType: pt, fundType: pp[2],
        status: 'sale', currency: 'KRW',
        tax: pt === 'isa' ? ['isa', 'sep'] : ['pension', 'sep'],
        channel: ['online', 'app', 'branch'],
        minAmount: pt === 'isa' ? 1 : 10,
        fee: num(rng, 0.12, 1.1, 2),
        taxCredit: pt === 'irp' ? 900 : pt === 'psave' ? 600 : 0,
        aum: Math.round(num(rng, 200, 26000, 0)),
        series: s, bench: series(mulberry32(9950 + i), 7, riskVol(risk) * 0.85),
        benchName: ['연금 비교지수', 'Pension benchmark'],
        sharpe: num(rng, 0.2, 1.6, 2),
        stdev: num(rng, 1.8, 16, 1),
        launch: addMonths(AS_OF, -Math.round(num(rng, 12, 110, 0))),
        holdings: [
          [['주식', 'Equity'], pp[2] === 'eqf' ? 90 : pp[2] === 'bdf' ? 10 : 52],
          [['채권', 'Fixed income'], pp[2] === 'bdf' ? 86 : pp[2] === 'eqf' ? 6 : 42],
          [['대체·리츠', 'Alternatives'], 2],
          [['유동성', 'Cash'], 4]
        ]
      });
    }
  })();

  /* 파생 지표(시계열에서 계산) 채우기 — 표/차트/정렬이 같은 값을 쓰도록 한 곳에서 처리 */
  PRODUCTS.forEach(function (p) {
    if (p.series) {
      p.ret1m = chg(p.series, 1);
      p.ret3m = chg(p.series, 3);
      p.ret6m = chg(p.series, 6);
      p.ret1y = chg(p.series, 12);
      p.ret3y = Math.round((p.ret1y * 2.3 + (p.risk - 3) * 1.7) * 10) / 10;
      p.mdd = mdd(p.series);
      p.excess = Math.round((p.ret1y - chg(p.bench, 12)) * 10) / 10;
    }
    /* 정렬 공통 키: 상품군마다 "대표 수익률/금리" 위치가 달라 하나로 정규화 */
    p.sortRate = p.cat === 'els' ? p.coupon : p.cat === 'bond' ? p.ytm : p.cat === 'rp' ? p.rate : (p.ret1y || 0);
    p.sortFee = p.fee != null ? p.fee : p.mgmtFee != null ? p.mgmtFee : 0;
    p.searchKey = [p.name[0], p.name[1], p.code, p.provider[0], p.provider[1],
      (p.underlying || []).join(' '), p.etfIndex || '', (p.strategy || [])[0] || ''].join(' ').toLowerCase();
  });

  return {
    AS_OF: AS_OF,
    CATEGORIES: CATEGORIES,
    REGION: REGION, ASSET: ASSET, STATUS: STATUS, CHANNEL: CHANNEL, TAX: TAX, CCY: CCY,
    RISK: RISK, FUND_TYPE: FUND_TYPE, ETF_BRAND: ETF_BRAND, ELS_TYPE: ELS_TYPE,
    UNDERLYING: UNDERLYING, RATING: RATING, BOND_TYPE: BOND_TYPE, RP_TYPE: RP_TYPE,
    WRAP_TYPE: WRAP_TYPE, PEN_TYPE: PEN_TYPE,
    I18N: I18N,
    FILTER_SCHEMA: FILTER_SCHEMA,
    PRODUCTS: PRODUCTS,
    labelOf: labelOf,
    byId: function (id) {
      for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
      return null;
    }
  };
})();
