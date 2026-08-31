#!/usr/bin/env node
/**
 * 사용법 산출물 일괄 생성.
 *
 *   node scripts/make_etf_howto.mjs
 *
 *   docs/etf-howto.html      단독 HTML (한글)
 *   docs/etf-howto-en.html   단독 HTML (영문)
 *   docs/etf-howto.pdf       PDF (A4)
 *   docs/etf-howto.png       이미지
 *   data/etf-howto-pdf.js    도구에 심을 PDF(base64)
 *
 * 순서가 중요하다.
 *   1. 도구를 빌드한다
 *   2. 도구에서 사용법을 **떠 온다**(손으로 쓰지 않는다 — 화면과 어긋난다)
 *   3. 그 HTML 로 PDF·PNG 를 만든다
 *   4. PDF 를 base64 로 도구에 심고 다시 빌드한다
 *
 * 4단계가 2단계 결과를 바꾸지 않는지가 걱정될 수 있는데, 떠 올 때 내려받기
 * 단추 줄(.take-row)을 지우므로 사용법 본문은 그대로다. 그래서 한 바퀴면
 * 안정된다.
 */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { execFileSync } from 'node:child_process';

const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' });

console.log('\n[1/5] 도구 빌드');
run('node', ['scripts/build_etf_page.mjs']);

console.log('\n[2/5] 화면 그림 (실제로 눌러 가며 찍는다)');
run('node', ['scripts/shoot_etf_screens.mjs']);
run('node', ['scripts/build_etf_page.mjs']);   // 그림을 담아 다시 빌드

console.log('\n[3/5] 사용법 떠 오기 (도구의 내려받기 단추를 그대로 누른다)');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer(async (q, r) => {
  try {
    const p = normalize(decodeURIComponent(q.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const b = await readFile(join(process.cwd(), p));
    r.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' });
    r.end(b);
  } catch { r.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, r));
const browser = await chromium.launch();
const page = await browser.newPage({ acceptDownloads: true });
await page.goto(`http://127.0.0.1:${server.address().port}/etf-holdings-search.html`,
  { waitUntil: 'networkidle' });

await mkdir('docs', { recursive: true });
for (const [lang, out] of [['ko', 'docs/etf-howto.html'], ['en', 'docs/etf-howto-en.html']]) {
  await page.locator(`.lang-toggle button[data-lang="${lang}"]`).click();
  await page.waitForTimeout(200);
  await page.locator('.tabs button[data-tab="howto"]').click();
  await page.waitForTimeout(300);
  const [d] = await Promise.all([page.waitForEvent('download'), page.locator('#howto-save').click()]);
  const html = await readFile(await d.path(), 'utf8');
  if (html.length < 5000) throw new Error(`${out} 이 너무 작다 (${html.length}바이트)`);
  await writeFile(out, html);
  console.log(`  ${out} · ${(html.length / 1024).toFixed(0)}KB`);
}
await browser.close();
server.close();

console.log('\n[4/5] PDF · 이미지');
run('node', ['scripts/make_etf_howto_pdf.mjs']);
run('node', ['scripts/shoot_etf_howto.mjs', '--out', 'docs/etf-howto.png', '--width', '1280']);

console.log('\n[5/5] PDF 를 도구에 심고 다시 빌드');
const pdf = await readFile('docs/etf-howto.pdf');
// 자료 기준일을 같이 심는다 — 내려받은 PDF 이름에 붙여 언제 것인지 알게 한다.
const src = await readFile('data/etf.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const days = (DATA.etfs || []).map((e) => e.retAsOf)
  .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d))).sort();
const stamp = days.length ? days[days.length - 1] : '';
await writeFile('data/etf-howto-pdf.js',
  '/* scripts/make_etf_howto.mjs 가 만든다. 손으로 고치지 말 것. */\n' +
  `window.ETF_HOWTO_PDF_AT = ${JSON.stringify(stamp)};\n` +
  `window.ETF_HOWTO_PDF = ${JSON.stringify(pdf.toString('base64'))};\n`);
console.log(`  data/etf-howto-pdf.js · PDF ${(pdf.length / 1024).toFixed(0)}KB → base64 ` +
            `${(pdf.toString('base64').length / 1024).toFixed(0)}KB · 기준일 ${stamp || '없음'}`);
run('node', ['scripts/build_etf_page.mjs']);

const built = (await stat('etf-holdings-search.html')).size;
console.log(`\n완료 — etf-holdings-search.html ${(built / 1024 / 1024).toFixed(2)} MB`);
