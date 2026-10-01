import { chromium } from 'playwright';
import { TARGET, launchOpts } from './_browser.mjs';
import path from 'path';
const ROOT = path.dirname(path.dirname(path.dirname(TARGET)));
const b = await chromium.launch(launchOpts());

/** 한 파일에서 지목한 펀드들의 「투자설명서에서 확인」 건수를 센다 */
async function measure(file, picks) {
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file://' + file);
  await pg.waitForTimeout(1900);
  const sheets = await pg.$$eval('#selSheet option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));
  const sh = sheets.find(s => /펀드 · 국내 · 적합/.test(s.t));
  await pg.selectOption('#selSheet', sh.v);
  await pg.waitForTimeout(350);
  await pg.evaluate(() => {
    const x = [...document.querySelectorAll('#segPart button')].find(e => /설명의무/.test(e.textContent));
    if (x) x.click();
  });
  await pg.waitForTimeout(350);
  const opts = await pg.$$eval('#selProduct option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));
  const out = [];
  for (const want of picks) {
    const o = opts.find(x => x.t.includes(want));
    if (!o) { out.push({ want, miss: null, note: '목록에 없음' }); continue; }
    await pg.selectOption('#selProduct', o.v);
    await pg.waitForTimeout(420);
    const r = await pg.evaluate(() => {
      const t = document.body.innerText;
      const m = t.match(/투자설명서에서 확인\s*(\d+)\s*건/);
      const st = t.match(/투자설명서 등록 상태\s*\n?\s*(\S+)/);
      const src = t.match(/설명서 판독:\s*([^\n]+)/);
      const pct = t.match(/자동완성률\s*\n?\s*(\d+)/);
      return {
        miss: m ? Number(m[1]) : 0,
        state: st ? st[1] : '?',
        src: src ? src[1].trim() : '-',
        pct: pct ? pct[1] : '?'
      };
    });
    out.push({ want, ...r, name: o.t.slice(0, 44) });
  }
  await pg.close();
  return { out, errs };
}

const PICKS = ['BNK고배당주주가치목표전환형증권투자신탁(채권)', '삼성알아서투자해주는반도체목표전환형',
  '다올코리아AI테크목표전환형증권투자신탁2', '신한코어패러다임목표전환형증권투자신탁2'];

for (const [label, file] of [
  ['v3 (금투협 없음)', path.join(path.dirname(TARGET), 'sales-script-standalone-v3.html')],
  ['v4 (금투협 붙임)', TARGET]
]) {
  const { out, errs } = await measure(file, PICKS);
  console.log('\n=== ' + label + ' ===');
  for (const r of out) {
    if (r.miss === null) { console.log('  (' + r.note + ') ' + r.want.slice(0, 40)); continue; }
    console.log('  확인필요 ' + String(r.miss).padStart(3) + '건 · 자동완성 ' + String(r.pct).padStart(3) +
      '% · ' + r.state.padEnd(8) + ' · ' + r.src.slice(0, 22).padEnd(24) + ' · ' + r.name);
  }
  console.log('  페이지 오류 ' + errs.length);
}
await b.close();
