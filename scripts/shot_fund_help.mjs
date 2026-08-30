// 사용법 화면을 그림 한 장으로 뽑는다.
//
// 화면을 못 여는 자리(메신저·메일·인쇄물)에 사용법만 따로 붙일 일이 있어서
// 만든다. 글로 옮겨 적지 않고 **실제 화면을 찍는다** — 옮겨 적는 순간 화면과
// 어긋날 수 있고, 사용법이 본문과 다른 말을 하는 것이 가장 나쁘다.
//
// 기본은 배포본(fund-search.html)을 찍는다. 사용자에게 가는 파일이 그것이고,
// 개발본과 배포본이 다르면 사용자가 보는 것은 배포본이기 때문이다.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const PAGE = process.argv.includes('--dev') ? '/fund.html' : '/fund-search.html';
const OUT = process.argv.includes('--dev')
  ? 'tools/discovery/fund_help_dev.png'
  : 'tools/discovery/fund_help.png';

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
// 2배로 찍는다. 사용법은 표가 많아 1배로는 작은 글자가 뭉갠다.
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base + PAGE, { waitUntil: 'networkidle' });

await page.click('[data-tab="help"]');
await page.waitForSelector('#tab-help:not([hidden]) #help-body .card');

// 머리말(기준일·수집일)까지 같이 담는다. 사용법만 잘라 내면 "이 숫자가 언제
// 것인가" 가 빠지는데, 그것이 사용법에서 가장 자주 묻는 것이다.
await page.evaluate(() => {
  for (const el of document.querySelectorAll('nav, .tabs, [role="tablist"]')) {
    if (el.querySelector('[data-tab="help"]')) el.scrollIntoView();
  }
  window.scrollTo(0, 0);
});

// 빈 그림을 내보내지 않도록 실제로 그려졌는지 확인하고 찍는다.
const box = await page.locator('#tab-help').boundingBox();
if (!box || box.height < 200) throw new Error(`사용법 절이 그려지지 않았다 (높이 ${box ? box.height : 0})`);

await page.screenshot({ path: OUT, fullPage: true });

// 화면의 "사용법 내려받기" 가 만드는 것과 **같은 함수**로 홀로 서는 문서도
// 같이 떨군다. 여기서 따로 만들면 단추가 주는 것과 달라질 수 있다.
const doc = await page.evaluate(() => window.helpDoc());
const HTML_OUT = OUT.replace(/\.png$/, '.html');
await writeFile(HTML_OUT, doc, 'utf8');

const bytes = (await readFile(OUT)).length;
console.log(`[shot] ${OUT} — ${(bytes / 1024).toFixed(0)} KB (${PAGE})`);
console.log(`[shot] ${HTML_OUT} — ${(Buffer.byteLength(doc) / 1024).toFixed(0)} KB`);
if (errors.length) {
  console.error('페이지 오류:', errors.join(' / '));
  process.exitCode = 1;
}

await browser.close();
server.close();
