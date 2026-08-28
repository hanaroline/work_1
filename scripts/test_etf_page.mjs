#!/usr/bin/env node
/**
 * ETF 페이지 연기 시험 — 실제 브라우저로 열어 본다.
 *
 *   node scripts/test_etf_page.mjs            # etf.html (분리 파일)
 *   node scripts/test_etf_page.mjs --built    # etf-holdings-search.html (단일 파일)
 *   node scripts/test_etf_page.mjs --artifact # 아티팩트로 올릴 조각
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
const ARTIFACT = process.argv.includes('--artifact');
const PAGE = ARTIFACT ? '/etf-artifact.html'
  : BUILT ? '/etf-holdings-search.html' : '/etf.html';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
                '.json': 'application/json' };

const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    let body = await readFile(join(process.cwd(), path));
    // 아티팩트 호스트는 우리가 넘긴 조각에 <!doctype>·<head>·<body> 를 직접
    // 씌운다. 그 껍데기를 여기서 똑같이 씌워야 올리기 전에 같은 화면을 본다.
    // (조각을 그냥 열면 브라우저가 알아서 감싸 주므로 시험이 통과해 버린다 —
    //  진짜로 확인해야 할 것은 "씌워진 상태" 다.)
    if (ARTIFACT && path.endsWith('etf-artifact.html')) {
      body = Buffer.from(
        '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
        '</head>\n<body>\n' + body.toString('utf8') + '\n</body>\n</html>\n');
    }
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

// ── 비교 담기 -> 비교 탭 (8개까지 담긴다)
for (let i = 0; i < 8; i += 1) {
  await page.locator('#list-body button[data-pick]').nth(i).click();
}
await page.locator('.tabs button[data-tab="compare"]').click();
await page.waitForTimeout(250);
const cmpCards = await page.locator('#compare-body .cmp-grid .card').count();
check('비교에 8개까지 담긴다', cmpCards === 8, `${cmpCards}개`);
const overlapCells = await page.locator('#compare-body .overlap-cell').count();
check('중복도 표가 계산된다', overlapCells > 0, `${overlapCells}칸`);

// ── 종목 × ETF 매트릭스
const matrixCols = await page.locator('#compare-body .matrix thead th.etf').count();
check('매트릭스 열이 담은 ETF 수와 같다', matrixCols === 8, `${matrixCols}열`);
const matrixRows = await page.locator('#compare-body .matrix tbody tr').count();
check('매트릭스에 종목 행이 있다', matrixRows > 0, `${matrixRows}종목`);
const heldCells = await page.locator('#compare-body .matrix td.held').count();
check('매트릭스에 비중이 채워진다', heldCells > 0, `${heldCells}칸`);

// 행이 40개까지 가므로 아래로 훑는 동안 머리행이 붙어 있어야 한다.
const stickyHead = await page.locator('#compare-body .matrix thead th.etf').first()
  .evaluate((el) => getComputedStyle(el).position);
check('매트릭스 머리행이 고정된다', stickyHead === 'sticky', stickyHead);
const stickyCol = await page.locator('#compare-body .matrix tbody th.stock').first()
  .evaluate((el) => getComputedStyle(el).position);
check('매트릭스 종목명 열이 고정된다', stickyCol === 'sticky', stickyCol);

// ── 편입종목 이름이 좁은 카드에서도 읽히는가.
//    막대가 고정폭 컬럼이던 때는 이름 칸이 18px 로 눌려 "삼" 한 글자만 보였다.
const nameWidths = await page.locator('#compare-body .cmp-grid .card .hold-row .nm')
  .evaluateAll((els) => els.slice(0, 12).map((el) => el.getBoundingClientRect().width));
const minName = Math.min(...nameWidths);
check('비교 카드에서 종목명 칸이 충분히 넓다', minName >= 90,
      `가장 좁은 칸 ${Math.round(minName)}px`);
const sampleName = await page.locator('#compare-body .cmp-grid .card .hold-row .nm')
  .first().textContent();
check('종목명이 한 글자로 잘리지 않는다', (sampleName || '').trim().length >= 2,
      (sampleName || '').trim().slice(0, 24));

// ── 카드끼리 순위가 같은 줄에 놓이는가.
//    ETF 이름이 한 줄이냐 두 줄이냐, 메타 줄이 접히느냐에 따라 목록 시작
//    높이가 달라지면 KODEX 200 의 1위와 TIGER 200 의 1위가 어긋난다.
//
//    8개는 그리드에서 두 줄로 접히므로, 아랫줄 카드는 당연히 아래에 있다.
//    **같은 줄에 놓인 카드끼리** 맞는지를 본다 (카드의 top 으로 줄을 가른다).
async function rowSpreadAt(nth) {
  return page.locator('#compare-body .cmp-grid .card').evaluateAll((cards, n) => {
    const lines = new Map();
    for (const c of cards) {
      const row = c.querySelectorAll('.hold-row')[n];
      if (!row) continue;
      const line = Math.round(c.getBoundingClientRect().top);
      if (!lines.has(line)) lines.set(line, []);
      lines.get(line).push(Math.round(row.getBoundingClientRect().top));
    }
    let worst = 0;
    let lineCount = 0;
    for (const tops of lines.values()) {
      if (tops.length < 2) continue;          // 혼자 있는 줄은 견줄 대상이 없다
      lineCount += 1;
      worst = Math.max(worst, Math.max(...tops) - Math.min(...tops));
    }
    return { worst, lineCount };
  }, nth);
}
const align1 = await rowSpreadAt(0);
check('같은 줄 카드끼리 1순위가 나란하다', align1.worst <= 1 && align1.lineCount > 0,
      `그리드 ${align1.lineCount}줄 · 편차 ${align1.worst}px`);
// 머리만 맞고 줄 높이가 다르면 아래로 갈수록 벌어진다. 3순위도 본다.
const align3 = await rowSpreadAt(2);
check('같은 줄 카드끼리 3순위도 나란하다', align3.worst <= 1 && align3.lineCount > 0,
      `편차 ${align3.worst}px`);

// 담아 둔 것을 비우고 나머지 시험으로 넘어간다
await page.locator('#compare-body [data-clear-basket]').click();
await page.waitForTimeout(150);

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

// ── 역조회 결과에서 ETF 를 누르면 그 자리에서 상세가 열린다
await page.locator('#reverse-body tbody tr[data-id]').first().click();
await page.waitForTimeout(250);
const revHold = await page.locator('#reverse-detail .hold-row').count();
check('역조회에서 ETF 상세가 열린다', revHold > 0, `${revHold}종목`);
const revRet = await page.locator('#reverse-detail table tbody tr').count();
check('역조회 상세에 기간수익률이 있다', revRet > 0, `${revRet}행`);
const revSel = await page.locator('#reverse-body tbody tr.selected').count();
check('고른 행이 표시된다', revSel === 1, `${revSel}행`);


// 상세가 표 위에 있어야 한다 — 200줄 아래에 열리면 찾아 내려가야 한다
const [detailTop, tableTop] = await page.evaluate(() => [
  document.querySelector('#reverse-detail').getBoundingClientRect().top,
  document.querySelector('#reverse-body .table-wrap').getBoundingClientRect().top,
]);
check('상세가 결과 표 위에 열린다', detailTop < tableTop,
      `상세 ${Math.round(detailTop)} < 표 ${Math.round(tableTop)}`);

// 다시 누르면 닫힌다
await page.locator('#reverse-body tbody tr.selected').first().click();
await page.waitForTimeout(200);
const revClosed = await page.locator('#reverse-detail .hold-row').count();
check('다시 누르면 상세가 닫힌다', revClosed === 0, `${revClosed}종목`);

// 검색어를 바꾸면 열려 있던 상세도 닫힌다 (지금 목록과 무관한 화면이 남지 않게)
await page.locator('#reverse-body tbody tr[data-id]').first().click();
await page.waitForTimeout(200);
await page.locator('#rq').fill('삼성');
await page.waitForTimeout(250);
const revAfterSearch = await page.locator('#reverse-detail .hold-row').count();
check('검색어를 바꾸면 상세가 닫힌다', revAfterSearch === 0, `${revAfterSearch}종목`);
// ETF 하나가 한 줄이어야 한다. 예전에는 걸린 편입종목마다 줄을 만들어
// KODEX 200 이 삼성전자·삼성전기·삼성물산으로 세 번 나왔고, 머리말의
// "N개 ETF" 도 그만큼 부풀려져 있었다.
await page.locator('#rq').fill('삼성');
await page.waitForTimeout(300);
const rowIds = await page.locator('#reverse-body tbody tr[data-id]')
  .evaluateAll((els) => els.map((el) => el.getAttribute('data-id')));
check('ETF 하나가 한 줄이다', new Set(rowIds).size === rowIds.length,
      `${rowIds.length}행 / 고유 ${new Set(rowIds).size}개`);
const combined = await page.locator('#reverse-body tbody tr[data-id] td:nth-child(4)')
  .first().textContent();
check('여러 종목이 걸리면 함께 적는다', (combined || '').includes('·'),
      (combined || '').trim().slice(0, 40));

// ── 랭킹
await page.locator('.tabs button[data-tab="rank"]').click();
await page.waitForTimeout(150);
const rankCards = await page.locator('#rank-body .card').count();
check('랭킹 표가 그려진다', rankCards >= 3, `${rankCards}개 표`);

// ── 랭킹에서 ETF 를 누르면 탭을 옮기지 않고 그 자리에서 상세가 열린다
const rankGridTopBefore = await page.evaluate(() =>
  document.querySelector('#rank-body .grid').getBoundingClientRect().top + window.scrollY);
await page.locator('#rank-body tbody tr[data-id]').first().click();
await page.waitForTimeout(300);
const stillRank = await page.locator('.tabs button[data-tab="rank"]')
  .getAttribute('aria-selected');
check('랭킹 탭에 그대로 머문다', stillRank === 'true', `aria-selected=${stillRank}`);
const rankHold = await page.locator('#rank-detail .hold-row').count();
check('랭킹에서 ETF 상세가 열린다', rankHold > 0, `${rankHold}종목`);

// 상세는 표 아래에 열려야 한다 — 위에 끼우면 읽던 순위표가 통째로 밀린다
const [rankDetailTop, rankGridTopAfter] = await page.evaluate(() => [
  document.querySelector('#rank-detail').getBoundingClientRect().top + window.scrollY,
  document.querySelector('#rank-body .grid').getBoundingClientRect().top + window.scrollY,
]);
check('상세가 순위표 아래에 열린다', rankDetailTop > rankGridTopAfter,
      `상세 ${Math.round(rankDetailTop)} > 표 ${Math.round(rankGridTopAfter)}`);
check('순위표가 밀려나지 않는다', Math.abs(rankGridTopAfter - rankGridTopBefore) < 2,
      `${Math.round(rankGridTopBefore)} -> ${Math.round(rankGridTopAfter)}`);

// 다시 누르면 닫힌다
await page.locator('#rank-body tbody tr.selected').first().click();
await page.waitForTimeout(250);
const rankClosed = await page.locator('#rank-detail .hold-row').count();
check('다시 누르면 랭킹 상세가 닫힌다', rankClosed === 0, `${rankClosed}종목`);

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
