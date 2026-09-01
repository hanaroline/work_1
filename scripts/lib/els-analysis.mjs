/**
 * ELS 회차 분석 — 제안서(HTML)와 발표 덱(PPTX)이 같은 숫자를 쓰게 하는 공통 층.
 *
 *   const a = await analyze();              // 가장 최근 회차
 *   const a = await analyze('20260821000193');
 *
 * 두 산출물이 각자 계산하면 언젠가 반드시 갈라진다. 등급 기준·추천 규칙·자산군 평균은
 * 전부 여기 한 곳에만 둔다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { drawdown, backtest, fromProspectus, startIndex } from './els-engine.mjs';
import { montecarlo, MC_VERSION } from './els-mc.mjs';
import { spearman, regress, pairAgreement } from './els-stats.mjs';

export const MC = { paths: 100000, seed: 20260823 };  // 시드 고정 — 빌드마다 숫자가 흔들리면 안 된다
// 상관계수 민감도는 "결론이 이 한 값에 얹혀 있나" 를 보는 용도라 본 계산만큼의
// 정밀도가 필요 없다. 여섯 번을 다 본 정밀도로 돌리면 빌드가 몇 분씩 길어진다.
export const MC_SENS = { paths: 25000, seed: 20260823 };

/**
 * 몬테카를로 결과 캐시.
 * 한 회차를 분석하면 20종 × 756스텝 × 10만 경로가 돌아 1분을 넘긴다. HTML·PPT·대장이
 * 각각 analyze() 를 부르므로 캐시가 없으면 같은 계산을 세 번 한다. 입력이 같으면
 * 결과가 같도록 시드를 고정해 두었으니, 그 사실을 그대로 이용한다.
 */
const CACHE_FILE = 'tools/discovery/mc-cache.json';
let CACHE = null, CACHE_DIRTY = false;
const cacheKey = (rcp, no, tag, opts) => [MC_VERSION, rcp, no, tag, opts.paths, opts.seed, opts.drift ?? 0].join(':');

async function loadCache() {
  if (CACHE) return CACHE;
  CACHE = await readFile(CACHE_FILE, 'utf8').then(JSON.parse).catch(() => ({}));
  for (const k of Object.keys(CACHE)) if (!k.startsWith(`${MC_VERSION}:`)) delete CACHE[k];  // 옛 판 버림
  return CACHE;
}
async function saveCache() {
  if (CACHE_DIRTY) await writeFile(CACHE_FILE, JSON.stringify(CACHE, null, 0));
  CACHE_DIRTY = false;
}
/** 캐시를 거쳐 몬테카를로를 돌린다. key 가 없으면 캐시하지 않는다. */
function mcRun(p, vols, pairs, opts, key) {
  if (!p) return null;
  if (key && CACHE && CACHE[key]) return CACHE[key];
  const r = montecarlo(p, vols, pairs, opts);
  if (key && CACHE && r) { CACHE[key] = r; CACHE_DIRTY = true; }
  return r;
}
export const IDX = new Set(['KOSPI200', 'S&P500', 'Nikkei225', 'EuroStoxx50', 'HSCEI']);
export const KINDS = ['지수', '혼합', '종목'];
export const TIER_CUT = [15, 25];                     // MC 손실확률(%) 경계
export const TIERS = [
  { key: 'safe', name: '방어적', desc: '손실 확률이 낮은 축' },
  { key: 'mid', name: '중간', desc: '수익률과 손실 확률이 균형을 이루는 축' },
  { key: 'hot', name: '공격적', desc: '수익률이 높은 만큼 손실 확률도 높은 축' },
];
// 등급 설명은 산출물마다 다시 쓰면 갈라진다. HTML·PPT 가 같은 문장을 가져다 쓴다.
export const TIER_RULE = `등급은 B(같은 조건으로 돌린 손실 확률) 하나로만 가릅니다 — `
  + `${TIER_CUT[0]}% 이하 방어적, ${TIER_CUT[0]}~${TIER_CUT[1]}% 중간, ${TIER_CUT[1]}% 초과 공격적. `
  + `수익률이나 기초자산 종류는 등급에 넣지 않았습니다. 모두 원금비보장 1등급 상품이므로 "안전"이 아니라 서로 견준 순서입니다.`;

export const kindOf = (it) => it.underlyings.every((u) => IDX.has(u)) ? '지수'
  : it.underlyings.some((u) => IDX.has(u)) ? '혼합' : '종목';
export const tierOf = (it) => TIERS[it.tier];

const monthsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000 / 30.44);

/**
 * 금액 표기 — 이 회차에는 USD 표시 상품이 섞여 있다(예: KOSPI200 기초인데 USD 발행).
 * 전부 "원" 으로 찍으면 환위험이 있는 상품을 원화 상품으로 읽게 만든다.
 */
const UNIT = { KRW: '원', USD: '달러', JPY: '엔', EUR: '유로' };
export const unitOf = (it) => UNIT[it?.currency] || ` ${it?.currency ?? ''}`.trimEnd();
export const baseOf = (it) => it?.currency === 'KRW' ? '1만원' : `1만 ${unitOf(it)}`;
/** 105.75% → "10,575원" / "10,575달러" (액면 1만 단위 기준) */
export const money = (it, pct) => pct == null ? '–'
  : Math.round(pct * 100).toLocaleString('ko-KR') + unitOf(it);

/**
 * 받침 유무로 조사를 고른다. 통화가 섞이면서 "1만 달러이 됩니다" 같은 표기가 생겼다.
 * 한글이 아닌 글자로 끝나면 판단하지 않고 둘 다 적는다.
 */
export const josa = (word, withJong, withoutJong) => {
  const c = String(word).trim().slice(-1).charCodeAt(0);
  if (!(c >= 0xac00 && c <= 0xd7a3)) return `${withJong}(${withoutJong})`;
  return (c - 0xac00) % 28 ? withJong : withoutJong;
};

function enrich(item, H, rcp) {
  const p = fromProspectus(item);
  const bt = p && backtest(p, H);
  const dd = p && drawdown(p, H);
  const first = item.schedule[0];
  const every = first ? monthsBetween(item.baseDate || item.issueDate, first.date) : null;

  // 검증 구간은 상품마다 다르다 — 상장이 늦은 기초자산이 섞이면 그만큼 짧아진다
  const ser = item.underlyings.map((u) => H.series[u]);
  const covAt = ser.every(Boolean) ? H.dates[startIndex(ser, H.dates.length)] : null;
  const covYears = covAt ? Math.floor((H.dates[H.dates.length - 1] - covAt) / 10000) : null;

  // 발행사 모의실험은 상품마다 표본 구간이 다르다. 팔란티어처럼 상장이 늦은 자산이
  // 섞이면 3년치(721회)뿐이라 20년치(5,100회)와 나란히 놓고 비교할 수 없다.
  const simYears = item.simRange
    ? +((new Date(item.simRange.to) - new Date(item.simRange.from)) / 31557600000).toFixed(1) : null;
  const simShort = simYears != null && simYears < 10;
  const simYearsWhole = simYears == null ? null : Math.floor(simYears);
  const simWin = item.simLoss == null ? null : +(100 - item.simLoss).toFixed(2);

  // 전 상품을 같은 조건으로 견주기 위한 몬테카를로 — 입력은 발행사가 이론가에 쓴 변동성·상관계수
  const mc = mcRun(p, item.volatility, item.correlation, MC, cacheKey(rcp, item.no, 'base', MC));
  const vmax = item.volatility.length ? Math.max(...item.volatility.map((v) => v.vol)) : null;
  const rho = item.correlation.length ? Math.min(...item.correlation.map((c) => c.rho)) : null;

  // 상대 등급 — 비교 가능한 척도(MC 손실확률) 하나로만 가른다.
  // 이 회차 전부가 원금비보장 1등급이므로 "안전"이 아니라 서로 견준 순서다.
  const tier = mc == null ? 1 : mc.lossRate > TIER_CUT[1] ? 2 : mc.lossRate > TIER_CUT[0] ? 1 : 0;

  return {
    ...item,
    months: p?.maturityMonths,
    every,
    steps: p ? p.schedule.length : null,
    barriers: p ? p.schedule.map((s) => s.barrier) : [],
    totalRate: p?.totalRate,
    ourLoss: bt?.lossRate, ourFirst: bt?.firstRate, ourKi: bt?.kiRate, ourWorst: bt?.worst, runs: bt?.runs,
    covAt, covYears,
    simYears, simYearsWhole, simShort, simWin,
    mcLoss: mc?.lossRate, mcKi: mc?.kiRate, mcFirst: mc?.firstRate, mcAvgLoss: mc?.avgLoss,
    mcSE: mc?.se, mcCI: mc?.ci95, mcByStep: mc?.byStep, mcLizard: mc?.lizardRate, mcPaths: mc?.paths,
    // 기대손실 = 손실 확률 × 평균 손실폭. 줄 세우기는 손실 확률로 하되,
    // 확률만으로 설명되지 않는 부분이 어디서 오는지 보려면 이 값이 필요하다.
    mcExpLoss: mc ? (mc.lossRate / 100) * Math.abs(mc.avgLoss) : null,
    vmax, rho,
    low: dd?.min,
    floor: item.knockIn ?? item.maturityBarrier,
    margin: dd && item.knockIn != null ? dd.min - item.knockIn : null,
    tier,
    value: (item.annualRate ?? 0) + (item.fairValueGap ?? 0),
  };
}

/**
 * "쿠폰이 높으면 그만큼 위험한가" 를 이번 회차 데이터로 확인한다.
 *
 * 쿠폰은 투자자가 파는 풋옵션의 프리미엄이므로 위험과 구조적으로 묶여 있다.
 * 다만 묶여 있다는 것과 정비례한다는 것은 다르다. 어긋나는 지점이 곧 상품을
 * 고르는 자리이므로, 여기서는 얼마나 붙어 있는지와 어디서 갈라지는지를 같이 낸다.
 */
function couponStudy(items, best) {
  const withMc = items.filter((i) => i.mcLoss != null);
  const fair = withMc.filter((i) => (i.fairValueGap ?? 0) > -5);   // 출발 가치가 크게 깎인 상품은 쿠폰이 위험의 대가가 아니다
  const cp = (i) => i.annualRate;
  const both = (xf, yf) => ({ all: spearman(withMc.map(xf), withMc.map(yf)), fair: spearman(fair.map(xf), fair.map(yf)) });

  const rho = {
    vol: both(cp, (i) => i.vmax),
    loss: both(cp, (i) => i.mcLoss),
    expLoss: both(cp, (i) => i.mcExpLoss),
  };
  // 짝 세기·효율은 이 문서가 줄 세우기에 쓰는 척도(손실 확률) 위에서 센다.
  // 여기만 기대손실로 재면 등급·추천과 다른 잣대가 하나 더 생긴다.
  const pairs = {
    all: pairAgreement(withMc, cp, (i) => i.mcLoss),
    fair: pairAgreement(fair, cp, (i) => i.mcLoss),
  };
  const reg = regress(fair.map(cp), fair.map((i) => i.mcLoss));

  // 손실 확률 1%당 받는 연 수익률 — 완전 비례라면 모두 같은 값이어야 한다
  const ratio = (i) => i.annualRate / i.mcLoss;
  const rank1 = [...withMc].sort((a, b) => ratio(b) - ratio(a));
  const fairRank = [...fair].sort((a, b) => ratio(b) - ratio(a));
  const eff = {
    ratio, order: rank1,
    best: rank1[0], worst: rank1[rank1.length - 1],
    spread: ratio(rank1[0]) / ratio(rank1[rank1.length - 1]),
    fairBest: fairRank[0], fairWorst: fairRank[fairRank.length - 1],
    fairSpread: ratio(fairRank[0]) / ratio(fairRank[fairRank.length - 1]),
  };

  // ① 구조 — 기초자산도 변동성도 같은데 쿠폰만 갈리는 짝
  const groups = new Map();
  for (const i of withMc) {
    const k = i.underlyings.join('|');
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(i);
  }
  const big = [...groups.values()].filter((g) => g.length >= 2).sort((a, b) => b.length - a.length)[0] ?? [];
  let twin = null;
  for (let a = 0; a < big.length; a++) {
    for (let b = a + 1; b < big.length; b++) {
      const [hi, lo] = big[a].annualRate >= big[b].annualRate ? [big[a], big[b]] : [big[b], big[a]];
      if (hi.currency !== lo.currency) continue;                   // 통화가 다르면 ③ 통화 이야기가 된다
      if (Math.abs(hi.mcLoss - lo.mcLoss) > 1.5) continue;         // 위험이 사실상 같은 짝만
      const d = hi.annualRate - lo.annualRate;
      if (!twin || d > twin.d) twin = { hi, lo, d };
    }
  }

  // ② 가격 — 갭이 가장 크게 벌어진 상품
  const priced = withMc.reduce((a, b) => ((b.fairValueGap ?? 0) < (a.fairValueGap ?? 0) ? b : a));

  // ③ 통화 — 같은 기초자산인데 통화만 다른 짝
  let fx = null;
  for (const g of groups.values()) {
    const f = g.find((i) => i.currency !== 'KRW');
    const k = g.filter((i) => i.currency === 'KRW').sort((a, b) => b.annualRate - a.annualRate)[0];
    if (f && k && (!fx || f.annualRate > fx.fx.annualRate)) fx = { fx: f, krw: k };
  }

  return {
    n: withMc.length, nFair: fair.length, rho, pairs, reg, eff,
    why: { twin, group: big.sort((a, b) => b.annualRate - a.annualRate), priced, fx },
    best,                                     // 상관 민감도를 확인할 상품 (아래에서 채운다)
    sens: null,
  };
}

/** 결론이 공시 상관계수 한 값에 얹혀 있지 않은지 흔들어 본다 */
function rhoSensitivity(it, rcp) {
  if (!it || !it.correlation?.length) return null;
  const p = fromProspectus(it);
  const rows = [null, 0.9, 0.8, 0.7, 0.6, 0.5].map((r) => {
    const mc = mcRun(p, it.volatility, r == null ? it.correlation : it.correlation.map((c) => ({ ...c, rho: r })), MC_SENS,
      cacheKey(rcp, it.no, `rho:${r ?? 'disclosed'}`, MC_SENS));
    const exp = (mc.lossRate / 100) * Math.abs(mc.avgLoss);
    return { rho: r, loss: mc.lossRate, expLoss: exp, ratio: it.annualRate / mc.lossRate };
  });
  const vols = it.volatility.map((v) => v.vol).sort((a, b) => a - b);
  return { no: it.no, disclosed: Math.min(...it.correlation.map((c) => c.rho)), rows, volSpread: vols[vols.length - 1] - vols[0] };
}

export async function analyze(rcpNo) {
  const w = {};
  new Function('window', await readFile('data/els.js', 'utf8'))(w);
  const H = w.ELS_DATA.history;
  const P = JSON.parse(await readFile('tools/discovery/prospectus_parsed.json', 'utf8'));

  const RCP = rcpNo || Object.keys(P).sort().pop();
  if (!P[RCP]) throw new Error(`접수번호 ${RCP} 없음. 가능: ${Object.keys(P).join(', ')}`);

  const states = await readFile('tools/discovery/offer_states.json', 'utf8').then(JSON.parse).catch(() => null);
  const batch = P[RCP];
  await loadCache();
  const items = batch.items.map((it) => enrich(it, H, RCP));
  const head = items[0];

  /**
   * 청약 일정 — 개인 일반투자자는 숙려기간과 가입의사확인기간에 청약을 할 수 없다.
   * 그래서 이 사람들의 실제 마감은 "숙려제도 대상청약종료일" 이다. 홈페이지와 공시 표지에
   * 적힌 청약종료일(전문투자자·법인 기준)을 그대로 안내하면 며칠을 잘못 알려주게 된다.
   */
  const key = (i) => [i.offerStart, i.offerEnd, i.coolStart, i.coolEnd, i.coolingFrom, i.coolingTo, i.confirmBy].join('|');
  const plan = {
    start: head.offerStart, end: head.offerEnd,
    coolStart: head.coolStart, coolEnd: head.coolEnd,
    coolingFrom: head.coolingFrom, coolingTo: head.coolingTo,
    confirmBy: head.confirmBy, confirmNote: head.confirmNote, payDate: head.payDate,
    uniform: new Set(items.map(key)).size === 1,     // 회차마다 다르면 표지에 대표값을 쓸 수 없다
  };
  plan.retailEnd = plan.coolEnd || plan.end;         // 개인 일반투자자 마감
  plan.retailDays = plan.coolStart && plan.coolEnd
    ? Math.round((new Date(plan.coolEnd) - new Date(plan.coolStart)) / 86400000) + 1 : null;
  plan.hasCooling = Boolean(plan.coolEnd && plan.coolEnd !== plan.end);
  plan.recordingRight = items.every((i) => i.recordingRight);
  plan.maxLossNotice = items.every((i) => i.maxLossNotice);

  // ── 자산군별 위험 — "종목이 섞이면 더 위험한가" 를 같은 척도로 확인한다 ──────
  const withMc = items.filter((i) => i.mcLoss != null);
  const byKind = KINDS.map((k) => {
    const g = withMc.filter((i) => kindOf(i) === k);
    const avg = (f) => g.length ? g.reduce((s, i) => s + f(i), 0) / g.length : null;
    return {
      key: k, n: g.length,
      loss: avg((i) => i.mcLoss), vol: avg((i) => i.vmax), rate: avg((i) => i.annualRate),
      lo: g.length ? Math.min(...g.map((i) => i.mcLoss)) : null,
      hi: g.length ? Math.max(...g.map((i) => i.mcLoss)) : null,
    };
  }).filter((r) => r.n);
  const mcAvgAll = withMc.reduce((s, i) => s + i.mcLoss, 0) / withMc.length;
  const idxRow = byKind.find((r) => r.key === '지수');
  const stockRow = byKind.find((r) => r.key === '종목');
  const kindRatio = idxRow && stockRow ? stockRow.loss / idxRow.loss : null;

  const safest = [...withMc].sort((a, b) => a.mcLoss - b.mcLoss);
  const idxWorst = [...withMc].filter((i) => kindOf(i) === '지수').sort((a, b) => b.mcLoss - a.mcLoss)[0];
  const stockBest = [...withMc].filter((i) => kindOf(i) !== '지수').sort((a, b) => a.mcLoss - b.mcLoss)[0];

  // ── 추천 3종 — 고객 성향별로 한 자리씩 ──────────────────────────────────────
  const krw = (it) => it.currency === 'KRW';
  const sane = (i) => (i.fairValueGap ?? 0) > -5 && !i.simShort;   // 출발 가치가 깎였거나 표본이 짧으면 제외
  const pickMax = (list, by) => list.length ? list.reduce((a, b) => (by(b) > by(a) ? b : a)) : null;
  const slots = [
    { label: '원금을 지키는 게 먼저인 분',
      why: '컴퓨터로 돌려봤을 때 손해 볼 가능성이 가장 낮은 축에 들면서, 그중에서는 수익률이 제일 높습니다.',
      pick: pickMax(items.filter((i) => i.tier === 0 && krw(i) && sane(i)), (i) => i.annualRate) },
    { label: '수익과 안정을 반반 보는 분',
      why: '손해 볼 가능성이 한 단계 올라가는 대신, 받는 수익률이 그보다 훨씬 크게 붙는 자리입니다.',
      pick: pickMax(items.filter((i) => i.tier === 1 && krw(i) && sane(i)), (i) => i.value) },
    { label: '수익률을 먼저 보는 분',
      why: '이번 주에서 가장 높은 수익률입니다. 넣는 순간의 값어치가 크게 깎이지 않은 상품 중에서 골랐습니다.',
      pick: pickMax(items.filter((i) => sane(i) && i.tier < 2), (i) => i.annualRate) },
  ].filter((s) => s.pick);
  // 같은 상품이 두 자리를 차지하면 뒤쪽을 차선책으로 바꾼다
  const seen = new Set();
  for (const s of slots) {
    if (!seen.has(s.pick.no)) { seen.add(s.pick.no); continue; }
    const alt = pickMax(items.filter((i) => !seen.has(i.no) && sane(i)), (i) => i.value);
    if (alt) { s.pick = alt; seen.add(alt.no); }
  }

  const caution = items
    .filter((it) => (it.fairValueGap ?? 0) <= -10 || it.tier === 2 || it.simShort)
    .sort((a, b) => (b.mcLoss ?? 0) - (a.mcLoss ?? 0))
    .slice(0, 4);

  // 위험 한 단위당 받는 수익 — 종목형을 권할 때 근거로 쓴다
  const perRisk = (it) => (it.mcLoss ? it.annualRate / it.mcLoss : null);
  const idxG = withMc.filter((i) => kindOf(i) === '지수');
  const idxPerRisk = idxG.length ? idxG.reduce((s, i) => s + perRisk(i), 0) / idxG.length : null;

  // 쿠폰과 위험이 정말 비례하는가 — 위험당 대가가 가장 좋은 상품으로 상관 민감도까지 확인한다
  const coupon = couponStudy(items, slots[0]?.pick);
  coupon.sens = rhoSensitivity(coupon.eff.fairBest, RCP);
  coupon.sensIsPick = coupon.sens != null && slots.some((s) => s.pick.no === coupon.sens.no);

  await saveCache();

  return {
    coupon,
    rcp: RCP, batch, items, head, H,
    filedOn: `${RCP.slice(0, 4)}.${RCP.slice(4, 6)}.${RCP.slice(6, 8)}`,
    offer: (batch.offer || '').split('~').map((s) => s.trim().replace(/-/g, '.')),
    checkedAt: w.ELS_DATA.checkedAt || w.ELS_DATA.updatedAt || null,
    mc: { ...MC, version: MC_VERSION },
    onOfferNow: states?.['01']?.count ?? null,
    plan,
    byKind, mcAvgAll, kindRatio, safest, idxWorst, stockBest,
    slots, caution, perRisk, idxPerRisk,
    rateMin: Math.min(...items.map((i) => i.annualRate)),
    rateMax: Math.max(...items.map((i) => i.annualRate)),
    gapBest: items.reduce((a, b) => ((b.fairValueGap ?? 0) > (a.fairValueGap ?? 0) ? b : a)),
    gapWorst: items.reduce((a, b) => ((b.fairValueGap ?? 0) < (a.fairValueGap ?? 0) ? b : a)),
    tierCount: [0, 1, 2].map((t) => items.filter((i) => i.tier === t).length),
  };
}
