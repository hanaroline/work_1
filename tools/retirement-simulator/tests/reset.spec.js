/** 전체 초기화 - 입력만 비우고 저장된 상담은 남긴다 */
const { openApp, fillCase, field, button } = require('./helpers');

const savedCases = (page) =>
  page.locator('button[title^="불러오기"]').evaluateAll((bs) => bs.map((b) => b.innerText.replace(/\s+/g, ' ').trim()));

const CASE = {
  name: '홍길동', birth: '710315', system: 'SEV', joinDate: '2000-07-01',
  legal: 150000000, honor: 50000000, deferredTax: 7500000,
  pension: { join: '2003-03-02', balance: 75000000 },
  irp: { join: '2002-03-02', balance: 85000000 },
  pastCount: 3, fees: { '기존 IRP': 0.3 },
  scope: '전체 전액 합산', mode: '세법 한도 내 최대', years: 25, rate: 5,
  memo: '초기화 테스트용 메모', memoOnPrint: true
};

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    await fillCase(page, CASE);
    await button(page, '상담 저장').click();
    await page.waitForTimeout(500);
    t.is((await savedCases(page)).length, 1, '초기화 전에 상담 1건 저장');

    // --- 한 번 눌러서는 지워지지 않는다 ---
    await button(page, '전체 초기화').click();
    await page.waitForTimeout(300);
    t.is(await field(page, '고객명').inputValue(), '홍길동', '확인 전에는 입력이 유지됨');
    t.is(await button(page, '초기화 확인').count(), 1, '확인 버튼이 나타남');

    // --- 취소하면 그대로 ---
    await button(page, '초기화 취소').click();
    await page.waitForTimeout(300);
    t.is(await field(page, '고객명').inputValue(), '홍길동', '취소하면 입력이 그대로');
    t.is(await button(page, '초기화 확인').count(), 0, '확인 버튼이 사라짐');

    // --- 확인하면 전부 비워진다 ---
    await button(page, '전체 초기화').click();
    await page.waitForTimeout(250);
    await button(page, '초기화 확인').click();
    await page.waitForTimeout(600);

    t.is(await field(page, '고객명').inputValue(), '', '고객명 비움');
    t.is(await field(page, '생년월일').inputValue(), '', '생년월일 비움');
    t.is(await field(page, '제도 가입일').inputValue(), '', '제도 가입일 비움');
    t.is(await field(page, '이연 퇴직소득세').inputValue(), '', '이연 퇴직소득세 비움');
    t.is(await field(page, '과거 연금 수령 횟수').inputValue(), '0', '과거 수령 횟수 0');
    t.is(await field(page, '상담 메모').inputValue(), '', '메모 비움');
    t.is(await field(page, '상담 메모 인쇄물 포함').isChecked(), false, '메모 인쇄 체크 해제');
    t.is(await field(page, '기존 연금저축 보유').isChecked(), false, '연금저축 보유 해제');
    t.is(await field(page, '기존 IRP 보유').isChecked(), false, 'IRP 보유 해제');
    t.is(await field(page, '수령 기간').inputValue(), '10', '수령 기간 기본값 10년');
    t.is(await field(page, '운용수익률').inputValue(), '3', '운용수익률 기본값 3%');
    t.is(await field(page, '신규 IRP 연간 수수료').inputValue(), '0', '수수료 기본값 0');

    // 제도는 DC 로, 합산·인출 방식도 기본값으로
    t.is(await field(page, '퇴직급여').count(), 1, '퇴직제도가 DC 기본값으로 돌아감');
    t.is(await field(page, '법정퇴직금').count(), 0, '퇴직금제도 전용 칸이 사라짐');
    t.is(await page.getByRole('button', { name: '퇴직금 단독', exact: true }).getAttribute('aria-pressed'), 'true',
      '합산 범위가 퇴직금 단독으로');
    t.is(await page.getByRole('button', { name: '기간 균등 분할', exact: true }).getAttribute('aria-pressed'), 'true',
      '인출 방식이 기간 균등 분할로');
    t.is(await page.getByRole('button', { name: '판정', exact: true }).getAttribute('aria-pressed'), 'true',
      '판정 탭으로 돌아감');

    // --- 저장된 상담은 남아 있어야 한다 ---
    const kept = await savedCases(page);
    t.is(kept.length, 1, '저장된 상담은 지워지지 않음');
    t.includes(kept[0], '홍길동', '저장 항목의 내용도 그대로');

    // --- 초기화 후 불러오면 되살아난다 ---
    await page.locator('button[title^="불러오기"]').first().click();
    await page.waitForTimeout(600);
    t.is(await field(page, '고객명').inputValue(), '홍길동', '초기화 후에도 불러오기로 복원');
    t.is(await field(page, '수령 기간').inputValue(), '25', '수령 기간까지 복원');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
