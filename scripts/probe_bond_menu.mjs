#!/usr/bin/env node
/**
 * 채권 원천 탐색 ③ — 회사 사이트 메뉴를 따라가 장외채권 화면을 찾는다
 *
 *   node scripts/probe_bond_menu.mjs
 *
 * 2차 탐색에서 알아낸 것
 *   ㆍ미래에셋증권은 화면 데이터를 「POST …/*.wjson」 으로 부른다
 *     (예: POST /public/main/home_main_jisu.wjson · 본문 dumy=0)
 *   ㆍ첫 화면은 frameset 이고 실제 내용은 /main.do 안에 있다
 *   ㆍ내가 짐작한 채권 화면 주소는 모두 404 였다
 *
 * 그러니 짐작을 그만두고 사이트가 스스로 알려 주는 길을 따라간다 —
 * /main.do 의 메뉴(내비게이션)를 모두 적고, 그 중 채권으로 가는 것을 열어
 * 그 화면이 부르는 wjson 을 기록한다. 그것이 상품 목록의 주소다.
 *
 * 설명서(장외채권 설명서·핵심요약설명서·장외거래 추가설명자료) 주소도 함께 찾는다 —
 * 화면에 PDF 링크로 걸려 있을 가능성이 높다.
 */
import { chromium } from 'playwright';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR', ignoreHTTPSErrors: true });

/** 화면을 열고 wjson·PDF 요청과 채권 관련 링크를 적는다 */
async function open(label, url, wait) {
  const page = await ctx.newPage();
  const hits = [];
  page.on('request', (r) => {
    const u = r.url();
    if (/\.wjson|\.json|\.jsp|\.pdf/i.test(u) && u.indexOf('google') < 0 && u.indexOf('i18n') < 0) {
      hits.push({ m: r.method(), u: u, d: (r.postData() || '').slice(0, 240) });
    }
  });
  console.log('\n' + '─'.repeat(70));
  console.log('■ ' + label + '\n   ' + url);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(wait || 5000);
  } catch (e) {
    console.log('   열기 실패 — ' + e.message.split('\n')[0]);
    await page.close();
    return { hits: [], links: [] };
  }
  let links = [];
  try {
    links = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('a,[onclick]').forEach((a) => {
        const t = (a.textContent || '').replace(/\s+/g, ' ').trim();
        const h = a.getAttribute('href') || '';
        const oc = a.getAttribute('onclick') || '';
        if (/채권|bond/i.test(t) || /bond/i.test(h + oc)) {
          out.push({ t: t.slice(0, 34), h: h.slice(0, 150), oc: oc.slice(0, 150) });
        }
      });
      /* 같은 것이 여러 번 걸리므로 줄인다 */
      const seen = {}, uniq = [];
      out.forEach((x) => { const k = x.t + '|' + x.h + x.oc; if (!seen[k]) { seen[k] = 1; uniq.push(x); } });
      return uniq.slice(0, 30);
    });
  } catch (e) { /* 접근 막히면 넘어간다 */ }
  if (links.length) {
    console.log('   채권 관련 링크·메뉴 ' + links.length + '개');
    links.forEach((l) => console.log('     [' + l.t + '] ' + (l.h && l.h !== '#' ? l.h : l.oc)));
  } else {
    console.log('   채권 관련 링크 없음');
  }
  if (hits.length) {
    console.log('   데이터·문서 요청 ' + hits.length + '개');
    hits.slice(0, 18).forEach((h) => console.log('     ' + h.m + ' ' + h.u.slice(0, 155) + (h.d ? '\n        본문: ' + h.d : '')));
  }
  await page.close();
  return { hits, links };
}

console.log('='.repeat(70));
console.log('미래에셋증권 — 메뉴를 따라 장외채권 화면 찾기');
console.log('='.repeat(70));

/* ① 실제 내용이 있는 /main.do 에서 메뉴를 본다 */
const main = await open('main.do (메뉴 확인)', BASE + '/main.do', 7000);

/* ② 메뉴에서 얻은 채권 링크를 따라간다 */
const cand = [];
main.links.forEach((l) => {
  const m = /(?:'|")(\/[^'"]+\.(?:do|jsp|html))(?:'|")/.exec(l.oc) || /^(\/[^'"#]+)$/.exec(l.h);
  if (m) cand.push({ t: l.t, u: BASE + m[1] });
  else if (/^https?:\/\//.test(l.h)) cand.push({ t: l.t, u: l.h });
});
console.log('\n따라갈 후보 ' + cand.length + '개');
for (const c of cand.slice(0, 6)) await open('메뉴 → ' + c.t, c.u, 6000);

/* ③ 사이트 검색 — 검색 화면 주소를 모르니 몇 가지를 두드려 본다.
      검색이 되면 「장외채권」 화면 주소가 결과에 나온다. */
for (const p of ['/search/totalSearch.do', '/search/index.do', '/search.do', '/search/searchMain.do']) {
  const r = await open('검색 화면 후보 ' + p, BASE + p + '?query=' + encodeURIComponent('장외채권'), 5000);
  if (r.hits.length || r.links.length) break;
}

await browser.close();
console.log('\n탐색 끝.');
