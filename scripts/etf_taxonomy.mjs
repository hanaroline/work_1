/**
 * ETF 분류 사전 — 사람이 직접 고치는 파일.
 *
 * ETF 이름에는 그 상품이 무엇인지가 거의 다 들어 있다("TIGER 미국나스닥100
 * 커버드콜", "KODEX 200선물인버스2X"). 자동 분류는 이 이름을 규칙으로 읽는다.
 * 규칙이므로 반드시 틀리는 칸이 생긴다. 틀린 칸을 고치는 곳이 여기다.
 *
 *   - 새 테마가 생겼다  -> THEMES 에 한 줄 추가
 *   - 엉뚱하게 붙었다   -> 그 테마의 not 에 단어 추가
 *   - 특정 종목만 다르다 -> OVERRIDES 에 종목코드로 못 박는다 (규칙보다 우선)
 *
 * 고친 뒤에는 수집을 다시 돌리지 않아도 된다. 태깅은 수집기가 아니라
 * 이 파일을 읽는 빌드 단계에서 붙으므로, 규칙만 고쳐 다시 빌드하면 된다.
 */

// ───────────────────────── 운용사 ─────────────────────────
// 국내 ETF 는 브랜드 접두어가 곧 운용사다. KRX 응답에도 운용사 필드가 있지만
// 화면 표기(브랜드)와 법인명이 달라, 브랜드를 앞세우고 법인명을 함께 들고 간다.
export const KR_BRANDS = [
  ['TIGER', '미래에셋자산운용', 'Mirae Asset'],
  ['KODEX', '삼성자산운용', 'Samsung'],
  ['RISE', 'KB자산운용', 'KB'],
  ['KBSTAR', 'KB자산운용', 'KB'],              // RISE 로 바뀌기 전 이름
  ['ACE', '한국투자신탁운용', 'Korea Investment'],
  ['KINDEX', '한국투자신탁운용', 'Korea Investment'],  // ACE 로 바뀌기 전 이름
  ['SOL', '신한자산운용', 'Shinhan'],
  ['PLUS', '한화자산운용', 'Hanwha'],
  ['ARIRANG', '한화자산운용', 'Hanwha'],        // PLUS 로 바뀌기 전 이름
  ['히어로즈', '키움투자자산운용', 'Kiwoom'],
  ['KOSEF', '키움투자자산운용', 'Kiwoom'],
  ['TIMEFOLIO', '타임폴리오자산운용', 'Timefolio'],
  ['BNK', 'BNK자산운용', 'BNK'],
  ['WON', '우리자산운용', 'Woori'],
  ['하나', '하나자산운용', 'Hana'],
  ['1Q', '하나자산운용', 'Hana'],
  ['마이다스', '마이다스에셋자산운용', 'Midas'],
  ['파워', '교보악사자산운용', 'Kyobo AXA'],
  ['에셋플러스', '에셋플러스자산운용', 'Assetplus'],
  ['UNICORN', '현대자산운용', 'Hyundai'],
  ['다올', '다올자산운용', 'Daol'],
  ['드림', 'DB자산운용', 'DB'],
  ['마이티', 'DB자산운용', 'DB'],
  ['FOCUS', '브이아이자산운용', 'VI'],
  ['트루', '흥국자산운용', 'Heungkuk'],
  ['korbit', '기타', 'Other'],
];

// 해외는 Yahoo 의 fundProfile.family 문자열이 제각각이라 대표 이름으로 모은다.
export const GLOBAL_FAMILIES = [
  [/blackrock|ishares/i, 'BlackRock (iShares)'],
  [/vanguard/i, 'Vanguard'],
  [/state street|spdr|ssga/i, 'State Street (SPDR)'],
  [/invesco|powershares/i, 'Invesco'],
  [/charles schwab|schwab/i, 'Schwab'],
  [/first trust/i, 'First Trust'],
  [/j\.?p\.? ?morgan|jpmorgan/i, 'J.P. Morgan'],
  [/global x/i, 'Global X'],
  [/wisdomtree/i, 'WisdomTree'],
  [/vaneck/i, 'VanEck'],
  [/proshares/i, 'ProShares'],
  [/direxion/i, 'Direxion'],
  [/ark /i, 'ARK Invest'],
  [/dimensional/i, 'Dimensional'],
  [/fidelity/i, 'Fidelity'],
  [/amundi|lyxor/i, 'Amundi'],
  [/xtrackers|dws/i, 'Xtrackers (DWS)'],
  [/ubs/i, 'UBS'],
  [/hsbc/i, 'HSBC'],
  [/nomura|野村/i, 'Nomura'],
  [/nikko/i, 'Nikko AM'],
  [/daiwa|大和/i, 'Daiwa'],
  [/mitsubishi|mufg/i, 'MUFG'],
  [/hang seng/i, 'Hang Seng Investment'],
  [/china asset|csop|e fund|harvest|bosera/i, 'China Managers'],
  [/mirae|global x korea/i, 'Mirae Asset'],
  [/samsung/i, 'Samsung'],
];

// ───────────────────────── 투자 지역 ─────────────────────────
// "어디에 투자하는가"이지 "어디에 상장됐는가"가 아니다. 상장지는 따로 들고 간다.
// 국내 ETF 이름에 지역이 없으면 한국으로 본다(국내 ETF 의 기본값).
export const REGIONS = [
  ['us',        '미국',        'United States',  ['미국', 'S&P', 'SNP', '나스닥', 'NASDAQ', '다우', 'DOW', '러셀', 'RUSSELL', 'US ', 'U.S.', 'AMERICA', 'S&P500', '필라델피아']],
  ['china',     '중국',        'China',          ['중국', 'CHINA', 'CSI', '항셍', 'HANG SENG', 'HSCEI', '심천', 'SHENZHEN', '상해', 'SHANGHAI', 'A주', 'MSCI CHINA', 'KRAENZ']],
  ['japan',     '일본',        'Japan',          ['일본', 'JAPAN', '닛케이', 'NIKKEI', 'TOPIX', 'JPX']],
  ['europe',    '유럽',        'Europe',         ['유럽', 'EUROPE', 'EURO', 'DAX', 'STOXX', '독일', 'GERMANY', '프랑스', 'FRANCE', 'CAC', 'FTSE 100', '영국', 'UK ']],
  ['india',     '인도',        'India',          ['인도', 'INDIA', 'NIFTY', 'SENSEX']],
  ['vietnam',   '베트남',      'Vietnam',        ['베트남', 'VIETNAM', 'VN30']],
  ['taiwan',    '대만',        'Taiwan',         ['대만', 'TAIWAN', 'TWSE']],
  ['emerging',  '신흥국',      'Emerging',       ['신흥국', 'EMERGING', 'EM ', '이머징']],
  ['global',    '글로벌',      'Global',         ['글로벌', 'GLOBAL', '선진국', 'DEVELOPED', 'WORLD', '월드', 'ACWI', 'EAFE', '전세계']],
  ['korea',     '한국',        'Korea',          ['코스피', 'KOSPI', '코스닥', 'KOSDAQ', 'KRX', '한국', 'KOREA', '200', '국고채', '국내']],
];

// ───────────────────────── 자산군 ─────────────────────────
// 위에서부터 먼저 걸리는 것으로 정한다. 채권·원자재가 주식보다 앞이어야
// "국채 ETF" 가 주식으로 새지 않는다.
export const ASSET_CLASSES = [
  ['bond',      '채권',   'Bond',        ['채권', 'BOND', '국고채', '통안채', '회사채', 'TREASURY', '국채', 'CREDIT', 'AGGREGATE', '만기매칭', 'TIPS', '물가채']],
  ['money',     '단기자금', 'Money Market', ['CD금리', 'KOFR', 'SOFR', 'MMF', '머니마켓', '초단기', '금리액티브', 'T-BILL', '단기통안']],
  ['commodity', '원자재',  'Commodity',   ['금', 'GOLD', '은', 'SILVER', '원유', 'OIL', 'WTI', '구리', 'COPPER', '천연가스', 'GAS', '농산물', '원자재', 'COMMODITY', '팔라듐', '플래티넘']],
  ['reit',      '리츠',    'REIT',        ['리츠', 'REIT', '부동산', 'REAL ESTATE', '인프라']],
  ['currency',  '통화',    'Currency',    ['달러선물', '엔선물', '유로선물', 'CURRENCY', '외환']],
  ['crypto',    '디지털자산', 'Digital Asset', ['비트코인', 'BITCOIN', '이더리움', 'ETHEREUM', '가상자산', '암호화폐', 'CRYPTO', 'BLOCKCHAIN', '블록체인']],
  ['multi',     '멀티에셋', 'Multi-Asset', ['자산배분', 'TDF', 'TRF', '멀티에셋', 'ALLOCATION', 'BALANCED', 'TARGET DATE']],
  ['equity',    '주식',    'Equity',      []],   // 마지막 기본값
];

// ───────────────────────── 상품 성격 플래그 ─────────────────────────
// 필터가 아니라 배지로 쓴다. 레버리지·인버스가 수익률 랭킹 위쪽을 다 차지하면
// 화면이 쓸모없어지므로, 목록에서 접을 수 있어야 한다.
export const FLAGS = [
  ['leverage', '레버리지', 'Leveraged', ['레버리지', '2X', '3X', '2배', 'LEVERAGED', 'ULTRA', 'BULL 3X']],
  ['inverse',  '인버스',   'Inverse',   ['인버스', 'INVERSE', '-1X', '숏', 'SHORT', 'BEAR']],
  ['covered',  '커버드콜', 'Covered Call', ['커버드콜', 'COVERED CALL', '프리미엄', 'BUYWRITE', '타겟위클리', 'DAILY OPTION']],
  ['hedged',   '환헤지',   'FX Hedged', ['(H)', '환헤지', 'HEDGED']],
  ['active',   '액티브',   'Active',    ['액티브', 'ACTIVE']],
  ['monthly',  '월배당',   'Monthly Dist.', ['월배당', '분배', 'MONTHLY']],
  ['synthetic','합성',     'Synthetic', ['(합성)', 'SYNTHETIC', '합성 H']],
];

// ───────────────────────── 테마 ─────────────────────────
// any 중 하나라도 이름에 있으면 붙고, not 이 있으면 뗀다.
// 한 ETF 에 여러 테마가 붙을 수 있다(예: "미국배당다우존스" -> 배당).
export const THEMES = [
  { id: 'semiconductor', ko: '반도체', en: 'Semiconductor',
    any: ['반도체', 'SEMICONDUCTOR', 'SOX', '필라델피아반도체', 'HBM', '메모리', 'SEMI'] },
  { id: 'ai', ko: 'AI·데이터센터', en: 'AI & Data Center',
    any: ['AI', '인공지능', 'ARTIFICIAL INTELLIGENCE', '데이터센터', 'DATA CENTER', 'GPU', '클라우드', 'CLOUD'],
    // "AI" 두 글자는 다른 단어에 섞이기 쉽다. 아래 단어가 있으면 AI 로 보지 않는다.
    not: ['CHAIN', 'SPAIN', 'MAIN', 'CAPTAIN', 'AIRLINE', '에어'] },
  { id: 'bigtech', ko: '빅테크', en: 'Big Tech',
    any: ['빅테크', 'BIG TECH', 'FANG', 'M7', '매그니피센트', 'MAGNIFICENT', 'TOP10테크'] },
  { id: 'battery', ko: '2차전지', en: 'Battery',
    any: ['2차전지', '이차전지', 'BATTERY', '배터리', '리튬', 'LITHIUM'] },
  { id: 'ev', ko: '전기차·자율주행', en: 'EV & Autonomous',
    any: ['전기차', 'ELECTRIC VEHICLE', ' EV', '자율주행', 'AUTONOMOUS', '모빌리티', 'MOBILITY'] },
  { id: 'bio', ko: '바이오·헬스케어', en: 'Bio & Healthcare',
    any: ['바이오', 'BIO', '헬스케어', 'HEALTH', '제약', 'PHARMA', '의료기기', 'MEDICAL', '비만', 'GLP-1'] },
  { id: 'defense', ko: '방산·우주항공', en: 'Defense & Aerospace',
    any: ['방산', '방위', 'DEFENSE', 'AEROSPACE', '우주', 'SPACE', '항공우주'] },
  { id: 'nuclear', ko: '원자력', en: 'Nuclear',
    any: ['원자력', 'NUCLEAR', '우라늄', 'URANIUM', 'SMR'] },
  { id: 'clean', ko: '신재생·친환경', en: 'Clean Energy',
    any: ['신재생', '친환경', 'CLEAN', '태양광', 'SOLAR', '풍력', 'WIND', '수소', 'HYDROGEN', '탄소', 'CARBON'] },
  { id: 'ship', ko: '조선·기계', en: 'Shipbuilding',
    any: ['조선', 'SHIPBUILDING', '기계', '중공업'] },
  { id: 'robot', ko: '로봇·자동화', en: 'Robotics',
    any: ['로봇', 'ROBOT', '자동화', 'AUTOMATION'] },
  { id: 'internet', ko: '인터넷·플랫폼', en: 'Internet & Platform',
    any: ['인터넷', 'INTERNET', '플랫폼', 'PLATFORM', '소프트웨어', 'SOFTWARE', 'IT'] },
  { id: 'game', ko: '게임·엔터', en: 'Game & Entertainment',
    any: ['게임', 'GAME', '엔터', 'ENTERTAIN', '미디어', 'MEDIA', 'K팝', 'KPOP', '콘텐츠'] },
  { id: 'finance', ko: '금융·은행', en: 'Financials',
    any: ['은행', 'BANK', '금융', 'FINANCIAL', '증권', '보험', 'INSURANCE'] },
  { id: 'consumer', ko: '소비재', en: 'Consumer',
    any: ['소비재', 'CONSUMER', '유통', '음식료', '화장품', 'COSMETIC', '뷰티', 'BEAUTY', '리테일', 'RETAIL'] },
  { id: 'auto', ko: '자동차', en: 'Auto',
    any: ['자동차', 'AUTO', '차부품'], not: ['자율주행', 'AUTOMATION', 'AUTONOMOUS'] },
  { id: 'dividend', ko: '배당', en: 'Dividend',
    any: ['배당', 'DIVIDEND', '고배당', 'DIVIDEND ARISTOCRAT', '다우존스', 'SCHD'] },
  { id: 'value', ko: '밸류업·가치', en: 'Value',
    any: ['밸류업', 'VALUE', '가치', '저PBR'] },
  { id: 'growth', ko: '성장', en: 'Growth',
    any: ['성장', 'GROWTH', '혁신', 'INNOVATION'] },
  { id: 'esg', ko: 'ESG', en: 'ESG',
    any: ['ESG', 'SRI', '지속가능', 'SUSTAINABLE'] },
  { id: 'smallcap', ko: '중소형', en: 'Small Cap',
    any: ['중소형', 'SMALL CAP', 'SMALLCAP', '러셀2000', 'RUSSELL 2000'] },
  { id: 'infra', ko: '인프라', en: 'Infrastructure',
    any: ['인프라', 'INFRASTRUCTURE', '건설', 'CONSTRUCTION', '전력', 'UTILITIES', '유틸리티', '전선', '변압기'] },
  { id: 'gold', ko: '금·귀금속', en: 'Precious Metals',
    any: ['금', 'GOLD', '은선물', 'SILVER', '귀금속'], not: ['금리', '금융', '기금', '자금', '현금', '요금'] },
  { id: 'energy', ko: '에너지·원자재', en: 'Energy',
    any: ['원유', 'OIL', 'WTI', '천연가스', 'ENERGY', '에너지', '원자재', 'COMMODITY', '구리', 'COPPER'] },
];

// ───────────────────────── 기초지수 정규화 ─────────────────────────
// KRX 는 기초지수명을 그대로 주고("코스피 200"), 해외는 이름에만 있다.
// 표기가 제각각이라("KOSPI200", "코스피200", "KOSPI 200") 필터가 쪼개진다.
export const INDEX_ALIASES = [
  ['KOSPI 200',      ['코스피 200', '코스피200', 'KOSPI200', 'KOSPI 200', 'K200']],
  ['KOSPI',          ['코스피', 'KOSPI'], ['200', '코스닥']],
  ['KOSDAQ 150',     ['코스닥 150', '코스닥150', 'KOSDAQ150', 'KOSDAQ 150']],
  ['KRX 300',        ['KRX 300', 'KRX300']],
  ['S&P 500',        ['S&P500', 'S&P 500', 'SNP500', 'S&P 500 지수', 'SPX']],
  ['NASDAQ 100',     ['나스닥100', '나스닥 100', 'NASDAQ100', 'NASDAQ 100', 'NDX']],
  ['Dow Jones 30',   ['다우존스', 'DOW JONES', 'DJIA'], ['배당', 'DIVIDEND']],
  ['Dow Jones US Dividend 100', ['배당다우존스', 'DIVIDEND 100', 'SCHD']],
  ['Russell 2000',   ['러셀2000', 'RUSSELL 2000']],
  ['PHLX Semiconductor', ['필라델피아반도체', 'PHLX', 'SOX']],
  ['Hang Seng',      ['항셍', 'HANG SENG', 'HSI'], ['테크', 'TECH']],
  ['Hang Seng Tech', ['항셍테크', 'HANG SENG TECH', 'HSTECH']],
  ['CSI 300',        ['CSI300', 'CSI 300']],
  ['Nikkei 225',     ['닛케이225', '닛케이 225', 'NIKKEI 225', 'NIKKEI225']],
  ['TOPIX',          ['TOPIX', '토픽스']],
  ['DAX',            ['DAX']],
  ['EURO STOXX 50',  ['STOXX 50', '유로스톡스50', 'EURO STOXX']],
  ['FTSE 100',       ['FTSE 100', 'FTSE100']],
  ['NIFTY 50',       ['NIFTY 50', 'NIFTY50', '니프티50']],
  ['MSCI World',     ['MSCI WORLD', 'MSCI 월드']],
  ['MSCI ACWI',      ['ACWI']],
  ['MSCI EM',        ['MSCI EM', 'MSCI 이머징', 'EMERGING MARKETS']],
];

// ───────────────────────── 개별 예외 ─────────────────────────
// 규칙으로는 못 잡는 칸을 종목코드(국내) / 티커(해외)로 못 박는다.
// 여기 적힌 값이 규칙 결과를 덮어쓴다.
export const OVERRIDES = {
  // '069500': { region: 'korea', themes: [] },
};

// ───────────────────────── 분류기 ─────────────────────────

/** 이름 비교는 대문자·공백 제거 기준으로 한다. "S&P 500" 과 "S&P500" 을 같게 보려고. */
function norm(s) {
  return String(s || '').toUpperCase();
}
function squeeze(s) {
  return norm(s).replace(/\s+/g, '');
}

function hasAny(haystack, needles) {
  const flat = squeeze(haystack);
  return needles.some((n) => flat.includes(squeeze(n)));
}

/**
 * ETF 한 종목을 분류한다.
 *
 * @param {object} etf  { code, name, indexName, listedIn, family }
 * @returns {object}    { region, assetClass, index, themes[], flags[], manager }
 */
export function classify(etf) {
  const name = etf.name || '';
  const hay = `${name} ${etf.indexName || ''}`;

  // 1) 운용사
  let manager = null;
  let managerEn = null;
  if (etf.listedIn === 'KR') {
    const brand = KR_BRANDS.find(([prefix]) => squeeze(name).startsWith(squeeze(prefix)));
    if (brand) { manager = brand[1]; managerEn = brand[2]; }
  }
  if (!manager && etf.family) {
    const fam = GLOBAL_FAMILIES.find(([re]) => re.test(etf.family));
    manager = managerEn = fam ? fam[1] : etf.family;
  }

  // 2) 자산군 — 앞에서부터 먼저 걸리는 것
  let assetClass = 'equity';
  for (const [id, , , words] of ASSET_CLASSES) {
    if (words.length && hasAny(hay, words)) { assetClass = id; break; }
  }

  // 3) 투자 지역 — 마찬가지로 앞에서부터. 국내 상장인데 지역 단서가 없으면 한국.
  let region = null;
  for (const [id, , , words] of REGIONS) {
    if (hasAny(hay, words)) { region = id; break; }
  }
  if (!region) region = etf.listedIn === 'KR' ? 'korea' : null;

  // 4) 기초지수 정규화
  let index = null;
  for (const [canonical, aliases, exclude] of INDEX_ALIASES) {
    if (!hasAny(hay, aliases)) continue;
    if (exclude && hasAny(hay, exclude)) continue;
    index = canonical;
    break;
  }
  if (!index && etf.indexName) index = etf.indexName;

  // 5) 플래그
  const flags = FLAGS.filter(([, , , words]) => hasAny(name, words)).map(([id]) => id);

  // 6) 테마 — 여러 개 붙을 수 있다
  const themes = THEMES
    .filter((t) => hasAny(hay, t.any) && !(t.not && hasAny(hay, t.not)))
    .map((t) => t.id);

  const out = { manager, managerEn, assetClass, region, index, flags, themes };
  const override = OVERRIDES[etf.code] || OVERRIDES[etf.ticker];
  return override ? { ...out, ...override } : out;
}

/** 화면에서 쓸 라벨 표 — 페이지가 이 표를 그대로 셀렉트 박스로 만든다. */
export function labels() {
  return {
    region: Object.fromEntries(REGIONS.map(([id, ko, en]) => [id, { ko, en }])),
    assetClass: Object.fromEntries(ASSET_CLASSES.map(([id, ko, en]) => [id, { ko, en }])),
    flag: Object.fromEntries(FLAGS.map(([id, ko, en]) => [id, { ko, en }])),
    theme: Object.fromEntries(THEMES.map((t) => [t.id, { ko: t.ko, en: t.en }])),
  };
}
