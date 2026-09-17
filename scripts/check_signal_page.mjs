/*
 * 신호 화면이 **브라우저에서 실제로 그려지는지** 본다.
 *
 * check_signal_golden.mjs 는 셈이 맞는지를 묻고, 이 대본은 그 셈이 화면까지
 * 닿는지를 묻는다. 둘은 다른 것이다 — 엔진이 맞아도 화면이 자료를 못 읽거나
 * 한계 문구를 안 그리면 쓸모가 없다.
 *
 *   node scripts/check_signal_page.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
                '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    const idx = path.join(p, 'index.html');
    if (fs.existsSync(idx)) {
      res.writeHead(200, { 'Content-Type': TYPES['.html'] });
      res.end(fs.readFileSync(idx));
      return;
    }
    res.writeHead(404); res.end('no'); return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  res.end(fs.readFileSync(p));
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;

const fails = [];
let checks = 0;
function ok(name, cond, note) {
  checks++;
  if (!cond) fails.push(`${name}${note ? ' — ' + note : ''}`);
}

const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ colorScheme: theme });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(`http://127.0.0.1:${port}/docs/signal/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.band', { timeout: 20000 }).catch(() => {});

    ok(`[${theme}] 자바스크립트 오류 없음`, errors.length === 0, errors.slice(0, 3).join(' | '));

    // 자료를 못 읽었을 때 뜨는 안내가 떠 있으면 실패다
    const body = await page.textContent('#body');
    ok(`[${theme}] 자료를 읽었다`, !/읽지 못했습니다/.test(body || ''), (body || '').slice(0, 120));

    // 머리 요약
    ok(`[${theme}] 신호 등급이 보인다`, await page.locator('.band').first().isVisible());
    ok(`[${theme}] 네 축이 다 보인다`, (await page.locator('.axrow').count()) >= 4);
    ok(`[${theme}] 시계 네 칸`, (await page.locator('.hcard').count()) === 4);
    ok(`[${theme}] 차트를 그렸다`, (await page.locator('svg').count()) >= 1);

    // **손절 없는 매수 신호가 화면에 있으면 안 된다.**
    const hcards = await page.locator('.hcard').allTextContents();
    for (const t of hcards) {
      if (/매수/.test(t) && /판단/.test(t)) {
        ok(`[${theme}] 매수 칸에 손절이 있다`, /손절/.test(t), t.replace(/\s+/g, ' ').slice(0, 90));
      }
    }

    // 한계·유의사항
    const dis = await page.textContent('#disclaimer');
    ok(`[${theme}] 유의사항이 보인다`, /투자 권유가 아닙니다/.test(dis || ''));
    const lim = await page.textContent('#limits');
    ok(`[${theme}] 백테스트 요약이 보인다`, /보정|구간|백테스트/.test(lim || ''), (lim || '').slice(0, 80));

    // 미국 종목에는 **경고가 떠야 한다** — 백테스트가 그렇게 말했기 때문이다
    const us = await page.evaluate(() => {
      const sel = document.getElementById('pick');
      const o = Array.from(sel.querySelectorAll('option')).find(
        x => x.parentElement && /미국/.test(x.parentElement.label));
      if (!o) return null;
      sel.value = o.value; sel.dispatchEvent(new Event('change'));
      return o.value;
    });
    if (us) {
      await page.waitForTimeout(300);
      const t = await page.textContent('#body');
      ok(`[${theme}] 미국 종목에 경고가 뜬다`, /거꾸로|그대로 따르지 마/.test(t || ''),
         '백테스트가 음수라고 했으면 화면이 그 말을 해야 한다');
    }

    // 가로 스크롤이 생기지 않는가 (폰 너비)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`[${theme}] 폰 너비에서 가로 스크롤 없음`, over <= 1, `넘침 ${over}px`);

    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(`화면 점검 ${checks} 가지`);
if (fails.length) {
  console.log(`\n실패 ${fails.length}`);
  for (const f of fails) console.log('  - ' + f);
  process.exit(1);
}
console.log('실패 없음');
