#!/usr/bin/env node
/**
 * 채권 설명서 탐색 ⑧ — 설명서 목록 화면을 열고 채권 항목을 따라간다
 *
 *   node scripts/probe_bond_docs.mjs
 *
 * 7차에서 알아낸 것
 *   ★ /hki/hki3032/a00.do 가 상품설명서 모음 화면이다 —
 *     「국내주식 거래설명서」 「외화증권거래설명서」 「연금저축계좌 설명서」 …
 *     가나다순으로 실려 있어 7차 로그에는 앞 15개만 찍혔다. 「장외채권」 은 뒤에 있다.
 *   ㆍ/hki/hki3031/a01.do · b00.do · n01.do 에도 「채권」 이 들어 있다.
 *   ㆍ.pdf 를 주소로 바로 두드리면 안 된다 — 화면이 내려 주는 링크를 따라가야 한다.
 *     (담당자가 준 IRP 파일 hki3031n81.pdf 도 화면을 거쳐 받은 것이다)
 *
 * 이번에 볼 것
 *   ① 설명서 모음 화면의 항목을 하나도 빼지 않고 찍는다 — 채권 항목의 링크 방식까지
 *   ② 채권 항목을 따라가 본문(또는 PDF)을 받아, 창구가 읽어야 하는 문구가
 *      들어 있는지 확인한다 — 위험등급의 의미 · 신용등급의 정의 · 매매수수료 ·
 *      중도매도 가능 여부
 *
 * 저장소에 아무것도 쓰지 않는다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';

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
  const isPdf = /pdf|octet-stream/.test(ct) || buf.slice(0, 5).toString('latin1') === '%PDF-';
  if (!isPdf) {
    try {
      text = new TextDecoder(/euc-kr|ks_c_5601|ksc5601|cp949/.test(cs) ? 'euc-kr' : cs).decode(buf);
    } catch { text = buf.toString('utf8'); }
  }
  return { status: r.status, ct, len: buf.length, cs, text, buf, isPdf };
}
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** 화면의 모든 <a> 를 글자 + 링크로 뽑는다 */
function anchorsOf(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]{0,200}?)<\/a>/gi)].map((m) => {
    const at = m[1];
    const u = (/(?:href|onclick)\s*=\s*"([^"]*)"/i.exec(at) || /(?:href|onclick)\s*=\s*'([^']*)'/i.exec(at) || [])[1] || '';
    return { u: u, t: strip(m[2]), attr: at.replace(/\s+/g, ' ').slice(0, 220) };
  }).filter((a) => a.t);
}

/* ── ① 설명서 모음 화면을 통째로 본다 ────────────────── */
const LIST = '/hki/hki3032/a00.do';
console.log('='.repeat(72));
console.log('① ' + LIST + ' — 상품설명서 모음 (항목 전부)');
console.log('='.repeat(72));
const page = await get(BASE + LIST, BASE + '/hki/hki3031/a00.do');
console.log('HTTP ' + page.status + ' · ' + page.len + '바이트 · ' + page.cs);

const all = anchorsOf(page.text);
/* 설명서 이름으로 보이는 것만 (메뉴·푸터 링크를 걷어낸다) */
const items = [...new Map(all.filter((a) => /설명서|약정|계약서|규정|안내/.test(a.t) && a.t.length < 60)
  .map((a) => [a.t, a])).values()];
console.log('\n설명서 항목 ' + items.length + '개');
items.forEach((a, i) => console.log('   ' + String(i + 1).padStart(3) + '. ' + a.t));

const bondItems = items.filter((a) => /채권|장외/.test(a.t));
console.log('\n채권 항목 ' + bondItems.length + '개 — 링크 방식까지');
bondItems.forEach((a) => console.log('   [' + a.t + ']\n      링크: ' + (a.u || '(없음)') + '\n      속성: ' + a.attr));

/* 링크가 <a> 가 아니라 표의 버튼일 수도 있다 — 「채권」 이 들어간 행을 그대로 찍는다 */
const rows = [...page.text.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1])
  .filter((r) => /채권/.test(strip(r)));
console.log('\n「채권」 이 들어간 행 ' + rows.length + '개');
rows.slice(0, 10).forEach((r, i) => {
  console.log('   행' + (i + 1) + ': ' + strip(r).slice(0, 120));
  const fns = [...new Set([...r.matchAll(/(?:href|onclick)\s*=\s*"([^"]{3,220})"/gi)].map((m) => m[1]))];
  fns.forEach((f) => console.log('        → ' + f));
});

/* 화면이 목록을 스크립트 배열로 들고 있는 경우 — 파일 이름을 찾는다 */
const files = [...new Set([...page.text.matchAll(/["']([\w./-]{4,120}\.(?:pdf|hwp|docx?))["']/gi)].map((m) => m[1]))];
console.log('\n파일 이름 ' + files.length + '개');
files.filter((f) => /채권|bond|hks40/i.test(f)).slice(0, 20).forEach((f) => console.log('   ★ ' + f));
files.slice(0, 25).forEach((f) => console.log('   ' + f));

/* ── ② 채권 항목을 따라간다 ──────────────────────────── */
console.log('\n' + '='.repeat(72));
console.log('② 채권 설명서 본문 따라가기');
console.log('='.repeat(72));

/** javascript:goDetail('a','b') 같은 링크에서 인자를 뽑아 주소를 만든다 */
function resolve(u) {
  if (!u) return null;
  const direct = /^\/?[\w./-]+\.(?:do|pdf|jsp)(?:\?[^"']*)?$/.exec(u.replace(/^javascript:/, ''));
  if (direct) return (u.startsWith('/') ? '' : '/') + u;
  const open = /openHp\(\s*'([^']+)'/.exec(u) || /goPage\(\s*'([^']+)'/.exec(u) || /window\.open\(\s*'([^']+)'/.exec(u);
  if (open) return open[1];
  const pdf = /'([\w./-]+\.pdf)'/.exec(u);
  if (pdf) return pdf[1].startsWith('/') ? pdf[1] : '/hki/hki3031/' + pdf[1];
  return null;
}

const targets = [];
bondItems.forEach((a) => { const r = resolve(a.u); if (r) targets.push({ t: a.t, u: r }); });
rows.forEach((r) => {
  [...r.matchAll(/(?:href|onclick)\s*=\s*"([^"]{3,220})"/gi)].forEach((m) => {
    const x = resolve(m[1]); if (x) targets.push({ t: strip(r).slice(0, 40), u: x });
  });
});
/* 7차에서 「채권」 이 있다고 나온 화면도 함께 본다 */
['/hki/hki3031/a01.do', '/hki/hki3031/b00.do', '/hki/hki3031/n01.do'].forEach((u) => targets.push({ t: '(7차 후보)', u: u }));

const seen = {};
const KEYS = [
  ['위험등급', /위험등급/],
  ['신용등급의 정의', /신용등급[^\n]{0,6}(?:정의|의미)/],
  ['매매수수료', /매매\s*수수료|수수료[^\n]{0,4}없/],
  ['중도매도', /중도\s*매도/],
  ['이표채·복리채', /이표채|복리채|할인채/]
];
for (const g of targets) {
  const u = g.u.startsWith('http') ? g.u : BASE + (g.u.startsWith('/') ? g.u : '/' + g.u);
  if (seen[u]) continue; seen[u] = 1;
  try {
    const r = await get(u, BASE + LIST);
    const body = r.isPdf ? '' : strip(r.text);
    console.log('\n' + u + ' [' + g.t + ']');
    console.log('   HTTP ' + r.status + ' · ' + r.len + '바이트 · ' + (r.isPdf ? 'PDF' : r.ct));
    if (r.isPdf) { console.log('   ★ PDF 다 — 수집기가 받아 판독할 수 있다'); continue; }
    if (r.status !== 200 || r.len < 3000) continue;
    const hits = KEYS.filter(([, re]) => re.test(body)).map(([n]) => n);
    console.log('   문구: ' + (hits.length ? hits.join(' · ') : '(없음)'));
    if (hits.length >= 2) {
      /* 실제로 어떤 문장이 있는지 앞뒤를 본다 — 그대로 옮겨 쓸 수 있는지 판단해야 한다 */
      KEYS.forEach(([n, re]) => {
        const m = re.exec(body);
        if (m) console.log('     · ' + n + ': …' + body.slice(Math.max(0, m.index - 60), m.index + 220).replace(/\s+/g, ' ') + '…');
      });
    }
    const p = [...new Set([...r.text.matchAll(/["'(]([^"'()\s]{3,200}\.pdf)["')]/gi)].map((m) => m[1]))];
    if (p.length) { console.log('   .pdf ' + p.length + '개'); p.slice(0, 10).forEach((x) => console.log('      ' + x)); }
  } catch (e) {
    console.log('\n' + u + ' → 실패 ' + e.message);
  }
}

console.log('\n탐색 끝.');
