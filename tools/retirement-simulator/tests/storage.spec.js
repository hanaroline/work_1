/** 저장 - 상담 보관, 메모, 파일 내보내기/가져오기, CSV */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { openApp, fillCase, field, button } = require('./helpers');

const CASE = {
  name: '홍길동', birth: '710315', system: 'DC', joinDate: '2000-07-01',
  amount: 350000000, deferredTax: 7500000,
  pension: { join: '2003-03-02', balance: 75000000 },
  years: 20, memo: '기존 IRP 수수료 확인 필요.\n2월 재방문 예정.'
};

const savedCases = (page) =>
  page.locator('button[title^="불러오기"]').evaluateAll((bs) => bs.map((b) => b.innerText.replace(/\s+/g, ' ').trim()));

module.exports = async function run(t) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mas-sim-'));
  const { browser, page, errors } = await openApp({});
  try {
    await fillCase(page, CASE);

    // --- 저장 후 목록에 남는다 ---
    await button(page, '상담 저장').click();
    await page.waitForTimeout(500);
    let list = await savedCases(page);
    t.is(list.length, 1, '상담 1건이 저장됨');
    t.includes(list[0], '홍길동', '목록에 고객명이 보임');
    t.includes(list[0], '1971년생', '목록에 생년이 보임');

    // --- 입력을 바꿨다가 불러오면 되돌아온다 ---
    await field(page, '고객명').fill('지워짐');
    await field(page, '수령 기간').fill('5');
    await page.waitForTimeout(400);
    await page.locator('button[title^="불러오기"]').first().click();
    await page.waitForTimeout(600);
    t.is(await field(page, '고객명').inputValue(), '홍길동', '고객명 복원');
    t.is(await field(page, '수령 기간').inputValue(), '20', '수령 기간 복원');
    t.is((await field(page, '퇴직급여').inputValue()).replace(/,/g, ''), '350000000', '퇴직급여 복원');
    t.includes(await field(page, '상담 메모').inputValue(), '2월 재방문 예정', '메모 복원');

    // --- 새로고침해도 남는다 ---
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => document.getElementById('root').children.length > 0);
    await page.waitForTimeout(600);
    t.is((await savedCases(page)).length, 1, '새로고침 후에도 목록 유지');

    // --- 목록에서 메모만 수정 (입력값은 그대로) ---
    await page.locator('button[title^="불러오기"]').first().click();
    await page.waitForTimeout(500);
    await page.locator('button[title="메모 수정"]').first().click();
    await page.waitForTimeout(300);
    await field(page, '저장된 상담 메모 수정').fill('수정된 메모');
    await button(page, '메모 저장').click();
    await page.waitForTimeout(500);
    const listed = await savedCases(page);
    t.is(listed.length, 1, '수정 후에도 항목은 1건');
    const memoShown = await page.locator('p.whitespace-pre-wrap').allInnerTexts();
    t.ok(memoShown.some((x) => x.trim() === '수정된 메모'), '목록에 수정된 메모가 표시됨');
    t.ok(!memoShown.some((x) => x.includes('2월 재방문 예정')), '이전 메모는 대체됨');
    t.is((await field(page, '퇴직급여').inputValue()).replace(/,/g, ''), '350000000', '메모 수정이 입력값을 건드리지 않음');

    // --- 파일 내보내기 / 가져오기 ---
    const [dl] = await Promise.all([page.waitForEvent('download'), button(page, '파일로 내보내기').click()]);
    const jsonPath = path.join(tmp, 'case.json');
    await dl.saveAs(jsonPath);
    t.ok(/^retirement-case_.*\.json$/.test(dl.suggestedFilename()),
      'ASCII 파일명으로 저장됨 (' + dl.suggestedFilename() + ')');

    const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    t.is(payload.format, 'mas-retirement-case', '파일 형식 표기');
    t.is(payload.data.custName, '홍길동', '고객명은 파일 안에 들어감');
    t.is(payload.data.years, 20, '수령 기간이 담김');

    await field(page, '고객명').fill('');
    await field(page, '수령 기간').fill('5');
    await page.waitForTimeout(400);
    await field(page, '상담 케이스 가져오기').setInputFiles(jsonPath);
    await page.waitForTimeout(700);
    t.is(await field(page, '고객명').inputValue(), '홍길동', '가져오기로 복원');
    t.is(await field(page, '수령 기간').inputValue(), '20', '가져오기로 수령 기간 복원');

    // --- 형식이 다른 JSON 은 거부 ---
    const badPath = path.join(tmp, 'bad.json');
    fs.writeFileSync(badPath, '{"hello":"world"}');
    await field(page, '상담 케이스 가져오기').setInputFiles(badPath);
    await page.waitForTimeout(600);
    t.is(await field(page, '고객명').inputValue(), '홍길동', '엉뚱한 JSON 이 폼을 초기화하지 않음');
    t.includes(await page.locator('body').innerText(), '상담 케이스 형식이 아닙니다', '거부 메시지 표시');

    // --- CSV ---
    await button(page, '인출 스케줄').click();
    await page.waitForTimeout(300);
    const [csvDl] = await Promise.all([page.waitForEvent('download'), button(page, 'CSV 내보내기').click()]);
    const csvPath = path.join(tmp, 'schedule.csv');
    await csvDl.saveAs(csvPath);
    const buf = fs.readFileSync(csvPath);
    t.ok(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, 'CSV 에 UTF-8 BOM (엑셀 한글 보존)');
    const csv = buf.toString('utf8');
    t.includes(csv, '고객명,홍길동', 'CSV 머리말에 고객명');
    t.includes(csv, '상담 메모', 'CSV 머리말에 메모');
    t.includes(csv, '회차,연도,나이', 'CSV 표 머리행');
    t.is(csv.trim().split('\r\n').filter((l) => /^\d+,/.test(l)).length, 20, 'CSV 데이터 20행');

    // --- 삭제 ---
    await button(page, '판정').click();
    await page.locator('button[title="삭제"]').first().click();
    await page.waitForTimeout(500);
    t.is((await savedCases(page)).length, 0, '삭제되면 목록에서 사라짐');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
};
