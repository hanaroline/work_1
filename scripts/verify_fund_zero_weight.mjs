#!/usr/bin/env node
/**
 * 펀드 검산 6차 — 비중 0 은 "0" 인가 "모름" 인가.
 *
 *   node scripts/verify_fund_zero_weight.mjs
 *   -> tools/discovery/fund_zero_weight.{json,md}
 *
 * 화면 시험이 걸렸다. 원천이 보유종목의 `weight` 를 **정확히 0** 으로 주는
 * 펀드가 있다.
 *
 *   KR5223702725  TURK SISE VE CAM F · PETKIM PETROKIMYA
 *   K55223D11016  J SAINSBURY PLC
 *
 * 이것이 갈려야 화면에 무엇을 찍을지 정해진다.
 *
 *   진짜 0 이면 → "0.00%" 로 찍는다. 원천이 그렇게 말했으니 옮기는 것이다.
 *   모름이면   → 빈칸으로 둔다. 없는 것을 0 이라고 하면 "안 담았다" 는
 *                거짓 진술이 되고, 그 함정이 ETF 화면 731종목을 거짓말하게
 *                만들었다.
 *
 * 짐작으로 정하지 않는다. 원자료를 보고 가른다.
 *
 * ── 가르는 법 ───────────────────────────────────────────────────────────────
 *
 * 원천 JSON 에서 그 자리가 `0` 인지 `null` 인지부터 본다. 둘은 다른 값이고,
 * 수집기는 이미 구별한다(`num(null)` 은 `null`, `num(0)` 은 `0`).
 *
 * 그다음 **비중의 합**을 본다. 터키 주식형 펀드가 터키 유리·석유화학 대표
 * 종목을 0% 담았다는 것은 이상하다. 다만 그 펀드의 나머지 비중이 100% 를
 * 채우고 있다면, 0 인 종목은 아주 작아서 반올림된 것이고 원천의 0 은 참이다.
 * 반대로 합이 한참 모자라면 0 이 "모름" 을 덮어쓴 것일 수 있다.
 *
 * 마지막으로 **0 인 종목이 그 펀드에서 차지하는 몫**을 본다. 한 펀드의
 * 보유종목이 전부 0 이면 그것은 비중을 안 주는 것이지 0 인 것이 아니다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_zero_weight.json';
const OUT_MD = 'tools/discovery/fund_zero_weight.md';
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

const out = { at: new Date().toISOString(), errors: [] };
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[fund-zero] 중단:', e?.message || e);
  process.exit(1);
});

// ── 1. 걸린 펀드의 원자료 ───────────────────────────────────────────────────
console.log('=== 1. 걸린 펀드의 원자료 ===');
const CASES = ['KR5223702725', 'K55223D11016'];
out.cases = [];
for (const code of CASES) {
  const row = { code };
  try {
    const [lp, cp] = await Promise.all([
      getJson(`${API}/${code}/left-panel`),
      getJson(`${API}/${code}/chart-price-panel`),
    ]);
    row.name = lp?.detail?.fundName ?? null;
    row.type = lp?.detail?.parentPeerGroupName ?? null;
    const pf = cp?.allocationsPortfolio?.result || [];
    row.portfolio = pf;
    // JSON 에서 그 자리가 0 인지 null 인지. 둘은 다른 값이다.
    row.zeroCount = pf.filter((h) => h.weight === 0).length;
    row.nullCount = pf.filter((h) => h.weight == null).length;
    row.count = pf.length;
    row.sum = pf.reduce((s, h) => s + (typeof h.weight === 'number' ? h.weight : 0), 0);
    console.log(`\n  ── ${code} ${row.name} (${row.type})`);
    console.log(`     ${row.count}종목 · 0 인 것 ${row.zeroCount} · null 인 것 ${row.nullCount} · ` +
      `비중 합 ${(row.sum * 100).toFixed(2)}%`);
    console.log('     ' + pf.slice(0, 14).map((h) => `${h.itemName}=${h.weight}`).join('\n     '));
  } catch (e) {
    row.error = String(e.message || e).slice(0, 140);
    console.log(`  ${code} 오류: ${row.error}`);
  }
  out.cases.push(row);
  await sleep(200);
}

// ── 2. 얼마나 흔한가, 그리고 합은 채워지는가 ────────────────────────────────
console.log('\n\n=== 2. 표본에서 0 이 얼마나 되나 ===');
const pool = [];
for (let p = 0; p < 60; p += 1) {
  try {
    const d = await getJson(`${API}?page=${p}&size=20`);
    if (!d?.funds?.length) break;
    pool.push(...d.funds);
  } catch (e) { out.errors.push(`page ${p}: ${String(e.message || e)}`); break; }
}
const codes = [...new Set(pool.map((f) => f.fundCode))];
const N = 400;
const step = Math.max(1, Math.floor(codes.length / N));
const sample = codes.filter((_, i) => i % step === 0).slice(0, N);
for (const c of CASES) if (!sample.includes(c)) sample.push(c);

const rows = await mapLimit(sample, 6, async (code) => {
  const cp = await getJson(`${API}/${code}/chart-price-panel`);
  const pf = cp?.allocationsPortfolio?.result || [];
  await sleep(40);
  if (!pf.length) return null;
  const zero = pf.filter((h) => h.weight === 0).length;
  const nul = pf.filter((h) => h.weight == null).length;
  const sum = pf.reduce((s, h) => s + (typeof h.weight === 'number' ? h.weight : 0), 0);
  return { code, n: pf.length, zero, nul, sumPct: +(sum * 100).toFixed(2) };
}, (done, total) => console.log(`  ${done}/${total}`));

const ok = rows.filter((r) => r?.ok && r.value).map((r) => r.value);
const withZero = ok.filter((r) => r.zero > 0);
const allZero = ok.filter((r) => r.zero === r.n);
const withNull = ok.filter((r) => r.nul > 0);

out.summary = {
  fundsWithHoldings: ok.length,
  withZero: withZero.length,
  allZero: allZero.length,
  withNull: withNull.length,
  // 0 인 종목이 있는 펀드의 비중 합. 100% 근처면 0 은 진짜 0 이다.
  sumWhenZero: withZero.map((r) => r.sumPct).sort((a, b) => a - b),
};
const med = (a) => (a.length ? a[Math.floor(a.length / 2)] : null);
out.summary.medianSumWhenZero = med(out.summary.sumWhenZero);
const sumsAll = ok.map((r) => r.sumPct).sort((a, b) => a - b);
out.summary.medianSumAll = med(sumsAll);

console.log(`\n  보유종목이 있는 펀드 ${ok.length}`);
console.log(`  0 인 종목이 있는 펀드 ${withZero.length}`);
console.log(`  전부 0 인 펀드       ${allZero.length}   ← 있으면 그건 "모름" 이다`);
console.log(`  null 인 종목이 있는 펀드 ${withNull.length}`);
console.log(`  비중 합 중앙값: 전체 ${out.summary.medianSumAll}% · 0 이 있는 펀드 ${out.summary.medianSumWhenZero}%`);

if (allZero.length) {
  console.log('\n  전부 0 인 펀드:');
  for (const r of allZero.slice(0, 10)) console.log(`    ${r.code} ${r.n}종목 전부 0`);
}

// 판정.
// 전부 0 인 펀드가 없고, 0 이 있는 펀드의 비중 합이 100% 근처라면
// 0 은 "아주 작아 반올림된 진짜 0" 이다.
const verdictZeroIsReal = allZero.length === 0 &&
  out.summary.medianSumWhenZero != null && out.summary.medianSumWhenZero > 80;
out.zeroIsReal = verdictZeroIsReal;
out.verdict = verdictZeroIsReal
  ? `0 은 진짜 0 이다 — 전부 0 인 펀드 없음, 0 이 있는 펀드의 비중 합 중앙값 ${out.summary.medianSumWhenZero}%`
  : `가려지지 않았다 — 전부 0 인 펀드 ${allZero.length}, 비중 합 중앙값 ${out.summary.medianSumWhenZero}%`;
console.log(`\n판정: ${out.verdict}`);
await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const md = ['# 비중 0 은 "0" 인가 "모름" 인가 (6차)', '', `조사 시각: ${out.at}`, '',
  `**${out.verdict}**`, '',
  '화면 시험이 걸렸다. 원천이 보유종목의 `weight` 를 **정확히 0** 으로 주는',
  '펀드가 있다. 이것이 갈려야 화면에 무엇을 찍을지 정해진다.', '',
  '| 뜻 | 화면 |', '|---|---|',
  '| 진짜 0 | `0.00%` 로 찍는다. 원천이 그렇게 말했으니 옮기는 것이다 |',
  '| 모름 | 빈칸으로 둔다. 없는 것을 0 이라고 하면 "안 담았다" 는 거짓이 된다 |', '',
  '## 1. 걸린 펀드의 원자료', ''];
for (const c of out.cases) {
  md.push(`### ${c.code} — ${c.name ?? '–'} (${c.type ?? '–'})`, '');
  if (c.error) { md.push(`오류: ${c.error}`, ''); continue; }
  md.push(`${c.count}종목 · \`weight === 0\` 인 것 **${c.zeroCount}** · ` +
    `\`weight == null\` 인 것 **${c.nullCount}** · 비중 합 **${(c.sum * 100).toFixed(2)}%**`, '',
    '```json', JSON.stringify(c.portfolio, null, 2).slice(0, 1600), '```', '');
}
md.push('## 2. 표본에서 얼마나 되나', '',
  '| 항목 | 수 |', '|---|---:|',
  `| 보유종목이 있는 펀드 | ${out.summary.fundsWithHoldings} |`,
  `| 0 인 종목이 있는 펀드 | ${out.summary.withZero} |`,
  `| **전부 0 인 펀드** | **${out.summary.allZero}** |`,
  `| null 인 종목이 있는 펀드 | ${out.summary.withNull} |`,
  `| 비중 합 중앙값 (전체) | ${out.summary.medianSumAll}% |`,
  `| 비중 합 중앙값 (0 이 있는 펀드) | ${out.summary.medianSumWhenZero}% |`, '',
  out.zeroIsReal
    ? '전부 0 인 펀드가 없고, 0 이 있는 펀드도 나머지 비중이 100% 를 채운다.\n' +
      '곧 0 은 **아주 작아 반올림된 진짜 0** 이며 화면에 `0.00%` 로 찍는 것이 맞다.\n' +
      '(원천이 비중을 아예 안 줄 때는 `null` 이 오고, 수집기는 그것을 빈칸으로 둔다.)'
    : '**아직 갈리지 않았다.** 화면에 0 을 찍기 전에 더 봐야 한다.', '');
if (out.errors.length) {
  md.push('## 오류', '');
  for (const e of out.errors.slice(0, 20)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[fund-zero] ${OUT_MD} · ${OUT_JSON} 기록`);
