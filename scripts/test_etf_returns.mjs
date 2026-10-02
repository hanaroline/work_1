#!/usr/bin/env node
/**
 * 수익률 계산기의 방어선을 실제로 관측된 값으로 못 박는다.
 *
 *   node scripts/test_etf_returns.mjs
 *
 * 세 가지 사고가 실제로 화면까지 나갔다. 그 셋을 그대로 재현해 두고,
 * 다시 새어 나가면 여기서 걸리게 한다. 숫자는 지어내지 않았다 —
 * tools/discovery/etf_audit_verify.md 에 적힌 관측값 그대로다.
 */

import { computeReturns } from './etf_lib.mjs';

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass += 1; console.log(`  ✓ ${name}`); }
  else { fail += 1; console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
}

/** 하루 간격 일봉을 만든다. day 0 이 가장 과거. */
function series(closes, startDay = '2025-08-01') {
  const t0 = Math.floor(new Date(`${startDay}T00:00:00Z`).getTime() / 1000);
  const ts = closes.map((_, i) => t0 + i * 86400);
  return { ts, closes };
}

// ── 1. 주가의 15배짜리 분배금 (381560 HANARO Fn전기&수소차) ────────────────
// 야후가 18,475원 ETF 에 주당 287,320.78원을 기록했다. 이 한 건이 6개월
// 총수익률을 +16.79% 에서 +1837.03% 로 밀어 올렸다.
console.log('\n1. 주가의 15배짜리 분배금은 버린다');
{
  const closes = Array.from({ length: 400 }, (_, i) => 10000 + i * 20);
  const { ts } = series(closes);
  const badDay = ts[200];
  const r = computeReturns(ts, closes, null,
    { a: { date: badDay, amount: 287320.78 } }, null);
  check('총수익률이 시장가수익률과 자릿수로 다르지 않다',
        r.tr?.M3 != null && Math.abs(r.tr.M3 - r.price.M3) < 1,
        `price.M3=${r.price?.M3} tr.M3=${r.tr?.M3}`);
  check('버린 레코드를 anomalies 로 남긴다',
        (r.anomalies || []).some((a) => a.action === 'dropped' && a.ratio > 10),
        JSON.stringify(r.anomalies));
}

// 반대로 **정상 분배금은 반영해야 한다.** 방어가 과해서 진짜 분배금까지
// 버리면 커버드콜의 성과가 통째로 사라진다 — 그게 애초에 총수익률을
// 만든 이유였다.
console.log('\n2. 정상 분배금은 그대로 반영한다');
{
  const closes = Array.from({ length: 400 }, () => 10000);
  const { ts } = series(closes);
  // 월 1.5% 씩 12번 = 연 18% 짜리 커버드콜
  const divs = {};
  for (let i = 0; i < 12; i += 1) divs[`d${i}`] = { date: ts[30 + i * 30], amount: 150 };
  const r = computeReturns(ts, closes, null, divs, null);
  check('가격이 그대로면 시장가수익률은 0',
        Math.abs(r.price.Y1) < 0.01, `price.Y1=${r.price.Y1}`);
  check('총수익률은 분배금만큼 오른다 (연 18% 안팎)',
        r.tr.Y1 > 14 && r.tr.Y1 < 22, `tr.Y1=${r.tr.Y1}`);
  check('정상 분배금은 버리지 않는다',
        !(r.anomalies || []).some((a) => a.action === 'dropped'),
        JSON.stringify(r.anomalies));
}

// ── 3. 설명되지 않는 종가 계단 (2558.T MAXIS S&P500) ──────────────────────
// 분할 이벤트 없이 종가가 1/10 이 됐다. 그 구간을 그냥 나누면 -89.75% 가
// 나온다. S&P500 을 담은 ETF 가 석 달에 90% 빠질 수는 없다.
console.log('\n3. 설명되지 않는 계단이 낀 구간은 값을 내지 않는다');
{
  // 계단을 끝에서 70일쯤 앞에 둔다 — 3개월·6개월 창은 이걸 건너뛰고
  // 1개월 창은 계단 뒤쪽만 본다. 두 경우를 한 번에 가르려는 것이다.
  const closes = [];
  for (let i = 0; i < 330; i += 1) closes.push(20000);
  for (let i = 0; i < 70; i += 1) closes.push(2000);    // 330일째에 1/10
  const { ts } = series(closes);
  const r = computeReturns(ts, closes, null, null, null);
  check('계단을 건너뛰는 6개월은 빠진다', r.price?.M6 == null, `price.M6=${r.price?.M6}`);
  check('계단을 건너뛰는 3개월도 빠진다', r.price?.M3 == null, `price.M3=${r.price?.M3}`);
  check('계단 뒤쪽만 보는 1개월은 살아 있다',
        r.price?.M1 != null && Math.abs(r.price.M1) < 0.01, `price.M1=${r.price?.M1}`);
  check('계단을 anomalies 로 남긴다',
        (r.anomalies || []).some((a) => a.action === 'break'), JSON.stringify(r.anomalies?.slice(0, 2)));
}

// ── 4. 액면분할은 이벤트가 있으면 되돌린다 ────────────────────────────────
// 계단을 무조건 버리는 게 아니다. 분할이라고 적혀 있으면 과거 가격을
// 오늘 기준으로 되돌려 **정상 수익률을 낸다.**
console.log('\n4. 분할 이벤트가 있으면 되돌려 값을 낸다');
{
  const closes = [];
  for (let i = 0; i < 200; i += 1) closes.push(20000);
  for (let i = 0; i < 200; i += 1) closes.push(2000);
  const { ts } = series(closes);
  const r = computeReturns(ts, closes, null, null,
    { s: { date: ts[200], numerator: 10, denominator: 1 } });
  check('10:1 분할을 되돌리면 6개월 수익률은 0',
        r.price?.M6 != null && Math.abs(r.price.M6) < 0.01, `price.M6=${r.price?.M6}`);
  check('분할로 설명되면 계단으로 적지 않는다',
        !(r.anomalies || []).some((a) => a.action === 'break'), JSON.stringify(r.anomalies));
}

// ── 5. 내포분배율 한도 ────────────────────────────────────────────────────
// 분배금이 하나하나는 30% 아래라도 여러 건이 겹쳐 지수를 부풀릴 수 있다.
// 마지막 관문이 그것까지 잡는지 본다.
console.log('\n5. 내포분배율이 한도를 넘으면 그 구간은 빈칸이다');
{
  const closes = Array.from({ length: 400 }, () => 10000);
  const { ts } = series(closes);
  const divs = {};
  // 매주 2.5% — 연 130% 짜리는 존재하지 않는다
  for (let i = 0; i < 52; i += 1) divs[`d${i}`] = { date: ts[30 + i * 7], amount: 250 };
  const r = computeReturns(ts, closes, null, divs, null);
  check('1년 총수익률을 내보내지 않는다', r.tr?.Y1 == null, `tr.Y1=${r.tr?.Y1}`);
  check('시장가수익률은 그대로 낸다', r.price?.Y1 != null, `price.Y1=${r.price?.Y1}`);
  check('왜 뺐는지 남긴다',
        (r.anomalies || []).some((a) => a.action === 'tr-dropped'), JSON.stringify(r.anomalies?.slice(-2)));
}

console.log(`\n통과 ${pass} · 실패 ${fail}`);
process.exit(fail ? 1 : 0);
