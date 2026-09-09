#!/usr/bin/env node
/**
 * 야후 일봉이 왜 한 세션 뒤졌나 — 되짚기.
 *
 *   node scripts/verify_chart_lag.mjs
 *   -> tools/discovery/verify_chart_lag.md
 *
 * 2026-09-09 09:12(KST) 수집분에서 이런 그림이 나왔다.
 *
 *   국내(네이버) 1,166종목  기준일 09-08   ← 맞다
 *   일본(야후)      22종목  기준일 09-08   ← 맞다
 *   홍콩(야후)      16종목  기준일 09-07   ← 한 세션 뒤짐
 *   중국(야후)      25종목  기준일 09-07   ← 한 세션 뒤짐
 *   미국(야후)     120종목  기준일 09-04   ← 한 세션 뒤짐(9/7 은 노동절 휴장)
 *
 * 그런데 같은 종목의 **시세(quote)는 움직였다**. SPY 는 770.19 → 765.96 으로
 * 바뀌었는데 일봉 기준일과 D1(-0.39%)은 두 수집분이 글자까지 똑같았다.
 * 시세는 새 것을 주고 일봉은 옛 것을 주고 있다는 뜻이다.
 *
 * 짐작으로 고치면 안 되므로 원천에 직접 물어 가른다. 가설은 둘이다.
 *
 *   (가) 야후가 아직 그 세션의 일봉을 안 만들었다 — 어떤 range 로 물어도
 *        마지막 봉이 같은 날일 것이다. 그러면 우리가 할 일은 "늦게 한 번 더
 *        받는 것" 이지 코드를 고치는 것이 아니다.
 *   (나) range=5y 응답만 캐시가 묵었다 — 짧은 range 는 새 봉을 준다.
 *        그러면 수집기가 5년치와 최근치를 이어 붙이면 된다.
 *
 * 두 가설의 답이 다르므로, range 를 바꿔 가며 마지막 봉 날짜를 적어 둔다.
 * 함께 meta.regularMarketTime(원천이 말하는 마지막 체결 시각)도 적는다 —
 * 그 시각이 일봉보다 최신이면 "안 만들었다" 는 (가)가 무너진다.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { getJson, UA } from './etf_lib.mjs';

const RANGES = ['5y', '1y', '6mo', '3mo', '1mo', '5d'];
const SYMBOLS = [
  ['SPY', '미국'], ['IVV', '미국'], ['QQQ', '미국'],
  ['2800.HK', '홍콩'], ['3033.HK', '홍콩'],
  ['510300.SS', '중국(상하이)'], ['159919.SZ', '중국(선전)'],
  ['1306.T', '일본'], ['1321.T', '일본'],
];

const ymd = (sec, tzOffset = 0) =>
  new Date((sec + tzOffset) * 1000).toISOString().slice(0, 10);

async function probe(symbol, range) {
  try {
    const j = await getJson(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
      `?range=${range}&interval=1d&events=div,split`, { headers: { 'User-Agent': UA } });
    const r = j?.chart?.result?.[0];
    const ts = r?.timestamp || [];
    const meta = r?.meta || {};
    const off = Number(meta.gmtoffset) || 0;
    return {
      ok: true,
      bars: ts.length,
      last: ts.length ? ymd(ts[ts.length - 1], off) : null,
      prev: ts.length > 1 ? ymd(ts[ts.length - 2], off) : null,
      // 원천이 말하는 마지막 체결 시각. 일봉보다 최신이면 봉을 안 만든 게 아니라
      // 이 응답이 묵은 것이다.
      marketTime: Number.isFinite(Number(meta.regularMarketTime))
        ? ymd(Number(meta.regularMarketTime), off) : null,
      marketTimeUtc: Number.isFinite(Number(meta.regularMarketTime))
        ? new Date(Number(meta.regularMarketTime) * 1000).toISOString().replace('.000', '') : null,
      price: meta.regularMarketPrice ?? null,
      lastClose: r?.indicators?.quote?.[0]?.close?.slice(-1)?.[0] ?? null,
      periodStart: Number(meta.currentTradingPeriod?.regular?.start) || null,
      periodEnd: Number(meta.currentTradingPeriod?.regular?.end) || null,
    };
  } catch (err) {
    return { ok: false, err: String(err && err.message || err) };
  }
}

const now = new Date();
const lines = [];
const say = (s = '') => { lines.push(s); console.log(s); };

say('# 야후 일봉 지연 되짚기');
say('');
say(`실행 시각: ${now.toISOString()} (KST ${new Date(now.getTime() + 9 * 3600e3).toISOString().slice(0, 19).replace('T', ' ')})`);
say('');
say('range 를 바꿔 가며 **마지막 일봉 날짜**를 적는다. 값이 range 마다 다르면');
say('캐시 문제(가설 나), 전부 같으면 원천이 아직 그 봉을 안 만든 것(가설 가)이다.');
say('');
say('| 종목 | 시장 | ' + RANGES.map((r) => '`' + r + '`').join(' | ') + ' | 원천 마지막 체결 | 현재가 |');
say('|---|---|' + RANGES.map(() => '---').join('|') + '|---|---:|');

const table = [];
for (const [sym, mkt] of SYMBOLS) {
  const row = { sym, mkt, byRange: {} };
  for (const range of RANGES) row.byRange[range] = await probe(sym, range);
  const any = RANGES.map((r) => row.byRange[r]).find((x) => x.ok) || {};
  row.marketTime = any.marketTime; row.price = any.price;
  table.push(row);
  say(`| ${sym} | ${mkt} | ` +
      RANGES.map((r) => (row.byRange[r].ok ? (row.byRange[r].last || '없음') : '✗ ' + row.byRange[r].err)).join(' | ') +
      ` | ${any.marketTime || '—'} | ${any.price ?? '—'} |`);
}

say('');
say('## 판정');
say('');
let verdictLines = 0;
for (const row of table) {
  const lasts = [...new Set(RANGES.map((r) => row.byRange[r].last).filter(Boolean))];
  const fresh = lasts.sort()[lasts.length - 1];
  const stale = RANGES.filter((r) => row.byRange[r].last && row.byRange[r].last < fresh);
  if (stale.length) {
    say(`- **${row.sym}** — range 마다 다르다. 가장 새 봉 \`${fresh}\`, 뒤진 range: ` +
        stale.map((r) => `\`${r}\`(${row.byRange[r].last})`).join(', ') + ' → **캐시 문제(나)**');
    verdictLines += 1;
  } else if (row.marketTime && fresh && row.marketTime > fresh) {
    say(`- **${row.sym}** — 어떤 range 로 물어도 마지막 봉이 \`${fresh}\` 인데 ` +
        `원천이 말하는 마지막 체결일은 \`${row.marketTime}\` 이다 → **봉을 아직 안 만들었다(가)**`);
    verdictLines += 1;
  } else {
    say(`- ${row.sym} — 모든 range 가 \`${fresh}\` 로 같고 마지막 체결일도 같다 → 뒤진 것이 없다`);
    verdictLines += 1;
  }
}
if (!verdictLines) say('- 판정할 자료를 못 받았다.');

await mkdir('tools/discovery', { recursive: true });
await writeFile('tools/discovery/verify_chart_lag.md', lines.join('\n') + '\n');
await writeFile('tools/discovery/verify_chart_lag.json',
  JSON.stringify({ at: now.toISOString(), ranges: RANGES, rows: table }, null, 1));
console.log('\n[verify] tools/discovery/verify_chart_lag.md 기록');
