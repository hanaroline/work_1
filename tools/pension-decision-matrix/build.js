#!/usr/bin/env node
/**
 * 판단표 생성기.
 *
 *   node tools/pension-decision-matrix/build.js            표를 찍는다
 *   node tools/pension-decision-matrix/build.js --md out.md  파일로
 *
 * 조합을 손으로 적으면 빠뜨린 칸이 생기고, 규칙을 고쳤을 때 표가 따라오지 않는다.
 * 그래서 rules.js 의 규칙에서 전개한다 - 표는 산출물이지 원본이 아니다.
 */
const { SOURCES, canDeposit, canTransfer, CUTOFF_LABEL } = require('./rules');

const SYSTEMS = [
  { key: 'SEV', label: '퇴직금제도' },
  { key: 'DB', label: 'DB' },
  { key: 'DC', label: 'DC' }
];
const FUNDS = [
  { key: 'LEGAL', label: '법정퇴직금' },
  { key: 'HONOR', label: '법정외(명퇴금·위로금)' }
];
const AGES = [{ v: 54, label: '55세 미만' }, { v: 58, label: '55세 이상' }];

/** 대상 계좌 후보 - 가입시점과 신규 여부를 갈라 둔다 */
const TARGETS = [
  { key: 'pen-old', kind: 'pension', isNew: false, legacy: true, started: false, label: '기존 연금저축 (' + CUTOFF_LABEL + ' 전)' },
  { key: 'pen-new', kind: 'pension', isNew: false, legacy: false, started: false, label: '기존 연금저축 (' + CUTOFF_LABEL + ' 후)' },
  { key: 'pen-open', kind: 'pension', isNew: true, legacy: false, started: false, label: '신규 연금저축 개설' },
  { key: 'irp-old', kind: 'irp', isNew: false, legacy: true, started: false, label: '기존 IRP (' + CUTOFF_LABEL + ' 전)' },
  { key: 'irp-new', kind: 'irp', isNew: false, legacy: false, started: false, label: '기존 IRP (' + CUTOFF_LABEL + ' 후)' },
  { key: 'irp-open', kind: 'irp', isNew: true, legacy: false, started: false, label: '신규 IRP 개설' }
];

const MARK = { '가능': 'O', '조건부': '△', '불가': 'X' };

/**
 * 연금수령연차의 기산연차.
 *
 * 시뮬레이터와 같은 규칙이다. 여기서는 '어느 계좌가 유리한가' 만 보면 되므로
 * 기산연차(1 또는 6)까지만 본다 - 실제 연차는 기산연도부터의 누적이 더해지는데
 * 그것은 고객의 생년월일·퇴직연도에 달려 있어 표로는 못 적는다.
 */
function baseIndex(target, systemLegacy, system) {
  if (!target.isNew && target.legacy) return 6;             // 구 계좌에 입금
  // 2013.3.1 전 퇴직연금(DB·DC) 가입자가 신규 계좌에 전액 입금하면 6년차 승계
  if (target.isNew && systemLegacy && (system === 'DB' || system === 'DC')) return 6;
  return 1;
}

function depositMatrix() {
  const rows = [];
  for (const sys of SYSTEMS) {
    for (const fund of FUNDS) {
      for (const age of AGES) {
        // 퇴직연금(DB·DC)은 제도 가입일이 2013.3.1 전이냐 후냐로 갈린다.
        // 신규 계좌 6년차 승계 특례가 여기에 걸리고, DC 는 구 계좌 입금 제한까지 걸린다.
        // 퇴직금제도는 '가입일자' 개념이 없어 한 줄이다.
        const legacyCases = sys.key === 'SEV' ? [false] : [true, false];
        for (const legacySys of legacyCases) {
          const cells = TARGETS.map((t) => {
            const r = canDeposit({
              system: sys.key, fund: fund.key, ageAtRetire: age.v,
              systemLegacy: legacySys,
              target: Object.assign({ inHouse: null }, t)
            });
            return { t, r, idx: baseIndex(t, legacySys, sys.key) };
          });
          rows.push({ sys, fund, age, legacySys, cells });
        }
      }
    }
  }
  return rows;
}

function transferMatrix() {
  const KINDS = [
    { kind: 'pension', legacy: true, label: '연금저축(구)' },
    { kind: 'pension', legacy: false, label: '연금저축(신)' },
    { kind: 'irp', legacy: true, label: 'IRP(구)' },
    { kind: 'irp', legacy: false, label: 'IRP(신)' }
  ];
  const out = [];
  for (const meets of [false, true]) {
    for (const f of KINDS) {
      const cells = KINDS.map((t) => canTransfer({
        from: { kind: f.kind, legacy: f.legacy, meetsPensionReq: meets },
        to: { kind: t.kind, legacy: t.legacy, isNew: false, started: false },
        fullAmount: true
      }));
      out.push({ meets, from: f, targets: KINDS, cells });
    }
  }
  return out;
}

function render() {
  const L = [];
  L.push('# 퇴직급여 · 연금계좌 판단표');
  L.push('');
  L.push('`rules.js` 에서 전개한 산출물입니다. 직접 고치지 마세요 - 규칙을 고치고 다시 만듭니다.');
  L.push('');
  L.push('기호: **O** 가능 · **△** 조건부(확인 필요) · **X** 불가');
  L.push('');

  // ── 1. 퇴직급여를 어느 계좌로 받을 수 있는가 ──
  L.push('## 1. 퇴직급여를 어느 계좌로 받을 수 있는가');
  L.push('');
  L.push('괄호 안은 **기산연차**입니다. 실제 연금수령연차는 기산연도(만 55세 + 계좌에 자금이 들어온 해)부터');
  L.push('해마다 누적되므로, 같은 기산연차라도 고객 나이에 따라 실제 연차는 더 큽니다.');
  L.push('');
  const head = ['퇴직제도', '재원', '퇴직시 나이'].concat(TARGETS.map((t) => t.label));
  L.push('| ' + head.join(' | ') + ' |');
  L.push('|' + head.map(() => '---').join('|') + '|');
  for (const row of depositMatrix()) {
    const sysLabel = row.sys.key === 'SEV' ? row.sys.label
      : row.sys.label + (row.legacySys ? ' (' + CUTOFF_LABEL + ' 전 가입)' : ' (' + CUTOFF_LABEL + ' 후 가입)');
    const cells = row.cells.map((c) => MARK[c.r.verdict] + (c.r.verdict === '불가' ? '' : ' (' + c.idx + '년차)'));
    L.push('| ' + [sysLabel, row.fund.label, row.age.label].concat(cells).join(' | ') + ' |');
  }
  L.push('');

  // 불가 사유 모음
  L.push('### 불가·조건부 사유');
  L.push('');
  const seen = new Map();
  for (const row of depositMatrix()) {
    for (const c of row.cells) {
      for (const b of c.r.blockers.concat(c.r.cautions)) {
        if (!seen.has(b.rule)) seen.set(b.rule, b);
      }
    }
  }
  L.push('| 규칙 | 근거 | 내용 |');
  L.push('|---|---|---|');
  for (const [rule, b] of seen) {
    L.push('| `' + rule + '` | ' + b.src + ' · ' + b.law + ' | ' + b.text + ' |');
  }
  L.push('');

  // ── 2. 계좌 간 계약이전 ──
  L.push('## 2. 보유 계좌를 다른 계좌로 옮길 수 있는가 (계약이전)');
  L.push('');
  L.push('전액 이체 · 이체받는 계좌는 연금개시 전이라고 가정했습니다.');
  L.push('일부만 이체하거나 연금개시된 계좌로 보내면 어느 조합이든 **X** 입니다(Q23 ③④).');
  L.push('');
  const tm = transferMatrix();
  for (const meets of [false, true]) {
    L.push('**' + (meets ? '연금수령요건 충족 (만 55세 이상 + 가입 5년 경과)' : '연금수령요건 미충족') + '**');
    L.push('');
    const rows = tm.filter((r) => r.meets === meets);
    const th = ['보내는 계좌 \\ 받는 계좌'].concat(rows[0].targets.map((t) => t.label));
    L.push('| ' + th.join(' | ') + ' |');
    L.push('|' + th.map(() => '---').join('|') + '|');
    for (const r of rows) {
      L.push('| ' + [r.from.label].concat(r.cells.map((c) => MARK[c.verdict])).join(' | ') + ' |');
    }
    L.push('');
  }

  // ── 2-2. 옮기면 연차가 어떻게 되는가 ──
  L.push('### 옮기면 연금수령연차가 어떻게 되는가');
  L.push('');
  L.push('**이전 가능 여부보다 이쪽이 실익을 가릅니다.** ' + CUTOFF_LABEL + ' 전 가입 계좌는 6년차부터');
  L.push('기산하는데, 이체하면 가입일이 **받는 계좌 기준**이 되어 그 특례를 잃을 수 있습니다.');
  L.push('');
  L.push('가입일자를 어느 쪽 것으로 볼지가 갈림길입니다(Q32).');
  L.push('');
  L.push('- **원칙**: 신규로 받건 기존으로 받건 **이체 받는 계좌의 가입일자**를 씁니다.');
  L.push('- **예외**: 신규로 계좌를 열어 **잔액이 없는 상태에서 전액을 이체**받으면,');
  L.push('  보내는 계좌와 받는 계좌의 가입일자 **둘 중 원하는 쪽을 고를 수 있습니다.**');
  L.push('  연금수령연차만 보면 보내는(구) 계좌 쪽이 유리합니다.');
  L.push('');
  L.push('| 옮기는 방향 | 이전 | 연차 | 판단 |');
  L.push('|---|---|---|---|');
  L.push('| 구 계좌 → 기존 구 계좌 | 가능 | 6년차 유지 | 무방 |');
  L.push('| 구 계좌 → **잔액 있는** 기존 신 계좌 | 가능 | **6년차 → 1년차** | **옮기지 마세요** — 받는 계좌 가입일이 적용되어 한도가 몇 배 줄어듭니다 |');
  L.push('| 구 계좌 → **신규 개설** 계좌 (전액) | 가능 | **6년차 유지 가능** | 가입일자를 **보내는 계좌 것으로 선택**하세요 (Q32). 자동이 아니라 선택입니다 |');
  L.push('| 신 계좌 → 기존 구 계좌 | **불가** | - | Q23② · Q24 에 걸립니다 |');
  L.push('| 신 계좌 → 신 계좌 | 가능 | 1년차 그대로 | 무방 (수수료·상품만 보면 됩니다) |');
  L.push('');
  L.push('**퇴직급여를 받을 때도 같은 갈림길이 있습니다.**');
  L.push('');
  L.push('| 재원 | 신규 계좌에 전액 입금하면 | 근거 |');
  L.push('|---|---|---|');
  L.push('| DC | **DC 가입일자를 고를 수 있습니다** (잔고 있는 기존 IRP 면 불가) | Q33 |');
  L.push('| DB | 가입일자는 못 고르지만, DB 가입일이 ' + CUTOFF_LABEL + ' 전이면 **기산연차를 6년으로** 할 수 있습니다 | Q34 |');
  L.push('| DB→DC 전환자 | 2021.9월 이후 전환분은 DB 가입일이 기록되어, 신규 IRP 전액 이체 시 6년차 특례 적용 | Q38 |');
  L.push('| 퇴직금제도 · 명퇴금 | 고를 가입일자가 **없습니다** — 받는 계좌의 가입일자를 그대로 씁니다 | Q37 |');
  L.push('');

  // ── 3. 출처 ──
  L.push('## 3. 근거와 확인 상태');
  L.push('');
  L.push('| 출처 | 제목 | 상태 | 내용 |');
  L.push('|---|---|---|---|');
  for (const k of Object.keys(SOURCES)) {
    const s = SOURCES[k];
    L.push('| ' + s.id + ' | ' + s.title + ' | ' + (s.status === 'confirmed' ? '원본 확인' : '**미확인**') + ' | ' + s.note + ' |');
  }
  L.push('');
  return L.join('\n');
}

if (require.main === module) {
  const out = render();
  const i = process.argv.indexOf('--md');
  if (i >= 0 && process.argv[i + 1]) {
    require('fs').writeFileSync(process.argv[i + 1], out + '\n', 'utf8');
    console.log('썼습니다 → ' + process.argv[i + 1]);
  } else {
    console.log(out);
  }
}

module.exports = { render, depositMatrix, transferMatrix, TARGETS, SYSTEMS, FUNDS, AGES };
