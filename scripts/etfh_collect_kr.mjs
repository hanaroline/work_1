// 국내 상장 ETF 전 종목 — 목록·상세·편입종목(네이버) + 원가격 일봉(네이버) + 분배금(야후 .KS)
//
// 러너에서 돈다(세션 컨테이너는 네이버·야후가 CONNECT 403).
// 쓰는 곳: data/etfh/kr.json
//
// **수집률이 기준에 못 미치면 파일을 쓰지 않는다.** 반쪽으로 덮으면 화면은 멀쩡히
// 뜨는데 속이 비어 누구도 모른다. 기준: 편입종목을 받은 종목이 전체의 70% 이상.
//
// 사용: node scripts/etfh_collect_kr.mjs [--limit N]   (N 은 시험용)

import fs from 'node:fs';
import { num, eokFromKorean, get, getJson, pool, sleep, cleanBars, trIndex, periodReturns } from './etfh_lib.mjs';

const OUT = 'data/etfh/kr.json';
const MIN_COVERAGE = 0.7;
const args = process.argv.slice(2);
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;

const kstNow = new Date(Date.now() + 9 * 3600e3);
const todayKst = kstNow.toISOString().slice(0, 10);
const kstHour = kstNow.getUTCHours() + kstNow.getUTCMinutes() / 60;

const log = [];
const note = (s) => { log.push(s); console.log(s); };

// ── 1. 목록 ──
const listRes = await get('https://finance.naver.com/api/sise/etfItemList.nhn?etfType=0&targetColumn=market_sum&sortOrder=desc', { decode: 'euc-kr' });
const list = JSON.parse(listRes.text).result.etfItemList;
note(`목록 ${list.length}종목`);
const items = list.slice(0, LIMIT);

// ── 2. 종목마다 ──
const SECTOR = { IT: 'IT', FINANCIALS: '금융', INDUSTRIALS: '산업재', HEALTHCARE: '헬스케어', CONSUMER_DISCRETIONARY: '경기소비재', CONSUMER_STAPLES: '필수소비재', COMMUNICATION: '커뮤니케이션', MATERIALS: '소재', ENERGY: '에너지', UTILITIES: '유틸리티', REAL_ESTATE: '부동산', UNCLASSIFIED: '미분류' };

function parseSise(text) {
  // [["20150102", 19569, 19684, 19528, 19667, 4221683, 4.48], ...]  머리행은 따옴표가 홑이다
  const rows = [];
  for (const line of text.split('\n')) {
    const m = line.match(/\["(\d{4})(\d{2})(\d{2})",\s*([^,\]]*),\s*([^,\]]*),\s*([^,\]]*),\s*([^,\]]*)/);
    if (!m) continue;
    rows.push({ d: `${m[1]}-${m[2]}-${m[3]}`, c: m[7].replace(/"/g, '').trim() });
  }
  return rows;
}

async function yahooKS(code) {
  const p1 = Math.floor(Date.UTC(2015, 0, 1) / 1000), p2 = Math.floor(Date.now() / 1000) + 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${code}.KS?period1=${p1}&period2=${p2}&interval=1d&events=div%7Csplit`;
  const r = await get(url, { tries: 4 });
  if (r.status === 404) return { missing: true };
  if (r.status !== 200) throw new Error(`yahoo HTTP ${r.status}`);
  const res = JSON.parse(r.text).chart?.result?.[0];
  if (!res) return { missing: true };
  const ts = res.timestamp || [];
  const cl = res.indicators?.quote?.[0]?.close || [];
  const tz = (res.meta?.gmtoffset ?? 32400) * 1000;
  const bars = ts.map((t, i) => ({ d: new Date(t * 1000 + tz).toISOString().slice(0, 10), c: cl[i] }));
  const dateOf = (t) => new Date(t * 1000 + tz).toISOString().slice(0, 10);
  const divs = Object.values(res.events?.dividends || {}).map((x) => ({ d: dateOf(x.date), a: x.amount }));
  const splits = Object.values(res.events?.splits || {}).map((x) => ({ d: dateOf(x.date), num: x.numerator, den: x.denominator }));
  return { type: res.meta?.instrumentType, name: res.meta?.longName || res.meta?.shortName, bars: cleanBars(bars), divs, splits };
}

async function one(it) {
  const code = it.itemcode;
  const rec = { code, name: it.itemname, market: 'KR', tab: it.etfTabCode, listAumEok: num(it.marketSum) };
  // 상세
  const a = await getJson(`https://m.stock.naver.com/api/stock/${code}/etfAnalysis`);
  rec.issuer = a.issuerName || null;
  rec.index = a.etfBaseIndex || null;
  rec.listed = a.listedDate ? `${a.listedDate.slice(0, 4)}-${a.listedDate.slice(4, 6)}-${a.listedDate.slice(6, 8)}` : null;
  rec.aumEok = eokFromKorean(a.totalNav); // 순자산총액(억원)
  rec.mcapEok = eokFromKorean(a.marketValue);
  rec.fee = num(a.totalFee);
  rec.dev = a.deviationRate === undefined || a.deviationRate === null ? null : (a.deviationSign === '-' ? -1 : 1) * num(a.deviationRate);
  rec.te = num(a.chaseErrorRate);
  rec.divYield = num(a.dividend?.dividendYieldTtm);
  rec.flow3mEok = eokFromKorean(a.cumulativeNetInflowList?.cumulativeNetInflow3m);
  rec.flowDate = a.cumulativeNetInflowList?.referenceDate || null;
  rec.theme = { large: a.themeReturns?.themeLargeCodeDesc || null, middle: a.themeReturns?.themeMiddleCodeDesc || null };
  rec.summary = (a.etfSummary || '').replace(/<br\s*\/?>/g, ' ').slice(0, 400);
  const asset = {}; for (const x of a.assetPortfolioList || []) asset[x.detailTypeCode] = num(x.weight);
  rec.assets = asset;
  rec.cash = asset.CASH ?? null; // 자료 값 그대로 — 다시 계산하지 않는다
  const ctry = {}; for (const x of a.countryPortfolioList || []) ctry[x.detailTypeCode] = num(x.weight);
  rec.countries = ctry;
  const sec = {}; for (const x of a.sectorPortfolioList || []) { const k = SECTOR[x.detailTypeCode] || '미분류'; const w = num(x.weight); if (w !== null) sec[k] = (sec[k] || 0) + w; }
  rec.sectors = Object.keys(sec).length ? sec : null;
  rec.holdings = (a.etfTop10MajorConstituentAssets || []).map((h) => ({ code: (h.itemCode || '').trim() || null, name: (h.itemName || '').trim(), w: num(h.etfWeight) }));
  rec.naverRet = { date: a.returnPerformanceReferenceDate || null, price: Object.fromEntries((a.returnPerformanceList || []).map((x) => [x.periodTypeCode, num(x.value)])), nav: Object.fromEntries((a.navPerformanceList || []).map((x) => [x.periodTypeCode, num(x.value)])) };

  // 거래 상태
  const b = await getJson(`https://m.stock.naver.com/api/stock/${code}/basic`);
  rec.exch = b.stockExchangeName || null;
  rec.tradeStop = b.tradeStopType?.name && b.tradeStopType.name !== 'TRADING' ? (b.tradeStopType.text || b.tradeStopType.name) : null;

  // 원가격 일봉
  const s = await get(`https://api.finance.naver.com/siseJson.naver?symbol=${code}&requestType=1&startTime=20150101&endTime=${todayKst.replace(/-/g, '')}&timeframe=day`);
  let bars = cleanBars(parseSise(s.text));
  rec.emptyBars = parseSise(s.text).length - bars.length; // 날짜만 있고 종가가 빈 봉
  // 장 마감 전(16시 전)이면 오늘 봉은 아직 확정이 아니다
  if (bars.length && bars.at(-1).d === todayKst && kstHour < 16) bars = bars.slice(0, -1);
  rec.price = bars.at(-1)?.c ?? null;
  rec.priceDate = bars.at(-1)?.d ?? null;
  rec.firstBar = bars[0]?.d ?? null;

  // 분배금 — 야후 .KS. 같은 상품인지 먼저 가른다: 종류가 ETF 이고, 겹치는 날 종가가 맞아야 한다.
  let y = null;
  try { y = await yahooKS(code); } catch (e) { rec.divErr = String(e.message || e); }
  let divs = null;
  if (y && !y.missing) {
    // 야후 종가는 분할을 반영했다. 네이버 원가격을 분할 기준으로 맞춘 뒤 대조한다.
    for (const sp of y.splits) {
      const r = sp.num / sp.den;
      if (!(r > 0)) continue;
      bars = bars.map((x) => (x.d < sp.d ? { d: x.d, c: x.c / r } : x));
    }
    if (y.splits.length) rec.splits = y.splits;
    const ym = new Map(y.bars.map((x) => [x.d, x.c]));
    const diffs = [];
    for (const x of bars.slice(-250)) { const yc = ym.get(x.d); if (yc) diffs.push(Math.abs(x.c / yc - 1)); }
    diffs.sort((p, q) => p - q);
    const med = diffs.length ? diffs[diffs.length >> 1] : null;
    rec.yahoo = { type: y.type, overlap: diffs.length, medDiff: med === null ? null : Math.round(med * 1e5) / 1e5 };
    if (y.type === 'ETF' && diffs.length >= 20 && med < 0.01) divs = y.divs;
    else rec.divErr = `야후 ${code}.KS 가 같은 상품으로 확인되지 않음(종류 ${y.type}, 겹친 날 ${diffs.length}, 종가 차 중앙값 ${med})`;
  } else if (y?.missing) rec.divErr = `야후에 ${code}.KS 없음`;

  if (divs) {
    rec.divSrc = `Yahoo ${code}.KS`;
    rec.divCount = divs.length;
    rec.ret = periodReturns(bars, trIndex(bars, divs));
  } else {
    // 분배금을 모르면 총수익률을 셀 수 없다. 가격수익률로 대신하지 않는다.
    rec.ret = { base: rec.priceDate, r: null };
  }
  return rec;
}

const t0 = Date.now();
const recs = await pool(items, 4, async (it, i) => {
  const r = await one(it);
  if (i % 50 === 0) note(`… ${i}/${items.length} (${Math.round((Date.now() - t0) / 1000)}초)`);
  await sleep(150);
  return r;
});

const ok = recs.filter((r) => r && !r.error);
const failed = recs.map((r, i) => (r?.error ? `${items[i].itemcode} ${items[i].itemname}: ${r.error}` : null)).filter(Boolean);
const withHold = ok.filter((r) => r.holdings.length);
const withRet = ok.filter((r) => r.ret?.r);
const cov = withHold.length / items.length;
note(`상세 ${ok.length}/${items.length} · 편입종목 ${withHold.length} (${(cov * 100).toFixed(1)}%) · 총수익률 ${withRet.length} · 실패 ${failed.length}`);
for (const f of failed.slice(0, 30)) note(`  실패 ${f}`);
const noDiv = ok.filter((r) => !r.ret?.r);
note(`총수익률 못 셈 ${noDiv.length}: ` + noDiv.slice(0, 40).map((r) => `${r.code}(${r.divErr || '?'})`).join(' / '));

const stat = { list: list.length, target: items.length, detail: ok.length, holdings: withHold.length, returns: withRet.length, failed: failed.length, coverage: cov };
fs.mkdirSync('data/etfh', { recursive: true });
fs.writeFileSync('data/etfh/kr.log.txt', log.join('\n') + '\n');
if (cov < MIN_COVERAGE) {
  note(`수집률 ${(cov * 100).toFixed(1)}% < ${MIN_COVERAGE * 100}% — ${OUT} 을 덮어쓰지 않는다`);
  fs.writeFileSync('data/etfh/kr.log.txt', log.join('\n') + '\n');
  process.exit(2);
}
const base = ok.map((r) => r.priceDate).filter(Boolean).sort().at(-1);
fs.writeFileSync(OUT, JSON.stringify({ source: 'naver+yahoo', collectedAt: new Date().toISOString(), base, stat, items: ok }));
note(`썼다 ${OUT} (${(fs.statSync(OUT).size / 1e6).toFixed(2)}MB) 기준일 ${base}`);
fs.writeFileSync('data/etfh/kr.log.txt', log.join('\n') + '\n');
