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

console.log('\n──────────────  통과 ' + pass + '  /  실패 ' + fail + '  ──────────────');
process.exit(fail ? 1 : 0);
