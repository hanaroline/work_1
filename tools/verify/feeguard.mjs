import { chromium } from 'playwright';
import { TARGET, launchOpts } from './_browser.mjs';
const b = await chromium.launch(launchOpts());
const pg = await b.newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e)));
await pg.goto('file://' + TARGET);
await pg.waitForTimeout(2500);
const sheets = await pg.$$eval('#selSheet option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));
await pg.selectOption('#selSheet', sheets.find(s => /IRP/.test(s.t)).v);
await pg.waitForTimeout(600);

/* 판독값이 엉망이던 종목들이 화면에서 걸러지는지 */
for (const want of ['삼성글로벌CoreAI목표전환형증권투자신탁3', '신영중기채권', '하나대체투자미국부동산투자신탁 1']) {
  const opts = await pg.$$eval('#selProduct option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));
  const o = opts.find(x => x.t.includes(want));
  if (!o) { console.log('  - 목록에 없음 ' + want); continue; }
  await pg.selectOption('#selProduct', o.v);
  await pg.waitForTimeout(700);
  const r = await pg.evaluate(() => {
    const t = document.body.innerText;
    const m = t.match(/총보수는\s*연[^\n]{0,90}/);
    /* 총보수 자리가 값인지 확인필요 칩인지 가른다 — 칩은 제 이름표를 글자로 내보내므로
       innerText 만 보면 이름표가 값처럼 읽힌다 (예: 「연 펀드 총보수 (연)%」). */
    const 칩 = [...document.querySelectorAll('.v.miss')]
      .filter(el => el.dataset.key === 'clsExp' || el.dataset.key === 'clsExpClass')
      .map(el => el.textContent.trim());
    return { 문장: m ? m[0] : '(총보수 문장 없음)', 확인필요칩: 칩,
      이상값: /연\s*[\d,]{3,}/.test(t) };
  });
  console.log('\n── ' + o.t.slice(0, 48));
  if (r.확인필요칩.length) {
    console.log('   확인필요로 남음 — 칩 ' + r.확인필요칩.join(' · '));
    console.log('   (아래 문장의 보수 자리는 값이 아니라 칩 이름표입니다)');
  }
  console.log('   ' + r.문장);
  console.log('   말도 안 되는 수치 노출 : ' + (r.이상값 ? 'X 있음' : '- 없음'));
}
console.log('\n페이지 오류 ' + errs.length);
await b.close();
