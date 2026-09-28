/**
 * 선택자 가드.
 *
 * 이 스펙이 존재하는 이유: 체크박스를 하나 추가했더니 인덱스로 컨트롤을 잡던
 * 테스트들이 엉뚱한 칸을 누르고도 '통과'했다. 통과하는 테스트가 실제로는 아무것도
 * 검증하지 않는 상태였다. 그래서 (1) 모든 라벨이 정확히 하나로 잡히는지, (2) 각 라벨이
 * 정말 그 필드로 가는지 (서로 다른 값을 넣고 되읽어서) 확인한다.
 */
const { FIELDS, BUTTONS, openApp, field, button, setAccounts } = require('./helpers');

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

    // 이연퇴직소득세 자체 계산 - 켜야 칸이 열린다.
    // DB·DC 는 '입사일' 이 따로 필요하다. 제도 가입일은 입사일이 아니다.
    for (const name of FIELDS.whenTaxCalc.concat(FIELDS.whenTaxCalcDbDc)) {
      t.is(await field(page, name).count(), 0, '계산을 켜기 전에는 없다: ' + name);
    }
    await field(page, '이연 퇴직소득세 직접 계산').check();
    await page.waitForTimeout(250);
    for (const name of FIELDS.whenTaxCalc.concat(FIELDS.whenTaxCalcDbDc)) {
      t.is(await field(page, name).count(), 1, '계산 라벨 고유: ' + name);
    }
    for (const name of FIELDS.whenMidSettle) {
      t.is(await field(page, name).count(), 0, '중간정산 표시 전에는 없다: ' + name);
    }
    await field(page, '중간정산 받음').check();
    await page.waitForTimeout(250);
    for (const name of FIELDS.whenMidSettle) {
      t.is(await field(page, name).count(), 1, '중간정산 라벨 고유: ' + name);
    }
    // 켜 두면 이연 퇴직소득세는 계산값 칸이 되어 입력 칸이 사라진다
    t.is(await field(page, '이연 퇴직소득세').count(), 0, '계산 중에는 직접 입력 칸이 없다');
    t.is(await page.getByLabel('계산된 이연 퇴직소득세', { exact: true }).count(), 1,
      '대신 계산값 칸이 하나 있다');
    await field(page, '이연 퇴직소득세 직접 계산').uncheck();
    await page.waitForTimeout(250);
    t.is(await field(page, '이연 퇴직소득세').count(), 1, '끄면 직접 입력 칸이 돌아온다');

    await button(page, '퇴직금제도').click();
    await page.waitForTimeout(250);
    for (const name of FIELDS.whenSeverance) t.is(await field(page, name).count(), 1, '퇴직금제도 라벨 고유: ' + name);
    t.is(await field(page, '퇴직급여').count(), 0, '퇴직금제도에서는 단일 퇴직급여 칸이 없다');

    // 퇴직금제도는 기존 '입사일' 칸(라벨은 제도 가입일)을 근속 기산일로 그대로 쓴다.
    // 같은 뜻의 칸을 둘 두면 어느 쪽을 채워야 하는지 알 수 없다.
    await field(page, '이연 퇴직소득세 직접 계산').check();
    await page.waitForTimeout(250);
    t.is(await field(page, '입사일').count(), 0, '퇴직금제도에는 입사일 칸이 따로 생기지 않는다');
    await field(page, '이연 퇴직소득세 직접 계산').uncheck();
    await page.waitForTimeout(200);

    // --- 3. 계좌를 추가하면 그 카드의 칸들이 순번 이름으로 생긴다 ---
    // 같은 종류를 두 개 넣어도 '연금저축 1' / '연금저축 2' 로 갈려 겹치지 않아야 한다.
    await setAccounts(page, [
      { kind: 'pension' }, { kind: 'pension' }, { kind: 'irp' }
    ]);
    for (const k of ['연금저축 1', '연금저축 2', 'IRP 1']) {
      for (const name of FIELDS.perAccount) {
        t.is(await field(page, k + ' ' + name).count(), 1, '계좌 라벨 고유: ' + k + ' ' + name);
      }
    }
    // 수수료 칸은 IRP 에만 있다 - 연금저축계좌에는 계좌 수수료가 없다
    for (const name of FIELDS.perIrpOnly) {
      t.is(await field(page, 'IRP 1 ' + name).count(), 1, 'IRP 전용 라벨 고유: IRP 1 ' + name);
      t.is(await field(page, '연금저축 1 ' + name).count(), 0, '연금저축 1 에는 없다: ' + name);
      t.is(await field(page, '연금저축 2 ' + name).count(), 0, '연금저축 2 에도 없다: ' + name);
    }
    t.is(await field(page, 'IRP 2 가입일').count(), 0, '없는 계좌의 칸은 잡히지 않는다');

    // 계좌마다 같은 칸이 생기므로 설명 버튼 이름에도 계좌 키가 붙어야 한다.
    // 안 붙이면 '가입일 설명' 버튼이 계좌 수만큼 생겨 어느 것도 고유하게 잡히지 않는다.
    for (const k of ['연금저축 1', '연금저축 2', 'IRP 1']) {
      for (const name of ['가입일', '세액공제 받지 않은 금액', '연간 수수료', '연금개시됨', '시뮬레이션 합산']) {
        t.is(await page.getByRole('button', { name: k + ' ' + name + ' 설명', exact: true }).count(), 1,
          '설명 버튼 고유: ' + k + ' ' + name);
      }
    }

    // 가운데 계좌를 지우면 번호가 다시 매겨진다
    await button(page, '연금저축 1 삭제').click();
    await page.waitForTimeout(300);
    t.is(await field(page, '연금저축 1 가입일').count(), 1, '삭제 후에도 연금저축 1 이 존재');
    t.is(await field(page, '연금저축 2 가입일').count(), 0, '연금저축 2 는 사라짐');
    t.is(await field(page, 'IRP 1 가입일').count(), 1, 'IRP 번호는 영향 없음');
    await setAccounts(page, [{ kind: 'pension' }, { kind: 'irp' }]);

    // --- 4. 핵심: 각 라벨이 정말 그 필드로 가는가 ---
    // 서로 다른 값을 넣고 전부 되읽어, 한 칸이 다른 칸을 덮어쓰지 않는지 본다.
    const probes = [
      ['고객명', '테스트고객'],
      ['생년월일', '710315'],
      ['제도 가입일', '1999-04-05'],
      ['법정퇴직금', '111000000'],
      ['명예퇴직금', '222000000'],
      ['이연 퇴직소득세', '333000'],
      ['연금저축 1 가입일', '2003-03-02'],
      ['연금저축 1 평가액', '444000000'],
      ['연금저축 1 세액공제 받지 않은 금액', '12000000'],
      ['연금저축 1 금융기관', '미래에셋'],
      ['IRP 1 가입일', '2002-03-02'],
      ['IRP 1 평가액', '555000000'],
      ['IRP 1 세액공제 받지 않은 금액', '34000000'],
      ['과거 연금 수령 횟수', '7'],
      ['상담 메모', '메모확인용']
    ];
    for (const [name, value] of probes) await field(page, name).fill(value);
    await page.waitForTimeout(400);

    for (const [name, value] of probes) {
      const got = (await field(page, name).inputValue()).replace(/,/g, '');
      t.is(got, value, '값이 제 칸에 들어감: ' + name);
    }

    // 수수료 칸은 기존 IRP 계좌에만 있다. 신규 IRP 요율은 미래에셋 공시에서
    // 자동으로 나오므로 입력칸이 없고, 연금저축계좌는 계좌 수수료 자체가 없다.
    await field(page, 'IRP 1 연간 수수료').fill('0.22');
    await page.waitForTimeout(300);
    t.is(await field(page, 'IRP 1 연간 수수료').inputValue(), '0.22', '기존 IRP 수수료 칸');
    t.is(await field(page, '신규 IRP 연간 수수료').count(), 0, '신규 IRP 에는 요율 입력칸이 없다');

    // 슬라이더 두 개
    await field(page, '수령 기간').fill('23');
    await field(page, '운용수익률').fill('4.5');
    await page.waitForTimeout(300);
    t.is(await field(page, '수령 기간').inputValue(), '23', '수령 기간 슬라이더');
    t.is(await field(page, '운용수익률').inputValue(), '4.5', '운용수익률 슬라이더');

    // 체크박스 4개가 서로 독립인지 - 하나만 켜고 나머지가 꺼져 있는지 본다
    const boxes = ['연금저축 1 연금개시됨', '연금저축 1 시뮬레이션 합산',
      'IRP 1 연금개시됨', 'IRP 1 시뮬레이션 합산', '상담 메모 인쇄물 포함'];
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
    // 화면에 늘 떠 있는 안내문도 role="note" 이므로, 이 설명 패널만 이름으로 센다.
    // (예전에는 note 전체를 세어, 안내문이 하나 늘면 바로 어긋났다.)
    const helpNote = page.getByLabel('퇴직제도 설명 내용', { exact: true });
    t.is(await helpNote.count(), 0, '처음에는 설명이 닫혀 있음');
    await help.click();
    await page.waitForTimeout(200);
    t.is(await helpNote.count(), 1, '누르면 설명이 열림');
    await page.getByRole('button', { name: '퇴직제도 설명 닫기', exact: true }).click();
    await page.waitForTimeout(200);
    t.is(await helpNote.count(), 0, '닫기로 다시 닫힘');

    // --- 5. 판단표 탭의 조건 단추 ---
    //
    // **숨은 탭은 이 가드를 빠져나간다.** 판단표 패널은 display:none 이라 탭을 열기 전에는
    // getByRole 이 세지 않는다. 그래서 판단표의 'DB' 단추가 왼쪽 입력 폼의 것과 접근성
    // 이름이 같아 충돌했을 때, 이 스펙은 아무것도 잡지 못하고 matrix 스펙이 실제로
    // 눌러 보다가 걸렸다. 누르지 않는 컨트롤이 새로 생기면 그마저도 빠져나가므로
    // 탭을 열어 놓고 여기서 센다.
    await button(page, '판단표').click();
    await page.waitForTimeout(300);

    const MATRIX_BUTTONS = [
      '판단표 퇴직금제도', '판단표 DB', '판단표 DC',
      '판단표 2013.3.1 전', '판단표 2013.3.1 후',
      '판단표 규약상 퇴직급여', '판단표 명퇴금 · 위로금',
      '판단표 만 55세 미만', '판단표 만 55세 이상',
      '판단표 보내는 연금저축(구)', '판단표 보내는 연금저축(신)',
      '판단표 보내는 IRP(구)', '판단표 보내는 IRP(신)',
      '판단표 받는 연금저축(구)', '판단표 받는 연금저축(신)',
      '판단표 받는 IRP(구)', '판단표 받는 IRP(신)',
      '판단표 아직 아님', '판단표 충족'
    ];
    for (const name of MATRIX_BUTTONS) {
      t.is(await button(page, name).count(), 1, '판단표 라벨 고유: ' + name);
    }

    // 판단표를 열어도 왼쪽 입력 폼의 단추와 겹치지 않아야 한다.
    // 겹치면 사람도 검사도 어느 것을 누르는지 구분할 수 없다.
    for (const name of ['DB', 'DC', '퇴직금제도', '기간 균등 분할', '세법 한도 내 최대']) {
      t.is(await button(page, name).count(), 1, '판단표를 열어도 입력 폼 단추는 하나: ' + name);
    }

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
