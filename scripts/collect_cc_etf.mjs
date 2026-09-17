// 국내 상장 월배당 ETF 를 ETFCHECK 에서 받아 `data/cc_etf.json` 에 적는다.
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
// 모집단은 이름이 아니라 **분류**로 고른다. getEtpCtgMap 에서 국내 상장이고
// 월배당(0609002) 인 종목 전부. 이름으로 거른 결과와 어긋나지 않는 것을
// 확인했고(관찰 5차), 분류 쪽이 오래간다 — 상품명은 운용사가 언제든 바꾼다.
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
function classifyPayout(n, listedOn) {
  const s = String(listedOn || '');
  if (/^\d{8}$/.test(s)) {
    const monthsListed = (CUR_Y - Number(s.slice(0, 4))) * 12 + (CUR_M - Number(s.slice(4, 6)));
    if (monthsListed < 12) return '판정 불가(상장 1년 미만)';
  }
  if (n === 0) return '무분배';
  if (n >= 20) return '주배당';
  if (n >= 10) return '월배당';
  if (n >= 3 && n <= 6) return '분기배당';
  if (n <= 2) return '연배당';
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
  if (!/getEtpMast|getEtpCtgMap/.test(url)) return;
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

// 모집단은 **국내 상장 월배당 ETF 전부**(분류 0609002)다. 처음에는 커버드콜
// (0609005)까지 겹쳐야만 담았는데, 그러면 리츠·인프라·배당주·채권형처럼
// 월배당을 꼬박꼬박 주는 종목이 통째로 빠진다. 월 지급을 원하는 고객에게
// 커버드콜만 보여 줄 이유가 없다. 커버드콜인지 아닌지는 `type` 에 적어
// 두었으니 [ETF데이터] 장에서 가려 볼 수 있다.
const ctgOf = new Map(ctgMap.filter((r) => r.F16013).map((r) => [r.F16013, String(r.ctgInfo || '')]));
const picked = new Set(
  ctgMap
    .filter((r) => r.F16013 && r.domestic_flag === 1 && String(r.ctgInfo || '').includes('0609002'))
    .map((r) => r.F16013),
);
const universe = mast.filter((r) => picked.has(r.F16013));
const isCoveredCall = (code) => (ctgOf.get(code) || '').includes('0609005');
console.log(
  `모집단 ${universe.length}종목 (마스터 ${mast.length}행) — ` +
    `커버드콜 ${universe.filter((r) => isCoveredCall(r.F16013)).length}, ` +
    `그 외 월배당 ${universe.filter((r) => !isCoveredCall(r.F16013)).length}`,
);
if (universe.length < 10) {
  throw new Error(`모집단이 ${universe.length}종목뿐입니다. 분류 코드가 바뀌었는지 확인하십시오.`);
}

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

// 상세(getEtpItemOutline)는 **한 행이 오기만 하면** 받은 것으로 친다.
//
// 처음에는 현재가(F15001)가 들어 있어야 성공으로 쳤다. 그랬더니 192종목이
// 전부 실패했는데, 까 보니 원천이 막은 것이 아니라 **응답 모양이 달랐다**.
// 29개 키가 멀쩡히 오는데(순자산·상장일·운용사·기초지수·보수·52주 고저·
// 60일 평균 거래대금) 실시간 시세 항목만 빠져 있었다. 성공한 판은 전부
// 장중(KST 11:35~13:07)이었고 실패한 판은 장 마감 뒤(16:28, 04:55)였다.
//
// 그래서 현재가를 상세에서 구하지 않는다. 마스터와 일별 시세에는 장이
// 열려 있든 아니든 값이 있다. 어느 쪽에서 가져왔는지는 priceSource 에
// 적어 둔다 — 값의 출처를 모르면 값을 믿을 수 없다.
const outlineSamples = [];

async function apiOutline(code, tries = 3) {
  let last = '빈 응답';
  for (let i = 0; i < tries; i++) {
    const rows = await api(`/user/etp/getEtpItemOutline?code=${code}&befDate=${new Date().getFullYear() - 1}0101`);
    const o = rows?.[0];
    if (o && Object.keys(o).length >= 5) return o;
    last = o ? `키 ${Object.keys(o).length}개뿐` : '빈 응답';
    if (outlineSamples.length < 5) outlineSamples.push({ code, try: i, keys: o ? Object.keys(o) : [], row: o ?? rows });
    await sleep(1500 * (i + 1));
    if (i === tries - 2) await refreshHeaders();
  }
  throw new ApiError(`상세가 비어 있습니다 (${last})`);
}

function dumpDiagnostics(extra = {}) {
  const body = { when: new Date().toISOString(), samples: outlineSamples, ...extra };
  fs.mkdirSync(DIAG, { recursive: true });
  fs.writeFileSync(path.join(DIAG, 'outline-failures.json'), JSON.stringify(body, null, 2));
  // `discovery/` 는 .gitignore 에 걸려 있어 아티팩트로만 남는다. 아티팩트를
  // 내려받을 수 없는 자리에서도 봐야 하므로 tools/ 밑에도 적고, 로그에도
  // 첫 표본을 찍는다. 진단자료는 볼 수 없으면 없는 것과 같다.
  fs.mkdirSync(DIAG_REPO, { recursive: true });
  fs.writeFileSync(path.join(DIAG_REPO, 'collect-failures.json'), JSON.stringify(body, null, 2));
  if (outlineSamples.length) {
    console.log('── 값이 안 든 상세 응답 표본 ──');
    console.log(JSON.stringify(outlineSamples[0]).slice(0, 3000));
  }
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

for (const [i, row] of universe.entries()) {
  const code = row.F16013;
  const name = row.F16002;
  process.stdout.write(`[${i + 1}/${universe.length}] ${code} ${name} … `);

  // 한꺼번에 다섯 갈래로 부르지 않는다. 첫 판에서 그렇게 했다가 서른세
  // 번째 종목부터 원천이 답을 끊었다. 차례로, 사이를 띄워서 묻는다.
  // 61종목 × 5번이면 2분 남짓이다 — 한 달에 한 번 도는 일에 그 정도는 싸다.
  let outline;
  let hist;
  let monthly;
  let fee;
  let navHist;
  let term;
  let divOutline;
  try {
    outline = await apiOutline(code);
    await sleep(250);
    // 지급주기를 판정할 원천. 연도별 지급 횟수와 지급한 달 목록을 준다.
    divOutline = await api(`/user/etp/getEtpItemDivOutline?code=${code}`);
    await sleep(250);
    // limit 을 36 에서 60 으로 올린다. 최근 12개월 합계를 건수가 아니라 창으로
    // 내게 되면서, 주배당 종목은 한 해에만 오십 건이 넘기 때문이다. 36 이면
    // 그런 종목의 1년치가 잘려 합계가 실제보다 작게 나온다.
    hist = await api(`/user/etp/getEtpItemCashHist?code=${code}&limit=60`);
    await sleep(250);
    monthly = await api(`/user/etp/getEtpItemCashMonthly?code=${code}`);
    await sleep(250);
    fee = await api(`/user/etp/getEtpLatestFee?code=${code}`);
    await sleep(250);
    navHist = await api(`/user/etp/getSimpleEtpHist?F16013=${code}&limit=250&type=diff`);
    await sleep(250);
    term = await api(`/user/etp/getEtpTermHist?F16013=${code}&gubun=1Y`);
  } catch (e) {
    // 여기서 멈추지 않고 다음 종목으로 넘어가되, **이 종목을 채택 목록에
    // 올리지 않는다.** 값이 반쯤 온 종목을 "분배 이력 0개월" 로 적는 일은
    // 다시 하지 않는다.
    console.log(`수집 실패 — 제외 (${String(e.message).slice(0, 60)})`);
    failed.push({ code, name, why: String(e.message).slice(0, 200) });
    // 앞에서부터 줄줄이 실패하면 그건 종목 문제가 아니라 원천이 우리를
    // 막았거나 응답 모양이 바뀐 것이다. 192종목을 그대로 다 돌면 재시도만
    // 하다가 한 시간 반이 지나간다(실제로 그랬다). 일찍 멈추고 말한다.
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
    await sleep(600);
    continue;
  }

  const o = outline;
  asOf = asOf || String(o.F12506 || row.F12506 || '');

  const aum = num(o.F15028);

  // 일별 기준가(NAV)와 종가. 변동성과 60일 평균 거래대금을 여기서 낸다.
  //
  // 변동성은 **종가가 아니라 NAV** 로 낸다. 종가는 호가 공백이나 하루치
  // 이상치 하나로 크게 흔들리는데, 그 한 점이 연 변동성을 몇 십 %p 씩
  // 밀어 올려 멀쩡한 종목을 떨어뜨린다. NAV 는 그 펀드가 실제로 담고 있는
  // 값이라 그런 잡음이 적다. 종가 기준 값도 함께 적어 두어 둘이 크게
  // 어긋나면 사람이 볼 수 있게 한다.
  const days = (navHist || []).map((d) => ({
    date: String(d.F12506),
    close: num(d.F15001),
    nav: num(d.F15301),
    units: num(d.F16500), // 상장좌수
  }));
  const chron = [...days].reverse();
  const navSeries = chron.map((d) => d.nav).filter((x) => x > 0);
  const navVol = annualVolatility(navSeries);
  const pxVol = annualVolatility(chron.map((d) => d.close).filter((x) => x > 0));
  const vol = navVol ?? pxVol;
  // 며칠치로 낸 값인지 함께 적는다. limit=250 을 달라고 해도 원천이 몇 개를
  // 주는지는 원천 마음이다. "1년 변동성" 이라고 적으려면 정말 한 해치로
  // 냈는지 말할 수 있어야 한다.
  const volDays = navSeries.length;
  const volWindow = volDays >= 200 ? '1년' : `${volDays}거래일`;

  // 현재가. 상세(getEtpItemOutline)에는 장이 닫히면 시세 항목이 빠지므로
  // 거기서 구하지 않는다. 마스터와 일별 시세에는 언제나 값이 있다.
  // 어느 쪽에서 가져왔는지 적어 둔다 — 출처를 모르면 값을 믿을 수 없다.
  let price = num(row.F15001);
  let priceSource = '마스터 종가(F15001)';
  if (!(price > 0)) {
    price = num(o.F15001);
    priceSource = '상세 종가(F15001)';
  }
  if (!(price > 0) && days[0]) {
    price = days[0].close;
    priceSource = `일별 시세 최신 종가 (${days[0].date})`;
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
  const ttmWindowFull = /^\d{8}$/.test(String(o.F16017 || row.F16017 || ''))
    ? Number(String(o.F16017 || row.F16017)) <= TTM_FROM
    : false;

  // 창 안에 한 건도 없어도 연 분배율을 낼 수 없다. 0 으로 적지 않는다 —
  // 0 은 "분배를 안 한다" 는 뜻이 되어 버린다.
  const ttmSum = ttmDist.length && ttmWindowFull ? ttmDist.reduce((s, d) => s + (d.amount || 0), 0) : null;
  const ttmRate = ttmSum && price ? (ttmSum / price) * 100 : null;

  const mo = (monthly || [])[0] || {};
  const theirSum = num(mo.DIV_AMT_YEAR);
  const theirRate = num(mo.DIV_RATE_REAL);

  // 하루에 ±15% 넘게 움직인 날. 커버드콜 ETF 에서 그런 날은 시장이 아니라
  // 액면분할이나 원천의 오기일 때가 많다. 지우지 않고 세어서 적어 둔다 —
  // 조용히 버리면 무엇을 버렸는지 아무도 모르게 된다.
  const jumps = [];
  for (let i = 1; i < chron.length; i++) {
    const a = chron[i - 1].nav;
    const b = chron[i].nav;
    if (a > 0 && b > 0 && Math.abs(Math.log(b / a)) > 0.15) {
      jumps.push({ date: chron[i].date, from: a, to: b });
    }
  }

  // 60일 평균 거래대금. 거래량은 시세 이력(getEtpTermHist)에만 있다.
  const tdays = (term || []).map((d) => ({ close: num(d.F15001), volume: num(d.F15015) }));
  const last60 = tdays.slice(0, 60);
  const turnover60 =
    last60.length >= 40
      ? last60.reduce((s, d) => s + (d.close || 0) * (d.volume || 0), 0) / last60.length
      : null;

  const listed = String(o.F16017 || row.F16017 || '');
  const months = dist.length;

  // 지급주기. 분류가 아니라 실제 지급한 달로 판정한다(위 classifyPayout 참고).
  const paidMonths = payoutMonths12m(divOutline);
  const payoutCount12m = paidMonths.length;
  const payoutFreq = classifyPayout(payoutCount12m, listed);

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
    assetClass: o.ctg_large_name || null,
    assetClassCode: o.ctg_large_code || null,
    manager: o.F33961 || row.F33961 || null,
    index: o.F34777 || null,
    listedOn: listed,
    price,
    priceSource,
    nav: num(o.F15301) ?? (days[0] ? days[0].nav : null),
    aum,
    turnoverDay: num(o.F15023),
    turnover60: turnover60 === null ? null : Math.round(turnover60),
    expenseRatio: num(fee?.[0]?.TOTAL_FEE) ?? num(o.F34763),
    ter: num(fee?.[0]?.TER),
    volatility: vol === null ? null : Number(vol.toFixed(2)),
    volatilityNav: navVol === null ? null : Number(navVol.toFixed(2)),
    volatilityPrice: pxVol === null ? null : Number(pxVol.toFixed(2)),
    volatilityDays: volDays,
    volatilityWindow: volWindow,
    priceJumps: jumps,
    distMonthlyRate: last?.rate ?? null,
    distMonthlyAmount: last?.amount ?? null,
    lastDistDate: last?.date ?? null,
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
    '국내 상장 ETF 중 ETFCHECK 분류가 월배당(0609002) 인 종목 전부. 상품명이 아니라 ' +
    '분류로 고른다. 커버드콜(0609005) 인지 아닌지는 항목마다 type 에 적는다 — ' +
    '처음에는 커버드콜만 담았는데, 그러면 리츠·인프라·배당주·채권형처럼 월배당을 ' +
    '꼬박꼬박 주는 종목이 통째로 빠졌다.',
  collectedAt: new Date().toISOString(),
  asOf: asOf ? `${asOf.slice(0, 4)}-${asOf.slice(4, 6)}-${asOf.slice(6, 8)}` : null,
  rules: RULES,
  derived: {
    price: '마스터(getEtpMast)의 종가를 먼저 쓰고, 없으면 상세, 그래도 없으면 일별 시세의 최신 종가를 쓴다. 어느 쪽인지는 항목마다 priceSource 에 적는다. 상세는 장이 닫히면 시세 항목이 빠져서 기댈 수 없다.',
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
    priceJumps: '하루에 ±15% 넘게 움직인 날. 커버드콜 ETF 에서는 시장보다 액면분할이나 원천 오기일 때가 많다. 지우지 않고 세어서 남긴다.',
  },
  universe: universe.length,
  adoptedCount: adopted.length,
  items,
  failed,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(
  `\n${OUT} 에 적었습니다 — 모집단 ${universe.length}, 채택 ${adopted.length}, ` +
    `제외 ${items.length - adopted.length}, 상세 실패 ${failed.length}`,
);
await browser.close();
