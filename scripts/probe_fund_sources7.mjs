#!/usr/bin/env node
/**
 * 펀드 원천 탐색 7차 — 네이버는 살아 있었다. 주소가 옮겨갔을 뿐이다.
 *
 *   node scripts/probe_fund_sources7.mjs
 *   -> tools/discovery/fund_probe7.{json,md}
 *
 * 앞선 판단을 정정한다. 1차에서 finance.naver.com/fund/ 가 일반 증권 홈으로
 * 넘어가는 것을 보고 "펀드 서비스가 없어졌다" 고 적었다. **틀렸다.**
 * 펀드는 새 주소로 옮겨가 있었다.
 *
 *   stock.naver.com/domestic/fund/{표준코드}/total
 *
 * 옛 주소가 죽은 것과 서비스가 없어진 것은 다르다. 넘어간 곳만 보고
 * 단정한 것이 잘못이었다 — ETF 때 "야후에 배당이 없다" 고 단정했던 것과
 * 같은 종류의 실수다.
 *
 * 화면에 있는 것(K55235B39916 기준):
 *   기준가·기간수익률(1개월~5년)·벤치마크 대비·유형·위험등급·설정액·순자산·
 *   운용사·설정일·벤치마크·총보수, 그리고 **자산구성**과 **보유 종목**.
 *
 * ETF 의 etfAnalysis 와 같은 자리다. 그러니 확인할 것은 하나다 —
 * **그 화면이 부르는 API 를 브라우저 없이 재현할 수 있는가.**
 *
 *   1. 펀드 상세를 열어 오가는 api 호출을 통째로 기록한다
 *   2. 자산구성·성과분석까지 눌러 본다 (보유종목이 거기 있다)
 *   3. 잡은 호출을 브라우저 없이 다시 던져 재현되는지 본다
 *   4. 펀드 목록을 주는 자리도 같이 찾는다 (ETF 의 etfItemList 에 해당)
 *
 * 3번까지 돼야 수집기를 쓸 수 있다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_probe7.json';
const OUT_MD = 'tools/discovery/fund_probe7.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// 사용자가 확인한 펀드. 해외주식형이라 지역 분류까지 같이 볼 수 있다.
const SAMPLE = 'K55235B39916';   // 피델리티글로벌테크놀로지증권모투자신탁(주식-재간접형)

const out = { at: new Date().toISOString(), pages: [], replay: [], list: [] };
const API = /\/api\/|\.json|graphql/i;

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA });

/** 화면 하나를 열고 오가는 api 호출을 기록한다. */
async function watch(label, url, act) {
  const page = await ctx.newPage();
  const calls = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (!API.test(u)) return;
    let body = '';
    try { body = (await res.text()).slice(0, 4000); } catch { /* 못 읽는 응답 */ }
    if (!body) return;
    calls.push({ status: res.status(), url: u.slice(0, 400), bytes: body.length, body });
  });

  const row = { label, url };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(5000);
    row.title = await page.title().catch(() => '');
    row.landedOn = page.url();
    if (act) {
      try { await act(page); } catch (e) { row.actError = String(e.message || e).slice(0, 160); }
      await page.waitForTimeout(4000);
    }
    row.text = (await page.evaluate(() => document.body?.innerText || '')).slice(0, 2500);
  } catch (e) { row.error = String(e.message || e).slice(0, 200); }
  row.calls = calls;
  console.log(`\n── ${label}`);
  console.log(`   ${row.landedOn || '(못 열림)'}${row.error ? ' · ' + row.error : ''}`);
  console.log(`   api 호출 ${calls.length}건`);
  for (const c of calls.slice(0, 14)) console.log(`     ${c.status} ${c.bytes}B  ${c.url.slice(0, 130)}`);
  out.pages.push(row);
  await page.close();
  return row;
}

console.log('=== 1. 펀드 상세 (종합) ===');
await watch('펀드 종합', `https://stock.naver.com/domestic/fund/${SAMPLE}/total`);

console.log('\n=== 2. 자산구성·성과분석까지 눌러 본다 ===');
// 보유종목은 자산구성 쪽에 있다. 화면의 링크를 눌러 그때 나가는 호출을 잡는다.
await watch('펀드 종합 + 자산구성 클릭', `https://stock.naver.com/domestic/fund/${SAMPLE}/total`,
  async (page) => {
    for (const label of ['자산구성', '보유 종목', '보유종목']) {
      const el = page.locator(`text=${label}`).first();
      if (await el.count().catch(() => 0)) {
        await el.click({ timeout: 5000 });
        await page.waitForTimeout(3500);
        break;
      }
    }
  });

// 성과분석 탭은 주소가 따로 있을 수 있다. 둘 다 시도한다.
for (const sub of ['performance', 'analysis', 'asset', 'holding']) {
  await watch(`펀드 하위 화면 /${sub}`, `https://stock.naver.com/domestic/fund/${SAMPLE}/${sub}`);
}

console.log('\n=== 3. 펀드 목록을 주는 자리 찾기 ===');
// ETF 는 etfItemList 하나가 목록을 줬다. 펀드에도 그런 자리가 있어야
// 1,000개 넘는 펀드를 훑을 수 있다.
await watch('펀드 홈/랭킹', 'https://stock.naver.com/domestic/fund');
await watch('펀드 검색', `https://stock.naver.com/search?query=${encodeURIComponent('펀드')}`);

await browser.close();

// ── 4. 잡은 호출을 브라우저 없이 재현 ─────────────────────────────────────
console.log('\n=== 4. 재현 (브라우저 없이) ===');
const seen = new Set();
const cands = [];
for (const p of out.pages) {
  for (const c of p.calls) {
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    if (/naver\.com\/api\//i.test(c.url)) cands.push({ from: p.label, ...c });
  }
}
console.log(`  후보 ${cands.length}건`);
for (const c of cands.slice(0, 20)) {
  const row = { from: c.from, url: c.url };
  try {
    const res = await fetch(c.url, {
      headers: {
        'User-Agent': UA,
        Accept: 'application/json,text/plain,*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        Referer: `https://stock.naver.com/domestic/fund/${SAMPLE}/total`,
      },
      signal: AbortSignal.timeout(15000),
    });
    row.status = res.status;
    const t = await res.text();
    row.bytes = t.length;
    row.sample = t.slice(0, 1500);
    row.ok = res.ok && t.length > 50;
    // 이 응답에 무엇이 들었는지 표를 붙인다.
    row.has = {
      보유종목: /종목명|itemName|holding|stockName|constituent/i.test(t),
      수익률: /수익률|returnRate|yield|profitRate/i.test(t),
      설정액: /설정액|순자산|netAsset|totalNav|aum/i.test(t),
      보수: /보수|fee|expense|totalFee/i.test(t),
      기준가: /기준가|standardPrice|nav|price/i.test(t),
      자산구성: /자산구성|assetComposition|portfolio/i.test(t),
    };
  } catch (e) { row.error = String(e.message || e).slice(0, 120); }
  const hits = row.has ? Object.entries(row.has).filter(([, v]) => v).map(([k]) => k) : [];
  console.log(`${row.ok ? '✓' : '✗'} ${row.url.slice(0, 110)} — ${row.error || row.status + ' ' + row.bytes + 'B'}` +
              (hits.length ? `  [${hits.join('·')}]` : ''));
  out.replay.push(row);
}

// ── 기록 ──────────────────────────────────────────────────────────────────
const holdingCalls = out.replay.filter((r) => r.ok && r.has?.보유종목);
out.verdict = holdingCalls.length
  ? `보유종목을 주는 호출을 ${holdingCalls.length}건 재현했다. 수집기로 넘어갈 수 있다.`
  : (out.replay.some((r) => r.ok)
    ? '호출은 재현되는데 보유종목이 든 응답은 아직 못 잡았다. 자산구성 화면을 더 파야 한다.'
    : '재현이 안 된다. 헤더나 토큰이 더 필요할 수 있다.');
console.log(`\n판정: ${out.verdict}`);

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 펀드 원천 탐색 7차 — 네이버는 살아 있었다', '', `조사 시각: ${out.at}`, '',
  '앞선 판단을 정정한다. 1차에서 `finance.naver.com/fund/` 가 일반 증권 홈으로',
  '넘어가는 것을 보고 "펀드 서비스가 없어졌다" 고 적었는데 **틀렸다.**',
  '펀드는 새 주소로 옮겨가 있었다.', '',
  '```', `https://stock.naver.com/domestic/fund/${SAMPLE}/total`, '```', '',
  '옛 주소가 죽은 것과 서비스가 없어진 것은 다르다. 넘어간 곳만 보고 단정한',
  '것이 잘못이었다.', '',
  `**판정: ${out.verdict}**`, '',
  '## 화면별 api 호출', ''];
for (const p of out.pages) {
  md.push(`### ${p.label}`, '', `- 주소: \`${p.url}\``,
    `- 도착: \`${p.landedOn || '(못 열림)'}\`${p.error ? ` — ${p.error}` : ''}`,
    `- 호출 ${p.calls.length}건`, '');
  if (p.calls.length) {
    md.push('| 상태 | 크기 | 주소 |', '|---|---:|---|');
    for (const c of p.calls.slice(0, 25)) md.push(`| ${c.status} | ${c.bytes} | \`${c.url.slice(0, 170)}\` |`);
    md.push('');
  }
}
md.push('## 재현', '', '| 주소 | 결과 | 보유종목 | 수익률 | 설정액 | 보수 | 자산구성 |',
  '|---|---|:-:|:-:|:-:|:-:|:-:|');
for (const r of out.replay) {
  const y = (b) => (b ? '○' : '·');
  md.push(`| \`${r.url.slice(0, 120)}\` | ${r.error ? '✗ ' + r.error : (r.ok ? '✓ ' : '△ ') + r.status + ' ' + r.bytes + 'B'} | ` +
    `${y(r.has?.보유종목)} | ${y(r.has?.수익률)} | ${y(r.has?.설정액)} | ${y(r.has?.보수)} | ${y(r.has?.자산구성)} |`);
}
md.push('', '## 응답 맛보기', '');
for (const r of out.replay) {
  if (!r.ok || !r.sample) continue;
  md.push(`### \`${r.url.slice(0, 150)}\``, '', '```json', r.sample.slice(0, 1500), '```', '');
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[probe7] ${OUT_MD} · ${OUT_JSON} 기록`);
