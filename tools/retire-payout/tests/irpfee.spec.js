/**
 * 신규 IRP 수수료 — 미래에셋증권 개인형IRP 공시 (2026.1.12 시행).
 *
 * 요율을 상담자가 직접 치던 칸을 없애고 공시에서 자동으로 내게 했다. 칸 하나를
 * 없앤 대신 **가정이 코드 안으로 들어갔으므로**, 그 가정이 공시와 같은지 여기서 지킨다.
 *
 * 공시를 테스트에서 다시 옮겨 적고 손으로 전개해 맞댄다 (앱의 코드를 부르지 않는다).
 */
const { openApp, fillCase, field, button, scheduleRows } = require('./helpers');

const 만 = 10000;

/* ── 공시를 다시 옮겨 적는다 ──────────────────────────────────── */

/** 운용관리 - 적립금 규모별 체차적용 (1억 미만 0.20% / 1~3억 0.18% / 3억 이상 0.15%) */
function manageFee(bal) {
  const tier = [[100000000, 0.0020], [300000000, 0.0018], [Infinity, 0.0015]];
  let prev = 0, fee = 0;
  for (const [upto, rate] of tier) {
    if (bal <= prev) break;
    fee += (Math.min(bal, upto) - prev) * rate;
    prev = upto;
  }
  return fee;
}

/** 장기할인 - 2~4차년도 10% · 5~10차년도 12% · 11차년도~ 15% */
const longTerm = (k) => (k >= 11 ? 0.15 : k >= 5 ? 0.12 : k >= 2 ? 0.10 : 0);

/**
 * 그 해 실효요율 (%).
 * 자산관리 0.10% 정률. 연금을 1회 이상 받은 뒤부터 20% 할인. 할인은 곱으로 본다.
 */
function ratePct(bal, k, o) {
  o = o || {};
  if (o.waived) return 0;
  const manage = (o.ourDb && k <= 1) ? 0 : manageFee(bal);
  const asset = bal * 0.0010;
  const keep = (1 - longTerm(k)) * (1 - (k > 1 ? 0.20 : 0));
  return (manage + asset) * keep / bal * 100;
}

/** 안내문에서 '1회차 0.290%' 같은 숫자를 떼어 읽는다 */
async function noteRates(page) {
  const t = (await page.getByLabel('신규 IRP 요율 안내', { exact: true }).innerText()).replace(/\s+/g, ' ');
  return { text: t, nums: (t.match(/[0-9]+\.[0-9]{3}%/g) || []).map((x) => parseFloat(x)) };
}

/** 계좌 비교표에서 한 계좌의 요율 칸 */
async function compareRate(page, label) {
  await button(page, '계좌 비교').click();
  await page.waitForTimeout(400);
  const rows = await page.locator('table tbody tr').evaluateAll((rs) =>
    rs.map((r) => Array.from(r.querySelectorAll('td')).map((d) => d.innerText.trim())));
  const hit = rows.find((r) => r[0] && r[0].indexOf(label) === 0);
  return hit ? hit[3] : null;
}

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // 2013.3.1 이전 DB 가입자 → 신규 IRP 가 6년차로 최적이 된다. 배정액 2억.
    await fillCase(page, {
      name: '수수료', birth: '650115', system: 'DB', joinDate: '2005-03-02',
      retireDate: '2026-06-30', amount: 20000 * 만, deferredTax: 1000 * 만
    });
    await page.waitForTimeout(500);

    // ── 요율 입력칸은 없다 ────────────────────────────────────────
    t.is(await field(page, '신규 IRP 연간 수수료').count(), 0, '요율을 직접 치는 칸이 없다');
    t.is(await field(page, '당사 DB·DC 가입자').count(), 1, '대신 공시가 묻는 조건만 고른다');
    t.is(await field(page, '다이렉트 개설 및 직접 운용').count(), 1, '면제 조건도 고를 수 있다');

    // ── 체차적용 ──────────────────────────────────────────────────
    //
    // 2억이면 전액에 0.18% 가 아니다. 1억까지 0.20%, 1~2억 0.18% 로 쌓고
    // 자산관리 0.10% 를 더한다 → (20만 + 18만 + 20만) / 2억 = 0.290%
    const base = await noteRates(page);
    t.is(base.nums[0], Number(ratePct(20000 * 만, 1).toFixed(3)),
      '1회차 실효요율이 체차적용과 일치 (' + ratePct(20000 * 만, 1).toFixed(3) + '%)');
    t.is(base.nums[0], 0.290, '2억이면 0.290% - 전액 0.18% 가 아니다');

    // 3억을 넘기면 세 번째 구간이 열린다
    await field(page, '퇴직급여').fill(String(50000 * 만));
    await page.waitForTimeout(600);
    const big = await noteRates(page);
    t.is(big.nums[0], Number(ratePct(50000 * 만, 1).toFixed(3)),
      '5억이면 세 구간을 거쳐 ' + ratePct(50000 * 만, 1).toFixed(3) + '%');
    t.ok(big.nums[0] < base.nums[0], '적립금이 크면 실효요율이 낮다');
    await field(page, '퇴직급여').fill(String(20000 * 만));
    await page.waitForTimeout(600);

    // ── 장기할인 + 연금수령개시 할인 ──────────────────────────────
    //
    // 2회차는 장기할인 10% 와 연금수령개시 20% 가 함께 걸린다.
    const two = await noteRates(page);
    t.is(two.nums[1], Number(ratePct(20000 * 만, 2).toFixed(3)),
      '2회차는 장기할인 10% + 연금수령개시 20%');
    t.ok(two.nums[1] < two.nums[0], '1회차보다 2회차가 싸다');
    t.ok(two.nums[2] < two.nums[1], '회차가 쌓이면 더 싸진다 (11차년도 15%)');

    // ── 당사 DB·DC 가입자 → 1년간 운용관리수수료 면제 ─────────────
    await field(page, '당사 DB·DC 가입자').check();
    await page.waitForTimeout(600);
    const ourDb = await noteRates(page);
    t.is(ourDb.nums[0], Number(ratePct(20000 * 만, 1, { ourDb: true }).toFixed(3)),
      '1회차는 자산관리 0.10% 만 남는다');
    t.is(ourDb.nums[0], 0.100, '운용관리가 빠져 0.100%');
    t.is(ourDb.nums[1], two.nums[1], '2회차부터는 다시 운용관리가 붙는다 (1년 면제)');
    await field(page, '당사 DB·DC 가입자').uncheck();
    await page.waitForTimeout(500);

    // ── 다이렉트 개설 + 직접 운용 → 전액 면제 ─────────────────────
    await field(page, '다이렉트 개설 및 직접 운용').check();
    await page.waitForTimeout(600);
    t.includes((await noteRates(page)).text, '전액 면제', '면제 조건이면 그렇게 적는다');
    t.is(await compareRate(page, '신규 IRP'), '-', '비교표 요율도 면제로 표시');
    await field(page, '다이렉트 개설 및 직접 운용').uncheck();
    await page.waitForTimeout(500);

    // ── 비교표의 요율은 첫 해 실효요율이다 ────────────────────────
    t.is(await compareRate(page, '신규 IRP'), '0.29%', '비교표에 첫 해 실효요율이 뜬다');

    // ── 스케줄이 **해마다 다른 요율**을 실제로 쓰는가 ─────────────
    //
    // 처음에는 '면제를 켜고 끄면 결과가 달라지는가' 만 봤다. 그런데 연차별 요율
    // 함수를 통째로 지워도 고정요율(첫 해 실효요율)로 대체되어 수수료는 여전히
    // 붙고, 면제 체크도 그 고정요율을 바꾸므로 **결과는 달라진다.** 검사가 통과해
    // 버렸다 - 음성 대조에서 드러났다.
    //
    // 그래서 회차마다 금액을 맞댄다. 화면의 기초자산은 수수료를 뗀 뒤의 값이므로
    // 수수료 전 잔고는 기초자산 + 수수료이고, fee = 기초자산 × r / (1 − r) 이다.
    await button(page, '인출 스케줄').click();
    await page.waitForTimeout(600);
    const rows = await scheduleRows(page);
    let expectFee = 0;
    rows.forEach((r, i) => {
      const begin = Number(String(r[3]).replace(/[^0-9]/g, '')) * 만;   // 기초자산 (만원 표기)
      const r0 = ratePct(begin, i + 1) / 100;
      expectFee += begin * r0 / (1 - r0);
    });
    const shownFee = Number((await page.getByLabel('총 수수료', { exact: true })
      .getAttribute('title')).replace(/[^0-9]/g, ''));
    // 기초자산이 만원 단위로 반올림되어 표시되므로 회차당 최대 5천원의 오차가 쌓인다
    t.ok(Math.abs(shownFee - expectFee) < rows.length * 5000 + 10000,
      '총 수수료가 회차별 공시 요율의 합과 일치 (화면 ' + Math.round(shownFee) +
      ' / 재계산 ' + Math.round(expectFee) + ')');

    // 면제를 켜면 0 이 된다
    await field(page, '다이렉트 개설 및 직접 운용').check();
    await page.waitForTimeout(700);
    t.is(await page.getByLabel('총 수수료', { exact: true }).count(), 0, '면제면 총 수수료 칸이 사라진다');
    await field(page, '다이렉트 개설 및 직접 운용').uncheck();
    await page.waitForTimeout(600);

    // ── 기존 계좌 요율은 여전히 직접 받는다 (타사일 수 있다) ──────
    await fillCase(page, {
      name: '기존계좌', birth: '650115', system: 'DB', joinDate: '2005-03-02',
      retireDate: '2026-06-30', amount: 20000 * 만, deferredTax: 1000 * 만,
      irp: { join: '2010-05-05', balance: 1000 * 만, fee: 0.45 }
    });
    await page.waitForTimeout(600);
    t.is(await field(page, 'IRP 1 연간 수수료').inputValue(), '0.45', '기존 IRP 요율은 그대로 입력');
    t.is(await compareRate(page, 'IRP 1'), '0.45%', '기존 계좌는 입력한 요율을 쓴다');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
