#!/usr/bin/env node
/**
 * 펀드 화면 연기 시험 — 실제 브라우저로 열어 본다.
 *
 *   node scripts/test_fund_page.mjs            # fund.html (분리 파일)
 *   node scripts/test_fund_page.mjs --built    # fund-search.html (단일 파일)
 *
 * 화면을 그리는 코드는 눈으로 못 보면 틀린 줄도 모른다. 표가 비어 있어도,
 * 콘솔에 오류가 나도 페이지는 "열리기는" 하기 때문이다. 그래서 열어서
 * 눌러 보고, 콘솔 오류가 하나라도 있으면 실패로 친다.
 *
 * 여기서 특히 지켜보는 것은 **없는 것을 0 이라고 말하지 않는가** 이다.
 * ETF 화면에서 `Number(null) === 0` 때문에 731종목이 "비중 0%" 라는 거짓을
 * 말했다. 같은 자리가 펀드에도 있다 — 채권형·MMF 는 보유종목이 아예 없고,
 * 계단이 있는 펀드는 수익률 칸이 비어 있다.
 */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const BUILT = process.argv.includes('--built');
const PAGE = BUILT ? '/fund-search.html' : '/fund.html';
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
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(base + PAGE, { waitUntil: 'networkidle' });

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

console.log(`\n=== ${PAGE} ===\n`);

// ── 목록
const rows = await page.locator('#list-body tr').count();
check('목록에 행이 있다', rows > 0, `${rows}행`);
const countText = await page.locator('#result-count').textContent();
check('결과 개수가 표시된다', /\d/.test(countText || ''), countText);

for (const id of ['f-region', 'f-asset', 'f-type', 'f-company', 'f-aum']) {
  const n = await page.locator(`#${id} option`).count();
  check(`${id} 선택지가 채워졌다`, n > 1, `${n}개`);
}

// ── 범위: 투자 지역으로 가르는 것이 이 화면의 요구다
const regionOpts = await page.locator('#f-region option').allTextContents();
check('투자 지역이 국내·해외로 갈린다',
  regionOpts.some((o) => /국내/.test(o)) && regionOpts.some((o) => /해외/.test(o)),
  regionOpts.join(' | '));

// ── 상세
await page.locator('#list-body tr').first().click();
await page.waitForTimeout(150);
const retRows = await page.locator('#detail .ret-table tbody tr').count();
check('상세에 기간수익률 표가 있다', retRows > 0, `${retRows}행`);

const retHeads = await page.locator('#detail .ret-table thead th').allTextContents();
check('기간수익률 표가 5열이다', retHeads.length === 5, retHeads.map((x) => x.trim()).join(' | '));
check('벤치마크 대비 열이 있다', retHeads.some((h) => /벤치마크|benchmark/i.test(h)));
check('순위 열이 있다', retHeads.some((h) => /순위|Rank/i.test(h)));
check('동일 유형 안에서 순위를 매긴다고 밝힌다',
  retHeads.some((h) => /동일 유형|in category/i.test(h)));
check('유형 평균 대비 열이 있다', retHeads.some((h) => /유형 평균|category avg/i.test(h)));

// 순위는 백분율 하나. 1~100 밖으로 나가면 계산이 깨진 것이다.
const outOfRange = await page.evaluate(() => {
  const bad = [];
  document.querySelectorAll('#detail .rank-pct').forEach((n) => {
    const v = parseInt(n.textContent, 10);
    if (!(v >= 1 && v <= 100)) bad.push(n.textContent);
  });
  return bad;
});
check('백분율 순위가 1~100 안에 있다', outOfRange.length === 0, outOfRange.join(' | ') || '없음');

const peerNote = await page.locator('#detail .ret-table').first()
  .evaluate((n) => (n.parentElement.textContent || ''));
check('유형이 원천에서 온 것임을 밝힌다',
  /원천이 부여한 유형|assigned by the source/.test(
    await page.locator('#detail').textContent()), '');

// ── 순위·유형평균이 실제로 계산되는가 (모집단이 큰 유형을 골라서)
await page.selectOption('#f-type', { index: 1 });
await page.waitForTimeout(150);
await page.locator('#list-body tr').first().click();
await page.waitForTimeout(150);
const rankTxt = await page.locator('#detail .rank-pct').first().textContent().catch(() => null);
if (rankTxt != null) {
  check('백분율 순위가 계산된다', /\d+%/.test(rankTxt), rankTxt.trim());
  const rankRaw = await page.locator('#detail .rank-raw').first().textContent();
  check('순위 칸에 동일 유형 개수가 적힌다', /\d/.test(rankRaw || ''), (rankRaw || '').trim());
}
await page.selectOption('#f-type', '');
await page.waitForTimeout(120);

// ── 없는 것을 0 이라고 말하지 않는가 ─────────────────────────────────────
// 이 화면이 지켜야 하는 첫째 약속이다.
const lies = await page.evaluate(() => {
  const D = window.FUND_DATA || {};
  const out = { weightZero: [], top10OnUnknown: [], retZero: [], benchOrphan: [] };
  for (const f of D.funds || []) {
    for (const h of f.holdings || []) {
      // 원천이 비중을 안 준 종목을 0 으로 적어 두면 "안 담았다" 는 거짓이 된다.
      //
      // 여기서 보는 것은 **수집기의 반올림이 0 을 만들지 않았는가** 이다.
      // 원천은 0.000000045 같은 아주 작은 진짜 비중을 준다. 예전에 이걸
      // `toFixed(4)` 로 뭉개 정확히 0 으로 저장했고, 화면에 "0.00%" 로
      // 찍혔다 — 담은 것을 안 담았다고 말한 셈이다.
      //
      // 이제 수집기는 0 이 아닌 값을 0 으로 만들지 않는다. 그래서 저장된 0 은
      // **원천이 정말 0 을 준 경우뿐**이어야 한다. 아주 작은 비중이 있는
      // 펀드에서 0 이 같이 나오면 반올림이 다시 새는 것이므로 잡는다.
      if (h.weight === 0) {
        const tiny = (f.holdings || []).some(function (x) {
          return x.weight != null && x.weight !== 0 && Math.abs(x.weight) < 0.001;
        });
        if (tiny) out.weightZero.push(f.code + ':' + (h.name || ''));
      }
    }
    const hs = (f.holdings || []).filter((h) => !h.cash);
    if (hs.length && hs.some((h) => h.weight == null) && f.totalWeight != null) {
      out.top10OnUnknown.push(f.code);
    }
    // 검산에서 버린 기간이 값 0 으로 남아 있으면 안 된다.
    for (const d of f.retDropped || []) {
      if (f.ret && f.ret[d.period] != null) out.retZero.push(f.code + ':' + d.period);
    }
    // 펀드 값 없이 벤치마크만 있으면 견줄 수 없는 두 칸이 나란히 선다.
    for (const k of Object.keys(f.retBenchmark || {})) {
      if (!f.ret || f.ret[k] == null) out.benchOrphan.push(f.code + ':' + k);
    }
  }
  return out;
});
check('아주 작은 비중을 0 으로 뭉개지 않는다', lies.weightZero.length === 0,
  lies.weightZero.slice(0, 3).join(', ') || '없음');

// 화면이 실제로 무엇을 찍는가. 저장된 값이 맞아도 렌더링에서 다시 뭉개질 수
// 있으므로, 눈에 보이는 글자를 본다 — 0 이 아닌 비중이 "0.00%" 로 찍히면
// 담은 것을 안 담았다고 말하는 것이다.
{
  const tinyFund = await page.evaluate(() => {
    const D = window.FUND_DATA || {};
    const f = (D.funds || []).find((x) => (x.holdings || []).some(
      (h) => h.weight != null && h.weight !== 0 && Math.abs(h.weight) < 0.005));
    return f ? f.id : null;
  });
  if (tinyFund) {
    await page.locator('.tabs button[data-tab="browse"]').click();
    await page.waitForTimeout(100);
    const shown = await page.evaluate((id) => {
      const D = window.FUND_DATA || {};
      const f = (D.funds || []).find((x) => x.id === id);
      const tiny = (f.holdings || []).filter(
        (h) => h.weight != null && h.weight !== 0 && Math.abs(h.weight) < 0.005);
      return { n: tiny.length, sample: tiny.slice(0, 3).map((h) => h.weight) };
    }, tinyFund);
    check('아주 작은 비중이 데이터에 남아 있다', shown.n > 0,
      `${shown.n}종목 · 예: ${shown.sample.join(', ')}`);
  }
  // 렌더링 규칙 자체를 확인한다.
  const rendered = await page.evaluate(() => {
    // 페이지의 fmtWeight 를 그대로 부른다.
    return [0, 0.0000045, 0.004, 1.23].map((w) => window.fmtWeight
      ? window.fmtWeight(w) : String(w));
  });
  check('0 이 아닌 아주 작은 비중을 0.00% 로 찍지 않는다',
    !/^0\.00%$/.test(rendered[1]) && !/^0\.00%$/.test(rendered[2]),
    rendered.join(' | '));
}
check('비중을 모르면 합계를 내지 않는다', lies.top10OnUnknown.length === 0,
  lies.top10OnUnknown.slice(0, 3).join(', ') || '없음');
check('버린 수익률이 값으로 남아 있지 않다', lies.retZero.length === 0,
  lies.retZero.slice(0, 3).join(', ') || '없음');
check('벤치마크만 홀로 남은 칸이 없다', lies.benchOrphan.length === 0,
  lies.benchOrphan.slice(0, 3).join(', ') || '없음');

// 보유종목이 없는 펀드는 **왜 없는지** 말해야 한다.
const noHold = await page.evaluate(() => {
  const D = window.FUND_DATA || {};
  const f = (D.funds || []).find((x) => !x.holdingCount);
  return f ? f.id : null;
});
if (noHold) {
  await page.evaluate((id) => {
    const row = document.querySelector('[data-id="' + id + '"]');
    if (row) row.click();
  }, noHold);
  await page.waitForTimeout(150);
  const emptyTxt = await page.locator('#detail .empty').first().textContent().catch(() => '');
  check('보유종목이 없으면 까닭을 말한다',
    /원천|source/.test(emptyTxt || ''), (emptyTxt || '').trim().slice(0, 60));
}

// ── 비교
await page.locator('.tabs button[data-tab="browse"]').click();
await page.waitForTimeout(100);
// 보유종목이 있는 펀드만 담아야 겹침이 계산된다.
await page.locator('#f-hold').check();
await page.waitForTimeout(150);
const pickable = await page.locator('#list-body button[data-pick]').count();
const toPick = Math.min(4, pickable);
for (let i = 0; i < toPick; i += 1) {
  await page.locator('#list-body button[data-pick]').nth(i).click();
  await page.waitForTimeout(60);
}
await page.locator('.tabs button[data-tab="compare"]').click();
await page.waitForTimeout(200);
const overlapCells = await page.locator('#compare-body .overlap-cell, #compare-body td.unw').count();
check('중복도 표가 계산된다', overlapCells > 0, `${overlapCells}칸`);
const matrixRows = await page.locator('#compare-body .matrix tbody tr').count();
check('종목 매트릭스가 그려진다', matrixRows >= 0, `${matrixRows}종목`);
if (matrixRows > 0) {
  const stickyHead = await page.locator('#compare-body .matrix thead th').first()
    .evaluate((n) => getComputedStyle(n).position);
  check('매트릭스 머리행이 고정된다', stickyHead === 'sticky', stickyHead);
}

// ── 역조회
await page.locator('.tabs button[data-tab="reverse"]').click();
await page.waitForTimeout(100);
const firstStock = await page.evaluate(() => {
  const D = window.FUND_DATA || {};
  for (const f of D.funds || []) {
    for (const h of f.holdings || []) if (h.name) return h.name;
  }
  return null;
});
if (firstStock) {
  await page.fill('#rq', firstStock.slice(0, 6));
  await page.waitForTimeout(200);
  const hits = await page.locator('#reverse-body tbody tr').count();
  check(`"${firstStock.slice(0, 6)}" 역조회 결과가 나온다`, hits > 0, `${hits}건`);
}

// ── 랭킹
await page.locator('.tabs button[data-tab="rank"]').click();
await page.waitForTimeout(200);
const rankTables = await page.locator('#rank-body table').count();
check('랭킹 표가 그려진다', rankTables >= 2, `${rankTables}개`);

// ── 수익률 검산 탭
await page.locator('.tabs button[data-tab="basis"]').click();
await page.waitForTimeout(200);
const basisTxt = await page.locator('#basis-body').textContent();
check('검산 탭이 무엇을 왜 비웠는지 설명한다',
  /기준가|base-price/.test(basisTxt || ''), '');
check('검산 탭이 총보수 없음을 밝힌다',
  /총보수|expense ratio/i.test(basisTxt || ''), '');
const stepStat = await page.locator('#basis-body .card .stat').count();
check('검산 탭에 집계가 있다', stepStat >= 3, `${stepStat}개`);

// ── 총보수를 지어내지 않는가
const feeShown = await page.evaluate(() => {
  const txt = document.body.innerText;
  // 화면 어디에도 "총보수 0.000%" 같은 지어낸 값이 없어야 한다.
  return /총보수[^\n]*0\.000\s*%/.test(txt);
});
check('총보수를 0 으로 지어내지 않는다', !feeShown);

// ── 영문 전환
await page.locator('.lang-toggle button[data-lang="en"]').click();
await page.waitForTimeout(200);
const htmlLang = await page.getAttribute('html', 'lang');
check('영문으로 전환된다', htmlLang === 'en', htmlLang);
await page.locator('.tabs button[data-tab="browse"]').click();
await page.waitForTimeout(150);
const rowsEn = await page.locator('#list-body tr').count();
check('영문 상태에서도 목록이 그려진다', rowsEn > 0, `${rowsEn}행`);
await page.locator('.lang-toggle button[data-lang="ko"]').click();
await page.waitForTimeout(150);

// ── 가로 스크롤이 생기지 않는가 (표는 자기 상자 안에서 스크롤해야 한다)
for (const width of [1440, 768, 390]) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${width}px 에서 가로 스크롤이 없다`, overflow <= 1, `넘침 ${overflow}px`);
}

// ── 콘솔 오류
check('콘솔 오류가 없다', errors.length === 0, errors.slice(0, 3).join(' | '));

await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator('.tabs button[data-tab="browse"]').click();
await page.waitForTimeout(200);
await page.screenshot({ path: 'tools/discovery/fund_page.png', fullPage: false });

await browser.close();
server.close();

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} 통과`);
if (failed.length) {
  console.log('\n실패:');
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`);
}
process.exit(failed.length ? 1 : 0);
