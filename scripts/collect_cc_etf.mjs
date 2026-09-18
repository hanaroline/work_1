// 국내 상장 ETF 를 ETFCHECK 에서 받아 `data/cc_etf.json` 에 적는다.
//
// 모집단은 **순자산 300억 이상 ∨ 월배당 분류**, 약 892종목이다. 월배당만
// 담다가 2026-09 에 넓혔다 — 분기배당·연배당도 고를 수 있어야 하는데,
// ETFCHECK 분류에는 그 둘이 아예 없어서 실제 지급한 달로 판정해야 하고,
// 그러려면 월배당이 아닌 종목까지 물어야 하기 때문이다.
//
// 파일 이름의 `cc` 는 covered call 이다. 처음에 커버드콜만 담으려고 지은
// 이름인데, 2026-09 에 월배당 ETF 전체로 넓혔다. 이름은 그대로 두었다 —
// 워크플로우·생성기·검사기·문서가 모두 이 이름을 가리키고 있어서, 이름만
// 바꾸려고 여섯 군데를 건드리는 것이 얻는 것보다 위험하다. 커버드콜인지
// 아닌지는 항목마다 `type` 에 적는다.
//
// 이 파일이 제안서 엑셀의 유일한 원천이다. 여기서 만들어 낸 수치는 하나도
// 없다 — 전부 ETFCHECK 이 준 값이거나, 그 값으로 명시된 식에 따라 계산한
// 값이다. 계산한 것은 `derived` 에 식을 함께 적어 둔다.
//
// 어떻게 받나 (관찰 6차까지의 결론. tools/etfcheck-discovery/ 참고)
// ──────────────────────────────────────────────────────────────────────
// ETFCHECK 은 앱 요청에만 답한다. 맨몸으로 fetch 하면 403 이고, 앱이 붙이는
// `authorization: Bearer` 와 `checkclient: <해시>` 를 그대로 달면 200 이 온다.
// 그래서 브라우저로 첫 화면을 **한 번만** 열어 그 머리글을 얻고, 나머지는
// fetch 로 부른다. 종목마다 화면을 여는 길도 있었지만 잇달아 열면
// ERR_EMPTY_RESPONSE 가 온다 — 61종목을 그렇게 열 수는 없다.
//
// 기본 수치(현재가·순자산·거래대금·보수·상장일·운용사)는 스크리너
// (getEtpScreenerMobileList3) 를 **매개변수 없이** 한 번 불러 전 종목을 한꺼번에
// 받는다. 종목마다 상세를 부르던 것을 없앴다 — 상세는 장이 닫히면 시세 항목이
// 빠져서 제일 자주 말썽을 부리던 쪽이었다.
//
// 종목은 이름이 아니라 **분류**로 가린다(getEtpCtgMap). 상품명은 운용사가
// 언제든 바꾸지만 분류는 오래간다.
//
// 세션(클로드 쪽)에서는 etfcheck.co.kr 로 CONNECT 가 403 이라 못 돈다.
// **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://www.etfcheck.co.kr';
const OUT = 'data/cc_etf.json';
const DIAG = 'discovery/cc-etf';
// 저장소에 남겨 두는 진단자료. discovery/ 는 .gitignore 에 걸려 있다.
const DIAG_REPO = 'tools/etfcheck-discovery';

// ── 채택 기준 ──────────────────────────────────────────────────────────
// 고객에게 권하는 자리에 올릴 종목이다. 팔고 싶을 때 못 파는 종목(유동성)과
// 분배금보다 원금이 더 흔들리는 종목(변동성)은 뺀다. 숫자는 여기 한 군데에
// 있고, 엑셀 아래에도 그대로 찍힌다 — 기준을 숨기지 않는다.
//
// 변동성 상한은 2026-09 에 25% 에서 35% 로 올렸다. 25% 에서는 해외 기초자산
// 종목만 남고 국내물이 한 종목도 들어오지 못했기 때문이다. 35% 로 올리면
// 국내 고배당주·금융 기반 커버드콜이 들어온다. 다만 **코스피200 기반은
// 35% 로도 여전히 전부 빠진다** — 이 판(2026-09)에서 43~69% 로 나온다.
// 그쪽까지 담으려면 60% 가 넘어야 하는데, 그 수준이면 "변동성이 큰 종목은
// 제외" 라는 기준이 사실상 없는 것과 같아진다.
const RULES = {
  minAum: 30_000_000_000,      // 순자산총액 300억원
  minTurnover: 500_000_000,    // 60일 평균 거래대금 5억원
  maxVol: 35,                  // 1년 일간수익률 연환산 변동성 35%
  minTrackMonths: 12,          // 상장 후 12개월
};

// 12개월을 요구하는 이유: 연 분배율을 "최근 12개월 분배금 합계 ÷ 현재가" 로
// 적기 때문이다. 상장한 지 아홉 달뿐인 종목의 아홉 달치 합계를 연 분배율이라
// 적으면 실제보다 낮게 나온다. 반대로 아홉 달치를 열두 달로 늘려 적으면 없는
// 분배를 있다고 하는 것이 된다. 어느 쪽도 제안서에 쓸 수 없다.
//
// 재는 대상을 분배 **건수**에서 **상장 기간**으로 바꿨다. 건수로 세면
// 분기배당 종목이 2년을 꼬박 분배하고도 건수가 여덟이라 "이력 8개월" 로
// 적히고 걸러진다. 월배당만 담을 때는 건수가 곧 개월수여서 드러나지 않던
// 결함이다.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

function annualVolatility(closes) {
  // 일간 로그수익률의 표본표준편차 × √252. 영업일 252일은 관행값이다.
  const rets = [];
  for (let i = 1; i < closes.length; i++) {
    const a = closes[i - 1];
    const b = closes[i];
    if (a > 0 && b > 0) rets.push(Math.log(b / a));
  }
  if (rets.length < 60) return null; // 두어 달치로 연 변동성을 말할 수 없다
  const mean = rets.reduce((s, x) => s + x, 0) / rets.length;
  const varr = rets.reduce((s, x) => s + (x - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(varr * 252) * 100;
}

// ── 지급주기와 "최근 12개월" ────────────────────────────────────────────
// ETFCHECK 분류에는 분기배당도 연배당도 없다(0609 계열은 고배당/월배당/
// 주배당/리츠/커버드콜/MLP 뿐). 그래서 주기는 분류가 아니라 **실제 지급
// 횟수**로 판정한다. getEtpItemDivOutline 이 연도별 지급 횟수와 지급한 달
// 목록("01,02,…")을 주므로 달 단위로 정확히 셀 수 있다. 추정이 아니다.
const NOW = new Date();
const CUR_Y = NOW.getFullYear();
const CUR_M = NOW.getMonth() + 1;
// 분배금 합계를 낼 창(窓)은 **정확히 1년 전 오늘**부터다. 20250917 같은
// 여덟 자리로 만들어 분배 기준일(F12506)과 그대로 견준다.
const TTM_FROM = (() => {
  const d = new Date(NOW);
  d.setFullYear(d.getFullYear() - 1);
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`,
  );
})();

function payoutMonths12m(divOutline) {
  const ms = [];
  for (const r of divOutline || []) {
    const y = Number(r.DATE);
    for (const m of String(r.MONTH || '')
      .split(',')
      .map(Number)
      .filter((x) => x >= 1 && x <= 12)) {
      if ((y === CUR_Y && m <= CUR_M) || (y === CUR_Y - 1 && m > CUR_M)) {
        ms.push(`${y}-${String(m).padStart(2, '0')}`);
      }
    }
  }
  return ms.sort();
}

// 이력이 12개월을 못 채운 종목은 **주기를 판정하지 않는다.** 여섯 달에 두 번
// 준 것을 "분기배당" 이라고 부르면 거짓이다. 목록에서 빼지는 않고 그대로
// '판정 불가' 라고 적는다 — 담을지는 담당자가 판단할 일이다.
/** 'YYYY-MM' 두 개가 몇 달 떨어져 있나. */
function monthGap(a, b) {
  const [ay, am] = String(a).split('-').map(Number);
  const [by, bm] = String(b).split('-').map(Number);
  return Math.abs((by - ay) * 12 + (bm - am));
}

function classifyPayout(n, listedOn, paidMonths = []) {
  const s = String(listedOn || '');
  if (/^\d{8}$/.test(s)) {
    const monthsListed = (CUR_Y - Number(s.slice(0, 4))) * 12 + (CUR_M - Number(s.slice(4, 6)));
    if (monthsListed < 12) return '판정 불가(상장 1년 미만)';
  }
  if (n === 0) return '무분배';
  if (n >= 20) return '주배당';
  if (n >= 10) return '월배당';
  if (n >= 3 && n <= 6) return '분기배당';

  // 연 2회는 **반기배당**이다. 예전에는 이 자리가 없어서 전부 '연배당' 으로
  // 들어갔다. 2026-09 판에서 그런 종목이 44개였고, 그중 TIGER 반도체TOP10 ·
  // 현대차그룹플러스 · LG그룹플러스 · RISE KIS국고채30년 은 과거 이력의 지급
  // 간격이 182~183일로 명백한 반기 지급이었다. '연 1회' 로 설명하면 거짓말이
  // 된다.
  //
  // 다만 2회라고 무조건 반기는 아니다. **두 지급이 얼마나 떨어져 있는지**
  // 를 봐야 한다. 연 1회 주던 종목이 한 해만 한 번 더 주면 그 두 번은
  // 서너 달 붙어 있고(KODEX 코스피: 2026-04, 2026-07), 진짜 반기 지급은
  // 여섯 달로 갈린다(TIGER 반도체TOP10: 2025-10, 2026-04 — 실제 지급일도
  // 4월·10월로 되풀이된다).
  //
  // 그래서 다섯~일곱 달 떨어진 것만 반기로 본다. 서너 달 붙은 것은 반기도
  // 연간도 아니라 판단이 서지 않으므로, 없는 확신을 지어내지 않고 예전처럼
  // 연배당에 둔다. 모르는 것을 사실로 적는 것이 제일 나쁘다.
  if (n === 2) {
    const ms = [...paidMonths].sort();
    const gap = ms.length === 2 ? monthGap(ms[0], ms[1]) : 0;
    return gap >= 5 && gap <= 7 ? '반기배당' : '연배당';
  }
  if (n === 1) return '연배당';
  return '비정기'; // 연 7~9회 — 월도 분기도 아니다. 그렇게 적는다.
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const ctx = await browser.newContext({
  locale: 'ko-KR',
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

const seen = [];
let appHeaders = null;
page.on('response', async (res) => {
  const url = res.url();
  if (!url.startsWith(BASE)) return;
  if (!appHeaders && res.request().headers().checkclient) {
    appHeaders = res.request().headers();
  }
  if (!/getEtpMast|getEtpCtgMap|getEtpCtgLarge/.test(url)) return;
  try {
    seen.push({ url, body: await res.text() });
  } catch {
    /* 못 읽는 응답은 넘긴다 */
  }
});

console.log('첫 화면을 연다 (머리글과 마스터를 받으려고)');
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);

if (!appHeaders) {
  throw new Error('앱 머리글(checkclient)을 못 잡았습니다. 화면 구조가 바뀌었을 수 있습니다.');
}
// 브라우저가 스스로 붙이는 머리글은 다시 붙일 수 없다(금지 머리글).
// 중간에 갈아 끼울 수 있게 const 객체 하나를 계속 고쳐 쓴다(refreshHeaders).
const HDRS = Object.fromEntries(
  Object.entries(appHeaders).filter(
    ([k]) => !/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k),
  ),
);

const grab = (re) => [...seen].reverse().find((x) => re.test(x.url));
const mast = JSON.parse(grab(/getEtpMast/)?.body || '{}').results || [];
const ctgMap = JSON.parse(grab(/getEtpCtgMap/)?.body || '{}').results || [];
if (!mast.length || !ctgMap.length) {
  throw new Error(`마스터/분류대응을 못 받았습니다 (마스터 ${mast.length}, 분류 ${ctgMap.length}).`);
}

// 자산군 이름표. 첫 화면이 이걸 부를 때도 있고 안 부를 때도 있어서, 화면이
// 부른 것을 주웠으면 그걸 쓰고 아니면 직접 부른다. 주워지기만 기다렸다가는
// 어느 달엔가 조용히 빈 채로 지나가고, 그러면 자산군이 전부 빈칸이 되면서
// 파킹형을 기본 선택에서 빼는 규칙이 아무 소리 없이 망가진다.
let ctgLarge = JSON.parse(grab(/getEtpCtgLarge/)?.body || '{}').results || [];
if (!ctgLarge.length) {
  for (let i = 0; i < 3 && !ctgLarge.length; i++) {
    try {
      const rr = await page.evaluate(
        async ({ url, headers }) => {
          const res = await fetch(url, { headers, credentials: 'include' });
          return res.status === 200 ? await res.json() : { success: false };
        },
        { url: `${BASE}/user/common/getEtpCtgLarge`, headers: HDRS },
      );
      if (rr?.success === true) ctgLarge = rr.results || [];
    } catch {
      /* 아래에서 다시 본다 */
    }
    if (!ctgLarge.length) await sleep(1500 * (i + 1));
  }
}
if (!ctgLarge.length) {
  throw new Error('자산군 이름표(getEtpCtgLarge)를 못 받았습니다. 자산군이 빈 채로 나가면 파킹형 제외가 망가집니다.');
}
const largeName = new Map(ctgLarge.map((r) => [r.ctg_large_code, r.ctg_large_name]));

const ctgOf = new Map(ctgMap.filter((r) => r.F16013).map((r) => [r.F16013, String(r.ctgInfo || '')]));
const isCoveredCall = (code) => (ctgOf.get(code) || '').includes('0609005');
const isMonthlyCtg = (code) => (ctgOf.get(code) || '').includes('0609002');
const domesticCodes = new Set(
  ctgMap.filter((r) => r.F16013 && r.domestic_flag === 1).map((r) => r.F16013),
);
// 자산군(주식·채권·부동산·단기자금…)은 분류 문자열에서 그대로 유도한다.
// 예전에는 종목마다 상세를 불러 ctg_large_name 을 받아 왔는데, 분류 문자열의
// "01|0101|0101001|USA" 에서 두 번째 조각이 그 값이다. 이미 판정해 둔
// 187종목과 맞춰 보니 **전부 일치하고 불일치가 없다**(확인 2026-09-17).
// 종목마다 한 번씩 부르던 것을 공짜로 얻는다.
function assetClassOf(code) {
  for (const part of (ctgOf.get(code) || '').split(',')) {
    const p = part.split('|');
    if (p.length >= 3 && p[0] === '01') return { code: p[1], name: largeName.get(p[1]) || null };
  }
  return { code: null, name: null };
}

// ── 스크리너 한 번으로 전 종목의 기본 수치를 받는다 ─────────────────────
//
// getEtpScreenerMobileList3 을 **매개변수 없이** 부르면 7,220행이 오고 국내
// 상장 1,540종목을 전부 덮는다. 한 행에 현재가·기준가·순자산·거래대금·
// 거래량·보수·상장일·운용사·최근 분배가 다 있다.
//
// 이게 종목당 두 번의 호출(상세 getEtpItemOutline, 보수 getEtpLatestFee)을
// 없앤다. 게다가 상세는 **장이 닫히면 시세 항목이 빠져서** 그동안 제일 자주
// 말썽을 부리던 쪽이었는데, 스크리너는 장이 열려 있든 아니든 값을 준다.
//
// 처음 관찰했을 때 이 항목이 36행만 주길래 화면용으로 잘라 주는 줄 알았다.
// 아니었다 — 화면이 조건을 걸어 두었던 것이고, 매개변수를 빼면 전부 온다.
const SCREENER_PICK = [
  'F16013', 'F16002', 'F33961', 'F15001', 'F15301', 'F15028', 'F15023',
  'F15015', 'F34763', 'F16017', 'DIV_DATE', 'DIV_RATE', 'REC_DIV_DATE', 'REC_DIV_AMT', 'F12506',
];
async function fetchScreener() {
  let lastErr = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      // 거르는 일은 브라우저 안에서 한다. 7,220행을 통째로 넘기면 수 MB짜리
      // 문자열이 경계를 건너는데 그 자체가 실패 거리다.
      const out = await page.evaluate(
        async ({ url, headers, keep, pick }) => {
          const res = await fetch(url, { headers, credentials: 'include' });
          if (res.status !== 200) return { error: `HTTP ${res.status}` };
          const j = await res.json();
          if (j.success !== true) return { error: `success=${j.success}` };
          const all = j.results || [];
          const keepSet = new Set(keep);
          return {
            total: all.length,
            rows: all
              .filter((x) => keepSet.has(x.F16013))
              .map((x) => Object.fromEntries(pick.map((k) => [k, x[k] ?? null]))),
          };
        },
        {
          url: `${BASE}/user/etp/getEtpScreenerMobileList3`,
          headers: HDRS,
          keep: [...domesticCodes],
          pick: SCREENER_PICK,
        },
      );
      if (out?.error) throw new Error(out.error);
      return out;
    } catch (e) {
      lastErr = e;
      // 이 원천은 `TypeError: Failed to fetch` 를 심심찮게 뱉는다(확인한 판에서
      // 열 번 중 네 번). 간헐적인 실패는 실패가 아니라 다시 물을 일이다.
      console.log(`  스크리너 ${attempt}/5 실패: ${String(e.message).slice(0, 80)}`);
      if (attempt < 5) await sleep(3000 * attempt);
    }
  }
  throw new Error(`스크리너를 다섯 번 불렀으나 실패했습니다: ${String(lastErr?.message).slice(0, 120)}`);
}

const screener = await fetchScreener();
const scr = new Map(screener.rows.map((r) => [r.F16013, r]));
console.log(`스크리너 ${screener.total}행 → 국내 상장 ${scr.size}종목`);
if (scr.size < 1000) {
  throw new Error(`스크리너에서 국내가 ${scr.size}종목뿐입니다. 응답 모양이 바뀌었는지 확인하십시오.`);
}

const skippedNoDiv = [];

// ── 모집단 ────────────────────────────────────────────────────────────
//
// **순자산 300억 이상 ∨ 월배당 분류**, 그중 분배 기록이 있는 종목.
//
// 분기·연배당까지 담으려면 월배당 분류(192종목)만으로는 안 된다 — ETFCHECK
// 분류에는 분기배당도 연배당도 없어서, 지급주기는 실제 지급한 달로 판정해야
// 하고 그러려면 월배당이 아닌 종목까지 물어야 한다. 그렇다고 국내 1,540종목을
// 다 돌면 한도 75분을 넘긴다.
//
// 어디서 끊을지는 어림하지 않고 재서 정했다. 관문 후보를 놓고 "수집에 몇 분이
// 걸리는가" 와 "지금 고를 수 있던 종목을 몇 개 잃는가" 를 같이 세어 봤다.
//
//   순자산 300억 ∧ 일거래 1억   555종목  21분  드롭다운 49개 손실  채택 2개 손실
//   순자산 300억               835종목  31분  드롭다운 34개 손실  채택 0
//   순자산 300억 ∨ 월배당분류   892종목  33분  손실 없음           채택 0
//
// 거래대금을 관문에 넣으면 순자산 2,239억짜리가 "그날 거래가 0.4억이었다" 는
// 이유로 잘린다. 하루치는 그렇게 들쭉날쭉하다. 유동성은 여기서 거르지 않고,
// 60일 평균으로 아래 채택 기준에서 본다 — 관문은 비용을 줄이려고 두는 것이지
// 판정하려고 두는 것이 아니다.
//
// 월배당 분류를 따로 더하는 것은, 순자산이 작아도 월배당이면 이 문서의
// 주인공이기 때문이다. 그것을 빼면 지금 고를 수 있던 종목을 잃는다.
const MIN_UNIVERSE_AUM = 30_000_000_000;
const universe = [...scr.values()]
  .filter((r) => (num(r.F15028) ?? 0) >= MIN_UNIVERSE_AUM || isMonthlyCtg(r.F16013))
  // 분배한 적이 없는 종목은 부르지 않는다.
  //
  // 스크리너가 종목마다 마지막 분배일(DIV_DATE)을 공짜로 준다. 그게 비어
  // 있으면 분배 기록이 아예 없다는 뜻이고, 그런 종목은 연 분배율을 낼 수 없어
  // 이 문서에 담을 수가 없다. 2026-09 판에서 그런 종목 72개를 확인해 보니
  // **전부** 무분배(18) 아니면 상장 1년 미만(10)이었고 분배한 종목은 하나도
  // 없었다(나머지는 예산에 걸려 확인 못 함).
  //
  // 빼도 놓치지 않는다. 스크리너는 매달 새로 받으므로, 그 종목이 분배를
  // 시작하면 다음 달에 DIV_DATE 가 생기면서 저절로 들어온다.
  .filter((r) => {
    if (r.DIV_DATE || r.REC_DIV_DATE) return true;
    skippedNoDiv.push(r.F16013);
    return false;
  })
  // 월배당을 먼저, 그다음 순자산 큰 순. 예산에 걸려 중간에 멈추더라도 지금
  // 쓰고 있는 종목부터 챙긴다 — 잘리는 자리는 늘 뒤쪽이어야 한다.
  .sort((a, b) => {
    const am = isMonthlyCtg(a.F16013) ? 0 : 1;
    const bm = isMonthlyCtg(b.F16013) ? 0 : 1;
    if (am !== bm) return am - bm;
    return (num(b.F15028) ?? 0) - (num(a.F15028) ?? 0);
  });

const mastOf = new Map(mast.filter((r) => r.F16013).map((r) => [r.F16013, r]));
console.log(`분배 기록이 없어 부르지 않는 종목 ${skippedNoDiv.length}개 (호출 0회)`);
console.log(
  `모집단 ${universe.length}종목 — ` +
    `월배당 분류 ${universe.filter((r) => isMonthlyCtg(r.F16013)).length}, ` +
    `그 외(순자산 ${MIN_UNIVERSE_AUM / 1e8}억 이상) ${universe.filter((r) => !isMonthlyCtg(r.F16013)).length}`,
);
if (universe.length < 100) {
  throw new Error(`모집단이 ${universe.length}종목뿐입니다. 분류 코드나 응답 모양이 바뀌었는지 확인하십시오.`);
}

// ── 분배 이력 곳간 ────────────────────────────────────────────────────
//
// 종목마다 다섯 번 묻는데, 그중 세 번(분배 개요·분배 이력·월별 분배)은
// **분배가 새로 일어나지 않았으면 지난달과 똑같은 답**이 온다. 892종목이면
// 2,676번을 같은 답 받자고 묻는 셈이고, 그러다 원천이 막아 지난 판에서
// 194종목이 403 으로 떨어졌다.
//
// 무효화 신호가 정확히 있다. 스크리너가 매번 공짜로 주는 마지막 분배일
// (REC_DIV_DATE)이 곳간에 적어 둔 것과 같으면, 그 사이 새 분배가 없었다는
// 뜻이므로 분배 이력이 바뀌었을 수가 없다. 추측이 아니라 확정이다. 다르면
// 그 종목만 다시 묻는다.
//
// 변동성과 거래대금은 곳간에 넣지 않는다. 그것들은 분배와 상관없이 날마다
// 바뀌므로 매번 새로 받아야 한다. 아껴도 되는 것만 아낀다.
//
// 연 분배율은 곳간에 **넣지 않고 매번 다시 계산한다.** 창(窓)이 달마다
// 움직여서 지난달 합계를 그대로 쓰면 창 밖으로 나간 분배가 남아 있게 된다.
// 곳간에는 분배 **내역**을 넣고, 창은 이번 달 것으로 다시 씌운다.
const CACHE = 'data/etf_dist_cache.json';
// 곳간에 담는 **칸이 바뀌면 이 수를 올린다.** 그러면 옛 판은 전부 다시 받는다.
//
// 이걸 안 두어서 과세비율이 통째로 빈 채 나갔다. 새 칸(taxBase)을 담게
// 고쳐 놓고 곳간 판정은 "마지막 분배일이 그대로인가" 만 보게 두었더니,
// 이미 쌓여 있던 659종목이 전부 곳간에 걸려 새 호출을 건너뛰었다. 그 칸이
// 없으니 빈 배열이 되고, 과세비율은 661종목 중 3종목만 나왔다. 수집은
// '성공' 으로 끝나고 아무도 안 알려 준다 — 조용히 아무 일도 안 일어나는
// 쪽이라 제일 나쁘다.
//
// 무효화 신호가 둘이라는 것을 놓쳤다. 하나는 "자료가 새로 생겼나"(분배일),
// 다른 하나는 "우리가 담는 것이 달라졌나"(이 수). 앞의 것만 보고 있었다.
const CACHE_V = 2;

// 시세 쪽 곳간. **판 번호를 분배 쪽과 따로 둔다.**
//
// 곳간에 들어 있는 종목도 시세 두 통(getSimpleEtpHist·getEtpTermHist)은 매번
// 불렀다. 662종목이면 그것만 1,324통 — 원천이 한 판에 받아 주는 양의 일곱 할이다.
// 따뜻한 곳간으로 돌린 판이 그래도 벽에 부딪힌 이유가 이것이었다.
//
// 그런데 이 두 통이 내는 것은 **1년 변동성**과 **60일 평균 거래대금**이다. 한 달에
// 한 번 내는 제안서에서 이 값이 며칠 묵어도 달라지는 것이 없다. 현재가는 스크리너
// (전 종목 한 통)에서 따로 오므로 최신으로 남는다.
//
// 판 번호를 같이 쓰면 안 된다. 시세 칸이 바뀌었다고 CACHE_V 를 올리면 분배 이력까지
// 통째로 버려져, 종목당 두 통이면 될 판이 여섯 통이 된다. 지난 판에서 실제로
// 그렇게 벽에 부딪혔다. 무효화는 무효로 만들 것에만 걸어야 한다.
const MKT_V = 1;
// 30일. 7일로 두었더니 매월 1일 정기 갱신은 늘 곳간 밖이라 시세 1,326통을
// 그대로 냈다(수집 14분). 30일이면 그 판도 곳간 안에 들어와 3분에 끝난다.
//
// 대신 변동성과 거래대금이 최대 한 달 묵는다. 한 달에 한 번 내는 제안서에서
// 1년 변동성과 60일 평균 거래대금이 한 달 전 값인 것은 실질 차이가 없다 —
// 둘 다 애초에 길게 보는 값이라, 하루이틀 시세로는 소수점이 움직일 뿐이다.
// 그래도 **묵은 것은 묵었다고 적는다**(marketAsOf). 자료가 조용히 낡는 것이
// 이 일에서 제일 나쁘다.
const MKT_TTL_DAYS = 30;
const TODAY = new Date().toISOString().slice(0, 10);
const daysSince = (ymd) => {
  const t = Date.parse(`${ymd}T00:00:00Z`);
  return Number.isFinite(t) ? (Date.parse(`${TODAY}T00:00:00Z`) - t) / 86400000 : Infinity;
};

// 종목 사이에 쉬는 시간. **벽이 속도에 걸려 있는지 통화 수에 걸려 있는지는
// 아직 재 본 적이 없다.** 통화 수라면 이 잠자기는 아무것도 사 주지 않고 662종목
// 기준 13.8분만 태운다. 한 판이면 판정된다 — 줄이고 돌려서 **멈추는 종목 번호가
// 그대로인지** 보면 된다. 그대로면 낭비였고, 앞당겨지면 잠자기가 값을 하고 있었다.
// 그래서 상수로 빼고 끝에 찍는다. 되돌리려면 이 수만 250 으로 올리면 된다.
const GAP_MS = Number(process.env.ETF_GAP_MS || 60);

const cache = (() => {
  try {
    const j = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
    return j && typeof j === 'object' ? j.items || {} : {};
  } catch {
    return {};
  }
})();
console.log(`분배 이력 곳간 ${Object.keys(cache).length}종목`);
let reused = 0;
let refetched = 0;
let mktReused = 0;
let mktRefetched = 0;
console.log(`종목 사이 쉬는 시간 ${GAP_MS}ms · 시세 곳간 ${MKT_TTL_DAYS}일`);

// 예산. 워크플로 한도가 75분이라 55분에서 멈춘다. 거기까지 모은 것은 그대로
// 쓰고, 못 간 종목은 "수집 안 함" 으로 남긴다. 한도에 잘려 아무것도 못 남기는
// 일은 실측기에서 이미 한 번 겪었다.
const BUDGET_MS = 55 * 60 * 1000;
const tStart = Date.now();

// 부르기 실패와 "값이 없음" 을 반드시 갈라 놓는다.
//
// 첫 판에서 이것을 섞어 두었다가 크게 데었다. 61종목을 다섯 갈래로 한꺼번에
// 부르니 서른세 번째쯤부터 원천이 답을 끊었는데, 실패한 응답을 빈 배열로
// 받아 "분배 이력 0개월" 이라고 적었다. RISE 미국30년국채커버드콜처럼 매달
// 꼬박꼬박 분배하는 종목이 "분배한 적 없음" 으로 파일에 남은 것이다.
// 모르는 것을 사실로 적는 것이 이 작업에서 제일 나쁜 고장이다.
//
// 그래서 실패는 null 이 아니라 던진다. 부르는 쪽이 반드시 마주하게 된다.
class ApiError extends Error {}

async function apiOnce(p) {
  const r = await page.evaluate(
    async ({ base, p, headers }) => {
      try {
        const res = await fetch(base + p, { headers, credentials: 'include' });
        return { status: res.status, text: await res.text() };
      } catch (e) {
        return { status: 0, text: String(e).slice(0, 200) };
      }
    },
    { base: BASE, p, headers: HDRS },
  );
  if (r.status !== 200) throw new ApiError(`HTTP ${r.status}`);
  let j;
  try {
    j = JSON.parse(r.text);
  } catch {
    throw new ApiError(`JSON 아님: ${r.text.slice(0, 80)}`);
  }
  // `success` 가 true 가 **아니면** 전부 실패로 친다.
  //
  // 처음에는 `=== false` 만 봤는데, ETFCHECK 은 인증이 끊기면
  // `{"success":-1,"message":"인증에 실패하여 자동으로 로그아웃되었습니다."}`
  // 를 준다. -1 은 false 가 아니므로 그대로 통과했고, results 가 없어
  // 빈 배열이 되어 "값이 없다" 로 둔갑했다. 성공이 아닌 것은 성공이 아니다.
  if (j.success !== true) throw new ApiError(String(j.message || `success=${j.success}`).slice(0, 120));
  return j.results ?? []; // 빈 배열은 "정말로 값이 없다" 는 뜻이다
}

async function api(p, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await apiOnce(p);
    } catch (e) {
      last = e;
      // 끊겼을 때는 쉬었다 다시 묻는다. 그래도 안 되면 화면을 다시 열어
      // 머리글을 새로 얻는다 — 토큰이 시간이 지나 죽는 경우가 있다.
      await sleep(800 * (i + 1));
      if (i === tries - 2) await refreshHeaders();
    }
  }
  throw last;
}

// 상세(getEtpItemOutline)는 더 부르지 않는다.
//
// 그 항목이 주던 값(순자산·상장일·운용사·보수·현재가·기준가·거래대금)이
// 스크리너 한 행에 다 들어 있고, 스크리너는 호출 **한 번**으로 전 종목을
// 준다. 게다가 상세는 장이 닫히면 실시간 시세 항목이 빠져서 제일 자주 말썽을
// 부리던 쪽이었다 — 한때 192종목이 전부 "실패" 로 찍혔는데, 원천이 막은 것이
// 아니라 응답 모양이 장 마감 뒤에 달라졌던 것이다. 그 사정 자체가 사라졌다.
//
// 자산군(ctg_large)도 분류 문자열에서 유도하고(assetClassOf), 기초지수는
// 마스터에 있다. 상세가 홀로 쥐고 있던 값은 이제 없다.

function dumpDiagnostics(extra = {}) {
  const body = { when: new Date().toISOString(), ...extra };
  fs.mkdirSync(DIAG, { recursive: true });
  fs.writeFileSync(path.join(DIAG, 'outline-failures.json'), JSON.stringify(body, null, 2));
  // `discovery/` 는 .gitignore 에 걸려 있어 아티팩트로만 남는다. 아티팩트를
  // 내려받을 수 없는 자리에서도 봐야 하므로 tools/ 밑에도 적고, 로그에도
  // 첫 표본을 찍는다. 진단자료는 볼 수 없으면 없는 것과 같다.
  fs.mkdirSync(DIAG_REPO, { recursive: true });
  fs.writeFileSync(path.join(DIAG_REPO, 'collect-failures.json'), JSON.stringify(body, null, 2));
  console.log('── 진단자료 ──');
  console.log(JSON.stringify(body).slice(0, 3000));
}

async function refreshHeaders() {
  appHeaders = null;
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  if (appHeaders) {
    for (const k of Object.keys(HDRS)) delete HDRS[k];
    for (const [k, v] of Object.entries(appHeaders)) {
      if (!/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k)) {
        HDRS[k] = v;
      }
    }
    console.log('  (머리글을 새로 받았습니다)');
  }
}

const items = [];
const failed = [];
let asOf = null;

let stoppedEarly = null;

// 연속 실패 차단기.
//
// 2026-09 판에서 원천의 성질이 드러났다. 509종목을 돌았는데 **앞 301종목은
// 99% 성공하고, 302번째부터 209종목은 0.5% 성공**했다. 서서히 나빠진 것이
// 아니라 한 지점에서 벽이 섰다 — 한 판에 답해 주는 양이 정해져 있는 것으로
// 보인다.
//
// 바로 밑의 6할 규칙은 이 벽을 못 잡는다. 그것은 **누적** 비율이라서, 앞에서
// 300종목을 깨끗이 모아 두면 뒤가 전부 막혀도 비율이 6할에 닿지 않는다.
// 실제로 이 판에서 한 번도 울리지 않았고, 벽 뒤에서 20분 넘게 재시도만 했다.
//
// 그래서 **연속** 실패를 따로 센다. 서른 번 잇달아 실패하면 그 뒤는 0.5%
// 이므로 더 가 봐야 얻는 것이 없다.
//
// 여기서는 throw 하지 않고 break 한다. 이 차단기가 울리는 판은 앞의 300종목을
// **제대로 모은** 판이다. 그걸 버리면 벽에 부딪힌 벌로 하루치 수집을 날리는
// 셈이 된다. 밑의 두 규칙이 throw 하는 것은 처음부터 막힌 판 — 거기서는
// 버릴 것이 없다.
const MAX_CONSEC_FAIL = 30;
let consecFail = 0;

for (const [i, row] of universe.entries()) {
  const code = row.F16013;
  const name = row.F16002;

  // 예산을 넘겼으면 멈춘다. 모집단이 192종목에서 892종목으로 커졌으니
  // 한도(75분)에 잘려 아무것도 못 남기는 일이 실제로 일어날 수 있다.
  // 모집단은 월배당을 앞에 두고 정렬해 두었으므로, 잘리는 자리는 늘
  // 뒤쪽 — 지금 쓰고 있는 종목은 이미 다 모은 뒤다.
  if (Date.now() - tStart > BUDGET_MS) {
    stoppedEarly = `예산 ${BUDGET_MS / 60000}분을 넘겨 ${i}/${universe.length} 에서 멈췄습니다`;
    console.log(`\n${stoppedEarly}`);
    break;
  }

  process.stdout.write(`[${i + 1}/${universe.length}] ${code} ${name} … `);

  // 한꺼번에 다섯 갈래로 부르지 않는다. 첫 판에서 그렇게 했다가 서른세
  // 번째 종목부터 원천이 답을 끊었다. 차례로, 사이를 띄워서 묻는다.
  //
  // 종목당 다섯 번이다. 예전에는 일곱 번이었는데 상세(getEtpItemOutline)와
  // 보수(getEtpLatestFee)를 뺐다 — 그 둘이 주던 값이 스크리너 한 번에 다
  // 들어 있다. 상세는 장이 닫히면 시세 항목이 빠져서 제일 자주 말썽을
  // 부리던 쪽이기도 했다. 892종목 × 5번이면 33분이다.
  // 곳간에 있고 마지막 분배일이 그대로면 분배 쪽 세 번은 건너뛴다.
  const recDiv = String(row.REC_DIV_DATE || row.DIV_DATE || '');
  const cached = cache[code];
  const cacheOk = Boolean(
    cached && recDiv && cached.recDivDate === recDiv && Array.isArray(cached.hist)
    && cached.v === CACHE_V,
  );
  // 시세 쪽은 분배와 따로 판정한다. 분배가 차가워도 시세는 따뜻할 수 있고, 그
  // 반대도 된다. 둘을 묶으면 한쪽 때문에 다른 쪽까지 다시 받는다.
  const mktCached = cached && cached.mkt;
  const mktOk = Boolean(
    mktCached && mktCached.v === MKT_V && mktCached.at && daysSince(mktCached.at) <= MKT_TTL_DAYS,
  );

  let hist;
  let monthly;
  let navHist;
  let term;
  let divOutline;
  let taxBase;
  try {
    if (cacheOk) {
      // 곳간에서 꺼내 쓴다. 원천을 부르지 않는다.
      divOutline = cached.divOutline || [];
      hist = cached.hist || [];
      monthly = cached.monthly0 ? [cached.monthly0] : [];
      taxBase = cached.taxBase || [];
      reused++;
    } else {
      refetched++;
      // 지급주기를 판정할 원천. 연도별 지급 횟수와 지급한 달 목록을 준다.
      divOutline = await api(`/user/etp/getEtpItemDivOutline?code=${code}`);
      await sleep(GAP_MS);
      // limit 을 36 에서 60 으로 올린다. 최근 12개월 합계를 건수가 아니라 창으로
      // 내게 되면서, 주배당 종목은 한 해에만 오십 건이 넘기 때문이다. 36 이면
      // 그런 종목의 1년치가 잘려 합계가 실제보다 작게 나온다.
      hist = await api(`/user/etp/getEtpItemCashHist?code=${code}&limit=60`);
      await sleep(GAP_MS);
      monthly = await api(`/user/etp/getEtpItemCashMonthly?code=${code}`);
      await sleep(GAP_MS);
      // 과세표준기준가. 분배금 중 **실제로 세금이 붙는 몫**을 여기서 낸다.
      //
      // limit 을 붙이지 않는다. 실측에서 매개변수 없이 부르는 쪽이 제일 많이
      // 준다(437일). limit=400 은 400일, limit=250 은 250일이라 오히려 적다.
      taxBase = await api(`/user/etp/getEtpItemTaxBaseHist?code=${code}`);
      await sleep(GAP_MS);
      // 곳간에는 **쓰는 칸만** 담는다. 응답을 통째로 담으면 892종목에 6MB 가
      // 되어 달마다 그 덩치가 저장소에 커밋되고, 무엇이 달라졌는지도 안 보인다.
      cache[code] = {
        v: CACHE_V,
        recDivDate: recDiv,
        checkedAt: TODAY,
        // 분배가 새로 생겼다고 시세 쪽까지 버리지 않는다. 통째로 덮어쓰면
        // 여기 붙어 있던 mkt 가 조용히 사라져, 곳간을 둔 보람이 없어진다.
        mkt: mktCached || undefined,
        divOutline: (divOutline || []).map((r) => ({ DATE: r.DATE, MONTH: r.MONTH })),
        hist: (hist || []).map((h) => ({ F12506: h.F12506, F31892: h.F31892, DIV_RATE: h.DIV_RATE })),
        monthly0: monthly?.[0]
          ? { DIV_AMT_YEAR: monthly[0].DIV_AMT_YEAR, DIV_RATE_REAL: monthly[0].DIV_RATE_REAL }
          : null,
        // 과표는 평소 큰 음수라 통째로 담으면 곳간이 몇 배로 커진다.
        // 쓰는 것은 **0 이상인 날**뿐이므로(= 분배 기준일의 과세표준액)
        // 그 날만 골라 담는다. 종목당 열 줄 남짓이다.
        taxBase: (taxBase || [])
          .map((r) => ({ d: String(r.TRADE_DATE), v: Number(r.TAX_BASE) }))
          .filter((r) => /^\d{8}$/.test(r.d) && Number.isFinite(r.v) && r.v >= 0),
      };
    }
    if (mktOk) {
      // 시세 곳간이 살아 있다. 두 통을 건너뛴다 — 한 판에서 1,300통이 사라지는
      // 자리가 여기다. 값은 아래에서 곳간에 적어 둔 **결론**으로 대신한다.
      mktReused++;
    } else {
      mktRefetched++;
      navHist = await api(`/user/etp/getSimpleEtpHist?F16013=${code}&limit=250&type=diff`);
      await sleep(GAP_MS);
      term = await api(`/user/etp/getEtpTermHist?F16013=${code}&gubun=1Y`);
    }
  } catch (e) {
    // 여기서 멈추지 않고 다음 종목으로 넘어가되, **이 종목을 채택 목록에
    // 올리지 않는다.** 값이 반쯤 온 종목을 "분배 이력 0개월" 로 적는 일은
    // 다시 하지 않는다.
    console.log(`수집 실패 — 제외 (${String(e.message).slice(0, 60)})`);
    failed.push({ code, name, why: String(e.message).slice(0, 200) });
    consecFail++;
    // 앞에서부터 줄줄이 실패하면 그건 종목 문제가 아니라 원천이 우리를
    // 막았거나 응답 모양이 바뀐 것이다. 192종목을 그대로 다 돌면 재시도만
    // 하다가 한 시간 반이 지나간다(실제로 그랬다). 일찍 멈추고 말한다.
    // 모집단이 892종목으로 커지면서 차단기를 하나 더 둔다. 앞이 **전부**
    // 실패해야만 멈추는 규칙은, 절반쯤 되고 절반쯤 실패하는 판을 못 잡는다.
    // 그런 판이 제일 위험하다 — 파일이 멀쩡해 보이는데 절반이 비어 있다.
    // 쉰 종목을 넘겼는데 실패가 6할이 넘으면 원천이 우리를 막은 것이다.
    if (i >= 50 && failed.length > (i + 1) * 0.6) {
      dumpDiagnostics({ note: `${i + 1}종목 중 ${failed.length}종목이 실패해 멈췄습니다.`, failed: failed.slice(0, 30) });
      throw new Error(
        `${i + 1}종목 중 ${failed.length}종목(${Math.round((failed.length / (i + 1)) * 100)}%)이 실패했습니다.\n` +
          '원천이 막은 것으로 보입니다. data/ 는 그대로 둡니다 — 절반만 든 파일이 ' +
          '멀쩡해 보이는 채로 나가는 것이 제일 나쁩니다.',
      );
    }
    if (failed.length >= 8 && items.every((x) => x.dataComplete === false)) {
      dumpDiagnostics({ note: '앞 8종목이 모두 실패해 일찍 멈췄습니다.', failed });
      throw new Error(
        `앞 ${failed.length}종목이 모두 같은 이유로 실패했습니다: ${String(e.message).slice(0, 120)}\n` +
          '원천이 막았거나 응답 모양이 바뀐 것으로 보입니다. data/ 는 그대로 둡니다.\n' +
          `무엇이 왔는지는 ${DIAG}/outline-failures.json 에 적어 두었습니다.`,
      );
    }
    items.push({
      code,
      name,
      type: isCoveredCall(code) ? '커버드콜' : '일반',
      manager: row.F33961 || null,
      // 수집이 실패한 종목의 주기는 **모른다.** 비워 둔다 — '월배당' 같은
      // 그럴듯한 기본값을 넣으면 그 순간 모르는 것이 사실로 둔갑한다.
      payoutFreq: null,
      payoutCount12m: null,
      adopted: false,
      dataComplete: false,
      excludeReason: `수집 실패(세 번 다시 물었으나 답이 오지 않음: ${String(e.message).slice(0, 80)})`,
    });

    // 벽에 닿았다. 여기서 멈추고, 지금까지 모은 것은 그대로 쓴다.
    if (consecFail >= MAX_CONSEC_FAIL) {
      stoppedEarly =
        `${consecFail}종목이 잇달아 실패해 ${i + 1}/${universe.length} 에서 멈췄습니다. ` +
        '원천이 한 판에 답해 주는 양을 넘긴 것으로 보입니다 — 여기서 더 가도 얻는 것이 없어 ' +
        '남은 시간을 재시도로 태우지 않습니다.';
      console.log(`\n${stoppedEarly}`);
      break;
    }

    await sleep(600);
    continue;
  }

  // 다섯 번을 다 받아 냈다. 연속 실패는 여기서 끊긴다 — 중간에 한 종목이
  // 실패하는 것은 흔한 일이고, 차단기는 **잇달아** 실패할 때만 울려야 한다.
  consecFail = 0;

  // 예전에는 여기서 상세(getEtpItemOutline)를 꺼냈다. 이제 그 값들이 스크리너
  // 한 행에 들어 있으므로 `row` 가 곧 그 자리다. 기초지수(F34777)만 마스터에
  // 있어서 따로 집는다.
  const mr = mastOf.get(code) || {};
  asOf = asOf || String(row.F12506 || mr.F12506 || '');

  const aum = num(row.F15028);

  // 일별 기준가(NAV)와 종가. 변동성과 60일 평균 거래대금을 여기서 낸다.
  //
  // 변동성은 **종가가 아니라 NAV** 로 낸다. 종가는 호가 공백이나 하루치
  // 이상치 하나로 크게 흔들리는데, 그 한 점이 연 변동성을 몇 십 %p 씩
  // 밀어 올려 멀쩡한 종목을 떨어뜨린다. NAV 는 그 펀드가 실제로 담고 있는
  // 값이라 그런 잡음이 적다. 종가 기준 값도 함께 적어 두어 둘이 크게
  // 어긋나면 사람이 볼 수 있게 한다.
  // 곳간에 담는 것은 250일치 시세 **자체**가 아니라 거기서 낸 **결론**이다.
  // 시세를 통째로 담으면 662종목 × 250일이라 곳간이 몇 십 MB 가 되어 달마다
  // 그 덩치가 저장소에 커밋된다. 쓰는 것은 변동성 두 개, 일수, 급변한 날,
  // 거래대금, 최신 하루 — 종목당 열 줄 남짓이다.
  let navVol;
  let pxVol;
  let volDays;
  let jumps;
  let turnover60;
  let day0;
  if (mktOk) {
    ({ navVol, pxVol, volDays, jumps, turnover60, day0 } = mktCached);
    // JSON 에는 undefined 가 없어 없는 칸은 null 로 온다. 아래 판정은 null 을
    // "못 구했다" 로 읽으므로 그대로 두어도 맞다. 다만 jumps 는 배열이어야 한다.
    if (!Array.isArray(jumps)) jumps = [];
  } else {
    const days = (navHist || []).map((d) => ({
      date: String(d.F12506),
      close: num(d.F15001),
      nav: num(d.F15301),
    }));
    const chron = [...days].reverse();
    const navSeries = chron.map((d) => d.nav).filter((x) => x > 0);
    navVol = annualVolatility(navSeries);
    pxVol = annualVolatility(chron.map((d) => d.close).filter((x) => x > 0));
    volDays = navSeries.length;

    // 하루에 ±15% 넘게 움직인 날. 커버드콜 ETF 에서 그런 날은 시장이 아니라
    // 액면분할이나 원천의 오기일 때가 많다. 지우지 않고 세어서 적어 둔다 —
    // 조용히 버리면 무엇을 버렸는지 아무도 모르게 된다.
    jumps = [];
    for (let k = 1; k < chron.length; k++) {
      const a = chron[k - 1].nav;
      const b = chron[k].nav;
      if (a > 0 && b > 0 && Math.abs(Math.log(b / a)) > 0.15) {
        jumps.push({ date: chron[k].date, from: a, to: b });
      }
    }

    // 60일 평균 거래대금. 거래량은 시세 이력(getEtpTermHist)에만 있다.
    const tdays = (term || []).map((d) => ({ close: num(d.F15001), volume: num(d.F15015) }));
    const last60 = tdays.slice(0, 60);
    turnover60 =
      last60.length >= 40
        ? last60.reduce((s, d) => s + (d.close || 0) * (d.volume || 0), 0) / last60.length
        : null;

    day0 = days[0] ? { date: days[0].date, close: days[0].close, nav: days[0].nav } : null;

    cache[code] = cache[code] || {};
    cache[code].mkt = { v: MKT_V, at: TODAY, navVol, pxVol, volDays, jumps, turnover60, day0 };
  }
  const vol = navVol ?? pxVol;
  // 며칠치로 낸 값인지 함께 적는다. limit=250 을 달라고 해도 원천이 몇 개를
  // 주는지는 원천 마음이다. "1년 변동성" 이라고 적으려면 정말 한 해치로
  // 냈는지 말할 수 있어야 한다.
  const volWindow = volDays >= 200 ? '1년' : `${volDays}거래일`;

  // 현재가. 상세(getEtpItemOutline)는 장이 닫히면 시세 항목이 빠져서 기댈 수
  // 없었는데, 이제 아예 부르지 않는다. 스크리너·마스터·일별 시세에는 장이
  // 열려 있든 아니든 값이 있다. 어느 쪽에서 가져왔는지 적어 둔다 — 출처를
  // 모르면 값을 믿을 수 없다.
  let price = num(row.F15001);
  let priceSource = '스크리너 종가(F15001)';
  if (!(price > 0)) {
    price = num(mr.F15001);
    priceSource = '마스터 종가(F15001)';
  }
  if (!(price > 0) && day0 && day0.close > 0) {
    price = day0.close;
    priceSource = `일별 시세 최신 종가 (${day0.date})`;
  }
  if (!(price > 0)) {
    price = null;
    priceSource = null;
  }

  // 분배 내역. 최근 것이 맨 위로 온다.
  const dist = (hist || []).map((h) => ({
    date: String(h.F12506),
    amount: num(h.F31892),
    rate: num(h.DIV_RATE),
  }));
  const last = dist[0] || null;

  // 최근 **12개월** 분배금 합계 ÷ 현재가.
  //
  // 처음에는 "최근 12**회**" 로 냈다. 월배당만 담을 때는 12회가 곧 12개월이라
  // 맞았는데, 분기·연배당까지 담으면 그 순간 거짓이 된다 — 분기배당의 12회는
  // 3년치고 연배당의 12회는 12년치다. 그대로 두면 분기배당 종목의 연 분배율이
  // 실제의 세 배로 찍히고, 그 숫자가 고객 제안서의 "월 얼마" 가 된다.
  //
  // 그래서 횟수가 아니라 **창(窓)** 으로 센다. 기준일이 1년 전 오늘 이후인
  // 분배만 더한다. 주기가 무엇이든 같은 뜻이 된다.
  const ttmDist = dist.filter((d) => /^\d{8}$/.test(d.date) && Number(d.date) >= TTM_FROM);

  // 창이 **실제로 다 채워졌을 때만** 연 분배율을 적는다.
  //
  // 이력 요건을 건수에서 상장 기간으로 바꾸면서 생긴 구멍이다. 상장 여섯 달
  // 된 종목은 창(1년) 안에 분배가 여섯 건뿐인데, 그 여섯 달치 합계를 그대로
  // "연 분배율" 이라 적으면 실제의 절반으로 찍힌다. 예전 규칙("12회를 채운
  // 종목만")이 우연히 막아 주던 것을 새 규칙은 안 막는다. 상장 1년이 안 된
  // 종목은 채택에서도 빠지지만, 값 자체를 비워 두어야 [ETF데이터] 장이나
  // 드롭다운 어디에서도 반쪽짜리 숫자가 연 분배율 행세를 하지 못한다.
  const ttmWindowFull = /^\d{8}$/.test(String(row.F16017 || mr.F16017 || ''))
    ? Number(String(row.F16017 || mr.F16017)) <= TTM_FROM
    : false;

  // 창 안에 한 건도 없어도 연 분배율을 낼 수 없다. 0 으로 적지 않는다 —
  // 0 은 "분배를 안 한다" 는 뜻이 되어 버린다.
  const ttmSum = ttmDist.length && ttmWindowFull ? ttmDist.reduce((s, d) => s + (d.amount || 0), 0) : null;
  const ttmRate = ttmSum && price ? (ttmSum / price) * 100 : null;

  // ── 종목별 과세비율 ────────────────────────────────────────────────
  //
  // 분배금 전액에 15.4% 를 매기는 것은 틀린 셈이다. ETF 분배금의 과세 대상은
  // **과세표준액**이고, 국내주식 매매차익·장내파생 손익은 거기에 안 잡힌다.
  // 그래서 그 재원으로 분배하는 상품은 대부분이 비과세다.
  //
  // 2026-09 실측(tools/etfcheck-discovery/taxbase.json, 8종목 48건)에서
  // getEtpItemTaxBaseHist 의 성격이 드러났다. 이 값은 평소 큰 음수인데
  // **분배 기준일에만 그 분배의 주당 과세표준액**이 0 이상으로 들어온다.
  // 48건 전부 0~분배금 범위 안이었고, 갈리는 폭이 컸다 —
  //   KODEX 200타겟위클리커버드콜 2.6% · TIGER 배당커버드콜액티브 3.5%
  //   ACE 미국30년국채액티브(H) 0% · KODEX 200 95.6%
  //   해외 커버드콜·채권·파킹형 100%
  // 국내주식형 커버드콜에 15.4% 를 다 떼면 세후 수령액을 크게 적게 적는다.
  //
  // 날짜를 정확히 맞추려 들지 않는다. 분배일과 기준일이 하루이틀 어긋나므로,
  // 분배일에서 **뒤로 이레 안**에 있는 0 이상인 날을 찾는다. 평소 값이 큰
  // 음수라 그 창에서 0 이상인 날은 그 분배의 과세표준뿐이다.
  const taxRows = (taxBase || [])
    .map((r) => ({ d: String(r.d ?? r.TRADE_DATE), v: Number(r.v ?? r.TAX_BASE) }))
    .filter((r) => /^\d{8}$/.test(r.d) && Number.isFinite(r.v) && r.v >= 0);
  const dayBefore = (yyyymmdd, days) => {
    const y = Number(yyyymmdd.slice(0, 4));
    const m = Number(yyyymmdd.slice(4, 6)) - 1;
    const dd = Number(yyyymmdd.slice(6, 8));
    const t = new Date(Date.UTC(y, m, dd - days));
    return Number(
      `${t.getUTCFullYear()}${String(t.getUTCMonth() + 1).padStart(2, '0')}${String(t.getUTCDate()).padStart(2, '0')}`,
    );
  };
  let taxedSum = 0;
  let taxMatched = 0;
  for (const d of ttmDist) {
    const lo = dayBefore(d.date, 7);
    const hi = Number(d.date);
    // 창 안에서 분배일에 가장 가까운 것을 고른다.
    const hit = taxRows
      .filter((r) => Number(r.d) >= lo && Number(r.d) <= hi)
      .sort((a, b) => Number(b.d) - Number(a.d))[0];
    if (!hit) continue;
    taxMatched++;
    // 과세표준이 분배금을 넘을 수는 없다. 넘으면 우리가 짝을 잘못 지은 것이니
    // 분배금까지만 센다 — 세금을 실제보다 적게 적는 쪽으로 기울지 않는다.
    taxedSum += Math.min(hit.v, d.amount || 0);
  }
  // 창 안 분배의 **일곱 할 이상**을 짝지었을 때만 쓴다. 몇 건만 맞춰 놓고
  // 전체 비율이라 우기면, 비과세 재원이 큰 종목일수록 크게 틀린다.
  // 못 내면 null 로 두고, 문서는 100% 과세(지금까지의 셈)로 되돌아간다.
  const taxableRatio =
    ttmSum && ttmDist.length && taxMatched >= Math.ceil(ttmDist.length * 0.7)
      ? Math.min(1, Math.max(0, taxedSum / ttmSum))
      : null;

  const mo = (monthly || [])[0] || {};
  const theirSum = num(mo.DIV_AMT_YEAR);
  const theirRate = num(mo.DIV_RATE_REAL);

  const listed = String(row.F16017 || mr.F16017 || '');
  const months = dist.length;

  // 지급주기. 분류가 아니라 실제 지급한 달로 판정한다(위 classifyPayout 참고).
  const paidMonths = payoutMonths12m(divOutline);
  const payoutCount12m = paidMonths.length;
  const payoutFreq = classifyPayout(payoutCount12m, listed, paidMonths);

  // 상장한 지 몇 달 됐나. 예전에는 "분배 이력 n개월" 을 분배 **건수**로 셌다.
  // 월배당만 담을 때는 건수가 곧 개월수였지만, 분기배당 종목은 2년을 꼬박
  // 분배해도 건수가 8이라 "이력 8개월" 로 적히고 걸러졌다. 이력의 길이는
  // 건수가 아니라 상장 기간으로 본다.
  const monthsListed = /^\d{8}$/.test(listed)
    ? (CUR_Y - Number(listed.slice(0, 4))) * 12 + (CUR_M - Number(listed.slice(4, 6)))
    : null;

  // 제외 사유는 하나만 적지 않는다. "순자산이 작아서" 만 보여 주면 고치고
  // 나서도 다른 이유로 또 걸린다.
  const why = [];
  if (!price) why.push('현재가를 마스터·상세·일별시세 어디에서도 못 찾음');
  if (aum === null) why.push('순자산 미확인');
  else if (aum < RULES.minAum) why.push(`순자산 ${(aum / 1e8).toFixed(0)}억(기준 ${RULES.minAum / 1e8}억 미만)`);
  if (turnover60 === null) why.push('거래대금 미확인');
  else if (turnover60 < RULES.minTurnover)
    why.push(`60일 거래대금 ${(turnover60 / 1e8).toFixed(1)}억(기준 ${RULES.minTurnover / 1e8}억 미만)`);
  if (vol === null) why.push(`변동성 산출 불가(시세 ${volDays}일치뿐)`);
  else if (vol > RULES.maxVol)
    why.push(`변동성 ${vol.toFixed(1)}%(${volWindow} 기준, 기준 ${RULES.maxVol}% 초과)`);
  if (monthsListed === null) why.push('상장일 미확인');
  else if (monthsListed < RULES.minTrackMonths)
    why.push(`상장 ${monthsListed}개월(기준 ${RULES.minTrackMonths}개월 미만)`);
  if (payoutCount12m === 0) why.push('최근 12개월 분배 없음');
  if (ttmRate === null) {
    why.push(
      ttmWindowFull
        ? '연 분배율 산출 불가(최근 12개월 분배 기록 없음)'
        : '연 분배율 산출 불가(상장 1년 미만 — 12개월 창이 안 채워짐)',
    );
  }

  // 우리 계산과 ETFCHECK 값을 맞춰 본다. 어긋나면 어느 쪽이 맞는지 모르는
  // 것이므로 제안서에 올리지 않는다.
  //
  // 다만 **월·주배당에만** 제외 사유로 건다. ETFCHECK 의 DIV_RATE_REAL 이
  // 어떤 창으로 낸 값인지는 우리가 관찰로 확인하지 못했다 — 월배당에서는
  // 최근 12회와 최근 12개월이 같은 값이라 둘 중 어느 쪽이어도 맞아떨어져서,
  // 이 대조가 통과한 것이 "같은 기준" 이라는 증거가 되지 못한다. 분기·연배당은
  // 두 기준이 크게 갈리므로, 기준이 다른 값끼리 견주어 멀쩡한 종목을 떨어뜨릴
  // 수 있다. 그래서 차이는 반드시 적어 두되(사람이 볼 수 있게) 제외는 하지
  // 않는다. 모르는 것을 근거로 버리는 것도 모르는 것을 사실로 적는 것만큼 나쁘다.
  let mismatch = null;
  if (ttmRate !== null && theirRate !== null && Math.abs(ttmRate - theirRate) > 0.15) {
    mismatch = `연분배율 계산 ${ttmRate.toFixed(4)}% vs ETFCHECK ${theirRate.toFixed(4)}%`;
    if (payoutFreq === '월배당' || payoutFreq === '주배당') why.push(`분배율 대조 불일치(${mismatch})`);
  }

  items.push({
    code,
    name,
    // 유형은 '커버드콜/일반' 이다. 예전에는 '커버드콜/월배당' 이었는데, 모집단이
    // 월배당뿐일 때만 말이 되는 이름이었다. 분기·연배당까지 담으면 지급주기를
    // 유형 칸에 적는 꼴이 되어 두 가지를 뒤섞는다. 주기는 payoutFreq 에 따로 적는다.
    type: isCoveredCall(code) ? '커버드콜' : '일반',
    // 자산군(주식·채권·리츠·단기자금…). 월배당 전체로 넓히면서 파킹형
    // (CD금리·KOFR)까지 들어왔는데, 그것들은 월마다 돈이 나오기는 해도
    // 월지급 제안서의 주인공이 아니다. 가려 볼 수 있게 적어 둔다.
    assetClass: assetClassOf(code).name,
    assetClassCode: assetClassOf(code).code,
    manager: row.F33961 || mr.F33961 || null,
    index: mr.F34777 || null,
    listedOn: listed,
    price,
    priceSource,
    nav: num(row.F15301) ?? (day0 ? day0.nav : null),
    aum,
    turnoverDay: num(row.F15023),
    turnover60: turnover60 === null ? null : Math.round(turnover60),
    // 총보수는 스크리너의 F34763 을 쓴다. 예전에는 종목마다 getEtpLatestFee 를
    // 불러 TOTAL_FEE 를 받았는데, 892종목에 호출 한 번씩 더 붙일 값이 아니다.
    // TER(실부담비용)은 그 호출에만 있던 값이라 더는 담지 않는다 — 없는 것을
    // 있는 척 채우느니 비워 둔다.
    expenseRatio: num(row.F34763),
    ter: null,
    volatility: vol === null ? null : Number(vol.toFixed(2)),
    volatilityNav: navVol === null ? null : Number(navVol.toFixed(2)),
    volatilityPrice: pxVol === null ? null : Number(pxVol.toFixed(2)),
    volatilityDays: volDays,
    volatilityWindow: volWindow,
    priceJumps: jumps,
    // 변동성·거래대금을 **언제 받은 시세로** 냈나. 곳간에서 꺼내 쓰면 오늘이
    // 아니다. 값만 적고 날짜를 안 적으면 묵은 자료가 새 자료인 척한다.
    marketAsOf: mktOk ? mktCached.at : TODAY,
    distMonthlyRate: last?.rate ?? null,
    distMonthlyAmount: last?.amount ?? null,
    lastDistDate: last?.date ?? null,
    // 종목별 과세비율. null 이면 판단이 안 서는 것이므로 문서는 100% 과세로
    // 되돌아간다 — 세금을 적게 적는 쪽으로 기울지 않는다.
    taxableRatio: taxableRatio === null ? null : Number(taxableRatio.toFixed(4)),
    taxableMatched: taxMatched,
    taxableOf: ttmDist.length,
    distTtmSum: ttmSum,
    distTtmRate: ttmRate === null ? null : Number(ttmRate.toFixed(4)),
    distTtmCount: ttmDist.length, // 창 안에서 실제로 더한 건수
    distTtmFrom: String(TTM_FROM), // 창의 시작일. 값의 뜻을 나중에 되짚을 수 있어야 한다
    distTtmRateSource: theirRate,
    distTtmSumSource: theirSum,
    distTtmMismatch: mismatch, // 대조가 어긋났으면 그대로 남긴다(월·주배당만 제외 사유)
    payoutFreq,
    payoutCount12m,
    payoutMonths12m: paidMonths,
    monthsListed,
    distMonths: months,
    dataComplete: true,
    adopted: why.length === 0,
    excludeReason: why.length ? why.join(', ') : null,
    sourceUrl: `${BASE}/mobile/etpitem/${code}/basic`,
  });
  console.log(why.length ? `제외 (${why[0]})` : '채택');
  await sleep(150);
}

// 지난 판보다 채택이 뚝 떨어졌으면 덮어쓰지 않는다.
//
// 채택이 0 이 되는 고장은 눈에 띄지만, 22에서 11로 반토막 나는 고장은
// 안 띈다 — 파일은 멀쩡해 보이고 검사도 통과한다. 실제로 그렇게 한 판이
// 나갔다(상세가 200 으로 오되 현재가가 빈 채로 온 종목이 절반이었다).
// 시장이 변해 정말로 줄어든 것일 수도 있으므로 막되, 넘길 길을 남긴다.
const prev = (() => {
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8'));
  } catch {
    return null;
  }
})();
const adopted = items.filter((x) => x.adopted);

// 새로 담기로 한 값이 **실제로 담겼는지** 본다.
//
// 과세비율을 넣고 수집이 '성공' 으로 끝났는데 661종목 중 3종목만 값이 있었다.
// 곳간이 옛 판이라 새 호출을 통째로 건너뛴 것인데, 아무 데도 티가 안 났다.
// 수를 세어 말하지 않으면 다음에도 조용히 지나간다.
{
  const ok = adopted.filter((x) => x.taxableRatio !== null && x.taxableRatio !== undefined).length;
  const ratio = adopted.length ? ok / adopted.length : 0;
  console.log(`\n과세비율을 구한 채택 종목: ${ok}/${adopted.length} (${Math.round(ratio * 100)}%)`);
  if (adopted.length >= 20 && ratio < 0.5) {
    dumpDiagnostics({
      note: `채택 ${adopted.length}종목 중 ${ok}종목만 과세비율이 나왔습니다.`,
      failedCount: failed.length,
    });
    throw new Error(
      `채택 ${adopted.length}종목 중 과세비율이 나온 것이 ${ok}종목뿐입니다.\n` +
        '과세표준을 못 받았거나 곳간이 옛 판이라 새 호출을 건너뛴 것입니다. ' +
        '이대로 내보내면 세후 금액이 전부 전액 과세로 찍히므로 data/ 를 덮어쓰지 않습니다.',
    );
  }
}

if (prev?.adoptedCount >= 5 && adopted.length < prev.adoptedCount * 0.6 && !process.env.CC_ETF_ALLOW_DROP) {
  fs.mkdirSync(DIAG, { recursive: true });
  fs.writeFileSync(path.join(DIAG, 'items.json'), JSON.stringify(items, null, 2));
  dumpDiagnostics({ note: '채택이 크게 줄어 덮어쓰지 않았습니다.', failedCount: failed.length });
  throw new Error(
    `채택이 ${prev.adoptedCount}종목에서 ${adopted.length}종목으로 줄었습니다. ` +
      '수집이 반쯤 어긋났을 때 나오는 모양이라 data/ 를 덮어쓰지 않습니다. ' +
      'discovery/cc-etf/items.json 을 보고, 정말 줄어든 것이 맞으면 ' +
      'CC_ETF_ALLOW_DROP=1 로 다시 돌리십시오.',
  );
}
if (!adopted.length) {
  fs.mkdirSync(DIAG, { recursive: true });
  fs.writeFileSync(path.join(DIAG, 'items.json'), JSON.stringify(items, null, 2));
  throw new Error('채택된 종목이 0건입니다. 기준이 너무 좁거나 수집이 어긋났습니다. data/ 는 그대로 둡니다.');
}

const out = {
  source: 'ETFCHECK (https://www.etfcheck.co.kr)',
  sourceNote:
    '국내 상장 ETF 중 순자산 300억 이상이거나 ETFCHECK 분류가 월배당(0609002) 인 종목. ' +
    '상품명이 아니라 분류와 수치로 고른다. 커버드콜(0609005) 인지 아닌지는 항목마다 type 에 ' +
    '적는다. 처음에는 커버드콜만, 다음에는 월배당만 담았는데 — 분기배당·연배당도 고를 수 ' +
    '있어야 하고 ETFCHECK 분류에는 그 둘이 없어서, 월배당이 아닌 종목까지 담아 실제 지급한 ' +
    '달로 주기를 판정한다. 어디서 끊을지는 재서 정했다: 거래대금을 관문에 넣으면 순자산 ' +
    '2,239억짜리가 그날 거래가 한산했다는 이유로 잘리고, 월배당 분류를 빼면 순자산이 작은 ' +
    '월배당 종목을 잃는다. 이 관문은 지금 고를 수 있던 종목을 하나도 잃지 않는다.',
  collectedAt: new Date().toISOString(),
  asOf: asOf ? `${asOf.slice(0, 4)}-${asOf.slice(4, 6)}-${asOf.slice(6, 8)}` : null,
  rules: RULES,
  derived: {
    price: '스크리너의 종가를 먼저 쓰고, 없으면 마스터, 그래도 없으면 일별 시세의 최신 종가를 쓴다. 어느 쪽인지는 항목마다 priceSource 에 적는다.',
    distTtmRate:
      '기준일이 **1년 전 오늘 이후**인 분배금의 합계 ÷ 현재가 × 100. 창의 시작일은 항목마다 ' +
      'distTtmFrom 에, 더한 건수는 distTtmCount 에 적는다. 예전에는 "최근 12회" 로 냈는데, ' +
      '월배당만 담을 때는 12회가 곧 12개월이라 맞았지만 분기배당의 12회는 3년치, 연배당의 ' +
      '12회는 12년치라 주기를 넓히는 순간 거짓이 된다. ETFCHECK 의 DIV_RATE_REAL 과 대조한 ' +
      '차이는 distTtmMismatch 에 남기되, 제외 사유로 거는 것은 월·주배당뿐이다 — 그쪽 값이 ' +
      '어떤 창으로 낸 것인지 관찰로 확인하지 못했고, 기준이 다른 값끼리 견주어 멀쩡한 종목을 ' +
      '떨어뜨릴 수는 없다.',
    payoutFreq:
      '최근 12개월 동안 분배한 **달 수**로 판정한다(getEtpItemDivOutline 의 연도별 MONTH 목록). ' +
      '20회 이상 주배당 · 10~13회 월배당 · 3~6회 분기배당 · 1~2회 연배당 · 7~9회 비정기 · 0회 무분배. ' +
      'ETFCHECK 분류에는 분기배당·연배당이 없어서(0609 계열은 고배당/월배당/주배당/리츠/커버드콜/MLP) ' +
      '분류로는 고를 수 없다. 상장한 지 1년이 안 된 종목은 판정하지 않고 "판정 불가(상장 1년 미만)" 로 ' +
      '적는다 — 여섯 달에 두 번 준 것을 분기배당이라 부르면 거짓이다.',
    volatility:
      '일간 기준가(NAV) 로그수익률의 표본표준편차 × √252 × 100. 몇 거래일치로 냈는지는 ' +
      'volatilityDays 에 적는다 — 250일을 달라고 해도 원천이 몇 개를 주는지는 원천 마음이므로, ' +
      '"1년" 이라고 말하려면 정말 한 해치였는지 확인할 수 있어야 한다. 종가 기준 값은 volatilityPrice.',
    turnover60: '최근 60거래일 (종가 × 거래량) 의 평균.',
    marketAsOf:
      `변동성·거래대금·급변일을 낸 시세를 받은 날. 이 셋은 ${MKT_TTL_DAYS}일짜리 곳간에 두므로 ` +
      '기준일(asOf)보다 앞설 수 있다. 둘 다 길게 보는 값이라 며칠 차이로는 거의 안 움직이지만, ' +
      '몇 시점 자료인지는 말할 수 있어야 한다. 현재가·순자산은 곳간을 안 거치고 매번 새로 받으므로 늘 기준일 자료다.',
    priceJumps: '하루에 ±15% 넘게 움직인 날. 커버드콜 ETF 에서는 시장보다 액면분할이나 원천 오기일 때가 많다. 지우지 않고 세어서 남긴다.',
  },
  universe: universe.length,
  universeRule: `순자산 ${MIN_UNIVERSE_AUM / 1e8}억 이상 ∨ 월배당 분류(0609002). 국내 상장 ${scr.size}종목 중 ${universe.length}종목.`,
  // 예산에 걸려 중간에 멈췄으면 그 사실을 적는다. 모집단 892 중 600 만 담고도
  // 파일이 멀쩡해 보이면 아무도 못 알아챈다.
  stoppedEarly,
  collected: items.length,
  adoptedCount: adopted.length,
  items,
  failed,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

// 곳간을 남긴다. 이번에 새로 받은 종목이 다음 달에는 호출 없이 쓰인다.
//
// 이번 판에서 예산에 걸려 못 간 종목은 곳간에도 없으므로, 다음 달에는 그만큼
// 남는 시간이 그쪽으로 간다. 달을 거듭할수록 앞쪽이 싸지고 뒤쪽이 채워진다.
fs.writeFileSync(
  CACHE,
  JSON.stringify(
    {
      note:
        '분배 쪽 세 호출(개요·이력·월별)의 응답을 그대로 담아 둔다. 스크리너가 주는 ' +
        '마지막 분배일(REC_DIV_DATE)이 그대로면 새 분배가 없었다는 뜻이므로 다시 묻지 않는다. ' +
        '연 분배율은 여기서 꺼내 쓰지 않고 매번 이번 달 창으로 다시 계산한다 — 창이 달마다 움직이기 때문이다. ' +
        `mkt 는 시세 두 호출(일별 시세·거래량)에서 낸 결론(변동성·거래대금·급변일)이다. ${MKT_TTL_DAYS}일이 지나면 다시 받는다. ` +
        '시세 원자료를 그대로 담지 않는 것은 곳간이 몇 십 MB 로 불어나기 때문이고, 판 번호를 분배 쪽과 따로 둔 것은 ' +
        '한쪽이 바뀌었다고 다른 쪽까지 버리지 않기 위해서다.',
      updatedAt: new Date().toISOString(),
      count: Object.keys(cache).length,
      items: cache,
    },
    null,
    2,
  ) + '\n',
);
console.log(`곳간 ${Object.keys(cache).length}종목 (분배: 재사용 ${reused} · 새로 받음 ${refetched})`);
console.log(`시세 곳간 (재사용 ${mktReused} · 새로 받음 ${mktRefetched}) — 아낀 통화 ${mktReused * 2}통`);
{
  // 곳간에서 꺼내 쓴 시세가 며칠 묵었나. 유효기간을 늘렸으니 이 줄을 보고
  // 판단할 수 있어야 한다 — "묵어도 된다" 와 "얼마나 묵었는지 모른다" 는 다르다.
  const asOfs = items.map((x) => x.marketAsOf).filter(Boolean).sort();
  if (asOfs.length) {
    const oldest = asOfs[0];
    const age = Math.round(daysSince(oldest));
    console.log(`시세 기준일 ${oldest} ~ ${asOfs[asOfs.length - 1]} (가장 묵은 것 ${age}일, 유효기간 ${MKT_TTL_DAYS}일)`);
  }
}

// 벽이 통화 수에 걸리는지 속도에 걸리는지를 판정할 자리다. 이 세 줄을 판마다
// 견주면 된다: 쉬는 시간을 줄였는데 **멈춘 자리가 그대로**면 잠자기는 값을
// 안 하고 있었다는 뜻이고, 앞당겨졌다면 잠자기가 벽을 늦추고 있었다는 뜻이다.
const calls = refetched * 4 + mktRefetched * 2;
console.log(
  `원천 호출 약 ${calls}통 (분배 ${refetched}종목 × 4 + 시세 ${mktRefetched}종목 × 2) · ` +
    `쉬는 시간 ${GAP_MS}ms · 멈춘 자리 ${stoppedEarly ? `${items.length}/${universe.length}` : '없음(완주)'}`,
);

console.log(
  `\n${OUT} 에 적었습니다 — 모집단 ${universe.length}, 수집 ${items.length}, ` +
    `채택 ${adopted.length}, 제외 ${items.length - adopted.length}, 실패 ${failed.length}` +
    (stoppedEarly ? `\n※ ${stoppedEarly}` : ''),
);
const freqTally = {};
for (const x of items) freqTally[x.payoutFreq || '(모름)'] = (freqTally[x.payoutFreq || '(모름)'] || 0) + 1;
console.log('지급주기별: ' + Object.entries(freqTally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
await browser.close();
