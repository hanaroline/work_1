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
    const tax = (P0 > 0 ? tax0 * (dR / P0) * factor : 0) + dG * pRate;
    P -= dR; G -= dG;
    out.push({ k, ly, unlimited, begin, limit, draw, reduction: 1 - factor, tax, end: P + G });
  }
  return out;
}

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    // 구 연금저축(6년차 기산) · 퇴직급여 3억 · 15년 균등 · 3%
    await fillCase(page, {
      name: '검산', birth: '680410', system: 'SEV', joinDate: '1995-03-02',
      legal: 300000000, honor: 0, deferredTax: 12000000,
      pension: { join: '2010-06-15', balance: 1 },
      scope: '퇴직금 단독', mode: '기간 균등 분할', years: 15, rate: 3
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
      scope: '퇴직금 단독', mode: '기간 균등 분할', years: 5, rate: 0
    });
    const over = await scheduleRows(page);
    t.is(over[0][1], '1년차', '55세 미만 + 신규계좌라 1년차');
    t.near(num(over[0][4]), 3600, 1, '1회차 한도 3,600만원');
    t.near(num(over[0][5]), 6000, 1, '한도를 넘겨 6,000만원을 인출 (한도로 잘리지 않음)');
    t.includes(over[0][5], '연금외', '한도 초과분이 연금외수령으로 표시됨');
    t.includes(over[0][5], '2,400', '초과분 2,400만원');

    // 세액 검산: 퇴직소득 1원당 이연세액 0.1.
    // 연금수령분 3,600만 × 0.1 × 0.7(30% 감면) + 초과분 2,400만 × 0.1(감면 없음) = 492만원
    t.near(num(over[0][7]), 492, 1, '연금수령분만 감면되고 초과분은 전액 과세');

    // 같은 조건에서 '세법 한도 내 최대'로 바꾸면 한도까지만 빠진다
    await button(page, '세법 한도 내 최대').click();
    await page.waitForTimeout(500);
    const capped = await scheduleRows(page);
    t.near(num(capped[0][5]), 3600, 1, '한도 내 최대는 한도까지만 인출');
    t.excludes(capped[0][5], '연금외', '한도 내 최대에는 연금외수령이 없음');
    t.near(num(capped[0][7]), 252, 1, '3,600만 × 0.1 × 0.7 = 252만원');

    // ── 세액공제 받지 않은 금액은 가장 먼저, 세금 없이 빠진다 ──────
    // 기존 연금저축 평가액 1억 중 4,000만이 세액공제를 받지 않은 금액.
    // 1회차 인출분은 이 재원에서 먼저 나가므로 그만큼 세금이 붙지 않는다.
    await fillCase(page, {
      name: '과세제외', birth: '990101', system: 'SEV', joinDate: '2015-01-02',
      legal: 0, honor: 100000000, deferredTax: 20000000,
      pension: { join: '2016-01-04', balance: 100000000, exempt: 0 },
      scope: '기존 연금저축 합산', mode: '세법 한도 내 최대', years: 10, rate: 0
    });
    const noExempt = await scheduleRows(page);
    await field(page, '기존 연금저축 세액공제 받지 않은 금액').fill('40000000');
    await page.waitForTimeout(500);
    const withExempt = await scheduleRows(page);
    t.is(num(withExempt[0][5]), num(noExempt[0][5]), '과세제외 재원이 있어도 인출액은 같다');
    t.ok(num(withExempt[0][7]) < num(noExempt[0][7]),
      '과세제외 재원이 먼저 빠져 1회차 세액이 줄어든다 (' +
      num(noExempt[0][7]) + ' → ' + num(withExempt[0][7]) + '만원)');
    t.is(num(withExempt[0][7]), 0, '1회차 인출이 전액 과세제외 재원이면 세금 0');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
