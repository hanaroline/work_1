// etfh_lib.mjs 단위시험 — 망 없이 돈다.  node scripts/etfh_test.mjs
import assert from 'node:assert/strict';
import { num, eokFromKorean, cleanBars, trIndex, periodReturns, addMonths, holdingKey } from './etfh_lib.mjs';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok', name); };

t('빈 값은 0 이 아니라 null', () => {
  for (const x of ['', ' ', null, undefined, '-', 'N/A', 'null', NaN, Infinity, {}, 'abc', '1.2.3']) assert.equal(num(x), null, String(x));
  assert.equal(num('0'), 0);
  assert.equal(num(0), 0);
  assert.equal(num('1,234.5'), 1234.5);
  assert.equal(num('34.17%'), 34.17);
  assert.equal(num({ raw: 0.08, fmt: '8%' }), 0.08);
});

t('억 단위 글자', () => {
  assert.equal(eokFromKorean('1조 8,838억'), 18838);
  assert.equal(eokFromKorean('-1,259억'), -1259);
  assert.equal(eokFromKorean('41.4억'), 41.4);
  assert.equal(eokFromKorean('-1.47억'), -1.47);
  assert.equal(eokFromKorean('24조 8,359억'), 248359);
  assert.equal(eokFromKorean('3조'), 30000);
  assert.equal(eokFromKorean('5,000만'), 0.5);
  assert.equal(eokFromKorean(''), null);
  assert.equal(eokFromKorean('-'), null);
  assert.equal(eokFromKorean(null), null);
});

t('종가가 빈 봉·0 봉은 버린다', () => {
  const b = cleanBars([{ d: '2026-01-02', c: '100' }, { d: '2026-01-03', c: '' }, { d: '2026-01-04', c: null }, { d: '2026-01-05', c: 0 }, { d: '2026-01-06', c: 110 }]);
  assert.deepEqual(b.map((x) => x.d), ['2026-01-02', '2026-01-06']);
  const idx = trIndex(b, []);
  assert.equal(idx[1], 1.1);
});

t('분배금은 락일 종가에 더한다 · 휴장일 분배는 다음 거래일로', () => {
  const b = cleanBars([{ d: '2026-01-02', c: 100 }, { d: '2026-01-05', c: 98 }, { d: '2026-01-06', c: 99 }]);
  // 1/3(토) 락 → 1/5 에 붙음: (98+2)/100 = 1.0
  const idx = trIndex(b, [{ d: '2026-01-03', a: 2 }, { d: '2025-12-01', a: 5 }, { d: '2026-01-06', a: '' }]);
  assert.equal(idx[1], 1);
  assert.ok(Math.abs(idx[2] - 99 / 98) < 1e-12);
});

t('월 빼기는 말일을 넘지 않는다', () => {
  assert.equal(addMonths('2026-03-31', -1), '2026-02-28');
  assert.equal(addMonths('2024-02-29', -12), '2023-02-28');
  assert.equal(addMonths('2026-09-28', -120), '2016-09-28');
});

t('기간 수익률 · 연율은 기하평균 · 이력이 모자라면 비운다', () => {
  // 매 영업일 봉 대신 날마다 봉(간단히): 10년 동안 두 배
  const bars = [];
  const start = Date.UTC(2016, 0, 1), end = Date.UTC(2026, 8, 28);
  for (let t = start; t <= end; t += 864e5) bars.push({ d: new Date(t).toISOString().slice(0, 10), c: 100 * Math.pow(2, (t - start) / (end - start)) });
  const { base, r } = periodReturns(bars, trIndex(bars));
  assert.equal(base, '2026-09-28');
  // 3년 누적 = 2^(3y/총기간) 이지만 연율은 (끝/시작)^(1/3)-1 이어야 한다
  const years = (end - start) / 864e5 / 365.25;
  const exp3 = Math.pow(Math.pow(2, (Date.UTC(2026, 8, 28) - Date.UTC(2023, 8, 28)) / (end - start)), 1 / 3) - 1;
  assert.ok(Math.abs(r.Y3.v - exp3 * 100) < 1e-3, `${r.Y3.v} vs ${exp3 * 100}`);
  assert.equal(r.Y3.from, '2023-09-28');
  assert.ok(r.Y10 !== null && r.Y10.from === '2016-09-28');
  assert.equal(r.YTD.from, '2025-12-31');
  assert.ok(years > 10);
  // 이력이 3년뿐이면 5·10년은 null
  const short = bars.filter((x) => x.d >= '2023-06-01');
  const r2 = periodReturns(short, trIndex(short)).r;
  assert.equal(r2.Y5, null);
  assert.equal(r2.Y10, null);
  assert.ok(r2.Y3);
});

t('시작 봉이 목표일에서 10일 넘게 떨어져 있으면 비운다(구멍·정지)', () => {
  const bars = cleanBars([{ d: '2026-01-02', c: 100 }, { d: '2026-09-25', c: 120 }, { d: '2026-09-28', c: 121 }]);
  const r = periodReturns(bars, trIndex(bars)).r;
  assert.equal(r.M1, null);
  assert.ok(r.D1);
});

t('봉이 하나뿐이면 전부 비운다', () => {
  const bars = cleanBars([{ d: '2026-09-28', c: 100 }]);
  const r = periodReturns(bars, trIndex(bars)).r;
  for (const v of Object.values(r)) assert.equal(v, null);
});

t('편입종목 열쇠 — 코드 우선, 없으면 소문자 이름', () => {
  assert.equal(holdingKey({ code: '005930', name: '삼성전자' }), 'c:005930');
  assert.equal(holdingKey({ code: null, name: 'SP 0 05/15/55' }), 'n:sp 0 05/15/55');
  assert.equal(holdingKey({ code: '', name: 'Apple  Inc' }), holdingKey({ code: '', name: 'apple inc' }));
});

console.log(`\n${n}개 통과`);
