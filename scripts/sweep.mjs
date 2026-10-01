// 340~1920px 을 20px 씩 훑어 넘침 0 인지 잰다(지침 4-3절 「폭 검증은 훑어서」).
// 네 폭만 재면 브레이크포인트 사이 구멍을 놓친다 — 1400·1200·700px 에서 넘친 적이 있다.
import { chromium } from 'playwright';
import path from 'node:path';

const files = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const f of files) {
  const ctx = await browser.newContext();
  const pg = await ctx.newPage();
  const jsErrors = [];
  pg.on('pageerror', (e) => jsErrors.push(String(e).slice(0, 160)));
  pg.on('console', (m) => { if (m.type() === 'error') jsErrors.push(m.text().slice(0, 160)); });
  await pg.goto('file://' + path.resolve(f), { waitUntil: 'load' });

  let worstDoc = 0, worstDocW = 0, worstTbl = 0, worstTblW = 0, worstName = '';
  const bad = [];
  for (let w = 340; w <= 1920; w += 20) {
    await pg.setViewportSize({ width: w, height: 900 });
    const r = await pg.evaluate(() => {
      const doc = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
      let tbl = 0, name = '';
      document.querySelectorAll('table.data').forEach((t) => {
        const wrap = t.closest('.table-wrap') || t.parentElement;
        const over = t.scrollWidth - wrap.clientWidth;
        if (over > tbl) { tbl = over; name = (t.previousElementSibling?.innerText || t.querySelector('th')?.innerText || '').slice(0, 30); }
      });
      return { doc, tbl, name };
    });
    if (r.doc > worstDoc) { worstDoc = r.doc; worstDocW = w; }
    if (r.tbl > worstTbl) { worstTbl = r.tbl; worstTblW = w; worstName = r.name; }
    if (r.doc > 1 || r.tbl > 1) bad.push(`${w}px doc+${r.doc} tbl+${r.tbl} ${r.name}`);
  }

  // 열 수 불일치 · 반대언어 노출 · 화면 중복
  const extra = await pg.evaluate(() => {
    let colMismatch = 0;
    document.querySelectorAll('table.data').forEach((t) => {
      const head = t.querySelector('thead tr');
      if (!head) return;
      const n = [...head.children].reduce((a, c) => a + (c.colSpan || 1), 0);
      t.querySelectorAll('tbody tr').forEach((tr) => {
        const m = [...tr.children].reduce((a, c) => a + (c.colSpan || 1), 0);
        if (m !== n && ![...tr.children].some((c) => (c.colSpan || 1) > 1)) colMismatch++;
      });
    });
    const ko = document.querySelectorAll('[data-lang-ko]').length;
    const en = document.querySelectorAll('[data-lang-en]').length;
    // 이름 칸 안에 같은 줄이 두 번
    let dupSub = 0;
    document.querySelectorAll('table.data tbody tr').forEach((tr) => {
      const th = tr.querySelector('th'); if (!th) return;
      const t = th.innerText.split('\n').map((x) => x.trim()).filter((x) => x.length > 8);
      const c = {}; t.forEach((x) => (c[x] = (c[x] || 0) + 1));
      if (Object.values(c).some((v) => v > 1)) dupSub++;
    });
    return { colMismatch, ko, en, dupSub };
  });

  console.log(`== ${path.basename(f)}`);
  console.log(`   문서 넘침 최대 ${worstDoc}px @${worstDocW}px · 표 넘침 최대 ${worstTbl}px @${worstTblW}px ${worstName}`);
  console.log(`   열 수 불일치 ${extra.colMismatch} · 이름칸 중복 ${extra.dupSub} · 한/영 ${extra.ko}:${extra.en} · JS 오류 ${jsErrors.length}`);
  if (bad.length) console.log('   넘친 폭: ' + bad.slice(0, 12).join(' | '));
  if (jsErrors.length) console.log('   JS: ' + jsErrors.slice(0, 3).join(' | '));
  await ctx.close();
}
await browser.close();
