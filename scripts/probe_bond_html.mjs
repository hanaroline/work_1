#!/usr/bin/env node
/**
 * 채권 원천 탐색 ⑤ — 표 원문과 설명서 게시판을 본다
 *
 *   node scripts/probe_bond_html.mjs
 *
 * 4차 탐색에서 확인한 것
 *   ㆍ장외채권(원화) /hks/hks4036/r01.do 은 서버가 표를 그려 내려준다 (XHR 이 아니다)
 *     → 브라우저 없이 받아도 된다
 *   ㆍ표에 담긴 것: 위험등급 · 상품명 · 잔존기간(년/일) · 발행일 · 매수금리 ·
 *     은행환산수익률(개인) · 세후투자수익률 · 만기일 · 매매단가 · 세전투자수익률(법인)
 *     — 창구에서 손으로 넣던 값들이 여기 있다
 *   ㆍ외화채권 /hks/hks4054/v03.do 는 종목이 아니라 「유형 안내」 다
 *     (통화·종류·국제신용등급·세금·잔존만기) — 개별 종목은 로그인 화면에 있다
 *   ㆍ설명서는 게시판에 있다 — /bbs/board/message/list.do?categoryId=41
 *     (청약투자설명서/조견표)
 *
 * 이제 표의 정확한 구조(칸 순서·행 묶음)와 게시판 목록을 보고 수집기를 만든다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';

async function get(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', 'Referer': BASE + '/main.do' },
    signal: AbortSignal.timeout(30000)
  });
  const buf = Buffer.from(await r.arrayBuffer());
  let t = buf.toString('utf8');
  if (/�/.test(t.slice(0, 2000))) { try { t = new TextDecoder('euc-kr').decode(buf); } catch (e) { /* 그대로 */ } }
  return { status: r.status, text: t, len: buf.length };
}

/* ── ① 장외채권(원화) 표 원문 ─────────────────────────── */
console.log('='.repeat(70));
console.log('① 장외채권(원화) — 표 원문 구조');
console.log('='.repeat(70));
const won = await get(BASE + '/hks/hks4036/r01.do');
console.log('HTTP ' + won.status + ' · ' + won.len + '바이트');

/* 표를 찾아 행을 그대로 보여 준다 — 칸 순서를 눈으로 확인해야 파서를 쓸 수 있다 */
const tables = [...won.text.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
console.log('표 ' + tables.length + '개');
tables.forEach((tb, i) => {
  const th = [...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const trs = [...tb.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  const dataRows = trs.filter((r) => /<td/i.test(r));
  if (!th.length && dataRows.length < 2) return;
  console.log('\n── 표' + (i + 1) + ' · 머리글 ' + th.length + '개 · 데이터행 ' + dataRows.length + '개');
  if (th.length) console.log('   머리글: ' + th.join(' │ '));
  dataRows.slice(0, 4).forEach((r, k) => {
    const td = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim());
    console.log('   행' + (k + 1) + ' (' + td.length + '칸): ' + td.join(' │ ').slice(0, 320));
  });
  /* 행 안에 숨은 값(종목코드 등)이 있는지 — onclick·data 속성을 본다 */
  const attrs = [...dataRows.slice(0, 2).join('').matchAll(/(?:onclick|data-[\w-]+|value)="([^"]{6,110})"/gi)]
    .map((m) => m[1]).slice(0, 6);
  if (attrs.length) { console.log('   행 속성: '); attrs.forEach((a) => console.log('     ' + a)); }
});

/* ── ② 설명서 게시판 ──────────────────────────────────── */
console.log('\n' + '='.repeat(70));
console.log('② 청약투자설명서/조견표 게시판 (categoryId=41)');
console.log('='.repeat(70));
const bbs = await get(BASE + '/bbs/board/message/list.do?categoryId=41');
console.log('HTTP ' + bbs.status + ' · ' + bbs.len + '바이트');
/* 글 목록 — 제목과 링크 */
const posts = [...bbs.text.matchAll(/<a[^>]+href="([^"]*(?:view|message)[^"]*)"[^>]*>([\s\S]{0,160}?)<\/a>/gi)]
  .map((m) => ({ h: m[1], t: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }))
  .filter((x) => x.t.length > 4);
console.log('글 ' + posts.length + '개');
posts.slice(0, 15).forEach((p) => console.log('   [' + p.t.slice(0, 56) + '] ' + p.h.slice(0, 110)));
/* 첨부 파일(PDF) 링크가 목록에 바로 있는지 */
const pdfs = [...bbs.text.matchAll(/href="([^"]*(?:\.pdf|download|fileDown)[^"]*)"/gi)].map((m) => m[1]);
console.log('첨부·내려받기 링크 ' + pdfs.length + '개');
pdfs.slice(0, 10).forEach((p) => console.log('   ' + p.slice(0, 130)));

/* ── ③ 외화채권 유형 안내 ─────────────────────────────── */
console.log('\n' + '='.repeat(70));
console.log('③ 외화채권 — 유형 안내 표 (개별 종목은 로그인 화면)');
console.log('='.repeat(70));
const fx = await get(BASE + '/hks/hks4054/v03.do');
console.log('HTTP ' + fx.status + ' · ' + fx.len + '바이트');
const fxTables = [...fx.text.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
fxTables.slice(0, 4).forEach((tb, i) => {
  const th = [...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const trs = [...tb.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]).filter((r) => /<td/i.test(r));
  if (!th.length && !trs.length) return;
  console.log('\n── 표' + (i + 1) + (th.length ? ' · ' + th.join(' │ ') : ''));
  trs.slice(0, 6).forEach((r) => {
    const td = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim());
    if (td.filter(Boolean).length) console.log('   ' + td.join(' │ ').slice(0, 300));
  });
});

console.log('\n탐색 끝.');
