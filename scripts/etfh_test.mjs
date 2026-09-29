// etfh_lib.mjs 단위시험 — 망 없이 돈다.  node scripts/etfh_test.mjs
import assert from 'node:assert/strict';
import { num, eokFromKorean, cleanBars, trIndex, periodReturns, addMonths, holdingKey } from './etfh_lib.mjs';
import { hasWord, matchList, levInv, loadDict, fromCategory } from './etfh_classify.mjs';

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

// ── 이름 맞추기 — 실제로 겪은 오분류 셋 ──
const G = { 금: ['금융', '금리'], 은: ['은행'] };
t("'고배당주' 가 'US' 로 미국에 걸리지 않는다 (PLUS 안의 US)", () => {
  assert.equal(hasWord('PLUS 고배당주', 'US'), false);
  assert.equal(hasWord('PLUS고배당주', 'US'), false);
  assert.equal(hasWord('TIGER 미국S&P500 / US', 'US'), true);
  assert.equal(hasWord('Vanguard U.S. Growth', 'U.S.'), true);
});
t("'Dividend Equity' 가 'IT' 테마에 걸리지 않는다", () => {
  assert.equal(hasWord('Schwab US Dividend Equity ETF', 'IT'), false);
  assert.equal(hasWord('KODEX IT', 'IT'), true);
  assert.equal(hasWord('TIGER 200 IT', 'it'), true);
});
t("'금융'·'은행' 이 '금'·'은' 으로 원자재에 걸리지 않는다", () => {
  assert.equal(matchList('TIGER 200 금융', ['금', 'Gold'], G), false);
  assert.equal(matchList('KODEX CD금리액티브', ['금'], G), false);
  assert.equal(matchList('KODEX 은행', ['은'], G), false);
  assert.equal(matchList('ACE KRX금현물', ['금'], G), true);
  assert.equal(matchList('KODEX 은선물(H)', ['은'], G), true);
  assert.equal(matchList('TIGER 금은선물(H)', ['은'], G), true);
});
t('띄어쓰기를 지운 형태도 보되, 원래 형태를 놓치지 않는다', () => {
  assert.equal(hasWord('SPDR Gold Shares', 'GOLD'), true);
  assert.equal(hasWord('KODEX 2차전지산업', '2차 전지'), true);
  assert.equal(hasWord('SOL 2차 전지', '2차전지'), true);
  assert.equal(hasWord('S&P 500 Index', 'S&P500'), true);
});
t("'!' 낱말은 뺀다", () => {
  assert.equal(matchList('KODEX 반도체 레버리지', ['반도체', '!레버리지']), false);
  assert.equal(matchList('KODEX 반도체', ['반도체', '!레버리지']), true);
});
t('레버리지·인버스 — 울트라 국채선물은 레버리지가 아니다', () => {
  const d = loadDict();
  assert.equal(levInv({ name: 'KODEX 미국30년국채울트라선물(H)' }, d), null);
  assert.equal(levInv({ name: 'KODEX 200선물인버스2X' }, d), 'I');
  assert.equal(levInv({ name: 'KODEX 레버리지' }, d), 'L');
  assert.equal(levInv({ name: 'Direxion Daily Semiconductor Bull 3X Shares' }, d), 'L');
  assert.equal(levInv({ name: 'iShares Short Treasury Bond ETF' }, d), null);
  assert.equal(levInv({ name: 'ProShares UltraPro QQQ', category: 'Trading--Leveraged Equity' }, d), 'L');
  assert.equal(levInv({ name: 'x', summary: '일간변동률의 음의 2배수를 추적' }, d), 'I');
  // 'Ultra Short-Term' 은 단기채다 (띄어쓰기를 지우면 UltraShort 처럼 보인다)
  assert.equal(levInv({ name: 'IBK 초단기채권액티브', nameEn: 'IBK Ultra Short-Term Bond Active' }, d), null);
  assert.equal(levInv({ name: 'CSOP Leveraged and Inverse Series - CSOP Hang Seng TECH Index Daily (2x) Leveraged Product' }, d), 'L');
  assert.equal(levInv({ name: 'CSOP Leveraged and Inverse Series - CSOP Nikkei 225 Daily (-2x) Inverse Product' }, d), 'I');
  assert.equal(levInv({ name: 'KODEX 200선물인버스2X', wiseType: '국내파생, 인버스' }, d), 'I');
});
t('야후 분류명', () => {
  assert.deepEqual(fromCategory('Intermediate Core Bond'), { asset: '채권', region: '미국' });
  assert.deepEqual(fromCategory('Japan Stock'), { asset: '주식', region: '일본' });
  assert.deepEqual(fromCategory('Commodities Focused'), { asset: '원자재', region: '글로벌·기타' });
  assert.deepEqual(fromCategory('Foreign Large Blend'), { asset: '주식', region: '글로벌·기타' });
});

console.log(`\n${n}개 통과`);
