#!/usr/bin/env node
/**
 * 사용법 화면을 이미지로 뽑는다.
 *
 *   node scripts/shoot_etf_howto.mjs [--out docs/etf-howto.png] [--width 1280]
 *
 * 화면을 캡처할 때 흔히 하는 실수가 **보이는 것만 찍는 것**이다. 탭이 숨어
 * 있으면 빈 그림이 나오고, 그래도 파일은 만들어지므로 실패한 줄 모른다.
 * 그래서 찍기 전에 탭을 열고, 찍은 뒤 **글자가 실제로 들어갔는지** 센다.
 *
 * 한글 폰트가 없으면 두부(□)만 찍힌다. 이것도 파일 크기로는 구분이 안 되므로
 * 폰트 목록을 미리 확인하고, 없으면 멈춘다 — 읽을 수 없는 그림을 내보내느니
 * 실패하는 편이 낫다.
 */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, dirname, normalize } from 'node:path';
import { execSync } from 'node:child_process';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const OUT = arg('--out', 'docs/etf-howto.png');
const WIDTH = Number(arg('--width', '1280'));
const PAGE = arg('--page', '/etf-holdings-search.html');
const LANG = arg('--lang', 'ko');

// ── 한글 폰트가 있나 ──────────────────────────────────────────────────────
try {
  const fonts = execSync('fc-list :lang=ko 2>/dev/null', { encoding: 'utf8' });
  if (!fonts.trim()) throw new Error('없음');
  const families = [...new Set(fonts.split('\n').map((l) => (l.split(':')[1] || '').trim())
    .filter(Boolean))].slice(0, 4);
  console.log(`[shoot] 한글 폰트 확인: ${families.join(' · ')}`);
} catch {
  console.error('[shoot] 한글 폰트가 없다. 두부(□)만 찍히므로 멈춘다.');
  console.error('        apt-get install -y fonts-nanum  (또는 fonts-noto-cjk)');
  process.exit(1);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: 1200 },
  deviceScaleFactor: 2,          // 2배로 찍어야 글자가 뭉개지지 않는다
});
await page.goto(base + PAGE, { waitUntil: 'networkidle' });

if (LANG === 'en') {
  await page.locator('.lang-toggle button[data-lang="en"]').click();
  await page.waitForTimeout(200);
}

// 탭을 실제로 연다. 숨은 채로 찍으면 빈 그림이 나온다.
await page.locator('.tabs button[data-tab="howto"]').click();
await page.waitForTimeout(400);
const visible = await page.locator('#tab-howto').isVisible();
if (!visible) { console.error('[shoot] 사용법 탭이 열리지 않았다.'); process.exit(1); }

// 캡처에는 인쇄 버튼·탭 줄이 필요 없다. 대신 어느 화면인지 알 수 있게
// 제목 줄은 남긴다.
await page.evaluate(() => {
  document.querySelector('.toolbar')?.remove();
  document.querySelector('.tabs')?.remove();
  document.querySelector('footer')?.remove();
  const hero = document.querySelector('.hero');
  if (hero) hero.style.marginBottom = '0';
});
await page.waitForTimeout(200);

const el = page.locator('#tab-howto');
const box = await el.boundingBox();
if (!box || box.height < 400) {
  console.error(`[shoot] 잡힌 영역이 너무 작다 (${box ? Math.round(box.height) : 0}px). 빈 그림일 수 있다.`);
  process.exit(1);
}

// 글자가 실제로 들어갔는지 — 빈 껍데기를 찍고 성공했다고 하면 안 된다.
const text = (await el.innerText()).replace(/\s+/g, '');
if (text.length < 400) {
  console.error(`[shoot] 본문 글자가 ${text.length}자뿐이다. 내용이 안 그려진 것으로 본다.`);
  process.exit(1);
}

await mkdir(dirname(OUT), { recursive: true });
await el.screenshot({ path: OUT, scale: 'device' });
console.log(`[shoot] ${OUT} · ${WIDTH}px 폭 · ${Math.round(box.height)}px 높이 · 본문 ${text.length}자`);

await browser.close();
server.close();
