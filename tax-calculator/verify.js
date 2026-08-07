/* ============================================================================
 * 검증 스크립트 — 세미나 자료(2026년 세제개편안 해설, 50p)의 사례와 대조
 * ----------------------------------------------------------------------------
 * 실행 : node verify.js
 *
 * 세미나 자료의 계산 사례를 회귀 테스트로 고정한 것입니다.
 * 자료 자체에 산술 오류가 있는 3개 항목은 EXPECTED_DIFF 로 분리해 두었습니다
 * (자료가 함께 제시한 과세표준·세율로 재계산하면 자료의 결과값과 맞지 않음).
 * ==========================================================================*/
'use strict';

var T = require('./tax-engine.js').TaxEngine;
var E = T.EOK;

var pass = 0, fail = 0;
function man(n) { return (Math.round(n) / 10000).toFixed(0) + '만원'; }

function chk(label, got, want, tolRatio) {
  var tol = Math.abs(want) * (tolRatio || 0.01) + 20000;
  var ok = Math.abs(got - want) <= tol;
  ok ? pass++ : fail++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + label +
              '\n        계산 ' + man(got) + '  /  자료 ' + man(want));
}

// 금액이 아닌 값(율 등) 대조
function chkVal(label, got, want, unit) {
  var ok = Math.abs(got - want) < 1e-6;
  ok ? pass++ : fail++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + label +
              '\n        계산 ' + got + (unit || '') + '  /  자료 ' + want + (unit || ''));
}

function head(s) { console.log('\n' + s); }

/* -------------------------------------------------------------------------- */
head('■ p.46  재산세 — 공시가격 10.83억, 1세대 1주택, 부부 50:50');
var pt = T.propertyTax({ gongsi: 10.83 * E, isOneHouse: true, share: 0.5, urban: true });
chk('재산세 본세', pt.main, 1319400);
chk('도시지역분', pt.urban, 682290);
chk('지방교육세', pt.edu, 263880);
chk('합계 (주택 전체)', pt.total, 2265570);
chk('1인 부담 (지분 50%)', pt.myShare, 1132785);

/* -------------------------------------------------------------------------- */
head('■ p.39  종부세 — 실거주 1주택 공시 13.8억 (2027년 과세문턱 미달)');
var s39a = T.comprehensiveTax({ year: 2026, houses: [{ gongsi: 13.8 * E, resided: true }],
  share: 1, isOne1H: true, age: 60, holdY: 12, liveY: 12 });
var s39b = T.comprehensiveTax({ year: 2027, houses: [{ gongsi: 13.8 * E, resided: true }],
  share: 1, isOne1H: true, age: 60, holdY: 12, liveY: 12 });
chk('2026 과세표준 (자료 1.08억)', s39a.taxBase, 1.08 * E);
chk('2026 산출세액 (자료 54만)', s39a.gross, 540000);
console.log('  ' + (s39b.blockedByThreshold ? 'PASS' : 'FAIL') +
            '  2027 과세대상 문턱 14억 미달 → 0원\n        계산 ' +
            (s39b.blockedByThreshold ? '과세 제외' : man(s39b.net)) + '  /  자료 0원');
s39b.blockedByThreshold ? pass++ : fail++;

/* -------------------------------------------------------------------------- */
head('■ p.40  종부세 — 비거주 1주택 공시 22억, 2027년');
var s40 = T.comprehensiveTax({ year: 2027, houses: [{ gongsi: 22 * E, resided: false }],
  share: 1, isOne1H: true, age: 55, holdY: 8, liveY: 0 });
chk('기본공제 9억 적용 → 과세표준 (자료 9.1억)', s40.taxBase, 9.1 * E);
chk('산출세액 (자료 763만)', s40.gross, 7630000);

/* -------------------------------------------------------------------------- */
head('■ p.41  종부세 — 실거주 초고가 공시 30억, 65세, 보유·거주 12년');
var s41 = T.comprehensiveTax({ year: 2027, houses: [{ gongsi: 30 * E, resided: true }],
  share: 1, isOne1H: true, age: 65, holdY: 12, liveY: 12 });
chk('2027 과세표준 (자료 11.2억)', s41.taxBase, 11.2 * E);
chk('2027 산출세액 (자료 1,036만)', s41.gross, 10360000);
chkVal('세액공제율 (연령 30% + 거주 40%)', s41.creditRate.total * 100, 70, '%');
chkVal('세액공제 금액한도 2027년 800만원', s41.creditCap / 10000, 800, '만원');
chkVal('세액공제 금액한도 2028년 600만원',
  T.comprehensiveTax({ year: 2028, houses: [{ gongsi: 30 * E, resided: true }],
    share: 1, isOne1H: true, age: 65, holdY: 12, liveY: 12 }).creditCap / 10000, 600, '만원');

/* -------------------------------------------------------------------------- */
head('■ p.42  종부세 — 2주택 조정지역 공시 9억 + 7억, 55세');
function s42(year, residedIdx) {
  return T.comprehensiveTax({ year: year, share: 1, isOne1H: false, age: 55, holdY: 8, liveY: 8,
    houses: [{ gongsi: 9 * E, resided: residedIdx === 0, adjusted: true },
             { gongsi: 7 * E, resided: residedIdx === 1, adjusted: true }] });
}
chk('현행 2026 · 기본공제 9억 (자료 234만)', s42(2026, 0).gross, 2340000);
chk('A안 9억주택 거주 · 기본공제 산식 (자료 6.81억)', s42(2027, 0).basicDeduction, 6.8125 * E);
chk('A안 2027 과세표준 (자료 6.43억)', s42(2027, 0).taxBase, 6.43125 * E);
chk('A안 2028 공정비율 80% 적용 (자료 536만)', s42(2028, 0).gross, 5360000);

/* -------------------------------------------------------------------------- */
head('■ p.43  양도세 — 갭투자 (취득 8억 → 양도 25억, 보유 12년 · 거주 0년, 비과세)');
[[2027, 269700000], [2028, 318710000], [2029, 367720000]].forEach(function (r) {
  var g = T.capitalGainsTax({ year: r[0], salePrice: 25 * E, buyPrice: 8 * E, expenses: 0,
    share: 1, houseCount: 1, holdY: 12, liveY: 0, exempt: true });
  chk(r[0] + '년 양도세 (지방소득세 포함)', g.total, r[1]);
});

/* -------------------------------------------------------------------------- */
head('■ p.44  양도세 — 15년 거주 1주택 (취득 6억 → 양도 28억), 65세');
var a44 = T.capitalGainsTax({ year: 2027, salePrice: 28 * E, buyPrice: 6 * E, expenses: 0,
  share: 1, houseCount: 1, holdY: 15, liveY: 15, exempt: true });
chk('단독명의 2027 (자료 7,271만)', a44.total, 72710000);
var b44 = T.capitalGainsTax({ year: 2029, salePrice: 28 * E, buyPrice: 6 * E, expenses: 0,
  share: 1, houseCount: 1, holdY: 15, liveY: 15, exempt: true });
chk('단독명의 2029 · 인별 한도 10억 적용 (자료 7,510만)', b44.total, 75100000);
var c44 = T.capitalGainsTax({ year: 2029, salePrice: 28 * E, buyPrice: 6 * E, expenses: 0,
  share: 0.5, houseCount: 1, holdY: 15, liveY: 15, exempt: true });
chk('부부 공동명의 2029 합산 · 물건별 한도 안분 (자료 4,578만)', c44.total * 2, 45780000);

/* -------------------------------------------------------------------------- */
head('■ p.30  양도세 — 조정지역 3주택 중과, 과세표준 5억');
[[2027, 246470000], [2028, 273970000]].forEach(function (r) {
  var g = T.capitalGainsTax({ year: r[0], salePrice: 5 * E + 2500000 + 1, buyPrice: 0,
    expenses: 0, share: 1, houseCount: 3, holdY: 5, liveY: 0, exempt: false, heavyTaxed: true });
  chk(r[0] + '년 중과 (지방소득세 포함)', g.total, r[1]);
});
// 「현행」열 = 개정 전 +30%p 기준선 (2026년 양도분이 아님)
chk('개정 전 기준선 +30%p (자료 3억 5,647만)',
  (function () {
    var b = 5 * E, row = T.CG_RATES.filter(function (x) { return b <= x[0]; })[0];
    return (b * (row[1] + 0.30) - row[2]) * 1.1;
  })(), 356470000);

/* -------------------------------------------------------------------------- */
head('■ p.49  시뮬레이션 — 부부 50:50 (취득 10억 → 양도 19.5억, 보유 10년 · 거주 0년)');
var s49 = T.capitalGainsTax({ year: 2027, salePrice: 19.5 * E, buyPrice: 10 * E, expenses: 0,
  share: 0.5, houseCount: 1, holdY: 10, liveY: 0, exempt: true });
chk('2027 부부 합산 (자료 7,622만)', s49.total * 2, 76220000, 0.02);
var s49b = T.capitalGainsTax({ year: 2029, salePrice: 19.5 * E, buyPrice: 10 * E, expenses: 0,
  share: 0.5, houseCount: 1, holdY: 10, liveY: 10, exempt: true });
chk('10년 거주 전환 시 2029 부부 합산 (자료 152만)', s49b.total * 2, 1520000, 0.05);

/* -------------------------------------------------------------------------- */
head('■ p.47  종부세 — 부부 공동명의 비거주 1주택 공시 10.83억, 2027년');
var ind = T.comprehensiveTax({ year: 2027, houses: [{ gongsi: 10.83 * E, resided: false, adjusted: true }],
  share: 0.5, isOne1H: false, age: 55, holdY: 10, liveY: 0 });
var spe = T.comprehensiveTax({ year: 2027, houses: [{ gongsi: 10.83 * E, resided: false, adjusted: true }],
  share: 0.5, wholeUnit: true, isOne1H: true, age: 55, holdY: 10, liveY: 0 });
var both0 = ind.total === 0 && spe.total === 0;
console.log('  ' + (both0 ? 'PASS' : 'FAIL') + '  개별과세(인별 9억) · 특례(전체 14억) 모두 문턱 미달 → 0원' +
            '\n        계산 개별 ' + man(ind.total) + ' / 특례 ' + man(spe.total) + '  /  자료 둘 다 0원');
both0 ? pass++ : fail++;

/* ==========================================================================
 * 자료 자체의 산술 오류로 대조에서 제외한 항목
 * ========================================================================*/
console.log('\n■ 자료 산술 오류로 대조 제외 (자료가 제시한 과세표준·세율로 재계산 시 불일치)');
[
  ['p.42 A안 2027년 종부세', '자료 366만원',
   '과세표준 6.43125억에 자료가 명시한 세율(0.5/0.7/1.3%)을 적용하면 416만원. ' +
   '동일 구조인 A안 2028년은 자료값과 정확히 일치하므로 2027년 행의 계산 착오로 판단'],
  ['p.42 C안(전부 비거주) 2027·2028년', '자료 491만 / 748만원',
   '각각 672만원 / 828만원이 정확한 값'],
  ['p.49 2028·2029년 양도세', '자료 8,542만 / 1억 150만원',
   '자료가 제시한 1인 과세표준(1.619억 / 1.802억)에 38% 구간·누진공제 1,994만원을 적용하면 ' +
   '9,150만원 / 1억 677만원']
].forEach(function (r) {
  console.log('  SKIP  ' + r[0] + '  (' + r[1] + ')\n        ' + r[2]);
});

console.log('\n──────────────  자료 대조 소계 : 통과 ' + pass + '  /  실패 ' + fail + '  ──────────────');

/* ==========================================================================
 * PART 2 — 상한 장치 3종 및 개편안 반영 ON/OFF 토글
 *   금액은 chk(오차 허용), 비율·플래그는 chkVal(정확 일치)로 대조한다.
 * ========================================================================*/
function flag(label, got, want) { chkVal(label, got ? 1 : 0, want ? 1 : 0); }

head('■ 재산세 과세표준상한제 (지방세법 §110의2) — 직전연도 과표 상당액 × 105%');
{
  var noCap = T.propertyTax({ gongsi: 10 * E, isOneHouse: true, share: 1, urban: true });
  var cap = T.propertyTax({ gongsi: 10 * E, isOneHouse: true, share: 1, urban: true, prevGongsi: 8 * E });
  console.log('        공시 8억 → 10억(+25%) · 공정비율 45%');
  chk('과세표준상한액 = 8억 × 45% × 1.05 = 3.78억', cap.taxBase, 8 * E * 0.45 * 1.05, 0.00001);
  chk('상한 미적용 시 과세표준 = 10억 × 45% = 4.5억', noCap.taxBase, 10 * E * 0.45, 0.00001);
  flag('상한 적용 플래그', cap.baseCapped, 1);
  flag('상한으로 본세가 실제로 줄어듦', cap.main < noCap.main, 1);
  chkVal('과표상한율', cap.capRate, 0.05);
  var down = T.propertyTax({ gongsi: 10 * E, isOneHouse: true, share: 1, urban: true, prevGongsi: 12 * E });
  flag('직전연도가 더 높으면 상한 미작동', down.baseCapped, 0);
  chk('이때 과세표준은 원래값 유지', down.taxBase, noCap.taxBase, 0.00001);
}

head('■ 재산세 세부담상한제 (지방세법 §122) — 공시가격 구간별 105/110/130%');
{
  chkVal('공시 3억 이하 → 105%', T.propBurdenCapRate(2.5 * E), 1.05);
  chkVal('공시 3~6억 → 110%', T.propBurdenCapRate(5 * E), 1.10);
  chkVal('공시 6억 초과 → 130%', T.propBurdenCapRate(10 * E), 1.30);
  var prev = 500000;
  var r = T.propertyTax({ gongsi: 10 * E, isOneHouse: true, share: 1, urban: true, prevMain: prev, year: 2027 });
  chk('전년 본세 50만원 → 상한 130% = 65만원', r.main, prev * 1.30, 0.00001);
  flag('상한 적용 플래그', r.burdenCapped, 1);
  var r29 = T.propertyTax({ gongsi: 10 * E, isOneHouse: true, share: 1, urban: true, prevMain: prev, year: 2029 });
  flag('2029년 주택분 세부담상한 폐지 → 미적용', r29.burdenCapped, 0);
  flag('2028년까지는 적용 가능', T.propertyTax({ gongsi: 10 * E, isOneHouse: true, prevMain: prev, year: 2028 }).burdenCapAvailable, 1);
}

head('■ 종부세 세부담상한 (종부법 §10) — 150% → 개편안 200%');
{
  var base = { houses: [{ gongsi: 40 * E, resided: false, adjusted: true }], share: 1,
               isOne1H: true, age: 50, holdY: 5, liveY: 0, skipPropDeduct: true };
  var prev = 5000000;
  var c26 = T.comprehensiveTax(Object.assign({ year: 2026, prevYearTotal: prev }, base));
  var c27 = T.comprehensiveTax(Object.assign({ year: 2027, prevYearTotal: prev }, base));
  var free = T.comprehensiveTax(Object.assign({ year: 2027 }, base));
  console.log('        상한 미적용 2027년 종부세 : ' + man(free.net));
  chkVal('2026년 상한율', c26.capLimit, 1.5);
  chkVal('2027년 상한율', c27.capLimit, 2.0);
  flag('두 해 모두 상한이 실제로 작동', c26.capApplied && c27.capApplied, 1);
  chk('상한 천장 = 전년 총세액 × 200% − 재산세', c27.net, prev * 2.0 - c27.propTaxRef, 0.00001);
  flag('상한 200%가 150%보다 세액이 큼(완충 약화)', c27.net > c26.net, 1);
  flag('전년 보유세 미입력 시 상한 미작동', free.capApplied, 0);
}

head('■ 개편안 반영 ON/OFF — 종부세 (비거주 1주택 공시 22억, 2027년)');
{
  var arg = { year: 2027, houses: [{ gongsi: 22 * E, resided: false }], share: 1,
              isOne1H: true, age: 55, holdY: 8, liveY: 0, skipPropDeduct: true };
  var on = T.comprehensiveTax(Object.assign({ reform: true }, arg));
  var off = T.comprehensiveTax(Object.assign({ reform: false }, arg));
  chkVal('OFF 규칙연도 = 2026(현행 고정)', off.ruleYear, 2026);
  chkVal('ON  규칙연도 = 2027', on.ruleYear, 2027);
  chk('OFF 기본공제 = 현행 12억', off.basicDeduction, 12 * E, 0.00001);
  chk('ON  기본공제 = 개편 9억(비거주)', on.basicDeduction, 9 * E, 0.00001);
  chkVal('OFF 공정시장가액비율 60%', off.fairRatio, 0.60);
  chkVal('ON  공정시장가액비율 70%', on.fairRatio, 0.70);
  chkVal('OFF 기간공제 = 보유 8년 20%', off.creditRate.period, 0.20);
  // 2027년은 경과규정 : 보유공제(10/20/25%)와 거주공제(20/40/50%) 중 높은 쪽.
  // 보유 8년 → 보유공제 10%가 적용된다. 자료 p.40 은 이 경과규정을 생략하고
  // 세액공제 0원으로 표기했으나, 자료 p.16 의 경과규정 표에 따르면 10%가 정상.
  chkVal('ON  기간공제 = 2027 경과규정상 보유 8년 10%', on.creditRate.period, 0.10);
  chkVal('ON  2028년에는 거주공제만 → 0%', T.comprehensiveTax(Object.assign({}, arg,
    { year: 2028, reform: true })).creditRate.period, 0);
  chk('ON 산출세액 = 자료 p.40 의 763만원', on.gross, 7630000);
  flag('OFF 세액 < ON 세액 (비거주 증세 효과가 분리됨)', off.net < on.net, 1);
  console.log('        OFF ' + man(off.net) + '  →  ON ' + man(on.net));
}

head('■ 개편안 반영 ON/OFF — 양도세 (취득 8억 → 양도 25억, 보유 12년 · 거주 0년)');
{
  var arg = { salePrice: 25 * E, buyPrice: 8 * E, expenses: 0, share: 1,
              houseCount: 1, holdY: 12, liveY: 0, exempt: true };
  var on = T.capitalGainsTax(Object.assign({ year: 2029, reform: true }, arg));
  var off = T.capitalGainsTax(Object.assign({ year: 2029, reform: false }, arg));
  chkVal('OFF 규칙연도 = 2025(현행 고정)', off.ruleYear, 2025);
  chkVal('ON  2029 공제율 0% (거주 0년 → 보유공제 폐지)', on.ltRate, 0);
  chkVal('OFF 2029 공제율 24% (현행 보유 연 2% × 12년)', off.ltRate, 0.24);
  chk('OFF 세액 = 현행 기준 2억 6,970만원', off.total, 269700000);
  chk('ON  세액 = 자료 3억 6,772만원', on.total, 367720000);
  console.log('        OFF ' + man(off.total) + '  →  ON ' + man(on.total));

  var hArg = { year: 2027, salePrice: 5 * E + 2500000 + 1, buyPrice: 0, expenses: 0, share: 1,
               houseCount: 3, holdY: 5, liveY: 0, exempt: false, heavyTaxed: true };
  chkVal('중과 ON 2027 = +10%p 한시완화', T.capitalGainsTax(Object.assign({ reform: true }, hArg)).surcharge, 0.10);
  chkVal('중과 OFF = 현행 +30%p', T.capitalGainsTax(Object.assign({ reform: false }, hArg)).surcharge, 0.30);
  chk('중과 OFF 세액 = 자료 3억 5,647만원', T.capitalGainsTax(Object.assign({ reform: false }, hArg)).total, 356470000);

  var bArg = { year: 2027, salePrice: 28 * E, buyPrice: 6 * E, expenses: 0, share: 1,
               houseCount: 1, holdY: 15, liveY: 15, exempt: true };
  chk('기본공제 ON = 2,500만원 특례', T.capitalGainsTax(Object.assign({ reform: true }, bArg)).basicDed, 25000000, 0.00001);
  chk('기본공제 OFF = 250만원', T.capitalGainsTax(Object.assign({ reform: false }, bArg)).basicDed, 2500000, 0.00001);
  flag('고령 지방이주 감면은 개편안 항목 → OFF 시 미적용',
    T.capitalGainsTax(Object.assign({ reform: false, seniorRelief: true }, bArg)).relief === 0, 1);
}

head('■ 지역자원시설세(소방분) 누진 구간표');
{
  chkVal('과표 600만원 = 600만 × 0.04%', T.fireFacilityTax(6000000), 2400, '원');
  chkVal('과표 1,300만원 = 2,400 + 700만 × 0.05%', T.fireFacilityTax(13000000), 5900, '원');
  chkVal('과표 2,600만원 = 5,900 + 1,300만 × 0.06%', T.fireFacilityTax(26000000), 13700, '원');
  chkVal('과표 3,900만원 = 13,700 + 1,300만 × 0.08%', T.fireFacilityTax(39000000), 24100, '원');
  chkVal('과표 6,400만원 = 24,100 + 2,500만 × 0.10%', T.fireFacilityTax(64000000), 49100, '원');
  chkVal('과표 1억원 = 49,100 + 3,600만 × 0.12%', T.fireFacilityTax(100000000), 92300, '원');
}

head('■ 회귀 확인 — 상한 입력이 없으면 종전 결과와 완전히 동일');
{
  var r = T.propertyTax({ gongsi: 10.83 * E, isOneHouse: true, share: 0.5, urban: true });
  chk('자료 p.46 재산세 합계 2,265,570원 유지', r.total, 2265570, 0.00001);
  flag('과표상한 미작동', r.baseCapped, 0);
  flag('세부담상한 미작동', r.burdenCapped, 0);
  var c = T.comprehensiveTax({ year: 2027, houses: [{ gongsi: 30 * E, resided: true }], share: 1,
    isOne1H: true, age: 65, holdY: 12, liveY: 12, skipPropDeduct: true });
  chk('자료 p.41 종부세 산출세액 1,036만원 유지', c.gross, 10360000);
  flag('세부담상한 미작동', c.capApplied, 0);
  flag('기본값은 개편안 반영(reform 기본 true)', c.reform, 1);
}

console.log('\n══════════════  최종 : 통과 ' + pass + '  /  실패 ' + fail + '  ══════════════\n');
process.exit(fail ? 1 : 0);
