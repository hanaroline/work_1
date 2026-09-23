/** 인쇄물 - 탭과 무관하게 전부 담기고 A4 한 장을 넘지 않는다 */
const { openApp, fillCase, field, button, printSheet, pdfPageCount, A4_CONTENT_PX } = require('./helpers');

const BASE = {
  name: '홍길동', birth: '710315', system: 'DC', joinDate: '2000-07-01',
  amount: 350000000, deferredTax: 7500000,
  pension: { join: '2003-03-02', balance: 75000000 },
  irp: { join: '2002-03-02', balance: 85000000 }
};
const LONG_MEMO = '퇴직금 단독 수령 희망하시며 기존 IRP 수수료 재확인 필요. '.repeat(9).slice(0, 500);

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({ stubPrint: true });
  try {
    await fillCase(page, Object.assign({}, BASE, { years: 30 }));

    // --- 어느 탭을 보고 있든 인쇄물에는 전부 담긴다 ---
    for (const tab of ['판정', '계좌 비교', '인출 스케줄']) {
      await button(page, tab).click();
      await page.waitForTimeout(300);
      const s = await printSheet(page);
      t.includes(s.text, '판정 결과', `[${tab}] 탭에서 인쇄 - 판정 포함`);
      t.includes(s.text, '연 수수료', `[${tab}] 탭에서 인쇄 - 계좌 비교 포함`);
      t.includes(s.text, '연차별 인출 스케줄', `[${tab}] 탭에서 인쇄 - 인출 스케줄 포함`);
      t.includes(s.text, '2055', `[${tab}] 탭에서 인쇄 - 30회차까지 포함`);
      t.ok(s.fitsA4, `[${tab}] 탭에서 인쇄 - A4 한 장 (${s.height}/${A4_CONTENT_PX}px)`);
    }
    t.is(await pdfPageCount(page), 1, 'PDF 1페이지');

    // 세 탭의 인쇄물이 글자 하나까지 같아야 한다
    const texts = [];
    for (const tab of ['판정', '계좌 비교', '인출 스케줄']) {
      await button(page, tab).click();
      await page.waitForTimeout(300);
      texts.push((await printSheet(page)).text);
    }
    t.is(texts[1], texts[0], '계좌 비교 탭의 인쇄물이 판정 탭과 동일');
    t.is(texts[2], texts[0], '인출 스케줄 탭의 인쇄물이 판정 탭과 동일');

    // 지표 카드(합산 기준)와 비교표(퇴직급여 단독 기준)의 기준이 다르다는 표시
    t.includes(texts[0], '퇴직급여 단독 기준', '비교표에 산정 기준이 표시됨');
    t.includes(texts[0], '단위: 만원', '비교표에 단위가 표시됨');

    // --- 메모 인쇄 옵션 ---
    await field(page, '상담 메모').fill(LONG_MEMO);
    await page.waitForTimeout(300);
    let s = await printSheet(page);
    t.excludes(s.text, '상담 메모', '체크 해제 시 메모가 인쇄물에 새지 않음');

    await field(page, '상담 메모 인쇄물 포함').check();
    await page.waitForTimeout(400);
    s = await printSheet(page);
    t.includes(s.text, '상담 메모', '체크 시 메모가 인쇄물에 들어감');
    t.includes(s.text, '퇴직금 단독 수령 희망', '메모 본문이 들어감');

    // 최악 조건: 수령 기간 × 메모 500자
    for (const years of [10, 20, 30]) {
      await field(page, '수령 기간').fill(String(years));
      await page.waitForTimeout(400);
      const r = await printSheet(page);
      t.ok(r.fitsA4, `메모 500자 + 수령 ${years}년 - A4 한 장 (${r.height}/${A4_CONTENT_PX}px)`);
    }
    t.is(await pdfPageCount(page), 1, '메모 500자 + 30년에서도 PDF 1페이지');

    // --- PDF 저장 버튼과 파일명 ---
    await button(page, 'PDF 저장').click();
    await page.waitForTimeout(500);
    t.is(await page.evaluate(() => window.__printed), 1, 'PDF 저장 버튼이 인쇄 경로를 호출');

    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await page.waitForTimeout(200);
    const printing = await page.title();
    t.includes(printing, '퇴직급여 의사결정', '인쇄 직전 제목이 PDF 파일명으로 바뀜');
    t.includes(printing, '홍길동', 'PDF 파일명에 고객명이 들어감');

    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await page.waitForTimeout(200);
    t.is(await page.title(), '퇴직급여 수령 의사결정 시뮬레이터', '인쇄가 끝나면 제목이 돌아옴');

    // --- 수동 선택이 인쇄물에 반영 ---
    await button(page, '판정').click();
    await page.waitForTimeout(300);
    // DC 는 연금저축계좌로 입금할 수 없으므로 고를 수 있는 것은 IRP 뿐이다
    await page.locator('select').first().selectOption('new-irp');
    await page.waitForTimeout(500);
    s = await printSheet(page);
    t.includes(s.text, '신규 IRP', '수동 선택한 계좌가 인쇄물에 반영');
    t.includes(s.text, '수동 선택', '수동 선택 표시가 인쇄물에 남음');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
