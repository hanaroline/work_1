/**
 * 판단표 탭.
 *
 * 표 자체가 맞는지는 pension-decision-matrix 의 crosscheck 가 규칙표와 화면 판정을
 * 맞춰 보며 지킨다. 여기서는 '그 표가 화면에 제대로 열리고 고른 조건의 답이 나오는지' 만 본다.
 */
const { openApp, fillCase, field, button } = require('./helpers');

/** 판단표 탭의 두 블록을 텍스트로 읽는다 */
const blockText = async (page, heading) =>
  (await page.locator('section').filter({ has: page.getByRole('heading', { name: heading }) })
    .innerText()).replace(/\s+/g, ' ').trim();

/** 한 계좌 줄을 통째로 읽는다 */
async function rowOf(page, heading, label) {
  const rows = await page.locator('section')
    .filter({ has: page.getByRole('heading', { name: heading }) })
    .locator('div.border.border-hair.rounded-sm > div')
    .evaluateAll((ds) => ds.map((d) => d.innerText.replace(/\s+/g, ' ').trim()));
  const hit = rows.find((r) => r.slice(2).trim().startsWith(label));
  if (!hit) throw new Error('줄을 찾지 못함: ' + label + ' / 있는 줄: ' + JSON.stringify(rows));
  return hit.trim();
}

/** 한 계좌 줄의 판정 기호 (O / △ / X) */
const markOf = async (page, heading, label) => (await rowOf(page, heading, label))[0];

/** 지금 눌려 있는 조건 단추인가 */
const pressed = (page, name) =>
  button(page, '판단표 ' + name).getAttribute('aria-pressed');

const RECEIVE = '어느 계좌로 받을 수 있나';
const MOVE = '가지고 있는 계좌를 옮길 수 있나';

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // ── 고객 정보 없이도 열린다 ────────────────────────────────────
    // 판단표는 특정 고객이 아니라 제도 자체를 보는 참조표다.
    t.is(await button(page, '판단표').isDisabled(), false, '입력 전에도 판단표 탭이 열림');
    await button(page, '판단표').click();
    await page.waitForTimeout(400);
    t.includes(await blockText(page, RECEIVE), '퇴직제도', '조건 고르는 칸이 보임');

    // ── DC 규약상 퇴직급여는 연금저축으로 못 간다 (Q12) ───────────
    // 판단표의 조건 단추는 왼쪽 입력 폼과 글자가 같으므로 '판단표 ' 접두사로 구분된다
    const pick = async (name) => { await button(page, '판단표 ' + name).click(); await page.waitForTimeout(250); };
    await pick('DC');
    await pick('2013.3.1 후');
    await pick('규약상 퇴직급여');
    await pick('만 55세 이상');

    t.is(await markOf(page, RECEIVE, '기존 (2013.3.1 전)'), 'X', 'DC 규약상 → 구 연금저축 불가');
    t.is(await markOf(page, RECEIVE, '신규 개설'), 'X', 'DC 규약상 → 신규 연금저축도 불가');
    t.includes(await blockText(page, RECEIVE), 'DC 는 연금저축으로 직접 못 감', '사유를 짧게 표시');

    // ── 같은 사람의 명퇴금은 갈 수 있다 (Q12 첫 문단) ─────────────
    await pick('명퇴금 · 위로금');
    t.is(await markOf(page, RECEIVE, '신규 개설'), 'O', '명퇴금은 신규 연금저축 가능');
    t.excludes(await blockText(page, RECEIVE), 'DC 는 연금저축으로 직접 못 감',
      '명퇴금에는 DC 제한 사유가 붙지 않음');

    // ── 55세 미만이면 법정은 막히고 명퇴금은 열린다 ───────────────
    await pick('만 55세 미만');
    t.is(await markOf(page, RECEIVE, '신규 개설'), 'O', '55세 미만이어도 명퇴금은 연금저축 가능');
    await pick('규약상 퇴직급여');
    t.is(await markOf(page, RECEIVE, '신규 개설'), 'X', '55세 미만 법정은 불가');

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
      amount: 200000000, deferredTax: 5000000
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
    // 2009년 가입 DB + 만 58세 → 신규 계좌도 6년차 특례 (Q34). 그 줄을 직접 읽는다.
    t.includes(await rowOf(page, RECEIVE, '신규 개설'), '6년차',
      '2013.3.1 이전 DB 라 신규 계좌도 6년차');

    // ── 근거는 접혀 있다 ──────────────────────────────────────────
    t.is(await page.getByText('사내 연금 업무 Q&A', { exact: false }).count(), 1, '근거 묶음이 한 줄로 접혀 있음');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
