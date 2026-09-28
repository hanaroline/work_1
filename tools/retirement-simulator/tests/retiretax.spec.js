/**
 * 이연퇴직소득세 자체 계산.
 *
 * 격자 대조는 tools/retirement-tax/crosscheck.js 가 규칙표와 맞대며 한다.
 * 여기서는 **테스트가 조문에서 다시 전개한 숫자**와 맞대고, 화면이 지켜야 할 약속을 본다.
 *   · 켜기 전에는 예전처럼 직접 입력이 된다 (기존 흐름을 깨지 않는다)
 *   · 계산값이 인출 스케줄·비교표까지 실제로 흘러간다
 *   · 못 하면 왜 못 하는지 말한다 (조용히 0 으로 두지 않는다)
 */
const { openApp, fillCase, field, button } = require('./helpers');

const 만 = 10000;

/* ── 테스트가 직접 쓰는 산식 (소득세법 §48·§55) ──────────────────
   앱의 코드를 부르지 않는다. 표를 조문에서 다시 옮겨 적고 손으로 전개한다. */

function svcDed(y) {
  if (y <= 5) return 1000000 * y;
  if (y <= 10) return 5000000 + 2000000 * (y - 5);
  if (y <= 20) return 15000000 + 2500000 * (y - 10);
  return 40000000 + 3000000 * (y - 20);
}

function convDed(v) {
  if (v <= 8000000) return v;
  if (v <= 70000000) return 8000000 + (v - 8000000) * 0.6;
  if (v <= 100000000) return 45200000 + (v - 70000000) * 0.55;
  if (v <= 300000000) return 61700000 + (v - 100000000) * 0.45;
  return 151700000 + (v - 300000000) * 0.35;
}

function basicTax(b) {
  if (b <= 0) return 0;
  if (b <= 14000000) return b * 0.06;
  if (b <= 50000000) return b * 0.15 - 1260000;
  if (b <= 88000000) return b * 0.24 - 5760000;
  if (b <= 150000000) return b * 0.35 - 15440000;
  if (b <= 300000000) return b * 0.38 - 19940000;
  if (b <= 500000000) return b * 0.40 - 25940000;
  if (b <= 1000000000) return b * 0.42 - 35940000;
  return b * 0.45 - 65940000;
}

/** 산출세액 (국세) */
function expectNational(amount, years) {
  const converted = Math.max(0, (amount - svcDed(years)) / years * 12);
  const base = Math.max(0, converted - convDed(converted));
  return Math.floor(basicTax(base) / 12 * years);
}

/** 국세 + 지방소득세 (지방세법 §103의3). 화면이 쓰는 값이 이것이다 */
function expectTax(amount, years) {
  const nat = expectNational(amount, years);
  return nat + Math.floor(nat * 0.1);
}

/**
 * 화면이 낸 값 (원 단위, 국세 + 지방소득세).
 *
 * 화면 글자는 '1억 2,345만원' 처럼 만원 단위로 반올림하므로 그것으로 맞대면 1만원
 * 미만이 묻힌다. 원 단위를 적어 둔 줄에서 '합계' 뒤의 숫자만 떼어 읽는다.
 */
async function shownTax(page) {
  const l = page.getByLabel('이연퇴직소득세 원 단위', { exact: true });
  if (!(await l.count())) return null;
  const m = (await l.innerText()).replace(/\s+/g, ' ').match(/합계 ([0-9,]+)원/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

/** 화면이 적은 국세만 */
async function shownNational(page) {
  const l = page.getByLabel('이연퇴직소득세 원 단위', { exact: true });
  if (!(await l.count())) return null;
  const m = (await l.innerText()).replace(/\s+/g, ' ').match(/국세 ([0-9,]+)원/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

/** 근속연수가 정확히 n 년이 되는 입사일 */
const hireFor = (retire, years) => (Number(retire.slice(0, 4)) - years) + retire.slice(4);

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    const RETIRE = '2026-06-30';

    // ── 켜기 전에는 예전 그대로 ──────────────────────────────────
    // 원천징수영수증을 들고 온 고객은 그 값이 맞다. 계산값이 덮으면 안 된다.
    await fillCase(page, {
      name: '직접입력', birth: '650115', system: 'DB', joinDate: '2010-04-01',
      amount: 200000000, deferredTax: 7777777
    });
    t.is((await field(page, '이연 퇴직소득세').inputValue()).replace(/,/g, ''), '7777777',
      '계산을 켜기 전에는 직접 입력한 값이 그대로 있다');
    t.is(await shownTax(page), null, '켜기 전에는 계산 과정이 나오지 않는다');

    // ── 켜면 계산한다 ────────────────────────────────────────────
    await field(page, '퇴직일').fill(RETIRE);
    await field(page, '이연 퇴직소득세 직접 계산').check();
    await page.waitForTimeout(400);

    // 입사일이 없으면 계산하지 않고 무엇이 없는지 말한다
    const blocked = page.getByLabel('퇴직소득세 계산 미완', { exact: true });
    t.is(await blocked.count(), 1, '입사일이 없으면 못 한다고 말한다');
    t.includes((await blocked.innerText()).replace(/\s+/g, ' '), '입사일', '어느 칸이 없는지 이름을 댄다');
    t.is(await shownTax(page), null, '못 한 동안에는 값을 내지 않는다');

    // ── 조문에서 다시 전개한 숫자와 맞댄다 ───────────────────────
    //
    // 근속연수 구간(5·10·20년)과 환산급여 공제 구간을 지나도록 고른다.
    // 구간 안쪽만 보면 표를 한 줄 잘못 옮겨도 드러나지 않는다.
    const cases = [
      { y: 3, amt: 3000 * 만 },
      { y: 5, amt: 5000 * 만 },
      { y: 10, amt: 12000 * 만 },
      { y: 20, amt: 30000 * 만 },
      { y: 21, amt: 30000 * 만 },
      { y: 35, amt: 100000 * 만 }
    ];
    for (const c of cases) {
      await field(page, '입사일').fill(hireFor(RETIRE, c.y));
      await field(page, '퇴직급여').fill(String(c.amt));
      await page.waitForTimeout(300);
      t.is(await shownTax(page), expectTax(c.amt, c.y),
        '근속 ' + c.y + '년 · ' + (c.amt / 만) + '만원 세액이 세법 공식과 일치');
    }

    // 근속연수가 길수록 세금이 줄어든다 (공제가 커지고 환산급여 분모가 커진다)
    await field(page, '입사일').fill(hireFor(RETIRE, 10));
    await field(page, '퇴직급여').fill(String(30000 * 만));
    await page.waitForTimeout(300);
    const short = await shownTax(page);
    await field(page, '입사일').fill(hireFor(RETIRE, 30));
    await page.waitForTimeout(300);
    t.ok(await shownTax(page) < short, '같은 금액이면 근속이 길수록 세금이 적다');

    // 1년 미만의 기간은 1년으로 올린다 (시행령 §105②).
    //
    // **여기는 하루 차이로 갈리는 자리를 봐야 한다.** 처음에는 6개월 근속으로 검사했는데,
    // 그 경우는 절상을 지워도 최소 1년 바닥에 걸려 같은 답이 나왔다 - 절상 코드를
    // 통째로 빼도 27건이 전부 통과했다(음성 대조에서 드러남).
    await field(page, '입사일').fill('2006-06-30');      // 정확히 20년
    await page.waitForTimeout(300);
    t.is(await shownTax(page), expectTax(30000 * 만, 20), '만 20년이면 20년');
    await field(page, '입사일').fill('2006-06-29');      // 20년 + 1일
    await page.waitForTimeout(300);
    t.is(await shownTax(page), expectTax(30000 * 만, 21), '하루만 넘겨도 21년으로 올린다');
    await field(page, '입사일').fill('2026-01-05');      // 6개월
    await page.waitForTimeout(300);
    t.is(await shownTax(page), expectTax(30000 * 만, 1), '1년 미만 근속은 1년으로 본다');

    // ── 명예퇴직금도 합해 한 번에 과세한다 (§22) ─────────────────
    await field(page, '입사일').fill(hireFor(RETIRE, 20));
    await field(page, '퇴직급여').fill(String(20000 * 만));
    await field(page, '명예퇴직금').fill(String(10000 * 만));
    await page.waitForTimeout(400);
    t.is(await shownTax(page), expectTax(30000 * 만, 20),
      '법정퇴직금과 명예퇴직금을 합한 금액으로 한 번 계산한다');

    // 국세와 지방소득세를 갈라 적는다 - 영수증은 국세 기준이라 그 값도 있어야 한다
    t.is(await shownNational(page), expectNational(30000 * 만, 20),
      '국세를 따로 적는다 (영수증과 맞댈 값)');
    t.is(await shownTax(page), expectTax(30000 * 만, 20), '합계는 국세 + 지방소득세');
    t.includes((await page.getByLabel('이연퇴직소득세 원 단위', { exact: true }).innerText()),
      '지방소득세', '지방소득세가 포함되었다고 적는다');


    // ── 비과세 퇴직급여는 뺀다 ───────────────────────────────────
    await field(page, '비과세 퇴직급여').fill(String(5000 * 만));
    await page.waitForTimeout(350);
    t.is(await shownTax(page), expectTax(25000 * 만, 20), '비과세분은 퇴직소득금액에서 뺀다');
    await field(page, '비과세 퇴직급여').fill('0');
    await page.waitForTimeout(300);

    // ── 중간정산: 두 갈래를 다 내고 유리한 쪽을 쓴다 (§148) ──────
    await field(page, '중간정산 받음').check();
    await page.waitForTimeout(300);
    await field(page, '중간정산일').fill(hireFor(RETIRE, 10));
    await field(page, '중간정산 퇴직급여').fill(String(10000 * 만));
    await field(page, '중간정산 때 낸 퇴직소득세').fill(String(500 * 만));
    await page.waitForTimeout(450);

    const cmp = page.getByLabel('중간정산 정산특례 비교', { exact: true });
    t.is(await cmp.count(), 1, '중간정산이 있으면 두 갈래를 나란히 보여 준다');
    const cmpText = (await cmp.innerText()).replace(/\s+/g, ' ');
    t.includes(cmpText, '분리 (원칙)', '원칙 계산을 적는다');
    t.includes(cmpText, '정산특례', '정산특례 계산을 적는다');

    // 분리 = 정산일 다음 날부터 10년, 최종 퇴직급여만
    // 정산특례 = 입사일부터 20년, 합산 4억, 기납부 500만원 공제
    const withLocal = (nat) => nat + Math.floor(nat * 0.1);
    const sep = withLocal(expectNational(30000 * 만, 10));
    const settle = withLocal(Math.max(0, expectNational(40000 * 만, 20) - 500 * 만));
    t.is(await shownTax(page), Math.min(sep, settle), '두 갈래 중 적은 쪽을 쓴다');
    t.ok(settle < sep, '이 케이스에서는 정산특례가 유리하다');

    // 기납부세액이 클수록 정산특례 쪽 세금이 준다 (음성 대조용 방향 확인)
    const before = await shownTax(page);
    await field(page, '중간정산 때 낸 퇴직소득세').fill(String(1500 * 만));
    await page.waitForTimeout(400);
    t.ok(await shownTax(page) < before, '기납부세액을 늘리면 정산특례 세금이 준다');

    await field(page, '중간정산 받음').uncheck();
    await page.waitForTimeout(350);
    t.is(await page.getByLabel('중간정산 정산특례 비교', { exact: true }).count(), 0,
      '중간정산을 끄면 비교도 사라진다');

    // ── 계산값이 시뮬레이션까지 흘러간다 ─────────────────────────
    //
    // 값을 화면에 적어 두기만 하고 인출 세액에 쓰지 않으면 아무 쓸모가 없다.
    await field(page, '입사일').fill(hireFor(RETIRE, 20));
    await field(page, '퇴직급여').fill(String(30000 * 만));
    await field(page, '명예퇴직금').fill('0');
    await page.waitForTimeout(500);
    const used = await shownTax(page);
    t.ok(used > 0, '계산값이 0 이 아니다');

    // 총 예상 세액이 계산값을 실제로 먹는지 본다. 켜고 끄며 숫자가 움직여야 한다.
    await button(page, '인출 스케줄').click();
    await page.waitForTimeout(500);
    const totalTax = async () =>
      Number((await page.getByLabel('총 예상 세액', { exact: true }).innerText())
        .replace(/[^0-9]/g, ''));
    const taxOn = await totalTax();

    await field(page, '이연 퇴직소득세 직접 계산').uncheck();
    await page.waitForTimeout(500);
    t.is(await shownTax(page), null, '끄면 계산 과정이 사라진다');
    // 끄면 아까 직접 친 값(7,777,777)이 그대로 돌아온다 - 계산이 덮어쓰지 않았다
    t.is((await field(page, '이연 퇴직소득세').inputValue()).replace(/,/g, ''), '7777777',
      '끄면 직접 입력해 둔 값이 그대로 돌아온다');

    await field(page, '이연 퇴직소득세').fill('0');
    await page.waitForTimeout(500);
    const taxOff = await totalTax();
    t.ok(taxOn > taxOff,
      '계산값이 인출 세액까지 흘러간다 (켬 ' + taxOn + ' > 끔 ' + taxOff + ')');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
