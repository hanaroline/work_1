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

    // 종목별 수급이 실렸으면 화면이 그 사실과 **백테스트가 그 축을 안 쟀다는 것**을
    // 말해야 한다. 자료가 늘어난 것은 좋은 일이지만 성적표가 그 자료로 잰 것이
    // 아니라는 점을 숨기면, 화면이 실제보다 검증된 것처럼 보인다.
    // **상태에 따라 다른 것을 확인한다.** 자료가 실린 것과 점수에 들어간 것은
    // 다른 말이고, 화면은 그 둘을 갈라 적어야 한다. 처음에는 「N 세션 실렸습니다」만
    // 찾았는데, 자료가 열흘뿐이라 점수에 한 날도 안 들어간 상태에서 그 문구가
    // 뜨면 급히 보는 사람은 반영된 줄로 읽는다.
    const flow = await page.evaluate(async () => {
      const r = await fetch('../../data/signals/latest.json');
      const d = await r.json();
      const it = (d.items || []).find(x => x.flow_data);
      if (!it) return null;
      const sel = document.getElementById('pick');
      sel.value = it.symbol; sel.dispatchEvent(new Event('change'));
      return { symbol: it.symbol, inScore: it.flow_data.in_score,
               sessions: it.flow_data.sessions };
    });
    if (flow) {
      await page.waitForTimeout(300);
      const t = await page.textContent('#body');
      if (flow.inScore === 0) {
        ok(`[${theme}] 점수에 안 들어갔다고 뜬다`,
           /아직 점수에 들어가지 않습니다/.test(t || ''),
           `${flow.symbol} 수급 ${flow.sessions}세션, 점수편입 0`);
        ok(`[${theme}] 반영된 것처럼 적지 않는다`, !/세션 실렸고/.test(t || ''));
      } else {
        ok(`[${theme}] 점수 편입 일수가 뜬다`, /일이 점수에 들어갔습니다/.test(t || ''),
           flow.symbol);
        ok(`[${theme}] 백테스트 한계가 뜬다`,
           /백테스트는 이 자료 없이/.test(t || ''),
           '성적표가 이 축을 안 쟀다는 말이 있어야 한다');
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
