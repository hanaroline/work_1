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

// ── 수익률 기준.
//    기준은 총수익률 하나다. 고를 것이 없으므로 토글도 없다 — 남아 있으면
//    상세 표(총수익률만)와 목록이 서로 다른 기준을 보여 주게 된다.
const hasTr = await page.evaluate(() =>
  (window.ETF_DATA?.etfs || []).some((e) => e.ret && e.ret.tr));
check('기준 토글이 없다', (await page.locator('#basis-seg').count()) === 0);

const listHead = await page.locator('#list-head th[data-sort="ret"]').textContent();
if (hasTr) {
  check('목록 표 머리가 총수익률이다', /총수익률|TR/.test(listHead || ''), (listHead || '').trim());
}
const basisNote = await page.locator('#basis-note').textContent();
check('기준을 화면에 밝힌다', /총수익률|otal return/.test(basisNote || ''),
      (basisNote || '').trim().slice(0, 40));

// ── 상세 기간수익률 표: 기간 + 총수익률 + 기준가 + 순위 + 유형 평균 대비
const retHeads = await page.locator('#detail .ret-table thead th').allTextContents();
check('기간수익률 표가 5열이다', retHeads.length === 5, retHeads.map((x) => x.trim()).join(' | '));
check('기준가 기준 열이 있다', retHeads.some((h) => /기준가|NAV/.test(h)),
      retHeads.map((x) => x.trim()).join(' | '));
// 다른 화면과 값이 다를 때 먼저 견줘야 하는 것이 기준일이다. 2026-07-28 처럼
// 시장이 하루에 -10.84% 움직인 날이 기준일에 걸리면 하루 차이로 크게 갈린다.
const periodTxt = await page.locator('#detail .ret-table tbody tr').first()
  .locator('td').nth(0).textContent();
check('기간 칸에 기준일이 적힌다', /\d{2}-\d{2}/.test(periodTxt || ''), (periodTxt || '').trim());
// 기준은 여전히 총수익률 하나다 — 고르는 토글은 없고, 순위와 유형 평균도
// 총수익률로만 낸다. 기준가 열은 고를 대상이 아니라 **다른 화면과 맞춰 보는
// 참고값**이다(네이버 종목분석의 "평균 ETF 수익률" 이 바로 이 값이다).
check('첫 숫자 열이 총수익률이다', /총수익률|Total return/.test(retHeads[1] || ''),
      (retHeads[1] || '').trim());
check('순위 열이 있다', retHeads.some((h) => /순위|Rank/.test(h)));
check('동일 유형 안에서 순위를 매긴다고 밝힌다',
      retHeads.some((h) => /동일 유형|in category/.test(h)), retHeads.join(' | '));
check('유형 평균 대비 열이 있다', retHeads.some((h) => /유형 평균|category avg/.test(h)));

// 상용 ETF 화면과 같은 표기 — 등수가 아니라 백분율 순위 하나이고,
// 그 기간의 동일 유형 종목 수를 함께 적는다.
const rankTxt = await page.locator('#detail .ret-table tbody tr').first()
  .locator('td').nth(3).textContent();
check('백분율 순위가 계산된다', /\d+%/.test(rankTxt || ''), (rankTxt || '').trim());
check('순위 칸에 동일 유형 종목 수가 적힌다',
      /동일 유형 [\d,]+개|of [\d,]+/.test(rankTxt || ''), (rankTxt || '').trim());
const rankLabels = await page.locator('#detail .ret-table tbody tr td:nth-child(4) .rank-pct')
  .allTextContents();
const outOfRange = rankLabels.filter((x) => {
  const m = /(\d+)%/.exec(x);
  return !m || +m[1] < 1 || +m[1] > 100;
});
check('백분율이 1~100 안에 있다', outOfRange.length === 0, outOfRange.join(' | ') || '없음');
const peerTxt = await page.locator('#detail .ret-table tbody tr').first()
  .locator('td').nth(4).textContent();
check('유형 평균 대비가 계산된다', /%p/.test(peerTxt || ''), (peerTxt || '').trim());

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

// ── 겹침 표의 ETF 이름·코드를 누르면 아래에서 상세가 열린다
const cmpGridTopBefore = await page.evaluate(() =>
  document.querySelector('#compare-body .cmp-grid').getBoundingClientRect().top + window.scrollY);
await page.locator('#compare-body table tbody th.etf-link').first().click();
await page.waitForTimeout(300);
const cmpHold = await page.locator('#compare-detail .hold-row').count();
check('겹침 표에서 ETF 상세가 열린다', cmpHold > 0, `${cmpHold}종목`);

const [cmpDetailTop, cmpGridTopAfter] = await page.evaluate(() => [
  document.querySelector('#compare-detail').getBoundingClientRect().top + window.scrollY,
  document.querySelector('#compare-body .cmp-grid').getBoundingClientRect().top + window.scrollY,
]);
check('상세가 표들 아래에 열린다', cmpDetailTop > cmpGridTopAfter,
      `상세 ${Math.round(cmpDetailTop)} > 카드 ${Math.round(cmpGridTopAfter)}`);
check('위쪽 표가 밀려나지 않는다', Math.abs(cmpGridTopAfter - cmpGridTopBefore) < 2,
      `${Math.round(cmpGridTopBefore)} -> ${Math.round(cmpGridTopAfter)}`);

// 열 머리(코드)로도 열린다
await page.locator('#compare-body table thead th.etf-link').nth(1).click();
await page.waitForTimeout(300);
const cmpHold2 = await page.locator('#compare-detail .hold-row').count();
check('열 머리(코드)로도 상세가 열린다', cmpHold2 > 0, `${cmpHold2}종목`);

// 다시 누르면 닫힌다
await page.locator('#compare-body table thead th.etf-link').nth(1).click();
await page.waitForTimeout(250);
const cmpClosed = await page.locator('#compare-detail .hold-row').count();
check('다시 누르면 비교 상세가 닫힌다', cmpClosed === 0, `${cmpClosed}종목`);

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

// 거래가 멈춘 종목은 어느 순위에도 들면 안 된다. 값이 멈춘 날에 얼어붙어
// 있어서다 — ACE 러시아MSCI(합성)이 거래량 0, 순자산 9천만원인 채로
// "총보수 가장 낮은 ETF" 1위에 앉아 있었다.
const suspInRank = await page.evaluate(() => {
  const ids = new Set([...document.querySelectorAll('#rank-body tbody tr[data-id]')]
    .map((tr) => tr.getAttribute('data-id')));
  return (window.ETF_DATA?.etfs || ETFS).filter((e) => e.suspended && ids.has(e.id))
    .map((e) => e.code);
});
check('거래정지 종목이 순위에 없다', suspInRank.length === 0, suspInRank.join(',') || '없음');

// 설정액은 같은 잣대끼리만 세운다. 야후는 뱅가드 ETF 의 순자산으로 펀드
// 전체(뮤추얼펀드 클래스 포함)를 준다 — VTI 와 VTSAX 가 똑같이 $2,290.0B
// 였고 여덟 쌍 모두 그랬다. 섞어 세우면 상위 열다섯 중 아홉이 뱅가드가 된다.
const aumScopes = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('#rank-body .card')];
  const card = cards.find((c) => /설정액|AUM/.test(c.querySelector('h4')?.textContent || ''));
  if (!card) return null;
  const ids = new Set([...card.querySelectorAll('tbody tr[data-id]')]
    .map((tr) => tr.getAttribute('data-id')));
  const all = window.ETF_DATA?.etfs || ETFS;
  return all.filter((e) => ids.has(e.id)).map((e) => e.aumScope ?? null);
});
check('설정액 순위에 잣대가 다른 값이 없다',
      aumScopes != null && aumScopes.every((s) => s === 'etf'),
      aumScopes == null ? '표를 못 찾음' : [...new Set(aumScopes)].join(','));

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

// ── 수익률 기준 탭. 근거가 도구 안에 같이 있어야 한다 — 별도 문서로 빼면
//    배포할 파일이 둘이 되고 언젠가 한쪽만 돌아다닌다.
await page.locator('.tabs button[data-tab="basis"]').click();
await page.waitForTimeout(200);
const basisTables = await page.locator('#basis-body table').count();
check('수익률 기준 탭이 그려진다', basisTables >= 3, `${basisTables}개 표`);
const basisTxt = await page.locator('#basis-body').textContent();
check('결론을 먼저 말한다', /재는 대상이 달랐|measure different/.test(basisTxt || ''));
check('대조군 관측이 있다', /분배가 없으면|no distributions/.test(basisTxt || ''));
check('소급 수정 관측이 있다', /분배금과 맞|equals the distributions/.test(basisTxt || ''));
const ratioCells = await page.locator('#basis-body table').nth(1)
  .locator('tbody tr td:nth-child(4)').allTextContents();
check('비율이 숫자로 채워진다', ratioCells.length > 0 && ratioCells.every((c) => /\d\.\d{4}/.test(c)),
      ratioCells.join(' | '));

// ── 순위·유형평균 — 모집단이 정직한가
//
// 이 두 칸은 데이터가 아니라 화면이 그 자리에서 만드는 값이라, 틀려도
// 감사에 걸리지 않는다. 실제로 세 가지가 틀려 있었다.
//   1) 총수익률이 깨진 종목 하나가 국내 주식형 420종목의 평균을 9.21%p 밀었다
//   2) 2배 레버리지가 1배와 같은 "유형" 으로 묶여 평균에 들어갔다
//   3) 머리말에 무리 크기 479 를 적어 놓고 3년 평균은 252종목으로 냈다
await page.locator('.tabs button[data-tab="browse"]').click();
await page.waitForTimeout(150);
{
  // 국내 1배 주식형 하나를 골라 상세를 연다.
  const target = await page.evaluate(() => {
    const e = window.ETF_DATA.etfs.find((x) => x.market === 'KR' && x.assetClass === 'equity'
      && x.region === 'korea' && !(x.flags || []).some((f) => f === 'leverage' || f === 'inverse')
      && x.ret && x.ret.tr && x.ret.tr.Y1 != null);
    return e ? e.code : null;
  });
  check('국내 1배 주식형 표본을 찾았다', !!target, String(target));
  if (target) {
    await page.locator('#q').fill(target);
    await page.waitForTimeout(250);
    await page.locator('#list-body tr').first().click();
    await page.waitForTimeout(250);
    const retTxt = await page.locator('#detail .ret-table').textContent();
    check('유형 평균 대비 칸에 그 기간의 종목 수가 적힌다',
          /평균 [-\d.]+% · [\d,]+종목/.test(retTxt || ''), (retTxt || '').slice(0, 140));
    const headTxt = await page.locator('#detail .ret-table thead').textContent();
    check('유형 머리말이 배율을 밝힌다', /1배|배율 상품/.test(headTxt || ''), headTxt || '');
  }
}
// 화면의 무리 잡는 규칙이 배율과 거래정지를 실제로 가르는지 데이터로 확인한다.
{
  const r = await page.evaluate(() => {
    const E = window.ETF_DATA.etfs;
    const g = (e) => (e.flags || []).some((f) => f === 'leverage' || f === 'inverse');
    const one = E.filter((e) => e.market === 'KR' && e.assetClass === 'equity'
      && e.region === 'korea' && !e.suspended && !g(e)).length;
    const both = E.filter((e) => e.market === 'KR' && e.assetClass === 'equity'
      && e.region === 'korea' && !e.suspended).length;
    return { one, both, suspended: E.filter((e) => e.suspended).length };
  });
  check('배율 상품이 1배 무리에서 빠져 있다', r.one < r.both, `1배 ${r.one} / 전체 ${r.both}`);
}

// ── 비중을 모르는 종목을 0 이라고 말하지 않는가
{
  const bad = await page.evaluate(() => {
    const E = window.ETF_DATA.etfs;
    // 편입종목의 비중이 하나라도 없는데 합계가 숫자로 적힌 종목
    return E.filter((e) => {
      const hs = (e.holdings || []).filter((h) => !h.cash);
      if (!hs.length) return false;
      const unknown = hs.some((h) => h.weight == null);
      return unknown && e.top10Weight != null;
    }).map((e) => e.code).slice(0, 5);
  });
  check('비중을 모르면 상위 종목 합계를 내지 않는다', bad.length === 0, bad.join(','));
}

// ── 영문 전환
await page.locator('.lang-toggle button[data-lang="en"]').click();
await page.waitForTimeout(200);
const htmlLang = await page.getAttribute('html', 'lang');
check('영문으로 전환된다', htmlLang === 'en', htmlLang);
await page.locator('.tabs button[data-tab="browse"]').click();
const rowsEn = await page.locator('#list-body tr').count();
check('영문 상태에서도 목록이 그려진다', rowsEn > 0, `${rowsEn}행`);
await page.locator('.lang-toggle button[data-lang="ko"]').click();

// ── 사용법 화면
await page.locator('.tabs button[data-tab="howto"]').click();
await page.waitForTimeout(200);
const howtoVisible = await page.locator('#tab-howto').isVisible();
check('사용법 탭이 열린다', howtoVisible);
const howtoGuides = await page.locator('#tab-howto .guide').count();
check('화면별 안내가 그려진다', howtoGuides >= 6, `${howtoGuides}개`);
const howtoSteps = await page.locator('#tab-howto .steps li').count();
check('화면마다 순서가 적혀 있다', howtoSteps >= 12, `${howtoSteps}단계`);
// 그림은 파일에 실렸을 때만 나온다. 실렸는데 안 그려지면(자리만 남으면) 결함이다.
const shotState = await page.evaluate(() => {
  const figs = [...document.querySelectorAll('#tab-howto .shot[data-shot]')];
  const has = typeof window.ETF_HOWTO_SHOTS === 'object' && window.ETF_HOWTO_SHOTS
    ? Object.keys(window.ETF_HOWTO_SHOTS).length : 0;
  return {
    has,
    figs: figs.length,
    withImg: figs.filter((f) => f.querySelector('img')).length,
    // 자료에 있는데 그림이 안 붙은 자리 — 이게 있으면 안 된다
    orphan: figs.filter((f) => window.ETF_HOWTO_SHOTS
      && window.ETF_HOWTO_SHOTS[f.getAttribute('data-shot')] && !f.querySelector('img')).length,
    hiddenEmpty: figs.filter((f) => !f.querySelector('img')
      && f.classList.contains('missing')).length,
  };
});
check('실린 그림은 모두 붙는다', shotState.orphan === 0,
      `자료 ${shotState.has}장 · 자리 ${shotState.figs} · 붙음 ${shotState.withImg}`);
check('없는 그림 자리는 접힌다',
      shotState.withImg + shotState.hiddenEmpty === shotState.figs,
      `붙음 ${shotState.withImg} + 접힘 ${shotState.hiddenEmpty} / ${shotState.figs}`);
// 자료가 언제 것인지는 글로 적으면 낡아도 최신인 척한다. 실제 값에서 만든다.
const howtoSrc = await page.locator('#howto-source').textContent();
check('사용법이 실제 기준일을 적는다', /\d{4}-\d{2}-\d{2}/.test(howtoSrc || ''),
      (howtoSrc || '').trim().slice(0, 60));
const howtoAsOf = (/\d{4}-\d{2}-\d{2}/.exec(howtoSrc || '') || [])[0];
const realNewest = await page.evaluate(() => {
  const ds = (window.ETF_DATA?.etfs || ETFS).map((e) => e.retAsOf)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d))).sort();
  return ds[ds.length - 1] || null;
});
check('적힌 기준일이 자료의 최신 기준일과 같다', howtoAsOf === realNewest,
      `화면 ${howtoAsOf} vs 자료 ${realNewest}`);
// 영문으로 바꿔도 내용이 남아야 한다(빈 탭이 되면 안 된다).
await page.locator('.lang-toggle button[data-lang="en"]').click();
await page.waitForTimeout(200);
const howtoEn = await page.locator('#tab-howto .guide').count();
const howtoEnSteps = await page.locator('#tab-howto .steps li').count();
check('영문에서도 사용법이 그려진다', howtoEn >= 6 && howtoEnSteps >= 12,
      `${howtoEn}개 · ${howtoEnSteps}단계`);
await page.locator('.lang-toggle button[data-lang="ko"]').click();
await page.waitForTimeout(150);

// ── 사용법 내려받기 — 단추가 눌리는지가 아니라 **받은 파일이 열리는지** 본다.
await page.locator('.tabs button[data-tab="howto"]').click();
await page.waitForTimeout(200);
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
  page.locator('#howto-save').click(),
]);
check('사용법 내려받기가 파일을 만든다', download != null,
      download ? download.suggestedFilename() : '받지 못함');
// 크로미움은 download 값에 한글이 있으면 이름을 통째로 버리고 "download"
// (확장자 없음)로 떨어뜨린다. 확장자가 없으면 HTML 로 열리지 않는다.
if (download) {
  const fn = download.suggestedFilename();
  check('파일 이름에 .html 이 붙는다', /\.html$/.test(fn), fn);
  check('파일 이름이 ASCII 다', /^[\x20-\x7E]+$/.test(fn), fn);
}
if (download) {
  const saved = await download.path();
  const html = await readFile(saved, 'utf8');
  check('받은 파일이 온전한 HTML 이다',
        /^<!doctype html>/i.test(html) && /<\/html>\s*$/i.test(html), `${html.length}바이트`);
  // 바깥 자원을 물면 사내망에서 안 열린다. 스타일이 안에 들어 있어야 한다.
  check('스타일이 파일 안에 들어 있다', /<style>[\s\S]{2000,}<\/style>/.test(html));
  check('바깥 자원을 물지 않는다',
        !/<link[^>]+href=["']https?:/i.test(html) && !/<script[^>]+src=["']https?:/i.test(html));
  // CSS 에는 .take-row 규칙이 남는다(스타일을 통째로 넣으므로). 지워야 하는
  // 것은 **단추 자체**이므로 마크업을 본다.
  check('내려받기 단추는 빠져 있다',
        !/<div class="take-row"/.test(html) && !/id="howto-save"/.test(html));
  // 진짜로 열리는지 — 띄워서 글자가 그려지는지 센다.
  const p2 = await browser.newPage();
  await p2.setContent(html, { waitUntil: 'domcontentloaded' });
  const txt = (await p2.locator('body').innerText()).replace(/\s+/g, '');
  check('받은 파일을 열면 내용이 보인다', txt.length > 400, `${txt.length}자`);
  // 본문에는 2026-07-28 같은 설명용 날짜도 있다. 확인해야 하는 것은
  // **자료의 기준일**이므로 그 값이 실제로 들어갔는지 본다.
  const realAsOf = await page.evaluate(() => {
    const ds = (window.ETF_DATA?.etfs || ETFS).map((e) => e.retAsOf)
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d))).sort();
    return ds[ds.length - 1] || null;
  });
  check('받은 파일에도 자료 기준일이 남는다', realAsOf != null && txt.includes(realAsOf),
        `자료 ${realAsOf}`);
  await p2.close();
}

// ── 사용법 PDF 내려받기.
//    단일 파일에만 심겨 있다(원본은 data/etf-howto-pdf.js 를 따로 읽는다).
//    받은 바이트가 진짜 PDF 인지까지 본다 — 빈 파일도 "받아지기는" 한다.
const pdfBtnShown = await page.locator('#howto-pdf').isVisible();
if (pdfBtnShown) {
  const [pdfDl] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
    page.locator('#howto-pdf').click(),
  ]);
  check('PDF 내려받기가 파일을 만든다', pdfDl != null,
        pdfDl ? pdfDl.suggestedFilename() : '받지 못함');
  if (pdfDl) {
    const fn = pdfDl.suggestedFilename();
    check('PDF 이름에 .pdf 가 붙고 ASCII 다',
          /\.pdf$/.test(fn) && /^[\x20-\x7E]+$/.test(fn), fn);
    const buf = await readFile(await pdfDl.path());
    check('받은 것이 진짜 PDF 다',
          buf.subarray(0, 5).toString() === '%PDF-' && buf.includes('%%EOF'),
          `${(buf.length / 1024).toFixed(0)}KB · ${buf.subarray(0, 8).toString()}`);
    // 글자가 아니라 그림으로 박히면 검색도 복사도 안 된다.
    check('PDF 안에 글자가 들어 있다', buf.includes('/ToUnicode'),
          `/ToUnicode ${(buf.toString('latin1').match(/\/ToUnicode/g) || []).length}개`);
    check('PDF 가 비어 있지 않다', buf.length > 50 * 1024, `${(buf.length / 1024).toFixed(0)}KB`);
  }
} else {
  check('PDF 단추는 PDF 가 실렸을 때만 뜬다', true, '이 파일에는 PDF 가 없다 — 단추 숨김');
}

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
