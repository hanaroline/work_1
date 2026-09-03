#!/usr/bin/env node
/**
 * 채권 설명서 탐색 ⑩ — 「위험등급 안내」를 읽고, 장외채권 설명서를 계속 찾는다
 *
 *   npm install --no-save pdfjs-dist@3.11.174
 *   node scripts/probe_bond_docs.mjs
 *
 * 9차에서 알아낸 것
 *   ★ /hki/hki3031/nNN.do 87개가 열리고, PDF 는 모두
 *     https://img.securities.miraeasset.com/download/pdf/hki3031nNN.pdf 다.
 *     (개정 이력은 hki3031nNN_YYYYMMDD.pdf, 최신본은 날짜 없는 이름)
 *   ★ n81 = 「위험등급 안내」 — 이것이 바로 창구가 읽어야 하는 위험등급별
 *     의미·유의사항의 원문이다. 채권만이 아니라 펀드·ELS 에도 같이 쓰인다.
 *     담당자가 준 파일 이름도 hki3031n81.pdf 였다.
 *   ㆍ이 87개 중에 「장외채권 거래설명서」 는 없었다 — 여기 있는 채권 문서는
 *     산업금융채권약관 · 환매조건부 외화채권 약관 · 금전채권신탁 계약서뿐이다.
 *     hki3031 은 「약관·계약서」 모음이고 상품설명서는 다른 화면에 있다.
 *
 * 이번에 볼 것
 *   ① n81 「위험등급 안내」 PDF 를 실제로 판독한다 — 1~6등급 문구를 그대로 옮겨
 *      쓸 수 있는지 본다. 되면 채권 100종목 + 펀드 + ELS 의 「위험등급의 의미」가
 *      한 번에 채워진다.
 *   ② 상품설명서 모음이 어디인지 — 8차에 보인 /hki/hki3096/r01.do ·
 *      /hki/hki7000/r05.do 를 열어 본다.
 *
 * 저장소에 아무것도 쓰지 않는다.
 */
import { createRequire } from 'node:module';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';
const IMG = 'https://img.securities.miraeasset.com/download/pdf/';

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

/** 앱의 pdfToText 와 같은 규칙 — y 가 바뀌면 줄을 나누고 넓은 공백은 탭으로 본다 */
async function pdfText(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const out = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const tc = await (await doc.getPage(n)).getTextContent();
    let lastY = null, lastEnd = null, line = [];
    const lines = [];
    const flush = () => { if (line.length) lines.push(line.join('').replace(/[ \t]+$/, '')); line = []; };
    for (const it of tc.items) {
      const tr = it.transform || [];
      const y = tr.length ? Math.round(tr[5]) : null;
      const x = tr.length ? tr[4] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) { flush(); lastEnd = null; }
      if (/^\s*$/.test(it.str)) {
        if (x !== null) lastEnd = x + (it.width || 0);
        if (y !== null) lastY = y;
        if (line.length) line.push((it.width || 0) > 8 ? '\t' : ' ');
        continue;
      }
      if (lastEnd !== null && x !== null && x - lastEnd > 8 && !/\t$/.test(line[line.length - 1] || '')) line.push('\t');
      line.push(it.str);
      if (x !== null) lastEnd = x + (it.width || 0);
      lastY = y;
    }
    flush();
    out.push(lines.join('\n'));
  }
  return { text: out.join('\n'), pages: doc.numPages };
}

async function raw(url, referer) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', Referer: referer || BASE + '/main.do' },
    signal: AbortSignal.timeout(40000)
  });
  return { status: r.status, ct: r.headers.get('content-type') || '', buf: Buffer.from(await r.arrayBuffer()) };
}
async function html(url, referer) {
  const r = await raw(url, referer);
  const head = r.buf.slice(0, 4000).toString('latin1');
  const m = /charset\s*=\s*["']?\s*([\w-]+)/i.exec(r.ct) || /charset\s*=\s*["']?\s*([\w-]+)/i.exec(head);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  let text;
  try { text = new TextDecoder(/euc-kr|ks_c_5601|ksc5601|cp949/.test(cs) ? 'euc-kr' : cs).decode(r.buf); }
  catch { text = r.buf.toString('utf8'); }
  return { ...r, text, len: r.buf.length };
}
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* ── ① 위험등급 안내 PDF 판독 ────────────────────────── */
console.log('='.repeat(72));
console.log('① hki3031n81.pdf — 「위험등급 안내」 판독');
console.log('='.repeat(72));
try {
  const r = await raw(IMG + 'hki3031n81.pdf', BASE + '/hki/hki3031/n81.do');
  console.log('HTTP ' + r.status + ' · ' + (r.buf.length / 1024).toFixed(0) + ' KB · ' + r.ct);
  if (r.buf.slice(0, 5).toString('latin1') === '%PDF-') {
    const { text, pages } = await pdfText(r.buf);
    console.log('쪽수 ' + pages + ' · 글자 ' + text.length + '자');
    if (text.length < 200) {
      console.log('★ 글자층이 없다 — 그림으로만 된 PDF 다. 앱에서 판독할 수 없다.');
    } else {
      console.log('\n── 본문 (앞 4,000자) ──');
      console.log(text.slice(0, 4000));
      console.log('\n── 등급별 문구가 잡히는지 ──');
      [1, 2, 3, 4, 5, 6].forEach((g) => {
        const re = new RegExp('(?:^|\\n)[^\\n]{0,20}' + g + '\\s*등급[\\s\\S]{0,300}');
        const m = re.exec(text);
        console.log('   ' + g + '등급: ' + (m ? m[0].replace(/\s+/g, ' ').slice(0, 230) : '(못 찾음)'));
      });
    }
  } else {
    console.log('PDF 가 아니다 — 앞부분: ' + r.buf.slice(0, 200).toString('utf8'));
  }
} catch (e) {
  console.log('실패 — ' + e.message);
}

/* ── ② 상품설명서 모음이 어디인지 ────────────────────── */
console.log('\n' + '='.repeat(72));
console.log('② 상품설명서 모음 찾기');
console.log('='.repeat(72));
for (const u of ['/hki/hki3096/r01.do', '/hki/hki7000/r05.do', '/hki/hki3032/b00.do', '/hki/hki3032/n01.do']) {
  try {
    const r = await html(BASE + u, BASE + '/hki/hki3031/a00.do');
    const body = strip(r.text);
    console.log('\n' + u + ' → HTTP ' + r.status + ' · ' + r.len + '바이트');
    if (r.status !== 200 || r.len < 5000) continue;
    const t = /<h[23][^>]*>([\s\S]{0,160}?)<\/h[23]>/i.exec(r.text);
    console.log('   제목: ' + (t ? strip(t[1]) : '(없음)'));
    const names = [...new Set([...r.text.matchAll(/<a\b[^>]*>([\s\S]{0,120}?)<\/a>/gi)].map((m) => strip(m[1])))]
      .filter((x) => /설명서|채권|핵심|요약|위험/.test(x) && x.length < 60);
    console.log('   항목 ' + names.length + '개' + (names.length ? '\n      ' + names.slice(0, 30).join('\n      ') : ''));
    const p = [...new Set([...r.text.matchAll(/["'(]([^"'()\s]{6,220}\.pdf)["')]/gi)].map((m) => m[1]))]
      .filter((x) => !/_\d{8}\.pdf$/.test(x));
    if (p.length) { console.log('   .pdf ' + p.length + '개'); p.slice(0, 15).forEach((x) => console.log('      ' + x)); }
    if (/장외\s*채권|채권\s*거래설명서/.test(body)) console.log('   ★ 「장외채권」 이 이 화면에 있다');
  } catch (e) {
    console.log('\n' + u + ' → 실패 ' + e.message);
  }
}

/* ── ③ 장외채권 화면이 스스로 거는 설명서 링크 ────────── */
console.log('\n' + '='.repeat(72));
console.log('③ 장외채권 화면(/hks/hks4036/r01.do)의 안내 문구·링크 다시 보기');
console.log('='.repeat(72));
try {
  const r = await html(BASE + '/hks/hks4036/r01.do');
  const body = strip(r.text);
  /* 화면 자체에 설명서 문구가 적혀 있을 수도 있다 — 유의사항 영역을 본다 */
  ['유의', '수수료', '중도', '신용등급', '위험등급'].forEach((k) => {
    const i = body.indexOf(k);
    if (i >= 0) console.log('\n[' + k + '] …' + body.slice(Math.max(0, i - 80), i + 400) + '…');
  });
  const p = [...new Set([...r.text.matchAll(/["'(]([^"'()\s]{6,220}\.pdf)["')]/gi)].map((m) => m[1]))];
  console.log('\n.pdf ' + p.length + '개');
  p.slice(0, 20).forEach((x) => console.log('   ' + x));
} catch (e) {
  console.log('실패 — ' + e.message);
}

console.log('\n탐색 끝.');
