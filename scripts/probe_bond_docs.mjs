#!/usr/bin/env node
/**
 * 채권 설명서 탐색 ⑨ — 설명서 번호를 훑어 채권 설명서를 찾는다
 *
 *   node scripts/probe_bond_docs.mjs
 *
 * 8차에서 알아낸 것 (★ 결정적)
 *   설명서 화면 /hki/hki3031/nNN.do 이 PDF 를 이 주소로 내려 준다 —
 *     https://img.securities.miraeasset.com/download/pdf/hki3031nNN.pdf
 *     (개정 이력은 hki3031nNN_YYYYMMDD.pdf, 최신본은 날짜 없는 이름)
 *   담당자가 준 IRP 설명서 파일 이름이 hki3031n81.pdf 였다 — 같은 규칙이다.
 *   즉 번호만 알면 설명서를 그대로 받아 판독할 수 있다.
 *
 *   그리고 /hki/hki3032/a00.do 의 37개 목록에는 채권 설명서가 없었다.
 *   그 화면은 「거래·계좌 설명서」 모음이고, 상품설명서는 다른 화면에 있다.
 *   그래서 목록을 뒤지는 대신 번호를 훑는다.
 *
 * 이번에 볼 것
 *   nNN.do 를 1~140 까지 열어 제목과 PDF 주소를 적는다. 제목에 「채권」 이 있는
 *   것이 우리가 찾는 설명서다 (장외채권 거래설명서 · 핵심요약설명서 등).
 *
 * 저장소에 아무것도 쓰지 않는다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';
const MAX = 140;
const CONC = 8;

async function get(url, referer) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', Referer: referer || BASE + '/main.do' },
    signal: AbortSignal.timeout(25000)
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get('content-type') || '';
  const head = buf.slice(0, 4000).toString('latin1');
  const m = /charset\s*=\s*["']?\s*([\w-]+)/i.exec(ct) || /charset\s*=\s*["']?\s*([\w-]+)/i.exec(head);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  let text = '';
  try {
    text = new TextDecoder(/euc-kr|ks_c_5601|ksc5601|cp949/.test(cs) ? 'euc-kr' : cs).decode(buf);
  } catch { text = buf.toString('utf8'); }
  return { status: r.status, ct, len: buf.length, text };
}
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** 화면의 제목 — 큰제목 태그를 먼저 보고, 없으면 <title> 을 쓴다 */
function titleOf(html) {
  const h = /<h[23][^>]*>([\s\S]{0,160}?)<\/h[23]>/i.exec(html);
  if (h && strip(h[1])) return strip(h[1]);
  const t = /<title[^>]*>([\s\S]{0,160}?)<\/title>/i.exec(html);
  return t ? strip(t[1]) : '';
}

async function one(n) {
  const u = BASE + '/hki/hki3031/n' + String(n).padStart(2, '0') + '.do';
  try {
    const r = await get(u, BASE + '/hki/hki3031/a00.do');
    if (r.status !== 200 || r.len < 8000) return { n, status: r.status, len: r.len };
    const pdfs = [...new Set([...r.text.matchAll(/["'(]([^"'()\s]{6,220}\.pdf)["')]/gi)].map((m) => m[1]))];
    /* 목록 화면·메뉴가 아니라 설명서 화면인지 — 자기 번호 PDF 를 들고 있어야 한다 */
    const own = pdfs.filter((p) => new RegExp('hki3031n' + String(n).padStart(2, '0') + '(?:_|\\.)').test(p));
    return { n, status: r.status, len: r.len, title: titleOf(r.text), pdfs: own.length ? own : pdfs };
  } catch (e) {
    return { n, err: e.message };
  }
}

console.log('/hki/hki3031/nNN.do 를 1~' + MAX + '까지 훑는다 (설명서 화면 · PDF 주소)');
const out = [];
for (let i = 1; i <= MAX; i += CONC) {
  const batch = [];
  for (let k = i; k < i + CONC && k <= MAX; k++) batch.push(one(k));
  out.push(...await Promise.all(batch));
}

const live = out.filter((x) => x.title);
console.log('\n열린 설명서 화면 ' + live.length + '개 / ' + MAX);
live.forEach((x) => {
  const mark = /채권/.test(x.title) ? ' ★' : '';
  console.log('   n' + String(x.n).padStart(2, '0') + mark + '  ' + x.title.slice(0, 70));
  (x.pdfs || []).filter((p) => !/_\d{8}\.pdf$/.test(p)).slice(0, 3)
    .forEach((p) => console.log('        ' + p));
});

const bonds = live.filter((x) => /채권/.test(x.title));
console.log('\n제목에 「채권」 이 있는 설명서 ' + bonds.length + '개');
bonds.forEach((x) => {
  console.log('   ★ n' + String(x.n).padStart(2, '0') + ' — ' + x.title);
  (x.pdfs || []).forEach((p) => console.log('        ' + p));
});

/* 열리지 않은 번호는 요약만 — 로그를 길게 만들 이유가 없다 */
const dead = out.filter((x) => !x.title);
console.log('\n비어 있던 번호 ' + dead.length + '개' + (dead.some((x) => x.err) ? ' (실패 ' + dead.filter((x) => x.err).length + '개)' : ''));

/* 찾은 PDF 를 실제로 받아 본다 — 판독할 수 있는 파일인지 확인한다 */
if (bonds.length) {
  console.log('\n' + '='.repeat(70));
  console.log('채권 설명서 PDF 받아 보기');
  console.log('='.repeat(70));
  for (const b of bonds) {
    for (const p of (b.pdfs || []).filter((x) => !/_\d{8}\.pdf$/.test(x)).slice(0, 2)) {
      const u = p.startsWith('http') ? p : (p.startsWith('/') ? BASE + p : BASE + '/' + p);
      try {
        const r = await fetch(u, { headers: { 'User-Agent': UA, Referer: BASE + '/hki/hki3031/a00.do' }, signal: AbortSignal.timeout(30000) });
        const buf = Buffer.from(await r.arrayBuffer());
        const isPdf = buf.slice(0, 5).toString('latin1') === '%PDF-';
        console.log('   ' + u + '\n      HTTP ' + r.status + ' · ' + (buf.length / 1024).toFixed(0) + ' KB · ' + (isPdf ? 'PDF 맞음' : '아님(' + (r.headers.get('content-type') || '') + ')'));
      } catch (e) {
        console.log('   ' + u + '\n      실패 ' + e.message);
      }
    }
  }
}

console.log('\n탐색 끝.');
