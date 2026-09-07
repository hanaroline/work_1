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
/**
 * 본문을 통째로 찍는다.
 *
 * 앞 판에서 서비스 이름과 길이만 찍었더니, 내가 조립한 본문(standardCd + uGb=Y)이
 * 약관 한 건만 돌려주는 까닭을 알 수 없었다 (dbio_total_count_ = 1). 화면은 약관·
 * 투자설명서·간이투자설명서 셋을 다 보여주므로, 길이가 다른 POST(420·431·429자)에
 * 문서 종류를 가리는 인자가 더 있다. 그것을 봐야 한다.
 */
posts.forEach((b, i) => {
  console.log('     POST' + (i + 1) + ' (' + b.length + '자) ' + b.replace(/\s+/g, ' ').trim());
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

/* ── 3) 파일 목록 응답을 그대로 — 수집기가 무엇을 뜯어야 하는지 태그로 봐야 한다 ──
   내려받기 주소는 serverPath·serverFileNm·filename 셋으로 만들어진다.
   그 셋이 응답에서 어떤 태그로 오는지 짐작하지 않고 원문을 찍는다. */
console.log('\n' + '='.repeat(70));
console.log('3) srchFile 응답 원문 (표준코드 ' + code + ')');
const body =
  '<?xml version="1.0" encoding="utf-8"?>' +
  '<message><proframeHeader><pfmAppName>FS-COM</pfmAppName>' +
  '<pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName><pfmFnName>srchFile</pfmFnName>' +
  '</proframeHeader><systemHeader></systemHeader>' +
  '<COMFundInfoFileListDTO><standardCd>' + code + '</standardCd><uGb>Y</uGb>' +
  '</COMFundInfoFileListDTO></message>';
try {
  const r = await fetch(ORIGIN + '/proframeWeb/XMLSERVICES/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      Accept: 'application/xml, text/xml, */*',
      'User-Agent': UA,
      Origin: ORIGIN,
      Referer: ORIGIN + '/websquare/index.jsp'
    },
    body,
    signal: AbortSignal.timeout(20000)
  });
  const xml = await r.text();
  console.log('   HTTP ' + r.status + ' · ' + xml.length + '자');
  console.log('   ── 원문 ──');
  console.log(xml.replace(/></g, '>\n<').split('\n').slice(0, 90).map((l) => '   ' + l).join('\n'));
} catch (e) {
  console.log('   실패: ' + String(e && e.message || e));
}

/* ── 4) 내려받기를 어떻게 해야 되는지 ──
   목록은 node fetch 로 잘 되는데 내려받기는 「fetch failed」 로 막혔다 (HTTP 상태도
   없이 연결 단계에서). 브라우저에서는 요청이 나갔다. 무엇이 다른지 갈라 본다 —
   이름 풀이 · 맨몸 요청 · 머리글을 갖춘 요청 · 브라우저 문맥의 요청. */
console.log('\n' + '='.repeat(70));
console.log('4) 내려받기 경로 가리기');

function parseList(xml) {
  const out = [];
  const re = /<list>([\s\S]*?)<\/list>/g;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[1];
    const g = (t) => {
      const r = b.match(new RegExp('<' + t + '>([\\s\\S]*?)</' + t + '>'));
      return r ? r[1].trim() : '';
    };
    out.push({ fileNm: g('fileNm'), serverPath: g('serverPath'), originalFileNm: g('originalFileNm') });
  }
  return out;
}

const listXmlBody =
  '<?xml version="1.0" encoding="utf-8"?><message><proframeHeader>' +
  '<pfmAppName>FS-COM</pfmAppName><pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName>' +
  '<pfmFnName>srchFile</pfmFnName></proframeHeader><systemHeader></systemHeader>' +
  '<COMFundInfoFileListDTO><standardCd>' + code + '</standardCd><uGb>T</uGb>' +
  '</COMFundInfoFileListDTO></message>';
const listRes = await fetch(ORIGIN + '/proframeWeb/XMLSERVICES/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/xml; charset=UTF-8', 'User-Agent': UA,
    Origin: ORIGIN, Referer: ORIGIN + '/websquare/index.jsp'
  },
  body: listXmlBody,
  signal: AbortSignal.timeout(20000)
}).catch(() => null);
const rows = parseList(listRes ? await listRes.text() : '');

if (!rows.length) {
  console.log('   목록을 못 받아 내려받기 시험을 건너뜁니다');
} else {
  const row = rows[0];
  const url = 'https://disdown.kofia.or.kr/COMFSFileDownload.jsp' +
    '?serverPath=' + encodeURIComponent(row.serverPath) +
    '&serverFileNm=' + encodeURIComponent(row.fileNm) +
    '&filename=' + encodeURIComponent(row.originalFileNm);
  console.log('   대상: ' + row.originalFileNm.slice(0, 60));

  /* (가) 이름 풀이 — 러너가 이 이름을 못 찾는 것인지 */
  try {
    const dns = await import('node:dns/promises');
    const a = await dns.lookup('disdown.kofia.or.kr', { all: true });
    console.log('   (가) 이름 풀이 OK — ' + a.map((x) => x.address).join(', '));
  } catch (e) {
    console.log('   (가) 이름 풀이 실패 — ' + String(e && e.message || e));
  }

  /* 오류의 속살까지 — node fetch 는 진짜 이유를 cause 에 넣는다 */
  const why = (e) => {
    const c = e && e.cause;
    return String(e && e.message || e) +
      (c ? ' | cause: ' + (c.code || '') + ' ' + String(c.message || c).slice(0, 160) : '');
  };

  /* (나) 맨몸 요청 */
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    console.log('   (나) 맨몸 요청 — HTTP ' + r.status + ' · ' + (r.headers.get('content-type') || '?'));
  } catch (e) { console.log('   (나) 맨몸 요청 실패 — ' + why(e)); }

  /* (다) 머리글을 갖춘 요청 */
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, Referer: ORIGIN + '/websquare/index.jsp', Accept: '*/*' },
      signal: AbortSignal.timeout(30000)
    });
    const buf = Buffer.from(await r.arrayBuffer());
    console.log('   (다) 머리글 요청 — HTTP ' + r.status + ' · ' + buf.length + '바이트 · 머리 ' +
      JSON.stringify(buf.slice(0, 8).toString('latin1')));
  } catch (e) { console.log('   (다) 머리글 요청 실패 — ' + why(e)); }

  /* (라) 브라우저 문맥의 요청 — 쿠키·TLS 를 브라우저가 맡는다 */
  try {
    const rr = await ctx.request.get(url, {
      headers: { Referer: ORIGIN + '/websquare/index.jsp' }, timeout: 40000
    });
    const buf = Buffer.from(await rr.body());
    console.log('   (라) 브라우저 문맥 — HTTP ' + rr.status() + ' · ' + buf.length + '바이트 · 머리 ' +
      JSON.stringify(buf.slice(0, 8).toString('latin1')));
  } catch (e) { console.log('   (라) 브라우저 문맥 실패 — ' + String(e && e.message || e).slice(0, 200)); }

  /* (마) http 로 — TLS 가 문제인지 가린다 (값은 쓰지 않고 가리기만) */
  try {
    const r = await fetch(url.replace('https://', 'http://'), {
      headers: { 'User-Agent': UA }, redirect: 'manual', signal: AbortSignal.timeout(20000)
    });
    console.log('   (마) http — HTTP ' + r.status + ' · location ' + (r.headers.get('location') || '-'));
  } catch (e) { console.log('   (마) http 실패 — ' + why(e)); }
}

await browser.close();
console.log('\n탐색 끝.');
