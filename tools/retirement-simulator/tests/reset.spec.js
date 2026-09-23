/** 전체 초기화 - 입력만 비우고 저장된 상담은 남긴다 */
const { openApp, fillCase, field, button, DEL_RE } = require('./helpers');

const p2 = (n) => String(n).padStart(2, '0');
const T = new Date();
const TODAY_STR = T.getFullYear() + '-' + p2(T.getMonth() + 1) + '-' + p2(T.getDate());

const savedCases = (page) =>
  page.locator('button[title^="불러오기"]').evaluateAll((bs) => bs.map((b) => b.innerText.replace(/\s+/g, ' ').trim()));

const CASE = {
  name: '홍길동', birth: '710315', system: 'SEV', joinDate: '2000-07-01',
  retireDate: '2024-03-02',
  legal: 150000000, honor: 50000000, deferredTax: 7500000,
  accounts: [
    { kind: 'pension', name: '미래에셋', join: '2003-03-02', balance: 75000000, exempt: 12000000, started: true, merge: true },
    { kind: 'pension', join: '2019-08-01', balance: 15000000 },
    { kind: 'irp', join: '2002-03-02', balance: 85000000, exempt: 9000000, fee: 0.3, merge: true }
  ],
  pastCount: 3,
  mode: '세법 한도 내 최대', years: 25, rate: 5,
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

    // 확인 문구가 '무엇이 지워지는지' 를 묶음 이름으로 말해야 한다.
    // 단추가 상담 메모 카드 안에 있던 동안은 '메모를 지우는 단추' 로 읽혔다.
    const confirmBox = await page.locator('.screen-only').first().innerText();
    t.includes(confirmBox, '1 · 2 · 3', '지워지는 범위를 묶음 번호로 밝힘');
    t.includes(confirmBox, '저장된 상담은 남습니다', '저장본은 남는다고 밝힘');

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
    // 금액 칸은 '있는가' 만 보고 '비었는가' 를 안 보고 있었다. 제도가 DC 로 돌아가면서
    // 칸이 새로 그려지는 바람에 값이 남아도 검사가 눈치채지 못하는 자리였다.
    t.is(await field(page, '퇴직급여').inputValue(), '', '퇴직급여 금액 비움');
    t.is(await field(page, '과거 연금 수령 횟수').inputValue(), '0', '과거 수령 횟수 0');
    t.is(await field(page, '상담 메모').inputValue(), '', '메모 비움');
    t.is(await field(page, '상담 메모 인쇄물 포함').isChecked(), false, '메모 인쇄 체크 해제');
    t.is(await field(page, '연금저축 1 가입일').count(), 0, '계좌 카드가 모두 사라짐');
    t.is(await page.getByRole('button', { name: DEL_RE }).count(), 0, '삭제 버튼도 남지 않음');
    t.is(await field(page, 'DB 에서 DC 로 전환').isChecked(), false, 'DB → DC 전환 표시 해제');
    t.is(await field(page, '퇴직일').inputValue(), TODAY_STR, '퇴직일이 오늘로 돌아감');
    t.is(await field(page, '수령 기간').inputValue(), '10', '수령 기간 기본값 10년');
    t.is(await field(page, '운용수익률').inputValue(), '3', '운용수익률 기본값 3%');
    t.is(await field(page, '신규 IRP 연간 수수료').inputValue(), '0', '수수료 기본값 0');

    // 제도는 DC 로, 합산·인출 방식도 기본값으로
    t.is(await field(page, '퇴직급여').count(), 1, '퇴직제도가 DC 기본값으로 돌아감');
    t.is(await field(page, '법정퇴직금').count(), 0, '퇴직금제도 전용 칸이 사라짐');
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
    // 새로 붙은 칸들도 저장·복원 경로를 타는지 (초기화로 비워졌다가 되살아나야 한다)
    t.is(await page.getByRole('button', { name: DEL_RE }).count(), 3, '계좌 3건이 그대로 복원');
    t.is((await field(page, '연금저축 1 세액공제 받지 않은 금액').inputValue()).replace(/,/g, ''),
      '12000000', '세액공제 받지 않은 금액까지 복원');
    t.is(await field(page, '연금저축 1 금융기관').inputValue(), '미래에셋', '금융기관명까지 복원');
    t.is(await field(page, '연금저축 1 연금개시됨').isChecked(), true, '연금개시 표시까지 복원');
    t.is(await field(page, '연금저축 1 시뮬레이션 합산').isChecked(), true, '합산 표시까지 복원');
    t.is(await field(page, '연금저축 2 시뮬레이션 합산').isChecked(), false, '두 번째 계좌는 합산 해제 상태로 복원');
    t.is((await field(page, '연금저축 2 평가액').inputValue()).replace(/,/g, ''), '15000000',
      '같은 종류의 두 번째 계좌도 제 값으로 복원');
    t.is(await field(page, 'IRP 1 연간 수수료').inputValue(), '0.3', 'IRP 수수료까지 복원');
    t.is(await field(page, 'IRP 1 연금개시됨').isChecked(), false, 'IRP 는 개시 표시가 꺼진 채로 복원');
    t.is(await field(page, '퇴직일').inputValue(), '2024-03-02', '과거 퇴직일까지 복원');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
