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
   ================================================================ */

/**
 * 퇴직급여 재원(source)을 대상 계좌(target)에 입금·이전할 수 있는지 판정.
 * source.kind : 'LEGAL'(법정퇴직금) | 'HONOR'(명예/법정외 퇴직금) | 'DB' | 'DC'
 * target      : { type:'pension'|'irp', isNew:boolean, joinDate:Date|null }
 */
function transferBlockers(target, source, age) {
  const reasons = [];

  // (1) 만 55세 미만 - 근퇴법상 퇴직급여는 IRP 의무이전. 법정외(명예)퇴직금은 예외.
  if (target.type === 'pension' && age !== null && age < 55 && source.kind !== 'HONOR') {
    reasons.push('만 55세 미만 퇴직급여는 IRP 의무이전 대상(근퇴법 §17·§20) - 연금저축 입금 불가');
  }

  // (2) 퇴직연금(DB/DC) → 구 연금계좌 이체 제한 (소득세법 시행령 §40의4)
  //     2013.3.1 이후 설정된 퇴직연금계좌의 지급액은 2013.3.1 이전 가입 연금계좌로 이체 불가.
  //     법정퇴직금·명예퇴직금은 '연금계좌 간 이체'가 아닌 '퇴직소득 입금'이므로 제한 없음.
  if ((source.kind === 'DB' || source.kind === 'DC') && !target.isNew) {
    if (isLegacyDate(target.joinDate) && !isLegacyDate(source.joinDate)) {
      reasons.push(CUTOFF_LABEL + ' 이후 가입 ' + source.kind + ' 지급액은 ' + CUTOFF_LABEL +
        ' 이전 가입 연금계좌로 이체 불가 (소득세법 시행령 §40의4)');
    }
  }

  // (3) 기존 계좌 잔고 요건 - 잔고가 없으면 구계좌 가입일 승계 효과를 인정받을 수 없음
  if (!target.isNew && isLegacyDate(target.joinDate) && !(target.balance > 0)) {
    reasons.push('기존 계좌 잔고가 0원 - ' + CUTOFF_LABEL + ' 이전 가입 특례(6년차 기산) 적용 불가');
  }

  return reasons;
}

/** 퇴직급여 재원 구성 */
function buildSources(input) {
  const { system, systemJoin } = input;
  const sources = [];
  if (system === 'SEV') {
    if (input.amtLegal > 0) sources.push({ kind: 'LEGAL', label: '법정퇴직금', amount: input.amtLegal, joinDate: systemJoin });
    if (input.amtHonor > 0) sources.push({ kind: 'HONOR', label: '명예(법정외)퇴직금', amount: input.amtHonor, joinDate: systemJoin });
  } else {
    if (input.amtSingle > 0) sources.push({ kind: system, label: system + ' 퇴직급여', amount: input.amtSingle, joinDate: systemJoin });
  }
  return sources;
}

/** 계좌 후보 생성 및 평가 */
function buildCandidates(input, sources) {
  const { age, hasPension, pensionJoin, pensionBal, hasIrp, irpJoin, irpBal, fees } = input;

  const targets = [];
  if (hasPension) targets.push({ id: 'ex-pension', type: 'pension', isNew: false, joinDate: pensionJoin, balance: pensionBal, label: '기존 연금저축' });
  if (hasIrp) targets.push({ id: 'ex-irp', type: 'irp', isNew: false, joinDate: irpJoin, balance: irpBal, label: '기존 IRP' });
  targets.push({ id: 'new-irp', type: 'irp', isNew: true, joinDate: TODAY, balance: 0, label: '신규 IRP 개설' });
  targets.push({ id: 'new-pension', type: 'pension', isNew: true, joinDate: TODAY, balance: 0, label: '신규 연금저축 개설' });

  return targets.map((t) => {
    const perSource = sources.map((s) => {
      const blockers = transferBlockers(t, s, age);
      return { source: s, ok: blockers.length === 0, blockers };
    });
    const acceptable = perSource.filter((p) => p.ok);
    const acceptAmount = acceptable.reduce((a, p) => a + p.source.amount, 0);
    const legacy = !t.isNew && isLegacyDate(t.joinDate) && t.balance > 0;
    const startLimitYear = legacy ? 6 : 1;   // 구 연금계좌는 연금수령연차 6년차부터 기산
    const minYears = legacy ? 5 : 10;        // 한도 내 전액 인출에 필요한 최소 기간

    return {
      ...t,
      perSource,
      canAcceptAll: sources.length > 0 && acceptable.length === sources.length,
      canAcceptAny: acceptable.length > 0,
      acceptAmount,
      legacy,
      startLimitYear,
      minYears,
      feeRate: ((fees && fees[t.id]) || 0) / 100   // 입력은 %, 계산은 소수
    };
  });
}

/**
 * 계좌 우열 점수.
 *
 * 한도 기산(6년차 vs 1년차)만이 세법상 결정적 차이다. 2013.3.1 이전 가입이기만 하면
 * 되므로 가입일의 선후(2002년 vs 2003년)는 우열을 가르지 않는다 - 둘 다 6년차 기산이다.
 * 그래서 구계좌끼리는 세법상 동점이고, 그 아래는 이전 절차의 편의로만 순위를 매긴다.
 */
function accountScore(c, source) {
  let score = 0;
  if (c.legacy) score += 1000;        // 6년차 기산 - 유일한 결정적 차이
  if (!c.isNew) score += 100;         // 기존 계좌 우선 (신규는 1년차 기산)

  if (source.kind === 'DB' || source.kind === 'DC') {
    // 퇴직연금 지급액은 IRP 로 직접 이전된다. 연금저축은 퇴직급여를 수령한 뒤
    // 60일 내에 다시 납입해야 과세이연되므로(소득세법 §146) 절차상 번거롭고 기한 위험이 있다.
    if (c.type === 'irp') score += 30;
  } else {
    // 법정·명예퇴직금은 회사가 직접 지급하므로 어느 계좌든 입금할 수 있다. IRP 를 기본으로 둔다.
    if (c.type === 'irp') score += 10; else score += 8;
  }

  // 수수료. 연 0.3% 차이면 위의 이전 절차 이점(30점)과 맞먹고, 0.5% 차이면 뒤집는다.
  // 한도 기산(1000점)은 뒤집지 못한다 - 구조적 차이가 수수료보다 크기 때문.
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
    const options = candidates.filter((c) => c.perSource.some((p) => p.source.kind === s.kind && p.ok));
    if (!options.length) return { source: s, target: null, options: [], tiedWith: [], manual: false };
    const scored = options.map((c) => ({ c, score: accountScore(c, s) }));
    scored.sort((a, b) => b.score - a.score);
    const auto = scored[0].c;

    // 상담자가 투자 가능 상품·중도인출 조건 등을 보고 직접 고른 계좌가 있으면 그것을 따른다
    const forcedId = manualPick && manualPick[s.kind];
    const forced = forcedId ? options.find((c) => c.id === forcedId) : null;
    const target = forced || auto;

    // 한도 기산이 같은 기존 계좌들 = 세법상 우열 없음
    const tiedWith = scored
      .filter((x) => x.c.id !== target.id && !x.c.isNew && x.c.startLimitYear === target.startLimitYear)
      .map((x) => x.c);

    return { source: s, target, auto, options: scored.map((x) => x.c), tiedWith, manual: !!forced && forced.id !== auto.id };
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
   ================================================================ */

function buildSchedule(cfg) {
  const {
    retirePrincipal,   // 이연퇴직소득 원금
    otherPrincipal,    // 합산한 기존 자산(세액공제분 + 운용수익)
    deferredTax,       // 이연 퇴직소득세
    startLimitYear,    // 한도 연차 기산 (1 또는 6)
    pastCount,         // 과거 실제 연금수령 횟수
    feeRate,           // 계좌 연간 수수료율 (적립금 대비, 소수)
    years, mode, rate, startYear, startAge
  } = cfg;

  const fRate = feeRate || 0;

  let P = retirePrincipal;   // 퇴직소득 재원 (운용수익은 G로 분리)
  let G = otherPrincipal;    // 기타 재원 (세액공제 납입분 + 운용수익)
  const P0 = retirePrincipal;

  const rows = [];
  let totalDraw = 0, totalTax = 0, totalRetTax = 0, totalFullRetTax = 0, totalOtherTax = 0, totalFee = 0;

  for (let k = 1; k <= years; k++) {
    if (k > 1) { G += (P + G) * rate; }             // 운용수익은 기타 재원으로 귀속

    // 계좌 수수료는 매년 적립금 기준으로 차감한다.
    // 운용수익·세액공제분에서 먼저 빼고, 모자라면 퇴직소득 재원에서 뺀다
    // (이연퇴직소득세는 실제 인출한 퇴직소득분에만 비례하므로 그만큼 세액도 줄어든다).
    if (fRate > 0) {
      const fee = Math.max(0, (P + G) * fRate);
      const fromG = Math.min(fee, Math.max(0, G));
      G -= fromG;
      P = Math.max(0, P - (fee - fromG));
      totalFee += fee;
    }

    const begin = P + G;
    if (begin <= 1) break;

    const limitYear = startLimitYear + k - 1;
    const actualYear = pastCount + k;
    const unlimited = limitYear >= 11;
    const limit = unlimited ? Infinity : (begin / (11 - limitYear)) * 1.2;

    const want = mode === 'max' ? begin : begin / (years - k + 1);
    const draw = Math.max(0, Math.min(want, limit, begin));

    const drawRet = Math.min(draw, P);
    const drawG = draw - drawRet;

    // 이연퇴직소득세 감면 (소득세법 §129①5의3). 실제 연금수령연차 기준 3단계.
    // 1~10년차 70% 과세(30% 감면) / 11~20년차 60%(40% 감면) / 21년차~ 50%(50% 감면).
    // 20년 초과 구간은 2025년 세법개정으로 신설되어 2026.1.1 이후 연금수령분부터 적용된다.
    const factor = actualYear <= 10 ? 0.7 : actualYear <= 20 ? 0.6 : 0.5;
    const fullRetTax = P0 > 0 ? deferredTax * (drawRet / P0) : 0;
    const retTax = fullRetTax * factor;

    const ageK = startAge + k - 1;
    const pRate = pensionRateByAge(ageK);
    const otherTax = drawG * pRate;

    P -= drawRet; G -= drawG;

    rows.push({
      k, year: startYear + k - 1, age: ageK,
      limitYear, actualYear, unlimited,
      begin, limit, draw, monthly: draw / 12,
      reduction: actualYear <= 10 ? 0.3 : actualYear <= 20 ? 0.4 : 0.5,
      drawRet,                                   // 이 회차에 인출된 이연퇴직소득 (0이면 감면 대상 없음)
      retTax, otherTax, tax: retTax + otherTax,
      end: P + G,
      over1500: draw > 15000000
    });

    totalDraw += draw; totalTax += retTax + otherTax;
    totalRetTax += retTax; totalFullRetTax += fullRetTax; totalOtherTax += otherTax;

    if (P + G <= 1) break;
  }

  return {
    rows,
    totals: {
      totalDraw, totalTax, totalRetTax, totalOtherTax, totalFee,
      afterTax: totalDraw - totalTax,
      taxSaved: totalFullRetTax - totalRetTax,
      residual: P + G,
      spanYears: rows.length
    }
  };
}

/* ================================================================
   4. UI 프리미티브
   ================================================================ */

function Field({ label, hint, children, className = '' }) {
  return (
    <label className={'block ' + className}>
      <span className="block text-[13px] font-medium text-ink-body mb-1.5">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-ink-soft mt-1 leading-snug">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  'w-full h-[42px] px-3 border border-hair rounded-xs bg-white text-[15px] text-ink ' +
  'focus:outline-none focus:border-mas-orange focus:ring-2 focus:ring-mas-orange/25 transition';

function MoneyInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <input
        type="text" inputMode="numeric" className={inputCls + ' num pr-9 text-right'}
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
  const [amtSingle, setAmtSingle] = useState(0);
  const [amtLegal, setAmtLegal] = useState(0);
  const [amtHonor, setAmtHonor] = useState(0);
  const [deferredTax, setDeferredTax] = useState(0);

  // --- 기존 보유 계좌
  const [hasPension, setHasPension] = useState(false);
  const [pensionJoinStr, setPensionJoinStr] = useState('');
  const [pensionBal, setPensionBal] = useState(0);
  const [hasIrp, setHasIrp] = useState(false);
  const [irpJoinStr, setIrpJoinStr] = useState('');
  const [irpBal, setIrpBal] = useState(0);
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

  const birth = useMemo(() => parseBirth(birthRaw), [birthRaw]);
  const age = useMemo(() => ageOn(birth, TODAY), [birth]);

  const systemJoin = useMemo(() => parseDate(systemJoinStr), [systemJoinStr]);
  const pensionJoin = useMemo(() => parseDate(pensionJoinStr), [pensionJoinStr]);
  const irpJoin = useMemo(() => parseDate(irpJoinStr), [irpJoinStr]);

  const retireTotal = system === 'SEV' ? amtLegal + amtHonor : amtSingle;

  const input = {
    age, system, systemJoin,
    amtSingle, amtLegal, amtHonor,
    hasPension, pensionJoin, pensionBal,
    hasIrp, irpJoin, irpBal,
    fees
  };

  const sources = useMemo(() => buildSources(input), [system, systemJoinStr, amtSingle, amtLegal, amtHonor]);

  const { candidates, allocation } = useMemo(() => {
    const base = buildCandidates(input, sources);
    const alloc = buildAllocation(base, sources, manualPick);
    return { candidates: applyAllocation(base, alloc), allocation: alloc };
  }, [sources, age, hasPension, pensionJoinStr, pensionBal, hasIrp, irpJoinStr, irpBal, fees, manualPick]);

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

  // 합산 범위에 따른 기타 자산
  const otherPrincipal = useMemo(() => {
    const p = hasPension ? pensionBal : 0;
    const i = hasIrp ? irpBal : 0;
    if (scope === 'pension') return p;
    if (scope === 'irp') return i;
    if (scope === 'all') return p + i;
    return 0;
  }, [scope, hasPension, pensionBal, hasIrp, irpBal]);

  /**
   * 합산 경고 - 연금수령한도는 계좌별로 따로 산정된다.
   * 기산 연차가 다른 계좌를 합산하면 한도가 한쪽 기준으로 계산되어 부정확해진다.
   */
  const mixedBasis = useMemo(() => {
    if (!picked || scope === 'alone') return [];
    const inScope = [];
    if (hasPension && (scope === 'pension' || scope === 'all') && pensionBal > 0) {
      inScope.push({ id: 'ex-pension', label: '기존 연금저축', legacy: isLegacyDate(pensionJoin) });
    }
    if (hasIrp && (scope === 'irp' || scope === 'all') && irpBal > 0) {
      inScope.push({ id: 'ex-irp', label: '기존 IRP', legacy: isLegacyDate(irpJoin) });
    }
    return inScope.filter((a) => a.id !== picked.id && a.legacy !== picked.legacy);
  }, [picked, scope, hasPension, pensionJoinStr, pensionBal, hasIrp, irpJoinStr, irpBal]);

  // 연금 개시 시점
  const startYear = useMemo(() => {
    const retireY = TODAY.getFullYear();
    if (!birth) return retireY;
    return Math.max(retireY, birth.getFullYear() + 55);
  }, [birth]);
  const startAge = age !== null ? Math.max(age, 55) : 55;

  // 분할 입금 시 이연퇴직소득세는 계좌에 배정된 금액 비율로 안분한다
  const allocatedDeferredTax = useMemo(() => {
    if (!picked || !(retireTotal > 0)) return 0;
    return deferredTax * (picked.allocatedAmount / retireTotal);
  }, [picked, deferredTax, retireTotal]);

  const sim = useMemo(() => {
    if (!picked || !(picked.allocatedAmount > 0)) return null;
    return buildSchedule({
      retirePrincipal: picked.allocatedAmount,
      otherPrincipal,
      deferredTax: allocatedDeferredTax,
      startLimitYear: picked.startLimitYear,
      pastCount,
      feeRate: picked.feeRate,
      years, mode, rate: rate / 100, startYear, startAge
    });
  }, [picked, otherPrincipal, allocatedDeferredTax, pastCount, years, mode, rate, startYear, startAge]);

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
              <Section title="1 · 고객 및 퇴직 정보">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="고객명 (선택)">
                      <input className={inputCls} value={custName} maxLength={20}
                        onChange={(e) => setCustName(e.target.value)} placeholder="홍길동" />
                    </Field>
                    <Field label="생년월일" hint="710315 또는 19710315">
                      <input className={inputCls + ' num'} value={birthRaw} inputMode="numeric" maxLength={10}
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

                  <Field label="퇴직제도">
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
                      ? '법정퇴직금은 연금계좌 이체 제한을 받지 않습니다.'
                      : CUTOFF_LABEL + ' 이후 가입이면 구 연금계좌로 이전할 수 없습니다.'}>
                    <input type="date" className={inputCls} value={systemJoinStr}
                      onChange={(e) => setSystemJoinStr(e.target.value)} />
                  </Field>

                  {system === 'SEV' ? (
                    <div className="space-y-3">
                      <Field label="법정퇴직금">
                        <MoneyInput value={amtLegal} onChange={setAmtLegal} />
                      </Field>
                      <Field label="명예(법정외) 퇴직금"
                        hint="근퇴법상 퇴직급여가 아니므로 만 55세 미만이어도 연금저축계좌 입금이 가능합니다.">
                        <MoneyInput value={amtHonor} onChange={setAmtHonor} />
                      </Field>
                    </div>
                  ) : (
                    <Field label="퇴직급여 (단일 직접 입금)"
                      hint="DB·DC 지급액은 분할 입금 없이 단일 계좌로 이전합니다.">
                      <MoneyInput value={amtSingle} onChange={setAmtSingle} />
                    </Field>
                  )}

                  <Field label="이연 퇴직소득세" hint="원천징수영수증 기준. 미입력 시 세액 비교는 표시되지 않습니다.">
                    <MoneyInput value={deferredTax} onChange={setDeferredTax} />
                  </Field>
                </div>
              </Section>

              <Section title="2 · 기존 보유 연금계좌">
                <div className="space-y-5">
                  {[
                    { on: hasPension, setOn: setHasPension, label: '연금저축', joinStr: pensionJoinStr, setJoin: setPensionJoinStr, bal: pensionBal, setBal: setPensionBal },
                    { on: hasIrp, setOn: setHasIrp, label: 'IRP', joinStr: irpJoinStr, setJoin: setIrpJoinStr, bal: irpBal, setBal: setIrpBal }
                  ].map((a) => {
                    const jd = parseDate(a.joinStr);
                    return (
                      <div key={a.label} className="border border-hair rounded-sm bg-white p-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input type="checkbox" checked={a.on} onChange={(e) => a.setOn(e.target.checked)}
                            className="w-4 h-4 accent-[#F58220]" />
                          <span className="text-[15px] font-bold text-ink">기존 {a.label} 보유</span>
                          {a.on && isLegacyDate(jd) && a.bal > 0 ? <Badge tone="brand">{CUTOFF_LABEL} 이전 가입</Badge> : null}
                        </label>
                        {a.on && (
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="가입일">
                              <input type="date" className={inputCls} value={a.joinStr}
                                onChange={(e) => a.setJoin(e.target.value)} />
                            </Field>
                            <Field label="현재 평가액">
                              <MoneyInput value={a.bal} onChange={a.setBal} />
                            </Field>
                          </div>
                        )}
                        {a.on && isLegacyDate(jd) && !(a.bal > 0) && (
                          <p className="text-[12px] text-sig-err mt-2 leading-snug">
                            잔고가 0원이면 {CUTOFF_LABEL} 이전 가입 특례(6년차 기산)를 적용할 수 없습니다.
                          </p>
                        )}
                      </div>
                    );
                  })}

                  <Field label="과거 연금 수령 횟수"
                    hint="감면율은 '실제' 연금수령 누적 횟수 기준입니다 (10회 이하 30% · 11~20회 40% · 21회부터 50%).">
                    <input type="number" min="0" max="30" className={inputCls + ' num'} value={pastCount}
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
                      <input type="range" min="5" max="30" step="1" value={years} className="w-full"
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
                      <input type="range" min="0" max="8" step="0.5" value={rate} className="w-full"
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
                            <input type="number" min="0" max="3" step="0.01"
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
                <button type="button" onClick={() => window.print()} disabled={!ready}
                  className={
                    'h-[44px] px-5 text-[15px] font-medium rounded-xs transition ' +
                    (ready ? 'bg-mas-orange text-white hover:bg-mas-active' : 'bg-mas-gray text-white cursor-not-allowed')
                  }>
                  고객용 A4 1장 인쇄
                </button>
              </div>
              <p className="text-[12px] text-ink-soft mb-5 -mt-2">
                인쇄물에는 보고 있는 탭과 무관하게 판정 · 계좌 비교 · 인출 스케줄이 모두 담깁니다.
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
                                      {o.startLimitYear === 6 ? ' · 6년차 기산' : ' · 1년차 기산'}
                                      {o.feeRate > 0 ? ' · 연 ' + (o.feeRate * 100).toFixed(2) + '%' : ' · 수수료 없음'}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="font-bold">입금 가능한 계좌 없음</span>
                              )}
                              {a.manual
                                ? <span className="text-[12px] bg-white text-mas-active font-bold px-1.5 py-[2px] rounded-xs shrink-0">수동 선택</span>
                                : a.target && a.target.legacy
                                  ? <span className="text-[12px] bg-white/25 px-1.5 py-[1px] rounded-xs shrink-0">6년차 기산</span>
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
                          {best.legacy
                            ? CUTOFF_LABEL + ' 이전 가입 계좌에 잔고가 남아 있어 연금수령연차가 6년차부터 기산됩니다. 신규 계좌 대비 5년 빠르게 한도 제한이 해제됩니다.'
                            : '연금수령연차가 1년차부터 기산됩니다. 퇴직급여를 세액공제 납입분과 분리해 관리할 수 있습니다.'}
                        </p>
                        {allocation.some((a) => a.tiedWith && a.tiedWith.length > 0) && (
                          <div className="mt-3 pt-3 border-t border-white/30 text-[13px] leading-relaxed">
                            <strong className="font-bold">세법상 동점 안내</strong>{' · '}
                            {allocation.filter((a) => a.tiedWith && a.tiedWith.length).map((a) => (
                              <span key={a.source.kind}>
                                {[a.target.label].concat(a.tiedWith.map((t) => t.label)).join(' / ')}
                              </span>
                            ))}
                            {' 은 모두 ' + CUTOFF_LABEL + ' 이전 가입이라 한도 기산이 똑같이 6년차입니다. '}
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
                        const blocked = !c.canAcceptAny;
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
                                {c.legacy ? <Badge tone="good">6년차 기산</Badge> : null}
                                {!c.isNew && !c.legacy ? <Badge tone="neutral">1년차 기산</Badge> : null}
                                {blocked ? <Badge tone="bad">이전 불가</Badge> : null}
                              </div>
                              <span className="text-[12px] text-ink-soft whitespace-nowrap">
                                {c.isNew ? '신규' : fmtDate(c.joinDate) + ' 가입'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {c.perSource.map((p, i) => (
                                <div key={i} className="flex items-start gap-2 text-[13px] leading-snug">
                                  <span className={'font-medium shrink-0 ' + (p.ok ? 'text-sig-ok' : 'text-sig-err')}>
                                    {p.ok ? '가능' : '불가'}
                                  </span>
                                  <span className="text-ink-muted shrink-0">{p.source.label}</span>
                                  <span className="num text-ink-body shrink-0">{krw(p.source.amount)}</span>
                                  {!p.ok && <span className="text-sig-err">- {p.blockers[0]}</span>}
                                </div>
                              ))}
                              {!c.perSource.length && (
                                <div className="text-[13px] text-ink-soft">퇴직급여액을 입력해 주세요.</div>
                              )}
                            </div>
                            {!blocked && (
                              <div className="text-[12px] text-ink-soft mt-2">
                                한도 기산 <strong className="text-ink-body">{c.startLimitYear}년차</strong>부터
                                {' ('}
                                {c.isNew
                                  ? '신규 개설'
                                  : c.legacy
                                    ? fmtDate(c.joinDate) + ' 가입 · ' + CUTOFF_LABEL + ' 이전'
                                    : fmtDate(c.joinDate) + ' 가입 · ' + CUTOFF_LABEL + ' 이후'}
                                {')'}
                                {' · '}최소 권장 수령 기간 <strong className="text-ink-body">{c.minYears}년</strong>
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
                                <span className={r.c.legacy ? 'text-sig-ok font-bold' : 'text-ink-muted'}>
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
                    <strong className="text-ink-muted">한도 기산 차이는 세후 수령액이 아니라 인출 속도(유동성) 차이입니다.</strong>{' '}
                    6년차 기산은 5년 만에 한도가 풀려 급히 목돈이 필요할 때 꺼낼 수 있다는 뜻이고, 이 표의 세후 수령액은
                    선택한 수령 기간 안에서 계산한 값입니다.
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
                <Section title={'인출 시뮬레이션 - ' + picked.label}>
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
                      {mixedBasis.map((a) => a.label).join(' / ')}는 한도 기산이{' '}
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
                            <td className="px-2 py-1.5 text-right font-bold text-mas-blue">
                              {man(r.draw)}
                              <span className="text-[11px] text-ink-soft font-normal ml-1">({man(r.monthly)})</span>
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
                    단위: 만원 · 연금수령한도 = 과세기간 개시일 평가액 ÷ (11 - 연금수령연차) × 120% ·
                    {CUTOFF_LABEL} 이전 가입 연금계좌는 6년차부터 기산 ·
                    인출 순서는 이연퇴직소득 → 세액공제 납입분·운용수익 순(소득세법 시행령 §40의3) ·
                    사적연금 연 1,500만원 초과 시 종합과세 또는 16.5% 분리과세 선택 대상입니다.
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
        scope={scope} scopeOptions={scopeOptions} mode={mode} years={years} rate={rate}
        otherPrincipal={otherPrincipal} sim={sim} startYear={startYear}
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
    allocation, isSplit, allocatedDeferredTax, comparison, mode, years, rate, otherPrincipal, sim,
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
    ['대상 자산', krw(picked.allocatedAmount + otherPrincipal)],
    ['총 인출액 (' + sim.totals.spanYears + '년)', krw(sim.totals.totalDraw)],
    ['총 예상 세액', krw(sim.totals.totalTax)],
    ['세후 수령액', krw(sim.totals.afterTax)]
  ];

  const th = { border: '0.5pt solid #CDCECB', background: '#FAB072', padding: '1.2mm 1mm', fontWeight: 700, textAlign: 'center' };
  const td = { border: '0.5pt solid #E5E4E1', padding: '0.9mm 1mm', textAlign: 'right' };
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
            {a.target && a.target.legacy ? ' (6년차 기산)' : ''}
            {a.manual ? <span style={{ fontSize: '6.6pt', fontWeight: 400, marginLeft: '1mm' }}>· 상담자 수동 선택</span> : null}
          </div>
        ))}
        <div style={{ fontSize: '7pt', marginTop: '0.8mm', lineHeight: 1.35 }}>
          {picked.legacy
            ? CUTOFF_LABEL + ' 이전 가입 계좌에 잔고가 있어 연금수령연차가 6년차부터 기산됩니다. 최소 ' + picked.minYears + '년 수령으로 한도 제한이 해제됩니다.'
            : '연금수령연차가 1년차부터 기산되며, 한도 내 전액 인출에는 최소 ' + picked.minYears + '년이 필요합니다.'}
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
          )}
        </div>
      </div>

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
        연금수령한도 = 과세기간 개시일 현재 평가액 ÷ (11 - 연금수령연차) × 120%. {CUTOFF_LABEL} 이전 가입 연금계좌는 연금수령연차를 6년차부터 기산합니다.
        퇴직소득세는 실제 연금수령 1~10년차 30%, 11~20년차 40%, 21년차부터 50% 감면됩니다(소득세법 §129①5의3). 인출은 이연퇴직소득 → 세액공제 납입분·운용수익 순으로 이루어집니다(소득세법 시행령 §40의3).
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
