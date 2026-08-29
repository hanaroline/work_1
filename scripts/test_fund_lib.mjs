#!/usr/bin/env node
/**
 * 수집기 회귀 시험 — 값을 만드는 자리를 실물로 고정한다.
 *
 *   node scripts/test_fund_lib.mjs
 *
 * 화면에 실리는 숫자를 만드는 것은 수집기의 함수 몇 개다. 그 함수들이
 * **이번에 값을 치르고 알아낸 것**을 계속 지키는지 여기서 붙잡아 둔다.
 * 원자료 없이 도는 시험이라 매번 돌려도 몇 밀리초면 끝난다.
 *
 * 시험 값은 지어낸 것이 아니라 전부 실물이다 —
 * `tools/discovery/fund_returns_verify*.md`, `fund_zero_weight.md`.
 */

import {
  toPct, findSteps, countResets, verifyReturns, splitType,
} from './collect_fund_kr.mjs';

let pass = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass += 1; console.log(`  ok   ${name}${detail ? ` — ${detail}` : ''}`); }
  else { failures.push({ name, detail }); console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
}

console.log('\n=== 1. 비중 변환 — 0 이 아닌 것을 0 으로 만들지 않는다 ===\n');
// 원천에 실제로 있는 값들. toFixed(4) 였을 때 앞의 둘이 0 이 되어 화면에
// "0.00%" 로 찍혔다 — 담은 것을 안 담았다고 말한 셈이다.
for (const [w, why] of [
  [0.000000045, 'PETKIM PETROKIMYA (KB이머징유럽)'],
  [0.000000489, 'J SAINSBURY PLC (KB글로벌주식인덱스)'],
  [0.000000151, 'TURK SISE VE CAM F'],
  [0.0000081, 'NORILSK NICKEL PJS'],
]) {
  const got = toPct(w);
  check(`${why} 의 비중 ${w} 이 0 이 되지 않는다`, got !== 0, `→ ${got}`);
}
// 원천이 정말 0 을 준 경우는 0 이어야 한다. 제재로 평가가 0 이 된 러시아
// 종목(GAZPROM·NORILSK NICKEL)과 공모주 배정분이 그렇다. 그건 참인 0 이므로
// 빈칸으로 바꾸면 그것대로 거짓이 된다.
check('원천이 준 0 은 0 그대로다', toPct(0) === 0, `→ ${toPct(0)}`);
check('흔한 비중은 짧게 남는다', toPct(0.090869256) === 9.0869, `→ ${toPct(0.090869256)}`);
check('음수 비중도 부호를 지킨다', toPct(-0.0032) === -0.32, `→ ${toPct(-0.0032)}`);

console.log('\n=== 2. 계단 탐지 — 주말이 낀 계단을 놓치지 않는다 ===\n');
// 골든브릿지스마트단기채의 실제 계열. 2차 규칙(하루당 환산)이 이걸 놓쳤다 —
// 3.147배가 주말 때문에 사흘로 나뉘어 3.147^(1/3)=1.466 이 되어 문턱 1.5 를
// 통과했다. 그대로 두었으면 화면에 +215% 가 나갔다.
const bond = [
  ['2026-07-24', 958.85], ['2026-07-27', 958.89], ['2026-07-28', 958.90],
  ['2026-07-29', 958.91], ['2026-07-30', 958.92], ['2026-07-31', 958.93],
  ['2026-08-03', 3017.16], ['2026-08-04', 3017.35], ['2026-08-05', 3017.54],
  ['2026-08-06', 3017.72], ['2026-08-07', 3017.91],
].map(([day, v]) => ({ day, v }));
const bondSteps = findSteps(bond, 1.25);
check('주말이 낀 3.147배 계단을 잡는다', bondSteps.length === 1,
  bondSteps.map((s) => `${s.prevDay}→${s.day} ${s.ratio}배`).join(' ') || '못 잡음');
if (bondSteps.length) {
  check('계단 날짜가 2026-08-03 이다', bondSteps[0].day === '2026-08-03', bondSteps[0].day);
}

// 평평한 채권형의 정상적인 하루를 계단으로 잡으면 안 된다. 하루 0.001% 씩
// 움직이는 계열에서는 0.5% 만 움직여도 500σ 가 되므로, 절대 바닥이 없으면
// 정상값이 통째로 잡힌다.
const flat = Array.from({ length: 30 }, (_, i) => ({
  day: `2026-0${1 + Math.floor(i / 28)}-${String((i % 28) + 1).padStart(2, '0')}`,
  v: 1000 + i * 0.01,
}));
flat[20].v = 1000 + 20 * 0.01 + 5;      // 0.5% 하루 — 계단이 아니다
check('평평한 계열의 0.5% 하루는 계단이 아니다', findSteps(flat, 1.25).length === 0,
  `${findSteps(flat, 1.25).length}건`);

console.log('\n=== 3. 결산 계단 세기 — 큰 누적수익률의 근거 ===\n');
// 하나클래스원특별자산투자신탁3 의 실제 5년 계열 일부. 해마다 2월·8월에
// 기준가가 내려앉는다. 이걸 못 세면 5년 +1,517% 를 한도로 잡아 버린다.
const sawtooth = [
  ['2021-09-01', 5091.45], ['2021-12-01', 5778.99], ['2022-02-03', 6551.09],
  ['2022-03-02', 5178.14], ['2022-08-01', 7467.76], ['2022-09-01', 5290.73],
  ['2023-02-01', 8544.35], ['2023-03-02', 5218.88], ['2023-08-01', 7322.21],
  ['2023-09-01', 5180.88],
].map(([day, v]) => ({ day, v }));
check('결산 계단을 4번 센다', countResets(sawtooth, 0.9) === 4, `${countResets(sawtooth, 0.9)}번`);
check('평평한 계열에는 결산 계단이 없다', countResets(flat, 0.9) === 0, `${countResets(flat, 0.9)}번`);

console.log('\n=== 4. 수익률 검산 — 흘려넣은 값은 비우고 보정한 값은 남긴다 ===\n');
/** 하루 간격 계열을 만든다. */
function series(from, days, fn) {
  const out = [];
  const d = new Date(`${from}T00:00:00Z`);
  for (let i = 0; i < days; i += 1) {
    out.push({ day: d.toISOString().slice(0, 10), v: fn(i) });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

// (가) 원천이 계단을 그대로 흘려 넣은 경우 — 골든브릿지으뜸단기.
//     기준가가 974 → 3361 로 뛰었고 원천 1개월이 그 배율 그대로다. 비워야 한다.
{
  const daily = series('2026-07-01', 60, (i) => (i < 33 ? 974 + i * 0.01 : 3361.5));
  const sets = { '3m': daily, '1y': daily, '5y': daily };
  const src = { '1m': 244.939, '1d': 0.006 };
  const r = verifyReturns(src, sets);
  const dropped1m = (r.dropped || []).some((d) => d.period === '1m');
  check('계단을 먹은 1개월 값을 비운다', dropped1m && !(r.kept && r.kept['1m'] != null),
    JSON.stringify(r.dropped));
  check('버린 까닭을 계단으로 적는다',
    (r.dropped || []).some((d) => d.period === '1m' && d.reason === 'step'), '');
}

// (나) 원천이 보정한 경우 — KB연금미국S&P500.
//     결산으로 기준가가 3분의 1이 됐지만 원천 1개월은 +3.31% 다. 남겨야 한다.
//     계단만 보고 비웠으면 이런 값을 대량으로 버린다.
{
  const daily = series('2026-07-01', 60, (i) => (i < 33 ? 3000 + i : 1010 + i));
  const sets = { '3m': daily, '1y': daily, '5y': daily };
  const src = { '1m': 3.31 };
  const r = verifyReturns(src, sets);
  check('원천이 보정한 값은 남긴다', r.kept && r.kept['1m'] === 3.31,
    JSON.stringify(r.kept));
  check('남긴 근거(생값)를 적는다',
    (r.checked || []).some((c) => c.period === '1m' && c.raw != null),
    JSON.stringify(r.checked));
}

// (다) 계단이 없으면 건드리지 않는다. 기준일이 하루이틀 어긋나 생값과
//     조금 달라도 버리지 않는다 — 3개월 구간에서 표본의 18% 가 그렇게
//     어긋났고, 그걸 오류로 세면 멀쩡한 값을 통째로 버린다.
{
  const daily = series('2026-07-01', 60, (i) => 1000 * (1 + i * 0.001));
  const sets = { '3m': daily, '1y': daily, '5y': daily };
  const src = { '1m': 3.4, '1d': 0.1 };
  const r = verifyReturns(src, sets);
  check('계단이 없으면 원천 값을 그대로 싣는다',
    r.kept && r.kept['1m'] === 3.4 && r.kept['1d'] === 0.1, JSON.stringify(r.kept));
  check('계단이 없으면 버리는 것이 없다', !(r.dropped || []).length,
    JSON.stringify(r.dropped));
}

console.log('\n=== 5. 유형 → 투자 지역·자산군 ===\n');
// 원천이 준 유형 이름을 읽을 뿐, 분류를 지어내지 않는다.
for (const [type, region, asset] of [
  ['국내주식형', 'domestic', 'equity'],
  ['해외채권형', 'overseas', 'bond'],
  ['국내혼합형', 'domestic', 'mixed'],
  ['해외대체', 'overseas', 'alternative'],
  ['MMF', null, 'mmf'],
  ['기타형', null, 'other'],
]) {
  const got = splitType(type);
  check(`${type} → ${region ?? '미상'} · ${asset}`,
    got.region === region && got.assetClass === asset, JSON.stringify(got));
}
// 지역을 모르면 모르는 채로 둔다. 국내로 밀어 넣으면 "국내에 투자한다" 는
// 거짓 진술이 된다.
check('MMF 의 지역은 지어내지 않는다', splitType('MMF').region === null, '');
check('유형이 없으면 둘 다 모른다',
  splitType(null).region === null && splitType(null).assetClass === null, '');

console.log(`\n${pass}/${pass + failures.length} 통과`);
if (failures.length) {
  console.log('\n실패:');
  for (const f of failures) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`);
}
process.exit(failures.length ? 1 : 0);
