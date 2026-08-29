#!/usr/bin/env node
/**
 * 국내 설정 공모펀드 수집 — 네이버 Npay 증권.
 *
 *   node scripts/collect_fund_kr.mjs
 *   -> data/fund-kr.js   (window.FUND_KR)
 *
 * 범위는 **국내에 설정된 공모펀드**다. 해외에 설정된 뮤추얼펀드가 아니다.
 * 그 안에서 투자 지역(국내/해외)으로 가른다.
 *
 * 원천은 stock.naver.com 하나다. finance.naver.com/fund/ 는 죽었고,
 * 옛 주소가 일반 증권 홈으로 넘어가는 것을 보고 "펀드 서비스가 없어졌다" 고
 * 단정했던 것이 앞 세션의 오판이었다(tools/discovery/fund_probe7.md).
 *
 *   목록   /api/fund/funds?page={0..159}&size=20      size 상한이 20 이다
 *   상세   /api/fund/funds/{표준코드}/left-panel       유형·운용사·설정액
 *          .../chart-price-panel                      보유종목·자산구성·지표
 *          .../base-price/chart?term=3m               기준가 (하루 간격)
 *          .../base-price/chart?term=5y               기준가 (5년, 성김)
 *
 * ── 기준가 계열을 왜 두 번 받나 ─────────────────────────────────────────────
 *
 * 이 수집기의 핵심이다. 원천의 기간수익률을 그대로 실으면 안 된다.
 *
 *   골든브릿지으뜸단기증권투자신탁 1[채권] (국내채권형)
 *   원천 1개월 +244.94% · 3개월 +245.17% · 1년 +246.20% · 5년 +252.06%
 *
 * 단기채권 펀드가 한 달에 244% 오를 수는 없다. 검산에서 갈린 것은,
 * 이 값이 **네이버 자신의 기준가 계열에서 그대로 나온다**는 것이었다
 * (재계산과 소수 넷째 자리까지 일치, tools/discovery/fund_returns_verify.md).
 *
 *   2026-07-27   974.52
 *   2026-08-27  3361.50   ← 3.45배
 *
 * 곧 계산이 아니라 **계열에 계단이 있다.** 계단 앞뒤의 기준가는 같은 자로 잰
 * 것이 아니므로 나누어도 수익률이 아니다. 그래서 계열을 직접 받아 계단을 찾고,
 * **계단을 건너뛰는 구간은 값을 내지 않는다.**
 *
 * 틀린 숫자를 내보내느니 빈칸이 낫다. 빈칸은 모른다는 뜻이지만 틀린 숫자는
 * 거짓말이다. ETF 에서 이 검산을 건너뛰었다가 화면에 +1,837% 가 나갔다.
 *
 * 짧은 구간과 긴 구간에 계열이 따로 필요하다. `term` 이 길수록 네이버가 점을
 * 성기게 솎아 주기 때문이다 — 3m 은 하루 간격 64점, 5y 는 한 달 간격 60점이다.
 * 계단은 하루 간격 계열에서 잡아야 정확하고, 1년·3년·5년 구간은 긴 계열이라야
 * 덮인다.
 *
 * ── 못 만드는 것 ────────────────────────────────────────────────────────────
 *
 * **총보수를 못 받는다.** 표본 60종목 중 59종목에서 `totalFee: null` 이고
 * 목록·상세가 모두 그렇다. 보수 비교는 이 원천으로 만들 수 없다. 지어내지
 * 않고 빈칸으로 둔다.
 *
 * 호출 수는 목록 160 + 펀드당 4회 ≈ 13,000회다. 동시 6개로 15~20분 걸린다.
 * 수집률이 기준에 못 미치면 파일을 쓰지 않고 끝낸다 — 반쪽짜리로 어제 데이터를
 * 덮는 것이 제일 나쁘다.
 */

import { getJson, mapLimit, num, writeDataFile, assertEnough, sleep } from './etf_lib.mjs';

const API = 'https://stock.naver.com/api/fund/funds';
const OUT = 'data/fund-kr.js';

// 목록 size 상한은 20 이다. 50·100 은 HTTP 400 으로 돌아온다.
const PAGE_SIZE = 20;
const MAX_PAGES = 400;          // 3,196개 = 160페이지. 늘어나도 견디게 넉넉히.
const CONCURRENCY = 6;

const headers = {
  Referer: 'https://stock.naver.com/domestic/fund',
};

// ─────────────────────────── 목록 ───────────────────────────
async function fetchList() {
  const all = [];
  let page = 0;
  for (; page < MAX_PAGES; page += 1) {
    const d = await getJson(`${API}?page=${page}&size=${PAGE_SIZE}`, { headers });
    const rows = d?.funds || [];
    if (!rows.length) break;
    all.push(...rows);
    if (page % 20 === 0) console.log(`[fund] 목록 ${page}페이지 · 누적 ${all.length}`);
    if (d.hasNext === false) { page += 1; break; }
  }
  const uniq = new Map(all.map((f) => [f.fundCode, f]));
  if (!uniq.size) throw new Error('펀드 목록이 비어 있다');
  console.log(`[fund] 목록 ${uniq.size}개 (${page}페이지)`);
  return [...uniq.values()];
}

// ───────────────────── 유형 → 지역·자산군 ─────────────────────
/**
 * 유형 이름에서 투자 지역과 자산군을 읽는다.
 *
 * **분류를 지어내지 않는다.** `parentPeerGroupName` 이 이미 유형 이름이고
 * (국내주식형·해외채권형·MMF·국내대체 …), 그 이름 앞머리가 곧 투자 지역이다.
 * ETF 에서는 이름과 기초지수로 우리가 분류를 만들어야 했지만 펀드는 원천이
 * 준다. 원천이 주는 것을 우리 규칙으로 덮으면 원천과 어긋나기만 한다.
 *
 * 앞머리가 없는 유형(MMF·기타형)은 지역을 **모르는 것으로 둔다.** 국내로
 * 밀어 넣으면 "국내 투자" 라는 거짓 진술이 된다.
 */
function splitType(typeName) {
  if (!typeName) return { region: null, assetClass: null };
  const region = typeName.startsWith('국내') ? 'domestic'
               : typeName.startsWith('해외') ? 'overseas'
               : null;
  const rest = typeName.replace(/^(국내|해외)/, '');
  const assetClass =
      /주식/.test(rest) ? 'equity'
    : /채권/.test(rest) ? 'bond'
    : /혼합/.test(rest) ? 'mixed'
    : /대체/.test(rest) ? 'alternative'
    : /MMF/i.test(typeName) ? 'mmf'
    : /기타/.test(rest) ? 'other'
    : null;
  return { region, assetClass };
}

// ─────────────────────── 기준가 계열·계단 ───────────────────────
/** base-price/chart 응답을 [{day, v}] 로. 오래된 것부터 온다. */
function toSeries(json) {
  return (json?.series || [])
    .map((p) => ({ day: p.tradeDate, v: num(p.basePrice) }))
    .filter((p) => p.day && p.v != null && p.v > 0);
}

/**
 * 기준가 계열의 계단을 찾는다.
 *
 * 계단은 수익률이 아니라 **기준가 재산정**이다. 펀드 합병·클래스 통합·액면
 * 재조정에서 생기고, 그 앞뒤 값은 같은 자로 잰 것이 아니다.
 *
 * 성긴 계열(5년치는 한 달 간격)에서는 두 점 사이가 벌어지므로 배율만 보면
 * 정상적인 등락도 계단으로 잡힌다. 그래서 **하루당** 배율로 본다. 국내
 * 가격제한폭이 ±30% 이고 펀드는 그보다 훨씬 둔하다 — 하루 1.5배는 어떤
 * 펀드에서도 수익률일 수 없다.
 */
const STEP_PER_DAY = 1.5;
function findSteps(rows) {
  const steps = [];
  for (let i = 1; i < rows.length; i += 1) {
    const ratio = rows[i].v / rows[i - 1].v;
    const days = Math.max(1,
      Math.round((Date.parse(rows[i].day) - Date.parse(rows[i - 1].day)) / 864e5));
    const perDay = Math.pow(ratio, 1 / days);
    if (perDay > STEP_PER_DAY || perDay < 1 / STEP_PER_DAY) {
      steps.push({ day: rows[i].day, prevDay: rows[i - 1].day,
                   from: +rows[i - 1].v.toFixed(2), to: +rows[i].v.toFixed(2),
                   ratio: +ratio.toFixed(4) });
    }
  }
  return steps;
}

// 화면에 싣는 기간. 원천이 주는 term 이름을 그대로 쓴다 —
// 이름을 갈아 끼우면 원천과 대조할 때 한 번 더 옮겨야 하고, 그때 어긋난다.
const PERIODS = [
  { key: '1d',  back: (d) => d.setDate(d.getDate() - 1),        long: false },
  { key: '1w',  back: (d) => d.setDate(d.getDate() - 7),        long: false },
  { key: '1m',  back: (d) => d.setMonth(d.getMonth() - 1),      long: false },
  { key: '3m',  back: (d) => d.setMonth(d.getMonth() - 3),      long: false },
  { key: '6m',  back: (d) => d.setMonth(d.getMonth() - 6),      long: true },
  { key: '9m',  back: (d) => d.setMonth(d.getMonth() - 9),      long: true },
  { key: 'ytd', back: null,                                     long: true },
  { key: '1y',  back: (d) => d.setFullYear(d.getFullYear() - 1), long: true },
  { key: '2y',  back: (d) => d.setFullYear(d.getFullYear() - 2), long: true },
  { key: '3y',  back: (d) => d.setFullYear(d.getFullYear() - 3), long: true },
  { key: '5y',  back: (d) => d.setFullYear(d.getFullYear() - 5), long: true },
];

// 하루 간격 계열로 재계산한 값이 원천과 이만큼 넘게 다르면 값을 내지 않는다.
// 기준가는 소수 둘째 자리까지 오므로 반올림 오차가 남는다. 0.5%p 는 넉넉하다.
const NEAR_DAILY = 0.5;

/**
 * 원천 기간수익률을 기준가 계열로 검산한다.
 *
 * 통과한 것만 화면으로 보낸다. 버린 것은 **왜 버렸는지** 같이 남긴다 —
 * 화면과 감사가 "빈칸인 이유" 를 말할 수 있어야 한다.
 *
 * 두 개의 관문이 있다.
 *
 *   (가) 계단이 구간 안에 있으면 버린다. 계단 앞뒤는 같은 자로 잰 것이
 *        아니므로 나누어도 수익률이 아니다. 이것이 244.9% 를 막는 관문이다.
 *   (나) 하루 간격 계열로 다시 계산한 값이 원천과 다르면 버린다. 어느 쪽이
 *        맞는지 모르니 둘 다 내지 않는다.
 *
 * 긴 구간(6개월~5년)은 (나)를 걸지 않는다. 5년 계열이 한 달 간격으로 솎여
 * 와서 기준일이 최대 한 달까지 어긋나기 때문이다 — 그 어긋남을 오류로 세면
 * 멀쩡한 값을 통째로 버리게 된다. ETF 에서 연율 잣대로 정상값을 버릴 뻔한
 * 것과 같은 자리다. 긴 구간은 (가)만 건다.
 */
function verifyReturns(src, daily, long) {
  const kept = {};
  const dropped = [];
  if (!src) return { kept: null, dropped };

  const stepsDaily = findSteps(daily);
  const stepsLong = findSteps(long);
  // 두 계열에서 찾은 계단을 날짜로 합친다. 같은 계단이 양쪽에 잡힐 수 있다.
  const stepDays = [...new Set([...stepsDaily, ...stepsLong].map((s) => s.day))].sort();

  const anchor = daily[daily.length - 1] || long[long.length - 1];

  for (const p of PERIODS) {
    const v = src[p.key];
    // Number(null) 은 0 이고 Number.isFinite(0) 은 true 다. null 을 먼저 본다 —
    // 없는 것을 0 이라고 말하면 "수익률이 0% 였다" 는 거짓 진술이 된다.
    if (v == null || !Number.isFinite(Number(v))) continue;

    const rows = p.long ? long : daily;
    if (!anchor || rows.length < 2) { kept[p.key] = +Number(v).toFixed(4); continue; }

    const last = rows[rows.length - 1];
    let cutoff;
    if (p.back) {
      const dt = new Date(`${last.day}T00:00:00Z`);
      p.back(dt);
      cutoff = dt.toISOString().slice(0, 10);
    } else {
      cutoff = `${last.day.slice(0, 4)}-01-01`;    // ytd
    }

    // (가) 계단이 구간 안에 있는가. 계열이 그 구간을 못 덮으면 판단하지
    //      않는다 — 모르는 것을 안다고 하지 않는다.
    const covered = rows[0].day <= cutoff;
    const hit = stepDays.filter((d) => d > cutoff && d <= last.day);
    if (hit.length) {
      dropped.push({ period: p.key, reason: 'step', source: +Number(v).toFixed(4),
                     at: hit[0] });
      continue;
    }

    // (나) 하루 간격 계열로 다시 계산해 원천과 맞대 본다.
    if (!p.long && covered) {
      let base = null;
      for (const s of rows) { if (s.day <= cutoff) base = s; else break; }
      if (base && base !== last) {
        const cum = (last.v / base.v - 1) * 100;
        if (Math.abs(Number(v) - cum) > NEAR_DAILY) {
          dropped.push({ period: p.key, reason: 'mismatch',
                         source: +Number(v).toFixed(4), recomputed: +cum.toFixed(4) });
          continue;
        }
      }
    }
    kept[p.key] = +Number(v).toFixed(4);
  }
  return { kept: Object.keys(kept).length ? kept : null, dropped,
           steps: stepDays.length ? [...stepsDaily, ...stepsLong] : null };
}

// ─────────────────────────── 상세 ───────────────────────────
/** allocationsAssets 의 모양을 아직 표본에서 못 봤다. 아는 모양만 옮긴다. */
const assetShapes = new Map();      // 모르는 모양은 세어 두고 로그로 알린다
function shapeAssets(a) {
  if (!a) return null;
  const rows = Array.isArray(a) ? a : Array.isArray(a.result) ? a.result : null;
  if (!rows?.length) return null;
  const out = {};
  for (const r of rows) {
    const name = r.itemName ?? r.assetName ?? r.name ?? r.typeName ?? null;
    const w = num(r.weight ?? r.ratio ?? r.value);
    if (name == null || w == null) {
      // 모양을 모르면 지어내지 않는다. 무슨 키가 왔는지만 세어 둔다.
      const k = Object.keys(r).sort().join(',');
      assetShapes.set(k, (assetShapes.get(k) || 0) + 1);
      continue;
    }
    // 비중은 소수(0.0908)로 온다. 보유종목과 같은 자로 맞춘다.
    out[name] = +(w * 100).toFixed(4);
  }
  return Object.keys(out).length ? out : null;
}

async function fetchDetail(code) {
  const [lp, cp, daily, long] = await Promise.all([
    getJson(`${API}/${code}/left-panel`, { headers }),
    getJson(`${API}/${code}/chart-price-panel`, { headers }),
    getJson(`${API}/${code}/base-price/chart?term=3m`, { headers }),
    getJson(`${API}/${code}/base-price/chart?term=5y`, { headers }),
  ]);
  const d = lp?.detail || {};
  const { region, assetClass } = splitType(d.parentPeerGroupName);

  // 기간수익률. chart-price-panel 과 fund-performance 가 같은 값을 준다
  // (7차 탐색에서 확인). 이미 받은 chart-price-panel 것을 쓴다 —
  // 호출을 하나 줄이려고가 아니라, **한 원천에서 짝으로** 가져오기 위해서다.
  // 수익률과 벤치마크가 다른 응답에서 오면 둘이 다른 기준일을 볼 수 있다.
  const retRows = cp?.fundReturns?.returns || [];
  const srcRet = {};
  const benchRet = {};
  for (const r of retRows) {
    if (r.fundReturn != null) srcRet[r.term] = r.fundReturn;
    if (r.benchmarkReturn != null) benchRet[r.term] = r.benchmarkReturn;
  }

  const dailyS = toSeries(daily);
  const longS = toSeries(long);
  const { kept, dropped, steps } = verifyReturns(srcRet, dailyS, longS);

  // 벤치마크 수익률도 같은 관문을 지나게 한다. 펀드 값은 버리고 벤치마크만
  // 남기면 화면에서 "펀드 –, 벤치마크 +12%" 가 되어 견줄 수 없는 두 칸이
  // 나란히 선다. 펀드 값이 없는 기간은 벤치마크도 내지 않는다.
  const bench = {};
  for (const [k, v] of Object.entries(benchRet)) {
    if (kept && kept[k] != null) bench[k] = +Number(v).toFixed(4);
  }

  const pf = cp?.allocationsPortfolio?.result || null;
  const holdings = pf ? pf.map((h) => {
    const w = num(h.weight);
    return {
      code: h.itemCode || null,
      name: h.itemName || null,
      // 원천은 소수(0.090869)로 준다. % 로 옮기되 **없는 것은 없는 채로 둔다.**
      // Number(null) 이 0 이 되어 "비중 0%" 로 둔갑하는 것이 ETF 화면
      // 731종목을 거짓말하게 만든 자리다.
      weight: w == null ? null : +(w * 100).toFixed(4),
    };
  }).filter((h) => h.name || h.code) : null;

  const m = cp?.metricsDetail?.fundMetric || null;

  return {
    name: d.fundName || null,
    type: d.parentPeerGroupName || null,
    region,
    assetClass,
    company: d.companyName || null,
    companyCode: d.companyCode || null,
    riskGrade: d.riskGrade ?? null,
    inceptionDate: d.inceptionDate || null,
    benchmarkName: d.benchmarkName || null,
    basePrice: num(d.basePrice),
    changePrice: num(d.changePrice),
    changeRate: num(d.returnIndex),        // 원천이 1일 등락률을 returnIndex 로 준다
    tradeDate: d.tradeDate || null,
    aum: num(d.derivedAum),                // 설정액
    nav: num(d.derivedNav),                // 순자산
    // 총보수는 원천에 없다(표본 60 중 59가 null). 받아 두되 지어내지 않는다.
    totalFee: num(d.totalFee),
    managementFee: num(d.managementFee),
    salesFee: num(d.salesFee),

    ret: kept,
    retBenchmark: Object.keys(bench).length ? bench : null,
    retSrc: Object.keys(srcRet).length ? srcRet : null,   // 감사가 원천과 대조한다
    retDropped: dropped.length ? dropped : null,
    retAsOf: cp?.fundReturns?.baseDate || d.tradeDate || null,
    steps: steps && steps.length ? steps : null,
    seriesFrom: longS[0]?.day ?? dailyS[0]?.day ?? null,
    seriesTo: (longS[longS.length - 1] || dailyS[dailyS.length - 1])?.day ?? null,

    metrics: m ? {
      standardDeviation: num(m.standardDeviation),
      trackingError: num(m.trackingError),
      sharpe: num(m.sharpRatio),
      informationRatio: num(m.informationRatio),
      jensenAlpha: num(m.jensenAlpha),
      beta: num(m.beta),
    } : null,

    holdings,
    holdingsAvailable: !!cp?.availability?.portfolio,
    assets: shapeAssets(cp?.allocationsAssets),

    // 클래스(A/C/S 등)는 left-panel 이 같이 준다. 따로 부르지 않는다.
    classes: (lp?.returns?.classes || []).map((c) => ({
      code: c.fundCode || null, name: c.fundName || null,
      totalFee: num(c.totalFee),
      ret: { '1m': num(c.returnRate1m), '3m': num(c.returnRate3m),
             '1y': num(c.returnRate1y), '3y': num(c.returnRate3y) },
    })).filter((c) => c.code),
  };
}

// ─────────────────────────── 실행 ───────────────────────────
async function main() {
  const list = await fetchList();

  const details = await mapLimit(list, CONCURRENCY, async (item) => {
    const d = await fetchDetail(item.fundCode);
    await sleep(40);
    return d;
  }, (done, total) => { if (done % 200 === 0 || done === total) console.log(`[fund] 상세 ${done}/${total}`); });

  const funds = [];
  const failures = [];
  let withHoldings = 0;
  let withRet = 0;
  let withStep = 0;
  let droppedCells = 0;
  const stepFunds = [];
  const byType = {};

  list.forEach((item, i) => {
    const res = details[i];
    const d = res?.ok ? res.value : null;
    if (!res?.ok) {
      failures.push({ code: item.fundCode, name: item.fundName, error: res?.error });
      return;                       // 상세가 없으면 유형도 지역도 모른다. 싣지 않는다.
    }

    const t = d.type || '(없음)';
    byType[t] = byType[t] || { n: 0, holdings: 0 };
    byType[t].n += 1;
    if (d.holdings?.length) { byType[t].holdings += 1; withHoldings += 1; }
    if (d.ret) withRet += 1;
    if (d.steps) {
      withStep += 1;
      stepFunds.push({ code: item.fundCode, name: d.name, type: d.type,
                       steps: d.steps.slice(0, 3),
                       srcRet: d.retSrc ? { '1m': d.retSrc['1m'] ?? null, '1y': d.retSrc['1y'] ?? null } : null });
    }
    droppedCells += d.retDropped?.length || 0;

    funds.push({
      id: `FUND:${item.fundCode}`,
      code: item.fundCode,
      ...d,
    });
  });

  console.log(`\n[fund] ${funds.length}개 · 보유종목 ${withHoldings} · 수익률 ${withRet} · 계단 ${withStep}`);
  console.log(`[fund] 검산에서 버린 칸 ${droppedCells}개`);
  if (failures.length) {
    console.log(`[fund] 실패 ${failures.length}개 (앞 5): ` +
      failures.slice(0, 5).map((f) => `${f.code} ${f.error}`).join(' | '));
  }
  console.log('\n[fund] 유형별  (표본 / 보유종목)');
  for (const [t, v] of Object.entries(byType).sort((a, b) => b[1].n - a[1].n)) {
    console.log(`  ${t.padEnd(12)} ${String(v.n).padStart(5)} / ${String(v.holdings).padStart(5)}`);
  }
  if (stepFunds.length) {
    console.log(`\n[fund] 계단이 있는 펀드 ${stepFunds.length}개 (앞 10):`);
    for (const s of stepFunds.slice(0, 10)) {
      const st = s.steps[0];
      console.log(`  ${s.code} ${(s.name || '').slice(0, 24).padEnd(26)} ` +
        `${st.prevDay}→${st.day} ${st.ratio}배 · 원천1개월 ${s.srcRet?.['1m'] ?? '–'}`);
    }
  }
  if (assetShapes.size) {
    console.log('\n[fund] 자산구성에서 모르는 모양:');
    for (const [k, n] of assetShapes) console.log(`  ${n}건  {${k}}`);
  }

  // 반쪽짜리 결과로 어제 파일을 덮는 것이 제일 나쁘다.
  assertEnough('fund.detail', funds.length, list.length, 0.9);
  // 보유종목은 유형을 가려서 본다. 채권형·MMF 는 원천에 아예 없으므로
  // (표본에서 국내채권형 0/6, MMF 0/1) 전체 비율로 걸면 정상인 날도 막힌다.
  // 주식형·혼합형에서만 센다 — 그쪽이 이 화면의 본체다.
  const equityish = funds.filter((f) => f.assetClass === 'equity' || f.assetClass === 'mixed');
  const equityWith = equityish.filter((f) => f.holdings?.length).length;
  assertEnough('fund.holdings(주식·혼합)', equityWith, equityish.length, 0.6);

  await writeDataFile(OUT, 'FUND_KR', {
    updatedAt: new Date().toISOString(),
    source: 'naver',
    count: funds.length,
    listCount: list.length,
    withHoldings,
    withRet,
    withStep,
    droppedCells,
    stepFunds,                       // 감사·화면이 "왜 빈칸인지" 를 말할 수 있게
    failures: failures.slice(0, 50),
    funds,
  }, `국내 설정 공모펀드 — 네이버 수집 ${new Date().toISOString()}`);
}

// continue-on-error 가 죽음을 가린다. 무슨 일이 있어도 끝을 알린다.
process.on('unhandledRejection', (e) => {
  console.error('[fund] 중단:', e?.message || e);
  process.exit(1);
});

await main();
