#!/usr/bin/env node
/**
 * 미래에셋증권 ELS/DLS 투자설명서 수집기
 *
 * ── 왜 이 스크립트가 필요한가 ────────────────────────────────
 * data/els.js (collect_els.mjs 수집) 는 목록 API 응답이라 상품명·기초자산·
 * 배리어 시퀀스·제시수익률까지만 담고 있다. 완전판매 스크립트가 읽어야 하는
 *   · 차수별 지급률(액면 대비 %)
 *   · 최초기준가격 평가일 / 자동조기상환 평가일
 *   · 중도상환 가격평가일
 *   · 기초자산별 변동성
 * 는 목록 API에 없고 투자설명서에만 있다.
 *
 * 브라우저(sales-script.html)에서 직접 가져올 수 없는 이유는 CORS 다.
 * 그래서 collect_els.mjs 와 같은 방식으로 서버측(GitHub Actions)에서 수집해
 * data/els-prospectus.js 로 커밋하고, 앱은 그 파일만 읽는다.
 *
 * ── 실행 ─────────────────────────────────────────────────────
 *   node scripts/collect_els_prospectus.mjs --probe        엔드포인트 탐색만 (파일 미기록)
 *   node scripts/collect_els_prospectus.mjs --limit 3      3건만 수집
 *   node scripts/collect_els_prospectus.mjs                전체 수집
 *
 * ── 검증 상태 ────────────────────────────────────────────────
 * ⚠ 이 스크립트는 아직 실제 사이트에 대해 검증되지 않았다.
 *   개발 환경의 송신 정책이 securities.miraeasset.com 을 차단해 호출을
 *   시도할 수 없었다. 상세페이지의 투자설명서 링크 위치는 사이트 구조에 따라
 *   달라지므로, 먼저 --probe 로 실행해 collect-debug/prospectus-probe.json 을
 *   확인한 뒤 SELECTORS 를 조정해야 한다.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const playwright = () => require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const CALENDAR = '/hks/hks4022/n01.do';   /* ELS/DLS 캘린더 (collect_els.mjs 와 동일) */
const OUT = 'data/els-prospectus.js';
const DEBUG_DIR = 'collect-debug';

/**
 * 상세페이지에서 투자설명서(또는 상품요약) 링크를 찾을 후보들.
 * --probe 결과를 보고 이 목록을 좁히거나 추가한다.
 */
const SELECTORS = [
  'a[href$=".pdf"]',
  'a[href*="prospectus"]',
  'a[href*="Prospectus"]',
  'a[href*="투자설명서"]',
  'a:has-text("투자설명서")',
  'a:has-text("간이투자설명서")',
  'a:has-text("상품요약")',
  'button:has-text("투자설명서")',
];

const args = process.argv.slice(2);
const PROBE = args.includes('--probe');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 ? Number(args[i + 1]) || 0 : 0;
})();

/** data/els.js 에서 수집 대상 상품 목록을 읽는다 */
async function loadProducts() {
  const src = await readFile('data/els.js', 'utf8');
  const g = {};
  // data/els.js 는 window.ELS_DATA = {...} 형태다
  new Function('window', src)(g);
  const list = (g.ELS_DATA && g.ELS_DATA.products) || [];
  return LIMIT ? list.slice(0, LIMIT) : list;
}

/**
 * 텍스트에서 투자설명서 항목을 뽑는다.
 * 앱과 같은 규칙을 쓰기 위해 js/sales-script-prospectus.js 를 그대로 로드한다.
 */
async function loadExtractor() {
  const src = await readFile('js/sales-script-prospectus.js', 'utf8');
  const g = {};
  new Function('window', src)(g);
  if (!g.SS_PROS) throw new Error('추출 규칙을 불러오지 못했습니다.');
  return g.SS_PROS;
}

/** PDF 버퍼 → 텍스트 (pdfjs-dist 를 쓰되 없으면 건너뛴다) */
async function pdfBufferToText(buf) {
  let pdfjs;
  try {
    pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
  } catch {
    return null;   /* 의존성이 없으면 텍스트 추출을 생략하고 링크만 기록 */
  }
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    let lastY = null, line = [], lines = [];
    for (const it of tc.items) {
      const y = it.transform ? Math.round(it.transform[5]) : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) { lines.push(line.join(' ')); line = []; }
      line.push(it.str);
      lastY = y;
    }
    if (line.length) lines.push(line.join(' '));
    pages.push(lines.join('\n'));
  }
  return pages.join('\n');
}

async function main() {
  await mkdir(DEBUG_DIR, { recursive: true });
  const products = await loadProducts();
  const PROS = await loadExtractor();
  console.log(`대상 상품 ${products.length}건${PROBE ? ' (probe 모드)' : ''}`);

  const { chromium } = playwright();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
    acceptDownloads: true,
  });
  const page = await ctx.newPage();

  const probe = { checkedAt: new Date().toISOString(), pages: [] };
  const out = {};

  try {
    /* 세션 쿠키 확보 (collect_els.mjs 와 동일한 전제) */
    await page.goto(ORIGIN + CALENDAR, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    for (const p of products) {
      const code = p.code;
      if (!code) continue;
      try {
        /* 상세페이지 진입 : 목록에서 상품명을 클릭하는 방식이 가장 안전하다 */
        const row = page.locator(`text=${p.name}`).first();
        if (await row.count()) {
          await row.click({ timeout: 8000 });
          await page.waitForTimeout(1800);
        }

        const found = { code, name: p.name, links: [] };
        for (const sel of SELECTORS) {
          const loc = page.locator(sel);
          const n = Math.min(await loc.count(), 5);
          for (let i = 0; i < n; i++) {
            const el = loc.nth(i);
            found.links.push({
              selector: sel,
              text: (await el.innerText().catch(() => '')).trim().slice(0, 60),
              href: await el.getAttribute('href').catch(() => null),
            });
          }
        }
        probe.pages.push({ code, url: page.url(), links: found.links });
        console.log(`  ${code} : 링크 후보 ${found.links.length}건`);

        if (PROBE) { await page.goBack({ waitUntil: 'networkidle' }).catch(() => {}); continue; }

        /* PDF 링크가 있으면 받아서 텍스트 추출 */
        const pdfLink = found.links.find((l) => l.href && /\.pdf(\?|$)/i.test(l.href));
        if (!pdfLink) {
          console.log(`  ${code} : 투자설명서 PDF 링크를 찾지 못함 — 건너뜀`);
          await page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
          continue;
        }
        const url = pdfLink.href.startsWith('http') ? pdfLink.href : ORIGIN + pdfLink.href;
        const res = await ctx.request.get(url, { timeout: 45000 });
        if (!res.ok()) throw new Error(`PDF HTTP ${res.status()}`);
        const buf = await res.body();
        const text = await pdfBufferToText(buf);

        const rec = { code, name: p.name, docUrl: url, collectedAt: new Date().toISOString() };
        if (text) {
          const fields = {};
          PROS.extract(text, 'els').forEach((f) => { fields[f.id] = f.value; });
          rec.fields = fields;
          rec.schedule = PROS.parseSchedule(text);
          console.log(`  ${code} : 항목 ${Object.keys(fields).length}건 · 차수 ${rec.schedule.length}행`);
        } else {
          rec.note = 'pdfjs-dist 미설치로 텍스트 추출 생략 — docUrl 만 기록';
          console.log(`  ${code} : 링크만 기록 (pdfjs-dist 없음)`);
        }
        out[code] = rec;
        await page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
      } catch (e) {
        console.log(`  ${code} : 실패 — ${e.message}`);
        await page.goto(ORIGIN + CALENDAR, { waitUntil: 'networkidle' }).catch(() => {});
      }
    }
  } finally {
    await browser.close();
  }

  await writeFile(`${DEBUG_DIR}/prospectus-probe.json`, JSON.stringify(probe, null, 2));
  console.log(`\n${DEBUG_DIR}/prospectus-probe.json 기록 (링크 후보 확인용)`);

  if (PROBE) return;

  const body =
    '/**\n' +
    ' * ELS/DLS 투자설명서 수집 결과 — scripts/collect_els_prospectus.mjs 가 생성한다.\n' +
    ' *\n' +
    ' * ELS_PROSPECTUS[상품코드] = { docUrl, fields, schedule, collectedAt }\n' +
    ' * sales-script.html 이 상품 선택 시 이 값을 등록된 투자설명서로 자동 적용한다.\n' +
    ' * 수집에 실패한 상품은 이 파일에 없으며, 화면에서 직접 등록해야 한다.\n' +
    ' */\n' +
    'window.ELS_PROSPECTUS = ' +
    JSON.stringify({ updatedAt: new Date().toISOString(), count: Object.keys(out).length, items: out }, null, 2) +
    ';\n';
  await writeFile(OUT, body);
  console.log(`${OUT} 기록 — ${Object.keys(out).length}건`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
