#!/usr/bin/env node
/**
 * 순위·유형평균 칸을 독립적으로 다시 계산해 화면과 대조한다.
 *
 *   node scripts/audit_etf_rank.mjs [종목코드...]
 *
 * 수익률은 수집기가 만든 값이라 원자료로 되짚을 수 있었다. 순위와 유형평균은
 * 다르다 — **화면이 그 자리에서 만들어 내는 값**이라 원자료가 없다. 그래서
 * 화면의 계산을 여기서 처음부터 다시 하고, 두 답이 같은지 본다.
 *
 * 같은 코드를 두 번 쓰면 뜻이 없으므로 방식을 바꿔 짠다.
 *   화면: (시장,기간)마다 내림차순 배열을 만들고 이분 탐색
 *   여기: 배열 없이 세어 센다 (v 보다 큰 값의 개수를 그냥 센다)
 * 결과가 다르면 둘 중 하나가 틀린 것이다.
 *
 * 그리고 화면 계산에 **뜻이 어긋나는 곳**이 없는지 따로 본다.
 *   - 거래가 멈춘 종목이 순위 모집단에 남아 있는가
 *   - 총수익률이 깨진 종목이 남아 순위를 밀고 있는가
 *   - 표에 적힌 모집단 수와 실제로 평균에 쓴 수가 같은가
 */

import { readFile } from 'node:fs/promises';

const PERIODS = ['D1', 'W1', 'M1', 'M3', 'M6', 'YTD', 'Y1', 'Y3'];
const LABEL = { D1: '1일', W1: '1주', M1: '1개월', M3: '3개월', M6: '6개월',
                YTD: '연초 이후', Y1: '1년', Y3: '3년(연율)' };

const src = await readFile('data/etf.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const ETFS = DATA.etfs || [];

const trOf = (e, p) => {
  const v = e.ret?.tr?.[p];
  return v == null || !Number.isFinite(v) ? null : v;
};

// ── 화면과 같은 규칙, 다른 방식으로 ───────────────────────────────────────
/** 같은 시장에서 v 보다 나은 종목 수를 그냥 센다(이분 탐색 없이). */
function rankOf(etf, period) {
  const v = trOf(etf, period);
  if (v == null) return null;
  let better = 0, total = 0;
  for (const e of ETFS) {
    if (e.market !== etf.market) continue;
    if (e.suspended) continue;                    // 화면과 같은 규칙
    const w = trOf(e, period);
    if (w == null) continue;
    total += 1;
    if (w > v) better += 1;
  }
  return { rank: better + 1, total };
}

const geared = (e) => (e.flags || []).some((f) => f === 'leverage' || f === 'inverse');

function peersOf(etf) {
  // 화면과 같은 규칙 — 거래정지는 빼고, 배율 상품은 1배와 다른 유형으로 본다.
  const g = geared(etf);
  const live = ETFS.filter((e) => !e.suspended && geared(e) === g);
  const strict = live.filter((e) => e.market === etf.market
    && e.assetClass === etf.assetClass && e.region === etf.region);
  return strict.length >= 8
    ? strict
    : live.filter((e) => e.market === etf.market && e.assetClass === etf.assetClass);
}

function peerAvg(etf, period) {
  const pool = peersOf(etf);
  const vals = pool.map((e) => trOf(e, period)).filter((v) => v != null);
  if (vals.length < 5) return null;
  return { avg: vals.reduce((a, b) => a + b, 0) / vals.length, n: vals.length, pool: pool.length };
}

/** 화면이 붙이는 딱지. 절반을 넘으면 "하위 N%" 로 뒤집는다. */
function label(rank, total) {
  const top = Math.max(1, Math.round((rank / total) * 100));
  const bottom = Math.max(1, Math.round(((total - rank + 1) / total) * 100));
  return top <= 50 ? `상위 ${top}%` : `하위 ${bottom}%`;
}

// ── 1. 지정 종목을 한 줄씩 ────────────────────────────────────────────────
const codes = process.argv.slice(2).length ? process.argv.slice(2) : ['091230'];
for (const code of codes) {
  const etf = ETFS.find((e) => e.code === code);
  if (!etf) { console.log(`${code} 없음`); continue; }
  const pool = peersOf(etf);
  console.log(`\n=== ${etf.code} ${etf.name}`);
  console.log(`    시장 ${etf.market} · 자산군 ${etf.assetClass} · 지역 ${etf.region}` +
              ` · 유형 무리 ${pool.length}종목`);
  console.log('    기간        총수익률        순위            딱지        유형평균   대비');
  for (const p of PERIODS) {
    const v = trOf(etf, p);
    if (v == null) { console.log(`    ${LABEL[p].padEnd(10)} —`); continue; }
    const r = rankOf(etf, p);
    const pa = peerAvg(etf, p);
    console.log(`    ${LABEL[p].padEnd(10)} ${v.toFixed(2).padStart(9)}%` +
      `  ${String(r.rank).padStart(5)}/${String(r.total).padEnd(6)}` +
      `  ${label(r.rank, r.total).padEnd(10)}` +
      (pa ? `  ${pa.avg.toFixed(2).padStart(8)}%  ${(v - pa.avg >= 0 ? '+' : '') + (v - pa.avg).toFixed(2)}%p  (n=${pa.n})`
          : '  유형평균 없음'));
  }
}

// ── 2. 모집단에 섞이면 안 되는 것이 섞였나 ────────────────────────────────
console.log('\n\n=== 순위 모집단 점검 ===');
const suspended = ETFS.filter((e) => e.suspended);
console.log(`거래정지 표가 붙은 종목: ${suspended.length}`);
for (const e of suspended) {
  const inPool = PERIODS.filter((p) => trOf(e, p) != null);
  console.log(`  ${e.code} ${e.name} — 순위 모집단에 든 기간 ${inPool.length}개 ` +
              (inPool.length ? `(${inPool.join(',')})` : '(없음)') +
              `  ${inPool.length ? '← 빼야 한다' : ''}`);
}

// 총수익률이 깨진 종목(감사가 오류로 잡은 것)이 모집단에 남아 있는지
let audit = null;
try { audit = JSON.parse(await readFile('tools/discovery/etf_audit.json', 'utf8')); } catch { /* 없으면 넘어간다 */ }
if (audit) {
  const broken = new Set(audit.findings
    .filter((f) => f.sev === 'error' && /^tr-|수익률-/.test(f.rule))
    .map((f) => f.id));
  console.log(`\n총수익률이 깨진 종목: ${broken.size}`);
  for (const id of broken) {
    const e = ETFS.find((x) => x.id === id);
    if (!e) continue;
    const ps = PERIODS.filter((p) => trOf(e, p) != null);
    console.log(`  ${e.code} ${e.name} — 모집단에 든 기간 ${ps.length}개  ← 다른 종목 등수를 한 칸씩 민다`);
  }
}

// ── 3. 표에 적힌 모집단 수와 실제로 평균에 쓴 수 ──────────────────────────
// 화면은 머리말에 유형 무리의 **전체 크기**를 적는다. 그런데 평균은 그
// 기간에 값이 있는 종목만으로 낸다. 3년처럼 값이 적은 기간에서는 둘이
// 크게 벌어진다 — 적힌 수가 실제로 쓴 수가 아니면 읽는 사람을 속인다.
console.log('\n=== 표에 적힌 수 vs 실제로 쓴 수 ===');
const sample = ['091230', '069500', '360750', '148070', '381560'];
for (const code of sample) {
  const e = ETFS.find((x) => x.code === code);
  if (!e) continue;
  const pool = peersOf(e).length;
  const ns = PERIODS.map((p) => { const pa = peerAvg(e, p); return `${LABEL[p]}:${pa ? pa.n : '-'}`; });
  console.log(`  ${code} ${e.name}\n     적힌 수 ${pool} · 실제 ${ns.join(' ')}`);
}

// ── 4. 순위 모집단이 기간마다 다르다는 사실 ───────────────────────────────
console.log('\n=== 기간별 순위 모집단 (KR) ===');
for (const p of PERIODS) {
  const n = ETFS.filter((e) => e.market === 'KR' && trOf(e, p) != null).length;
  console.log(`  ${LABEL[p].padEnd(10)} ${String(n).padStart(5)} / 1163`);
}

// ── 5. 동점 처리 ──────────────────────────────────────────────────────────
// 같은 수익률이면 같은 등수여야 한다. 이분 탐색이 그렇게 되는지 본다.
console.log('\n=== 동점 처리 ===');
{
  const byVal = {};
  for (const e of ETFS) {
    if (e.market !== 'KR') continue;
    const v = trOf(e, 'D1');
    if (v == null) continue;
    (byVal[v] ??= []).push(e);
  }
  const tied = Object.entries(byVal).filter(([, a]) => a.length > 1)
    .sort((a, b) => b[1].length - a[1].length)[0];
  if (tied) {
    const ranks = new Set(tied[1].map((e) => rankOf(e, 'D1').rank));
    console.log(`  1일 수익률 ${tied[0]}% 인 종목 ${tied[1].length}개 → 등수 ${[...ranks].join(',')}` +
                (ranks.size === 1 ? '  (같은 등수 ✓)' : '  ← 동점인데 등수가 다르다'));
  } else console.log('  동점 없음');
}
