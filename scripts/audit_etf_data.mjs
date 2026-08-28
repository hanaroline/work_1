#!/usr/bin/env node
/**
 * ETF 화면에 실리는 모든 숫자를 전수 감사한다.
 *
 *   node scripts/audit_etf_data.mjs [--json]
 *   -> tools/discovery/etf_audit.{json,md}
 *
 * 왜 만드나 —
 * HANARO Fn전기&수소차(381560) 의 6개월 총수익률이 +1837% 로 찍혔다.
 * 52주 저 7,860 / 고 26,065 인 종목이 반 년에 19배가 될 수 없다.
 * 한 종목이 이러면 나머지도 못 믿는다. 그래서 눈으로 훑는 대신
 * **화면에 실리는 항목마다 반증 가능한 규칙을 걸어 전부 돌린다.**
 *
 * 이 감사는 바깥에 붙지 않는다. data/etf.js 안에서 서로 어긋나는 것만
 * 잡는다. 안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 필요도 없이 틀린 것이다.
 *
 * 가장 센 규칙은 **총수익률이 내포하는 분배율**이다.
 *
 *   내포분배율 = (1 + tr/100) / (1 + price/100) - 1
 *
 * 총수익률은 시장가수익률에 분배금 재투자분만 얹은 것이므로, 1년 구간의
 * 내포분배율은 그 ETF 의 분배율(TTM)과 비슷해야 한다. 0.51% 짜리가
 * 1558% 를 내포하면 그 tr 은 계산이 깨진 것이다. 바깥 자료가 필요 없다.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/etf_audit.json';
const OUT_MD = 'tools/discovery/etf_audit.md';

// 기간별 연수. 내포분배율을 연율로 되돌려 분배율(TTM)과 견주는 데 쓴다.
const YEARS = { D1: 1 / 252, W1: 1 / 52, M1: 1 / 12, M3: 0.25, M6: 0.5, YTD: null, Y1: 1, Y3: 3, Y5: 5 };
// 3년·5년은 수집기가 연율로 저장한다. 내포분배율도 이미 연율이다.
const ANNUALIZED = new Set(['Y3', 'Y5']);

const findings = [];
/** 한 건을 적는다. sev: 'error' 는 화면에 내보내면 안 되는 것. */
function flag(sev, rule, etf, detail, nums) {
  findings.push({ sev, rule, id: etf.id, code: etf.code, market: etf.market,
                  name: etf.name, detail, ...nums });
}

const src = await readFile('data/etf.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const ETFS = DATA.etfs || [];
console.log(`감사 대상 ${ETFS.length} 종목 (기준 ${DATA.updatedAt})\n`);

for (const e of ETFS) {
  const price = e.ret?.price || {};
  const tr = e.ret?.tr || {};
  const nav = e.ret?.nav || {};

  // ── 1. 총수익률이 내포하는 분배율 ───────────────────────────────────────
  // 이 감사의 핵심. 바깥을 안 보고도 tr 의 붕괴를 잡는다.
  const dy = Number.isFinite(e.dividendYield) ? e.dividendYield : null;
  for (const [k, t] of Object.entries(tr)) {
    const p = price[k];
    if (!Number.isFinite(p) || !Number.isFinite(t)) continue;
    const denom = 1 + p / 100;
    if (denom <= 0) continue;                     // 반토막 이하 구간은 비율이 뜻을 잃는다
    let implied = (1 + t / 100) / denom - 1;      // 구간 전체의 내포분배율
    const yrs = ANNUALIZED.has(k) ? 1 : YEARS[k]; // 연율 저장분은 이미 연 단위
    if (yrs) implied = (1 + implied) ** (1 / yrs) - 1;   // 연율로 환산
    const impliedPct = +(implied * 100).toFixed(2);

    // 총수익률이 시장가수익률보다 **낮으면** 분배금을 음수로 먹은 것이다.
    if (implied < -0.005) {
      flag('error', 'tr<price', e, `${k}: 총수익률(${t}%)이 시장가수익률(${p}%)보다 낮다`,
           { period: k, price: p, tr: t, impliedYieldPct: impliedPct, dividendYield: dy });
      continue;
    }
    // 연율 30% 를 넘는 내포분배율은 국내·해외 어느 ETF 에도 없다.
    // 분배율(TTM)이 있으면 그 5배 + 5%p 를 넘는지도 같이 본다.
    const hardCap = 30;
    const softCap = dy != null ? Math.max(dy * 5 + 5, 15) : hardCap;
    if (impliedPct > hardCap || impliedPct > softCap) {
      flag('error', 'tr-내포분배율-과다', e,
           `${k}: 총수익률 ${t}% vs 시장가 ${p}% → 내포분배율 연 ${impliedPct}%` +
           (dy != null ? ` (공시 분배율 ${dy}%)` : ' (분배율 미상)'),
           { period: k, price: p, tr: t, impliedYieldPct: impliedPct, dividendYield: dy });
    }
  }

  // ── 2. 기준가수익률과 시장가수익률의 벌어짐 ──────────────────────────────
  // ETF 는 차익거래로 묶여 있어 두 계열이 크게 벌어질 수 없다. 벌어지면
  // 둘 중 하나가 다른 종목·다른 기간을 보고 있다는 뜻이다.
  for (const [k, p] of Object.entries(price)) {
    const n = nav[k];
    if (!Number.isFinite(p) || !Number.isFinite(n)) continue;
    const gap = Math.abs(p - n);
    // 절대 5%p 와 상대 30% 중 큰 쪽을 넘어설 때만 잡는다(고변동 구간 오탐 방지)
    const tol = Math.max(5, Math.abs(n) * 0.3);
    if (gap > tol) {
      flag('warn', 'price-nav-괴리', e, `${k}: 시장가 ${p}% vs 기준가 ${n}% (${gap.toFixed(1)}%p 차)`,
           { period: k, price: p, navRet: n, gapPp: +gap.toFixed(2) });
    }
  }

  // ── 3. 수익률 자체의 범위 ───────────────────────────────────────────────
  // 하루 ±40% 는 국내 가격제한폭(±30%) 밖이고, 해외에서도 ETF 로는 안 나온다.
  for (const [basis, obj] of [['price', price], ['tr', tr], ['nav', nav]]) {
    for (const [k, v] of Object.entries(obj)) {
      if (!Number.isFinite(v)) { flag('error', '수익률-비수치', e, `${basis}.${k} = ${v}`); continue; }
      if (v <= -100) flag('error', '수익률-전손이하', e, `${basis}.${k} = ${v}% (-100% 이하)`, { period: k });
      const cap = k === 'D1' ? 40 : k === 'W1' ? 80 : 500;
      if (Math.abs(v) > cap) {
        flag(basis === 'tr' ? 'error' : 'warn', '수익률-범위밖', e,
             `${basis}.${k} = ${v}% (${cap}% 초과)`, { period: k, value: v });
      }
    }
  }

  // ── 4. 상장일과 기간의 앞뒤 ─────────────────────────────────────────────
  // 상장 2년 된 ETF 에 3년 수익률이 있으면 그 값은 어딘가에서 잘못 붙은 것이다.
  if (/^\d{8}$/.test(e.listedDate || '')) {
    const listed = new Date(`${e.listedDate.slice(0, 4)}-${e.listedDate.slice(4, 6)}-${e.listedDate.slice(6)}`);
    const asOf = e.retAsOf ? new Date(e.retAsOf) : new Date(DATA.updatedAt);
    const ageY = (asOf - listed) / (365.25 * 864e5);
    for (const [basis, obj] of [['price', price], ['tr', tr], ['nav', nav]]) {
      for (const need of [['Y1', 1], ['Y3', 3], ['Y5', 5]]) {
        // 20 거래일(≈0.08년) 은 봐 준다 — 상장 직후 봉이 비는 경우가 있다.
        if (obj[need[0]] != null && ageY < need[1] - 0.08) {
          flag('error', '상장전-수익률', e,
               `${basis}.${need[0]} 이 있는데 상장 ${ageY.toFixed(1)}년밖에 안 됐다 (상장 ${e.listedDate})`,
               { period: need[0], ageYears: +ageY.toFixed(2) });
        }
      }
    }
  }

  // ── 5. 보유종목 ─────────────────────────────────────────────────────────
  const hs = Array.isArray(e.holdings) ? e.holdings : [];
  if (hs.length) {
    const sum = hs.reduce((s, h) => s + (Number(h.weight) || 0), 0);
    // 상위 10개만 받으므로 합이 100 을 넘으면 안 된다(반올림 여유 0.5%p).
    if (sum > 100.5) flag('error', '보유비중-합초과', e, `상위 ${hs.length}개 비중 합 ${sum.toFixed(2)}%`, { sumWeight: +sum.toFixed(2) });
    if (sum <= 0) flag('error', '보유비중-영', e, `비중 합이 ${sum}`);
    for (const h of hs) {
      const w = Number(h.weight);
      if (!Number.isFinite(w) || w < 0 || w > 100) flag('error', '보유비중-범위밖', e, `${h.name || h.code}: ${h.weight}`);
      if (!h.name && !h.code) flag('warn', '보유종목-이름없음', e, JSON.stringify(h).slice(0, 80));
    }
    // 내림차순이어야 화면의 "상위 10개"가 말이 된다.
    for (let i = 1; i < hs.length; i += 1) {
      if ((Number(hs[i].weight) || 0) > (Number(hs[i - 1].weight) || 0) + 1e-9) {
        flag('error', '보유종목-정렬어긋남', e, `${i}번째(${hs[i].name}) 가 앞보다 크다`);
        break;
      }
    }
    const codes = hs.map((h) => h.code).filter(Boolean);
    if (new Set(codes).size !== codes.length) flag('error', '보유종목-중복', e, codes.join(','));
    // 화면이 쓰는 파생값이 실제 배열과 맞는지
    if (Number.isFinite(e.top10Weight)) {
      const top10 = hs.slice(0, 10).reduce((s, h) => s + (Number(h.weight) || 0), 0);
      if (Math.abs(top10 - e.top10Weight) > 0.05) {
        flag('error', 'top10Weight-불일치', e, `저장 ${e.top10Weight}% vs 재계산 ${top10.toFixed(2)}%`,
             { stored: e.top10Weight, recomputed: +top10.toFixed(2) });
      }
    }
    if (Number.isFinite(e.holdingCount) && e.holdingCount !== hs.length) {
      flag('warn', 'holdingCount-불일치', e, `저장 ${e.holdingCount} vs 실제 ${hs.length}`);
    }
  } else {
    flag('info', '보유종목-없음', e, '상위 편입종목이 비어 있다');
  }

  // 섹터·자산·국가 비중도 같은 규칙으로 본다.
  for (const [label, obj] of [['섹터', e.sectors], ['자산', e.assets], ['국가', e.countries]]) {
    if (!obj) continue;
    const vals = Object.values(obj).map(Number);
    const sum = vals.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
    if (vals.some((v) => !Number.isFinite(v) || v < 0)) flag('error', `${label}비중-비정상`, e, JSON.stringify(obj).slice(0, 120));
    else if (sum > 101 || (sum > 0 && sum < 90)) flag('warn', `${label}비중-합이상`, e, `합 ${sum.toFixed(2)}%`, { sum: +sum.toFixed(2) });
  }

  // ── 6. 설정액·순자산·시가총액 ───────────────────────────────────────────
  const aum = Number(e.aum), mcap = Number(e.marketCap);
  if (Number.isFinite(aum)) {
    if (aum <= 0) flag('error', '설정액-영이하', e, `aum=${aum}`);
    // 1조 이상은 있지만 100조는 없다. 단위(원/억원)가 섞이면 여기서 걸린다.
    else if (aum > 1e14) flag('error', '설정액-단위의심', e, `aum=${aum} (100조 초과)`, { aum });
    else if (aum < 1e8) flag('warn', '설정액-과소', e, `aum=${aum} (1억 미만)`, { aum });
  } else flag('info', '설정액-없음', e, 'aum 없음');
  if (Number.isFinite(aum) && Number.isFinite(mcap) && aum > 0 && mcap > 0) {
    const r = mcap / aum;
    // 순자산과 시가총액은 괴리율만큼만 차이 나야 한다. 2배 넘게 벌어지면
    // 한쪽이 다른 단위이거나 다른 종목의 값이다.
    if (r > 2 || r < 0.5) {
      flag('error', '시총-설정액-괴리', e, `시총 ${mcap} / 설정액 ${aum} = ${r.toFixed(2)}배`,
           { marketCap: mcap, aum, ratio: +r.toFixed(2) });
    }
  }

  // ── 7. 자금 유입 ────────────────────────────────────────────────────────
  // 유입액은 누적이므로 순자산을 넘을 수 있다(들어왔다 나가면). 다만
  // 순자산의 20배를 넘는 3개월 유입은 단위가 어긋난 것으로 본다.
  if (e.flow && Number.isFinite(aum) && aum > 0) {
    for (const [k, v] of Object.entries(e.flow)) {
      if (v == null) continue;
      if (!Number.isFinite(v)) { flag('error', '유입-비수치', e, `flow.${k}=${v}`); continue; }
      if (Math.abs(v) > aum * 20) {
        flag('error', '유입-과대', e, `flow.${k}=${v} 가 설정액 ${aum} 의 ${(Math.abs(v) / aum).toFixed(0)}배`,
             { period: k, flow: v, aum });
      }
    }
    // 기간이 길수록 |누적| 이 항상 커지진 않지만, 1일 유입이 1년 유입보다
    // 자릿수로 크면 파싱이 어긋난 것이다.
    const d1 = Math.abs(Number(e.flow.d1) || 0), y1 = Math.abs(Number(e.flow.y1) || 0);
    if (y1 > 0 && d1 > y1 * 10) flag('warn', '유입-기간역전', e, `1일 ${e.flow.d1} vs 1년 ${e.flow.y1}`);
  }

  // ── 8. 총보수·괴리율·추적오차·분배율 ────────────────────────────────────
  const ter = Number(e.ter);
  if (Number.isFinite(ter)) {
    // 국내 ETF 총보수는 0.01%~1.5% 안에 있다. 소수/퍼센트 혼동은 여기서 걸린다.
    if (ter < 0) flag('error', '총보수-음수', e, `ter=${ter}`);
    else if (ter > 3) flag('error', '총보수-과다', e, `ter=${ter}% (3% 초과)`, { ter });
    else if (ter === 0) flag('warn', '총보수-영', e, 'ter=0 (무보수는 드물다)');
  } else flag('info', '총보수-없음', e, 'ter 없음');
  if (Number.isFinite(Number(e.premium)) && Math.abs(e.premium) > 10) {
    flag('warn', '괴리율-과다', e, `premium=${e.premium}%`, { premium: e.premium });
  }
  if (Number.isFinite(Number(e.trackingError)) && (e.trackingError < 0 || e.trackingError > 20)) {
    flag('warn', '추적오차-범위밖', e, `trackingError=${e.trackingError}%`);
  }
  if (dy != null && (dy < 0 || dy > 60)) flag('error', '분배율-범위밖', e, `dividendYield=${dy}%`, { dividendYield: dy });

  // ── 9. 현재가와 등락률의 앞뒤 ───────────────────────────────────────────
  const px = Number(e.price), chg = Number(e.change), rate = Number(e.changeRate);
  if (Number.isFinite(px) && px <= 0) flag('error', '현재가-영이하', e, `price=${px}`);
  if (Number.isFinite(px) && Number.isFinite(chg) && Number.isFinite(rate) && px - chg > 0) {
    const recomputed = (chg / (px - chg)) * 100;
    if (Math.abs(recomputed - rate) > 0.15) {
      flag('warn', '등락률-불일치', e, `저장 ${rate}% vs 재계산 ${recomputed.toFixed(2)}%`,
           { stored: rate, recomputed: +recomputed.toFixed(2) });
    }
  }
  // 화면의 1일 수익률은 등락률과 같아야 한다.
  if (Number.isFinite(rate) && Number.isFinite(price.D1) && Math.abs(rate - price.D1) > 0.15) {
    flag('warn', 'D1-등락률-불일치', e, `등락률 ${rate}% vs price.D1 ${price.D1}%`,
         { changeRate: rate, d1: price.D1 });
  }
}

// ── 집계 ──────────────────────────────────────────────────────────────────
const byRule = {};
for (const f of findings) {
  byRule[f.rule] ??= { rule: f.rule, sev: f.sev, count: 0, etfs: new Set(), examples: [] };
  const b = byRule[f.rule];
  b.count += 1; b.etfs.add(f.id);
  if (b.examples.length < 5) b.examples.push(f);
}
const rules = Object.values(byRule)
  .map((b) => ({ ...b, etfCount: b.etfs.size, etfs: undefined }))
  .sort((a, b) => (a.sev === b.sev ? b.count - a.count : (a.sev === 'error' ? -1 : b.sev === 'error' ? 1 : a.sev === 'warn' ? -1 : 1)));

const errorIds = new Set(findings.filter((f) => f.sev === 'error').map((f) => f.id));
const counts = { error: 0, warn: 0, info: 0 };
for (const f of findings) counts[f.sev] += 1;

console.log('=== 규칙별 ===');
const pad = (s, n) => String(s).padEnd(n, ' ');
for (const r of rules) {
  console.log(`  ${pad(r.sev, 6)} ${pad(r.rule, 24)} ${String(r.count).padStart(6)}건  ${String(r.etfCount).padStart(5)}종목`);
}
console.log(`\n오류 ${counts.error} · 경고 ${counts.warn} · 참고 ${counts.info}`);
console.log(`오류가 하나라도 있는 종목: ${errorIds.size} / ${ETFS.length}`);

console.log('\n=== 오류 상위 20건 ===');
for (const f of findings.filter((x) => x.sev === 'error').slice(0, 20)) {
  console.log(`  [${f.rule}] ${f.code} ${f.name} — ${f.detail}`);
}

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify({
  at: new Date().toISOString(), dataUpdatedAt: DATA.updatedAt,
  total: ETFS.length, counts, errorEtfCount: errorIds.size, rules, findings,
}, null, 2));

const md = ['# ETF 자료 전수 감사', '', `감사 시각: ${new Date().toISOString()}`,
  `자료 기준: ${DATA.updatedAt}`, `대상: ${ETFS.length} 종목`, '',
  `**오류 ${counts.error}건 · 경고 ${counts.warn}건 · 참고 ${counts.info}건**`,
  `**오류가 있는 종목 ${errorIds.size} / ${ETFS.length}**`, '',
  '이 감사는 바깥 자료에 붙지 않는다. `data/etf.js` 안에서 서로 어긋나는 것만',
  '잡는다 — 안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 것도 없이 틀린 것이다.', '',
  '## 규칙별', '', '| 심각도 | 규칙 | 건수 | 종목수 |', '|---|---|---:|---:|'];
for (const r of rules) md.push(`| ${r.sev} | ${r.rule} | ${r.count} | ${r.etfCount} |`);
md.push('', '## 오류 상세', '', '| 종목 | 규칙 | 내용 |', '|---|---|---|');
for (const f of findings.filter((x) => x.sev === 'error').slice(0, 300)) {
  md.push(`| ${f.code} ${f.name} | ${f.rule} | ${f.detail.replace(/\|/g, '\\|')} |`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[audit] ${OUT_MD} · ${OUT_JSON} 기록`);
process.exit(counts.error ? 1 : 0);
