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
import { analyze, unitOf, TIER_CUT } from './lib/els-analysis.mjs';

const A = await analyze(process.argv[2] || '20260828000836');
const OUT = 'tools/discovery/els-claims.json';
const SRC = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${A.rcp}`;
const FILED = A.filedOn.replace(/\./g, '-');            // 2026.08.28 -> 2026-08-28

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
  as_of: FILED, tier: 1, source_url: SRC,
  verdict: 'confirmed', render: 'assert', printed_on, ...extra,
});

/** 공시 값을 입력으로 우리가 계산한 값 */
const computed = (id, metric, text, value, unit, printed_on, extra = {}) => add({
  id, kind: 'model_output', metric, text, value, unit,
  series: `자체 몬테카를로 (공시 변동성·상관계수 입력, ${A.mc.paths.toLocaleString('ko-KR')} 경로, 대조변량, 시드 고정)`,
  as_of: FILED, tier: 1, source_url: SRC,
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
]) disclosed(id, '일정', text, ymd(v), 'YYYYMMDD', ['p1-cal', 'p6-step5']);

disclosed('COUNT', '건수', '이번 회차 상품 수', A.items.length, '종', ['p1-title', 'p2-title']);
disclosed('FACE', '액면가액', '1증권당 액면가액 (원화 상품)', A.head.faceValue, '원', ['p2-note', 'p4-why1']);

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
    A.caution.includes(it) ? ['p4-mini'] : []);
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
  disclosed(`R${n}_SIMYEARS`, '검증 기간', `제${n}회 발행사 모의실험 검증 기간`, it.simYears, '년', page2);
  if (it.rho != null) {
    disclosed(`R${n}_RHO`, '상관계수', `제${n}회 기초자산 간 최저 상관계수 (180영업일 역사적)`, it.rho, '무차원', []);
  }
  disclosed(`R${n}_FIRSTBAR`, '1차 배리어', `제${n}회 1차 조기상환 배리어`, it.barriers[0], '%', ['p3-row', 'p5-card5']);
  disclosed(`R${n}_STEPS`, '조기상환 횟수', `제${n}회 조기상환 평가 횟수`, it.steps, '회', page2);
  disclosed(`R${n}_EVERY`, '조기상환 주기', `제${n}회 조기상환 평가 주기`, it.every, '개월', page2);
  disclosed(`R${n}_SIMRUNS`, '모의실험 횟수', `제${n}회 발행사 모의실험 표본 수`, it.simRuns, '회', ['p3-row', 'p5-card1'],
    { series: '발행사 수익률 모의실험 (공시 원문)' });
  disclosed(`R${n}_SIMFIRST`, '1차 상환 비중', `제${n}회 모의실험에서 1차에 조기상환된 비중`, it.simFirst, '%', ['p3-row', 'p5-card4'],
    { series: '발행사 수익률 모의실험 (공시 원문)' });
  computed(`R${n}_MCLOSS`, '손실 확률', `제${n}회 만기 손실 확률 (B)`, +it.mcLoss.toFixed(1), '%', page2);
  computed(`R${n}_MCCI`, '손실 확률 신뢰구간', `제${n}회 손실 확률의 95% 신뢰구간 반폭`,
    +it.mcCI.toFixed(2), '%p', page2,
    { note: `경로 ${it.mcPaths.toLocaleString('ko-KR')}개, 대조변량 적용. 배치 평균으로 낸 표준오차의 1.96배` });
  // 차수별 조기상환 확률 — 합이 100 이 되는지도 검산한다
  it.mcByStep.forEach((v, k) => computed(`R${n}_STEP${k + 1}`, '조기상환 확률',
    `제${n}회 ${k + 1}차${k === it.mcByStep.length - 1 ? '(만기)' : ''} 상환 확률`,
    +v.toFixed(1), '%', k === 0 || k === it.mcByStep.length - 1 ? page2.concat('p3-bar') : ['p3-bar']));
  derived.push({
    id: `D${n}_STEPSUM`, kind: 'sum',
    terms: it.mcByStep.map((_, k) => `R${n}_STEP${k + 1}`),
    printed: 100, tolerance: 0.35,
  });
  // 추천 카드는 중간 차수를 묶어 "2~11차 20.6%" 로 적는다. 그 합계도 인쇄되는 값이다.
  if (it.mcByStep.length > 2) {
    const mid = it.mcByStep.slice(1, -1).reduce((a, c) => a + c, 0);
    computed(`R${n}_STEPMID`, '조기상환 확률', `제${n}회 2~${it.mcByStep.length - 1}차 상환 확률 합계`,
      +mid.toFixed(1), '%', ['p3-bar']);
    derived.push({
      id: `D${n}_STEPMID`, kind: 'sum',
      terms: it.mcByStep.slice(1, -1).map((_, k) => `R${n}_STEP${k + 2}`),
      printed: +mid.toFixed(1), tolerance: 0.3,
    });
  }
  if (it.mcLizard != null) {
    computed(`R${n}_LIZ`, '리자드 상환 확률', `제${n}회 리자드 조항으로 상환될 확률`,
      +it.mcLizard.toFixed(1), '%', ['p3-row', 'p3-foot']);
    disclosed(`R${n}_LIZBAR`, '리자드 배리어', `제${n}회 리자드 관찰 배리어`,
      it.lizard.barrier, '%', ['p3-row', 'p3-foot']);
  }
  // 덱은 배리어·낙인을 "기준가의 몇 %" 가 아니라 "얼마나 떨어져야 하는지" 로 바꿔 말한다.
  // 그 환산값도 인쇄되므로 대장에 둔다.
  if (it.knockIn != null) {
    disclosed(`R${n}_KIDROP`, '낙인까지 하락폭', `제${n}회 낙인에 닿기까지 필요한 하락폭`,
      100 - it.knockIn, '%', ['p3-row', 'p5-card1']);
    // 부호 있는 항을 받지 못하므로 항등식으로 검산한다 — 낙인 + 하락폭 = 100
    derived.push({ id: `D${n}_KIDROP`, kind: 'sum', terms: [`R${n}_KI`, `R${n}_KIDROP`], printed: 100, tolerance: 0.01 });
  }
  disclosed(`R${n}_MATDROP`, '만기 손실 하락폭', `제${n}회 만기에 손실이 되는 하락폭`,
    100 - it.barriers.at(-1), '%', ['p3-row', 'p5-card1']);
  derived.push({ id: `D${n}_MATDROP`, kind: 'sum', terms: [`R${n}_MATBAR`, `R${n}_MATDROP`], printed: 100, tolerance: 0.01 });
  // 덱은 손실 크기를 양수로 적는다("평균 72.8%를 잃습니다"). 대장도 같은 부호로 둔다 —
  // 부호가 다르면 역방향 대조에서 이 값이 대장에 없는 것처럼 보인다.
  computed(`R${n}_MCAVG`, '손실 시 평균 손실 크기', `제${n}회 손실이 났을 때 잃는 평균 크기`,
    +Math.abs(it.mcAvgLoss).toFixed(1), '%', ['p5-card1', 'p6-step3']);

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

// ── 덱에서 직접 말하는 비교값 ────────────────────────────────────────────────
const CAU = A.caution, REST = A.items.filter((i) => !CAU.includes(i));
const avg = (list, f) => list.reduce((s, i) => s + f(i), 0) / list.length;

computed('CAU_LOSS_AVG', '손실 확률', `권하지 않는 ${CAU.length}종의 평균 손실 확률`,
  +avg(CAU, (i) => i.mcLoss).toFixed(1), '%', ['p4-why2']);
computed('REST_LOSS_AVG', '손실 확률', `나머지 ${REST.length}종의 평균 손실 확률`,
  +avg(REST, (i) => i.mcLoss).toFixed(1), '%', ['p4-why2']);
derived.push({
  id: 'D_CAU_MULTIPLE', kind: 'ratio',
  numerator: 'CAU_LOSS_AVG', denominator: 'REST_LOSS_AVG',
  printed: +(avg(CAU, (i) => i.mcLoss) / avg(REST, (i) => i.mcLoss)).toFixed(1), tolerance: 0.06,
});
computed('CAU_AVGLOSS', '손실 시 평균 손실 크기', `권하지 않는 ${CAU.length}종의 평균 손실 크기`,
  +Math.abs(avg(CAU, (i) => i.mcAvgLoss)).toFixed(1), '%', ['p4-why2']);
for (const k of A.byKind) {
  computed(`KIND_${k.key}`, '손실 확률', `${k.key}형 ${k.n}종의 평균 손실 확률`,
    +k.loss.toFixed(1), '%', k.key === '지수' ? ['p3-foot'] : []);
}
disclosed('CAU_COUNT', '건수', '권하지 않는 상품 수', CAU.length, '종', ['p1-tag3', 'p4-title', 'p6-step4']);
computed('CAU_GAP_WORST', '공정가 괴리', '권하지 않는 종목 중 가장 큰 공정가 괴리(절대값, 반올림)',
  Math.abs(Math.round(Math.min(...CAU.map((c) => c.fairValueGap)))), '%', ['p4-why1'],
  { series: '일괄신고추가서류 공시 원문 (액면 1만원 기준)',
    note: '공시 공정가격에서 계산한 값. 슬라이드 제목에 반올림해 인쇄' });
disclosed('REST_FV_MIN', '공정가격(원)', `나머지 ${REST.length}종(원화 상품) 중 가장 낮은 공정가격`,
  Math.min(...REST.filter((i) => i.currency === 'KRW').map((i) => i.fairValue)), '원', ['p4-why1'],
  { series: '일괄신고추가서류 공시 원문 (액면 1만원 기준)' });

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
    printed_on: ['p6-basis'],
  });
}

const ledger = {
  deliverable: `제${A.items[0].no}~${A.items.at(-1).no}회 ELS 세일즈 제안서 (6p PPT)`,
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
    '낙인까지 하락폭': '%', '만기 손실 하락폭': '%', '액면가액': '원', '공정가 괴리': '%',
    '손실 시 평균 손실 크기': '%',
    '모의실험 횟수': '회', '1차 상환 비중': '%', '등급 경계': '%',
    '공정가격(원)': '원', '공정가격(달러)': '달러', '기초자산 시세': '종',
  },
  claims, derived,
};

await writeFile(OUT, JSON.stringify(ledger, null, 2));
console.log(`${OUT} — 주장 ${claims.length}건 / 파생 검산 ${derived.length}건`);
