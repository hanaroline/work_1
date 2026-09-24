/** 자립성 - 외부 요청 0건, 임베드 폰트 실사용, 날짜 입력 방어 */
const { openApp, fillCase, field, button, printSheet } = require('./helpers');

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
