#!/usr/bin/env node
/**
 * 채권 종목 상세 v01.do — 표 구조 확정
 *
 *   node scripts/probe_bond_detail.mjs
 *
 * ★ 앞 판에서 확인했다 —
 *     /hks/hks4036/v01.do?itemCode=KR60054939A8
 *       발행일 2019.10.16 · 표면금리 1.7710 · 만기일 2029.10.16
 *   서버가 값을 채워 내려준다. p02.do 는 자바스크립트로 채우는 껍데기라 못 쓴다
 *   (모든 값이 null 로 온다).
 *
 * 앞 판의 내 짝짓기 규칙(머리글 바로 뒤 td)은 세 항목만 잡았다. 이자지급유형·
 * 이자지급주기·신용등급이 어디 있는지 확정해야 한다 — 한 종목의 v01 을
 * 칸 순서대로 모두 찍는다. 짧게 나온다.
 *
 * 저장소에 아무것도 쓰지 않는다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';
const CODE = 'KR60054939A8';   /* POSCO 310-3 — 표면금리 1.7710 로 답을 아는 종목 */

const r = await fetch(BASE + '/hks/hks4036/v01.do?itemCode=' + CODE, {
  headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', Referer: BASE + '/hks/hks4036/r01.do' },
  signal: AbortSignal.timeout(30000)
});
const buf = Buffer.from(await r.arrayBuffer());
const html = new TextDecoder('euc-kr').decode(buf);
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();

console.log('HTTP ' + r.status + ' · ' + buf.length + '바이트 · ' + CODE);

/* 화면 본문에서 상품 정보 구간만 — 머리·꼬리 메뉴를 걷어낸다 */
const body = strip(html);
const s = body.search(/채권\s*(?:기본)?정보|상품정보|종목\s*정보/);
console.log('\n[본문 구간] ' + (s >= 0 ? body.slice(s, s + 900) : body.slice(0, 900)));

/* 표를 칸 순서대로 — 상품 정보 표만 (칸 60개 이하) */
const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
console.log('\n표 ' + tables.length + '개');
tables.forEach((tb, i) => {
  const cells = [...tb.matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((m) => ({ h: m[1].toLowerCase() === 'th', v: strip(m[2]) }));
  if (!cells.length || cells.length > 60) return;
  const txt = cells.map((c) => c.v).join(' ');
  if (!/표면|이자|만기|신용|수익률|단가|종목/.test(txt)) return;
  console.log('\n── 표' + (i + 1) + ' (' + cells.length + '칸)');
  cells.forEach((c, k) => console.log('   ' + String(k).padStart(2) + (c.h ? ' [머리] ' : '        ') + c.v.slice(0, 80)));
});

/* 표가 아니라 dl/dt/dd 나 li 로 그려질 수도 있다 */
const dls = [...html.matchAll(/<(dt|dd|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
  .map((m) => ({ t: m[1], v: strip(m[2]) }))
  .filter((x) => x.v && /표면|이자지급|신용등급|잔존|수익률|보증|수수료/.test(x.v) && x.v.length < 120);
if (dls.length) {
  console.log('\ndl·li 로 그려진 항목 ' + dls.length + '개');
  dls.slice(0, 30).forEach((x) => console.log('   <' + x.t + '> ' + x.v));
}

console.log('\n탐색 끝.');
