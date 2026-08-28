#!/usr/bin/env node
/**
 * 펀드 원천 탐색 5차 — 화면 경로를 지어내지 말고 메뉴에서 얻는다.
 *
 *   node scripts/probe_fund_sources5.mjs
 *   -> tools/discovery/fund_probe5.{json,md}
 *
 * 4차에서 헛짚었다. 내가 쓴 w2xPath 세 개가 전부 없는 화면이었다.
 * 버튼 0개·입력칸 0개로 나온 것이 그 증거다 — WebSquare 는 레이아웃을 못
 * 받으면 빈 화면을 그린다. "눌러도 아무 일이 없다" 가 아니라 "누를 것이
 * 처음부터 없었다" 였다.
 *
 * 경로를 짐작하는 짓을 그만두고 메뉴에서 받아 온다.
 *
 *   1. 브라우저로 dis.kofia.or.kr 을 연다 (세션이 필요하다)
 *   2. 같은 세션으로 메뉴 xml 을 받아 w2xPath 를 통째로 긁는다
 *   3. 펀드 관련 화면을 실제로 열어 버튼·입력칸이 그려지는지 확인한다
 *   4. 그려지면 조회를 눌러 POST 를 잡는다
 *
 * 3번에서 버튼이 0개면 그 경로도 틀린 것이다. 이번에는 그것을 화면마다
 * 표로 남겨, 어디까지 맞았는지가 눈에 보이게 한다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_probe5.json';
const OUT_MD = 'tools/discovery/fund_probe5.md';
const BASE = 'https://dis.kofia.or.kr';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const out = { at: new Date().toISOString(), menus: [], paths: [], screens: [] };

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA });
const home = await ctx.newPage();

console.log('=== 1. 홈을 열어 세션을 받는다 ===');
await home.goto(`${BASE}/websquare/index.jsp?w2xPath=/wq/main/main.xml`,
  { waitUntil: 'domcontentloaded', timeout: 40000 });
await home.waitForTimeout(4000);
console.log(`   제목: ${await home.title().catch(() => '–')}`);

// ── 2. 메뉴 xml 을 같은 세션으로 받아 경로를 긁는다 ───────────────────────
console.log('\n=== 2. 메뉴에서 화면 경로 긁기 ===');
const MENUS = ['/wq/com/gnb.xml', '/wq/com/gnbTop.xml', '/wq/com/quick.xml',
               '/wq/main/main.xml', '/wq/com/lnb.xml', '/wq/com/sitemap.xml'];
const found = new Map();   // w2xPath -> 화면 이름(있으면)

for (const m of MENUS) {
  const row = { menu: m };
  try {
    // 브라우저 세션(쿠키)으로 받는다. 바깥에서 그냥 받으면 오류 페이지가 온다.
    const res = await home.evaluate(async (url) => {
      const r = await fetch(url, { credentials: 'include' });
      return { status: r.status, text: await r.text() };
    }, `${BASE}${m}?postfix=${Date.now()}`);
    row.status = res.status;
    row.bytes = res.text.length;
    row.isError = /오류가 발생/.test(res.text);
    if (!row.isError) {
      // w2xPath 와, 바로 앞뒤에 붙은 한글 이름을 같이 집는다.
      const re = /([가-힣][가-힣A-Za-z0-9()·\s]{1,30})?[^]{0,120}?(\/wq\/[A-Za-z0-9_/]+\.xml)/g;
      let mm;
      while ((mm = re.exec(res.text)) !== null) {
        const path = mm[2];
        if (!found.has(path)) found.set(path, (mm[1] || '').trim() || null);
      }
      row.hits = [...res.text.matchAll(/\/wq\/[A-Za-z0-9_/]+\.xml/g)].length;
    }
  } catch (e) { row.error = String(e.message || e).slice(0, 120); }
  console.log(`  ${m} — ${row.error || row.status + ' ' + row.bytes + 'B' + (row.isError ? ' (오류페이지)' : ` · 경로 ${row.hits ?? 0}`)}`);
  out.menus.push(row);
}

const all = [...found.entries()].map(([path, name]) => ({ path, name }));
const fundPaths = all.filter((p) => /fund/i.test(p.path));
out.paths = all;
console.log(`\n  전체 경로 ${all.length}개 · 펀드 관련 ${fundPaths.length}개`);
for (const p of fundPaths.slice(0, 25)) console.log(`    ${p.path}${p.name ? '  (' + p.name + ')' : ''}`);

// 메뉴에서 못 긁었으면 홈 화면의 링크·스크립트에서라도 찾는다.
if (!fundPaths.length) {
  console.log('  메뉴에서 못 긁었다 — 홈 화면 안에서 찾는다');
  const inline = await home.evaluate(() => {
    const txt = document.documentElement.outerHTML;
    return [...new Set((txt.match(/\/wq\/[A-Za-z0-9_/]+\.xml/g) || []))];
  });
  console.log(`    화면 안 경로 ${inline.length}개: ${inline.slice(0, 20).join(', ')}`);
  out.inline = inline;
  inline.filter((p) => /fund/i.test(p)).forEach((p) => fundPaths.push({ path: p, name: null }));
}

// ── 3. 펀드 화면을 실제로 열어 본다 ───────────────────────────────────────
console.log('\n=== 3. 펀드 화면 열기 ===');
for (const { path, name } of fundPaths.slice(0, 8)) {
  const page = await ctx.newPage();
  const posts = [];
  const bodies = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && /XMLSERVICES|proframe/i.test(r.url())) {
      posts.push({ url: r.url(), body: (r.postData() || '').slice(0, 4000) });
    }
  });
  page.on('response', async (r) => {
    if (!/XMLSERVICES|proframe/i.test(r.url())) return;
    try { bodies.push({ status: r.status(), body: (await r.text()).slice(0, 4000) }); } catch { /* 못 읽음 */ }
  });

  const screen = { path, name };
  try {
    await page.goto(`${BASE}/websquare/index.jsp?w2xPath=${path}`,
      { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(5000);
    screen.controls = await page.evaluate(() => {
      const pick = (sel) => [...document.querySelectorAll(sel)].slice(0, 30).map((e) => ({
        id: e.id || null,
        text: (e.innerText || e.value || e.getAttribute('title') || '').trim().slice(0, 30),
      })).filter((e) => e.id || e.text);
      return { buttons: pick('button, input[type=button], input[type=submit], a[role=button]'),
               inputs: pick('input[type=text], input:not([type]), select') };
    });
    screen.rendered = (screen.controls.buttons.length + screen.controls.inputs.length) > 0;

    if (screen.rendered) {
      for (const label of ['조회', '검색']) {
        const btn = page.locator(`text=${label}`).first();
        if (await btn.count().catch(() => 0)) {
          try { await btn.click({ timeout: 4000 }); screen.clicked = label; await page.waitForTimeout(4500); break; }
          catch { /* 다음 후보 */ }
        }
      }
    }
    screen.text = (await page.evaluate(() => document.body?.innerText || '')).slice(0, 800);
  } catch (e) { screen.error = String(e.message || e).slice(0, 160); }
  screen.posts = posts;
  screen.responses = bodies;

  const b = screen.controls?.buttons?.length ?? 0;
  const i = screen.controls?.inputs?.length ?? 0;
  console.log(`  ${path} — 버튼 ${b} · 입력 ${i} · ${screen.rendered ? '그려짐' : '빈 화면'}` +
              `${screen.clicked ? ' · "' + screen.clicked + '" 누름' : ''} · POST ${posts.length}건`);
  for (const p of posts.slice(0, 2)) {
    console.log(`      app=${(p.body.match(/<pfmAppName>([^<]*)</) || [])[1]} ` +
                `svc=${(p.body.match(/<pfmSvcName>([^<]*)</) || [])[1]}`);
  }
  out.screens.push(screen);
  await page.close();
}

await browser.close();

// ── 기록 ──────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 펀드 원천 탐색 5차 — 메뉴에서 얻은 화면 경로', '', `조사 시각: ${out.at}`, '',
  '4차에서 헛짚었다. 내가 쓴 w2xPath 세 개가 전부 없는 화면이었다. 버튼 0개·',
  '입력칸 0개가 그 증거다 — WebSquare 는 레이아웃을 못 받으면 빈 화면을 그린다.',
  '"눌러도 아무 일이 없다" 가 아니라 "누를 것이 처음부터 없었다" 였다.', '',
  '그래서 경로를 짐작하지 않고 메뉴에서 받아 왔다.', '',
  '## 메뉴', '', '| 메뉴 xml | 결과 | 긁은 경로 |', '|---|---|---:|'];
for (const m of out.menus) {
  md.push(`| \`${m.menu}\` | ${m.error || m.status + ' ' + m.bytes + 'B' + (m.isError ? ' (오류)' : '')} | ${m.hits ?? '–'} |`);
}
md.push('', `## 찾은 화면 경로 (${out.paths.length}개)`, '', '```',
  out.paths.map((p) => `${p.path}${p.name ? '  — ' + p.name : ''}`).join('\n') || '(없음)', '```', '');
md.push('## 펀드 화면 열기 결과', '', '| 경로 | 버튼 | 입력 | 그려짐 | 누름 | POST |', '|---|---:|---:|:-:|---|---:|');
for (const s of out.screens) {
  md.push(`| \`${s.path}\` | ${s.controls?.buttons?.length ?? '–'} | ${s.controls?.inputs?.length ?? '–'} | ` +
    `${s.rendered ? '○' : '·'} | ${s.clicked || '–'} | ${s.posts.length} |`);
}
md.push('');
for (const s of out.screens) {
  if (!s.posts.length && !s.rendered) continue;
  md.push(`### \`${s.path}\``, '');
  if (s.controls?.buttons?.length) {
    md.push('버튼:', '', '```', s.controls.buttons.map((b) => `${b.id || '-'} : ${b.text}`).join('\n'), '```', '');
  }
  for (const p of s.posts.slice(0, 2)) md.push('보낸 본문:', '', '```xml', p.body.slice(0, 1800), '```', '');
  for (const r of s.responses.slice(0, 2)) md.push(`응답 (${r.status}):`, '', '```xml', r.body.slice(0, 1800), '```', '');
  if (s.text) md.push('화면 글:', '', '```', s.text.slice(0, 500), '```', '');
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[probe5] ${OUT_MD} · ${OUT_JSON} 기록`);
