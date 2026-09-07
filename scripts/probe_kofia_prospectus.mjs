#!/usr/bin/env node
/**
 * 금융투자협회 전자공시에서 투자설명서를 받을 길을 찾는다 (조사용)
 *
 *   node scripts/probe_kofia_prospectus.mjs [--codes 표준코드,표준코드]
 *
 * ── 왜 필요한가 ──────────────────────────────────────────────────────────
 * 지금 쓰는 원천(공모펀드 카탈로그)에는 3,194종목 중 175종목의 투자설명서 주소가
 * 없다. 목표전환형 64 · 사모투자재간접 21 · 지수연계 9 종목이 그렇고, 창구에서
 * 그 종목을 고르면 설명서에서만 나오는 항목이 열 몇 건씩 「확인필요」로 남는다.
 *
 * 금융투자협회 전자공시는 공모펀드의 투자설명서를 공시한다 — 판매회사 원천이
 * 아니라 법정 공시이므로 신규 설정 펀드도 있다. 두 번째 원천으로 붙일 값이 있다.
 *
 * ── 짐작하지 않는다 ──────────────────────────────────────────────────────
 * 주소를 외워 쓰지 않는다. 브라우저로 실제 화면을 열어
 *   ㆍ화면이 보내는 POST 본문
 *   ㆍ화면에 있는 다른 화면 경로(w2xPath)
 *   ㆍPDF·문서 내려받기로 보이는 요청
 * 를 그대로 찍는다. 그 출력을 보고 수집기를 쓴다.
 * (앞선 투자지역 수집기도 이 방식으로 계약을 얻었다 — 그 브랜치의
 *  scripts/collect_fund_region.mjs 가 같은 POST 엔드포인트를 쓴다.)
 *
 * 저장소에 아무것도 쓰지 않는다.
 */

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const ORIGIN = 'https://dis.kofia.or.kr';

/* 설명서 주소가 없는 종목으로 본다 — 있는 종목으로 시험하면 정작 필요한 쪽을 못 본다 */
let codes = String(argOf('--codes', '')).split(/[,\s]+/).filter(Boolean);
if (!codes.length) {
  const cg = {};
  new Function('window', await readFile('data/fund-catalog.js', 'utf8'))(cg);
  const C = cg.FUND_CATALOG;
  const noDoc = C.items.filter((x) => !x.docT && !x.docG);
  codes = noDoc.slice(0, 2).map((x) => x.code);
  console.log(`설명서 주소 없는 ${noDoc.length}종목 중 앞 ${codes.length}건으로 봅니다`);
  noDoc.slice(0, 2).forEach((x) => console.log(`  ${x.code} ${x.name}`));
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR', acceptDownloads: true });
const page = await ctx.newPage();

const posts = [];
const docReqs = [];
page.on('request', (r) => {
  const u = r.url();
  if (r.method() === 'POST' && u.includes('/proframeWeb/XMLSERVICES/')) {
    posts.push(r.postData() || '');
  }
  if (/\.pdf(\?|$)|download|fileDown|attach|Doc.*(?:Down|View)/i.test(u)) {
    docReqs.push(r.method() + ' ' + u.slice(0, 220));
  }
});
page.on('download', (d) => docReqs.push('DOWNLOAD ' + d.suggestedFilename()));

const code = codes[0];

/* ── 1) 펀드 요약정보 팝업 — 투자지역 수집기가 쓰는 그 화면 ── */
console.log('\n' + '='.repeat(70));
console.log('1) 펀드 요약정보 팝업 (standardCd=' + code + ')');
await page.goto(
  ORIGIN + '/websquare/index.jsp?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml' +
  '&companyCd=&standardCd=' + encodeURIComponent(code) + '&standardDt=&grntGb=',
  { waitUntil: 'domcontentloaded', timeout: 60000 }
).catch((e) => console.log('   열기 실패: ' + e.message));
await page.waitForTimeout(7000);

console.log('   제목: ' + (await page.title().catch(() => '?')));
console.log('   POST ' + posts.length + '건 · 문서로 보이는 요청 ' + docReqs.length + '건');
posts.forEach((b, i) => {
  /* 어떤 서비스를 부르는지만 먼저 — 본문 전체는 길다 */
  const svc = (b.match(/<(?:svcNm|serviceName|reqName)>([^<]+)</) || [])[1]
    || (b.match(/([A-Za-z]+SO|[A-Za-z]+Srch[A-Za-z]*)/) || [])[1] || '(모름)';
  console.log('     POST' + (i + 1) + ' 서비스 ' + svc + ' · ' + b.length + '자');
});

/* 화면 안에 적힌 다른 화면 경로 — 설명서 화면이 어디인지 여기서 나온다 */
const paths = await page.evaluate(() => {
  const s = document.documentElement.outerHTML;
  const out = {};
  (s.match(/\/wq\/[A-Za-z0-9_\/]+\.xml/g) || []).forEach((p) => { out[p] = 1; });
  return Object.keys(out);
}).catch(() => []);
console.log('   화면에 적힌 w2xPath ' + paths.length + '개');
paths.slice(0, 40).forEach((p) => console.log('     ' + p));

/* 「설명서」 라는 낱말이 화면에 있나 */
const words = await page.evaluate(() => {
  const t = document.body ? document.body.innerText : '';
  const hit = [];
  ['투자설명서', '간이투자설명서', '설명서', '집합투자규약', '수시공시', '정기공시', '자산운용보고서']
    .forEach((w) => { if (t.indexOf(w) >= 0) hit.push(w); });
  return { hit, len: t.length, head: t.replace(/\s+/g, ' ').slice(0, 400) };
}).catch(() => ({ hit: [], len: 0, head: '' }));
console.log('   본문 ' + words.len + '자 · 낱말: ' + (words.hit.join(', ') || '(없음)'));
console.log('   본문 앞머리: ' + words.head);

/* ── 2) 「투자설명서」 링크를 눌러 무엇이 오는지 본다 ──
   앞 판에서 이 화면 본문에 「약관 투자설명서 간이투자설명서」 가 적혀 있는 것을
   확인했다. 그것을 누르지 않고서는 문서가 어디서 오는지 알 수 없다. */
for (const want of ['투자설명서', '간이투자설명서']) {
  console.log('\n' + '='.repeat(70));
  console.log('2) 「' + want + '」 누르기');

  /* 누를 것을 먼저 찾아 그 자리의 HTML 을 그대로 본다 — 무엇을 부르는지가 여기 있다 */
  const info = await page.evaluate((w) => {
    const els = [...document.querySelectorAll('a,button,span,div,td,li')];
      /* 낱말이 정확히 그것인 가장 작은 요소를 고른다 (「투자설명서」 를 찾을 때
         「간이투자설명서」 를 집지 않도록 텍스트가 정확히 같은 것만) */
    const hit = els.filter((e) => (e.textContent || '').replace(/\s+/g, '') === w)
      .sort((a, b) => (a.outerHTML || '').length - (b.outerHTML || '').length)[0];
    if (!hit) return null;
    return {
      tag: hit.tagName, id: hit.id || '', cls: hit.className || '',
      onclick: hit.getAttribute('onclick') || '',
      href: hit.getAttribute('href') || '',
      outer: (hit.outerHTML || '').slice(0, 400),
      parent: (hit.parentElement ? hit.parentElement.outerHTML : '').slice(0, 400)
    };
  }, want).catch(() => null);

  if (!info) { console.log('   그 낱말인 요소를 못 찾았습니다'); continue; }
  console.log('   <' + info.tag + '> id=' + (info.id || '-') + ' class=' + (info.cls || '-'));
  if (info.onclick) console.log('   onclick: ' + info.onclick.replace(/\s+/g, ' ').slice(0, 300));
  if (info.href) console.log('   href: ' + info.href.slice(0, 300));
  console.log('   HTML: ' + info.outer.replace(/\s+/g, ' '));
  console.log('   부모: ' + info.parent.replace(/\s+/g, ' '));

  const before = docReqs.length;
  const posts0 = posts.length;
  /* 새 창으로 열 수도 있다 — 창이 뜨면 그 주소와 본문을 본다 */
  const popupP = page.waitForEvent('popup', { timeout: 12000 }).catch(() => null);
  await page.evaluate((w) => {
    const els = [...document.querySelectorAll('a,button,span,div,td,li')];
    const hit = els.filter((e) => (e.textContent || '').replace(/\s+/g, '') === w)
      .sort((a, b) => (a.outerHTML || '').length - (b.outerHTML || '').length)[0];
    if (hit) hit.click();
  }, want).catch((e) => console.log('   누르기 실패: ' + e.message));
  const popup = await popupP;
  await page.waitForTimeout(7000);

  if (popup) {
    console.log('   새 창: ' + popup.url().slice(0, 300));
    await popup.waitForTimeout(4000);
    const pInfo = await popup.evaluate(() => {
      const s = document.documentElement.outerHTML;
      const paths = {};
      (s.match(/\/wq\/[A-Za-z0-9_\/]+\.xml/g) || []).forEach((p) => { paths[p] = 1; });
      const links = [];
      for (const a of document.querySelectorAll('a,button')) {
        const t = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 40) continue;
        links.push(t + ' → ' + (a.getAttribute('onclick') || a.getAttribute('href') || '').replace(/\s+/g, ' ').slice(0, 140));
      }
      return {
        title: document.title,
        w2x: Object.keys(paths),
        body: (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 900),
        links: links.slice(0, 25)
      };
    }).catch(() => null);
    if (pInfo) {
      console.log('   새 창 제목: ' + pInfo.title);
      console.log('   새 창 w2xPath: ' + pInfo.w2x.join(' · '));
      console.log('   새 창 본문: ' + pInfo.body);
      if (pInfo.links.length) {
        console.log('   새 창 링크:');
        pInfo.links.forEach((l) => console.log('      ' + l));
      }
    }
    await popup.close().catch(() => {});
  } else {
    console.log('   새 창은 뜨지 않았습니다 (같은 창에서 바뀌었거나 내려받기)');
    console.log('   지금 주소: ' + page.url().slice(0, 250));
  }
  console.log('   이 누름으로 늘어난 문서 요청 ' + (docReqs.length - before) + '건 · POST ' + (posts.length - posts0) + '건');
  docReqs.slice(before).forEach((u) => console.log('      ' + u));
  posts.slice(posts0).forEach((b, i) => console.log('      POST' + (i + 1) + ': ' + b.replace(/\s+/g, ' ').slice(0, 500)));

  /* 다음 낱말을 누르려면 원래 화면으로 돌아와야 한다 */
  if (!page.url().includes('DISComFundSmryInfo')) {
    await page.goto(
      ORIGIN + '/websquare/index.jsp?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml' +
      '&companyCd=&standardCd=' + encodeURIComponent(code) + '&standardDt=&grntGb=',
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    ).catch(() => {});
    await page.waitForTimeout(6000);
  }
}

console.log('\n문서로 보이는 요청 (전 구간)');
[...new Set(docReqs)].slice(0, 40).forEach((u) => console.log('   ' + u));
console.log('\n요약정보 POST 본문 하나를 그대로 (수집기가 갈아 끼울 틀)');
const tmpl = posts.find((b) => b.includes('COMFundUnityBasInfoSO')) || posts[0] || '';
console.log(tmpl.replace(/\s+/g, ' ').slice(0, 700));

await browser.close();
console.log('\n탐색 끝.');
