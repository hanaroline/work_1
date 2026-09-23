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

    const exp = expected({
      P0: 300000000, G0: 0, tax0: 12000000,
      startLimitYear: 6, years: 15, rate: 0.03, startAge: 58, pastCount: 0
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

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
