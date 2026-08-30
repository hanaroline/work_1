// 사용법 절을 PDF 한 부로 뽑고, 그 PDF 를 화면에 실어 넣는다.
//
//   node scripts/build_fund_help_pdf.mjs [--built]
//
// 왜 미리 만들어 싣나 —
// 화면에는 이미 "사용법만 인쇄 · PDF 저장" 이 있다. 그런데 그것은 브라우저의
// 인쇄창을 거치므로 받는 사람마다 여백·배경·머리말 설정이 다르고, 배경을 끄면
// 주황 머리말이 통째로 사라진다. 완성된 파일을 그대로 내주는 편이 낫다.
//
// 왜 화면 안에 넣나 —
// 배포본은 파일 하나(fund-search.html)로 돌아다닌다. 옆에 PDF 를 따로 두면
// 메일로 옮기는 순간 떨어져 나간다. 그래서 base64 로 안에 싣는다.
//
// 낡음 문제 —
// 실은 PDF 는 만든 시점의 자료를 담는다. 자료가 갱신되면 사용법의 수도 바뀌고
// 실린 PDF 는 그 순간 낡는다. 그래서 만들 때 화면이 센 수(HELP_STAMP)를 같이
// 적어 두고, 화면은 자기가 지금 센 수와 다르면 단추를 감춘다. 이 스크립트는
// **데이터 빌드 뒤·단일 파일 빌드 앞**에 돌아야 한다.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const PAGE = process.argv.includes('--built') ? '/fund-search.html' : '/fund.html';
const PDF_OUT = 'tools/discovery/fund_help.pdf';
const JS_OUT = 'data/fund-help-pdf.js';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base + PAGE, { waitUntil: 'networkidle' });

await page.click('[data-tab="help"]');
await page.waitForSelector('#tab-help:not([hidden]) #help-body .card');

// 화면의 "사용법만 인쇄" 가 하는 것과 **같은 표시**를 붙인다. 여기서 따로
// 감추고 자르면 단추가 주는 인쇄물과 다른 PDF 가 나온다.
await page.evaluate(() => {
  document.body.classList.add('print-help');
  // PDF 속성의 제목이 된다. 조회 화면 제목 그대로 두면 파일을 열었을 때
  // 무슨 문서인지가 창 제목에서 어긋난다.
  document.title = '공모펀드 조회 사용법';
});
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(300);

// 화면이 지금 세고 있는 수. 지어내지 않고 화면에서 읽는다.
const stamp = await page.evaluate(() => ({
  stamp: window.HELP_STAMP || '',
  asOf: (window.DATES || {}).asOf || '',
  got: (window.DATES || {}).got || '',
  funds: (window.FUNDS || []).length,
}));
if (!stamp.stamp) throw new Error('HELP_STAMP 가 비어 있다 — 사용법이 그려지지 않았다');

await page.pdf({
  path: PDF_OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '14mm', left: '12mm', right: '12mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  // 꼬리말은 본문과 다른 렌더 문맥이라 화면 CSS 가 닿지 않는다. 글꼴을 여기서
  // 따로 주지 않으면 한글이 엉뚱한 글꼴로 나온다.
  footerTemplate:
    '<div style="width:100%;font-size:8pt;color:#777;font-family:sans-serif;'
    + 'padding:0 12mm;display:flex;justify-content:space-between">'
    + `<span>공모펀드 조회 사용법 · 기준일 ${stamp.asOf || '미상'}</span>`
    + '<span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>',
});

const bytes = await readFile(PDF_OUT);
if (bytes.slice(0, 5).toString() !== '%PDF-') throw new Error('PDF 서명이 없다');
if (bytes.length < 20000) throw new Error(`PDF 가 너무 작다 (${bytes.length}B) — 빈 문서일 수 있다`);

// 화면에 실을 형태로 떨군다. 여기 적는 stamp 가 화면의 HELP_STAMP 와 다르면
// 화면이 스스로 단추를 감춘다 — 낡은 PDF 를 내주지 않게 하는 장치다.
const js = '/* 자동 생성 — scripts/build_fund_help_pdf.mjs. 손으로 고치지 마십시오. */\n'
  + 'window.HELP_PDF = '
  + JSON.stringify({
    stamp: stamp.stamp,
    asOf: stamp.asOf,
    got: stamp.got,
    bytes: bytes.length,
    b64: bytes.toString('base64'),
  })
  + ';\n';
await writeFile(JS_OUT, js, 'utf8');

console.log(`[help-pdf] ${PDF_OUT} — ${(bytes.length / 1024).toFixed(0)} KB (${PAGE}, 펀드 ${stamp.funds}개, 기준일 ${stamp.asOf})`);
console.log(`[help-pdf] ${JS_OUT} — ${(Buffer.byteLength(js) / 1024).toFixed(0)} KB · stamp ${stamp.stamp}`);

if (errors.length) {
  console.error('페이지 오류:', errors.join(' / '));
  process.exitCode = 1;
}

await browser.close();
server.close();
