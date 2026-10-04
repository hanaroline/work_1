#!/usr/bin/env node
/**
 * 펀드 필드 검산 5차 — 감사가 잡은 것이 자료의 잘못인가 내 규칙의 잘못인가.
 *
 *   node scripts/verify_fund_fields.mjs
 *   -> tools/discovery/fund_fields_verify.{json,md}
 *
 * 첫 전수 수집(3,196개)에서 감사가 오류 39건을 잡아 커밋을 막았다. 8개 펀드에
 * 몰려 있다. ETF 감사에서 처음 잡은 7,252건 중 대부분이 **내 규칙이 틀린**
 * 오탐이었으므로, 고치기 전에 실물을 본다.
 *
 * ── 물어볼 것 셋 ────────────────────────────────────────────────────────────
 *
 * **1. derivedAum 과 derivedNav 가 정말 설정액과 순자산인가.**
 *
 * 나는 그렇게 이름 붙였고, "순자산이 설정액의 20배를 넘거나 1/20 아래면
 * 한쪽이 다른 단위" 라는 규칙을 걸었다. 그런데 7개 펀드가 0.00~0.05배로
 * 걸렸고 그 대부분이 **인버스·2배 레버리지**다. 인버스 2배가 설정 이후
 * 90% 넘게 빠지는 것은 이상한 일이 아니다.
 *
 * 표본에서 눈에 띈 것이 있다. 피델리티글로벌테크놀로지는
 *
 *   derivedNav / derivedAum = 4,611,116,881,228 / 774,093,701,808 = 5.957
 *   basePrice / 1000        = 5,956.79 / 1000                     = 5.957
 *
 * 두 값이 소수 셋째 자리까지 같다. 이게 우연이 아니라면 derivedAum 은
 * **설정원본**(액면 1,000 기준 원본)이고 derivedNav 는 현재 순자산이며,
 * 둘의 비는 곧 기준가다. 그렇다면 인버스 2배의 0.01배는 자료 오류가 아니라
 * "설정 이후 99% 빠졌다" 는 **정확한 진술**이고, 내 규칙이 틀린 것이다.
 *
 * 관계가 성립하면 훨씬 센 규칙으로 바꿀 수 있다 — 20배 같은 헐렁한 한도
 * 대신 `derivedNav / derivedAum == basePrice / 1000` 을 직접 검산한다.
 *
 * **2. 하나클래스원특별자산투자신탁3 의 5년 +1,517% 가 진짜인가.**
 *
 * 내 한도(비배율 400%)에 걸렸다. 특별자산 펀드가 5년에 16배가 될 수 있는지,
 * 기준가 계열로 되짚는다. ETF 에서 2배 레버리지의 1년 +843% 를 오류로 잡았다가
 * 기준가 +903% 와 맞는 실제 값이었던 자리와 같은 종류의 물음이다.
 *
 * **3. 이지스글로벌부동산 229 의 비중 777억% 는 어디서 왔나.**
 *
 * `LUXEMBOURG INVESTMENT 271` 의 weight 가 777,216,227 로 온다(내가 100 을
 * 곱하기 전 값). 비중은 소수(0.09 = 9%)로 오는 자리다. 같은 펀드의
 * derivedNav 는 1 이다. 원천 레코드가 깨진 것으로 보이는데, 원자료를 찍어
 * 확인한다. 깨진 것이면 **그 값을 싣지 않는다** — 0 으로 바꾸지도 않는다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_fields_verify.json';
const OUT_MD = 'tools/discovery/fund_fields_verify.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const API = 'https://stock.naver.com/api/fund/funds';

const headers = {
  'User-Agent': UA, Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  Referer: 'https://stock.naver.com/domestic/fund',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, tries = 3) {
  let last;
  for (let i = 1; i <= tries; i += 1) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) { last = e; if (i < tries) await sleep(400 * 2 ** (i - 1)); }
  }
  throw last;
}
async function mapLimit(items, limit, fn, onTick) {
  const out = new Array(items.length);
  let next = 0, done = 0;
  async function worker() {
    for (;;) {
      const i = next; next += 1;
      if (i >= items.length) return;
      try { out[i] = { ok: true, value: await fn(items[i], i) }; }
      catch (e) { out[i] = { ok: false, error: `${e.name}: ${e.message}` }; }
      done += 1;
      if (onTick && done % 50 === 0) onTick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  if (onTick) onTick(done, items.length);
  return out;
}
function num(v) {
  if (v == null || v === '' || v === '-') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

const out = { at: new Date().toISOString(), errors: [] };
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[fund-fields] 중단:', e?.message || e);
  process.exit(1);
});

// ── 1. derivedNav / derivedAum == basePrice / 1000 인가 ──────────────────────
console.log('=== 1. derivedNav / derivedAum vs basePrice / 1000 ===');
const pool = [];
for (let p = 0; p < 60; p += 1) {
  try {
    const d = await getJson(`${API}?page=${p}&size=20`);
    if (!d?.funds?.length) break;
    pool.push(...d.funds);
  } catch (e) { out.errors.push(`page ${p}: ${String(e.message || e)}`); break; }
}
const codes = [...new Set(pool.map((f) => f.fundCode))];
// 감사가 잡은 펀드는 반드시 넣는다.
const FLAGGED = ['KR5231388533', 'KR5101786519', 'K55302CE8539', 'K55383CG1310',
                 'KR5206393211', 'K55223BI3525', 'K55232BI6568', 'KR5102725276'];
const N = 400;
const step = Math.max(1, Math.floor(codes.length / N));
const sample = codes.filter((_, i) => i % step === 0).slice(0, N);
for (const c of FLAGGED) if (!sample.includes(c)) sample.push(c);
console.log(`  표본 ${sample.length}개`);

const rows = await mapLimit(sample, 6, async (code) => {
  const lp = await getJson(`${API}/${code}/left-panel`);
  const d = lp?.detail || {};
  const aum = num(d.derivedAum), nav = num(d.derivedNav), bp = num(d.basePrice);
  await sleep(50);
  return {
    code, name: d.fundName ?? null, type: d.parentPeerGroupName ?? null,
    aum, nav, basePrice: bp,
    navOverAum: (aum && nav != null && aum !== 0) ? nav / aum : null,
    bpOver1000: bp == null ? null : bp / 1000,
  };
}, (done, total) => console.log(`  ${done}/${total}`));

const ok = rows.filter((r) => r?.ok).map((r) => r.value);
const testable = ok.filter((r) => r.navOverAum != null && r.bpOver1000 != null && r.bpOver1000 > 0);
// 상대오차로 견준다. 절대차로 보면 배수가 큰 펀드에서만 커 보인다.
for (const r of testable) {
  r.relErr = Math.abs(r.navOverAum - r.bpOver1000) / r.bpOver1000;
}
const near1 = testable.filter((r) => r.relErr < 0.01).length;
const near5 = testable.filter((r) => r.relErr < 0.05).length;
out.identity = {
  scanned: ok.length, testable: testable.length,
  within1pct: near1, within5pct: near5,
  worst: testable.slice().sort((a, b) => b.relErr - a.relErr).slice(0, 12)
    .map((r) => ({ code: r.code, name: r.name, navOverAum: +r.navOverAum.toFixed(4),
                   bpOver1000: +r.bpOver1000.toFixed(4), relErr: +r.relErr.toFixed(4) })),
};
console.log(`  검산 가능 ${testable.length}개 · 1% 안 ${near1} · 5% 안 ${near5}`);
console.log('  가장 어긋난 것:');
for (const r of out.identity.worst.slice(0, 8)) {
  console.log(`    ${r.code} nav/aum ${String(r.navOverAum).padStart(12)} vs 기준가/1000 ${String(r.bpOver1000).padStart(12)} · 상대오차 ${r.relErr}`);
}

// 감사가 잡은 7개가 이 관계로는 멀쩡한지 따로 본다.
out.flagged = ok.filter((r) => FLAGGED.includes(r.code)).map((r) => ({
  code: r.code, name: r.name, type: r.type, aum: r.aum, nav: r.nav,
  basePrice: r.basePrice,
  navOverAum: r.navOverAum == null ? null : +r.navOverAum.toFixed(6),
  bpOver1000: r.bpOver1000 == null ? null : +r.bpOver1000.toFixed(6),
  relErr: r.relErr == null ? null : +r.relErr.toFixed(4),
}));
console.log('\n  감사가 잡은 펀드:');
for (const r of out.flagged) {
  console.log(`    ${r.code} ${(r.name || '').slice(0, 24).padEnd(26)} ` +
    `nav/aum ${String(r.navOverAum).padStart(12)} · 기준가/1000 ${String(r.bpOver1000).padStart(12)} · ` +
    `상대오차 ${r.relErr}`);
}

// ── 2. 5년 +1,517% 가 진짜인가 ───────────────────────────────────────────────
console.log('\n=== 2. 하나클래스원특별자산투자신탁3 의 5년 수익률 ===');
const BIG = 'KR5102725276';
out.bigReturn = { code: BIG };
try {
  const [lp, cp, s5y, s3m] = await Promise.all([
    getJson(`${API}/${BIG}/left-panel`),
    getJson(`${API}/${BIG}/chart-price-panel`),
    getJson(`${API}/${BIG}/base-price/chart?term=5y`),
    getJson(`${API}/${BIG}/base-price/chart?term=3m`),
  ]);
  const d = lp?.detail || {};
  out.bigReturn.name = d.fundName;
  out.bigReturn.type = d.parentPeerGroupName;
  out.bigReturn.basePrice = num(d.basePrice);
  out.bigReturn.inceptionDate = d.inceptionDate;
  out.bigReturn.source = Object.fromEntries((cp?.fundReturns?.returns || [])
    .map((r) => [r.term, r.fundReturn]));
  const ser = (s5y?.series || []).map((p) => ({ day: p.tradeDate, v: num(p.basePrice) }))
    .filter((p) => p.v);
  const dser = (s3m?.series || []).map((p) => ({ day: p.tradeDate, v: num(p.basePrice) }))
    .filter((p) => p.v);
  out.bigReturn.series5y = ser;
  const last = dser[dser.length - 1] || ser[ser.length - 1];
  const first = ser[0];
  if (first && last) {
    out.bigReturn.seriesCum = +((last.v / first.v - 1) * 100).toFixed(2);
    out.bigReturn.from = first;
    out.bigReturn.to = last;
  }
  console.log(`  ${out.bigReturn.name} (${out.bigReturn.type}) 설정 ${out.bigReturn.inceptionDate}`);
  console.log(`  원천 5년 ${out.bigReturn.source['5y']}% · 계열 ${first?.day} ${first?.v} → ${last?.day} ${last?.v}`);
  console.log(`  계열 전체 누적 ${out.bigReturn.seriesCum}%`);
  console.log(`  기준가 ${out.bigReturn.basePrice}`);
} catch (e) {
  out.bigReturn.error = String(e.message || e).slice(0, 140);
  console.log(`  오류: ${out.bigReturn.error}`);
}

// ── 3. 비중 777억% 는 어디서 왔나 ────────────────────────────────────────────
console.log('\n=== 3. 이지스글로벌부동산 229 의 보유종목 원자료 ===');
const BAD = 'K55383CG1310';
out.badWeight = { code: BAD };
try {
  const [lp, cp] = await Promise.all([
    getJson(`${API}/${BAD}/left-panel`),
    getJson(`${API}/${BAD}/chart-price-panel`),
  ]);
  out.badWeight.detail = lp?.detail || null;
  out.badWeight.availability = cp?.availability || null;
  out.badWeight.portfolio = cp?.allocationsPortfolio?.result || null;
  out.badWeight.assets = cp?.allocationsAssets || null;
  console.log(`  ${lp?.detail?.fundName} · derivedAum ${lp?.detail?.derivedAum} · derivedNav ${lp?.detail?.derivedNav}`);
  console.log('  portfolio: ' + JSON.stringify(out.badWeight.portfolio));
  console.log('  assets: ' + JSON.stringify(out.badWeight.assets).slice(0, 300));
} catch (e) {
  out.badWeight.error = String(e.message || e).slice(0, 140);
  console.log(`  오류: ${out.badWeight.error}`);
}

// 비중이 소수 범위를 벗어나는 펀드가 얼마나 되나. 방어선의 크기를 잡는다.
console.log('\n=== 3b. 비중이 소수(0~1) 범위를 벗어나는 펀드 ===');
const wRows = await mapLimit(sample.slice(0, 250), 6, async (code) => {
  const cp = await getJson(`${API}/${code}/chart-price-panel`);
  const pf = cp?.allocationsPortfolio?.result || [];
  const bad = pf.filter((h) => {
    const w = num(h.weight);
    return w != null && (w > 1.5 || w < -1.5);
  }).map((h) => ({ name: h.itemName, weight: h.weight }));
  await sleep(50);
  return { code, n: pf.length, bad };
}, (done, total) => console.log(`  ${done}/${total}`));
const wOk = wRows.filter((r) => r?.ok).map((r) => r.value);
const wBad = wOk.filter((r) => r.bad.length);
out.weightOutOfRange = { scanned: wOk.length, funds: wBad.length,
                         rows: wBad.slice(0, 20) };
console.log(`  훑은 펀드 ${wOk.length} · 비중이 범위 밖인 펀드 ${wBad.length}`);
for (const r of wBad.slice(0, 10)) {
  console.log(`    ${r.code} ${r.bad.slice(0, 2).map((b) => `${b.name}=${b.weight}`).join(' | ')}`);
}

out.verdict =
  `nav/aum=기준가/1000 이 ${near1}/${testable.length} (1% 안) · ` +
  `비중 범위 밖 ${wBad.length}/${wOk.length}개 펀드`;
console.log(`\n판정: ${out.verdict}`);
await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const nf = (v, d = 4) => (v == null ? '–' : Number(v).toFixed(d));
const md = ['# 펀드 필드 검산 (5차) — 자료의 잘못인가 규칙의 잘못인가', '',
  `조사 시각: ${out.at}`, '', `**${out.verdict}**`, '',
  '첫 전수 수집(3,196개)에서 감사가 오류 39건을 잡아 커밋을 막았다. 8개 펀드에',
  '몰려 있다. ETF 감사에서 처음 잡은 7,252건 중 대부분이 내 규칙이 틀린',
  '오탐이었으므로, 고치기 전에 실물을 본다.', '',
  '## 1. derivedAum·derivedNav 가 무엇인가', '',
  '`derivedNav / derivedAum` 이 `basePrice / 1000` 과 같은지 본다. 같다면',
  'derivedAum 은 **설정원본**(액면 1,000 기준)이고 derivedNav 는 현재 순자산이며,',
  '둘의 비는 곧 기준가다.', '',
  `| 항목 | 수 |`, `|---|---:|`,
  `| 훑은 펀드 | ${ok.length} |`,
  `| 검산 가능 | ${testable.length} |`,
  `| 상대오차 1% 안 | ${near1} |`,
  `| 상대오차 5% 안 | ${near5} |`, '',
  '### 감사가 잡은 펀드', '',
  '| 표준코드 | 펀드 | 유형 | nav/aum | 기준가/1000 | 상대오차 |',
  '|---|---|---|---:|---:|---:|'];
for (const r of out.flagged) {
  md.push(`| ${r.code} | ${(r.name || '').slice(0, 26)} | ${r.type ?? '–'} | ` +
    `${nf(r.navOverAum, 6)} | ${nf(r.bpOver1000, 6)} | ${nf(r.relErr)} |`);
}
md.push('', '### 가장 어긋난 펀드', '',
  '| 표준코드 | nav/aum | 기준가/1000 | 상대오차 |', '|---|---:|---:|---:|');
for (const r of out.identity.worst) {
  md.push(`| ${r.code} | ${nf(r.navOverAum)} | ${nf(r.bpOver1000)} | ${nf(r.relErr)} |`);
}
md.push('', '## 2. 5년 +1,517% 가 진짜인가', '');
if (out.bigReturn.error) md.push(`오류: ${out.bigReturn.error}`, '');
else {
  md.push(`**${out.bigReturn.name}** (${out.bigReturn.type}) · 설정 ${out.bigReturn.inceptionDate} · ` +
    `기준가 ${out.bigReturn.basePrice}`, '',
    '| 기간 | 원천 |', '|---|---:|');
  for (const [k, v] of Object.entries(out.bigReturn.source || {})) {
    md.push(`| ${k} | ${nf(v, 2)} |`);
  }
  md.push('', `계열: ${out.bigReturn.from?.day} ${out.bigReturn.from?.v} → ` +
    `${out.bigReturn.to?.day} ${out.bigReturn.to?.v} · 전체 누적 **${nf(out.bigReturn.seriesCum, 2)}%**`, '',
    '5년 계열 (달 간격):', '',
    '| 일자 | 기준가 |', '|---|---:|');
  for (const p of (out.bigReturn.series5y || [])) md.push(`| ${p.day} | ${p.v} |`);
}
md.push('', '## 3. 비중 777억% 는 어디서 왔나', '');
if (out.badWeight.error) md.push(`오류: ${out.badWeight.error}`, '');
else {
  md.push('`left-panel.detail`:', '', '```json',
    JSON.stringify(out.badWeight.detail, null, 2).slice(0, 1200), '```', '',
    '`chart-price-panel.allocationsPortfolio.result`:', '', '```json',
    JSON.stringify(out.badWeight.portfolio, null, 2).slice(0, 800), '```', '');
}
md.push('### 비중이 소수 범위를 벗어나는 펀드', '',
  `표본 ${out.weightOutOfRange.scanned}개 중 **${out.weightOutOfRange.funds}개**.`, '',
  '| 표준코드 | 종목 | 원천 weight |', '|---|---|---:|');
for (const r of out.weightOutOfRange.rows) {
  for (const b of r.bad.slice(0, 2)) md.push(`| ${r.code} | ${b.name} | ${b.weight} |`);
}
if (out.errors.length) {
  md.push('', '## 오류', '');
  for (const e of out.errors.slice(0, 30)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[fund-fields] ${OUT_MD} · ${OUT_JSON} 기록`);
