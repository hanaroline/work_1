#!/usr/bin/env node
/**
 * 미래에셋증권 ELS 화면/엔드포인트 탐색기 (조사용)
 *
 * v4 — 지금까지 확인한 사실 위에서 표적 탐색
 *   v1/v2 (정적 fetch): 홈은 4KB JS 셸(SPA), 인코딩 EUC-KR, 정적 링크로는 서브도메인만 나옴
 *   v3 (Playwright)   : WebSquare 기반. 데이터는 `.wjson` POST 로 오간다.
 *                       예) POST /public/main/home_main_jisu.wjson
 *                       화면 URL 패턴은 /hki/hki7000/v05.do 형태.
 *                       GNB 는 <a href> 가 아니라 JS 핸들러라 링크 추적이 안 됨.
 *
 * v4 가 하는 일
 *   1) 사이트 통합검색 API(getTotalSearch.jsp)에 ELS 키워드로 질의 → 실제 화면 URL 확보
 *   2) 로드된 JS 번들 전체에서 `/hkX/hkXNNNN/pNN.do` 와 `*.wjson` 경로를 싹 긁는다
 *   3) 그렇게 얻은 화면 후보를 실제로 렌더링하고, 그때 오가는 wjson 요청/응답을 기록
 *      → 상품 목록을 내려주는 엔드포인트와 그 요청 파라미터를 특정한다
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

/** 상품 목록 응답으로 보이는가 */
const PRODUCT_RE = /(제\s*\d{3,6}\s*회|기초자산|조기상환|자동조기상환|녹인|낙인|KNOCK|파생결합증권|청약기간)/i;
/** 화면/엔드포인트 후보 판단 */
const ELS_RE = /(els|elb|dls|dlb|파생결합|주가연계|구조화|청약)/i;

const seenReq = [];
const captured = [];

function slug(s) {
  return s.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 110);
}

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

  const scriptUrls = new Set();
  page.on('request', (r) => {
    if (r.resourceType() === 'script') scriptUrls.add(r.url());
    if (['xhr', 'fetch'].includes(r.resourceType()))
      seenReq.push({ method: r.method(), url: r.url(), post: (r.postData() || '').slice(0, 2000) });
  });
  page.on('response', async (res) => {
    const req = res.request();
    if (!['xhr', 'fetch'].includes(req.resourceType())) return;
    if (/google|doubleclick|analytics/.test(res.url())) return;
    let body = '';
    try { body = (await res.text()).slice(0, 300000); } catch { return; }
    captured.push({ url: res.url(), method: req.method(), status: res.status(),
                    post: (req.postData() || '').slice(0, 2000), body });
  });

  const log = [];

  // ---------- 1) 홈 로드 (세션 쿠키 + JS 번들 확보) ----------
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  log.push({ step: 'home', title: await page.title(), scripts: scriptUrls.size });

  // ---------- 2) 통합검색 API 로 ELS 화면 찾기 ----------
  const searchResults = {};
  for (const q of ['ELS', '파생결합증권', 'ELS 청약', '주가연계증권']) {
    try {
      const r = await page.evaluate(async ({ origin, q }) => {
        const res = await fetch(origin + '/search/getTotalSearch.jsp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: 'searchWord=' + encodeURIComponent(q) + '&currentPage=1&pageSize=30',
          credentials: 'include',
        });
        return { status: res.status, ct: res.headers.get('content-type'), body: (await res.text()).slice(0, 60000) };
      }, { origin: ORIGIN, q });
      searchResults[q] = r;
    } catch (e) {
      searchResults[q] = { error: String(e?.message ?? e) };
    }
  }
  await writeFile(join(OUT, '_search.json'), JSON.stringify(searchResults, null, 2));

  // ---------- 3) JS 번들에서 경로 수집 ----------
  const bundlePaths = new Set();
  const wjsonPaths = new Set();
  const bundles = [...scriptUrls].filter((u) => /miraeasset/.test(u));
  for (const u of bundles.slice(0, 60)) {
    try {
      const txt = await page.evaluate(async (url) => {
        const r = await fetch(url, { credentials: 'include' });
        return (await r.text()).slice(0, 1500000);
      }, u);
      for (const m of txt.matchAll(/["'`](\/[a-z]{2,4}\/[a-z]{2,6}\d{3,5}\/[a-z]\d{2,3}\.do)["'`]/gi)) bundlePaths.add(m[1]);
      for (const m of txt.matchAll(/["'`]([a-zA-Z0-9._/-]*\.wjson)["'`]/g)) wjsonPaths.add(m[1]);
    } catch {}
  }
  // 홈 HTML 자체에서도 한 번 더
  const homeHtml = await page.content();
  for (const m of homeHtml.matchAll(/(\/[a-z]{2,4}\/[a-z]{2,6}\d{3,5}\/[a-z]\d{2,3}\.do)/gi)) bundlePaths.add(m[1]);
  await writeFile(join(OUT, 'home.rendered.html'), homeHtml);
  await writeFile(join(OUT, '_paths.json'),
    JSON.stringify({ doPaths: [...bundlePaths], wjsonPaths: [...wjsonPaths] }, null, 2));

  // ---------- 4) 화면 후보 렌더링 ----------
  // 검색 결과 본문에서 나온 .do 경로 + 번들에서 나온 경로를 합쳐 후보로
  const fromSearch = new Set();
  for (const r of Object.values(searchResults)) {
    if (!r.body) continue;
    for (const m of r.body.matchAll(/(https?:\/\/[a-z.]*miraeasset\.com)?(\/[a-z]{2,4}\/[a-z]{2,6}\d{3,5}\/[a-z]\d{2,3}\.do[^"'\s<>]*)/gi))
      fromSearch.add(m[2]);
  }

  const candidates = [...new Set([...fromSearch, ...bundlePaths])].slice(0, 40);
  log.push({ step: 'candidates', fromSearch: fromSearch.size, fromBundles: bundlePaths.size, tried: candidates.length });

  const visited = [];
  for (const p of candidates) {
    const url = ORIGIN + p;
    const before = captured.length;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1800);
      const html = await page.content();
      const text = await page.evaluate(() => document.body?.innerText || '');
      const isEls = ELS_RE.test(text) || PRODUCT_RE.test(text);
      visited.push({ path: p, title: await page.title(), textLen: text.length, isEls,
                     newXhr: captured.length - before,
                     head: text.replace(/\s+/g, ' ').slice(0, 500) });
      if (isEls) await writeFile(join(OUT, `page.${slug(p)}.html`), html);
    } catch (e) {
      visited.push({ path: p, error: String(e?.message ?? e) });
    }
  }
  await writeFile(join(OUT, '_visited.json'), JSON.stringify(visited, null, 2));

  await browser.close();

  // ---------- 5) 결과 정리 ----------
  const productHits = captured.filter((c) => PRODUCT_RE.test(c.body));
  await writeFile(join(OUT, '_captured.json'),
    JSON.stringify(captured.map((c) => ({ ...c, body: c.body.slice(0, 6000) })), null, 2));
  await writeFile(join(OUT, '_summary.json'), JSON.stringify({
    log,
    doPathCount: bundlePaths.size,
    wjsonPathCount: wjsonPaths.size,
    visited,
    productApiCandidates: productHits.map((h) => ({ url: h.url, method: h.method, status: h.status,
                                                     post: h.post, sample: h.body.slice(0, 3000) })),
    allXhr: [...new Set(seenReq.map((r) => r.method + ' ' + r.url))].filter((u) => !/google|analytics/.test(u)),
  }, null, 2));

  console.log('\n===== 1) 통합검색 결과 =====');
  for (const [q, r] of Object.entries(searchResults)) {
    console.log(`\n  "${q}" -> ${r.error ? 'ERROR ' + r.error : `[${r.status}] ${r.ct} ${r.body?.length}B`}`);
    if (r.body) console.log('    ' + r.body.replace(/\s+/g, ' ').slice(0, 900));
  }

  console.log('\n===== 2) JS 번들에서 찾은 화면 경로 =====');
  console.log([...bundlePaths].slice(0, 80).join('\n') || '  (없음)');
  console.log('\n----- wjson 엔드포인트 -----');
  console.log([...wjsonPaths].slice(0, 80).join('\n') || '  (없음)');

  console.log('\n===== 3) 방문한 화면 =====');
  visited.forEach((v) =>
    console.log(`  ${v.isEls ? '[ELS]' : '     '} ${v.path} | ${v.error || v.title} | xhr+${v.newXhr} | ${(v.head || '').slice(0, 160)}`)
  );

  console.log('\n===== 4) 상품 데이터로 보이는 응답 =====');
  if (!productHits.length) console.log('  (없음)');
  productHits.slice(0, 12).forEach((h) => {
    console.log(`\n  ${h.method} ${h.url} [${h.status}]`);
    if (h.post) console.log(`     post: ${h.post.slice(0, 500)}`);
    console.log(`     body: ${h.body.replace(/\s+/g, ' ').slice(0, 1500)}`);
  });
  console.log('\n===== END =====');
}

main().catch((e) => { console.error(e); process.exit(1); });
