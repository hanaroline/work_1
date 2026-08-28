#!/usr/bin/env node
/**
 * 펀드 원천 탐색 2차 — 화면이 실제로 무엇을 부르는지 본다.
 *
 *   node scripts/probe_fund_sources2.mjs
 *   -> tools/discovery/fund_probe2.{json,md}
 *
 * 1차에서 갈린 것:
 *   - 네이버 /fund/ 는 일반 증권 홈으로 넘어간다. 펀드 서비스가 없어졌다.
 *   - 금투협 전자공시(dis.kofia.or.kr)는 살아 있고, XMLSERVICES 엔드포인트가
 *     200 을 돌려준다(695B). 내가 보낸 XML 이 틀렸을 뿐이다.
 *   - 제로인(funddoctor)은 열린다.
 *   - 야후는 해외 뮤추얼펀드에 topHoldings 를 준다(이번 건과는 무관).
 *
 * 경로를 찍어 맞히는 것보다 **화면을 열어 무엇을 부르는지 보는 것**이 확실하다.
 * ETF 분배금을 찾을 때 이 방법이 답을 줬다. 그래서 브라우저로 연다.
 *
 * 확인 순서:
 *   1. 네이버 펀드가 정말 없어졌는지 (넘어가는 주소를 본다)
 *   2. 금투협 펀드공시 화면의 XHR 을 통째로 기록 — 목록·상세·자산구성
 *   3. 제로인 펀드 상세의 XHR
 *   4. 잡은 요청을 그대로 다시 던져 재현되는지
 *
 * 재현까지 돼야 수집기를 쓸 수 있다. 화면에서만 되는 것은 원천이 아니다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_probe2.json';
const OUT_MD = 'tools/discovery/fund_probe2.md';

const out = { observedAt: new Date().toISOString(), sites: [], replay: [] };

const INTERESTING = /json|xml|wjson|XMLSERVICES|ajax|api|search|list|detail/i;

/**
 * 한 화면을 열고 오가는 요청을 기록한다.
 *
 * @param {string} label   기록에 남길 이름
 * @param {string} url     열 주소
 * @param {Function} [act] 화면을 열고 나서 할 일 (검색 누르기 등)
 */
async function observe(browser, label, url, act) {
  const page = await browser.newPage();
  const calls = [];
  page.on('request', (req) => {
    const u = req.url();
    if (!INTERESTING.test(u)) return;
    calls.push({ method: req.method(), url: u.slice(0, 400), post: (req.postData() || '').slice(0, 1200) });
  });
  const responses = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (!INTERESTING.test(u)) return;
    let body = '';
    try { body = (await res.text()).slice(0, 3000); } catch { /* 본문 못 읽는 응답도 있다 */ }
    responses.push({ status: res.status(), url: u.slice(0, 400), body });
  });

  const site = { label, url };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3500);
    site.landedOn = page.url();
    site.title = await page.title().catch(() => '');
    if (act) {
      try { await act(page); } catch (e) { site.actError = String(e.message || e).slice(0, 160); }
      await page.waitForTimeout(3500);
    }
    site.text = (await page.evaluate(() => document.body?.innerText || '').catch(() => '')).slice(0, 1500);
  } catch (e) {
    site.error = String(e.message || e).slice(0, 200);
  }
  site.calls = calls;
  site.responses = responses.filter((r) => r.body && r.body.length > 40);
  console.log(`\n── ${label}`);
  console.log(`   최종 주소: ${site.landedOn || '(못 열림)'}${site.error ? ' · ' + site.error : ''}`);
  console.log(`   기록한 요청 ${calls.length}건 · 본문 있는 응답 ${site.responses.length}건`);
  for (const c of calls.slice(0, 12)) console.log(`     ${c.method} ${c.url.slice(0, 150)}`);
  out.sites.push(site);
  await page.close();
  return site;
}

const browser = await chromium.launch();

// ── 1. 네이버 펀드가 정말 없어졌나 ────────────────────────────────────────
await observe(browser, '네이버 펀드', 'https://finance.naver.com/fund/');

// ── 2. 금투협 전자공시 — 펀드 공시 화면 ───────────────────────────────────
// 여기가 국내 공모펀드의 원천이다. WebSquare 라 .wjson/XMLSERVICES 로 오간다.
await observe(browser, '금투협 전자공시 홈', 'https://dis.kofia.or.kr/');
await observe(browser, '금투협 펀드공시(통합검색)',
  'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeStstCom.xml');
await observe(browser, '금투협 펀드 자산구성',
  'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAssetStst.xml');

// ── 3. 펀드다모아 (1차에서 DNS 실패했다 — 브라우저로도 안 되는지 본다) ────
await observe(browser, '펀드다모아', 'https://fundamoa.kofia.or.kr/');

// ── 4. 제로인 ─────────────────────────────────────────────────────────────
await observe(browser, '제로인 펀드닥터', 'https://www.funddoctor.co.kr/');

// ── 5. 잡은 요청 재현 ─────────────────────────────────────────────────────
// 브라우저 없이 같은 응답이 나와야 수집기를 쓸 수 있다.
const seen = new Set();
const candidates = [];
for (const s of out.sites) {
  for (const c of s.calls) {
    if (seen.has(c.method + c.url)) continue;
    seen.add(c.method + c.url);
    if (/XMLSERVICES|wjson|\.json|api\//i.test(c.url)) candidates.push({ from: s.label, ...c });
  }
}
console.log(`\n=== 재현 시도 ${Math.min(candidates.length, 10)}건 ===`);
for (const c of candidates.slice(0, 10)) {
  const row = { from: c.from, method: c.method, url: c.url };
  try {
    const res = await fetch(c.url, {
      method: c.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Content-Type': c.post && c.post.trim().startsWith('<') ? 'application/xml' : 'application/json',
      },
      body: c.method === 'POST' ? c.post : undefined,
      signal: AbortSignal.timeout(15000),
    });
    row.status = res.status;
    const t = await res.text();
    row.bytes = t.length;
    row.sample = t.slice(0, 800);
    row.reproduced = res.ok && t.length > 200;
  } catch (e) { row.error = String(e.message || e).slice(0, 140); }
  console.log(`${row.reproduced ? '✓' : '✗'} ${row.method} ${row.url.slice(0, 110)} — ${row.error || row.status + ' ' + row.bytes + 'B'}`);
  out.replay.push(row);
}

await browser.close();

// ── 기록 ──────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 펀드 원천 탐색 2차 — 화면 관찰', '', `조사 시각: ${out.observedAt}`, '',
  '경로를 찍어 맞히는 대신 화면을 열어 **실제로 무엇을 부르는지** 기록했다.',
  '브라우저 없이 재현되는 것만 수집기에 쓸 수 있다.', ''];
for (const s of out.sites) {
  md.push(`## ${s.label}`, '');
  md.push(`- 요청 주소: \`${s.url}\``);
  md.push(`- 최종 도착: \`${s.landedOn || '(못 열림)'}\`${s.error ? ` — ${s.error}` : ''}`);
  md.push(`- 제목: ${s.title || '–'}`);
  md.push(`- 기록한 요청: ${s.calls.length}건`, '');
  if (s.calls.length) {
    md.push('| 방식 | 주소 |', '|---|---|');
    for (const c of s.calls.slice(0, 20)) md.push(`| ${c.method} | \`${c.url.slice(0, 180)}\` |`);
    md.push('');
  }
  if (s.text) { md.push('화면에 보인 글:', '', '```', s.text.slice(0, 600), '```', ''); }
}
md.push('## 재현 결과', '', '| 출처 | 방식 | 주소 | 결과 |', '|---|---|---|---|');
for (const r of out.replay) {
  md.push(`| ${r.from} | ${r.method} | \`${r.url.slice(0, 120)}\` | ${r.error ? '✗ ' + r.error : (r.reproduced ? '✓ ' : '△ ') + r.status + ' ' + r.bytes + 'B'} |`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[probe2] ${OUT_MD} · ${OUT_JSON} 기록`);
