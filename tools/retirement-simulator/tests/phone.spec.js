/**
 * 휴대폰에서 쓸 수 있는가.
 *
 * 지금까지 검사는 모두 1500px 데스크탑 폭에서만 돌았다. 지점 PC 가 주 사용처지만
 * 외부에서 휴대폰으로 여는 일이 실제로 있었고, 그때 확인된 것이 하나도 없었다.
 *
 * 여기서 보는 것은 두 가지다.
 *   1. 가로 스크롤이 생기지 않는가 - 휴대폰에서 가장 흔한 깨짐이다.
 *   2. 스크립트가 돌지 않는 뷰어에서 무엇을 해야 하는지 알려 주는가.
 */
const path = require('path');
const { chromium } = require('playwright');

const APP = 'file://' + path.resolve(__dirname, '..', '..', '..', 'retirement-simulator.html');
const PHONE = { width: 412, height: 915 };   // 갤럭시 계열의 흔한 폭

/** 문서가 뷰포트보다 넓으면 가로 스크롤이 생긴다 */
const overflow = (page) => page.evaluate(() => ({
  doc: document.documentElement.scrollWidth,
  win: window.innerWidth
}));

module.exports = async function run(t) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: PHONE, deviceScaleFactor: 2, isMobile: true, hasTouch: true, offline: true
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));

  try {
    await page.goto(APP, { waitUntil: 'load' });
    await page.waitForFunction(() => document.getElementById('root').children.length > 0, { timeout: 20000 });
    await page.waitForTimeout(600);

    const L = (name) => page.getByLabel(name, { exact: true });
    const B = (name) => page.getByRole('button', { name, exact: true });

    // ── 입력이 된다 ───────────────────────────────────────────────
    // DB 로 둔다. DC 는 연금저축이 막혀 비교 대상이 하나뿐이라 '계좌 비교' 탭이 열리지
    // 않는다 - 네 탭을 모두 보려면 비교할 계좌가 둘 이상 나와야 한다.
    await L('생년월일').fill('680410');
    await B('DB').click();
    await L('제도 가입일').fill('2016-04-01');
    await L('퇴직급여').fill('300000000');
    await L('이연 퇴직소득세').fill('9000000');
    await page.waitForTimeout(600);
    t.is((await L('퇴직급여').inputValue()).replace(/,/g, ''), '300000000', '휴대폰 폭에서도 금액 입력이 된다');

    // ── 어느 탭에서도 가로로 넘치지 않는다 ────────────────────────
    for (const tab of ['판정', '계좌 비교', '인출 스케줄', '판단표']) {
      await B(tab).click();
      await page.waitForTimeout(400);
      const o = await overflow(page);
      t.ok(o.doc <= o.win + 1, tab + ' 탭에서 가로 스크롤 없음 (' + o.doc + '/' + o.win + 'px)');
    }

    // 계좌를 여러 개 넣어도 넘치지 않는지 (카드가 가장 넓다)
    await B('판정').click();
    await B('연금저축 추가').click();
    await page.waitForTimeout(200);
    await B('IRP 추가').click();
    await page.waitForTimeout(400);
    await L('연금저축 1 금융기관').fill('미래에셋증권');
    await L('IRP 1 금융기관').fill('가나다라은행');
    await page.waitForTimeout(400);
    const withAcc = await overflow(page);
    t.ok(withAcc.doc <= withAcc.win + 1,
      '계좌 카드가 있어도 가로 스크롤 없음 (' + withAcc.doc + '/' + withAcc.win + 'px)');

    t.is(errors.length, 0, '휴대폰 폭에서 런타임 에러 없음');

    // ── 스크립트가 막힌 뷰어에서 무엇을 해야 하는지 알려 준다 ─────
    // 메신저·파일 관리자의 내장 미리보기는 HTML 을 글자만 그리고 스크립트를 돌리지
    // 않는다. 그때 '자바스크립트가 필요합니다' 한 줄만 나오면 파일을 다시 받아 보게 된다.
    const noJs = await browser.newContext({ viewport: PHONE, javaScriptEnabled: false });
    const flat = await noJs.newPage();
    await flat.goto(APP, { waitUntil: 'load' });
    const text = (await flat.locator('body').innerText()).replace(/\s+/g, ' ');
    t.includes(text, '브라우저', '브라우저로 열라고 안내');
    t.includes(text, 'Chrome', '어느 앱으로 열지 이름을 댄다');
    t.includes(text, 'Download', '파일을 어디서 찾는지 알려 준다');
    // 앱 고르는 화면이 안 뜨는 기기가 있다. 주소를 직접 칠 수 있게 경로를 적어 둔다 -
    // 이것이 앱 선택을 건너뛰는 가장 확실한 길이다.
    t.includes(text, 'file:///storage/emulated/0/Download/', '주소창에 칠 경로를 그대로 적어 준다');
    t.excludes(text, '300,000,000', '예비 화면에는 상담 내용이 남지 않는다');
    await noJs.close();
  } finally {
    await browser.close();
  }
};
