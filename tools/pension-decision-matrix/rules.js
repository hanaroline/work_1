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
  // --- 아직 원본을 다시 보지 못한 것 ---
  SUCCESSION: {
    id: '(미확인)', title: '이체 시 가입일 승계',
    status: 'unverified',
    note: '소득세법 시행령 §40의4②로 알려진 내용: 이체 시 가입일은 이체받은 계좌 기준이되, ' +
      '계좌가 새로 설정되어 전액이 이체되는 경우에는 이체 전 계좌 기준으로 할 수 있다. ' +
      '원본 Q&A 페이지를 확인하지 못해 미확인으로 둔다. 유불리 판단의 핵심이므로 확인 필요.'
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
  if (t.started) {
    blockers.push({ rule: 'T4', src: 'Q23', law: '소득세법 시행령 §40의4①',
      text: '연금이 개시된 계좌로는 이체 불가' });
  }

  return verdictOf(blockers, cautions);
}

function verdictOf(blockers, cautions) {
  const verdict = blockers.length ? '불가' : cautions.length ? '조건부' : '가능';
  return { verdict, blockers, cautions };
}

module.exports = { CUTOFF_LABEL, SOURCES, canDeposit, canTransfer, isPensionAccountSystem };
