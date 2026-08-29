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
 *          .../base-price/chart?term=1y               기준가 (주 간격)
 *          .../base-price/chart?term=5y               기준가 (달 간격)
 *
 * ── 기준가 계열을 왜 세 번 받나 ─────────────────────────────────────────────
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
 * 것이 아니므로 나누어도 수익률이 아니다. 그래서 계열을 직접 받아 계단을 찾는다.
 *
 * 다만 **계단이 있다고 무조건 비우면 안 된다.** 아래로 나는 계단(결산·분배로
 * 기준가를 1,000 으로 되돌리는 것)은 네이버가 보정해서 수익률을 낸다. 실물
 * 20종목을 재어 보니 계단을 가로지르는 82개 칸 중 53개가 그런 경우였다.
 * 계단만 보고 비웠으면 멀쩡한 값을 대량으로 버렸다.
 *
 * 그래서 판정할 것은 하나뿐이다 — **화면에 실릴 그 숫자가 계단을 먹었는가.**
 * 자세한 것은 verifyReturns 에 적었다.
 *
 * 틀린 숫자를 내보내느니 빈칸이 낫다. 빈칸은 모른다는 뜻이지만 틀린 숫자는
 * 거짓말이다. ETF 에서 이 검산을 건너뛰었다가 화면에 +1,837% 가 나갔다.
 *
 * 계열이 셋 필요한 것은 `term` 이 길수록 네이버가 점을 성기게 솎아 주기
 * 때문이다 — 3m 은 하루 간격 64점, 1y 는 주 간격 52점, 5y 는 달 간격 60점이다.
 * 계단은 촘촘한 계열에서 잡아야 정확하고, 1년·3년·5년 구간은 긴 계열이라야
 * 덮인다. 하나만 받으면 계단을 놓치거나 구간을 못 덮는다.
 *
 * ── 못 만드는 것 ────────────────────────────────────────────────────────────
 *
 * **총보수를 못 받는다.** 표본 60종목 중 59종목에서 `totalFee: null` 이고
 * 목록·상세가 모두 그렇다. 보수 비교는 이 원천으로 만들 수 없다. 지어내지
 * 않고 빈칸으로 둔다.
 *
 * 호출 수는 목록 160 + 펀드당 5회 ≈ 16,000회다. 동시 6개로 15~20분 걸린다.
 * 수집률이 기준에 못 미치면 파일을 쓰지 않고 끝낸다 — 반쪽짜리로 어제 데이터를
 * 덮는 것이 제일 나쁘다.
 */

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

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
/**
 * 소수 비중(0.090869)을 퍼센트로. **0 이 아닌 것을 0 으로 만들지 않는다.**
 *
 * 처음에는 그냥 `+(w * 100).toFixed(4)` 를 썼다. 파일 크기를 줄이려던 것인데,
 * 그 반올림이 **거짓말을 만들었다.**
 *
 *   PETKIM PETROKIMYA   원천 0.000000045  →  toFixed(4)  →  0
 *   J SAINSBURY PLC     원천 0.000000489  →  toFixed(4)  →  0
 *
 * 원천은 0 을 준 적이 없다. 아주 작은 진짜 비중을 주었는데 내 반올림이 그것을
 * 0 으로 뭉갠 것이다. 화면에는 "0.00%" 로 찍히고, 그건 **담지 않았다**는 뜻으로
 * 읽힌다. ETF 화면 731종목을 거짓말하게 만든 것과 같은 거짓이 반올림을 통해
 * 들어온 셈이다(그때는 `Number(null)` 이 입구였다).
 *
 * 그래서 반올림해서 0 이 될 값만 유효숫자로 남긴다. 흔한 경우는 그대로 짧게
 * 두고, 거짓이 될 자리에서만 자릿수를 늘린다.
 */
function toPct(w) {
  const pct = w * 100;
  const rounded = +pct.toFixed(4);
  if (rounded === 0 && pct !== 0) return +pct.toPrecision(3);
  return rounded;
}

/** base-price/chart 응답을 [{day, v}] 로. 오래된 것부터 온다. */
function toSeries(json) {
  return (json?.series || [])
    .map((p) => ({ day: p.tradeDate, v: num(p.basePrice) }))
    .filter((p) => p.day && p.v != null && p.v > 0);
}

/** 중앙값. */
function median(a) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * 기준가 계열의 계단을 찾는다.
 *
 * 계단은 수익률이 아니다. 두 가지가 있다.
 *   위로 나는 계단 — 기준가 **재산정**. 974.57 → 3,356.48 (3.44배)
 *   아래로 나는 계단 — **결산·분배**. 쌓인 이익을 나눠 주고 기준가를 1,000 으로
 *                     되돌린다. 3,000 → 1,000 (0.33배)
 * 어느 쪽이든 앞뒤 값은 같은 자로 잰 것이 아니다.
 *
 * ── 규칙을 두 번 고쳤다 ────────────────────────────────────────────────────
 *
 * 처음에는 배율을 **하루당으로 환산**해 1.5배를 문턱으로 삼았다. 그러다
 * 골든브릿지스마트단기채(3.147배)를 놓쳤다 — 사이에 주말이 끼어 사흘로
 * 나뉘자 3.147^(1/3) = 1.466 이 되어 문턱 아래로 내려갔다. 주말은 사흘어치
 * 복리가 아니다. 하필 **놓치는 쪽**으로 틀려서, 그대로 두었으면 화면에
 * +215% 가 나갔다(tools/discovery/fund_returns_verify3.md).
 *
 * 그래서 보편 상수 하나를 모든 펀드에 들이대지 않고 **그 펀드 자신의 평소
 * 폭**과 견준다. 하루 0.002% 씩 움직이던 채권형의 3.15배와, 하루 3% 씩
 * 움직이는 2배 레버리지의 35% 는 크기가 비슷해도 뜻이 다르다.
 *
 *   로그수익률의 중앙값절대편차(MAD)로 그 펀드의 평소 폭을 잰다.
 *   |로그수익률| 이 (가) 절대 바닥을 넘고 (나) 평소 폭의 8배를 넘으면 계단.
 *
 * 둘 다 있어야 한다. 바닥만 쓰면 변동이 큰 펀드의 정상적인 하루가 잡히고,
 * 평소 폭만 쓰면 하루 0.001% 씩 움직이는 채권형이 0.5% 만 움직여도 500σ 가 된다.
 */
const STEP_K = 8;
function findSteps(rows, floorRatio) {
  if (rows.length < 5) return [];
  const lr = [];
  for (let i = 1; i < rows.length; i += 1) lr.push(Math.log(rows[i].v / rows[i - 1].v));
  const med = median(lr) ?? 0;
  // MAD 를 정규분포의 표준편차로 되돌리는 상수. 0 이면(완전히 평평한 계열)
  // 평소 폭 조건이 무의미하므로 바닥만 본다.
  const sigma = (median(lr.map((x) => Math.abs(x - med))) ?? 0) * 1.4826;
  const floor = Math.log(floorRatio);
  const steps = [];
  for (let i = 0; i < lr.length; i += 1) {
    const x = Math.abs(lr[i] - med);
    if (x <= floor) continue;                       // (가) 절대 바닥
    if (sigma > 0 && x <= STEP_K * sigma) continue; // (나) 평소 폭의 8배
    steps.push({ day: rows[i + 1].day, prevDay: rows[i].day,
                 from: +rows[i].v.toFixed(2), to: +rows[i + 1].v.toFixed(2),
                 ratio: +(rows[i + 1].v / rows[i].v).toFixed(4),
                 sigmas: sigma > 0 ? +(x / sigma).toFixed(1) : null });
  }
  return steps;
}

/**
 * 되풀이되는 하락 계단 — **결산·분배**를 센다.
 *
 * 계단 탐지(findSteps)가 잡는 것은 계열을 끊는 큰 사건이지만, 결산은 그보다
 * 작게 나기도 한다. 하나클래스원특별자산투자신탁3 의 5년 계열이 그렇다 —
 * 해마다 2월과 8월에 기준가가 0.61~0.90배로 떨어지고 다시 오른다.
 *
 *   2022-02 →03  0.790     2023-08 →09  0.708     2025-02 →03  0.852
 *   2022-08 →09  0.708     2024-02 →03  0.780     2025-08 →09  0.898
 *   2023-02 →03  0.611     2024-08 →09  0.808
 *
 * 이 펀드의 원천 5년 수익률은 **+1,517%** 인데 기준가 계열을 그냥 나누면
 * **−1.07%** 다. 둘 다 맞다 — 네이버는 분배금을 재투자한 값을 주고, 기준가는
 * 나눠 준 만큼 도로 내려가기 때문이다. 구간을 이어 붙이면 +823% 로 원천 쪽에
 * 가깝다(달 간격이라 분배 직전의 고점을 놓쳐 낮게 나온다).
 *
 * 그래서 이 수를 세어 둔다. 감사가 "이 큰 수가 진짜인가" 를 물을 때,
 * **되풀이되는 결산이 있으면 큰 누적수익률은 당연한 것**이라고 답할 근거가 된다.
 * 이것이 없으면 +1,517% 를 한도로 잡아 버리게 된다 — ETF 에서 2배 레버리지의
 * 1년 +843% 를 잡을 뻔했던 자리와 같다.
 */
function countResets(rows, maxRatio) {
  let n = 0;
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i].v / rows[i - 1].v <= maxRatio) n += 1;
  }
  return n;
}

// 계열마다 한 칸이 덮는 기간이 다르므로 바닥을 달리 잡는다.
//   3m 은 하루 간격, 1y 는 주 간격, 5y 는 달 간격으로 솎여 온다.
const SERIES_SPEC = [
  { term: '3m', floorRatio: 1.25 },
  { term: '1y', floorRatio: 1.6 },
  { term: '5y', floorRatio: 2.2 },
];

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

/**
 * 원천이 계단을 수익률에 흘려 넣었다고 볼 격차(%p).
 *
 * 임의로 고른 수가 아니다. 실물 20종목의 82개 칸을 재어 보니 두 무리가
 * 뚜렷하게 갈렸다(tools/discovery/fund_returns_verify4.md).
 *
 *   흘려 넣은 칸 29개 — |차| 0.00 … 5.04 · 12.51 · 17.04
 *   보정한 칸   53개 — |차| 30.07 · 30.47 · 35.80 … 198.98
 *
 * 17 과 30 사이가 비어 있다. 20 은 그 빈자리에 놓은 값이다.
 */
const PROPAGATED_MAX = 20;

/**
 * 원천 기간수익률을 기준가 계열로 검산한다.
 *
 * 통과한 것만 화면으로 보낸다. 버린 것은 **왜 버렸는지** 같이 남긴다 —
 * 화면과 감사가 "빈칸인 이유" 를 말할 수 있어야 한다.
 *
 * ── 관문은 하나뿐이다 ──────────────────────────────────────────────────────
 *
 * 처음에는 "계단이 구간 안에 있으면 버린다" 로 짰다. **그러면 멀쩡한 값을
 * 대량으로 버린다.** 703종목에서 21종목이 계단으로 잡혔는데 그중 18종목은
 * 원천 수익률의 앞뒤가 멀쩡했고, 그 계단은 거의 다 아래로 난 결산·분배였다.
 * 실물로 재어 보니 **네이버는 그런 계단을 보정해서 수익률을 낸다.**
 *
 *   KB연금미국S&P500  1년   원천 +17.49%   생값 −60.12%
 *
 * 결산으로 기준가가 3분의 1이 됐지만 원천의 1년 수익률은 +17.49% 다.
 * 계단이 있다는 이유로 이걸 비웠으면 이 펀드에서만 멀쩡한 칸 5개를 버렸다.
 *
 * 그래서 계단의 방향이나 원인을 우리가 판정하지 않는다. 판정할 것은
 * 하나뿐이다 — **화면에 실릴 그 숫자가 계단을 먹었는가.**
 *
 *   생값 = (마지막 기준가 / 구간 시작 기준가 − 1) × 100   ← 계단이 그대로 들어간다
 *
 *   생값 ≈ 원천 → 네이버가 계단을 그대로 흘려 넣었다. 거짓이다. **비운다.**
 *   생값 ≠ 원천 → 네이버가 보정했다. 쓸 수 있다. **남긴다.**
 *
 * 계단이 없는 구간은 건드리지 않는다. 원천과 생값이 조금 달라도 그것은
 * 대개 기준일이 하루이틀 어긋난 것이다 — 3개월 구간에서 표본의 18% 가 그렇게
 * 어긋났는데, 그걸 오류로 세면 멀쩡한 값을 통째로 버리게 된다.
 *
 * 큰 격차도 계단 없이는 버리지 않는다. 격차가 크다는 것은 (가) 원천이
 * 틀렸거나 (나) **내 탐지기가 놓친 사건을 원천이 보정한** 것인데, 실물에서는
 * 늘 (나)였다. 모르는 쪽으로 버리면 멀쩡한 값을 버린다.
 */
function verifyReturns(src, sets) {
  const kept = {};
  const dropped = [];
  // 계단을 가로지르는데도 **남긴** 칸. 감사가 그 판단을 다시 셈해 볼 수 있게
  // 근거(생값)를 같이 남긴다. 근거 없이 "괜찮다고 봤다" 만 남기면 감사가
  // 수집기의 판단을 믿는 수밖에 없고, 그러면 관문이 하나로 줄어든다.
  const checked = [];
  // 남긴 칸마다 **생값**(계열을 그대로 나눈 값)을 같이 적는다. 감사가
  // "이 큰 수가 진짜인가" 를 임의의 한도가 아니라 그 펀드 자신의 기준가로
  // 판정할 수 있게 하려는 것이다 — ETF 에서 2배 레버리지의 1년 +843% 를
  // 한도로 잡았다가 기준가 +903% 와 맞는 실제 값이었던 자리가 있다.
  const raws = {};
  if (!src) return { kept: null, dropped, checked, raws, steps: null };

  // 세 계열에서 각각 계단을 찾아 날짜로 합친다. 같은 계단이 여럿에 잡힐 수 있다.
  const steps = [];
  for (const spec of SERIES_SPEC) {
    for (const s of findSteps(sets[spec.term] || [], spec.floorRatio)) {
      steps.push({ ...s, term: spec.term });
    }
  }
  const stepDays = [...new Set(steps.map((s) => s.day))].sort();

  // 끝점은 가장 촘촘한 계열의 마지막 값으로 고정한다. 긴 계열은 한 달 간격이라
  // 마지막 점이 몇 주 묵어 있다 — 그걸 끝점으로 쓰면 생값이 통째로 어긋난다.
  const daily = sets['3m'] || [];
  const anchor = daily[daily.length - 1]
              || (sets['1y'] || [])[(sets['1y'] || []).length - 1]
              || (sets['5y'] || [])[(sets['5y'] || []).length - 1];

  for (const p of PERIODS) {
    const v = src[p.key];
    // Number(null) 은 0 이고 Number.isFinite(0) 은 true 다. null 을 먼저 본다 —
    // 없는 것을 0 이라고 말하면 "수익률이 0% 였다" 는 거짓 진술이 된다.
    if (v == null || !Number.isFinite(Number(v))) continue;
    const val = +Number(v).toFixed(4);

    if (!anchor) { kept[p.key] = val; continue; }

    let cutoff;
    if (p.back) {
      const dt = new Date(`${anchor.day}T00:00:00Z`);
      p.back(dt);
      cutoff = dt.toISOString().slice(0, 10);
    } else {
      cutoff = `${anchor.day.slice(0, 4)}-01-01`;    // ytd
    }

    // 그 구간을 덮는 **가장 촘촘한** 계열로 생값을 구한다. 기준일이 덜 어긋난다.
    const rows = [sets['3m'], sets['1y'], sets['5y']]
      .find((r) => r && r.length > 1 && r[0].day <= cutoff);
    if (rows) {
      let b = null;
      for (const s2 of rows) { if (s2.day <= cutoff) b = s2; else break; }
      if (b && b.v > 0) raws[p.key] = +((anchor.v / b.v - 1) * 100).toFixed(4);
    }

    // 계단이 이 구간을 가로지르는가. 안 가로지르면 그대로 싣는다.
    const crossing = stepDays.filter((d) => d > cutoff && d <= anchor.day);
    if (!crossing.length) { kept[p.key] = val; continue; }

    // 가로지른다면 — 원천이 그 계단을 먹었는지 본다.
    if (!rows) {
      // 계열이 구간을 못 덮으니 판정할 수 없다. 모르는 것을 안다고 하지 않는다 —
      // 계단이 가로지르는 것은 아는데 원천이 먹었는지는 모르므로 비운다.
      dropped.push({ period: p.key, reason: 'step', source: val, at: crossing[0] });
      continue;
    }
    let base = null;
    for (const s of rows) { if (s.day <= cutoff) base = s; else break; }
    if (!base || base.v <= 0) {
      dropped.push({ period: p.key, reason: 'step', source: val, at: crossing[0] });
      continue;
    }
    const raw = (anchor.v / base.v - 1) * 100;
    if (Math.abs(Number(v) - raw) <= PROPAGATED_MAX) {
      // 원천이 계단을 그대로 흘려 넣었다. 이 숫자는 수익률이 아니다.
      dropped.push({ period: p.key, reason: 'step', source: val,
                     at: crossing[0], raw: +raw.toFixed(4) });
      continue;
    }
    // 원천이 보정했다. 남기되, 왜 남겼는지 근거를 적어 둔다.
    kept[p.key] = val;
    checked.push({ period: p.key, at: crossing[0], raw: +raw.toFixed(4) });
  }

  // 남긴 칸의 생값만 넘긴다. 버린 칸의 생값은 dropped 에 이미 있다.
  const rawsKept = {};
  for (const k of Object.keys(kept)) if (raws[k] != null) rawsKept[k] = raws[k];

  return { kept: Object.keys(kept).length ? kept : null, dropped, checked,
           raws: Object.keys(rawsKept).length ? rawsKept : null,
           // 되풀이되는 결산·분배의 수. 큰 누적수익률의 근거가 된다.
           resets: countResets(sets['5y'] || [], 0.9),
           steps: steps.length ? steps : null,
           // 구간을 잰 기준일. 감사가 **같은 자**로 다시 재야 한다 —
           // 감사가 retAsOf 로 재면 하루이틀 어긋나고, 계단이 그 경계에 놓인
           // 펀드에서 없던 오류가 생겨 커밋 관문이 헛되이 막힌다.
           anchorDay: anchor ? anchor.day : null };
}

// ─────────────────────────── 상세 ───────────────────────────
/**
 * 자산구성(allocationsAssets).
 *
 * **이 함수는 지금까지 한 번도 값을 낸 적이 없다.** `a.result` 나 배열만 보는데
 * 실제 모양은 `{ assetTypes: [{ assetType, assetTypeName, weight,
 * marketEvaluationAmount }] }` 였다(11차 조사). 3,196개 전부 null 이 나왔고,
 * 모르는 모양을 세는 카운터는 rows 가 null 이라 아예 돌지 않아 로그도 조용했다.
 * 없는 것을 못 알아챈 것이 아니라 **못 알아채게 만들어 놓았다.**
 *
 * 그리고 이 값은 **그대로 쓰면 안 된다.** 교보악사파워인덱스 2 에서
 *
 *   우리 보유종목 비중 합   86.96%
 *   × 기준가/1000 (4.00071)
 *   = 347.90%   ←  네이버 자산구성 '주식' 347.86% 와 0.05%p 차
 *
 * 가 맞기에 분모가 설정원본이라고 적었었다. **전수에서는 안 맞는다.**
 * 보유종목이 전량 공시된 펀드 639개 중 이 관계가 오차 5% 안에 드는 것은
 * 44개(7%)뿐이고, 자산구성 합만 직접 봐도 순자산 대비(21.9%)와 그 밖
 * (72.2%)으로 갈린다. 한 자리에 두 가지 이상이 섞여 있고 가릴 근거가 없다.
 *
 * 그래서 **자산구성은 받아만 두고 화면에 싣지 않는다.** 뜻을 모르는 숫자를
 * 싣느니 빈칸이 낫다. 감사가 이 판단을 매일 다시 센다.
 *
 * 업종구성은 사정이 다르다 — `shapeSectors` 를 보라.
 */
const assetShapes = new Map();      // 모르는 모양은 세어 두고 로그로 알린다
function shapeAssets(a) {
  if (!a) return null;
  const rows = Array.isArray(a) ? a
    : Array.isArray(a.assetTypes) ? a.assetTypes
    : Array.isArray(a.result) ? a.result : null;
  if (!rows?.length) {
    // rows 가 없으면 조용히 null 을 내던 자리다. 무슨 키가 왔는지 세어 둔다.
    if (a && typeof a === 'object') {
      const k = 'top:' + Object.keys(a).sort().join(',');
      assetShapes.set(k, (assetShapes.get(k) || 0) + 1);
    }
    return null;
  }
  const out = {};
  for (const r of rows) {
    const name = r.assetTypeName ?? r.itemName ?? r.assetName ?? r.name ?? r.typeName ?? null;
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

/**
 * 업종구성(allocationsSectors).
 *
 * 11차 조사는 이 열쇠의 **이름만** 남기고 본문은 잘렸다. 그 상태로
 * `shapeAssets` 를 그냥 갖다 붙였고 3,196개 전부 빈칸이 나왔다. 12차에서
 * 본문을 찍어 보니 모양이 이랬다.
 *
 *   { result: [ { sectorName: "필수소비재", weight: 0.395627224 }, ... ] }
 *
 * `shapeAssets` 는 `a.result` 까지는 읽지만 이름 열쇠 후보에 `sectorName`
 * 이 없어 한 줄도 못 옮겼다. 값이 아주 조금 모자란 것이지 자리가 없는
 * 것이 아니었다.
 *
 * **자산구성과 달리 이 값은 뜻이 분명하다.** 12차 표본 25개에서 비중 합이
 * 1.00 · 0.99 · 0.97 로 모이고, 소수 그대로 순자산 대비다. 합이 0.10 이나
 * 0.01 인 펀드도 있는데 그것은 자료가 모자란 것이 아니라 **분류되는 업종에
 * 그만큼만 들어 있다**는 뜻이다(나머지는 채권·유동성). 그래서 합을 100 으로
 * 맞추지 않는다. 맞추면 없는 비중을 지어내는 것이 된다.
 *
 * 업종을 주는 펀드는 많지 않다 — 240개 표본에서 `availability.sectors` 가
 * true 인 것은 25개(10.4%)다. 나머지는 원천이 업종이 없다고 말한 펀드지
 * 우리가 못 받은 펀드가 아니다.
 */
const sectorShapes = new Map();
function shapeSectors(a) {
  if (!a) return null;
  const rows = Array.isArray(a) ? a
    : Array.isArray(a.result) ? a.result
    : Array.isArray(a.sectors) ? a.sectors : null;
  if (!rows?.length) {
    if (a && typeof a === 'object') {
      const k = 'top:' + Object.keys(a).sort().join(',');
      sectorShapes.set(k, (sectorShapes.get(k) || 0) + 1);
    }
    return null;
  }
  const out = {};
  for (const r of rows) {
    const name = r.sectorName ?? r.itemName ?? r.name ?? null;
    const w = num(r.weight ?? r.ratio ?? r.value);
    if (name == null || w == null) {
      sectorShapes.set(Object.keys(r).sort().join(','),
                       (sectorShapes.get(Object.keys(r).sort().join(',')) || 0) + 1);
      continue;
    }
    out[name] = +(w * 100).toFixed(4);
  }
  return Object.keys(out).length ? out : null;
}

async function fetchDetail(code) {
  const [lp, cp, s3m, s1y, s5y, fp, fa] = await Promise.all([
    getJson(`${API}/${code}/left-panel`, { headers }),
    getJson(`${API}/${code}/chart-price-panel`, { headers }),
    getJson(`${API}/${code}/base-price/chart?term=3m`, { headers }),
    getJson(`${API}/${code}/base-price/chart?term=1y`, { headers }),
    getJson(`${API}/${code}/base-price/chart?term=5y`, { headers }),
    // 유형평균 수익률이 여기 있다. chart-price-panel 의 같은 이름 자리는
    // peerCompanyReturn 이 전부 null 인데 이쪽은 차 있다(9차 조사).
    // 우리는 유형평균을 우리가 셈해서 화면에 쓰고 있었다 — 원천이 주는
    // 값이 있으면 그것이 먼저다.
    getJson(`${API}/${code}/fund-performance`, { headers }).catch(() => null),
    // 업종구성. availability.sectors 는 true 인데 chart-price-panel 에는
    // 없었다. /allocation 탭을 열어 보고서야 이 주소를 찾았다(11차).
    getJson(`${API}/${code}/fund-allocation`, { headers }).catch(() => null),
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

  // ── 원천이 주는 유형평균 수익률 ──────────────────────────────────────────
  //
  // 화면은 지금 "유형 평균 대비" 를 **우리가 셈해서** 찍는다. 같은 유형의
  // 펀드들을 우리 자료 안에서 평균 낸 값이다. 그런데 원천이 자기 유형평균을
  // 갖고 있었다 — chart-price-panel 의 peerCompanyReturn 은 전부 null 인데
  // fund-performance 의 같은 이름 자리는 차 있다.
  //
  // **기준일이 다르면 안 받는다.** 수익률과 유형평균이 다른 날을 보면
  // "이 펀드가 유형평균을 이겼다" 는 진술 자체가 성립하지 않는다. 두
  // 응답의 기준일이 같을 때만 옮긴다.
  const peerRet = {};
  const fpBase = fp?.periodReturns?.baseDate ?? null;
  const cpBase = cp?.fundReturns?.baseDate ?? null;
  const peerSameDay = fpBase != null && cpBase != null && fpBase === cpBase;
  if (peerSameDay) {
    for (const r of (fp?.periodReturns?.returns || [])) {
      if (r.peerCompanyReturn != null) peerRet[r.term] = r.peerCompanyReturn;
    }
  }

  // 짧은 구간은 촘촘한 계열로, 긴 구간은 성긴 계열로 본다. term 이 길수록
  // 네이버가 점을 솎아 준다 — 3m 은 하루 간격 64점, 1y 는 주 간격 52점,
  // 5y 는 달 간격 60점이다. 하나만 받으면 계단을 놓치거나 구간을 못 덮는다.
  const sets = { '3m': toSeries(s3m), '1y': toSeries(s1y), '5y': toSeries(s5y) };
  const { kept, dropped, checked, raws, resets, steps, anchorDay } = verifyReturns(srcRet, sets);
  const dailyS = sets['3m'];
  const longS = sets['5y'];

  // 벤치마크 수익률도 같은 관문을 지나게 한다. 펀드 값은 버리고 벤치마크만
  // 남기면 화면에서 "펀드 –, 벤치마크 +12%" 가 되어 견줄 수 없는 두 칸이
  // 나란히 선다. 펀드 값이 없는 기간은 벤치마크도 내지 않는다.
  const bench = {};
  for (const [k, v] of Object.entries(benchRet)) {
    if (kept && kept[k] != null) bench[k] = +Number(v).toFixed(4);
  }

  const pf = cp?.allocationsPortfolio?.result || null;
  const badWeights = [];
  const holdings = pf ? pf.map((h) => {
    const w = num(h.weight);
    // 원천은 비중을 **소수**(0.090869 = 9.09%)로 준다. 그런데 그 자리에
    // 비중일 수 없는 값이 오는 레코드가 있다 —
    //   이지스글로벌부동산 229 · LUXEMBOURG INVESTMENT 271 · weight 777,216,227
    // 100 을 곱하면 화면에 "777억%" 가 찍힌다. 같은 펀드의 derivedNav 는 1 이라
    // 원천 레코드 자체가 깨진 것으로 보인다.
    //
    // 이럴 때 **0 으로 바꾸지 않는다.** 없는 것을 0 이라고 말하면 "안 담았다"
    // 는 거짓 진술이 되고, 그 함정이 ETF 화면 731종목을 거짓말하게 만들었다.
    // 모르는 것은 모르는 채로 둔다 — null 이면 화면이 "–" 로 찍는다.
    //
    // 한도를 1.5 로 잡은 것은, 소수 표기에서 1.0 이 100% 이므로 그보다 크면
    // 비중이 아니기 때문이다. 담보와 노출을 각각 적는 파생형을 감안해 조금
    // 여유를 뒀다.
    const usable = w != null && w >= -1.5 && w <= 1.5;
    if (w != null && !usable) badWeights.push({ name: h.itemName || null, weight: w });
    return {
      code: h.itemCode || null,
      name: h.itemName || null,
      weight: usable ? toPct(w) : null,
    };
  }).filter((h) => h.name || h.code) : null;

  const m = cp?.metricsDetail?.fundMetric || null;
  // 유형평균 위험지표. **인수인계 문서가 "표본에서 null" 이라고 적어 둔 자리다.**
  // 그 말은 맞았지만(그 표본에서는 비어 있었다) 그것을 "이 원천에는 없다" 로
  // 읽고 여기를 안 받았다. 실물을 보니 fundMetric 바로 옆에 차 있고, 네이버
  // 화면도 변동성 41.78 옆에 41.84 를 찍고 있었다
  // (tools/discovery/fund_class_probe2.md).
  //
  // 클래스별 총보수를 같은 식으로 놓칠 뻔했고, 이번이 같은 함정의 세 번째다.
  // **"표본에서 안 보였다" 는 "없다" 가 아니다.**
  const pm = cp?.metricsDetail?.peerMetric || null;

  // ── 설정액·순자산이 그 펀드의 기준가와 앞뒤가 맞는가 ──────────────────────
  //
  // 원천의 두 필드가 무엇인지 407종목으로 확인했다
  // (tools/discovery/fund_fields_verify.md).
  //
  //   derivedNav / derivedAum == basePrice / 1000
  //
  // 407종목 중 393종목이 상대오차 1% 안, 402종목이 5% 안이었다. 곧
  // derivedAum 은 **설정원본**(액면 1,000 기준)이고 derivedNav 는 현재
  // 순자산이며, 둘의 비가 곧 기준가다.
  //
  // 이 항등식이 크게 깨지면 두 값 중 하나가 그 펀드의 것이 아니거나 단위가
  // 다르다. 실제로 이지스글로벌부동산 229 는 derivedNav 가 **1원**인데
  // derivedAum 은 1,869억이다(기준가 0.01).
  //
  // 그럴 때 **싣지 않는다.** 화면의 설정액 필터·랭킹이 그 값을 쓰기 때문에,
  // 틀린 값을 실으면 그 펀드만 틀리는 것이 아니라 순위 전체가 틀린다.
  // 0 으로 바꾸지도 않는다 — 없는 것을 0 이라고 말하면 "설정액이 0원" 이라는
  // 거짓 진술이 된다. 빈칸이 맞다.
  //
  // 한도 20% 는 정상 무리(대부분 3% 안)에서 넉넉히 떨어져 있으면서, 깨진
  // 레코드(80%·93%·100%)는 잡는 자리다.
  const rawAum = num(d.derivedAum);
  const rawNav = num(d.derivedNav);
  const bp = num(d.basePrice);
  let aum = rawAum;
  let nav = rawNav;
  let aumDropped = null;
  if (rawAum != null && rawNav != null && bp != null && rawAum > 0 && bp > 0) {
    const lhs = rawNav / rawAum;
    const rhs = bp / 1000;
    const relErr = Math.abs(lhs - rhs) / rhs;
    if (!Number.isFinite(relErr) || relErr > 0.2) {
      aumDropped = { aum: rawAum, nav: rawNav, basePrice: bp,
                     navOverAum: +lhs.toFixed(8), bpOver1000: +rhs.toFixed(8),
                     relErr: +relErr.toFixed(4) };
      aum = null;
      nav = null;
    }
  }

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
    // 설정액(설정원본, 액면 1,000 기준)과 순자산. 기준가와 앞뒤가 안 맞으면
    // 둘 다 싣지 않는다 — 위의 항등식 참고.
    aum,
    nav,
    aumDropped,
    // 총보수는 펀드 자리에서는 거의 다 비어 있다(표본 60 중 59가 null).
    // 클래스 자리에는 차 있다 — classes[] 참고. 받아 두되 지어내지 않는다.
    totalFee: num(d.totalFee),
    // 보수를 쪼갠 네 자리. 미래에셋 화면이 "연 0.83% = 판매 0.45 / 운용 0.35 /
    // 수탁 0.015 / 사무수탁 0.015" 로 적는 그것이고, 네이버 detail 에 같은
    // 네 자리가 있다. 앞의 둘만 받고 있었다. 표본에서 비어 있다고 안 받으면
    // 차 있는 펀드까지 통째로 버리게 된다 — 이미 세 번 밟은 함정이다.
    managementFee: num(d.managementFee),
    salesFee: num(d.salesFee),
    custodyFee: num(d.custodyFee),
    backOfficeFee: num(d.backOfficeFee),
    preSalesFee: num(d.preSalesFee),
    postSalesFee: num(d.postSalesFee),

    ret: kept,
    retBenchmark: Object.keys(bench).length ? bench : null,
    // 원천이 준 유형평균. 우리가 셈한 것과 구별해 이름을 따로 둔다 —
    // 화면이 "원천 유형평균" 과 "우리가 낸 평균" 을 섞어 찍으면 안 된다.
    retPeerSrc: Object.keys(peerRet).length ? peerRet : null,
    retPeerSameDay: Object.keys(peerRet).length ? peerSameDay : null,
    retSrc: Object.keys(srcRet).length ? srcRet : null,   // 감사가 원천과 대조한다
    retDropped: dropped.length ? dropped : null,
    // 계단을 가로지르는데도 남긴 칸과 그 근거. 감사가 다시 셈해 본다.
    retChecked: checked.length ? checked : null,
    // 남긴 칸을 기준가 계열로 그대로 나눈 값. 감사가 큰 수를 임의의 한도가
    // 아니라 그 펀드 자신의 기준가로 판정하는 데 쓴다.
    retRaw: raws,
    // 5년 계열에서 되풀이된 결산·분배의 수. 분배가 잦은 펀드는 원천 수익률이
    // 기준가 계열보다 훨씬 클 수밖에 없고, 감사가 그것을 근거로 삼는다.
    resets: resets || null,
    retAsOf: cp?.fundReturns?.baseDate || d.tradeDate || null,
    // 검산이 구간을 잰 기준일. 감사가 같은 자로 다시 잰다.
    retAnchor: anchorDay,
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
    // 같은 응답이 주는 유형평균. 우리가 셈해서 만든 것이 아니라 원천이 준
    // 값이다 — 화면에서 그렇게 밝힌다.
    metricsPeer: pm ? {
      standardDeviation: num(pm.standardDeviation),
      trackingError: num(pm.trackingError),
      sharpe: num(pm.sharpRatio),
      informationRatio: num(pm.informationRatio),
      jensenAlpha: num(pm.jensenAlpha),
      beta: num(pm.beta),
    } : null,
    // 위험지표가 몇 주짜리인가. 네이버 화면은 "1년, 연환산 기준" 이라고
    // 적는다. 기준을 안 적으면 그 숫자가 무엇인지 알 수 없다.
    metricsWeeks: num(cp?.metricsDetail?.termWeeks),

    // ── 원천이 거는 문서 링크 ────────────────────────────────────────────
    // chart-price-panel 이 documents[] 로 운용보고서·투자설명서·간이투자
    // 설명서·약관의 PDF 주소와 접수일을 준다. **이미 부르고 있던 응답이다.**
    //
    // 이것이 중요한 까닭은 재검증 보고에서 사용자에게 "보유종목은 운용
    // 보고서에서, 클래스별 보수는 투자설명서에서 직접 확인하시라" 고 적어
    // 보냈기 때문이다. 그 문서들의 주소가 우리가 이미 받고 있던 응답 안에
    // 들어 있었다. 확인할 곳을 말로만 알려 주는 것과 링크를 거는 것은 다르다.
    //
    // 운용보고서·투자설명서는 **1차 출처**다(운용사·판매사가 법정 서식으로
    // 낸 것). 네이버는 그 파일을 옮겨 놓는 자리일 뿐이므로, 화면에서도
    // 2차 출처인 시세와 구분해 적는다.
    documents: Array.isArray(cp?.documents) ? cp.documents.map((x) => ({
      type: x.documentType || null,
      name: x.documentName || null,
      url: x.url || null,
      receivedAt: x.receiveDate || null,
    })).filter((x) => x.url) : null,

    // ── 매매 기준일·투자목적 ─────────────────────────────────────────────
    // left-panel.terms 를 통째로 안 보고 있었다. 환매 대금이 며칠 뒤에
    // 나오는지는 공모펀드를 고를 때 실제로 갈리는 조건인데 화면에 없었다.
    terms: lp?.terms ? {
      standardTime: lp.terms.standardTime || null,      // 기준시각 "3:30"
      buyBefore: num(lp.terms.buyStandardDaysBefore),
      buyAfter: num(lp.terms.buyStandardDaysAfter),
      redeemBefore: num(lp.terms.redeemStandardDaysBefore),
      redeemAfter: num(lp.terms.redeemStandardDaysAfter),
      payBefore: num(lp.terms.redeemPaymentDaysBefore),
      payAfter: num(lp.terms.redeemPaymentDaysAfter),
    } : null,
    // 투자목적. 원천의 문장을 그대로 옮긴다 — 요약하지 않는다.
    objective: lp?.terms?.infoObject || null,

    holdings,
    // 비중일 수 없는 값이 와서 싣지 않은 레코드. 왜 빈칸인지 남긴다.
    badWeights: badWeights.length ? badWeights : null,
    holdingsAvailable: !!cp?.availability?.portfolio,
    // 자산구성. **분모가 순자산이 아니다** — 위 shapeAssets 주석 참고.
    // 받아만 두고 화면에는 아직 안 싣는다.
    assets: shapeAssets(fa?.allocationsAssets ?? cp?.allocationsAssets),
    // 업종구성. /fund-allocation 에만 있다.
    sectors: shapeSectors(fa?.allocationsSectors),
    // 원천이 보유종목·자산구성의 **기준일을 주지 않는다.** 응답 어디에도
    // 날짜가 없다(9·11차에서 응답을 통째로 뒤졌다). 미래에셋 화면은 같은
    // 자리에 "기준일 2026.07.01" 이라고 적어 두는데, 그 날짜는 기준가
    // 날짜보다 두 달 앞선다. 보유종목은 분기 단위 공시라 그럴 수밖에 없다.
    //
    // 우리 화면은 보유종목을 기준가(8월 27일) 바로 옆에 날짜 없이 놓는다.
    // **그러면 오늘 자료로 읽힌다.** 틀린 숫자를 쓴 것이 아니라 날짜를
    // 안 적어서 생기는 거짓이다. 모르면 모른다고 적어야 한다.
    holdingsAsOf: null,
    holdingsAsOfKnown: false,

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

    // 판매수수료는 **목록 행에만** 있다. 상세 200개에서는 preSalesFee·
    // postSalesFee·totalFee 가 전부 null 인데 목록 400개 중 25개는 차 있다
    // (11차 조사). 상세만 보고 "이 원천에 수수료가 없다" 로 넘길 뻔했다 —
    // 같은 함정을 총보수(클래스 자리)·유형평균(peerMetric)·업종구성
    // (/fund-allocation)에서 이미 세 번 밟았다. **없다고 말하려면 어느
    // 자리에서 없는지까지 봐야 한다.**
    const listFee = {
      preSalesFee: num(item.preSalesFee),
      postSalesFee: num(item.postSalesFee),
    };
    funds.push({
      id: `FUND:${item.fundCode}`,
      code: item.fundCode,
      ...d,
      // 상세가 준 값이 있으면 그것을 쓰고, 없을 때만 목록 값을 쓴다.
      preSalesFee: d.preSalesFee ?? listFee.preSalesFee,
      postSalesFee: d.postSalesFee ?? listFee.postSalesFee,
      totalFee: d.totalFee ?? num(item.totalFee),
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
  if (sectorShapes.size) {
    console.log('\n[fund] 업종구성에서 모르는 모양:');
    for (const [k, n] of sectorShapes) console.log(`  ${n}건  {${k}}`);
  }
  // 업종을 받은 펀드 수를 항상 적는다. 지난번에는 0개였는데도 아무 말이
  // 없어서 화면을 만들 때까지 몰랐다. 0 이면 0 이라고 말해야 한다.
  {
    const n = funds.filter((f) => f.sectors && Object.keys(f.sectors).length).length;
    console.log(`\n[fund] 업종구성 있는 펀드 ${n} / ${funds.length}`);
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

// 직접 실행할 때만 수집한다. 시험이 이 파일을 읽어 함수 하나를 검사할 수
// 있어야 하는데, 읽는 것만으로 16,000회를 부르면 안 된다.
const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();

// 시험이 부를 수 있게 내놓는다. 화면에 실리는 값을 만드는 자리들이라
// 회귀 시험을 걸어 둘 값어치가 있다.
export { toPct, findSteps, countResets, verifyReturns, splitType, SERIES_SPEC };
