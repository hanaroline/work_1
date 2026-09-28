/**
 * 사용법과 자산 합산 범위.
 *
 * 둘 다 '기능이 있는데 보이지 않는다' 를 고친 것이라, 지키는 것도 **보이는가** 다.
 *
 *   · 사용법은 별도 PDF 가 아니라 화면 안에 있다. 파일 하나가 돌아다니는 도구라
 *     PDF 를 따로 두면 HTML 만 받은 사람에게는 사용법이 없고, 화면이 바뀌면 낡는다.
 *   · 자산 합산 범위는 계좌 카드 안의 체크로 옮기면서 개념 자체가 화면에서 사라졌다.
 *     고르는 자리가 아니라 **지금 상태를 보여 주고 한 번에 바꾸는** 자리로 되살렸다.
 */
const { openApp, fillCase, field, button } = require('./helpers');

const 만 = 10000;

const dialog = (page) => page.getByRole('dialog', { name: '사용법' });
const flat = async (loc) => (await loc.innerText()).replace(/\s+/g, ' ').trim();

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    /* ── 사용법 ─────────────────────────────────────────────────── */

    t.is(await dialog(page).count(), 0, '처음에는 사용법이 닫혀 있다');
    t.is(await button(page, '사용법').count(), 1, '머리에 사용법 단추가 하나');

    /**
     * 머리는 본문을 밀어내지 않는다.
     *
     * 제목·부제·사용법 단추를 세로로 쌓아 두었더니 머리 하나가 세로 285px 를 먹어
     * 정작 봐야 할 판정과 인출표가 화면 밖으로 내려갔다는 보고를 받았다. 눈으로
     * 보고 줄인 것이라 다시 쌓기 쉬우므로 높이로 못을 박는다.
     *
     * 글자 크기를 조금 만지는 것으로는 안 깨지고, **단추를 다시 아래 줄로 내리거나
     * 여백을 예전만큼 키우면** 깨지는 값으로 잡는다 (예전 배치는 이 폭에서 200px 을
     * 넘었다).
     */
    const geo = await page.evaluate(() => {
      const el = document.querySelector('header');
      const h = el.getBoundingClientRect();
      const t = el.querySelector('h1').getBoundingClientRect();
      // 머리에는 단추가 셋이다(엑셀 · CSV · 사용법). 첫 번째를 집으면 엉뚱한 것을 본다.
      const btns = Array.prototype.slice.call(el.querySelectorAll('button'));
      const guide = btns.filter((b) => b.getAttribute('aria-label') === '사용법')[0];
      const b = guide.getBoundingClientRect();
      const p = el.querySelector('p');
      return {
        height: h.height,
        buttons: btns.length,
        sameRow: b.top < t.bottom && b.bottom > t.top,
        right: b.left > t.right,
        // 블록 요소라 getClientRects 는 언제나 하나다 - 높이를 줄높이로 나눠 센다
        descLines: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight))
      };
    });
    /*
     * 위아래로 못을 둘 다 박는다.
     *
     * 처음에는 '140px 이하' 만 보았는데, 그 뒤 95px 까지 줄였더니 이번에는
     * "답답하다" 는 보고를 받았다. 한쪽만 막아 두면 반대쪽으로 넘어간다.
     */
    t.ok(geo.height >= 96 && geo.height <= 140,
      '머리 높이가 96~140px 안에 있다 (실제 ' + Math.round(geo.height) + 'px)');
    t.is(geo.buttons, 3, '머리에 단추가 셋 - 엑셀 · CSV · 사용법');
    t.is(geo.sameRow, true, '사용법 단추가 제목과 같은 줄에 있다 - 높이를 따로 먹지 않는다');
    t.is(geo.right, true, '사용법 단추는 제목 오른쪽 빈자리에 있다');
    // 설명이 두 줄로 접히면 그것만으로 머리가 한 줄치(18px) 더 커진다
    t.is(geo.descLines, 1, '넓은 화면에서 설명은 한 줄이다');

    await button(page, '사용법').click();
    await page.waitForTimeout(400);
    t.is(await dialog(page).count(), 1, '누르면 사용법이 열린다');

    // 상담 순서 그대로 여덟 단계. 기능 목록이 아니라 '무엇부터 하면 되는가' 다.
    const guide = await flat(dialog(page));
    for (const step of ['고객 정보를 넣습니다', '이연퇴직소득세를 직접 계산합니다',
      '보유 계좌를 하나씩 넣습니다', '판정을 읽습니다',
      '계좌를 나란히 비교합니다', '인출 스케줄을 봅니다', '제도 자체를 확인합니다',
      '저장하고 출력합니다']) {
      t.includes(guide, step, '단계가 있다: ' + step);
    }
    t.includes(guide, '이 도구가 하지 않는 것', '한계를 함께 적는다');

    /**
     * 이연퇴직소득세 직접 계산은 **칸이 있는데 사용법이 없던** 자리다.
     *
     * 여기서 틀리면 세액이 통째로 틀리는데(근속연수를 제도 가입일부터 세면 세금이
     * 과대 계산된다) 화면만 보고는 알 수 없는 것들이라, 함정을 낱낱이 적었는지 본다.
     * '단계 제목이 있다' 만 보면 제목만 있고 속은 비어도 통과한다.
     */
    t.includes(guide, '입사일은 제도 가입일과 다릅니다', '입사일 함정을 적는다');
    t.includes(guide, '근속연수는 1년 미만도 1년으로 셉니다', '근속연수 절상을 적는다');
    t.includes(guide, '중간정산은 두 갈래를 다 계산합니다', '중간정산 두 갈래를 적는다');
    t.includes(guide, '지방소득세가 들어 있습니다', '지방소득세 포함을 적는다');
    t.includes(guide, '영수증이 있으면 켜지 마세요', '영수증이 있을 때는 끄라고 적는다');

    // 단계마다 자주 틀리는 것이 붙는다 - 이 도구에서 실제로 틀렸던 것들이다
    t.ok((guide.match(/자주 틀리는 것/g) || []).length >= 10,
      "'자주 틀리는 것' 이 단계마다 붙는다");
    t.includes(guide, '제도 가입일을 비우지 마세요', '빈 가입일 함정을 적는다');
    t.includes(guide, '명예퇴직금은 따로 넣습니다', '명퇴금 칸을 따로 둔 이유를 적는다');
    t.includes(guide, '한도는 인출 상한이 아닙니다', '가장 흔한 오해를 적는다');

    // 닫는 길이 둘 - Esc 와 바깥 누르기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    t.is(await dialog(page).count(), 0, 'Esc 로 닫힌다');

    await button(page, '사용법').click();
    await page.waitForTimeout(300);
    await page.mouse.click(30, 400);
    await page.waitForTimeout(300);
    t.is(await dialog(page).count(), 0, '바깥을 누르면 닫힌다');

    /* ── 사용법 인쇄는 고객용 A4 와 섞이지 않는다 ────────────────── */

    // 고객명은 사용법 본문에 나올 수 없는 글자로 둔다. '판정 결과' 같은 낱말로
    // 보려다 실패했는데, 사용법이 '판정 결과 맨 위에 경고가 뜹니다' 라고 안내하고
    // 있어서였다 - **양쪽에 다 있는 낱말로는 섞였는지 가릴 수 없다.**
    const CUST = '섞임확인용고객';
    await fillCase(page, {
      name: CUST, birth: '650115', system: 'DB', joinDate: '2005-03-02',
      retireDate: '2026-06-30', amount: 200000000, deferredTax: 10000000
    });
    await page.waitForTimeout(700);

    /**
     * 인쇄되는 것을 **전부** 읽는다.
     *
     * 처음에는 첫 번째 .print-only 만 읽었다. 그러면 고객용 A4 와 사용법을 동시에
     * 그려 놓아도 앞에 있는 것만 보이므로 '섞였는지' 를 가릴 수 없다 - 실제로
     * 음성 대조에서 그 회귀가 통과해 버렸다. 인쇄기는 전부를 내보낸다.
     */
    const printedAll = async () => {
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(250);
      const txt = (await page.locator('.print-only').allInnerTexts()).join(' ').replace(/\s+/g, ' ');
      await page.emulateMedia({ media: 'screen' });
      await page.waitForTimeout(150);
      return txt;
    };
    const printed = printedAll;

    const sheet = await printed();
    t.includes(sheet, CUST, '기본 인쇄물은 고객용 A4 다');
    t.excludes(sheet, '자주 틀리는 것', '고객용 A4 에 사용법이 섞이지 않는다');

    // window.print 를 가로채 그 순간에 무엇이 인쇄되는지 본다
    await page.evaluate(() => {
      window.__printed = null;
      window.print = () => {
        // 하나만 읽으면 둘을 같이 그려 놓아도 앞의 것만 보인다
        window.__printed = Array.prototype.map
          .call(document.querySelectorAll('.print-only'), (el) => el.innerText).join(' ');
      };
    });
    await button(page, '사용법').click();
    await page.waitForTimeout(300);
    await button(page, '사용법 인쇄').click();
    await page.waitForTimeout(700);
    const guidePrint = ((await page.evaluate(() => window.__printed)) || '').replace(/\s+/g, ' ');
    t.includes(guidePrint, '자주 틀리는 것', '사용법 인쇄에는 사용법이 담긴다');
    t.includes(guidePrint, '이 도구가 하지 않는 것', '한계까지 담긴다');
    t.excludes(guidePrint, CUST, '사용법 인쇄에 고객 자료가 섞이지 않는다');

    await page.waitForTimeout(400);
    const back = await printed();
    t.includes(back, CUST, '인쇄한 뒤에는 고객용 A4 로 되돌아온다');
    t.excludes(back, '자주 틀리는 것', '사용법이 남지 않는다');
    await button(page, '사용법 닫기').click();
    await page.waitForTimeout(300);

    /* ── 자산 합산 범위 ─────────────────────────────────────────── */

    const scope = () => page.getByLabel('자산 합산 범위 현황', { exact: true });

    await fillCase(page, {
      name: '합산', birth: '650115', system: 'DB', joinDate: '2005-03-02',
      retireDate: '2026-06-30', amount: 200000000, deferredTax: 10000000,
      pension: false, irp: false
    });
    await page.waitForTimeout(600);
    t.is(await scope().count(), 1, '자산 합산 범위가 시뮬레이션 옵션에 보인다');
    t.includes(await flat(scope()), '보유 계좌가 없어', '계좌가 없으면 그렇게 적는다');
    t.is(await button(page, '전체 합산').count(), 0, '계좌가 없으면 단추도 없다');

    await fillCase(page, {
      name: '합산2', birth: '650115', system: 'DB', joinDate: '2005-03-02',
      retireDate: '2026-06-30', amount: 200000000, deferredTax: 10000000,
      accounts: [
        { kind: 'pension', join: '2008-03-02', balance: 5000 * 만 },
        { kind: 'irp', join: '2015-03-02', balance: 3000 * 만 }
      ]
    });
    await page.waitForTimeout(700);
    t.includes(await flat(scope()), '퇴직급여 단독', '아무것도 안 켜면 퇴직급여 단독');
    t.is(await button(page, '합산 해제').isDisabled(), true, '끌 것이 없으면 해제는 눌리지 않는다');

    // 한 번에 켠다 - 예전 '전체 전액 합산' 이 하던 일
    await button(page, '전체 합산').click();
    await page.waitForTimeout(700);
    const all = await flat(scope());
    t.includes(all, '연금저축 1', '합산한 계좌를 이름으로 적는다');
    t.includes(all, 'IRP 1', '두 번째 계좌도 이름으로 적는다');
    t.includes(all, '8,000만원', '합산된 기존 잔고를 적는다');
    t.is(await field(page, '연금저축 1 시뮬레이션 합산').isChecked(), true, '계좌 카드의 체크도 켜진다');
    t.is(await field(page, 'IRP 1 시뮬레이션 합산').isChecked(), true, '두 번째 계좌도 켜진다');
    t.is(await button(page, '전체 합산').isDisabled(), true, '다 켜져 있으면 전체 합산은 눌리지 않는다');

    // 카드에서 하나만 꺼도 요약이 따라온다 (4지선다로는 표현할 수 없던 상태)
    await field(page, 'IRP 1 시뮬레이션 합산').uncheck();
    await page.waitForTimeout(600);
    const partial = await flat(scope());
    t.includes(partial, '연금저축 1', '남은 계좌만 적는다');
    t.excludes(partial, 'IRP 1', '끈 계좌는 빠진다');
    t.includes(partial, '5,000만원', '잔고도 남은 것만 센다');

    // 한 번에 끈다
    await button(page, '합산 해제').click();
    await page.waitForTimeout(700);
    t.includes(await flat(scope()), '퇴직급여 단독', '해제하면 퇴직급여 단독으로 돌아온다');
    t.is(await field(page, '연금저축 1 시뮬레이션 합산').isChecked(), false, '계좌 카드의 체크도 꺼진다');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
