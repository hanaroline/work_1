/**
 * 퇴직소득세 산식을 자료로.
 *
 * 이 파일은 **조문을 옮겨 적은 곳**이고, 화면(app.jsx)은 같은 산식을 스스로 한 번 더
 * 씁니다. 둘을 가져다 쓰지 않고 따로 두는 이유는 판단표와 같습니다 - 합치면
 * crosscheck 가 자기 자신을 비교하는 꼴이 되어 검산이 사라집니다.
 *
 * 세율표·공제표는 전사하다 한 자리 틀리기 딱 좋은 자리인데, 틀려도 숫자는 그럴듯하게
 * 나오고 고객에게는 그대로 나갑니다. 그래서 여기만 고치고, 고친 것이 화면과 맞는지
 * crosscheck 가 격자로 확인합니다.
 *
 * 적용 범위: **2023.1.1 이후 퇴직분.** 그 전 퇴직분은 근속연수공제표가 다릅니다.
 *
 * 금액은 세 가지를 낸다.
 *   tax   국세 (원천징수영수증의 '이연퇴직소득세' 가 이 값이다)
 *   local 지방소득세 = 국세의 10%
 *   total 합계. **인출 시뮬레이션이 쓰는 값이 이것이다** - 같은 칸에 더해지는
 *         연금소득세(5.5/4.4/3.3%)와 기타소득세(16.5%)가 이미 지방세 포함이라,
 *         퇴직소득세만 국세로 두면 한 칸 안에서 기준이 갈린다.
 */

const 만 = 10000;

/** 근속연수공제 (소득세법 §48①1) */
const SERVICE_DEDUCTION = [
  { upto: 5, base: 0, per: 100 * 만, from: 0 },
  { upto: 10, base: 500 * 만, per: 200 * 만, from: 5 },
  { upto: 20, base: 1500 * 만, per: 250 * 만, from: 10 },
  { upto: Infinity, base: 4000 * 만, per: 300 * 만, from: 20 }
];

/** 환산급여공제 (소득세법 §48③) */
const CONVERTED_DEDUCTION = [
  { upto: 800 * 만, base: 0, rate: 1.00, from: 0 },
  { upto: 7000 * 만, base: 800 * 만, rate: 0.60, from: 800 * 만 },
  { upto: 10000 * 만, base: 4520 * 만, rate: 0.55, from: 7000 * 만 },
  { upto: 30000 * 만, base: 6170 * 만, rate: 0.45, from: 10000 * 만 },
  { upto: Infinity, base: 15170 * 만, rate: 0.35, from: 30000 * 만 }
];

/** 기본세율 (소득세법 §55①) - 누진공제 방식 */
const BRACKETS = [
  { upto: 1400 * 만, rate: 0.06, quick: 0 },
  { upto: 5000 * 만, rate: 0.15, quick: 126 * 만 },
  { upto: 8800 * 만, rate: 0.24, quick: 576 * 만 },
  { upto: 15000 * 만, rate: 0.35, quick: 1544 * 만 },
  { upto: 30000 * 만, rate: 0.38, quick: 1994 * 만 },
  { upto: 50000 * 만, rate: 0.40, quick: 2594 * 만 },
  { upto: 100000 * 만, rate: 0.42, quick: 3594 * 만 },
  { upto: Infinity, rate: 0.45, quick: 6594 * 만 }
];

/** 지방소득세율 (지방세법 §103의3) */
const LOCAL_RATE = 0.10;

const SOURCES = [
  { id: '§22', text: '퇴직소득의 범위. 명예퇴직금·위로금도 퇴직소득이라 법정퇴직금과 합해 한 번에 과세한다' },
  { id: '§48①1', text: '근속연수공제' },
  { id: '§48②', text: '환산급여 = (퇴직소득금액 − 근속연수공제) ÷ 근속연수 × 12' },
  { id: '§48③', text: '환산급여공제' },
  { id: '§55①', text: '종합소득 기본세율. 퇴직소득 산출세액도 이 세율로 계산한다' },
  { id: '§146', text: '연금계좌로 지급·이체되는 퇴직소득은 원천징수하지 않고 이연한다' },
  { id: '§148', text: '중간지급 등이 있는 경우의 정산특례. 퇴직자가 신고하면 통산해 재계산하고 기납부세액을 공제한다' },
  { id: '시행령 §105②', text: '근속연수 계산 시 1년 미만의 기간은 1년으로 본다' },
  { id: '시행령 §202의2', text: '연금계좌가 여럿이면 이연퇴직소득세를 계좌별 입금액 비율로 안분한다' },
  { id: '지방세법 §103의3', text: '지방소득세는 소득세액의 10%' }
];

/** 근속연수 - 1년 미만은 1년으로 올린다. 최소 1년 (시행령 §105②) */
function serviceYears(fromStr, toStr) {
  const a = new Date(fromStr + 'T00:00:00');
  const b = new Date(toStr + 'T00:00:00');
  if (isNaN(a.getTime()) || isNaN(b.getTime()) || b < a) return null;
  // 만으로 몇 년인가를 먼저 세고, 남는 날이 하루라도 있으면 한 해를 올린다.
  let y = b.getFullYear() - a.getFullYear();
  const anniv = new Date(a.getFullYear() + y, a.getMonth(), a.getDate());
  if (anniv > b) y -= 1;
  const exact = new Date(a.getFullYear() + y, a.getMonth(), a.getDate());
  if (exact.getTime() !== b.getTime()) y += 1;
  return Math.max(1, y);
}

function serviceDeduction(years) {
  const row = SERVICE_DEDUCTION.find((r) => years <= r.upto);
  return row.base + row.per * (years - row.from);
}

function convertedDeduction(converted) {
  const row = CONVERTED_DEDUCTION.find((r) => converted <= r.upto);
  return row.base + (converted - row.from) * row.rate;
}

function progressiveTax(base) {
  if (base <= 0) return 0;
  const row = BRACKETS.find((r) => base <= r.upto);
  return base * row.rate - row.quick;
}

/**
 * 퇴직소득세 한 번의 계산.
 *
 * 원 단위 미만은 버린다 (원천징수 실무).
 */
function taxOf(amount, years) {
  const income = Math.max(0, amount);
  if (!(income > 0) || !(years > 0)) return null;
  const svcDed = serviceDeduction(years);
  const converted = Math.max(0, (income - svcDed) / years * 12);
  const convDed = convertedDeduction(converted);
  const base = Math.max(0, converted - convDed);
  const convertedTax = progressiveTax(base);
  const tax = Math.floor(convertedTax / 12 * years);
  const local = Math.floor(tax * LOCAL_RATE);
  return {
    income, years, svcDed, converted, convDed, base, convertedTax,
    tax, local, total: tax + local
  };
}

/**
 * 중간정산이 있을 때의 두 갈래.
 *
 * 어느 쪽이 유리한지는 계산해 봐야 안다. 합산하면 근속연수가 길어져 공제가 커지지만
 * 과세표준 구간이 올라가 뒤집히는 경우가 있다. 둘 다 내고 고르게 한다.
 *
 * @param c.hireDate      입사일 'YYYY-MM-DD'
 * @param c.retireDate    퇴직일
 * @param c.amount        최종 퇴직급여 (비과세 제외, 법정 + 명예 합계)
 * @param c.midDate       중간정산일 (없으면 null)
 * @param c.midAmount     중간정산 퇴직급여
 * @param c.midPaidTax    중간정산 때 낸 퇴직소득세 (국세)
 */
function compute(c) {
  if (!c.hireDate || !c.retireDate || !(c.amount > 0)) return null;

  if (!c.midDate || !(c.midAmount > 0)) {
    const years = serviceYears(c.hireDate, c.retireDate);
    if (!years) return null;
    const only = taxOf(c.amount, years);
    return only && { mode: 'plain', chosen: only, plain: only, settle: null };
  }

  // 분리 - 정산일 다음 날부터 센다
  const next = new Date(c.midDate + 'T00:00:00');
  next.setDate(next.getDate() + 1);
  const p = (n) => String(n).padStart(2, '0');
  const afterMid = next.getFullYear() + '-' + p(next.getMonth() + 1) + '-' + p(next.getDate());
  const sepYears = serviceYears(afterMid, c.retireDate);
  const plain = sepYears && taxOf(c.amount, sepYears);

  // 정산특례 (§148) - 통산해 다시 계산하고 기납부세액을 뺀다
  const allYears = serviceYears(c.hireDate, c.retireDate);
  const whole = allYears && taxOf(c.amount + c.midAmount, allYears);
  const paid = c.midPaidTax || 0;
  const settleTax = whole ? Math.max(0, whole.tax - paid) : 0;
  const settleLocal = Math.floor(settleTax * LOCAL_RATE);
  const settle = whole && Object.assign({}, whole, {
    paid, wholeTax: whole.tax,
    tax: settleTax, local: settleLocal, total: settleTax + settleLocal
  });

  if (!plain || !settle) return null;
  const useSettle = settle.tax < plain.tax;
  return { mode: useSettle ? 'settle' : 'plain', chosen: useSettle ? settle : plain, plain, settle };
}

module.exports = {
  SERVICE_DEDUCTION, CONVERTED_DEDUCTION, BRACKETS, LOCAL_RATE, SOURCES,
  serviceYears, serviceDeduction, convertedDeduction, progressiveTax, taxOf, compute
};
