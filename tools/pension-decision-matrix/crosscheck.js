#!/usr/bin/env node
/**
 * 교차 검증 - 규칙표(rules.js) 와 기존 시뮬레이터가 같은 답을 내는가.
 *
 *   node tools/pension-decision-matrix/crosscheck.js
 *
 * 왜 필요한가. 판단표를 손으로 적으면 '그럴듯한 표' 가 나올 뿐 맞는지는 아무도 모른다.
 * 규칙을 두 번 독립으로 구현해 놓고 모든 조합에서 답이 같은지 보면, 둘 중 하나가 틀렸을 때
 * 반드시 드러난다. 규칙표는 Q&A 원문에서, 시뮬레이터는 상담 화면에서 각각 나왔으므로
 * 서로를 베낀 것이 아니다.
 *
 * 불일치가 나오면 어느 쪽이 맞는지는 사람이 Q&A 원문을 보고 정한다. 이 대본은
 * '어디가 어긋났는지' 까지만 말한다.
 *
 * 화면으로 표현할 수 없는 조합(예: DC 가입자의 명예퇴직금)은 따로 모아 보고한다 -
 * 그것도 결과다. 판단표에는 있는데 상담 화면에서 입력할 수 없다는 뜻이기 때문이다.
 */
const path = require('path');
const { canDeposit } = require('./rules');

const HELPERS = path.resolve(__dirname, '..', 'retirement-simulator', 'tests', 'helpers');
const { openApp, fillCase, field, button, setAccounts } = require(HELPERS);

const THIS_YEAR = new Date().getFullYear();

/** 화면의 판정 카드를 읽는다 (계좌 이름 → 가능/조건부/불가) */
async function readCards(page) {
  const texts = await page.locator('.screen-only .space-y-3.mb-6 > div')
    .evaluateAll((ds) => ds.map((d) => d.innerText.replace(/\s+/g, ' ').trim()));
  const out = {};
  for (const t of texts) {
    const verdict = /(^|\s)불가/.test(t) ? '불가' : /(^|\s)조건부/.test(t) ? '조건부' : '가능';
    for (const [key, prefix] of Object.entries({
      'pen-old': '연금저축 1', 'pen-new': '연금저축 2',
      'irp-old': 'IRP 1', 'irp-new': 'IRP 2',
      'pen-open': '신규 연금저축', 'irp-open': '신규 IRP'
    })) {
      if (t.startsWith(prefix)) out[key] = { verdict, text: t };
    }
  }
  return out;
}

const TARGETS = {
  'pen-old': { kind: 'pension', isNew: false, legacy: true, started: false },
  'pen-new': { kind: 'pension', isNew: false, legacy: false, started: false },
  'pen-open': { kind: 'pension', isNew: true, legacy: false, started: false },
  'irp-old': { kind: 'irp', isNew: false, legacy: true, started: false },
  'irp-new': { kind: 'irp', isNew: false, legacy: false, started: false },
  'irp-open': { kind: 'irp', isNew: true, legacy: false, started: false }
};

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({ stubPrint: true });
  const gaps = [];
  let checked = 0, mismatched = 0;
  try {
    for (const system of ['SEV', 'DB', 'DC']) {
      for (const fund of ['LEGAL', 'HONOR']) {
        // 상담 화면은 퇴직금제도에서만 법정/법정외를 갈라 받는다.
        // DB·DC 의 명예퇴직금은 입력할 자리가 없다 - 규칙표에는 있는 칸이므로 빈칸으로 남긴다.
        if (fund === 'HONOR' && system !== 'SEV') {
          gaps.push(system + ' 가입자의 ' + '법정외 퇴직금(명퇴금·위로금)');
          continue;
        }
        for (const ageAtRetire of [54, 58]) {
          const legacyCases = system === 'SEV' ? [false] : [true, false];
          for (const systemLegacy of legacyCases) {
            const birthYear = THIS_YEAR - ageAtRetire;
            const joinDate = systemLegacy ? '2005-04-01' : '2016-04-01';

            const c = {
              name: 'XC', birth: String(birthYear).slice(2) + '0301',
              system, joinDate, retireDate: THIS_YEAR + '-06-01',
              deferredTax: 5000000,
              accounts: [
                { kind: 'pension', join: '2008-03-03', balance: 50000000 },
                { kind: 'pension', join: '2016-05-02', balance: 40000000 },
                { kind: 'irp', join: '2009-04-01', balance: 30000000 },
                { kind: 'irp', join: '2018-07-02', balance: 20000000 }
              ]
            };
            if (system === 'SEV') {
              c.legal = fund === 'LEGAL' ? 200000000 : 0;
              c.honor = fund === 'HONOR' ? 200000000 : 0;
            } else {
              c.amount = 200000000;
            }
            await fillCase(page, c);
            await button(page, '판정').click();
            await page.waitForTimeout(350);

            const cards = await readCards(page);
            for (const [key, target] of Object.entries(TARGETS)) {
              const expect = canDeposit({
                system, fund, ageAtRetire, systemLegacy,
                target: Object.assign({ inHouse: null }, target)
              }).verdict;
              const got = cards[key] ? cards[key].verdict : '(카드 없음)';
              checked += 1;
              const label = [system, systemLegacy ? '구' : '신', fund, ageAtRetire + '세', key].join('/');
              if (got !== expect) mismatched += 1;
              t.is(got, expect, label);
            }
          }
        }
      }
    }
    t.note('대조한 칸 ' + checked + '개 · 어긋난 칸 ' + mismatched + '개');
    if (gaps.length) {
      t.note('상담 화면에서 입력할 수 없는 조합: ' + [...new Set(gaps)].join(', '));
    }
    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};

/** 단독 실행 */
if (require.main === module) {
  const results = [];
  const check = (pass, label, detail) => { results.push({ pass, label, detail }); };
  const t = {
    is: (got, want, label) => check(Object.is(got, want), label,
      Object.is(got, want) ? '' : `기대 ${JSON.stringify(want)} / 실제 ${JSON.stringify(got)}`),
    ok: (v, label) => check(!!v, label, v ? '' : '거짓'),
    note: (text) => results.push({ note: text })
  };
  module.exports(t).then(() => {
    const fails = results.filter((r) => r.pass === false);
    for (const r of results) if (r.note) console.log('  · ' + r.note);
    for (const r of fails) console.log('  ✗ ' + r.label + '  ' + r.detail);
    console.log((fails.length ? 'FAIL' : 'OK') + '  대조 ' + results.filter((r) => 'pass' in r).length +
      '건 · 어긋남 ' + fails.length + '건');
    process.exit(fails.length ? 1 : 0);
  }).catch((e) => { console.error(e); process.exit(1); });
}
