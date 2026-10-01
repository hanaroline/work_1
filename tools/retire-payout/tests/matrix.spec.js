/**
 * 판단표 탭.
 *
 * 표 자체가 맞는지는 pension-decision-matrix 의 crosscheck 가 규칙표와 화면 판정을
 * 맞춰 보며 지킨다. 여기서는 '그 표가 화면에 제대로 열리고 고른 조건의 답이 나오는지' 만 본다.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { APP, openApp, fillCase, field, button } = require('./helpers');
// 규칙표 원본. 배포본에서 뺀 글자가 정말로 없는지 맞대 보려면 원문이 있어야 한다.
const { SOURCES } = require('../../pension-decision-matrix/rules');

/** 판단표 탭의 두 블록을 텍스트로 읽는다 */
const blockText = async (page, heading) =>
  (await page.locator('section').filter({ has: page.getByRole('heading', { name: heading }) })
    .innerText()).replace(/\s+/g, ' ').trim();

/** 계좌 줄 묶음 */
const rowsOf = (page, heading) => page.locator('section')
  .filter({ has: page.getByRole('heading', { name: heading }) })
  .locator('div.border.border-hair.rounded-sm > div');

/**
 * 한 계좌 줄에서 한 재원의 답을 읽는다.
 *
 * 재원을 하나만 골랐으면 줄 자체가 답이고, 둘을 골랐으면 계좌 이름 아래에 재원별로
 * 갈려 있다. 둘 다 { mark, text } 로 돌려준다 - 줄 전체 글자에서 'O' 나 '6년차' 를
 * 찾으면 옆 재원의 답을 보고도 통과한다.
 */
function cellOf(page, heading, account, fund) {
  return rowsOf(page, heading).evaluateAll((ds, arg) => {
    const clean = (s) => s.replace(/\s+/g, ' ').trim();
    const box = ds.find((d) => clean(d.innerText).replace(/^[OX△]\s*/, '').startsWith(arg.account));
    if (!box) return null;
    const lines = Array.from(box.querySelectorAll(':scope > div'));
    if (!lines.length) {                       // 재원 하나 - 줄 하나가 통째로 답이다
      const t = clean(box.innerText);
      return { mark: t[0], text: t };
    }
    const hit = lines.find((l) => l.innerText.indexOf(arg.fund) >= 0);
    return hit ? { mark: clean(hit.innerText)[0], text: clean(hit.innerText) } : null;
  }, { account, fund });
}

/** 지금 눌려 있는 조건 단추인가 */
const pressed = (page, name) =>
  button(page, '판단표 ' + name).getAttribute('aria-pressed');

const RECEIVE = '어느 계좌로 받을 수 있나';
const MOVE = '가지고 있는 계좌를 옮길 수 있나';
const LEGAL = '규약상 퇴직급여';
const HONOR = '명퇴금 · 위로금';

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // ── 고객 정보 없이도 열린다 ────────────────────────────────────
    // 판단표는 특정 고객이 아니라 제도 자체를 보는 참조표다.
    t.is(await button(page, '판단표').isDisabled(), false, '입력 전에도 판단표 탭이 열림');
    await button(page, '판단표').click();
    await page.waitForTimeout(400);
    t.includes(await blockText(page, RECEIVE), '퇴직제도', '조건 고르는 칸이 보임');

    // 판단표의 조건 단추는 왼쪽 입력 폼과 글자가 같으므로 '판단표 ' 접두사로 구분된다
    const pick = async (name) => { await button(page, '판단표 ' + name).click(); await page.waitForTimeout(250); };

    // ── DC 규약상 퇴직급여는 연금저축으로 못 간다 (Q12) ───────────
    await pick('DC');
    await pick('2013.3.1 후');
    await pick('만 55세 이상');
    t.is(await pressed(page, LEGAL), 'true', '받을 돈은 규약상 퇴직급여부터 켜져 있음');
    t.is(await pressed(page, HONOR), 'false', '명퇴금은 꺼져 있음');

    t.is((await cellOf(page, RECEIVE, '기존 (2013.3.1 전)', LEGAL)).mark, 'X',
      'DC 규약상 → 구 연금저축 불가');
    t.is((await cellOf(page, RECEIVE, '신규 개설', LEGAL)).mark, 'X', 'DC 규약상 → 신규 연금저축도 불가');
    t.includes(await blockText(page, RECEIVE), 'DC 는 연금저축으로 직접 못 감', '사유를 짧게 표시');

    // ── 명퇴금을 같이 켜면 둘을 나란히 본다 ───────────────────────
    //
    // 퇴직급여와 명퇴금을 같이 받는 사람이 흔한데 하나만 고를 수 있으면 나머지
    // 재원의 답이 화면에서 아예 사라진다. DC 는 그 둘의 답이 정반대다.
    await pick(HONOR);
    t.is(await pressed(page, LEGAL), 'true', '규약상 퇴직급여가 켜진 채로 남음');
    t.is(await pressed(page, HONOR), 'true', '명퇴금도 같이 켜짐');

    const newPenLegal = await cellOf(page, RECEIVE, '신규 개설', LEGAL);
    const newPenHonor = await cellOf(page, RECEIVE, '신규 개설', HONOR);
    t.is(newPenLegal.mark, 'X', '같은 줄에서 규약상은 여전히 불가');
    t.is(newPenHonor.mark, 'O', '같은 줄에서 명퇴금은 가능');
    t.includes(newPenLegal.text, 'DC 는 연금저축으로 직접 못 감', '사유는 막힌 재원에만 붙음');
    t.excludes(newPenHonor.text, 'DC 는 연금저축으로 직접 못 감', '명퇴금에는 DC 제한 사유가 붙지 않음');
    t.includes(await blockText(page, RECEIVE), '나누어 입금', '재원마다 답이 다르면 분할 입금을 안내');

    // 규약상을 끄면 명퇴금만 남는다
    await pick(LEGAL);
    t.is(await pressed(page, LEGAL), 'false', '규약상을 끌 수 있음');
    t.is((await cellOf(page, RECEIVE, '신규 개설', HONOR)).mark, 'O', '명퇴금만 남아도 가능');
    t.excludes(await blockText(page, RECEIVE), 'DC 는 연금저축으로 직접 못 감',
      '끈 재원의 사유는 사라짐');

    // 마지막 하나는 끌 수 없다 - 표가 빈 채로 남으면 고장으로 보인다
    await pick(HONOR);
    t.is(await pressed(page, HONOR), 'true', '마지막 하나는 꺼지지 않음');

    // ── 55세 미만이면 법정은 막히고 명퇴금은 열린다 ───────────────
    await pick(LEGAL);
    await pick('만 55세 미만');
    t.is((await cellOf(page, RECEIVE, '신규 개설', HONOR)).mark, 'O',
      '55세 미만이어도 명퇴금은 연금저축 가능');
    t.is((await cellOf(page, RECEIVE, '신규 개설', LEGAL)).mark, 'X', '55세 미만 법정은 불가');

    // ── 계좌 이전: 신 계좌는 구 계좌로 못 간다 (Q23②) ─────────────
    await pick('보내는 연금저축(신)');
    await pick('받는 연금저축(구)');
    t.includes(await blockText(page, MOVE), '연금저축(신) → 연금저축(구)', '고른 방향이 표시됨');
    t.includes(await blockText(page, MOVE), '신 계좌 → 구 계좌', '막히는 사유를 표시');

    // 반대 방향은 열린다 (음성 대조)
    await pick('보내는 연금저축(구)');
    await pick('받는 연금저축(신)');
    const moveText = await blockText(page, MOVE);
    t.excludes(moveText, '신 계좌 → 구 계좌', '구 → 신 방향은 막히지 않음');
    t.includes(moveText, '연차부터 보세요', '연차가 깎이는 것을 경고');

    // ── 고객 조건으로 맞추기 ──────────────────────────────────────
    // 입력 패널은 어느 탭을 보고 있든 왼쪽에 그대로 있으므로 탭을 옮기지 않고 채운다
    // (판정 탭은 고객 정보가 없는 동안 비활성이라 누를 수도 없다).
    await fillCase(page, {
      name: '맞추기', birth: '680410', system: 'DB', joinDate: '2009-04-01',
      amount: 200000000, honor: 50000000, deferredTax: 5000000
    });
    await button(page, '판단표').click();
    await page.waitForTimeout(300);
    await button(page, '고객 조건으로 보기').click();
    await page.waitForTimeout(400);
    // **고른 상태를 직접 본다.**
    // 예전에는 블록 전체 글자에서 'DB' 와 '6년차' 를 찾았는데, 'DB' 는 조건 단추 이름으로
    // 늘 거기 있고 '6년차' 는 아래 설명문("6년차면 1년차의 2배입니다")에 늘 있다.
    // 그래서 단추가 아무 일도 하지 않아도 통과했다 - 음성 대조에서 드러났다.
    t.is(await pressed(page, 'DB'), 'true', '고객의 퇴직제도(DB)로 맞춰짐');
    t.is(await pressed(page, '2013.3.1 전'), 'true', '제도 가입시점도 맞춰짐');
    t.is(await pressed(page, '만 55세 이상'), 'true', '퇴직 시 나이도 맞춰짐');
    t.is(await pressed(page, 'DC'), 'false', '고르지 않은 제도는 눌려 있지 않음');
    // 명퇴금도 넣었으므로 둘 다 켜져야 한다
    t.is(await pressed(page, LEGAL), 'true', '퇴직급여가 있으면 규약상이 켜짐');
    t.is(await pressed(page, HONOR), 'true', '명퇴금도 있으면 같이 켜짐');
    t.includes(await page.getByLabel('고객 조건 요약', { exact: true }).innerText(),
      LEGAL + ' + ' + HONOR, '요약에도 둘 다 적힘');

    // 2009년 가입 DB + 만 58세 → 신규 계좌도 6년차 특례 (Q34).
    //
    // 기산연차는 계좌의 성질이라 재원에 따라 갈리지 않는다. 그래서 재원을 둘 켜도
    // 계좌 줄에 연차는 **한 번만** 적힌다 - 같은 숫자를 두 번 적으면 재원마다
    // 다른 값인 것처럼 읽힌다.
    const newRow = (await rowsOf(page, RECEIVE).evaluateAll((ds) =>
      ds.map((d) => d.innerText.replace(/\s+/g, ' ').trim().replace(/^[OX△]\s*/, ''))
        .find((s) => s.startsWith('신규 개설')))) || '';
    t.includes(newRow, '6년차', '2013.3.1 이전 DB 라 신규 계좌도 6년차');
    t.is((newRow.match(/년차/g) || []).length, 1, '연차는 계좌마다 한 번만 적힌다');

    // ── 제도 가입일이 비어 있으면 가입시점을 단정하지 않는다 ─────
    //
    // 예전에는 빈 가입일이 false('2013.3.1 이후')로 흘러가, 맞추기를 눌러도
    // '2013.3.1 후'가 눌린 채 아무 일도 일어나지 않는 것처럼 보였다. 2013.3.1 이전
    // 가입자는 6년차라 한도가 2배인데 그 가정이 화면 어디에도 없었다.
    await field(page, '제도 가입일').fill('');
    await field(page, '제도 가입일').blur();
    await page.waitForTimeout(400);
    await button(page, '판단표').click();
    await page.waitForTimeout(300);

    const summary = async () =>
      (await page.getByLabel('고객 조건 요약', { exact: true }).innerText()).replace(/\s+/g, ' ').trim();

    t.includes(await summary(), '가입시점 모름', '가입일이 없으면 모른다고 적는다');
    t.is(await page.getByLabel('가입시점 못 맞춤', { exact: true }).count(), 1,
      '무엇을 못 맞췄는지 알려 준다');

    // 눌러도 가입시점은 건드리지 않는다 - 모르는 것을 '후'로 단정하지 않는다
    await button(page, '고객 조건으로 보기').click();
    await page.waitForTimeout(400);
    t.is(await pressed(page, 'DB'), 'true', '아는 것(퇴직제도)은 맞춘다');
    t.includes(await summary(), '가입시점 모름', '가입일이 없으면 눌러도 모르는 채로 둔다');

    // 넣으면 맞춰진다
    await field(page, '제도 가입일').fill('2010-01-01');
    await field(page, '제도 가입일').blur();
    await page.waitForTimeout(400);
    await button(page, '판단표').click();
    await page.waitForTimeout(300);
    await button(page, '고객 조건으로 보기').click();
    await page.waitForTimeout(400);
    t.is(await pressed(page, '2013.3.1 전'), 'true', '가입일을 넣으면 가입시점이 맞춰짐');
    t.is(await page.getByLabel('가입시점 못 맞춤', { exact: true }).count(), 0,
      '맞춘 뒤에는 못 맞췄다는 안내가 사라짐');

    /* ── 근거는 배포본에 실리지 않는다 ─────────────────────────────
     *
     * 이 도구는 파일 하나가 지점으로 돌아다닌다. 사내 Q&A 원문 요약이
     * 그대로 실려 나가면 파일을 받은 누구나 읽는다. 서버가 없어 화면에서만
     * 가리는 잠금은 편집기로 열면 뚫리므로 **자료 자체를 심지 않는다**
     * (build.js 의 INCLUDE_SOURCES).
     *
     * 그래서 화면에 안 보이는 것만으로는 부족하다. **파일 안에 글자가
     * 없는지**까지 본다 - 그게 이 조치가 실제로 지키려는 것이다.
     */
    t.is(await page.getByText('사내 연금 업무 Q&A', { exact: false }).count(), 0,
      '근거 묶음의 출처·건수 글자가 화면에 없다');

    // 접혀 있어서 안 보이는 것과 애초에 없는 것은 다르다. 심긴 자료를 직접 본다.
    const embedded = await page.evaluate(() => (window.__MATRIX__.sources || []).length);
    t.is(embedded, 0, '배포본에 심긴 근거 자료가 0건이다');

    const shown = await page.locator('body').innerText();
    const onScreen = Object.keys(SOURCES).filter((k) => shown.indexOf(SOURCES[k].note) >= 0);
    t.is(onScreen.length, 0, '화면 어디에도 Q&A 원문이 없다 — ' + onScreen.join(' '));

    const raw = fs.readFileSync(APP.replace('file://', ''), 'utf8');
    const inFile = Object.keys(SOURCES).filter((k) => raw.indexOf(SOURCES[k].note) >= 0);
    t.ok(Object.keys(SOURCES).length >= 18, 'Q&A 원본은 규칙표에 그대로 있다 (' +
      Object.keys(SOURCES).length + '건)');
    t.is(inFile.length, 0, '배포본 파일을 편집기로 열어도 Q&A 원문이 없다 — ' + inFile.join(' '));

    /* Q 번호도 뺀다.
     *
     * 원문을 지워도 'Q23② 를 보라' 가 남으면 어느 사내 문서를 보라는 이야기가
     * 그대로 남는다. 법령 조문(§)은 공개된 것이라 그대로 둔다.
     *
     * React 번들에는 Q0·Q51 같은 압축된 이름이 널려 있으므로 앱 부분만 본다 -
     * 판단표 자료가 시작되는 자리부터가 앱이다. 그러지 않으면 늘 붉은불이라
     * 아무도 보지 않게 된다.
     */
    const appPart = (h) => h.slice(h.indexOf('window.__MATRIX__'));
    const qIn = (h) => [...new Set(appPart(h).match(/Q\d{1,3}[\u2460-\u2473]*/g) || [])];
    const qLeft = qIn(raw);
    t.is(qLeft.length, 0, '배포본에 사내 Q&A 번호가 없다 — ' + qLeft.join(' '));

    /* 되돌리는 길이 살아 있는지도 본다.
       '필요하면 되돌릴 수 있다' 는 말은 되돌려 봐야 참이 된다 - 스위치가
       끊겨 있어도 배포본 검사는 그대로 통과하므로 여기서 짚지 않으면
       아무도 모른다. --근거 로 한 판 지어 18건이 들어 있는지 센다. */
    const ROOT = path.resolve(__dirname, '..', '..', '..');
    const full = path.join(ROOT, 'retire-payout-internal.html');
    execFileSync(process.execPath,
      [path.join(ROOT, 'scripts', 'build-retire-payout.js'), '--근거'],
      { cwd: ROOT, stdio: 'ignore' });
    const fullHtml = fs.readFileSync(full, 'utf8');
    const kept = Object.keys(SOURCES).filter((k) => fullHtml.indexOf(SOURCES[k].note) >= 0);
    t.ok(kept.length >= 16, '--근거 로 지으면 Q&A 가 그대로 돌아온다 (' + kept.length + '건)');
    t.ok(fullHtml.length > raw.length, '근거를 담은 판이 배포본보다 크다');
    t.ok(qIn(fullHtml).length >= 10, '근거를 담은 판에는 Q 번호도 함께 돌아온다 (' +
      qIn(fullHtml).length + '종)');

    // 판정은 그대로 돈다 - 근거를 뺀 것이 표를 건드리지는 않았다
    const stillWorks = await blockText(page, RECEIVE);
    t.includes(stillWorks, '신규 개설', '근거를 빼도 판단표는 그대로 답한다');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
