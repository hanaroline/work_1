// 해외 상장 ETF 상위 — 미국·홍콩·일본(야후 스크리너 순자산 순) + 중국 본토(동방재부 목록)
// 편입종목·섹터·보수·순자산(야후 quoteSummary), 원가격 일봉·분배금(야후 chart), 환율.
//
// 쓰는 곳: data/etfh/global.json
// 수집률 기준: 미국·홍콩·일본에서 편입종목을 받은 종목이 70% 이상(본토는 원천이 없어 분모에서 뺀다).
//
// 사용: node scripts/etfh_collect_global.mjs [--us 60 --hk 30 --jp 30 --cn 30]

import fs from 'node:fs';
import { num, get, pool, sleep, cleanBars, trIndex, periodReturns } from './etfh_lib.mjs';

const OUT = 'data/etfh/global.json';
const MIN_COVERAGE = 0.7;
const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(`--${k}`) ? Number(args[args.indexOf(`--${k}`) + 1]) : d);
const N = { us: arg('us', 60), hk: arg('hk', 30), jp: arg('jp', 30), cn: arg('cn', 30) };
const log = [];
const note = (s) => { log.push(s); console.log(s); };

// ── 쿠키 + crumb ──
let cookie = '';
{
  const r = await fetch('https://fc.yahoo.com', { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => null);
  cookie = (r?.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
}
const crumb = (await get('https://query1.finance.yahoo.com/v1/test/getcrumb', { headers: { Cookie: cookie } })).text.trim();
note(`crumb ${crumb ? '있음' : '없음'}`);
const yh = { Cookie: cookie };

// ── 1. 목록 ──
async function screener(region, size) {
  const body = JSON.stringify({ size, offset: 0, sortField: 'fundnetassets', sortType: 'DESC', quoteType: 'ETF', query: { operator: 'AND', operands: [{ operator: 'eq', operands: ['region', region] }] }, userId: '', userIdType: 'guid' });
  const r = await get(`https://query2.finance.yahoo.com/v1/finance/screener?crumb=${encodeURIComponent(crumb)}&lang=en-US&region=US&formatted=false`, { method: 'POST', body, headers: { ...yh, 'Content-Type': 'application/json' } });
  return JSON.parse(r.text).finance.result[0].quotes;
}
const pick = [];
for (const [region, mkt] of [['us', 'US'], ['hk', 'HK'], ['jp', 'JP']]) {
  const qs = await screener(region, 150);
  const seen = new Set();
  let n = 0;
  for (const q of qs) {
    const nm = String(q.shortName || q.longName || '');
    // 홍콩은 같은 펀드가 위안(8xxxx)·달러(9xxx) 창구로 또 올라온다. 이름 끝 -R/-U 와,
    // 순자산·이름이 같은 짝은 한 번만 넣는다(홍콩달러 창구를 남긴다).
    if (mkt === 'HK' && /-\s*[RU]\s*$/i.test(nm)) continue;
    const dupKey = `${nm.replace(/-\s*[RU]\s*$/i, '').trim()}|${q.netAssets ?? q.fundNetAssets}`;
    if (seen.has(dupKey)) continue;
    seen.add(dupKey);
    pick.push({ symbol: q.symbol, market: mkt, screenName: nm });
    if (++n >= N[region]) break;
  }
  note(`${mkt} 스크리너 ${qs.length}개 중 ${n}개`);
}
// 중국 본토 — 야후 스크리너가 0개를 준다(본토 ETF 를 ETF 로 분류하지 않음). 동방재부 목록.
let cnNote = null;
try {
  const u = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=${N.cn * 3}&po=1&np=1&fltt=2&invt=2&fid=f20&fs=b:MK0021,b:MK0022,b:MK0023,b:MK0024&fields=f12,f13,f14,f20`;
  const r = await get(u, { headers: { Referer: 'https://quote.eastmoney.com/' } });
  const diff = JSON.parse(r.text).data?.diff || [];
  const rows = (Array.isArray(diff) ? diff : Object.values(diff)).filter((x) => num(x.f20) !== null);
  let n = 0;
  for (const x of rows) {
    const sym = `${x.f12}.${x.f13 === 1 ? 'SS' : 'SZ'}`;
    pick.push({ symbol: sym, market: x.f13 === 1 ? 'SH' : 'SZ', cnName: x.f14, cnMcap: num(x.f20) });
    if (++n >= N.cn) break;
  }
  note(`중국 본토 동방재부 목록 ${rows.length}개 중 ${n}개`);
} catch (e) {
  cnNote = `중국 본토 목록을 받지 못함: ${e.message || e}`;
  note(cnNote);
}

// ── 2. 종목마다 ──
const SECTOR = { technology: 'IT', financial_services: '금융', industrials: '산업재', healthcare: '헬스케어', consumer_cyclical: '경기소비재', consumer_defensive: '필수소비재', communication_services: '커뮤니케이션', basic_materials: '소재', energy: '에너지', utilities: '유틸리티', realestate: '부동산' };
const pct = (x) => { const v = num(x); return v === null ? null : Math.round(v * 1e6) / 1e4; };

async function chart(sym) {
  const p1 = Math.floor(Date.UTC(2015, 0, 1) / 1000), p2 = Math.floor(Date.now() / 1000) + 86400;
  const r = await get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?period1=${p1}&period2=${p2}&interval=1d&events=div%7Csplit`, { tries: 4 });
  const res = JSON.parse(r.text).chart?.result?.[0];
  if (!res) return null;
  const tz = (res.meta?.gmtoffset ?? 0) * 1000;
  const dateOf = (t) => new Date(t * 1000 + tz).toISOString().slice(0, 10);
  const ts = res.timestamp || [];
  const cl = res.indicators?.quote?.[0]?.close || [];
  const raw = ts.map((t, i) => ({ d: dateOf(t), c: cl[i], t }));
  let bars = cleanBars(raw);
  const empty = raw.length - bars.length;
  // 장이 아직 열려 있으면 마지막 봉은 확정이 아니다
  const reg = res.meta?.currentTradingPeriod?.regular;
  const nowS = Date.now() / 1000;
  const lastT = raw.filter((x) => num(x.c) !== null).at(-1)?.t;
  if (reg && lastT && lastT >= reg.start && nowS < reg.end && bars.length) bars = bars.slice(0, -1);
  const divs = Object.values(res.events?.dividends || {}).map((x) => ({ d: dateOf(x.date), a: x.amount }));
  return { meta: res.meta, bars, divs, empty };
}

async function one(p) {
  const rec = { code: p.symbol, market: p.market };
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(p.symbol)}?modules=quoteType,price,topHoldings,fundProfile,summaryDetail,defaultKeyStatistics&crumb=${encodeURIComponent(crumb)}`;
  const q = JSON.parse((await get(url, { headers: yh, tries: 4 })).text).quoteSummary?.result?.[0] || {};
  rec.name = q.quoteType?.longName || q.price?.longName || p.screenName || p.cnName || p.symbol;
  if (p.cnName) rec.nameLocal = p.cnName;
  rec.quoteType = q.quoteType?.quoteType || null;
  rec.currency = q.price?.currency || null;
  rec.exch = q.quoteType?.exchange || null;
  rec.issuer = q.fundProfile?.family || null;
  rec.category = q.fundProfile?.categoryName || null;
  rec.index = null; // 야후는 기초지수 이름을 주지 않는다
  rec.aum = num(q.summaryDetail?.totalAssets) ?? num(q.defaultKeyStatistics?.totalAssets);
  rec.aumSrc = rec.aum !== null ? 'Yahoo totalAssets' : null;
  if (rec.aum === null && p.cnMcap) { rec.aum = p.cnMcap; rec.aumSrc = 'Eastmoney 시가총액'; } // 출처가 다르다 — 순위·평균에서 뺀다
  rec.fee = pct(q.fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio ?? q.defaultKeyStatistics?.annualReportExpenseRatio);
  rec.divYield = pct(q.summaryDetail?.yield);
  const th = q.topHoldings || {};
  rec.cash = pct(th.cashPosition);
  rec.positions = { stock: pct(th.stockPosition), bond: pct(th.bondPosition), cash: pct(th.cashPosition), other: pct(th.otherPosition), preferred: pct(th.preferredPosition), convertible: pct(th.convertiblePosition) };
  const sec = {};
  for (const o of th.sectorWeightings || []) for (const [k, v] of Object.entries(o)) { const w = pct(v); if (w !== null && SECTOR[k]) sec[SECTOR[k]] = (sec[SECTOR[k]] || 0) + w; }
  rec.sectors = Object.keys(sec).length ? sec : null;
  rec.holdings = (th.holdings || []).map((h) => ({ code: h.symbol || null, name: h.holdingName || h.symbol || '', w: pct(h.holdingPercent) }));
  rec.sharesOut = num(q.defaultKeyStatistics?.sharesOutstanding);
  rec.mcap = num(q.price?.marketCap);
  rec.dev = null; rec.te = null; rec.flow3m = null; // 원천에 없다 — 짐작해 채우지 않는다

  const c = await chart(p.symbol);
  if (c) {
    rec.listed = c.meta?.firstTradeDate ? new Date((c.meta.firstTradeDate + (c.meta.gmtoffset || 0)) * 1000).toISOString().slice(0, 10) : null;
    rec.price = c.bars.at(-1)?.c ?? null;
    rec.priceDate = c.bars.at(-1)?.d ?? null;
    rec.firstBar = c.bars[0]?.d ?? null;
    rec.emptyBars = c.empty;
    rec.divSrc = `Yahoo ${p.symbol}`;
    rec.divCount = c.divs.length;
    // 본토 머니마켓 ETF 는 수익을 좌수로 나눠 주고 가격은 100 근처에 머문다. 야후 분배 기록이
    // 0건이라 가격으로 세면 10년 0% 가 나온다 — 틀린 값이므로 비운다(이름은 동방재부 목록의 '货币').
    if (p.cnName && /货币|现金|快线|理财/.test(p.cnName)) { rec.ret = { base: rec.priceDate, r: null }; rec.retNote = 'cn_mmf_units'; }
    else rec.ret = periodReturns(c.bars, trIndex(c.bars, c.divs));
  } else rec.ret = { base: null, r: null };
  return rec;
}

const recs = await pool(pick, 3, async (p) => { const r = await one(p); await sleep(300); return r; });

// 발행좌수·시가총액(v7 quote) — 순자산이 이 상장 클래스 값인지 펀드 전체 값인지 가르는 데 쓴다.
// (BND 는 뮤추얼펀드 클래스까지, 3455.HK 는 미국 QQQ 본펀드 값을 준다.)
for (let i = 0; i < pick.length; i += 40) {
  const syms = pick.slice(i, i + 40).map((p) => p.symbol);
  try {
    const j = JSON.parse((await get(`https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(syms.join(','))}&crumb=${encodeURIComponent(crumb)}`, { headers: yh })).text);
    for (const q of j.quoteResponse?.result || []) {
      const r = recs.find((x) => x && x.code === q.symbol);
      if (!r) continue;
      r.sharesOut = num(q.sharesOutstanding) ?? r.sharesOut;
      r.mcap = num(q.marketCap) ?? r.mcap;
      r.quoteCurrency = q.currency || null;
      r.financialCurrency = q.financialCurrency || null;
    }
  } catch (e) { note(`v7 quote 실패 ${e.message}`); }
  await sleep(500);
}
const ok = recs.filter((r) => r && !r.error);
recs.forEach((r, i) => { if (r?.error) note(`  실패 ${pick[i].symbol}: ${r.error}`); });

// 환율 — 원화 환산 병기용(기준일 종가)
const fx = {};
for (const [cur, sym] of [['USD', 'KRW=X'], ['HKD', 'HKDKRW=X'], ['JPY', 'JPYKRW=X'], ['CNY', 'CNYKRW=X']]) {
  try {
    const r = JSON.parse((await get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d`)).text).chart.result[0];
    fx[cur] = { rate: num(r.meta.regularMarketPrice), at: new Date(r.meta.regularMarketTime * 1000).toISOString(), src: `Yahoo ${sym}` };
  } catch (e) { note(`환율 ${sym} 실패 ${e.message}`); }
}

const nonCn = ok.filter((r) => !['SH', 'SZ'].includes(r.market));
const cov = nonCn.length ? nonCn.filter((r) => r.holdings.length).length / pick.filter((p) => !['SH', 'SZ'].includes(p.market)).length : 0;
const byMkt = {};
for (const r of ok) { const m = (byMkt[r.market] ||= { n: 0, holdings: 0, returns: 0 }); m.n++; if (r.holdings.length) m.holdings++; if (r.ret?.r) m.returns++; }
note(`받음 ${ok.length}/${pick.length} · 시장별 ${JSON.stringify(byMkt)} · 편입 수집률(본토 제외) ${(cov * 100).toFixed(1)}%`);
fs.mkdirSync('data/etfh', { recursive: true });
fs.writeFileSync('data/etfh/global.log.txt', log.join('\n') + '\n');
if (cov < MIN_COVERAGE) { note(`수집률 미달 — ${OUT} 을 덮어쓰지 않는다`); fs.writeFileSync('data/etfh/global.log.txt', log.join('\n') + '\n'); process.exit(2); }
fs.writeFileSync(OUT, JSON.stringify({ source: 'yahoo+eastmoney', collectedAt: new Date().toISOString(), fx, cnNote, stat: { target: pick.length, got: ok.length, byMarket: byMkt, coverage: cov }, items: ok }));
note(`썼다 ${OUT} (${(fs.statSync(OUT).size / 1e6).toFixed(2)}MB)`);
fs.writeFileSync('data/etfh/global.log.txt', log.join('\n') + '\n');
