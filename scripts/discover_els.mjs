#!/usr/bin/env node
/**
 * 미래에셋증권 ELS 화면/엔드포인트 탐색기 (조사용)
 *
 * v5 — 확인된 사실 위에서 최종 조준
 *   v1/v2 정적 fetch : 홈은 4KB JS 셸(SPA), EUC-KR, 정적 링크로는 아무것도 안 나옴
 *   v3 Playwright    : WebSquare 기반. 데이터는 `.wjson` / `.json` POST 로 오간다
 *   v4 번들 스캔     : 화면 경로 1,238개 확보. 그중 /hks/hksXXXX/n01.do 가 "금융상품 안내" 화면.
 *                      개인투자용국채 화면은 데이터를 `POST /hks/hks4046/a06.json` 로 받아온다
 *                      → 화면 /hks/hksXXXX/*.do  ↔  데이터 /hks/hksXXXX/aNN.json 규칙
 *   또한 사이트 전체 메뉴가 /js/bestez.menu.data.js 에 통째로 들어있다
 *
 * v5 가 하는 일
 *   1) 메뉴 데이터(bestez.menu.data.js)를 받아 ELS/파생결합 메뉴 항목과 그 화면 경로를 찾는다
 *   2) 찾은 화면을 렌더링하고 그때 오가는 .json/.wjson 요청·응답을 기록한다
 *   3) 상품 목록 응답의 필드 구조를 그대로 출력해 collect_els.mjs 의 매핑 근거로 삼는다
 *
 * 사용: node scripts/discover_els.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = 'discovery';
const ORIGIN = 'https://securities.miraeasset.com';

const MENU_JS = [
  '/js/bestez.menu.data.js',
  '/js/bestez.specialmenu.data.js',
  '/js/bestez.guide.data.js',
];

const ELS_MENU_RE = /(ELS|ELB|DLS|DLB|파생결합|주가연계)/i;
const PRODUCT_RE = /(제\s*\d{3,6}\s*회|기초자산|조기상환|자동조기상환|낙인|녹인|청약기간|파생결합증권)/i;

const captured = [];

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  page.on('response', async (res) => {
    const req = res.request();
    if (!['xhr', 'fetch'].includes(req.resourceType())) return;
    if (/google|analytics|127\.0\.0\.1/.test(res.url())) return;
    let body = '';
    try { body = (await res.text()).slice(0, 300000); } catch { return; }
    captured.push({ url: res.url(), method: req.method(), status: res.status(),
                    post: (req.postData() || '').slice(0, 2000), body });
  });

  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);

  // ---------- 1) 메뉴 데이터에서 ELS 항목 찾기 ----------
  const menuHits = [];
  for (const path of MENU_JS) {
    let txt = '';
    try {
      txt = await page.evaluate(async (u) => {
        const r = await fetch(u, { credentials: 'include' });
        const buf = await r.arrayBuffer();
        // 메뉴 파일은 EUC-KR 인 경우가 있다
        const utf = new TextDecoder('utf-8').decode(buf);
        return /�/.test(utf) ? new TextDecoder('euc-kr').decode(buf) : utf;
      }, path);
    } catch (e) {
      menuHits.push({ path, error: String(e?.message ?? e) });
      continue;
    }
    await writeFile(join(OUT, 'menu' + path.replace(/\//g, '_')), txt);

    // 메뉴 항목 한 줄에 이름과 URL 이 같이 있는 형태를 노린다
    const lines = txt.split(/[\n,]/);
    const hits = [];
    lines.forEach((line, i) => {
      if (!ELS_MENU_RE.test(line)) return;
      // 같은 줄 또는 앞뒤 3줄 안의 .do 경로를 함께 잡는다
      const near = lines.slice(Math.max(0, i - 3), i + 4).join(' ');
      const urls = [...near.matchAll(/(\/[a-z]{2,4}\/[a-z]{2,6}\d{3,5}\/[a-z]\d{2,3}\.do)/gi)].map((m) => m[1]);
      hits.push({ line: line.replace(/\s+/g, ' ').trim().slice(0, 200), urls: [...new Set(urls)] });
    });
    menuHits.push({ path, bytes: txt.length, hits: hits.slice(0, 60) });
  }
  await writeFile(join(OUT, '_menu-hits.json'), JSON.stringify(menuHits, null, 2));

  // ---------- 2) 후보 화면 렌더링 ----------
  const screens = [...new Set(menuHits.flatMap((m) => (m.hits || []).flatMap((h) => h.urls)))];
  const visited = [];
  for (const s of screens.slice(0, 15)) {
    const before = captured.length;
    try {
      await page.goto(ORIGIN + s, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3500);
      const text = await page.evaluate(() => document.body?.innerText || '');
      const hasProduct = PRODUCT_RE.test(text);
      visited.push({ screen: s, title: await page.title(), hasProduct,
                     newCalls: captured.slice(before).map((c) => c.method + ' ' + c.url),
                     head: text.replace(/\s+/g, ' ').slice(0, 400) });
      if (hasProduct) await writeFile(join(OUT, 'screen' + s.replace(/\//g, '_') + '.html'), await page.content());
    } catch (e) {
      visited.push({ screen: s, error: String(e?.message ?? e) });
    }
  }
  await browser.close();

  // ---------- 3) 결과 ----------
  const productHits = captured.filter((c) => PRODUCT_RE.test(c.body));
  await writeFile(join(OUT, '_captured.json'),
    JSON.stringify(captured.map((c) => ({ ...c, body: c.body.slice(0, 20000) })), null, 2));
  await writeFile(join(OUT, '_summary.json'), JSON.stringify({
    menuHits, screens, visited,
    productApiCandidates: productHits.map((h) => ({ url: h.url, method: h.method, status: h.status,
                                                     post: h.post, sample: h.body.slice(0, 6000) })),
  }, null, 2));

  console.log('\n===== 1) 메뉴에서 찾은 ELS 항목 =====');
  for (const m of menuHits) {
    console.log(`\n  ${m.path} (${m.bytes ?? 0}B) ${m.error ? 'ERROR ' + m.error : `hits=${m.hits.length}`}`);
    (m.hits || []).slice(0, 30).forEach((h) => console.log(`    ${h.line}\n       -> ${h.urls.join(', ') || '(경로 없음)'}`));
  }

  console.log('\n===== 2) 방문 화면 =====');
  visited.forEach((v) => {
    console.log(`\n  ${v.hasProduct ? '[상품]' : '      '} ${v.screen} | ${v.error || v.title}`);
    (v.newCalls || []).forEach((c) => console.log(`       ${c}`));
    if (v.head) console.log(`       ${v.head.slice(0, 250)}`);
  });

  console.log('\n===== 3) 상품 데이터 응답 =====');
  if (!productHits.length) console.log('  (없음)');
  productHits.slice(0, 8).forEach((h) => {
    console.log(`\n  ${h.method} ${h.url} [${h.status}]`);
    if (h.post) console.log(`     post: ${h.post.slice(0, 600)}`);
    console.log(`     body: ${h.body.replace(/\s+/g, ' ').slice(0, 2500)}`);
  });
  console.log('\n===== END =====');
}

main().catch((e) => { console.error(e); process.exit(1); });
