/**
 * 보유 계좌가 여러 개인 경우.
 *
 * 연금저축은 한 금융기관에 여러 개를 둘 수 있고, IRP 도 금융기관마다 하나씩
 * 가질 수 있다. 연금수령연차는 계좌마다 따로 산정되므로, 계좌를 하나로
 * 뭉뚱그리면 더 유리한 선택지를 놓친다. 그래서 목록으로 받는다.
 */
const { openApp, fillCase, field, button, setAccounts, verdictText, selectedAccount,
  scheduleRows, printSheet, pdfPageCount, DEL_RE, A4_CONTENT_PX } = require('./helpers');

const num = (s) => {
  const m = String(s).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
};

const cards = (page) =>
  page.locator('.screen-only .space-y-3.mb-6 > div')
    .evaluateAll((ds) => ds.map((d) => d.innerText.replace(/\s+/g, ' ').trim()));

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({ stubPrint: true });
  try {
    // ── 같은 종류를 여러 개 넣어도 각자 따로 평가된다 ─────────────
    // 1968년생(만 58세)이 DB 퇴직. 연금저축 3개의 가입일이 모두 달라
    // 연차가 9 / 6 / 2 로 갈린다.
    await fillCase(page, {
      name: '복수계좌', birth: '680505', system: 'DB', joinDate: '2016-04-01',
      amount: 300000000, deferredTax: 12000000,
      accounts: [
        { kind: 'pension', name: '미래에셋', join: '2008-03-03', balance: 60000000 },
        { kind: 'pension', name: '타사', join: '2012-11-01', balance: 30000000 },
        { kind: 'pension', join: '2022-05-01', balance: 10000000 },
        { kind: 'irp', name: '미래에셋', join: '2016-05-02', balance: 40000000 }
      ],
      mode: '기간 균등 분할', years: 20, rate: 0
    });

    const cs = await cards(page);
    t.is(cs.length, 6, '보유 4개 + 신규 2개 = 후보 6개');
    for (const nm of ['연금저축 1', '연금저축 2', '연금저축 3', 'IRP 1']) {
      t.ok(cs.some((c) => c.startsWith(nm)), '후보에 ' + nm + ' 이 있음');
    }

    // 2008년·2012년 가입은 둘 다 2013.3.1 이전이라 기산연차 6.
    // 만 55세가 된 2023년부터 3년 누적되어 둘 다 9년차다.
    t.includes(cs.find((c) => c.startsWith('연금저축 1')), '9년차', '2008년 가입 → 9년차');
    t.includes(cs.find((c) => c.startsWith('연금저축 2')), '9년차', '2012년 가입도 똑같이 9년차');
    // 2022년 가입이면 가입 5년은 2027년에나 차지만, 퇴직급여가 들어오면 5년 요건이
    // 면제되므로 올해가 기산연도가 되어 1년차로 출발한다.
    t.includes(cs.find((c) => c.startsWith('연금저축 3')), '1년차', '2022년 가입 → 1년차');

    // 가장 높은 연차를 가진 계좌가 추천된다.
    // verdictText 에는 option 들이 섞여 들어오므로 '선택된' 것만 본다.
    const sel = await selectedAccount(page);
    t.includes(sel, '9년차', '가장 높은 연차가 추천됨');
    t.includes(sel, '연금저축 1', '동점 중 첫 계좌가 잡힘');
    t.includes(await verdictText(page), '동점', '9년차가 둘이라 동점 안내가 뜸');

    // ── 계좌를 하나 더 넣으면 판정이 바뀐다 ────────────────────────
    // 같은 조건에서 2005년 가입 계좌가 하나 더 있으면 그것도 9년차이고,
    // 계좌가 빠져 있었다면 이 선택지를 아예 못 봤을 것이다.
    const before = (await scheduleRows(page))[0];
    await button(page, '판정').click();
    await button(page, '연금저축 3 삭제').click();
    await page.waitForTimeout(400);
    t.is(await page.getByRole('button', { name: DEL_RE }).count(), 3, '삭제하면 후보에서도 빠짐');
    t.ok(!(await cards(page)).some((c) => c.startsWith('연금저축 3')), '삭제한 계좌는 후보에 없음');

    // ── 합산은 계좌별로 고른다 ────────────────────────────────────
    await field(page, '연금저축 2 시뮬레이션 합산').check();
    await page.waitForTimeout(500);
    const merged = (await scheduleRows(page))[0];
    t.ok(num(merged[3]) > num(before[3]),
      '합산을 켜면 기초자산이 늘어난다 (' + num(before[3]) + ' → ' + num(merged[3]) + '만원)');

    // 연차가 같은 계좌끼리 합치면 경고가 뜨지 않는다 (둘 다 9년차)
    await button(page, '인출 스케줄').click();
    await page.waitForTimeout(300);
    let body = await page.locator('.screen-only').first().innerText();
    t.excludes(body, '합산 주의', '연차가 같은 계좌끼리 합치면 경고 없음');

    // 연차가 다른 계좌를 합치면 경고가 뜬다
    await button(page, '판정').click();
    await field(page, 'IRP 1 시뮬레이션 합산').check();   // IRP 1 은 연차가 다르다
    await page.waitForTimeout(500);
    await button(page, '인출 스케줄').click();
    await page.waitForTimeout(300);
    body = await page.locator('.screen-only').first().innerText();
    t.includes(body, '합산 주의', '연차가 다른 계좌를 합치면 경고');
    t.includes(body, 'IRP 1', '경고에 어느 계좌인지 표시');

    // ── 수수료는 계좌마다 따로 먹는다 ─────────────────────────────
    await button(page, '판정').click();
    t.includes(await selectedAccount(page), '연금저축 1', '수수료를 넣기 전에는 연금저축 1');
    await field(page, '연금저축 1 연간 수수료').fill('0.5');
    await page.waitForTimeout(600);
    t.includes(await selectedAccount(page), '연금저축 2',
      '같은 9년차면 수수료가 싼 쪽으로 넘어감');
    t.includes(await selectedAccount(page), '수수료 없음', '넘어간 계좌는 수수료가 0');
    t.is(await field(page, '연금저축 2 연간 수수료').inputValue(), '0',
      '다른 계좌의 수수료 입력칸은 그대로');

    // 되돌리면 다시 연금저축 1 (음성 대조)
    await field(page, '연금저축 1 연간 수수료').fill('0');
    await page.waitForTimeout(600);
    t.includes(await selectedAccount(page), '연금저축 1', '수수료를 되돌리면 원래 계좌로');

    // ── 계좌가 많아도 A4 한 장 ────────────────────────────────────
    await setAccounts(page, [
      { kind: 'pension', name: '미래에셋', join: '2008-03-03', balance: 60000000 },
      { kind: 'pension', name: '가나증권', join: '2012-11-01', balance: 30000000 },
      { kind: 'pension', name: '다라은행', join: '2015-02-01', balance: 20000000 },
      { kind: 'irp', name: '미래에셋', join: '2016-05-02', balance: 40000000 },
      { kind: 'irp', name: '마바증권', join: '2018-07-02', balance: 25000000 },
      { kind: 'irp', name: '사아은행', join: '2021-09-02', balance: 15000000 }
    ]);
    await field(page, '수령 기간').fill('30');
    await page.waitForTimeout(500);
    const s = await printSheet(page);
    t.ok(s.fitsA4, '계좌 6개 + 30년 수령에서도 A4 한 장 (' + s.height + '/' + A4_CONTENT_PX + 'px)');
    t.includes(s.text, '외 3건', '인쇄물에는 3건까지 적고 나머지는 개수로 줄임');
    t.is(await pdfPageCount(page), 1, '계좌 6개에서도 PDF 1페이지');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
