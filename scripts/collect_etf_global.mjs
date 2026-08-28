#!/usr/bin/env node
/**
 * 해외 ETF 수집 — 야후 파이낸스.
 *
 *   node scripts/collect_etf_global.mjs
 *   -> data/etf-global.js   (window.ETF_GLOBAL)
 *
 * 대상은 scripts/etf_universe.mjs 의 목록 — 미국·홍콩·일본·중국(상해·심천).
 *
 * 탐색에서 확인한 것(tools/discovery/etf_probe*.md):
 *   - quoteSummary 는 쿠키+crumb 를 요구한다. 러너에서 문제없이 발급된다.
 *   - 미국·홍콩·일본 상장은 topHoldings 로 상위10 + 섹터비중 11칸을 준다.
 *   - **중국 본토(상해 .SS / 심천 .SZ)는 편입종목을 주지 않는다.** 값이
 *     0개로 온다. 시세는 오므로 종목 자체는 싣되 편입종목은 비워 두고
 *     `holdingsSource: null` 로 남긴다. 화면은 "편입종목 미제공"으로 표시한다.
 *     본토 익스포저가 필요하면 홍콩 상장(2823·3188)이나 미국 상장(ASHR·MCHI)
 *     쪽에 편입종목이 있으므로 그쪽을 쓰면 된다.
 *   - 한국 상장은 야후에 편입종목이 없다. 국내는 collect_etf_kr.mjs 가 맡는다.
 *
 * 기간수익률은 야후가 따로 주지 않아 chart(adjclose)로 직접 계산한다.
 * adjclose 는 분배금이 반영된 값이라 **총수익률(TR)** 이 되고, close 는
 * 분배금이 빠진 **시장가격 수익률**이 된다. 국내(네이버)의 nav/price 두
 * 기준과 짝을 맞추려고 둘 다 계산한다.
 */

import { getJson, mapLimit, num, sleep, writeDataFile, assertEnough, UA } from './etf_lib.mjs';
import { universe, EXCHANGES } from './etf_universe.mjs';

const OUT = 'data/etf-global.js';
const MODULES = 'topHoldings,fundProfile,price,summaryDetail,defaultKeyStatistics';

// ─────────────────── 쿠키 + crumb ───────────────────
let cookie = '';
let crumb = '';

async function authorize() {
  const res = await fetch('https://fc.yahoo.com/', {
    headers: { 'User-Agent': UA }, redirect: 'follow',
  }).catch(() => null);
  cookie = (res?.headers?.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
  const cr = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie },
  });
  crumb = (await cr.text()).trim();
  if (!crumb) throw new Error('crumb 발급 실패 — quoteSummary 를 부를 수 없다');
  console.log(`[global] crumb 확보 (쿠키 ${cookie ? 'O' : 'X'})`);
}

const yahooHeaders = () => ({ Cookie: cookie, Referer: 'https://finance.yahoo.com/' });

// ─────────────────── 환율 ───────────────────
/**
 * 설정액을 한 줄로 세우려면 통화를 맞춰야 한다.
 *
 * 국내는 원, 미국은 달러, 홍콩은 홍콩달러, 일본은 엔이다. 그대로 두면
 * "설정액 상위" 정렬이 통화 단위 크기 순이 되어 버린다(엔이 항상 1등).
 * 그래서 원화 환산값(aumKrw)을 같이 붙인다. 쓴 환율과 시각을 함께 저장해
 * 화면이 "무엇으로 환산했는지"를 말할 수 있게 한다.
 *
 * 환율을 못 받으면 환산값을 붙이지 않는다. 틀린 환율로 환산하느니
 * 같은 시장끼리만 비교하게 두는 편이 낫다.
 */
async function fetchFx() {
  const PAIRS = { USD: 'KRW=X', HKD: 'HKDKRW=X', JPY: 'JPYKRW=X', CNY: 'CNYKRW=X' };
  const rates = { KRW: 1 };
  for (const [cur, symbol] of Object.entries(PAIRS)) {
    try {
      const json = await getJson(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`,
        { headers: yahooHeaders() });
      const meta = json?.chart?.result?.[0]?.meta;
      const v = num(meta?.regularMarketPrice);
      if (v && v > 0) rates[cur] = v;
    } catch {
      // 못 받은 통화는 비워 둔다. 아래에서 환산을 건너뛴다.
    }
  }
  console.log('[global] 환율:', JSON.stringify(rates));
  return { rates, asOf: new Date().toISOString() };
}
let FX = { rates: { KRW: 1 }, asOf: null };

// ─────────────────── 개별 종목 ───────────────────
async function fetchSummary(symbol) {
  const qs = new URLSearchParams({ modules: MODULES, crumb });
  const json = await getJson(
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?${qs}`,
    { headers: yahooHeaders() });
  return json?.quoteSummary?.result?.[0] || null;
}

/**
 * 기간수익률을 일봉으로 직접 계산한다.
 *
 * 기준일에서 정확히 N개월 전 봉이 없을 수 있으므로(휴장) **그 날짜 이하의
 * 마지막 봉**을 쓴다. 앞에서부터 자르면 상장 초기 종목의 1년 수익률이
 * 상장일 대비가 되어 엉뚱하게 커진다 — 그래서 구간이 데이터 범위를 벗어나면
 * 아예 값을 내지 않는다.
 */
function computeReturns(timestamps, closes, adjcloses) {
  if (!timestamps?.length) return null;
  const rows = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const c = closes?.[i];
    const a = adjcloses?.[i] ?? c;
    if (c != null && Number.isFinite(c)) rows.push({ t: timestamps[i] * 1000, c, a });
  }
  if (rows.length < 2) return null;

  const last = rows[rows.length - 1];
  const first = rows[0];
  const end = new Date(last.t);

  const back = (fn) => {
    const d = new Date(last.t);
    fn(d);
    return d.getTime();
  };
  const PERIODS = {
    D1: back((d) => d.setDate(d.getDate() - 1)),
    W1: back((d) => d.setDate(d.getDate() - 7)),
    M1: back((d) => d.setMonth(d.getMonth() - 1)),
    M3: back((d) => d.setMonth(d.getMonth() - 3)),
    M6: back((d) => d.setMonth(d.getMonth() - 6)),
    YTD: new Date(Date.UTC(end.getUTCFullYear(), 0, 1)).getTime(),
    Y1: back((d) => d.setFullYear(d.getFullYear() - 1)),
    Y3: back((d) => d.setFullYear(d.getFullYear() - 3)),
    Y5: back((d) => d.setFullYear(d.getFullYear() - 5)),
  };
  // 3년·5년은 연율로 환산한다. 국내(네이버)가 연율로 주므로 기준을 맞춘다.
  const ANNUALIZE = { Y3: 3, Y5: 5 };

  const price = {};
  const nav = {};
  for (const [key, cutoff] of Object.entries(PERIODS)) {
    if (cutoff < first.t) continue;                      // 관측 범위 밖이면 내지 않는다
    let base = null;
    for (const row of rows) {
      if (row.t <= cutoff) base = row; else break;
    }
    if (!base || base === last) continue;
    const years = ANNUALIZE[key];
    const pct = (a, b) => {
      const r = a / b;
      if (!Number.isFinite(r) || r <= 0) return null;
      return +(((years ? r ** (1 / years) : r) - 1) * 100).toFixed(2);
    };
    const p = pct(last.c, base.c);
    const n = pct(last.a, base.a);
    if (p != null) price[key] = p;
    if (n != null) nav[key] = n;
  }
  return { price: Object.keys(price).length ? price : null,
           nav: Object.keys(nav).length ? nav : null,
           asOf: new Date(last.t).toISOString().slice(0, 10) };
}

async function fetchReturns(symbol) {
  const json = await getJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    '?range=5y&interval=1d', { headers: yahooHeaders() });
  const r = json?.chart?.result?.[0];
  if (!r) return null;
  return computeReturns(r.timestamp, r.indicators?.quote?.[0]?.close,
                        r.indicators?.adjclose?.[0]?.adjclose);
}

/** 야후의 {raw, fmt} 봉투를 벗긴다. */
const raw = (v) => (v && typeof v === 'object' && 'raw' in v ? num(v.raw) : num(v));

function shape(entry, summary, returns) {
  const price = summary?.price || {};
  const detail = summary?.summaryDetail || {};
  const stats = summary?.defaultKeyStatistics || {};
  const profile = summary?.fundProfile || {};
  const top = summary?.topHoldings || {};

  const holdings = (top.holdings || [])
    .map((h) => ({ code: h.symbol || null, name: h.holdingName || null,
                   weight: raw(h.holdingPercent) != null ? +(raw(h.holdingPercent) * 100).toFixed(2) : null }))
    .filter((h) => h.name);

  // 야후 섹터 키는 'realestate' 처럼 소문자다. 국내(네이버)는 'REAL_ESTATE' 다.
  // 화면에서 같은 칸에 놓으려면 하나로 맞춰야 한다 — 네이버 쪽 표기로 모은다.
  const SECTOR_KEY = {
    technology: 'IT', realestate: 'REAL_ESTATE', consumer_cyclical: 'CONSUMER_DISCRETIONARY',
    consumer_defensive: 'CONSUMER_STAPLES', healthcare: 'HEALTHCARE', financial_services: 'FINANCIALS',
    communication_services: 'COMMUNICATION', industrials: 'INDUSTRIALS', energy: 'ENERGY',
    basic_materials: 'MATERIALS', utilities: 'UTILITIES',
  };
  const sectors = {};
  for (const row of top.sectorWeightings || []) {
    for (const [k, v] of Object.entries(row)) {
      const w = raw(v);
      if (w) sectors[SECTOR_KEY[k] || k.toUpperCase()] = +(w * 100).toFixed(2);
    }
  }

  const name = price.longName || price.shortName || entry.ticker;
  const family = profile.family || null;

  return {
    id: `${entry.market}:${entry.ticker}`,
    code: entry.ticker,
    symbol: entry.symbol,
    market: entry.market,
    marketLabel: EXCHANGES[entry.market].ko,
    currency: price.currency || entry.currency,
    name,
    nameKo: entry.koName,

    price: raw(price.regularMarketPrice),
    changeRate: raw(price.regularMarketChangePercent) != null
      ? +(raw(price.regularMarketChangePercent) * 100).toFixed(2) : null,
    volume: raw(price.regularMarketVolume),
    aum: raw(detail.totalAssets) ?? raw(stats.totalAssets),
    aumKrw: null,       // 아래 main 에서 환율이 있을 때만 채운다
    nav: raw(detail.navPrice),
    ter: raw(profile.feesExpensesInvestment?.annualReportExpenseRatio) != null
      ? +(raw(profile.feesExpensesInvestment.annualReportExpenseRatio) * 100).toFixed(3) : null,
    dividendYield: raw(detail.yield) != null ? +(raw(detail.yield) * 100).toFixed(2) : null,

    // 분류는 scripts/build_etf_data.mjs 가 사전을 읽어 붙인다.
    familyRaw: family,
    categoryRaw: profile.categoryName || null,
    indexName: null,

    retAsOf: returns?.asOf || null,
    ret: returns ? { price: returns.price, nav: returns.nav } : null,
    sectors: Object.keys(sectors).length ? sectors : null,
    countries: null,
    assets: null,
    flow: null,

    holdings: holdings.length ? holdings : null,
  };
}

// ─────────────────── 실행 ───────────────────
async function main() {
  await authorize();
  FX = await fetchFx();
  const list = universe();
  console.log(`[global] 유니버스 ${list.length}종목`);

  const rows = await mapLimit(list, 4, async (entry) => {
    const summary = await fetchSummary(entry.symbol);
    if (!summary) throw new Error('quoteSummary 결과 없음');
    // 같은 호스트를 연달아 때리지 않도록 살짝 쉰다. 야후는 조급하면 429 를 준다.
    await sleep(120);
    const returns = await fetchReturns(entry.symbol).catch(() => null);
    return shape(entry, summary, returns);
  }, (done, total) => console.log(`[global] ${done}/${total}`));

  const etfs = [];
  const failures = [];
  let withHoldings = 0;
  const noHoldingsByMarket = {};

  rows.forEach((res, i) => {
    if (!res.ok) {
      failures.push({ symbol: list[i].symbol, error: res.error });
      return;
    }
    // 설정액을 원화로 환산해 둔다. 환율이 없는 통화는 그대로 비워 둔다.
    var row = res.value;
    var rate = FX.rates[row.currency];
    if (rate && row.aum != null) row.aumKrw = Math.round(row.aum * rate);
    etfs.push(row);
    if (res.value.holdings) withHoldings += 1;
    else noHoldingsByMarket[res.value.market] = (noHoldingsByMarket[res.value.market] || 0) + 1;
  });

  console.log(`[global] 수집 ${etfs.length}/${list.length} · 편입종목 ${withHoldings}`);
  if (Object.keys(noHoldingsByMarket).length) {
    console.log('[global] 편입종목 없는 시장:', JSON.stringify(noHoldingsByMarket));
  }
  if (failures.length) {
    console.log(`[global] 실패 ${failures.length}: ` +
                failures.slice(0, 8).map((f) => `${f.symbol} ${f.error}`).join(' | '));
  }

  // 종목 자체는 대부분 받아와야 한다.
  assertEnough('global.rows', etfs.length, list.length, 0.7);
  // 편입종목은 본토(.SS/.SZ)가 통째로 빠지는 것이 정상이므로 기준을 낮게 둔다.
  assertEnough('global.holdings', withHoldings, list.length, 0.6);

  await writeDataFile(OUT, 'ETF_GLOBAL', {
    updatedAt: new Date().toISOString(),
    source: 'yahoo',
    fx: FX,                       // 환산에 쓴 환율. 화면이 근거를 말할 수 있어야 한다
    count: etfs.length,
    withHoldings,
    noHoldingsByMarket,
    failures: failures.slice(0, 50),
    etfs,
  }, `해외 ETF — 야후 수집 ${new Date().toISOString()}`);
}

await main();
