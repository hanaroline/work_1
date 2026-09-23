/**
 * 선택자 가드.
 *
 * 이 스펙이 존재하는 이유: 체크박스를 하나 추가했더니 인덱스로 컨트롤을 잡던
 * 테스트들이 엉뚱한 칸을 누르고도 '통과'했다. 통과하는 테스트가 실제로는 아무것도
 * 검증하지 않는 상태였다. 그래서 (1) 모든 라벨이 정확히 하나로 잡히는지, (2) 각 라벨이
 * 정말 그 필드로 가는지 (서로 다른 값을 넣고 되읽어서) 확인한다.
 */
const { FIELDS, BUTTONS, openApp, field, button } = require('./helpers');

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // --- 1. 상시 노출 라벨은 정확히 하나 ---
    for (const name of FIELDS.always) {
      t.is(await field(page, name).count(), 1, '라벨 고유: ' + name);
    }
    for (const name of BUTTONS) {
      t.is(await button(page, name).count(), 1, '버튼 고유: ' + name);
    }

    // --- 2. 제도에 따라 나타나는 금액 칸 ---
    await button(page, 'DC').click();
    await page.waitForTimeout(250);
    for (const name of FIELDS.whenDbDc) t.is(await field(page, name).count(), 1, 'DC 라벨 고유: ' + name);
    for (const name of FIELDS.whenDc) t.is(await field(page, name).count(), 1, 'DC 라벨 고유: ' + name);
    t.is(await field(page, '법정퇴직금').count(), 0, 'DC 에서는 법정퇴직금 칸이 없다');

    // DB → DC 전환을 켜야 전환 전 가입일 칸이 나온다
    for (const name of FIELDS.whenConverted) {
      t.is(await field(page, name).count(), 0, '전환 표시 전에는 없다: ' + name);
    }
    await field(page, 'DB 에서 DC 로 전환').check();
    await page.waitForTimeout(250);
    for (const name of FIELDS.whenConverted) {
      t.is(await field(page, name).count(), 1, '전환 라벨 고유: ' + name);
    }
    await field(page, 'DB 에서 DC 로 전환').uncheck();
    await page.waitForTimeout(200);

    await button(page, 'DB').click();
    await page.waitForTimeout(250);
    for (const name of FIELDS.whenDc) {
      t.is(await field(page, name).count(), 0, 'DB 에서는 전환 칸이 없다: ' + name);
    }

    await button(page, '퇴직금제도').click();
    await page.waitForTimeout(250);
    for (const name of FIELDS.whenSeverance) t.is(await field(page, name).count(), 1, '퇴직금제도 라벨 고유: ' + name);
    t.is(await field(page, '퇴직급여').count(), 0, '퇴직금제도에서는 단일 퇴직급여 칸이 없다');

    // --- 3. 계좌를 켜면 나타나는 칸 ---
    await field(page, '기존 연금저축 보유').check();
    await field(page, '기존 IRP 보유').check();
    await page.waitForTimeout(300);
    for (const name of FIELDS.whenPension.concat(FIELDS.whenIrp)) {
      t.is(await field(page, name).count(), 1, '계좌 라벨 고유: ' + name);
    }

    // --- 4. 핵심: 각 라벨이 정말 그 필드로 가는가 ---
    // 서로 다른 값을 넣고 전부 되읽어, 한 칸이 다른 칸을 덮어쓰지 않는지 본다.
    const probes = [
      ['고객명', '테스트고객'],
      ['생년월일', '710315'],
      ['제도 가입일', '1999-04-05'],
      ['법정퇴직금', '111000000'],
      ['명예퇴직금', '222000000'],
      ['이연 퇴직소득세', '333000'],
      ['기존 연금저축 가입일', '2003-03-02'],
      ['기존 연금저축 평가액', '444000000'],
      ['기존 연금저축 세액공제 받지 않은 금액', '12000000'],
      ['기존 IRP 가입일', '2002-03-02'],
      ['기존 IRP 평가액', '555000000'],
      ['기존 IRP 세액공제 받지 않은 금액', '34000000'],
      ['과거 연금 수령 횟수', '7'],
      ['상담 메모', '메모확인용']
    ];
    for (const [name, value] of probes) await field(page, name).fill(value);
    await page.waitForTimeout(400);

    for (const [name, value] of probes) {
      const got = (await field(page, name).inputValue()).replace(/,/g, '');
      t.is(got, value, '값이 제 칸에 들어감: ' + name);
    }

    // 수수료 4칸도 서로 섞이지 않는지
    const feeProbes = [['기존 연금저축', '0.11'], ['기존 IRP', '0.22'], ['신규 IRP', '0.33'], ['신규 연금저축', '0.44']];
    for (const [label, v] of feeProbes) await field(page, label + ' 연간 수수료').fill(v);
    await page.waitForTimeout(300);
    for (const [label, v] of feeProbes) {
      t.is(await field(page, label + ' 연간 수수료').inputValue(), v, '수수료 칸 구분: ' + label);
    }

    // 슬라이더 두 개
    await field(page, '수령 기간').fill('23');
    await field(page, '운용수익률').fill('4.5');
    await page.waitForTimeout(300);
    t.is(await field(page, '수령 기간').inputValue(), '23', '수령 기간 슬라이더');
    t.is(await field(page, '운용수익률').inputValue(), '4.5', '운용수익률 슬라이더');

    // 체크박스 4개가 서로 독립인지 - 하나만 켜고 나머지가 꺼져 있는지 본다
    const boxes = ['기존 연금저축 연금개시됨', '기존 IRP 연금개시됨', '상담 메모 인쇄물 포함'];
    for (const name of boxes) {
      await field(page, name).check();
      await page.waitForTimeout(150);
      for (const other of boxes) {
        t.is(await field(page, other).isChecked(), other === name,
          name + ' 을 켰을 때 ' + other + ' 상태');
      }
      await field(page, name).uncheck();
      await page.waitForTimeout(150);
    }

    // 설명 버튼은 눌러야 열리고, 열려도 입력 칸을 가로채지 않는다
    const help = page.getByRole('button', { name: '퇴직제도 설명', exact: true });
    t.is(await help.count(), 1, '설명 버튼이 라벨로 잡힘');
    t.is(await page.getByRole('note').count(), 0, '처음에는 설명이 닫혀 있음');
    await help.click();
    await page.waitForTimeout(200);
    t.is(await page.getByRole('note').count(), 1, '누르면 설명이 열림');
    await page.getByRole('button', { name: '퇴직제도 설명 닫기', exact: true }).click();
    await page.waitForTimeout(200);
    t.is(await page.getByRole('note').count(), 0, '닫기로 다시 닫힘');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
