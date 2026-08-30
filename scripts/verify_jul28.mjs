#!/usr/bin/env node
/**
 * 2026-07-28 ~ 07-30 의 봉이 진짜인가.
 *
 *   node scripts/verify_jul28.mjs
 *
 * 1개월 수익률이 국내 1,137종목 중 477종목에서 네이버와 5%p 넘게, 239종목에서
 * 10%p 넘게 벌어졌다. **전부 우리 쪽이 높다.** 계통적이라는 뜻이다.
 *
 * 원인은 기준봉 하나다. 네이버는 8/27 기준이라 1개월 기준일이 7/27,
 * 우리는 8/28 기준이라 7/28 이다. 그런데 야후가 주는 442580 의 종가가
 *
 *   07-27  106,620
 *   07-28   92,645   (-13.1%)
 *   07-29   85,550   ( -7.7%)
 *   07-30   81,025   ( -5.3%)
 *   07-31  103,770   (+28.1%)
 *
 * 사흘 만에 -24% 갔다가 하루에 +28% 돌아온다. 국내 가격제한폭은 ±30% 라
 * 규칙에는 걸리지 않지만, 이런 왕복이 **모든 국내 ETF 에서 동시에** 일어났다면
 * 그것은 시장이 아니라 자료를 의심해야 한다. 우리 계단 감지기는 ×0.6~×1.7 만
 * 잡으므로 이 폭은 그냥 지나간다.
 *
 * 가른다.
 *   1) 네이버 자신의 일별 시세에 같은 값이 있는가
 *   2) 코스피 지수도 그날 그렇게 움직였는가
 * 야후에만 있고 네이버·지수에 없으면 야후 봉이 깨진 것이다.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { getJson } from './etf_lib.mjs';

const OUT = 'tools/discovery/verify_jul28.md';
const out = [];
const say = (s = '') => { out.push(s); console.log(s); };

const FROM = '2026-07-22';
const TO = '2026-08-06';
const day = (s) => new Date(s * 1000).toISOString().slice(0, 10);

say('# 2026-07-28 ~ 07-30 봉 검증');
say('');

/* ── 야후 ─────────────────────────────────────────────────────────────── */
async function yahoo(symbol) {
  const j = await getJson(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}` +
    '?range=3mo&interval=1d');
  const r = j?.chart?.result?.[0];
  const ts = r?.timestamp || [];
  const cl = r?.indicators?.quote?.[0]?.close || [];
  const m = new Map();
  for (let i = 0; i < ts.length; i += 1) if (cl[i] != null) m.set(day(ts[i]), cl[i]);
  return m;
}

/* ── 네이버 일별 시세 ─────────────────────────────────────────────────── */
// m.stock.naver.com 의 일별 시세. 화면이 쓰는 것과 같은 경로다.
async function naver(code) {
  const j = await getJson(
    `https://api.stock.naver.com/chart/domestic/item/${code}/day` +
    `?startDateTime=202607220000&endDateTime=202608070000`,
    { headers: { Referer: 'https://m.stock.naver.com/' } });
  const list = Array.isArray(j) ? j : (j?.priceInfos || j?.result || []);
  const m = new Map();
  for (const row of list) {
    const d = String(row.localDate || row.localDateTime || '').slice(0, 8);
    const c = Number(row.closePrice ?? row.closeprice ?? row.close);
    if (d.length === 8 && Number.isFinite(c)) {
      m.set(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, c);
    }
  }
  return m;
}

const TARGETS = [
  { code: '442580', ySym: '442580.KS', name: 'PLUS 글로벌HBM반도체' },
  { code: '069500', ySym: '069500.KS', name: 'KODEX 200' },
  { code: '091230', ySym: '091230.KS', name: 'TIGER 반도체' },
  { code: '122630', ySym: '122630.KS', name: 'KODEX 레버리지' },
];

for (const t of TARGETS) {
  say(`## ${t.code} ${t.name}`);
  say('');
  let y = new Map(), n = new Map(), yErr = null, nErr = null;
  try { y = await yahoo(t.ySym); } catch (e) { yErr = e.message; }
  try { n = await naver(t.code); } catch (e) { nErr = e.message; }
  if (yErr) say(`- 야후 오류: ${yErr}`);
  if (nErr) say(`- 네이버 오류: ${nErr}`);
  const days = [...new Set([...y.keys(), ...n.keys()])]
    .filter((d) => d >= FROM && d <= TO).sort();
  if (!days.length) { say('- 겹치는 날이 없다'); say(''); continue; }
  say('| 날짜 | 야후 | 네이버 | 차이 |');
  say('| --- | ---: | ---: | ---: |');
  for (const d of days) {
    const a = y.get(d), b = n.get(d);
    const diff = a != null && b != null ? ((a / b - 1) * 100).toFixed(2) + '%' : '—';
    say(`| ${d} | ${a == null ? '—' : a.toLocaleString()} | ${b == null ? '—' : b.toLocaleString()} | ${diff} |`);
  }
  const bad = days.filter((d) => {
    const a = y.get(d), b = n.get(d);
    return a != null && b != null && Math.abs(a / b - 1) > 0.02;
  });
  say('');
  say(`**2% 넘게 어긋난 날: ${bad.length}** ${bad.length ? '— ' + bad.join(', ') : ''}`);
  say('');
}

/* ── 코스피 지수 ──────────────────────────────────────────────────────── */
say('## 코스피 지수 (^KS11) — 그날 시장이 실제로 그렇게 움직였나');
say('');
try {
  const k = await yahoo('%5EKS11');
  const days = [...k.keys()].filter((d) => d >= FROM && d <= TO).sort();
  say('| 날짜 | 코스피 | 전일 대비 |');
  say('| --- | ---: | ---: |');
  let prev = null;
  for (const d of days) {
    const v = k.get(d);
    say(`| ${d} | ${v.toFixed(2)} | ${prev == null ? '—' : ((v / prev - 1) * 100).toFixed(2) + '%'} |`);
    prev = v;
  }
} catch (e) { say(`- 오류: ${e.message}`); }
say('');

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT, out.join('\n') + '\n');
console.log(`\n기록: ${OUT}`);
