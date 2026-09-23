/** 판정 로직 - 계좌 선택, 분할 배정, 이전 제한 */
const { openApp, fillCase, field, button, verdictText } = require('./helpers');

const cards = (page) =>
  page.locator('.screen-only .space-y-3.mb-6 > div')
    .evaluateAll((ds) => ds.map((d) => d.innerText.replace(/\s+/g, ' ').trim()));

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // --- 구 연금저축(2013 이전·잔고 보유) 이 있으면 6년차 기산 ---
    await fillCase(page, {
      name: '김미래', birth: '680410', system: 'SEV', joinDate: '1995-03-02',
      legal: 200000000, honor: 100000000, deferredTax: 12000000,
      pension: { join: '2010-06-15', balance: 30000000 }, years: 10
    });
    let v = await verdictText(page);
    t.includes(v, '기존 연금저축', '구 연금저축 보유 시 기존 계좌 추천');
    t.includes(v, '6년차', '6년차 기산으로 판정');

    // --- 2013.3 이후 가입 DC 는 구 연금계좌로 이전 불가 ---
    await button(page, 'DC').click();
    await field(page, '제도 가입일').fill('2016-04-01');
    await field(page, '퇴직급여').fill('300000000');
    await page.waitForTimeout(500);
    const cs = await cards(page);
    const legacyCard = cs.find((c) => c.startsWith('기존 연금저축'));
    // 직접 이체는 §40의4①2 로 막히지만, 60일 내 입금 경로(§146②)가 있어 단정하지 않고 조건부로 둔다
    t.includes(legacyCard, '조건부', '2016년 가입 DC → 구 연금저축은 조건부');
    t.includes(legacyCard, '직접 이체는 불가', '직접 이체가 막힌다는 점을 명시');
    t.includes(legacyCard, '§40의4', '근거 조문을 표시');
    t.includes(legacyCard, '60일', '대체 경로(60일 내 입금)를 안내');
    t.includes(await verdictText(page), '신규 IRP', '자동 추천은 신규 IRP');

    // 조건부는 자동 배정에서 빠지되, 상담자가 수동으로 고를 수는 있어야 한다
    const opts = await page.locator('select').first().locator('option').allInnerTexts();
    t.ok(opts.some((o) => o.includes('기존 연금저축') && o.includes('조건부')),
      '조건부 계좌가 수동 선택 상자에 조건부 표시와 함께 올라옴');
    await page.locator('select').first().selectOption('ex-pension');
    await page.waitForTimeout(500);
    t.includes(await verdictText(page), '기존 연금저축', '수동으로 조건부 계좌를 고를 수 있음');
    t.includes(await verdictText(page), '수동 선택', '수동 선택 표시가 붙음');
    await page.getByRole('button', { name: '자동 추천으로 되돌리기', exact: true }).click();
    await page.waitForTimeout(500);
    t.includes(await verdictText(page), '신규 IRP', '되돌리면 다시 자동 추천');

    // --- DB 는 같은 제한을 받지 않는다 ---
    // 소득세법 시행령 §40의2①2 의 '퇴직연금계좌' 열거에 확정급여형(DB)은 없다.
    // DB 는 가입자별 계좌가 없어 퇴직급여 지급이 '연금계좌 간 이체'가 아니라
    // '퇴직소득의 연금계좌 입금'이므로 §40의4 이체 제한 대상이 아니다.
    await button(page, 'DB').click();
    await page.waitForTimeout(400);
    const dbCards = await cards(page);
    const dbLegacy = dbCards.find((c) => c.startsWith('기존 연금저축'));
    t.excludes(dbLegacy, '조건부', '2016년 가입 DB 는 조건 없이 구 연금저축으로 이전 가능');
    t.excludes(dbLegacy, '§40의4', 'DB 에는 이체 제한 사유가 붙지 않음');
    t.includes(dbLegacy, '6년차', 'DB 도 구계좌의 6년차 기산을 쓸 수 있음');
    t.includes(await verdictText(page), '기존', 'DB 는 기존 구계좌가 추천됨');

    // 같은 조건에서 DC 로 바꾸면 다시 막혀야 한다 (두 제도가 실제로 다르게 판정되는지)
    await button(page, 'DC').click();
    await page.waitForTimeout(400);
    t.includes((await cards(page)).find((c) => c.startsWith('기존 연금저축')), '조건부',
      'DC 로 바꾸면 같은 조건에서 조건부로 판정');

    // --- 만 55세 미만: 법정퇴직금은 IRP 의무이전, 명예퇴직금만 연금저축 가능 ---
    await fillCase(page, {
      name: '', birth: '760820', system: 'SEV', joinDate: '2000-01-03',
      legal: 150000000, honor: 50000000, deferredTax: 7000000,
      pension: { join: '2011-05-20', balance: 20000000 }
    });
    v = await verdictText(page);
    t.includes(v, '분할', '재원별 분할 입금으로 판정');
    t.includes(v, '법정퇴직금', '법정퇴직금 배정을 표시');
    t.includes(v, '명예(법정외)퇴직금', '명예퇴직금 배정을 표시');
    const penCard = (await cards(page)).find((c) => c.startsWith('기존 연금저축'));
    t.includes(penCard, '만 55세 미만', '55세 미만 사유를 표시');
    t.includes(penCard, '근퇴법', '근거 법령을 표시');

    // --- 가입일 선후는 우열을 가르지 않는다 (둘 다 2013 이전이면 동점) ---
    await fillCase(page, {
      name: '홍길동', birth: '710315', system: 'DC', joinDate: '2000-07-01',
      amount: 350000000, deferredTax: 7500000,
      pension: { join: '2003-03-02', balance: 75000000 },
      irp: { join: '2002-03-02', balance: 85000000 }
    });
    v = await verdictText(page);
    t.includes(v, '기존 IRP', 'DC 는 IRP 로 직접 이전되므로 IRP 우선');
    t.includes(v, '동점', '세법상 동점임을 안내');
    t.includes(v, '가입일이 더 빠르다고 유리하지 않습니다', '가입일 선후는 무관함을 명시');

    // --- 수수료가 동점을 가른다 ---
    await field(page, '기존 IRP 연간 수수료').fill('0.4');
    await page.waitForTimeout(500);
    t.includes(await verdictText(page), '기존 연금저축', 'IRP 수수료 0.4% → 연금저축으로 뒤집힘');
    await field(page, '기존 연금저축 연간 수수료').fill('0.4');
    await page.waitForTimeout(500);
    t.includes(await verdictText(page), '기존 IRP', '둘 다 0.4% → 다시 IRP');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
