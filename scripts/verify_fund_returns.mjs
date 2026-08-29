#!/usr/bin/env node
/**
 * 펀드 기간수익률 검산 — 244.9% 가 무엇인지 가른다.
 *
 *   node scripts/verify_fund_returns.mjs
 *   -> tools/discovery/fund_returns_verify.{json,md}
 *
 * 인수인계 문서에 남은 하나뿐인 미해결 항목이다.
 *
 *   골든브릿지으뜸단기증권투자신탁 1[채권] (국내채권형, 기준가 3,361.5)
 *   returnRate1m 244.94 · 3m 245.2 · 1y 246.2 · 5y 252.1
 *
 * 단기채권 펀드가 한 달에 244% 오를 수는 없다. 처음에는 "목록이 설정 이후
 * 누적을 준다" 고 의심했으나 목록과 상세가 16/16 일치해 그 가설은 깨졌다.
 * 곧 두 자리에 같은 값이 실려 있을 뿐, 어느 쪽이 맞는지는 아직 모른다.
 *
 * ETF 에서 이 검산을 건너뛰었다가 화면에 +1,837% 가 나갔다. 그래서 화면을
 * 만들기 전에 **기준가 시계열에서 직접 다시 계산해** 원천 값과 대조한다.
 *
 *   내계산(누적) = (마지막 기준가 / 기준일 이전 마지막 기준가 − 1) × 100
 *
 * 이 값이 원천과 맞으면 원천을 그대로 쓴다. 안 맞으면 무엇과 맞는지 본다 —
 * 특히 **설정 이후 누적**((기준가/1000−1)×100) 과 맞는지가 관건이다.
 * 기준가 3,361.5 는 설정 1,000 기준 3.36배이고 244.9% 와 가깝다.
 *
 * 세 가지를 같이 확인한다.
 *
 *   1. base-price/chart 가 어떤 term 을 받나 (긴 계열을 받을 수 있어야 검산이 된다)
 *   2. 원천 기간수익률 vs 기준가에서 다시 계산한 값 — 기간마다, 펀드마다
 *   3. 3년·5년이 누적인가 연율인가 (ETF 는 연율이었다. 이름이 같다고 뜻이
 *      같지 않으므로 펀드도 따로 확인한다)
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_returns_verify.json';
const OUT_MD = 'tools/discovery/fund_returns_verify.md';
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

const out = { at: new Date().toISOString(), errors: [] };

// continue-on-error 가 죽음을 가린다. 무슨 일이 있어도 여태 알아낸 것은 남긴다.
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[fund-verify] 중단:', e?.message || e);
  process.exit(1);
});

/** 문자열 기준가를 숫자로. 못 만들면 null — 빈 값이 0 으로 둔갑하지 않게 한다. */
function num(v) {
  if (v == null || v === '' || v === '-') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

// ── 0. base-price/chart 가 받는 term ─────────────────────────────────────────
// 7차 탐색은 term=3m 만 봤다. 1개월·1년·3년을 검산하려면 그만큼 긴 계열이
// 있어야 하므로, 받는 값을 먼저 다 찾는다.
console.log('=== 0. base-price/chart 가 받는 term ===');
const PROBE_CODE = 'K55309BY1419';   // 문제의 그 펀드
const TERM_CANDIDATES = ['1m', '3m', '6m', '9m', 'ytd', '1y', '2y', '3y', '5y', '10y', 'all', 'max'];
out.terms = [];
for (const term of TERM_CANDIDATES) {
  const row = { term };
  try {
    const d = await getJson(`${API}/${PROBE_CODE}/base-price/chart?term=${term}`, 1);
    const s = d?.series || [];
    row.ok = true;
    row.points = s.length;
    row.from = s[0]?.tradeDate ?? null;
    row.to = s[s.length - 1]?.tradeDate ?? null;
  } catch (e) { row.ok = false; row.error = String(e.message || e).slice(0, 60); }
  console.log(`  term=${term.padEnd(4)} → ${row.ok ? `${row.points}점 ${row.from} ~ ${row.to}` : row.error}`);
  out.terms.push(row);
  await sleep(150);
}
// 가장 긴 계열을 주는 term 을 쓴다. 검산은 계열이 길수록 넓은 구간을 볼 수 있다.
const best = out.terms.filter((t) => t.ok && t.points > 0).sort((a, b) => b.points - a.points)[0];
const LONG_TERM = best?.term || '3m';
out.longTerm = LONG_TERM;
console.log(`  → 가장 긴 계열: term=${LONG_TERM} (${best?.points ?? 0}점)`);

// prices/daily 가 더 긴 계열을 줄 수도 있다. size 상한을 같이 본다.
console.log('\n=== 0b. prices/daily size 상한 ===');
out.dailySizes = [];
const today = new Date().toISOString().slice(0, 10);
for (const size of [10, 100, 500, 1000, 3000]) {
  const row = { size };
  try {
    const d = await getJson(`${API}/${PROBE_CODE}/prices/daily?date=${today}&size=${size}`, 1);
    const p = d?.prices || [];
    row.ok = true; row.points = p.length;
    row.from = p[p.length - 1]?.tradeDate ?? null;
    row.to = p[0]?.tradeDate ?? null;
  } catch (e) { row.ok = false; row.error = String(e.message || e).slice(0, 60); }
  console.log(`  size=${String(size).padStart(4)} → ${row.ok ? `${row.points}점 ${row.from} ~ ${row.to}` : row.error}`);
  out.dailySizes.push(row);
  await sleep(150);
}

// ── 표본 고르기 ──────────────────────────────────────────────────────────────
// 큰 값·작은 값·가운데를 섞어 뽑는다. 한쪽만 보면 갈리지 않는다.
console.log('\n=== 1. 표본 ===');
const pages = [];
for (let p = 0; p < 12; p += 1) {
  try {
    const d = await getJson(`${API}?page=${p}&size=20`);
    if (!d?.funds?.length) break;
    pages.push(...d.funds);
  } catch (e) { out.errors.push(`page ${p}: ${String(e.message || e)}`); break; }
  await sleep(100);
}
// 정렬 인자를 받으므로 큰 값 쪽은 그쪽으로 따로 받는다 — 앞 240개만 봐서는
// 244% 짜리가 표본에 안 들어올 수 있다.
for (const sort of ['return1m', 'return3m', 'return1y']) {
  try {
    const d = await getJson(`${API}?page=0&size=20&sort=${sort}`);
    if (d?.funds?.length) pages.push(...d.funds);
  } catch (e) { out.errors.push(`sort=${sort}: ${String(e.message || e)}`); }
  await sleep(120);
}
const uniq = new Map(pages.map((f) => [f.fundCode, f]));
// 문제의 두 펀드는 반드시 넣는다.
for (const code of ['K55309BY1419', 'K55309BQ0684', 'K55306B99307', 'K55235B39916']) {
  if (!uniq.has(code)) uniq.set(code, { fundCode: code, fundName: null });
}
const rows = [...uniq.values()];
const byM1 = rows.filter((f) => f.returnRate1m != null)
                 .sort((a, b) => b.returnRate1m - a.returnRate1m);
const mid = Math.floor(byM1.length / 2);
const sampleMap = new Map();
for (const f of [...byM1.slice(0, 10), ...byM1.slice(-10), ...byM1.slice(mid, mid + 10),
                 ...rows.filter((f) => f.returnRate1m == null).slice(0, 6)]) {
  sampleMap.set(f.fundCode, f);
}
const sample = [...sampleMap.values()];
out.sampleSize = sample.length;
out.poolSize = uniq.size;
console.log(`  풀 ${uniq.size}개에서 표본 ${sample.length}개`);

// ── 2. 기준가에서 다시 계산해 원천과 대조 ────────────────────────────────────
console.log('\n=== 2. 원천 기간수익률 vs 기준가 재계산 ===');

const PERIODS = [
  { key: '1m',  back: (d) => d.setMonth(d.getMonth() - 1),      years: 1 / 12 },
  { key: '3m',  back: (d) => d.setMonth(d.getMonth() - 3),      years: 0.25 },
  { key: '6m',  back: (d) => d.setMonth(d.getMonth() - 6),      years: 0.5 },
  { key: '1y',  back: (d) => d.setFullYear(d.getFullYear() - 1), years: 1 },
  { key: '3y',  back: (d) => d.setFullYear(d.getFullYear() - 3), years: 3 },
  { key: '5y',  back: (d) => d.setFullYear(d.getFullYear() - 5), years: 5 },
];

out.funds = [];
let n = 0;
for (const f of sample) {
  n += 1;
  const row = { code: f.fundCode, listName: f.fundName ?? null,
                listed: { m1: f.returnRate1m ?? null, m3: f.returnRate3m ?? null,
                          y1: f.returnRate1y ?? null, basePrice: num(f.basePrice) } };
  try {
    const [lp, perf, chart] = await Promise.all([
      getJson(`${API}/${f.fundCode}/left-panel`),
      getJson(`${API}/${f.fundCode}/fund-performance`),
      getJson(`${API}/${f.fundCode}/base-price/chart?term=${LONG_TERM}`),
    ]);
    const d = lp?.detail || {};
    row.name = d.fundName ?? row.listName;
    row.type = d.parentPeerGroupName ?? null;
    row.company = d.companyName ?? null;
    row.inceptionDate = d.inceptionDate ?? null;
    row.basePrice = num(d.basePrice);

    const src = Object.fromEntries((perf?.periodReturns?.returns || [])
      .map((r) => [r.term, r.fundReturn]));
    row.source = src;

    // 기준가 시계열. 오래된 것부터 온다.
    const series = (chart?.series || [])
      .map((p) => ({ day: p.tradeDate, v: num(p.basePrice) }))
      .filter((p) => p.day && p.v != null && p.v > 0);
    row.seriesPoints = series.length;
    row.seriesFrom = series[0]?.day ?? null;
    row.seriesTo = series[series.length - 1]?.day ?? null;

    if (series.length >= 2) {
      const last = series[series.length - 1];
      const first = series[0];
      row.mine = {};
      row.diff = {};
      for (const p of PERIODS) {
        const dt = new Date(`${last.day}T00:00:00Z`);
        p.back(dt);
        const cutoff = dt.toISOString().slice(0, 10);
        // 그 날짜 이하의 마지막 봉. 휴장으로 정확한 날짜가 없을 수 있다.
        let base = null;
        for (const s of series) { if (s.day <= cutoff) base = s; else break; }
        // 계열이 구간을 못 덮으면 값을 내지 않는다. 설정 초기 펀드의 1년
        // 수익률이 설정일 대비가 되어 엉뚱하게 커지는 것을 막는다.
        if (!base || base === last || first.day > cutoff) continue;
        const cum = (last.v / base.v - 1) * 100;
        const ann = (Math.pow(last.v / base.v, 1 / p.years) - 1) * 100;
        row.mine[p.key] = { from: base.day, fromPrice: base.v, toPrice: last.v,
                            cum: +cum.toFixed(4), ann: +ann.toFixed(4) };
        const s = src[p.key];
        if (s != null) {
          row.diff[p.key] = { source: s, cum: +cum.toFixed(4), ann: +ann.toFixed(4),
                              dCum: +(s - cum).toFixed(4), dAnn: +(s - ann).toFixed(4) };
        }
      }
      // 설정 이후 누적 가설. 설정 기준가는 보통 1,000 이다.
      if (row.basePrice != null) {
        row.sinceInception1000 = +((row.basePrice / 1000 - 1) * 100).toFixed(2);
      }
      // 계열 전체 구간의 누적. 계열이 설정일까지 닿으면 위와 같아야 한다.
      row.seriesCum = +((last.v / first.v - 1) * 100).toFixed(4);
    }
  } catch (e) {
    row.error = String(e.message || e).slice(0, 120);
    out.errors.push(`${f.fundCode}: ${row.error}`);
  }

  const d1m = row.diff?.['1m'];
  console.log(
    `  ${String(n).padStart(2)}/${sample.length} ${row.code} ` +
    `${(row.name || '').slice(0, 22).padEnd(24)} ` +
    `원천1개월 ${String(row.source?.['1m'] ?? '–').slice(0, 9).padStart(10)} · ` +
    `내계산 ${String(d1m?.cum ?? '–').slice(0, 9).padStart(10)} · ` +
    `차 ${String(d1m?.dCum ?? '–').slice(0, 8).padStart(9)}` +
    (row.sinceInception1000 != null ? ` · 설정후 ${row.sinceInception1000.toFixed(1)}%` : ''));
  out.funds.push(row);
  await sleep(160);
}

// ── 3. 판정 ─────────────────────────────────────────────────────────────────
console.log('\n=== 3. 판정 ===');

// 얼마나 가까우면 "같다" 로 볼 것인가. 기준가는 소수 둘째 자리까지 오므로
// 반올림 오차가 남는다. 0.5%p 는 넉넉하다.
const NEAR = 0.5;
const tally = {};
for (const p of PERIODS) {
  const cells = out.funds.map((f) => f.diff?.[p.key]).filter(Boolean);
  const okCum = cells.filter((c) => Math.abs(c.dCum) < NEAR).length;
  const okAnn = cells.filter((c) => Math.abs(c.dAnn) < NEAR).length;
  tally[p.key] = { checked: cells.length, matchesCum: okCum, matchesAnn: okAnn };
  console.log(`  ${p.key.padEnd(3)} 검산 ${String(cells.length).padStart(3)}건 · ` +
              `누적일치 ${String(okCum).padStart(3)} · 연율일치 ${String(okAnn).padStart(3)}`);
}
out.tally = tally;

// 244.9% 짜리들이 무엇과 맞는지 따로 본다.
const weird = out.funds.filter((f) => (f.source?.['1m'] ?? 0) > 50 || (f.source?.['1m'] ?? 0) < -50);
out.weird = weird.map((f) => ({
  code: f.code, name: f.name, type: f.type, basePrice: f.basePrice,
  inceptionDate: f.inceptionDate,
  source1m: f.source?.['1m'] ?? null, source1y: f.source?.['1y'] ?? null,
  mine1m: f.mine?.['1m']?.cum ?? null, mine1y: f.mine?.['1y']?.cum ?? null,
  sinceInception1000: f.sinceInception1000 ?? null,
  seriesCum: f.seriesCum ?? null, seriesFrom: f.seriesFrom, seriesTo: f.seriesTo,
}));
console.log(`\n  |1개월| > 50% 인 펀드 ${weird.length}건:`);
for (const w of out.weird) {
  console.log(`    ${w.code} ${(w.name || '').slice(0, 24).padEnd(26)} ` +
    `원천 ${String(w.source1m).slice(0, 8).padStart(9)} · 내계산 ${String(w.mine1m).slice(0, 8).padStart(9)} · ` +
    `설정후 ${String(w.sinceInception1000).slice(0, 8).padStart(9)} · 기준가 ${w.basePrice}`);
}

// 3년·5년이 누적인가 연율인가.
const basisOf = (key) => {
  const t = tally[key];
  if (!t || !t.checked) return '표본 없음';
  if (t.matchesCum >= t.checked * 0.8) return '누적';
  if (t.matchesAnn >= t.checked * 0.8) return '연율';
  return '갈리지 않음';
};
out.basis = { y3: basisOf('3y'), y5: basisOf('5y'), y1: basisOf('1y'), m1: basisOf('1m') };
console.log(`\n  1개월 ${out.basis.m1} · 1년 ${out.basis.y1} · 3년 ${out.basis.y3} · 5년 ${out.basis.y5}`);

const m1 = tally['1m'] || { checked: 0, matchesCum: 0 };
out.verdict =
  `1개월 재계산 일치 ${m1.matchesCum}/${m1.checked} · ` +
  `이상값 ${weird.length}건 · 3년 기준 ${out.basis.y3}`;
console.log(`\n판정: ${out.verdict}`);

await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const nfmt = (v, d = 2) => (v == null ? '–' : Number(v).toFixed(d));
const md = [
  '# 펀드 기간수익률 검산 — 244.9% 는 무엇인가', '',
  `조사 시각: ${out.at}`, '',
  `**${out.verdict}**`, '',
  '화면을 만들기 전에 기준가 시계열에서 기간수익률을 직접 다시 계산해 원천 값과',
  '대조했다. ETF 에서 이 검산을 건너뛰었다가 +1,837% 가 화면에 나갔다.', '',
  '## 0. base-price/chart 가 받는 term', '',
  '| term | 결과 | 점 | 시작 | 끝 |', '|---|---|---:|---|---|',
];
for (const t of out.terms) {
  md.push(`| \`${t.term}\` | ${t.ok ? '✓' : `✗ ${t.error}`} | ${t.points ?? '–'} | ${t.from ?? '–'} | ${t.to ?? '–'} |`);
}
md.push('', `가장 긴 계열: \`term=${LONG_TERM}\``, '',
  '### prices/daily size 상한', '',
  '| size | 결과 | 점 | 시작 | 끝 |', '|---:|---|---:|---|---|');
for (const t of out.dailySizes) {
  md.push(`| ${t.size} | ${t.ok ? '✓' : `✗ ${t.error}`} | ${t.points ?? '–'} | ${t.from ?? '–'} | ${t.to ?? '–'} |`);
}
md.push('', '## 1. 기간별 일치 (표본 ' + out.funds.length + '개)', '',
  `"같다" 는 차이 ${NEAR}%p 미만.`, '',
  '| 기간 | 검산 | 누적과 일치 | 연율과 일치 |', '|---|---:|---:|---:|');
for (const p of PERIODS) {
  const t = tally[p.key];
  md.push(`| ${p.key} | ${t.checked} | ${t.matchesCum} | ${t.matchesAnn} |`);
}
md.push('', `- 1개월 기준: **${out.basis.m1}**`, `- 1년 기준: **${out.basis.y1}**`,
  `- 3년 기준: **${out.basis.y3}**`, `- 5년 기준: **${out.basis.y5}**`, '',
  '## 2. 이상값 — |1개월| > 50%', '',
  '| 표준코드 | 펀드 | 유형 | 원천 1개월 | 내계산 1개월 | 설정후(기준가/1000) | 기준가 |',
  '|---|---|---|---:|---:|---:|---:|');
for (const w of out.weird) {
  md.push(`| ${w.code} | ${(w.name || '').slice(0, 28)} | ${w.type ?? '–'} | ${nfmt(w.source1m)} | ` +
    `${nfmt(w.mine1m)} | ${nfmt(w.sinceInception1000)} | ${nfmt(w.basePrice)} |`);
}
md.push('', '## 3. 펀드별 상세', '',
  '| 표준코드 | 펀드 | 1개월 원천/내계산 | 3개월 원천/내계산 | 1년 원천/내계산 | 3년 원천/내계산(누적,연율) |',
  '|---|---|---|---|---|---|');
for (const f of out.funds) {
  const cell = (k) => {
    const d = f.diff?.[k];
    if (!d) return f.source?.[k] != null ? `${nfmt(f.source[k])} / –` : '–';
    return `${nfmt(d.source)} / ${nfmt(d.cum)}`;
  };
  const cell3y = () => {
    const d = f.diff?.['3y'];
    if (!d) return '–';
    return `${nfmt(d.source)} / ${nfmt(d.cum)}, ${nfmt(d.ann)}`;
  };
  md.push(`| ${f.code} | ${(f.name || '').slice(0, 26)} | ${cell('1m')} | ${cell('3m')} | ${cell('1y')} | ${cell3y()} |`);
}
if (out.errors.length) {
  md.push('', '## 오류', '');
  for (const e of out.errors.slice(0, 30)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[fund-verify] ${OUT_MD} · ${OUT_JSON} 기록`);
