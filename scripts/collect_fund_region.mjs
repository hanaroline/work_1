#!/usr/bin/env node
/**
 * 투자지역 수집 — **1차 출처(금융투자협회)에서 직접 받는다.**
 *
 *   node scripts/collect_fund_region.mjs
 *   -> data/fund-region.js   (window.FUND_REGION)
 *
 * ── 왜 따로 받나 ───────────────────────────────────────────────────────────
 *
 * 투자지역은 이 화면의 **주축**이다. 사용자가 정한 범위가 "국내에 설정된
 * 공모펀드를 투자 지역으로 가른다" 이고 화면의 첫 필터가 그것이다.
 *
 * 처음에는 네이버 유형명의 앞머리에서 읽었다("해외주식형" → 해외).
 * **재검증에서 그 방식이 10.7% 틀린다는 것이 드러났다**
 * (tools/discovery/fund_reverify_region.md, 표본 318개).
 *
 *   금투협은 투자지역을 **국내·해외·혼합** 셋으로 분류한다.
 *   네이버 유형명의 "혼합" 은 **자산**(주식+채권)을 뜻한다.
 *
 * 곧 유형명에서 읽는 방식은 "지역이 혼합인 펀드" 를 표현할 수 없다.
 * 해외혼합형은 표본 35개 중 20개(57%)가 금투협 기준 "혼합" 이었다.
 * 게다가 MMF·기타형 344개는 유형명에 지역이 없어 "미상" 이었는데,
 * 금투협에는 값이 있다(MMF 는 전부 국내).
 *
 *   내 방식으로 틀리는 것        약 342개
 *   내 방식으로 비는 것          344개
 *   합쳐서 3,196개 중 약 21%
 *
 * 화면이 하는 일 자체가 그만큼 틀린다. 그래서 **1차 출처에서 직접 받는다.**
 *
 * ── 조회 계약 ──────────────────────────────────────────────────────────────
 *
 * 추측으로는 못 맞혔다. 브라우저로 전자공시 펀드요약 팝업을 열어 오가는
 * POST 를 관찰해 얻은 것이다. 그래서 이 수집기도 **브라우저로 한 번 열어
 * 본문을 잡고**, 그 본문의 표준코드만 갈아 끼워 재생한다. 계약이 바뀌면
 * 관찰부터 다시 한다 — 외워 둔 주소를 쓰지 않는다.
 *
 * ── 실패할 때 ──────────────────────────────────────────────────────────────
 *
 * 금투협이 막히면 **빈칸으로 둔다.** 네이버 유형명으로 되돌아가지 않는다 —
 * 그 값이 10.7% 틀린다는 것을 이미 알기 때문이다. 빌드가 원천을 표시하므로
 * 화면은 "1차 출처에서 못 받았다" 고 말할 수 있다.
 */

import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { writeDataFile, assertEnough } from './etf_lib.mjs';

const OUT = 'data/fund-region.js';
const POST_URL = 'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/';
const CONCURRENCY = 4;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

process.on('unhandledRejection', (e) => {
  console.error('[region] 중단:', e?.message || e);
  process.exit(1);
});

// ── 대상 ────────────────────────────────────────────────────────────────────
const src = await readFile('data/fund-kr.js', 'utf8');
const KR = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const funds = KR.funds || [];
if (!funds.length) throw new Error('data/fund-kr.js 에 펀드가 없다');
console.log(`[region] 대상 ${funds.length}개`);

// ── 1. 조회 본문을 관찰한다 ─────────────────────────────────────────────────
console.log('[region] 조회 계약 관찰 중…');
const seed = funds[0];
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });
const page = await ctx.newPage();
const captured = [];
page.on('request', (r) => {
  if (r.method() === 'POST' && r.url().includes('/proframeWeb/XMLSERVICES/')) {
    const b = r.postData() || '';
    if (b.includes(seed.code)) captured.push(b);
  }
});
await page.goto(
  'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml' +
  `&companyCd=&standardCd=${encodeURIComponent(seed.code)}&standardDt=&grntGb=`,
  { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(6000);
await page.close();
await ctx.close();
await browser.close();

const template = captured.find((b) => b.includes('fundBasInfoSrch'))
              || captured.find((b) => b.includes('COMFundUnityBasInfoSO'))
              || captured[0];
if (!template) throw new Error('조회 POST 본문을 잡지 못했다 — 계약이 바뀌었을 수 있다');
console.log(`[region] 본문 확보 (${template.length}자, ${captured.length}건 중)`);

// ── 2. 본문을 갈아 끼워 재생한다 ────────────────────────────────────────────
/** 응답 XML 에서 투자지역을 뽑는다. 태그 이름을 외우지 않고 값으로 찾는다. */
function pickRegion(xml) {
  const m = xml.match(/<([A-Za-z][\w]*)>\s*(국내|해외|혼합)\s*<\/\1>/);
  return m ? { region: m[2], tag: m[1] } : { region: null, tag: null };
}

async function fetchOne(code, tries = 3) {
  const body = template.split(seed.code).join(code);
  let last;
  for (let i = 1; i <= tries; i += 1) {
    try {
      const res = await fetch(POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          Accept: 'application/xml, text/xml, */*',
          'User-Agent': UA,
          Origin: 'https://dis.kofia.or.kr',
          Referer: 'https://dis.kofia.or.kr/websquare/index.jsp',
        },
        body,
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return pickRegion(await res.text());
    } catch (e) {
      last = e;
      if (i < tries) await new Promise((r) => setTimeout(r, 400 * 2 ** (i - 1)));
    }
  }
  throw last;
}

// 씨앗으로 재생이 도는지 먼저 본다. 안 되면 여기서 멈춘다 —
// 3,196번 헛부르고 나서 알 일이 아니다.
const seedRes = await fetchOne(seed.code);
if (!seedRes.region) throw new Error('재생 응답에서 투자지역을 못 찾았다');
console.log(`[region] 재생 확인 — ${seed.code} → ${seedRes.region} (태그 ${seedRes.tag})`);

// ── 3. 전수 ─────────────────────────────────────────────────────────────────
const MAP = { 국내: 'domestic', 해외: 'overseas', 혼합: 'mixed' };
const result = {};
const failures = [];
let done = 0;

async function worker(list) {
  for (const f of list) {
    try {
      const r = await fetchOne(f.code);
      if (r.region) result[f.code] = MAP[r.region] || null;
      else failures.push({ code: f.code, error: '투자지역 없음' });
    } catch (e) {
      failures.push({ code: f.code, error: String(e.message || e).slice(0, 60) });
    }
    done += 1;
    if (done % 250 === 0) console.log(`[region] ${done}/${funds.length} · 확보 ${Object.keys(result).length}`);
    await new Promise((r) => setTimeout(r, 60));
  }
}
const chunks = Array.from({ length: CONCURRENCY }, (_, i) =>
  funds.filter((_, j) => j % CONCURRENCY === i));
await Promise.all(chunks.map(worker));

const got = Object.keys(result).length;
const dist = {};
for (const v of Object.values(result)) dist[v] = (dist[v] || 0) + 1;
console.log(`\n[region] 확보 ${got}/${funds.length} · 실패 ${failures.length}`);
console.log(`[region] 분포: ${JSON.stringify(dist)}`);

// 네이버 유형명으로 읽었을 때와 얼마나 다른가 — 고친 값어치를 남긴다.
let diff = 0, filled = 0;
for (const f of funds) {
  const k = result[f.code];
  if (!k) continue;
  if (f.region == null) { if (k) filled += 1; }
  else if (f.region !== k) diff += 1;
}
console.log(`[region] 네이버 유형명과 다른 것 ${diff} · 비어 있던 것을 채운 것 ${filled}`);

// 반쪽짜리로 덮지 않는다.
assertEnough('fund.region', got, funds.length, 0.9);

await writeDataFile(OUT, 'FUND_REGION', {
  updatedAt: new Date().toISOString(),
  source: 'kofia',
  sourceNote: '금융투자협회 전자공시 (1차 출처)',
  count: got,
  total: funds.length,
  distribution: dist,
  changedFromNaver: diff,
  filledFromBlank: filled,
  failures: failures.slice(0, 50),
  region: result,
}, `투자지역 — 금융투자협회 ${new Date().toISOString()}`);
