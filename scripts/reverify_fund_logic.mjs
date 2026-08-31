#!/usr/bin/env node
/**
 * 재검증 L1-b — 화면이 **그 자리에서 만드는 주장**이 맞는가.
 *
 *   node scripts/reverify_fund_logic.mjs
 *   -> tools/discovery/fund_reverify_logic.{json,md}
 *
 * ── 아직 아무도 안 본 것 ────────────────────────────────────────────────────
 *
 * 지금까지의 검증은 **저장된 값**을 봤다.
 *
 *   감사   data/fund.js 안에서 앞뒤가 맞는가
 *   L2     저장한 값이 원천과 같은가
 *   L1     화면에 찍힌 글자가 저장된 값과 같은가
 *
 * 그런데 화면은 값을 보여 주기만 하지 않는다. **주장을 만든다.**
 *
 *   "조건에 맞는 펀드 1,425개"        ← 필터가 옳게 걸렸나
 *   "1년 수익률 상위 20"              ← 정말 상위 20 인가
 *   "이 두 펀드는 42.3% 겹칩니다"      ← 겹침 계산이 맞나
 *   "삼성전자를 담은 펀드 312개"       ← 빠뜨린 펀드는 없나
 *
 * 이 넷은 데이터에 없다. 브라우저가 만든다. 그래서 어떤 감사도 본 적이 없다.
 * 여기서 **두 번째 구현으로 다시 만들어** 화면 값과 맞댄다.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const OUT_JSON = 'tools/discovery/fund_reverify_logic.json';
const OUT_MD = 'tools/discovery/fund_reverify_logic.md';

const out = { at: new Date().toISOString(), findings: [], errors: [] };
const tally = {};
function score(field, ok) {
  tally[field] = tally[field] || { checked: 0, same: 0 };
  tally[field].checked += 1;
  if (ok) tally[field].same += 1;
}
function flag(rule, detail, nums) { out.findings.push({ sev: 'error', rule, detail, ...nums }); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    const p = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const b = await readFile(join(process.cwd(), p));
    res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' });
    res.end(b);
  } catch { res.writeHead(404).end('nf'); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
page.on('pageerror', (e) => out.errors.push(`pageerror: ${e.message}`));
await page.goto(`${base}/fund.html`, { waitUntil: 'networkidle' });

const src = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FUNDS = DATA.funds || [];
const byId = new Map(FUNDS.map((f) => [f.id, f]));
console.log(`데이터 ${FUNDS.length}개`);

/** 화면의 결과 개수를 읽는다. "1,425개" → 1425 */
async function shownCount() {
  const t = await page.locator('#result-count').textContent();
  const m = String(t || '').match(/([\d,]+)/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

// ── 1. 필터 ─────────────────────────────────────────────────────────────────
// 화면이 "조건에 맞는 펀드 N개" 라고 말한다. 그 N 을 데이터에서 직접 세어 본다.
console.log('\n=== 1. 필터 ===');
const filterCases = [
  ['투자지역 국내', { f: 'f-region', v: 'domestic' }, (x) => x.region === 'domestic'],
  ['투자지역 해외', { f: 'f-region', v: 'overseas' }, (x) => x.region === 'overseas'],
  ['자산군 주식형', { f: 'f-asset', v: 'equity' }, (x) => x.assetClass === 'equity'],
  ['자산군 채권형', { f: 'f-asset', v: 'bond' }, (x) => x.assetClass === 'bond'],
  ['자산군 MMF', { f: 'f-asset', v: 'mmf' }, (x) => x.assetClass === 'mmf'],
  ['유형 해외주식형', { f: 'f-type', v: '해외주식형' }, (x) => x.type === '해외주식형'],
  ['유형 국내대체', { f: 'f-type', v: '국내대체' }, (x) => x.type === '국내대체'],
  ['운용사 미래에셋자산운용', { f: 'f-company', v: '미래에셋자산운용' }, (x) => x.company === '미래에셋자산운용'],
  ['설정액 1조 이상', { f: 'f-aum', v: '1t' }, (x) => Number(x.aum) >= 1e12],
  ['설정액 100억 미만', { f: 'f-aum', v: 'lt100e' }, (x) => x.aum != null && Number(x.aum) < 1e10],
  ['위험등급 매우 높은 위험', { f: 'f-risk', v: 'veryHighRisk' }, (x) => x.riskGrade === 'veryHighRisk'],
  ['총보수 0.3% 미만', { f: 'f-fee', v: 'lt03' }, (x) => x.feeMin != null && x.feeMin < 0.3],
  ['총보수 1.2% 이상', { f: 'f-fee', v: 'gte12' }, (x) => x.feeMin != null && x.feeMin >= 1.2],
];
out.filters = [];
for (const [label, sel, pred] of filterCases) {
  await page.evaluate(() => { window.el('f-reset').click(); });
  await page.waitForTimeout(120);
  await page.selectOption(`#${sel.f}`, sel.v);
  await page.waitForTimeout(250);
  const got = await shownCount();
  const want = FUNDS.filter(pred).length;
  const ok = got === want;
  score('필터.개수', ok);
  out.filters.push({ label, shown: got, recomputed: want, ok });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(24)} 화면 ${got} vs 재계산 ${want}`);
  if (!ok) flag('필터-개수불일치', `${label}: 화면 ${got} vs 재계산 ${want}`);

  // 개수만 맞고 내용이 다를 수 있다. 첫 화면에 나온 행이 조건을 지키는지 본다.
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll('#list-body tr[data-id]')].map((t) => t.getAttribute('data-id')));
  const bad = ids.map((id) => byId.get(id)).filter((f) => f && !pred(f));
  const okRows = bad.length === 0;
  score('필터.내용', okRows);
  if (!okRows) flag('필터-조건어긋난행', `${label}: ${bad.slice(0, 3).map((f) => f.code).join(', ')}`);
}
// 검색어
await page.evaluate(() => { window.el('f-reset').click(); });
await page.waitForTimeout(120);
// 화면의 검색은 네 군데를 훑는다: 펀드 본체 · **클래스(코드·이름)** · 보유종목.
// 여기 재계산이 클래스를 빠뜨려서 "배당" 288 vs 287, "K55301" 298 vs 148 로
// 어긋났다 — 틀린 쪽은 화면이 아니라 이 규칙이었다. 사람이 손에 든 코드는
// 대개 클래스 코드(K55301...)라서 클래스를 빼면 절반이 사라진다.
for (const q of ['삼성', '배당', 'K55301']) {
  await page.fill('#q', q);
  await page.waitForTimeout(350);
  const got = await shownCount();
  const lq = q.toLowerCase();
  const want = FUNDS.filter((f) => {
    const hay = `${f.name || ''} ${f.code || ''} ${f.company || ''} ${f.type || ''} ${f.benchmarkName || ''}`.toLowerCase();
    if (hay.includes(lq)) return true;
    if ((f.classes || []).some((c) => (c.code || '').toLowerCase().includes(lq)
      || (c.name || '').toLowerCase().includes(lq))) return true;
    return (f.holdings || []).some((h) => (h.name || '').toLowerCase().includes(lq));
  }).length;
  const ok = got === want;
  score('검색.개수', ok);
  out.filters.push({ label: `검색 "${q}"`, shown: got, recomputed: want, ok });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} 검색 "${q}"`.padEnd(31) + ` 화면 ${got} vs 재계산 ${want}`);
  if (!ok) flag('검색-개수불일치', `"${q}": 화면 ${got} vs 재계산 ${want}`);
}
await page.fill('#q', '');
await page.waitForTimeout(200);

// ── 2. 랭킹 ─────────────────────────────────────────────────────────────────
// "1년 수익률 상위 20" 이 정말 상위 20 인가.
console.log('\n=== 2. 랭킹 ===');
out.rank = [];
await page.locator('.tabs button[data-tab="rank"]').click();
await page.waitForTimeout(300);
for (const [type, period] of [['', '1y'], ['해외주식형', '1y'], ['국내주식형', '3m'], ['', '5y']]) {
  await page.selectOption('#r-type', type);
  await page.selectOption('#r-period', period);
  await page.waitForTimeout(400);
  const tables = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('#rank-body table').forEach((tb) => {
      const rows = [...tb.querySelectorAll('tbody tr[data-id]')].map((tr) => tr.getAttribute('data-id'));
      res.push(rows);
    });
    return res;
  });
  const pool = FUNDS.filter((f) => !type || f.type === type);
  const withRet = pool.filter((f) => f.ret?.[period] != null)
    .sort((a, b) => Number(b.ret[period]) - Number(a.ret[period]));
  // 표 0 = 상위 20, 표 1 = 하위 20, 표 2 = 설정액 상위 20
  const wantTop = withRet.slice(0, 20).map((f) => f.id);
  const wantBottom = withRet.slice(-20).reverse().map((f) => f.id);
  const wantAum = pool.filter((f) => Number(f.aum) > 0)
    .sort((a, b) => Number(b.aum) - Number(a.aum)).slice(0, 20).map((f) => f.id);

  // 동점이 있으면 차례가 갈릴 수 있다. 값의 열로 견준다.
  const valsOf = (ids) => ids.map((id) => byId.get(id)?.ret?.[period] ?? null);
  const okTop = JSON.stringify(valsOf(tables[0] || [])) === JSON.stringify(valsOf(wantTop));
  const okBottom = JSON.stringify(valsOf(tables[1] || [])) === JSON.stringify(valsOf(wantBottom));
  const aumOf = (ids) => ids.map((id) => byId.get(id)?.aum ?? null);
  const okAum = JSON.stringify(aumOf(tables[2] || [])) === JSON.stringify(aumOf(wantAum));

  score('랭킹.수익률상위', okTop);
  score('랭킹.수익률하위', okBottom);
  score('랭킹.설정액상위', okAum);
  const label = `${type || '전체'} ${period}`;
  out.rank.push({ label, okTop, okBottom, okAum, n: withRet.length });
  console.log(`  ${okTop && okBottom && okAum ? 'ok  ' : 'FAIL'} ${label.padEnd(20)} ` +
    `상위 ${okTop ? '○' : '✗'} 하위 ${okBottom ? '○' : '✗'} 설정액 ${okAum ? '○' : '✗'} (모집단 ${withRet.length})`);
  if (!okTop) flag('랭킹-상위불일치', `${label}: 화면 ${JSON.stringify(valsOf(tables[0] || []).slice(0, 3))} vs 재계산 ${JSON.stringify(valsOf(wantTop).slice(0, 3))}`);
  if (!okBottom) flag('랭킹-하위불일치', `${label}`);
  if (!okAum) flag('랭킹-설정액불일치', `${label}`);
}

// ── 3. 비교 · 중복도 ────────────────────────────────────────────────────────
// "이 두 펀드는 42.3% 겹칩니다" 를 두 번째 구현으로 다시 만든다.
console.log('\n=== 3. 중복도 ===');
out.overlap = [];
{
  // 보유종목이 넉넉한 국내주식형 4개를 담는다.
  const picks = FUNDS.filter((f) => f.holdingCount >= 20 && f.type === '국내주식형')
    .sort((a, b) => Number(b.aum || 0) - Number(a.aum || 0)).slice(0, 4);
  await page.locator('.tabs button[data-tab="browse"]').click();
  await page.waitForTimeout(200);
  await page.evaluate((ids) => { window.state.picks = ids; }, picks.map((f) => f.id));
  await page.locator('.tabs button[data-tab="compare"]').click();
  await page.waitForTimeout(600);

  const cells = await page.evaluate(() => {
    const res = [];
    const tb = document.querySelector('#compare-body table');
    if (!tb) return res;
    const rows = [...tb.querySelectorAll('tbody tr')];
    rows.forEach((tr, r) => {
      [...tr.querySelectorAll('td')].forEach((td, c) => {
        res.push({ r, c, text: td.textContent.trim(), cls: td.className });
      });
    });
    return res;
  });

  /** 두 번째 구현: 겹치는 종목에서 두 비중 중 작은 쪽의 합. */
  function overlapOf(a, b) {
    const ah = (a.holdings || []).filter((h) => !h.cash);
    const bh = (b.holdings || []).filter((h) => !h.cash);
    if (!ah.length || !bh.length) return null;
    const known = (h) => h.weight != null && Number.isFinite(Number(h.weight));
    if (!ah.every(known) || !bh.every(known)) return { weight: null, count: null };
    const bmap = new Map(bh.map((h) => [h.code || `n:${(h.name || '').toLowerCase()}`, h]));
    let w = 0, n = 0;
    for (const h of ah) {
      const k = h.code || `n:${(h.name || '').toLowerCase()}`;
      const m = bmap.get(k);
      if (m) { n += 1; w += Math.min(Number(h.weight), Number(m.weight)); }
    }
    return { weight: Number(w.toFixed(2)), count: n };
  }

  for (let r = 0; r < picks.length; r += 1) {
    for (let c = 0; c < picks.length; c += 1) {
      if (r === c) continue;
      const cell = cells.find((x) => x.r === r && x.c === c);
      if (!cell) continue;
      const want = overlapOf(picks[r], picks[c]);
      const m = String(cell.text).match(/^([\d.]+)%/);
      const shownW = m ? Number(m[1]) : null;
      const ok = want?.weight == null
        ? shownW == null
        : (shownW != null && shownW === Number(want.weight.toFixed(1)));
      score('중복도.비율', ok);
      out.overlap.push({ a: picks[r].code, b: picks[c].code,
                         shown: cell.text, recomputed: want?.weight ?? null, ok });
      if (!ok) {
        flag('중복도-불일치',
          `${picks[r].code} × ${picks[c].code}: 화면 "${cell.text}" vs 재계산 ${want?.weight}`);
      }
    }
  }
  const okN = out.overlap.filter((o) => o.ok).length;
  console.log(`  ${okN}/${out.overlap.length} 칸 일치` +
    (out.overlap[0] ? ` (예: ${out.overlap[0].shown} vs ${out.overlap[0].recomputed})` : ''));
}

// ── 4. 역조회 ───────────────────────────────────────────────────────────────
// "삼성전자를 담은 펀드 N개" — 빠뜨린 펀드가 없는가.
console.log('\n=== 4. 역조회 ===');
out.reverse = [];
await page.locator('.tabs button[data-tab="reverse"]').click();
await page.waitForTimeout(200);
for (const q of ['삼성전자', 'SK하이닉스', 'NVIDIA']) {
  await page.fill('#rq', q);
  await page.waitForTimeout(500);
  const got = await page.evaluate(() =>
    document.querySelectorAll('#reverse-body tbody tr[data-id]').length);
  const lq = q.toLowerCase();
  const want = FUNDS.filter((f) =>
    (f.holdings || []).some((h) => (h.name || '').toLowerCase().includes(lq))).length;
  // 화면은 200개까지만 그린다. 그 한도를 감안해 견준다.
  const wantShown = Math.min(want, 200);
  const ok = got === wantShown;
  score('역조회.개수', ok);
  out.reverse.push({ q, shown: got, recomputed: want, cappedTo: wantShown, ok });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} "${q}"`.padEnd(22) + ` 화면 ${got} vs 재계산 ${want} (표시한도 200)`);
  if (!ok) flag('역조회-개수불일치', `"${q}": 화면 ${got} vs 재계산 ${wantShown}`);
}

await browser.close();
server.close();

// ── 집계 ────────────────────────────────────────────────────────────────────
out.tally = tally;
const errs = out.findings;
out.counts = { error: errs.length };
console.log('\n=== 항목별 일치 ===');
const rowsT = Object.entries(tally).sort((a, b) => (a[1].same / a[1].checked) - (b[1].same / b[1].checked));
for (const [k, v] of rowsT) {
  console.log(`  ${k.padEnd(20)} ${String(v.same).padStart(4)}/${String(v.checked).padStart(4)}  ${(v.same / v.checked * 100).toFixed(1)}%`);
}
console.log(`\n오류 ${errs.length}건`);
for (const f of errs.slice(0, 15)) console.log(`  [${f.rule}] ${f.detail}`);

out.verdict = errs.length === 0
  ? '필터·검색·랭킹·중복도·역조회가 모두 재계산과 일치'
  : `오류 ${errs.length}건`;
console.log(`\n판정: ${out.verdict}`);

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 재검증 L1-b — 화면이 그 자리에서 만드는 주장이 맞는가', '',
  `검증 시각: ${out.at}`, '', `**${out.verdict}**`, '',
  '지금까지의 검증은 **저장된 값**을 봤습니다. 그런데 화면은 값을 보여 주기만 하지',
  '않고 **주장을 만듭니다** — "조건에 맞는 펀드 1,425개", "1년 수익률 상위 20",',
  '"이 두 펀드는 42.3% 겹칩니다", "삼성전자를 담은 펀드 312개".', '',
  '이 넷은 데이터에 없습니다. 브라우저가 만듭니다. 그래서 어떤 감사도 본 적이',
  '없습니다. 여기서 **두 번째 구현으로 다시 만들어** 화면 값과 맞댔습니다.', '',
  '## 항목별 일치', '', '| 항목 | 일치 | 검사 | 비율 |', '|---|---:|---:|---:|'];
for (const [k, v] of rowsT) {
  md.push(`| ${k} | ${v.same} | ${v.checked} | ${(v.same / v.checked * 100).toFixed(1)}% |`);
}
md.push('', '## 필터·검색', '', '| 조건 | 화면 | 재계산 | |', '|---|---:|---:|:-:|');
for (const f of out.filters) md.push(`| ${f.label} | ${f.shown} | ${f.recomputed} | ${f.ok ? '○' : '✗'} |`);
md.push('', '## 랭킹', '', '| 대상 | 모집단 | 수익률 상위 | 수익률 하위 | 설정액 상위 |',
  '|---|---:|:-:|:-:|:-:|');
for (const r of out.rank) {
  md.push(`| ${r.label} | ${r.n} | ${r.okTop ? '○' : '✗'} | ${r.okBottom ? '○' : '✗'} | ${r.okAum ? '○' : '✗'} |`);
}
md.push('', '## 중복도', '',
  `${out.overlap.filter((o) => o.ok).length}/${out.overlap.length} 칸 일치`, '',
  '| A | B | 화면 | 재계산 | |', '|---|---|---|---:|:-:|');
for (const o of out.overlap.slice(0, 12)) {
  md.push(`| ${o.a} | ${o.b} | ${o.shown} | ${o.recomputed ?? '–'} | ${o.ok ? '○' : '✗'} |`);
}
md.push('', '## 역조회', '', '| 종목 | 화면 | 재계산 | |', '|---|---:|---:|:-:|');
for (const r of out.reverse) md.push(`| ${r.q} | ${r.shown} | ${r.recomputed} | ${r.ok ? '○' : '✗'} |`);
if (errs.length) {
  md.push('', '## 오류', '', '| 규칙 | 내용 |', '|---|---|');
  for (const f of errs.slice(0, 100)) md.push(`| ${f.rule} | ${String(f.detail).replace(/\|/g, '\\|')} |`);
}
if (out.errors.length) {
  md.push('', '## 실행 오류', '');
  for (const e of out.errors.slice(0, 20)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[logic] ${OUT_MD} · ${OUT_JSON} 기록`);
process.exit(errs.length ? 1 : 0);
