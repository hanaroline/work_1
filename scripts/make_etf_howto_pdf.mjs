#!/usr/bin/env node
/**
 * 사용법 화면을 PDF 로 만든다.
 *
 *   node scripts/make_etf_howto_pdf.mjs [--in docs/etf-howto.html] [--out docs/etf-howto.pdf]
 *
 * 단독 HTML(docs/etf-howto.html)을 그대로 인쇄한다. 화면에서 떠 온 파일이므로
 * PDF 도 화면과 어긋날 수 없다.
 *
 * 확인하는 것 둘.
 *   - 한글 폰트가 없으면 두부(□)만 박힌 PDF 가 나온다. 파일 크기로는 구분이
 *     안 되므로 미리 폰트를 보고, 없으면 멈춘다.
 *   - 만든 뒤 **글자를 다시 뽑아** 실제로 한글이 들어갔는지 센다. 그림으로만
 *     박힌 PDF 는 검색도 복사도 안 되므로 그것도 여기서 걸린다.
 */

import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const IN = arg('--in', 'docs/etf-howto.html');
const OUT = arg('--out', 'docs/etf-howto.pdf');

try {
  const fonts = execSync('fc-list :lang=ko 2>/dev/null', { encoding: 'utf8' });
  if (!fonts.trim()) throw new Error('없음');
} catch {
  console.error('[pdf] 한글 폰트가 없다. 두부(□)만 박힌 PDF 가 나오므로 멈춘다.');
  console.error('      apt-get install -y fonts-nanum  (또는 fonts-noto-cjk)');
  process.exit(1);
}

const html = await readFile(IN, 'utf8');
if (html.length < 5000) { console.error(`[pdf] ${IN} 가 너무 작다 (${html.length}바이트).`); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage();
// file:// 로 열어야 상대 경로가 원본과 같게 풀린다. 어차피 바깥 자원은 없다.
await page.goto(pathToFileURL(resolve(IN)).href, { waitUntil: 'networkidle' });

// 카드가 페이지 경계에서 잘리면 읽기 나쁘다. 인쇄용 규칙을 얹는다.
//
// 폰트도 여기서 못박는다. 원본의 글꼴 목록(Spoqa·Noto·Malgun)은 한국 사용자
// PC 에는 있지만 이 컨테이너에는 없다. 그대로 두면 fontconfig 가 중국어
// 글꼴(WenQuanYi)로 물러서서 한글이 중국 서체로 박힌다 — 실제로 그랬다.
// 한국어 문서이므로 한국어 글꼴을 쓴다. 하나로 몰면 임베드되는 부분집합
// 개수도 줄어 파일이 작아진다.
await page.addStyleTag({ content: `
  :root { --font-kr: 'NanumGothic','NanumBarunGothic',sans-serif;
          --font-en: 'NanumGothic',sans-serif;
          --font-num: 'NanumGothic',sans-serif; }
  body, body * { font-family: 'NanumGothic','NanumBarunGothic',sans-serif !important; }
  @page { size: A4; margin: 14mm 12mm; }
  .card, .notice, .callout { break-inside: avoid; page-break-inside: avoid; }
  h3 { break-after: avoid; page-break-after: avoid; }
  .section { padding-top: 0; }
` });

const text = (await page.locator('body').innerText()).replace(/\s+/g, '');
if (text.length < 400) { console.error(`[pdf] 본문이 ${text.length}자뿐이다.`); process.exit(1); }

await mkdir(dirname(OUT), { recursive: true });
await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,          // 주황 콜아웃·회색 안내 상자가 살아야 한다
  margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate:
    '<div style="width:100%;font-size:8pt;color:#84888B;padding:0 12mm;' +
    'display:flex;justify-content:space-between;font-family:sans-serif">' +
    '<span>ETF 편입종목 조회 — 사용법</span>' +
    '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
});
await browser.close();

// 만든 PDF 에서 글자를 다시 뽑는다 — 그림만 박힌 PDF 를 성공이라 하면 안 된다.
const size = (await stat(OUT)).size;
let extracted = null;
try {
  extracted = execSync(`pdftotext ${JSON.stringify(OUT)} - 2>/dev/null`, { encoding: 'utf8' });
} catch { /* pdftotext 가 없으면 넘어간다 */ }
if (extracted != null) {
  const ko = (extracted.match(/[가-힣]/g) || []).length;
  if (ko < 200) {
    console.error(`[pdf] PDF 안의 한글이 ${ko}자뿐이다 — 글자가 아니라 그림으로 박혔거나 폰트가 빠졌다.`);
    process.exit(1);
  }
  console.log(`[pdf] ${OUT} · ${(size / 1024).toFixed(0)}KB · 본문 한글 ${ko}자 (글자로 들어감 ✓)`);
} else {
  console.log(`[pdf] ${OUT} · ${(size / 1024).toFixed(0)}KB (pdftotext 가 없어 글자 확인은 건너뜀)`);
}
