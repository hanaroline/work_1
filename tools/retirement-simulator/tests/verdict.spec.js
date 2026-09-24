/** 판정 로직 - 계좌 선택, 분할 배정, 이전 제한 */
const { openApp, fillCase, field, button, verdictText, pickAccount, selectedAccount } = require('./helpers');

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
    // '어느 계좌가 골라졌나' 는 선택 상자의 선택된 항목으로 본다.
    // verdictText 에는 고를 수 있는 항목들이 통째로 섞여 들어와 구분이 안 된다.
    t.includes(await selectedAccount(page), '연금저축 1', '구 연금저축 보유 시 기존 계좌 추천');
    t.includes(await verdictText(page), '6년차', '6년차 기산으로 판정');

    // --- DC 는 연금저축계좌로 직접 입금할 수 없다 (연령 불문) ---
    // 소득세법이 퇴직연금계좌(DC·IRP)와 연금저축계좌 간 상호 이체를 금지한다(시행령 §40의4①1).
    // 더해서 2016년 가입 DC 는 2013.3.1 전 가입 계좌로도 입금할 수 없다(§40의4①2).
    await button(page, 'DC').click();
    await field(page, '제도 가입일').fill('2016-04-01');
    await field(page, '퇴직급여').fill('300000000');
    await page.waitForTimeout(500);
    const cs = await cards(page);
    const legacyCard = cs.find((c) => c.startsWith('연금저축 1'));
    t.includes(legacyCard, '불가', '2016년 가입 DC → 구 연금저축은 불가');
    t.includes(legacyCard, '§40의4', '근거 조문을 표시');
    t.includes(legacyCard, '2단계', '만 55세 이상이므로 IRP 경유 경로를 안내');
    // 신규 연금저축도 마찬가지로 막힌다 - 구/신규의 문제가 아니라 계좌 종류의 문제다
    t.includes(cs.find((c) => c.startsWith('신규 연금저축')), '불가',
      'DC 는 신규 연금저축으로도 입금 불가');
    t.includes(await selectedAccount(page), '신규 IRP', '자동 추천은 신규 IRP');

    // 막힌 계좌는 수동 선택 상자에도 올라오지 않는다
    const opts = await page.locator('select').first().locator('option').allInnerTexts();
    t.ok(!opts.some((o) => o.includes('연금저축')),
      '입금 불가한 연금저축은 수동 선택 상자에서 제외');

    // --- DB 는 같은 제한을 받지 않는다 ---
    // 소득세법상 '연금계좌'는 DC·IRP·연금저축계좌·과학기술인연금·중소기업퇴직연금이고
    // DB 는 여기 없다. DB 퇴직금 지급은 '연금계좌 간 이체'가 아니라 '퇴직소득의 입금'이므로
    // 가입일자와 무관하게 어느 계좌로든 넣을 수 있다.
    await button(page, 'DB').click();
    await page.waitForTimeout(400);
    const dbCards = await cards(page);
    const dbLegacy = dbCards.find((c) => c.startsWith('연금저축 1'));
    t.excludes(dbLegacy, '불가', '2016년 가입 DB 는 구 연금저축으로 입금 가능');
    t.excludes(dbLegacy, '§40의4', 'DB 에는 이체 제한 사유가 붙지 않음');
    t.includes(await selectedAccount(page), '연금저축 1', 'DB 는 기존 구계좌가 추천됨');

    // 같은 조건에서 DC 로 바꾸면 다시 막혀야 한다 (두 제도가 실제로 다르게 판정되는지)
    await button(page, 'DC').click();
    await page.waitForTimeout(400);
    t.includes((await cards(page)).find((c) => c.startsWith('연금저축 1')), '불가',
      'DC 로 바꾸면 같은 조건에서 불가로 판정');

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
    const penCard = (await cards(page)).find((c) => c.startsWith('연금저축 1'));
    t.includes(penCard, '만 55세 미만', '55세 미만 사유를 표시');
    t.includes(penCard, '근퇴법', '근거 법령을 표시');

    // --- DC 가입자의 명퇴금은 연금저축계좌로 갈 수 있다 ---
    // DC 규약에 규정된 퇴직급여는 연령 불문 연금저축계좌로 못 가지만, 규약에 규정되지 않은
    // 명퇴금·위로금은 회사가 직접 지급하는 돈이라 제도·연령과 무관하게 갈 수 있다(Q12 첫 문단).
    // 예전에는 DC 에 명퇴금을 넣을 칸이 아예 없어 전액을 규약상 퇴직급여로 보아 '불가' 로 판정했다.
    await fillCase(page, {
      name: 'DC명퇴', birth: '680410', system: 'DC', joinDate: '2016-04-01',
      amount: 200000000, honor: 50000000, deferredTax: 6000000,
      pension: { join: '2003-03-02', balance: 40000000 }, irp: false
    });
    v = await verdictText(page);
    t.includes(v, '분할', 'DC 에서도 재원별 분할 입금이 잡힘');
    t.includes(v, '명예(법정외)퇴직금', '명퇴금이 별도 재원으로 잡힘');
    const dcPen = (await cards(page)).find((c) => c.startsWith('연금저축 1'));
    t.includes(dcPen, '명예(법정외)퇴직금', '연금저축에 명퇴금은 배정 가능');
    t.includes(dcPen, 'DC 퇴직급여', '같은 카드에 규약상 퇴직급여도 표시');
    t.includes(dcPen, '불가', '규약상 DC 퇴직급여는 연금저축 불가');
    // 명퇴금을 0 으로 되돌리면 연금저축은 받을 것이 없어진다 (음성 대조)
    await field(page, '명예퇴직금').fill('0');
    await page.waitForTimeout(500);
    t.excludes(await verdictText(page), '명예(법정외)퇴직금', '명퇴금을 지우면 재원에서 빠짐');

    // --- 가입일 선후는 우열을 가르지 않는다 (둘 다 2013 이전이면 연차가 같다) ---
    // DB 로 두어야 연금저축과 IRP 가 모두 후보로 남는다 (DC 는 연금저축이 막힌다).
    await fillCase(page, {
      name: '홍길동', birth: '710315', system: 'DB', joinDate: '2000-07-01',
      amount: 350000000, deferredTax: 7500000,
      pension: { join: '2003-03-02', balance: 75000000 },
      irp: { join: '2002-03-02', balance: 85000000 }
    });
    t.includes(await selectedAccount(page), 'IRP 1', '퇴직연금 지급액은 IRP 로 직접 이전되므로 IRP 우선');
    v = await verdictText(page);
    t.includes(v, '동점', '세법상 동점임을 안내');
    t.includes(v, '가입일이 더 빠르다고 유리하지 않습니다', '가입일 선후는 무관함을 명시');

    // --- 수수료가 동점을 가른다 ---
    // 계좌 수수료는 IRP 에만 있다. 연금저축계좌는 계좌 단위 수수료가 없고 비용이
    // 편입 상품의 보수로 들어가므로, 입력칸도 두지 않고 판정에서도 0 으로 본다.
    t.is(await field(page, '연금저축 1 연간 수수료').count(), 0, '연금저축계좌에는 수수료 칸이 없다');
    await field(page, 'IRP 1 연간 수수료').fill('0.4');
    await page.waitForTimeout(500);
    t.includes(await selectedAccount(page), '연금저축 1', 'IRP 수수료 0.4% → 연금저축으로 뒤집힘');
    // 되돌리면 다시 IRP (음성 대조 - 수수료가 정말 판정을 움직였는지 본다)
    await field(page, 'IRP 1 연간 수수료').fill('0');
    await page.waitForTimeout(500);
    t.includes(await selectedAccount(page), 'IRP 1', '수수료를 0 으로 되돌리면 다시 IRP');

    // --- 연금이 개시된 계좌는 조건부 ---
    // 연금개시 계좌는 원칙적으로 추가 입금이 막히지만, 당사 계좌라면 퇴직금에 한해
    // 입금할 수 있어 단정하지 않는다. 자동 배정에서는 빼되 수동 선택은 열어 둔다.
    await fillCase(page, {
      name: '개시', birth: '680410', system: 'DB', joinDate: '2016-04-01',
      amount: 200000000, deferredTax: 5000000, pension: false,
      irp: { join: '2005-06-15', balance: 50000000, started: true, fee: 0 }
    });
    const startedCard = (await cards(page)).find((c) => c.startsWith('IRP 1'));
    t.includes(startedCard, '조건부', '연금개시된 계좌는 조건부');
    t.includes(startedCard, '연금이 개시된 계좌', '연금개시를 사유로 표시');
    t.includes(startedCard, '퇴직금에 한해', '당사 계좌의 예외를 안내');
    // verdictText 에는 선택 상자의 option 들도 섞여 들어오므로 '선택된 값'을 직접 본다
    t.includes(await selectedAccount(page), '신규 IRP',
      '조건부 계좌는 자동 배정에서 빠지고 신규 IRP 가 잡힘');

    const startedOpts = await page.locator('select').first().locator('option').allInnerTexts();
    t.ok(startedOpts.some((o) => o.includes('IRP 1') && o.includes('조건부')),
      '조건부 계좌는 수동 선택 상자에 조건부 표시와 함께 올라옴');
    await pickAccount(page, 'IRP 1');
    t.includes(await selectedAccount(page), 'IRP 1', '확인 후 수동으로 고를 수 있음');
    t.includes(await verdictText(page), '수동 선택', '수동 선택 표시가 붙음');

    // 개시 표시를 풀면 다시 자동 배정 대상이 된다 (음성 대조)
    await page.getByRole('button', { name: '자동 추천으로 되돌리기', exact: true }).click();
    await field(page, 'IRP 1 연금개시됨').uncheck();
    await page.waitForTimeout(500);
    t.includes(await selectedAccount(page), 'IRP 1', '개시 표시를 풀면 기존 IRP 가 자동 배정됨');
    t.excludes((await cards(page)).find((c) => c.startsWith('IRP 1')), '조건부',
      '개시 표시를 풀면 조건부도 사라짐');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
