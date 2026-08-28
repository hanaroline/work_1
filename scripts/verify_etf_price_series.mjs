#!/usr/bin/env node
/**
 * 야후 시장가와 네이버 시장가가 왜 다른가 — 원가격으로 되짚는다.
 *
 *   node scripts/verify_etf_price_series.mjs
 *   -> tools/discovery/etf_price_series.{json,md}
 *
 * 화면은 지금 야후 일봉으로 만든 시장가·총수익률을 싣는다. 그런데 같은
 * 종목의 1년 수익률이 네이버 표기와 크게 다르다. KODEX 200 은 147 vs 155,
 * TIGER 배당커버드콜액티브는 76 vs 131 이다. 뒤엣것은 기준일이 며칠
 * 어긋난 정도로는 설명이 안 되는 폭이다.
 *
 * 한쪽으로 통일해 놨으므로 화면 안에서는 아귀가 맞는다. 하지만 **어느 쪽이
 * 맞는지는 아직 모른다.** 모르는 것을 모른다고만 두면 언젠가 틀린 쪽으로
 * 굳는다. 그래서 두 곳의 '숫자' 가 아니라 '원가격' 을 받아 직접 되짚는다.
 *
 * 되짚는 방법:
 *
 *   1. 네이버 일별시세(siseJson)와 야후 일봉을 같이 받는다.
 *   2. 날짜를 맞춰 종가를 한 줄씩 대조한다 — 두 곳의 가격 자체가 같은가?
 *   3. 같은 규칙(마지막 봉 기준 1년 전)으로 각각 1년 수익률을 다시 계산한다.
 *   4. 그 값을 네이버가 화면에 내건 값과 맞춰 본다.
 *
 * 지렛대는 또 분배율이다. 분배를 하지 않는 종목(레버리지·인버스)에서는
 * 어떤 계열이든 값이 같아야 한다. 거기서 갈라지면 가격 자체가 다른 것이고,
 * 분배율이 높은 종목에서만 갈라지면 네이버의 '시장가' 가 실은 분배금을
 * 반영한 수정 계열이라는 뜻이다. 둘은 원인이 다르고 처방도 다르다.
 *
 * 이 스크립트는 판정만 한다. 데이터를 고치지 않는다.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/etf_price_series.json';
const OUT_MD = 'tools/discovery/etf_price_series.md';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const NAVER_SISE = (code, from, to) =>
  `https://api.finance.naver.com/siseJson.naver?symbol=${code}` +
  `&requestType=1&startTime=${from}&endTime=${to}&timeframe=day`;

const NAVER_ANALYSIS = (code) =>
  `https://m.stock.naver.com/api/stock/${code}/etfAnalysis`;

const YAHOO_CHART = (sym) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${sym}` +
  `?range=2y&interval=1d&events=div,split`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, headers = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * 네이버 일별시세.
 *
 * 정식 JSON 이 아니다. 따옴표가 홑따옴표이고 헤더 줄이 한글이라 그대로는
 * 못 읽는다. 홑따옴표만 바꿔 주면 배열로 읽힌다.
 */
async function naverDaily(code, from, to) {
  const text = await get(NAVER_SISE(code, from, to),
    { Referer: `https://finance.naver.com/item/main.naver?code=${code}` });
  const rows = JSON.parse(text.replace(/'/g, '"'));
  const out = [];
  for (const r of rows.slice(1)) {
    const d = String(r[0]);
    const c = Number(r[4]);
    if (!/^\d{8}$/.test(d) || !Number.isFinite(c) || c <= 0) continue;
    out.push({ day: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, close: c });
  }
  out.sort((a, b) => (a.day < b.day ? -1 : 1));
  return out;
}

/**
 * 야후 일봉.
 *
 * 한국 상장분의 봉 시각은 장 시작(09:00 KST)이라 UTC 로 찍으면 하루가
 * 밀린다. 네이버와 날짜를 맞춰야 하므로 KST 로 환산해 날짜를 만든다.
 * 이 환산을 빼먹으면 모든 봉이 하루씩 어긋나 대조가 통째로 무의미해진다.
 */
async function yahooDaily(sym) {
  const text = await get(YAHOO_CHART(sym), { Referer: 'https://finance.yahoo.com/' });
  const r = JSON.parse(text)?.chart?.result?.[0];
  if (!r) throw new Error('빈 응답');
  const ts = r.timestamp || [];
  const close = r.indicators?.quote?.[0]?.close || [];
  const adj = r.indicators?.adjclose?.[0]?.adjclose || [];
  const out = [];
  for (let i = 0; i < ts.length; i += 1) {
    const c = close[i];
    if (c == null || !Number.isFinite(c)) continue;
    const day = new Date((ts[i] + 9 * 3600) * 1000).toISOString().slice(0, 10);
    out.push({ day, close: c, adj: Number.isFinite(adj[i]) ? adj[i] : c });
  }
  out.sort((a, b) => (a.day < b.day ? -1 : 1));

  const divs = Object.values(r.events?.dividends || {})
    .map((d) => ({
      day: new Date((Number(d.date) + 9 * 3600) * 1000).toISOString().slice(0, 10),
      amount: Number(d.amount),
    }))
    .filter((d) => Number.isFinite(d.amount) && d.amount > 0);

  const splits = Object.values(r.events?.splits || {}).map((s) => ({
    day: new Date((Number(s.date) + 9 * 3600) * 1000).toISOString().slice(0, 10),
    ratio: s.splitRatio || `${s.numerator}:${s.denominator}`,
  }));

  return { rows: out, divs, splits };
}

/** 마지막 봉에서 1년 전으로 거슬러 올라간 봉을 기준으로 수익률을 낸다. */
function y1(rows, key = 'close') {
  if (rows.length < 2) return null;
  const last = rows[rows.length - 1];
  const d = new Date(`${last.day}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  const cutoff = d.toISOString().slice(0, 10);
  let base = null;
  for (const r of rows) { if (r.day <= cutoff) base = r; else break; }
  if (!base || base === last) return null;
  return {
    pct: +(((last[key] / base[key]) - 1) * 100).toFixed(2),
    from: base.day, fromClose: base[key], to: last.day, toClose: last[key],
  };
}

/** 분배금을 재투자한 계열로 1년 수익률을 낸다 (수집기와 같은 계산). */
function y1WithDiv(rows, divs) {
  if (rows.length < 2) return null;
  const byDay = new Map();
  for (const d of divs) byDay.set(d.day, (byDay.get(d.day) || 0) + d.amount);
  let idx = rows[0].close;
  const series = [{ day: rows[0].day, close: idx }];
  for (let i = 1; i < rows.length; i += 1) {
    idx *= (rows[i].close + (byDay.get(rows[i].day) || 0)) / rows[i - 1].close;
    series.push({ day: rows[i].day, close: idx });
  }
  return y1(series);
}

/** 두 종가 계열을 날짜로 맞춰 얼마나 어긋나는지 센다. */
function compare(a, b) {
  const mb = new Map(b.map((r) => [r.day, r.close]));
  const diffs = [];
  for (const r of a) {
    const other = mb.get(r.day);
    if (other == null) continue;
    diffs.push({ day: r.day, a: r.close, b: other, rel: (r.close - other) / other });
  }
  if (!diffs.length) return { common: 0 };
  const abs = diffs.map((d) => Math.abs(d.rel)).sort((x, y) => x - y);
  const worst = diffs.slice().sort((x, y) => Math.abs(y.rel) - Math.abs(x.rel))[0];
  return {
    common: diffs.length,
    medianRelPct: +(abs[Math.floor(abs.length / 2)] * 100).toFixed(4),
    maxRelPct: +(Math.abs(worst.rel) * 100).toFixed(2),
    maxAt: worst.day,
    over1pct: diffs.filter((d) => Math.abs(d.rel) > 0.01).length,
  };
}

// ── 표본 고르기 ────────────────────────────────────────────────────────────
// 분배율을 지렛대로 쓰므로 양 끝이 다 있어야 한다. 분배가 없는 종목과
// 분배가 큰 종목을 같이 넣고, 규모가 큰 것부터 고른다.
async function pickSample() {
  const src = await readFile('data/etf.js', 'utf8');
  const win = {};
  // eslint-disable-next-line no-new-func
  new Function('window', src)(win);
  const kr = (win.ETF_DATA?.etfs || []).filter((e) => e.market === 'KR' && e.aum);
  const byAum = (a, b) => (b.aum || 0) - (a.aum || 0);
  // 분배가 아예 없는 쪽(레버리지·인버스 등)이 지렛대의 한쪽 끝이다.
  const none = kr.filter((e) => !e.dividendYield).sort(byAum).slice(0, 3);
  const low = kr.filter((e) => e.dividendYield > 0 && e.dividendYield < 1).sort(byAum).slice(0, 4);
  const mid = kr.filter((e) => e.dividendYield >= 2 && e.dividendYield < 8).sort(byAum).slice(0, 3);
  const high = kr.filter((e) => e.dividendYield >= 8).sort(byAum).slice(0, 5);
  return [...none, ...low, ...mid, ...high].map((e) => ({
    code: e.code, name: e.name, yield: e.dividendYield,
    dataPrice: e.ret?.price?.Y1 ?? null, dataTr: e.ret?.tr?.Y1 ?? null,
    dataNav: e.ret?.nav?.Y1 ?? null,
  }));
}

// ── 실행 ──────────────────────────────────────────────────────────────────
const today = new Date();
const to = today.toISOString().slice(0, 10).replace(/-/g, '');
const fromD = new Date(today); fromD.setFullYear(fromD.getFullYear() - 2);
const from = fromD.toISOString().slice(0, 10).replace(/-/g, '');

const sample = await pickSample();
console.log(`[verify] 표본 ${sample.length}종목 · ${from}~${to}\n`);

const results = [];
for (const s of sample) {
  const row = { ...s };
  try {
    row.naver = await naverDaily(s.code, from, to);
  } catch (e) { row.naverError = String(e.message || e); }
  await sleep(200);
  try {
    const y = await yahooDaily(`${s.code}.KS`);
    row.yahoo = y.rows; row.divs = y.divs; row.splits = y.splits;
  } catch (e) { row.yahooError = String(e.message || e); }
  await sleep(200);
  try {
    const j = JSON.parse(await get(NAVER_ANALYSIS(s.code),
      { Referer: `https://m.stock.naver.com/domestic/stock/${s.code}/total` }));
    const pick = (list, k) => (list || []).find((x) => x.periodTypeCode === k)?.value ?? null;
    row.stated = {
      price: pick(j.returnPerformanceList, 'Y1'),
      nav: pick(j.navPerformanceList, 'Y1'),
      asOf: j.returnPerformanceReferenceDate,
      lastClose: Number(j.nav) || null,
    };
  } catch (e) { row.statedError = String(e.message || e); }
  await sleep(200);

  if (row.naver?.length) row.naverY1 = y1(row.naver);
  if (row.yahoo?.length) {
    row.yahooY1 = y1(row.yahoo);
    row.yahooAdjY1 = y1(row.yahoo, 'adj');
    row.yahooTrY1 = y1WithDiv(row.yahoo, row.divs || []);
  }
  if (row.naver?.length && row.yahoo?.length) row.cmp = compare(row.naver, row.yahoo);
  if (row.naver?.length && row.divs?.length) {
    row.naverTrY1 = y1WithDiv(row.naver, row.divs);
  }

  const f = (v) => (v == null ? '—' : (typeof v === 'number' ? v.toFixed(2) : v.pct.toFixed(2)));
  console.log(
    `${s.code} ${s.name.slice(0, 22).padEnd(24)} 분배 ${String(s.yield ?? '—').padStart(6)}%  ` +
    `네이버표기 ${f(row.stated?.price).padStart(8)}  네이버원가격 ${f(row.naverY1).padStart(8)}  ` +
    `야후원가격 ${f(row.yahooY1).padStart(8)}  야후+분배 ${f(row.yahooTrY1).padStart(8)}  ` +
    `종가차이(중앙) ${row.cmp ? `${row.cmp.medianRelPct}%` : '—'}`);

  results.push(row);
}

// ── 판정 ──────────────────────────────────────────────────────────────────
// 원가격끼리 맞는지, 표기값이 어느 계열에 붙는지를 따로 본다.
const usable = results.filter((r) => r.naverY1 && r.yahooY1 && r.stated?.price != null);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

const seriesAgree = usable.filter((r) => r.cmp && r.cmp.medianRelPct <= 0.1).length;
const rawAgree = usable.filter((r) => near(r.naverY1.pct, r.yahooY1.pct, 1)).length;
const statedIsRaw = usable.filter((r) => near(r.stated.price, r.naverY1.pct, 2)).length;
const statedIsTr = usable.filter((r) =>
  r.naverTrY1 && near(r.stated.price, r.naverTrY1.pct, 3)).length;

// 구간 안에 분배가 한 번도 없던 종목만 따로 — 분배율 표기가 아니라 실제
// 지급 이력으로 가른다. 여기서 갈리면 원인은 분배금이 아니다.
const noDiv = usable.filter((r) => (r.divs?.length ?? 0) === 0);
const noDivStatedIsRaw = noDiv.filter((r) => near(r.stated.price, r.naverY1.pct, 2)).length;

const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

console.log('');
say(`## 판정 (표본 ${usable.length}종목)`);
say('');
say(`- 두 곳의 **종가 계열**이 사실상 같은 종목: ${seriesAgree}/${usable.length} (일별 차이 중앙값 0.1% 이하)`);
say(`- 원가격으로 다시 계산한 1년 수익률이 서로 맞는 종목: ${rawAgree}/${usable.length} (±1%p)`);
say(`- 네이버 **표기값**이 네이버 **원가격** 계산과 맞는 종목: ${statedIsRaw}/${usable.length} (±2%p)`);
say(`- 네이버 표기값이 **분배금 재투자** 계산과 맞는 종목: ${statedIsTr}/${usable.length} (±3%p)`);
say(`- 구간 중 분배를 한 번도 안 한 종목에서 표기=원가격: ${noDivStatedIsRaw}/${noDiv.length}`);
say('');

const MIN_SAMPLE = 5;
let verdict;
if (usable.length < MIN_SAMPLE) {
  // 비율은 0/0 에서도 참이 된다. 표본이 없는데 "맞다" 고 말하는 것이
  // 이 되짚기가 저지르면 안 되는 오류다. 먼저 막는다.
  verdict = `표본 부족 — 세 곳을 다 받은 종목이 ${usable.length}개뿐이다. ` +
            '판정하지 않는다. 위의 오류 칸을 봐야 한다.';
} else if (seriesAgree >= usable.length * 0.8 && rawAgree >= usable.length * 0.8) {
  if (statedIsRaw >= usable.length * 0.8) {
    verdict = '두 곳의 가격도 같고 표기값도 원가격과 맞는다. 지금 화면 값이 맞다.';
  } else if (noDivStatedIsRaw >= noDiv.length * 0.8 && statedIsTr > statedIsRaw) {
    verdict = '가격 자체는 두 곳이 같다. 네이버 표기 "시장가" 는 실은 분배금을 ' +
              '반영한 수정 계열이다 — 우리 price 가 진짜 시장가격 수익률이고, ' +
              '네이버 표기와 견줄 상대는 우리 tr 이다.';
  } else {
    verdict = '가격은 같은데 표기값이 어느 계열과도 안 맞는다. 사람이 봐야 한다.';
  }
} else if (seriesAgree < usable.length * 0.5) {
  verdict = '두 곳의 종가 계열 자체가 다르다. 분배금 문제가 아니라 가격 원천이 ' +
            '다른 것이다 — 어느 쪽이 거래소 종가인지 따로 확인해야 한다.';
} else {
  verdict = '엇갈린다. 종목별로 봐야 한다.';
}
say(`**${verdict}**`);

// ── 기록 ──────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });

const md = [];
md.push('# ETF 시장가 수익률 — 야후 vs 네이버 되짚기');
md.push('');
md.push(`조사 시각: ${new Date().toISOString()}`);
md.push('');
md.push('화면은 야후 일봉으로 만든 시장가·총수익률을 싣는다. 네이버 표기와 차이가');
md.push('커서, 두 곳의 **원가격**을 받아 같은 규칙으로 다시 계산해 대조했다.');
md.push('');
md.push('| 종목 | 분배율 | 네이버 표기(시장가) | 네이버 표기(NAV) | 네이버 원가격 | 야후 원가격 | 야후 수정종가 | 야후+분배 | 종가차이 중앙 | 종가차이 최대 |');
md.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const r of results) {
  const p = (v) => (v == null ? '—' : (typeof v === 'number' ? v.toFixed(2) : v.pct.toFixed(2)));
  md.push(`| ${r.code} ${r.name} | ${r.yield ?? '—'} | ${p(r.stated?.price)} | ${p(r.stated?.nav)} | ` +
          `${p(r.naverY1)} | ${p(r.yahooY1)} | ${p(r.yahooAdjY1)} | ${p(r.yahooTrY1)} | ` +
          `${r.cmp ? `${r.cmp.medianRelPct}%` : '—'} | ${r.cmp ? `${r.cmp.maxRelPct}% (${r.cmp.maxAt})` : '—'} |`);
}
md.push('');
md.push('기준 구간은 각 계열의 마지막 봉에서 1년 전이다. 두 곳의 마지막 봉 날짜가');
md.push('다르면 구간도 며칠 어긋나므로, 아래에 각 계열이 실제로 쓴 시작·끝 날짜를 남긴다.');
md.push('');
md.push('| 종목 | 네이버 구간 | 네이버 시작가→끝가 | 야후 구간 | 야후 시작가→끝가 | 분배 건수 | 액면 변경 |');
md.push('|---|---|---|---|---|---:|---|');
for (const r of results) {
  const win = (w) => (w ? `${w.from}~${w.to}` : '—');
  const px = (w) => (w ? `${w.fromClose} → ${w.toClose}` : '—');
  md.push(`| ${r.code} | ${win(r.naverY1)} | ${px(r.naverY1)} | ${win(r.yahooY1)} | ${px(r.yahooY1)} | ` +
          `${r.divs?.length ?? '—'} | ${r.splits?.length ? r.splits.map((s) => `${s.day} ${s.ratio}`).join(', ') : '—'} |`);
}
md.push('');
md.push(...lines);
md.push('');
md.push('## 화면에 실린 값 (data/etf.js)');
md.push('');
md.push('| 종목 | price Y1 | tr Y1 | nav Y1 |');
md.push('|---|---:|---:|---:|');
for (const r of results) {
  md.push(`| ${r.code} ${r.name} | ${r.dataPrice ?? '—'} | ${r.dataTr ?? '—'} | ${r.dataNav ?? '—'} |`);
}
md.push('');

await writeFile(OUT_MD, md.join('\n'));

// 원자료는 봉이 많아 무겁다. 대조에 쓴 요약만 남긴다.
await writeFile(OUT_JSON, JSON.stringify(results.map((r) => ({
  code: r.code, name: r.name, yield: r.yield,
  stated: r.stated, naverY1: r.naverY1, naverTrY1: r.naverTrY1,
  yahooY1: r.yahooY1, yahooAdjY1: r.yahooAdjY1, yahooTrY1: r.yahooTrY1,
  cmp: r.cmp, divCount: r.divs?.length ?? null, splits: r.splits ?? null,
  data: { price: r.dataPrice, tr: r.dataTr, nav: r.dataNav },
  naverError: r.naverError, yahooError: r.yahooError, statedError: r.statedError,
})), null, 2));

console.log(`\n[verify] ${OUT_MD} · ${OUT_JSON} 기록`);
