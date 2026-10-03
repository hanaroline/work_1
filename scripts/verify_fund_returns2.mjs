#!/usr/bin/env node
/**
 * 펀드 기간수익률 검산 2차 — 계단을 실물로 확인한다.
 *
 *   node scripts/verify_fund_returns2.mjs
 *   -> tools/discovery/fund_returns_verify2.{json,md}
 *
 * 1차에서 갈린 것과 안 갈린 것이 있다.
 *
 * 갈린 것 — **원천 값은 원천 계열과 앞뒤가 맞는다.** 244.939% 는 네이버가
 * 어디선가 잘못 가져온 값이 아니라, 네이버 자신의 기준가 계열에서 그대로
 * 나오는 값이었다(내 재계산과 소수 넷째 자리까지 일치).
 *
 *   골든브릿지으뜸단기  2026-05-27  973.86
 *                      2026-07-27  974.52
 *                      2026-08-27 3361.50   ← 여기
 *
 * 곧 문제는 수익률 계산이 아니라 **기준가 계열 자체에 계단이 있다**는 것이다.
 * 단기채권 펀드의 기준가가 한 달 만에 3.45배가 될 수는 없다. ETF 에서
 * 2558.T 의 3개월 -89.75% 가 바로 이 모양이었다(액면분할 계단).
 *
 * 안 갈린 것 두 가지 — 둘 다 **내 1차 검산이 틀린 것**이다.
 *
 *   (가) 6개월·1년·3년·5년이 표본 0건이었다. 가장 긴 계열을 고를 때
 *        기간의 길이가 아니라 **점의 개수**로 골랐기 때문이다. term=3m 이
 *        64점으로 가장 많았지만 3개월치뿐이고, term=5y 는 60점으로 5년치다.
 *        긴 term 은 성기게 솎아 준다. 개수가 아니라 **기간**으로 골라야 한다.
 *   (나) 계단이 하루짜리인지 여러 날에 걸친 것인지 1차에서는 알 수 없었다.
 *        계열의 처음과 끝만 저장했기 때문이다.
 *
 * 그래서 2차에서 셋을 확인한다.
 *
 *   1. 계단의 실물 — 원자료 계열을 통째로 찍어 어느 날 몇 배가 뛰었는지 본다
 *   2. 계단이 수익률인가 재산정인가 — `prices/daily` 의 changeRate 로 가른다.
 *      그날의 등락률이 0.01% 인데 기준가가 3.45배 뛰었다면 그것은 수익률이
 *      아니라 **기준가 재산정**이다. 네이버 자신이 두 곳에 다른 말을 싣는다.
 *   3. 몇 종목이나 이런가 — 표본 250종목에서 계단을 세어 규모를 잡는다.
 *      이 수가 화면과 감사의 방어선을 정한다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_returns_verify2.json';
const OUT_MD = 'tools/discovery/fund_returns_verify2.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const API = 'https://stock.naver.com/api/fund/funds';

const headers = {
  'User-Agent': UA,
  Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  Referer: 'https://stock.naver.com/domestic/fund/K55235B39916/total',
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
      if (onTick && done % 25 === 0) onTick(done, items.length);
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
  console.error('[fund-verify2] 중단:', e?.message || e);
  process.exit(1);
});

function num(v) {
  if (v == null || v === '' || v === '-') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** base-price/chart 한 번. 오래된 것부터 온 계열을 [{day,v}] 로. */
async function series(code, term) {
  const d = await getJson(`${API}/${code}/base-price/chart?term=${term}`);
  return (d?.series || [])
    .map((p) => ({ day: p.tradeDate, v: num(p.basePrice) }))
    .filter((p) => p.day && p.v != null && p.v > 0);
}

/**
 * 계열의 계단을 찾는다.
 *
 * 성긴 계열(1년·5년은 주·월 단위로 솎여 온다)에서는 두 점 사이가 며칠씩
 * 벌어지므로, 배율만 보면 정상적인 등락도 계단으로 잡힌다. 그래서 **하루당**
 * 얼마나 움직였는지로 본다. 채권형이든 2배 레버리지든 하루에 1.5배가 되지는
 * 않는다.
 */
function findSteps(rows, { minRatio = 1.5 } = {}) {
  const steps = [];
  for (let i = 1; i < rows.length; i += 1) {
    const r = rows[i].v / rows[i - 1].v;
    const days = Math.max(1,
      Math.round((Date.parse(rows[i].day) - Date.parse(rows[i - 1].day)) / 864e5));
    // 하루당 배율. 사흘에 걸친 1.6배는 계단이 아니라 등락일 수 있다.
    const perDay = Math.pow(r, 1 / days);
    if (perDay > minRatio || perDay < 1 / minRatio) {
      steps.push({ day: rows[i].day, prevDay: rows[i - 1].day, gapDays: days,
                   from: rows[i - 1].v, to: rows[i].v,
                   ratio: +r.toFixed(4), perDay: +perDay.toFixed(4) });
    }
  }
  return steps;
}

// ── 1. term 을 기간으로 다시 고른다 ──────────────────────────────────────────
// 1차의 잘못을 바로잡는다. 점의 개수가 아니라 계열이 덮는 **기간**으로 고른다.
console.log('=== 1. term 별 기간과 성김 ===');
const PROBE = 'K55309BY1419';
const TERMS = ['1m', '3m', '6m', '1y', '3y', '5y'];
out.terms = [];
for (const term of TERMS) {
  const row = { term };
  try {
    const s = await series(PROBE, term);
    row.points = s.length;
    row.from = s[0]?.day ?? null;
    row.to = s[s.length - 1]?.day ?? null;
    if (s.length > 1) {
      const spanDays = (Date.parse(row.to) - Date.parse(row.from)) / 864e5;
      row.spanDays = Math.round(spanDays);
      row.avgGapDays = +(spanDays / (s.length - 1)).toFixed(1);
    }
  } catch (e) { row.error = String(e.message || e).slice(0, 60); }
  console.log(`  term=${term.padEnd(3)} ${String(row.points ?? '–').padStart(3)}점 · ` +
    `${row.from ?? '–'} ~ ${row.to ?? '–'} · ${String(row.spanDays ?? '–').padStart(4)}일 · ` +
    `평균간격 ${row.avgGapDays ?? '–'}일`);
  out.terms.push(row);
  await sleep(150);
}
// 짧은 구간은 촘촘한 계열로, 긴 구간은 성긴 계열로 본다. 둘 다 필요하다.
const DAILY_TERM = '3m';   // 하루 간격 — 1개월·3개월과 계단 탐지용
const LONG_TERM = '5y';    // 5년치 — 6개월·1년·3년·5년용
console.log(`  → 촘촘한 계열 term=${DAILY_TERM} · 긴 계열 term=${LONG_TERM}`);

// ── 2. 계단의 실물 ───────────────────────────────────────────────────────────
console.log('\n=== 2. 계단의 실물 (원자료 계열) ===');
const CASES = [
  ['K55309BY1419', '골든브릿지으뜸단기 (원천 1개월 244.9%)'],
  ['K55309BQ0684', '골든브릿지스마트단기채 (215.0%)'],
  ['K55306B99307', '다올전단채 (55.5%)'],
  ['K55235B39916', '피델리티글로벌테크 (7.2% · 정상 대조군)'],
];
out.cases = [];
for (const [code, why] of CASES) {
  const row = { code, why };
  try {
    const [daily, long] = await Promise.all([series(code, DAILY_TERM), series(code, LONG_TERM)]);
    row.daily = daily;
    row.long = long;
    row.stepsDaily = findSteps(daily);
    row.stepsLong = findSteps(long);

    console.log(`\n  ── ${code} ${why}`);
    console.log(`     ${DAILY_TERM} 계열 ${daily.length}점 · 계단 ${row.stepsDaily.length}건`);
    for (const s of row.stepsDaily) {
      console.log(`       ${s.prevDay} ${s.from} → ${s.day} ${s.to} (${s.ratio}배 · ${s.gapDays}일)`);
    }
    // 계단 앞뒤 며칠을 찍어 하루짜리인지 본다.
    if (row.stepsDaily.length) {
      const at = row.stepsDaily[0].day;
      const i = daily.findIndex((p) => p.day === at);
      console.log('       앞뒤: ' + daily.slice(Math.max(0, i - 3), i + 3)
        .map((p) => `${p.day} ${p.v}`).join(' | '));

      // 그날 네이버가 스스로 뭐라고 하는지 — prices/daily 의 changeRate.
      // 기준가가 3.45배 뛴 날의 등락률이 0.01% 라면, 그 계단은 수익률이 아니다.
      try {
        const pd = await getJson(`${API}/${code}/prices/daily?date=${at}&size=10`);
        row.dailyQuotes = (pd?.prices || []).map((p) => ({
          day: p.tradeDate, basePrice: num(p.basePrice),
          changePrice: p.changePrice, changeRate: p.changeRate }));
        console.log('       prices/daily: ' + row.dailyQuotes.slice(0, 6)
          .map((p) => `${p.day} ${p.basePrice}(${p.changeRate}%)`).join(' | '));
      } catch (e) { row.dailyQuotesError = String(e.message || e).slice(0, 80); }
    }
  } catch (e) { row.error = String(e.message || e).slice(0, 120); }
  out.cases.push(row);
  await sleep(200);
}

// ── 3. 긴 계열로 6개월·1년·3년·5년을 검산한다 ────────────────────────────────
console.log('\n=== 3. 긴 계열로 6개월~5년 검산 ===');
const PERIODS = [
  { key: '1m', back: (d) => d.setMonth(d.getMonth() - 1), years: 1 / 12, daily: true },
  { key: '3m', back: (d) => d.setMonth(d.getMonth() - 3), years: 0.25, daily: true },
  { key: '6m', back: (d) => d.setMonth(d.getMonth() - 6), years: 0.5 },
  { key: '1y', back: (d) => d.setFullYear(d.getFullYear() - 1), years: 1 },
  { key: '3y', back: (d) => d.setFullYear(d.getFullYear() - 3), years: 3 },
  { key: '5y', back: (d) => d.setFullYear(d.getFullYear() - 5), years: 5 },
];

// 표본을 넓게 잡는다. 계단이 몇 종목이나 되는지가 방어선을 정한다.
const pool = [];
for (let p = 0; p < 40; p += 1) {
  try {
    const d = await getJson(`${API}?page=${p}&size=20`);
    if (!d?.funds?.length) break;
    pool.push(...d.funds);
  } catch (e) { out.errors.push(`page ${p}: ${String(e.message || e)}`); break; }
  if (p % 10 === 0) await sleep(100);
}
const uniq = new Map(pool.map((f) => [f.fundCode, f]));
for (const [code] of CASES) if (!uniq.has(code)) uniq.set(code, { fundCode: code });
const codes = [...uniq.keys()];
// 목록 순서에 쏠리지 않게 고르게 솎는다.
const N = 250;
const step = Math.max(1, Math.floor(codes.length / N));
const sampleCodes = codes.filter((_, i) => i % step === 0).slice(0, N);
for (const [code] of CASES) if (!sampleCodes.includes(code)) sampleCodes.push(code);
console.log(`  풀 ${codes.length}개 · 표본 ${sampleCodes.length}개`);

const NEAR = 0.5;
const results = await mapLimit(sampleCodes, 6, async (code) => {
  const [perf, dailyS, longS] = await Promise.all([
    getJson(`${API}/${code}/fund-performance`),
    series(code, DAILY_TERM),
    series(code, LONG_TERM),
  ]);
  const src = Object.fromEntries((perf?.periodReturns?.returns || [])
    .map((r) => [r.term, r.fundReturn]));
  const row = { code, source: src,
                dailyPoints: dailyS.length, longPoints: longS.length,
                steps: findSteps(dailyS), longSteps: findSteps(longS),
                diff: {} };
  for (const p of PERIODS) {
    const rows = p.daily ? dailyS : longS;
    if (rows.length < 2) continue;
    const last = rows[rows.length - 1];
    const dt = new Date(`${last.day}T00:00:00Z`);
    p.back(dt);
    const cutoff = dt.toISOString().slice(0, 10);
    if (rows[0].day > cutoff) continue;          // 계열이 구간을 못 덮는다
    let base = null;
    for (const s of rows) { if (s.day <= cutoff) base = s; else break; }
    if (!base || base === last) continue;
    const cum = (last.v / base.v - 1) * 100;
    const ann = (Math.pow(last.v / base.v, 1 / p.years) - 1) * 100;
    const s = src[p.key];
    if (s == null) continue;
    row.diff[p.key] = { source: s, cum: +cum.toFixed(4), ann: +ann.toFixed(4),
                        base: base.day, dCum: +(s - cum).toFixed(4), dAnn: +(s - ann).toFixed(4) };
  }
  await sleep(60);
  return row;
}, (done, total) => console.log(`  검산 ${done}/${total}`));

out.sample = results.filter((r) => r?.ok).map((r) => r.value);
out.sampleFailed = results.filter((r) => r && !r.ok).length;
console.log(`  성공 ${out.sample.length} · 실패 ${out.sampleFailed}`);

// 기간별 일치.
// 긴 계열은 성기게 솎여 오므로 기준일이 최대 한 달까지 어긋난다. 그래서
// 6개월 이상 구간은 "정확히 일치" 를 기대하지 않는다. 여기서 보려는 것은
// **계열의 뜻**(누적이냐 연율이냐)이지 소수점이 아니다.
const tally = {};
for (const p of PERIODS) {
  const cells = out.sample.map((f) => f.diff?.[p.key]).filter(Boolean);
  const near = p.daily ? NEAR : 5;
  tally[p.key] = {
    checked: cells.length,
    matchesCum: cells.filter((c) => Math.abs(c.dCum) < near).length,
    matchesAnn: cells.filter((c) => Math.abs(c.dAnn) < near).length,
    tolerance: near,
  };
}
out.tally = tally;
console.log('\n  기간  검산   누적일치  연율일치  (허용오차)');
for (const p of PERIODS) {
  const t = tally[p.key];
  console.log(`  ${p.key.padEnd(4)} ${String(t.checked).padStart(4)}  ` +
    `${String(t.matchesCum).padStart(8)}  ${String(t.matchesAnn).padStart(8)}  ±${t.tolerance}%p`);
}

// 계단이 몇 종목이나 되는가 — 이 수가 방어선을 정한다.
const withStep = out.sample.filter((f) => f.steps?.length || f.longSteps?.length);
out.stepFunds = withStep.map((f) => ({
  code: f.code,
  steps: (f.steps || []).concat(f.longSteps || []).slice(0, 4),
  source1m: f.source?.['1m'] ?? null, source1y: f.source?.['1y'] ?? null,
}));
console.log(`\n  계단이 있는 펀드: ${withStep.length}/${out.sample.length} ` +
  `(${(withStep.length / Math.max(1, out.sample.length) * 100).toFixed(1)}%)`);
for (const f of out.stepFunds.slice(0, 15)) {
  const s = f.steps[0];
  console.log(`    ${f.code} ${s ? `${s.prevDay}→${s.day} ${s.ratio}배` : ''} · 원천1개월 ${f.source1m}`);
}

// 계단이 있는 펀드의 원천 수익률이 실제로 오염돼 있는가 — |1개월| 이 큰 쪽과
// 겹치는지 본다. 겹치면 "계단 → 거짓 수익률" 이 이어진다는 뜻이다.
const big1m = out.sample.filter((f) => Math.abs(f.source?.['1m'] ?? 0) > 50);
const bigWithStep = big1m.filter((f) => f.steps?.length || f.longSteps?.length);
out.bigMoves = { total: big1m.length, withStep: bigWithStep.length,
                 codes: big1m.map((f) => ({ code: f.code, m1: f.source['1m'],
                                            steps: (f.steps || []).length + (f.longSteps || []).length })) };
console.log(`\n  |1개월| > 50% 인 펀드 ${big1m.length}건 중 계단이 있는 것 ${bigWithStep.length}건`);

const basisOf = (key) => {
  const t = tally[key];
  if (!t?.checked) return '표본 없음';
  if (t.matchesCum >= t.checked * 0.7) return '누적';
  if (t.matchesAnn >= t.checked * 0.7) return '연율';
  return '갈리지 않음';
};
out.basis = Object.fromEntries(PERIODS.map((p) => [p.key, basisOf(p.key)]));
out.verdict =
  `계단 ${withStep.length}/${out.sample.length}종목 · ` +
  `|1개월|>50% ${big1m.length}건 중 계단 ${bigWithStep.length}건 · ` +
  `3년 기준 ${out.basis['3y']} · 5년 기준 ${out.basis['5y']}`;
console.log(`\n판정: ${out.verdict}`);

await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const nf = (v, d = 2) => (v == null ? '–' : Number(v).toFixed(d));
const md = ['# 펀드 기간수익률 검산 2차 — 계단의 실물', '', `조사 시각: ${out.at}`, '',
  `**${out.verdict}**`, '',
  '1차에서 원천 값과 내 재계산이 소수 넷째 자리까지 일치했다. 곧 244.939% 는',
  '네이버가 잘못 가져온 값이 아니라 **네이버 자신의 기준가 계열에서 그대로**',
  '나오는 값이다. 문제는 계산이 아니라 계열에 있다.', '',
  '## 0. term 별 기간과 성김', '',
  '1차에서 가장 긴 계열을 점의 **개수**로 골랐다. 그래서 3개월치(64점)를',
  '골라 놓고 6개월·1년·3년·5년을 하나도 검산하지 못했다. 기간으로 골라야 한다.', '',
  '| term | 점 | 시작 | 끝 | 기간(일) | 평균 간격(일) |', '|---|---:|---|---|---:|---:|'];
for (const t of out.terms) {
  md.push(`| \`${t.term}\` | ${t.points ?? '–'} | ${t.from ?? '–'} | ${t.to ?? '–'} | ` +
    `${t.spanDays ?? '–'} | ${t.avgGapDays ?? '–'} |`);
}
md.push('', `짧은 구간은 \`term=${DAILY_TERM}\`(하루 간격), 긴 구간은 \`term=${LONG_TERM}\` 으로 본다.`, '',
  '## 1. 계단의 실물', '');
for (const c of out.cases) {
  md.push(`### ${c.code} — ${c.why}`, '');
  if (c.error) { md.push(`오류: ${c.error}`, ''); continue; }
  md.push(`\`${DAILY_TERM}\` 계열 ${c.daily?.length ?? 0}점 · 계단 ${c.stepsDaily?.length ?? 0}건`, '');
  if (c.stepsDaily?.length) {
    md.push('| 앞날 | 앞 기준가 | 계단일 | 뒤 기준가 | 배율 | 간격(일) |', '|---|---:|---|---:|---:|---:|');
    for (const s of c.stepsDaily) {
      md.push(`| ${s.prevDay} | ${nf(s.from)} | ${s.day} | ${nf(s.to)} | ${s.ratio} | ${s.gapDays} |`);
    }
    md.push('');
  }
  if (c.dailyQuotes?.length) {
    md.push('그날 네이버가 스스로 적은 등락률 (`prices/daily`):', '',
      '| 일자 | 기준가 | 전일대비 | 등락률 |', '|---|---:|---:|---:|');
    for (const q of c.dailyQuotes.slice(0, 8)) {
      md.push(`| ${q.day} | ${nf(q.basePrice)} | ${q.changePrice ?? '–'} | ${q.changeRate ?? '–'}% |`);
    }
    md.push('');
  }
}
md.push('## 2. 기간별 일치 (표본 ' + out.sample.length + '종목)', '',
  '긴 계열은 성기게 솎여 오므로 기준일이 최대 한 달까지 어긋난다. 6개월 이상은',
  '허용오차를 넓혀 본다 — 여기서 보려는 것은 계열의 **뜻**(누적이냐 연율이냐)이다.', '',
  '| 기간 | 검산 | 누적과 일치 | 연율과 일치 | 허용오차 | 판정 |',
  '|---|---:|---:|---:|---:|---|');
for (const p of PERIODS) {
  const t = tally[p.key];
  md.push(`| ${p.key} | ${t.checked} | ${t.matchesCum} | ${t.matchesAnn} | ±${t.tolerance}%p | ${out.basis[p.key]} |`);
}
md.push('', '## 3. 계단이 있는 펀드', '',
  `표본 ${out.sample.length}종목 중 **${withStep.length}종목**에 계단이 있다.`, '',
  `\`|1개월| > 50%\` 인 펀드 ${big1m.length}건 중 계단이 있는 것 **${bigWithStep.length}건**.`, '',
  '| 표준코드 | 계단 | 배율 | 원천 1개월 | 원천 1년 |', '|---|---|---:|---:|---:|');
for (const f of out.stepFunds.slice(0, 40)) {
  const s = f.steps[0];
  md.push(`| ${f.code} | ${s ? `${s.prevDay} → ${s.day}` : '–'} | ${s?.ratio ?? '–'} | ` +
    `${nf(f.source1m)} | ${nf(f.source1y)} |`);
}
if (out.errors.length) {
  md.push('', '## 오류', '');
  for (const e of out.errors.slice(0, 30)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[fund-verify2] ${OUT_MD} · ${OUT_JSON} 기록`);
