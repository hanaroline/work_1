#!/usr/bin/env node
/**
 * 펀드 탐색 8차 — 사용자가 준 주소는 **클래스 코드**였다.
 *
 *   node scripts/probe_fund_class_page.mjs
 *   -> tools/discovery/fund_class_probe.{json,md} + fund_class_page*.png
 *
 * 사용자가 준 주소:
 *   https://stock.naver.com/domestic/fund/K55207BJ1791/total
 *
 * 이 코드는 우리 자료의 **펀드 코드가 아니다.** 3,196개 어디에도 없다.
 * 교보악사파워인덱스증권자투자신탁 2(주식)(운용) `KR5207698899` 의
 * 클래스 여섯 중 하나(ClassAe)로 `classes[]` 안에만 있다.
 *
 * 곧 **네이버는 클래스 코드로도 펀드 화면을 연다.** 우리 화면은 못 연다 —
 * 검색이 `name·code·company·type·benchmarkName` 만 훑고 클래스는 안 훑는다.
 * 사람이 들고 있는 코드는 대개 클래스 코드다(통장·HTS 에 찍히는 것이 그것이다).
 *
 * 그러니 화면을 고치기 전에 실물로 가려야 할 것이 다섯이다.
 *
 *   1. 클래스 코드로 그 화면이 정말 열리는가 (넘어가지 않고)
 *   2. 상세 API 가 클래스 코드에 답하는가 — 답한다면 무엇이 부모와 다른가
 *      (기준가·설정액·수익률·보유종목이 클래스마다 다른가)
 *   3. 목록 API 3,196개에 클래스 코드가 섞여 있는가
 *      → 섞여 있으면 우리는 한 펀드를 둘로 세고 있는 것이다
 *   4. 화면이 찍는 수익률 숫자가 우리가 실은 값과 같은가
 *      (이 펀드는 1년 +153% 로 실려 있다. 실물을 봐야 한다)
 *   5. 화면에 있는데 우리가 안 싣는 항목이 있는가
 *
 * 2번이 "부모와 같다" 로 나오면 클래스는 검색 별칭일 뿐이고, "다르다" 로
 * 나오면 클래스는 그 자체로 하나의 상품이다. 화면을 어떻게 고칠지가 여기서
 * 갈리므로 짐작으로 넘어가지 않는다.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

import { getJson, mapLimit } from './etf_lib.mjs';

const OUT_JSON = 'tools/discovery/fund_class_probe.json';
const OUT_MD = 'tools/discovery/fund_class_probe.md';
const API = 'https://stock.naver.com/api/fund/funds';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const headers = { Referer: 'https://stock.naver.com/domestic/fund' };

const CLASS = 'K55207BJ1791';        // 사용자가 준 코드 — 교보악사…2[주식]ClassAe
const PARENT = 'KR5207698899';       // 우리 자료에 실린 부모 펀드

const out = {
  at: new Date().toISOString(),
  question: '사용자가 준 주소는 클래스 코드다. 우리 화면이 못 여는 코드다.',
  page: {},          // 1번
  detail: {},        // 2번
  list: {},          // 3번
  rendered: {},      // 4번·5번
  mine: {},          // 우리 자료의 해당 값
};

// ─────────────────── 우리 자료를 먼저 읽는다 ───────────────────
// 대조할 상대가 있어야 "다르다" 를 말할 수 있다.
{
  const s = await readFile('data/fund.js', 'utf8');
  const j = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
  const parent = j.funds.find((f) => f.code === PARENT) || null;
  const cls = parent?.classes?.find((c) => c.code === CLASS) || null;
  out.mine = {
    updatedAt: j.updatedAt,
    총펀드수: j.funds.length,
    클래스코드가_최상위에_있나: j.funds.some((f) => f.code === CLASS),
    parent: parent && {
      code: parent.code, name: parent.name, type: parent.type, region: parent.region,
      company: parent.company, basePrice: parent.basePrice, tradeDate: parent.tradeDate,
      aum: parent.aum, nav: parent.nav, riskGrade: parent.riskGrade,
      inceptionDate: parent.inceptionDate, benchmarkName: parent.benchmarkName,
      holdingCount: parent.holdingCount, feeMin: parent.feeMin, feeMax: parent.feeMax,
      ret: parent.ret, retSrc: parent.retSrc, retDropped: parent.retDropped,
      metrics: parent.metrics,
    },
    class: cls,
    // 우리 자료 전체에서 클래스 코드가 몇 개인가. 검색이 못 찾는 코드의 규모다.
    클래스코드총수: j.funds.reduce((n, f) => n + (f.classes?.length || 0), 0),
  };
}

// ─────────────────── 1·4·5번: 화면 실물 ───────────────────
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1280, height: 2200 } });

/** 화면 하나를 열고 최종 주소·제목·본문 글자·API 호출을 기록한다. */
async function openPage(label, code) {
  const url = `https://stock.naver.com/domestic/fund/${code}/total`;
  const page = await ctx.newPage();
  const calls = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\//.test(u)) return;
    let body = '';
    try { body = (await res.text()).slice(0, 1500); } catch { /* 못 읽는 응답 */ }
    calls.push({ status: res.status(), url: u.slice(0, 300), bytes: body.length });
  });

  const rec = { label, code, url };
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    rec.status = resp?.status() ?? null;
    rec.finalUrl = page.url();
    // 넘어갔는지부터 본다. 옛 주소가 홈으로 넘어가는 것을 보고 "서비스가
    // 없어졌다" 고 단정한 적이 있다 — 최종 주소를 반드시 남긴다.
    rec.redirected = !rec.finalUrl.includes(code);
    rec.title = await page.title();
    // 화면에 찍힌 글자를 통째로 남긴다. 무엇이 있는지 우리가 정하지 않는다.
    rec.text = (await page.evaluate(() => document.body.innerText || ''))
      .replace(/\n{3,}/g, '\n\n').slice(0, 12000);
    // 탭이 무엇무엇인지. /total 말고 다른 자리가 있는지 본다.
    rec.tabs = await page.evaluate((c) => Array.from(document.querySelectorAll('a[href]'))
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.includes(`/fund/${c}/`))
      .filter((h, i, arr) => arr.indexOf(h) === i).slice(0, 20), code);
    await page.screenshot({ path: `tools/discovery/fund_class_page_${label}.png`, fullPage: true });
  } catch (e) {
    rec.error = String(e).slice(0, 300);
  }
  rec.calls = calls;
  await page.close();
  return rec;
}

out.page.class = await openPage('class', CLASS);
out.page.parent = await openPage('parent', PARENT);
await browser.close();

// ─────────────────── 2번: 상세 API 가 답하는가 ───────────────────
const ENDPOINTS = [
  'left-panel', 'chart-price-panel', 'fund-performance',
  'metrics/detail', 'classes/returns', 'base-price/chart?term=3m',
];

async function detailOf(code) {
  const got = {};
  for (const ep of ENDPOINTS) {
    const sep = ep.includes('?') ? '&' : '?';
    try {
      const j = await getJson(`${API}/${code}/${ep}`, { headers });
      got[ep] = { ok: true, keys: j && typeof j === 'object' ? Object.keys(j) : null, body: j };
    } catch (e) {
      got[ep] = { ok: false, error: String(e).slice(0, 200) };
    }
    void sep;
  }
  return got;
}

const dClass = await detailOf(CLASS);
const dParent = await detailOf(PARENT);

/** 두 응답에서 같은 자리를 뽑아 나란히 놓는다. */
function summarize(d) {
  const lp = d['left-panel']?.body || null;
  const det = lp?.detail || {};
  const cp = d['chart-price-panel']?.body || null;
  const rets = {};
  for (const r of (cp?.fundReturns?.returns || [])) rets[r.term] = r.fundReturn;
  return {
    응답온엔드포인트: ENDPOINTS.filter((e) => d[e]?.ok),
    실패한엔드포인트: ENDPOINTS.filter((e) => !d[e]?.ok),
    fundCode: det.fundCode ?? null,
    fundName: det.fundName ?? null,
    parentPeerGroupName: det.parentPeerGroupName ?? null,
    companyName: det.companyName ?? null,
    basePrice: det.basePrice ?? null,
    tradeDate: det.tradeDate ?? null,
    returnIndex: det.returnIndex ?? null,
    derivedAum: det.derivedAum ?? null,
    derivedNav: det.derivedNav ?? null,
    inceptionDate: det.inceptionDate ?? null,
    benchmarkName: det.benchmarkName ?? null,
    riskGrade: det.riskGrade ?? null,
    totalFee: det.totalFee ?? null,
    기간수익률: rets,
    보유종목수: cp?.allocationsPortfolio?.result?.length ?? null,
    보유종목있음: cp?.availability?.portfolio ?? null,
    클래스수: lp?.returns?.classes?.length ?? null,
    클래스코드: (lp?.returns?.classes || []).map((c) => c.fundCode),
  };
}

out.detail.class = summarize(dClass);
out.detail.parent = summarize(dParent);

// 두 요약을 자리별로 견준다. 같은지 다른지는 우리가 짐작하지 않고 여기서 센다.
{
  const a = out.detail.class, b = out.detail.parent;
  const diff = [];
  for (const k of Object.keys(a)) {
    const x = JSON.stringify(a[k]), y = JSON.stringify(b[k]);
    diff.push({ 자리: k, 클래스: a[k], 부모: b[k], 같은가: x === y });
  }
  out.detail.compare = diff;
}

// ─────────────────── 3번: 목록에 클래스가 섞여 있는가 ───────────────────
// 한 펀드를 둘로 세고 있는지가 여기서 갈린다. 160페이지를 다 넘긴다.
{
  const codes = new Set();
  const rows = [];
  for (let page = 0; page < 400; page += 1) {
    let d;
    try { d = await getJson(`${API}?page=${page}&size=20`, { headers }); }
    catch (e) { out.list.error = String(e).slice(0, 200); break; }
    const fs2 = d?.funds || [];
    if (!fs2.length) break;
    for (const f of fs2) { codes.add(f.fundCode); rows.push(f); }
    if (d.hasNext === false) break;
  }
  const s = await readFile('data/fund.js', 'utf8');
  const j = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
  const classCodes = new Set();
  for (const f of j.funds) for (const c of (f.classes || [])) classCodes.add(c.code);
  const topCodes = new Set(j.funds.map((f) => f.code));

  // 클래스 코드이면서 목록에도 있는 코드 = 한 펀드가 둘로 세어진 자리
  const both = [...classCodes].filter((c) => codes.has(c));
  out.list = {
    ...out.list,
    목록크기: codes.size,
    우리최상위: topCodes.size,
    목록에없는우리코드: [...topCodes].filter((c) => !codes.has(c)).slice(0, 20),
    클래스코드총수: classCodes.size,
    클래스이면서목록에도있는코드수: both.length,
    예시: both.slice(0, 15),
    사용자가준코드가_목록에있나: codes.has(CLASS),
    부모코드가_목록에있나: codes.has(PARENT),
  };
  // 목록 행이 pcUrl 을 준다고 인수인계에 적혀 있다. 실물을 남긴다 —
  // 화면에서 원천으로 나가는 링크를 걸 수 있는지가 여기서 갈린다.
  const one = rows.find((r) => r.fundCode === PARENT) || rows[0] || null;
  out.list.목록행예시 = one;
}

// ─────────────────── 적기 ───────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const p = out.page, c = out.detail.class, b = out.detail.parent;
const md = [];
md.push('# 펀드 탐색 8차 — 사용자가 준 주소는 클래스 코드였다', '');
md.push(`조사 시각: ${out.at}`, '');
md.push(`대상: 클래스 \`${CLASS}\` · 부모 \`${PARENT}\``, '');
md.push('## 1. 클래스 코드로 화면이 열리는가', '');
md.push('| | 클래스 | 부모 |', '|---|---|---|');
md.push(`| HTTP | ${p.class.status ?? '–'} | ${p.parent.status ?? '–'} |`);
md.push(`| 최종 주소 | ${p.class.finalUrl ?? p.class.error ?? '–'} | ${p.parent.finalUrl ?? p.parent.error ?? '–'} |`);
md.push(`| 넘어갔나 | ${p.class.redirected} | ${p.parent.redirected} |`);
md.push(`| 제목 | ${p.class.title ?? '–'} | ${p.parent.title ?? '–'} |`);
md.push('');
md.push('## 2. 상세 API 가 클래스 코드에 답하는가', '');
md.push('| 자리 | 클래스 | 부모 | 같은가 |', '|---|---|---|---|');
for (const r of out.detail.compare) {
  const f = (v) => {
    const s2 = v == null ? '–' : (typeof v === 'object' ? JSON.stringify(v) : String(v));
    return s2.length > 90 ? s2.slice(0, 90) + '…' : s2.replace(/\|/g, '\\|');
  };
  md.push(`| ${r.자리} | ${f(r.클래스)} | ${f(r.부모)} | ${r.같은가 ? '=' : '**다름**'} |`);
}
md.push('');
md.push('## 3. 목록 3,196개에 클래스가 섞여 있는가', '');
md.push('| 항목 | 수 |', '|---|---:|');
md.push(`| 목록 크기 | ${out.list.목록크기} |`);
md.push(`| 우리 최상위 펀드 | ${out.list.우리최상위} |`);
md.push(`| 우리가 든 클래스 코드 | ${out.list.클래스코드총수} |`);
md.push(`| **클래스이면서 목록에도 있는 코드** | **${out.list.클래스이면서목록에도있는코드수}** |`);
md.push(`| 사용자가 준 코드가 목록에 있나 | ${out.list.사용자가준코드가_목록에있나} |`);
md.push('');
md.push('## 4·5. 화면에 찍힌 글자', '');
md.push('클래스 화면:', '', '```', (p.class.text || p.class.error || '(없음)').slice(0, 5000), '```', '');
md.push('부모 화면:', '', '```', (p.parent.text || p.parent.error || '(없음)').slice(0, 5000), '```', '');
md.push('## 우리 자료의 같은 펀드', '', '```json',
        JSON.stringify(out.mine.class, null, 1),
        JSON.stringify({ ret: out.mine.parent?.ret, basePrice: out.mine.parent?.basePrice,
                         aum: out.mine.parent?.aum, nav: out.mine.parent?.nav }, null, 1),
        '```', '');
md.push('## 화면이 부르는 API', '');
for (const k of ['class', 'parent']) {
  md.push(`### ${k}`, '');
  for (const call of (p[k].calls || []).slice(0, 40)) md.push(`- \`${call.status}\` ${call.url}`);
  md.push('');
}
await writeFile(OUT_MD, md.join('\n'));

console.log(`[8차] 클래스 화면 ${p.class.status} 넘어감=${p.class.redirected} · ` +
            `상세응답 ${c.응답온엔드포인트.length}/${ENDPOINTS.length} · ` +
            `부모 ${b.응답온엔드포인트.length}/${ENDPOINTS.length} · ` +
            `목록속클래스 ${out.list.클래스이면서목록에도있는코드수}`);
void mapLimit;
