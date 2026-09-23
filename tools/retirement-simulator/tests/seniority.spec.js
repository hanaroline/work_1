/**
 * 연금수령연차 - 사내 연금 업무 Q&A 의 계산 예제를 그대로 재현한다.
 *
 * 예제가 연차와 한도를 숫자까지 확정해 주므로, 앱이 스스로 계산한 값을
 * 그 숫자와 맞대어 본다. 앱의 공식을 다시 쓰는 대신 외부에서 주어진
 * 정답과 대조하는 것이라 검산으로서 더 강하다.
 *
 * 예제는 모두 1968.5.5 생이 2026.3 에 퇴직하는 상황이다. 앱은 '오늘'을
 * 퇴직 시점으로 보므로 2026년에 실행할 때만 같은 값이 나온다.
 * 다른 해에 실행하면 기준연도가 달라지므로 연차를 보정해 비교한다.
 */
const { openApp, fillCase, field, button, scheduleRows } = require('./helpers');

const num = (s) => {
  const m = String(s).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
};

const THIS_YEAR = new Date().getFullYear();
const BIRTH = '680505';                 // 1968.5.5 생
const Y55 = 1968 + 55;                  // 만 55세가 되는 해 = 2023

/** 첫 회차의 연차와 한도를 읽는다 */
async function firstRow(page) {
  const rows = await scheduleRows(page);
  return { limitYear: num(rows[0][1]), limit: num(rows[0][4]), raw: rows[0] };
}

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // ── 퇴직연금 미가입 + 신규 계좌 → 1년차 ────────────────────────
    // 계좌 개설일이 2013.3.1 이후이고 퇴직연금도 미가입이라 6년차 특례 대상이 아니다.
    // 기산연도는 퇴직금이 입금된 해(= 올해). 1억 ÷ (11-1) × 120% = 1,200만원.
    await fillCase(page, {
      name: 'Q63', birth: BIRTH, system: 'SEV', joinDate: '2000-01-03',
      legal: 100000000, honor: 0, deferredTax: 0,
      scope: '퇴직금 단독', mode: '기간 균등 분할', years: 30, rate: 0
    });
    let r = await firstRow(page);
    t.is(r.limitYear, 1, '퇴직금제도 + 신규계좌 → 1년차');
    t.near(r.limit, 1200, 1, '1년차 한도 1,200만원');

    // ── 2013.3.1 이전 DB 가입자 + 신규 계좌 전액 입금 → 6년차 ──────
    // 가입일자는 신규 계좌 그대로지만 기산연차만 6으로 시작한다(시행령 §40의2④1).
    // 1억 ÷ (11-6) × 120% = 2,400만원.
    await button(page, 'DB').click();
    await field(page, '제도 가입일').fill('2011-11-01');
    await field(page, '퇴직급여').fill('100000000');
    await page.waitForTimeout(400);
    r = await firstRow(page);
    t.is(r.limitYear, 6, '2013.3.1 이전 DB + 신규계좌 전액입금 → 6년차');
    t.near(r.limit, 2400, 1, '6년차 한도 2,400만원');

    // 같은 DB 라도 가입일이 2013.3.1 이후면 특례가 없다 (음성 대조)
    await field(page, '제도 가입일').fill('2014-11-01');
    await page.waitForTimeout(400);
    r = await firstRow(page);
    t.is(r.limitYear, 1, '2013.3.1 이후 DB 는 신규계좌 특례 없음');

    // ── 같은 DB 라도 '기존' 계좌에 넣으면 특례가 없다 ──────────────
    // 신규 개설 계좌에 전액 입금할 때만 6년차다. 2022년 개설 계좌에 넣으면 1년차.
    // (1억 + 1천만) ÷ (11-1) × 120% = 1,320만원.
    await fillCase(page, {
      name: 'Q66', birth: BIRTH, system: 'DB', joinDate: '2011-11-01',
      amount: 100000000, deferredTax: 0,
      pension: { join: '2022-01-03', balance: 10000000 },
      scope: '기존 연금저축 합산', mode: '기간 균등 분할', years: 30, rate: 0
    });
    // 자동 추천은 6년차인 신규 계좌다. 기존 계좌를 일부러 골라 비교한다.
    await button(page, '판정').click();
    await page.waitForTimeout(300);
    await page.locator('select').first().selectOption('ex-pension');
    await page.waitForTimeout(500);
    r = await firstRow(page);
    t.is(r.limitYear, 1, '2013.3.1 이전 DB 라도 기존 계좌 입금이면 1년차');
    t.near(r.limit, 1320, 1, '1년차 한도 1,320만원 (퇴직금 1억 + 기존 1천만)');

    // 자동 추천으로 되돌리면 신규 계좌(6년차)가 다시 잡힌다
    await button(page, '판정').click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '자동 추천으로 되돌리기', exact: true }).click();
    await page.waitForTimeout(500);
    r = await firstRow(page);
    t.is(r.limitYear, 6, '자동 추천은 6년차를 살리는 신규 계좌');

    // ── 구 계좌 + 만 55세를 이미 지남 → 연차가 누적된다 ────────────
    // 2008년 개설 계좌라 기산연차는 6. 만 55세가 된 2023년에 이미 개시 요건을
    // 갖췄으므로 그 해부터 해마다 1씩 쌓인다. 2026년이면 9년차.
    // (2억 + 6천만) ÷ (11-9) × 120% = 1억 5,600만원.
    await fillCase(page, {
      name: 'Q67', birth: BIRTH, system: 'SEV', joinDate: '2000-01-03',
      legal: 200000000, honor: 0, deferredTax: 0,
      pension: { join: '2008-03-03', balance: 60000000 },
      scope: '기존 연금저축 합산', mode: '기간 균등 분할', years: 30, rate: 0
    });
    const accrued = 6 + (THIS_YEAR - Y55);        // 2026년이면 9
    r = await firstRow(page);
    t.is(r.limitYear, accrued, '구 계좌는 만 55세 도달 해부터 연차가 누적됨 (' + accrued + '년차)');
    if (accrued < 11) {
      t.near(r.limit, Math.round(260000000 / (11 - accrued) * 1.2 / 10000), 1,
        accrued + '년차 한도');
    }

    // ── 과거 퇴직: 퇴직한 해부터 연차가 쌓여 있다 ──────────────────
    // 만 55세를 넘긴 뒤 2년 전에 퇴직해 신규 계좌로 전액 받았다면,
    // 기산연도가 그 해이므로 지금은 1년차가 아니라 3년차다.
    const twoYearsAgo = THIS_YEAR - 2;
    await fillCase(page, {
      name: '과거퇴직', birth: BIRTH, system: 'SEV', joinDate: '2000-01-03',
      retireDate: twoYearsAgo + '-03-02',
      legal: 100000000, honor: 0, deferredTax: 0, pension: false, irp: false,
      scope: '퇴직금 단독', mode: '기간 균등 분할', years: 30, rate: 0
    });
    r = await firstRow(page);
    t.is(r.limitYear, 3, twoYearsAgo + '년 퇴직 → 올해는 3년차');
    t.near(r.limit, Math.round(100000000 / (11 - 3) * 1.2 / 10000), 1, '3년차 한도 1,500만원');

    // 같은 조건에서 퇴직일만 올해로 되돌리면 1년차 (음성 대조)
    await field(page, '퇴직일').fill(THIS_YEAR + '-03-02');
    await page.waitForTimeout(500);
    r = await firstRow(page);
    t.is(r.limitYear, 1, '올해 퇴직이면 1년차');
    t.near(r.limit, 1200, 1, '1년차 한도 1,200만원');

    // ── 퇴직 시점의 나이로 이전 가능 여부를 판정한다 ────────────────
    // 지금은 만 55세를 넘겼어도, 퇴직 당시 55세 미만이었다면 법정퇴직금은
    // IRP 로만 지급되었어야 한다. 오늘 나이로 판정하면 이걸 놓친다.
    await fillCase(page, {
      name: '조기퇴직', birth: BIRTH, system: 'SEV', joinDate: '2000-01-03',
      retireDate: (Y55 - 2) + '-03-02',          // 만 53세에 퇴직
      legal: 100000000, honor: 50000000, deferredTax: 0
    });
    await button(page, '판정').click();
    await page.waitForTimeout(400);
    const earlyCards = await page.locator('.screen-only .space-y-3.mb-6 > div')
      .evaluateAll((ds) => ds.map((d) => d.innerText.replace(/\s+/g, ' ').trim()));
    const newPension = earlyCards.find((c) => c.startsWith('신규 연금저축'));
    t.includes(newPension, '만 55세 미만', '퇴직 당시 55세 미만이면 법정퇴직금은 연금저축 불가');
    t.includes(newPension, '명예(법정외)퇴직금', '명예퇴직금은 같은 카드에서 가능으로 남음');

    // ── DB → DC 전환자는 전환 전 DB 가입일로 판단한다 ──────────────
    // DC 가입일은 2022년이지만 전환 전 DB 가입일이 2013.3.1 이전이므로
    // 신규 IRP 로 전액 이체하면 6년차 특례를 적용한다.
    await fillCase(page, {
      name: '전환', birth: BIRTH, system: 'DC', joinDate: '2022-01-03',
      retireDate: THIS_YEAR + '-03-02',
      amount: 100000000, deferredTax: 0,
      scope: '퇴직금 단독', mode: '기간 균등 분할', years: 30, rate: 0
    });
    r = await firstRow(page);
    t.is(r.limitYear, 1, '전환 표시 전에는 DC 가입일(2022) 기준이라 1년차');

    await field(page, 'DB 에서 DC 로 전환').check();
    await field(page, '전환 전 DB 가입일').fill('2010-04-01');
    await page.waitForTimeout(500);
    r = await firstRow(page);
    t.is(r.limitYear, 6, '전환 전 DB 가입일이 2013.3.1 이전이면 6년차');
    t.near(r.limit, 2400, 1, '6년차 한도 2,400만원');

    // 전환 전 DB 가입일도 2013.3.1 이후면 특례가 없다 (음성 대조)
    await field(page, '전환 전 DB 가입일').fill('2015-04-01');
    await page.waitForTimeout(500);
    r = await firstRow(page);
    t.is(r.limitYear, 1, '전환 전 DB 가입일이 2013.3.1 이후면 특례 없음');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
