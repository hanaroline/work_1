// 지급주기(월·분기·연) 조회를 붙이기 전에, **모집단이 얼마나 커지는지 재는**
// 일회성 측정기다. 아무것도 만들지 않고 아무것도 덮어쓰지 않는다 —
// `tools/etfcheck-discovery/freq-universe.json` 에 잰 것을 적기만 한다.
//
// 왜 재야 하나
// ──────────────────────────────────────────────────────────────────────
// 지금 모집단은 "국내 상장 ∧ 월배당(0609002)" 192종목이고, 종목마다 6번씩
// 물어 12~13분에 끝난다. 그런데 ETFCHECK 분류에는 분기배당·연배당이 아예
// 없다(0609 계열은 고배당/월배당/주배당/리츠/커버드콜/MLP 뿐). 그래서
// 분기·연배당을 담으려면 국내 상장 ETF **전부**(1,535종목)로 넓히고 실제
// 지급 횟수로 주기를 판정해야 하는데, 그대로 6번씩 물으면 80~95분이라
// 워크플로 한도 75분을 넘긴다. 매월 1일 갱신이 시간 초과로 깨진다.
//
// 그래서 단계를 나누려는 것이고, 이 측정기는 그 단계별로 **몇 종목이 남는지**
// 를 실제로 세어 본다. 어림하지 않는다 — 어림한 수로 기준을 정하면 다음 달
// 1일에 알게 된다.
//
// 재는 것
//   A. 스크리너(getEtpScreenerMobileList3) 가 전 종목을 한 번에 주는가.
//      주면 순자산·거래대금을 **추가 호출 0회**로 얻어 먼저 자를 수 있다.
//   B. 그 관문을 통과한 종목마다 getEtpItemDivOutline 1회 → 최근 12개월
//      지급 횟수 → 주기별 종목 수.
//   C. 각 단계에 걸린 시간.
//
// 세션(클로드 쪽)에서는 etfcheck.co.kr 로 CONNECT 가 403 이라 못 돈다.
// **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://www.etfcheck.co.kr';
const OUT = 'tools/etfcheck-discovery/freq-universe.json';

// 순자산으로 먼저 자르는 관문은 두지 않는다. 1차 실측에서 스크리너가 전 종목을
// 주지 않는 것을 확인했고(10행·국내 0종목), 순자산을 종목마다 따로 받으면
// 1단계가 두 배로 비싸져 관문을 두는 뜻이 없어진다. 전 종목에 주기 판정을 돌린다.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

const t0 = Date.now();
const lap = () => ((Date.now() - t0) / 1000).toFixed(0);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const ctx = await browser.newContext({
  locale: 'ko-KR',
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

const seen = [];
const screenerCalls = [];
let appHeaders = null;
page.on('response', async (res) => {
  const url = res.url();
  if (!url.startsWith(BASE)) return;
  const req = res.request();
  if (!appHeaders && req.headers().checkclient) appHeaders = req.headers();
  if (/getEtpScreener/.test(url)) {
    // 앱이 스스로 부르는 모양을 그대로 베낀다. 매개변수를 지어내지 않는다.
    screenerCalls.push({
      url,
      method: req.method(),
      postData: (req.postData() || '').slice(0, 4000),
      status: res.status(),
    });
  }
  if (!/getEtpMast|getEtpCtgMap/.test(url)) return;
  try {
    seen.push({ url, body: await res.text() });
  } catch {
    /* 못 읽는 응답은 넘긴다 */
  }
});

console.log(`[${lap()}s] 첫 화면을 연다`);
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);
if (!appHeaders) throw new Error('앱 머리글(checkclient)을 못 잡았습니다.');

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

class ApiError extends Error {}

async function callOnce({ url, method = 'GET', body = null }) {
  const r = await page.evaluate(
    async ({ url, method, body, headers }) => {
      try {
        const init = { method, headers: { ...headers }, credentials: 'include' };
        if (body !== null) {
          init.body = body;
          init.headers['content-type'] = 'application/json';
        }
        const res = await fetch(url, init);
        return { status: res.status, text: await res.text() };
      } catch (e) {
        return { status: 0, text: String(e).slice(0, 200) };
      }
    },
    { url: url.startsWith('http') ? url : BASE + url, method, body, headers: HDRS },
  );
  if (r.status !== 200) throw new ApiError(`HTTP ${r.status}`);
  let j;
  try {
    j = JSON.parse(r.text);
  } catch {
    throw new ApiError(`JSON 아님: ${r.text.slice(0, 80)}`);
  }
  if (j.success !== true) throw new ApiError(String(j.message || `success=${j.success}`).slice(0, 120));
  return j.results ?? [];
}

// 머리글 재발급은 **화면을 새로 여는 일**이다. 그게 이 원천에서 제일 비싼
// 동작이고, 2차 실측을 망가뜨린 것도 그것이었다.
//
// 2차 실측: 306종목 중 30종목만 성공하고 276종목이 403·HTTP 0·
// ERR_EMPTY_RESPONSE 로 실패했다. 성공한 30개가 전부 맨 앞쪽이었다 — 즉
// 서른 종목쯤 되다가 통째로 막혔다. 까 보니 내가 만든 악순환이었다.
// 호출이 실패하면 화면을 새로 열었는데, 수집기 주석에 내가 예전에 적어 둔
// 그대로다 — "잇달아 열면 ERR_EMPTY_RESPONSE 가 온다". 실패 몇 건 → 화면
// 열기 → 원천이 화면 열기를 막음 → 머리글을 못 받음 → 이후 전부 403 → 또
// 화면 열기. 수집기가 1,152회를 탈 없이 도는 이유는 화면을 거의 안 열기
// 때문이다.
//
// 그래서 재발급에 고삐를 건다. 5분에 한 번, 통틀어 열 번까지. 그 밖의
// 실패는 화면을 열지 않고 그냥 쉬었다 다시 묻는다.
const REFRESH_MIN_GAP_MS = 5 * 60 * 1000;
const REFRESH_MAX = 10;
let lastRefresh = 0;
let refreshCount = 0;

async function refreshHeaders() {
  const now = Date.now();
  if (refreshCount >= REFRESH_MAX || now - lastRefresh < REFRESH_MIN_GAP_MS) return false;
  lastRefresh = now;
  refreshCount++;
  appHeaders = null;
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
  } catch (e) {
    console.log(`  (화면을 못 열었습니다: ${String(e.message).slice(0, 60)})`);
    return false;
  }
  if (!appHeaders) return false;
  for (const k of Object.keys(HDRS)) delete HDRS[k];
  for (const [k, v] of Object.entries(appHeaders)) {
    if (!/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k)) HDRS[k] = v;
  }
  console.log(`  (머리글을 새로 받았습니다 — ${refreshCount}/${REFRESH_MAX})`);
  return true;
}

async function call(spec, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await callOnce(spec);
    } catch (e) {
      last = e;
      // 막혔다는 신호(403)면 더 오래 쉰다. 곧바로 다시 물으면 막힌 채로
      // 두드리기만 하고 차단이 길어진다.
      const blocked = /HTTP (403|429|0)/.test(String(e.message));
      await sleep((blocked ? 4000 : 800) * (i + 1));
      if (i === tries - 2) await refreshHeaders();
    }
  }
  throw last;
}

// ── 모집단 ────────────────────────────────────────────────────────────
const domesticCodes = new Set(ctgMap.filter((r) => r.F16013 && r.domestic_flag === 1).map((r) => r.F16013));
const monthlyCodes = new Set(
  ctgMap
    .filter((r) => r.F16013 && r.domestic_flag === 1 && String(r.ctgInfo || '').includes('0609002'))
    .map((r) => r.F16013),
);
const universe = mast.filter((r) => domesticCodes.has(r.F16013));
console.log(`[${lap()}s] 국내 상장 ${universe.length}종목 (그중 월배당 분류 ${monthlyCodes.size})`);

// ── A. 스크리너 ───────────────────────────────────────────────────────
// 1차 실측(2026-09-17)에서 확인했다. 앱이 부르는 모양을 그대로 베껴 불렀더니
// **10행**이 왔고 그중 국내 종목은 **0개**였다. 전 종목 목록이 아니다.
// 그래서 순자산으로 먼저 자르는 관문은 못 쓴다 — 전 종목에 주기 판정을 돌려
// 적어도 "주기별로 몇 종목인가" 를 잰다.
//
// 스크리너 화면을 찾아 돌아다니던 부분은 뺐다. 얻은 것이 없었고, 엉뚱한
// 경로로 옮겨 다니는 사이 세션이 흐트러졌을 여지만 남겼다.
const screenerProbe = {
  note: '1차 실측에서 10행·국내 0종목으로 확인 — 전 종목 목록이 아니라 관문에 쓸 수 없다',
};
const byCode = new Map();
const gated = universe;
console.log(`[${lap()}s] 1단계 대상 ${gated.length}종목 (관문 미사용 — 스크리너가 전 종목을 주지 않는다)`);

// ── B. 지급주기 판정 ──────────────────────────────────────────────────
// 최근 12개월 지급 횟수로 본다. getEtpItemDivOutline 은 연도별 지급 횟수와
// **지급한 달 목록**(MONTH="01,02,…")을 주므로, 달 단위로 정확히 셀 수 있다.
const now = new Date();
const curY = now.getFullYear();
const curM = now.getMonth() + 1; // 1~12
// 최근 12개월 = (작년 curM+1월) ~ (올해 curM월)
function countLast12(rows) {
  let n = 0;
  const months = [];
  for (const r of rows) {
    const y = Number(r.DATE);
    const ms = String(r.MONTH || '')
      .split(',')
      .map((x) => Number(x))
      .filter((x) => x >= 1 && x <= 12);
    for (const m of ms) {
      if ((y === curY && m <= curM) || (y === curY - 1 && m > curM)) {
        n++;
        months.push(`${y}-${String(m).padStart(2, '0')}`);
      }
    }
  }
  return { n, months: months.sort() };
}

// 이력이 12개월을 못 채운 종목은 **주기를 판정하지 않는다.** 6개월에 두 번
// 준 것을 "분기" 라고 부르면 거짓이다. 목록에는 담되 '판정 불가' 로 적는다.
function classify(n, listedOn) {
  const listed = /^\d{8}$/.test(String(listedOn || '')) ? String(listedOn) : null;
  if (listed) {
    const ly = Number(listed.slice(0, 4));
    const lm = Number(listed.slice(4, 6));
    const monthsListed = (curY - ly) * 12 + (curM - lm);
    if (monthsListed < 12) return '판정 불가(상장 1년 미만)';
  }
  if (n === 0) return '무분배';
  if (n >= 20) return '주배당';
  if (n >= 10) return '월배당';
  if (n >= 3 && n <= 6) return '분기배당';
  if (n <= 2) return '연배당';
  return '비정기';
}

// 예산. 워크플로 한도가 75분이라 55분에서 스스로 멈춘다.
//
// 1차 실측은 한도에 걸려 잘렸고, 그때까지 센 350종목치가 **통째로 사라졌다**.
// 다 재지 못한 것보다 재 놓고 못 남긴 것이 더 나쁜 실수다. 이제 중간에
// 저장하고, 예산을 넘기면 거기까지를 "여기까지 쟀다" 고 적고 끝낸다.
const BUDGET_MS = 55 * 60 * 1000;

// 이미 아는 종목에는 예산을 쓰지 않는다.
//
// 수집기가 이번 판에서 192종목의 주기를 **이미 판정해 두었다**(data/cc_etf.json).
// 원천이 우리를 막는 마당에 아는 것을 다시 묻는 것은 한정된 예산을 버리는
// 짓이다. 그대로 가져다 합치고, 호출은 모르는 종목에만 쓴다. 어디서 온
// 값인지는 source 에 적어 둔다 — 섞어 놓고 출처를 안 적으면 나중에 이 표를
// 믿을 수 없게 된다.
const known = new Map();
try {
  for (const it of JSON.parse(fs.readFileSync('data/cc_etf.json', 'utf8')).items || []) {
    if (it.code && it.payoutFreq) known.set(it.code, it);
  }
  console.log(`[${lap()}s] 수집기가 이미 판정해 둔 ${known.size}종목은 다시 묻지 않습니다`);
} catch {
  console.log(`[${lap()}s] data/cc_etf.json 을 못 읽었습니다 — 전 종목을 새로 묻습니다`);
}

const results = [];
const failed = [];
const tStage1 = Date.now();
let stoppedEarly = null;
let consecutiveFail = 0;
let calledOk = 0;   // 실제로 원천에 물어서 받아 낸 종목 수
let calledTried = 0; // 실제로 물어 본 종목 수 (성공·실패 합)

function saveReport(extra = {}) {
  const tally = {};
  for (const r of results) tally[r.freq] = (tally[r.freq] || 0) + 1;
  const elapsed = Math.round((Date.now() - tStage1) / 1000);
  // 호출당 시간은 **실제로 부른 종목**으로만 낸다. 수집기에서 그대로 가져온
  // 종목은 시간을 안 쓰므로, 그것까지 분모에 넣으면 실제보다 빠르다고
  // 적히고 그 숫자로 2단계 예산을 잘못 잡게 된다.
  const perCall = calledOk ? elapsed / calledOk : null;
  const stage2Targets = results.filter((r) => r.freq !== '무분배' && r.freq !== '판정 불가(상장 1년 미만)');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        when: new Date().toISOString(),
        purpose: '지급주기·연분배율 조회를 붙이기 전, 모집단 확대 비용을 실측한다',
        완료: results.length + failed.length >= gated.length,
        counts: {
          국내상장전체: universe.length,
          월배당분류: monthlyCodes.size,
          '1단계대상': gated.length,
          '1단계성공': results.length,
          '1단계실패': failed.length,
          수집기에서가져옴: results.length - calledOk,
          실제호출시도: calledTried,
          실제호출성공: calledOk,
        },
        주기별: tally,
        시간: {
          '1단계초': elapsed,
          호출당초: perCall,
          '2단계대상': stage2Targets.length,
          '2단계추정분': perCall ? Math.round((stage2Targets.length * perCall * 6) / 60) : null,
        },
        stoppedEarly,
        screenerProbe,
        failedSample: failed.slice(0, 20),
        items: results,
        ...extra,
      },
      null,
      2,
    ),
  );
  return { tally, elapsed, perCall, stage2Targets };
}

for (const [i, row] of gated.entries()) {
  const code = row.F16013;
  const name = row.F16002;
  if (i % 50 === 0) {
    const done = results.length + failed.length;
    const rate = done ? (Date.now() - tStage1) / done : 0;
    console.log(
      `  [${lap()}s] ${i}/${gated.length} … 성공 ${results.length} 실패 ${failed.length}` +
        (rate ? ` · 종목당 ${(rate / 1000).toFixed(2)}초 · 남은 예상 ${Math.round(((gated.length - i) * rate) / 60000)}분` : ''),
    );
    if (i > 0) saveReport(); // 중간 저장. 잘려도 여기까지는 남는다
  }
  // 수집기가 이미 판정해 둔 종목은 호출 없이 그대로 합친다.
  const k = known.get(code);
  if (k) {
    results.push({
      code,
      name,
      freq: k.payoutFreq,
      count12m: k.payoutCount12m,
      months12m: k.payoutMonths12m || [],
      listedOn: k.listedOn || row.F16017 || null,
      monthlyCtg: monthlyCodes.has(code),
      aum: k.aum ?? null,
      turnoverDay: k.turnoverDay ?? null,
      divRate: k.distTtmRate ?? null,
      source: '수집기(data/cc_etf.json)',
    });
    continue;
  }

  // 예산을 넘겼으면 멈춘다. 잘려서 아무것도 못 남기느니 여기까지를 남긴다.
  if (Date.now() - tStage1 > BUDGET_MS) {
    stoppedEarly = `예산 ${BUDGET_MS / 60000}분을 넘겨 ${i}/${gated.length} 에서 멈췄습니다`;
    console.log(`  [${lap()}s] ${stoppedEarly}`);
    break;
  }
  calledTried++;
  try {
    const rows = await call({ url: `/user/etp/getEtpItemDivOutline?code=${code}` });
    const { n, months } = countLast12(rows);
    const s = byCode.get(code);
    results.push({
      code,
      name,
      freq: classify(n, row.F16017),
      count12m: n,
      months12m: months,
      listedOn: row.F16017 || null,
      monthlyCtg: monthlyCodes.has(code),
      aum: s ? num(s.F15028) : null,
      turnoverDay: s ? num(s.F15023) : null,
      divRate: s ? num(s.DIV_RATE) : null,
    });
    calledOk++;
    consecutiveFail = 0;
  } catch (e) {
    failed.push({ code, name, why: String(e.message).slice(0, 160) });
    consecutiveFail++;
    // 연속 실패 차단기.
    //
    // 2차 실측은 서른 종목 뒤로 막혔는데도 55분을 꽉 채워 재시도만 했다.
    // 276번을 두드려서 얻은 것은 없고, 원천 쪽에서 우리를 더 오래 막을
    // 이유만 쌓았다. 막힌 것이 분명해지면 즉시 멈추고 여기까지를 남긴다 —
    // 잘 돌아가는 매월 1일 수집까지 막히는 것이 제일 나쁘다.
    if (consecutiveFail >= 20) {
      stoppedEarly =
        `${i}/${gated.length} 에서 20연속 실패해 멈췄습니다 (마지막: ${String(e.message).slice(0, 80)}). ` +
        '원천이 막은 것으로 보입니다 — 계속 두드리지 않습니다.';
      console.log(`  [${lap()}s] ${stoppedEarly}`);
      break;
    }
    if (failed.length >= 10 && results.length === 0) {
      saveReport({ note: '앞 10종목이 모두 실패해 일찍 멈췄습니다' });
      throw new Error(`앞 ${failed.length}종목이 모두 실패했습니다: ${String(e.message).slice(0, 120)}`);
    }
  }
  // 간격은 **검증된 수집기와 같은 250ms** 로 둔다.
  //
  // 1차 실측에서 120ms 로 뒀다가 크게 데었다. 원천이 막기 시작했고, 막힐
  // 때마다 재시도 두 번에 머리글 재발급(약 8초)까지 타면서 종목당 11.9초가
  // 들었다 — 빠르게 가려다 다섯 배 느려진 셈이다. 수집기는 250ms 로 192종목
  // × 6호출을 탈 없이 돈다. 검증된 속도를 두고 달릴 이유가 없다.
  await sleep(250);
}
const stage1Sec = Math.round((Date.now() - tStage1) / 1000);

// ── 집계 ──────────────────────────────────────────────────────────────
const tally = {};
for (const r of results) tally[r.freq] = (tally[r.freq] || 0) + 1;

// 2단계(종목당 6호출) 비용 추정. 1단계 한 호출에 실제로 걸린 시간을 재서
// 여섯 배 한다 — 어림수가 아니라 이번 판에서 나온 값이다.
const perCall = results.length ? stage1Sec / results.length : null;
const stage2Targets = results.filter((r) => r.freq !== '무분배' && r.freq !== '판정 불가(상장 1년 미만)');
const stage2EstMin = perCall ? Math.round((stage2Targets.length * perCall * 6) / 60) : null;

// 관문은 이번 판에서 쓰지 않았다(스크리너가 전 종목을 주지 않는다). 쓰지 않은
// 기준을 결과에 적으면 그것으로 걸렀다고 읽힌다 — 적지 않는다.
saveReport();

const done = results.length + failed.length;
console.log('');
console.log('══ 실측 결과 ══');
if (stoppedEarly) console.log(`※ ${stoppedEarly} — 아래는 여기까지 잰 값입니다`);
console.log(`국내 상장 ${universe.length} → 판정 ${done}종목 (성공 ${results.length}, 실패 ${failed.length})`);
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log(`1단계 ${stage1Sec}초 (종목당 ${perCall?.toFixed(2)}초)`);
if (perCall) {
  console.log(`  → 전 종목 1단계 환산 ${Math.round((universe.length * perCall) / 60)}분`);
}
console.log(`2단계 대상 ${stage2Targets.length}종목 × 6호출 ≈ ${stage2EstMin}분 (워크플로 한도 75분)`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const L = [];
  L.push('### 지급주기 모집단 실측');
  L.push('');
  if (stoppedEarly) L.push(`> ⚠ ${stoppedEarly} — 아래는 여기까지 잰 값입니다.`);
  L.push(`- 국내 상장 **${universe.length}**종목 → 판정 **${done}** (성공 ${results.length}, 실패 ${failed.length})`);
  L.push(`- 스크리너: ${screenerProbe.note}`);
  L.push('');
  L.push('| 지급주기 | 종목 수 |');
  L.push('|---|---:|');
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) L.push(`| ${k} | ${v} |`);
  L.push('');
  L.push(`- 1단계 **${stage1Sec}초** (종목당 ${perCall?.toFixed(2)}초)`);
  if (perCall) L.push(`- 전 종목 1단계 환산 **${Math.round((universe.length * perCall) / 60)}분**`);
  L.push(`- 2단계 대상 **${stage2Targets.length}**종목 × 6호출 ≈ **${stage2EstMin}분** (한도 75분)`);
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, L.join('\n') + '\n');
}

await browser.close();
