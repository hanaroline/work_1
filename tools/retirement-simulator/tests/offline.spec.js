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

    // --- 날짜 입력 방어 ---
    const d = field(page, '제도 가입일');
    await d.fill('200700-02-01');
    await page.waitForTimeout(300);
    t.is(await d.inputValue(), '2007-02-01', '연도 6자리는 앞 4자리로 절삭');

    await d.fill('2099-01-01');
    await page.waitForTimeout(300);
    const today = await page.evaluate(() => {
      const p = (n) => String(n).padStart(2, '0');
      const t2 = new Date();
      return t2.getFullYear() + '-' + p(t2.getMonth() + 1) + '-' + p(t2.getDate());
    });
    t.is(await d.inputValue(), today, '미래 날짜는 오늘로 제한');

    // 기존 값의 연도를 한 글자씩 고치는 경로 (중간값이 눌리면 안 된다)
    await d.fill('2003-03-07');
    await page.waitForTimeout(250);
    await d.click();
    await page.keyboard.press('Home');
    // 이 환경의 칸 순서를 확인해 연도 칸으로 이동
    await page.keyboard.type('5');
    await page.waitForTimeout(200);
    const yearFirst = (await d.inputValue()).startsWith('0005');
    await d.fill('2003-03-07');
    await page.waitForTimeout(200);
    await d.click();
    await page.keyboard.press('Home');
    if (!yearFirst) { await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); }
    for (const ch of '2016') { await page.keyboard.type(ch); await page.waitForTimeout(150); }
    await button(page, '판정').click();
    await page.waitForTimeout(300);
    t.is(await d.inputValue(), '2016-03-07', '연도를 한 글자씩 고쳐 2016 으로 완성됨');

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
