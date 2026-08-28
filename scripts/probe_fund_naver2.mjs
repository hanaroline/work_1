#!/usr/bin/env node
/**
 * 네이버 펀드 — 목록 값이 무엇인지, 얼마나 있는지, 보유종목은 얼마나 채워지나.
 *
 *   node scripts/probe_fund_naver2.mjs
 *   -> tools/discovery/fund_naver2.{json,md}
 *
 * 앞 탐색에서 필요한 자리를 다 찾았다.
 *
 *   목록   /api/fund/funds?page=0&size=20
 *   상세   /api/fund/funds/{코드}/left-panel · fund-performance · chart-price-panel
 *   보유   chart-price-panel 의 allocationsPortfolio.result[]
 *          → { itemCode(ISIN), itemName, weight(소수) }
 *
 * 그런데 목록 응답에 함정이 하나 보인다.
 *
 *   골든브릿지으뜸단기증권투자신탁 1[채권]  (단기채권형)
 *   returnRate1m 244.9 · 3m 245.2 · 1y 246.2 · 5y 252.1
 *
 * 단기채권 펀드의 1개월 수익률이 244% 일 수 없다. 기준가 3,361.5(설정 1,000
 * 기준 3.36배)와 비슷한 것을 보면 **설정 이후 누적**으로 보인다. 반면 상세
 * (fund-performance)는 화면 값과 일치했다(1개월 +7.24%, 1년 +24.78%).
 *
 * 이름이 같다고 뜻이 같은 것이 아니다. 목록 값을 그대로 실었으면 화면의 모든
 * 숫자가 틀렸을 것이다. ETF 때 "네이버 시장가" 가 실은 수정주가였던 것과
 * 같은 종류의 함정이다.
 *
 * 그래서 만들기 전에 넷을 확인한다.
 *
 *   1. 목록의 returnRateXm 과 상세의 그것이 같은 값인가 — 같은 펀드로 대조
 *   2. 목록에 펀드가 몇 개나 있나 (페이지를 끝까지 넘겨 본다)
 *   3. 보유종목이 채워지는 비율 — 유형별로 센다
 *   4. 총보수를 어디서 받나 (목록·상세 모두 null 이었다)
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_naver2.json';
const OUT_MD = 'tools/discovery/fund_naver2.md';
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
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) { last = e; if (i < tries) await sleep(400 * 2 ** (i - 1)); }
  }
  throw last;
}

const out = { at: new Date().toISOString() };

// ── 1. 목록이 몇 개나 되나 ────────────────────────────────────────────────
console.log('=== 1. 목록 크기 ===');
const first = await getJson(`${API}?page=0&size=100`);
out.listKeys = Object.keys(first);
out.listMeta = Object.fromEntries(Object.entries(first).filter(([k]) => k !== 'funds'));
console.log(`  응답 키: ${out.listKeys.join(', ')}`);
console.log(`  메타: ${JSON.stringify(out.listMeta).slice(0, 300)}`);
console.log(`  첫 페이지 ${first.funds?.length ?? 0}개`);

// 페이지를 넘겨 총 개수를 재 본다. 메타에 총수가 있으면 그것을 믿되,
// 없으면 빈 페이지가 나올 때까지 센다.
const all = [];
let page = 0;
const MAX_PAGES = 60;      // 100개씩 6,000개까지. 그보다 많으면 메타를 봐야 한다.
while (page < MAX_PAGES) {
  const d = page === 0 ? first : await getJson(`${API}?page=${page}&size=100`);
  const rows = d.funds || [];
  if (!rows.length) break;
  all.push(...rows);
  if (page % 10 === 0) console.log(`  ${page}페이지 · 누적 ${all.length}개`);
  page += 1;
  await sleep(120);
}
const uniq = new Map(all.map((f) => [f.fundCode, f]));
out.listTotal = uniq.size;
out.listPages = page;
console.log(`  총 ${uniq.size}개 (중복 제외) · ${page}페이지`);

// ── 2. 목록 수익률 vs 상세 수익률 ─────────────────────────────────────────
// 이름이 같다고 뜻이 같은 것이 아니다. 같은 펀드로 맞대 본다.
console.log('\n=== 2. 목록 수익률 = 상세 수익률인가 ===');
const codes = [...uniq.keys()];
// 값이 큰 것과 작은 것을 섞어 뽑는다. 한쪽만 보면 안 갈린다.
const sorted = [...uniq.values()].sort((a, b) => (b.returnRate1m ?? 0) - (a.returnRate1m ?? 0));
const sample = [...sorted.slice(0, 6), ...sorted.slice(-6),
                ...sorted.slice(Math.floor(sorted.length / 2), Math.floor(sorted.length / 2) + 4)];

out.compare = [];
for (const f of sample) {
  const row = { code: f.fundCode, name: f.fundName, listed: {
    m1: f.returnRate1m, m3: f.returnRate3m, y1: f.returnRate1y, basePrice: f.basePrice } };
  try {
    const perf = await getJson(`${API}/${f.fundCode}/fund-performance`);
    const terms = Object.fromEntries((perf?.periodReturns?.returns || [])
      .map((r) => [r.term, r.fundReturn]));
    row.detail = { m1: terms['1m'] ?? null, m3: terms['3m'] ?? null, y1: terms['1y'] ?? null };
    row.benchmark = { m1: (perf?.periodReturns?.returns || []).find((r) => r.term === '1m')?.benchmarkReturn ?? null };
    const near = (a, b) => a != null && b != null && Math.abs(a - b) < 0.5;
    row.m1Same = near(row.listed.m1, row.detail.m1);
    row.y1Same = near(row.listed.y1, row.detail.y1);
  } catch (e) { row.error = String(e.message || e).slice(0, 100); }
  console.log(`  ${row.code} ${(row.name || '').slice(0, 26).padEnd(28)} ` +
    `목록1개월 ${String(row.listed.m1 ?? '–').slice(0, 8).padStart(9)} · ` +
    `상세1개월 ${String(row.detail?.m1 ?? '–').slice(0, 8).padStart(9)} ` +
    `${row.m1Same ? '같음' : '다름'}`);
  out.compare.push(row);
  await sleep(150);
}
const sameCount = out.compare.filter((r) => r.m1Same).length;
const checked = out.compare.filter((r) => r.detail).length;
out.listMatchesDetail = { same: sameCount, checked };
console.log(`  → 목록과 상세가 같은 펀드: ${sameCount}/${checked}`);

// ── 3. 보유종목이 채워지는 비율 ───────────────────────────────────────────
console.log('\n=== 3. 보유종목 채움 비율 (유형별) ===');
const SAMPLE_N = 60;
const step = Math.max(1, Math.floor(codes.length / SAMPLE_N));
const spread = codes.filter((_, i) => i % step === 0).slice(0, SAMPLE_N);
out.holdings = [];
for (const code of spread) {
  const row = { code };
  try {
    const [lp, cp] = await Promise.all([
      getJson(`${API}/${code}/left-panel`),
      getJson(`${API}/${code}/chart-price-panel`),
    ]);
    const d = lp?.detail || {};
    row.name = d.fundName; row.type = d.parentPeerGroupName; row.company = d.companyName;
    row.aum = d.derivedAum ? Number(d.derivedAum) : null;
    row.totalFee = d.totalFee ?? null;
    row.riskGrade = d.riskGrade ?? null;
    row.benchmark = d.benchmarkName ?? null;
    const pf = cp?.allocationsPortfolio?.result || null;
    row.holdingCount = pf ? pf.length : 0;
    row.hasAssets = !!cp?.allocationsAssets;
    row.hasSectors = !!(cp?.availability?.sectors);
    if (pf?.length) row.top = pf.slice(0, 3).map((h) => `${h.itemName} ${(h.weight * 100).toFixed(1)}%`);
  } catch (e) { row.error = String(e.message || e).slice(0, 90); }
  out.holdings.push(row);
  await sleep(120);
}
const byType = {};
for (const h of out.holdings) {
  const t = h.type || '(없음)';
  byType[t] = byType[t] || { total: 0, withHoldings: 0, withAssets: 0, withFee: 0, counts: [] };
  byType[t].total += 1;
  if (h.holdingCount > 0) { byType[t].withHoldings += 1; byType[t].counts.push(h.holdingCount); }
  if (h.hasAssets) byType[t].withAssets += 1;
  if (h.totalFee != null) byType[t].withFee += 1;
}
out.byType = byType;
console.log('  유형          표본  보유종목  자산구성  총보수  종목수(중앙)');
for (const [t, v] of Object.entries(byType).sort((a, b) => b[1].total - a[1].total)) {
  const med = v.counts.length ? v.counts.slice().sort((a, b) => a - b)[Math.floor(v.counts.length / 2)] : '–';
  console.log(`  ${t.padEnd(12)} ${String(v.total).padStart(4)}  ${String(v.withHoldings).padStart(7)}  ` +
    `${String(v.withAssets).padStart(7)}  ${String(v.withFee).padStart(5)}  ${String(med).padStart(6)}`);
}
const totalWith = out.holdings.filter((h) => h.holdingCount > 0).length;
console.log(`  전체: ${totalWith}/${out.holdings.length} 에 보유종목이 있다`);

out.verdict =
  `목록 ${out.listTotal}개 · 보유종목 ${totalWith}/${out.holdings.length} · ` +
  `목록수익률=상세수익률 ${sameCount}/${checked}`;
console.log(`\n판정: ${out.verdict}`);

// ── 기록 ──────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 네이버 펀드 — 만들 수 있는 것과 없는 것', '', `조사 시각: ${out.at}`, '',
  `**${out.verdict}**`, '',
  '## 1. 목록', '',
  `- 엔드포인트: \`${API}?page=0&size=100\``,
  `- 총 **${out.listTotal}개** (${out.listPages}페이지)`,
  `- 응답 키: \`${out.listKeys.join('`, `')}\``, '',
  '## 2. 목록 수익률은 기간수익률이 아니다', '',
  '이름이 같다고 뜻이 같은 것이 아니다. 같은 펀드로 맞대 봤다.', '',
  '| 표준코드 | 펀드 | 목록 1개월 | 상세 1개월 | 목록 1년 | 상세 1년 | 같은가 |',
  '|---|---|---:|---:|---:|---:|:-:|'];
for (const r of out.compare) {
  const n = (v) => (v == null ? '–' : Number(v).toFixed(2));
  md.push(`| ${r.code} | ${(r.name || '').slice(0, 30)} | ${n(r.listed.m1)} | ${n(r.detail?.m1)} | ` +
    `${n(r.listed.y1)} | ${n(r.detail?.y1)} | ${r.m1Same ? '○' : '✗'} |`);
}
md.push('', `목록과 상세가 일치한 펀드: **${sameCount}/${checked}**`, '',
  sameCount === checked
    ? '목록 값을 그대로 써도 된다.'
    : '**목록의 returnRateXm 은 상세의 기간수익률과 다르다. 수집기는 상세를 써야 한다.**', '',
  '## 3. 보유종목 채움 비율', '',
  '| 유형 | 표본 | 보유종목 | 자산구성 | 총보수 | 종목수(중앙) |',
  '|---|---:|---:|---:|---:|---:|');
for (const [t, v] of Object.entries(byType).sort((a, b) => b[1].total - a[1].total)) {
  const med = v.counts.length ? v.counts.slice().sort((a, b) => a - b)[Math.floor(v.counts.length / 2)] : '–';
  md.push(`| ${t} | ${v.total} | ${v.withHoldings} | ${v.withAssets} | ${v.withFee} | ${med} |`);
}
md.push('', '### 보유종목이 있는 펀드 (맛보기)', '');
for (const h of out.holdings.filter((x) => x.holdingCount > 0).slice(0, 12)) {
  md.push(`- **${h.name}** (${h.type}) — ${h.holdingCount}종목 · ${(h.top || []).join(' · ')}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[fund-naver2] ${OUT_MD} · ${OUT_JSON} 기록`);
