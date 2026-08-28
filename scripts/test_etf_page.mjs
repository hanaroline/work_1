#!/usr/bin/env node
/**
 * ETF 페이지 연기 시험 — 실제 브라우저로 열어 본다.
 *
 *   node scripts/test_etf_page.mjs            # etf.html (분리 파일)
 *   node scripts/test_etf_page.mjs --built    # etf-holdings-search.html (단일 파일)
 *
 * 화면을 그리는 코드는 눈으로 못 보면 틀린 줄도 모른다. 표가 비어 있어도,
 * 콘솔에 오류가 나도 페이지는 "열리기는" 하기 때문이다. 그래서 열어서
 * 눌러 보고, 콘솔 오류가 하나라도 있으면 실패로 친다.
 */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const BUILT = process.argv.includes('--built');
const PAGE = BUILT ? '/etf-holdings-search.html' : '/etf.html';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
                '.json': 'application/json' };

const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage();

const errors = [];
// 폰트 CDN 이 막힌 환경(사내망·이 컨테이너)에서는 외부 자원 적재가 실패한다.
// 그것은 페이지의 결함이 아니므로 자바스크립트 오류만 센다.
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const text = m.text();
  if (/Failed to load resource/.test(text)) return;
  errors.push(`console: ${text}`);
});
page.on('requestfailed', (r) => {
  const url = r.url();
  if (!url.startsWith('http://127.0.0.1')) return;      // 외부 CDN 실패는 넘긴다
  errors.push(`requestfailed: ${url} ${r.failure()?.errorText}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

await page.goto(base + PAGE, { waitUntil: 'networkidle' });

// ── 목록이 실제로 그려졌는가
const rows = await page.locator('#list-body tr').count();
check('목록에 행이 있다', rows > 0, `${rows}행`);

const countText = await page.locator('#result-count').textContent();
check('결과 개수가 표시된다', /\d/.test(countText || ''), countText);

// ── 필터 셀렉트가 채워졌는가
for (const id of ['f-market', 'f-region', 'f-asset', 'f-index', 'f-sector',
                  'f-theme', 'f-manager', 'f-aum', 'f-period']) {
  const n = await page.locator(`#${id} option`).count();
  check(`${id} 선택지가 채워졌다`, n > 1, `${n}개`);
}

// ── 행을 누르면 상세가 열리고 상위10이 나오는가
await page.locator('#list-body tr').first().click();
await page.waitForTimeout(150);
const holdRows = await page.locator('#detail .hold-row').count();
check('상세에 상위 편입종목이 그려진다', holdRows > 0, `${holdRows}종목`);
const retRows = await page.locator('#detail table tbody tr').count();
check('상세에 기간수익률 표가 있다', retRows > 0, `${retRows}행`);

// ── 수익률 기준 토글
await page.locator('#basis-seg button[data-basis="nav"]').click();
await page.waitForTimeout(100);
const navHead = await page.locator('#list-head th[data-sort="ret"]').textContent();
check('NAV 기준으로 바뀌면 표 머리가 바뀐다', /NAV/.test(navHead || ''), navHead.trim());
await page.locator('#basis-seg button[data-basis="price"]').click();

// ── 정렬
await page.locator('#list-head th[data-sort="ter"]').click();
await page.waitForTimeout(100);
const sortAttr = await page.locator('#list-head th[data-sort="ter"]').getAttribute('aria-sort');
check('열 머리를 누르면 정렬된다', Boolean(sortAttr), sortAttr);

// ── 비교 담기 -> 비교 탭
await page.locator('#list-body button[data-pick]').nth(0).click();
await page.locator('#list-body button[data-pick]').nth(1).click();
await page.locator('.tabs button[data-tab="compare"]').click();
await page.waitForTimeout(150);
const cmpCards = await page.locator('#compare-body .cmp-grid .card').count();
check('비교 탭에 담은 ETF가 나온다', cmpCards === 2, `${cmpCards}개`);
const overlapCells = await page.locator('#compare-body .overlap-cell').count();
check('중복도 표가 계산된다', overlapCells > 0, `${overlapCells}칸`);

// ── 역조회
await page.locator('.tabs button[data-tab="reverse"]').click();
await page.waitForTimeout(100);
const widelyHeld = await page.locator('#reverse-body tr[data-stock]').count();
check('역조회 기본 화면에 종목 목록이 있다', widelyHeld > 0, `${widelyHeld}종목`);
const firstStock = await page.locator('#reverse-body tr[data-stock]').first().getAttribute('data-stock');
await page.locator('#rq').fill(firstStock);
await page.waitForTimeout(150);
const hits = await page.locator('#reverse-body tbody tr').count();
check(`"${firstStock}" 역조회 결과가 나온다`, hits > 0, `${hits}건`);

// ── 랭킹
await page.locator('.tabs button[data-tab="rank"]').click();
await page.waitForTimeout(150);
const rankCards = await page.locator('#rank-body .card').count();
check('랭킹 표가 그려진다', rankCards >= 3, `${rankCards}개 표`);

// ── 분류 점검
await page.locator('.tabs button[data-tab="tagging"]').click();
await page.waitForTimeout(150);
const tagRows = await page.locator('#tagging-body tbody tr').count();
check('분류 점검 표가 그려진다', tagRows > 0, `${tagRows}행`);

// ── 영문 전환
await page.locator('.lang-toggle button[data-lang="en"]').click();
await page.waitForTimeout(200);
const htmlLang = await page.getAttribute('html', 'lang');
check('영문으로 전환된다', htmlLang === 'en', htmlLang);
await page.locator('.tabs button[data-tab="browse"]').click();
const rowsEn = await page.locator('#list-body tr').count();
check('영문 상태에서도 목록이 그려진다', rowsEn > 0, `${rowsEn}행`);
await page.locator('.lang-toggle button[data-lang="ko"]').click();

// ── 가로 스크롤이 생기지 않는가 (표는 자기 상자 안에서 스크롤해야 한다)
for (const width of [1440, 768, 390]) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(120);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${width}px 에서 가로 스크롤이 없다`, overflow <= 1, `넘침 ${overflow}px`);
}

// ── 콘솔 오류
check('콘솔 오류가 없다', errors.length === 0, errors.slice(0, 3).join(' | '));

await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator('.tabs button[data-tab="browse"]').click();
await page.screenshot({ path: 'tools/discovery/etf_page.png', fullPage: false });

await browser.close();
server.close();

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} 통과`);
process.exit(failed.length ? 1 : 0);
