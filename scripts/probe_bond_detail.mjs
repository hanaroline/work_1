#!/usr/bin/env node
/**
 * 채권 종목 기본정보 탐색 — 표면금리·이자지급유형·이자지급주기·신용등급
 *
 *   node scripts/probe_bond_detail.mjs
 *
 * 왜 이것부터인가
 *   원화채권 한 종목을 골랐을 때 남는 확인필요 26건 가운데 15건이
 *   표면금리 하나에 걸려 있다 — 금리변동 손익 예시 13건과 예시 투자금액·
 *   회당 이자금액 2건은 앱이 표면금리로 계산해 주는 값이다.
 *   표면금리·이자지급유형·이자지급주기만 채우면 26건이 8건으로 준다.
 *
 * 우리가 가진 열쇠
 *   표준코드(ISIN)가 100종목 모두 있다. 예) 국민주택1종채권 25-11 = KR101501DFB4
 *
 * 두드려 볼 곳
 *   ① 장외채권 목록 화면이 종목 상세를 어떻게 여는지 (화면이 스스로 알려 준다)
 *   ② 미래에셋 채권금리 화면 /hkr/hkr1003/n12.do (3차에서 로그인 불필요로 확인)
 *   ③ 같은 묶음의 다른 화면들 (r0N·v0N·p0N)
 *   ④ KRX 정보데이터시스템 — 화면이 쓰는 bld 값을 메뉴에서 긁어 와서 쓴다
 *      (bld 를 짐작하면 400 이 온다. 1차 탐색에서 이미 겪었다)
 *
 * 저장소에 아무것도 쓰지 않는다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';
const ISIN = 'KR101501DFB4';       /* 국민주택1종채권 25-11 */
const ISIN2 = 'KR103502GA34';      /* 국고채권 01500-5003(20-2) — 표면금리 1.5% 로 답을 아는 종목 */

async function req(url, opt) {
  const o = opt || {};
  const r = await fetch(url, {
    method: o.body ? 'POST' : 'GET',
    headers: Object.assign({
      'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9',
      Referer: o.referer || BASE + '/main.do'
    }, o.body ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : {}, o.headers || {}),
    body: o.body,
    signal: AbortSignal.timeout(30000)
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get('content-type') || '';
  const head = buf.slice(0, 4000).toString('latin1');
  const m = /charset\s*=\s*["']?\s*([\w-]+)/i.exec(ct) || /charset\s*=\s*["']?\s*([\w-]+)/i.exec(head);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  let text;
  try { text = new TextDecoder(/euc-kr|ks_c_5601|ksc5601|cp949/.test(cs) ? 'euc-kr' : cs).decode(buf); }
  catch { text = buf.toString('utf8'); }
  return { status: r.status, ct, len: buf.length, text };
}
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** 표면금리·이자지급 정보가 들어 있는지 — 있으면 앞뒤를 보여 준다 */
const WANT = [
  ['표면금리', /표면\s*(?:금리|이자율)|이표율|쿠폰/],
  ['이자지급유형', /이자지급\s*(?:방법|유형)|이표채|복리채|할인채/],
  ['이자지급주기', /이자지급\s*(?:주기|월|일)|이자\s*지급\s*\d/],
  ['신용등급', /신용등급|평가등급|AAA|AA[+-]?|BBB/]
];
function report(tag, text, deep) {
  const body = /[<{]/.test(text) ? strip(text) : text;
  const hits = WANT.filter(([, re]) => re.test(body)).map(([n]) => n);
  console.log('   ' + (hits.length ? '★ ' + hits.join(' · ') : '문구 없음'));
  if (hits.length && deep) {
    WANT.forEach(([n, re]) => {
      const m = re.exec(body);
      if (m) console.log('      [' + n + '] …' + body.slice(Math.max(0, m.index - 90), m.index + 260) + '…');
    });
  }
}

/* ── ① 목록 화면이 종목 상세를 어떻게 여는지 ──────────── */
console.log('='.repeat(72));
console.log('① 장외채권 목록 화면 — 종목 상세를 여는 방법');
console.log('='.repeat(72));
const list = await req(BASE + '/hks/hks4036/r01.do');
console.log('HTTP ' + list.status + ' · ' + list.len + '바이트');

/* 표준코드가 등장하는 모든 자리를 앞뒤와 함께 본다 — 상세 링크가 있으면 여기 있다 */
const spots = [];
let re = new RegExp(ISIN2, 'g'), m;
while ((m = re.exec(list.text)) && spots.length < 6) {
  spots.push(list.text.slice(Math.max(0, m.index - 320), m.index + 200).replace(/\s+/g, ' '));
}
console.log('\n표준코드가 나오는 자리 ' + spots.length + '곳');
spots.forEach((s, i) => console.log('   ' + (i + 1) + ') …' + s + '…'));

/* 화면이 정의한 함수 이름 — 어느 것이 상세를 여는지 이름으로 짐작이 아니라 확인한다 */
const fns = [...new Set([...list.text.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g)]
  .map((x) => x[1] + '(' + x[2].replace(/\s+/g, '') + ')'))];
console.log('\n화면이 정의한 함수 ' + fns.length + '개');
fns.filter((f) => /detail|info|pop|view|bond|item|isin|std/i.test(f)).forEach((f) => console.log('   ★ ' + f));

/* 화면이 부르는 주소 — .do / .wjson / .json */
const urls = [...new Set([...list.text.matchAll(/["'](\/[\w./-]{6,90}\.(?:do|wjson|json))["']/g)].map((x) => x[1]))];
console.log('\n화면이 부르는 주소 ' + urls.length + '개 — 채권 묶음만');
urls.filter((u) => /hks40|hkr10|bond/i.test(u)).forEach((u) => console.log('   ' + u));

/* ── ② 채권금리 화면 ─────────────────────────────────── */
console.log('\n' + '='.repeat(72));
console.log('② 채권금리 /hkr/hkr1003/n12.do');
console.log('='.repeat(72));
try {
  const r = await req(BASE + '/hkr/hkr1003/n12.do');
  console.log('HTTP ' + r.status + ' · ' + r.len + '바이트');
  report('금리', r.text, true);
} catch (e) { console.log('   실패 ' + e.message); }

/* ── ③ 같은 묶음의 다른 화면 ─────────────────────────── */
console.log('\n' + '='.repeat(72));
console.log('③ 같은 묶음의 다른 화면 (종목 상세 후보)');
console.log('='.repeat(72));
const CAND = [];
['hks4036', 'hks4037', 'hks4051', 'hks4052', 'hks4053', 'hks4054'].forEach((g) => {
  ['r01', 'r02', 'r03', 'v01', 'v02', 'v03', 'p01', 'p02', 'n01', 'n02'].forEach((p) => {
    CAND.push('/hks/' + g + '/' + p + '.do');
  });
});
const seen = { '/hks/hks4036/r01.do': 1 };
for (const u of CAND) {
  if (seen[u]) continue; seen[u] = 1;
  try {
    /* 표준코드를 여러 이름으로 함께 보낸다 — 어느 이름을 받는지 모른다 */
    const q = '?isin=' + ISIN + '&stdCd=' + ISIN + '&itemCd=' + ISIN + '&bondCd=' + ISIN;
    const r = await req(BASE + u + q, { referer: BASE + '/hks/hks4036/r01.do' });
    if (r.status !== 200 || r.len < 8000) continue;
    const body = strip(r.text);
    const hasIsin = body.indexOf(ISIN) >= 0 || r.text.indexOf(ISIN) >= 0;
    const hits = WANT.filter(([, x]) => x.test(body)).map(([n]) => n);
    if (!hits.length && !hasIsin) continue;
    console.log('\n' + u + ' → ' + r.len + '바이트' + (hasIsin ? ' · 표준코드 되돌려줌' : ''));
    report(u, r.text, hits.length >= 2);
  } catch (e) { /* 없는 화면 */ }
}

/* ── ④ KRX — 화면이 쓰는 bld 를 긁어 와서 쓴다 ─────────── */
console.log('\n' + '='.repeat(72));
console.log('④ KRX 정보데이터시스템 — bld 를 메뉴에서 긁어 온다');
console.log('='.repeat(72));
const KRX = 'https://data.krx.co.kr';
const MENUS = ['MDC0201020camp', 'MDC0201020101', 'MDC0201020201', 'MDC0201020301', 'MDC0201'];
const blds = new Set();
for (const id of MENUS) {
  try {
    const r = await req(KRX + '/contents/MDC/MDI/mdiLoader/index.cmd?menuId=' + id, { referer: KRX + '/' });
    if (r.status !== 200) continue;
    [...r.text.matchAll(/bld\s*[:=]\s*["']([\w/]+)["']/g)].forEach((x) => blds.add(x[1]));
    [...r.text.matchAll(/["'](dbms\/MDC\/[\w/]+)["']/g)].forEach((x) => blds.add(x[1]));
    console.log('   ' + id + ' → HTTP ' + r.status + ' · ' + r.len + '바이트');
  } catch (e) { console.log('   ' + id + ' → 실패 ' + e.message); }
}
console.log('\n긁어낸 bld ' + blds.size + '개');
[...blds].slice(0, 40).forEach((b) => console.log('   ' + b));

/* 채권으로 보이는 bld 만 실제로 두드린다 */
const bondBlds = [...blds].filter((b) => /bond|BND|11|10/i.test(b));
console.log('\n채권 후보 bld ' + bondBlds.length + '개 두드리기');
for (const b of bondBlds.slice(0, 12)) {
  try {
    const body = 'bld=' + encodeURIComponent(b) + '&isuCd=' + ISIN + '&isuSrtCd=' + ISIN
      + '&trdDd=' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '&share=1&money=1&csvxls_isNo=false';
    const r = await req(KRX + '/comm/bldAttendant/getJsonData.cmd', { body: body, referer: KRX + '/' });
    const short = r.text.slice(0, 220).replace(/\s+/g, ' ');
    console.log('\n   ' + b + ' → HTTP ' + r.status + ' · ' + r.len + '바이트\n      ' + short);
    if (/표면|이표|이자|CPN|coupon/i.test(r.text)) console.log('      ★ 표면금리·이자 항목이 있다');
  } catch (e) { console.log('\n   ' + b + ' → 실패 ' + e.message); }
}

console.log('\n탐색 끝.');
