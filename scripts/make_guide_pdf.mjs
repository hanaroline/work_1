#!/usr/bin/env node
/**
 * 사용 안내서 PDF 를 만든다.
 *
 *   node scripts/make_guide_pdf.mjs
 *     docs/sales-script-expl-guide.html  ->  docs/상품설명의무_스크립트_사용안내.pdf
 *                                            docs/sales-script-expl-guide-standalone.html
 *
 * 폰트(Noto Sans KR)를 data: URI 로 심는다. 두 가지 이유다 —
 *   ① 망이 막힌 PC 에서 HTML 로 열어도 글자가 깨지지 않아야 한다.
 *   ② PDF 로 뽑을 때 폰트가 박혀야 어느 자리에서 열어도 같게 보인다.
 * 폰트는 npm 의 @fontsource/noto-sans-kr 에서 가져온다 (사내 승인 폰트).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

/* playwright 가 프로젝트에 없고 전역에만 깔린 자리가 있다 — 둘 다 찾아 본다 */
const req = createRequire(import.meta.url);
const chromium = (() => {
  for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
    try { return req(p).chromium; } catch { /* 다음 자리 */ }
  }
  throw new Error('playwright 를 찾지 못했습니다 — npm install -g playwright 또는 프로젝트에 설치하십시오.');
})();

const SRC = 'docs/sales-script-expl-guide.html';
const OUT_PDF = 'docs/상품설명의무_스크립트_사용안내.pdf';
const OUT_HTML = 'docs/sales-script-expl-guide-standalone.html';
const FDIR = 'node_modules/@fontsource/noto-sans-kr/files';

/* 한글과 라틴(숫자·영문)은 서브셋 파일이 따로다 — 둘 다 심어야 한다 */
const RANGE = {
  korean: 'U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF,U+3000-303F,U+FF00-FFEF',
  latin: 'U+0000-00FF,U+2000-206F,U+2070-209F,U+20A0-20BF,U+2190-21FF,U+2200-22FF,U+25A0-25FF,U+2600-26FF',
};

async function fontCss() {
  if (!existsSync(FDIR)) {
    throw new Error(
      `${FDIR} 가 없습니다 — 먼저 폰트를 받으십시오:\n`
      + '  npm install --no-save @fontsource/noto-sans-kr'
    );
  }
  const out = [];
  for (const w of [400, 500, 700]) {
    for (const sub of ['korean', 'latin']) {
      const p = `${FDIR}/noto-sans-kr-${sub}-${w}-normal.woff2`;
      if (!existsSync(p)) continue;
      const b64 = (await readFile(p)).toString('base64');
      out.push(
        "@font-face{font-family:'Noto Sans KR';font-style:normal;font-weight:" + w + ';'
        + 'font-display:block;src:url(data:font/woff2;base64,' + b64 + ") format('woff2');"
        + 'unicode-range:' + RANGE[sub] + '}'
      );
    }
  }
  if (!out.length) throw new Error('woff2 파일을 하나도 찾지 못했습니다.');
  return out.join('\n');
}

const html = (await readFile(SRC, 'utf8')).replace('/*__FONTS__*/', await fontCss());
await mkdir('docs', { recursive: true });
await writeFile(OUT_HTML, html);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message)));
/* 바깥으로 나가려 하면 막는다 — 안내서가 외부 자원에 기대면 안 된다 */
const outside = [];
await page.route('**/*', (r) => {
  const u = r.request().url();
  if (/^(file|blob|data|about):/.test(u)) return r.continue();
  outside.push(u); return r.abort();
});
await page.goto('file://' + process.cwd() + '/' + OUT_HTML, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

/* 여백은 페이지가 스스로 갖고 있다 (.page 의 padding) — 여기서는 0 으로 둔다 */
await page.pdf({ path: OUT_PDF, format: 'A4', printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' } });

const pages = await page.evaluate(() => document.querySelectorAll('.page').length);
await browser.close();

console.log(`${OUT_PDF} 생성 — ${pages}쪽`);
console.log(`${OUT_HTML} 생성 (폰트 내장 · 오프라인)`);
if (outside.length) console.log('::warning::바깥 자원을 부르려 했습니다 — ' + [...new Set(outside)].join(', '));
if (errs.length) { console.log('::error::' + errs.join(' / ')); process.exitCode = 1; }
