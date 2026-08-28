#!/usr/bin/env node
/**
 * 수익률 계열 정합성 검산 — 화면의 두 수익률이 정말 라벨대로인가.
 *
 *   node scripts/check_etf_return_basis.mjs
 *
 * 이 화면은 총수익률(ret.tr)을 기본 기준으로 쓴다. 국내·해외 모두 야후 일별
 * 수정종가로 같은 계산기를 돌린 값이어야 한다. 원천이 바뀌거나 한쪽만 다른
 * 값으로 채워지면 랭킹이 서로 다른 개념을 비교하게 된다. 눈으로는 못 잡는다.
 *
 * 그래서 분배율을 지렛대로 삼아 판정한다.
 *
 *   - 두 계열의 차이가 **분배율만큼** 벌어지면 → 한쪽이 분배금을 재투자한
 *     총수익률(TR)이다.
 *   - 분배율이 20% 인데도 차이가 0 에 가까우면 → 둘 다 분배금을 빼고 있고,
 *     차이는 괴리율(시장가 vs 기준가) 뿐이다.
 *
 * 판정 결과가 시장마다 다르면 실패로 친다. 그것이 "한 열에 두 계열이 섞였다"
 * 는 뜻이고, 이 도구가 저지르면 안 되는 오류다.
 *
 * ret.tr 이 아예 없는 시장은 판정 대상이 아니다. 국내가 그렇다 — 원천에
 * 분배금 이력이 없어 총수익률을 싣지 못했다(collect_etf_kr.mjs 설명 참고).
 * 없는 것을 없다고 두는 것과, 틀린 것을 넣는 것은 다르다.
 */

import { readFile } from 'node:fs/promises';

const DATA = 'data/etf.js';
const PERIOD = 'Y1';          // 분배금 효과가 뚜렷하게 드러나는 구간
const MIN_YIELD = 3;          // 분배율이 이 이상인 종목만 본다 (신호가 커야 판정된다)
const MIN_SAMPLE = 5;

const src = await readFile(DATA, 'utf8');
const win = {};
// eslint-disable-next-line no-new-func
new Function('window', src)(win);
const etfs = win.ETF_DATA?.etfs || [];
if (!etfs.length) {
  console.error('[basis] data/etf.js 에 종목이 없다');
  process.exit(1);
}

const median = (xs) => {
  const a = xs.slice().sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

/** 한 시장의 두 계열이 무엇인지 판정한다. */
function diagnose(market) {
  const rows = etfs.filter((e) =>
    e.market === market &&
    e.dividendYield != null && e.dividendYield >= MIN_YIELD &&
    e.ret?.price?.[PERIOD] != null && e.ret?.tr?.[PERIOD] != null);
  if (rows.length < MIN_SAMPLE) return { market, sample: rows.length, verdict: 'insufficient' };

  // 분배금이 반영됐다면 (2계열 - 1계열) 이 분배율만큼 나와야 한다.
  const gaps = rows.map((e) => e.ret.tr[PERIOD] - e.ret.price[PERIOD]);
  const yields = rows.map((e) => e.dividendYield);
  const medGap = median(gaps);
  const medYield = median(yields);
  // 분배율 대비 차이의 비율. 1 에 가까우면 분배금 재투자, 0 에 가까우면 미반영.
  const ratio = medYield ? medGap / medYield : 0;

  let verdict;
  if (ratio > 0.5) verdict = 'total_return';        // 분배금 재투자 = 총수익률
  else if (Math.abs(ratio) < 0.2) verdict = 'price_like';  // 분배금 미반영
  else verdict = 'ambiguous';

  return { market, sample: rows.length, medGap, medYield, ratio, verdict };
}

const LABEL = {
  total_return: '분배금 재투자 (총수익률 TR)',
  price_like: '분배금 미반영 (차이는 괴리율뿐)',
  ambiguous: '판정 불가 — 사람이 봐야 한다',
  insufficient: '표본 부족',
};

const markets = [...new Set(etfs.map((e) => e.market))].sort();
const results = markets.map(diagnose);

// tr 이 실린 종목 수를 시장별로 먼저 보고한다 — 어디가 비었는지가 먼저 보여야 한다.
const trCoverage = {};
for (const e of etfs) {
  trCoverage[e.market] = trCoverage[e.market] || { total: 0, withTr: 0 };
  trCoverage[e.market].total += 1;
  if (e.ret?.tr) trCoverage[e.market].withTr += 1;
}
console.log('[basis] 총수익률 수록:', Object.entries(trCoverage)
  .map(([m, c]) => `${m} ${c.withTr}/${c.total}`).join(' · '));
console.log(`[basis] 기준 ${PERIOD} · 분배율 ${MIN_YIELD}% 이상 종목\n`);
console.log('시장   표본  분배율(중앙)  두 계열 차이  차이/분배율  판정');
for (const r of results) {
  if (r.verdict === 'insufficient') {
    console.log(`${r.market.padEnd(6)} ${String(r.sample).padStart(4)}  ${'—'.padStart(11)}  ${'—'.padStart(11)}  ${'—'.padStart(10)}  ${LABEL[r.verdict]}`);
    continue;
  }
  console.log(
    `${r.market.padEnd(6)} ${String(r.sample).padStart(4)}  ` +
    `${r.medYield.toFixed(2).padStart(11)}  ${r.medGap.toFixed(2).padStart(11)}  ` +
    `${r.ratio.toFixed(2).padStart(10)}  ${LABEL[r.verdict]}`);
}

// ── 판정: 두 번째 계열의 뜻이 시장마다 같아야 한다
const decided = results.filter((r) => r.verdict === 'total_return' || r.verdict === 'price_like');
const kinds = [...new Set(decided.map((r) => r.verdict))];

console.log('');
if (kinds.length > 1) {
  console.error(
    '[basis] 실패 — 총수익률(ret.tr) 의 뜻이 시장마다 다르다.\n' +
    `        ${decided.map((r) => `${r.market}=${LABEL[r.verdict]}`).join(' / ')}\n` +
    '        ret.tr 은 두 시장에서 같은 뜻이어야 한다. 한쪽이 분배금을 빼고\n' +
    '        있으면 랭킹이 다른 것끼리 비교하게 된다.');
  process.exit(1);
}
if (!decided.length) {
  // "아직 안 채워졌다" 와 "틀렸다" 는 다르다. 총수익률이 아예 없으면 화면이
  // 그 기준을 내걸지 않으므로(HAS_TR 이 거짓) 거짓말이 나가지 않는다.
  // 이 게이트가 막아야 하는 것은 "총수익률이라고 실렸는데 총수익률이 아닌 것" 이다.
  console.log('[basis] 판정 대상 없음 — 총수익률이 실린 시장이 없다. ' +
              '화면은 이 기준을 내걸지 않으므로 통과로 둔다.');
  process.exit(0);
}
if (kinds[0] !== 'total_return') {
  console.error('[basis] 실패 — ret.tr 이 분배금을 반영하지 않는다. 총수익률이 아니다.');
  process.exit(1);
}
console.log('[basis] 통과 — ret.tr 이 모든 시장에서 분배금을 재투자한 총수익률이다.');
