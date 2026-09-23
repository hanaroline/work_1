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
  } else if (input.amtSingle > 0) {
    sources.push({
      kind: system, label: system + ' 퇴직급여', amount: input.amtSingle,
      joinDate: systemJoin, seniorityDate,
      seniorityFromDB: system === 'DC' && !!dbConverted && !!dbJoin
    });
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
  const { birthYear, depositYear } = opts;

  let index = 1;
  let basis = CUTOFF_LABEL + ' 이후 가입 계좌';
  if (!target.isNew && isLegacyDate(target.joinDate)) {
    index = 6;
    basis = fmtDate(target.joinDate) + ' 가입 · ' + CUTOFF_LABEL + ' 이전 계좌';
  } else if (target.isNew && sources.length === 1 && isLegacyDate(sources[0].seniorityDate)) {
    index = 6;
    basis = CUTOFF_LABEL + ' 이전 ' + (sources[0].seniorityFromDB ? 'DB' : sources[0].kind) +
      ' 가입(' + fmtDate(sources[0].seniorityDate) + ') · 신규계좌 전액 입금';
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

/** 계좌 후보 생성 및 평가 */
function buildCandidates(input, sources) {
  const { age, hasPension, pensionJoin, pensionBal, hasIrp, irpJoin, irpBal, fees, startYear, birthYear } = input;

  const targets = [];
  if (hasPension) {
    targets.push({ id: 'ex-pension', type: 'pension', isNew: false, joinDate: pensionJoin, balance: pensionBal, started: !!input.pensionStarted, label: '기존 연금저축' });
  }
  if (hasIrp) {
    targets.push({ id: 'ex-irp', type: 'irp', isNew: false, joinDate: irpJoin, balance: irpBal, started: !!input.irpStarted, label: '기존 IRP' });
  }
  targets.push({ id: 'new-irp', type: 'irp', isNew: true, joinDate: TODAY, balance: 0, started: false, label: '신규 IRP 개설' });
  targets.push({ id: 'new-pension', type: 'pension', isNew: true, joinDate: TODAY, balance: 0, started: false, label: '신규 연금저축 개설' });

  const opts = { birthYear: birthYear === undefined ? null : birthYear, depositYear: TODAY.getFullYear() };

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
      feeRate: ((fees && fees[t.id]) || 0) / 100   // 입력은 %, 계산은 소수
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
    if (fRate > 0) {
      const fee = Math.max(0, (E + P + G) * fRate);
      const fromG = Math.min(fee, Math.max(0, G));
      G -= fromG;
      const rest = fee - fromG;
      const fromP = Math.min(rest, Math.max(0, P));
      P -= fromP;
      E = Math.max(0, E - (rest - fromP));
      totalFee += fee;
    }

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

    // ③ 세액공제분·운용수익 - 연금수령분은 연령별 연금소득세, 초과분은 기타소득세 16.5%
    const ageK = startAge + k - 1;
    const otherTax = penG * pensionRateByAge(ageK) + ovG * 0.165;

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
      // 사적연금 분리과세 한도는 ③ 재원의 연금수령분에만 걸린다.
      // 퇴직소득 재원의 연금수령분은 금액과 무관하게 분리과세된다.
      over1500: penG > 15000000
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
   4. UI 프리미티브
   ================================================================ */

/**
 * 눌러서 펼치는 설명. 상담 중에 근거를 바로 보여줄 수 있도록 라벨 옆에 붙인다.
 * 인쇄물에는 나오지 않는다(.screen-only 안에서만 쓴다).
 *
 * title 은 한 줄 요약, children 은 근거 조문까지 담은 본문.
 */
function Help({ title, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
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
          role="note"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute z-30 left-0 top-[22px] w-[300px] max-w-[78vw] p-3 bg-ink text-white
                     text-[12px] leading-relaxed font-normal rounded-sm shadow-lg cursor-default block">
          <span className="block font-bold mb-1 text-[12px]">{title}</span>
          <span className="block opacity-90">{children}</span>
          <button type="button" aria-label={title + ' 설명 닫기'}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
            className="absolute top-1 right-2 text-white/70 hover:text-white text-[14px] leading-none">×</button>
        </span>
      )}
    </span>
  );
}

function Field({ label, hint, help, children, className = '' }) {
  return (
    <label className={'block ' + className}>
      <span className="block text-[13px] font-medium text-ink-body mb-1.5">
        {label}
        {help ? <Help title={label}>{help}</Help> : null}
      </span>
      {children}
      {hint ? <span className="block text-[11px] text-ink-soft mt-1 leading-snug">{hint}</span> : null}
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
 * 브라우저 기본 date 입력은 연도 칸에 6자리(예: 200700)까지 받아들여
 * 200700-02-01 같은 값이 들어온다. 연도를 앞 4자리로 자르고 범위를 눌러
 * 가입일이 오늘을 넘지 않게 한다.
 */
function DateInput({ value, onChange, label }) {
  const handle = (e) => {
    const v = e.target.value;
    if (!v) { onChange(''); return; }
    const m = v.match(/^(\d+)-(\d{2})-(\d{2})$/);
    if (!m) { onChange(v); return; }

    // 연도 칸은 6자리까지 들어오므로 앞 4자리만 쓴다.
    // 하한(1900)은 여기서 누르면 안 된다 - 연도를 고칠 때 첫 글자 '2' 가 0002 로
    // 들어와 곧바로 1900 으로 튀어 2016 을 칠 수 없게 된다. 하한은 blur 에서 본다.
    const y = m[1].length > 4 ? m[1].slice(0, 4) : m[1];
    let next = y.padStart(4, '0') + '-' + m[2] + '-' + m[3];
    if (next > TODAY_STR) next = TODAY_STR;              // 가입일은 미래일 수 없다
    onChange(next);
  };

  // 타이핑이 끝난 뒤 연도가 터무니없으면 비운다.
  // 1900 같은 그럴듯한 값으로 눌러 두면 2013.3.1 판정에 조용히 섞여 들어간다.
  const handleBlur = (e) => {
    const m = (e.target.value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m && +m[1] < 1900) onChange('');
  };

  return (
    <input type="date" className={inputCls} value={value} aria-label={label}
      min="1900-01-01" max={TODAY_STR} onChange={handle} onBlur={handleBlur} />
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

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex border border-hair rounded-xs overflow-hidden bg-white">
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value} type="button" onClick={() => onChange(o.value)}
            aria-label={o.label} aria-pressed={on}
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-ink">{title}</h2>
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
      <div className={'num text-[17px] font-bold leading-tight whitespace-nowrap ' + color}>{value}</div>
    </div>
  );
}

/* ================================================================
   5. 메인 앱
   ================================================================ */

// 결과 탭 - 상담 진행 순서와 같다
const DOC_TITLE = '퇴직급여 수령 의사결정 시뮬레이터';

const TABS = [
  { id: 'verdict', label: '판정' },
  { id: 'compare', label: '계좌 비교' },
  { id: 'schedule', label: '인출 스케줄' }
];

function App() {
  // --- 고객 정보
  const [birthRaw, setBirthRaw] = useState('');
  const [custName, setCustName] = useState('');

  // --- 퇴직제도
  const [system, setSystem] = useState('DC');          // 'DB' | 'DC' | 'SEV'
  const [systemJoinStr, setSystemJoinStr] = useState('');
  // 임금피크제 등으로 DB → DC 로 전환한 경우. 신규 계좌 전액 이체 시 DB 가입일이 기산연차를 가른다.
  const [dbConverted, setDbConverted] = useState(false);
  const [dbJoinStr, setDbJoinStr] = useState('');
  const [amtSingle, setAmtSingle] = useState(0);
  const [amtLegal, setAmtLegal] = useState(0);
  const [amtHonor, setAmtHonor] = useState(0);
  const [deferredTax, setDeferredTax] = useState(0);

  // --- 기존 보유 계좌
  const [hasPension, setHasPension] = useState(false);
  const [pensionJoinStr, setPensionJoinStr] = useState('');
  const [pensionBal, setPensionBal] = useState(0);
  const [pensionExempt, setPensionExempt] = useState(0);    // 세액공제 받지 않은 납입액
  const [pensionStarted, setPensionStarted] = useState(false);
  const [hasIrp, setHasIrp] = useState(false);
  const [irpJoinStr, setIrpJoinStr] = useState('');
  const [irpBal, setIrpBal] = useState(0);
  const [irpExempt, setIrpExempt] = useState(0);
  const [irpStarted, setIrpStarted] = useState(false);
  const [pastCount, setPastCount] = useState(0);

  // 재원별 수동 선택 - 투자 가능 상품·중도인출 조건 등 앱이 판단하지 않는 기준으로 상담자가 직접 고른다
  const [manualPick, setManualPick] = useState({});

  // 계좌별 연간 수수료율 (%, 적립금 대비). 상품마다 달라 기본값은 0으로 두고 상담자가 입력한다.
  const [fees, setFees] = useState({ 'ex-pension': 0, 'ex-irp': 0, 'new-irp': 0, 'new-pension': 0 });
  const setFee = (id, v) => setFees((f) => Object.assign({}, f, { [id]: v }));

  // --- 시뮬레이션 옵션
  const [pickedId, setPickedId] = useState(null);
  const [tab, setTab] = useState('verdict');
  const [scope, setScope] = useState('alone');          // alone | pension | irp | all
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
    custName, birthRaw, system, systemJoinStr, dbConverted, dbJoinStr,
    amtSingle, amtLegal, amtHonor, deferredTax,
    hasPension, pensionJoinStr, pensionBal, pensionExempt, pensionStarted,
    hasIrp, irpJoinStr, irpBal, irpExempt, irpStarted,
    pastCount, fees, manualPick, pickedId, scope, mode, years, rate, memo, memoOnPrint
  });

  // 우리 형식인지 최소한의 확인. 아니면 폼을 건드리지 않는다
  const looksLikeCase = (d) => {
    if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
    const keys = ['custName', 'birthRaw', 'system', 'systemJoinStr', 'amtSingle',
      'amtLegal', 'amtHonor', 'deferredTax', 'years', 'rate', 'scope', 'mode'];
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
    setDbConverted(bool(d.dbConverted, false));
    setDbJoinStr(str(d.dbJoinStr, ''));
    setAmtSingle(num(d.amtSingle, 0));
    setAmtLegal(num(d.amtLegal, 0));
    setAmtHonor(num(d.amtHonor, 0));
    setDeferredTax(num(d.deferredTax, 0));
    setHasPension(bool(d.hasPension, false));
    setPensionJoinStr(str(d.pensionJoinStr, ''));
    setPensionBal(num(d.pensionBal, 0));
    setPensionExempt(num(d.pensionExempt, 0));
    setPensionStarted(bool(d.pensionStarted, false));
    setHasIrp(bool(d.hasIrp, false));
    setIrpJoinStr(str(d.irpJoinStr, ''));
    setIrpBal(num(d.irpBal, 0));
    setIrpExempt(num(d.irpExempt, 0));
    setIrpStarted(bool(d.irpStarted, false));
    setPastCount(num(d.pastCount, 0));
    setFees(Object.assign({ 'ex-pension': 0, 'ex-irp': 0, 'new-irp': 0, 'new-pension': 0 },
      d.fees && typeof d.fees === 'object' ? d.fees : {}));
    setManualPick(d.manualPick && typeof d.manualPick === 'object' ? d.manualPick : {});
    setPickedId(typeof d.pickedId === 'string' ? d.pickedId : null);
    setScope(['alone', 'pension', 'irp', 'all'].indexOf(d.scope) >= 0 ? d.scope : 'alone');
    setMode(d.mode === 'max' ? 'max' : 'even');
    setYears(Math.min(30, Math.max(5, num(d.years, 10))));
    setRate(Math.min(8, Math.max(0, num(d.rate, 3))));
    setMemo(str(d.memo, '').slice(0, MEMO_MAX));
    setMemoOnPrint(bool(d.memoOnPrint, false));
    return true;
  };

  const birth = useMemo(() => parseBirth(birthRaw), [birthRaw]);
  const age = useMemo(() => ageOn(birth, TODAY), [birth]);

  const systemJoin = useMemo(() => parseDate(systemJoinStr), [systemJoinStr]);
  const dbJoin = useMemo(() => parseDate(dbJoinStr), [dbJoinStr]);
  const pensionJoin = useMemo(() => parseDate(pensionJoinStr), [pensionJoinStr]);
  const irpJoin = useMemo(() => parseDate(irpJoinStr), [irpJoinStr]);

  const retireTotal = system === 'SEV' ? amtLegal + amtHonor : amtSingle;

  // 연금 개시 시점 - 퇴직 연도와 만 55세 도달 연도 중 늦은 쪽
  const startYear = useMemo(() => {
    const retireY = TODAY.getFullYear();
    if (!birth) return retireY;
    return Math.max(retireY, birth.getFullYear() + 55);
  }, [birth]);
  const startAge = age !== null ? Math.max(age, 55) : 55;

  const input = {
    age, birthYear: birth ? birth.getFullYear() : null, startYear,
    system, systemJoin, dbConverted, dbJoin,
    amtSingle, amtLegal, amtHonor,
    hasPension, pensionJoin, pensionBal, pensionStarted,
    hasIrp, irpJoin, irpBal, irpStarted,
    fees
  };

  const sources = useMemo(() => buildSources(input),
    [system, systemJoinStr, dbConverted, dbJoinStr, amtSingle, amtLegal, amtHonor]);

  const { candidates, allocation } = useMemo(() => {
    const base = buildCandidates(input, sources);
    const alloc = buildAllocation(base, sources, manualPick);
    return { candidates: applyAllocation(base, alloc), allocation: alloc };
  }, [sources, age, birth, startYear, hasPension, pensionJoinStr, pensionBal, pensionStarted,
    hasIrp, irpJoinStr, irpBal, irpStarted, fees, manualPick]);

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

  // 합산 범위에 따른 기존 자산. 세액공제 받지 않은 납입액은 과세제외 재원으로 따로 뗀다.
  const { exemptPrincipal, otherPrincipal } = useMemo(() => {
    const take = (on, bal, ex) => {
      if (!on) return { e: 0, g: 0 };
      const e = Math.max(0, Math.min(ex, bal));
      return { e, g: bal - e };
    };
    const p = take(hasPension, pensionBal, pensionExempt);
    const i = take(hasIrp, irpBal, irpExempt);
    const pick = scope === 'pension' ? [p] : scope === 'irp' ? [i] : scope === 'all' ? [p, i] : [];
    return {
      exemptPrincipal: pick.reduce((s, x) => s + x.e, 0),
      otherPrincipal: pick.reduce((s, x) => s + x.g, 0)
    };
  }, [scope, hasPension, pensionBal, pensionExempt, hasIrp, irpBal, irpExempt]);

  /**
   * 합산 경고 - 연금수령한도는 계좌별로 따로 산정된다.
   * 기산 연차가 다른 계좌를 합산하면 한도가 한쪽 기준으로 계산되어 부정확해진다.
   */
  const mixedBasis = useMemo(() => {
    if (!picked || scope === 'alone') return [];
    const wanted = [];
    if (hasPension && (scope === 'pension' || scope === 'all') && pensionBal > 0) wanted.push('ex-pension');
    if (hasIrp && (scope === 'irp' || scope === 'all') && irpBal > 0) wanted.push('ex-irp');
    // 연차가 실제로 다른 계좌만 경고한다. 둘 다 2013.3.1 이전이어도 만 55세 도달 시점이
    // 달라 연차가 벌어질 수 있으므로, legacy 여부가 아니라 연차 자체를 비교한다.
    return candidates.filter((c) =>
      wanted.indexOf(c.id) >= 0 && c.id !== picked.id && c.startLimitYear !== picked.startLimitYear);
  }, [candidates, picked, scope, hasPension, pensionBal, hasIrp, irpBal]);

  // 분할 입금 시 이연퇴직소득세는 계좌에 배정된 금액 비율로 안분한다
  const allocatedDeferredTax = useMemo(() => {
    if (!picked || !(retireTotal > 0)) return 0;
    return deferredTax * (picked.allocatedAmount / retireTotal);
  }, [picked, deferredTax, retireTotal]);

  const sim = useMemo(() => {
    if (!picked || !(picked.allocatedAmount > 0)) return null;
    return buildSchedule({
      exemptPrincipal,
      retirePrincipal: picked.allocatedAmount,
      otherPrincipal,
      deferredTax: allocatedDeferredTax,
      startLimitYear: picked.startLimitYear,
      pastCount,
      feeRate: picked.feeRate,
      years, mode, rate: rate / 100, startYear, startAge
    });
  }, [picked, exemptPrincipal, otherPrincipal, allocatedDeferredTax, pastCount, years, mode, rate, startYear, startAge]);

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
          deferredTax: deferredTax * (c.acceptAmount / retireTotal),
          startLimitYear: c.startLimitYear,
          pastCount,
          feeRate: c.feeRate,
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
  }, [candidates, retireTotal, deferredTax, pastCount, years, mode, rate, startYear, startAge]);

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
    if (!ready && tab !== 'verdict') setTab('verdict');
    else if (tab === 'compare' && comparison.length < 2) setTab('verdict');
    else if (tab === 'schedule' && !sim) setTab('verdict');
  }, [ready, tab, comparison.length, sim]);

  // 선택한 합산 범위가 더 이상 유효하지 않으면 단독으로 되돌린다
  useEffect(() => {
    if ((scope === 'pension' && !hasPension) ||
        (scope === 'irp' && !hasIrp) ||
        (scope === 'all' && !hasPension && !hasIrp)) {
      setScope('alone');
    }
  }, [scope, hasPension, hasIrp]);

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
    setSystem('DC'); setSystemJoinStr(''); setDbConverted(false); setDbJoinStr('');
    setAmtSingle(0); setAmtLegal(0); setAmtHonor(0); setDeferredTax(0);
    setHasPension(false); setPensionJoinStr(''); setPensionBal(0); setPensionExempt(0); setPensionStarted(false);
    setHasIrp(false); setIrpJoinStr(''); setIrpBal(0); setIrpExempt(0); setIrpStarted(false);
    setPastCount(0);
    setFees({ 'ex-pension': 0, 'ex-irp': 0, 'new-irp': 0, 'new-pension': 0 });
    setManualPick({}); setPickedId(null);
    setScope('alone'); setMode('even'); setYears(10); setRate(3);
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
      ['계좌 수수료(%)', (picked.feeRate * 100).toFixed(2)],
      ['작성일', TODAY_STR],
      ['상담 메모', memo.trim() || '-']
    ];
    const fn = downloadName('retirement-schedule', custName, 'csv');
    downloadBlob(fn, 'text/csv;charset=utf-8', scheduleCsv(sim.rows, meta));
    say('CSV 로 내보냈습니다 - ' + fn);
  };

  const scopeOptions = [
    { value: 'alone', label: '퇴직금 단독' },
    { value: 'pension', label: '기존 연금저축 합산', disabled: !hasPension },
    { value: 'irp', label: '기존 IRP 합산', disabled: !hasIrp },
    { value: 'all', label: '전체 전액 합산', disabled: !hasPension && !hasIrp }
  ];

  return (
    <React.Fragment>
      {/* ===================== 화면 ===================== */}
      <div className="screen-only">
        <header className="bg-mas-orange text-white">
          <div className="max-w-[1200px] mx-auto px-6 py-8 md:py-10">
            <div className="text-[12px] font-medium tracking-wider opacity-90 mb-3">[사내한] 퇴직급여 상담 도구</div>
            <h1 className="text-[34px] md:text-[44px] font-bold leading-[1.15] tracking-[-0.5px]">
              퇴직급여 수령 의사결정 시뮬레이터
            </h1>
            <p className="mt-3 text-[16px] md:text-[17px] leading-relaxed opacity-95 max-w-[760px]">
              고객 나이 · 퇴직제도 · 기존 연금계좌 가입일을 입력하면 <strong className="font-bold">신규 계좌를 개설해야 하는지,
              기존 계좌를 활용해도 되는지</strong> 판정하고 연차별 인출 한도를 시뮬레이션합니다.
            </p>
          </div>
        </header>

        <main className="max-w-[1200px] mx-auto px-6 py-10">
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

                {/* 전체 초기화 - 실수로 상담 내용을 날리지 않도록 두 번 누르게 한다 */}
                {confirmReset ? (
                  <div className="flex items-center gap-2 mb-2 px-2 py-1.5 border border-[#E8D49A] bg-[#FBF3DF] rounded-xs">
                    <span className="flex-1 text-[12px] text-[#8A6A0B] leading-snug">
                      입력한 내용이 모두 지워집니다. 저장된 상담은 남습니다.
                    </span>
                    <button type="button" onClick={doReset} aria-label="초기화 확인"
                      className="shrink-0 h-[30px] px-3 text-[12px] font-medium bg-sig-err text-white rounded-xs hover:opacity-90 transition">
                      초기화
                    </button>
                    <button type="button" onClick={() => setConfirmReset(false)} aria-label="초기화 취소"
                      className="shrink-0 h-[30px] px-3 text-[12px] text-ink-muted border border-hair bg-white rounded-xs hover:bg-surf-subtle transition">
                      취소
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmReset(true)}
                    className="w-full h-[32px] mb-2 text-[13px] text-ink-muted border border-hair rounded-xs
                               hover:bg-surf-subtle hover:text-ink transition">
                    전체 초기화
                  </button>
                )}

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

                  <div className="flex items-center gap-2 px-3 py-2 bg-surf-soft rounded-sm">
                    <span className="text-[13px] text-ink-muted">만 나이</span>
                    <span className="num text-[18px] font-bold text-mas-blue">{age !== null ? age : '-'}</span>
                    <span className="text-[13px] text-ink-muted">세</span>
                    {age !== null && (age >= 55
                      ? <Badge tone="good">연금수령 개시 가능</Badge>
                      : <Badge tone="warn">만 55세까지 {55 - age}년 - 과세이연 후 대기</Badge>)}
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
                    hint={system === 'SEV'
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
                            hint={isLegacyDate(dbJoin)
                              ? CUTOFF_LABEL + ' 이전 가입 - 신규 계좌 전액 이체 시 6년차 기산'
                              : CUTOFF_LABEL + ' 이후 가입 - 기산연차 특례 대상 아님'}>
                            <DateInput value={dbJoinStr} onChange={setDbJoinStr} label="전환 전 DB 가입일" />
                          </Field>
                        </div>
                      )}
                    </div>
                  )}

                  {system === 'SEV' ? (
                    <div className="space-y-3">
                      <Field label="법정퇴직금">
                        <MoneyInput value={amtLegal} onChange={setAmtLegal} label="법정퇴직금" />
                      </Field>
                      <Field label="명예(법정외) 퇴직금"
                        hint="근퇴법상 퇴직급여가 아니므로 만 55세 미만이어도 연금저축계좌 입금이 가능합니다."
                        help={<React.Fragment>
                          명퇴금 · 위로금 등 <strong>DB/DC 규약에 규정되지 않은</strong> 퇴직금은 제도와 연령에
                          관계없이 연금저축계좌로 입금할 수 있습니다. 반대로 법정외 퇴직금이라도
                          DB/DC 규약에 포함되어 있다면 법정퇴직금과 같은 제한을 받으므로,
                          규약 포함 여부를 먼저 확인하세요.
                        </React.Fragment>}>
                        <MoneyInput value={amtHonor} onChange={setAmtHonor} label="명예퇴직금" />
                      </Field>
                    </div>
                  ) : (
                    <Field label="퇴직급여 (단일 직접 입금)"
                      hint="DB·DC 지급액은 분할 입금 없이 단일 계좌로 이전합니다.">
                      <MoneyInput value={amtSingle} onChange={setAmtSingle} label="퇴직급여" />
                    </Field>
                  )}

                  <Field label="이연 퇴직소득세" hint="원천징수영수증 기준. 미입력 시 세액 비교는 표시되지 않습니다."
                    help={<React.Fragment>
                      퇴직급여를 연금계좌로 받으면 퇴직소득세를 떼지 않고 <strong>징수를 미뤄</strong> 둡니다.
                      나중에 연금으로 나눠 받을 때 이 세금의 일부만 내는데, 실제 연금수령 횟수에 따라
                      1~10회차 <strong>30% 감면</strong>, 11~20회차 <strong>40%</strong>,
                      21회차부터 <strong>50%</strong>가 감면됩니다.
                      (20년 초과 구간은 2025년 세법개정 신설분으로 2026.1.1 이후 연금수령분부터 적용)
                    </React.Fragment>}>
                    <MoneyInput value={deferredTax} onChange={setDeferredTax} label="이연 퇴직소득세" />
                  </Field>
                </div>
              </Section>

              <Section title="2 · 기존 보유 연금계좌">
                <div className="space-y-5">
                  {[
                    { on: hasPension, setOn: setHasPension, label: '연금저축', joinStr: pensionJoinStr, setJoin: setPensionJoinStr,
                      bal: pensionBal, setBal: setPensionBal, ex: pensionExempt, setEx: setPensionExempt,
                      started: pensionStarted, setStarted: setPensionStarted },
                    { on: hasIrp, setOn: setHasIrp, label: 'IRP', joinStr: irpJoinStr, setJoin: setIrpJoinStr,
                      bal: irpBal, setBal: setIrpBal, ex: irpExempt, setEx: setIrpExempt,
                      started: irpStarted, setStarted: setIrpStarted }
                  ].map((a) => {
                    const jd = parseDate(a.joinStr);
                    return (
                      <div key={a.label} className="border border-hair rounded-sm bg-white p-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input type="checkbox" checked={a.on} onChange={(e) => a.setOn(e.target.checked)}
                            aria-label={'기존 ' + a.label + ' 보유'} className="w-4 h-4 accent-[#F58220]" />
                          <span className="text-[15px] font-bold text-ink">기존 {a.label} 보유</span>
                          {a.on && isLegacyDate(jd) ? <Badge tone="brand">{CUTOFF_LABEL} 이전 가입</Badge> : null}
                        </label>
                        {a.on && (
                          <React.Fragment>
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="가입일"
                                help={<React.Fragment>
                                  가입일이 {CUTOFF_LABEL} 이전이면 연금수령연차를 <strong>6년차부터</strong> 기산합니다.
                                  {CUTOFF_LABEL} 전에는 연금수령 요건이 '10년 이상 가입하고 5년 이상 수령'이었기 때문에,
                                  기존 계약자가 5년만 받아도 연금소득으로 인정해 주려는 경과조치입니다.
                                  <strong> 2002년 가입과 2012년 가입은 똑같이 6년차</strong>라 가입일이 빠르다고 유리하지 않습니다.
                                </React.Fragment>}>
                                <DateInput value={a.joinStr} onChange={a.setJoin} label={'기존 ' + a.label + ' 가입일'} />
                              </Field>
                              <Field label="현재 평가액">
                                <MoneyInput value={a.bal} onChange={a.setBal} label={'기존 ' + a.label + ' 평가액'} />
                              </Field>
                              <Field label="세액공제 받지 않은 금액"
                                hint="평가액 중 과세제외 재원"
                                help={<React.Fragment>
                                  연말정산에서 세액공제를 받지 않은 납입액입니다. 인출할 때
                                  <strong> 가장 먼저 빠져나가고 세금이 전혀 없습니다</strong>(인출순서 1순위).
                                  그다음이 퇴직금, 마지막이 세액공제 받은 금액과 운용수익입니다.
                                  모르면 0 으로 두세요 - 세금이 과대 계산될 뿐 과소 계산되지 않습니다.
                                </React.Fragment>}>
                                <MoneyInput value={a.ex} onChange={a.setEx} label={'기존 ' + a.label + ' 세액공제 받지 않은 금액'} />
                              </Field>
                              <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={a.started} onChange={(e) => a.setStarted(e.target.checked)}
                                    aria-label={'기존 ' + a.label + ' 연금개시됨'} className="w-4 h-4 accent-[#F58220]" />
                                  <span className="text-[13px] font-medium text-ink-body">연금개시됨</span>
                                  <Help title="연금개시된 계좌">
                                    연금개시를 신청하면 계좌 안의 재원별 금액을 확정해 국세청에 통보하므로
                                    <strong> 원칙적으로 추가 입금이 막힙니다</strong>. 다만 당사에서 연금개시한
                                    IRP · 연금저축계좌는 <strong>퇴직금에 한해</strong> 입금할 수 있습니다.
                                    타사 계좌라면 수관이 필요한데, 연금개시된 계좌로의 계약이전은 제한되어
                                    신규 개설 후 가입일자를 승계하는 방식만 가능합니다.
                                    이미 보유한 IRP 가 연금개시된 경우는 1사 1IRP 예외사유라 추가 개설이 됩니다.
                                  </Help>
                                </label>
                              </div>
                            </div>
                            {a.ex > a.bal && (
                              <p className="text-[12px] text-sig-err mt-2 leading-snug">
                                세액공제 받지 않은 금액이 평가액보다 큽니다. 평가액까지만 반영합니다.
                              </p>
                            )}
                          </React.Fragment>
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
                  <Field label="자산 합산 범위">
                    <div className="grid grid-cols-2 gap-2">
                      {scopeOptions.map((o) => (
                        <button key={o.value} type="button" disabled={o.disabled}
                          aria-label={o.label} aria-pressed={scope === o.value}
                          onClick={() => setScope(o.value)}
                          className={
                            'h-[42px] px-2 text-[13px] font-medium border rounded-xs transition ' +
                            (o.disabled
                              ? 'bg-surf-subtle text-mas-gray border-hair cursor-not-allowed'
                              : scope === o.value
                                ? 'bg-mas-orange text-white border-mas-orange'
                                : 'bg-white text-ink-muted border-hair hover:bg-surf-subtle hover:text-ink')
                          }>
                          {o.label}
                        </button>
                      ))}
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

                  <Field label="계좌별 연간 수수료"
                    hint="적립금 대비 연 요율(운용관리+자산관리). 상품마다 다르니 실제 요율을 넣으세요. 온라인 전용 IRP는 면제인 경우가 많고, 연금저축펀드는 계좌 수수료가 없습니다.">
                    <div className="space-y-2">
                      {[
                        { id: 'ex-pension', label: '기존 연금저축', on: hasPension },
                        { id: 'ex-irp', label: '기존 IRP', on: hasIrp },
                        { id: 'new-irp', label: '신규 IRP', on: true },
                        { id: 'new-pension', label: '신규 연금저축', on: true }
                      ].filter((r) => r.on).map((r) => (
                        <div key={r.id} className="flex items-center gap-2">
                          <span className="text-[13px] text-ink-body flex-1">{r.label}</span>
                          <div className="relative w-[110px]">
                            <input type="number" min="0" max="3" step="0.01" aria-label={r.label + ' 연간 수수료'}
                              className={inputCls + ' num pr-7 text-right h-[38px]'}
                              value={fees[r.id]}
                              onChange={(e) => setFee(r.id, Math.max(0, Math.min(3, +e.target.value || 0)))} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-soft pointer-events-none">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Field>
                </div>
              </Section>
            </div>

            {/* ---------- 결과 ---------- */}
            <div>
              {/*
                결과는 상담 순서(판정 → 비교 → 인출)대로 탭으로 나눈다.
                인쇄물은 화면과 별개의 PrintSheet 가 상태에서 직접 만들기 때문에
                어느 탭을 보고 있든 항상 전체 내용이 인쇄된다.
              */}
              <div className="rule mb-3" />
              <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                <div className="flex border border-hair rounded-xs overflow-hidden bg-white">
                  {TABS.map((t, i) => {
                    const on = tab === t.id;
                    const dim = !ready || (t.id === 'compare' && comparison.length < 2) || (t.id === 'schedule' && !sim);
                    return (
                      <button key={t.id} type="button" onClick={() => setTab(t.id)} disabled={dim}
                        aria-label={t.label} aria-pressed={on}
                        className={
                          'h-[44px] px-5 text-[15px] font-medium transition ' +
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
                      'h-[44px] px-5 text-[15px] font-medium rounded-xs transition ' +
                      (ready ? 'bg-mas-orange text-white hover:bg-mas-active' : 'bg-mas-gray text-white cursor-not-allowed')
                    }>
                    A4 1장 인쇄
                  </button>
                  <button type="button" onClick={doPdf} disabled={!ready}
                    className={
                      'h-[44px] px-5 text-[15px] font-medium rounded-xs border transition ' +
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
                              <td className="px-2 py-2 text-right text-ink-muted">{(r.c.feeRate * 100).toFixed(2)}%</td>
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
                    이 차이는 세액 계산에 들어가지 않습니다. 위 추천 카드의 계좌 선택 상자에서 직접 바꾸면
                    시뮬레이션과 인쇄물에 그대로 반영됩니다.
                  </p>
                </Section>
              )}

              </div>

              <div style={{ display: tab === 'schedule' ? 'block' : 'none' }}>
              {ready && sim && (
                <Section title={'인출 시뮬레이션 - ' + picked.label}
                  right={
                    <button type="button" onClick={doCsv}
                      className="h-[38px] px-4 text-[14px] font-medium bg-white text-ink-body border border-hair rounded-xs hover:bg-surf-subtle transition">
                      CSV 내보내기
                    </button>
                  }>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <Stat label="시뮬레이션 대상 자산" value={krw(picked.allocatedAmount + otherPrincipal)} tone="brand" />
                    <Stat label={'총 인출액 (' + sim.totals.spanYears + '년)'} value={krw(sim.totals.totalDraw)} />
                    <Stat label="총 예상 세액" value={krw(sim.totals.totalTax)} tone="blue" />
                    <Stat label="세후 수령액" value={krw(sim.totals.afterTax)} tone="brand" />
                  </div>

                  {(deferredTax > 0 || sim.totals.totalFee > 0) && (
                    <div className="flex flex-wrap gap-3 mb-5">
                      {deferredTax > 0 && (
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
                          <span className="num text-[20px] font-bold text-ink ml-3">{krw(sim.totals.totalFee)}</span>
                          <div className="text-[12px] text-ink-muted mt-1">
                            연 {(picked.feeRate * 100).toFixed(2)}% · 적립금 기준 차감
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
                                  title="세액공제 받은 금액·운용수익의 연금수령분이 연 1,500만원을 넘습니다. 종합과세 또는 16.5% 분리과세를 선택해야 하며, 이 표는 분리과세 기준으로 계산했습니다.">
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
                      ② <strong>이연퇴직소득(퇴직금)</strong> - 연금수령분은 퇴직소득세를 30·40·50% 감면<br />
                      ③ <strong>세액공제 받은 납입액 + 운용수익</strong> - 연금소득세 5.5% / 70세 이상 4.4% /
                      80세 이상 3.3%, 연 1,500만원 초과 시 종합과세 또는 16.5% 분리과세 선택<br />
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
            </div>
          </div>

          <footer className="mt-4 pt-6 border-t border-hair">
            <p className="text-[12px] text-ink-soft leading-relaxed">
              본 시뮬레이션은 상담 보조용 추정치이며 실제 세액·수령액과 다를 수 있습니다.
              최종 판단은 원천징수영수증 및 금융기관 확인을 거쳐 주시기 바랍니다.
            </p>
          </footer>
        </main>
      </div>

      {/* ===================== 인쇄 (A4 1장) ===================== */}
      <PrintSheet
        ready={ready} custName={custName} birth={birth} age={age}
        system={system} systemJoin={systemJoin} retireTotal={retireTotal}
        amtLegal={amtLegal} amtHonor={amtHonor} deferredTax={deferredTax}
        candidates={candidates} best={best} picked={picked}
        allocation={allocation} isSplit={isSplit} allocatedDeferredTax={allocatedDeferredTax}
        comparison={comparison}
        memo={memo} memoOnPrint={memoOnPrint}
        scope={scope} scopeOptions={scopeOptions} mode={mode} years={years} rate={rate}
        otherPrincipal={otherPrincipal} exemptPrincipal={exemptPrincipal} sim={sim} startYear={startYear}
        hasPension={hasPension} pensionJoin={pensionJoin} pensionBal={pensionBal}
        hasIrp={hasIrp} irpJoin={irpJoin} irpBal={irpBal}
      />
    </React.Fragment>
  );
}

/* ================================================================
   6. 인쇄 시트 - A4 단면 1장 고정
   ================================================================ */

function PrintSheet(props) {
  const {
    ready, custName, birth, age, system, systemJoin, retireTotal,
    amtLegal, amtHonor, deferredTax, best, picked, scope, scopeOptions,
    allocation, isSplit, allocatedDeferredTax, comparison, memo, memoOnPrint,
    mode, years, rate, otherPrincipal, sim, startYear, exemptPrincipal,
    hasPension, pensionJoin, pensionBal, hasIrp, irpJoin, irpBal
  } = props;

  if (!ready || !picked || !sim) {
    return <div className="print-only sheet"><p>입력이 완료되면 인쇄 내용이 생성됩니다.</p></div>;
  }

  const systemLabel = system === 'SEV' ? '퇴직금제도' : system;
  const scopeLabel = (scopeOptions.find((o) => o.value === scope) || {}).label || '퇴직금 단독';
  const rows = sim.rows;

  const info = [
    ['고객명', custName || '-'],
    ['생년월일 / 만 나이', (birth ? birth.getFullYear() + '.' + (birth.getMonth() + 1) + '.' + birth.getDate() : '-') + ' / 만 ' + (age !== null ? age : '-') + '세'],
    ['퇴직제도 / 가입일', systemLabel + ' / ' + fmtDate(systemJoin)],
    ['퇴직급여 총액', krw(retireTotal) + (system === 'SEV' && amtHonor > 0 ? ' (법정 ' + krw(amtLegal) + ' · 명예 ' + krw(amtHonor) + ')' : '')],
    ['이연 퇴직소득세', deferredTax > 0
      ? krw(deferredTax) + (isSplit ? ' (이 계좌 배정분 ' + krw(allocatedDeferredTax) + ')' : '')
      : '미입력'],
    ['기존 연금저축', hasPension ? fmtDate(pensionJoin) + ' 가입 · ' + krw(pensionBal) : '없음'],
    ['기존 IRP', hasIrp ? fmtDate(irpJoin) + ' 가입 · ' + krw(irpBal) : '없음'],
    ['합산 범위 / 인출 방식', scopeLabel + ' / ' + (mode === 'max' ? '세법 한도 내 최대' : '기간 균등 분할')],
    ['수령 기간 / 운용수익률', years + '년 / 연 ' + rate.toFixed(1) + '%'],
    ['계좌 수수료 / 총 수수료', picked.feeRate > 0
      ? '연 ' + (picked.feeRate * 100).toFixed(2) + '% / ' + krw(sim.totals.totalFee)
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
  const tight = !!printMemo && rows.length > 18;
  const cellPad = tight ? '0.55mm 1mm' : '0.9mm 1mm';

  const th = { border: '0.5pt solid #CDCECB', background: '#FAB072', padding: tight ? '0.9mm 1mm' : '1.2mm 1mm', fontWeight: 700, textAlign: 'center' };
  const td = { border: '0.5pt solid #E5E4E1', padding: cellPad, textAlign: 'right' };
  const tdC = Object.assign({}, td, { textAlign: 'center' });

  return (
    <div className="print-only sheet">
      <div style={{ borderBottom: '1pt solid #F58220', paddingBottom: '1.6mm', marginBottom: '2.2mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{ fontSize: '13pt', fontWeight: 700, margin: 0, letterSpacing: '-0.3pt' }}>
            퇴직급여 수령 의사결정 결과
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
                {comparison.map((r) => {
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
                      <td style={cell}>{(r.c.feeRate * 100).toFixed(2)}%</td>
                      <td style={cell}>{r.totalFee > 0 ? man(r.totalFee) : '-'}</td>
                      <td style={cell}>{man(r.afterTax)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        사적연금 연 1,500만원 초과 수령 시 종합과세 또는 16.5% 분리과세 선택 대상입니다.
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
