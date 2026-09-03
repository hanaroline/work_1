#!/usr/bin/env node
/**
 * 채권 설명서 탐색 — 종목값 말고 「설명서 문구」를 찾는다
 *
 *   node scripts/probe_bond_docs.mjs
 *
 * 왜 필요한가
 *   장외채권 목록에서 종목값(발행일·만기일·위험등급·매매단가·세후수익률)은 받았다.
 *   그런데 창구가 읽어야 하는 문구 — 「위험등급의 의미·유의사항」 「채권 신용등급의
 *   정의」 「매매수수료」 「중도매도 가능 여부」 — 는 목록에 없고 설명서에 있다.
 *   이 값들은 종목마다 다르지 않으므로, 설명서를 한 번 읽어 두면 전 종목이 채워진다.
 *
 * 단서
 *   장외채권 화면의 「약관 및 법적 유의사항」 링크가 /hki/hki3031/a00.do 를 가리킨다.
 *   담당자가 준 IRP 설명서 파일 이름이 hki3031n81.pdf 였다 — 같은 화면에서 내려받은
 *   것이다. 그러니 이 화면에 상품별 설명서 PDF 가 걸려 있다.
 *
 * 저장소에 아무것도 쓰지 않는다. 무엇이 어디 있는지만 로그로 본다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';

/** meta charset 을 보고 문자로 바꾼다 (앞부분은 온통 ASCII 라 판단이 안 선다) */
async function get(url, referer) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', Referer: referer || BASE + '/main.do' },
    signal: AbortSignal.timeout(30000)
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get('content-type') || '';
  const head = buf.slice(0, 4000).toString('latin1');
  const m = /charset\s*=\s*["']?\s*([\w-]+)/i.exec(ct) || /charset\s*=\s*["']?\s*([\w-]+)/i.exec(head);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  let text = '';
  if (!/pdf|octet-stream|zip/.test(ct)) {
    try {
      text = new TextDecoder(/euc-kr|ks_c_5601|ksc5601|cp949/.test(cs) ? 'euc-kr' : cs).decode(buf);
    } catch { text = buf.toString('utf8'); }
  }
  return { status: r.status, ct, len: buf.length, cs, text, buf };
}
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* ── ① 약관·설명서 화면의 링크를 전부 본다 ─────────── */
console.log('='.repeat(70));
console.log('① /hki/hki3031/a00.do — 약관 및 법적 유의사항');
console.log('='.repeat(70));
const page = await get(BASE + '/hki/hki3031/a00.do', BASE + '/hks/hks4036/r01.do');
console.log('HTTP ' + page.status + ' · ' + page.len + '바이트 · ' + page.cs + ' · ' + page.ct);

/* 화면에 그려진 낱말 — 어떤 탭·묶음이 있는지 */
const words = strip(page.text).slice(0, 1200);
console.log('\n본문 앞부분\n   ' + words.replace(/(.{100})/g, '$1\n   '));

/* 링크·PDF 후보 */
const anchors = [...page.text.matchAll(/<a[^>]*(?:href|onclick)\s*=\s*"([^"]{2,300})"[^>]*>([\s\S]{0,160}?)<\/a>/gi)]
  .map((m) => ({ u: m[1], t: strip(m[2]) }));
console.log('\n링크 ' + anchors.length + '개');
const bond = anchors.filter((a) => /채권|설명서|핵심|요약|유의|신용등급/.test(a.t + ' ' + a.u));
console.log('채권·설명서로 보이는 것 ' + bond.length + '개');
[...new Map(bond.map((a) => [a.t + a.u, a])).values()].slice(0, 40)
  .forEach((a) => console.log('   [' + a.t.slice(0, 50) + '] ' + a.u.slice(0, 180)));

/* 주소에 .pdf 가 박힌 것 — 파일을 바로 내려받을 수 있다 */
const pdfs = [...new Set([...page.text.matchAll(/["'(]([^"'()\s]{3,200}\.pdf)["')]/gi)].map((m) => m[1]))];
console.log('\n.pdf 주소 ' + pdfs.length + '개');
pdfs.slice(0, 40).forEach((p) => console.log('   ' + p));

/* 화면이 목록을 스크립트로 불러오는 경우 — 요청 주소를 찾는다 */
const posts = [...new Set([...page.text.matchAll(/["'](\/[a-z]{2,4}\/[a-z0-9]{2,10}\/[a-z0-9]{2,10}\.(?:do|json))["']/gi)].map((m) => m[1]))];
console.log('\n같은 화면이 부르는 주소 ' + posts.length + '개');
posts.slice(0, 40).forEach((p) => console.log('   ' + p));

/* ── ② 상품설명서 모음 화면들을 두드려 본다 ────────── */
console.log('\n' + '='.repeat(70));
console.log('② 설명서 모음으로 보이는 화면 두드리기');
console.log('='.repeat(70));
const CAND = [
  '/hki/hki3031/a01.do', '/hki/hki3031/b00.do', '/hki/hki3031/c00.do',
  '/hki/hki3032/a00.do', '/hki/hki3033/a00.do',
  '/hks/hks4036/r02.do', '/hks/hks4037/r01.do'
];
for (const u of CAND) {
  try {
    const r = await get(BASE + u, BASE + '/hki/hki3031/a00.do');
    const body = strip(r.text);
    const hit = /채권/.test(body);
    console.log('\n' + u + ' → HTTP ' + r.status + ' · ' + r.len + '바이트' + (hit ? ' · 「채권」 있음' : ''));
    if (r.status === 200 && r.len > 3000) {
      const p = [...new Set([...r.text.matchAll(/["'(]([^"'()\s]{3,200}\.pdf)["')]/gi)].map((m) => m[1]))];
      if (p.length) { console.log('   .pdf ' + p.length + '개'); p.slice(0, 15).forEach((x) => console.log('      ' + x)); }
      const bt = [...r.text.matchAll(/<a[^>]*>([\s\S]{0,120}?)<\/a>/gi)].map((m) => strip(m[1]))
        .filter((t) => /채권|설명서|핵심|요약/.test(t));
      if (bt.length) console.log('   글자: ' + [...new Set(bt)].slice(0, 15).join(' | ').slice(0, 400));
    }
  } catch (e) {
    console.log('\n' + u + ' → 실패 ' + e.message);
  }
}

/* ── ③ IRP 설명서와 같은 이름 규칙으로 찾아본다 ────── */
console.log('\n' + '='.repeat(70));
console.log('③ hki3031nNN.pdf 이름 규칙 확인 (IRP 는 n81 이었다)');
console.log('='.repeat(70));
const ROOTS = ['/hki/hki3031/', '/pdf/', '/download/', '/common/pdf/'];
let found = 0;
for (const root of ROOTS) {
  const u = BASE + root + 'hki3031n81.pdf';
  try {
    const r = await fetch(u, { method: 'HEAD', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
    console.log('   ' + root + 'hki3031n81.pdf → HTTP ' + r.status + ' · ' + (r.headers.get('content-type') || '') + ' · ' + (r.headers.get('content-length') || '?'));
    if (r.status === 200) { found++; }
  } catch (e) {
    console.log('   ' + root + 'hki3031n81.pdf → 실패 ' + e.message);
  }
}
console.log(found ? '\n이름 규칙이 통한다 — 번호를 훑어 채권 설명서를 찾을 수 있다.' : '\n직접 주소로는 안 된다 — 화면이 내려 주는 링크를 따라가야 한다.');

console.log('\n탐색 끝.');
