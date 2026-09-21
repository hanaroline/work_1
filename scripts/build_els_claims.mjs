#!/usr/bin/env node
/**
 * 주장 대장 생성 — tools/discovery/els-claims.json
 *
 *   node scripts/build_els_claims.mjs [접수번호]
 *   python3 <skill>/scripts/check_claims.py tools/discovery/els-claims.json
 *
 * 세일즈 덱에 인쇄되는 모든 수치를 한 줄씩 등록한다. 손으로 적으면 대장과 산출물이
 * 갈라지므로, 덱과 같은 분석층(lib/els-analysis.mjs)에서 뽑아 자동으로 만든다.
 *
 * 출처 구분 —
 *   공시(disclosed) : 일괄신고추가서류 원문에 그대로 적힌 값. 1차 출처.
 *   계산(computed)  : 공시 값을 입력으로 우리가 돌린 몬테카를로 결과. 1차 출처가 아니다.
 *                     덱에서도 "A. 설명서상" / "B. 시뮬레이션" 으로 갈라 표기한다.
 */
import { writeFile, readFile } from 'node:fs/promises';
import { analyze, kindOf, unitOf, perRiskOf, MC_SENS, TIER_CUT } from './lib/els-analysis.mjs';

const A = await analyze(process.argv[2]);   // 인자가 없으면 가장 최근 공시 회차 (덱과 같은 규칙)
const OUT = 'tools/discovery/els-claims.json';
const SRC = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${A.rcp}`;
const FILED = A.filedOn.replace(/\./g, '-');            // 2026.08.28 -> 2026-08-28

// 한 자료가 공시 두 건에 걸칠 수 있다(하루 늦게 시작하는 회차를 따로 낸 경우).
// 회차별 주장은 그 회차가 실린 공시를 출처로 달아야 한다 — 대표 공시 하나로
// 뭉뚱그리면 원문을 열었을 때 그 회차가 없다.
const RCP_OF = new Map(A.items.map((i) => [i.no, i.rcp || A.rcp]));
const rcpForId = (id) => {
  const m = /^[A-Z](\d{5})_/.exec(id);
  return (m && RCP_OF.get(Number(m[1]))) || A.rcp;
};
const srcFor = (id) => `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcpForId(id)}`;
const filedFor = (id) => {
  const r = rcpForId(id);
  return `${r.slice(0, 4)}-${r.slice(4, 6)}-${r.slice(6, 8)}`;
};

// 시세 이월 여부 — 이월된 자산은 백테스트(A) 꼬리가 실관측이 아니다
const w = {};
new Function('window', await readFile('data/els.js', 'utf8'))(w);
const STALE = w.ELS_DATA.history.stale || [];
const DATES = w.ELS_DATA.history.dates;

const claims = [];
const derived = [];
const add = (c) => { claims.push(c); return c.id; };

/** 공시 원문에서 그대로 옮긴 값 */
const disclosed = (id, metric, text, value, unit, printed_on, extra = {}) => add({
  id, kind: 'contract_term', metric, text, value, unit,
  series: '일괄신고추가서류 공시 원문',
  as_of: filedFor(id), tier: 1, source_url: srcFor(id),
  verdict: 'confirmed', render: 'assert', printed_on, ...extra,
});

/** 공시 값을 입력으로 우리가 계산한 값 */
const computed = (id, metric, text, value, unit, printed_on, extra = {}) => add({
  id, kind: 'model_output', metric, text, value, unit,
  series: `자체 몬테카를로 (공시 변동성·상관계수 입력, ${A.mc.paths.toLocaleString('ko-KR')} 경로, 대조변량, 시드 고정)`,
  as_of: filedFor(id), tier: 1, source_url: srcFor(id),
  verdict: 'confirmed', render: 'assert',
  note: '공시된 값이 아니라 공시 입력으로 재현 가능하게 돌린 모형 결과. 덱에서 "B. 시뮬레이션"으로 표기',
  printed_on, ...extra,
});

// ── 청약 일정 ───────────────────────────────────────────────────────────────
const ymd = (s) => Number(s.replace(/-/g, ''));
const P = A.plan;
for (const [id, text, v] of [
  ['PLAN_START', '청약 시작일', P.start],
  ['PLAN_RETAIL_END', '개인 일반투자자 청약 종료일 (숙려제도 대상)', P.retailEnd],
  ['PLAN_END', '전체 청약 종료일', P.end],
  ['PLAN_COOL_FROM', '숙려기간 시작일', P.coolingFrom],
  ['PLAN_COOL_TO', '숙려기간 종료일', P.coolingTo],
  ['PLAN_CONFIRM', '가입의사 확인기간', P.confirmBy],
  ['PLAN_ISSUE', '발행일', A.head.issueDate],
  ['PLAN_MATURITY', '만기일', A.head.maturityDate],
]) disclosed(id, '일정', text, ymd(v), 'YYYYMMDD', ['p1-cal', 'p8-step5']);

disclosed('COUNT', '건수', '이번 회차 상품 수', A.items.length, '종', ['p1-title', 'p2-title']);
disclosed('SIMYEARS_WHOLE', '검증 기간', '설명서 백테스트 검증 기간 (표지·부제에 쓰는 대표값)',
  A.head.simYearsWhole, '년', ['p2-sub', 'p6-why3', 'p7-card1'],
  { series: '발행사 수익률 모의실험 (공시 원문)',
    note: '회차마다 20.6년 등으로 조금씩 다르며 문장에는 내림한 정수를 쓴다. 표본이 짧은 회차는 표에 실제 기간을 따로 적는다' });
disclosed('FACE', '액면가액', '1증권당 액면가액 (원화 상품)', A.head.faceValue, '원', ['p2-note', 'p6-why1']);

// 등급 경계는 우리가 정한 기준이지 공시된 값이 아니다 — 그렇게 밝혀 둔다
TIER_CUT.forEach((v, i) => add({
  id: `TIER_CUT_${i}`, kind: 'methodology', metric: '등급 경계',
  text: `등급 경계 ${i === 0 ? '방어적/중간' : '중간/공격적'}`,
  value: v, unit: '%', series: '자체 기준 (손실 확률 B 로만 구분)',
  as_of: FILED, tier: 1, source_url: SRC, verdict: 'confirmed', render: 'assert',
  note: '공시된 등급이 아니라 이 자료가 서로 견주기 위해 정한 경계. 모두 원금비보장 1등급 상품이다',
  printed_on: ['p2-sub'],
}));

// ── 회차별 ─────────────────────────────────────────────────────────────────
for (const it of A.items) {
  const n = it.no;
  const cur = it.currency === 'KRW' ? '원' : unitOf(it);
  const page2 = [`p2-row-${n}`];

  disclosed(`R${n}_RATE`, '연 수익률', `제${n}회 조건 충족 시 세전 연 수익률`, it.annualRate, '%', page2);
  disclosed(`R${n}_TOTAL`, '만기 총 수익률', `제${n}회 만기까지 총 수익률`, it.totalRate, '%', []);
  disclosed(`R${n}_KI`, '낙인', `제${n}회 낙인 배리어`,
    it.knockIn == null ? 0 : it.knockIn, '%', page2,
    it.knockIn == null ? { note: '노낙인형 — 낙인 조항 없음. 표에는 숫자가 아니라 "없음"으로 인쇄' } : {});
  disclosed(`R${n}_MATBAR`, '만기 배리어', `제${n}회 만기 배리어`, it.barriers.at(-1), '%', page2);
  disclosed(`R${n}_VOL`, '적용 변동성', `제${n}회 이론가 산출에 쓴 최대 변동성`, it.vmax, '%',
    A.caution.includes(it) ? ['p6-mini'] : []);
  // 통화가 다르면 지표 이름을 나눈다. 한 지표에 두 단위를 섞으면 검산이 잡아내고,
  // 실제로 달러청약 상품의 공정가격을 "원"으로 적는 사고가 여기서 막힌다.
  disclosed(`R${n}_FV`, `공정가격(${cur})`, `제${n}회 공정가격 (액면 1만 단위)`, it.fairValue, cur, page2,
    { series: `일괄신고추가서류 공시 원문 (액면 ${it.currency === 'KRW' ? '1만원' : 'USD 10,000'} 기준)`,
      as_of: it.fairValueDate, note: it.currency === 'KRW' ? undefined : `달러청약 — 공시 원문 표기는 "USD 10,000 당 USD ${it.fairValue}". 원으로 적으면 안 된다` });
  disclosed(`R${n}_SIMLOSS`, '백테스트 손실 비중', `제${n}회 발행사 수익률 모의실험의 손실 비중 (A)`,
    it.simLoss, '%', page2,
    it.simShort ? {
      series: '발행사 수익률 모의실험 (공시 원문)',
      verdict: 'unverified', render: 'marked',
      note: `검증 표본이 ${it.simYears}년(${it.simRuns.toLocaleString('ko-KR')}회)뿐이라 20년 상품과 같은 줄에서 비교할 수 없다. 덱에서 표본 기간을 함께 인쇄한다`,
    } : { series: '발행사 수익률 모의실험 (공시 원문)' });
  disclosed(`R${n}_SIMYEARS`, '검증 기간', `제${n}회 발행사 모의실험 검증 기간`, it.simYears, '년', page2,
    { series: '발행사 수익률 모의실험 (공시 원문)' });
  if (it.rho != null) {
    disclosed(`R${n}_RHO`, '상관계수', `제${n}회 기초자산 간 최저 상관계수 (180영업일 역사적)`, it.rho, '무차원', []);
  }
  disclosed(`R${n}_FIRSTBAR`, '1차 배리어', `제${n}회 1차 조기상환 배리어`, it.barriers[0], '%', ['p4-row', 'p7-card5']);
  disclosed(`R${n}_STEPS`, '조기상환 횟수', `제${n}회 조기상환 평가 횟수`, it.steps, '회', page2);
  disclosed(`R${n}_EVERY`, '조기상환 주기', `제${n}회 조기상환 평가 주기`, it.every, '개월', page2);
  disclosed(`R${n}_SIMRUNS`, '모의실험 횟수', `제${n}회 발행사 모의실험 표본 수`, it.simRuns, '회', ['p4-row', 'p7-card1'],
    { series: '발행사 수익률 모의실험 (공시 원문)' });
  disclosed(`R${n}_SIMFIRST`, '1차 상환 비중', `제${n}회 모의실험에서 1차에 조기상환된 비중`, it.simFirst, '%', ['p4-row', 'p7-card4'],
    { series: '발행사 수익률 모의실험 (공시 원문)' });
  computed(`R${n}_MCLOSS`, '손실 확률', `제${n}회 만기 손실 확률 (B)`, +it.mcLoss.toFixed(1), '%', page2);
  computed(`R${n}_MCCI`, '손실 확률 신뢰구간', `제${n}회 손실 확률의 95% 신뢰구간 반폭`,
    +it.mcCI.toFixed(2), '%p', page2,
    { note: `경로 ${it.mcPaths.toLocaleString('ko-KR')}개, 대조변량 적용. 배치 평균으로 낸 표준오차의 1.96배` });
  // 차수별 조기상환 확률 — 합이 100 이 되는지도 검산한다
  it.mcByStep.forEach((v, k) => computed(`R${n}_STEP${k + 1}`, '조기상환 확률',
    `제${n}회 ${k + 1}차${k === it.mcByStep.length - 1 ? '(만기)' : ''} 상환 확률`,
    +v.toFixed(1), '%', k === 0 || k === it.mcByStep.length - 1 ? page2.concat('p4-bar') : ['p4-bar']));
  derived.push({
    id: `D${n}_STEPSUM`, kind: 'sum',
    terms: it.mcByStep.map((_, k) => `R${n}_STEP${k + 1}`),
    printed: 100, tolerance: 0.35,
  });
  // 추천 카드는 중간 차수를 묶어 "2~11차 20.6%" 로 적는다. 그 합계도 인쇄되는 값이다.
  if (it.mcByStep.length > 2) {
    const mid = it.mcByStep.slice(1, -1).reduce((a, c) => a + c, 0);
    computed(`R${n}_STEPMID`, '조기상환 확률', `제${n}회 2~${it.mcByStep.length - 1}차 상환 확률 합계`,
      +mid.toFixed(1), '%', ['p4-bar']);
    derived.push({
      id: `D${n}_STEPMID`, kind: 'sum',
      terms: it.mcByStep.slice(1, -1).map((_, k) => `R${n}_STEP${k + 2}`),
      printed: +mid.toFixed(1), tolerance: 0.3,
    });
  }
  if (it.mcLizard != null) {
    computed(`R${n}_LIZ`, '리자드 상환 확률', `제${n}회 리자드 조항으로 상환될 확률`,
      +it.mcLizard.toFixed(1), '%', ['p4-row', 'p4-foot']);
    disclosed(`R${n}_LIZBAR`, '리자드 배리어', `제${n}회 리자드 관찰 배리어`,
      it.lizard.barrier, '%', ['p4-row', 'p4-foot']);
  }
  // 덱은 배리어·낙인을 "기준가의 몇 %" 가 아니라 "얼마나 떨어져야 하는지" 로 바꿔 말한다.
  // 그 환산값도 인쇄되므로 대장에 둔다.
  if (it.knockIn != null) {
    disclosed(`R${n}_KIDROP`, '낙인까지 하락폭', `제${n}회 낙인에 닿기까지 필요한 하락폭`,
      100 - it.knockIn, '%', ['p4-row', 'p7-card1']);
    // 부호 있는 항을 받지 못하므로 항등식으로 검산한다 — 낙인 + 하락폭 = 100
    derived.push({ id: `D${n}_KIDROP`, kind: 'sum', terms: [`R${n}_KI`, `R${n}_KIDROP`], printed: 100, tolerance: 0.01 });
  }
  disclosed(`R${n}_MATDROP`, '만기 손실 하락폭', `제${n}회 만기에 손실이 되는 하락폭`,
    100 - it.barriers.at(-1), '%', ['p4-row', 'p7-card1']);
  derived.push({ id: `D${n}_MATDROP`, kind: 'sum', terms: [`R${n}_MATBAR`, `R${n}_MATDROP`], printed: 100, tolerance: 0.01 });
  // 덱은 손실 크기를 양수로 적는다("평균 72.8%를 잃습니다"). 대장도 같은 부호로 둔다 —
  // 부호가 다르면 역방향 대조에서 이 값이 대장에 없는 것처럼 보인다.
  computed(`R${n}_MCAVG`, '손실 시 평균 손실 크기', `제${n}회 손실이 났을 때 잃는 평균 크기`,
    +Math.abs(it.mcAvgLoss).toFixed(1), '%', ['p7-card1', 'p8-step3']);

  // 만기 총 수익률 = 연 수익률 × 만기 연수
  derived.push({
    id: `D${n}_TOTAL`, kind: 'product',
    a: `R${n}_RATE`, b: it.months / 12,
    printed: it.totalRate, tolerance: 0.05,
  });
  // 공정가 괴리 = 액면 1만 대비 변동률
  derived.push({
    id: `D${n}_GAP`, kind: 'pct_change',
    from: 10000, to: `R${n}_FV`,
    printed: it.fairValueGap, tolerance: 0.02,
  });
  // 위험 1%당 연 수익률
  derived.push({
    id: `D${n}_PERRISK`, kind: 'ratio',
    numerator: `R${n}_RATE`, denominator: `R${n}_MCLOSS`,
    printed: +(it.annualRate / +it.mcLoss.toFixed(1)).toFixed(2), tolerance: 0.01,
  });
}

// ── 3장(구조) — 추천 1순위 한 종을 차수별로 펼친다 ───────────────────────────
// 이 장은 배리어·판정일·상환금액을 차수마다 따로 인쇄한다. 표(2장)는 배리어를
// "85×3-80-75-70" 처럼 묶어 적으므로 중간 차수 값이 낱개로 나가는 곳은 여기뿐이다.
{
  const R = A.slots[0]?.pick;
  if (R) {
    const n = R.no;
    const nStep = R.barriers.length;
    const dates = [...R.schedule.map((x) => x.date), R.maturityDate];
    const pays = [...R.schedule.map((x) => x.payout), 100 + R.totalRate];

    for (let k = 0; k < nStep; k++) {
      const lbl = k === nStep - 1 ? '만기' : `${k + 1}차`;
      disclosed(`R${n}_BARSTEP${k + 1}`, '차수 배리어', `제${n}회 ${lbl} 상환 배리어`,
        R.barriers[k], '%', ['p3-col']);
      disclosed(`R${n}_DATE${k + 1}`, '일정', `제${n}회 ${lbl} 상환 판정일`, ymd(dates[k]), 'YYYYMMDD', ['p3-col']);
      disclosed(`R${n}_PAY${k + 1}`, '상환금액 비율', `제${n}회 ${lbl} 상환 시 액면 대비 지급 비율`,
        pays[k], '%', [], { note: '공시 상환금액표. 덱에는 비율이 아니라 액면 1만 단위 금액으로 인쇄한다' });
      disclosed(`R${n}_PAYAMT${k + 1}`, `상환금액(${R.currency === 'KRW' ? '원' : unitOf(R)})`,
        `제${n}회 ${lbl} 상환 시 받는 금액 (액면 1만 단위)`,
        Math.round(pays[k] * 100), R.currency === 'KRW' ? '원' : unitOf(R), ['p3-col']);
      derived.push({
        id: `D${n}_PAYAMT${k + 1}`, kind: 'product',
        a: `R${n}_PAY${k + 1}`, b: 100, printed: Math.round(pays[k] * 100), tolerance: 0.5,
      });
    }

    // 세 갈래 — 손실은 만기 차수 안에만 있다. 만기 칸을 정상상환과 손실로 다시 가른다.
    const earlySum = R.mcByStep.slice(0, -1).reduce((a, c) => a + c, 0);
    const matOk = R.mcByStep.at(-1) - R.mcLoss;
    computed(`R${n}_EARLYSUM`, '조기상환 확률', `제${n}회 1~${nStep - 1}차에 조기상환될 확률 합계`,
      +earlySum.toFixed(1), '%', ['p3-split']);
    derived.push({
      id: `D${n}_EARLYSUM`, kind: 'sum',
      terms: R.mcByStep.slice(0, -1).map((_, k) => `R${n}_STEP${k + 1}`),
      printed: +earlySum.toFixed(1), tolerance: 0.3,
    });
    computed(`R${n}_MATOK`, '조기상환 확률', `제${n}회 만기까지 가서 손실 없이 상환될 확률`,
      +matOk.toFixed(1), '%', ['p3-split'],
      { note: '만기 도달 확률에서 손실 확률을 뺀 값. 손실은 만기 차수에서만 발생한다' });
    derived.push({
      id: `D${n}_MATSPLIT`, kind: 'sum',
      terms: [`R${n}_MATOK`, `R${n}_MCLOSS`], printed: +R.mcByStep.at(-1).toFixed(1), tolerance: 0.25,
    });
    derived.push({
      id: `D${n}_SPLIT100`, kind: 'sum',
      terms: [`R${n}_EARLYSUM`, `R${n}_MATOK`, `R${n}_MCLOSS`], printed: 100, tolerance: 0.35,
    });
  }
}

// ── 5장(수익률-위험 분석) ───────────────────────────────────────────────────
// 통계량은 공시된 값이 아니라 이 회차 데이터로 우리가 잰 값이다. 출처 계열을
// 공시와 갈라 두지 않으면 "발행사가 그렇게 말했다" 로 읽힌다.
{
  const C = A.coupon;
  const pts = A.items.filter((i) => i.mcLoss != null);
  const stat = (id, metric, text, value, unit, printed_on, extra = {}) => add({
    id, kind: 'model_output', metric, text, value, unit,
    series: '이번 회차 전 종목을 대상으로 한 자체 통계 (입력: 공시 조건 + 손실 확률 B)',
    as_of: FILED, tier: 1, source_url: SRC, verdict: 'confirmed', render: 'assert',
    note: '공시된 수치가 아니라 이 자료가 이번 회차 데이터로 직접 잰 값',
    printed_on, ...extra,
  });

  const rl = C.rho.loss.all, pr = C.pairs.all;
  // 상품 수는 공시에서 세는 값이라 자체 통계 계열에 올리지 않는다 — 같은 '건수'
  // 지표가 두 계열에 걸치면 검산기가 계열 혼용으로 잡는다.
  disclosed('COUPON_N', '건수', '분석에 들어간 상품 수 (손실 확률 B 를 낸 종목)', pts.length, '종', ['p5-sub', 'p5-find1']);
  stat('COUPON_RHO', '순위상관', '연 수익률과 손실 확률(B)의 스피어만 순위상관', +rl.r.toFixed(2), '무차원', ['p5-find1']);
  if (rl.p < 0.001) {
    stat('COUPON_P_CUT', '유의수준', '순위상관 유의수준 표기 기준 (p<0.001 로 인쇄)', 0.001, '무차원', ['p5-find1'],
      { note: `실제 p=${rl.p.toExponential(2)}. 자릿수를 다 적지 않고 기준값으로 인쇄한다` });
  } else {
    stat('COUPON_P', '유의확률', '순위상관의 유의확률', +rl.p.toFixed(3), '무차원', ['p5-find1']);
  }
  stat('COUPON_PAIRS_N', '짝 수', '두 상품씩 지은 모든 짝의 수', pr.n, '쌍', ['p5-find2']);
  stat('COUPON_PAIRS_OK', '짝 수', '쿠폰이 높은 쪽이 손실 확률도 높았던 짝', pr.ok, '쌍', []);
  stat('COUPON_PAIRS_BAD', '짝 수', '쿠폰이 높은 쪽이 오히려 덜 위험했던 짝', pr.bad, '쌍', ['p5-find2']);
  stat('COUPON_PAIRS_TIE', '짝 수', '쿠폰 또는 손실 확률이 같아 가릴 수 없는 짝', pr.tie, '쌍', []);
  stat('COUPON_PAIRS_PCT', '짝 일치율', '쿠폰 순서와 위험 순서가 일치한 짝의 비율', +pr.pct.toFixed(1), '%', ['p5-find2']);
  derived.push({
    id: 'D_PAIRS_TOTAL', kind: 'sum',
    terms: ['COUPON_PAIRS_OK', 'COUPON_PAIRS_BAD', 'COUPON_PAIRS_TIE'], printed: pr.n, tolerance: 0.01,
  });
  derived.push({
    id: 'D_PAIRS_PCT', kind: 'ratio',
    numerator: 'COUPON_PAIRS_OK', denominator: 'COUPON_PAIRS_N',
    printed: +(pr.ok / pr.n).toFixed(4), tolerance: 0.0006,
  });

  // 위험당 대가 — 표(2장)에 인쇄된 소수 1자리 손실 확률로 나눈다. 덱과 같은 식이어야
  // 창구에서 표를 보고 검산했을 때 끝자리가 맞는다.
  const per = perRiskOf;
  const order = [...pts].sort((a, b) => per(b) - per(a));
  const best = order[0], worst = order.at(-1);
  stat('PERRISK_BEST', '위험당 대가', `위험당 대가가 가장 큰 제${best.no}회의 손실 확률 1%당 연 수익률`,
    +per(best).toFixed(2), '%', ['p5-find3', 'p5-foot']);
  stat('PERRISK_WORST', '위험당 대가', `위험당 대가가 가장 작은 제${worst.no}회의 손실 확률 1%당 연 수익률`,
    +per(worst).toFixed(2), '%', ['p5-find3', 'p5-foot']);
  derived.push({ id: 'D_PERRISK_BEST', kind: 'ratio', numerator: `R${best.no}_RATE`, denominator: `R${best.no}_MCLOSS`, printed: +per(best).toFixed(2), tolerance: 0.01 });
  derived.push({ id: 'D_PERRISK_WORST', kind: 'ratio', numerator: `R${worst.no}_RATE`, denominator: `R${worst.no}_MCLOSS`, printed: +per(worst).toFixed(2), tolerance: 0.01 });
  stat('PERRISK_SPREAD', '위험당 대가 배수', '위험당 대가의 최대/최소 배수', +(per(best) / per(worst)).toFixed(1), '배', ['p5-find3']);
  derived.push({
    id: 'D_PERRISK_SPREAD', kind: 'ratio',
    numerator: 'PERRISK_BEST', denominator: 'PERRISK_WORST',
    printed: +(per(best) / per(worst)).toFixed(1), tolerance: 0.06,
  });

  // 상관계수 민감도 — 결론이 공시 상관계수 한 값에 얹혀 있지 않은지 흔들어 본 값
  if (C.sens) {
    const lo = C.sens.rows.at(-1), base = C.sens.rows[0];
    disclosed('SENS_RHO_DISCLOSED', '상관계수', `민감도 확인에 쓴 제${C.sens.no}회의 공시 최저 상관계수`,
      +C.sens.disclosed.toFixed(2), '무차원', ['p5-foot']);
    stat('SENS_RHO_LOW', '가정 상관계수', '민감도 확인에서 낮춰 본 상관계수 하한', lo.rho, '무차원', ['p5-foot'],
      { note: '공시값이 아니라 우리가 가정해 넣은 값' });
    stat('SENS_LOSS_BASE', '손실 확률 (민감도)', `제${C.sens.no}회 공시 상관계수 그대로의 손실 확률 (민감도 표본)`,
      +base.loss.toFixed(1), '%', ['p5-foot'],
      { note: `민감도는 경로 ${A.mc.paths.toLocaleString('ko-KR')} 대신 ${MC_SENS.paths.toLocaleString('ko-KR')} 로 돌린 값이라 본 계산과 소수점이 조금 다르다` });
    stat('SENS_LOSS_LOW', '손실 확률 (민감도)', `제${C.sens.no}회 상관계수를 ${lo.rho} 로 낮췄을 때의 손실 확률`,
      +lo.loss.toFixed(1), '%', ['p5-foot']);
  }

  // 산점도 축 눈금 — 인쇄되는 숫자이고, 공시가 아니라 우리가 고른 눈금이다.
  const stepv = (v, u, up) => (up ? Math.ceil(v / u) : Math.floor(v / u)) * u;
  const xMax = stepv(Math.max(...pts.map((i) => +i.mcLoss.toFixed(1))), 10, true);
  const yMin = stepv(Math.min(...pts.map((i) => i.annualRate)), 5, false);
  const yMax = stepv(Math.max(...pts.map((i) => i.annualRate)), 5, true);
  const ticks = [];
  for (let v = 0; v <= xMax; v += 10) ticks.push(['X', v]);
  for (let v = yMin; v <= yMax; v += 5) ticks.push(['Y', v]);
  ticks.forEach(([ax, v], i) => add({
    id: `AXIS_${ax}_${i}`, kind: 'methodology', metric: '축 눈금',
    text: `산점도 ${ax === 'X' ? '가로(손실 확률 B)' : '세로(연 수익률)'} 축 눈금`,
    value: v, unit: '%', series: '자체 작도 (데이터 범위에서 잡은 눈금)',
    as_of: FILED, tier: 1, source_url: SRC, verdict: 'confirmed', render: 'assert',
    note: '차트가 인쇄하는 눈금 숫자. 데이터가 아니라 축 설정값이다',
    printed_on: ['p5-chart'],
  }));
}

// ── 덱에서 직접 말하는 비교값 ────────────────────────────────────────────────
const CAU = A.caution, REST = A.items.filter((i) => !CAU.includes(i));
const avg = (list, f) => list.reduce((s, i) => s + f(i), 0) / list.length;

computed('CAU_LOSS_AVG', '손실 확률', `권하지 않는 ${CAU.length}종의 평균 손실 확률`,
  +avg(CAU, (i) => i.mcLoss).toFixed(1), '%', ['p6-why2']);
computed('REST_LOSS_AVG', '손실 확률', `나머지 ${REST.length}종의 평균 손실 확률`,
  +avg(REST, (i) => i.mcLoss).toFixed(1), '%', ['p6-why2']);
derived.push({
  id: 'D_CAU_MULTIPLE', kind: 'ratio',
  numerator: 'CAU_LOSS_AVG', denominator: 'REST_LOSS_AVG',
  printed: +(avg(CAU, (i) => i.mcLoss) / avg(REST, (i) => i.mcLoss)).toFixed(1), tolerance: 0.06,
});
computed('CAU_AVGLOSS', '손실 시 평균 손실 크기', `권하지 않는 ${CAU.length}종의 평균 손실 크기`,
  +Math.abs(avg(CAU, (i) => i.mcAvgLoss)).toFixed(1), '%', ['p6-why2']);
for (const k of A.byKind) {
  computed(`KIND_${k.key}`, '손실 확률', `${k.key}형 ${k.n}종의 평균 손실 확률`,
    +k.loss.toFixed(1), '%', k.key === '지수' ? ['p4-foot'] : []);
}
// 6·7장 스크립트가 "대신 이걸 보시죠" 로 내미는 상품. 주의 종목을 뺀 나머지 중
// 수익률 1위다 — 최고 수익률 회차가 주의 종목과 겹치는 주가 있어서 그렇게 잡는다.
{
  const alt = [...REST].sort((a, b) => b.annualRate - a.annualRate)[0];
  const worst = CAU[0];
  if (alt && worst && alt.mcLoss) {
    computed('ALT_LOSS_RATIO', '손실 확률 배수',
      `권하지 않는 제${worst.no}회와 대안으로 내미는 제${alt.no}회의 손실 확률 배수`,
      +(worst.mcLoss / alt.mcLoss).toFixed(1), '배', ['p6-script', 'p7-script6']);
    derived.push({
      id: 'D_ALT_LOSS_RATIO', kind: 'ratio',
      numerator: `R${worst.no}_MCLOSS`, denominator: `R${alt.no}_MCLOSS`,
      printed: +(worst.mcLoss / alt.mcLoss).toFixed(1), tolerance: 0.06,
    });
    // 수익률 차이는 1.5%p 이상일 때만 문장에 숫자로 나간다.
    const d = Math.abs(alt.annualRate - worst.annualRate);
    if (d >= 1.5) {
      disclosed('ALT_RATE_DIFF', '수익률 차이',
        `제${alt.no}회와 제${worst.no}회의 연 수익률 차이`, +d.toFixed(1), '%p', ['p6-script', 'p7-script6']);
      derived.push({
        id: 'D_ALT_RATE_DIFF', kind: 'sum',
        terms: [`R${Math.min(alt.annualRate, worst.annualRate) === alt.annualRate ? alt.no : worst.no}_RATE`, 'ALT_RATE_DIFF'],
        printed: Math.max(alt.annualRate, worst.annualRate), tolerance: 0.06,
      });
    }
  }
}

disclosed('CAU_COUNT', '건수', '권하지 않는 상품 수', CAU.length, '종', ['p1-tag3', 'p5-chart', 'p6-title', 'p8-step4']);
disclosed('REC_COUNT', '건수', '성향별로 권하는 상품 수', A.slots.length, '종', ['p2-note', 'p4-title', 'p5-chart']);
computed('CAU_GAP_WORST', '공정가 괴리', '권하지 않는 종목 중 가장 큰 공정가 괴리(절대값, 반올림)',
  Math.abs(Math.round(Math.min(...CAU.map((c) => c.fairValueGap)))), '%', ['p6-why1'],
  { series: '일괄신고추가서류 공시 원문 (액면 1만원 기준)',
    note: '공시 공정가격에서 계산한 값. 슬라이드 제목에 반올림해 인쇄' });
disclosed('REST_FV_MIN', '공정가격(원)', `나머지 ${REST.length}종(원화 상품) 중 가장 낮은 공정가격`,
  Math.min(...REST.filter((i) => i.currency === 'KRW').map((i) => i.fairValue)), '원', ['p6-why1'],
  { series: '일괄신고추가서류 공시 원문 (액면 1만원 기준)' });

// ── 온라인 전용 여부 ────────────────────────────────────────────────────────
// 홈페이지 상품목록이 이번 회차를 아직 싣지 않으면 알 수 없다. "전부 창구 가능"
// 으로 읽히지 않도록 미확인으로 등록하고 자료에도 그렇게 적는다.
{
  // 판정 출처는 덱과 같다 — 목록 API 는 "청약 진행중" 만 돌려주므로 청약 첫날
  // 아침에는 이전 회차만 들어 있고, 화면 캡처에는 그날 회차가 먼저 들어온다.
  const rendered = await readFile('tools/discovery/rendered_list.json', 'utf8')
    .then(JSON.parse).catch(() => null);
  const fromNames = (names) => {
    const listed = new Set(), online = new Set();
    for (const nm of names) {
      const m = String(nm).match(/\(ELS\)(\d{5})(e?)\s*$/);
      if (!m) continue;
      listed.add(Number(m[1]));
      if (m[2]) online.add(Number(m[1]));
    }
    return { listed, online };
  };
  const covers = (src) => A.items.some((i) => src.listed.has(i.no));
  const screen = fromNames((rendered?.rows || []).map((r) => r.name));
  const api = fromNames(w.ELS_DATA.products.map((p2) => p2.name));
  const src = covers(screen) ? { ...screen, at: rendered.capturedAt, via: '미래에셋증권 ELS/DLS 캘린더 화면 (자체 수집)' }
    : covers(api) ? { ...api, at: w.ELS_DATA.checkedAt || w.ELS_DATA.updatedAt, via: '미래에셋증권 ELS/DLS 캘린더 목록 API (자체 수집)' }
    : { listed: new Set(), online: new Set(), at: w.ELS_DATA.checkedAt, via: null };
  const known = A.items.filter((i) => src.listed.has(i.no)).length;
  const onlineCount = A.items.filter((i) => src.online.has(i.no)).length;
  add({
    id: 'ONLINE_COVERAGE', kind: 'data_quality', metric: '온라인 전용 확인',
    text: '홈페이지에서 확인된 이번 회차 상품 수',
    value: known, unit: '종',
    series: src.via || '미래에셋증권 ELS/DLS 캘린더 (자체 수집)',
    as_of: String(src.at || '').slice(0, 10) || FILED,
    tier: 1, source_url: 'https://securities.miraeasset.com/hks/hks4022/n01.do',
    verdict: known ? 'confirmed' : 'unverified',
    render: known ? 'assert' : 'marked',
    note: known
      ? `상품명 끝의 e 로 온라인 전용을 판정했다. ${A.items.length}종 중 ${known}종이 목록에서 확인되었고 그중 ${onlineCount}종이 온라인 전용이다`
      : '수집 시점에 홈페이지가 이번 회차를 아직 싣지 않았다. 온라인 전용 여부를 단정할 수 없어 자료에 미확인으로 적는다',
    printed_on: ['p2-note', 'p8-basis'],
  });
  if (known) {
    add({
      id: 'ONLINE_COUNT', kind: 'data_quality', metric: '온라인 전용 확인',
      text: '영업점 창구 청약이 안 되는(온라인 전용) 상품 수',
      value: onlineCount, unit: '종',
      series: src.via,
      as_of: String(src.at || '').slice(0, 10) || FILED,
      tier: 1, source_url: 'https://securities.miraeasset.com/hks/hks4022/n01.do',
      verdict: 'confirmed', render: 'assert',
      note: `제${A.items.filter((i) => src.online.has(i.no)).map((i) => i.no).join('·')}회`,
      printed_on: ['p2-row', 'p4-row'],
    });
  }
}

// ── 시세 이월 (백테스트 A 의 한계) ──────────────────────────────────────────
if (STALE.length) {
  add({
    id: 'HIST_STALE', kind: 'data_quality', metric: '기초자산 시세',
    text: `과거 시세 수집에서 이월된 기초자산: ${STALE.join(', ')}`,
    value: STALE.length, unit: '종',
    series: '자체 수집 (Yahoo Finance 일별 종가)',
    as_of: String(DATES.at(-1)).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
    tier: 2, source_url: 'https://finance.yahoo.com/',
    verdict: 'unverified', render: 'marked',
    note: '수집이 짧게 돌아와 직전 종가를 이월했다. 백테스트(A)의 마지막 며칠이 실관측이 아니므로 각주로 밝힌다. 손실 확률(B)은 공시 변동성만 쓰므로 영향 없음',
    printed_on: ['p8-basis'],
  });
}

// ── 분석자료(els-analysis.html) 가 더 인쇄하는 값 ───────────────────────────
// 덱은 결론만 싣고, 분석자료는 그 결론이 어디서 나왔는지까지 펼친다. 그래서
// 자산군 평균·상관계수·회귀·민감도 표 전체가 낱개로 인쇄된다. 두 산출물이 같은
// 대장을 쓰므로 여기서 한 번만 올린다 (인쇄 위치는 h- 접두사로 구분).
{
  const C = A.coupon;
  const pts = A.items.filter((i) => i.mcLoss != null);
  const SERIES_STAT = '이번 회차 전 종목을 대상으로 한 자체 통계 (입력: 공시 조건 + 손실 확률 B)';
  const stat = (id, metric, text, value, unit, printed_on, extra = {}) => add({
    id, kind: 'model_output', metric, text, value, unit, series: SERIES_STAT,
    as_of: FILED, tier: 1, source_url: SRC, verdict: 'confirmed', render: 'assert',
    note: '공시된 수치가 아니라 이 자료가 이번 회차 데이터로 직접 잰 값',
    printed_on, ...extra,
  });
  const method = (id, metric, text, value, unit, printed_on, series, extra = {}) => add({
    id, kind: 'methodology', metric, text, value, unit, series,
    as_of: FILED, tier: 1, source_url: SRC, verdict: 'confirmed', render: 'assert',
    printed_on, ...extra,
  });

  // ① 계산 설정 — 자료가 스스로 밝히는 숫자다
  method('MC_PATHS', '자체 모의실험 경로 수', '한 상품당 만들어 본 가격 흐름의 수',
    A.mc.paths, '회', ['h-mc', 'h-basis'], '자체 계산 설정 (시드 고정, 대조변량)');
  method('MC_WINDOW', '변동성 관측 기간', '공시 이론가가 변동성·상관계수를 잰 기간',
    180, '영업일', ['h-basis'], '일괄신고추가서류 공시 원문');
  for (const [id, text, v] of [
    ['HIST_FROM', '자체 검증에 쓴 기초자산 시세 시작일', DATES[0]],
    ['HIST_TO', '자체 검증에 쓴 기초자산 시세 종료일', DATES.at(-1)],
  ]) {
    method(id, '시세 구간', text, Number(v), 'YYYYMMDD', ['h-basis'],
      '자체 수집 (Yahoo Finance 일별 종가)');
  }

  // ② 자산군별 — "종목이 섞이면 더 위험한가" 표
  for (const k of A.byKind) {
    disclosed(`KINDN_${k.key}`, '건수', `${k.key}형 상품 수`, k.n, '종', ['h-kind']);
    stat(`KINDVOL_${k.key}`, '자산군 평균 변동성', `${k.key}형 ${k.n}종의 평균 적용 변동성`,
      +k.vol.toFixed(1), '%', ['h-kind']);
    stat(`KINDRATE_${k.key}`, '자산군 평균 수익률', `${k.key}형 ${k.n}종의 평균 연 수익률`,
      +k.rate.toFixed(1), '%', ['h-kind']);
    const g = A.items.filter((i) => kindOf(i) === k.key && i.mcAvgLoss != null);
    if (g.length) {
      computed(`KINDAVGLOSS_${k.key}`, '손실 시 평균 손실 크기',
        `${k.key}형이 손실이 났을 때 잃는 평균 크기`,
        +Math.abs(g.reduce((s, i) => s + i.mcAvgLoss, 0) / g.length).toFixed(1), '%', ['h-exp']);
    }
  }
  computed('MCLOSS_AVG_ALL', '손실 확률', `이번 회차 ${pts.length}종 전체의 평균 손실 확률`,
    +A.mcAvgAll.toFixed(1), '%', ['h-card', 'h-cau', 'h-ab']);
  if (A.kindRatio != null) {
    stat('KIND_RATIO', '자산군 위험 배수', '종목형 평균 손실 확률이 지수형의 몇 배인가',
      +A.kindRatio.toFixed(1), '배', ['h-kind']);
    derived.push({
      id: 'D_KIND_RATIO', kind: 'ratio', numerator: 'KIND_종목', denominator: 'KIND_지수',
      printed: +A.kindRatio.toFixed(1), tolerance: 0.06,
    });
  }

  // ③ 쿠폰-위험 상관표 — 세 가지 관계 × (전체 / 값어치 멀쩡한 것)
  disclosed('COUPON_NFAIR', '건수', '넣는 순간의 값어치가 5% 넘게 깎이지는 않은 상품 수',
    C.nFair, '종', ['h-rho', 'h-why']);
  disclosed('COUPON_NUNFAIR', '건수', '값어치가 5% 넘게 깎인 상품 수', C.n - C.nFair, '종', ['h-why']);
  derived.push({
    id: 'D_COUPON_NSPLIT', kind: 'sum',
    terms: ['COUPON_NFAIR', 'COUPON_NUNFAIR'], printed: C.n, tolerance: 0.01,
  });
  const RHO_LABEL = { vol: '가격 출렁임(적용 변동성)', loss: '손실 확률(B)', expLoss: '손실 확률 × 손실 크기' };
  for (const key of ['vol', 'loss', 'expLoss']) {
    for (const scope of ['all', 'fair']) {
      const o = C.rho[key][scope];
      const id = `RHO_${key.toUpperCase()}_${scope.toUpperCase()}`;
      const where = `연 수익률과 ${RHO_LABEL[key]}의 순위상관 (${scope === 'all' ? `전체 ${C.n}종` : `값어치 멀쩡한 ${C.nFair}종`})`;
      // COUPON_RHO 가 이미 올린 값(loss/all)은 다시 올리지 않는다
      if (!(key === 'loss' && scope === 'all')) stat(id, '순위상관', where, +o.r.toFixed(2), '무차원', ['h-rho']);
      // 자료는 유의확률을 "우연일 확률 4.3%" 처럼 백분율로 적는다
      stat(`${id}_P`, '우연일 확률', `${where} — 우연일 확률`,
        o.p < 0.001 ? 0.1 : +(o.p * 100).toFixed(1), '%', ['h-rho'],
        o.p < 0.001 ? { note: `실제 p=${o.p.toExponential(2)}. "0.1% 미만" 으로 인쇄한다` } : {});
    }
  }
  stat('REG_R2', '설명력', '연 수익률만으로 손실 확률을 맞히는 정도 (결정계수)',
    Math.round(C.reg.r2 * 100), '%', ['h-why']);
  stat('REG_SLOPE', '회귀 기울기', '연 수익률 1%p 당 손실 확률 증가폭',
    +C.reg.slope.toFixed(2), '%p', ['h-why']);

  // ④ 짝 세기 — 값어치 멀쩡한 것만 본 경우
  stat('PAIRS_FAIR_N', '짝 수', `값어치 멀쩡한 ${C.nFair}종으로 지은 짝의 수`, C.pairs.fair.n, '쌍', ['h-pairs']);
  stat('PAIRS_FAIR_OK', '짝 수', '그중 쿠폰 순서와 위험 순서가 맞은 짝', C.pairs.fair.ok, '쌍', ['h-pairs']);
  stat('PAIRS_FAIR_PCT', '짝 일치율', '값어치 멀쩡한 상품만 본 짝 일치율',
    Math.round(C.pairs.fair.pct), '%', ['h-pairs']);
  derived.push({
    id: 'D_PAIRS_FAIR_PCT', kind: 'ratio',
    numerator: 'PAIRS_FAIR_OK', denominator: 'PAIRS_FAIR_N',
    printed: +(C.pairs.fair.ok / C.pairs.fair.n).toFixed(4), tolerance: 0.0006,
  });

  // ⑤ 위험당 대가 — 값어치 멀쩡한 것만 추린 경우와 지수형 평균
  const per = C.eff.ratio;
  stat('PERRISK_FAIRBEST', '위험당 대가', `값어치 멀쩡한 것 중 위험당 대가 1위 제${C.eff.fairBest.no}회`,
    +per(C.eff.fairBest).toFixed(2), '%', ['h-why', 'h-line']);
  stat('PERRISK_FAIRWORST', '위험당 대가', `값어치 멀쩡한 것 중 위험당 대가 꼴찌 제${C.eff.fairWorst.no}회`,
    +per(C.eff.fairWorst).toFixed(2), '%', []);
  stat('PERRISK_FAIRSPREAD', '위험당 대가 배수', '값어치 멀쩡한 상품만 본 위험당 대가 최대/최소 배수',
    +C.eff.fairSpread.toFixed(1), '배', ['h-why', 'h-line']);
  derived.push({
    id: 'D_PERRISK_FAIRSPREAD', kind: 'ratio',
    numerator: 'PERRISK_FAIRBEST', denominator: 'PERRISK_FAIRWORST',
    printed: +C.eff.fairSpread.toFixed(1), tolerance: 0.06,
  });
  if (A.idxPerRisk != null) {
    stat('IDX_PERRISK', '위험당 대가', '지수형 상품의 평균 위험당 대가',
      +A.idxPerRisk.toFixed(2), '%', ['h-rec']);
    // 종목형을 권하는 카드는 "지수형에서 같은 수익을 받으려면 위험을 몇 배 져야 하는가"
    // 를 적는다. 그 배수도 인쇄되는 값이므로 분자·분모를 대장에 두고 검산한다.
    for (const s2 of A.slots) {
      const it = s2.pick;
      if (kindOf(it) === '지수' || !perRiskOf(it)) continue;
      stat(`PERRISK_${it.no}`, '위험당 대가', `제${it.no}회의 위험당 대가`,
        +perRiskOf(it).toFixed(2), '%', ['h-rec']);
      stat(`PERRISK_VS_IDX_${it.no}`, '위험당 대가 배수',
        `제${it.no}회의 위험당 대가가 지수형 평균의 몇 배인가`,
        +(perRiskOf(it) / A.idxPerRisk).toFixed(1), '배', ['h-rec']);
      derived.push({
        id: `D${it.no}_PERRISK_VS_IDX`, kind: 'ratio',
        numerator: `PERRISK_${it.no}`, denominator: 'IDX_PERRISK',
        printed: +(perRiskOf(it) / A.idxPerRisk).toFixed(1), tolerance: 0.06,
      });
    }
  }

  // ⑥ 같은 기초자산인데 값이 갈리는 짝 (어긋나는 이유 ①)
  const T = C.why.twin || C.why.twinAny;
  if (T) {
    disclosed('TWIN_RATE_D', '수익률 차이',
      `제${T.hi.no}회와 제${T.lo.no}회의 연 수익률 차이`, +T.d.toFixed(1), '%p', ['h-why']);
    derived.push({
      id: 'D_TWIN_RATE_D', kind: 'sum',
      terms: [`R${T.lo.no}_RATE`, 'TWIN_RATE_D'], printed: +T.hi.annualRate.toFixed(1), tolerance: 0.06,
    });
    computed('TWIN_LOSS_D', '손실 확률 차이',
      `제${T.hi.no}회와 제${T.lo.no}회의 손실 확률 차이`, +T.gap.toFixed(1), '%p', ['h-why']);
    derived.push({
      id: 'D_TWIN_LOSS_D', kind: 'sum',
      terms: [`R${T.lo.no}_MCLOSS`, 'TWIN_LOSS_D'], printed: +T.hi.mcLoss.toFixed(1), tolerance: 0.11,
    });
  }

  // ⑦ 상관 민감도 표 — 덱은 양 끝만 쓰지만 분석자료는 여섯 칸을 다 인쇄한다
  if (C.sens) {
    C.sens.rows.forEach((r, k) => {
      if (r.rho != null && k < C.sens.rows.length - 1) {
        stat(`SENS_RHO_${k}`, '가정 상관계수', `민감도 ${k}번째 칸의 가정 상관계수`, r.rho, '무차원', ['h-sens'],
          { note: '공시값이 아니라 우리가 가정해 넣은 값' });
      }
      if (k > 0 && k < C.sens.rows.length - 1) {
        stat(`SENS_LOSS_${k}`, '손실 확률 (민감도)',
          `제${C.sens.no}회 상관계수 ${r.rho} 가정 시 손실 확률`, +r.loss.toFixed(1), '%', ['h-sens']);
      }
      stat(`SENS_RATIO_${k}`, '위험당 대가 (민감도)',
        `제${C.sens.no}회 ${r.rho == null ? '공시 상관계수' : `상관계수 ${r.rho}`} 가정 시 위험당 대가`,
        +r.ratio.toFixed(2), '%', ['h-sens']);
    });
    stat('SENS_VOLSPREAD', '변동성 차이', `제${C.sens.no}회 두 기초자산의 적용 변동성 차이`,
      +C.sens.volSpread.toFixed(1), '%p', ['h-sens']);
  }

  // ⑧ 회차별로 분석자료에만 나가는 값
  for (const it of A.items) {
    const n = it.no;
    if (it.simWin != null) {
      disclosed(`R${n}_SIMWIN`, '백테스트 이익 비중', `제${n}회 발행사 모의실험에서 이익으로 끝난 비중 (A)`,
        it.simWin, '%', ['h-card'], { series: '발행사 수익률 모의실험 (공시 원문)' });
      derived.push({
        id: `D${n}_SIMWIN`, kind: 'sum',
        terms: [`R${n}_SIMLOSS`, `R${n}_SIMWIN`], printed: 100, tolerance: 0.01,
      });
    }
    if (it.covYears != null) {
      method(`R${n}_COVYEARS`, '자체 검증 기간', `제${n}회 기초자산 시세가 겹치는 기간`,
        it.covYears, '년', ['h-card'], '자체 수집 (Yahoo Finance 일별 종가)');
    }
    if (it.low != null) {
      computed(`R${n}_LOW`, '과거 최저 수준', `제${n}회 기초자산이 검증 기간에 닿은 최저 수준 (기준가 대비)`,
        Math.round(it.low), '%', ['h-card'],
        { series: '자체 수집 (Yahoo Finance 일별 종가)', as_of: String(DATES.at(-1)).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') });
    }
    if (it.margin != null && it.margin < 0) {
      computed(`R${n}_MARGIN`, '낙인 돌파폭', `제${n}회가 검증 기간에 낙인을 뚫고 내려간 폭`,
        +Math.abs(it.margin).toFixed(1), '%p', ['h-cau'],
        { series: '자체 수집 (Yahoo Finance 일별 종가)', as_of: String(DATES.at(-1)).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') });
    }
    // 기초자산 하나하나의 변동성 — 표는 최대값만 싣지만 본문은 자산별로 적는다
    for (const v of it.volatility || []) {
      disclosed(`R${n}_VOL_${String(v.asset).replace(/\s+/g, '')}`, '기초자산 변동성',
        `제${n}회 ${v.asset}의 적용 변동성`, v.vol, '%', ['h-vol']);
    }
  }
  // 추천 카드는 "1만원 → 빠르면 6개월 뒤 10,800원" 으로 첫 상환금액을 적는다
  for (const s of A.slots) {
    const R = s.pick, n = R.no;
    if (!R.schedule?.length || claims.some((c) => c.id === `R${n}_PAYAMT1`)) continue;
    const unit = R.currency === 'KRW' ? '원' : unitOf(R);
    disclosed(`R${n}_PAY1`, '상환금액 비율', `제${n}회 1차 상환 시 액면 대비 지급 비율`,
      R.schedule[0].payout, '%', []);
    disclosed(`R${n}_PAYAMT1`, `상환금액(${unit})`, `제${n}회 1차 상환 시 받는 금액 (액면 1만 단위)`,
      Math.round(R.schedule[0].payout * 100), unit, ['h-card']);
    derived.push({
      id: `D${n}_PAYAMT1`, kind: 'product',
      a: `R${n}_PAY1`, b: 100, printed: Math.round(R.schedule[0].payout * 100), tolerance: 0.5,
    });
  }
}

const ledger = {
  deliverable: `제${A.items[0].no}~${A.items.at(-1).no}회 ELS 세일즈 제안서 (8p PPT) + 분석자료 (HTML/PDF)`,
  as_of: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10),
  series_policy: {
    '연 수익률': '일괄신고추가서류 공시 원문',
    '공정가격(원)': '일괄신고추가서류 공시 원문 (액면 1만원 기준)',
    '공정가격(달러)': '일괄신고추가서류 공시 원문 (액면 USD 10,000 기준)',
    '백테스트 손실 비중': '발행사 수익률 모의실험 (공시 원문)',
    '손실 확률': `자체 몬테카를로 (공시 변동성·상관계수 입력, ${A.mc.paths.toLocaleString('ko-KR')} 경로, 대조변량, 시드 고정)`,
  },
  unit_policy: {
    '연 수익률': '%', '만기 총 수익률': '%', '손실 확률': '%',
    '낙인': '%', '만기 배리어': '%', '적용 변동성': '%', '백테스트 손실 비중': '%',
    '검증 기간': '년', '상관계수': '무차원', '일정': 'YYYYMMDD', '건수': '종',
    '1차 배리어': '%', '조기상환 횟수': '회', '조기상환 주기': '개월',
    '조기상환 확률': '%', '리자드 상환 확률': '%', '손실 확률 신뢰구간': '%p', '리자드 배리어': '%',
    '온라인 전용 확인': '종',
    '낙인까지 하락폭': '%', '만기 손실 하락폭': '%', '액면가액': '원', '공정가 괴리': '%',
    '손실 시 평균 손실 크기': '%',
    '모의실험 횟수': '회', '1차 상환 비중': '%', '등급 경계': '%',
    '공정가격(원)': '원', '공정가격(달러)': '달러', '기초자산 시세': '종',
    // 3장(구조)·5장(수익률-위험 분석)에서 새로 인쇄하는 지표
    '차수 배리어': '%', '상환금액 비율': '%', '상환금액(원)': '원', '상환금액(달러)': '달러',
    '순위상관': '무차원', '유의수준': '무차원', '유의확률': '무차원',
    '짝 수': '쌍', '짝 일치율': '%', '위험당 대가': '%', '위험당 대가 배수': '배', '손실 확률 배수': '배', '축 눈금': '%',
    '가정 상관계수': '무차원', '손실 확률 (민감도)': '%', '수익률 차이': '%p',
    // 분석자료(HTML)에서만 인쇄하는 지표
    '자체 모의실험 경로 수': '회', '변동성 관측 기간': '영업일', '시세 구간': 'YYYYMMDD',
    '자산군 평균 변동성': '%', '자산군 평균 수익률': '%', '자산군 위험 배수': '배',
    '우연일 확률': '%', '설명력': '%', '회귀 기울기': '%p', '손실 확률 차이': '%p',
    '위험당 대가 (민감도)': '%', '변동성 차이': '%p', '백테스트 이익 비중': '%',
    '자체 검증 기간': '년', '과거 최저 수준': '%', '낙인 돌파폭': '%p', '기초자산 변동성': '%',
  },
  claims, derived,
};

await writeFile(OUT, JSON.stringify(ledger, null, 2));
console.log(`${OUT} — 주장 ${claims.length}건 / 파생 검산 ${derived.length}건`);
