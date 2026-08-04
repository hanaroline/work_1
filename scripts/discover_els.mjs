#!/usr/bin/env node
/**
 * 미래에셋증권 ELS 관련 화면/엔드포인트 탐색기 (조사용)
 *
 * v3 — Playwright 렌더링 기반
 *  v1/v2(정적 fetch)로 확인된 사실:
 *    · securities.miraeasset.com 은 4KB 짜리 JS 셸 = SPA. 정적 HTML 에 상품 정보가 전혀 없음
 *    · 페이지 인코딩은 EUC-KR
 *    · 정적 링크 추적으로는 서브도메인(채용/웹진/IR)만 나옴
 *  따라서 실제 브라우저로 렌더링하고, 그 과정에서 오가는 XHR/fetch 를 전부 기록해
 *  상품 목록을 내려주는 API 엔드포인트를 찾는다.
 *
 * 사용: node scripts/discover_els.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = 'discovery';
const START = 'https://securities.miraeasset.com/';
const KEYWORD = /(els|elb|dls|dlb|파생결합|주가연계|청약|구조화|금융상품|상품몰)/i;

/** 상품 목록 API 로 보이는 응답인지 */
function looksLikeProductApi(url, body) {
  if (!body) return false;
  return /(제\s*\d{3,6}\s*회|ELS|파생결합|기초자산|조기상환|청약)/i.test(body);
}

const requests = [];   // 모든 XHR/fetch
const responses = [];  // 본문까지 확보한 것

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

  page.on('request', (r) => {
    const type = r.resourceType();
    if (type === 'xhr' || type === 'fetch' || type === 'document') {
      requests.push({ method: r.method(), url: r.url(), type, postData: (r.postData() || '').slice(0, 1500) });
    }
  });
  page.on('response', async (res) => {
    const req = res.request();
    const type = req.resourceType();
    if (type !== 'xhr' && type !== 'fetch') return;
    const ct = res.headers()['content-type'] || '';
    if (/image|font|video|octet-stream/i.test(ct)) return;
    let body = '';
    try { body = (await res.text()).slice(0, 200000); } catch { return; }
    responses.push({ url: res.url(), status: res.status(), ct, method: req.method(),
                     postData: (req.postData() || '').slice(0, 1500), body });
  });

  const notes = [];
  async function visit(url, label) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2500);
      notes.push({ label, url, finalUrl: page.url(), title: await page.title() });
    } catch (e) {
      notes.push({ label, url, error: String(e?.message ?? e) });
    }
  }

  // 1) 홈 렌더링
  await visit(START, 'home');
  await writeFile(join(OUT, 'home.rendered.html'), await page.content());
  await page.screenshot({ path: join(OUT, 'home.png'), fullPage: true }).catch(() => {});

  // 2) 렌더링된 DOM 에서 링크 수집
  async function links() {
    return page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]')).map((a) => ({
        href: a.href,
        text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      }))
    );
  }
  const homeLinks = await links();
  await writeFile(join(OUT, 'home.links.json'), JSON.stringify(homeLinks, null, 2));

  // 3) GNB 를 hover 해서 감춰진 메뉴를 펼친 뒤 다시 수집
  try {
    const gnb = await page.$$('nav a, .gnb a, header a, [class*="menu"] a');
    for (const h of gnb.slice(0, 25)) { await h.hover({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(120); }
    await page.waitForTimeout(1200);
  } catch {}
  const expandedLinks = await links();
  await writeFile(join(OUT, 'home.links.expanded.json'), JSON.stringify(expandedLinks, null, 2));

  // 4) 상품 관련 링크 후보 방문
  const cands = [...new Map(
    expandedLinks
      .filter((l) => /miraeasset\.com/.test(l.href) && !/download\./.test(l.href))
      .filter((l) => KEYWORD.test(decodeURIComponent(l.href)) || KEYWORD.test(l.text))
      .map((l) => [l.href, l])
  ).values()].slice(0, 12);

  for (const c of cands) {
    await visit(c.href, 'candidate: ' + c.text);
    const slug = c.href.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    await writeFile(join(OUT, `cand.${slug}.html`), await page.content()).catch(() => {});
  }

  await browser.close();

  // 5) 결과 저장 + 요약
  await writeFile(join(OUT, '_requests.json'), JSON.stringify(requests, null, 2));
  await writeFile(
    join(OUT, '_responses.json'),
    JSON.stringify(responses.map((r) => ({ ...r, body: r.body.slice(0, 4000) })), null, 2)
  );
  await writeFile(join(OUT, '_notes.json'), JSON.stringify(notes, null, 2));

  const hits = responses.filter((r) => looksLikeProductApi(r.url, r.body));
  await writeFile(join(OUT, '_summary.json'), JSON.stringify({
    notes,
    xhrCount: requests.length,
    responseCount: responses.length,
    productApiCandidates: hits.map((h) => ({ url: h.url, method: h.method, status: h.status, ct: h.ct,
                                             postData: h.postData, sample: h.body.slice(0, 2000) })),
    allXhrUrls: [...new Set(requests.map((r) => r.method + ' ' + r.url))],
  }, null, 2));

  console.log('\n===== 1) 방문 결과 =====');
  notes.forEach((n) => console.log(`  ${n.label}: ${n.error ? 'ERROR ' + n.error : n.title + ' <- ' + n.finalUrl}`));

  console.log('\n===== 2) 상품 관련 링크 후보 =====');
  if (!cands.length) console.log('  (없음)');
  cands.forEach((c) => console.log(`  ${c.text || '(no text)'}  ->  ${c.href}`));

  console.log('\n===== 3) 상품 데이터로 보이는 API 응답 =====');
  if (!hits.length) console.log('  (없음)');
  hits.forEach((h) => {
    console.log(`\n  ${h.method} ${h.url}  [${h.status}] ${h.ct}`);
    if (h.postData) console.log(`     post: ${h.postData.slice(0, 400)}`);
    console.log(`     body: ${h.body.slice(0, 1200).replace(/\s+/g, ' ')}`);
  });

  console.log('\n===== 4) 관측된 XHR 전체 =====');
  [...new Set(requests.map((r) => r.method + ' ' + r.url))].slice(0, 120).forEach((u) => console.log('  ' + u));
  console.log('\n===== END =====');
}

main().catch((e) => { console.error(e); process.exit(1); });
