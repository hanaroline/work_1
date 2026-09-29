const { useState, useMemo, useEffect, useCallback } = React;

/* ================================================================
   1. 상수 및 유틸
   ================================================================ */

// 2013.3.1 = 구 연금계좌 / 신 연금계좌 분기점 (소득세법 시행령 부칙)
const CUTOFF = new Date(2013, 2, 1);
const CUTOFF_LABEL = '2013.3.1';
const TODAY = new Date();

const man = (n) => {
  if (n === null || n === undefined || !isFinite(n)) return '-';
  return (Math.round(n / 10000)).toLocaleString('ko-KR');
};

/**
 * 저장된 상담에서 보유 계좌 목록을 읽는다.
 *
 * 계좌가 하나씩(연금저축 1 · IRP 1)만 있던 시절에 저장한 건이 남아 있으므로,
 * 그 형태도 읽어 목록으로 바꿔 준다. 예전에 저장한 상담을 열었을 때
 * 계좌가 통째로 사라지면 상담 이력이 끊긴다.
 */
function readAccounts(d, cast) {
  const { str, num, bool } = cast;
  let n = 0;
  const mk = (kind, src, pre) => ({
    id: 'acc-load-' + (++n),
    kind,
    name: str(src.name, ''),
    joinStr: str(src[pre + 'JoinStr'] !== undefined ? src[pre + 'JoinStr'] : src.joinStr, ''),
    bal: num(src[pre + 'Bal'] !== undefined ? src[pre + 'Bal'] : src.bal, 0),
    exempt: num(src[pre + 'Exempt'] !== undefined ? src[pre + 'Exempt'] : src.exempt, 0),
    started: bool(src[pre + 'Started'] !== undefined ? src[pre + 'Started'] : src.started, false),
    // 파일에 적힌 값을 그대로 읽는다. 연금저축계좌에 수수료가 적혀 있어도
    // 계산하는 자리(buildCandidates)에서 0 으로 눌러 두므로 여기서 또 거르지 않는다.
    // 두 군데서 거르면 한쪽이 망가져도 다른 쪽이 가려 줘서 검사가 아무것도 잡지 못한다.
    fee: num(src.fee, 0),
    merge: bool(src.merge, false)
  });

  if (Array.isArray(d.accounts)) {
    return d.accounts
      .filter((a) => a && (a.kind === 'pension' || a.kind === 'irp'))
      .slice(0, 20)
      .map((a) => mk(a.kind, a, ''));
  }

  // 예전 형식 - 고정 2계좌
  const out = [];
  const oldFees = (d.fees && typeof d.fees === 'object') ? d.fees : {};
  if (bool(d.hasPension, false)) {
    const a = mk('pension', d, 'pension');
    a.merge = d.scope === 'pension' || d.scope === 'all';
    out.push(a);
  }
  if (bool(d.hasIrp, false)) {
    const a = mk('irp', d, 'irp');
    a.fee = num(oldFees['ex-irp'], 0);
    a.merge = d.scope === 'irp' || d.scope === 'all';
    out.push(a);
  }
  return out;
}

/** 읽기 쉬운 한글 금액 - 3억 2,400만원 형태 */
const krw = (n) => {
  if (n === null || n === undefined || !isFinite(n)) return '-';
  const v = Math.round(n);
  if (v === 0) return '0원';
  if (v < 0) return '-' + krw(-v);
  let eok = Math.floor(v / 100000000);
  let m = Math.round((v % 100000000) / 10000);
  if (m >= 10000) { eok += 1; m = 0; }           // 반올림으로 만 단위가 넘치는 경우
  if (eok > 0) return m > 0 ? eok + '억 ' + m.toLocaleString('ko-KR') + '만원' : eok + '억원';
  if (m > 0) return m.toLocaleString('ko-KR') + '만원';
  return v.toLocaleString('ko-KR') + '원';
};
const pct = (n, d = 1) => (!isFinite(n) ? '-' : (n * 100).toFixed(d) + '%');

const digitsOnly = (s) => (s || '').replace(/[^0-9]/g, '');

const fmtComma = (s) => {
  const d = digitsOnly(s);
  if (!d) return '';
  return Number(d).toLocaleString('ko-KR');
};

/** 생년월일 6자리(710315) / 8자리(19710315) 파싱 */
function parseBirth(raw) {
  const d = digitsOnly(raw);
  let y, m, dd;
  if (d.length === 8) {
    y = +d.slice(0, 4); m = +d.slice(4, 6); dd = +d.slice(6, 8);
  } else if (d.length === 6) {
    const yy = +d.slice(0, 2);
    const cur = TODAY.getFullYear() % 100;
    y = yy > cur ? 1900 + yy : 2000 + yy;
    m = +d.slice(2, 4); dd = +d.slice(4, 6);
  } else {
    return null;
  }
  if (m < 1 || m > 12 || dd < 1 || dd > 31) return null;
  const date = new Date(y, m - 1, dd);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== dd) return null;
  if (y < 1920 || date > TODAY) return null;
  return date;
}

/** 만 나이 (오늘 기준) */
function ageOn(birth, at) {
  if (!birth) return null;
  let a = at.getFullYear() - birth.getFullYear();
  const md = at.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && at.getDate() < birth.getDate())) a -= 1;
  return a;
}

/** YYYY-MM-DD 문자열 → Date (빈 값은 null) */
function parseDate(s) {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

const isLegacyDate = (d) => !!d && d < CUTOFF;
const fmtDate = (d) => (d ? d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() : '-');

/** 연령별 연금소득세율 (분리과세) */
const pensionRateByAge = (age) => (age >= 80 ? 0.033 : age >= 70 ? 0.044 : 0.055);

/* ================================================================
   1-1. 미래에셋증권 개인형IRP 수수료 (2026.1.12 시행 공시)

   이 도구가 다루는 신규 계좌는 **개인형IRP** 하나다. DB·DC·기업형IRP 는 사용자(회사)가
   무는 수수료라 퇴직 후 개인이 받는 계좌와 무관하다.

   요율은 고정값이 아니라 **적립금과 해가 바뀌면 같이 바뀐다.** 그래서 한 해의 요율을
   따로 내는 함수로 두고, 인출 스케줄이 해마다 다시 부른다.

     · 운용관리 - 적립금 규모별 **체차적용**(구간별 누진). 3억이면 전액에 0.15% 가
       아니라 1억까지 0.20% · 1~3억 0.18% 로 쌓는다
     · 자산관리 - 개인형IRP 는 규모와 무관하게 0.10%
     · 장기할인 - 2~4차년도 10% · 5~10차년도 12% · 11차년도~ 15%
     · 연금수령개시 - 연금을 1회 이상 수령한 뒤부터 20%
     · 당사 DB·DC 가입자가 당사 개인형IRP 를 계약하면 1년간 운용관리수수료 면제
     · 전자매체로 다이렉트 개설 + 전자매체로만 직접 운용·거래하면 전액 면제

   **'가입자부담금 20% 할인 / 전자매체 개설 시 면제' 는 여기 들어가지 않는다.**
   그 면제는 가입자가 스스로 넣는 돈에 붙는 것이고, 이 도구가 다루는 재원은
   퇴직급여(이연퇴직소득)다. 둘을 섞으면 수수료를 없는 것으로 보게 된다.
   ================================================================ */

const MAS_IRP = {
  /** 운용관리 - 적립금 규모별 체차적용 */
  manage: [
    { upto: 100000000, rate: 0.0020 },   // 1억원 미만
    { upto: 300000000, rate: 0.0018 },   // 1억원 이상 3억원 미만
    { upto: Infinity, rate: 0.0015 }     // 3억원 이상
  ],
  /** 자산관리 - 개인형IRP 는 정률 */
  asset: 0.0010,
  /** 장기할인 (계약 차년도) */
  longTerm: (k) => (k >= 11 ? 0.15 : k >= 5 ? 0.12 : k >= 2 ? 0.10 : 0),
  /** 연금수령개시 가입자 (1회 이상 수령한 뒤) */
  pensionStarted: 0.20
};

/** 체차적용 운용관리수수료 (원) */
function masManageFee(balance) {
  let prev = 0, fee = 0;
  for (const t of MAS_IRP.manage) {
    if (balance <= prev) break;
    fee += (Math.min(balance, t.upto) - prev) * t.rate;
    prev = t.upto;
  }
  return fee;
}

/**
 * 그 해에 무는 수수료 (원).
 *
 * @param bal          그 해 적립금
 * @param k            계약 차년도 (1부터)
 * @param o.waived     다이렉트 개설 + 전자매체 직접 운용 → 전액 면제
 * @param o.fromOurDb  당사 DB·DC 가입자 → 1차년도 운용관리수수료 면제
 * @param o.drawn      이미 연금을 1회 이상 수령했는가
 *
 * 할인이 겹칠 때 공시에 합산인지 곱인지가 적혀 있지 않다. **곱으로 본다** -
 * 둘 중 할인이 덜 되는 쪽이라 수수료를 낮춰 잡지 않는다. 실무 확인 대상으로 남긴다.
 */
function masIrpFee(bal, k, o) {
  if (!(bal > 0)) return 0;
  if (o && o.waived) return 0;
  const manage = (o && o.fromOurDb && k <= 1) ? 0 : masManageFee(bal);
  const asset = bal * MAS_IRP.asset;
  const keep = (1 - MAS_IRP.longTerm(k)) * (1 - (o && o.drawn ? MAS_IRP.pensionStarted : 0));
  return (manage + asset) * keep;
}

/* ================================================================
   1-2. 퇴직소득세

   원천징수영수증이 아직 없는 퇴직 전 상담에서 이연퇴직소득세를 직접 산출한다.
   퇴직소득세는 **퇴직급여 전체를 합해 한 번** 계산한다 - 법정퇴직금과 명예퇴직금을
   따로 계산하지 않는다(소득세법 §22). 재원별 이연퇴직소득세는 그 합계를 계좌
   배정액 비율로 안분한 값이고, 그건 아래 allocatedDeferredTax 가 한다(시행령 §202의2).

   여기 적힌 표는 tools/retirement-tax/rules.js 에도 있고, 그쪽은 조문에서 따로
   옮겨 적은 것이다. 한쪽을 가져다 쓰지 않고 둘 다 두는 이유는 판단표와 같다 -
   세율표는 한 자리 틀려도 숫자가 그럴듯하게 나오고 그대로 고객에게 간다.
   crosscheck 가 격자로 둘을 맞댄다.

   적용 범위: 2023.1.1 이후 퇴직분.

   국세와 지방소득세를 갈라 내고, 시뮬레이션에는 **합계**를 쓴다. 같은 칸에 더해지는
   연금소득세(5.5/4.4/3.3%)와 기타소득세(16.5%)가 이미 지방세를 품은 세율이라,
   퇴직소득세만 국세로 두면 '총 예상 세액' 한 칸 안에서 기준이 갈린다.
   원천징수영수증의 '이연퇴직소득세' 는 국세 기준이므로 화면에 둘 다 적는다.
   ================================================================ */

const MAN = 10000;

/**
 * 원 미만 절사.
 *
 * 그냥 Math.floor 를 쓰면 안 된다. 나눗셈·곱셈을 거친 값은 정답이 정확히
 * 1,306,250 원인 경우에도 1306249.9999999998 로 나오고, 절사하면 **1원이 깎인다.**
 * 80,000 건을 훑어 10,916 건(13.6%)에서 실제로 그랬다. 영수증과 1원이 어긋나면
 * 상담자는 산식이 틀린 줄 안다.
 *
 * 규칙표(rules.js)와 여기가 **같은 방식으로** 틀려 있어 교차검증이 잡지 못했다 -
 * 두 구현을 두어도 같은 착각을 공유하면 드러나지 않는다.
 */
const floorWon = (v) => Math.floor(Number(v.toFixed(6)));

/** 근속연수 - 1년 미만의 기간은 1년으로 본다 (시행령 §105②) */
function yearsBetween(from, to) {
  if (!from || !to || to < from) return null;
  let y = to.getFullYear() - from.getFullYear();
  if (new Date(from.getFullYear() + y, from.getMonth(), from.getDate()) > to) y -= 1;
  const exact = new Date(from.getFullYear() + y, from.getMonth(), from.getDate());
  if (exact.getTime() !== to.getTime()) y += 1;
  return Math.max(1, y);
}

/** 근속연수공제 (소득세법 §48①1) */
function svcDeductionOf(y) {
  if (y <= 5) return 100 * MAN * y;
  if (y <= 10) return 500 * MAN + 200 * MAN * (y - 5);
  if (y <= 20) return 1500 * MAN + 250 * MAN * (y - 10);
  return 4000 * MAN + 300 * MAN * (y - 20);
}

/** 환산급여공제 (소득세법 §48③) */
function convDeductionOf(v) {
  if (v <= 800 * MAN) return v;
  if (v <= 7000 * MAN) return 800 * MAN + (v - 800 * MAN) * 0.6;
  if (v <= 10000 * MAN) return 4520 * MAN + (v - 7000 * MAN) * 0.55;
  if (v <= 30000 * MAN) return 6170 * MAN + (v - 10000 * MAN) * 0.45;
  return 15170 * MAN + (v - 30000 * MAN) * 0.35;
}

/** 기본세율 (소득세법 §55①) */
function basicTaxOf(base) {
  if (base <= 0) return 0;
  if (base <= 1400 * MAN) return base * 0.06;
  if (base <= 5000 * MAN) return base * 0.15 - 126 * MAN;
  if (base <= 8800 * MAN) return base * 0.24 - 576 * MAN;
  if (base <= 15000 * MAN) return base * 0.35 - 1544 * MAN;
  if (base <= 30000 * MAN) return base * 0.38 - 1994 * MAN;
  if (base <= 50000 * MAN) return base * 0.40 - 2594 * MAN;
  if (base <= 100000 * MAN) return base * 0.42 - 3594 * MAN;
  return base * 0.45 - 6594 * MAN;
}

/** 퇴직소득세 한 번의 계산. 단계마다 값을 남긴다 - 상담 중에 설명해야 한다 */
function retireTaxOf(amount, years) {
  if (!(amount > 0) || !(years > 0)) return null;
  const svcDed = svcDeductionOf(years);
  const converted = Math.max(0, (amount - svcDed) / years * 12);
  const convDed = convDeductionOf(converted);
  const base = Math.max(0, converted - convDed);
  const convertedTax = basicTaxOf(base);
  const tax = floorWon(convertedTax / 12 * years);
  const local = floorWon(tax * 0.1);
  return { income: amount, years, svcDed, converted, convDed, base, convertedTax,
    tax, local, total: tax + local };
}

/**
 * 중간정산이 있으면 두 갈래를 다 낸다.
 *
 * 원칙은 정산일 다음 날부터 근속연수를 세는 것이고(분리), 퇴직자가 신고하면
 * 통산해 다시 계산하고 기납부세액을 빼 준다(정산특례, §148). 대개 정산특례가
 * 유리하지만 합산으로 과세표준 구간이 올라가면 뒤집히므로 단정하지 않는다.
 */
function computeRetireTax(inp) {
  if (!inp.hire || !inp.retire || !(inp.amount > 0)) return null;

  if (!inp.midDate || !(inp.midAmount > 0)) {
    const y = yearsBetween(inp.hire, inp.retire);
    const only = y && retireTaxOf(inp.amount, y);
    return only ? { mode: 'plain', chosen: only, plain: only, settle: null } : null;
  }

  const dayAfter = new Date(inp.midDate.getTime());
  dayAfter.setDate(dayAfter.getDate() + 1);
  const sepY = yearsBetween(dayAfter, inp.retire);
  const plain = sepY && retireTaxOf(inp.amount, sepY);

  const allY = yearsBetween(inp.hire, inp.retire);
  const whole = allY && retireTaxOf(inp.amount + inp.midAmount, allY);
  const paid = inp.midPaidTax || 0;
  const settleTax = whole ? Math.max(0, whole.tax - paid) : 0;
  const settleLocal = floorWon(settleTax * 0.1);
  const settle = whole && Object.assign({}, whole, {
    paid, wholeTax: whole.tax,
    tax: settleTax, local: settleLocal, total: settleTax + settleLocal
  });

  if (!plain || !settle) return null;
  const useSettle = settle.total < plain.total;
  return { mode: useSettle ? 'settle' : 'plain', chosen: useSettle ? settle : plain, plain, settle };
}

/* ================================================================
   2. 판정 로직 - 퇴직제도 × 계좌 가입일 × 연령

   근거 : 근로자퇴직급여보장법 §17·§20
          소득세법 §129①5의3, §146②
          소득세법 시행령 §40의2(연금계좌·기산연차) · §40의3(인출순서) · §40의4(계좌 이체)
   ================================================================ */

/**
 * 퇴직급여 재원(source)을 대상 계좌(target)에 입금·이전할 수 있는지 판정.
 *
 * source.kind : 'LEGAL'(법정퇴직금) | 'HONOR'(명예·법정외 퇴직금) | 'DB' | 'DC'
 * target      : { type:'pension'|'irp', isNew, joinDate, balance, started }
 *
 * blockers = 아예 막힘(자동 배정·수동 선택 모두 제외)
 * cautions = 조건부(자동 배정에서는 빼되 상담자가 확인 후 수동 선택 가능)
 */
function transferBlockers(target, source, age) {
  const blockers = [];
  const cautions = [];

  // (1) 만 55세 미만 - 법정퇴직급여는 IRP 로만 지급된다(근퇴법 §17·§20).
  //     2022.4.13 이후로는 퇴직금제도의 법정퇴직금도 IRP 의무이전 대상이다.
  //     명예퇴직금·위로금 등 법정외 퇴직금은 근퇴법상 퇴직급여가 아니라 이 제한을 받지 않는다.
  if (target.type === 'pension' && age !== null && age < 55 && source.kind !== 'HONOR') {
    blockers.push('만 55세 미만 법정퇴직급여는 IRP 의무이전 대상(근퇴법 §17·§20) - 연금저축계좌 입금 불가');
  }

  // (2) DC → 연금저축계좌는 연령 불문 불가.
  //     소득세법이 퇴직연금계좌(DC·IRP·과학기술인연금)와 연금저축계좌 사이의 상호 이체를
  //     금지하기 때문이다(시행령 §40의4①1). DC 는 그 자체가 퇴직연금계좌라 여기에 걸린다.
  //     다만 연금수령요건을 갖춘 계좌끼리는 IRP↔연금저축 계약이전이 허용되므로,
  //     만 55세 이상이면 DC → IRP → 연금저축계좌 2단계 경로가 열린다.
  if (source.kind === 'DC' && target.type === 'pension') {
    blockers.push(
      'DC 퇴직급여는 연금저축계좌로 직접 입금 불가 - 퇴직연금계좌와 연금저축계좌 간 상호 이체 금지(소득세법 시행령 §40의4①1)'
      + (age !== null && age >= 55
        ? '. 만 55세 이상이므로 IRP 로 먼저 수령한 뒤 연금저축계좌로 계약이전하는 2단계 경로는 가능합니다'
        : ''));
  }

  // (3) 2013.3.1 이후 가입 연금계좌 → 2013.3.1 전 가입 연금계좌 이체 금지(시행령 §40의4①2).
  //     여기서 '연금계좌'는 DC·IRP·연금저축계좌·과학기술인연금·중소기업퇴직연금이다.
  //     DB 와 퇴직금제도는 연금계좌가 아니므로 이 제한을 받지 않는다. 지급 자체가
  //     '연금계좌 간 이체'가 아니라 '퇴직소득의 입금'이기 때문이다.
  //     막히더라도 1사 1IRP 예외사유라서 IRP 를 추가로 개설하면 된다.
  if (source.kind === 'DC' && !target.isNew &&
      isLegacyDate(target.joinDate) && !isLegacyDate(source.joinDate)) {
    blockers.push(CUTOFF_LABEL + ' 이후 가입한 DC 의 퇴직급여는 ' + CUTOFF_LABEL +
      ' 전 가입 연금계좌로 입금 불가(소득세법 시행령 §40의4①2) - 1사 1IRP 예외사유이므로 IRP 를 추가 개설하면 됩니다');
  }

  // (4) 연금이 개시된 계좌 - 원칙적으로 추가 입금·이체가 막힌다.
  //     연금개시 시점에 재원별 금액을 확정해 국세청에 통보하기 때문이다.
  //     다만 당사에서 연금개시한 IRP·연금저축계좌는 '퇴직금에 한해' 입금할 수 있어
  //     단정하지 않고 조건부로 둔다. 타사 계좌라면 수관이 필요한데 연금개시 계좌로의
  //     계약이전은 제한되므로(신규 개설 + 가입일자 승계 방식만 가능) 확인이 필요하다.
  if (!target.isNew && target.started) {
    cautions.push('연금이 개시된 계좌 - 원칙적으로 추가 입금 불가. ' +
      '당사에서 연금개시한 IRP·연금저축계좌는 퇴직금에 한해 입금할 수 있으니 계좌 소재와 개시 형태를 확인하세요');
  }

  // (5) 평가액이 0원인 구 계좌 - 가입일자가 살아 있으면 6년차 기산은 그대로 쓸 수 있다.
  //     해지된 계좌라면 가입일자도 사라지므로 계좌가 유효한지만 확인하면 된다.
  if (!target.isNew && isLegacyDate(target.joinDate) && !(target.balance > 0)) {
    cautions.push('평가액이 0원 - 계좌가 해지되지 않고 살아 있는지 확인하세요. 유효하다면 ' +
      CUTOFF_LABEL + ' 이전 가입 특례(6년차 기산)가 그대로 적용됩니다');
  }

  return { blockers, cautions };
}

/** 퇴직급여 재원 구성 */
function buildSources(input) {
  const { system, systemJoin, dbConverted, dbJoin } = input;

  // 기산연차 특례(시행령 §40의2④1)가 보는 '퇴직연금 가입일'.
  // 임금피크제 등으로 DB → DC 로 전환했다면 DC 가입일은 전환 시점이지만,
  // 신규 계좌로 전액 이체할 때는 전환 전 DB 가입일 정보를 반영해 준다.
  const seniorityDate = (system === 'DC' && dbConverted && dbJoin) ? dbJoin : systemJoin;

  const sources = [];
  if (system === 'SEV') {
    // 퇴직금제도의 퇴직금과 명예퇴직금은 '가입일자' 개념이 없어 기산연차 특례가 없다.
    if (input.amtLegal > 0) {
      sources.push({ kind: 'LEGAL', label: '법정퇴직금', amount: input.amtLegal, joinDate: systemJoin, seniorityDate: null });
    }
    if (input.amtHonor > 0) {
      sources.push({ kind: 'HONOR', label: '명예(법정외)퇴직금', amount: input.amtHonor, joinDate: systemJoin, seniorityDate: null });
    }
  } else {
    if (input.amtSingle > 0) {
      sources.push({
        kind: system, label: system + ' 퇴직급여', amount: input.amtSingle,
        joinDate: systemJoin, seniorityDate,
        seniorityFromDB: system === 'DC' && !!dbConverted && !!dbJoin
      });
    }
    // DB·DC 가입자의 명퇴금·위로금. 규약에 규정되지 않은 돈이라 회사가 직접 지급하고,
    // 연금계좌 간 이체가 아니므로 DC 의 연금저축 입금 제한도 가입시점 제한도 받지 않는다.
    // 가입일자 개념이 없어 기산연차 특례 대상도 아니다(Q37).
    if (input.amtHonor > 0) {
      sources.push({
        kind: 'HONOR', label: '명예(법정외)퇴직금', amount: input.amtHonor,
        joinDate: systemJoin, seniorityDate: null
      });
    }
  }
  return sources;
}

/**
 * 연금수령연차의 기산연차와 기산연도.
 *
 * 기산연차 : 1 이 원칙이고, 다음 두 경우에만 6 부터 시작한다(시행령 §40의2④).
 *            2013.3.1 전에는 연금수령 요건이 '10년 이상 가입하고 5년 이상 수령'이었기 때문에
 *            기존 계약자가 5년만 받아도 연금소득으로 인정해 주려는 경과조치다.
 *              ① 연금계좌 가입일자가 2013.3.1 이전인 경우
 *              ② 2013.3.1 전에 퇴직연금(DB·DC)에 가입한 사람이 퇴직급여 전액을
 *                 '신규 개설' 연금계좌에 입금하는 경우. 기존 계좌에 넣으면 적용되지 않는다.
 *
 * 기산연도 : 최초로 연금개시 요건을 갖춘 날이 속하는 해.
 *            요건 = 만 55세 이상 + 가입일로부터 5년 경과, 그리고 계좌에 자금이 있을 것.
 *            이연퇴직소득이 들어 있으면 가입 5년 요건은 면제된다.
 *            연금개시를 신청하지 않아도 이 해부터 연차는 해마다 자동으로 누적된다.
 */
function seniorityOf(target, sources, opts) {
  const { birthYear, depositYear } = opts;   // depositYear = 퇴직급여가 계좌에 들어온 해

  // 기산연차 특례가 보는 것은 '퇴직연금 재원' 하나다. 명퇴금·위로금은 가입일자 개념이
  // 없어(Q37) 특례 판단에 끼지 않으므로, 함께 있다고 해서 특례가 깨지지 않는다.
  // 앱은 재원 하나를 쪼개 여러 계좌로 보내지 않으므로, 이 재원이 신규 계좌로 배정되면
  // 그 재원의 '전액' 이 들어간 것이 된다.
  const pensionFunds = sources.filter((s) => s.seniorityDate);
  const legacyFund = pensionFunds.length === 1 && isLegacyDate(pensionFunds[0].seniorityDate)
    ? pensionFunds[0] : null;

  let index = 1;
  let basis = CUTOFF_LABEL + ' 이후 가입 계좌';
  if (!target.isNew && isLegacyDate(target.joinDate)) {
    index = 6;
    basis = fmtDate(target.joinDate) + ' 가입 · ' + CUTOFF_LABEL + ' 이전 계좌';
  } else if (target.isNew && legacyFund) {
    index = 6;
    basis = CUTOFF_LABEL + ' 이전 ' + (legacyFund.seniorityFromDB ? 'DB' : legacyFund.kind) +
      ' 가입(' + fmtDate(legacyFund.seniorityDate) + ') · 신규계좌 전액 입금';
  } else if (target.isNew) {
    basis = '신규 개설 · 기산연차 특례 대상 아님';
  }

  // 만 55세가 되는 해. 생년월일이 없으면 판단할 수 없어 입금 연도로 둔다.
  const y55 = birthYear !== null ? birthYear + 55 : depositYear;

  // 신규 계좌이거나 잔고가 없던 계좌는 퇴직급여가 들어온 해부터 요건이 선다.
  let baseYear = Math.max(y55, depositYear);

  // 이미 잔고가 있던 기존 계좌는 퇴직급여 입금 전에도 요건을 갖출 수 있었다.
  // 만 55세와 가입 5년을 모두 채운 해가 더 빠르면 그 해가 기산연도가 된다.
  if (!target.isNew && target.balance > 0 && target.joinDate) {
    baseYear = Math.min(baseYear, Math.max(y55, target.joinDate.getFullYear() + 5));
  }

  return { index, basis, baseYear };
}

/**
 * 보유 계좌의 표시 이름.
 *
 * 연금저축은 한 금융기관에 여러 개를 둘 수 있고, IRP 도 1사 1계좌가 원칙이지만
 * 금융기관마다 하나씩 가질 수 있어 실제로는 여러 개인 경우가 흔하다.
 * 그래서 종류만으로는 구분이 안 되고 순번을 붙인다. 금융기관명은 선택 입력이다.
 */
function accountKey(a, seq) {
  return (a.kind === 'pension' ? '연금저축' : 'IRP') + ' ' + seq;
}

function accountLabel(a, seq) {
  return accountKey(a, seq) + (a.name ? ' · ' + a.name : '');
}

/** 계좌 후보 생성 및 평가 */
function buildCandidates(input, sources) {
  const { age, accounts, fees, startYear, birthYear } = input;
  // 신규 IRP 의 수수료 조건. fees 자리에 그대로 실어 온다.
  const irpOpt = {
    waived: !!(fees && fees.direct),
    fromOurDb: !!(fees && fees.ourDbDc),
    offset: Math.max(0, (fees && fees.contractOffset) || 0)
  };

  // 종류별로 1부터 번호를 매긴다 (연금저축 1, 연금저축 2, IRP 1 …)
  const seq = { pension: 0, irp: 0 };
  const targets = (accounts || []).map((a) => {
    seq[a.kind] += 1;
    return {
      id: a.id, type: a.kind, isNew: false,
      joinDate: a.joinDate, balance: a.bal, started: !!a.started,
      label: accountLabel(a, seq[a.kind]),
      ownFeeRate: (a.fee || 0) / 100
    };
  });
  targets.push({ id: 'new-irp', type: 'irp', isNew: true, joinDate: TODAY, balance: 0, started: false, label: '신규 IRP 개설' });
  targets.push({ id: 'new-pension', type: 'pension', isNew: true, joinDate: TODAY, balance: 0, started: false, label: '신규 연금저축 개설' });

  const opts = {
    birthYear: birthYear === undefined ? null : birthYear,
    depositYear: input.depositYear || TODAY.getFullYear()
  };

  return targets.map((t) => {
    const perSource = sources.map((s) => {
      const { blockers, cautions } = transferBlockers(t, s, age);
      return {
        source: s,
        // ok        : 자동 배정 대상 (막힘도 조건부도 없음)
        // selectable: 상담자가 확인 후 수동으로 고를 수 있음 (막힘만 없으면 됨)
        ok: blockers.length === 0 && cautions.length === 0,
        selectable: blockers.length === 0,
        blockers, cautions
      };
    });
    const acceptable = perSource.filter((p) => p.ok);
    const acceptAmount = acceptable.reduce((a, p) => a + p.source.amount, 0);

    const sen = seniorityOf(t, sources, opts);
    // 연금 개시 첫 해의 연금수령연차 - 기산연도부터 해마다 1씩 누적된다.
    const startLimitYear = Math.max(1, sen.index + (startYear - sen.baseYear));
    const minYears = Math.max(1, 11 - startLimitYear);   // 한도 안에서 전액 인출에 필요한 기간

    return {
      ...t,
      perSource,
      canAcceptAll: sources.length > 0 && acceptable.length === sources.length,
      canAcceptAny: acceptable.length > 0,
      acceptAmount,
      seniorityIndex: sen.index,
      seniorityBasis: sen.basis,
      baseYear: sen.baseYear,
      legacy: sen.index === 6,
      startLimitYear,
      unlimited: startLimitYear >= 11,
      minYears,
      // 계좌 수수료(운용관리 + 자산관리)는 IRP 에만 붙는다. 연금저축계좌는 계좌 단위
      // 수수료가 없고 비용이 편입 상품의 보수·사업비로 들어가므로 언제나 0 이다.
      // (그 비용은 계좌에서 따로 떼는 돈이 아니라 수익률에 이미 반영된 값이다.)
      //
      // 신규 IRP 는 요율이 고정값이 아니다 - 적립금 구간(체차)과 계약 차년도에 따라
      // 해마다 바뀐다. 해마다 다시 묻는 함수(feeOf)로 넘기고, 순위와 비교표에 쓸
      // 대표값으로 첫 해 실효요율을 함께 둔다.
      feeRate: t.type === 'pension' ? 0
        : t.isNew
          ? (acceptAmount > 0
            ? masIrpFee(acceptAmount, 1 + irpOpt.offset,
              { waived: irpOpt.waived, fromOurDb: irpOpt.fromOurDb, drawn: false }) / acceptAmount
            : 0)
          : (t.ownFeeRate || 0),
      feeOf: t.type === 'irp' && t.isNew
        ? (bal, k) => masIrpFee(bal, k + irpOpt.offset,
          { waived: irpOpt.waived, fromOurDb: irpOpt.fromOurDb, drawn: k > 1 })
        : null
    };
  });
}

/**
 * 계좌 우열 점수.
 *
 * 연금수령연차가 클수록 그해 한도가 커지고, 11년차에 닿으면 한도가 아예 사라진다.
 * 이것만이 세법상 결정적 차이다. 2013.3.1 이전 가입이기만 하면 6년차이므로
 * 가입일의 선후(2002년 vs 2003년)는 우열을 가르지 않는다 - 둘 다 똑같다.
 * 그 아래는 이전 절차의 편의와 수수료로만 순위를 매긴다.
 */
function accountScore(c, source) {
  // 연차 1년 차이가 수수료 2%p 와 맞먹는다. 구조적 차이라 수수료로 뒤집히지 않게 둔다.
  let score = Math.min(c.startLimitYear, 11) * 200;
  if (!c.isNew) score += 100;         // 계좌 수를 늘리지 않는 쪽

  if (source.kind === 'DB' || source.kind === 'DC') {
    // 퇴직연금 지급액은 IRP 로 직접 이전된다. 연금저축은 퇴직급여를 수령한 뒤
    // 60일 내에 다시 납입해야 과세이연되므로 절차상 번거롭고 기한 위험이 있다.
    if (c.type === 'irp') score += 30;
  } else {
    // 법정·명예퇴직금은 회사가 직접 지급하므로 어느 계좌든 입금할 수 있다. IRP 를 기본으로 둔다.
    if (c.type === 'irp') score += 10; else score += 8;
  }

  score -= (c.feeRate || 0) * 10000;
  return score;
}

/**
 * 재원별 최적 배정 - 재원마다 입금 가능한 계좌 중 가장 유리한 곳으로 보낸다.
 * 법정퇴직금은 IRP, 명예퇴직금은 구 연금저축처럼 분할 입금이 유리한 경우를 잡아낸다.
 * 세법상 동점인 계좌가 여럿이면 tiedWith 로 알려 상담자가 직접 고르게 한다.
 */
function buildAllocation(candidates, sources, manualPick) {
  return sources.map((s) => {
    // 자동 배정은 ok 인 계좌만, 수동 선택 상자에는 조건부(selectable)도 올린다
    const options = candidates.filter((c) => c.perSource.some((p) => p.source.kind === s.kind && p.ok));
    const manualOptions = candidates.filter((c) => c.perSource.some((p) => p.source.kind === s.kind && p.selectable));
    if (!options.length && !manualOptions.length) return { source: s, target: null, options: [], tiedWith: [], manual: false };
    const scored = options.map((c) => ({ c, score: accountScore(c, s) }));
    scored.sort((a, b) => b.score - a.score);
    const auto = scored.length ? scored[0].c : null;

    // 상담자가 투자 가능 상품·중도인출 조건 등을 보고 직접 고른 계좌가 있으면 그것을 따른다
    const forcedId = manualPick && manualPick[s.kind];
    const forced = forcedId ? manualOptions.find((c) => c.id === forcedId) : null;
    const target = forced || auto;
    if (!target) return { source: s, target: null, options: manualOptions, tiedWith: [], manual: false };

    // 연금수령연차가 같은 계좌들 = 세법상 우열 없음
    const tiedWith = scored
      .filter((x) => x.c.id !== target.id && x.c.startLimitYear === target.startLimitYear)
      .map((x) => x.c);

    return {
      source: s, target, auto,
      options: manualOptions,
      tiedWith,
      manual: !!forced && (!auto || forced.id !== auto.id)
    };
  });
}

/** 배정 결과를 후보에 반영 (배정액 0인 계좌는 시뮬레이션 대상에서 제외) */
function applyAllocation(candidates, allocation) {
  return candidates.map((c) => {
    const mine = allocation.filter((a) => a.target && a.target.id === c.id);
    return {
      ...c,
      allocatedSources: mine.map((a) => a.source),
      allocatedAmount: mine.reduce((sum, a) => sum + a.source.amount, 0)
    };
  });
}

/* ================================================================
   3. 인출 시뮬레이션

   재원과 인출 순서 (소득세법 시행령 §40의3)
     ① 세액공제 받지 않은 납입액  → 언제 빼도 과세제외
     ② 이연퇴직소득(퇴직금)       → 연금수령분은 퇴직소득세 감면, 연금외수령분은 감면 없음
     ③ 세액공제 받은 납입액·운용수익 → 연금수령분은 연금소득세 3.3~5.5%,
                                      연금외수령분은 기타소득세 16.5%

   연금수령한도(시행령 §40의2③)
     한도 = 과세기간 개시일 평가액 ÷ (11 - 연금수령연차) × 120%
     이것은 인출 금액의 상한이 아니라 연금수령과 연금외수령을 가르는 기준선이다.
     한도를 넘겨 인출할 수 있고, 넘은 부분만 연금외수령으로 과세된다.
     연금수령연차가 11년차에 닿으면 한도가 사라져 전액이 연금수령으로 인정된다.
   ================================================================ */

function buildSchedule(cfg) {
  const {
    exemptPrincipal,   // ① 세액공제 받지 않은 납입액 (과세제외)
    retirePrincipal,   // ② 이연퇴직소득 원금
    otherPrincipal,    // ③ 세액공제 받은 납입액 + 기존 운용수익
    deferredTax,       // 이연 퇴직소득세
    startLimitYear,    // 연금 개시 첫 해의 연금수령연차
    pastCount,         // 과거 실제 연금수령 횟수 (감면율 판정용)
    feeRate,           // 계좌 연간 수수료율 (적립금 대비, 소수)
    // 요율이 해마다 바뀌는 계좌(미래에셋 신규 IRP)는 함수로 받는다.
    // 적립금 구간(체차)·장기할인·연금수령개시 할인이 모두 해에 따라 달라진다.
    feeOf,
    years, mode, rate, startYear, startAge
  } = cfg;

  const fRate = feeRate || 0;

  let E = exemptPrincipal || 0;   // 과세제외 재원
  let P = retirePrincipal;        // 퇴직소득 재원
  let G = otherPrincipal;         // 세액공제분 + 운용수익
  const P0 = retirePrincipal;
  const taxPerWon = P0 > 0 ? deferredTax / P0 : 0;   // 퇴직소득 1원당 이연세액

  const rows = [];
  let totalDraw = 0, totalTax = 0, totalRetTax = 0, totalFullRetTax = 0, totalOtherTax = 0;
  let totalFee = 0, totalOver = 0;

  for (let k = 1; k <= years; k++) {
    if (k > 1) { G += (E + P + G) * rate; }         // 운용수익은 기타 재원으로 귀속

    // 계좌 수수료는 매년 적립금 기준으로 차감한다. 운용수익·세액공제분에서 먼저 빼고,
    // 모자라면 퇴직소득 재원에서 뺀다(이연퇴직소득세는 실제 인출한 퇴직소득분에만
    // 비례하므로 재원이 줄면 그만큼 세액도 줄어든다).
    // 수수료를 떼기 직전의 재원별 잔액. 엑셀 내보내기의 수식이 이 값을 캐시로 쓴다 -
    // 밖에서 다시 계산하면 두 벌이 되어 언젠가 어긋난다.
    const carryE = E, carryP = P, carryG = G;

    const feeThisYear = feeOf ? Math.max(0, feeOf(E + P + G, k)) : Math.max(0, (E + P + G) * fRate);
    let feeRest1 = 0, feeRest2 = 0;
    if (feeThisYear > 0) {
      const fee = feeThisYear;
      const fromG = Math.min(fee, Math.max(0, G));
      G -= fromG;
      const rest = fee - fromG;
      const fromP = Math.min(rest, Math.max(0, P));
      P -= fromP;
      E = Math.max(0, E - (rest - fromP));
      feeRest1 = rest;
      feeRest2 = rest - fromP;
      totalFee += fee;
    }
    const beginE = E, beginP = P, beginG = G;

    const begin = E + P + G;
    if (begin <= 1) break;

    const limitYear = startLimitYear + k - 1;
    const actualYear = pastCount + k;               // 감면율은 '실제' 연금수령 횟수 기준
    const unlimited = limitYear >= 11;
    const limit = unlimited ? Infinity : (begin / (11 - limitYear)) * 1.2;

    // 한도는 인출 상한이 아니다. 균등 분할이 한도를 넘으면 넘은 만큼 연금외수령이 된다.
    const want = mode === 'max' ? limit : begin / (years - k + 1);
    const draw = Math.max(0, Math.min(want, begin));

    const pensionPart = Math.min(draw, limit);      // 연금수령으로 인정되는 부분
    const overPart = draw - pensionPart;            // 한도 초과 = 연금외수령

    // 인출 순서 ① → ② → ③. 먼저 빠져나가는 돈이 먼저 연금수령 한도를 채운다.
    const takeE = Math.min(draw, E);
    const takeP = Math.min(draw - takeE, P);
    const takeG = draw - takeE - takeP;

    const penE = Math.min(pensionPart, takeE);
    const penP = Math.min(pensionPart - penE, takeP);
    const penG = pensionPart - penE - penP;
    const ovP = takeP - penP;
    const ovG = takeG - penG;

    // ② 퇴직소득 - 연금수령분만 감면(소득세법 §129①5의3).
    //    1~10년차 70% 과세(30% 감면) / 11~20년차 60%(40% 감면) / 21년차~ 50%(50% 감면).
    //    20년 초과 구간은 2025년 세법개정으로 신설되어 2026.1.1 이후 연금수령분부터 적용된다.
    //    한도를 넘겨 뺀 부분은 연금외수령이라 감면 없이 퇴직소득세를 전액 낸다.
    const factor = actualYear <= 10 ? 0.7 : actualYear <= 20 ? 0.6 : 0.5;
    const fullRetTax = taxPerWon * takeP;           // 일시금으로 받았을 때의 퇴직소득세
    const retTax = taxPerWon * (penP * factor + ovP);

    // ③ 세액공제분·운용수익 - 연금수령분은 연령별 연금소득세, 한도 초과분은 기타소득세 16.5%.
    //
    //    다만 ③재원의 연금수령분이 연 1,500만원을 넘으면 저율 분리과세(3.3~5.5%)를 쓸 수
    //    없고, 그 해 사적연금소득 '전액'에 대해 종합과세와 16.5% 분리과세 중에서 고르게
    //    된다(소득세법 §64의4). 다른 소득이 적으면 종합과세가 더 쌀 수 있지만 그 계산은
    //    이 앱이 알 수 없는 정보(다른 소득·공제)에 달려 있으므로, 어느 쪽을 골라도 넘지
    //    않는 16.5% 를 기준으로 잡는다. 5.5% 를 그대로 두면 나올 수 없는 세액이 된다.
    const ageK = startAge + k - 1;
    const over1500 = penG > 15000000;
    const otherTax = penG * (over1500 ? 0.165 : pensionRateByAge(ageK)) + ovG * 0.165;

    E -= takeE; P -= takeP; G -= takeG;

    rows.push({
      k, year: startYear + k - 1, age: ageK,
      limitYear, actualYear, unlimited,
      begin, limit, draw, monthly: draw / 12,
      reduction: actualYear <= 10 ? 0.3 : actualYear <= 20 ? 0.4 : 0.5,
      drawExempt: takeE,                         // ① 과세제외로 빠진 금액
      drawRet: takeP,                            // ② 이 회차에 인출된 이연퇴직소득
      drawOther: takeG,                          // ③ 세액공제분 + 운용수익
      pensionPart, overPart,                     // 연금수령 / 연금외수령
      retTax, otherTax, tax: retTax + otherTax,
      end: E + P + G,
      // 엑셀 내보내기가 수식의 계산값으로 쓰는 중간값들. 화면에는 쓰지 않는다.
      fee: feeThisYear, feeRest1, feeRest2,
      carryE, carryP, carryG, beginE, beginP, beginG,
      penP, penG, ovP, ovG,
      // 사적연금 분리과세 한도는 ③ 재원의 연금수령분에만 걸린다.
      // 퇴직소득 재원의 연금수령분은 금액과 무관하게 분리과세된다.
      over1500
    });

    totalDraw += draw; totalTax += retTax + otherTax;
    totalRetTax += retTax; totalFullRetTax += fullRetTax; totalOtherTax += otherTax;
    totalOver += overPart;

    if (E + P + G <= 1) break;
  }

  return {
    rows,
    totals: {
      totalDraw, totalTax, totalRetTax, totalOtherTax, totalFee, totalOver,
      afterTax: totalDraw - totalTax,
      taxSaved: totalFullRetTax - totalRetTax,
      residual: E + P + G,
      spanYears: rows.length
    }
  };
}

/* ================================================================
   3-2. 저장 - 상담 케이스 보관, 파일 내보내기/가져오기, CSV
   ================================================================ */

const STORE_KEY = 'mas-retirement-cases-v1';
const MEMO_MAX = 500;
const CASE_FORMAT = 'mas-retirement-case';

/** localStorage 는 file:// 이나 사내 정책에 따라 막힐 수 있어 항상 감싼다 */
function loadCases() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveCases(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e && e.name === 'QuotaExceededError' ? '저장 공간이 가득 찼습니다.' : '이 브라우저에서 저장이 차단되어 있습니다.' };
  }
}

function storageAvailable() {
  try {
    localStorage.setItem('__mas_probe', '1');
    localStorage.removeItem('__mas_probe');
    return true;
  } catch (e) {
    return false;
  }
}

/** Blob 을 내려받는다. file:// 에서도 동작한다 */
function downloadBlob(filename, mime, text) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const safeName = (s) => (s || '무명').replace(/[\\/:*?"<>|]/g, '').slice(0, 30);

/**
 * 다운로드 파일명은 ASCII 로만 만든다.
 * file:// 에서 열면 크롬이 비ASCII 파일명을 통째로 버리고 확장자 없는 'download' 로
 * 저장해 버린다. 고객명은 파일 안(JSON 의 custName, CSV 의 고객명 행)에 들어간다.
 */
const asciiSlug = (s) => String(s || '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 20);

const downloadName = (prefix, name, ext) => {
  const slug = asciiSlug(name);
  return prefix + (slug ? '_' + slug : '') + '_' + stamp() + '.' + ext;
};

const stamp = () => {
  const p = (n) => String(n).padStart(2, '0');
  const d = new Date();
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
};

/** 인출 스케줄 CSV. 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 을 붙인다 */
function scheduleCsv(rows, meta) {
  const esc = (v) => {
    const s = String(v === null || v === undefined ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [];
  meta.forEach((m) => lines.push(esc(m[0]) + ',' + esc(m[1])));
  lines.push('');
  lines.push(['회차', '연도', '나이', '한도 연차', '실제 연차', '기초자산', '연금수령한도',
    '연간 인출액', '월 환산', '감면율', '예상 세액', '기말잔액'].map(esc).join(','));
  rows.forEach((r) => lines.push([
    r.k, r.year, r.age,
    r.limitYear + '년차' + (r.unlimited ? '(한도해제)' : ''),
    r.actualYear + '년차',
    Math.round(r.begin),
    r.unlimited ? '전액' : Math.round(r.limit),
    Math.round(r.draw), Math.round(r.monthly),
    r.drawRet > 0 ? Math.round(r.reduction * 100) + '%' : '-',
    Math.round(r.tax), Math.round(r.end)
  ].map(esc).join(',')));
  return '﻿' + lines.join('\r\n');
}

/* ================================================================
   3-3. 엑셀 내보내기 (.xlsx)

   CSV 와 갈라 둔다. 둘은 하는 일이 다르다.

     · CSV  - 인출 스케줄 **표 한 장**을 다른 곳으로 넘긴다. 사내 시스템에 올리거나
              다른 도구로 읽는 용도라 값만 있으면 되고, 어디서나 열린다.
     · 엑셀 - 고객 앞에서 **숫자를 바꿔 본다**. 그래서 값이 아니라 **수식**으로 쓴다.
              금액이나 운용수익률을 고치면 인출표가 엑셀 안에서 다시 계산된다.

   라이브러리를 쓰지 않는다. 이 도구는 인터넷 없이 파일 하나로 도는 것이라 CDN 을 못
   쓰고, 번들을 심으면 파일이 수백 KB 불어난다. xlsx 는 zip 안에 XML 몇 장이므로
   필요한 만큼만 직접 쓴다.
   ================================================================ */

const CRC32_TABLE = (function () {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(b) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) c = CRC32_TABLE[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

const utf8Bytes = (s) => new TextEncoder().encode(s);

/**
 * 저장(STORE) 방식 zip.
 *
 * 압축하지 않는다. 이 파일은 수십 KB 라 줄일 것이 거의 없고, 브라우저가 가진 압축기가
 * 제각각이라(CompressionStream 은 구형 브라우저에 없다) 지점 PC 에서 갈릴 수 있다.
 * zip 규격은 무압축을 그대로 허용하고 엑셀도 읽는다.
 *
 * 타임스탬프는 고정값으로 둔다. 같은 입력이면 같은 바이트가 나와야 검사가 맞대 볼 수 있다.
 */
function zipStore(files) {
  const u16 = (n) => [n & 0xFF, (n >>> 8) & 0xFF];
  const u32 = (n) => [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF];
  const parts = [];
  const dir = [];
  let offset = 0;
  const push = (arr) => { const u = new Uint8Array(arr); parts.push(u); offset += u.length; };

  for (const f of files) {
    const name = utf8Bytes(f.name);
    const data = f.data;
    const crc = crc32(data);
    const at = offset;
    // 0x0800 = 파일명이 UTF-8 이라는 표시
    push([].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x2821),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0)));
    push(Array.prototype.slice.call(name));
    push(Array.prototype.slice.call(data));
    dir.push([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x2821),
      u32(crc), u32(data.length), u32(data.length),
      u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(at),
      Array.prototype.slice.call(name)));
  }

  const dirAt = offset;
  for (const d of dir) push(d);
  const dirSize = offset - dirAt;
  push([].concat(u32(0x06054b50), u16(0), u16(0), u16(dir.length), u16(dir.length),
    u32(dirSize), u32(dirAt), u16(0)));

  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

const xmlEsc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** 0 -> A, 25 -> Z, 26 -> AA */
function colName(i) {
  let s = '';
  let n = i;
  while (n >= 0) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; }
  return s;
}

/* 서식 번호 - styles.xml 의 cellXfs 순서와 같아야 한다 */
const S = { plain: 0, bold: 1, won: 2, pct: 3, head: 4, wonBold: 5, pct3: 6 };

/** 셀 하나. 값(v) 또는 수식(f) 중 하나를 준다. 수식에도 계산값을 함께 적어 둔다 */
const num = (v, s) => ({ t: 'n', v: v, s: s === undefined ? S.won : s });
const txt = (v, s) => ({ t: 's', v: v, s: s === undefined ? S.plain : s });
const fx = (f, v, s) => ({ t: 'n', f: f, v: v, s: s === undefined ? S.won : s });

/**
 * 엑셀에서 보이는 글자 너비. 단위는 기본 글꼴의 '0' 한 글자다.
 * 한글·한자·전각기호·①② 같은 둘러싼 숫자는 두 칸을 먹는다.
 */
const WIDE_CH = /[ᄀ-ᇿ①-⓿■-◿⺀-꓏가-힣豈-﫿︰-﹏＀-｠]/;
function textWidth(s) {
  const str = String(s === null || s === undefined ? '' : s);
  let w = 0;
  for (let i = 0; i < str.length; i++) w += WIDE_CH.test(str[i]) ? 2 : 1;
  return w;
}

/** 그 칸이 엑셀에서 실제로 어떤 글자로 보이는지 (서식을 먹인 뒤) */
function shownText(c) {
  if (c.t !== 'n') return c.v === null || c.v === undefined ? '' : String(c.v);
  const v = isFinite(c.v) ? c.v : 0;
  if (c.s === S.pct) return (v * 100).toFixed(1) + '%';
  if (c.s === S.pct3) return (v * 100).toFixed(3) + '%';
  if (c.s === S.won || c.s === S.wonBold) return Math.round(v).toLocaleString('en-US');
  return String(v);
}

/**
 * 열 너비를 내용에서 잰다.
 *
 * 손으로 적어 두었더니 **같은 열을 입력 블록과 표가 나눠 쓰면서** 어느 한쪽이
 * 늘 잘렸다. 인출 스케줄 시트가 그랬다 - A 열은 '회차' 에 맞춘 6칸인데 그 위
 * 입력 블록에는 '① 세액공제 받지 않은 금액 (과세제외)' 가 들어 있어 끊겨 보였고,
 * B 열은 '연도' 에 맞춘 7칸인데 2억 5천만원이 들어와 `#######` 이 됐다.
 *
 * 두 규칙만 둔다.
 *
 *   - **숫자는 언제나 잰다.** 숫자는 넘쳐 흐르지 않고 `###` 가 되기 때문이다.
 *   - **글자는 바로 오른쪽 칸이 비어 있으면 재지 않는다.** 엑셀이 옆 칸으로
 *     흘려 그대로 읽히므로, 제목 한 줄 때문에 첫 열을 마흔 칸으로 벌릴 이유가 없다.
 *
 * floor 로 열마다 최소 너비를 줄 수 있다. 사유·해설처럼 긴 글이 들어가는 열은
 * 흘려도 읽히기는 하지만 제 칸을 가지고 있는 편이 낫다.
 */
function autoCols(rows, opt) {
  const o = opt || {};
  const pad = o.pad === undefined ? 2 : o.pad;
  const min = o.min === undefined ? 5 : o.min;
  const max = o.max === undefined ? 80 : o.max;
  const floor = o.floor || {};
  const want = [];
  let ncol = 0;

  rows.forEach((cells) => {
    if (!cells || !cells.length) return;
    if (cells.length > ncol) ncol = cells.length;
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (c === null || c === undefined) continue;
      const right = cells[i + 1];
      const flows = c.t !== 'n' && (right === null || right === undefined);
      if (flows) continue;
      const bold = c.s === S.bold || c.s === S.head || c.s === S.wonBold;
      const w = textWidth(shownText(c)) + (bold ? 1 : 0);
      if (!(want[i] >= w)) want[i] = w;
    }
  });

  const out = [];
  for (let i = 0; i < ncol; i++) {
    // 아무것도 없는 열은 좁게 둔다 (표를 가르는 빈 칸)
    if (want[i] === undefined) { out.push(floor[i] === undefined ? 2 : floor[i]); continue; }
    out.push(Math.max(min, floor[i] || 0, Math.min(max, want[i] + pad)));
  }
  return out;
}

function sheetXml(rows, cols) {
  const out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'];
  if (cols && cols.length) {
    out.push('<cols>');
    cols.forEach((w, i) => out.push('<col min="' + (i + 1) + '" max="' + (i + 1) +
      '" width="' + w + '" customWidth="1"/>'));
    out.push('</cols>');
  }
  out.push('<sheetData>');
  rows.forEach((cells, r) => {
    if (!cells || !cells.length) return;
    const rn = r + 1;
    const buf = ['<row r="' + rn + '">'];
    cells.forEach((c, i) => {
      if (c === null || c === undefined) return;
      const ref = colName(i) + rn;
      const st = ' s="' + (c.s || 0) + '"';
      if (c.f !== undefined) {
        buf.push('<c r="' + ref + '"' + st + '><f>' + xmlEsc(c.f) + '</f><v>' +
          (isFinite(c.v) ? c.v : 0) + '</v></c>');
      } else if (c.t === 'n') {
        buf.push('<c r="' + ref + '"' + st + '><v>' + (isFinite(c.v) ? c.v : 0) + '</v></c>');
      } else {
        buf.push('<c r="' + ref + '"' + st + ' t="inlineStr"><is><t xml:space="preserve">' +
          xmlEsc(c.v) + '</t></is></c>');
      }
    });
    buf.push('</row>');
    out.push(buf.join(''));
  });
  out.push('</sheetData></worksheet>');
  return out.join('');
}

const STYLES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="3">' +
  '<numFmt numFmtId="164" formatCode="#,##0"/>' +
  '<numFmt numFmtId="165" formatCode="0.0%"/>' +
  '<numFmt numFmtId="166" formatCode="0.000%"/>' +
  '</numFmts>' +
  '<fonts count="3">' +
  '<font><sz val="11"/><color theme="1"/><name val="맑은 고딕"/><family val="2"/></font>' +
  '<font><b/><sz val="11"/><color theme="1"/><name val="맑은 고딕"/><family val="2"/></font>' +
  '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="맑은 고딕"/><family val="2"/></font>' +
  '</fonts>' +
  '<fills count="3">' +
  '<fill><patternFill patternType="none"/></fill>' +
  '<fill><patternFill patternType="gray125"/></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFF58220"/><bgColor indexed="64"/></patternFill></fill>' +
  '</fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="7">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
  '<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>' +
  '<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  '</cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>';

/** 시트 이름에 쓸 수 없는 글자를 걷어내고 31자로 자른다 (엑셀 제한) */
function sheetName(s, used) {
  let base = String(s || '시트').replace(/[\[\]:*?\/\\]/g, ' ').trim().slice(0, 31) || '시트';
  let name = base;
  let n = 2;
  while (used.indexOf(name) >= 0) {
    const tail = ' (' + n + ')';
    name = base.slice(0, 31 - tail.length) + tail;
    n += 1;
  }
  used.push(name);
  return name;
}

/**
 * 워크북을 통째로 만든다.
 *
 * sheets: [{ name, rows, cols }]
 *
 * fullCalcOnLoad 를 켜 둔다. 수식에 계산값을 함께 적어 두지만, 엑셀이 열 때 스스로
 * 다시 계산하게 해야 입력 칸을 고치기 전에도 둘이 어긋나 있지 않다.
 */
function buildXlsx(sheets) {
  const files = [];
  const add = (name, s) => files.push({ name: name, data: utf8Bytes(s) });

  add('[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    sheets.map((s, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) +
      '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('') +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    '</Types>');

  add('_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>');

  add('xl/workbook.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
    sheets.map((s, i) => '<sheet name="' + xmlEsc(s.name) + '" sheetId="' + (i + 1) +
      '" r:id="rId' + (i + 1) + '"/>').join('') +
    '</sheets><calcPr calcId="0" fullCalcOnLoad="1"/></workbook>');

  add('xl/_rels/workbook.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    sheets.map((s, i) => '<Relationship Id="rId' + (i + 1) +
      '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' +
      (i + 1) + '.xml"/>').join('') +
    '<Relationship Id="rId' + (sheets.length + 1) +
    '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>');

  add('xl/styles.xml', STYLES_XML);
  sheets.forEach((s, i) => add('xl/worksheets/sheet' + (i + 1) + '.xml', sheetXml(s.rows, s.cols)));

  return zipStore(files);
}

/* ---------------------------------------------------------------
   인출 스케줄 시트 - 여기만 수식이다

   화면의 buildSchedule 과 **같은 순서로** 계산한다. 회차마다

     ① 이월 → ③에 운용수익 더하기 → 수수료 차감(③→②→① 순) → 기초자산
     ② 한도 = 기초 ÷ (11 - 연차) × 120%  (11년차부터 한도 없음)
     ③ 인출액 = 균등 또는 한도 최대, 기초자산을 넘지 않음
     ④ 인출 순서 ①→②→③, 한도까지가 연금수령 나머지는 연금외수령
     ⑤ 세액 = ②의 감면분 + ③의 연령별 연금소득세(1,500만원 초과 시 16.5%)

   재원별 잔액을 칸으로 드러내 두는 것이 요점이다. 이 칸들이 없으면 인출 순서를
   수식으로 표현할 수 없어 '금액을 바꾸면 다시 계산되는' 표가 아니게 된다.
   --------------------------------------------------------------- */

/** 입력 블록의 행 번호 (1부터). 수식이 절대참조로 가리킨다 */
const XI = {
  exempt: 4, retire: 5, other: 6, total: 7, tax: 8, perWon: 9,
  rate: 10, years: 11, modeText: 12, modeMax: 13, startLimitYear: 14,
  startYear: 15, startAge: 16, pastCount: 17,
  feeKind: 18, feeRate: 19, irpOffset: 20, irpOurDb: 21, irpWaived: 22
};
const XHEAD = 25;            // 표 머리행
const XFIRST = XHEAD + 1;    // 첫 자료행

const XCOL = ['회차', '연도', '나이', '한도 연차', '실제 연차', '기초자산', '연금수령한도',
  '연간 인출액', '월 환산', '연금수령분', '연금외수령분', '감면율', '예상 세액', '수수료',
  '기말잔액', '',
  '①기초', '②기초', '③기초', '①인출', '②인출', '③인출',
  '②연금수령분', '③연금수령분', '②연금외수령분', '③연금외수령분',
  '②세액', '③세액', '①이월', '②이월', '③이월+수익', '수수료잔여1', '수수료잔여2'];

/* 열 문자 - XCOL 의 순서에 매인다 */
const XC = {};
XCOL.forEach((name, i) => { if (name) XC[name] = colName(i); });

function scheduleSheet(ctx) {
  const rows = [];
  const put = (r, cells) => { rows[r - 1] = cells; };
  /*
    라벨은 A, 값은 G 에 둔다.
    A 는 아래 표의 '회차' 와 같은 열이라 여섯 칸을 넘길 수 없는데 라벨은
    마흔 칸에 가깝다. 값을 바로 옆(B)에 두면 라벨이 거기서 끊긴다. G 로
    밀어 두면 B~F 가 비어 라벨이 그리로 흘러 온전히 읽히고, G 는 금액이
    들어가는 열이라 너비도 맞는다.
  */
  const XVAL = 6;                       // 0부터 센 열 번호 (G)
  const pair = (r, label, cell) => {
    const cells = [txt(label, S.bold)];
    cells[XVAL] = cell;
    put(r, cells);
  };

  const c = ctx;
  put(1, [txt('인출 스케줄 — ' + c.label, S.bold)]);
  put(2, [txt('파란 칸(G4~G22)을 고치면 아래 표가 다시 계산됩니다. 표의 숫자는 모두 수식입니다.')]);

  pair(XI.exempt, '① 세액공제 받지 않은 금액 (과세제외)', num(c.exemptPrincipal));
  pair(XI.retire, '② 이연퇴직소득 원금 (퇴직급여)', num(c.retirePrincipal));
  pair(XI.other, '③ 세액공제분 + 기존 운용수익', num(c.otherPrincipal));
  const V = (k) => colName(XVAL) + k;          // 입력 칸 (상대참조)
  pair(XI.total, '시작 자산 합계', fx(V(XI.exempt) + '+' + V(XI.retire) + '+' + V(XI.other),
    c.exemptPrincipal + c.retirePrincipal + c.otherPrincipal, S.wonBold));
  pair(XI.tax, '이연퇴직소득세 (지방소득세 포함)', num(c.deferredTax));
  pair(XI.perWon, '퇴직소득 1원당 세액',
    fx('IF(' + V(XI.retire) + '>0,' + V(XI.tax) + '/' + V(XI.retire) + ',0)',
      c.retirePrincipal > 0 ? c.deferredTax / c.retirePrincipal : 0, S.pct3));
  pair(XI.rate, '운용수익률 (연)', num(c.rate, S.pct));
  pair(XI.years, '수령 기간 (년)', num(c.years, S.plain));
  pair(XI.modeText, '인출 방식', txt(c.mode === 'max' ? '세법 한도 내 최대' : '기간 균등 분할'));
  pair(XI.modeMax, '   한도 내 최대면 1, 균등이면 0', num(c.mode === 'max' ? 1 : 0, S.plain));
  pair(XI.startLimitYear, '기산 연차', num(c.startLimitYear, S.plain));
  pair(XI.startYear, '시작 연도', num(c.startYear, S.plain));
  pair(XI.startAge, '개시 첫 해 만 나이', num(c.startAge, S.plain));
  pair(XI.pastCount, '과거 연금 수령 횟수', num(c.pastCount, S.plain));
  pair(XI.feeKind, '수수료 방식', txt(c.masIrp ? '미래에셋증권 개인형IRP 공시 (체차적용·할인)' : '연 정률'));
  pair(XI.feeRate, '   연 수수료율 (정률일 때)', num(c.feeRate || 0, S.pct3));
  pair(XI.irpOffset, '   신규 IRP 계약 차년도 보정', num(c.irpOffset || 0, S.plain));
  pair(XI.irpOurDb, '   당사 DB·DC 가입자면 1', num(c.irpOurDb ? 1 : 0, S.plain));
  pair(XI.irpWaived, '   전액 면제면 1', num(c.irpWaived ? 1 : 0, S.plain));

  const headRow = [];
  XCOL.forEach((name, i) => { headRow[i] = name ? txt(name, S.head) : null; });
  headRow[16] = txt('①기초', S.head);
  put(XHEAD - 1, [txt('결과', S.bold), null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, txt('계산 과정 — 재원별 잔액·인출과 세액 분해', S.bold)]);
  put(XHEAD, headRow);

  // Bi = 입력 블록의 칸. 열은 XVAL 과 한 몸이라 여기서 한 번만 만든다.
  const IN_COL = colName(XVAL);
  const A = (r) => 'A' + r, Bi = (k) => '$' + IN_COL + '$' + k;

  c.rows.forEach((row, idx) => {
    const r = XFIRST + idx;
    const p = r - 1;                       // 앞 회차 행
    const first = idx === 0;
    const cell = [];
    const at = (nm) => XC[nm] + r;
    const prev = (nm) => XC[nm] + p;

    // 이월 - 첫 회차는 입력값, 그 뒤는 앞 회차 기말
    const carryE = first ? Bi(XI.exempt) : '(' + prev('①기초') + '-' + prev('①인출') + ')';
    const carryP = first ? Bi(XI.retire) : '(' + prev('②기초') + '-' + prev('②인출') + ')';
    const prevEnd = first ? '' :
      '(' + prev('①기초') + '-' + prev('①인출') + '+' + prev('②기초') + '-' + prev('②인출') +
      '+' + prev('③기초') + '-' + prev('③인출') + ')';
    const carryG = first ? Bi(XI.other)
      : '(' + prev('③기초') + '-' + prev('③인출') + ')+' + prevEnd + '*' + Bi(XI.rate);

    const bal = at('①이월') + '+' + at('②이월') + '+' + at('③이월+수익');
    const feeF = c.masIrp
      ? ('IF(' + Bi(XI.irpWaived) + '=1,0,IF((' + bal + ')<=0,0,(' +
        'IF(AND(' + Bi(XI.irpOurDb) + '=1,' + A(r) + '+' + Bi(XI.irpOffset) + '<=1),0,' +
        'MIN(' + bal + ',100000000)*0.002' +
        '+MAX(0,MIN(' + bal + ',300000000)-100000000)*0.0018' +
        '+MAX(0,(' + bal + ')-300000000)*0.0015)' +
        '+(' + bal + ')*0.001' +
        ')*(1-IF(' + A(r) + '+' + Bi(XI.irpOffset) + '>=11,0.15,IF(' + A(r) + '+' + Bi(XI.irpOffset) +
        '>=5,0.12,IF(' + A(r) + '+' + Bi(XI.irpOffset) + '>=2,0.1,0))))' +
        '*(1-IF(' + A(r) + '>1,0.2,0))))')
      : ('MAX(0,(' + bal + ')*' + Bi(XI.feeRate) + ')');

    cell[0] = num(row.k, S.plain);
    cell[1] = fx(Bi(XI.startYear) + '+' + A(r) + '-1', row.year, S.plain);
    cell[2] = fx(Bi(XI.startAge) + '+' + A(r) + '-1', row.age, S.plain);
    cell[3] = fx(Bi(XI.startLimitYear) + '+' + A(r) + '-1', row.limitYear, S.plain);
    cell[4] = fx(Bi(XI.pastCount) + '+' + A(r), row.actualYear, S.plain);
    cell[5] = fx(at('①기초') + '+' + at('②기초') + '+' + at('③기초'), row.begin);
    cell[6] = fx('IF(' + at('한도 연차') + '>=11,' + at('기초자산') + ',' +
      at('기초자산') + '/(11-' + at('한도 연차') + ')*1.2)',
      row.unlimited ? row.begin : row.limit);
    cell[7] = fx('MAX(0,MIN(IF(' + Bi(XI.modeMax) + '=1,' + at('연금수령한도') + ',' +
      at('기초자산') + '/(' + Bi(XI.years) + '-' + A(r) + '+1)),' + at('기초자산') + '))', row.draw);
    cell[8] = fx(at('연간 인출액') + '/12', row.monthly);
    cell[9] = fx('MIN(' + at('연간 인출액') + ',' + at('연금수령한도') + ')', row.pensionPart);
    cell[10] = fx(at('연간 인출액') + '-' + at('연금수령분'), row.overPart);
    cell[11] = fx('IF(' + at('실제 연차') + '<=10,0.3,IF(' + at('실제 연차') + '<=20,0.4,0.5))',
      row.reduction, S.pct);
    cell[12] = fx(at('②세액') + '+' + at('③세액'), row.tax);
    cell[13] = fx(feeF, row.fee);
    cell[14] = fx(at('①기초') + '-' + at('①인출') + '+' + at('②기초') + '-' + at('②인출') +
      '+' + at('③기초') + '-' + at('③인출'), row.end);

    cell[16] = fx('MAX(0,' + at('①이월') + '-' + at('수수료잔여2') + ')', row.beginE);
    cell[17] = fx('MAX(0,' + at('②이월') + '-' + at('수수료잔여1') + ')', row.beginP);
    cell[18] = fx('MAX(0,' + at('③이월+수익') + '-' + at('수수료') + ')', row.beginG);
    cell[19] = fx('MIN(' + at('연간 인출액') + ',' + at('①기초') + ')', row.drawExempt);
    cell[20] = fx('MIN(' + at('연간 인출액') + '-' + at('①인출') + ',' + at('②기초') + ')', row.drawRet);
    cell[21] = fx(at('연간 인출액') + '-' + at('①인출') + '-' + at('②인출'), row.drawOther);
    cell[22] = fx('MIN(MAX(0,' + at('연금수령분') + '-' + at('①인출') + '),' + at('②인출') + ')', row.penP);
    cell[23] = fx(at('연금수령분') + '-MIN(' + at('연금수령분') + ',' + at('①인출') + ')-' +
      at('②연금수령분'), row.penG);
    cell[24] = fx(at('②인출') + '-' + at('②연금수령분'), row.ovP);
    cell[25] = fx(at('③인출') + '-' + at('③연금수령분'), row.ovG);
    cell[26] = fx(Bi(XI.perWon) + '*(' + at('②연금수령분') + '*(1-' + at('감면율') + ')+' +
      at('②연금외수령분') + ')', row.retTax);
    cell[27] = fx(at('③연금수령분') + '*IF(' + at('③연금수령분') + '>15000000,0.165,IF(' +
      at('나이') + '<70,0.055,IF(' + at('나이') + '<80,0.044,0.033)))+' +
      at('③연금외수령분') + '*0.165', row.otherTax);
    cell[28] = fx(carryE, row.carryE);
    cell[29] = fx(carryP, row.carryP);
    cell[30] = fx(carryG, row.carryG);
    cell[31] = fx('MAX(0,' + at('수수료') + '-' + at('③이월+수익') + ')', row.feeRest1);
    cell[32] = fx('MAX(0,' + at('수수료잔여1') + '-' + at('②이월') + ')', row.feeRest2);

    put(r, cell);
  });

  const last = XFIRST + c.rows.length - 1;
  const sum = (nm) => 'SUM(' + XC[nm] + XFIRST + ':' + XC[nm] + last + ')';
  const tr = last + 2;
  put(tr, [txt('합계', S.bold), null, null, null, null, null, null,
    fx(sum('연간 인출액'), c.totals.totalDraw, S.wonBold), null, null, null, null,
    fx(sum('예상 세액'), c.totals.totalTax, S.wonBold),
    fx(sum('수수료'), c.totals.totalFee, S.wonBold)]);
  put(tr + 1, [txt('세후 수령액 (인출액 − 세액)', S.bold), null, null, null, null, null, null,
    fx('H' + tr + '-M' + tr, c.totals.afterTax, S.wonBold)]);
  put(tr + 3, [txt('행 수는 화면에서 계산된 회차 그대로입니다. 기간을 크게 늘리려면 마지막 행을 복사해 내리세요.')]);

  return { name: c.sheet, rows: rows, cols: autoCols(rows) };
}

/* ---------------------------------------------------------------
   요약 · 계좌 비교 · 퇴직소득세 시트

   이 셋은 **값**이다. 인출 스케줄만 수식으로 둔 것은, 고객 앞에서 실제로 바꿔 보는
   것이 금액과 수익률과 수령 기간이기 때문이다. 판정과 세액 산출까지 수식으로 옮기면
   같은 규칙이 앱과 엑셀 두 곳에 살게 되어 언젠가 한쪽이 낡는다 - 이 도구에서 이미
   여러 번 겪은 일이라, 옮기지 않고 '화면에서 나온 값' 이라고 적어 둔다.
   --------------------------------------------------------------- */

function summarySheet(c) {
  const rows = [];
  const put = (cells) => rows.push(cells);
  const kv = (k, v, s) => put([txt(k, S.bold), typeof v === 'number' ? num(v, s) : txt(v)]);

  put([txt(DOC_TITLE + ' — 상담 요약', S.bold)]);
  put([txt('미래에셋증권 [사내한] 상담 도구에서 내보냈습니다. 작성일 ' + c.today)]);
  put([]);
  put([txt('고객 및 퇴직 정보', S.head)]);
  kv('고객명', c.custName || '-');
  kv('생년월일', c.birthRaw || '-');
  kv('현재 만 나이', c.age === null ? '-' : c.age, S.plain);
  kv('퇴직제도', c.systemLabel);
  kv('제도 가입일', c.joinStr || '-');
  kv('퇴직(예정)일', c.retireStr || '-');
  kv('규약상 퇴직급여(원)', c.amtLegal);
  kv('명예(법정외) 퇴직금(원)', c.amtHonor);
  kv('퇴직급여 합계(원)', c.retireTotal);
  kv('이연퇴직소득세 — 국세(원)', c.deferredNational);
  kv('이연퇴직소득세 — 지방소득세(원)', c.deferredLocal);
  kv('이연퇴직소득세 — 합계(원)', c.deferredTotal);
  kv('이연퇴직소득세 산출', c.taxCalc ? '이 도구가 직접 계산' : '원천징수영수증 값 입력');
  put([]);
  put([txt('시뮬레이션 옵션', S.head)]);
  kv('인출 방식', c.mode === 'max' ? '세법 한도 내 최대' : '기간 균등 분할');
  kv('수령 기간(년)', c.years, S.plain);
  kv('운용수익률', c.rate / 100, S.pct);
  kv('합산한 기존 계좌', c.mergedLabel || '없음 (퇴직급여 단독)');
  put([]);
  put([txt('재원별 배정', S.head)]);
  put([txt('재원', S.bold), txt('금액(원)', S.bold), txt('받는 계좌', S.bold),
    txt('연금수령연차', S.bold), txt('사유', S.bold)]);
  c.allocation.forEach((a) => put([
    txt(a.source), num(a.amount), txt(a.target), txt(a.startLimitYear, S.plain), txt(a.reason)
  ]));
  put([]);
  put([txt('계좌별 판정', S.head)]);
  put([txt('계좌', S.bold), txt('재원', S.bold), txt('상태', S.bold),
    txt('기산 연차', S.bold), txt('연금수령연차', S.bold), txt('사유', S.bold)]);
  c.verdicts.forEach((v) => put([
    txt(v.label), txt(v.source), txt(v.state),
    txt(v.basis, S.plain), txt(v.year, S.plain), txt(v.reason)
  ]));
  put([]);
  put([txt('이 요약은 화면에서 나온 값입니다. 수식으로 이어진 것은 인출 스케줄 시트입니다.')]);
  put([txt('상담 보조용 추정치이며 최종 판단은 원천징수영수증과 금융기관 확인을 거쳐야 합니다.')]);
  if (c.memo) { put([]); put([txt('상담 메모', S.bold)]); put([txt(c.memo)]); }

  // 사유 열은 흘려도 읽히지만 제 칸을 가지고 있는 편이 낫다
  return { name: '요약', rows: rows, cols: autoCols(rows, { floor: { 4: 16, 5: 70 } }) };
}

function compareSheet(c) {
  const rows = [];
  rows.push([txt('계좌별 비교 — 받는 계좌만 바꾸고 나머지 조건은 같게 둔 값', S.bold)]);
  rows.push([txt('기존 잔고 합산은 빼고 퇴직급여 단독으로 비교합니다. 화면의 계좌 비교 탭과 같은 값입니다.')]);
  rows.push([]);
  rows.push([txt('계좌', S.head), txt('기산 연차', S.head), txt('배정액(원)', S.head),
    txt('총 수수료(원)', S.head), txt('총 세액(원)', S.head),
    txt('세후 수령액(원)', S.head), txt('잔존액(원)', S.head), txt('비고', S.head)]);
  c.comparison.forEach((r) => rows.push([
    txt(r.label), txt(r.startLimitYear, S.plain), num(r.amount),
    num(r.totalFee), num(r.totalTax), num(r.afterTax), num(r.residual),
    txt(r.note || '')
  ]));
  rows.push([]);
  rows.push([txt('세후 수령액 + 잔존액이 큰 순서입니다. 수수료·세액은 위 수령 기간과 수익률 기준입니다.')]);
  return { name: '계좌 비교', rows: rows, cols: autoCols(rows, { floor: { 7: 40 } }) };
}

function taxSheet(c) {
  const rows = [];
  rows.push([txt('이연퇴직소득세 계산 과정', S.bold)]);
  rows.push([txt(c.note)]);
  rows.push([]);
  rows.push([txt('단계', S.head), txt('금액(원)', S.head), txt('근거', S.head), txt('해설', S.head)]);
  c.lines.forEach((l) => rows.push([
    txt(l.title), l.amount === null ? txt('-') : num(l.amount), txt(l.law || ''), txt(l.body || '')
  ]));
  rows.push([]);
  rows.push([txt('이 시트는 화면에서 나온 값입니다 - 공제표와 세율표를 엑셀 수식으로 한 벌 더 두면')]);
  rows.push([txt('같은 규칙이 두 곳에 살게 되어 한쪽이 낡습니다. 금액을 바꿔 보시려면 화면에서 바꾸세요.')]);
  return { name: '퇴직소득세', rows: rows, cols: autoCols(rows, { floor: { 3: 78 } }) };
}

/* ================================================================
   4. UI 프리미티브
   ================================================================ */

/**
 * 열려 있는 설명은 언제나 하나다.
 *
 * 전에는 설명마다 제 상태를 따로 들고 있었다. 그래서 누르는 대로 쌓였고, 상담
 * 중에 서넛을 열어 두면 나중에 연 것이 앞의 것을 덮어 **둘 다 못 읽는** 화면이
 * 됐다(실제로 그런 화면이 올라왔다). 바깥을 눌러도 닫히지 않으니 한 번 연 설명은
 * 그 '?' 를 다시 찾아 누르기 전에는 사라지지 않았다.
 *
 * 그래서 '지금 열린 설명' 을 한 곳에만 두고, 다른 것이 열리면 나머지는 스스로
 * 닫는다. 설명끼리는 서로를 모르므로 부모를 거치지 않고 여기로 모은다.
 */
const helpBus = (() => {
  let current = 0;
  let seq = 0;
  const subs = new Set();
  const tell = () => subs.forEach((fn) => fn(current));
  return {
    nextId: () => (seq += 1),
    toggle(id) { current = (current === id ? 0 : id); tell(); },
    close() { if (current) { current = 0; tell(); } },
    sub(fn) { subs.add(fn); return () => { subs.delete(fn); }; }
  };
})();

/**
 * 설명 상자가 잘리는 테두리.
 *
 * 왼쪽 입력 칸은 제 높이만큼 따로 구르는 칸(overflow-y-auto)이라, 그 안에서
 * 절대 위치로 띄운 상자는 칸 밖으로 나가는 순간 잘리거나 가로 스크롤바를
 * 만든다. 실제로 오른쪽 열의 '?' 를 누르면 설명이 잘려 나갔다. 구르는 조상이
 * 있으면 그 상자를, 없으면 화면을 테두리로 삼는다.
 */
function clipRectOf(el) {
  const vw = window.innerWidth, vh = window.innerHeight;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const st = window.getComputedStyle(p);
    if (/(auto|scroll|hidden)/.test(st.overflowX) || /(auto|scroll|hidden)/.test(st.overflowY)) {
      const r = p.getBoundingClientRect();
      return {
        left: Math.max(0, r.left), right: Math.min(vw, r.right),
        top: Math.max(0, r.top), bottom: Math.min(vh, r.bottom)
      };
    }
  }
  return { left: 0, right: vw, top: 0, bottom: vh };
}

/**
 * 눌러서 펼치는 설명. 상담 중에 근거를 바로 보여줄 수 있도록 라벨 옆에 붙인다.
 * 인쇄물에는 나오지 않는다(.screen-only 안에서만 쓴다).
 *
 * title 은 한 줄 요약, children 은 근거 조문까지 담은 본문.
 */
function Help({ title, children }) {
  const idRef = React.useRef(0);
  if (!idRef.current) idRef.current = helpBus.nextId();
  const id = idRef.current;

  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const popRef = React.useRef(null);

  React.useEffect(() => helpBus.sub((cur) => setOpen(cur === id)), [id]);

  /* 밖을 누르거나 Esc 를 누르면 닫는다. 제 '?' 를 누른 것은 지나간다 -
     여기서 먼저 닫아 버리면 이어지는 click 이 다시 열어 토글이 되지 않는다. */
  React.useEffect(() => {
    if (!open) return undefined;
    const down = (e) => {
      if (rootRef.current && rootRef.current.contains(e.target)) return;
      helpBus.close();
    };
    const key = (e) => { if (e.key === 'Escape') helpBus.close(); };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('keydown', key, true);
    return () => {
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('keydown', key, true);
    };
  }, [open]);

  /* 테두리 안으로 밀어 넣는다. 오른쪽으로 넘치면 왼쪽으로 당기고, 아래로
     넘치는데 위가 더 넓으면 단추 위로 올린다. */
  React.useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const pop = popRef.current;
      if (!pop) return;
      pop.style.marginLeft = '0px';
      pop.style.top = '22px';
      pop.style.bottom = 'auto';
      const clip = clipRectOf(pop);
      const pad = 8;
      let r = pop.getBoundingClientRect();
      if (r.bottom > clip.bottom - pad && (r.top - clip.top) > (clip.bottom - r.bottom)) {
        pop.style.top = 'auto';
        pop.style.bottom = '22px';
        r = pop.getBoundingClientRect();
      }
      let dx = 0;
      if (r.right > clip.right - pad) dx = (clip.right - pad) - r.right;
      if (r.left + dx < clip.left + pad) dx = (clip.left + pad) - r.left;
      pop.style.marginLeft = Math.round(dx) + 'px';
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-block align-middle">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); helpBus.toggle(id); }}
        aria-label={title + ' 설명'}
        aria-expanded={open}
        className={'ml-1 w-[16px] h-[16px] leading-[15px] text-[11px] font-bold rounded-full border align-middle transition ' +
          (open
            ? 'bg-mas-orange text-white border-mas-orange'
            : 'bg-white text-ink-soft border-hair hover:border-mas-orange hover:text-mas-orange')}>
        ?
      </button>
      {open && (
        <span
          ref={popRef}
          role="note"
          /* 이름을 붙여 둔다. 화면에 늘 떠 있는 안내문도 role="note" 라서,
             'note 가 몇 개냐' 로 세면 설명이 열렸는지와 섞인다. */
          aria-label={title + ' 설명 내용'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute z-30 left-0 top-[22px] w-[300px] max-w-[78vw] p-3 bg-ink text-white
                     text-[12px] leading-relaxed font-normal rounded-sm shadow-lg cursor-default block">
          <span className="block font-bold mb-1 text-[12px]">{title}</span>
          <span className="block opacity-90">{children}</span>
          <button type="button" aria-label={title + ' 설명 닫기'}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); helpBus.close(); }}
            className="absolute top-1 right-2 text-white/70 hover:text-white text-[14px] leading-none">×</button>
        </span>
      )}
    </span>
  );
}

/**
 * 라벨 + 컨트롤 한 줄.
 *
 * helpTitle 은 설명 버튼의 aria-label 을 라벨과 따로 주기 위한 것이다.
 * 계좌 카드처럼 같은 칸이 여러 벌 생기는 자리에서는 '가입일 설명' 버튼이
 * 계좌 수만큼 생겨 어느 것을 눌렀는지 구분할 수 없다. 계좌 키를 붙여 준다.
 */
/**
 * warn 이 켜지면 힌트를 경고색으로 그린다.
 *
 * 비어 있는 칸을 조용히 기본값으로 메우면 그 가정이 판정에 그대로 섞여 들어간다.
 * 가정을 했으면 그 자리에서 보이게 한다.
 */
function Field({ label, hint, help, helpTitle, warn, children, className = '' }) {
  return (
    <label className={'block ' + className}>
      <span className="block text-[13px] font-medium text-ink-body mb-1.5">
        {label}
        {help ? <Help title={helpTitle || label}>{help}</Help> : null}
      </span>
      {children}
      {hint ? (
        <span className={'block text-[11px] mt-1 leading-snug ' +
          (warn ? 'text-sig-err font-medium' : 'text-ink-soft')}>{hint}</span>
      ) : null}
    </label>
  );
}

const inputCls =
  'w-full h-[42px] px-3 border border-hair rounded-xs bg-white text-[15px] text-ink ' +
  'focus:outline-none focus:border-mas-orange focus:ring-2 focus:ring-mas-orange/25 transition';

const TODAY_STR = (() => {
  const p = (n) => String(n).padStart(2, '0');
  return TODAY.getFullYear() + '-' + p(TODAY.getMonth() + 1) + '-' + p(TODAY.getDate());
})();

/**
 * 날짜 입력.
 *
 * **숫자 여덟 자리를 직접 친다.** 브라우저 기본 date 입력(type="date")을 쓰다가
 * 바꿨다. 휴대폰에서는 그것이 달력으로만 열리는데 달력에 월 이동 화살표밖에 없어,
 * 2003년 가입일을 고르려면 월 화살표를 270번 넘게 눌러야 했다. 이 도구가 다루는
 * 날짜는 대부분 수십 년 전 가입일이라 달력으로 찾는 것 자체가 맞지 않는다.
 *
 * 생년월일 칸이 이미 '710315' 처럼 숫자만 받고 있어 입력 방식도 그쪽과 맞는다.
 *
 * 치는 대로 20030701 → 2003-07-01 로 구분선을 넣어 준다. 값은 예전과 똑같이
 * YYYY-MM-DD 문자열이라 저장·불러오기·인쇄가 그대로 동작한다.
 * 달력을 쓰고 싶은 사람을 위해, 브라우저가 지원하면 달력 단추를 함께 둔다.
 */
const FUTURE_MAX = (TODAY.getFullYear() + 50) + '-12-31';

/** 숫자만 남겨 여덟 자리까지 끊고 구분선을 넣는다 */
function dateMask(raw) {
  const d = digitsOnly(raw).slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return d.slice(0, 4) + '-' + d.slice(4);
  return d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6);
}

/** 완성된 날짜일 때만 실제 달력상 존재하는 날인지 본다 */
function realDate(str) {
  const m = (str || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
  return d;
}

function DateInput({ value, onChange, label, allowFuture }) {
  const max = allowFuture ? FUTURE_MAX : TODAY_STR;
  const pickerRef = React.useRef(null);
  const inputRef = React.useRef(null);

  /**
   * 커서를 어디에 돌려 놓을지.
   *
   * 마스크를 다시 씌우면 값이 통째로 바뀌므로 커서가 맨 뒤로 튄다. 그래서 연도
   * 가운데를 고쳐 보려 하면 커서가 '일' 자리로 달아나고, 블록으로 잡아 새로 쳐도
   * 마찬가지였다 - 사실상 고칠 수가 없었다.
   *
   * **글자 위치가 아니라 '몇 번째 숫자 뒤' 인지로 센다.** 구분선(-)은 자릿수에 따라
   * 늘거나 줄기 때문에 글자 위치로 기억하면 한 칸씩 어긋난다.
   */
  const caretRef = React.useRef(null);

  // 달력 단추는 브라우저가 열어 줄 수 있을 때만 보여 준다.
  // 지원하지 않는 브라우저에서 눌러도 아무 일이 없으면 고장으로 보인다.
  const canPick = typeof HTMLInputElement !== 'undefined'
    && typeof HTMLInputElement.prototype.showPicker === 'function';

  const handle = (e) => {
    const el = e.target;
    caretRef.current = digitsOnly(el.value.slice(0, el.selectionStart)).length;
    onChange(dateMask(el.value));
  };

  /**
   * 구분선 위에서 지우기.
   *
   * '2003-05-01' 에서 '-' 바로 뒤에 커서를 두고 백스페이스를 누르면 아무 일도
   * 일어나지 않는다. 브라우저는 '-' 를 지우지만 마스크가 곧바로 되돌려 놓기
   * 때문이다. 사용자 눈에는 키가 먹지 않는 것으로 보인다. 그 자리에서는
   * 옆의 **숫자**를 지운다.
   */
  const handleKey = (e) => {
    const el = e.target;
    if (el.selectionStart !== el.selectionEnd) return;   // 블록으로 잡았으면 그대로 둔다
    const p = el.selectionStart;
    if (e.key === 'Backspace' && p >= 2 && el.value[p - 1] === '-') {
      e.preventDefault();
      caretRef.current = digitsOnly(el.value.slice(0, p - 2)).length;
      onChange(dateMask(el.value.slice(0, p - 2) + el.value.slice(p)));
    } else if (e.key === 'Delete' && el.value[p] === '-') {
      e.preventDefault();
      caretRef.current = digitsOnly(el.value.slice(0, p)).length;
      onChange(dateMask(el.value.slice(0, p + 1) + el.value.slice(p + 2)));
    }
  };

  /** 값이 다시 그려진 뒤 커서를 제자리에 돌려 놓는다 */
  React.useLayoutEffect(() => {
    const el = inputRef.current;
    const want = caretRef.current;
    caretRef.current = null;
    if (!el || want === null || (typeof document !== 'undefined' && document.activeElement !== el)) return;
    let idx = 0;
    if (want > 0) {
      let seen = 0;
      idx = el.value.length;
      for (let i = 0; i < el.value.length; i++) {
        if (el.value[i] >= '0' && el.value[i] <= '9') {
          seen += 1;
          if (seen === want) { idx = i + 1; break; }
        }
      }
    }
    // 구분선 바로 앞이면 그 뒤로 넘긴다 - 다음에 칠 숫자가 들어갈 자리다
    if (el.value[idx] === '-') idx += 1;
    try { el.setSelectionRange(idx, idx); } catch (err) { /* 포커스가 없으면 그만둔다 */ }
  }, [value]);

  // 치는 중에는 막지 않는다. 다 치고 나서 범위를 벗어나면 그때 손본다 -
  // 중간 상태(2016 을 치다 만 '2')를 걸러 내면 그 해를 칠 수가 없다.
  const handleBlur = (e) => {
    const v = e.target.value;
    // 치다 만 값은 건드리지 않는다. 연도만 쳐 놓고 다른 칸을 확인하러 갔다가
    // 돌아왔을 때 비어 있으면 처음부터 다시 쳐야 한다.
    if (digitsOnly(v).length !== 8) return;
    // 여덟 자리를 다 쳤는데 달력에 없는 날(2003-02-31)이거나 범위 밖이면 비운다.
    // 그럴듯한 값으로 눌러 두면 2013.3.1 판정에 조용히 섞여 들어간다.
    if (!realDate(v) || v < '1900-01-01' || v > max) onChange('');
  };

  // 예시 날짜('2003-07-01')를 자리표시자로 두었더니 채워진 값으로 읽혔다. 실제로
  // 비어 있는 가입일을 '입력했다' 고 본 채 판정을 신뢰한 일이 있었다. 자리표시자는
  // 날짜로 읽힐 수 없는 것이어야 한다.
  return (
    <div className="relative">
      <input
        type="text" inputMode="numeric" autoComplete="off"
        className={inputCls + ' num' + (canPick ? ' pr-11' : '')}
        value={value} aria-label={label} placeholder="YYYY-MM-DD"
        ref={inputRef}
        /*
          maxLength 를 두지 않는다. 열 글자가 다 찬 칸에서는 가운데에 숫자를 끼워
          넣으려 해도 브라우저가 입력 자체를 막아 버려 고칠 수가 없었다.
          길이는 마스크가 여덟 자리로 잘라 지킨다.
        */
        onChange={handle} onKeyDown={handleKey} onBlur={handleBlur} />
      {canPick && (
        <React.Fragment>
          <button type="button" aria-label={label + ' 달력'}
            onClick={() => { try { pickerRef.current.showPicker(); } catch (err) { /* 열 수 없으면 그냥 둔다 */ } }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center
                       text-ink-soft hover:text-mas-orange transition"
            title="달력에서 고르기">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
          </button>
          {/* 달력만 띄우는 숨은 칸. 화면에는 위의 숫자 칸만 보인다 */}
          <input ref={pickerRef} type="date" tabIndex={-1} aria-hidden="true"
            className="absolute right-3 bottom-0 w-0 h-0 opacity-0 pointer-events-none"
            min="1900-01-01" max={max}
            value={realDate(value) ? value : ''}
            onChange={(e) => onChange(e.target.value)} />
        </React.Fragment>
      )}
    </div>
  );
}

function MoneyInput({ value, onChange, placeholder, label }) {
  return (
    <div className="relative">
      <input
        type="text" inputMode="numeric" aria-label={label} className={inputCls + ' num pr-9 text-right'}
        value={value ? Number(value).toLocaleString('ko-KR') : ''}
        placeholder={placeholder || '0'}
        onChange={(e) => onChange(Number(digitsOnly(e.target.value) || 0))}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-soft pointer-events-none">원</span>
    </div>
  );
}

/**
 * 좌우로 붙은 선택 단추.
 *
 * ariaPrefix 는 같은 이름의 단추가 화면에 둘 이상 생길 때 쓴다. 판단표 탭의 '퇴직제도'
 * 단추는 왼쪽 입력 폼의 것과 글자가 같아서, 접근성 이름이 겹치면 사람도 검사도
 * 어느 것을 누르는지 구분할 수 없다.
 */
function Segmented({ options, value, onChange, ariaPrefix }) {
  return (
    <div className="flex border border-hair rounded-xs overflow-hidden bg-white">
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value} type="button" onClick={() => onChange(o.value)}
            aria-label={(ariaPrefix || '') + o.label} aria-pressed={on}
            className={
              'flex-1 h-[42px] px-2 text-[14px] font-medium transition ' +
              (i > 0 ? 'border-l border-hair ' : '') +
              (on ? 'bg-mas-orange text-white' : 'bg-white text-ink-muted hover:bg-surf-subtle hover:text-ink')
            }>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 여러 개를 한꺼번에 고르는 Segmented.
 *
 * 퇴직급여와 명퇴금을 같이 받는 사람이 많은데 하나만 고를 수 있으면 나머지 하나는
 * 판단표에서 아예 보이지 않는다. 둘의 답이 서로 다른 것이 요점이므로(DC 규약상은
 * 연금저축 불가, 같은 사람의 명퇴금은 가능) 같이 켜 놓고 나란히 봐야 한다.
 *
 * 하나도 없는 상태는 만들지 않는다 - 표가 빈 채로 남아 고장으로 보인다.
 */
function SegmentedMulti({ options, values, onChange, ariaPrefix }) {
  return (
    <div className="flex border border-hair rounded-xs overflow-hidden bg-white">
      {options.map((o, i) => {
        const on = values.indexOf(o.value) >= 0;
        const toggle = () => {
          if (!on) onChange(options.map((x) => x.value).filter((v) => v === o.value || values.indexOf(v) >= 0));
          else if (values.length > 1) onChange(values.filter((v) => v !== o.value));
        };
        return (
          <button
            key={o.value} type="button" onClick={toggle}
            aria-label={(ariaPrefix || '') + o.label} aria-pressed={on}
            className={
              'flex-1 h-[42px] px-2 text-[14px] font-medium transition ' +
              (i > 0 ? 'border-l border-hair ' : '') +
              (on ? 'bg-mas-orange text-white' : 'bg-white text-ink-muted hover:bg-surf-subtle hover:text-ink')
            }>
            <span className="mr-1.5 text-[12px]">{on ? '✓' : ' '}</span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 퇴직소득세 계산 과정.
 *
 * 결과 숫자 하나만 내놓지 않는다. 상담 중에 "왜 이 금액인가" 를 고객에게 그 자리에서
 * 설명해야 하고, 회사가 뗀 금액과 다를 때 어느 단계가 다른지 짚을 수 있어야 한다.
 */
/**
 * 계산 과정의 한 줄. 마우스를 올리면(또는 눌러도) 해설이 뜬다.
 *
 * 상담 중에 고객이 묻는 것은 '왜 이 금액이냐' 가 아니라 '이 줄이 무슨 뜻이냐' 다.
 * 조문 번호만 적어 두면 그 자리에서 설명할 수가 없다. 해설을 줄마다 붙여 두고,
 * 화면은 여전히 숫자만 보이게 접어 둔다.
 *
 * 손가락으로 쓰는 기기에는 hover 가 없으므로 눌러도 열린다. 키보드로도 열린다.
 */
function ExplainRow({ title, body, children, className = '' }) {
  // 올려 두는 동안 열리는 것과, 눌러서 고정해 두는 것을 갈라 둔다.
  //
  // 하나로 두면 누르는 순간 이미 hover 로 열려 있어 토글이 곧 '닫기' 가 된다.
  // 손가락으로 누른 사람에게는 아무 일도 안 일어난 것처럼 보이고, 마우스로 누른
  // 사람에게는 읽으려는 순간 사라진다. 눌러서 고정하면 마우스를 떼도 남는다.
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;
  return (
    <div className="relative"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button type="button"
        aria-label={title + ' 해설'} aria-expanded={open} aria-pressed={pinned}
        onClick={(e) => { e.preventDefault(); setPinned((v) => !v); }}
        onFocus={() => setHover(true)} onBlur={() => setHover(false)}
        className={'w-full text-left flex items-baseline gap-2 rounded-xs transition ' +
          'hover:bg-mas-soft focus:outline-none focus:ring-2 focus:ring-mas-orange/30 ' + className}>
        {children}
      </button>
      {open && (
        <span role="note" aria-label={title + ' 해설 내용'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute z-30 left-0 top-full mt-1 w-[320px] max-w-[80vw] p-3 bg-ink text-white
                     text-[12px] leading-relaxed font-normal rounded-sm shadow-lg block cursor-default">
          <span className="block font-bold mb-1">
            {title}
            {pinned ? <span className="font-normal opacity-60 ml-1.5 text-[11px]">고정됨 · 다시 누르면 해제</span> : null}
          </span>
          <span className="block opacity-90">{body}</span>
        </span>
      )}
    </div>
  );
}

/** 계산 과정의 줄마다 붙는 해설 */
function taxStepNotes(r, c) {
  const 만 = (n) => n.toLocaleString('ko-KR');
  return {
    근속연수: (
      <React.Fragment>
        입사일부터 퇴직일까지입니다. <strong>1년 미만의 기간은 1년으로 올립니다</strong>
        (시행령 §105②) — 하루만 넘겨도 한 해가 올라가므로 세액이 눈에 띄게 갈립니다.<br /><br />
        {r.settle
          ? '중간정산을 받았으므로 두 갈래가 있습니다. 원칙(분리)은 정산일 다음 날부터 세고, 정산특례는 입사일부터 통산합니다. 지금은 ' +
            (r.mode === 'settle' ? '정산특례' : '원칙(분리)') + ' 쪽이 유리해 그 연수를 씁니다.'
          : '중간정산을 받았다면 원칙적으로 정산일 다음 날부터 셉니다.'}
        <br /><br />
        근속연수가 길수록 아래 <strong>근속연수공제가 커지고</strong> 환산급여의 분모도 커져
        세금이 줄어듭니다.
      </React.Fragment>
    ),
    퇴직소득금액: (
      <React.Fragment>
        <strong>법정퇴직금 + 명예퇴직금 − 비과세 퇴직급여</strong>입니다. 명예퇴직금·위로금도
        퇴직소득이라(소득세법 §22) 따로 계산하지 않고 <strong>합해서 한 번에</strong> 과세합니다.
        <br /><br />
        계좌를 나눠 받아도 세금은 이 합계로 먼저 계산하고, 계좌별 이연퇴직소득세는
        <strong> 배정액 비율로 안분</strong>합니다(시행령 §202의2).
        {r.mode === 'settle' && (
          <React.Fragment><br /><br />
            정산특례라서 <strong>중간정산분도 합산</strong>한 금액입니다.
          </React.Fragment>
        )}
      </React.Fragment>
    ),
    근속연수공제: (
      <React.Fragment>
        오래 일할수록 더 많이 빼 줍니다(소득세법 §48①1).<br /><br />
        5년 이하 — 100만원 × 근속연수<br />
        5년 초과 10년 이하 — 500만원 + 200만원 × (연수 − 5)<br />
        10년 초과 20년 이하 — 1,500만원 + 250만원 × (연수 − 10)<br />
        20년 초과 — 4,000만원 + 300만원 × (연수 − 20)<br /><br />
        지금은 <strong>{c.years}년</strong>이라 <strong>{만(c.svcDed)}원</strong>입니다.
        구간별로 쌓는 방식이라 20년을 넘겨도 전액에 300만원을 곱하지 않습니다.
      </React.Fragment>
    ),
    환산급여: (
      <React.Fragment>
        <strong>(퇴직소득금액 − 근속연수공제) ÷ 근속연수 × 12</strong><br /><br />
        퇴직금은 여러 해에 걸쳐 쌓인 돈인데 한 해에 몰아서 받습니다. 그대로 누진세율을
        먹이면 세율이 지나치게 높아지므로, <strong>1년치로 나눈 뒤 12를 곱해</strong> 세율을
        낮춰 잡습니다(연분연승). 맨 아래에서 <strong>÷ 12 × 근속연수</strong>로 되돌립니다.
        <br /><br />
        그래서 근속연수가 길수록 환산급여가 작아지고, 세율 구간도 낮아집니다.
      </React.Fragment>
    ),
    환산급여공제: (
      <React.Fragment>
        환산급여에서 다시 한 번 빼 줍니다(소득세법 §48③). 금액이 클수록 <strong>공제율이
        낮아지는</strong> 체감 구조입니다.<br /><br />
        800만원 이하 — 전액<br />
        800만 ~ 7,000만원 — 800만원 + 초과분 × 60%<br />
        7,000만 ~ 1억원 — 4,520만원 + 초과분 × 55%<br />
        1억 ~ 3억원 — 6,170만원 + 초과분 × 45%<br />
        3억원 초과 — 1억 5,170만원 + 초과분 × 35%<br /><br />
        지금은 환산급여 {만(Math.round(c.converted))}원이라 <strong>{만(Math.round(c.convDed))}원</strong>을 뺍니다.
      </React.Fragment>
    ),
    과세표준: (
      <React.Fragment>
        <strong>환산급여 − 환산급여공제</strong>입니다. 여기에 아래의 기본세율을 적용합니다.
        <br /><br />
        이 값은 <strong>1년치로 환산한 금액</strong>이라 실제 퇴직금과 크게 다릅니다.
        놀라실 필요 없습니다 — 마지막에 근속연수만큼 되돌립니다.
      </React.Fragment>
    ),
    환산산출세액: (
      <React.Fragment>
        과세표준에 종합소득 기본세율을 적용합니다(소득세법 §55①).<br /><br />
        1,400만원 이하 6% · ~5,000만원 15% · ~8,800만원 24% · ~1.5억 35% ·<br />
        ~3억 38% · ~5억 40% · ~10억 42% · 10억 초과 45%<br /><br />
        <strong>아직 실제 세금이 아닙니다.</strong> 1년치로 환산한 세액이므로 아래에서
        근속연수만큼 되돌려야 합니다.
      </React.Fragment>
    ),
    되돌리기: (
      <React.Fragment>
        <strong>연분연승을 되돌립니다.</strong> 환산산출세액은 12개월치 기준이므로 12로 나눠
        한 달치로 만든 다음 근속연수를 곱합니다.<br /><br />
        원 미만은 절사합니다. 나눗셈·곱셈을 거친 값이라 그냥 버리면 부동소수점 때문에
        1원이 깎이는 경우가 있어, 정확한 값으로 되돌린 뒤 절사합니다.
      </React.Fragment>
    ),
    기납부세액: (
      <React.Fragment>
        정산특례(소득세법 §148)는 중간정산분을 합산해 <strong>처음부터 다시 계산한 뒤</strong>,
        그때 이미 낸 세금을 뺍니다. 같은 돈에 두 번 과세하지 않기 위한 장치입니다.
        <br /><br />
        <strong>퇴직자가 회사에 신고해야 적용됩니다.</strong> 퇴직할 때 중간정산
        원천징수영수증을 함께 제출하세요. 신고하지 않으면 원칙(분리)대로 계산됩니다.
      </React.Fragment>
    ),
    이연퇴직소득세: (
      <React.Fragment>
        퇴직급여를 <strong>연금계좌로 받으면 이 세금을 떼지 않고 미뤄 둡니다</strong>
        (소득세법 §146). 일시금으로 받으면 지금 전액을 냅니다.<br /><br />
        나중에 연금으로 나눠 받을 때 실제 수령 횟수에 따라 <strong>1~10회차 30% ·
        11~20회차 40% · 21회차부터 50%</strong>를 감면받습니다. 오래 나눠 받을수록 덜 냅니다.
        <br /><br />
        원천징수영수증의 <strong>'이연퇴직소득세'</strong> 란에 적히는 금액이 이것입니다
        (국세 기준).
      </React.Fragment>
    ),
    지방소득세: (
      <React.Fragment>
        소득세액의 <strong>10%</strong>가 따로 붙습니다(지방세법 §103의3).<br /><br />
        원천징수영수증에는 <strong>국세만</strong> 적히므로 영수증 금액과 맞댈 때는 위의
        '이연퇴직소득세 (국세)' 를 보시면 됩니다.
      </React.Fragment>
    ),
    합계: (
      <React.Fragment>
        <strong>인출 스케줄과 계좌 비교가 쓰는 값</strong>입니다. 같은 칸에 더해지는
        연금소득세(5.5 · 4.4 · 3.3%)와 기타소득세(16.5%)가 이미 지방소득세를 품은 세율이라,
        퇴직소득세만 국세로 두면 한 칸 안에서 기준이 갈립니다.<br /><br />
        실효세율은 <strong>합계 ÷ 퇴직소득금액</strong>입니다. 퇴직소득은 공제가 크고
        연분연승이 적용되어 다른 소득보다 실효세율이 낮습니다.
      </React.Fragment>
    )
  };
}

/**
 * 퇴직소득세 계산 과정.
 *
 * 결과 숫자 하나만 내놓지 않는다. 상담 중에 "왜 이 금액인가" 를 고객에게 그 자리에서
 * 설명해야 하고, 회사가 뗀 금액과 다를 때 어느 단계가 다른지 짚을 수 있어야 한다.
 * 줄마다 해설을 달아 두되(마우스를 올리면 뜬다) 화면에는 숫자만 보이게 접어 둔다.
 */
function RetireTaxBreakdown({ r }) {
  const c = r.chosen;
  const N = taxStepNotes(r, c);
  const rows = [
    { key: '근속연수', title: '근속연수', label: '근속연수', value: c.years + '년',
      note: '1년 미만은 1년으로 올림 (시행령 §105②)', why: N.근속연수 },
    { key: '퇴직소득금액', title: '퇴직소득금액', label: '퇴직소득금액', value: krw(c.income),
      note: r.mode === 'settle' ? '중간정산분 합산 (§148)' : '법정 + 명예 − 비과세 (§22)',
      why: N.퇴직소득금액 },
    { key: '근속연수공제', title: '근속연수공제', label: '− 근속연수공제', value: krw(c.svcDed),
      note: '소득세법 §48①1', why: N.근속연수공제 },
    { key: '환산급여', title: '환산급여', label: '환산급여', value: krw(Math.round(c.converted)),
      note: '(퇴직소득금액 − 공제) ÷ 근속연수 × 12', why: N.환산급여 },
    { key: '환산급여공제', title: '환산급여공제', label: '− 환산급여공제', value: krw(Math.round(c.convDed)),
      note: '소득세법 §48③', why: N.환산급여공제 },
    { key: '과세표준', title: '과세표준', label: '과세표준', value: krw(Math.round(c.base)),
      note: '1년치로 환산한 금액', why: N.과세표준 },
    { key: '환산산출세액', title: '환산산출세액', label: '환산산출세액', value: krw(Math.round(c.convertedTax)),
      note: '기본세율 §55①', why: N.환산산출세액 },
    { key: '되돌리기', title: '연분연승 되돌리기', label: '÷ 12 × 근속연수',
      value: krw(r.mode === 'settle' ? c.wholeTax : c.tax),
      note: '연분연승을 되돌림', why: N.되돌리기 }
  ];
  if (r.mode === 'settle') {
    rows.push({ key: '기납부세액', title: '중간정산 기납부세액', label: '− 중간정산 기납부세액',
      value: krw(c.paid),
      note: '정산특례 §148', why: N.기납부세액 });
  }

  const L = 'text-ink-muted shrink-0 w-[112px]';
  const V = 'num font-medium text-ink shrink-0';
  const H = 'text-ink-soft text-[11px] truncate';

  return (
    <div className="screen-only border-t border-hair pt-3">
      <div className="text-[12px] font-bold text-ink-body mb-1.5">
        계산 과정
        <span className="font-normal text-ink-soft ml-1.5">줄에 마우스를 올리면 해설이 나옵니다</span>
      </div>
      <div className="text-[12px] leading-relaxed">
        {rows.map((row) => (
          /* 제목은 줄마다 명시한다. 라벨에서 기호를 깎아 만들었더니
             '÷ 12 × 근속연수' 가 '근속연수' 가 되어 두 줄의 이름이 겹쳤다. */
          <ExplainRow key={row.key} title={row.title} body={row.why}
            className="py-[3px] px-1 -mx-1 border-b border-hair-soft">
            <span className={L}>{row.label}</span>
            <span className={V}>{row.value}</span>
            {row.note ? <span className={H}>{row.note}</span> : null}
          </ExplainRow>
        ))}
        <div className="pt-2 mt-1 border-t border-hair">
          <ExplainRow title="이연퇴직소득세 (국세)" body={N.이연퇴직소득세} className="px-1 -mx-1">
            <span className={L}>이연퇴직소득세 (국세)</span>
            <span className={V}>{krw(c.tax)}</span>
            <span className={H}>영수증의 '이연퇴직소득세' 가 이 금액입니다</span>
          </ExplainRow>
        </div>
        <ExplainRow title="지방소득세" body={N.지방소득세} className="py-[3px] px-1 -mx-1">
          <span className={L}>+ 지방소득세</span>
          <span className={V}>{krw(c.local)}</span>
          <span className={H}>소득세액의 10% (지방세법 §103의3)</span>
        </ExplainRow>
        <div className="pt-1.5 mt-1 border-t border-hair">
          <ExplainRow title="합계 (지방소득세 포함)" body={N.합계} className="px-1 -mx-1">
            <span className="text-ink-body font-bold shrink-0 w-[112px]">합계</span>
            <span className="num font-bold text-mas-active text-[14px] shrink-0">{krw(c.total)}</span>
            <span className={H}>
              실효 {c.income > 0 ? (c.total / c.income * 100).toFixed(2) : '0.00'}%
            </span>
          </ExplainRow>
        </div>
        {/* 원 단위까지 적는다. 영수증과 맞대려면 만원 단위 표기로는 부족하다 */}
        <p className="text-[11px] text-ink-soft mt-0.5 num" aria-label="이연퇴직소득세 원 단위">
          국세 {c.tax.toLocaleString('ko-KR')}원 · 지방소득세 {c.local.toLocaleString('ko-KR')}원 ·
          합계 {c.total.toLocaleString('ko-KR')}원
        </p>
        <p className="text-[11px] text-ink-soft mt-1 leading-snug">
          <strong>인출 스케줄과 계좌 비교에는 합계(지방소득세 포함)를 씁니다.</strong> 같은 칸에
          더해지는 연금소득세(5.5·4.4·3.3%)와 기타소득세(16.5%)가 이미 지방소득세를 품은
          세율이라, 퇴직소득세만 국세로 두면 한 칸 안에서 기준이 갈립니다.
        </p>
      </div>

      {r.settle && (
        <div className="mt-3 border border-hair rounded-xs bg-white p-2.5" role="note"
          aria-label="중간정산 정산특례 비교">
          <div className="text-[12px] font-bold text-ink-body mb-1.5">
            중간정산 — 어느 쪽이 유리한가
            <span className="font-normal text-ink-soft ml-1">(지방소득세 포함)</span>
          </div>
          {[['분리 (원칙)', r.plain.total, 'plain'], ['정산특례 신고 (§148)', r.settle.total, 'settle']]
            .map(([label, tax, key]) => (
              <div key={key} className={'flex items-baseline gap-2 py-1 px-1.5 rounded-xs ' +
                (r.mode === key ? 'bg-mas-soft' : '')}>
                <span className={'text-[12px] flex-1 ' +
                  (r.mode === key ? 'font-bold text-mas-active' : 'text-ink-muted')}>{label}</span>
                <span className="num text-[12px] font-medium text-ink">{krw(tax)}</span>
                {r.mode === key ? <Badge tone="brand">유리</Badge> : null}
              </div>
            ))}
          {r.mode === 'settle' && (
            <p className="text-[11px] text-ink-soft mt-1.5 leading-snug">
              정산특례는 <strong>퇴직자가 회사에 신고</strong>해야 적용됩니다. 퇴직 시
              중간정산 원천징수영수증을 함께 제출하세요.
            </p>
          )}
          {r.mode === 'plain' && (
            <p className="text-[11px] text-ink-soft mt-1.5 leading-snug">
              이 경우는 합산으로 과세표준 구간이 올라가 정산특례가 오히려 불리합니다.
              신고하지 않으면 원칙(분리)대로 계산됩니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ tone = 'neutral', children }) {
  const tones = {
    good: 'bg-[#E8F3EA] text-sig-ok border-[#B9DCC1]',
    warn: 'bg-[#FBF3DF] text-[#8A6A0B] border-[#E8D49A]',
    bad: 'bg-[#FBEAEA] text-sig-err border-[#EFC4C4]',
    brand: 'bg-[#FDEEDF] text-mas-active border-mas-soft',
    neutral: 'bg-surf-subtle text-ink-muted border-hair'
  };
  return (
    <span className={'inline-block px-2 py-[3px] text-[11px] font-medium border rounded-xs leading-tight ' + (tones[tone] || tones.neutral)}>
      {children}
    </span>
  );
}

function Section({ title, children, right }) {
  return (
    <section className="mb-8">
      <div className="rule mb-3" />
      {/*
        좁은 화면에서는 제목과 오른쪽 조작부를 위아래로 쌓는다.

        가로로 붙여 두면 `right` 가 제목 칸을 눌러 "인출 시뮬레이션" 이 한 글자씩
        세로로 쪼개졌다(412px 에서 실제로 그랬다).

        제목에는 nowrap 이 아니라 break-keep(word-break:keep-all) 을 쓴다.
        '인출 시뮬레이션 - IRP 1 · 2013년' 처럼 길어질 수 있어 nowrap 은 화면을
        밀어내고, 한국어는 기본값이 글자 단위로 끊어져 어절이 쪼개지기 때문이다.
      */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-[20px] font-bold text-ink break-keep">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, tone }) {
  const color = tone === 'brand' ? 'text-mas-orange' : tone === 'blue' ? 'text-mas-blue' : 'text-ink';
  return (
    <div className="border border-hair rounded-sm bg-white px-4 py-3">
      <div className="text-[12px] font-medium text-ink-soft tracking-wide mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{label}</div>
      {/* 값 칸만 이름으로 잡히게 한다 - 라벨까지 같이 읽히면 검사가 숫자를 못 떼어 낸다 */}
      <div role="note" aria-label={label}
        className={'num text-[17px] font-bold leading-tight whitespace-nowrap ' + color}>{value}</div>
    </div>
  );
}

/* ================================================================
   5. 메인 앱
   ================================================================ */

// 결과 탭 - 상담 진행 순서와 같다
/*
 * 도구 이름은 여기 하나로 둔다.
 *
 * 화면 머리 · 브라우저 탭(인쇄 뒤 되돌릴 때) · 사용법 제목이 모두 이 값을 쓴다.
 * 전에는 같은 문장을 네 군데에 따로 적어 두어, 이름을 바꿀 때 한 군데가 남았다.
 * 인쇄물과 엑셀 제목은 뒤에 '결과' · '상담 요약' 이 붙어 따로 적는다.
 */
const DOC_TITLE = '퇴직급여 계좌 선택 · 인출 설계';

const TABS = [
  { id: 'verdict', label: '판정' },
  { id: 'compare', label: '계좌 비교' },
  { id: 'schedule', label: '인출 스케줄' },
  { id: 'matrix', label: '판단표' }
];

/**
 * 판단표 자료.
 *
 * tools/pension-decision-matrix 의 규칙에서 전개해 빌드가 심어 준다.
 * **표일 뿐 판정 로직이 아니다.** 화면의 개별 판정은 위의 transferBlockers 가 하고,
 * 이 표는 규칙표(Q&A 원문에서 옮긴 것)의 답을 보여 준다. 둘은 서로 다른 구현이라
 * 어긋나면 crosscheck.js 가 잡는다 - 하나로 합치면 그 검산이 사라진다.
 */
const MATRIX = (typeof window !== 'undefined' && window.__MATRIX__) || null;

/**
 * 사내 Q&A 번호를 화면에 적을지.
 *
 * 근거를 담은 판에서만 적는다. 번호만 남아도 '어느 사내 문서를 보라' 는
 * 이야기가 되고, 이 파일은 사람 손을 타고 돈다. 법령 조문(§)은 공개된
 * 것이라 그대로 둔다 - 가리는 것은 사내 자료를 가리키는 표시뿐이다.
 *
 * 쓸 때는 문장 끝에 붙인다.  ... 고를 수 있습니다{qref(' (Q32)')}.
 * 빠져도 문장이 그대로 읽히게 적어 두는 것이 중요하다.
 */
const HAS_SOURCES = !!(MATRIX && MATRIX.sources && MATRIX.sources.length);
const qref = (s) => (HAS_SOURCES ? s : '');

/** 재원을 적는 순서. 고르는 차례와 무관하게 늘 같게 보이도록 고정한다 */
const FUND_ORDER = ['LEGAL', 'HONOR'];

/* ================================================================
   5-3. 사용법

   별도 PDF 로 두지 않는다. 이 도구는 **파일 하나가 돌아다니는** 형태라 PDF 를 따로
   두면 HTML 만 받은 사람에게는 사용법이 없고, 화면이 바뀔 때마다 그 PDF 는 낡는다.
   종이가 필요하면 브라우저 인쇄로 뽑으면 된다.

   내용은 **상담 순서 그대로** 간다. 기능 목록이 아니라 '무엇부터 하면 되는가' 다.
   단계마다 자주 틀리는 것을 붙인다 - 이 도구에서 실제로 틀렸던 것들이다.
   ================================================================ */

const GUIDE_STEPS = [
  {
    n: '1',
    title: '고객 정보를 넣습니다',
    where: '왼쪽 · 1 · 고객 및 퇴직 정보',
    body: [
      '생년월일은 710315 처럼 여섯 자리로 쳐도 됩니다.',
      '날짜는 숫자 여덟 자리를 그대로 칩니다 (20030701 → 2003-07-01). 달력이 필요하면 칸 오른쪽 달력 단추를 누릅니다.',
      '퇴직제도를 고르고 제도 가입일을 넣습니다.',
      '퇴직(예정)일은 앞으로의 날짜도, 이미 지난 날짜도 넣을 수 있습니다.'
    ],
    trap: [
      ['제도 가입일을 비우지 마세요', '비우면 2013.3.1 이후 가입으로 보아 1년차로 계산합니다. 2013.3.1 이전이면 6년차라 한도가 2배입니다. 비어 있으면 판정 결과 맨 위에 경고가 뜹니다.'],
      ['명예퇴직금은 따로 넣습니다', '규약에 규정되지 않은 명퇴금·위로금은 갈 수 있는 계좌가 달라 칸이 따로 있습니다. 규약에 포함된 법정외 퇴직금은 위 칸(규약상 퇴직급여)에 넣습니다.'],
      ['이연 퇴직소득세를 비워 두지 마세요', '비어 있으면 세액 비교와 인출 세액이 통째로 나오지 않습니다. 영수증이 없으면 직접 계산할 수 있습니다 - 다음 단계에 적어 두었습니다.']
    ]
  },
  {
    n: '2',
    title: '이연퇴직소득세를 직접 계산합니다',
    where: '왼쪽 · 1 · 고객 및 퇴직 정보 · 이연 퇴직소득세',
    body: [
      '원천징수영수증이 있으면 그 값을 그대로 넣고 이 단계는 건너뜁니다.',
      "퇴직 전이라 영수증이 없으면 '이연 퇴직소득세 직접 계산' 을 켭니다. 입사일 · 퇴직일 · 퇴직급여액으로 산출합니다.",
      'DB·DC 는 입사일 칸이 따로 열립니다. 퇴직금제도는 기존 가입일 칸이 곧 입사일이라 새 칸을 두지 않았습니다.',
      '비과세 퇴직급여가 있으면 넣습니다. 없으면 비워 두면 됩니다.',
      "중간정산을 받았으면 '중간정산 받음' 을 켜고 정산일 · 정산 퇴직급여 · 그때 낸 퇴직소득세를 넣습니다.",
      '법정퇴직금과 명예퇴직금은 합해서 한 번 계산합니다. 둘 다 퇴직소득이라 같은 과세표준에 들어갑니다.',
      '계산 과정이 11줄로 펼쳐집니다. 줄에 마우스를 올리면 해설이 뜨고, 눌러 두면 고정됩니다.'
    ],
    trap: [
      ['영수증이 있으면 켜지 마세요', '영수증 값이 정답이고 계산값이 덮으면 안 됩니다. 기본이 꺼짐인 이유입니다. 껐다 켜도 쳐 두신 값은 그대로 돌아옵니다.'],
      ['입사일은 제도 가입일과 다릅니다', '제도에 나중에 가입했어도 근속연수는 입사일부터 셉니다. 제도 가입일을 넣으면 근속연수가 짧아져 세금이 실제보다 크게 나옵니다.'],
      ['근속연수는 1년 미만도 1년으로 셉니다', '10년 하고 하루를 더 다녔으면 11년입니다. 하루 차이로 공제가 한 단 올라가니 입사일과 퇴직일을 정확히 넣으세요.'],
      ['중간정산은 두 갈래를 다 계산합니다', "'분리' 와 '정산특례' 중 유리한 쪽을 골라 표시합니다. 정산특례는 퇴직자가 회사에 신고해야 적용되므로 자동으로 되는 것이 아닙니다."],
      ['여기 나오는 세액에는 지방소득세가 들어 있습니다', '영수증의 이연퇴직소득세는 국세만 적힌 금액이라 약 10% 작습니다. 화면에 국세 · 지방소득세 · 합계를 갈라 적어 두었습니다.']
    ]
  },
  {
    n: '3',
    title: '보유 계좌를 하나씩 넣습니다',
    where: '왼쪽 · 2 · 기존 보유 연금계좌',
    body: [
      "'+ 연금저축' · '+ IRP' 로 개수 제한 없이 추가합니다.",
      '계좌마다 가입일 · 평가액 · 세액공제 받지 않은 금액 · 연금개시 여부를 받습니다.',
      '수수료 칸은 IRP 에만 있습니다. 연금저축계좌는 계좌 수수료가 없습니다.'
    ],
    trap: [
      ['계좌를 빠뜨리면 판정이 틀립니다', '연금수령연차는 계좌마다 따로 산정됩니다. 2008년에 만든 연금저축은 9년차, 2022년 IRP 는 1년차라 한도가 몇 배씩 차이 납니다. 하나가 빠지면 더 유리한 선택지를 아예 못 봅니다.'],
      ['평가액이 0원이어도 넣으세요', '가입일자가 살아 있으면 6년차 기산이 그대로 적용됩니다. 해지되지 않았는지만 확인하시면 됩니다.']
    ]
  },
  {
    n: '4',
    title: '판정을 읽습니다',
    where: '오른쪽 · 판정 탭',
    body: [
      '맨 위 주황 카드가 재원별로 어느 계좌에 넣을지 알려 줍니다. 재원마다 갈 수 있는 계좌가 다르면 나누어 입금합니다.',
      '그 아래 계좌 카드마다 가능 / 조건부 / 불가와 사유, 기산연차가 나옵니다.',
      '카드를 누르면 그 계좌로 인출 스케줄을 봅니다.'
    ],
    trap: [
      ['선택 상자에서 직접 바꿀 수 있습니다', '투자 가능 상품이나 중도인출 조건처럼 앱이 수치화하지 않는 기준으로 고르실 때 쓰세요. 조건부 계좌도 확인 후 고를 수 있습니다.'],
      ["'동점 안내' 가 뜨면 가입일은 보지 마세요", '기산연차는 2013.3.1 이전이냐 아니냐로만 갈립니다. 2002년 가입과 2012년 가입은 똑같이 6년차입니다.']
    ]
  },
  {
    n: '5',
    title: '계좌를 나란히 비교합니다',
    where: '오른쪽 · 계좌 비교 탭',
    body: [
      '받는 계좌만 바꾸고 조건은 같게 두어 총 수수료 · 총 세액 · 세후 수령액을 나란히 봅니다.',
      '고객에게 "이 계좌로 받으면 얼마 차이" 를 바로 보여 줄 수 있습니다.'
    ],
    trap: []
  },
  {
    n: '6',
    title: '인출 스케줄을 봅니다',
    where: '오른쪽 · 인출 스케줄 탭',
    body: [
      '회차별로 한도 · 인출액(월 환산) · 감면율 · 세액 · 잔액이 나옵니다.',
      '인출액 칸에 마우스를 올리면 재원별(과세제외 / 퇴직금 / 운용수익) 분해가 뜹니다.',
      "머리의 선택 상자에서 계좌를 바꿔 가며 봅니다. '지금 받는 계좌' 묶음은 보는 대상만 옮기고, '이 계좌로 바꿔서 보기' 묶음은 그 계좌로 받는 것으로 바꿉니다."
    ],
    trap: [
      ['바꿔서 보기는 판정까지 바꿉니다', "'이 계좌로 바꿔서 보기' 에서 고르면 판정 · 인쇄물 · 엑셀이 모두 그 계좌 기준으로 바뀝니다. 잠깐 견주어만 보려던 것이면 옆의 '추천 계좌로 되돌리기' 로 되돌리세요."],
      ['한도는 인출 상한이 아닙니다', '넘겨서 뺄 수 있고, 넘은 부분만 연금외수령으로 과세됩니다. 그래서 균등 분할이 한도를 넘으면 자르지 않고 초과분을 따로 표시합니다.'],
      ['수령 기간을 줄이면 세금이 늘 수 있습니다', "계좌마다 '최소 권장 수령 기간' 이 표시됩니다. 그보다 짧으면 한도를 넘겨 연금외수령이 생깁니다."]
    ]
  },
  {
    n: '7',
    title: '제도 자체를 확인합니다',
    where: '오른쪽 · 판단표 탭',
    body: [
      '고객 정보와 무관한 참조표입니다. 퇴직제도 · 가입시점 · 받을 돈 · 퇴직 시 나이를 고르면 여섯 계좌의 가능/불가가 나옵니다.',
      '계좌를 옮길 수 있는지도 보내는/받는 계좌를 골라 확인합니다.',
      "'지금 상담 중인 고객 조건으로 맞추기' 로 왼쪽 입력과 한 번에 맞춥니다."
    ],
    trap: [
      ["'받을 돈' 은 해당되는 것을 모두 켜세요", '퇴직급여와 명퇴금은 답이 다릅니다. DC 는 규약상 퇴직급여가 연금저축으로 못 가지만 같은 사람의 명퇴금은 갈 수 있습니다.']
    ]
  },
  {
    n: '8',
    title: '저장하고 출력합니다',
    where: '왼쪽 위 · 오른쪽 위',
    body: [
      "'상담 저장' 은 이 PC 의 브라우저에 담습니다 (최대 50건).",
      "'파일로 내보내기' 는 .json 으로 받아 다른 PC 에서 '가져오기' 로 엽니다.",
      "'엑셀 내보내기' 는 요약 · 계좌 비교 · 계좌별 인출 스케줄을 한 파일(.xlsx)로 받습니다.",
      "그 옆 'CSV 내보내기' 는 지금 보고 있는 인출 스케줄 표 한 장만 값으로 내보냅니다.",
      "'A4 1장 인쇄' 는 보고 있는 탭과 무관하게 판정 · 계좌 비교 · 인출 스케줄을 모두 담습니다.",
      "PDF 가 필요하면 'PDF 저장' 을 누르고 인쇄 창에서 대상을 'PDF로 저장' 으로 고릅니다."
    ],
    trap: [
      ['엑셀과 CSV 는 하는 일이 다릅니다', "엑셀은 인출표가 **수식**이라 파일을 열어 금액이나 운용수익률을 바꾸면 그 자리에서 다시 계산됩니다. CSV 는 표 한 장을 값으로만 넘기는 것이라 바꿔도 다시 계산되지 않습니다 - 사내 시스템에 올리거나 다른 도구로 읽을 때 쓰세요."],
      ['엑셀에서 바뀌는 것은 인출 스케줄까지입니다', '요약 · 계좌 비교 · 퇴직소득세 시트는 화면에서 나온 값입니다. 판정이나 세액을 바꿔 보시려면 화면에서 바꾸고 다시 내보내세요.'],
      ['상담 메모는 기본적으로 인쇄되지 않습니다', '내부 메모로 보기 때문입니다. 고객에게 주려면 체크박스를 켜세요.'],
      ["'전체 초기화' 는 화면 입력만 비웁니다", '저장된 상담은 그대로 남습니다. 지우려면 목록에서 항목별로 삭제합니다.']
    ]
  }
];

const GUIDE_LIMITS = [
  '이 도구는 상담 보조용 추정치입니다. 최종 판단은 원천징수영수증과 금융기관 확인을 거쳐야 합니다.',
  '퇴직소득세 자체 계산은 2023.1.1 이후 퇴직분 기준이고, 임원 퇴직소득 한도는 반영하지 않습니다.',
  '신규 IRP 수수료는 미래에셋증권 공시 요율로만 계산합니다. 타사 신규 IRP 는 표현할 수 없습니다.',
  '사적연금 연 1,500만원을 넘으면 16.5% 분리과세를 택한 기준으로 계산합니다. 종합과세가 더 유리한 경우는 계산하지 않습니다.',
  '연금수령한도는 실제로 계좌별로 따로 산정됩니다. 연차가 다른 계좌를 합산하면 화면에 주의가 뜹니다.',
  '계좌 간 계약이전 자체는 시뮬레이션하지 않습니다. 옮긴 뒤를 보려면 옮긴 상태를 입력해 다시 봅니다.',
  '엑셀 내보내기에서 수식으로 살아 있는 것은 인출 스케줄뿐입니다. 판정·비교·퇴직소득세 시트는 화면에서 나온 값입니다.'
];

/** 사용법 본문 - 화면 덮개와 인쇄물이 같은 것을 쓴다 (두 벌이면 한쪽이 낡는다) */
function GuideBody({ forPrint }) {
  const h = forPrint
    ? { step: '10pt', body: '8.5pt', trap: '8pt' }
    : { step: '17px', body: '14px', trap: '13px' };
  return (
    <div className={forPrint ? '' : 'space-y-6'}>
      {GUIDE_STEPS.map((st) => (
        <div key={st.n} className={forPrint ? '' : 'border border-hair rounded-sm bg-white p-4'}
          style={forPrint ? { marginBottom: '7pt', breakInside: 'avoid' } : null}>
          <div className="flex items-baseline gap-2 flex-wrap mb-2">
            <span className={forPrint ? '' : 'w-[26px] h-[26px] rounded-full bg-mas-orange text-white ' +
              'text-[14px] font-bold leading-[26px] text-center shrink-0'}
              style={forPrint ? { fontWeight: 700, marginRight: '4pt' } : null}>
              {forPrint ? st.n + '.' : st.n}
            </span>
            <span className="font-bold text-ink" style={{ fontSize: h.step }}>{st.title}</span>
            <span className="text-ink-soft" style={{ fontSize: h.trap }}>{st.where}</span>
          </div>
          <ul className={forPrint ? '' : 'space-y-1'} style={{ fontSize: h.body, margin: 0, paddingLeft: '16px' }}>
            {st.body.map((b, i) => (
              <li key={i} className="text-ink-body leading-relaxed" style={{ listStyle: 'disc' }}>{b}</li>
            ))}
          </ul>
          {st.trap.map((tp, i) => (
            <div key={i}
              className={forPrint ? '' : 'mt-2 px-3 py-2 bg-[#FBF3DF] border border-[#E8D49A] rounded-xs'}
              style={forPrint ? { marginTop: '3pt', paddingLeft: '16px' } : null}>
              <span className="font-bold text-[#8A6A0B]" style={{ fontSize: h.trap }}>자주 틀리는 것 — {tp[0]}</span>
              <span className="block text-[#8A6A0B] leading-snug" style={{ fontSize: h.trap }}>{tp[1]}</span>
            </div>
          ))}
        </div>
      ))}
      <div className={forPrint ? '' : 'border border-hair rounded-sm bg-surf-subtle p-4'}
        style={forPrint ? { marginTop: '6pt', breakInside: 'avoid' } : null}>
        <div className="font-bold text-ink mb-2" style={{ fontSize: h.step }}>이 도구가 하지 않는 것</div>
        <ul style={{ fontSize: h.body, margin: 0, paddingLeft: '16px' }}>
          {GUIDE_LIMITS.map((l, i) => (
            <li key={i} className="text-ink-body leading-relaxed" style={{ listStyle: 'disc' }}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ================================================================
   5-2. 판단표 탭

   격자를 통째로 보여 주면 20행 × 6열이라 읽히지 않는다. 상담 중에 필요한 것은
   "이 고객은 어디로 받을 수 있나" 한 줄이므로, 조건을 골라 답을 보는 꼴로 만든다.
   표는 뒤에 그대로 있지만 화면에는 고른 줄 하나만 편다.
   ================================================================ */

function MatrixPick({ label, options, value, onChange, hint, ariaPrefix, multi }) {
  const prefix = '판단표 ' + (ariaPrefix || '');
  return (
    <div className="mb-3">
      <div className="text-[13px] font-medium text-ink-body mb-1.5">
        {label}
        {hint ? <span className="text-ink-soft font-normal ml-1.5 text-[12px]">{hint}</span> : null}
      </div>
      {multi
        ? <SegmentedMulti options={options} values={value} onChange={onChange} ariaPrefix={prefix} />
        : <Segmented options={options} value={value} onChange={onChange} ariaPrefix={prefix} />}
    </div>
  );
}

const markCls = (v) => (v === '가능' ? 'bg-sig-ok' : v === '조건부' ? 'bg-[#C89A2B]' : 'bg-mas-gray');
const markChar = (v) => (v === '가능' ? 'O' : v === '조건부' ? '△' : 'X');
const tintCls = (v) => (v === '가능' ? 'bg-white' : v === '조건부' ? 'bg-[#FBF3DF]' : 'bg-surf-subtle');

/** 가능/조건부/불가 기호 */
function Mark({ verdict }) {
  return (
    <span className={'shrink-0 w-[22px] h-[22px] rounded-full text-[13px] font-bold leading-[22px] ' +
      'text-center text-white ' + markCls(verdict)}>
      {markChar(verdict)}
    </span>
  );
}

/**
 * 계좌 한 줄.
 *
 * entries 는 고른 재원마다 하나씩이다. 재원이 하나면 예전처럼 한 줄로 그리고,
 * 둘이면 계좌 이름 아래에 재원별로 갈라 적는다. **합쳐서 하나의 기호로 줄이지
 * 않는다** - 같은 계좌라도 규약상 퇴직급여는 막히고 명퇴금은 되는 일이 흔하다
 * (DC 가 그렇다). 재원별로 갈리는 것은 가능/불가뿐이고 기산연차는 계좌의 성질이라
 * 같으므로, 연차는 계좌 이름 옆에 한 번만 적는다.
 */
function MatrixRow({ label, entries, showIndex }) {
  const first = entries[0].cell;

  if (entries.length === 1) {
    const ok = first.verdict === '가능';
    return (
      <div className={'flex items-start gap-3 px-3 py-2.5 border-b border-hair-soft last:border-b-0 ' +
        tintCls(first.verdict)}>
        <Mark verdict={first.verdict} />
        <span className="flex-1 min-w-0">
          <span className={'block text-[14px] ' + (ok ? 'font-bold text-ink' : 'text-ink-muted')}>{label}</span>
          {/* 짧은 사유만 적는다. 긴 설명은 마우스를 올리면 뜬다 - 상담 중에 읽어야 하는 것은 한 줄이다 */}
          {first.short ? (
            <span className="block text-[12px] text-ink-soft leading-snug mt-0.5" title={first.why}>
              {first.short}
            </span>
          ) : null}
        </span>
        {showIndex && first.verdict !== '불가' ? (
          <span className={'shrink-0 num text-[13px] font-bold ' +
            (first.index >= 6 ? 'text-mas-active' : 'text-ink-soft')}>
            {first.index}년차
          </span>
        ) : null}
      </div>
    );
  }

  const anyOk = entries.some((e) => e.cell.verdict === '가능');
  // 갈 수 있는 재원들의 기산연차. 계좌의 성질이라 하나로 모이지만, 그렇지 않은
  // 자료가 들어오면 재원별로 나누어 적는다 - 서로 다른 값을 하나로 뭉개지 않는다.
  const idx = entries.filter((e) => e.cell.verdict !== '불가').map((e) => e.cell.index);
  const sharedIdx = idx.length && idx.every((n) => n === idx[0]) ? idx[0] : null;

  return (
    <div className="border-b border-hair-soft last:border-b-0">
      <div className="flex items-baseline gap-3 px-3 pt-2 pb-1">
        <span className={'flex-1 min-w-0 text-[14px] ' + (anyOk ? 'font-bold text-ink' : 'text-ink-muted')}>
          {label}
        </span>
        {showIndex && sharedIdx !== null ? (
          <span className={'shrink-0 num text-[13px] font-bold ' +
            (sharedIdx >= 6 ? 'text-mas-active' : 'text-ink-soft')}>
            {sharedIdx}년차
          </span>
        ) : null}
      </div>
      {entries.map((e) => (
        <div key={e.fund} className={'flex items-start gap-2.5 px-3 py-1.5 ' + tintCls(e.cell.verdict)}>
          <Mark verdict={e.cell.verdict} />
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] text-ink-body">{e.label}</span>
            {e.cell.short ? (
              <span className="block text-[12px] text-ink-soft leading-snug mt-0.5" title={e.cell.why}>
                {e.cell.short}
              </span>
            ) : null}
          </span>
          {showIndex && sharedIdx === null && e.cell.verdict !== '불가' ? (
            <span className={'shrink-0 num text-[13px] font-bold ' +
              (e.cell.index >= 6 ? 'text-mas-active' : 'text-ink-soft')}>
              {e.cell.index}년차
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MatrixTab({ current }) {
  const M = MATRIX;
  const [sys, setSys] = useState('DC');
  const [legacy, setLegacy] = useState(false);
  // 받을 돈은 여러 개다. 퇴직급여와 명퇴금을 같이 받는 사람이 흔하고, 그 둘의
  // 답이 서로 다른 것이 판단표를 보는 이유다.
  const [funds, setFunds] = useState(['LEGAL']);
  const [old55, setOld55] = useState(true);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [meets, setMeets] = useState(true);

  if (!M) return <p className="text-[14px] text-ink-soft">판단표 자료를 불러오지 못했습니다.</p>;

  /**
   * 왼쪽 입력과 맞춘다.
   *
   * 제도 가입일이 비어 있으면 가입시점을 알 수 없다. 예전에는 그걸 false('이후')로
   * 흘려보내 단추를 눌러도 '2013.3.1 후' 가 눌린 채 아무 일도 없는 것처럼 보였다.
   * 모르는 것은 맞추지 않고, 무엇을 못 맞췄는지 아래에 적는다.
   */
  const useCustomer = () => {
    setSys(current.system);
    if (current.legacy !== null) setLegacy(current.legacy);
    setOld55(current.age >= 55);
    if (current.funds.length) setFunds(current.funds);
  };

  /** 이 제도에서 그 재원을 뭐라고 부르는가 */
  const fundLabel = (f) => (f === 'HONOR' ? '명퇴금 · 위로금'
    : sys === 'SEV' ? '법정퇴직금' : '규약상 퇴직급여');

  // 단추를 누르기 전에도 무엇으로 맞춰지는지 보인다 - 누른 뒤에 달라진 게 없어
  // '안 먹었나' 싶은 상황을 없앤다.
  const sysLabel = { SEV: '퇴직금제도', DB: 'DB', DC: 'DC' };
  const customerLine = current.ready
    ? [sysLabel[current.system],
      current.system === 'SEV' ? null
        : current.legacy === null ? '가입시점 모름' : CUTOFF_LABEL + (current.legacy ? ' 전' : ' 후'),
      current.funds.map((f) => (f === 'HONOR' ? '명퇴금 · 위로금'
        : current.system === 'SEV' ? '법정퇴직금' : '규약상 퇴직급여')).join(' + ') || null,
      '만 55세 ' + (current.age >= 55 ? '이상' : '미만')].filter(Boolean).join(' · ')
    : null;

  // 고른 재원마다 한 줄씩. 순서는 늘 규약상 → 명퇴금으로 고정한다.
  const entriesFor = (i) => FUND_ORDER.filter((f) => funds.indexOf(f) >= 0).map((f) => {
    const r = M.deposit.find((x) => x.system === sys && x.fund === f &&
      x.age === (old55 ? 58 : 54) && (sys === 'SEV' || x.legacySys === legacy));
    return { fund: f, label: fundLabel(f), cell: r.cells[i] };
  });

  const grp = M.transfer.find((g) => g.meets === meets);
  const tCell = grp.rows[from].cells[to];
  const penIdx = [0, 1, 2], irpIdx = [3, 4, 5];

  return (
    <div className="space-y-6">
      {/* ── 1. 어디로 받을 수 있나 ── */}
      <Section title="어느 계좌로 받을 수 있나">
        <div className="mb-4">
          {current.ready && (
            <div className="mb-3">
              <button type="button" onClick={useCustomer} aria-label="고객 조건으로 보기"
                className="h-[34px] px-3 text-[13px] font-medium text-mas-active border border-mas-orange
                           bg-mas-soft rounded-xs hover:bg-mas-orange hover:text-white transition">
                지금 상담 중인 고객 조건으로 맞추기
              </button>
              <p className="text-[12px] text-ink-soft mt-1.5 leading-snug" role="note"
                aria-label="고객 조건 요약">
                지금 상담 중인 고객: <strong className="text-ink-body">{customerLine}</strong>
              </p>
              {current.legacy === null && current.system !== 'SEV' && (
                <p className="text-[12px] text-sig-err font-medium mt-1 leading-snug"
                  role="note" aria-label="가입시점 못 맞춤">
                  {current.system} 제도 가입일이 비어 있어 가입시점은 맞추지 못했습니다.
                  왼쪽 <strong>{current.system} 제도 가입일</strong>에 넣어 주세요.
                </p>
              )}
            </div>
          )}
          <MatrixPick label="퇴직제도" value={sys} onChange={setSys}
            options={[{ value: 'SEV', label: '퇴직금제도' }, { value: 'DB', label: 'DB' }, { value: 'DC', label: 'DC' }]} />
          {sys !== 'SEV' && (
            <MatrixPick label={sys + ' 제도 가입일'} value={legacy} onChange={setLegacy}
              options={[{ value: true, label: CUTOFF_LABEL + ' 전' }, { value: false, label: CUTOFF_LABEL + ' 후' }]} />
          )}
          <MatrixPick label="받을 돈" value={funds} onChange={setFunds} multi
            hint="둘 다 있으면 둘 다 켜 두세요 - 답이 서로 다릅니다"
            options={[
              { value: 'LEGAL', label: sys === 'SEV' ? '법정퇴직금' : '규약상 퇴직급여' },
              { value: 'HONOR', label: '명퇴금 · 위로금' }
            ]} />
          <MatrixPick label="퇴직 시 나이" value={old55} onChange={setOld55}
            options={[{ value: false, label: '만 55세 미만' }, { value: true, label: '만 55세 이상' }]} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-[13px] font-bold text-ink mb-1.5">연금저축계좌</div>
            <div className="border border-hair rounded-sm overflow-hidden">
              {penIdx.map((i) => (
                <MatrixRow key={i} label={M.targets[i].label.replace(' 연금저축', '').replace('연금저축 ', '')}
                  entries={entriesFor(i)} showIndex />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink mb-1.5">IRP</div>
            <div className="border border-hair rounded-sm overflow-hidden">
              {irpIdx.map((i) => (
                <MatrixRow key={i} label={M.targets[i].label.replace(' IRP', '').replace('IRP ', '')}
                  entries={entriesFor(i)} showIndex />
              ))}
            </div>
          </div>
        </div>
        {funds.length > 1 && (
          <p className="text-[12px] text-ink-soft mt-3 leading-relaxed" role="note" aria-label="재원별 분할 안내">
            재원마다 갈 수 있는 계좌와 기산연차가 다르면 <strong>나누어 입금</strong>합니다.
            화면 왼쪽에 금액을 넣으면 <strong>판정</strong> 탭이 재원별로 계좌를 배정해 줍니다.
          </p>
        )}
        <p className="text-[12px] text-ink-soft mt-3 leading-relaxed">
          오른쪽 숫자는 <strong>기산연차</strong>입니다. 실제 연금수령연차는 기산연도(만 55세 + 계좌에 돈이 들어온 해)부터
          해마다 쌓이므로 더 클 수 있습니다. <strong>연차가 클수록 한도가 큽니다</strong> - 6년차면 1년차의 2배입니다.
        </p>
      </Section>

      {/* ── 2. 계좌를 옮길 수 있나 ── */}
      <Section title="가지고 있는 계좌를 옮길 수 있나">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <MatrixPick label="보내는 계좌" value={from} onChange={setFrom} ariaPrefix="보내는 "
            options={grp.kinds.map((k, i) => ({ value: i, label: k }))} />
          <MatrixPick label="받는 계좌" value={to} onChange={setTo} ariaPrefix="받는 "
            options={grp.kinds.map((k, i) => ({ value: i, label: k }))} />
        </div>
        <MatrixPick label="연금수령요건" hint="만 55세 이상 + 가입 5년 경과"
          value={meets} onChange={setMeets}
          options={[{ value: false, label: '아직 아님' }, { value: true, label: '충족' }]} />

        <div className="border border-hair rounded-sm overflow-hidden mt-3">
          <MatrixRow label={grp.kinds[from] + ' → ' + grp.kinds[to]}
            entries={[{ fund: 'MOVE', label: '', cell: tCell }]} />
        </div>

        {tCell.verdict !== '불가' && from !== to && (
          <div className="mt-3 px-3 py-2.5 border border-[#E8D49A] bg-[#FBF3DF] rounded-sm text-[13px] text-[#8A6A0B] leading-relaxed">
            <strong>옮기기 전에 연차부터 보세요.</strong>{' '}
            {(from === 0 || from === 2) && (to === 1 || to === 3)
              ? '구 계좌(6년차)를 잔액 있는 신 계좌로 옮기면 받는 계좌 가입일이 적용되어 1년차가 됩니다. 한도가 몇 배 줄어듭니다.'
              : '신규 계좌를 열어 잔액 없는 상태에서 전액을 옮기면 보내는 계좌의 가입일자를 고를 수 있습니다' +
                qref(' (Q32)') + '. 자동이 아니라 선택이므로 반드시 요청하세요.'}
          </div>
        )}
        <p className="text-[12px] text-ink-soft mt-3 leading-relaxed">
          전액 이체 · 받는 계좌는 연금개시 전이라고 보았습니다.
          일부만 옮기거나 <strong>연금이 개시된 계좌로</strong> 옮기는 것은 어느 조합이든 불가입니다.
        </p>
      </Section>

      {/*
        ── 3. 근거 ──
        배포본에는 실리지 않는다. 빌드가 자료를 비워 보내므로(build.js 의
        INCLUDE_SOURCES) 이 묶음은 그려지지 않는다. 화면에서만 가리면 파일을
        편집기로 열었을 때 그대로 읽히므로, 자료 자체를 심지 않는 쪽으로 둔다.
        되돌리면 이 자리에 그대로 다시 나온다.
      */}
      {(M.sources || []).length > 0 && (
      <details className="border border-hair rounded-sm bg-white">
        <summary className="px-4 py-3 text-[14px] font-bold text-ink cursor-pointer">
          근거
        </summary>
        <div className="px-4 pb-4 space-y-2">
          {M.sources.map((src) => (
            <details key={src.key} className="border border-hair-soft rounded-xs bg-surf-subtle">
              <summary className="px-3 py-2 text-[13px] font-medium text-ink-body cursor-pointer">
                <span className="text-mas-active font-bold">{src.id}</span> {src.title}
              </summary>
              <p className="px-3 pb-2.5 text-[12px] text-ink-soft leading-relaxed">{src.note}</p>
            </details>
          ))}
        </div>
      </details>
      )}
    </div>
  );
}

function App() {
  // --- 고객 정보
  const [birthRaw, setBirthRaw] = useState('');
  const [custName, setCustName] = useState('');

  // --- 퇴직제도
  const [system, setSystem] = useState('DC');          // 'DB' | 'DC' | 'SEV'
  const [systemJoinStr, setSystemJoinStr] = useState('');
  // 퇴직(예정)일. 퇴직급여가 계좌에 들어온 해가 연금수령연차의 기산연도를 좌우한다.
  const [retireDateStr, setRetireDateStr] = useState(TODAY_STR);
  // 임금피크제 등으로 DB → DC 로 전환한 경우. 신규 계좌 전액 이체 시 DB 가입일이 기산연차를 가른다.
  const [dbConverted, setDbConverted] = useState(false);
  const [dbJoinStr, setDbJoinStr] = useState('');
  const [amtSingle, setAmtSingle] = useState(0);
  const [amtLegal, setAmtLegal] = useState(0);
  const [amtHonor, setAmtHonor] = useState(0);
  const [deferredTax, setDeferredTax] = useState(0);

  // --- 이연퇴직소득세 자체 계산
  //
  // 퇴직 전 상담에는 원천징수영수증이 없다. 그러면 이 칸이 비고, 세액 비교와 인출
  // 세액이 통째로 나오지 않는다. 입사일·퇴직일·퇴직급여액에서 직접 산출한다.
  // 기본은 꺼 둔다 - 영수증을 들고 온 고객은 그 값이 맞고, 계산값이 그걸 덮으면 안 된다.
  const [taxCalc, setTaxCalc] = useState(false);
  const [hireDateStr, setHireDateStr] = useState('');
  const [taxExempt, setTaxExempt] = useState(0);        // 비과세 퇴직급여
  const [hasMid, setHasMid] = useState(false);          // 중간정산 받음
  const [midDateStr, setMidDateStr] = useState('');
  const [midAmount, setMidAmount] = useState(0);
  const [midPaidTax, setMidPaidTax] = useState(0);

  // --- 기존 보유 계좌 (여러 개)
  //
  // 연금저축은 한 금융기관에 여러 개를 둘 수 있고, IRP 는 1사 1계좌가 원칙이지만
  // 금융기관마다 하나씩 가질 수 있어 실제로는 여러 개인 경우가 흔하다. 게다가
  // 연금개시된 IRP 가 있거나 구 IRP 에 신 DC 를 넣어야 하는 경우처럼 같은 기관에
  // 추가 개설이 되는 예외도 있다. 연금수령연차는 계좌별로 따로 산정되므로
  // 계좌를 하나로 뭉뚱그리면 판정 자체가 틀어진다.
  const [accountList, setAccountList] = useState([]);
  const nextAccId = React.useRef(1);

  const addAccount = (kind) => setAccountList((l) => l.concat([{
    id: 'acc-' + (nextAccId.current++),
    kind, name: '', joinStr: '', bal: 0, exempt: 0, started: false, fee: 0, merge: false
  }]));
  const patchAccount = (id, patch) =>
    setAccountList((l) => l.map((a) => (a.id === id ? Object.assign({}, a, patch) : a)));
  const removeAccount = (id) => setAccountList((l) => l.filter((a) => a.id !== id));
  const [pastCount, setPastCount] = useState(0);

  // 재원별 수동 선택 - 투자 가능 상품·중도인출 조건 등 앱이 판단하지 않는 기준으로 상담자가 직접 고른다
  const [manualPick, setManualPick] = useState({});

  // 신규 개설 IRP 의 연간 수수료율 (%, 적립금 대비). 기존 계좌 수수료는 계좌마다 따로 받고,
  // 연금저축계좌는 계좌 수수료 자체가 없어 여기에도 들어오지 않는다.
  // 신규 IRP 수수료 조건. 요율은 미래에셋 공시에서 자동으로 나오고, 상담자는
  // 공시가 요구하는 두 가지 사실만 고른다 (앱이 알 수 없는 것들이다).
  const [fees, setFees] = useState({ direct: false, ourDbDc: false });
  const setFee = (id, v) => setFees((f) => Object.assign({}, f, { [id]: v }));

  // --- 시뮬레이션 옵션
  const [pickedId, setPickedId] = useState(null);
  const [tab, setTab] = useState('verdict');
  // 사용법 덮개. printMode 는 인쇄할 때 어느 것을 내보낼지 가른다
  // ('sheet' = 고객용 A4, 'guide' = 사용법). 두 벌을 동시에 내보내면 안 된다.
  const [guideOpen, setGuideOpen] = useState(false);
  const [printMode, setPrintMode] = useState('sheet');
  const [mode, setMode] = useState('even');             // even | max
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(3);

  // ---- 저장 ----
  const [cases, setCases] = useState(() => loadCases());
  const [storeOk] = useState(() => storageAvailable());
  const [notice, setNotice] = useState(null);
  const [memo, setMemo] = useState('');
  const [memoOnPrint, setMemoOnPrint] = useState(false);   // 기본은 내부 메모로 취급해 인쇄 제외
  const [confirmReset, setConfirmReset] = useState(false);  // 전체 초기화 2단계 확인
  const [editingId, setEditingId] = useState(null);   // 목록에서 메모를 고치는 중인 항목
  const [editingText, setEditingText] = useState('');
  const fileRef = React.useRef(null);

  const say = (text, tone) => {
    setNotice({ text, tone: tone || 'ok' });
    setTimeout(() => setNotice(null), 4000);
  };

  /** 화면의 모든 입력을 한 덩어리로 모은다 (저장·내보내기 공통) */
  const collectState = () => ({
    custName, birthRaw, system, systemJoinStr, retireDateStr, dbConverted, dbJoinStr,
    amtSingle, amtLegal, amtHonor, deferredTax,
    taxCalc, hireDateStr, taxExempt, hasMid, midDateStr, midAmount, midPaidTax,
    accounts: accountList,
    pastCount, fees, manualPick, pickedId, mode, years, rate, memo, memoOnPrint
  });

  // 우리 형식인지 최소한의 확인. 아니면 폼을 건드리지 않는다
  const looksLikeCase = (d) => {
    if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
    const keys = ['custName', 'birthRaw', 'system', 'systemJoinStr', 'amtSingle',
      'amtLegal', 'amtHonor', 'deferredTax', 'years', 'rate', 'accounts', 'mode'];
    return keys.filter((k) => Object.prototype.hasOwnProperty.call(d, k)).length >= 4;
  };

  const applyState = (d) => {
    if (!looksLikeCase(d)) return false;
    const str = (v, f) => (typeof v === 'string' ? v : f);
    const num = (v, f) => (typeof v === 'number' && isFinite(v) ? v : f);
    const bool = (v, f) => (typeof v === 'boolean' ? v : f);
    setCustName(str(d.custName, ''));
    setBirthRaw(str(d.birthRaw, ''));
    setSystem(['DB', 'DC', 'SEV'].indexOf(d.system) >= 0 ? d.system : 'DC');
    setSystemJoinStr(str(d.systemJoinStr, ''));
    setRetireDateStr(str(d.retireDateStr, TODAY_STR));
    setDbConverted(bool(d.dbConverted, false));
    setDbJoinStr(str(d.dbJoinStr, ''));
    setAmtSingle(num(d.amtSingle, 0));
    setAmtLegal(num(d.amtLegal, 0));
    setAmtHonor(num(d.amtHonor, 0));
    setDeferredTax(num(d.deferredTax, 0));
    // 자체 계산 칸은 나중에 생겼다. 없던 시절의 저장 건은 '직접 입력'으로 열린다.
    setTaxCalc(bool(d.taxCalc, false));
    setHireDateStr(str(d.hireDateStr, ''));
    setTaxExempt(num(d.taxExempt, 0));
    setHasMid(bool(d.hasMid, false));
    setMidDateStr(str(d.midDateStr, ''));
    setMidAmount(num(d.midAmount, 0));
    setMidPaidTax(num(d.midPaidTax, 0));
    setAccountList(readAccounts(d, { str, num, bool }));
    setPastCount(num(d.pastCount, 0));
    // 예전 저장 건에 있던 'new-pension'·'ex-*' 키는 흘려보낸다 (연금저축은 계좌 수수료가 없다)
    // 예전 저장 건의 'new-irp'(직접 입력 요율)·'new-pension'·'ex-*' 키는 흘려보낸다.
    // 신규 IRP 요율은 이제 공시에서 나오므로 저장할 값이 아니다.
    setFees({ direct: bool(d.fees && d.fees.direct, false), ourDbDc: bool(d.fees && d.fees.ourDbDc, false) });
    setManualPick(d.manualPick && typeof d.manualPick === 'object' ? d.manualPick : {});
    setPickedId(typeof d.pickedId === 'string' ? d.pickedId : null);
    setMode(d.mode === 'max' ? 'max' : 'even');
    setYears(Math.min(30, Math.max(5, num(d.years, 10))));
    setRate(Math.min(8, Math.max(0, num(d.rate, 3))));
    setMemo(str(d.memo, '').slice(0, MEMO_MAX));
    setMemoOnPrint(bool(d.memoOnPrint, false));
    return true;
  };

  // 덮개는 Esc 로 닫힌다. 덮개가 열려 있는 동안에는 뒤 화면이 스크롤되지 않게 한다.
  React.useEffect(() => {
    if (!guideOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setGuideOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [guideOpen]);

  /** 사용법만 인쇄한다. 고객용 A4 와 섞이지 않게 내보낼 것을 바꿔 두고 되돌린다 */
  const printGuide = () => {
    setPrintMode('guide');
    setTimeout(() => {
      window.print();
      setPrintMode('sheet');
    }, 150);
  };

  const birth = useMemo(() => parseBirth(birthRaw), [birthRaw]);
  const age = useMemo(() => ageOn(birth, TODAY), [birth]);

  const systemJoin = useMemo(() => parseDate(systemJoinStr), [systemJoinStr]);
  const dbJoin = useMemo(() => parseDate(dbJoinStr), [dbJoinStr]);

  // 제도 가입일을 비워 두면 '2013.3.1 이후' 로 흘러가 1년차 기산이 된다.
  // 넣지 않은 것과 '이후' 인 것은 다른 이야기이므로 갈라 둔다 (아래 missingJoins).
  const systemJoinMissing = system !== 'SEV' && !systemJoin;

  // 퇴직(예정)일. 비워 두면 오늘로 본다. 과거 퇴직도 미래 퇴직 예정도 받는다.
  const retireDate = useMemo(() => parseDate(retireDateStr) || TODAY, [retireDateStr]);
  const depositYear = retireDate.getFullYear();
  const isPastRetire = depositYear < TODAY.getFullYear();

  // 명퇴금은 어느 제도에서나 있을 수 있다 (규약에 규정되지 않은 돈)
  const retireTotal = (system === 'SEV' ? amtLegal : amtSingle) + amtHonor;

  // 이전 가능 여부(만 55세 미만 IRP 의무이전 등)는 퇴직급여를 지급받는 시점의 나이로 본다.
  const retireAge = useMemo(() => ageOn(birth, retireDate), [birth, retireDate]);

  // --- 이연퇴직소득세 자체 계산 ---
  //
  // 퇴직금제도는 이미 '입사일' 칸을 쓰고 있으므로 그것을 그대로 근속 시작일로 본다.
  // DB·DC 의 '제도 가입일' 은 입사일이 아니다 - 근속연수는 입사일 기준이라 따로 받는다.
  const hireDate = useMemo(
    () => (system === 'SEV' ? systemJoin : parseDate(hireDateStr)),
    [system, systemJoin, hireDateStr]);
  const midDate = useMemo(() => parseDate(midDateStr), [midDateStr]);

  const taxResult = useMemo(() => {
    if (!taxCalc) return null;
    return computeRetireTax({
      hire: hireDate, retire: retireDate,
      amount: Math.max(0, ((system === 'SEV' ? amtLegal : amtSingle) + amtHonor) - taxExempt),
      midDate: hasMid ? midDate : null,
      midAmount: hasMid ? midAmount : 0,
      midPaidTax: hasMid ? midPaidTax : 0
    });
  }, [taxCalc, hireDate, retireDate, system, amtLegal, amtSingle, amtHonor,
    taxExempt, hasMid, midDate, midAmount, midPaidTax]);

  // 계산을 켜 두었는데 못 한 이유. 빈 칸을 조용히 0 으로 두지 않는다.
  const taxBlockers = useMemo(() => {
    if (!taxCalc) return [];
    const out = [];
    if (!hireDate) out.push(system === 'SEV' ? '입사일' : '입사일 (근속연수 기산일)');
    if (!(((system === 'SEV' ? amtLegal : amtSingle) + amtHonor) > 0)) out.push('퇴직급여액');
    if (hasMid && !midDate) out.push('중간정산일');
    if (hasMid && !(midAmount > 0)) out.push('중간정산 퇴직급여');
    if (hireDate && retireDate && retireDate < hireDate) out.push('퇴직일이 입사일보다 빠릅니다');
    if (hasMid && midDate && hireDate && (midDate < hireDate || midDate > retireDate)) {
      out.push('중간정산일이 입사일~퇴직일 밖입니다');
    }
    return out;
  }, [taxCalc, hireDate, retireDate, system, amtLegal, amtSingle, amtHonor,
    hasMid, midDate, midAmount]);

  // 계산이 성립하면 그 값을 쓰고, 아니면 직접 입력한 값을 쓴다.
  //
  // 어느 쪽이든 **국세 기준**이다(직접 입력은 원천징수영수증의 '이연퇴직소득세').
  // 시뮬레이션에는 지방소득세 10% 를 더한 합계를 넘긴다 - 같은 칸의 연금소득세·
  // 기타소득세가 이미 지방세를 품은 세율이라, 퇴직소득세만 국세로 두면 기준이 갈린다.
  const deferredTaxNational = taxCalc && taxResult ? taxResult.chosen.tax : deferredTax;
  const effectiveDeferredTax = deferredTaxNational + floorWon(deferredTaxNational * 0.1);

  // 인출을 시작하는 해. 이미 지난 해부터 시뮬레이션할 수는 없으므로 오늘이 하한이고,
  // 퇴직 예정일이 미래면 그때, 만 55세가 아직이면 55세가 되는 해가 하한이 된다.
  const startYear = useMemo(() => {
    let y = Math.max(TODAY.getFullYear(), depositYear);
    if (birth) y = Math.max(y, birth.getFullYear() + 55);
    return y;
  }, [birth, depositYear]);
  const startAge = birth ? Math.max(startYear - birth.getFullYear(), 55) : 55;

  const input = {
    age: retireAge, birthYear: birth ? birth.getFullYear() : null, startYear, depositYear,
    system, systemJoin, dbConverted, dbJoin,
    amtSingle, amtLegal, amtHonor,
    accounts: accountList.map((a) => Object.assign({}, a, { joinDate: parseDate(a.joinStr) })),
    // 신규 IRP 의 계약 1차년도는 퇴직급여가 들어오는 해다. 인출이 그보다 늦게
    // 시작하면(만 55세 대기 등) 그만큼 장기할인 차년도가 앞서 있다.
    fees: Object.assign({}, fees, { contractOffset: Math.max(0, startYear - depositYear) })
  };

  const sources = useMemo(() => buildSources(input),
    [system, systemJoinStr, dbConverted, dbJoinStr, amtSingle, amtLegal, amtHonor]);

  const { candidates, allocation } = useMemo(() => {
    const base = buildCandidates(input, sources);
    const alloc = buildAllocation(base, sources, manualPick);
    return { candidates: applyAllocation(base, alloc), allocation: alloc };
  }, [sources, retireAge, birth, startYear, depositYear, accountList, fees, manualPick]);

  // 배정액이 가장 큰 계좌를 기본 시뮬레이션 대상으로 삼는다
  const best = useMemo(() => {
    const used = candidates.filter((c) => c.allocatedAmount > 0);
    if (!used.length) return null;
    return used.slice().sort((a, b) => b.allocatedAmount - a.allocatedAmount)[0];
  }, [candidates]);

  // 분할 입금 여부 - 재원이 서로 다른 계좌로 배정되면 분할
  const isSplit = useMemo(() => {
    const ids = allocation.filter((a) => a.target).map((a) => a.target.id);
    return new Set(ids).size > 1;
  }, [allocation]);

  // 사용자가 직접 고르기 전까지는 항상 최적 추천 계좌를 따라간다
  const picked = useMemo(() => {
    if (!pickedId) return best;
    const found = candidates.find((c) => c.id === pickedId && c.allocatedAmount > 0);
    return found || best;
  }, [candidates, pickedId, best]);

  /**
   * 시뮬레이션 대상으로 고를 수 있는 계좌.
   *
   * 판정 탭에서 카드를 눌러 고르는 것과 **같은 집합**이다(실제로 돈이 배정된 계좌).
   * 분할 입금이면 둘 이상이 된다. 스케줄 탭의 선택 상자는 여기에 비교 후보까지
   * 더해 만든다 - scheduleChoices 를 보라.
   */
  const pickables = useMemo(
    () => candidates.filter((c) => c.allocatedAmount > 0),
    [candidates]);

  // 합산할 수 있는 계좌 - 잔고가 있어야 합산에 의미가 있다
  const mergeable = useMemo(() => accountList.filter((a) => a.bal > 0), [accountList]);

  /** 한 번에 켜고 끈다. 계좌가 여럿이면 카드마다 누르는 것이 번거롭다 */
  const setMergeAll = (on) =>
    setAccountList((l) => l.map((a) => (a.bal > 0 ? Object.assign({}, a, { merge: on }) : a)));

  // 합산하기로 체크한 계좌의 잔고. 세액공제 받지 않은 납입액은 과세제외 재원으로 따로 뗀다.
  // 퇴직급여를 받을 계좌 자신도 체크되어 있으면 포함된다 (그 계좌 전체를 보는 것이 맞다).
  const merged = useMemo(
    () => accountList.filter((a) => a.merge && a.bal > 0),
    [accountList]);

  const { exemptPrincipal, otherPrincipal } = useMemo(() => {
    let e = 0, g = 0;
    for (const a of merged) {
      const ex = Math.max(0, Math.min(a.exempt, a.bal));
      e += ex; g += a.bal - ex;
    }
    return { exemptPrincipal: e, otherPrincipal: g };
  }, [merged]);

  /**
   * 합산 경고 - 연금수령한도는 계좌별로 따로 산정된다.
   * 연차가 다른 계좌를 합산하면 한도가 한쪽 기준으로 계산되어 부정확해진다.
   */
  const mixedBasis = useMemo(() => {
    if (!picked || !merged.length) return [];
    const ids = merged.map((a) => a.id);
    // 둘 다 2013.3.1 이전이어도 만 55세 도달 시점이 달라 연차가 벌어질 수 있으므로,
    // legacy 여부가 아니라 연차 자체를 비교한다.
    return candidates.filter((c) =>
      ids.indexOf(c.id) >= 0 && c.id !== picked.id && c.startLimitYear !== picked.startLimitYear);
  }, [candidates, picked, merged]);

  /**
   * 시뮬레이션에 실제로 먹일 수수료율.
   *
   * 수수료는 계좌마다 다르고 연금저축계좌에는 아예 없다. 그런데 '시뮬레이션 합산'으로
   * 다른 계좌의 잔고를 끌어오면서 수령 계좌의 요율을 그 돈에까지 먹이면, 연금저축
   * 5천만원을 연 0.3% IRP 에 합산하는 것만으로 있지도 않은 수수료가 해마다 15만원씩
   * 생긴다. 합산된 잔고는 실제로는 제 계좌에 남아 제 요율을 무는 돈이므로 금액으로
   * 가중평균한다.
   */
  const blendedFeeRate = useMemo(() => {
    if (!picked) return 0;
    const rateOf = (a) => (a.id === picked.id ? picked.feeRate : a.kind === 'irp' ? (a.fee || 0) / 100 : 0);
    const parts = [{ amt: picked.allocatedAmount, rate: picked.feeRate }]
      .concat(merged.map((a) => ({ amt: a.bal, rate: rateOf(a) })));
    const total = parts.reduce((s, p) => s + p.amt, 0);
    if (!(total > 0)) return picked.feeRate;
    return parts.reduce((s, p) => s + p.amt * p.rate, 0) / total;
  }, [picked, merged]);

  /**
   * 신규 IRP 가 실제로 얼마를 무는지 한 줄로 적는다.
   *
   * 요율이 해마다 바뀌므로 숫자 하나로는 설명이 안 된다. 첫 해와 마지막 해를
   * 함께 적어 '갈수록 준다' 는 것이 보이게 한다.
   */
  const newIrpFeeNote = useMemo(() => {
    const c = candidates.find((x) => x.id === 'new-irp');
    if (!c || !(c.acceptAmount > 0)) return null;
    if (fees.direct) return '전액 면제 조건에 해당해 수수료 0 으로 계산합니다.';
    const off = Math.max(0, startYear - depositYear);
    const pct = (k) => {
      const f = masIrpFee(c.acceptAmount, k + off,
        { fromOurDb: !!fees.ourDbDc, drawn: k > 1 });
      return (f / c.acceptAmount * 100).toFixed(3) + '%';
    };
    return '배정액 ' + krw(c.acceptAmount) + ' 기준 1회차 ' + pct(1) +
      ' → 2회차 ' + pct(2) + ' → ' + years + '회차 ' + pct(years) +
      ' (적립금이 줄면 더 낮아집니다)';
  }, [candidates, fees.direct, fees.ourDbDc, startYear, depositYear, years]);

  // 분할 입금 시 이연퇴직소득세는 계좌에 배정된 금액 비율로 안분한다
  const allocatedDeferredTax = useMemo(() => {
    if (!picked || !(retireTotal > 0)) return 0;
    return effectiveDeferredTax * (picked.allocatedAmount / retireTotal);
  }, [picked, effectiveDeferredTax, retireTotal]);

  const sim = useMemo(() => {
    if (!picked || !(picked.allocatedAmount > 0)) return null;
    return buildSchedule({
      exemptPrincipal,
      retirePrincipal: picked.allocatedAmount,
      otherPrincipal,
      deferredTax: allocatedDeferredTax,
      startLimitYear: picked.startLimitYear,
      pastCount,
      feeRate: blendedFeeRate,
      // 합산 계좌가 없을 때만 연차별 요율을 그대로 쓴다. 합산하면 다른 계좌의
      // 고정 요율과 섞이므로 가중평균(blendedFeeRate)으로 둔다.
      feeOf: merged.length === 0 ? picked.feeOf : null,
      years, mode, rate: rate / 100, startYear, startAge
    });
  }, [picked, merged, exemptPrincipal, otherPrincipal, allocatedDeferredTax, pastCount, years, mode, rate, startYear, startAge, blendedFeeRate]);

  /**
   * 계좌별 비교 - 퇴직급여를 어느 계좌로 받느냐만 바꾸고 나머지 조건은 동일하게 두어
   * 총 수수료와 세후 수령액을 나란히 본다. 기존 잔고 합산은 빼고 퇴직급여 단독으로 비교한다.
   */
  const comparison = useMemo(() => {
    if (!(retireTotal > 0)) return [];
    return candidates
      .filter((c) => c.acceptAmount > 0)
      .map((c) => {
        const s = buildSchedule({
          exemptPrincipal: 0,
          retirePrincipal: c.acceptAmount,
          otherPrincipal: 0,
          deferredTax: effectiveDeferredTax * (c.acceptAmount / retireTotal),
          startLimitYear: c.startLimitYear,
          pastCount,
          feeRate: c.feeRate, feeOf: c.feeOf,
          years, mode, rate: rate / 100, startYear, startAge
        });
        return {
          c,
          amount: c.acceptAmount,
          partial: c.acceptAmount < retireTotal,
          totalFee: s.totals.totalFee,
          totalTax: s.totals.totalTax,
          afterTax: s.totals.afterTax,
          residual: s.totals.residual
        };
      })
      .sort((a, b) => (b.afterTax + b.residual) - (a.afterTax + a.residual));
  }, [candidates, retireTotal, effectiveDeferredTax, pastCount, years, mode, rate, startYear, startAge]);

  /**
   * 인출 스케줄에서 고를 수 있는 계좌 - 배정된 계좌 + 계좌 비교에 오른 후보.
   *
   * 전에는 '실제로 돈이 배정된 계좌' 만 올렸다. 그런데 계좌 비교 탭에는 후보가
   * 보통 둘 이상 나란히 서는데(신규 IRP vs 기존 IRP) 돈이 가는 곳은 하나뿐이라,
   * 분할 입금이 아닌 보통의 상담에서는 스케줄 탭에 상자 자체가 뜨지 않았다.
   * 정작 상담 자리에서 묻는 것은 **'저 계좌로 받으면 어떻게 되느냐'** 인데,
   * 그걸 보려면 판정 탭까지 되돌아가 재원별 선택 상자를 고쳐야 했다.
   *
   * 그래서 비교 후보도 같이 올린다. 다만 둘은 성격이 다르다 - 배정된 계좌를
   * 고르면 보는 대상만 옮기고, 배정되지 않은 후보를 고르면 **받을 계좌 자체가
   * 바뀐다**(판정·인쇄물·엑셀까지). 상자 안에서 묶음을 갈라 두고, 바꾼 뒤에는
   * 되돌릴 수 있게 안내를 띄운다.
   */
  const scheduleChoices = useMemo(() => {
    const out = pickables.map((c) => ({ c: c, allocated: true }));
    comparison.forEach((r) => {
      if (!out.some((x) => x.c.id === r.c.id)) out.push({ c: r.c, allocated: false });
    });
    return out;
  }, [pickables, comparison]);

  /**
   * 스케줄에서 계좌를 바꾼다.
   *
   * 배정되지 않은 후보를 골랐으면 그 계좌로 받을 수 있는 재원만 돌린다. 받을 수
   * 없는 재원(연금저축계좌에 DC 퇴직급여 같은)까지 싸잡아 지정하면 buildAllocation
   * 이 조용히 무시해 선택 상태와 화면이 어긋난다. 옮길 수 없는 재원은 제자리에
   * 남고, 그러면 분할 입금이 되어 아래 분할 안내가 그대로 사정을 적는다.
   */
  const chooseScheduleAccount = (id) => {
    const hit = scheduleChoices.find((x) => x.c.id === id);
    if (!hit) return;
    if (!hit.allocated) {
      setManualPick((m) => {
        const next = Object.assign({}, m);
        allocation.forEach((a) => {
          if (a.options.some((o) => o.id === id)) next[a.source.kind] = id;
        });
        return next;
      });
    }
    setPickedId(id);
  };

  // 수령 기간이 최소 권장보다 짧으면 경고
  const shortSpan = picked && years < picked.minYears;

  const ready = !!birth && retireTotal > 0;

  /**
   * PDF 저장 시의 기본 파일명.
   * 크롬은 인쇄 창에서 document.title 을 파일명으로 제안하므로, 인쇄 직전에만
   * 고객명이 들어간 제목으로 바꾸고 끝나면 되돌린다. Ctrl+P 로 눌러도 동작하도록
   * beforeprint/afterprint 이벤트에 건다.
   */
  useEffect(() => {
    const wanted = '퇴직급여 의사결정' + (custName ? '_' + safeName(custName) : '') + '_' + TODAY_STR;
    const before = () => { document.title = wanted; };
    const after = () => { document.title = DOC_TITLE; };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
      document.title = DOC_TITLE;
    };
  }, [custName]);

  // 보고 있던 탭의 내용이 사라지면 판정 탭으로 되돌린다 (빈 화면 방지)
  useEffect(() => {
    // 판단표는 고객 정보와 무관한 참조표라 언제나 볼 수 있다.
    if (tab === 'matrix') return;
    if (!ready && tab !== 'verdict') setTab('verdict');
    else if (tab === 'compare' && comparison.length < 2) setTab('verdict');
    else if (tab === 'schedule' && !sim) setTab('verdict');
  }, [ready, tab, comparison.length, sim]);


  // ---- 저장 동작 ----
  const doSaveCase = () => {
    const name = safeName(custName) + ' · ' + (birth ? birth.getFullYear() + '년생' : '생년월일 미입력');
    const entry = { id: 'c' + Date.now(), name, savedAt: new Date().toISOString(),
      memo: memo.trim().slice(0, MEMO_MAX), data: collectState() };
    const next = [entry].concat(cases.filter((c) => c.name !== name)).slice(0, 50);
    const r = saveCases(next);
    if (r.ok) { setCases(next); say('저장했습니다 - ' + name); }
    else say(r.reason + ' 파일로 내보내기를 쓰세요.', 'err');
  };

  const doLoadCase = (id) => {
    const c = cases.find((x) => x.id === id);
    if (!c) return;
    applyState(c.data);
    setMemo(String(c.memo || (c.data && c.data.memo) || '').slice(0, MEMO_MAX));
    say('불러왔습니다 - ' + c.name);
  };

  /** 목록에서 메모만 고친다 (입력값은 건드리지 않는다) */
  const doSaveMemo = (id) => {
    const next = cases.map((c) => (c.id === id
      ? Object.assign({}, c, {
          memo: editingText.trim().slice(0, MEMO_MAX),
          data: Object.assign({}, c.data, { memo: editingText.trim().slice(0, MEMO_MAX) })
        })
      : c));
    const r = saveCases(next);
    if (r.ok) { setCases(next); setEditingId(null); say('메모를 수정했습니다.'); }
    else say(r.reason, 'err');
  };

  const doDeleteCase = (id) => {
    const c = cases.find((x) => x.id === id);
    const next = cases.filter((x) => x.id !== id);
    const r = saveCases(next);
    if (r.ok) { setCases(next); say('삭제했습니다' + (c ? ' - ' + c.name : '')); }
    else say(r.reason, 'err');
  };

  /**
   * 전체 초기화 - 화면의 입력만 비운다.
   * 저장된 상담은 건드리지 않는다. 지우려면 목록에서 항목별로 삭제한다.
   */
  const doReset = () => {
    setCustName(''); setBirthRaw('');
    setSystem('DC'); setSystemJoinStr(''); setRetireDateStr(TODAY_STR);
    setDbConverted(false); setDbJoinStr('');
    setAmtSingle(0); setAmtLegal(0); setAmtHonor(0); setDeferredTax(0);
    setTaxCalc(false); setHireDateStr(''); setTaxExempt(0);
    setHasMid(false); setMidDateStr(''); setMidAmount(0); setMidPaidTax(0);
    setAccountList([]);
    setPastCount(0);
    setFees({ direct: false, ourDbDc: false });
    setManualPick({}); setPickedId(null);
    setMode('even'); setYears(10); setRate(3);
    setMemo(''); setMemoOnPrint(false);
    setTab('verdict'); setEditingId(null); setConfirmReset(false);
    say('입력을 초기화했습니다. 저장된 상담은 그대로입니다.');
  };

  const doExport = () => {
    const payload = { format: CASE_FORMAT, version: 1, savedAt: new Date().toISOString(), data: collectState() };
    const fn = downloadName('retirement-case', custName, 'json');
    downloadBlob(fn, 'application/json;charset=utf-8', JSON.stringify(payload, null, 2));
    say('내보냈습니다 - ' + fn);
  };

  const doImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        const d = obj && obj.format === CASE_FORMAT ? obj.data : obj && obj.data ? obj.data : obj;
        if (!applyState(d)) throw new Error('형식 오류');
        say('가져왔습니다 - ' + (file.name || ''));
      } catch (e) {
        say('이 파일은 상담 케이스 형식이 아닙니다.', 'err');
      }
    };
    reader.onerror = () => say('파일을 읽지 못했습니다.', 'err');
    reader.readAsText(file, 'utf-8');
  };

  /**
   * PDF 저장.
   *
   * 브라우저 인쇄 창의 '대상 = PDF로 저장' 이 곧 PDF 저장이다. 이 경로를 쓰면
   * 글자가 이미지로 굽히지 않고 벡터로 들어가 검색·복사가 되고 A4 배치도 정확하다.
   * 별도 PDF 라이브러리를 넣으면 한글 폰트까지 다시 실어야 해 파일이 수 MB 로 불어나고,
   * 인쇄 레이아웃을 두 벌 유지해야 한다.
   */
  const doPdf = () => {
    say("인쇄 창이 열리면 '대상'을 'PDF로 저장'으로 고르세요.");
    setTimeout(() => window.print(), 250);
  };

  const doCsv = () => {
    if (!sim) return;
    const meta = [
      ['고객명', custName || '-'],
      ['생년월일', birthRaw || '-'],
      ['퇴직제도', system === 'SEV' ? '퇴직금제도' : system],
      ['수령 계좌', picked ? picked.label : '-'],
      ['한도 기산', picked ? picked.startLimitYear + '년차' : '-'],
      ['대상 자산(원)', Math.round(picked.allocatedAmount + otherPrincipal)],
      ['수령 기간(년)', years],
      ['운용수익률(%)', rate],
      ['계좌 수수료(%)', (blendedFeeRate * 100).toFixed(2)],
      ['작성일', TODAY_STR],
      ['상담 메모', memo.trim() || '-']
    ];
    const fn = downloadName('retirement-schedule', custName, 'csv');
    downloadBlob(fn, 'text/csv;charset=utf-8', scheduleCsv(sim.rows, meta));
    say('CSV 로 내보냈습니다 - ' + fn);
  };

  /**
   * 엑셀(.xlsx) 내보내기.
   *
   * CSV 와 겹치지 않는다. CSV 는 인출 스케줄 표 한 장을 **다른 곳으로 넘기는** 것이고,
   * 엑셀은 상담 결과 전부를 담고 인출표를 **수식으로** 써서 고객 앞에서 금액이나
   * 운용수익률을 바꿔 볼 수 있게 하는 것이다.
   *
   * 배정된 계좌마다 스케줄 시트를 하나씩 만든다. 분할 입금이면 화면에서는 한 번에
   * 하나만 보지만, 파일로 내려받은 뒤에는 나란히 놓고 볼 수 있는 편이 낫다.
   */
  const doXlsx = () => {
    if (!sim || !picked) return;

    const sheets = [];
    const used = [];

    sheets.push(summarySheet({
      today: TODAY_STR,
      custName, birthRaw, age,
      systemLabel: system === 'SEV' ? '퇴직금제도' : system,
      joinStr: systemJoinStr, retireStr: retireDateStr,
      amtLegal: system === 'SEV' ? amtLegal : amtSingle,
      amtHonor, retireTotal,
      deferredNational: deferredTaxNational,
      deferredLocal: effectiveDeferredTax - deferredTaxNational,
      deferredTotal: effectiveDeferredTax,
      taxCalc, mode, years, rate,
      mergedLabel: merged.map((a) => accountNames[a.id]).join(' · '),
      memo: memo.trim(),
      allocation: allocation.map((a) => ({
        source: a.source.label,
        amount: a.source.amount,
        target: a.target ? a.target.label : '배정 가능한 계좌 없음',
        startLimitYear: a.target ? a.target.startLimitYear + '년차' : '-',
        reason: a.manual ? '상담자가 직접 고름' : a.target ? '자동 추천' : '아래 판정의 사유를 보세요'
      })),
      verdicts: candidates.reduce((out, c) => {
        c.perSource.forEach((p) => out.push({
          label: c.label,
          source: p.source.label,
          state: p.blockers.length ? '불가' : p.cautions.length ? '조건부' : '가능',
          basis: c.seniorityIndex + '년차',
          year: c.startLimitYear + '년차' + (c.unlimited ? ' (한도 없음)' : ''),
          reason: p.blockers.concat(p.cautions).join(' / ')
        }));
        return out;
      }, [])
    }, used));

    sheets.push(compareSheet({
      comparison: comparison.map((r) => ({
        label: r.c.label,
        startLimitYear: r.c.startLimitYear + '년차',
        amount: r.amount,
        totalFee: r.totalFee, totalTax: r.totalTax,
        afterTax: r.afterTax, residual: r.residual,
        note: r.partial ? '퇴직급여의 일부만 받을 수 있는 계좌입니다' : ''
      }))
    }));

    // 배정된 계좌마다 하나씩. 화면과 같은 조건으로 다시 돌려 캐시값을 얻는다.
    pickables.forEach((cand) => {
      const allocTax = retireTotal > 0
        ? effectiveDeferredTax * (cand.allocatedAmount / retireTotal) : 0;
      const isPicked = cand.id === picked.id;
      const feeOf = merged.length === 0 ? cand.feeOf : null;
      const s = buildSchedule({
        exemptPrincipal: isPicked ? exemptPrincipal : 0,
        retirePrincipal: cand.allocatedAmount,
        otherPrincipal: isPicked ? otherPrincipal : 0,
        deferredTax: allocTax,
        startLimitYear: cand.startLimitYear,
        pastCount,
        feeRate: isPicked ? blendedFeeRate : cand.feeRate,
        feeOf: isPicked ? feeOf : cand.feeOf,
        years, mode, rate: rate / 100, startYear, startAge
      });
      if (!s.rows.length) return;
      sheets.push(scheduleSheet({
        sheet: sheetName('스케줄 · ' + cand.label, used),
        label: cand.label + (isPicked && merged.length ? ' (합산 포함)' : ''),
        exemptPrincipal: isPicked ? exemptPrincipal : 0,
        retirePrincipal: cand.allocatedAmount,
        otherPrincipal: isPicked ? otherPrincipal : 0,
        deferredTax: allocTax,
        rate: rate / 100, years, mode,
        startLimitYear: cand.startLimitYear, startYear, startAge, pastCount,
        feeRate: isPicked ? blendedFeeRate : cand.feeRate,
        masIrp: !!(isPicked ? feeOf : cand.feeOf),
        irpOffset: Math.max(0, startYear - depositYear),
        irpOurDb: !!fees.ourDbDc,
        irpWaived: !!fees.direct,
        rows: s.rows, totals: s.totals
      }));
    });

    if (taxCalc && taxResult) {
      const t = taxResult.chosen;
      sheets.push(taxSheet({
        note: (taxResult.mode === 'settle'
          ? '중간정산 정산특례(소득세법 §148)로 계산했습니다 - 분리 계산보다 유리합니다.'
          : taxResult.settle
            ? '중간정산 분리 계산입니다 - 정산특례보다 유리합니다.'
            : '중간정산이 없는 경우의 계산입니다.') +
          ' 지방소득세 10%(지방세법 §103의3)를 포함한 값입니다.',
        lines: [
          { title: '① 퇴직소득금액', amount: t.income, law: '소득세법 §22',
            body: '법정퇴직금 + 명예퇴직금 - 비과세 퇴직급여. 둘 다 퇴직소득이라 합해서 한 번 계산합니다.' },
          { title: '   근속연수(년)', amount: t.years, law: '시행령 §105②',
            body: '1년 미만의 기간도 1년으로 셉니다. 10년 하고 하루를 더 다녔으면 11년입니다.' },
          { title: '② 근속연수공제', amount: t.svcDed, law: '소득세법 §48①1',
            body: '5년 이하 100만원×년, 6~10년 500만+200만×(년-5), 11~20년 1,500만+250만×(년-10), 20년 초과 4,000만+300만×(년-20).' },
          { title: '③ 환산급여', amount: t.converted, law: '소득세법 §48②',
            body: '(① - ②) ÷ 근속연수 × 12. 여러 해에 걸쳐 쌓인 돈을 한 해에 몰아 받으므로 1년치로 나눈 뒤 12를 곱합니다(연분연승).' },
          { title: '④ 환산급여공제', amount: t.convDed, law: '소득세법 §48③',
            body: '800만 이하 전액, 7,000만 이하 800만+60%, 1억 이하 4,520만+55%, 3억 이하 6,170만+45%, 초과 1억5,170만+35%.' },
          { title: '⑤ 과세표준', amount: t.base, law: '③ - ④',
            body: '1년치로 환산한 금액이라 실제 퇴직금과 크게 다릅니다.' },
          { title: '⑥ 환산산출세액', amount: t.convertedTax, law: '소득세법 §55①',
            body: '기본세율(6~45% 누진)을 환산 과세표준에 적용한 금액입니다.' },
          { title: '⑦ 산출세액 (국세)', amount: t.tax, law: '⑥ ÷ 12 × 근속연수',
            body: '원 미만은 절사합니다. 이것이 원천징수영수증의 이연퇴직소득세 란에 적히는 금액입니다.' },
          { title: '   중간정산 기납부세액', amount: t.paid === undefined ? null : t.paid, law: '소득세법 §148',
            body: '이중과세를 막는 장치이고 퇴직자가 회사에 신고해야 적용됩니다.' },
          { title: '   지방소득세', amount: t.local, law: '지방세법 §103의3',
            body: '국세의 10%. 영수증에는 적히지 않아 국세만 보면 약 10% 작습니다.' },
          { title: '이연퇴직소득세 합계', amount: t.total, law: '⑦ + 지방소득세',
            body: '인출 스케줄의 ② 재원 세액은 이 금액을 기준으로 안분·감면해 계산합니다.' }
        ]
      }));
    }

    const fn = downloadName('retirement-simulation', custName, 'xlsx');
    downloadBlob(fn,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buildXlsx(sheets));
    say('엑셀로 내보냈습니다 (' + sheets.length + '개 시트) - ' + fn);
  };

  // 계좌 목록의 표시 이름 (종류별 순번). 판정 카드와 같은 규칙으로 매긴다.
  // 표시 이름에는 금융기관명을 붙이지만, aria-label 로 쓰는 키에는 붙이지 않는다.
  // 기관명을 타이핑하는 도중 라벨이 계속 바뀌면 그 칸을 다시 잡을 수 없게 된다.
  const accountNames = useMemo(() => {
    const seq = { pension: 0, irp: 0 };
    const out = {};
    for (const a of accountList) { seq[a.kind] += 1; out[a.id] = accountLabel(a, seq[a.kind]); }
    return out;
  }, [accountList]);

  const accountKeys = useMemo(() => {
    const seq = { pension: 0, irp: 0 };
    const out = {};
    for (const a of accountList) { seq[a.kind] += 1; out[a.id] = accountKey(a, seq[a.kind]); }
    return out;
  }, [accountList]);

  /**
   * 가입일을 비워 둔 곳의 이름.
   *
   * 빈 가입일은 조용히 '2013.3.1 이후' 로 흘러가 1년차 기산이 된다. 한도가 절반이
   * 되는 값인데 화면 어디에도 표시가 없어, 상담자는 넣지 않은 줄 모른 채 답을 믿게
   * 된다. 실제로 그렇게 나온 판정을 '오류' 로 보고받았다. 가정을 했으면 이름을 대고
   * 말한다.
   *
   * 퇴직금제도(SEV)의 입사일은 가입일자 개념 자체가 없어(Q37) 여기 들어가지 않는다.
   */
  const missingJoins = useMemo(() => {
    const out = [];
    if (systemJoinMissing) out.push(system + ' 제도 가입일');
    if (system === 'DC' && dbConverted && !dbJoin) out.push('전환 전 DB 가입일');
    for (const a of accountList) {
      if (!parseDate(a.joinStr)) out.push(accountKeys[a.id] + ' 가입일');
    }
    return out;
  }, [systemJoinMissing, system, dbConverted, dbJoin, accountList, accountKeys]);

  return (
    <React.Fragment>
      {/* ===================== 화면 ===================== */}
      <div className="screen-only">
        {/*
          머리는 상담 중에 한 번도 읽지 않는 자리다. 크게 잡아 두면 정작 봐야 할
          판정과 스케줄이 화면 밖으로 밀린다(세로 754px 화면에서 머리만 285px 를
          쓰고 있었다). 한 줄로 눕히고, 사용법 단추는 제목 오른쪽 빈자리에 둬서
          높이를 따로 먹지 않게 한다.

          설명 문장은 지우지 않는다 - 처음 여는 사람에게 이 도구가 무엇을 답해 주는지
          말해 주는 유일한 자리다. 대신 작게 줄이고, 좁은 화면에서는 제목 아래로
          자연스럽게 접히게 둔다.
        */}
        <header className="bg-mas-orange text-white">
          {/* 좁은 화면에서는 단추를 제목 아래로 내린다. 가로로 붙여 두면 글자 칸이
              눌려 제목이 여덟 줄로 쪼개진다(412px 에서 실제로 그랬다). */}
          {/* 위아래를 넉넉히 둔다. 18px 로 붙여 두면 글자 세 줄이 띠에 꽉 차서
              답답하다는 말을 들었다 - 넓은 화면에서 130px 안팎이 되도록 잡았다. */}
          <div className="max-w-[1200px] mx-auto px-6 py-[26px] md:py-[30px]
                          flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-medium tracking-wider opacity-85 leading-none mb-1.5">
                [사내한] 퇴직급여 상담 도구
              </div>
              <h1 className="text-[21px] md:text-[27px] font-bold leading-[1.2] tracking-[-0.5px]">
                {DOC_TITLE}
              </h1>
              {/*
                넓은 화면에서 한 줄로 떨어져야 머리가 두 줄치 높이를 먹지 않는다.

                전에 쓰던 설명은 쓸 수 있는 폭 749px 를 **한 자도 남기지 않고**
                749px 로 채워, 1024px 에서 이미 두 줄로 접혔다. 지금 것은 526px 라
                1500px 에서 한글 25자를 더 붙일 때까지 한 줄로 버틴다. 그 이상
                늘리면 guide 스펙의 '설명은 한 줄' 검사가 먼저 깨진다.

                '세금' 을 넣은 것은 화면에서 가장 큰 숫자가 세액·세후 수령액인데
                설명이 인출 한도까지만 말하고 있었기 때문이다.
              */}
              <p className="mt-1.5 text-[12px] md:text-[13px] leading-snug opacity-90 max-w-[860px]">
                나이 · 퇴직제도 · 연금계좌 가입일로 <strong className="font-bold">받을 계좌를
                판정</strong>하고, 연차별 인출 한도와 세금을 계산합니다.
              </p>
            </div>

            {/*
              내보내기와 사용법을 머리 한 줄에 모은다.

              엑셀은 왼쪽 저장 카드, CSV 는 인출 스케줄 탭 안에 있었는데 그러면
              **한 번에 볼 수가 없다** - 실제로 "CSV 기능은 없는 것 같다" 는 보고를
              받았다. 머리는 어느 탭에서나 보이는 유일한 자리다.

              자료가 아직 없으면 꺼 둔다. 눌러서 빈 파일을 받는 것보다 낫고,
              무엇을 먼저 해야 하는지도 그 자체로 말해 준다.
            */}
            <div className="flex flex-wrap items-center gap-2 md:shrink-0">
              <button type="button" onClick={doXlsx} disabled={!sim}
                title="요약 · 계좌 비교 · 계좌별 인출 스케줄을 한 파일로. 인출표는 수식이라 엑셀에서 금액이나 수익률을 바꾸면 다시 계산됩니다."
                className={'h-[34px] px-3 text-[13px] font-medium rounded-xs transition ' +
                  (sim ? 'bg-white/15 text-white border border-white/55 hover:bg-white/25'
                    : 'bg-white/5 text-white/45 border border-white/20 cursor-not-allowed')}>
                엑셀 내보내기
              </button>
              <button type="button" onClick={doCsv} disabled={!sim}
                title="지금 보고 있는 인출 스케줄 표 한 장만 값으로 내보냅니다 (사내 시스템 업로드 등)."
                className={'h-[34px] px-3 text-[13px] font-medium rounded-xs transition ' +
                  (sim ? 'bg-white/15 text-white border border-white/55 hover:bg-white/25'
                    : 'bg-white/5 text-white/45 border border-white/20 cursor-not-allowed')}>
                CSV 내보내기
              </button>
              <button type="button" aria-label="사용법" onClick={() => setGuideOpen(true)}
                className="h-[34px] px-3.5 text-[13px] font-medium bg-white text-mas-active
                           rounded-xs hover:bg-mas-soft transition">
                사용법 보기
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">

            {/* ---------- 입력 (데스크탑에서는 스크롤에 따라붙는다) ---------- */}
            <div className="lg:sticky lg:top-5 lg:max-h-[calc(100vh_-_2.5rem)] lg:overflow-y-auto lg:pr-3 lg:-mr-3">

              {/* ---------- 저장 ---------- */}
              <div className="border border-hair rounded-sm bg-white p-3 mb-7">
                <label className="block mb-2">
                  <span className="block text-[12px] font-medium text-ink-body mb-1">
                    상담 메모 <span className="text-ink-soft font-normal">(선택 · 저장·내보내기에 함께 담깁니다)</span>
                  </span>
                  <textarea rows={2} maxLength={MEMO_MAX} value={memo} aria-label="상담 메모"
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="고객 요청사항, 다음 상담 시 확인할 점 등"
                    className="w-full px-3 py-2 border border-hair rounded-xs bg-white text-[13px] text-ink leading-snug
                               resize-y focus:outline-none focus:border-mas-orange focus:ring-2 focus:ring-mas-orange/25 transition" />
                  <span className="flex items-center justify-between mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={memoOnPrint} aria-label="상담 메모 인쇄물 포함" className="w-3.5 h-3.5 accent-[#F58220]"
                        onChange={(e) => setMemoOnPrint(e.target.checked)} />
                      <span className="text-[12px] text-ink-body">고객용 인쇄물에 포함</span>
                    </label>
                    {memo.length > 0 && (
                      <span className="text-[11px] text-ink-soft num">{memo.length} / {MEMO_MAX}</span>
                    )}
                  </span>
                </label>

                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={doSaveCase}
                    className="flex-1 h-[38px] text-[14px] font-medium bg-mas-orange text-white rounded-xs hover:bg-mas-active transition">
                    상담 저장
                  </button>
                  <button type="button" onClick={doExport}
                    className="flex-1 h-[38px] text-[14px] font-medium bg-white text-ink-body border border-hair rounded-xs hover:bg-surf-subtle transition">
                    파일로 내보내기
                  </button>
                  <button type="button" onClick={() => fileRef.current && fileRef.current.click()}
                    className="flex-1 h-[38px] text-[14px] font-medium bg-white text-ink-body border border-hair rounded-xs hover:bg-surf-subtle transition">
                    가져오기
                  </button>
                  <input ref={fileRef} type="file" accept="application/json,.json" aria-label="상담 케이스 가져오기" className="hidden"
                    onChange={(e) => { doImport(e.target.files && e.target.files[0]); e.target.value = ''; }} />
                </div>

                {/*
                  엑셀·CSV 단추는 머리에 있다. 여기에 한 벌 더 두면 접근성 이름이
                  겹쳐 사람도 검사도 어느 것을 누르는지 구분할 수 없고, 둘 중 하나만
                  고쳐 놓는 일이 생긴다. 무엇이 담기는지는 여기 한 줄로만 적어 둔다.
                */}
                <p className="mb-2 text-[11px] text-ink-soft leading-snug">
                  맨 위 <strong className="text-ink-body">엑셀 내보내기</strong>는 요약 · 계좌 비교 ·
                  계좌별 인출 스케줄을 한 파일로 담고, 인출표가 <strong className="text-ink-body">수식</strong>이라
                  엑셀에서 금액이나 수익률을 바꾸면 다시 계산됩니다.
                  <strong className="text-ink-body"> CSV 내보내기</strong>는 인출 스케줄 표 한 장만
                  값으로 내보냅니다.
                </p>

                {cases.length > 0 && (
                  <div className="border-t border-hair-soft pt-2">
                    <div className="text-[12px] font-medium text-ink-soft mb-1.5">저장된 상담 {cases.length}건</div>
                    <div className="max-h-[190px] overflow-y-auto space-y-1">
                      {cases.map((c) => {
                        const note = c.memo || (c.data && c.data.memo) || '';
                        const editing = editingId === c.id;
                        return (
                          <div key={c.id} className="border-b border-hair-soft last:border-b-0 pb-1">
                            <div className="flex items-center gap-1 text-[13px]">
                              <button type="button" onClick={() => doLoadCase(c.id)}
                                className="flex-1 text-left px-2 py-1 rounded-xs hover:bg-surf-subtle transition truncate"
                                title={'불러오기 · ' + new Date(c.savedAt).toLocaleString('ko-KR')}>
                                {c.name}
                                <span className="text-[11px] text-ink-soft ml-1.5">
                                  {new Date(c.savedAt).toLocaleDateString('ko-KR')}
                                </span>
                              </button>
                              <button type="button"
                                onClick={() => {
                                  if (editing) { setEditingId(null); return; }
                                  setEditingId(c.id); setEditingText(note);
                                }}
                                className={'shrink-0 px-2 py-1 text-[12px] transition ' +
                                  (note ? 'text-mas-active font-medium' : 'text-ink-soft hover:text-ink')}
                                title={note ? '메모 수정' : '메모 추가'}>
                                {editing ? '닫기' : note ? '메모 ✎' : '메모 +'}
                              </button>
                              <button type="button" onClick={() => doDeleteCase(c.id)}
                                className="shrink-0 px-2 py-1 text-[12px] text-ink-soft hover:text-sig-err transition"
                                title="삭제">삭제</button>
                            </div>

                            {editing ? (
                              <div className="px-2 pb-1">
                                <textarea rows={2} maxLength={MEMO_MAX} value={editingText} autoFocus aria-label="저장된 상담 메모 수정"
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full px-2 py-1.5 border border-hair rounded-xs text-[12px] leading-snug resize-y
                                             focus:outline-none focus:border-mas-orange focus:ring-2 focus:ring-mas-orange/25" />
                                <div className="flex gap-2 mt-1">
                                  <button type="button" onClick={() => doSaveMemo(c.id)}
                                    className="h-[28px] px-3 text-[12px] font-medium bg-mas-orange text-white rounded-xs hover:bg-mas-active transition">
                                    메모 저장
                                  </button>
                                  <button type="button" onClick={() => setEditingId(null)}
                                    className="h-[28px] px-3 text-[12px] text-ink-muted border border-hair rounded-xs hover:bg-surf-subtle transition">
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : note ? (
                              <p className="px-2 pb-1 text-[12px] text-ink-muted leading-snug whitespace-pre-wrap break-words">
                                {note}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!storeOk && (
                  <p className="text-[12px] text-sig-err mt-2 leading-snug">
                    이 브라우저에서는 상담 저장이 차단되어 있습니다. '파일로 내보내기'를 사용하세요.
                  </p>
                )}
                {notice && (
                  <p className={'text-[12px] mt-2 leading-snug ' + (notice.tone === 'err' ? 'text-sig-err' : 'text-sig-ok')}>
                    {notice.text}
                  </p>
                )}
              </div>

              <Section title="1 · 고객 및 퇴직 정보">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="고객명 (선택)">
                      <input className={inputCls} value={custName} maxLength={20} aria-label="고객명"
                        onChange={(e) => setCustName(e.target.value)} placeholder="홍길동" />
                    </Field>
                    <Field label="생년월일" hint="710315 또는 19710315">
                      <input className={inputCls + ' num'} value={birthRaw} inputMode="numeric" maxLength={10} aria-label="생년월일"
                        onChange={(e) => setBirthRaw(e.target.value)} placeholder="710315" />
                    </Field>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 bg-surf-soft rounded-sm flex-wrap">
                    <span className="text-[13px] text-ink-muted">현재 만 나이</span>
                    <span className="num text-[18px] font-bold text-mas-blue">{age !== null ? age : '-'}</span>
                    <span className="text-[13px] text-ink-muted">세</span>
                    {/* 퇴직 시점의 나이가 다르면 함께 보여준다 - 이전 가능 여부는 그쪽으로 판정한다 */}
                    {retireAge !== null && age !== null && retireAge !== age && (
                      <span className="text-[13px] text-ink-muted">
                        · 퇴직 시 만 <strong className="num text-ink-body">{retireAge}</strong>세
                      </span>
                    )}
                    {retireAge !== null && (retireAge >= 55
                      ? <Badge tone="good">퇴직 시 연금수령 개시 가능</Badge>
                      : <Badge tone="warn">퇴직 시 만 55세 미만 - 법정퇴직급여는 IRP 로만</Badge>)}
                  </div>

                  <Field label="퇴직제도"
                    help={<React.Fragment>
                      소득세법상 <strong>연금계좌</strong>는 DC · IRP · 연금저축계좌 · 과학기술인연금 ·
                      중소기업퇴직연금입니다. <strong>DB 와 퇴직금제도는 연금계좌가 아닙니다.</strong>
                      그래서 DB · 퇴직금제도의 퇴직급여 지급은 '연금계좌 간 이체'가 아니라 '퇴직소득의 입금'이라
                      이체 제한(시행령 §40의4)을 받지 않고, DC 만 제한을 받습니다.
                    </React.Fragment>}>
                    <Segmented
                      value={system} onChange={(v) => setSystem(v)}
                      options={[
                        { value: 'DB', label: 'DB' },
                        { value: 'DC', label: 'DC' },
                        { value: 'SEV', label: '퇴직금제도' }
                      ]} />
                  </Field>

                  <Field
                    label={system === 'SEV' ? '입사일' : system + ' 제도 가입일'}
                    warn={systemJoinMissing}
                    hint={systemJoinMissing
                      ? '넣어 주세요. 비워 두면 ' + CUTOFF_LABEL + ' 이후 가입으로 보아 1년차로 계산합니다 - 이전 가입이면 6년차라 한도가 2배입니다.'
                      : system === 'SEV'
                        ? '퇴직금제도·명예퇴직금은 가입일자 개념이 없어 기산연차 특례를 쓸 수 없습니다.'
                        : system === 'DC'
                          ? CUTOFF_LABEL + ' 이후 가입한 DC 는 구 연금계좌로 입금할 수 없습니다.'
                          : 'DB 는 연금계좌가 아니어서 가입일과 무관하게 어느 계좌로든 입금할 수 있습니다.'}
                    help={system === 'SEV'
                      ? '퇴직금제도의 퇴직금과 명예퇴직금은 연금수령한도에 영향을 주는 가입일자라는 개념 자체가 없습니다. 입금받는 계좌의 가입일자만 적용되므로, 신규 계좌로 받으면 1년차 기산입니다.'
                      : system === 'DC'
                        ? CUTOFF_LABEL + ' 이전에 가입한 DC 라면, 신규 IRP 를 개설해 전액 이체할 때 DC 가입일자를 승계해 6년차 기산을 쓸 수 있습니다. 반대로 ' + CUTOFF_LABEL + ' 이후 가입한 DC 는 구 연금계좌로 입금할 수 없고, 이때는 1사 1IRP 예외사유라 IRP 를 추가 개설하면 됩니다.'
                        : CUTOFF_LABEL + ' 이전에 가입한 DB 라면, 퇴직급여 전액을 신규 개설 연금계좌에 입금할 때 가입일자는 그대로여도 연금수령 기산연차를 6년차로 시작할 수 있습니다(시행령 §40의2④1).'}>
                    <DateInput value={systemJoinStr} onChange={setSystemJoinStr} label="제도 가입일" />
                  </Field>

                  <Field label="퇴직(예정)일"
                    hint={!birth ? '생년월일을 먼저 입력해 주세요.'
                      : isPastRetire
                        ? depositYear + '년 퇴직 · 퇴직 시 만 ' + (retireAge !== null ? retireAge : '-') + '세 · ' +
                          '인출은 ' + startYear + '년부터 계산합니다'
                        : '퇴직 시 만 ' + (retireAge !== null ? retireAge : '-') + '세 · 인출은 ' + startYear + '년부터 계산합니다'}
                    help={<React.Fragment>
                      퇴직급여가 연금계좌에 <strong>들어온 해</strong>가 연금수령연차의 기산연도를 좌우하므로
                      따로 받습니다. <strong>이미 퇴직한 경우</strong>에도 그 해를 넣으면 그때부터 오늘까지
                      쌓인 연차가 반영됩니다. 예를 들어 만 55세를 넘긴 뒤 2년 전에 퇴직해 신규 계좌로 받았다면
                      지금은 1년차가 아니라 3년차이고, 그만큼 한도가 큽니다.<br /><br />
                      만 55세 미만 여부(IRP 의무이전)도 <strong>퇴직 시점의 나이</strong>로 판정합니다.
                      인출 시뮬레이션은 과거로 되돌릴 수 없으므로 올해(또는 만 55세가 되는 해)부터 계산하고,
                      이미 받은 연금이 있다면 '과거 연금 수령 횟수'에 넣어 주세요.
                    </React.Fragment>}>
                    <DateInput value={retireDateStr} onChange={setRetireDateStr} label="퇴직일" allowFuture />
                  </Field>

                  {system === 'DC' && (
                    <div className="border border-hair rounded-sm bg-surf-soft p-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={dbConverted} aria-label="DB 에서 DC 로 전환"
                          onChange={(e) => setDbConverted(e.target.checked)}
                          className="w-4 h-4 accent-[#F58220]" />
                        <span className="text-[13px] font-medium text-ink-body">DB 에서 DC 로 전환</span>
                        <Help title="DB → DC 전환">
                          임금피크제 등으로 DB 에서 DC 로 전환하면 DC 가입일은 전환 시점이 됩니다.
                          다만 전환 전 DB 가입일이 {CUTOFF_LABEL} 이전이고 퇴직급여 전액을
                          <strong> 신규 IRP 로 이체</strong>한다면, DB 가입일 정보를 반영해
                          <strong> 6년차 기산 특례</strong>를 적용합니다.
                          (2021.9월 이후 전환분부터 DB 가입일 정보가 기록됩니다.)
                        </Help>
                      </label>
                      {dbConverted && (
                        <div className="mt-3">
                          <Field label="전환 전 DB 가입일"
                            warn={!dbJoin}
                            hint={!dbJoin
                              ? '넣어 주세요. 비우면 전환 전 DB 를 반영하지 못해 ' + system + ' 가입일로만 봅니다'
                              : isLegacyDate(dbJoin)
                                ? CUTOFF_LABEL + ' 이전 가입 - 신규 계좌 전액 이체 시 6년차 기산'
                                : CUTOFF_LABEL + ' 이후 가입 - 기산연차 특례 대상 아님'}>
                            <DateInput value={dbJoinStr} onChange={setDbJoinStr} label="전환 전 DB 가입일" />
                          </Field>
                        </div>
                      )}
                    </div>
                  )}

                  {/*
                    법정외 퇴직금은 어느 제도에서나 받을 수 있다.

                    예전에는 퇴직금제도에서만 법정/법정외를 갈라 받고 DB·DC 는 한 칸으로만
                    받았다. 그래서 DB·DC 가입자의 명퇴금을 넣을 자리가 없었고, 넣으면 전액을
                    규약상 퇴직급여로 보아 판정했다. DC 에서는 이것이 곧 오답이다 - 규약상
                    퇴직급여는 연금저축계좌로 못 가지만, 규약에 규정되지 않은 명퇴금은
                    연령·제도에 관계없이 갈 수 있기 때문이다(Q12 첫 문단).
                  */}
                  <div className="space-y-3">
                    {system === 'SEV' ? (
                      <Field label="법정퇴직금">
                        <MoneyInput value={amtLegal} onChange={setAmtLegal} label="법정퇴직금" />
                      </Field>
                    ) : (
                      <Field label={'퇴직급여 (' + system + ' 규약상)'}
                        hint="규약에 규정된 퇴직급여입니다. 분할 입금 없이 단일 계좌로 이전합니다."
                        helpTitle="규약상 퇴직급여"
                        help={<React.Fragment>
                          {system} 규약에 규정된 퇴직급여입니다. 규약에 법정외 퇴직금이 포함되어 있다면
                          <strong> 그 금액도 여기에</strong> 넣으세요 - 법정퇴직금과 같은 제한을 받습니다{qref(' (Q12)')}.
                          규약에 없는 명퇴금·위로금만 아래 칸에 넣습니다.
                        </React.Fragment>}>
                        <MoneyInput value={amtSingle} onChange={setAmtSingle} label="퇴직급여" />
                      </Field>
                    )}
                    <Field label="명예(법정외) 퇴직금"
                      hint={system === 'SEV'
                        ? '근퇴법상 퇴직급여가 아니므로 만 55세 미만이어도 연금저축계좌 입금이 가능합니다.'
                        : system + ' 규약에 규정되지 않은 명퇴금·위로금. 없으면 비워 두세요.'}
                      help={<React.Fragment>
                        명퇴금 · 위로금 등 <strong>DB/DC 규약에 규정되지 않은</strong> 퇴직금은 제도와 연령에
                        관계없이 연금저축계좌로 입금할 수 있습니다. 회사가 직접 지급하는 돈이라
                        연금계좌 간 이체 제한을 받지 않기 때문입니다.<br /><br />
                        반대로 법정외 퇴직금이라도 <strong>DB/DC 규약에 포함되어 있다면</strong> 법정퇴직금과
                        같은 제한을 받으므로 위 칸에 넣어야 합니다. 규약 포함 여부를 먼저 확인하세요.
                      </React.Fragment>}>
                      <MoneyInput value={amtHonor} onChange={setAmtHonor} label="명예퇴직금" />
                    </Field>
                  </div>

                  {/*
                    이연 퇴직소득세.

                    원천징수영수증을 들고 온 고객은 그 값이 맞다. 퇴직 전 상담에는
                    영수증이 없어 이 칸이 비고, 그러면 세액 비교와 인출 세액이 통째로
                    나오지 않는다. 그래서 '직접 계산' 을 곁들이되 기본은 꺼 둔다 -
                    계산값이 영수증 값을 덮으면 안 된다.
                  */}
                  {/*
                    이 체크는 눈에 띄어야 한다.

                    퇴직 **전** 상담에서는 영수증이 없어 이연 퇴직소득세 칸이 비고,
                    그러면 세액 비교와 인출 세액이 통째로 나오지 않는다. 그런데도
                    회색 상자 안의 작은 체크로 두었더니 있는 줄 모르고 지나쳤다.
                    브랜드 색으로 테두리와 글자를 세우고, 꺼져 있을 때는 '켜면 무엇이
                    되는지' 를 한 줄로 붙인다. 켜면 색을 채워 지금 계산 중임을 알린다.
                  */}
                  <div className={'border rounded-sm p-3 space-y-3 transition ' +
                    (taxCalc ? 'border-mas-orange bg-[#FFF3E8]' : 'border-mas-soft bg-[#FFF9F4]')}>
                    <label className="flex items-center gap-2 cursor-pointer screen-only">
                      <input type="checkbox" checked={taxCalc} aria-label="이연 퇴직소득세 직접 계산"
                        onChange={(e) => setTaxCalc(e.target.checked)}
                        className="w-[17px] h-[17px] accent-[#F58220]" />
                      <span className="text-[14px] font-bold text-mas-active">
                        이연 퇴직소득세를 직접 계산
                      </span>
                      <Help title="이연 퇴직소득세 직접 계산">
                        원천징수영수증이 아직 없는 <strong>퇴직 전 상담</strong>에서 씁니다.
                        입사일·퇴직일·퇴직급여액으로 퇴직소득세를 산출합니다(소득세법 §48·§55).
                        퇴직소득세는 <strong>법정퇴직금과 명예퇴직금을 합해 한 번</strong> 계산하고
                        (§22), 계좌가 여럿이면 배정액 비율로 안분합니다(시행령 §202의2).<br /><br />
                        <strong>2023.1.1 이후 퇴직분</strong> 기준이며, 임원 퇴직소득 한도(§22③)는
                        반영하지 않습니다. 최종값은 원천징수영수증으로 확인하세요.
                      </Help>
                    </label>

                    {!taxCalc && (
                      <p className="text-[12px] text-mas-active leading-snug screen-only -mt-1"
                        role="note" aria-label="직접 계산 안내">
                        퇴직 <strong>전</strong> 상담이라 원천징수영수증이 없으면 켜세요.
                        입사일 · 퇴직일 · 퇴직급여액으로 산출합니다. 영수증이 있으면 켜지 말고
                        아래 칸에 그 값을 넣으세요.
                      </p>
                    )}

                    {taxCalc && (
                      <React.Fragment>
                        {system !== 'SEV' && (
                          <Field label="입사일"
                            warn={!hireDate}
                            hint={!hireDate
                              ? '넣어 주세요. 근속연수는 제도 가입일이 아니라 입사일로 셉니다'
                              : '근속연수 기산일. ' + system + ' 제도 가입일과 다를 수 있습니다'}>
                            <DateInput value={hireDateStr} onChange={setHireDateStr} label="입사일" />
                          </Field>
                        )}
                        <Field label="비과세 퇴직급여" hint="없으면 0. 퇴직소득금액에서 뺍니다">
                          <MoneyInput value={taxExempt} onChange={setTaxExempt} label="비과세 퇴직급여" />
                        </Field>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={hasMid} aria-label="중간정산 받음"
                            onChange={(e) => setHasMid(e.target.checked)}
                            className="w-4 h-4 accent-[#F58220]" />
                          <span className="text-[13px] font-medium text-ink-body">중간정산을 받았음</span>
                          <Help title="중간정산">
                            중간정산을 받으면 근속연수를 <strong>정산일 다음 날부터</strong> 셉니다.
                            다만 퇴직자가 회사에 신고하면 중간정산분과 최종분을 <strong>합산</strong>해
                            입사일부터 통산한 뒤 이미 낸 세금을 빼 주는 <strong>정산특례</strong>가
                            있습니다(소득세법 §148). 대개 정산특례가 유리하지만 합산으로 과세표준
                            구간이 올라가면 뒤집히므로, <strong>둘 다 계산해</strong> 보여 드립니다.
                          </Help>
                        </label>

                        {hasMid && (
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="중간정산일" warn={!midDate}
                              hint={!midDate ? '넣어 주세요' : null}>
                              <DateInput value={midDateStr} onChange={setMidDateStr} label="중간정산일" />
                            </Field>
                            <Field label="중간정산 퇴직급여" warn={!(midAmount > 0)}
                              hint={!(midAmount > 0) ? '넣어 주세요' : null}>
                              <MoneyInput value={midAmount} onChange={setMidAmount} label="중간정산 퇴직급여" />
                            </Field>
                            <Field label="중간정산 때 낸 퇴직소득세" className="col-span-2"
                              hint="국세 기준. 정산특례의 기납부세액으로 뺍니다">
                              <MoneyInput value={midPaidTax} onChange={setMidPaidTax}
                                label="중간정산 때 낸 퇴직소득세" />
                            </Field>
                          </div>
                        )}
                      </React.Fragment>
                    )}

                    <Field label={taxCalc ? '이연 퇴직소득세 (지방소득세 포함)' : '이연 퇴직소득세'}
                      hint={taxCalc
                        ? (taxResult
                          ? '위 입력으로 계산한 국세 + 지방소득세 합계입니다'
                          : '아직 계산하지 못했습니다')
                        : '원천징수영수증 기준(국세). 시뮬레이션에는 지방소득세 10% 를 더해 씁니다.'}
                      warn={taxCalc && !taxResult}
                      help={<React.Fragment>
                        퇴직급여를 연금계좌로 받으면 퇴직소득세를 떼지 않고 <strong>징수를 미뤄</strong> 둡니다.
                        나중에 연금으로 나눠 받을 때 이 세금의 일부만 내는데, 실제 연금수령 횟수에 따라
                        1~10회차 <strong>30% 감면</strong>, 11~20회차 <strong>40%</strong>,
                        21회차부터 <strong>50%</strong>가 감면됩니다.
                        (20년 초과 구간은 2025년 세법개정 신설분으로 2026.1.1 이후 연금수령분부터 적용)
                        <br /><br />
                        원천징수영수증의 '이연퇴직소득세' 는 <strong>국세 기준</strong>입니다.
                        여기에 <strong>지방소득세 10%</strong>가 따로 붙으므로(지방세법 §103의3),
                        인출 스케줄과 계좌 비교에는 <strong>둘을 합한 금액</strong>을 씁니다.
                        같은 칸에 더해지는 연금소득세(5.5·4.4·3.3%)와 기타소득세(16.5%)가 이미
                        지방소득세를 품은 세율이기 때문입니다.
                      </React.Fragment>}>
                      {taxCalc ? (
                        <div className={inputCls + ' num flex items-center justify-end bg-surf-subtle ' +
                          (taxResult ? 'text-ink font-bold' : 'text-ink-soft')}
                          role="note" aria-label="계산된 이연 퇴직소득세"
                          title={taxResult
                            ? '국세 ' + taxResult.chosen.tax.toLocaleString('ko-KR') + '원 + 지방소득세 ' +
                              taxResult.chosen.local.toLocaleString('ko-KR') + '원'
                            : ''}>
                          {taxResult ? krw(taxResult.chosen.total) : '계산 대기'}
                        </div>
                      ) : (
                        <MoneyInput value={deferredTax} onChange={setDeferredTax} label="이연 퇴직소득세" />
                      )}
                    </Field>

                    {taxCalc && taxBlockers.length > 0 && (
                      <p className="text-[12px] text-sig-err font-medium leading-snug"
                        role="note" aria-label="퇴직소득세 계산 미완">
                        계산에 필요한 값이 없습니다 — {taxBlockers.join(' · ')}
                      </p>
                    )}

                    {taxCalc && taxResult && <RetireTaxBreakdown r={taxResult} />}
                  </div>
                </div>
              </Section>

              <Section title="2 · 기존 보유 연금계좌"
                right={
                  <div className="flex gap-1.5 screen-only">
                    <button type="button" aria-label="연금저축 추가"
                      onClick={() => addAccount('pension')}
                      className="h-[30px] px-2.5 text-[12px] font-medium bg-white text-mas-active
                                 border border-mas-orange rounded-xs hover:bg-mas-soft transition">
                      + 연금저축
                    </button>
                    <button type="button" aria-label="IRP 추가"
                      onClick={() => addAccount('irp')}
                      className="h-[30px] px-2.5 text-[12px] font-medium bg-white text-mas-active
                                 border border-mas-orange rounded-xs hover:bg-mas-soft transition">
                      + IRP
                    </button>
                  </div>
                }>
                <div className="space-y-5">
                  <p className="text-[12px] text-ink-soft leading-snug">
                    보유한 계좌를 <strong className="text-ink-body">하나씩 모두</strong> 넣어 주세요.
                    연금저축은 한 금융기관에 여러 개를 둘 수 있고, IRP 도 금융기관마다 하나씩 가질 수 있습니다.
                    <Help title="계좌를 모두 넣어야 하는 이유">
                      연금수령연차는 <strong>계좌마다 따로</strong> 산정됩니다. 같은 사람이라도
                      2008년에 만든 연금저축은 6년차 기산, 2020년에 만든 IRP 는 1년차 기산이라
                      한도가 몇 배씩 차이 납니다. 어느 계좌로 받느냐가 곧 판정이므로,
                      계좌가 빠지면 더 유리한 선택지를 놓칩니다.<br /><br />
                      IRP 는 1사 1계좌가 원칙이지만 금융기관마다 하나씩 가질 수 있고,
                      이미 보유한 IRP 가 연금개시되었거나 {CUTOFF_LABEL} 이전 가입 IRP 에
                      {CUTOFF_LABEL} 이후 가입 DC 를 넣어야 하는 경우에는 같은 기관에서도 추가 개설이 됩니다.
                    </Help>
                  </p>

                  {!accountList.length && (
                    <div className="border border-dashed border-hair rounded-sm bg-surf-soft px-4 py-5 text-center">
                      <p className="text-[13px] text-ink-soft leading-relaxed">
                        보유한 연금저축·IRP 가 없으면 비워 두세요.<br />
                        있으면 위의 <strong className="text-ink-body">+ 연금저축</strong> /
                        <strong className="text-ink-body"> + IRP</strong> 로 하나씩 추가합니다.
                      </p>
                    </div>
                  )}

                  {accountList.map((a) => {
                    const jd = parseDate(a.joinStr);
                    const nm = accountNames[a.id];   // 화면 표시용 (기관명 포함)
                    const key = accountKeys[a.id];   // 라벨용 (기관명 제외, 안정적)
                    return (
                      <div key={a.id} className="border border-hair rounded-sm bg-white p-4">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="text-[15px] font-bold text-ink">{nm}</span>
                          {isLegacyDate(jd) ? <Badge tone="brand">{CUTOFF_LABEL} 이전 가입</Badge> : null}
                          <button type="button" aria-label={key + ' 삭제'}
                            onClick={() => removeAccount(a.id)}
                            className="ml-auto h-[26px] px-2 text-[12px] text-ink-soft border border-hair
                                       rounded-xs hover:text-sig-err hover:border-sig-err transition">
                            삭제
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Field label="금융기관 (선택)">
                            <input className={inputCls} value={a.name} maxLength={12}
                              aria-label={key + ' 금융기관'} placeholder="미래에셋"
                              onChange={(e) => patchAccount(a.id, { name: e.target.value })} />
                          </Field>
                          <Field label="가입일" helpTitle={key + ' 가입일'}
                            warn={!jd}
                            hint={!jd ? '넣어 주세요. 비우면 1년차로 봅니다' : null}
                            help={<React.Fragment>
                              가입일이 {CUTOFF_LABEL} 이전이면 연금수령연차를 <strong>6년차부터</strong> 기산합니다.
                              {CUTOFF_LABEL} 전에는 연금수령 요건이 '10년 이상 가입하고 5년 이상 수령'이었기 때문에,
                              기존 계약자가 5년만 받아도 연금소득으로 인정해 주려는 경과조치입니다.
                              <strong> 2002년 가입과 2012년 가입은 똑같이 6년차</strong>라 가입일이 빠르다고 유리하지 않습니다.
                            </React.Fragment>}>
                            <DateInput value={a.joinStr} label={key + ' 가입일'}
                              onChange={(v) => patchAccount(a.id, { joinStr: v })} />
                          </Field>
                          <Field label="현재 평가액">
                            <MoneyInput value={a.bal} label={key + ' 평가액'}
                              onChange={(v) => patchAccount(a.id, { bal: v })} />
                          </Field>
                          <Field label="세액공제 받지 않은 금액"
                            hint="평가액 중 과세제외 재원"
                            helpTitle={key + ' 세액공제 받지 않은 금액'}
                            help={<React.Fragment>
                              연말정산에서 세액공제를 받지 않은 납입액입니다. 인출할 때
                              <strong> 가장 먼저 빠져나가고 세금이 전혀 없습니다</strong>(인출순서 1순위).
                              그다음이 퇴직금, 마지막이 세액공제 받은 금액과 운용수익입니다.
                              모르면 0 으로 두세요 - 세금이 과대 계산될 뿐 과소 계산되지 않습니다.
                            </React.Fragment>}>
                            <MoneyInput value={a.exempt} label={key + ' 세액공제 받지 않은 금액'}
                              onChange={(v) => patchAccount(a.id, { exempt: v })} />
                          </Field>
                          {a.kind === 'irp' ? (
                            <Field label="연간 수수료"
                              hint="적립금 대비 연 요율"
                              helpTitle={key + ' 연간 수수료'}
                              help={<React.Fragment>
                                IRP 의 <strong>운용관리수수료 + 자산관리수수료</strong>를 합한 연 요율입니다.
                                계좌마다 다르므로 <strong>계좌별로 따로</strong> 받습니다 - 금융기관마다 요율이
                                다를 뿐 아니라, 같은 기관이라도 개설 채널(대면 · 비대면)과 적립금 구간에 따라
                                달라집니다.<br /><br />
                                <strong>퇴직급여(이연퇴직소득) 재원의 수수료를 면제하는 기관이 많고</strong>,
                                비대면으로 개설한 IRP 는 전액 면제인 경우가 흔합니다. 이 계좌로 받을 퇴직급여에
                                수수료가 붙지 않는다면 <strong>0 으로 두세요</strong>. 실제 요율은 각 기관의
                                수수료율표나 금융감독원 통합연금포털에서 확인합니다.
                              </React.Fragment>}>
                              <div className="relative">
                                <input type="number" min="0" max="3" step="0.01" aria-label={key + ' 연간 수수료'}
                                  className={inputCls + ' num pr-7 text-right'}
                                  value={a.fee}
                                  onChange={(e) => patchAccount(a.id, { fee: Math.max(0, Math.min(3, +e.target.value || 0)) })} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-soft pointer-events-none">%</span>
                              </div>
                            </Field>
                          ) : (
                            <Field label="연간 수수료" hint="연금저축계좌는 계좌 수수료가 없습니다">
                              <div className="h-[42px] flex items-center text-[13px] text-ink-soft">
                                해당 없음
                                <Help title={key + ' 연간 수수료'}>
                                  연금저축계좌에는 <strong>IRP 같은 계좌 수수료(운용관리 · 자산관리)가 없습니다</strong>.
                                  비용은 계좌가 아니라 편입한 상품에 붙습니다 - 연금저축펀드는 집합투자기구의
                                  운용보수 · 판매보수, 연금저축보험은 사업비, 연금저축신탁은 신탁보수입니다.<br /><br />
                                  이 비용들은 계좌에서 따로 떼어 가는 돈이 아니라 <strong>기준가에 이미 반영</strong>되므로,
                                  이 시뮬레이터에서는 위의 <strong>운용수익률</strong>을 보수 차감 후 수익률로 넣으면
                                  그대로 반영됩니다. 그래서 수수료 칸을 따로 두지 않습니다.
                                </Help>
                              </div>
                            </Field>
                          )}
                          <div className="flex flex-col justify-end pb-1 gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={a.started}
                                onChange={(e) => patchAccount(a.id, { started: e.target.checked })}
                                aria-label={key + ' 연금개시됨'} className="w-4 h-4 accent-[#F58220]" />
                              <span className="text-[13px] font-medium text-ink-body">연금개시됨</span>
                              <Help title={key + ' 연금개시됨'}>
                                연금개시를 신청하면 계좌 안의 재원별 금액을 확정해 국세청에 통보하므로
                                <strong> 원칙적으로 추가 입금이 막힙니다</strong>. 다만 당사에서 연금개시한
                                IRP · 연금저축계좌는 <strong>퇴직금에 한해</strong> 입금할 수 있습니다.
                                타사 계좌라면 수관이 필요한데, 연금개시된 계좌로의 계약이전은 제한되어
                                신규 개설 후 가입일자를 승계하는 방식만 가능합니다.
                                이미 보유한 IRP 가 연금개시된 경우는 1사 1IRP 예외사유라 추가 개설이 됩니다.
                              </Help>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={a.merge}
                                onChange={(e) => patchAccount(a.id, { merge: e.target.checked })}
                                aria-label={key + ' 시뮬레이션 합산'} className="w-4 h-4 accent-[#F58220]" />
                              <span className="text-[13px] font-medium text-ink-body">시뮬레이션 합산</span>
                              <Help title={key + ' 시뮬레이션 합산'}>
                                이 계좌의 잔고를 퇴직급여와 <strong>합쳐서</strong> 인출 스케줄을 계산합니다.
                                체크하지 않으면 퇴직급여만 가지고 계산합니다.<br /><br />
                                연금수령한도는 실제로는 계좌마다 따로 산정되므로, 연차가 다른 계좌를
                                합치면 한도가 한쪽 기준으로 계산되어 부정확해집니다. 그런 경우에는
                                결과 화면에 <strong>합산 주의</strong> 경고가 뜹니다.
                              </Help>
                            </label>
                          </div>
                        </div>
                        {a.exempt > a.bal && (
                          <p className="text-[12px] text-sig-err mt-2 leading-snug">
                            세액공제 받지 않은 금액이 평가액보다 큽니다. 평가액까지만 반영합니다.
                          </p>
                        )}
                      </div>
                    );
                  })}

                  <Field label="과거 연금 수령 횟수"
                    hint="감면율은 '실제' 연금수령 누적 횟수 기준입니다 (10회 이하 30% · 11~20회 40% · 21회부터 50%)."
                    help={<React.Fragment>
                      <strong>연금수령연차와는 다른 값</strong>입니다. 연금수령연차는 개시 요건을 갖춘 해부터
                      돈을 찾지 않아도 해마다 자동으로 쌓이지만, 퇴직소득세 감면율은 실제로 연금을 받은
                      <strong> 횟수</strong>를 셉니다. 한 번도 받은 적이 없으면 0 입니다.
                    </React.Fragment>}>
                    <input type="number" min="0" max="30" aria-label="과거 연금 수령 횟수" className={inputCls + ' num'} value={pastCount}
                      onChange={(e) => setPastCount(Math.max(0, Math.min(30, +e.target.value || 0)))} />
                  </Field>
                </div>
              </Section>

              <Section title="3 · 시뮬레이션 옵션">
                <div className="space-y-4">
                  {/*
                    자산 합산 범위.

                    예전에는 여기 '퇴직금 단독 / 기존 연금저축 합산 / 기존 IRP 합산 /
                    전체 전액 합산' 4지선다가 있었다. 계좌를 개수 제한 없이 받게 되면서
                    그 구조가 성립하지 않는다 - 연금저축이 셋이면 '기존 연금저축 합산' 이
                    어느 것인지 말할 수 없다. 그래서 계좌 카드마다 체크로 옮겼다.

                    그런데 **개념 자체가 화면에서 사라졌다.** 카드를 훑지 않으면 합산할 수
                    있다는 것을 모르고, '전체 합산' 도 계좌 수만큼 눌러야 했다.
                    여기서는 고르지 않고 **지금 상태를 보여 주고 한 번에 바꾸기만** 한다.
                    개별 조정은 계좌 카드에서 그대로 한다.
                  */}
                  <Field label="자산 합산 범위"
                    help={<React.Fragment>
                      퇴직급여만 가지고 시뮬레이션할지, <strong>기존 계좌의 잔고까지 합쳐서</strong>
                      볼지입니다. 합치면 인출 한도와 세액을 그 자산 전체로 계산합니다.<br /><br />
                      <strong>합산은 돈을 옮긴다는 뜻이 아닙니다.</strong> 각 계좌는 제자리에 남아
                      제 수수료를 물고, 요율은 금액으로 가중평균합니다.<br /><br />
                      <strong>연금수령한도는 실제로는 계좌별로 따로 산정됩니다.</strong> 그래서
                      연차가 같은 계좌끼리 합산할 때만 정확하고, 연차가 다른 계좌를 섞으면
                      화면에 주의를 띄웁니다.<br /><br />
                      계좌를 하나씩 켜고 끄는 것은 <strong>2 · 기존 보유 연금계좌</strong>의
                      각 카드에 있는 '시뮬레이션 합산' 에서 합니다.
                    </React.Fragment>}>
                    <div className="space-y-2">
                      <div className={'px-3 py-2 rounded-sm text-[13px] leading-snug ' +
                        (merged.length > 0 ? 'bg-mas-soft text-ink-body' : 'bg-surf-subtle text-ink-muted')}
                        role="note" aria-label="자산 합산 범위 현황">
                        {mergeable.length === 0
                          ? '보유 계좌가 없어 퇴직급여 단독으로 계산합니다'
                          : merged.length === 0
                            ? '퇴직급여 단독 · 합산한 계좌 없음'
                            : merged.map((a) => accountNames[a.id]).join(' · ') + ' 합산 중 · 기존 잔고 ' +
                              krw(exemptPrincipal + otherPrincipal)}
                      </div>
                      {mergeable.length > 0 && (
                        <div className="flex gap-2 screen-only">
                          <button type="button" aria-label="전체 합산"
                            onClick={() => setMergeAll(true)}
                            disabled={merged.length === mergeable.length}
                            className={'flex-1 h-[34px] text-[13px] font-medium border rounded-xs transition ' +
                              (merged.length === mergeable.length
                                ? 'bg-surf-subtle text-mas-gray border-hair cursor-not-allowed'
                                : 'bg-white text-mas-active border-mas-orange hover:bg-mas-soft')}>
                            전체 합산
                          </button>
                          <button type="button" aria-label="합산 해제"
                            onClick={() => setMergeAll(false)}
                            disabled={merged.length === 0}
                            className={'flex-1 h-[34px] text-[13px] font-medium border rounded-xs transition ' +
                              (merged.length === 0
                                ? 'bg-surf-subtle text-mas-gray border-hair cursor-not-allowed'
                                : 'bg-white text-ink-body border-hair hover:bg-surf-subtle')}>
                            합산 해제
                          </button>
                        </div>
                      )}
                      <p className="text-[11px] text-ink-soft leading-snug screen-only">
                        계좌를 하나씩 고르려면 <strong>2 · 기존 보유 연금계좌</strong>의 각 카드에서
                        '시뮬레이션 합산' 을 켜고 끕니다.
                      </p>
                    </div>
                  </Field>

                  <Field label="인출 방식">
                    <Segmented
                      value={mode} onChange={setMode}
                      options={[
                        { value: 'even', label: '기간 균등 분할' },
                        { value: 'max', label: '세법 한도 내 최대' }
                      ]} />
                  </Field>

                  <Field label={'수령 기간 - ' + years + '년'}>
                    <div className="pt-2">
                      <input type="range" min="5" max="30" step="1" value={years} aria-label="수령 기간" className="w-full"
                        onChange={(e) => setYears(+e.target.value)} />
                      <div className="flex justify-between text-[11px] text-ink-soft mt-1 num">
                        <span>5년</span><span>30년</span>
                      </div>
                    </div>
                    {picked && (
                      <div className="mt-2">
                        {shortSpan
                          ? <Badge tone="warn">이 계좌의 최소 권장 수령 기간은 {picked.minYears}년입니다</Badge>
                          : <Badge tone="good">최소 권장 {picked.minYears}년 충족</Badge>}
                      </div>
                    )}
                  </Field>

                  <Field label={'운용수익률 - 연 ' + rate.toFixed(1) + '%'}>
                    <div className="pt-2">
                      <input type="range" min="0" max="8" step="0.5" value={rate} aria-label="운용수익률" className="w-full"
                        onChange={(e) => setRate(+e.target.value)} />
                    </div>
                  </Field>

                  {/*
                    계좌 수수료는 IRP 에만 있다. 연금저축계좌는 계좌 단위 수수료가 없어
                    입력칸을 두지 않는다 - 빈칸을 두면 '적어야 하는데 모르는 값' 처럼 보인다.
                    기존 계좌 수수료는 계좌마다 다르므로 각 계좌 카드에서 받는다.
                  */}
                  <Field label="신규 IRP 의 수수료"
                    hint="미래에셋증권 공시 요율로 자동 계산합니다. 기존 계좌는 각 계좌 카드에서 입력합니다."
                    helpTitle="신규 IRP 수수료"
                    help={<React.Fragment>
                      <strong>미래에셋증권 개인형IRP 공시 요율</strong>(2026.1.12 시행)로 계산합니다.
                      요율은 고정값이 아니라 적립금과 해가 바뀌면 같이 바뀌므로 직접 넣지 않습니다.<br /><br />
                      운용관리 <strong>체차적용</strong> 1억 미만 0.20% · 1~3억 0.18% · 3억 이상 0.15%,
                      자산관리 <strong>0.10%</strong>.
                      여기에 <strong>장기할인</strong>(2~4차년도 10% · 5~10차년도 12% · 11차년도~ 15%)과
                      연금을 1회 이상 받은 뒤의 <strong>연금수령개시 20% 할인</strong>이 붙습니다.<br /><br />
                      <strong>'가입자부담금 20% 할인 / 전자매체 개설 시 면제' 는 넣지 않았습니다.</strong>
                      그 면제는 가입자가 스스로 넣는 돈에 붙는 것이고, 여기서 다루는 재원은
                      퇴직급여(이연퇴직소득)입니다.<br /><br />
                      <strong>연금저축계좌는 계좌 수수료가 없어</strong> 칸이 없습니다. 연금저축의 비용은
                      계좌가 아니라 편입 상품(펀드 보수 · 보험 사업비 · 신탁보수)에 붙고 기준가에 이미
                      반영되므로, 위의 <strong>운용수익률</strong>에 보수 차감 후 수익률을 넣으면 반영됩니다.
                    </React.Fragment>}>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!fees.ourDbDc} aria-label="당사 DB·DC 가입자"
                          onChange={(e) => setFee('ourDbDc', e.target.checked)}
                          className="w-4 h-4 mt-[2px] accent-[#F58220]" />
                        <span className="text-[13px] text-ink-body leading-snug">
                          퇴직연금(DB·DC)이 <strong>미래에셋증권</strong>에 있음
                          <span className="block text-[11px] text-ink-soft">
                            당사 DB·DC 가입자가 당사 개인형IRP 를 계약하면 1년간 운용관리수수료 면제
                          </span>
                        </span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!fees.direct} aria-label="다이렉트 개설 및 직접 운용"
                          onChange={(e) => setFee('direct', e.target.checked)}
                          className="w-4 h-4 mt-[2px] accent-[#F58220]" />
                        <span className="text-[13px] text-ink-body leading-snug">
                          <strong>다이렉트로 개설하고 직접 운용</strong>함
                          <span className="block text-[11px] text-ink-soft">
                            온라인웹·모바일로 계좌관리점을 다이렉트로 선택하고, 전자매체만으로
                            스스로 운용·거래하면 <strong>전액 면제</strong>
                          </span>
                        </span>
                      </label>
                      {newIrpFeeNote && (
                        <p className="text-[12px] text-ink-soft leading-snug pt-1 border-t border-hair-soft"
                          role="note" aria-label="신규 IRP 요율 안내">
                          {newIrpFeeNote}
                        </p>
                      )}
                    </div>
                  </Field>
                </div>
              </Section>

              {/*
                전체 초기화.

                이 단추는 원래 맨 위 '상담 메모·저장' 카드 안에 있었다. 그러니 메모 칸 바로
                아래에 붙어 보여서 '메모를 지우는 단추' 로 읽혔다 - 실제로는 1·2·3 의 입력을
                전부 지우는데도. 지우는 대상(위의 세 묶음) 바로 밑으로 내려서 범위가 눈에
                보이게 한다.

                실수로 상담 내용을 날리지 않도록 두 번 누르게 하는 것은 그대로 둔다.
                다만 한 번만 누르고 끝내면 아무 일도 일어나지 않으므로, 두 번째 단추를
                눈에 띄게 하고 무엇이 지워지는지 묶음 이름으로 적는다.
              */}
              <div className="mt-6 pt-5 border-t border-hair">
                {confirmReset ? (
                  <div className="px-3 py-3 border border-sig-err rounded-sm bg-[#FDF2F2]">
                    <p className="text-[13px] text-ink-body leading-relaxed mb-2.5">
                      <strong className="text-sig-err">1 · 2 · 3 에 입력한 값이 모두 지워집니다.</strong><br />
                      고객 정보 · 퇴직급여 · 보유 계좌 · 시뮬레이션 옵션과 상담 메모가 비워집니다.
                      <strong> 저장된 상담은 남습니다.</strong>
                    </p>
                    <div className="flex gap-2">
                      <button type="button" onClick={doReset} aria-label="초기화 확인"
                        className="flex-1 h-[38px] text-[14px] font-bold bg-sig-err text-white rounded-xs hover:opacity-90 transition">
                        지웁니다
                      </button>
                      <button type="button" onClick={() => setConfirmReset(false)} aria-label="초기화 취소"
                        className="flex-1 h-[38px] text-[14px] text-ink-body border border-hair bg-white rounded-xs hover:bg-surf-subtle transition">
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmReset(true)} aria-label="전체 초기화"
                    className="w-full h-[38px] text-[13px] text-ink-muted border border-hair rounded-xs
                               hover:bg-surf-subtle hover:text-ink transition">
                    1 · 2 · 3 입력 전체 초기화
                  </button>
                )}
              </div>
            </div>

            {/* ---------- 결과 ---------- */}
            <div>
              {/*
                결과는 상담 순서(판정 → 비교 → 인출)대로 탭으로 나눈다.
                인쇄물은 화면과 별개의 PrintSheet 가 상태에서 직접 만들기 때문에
                어느 탭을 보고 있든 항상 전체 내용이 인쇄된다.
              */}
              <div className="rule mb-3" />
              {/* 탭 이름은 절대 줄바꿈하지 않는다. 412px 에서 '인출 스케줄' 이
                  '인출 스케/줄' 로 쪼개졌다 - 좁은 화면에서는 대신 좌우 여백과
                  글자를 한 단계 줄여 세 탭이 한 줄에 들어가게 한다. */}
              <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                <div className="flex border border-hair rounded-xs overflow-hidden bg-white">
                  {TABS.map((t, i) => {
                    const on = tab === t.id;
                    const dim = t.id === 'matrix' ? false
                      : !ready || (t.id === 'compare' && comparison.length < 2) || (t.id === 'schedule' && !sim);
                    return (
                      <button key={t.id} type="button" onClick={() => setTab(t.id)} disabled={dim}
                        aria-label={t.label} aria-pressed={on}
                        className={
                          'h-[44px] px-3 sm:px-5 text-[14px] sm:text-[15px] font-medium ' +
                          'whitespace-nowrap transition ' +
                          (i > 0 ? 'border-l border-hair ' : '') +
                          (dim ? 'bg-surf-subtle text-mas-gray cursor-not-allowed'
                            : on ? 'bg-mas-orange text-white'
                              : 'bg-white text-ink-muted hover:bg-surf-subtle hover:text-ink')
                        }>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => window.print()} disabled={!ready}
                    className={
                      'h-[44px] px-3 sm:px-5 text-[14px] sm:text-[15px] font-medium ' +
                      'whitespace-nowrap rounded-xs transition ' +
                      (ready ? 'bg-mas-orange text-white hover:bg-mas-active' : 'bg-mas-gray text-white cursor-not-allowed')
                    }>
                    A4 1장 인쇄
                  </button>
                  <button type="button" onClick={doPdf} disabled={!ready}
                    className={
                      'h-[44px] px-3 sm:px-5 text-[14px] sm:text-[15px] font-medium ' +
                      'whitespace-nowrap rounded-xs border transition ' +
                      (ready ? 'bg-white text-ink-body border-hair hover:bg-surf-subtle'
                        : 'bg-surf-subtle text-mas-gray border-hair cursor-not-allowed')
                    }>
                    PDF 저장
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-ink-soft mb-5 -mt-2">
                인쇄물에는 보고 있는 탭과 무관하게 판정 · 계좌 비교 · 인출 스케줄이 모두 담깁니다. PDF 는 인쇄 창에서 대상을 'PDF로 저장'으로 고르면 됩니다.
              </p>

              <div style={{ display: tab === 'verdict' ? 'block' : 'none' }}>
              <Section title="판정 결과">

                {!ready ? (
                  <div className="border border-dashed border-hair rounded-sm bg-white px-6 py-12 text-center">
                    <p className="text-[16px] text-ink-muted">생년월일과 퇴직급여액을 입력하면 판정 결과가 표시됩니다.</p>
                  </div>
                ) : (
                  <React.Fragment>
                    {/*
                      비운 가입일을 조용히 '2013.3.1 이후' 로 삼은 채 답만 내놓으면
                      상담자는 그 가정을 볼 길이 없다. 답 위에 먼저 적는다.
                    */}
                    {missingJoins.length > 0 && (
                      <div role="note" aria-label="가입일 미입력 경고"
                        className="border border-[#E8D49A] bg-[#FBF3DF] rounded-sm px-4 py-3 mb-4">
                        <p className="text-[13px] font-bold text-[#8A6A0B] mb-1">
                          가입일을 넣지 않은 곳이 있어 {CUTOFF_LABEL} 이후로 보고 1년차로 계산했습니다
                        </p>
                        <p className="text-[12px] text-[#8A6A0B] leading-relaxed">
                          {missingJoins.join(' · ')} — {CUTOFF_LABEL} 이전이면 6년차 기산이라
                          한도가 2배가 되고 추천 계좌가 바뀔 수 있습니다.
                        </p>
                      </div>
                    )}
                    {best && (
                      <div className="bg-mas-orange text-white rounded-sm px-6 py-5 mb-5">
                        <div className="text-[12px] font-medium tracking-wider opacity-90 mb-1.5">
                          {(allocation.some((a) => a.manual) ? '상담자 선택' : '최적 추천') + (isSplit ? ' - 분할 입금' : '')}
                        </div>
                        <div className="text-[26px] font-bold leading-tight mb-3">
                          {isSplit ? '재원별로 나누어 입금하세요' : best.label}
                        </div>
                        <div className="space-y-2 mb-3">
                          {allocation.map((a, i) => (
                            <div key={i} className="flex items-center gap-2 flex-wrap text-[15px]">
                              <span className="opacity-90 shrink-0">{a.source.label}</span>
                              <span className="num font-bold shrink-0">{krw(a.source.amount)}</span>
                              <span className="opacity-75 shrink-0">→</span>
                              {a.target ? (
                                <select
                                  value={a.target.id}
                                  onChange={(e) => setManualPick((m) => Object.assign({}, m, { [a.source.kind]: e.target.value }))}
                                  className="h-[34px] px-2 pr-7 bg-white text-ink text-[14px] font-bold border border-white rounded-xs
                                             focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer max-w-full">
                                  {a.options.map((o) => (
                                    <option key={o.id} value={o.id}>
                                      {o.label}
                                      {o.perSource.some((p) => p.source.kind === a.source.kind && !p.ok && p.selectable)
                                        ? ' · 조건부' : ''}
                                      {' · ' + o.startLimitYear + '년차' + (o.unlimited ? ' · 한도 없음' : '')}
                                      {o.feeRate > 0 ? ' · 연 ' + (o.feeRate * 100).toFixed(2) + '%' : ' · 수수료 없음'}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="font-bold">입금 가능한 계좌 없음</span>
                              )}
                              {a.manual
                                ? <span className="text-[12px] bg-white text-mas-active font-bold px-1.5 py-[2px] rounded-xs shrink-0">수동 선택</span>
                                : a.target
                                  ? <span className="text-[12px] bg-white/25 px-1.5 py-[1px] rounded-xs shrink-0">
                                      {a.target.startLimitYear}년차{a.target.unlimited ? ' · 한도 없음' : ''}
                                    </span>
                                  : null}
                            </div>
                          ))}
                        </div>

                        {allocation.some((a) => a.manual) && (
                          <button type="button" onClick={() => setManualPick({})}
                            className="mb-3 h-[32px] px-3 text-[13px] font-medium bg-white/20 hover:bg-white/30
                                       border border-white/50 rounded-xs transition">
                            자동 추천으로 되돌리기
                          </button>
                        )}
                        <p className="text-[14px] leading-relaxed opacity-95">
                          {'기산연차 ' + best.seniorityIndex + '년차 (' + best.seniorityBasis + ')'}
                          {best.baseYear < startYear
                            ? ' · ' + best.baseYear + '년에 이미 연금개시 요건을 갖춰 연차가 자동 누적되어 ' +
                              startYear + '년 현재 ' + best.startLimitYear + '년차입니다.'
                            : ' · ' + startYear + '년에 ' + best.startLimitYear + '년차로 시작합니다.'}
                          {best.unlimited
                            ? ' 11년차를 넘겨 연금수령한도가 없으므로 인출액 전액이 연금수령으로 인정됩니다.'
                            : ' 한도 안에서 전액을 빼려면 ' + best.minYears + '년이 걸립니다.'}
                        </p>
                        {allocation.some((a) => a.tiedWith && a.tiedWith.length > 0) && (
                          <div className="mt-3 pt-3 border-t border-white/30 text-[13px] leading-relaxed">
                            <strong className="font-bold">세법상 동점 안내</strong>{' · '}
                            {allocation.filter((a) => a.tiedWith && a.tiedWith.length).map((a) => (
                              <span key={a.source.kind}>
                                {[a.target.label].concat(a.tiedWith.map((t) => t.label)).join(' / ')}
                              </span>
                            ))}
                            {' 은 연금수령연차가 똑같이 ' + best.startLimitYear + '년차라 한도가 같습니다. '}
                            <strong className="font-bold">가입일이 더 빠르다고 유리하지 않습니다.</strong>
                            {' 세법상 우열이 없으므로 수수료 · 투자 가능 상품 · 중도인출 조건을 보고 고르시고, 아래에서 계좌를 눌러 시뮬레이션을 바꿔 볼 수 있습니다.'}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      {candidates.map((c) => {
                        const on = picked && picked.id === c.id;
                        const allocated = c.allocatedAmount > 0;
                        const blocked = !c.perSource.some((p) => p.selectable);
                        return (
                          <div key={c.id}
                            onClick={() => { if (allocated) setPickedId(c.id); }}
                            className={
                              'border rounded-sm bg-white px-4 py-3 transition ' +
                              (!allocated ? 'border-hair opacity-60 cursor-default'
                                : on ? 'border-mas-orange ring-2 ring-mas-orange/20 cursor-pointer'
                                  : 'border-hair hover:bg-surf-subtle cursor-pointer')
                            }>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[16px] font-bold text-ink">{c.label}</span>
                                {allocated ? <Badge tone="brand">배정 {krw(c.allocatedAmount)}</Badge> : null}
                                {blocked ? <Badge tone="bad">입금 불가</Badge> : null}
                                {/* 막힌 계좌의 연차는 '썼다면 이랬다'는 참고값이라 색을 빼 둔다 */}
                                <Badge tone={blocked ? 'neutral' : c.legacy ? 'good' : 'neutral'}>
                                  {blocked ? '해당 시 ' : ''}{c.startLimitYear}년차{c.unlimited ? ' · 한도 없음' : ''}
                                </Badge>
                                {!blocked && c.perSource.some((p) => !p.ok && p.selectable)
                                  ? <Badge tone="warn">조건부 - 확인 필요</Badge> : null}
                              </div>
                              <span className="text-[12px] text-ink-soft whitespace-nowrap">
                                {c.isNew ? '신규' : fmtDate(c.joinDate) + ' 가입'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {c.perSource.map((p, i) => {
                                const state = p.ok ? 'ok' : p.selectable ? 'caution' : 'blocked';
                                return (
                                  <div key={i} className="flex items-start gap-2 text-[13px] leading-snug">
                                    <span className={'font-medium shrink-0 ' +
                                      (state === 'ok' ? 'text-sig-ok' : state === 'caution' ? 'text-[#8A6A0B]' : 'text-sig-err')}>
                                      {state === 'ok' ? '가능' : state === 'caution' ? '조건부' : '불가'}
                                    </span>
                                    <span className="text-ink-muted shrink-0">{p.source.label}</span>
                                    <span className="num text-ink-body shrink-0">{krw(p.source.amount)}</span>
                                    {state === 'blocked' && <span className="text-sig-err">- {p.blockers[0]}</span>}
                                    {state === 'caution' && <span className="text-[#8A6A0B]">- {p.cautions[0]}</span>}
                                  </div>
                                );
                              })}
                              {!c.perSource.length && (
                                <div className="text-[13px] text-ink-soft">퇴직급여액을 입력해 주세요.</div>
                              )}
                            </div>
                            {!blocked && (
                              <div className="text-[12px] text-ink-soft mt-2 leading-snug">
                                기산연차 <strong className="text-ink-body">{c.seniorityIndex}년차</strong>
                                {' (' + c.seniorityBasis + ')'}
                                {c.baseYear < startYear
                                  ? ' · ' + c.baseYear + '년 요건 충족 후 ' + (startYear - c.baseYear) + '년 누적'
                                  : ' · ' + c.baseYear + '년 요건 충족'}
                                {' → '}
                                <strong className="text-ink-body">{startYear}년 {c.startLimitYear}년차</strong>
                                {' · '}
                                {c.unlimited
                                  ? '한도 없음 (전액 연금수령 인정)'
                                  : <React.Fragment>한도 내 전액 인출에 <strong className="text-ink-body">{c.minYears}년</strong></React.Fragment>}
                                {!allocated ? ' · 더 유리하거나 동등한 계좌가 배정되었습니다' : ''}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </React.Fragment>
                )}
              </Section>
              </div>

              <div style={{ display: tab === 'compare' ? 'block' : 'none' }}>
              {ready && comparison.length > 1 && (
                <Section title="계좌별 비교">
                  <p className="text-[13px] text-ink-muted mb-3 leading-relaxed">
                    퇴직급여를 받는 계좌만 바꾸고 나머지 조건({years}년 · 연 {rate.toFixed(1)}% ·
                    {mode === 'max' ? ' 한도 내 최대' : ' 균등 분할'})은 동일하게 둔 결과입니다. 기존 잔고 합산은 제외했습니다.
                  </p>
                  <div className="overflow-x-auto border border-hair rounded-sm bg-white">
                    <table className="w-full text-[13px] num">
                      <thead>
                        <tr className="bg-mas-soft text-ink">
                          {['계좌', '한도 기산', '입금액', '연 수수료', '총 수수료', '총 세액', '세후 수령액'].map((h) => (
                            <th key={h} className="px-2 py-2 font-bold text-[12px] whitespace-nowrap border-b border-hair">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.map((r, i) => {
                          const on = picked && picked.id === r.c.id;
                          return (
                            <tr key={r.c.id} className={'border-b border-hair-soft ' + (on ? 'bg-[#FDEEDF]' : '')}>
                              <td className="px-2 py-2 text-left whitespace-nowrap">
                                <span className={on ? 'font-bold text-mas-active' : 'text-ink'}>{r.c.label}</span>
                                {r.partial ? <span className="text-[11px] text-sig-err ml-1">일부만</span> : null}
                              </td>
                              <td className="px-2 py-2 text-center">
                                <span className={r.c.startLimitYear > 1 ? 'text-sig-ok font-bold' : 'text-ink-muted'}>
                                  {r.c.startLimitYear}년차
                                </span>
                              </td>
                              <td className="px-2 py-2 text-right">{man(r.amount)}</td>
                              <td className="px-2 py-2 text-right text-ink-muted">
                                {r.c.feeRate > 0 ? (r.c.feeRate * 100).toFixed(2) + '%' : '-'}</td>
                              <td className="px-2 py-2 text-right">{r.totalFee > 0 ? man(r.totalFee) : '-'}</td>
                              <td className="px-2 py-2 text-right">{man(r.totalTax)}</td>
                              <td className="px-2 py-2 text-right font-bold text-mas-blue">
                                {man(r.afterTax)}
                                {r.residual > 1 ? <span className="text-[11px] text-sig-err font-normal ml-1">+잔액 {man(r.residual)}</span> : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[12px] text-ink-soft mt-2 leading-relaxed">
                    단위: 만원 · 수수료는 매년 적립금 기준으로 차감 · '일부만'은 그 계좌가 퇴직급여 전액을 받을 수 없는 경우 ·
                    '+잔액'은 수령 기간 내 전액 인출이 안 되어 남는 금액
                    <br />
                    <strong className="text-ink-muted">연차가 높을수록 그해 한도가 커집니다.</strong>{' '}
                    한도는 인출 상한이 아니라 연금수령과 연금외수령을 가르는 기준선입니다. 한도를 넘겨 빼도 되지만
                    넘은 부분은 퇴직소득세 감면 없이(세액공제분·운용수익은 기타소득세 16.5%) 과세됩니다.
                    연차가 11년차에 닿으면 한도가 사라져 인출액 전액이 연금수령으로 인정됩니다.
                  </p>

                  {/* 세액·수수료로 가려지지 않는 계좌 유형의 차이 - 수동 선택의 판단 근거 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {[
                      {
                        t: 'IRP',
                        rows: [
                          ['투자 가능 상품', '위험자산 70% 한도. 예금·채권 등 안전자산을 30% 이상 담아야 합니다.'],
                          ['중도인출', '법정 사유(무주택자 주택구입, 6개월 이상 요양, 개인회생·파산 등)만 가능합니다.'],
                          ['퇴직급여 이전', 'DB·DC 지급액을 퇴직연금사업자가 직접 이전합니다.']
                        ]
                      },
                      {
                        t: '연금저축',
                        rows: [
                          ['투자 가능 상품', '위험자산 한도가 없어 주식형 비중을 100%까지 가져갈 수 있습니다.'],
                          ['중도인출', '사유 제한 없이 가능하나 인출액에 기타소득세 16.5%가 붙습니다.'],
                          ['퇴직급여 이전', '퇴직급여를 수령한 뒤 60일 내에 납입해야 과세이연됩니다(소득세법 §146).']
                        ]
                      }
                    ].map((b) => (
                      <div key={b.t} className="border border-hair rounded-sm bg-white px-4 py-3">
                        <div className="text-[14px] font-bold text-ink mb-2">{b.t}</div>
                        <dl className="space-y-1.5">
                          {b.rows.map((r) => (
                            <div key={r[0]}>
                              <dt className="text-[12px] font-medium text-mas-blue">{r[0]}</dt>
                              <dd className="text-[12px] text-ink-muted leading-snug">{r[1]}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px] text-ink-soft mt-3 leading-relaxed">
                    이 차이는 세액 계산에 들어가지 않습니다. 판정 탭의 추천 카드나 인출 스케줄 탭의
                    계좌 선택 상자에서 직접 바꾸면 시뮬레이션과 인쇄물에 그대로 반영됩니다.
                  </p>
                </Section>
              )}

              </div>

              <div style={{ display: tab === 'schedule' ? 'block' : 'none' }}>
              {ready && sim && (
                <Section
                  title={scheduleChoices.length > 1 ? '인출 시뮬레이션' : '인출 시뮬레이션 - ' + picked.label}
                  right={
                    <div className="flex items-center gap-2 screen-only">
                      {/*
                        계좌를 여기서도 바꾼다.

                        고를 수 있는 것이 하나뿐이면 상자를 두지 않는다 - 고를 것이 없는
                        선택 상자는 '뭘 골라야 하나' 를 묻는 것처럼 보인다.

                        묶음을 갈라 두는 이유: 위 묶음은 보는 대상만 옮기지만 아래
                        묶음을 고르면 받을 계좌 자체가 바뀐다. 한 줄로 섞어 두면
                        고르는 사람이 그 차이를 알 길이 없다.
                      */}
                      {scheduleChoices.length > 1 && (
                        <select value={picked.id} aria-label="시뮬레이션 계좌"
                          onChange={(e) => chooseScheduleAccount(e.target.value)}
                          className="h-[38px] px-3 pr-8 text-[14px] font-medium bg-white text-ink
                                     border border-mas-orange rounded-xs cursor-pointer max-w-[380px]
                                     focus:outline-none focus:ring-2 focus:ring-mas-orange/25">
                          <optgroup label={isSplit ? '지금 나누어 받는 계좌' : '지금 받는 계좌'}>
                            {scheduleChoices.filter((x) => x.allocated).map(({ c }) => (
                              <option key={c.id} value={c.id}>
                                {c.label + ' · ' + c.startLimitYear + '년차 · 배정 ' + krw(c.allocatedAmount)}
                              </option>
                            ))}
                          </optgroup>
                          {scheduleChoices.some((x) => !x.allocated) && (
                            <optgroup label="이 계좌로 바꿔서 보기">
                              {scheduleChoices.filter((x) => !x.allocated).map(({ c }) => (
                                <option key={c.id} value={c.id}>
                                  {c.label + ' · ' + c.startLimitYear + '년차 · ' +
                                    (c.feeRate > 0 ? '연 ' + (c.feeRate * 100).toFixed(2) + '%' : '수수료 없음')}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      )}
                      {/*
                        내보내기 단추는 여기 두지 않는다. 엑셀과 CSV 는 고를 때 서로
                        비교하는 것이라 한자리에 있어야 하고(맨 위 머리줄), 여기
                        하나만 있으면 탭을 열기 전에는 보이지 않아 '없는 기능' 이 된다.
                      */}
                    </div>
                  }>
                  {pickables.length > 1 && (
                    <p className="text-[12px] text-ink-soft mb-3 leading-snug screen-only"
                      role="note" aria-label="분할 입금 계좌 안내">
                      재원이 <strong>{pickables.length}개 계좌로 나뉘어</strong> 입금됩니다. 위에서 계좌를 바꾸면
                      그 계좌의 인출 스케줄을 봅니다 — 판정 탭으로 돌아가지 않아도 됩니다.
                      (인쇄물에는 지금 고른 계좌가 담깁니다.)
                    </p>
                  )}
                  {/*
                    고를 후보가 더 있다는 것과, 그것을 고르면 무엇이 함께 바뀌는지를
                    적는다. 바꾸고 나면 되돌리는 단추를 같은 자리에 내놓는다 - 판정
                    탭까지 가야 되돌릴 수 있으면 바꿔 보기가 부담이 된다.
                  */}
                  {(scheduleChoices.some((x) => !x.allocated) || allocation.some((a) => a.manual)) && (
                    <p className="text-[12px] mb-3 leading-snug screen-only flex flex-wrap items-center gap-2"
                      role="note" aria-label="다른 계좌로 바꿔 보기 안내">
                      {scheduleChoices.some((x) => !x.allocated) && (
                        <span className="text-ink-soft">
                          계좌 비교에 오른 <strong className="text-ink-body">다른 후보도 위 상자에서 고를 수 있습니다.</strong>{' '}
                          고르면 그 계좌로 <strong className="text-ink-body">받는 것으로 바뀌어</strong> 판정 · 인쇄물 ·
                          엑셀까지 함께 따라갑니다.
                        </span>
                      )}
                      {allocation.some((a) => a.manual) && (
                        <button type="button" onClick={() => setManualPick({})}
                          className="h-[26px] px-2 text-[12px] font-medium text-mas-active bg-white
                                     border border-mas-orange rounded-xs hover:bg-mas-soft transition shrink-0">
                          추천 계좌로 되돌리기
                        </button>
                      )}
                    </p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <Stat label="시뮬레이션 대상 자산" value={krw(picked.allocatedAmount + otherPrincipal)} tone="brand" />
                    <Stat label={'총 인출액 (' + sim.totals.spanYears + '년)'} value={krw(sim.totals.totalDraw)} />
                    <Stat label="총 예상 세액" value={krw(sim.totals.totalTax)} tone="blue" />
                    <Stat label="세후 수령액" value={krw(sim.totals.afterTax)} tone="brand" />
                  </div>

                  {(effectiveDeferredTax > 0 || sim.totals.totalFee > 0) && (
                    <div className="flex flex-wrap gap-3 mb-5">
                      {effectiveDeferredTax > 0 && (
                        <div className="flex-1 min-w-[280px] border border-mas-soft bg-[#FDEEDF] rounded-sm px-4 py-3">
                          <span className="text-[14px] text-ink-body">일시금 수령 대비 퇴직소득세 절감액</span>
                          <span className="num text-[20px] font-bold text-mas-active ml-3">{krw(sim.totals.taxSaved)}</span>
                          <div className="text-[12px] text-ink-muted mt-1">
                            연금수령 1~10년차 30% · 11~20년차 40% · 21년차부터 50% 감면
                          </div>
                        </div>
                      )}
                      {sim.totals.totalFee > 0 && (
                        <div className="flex-1 min-w-[280px] border border-hair bg-surf-subtle rounded-sm px-4 py-3">
                          <span className="text-[14px] text-ink-body">{sim.totals.spanYears}년간 총 수수료</span>
                          <span className="num text-[20px] font-bold text-ink ml-3"
                            role="note" aria-label="총 수수료"
                            title={Math.round(sim.totals.totalFee).toLocaleString('ko-KR') + '원'}>
                            {krw(sim.totals.totalFee)}</span>
                          <div className="text-[12px] text-ink-muted mt-1">
                            연 {(blendedFeeRate * 100).toFixed(2)}% · 적립금 기준 차감
                            {Math.abs(blendedFeeRate - picked.feeRate) > 1e-9
                              ? ' (합산 계좌의 요율을 금액으로 가중평균)' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {mixedBasis.length > 0 && (
                    <div className="border border-[#E8D49A] bg-[#FBF3DF] rounded-sm px-4 py-3 mb-5 text-[13px] text-[#8A6A0B] leading-relaxed">
                      <strong className="font-bold">합산 주의</strong>{' · '}
                      {mixedBasis.map((a) => a.label + '(' + a.startLimitYear + '년차)').join(' / ')}는 연금수령연차가{' '}
                      {picked.label}({picked.startLimitYear}년차)과 달라 실제로는 한도가 계좌별로 따로 산정됩니다.
                      아래 표는 {picked.startLimitYear}년차 기준으로 합산해 계산한 값이라 참고용입니다.
                    </div>
                  )}

                  {sim.totals.residual > 1 && (
                    <p className="text-[13px] text-sig-err mb-3">
                      세법상 인출 한도 때문에 {years}년 내 전액 인출이 되지 않아
                      <strong className="num"> {krw(sim.totals.residual)}</strong>이 남습니다. 수령 기간을 늘려 주세요.
                    </p>
                  )}

                  <div className="overflow-x-auto border border-hair rounded-sm bg-white">
                    <table className="w-full text-[13px] num">
                      <thead>
                        <tr className="bg-mas-soft text-ink">
                          {['회차', '한도 연차', '실제 연차', '기초자산', '한도액', '연간 인출액(월 환산)', '감면율', '예상 세액', '기말잔액'].map((h) => (
                            <th key={h} className="px-2 py-2 font-bold text-[12px] whitespace-nowrap border-b border-hair">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sim.rows.map((r) => (
                          <tr key={r.k} className="border-b border-hair-soft hover:bg-surf-subtle">
                            <td className="px-2 py-1.5 text-center">{r.k}<span className="text-[11px] text-ink-soft ml-1">({r.year})</span></td>
                            <td className="px-2 py-1.5 text-center">
                              {r.limitYear}년차{r.unlimited ? <span className="text-sig-ok font-bold ml-1">한도해제</span> : null}
                            </td>
                            <td className="px-2 py-1.5 text-center">{r.actualYear}년차</td>
                            <td className="px-2 py-1.5 text-right">{man(r.begin)}</td>
                            <td className="px-2 py-1.5 text-right">{r.unlimited ? '전액' : man(r.limit)}</td>
                            <td className="px-2 py-1.5 text-right font-bold text-mas-blue"
                              title={'재원별 인출 (인출 순서대로)\n' +
                                '① 세액공제 받지 않은 금액  ' + man(r.drawExempt) + '만원 (과세제외)\n' +
                                '② 이연퇴직소득  ' + man(r.drawRet) + '만원\n' +
                                '③ 세액공제 받은 금액·운용수익  ' + man(r.drawOther) + '만원'}>
                              {man(r.draw)}
                              <span className="text-[11px] text-ink-soft font-normal ml-1">({man(r.monthly)})</span>
                              {r.overPart > 1 ? (
                                <span className="block text-[11px] text-sig-err font-normal"
                                  title="한도를 넘겨 인출한 부분입니다. 연금외수령으로 보아 감면 없이 과세됩니다.">
                                  연금외 {man(r.overPart)}
                                </span>
                              ) : null}
                              {r.over1500 ? (
                                <span className="block text-[11px] text-[#8A6A0B] font-normal"
                                  title="세액공제 받은 금액·운용수익의 연금수령분이 연 1,500만원을 넘어 3.3~5.5% 저율 분리과세를 쓸 수 없습니다. 종합과세와 16.5% 분리과세 중에서 고르게 되며, 이 표는 16.5% 분리과세를 택한 기준입니다. 다른 소득이 적으면 종합과세가 더 유리할 수 있습니다.">
                                  1,500만 초과
                                </span>
                              ) : null}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {r.drawRet > 0 ? (
                                <span className={r.reduction > 0.3 ? 'text-sig-ok font-bold' : 'text-ink-muted'}>
                                  {Math.round(r.reduction * 100)}%
                                </span>
                              ) : (
                                <span className="text-mas-gray" title="이연퇴직소득이 모두 인출되어 감면 대상이 없습니다">-</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5 text-right">{man(r.tax)}</td>
                            <td className="px-2 py-1.5 text-right text-ink-muted">{man(r.end)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[12px] text-ink-soft mt-3 leading-relaxed">
                    단위: 만원 · 연금수령한도 = 과세기간 개시일 평가액 ÷ (11 - 연금수령연차) × 120%
                    <Help title="연금수령한도는 인출 한도가 아닙니다">
                      한도는 인출할 수 있는 금액의 상한이 아니라, 뺀 돈을 <strong>연금수령</strong>으로 볼지
                      <strong> 연금외수령</strong>으로 볼지 가르는 기준선입니다. 한도를 넘겨 빼도 되고,
                      넘은 부분만 연금외수령이 되어 퇴직소득세 감면 없이(세액공제분·운용수익은 기타소득세 16.5%)
                      과세됩니다. 연금수령연차가 11년차를 넘으면 한도가 사라져 인출액 전액이 연금수령으로 인정됩니다.
                    </Help>
                    {' · '}인출 순서는 세액공제 받지 않은 금액 → 이연퇴직소득 → 세액공제 받은 금액·운용수익
                    <Help title="인출 순서 (시행령 §40의3)">
                      ① <strong>세액공제 받지 않은 납입액</strong> - 과세제외, 세금 없음<br />
                      ② <strong>이연퇴직소득(퇴직금)</strong> - 연금수령분은 퇴직소득세를 30·40·50% 감면
                      (지방소득세 포함 금액 기준)<br />
                      ③ <strong>세액공제 받은 납입액 + 운용수익</strong> - 연금소득세 5.5% / 70세 이상 4.4% /
                      80세 이상 3.3%. ③재원의 연금수령분이 <strong>연 1,500만원을 넘으면</strong> 저율 분리과세를
                      쓸 수 없고 종합과세와 <strong>16.5% 분리과세</strong> 중에서 고릅니다 - 이 표는 16.5% 기준입니다<br />
                      순서를 바꿀 수 없으므로 ①이 많을수록 초기 인출의 세금이 낮아집니다.
                    </Help>
                    {sim.totals.totalOver > 1 ? (
                      <span className="block mt-1 text-sig-err">
                        이 조건에서는 {man(sim.totals.totalOver)}만원이 한도를 넘겨 연금외수령으로 과세됩니다.
                        수령 기간을 늘리거나 '세법 한도 내 최대'로 바꾸면 줄어듭니다.
                      </span>
                    ) : null}
                  </p>
                </Section>
              )}
              </div>

              {/* 판단표 - 고객 정보와 무관한 참조표라 언제나 열린다 */}
              <div style={{ display: tab === 'matrix' ? 'block' : 'none' }}>
                <MatrixTab current={{
                  ready,
                  system,
                  // 모르는 것은 null 로 넘긴다. false 로 넘기면 '2013.3.1 이후'라고
                  // 단정하는 꼴이라, 맞추기를 눌러도 아무 일이 없는 것처럼 보인다.
                  legacy: systemJoinMissing ? null
                    : isLegacyDate(system === 'DC' && dbConverted && dbJoin ? dbJoin : systemJoin),
                  age: retireAge === null ? 58 : retireAge,
                  // 둘 다 있으면 둘 다 넘긴다. 하나만 보여 주면 나머지 재원의 답이
                  // 화면에서 아예 사라진다 - DC 는 그 둘의 답이 정반대다.
                  funds: [
                    (system === 'SEV' ? amtLegal : amtSingle) > 0 ? 'LEGAL' : null,
                    amtHonor > 0 ? 'HONOR' : null
                  ].filter(Boolean)
                }} />
              </div>
            </div>
          </div>

          <footer className="mt-4 pt-6 border-t border-hair">
            <p className="text-[12px] text-ink-soft leading-relaxed">
              본 시뮬레이션은 상담 보조용 추정치이며 실제 세액·수령액과 다를 수 있습니다.
              최종 판단은 원천징수영수증 및 금융기관 확인을 거쳐 주시기 바랍니다.
            </p>
          </footer>
        </main>

        {/* ---------- 사용법 덮개 ---------- */}
        {guideOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto"
            onClick={() => setGuideOpen(false)}>
            <div className="max-w-[820px] mx-auto my-8 bg-surf-soft rounded-sm shadow-lg"
              role="dialog" aria-label="사용법" aria-modal="true"
              onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-mas-orange text-white px-6 py-4 rounded-t-sm
                              flex items-center justify-between gap-3">
                <div>
                  <div className="text-[19px] font-bold">사용법</div>
                  <div className="text-[12px] opacity-90 mt-0.5">상담 순서 그대로 · 자주 틀리는 것까지</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" aria-label="사용법 인쇄" onClick={printGuide}
                    className="h-[34px] px-3 text-[13px] font-medium bg-white text-mas-active
                               rounded-xs hover:bg-mas-soft transition">
                    인쇄
                  </button>
                  <button type="button" aria-label="사용법 닫기" onClick={() => setGuideOpen(false)}
                    className="h-[34px] px-3 text-[13px] font-medium bg-white/15 text-white
                               rounded-xs hover:bg-white/25 transition">
                    닫기 (Esc)
                  </button>
                </div>
              </div>
              <div className="px-6 py-5">
                <GuideBody forPrint={false} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================== 인쇄 ===================== */}
      {/*
        인쇄물은 두 가지다 - 고객에게 주는 A4 한 장과, 지점에 돌리는 사용법.
        동시에 내보내면 한 뭉치로 나오므로 printMode 로 하나만 그린다.
      */}
      {printMode === 'guide' && (
        <div className="print-only" style={{ padding: '10mm' }}>
          <h1 style={{ fontSize: '14pt', fontWeight: 700, margin: '0 0 2pt' }}>
            {DOC_TITLE} — 사용법
          </h1>
          <p style={{ fontSize: '8.5pt', color: '#6C6C6C', margin: '0 0 8pt' }}>
            [사내한] 상담 순서 그대로. 각 단계의 '자주 틀리는 것' 은 실제로 틀렸던 것들입니다.
          </p>
          <GuideBody forPrint />
        </div>
      )}
      {printMode === 'sheet' && <PrintSheet
        ready={ready} custName={custName} birth={birth} age={age}
        system={system} systemJoin={systemJoin} retireTotal={retireTotal}
        retireDate={retireDate} retireAge={retireAge}
        amtSingle={amtSingle} amtLegal={amtLegal} amtHonor={amtHonor} deferredTax={effectiveDeferredTax}
        taxCalc={taxCalc && !!taxResult}
        candidates={candidates} best={best} picked={picked}
        allocation={allocation} isSplit={isSplit} allocatedDeferredTax={allocatedDeferredTax}
        comparison={comparison}
        memo={memo} memoOnPrint={memoOnPrint}
        mode={mode} years={years} rate={rate}
        otherPrincipal={otherPrincipal} exemptPrincipal={exemptPrincipal} sim={sim} startYear={startYear}
        accountList={accountList} accountNames={accountNames} merged={merged}
        blendedFeeRate={blendedFeeRate}
      />}
    </React.Fragment>
  );
}

/* ================================================================
   6. 인쇄 시트 - A4 단면 1장 고정
   ================================================================ */

function PrintSheet(props) {
  const {
    ready, custName, birth, age, system, systemJoin, retireTotal, retireDate, retireAge,
    amtSingle, amtLegal, amtHonor, deferredTax, taxCalc, best, picked,
    allocation, isSplit, allocatedDeferredTax, comparison, memo, memoOnPrint,
    mode, years, rate, otherPrincipal, sim, startYear, exemptPrincipal, blendedFeeRate,
    accountList, accountNames, merged
  } = props;

  if (!ready || !picked || !sim) {
    return <div className="print-only sheet"><p>입력이 완료되면 인쇄 내용이 생성됩니다.</p></div>;
  }

  const systemLabel = system === 'SEV' ? '퇴직금제도' : system;
  // 계좌가 여러 개일 수 있으므로 한 줄로 요약한다. A4 한 장을 지켜야 해서
  // 세 개까지만 적고 나머지는 개수로 줄인다.
  const accList = (accountList || []);
  const accSummary = !accList.length ? '없음'
    : accList.slice(0, 3).map((a) =>
        accountNames[a.id] + ' ' + fmtDate(parseDate(a.joinStr)) + ' · ' + krw(a.bal)).join(' / ')
      + (accList.length > 3 ? ' 외 ' + (accList.length - 3) + '건' : '');
  const mergeLabel = !merged || !merged.length
    ? '퇴직급여 단독'
    : merged.map((a) => accountNames[a.id]).join(' · ') + ' 합산';
  const rows = sim.rows;

  const info = [
    ['고객명', custName || '-'],
    ['생년월일 / 만 나이', (birth ? birth.getFullYear() + '.' + (birth.getMonth() + 1) + '.' + birth.getDate() : '-') + ' / 만 ' + (age !== null ? age : '-') + '세'],
    ['퇴직제도 / 가입일', systemLabel + ' / ' + fmtDate(systemJoin)],
    ['퇴직(예정)일', fmtDate(retireDate) + (retireAge !== null ? ' · 퇴직 시 만 ' + retireAge + '세' : '')],
    ['퇴직급여 총액', krw(retireTotal) + (amtHonor > 0
      ? ' (' + (system === 'SEV' ? '법정 ' + krw(amtLegal) : '규약상 ' + krw(amtSingle)) +
        ' · 명예 ' + krw(amtHonor) + ')'
      : '')],
    ['이연 퇴직소득세', deferredTax > 0
      ? krw(deferredTax) + ' (지방소득세 포함)' + (taxCalc ? ' · 자체 계산' : '') +
        (isSplit ? ' (이 계좌 배정분 ' + krw(allocatedDeferredTax) + ')' : '')
      : '미입력'],
    ['기존 보유 계좌', accSummary],
    ['합산 범위 / 인출 방식', mergeLabel + ' / ' + (mode === 'max' ? '세법 한도 내 최대' : '기간 균등 분할')],
    ['수령 기간 / 운용수익률', years + '년 / 연 ' + rate.toFixed(1) + '%'],
    ['계좌 수수료 / 총 수수료', blendedFeeRate > 0
      ? '연 ' + (blendedFeeRate * 100).toFixed(2) + '% / ' + krw(sim.totals.totalFee)
      : '없음']
  ];

  const stats = [
    ['대상 자산', krw(picked.allocatedAmount + otherPrincipal + (exemptPrincipal || 0))],
    ['총 인출액 (' + sim.totals.spanYears + '년)', krw(sim.totals.totalDraw)],
    ['총 예상 세액', krw(sim.totals.totalTax)],
    ['세후 수령액', krw(sim.totals.afterTax)]
  ];

  const printMemo = memoOnPrint ? String(memo || '').trim() : '';

  // 메모 블록이 붙으면서 표가 길면 A4 한 장을 넘길 수 있어 행 여백을 줄인다
  // 계좌가 여러 개면 비교표도 길어진다. 고객이 실제로 견줄 만한 상위 5개만 싣고
  // 나머지는 줄 수로 줄인다 (전체는 화면에서 본다).
  const CMP_MAX = 5;
  const cmpAll = comparison || [];
  const cmpRows = cmpAll.slice(0, CMP_MAX);
  const cmpHidden = cmpAll.length - cmpRows.length;

  // 표가 길어지면 행 여백을 줄여 A4 한 장을 지킨다
  const tight = (!!printMemo && rows.length > 18) || cmpAll.length > 4;
  const cellPad = tight ? '0.55mm 1mm' : '0.9mm 1mm';

  const th = { border: '0.5pt solid #CDCECB', background: '#FAB072', padding: tight ? '0.9mm 1mm' : '1.2mm 1mm', fontWeight: 700, textAlign: 'center' };
  const td = { border: '0.5pt solid #E5E4E1', padding: cellPad, textAlign: 'right' };
  const tdC = Object.assign({}, td, { textAlign: 'center' });

  return (
    <div className="print-only sheet">
      <div style={{ borderBottom: '1pt solid #F58220', paddingBottom: '1.6mm', marginBottom: '2.2mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{ fontSize: '13pt', fontWeight: 700, margin: 0, letterSpacing: '-0.3pt' }}>
            {DOC_TITLE} 결과
          </h1>
          <span style={{ fontSize: '7pt', color: '#6C6C6C' }}>
            작성일 {TODAY.getFullYear()}.{TODAY.getMonth() + 1}.{TODAY.getDate()}
          </span>
        </div>
      </div>

      {/* 판정 결론 - 재원별 배정 */}
      <div style={{ background: '#F58220', color: '#fff', padding: '2mm 2.5mm', marginBottom: '2.4mm' }}>
        <div style={{ fontSize: '6.6pt', opacity: 0.9, marginBottom: '0.6mm' }}>
          {((allocation || []).some((a) => a.manual) ? '판정 결과 - 상담자 선택' : '판정 결과') + (isSplit ? ' · 재원별 분할 입금' : '')}
        </div>
        {(allocation || []).map((a, i) => (
          <div key={i} style={{ fontSize: '9.5pt', fontWeight: 700, lineHeight: 1.3 }}>
            {a.source.label} {krw(a.source.amount)} → {a.target ? a.target.label : '입금 가능한 계좌 없음'}
            {a.target ? ' (' + a.target.startLimitYear + '년차)' : ''}
            {a.manual ? <span style={{ fontSize: '6.6pt', fontWeight: 400, marginLeft: '1mm' }}>· 상담자 수동 선택</span> : null}
          </div>
        ))}
        <div style={{ fontSize: '7pt', marginTop: '0.8mm', lineHeight: 1.35 }}>
          {'기산연차 ' + picked.seniorityIndex + '년차 (' + picked.seniorityBasis + ') · ' +
            picked.baseYear + '년 연금개시 요건 충족 → ' + startYear + '년 ' + picked.startLimitYear + '년차. '}
          {picked.unlimited
            ? '연금수령한도가 없어 인출액 전액이 연금수령으로 인정됩니다.'
            : '한도 내 전액 인출에는 ' + picked.minYears + '년이 필요합니다.'}
        </div>
      </div>

      {/* 입력 요약 + 핵심 지표 */}
      <div style={{ display: 'flex', gap: '2.5mm', marginBottom: '2.4mm' }}>
        <table style={{ width: '58%', borderCollapse: 'collapse', fontSize: '7pt' }}>
          <tbody>
            {info.map((r, i) => (
              <tr key={i}>
                <td style={{ border: '0.5pt solid #E5E4E1', background: '#F7F8FA', padding: '0.8mm 1.2mm', width: '38%', color: '#3D3D3D' }}>{r[0]}</td>
                <td style={{ border: '0.5pt solid #E5E4E1', padding: '0.8mm 1.2mm' }}>{r[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ width: '42%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4mm', marginBottom: '1.6mm' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ border: '0.5pt solid #CDCECB', padding: '1.2mm 1.6mm' }}>
                <div style={{ fontSize: '6.2pt', color: '#6C6C6C' }}>{s[0]}</div>
                <div style={{ fontSize: '9pt', fontWeight: 700, color: i === 3 ? '#F58220' : '#1A1A1A' }}>{s[1]}</div>
              </div>
            ))}
          </div>
          {deferredTax > 0 && (
            <div style={{ border: '0.5pt solid #FAB072', background: '#FDEEDF', padding: '1.4mm 1.6mm', marginBottom: '1.6mm' }}>
              <div style={{ fontSize: '6.4pt', color: '#3D3D3D' }}>일시금 수령 대비 퇴직소득세 절감액</div>
              <div style={{ fontSize: '10.5pt', fontWeight: 700, color: '#CB6015' }}>{krw(sim.totals.taxSaved)}</div>
            </div>
          )}

          {/* 계좌별 비교 - 높이를 늘리지 않도록 우측 열 안에 둔다 */}
          {comparison && comparison.length > 1 && (
            <React.Fragment>
            {/*
              위 지표 카드는 합산 범위 기준, 이 표는 퇴직급여 단독 기준이라 같은
              '세후 수령액' 이라도 값이 다르다. 인쇄물만 보는 고객이 오해하지 않도록
              기준과 단위를 표 머리에 밝힌다.
            */}
            <div style={{ fontSize: '6.2pt', color: '#6C6C6C', marginBottom: '0.6mm' }}>
              계좌별 비교 <span style={{ color: '#CB6015' }}>(퇴직급여 단독 기준 · 단위: 만원)</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.2pt' }}>
              <thead>
                <tr>
                  {['계좌', '기산', '연 수수료', '총 수수료', '세후 수령액'].map((h) => (
                    <th key={h} style={{ border: '0.5pt solid #CDCECB', background: '#FAB072', padding: '0.7mm 0.6mm', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cmpRows.map((r) => {
                  const on = r.c.id === picked.id;
                  const cell = {
                    border: '0.5pt solid #E5E4E1', padding: '0.6mm', textAlign: 'right',
                    background: on ? '#FDEEDF' : '#fff', fontWeight: on ? 700 : 400
                  };
                  return (
                    <tr key={r.c.id}>
                      <td style={Object.assign({}, cell, { textAlign: 'left' })}>
                        {r.c.label}{r.partial ? ' (일부)' : ''}
                      </td>
                      <td style={Object.assign({}, cell, { textAlign: 'center' })}>{r.c.startLimitYear}년차</td>
                      <td style={cell}>{r.c.feeRate > 0 ? (r.c.feeRate * 100).toFixed(2) + '%' : '-'}</td>
                      <td style={cell}>{r.totalFee > 0 ? man(r.totalFee) : '-'}</td>
                      <td style={cell}>{man(r.afterTax)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {cmpHidden > 0 && (
              <div style={{ fontSize: '6pt', color: '#6C6C6C', marginTop: '0.5mm' }}>
                연차가 낮은 {cmpHidden}개 계좌는 생략했습니다 (화면에서 전체 확인).
              </div>
            )}
            </React.Fragment>
          )}
        </div>
      </div>

      {/* 상담 메모 - 체크했을 때만 */}
      {printMemo && (
        <div style={{
          border: '0.5pt solid #CDCECB', background: '#F7F8FA',
          padding: '1.2mm 1.6mm', marginBottom: '2mm'
        }}>
          <div style={{ fontSize: '6.2pt', color: '#6C6C6C', marginBottom: '0.4mm' }}>상담 메모</div>
          <div style={{ fontSize: '6.6pt', lineHeight: 1.35, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {printMemo}
          </div>
        </div>
      )}

      {/* 상세 인출 스케줄 */}
      <h2 style={{ fontSize: '8.4pt', fontWeight: 700, margin: '0 0 1.2mm', paddingTop: '0.8mm', borderTop: '1pt solid #F58220' }}>
        연차별 인출 스케줄 - {picked.label}
        <span style={{ fontWeight: 400, fontSize: '6.6pt', color: '#6C6C6C' }}> (단위: 만원)</span>
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt' }}>
        <thead>
          <tr>
            {['회차', '연도', '한도 연차', '실제 연차', '기초자산', '한도액', '연간 인출액', '(월 환산)', '감면율', '예상 세액', '기말잔액'].map((h) => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k}>
              <td style={tdC}>{r.k}</td>
              <td style={tdC}>{r.year}</td>
              <td style={tdC}>{r.limitYear}년차{r.unlimited ? '·해제' : ''}</td>
              <td style={tdC}>{r.actualYear}년차</td>
              <td style={td}>{man(r.begin)}</td>
              <td style={td}>{r.unlimited ? '전액' : man(r.limit)}</td>
              <td style={Object.assign({}, td, { fontWeight: 700, color: '#043B72' })}>{man(r.draw)}</td>
              <td style={Object.assign({}, td, { color: '#6C6C6C' })}>{man(r.monthly)}</td>
              <td style={Object.assign({}, tdC, {
                color: r.drawRet > 0 ? (r.reduction > 0.3 ? '#2E8540' : '#3D3D3D') : '#84888B',
                fontWeight: r.drawRet > 0 && r.reduction > 0.3 ? 700 : 400
              })}>
                {r.drawRet > 0 ? Math.round(r.reduction * 100) + '%' : '-'}
              </td>
              <td style={td}>{man(r.tax)}</td>
              <td style={Object.assign({}, td, { color: '#6C6C6C' })}>{man(r.end)}</td>
            </tr>
          ))}
          <tr>
            <td style={Object.assign({}, tdC, { background: '#D7D7D7', fontWeight: 700 })} colSpan={6}>합계</td>
            <td style={Object.assign({}, td, { background: '#D7D7D7', fontWeight: 700 })} colSpan={2}>{man(sim.totals.totalDraw)}</td>
            <td style={Object.assign({}, tdC, { background: '#D7D7D7' })}>-</td>
            <td style={Object.assign({}, td, { background: '#D7D7D7', fontWeight: 700 })}>{man(sim.totals.totalTax)}</td>
            <td style={Object.assign({}, td, { background: '#D7D7D7' })}>{man(sim.totals.residual)}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: '6.2pt', color: '#6C6C6C', lineHeight: 1.35, margin: '1.6mm 0 0' }}>
        연금수령한도 = 과세기간 개시일 현재 평가액 ÷ (11 - 연금수령연차) × 120%. 이는 인출 한도가 아니라 연금수령과 연금외수령을 가르는 기준이며, 초과 인출분은 감면 없이 과세됩니다.
        연금수령연차는 {CUTOFF_LABEL} 이전 가입 계좌, 그리고 {CUTOFF_LABEL} 이전 퇴직연금(DB·DC) 가입자가 퇴직급여 전액을 신규 개설 계좌에 입금하는 경우 6년차부터 기산하며(소득세법 시행령 §40의2④), 연금개시 요건(만 55세·가입 5년, 퇴직급여 입금 시 5년 면제)을 갖춘 해부터 신청 여부와 무관하게 매년 누적됩니다.
        퇴직소득세는 실제 연금수령 1~10년차 30%, 11~20년차 40%, 21년차부터 50% 감면됩니다(소득세법 §129①5의3). 인출은 세액공제 받지 않은 금액 → 이연퇴직소득 → 세액공제 받은 금액·운용수익 순입니다(소득세법 시행령 §40의3).
        사적연금 연 1,500만원 초과 수령 시 종합과세 또는 16.5% 분리과세 선택 대상이며, 16.5% 기준으로 계산했습니다.
        본 자료는 상담 보조용 추정치로 실제 세액 및 수령액과 다를 수 있으며, 최종 판단은 원천징수영수증과 금융기관 확인을 거쳐야 합니다.
      </p>
    </div>
  );
}

/* ================================================================
   7. 마운트
   ================================================================ */
const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}
