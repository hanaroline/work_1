#!/usr/bin/env node
/**
 * tools/discovery/prospectus_parsed.json  ->  data/els-prospectus.js
 *
 * DART 일괄신고추가서류에서 파싱한 회차별 투자설명서 내용을
 * 완전판매 스크립트가 읽는 필드 형태로 변환한다.
 *
 * 파이프라인
 *   scripts/fetch_prospectus.mjs   DART 공시 원문 수집  -> tools/discovery/prospectus_<접수번호>.txt
 *   scripts/parse_prospectus.mjs   회차별 조건 파싱      -> tools/discovery/prospectus_parsed.json
 *   scripts/build_els_prospectus.mjs (이 파일)          -> data/els-prospectus.js
 *
 * 매칭 기준은 회차 번호다. data/els.js 의 상품명("미래에셋증권(ELS)38062e")에서
 * 회차를 뽑아 투자설명서 항목의 no 와 맞춘다. 상품코드(ISIN)는 공시 원문에 없다.
 *
 * ★ 이 변환기는 값을 만들어내지 않는다 ★
 *   원문에 없는 값은 null 로 남겨 화면에서 「확인필요」로 표시되게 한다.
 *   계산으로 확정되는 값(평가일 → 경과개월, 기초자산 소재지 → 중도상환 가격평가일)만
 *   유도하고, 유도 근거를 derivedFrom 에 남긴다.
 *
 * 사용: node scripts/build_els_prospectus.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const PARSED = 'tools/discovery/prospectus_parsed.json';
const ELS_DATA = 'data/els.js';
const OUT = 'data/els-prospectus.js';

/* ── 유틸 ─────────────────────────────────────────────── */
const kdate = (iso) => {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[1]}년 ${+m[2]}월 ${+m[3]}일` : null;
};
/**
 * 두 날짜 사이 개월 수.
 * ELS 조기상환평가일은 3개월 간격이지만 영업일에 맞춰 며칠씩 앞당겨진다
 * (예: 발행 2026-09-03 -> 1차 평가 2026-11-30 = 88일 = 3개월).
 * 달 번호 차이로 세면 2개월로 나오므로 일수를 평균 월길이로 나눠 반올림한다.
 */
const monthsBetween = (fromIso, toIso) => {
  if (!fromIso || !toIso) return null;
  const a = new Date(fromIso + 'T00:00:00Z'), b = new Date(toIso + 'T00:00:00Z');
  if (isNaN(a) || isNaN(b)) return null;
  const days = (b - a) / 86400000;
  if (days < 0) return null;
  return Math.round(days / 30.4375);
};
const pct = (v) => (v == null ? null : `${v}%`);

/** 기초자산 소재지 — 중도상환 가격평가일 문구가 갈린다 */
const NON_ASIA = /S&P|EURO|STOXX|NASDAQ|DOW|Micron|Applied|Broadcom|Tesla|Palantir|마이크론|어플라이드|브로드컴|테슬라|팔란티어|NVIDIA|엔비디아/i;
const isAsiaOnly = (unders) => !(unders || []).some((u) => NON_ASIA.test(u));

/**
 * 상품 종류 — 제목에서 읽는다.
 * 파생결합사채는 종류 자체가 원금지급형이다 (ELB / DLB).
 *   "제4058회 파생결합사채(주가연계파생결합사채)(낮은위험)" -> ELB
 */
function kindOf(title) {
  if (/파생결합사채/.test(title)) return /주가연계/.test(title) ? 'ELB' : 'DLB';
  if (/주가연계증권/.test(title)) return /원금지급|원금보장/.test(title) ? 'ELB' : 'ELS';
  if (/기타파생결합증권|파생결합증권/.test(title)) return /원금지급|원금보장/.test(title) ? 'DLB' : 'DLS';
  return null;
}

/**
 * 위험등급 ↔ 등급명.
 * 투자설명서가 "1등급(매우높은위험)에서 6등급(매우낮은위험)까지 6단계" 라고 밝히는 1:1 대응이다.
 * 제목 표기가 회차마다 달라 한쪽만 있는 경우가 있다 (제4051회는 등급 숫자가 없고,
 * 제36998회류는 등급명이 없다). 있는 쪽에서 없는 쪽을 채운다.
 */
const GRADE_LABEL = ['매우높은위험', '높은위험', '다소높은위험', '보통위험', '낮은위험', '매우낮은위험'];
const labelOfGrade = (g) => (g >= 1 && g <= 6 ? GRADE_LABEL[g - 1] : null);
const gradeOfLabel = (l) => { const i = GRADE_LABEL.indexOf(l); return i >= 0 ? i + 1 : null; };

/** 월수익지급 조항 — 월지급식 상품의 핵심 문구 */
function monthlyNote(it) {
  const m = it.monthlyIncome;
  if (!m) return null;
  let s = `이 상품은 월지급식으로, 매월 월수익지급평가일에 모든 기초자산의 평가가격이 각 최초기준가격의 ${m.barrier}% 이상이면 원금의 ${m.rate}% 를 그 달의 수익으로 지급합니다`;
  if (m.count) s += ` (총 ${m.count}회 평가)`;
  s += `. 조건을 충족하지 못한 달에는 그 달의 수익이 지급되지 않으며, 미지급분은 이후에 소급하여 지급되지 않습니다`;
  if (m.payRule) s += `. 지급일은 ${m.payRule}`;
  return s + '.';
}

/**
 * 손실 발생 상황 및 손실 추정액 — 문서에 있는 조건만으로 구성한다.
 *
 * 낙인형·노낙인형·리자드형·원금지급형이 각각 손실이 나는 조건이 다르다.
 * 낙인이 없는 회차(제38071·38074회 등 8개)를 「낙인 없음」이라는 이유로 빈칸으로 두면
 * 상담에서 손실조건 설명이 통째로 빠진다. 노낙인형은 만기 배리어가 유일한 손실조건이므로
 * 그것으로 문구를 만든다.
 */
function lossExample(it) {
  const unders = (it.underlyings || []).join(', ');
  const sim = () => (it.simLoss != null && it.simRuns
    ? `\n발행사 수익률 모의실험(${it.simRange ? it.simRange.from + '~' + it.simRange.to : ''} 과거 데이터 ${it.simRuns.toLocaleString()}회) 기준 만기 손실 발생 비율은 ${it.simLoss}% 입니다.`
    : '');
  const lizard = () => (it.lizard
    ? ` 아울러 ${it.lizard.step}차 자동조기상환평가일까지 기초자산이 각 최초기준가격의 ${it.lizard.barrier}% 미만으로 하락한 적이 없으면 액면금액의 ${it.lizard.payout}% 로 상환됩니다(리자드 조항).`
    : '');

  /* 원금지급형(ELB·DLB) — 만기 보유 시 손실이 없다. 중도상환 손실만 남는다 */
  if (it.principalProtected) {
    return '이 상품은 원금지급형(파생결합사채)으로 만기까지 보유하시면 투자원금은 지급됩니다. '
      + '다만 만기 전 중도상환을 신청하시는 경우 상환금액이 공정가액을 기준으로 산정되고 중도상환비용이 차감되므로 투자원금에 미달할 수 있으며, '
      + '발행사인 미래에셋증권의 신용위험(파산·지급불능 등)이 발생하면 원금을 돌려받지 못할 수 있습니다.'
      + sim();
  }
  if (it.maturityBarrier == null) return null;

  /* 낙인형 — 관찰기간 중 낙인 터치 + 만기 배리어 미달이 손실 조건 */
  if (it.knockIn != null) {
    return `만기평가일에 모든 기초자산(${unders}) 중 어느 하나라도 `
      + `${it.knockInBasis === '종가' ? '종가기준으로 ' : ''}각 최초기준가격의 ${it.knockIn}% 미만으로 하락한 적이 있고, `
      + `만기평가가격이 각 최초기준가격의 ${it.maturityBarrier}% 미만인 경우, `
      + `하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.`
      + lizard() + sim();
  }

  /* 노낙인형 — 만기 배리어가 유일한 손실 조건 */
  return `이 상품은 낙인(원금손실 발생) 조건이 없어 투자기간 중 기초자산 가격이 얼마나 하락하더라도 그 자체로는 손실이 확정되지 않습니다. `
    + `다만 만기평가일에 모든 기초자산(${unders}) 중 어느 하나라도 만기평가가격이 각 최초기준가격의 ${it.maturityBarrier}% 미만인 경우, `
    + `하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.`
    + lizard() + sim();
}

/**
 * 위험등급 유의사항 — 투자설명서의 「목표시장 설정 및 설정 근거」 블록에서 만든다.
 *
 * 여태 이 항목은 사내 핵심(요약)설명서 문구를 사람이 넣어야 하는 공용 항목이라
 * 1등급 회차마다 「확인필요」 1건으로 남았다. 그런데 같은 내용(어떤 위험추구성향·
 * 손실감내능력·투자기간의 투자자를 대상으로 하는 상품인지)이 회차별 투자설명서 안에
 * 표로 들어 있다. 그 표를 그대로 문장으로 옮긴다 — 없는 말을 만들지 않는다.
 *
 * 스크립트 문맥: "유의사항으로 1등급 매우높은위험은 {{riskGradeNote}}"
 */
function riskGradeNote(it) {
  const tm = it.targetMarket;
  if (!tm || !tm.appetiteDetail) return null;
  const a = tm.appetiteDetail;

  const cond = [];
  if ((tm.lossTolerance || []).length) {
    cond.push((tm.lossTolerance || []).join('·').replace('원금대비', '원금 대비') + '가 가능하고');
  }
  if ((tm.knowledge || []).length) cond.push(`투자에 대한 지식과 경험이 ${tm.knowledge.join('·')} 수준이며`);
  if ((tm.horizon || []).length) cond.push(`투자기간을 ${tm.horizon.join('·')}로 고려하는`);

  let s = `${a.name}(투자성향 ${a.profile}, 상품위험등급 ${a.grades}) 투자자를 목표시장으로 하는 상품으로서, `;
  s += cond.length ? `${cond.join(' ')} 투자자에게 적합한 상품입니다.` : '해당 성향의 투자자에게 적합한 상품입니다.';
  if ((tm.grades || []).length) {
    s += ` 이 회차의 목표시장은 위험등급 6단계 중 ${tm.grades.map((g) => g + '등급').join('·')}에 해당하는 고객입니다.`;
  }
  if (tm.basis && /고난도금융투자상품/.test(tm.basis)) {
    s += ' 최대 원금손실 가능금액이 원금의 100분의 20을 초과하는 고난도금융투자상품에 해당하므로 특별히 유의하셔야 합니다.';
  }
  return s;
}

/** 청약단위 — 외화 회차는 통화 표기를 살린다 */
function subUnit(it) {
  if (it.minAmount == null) return null;
  const n = it.minAmount.toLocaleString();
  const c = it.minAmountCcy;
  return `최소 ${c && c !== 'KRW' ? `${c} ${n}` : `${n}원`}`;
}

/** 중도상환 가격평가일 — 기초자산 소재지에 맞는 문구 */
function midPriceDate(it) {
  const unders = it.underlyings || [];
  if (!unders.length) return null;
  return isAsiaOnly(unders)
    ? '중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)'
    : '중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)';
}

/** 숙려제도 실제 일정 */
function coolNote(it) {
  /**
   * 파생결합사채(ELB·DLB) 투자설명서에는 숙려제도 대상 청약기간·숙려기간 칸이 아예 없다
   * (파생결합증권 문서에는 있다). 고난도 금융투자상품이 아니어서 숙려제도 적용 대상이
   * 아니기 때문이다. 빈칸으로 두면 「확인필요」로 떠서 직원이 없는 일정을 지어 채우게 된다.
   */
  if (!it.coolingFrom && it.instrument === '파생결합사채') {
    return '이 회차의 투자설명서에는 숙려제도 대상 청약기간과 숙려기간이 정해져 있지 않습니다. '
      + '파생결합사채(원금지급형)는 고난도 금융투자상품이 아니어서 청약 숙려제도 적용 대상이 아닙니다.';
  }
  if (!it.coolingFrom || !it.coolingTo) return null;
  let s = `이 회차의 숙려기간은 ${kdate(it.coolingFrom)} ~ ${kdate(it.coolingTo)} 이며`;
  if (it.confirmNote) s += `, 가입의사 확인은 ${it.confirmNote} 입니다`;
  else if (it.confirmBy) s += `, 가입의사 확인 기한은 ${kdate(it.confirmBy)} 입니다`;
  s += '.';
  if (it.coolEnd) s += ` 숙려제도 대상(개인 일반투자자) 청약종료일은 ${kdate(it.coolEnd)} 로, 일반 청약종료일(${kdate(it.offerEnd)})보다 앞섭니다.`;
  return s;
}

/** 공정가액 안내 — 발생 가능한 불이익 설명 보강 */
function fairValueNote(it) {
  if (it.fairValue == null) return null;
  const unit = it.currency === 'USD' ? `USD ${it.faceValue.toLocaleString()}` : `${it.faceValue.toLocaleString()}원`;
  const fv = it.currency === 'USD' ? `USD ${it.fairValue.toLocaleString()}` : `${it.fairValue.toLocaleString()}원`;
  let s = `${kdate(it.fairValueDate) || '평가기준일'} 기준 이 증권의 공정가격은 액면 ${unit} 당 ${fv} 입니다`;
  if (it.fairValueGap != null) s += ` (액면 대비 ${it.fairValueGap}%)`;
  s += '. 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다.';
  return s;
}

/* ── 변환 ─────────────────────────────────────────────── */
function toRecord(it, rcpNo, docDate) {
  const kind = kindOf(it.title);
  const term = monthsBetween(it.issueDate, it.maturityDate);

  /* 차수별 상환조건 — 평가일에서 경과개월을 계산한다 */
  const schedule = (it.schedule || []).map((s) => ({
    seq: s.step,
    months: monthsBetween(it.issueDate, s.date),
    barrier: s.barrier != null ? s.barrier : null,
    payRate: s.payout != null ? s.payout : null,
    annRate: it.annualRate != null ? it.annualRate : null,
    evalDate: s.date,
  }));
  /* 만기 차수를 표 마지막 행으로 붙인다 (만기상환 조건·수익률의 근거) */
  if (it.maturityBarrier != null && term != null) {
    const lastSeq = schedule.length ? schedule[schedule.length - 1].seq : 0;
    const cycle = schedule.length >= 2 ? schedule[1].months - schedule[0].months : (schedule.length ? schedule[0].months : null);
    const matSeq = cycle ? Math.round(term / cycle) : lastSeq + 1;
    if (matSeq > lastSeq) {
      /**
       * 만기 지급률은 문서의 총수익률(docMaxRate)에 100 을 더해 쓴다. 단 월지급식은
       * docMaxRate 가 「한 달치」다 (제4058회 0.5%(연 6%)). 그대로 더하면 3년물 만기
       * 지급률이 100.5% 로 나와 실제와 전혀 다른 숫자를 읽게 된다. 월지급식이면
       * 만기 지급률을 비워 「확인필요」로 남긴다 — 틀린 숫자보다 빈칸이 낫다.
       */
      /* 파생결합사채는 문서의 만기상환 표가 조건 충족·미충족 양쪽 모두 「액면금액」이다
         (제4058회: (13) 70% 이상 -> 0%(액면금액) / (14) 70% 미만 -> 0%(액면금액)).
         상환금액이 원금으로 확정되므로 지급률은 100 이다. */
      const matPay = it.principalProtected ? 100
        : ((it.monthlyIncome || it.docMaxRate == null) ? null : it.docMaxRate + 100);
      schedule.push({
        seq: matSeq, months: term, barrier: it.maturityBarrier,
        payRate: matPay,
        annRate: it.annualRate != null ? it.annualRate : null,
        evalDate: it.maturityDate, maturity: true,
      });
    }
  }

  const vol = (it.volatility || []).map((v) => `${v.asset} ${v.vol}%`).join(', ') || null;

  const fields = {
    name: it.title || null,
    issuer: '미래에셋증권',
    round: it.no ? `제${it.no}회` : null,
    kind: kind,
    highDiff: it.principalProtected ? '해당 없음 (원금지급형)' : '해당 (고난도 금융투자상품)',
    riskGrade: String(it.riskGrade != null ? it.riskGrade : (gradeOfLabel(it.riskLabel) ?? '')) || null,
    riskLabel: it.riskLabel || labelOfGrade(it.riskGrade) || null,
    /* 위험등급 분류 근거 — 투자설명서 「금융투자 상품별 투자위험도 분류 기준」 표의 해당 행 */
    riskReason: it.instrument === '파생결합사채'
      ? '파생결합사채(ELB·DLB) — 발행 금융회사의 신용등급에 대응하는 채권의 위험등급 준용'
      : (it.principalProtected ? '원금지급형' : '최대 원금손실가능금액 20% 초과형'),
    under: (it.underlyings || []).join(', ') || null,
    underVol: vol,
    issueDate: kdate(it.issueDate),
    matDate: kdate(it.maturityDate),
    matTerm: term != null ? (term % 12 === 0 ? `${term / 12}년` : `${term}개월`) : null,
    fixMethod: '최초기준가격평가일의 각 기초자산 종가',
    fixDate: kdate(it.baseDate),
    knockIn: it.knockIn != null ? pct(it.knockIn)
      : (it.principalProtected ? '해당 없음 (원금지급형)' : '없음 (노낙인)'),
    coupon: it.annualRate != null ? `연 ${it.annualRate}%` : null,
    maxLoss: it.principalProtected ? '0% (원금지급형)' : '100%',
    lossExample: lossExample(it),
    midPriceDate: midPriceDate(it),
    midAmt6: '공정가액(기준가)의 90% 이상',
    midAmtAfter: '공정가액(기준가)의 95% 이상',
    subUnit: subUnit(it),
    riskGradeNote: riskGradeNote(it),
    offerEnd: kdate(it.offerEnd),
    docDate: docDate ? kdate(docDate.replace(/\./g, '-')) : null,
    coolNote: coolNote(it),
    fairValueNote: fairValueNote(it),
    monthlyNote: monthlyNote(it),
  };
  /* null 은 담지 않는다 — 화면에서 「확인필요」로 남아야 한다 */
  Object.keys(fields).forEach((k) => { if (fields[k] == null || fields[k] === '') delete fields[k]; });

  return {
    no: it.no,
    name: it.title,
    docUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcpNo}`,
    rcpNo, docDate,
    collectedAt: new Date().toISOString(),
    fields,
    schedule,
    matBarrier: it.maturityBarrier != null ? it.maturityBarrier : null,
    /* 앱이 손익구조 문구를 만들 때 원금지급형·월지급식이면 문구가 완전히 달라진다 */
    instrument: it.instrument || null,
    principalProtected: !!it.principalProtected,
    monthlyIncome: it.monthlyIncome || null,
    knockIn: it.knockIn != null ? String(it.knockIn) : '',
    lizard: it.lizard || null,
    /* 모의실험 표 전체는 앱이 쓰지 않는다 (lossExample 문구에 요약이 들어간다).
       파일 크기를 두 배로 만들 뿐이라 요약만 남긴다. */
    sim: (it.simRuns || it.simLoss != null)
      ? { runs: it.simRuns || null, loss: it.simLoss != null ? it.simLoss : null, first: it.simFirst != null ? it.simFirst : null, range: it.simRange || null }
      : null,
    derivedFrom: {
      months: '차수별 평가일과 발행일의 차이로 계산',
      midPriceDate: '기초자산 소재지(아시아 / 非아시아)로 판정',
      maturityRow: '만기 배리어·만기일을 표 마지막 행으로 추가',
      riskGradeNote: '투자설명서 「목표시장 설정 및 설정 근거」 표(위험추구성향·손실감내능력·지식과 경험·투자기간)를 문장으로 옮김',
      riskGradeLabel: '등급 숫자와 등급명 중 제목에 있는 쪽에서 나머지를 채움 (문서가 밝히는 1:1 대응)',
      lossExample: it.principalProtected ? '원금지급형 — 중도상환·발행사 신용위험만 손실 요인'
        : (it.knockIn != null ? '낙인 배리어 + 만기 배리어 조항' : '노낙인 — 만기 배리어 조항이 유일한 손실조건'),
    },
    /* 근거 표시용 요약만 남긴다 — 설정 근거 문단은 회차마다 같은 보일러플레이트라
       레코드에 담으면 파일만 커지고, 전문은 tools/discovery/prospectus_parsed.json 에 있다 */
    targetMarket: it.targetMarket
      ? { grades: it.targetMarket.grades, appetite: it.targetMarket.appetiteDetail }
      : null,
  };
}

async function main() {
  const parsed = JSON.parse(await readFile(PARSED, 'utf8'));

  /* 회차 -> 레코드. 같은 회차가 여러 접수번호에 있으면 최신 공시를 쓴다 */
  const byNo = {};
  const rcps = Object.keys(parsed).sort();
  for (const rcpNo of rcps) {
    const doc = parsed[rcpNo];
    /* 접수번호 앞 8자리가 접수일이다 (20260825000251 -> 2026-08-25).
       parse_prospectus.mjs 는 날짜를 담지 않으므로 여기서 유도한다. */
    const d = doc.date || `${rcpNo.slice(0, 4)}-${rcpNo.slice(4, 6)}-${rcpNo.slice(6, 8)}`;
    for (const it of doc.items || []) {
      if (!it.no) continue;
      byNo[it.no] = toRecord(it, rcpNo, d);
    }
  }

  /* data/els.js 의 상품과 회차로 매칭해 상품코드 키를 붙인다 */
  const src = await readFile(ELS_DATA, 'utf8');
  const g = {};
  new Function('window', src)(g);
  const products = (g.ELS_DATA && g.ELS_DATA.products) || [];

  /* 레코드는 회차 키(byRound)에 한 번만 담고, 상품코드는 회차를 가리키는
     인덱스(codeToRound)로 둔다. 양쪽에 레코드를 복사하면 파일이 두 배가 된다. */
  const codeToRound = {};
  const matched = [], unmatched = [];
  for (const p of products) {
    const no = Number((String(p.name).match(/(\d{4,6})/) || [])[1]);
    if (!byNo[no]) { unmatched.push({ code: p.code, name: p.name, no }); continue; }
    codeToRound[p.code] = no;
    byNo[no].productCode = p.code;
    byNo[no].productName = p.name;
    matched.push(no);
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    source: 'DART 일괄신고추가서류',
    rcpNos: rcps,
    matched: matched.length,
    productCount: products.length,
    unmatched,
    codeToRound, /* 상품코드(ISIN) -> 회차 번호 */
    byRound: byNo, /* 회차 번호 -> 투자설명서 레코드 */
  };

  const body =
    '/**\n' +
    ' * ELS/DLS 투자설명서 — DART 일괄신고추가서류에서 수집·파싱한 결과\n' +
    ' *\n' +
    ' * 생성 : scripts/fetch_prospectus.mjs -> scripts/parse_prospectus.mjs -> scripts/build_els_prospectus.mjs\n' +
    ' *\n' +
    ' * ELS_PROSPECTUS.byRound[회차번호]  = { fields, schedule, matBarrier, knockIn, docUrl, ... }\n' +
    ' * ELS_PROSPECTUS.codeToRound[상품코드] = 회차 번호 (data/els.js 상품 목록과의 연결)\n' +
    ' *   상품 목록에 아직 없는 회차도 byRound 에 들어 있어, 다음 주 상품이 목록에 뜨면 바로 붙는다.\n' +
    ' *\n' +
    ' * sales-script.html 이 상품 선택 시 이 값을 등록된 투자설명서로 자동 적용한다.\n' +
    ' * 원문에 없는 값은 담지 않으므로 화면에서 「확인필요」로 남는다.\n' +
    ' */\n' +
    'window.ELS_PROSPECTUS = ' + JSON.stringify(payload, null, 1) + ';\n';

  await writeFile(OUT, body);
  console.log(`${OUT} 기록`);
  console.log(`  공시 ${rcps.length}건 · 회차 ${Object.keys(byNo).length}건`);
  console.log(`  상품 ${products.length}건 중 ${matched.length}건 매칭`);
  if (unmatched.length) {
    console.log(`  미매칭 ${unmatched.length}건: ${unmatched.map((u) => u.no || u.name).join(', ')}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
