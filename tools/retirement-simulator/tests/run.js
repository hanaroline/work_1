#!/usr/bin/env node
/**
 * 테스트 러너.
 *
 *   node tools/retirement-simulator/tests/run.js            전체
 *   node tools/retirement-simulator/tests/run.js selectors  일부 (이름으로 거르기)
 *
 * retirement-simulator.html 을 그대로 열어 검사하므로, 고치고 나면 먼저 빌드해야 한다.
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const filter = process.argv.slice(2);

function makeT(results) {
  const check = (pass, label, detail) => {
    results.push({ pass, label, detail });
    if (!pass) process.exitCode = 1;
  };
  return {
    ok: (v, label) => check(!!v, label, v ? '' : '거짓'),
    is: (got, want, label) =>
      check(Object.is(got, want), label, Object.is(got, want) ? '' : `기대 ${JSON.stringify(want)} / 실제 ${JSON.stringify(got)}`),
    near: (got, want, tol, label) =>
      check(Math.abs(got - want) <= tol, label, Math.abs(got - want) <= tol ? '' : `기대 ${want}±${tol} / 실제 ${got}`),
    includes: (hay, needle, label) =>
      check(String(hay).includes(needle), label, String(hay).includes(needle) ? '' : `"${needle}" 없음`),
    excludes: (hay, needle, label) =>
      check(!String(hay).includes(needle), label, !String(hay).includes(needle) ? '' : `"${needle}" 가 들어 있음`),
    note: (text) => results.push({ note: text })
  };
}

(async () => {
  const specs = fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.spec.js'))
    .filter((f) => !filter.length || filter.some((q) => f.includes(q)))
    .sort();

  if (!specs.length) { console.error('실행할 스펙이 없습니다.'); process.exit(1); }
  if (!fs.existsSync(path.resolve(DIR, '..', '..', '..', 'retirement-simulator.html'))) {
    console.error('retirement-simulator.html 이 없습니다. 먼저 빌드하세요:\n  node scripts/build-retirement-simulator.js');
    process.exit(1);
  }

  let total = 0, failed = 0;
  const started = Date.now();

  for (const file of specs) {
    const name = file.replace('.spec.js', '');
    const results = [];
    const t = makeT(results);
    const t0 = Date.now();
    try {
      await require(path.join(DIR, file))(t);
    } catch (e) {
      results.push({ pass: false, label: '스펙 실행 중 예외', detail: (e && e.message) || String(e) });
      process.exitCode = 1;
    }
    const checks = results.filter((r) => r.pass !== undefined);
    const bad = checks.filter((r) => !r.pass);
    total += checks.length; failed += bad.length;

    console.log(`\n${bad.length ? 'FAIL' : ' OK '}  ${name}  (${checks.length}건, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    for (const r of results) {
      if (r.note !== undefined) console.log('        · ' + r.note);
      else if (!r.pass) console.log('   ✗  ' + r.label + (r.detail ? ' - ' + r.detail : ''));
    }
  }

  console.log(`\n${'-'.repeat(54)}`);
  console.log(`검사 ${total}건 · 실패 ${failed}건 · ${((Date.now() - started) / 1000).toFixed(1)}s`);
  if (failed) console.log('실패한 검사가 있습니다.');
})();
