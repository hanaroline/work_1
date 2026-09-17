/*
 * 내장판(signal-offline.html)이 **인터넷 없이 실제로 그려지는지** 본다.
 *
 * check_signal_page.mjs 는 서버에 띄운 인터넷판을 보고, 이 대본은 file:// 로 연
 * 내장판을 본다. 둘은 다른 것을 묻는다 — 인터넷판이 멀쩡해도 내장 블록을 안 읽거나
 * CORS 에 막히면 업무용 PC 에서는 빈 화면이 뜬다.
 *
 * **모든 바깥 요청을 끊고 연다.** 하나라도 나가려 하면 잡아서 실패로 적는다.
 * 그래야 "내 PC 에서는 되던데" 가 아니라 정말로 자급자족하는지 알 수 있다.
 *
 *   node scripts/check_signal_offline.mjs [파일경로]
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = process.argv[2] || path.join(ROOT, 'signal-offline.html');

if (!fs.existsSync(FILE)) {
  console.log(`없음: ${FILE} — 먼저 python3 scripts/make_signal_offline.py 를 돌리십시오.`);
  process.exit(1);
}

const fails = [];
let checks = 0;
function ok(name, cond, note) {
  checks++;
  if (!cond) fails.push(`${name}${note ? ' — ' + note : ''}`);
}

const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ colorScheme: theme });

    // 바깥으로 나가려는 요청을 전부 끊는다. file:// 자체는 route 를 타지 않는다.
    const outbound = [];
    await ctx.route('**/*', route => {
      const u = route.request().url();
      if (!u.startsWith('file://')) { outbound.push(u); return route.abort(); }
      return route.continue();
    });

    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });
    await page.waitForSelector('.band', { timeout: 20000 }).catch(() => {});

    ok(`[${theme}] 자바스크립트 오류 없음`, errors.length === 0, errors.slice(0, 3).join(' | '));
    ok(`[${theme}] 바깥으로 나가지 않았다`, outbound.length === 0,
       `요청 ${outbound.length}건: ${outbound.slice(0, 3).join(', ')}`);

    const body = await page.textContent('#body');
    ok(`[${theme}] 자료를 읽었다`, !/읽지 못했습니다/.test(body || ''), (body || '').slice(0, 140));

    // 내장판임을 머리말이 밝혀야 한다 — 오래된 파일을 실시간으로 착각하면 안 된다
    const asof = await page.textContent('#asof');
    ok(`[${theme}] 내장 스냅샷이라고 밝힌다`, /내장 스냅샷/.test(asof || ''), asof || '');
    ok(`[${theme}] 산출 시각이 있다`, /산출 \d{4}-\d{2}-\d{2}/.test(asof || ''), asof || '');

    // 고르는 목록과 그리기
    const opts = await page.locator('#pick option').count();
    ok(`[${theme}] 종목 목록이 찼다`, opts >= 200, `${opts}개`);
    ok(`[${theme}] 신호 등급이 보인다`, await page.locator('.band').first().isVisible());
    ok(`[${theme}] 네 축이 다 보인다`, (await page.locator('.axrow').count()) >= 4);
    ok(`[${theme}] 시계 네 칸`, (await page.locator('.hcard').count()) === 4);
    ok(`[${theme}] 차트를 그렸다`, (await page.locator('svg').count()) >= 1);

    // 백테스트 성적표도 내장돼 있어야 한다
    const lim = await page.textContent('#limits');
    ok(`[${theme}] 성적표를 읽었다`, !/읽지 못했습니다/.test(lim || ''), (lim || '').slice(0, 100));
    ok(`[${theme}] 보정 결과가 적혀 있다`, /보정|Bonferroni/.test(lim || ''));

    // **손절 없는 매수 신호가 있으면 안 된다** — 인터넷판과 같은 규칙
    for (const t of await page.locator('.hcard').allTextContents()) {
      if (/매수/.test(t) && /판단/.test(t)) {
        ok(`[${theme}] 매수 칸에 손절이 있다`, /손절/.test(t), t.replace(/\s+/g, ' ').slice(0, 90));
      }
    }

    // 종목을 바꿔도 그려지는가 — 목록 전체가 내장됐는지 보는 것이다
    const picked = await page.evaluate(() => {
      const sel = document.getElementById('pick');
      const o = Array.from(sel.querySelectorAll('option'));
      const t = o[Math.floor(o.length / 2)];
      sel.value = t.value; sel.dispatchEvent(new Event('change'));
      return t.value;
    });
    await page.waitForTimeout(300);
    ok(`[${theme}] 다른 종목도 그려진다`, (await page.locator('.band').count()) >= 1, picked);

    // 미국 종목 경고 — 백테스트가 음수라고 했으면 화면이 그 말을 해야 한다
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
      ok(`[${theme}] 미국 종목에 경고가 뜬다`, /거꾸로|그대로 따르지 마/.test(t || ''), us);
    }

    // 임의 종목은 **안 되는 것이 맞다** — 다만 그 까닭을 바르게 적어야 한다.
    // 종목코드가 틀렸다고 적으면 멀쩡한 코드를 몇 번씩 다시 치게 된다.
    await page.fill('#free', 'ZZZZ');
    await page.click('#go');
    await page.waitForTimeout(800);
    const t2 = await page.textContent('#body');
    ok(`[${theme}] 임의 종목이 왜 안 되는지 바르게 적는다`,
       /인터넷 없이 열도록/.test(t2 || ''), (t2 || '').slice(0, 140));
    ok(`[${theme}] 지어낸 신호를 내지 않는다`, !/매수|비중확대/.test(t2 || ''),
       (t2 || '').slice(0, 140));

    // 폰 너비에서 가로 스크롤
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`[${theme}] 폰 너비에서 가로 스크롤 없음`, over <= 1, `넘침 ${over}px`);

    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(`내장판 점검 ${checks} 가지 — ${(fs.statSync(FILE).size / 1048576).toFixed(1)} MB`);
if (fails.length) {
  console.log(`\n실패 ${fails.length}`);
  for (const f of fails) console.log('  - ' + f);
  process.exit(1);
}
console.log('실패 없음 — 인터넷 0바이트로 열린다.');
