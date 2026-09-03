#!/usr/bin/env node
/**
 * 채권 원천 탐색 ⑥ — 표를 정확히 읽고, 채권 설명서가 어디 있는지 찾는다
 *
 *   node scripts/probe_bond_html.mjs
 *
 * 5차에서 알아낸 것
 *   ★ 행 속성에 종목 표준코드가 있다 —
 *     insertWishItem('02','KR103502GA34','국고채권 01500-5003(20-2)','20200310','20500310')
 *     ISIN · 종목명 · 발행일 · 만기일 이 한 줄에 다 들어 있다. 다른 원천(협회 민평금리)과
 *     이 코드로 이어붙일 수 있다.
 *   ㆍ한 종목이 <tr> 두 줄에 걸쳐 있다 (앞줄 7칸 + 뒷줄 4칸)
 *   ㆍ내 인코딩 처리에 버그가 있었다 — 앞 2,000자만 보고 깨짐을 판단했는데
 *     그 앞은 온통 ASCII(doctype·script)라 판단이 안 서고 그대로 utf8 로 읽었다.
 *     meta charset 을 보고 정하도록 고쳤다.
 *   ㆍcategoryId=41 게시판은 채권이 아니라 주식 공모(IPO) 청약 조견표였다.
 *     채권 설명서는 여기 없다 — 그래서 이번에 링크를 전부 훑어 찾는다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';

/** 응답을 문자로 바꾼다 — meta charset 을 보고 정한다 (앞부분만 보면 판단이 안 선다) */
async function get(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', 'Referer': BASE + '/main.do' },
    signal: AbortSignal.timeout(30000)
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const head = buf.slice(0, 4000).toString('latin1');
  const ct = r.headers.get('content-type') || '';
  const m = /charset\s*=\s*["']?\s*([\w-]+)/i.exec(ct) || /charset\s*=\s*["']?\s*([\w-]+)/i.exec(head);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  let text;
  try {
    text = new TextDecoder(/euc-kr|ks_c_5601|ksc5601|cp949/.test(cs) ? 'euc-kr' : cs).decode(buf);
  } catch (e) {
    text = buf.toString('utf8');
  }
  return { status: r.status, text, len: buf.length, cs };
}
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* ── ① 장외채권(원화) 표 ─────────────────────────────── */
console.log('='.repeat(70));
console.log('① 장외채권(원화) /hks/hks4036/r01.do');
console.log('='.repeat(70));
const won = await get(BASE + '/hks/hks4036/r01.do');
console.log('HTTP ' + won.status + ' · ' + won.len + '바이트 · 인코딩 ' + won.cs);

const tables = [...won.text.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
/* 종목이 담긴 표를 고른다 — 표준코드가 들어 있는 표다 */
const main = tables.find((t) => /insertWishItem|KR\d{9}[A-Z0-9]{2}/.test(t)) || tables[0];
if (main) {
  const th = [...main.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => strip(m[1])).filter(Boolean);
  console.log('\n머리글 ' + th.length + '개');
  th.forEach((h, i) => console.log('   ' + (i + 1) + '. ' + h));
  const trs = [...main.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]).filter((r) => /<td/i.test(r));
  console.log('\n데이터행 ' + trs.length + '개 — 앞 6줄을 칸 단위로 본다');
  trs.slice(0, 6).forEach((r, k) => {
    const td = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
    console.log('   행' + (k + 1) + ' (' + td.length + '칸)');
    td.forEach((c, i) => { if (c) console.log('      [' + i + '] ' + c.slice(0, 70)); });
    const w = /insertWishItem\(([^)]*)\)/.exec(r);
    if (w) console.log('      ★ 코드: ' + w[1]);
  });
  /* 표준코드가 몇 개 나오는지 = 판매 종목 수 */
  const codes = [...main.matchAll(/insertWishItem\('(\d+)','([A-Z]{2}[\dA-Z]{10})','([^']*)','(\d{8})','(\d{8})'/g)];
  console.log('\n종목 ' + codes.length + '개 (표준코드로 셈)');
  codes.slice(0, 12).forEach((c) => console.log('   ' + c[2] + ' · ' + c[3] + ' · 발행 ' + c[4] + ' · 만기 ' + c[5]));
}

/* ── ② 이 화면의 모든 링크에서 설명서를 찾는다 ────────── */
console.log('\n' + '='.repeat(70));
console.log('② 채권 설명서·약관이 어디 있는지 (링크 전수 확인)');
console.log('='.repeat(70));
const links = [...won.text.matchAll(/(?:href|onclick)\s*=\s*"([^"]{4,200})"/gi)].map((m) => m[1]);
const uniq = [...new Set(links)];
console.log('링크 ' + uniq.length + '개');
const doc = uniq.filter((u) => /설명서|약관|안내|guide|pdf|file|down|중요|위험|유의/i.test(u));
console.log('설명서로 보이는 것 ' + doc.length + '개');
doc.slice(0, 25).forEach((u) => console.log('   ' + u.slice(0, 160)));
/* 링크 글자(텍스트)로도 찾는다 — 주소에 낱말이 없을 수 있다 */
const anchors = [...won.text.matchAll(/<a[^>]*(?:href|onclick)="([^"]*)"[^>]*>([\s\S]{0,120}?)<\/a>/gi)]
  .map((m) => ({ u: m[1], t: strip(m[2]) }))
  .filter((x) => /설명서|약관|위험|유의|중요|공시/.test(x.t));
if (anchors.length) {
  console.log('\n글자로 찾은 것 ' + anchors.length + '개');
  [...new Map(anchors.map((a) => [a.t + a.u, a])).values()].slice(0, 20)
    .forEach((a) => console.log('   [' + a.t.slice(0, 40) + '] ' + a.u.slice(0, 150)));
}

/* ── ③ 외화채권 유형 표 ─────────────────────────────── */
console.log('\n' + '='.repeat(70));
console.log('③ 외화채권 /hks/hks4054/v03.do — 유형·과세·신용등급');
console.log('='.repeat(70));
const fx = await get(BASE + '/hks/hks4054/v03.do');
console.log('HTTP ' + fx.status + ' · ' + fx.len + '바이트 · 인코딩 ' + fx.cs);
[...fx.text.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]).slice(0, 4).forEach((tb, i) => {
  const th = [...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => strip(m[1])).filter(Boolean);
  const trs = [...tb.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]).filter((r) => /<td/i.test(r));
  if (!th.length && !trs.length) return;
  console.log('\n── 표' + (i + 1) + (th.length ? '\n   머리글: ' + th.join(' │ ') : ''));
  trs.slice(0, 8).forEach((r) => {
    const td = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
    if (td.filter(Boolean).length) console.log('   ' + td.join(' │ ').slice(0, 260));
  });
});

console.log('\n탐색 끝.');
