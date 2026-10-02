#!/usr/bin/env node
/**
 * 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다.
 *
 *   node scripts/reverify_fund_primary.mjs
 *   -> tools/discovery/fund_reverify_primary.{json,md}
 *
 * 1차 시도(reverify_fund_kofia.mjs)는 주소를 추측해 찔렀고 실패했다. 금융투자
 * 협회 전자공시는 WebSquare 라 화면 주소만으로는 자료가 안 나오고, 조회는
 * 내부 서비스명을 갖춘 POST 로 이뤄진다. **추측으로는 못 맞힌다.**
 *
 * 앞선 ETF 세션에서 네이버를 뚫은 방법이 이것이었다 — 주소를 맞히려 하지 말고
 * **브라우저로 화면을 열어 무엇을 부르는지 본다.**
 *
 * 세 가지를 한다.
 *
 *   1. 금투협 전자공시를 브라우저로 열고 표준코드로 검색해, 오가는 XHR 을
 *      전부 기록한다. 조회 계약을 알아내면 그 다음부터는 직접 부를 수 있다.
 *   2. 펀드다모아를 브라우저로 연다(node fetch 는 실패했다).
 *   3. 1차가 끝내 안 되면 **네이버와 무관한 2차 출처**로 교차확인한다.
 *      한 곳 단독 근거보다 두 곳 교차가 낫다. 다만 그것이 1차 대조를
 *      대신하지 못한다는 것은 분명히 적는다.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_reverify_primary.json';
const OUT_MD = 'tools/discovery/fund_reverify_primary.md';

const out = { at: new Date().toISOString(), sites: [], errors: [] };
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[primary] 중단:', e?.message || e);
  process.exit(1);
});

// ── 대조 대상 ───────────────────────────────────────────────────────────────
const src = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FUNDS = DATA.funds || [];
// MMF 는 클래스가 단순하고 규모가 커서 1차 출처에서 찾기 쉽다. 주식형도 하나 섞는다.
const big = FUNDS.filter((f) => f.aum > 0 && f.feeMin != null)
  .sort((a, b) => b.aum - a.aum);
const equity = FUNDS.filter((f) => f.assetClass === 'equity' && f.aum > 0 && f.feeMin != null)
  .sort((a, b) => b.aum - a.aum);
const targets = [...big.slice(0, 3), ...equity.slice(0, 2)].map((f) => ({
  code: f.code, name: f.name, company: f.company, type: f.type,
  basePrice: f.basePrice, aum: f.aum, nav: f.nav, feeMin: f.feeMin, feeMax: f.feeMax,
  classes: (f.classes || []).map((c) => ({ code: c.code, name: c.name, fee: c.totalFee })),
}));
out.targets = targets;
console.log('=== 대조 대상 ===');
for (const t of targets) {
  console.log(`  ${t.code} ${t.name.slice(0, 34)} · 보수 ${t.feeMin}~${t.feeMax}% · ` +
    `설정액 ${(t.aum / 1e8).toFixed(0)}억 · 기준가 ${t.basePrice}`);
}

const browser = await chromium.launch();

/** 한 사이트를 열고 오가는 XHR 을 기록한다. */
async function visit(label, url, drive) {
  const site = { label, url, xhr: [], notes: [] };
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
               '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'ko-KR',
  });
  const page = await ctx.newPage();
  page.on('response', async (res) => {
    const u = res.url();
    const type = res.request().resourceType();
    if (type !== 'xhr' && type !== 'fetch') return;
    let body = '';
    try { body = (await res.text()).slice(0, 1500); } catch { /* 본문을 못 읽는 응답도 있다 */ }
    site.xhr.push({ method: res.request().method(), url: u, status: res.status(),
                    postData: (res.request().postData() || '').slice(0, 600), body });
  });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(3500);
    site.title = await page.title();
    site.finalUrl = page.url();
    if (drive) await drive(page, site);
    await page.waitForTimeout(2500);
    site.text = (await page.evaluate(() => document.body?.innerText || '')).slice(0, 3000);
    site.ok = true;
  } catch (e) {
    site.ok = false;
    site.error = `${e.name}: ${e.message}`.slice(0, 200);
  }
  console.log(`  ${site.ok ? '✓' : '✗'} ${label} — ${site.title ?? site.error} · XHR ${site.xhr.length}건`);
  out.sites.push(site);
  await ctx.close();
  return site;
}

const one = targets[0];

// ── 1. 금투협 전자공시 ──────────────────────────────────────────────────────
console.log('\n=== 1. 금융투자협회 전자공시 (1차) ===');
await visit('전자공시 펀드공시',
  'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAnnList.xml&divisionId=MDIS01005001000000&serviceId=SDIS01005001000',
  async (page, site) => {
    // 표준코드 입력칸을 찾아 넣어 본다. WebSquare 는 id 가 규칙적이지 않아
    // 눈에 보이는 입력칸을 훑는다.
    try {
      const inputs = await page.locator('input[type="text"]:visible').all();
      site.notes.push(`보이는 입력칸 ${inputs.length}개`);
      if (inputs.length) {
        await inputs[0].fill(one.code);
        await page.waitForTimeout(400);
        const btn = page.locator('a:has-text("검색"), button:has-text("검색"), input[value="검색"]').first();
        if (await btn.count()) { await btn.click(); site.notes.push('검색 눌렀음'); }
        else { await inputs[0].press('Enter'); site.notes.push('엔터'); }
        await page.waitForTimeout(3500);
      }
    } catch (e) { site.notes.push(`조작 실패: ${e.message}`.slice(0, 120)); }
  });

await visit('전자공시 펀드검색(표준코드)',
  `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml&companyCd=&standardCd=${one.code}&standardDt=&grntGb=`);

// ── 2. 펀드다모아 ───────────────────────────────────────────────────────────
console.log('\n=== 2. 펀드다모아 (1차) ===');
await visit('펀드다모아', 'https://fundamoa.kofia.or.kr/');
await visit('펀드다모아(www)', 'https://www.fundamoa.kofia.or.kr/');

// ── 3. 네이버와 무관한 2차 출처 ─────────────────────────────────────────────
console.log('\n=== 3. 독립 2차 출처 (교차확인) ===');
await visit('펀드닥터 (에프앤가이드)', 'http://www.funddoctor.co.kr/');
await visit('펀드닥터 펀드검색',
  `http://www.funddoctor.co.kr/afn/fund/fdlist.jsp?fund_cd=${one.code}`);

// ── 판정 ────────────────────────────────────────────────────────────────────
// 표준코드가 응답 어딘가에 나타나야 "조회가 됐다" 고 말할 수 있다.
for (const s of out.sites) {
  s.hasCode = !!(s.text?.includes(one.code) ||
                 s.xhr.some((x) => (x.body || '').includes(one.code)));
  // 보수·설정액 같은 대조 대상이 보이는가
  s.hasFields = /총보수|보수율|설정액|순자산총액|기준가/.test(s.text || '') ||
                s.xhr.some((x) => /총보수|보수율|설정액|기준가/.test(x.body || ''));
}
const withCode = out.sites.filter((s) => s.hasCode);
const withFields = out.sites.filter((s) => s.hasFields);
const anyXhr = out.sites.filter((s) => s.xhr.length);

out.summary = {
  sites: out.sites.length,
  opened: out.sites.filter((s) => s.ok).length,
  withXhr: anyXhr.length,
  showingCode: withCode.map((s) => s.label),
  showingFields: withFields.map((s) => s.label),
};
console.log('\n=== 판정 ===');
console.log(`  연 곳 ${out.summary.opened}/${out.sites.length} · XHR 이 잡힌 곳 ${anyXhr.length}`);
console.log(`  표준코드가 보이는 곳: ${withCode.length ? withCode.map((s) => s.label).join(', ') : '없음'}`);
console.log(`  대조 필드가 보이는 곳: ${withFields.length ? withFields.map((s) => s.label).join(', ') : '없음'}`);

out.compared = withCode.length > 0 && withFields.length > 0;
out.verdict = out.compared
  ? `1차 출처에서 조회 경로를 찾음 (${withCode.map((s) => s.label).join(', ')})`
  : '1차 출처에서 표준코드 조회 경로를 찾지 못함 — 2차 출처 단독 근거로 남는다';
console.log(`\n판정: ${out.verdict}`);
await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const md = ['# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다', '',
  `검증 시각: ${out.at}`, '', `**${out.verdict}**`, '',
  '1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면',
  '주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.',
  '추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.', '',
  '## 대조하려던 펀드', '',
  '| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |', '|---|---|---|---:|---:|---:|'];
for (const t of targets) {
  md.push(`| ${t.code} | ${t.name.slice(0, 32)} | ${t.type} | ${t.basePrice} | ` +
    `${(t.aum / 1e8).toFixed(0)}억 | ${t.feeMin}~${t.feeMax}% |`);
}
md.push('', '## 접근 결과', '',
  '| 사이트 | 등급 | 열림 | XHR | 표준코드 보임 | 대조 필드 보임 |',
  '|---|---|:-:|---:|:-:|:-:|');
for (const s of out.sites) {
  const tier = /전자공시|다모아|kofia/i.test(s.label) ? '1차' : '2차';
  md.push(`| ${s.label} | ${tier} | ${s.ok ? '✓' : '✗'} | ${s.xhr.length} | ` +
    `${s.hasCode ? '○' : '·'} | ${s.hasFields ? '○' : '·'} |`);
}
md.push('');
// XHR 이 잡힌 곳은 계약을 적어 둔다. 다음 사람이 이어받을 수 있게.
const useful = out.sites.filter((s) => s.xhr.length);
if (useful.length) {
  md.push('## 잡힌 XHR (다음 시도의 출발점)', '');
  for (const s of useful) {
    md.push(`### ${s.label}`, '');
    for (const x of s.xhr.slice(0, 12)) {
      md.push(`- \`${x.method} ${x.url}\` → ${x.status}` +
        (x.postData ? `\n  - POST: \`${x.postData.slice(0, 200).replace(/`/g, '')}\`` : ''));
    }
    md.push('');
  }
}
if (!out.compared) {
  md.push('## 대조하지 못했습니다', '',
    '**이 화면의 숫자는 네이버 Npay 증권 한 곳에서 왔고, 그것은 2차 출처입니다.**',
    '두 차례 시도했으나 1차 출처에서 표준코드로 조회되는 경로를 재현하지 못했습니다.', '',
    '이것이 뜻하는 바를 분명히 적습니다.', '',
    '- 확인된 것: **내가 네이버를 정확히 옮겼다** (표본 400개 전 필드 일치)',
    '- 확인되지 않은 것: **네이버가 맞는가**', '',
    '네이버가 틀린 값을 실었다면 이 화면도 똑같이 틀립니다. 그 가능성은 이 검증으로',
    '배제되지 않습니다.', '', '### 사용자가 확인할 수 있는 경로', '',
    '| 확인할 것 | 어디서 | 어떻게 |', '|---|---|---|',
    '| 총보수 (클래스별) | 금융투자협회 전자공시 dis.kofia.or.kr | 펀드공시 → 표준코드 입력 → 보수 항목 |',
    '| 총보수 | 각 펀드 투자설명서 | 운용사 홈페이지 또는 판매사 |',
    '| 설정액·순자산 | 운용사 월간 운용보고서 | 운용사 홈페이지 |',
    '| 기준가 | 운용사 기준가 조회 | 운용사 홈페이지 |',
    '| 유형(분류) | 펀드다모아 fundamoa.kofia.or.kr | 유형 분류 대조 |', '',
    '위 표의 5개 펀드를 짚어 확인해 주시면 계열 전체의 신뢰도를 판단할 수 있습니다.',
    '한 종목이라도 어긋나면 원천 자체를 다시 봐야 합니다.', '');
}
if (out.errors.length) {
  md.push('## 오류', '');
  for (const e of out.errors.slice(0, 20)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
await browser.close();
console.log(`\n[primary] ${OUT_MD} · ${OUT_JSON} 기록`);
