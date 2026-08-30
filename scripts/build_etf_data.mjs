#!/usr/bin/env node
/**
 * 수집 결과를 화면이 읽는 한 덩어리로 합친다.
 *
 *   node scripts/build_etf_data.mjs
 *   data/etf-kr.js + data/etf-global.js  ->  data/etf.js  (window.ETF_DATA)
 *
 * 여기서 분류(지역·자산군·기초지수·테마·성격 플래그)를 붙인다. 수집기가
 * 아니라 이 단계에서 붙이는 이유는 하나다 — **분류 사전을 고쳤을 때 1,300종목을
 * 다시 받지 않고 이 스크립트만 다시 돌리면 되게** 하려는 것이다. 사전은
 * 규칙이라 자주 고치게 되고, 수집은 몇 분씩 걸린다.
 *
 * 수집 파일이 없으면 예시 데이터를 만들어 넣는다. 한 번도 수집되지 않은
 * 상태에서도 화면이 열려야 하고, 그때는 "예시 데이터" 배지가 붙는다.
 */

import { readFile, access } from 'node:fs/promises';
import { classify, labels, THEMES } from './etf_taxonomy.mjs';
import { writeDataFile } from './etf_lib.mjs';

const OUT = 'data/etf.js';

/** window.X = {...}; 꼴 파일을 읽어 값을 꺼낸다. */
async function loadDataFile(path, globalName) {
  try {
    await access(path);
  } catch {
    return null;
  }
  const src = await readFile(path, 'utf8');
  const sandbox = { window: {} };
  // eslint-disable-next-line no-new-func
  new Function('window', src)(sandbox.window);
  return sandbox.window[globalName] || null;
}

/**
 * 편입종목 중 현금성 항목.
 *
 * 국내 PDF 에는 "원화현금"·"설정현금액" 이 종목처럼 한 줄을 차지한다. 이걸
 * 종목으로 세면 세 군데가 한꺼번에 망가진다.
 *   - 집중도(상위10 합계): 설정현금액 100% 짜리가 있어 의미가 사라진다
 *   - 중복도: 두 ETF 가 둘 다 현금을 들고 있다고 "겹친다" 고 말하게 된다
 *   - 최다 편입 종목: 삼성전자(227)보다 원화현금(259)이 위로 온다
 * 그래서 표시는 하되(실제로 PDF 에 있는 항목이다) 계산에서는 뺀다.
 */
const CASH_LIKE = /^(원화현금|외화현금|설정현금액|현금|예금|CASH|USD CASH|Cash( and| &)? Other)/i;

/** 화면에서 정렬·필터에 쓸 수 있게 값을 다듬는다. */
function finish(etf, listedIn) {
  const tag = classify({
    code: etf.code,
    ticker: etf.code,
    name: [etf.name, etf.nameKo].filter(Boolean).join(' '),
    listedIn,
    indexName: etf.indexName,
    family: etf.familyRaw,
  });

  // 현금성 항목에 표를 붙인다. 화면과 계산이 같은 판단을 쓰게 하려는 것이다.
  const holdings = etf.holdings
    ? etf.holdings.map((h) => (CASH_LIKE.test(h.name || '') ? { ...h, cash: true } : h))
    : null;
  const stocks = (holdings || []).filter((h) => !h.cash);
  const cashRows = (holdings || []).filter((h) => h.cash);

  // 상위10 합계 = 집중도. "이 ETF 가 사실상 몇 종목짜리인가"를 한 숫자로 말해 준다.
  // 현금은 뺀다 — 현금 100% 를 "집중도 100%" 라고 말하면 거짓말이 된다.
  //
  // 비중이 없는 종목이 하나라도 있으면 합계를 내지 않는다. 네이버는 해외주식·
  // 채권·원자재 ETF 의 편입종목에 **수량만 주고 비중을 주지 않는다**(668종목).
  // 예전에는 `h.weight || 0` 으로 null 을 0 으로 삼켜 화면에 "상위 종목 합계
  // 0.0%" 라고 찍었다. 없는 것을 0 이라고 말하는 건 거짓이다. 빈칸이 맞다.
  // null 을 그냥 Number() 에 넣으면 안 된다 — Number(null) 은 0 이고
  // Number.isFinite(0) 은 true 다. 네이버가 주는 weight:null 이 "아는 0" 으로
  // 둔갑해 합계가 다시 0 이 됐다. null 여부를 먼저 본다.
  const known = (h) => h.weight != null && Number.isFinite(Number(h.weight));
  const sumWeights = (rows) => {
    if (!rows.length) return null;
    if (!rows.every(known)) return null;
    return +rows.reduce((s, h) => s + Number(h.weight), 0).toFixed(2);
  };
  const top10Weight = sumWeights(stocks);
  const cashWeight = sumWeights(cashRows);
  // 화면이 "비중은 원천에 없다" 와 "비중이 0 이다" 를 구별할 수 있게 표를 붙인다.
  const weightsKnown = stocks.length > 0 && top10Weight != null;

  // ── 거래가 멈춘 종목 ──────────────────────────────────────────────────
  // ACE 러시아MSCI(합성) 은 현재가 8,535원에 기준가 48.38원, 거래량 0 이다.
  // 제재로 평가가 동결된 뒤 마지막 체결가만 남아 괴리율이 17,541% 로 찍힌다.
  // 계산이 틀린 게 아니라 그 상태를 그대로 비춘 것이다.
  //
  // 이런 종목을 순위·유형평균에 섞으면 멀쩡한 종목의 등수까지 흔들린다.
  // 그렇다고 목록에서 지우면 "보유 중인데 화면에 없다" 가 되어 더 나쁘다.
  // 그래서 **표시하되 표를 붙이고, 계산에서만 뺀다.**
  const px = Number(etf.price), navv = Number(etf.nav);
  const suspended = (Math.abs(Number(etf.premium) || 0) > 50)
    || (Number(etf.volume) === 0 && px > 0 && navv > 0 && Math.abs(px / navv - 1) > 0.5);

  // 설정액이 무엇을 센 값인지. 국내는 네이버 totalNav — 그 ETF 하나의
  // 순자산총액이므로 언제나 'etf' 다. 해외는 수집기가 뮤추얼펀드 클래스와
  // 대조해 붙여 준다('fund' 면 같은 펀드의 다른 클래스까지 합친 값이다).
  // 잣대가 다른 값을 한 줄로 세우면 안 되므로 화면이 이 표를 보고 가른다.
  const aumScope = etf.aum == null ? null : (etf.aumScope || (etf.market === 'KR' ? 'etf' : 'unknown'));

  return {
    ...etf,
    aumScope,
    suspended: suspended || undefined,
    // 국내는 수집기가 운용사를 직접 받아 온다(네이버 issuerName). 없으면 규칙으로.
    manager: etf.manager || tag.manager,
    index: tag.index,
    region: tag.region,
    assetClass: tag.assetClass,
    themes: tag.themes,
    flags: tag.flags,
    holdings,
    top10Weight,
    cashWeight,
    weightsKnown,                         // false 면 편입종목은 순위만 뜻이 있다
    holdingCount: stocks.length,          // 종목 수. 현금 줄은 세지 않는다
  };
}

// ───────────────────────── 예시 데이터 ─────────────────────────
// 한 번도 수집되지 않았을 때 화면을 채운다. 실제 수치가 아니다.
// 종목코드를 씨앗으로 삼아 매번 같은 값이 나오게 만든다 — 화면을 고칠 때마다
// 숫자가 흔들리면 무엇이 바뀐 건지 알 수 없다.
function sampleData() {
  const seedRand = (seed) => {
    let x = [...String(seed)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 2147483647;
    return () => { x = (x * 48271) % 2147483647; return x / 2147483647; };
  };

  const SPECS = [
    ['KR', '069500', 'KODEX 200', '삼성자산운용', '코스피 200',
     ['삼성전자', 'SK하이닉스', 'SK스퀘어', '삼성전기', '현대차',
      'KB금융', '신한지주', '한화에어로스페이스', '두산에너빌리티', '삼성물산']],
    ['KR', '133690', 'TIGER 미국나스닥100', '미래에셋자산운용', '나스닥 100',
     ['NVIDIA', 'Apple', 'Microsoft', 'Broadcom', 'Amazon',
      'Meta Platforms', 'Alphabet A', 'Tesla', 'Alphabet C', 'Netflix']],
    ['KR', '458730', 'TIGER 미국배당다우존스', '미래에셋자산운용', 'Dow Jones US Dividend 100',
     ['Cisco', 'Home Depot', 'Chevron', 'AbbVie', 'Coca-Cola',
      'Verizon', 'Amgen', 'Merck', 'PepsiCo', 'Lockheed Martin']],
    ['KR', '091160', 'KODEX 반도체', '삼성자산운용', 'KRX 반도체',
     ['SK하이닉스', '삼성전자', '한미반도체', '리노공업', '이오테크닉스',
      'DB하이텍', '주성엔지니어링', '원익IPS', '피에스케이', '테스']],
    ['KR', '305720', 'KODEX 2차전지산업', '삼성자산운용', 'FnGuide 2차전지',
     ['LG에너지솔루션', '삼성SDI', 'POSCO홀딩스', 'LG화학', '에코프로비엠',
      'SK이노베이션', '에코프로', '엘앤에프', '포스코퓨처엠', 'SKC']],
    ['KR', '148070', 'KOSEF 국고채10년', '키움투자자산운용', 'KIS 국고채10년',
     ['국고채권 03000-3509', '국고채권 03375-3312', '국고채권 02750-3406']],
    ['US', 'SPY', 'SPDR S&P 500 ETF Trust', 'State Street (SPDR)', 'S&P 500',
     ['NVIDIA', 'Microsoft', 'Apple', 'Amazon', 'Meta Platforms',
      'Broadcom', 'Alphabet A', 'Tesla', 'Alphabet C', 'Berkshire Hathaway B']],
    ['US', 'QQQ', 'Invesco QQQ Trust', 'Invesco', 'NASDAQ 100',
     ['NVIDIA', 'Apple', 'Microsoft', 'Broadcom', 'Amazon',
      'Meta Platforms', 'Netflix', 'Tesla', 'Costco', 'Alphabet A']],
    ['US', 'SCHD', 'Schwab US Dividend Equity ETF', 'Schwab', 'Dow Jones US Dividend 100',
     ['Cisco', 'Home Depot', 'Chevron', 'AbbVie', 'Coca-Cola',
      'Verizon', 'Amgen', 'Merck', 'PepsiCo', 'Texas Instruments']],
    ['US', 'SMH', 'VanEck Semiconductor ETF', 'VanEck', 'MVIS US Semiconductor',
     ['NVIDIA', 'TSMC ADR', 'Broadcom', 'AMD', 'ASML',
      'Qualcomm', 'Texas Instruments', 'Applied Materials', 'Micron', 'Lam Research']],
    ['US', 'TLT', 'iShares 20+ Year Treasury Bond ETF', 'BlackRock (iShares)', 'ICE US Treasury 20+',
     ['US Treasury 4.25% 2054', 'US Treasury 4.625% 2055', 'US Treasury 3.625% 2053']],
    ['US', 'GLD', 'SPDR Gold Shares', 'State Street (SPDR)', 'LBMA Gold Price',
     ['Gold Bullion']],
    ['HK', '2800', 'Tracker Fund of Hong Kong', 'Hang Seng Investment', 'Hang Seng',
     ['HSBC', 'Tencent', 'AIA Group', 'Alibaba', 'Meituan',
      'China Construction Bank', 'Xiaomi', 'ICBC', 'Bank of China', 'CNOOC']],
    ['HK', '3033', 'CSOP Hang Seng TECH Index ETF', 'China Managers', 'Hang Seng Tech',
     ['Alibaba', 'Tencent', 'Xiaomi', 'Meituan', 'JD.com',
      'Kuaishou', 'SMIC', 'NetEase', 'Baidu', 'Li Auto']],
    ['JP', '1306', 'NEXT FUNDS TOPIX ETF', 'Nomura', 'TOPIX',
     ['Toyota Motor', 'Sony Group', 'Mitsubishi UFJ', 'Hitachi', 'Keyence',
      'Tokyo Electron', 'Sumitomo Mitsui', 'Recruit', 'Shin-Etsu Chemical', 'Nintendo']],
    ['JP', '1321', 'NEXT FUNDS Nikkei 225 ETF', 'Nomura', 'Nikkei 225',
     ['Fast Retailing', 'Tokyo Electron', 'Advantest', 'SoftBank Group', 'Shin-Etsu Chemical',
      'KDDI', 'Daiichi Sankyo', 'Terumo', 'Fanuc', 'TDK']],
  ];

  const PERIODS = ['D1', 'W1', 'M1', 'M3', 'M6', 'YTD', 'Y1', 'Y3', 'Y5'];
  const SECTORS = ['IT', 'FINANCIALS', 'INDUSTRIALS', 'HEALTHCARE',
                   'CONSUMER_DISCRETIONARY', 'CONSUMER_STAPLES', 'COMMUNICATION',
                   'MATERIALS', 'ENERGY', 'UTILITIES', 'REAL_ESTATE'];

  return SPECS.map(([market, code, name, manager, indexName, holdingNames]) => {
    const rand = seedRand(code);
    // 상위 종목일수록 비중이 크게, 합이 100 을 넘지 않게 깎아 내린다.
    let remaining = 30 + rand() * 55;
    const holdings = holdingNames.map((hn, i) => {
      const w = i === holdingNames.length - 1
        ? remaining
        : remaining * (0.28 + rand() * 0.22);
      remaining -= w;
      return { code: null, name: hn, weight: +w.toFixed(2), shares: null };
    });

    const ret = { price: {}, nav: {} };
    for (const p of PERIODS) {
      const base = (rand() - 0.35) * (p === 'D1' ? 3 : p === 'W1' ? 6 : 40);
      ret.price[p] = +base.toFixed(2);
      ret.nav[p] = +(base + (rand() - 0.5) * 0.6).toFixed(2);
    }

    // 섹터 비중도 채운다. 비워 두면 섹터 필터와 도넛이 화면에서 확인되지 않는다.
    const sectors = {};
    if (!/국고채|Treasury|Gold/.test(name)) {
      let left = 100;
      const picked = SECTORS.slice().sort(() => rand() - 0.5).slice(0, 6);
      picked.forEach((sec, i) => {
        const w = i === picked.length - 1 ? left : left * (0.2 + rand() * 0.45);
        left -= w;
        sectors[sec] = +w.toFixed(2);
      });
    }

    return {
      id: `${market}:${code}`,
      code,
      market,
      name,
      nameKo: null,
      manager,
      indexName,
      price: +(10000 + rand() * 90000).toFixed(0),
      changeRate: +((rand() - 0.45) * 3).toFixed(2),
      volume: Math.round(rand() * 3e6),
      turnover: Math.round(rand() * 5e10),
      aum: Math.round((0.05 + rand() * 8) * 1e12),
      ter: +(0.03 + rand() * 0.6).toFixed(3),
      nav: null,
      listedDate: null,
      premium: +((rand() - 0.5) * 0.6).toFixed(2),
      trackingError: +(rand() * 1.2).toFixed(2),
      dividendYield: +(rand() * 5).toFixed(2),
      retAsOf: null,
      ret,
      flow: null,
      sectors: Object.keys(sectors).length ? sectors : null,
      countries: null,
      assets: null,
      holdings,
    };
  });
}

// ───────────────────────── 실행 ─────────────────────────
const kr = await loadDataFile('data/etf-kr.js', 'ETF_KR');
const global_ = await loadDataFile('data/etf-global.js', 'ETF_GLOBAL');

let etfs = [];
let source = 'sample';
const sources = {};

if (kr?.etfs?.length) {
  etfs = etfs.concat(kr.etfs.map((e) => finish(e, 'KR')));
  sources.kr = { updatedAt: kr.updatedAt, count: kr.count, withHoldings: kr.withHoldings,
                 source: '네이버 금융' };
  source = 'live';
}
if (global_?.etfs?.length) {
  etfs = etfs.concat(global_.etfs.map((e) => finish(e, e.market)));
  sources.global = { updatedAt: global_.updatedAt, count: global_.count,
                     withHoldings: global_.withHoldings,
                     noHoldingsByMarket: global_.noHoldingsByMarket || null,
                     fx: global_.fx || null,      // 설정액 원화 환산에 쓴 환율
                     source: 'Yahoo Finance' };
  source = 'live';
}
if (!etfs.length) {
  console.log('[build] 수집 파일이 없다 — 예시 데이터로 만든다');
  etfs = sampleData().map((e) => finish(e, e.market));
}

// 테마 라벨은 사전에서 그대로 가져온다. 화면이 셀렉트 박스를 이것으로 만든다.
const themeOrder = THEMES.map((t) => t.id);

/**
 * 수익률 기준 되짚기 결과를 데이터에 같이 싣는다.
 *
 * 화면이 "총수익률 하나" 를 기준으로 내걸었으니, **왜 그런지**도 같은 파일
 * 안에 있어야 한다. 근거를 별도 문서로 빼 두면 배포할 파일이 둘이 되고,
 * 언젠가 한쪽만 돌아다니게 된다.
 *
 * 여기서는 표에 필요한 만큼만 옮긴다. 원자료는 그대로 저장소에 남는다.
 * 되짚기를 아직 안 돌렸으면 이 칸은 비고, 화면은 그 탭을 감춘다.
 */
async function basisEvidence() {
  let raw;
  try {
    raw = JSON.parse(await readFile('tools/discovery/etf_price_series.json', 'utf8'));
  } catch { return null; }
  const withCmp = raw.filter((r) => r && r.cmp);
  const control = withCmp.filter((r) => r.divCount === 0);
  const payers = withCmp.filter((r) => (r.adj?.divsInWindow ?? 0) > 0);
  if (!control.length || payers.length < 2) return null;

  const slim = (r) => ({
    code: r.code, name: r.name, yield: r.yield,
    stated: r.stated?.price ?? null,
    naverRaw: r.naverY1?.pct ?? null,
    naverFrom: r.naverY1?.fromClose ?? null, naverTo: r.naverY1?.toClose ?? null,
    yahooFrom: r.yahooY1?.fromClose ?? null, yahooTo: r.yahooY1?.toClose ?? null,
    ourPrice: r.data?.price ?? null, ourTr: r.data?.tr ?? null,
    days: r.cmp?.common ?? null,
    medianDiff: r.cmp?.medianRelPct ?? null, maxDiff: r.cmp?.maxRelPct ?? null,
    over1pct: r.cmp?.over1pct ?? null,
    divs: r.adj?.divsInWindow ?? 0,
    ratioEnd: r.adj?.ratioEnd ?? null,
    ratioStart: r.adj?.ratioStart ?? null,
    ratioPredicted: r.adj?.predictedStartRatio ?? null,
  });
  const hit = payers.filter((r) =>
    Math.abs(r.adj.ratioEnd - 1) < 0.02 &&
    Math.abs(r.adj.ratioStart - r.adj.predictedStartRatio) < 0.03).length;

  return {
    asOf: payers[0]?.adj?.endDay || null,
    hit, payerCount: payers.length,
    control: control.map(slim),
    payers: payers.map(slim),
  };
}

const payload = {
  updatedAt: new Date().toISOString(),
  source,                                   // 'live' | 'sample'
  sources,
  labels: labels(),
  themeOrder,
  count: etfs.length,
  basis: await basisEvidence(),
  etfs,
};

/**
 * 값이 없는 칸은 파일에서 아예 뺀다.
 *
 * 1,300종목 × 30여 개 필드라 null 만 모아도 200KB 가 넘는다. 이 파일은 매일
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

await writeDataFile(OUT, 'ETF_DATA', prune(payload),
  `ETF 통합 데이터 — ${source === 'live' ? '수집본' : '예시'} ${new Date().toISOString()}`);

// 만들어 놓고 눈으로 확인할 수 있게 요약을 찍는다.
const by = (fn) => {
  const m = {};
  for (const e of etfs) { const k = fn(e) ?? '(없음)'; m[k] = (m[k] || 0) + 1; }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
console.log(`[build] ${etfs.length}종목 · 편입종목 보유 ${etfs.filter((e) => e.holdingCount).length}`);
console.log('[build] 상장:', JSON.stringify(Object.fromEntries(by((e) => e.market))));
console.log('[build] 지역:', JSON.stringify(Object.fromEntries(by((e) => e.region))));
console.log('[build] 자산군:', JSON.stringify(Object.fromEntries(by((e) => e.assetClass))));
console.log('[build] 운용사 상위:', JSON.stringify(Object.fromEntries(by((e) => e.manager).slice(0, 8))));
console.log('[build] 테마 미분류:', etfs.filter((e) => !e.themes.length).length);
