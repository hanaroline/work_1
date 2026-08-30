#!/usr/bin/env node
/**
 * 442580 PLUS 글로벌HBM반도체 — 화면과 네이버가 어긋나는 두 자리를 가른다.
 *
 *   node scripts/verify_442580.mjs
 *
 * 기준일이 다르다(네이버 8/27, 우리 8/28). 8/28 하루가 -3.85% 였으므로
 * 네이버 값을 하루 굴려 보면 대부분 맞아떨어진다.
 *
 *   6개월   53.76% → 47.84%   우리 47.84%   차 -0.00%p
 *   연초이후 136.36% → 127.26%  우리 127.26%  차 -0.00%p
 *   3년(연율) 100.18% → 97.58%  우리 97.49%   차 -0.09%p
 *   1년     394.27% → 375.24%  우리 370.52%  차 -4.72%p  (1년 전 하루가 빠짐)
 *
 * 그런데 **1개월만 반대로 간다.**
 *
 *   1개월   -4.98% → -8.64%    우리 +5.14%   차 +13.78%p
 *
 * 하루치 -3.85% 를 얹었는데 값이 올라갈 수는 없다. 기준일을 잘못 잡았거나,
 * 두 곳이 "1개월"을 다르게 세고 있다는 뜻이다. 원가격 계열을 직접 찍어 본다.
 *
 * 그리고 네이버가 "주식형 ETF 평균 수익률" 이라 부르는 값이 1년 387.01% 다.
 * 국내 주식형 ETF 전체 평균이 387% 일 수는 없다. 그 값이 실제로 어느 무리의
 * 평균인지 원자료에서 확인한다 — 우리 화면의 "동일 유형 평균" 42.71% 와
 * 무엇이 다른지 말할 수 있어야 한다.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { getJson } from './etf_lib.mjs';

const CODE = '442580';
const OUT = 'tools/discovery/verify_442580.md';

const out = [];
const say = (s = '') => { out.push(s); console.log(s); };

say('# 442580 PLUS 글로벌HBM반도체 — 되짚기');
say('');

/* ── 1. 원가격 계열 — "1개월" 의 기준일이 어디인가 ─────────────────────── */
say('## 1. 원가격 계열 (야후)');
say('');

const chart = await getJson(
  `https://query1.finance.yahoo.com/v8/finance/chart/${CODE}.KS` +
  '?range=6mo&interval=1d&events=div,split');
const r = chart?.chart?.result?.[0];
const ts = r?.timestamp || [];
const cl = r?.indicators?.quote?.[0]?.close || [];
const day = (s) => new Date(s * 1000).toISOString().slice(0, 10);

const bars = [];
for (let i = 0; i < ts.length; i += 1) if (cl[i] != null) bars.push({ d: day(ts[i]), c: cl[i] });
say(`- 봉 ${bars.length}개 · ${bars[0]?.d} ~ ${bars[bars.length - 1]?.d}`);
say(`- 분할 이벤트: ${JSON.stringify(r?.events?.splits ?? null)}`);
say(`- 분배 이벤트: ${JSON.stringify(Object.values(r?.events?.dividends ?? {}).map((x) => day(x.date) + ' ' + x.amount))}`);
say('');

const lastBar = bars[bars.length - 1];
say(`마지막 봉: **${lastBar.d} · ${lastBar.c.toLocaleString()}원**`);
say('');
say('7월 20일 ~ 8월 5일 종가 (1개월 기준일이 이 근처에 떨어진다):');
say('');
say('| 날짜 | 종가 | 마지막 봉 대비 |');
say('| --- | ---: | ---: |');
for (const b of bars.filter((x) => x.d >= '2026-07-20' && x.d <= '2026-08-05')) {
  say(`| ${b.d} | ${b.c.toLocaleString()} | ${((lastBar.c / b.c - 1) * 100).toFixed(2)}% |`);
}
say('');

// 우리 계산기가 고르는 기준일을 그대로 재현한다.
const lastT = ts[ts.length - 1] * 1000;
const back = (fn) => { const d = new Date(lastT); fn(d); return d.getTime(); };
const CUT = {
  '1주': back((d) => d.setDate(d.getDate() - 7)),
  '1개월': back((d) => d.setMonth(d.getMonth() - 1)),
  '3개월': back((d) => d.setMonth(d.getMonth() - 3)),
};
say('우리 계산기가 고르는 기준봉 (cutoff 이하의 마지막 봉):');
say('');
say('| 기간 | cutoff | 고른 봉 | 종가 | 수익률 |');
say('| --- | --- | --- | ---: | ---: |');
for (const [k, cut] of Object.entries(CUT)) {
  let base = null;
  for (let i = 0; i < ts.length; i += 1) { if (ts[i] * 1000 <= cut) base = bars[i]; else break; }
  say(`| ${k} | ${new Date(cut).toISOString().slice(0, 10)} | ${base?.d ?? '—'}` +
      ` | ${base ? base.c.toLocaleString() : '—'}` +
      ` | ${base ? ((lastBar.c / base.c - 1) * 100).toFixed(2) + '%' : '—'} |`);
}
say('');

/* ── 2. 네이버가 "평균" 이라 부르는 것 ────────────────────────────────── */
say('## 2. 네이버의 "평균 ETF 수익률" 은 무엇의 평균인가');
say('');

const nv = await getJson(`https://m.stock.naver.com/api/stock/${CODE}/etfAnalysis`,
  { headers: { Referer: 'https://m.stock.naver.com/' } });

say('`themeReturns` (네이버 화면의 회색 막대가 여기서 온다):');
say('');
say('```json');
say(JSON.stringify(nv?.themeReturns, null, 2).slice(0, 3000));
say('```');
say('');
say('`returnPerformanceList` (붉은 막대 — 이 ETF 자신):');
say('');
say('```json');
say(JSON.stringify(nv?.returnPerformanceList, null, 2).slice(0, 2000));
say('```');
say('');
say('`navPerformanceList` (기준가 기준):');
say('');
say('```json');
say(JSON.stringify(nv?.navPerformanceList, null, 2).slice(0, 2000));
say('```');
say('');
say(`- 네이버 기준일: 수익률 ${nv?.returnPerformanceReferenceDate} · 기준가 ${nv?.navPerformanceReferenceDate}`);
say(`- 총보수 ${nv?.totalFee} · 순자산 ${nv?.totalNav} · 추적오차 ${nv?.chaseErrorRate}`);
say('');

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT, out.join('\n') + '\n');
console.log(`\n기록: ${OUT}`);
