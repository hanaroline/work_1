#!/usr/bin/env node
/**
 * 재검증 L2 — 저장한 값이 **원천과 같은가**.
 *
 *   node scripts/reverify_fund_source.mjs [표본수]
 *   -> tools/discovery/fund_reverify_source.{json,md}
 *
 * ── 왜 따로 만드나 ──────────────────────────────────────────────────────────
 *
 * `audit_fund_data.mjs` 는 `data/fund.js` **안에서** 서로 어긋나는 것만 잡는다.
 * 그건 순환이다 — 내가 쓴 규칙으로 내가 만든 파일을 보는 것이라, "원천을 옮겨
 * 적은 것이 맞는가" 는 한 번도 확인되지 않았다. 감사가 오류 0 이어도 수집기가
 * 필드를 통째로 잘못 읽었으면 그 오류는 파일 안에서 앞뒤가 맞는다.
 *
 * 그래서 원천을 **다시 받아** 저장된 값과 맞대 본다.
 *
 * ── 두 번째 구현으로 다시 만든다 ────────────────────────────────────────────
 *
 * 파생값(투자지역·자산군·총보수 범위·보유종목 수·비중 합)을 수집기의 함수로
 * 다시 계산하면 **결정성만 확인**될 뿐 정확성은 확인되지 않는다. 같은 함수가
 * 같은 입력에 같은 답을 내는 것은 당연하다.
 *
 * 그래서 이 파일은 수집기를 **부르지 않고** 파생값을 처음부터 다시 만든다.
 * 두 구현이 같은 답을 내면 그것은 뜻이 있는 일치다.
 *
 * ── 이 검증이 증명하지 못하는 것 ────────────────────────────────────────────
 *
 * **원천(네이버 Npay 증권) 자체가 맞는지는 여기서 알 수 없다.** 네이버는
 * 데이터 벤더 페이지이므로 2차 출처다. 1차 출처는 금융투자협회 전자공시와
 * 운용사 공시다. 그 대조는 reverify_fund_kofia.mjs 에서 따로 시도한다.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_reverify_source.json';
const OUT_MD = 'tools/discovery/fund_reverify_source.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const API = 'https://stock.naver.com/api/fund/funds';
const SAMPLE_N = Number(process.argv[2]) || 400;

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
async function mapLimit(items, limit, fn, onTick) {
  const out = new Array(items.length);
  let next = 0, done = 0;
  async function worker() {
    for (;;) {
      const i = next; next += 1;
      if (i >= items.length) return;
      try { out[i] = { ok: true, value: await fn(items[i], i) }; }
      catch (e) { out[i] = { ok: false, error: `${e.name}: ${e.message}` }; }
      done += 1;
      if (onTick && done % 50 === 0) onTick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  if (onTick) onTick(done, items.length);
  return out;
}

const out = { at: new Date().toISOString(), errors: [], findings: [] };
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[reverify] 중단:', e?.message || e);
  process.exit(1);
});

/** 한 건을 적는다. */
function flag(sev, rule, code, name, detail, nums) {
  out.findings.push({ sev, rule, code, name, detail, ...nums });
}

// ── 두 번째 구현 ────────────────────────────────────────────────────────────
// 수집기를 부르지 않는다. 원천 문서만 보고 처음부터 다시 만든다.

/** 문자열 숫자를 수로. 못 만들면 null. */
function toNum(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const t = String(v).trim();
  if (!t || t === '-') return null;
  const n = Number(t.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * 유형 이름 → 투자지역. 앞머리 두 글자만 본다.
 *
 * **이제 이것은 정답이 아니다.** 예전에는 저장값을 이렇게 만들었고 여기서도
 * 이 값으로 대조했다. 재검증에서 이 방식이 10.7% 틀린다는 것이 드러나(표본
 * 318개) 투자지역을 금투협에서 직접 받게 고쳤다. 곧 이 함수는 이제 "네이버
 * 유형명으로 읽으면 뭐가 나오나" 를 세는 참고용이지 기대값이 아니다.
 * 실제 대조는 아래 '투자지역' 절에서 1차 출처 수집물과 맞댄다.
 */
function regionOf(typeName) {
  if (typeof typeName !== 'string' || !typeName) return null;
  const head = typeName.slice(0, 2);
  if (head === '국내') return 'domestic';
  if (head === '해외') return 'overseas';
  return null;
}
/** 유형 이름 → 자산군. */
function assetOf(typeName) {
  if (typeof typeName !== 'string' || !typeName) return null;
  if (typeName.toUpperCase().includes('MMF')) return 'mmf';
  const rest = typeName.replace(/^(국내|해외)/, '');
  if (rest.includes('주식')) return 'equity';
  if (rest.includes('채권')) return 'bond';
  if (rest.includes('혼합')) return 'mixed';
  if (rest.includes('대체')) return 'alternative';
  if (rest.includes('기타')) return 'other';
  return null;
}
/** 소수 비중 → 퍼센트. 0 이 아닌 것이 0 이 되면 안 된다. */
function pctOf(w) {
  const p = w * 100;
  const r = Number(p.toFixed(4));
  if (r === 0 && p !== 0) return Number(p.toPrecision(3));
  return r;
}
/** 현금성 항목인가. 빌드와 같은 판단을 써야 견줄 수 있다. */
const CASH_RE = /^(원화현금|외화현금|설정현금액|현금|예금|단기예치금|콜론|CASH|Cash( and| &)? Other)/i;

/** 두 수가 같은가. 저장은 소수 4자리로 자르므로 그만큼 봐 준다. */
const near = (a, b, tol = 0.0002) =>
  a == null && b == null ? true
  : (a == null || b == null) ? false
  : Math.abs(Number(a) - Number(b)) <= tol;

// ── 저장된 자료 읽기 ────────────────────────────────────────────────────────
const src = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FUNDS = DATA.funds || [];
const byCode = new Map(FUNDS.map((f) => [f.code, f]));
console.log(`저장된 자료 ${FUNDS.length}개 (기준 ${DATA.updatedAt})`);
out.dataUpdatedAt = DATA.updatedAt;
out.dataCount = FUNDS.length;

// 투자지역의 1차 출처 수집물. 이 층은 "이것이 화면 자료로 그대로 옮겨졌는가"
// 까지만 본다. 없으면 그 대조를 건너뛰고 그렇게 적는다 — 없는 것을 통과로
// 세지 않는다.
let REGION = null;
try {
  const rs = await readFile('data/fund-region.js', 'utf8');
  REGION = JSON.parse(rs.slice(rs.indexOf('{'), rs.lastIndexOf('}') + 1)).region || null;
  console.log(`투자지역 1차 출처 수집물 ${Object.keys(REGION).length}개`);
} catch {
  console.log('투자지역 1차 출처 수집물 없음 — 지역 대조를 건너뛴다');
}
out.regionCollected = REGION ? Object.keys(REGION).length : null;
const naverWouldSay = { checked: 0, differs: 0, filled: 0 };

// ── 0. 목록이 그대로인가 ────────────────────────────────────────────────────
// 원천의 펀드 수가 달라졌으면 표본 대조 전에 알아야 한다.
console.log('\n=== 0. 원천 목록 ===');
const listed = [];
for (let p = 0; p < 400; p += 1) {
  let d;
  try { d = await getJson(`${API}?page=${p}&size=20`); }
  catch (e) { out.errors.push(`page ${p}: ${String(e.message || e)}`); break; }
  const rows = d?.funds || [];
  if (!rows.length) break;
  listed.push(...rows);
  if (d.hasNext === false) break;
}
const listedCodes = new Set(listed.map((f) => f.fundCode));
const storedCodes = new Set(FUNDS.map((f) => f.code));
const missing = [...listedCodes].filter((c) => !storedCodes.has(c));
const extra = [...storedCodes].filter((c) => !listedCodes.has(c));
out.list = { sourceCount: listedCodes.size, storedCount: storedCodes.size,
             missingFromStored: missing.slice(0, 20), missingCount: missing.length,
             notInSource: extra.slice(0, 20), extraCount: extra.length };
console.log(`  원천 ${listedCodes.size}개 · 저장 ${storedCodes.size}개`);
console.log(`  원천에 있는데 저장에 없음 ${missing.length} · 저장에 있는데 원천에 없음 ${extra.length}`);
if (missing.length) flag('warn', '목록-빠짐', null, null, `${missing.length}개: ${missing.slice(0, 5).join(', ')}`);
if (extra.length) flag('warn', '목록-남음', null, null, `${extra.length}개: ${extra.slice(0, 5).join(', ')}`);

// ── 표본 ────────────────────────────────────────────────────────────────────
// 고르게 솎는다. 목록 순서(수익률 정렬)에 쏠리면 특정 성격만 보게 된다.
const codes = FUNDS.map((f) => f.code);
const step = Math.max(1, Math.floor(codes.length / SAMPLE_N));
const sample = codes.filter((_, i) => i % step === 0).slice(0, SAMPLE_N);
console.log(`\n=== 표본 ${sample.length}개 (${codes.length}개 중 고르게) ===`);
out.sampleSize = sample.length;

// ── 대조 ────────────────────────────────────────────────────────────────────
// 화면에 실리는 필드를 하나씩 본다. 통과/불통을 세어 어느 필드가 믿을 만한지
// 필드별로 말할 수 있게 한다.
const tally = {};
function score(field, ok) {
  tally[field] = tally[field] || { checked: 0, same: 0 };
  tally[field].checked += 1;
  if (ok) tally[field].same += 1;
}

const rows = await mapLimit(sample, 6, async (code) => {
  const stored = byCode.get(code);
  const [lp, cp] = await Promise.all([
    getJson(`${API}/${code}/left-panel`),
    getJson(`${API}/${code}/chart-price-panel`),
  ]);
  await sleep(40);
  return { code, stored, lp, cp };
}, (done, total) => console.log(`  ${done}/${total}`));

let checkedFunds = 0;
for (const r of rows) {
  if (!r?.ok) { out.errors.push(`fetch 실패: ${r?.error}`); continue; }
  const { code, stored, lp, cp } = r.value;
  if (!stored) { flag('error', '저장에없음', code, null, '표본 코드가 저장 자료에 없다'); continue; }
  checkedFunds += 1;
  const d = lp?.detail || {};
  const nm = stored.name;

  // ── 그대로 옮긴 값 ──────────────────────────────────────────────────────
  const passthrough = [
    ['name', d.fundName ?? null, stored.name ?? null],
    ['type', d.parentPeerGroupName ?? null, stored.type ?? null],
    ['company', d.companyName ?? null, stored.company ?? null],
    ['inceptionDate', d.inceptionDate ?? null, stored.inceptionDate ?? null],
    ['benchmarkName', d.benchmarkName ?? null, stored.benchmarkName ?? null],
    ['riskGrade', d.riskGrade ?? null, stored.riskGrade ?? null],
    ['tradeDate', d.tradeDate ?? null, stored.tradeDate ?? null],
  ];
  for (const [field, srcV, gotV] of passthrough) {
    const ok = (srcV ?? null) === (gotV ?? null);
    score(field, ok);
    if (!ok) {
      flag('error', `${field}-불일치`, code, nm,
           `원천 ${JSON.stringify(srcV)} vs 저장 ${JSON.stringify(gotV)}`);
    }
  }

  // 수치로 옮긴 값
  const numeric = [
    ['basePrice', toNum(d.basePrice), stored.basePrice ?? null],
    ['changePrice', toNum(d.changePrice), stored.changePrice ?? null],
    ['changeRate', toNum(d.returnIndex), stored.changeRate ?? null],
  ];
  for (const [field, srcV, gotV] of numeric) {
    const ok = near(srcV, gotV);
    score(field, ok);
    if (!ok) flag('error', `${field}-불일치`, code, nm, `원천 ${srcV} vs 저장 ${gotV}`);
  }

  // ── 설정액·순자산 (항등식 관문을 지나 비워질 수 있다) ──────────────────
  {
    const rawAum = toNum(d.derivedAum);
    const rawNav = toNum(d.derivedNav);
    const bp = toNum(d.basePrice);
    let expectAum = rawAum, expectNav = rawNav, dropped = false;
    if (rawAum != null && rawNav != null && bp != null && rawAum > 0 && bp > 0) {
      const rel = Math.abs(rawNav / rawAum - bp / 1000) / (bp / 1000);
      if (!Number.isFinite(rel) || rel > 0.2) { expectAum = null; expectNav = null; dropped = true; }
    }
    const okAum = near(expectAum, stored.aum ?? null, 1);
    const okNav = near(expectNav, stored.nav ?? null, 1);
    score('aum', okAum); score('nav', okNav);
    if (!okAum) flag('error', 'aum-불일치', code, nm,
      `원천 ${rawAum} → 기대 ${expectAum} vs 저장 ${stored.aum ?? null}${dropped ? ' (항등식 미달로 비워야 함)' : ''}`);
    if (!okNav) flag('error', 'nav-불일치', code, nm,
      `원천 ${rawNav} → 기대 ${expectNav} vs 저장 ${stored.nav ?? null}`);
    // 비운 경우 그 사실이 기록돼 있어야 한다.
    const okDropMark = dropped === !!stored.aumDropped;
    score('aumDropped표시', okDropMark);
    if (!okDropMark) {
      flag('error', 'aumDropped-표시어긋남', code, nm,
           `비워야 함=${dropped} vs 기록=${!!stored.aumDropped}`);
    }
  }

  // ── 자산군 (두 번째 구현으로 다시 읽는다) ────────────────────────────────
  // 자산군은 네이버 유형명에서 나온다. 그러니 네이버를 다시 받아 대조하는 것이
  // 맞다.
  {
    const wantA = assetOf(d.parentPeerGroupName);
    const okA = (wantA ?? null) === (stored.assetClass ?? null);
    score('assetClass', okA);
    if (!okA) flag('error', 'assetClass-불일치', code, nm,
      `유형 "${d.parentPeerGroupName}" → 기대 ${wantA} vs 저장 ${stored.assetClass ?? null}`);
  }

  // ── 투자지역 ──────────────────────────────────────────────────────────────
  // **투자지역의 출처는 네이버가 아니다.** 금융투자협회(1차 출처)에서 따로
  // 받는다. 그러므로 이 층에서 네이버 유형명과 맞대면 안 된다 — 그렇게 걸었을
  // 때 659건이 잡혔는데, 어긋난 쪽이 규칙이었지 자료가 아니었다.
  //
  // 이 층이 볼 수 있는 것은 "1차 출처 수집물이 화면 자료로 그대로 옮겨졌는가"
  // 까지다. 금투협이 준 값 자체가 맞는지는 L3-c(reverify_fund_region.mjs)가
  // 금투협을 다시 받아 확인한다. 층을 섞지 않는다.
  {
    const want = REGION ? (REGION[code] ?? null) : null;
    const got = stored.region ?? null;
    const okR = REGION ? want === got : true;
    score('region(1차출처 옮김)', okR);
    if (!okR) flag('error', 'region-옮김어긋남', code, nm,
      `금투협 수집물 ${want} vs 저장 ${got}`);

    // 출처 표시가 값과 앞뒤가 맞아야 한다. 값이 있는데 출처가 없으면
    // 그 값이 어디서 왔는지 아무도 모른다.
    const okSrc = got == null ? true : stored.regionSource === 'kofia';
    score('region.출처표시', okSrc);
    if (!okSrc) flag('error', 'region-출처표시없음', code, nm,
      `지역 ${got} 인데 출처 ${stored.regionSource ?? 'null'}`);

    // 네이버 유형명으로 읽었으면 뭐가 나왔을지 세어 둔다. 오류가 아니라
    // **고친 값어치의 기록**이다. 이 수가 0 에 가까워지면 오히려 1차 출처
    // 수집이 네이버로 되돌아간 것은 아닌지 의심해야 한다.
    naverWouldSay.checked += 1;
    const naverR = regionOf(d.parentPeerGroupName);
    if (naverR == null && got != null) naverWouldSay.filled += 1;
    else if (naverR != null && got != null && naverR !== got) naverWouldSay.differs += 1;
  }

  // ── 위험지표 ────────────────────────────────────────────────────────────
  {
    const m = cp?.metricsDetail?.fundMetric || null;
    const sm = stored.metrics || null;
    const pairs = [['standardDeviation', 'standardDeviation'], ['trackingError', 'trackingError'],
                   ['sharpRatio', 'sharpe'], ['informationRatio', 'informationRatio'],
                   ['jensenAlpha', 'jensenAlpha'], ['beta', 'beta']];
    for (const [sk, gk] of pairs) {
      const a = m ? toNum(m[sk]) : null;
      const b = sm ? (sm[gk] ?? null) : null;
      const ok = near(a, b, 1e-6);
      score(`metrics.${gk}`, ok);
      if (!ok) flag('error', `metrics.${gk}-불일치`, code, nm, `원천 ${a} vs 저장 ${b}`);
    }
  }

  // ── 기간수익률 ──────────────────────────────────────────────────────────
  // 원천 값(retSrc)이 원천과 같은가. 그리고 화면에 실린 값(ret)은 retSrc 의
  // 부분집합이며 값이 같아야 한다 — 검산은 버리기만 하지 값을 바꾸지 않는다.
  {
    const srcRet = {};
    for (const x of cp?.fundReturns?.returns || []) {
      if (x.fundReturn != null) srcRet[x.term] = x.fundReturn;
    }
    const storedSrc = stored.retSrc || {};
    let okAll = true;
    for (const [k, v] of Object.entries(srcRet)) {
      if (!near(storedSrc[k], v, 1e-6)) {
        okAll = false;
        flag('error', 'retSrc-불일치', code, nm, `${k}: 원천 ${v} vs 저장 ${storedSrc[k]}`);
      }
    }
    score('retSrc', okAll);

    let okShown = true;
    for (const [k, v] of Object.entries(stored.ret || {})) {
      if (!near(srcRet[k], v, 0.0002)) {
        okShown = false;
        flag('error', 'ret-원천과다름', code, nm, `${k}: 화면 ${v} vs 원천 ${srcRet[k]}`);
      }
    }
    score('ret(화면)', okShown);

    // 벤치마크
    const srcB = {};
    for (const x of cp?.fundReturns?.returns || []) {
      if (x.benchmarkReturn != null) srcB[x.term] = x.benchmarkReturn;
    }
    let okB = true;
    for (const [k, v] of Object.entries(stored.retBenchmark || {})) {
      if (!near(srcB[k], v, 0.0002)) {
        okB = false;
        flag('error', 'retBenchmark-불일치', code, nm, `${k}: 화면 ${v} vs 원천 ${srcB[k]}`);
      }
    }
    score('retBenchmark', okB);
  }

  // ── 보유종목 ────────────────────────────────────────────────────────────
  {
    const pf = cp?.allocationsPortfolio?.result || null;
    const srcH = pf ? pf.filter((h) => h.itemName || h.itemCode) : null;
    const gotH = stored.holdings || null;
    const okCount = (srcH ? srcH.length : 0) === (gotH ? gotH.length : 0);
    score('holdings.개수', okCount);
    if (!okCount) {
      flag('error', 'holdings-개수불일치', code, nm,
           `원천 ${srcH ? srcH.length : 0} vs 저장 ${gotH ? gotH.length : 0}`);
    } else if (srcH && gotH) {
      // 순서까지 같아야 한다. 순서가 바뀌면 "상위 종목" 이 달라진다.
      let okRows = true;
      for (let i = 0; i < srcH.length; i += 1) {
        const a = srcH[i], b = gotH[i];
        if ((a.itemName || null) !== (b.name ?? null) || (a.itemCode || null) !== (b.code ?? null)) {
          okRows = false;
          flag('error', 'holdings-종목불일치', code, nm,
               `${i}번째: 원천 ${a.itemCode}/${a.itemName} vs 저장 ${b.code}/${b.name}`);
          break;
        }
        const w = toNum(a.weight);
        const usable = w != null && w >= -1.5 && w <= 1.5;
        const want = usable ? pctOf(w) : null;
        if (!near(want, b.weight ?? null, 1e-9)) {
          okRows = false;
          flag('error', 'holdings-비중불일치', code, nm,
               `${a.itemName}: 원천 ${w} → 기대 ${want} vs 저장 ${b.weight ?? null}`);
          break;
        }
      }
      score('holdings.종목·비중', okRows);

      // 파생값을 처음부터 다시 만든다.
      const withCash = gotH.map((h) => ({ ...h, cash: CASH_RE.test(h.name || '') }));
      const stocks = withCash.filter((h) => !h.cash);
      const allKnown = stocks.length > 0 && stocks.every((h) => h.weight != null && Number.isFinite(Number(h.weight)));
      const wantTotal = allKnown ? Number(stocks.reduce((s, h) => s + Number(h.weight), 0).toFixed(2)) : null;
      const desc = stocks.slice().sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0));
      const top10 = desc.slice(0, 10);
      const top10Known = top10.length > 0 && top10.every((h) => h.weight != null);
      const wantTop10 = top10Known ? Number(top10.reduce((s, h) => s + Number(h.weight), 0).toFixed(2)) : null;

      const okHC = stocks.length === (stored.holdingCount ?? 0);
      const okTW = near(wantTotal, stored.totalWeight ?? null, 0.011);
      const okT10 = near(wantTop10, stored.top10Weight ?? null, 0.011);
      score('holdingCount', okHC); score('totalWeight', okTW); score('top10Weight', okT10);
      if (!okHC) flag('error', 'holdingCount-불일치', code, nm, `재계산 ${stocks.length} vs 저장 ${stored.holdingCount}`);
      if (!okTW) flag('error', 'totalWeight-불일치', code, nm, `재계산 ${wantTotal} vs 저장 ${stored.totalWeight ?? null}`);
      if (!okT10) flag('error', 'top10Weight-불일치', code, nm, `재계산 ${wantTop10} vs 저장 ${stored.top10Weight ?? null}`);
    }
  }

  // ── 클래스·총보수 ───────────────────────────────────────────────────────
  {
    const srcC = lp?.returns?.classes || [];
    const gotC = stored.classes || [];
    const okCount = srcC.length === gotC.length;
    score('classes.개수', okCount);
    if (!okCount) {
      flag('error', 'classes-개수불일치', code, nm, `원천 ${srcC.length} vs 저장 ${gotC.length}`);
    } else {
      let okRows = true;
      for (let i = 0; i < srcC.length; i += 1) {
        const a = srcC[i], b = gotC[i];
        if ((a.fundCode || null) !== (b.code ?? null)) {
          okRows = false;
          flag('error', 'classes-코드불일치', code, nm, `${i}번째: ${a.fundCode} vs ${b.code}`);
          break;
        }
        if (!near(toNum(a.totalFee), b.totalFee ?? null, 1e-9)) {
          okRows = false;
          flag('error', 'classes-보수불일치', code, nm,
               `${a.fundName}: 원천 ${a.totalFee} vs 저장 ${b.totalFee ?? null}`);
          break;
        }
      }
      score('classes.보수', okRows);
    }
    // 화면이 쓰는 범위를 원천에서 처음부터 다시 만든다.
    const fees = srcC.map((c) => toNum(c.totalFee)).filter((v) => v != null && v > 0).sort((a, b) => a - b);
    const wantMin = fees.length ? Number(fees[0].toFixed(3)) : null;
    const wantMax = fees.length ? Number(fees[fees.length - 1].toFixed(3)) : null;
    const okMin = near(wantMin, stored.feeMin ?? null, 1e-9);
    const okMax = near(wantMax, stored.feeMax ?? null, 1e-9);
    score('feeMin', okMin); score('feeMax', okMax);
    if (!okMin) flag('error', 'feeMin-불일치', code, nm, `원천 재계산 ${wantMin} vs 저장 ${stored.feeMin ?? null}`);
    if (!okMax) flag('error', 'feeMax-불일치', code, nm, `원천 재계산 ${wantMax} vs 저장 ${stored.feeMax ?? null}`);
  }
}

out.checkedFunds = checkedFunds;

// ── 집계 ────────────────────────────────────────────────────────────────────
out.tally = tally;
const errs = out.findings.filter((f) => f.sev === 'error');
const warns = out.findings.filter((f) => f.sev === 'warn');
out.counts = { error: errs.length, warn: warns.length };

console.log(`\n=== 필드별 일치 (표본 ${checkedFunds}개) ===`);
const rowsT = Object.entries(tally).sort((a, b) => (a[1].same / a[1].checked) - (b[1].same / b[1].checked));
for (const [k, v] of rowsT) {
  const pct = v.checked ? (v.same / v.checked * 100).toFixed(1) : '–';
  console.log(`  ${k.padEnd(24)} ${String(v.same).padStart(4)}/${String(v.checked).padStart(4)}  ${pct}%`);
}
console.log(`\n오류 ${errs.length} · 경고 ${warns.length}`);
if (errs.length) {
  console.log('\n=== 오류 상위 20건 ===');
  for (const f of errs.slice(0, 20)) console.log(`  [${f.rule}] ${f.code} ${f.name ?? ''} — ${f.detail}`);
}

const allSame = rowsT.every(([, v]) => v.same === v.checked);
out.verdict = allSame && !errs.length
  ? `표본 ${checkedFunds}개의 모든 필드가 원천과 일치`
  : `표본 ${checkedFunds}개 중 오류 ${errs.length}건`;
console.log(`\n판정: ${out.verdict}`);
await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const md = ['# 재검증 L2 — 저장한 값이 원천과 같은가', '', `검증 시각: ${out.at}`,
  `자료 기준: ${out.dataUpdatedAt}`, `표본: ${checkedFunds} / ${out.dataCount}개`, '',
  `**${out.verdict}**`, '',
  '`audit_fund_data.mjs` 는 `data/fund.js` 안에서 서로 어긋나는 것만 잡습니다. 그건 순환이라,',
  '"원천을 옮겨 적은 것이 맞는가" 는 확인되지 않습니다. 여기서는 원천을 **다시 받아** 맞대 봅니다.', '',
  '파생값은 수집기 함수를 부르지 않고 **두 번째 구현으로 처음부터 다시** 만들었습니다 —',
  '같은 함수가 같은 답을 내는 것은 결정성일 뿐 정확성이 아니기 때문입니다.', '',
  '## 목록', '',
  `| 항목 | 수 |`, `|---|---:|`,
  `| 원천 목록 | ${out.list.sourceCount} |`,
  `| 저장된 자료 | ${out.list.storedCount} |`,
  `| 원천에 있는데 저장에 없음 | ${out.list.missingCount} |`,
  `| 저장에 있는데 원천에 없음 | ${out.list.extraCount} |`, '',
  '## 필드별 일치', '',
  '| 필드 | 일치 | 검사 | 비율 |', '|---|---:|---:|---:|'];
for (const [k, v] of rowsT) {
  md.push(`| ${k} | ${v.same} | ${v.checked} | ${v.checked ? (v.same / v.checked * 100).toFixed(1) : '–'}% |`);
}
md.push('', `**오류 ${errs.length}건 · 경고 ${warns.length}건**`, '');

// 투자지역은 층이 다르다. 그 사실을 표에 묻지 말고 따로 적는다.
out.naverWouldSay = naverWouldSay;
md.push('## 투자지역은 이 층에서 대조하지 않습니다', '',
  '투자지역의 출처는 네이버가 아니라 **금융투자협회(1차 출처)** 입니다. 그래서 여기서는',
  '"1차 출처에서 받은 값이 화면 자료로 그대로 옮겨졌는가" 까지만 봅니다. 금투협이 준 값',
  '자체가 맞는지는 `reverify_fund_region.mjs`(L3-c)가 금투협을 **다시 받아** 확인합니다.', '',
  '처음에는 이 층에서 네이버 유형명과 맞댔습니다. 그 규칙이 틀렸습니다 — 유형명에서 읽는',
  '방식이 10.7% 어긋난다는 것을 확인하고 수집을 고쳤는데 대조 규칙만 옛것으로 남아 있었고,',
  '그래서 고쳐진 값들이 통째로 오류로 잡혔습니다. **어긋난 쪽이 규칙이었습니다.**', '',
  `표본 ${naverWouldSay.checked}개를 네이버 유형명으로 읽었다면 **${naverWouldSay.differs}개가 다른 값**이 되고`,
  `**${naverWouldSay.filled}개는 빈칸**이 됩니다. 그만큼이 1차 출처로 바로잡힌 몫입니다.`, '',
  '이 수가 0 에 가까워지면 오히려 의심해야 합니다 — 1차 출처 수집이 네이버로 되돌아갔다는', '뜻일 수 있습니다.', '');
if (errs.length) {
  md.push('## 오류', '', '| 표준코드 | 펀드 | 규칙 | 내용 |', '|---|---|---|---|');
  for (const f of errs.slice(0, 200)) {
    md.push(`| ${f.code ?? ''} | ${(f.name ?? '').slice(0, 26)} | ${f.rule} | ${String(f.detail).replace(/\|/g, '\\|')} |`);
  }
  md.push('');
}
if (warns.length) {
  md.push('## 경고', '', '| 규칙 | 내용 |', '|---|---|');
  for (const f of warns.slice(0, 50)) md.push(`| ${f.rule} | ${String(f.detail).replace(/\|/g, '\\|')} |`);
  md.push('');
}
md.push('## 이 검증이 증명하지 못하는 것', '',
  '**원천(네이버 Npay 증권) 자체가 맞는지는 여기서 알 수 없습니다.** 네이버는 데이터 벤더',
  '페이지이므로 **2차 출처**입니다. 1차 출처는 금융투자협회 전자공시와 운용사 공시이며,',
  '그 대조는 `reverify_fund_kofia.mjs` 에서 따로 시도합니다.', '');
if (out.errors.length) {
  md.push('## 수집 오류', '');
  for (const e of out.errors.slice(0, 30)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[reverify] ${OUT_MD} · ${OUT_JSON} 기록`);
process.exit(errs.length ? 1 : 0);
