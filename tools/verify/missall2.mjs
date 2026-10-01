import { chromium } from 'playwright';
import { TARGET, launchOpts } from './_browser.mjs';
const FILE = TARGET;
const b = await chromium.launch(launchOpts());
const pg = await b.newPage();
const errs = [], reqs = [];
pg.on('pageerror', e => errs.push(String(e)));
pg.on('request', r => { if (!/^(file|data|blob):/.test(r.url())) reqs.push('외부 ' + r.url()); });
pg.on('requestfailed', r => reqs.push('실패 ' + r.url()));
const t0 = Date.now();
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2500);
console.log('로드 ' + ((Date.now() - t0) / 1000).toFixed(1) + '초');

const sheets = await pg.$$eval('#selSheet option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));
let mismatch = 0, elided = 0;
for (const s of sheets) {
  await pg.selectOption('#selSheet', s.v);
  await pg.waitForTimeout(500);
  const opts = await pg.$$eval('#selProduct option', o => o.map(x => x.value).filter(Boolean));
  if (opts.length) { await pg.selectOption('#selProduct', opts[0]); await pg.waitForTimeout(650); }

  const r = await pg.evaluate(() => {
    /* 확인필요 배너를 찾는다 — 머리글이 실제 건수를 말한다 */
    let banner = null;
    document.querySelectorAll('.banner').forEach(el => {
      if (/확인필요\s*\d+\s*건/.test(el.textContent)) banner = el;
    });
    if (!banner) return { total: 0, groups: [], elide: 0, prod: '' };
    const total = +(banner.textContent.match(/확인필요\s*(\d+)\s*건/) || [])[1];
    const groups = [];
    banner.querySelectorAll(':scope > div').forEach(blk => {
      const head = (blk.querySelector('b') || {}).textContent || '';
      const m = head.match(/^(.*?)\s*(\d+)\s*건$/);
      const chips = [...blk.querySelectorAll('.v.miss')].map(el => ({
        label: el.textContent.trim(), key: el.dataset.key, kind: el.dataset.kind, hint: el.getAttribute('title') || ''
      }));
      groups.push({ name: m ? m[1] : head, said: m ? +m[2] : chips.length, chips });
    });
    const prod = (document.querySelector('#selProduct') || {}).selectedOptions;
    return { total, groups, elide: (banner.textContent.match(/외 (\d+)건/g) || []).length,
      prod: prod && prod[0] ? prod[0].textContent.trim() : '(없음)' };
  });

  const shown = r.groups.reduce((a, g) => a + g.chips.length, 0);
  const said = r.groups.reduce((a, g) => a + g.said, 0);
  if (shown !== said || said !== r.total) mismatch++;
  elided += r.elide;
  console.log('\n════ ' + s.t + '  (' + r.prod.slice(0, 38) + ')');
  console.log('   확인필요 ' + r.total + '건 · 묶음 합 ' + said + '건 · 칩 ' + shown + '개'
    + (shown === said && said === r.total ? ' (일치)' : ' ← 어긋남'));
  r.groups.forEach(g => {
    console.log('   ■ ' + g.name + ' — ' + g.said + '건');
    g.chips.forEach(c => console.log('      · ' + c.label + (c.hint ? '  ⓘ' : '') + '   [' + c.kind + ':' + c.key + ']'));
  });
}
console.log('\n건수 어긋난 시트 ' + mismatch + ' · 접힌 묶음 ' + elided
  + ' · 페이지 오류 ' + errs.length + ' · 외부/실패 요청 ' + reqs.length);
errs.slice(0, 4).forEach(e => console.log('  ' + e.slice(0, 200)));
reqs.slice(0, 4).forEach(e => console.log('  ' + e.slice(0, 160)));
await b.close();
