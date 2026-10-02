#!/usr/bin/env node
/**
 * 펀드 기간수익률 검산 4차 — 네이버가 계단을 보정하는가.
 *
 *   node scripts/verify_fund_returns4.mjs
 *   -> tools/discovery/fund_returns_verify4.{json,md}
 *
 * 3차에서 규칙이 21종목을 계단으로 잡았는데, 그중 18종목은 원천 수익률의
 * 앞뒤가 멀쩡했다. 그리고 그 18종목의 계단은 **거의 다 아래로** 난다.
 *
 *   KR5223AL8357  2026-03-16 → 2026-03-23   0.337배
 *   K55383CG1310  2023-09-01 → 2023-10-04   0.291배
 *
 * 기준가가 3분의 1로 떨어지는 것은 손실이 아니라 **결산·분배**로 보인다.
 * 쌓인 이익을 나눠 주고 기준가를 1,000 으로 되돌리는 것이다. 위로 난 계단
 * (재산정)과 아래로 난 계단(분배)은 둘 다 계열을 끊는다.
 *
 * 그런데 이 18종목의 원천 수익률은 앞뒤가 맞는다. 곧 **네이버가 이 계단은
 * 보정해서 수익률을 낸다**는 뜻일 수 있다. 그렇다면 이 구간을 비우는 것은
 * 멀쩡한 값을 버리는 짓이다 — ETF 에서 연율 잣대로 정상값을 버릴 뻔한 것과
 * 같은 자리다. 규칙이 대량으로 잡으면 규칙부터 의심해야 한다.
 *
 * ── 가르는 법 ───────────────────────────────────────────────────────────────
 *
 * 계단이 있는지 없는지가 아니라, **원천이 그 계단을 수익률에 흘려 넣었는지**를
 * 본다. 계단을 가로지르는 구간에서 두 값을 견준다.
 *
 *   생값  = (마지막 기준가 / 구간 시작 기준가 − 1) × 100      ← 계단이 그대로 들어간다
 *   원천  = 네이버가 주는 그 구간의 수익률
 *
 *   둘이 같다  → 네이버가 계단을 그대로 흘려 넣었다. 그 값은 거짓이다. **비운다.**
 *   둘이 다르다 → 네이버가 보정했다. 그 값은 쓸 수 있다. **남긴다.**
 *
 * 이러면 계단의 방향(위/아래)이나 원인(재산정/분배)을 우리가 판정할 필요가
 * 없다. 판정해야 할 것은 하나뿐이다 — 화면에 실릴 그 숫자가 계단을 먹었는가.
 *
 * 3차에서 놓친 2종목(6개월 0.19% · 1년 50.60%)도 같이 본다. 계열을 찍어
 * 계단이 정말 없는지 확인한다. 없다면 그것은 앞의 6개월에 50% 오른 것이므로
 * 정상이고, **내 앞뒤 검사가 헛잡은 것**이다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_returns_verify4.json';
const OUT_MD = 'tools/discovery/fund_returns_verify4.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const API = 'https://stock.naver.com/api/fund/funds';

const headers = {
  'User-Agent': UA, Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  Referer: 'https://stock.naver.com/domestic/fund',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, tries = 3) {
  let last;
  for (let i = 1; i <= tries; i += 1) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) { last = e; if (i < tries) await sleep(400 * 2 ** (i - 1)); }
  }
  throw last;
}
function num(v) {
  if (v == null || v === '' || v === '-') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}
const median = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const out = { at: new Date().toISOString(), errors: [] };
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[fund-verify4] 중단:', e?.message || e);
  process.exit(1);
});

async function series(code, term) {
  const d = await getJson(`${API}/${code}/base-price/chart?term=${term}`);
  return (d?.series || [])
    .map((p) => ({ day: p.tradeDate, v: num(p.basePrice) }))
    .filter((p) => p.day && p.v != null && p.v > 0);
}

function findSteps(rows, floorRatio, k = 8) {
  if (rows.length < 5) return [];
  const lr = [];
  for (let i = 1; i < rows.length; i += 1) lr.push(Math.log(rows[i].v / rows[i - 1].v));
  const med = median(lr) ?? 0;
  const sigma = (median(lr.map((x) => Math.abs(x - med))) ?? 0) * 1.4826;
  const floor = Math.log(floorRatio);
  const steps = [];
  for (let i = 0; i < lr.length; i += 1) {
    const x = Math.abs(lr[i] - med);
    if (x <= floor) continue;
    if (sigma > 0 && x <= k * sigma) continue;
    steps.push({ day: rows[i + 1].day, prevDay: rows[i].day,
                 from: +rows[i].v.toFixed(2), to: +rows[i + 1].v.toFixed(2),
                 ratio: +(rows[i + 1].v / rows[i].v).toFixed(4),
                 sigmas: sigma > 0 ? +(x / sigma).toFixed(1) : null });
  }
  return steps;
}

const SPEC = [['3m', 1.25], ['1y', 1.6], ['5y', 2.2]];
const PERIODS = [
  { key: '1m', back: (d) => d.setMonth(d.getMonth() - 1) },
  { key: '3m', back: (d) => d.setMonth(d.getMonth() - 3) },
  { key: '6m', back: (d) => d.setMonth(d.getMonth() - 6) },
  { key: '9m', back: (d) => d.setMonth(d.getMonth() - 9) },
  { key: '1y', back: (d) => d.setFullYear(d.getFullYear() - 1) },
  { key: '2y', back: (d) => d.setFullYear(d.getFullYear() - 2) },
  { key: '3y', back: (d) => d.setFullYear(d.getFullYear() - 3) },
  { key: '5y', back: (d) => d.setFullYear(d.getFullYear() - 5) },
];

// 3차가 잡은 21종목 + 놓친 2종목 + 확정된 재산정 2종목 + 대조군 1종목.
const FLAGGED = ['KR5223AL8357', 'K55373D15580', 'KR5237737592', 'K55383CG1310',
                 'KR5365AR4796', 'K55207BQ4952', 'KR5355AY1191', 'KR5301A74903',
                 'KR5101151300', 'KR5365AX1695', 'KR5225834278', 'KR5223AE0718',
                 'KR5228593707', 'KR5301519157'];
const MISSED = ['KR5237778166', 'K55364E20702'];
const KNOWN_BAD = ['K55309BY1419', 'K55309BQ0684', 'K55306B99307'];
const CONTROL = ['K55235B39916'];
const CODES = [...new Set([...KNOWN_BAD, ...MISSED, ...FLAGGED, ...CONTROL])];

console.log(`=== ${CODES.length}종목을 실물로 본다 ===\n`);
out.funds = [];

for (const code of CODES) {
  const kind = KNOWN_BAD.includes(code) ? '확정 재산정'
             : MISSED.includes(code) ? '3차가 놓침'
             : CONTROL.includes(code) ? '대조군' : '3차가 잡음';
  const row = { code, kind };
  try {
    const [lp, cp, s3m, s1y, s5y] = await Promise.all([
      getJson(`${API}/${code}/left-panel`),
      getJson(`${API}/${code}/chart-price-panel`),
      series(code, '3m'), series(code, '1y'), series(code, '5y'),
    ]);
    row.name = lp?.detail?.fundName ?? null;
    row.type = lp?.detail?.parentPeerGroupName ?? null;
    const src = {};
    for (const r of cp?.fundReturns?.returns || []) {
      if (r.fundReturn != null) src[r.term] = r.fundReturn;
    }
    row.source = src;

    const sets = { '3m': s3m, '1y': s1y, '5y': s5y };
    row.steps = [];
    for (const [term, floor] of SPEC) {
      for (const st of findSteps(sets[term], floor)) row.steps.push({ ...st, term });
    }
    row.points = { '3m': s3m.length, '1y': s1y.length, '5y': s5y.length };

    // 계단을 가로지르는 구간에서 "생값" 과 "원천" 을 견준다.
    // 긴 구간은 5년 계열(월 간격)로, 짧은 구간은 3개월 계열(하루 간격)로 본다.
    const anchor = s3m[s3m.length - 1];
    row.cells = [];
    const stepDays = [...new Set(row.steps.map((s) => s.day))];
    for (const p of PERIODS) {
      const s = src[p.key];
      if (s == null || !anchor) continue;
      const dt = new Date(`${anchor.day}T00:00:00Z`);
      p.back(dt);
      const cutoff = dt.toISOString().slice(0, 10);
      // 그 구간을 덮는 가장 촘촘한 계열을 쓴다.
      const rows = [s3m, s1y, s5y].find((r) => r.length > 1 && r[0].day <= cutoff);
      if (!rows) continue;
      let base = null;
      for (const q of rows) { if (q.day <= cutoff) base = q; else break; }
      if (!base) continue;
      const raw = (anchor.v / base.v - 1) * 100;
      const crossing = stepDays.filter((d) => d > cutoff && d <= anchor.day);
      row.cells.push({
        period: p.key, cutoff, baseDay: base.day, basePrice: base.v, lastPrice: anchor.v,
        source: +Number(s).toFixed(3), raw: +raw.toFixed(3),
        diff: +(Number(s) - raw).toFixed(3),
        crossesStep: crossing.length > 0, stepAt: crossing[0] ?? null,
      });
    }

    // 계단을 가로지르는 칸만 모아 판정한다.
    const crossing = row.cells.filter((c) => c.crossesStep);
    // 생값과 원천이 20%p 넘게 다르면 네이버가 보정한 것으로 본다. 계단은
    // 배율이 크므로(0.23~3.45배) 보정 여부는 이 정도로 넉넉히 갈린다.
    row.propagated = crossing.filter((c) => Math.abs(c.diff) <= 20).length;
    row.adjusted = crossing.filter((c) => Math.abs(c.diff) > 20).length;
    row.crossingCells = crossing.length;

    console.log(`── ${code} [${kind}] ${(row.name || '').slice(0, 26)}`);
    console.log(`   계열 ${JSON.stringify(row.points)} · 계단 ${row.steps.length}건 ` +
      (row.steps.length ? row.steps.slice(0, 3).map((s) => `${s.prevDay}→${s.day} ${s.ratio}배(${s.term})`).join(' ') : ''));
    for (const c of row.cells) {
      console.log(`     ${c.period.padEnd(3)} 원천 ${String(c.source).padStart(10)} · ` +
        `생값 ${String(c.raw).padStart(10)} · 차 ${String(c.diff).padStart(10)}` +
        (c.crossesStep ? `  ← 계단 ${c.stepAt}` : ''));
    }
    if (crossing.length) {
      console.log(`   → 계단 가로지르는 칸 ${crossing.length} · 흘려넣음 ${row.propagated} · 보정함 ${row.adjusted}`);
    }
    console.log('');
  } catch (e) {
    row.error = String(e.message || e).slice(0, 140);
    out.errors.push(`${code}: ${row.error}`);
    console.log(`── ${code} 오류: ${row.error}\n`);
  }
  out.funds.push(row);
  await sleep(200);
}

// ── 판정 ────────────────────────────────────────────────────────────────────
const ok = out.funds.filter((f) => !f.error);
const totalCrossing = ok.reduce((s, f) => s + (f.crossingCells || 0), 0);
const totalProp = ok.reduce((s, f) => s + (f.propagated || 0), 0);
const totalAdj = ok.reduce((s, f) => s + (f.adjusted || 0), 0);
const missedNoStep = ok.filter((f) => f.kind === '3차가 놓침' && !f.steps.length);

out.summary = {
  funds: ok.length, crossingCells: totalCrossing,
  propagated: totalProp, adjusted: totalAdj,
  missedWithoutStep: missedNoStep.length,
};
console.log('=== 판정 ===');
console.log(`  계단을 가로지르는 칸 ${totalCrossing}개`);
console.log(`    원천이 계단을 흘려 넣음 (비워야 함) ${totalProp}`);
console.log(`    원천이 보정함 (남겨도 됨)        ${totalAdj}`);
console.log(`  3차가 놓친 종목 중 계단이 정말 없는 것 ${missedNoStep.length}/${MISSED.length}`);

out.verdict = `가로지르는 칸 ${totalCrossing} · 흘려넣음 ${totalProp} · 보정함 ${totalAdj} · ` +
  `놓침 중 계단없음 ${missedNoStep.length}/${MISSED.length}`;
console.log(`\n판정: ${out.verdict}`);
await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const nf = (v, d = 2) => (v == null ? '–' : Number(v).toFixed(d));
const md = ['# 네이버가 계단을 보정하는가 (4차)', '', `조사 시각: ${out.at}`, '',
  `**${out.verdict}**`, '',
  '3차에서 21종목을 계단으로 잡았는데 18종목은 원천 수익률의 앞뒤가 멀쩡했고,',
  '그 계단은 거의 다 **아래로** 났다(0.23~0.69배). 기준가가 3분의 1로 떨어지는',
  '것은 손실이 아니라 결산·분배로 보인다 — 쌓인 이익을 나눠 주고 기준가를',
  '1,000 으로 되돌리는 것이다.', '',
  '그래서 계단의 방향이나 원인을 우리가 판정하지 않는다. 판정할 것은 하나뿐이다 —',
  '**화면에 실릴 그 숫자가 계단을 먹었는가.** 계단을 가로지르는 구간에서',
  '생값(계열을 그대로 나눈 값)과 원천 값을 견주면 갈린다.', '',
  '| 결과 | 뜻 | 할 일 |', '|---|---|---|',
  '| 생값 ≈ 원천 | 네이버가 계단을 그대로 흘려 넣었다 | **비운다** |',
  '| 생값 ≠ 원천 | 네이버가 보정했다 | 남긴다 |', '',
  '## 종목별', ''];
for (const f of out.funds) {
  md.push(`### ${f.code} — ${f.kind}`, '');
  if (f.error) { md.push(`오류: ${f.error}`, ''); continue; }
  md.push(`**${f.name ?? '–'}** (${f.type ?? '–'}) · 계열 ${JSON.stringify(f.points)}`, '');
  if (f.steps.length) {
    md.push('| 계열 | 앞날 | 앞 기준가 | 계단일 | 뒤 기준가 | 배율 | σ |',
      '|---|---|---:|---|---:|---:|---:|');
    for (const s of f.steps.slice(0, 6)) {
      md.push(`| ${s.term} | ${s.prevDay} | ${nf(s.from)} | ${s.day} | ${nf(s.to)} | ${s.ratio} | ${s.sigmas ?? '–'} |`);
    }
    md.push('');
  } else {
    md.push('계단 없음.', '');
  }
  if (f.cells?.length) {
    md.push('| 기간 | 원천 | 생값 | 차 | 계단 가로지름 | 판정 |', '|---|---:|---:|---:|:-:|---|');
    for (const c of f.cells) {
      const verdict = !c.crossesStep ? '–'
        : Math.abs(c.diff) <= 20 ? '**흘려넣음 → 비움**' : '보정함 → 남김';
      md.push(`| ${c.period} | ${nf(c.source, 3)} | ${nf(c.raw, 3)} | ${nf(c.diff, 3)} | ` +
        `${c.crossesStep ? '○' : '·'} | ${verdict} |`);
    }
    md.push('');
  }
}
if (out.errors.length) {
  md.push('## 오류', '');
  for (const e of out.errors.slice(0, 30)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[fund-verify4] ${OUT_MD} · ${OUT_JSON} 기록`);
