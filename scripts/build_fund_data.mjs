#!/usr/bin/env node
/**
 * 수집 결과를 화면이 읽는 한 덩어리로 합친다.
 *
 *   node scripts/build_fund_data.mjs
 *   data/fund-kr.js  ->  data/fund.js  (window.FUND_DATA)
 *
 * 여기서 하는 일은 셋이다.
 *   1. 화면이 정렬·필터에 쓸 파생값을 붙인다 (보유종목 수·집중도·현금 표)
 *   2. 화면이 쓸 이름표(한/영)를 붙인다
 *   3. 수집 파일이 없으면 예시 데이터를 만든다 — 한 번도 수집되지 않은
 *      상태에서도 화면이 열려야 하고, 그때는 "예시 데이터" 배지가 붙는다
 *
 * **분류는 여기서 만들지 않는다.** ETF 는 이름과 기초지수를 보고 우리가
 * 지역·자산군을 지어내야 했지만, 펀드는 원천이 `parentPeerGroupName` 으로
 * 이미 유형을 준다(국내주식형·해외채권형·MMF·국내대체 …).
 *
 * **다만 투자지역은 그 유형명에서 읽으면 안 된다.** 처음에는 앞머리에서
 * 읽었는데(“해외주식형” → 해외) 재검증에서 표본 318개 중 34개(10.7%)가
 * 1차 출처와 어긋났다. 금투협은 투자지역을 국내·해외·**혼합** 셋으로
 * 분류하는데 네이버 유형명의 “혼합” 은 자산(주식+채권)을 뜻하기 때문이다.
 * 그래서 투자지역만 금투협에서 직접 받아 여기서 덮는다
 * (tools/discovery/fund_reverify_region.md).
 */

import { readFile, access } from 'node:fs/promises';
import { writeDataFile } from './etf_lib.mjs';

const OUT = 'data/fund.js';

/** window.X = {...}; 꼴 파일을 읽어 값을 꺼낸다. */
async function loadDataFile(path, globalName) {
  try { await access(path); } catch { return null; }
  const src = await readFile(path, 'utf8');
  const sandbox = { window: {} };
  // eslint-disable-next-line no-new-func
  new Function('window', src)(sandbox.window);
  return sandbox.window[globalName] || null;
}

/**
 * 보유종목 중 현금성 항목.
 *
 * ETF 와 같은 이유로 가른다. 현금을 종목으로 세면 집중도가 뜻을 잃고,
 * 두 펀드가 둘 다 현금을 들고 있다고 "겹친다" 고 말하게 된다.
 * 표시는 하되(실제로 자료에 있는 항목이다) 계산에서는 뺀다.
 */
const CASH_LIKE = /^(원화현금|외화현금|설정현금액|현금|예금|단기예치금|콜론|CASH|Cash( and| &)? Other)/i;

// 화면에 싣는 기간. 원천의 term 이름을 그대로 쓴다.
const PERIODS = [
  ['1d', '1일', '1D'], ['1w', '1주', '1W'], ['1m', '1개월', '1M'],
  ['3m', '3개월', '3M'], ['6m', '6개월', '6M'], ['9m', '9개월', '9M'],
  ['ytd', '연초이후', 'YTD'], ['1y', '1년', '1Y'], ['2y', '2년', '2Y'],
  ['3y', '3년', '3Y'], ['5y', '5년', '5Y'],
];

// 위험이 높은 것부터. 화면의 셀렉트 박스가 이 차례를 쓴다 —
// 알파벳순으로 두면 "낮은 위험" 이 "높은 위험" 앞에 와서 읽히지 않는다.
const RISK_ORDER = ['veryHighRisk', 'highRisk', 'moderatelyHighRisk',
                    'moderateRisk', 'lowRisk', 'veryLowRisk'];

const LABELS = {
  // 투자지역은 **1차 출처(금융투자협회)** 가 국내·해외·혼합 셋으로 나눈다.
  // 네이버 유형명 앞머리에서 읽던 방식은 "혼합" 을 표현하지 못해 10.7% 가
  // 틀렸다(tools/discovery/fund_reverify_region.md).
  region: {
    domestic: { ko: '국내 투자', en: 'Domestic' },
    overseas: { ko: '해외 투자', en: 'Overseas' },
    mixed: { ko: '국내·해외 혼합', en: 'Domestic & overseas' },
  },
  assetClass: {
    equity: { ko: '주식형', en: 'Equity' },
    bond: { ko: '채권형', en: 'Bond' },
    mixed: { ko: '혼합형', en: 'Mixed' },
    alternative: { ko: '대체', en: 'Alternative' },
    mmf: { ko: 'MMF', en: 'MMF' },
    other: { ko: '기타', en: 'Other' },
  },
  // 위험등급은 숫자가 아니라 **문자열**로 온다. 처음에 1~6 의 숫자로 짐작하고
  // 감사 규칙을 걸었다가 3,196개 중 3,195개를 헛잡았다 — 규칙이 대량으로
  // 잡으면 자료가 아니라 규칙을 의심해야 한다는 것을 다시 확인한 자리다.
  //
  // 실제 값은 여섯 가지뿐이고, 국내 공모펀드의 6단계 위험등급과 하나씩 맞는다.
  // 다만 **등급 번호는 원천이 주지 않으므로 붙이지 않는다.** 이름만 옮긴다.
  riskGrade: {
    veryHighRisk: { ko: '매우 높은 위험', en: 'Very high risk' },
    highRisk: { ko: '높은 위험', en: 'High risk' },
    moderatelyHighRisk: { ko: '다소 높은 위험', en: 'Moderately high risk' },
    moderateRisk: { ko: '보통 위험', en: 'Moderate risk' },
    lowRisk: { ko: '낮은 위험', en: 'Low risk' },
    veryLowRisk: { ko: '매우 낮은 위험', en: 'Very low risk' },
  },
  dropReason: {
    step: { ko: '기준가 재산정 구간', en: 'base-price restatement' },
    mismatch: { ko: '기준가 재계산과 불일치', en: 'disagrees with recomputation' },
  },
};

/**
 * 화면이 쓸 파생값을 붙인다.
 *
 * 여기서 제일 조심할 것은 **없는 것을 0 이라고 말하지 않는 것**이다.
 * `Number(null)` 은 `0` 이고 `Number.isFinite(0)` 은 `true` 다. 이 함정으로
 * ETF 화면 731종목이 "비중 0%" 라는 거짓을 말했다. 비중이 하나라도 없으면
 * 합계를 내지 않는다 — 빈칸은 모른다는 뜻이지만 0 은 안다는 뜻이다.
 */
function finish(f) {
  const holdings = f.holdings
    ? f.holdings.map((h) => (CASH_LIKE.test(h.name || '') ? { ...h, cash: true } : h))
    : null;
  const stocks = (holdings || []).filter((h) => !h.cash);

  const known = (h) => h.weight != null && Number.isFinite(Number(h.weight));
  const sumWeights = (rows) => {
    if (!rows.length) return null;
    if (!rows.every(known)) return null;            // 하나라도 모르면 합계를 내지 않는다
    return +rows.reduce((s, h) => s + Number(h.weight), 0).toFixed(2);
  };

  // 펀드는 ETF 와 달리 **전체 보유종목**을 준다(40~72개). 그래서 "상위 10개
  // 합계" 는 ETF 에서와 다른 뜻을 갖는다 — ETF 는 받은 게 상위 10개뿐이라
  // 그 합이 곧 아는 전부였지만, 펀드는 전체 중 상위 10개다. 이름을 나눠
  // 둘을 구별한다.
  const sorted = stocks.slice().sort((a, b) => {
    if (!known(a) || !known(b)) return 0;
    return Number(b.weight) - Number(a.weight);
  });
  const top10Weight = sumWeights(sorted.slice(0, 10));
  const totalWeight = sumWeights(stocks);
  const cashWeight = sumWeights((holdings || []).filter((h) => h.cash));

  // 수익률이 하나라도 남았는가. 계단 때문에 통째로 비는 펀드가 있다.
  const retCount = f.ret ? Object.keys(f.ret).length : 0;

  // ── 총보수 ────────────────────────────────────────────────────────────
  //
  // 인수인계 문서는 "총보수를 못 받는다" 고 적었고 나도 그렇게 믿었다.
  // **절반만 맞았다.** 펀드 자체의 `detail.totalFee` 는 거의 다 null 이지만,
  // `left-panel.returns.classes[]` 의 **클래스별 총보수는 채워져 있다** —
  // 19,092개 클래스 중 18,712개(98%).
  //
  // 국내 공모펀드의 보수는 원래 클래스마다 다르다. 신한골드증권투자신탁 1 은
  // 클래스가 18개이고 종류C-pe 가 1.04%, 종류C-p 가 1.39% 다. 그래서
  // **하나의 숫자로 줄이면 거짓**이 된다 — 어느 클래스를 산 사람에게도
  // 맞지 않는 값이 되기 때문이다.
  //
  // 범위로 싣는다. 화면은 "1.04% ~ 1.39%" 로 찍고 클래스별 표를 함께 둔다.
  const classes = Array.isArray(f.classes) ? f.classes : [];
  const fees = classes
    .map((c) => c.totalFee)
    .filter((v) => v != null && Number.isFinite(Number(v)) && Number(v) > 0)
    .map(Number)
    .sort((a, b) => a - b);
  const feeMin = fees.length ? +fees[0].toFixed(3) : null;
  const feeMax = fees.length ? +fees[fees.length - 1].toFixed(3) : null;

  return {
    ...f,
    holdings,
    holdingCount: stocks.length,
    top10Weight,
    totalWeight,
    cashWeight,
    // false 면 화면은 비중 칸을 비우고 순서만 뜻이 있다고 밝혀야 한다
    weightsKnown: stocks.length > 0 && totalWeight != null,
    retCount,
    // 클래스별 총보수의 범위. 하나의 숫자로 줄이지 않는다 — 클래스마다
    // 다른 값이라 어느 하나를 고르면 나머지 클래스에 대해 거짓이 된다.
    feeMin,
    feeMax,
    feeCount: fees.length,
    classCount: classes.length,
    // 계단이 있는 펀드는 화면이 그 사실을 밝혀야 한다. 빈칸이 왜 빈칸인지
    // 말하지 않으면 "자료가 없나 보다" 로 읽히고, 그건 사실과 다르다.
    hasStep: !!(f.steps && f.steps.length),
  };
}

// ───────────────────────── 예시 데이터 ─────────────────────────
// 한 번도 수집되지 않았을 때 화면을 채운다. 실제 수치가 아니다.
// 표준코드를 씨앗으로 삼아 매번 같은 값이 나오게 만든다 — 화면을 고칠 때마다
// 숫자가 흔들리면 무엇이 바뀐 건지 알 수 없다.
function sampleData() {
  const seedRand = (seed) => {
    let x = [...String(seed)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 2147483647;
    return () => { x = (x * 48271) % 2147483647; return x / 2147483647; };
  };

  const SPECS = [
    ['K55301D00001', '미래에셋코어테크증권자투자신탁 1(주식)', '미래에셋자산운용', '국내주식형',
     'KOSPI', ['삼성전자', 'SK하이닉스', 'SK스퀘어', '삼성전기', '한화에어로스페이스',
               'HD현대일렉트릭', '두산에너빌리티', 'LG에너지솔루션', 'NAVER', '카카오']],
    ['K55105D00002', '삼성글로벌테크증권자투자신탁H[주식]', '삼성자산운용', '해외주식형',
     'MSCI AC WORLD INDEX', ['NVIDIA Corp', 'Microsoft Corp', 'Apple Inc', 'Broadcom Inc',
               'Alphabet Inc', 'Amazon.com Inc', 'Meta Platforms Inc', 'Taiwan Semiconductor',
               'Tesla Inc', 'Netflix Inc']],
    ['K55235D00003', '피델리티글로벌배당인컴증권자투자신탁(주식-재간접형)', '피델리티자산운용',
     '해외주식형', 'MSCI AC WORLD INDEX', ['Unilever PLC', 'Roche Holding AG', 'Nestle SA',
               'Deutsche Telekom AG', 'Cisco Systems Inc']],
    ['K55205D00004', '미래에셋안정형증권자투자신탁 1[채권혼합]', '미래에셋자산운용', '국내혼합형',
     'KIS 종합채권지수', ['삼성전자', 'SK하이닉스', '국고채권 03000-3509', '국고채권 02750-3406',
               '통안증권 02950-2806']],
    ['K55309D00005', '한국단기채증권투자신탁 1[채권]', '한국투자신탁운용', '국내채권형', 'KIS 단기채권', []],
    ['K55101D00006', '한국투자글로벌인컴증권자투자신탁(채권-재간접형)', '한국투자신탁운용',
     '해외채권형', 'Bloomberg Global Aggregate', ['AB FCP I - American Income Portfolio S1']],
    ['K55232D00007', 'NH-Amundi코리아배당주증권투자신탁[주식]', 'NH-Amundi자산운용', '국내주식형',
     'KOSPI', ['KB금융', '신한지주', '하나금융지주', '삼성전자', 'SK텔레콤',
               'KT&G', '기아', '현대차', '삼성화재', 'POSCO홀딩스']],
    ['K55223D00008', 'KB중국본토주식증권자투자신탁(주식)', 'KB자산운용', '해외주식형',
     'CSI 300', ['Kweichow Moutai Co Ltd', 'Contemporary Amperex Technology',
               'Ping An Insurance Group', 'China Merchants Bank', 'BYD Co Ltd']],
    ['K55105D00009', '삼성스마트MMF법인 1Cp', '삼성자산운용', 'MMF', null, []],
    ['K55373D00010', '유리트리플알파연금저축증권자투자신탁[주식혼합]', '유리자산운용', '국내대체',
     'KOSPI 200', ['삼성전자', 'SK하이닉스', 'SK스퀘어', 'NAVER', '삼성바이오로직스']],
  ];

  const splitType = (t) => {
    const region = t.startsWith('국내') ? 'domestic' : t.startsWith('해외') ? 'overseas' : null;
    const rest = t.replace(/^(국내|해외)/, '');
    const assetClass = /주식/.test(rest) ? 'equity' : /채권/.test(rest) ? 'bond'
      : /혼합/.test(rest) ? 'mixed' : /대체/.test(rest) ? 'alternative'
      : /MMF/i.test(t) ? 'mmf' : 'other';
    return { region, assetClass };
  };

  return SPECS.map(([code, name, company, type, benchmarkName, holdingNames]) => {
    const rand = seedRand(code);
    const { region, assetClass } = splitType(type);

    let remaining = 25 + rand() * 50;
    const holdings = holdingNames.map((hn, i) => {
      const w = i === holdingNames.length - 1 ? remaining : remaining * (0.25 + rand() * 0.2);
      remaining -= w;
      return { code: null, name: hn, weight: +w.toFixed(4) };
    });
    // 마지막 종목은 **아주 작은 비중**으로 둔다. 원천에는 0.000000045 같은
    // 값이 실제로 있고, 화면이 그것을 "0.00%" 로 뭉개면 담은 것을 안 담았다고
    // 말하는 셈이다. 예시에도 그 자리를 만들어 두어야 시험이 늘 돈다.
    if (holdings.length) holdings[holdings.length - 1].weight = 0.0000045;

    // 설정일을 먼저 정한다. 수익률은 설정일이 허락하는 기간까지만 만든다 —
    // 설정 4년 된 펀드에 5년 수익률을 채워 넣으면 감사가 (옳게) 오류로 잡는다.
    // 예시가 감사를 통과하지 못하면, 수집이 한 번도 안 돈 저장소에서 관문이
    // 막혀 버린다.
    const ageYears = 1 + rand() * 12;
    const inception = new Date(Date.UTC(2026, 7, 27) - ageYears * 365.25 * 864e5)
      .toISOString().slice(0, 10);
    const NEED = { '1d': 0, '1w': 0.02, '1m': 1 / 12, '3m': 0.25, '6m': 0.5, '9m': 0.75,
                   ytd: 0.65, '1y': 1, '2y': 2, '3y': 3, '5y': 5 };

    const ret = {};
    const retBenchmark = {};
    for (const [k] of PERIODS) {
      if ((NEED[k] ?? 0) > ageYears) continue;
      const scale = k === '1d' ? 1 : k === '1w' ? 3 : k === '1m' ? 8
                  : k === '3m' ? 15 : k === '6m' ? 25 : k === '1y' ? 40 : 70;
      const base = (rand() - 0.38) * scale;
      ret[k] = +base.toFixed(4);
      if (benchmarkName) retBenchmark[k] = +(base + (rand() - 0.5) * scale * 0.4).toFixed(4);
    }

    // 설정액·순자산·기준가는 원천에서 하나의 항등식으로 묶여 있다.
    //
    //   순자산 / 설정액 == 기준가 / 1000        (407종목 중 393종목이 1% 안)
    //
    // 설정액이 **설정원본**(액면 1,000 기준)이기 때문이다. 셋을 따로 뽑으면
    // 감사가 (옳게) 오류로 잡는다. 예시가 감사를 통과하지 못하면 수집이 한
    // 번도 안 돈 저장소에서 관문이 막혀 버린다.
    const basePrice = +(1000 + rand() * 5000).toFixed(2);
    const aum = Math.round((0.005 + rand() * 3) * 1e12);
    const nav = Math.round(aum * (basePrice / 1000));

    return {
      id: `FUND:${code}`,
      code, name, company, type, region, assetClass, benchmarkName,
      riskGrade: RISK_ORDER[Math.floor(rand() * RISK_ORDER.length)],
      inceptionDate: inception,
      basePrice,
      // 등락률은 1일 수익률과 같은 값이어야 한다. 원천에서도 같은 값이고,
      // 감사가 둘을 대조한다.
      changeRate: ret['1d'] ?? null,
      tradeDate: '2026-08-27',
      aum,
      nav,
      totalFee: null,                       // 원천에 없다. 예시에서도 지어내지 않는다.
      ret,
      // 예시에서도 원천 값과 실은 값이 같아야 한다. 감사가 둘을 대조하는데
      // 한쪽이 비면 "원천 없음" 경고가 예시에서만 잔뜩 나온다.
      retSrc: Object.assign({}, ret),
      retBenchmark: benchmarkName ? retBenchmark : null,
      retAsOf: '2026-08-27',
      metrics: assetClass === 'mmf' ? null : {
        standardDeviation: +(rand() * 25).toFixed(3),
        trackingError: +(rand() * 12).toFixed(3),
        sharpe: +((rand() - 0.3) * 2).toFixed(3),
        informationRatio: +((rand() - 0.5) * 1.5).toFixed(3),
        jensenAlpha: +((rand() - 0.4) * 15).toFixed(3),
        beta: +(0.4 + rand() * 0.9).toFixed(3),
      },
      holdings: holdings.length ? holdings : null,
      holdingsAvailable: holdings.length > 0,
    };
  });
}

// ───────────────────────── 실행 ─────────────────────────
const kr = await loadDataFile('data/fund-kr.js', 'FUND_KR');

let funds = [];
let source = 'sample';
const sources = {};

// ── 투자지역을 1차 출처로 덮는다 ───────────────────────────────────────────
//
// 네이버 유형명 앞머리에서 읽던 값은 재검증에서 **10.7% 가 틀렸다.**
// 금투협은 투자지역을 국내·해외·혼합 셋으로 분류하는데, 네이버 유형명의
// "혼합" 은 자산(주식+채권)을 뜻해서 지역의 혼합을 표현할 수 없다.
// MMF·기타형 344개는 유형명에 지역이 없어 비어 있었는데 금투협에는 값이 있다.
//
// 그래서 금투협 값이 있으면 그것을 쓰고, 어디서 온 값인지 표시한다.
// 금투협이 막혀 값이 없으면 **비운다** — 네이버 값으로 되돌아가지 않는다.
// 10.7% 틀린다는 것을 이미 알면서 쓰는 것은 아는 거짓을 싣는 것이다.
const regionData = await loadDataFile('data/fund-region.js', 'FUND_REGION');
const REGION = regionData?.region || null;
function applyRegion(f) {
  if (!REGION) {
    // 1차 출처를 아직 못 받았다. 네이버 유형명에서 읽은 값을 쓰되 그렇게 밝힌다.
    return { ...f, regionSource: f.region ? 'naver-type' : null };
  }
  const k = REGION[f.code];
  if (k) return { ...f, region: k, regionSource: 'kofia' };
  return { ...f, region: null, regionSource: null, regionMissing: true };
}

if (kr?.funds?.length) {
  funds = kr.funds.map(applyRegion).map(finish);
  sources.kr = {
    updatedAt: kr.updatedAt, count: kr.count, listCount: kr.listCount,
    withHoldings: kr.withHoldings, withRet: kr.withRet,
    withStep: kr.withStep, droppedCells: kr.droppedCells,
    source: '네이버 Npay 증권',
  };
  if (regionData) {
    sources.region = {
      updatedAt: regionData.updatedAt, count: regionData.count, total: regionData.total,
      distribution: regionData.distribution,
      changedFromNaver: regionData.changedFromNaver,
      filledFromBlank: regionData.filledFromBlank,
      source: '금융투자협회 전자공시 (1차 출처)',
    };
  }
  source = 'live';
} else {
  console.log('[build] 수집 파일이 없다 — 예시 데이터로 만든다');
  funds = sampleData().map(finish);
}

// 유형은 원천이 준 이름을 그대로 쓴다. 화면의 순위·유형평균이 이 이름으로
// 무리를 가르므로, 어떤 유형이 몇 개인지 같이 실어 화면이 셀렉트 박스를
// 만들 수 있게 한다.
const typeCounts = {};
for (const f of funds) {
  const t = f.type || '(미상)';
  typeCounts[t] = (typeCounts[t] || 0) + 1;
}
const typeOrder = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t]) => t);

const companyCounts = {};
for (const f of funds) {
  if (f.company) companyCounts[f.company] = (companyCounts[f.company] || 0) + 1;
}

const payload = {
  updatedAt: new Date().toISOString(),
  source,                                   // 'live' | 'sample'
  sources,
  labels: LABELS,
  periods: PERIODS,
  riskOrder: RISK_ORDER,
  typeOrder,
  typeCounts,
  companyOrder: Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).map(([c]) => c),
  count: funds.length,
  // 화면이 "총보수는 왜 없나" 를 스스로 말할 수 있게 근거를 같이 싣는다.
  // 근거를 별도 문서로 빼 두면 배포할 파일이 둘이 되고, 언젠가 한쪽만
  // 돌아다니게 된다.
  notes: {
    totalFee: {
      ko: '총보수는 **펀드 단위로는** 원천에 없습니다(목록·상세 모두 null). ' +
          '다만 **클래스별 총보수는 있습니다** — 클래스 19,092개 중 18,712개(98%). ' +
          '국내 공모펀드의 보수는 원래 클래스마다 다르므로, 하나의 숫자로 줄이지 ' +
          '않고 클래스별 범위(최저~최고)로 싣고 클래스별 표를 함께 둡니다. ' +
          '어느 클래스를 사느냐에 따라 실제 보수가 달라집니다.',
      en: 'A fund-level expense ratio is absent from the source, but **per-share-class ' +
          'fees are present** — 18,712 of 19,092 classes (98%). Korean fund fees differ ' +
          'by share class, so a single number would be wrong for every class but one. ' +
          'The range (lowest to highest) is shown, with the per-class table beside it.',
    },
    region: {
      ko: '투자지역은 **금융투자협회 전자공시(1차 출처)** 에서 직접 받습니다. ' +
          '국내·해외·**혼합** 셋으로 나뉩니다. 처음에는 네이버 유형명의 앞머리에서 ' +
          '읽었는데(“해외주식형” → 해외), 재검증에서 표본 318개 중 34개(10.7%)가 ' +
          '1차 출처와 어긋났습니다 — 네이버 유형명의 “혼합” 은 자산(주식+채권)을 ' +
          '뜻해서 지역의 혼합을 표현할 수 없기 때문입니다. 특히 해외혼합형은 ' +
          '표본 35개 중 20개가 실제로는 “혼합” 이었습니다.',
      en: 'Investment region comes directly from KOFIA electronic disclosure (primary ' +
          'source), split into domestic / overseas / **mixed**. It was previously read ' +
          'from the head of Naver’s category name, which disagreed with the primary ' +
          'source in 34 of 318 sampled funds (10.7%) — Naver’s "mixed" refers to the ' +
          'asset mix, not the region.',
    },
    step: {
      ko: '기준가 계열에 재산정 계단이 있는 펀드는 그 구간의 수익률을 ' +
          '비웠습니다. 계단 앞뒤의 기준가는 같은 자로 잰 것이 아니므로 ' +
          '나누어도 수익률이 아닙니다.',
      en: 'Where the base-price series contains a restatement step, returns ' +
          'spanning it are left blank — prices either side of a step are not ' +
          'measured on the same scale.',
    },
  },
  funds,
};

/**
 * 값이 없는 칸은 파일에서 아예 뺀다.
 *
 * 3,200종목 × 30여 개 필드라 null 만 모아도 수백 KB 다. 이 파일은 매일
 * 갱신되어 저장소에 쌓이므로 줄여 두는 편이 낫다. 자바스크립트에서 없는
 * 키와 null 은 `== null` 로 똑같이 걸리므로 화면 쪽은 고칠 것이 없다.
 */
function prune(v) {
  if (Array.isArray(v)) return v.map(prune);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      const p = prune(val);
      if (p === null || p === undefined) continue;
      if (Array.isArray(p) && !p.length) continue;
      if (p && typeof p === 'object' && !Array.isArray(p) && !Object.keys(p).length) continue;
      out[k] = p;
    }
    return out;
  }
  return v;
}

await writeDataFile(OUT, 'FUND_DATA', prune(payload),
  `국내 설정 공모펀드 — ${source === 'live' ? '수집본' : '예시'} ${new Date().toISOString()}`);

// 만들어 놓고 눈으로 확인할 수 있게 요약을 찍는다.
const by = (fn) => {
  const m = {};
  for (const f of funds) { const k = fn(f) ?? '(없음)'; m[k] = (m[k] || 0) + 1; }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
console.log(`[build] ${funds.length}개 · 보유종목 ${funds.filter((f) => f.holdingCount).length}` +
            ` · 수익률 ${funds.filter((f) => f.retCount).length} · 계단 ${funds.filter((f) => f.hasStep).length}`);
console.log('[build] 투자지역:', JSON.stringify(Object.fromEntries(by((f) => f.region))));
console.log('[build] 자산군:', JSON.stringify(Object.fromEntries(by((f) => f.assetClass))));
console.log('[build] 유형 상위:', JSON.stringify(Object.fromEntries(by((f) => f.type).slice(0, 10))));
console.log('[build] 운용사 상위:', JSON.stringify(Object.fromEntries(by((f) => f.company).slice(0, 8))));
