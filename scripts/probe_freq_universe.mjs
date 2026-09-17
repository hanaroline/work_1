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

// 1단계 관문. 최종 채택 기준(순자산 300억·60일 거래대금 5억)보다 **일부러
// 느슨하게** 잡는다. 여기 쓰는 거래대금은 하루치(F15023)라 60일 평균보다
// 들쭉날쭉해서, 최종 기준을 그대로 대면 통과했을 종목이 하루 한산했다는
// 이유로 여기서 잘려 나간다. 관문은 비용을 줄이려고 두는 것이지 판정하려고
// 두는 것이 아니다 — 판정은 2단계에서 60일 평균으로 한다.
const GATE = {
  minAum: 30_000_000_000, // 순자산 300억 (최종 기준과 같다. 순자산은 하루로 안 흔들린다)
  minTurnoverDay: 100_000_000, // 하루 거래대금 1억 (최종 기준 5억의 1/5)
};

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

async function refreshHeaders() {
  appHeaders = null;
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  if (!appHeaders) return;
  for (const k of Object.keys(HDRS)) delete HDRS[k];
  for (const [k, v] of Object.entries(appHeaders)) {
    if (!/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k)) HDRS[k] = v;
  }
  console.log('  (머리글을 새로 받았습니다)');
}

async function call(spec, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await callOnce(spec);
    } catch (e) {
      last = e;
      await sleep(800 * (i + 1));
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

// ── A. 스크리너가 전 종목을 주는가 ────────────────────────────────────
// 앱이 스크리너 화면에서 스스로 부르는 모양을 먼저 본다. 관찰한 판은 36행만
// 왔는데 그것이 **화면이 걸어 둔 조건 때문인지, 한 번에 주는 최대치인지**
// 를 모른다. 모르는 채로 "전 종목이 온다" 고 적을 수는 없다.
const screenerProbe = { tried: [], observed: [], rows: null, note: null };
for (const p of ['/mobile/screener', '/screener', '/mobile/etpscreener']) {
  try {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(7000);
    screenerProbe.tried.push({ path: p, calls: screenerCalls.length });
    if (screenerCalls.length) break;
  } catch (e) {
    screenerProbe.tried.push({ path: p, error: String(e.message).slice(0, 120) });
  }
}
screenerProbe.observed = screenerCalls.slice(0, 5);

let screenerRows = null;
if (screenerCalls.length) {
  const s = screenerCalls[screenerCalls.length - 1];
  try {
    const rows = await call({ url: s.url, method: s.method, body: s.postData || null });
    screenerRows = rows;
    screenerProbe.rows = rows.length;
    screenerProbe.note = `앱이 부르는 모양 그대로 ${rows.length}행`;
  } catch (e) {
    screenerProbe.note = `앱 모양 그대로 불렀으나 실패: ${String(e.message).slice(0, 120)}`;
  }
}
console.log(`[${lap()}s] 스크리너: ${screenerProbe.note || '앱이 부르는 것을 못 잡았습니다'}`);

// 스크리너가 전 종목을 안 주면, 순자산은 상세에서 한 종목씩 받아야 한다.
// 그건 1단계를 두 배로 비싸게 만든다. 그래서 그 경우엔 관문을 걸지 않고
// **전 종목**에 주기 판정을 돌려서, 적어도 "주기별로 몇 종목인가" 는 잰다.
const byCode = new Map();
if (screenerRows) for (const r of screenerRows) if (r.F16013) byCode.set(r.F16013, r);
const screenerCovers = universe.filter((r) => byCode.has(r.F16013)).length;
const gateUsable = screenerRows && screenerCovers >= universe.length * 0.9;
console.log(`[${lap()}s] 스크리너가 국내 ${universe.length}종목 중 ${screenerCovers}종목을 덮습니다 → 관문 ${gateUsable ? '사용' : '미사용(전 종목 판정)'}`);

const gated = gateUsable
  ? universe.filter((r) => {
      const s = byCode.get(r.F16013);
      const aum = num(s.F15028);
      const to = num(s.F15023);
      return aum !== null && aum >= GATE.minAum && to !== null && to >= GATE.minTurnoverDay;
    })
  : universe;
console.log(`[${lap()}s] 1단계 대상 ${gated.length}종목`);

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

const results = [];
const failed = [];
const tStage1 = Date.now();
for (const [i, row] of gated.entries()) {
  const code = row.F16013;
  const name = row.F16002;
  if (i % 50 === 0) console.log(`  [${lap()}s] ${i}/${gated.length} …`);
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
  } catch (e) {
    failed.push({ code, name, why: String(e.message).slice(0, 160) });
    // 앞에서부터 줄줄이 실패하면 원천이 막은 것이다. 한 시간을 재시도로
    // 태우지 않고 일찍 멈춘다.
    if (failed.length >= 10 && results.length === 0) {
      throw new Error(`앞 ${failed.length}종목이 모두 실패했습니다: ${String(e.message).slice(0, 120)}`);
    }
  }
  await sleep(120);
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

const report = {
  when: new Date().toISOString(),
  purpose: '지급주기·연분배율 조회를 붙이기 전, 모집단 확대 비용을 실측한다',
  gate: GATE,
  counts: {
    국내상장전체: universe.length,
    월배당분류: monthlyCodes.size,
    스크리너덮은수: screenerCovers,
    관문사용: gateUsable,
    '1단계대상': gated.length,
    '1단계성공': results.length,
    '1단계실패': failed.length,
  },
  주기별: tally,
  시간: { '1단계초': stage1Sec, 호출당초: perCall, '2단계대상': stage2Targets.length, '2단계추정분': stage2EstMin },
  screenerProbe,
  failedSample: failed.slice(0, 20),
  items: results,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

console.log('');
console.log('══ 실측 결과 ══');
console.log(`국내 상장 ${universe.length} → 1단계 대상 ${gated.length} → 판정 성공 ${results.length} (실패 ${failed.length})`);
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log(`1단계 ${stage1Sec}초 (호출당 ${perCall?.toFixed(2)}초)`);
console.log(`2단계 대상 ${stage2Targets.length}종목 × 6호출 ≈ ${stage2EstMin}분 (워크플로 한도 75분)`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const L = [];
  L.push('### 지급주기 모집단 실측');
  L.push('');
  L.push(`- 국내 상장 **${universe.length}**종목 → 1단계 대상 **${gated.length}** → 판정 성공 **${results.length}** (실패 ${failed.length})`);
  L.push(`- 스크리너: ${screenerProbe.note || '앱 호출을 못 잡음'} — 국내 ${screenerCovers}종목 덮음, 관문 ${gateUsable ? '사용' : '미사용'}`);
  L.push('');
  L.push('| 지급주기 | 종목 수 |');
  L.push('|---|---:|');
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) L.push(`| ${k} | ${v} |`);
  L.push('');
  L.push(`- 1단계 **${stage1Sec}초** (호출당 ${perCall?.toFixed(2)}초)`);
  L.push(`- 2단계 대상 **${stage2Targets.length}**종목 × 6호출 ≈ **${stage2EstMin}분** (한도 75분)`);
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, L.join('\n') + '\n');
}

await browser.close();
