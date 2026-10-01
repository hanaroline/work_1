import { chromium } from 'playwright';
import { TARGET, launchOpts } from './_browser.mjs';
const FILE = TARGET;
const b = await chromium.launch(launchOpts());
const pg = await b.newPage();
const errs = [], blocked = [];
pg.on('pageerror', e => errs.push(String(e)));
pg.on('requestfailed', r => blocked.push(r.url().slice(0, 90)));
pg.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) blocked.push('외부:' + r.url().slice(0, 90)); });
const t0 = Date.now();
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2000);
console.log('로드 ' + ((Date.now() - t0) / 1000).toFixed(1) + '초');
const sheets = await pg.$$eval('#selSheet option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));
console.log('시트 ' + sheets.length + '개');
for (const s of sheets) {
  await pg.selectOption('#selSheet', s.v); await pg.waitForTimeout(220);
  const opts = await pg.$$eval('#selProduct option', o => o.map(x => x.value).filter(x => x && x !== '__'));
  let miss = '-';
  if (opts.length) {
    await pg.selectOption('#selProduct', opts[0]); await pg.waitForTimeout(320);
    miss = await pg.evaluate(() => (document.body.innerText.match(/확인필요 (\d+)건/) || [])[1] || '?');
  }
  console.log('  ' + s.t.padEnd(28) + ' 상품 ' + String(opts.length).padStart(4) + ' · 확인필요 ' + miss);
}
console.log('\n페이지 오류 ' + errs.length + ' · 외부/실패 요청 ' + blocked.length);
errs.slice(0, 5).forEach(e => console.log('  ' + e));
blocked.slice(0, 5).forEach(e => console.log('  ' + e));
await b.close();
