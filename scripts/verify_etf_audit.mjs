#!/usr/bin/env node
/**
 * 감사에서 나온 의심을 야후·네이버 원자료로 되짚는다.
 *
 *   node scripts/verify_etf_audit.mjs
 *   -> tools/discovery/etf_audit_verify.{json,md}
 *
 * 로컬 감사(scripts/audit_etf_data.mjs)가 data/etf.js 안에서 앞뒤가 안 맞는
 * 것들을 잡아냈다. 그중 둘은 바깥 자료를 봐야 원인을 말할 수 있다.
 *
 *   가. HANARO Fn전기&수소차(381560) 의 총수익률이 6개월 +1837% 로 찍혔다.
 *       시장가수익률은 +16.79% 로 멀쩡하다. 즉 **분배금 재투자 지수만**
 *       깨졌다. 배수가 M6·YTD·Y1 모두 정확히 16.58 배로 같으므로,
 *       3~6개월 전 어느 하루에 분배금 한 건이 주가의 15.6 배로 들어갔다.
 *       그 레코드를 눈으로 확인한다.
 *
 *   나. MAXIS S&P500(2558.T) 의 3개월 수익률이 -89.75% 다. S&P500 을 담은
 *       ETF 가 석 달에 90% 빠질 수 없다. 그리고 이번엔 시장가와 총수익률이
 *       **함께** 틀렸다 — 분배금이 아니라 **주식분할**이다.
 *       수집기는 `events=div` 만 요청한다. 분할을 아예 안 받는다.
 *
 * 그리고 셋째, 감사가 드러낸 설계 문제를 판정한다.
 *
 *   다. 화면의 price·tr 은 야후에서, nav 는 네이버에서 온다. 서로 다른
 *       원천을 한 표에 나란히 놓았다. 사용자의 브리핑 화면(네이버)이
 *       1개월 +23.79% 인데 이 도구(야후)는 +18.13% 다.
 *       **어느 쪽이 맞나** — 네이버 일별시세 원가격으로 직접 다시 계산해
 *       가른다. 숫자를 고르는 게 아니라 원가격에서 되짚는다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { getJson, getJsonIn, UA, mapLimit, sleep } from './etf_lib.mjs';

const OUT_JSON = 'tools/discovery/etf_audit_verify.json';
const OUT_MD = 'tools/discovery/etf_audit_verify.md';
const YH = { Referer: 'https://finance.yahoo.com/' };
const out = { at: new Date().toISOString(), divBlowup: [], splits: [], basis: [], errors: [] };

/** 야후 일봉 + 분배 + 분할. 분할을 반드시 같이 받는다 — 이번 사고의 핵심이다. */
async function chart(sym, range = '2y') {
  const j = await getJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}` +
    `?range=${range}&interval=1d&events=div,split`, { headers: YH });
  const r = j?.chart?.result?.[0];
  if (!r) return null;
  const ts = r.timestamp || [];
  const close = r.indicators?.quote?.[0]?.close || [];
  const adj = r.indicators?.adjclose?.[0]?.adjclose || [];
  // KST 로 환산해 날짜를 만든다. UTC 로 찍으면 모든 봉이 하루 밀린다.
  const byDay = new Map();
  const rows = [];
  for (let i = 0; i < ts.length; i += 1) {
    if (close[i] == null) continue;
    const day = new Date((ts[i] + 9 * 3600) * 1000).toISOString().slice(0, 10);
    rows.push({ day, c: close[i], a: adj[i] ?? close[i] });
    byDay.set(day, close[i]);
  }
  const dayOf = (t) => new Date((Number(t) + 9 * 3600) * 1000).toISOString().slice(0, 10);
  const divs = Object.values(r.events?.dividends || {})
    .map((d) => ({ day: dayOf(d.date), amount: Number(d.amount) }))
    .filter((d) => Number.isFinite(d.amount));
  const splits = Object.values(r.events?.splits || {})
    .map((s) => ({ day: dayOf(s.date), num: Number(s.numerator), den: Number(s.denominator),
                   ratio: Number(s.splitRatio ?? `${s.numerator}/${s.denominator}`) }));
  return { rows, byDay, divs, splits };
}

// ── 가. 분배금 레코드가 지수를 터뜨린 자리 ────────────────────────────────
console.log('=== 가. 분배금 이상치 (381560 HANARO Fn전기&수소차) ===');
for (const sym of ['381560.KS']) {
  try {
    const c = await chart(sym, '2y');
    if (!c) { out.errors.push(`${sym}: 차트 없음`); continue; }
    const row = { symbol: sym, bars: c.rows.length, divs: [], splits: c.splits };
    console.log(`  봉 ${c.rows.length}개 · 분배 ${c.divs.length}건 · 분할 ${c.splits.length}건`);
    for (const d of c.divs) {
      const px = c.byDay.get(d.day) ?? null;
      const ratio = px ? d.amount / px : null;
      row.divs.push({ ...d, close: px, ratioToClose: ratio ? +ratio.toFixed(4) : null });
      const bad = ratio != null && ratio > 0.5;   // 주가의 절반을 넘는 분배금은 없다
      console.log(`    ${bad ? '!!' : '  '} ${d.day}  분배 ${d.amount}  종가 ${px}` +
                  (ratio != null ? `  → 주가 대비 ${(ratio * 100).toFixed(1)}%` : '  → 그날 종가 없음'));
    }
    // 분할이 있으면 종가에 계단이 생긴다. 인접 봉의 급변을 같이 찍는다.
    for (let i = 1; i < c.rows.length; i += 1) {
      const j = c.rows[i].c / c.rows[i - 1].c;
      if (j > 1.5 || j < 0.67) console.log(`    ## ${c.rows[i].day} 종가 계단 ${c.rows[i - 1].c} → ${c.rows[i].c} (${j.toFixed(3)}배)`);
    }
    out.divBlowup.push(row);
  } catch (e) { out.errors.push(`${sym}: ${e.message}`); console.log(`  ✗ ${sym} ${e.message}`); }
}

// ── 나. 분할이 몇 종목에 있나 ──────────────────────────────────────────────
// 수집기가 events=div 만 요청하므로, 분할이 있는 종목은 수익률이 전부 틀렸다.
// 국내 전 종목을 훑어 규모를 확정한다. 답이 "몇 종목"이어야 고칠 수 있다.
console.log('\n=== 나. 주식분할 전수 조사 ===');
let LIST = [];
try {
  const j = await getJsonIn('https://finance.naver.com/api/sise/etfItemList.nhn', 'euc-kr',
    { headers: { Referer: 'https://finance.naver.com/sise/etf.naver' } });
  LIST = (j?.result?.etfItemList || []).map((x) => `${x.itemcode}.KS`);
} catch (e) { out.errors.push(`목록: ${e.message}`); }
// 감사에서 걸린 해외 종목도 같이 본다.
const EXTRA = ['2558.T', '2559.T', '1306.T', '1321.T', '2801.HK', '2823.HK', 'QYLD', 'XYLD'];
const SYMS = [...LIST, ...EXTRA];
console.log(`  대상 ${SYMS.length}종목`);

const splitRes = await mapLimit(SYMS, 5, async (sym) => {
  const c = await chart(sym, '2y');
  await sleep(60);
  if (!c) return null;
  // 분할 이벤트가 있거나, 이벤트 없이 종가에 큰 계단이 있으면 둘 다 적는다.
  const jumps = [];
  for (let i = 1; i < c.rows.length; i += 1) {
    const j = c.rows[i].c / c.rows[i - 1].c;
    if (j > 1.8 || j < 0.56) jumps.push({ day: c.rows[i].day, from: c.rows[i - 1].c, to: c.rows[i].c, x: +j.toFixed(3) });
  }
  const bigDiv = c.divs.map((d) => {
    const px = c.byDay.get(d.day);
    return px && d.amount / px > 0.5 ? { ...d, close: px, x: +(d.amount / px).toFixed(3) } : null;
  }).filter(Boolean);
  if (!c.splits.length && !jumps.length && !bigDiv.length) return null;
  return { symbol: sym, splits: c.splits, jumps, bigDiv };
}, (done, total) => { if (done % 100 === 0) console.log(`    ${done}/${total}`); });

for (const r of splitRes) {
  if (!r?.ok || !r.value) continue;
  const v = r.value;
  out.splits.push(v);
  console.log(`  ${v.symbol}  분할 ${v.splits.length} · 계단 ${v.jumps.length} · 과대분배 ${v.bigDiv.length}`);
  for (const s of v.splits) console.log(`      분할 ${s.day} ${s.num}:${s.den}`);
  for (const j of v.jumps.slice(0, 3)) console.log(`      계단 ${j.day} ${j.from} → ${j.to} (${j.x}배)`);
  for (const b of v.bigDiv) console.log(`      과대분배 ${b.day} ${b.amount} / 종가 ${b.close} = ${b.x}배`);
}
console.log(`  → 영향 종목 ${out.splits.length} / ${SYMS.length}`);

// ── 다. 네이버 표기 vs 야후 계산 — 원가격에서 가른다 ──────────────────────
// 숫자 둘 중 하나를 고르는 게 아니다. 네이버 일별시세(원가격)로 우리가
// 직접 다시 계산해, 어느 쪽이 그 원가격과 맞는지 본다.
console.log('\n=== 다. 1개월 수익률 — 네이버 표기 / 야후 계산 / 원가격 재계산 ===');
const SAMPLE = ['381560', '069500', '360750', '133690', '102110', '243880', '472150', '305720'];

/** 네이버 일별시세(원가격). 비표준 JSON 이라 손으로 고쳐 읽는다. */
async function naverDaily(code) {
  const url = 'https://api.finance.naver.com/siseJson.naver' +
    `?symbol=${code}&requestType=1&startTime=20240101&endTime=20991231&timeframe=day`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: `https://finance.naver.com/item/main.naver?code=${code}` },
                                 signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  const arr = JSON.parse(text.replace(/'/g, '"'));
  return arr.slice(1).map((r) => ({ day: `${r[0].slice(0, 4)}-${r[0].slice(4, 6)}-${r[0].slice(6)}`, c: Number(r[4]) }))
            .filter((r) => Number.isFinite(r.c) && r.c > 0);
}

for (const code of SAMPLE) {
  const row = { code };
  try {
    // 네이버가 화면에 싣는 값
    const d = await getJson(`https://m.stock.naver.com/api/stock/${code}/etfAnalysis`,
      { headers: { Referer: `https://m.stock.naver.com/domestic/stock/${code}/total` } });
    row.name = d?.itemName;
    const pm = {};
    for (const p of d?.returnPerformanceList || []) pm[p.periodType || p.period] = Number(p.rate ?? p.value);
    row.naverPublished = pm;
    row.naverAsOf = d?.returnPerformanceReferenceDate;

    // 원가격에서 우리가 직접
    const daily = await naverDaily(code);
    row.bars = daily.length;
    if (daily.length > 25) {
      const last = daily[daily.length - 1];
      const cut = new Date(last.day); cut.setMonth(cut.getMonth() - 1);
      const cutS = cut.toISOString().slice(0, 10);
      let base = null;
      for (const r of daily) { if (r.day <= cutS) base = r; else break; }
      row.recomputedM1 = base ? +(((last.c / base.c) - 1) * 100).toFixed(2) : null;
      row.recomputeBase = base ? { day: base.day, close: base.c } : null;
      row.recomputeLast = { day: last.day, close: last.c };
    }

    // 야후가 주는 원가격으로도 같은 규칙으로
    const c = await chart(`${code}.KS`, '1y');
    if (c && c.rows.length > 25) {
      const last = c.rows[c.rows.length - 1];
      const cut = new Date(last.day); cut.setMonth(cut.getMonth() - 1);
      const cutS = cut.toISOString().slice(0, 10);
      let base = null;
      for (const r of c.rows) { if (r.day <= cutS) base = r; else break; }
      row.yahooM1 = base ? +(((last.c / base.c) - 1) * 100).toFixed(2) : null;
      row.yahooBase = base ? { day: base.day, close: base.c } : null;
      row.yahooLast = { day: last.day, close: last.c };
    }
    console.log(`  ${code} ${row.name || ''}`);
    console.log(`     네이버 표기 1개월 ${row.naverPublished?.['1개월'] ?? JSON.stringify(row.naverPublished).slice(0, 90)}`);
    console.log(`     네이버 원가격 재계산 ${row.recomputedM1}%  (${row.recomputeBase?.day} ${row.recomputeBase?.close} → ${row.recomputeLast?.day} ${row.recomputeLast?.close})`);
    console.log(`     야후 원가격 재계산  ${row.yahooM1}%  (${row.yahooBase?.day} ${row.yahooBase?.close} → ${row.yahooLast?.day} ${row.yahooLast?.close})`);
  } catch (e) { row.error = String(e.message || e).slice(0, 160); console.log(`  ✗ ${code} ${row.error}`); }
  out.basis.push(row);
  await sleep(200);
}

// ── 기록 ──────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# ETF 감사 — 원자료 되짚기', '', `조사 시각: ${out.at}`, '',
  '로컬 감사가 잡은 의심을 야후·네이버 원자료로 확인한 결과다.', '',
  '## 가. 분배금 이상치', ''];
for (const r of out.divBlowup) {
  md.push(`### ${r.symbol} — 봉 ${r.bars}개`, '', '| 배당일 | 금액 | 그날 종가 | 주가 대비 |', '|---|---:|---:|---:|');
  for (const d of r.divs) md.push(`| ${d.day} | ${d.amount} | ${d.close ?? '-'} | ${d.ratioToClose != null ? (d.ratioToClose * 100).toFixed(1) + '%' : '-'} |`);
  md.push('');
}
md.push('## 나. 분할·계단·과대분배가 있는 종목', '', `영향 ${out.splits.length}종목`, '',
  '| 종목 | 분할 | 종가 계단 | 과대분배 |', '|---|---|---|---|');
for (const v of out.splits) {
  md.push(`| ${v.symbol} | ${v.splits.map((s) => `${s.day} ${s.num}:${s.den}`).join('<br>') || '-'} | ` +
    `${v.jumps.slice(0, 3).map((j) => `${j.day} ${j.x}배`).join('<br>') || '-'} | ` +
    `${v.bigDiv.map((b) => `${b.day} ${b.x}배`).join('<br>') || '-'} |`);
}
md.push('', '## 다. 1개월 수익률 — 어느 쪽이 원가격과 맞나', '',
  '| 종목 | 네이버 표기 | 네이버 원가격 재계산 | 야후 원가격 재계산 |', '|---|---:|---:|---:|');
for (const r of out.basis) {
  md.push(`| ${r.code} ${r.name || ''} | ${r.naverPublished?.['1개월'] ?? '-'} | ${r.recomputedM1 ?? '-'} | ${r.yahooM1 ?? '-'} |`);
}
if (out.errors.length) md.push('', '## 오류', '', ...out.errors.map((e) => `- ${e}`));
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[verify] ${OUT_MD} · ${OUT_JSON} 기록`);
