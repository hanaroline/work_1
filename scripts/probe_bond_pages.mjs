#!/usr/bin/env node
/**
 * 채권 원천 탐색 ② — 브라우저로 열어 실제 데이터 요청을 관찰한다
 *
 *   node scripts/probe_bond_pages.mjs
 *
 * 1차 탐색에서 세 곳 모두 주소를 짐작할 수 없다는 것이 드러났다 —
 * 미래에셋증권과 금융투자협회 채권정보센터는 frameset 이고, SEIBRO 는 WebSquare
 * (자바스크립트로 화면을 그린다), KRX 는 bld 값을 모르면 400 을 준다.
 * 그래서 화면을 실제로 열고, 화면이 스스로 부르는 요청(XHR/fetch)을 적어 둔다 —
 * 그것이 곧 데이터 주소다.
 *
 * 요청은 최소한으로 한다 (몇 개 화면만 열고 끝낸다).
 */
import { chromium } from 'playwright';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR', ignoreHTTPSErrors: true });

/** 한 화면을 열고, 그 화면이 부른 데이터 요청과 화면 안의 링크를 적는다 */
async function look(label, url, opt) {
  const o = opt || {};
  const page = await ctx.newPage();
  const calls = [];
  page.on('request', (r) => {
    const t = r.resourceType();
    if (t === 'xhr' || t === 'fetch' || (t === 'document' && r.url() !== url)) {
      calls.push({ m: r.method(), u: r.url(), t: t, d: (r.postData() || '').slice(0, 200) });
    }
  });
  console.log('\n' + '─'.repeat(70));
  console.log('■ ' + label + '\n   ' + url);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(o.wait || 5000);
  } catch (e) {
    console.log('   열기 실패 — ' + e.message.split('\n')[0]);
  }
  /* 프레임 구성 */
  const frames = page.frames().map((f) => f.url()).filter((u) => u && u !== 'about:blank');
  if (frames.length > 1) {
    console.log('   프레임 ' + frames.length + '개');
    frames.forEach((f) => console.log('     ' + f));
  }
  /* 채권과 관련된 링크·메뉴 */
  try {
    const links = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('a').forEach((a) => {
        const t = (a.textContent || '').replace(/\s+/g, ' ').trim();
        const h = a.getAttribute('href') || '';
        const oc = a.getAttribute('onclick') || '';
        if (/채권|債|bond/i.test(t + h + oc)) out.push({ t: t.slice(0, 40), h: h.slice(0, 130), oc: oc.slice(0, 130) });
      });
      return out.slice(0, 25);
    });
    if (links.length) {
      console.log('   채권 관련 링크 ' + links.length + '개');
      links.forEach((l) => console.log('     [' + l.t + '] ' + (l.h || l.oc)));
    }
  } catch (e) { /* 프레임 접근이 막히면 넘어간다 */ }
  /* 화면이 스스로 부른 데이터 요청 — 이것이 핵심이다 */
  if (calls.length) {
    console.log('   데이터 요청 ' + calls.length + '개');
    calls.slice(0, 20).forEach((c) => {
      console.log('     ' + c.m + ' [' + c.t + '] ' + c.u.slice(0, 150) + (c.d ? '\n        본문: ' + c.d : ''));
    });
  } else {
    console.log('   데이터 요청 없음');
  }
  await page.close();
  return { frames, calls };
}

console.log('='.repeat(70));
console.log('① 미래에셋증권 — 판매 중인 장외채권 목록');
console.log('='.repeat(70));
/* frameset 이므로 프레임 주소부터 확인한다 */
await look('회사 사이트 첫 화면', 'https://securities.miraeasset.com/');
/* 검색으로 채권 화면을 찾는다 — 주소 규칙을 모르므로 사이트 검색을 쓴다 */
await look('사이트 검색 「장외채권」', 'https://securities.miraeasset.com/search/search.do?query=' + encodeURIComponent('장외채권'), { wait: 6000 });

console.log('\n' + '='.repeat(70));
console.log('② 금융투자협회 채권정보센터 — 민평금리(시가평가기준수익률)');
console.log('='.repeat(70));
await look('채권정보센터 첫 화면', 'https://www.kofiabond.or.kr/', { wait: 6000 });

console.log('\n' + '='.repeat(70));
console.log('③ KRX 정보데이터시스템 — 채권 전종목 시세 화면');
console.log('='.repeat(70));
/* 화면을 열면 화면이 스스로 bld 값을 붙여 요청한다 — 그 값을 알아내려는 것이다 */
await look('KRX 채권 통계 메뉴', 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201', { wait: 7000 });

await browser.close();
console.log('\n탐색 끝. 데이터 요청 주소와 본문을 보고 수집기를 만든다.');
