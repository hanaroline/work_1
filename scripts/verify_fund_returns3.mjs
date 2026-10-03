#!/usr/bin/env node
/**
 * 펀드 기간수익률 검산 3차 — 계단 탐지 규칙을 실물로 검증한다.
 *
 *   node scripts/verify_fund_returns3.mjs
 *   -> tools/discovery/fund_returns_verify3.{json,md}
 *
 * 2차에서 계단의 정체가 갈렸다. 기준가 재산정이다.
 *
 *   골든브릿지으뜸단기  2026-07-31   974.57  (그날 등락률 +0.002%)
 *                      2026-08-03  3356.48  (그날 등락률 +244.406%)
 *
 * 하루에 0.002% 씩 움직이던 단기채권 펀드가 하루 만에 3.44배가 됐다.
 * 네이버 자신도 `prices/daily` 에 그날 등락률을 244.4% 로 적는다. 곧 원천은
 * 앞뒤가 맞고, 다만 그 값이 수익률이 아니라 **재산정**일 뿐이다.
 *
 * ── 그런데 내 탐지 규칙이 틀렸다 ────────────────────────────────────────────
 *
 * 2차에서 골든브릿지스마트단기채(원천 1개월 +215.04%)를 **놓쳤다.**
 * 계열을 직접 찍어 보니 계단이 분명히 있었다.
 *
 *   2026-07-31   958.93
 *   2026-08-03  3017.16      ← 3.147배
 *
 * 놓친 이유는 내가 배율을 **하루당으로 환산**했기 때문이다. 사이에 주말이
 * 끼어 사흘로 나뉘자 3.147^(1/3) = 1.466 이 되어 1.5 문턱 아래로 내려갔다.
 * 주말은 사흘어치 복리가 아니다. 규칙이 틀렸고, 하필 **놓치는 쪽**으로
 * 틀렸다 — 그대로 두었으면 화면에 +215% 가 나갔다.
 *
 * ── 고친 규칙 ──────────────────────────────────────────────────────────────
 *
 * 보편 상수를 하나 정해 놓고 모든 펀드에 들이대는 대신, **그 펀드 자신의
 * 평소 움직임**과 견준다. 하루 0.002% 씩 움직이던 펀드의 3.15배와, 하루 3%
 * 씩 움직이는 2배 레버리지의 35% 는 크기는 비슷해도 뜻이 다르다.
 *
 *   로그수익률의 중앙값절대편차(MAD)로 그 펀드의 평소 폭을 잰다.
 *   |로그수익률| 이 (가) 절대 바닥을 넘고 (나) 평소 폭의 8배를 넘으면 계단.
 *
 * 절대 바닥이 왜 필요한가 — 하루 0.001% 씩 움직이는 채권형은 0.5% 만 움직여도
 * 500배가 된다. 바닥이 없으면 정상적인 하루가 계단으로 잡힌다.
 * 평소 폭 조건이 왜 필요한가 — 바닥만 쓰면 변동이 큰 펀드의 정상적인 하루가
 * 잡힌다.
 *
 * ── 이 검산이 판정하는 것 ───────────────────────────────────────────────────
 *
 * 규칙을 믿고 화면을 만들기 전에, 규칙이 무엇을 잡고 무엇을 놓치는지 센다.
 * 바깥 자료 없이 가를 수 있는 반증 지표가 하나 있다 — **원천 스스로의 앞뒤**.
 *
 *   1일 +0.006% · 1주 +0.043% · 1개월 +244.9%
 *
 * 한 주에 0.04% 움직인 펀드가 그 주를 포함한 한 달에 245% 오를 수는 없다.
 * 계열을 안 보고도 이건 틀렸다고 말할 수 있다. 그래서 이 "앞뒤 안 맞음" 을
 * 대조군으로 삼아 규칙의 놓침과 헛잡음을 센다.
 *
 *   놓침  — 앞뒤가 안 맞는데 계단으로 안 잡힌 펀드 (위험한 쪽)
 *   헛잡음 — 계단으로 잡혔는데 앞뒤는 맞는 펀드
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_returns_verify3.json';
const OUT_MD = 'tools/discovery/fund_returns_verify3.md';
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
  console.error('[fund-verify3] 중단:', e?.message || e);
  process.exit(1);
});

async function series(code, term) {
  const d = await getJson(`${API}/${code}/base-price/chart?term=${term}`);
  return (d?.series || [])
    .map((p) => ({ day: p.tradeDate, v: num(p.basePrice) }))
    .filter((p) => p.day && p.v != null && p.v > 0);
}

/** 중앙값. */
const median = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * 계단 탐지 — 그 펀드 자신의 평소 폭과 견준다.
 *
 * @param floorRatio 절대 바닥. 이만큼도 안 움직였으면 계단이 아니다.
 *                   계열이 성길수록(주·월 간격) 한 칸의 정상 폭이 크므로 높인다.
 * @param k          평소 폭(MAD 로 잰 표준편차)의 몇 배를 계단으로 볼 것인가.
 */
function findSteps(rows, { floorRatio, k = 8 } = {}) {
  if (rows.length < 5) return [];
  const lr = [];
  for (let i = 1; i < rows.length; i += 1) lr.push(Math.log(rows[i].v / rows[i - 1].v));
  const med = median(lr) ?? 0;
  const mad = median(lr.map((x) => Math.abs(x - med))) ?? 0;
  // MAD 를 정규분포의 표준편차로 되돌리는 상수. 0 이면(완전히 평평한 계열)
  // 평소 폭 조건이 무의미하므로 바닥만 본다.
  const sigma = mad * 1.4826;
  const floor = Math.log(floorRatio);
  const steps = [];
  for (let i = 0; i < lr.length; i += 1) {
    const x = Math.abs(lr[i] - med);
    if (x <= floor) continue;                       // (가) 절대 바닥
    if (sigma > 0 && x <= k * sigma) continue;      // (나) 평소 폭의 k 배
    const days = Math.max(1,
      Math.round((Date.parse(rows[i + 1].day) - Date.parse(rows[i].day)) / 864e5));
    steps.push({ day: rows[i + 1].day, prevDay: rows[i].day, gapDays: days,
                 from: +rows[i].v.toFixed(2), to: +rows[i + 1].v.toFixed(2),
                 ratio: +(rows[i + 1].v / rows[i].v).toFixed(4),
                 sigmas: sigma > 0 ? +(x / sigma).toFixed(1) : null });
  }
  return steps;
}

// 계열마다 한 칸이 덮는 기간이 다르므로 바닥을 달리 잡는다.
const SERIES_SPEC = [
  { term: '3m', floorRatio: 1.25 },   // 하루 간격 — 펀드가 하루에 25% 는 안 움직인다
  { term: '1y', floorRatio: 1.6 },    // 주 간격
  { term: '5y', floorRatio: 2.2 },    // 월 간격
];

/**
 * 원천 수익률 벡터 스스로 앞뒤가 맞는가.
 *
 * 계열을 보지 않고도 말할 수 있는 것만 본다. 짧은 구간이 거의 0 인데 그것을
 * 품은 긴 구간이 통째로 튀면, 그 사이 어딘가에서 값이 아닌 것이 끼어든 것이다.
 * 대조군이므로 **아주 보수적으로** 잡는다 — 조금이라도 애매하면 세지 않는다.
 */
function incoherent(src) {
  const g = (k) => (src?.[k] == null ? null : Number(src[k]));
  const pairs = [['1w', '1m', 50], ['1m', '3m', 50], ['3m', '6m', 50], ['6m', '1y', 50]];
  for (const [shortK, longK, jump] of pairs) {
    const s = g(shortK), l = g(longK);
    if (s == null || l == null) continue;
    // 짧은 구간이 ±3% 안인데 긴 구간이 ±50% 밖이면 앞뒤가 안 맞는다.
    if (Math.abs(s) < 3 && Math.abs(l) > jump) return { pair: `${shortK}→${longK}`, short: s, long: l };
  }
  return null;
}

// ── 표본 ─────────────────────────────────────────────────────────────────────
console.log('=== 표본 모으기 ===');
const pool = [];
for (let p = 0; p < 160; p += 1) {
  try {
    const d = await getJson(`${API}?page=${p}&size=20`);
    if (!d?.funds?.length) break;
    pool.push(...d.funds);
  } catch (e) { out.errors.push(`page ${p}: ${String(e.message || e)}`); break; }
  if (p % 40 === 0) console.log(`  ${p}페이지 · 누적 ${pool.length}`);
}
const uniq = new Map(pool.map((f) => [f.fundCode, f]));
const codes = [...uniq.keys()];
console.log(`  전체 ${codes.length}개`);

// 넓게 본다. 계단은 드문 사건이라 표본이 작으면 규칙을 검증할 수 없다.
const N = 700;
const step = Math.max(1, Math.floor(codes.length / N));
const sample = codes.filter((_, i) => i % step === 0).slice(0, N);
for (const c of ['K55309BY1419', 'K55309BQ0684', 'K55306B99307', 'K55235B39916']) {
  if (!sample.includes(c)) sample.push(c);
}
console.log(`  표본 ${sample.length}개 · 호출 ${sample.length * 4}회`);
out.sampleSize = sample.length;
out.universe = codes.length;

// ── 훑기 ─────────────────────────────────────────────────────────────────────
console.log('\n=== 계열 훑기 ===');
const rows = await mapLimit(sample, 6, async (code) => {
  const [cp, s3m, s1y, s5y] = await Promise.all([
    getJson(`${API}/${code}/chart-price-panel`),
    series(code, '3m'), series(code, '1y'), series(code, '5y'),
  ]);
  const src = {};
  for (const r of cp?.fundReturns?.returns || []) {
    if (r.fundReturn != null) src[r.term] = r.fundReturn;
  }
  const sets = { '3m': s3m, '1y': s1y, '5y': s5y };
  const steps = [];
  for (const spec of SERIES_SPEC) {
    for (const st of findSteps(sets[spec.term], spec)) steps.push({ ...st, term: spec.term });
  }
  await sleep(50);
  return { code, src, steps, inc: incoherent(src),
           points: { '3m': s3m.length, '1y': s1y.length, '5y': s5y.length } };
}, (done, total) => console.log(`  ${done}/${total}`));

const ok = rows.filter((r) => r?.ok).map((r) => r.value);
out.failed = rows.filter((r) => r && !r.ok).length;
console.log(`  성공 ${ok.length} · 실패 ${out.failed}`);

// ── 판정 ─────────────────────────────────────────────────────────────────────
console.log('\n=== 규칙 검증 ===');
const flagged = ok.filter((r) => r.steps.length);
const inconsistent = ok.filter((r) => r.inc);
const missed = inconsistent.filter((r) => !r.steps.length);          // 위험한 쪽
const falsePos = flagged.filter((r) => !r.inc);
const both = flagged.filter((r) => r.inc);

out.stats = {
  scanned: ok.length,
  flagged: flagged.length,
  incoherent: inconsistent.length,
  caught: both.length,
  missed: missed.length,
  flaggedButCoherent: falsePos.length,
};
console.log(`  훑은 펀드            ${ok.length}`);
console.log(`  계단으로 잡힌 펀드   ${flagged.length}`);
console.log(`  원천 앞뒤가 안 맞음  ${inconsistent.length}`);
console.log(`  둘 다 (잡음)         ${both.length}`);
console.log(`  놓침 (위험한 쪽)     ${missed.length}`);
console.log(`  잡혔지만 앞뒤는 맞음 ${falsePos.length}`);

out.missed = missed.map((r) => ({ code: r.code, inc: r.inc, src: r.src, points: r.points }));
out.caught = both.map((r) => ({ code: r.code, inc: r.inc, steps: r.steps.slice(0, 3) }));
out.falsePos = falsePos.map((r) => ({ code: r.code, steps: r.steps.slice(0, 3),
                                      src1m: r.src['1m'] ?? null, src1y: r.src['1y'] ?? null }));

if (missed.length) {
  console.log('\n  놓친 펀드:');
  for (const r of out.missed.slice(0, 20)) {
    console.log(`    ${r.code} ${r.inc.pair} ${r.inc.short}% → ${r.inc.long}% · 계열 ${JSON.stringify(r.points)}`);
  }
}
if (falsePos.length) {
  console.log('\n  잡혔지만 앞뒤는 맞는 펀드 (헛잡음 후보):');
  for (const r of out.falsePos.slice(0, 20)) {
    const s = r.steps[0];
    console.log(`    ${r.code} ${s.term} ${s.prevDay}→${s.day} ${s.ratio}배 ${s.sigmas}σ · 1개월 ${r.src1m}`);
  }
}

// 잡힌 계단의 크기 분포. 문턱을 어디에 두어야 하는지 눈으로 본다.
const allSteps = flagged.flatMap((r) => r.steps);
out.stepRatios = allSteps.map((s) => ({ term: s.term, ratio: s.ratio, sigmas: s.sigmas, gapDays: s.gapDays }))
  .sort((a, b) => b.ratio - a.ratio);
console.log(`\n  잡힌 계단 ${allSteps.length}건 · 배율 상위: ` +
  out.stepRatios.slice(0, 10).map((s) => `${s.ratio}(${s.term})`).join(' '));

out.verdict = `표본 ${ok.length} · 계단 ${flagged.length} · 앞뒤 안 맞음 ${inconsistent.length} · ` +
  `놓침 ${missed.length} · 헛잡음 후보 ${falsePos.length}`;
console.log(`\n판정: ${out.verdict}`);

await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const nf = (v, d = 2) => (v == null ? '–' : Number(v).toFixed(d));
const md = ['# 펀드 계단 탐지 규칙 검증 (3차)', '', `조사 시각: ${out.at}`, '',
  `**${out.verdict}**`, '',
  '2차의 탐지 규칙이 틀렸다. 배율을 하루당으로 환산하는 바람에 주말이 낀 계단이',
  '문턱 아래로 내려갔다 — 골든브릿지스마트단기채(3.147배)가 3.147^(1/3)=1.466 이',
  '되어 1.5 문턱을 통과했다. 하필 **놓치는 쪽**으로 틀렸고, 그대로 두었으면',
  '화면에 +215% 가 나갔다.', '',
  '고친 규칙은 보편 상수 대신 **그 펀드 자신의 평소 폭**(로그수익률 MAD)과 견준다.', '',
  '## 규칙', '',
  '| 계열 | 한 칸 간격 | 절대 바닥 | 평소 폭 배수 |', '|---|---|---:|---:|',
  ...SERIES_SPEC.map((s) => `| \`term=${s.term}\` | ${s.term === '3m' ? '하루' : s.term === '1y' ? '주' : '월'} | ${s.floorRatio}배 | 8σ |`),
  '', '두 조건을 **모두** 넘어야 계단으로 본다.', '',
  '- 절대 바닥만 쓰면 변동이 큰 펀드의 정상적인 하루가 잡힌다.',
  '- 평소 폭만 쓰면 하루 0.001% 씩 움직이는 채권형이 0.5% 만 움직여도 500σ 가 된다.', '',
  '## 검증', '',
  '바깥 자료 없이 가를 수 있는 반증 지표로 **원천 스스로의 앞뒤**를 쓴다.',
  '짧은 구간이 ±3% 안인데 그것을 품은 긴 구간이 ±50% 밖이면 앞뒤가 안 맞는다 —',
  '한 주에 0.04% 움직인 펀드가 그 주를 포함한 한 달에 245% 오를 수는 없다.', '',
  '| 항목 | 수 |', '|---|---:|',
  `| 훑은 펀드 | ${ok.length} |`,
  `| 계단으로 잡힌 펀드 | ${flagged.length} |`,
  `| 원천 앞뒤가 안 맞는 펀드 | ${inconsistent.length} |`,
  `| 둘 다 — 규칙이 잡아냄 | ${both.length} |`,
  `| **놓침 (위험한 쪽)** | **${missed.length}** |`,
  `| 잡혔지만 앞뒤는 맞음 | ${falsePos.length} |`, ''];

if (missed.length) {
  md.push('### 놓친 펀드', '', '규칙이 더 손봐져야 한다는 뜻이다.', '',
    '| 표준코드 | 어긋난 짝 | 짧은 구간 | 긴 구간 | 계열 점수 |', '|---|---|---:|---:|---|');
  for (const r of out.missed.slice(0, 40)) {
    md.push(`| ${r.code} | ${r.inc.pair} | ${nf(r.inc.short)} | ${nf(r.inc.long)} | ${JSON.stringify(r.points)} |`);
  }
  md.push('');
} else {
  md.push('### 놓친 펀드 없음', '',
    '앞뒤가 안 맞는 펀드는 모두 계단으로 잡혔다.', '');
}
if (falsePos.length) {
  md.push('### 잡혔지만 원천 앞뒤는 맞는 펀드', '',
    '헛잡음일 수도, 앞뒤 검사가 못 잡는 계단일 수도 있다. 실물을 봐야 한다.', '',
    '| 표준코드 | 계열 | 계단 | 배율 | σ | 원천 1개월 |', '|---|---|---|---:|---:|---:|');
  for (const r of out.falsePos.slice(0, 40)) {
    const s = r.steps[0];
    md.push(`| ${r.code} | ${s.term} | ${s.prevDay} → ${s.day} | ${s.ratio} | ${s.sigmas ?? '–'} | ${nf(r.src1m)} |`);
  }
  md.push('');
}
md.push('### 잡아낸 펀드', '', '| 표준코드 | 어긋난 짝 | 짧은 구간 | 긴 구간 | 계단 | 배율 |',
  '|---|---|---:|---:|---|---:|');
for (const r of out.caught.slice(0, 40)) {
  const s = r.steps[0];
  md.push(`| ${r.code} | ${r.inc.pair} | ${nf(r.inc.short)} | ${nf(r.inc.long)} | ` +
    `${s ? `${s.prevDay} → ${s.day}` : '–'} | ${s?.ratio ?? '–'} |`);
}
if (out.errors.length) {
  md.push('', '## 오류', '');
  for (const e of out.errors.slice(0, 30)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[fund-verify3] ${OUT_MD} · ${OUT_JSON} 기록`);
