/**
 * 인출 시뮬레이션 - 한도 공식과 3단계 감면.
 * 앱 결과를 세법 공식으로 다시 계산해 대조한다.
 */
const { openApp, fillCase, field, button, scheduleRows } = require('./helpers');

// '2,388 (199)' 처럼 두 수가 한 칸에 있으므로 앞의 수만 읽는다
const num = (s) => {
  const m = String(s).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
};

/** 앱과 독립적으로 계산한 기대 스케줄 (단위: 원) */
function expected({ P0, G0, tax0, startLimitYear, years, rate, startAge, pastCount }) {
  let P = P0, G = G0;
  const out = [];
  for (let k = 1; k <= years; k++) {
    if (k > 1) G += (P + G) * rate;
    const begin = P + G;
    if (begin <= 1) break;
    const ly = startLimitYear + k - 1;
    const unlimited = ly >= 11;
    const limit = unlimited ? Infinity : (begin / (11 - ly)) * 1.2;
    const draw = Math.min(begin / (years - k + 1), limit, begin);
    const dR = Math.min(draw, P);
    const dG = draw - dR;
    const ay = pastCount + k;
    const factor = ay <= 10 ? 0.7 : ay <= 20 ? 0.6 : 0.5;
    const age = startAge + k - 1;
    const pRate = age >= 80 ? 0.033 : age >= 70 ? 0.044 : 0.055;
    // 세액공제분·운용수익의 연금수령분이 연 1,500만원을 넘으면 저율 분리과세를
    // 쓸 수 없고 종합과세 / 16.5% 분리과세 선택 대상이 된다 (소득세법 §64의4)
    // 이연퇴직소득세는 국세 기준으로 받아 **지방소득세 10% 를 더해** 쓴다
    // (지방세법 §103의3). 같은 칸에 더해지는 연금소득세 5.5·4.4·3.3% 와
    // 기타소득세 16.5% 가 이미 지방세를 품은 세율이기 때문이다.
    const tax0Total = tax0 + Math.floor(Number((tax0 * 0.1).toFixed(6)));
    const tax = (P0 > 0 ? tax0Total * (dR / P0) * factor : 0) + dG * (dG > 15000000 ? 0.165 : pRate);
    P -= dR; G -= dG;
    out.push({ k, ly, unlimited, begin, limit, draw, reduction: 1 - factor, tax, end: P + G });
  }
  return out;
}

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // 이 스펙은 한도 공식·기산연차·세액을 본다. 신규 IRP 에 미래에셋 공시 수수료가
    // 붙으면 기초자산이 그만큼 줄어 한도 숫자가 흔들리므로, 여기서는 면제 조건을 켜
    // 수수료를 0 으로 두고 본다. 수수료 자체는 irpfee 스펙이 지킨다.
    await field(page, '다이렉트 개설 및 직접 운용').check();
    await page.waitForTimeout(200);

    // 구 연금저축(6년차 기산) · 퇴직급여 3억 · 15년 균등 · 3%
    await fillCase(page, {
      name: '검산', birth: '680410', system: 'SEV', joinDate: '1995-03-02',
      legal: 300000000, honor: 0, deferredTax: 12000000,
      pension: { join: '2010-06-15', balance: 1 },
      mode: '기간 균등 분할', years: 15, rate: 3
    });

    const rows = await scheduleRows(page);
    t.is(rows.length, 15, '15회차가 생성됨');

    // 1968년생이 2026년에 퇴직. 2010년 가입 계좌라 기산연차는 6년차지만,
    // 만 55세가 된 2023년에 이미 연금개시 요건을 갖춰 연차가 3년 누적되어 9년차로 시작한다.
    const exp = expected({
      P0: 300000000, G0: 0, tax0: 12000000,
      startLimitYear: 9, years: 15, rate: 0.03, startAge: 58, pastCount: 0
    });

    // 만원 단위 반올림 표시이므로 1만원 오차 허용
    for (const i of [0, 1, 4, 9, 14]) {
      const r = rows[i], e = exp[i];
      t.includes(r[1], (e.ly) + '년차', `${i + 1}회차 한도 연차`);
      t.near(num(r[3]), Math.round(e.begin / 10000), 1, `${i + 1}회차 기초자산`);
      if (e.unlimited) t.is(r[4], '전액', `${i + 1}회차 한도 해제`);
      else t.near(num(r[4]), Math.round(e.limit / 10000), 1, `${i + 1}회차 한도액`);
      t.near(num(r[5]), Math.round(e.draw / 10000), 1, `${i + 1}회차 인출액`);
      t.near(num(r[7]), Math.round(e.tax / 10000), 1, `${i + 1}회차 세액`);
      t.near(num(r[8]), Math.round(e.end / 10000), 1, `${i + 1}회차 기말잔액`);
    }
    t.is(num(rows[14][8]), 0, '15년 만에 전액 소진');

    // --- 3단계 감면: 30년 수령이면 21회차부터 50% ---
    await field(page, '수령 기간').fill('30');
    await page.waitForTimeout(500);
    const long = await scheduleRows(page);
    const red = long.map((r) => r[6]);
    t.is(red[0], '30%', '1회차 30% 감면');
    t.is(red[9], '30%', '10회차 30% 감면');
    t.is(red[10], '40%', '11회차 40% 감면');
    t.is(red[19], '40%', '20회차 40% 감면');
    t.is(red[20], '50%', '21회차 50% 감면');

    // 퇴직소득 재원이 소진된 뒤에는 감면 표시가 사라진다
    const depleted = long.findIndex((r) => r[6] === '-');
    t.ok(depleted > 20, '퇴직소득 재원 소진 후에만 감면율이 - 로 바뀜');

    // --- 과거 수령 횟수가 실제 연차에 얹힌다 ---
    await field(page, '과거 연금 수령 횟수').fill('9');
    await page.waitForTimeout(500);
    const past = await scheduleRows(page);
    t.is(past[0][2], '10년차', '과거 9회 + 1회차 = 실제 10년차');
    t.is(past[0][6], '30%', '10년차까지는 30%');
    t.is(past[1][6], '40%', '11년차부터 40%');

    // ── 한도는 인출 상한이 아니다 - 넘겨 빼면 연금외수령으로 과세된다 ──
    // 1년차 기산 · 3억 · 5년 균등이면 1회차 균등분(6,000만)이 한도(3,600만)를 넘는다.
    // 한도 = 3억 ÷ (11-1) × 120% = 3,600만원, 초과분 2,400만원.
    await fillCase(page, {
      name: '한도초과', birth: '990101', system: 'SEV', joinDate: '2015-01-02',
      legal: 300000000, honor: 0, deferredTax: 30000000,
      mode: '기간 균등 분할', years: 5, rate: 0
    });
    const over = await scheduleRows(page);
    t.is(over[0][1], '1년차', '55세 미만 + 신규계좌라 1년차');
    t.near(num(over[0][4]), 3600, 1, '1회차 한도 3,600만원');
    t.near(num(over[0][5]), 6000, 1, '한도를 넘겨 6,000만원을 인출 (한도로 잘리지 않음)');
    t.includes(over[0][5], '연금외', '한도 초과분이 연금외수령으로 표시됨');
    t.includes(over[0][5], '2,400', '초과분 2,400만원');

    // 세액 검산: 이연퇴직소득세 3,000만원(국세) + 지방소득세 300만원 = 3,300만원.
    // 퇴직소득 3억 기준 1원당 0.11.
    // 연금수령분 3,600만 × 0.11 × 0.7(30% 감면) + 초과분 2,400만 × 0.11 = 541.2만원
    t.near(num(over[0][7]), 541, 1, '연금수령분만 감면되고 초과분은 전액 과세');

    // 같은 조건에서 '세법 한도 내 최대'로 바꾸면 한도까지만 빠진다
    await button(page, '세법 한도 내 최대').click();
    await page.waitForTimeout(500);
    const capped = await scheduleRows(page);
    t.near(num(capped[0][5]), 3600, 1, '한도 내 최대는 한도까지만 인출');
    t.excludes(capped[0][5], '연금외', '한도 내 최대에는 연금외수령이 없음');
    t.near(num(capped[0][7]), 277, 1, '3,600만 × 0.11 × 0.7 = 277.2만원 (지방소득세 포함)');

    // ── ③재원 연금수령분이 연 1,500만원을 넘으면 저율 분리과세를 못 쓴다 ──
    //
    // 세액공제 받은 납입액·운용수익의 연금수령분이 연 1,500만원을 넘으면 3.3~5.5%
    // 저율 분리과세가 아니라 종합과세와 16.5% 분리과세 중에서 고르게 된다(소득세법
    // §64의4). 어느 쪽을 골라도 16.5% 를 넘지 않으므로 그 기준으로 계산한다.
    // 이연퇴직소득 연금수령분과 과세제외분은 이 판정에 들어가지 않는다.
    //
    // 만 58세 · 2000년 가입 연금저축(9년차) 3억 합산 · 퇴직급여 100만원 · 5년 균등 · 0%
    //   1회차 인출 6,020만 = 퇴직소득 100만 + ③재원 5,920만
    //   한도 3.01억 ÷ (11-9) × 120% = 1억 8,060만이라 전액 연금수령이다.
    //   5,920만 × 16.5% = 976.8만원
    await fillCase(page, {
      name: '분리과세', birth: '680410', system: 'SEV', joinDate: '1995-03-02',
      legal: 1000000, honor: 0, deferredTax: 0,
      pension: { join: '2000-01-03', balance: 300000000, exempt: 0, merge: true },
      irp: false, mode: '기간 균등 분할', years: 5, rate: 0
    });
    const big = await scheduleRows(page);
    t.is(big[0][1], '9년차', '2000년 가입 + 만 58세 → 9년차');
    t.near(num(big[0][5]), 6020, 1, '1회차 인출 6,020만원');
    t.excludes(big[0][5], '연금외', '한도 안이라 전액 연금수령');
    t.includes(big[0][5], '1,500만 초과', '1,500만원 초과를 표시');
    t.near(num(big[0][7]), 977, 1, '5,920만 × 16.5% = 977만원 (5.5% 가 아님)');

    // 같은 조건에서 ③재원만 줄여 1,500만원 밑으로 내리면 5.5% 로 돌아온다 (음성 대조)
    //   잔고 7,000만 → 1회차 인출 1,420만 = 퇴직소득 100만 + ③재원 1,320만
    //   1,320만 × 5.5% = 72.6만원
    await field(page, '연금저축 1 평가액').fill('70000000');
    await page.waitForTimeout(500);
    const small = await scheduleRows(page);
    t.near(num(small[0][5]), 1420, 1, '1회차 인출 1,420만원');
    t.excludes(small[0][5], '1,500만 초과', '1,500만원 이하면 표시가 없음');
    t.near(num(small[0][7]), 73, 1, '1,320만 × 5.5% = 73만원');

    // ── 세액공제 받지 않은 금액은 가장 먼저, 세금 없이 빠진다 ──────
    // 연금저축 1 평가액 1억 중 4,000만이 세액공제를 받지 않은 금액.
    // 1회차 인출분은 이 재원에서 먼저 나가므로 그만큼 세금이 붙지 않는다.
    await fillCase(page, {
      name: '과세제외', birth: '990101', system: 'SEV', joinDate: '2015-01-02',
      legal: 0, honor: 100000000, deferredTax: 20000000,
      pension: { join: '2016-01-04', balance: 100000000, exempt: 0, merge: true },
      mode: '세법 한도 내 최대', years: 10, rate: 0
    });
    const noExempt = await scheduleRows(page);
    await field(page, '연금저축 1 세액공제 받지 않은 금액').fill('40000000');
    await page.waitForTimeout(500);
    const withExempt = await scheduleRows(page);
    t.is(num(withExempt[0][5]), num(noExempt[0][5]), '과세제외 재원이 있어도 인출액은 같다');
    t.ok(num(withExempt[0][7]) < num(noExempt[0][7]),
      '과세제외 재원이 먼저 빠져 1회차 세액이 줄어든다 (' +
      num(noExempt[0][7]) + ' → ' + num(withExempt[0][7]) + '만원)');
    t.is(num(withExempt[0][7]), 0, '1회차 인출이 전액 과세제외 재원이면 세금 0');

    // ── 스케줄 탭에서도 시뮬레이션 계좌를 바꾼다 ──────────────────
    //
    // 분할 입금이면 계좌가 둘인데, 스케줄을 보다가 다른 계좌로 바꾸려면 판정 탭까지
    // 되돌아가야 했다. 같은 상태(pickedId)를 쓰므로 어느 쪽에서 바꿔도 함께 움직인다.
    await fillCase(page, {
      name: '분할', birth: '650115', system: 'DC', joinDate: '2003-07-01',
      retireDate: '2026-06-30', amount: 250000000, honor: 300000000, deferredTax: 20000000,
      pension: { join: '2005-06-05', balance: 10000000 }
    });
    await page.waitForTimeout(600);
    await button(page, '인출 스케줄').click();
    await page.waitForTimeout(600);

    const pick = field(page, '시뮬레이션 계좌');
    t.is(await pick.count(), 1, '스케줄 탭에 계좌 선택 상자가 있다');
    const optLabels = await pick.locator('option').allInnerTexts();
    t.is(optLabels.length, 2, '분할 입금이라 고를 계좌가 둘');
    t.ok(optLabels.every((o) => /년차/.test(o) && /배정/.test(o)),
      '연차와 배정액이 함께 적혀 어느 쪽인지 구분된다 - ' + JSON.stringify(optLabels));

    const assetOf = async () =>
      Number((await page.getByLabel('시뮬레이션 대상 자산', { exact: true }).innerText())
        .replace(/[^0-9]/g, ''));
    const values = await pick.locator('option').evaluateAll((os) => os.map((o) => o.value));
    const first = await pick.inputValue();
    const firstAsset = await assetOf();

    const second = values.find((v) => v !== first);
    await pick.selectOption(second);
    await page.waitForTimeout(700);
    t.is(await pick.inputValue(), second, '상자에서 바꾼 계좌가 선택된다');
    t.ok(await assetOf() !== firstAsset,
      '스케줄이 그 계좌로 다시 계산된다 (대상 자산이 바뀜)');

    // 판정 탭의 선택과 같은 상태다 - 한쪽에서 바꾸면 다른 쪽도 따라간다
    await button(page, '판정').click();
    await page.waitForTimeout(500);
    const highlighted = await page.locator('div.border-mas-orange.ring-2').first().innerText();
    const secondLabel = optLabels[values.indexOf(second)].split(' · ')[0];
    t.includes(highlighted.split('\n')[0], secondLabel,
      '판정 탭에서도 같은 계좌가 골라져 있다');

    // 고를 것이 하나뿐이면 상자를 두지 않는다
    await fillCase(page, {
      name: '단일', birth: '650115', system: 'SEV', joinDate: '2003-07-01',
      retireDate: '2026-06-30', legal: 200000000, honor: 0, deferredTax: 10000000,
      pension: false, irp: false
    });
    await page.waitForTimeout(600);
    await button(page, '인출 스케줄').click();
    await page.waitForTimeout(600);
    t.is(await field(page, '시뮬레이션 계좌').count(), 0,
      '고를 계좌가 하나면 선택 상자를 두지 않는다');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
