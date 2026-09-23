/**
 * 퇴직급여 · 연금계좌 판정 규칙 (자료)
 *
 * 규칙을 코드에 흩어 놓으면 두 가지를 잃는다. 근거가 어디서 왔는지, 그리고
 * 아직 확인되지 않은 칸이 어디인지. 그래서 규칙을 자료로 두고 셀마다 출처를 붙인다.
 *
 * 출처는 사내 연금 업무 Q&A 의 문항 번호와 법령 조문이다. 확인된 것(confirmed)과
 * 아직 원본을 보지 못한 것(unverified)을 구분해 둔다 - 표로 뽑을 때 미확인 칸이
 * 눈에 띄어야 상담에 그대로 쓰이지 않는다.
 *
 * 이 파일은 판정만 한다. 조합을 전개해 표로 만드는 일은 build.js,
 * 기존 시뮬레이터와 대조하는 일은 crosscheck.js 가 맡는다.
 */

const CUTOFF_LABEL = '2013.3.1';

/** 출처 대장 - 셀마다 이걸 가리킨다 */
const SOURCES = {
  Q2: {
    id: 'Q2', title: '연금저축과 구.개인연금 비교',
    status: 'confirmed',
    note: '구.개인연금저축(94.6~2000.12)은 연금저축계좌와 별개 상품. ' +
      '연금수령요건이 납입 10년 이상 & 만 55세 이후이고 중도인출이 불가능하다.'
  },
  Q6: {
    id: 'Q6', title: '연금계좌의 세제혜택',
    status: 'confirmed',
    note: '인출순서 ①세액공제 받지않은금액 ②퇴직금 ③세액공제받은금액+운용수익. ' +
      '③은 연 1,500만원 초과 시 종합과세 세율 또는 16.5% 단일세율 선택.'
  },
  Q9: {
    id: 'Q9', title: '연금개시를 신청한 계좌에 추가 입금이 가능한가',
    status: 'confirmed',
    note: '연금개시 계좌는 추가 입금 불가. 다만 당사에서 연금개시한 IRP·연금저축계좌는 ' +
      '퇴직금에 한하여 입금할 수 있다.'
  },
  Q12: {
    id: 'Q12', title: '연금저축계좌로 입금 가능한 퇴직금',
    status: 'confirmed',
    note: '퇴직금제도·DB 가입자는 55세 이상만, DC 가입자는 연령불문 법정퇴직금을 ' +
      '연금저축계좌로 입금할 수 없다. 법정외 퇴직금(명퇴금·위로금)은 모두 가능. ' +
      'DB/DC 규약에 규정된 퇴직급여는 법정퇴직금과 같이 본다.'
  },
  Q23: {
    id: 'Q23', title: '연금계좌 계좌이체 기본원칙',
    status: 'confirmed',
    note: '다음 넷 중 하나라도 걸리면 계약이전 불가: ①연금저축계좌↔퇴직연금계좌 상호간 ' +
      '(연금수령요건 갖춘 계좌라면 연금저축↔IRP 가능, 연금저축→연금저축·IRP→IRP 는 가능) ' +
      '②' + CUTOFF_LABEL + ' 이후 가입 계좌를 ' + CUTOFF_LABEL + ' 전 가입 계좌로 이체 ' +
      '③일부 금액만 이체 ④연금이 개시된 계좌로 이체. ' +
      '②의 가입일자 제한은 연금계좌 간 이체에만 적용되므로 55세 이상자의 DB퇴직금은 ' +
      '가입일자에 상관없이 어느 계좌로든 입금 가능.'
  },
  Q24: {
    id: 'Q24', title: '타사 연금계좌를 당사 기존 연금계좌로 합칠 수 있나',
    status: 'confirmed',
    note: '계약이전은 신규계좌로 수관하거나 기존계좌로 합치는 것 모두 가능. ' +
      '단 ' + CUTOFF_LABEL + ' 이후 계좌를 ' + CUTOFF_LABEL +
      ' 전 계좌로 합치거나, 연금이 개시된 계좌로 합치는 것은 불가.'
  },
  Q25: {
    id: 'Q25', title: '연금이 개시된 계좌를 수관할 수 있나',
    status: 'confirmed',
    note: '연금개시된 계좌를 연금 개시 전의 계좌로 이체하는 것은 가능하다(막히는 것은 받는 쪽이 개시된 경우). ' +
      '단 생보사 종신형 개시분은 이체 불가. 수관할 때는 신규 계좌를 개설하고 기존계좌 가입일자를 ' +
      '승계하는 방식으로만 가능하다. 당사 신규 연금저축·IRP 는 연금개시된 계좌를 수관할 수 있다.'
  },
  Q32: {
    id: 'Q32', title: '계약이전 시 가입일자 적용',
    status: 'confirmed',
    note: '원칙은 신규로 받건 기존으로 받건 "이체 받는 계좌의 가입일자". 다만 신규로 계좌를 개설해 ' +
      '잔액이 없는 상태에서 타 계좌 전액을 이체받으면 "이체하는 계좌의 가입일자" 와 신규 계좌의 ' +
      '가입일자 중 원하는 쪽을 고를 수 있다. 연금수령연차 측면에서는 이체하는 계좌 쪽이 유리하다.'
  },
  Q33: {
    id: 'Q33', title: 'DC → IRP 입금 시 가입일자',
    status: 'confirmed',
    note: '원칙은 받는 IRP 의 가입일자. IRP 를 신규 개설해 DC 퇴직금 전액을 이체하면 DC 가입일자를 ' +
      '고를 수 있다. 이미 잔고가 있는 기존 IRP 면 IRP 가입일을 적용한다.'
  },
  Q34: {
    id: 'Q34', title: 'DB → IRP·연금저축 입금 시 DB 가입일자를 고를 수 있나',
    status: 'confirmed',
    note: '고를 수 없다 - DB 는 연금계좌가 아니라 이체가 아니기 때문. 다만 2013.3.1 이전 DB 가입자가 ' +
      '퇴직소득 전액을 신규 개설 연금계좌로 넣으면, 가입일자는 그대로여도 연금수령 기산연차를 ' +
      '6년으로 할 수 있다(시행령 §40의2④1).'
  },
  Q35: {
    id: 'Q35', title: '2013.3.1 이후 DC 를 그 전 가입 계좌로 입금할 수 있나',
    status: 'confirmed',
    note: '불가. DC→IRP 수령에도 연금계좌 간 이체 규정이 그대로 적용된다. ' +
      '1사 1IRP 예외사유이므로 IRP 를 추가 개설해 입금하면 된다.'
  },
  Q36: {
    id: 'Q36', title: 'DB 퇴직금도 가입시점 제한을 받나',
    status: 'confirmed',
    note: '받지 않는다. 연금계좌는 DC·IRP·연금저축계좌·과학기술인연금·중소기업퇴직연금이고 DB 는 ' +
      '해당하지 않으므로, DB 퇴직금은 가입일자에 상관없이 어느 계좌로건 입금 가능. ' +
      '단 55세 미만이면 근퇴법상 IRP 의무이전이라 연금저축계좌는 불가.'
  },
  Q37: {
    id: 'Q37', title: '퇴직금제도·명퇴금 입금 시 가입일자',
    status: 'confirmed',
    note: '입금받는 IRP·연금저축계좌의 가입일자가 적용된다. 퇴직금제도나 명퇴금에는 ' +
      '연금수령한도에 영향을 주는 "가입일자" 개념 자체가 없어 고를 것이 없다.'
  },
  Q38: {
    id: 'Q38', title: 'DB → DC 전환자의 DC 가입일자',
    status: 'confirmed',
    note: '전환 전 DB 가입일자는 DC 가입일자에 영향을 주지 않는다(DB 는 연금계좌가 아니므로). ' +
      '다만 주무부처 협의결과 2021.9월 이후 DB→DC 전환분은 DB 가입일 정보를 기록하므로, ' +
      '이후 DC→IRP 로 신규 IRP 에 전액 이체하면 DB 가입일을 반영해 수령연차 6년차 특례를 적용한다.'
  },
  Q57: {
    id: 'Q57', title: '연금개시 요건',
    status: 'confirmed',
    note: '만 55세 이상이고 가입일로부터 5년 경과. 이연퇴직소득이 있으면 가입기간 요건 없이 ' +
      '만 55세 이상이면 개시 가능하다.'
  },
  Q58: {
    id: 'Q58', title: '연금수령한도',
    status: 'confirmed',
    note: '한도 = 연금개시일(개시 이후는 매년 1월 1일) 평가금액 ÷ (11 − 연금수령연차) × 120%. ' +
      '인출 한도가 아니라 연금수령이냐 연금외수령이냐를 구분하는 한도이므로 인출금액 제한은 없다. ' +
      '연금개시 신청을 하지 않아도 요건을 갖추면 자동으로 계산이 시작되고 연도 경과에 따라 ' +
      '연차가 자동 누적된다. 10년차가 넘으면 한도 없이 전액이 연금수령으로 인정된다.'
  },
  Q59: {
    id: 'Q59', title: '연금수령연차 계산',
    status: 'confirmed',
    note: '최초로 연금개시 요건을 갖춘 날이 속하는 연도를 기산연도로 하여 1년차, 연도가 경과할 때마다 ' +
      '1년씩 가산. 단 ①계좌 가입일자가 2013.3.1 이전이거나 ②DB 가입일자가 2013.3.1 전인 가입자가 ' +
      '퇴직금 전액을 신규 개설 연금계좌로 입금하면 기산연차를 6으로 시작한다.'
  },
  Q82: {
    id: 'Q82', title: '1사 1IRP 예외사유',
    status: 'confirmed',
    note: '1개 금융회사당 1개 IRP 규제는 2015.12.1 시행. 예외 ①보유 IRP 가 연금개시된 경우 ' +
      '②IRP 가입일자가 2013.3.1 전인데 2013.3.1 이후 가입한 DC 퇴직금을 입금하려는 경우 ' +
      '③2015.12.1 전에 이미 여러 계좌가 있던 경우(강제 통합대상 아님. 단 2015.12.1 이후 입금은 ' +
      '그중 하나의 계좌로). 추가 개설 시에도 자격조건 서류는 제출해야 한다.'
  }
};

/** 소득세법상 '연금계좌' 인가 - 이체 제한이 걸리는지를 가른다 */
const isPensionAccountSystem = (system) => system === 'DC';   // DB·퇴직금제도는 연금계좌가 아니다

/**
 * 퇴직급여 재원을 대상 계좌에 '입금' 할 수 있는가.
 *
 * c = {
 *   system     : 'SEV' | 'DB' | 'DC'      퇴직제도
 *   fund       : 'LEGAL' | 'HONOR'        법정 / 법정외(명퇴금·위로금)
 *   ageAtRetire: number                   퇴직 시점의 만 나이
 *   systemLegacy: boolean                 DC 제도 가입일이 2013.3.1 이전인가
 *   target     : { kind:'pension'|'irp', isNew, legacy, started, inHouse }
 * }
 */
function canDeposit(c) {
  const t = c.target;
  const blockers = [];
  const cautions = [];

  // (1) 만 55세 미만의 법정퇴직급여는 IRP 로만 지급된다 (근퇴법 §17·§20, Q12)
  //     2022.4.13 이후로는 퇴직금제도의 법정퇴직금도 IRP 의무이전 대상이다.
  if (t.kind === 'pension' && c.fund === 'LEGAL' && c.ageAtRetire < 55) {
    blockers.push({ rule: 'D1', src: 'Q12', law: '근퇴법 §17·§20',
      text: '만 55세 미만 법정퇴직급여는 IRP 의무이전 대상 - 연금저축계좌 입금 불가' });
  }

  // (2) DC 의 법정퇴직급여는 연령 불문 연금저축계좌로 못 간다 (시행령 §40의4①1, Q12)
  //     DC 자체가 퇴직연금계좌라 연금저축계좌와의 상호 이체 금지에 걸린다.
  if (c.system === 'DC' && c.fund === 'LEGAL' && t.kind === 'pension') {
    blockers.push({ rule: 'D2', src: 'Q12', law: '소득세법 시행령 §40의4①1',
      text: 'DC 퇴직급여는 연금저축계좌로 직접 입금 불가 (연령 불문)'
        + (c.ageAtRetire >= 55 ? ' - 단 55세 이상이면 DC→IRP→연금저축계좌 2단계 경로 가능' : '') });
  }

  // (3) 2013.3.1 이후 가입 연금계좌 → 2013.3.1 전 가입 연금계좌 이체 금지 (§40의4①2, Q23②)
  //     DB·퇴직금제도는 연금계좌가 아니므로 이 제한을 받지 않는다(Q23 마지막 문장).
  //     법정외 퇴직금(명퇴금·위로금)도 받지 않는다 - DC 규약에 규정되지 않은 돈은
  //     회사가 직접 지급하는 것이라 '연금계좌 간의 이체'가 아니기 때문이다(Q12 첫 문단).
  if (isPensionAccountSystem(c.system) && c.fund === 'LEGAL' &&
      !c.systemLegacy && !t.isNew && t.legacy) {
    blockers.push({ rule: 'D3', src: 'Q23', law: '소득세법 시행령 §40의4①2',
      text: CUTOFF_LABEL + ' 이후 가입 DC 의 퇴직급여는 ' + CUTOFF_LABEL +
        ' 전 가입 연금계좌로 입금 불가 - 1사 1IRP 예외사유이므로 IRP 추가 개설 가능' });
  }

  // (4) 연금이 개시된 계좌 - 원칙 불가. 당사 계좌는 퇴직금에 한해 입금 가능(Q9).
  if (!t.isNew && t.started) {
    if (t.inHouse === true) {
      cautions.push({ rule: 'D4', src: 'Q9', law: '소득세법 시행령 §40의3',
        text: '당사에서 연금개시한 계좌 - 퇴직금에 한하여 입금 가능' });
    } else {
      blockers.push({ rule: 'D4', src: 'Q9', law: '소득세법 시행령 §40의3',
        text: '연금개시된 타사 계좌 - 추가 입금 불가 (수관도 Q23④에 걸림)' });
    }
  }

  return verdictOf(blockers, cautions);
}

/**
 * 연금계좌를 다른 연금계좌로 '계약이전' 할 수 있는가 (Q23).
 *
 * c = {
 *   from: { kind, legacy, meetsPensionReq }   meetsPensionReq = 만 55세 이상 + 가입 5년 경과
 *   to  : { kind, legacy, isNew, started }
 *   fullAmount: boolean                        전액 이체인가
 * }
 */
function canTransfer(c) {
  const blockers = [];
  const cautions = [];
  const f = c.from, t = c.to;

  // ① 연금저축계좌 ↔ 퇴직연금계좌(DC/IRP/과학기술인연금) 상호간 이체
  //    단 연금수령요건을 갖춘 계좌라면 연금저축계좌 ↔ IRP 계약이전이 가능하다.
  //    연금저축→연금저축, IRP→IRP 는 애초에 이 제한 대상이 아니다.
  if (f.kind !== t.kind) {
    if (f.meetsPensionReq) {
      cautions.push({ rule: 'T1', src: 'Q23', law: '소득세법 시행령 §40의4①1',
        text: '연금수령요건(만 55세 이상 + 가입 5년)을 갖춘 계좌라 연금저축↔IRP 계약이전 가능 - 요건 충족 여부 확인 필요' });
    } else {
      blockers.push({ rule: 'T1', src: 'Q23', law: '소득세법 시행령 §40의4①1',
        text: '연금저축계좌와 퇴직연금계좌 상호간 이체 금지 - 연금수령요건을 갖추면 허용' });
    }
  }

  // ② 2013.3.1 이후 가입 계좌 → 2013.3.1 전 가입 계좌 (한 방향만 막힌다)
  if (!f.legacy && t.legacy && !t.isNew) {
    blockers.push({ rule: 'T2', src: 'Q23', law: '소득세법 시행령 §40의4①2',
      text: CUTOFF_LABEL + ' 이후 가입 계좌를 ' + CUTOFF_LABEL + ' 전 가입 계좌로 이체 불가' });
  }

  // ③ 일부 금액만 이체
  if (!c.fullAmount) {
    blockers.push({ rule: 'T3', src: 'Q23', law: '소득세법 시행령 §40의4①',
      text: '일부 금액만 이체 불가 - 전액 이체여야 한다' });
  }

  // ④ 연금이 개시된 계좌로 이체
  //    막히는 것은 '받는 쪽' 이 개시된 경우다. 개시된 계좌를 개시 전 계좌로 보내는 것은
  //    가능하다(Q25). 다만 보내는 쪽이 개시된 계좌면 실무 제약이 따로 있다.
  if (t.started) {
    blockers.push({ rule: 'T4', src: 'Q23', law: '소득세법 시행령 §40의4①',
      text: '연금이 개시된 계좌로는 이체 불가' });
  }
  if (c.from.started) {
    cautions.push({ rule: 'T5', src: 'Q25', law: '소득세법 시행령 §40의4①',
      text: '연금개시된 계좌를 보내는 경우 - 개시 전 계좌로의 이체는 가능하나, ' +
        '생보사 종신형 개시분은 불가하고 일부 기관은 시스템 부재로 이·수관을 거부한다. ' +
        '수관 시에는 신규 계좌를 개설해 기존 가입일자를 승계하는 방식만 가능하다 ' +
        '(당사 신규 연금저축·IRP 는 수관 가능)' });
  }

  return verdictOf(blockers, cautions);
}

function verdictOf(blockers, cautions) {
  const verdict = blockers.length ? '불가' : cautions.length ? '조건부' : '가능';
  return { verdict, blockers, cautions };
}

module.exports = { CUTOFF_LABEL, SOURCES, canDeposit, canTransfer, isPensionAccountSystem };
