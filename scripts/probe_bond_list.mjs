#!/usr/bin/env node
/**
 * 채권 원천 탐색 ④ — 찾아낸 화면을 열어 목록·설명서 주소를 잡는다
 *
 *   node scripts/probe_bond_list.mjs
 *
 * 3차 탐색에서 메뉴가 실제 주소를 알려 주었다 (로그인 필요 여부는 메뉴의 두 번째 인자).
 *   장외채권(원화)  /hks/hks4036/r01.do   로그인 불필요
 *   외화채권        /hks/hks4054/v03.do   로그인 불필요
 *   채권금리        /hkr/hkr1003/n12.do   로그인 불필요
 *   장외채권 매매    /hks/hks4051/v03.do   로그인 필요 (쓰지 않는다)
 *
 * 이 화면들을 열어 세 가지를 잡는다
 *   ① 목록을 가져오는 wjson 주소와 본문 (그대로 부르면 종목 목록이 나온다)
 *   ② 응답에 담긴 항목 이름 (종목명·발행일·만기일·표면금리·신용등급이 있는지)
 *   ③ 설명서 PDF 링크 (장외채권 설명서·핵심요약설명서·장외거래 추가설명자료)
 */
import { chromium } from 'playwright';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR', ignoreHTTPSErrors: true });

async function look(label, path) {
  const page = await ctx.newPage();
  const seen = [];
  /* 요청과 함께 응답 본문까지 본다 — 담긴 항목 이름을 알아야 수집기를 만들 수 있다 */
  page.on('response', async (res) => {
    const u = res.url();
    if (u.indexOf(BASE) < 0) return;
    if (!/\.wjson|\.json|\.jsp/i.test(u)) return;
    if (/site_variable|include\/tag|banner|a02\.json/i.test(u)) return;
    let body = '';
    try { body = (await res.text()).slice(0, 900); } catch (e) { body = '(본문 못 읽음)'; }
    seen.push({ m: res.request().method(), u: u, d: (res.request().postData() || '').slice(0, 200), s: res.status(), b: body });
  });
  console.log('\n' + '='.repeat(70));
  console.log('■ ' + label + '\n   ' + BASE + path);
  try {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(9000);
  } catch (e) {
    console.log('   열기 실패 — ' + e.message.split('\n')[0]);
  }
  /* 화면에 무엇이 그려졌는지 — 표가 있으면 머리글을 본다 */
  try {
    const info = await page.evaluate(() => {
      const heads = [];
      document.querySelectorAll('table').forEach((t) => {
        const th = [...t.querySelectorAll('th')].map((x) => (x.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
        if (th.length >= 3) heads.push(th.slice(0, 20).join(' | '));
      });
      /* 표의 첫 데이터 행도 한 줄 본다 */
      const rows = [];
      document.querySelectorAll('table tbody tr').forEach((tr) => {
        if (rows.length >= 3) return;
        const td = [...tr.querySelectorAll('td')].map((x) => (x.textContent || '').replace(/\s+/g, ' ').trim());
        if (td.filter(Boolean).length >= 3) rows.push(td.slice(0, 20).join(' | '));
      });
      /* 문서 링크 */
      const docs = [];
      document.querySelectorAll('a,[onclick]').forEach((a) => {
        const h = (a.getAttribute('href') || '') + ' ' + (a.getAttribute('onclick') || '');
        const t = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (/\.pdf|설명서|추가설명|핵심요약|투자설명/i.test(h + t)) {
          docs.push('[' + t.slice(0, 30) + '] ' + h.trim().slice(0, 150));
        }
      });
      const seenD = {}, uniqD = [];
      docs.forEach((d) => { if (!seenD[d]) { seenD[d] = 1; uniqD.push(d); } });
      return { heads: heads.slice(0, 4), rows: rows, docs: uniqD.slice(0, 12), chars: document.body.innerText.length };
    });
    console.log('   화면 글자 ' + info.chars + '자');
    info.heads.forEach((h, i) => console.log('   표' + (i + 1) + ' 머리글: ' + h.slice(0, 220)));
    info.rows.forEach((r, i) => console.log('   표 행' + (i + 1) + ': ' + r.slice(0, 220)));
    if (info.docs.length) {
      console.log('   설명서·문서 링크 ' + info.docs.length + '개');
      info.docs.forEach((d) => console.log('     ' + d));
    } else {
      console.log('   설명서 링크 없음');
    }
  } catch (e) {
    console.log('   화면 읽기 실패 — ' + e.message.split('\n')[0]);
  }
  if (seen.length) {
    console.log('   데이터 요청 ' + seen.length + '개');
    seen.slice(0, 8).forEach((x) => {
      console.log('\n     ' + x.m + ' ' + x.u.replace(BASE, '') + '  → ' + x.s);
      if (x.d) console.log('       본문: ' + x.d);
      console.log('       응답: ' + x.b.replace(/\s+/g, ' ').slice(0, 700));
    });
  } else {
    console.log('   데이터 요청 없음');
  }
  await page.close();
}

await look('장외채권 (원화)', '/hks/hks4036/r01.do');
await look('외화채권', '/hks/hks4054/v03.do');
await look('채권금리', '/hkr/hkr1003/n12.do');

await browser.close();
console.log('\n탐색 끝.');
