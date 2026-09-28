/** 자립성 - 외부 요청 0건, 임베드 폰트 실사용, 날짜 입력 방어 */
const { openApp, fillCase, field, button, printSheet , setAccounts } = require('./helpers');

module.exports = async function run(t) {
  const { browser, page, errors, external } = await openApp({});
  try {
    // --- 외부 네트워크를 쓰지 않는다 ---
    t.is(external.length, 0, '로드 중 외부 요청 0건');

    await fillCase(page, {
      name: '김미래', birth: '680410', system: 'SEV', joinDate: '1995-03-02',
      legal: 200000000, honor: 100000000, deferredTax: 12000000,
      pension: { join: '2010-06-15', balance: 30000000 }, years: 30
    });
    const s = await printSheet(page);
    t.ok(s.fitsA4, `오프라인에서 인쇄까지 정상 (${s.height}px)`);
    t.is(external.length, 0, '조작 후에도 외부 요청 0건');

    // --- 임베드 폰트가 실제로 쓰인다 ---
    const font = await page.evaluate(() => {
      const faces = [];
      document.fonts.forEach((f) => faces.push(f.family));
      const measure = (stack) => {
        const c = document.createElement('canvas').getContext('2d');
        c.font = '400 20px ' + stack;
        return c.measureText('퇴직급여 수령 의사결정').width;
      };
      const el = document.createElement('span');
      el.className = 'num';
      el.style.cssText = 'position:absolute;visibility:hidden;font-size:20px';
      document.body.appendChild(el);
      el.textContent = '111111'; const w1 = el.getBoundingClientRect().width;
      el.textContent = '888888'; const w8 = el.getBoundingClientRect().width;
      const numFamily = getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, '');
      el.remove();
      return {
        families: [...new Set(faces)],
        spoqa: measure("'Spoqa Han Sans Neo'"),
        generic: measure('sans-serif'),
        w1, w8, numFamily
      };
    });
    t.ok(font.families.includes('Spoqa Han Sans Neo'), 'Spoqa Han Sans Neo 가 문서에 임베드됨');
    t.ok(font.families.includes('Inter'), 'Inter 가 문서에 임베드됨');
    t.ok(font.spoqa !== font.generic, '한글이 시스템 폰트가 아닌 임베드 폰트로 그려짐');
    t.is(font.numFamily, 'Inter', '숫자 칸은 Inter 를 씀');
    t.is(font.w1, font.w8, '고정폭 숫자 (1 과 8 의 폭이 같음)');

    // --- 날짜 입력 ---
    //
    // 휴대폰에서 브라우저 기본 달력은 월 이동밖에 없어 2003년 가입일을 고르려면
    // 화살표를 270번 넘게 눌러야 했다. 숫자를 직접 치는 칸으로 바꿨다.
    // 여기서 지키는 것은 세 가지다.
    //   1. 친 대로 구분선이 붙는가
    //   2. 치는 중간 상태가 눌리거나 지워지지 않는가 (옛 date 칸은 '2' 가 0002 로
    //      들어가 곧바로 1900 으로 튀어 2016 을 칠 수 없었다)
    //   3. 달력에 없는 날짜·범위 밖 날짜는 걸러지는가
    const d = field(page, '제도 가입일');

    // 자리표시자는 날짜로 읽혀서는 안 된다.
    //
    // 예시 날짜('2003-07-01')를 넣어 두었더니 비어 있는 칸을 '입력했다'고 본 채
    // 판정을 믿는 일이 있었다. 빈 가입일은 2013.3.1 이후로 흘러가 1년차가 되므로
    // 그대로 답이 반토막 난다.
    const ph = await d.getAttribute('placeholder');
    t.ok(!/\d/.test(ph || ''), '자리표시자에 숫자가 없다 (값으로 읽히지 않는다) - ' + ph);

    await d.fill('');
    await d.pressSequentially('20030701');
    await page.waitForTimeout(250);
    t.is(await d.inputValue(), '2003-07-01', '숫자 여덟 자리를 치면 구분선이 붙는다');

    // 한 글자씩 쳐도 중간값이 눌리지 않는다
    await d.fill('');
    await d.pressSequentially('2016');
    await page.waitForTimeout(250);
    t.is(await d.inputValue(), '2016', '연도를 치는 동안에는 그대로 둔다');

    // 치다 말고 다른 곳을 봐도 남아 있어야 한다
    await button(page, '판정').click();
    await page.waitForTimeout(250);
    t.is(await d.inputValue(), '2016', '치다 만 값은 지워지지 않는다');

    await d.click();
    await d.pressSequentially('0401');
    await page.waitForTimeout(250);
    t.is(await d.inputValue(), '2016-04-01', '이어서 치면 완성된다');

    await d.pressSequentially('9');
    await page.waitForTimeout(200);
    t.is(await d.inputValue(), '2016-04-01', '여덟 자리를 넘겨 쳐도 늘어나지 않는다');

    // 달력에 없는 날짜는 비운다
    await d.fill('20030231');
    await button(page, '판정').click();
    await page.waitForTimeout(300);
    t.is(await d.inputValue(), '', '2003-02-31 처럼 없는 날짜는 비운다');

    // 가입일에 미래는 있을 수 없다
    await d.fill('20990101');
    await button(page, '판정').click();
    await page.waitForTimeout(300);
    t.is(await d.inputValue(), '', '가입일에 미래 날짜는 비운다');

    // --- 친 뒤에 고칠 수 있는가 ---
    //
    // 마스크를 다시 씌우면 값이 통째로 바뀌어 **커서가 맨 뒤로 튄다.** 연도 가운데를
    // 고치려 하면 커서가 '일' 자리로 달아나고, 블록으로 잡아 새로 쳐도 마찬가지여서
    // 사실상 고칠 수가 없었다. 게다가 maxLength=10 이라 열 글자가 찬 칸에서는
    // 가운데에 숫자를 끼워 넣는 것을 브라우저가 아예 막았다.
    //
    // 커서 자리는 '몇 번째 숫자 뒤' 로 센다 - 구분선은 자릿수에 따라 늘고 줄기 때문에
    // 글자 위치로 기억하면 한 칸씩 어긋난다.
    const caretState = () => page.evaluate(() => {
      const el = document.activeElement;
      return el.value + ' @' + el.selectionStart;
    });
    const putCaret = (i) => page.evaluate((n) => {
      document.activeElement.setSelectionRange(n, n);
    }, i);
    const selectRange = (from, to) => page.evaluate((r) => {
      document.activeElement.setSelectionRange(r[0], r[1]);
    }, [from, to]);

    const edit = async (name, steps, want) => {
      await d.fill('');
      await d.click();
      await steps();
      t.is(await caretState(), want, name);
    };

    // 연도만 블록으로 잡아 다시 치기 - 실제로 가장 많이 하는 고치기
    await edit('연도를 블록으로 잡아 고치면 그 자리에 머문다', async () => {
      await page.keyboard.type('20300501');
      await selectRange(0, 4);
      await page.keyboard.type('2003');
    }, '2003-05-01 @5');

    // 월·일도 같은 방식으로
    await edit('월을 고쳐도 커서가 달아나지 않는다', async () => {
      await page.keyboard.type('20030501');
      await selectRange(5, 7);
      await page.keyboard.type('12');
    }, '2003-12-01 @8');
    await edit('일을 고쳐도 커서가 달아나지 않는다', async () => {
      await page.keyboard.type('20030501');
      await selectRange(8, 10);
      await page.keyboard.type('25');
    }, '2003-05-25 @10');

    // 열 글자가 다 찬 칸의 가운데에 끼워 넣기 (maxLength 가 막던 것)
    await edit('열 글자가 찼어도 가운데에 끼워 넣을 수 있다', async () => {
      await page.keyboard.type('20030501');
      await putCaret(2);
      await page.keyboard.type('9');
    }, '2090-30-50 @3');

    // 가운데에서 한 글자 지우기
    await edit('가운데 숫자를 지우면 그 자리에 머문다', async () => {
      await page.keyboard.type('20030501');
      await putCaret(3);
      await page.keyboard.press('Backspace');
    }, '2030-50-1 @2');

    // 구분선 위에서는 옆의 숫자를 지운다 - 마스크가 '-' 를 되돌려 놓아 키가 먹지 않았다
    await edit('구분선 뒤 백스페이스는 앞의 숫자를 지운다', async () => {
      await page.keyboard.type('20030501');
      await putCaret(5);
      await page.keyboard.press('Backspace');
    }, '2000-50-1 @3');
    await edit('구분선 위 딜리트는 뒤의 숫자를 지운다', async () => {
      await page.keyboard.type('20030501');
      await putCaret(4);
      await page.keyboard.press('Delete');
    }, '2003-50-1 @5');

    // 지웠다가 이어서 다시 치기
    await edit('지우고 이어서 쳐도 제자리에 붙는다', async () => {
      await page.keyboard.type('20030501');
      for (let i = 0; i < 4; i++) await page.keyboard.press('Backspace');
      await page.keyboard.type('1225');
    }, '2003-12-25 @10');

    // 포커스를 뺐다가 돌아와서 고치기
    await edit('다른 칸을 보고 와서 고쳐도 된다', async () => {
      await page.keyboard.type('20030501');
      await field(page, '고객명').click();
      await page.waitForTimeout(150);
      await d.click();
      await selectRange(5, 7);
      await page.keyboard.type('11');
    }, '2003-11-01 @8');

    await d.fill('');

    // --- 날짜 칸이 **모두** 같은 식으로 고쳐지는가 ---
    //
    // 처음에는 '제도 가입일' 하나만 보고 고쳤다. 날짜 칸은 일곱 개고(퇴직일 ·
    // 전환 전 DB 가입일 · 입사일 · 중간정산일 · 계좌마다 가입일) 모두 같은
    // 컴포넌트를 쓰지만, 하나만 보고 '고쳤다' 고 하면 나머지는 확인한 적이 없는 것이다.
    // 전환 칸과 입사일 칸은 DC 에서만 열린다
    await button(page, 'DC').click();
    await page.waitForTimeout(250);
    await field(page, 'DB 에서 DC 로 전환').check();
    await page.waitForTimeout(200);
    await field(page, '이연 퇴직소득세 직접 계산').check();
    await page.waitForTimeout(250);
    await field(page, '중간정산 받음').check();
    await page.waitForTimeout(250);
    await setAccounts(page, [{ kind: 'pension' }, { kind: 'irp' }]);
    await page.waitForTimeout(250);

    const DATE_FIELDS = ['제도 가입일', '퇴직일', '전환 전 DB 가입일', '입사일', '중간정산일',
      '연금저축 1 가입일', 'IRP 1 가입일'];

    for (const name of DATE_FIELDS) {
      const f = field(page, name);
      t.is(await f.count(), 1, '날짜 칸이 하나로 잡힌다: ' + name);

      // 연도만 블록으로 잡아 고치기 - 실제로 가장 많이 하는 고치기다
      await f.fill('');
      await f.click();
      await page.keyboard.type('20300501');
      await selectRange(0, 4);
      await page.keyboard.type('2003');
      t.is(await caretState(), '2003-05-01 @5', name + ': 연도를 고쳐도 커서가 제자리');

      // 열 글자가 찬 칸의 가운데에 끼워 넣기
      await f.fill('');
      await f.click();
      await page.keyboard.type('20030501');
      await putCaret(2);
      await page.keyboard.type('9');
      t.is(await caretState(), '2090-30-50 @3', name + ': 가운데에 끼워 넣을 수 있다');

      // 구분선 위에서 지우기
      await f.fill('');
      await f.click();
      await page.keyboard.type('20030501');
      await putCaret(5);
      await page.keyboard.press('Backspace');
      t.is(await caretState(), '2000-50-1 @3', name + ': 구분선 위 백스페이스가 먹는다');

      await f.fill('');
    }

    // 원래 상태로 되돌린다 (뒤의 검사가 이 화면을 이어서 쓴다)
    await field(page, '중간정산 받음').uncheck();
    await field(page, '이연 퇴직소득세 직접 계산').uncheck();
    await field(page, 'DB 에서 DC 로 전환').uncheck();
    await setAccounts(page, []);
    await page.waitForTimeout(300);

    // 퇴직(예정)일은 미래가 정상이다 (음성 대조)
    const rd = field(page, '퇴직일');
    await rd.fill('20280301');
    await button(page, '판정').click();
    await page.waitForTimeout(300);
    t.is(await rd.inputValue(), '2028-03-01', '퇴직(예정)일은 미래를 받는다');

    await d.fill('0002-03-07');
    await page.waitForTimeout(250);
    await d.click();
    await button(page, '판정').click();
    await page.waitForTimeout(400);
    t.is(await d.inputValue(), '', '터무니없는 연도는 blur 에서 비움 (1900 으로 눌러두지 않음)');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
