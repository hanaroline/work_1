import { chromium } from 'playwright';
import { TARGET, launchOpts } from './_browser.mjs';
const FILE = TARGET;
const b = await chromium.launch(launchOpts());
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2000);

const sheets = await pg.$$eval('#selSheet option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));
const els = sheets.find(s => /ELS/.test(s.t) && !/부적합/.test(s.t));
await pg.selectOption('#selSheet', els.v);
await pg.waitForTimeout(400);
const opts = await pg.$$eval('#selProduct option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));

const picks = [];
for (const want of ['(ELB)4076', '(ELB)4063', '(ELS)38108', '(ELS)38104']) {
  const o = opts.find(x => x.t.includes(want));
  if (o) picks.push({ want, ...o }); else console.log('  ! 목록에 없음 ' + want);
}

for (const o of picks) {
  await pg.selectOption('#selProduct', o.v);
  await pg.waitForTimeout(500);
  const r = await pg.evaluate(() => {
    const t = document.body.innerText;
    return {
      고난도문구: t.includes('『고난도 금융투자상품』으로서 원금손실 위험이 높으면서도'),
      스텝다운손실사례: t.includes('제30382회'),
      큰손실: t.includes('일시에 큰 손실을 볼 수 있는 상품'),
      이십퍼초과: t.includes('원금의 20%를 초과하는 손실이 발생할 수 있습니다'),
      원금지급형문구: t.includes('만기까지 보유하시는 경우 원금이 지급되도록 설계된 파생결합사채'),
      발행사신용위험: t.includes('원금 지급은 발행회사인'),
      원금보장이라는말: /원금보장형/.test(t),
      확인필요: (t.match(/확인필요\s*(\d+)\s*건/) || [])[1] || '0'
    };
  });
  const y = v => v ? 'O' : '-';
  console.log('\n── ' + o.t.slice(0, 46));
  console.log('   고난도 안내 ' + y(r.고난도문구) + ' · 스텝다운 손실사례 ' + y(r.스텝다운손실사례) +
    ' · 「일시에 큰 손실」 ' + y(r.큰손실) + ' · 「20% 초과 손실」 ' + y(r.이십퍼초과));
  console.log('   원금지급형 안내 ' + y(r.원금지급형문구) + ' · 발행사 신용위험 ' + y(r.발행사신용위험) +
    ' · 「원금보장형」 이라는 말 ' + y(r.원금보장이라는말) + ' · 확인필요 ' + r.확인필요 + '건');
}
console.log('\n페이지 오류 ' + errs.length);
errs.slice(0, 4).forEach(e => console.log('  ' + e.slice(0, 200)));
await b.close();
