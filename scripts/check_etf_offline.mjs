/*
 * 내장판(etf-offline.html)이 **인터넷 없이 실제로 그려지는지** 본다.
 *
 * **모든 바깥 요청을 끊고 연다.** 하나라도 나가려 하면 잡아서 실패로 적는다.
 * 그래야 "내 PC 에서는 되던데" 가 아니라 정말로 자급자족하는지 알 수 있다.
 *
 * 그리고 이 화면이 **내지 말아야 할 것을 내지 않는지**도 본다 — 이력이 모자란
 * 종목에 신호대가 붙으면 근거 없는 글자이고, 성적표가 없다는 사실이 화면에서
 * 사라지면 읽는 사람이 재 본 적 없는 신호를 재 본 것으로 읽는다.
 *
 *   node scripts/check_etf_offline.mjs [파일경로]
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = process.argv[2] || path.join(ROOT, 'etf-offline.html');

if (!fs.existsSync(FILE)) {
  console.log(`없음: ${FILE} — 먼저 python3 scripts/make_etf_offline.py 를 돌리십시오.`);
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
    await page.waitForSelector('tbody tr', { timeout: 20000 }).catch(() => {});

    ok(`[${theme}] 자바스크립트 오류 없음`, errors.length === 0, errors.slice(0, 3).join(' | '));
    ok(`[${theme}] 바깥으로 나가지 않았다`, outbound.length === 0,
       `요청 ${outbound.length}건: ${outbound.slice(0, 3).join(', ')}`);

    const body = await page.textContent('#body');
    ok(`[${theme}] 자료를 읽었다`, !/읽지 못했습니다/.test(body || ''), (body || '').slice(0, 140));

    const rows = await page.$$eval('tbody tr[data-tk]', els => els.length);
    ok(`[${theme}] 76 줄이 다 있다`, rows === 76, `${rows} 줄`);

    ok(`[${theme}] 겹침 칸이 있다`, /사실상 .* 덩이/.test(body || ''));

    // **성적표는 붙었거나, 없다고 적혀 있거나 둘 중 하나여야 한다.**
    // 이 화면이 가장 하기 쉬운 거짓말이 「재 본 적 없는 신호를 재 본 것처럼
    // 보이게 하는 것」이다. 그래서 어느 쪽이든 화면에 글자로 남아야 한다.
    const limits = (await page.textContent('#limits')) || '';
    const hasBt = /성적표 — 이 76종으로 직접 쟀습니다/.test(body || '');
    ok(`[${theme}] 성적표가 붙었거나 없다고 적혀 있다`,
       hasBt || /성적표가 없습니다/.test(limits));
    if (hasBt) {
      // 76 으로 읽히게 두지 않는다 — 신설 ETF 는 이력이 모자라 빠진다
      ok(`[${theme}] 몇 종목을 실제로 쟀는지 적혀 있다`,
         /76 종목으로 잰 것이 아닙니다/.test(body || ''));
      ok(`[${theme}] 95% 구간을 싣는다`, /95% 구간/.test(body || ''));
      // 한 줄짜리 규칙과의 견줌 — 성적표에 그 칸이 있으면 화면에도 떠야 한다.
      // 없으면 「엔진이 값을 하는가」라는 물음이 화면에서 사라진다.
      const hasMa = await page.evaluate(() => {
        const el = document.getElementById('etf-embedded');
        if (!el) return false;
        try {
          const d = JSON.parse(el.textContent);
          const hs = (d.backtest || {}).horizons || {};
          return Object.values(hs).some(h =>
            Object.values(h.flip || {}).some(m => m && m.equity_ma_cross));
        } catch (e) { return false; }
      });
      if (hasMa) {
        ok(`[${theme}] 20일선 교차와 견준 칸이 있다`,
           /한 줄짜리 규칙과 견주면/.test(body || ''));
        ok(`[${theme}] 손절을 붙인 판까지 싣는다`,
           /20일선 교차 \+ 같은 손절/.test(body || ''));
      }
      ok(`[${theme}] 비용이 가정임을 밝힌다`,
         /사실이 아니라 가정입니다/.test(body || ''));
    }
    ok(`[${theme}] ETN 을 뺐다고 적혀 있다`,
       /ETN .*제외|ETN .*뺐/.test((await page.textContent('#cover') || '') +
                                  (await page.textContent('#limits') || '')));

    // **모자란 이력에 신호대가 붙지 않았는가** — 표에서 등급이 온전이 아닌 줄에
    // 신호대 칸이 채워져 있으면 근거 없는 글자다.
    const bad = await page.$$eval('tbody tr[data-tk]', els => els.filter(tr => {
      const td = tr.querySelectorAll('td');
      const tier = td[td.length - 1].textContent.trim();
      const band = td[td.length - 2].textContent.trim();
      return tier !== '온전' && band !== '—';
    }).map(tr => tr.getAttribute('data-tk')));
    ok(`[${theme}] 모자란 이력에 신호대가 없다`, bad.length === 0, bad.join(', '));

    // 줄을 눌러 자세히 펴지는가
    await page.click('tbody tr[data-tk]');
    await page.waitForTimeout(150);
    const cards = await page.$$eval('.card h2', els => els.map(e => e.textContent));
    ok(`[${theme}] 줄을 누르면 자세히 펴진다`, cards.some(t => /축 넷/.test(t)),
       cards.join(' | ').slice(0, 120));

    // 가로 스크롤이 나지 않는가 (휴대폰 너비)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(120);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`[${theme}] 좁은 화면에서 가로로 넘치지 않는다`, over <= 1, `${over}px`);

    await ctx.close();
  }
} finally {
  await browser.close();
}

const mb = (fs.statSync(FILE).size / 1024 / 1024).toFixed(1);
console.log(`내장판 점검 ${checks} 가지 — ${mb} MB`);
if (fails.length) {
  console.log(`실패 ${fails.length}`);
  for (const f of fails) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('실패 없음 — 인터넷 0바이트로 열린다.');
