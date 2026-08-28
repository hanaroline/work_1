#!/usr/bin/env node
/**
 * 네이버 펀드 API — 목록은 어디서 받고, 보유종목은 어떤 펀드에 있나.
 *
 *   node scripts/probe_fund_naver.mjs
 *   -> tools/discovery/fund_naver.{json,md}
 *
 * 앞 탐색에서 API 구조가 드러났다. 기준은 stock.naver.com 이다.
 *
 *   /api/fund/funds/{표준코드}/left-panel        기본정보·설정액·순자산·운용사·벤치마크
 *   /api/fund/funds/{표준코드}/fund-performance  기간수익률 + **벤치마크 대비**
 *   /api/fund/funds/{표준코드}/chart-price-panel 자산구성·포트폴리오·섹터
 *   /api/fund/funds/{표준코드}/base-price/chart  기준가 시계열
 *   /api/fund/funds/{표준코드}/prices/daily      일별 기준가
 *   /api/fund/funds/{표준코드}/metrics/detail    표준편차·추적오차·샤프·젠센알파·베타
 *   /api/fund/funds/{표준코드}/classes/returns   클래스별 수익률
 *
 * 그런데 표본으로 쓴 재간접형 펀드는 자산구성이 비어 있었다.
 *
 *   "availability":{"status":"available","assets":false,"portfolio":false,"sectors":false}
 *   "allocationsPortfolio":null, "allocationsAssets":null
 *
 * 화면의 자산구성 칸이 빈 것도 그래서다. 그러니 아직 모르는 것이 둘이다.
 *
 *   1. **펀드 목록을 어디서 받나.** ETF 는 etfItemList 하나가 1,163종목을 줬다.
 *      펀드도 그런 자리가 없으면 표준코드를 알 길이 없어 화면을 못 만든다.
 *   2. **보유종목이 실제로 채워지는 펀드가 있나.** 한 종목만 보고 "없다" 고
 *      단정하면 안 된다 — 그 실수를 이미 두 번 했다.
 *
 * 그래서 목록 자리를 넓게 찾고, 찾으면 여러 유형의 펀드를 뽑아
 * availability 를 세어 본다. 비율이 나와야 화면을 어떻게 만들지 정할 수 있다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_naver.json';
const OUT_MD = 'tools/discovery/fund_naver.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const SAMPLE = 'K55235B39916';
const REF = `https://stock.naver.com/domestic/fund/${SAMPLE}/total`;

const out = { at: new Date().toISOString(), listHunt: [], subEndpoints: [], funds: [] };

const headers = {
  'User-Agent': UA,
  Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  Referer: REF,
};

async function get(url) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  return { status: res.status, bytes: text.length, text };
}

async function tryUrl(group, label, url) {
  const row = { group, label, url };
  try {
    const r = await get(url);
    row.status = r.status; row.bytes = r.bytes;
    row.sample = r.text.slice(0, 900);
    row.ok = r.status === 200 && r.bytes > 40;
    try { row.json = JSON.parse(r.text); } catch { /* JSON 아닐 수도 있다 */ }
  } catch (e) { row.error = String(e.message || e).slice(0, 120); }
  console.log(`${row.ok ? '✓' : '✗'} [${group}] ${label} — ${row.error || row.status + ' ' + row.bytes + 'B'}`);
  return row;
}

// ── 1. 펀드 목록 자리 찾기 ────────────────────────────────────────────────
// ETF 의 etfItemList 에 해당하는 것. 이게 없으면 표준코드를 알 길이 없다.
console.log('=== 1. 목록 자리 찾기 (경로 찍어 보기) ===');
const LIST_CANDIDATES = [
  ['펀드 목록', 'https://stock.naver.com/api/fund/funds?page=0&size=20'],
  ['펀드 랭킹', 'https://stock.naver.com/api/fund/funds/ranking?page=0&size=20'],
  ['펀드 검색', 'https://stock.naver.com/api/fund/funds/search?page=0&size=20'],
  ['펀드 홈', 'https://stock.naver.com/api/fund/home'],
  ['펀드 유형별', 'https://stock.naver.com/api/fund/peer-groups'],
  ['펀드 운용사', 'https://stock.naver.com/api/fund/companies'],
  ['자동완성(전체)', 'https://ac.stock.naver.com/ac?q=%EA%B8%80%EB%A1%9C%EB%B2%8C&target=index%2Cstock%2Cmarketindicator%2Cfund'],
  ['자동완성(펀드)', 'https://ac.stock.naver.com/ac?q=%ED%94%BC%EB%8D%B8%EB%A6%AC%ED%8B%B0&target=fund'],
];
for (const [label, url] of LIST_CANDIDATES) out.listHunt.push(await tryUrl('list', label, url));

// ── 2. 펀드 하위 엔드포인트 찍어 보기 ─────────────────────────────────────
// left-panel·chart-price-panel 이 실재하므로, 같은 자리에 보유종목만 따로
// 주는 경로가 있을 수 있다.
console.log('\n=== 2. 보유종목 하위 경로 찍어 보기 ===');
const SUBS = ['portfolio', 'allocations', 'assets', 'sectors', 'holdings', 'composition',
              'asset-allocation', 'stock-holdings', 'top-holdings', 'constituents',
              'chart-price-panel', 'left-panel', 'summary', 'profile', 'fees'];
for (const sub of SUBS) {
  out.subEndpoints.push(await tryUrl('sub', sub,
    `https://stock.naver.com/api/fund/funds/${SAMPLE}/${sub}`));
}

// ── 3. 목록을 못 찾았으면 화면을 열어 관찰한다 ────────────────────────────
const listOk = out.listHunt.filter((r) => r.ok);
if (!listOk.length) {
  console.log('\n=== 3. 목록 화면 관찰 (경로 찍기 실패) ===');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA });
  const page = await ctx.newPage();
  const calls = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\//.test(u) || !/fund/i.test(u)) return;
    try {
      const t = await res.text();
      if (t.length > 40) calls.push({ status: res.status(), url: u.slice(0, 400), bytes: t.length, body: t.slice(0, 2000) });
    } catch { /* 못 읽음 */ }
  });
  // 국내 화면에서 펀드로 들어가는 길을 찾는다.
  for (const url of ['https://stock.naver.com/domestic',
                     'https://stock.naver.com/domestic/capitalization/KOSPI',
                     'https://m.stock.naver.com/fund']) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3500);
      // '펀드' 라는 글자를 눌러 본다
      const link = page.locator('text=펀드').first();
      if (await link.count().catch(() => 0)) {
        await link.click({ timeout: 4000 }).catch(() => {});
        await page.waitForTimeout(3500);
      }
      console.log(`   ${url} -> ${page.url()}`);
    } catch (e) { console.log(`   ${url} — ${String(e.message || e).slice(0, 80)}`); }
  }
  out.listObserved = calls;
  for (const c of calls.slice(0, 15)) console.log(`     ${c.status} ${c.bytes}B ${c.url.slice(0, 140)}`);
  await browser.close();
}

// ── 4. 여러 펀드에서 보유종목이 채워지는지 센다 ───────────────────────────
// 목록을 얻었으면 거기서, 못 얻었으면 자동완성으로 코드를 모은다.
console.log('\n=== 4. 보유종목이 채워지는 펀드가 있나 ===');
const codes = new Set([SAMPLE]);
for (const r of [...out.listHunt, ...(out.listObserved || [])]) {
  const body = r.sample || r.body || '';
  for (const m of body.matchAll(/\b(K5[0-9A-Z]{10,12})\b/g)) codes.add(m[1]);
}
// 자동완성으로 흔한 이름을 넣어 코드를 더 모은다.
for (const q of ['글로벌', '삼성', '미래에셋', '배당', '중소형', '코스피']) {
  const r = await tryUrl('ac', q,
    `https://ac.stock.naver.com/ac?q=${encodeURIComponent(q)}&target=fund`);
  for (const m of (r.sample || '').matchAll(/\b(K5[0-9A-Z]{10,12})\b/g)) codes.add(m[1]);
}
console.log(`   모은 표준코드 ${codes.size}개`);

for (const code of [...codes].slice(0, 12)) {
  const row = { code };
  try {
    const lp = await get(`https://stock.naver.com/api/fund/funds/${code}/left-panel`);
    const cp = await get(`https://stock.naver.com/api/fund/funds/${code}/chart-price-panel`);
    const d = JSON.parse(lp.text)?.detail || {};
    const c = JSON.parse(cp.text) || {};
    row.name = d.fundName || null;
    row.type = d.parentPeerGroupName || null;
    row.company = d.companyName || null;
    row.aum = d.derivedAum || null;
    row.totalFee = d.totalFee ?? null;
    row.availability = c.availability || null;
    row.hasPortfolio = !!c.allocationsPortfolio;
    row.hasAssets = !!c.allocationsAssets;
    // 포트폴리오가 있으면 어떤 모양인지 남긴다 — 이게 화면의 본체가 된다.
    if (c.allocationsPortfolio) row.portfolioSample = JSON.stringify(c.allocationsPortfolio).slice(0, 900);
    if (c.allocationsAssets) row.assetsSample = JSON.stringify(c.allocationsAssets).slice(0, 500);
  } catch (e) { row.error = String(e.message || e).slice(0, 120); }
  console.log(`  ${code} ${(row.name || '?').slice(0, 30).padEnd(32)} ${(row.type || '-').padEnd(10)} ` +
              `포트폴리오 ${row.hasPortfolio ? '○' : '·'} 자산 ${row.hasAssets ? '○' : '·'}`);
  out.funds.push(row);
}

const withPf = out.funds.filter((f) => f.hasPortfolio);
out.verdict = withPf.length
  ? `보유종목이 채워지는 펀드가 ${withPf.length}/${out.funds.length}개 있다. ETF 와 같은 화면을 만들 수 있다.`
  : (out.funds.length > 3
    ? `표본 ${out.funds.length}개 모두 보유종목이 비어 있다. 네이버는 펀드 보유종목을 주지 않는 것으로 보인다 — 성과·보수·설정액 비교로 범위를 좁혀야 한다.`
    : '표본이 모자라 판정할 수 없다. 목록 자리를 먼저 찾아야 한다.');
console.log(`\n판정: ${out.verdict}`);

// ── 기록 ──────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 네이버 펀드 API — 목록과 보유종목', '', `조사 시각: ${out.at}`, '',
  `**판정: ${out.verdict}**`, '',
  '## 확인된 엔드포인트', '', '```',
  '/api/fund/funds/{표준코드}/left-panel         기본정보·설정액·순자산·운용사·벤치마크',
  '/api/fund/funds/{표준코드}/fund-performance   기간수익률 + 벤치마크 대비',
  '/api/fund/funds/{표준코드}/chart-price-panel  자산구성·포트폴리오·섹터',
  '/api/fund/funds/{표준코드}/base-price/chart   기준가 시계열',
  '/api/fund/funds/{표준코드}/prices/daily       일별 기준가',
  '/api/fund/funds/{표준코드}/metrics/detail     표준편차·추적오차·샤프·젠센알파·베타',
  '/api/fund/funds/{표준코드}/classes/returns    클래스별 수익률', '```', '',
  '## 목록 자리 찾기', '', '| 후보 | 결과 |', '|---|---|'];
for (const r of out.listHunt) md.push(`| ${r.label} \`${r.url.slice(0, 90)}\` | ${r.error || (r.ok ? '✓ ' : '✗ ') + r.status + ' ' + r.bytes + 'B'} |`);
md.push('', '## 하위 경로', '', '| 경로 | 결과 |', '|---|---|');
for (const r of out.subEndpoints) md.push(`| \`${r.label}\` | ${r.error || (r.ok ? '✓ ' : '✗ ') + r.status + ' ' + r.bytes + 'B'} |`);
md.push('', '## 펀드별 보유종목 유무', '', '| 표준코드 | 이름 | 유형 | 운용사 | 포트폴리오 | 자산구성 |', '|---|---|---|---|:-:|:-:|');
for (const f of out.funds) {
  md.push(`| ${f.code} | ${(f.name || '–').slice(0, 34)} | ${f.type || '–'} | ${f.company || '–'} | ` +
    `${f.hasPortfolio ? '○' : '·'} | ${f.hasAssets ? '○' : '·'} |`);
}
md.push('');
for (const f of out.funds) {
  if (!f.portfolioSample) continue;
  md.push(`### ${f.name} — 포트폴리오`, '', '```json', f.portfolioSample, '```', '');
}
if (out.listObserved?.length) {
  md.push('## 목록 화면 관찰', '', '| 상태 | 크기 | 주소 |', '|---|---:|---|');
  for (const c of out.listObserved) md.push(`| ${c.status} | ${c.bytes} | \`${c.url.slice(0, 160)}\` |`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[fund-naver] ${OUT_MD} · ${OUT_JSON} 기록`);
