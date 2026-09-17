// 스크리너를 **한 번** 불러 국내 상장 전 종목을 받아 적고, 거기 담긴 것으로
// 무엇까지 알 수 있는지 본다.
//
// 앞선 확인에서 드러난 것 (tools/etfcheck-discovery/rank-endpoints.json)
// ──────────────────────────────────────────────────────────────────────
// getEtpScreenerMobileList3 을 **매개변수 없이** 부르면 7,220행이 오고 국내
// 1,540종목을 전부 덮는다. 처음 관찰했을 때 36행만 왔던 것은 화면이 조건을
// 걸어 두었기 때문이지 이 항목의 한계가 아니었다. 한 행에 순자산(F15028)·
// 거래대금(F15023)·보수(F34763)·현재가·상장일·운용사·최근 분배가 다 있다.
//
// 이게 판을 바꾼다. 종목마다 물어야 했던 것을 한 번에 얻으므로, 순자산·유동성
// 관문이 **추가 호출 0회**가 된다. 세 판을 태워 가며 좁히려 했던 것이 이
// 한 줄로 풀린다.
//
// 여기서 재는 것
//   1. 관문(순자산 300억·거래대금)을 통과하는 국내 종목이 몇인가.
//      = 주기 판정에 실제로 호출을 써야 할 종목 수.
//   2. MONTH_CODE 가 무엇인가. KODEX 200(연 1회 배당)은 비어 있었다.
//      이게 지급월을 담고 있다면 지급주기도 추가 호출 없이 나온다.
//      이미 주기를 아는 187종목과 맞춰 보면 알 수 있다 — 맞으면 쓰고,
//      안 맞으면 쓰지 않는다. 그럴듯하다고 쓰지 않는다.
//
// 호출 한 번짜리다. 막힐 일이 없다.
// **러너에서만** 돈다 (세션 쪽에서는 CONNECT 가 403).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://www.etfcheck.co.kr';
const OUT_DUMP = 'tools/etfcheck-discovery/screener-domestic.json';
const OUT_NOTE = 'tools/etfcheck-discovery/screener-findings.json';

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

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
let appHeaders = null;
page.on('response', async (res) => {
  const url = res.url();
  if (!url.startsWith(BASE)) return;
  if (!appHeaders && res.request().headers().checkclient) appHeaders = res.request().headers();
  if (!/getEtpCtgMap/.test(url)) return;
  try {
    seen.push({ url, body: await res.text() });
  } catch {
    /* 못 읽는 응답은 넘긴다 */
  }
});

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);
if (!appHeaders) throw new Error('앱 머리글(checkclient)을 못 잡았습니다.');

const HDRS = Object.fromEntries(
  Object.entries(appHeaders).filter(
    ([k]) => !/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k),
  ),
);

const ctgMap = JSON.parse([...seen].reverse().find((x) => /getEtpCtgMap/.test(x.url))?.body || '{}').results || [];
if (!ctgMap.length) throw new Error('분류대응을 못 받았습니다.');
const ctgOf = new Map(ctgMap.filter((r) => r.F16013).map((r) => [r.F16013, String(r.ctgInfo || '')]));
const domestic = new Set(ctgMap.filter((r) => r.F16013 && r.domestic_flag === 1).map((r) => r.F16013));

const r = await page.evaluate(
  async ({ url, headers }) => {
    const res = await fetch(url, { headers, credentials: 'include' });
    return { status: res.status, text: await res.text() };
  },
  { url: `${BASE}/user/etp/getEtpScreenerMobileList3`, headers: HDRS },
);
if (r.status !== 200) throw new Error(`스크리너 HTTP ${r.status}`);
const j = JSON.parse(r.text);
if (j.success !== true) throw new Error(`스크리너 success=${j.success}`);
const rows = j.results || [];
console.log(`스크리너 ${rows.length}행`);

const dom = rows.filter((x) => domestic.has(x.F16013));
console.log(`그중 국내 상장 ${dom.length}종목`);
if (dom.length < 1000) throw new Error(`국내가 ${dom.length}종목뿐입니다 — 응답 모양이 바뀌었는지 보십시오.`);

const items = dom.map((x) => ({
  code: x.F16013,
  name: x.F16002,
  manager: x.F33961,
  price: num(x.F15001),
  nav: num(x.F15301),
  aum: num(x.F15028),
  turnoverDay: num(x.F15023),
  volume: num(x.F15015),
  expenseRatio: num(x.F34763),
  listedOn: x.F16017 || null,
  lastDivDate: x.DIV_DATE || null,
  lastDivRate: num(x.DIV_RATE),
  recDivDate: x.REC_DIV_DATE || null,
  recDivAmt: num(x.REC_DIV_AMT),
  monthCode: x.MONTH_CODE ?? null,
  scaleCode: x.SCALE_CODE || null,
  etpType: x.ETP_TYPE || null,
  ctgInfo: ctgOf.get(x.F16013) || '',
}));

fs.mkdirSync(path.dirname(OUT_DUMP), { recursive: true });
fs.writeFileSync(OUT_DUMP, JSON.stringify({ when: new Date().toISOString(), count: items.length, items }, null, 2));

// ── 1. 관문을 통과하는 종목이 몇인가 ─────────────────────────────────
// 주기 판정에 호출을 써야 할 종목 수가 곧 이 수다.
const GATES = [
  ['순자산 300억 이상', (x) => (x.aum ?? 0) >= 30_000_000_000],
  ['순자산 300억 ∧ 일거래대금 1억 이상', (x) => (x.aum ?? 0) >= 30_000_000_000 && (x.turnoverDay ?? 0) >= 100_000_000],
  ['순자산 300억 ∧ 일거래대금 5억 이상', (x) => (x.aum ?? 0) >= 30_000_000_000 && (x.turnoverDay ?? 0) >= 500_000_000],
  ['순자산 1000억 ∧ 일거래대금 1억 이상', (x) => (x.aum ?? 0) >= 100_000_000_000 && (x.turnoverDay ?? 0) >= 100_000_000],
];
const gateCounts = GATES.map(([label, fn]) => ({ label, count: items.filter(fn).length }));
console.log('');
console.log('관문별 통과 종목 수 (호출 0회로 잰 값)');
for (const g of gateCounts) console.log(`  ${g.label}: ${g.count}종목`);

// ── 2. MONTH_CODE 가 지급주기를 말해 주는가 ───────────────────────────
// 이미 주기를 아는 종목과 맞춰 본다. 맞으면 쓰고, 안 맞으면 쓰지 않는다.
const tallyMonthCode = {};
for (const x of items) {
  const k = x.monthCode === null ? '(빈칸)' : String(x.monthCode);
  tallyMonthCode[k] = (tallyMonthCode[k] || 0) + 1;
}
console.log('');
console.log('MONTH_CODE 분포');
for (const [k, v] of Object.entries(tallyMonthCode).sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  console.log(`  ${k}: ${v}`);
}

// 수집기가 이미 판정해 둔 주기와 교차로 맞춰 본다.
const cross = {};
try {
  const known = new Map();
  for (const it of JSON.parse(fs.readFileSync('data/cc_etf.json', 'utf8')).items || []) {
    if (it.code && it.payoutFreq) known.set(it.code, it.payoutFreq);
  }
  for (const x of items) {
    const f = known.get(x.code);
    if (!f) continue;
    const k = x.monthCode === null ? '(빈칸)' : String(x.monthCode);
    cross[k] = cross[k] || {};
    cross[k][f] = (cross[k][f] || 0) + 1;
  }
  console.log('');
  console.log(`MONTH_CODE × 이미 아는 지급주기 (${known.size}종목과 교차)`);
  for (const [k, m] of Object.entries(cross)) {
    console.log(`  ${k}: ${Object.entries(m).map(([a, b]) => `${a} ${b}`).join(', ')}`);
  }
} catch {
  console.log('data/cc_etf.json 을 못 읽어 교차 확인을 건너뜁니다');
}

const findings = {
  when: new Date().toISOString(),
  screenerRows: rows.length,
  domesticRows: items.length,
  gateCounts,
  monthCodeTally: tallyMonthCode,
  monthCodeVsKnownFreq: cross,
};
fs.writeFileSync(OUT_NOTE, JSON.stringify(findings, null, 2));

if (process.env.GITHUB_STEP_SUMMARY) {
  const L = ['### 스크리너 한 번으로 얻은 것', ''];
  L.push(`- 스크리너 **${rows.length}행** · 국내 상장 **${items.length}종목** (호출 1회)`);
  L.push('');
  L.push('| 관문 | 통과 종목 |');
  L.push('|---|---:|');
  for (const g of gateCounts) L.push(`| ${g.label} | ${g.count} |`);
  L.push('');
  L.push('**MONTH_CODE × 이미 아는 지급주기**');
  L.push('');
  L.push('| MONTH_CODE | 주기별 |');
  L.push('|---|---|');
  for (const [k, m] of Object.entries(cross)) {
    L.push(`| ${k} | ${Object.entries(m).map(([a, b]) => `${a} ${b}`).join(', ')} |`);
  }
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, L.join('\n') + '\n');
}

await browser.close();
