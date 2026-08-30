#!/usr/bin/env node
/**
 * 랭킹 화면에 인쇄되는 네 칸 — 설정액·순유입·총보수·수익률 — 을 원자료로 되짚는다.
 *
 *   node scripts/verify_rank_fields.mjs
 *
 * 화면에서 눈에 걸린 것이 넷이다. 값을 고치기 전에 **원자료가 무엇을 주는지**
 * 부터 확인한다. 앞서 +1837% 를 그냥 믿었다가 겪은 일을 되풀이하지 않는다.
 *
 *   가. VTI 3150조.  야후 totalAssets 가 **ETF 클래스**의 순자산인가,
 *       아니면 **펀드 전체**(모든 클래스 합계)인가. 뱅가드 ETF 는 인덱스펀드의
 *       한 클래스라 둘이 서너 배 벌어진다. 상장주식수 × 가격 으로 가른다 —
 *       한 클래스뿐인 SPY·IVV 는 1배 가까이 나와야 하고, 뱅가드는 크게 넘어야
 *       한다. 그러면 정의 불일치가 실증된다.
 *
 *   나. 3개월 순유입이 설정액의 두 배인 종목이 서른.  네이버
 *       cumulativeNetInflow3m 이 정말 설정·환매 순액인지, 아니면 매수대금
 *       같은 다른 것인지. 상장한 지 얼마 안 된 종목이면 누적 순유입은
 *       설정액을 넘을 수 없다 — 상장일과 같이 본다.
 *
 *   다. 총보수 0.000%.  거래정지된 러시아 ETF 가 "가장 싼 ETF" 1위에 앉아
 *       있다. 네이버가 주는 원값이 무엇인지, 단위가 % 인지 비율인지.
 *
 *   라. 1년 +370%.  상위·하위 열다섯씩을 원가격에서 다시 계산한다.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { getJson, mapLimit, computeReturns, sleep, UA } from './etf_lib.mjs';

const OUT_MD = 'tools/discovery/rank_fields_verify.md';
const OUT_JSON = 'tools/discovery/rank_fields_verify.json';

const NAVER_DETAIL = (c) => `https://m.stock.naver.com/api/stock/${c}/etfAnalysis`;
// quoteSummary 는 쿠키+crumb 를 요구한다. 수집기와 같은 방식으로 받는다 —
// 이걸 빼먹어서 1차 실행이 상장주식수를 통째로 못 받았다.
let cookie = '';
let crumb = '';
async function authorize() {
  const res = await fetch('https://fc.yahoo.com/', { headers: { 'User-Agent': UA }, redirect: 'follow' })
    .catch(() => null);
  cookie = (res?.headers?.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
  const cr = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb',
    { headers: { 'User-Agent': UA, Cookie: cookie } });
  crumb = (await cr.text()).trim();
  if (!crumb) throw new Error('crumb 발급 실패 — quoteSummary 를 부를 수 없다');
}
const YQ = (sym, mods) =>
  `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(sym)}` +
  `?modules=${mods}&crumb=${encodeURIComponent(crumb)}`;
const YHDR = () => ({ Cookie: cookie, Referer: 'https://finance.yahoo.com/' });
const YCHART = (s, range) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}` +
  `?range=${range}&interval=1d&events=div,split`;

const NAVER_HDR = { Referer: 'https://m.stock.naver.com/' };

const load = async (path) => {
  const src = await readFile(path, 'utf8');
  return JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
};

const fmtKrw = (v) => {
  if (v == null) return '—';
  const a = Math.abs(v);
  if (a >= 1e12) return (v / 1e12).toFixed(2) + '조';
  if (a >= 1e8) return Math.round(v / 1e8).toLocaleString() + '억';
  return Math.round(v).toLocaleString();
};

const out = [];
const say = (s = '') => { out.push(s); console.log(s); };
/** mapLimit 은 결과를 {ok, value} 로 감싸 돌려준다. 벗겨서 쓴다. */
const unwrap = (rows) => rows.map((r) => (r && r.ok ? r.value : { err: r?.error ?? '알 수 없는 실패' }));
const result = { at: new Date().toISOString(), aum: [], flow: [], fee: [], ret: [] };

const DATA = await load('data/etf.js');
const ETFS = DATA.etfs || [];
const byCode = new Map(ETFS.map((e) => [e.code, e]));

say('# 랭킹 네 칸 되짚기');
say('');
say(`- 시각: ${result.at}`);
say(`- 대상: ${ETFS.length}종목 (화면이 쓰는 data/etf.js 그대로)`);
say('');

/* ── 가. 설정액 — 야후 totalAssets 가 무엇을 세는가 ────────────────────── */
say('## 가. 설정액 — `totalAssets` 는 ETF 인가 펀드 전체인가');
say('');
say('상장주식수 × 가격 으로 ETF 클래스의 순자산을 따로 구해 `totalAssets` 와 나눈다.');
say('클래스가 하나뿐인 상품(SPY·IVV·QQQ)은 1배 근처여야 한다. 크게 넘으면');
say('`totalAssets` 가 **펀드 전체**를 세고 있다는 뜻이고, 그러면 국내 ETF 의');
say('순자산총액과 한 줄로 세울 수 없다.');
say('');

await authorize();

// 통화가 섞이면 "몇 배냐" 만 보면 되므로 상관없다. 다만 화면 상위에 실제로
// 오르는 것은 미국 상장분이므로 그쪽을 본다 — 일본 ETF 는 엔화 표기라
// 액면 숫자가 커 보일 뿐 원화로 환산하면 상위에 오지 않는다.
const globals = ETFS.filter((e) => e.market === 'US' && e.aum != null)
  .sort((a, b) => b.aum - a.aum).slice(0, 20);

const aumRows = unwrap(await mapLimit(globals, 3, async (e) => {
  const row = { code: e.code, name: e.name, aum: e.aum, shares: null, px: null, err: null };
  try {
    const j = await getJson(YQ(e.symbol || e.code, 'defaultKeyStatistics,price,summaryDetail,fundProfile'),
      { headers: YHDR() });
    const r = j?.quoteSummary?.result?.[0];
    row.shares = r?.defaultKeyStatistics?.sharesOutstanding?.raw
              ?? r?.price?.sharesOutstanding?.raw ?? null;
    row.px = r?.price?.regularMarketPrice?.raw ?? e.price ?? null;
    row.totalAssets = r?.defaultKeyStatistics?.totalAssets?.raw
                   ?? r?.summaryDetail?.totalAssets?.raw ?? null;
    row.longName = r?.price?.longName ?? null;
    row.legalType = r?.price?.quoteType ?? null;
    row.family = r?.fundProfile?.family ?? null;
  } catch (err) { row.err = err.message; }
  await sleep(150);
  return row;
}));

say('| 종목 | totalAssets | 상장주식수×가격 | 배수 | 판정 |');
say('| --- | ---: | ---: | ---: | --- |');
for (const r of aumRows) {
  const mktCap = r.shares != null && r.px != null ? r.shares * r.px : null;
  const mult = mktCap ? r.aum / mktCap : null;
  r.etfAum = mktCap;
  r.mult = mult;
  r.verdict = mult == null ? '확인 못 함'
    : mult > 1.3 ? '**펀드 전체** — ETF 순자산이 아니다'
    : mult < 0.77 ? '역방향 — 따로 볼 것'
    : 'ETF 순자산과 일치';
  say(`| ${r.code ?? '?'} ${(r.longName || r.name || '').slice(0, 34)}` +
      ` | ${r.aum == null ? '—' : '$' + (r.aum / 1e9).toFixed(0) + 'B'}` +
      ` | ${mktCap == null ? '—' : '$' + (mktCap / 1e9).toFixed(0) + 'B'}` +
      ` | ${mult == null ? '—' : mult.toFixed(2) + '×'} | ${r.verdict}${r.err ? ' (' + r.err + ')' : ''} |`);
}
result.aum = aumRows;
const mismatched = aumRows.filter((r) => r.mult != null && r.mult > 1.3);
say('');
say(`**배수가 1.3 을 넘는 종목: ${mismatched.length} / ${aumRows.filter((r) => r.mult != null).length}**` +
    (mismatched.length ? ` — ${mismatched.map((r) => r.code).join(', ')}` : ''));
say('');

/* ── 나. 순유입 — 누적 순유입이 설정액을 넘는 게 말이 되는가 ──────────── */
say('## 나. 순유입 — `cumulativeNetInflow3m` 이 정말 설정·환매 순액인가');
say('');

const overflow = ETFS.filter((e) => e.market === 'KR' && e.flow?.m3 != null && e.aum > 0
                                 && e.flow.m3 > e.aum)
  .sort((a, b) => b.flow.m3 / b.aum - a.flow.m3 / a.aum);
const flowTop = ETFS.filter((e) => e.market === 'KR' && e.flow?.m3 != null)
  .sort((a, b) => b.flow.m3 - a.flow.m3).slice(0, 8);
const flowTargets = [...new Set([...overflow.slice(0, 8), ...flowTop].map((e) => e.code))];

const flowRows = unwrap(await mapLimit(flowTargets, 2, async (code) => {
  const e = byCode.get(code);
  const row = { code, name: e?.name, storedAum: e?.aum, storedM3: e?.flow?.m3, err: null };
  try {
    const j = await getJson(NAVER_DETAIL(code), { headers: NAVER_HDR });
    row.rawInflow = j?.cumulativeNetInflowList ?? null;
    row.rawTotalNav = j?.totalNav ?? null;
    row.listedDate = j?.listedDate ?? j?.listingDate ?? j?.basicInfo?.listedDate ?? null;
    row.keys = Object.keys(j || {});
  } catch (err) { row.err = err.message; }
  await sleep(250);
  return row;
}));

say('| 종목 | 저장 설정액 | 저장 3M순유입 | 네이버 원값(3M) | 네이버 totalNav | 상장일 |');
say('| --- | ---: | ---: | --- | --- | --- |');
for (const r of flowRows) {
  say(`| ${r.code} ${r.name?.slice(0, 24) ?? ''} | ${fmtKrw(r.storedAum)} | ${fmtKrw(r.storedM3)}` +
      ` | ${r.err ? '오류: ' + r.err : JSON.stringify(r.rawInflow?.cumulativeNetInflow3m ?? null)}` +
      ` | ${JSON.stringify(r.rawTotalNav ?? null)} | ${r.listedDate ?? '—'} |`);
}
result.flow = flowRows;
say('');
const sample = flowRows.find((r) => r.keys?.length);
if (sample) {
  say('네이버 상세 응답의 최상위 칸 이름 (순유입·상장일이 어디 있는지 확인용):');
  say('');
  say('```');
  say(sample.keys.join(', '));
  say('```');
  say('');
  say('`cumulativeNetInflowList` 안의 칸 전부:');
  say('');
  say('```json');
  say(JSON.stringify(sample.rawInflow, null, 2));
  say('```');
  say('');
}

/* ── 다. 총보수 ──────────────────────────────────────────────────────── */
say('## 다. 총보수 — 원값과 단위');
say('');

const feeTargets = ['265690', '360200', '379780', '069500', '102110', '133690', '360750'];
const feeRows = unwrap(await mapLimit(feeTargets, 2, async (code) => {
  const e = byCode.get(code);
  const row = { code, name: e?.name, storedTer: e?.ter, storedSuspended: !!e?.suspended, err: null };
  try {
    const j = await getJson(NAVER_DETAIL(code), { headers: NAVER_HDR });
    row.raw = {};
    for (const [k, v] of Object.entries(j || {})) {
      if ((typeof v === 'string' || typeof v === 'number') &&
          /fee|expense|ratio|nav|inflow|listed|date/i.test(k)) row.raw[k] = v;
    }
    row.totalFee = j?.totalFee ?? null;   // 수집기가 실제로 읽는 칸
    if (code === '069500') row.fullResponse = j;   // 한 종목은 통째로 남긴다
  } catch (err) { row.err = err.message; }
  await sleep(250);
  return row;
}));

say('| 종목 | 저장 TER | 거래정지 | 네이버 원값 |');
say('| --- | ---: | --- | --- |');
for (const r of feeRows) {
  say(`| ${r.code} ${r.name?.slice(0, 26) ?? ''} | ${r.storedTer ?? '—'} | ${r.storedSuspended ? '예' : '아니오'}` +
      ` | ${r.err ? '오류: ' + r.err : 'totalFee=' + JSON.stringify(r.totalFee) + ' · ' + JSON.stringify(r.raw)} |`);
}
result.fee = feeRows;
say('');
const full = feeRows.find((r) => r.fullResponse);
if (full) {
  say('069500 (KODEX 200) 응답의 최상위 칸 전부 — 총보수·순유입이 실제로 어느 칸에 있는지:');
  say('');
  say('```json');
  say(JSON.stringify(Object.fromEntries(Object.entries(full.fullResponse)
    .map(([k, v]) => [k, (v && typeof v === 'object') ? (Array.isArray(v) ? `[배열 ${v.length}]` : Object.keys(v)) : v])), null, 2));
  say('```');
  say('');
}
const naverDown = feeRows.every((r) => r.err) && flowRows.every((r) => r.err);
if (naverDown) say('> **네이버가 러너에서도 안 열렸다.** 아래 판정은 전부 보류다.');
say('');

/* ── 라. 수익률 — 상위·하위 열다섯을 원가격에서 다시 ────────────────── */
say('## 라. 1년 수익률 상위·하위 — 원가격에서 재계산');
say('');

const geared = (e) => (e.flags || []).some((f) => f === 'leverage' || f === 'inverse');
const pool = ETFS.filter((e) => !geared(e) && e.ret?.tr?.Y1 != null);
const sorted = pool.slice().sort((a, b) => b.ret.tr.Y1 - a.ret.tr.Y1);
const retTargets = [...sorted.slice(0, 15), ...sorted.slice(-15)];

const retRows = unwrap(await mapLimit(retTargets, 3, async (e) => {
  const row = { code: e.code, name: e.name, market: e.market, stored: e.ret.tr.Y1, recomputed: null, err: null };
  const sym = e.market === 'KR' ? `${e.code}.KS` : (e.symbol || e.code);
  try {
    const j = await getJson(YCHART(sym, '2y'));
    const r = j?.chart?.result?.[0];
    if (!r) throw new Error('빈 응답');
    const q = r.indicators?.quote?.[0] || {};
    const adj = r.indicators?.adjclose?.[0]?.adjclose;
    const ret = computeReturns(r.timestamp, q.close, adj,
      r.events?.dividends, r.events?.splits);
    row.recomputed = ret?.tr?.Y1 ?? null;
    row.anomalies = ret?.anomalies?.length ?? 0;
  } catch (err) {
    // .KS 가 없으면 코스닥일 수 있다
    if (e.market === 'KR') {
      try {
        const j = await getJson(YCHART(`${e.code}.KQ`, '2y'));
        const r = j?.chart?.result?.[0];
        const q = r?.indicators?.quote?.[0] || {};
        const ret = computeReturns(r.timestamp, q.close,
          r.indicators?.adjclose?.[0]?.adjclose, r.events?.dividends, r.events?.splits);
        row.recomputed = ret?.tr?.Y1 ?? null;
      } catch (e2) { row.err = err.message + ' / ' + e2.message; }
    } else row.err = err.message;
  }
  await sleep(150);
  return row;
}));

say('| 종목 | 화면 1년 | 야후 원가격 재계산 | 차이 |');
say('| --- | ---: | ---: | ---: |');
let big = 0;
for (const r of retRows) {
  const d = r.recomputed != null && r.stored != null ? r.stored - r.recomputed : null;
  if (d != null && Math.abs(d) > 2) big += 1;
  r.diff = d;
  say(`| ${r.code ?? '?'} ${r.name?.slice(0, 26) ?? ''} | ${r.stored == null ? '—' : r.stored.toFixed(2) + '%'}` +
      ` | ${r.recomputed == null ? (r.err ? '오류: ' + r.err.slice(0, 30) : '—') : r.recomputed.toFixed(2) + '%'}` +
      ` | ${d == null ? '—' : (d >= 0 ? '+' : '') + d.toFixed(2) + '%p'} |`);
}
result.ret = retRows;
say('');
say(`**2%p 넘게 벌어진 종목: ${big} / ${retRows.filter((r) => r.recomputed != null).length}**`);
say('');
say('> 국내 ETF 는 네이버가 준 값을 그대로 쓰고, 여기 재계산은 야후 원가격에서 낸다.');
say('> 두 원천이 분배금을 다르게 다루므로 몇 %p 차이는 있을 수 있다. 두 자릿수로');
say('> 벌어지는 것만 문제로 본다.');

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_MD, out.join('\n') + '\n');
await writeFile(OUT_JSON, JSON.stringify(result, null, 2));
console.log(`\n기록: ${OUT_MD}, ${OUT_JSON}`);
