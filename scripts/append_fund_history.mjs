#!/usr/bin/env node
/**
 * 설정원본 이력 적립 — 자금유입을 계산하기 위한 시계열.
 *
 *   node scripts/append_fund_history.mjs
 *   data/fund-kr.js  ->  data/fund-history.js  (window.FUND_HISTORY)
 *
 * ── 왜 순자산이 아니라 설정원본인가 ─────────────────────────────────────────
 *
 * 이 파일의 존재 이유가 여기에 있다. 둘을 바꿔 쓰면 화면이 통째로 틀린다.
 *
 *   순자산   = 설정원본 × 기준가/1000     ← 수익률이 섞여 있다
 *   설정원본 = 좌수 × 1,000               ← 설정·해지로만 움직인다
 *
 * 407종목으로 확인한 항등식이 그것이다(tools/discovery/fund_fields_verify.md):
 *
 *   derivedNav / derivedAum == basePrice / 1000     (393/407 이 오차 1% 안)
 *
 * 곧 **설정원본의 차이가 곧 자금 순유입**이다. 순자산의 차이를 쓰면 시장이
 * 오른 것과 돈이 들어온 것을 구별하지 못한다 — 3개월 동안 아무도 안 샀는데
 * 지수가 20% 오른 펀드가 "자금유입 상위" 에 오르게 된다. 그건 거짓말이다.
 *
 * 네이버가 ETF 유입을 계산하는 방식도 같다(설정액 증감).
 *
 * ── 왜 별도 파일인가 ────────────────────────────────────────────────────────
 *
 * data/fund.js 는 25MB 다. 일일 워크플로가 자료 커밋을 **덮어쓰기** 때문에
 * (fund-daily.yml 의 커밋 단계 참고) git 이력에서 어제 설정액을 꺼낼 길이
 * 없다. 그래서 시계열은 스스로 쌓아야 한다.
 *
 * 이 파일은 펀드당 숫자 하나뿐이라 하루 30KB 안팎이고, 내용이 누적되므로
 * 덮어쓰기와 충돌하지 않는다 — 최신 blob 하나에 전체 이력이 들어 있다.
 *
 * ── 날짜는 tradeDate 다 ─────────────────────────────────────────────────────
 *
 * 잡을 돌린 날이 아니라 원천이 밝힌 **기준일**로 적는다. 펀드 기준가는
 * 직전 영업일 기준으로 실리므로 둘이 하루 어긋난다. 실제로 3,196개가
 * 전부 같은 tradeDate 를 갖고 있어 열의 날짜는 하나로 정해진다.
 */

import { readFile, access } from 'node:fs/promises';
import { writeDataFile } from './etf_lib.mjs';

const OUT = 'data/fund-history.js';
const SRC = 'data/fund-kr.js';

// 설정액이 이만큼도 안 차 있으면 그날 열을 만들지 않는다. 반쪽짜리 열은
// 3개월 뒤에 "그날 대량 환매가 있었다" 는 거짓 신호로 읽힌다.
const MIN_COVERAGE = 0.9;

/** window.X = {...}; 꼴 파일을 읽어 값을 꺼낸다. */
async function loadDataFile(path, globalName) {
  try { await access(path); } catch { return null; }
  const src = await readFile(path, 'utf8');
  const sandbox = { window: {} };
  // eslint-disable-next-line no-new-func
  new Function('window', src)(sandbox.window);
  return sandbox.window[globalName] || null;
}

const kr = await loadDataFile(SRC, 'FUND_KR');
if (!kr?.funds?.length) {
  console.error(`[history] ${SRC} 에 펀드가 없다 — 적립하지 않는다`);
  process.exit(0);
}

const hist = (await loadDataFile(OUT, 'FUND_HISTORY')) || {
  field: 'aum',
  fieldNote: '설정원본(액면 1,000 기준). 순자산이 아니다 — 수익률이 섞이지 않는다.',
  unit: 'KRW',
  codes: [],
  dates: [],
  aum: [],
  columns: [],
};

// ── 그날의 기준일 ───────────────────────────────────────────────────────────
// 전부 같은 값일 것으로 보이지만 확인하고 적는다. 어긋나는 것이 있으면
// 가장 많은 날짜를 열의 날짜로 삼고 **몇 개가 어긋났는지 남긴다** —
// 조용히 뭉개면 3개월 뒤에 왜 튀는지 알 길이 없다.
const dateCount = {};
for (const f of kr.funds) {
  if (f.tradeDate) dateCount[f.tradeDate] = (dateCount[f.tradeDate] || 0) + 1;
}
const ranked = Object.entries(dateCount).sort((a, b) => b[1] - a[1]);
if (!ranked.length) {
  console.error('[history] tradeDate 가 하나도 없다 — 적립하지 않는다');
  process.exit(0);
}
const date = ranked[0][0];
const offDate = kr.funds.length - ranked[0][1];

// ── 설정액이 얼마나 차 있나 ─────────────────────────────────────────────────
// null 을 0 으로 바꾸지 않는다. 없는 것을 0 이라고 말하면 "설정액이 0원" 이
// 되고, 3개월 뒤 차이를 낼 때 전액 환매로 읽힌다.
const snapshot = new Map();
for (const f of kr.funds) {
  if (!f.code) continue;
  const v = f.aum;
  if (v == null || !Number.isFinite(Number(v))) continue;
  snapshot.set(f.code, Number(v));
}
const coverage = snapshot.size / kr.funds.length;
console.log(`[history] 기준일 ${date} · 설정액 ${snapshot.size}/${kr.funds.length} ` +
            `(${(coverage * 100).toFixed(1)}%)` + (offDate ? ` · 기준일 다른 것 ${offDate}` : ''));

if (coverage < MIN_COVERAGE) {
  // 열을 만들지 않되 **왜 안 만들었는지는 파일에 남긴다.** 아무것도 안 쓰면
  // 3개월 뒤에 구멍만 보이고 이유가 없다.
  hist.columns.push({ date, skipped: true, coverage: +coverage.toFixed(4),
                      reason: `설정액 확보율 ${(coverage * 100).toFixed(1)}% < ${MIN_COVERAGE * 100}%`,
                      at: new Date().toISOString() });
  hist.updatedAt = new Date().toISOString();
  await writeDataFile(OUT, 'FUND_HISTORY', hist, `설정원본 이력 ${new Date().toISOString()}`);
  console.error(`[history] 확보율 미달 — ${date} 열을 만들지 않았다`);
  process.exit(0);
}

// ── 코드 축 ─────────────────────────────────────────────────────────────────
// 한 번 들어간 코드는 빼지 않는다. 빼면 지난 열의 자리가 밀려 통째로 어긋난다.
const codeIndex = new Map(hist.codes.map((c, i) => [c, i]));
let added = 0;
for (const code of snapshot.keys()) {
  if (!codeIndex.has(code)) {
    codeIndex.set(code, hist.codes.length);
    hist.codes.push(code);
    added += 1;
  }
}
// 코드가 늘었으면 지난 열의 꼬리를 null 로 채운다. 그 펀드는 그날 없었거나
// 못 받은 것이고, 어느 쪽이든 0 이 아니다.
if (added) for (const row of hist.aum) while (row.length < hist.codes.length) row.push(null);

const column = hist.codes.map((c) => (snapshot.has(c) ? snapshot.get(c) : null));

// ── 열을 넣는다 ─────────────────────────────────────────────────────────────
// 같은 기준일을 두 번 적립하지 않는다(하루에 두 번 돌 수 있다). 덮어쓴다.
const at = hist.dates.indexOf(date);
if (at >= 0) {
  hist.aum[at] = column;
  console.log(`[history] ${date} 은 이미 있다 — 덮어쓴다`);
} else {
  // 날짜 오름차순을 지킨다. 과거를 나중에 채워 넣는 경우(금투협 소급)가 있다.
  let pos = hist.dates.findIndex((d) => d > date);
  if (pos < 0) pos = hist.dates.length;
  hist.dates.splice(pos, 0, date);
  hist.aum.splice(pos, 0, column);
}

hist.columns = hist.columns.filter((c) => !(c.date === date && !c.skipped));
hist.columns.push({
  date,
  from: 'naver-daily',
  funds: snapshot.size,
  total: kr.funds.length,
  coverage: +coverage.toFixed(4),
  offDate,
  at: new Date().toISOString(),
});
hist.columns.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
hist.updatedAt = new Date().toISOString();

await writeDataFile(OUT, 'FUND_HISTORY', hist, `설정원본 이력 ${new Date().toISOString()}`);

const span = hist.dates.length > 1 ? `${hist.dates[0]} ~ ${hist.dates[hist.dates.length - 1]}` : date;
console.log(`[history] 열 ${hist.dates.length}개 · 코드 ${hist.codes.length}개 · ${span}`);

// 3개월 유입을 내려면 60영업일쯤 필요하다. 아직 못 낸다는 것을 매번 알린다 —
// 조용히 빈칸으로 두면 "왜 자금유입이 안 나오나" 를 다시 조사하게 된다.
if (hist.dates.length < 2) {
  console.log('[history] 아직 한 열뿐이다. 자금유입은 두 열 이상이라야 낼 수 있다.');
}
