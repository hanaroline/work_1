import { chromium } from 'playwright';
import { TARGET, launchOpts } from './_browser.mjs';
const FILE = TARGET;

/* 사내 「투자자성향 결과별 안내사항」 화면에서 옮긴 원문 — 화면이 이것을 그대로 내는지 본다 */
const WANT = {
  '성장형': '성장형 고객은 시장평균수익률을 훨씬 넘어서는 높은 수준의 투자 수익을 추구하며, 이를 위해 자산가치의 변동에 따른 손실위험을 적극 수용하여 투자자금의 대부분을 주식, 주식형펀드 또는 파생상품 등에 투자하는 고객 유형입니다.',
  '성장추구형': '성장추구형 고객은 투자원금을 보전하는 것 보다는 투자수익을 추구하는 타입입니다. 따라서, 투자자금의 상당 부분을 주식, 주식형펀드 등에 투자하는 고객 유형입니다.',
  '위험중립형': '위험중립형 고객은 투자수익에는 그에 상응하는 투자위험이 있음을 충분히 인식하고 있는 타입으로, 예.적금보다 상당히 높은 수익을 기대할 수 있다면 손실을 감수할 수 있는 고객 유형입니다.',
  '안정추구형': '안정추구형 고객은 투자원금의 손실위험은 최소화하고 안정적인 투자 수익을 목표로 하는 타입 입니다. 다만, 수익을 위해 단기적인 손실을 수용할 수 있으며, 자산 중 일부를 변동성 있는 상품에 투자할 의향이 있는 고객 유형입니다.',
  '안정형': '안정형 고객은 예금 또는 적금 수준의 수익률을 기대하며, 투자원금에 손실이 발생하는 것을 원하지 않는 고객 유형입니다.'
};

const b = await chromium.launch(launchOpts());
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e)));

/* 옛 문장이 저장돼 있던 화면을 흉내내 이관이 도는지도 본다 */
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2000);
const LS = 'ss_state_v1';
console.log('저장통 키 ' + LS);
await pg.evaluate((k) => {
  const o = JSON.parse(localStorage.getItem(k) || '{}');
  o.ctx = Object.assign({}, o.ctx, {
    custProfile: '위험중립형',
    /* 지난 판이 쓰던 문장 (원문과 다른 것) */
    custProfileMeaning: '투자에 상응하는 투자위험이 있음을 충분히 인식하고 있으며, 예·적금보다 높은 수익을 기대할 수 있다면 일정 수준의 손실위험을 감수할 수 있는 고객 유형입니다.'
  });
  localStorage.setItem(k, JSON.stringify(o));
}, LS);
await pg.reload();
await pg.waitForTimeout(2500);
const migrated = await pg.$eval('#profMeaning', e => e.value);
console.log('\n=== 옛 문장이 저장된 화면 이관 ===');
console.log('   ' + (migrated === WANT['위험중립형'] ? 'OK — 원문으로 갈렸습니다' : 'X — 갈리지 않았습니다: ' + migrated.slice(0, 60)));

const sheets = await pg.$$eval('#selSheet option', o => o.map(x => ({ v: x.value, t: x.textContent.trim() })));
const els = sheets.find(s => /ELS/.test(s.t) && !/부적합/.test(s.t));
await pg.selectOption('#selSheet', els.v);
await pg.waitForTimeout(400);
const opts = await pg.$$eval('#selProduct option', o => o.map(x => x.value).filter(Boolean));
await pg.selectOption('#selProduct', opts[0]);
await pg.waitForTimeout(400);

console.log('\n=== 다섯 성향 · 칸 값과 스크립트 문장 ===');
let bad = 0;
for (const p of Object.keys(WANT)) {
  await pg.selectOption('#selProfile', p);
  await pg.waitForTimeout(450);
  const r = await pg.evaluate(() => {
    const t = document.body.innerText;
    return {
      칸: document.querySelector('#profMeaning').value,
      대사: (t.match(/투자자성향 분석결과를 보면[\s\S]{0,600}?서명 부탁드립니다\./) || [''])[0],
      확인필요: (t.match(/확인필요\s*(\d+)\s*건/) || [])[1] || '0',
      의미미완: /투자자성향의 의미/.test(t)
    };
  });
  const 칸OK = r.칸 === WANT[p];
  const 대사OK = r.대사.includes(WANT[p]);
  const 중복 = new RegExp("'" + p + "' 고객은").test(r.대사);
  if (!칸OK || !대사OK || 중복 || r.의미미완) bad++;
  console.log('\n── ' + p);
  console.log('   칸 = 원문 ' + (칸OK ? 'O' : 'X') + ' · 스크립트에 원문 실림 ' + (대사OK ? 'O' : 'X')
    + ' · 성향명 중복 ' + (중복 ? 'X 있음' : '- 없음')
    + ' · 확인필요 ' + r.확인필요 + '건 · 의미 미완 ' + (r.의미미완 ? 'X' : '-'));
  console.log('   대사 : ' + r.대사.replace(/\n/g, ' ⏎ ').slice(0, 280));
  if (!칸OK) console.log('   칸값 : ' + r.칸.slice(0, 160));
}

console.log('\n어긋난 성향 ' + bad + '개 · 페이지 오류 ' + errs.length);
errs.slice(0, 4).forEach(e => console.log('  ' + e.slice(0, 200)));
await b.close();
