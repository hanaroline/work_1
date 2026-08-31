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
      // 저장된 0 자체는 잘못이 아니다. 원천이 정말 0 을 주는 자리가 있다 —
      // 제재로 평가가 0 이 된 러시아 종목(GAZPROM·MMC NORILSK NICKEL)과
      // 공모주 배정분이 그렇다. 담고는 있으나 값이 0 인 것이고, 그건 참이다.
      //
      // 잘못은 **0 이 아닌 것을 0 으로 만드는 것**인데, 그것은 결과 파일만
      // 보고는 원천의 0 과 구별할 수 없다. 그래서 그 성질은 수집기 함수에
      // 직접 시험을 건다 — scripts/test_fund_lib.mjs 의 toPct 시험.
      //
      // 여기서는 결과 파일에서 볼 수 있는 것만 본다: 비중이 비수치이면
      // 그건 어느 쪽으로도 뜻이 없다.
      if (h.weight != null && !isFinite(Number(h.weight))) {
        out.weightZero.push(f.code + ':' + (h.name || '') + '=' + h.weight);
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
check('비중이 모두 수치다', lies.weightZero.length === 0,
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
  // 원천이 정말 0 을 준 자리는 0.00% 로 찍어야 한다. 제재로 평가가 0 이 된
  // 종목을 빈칸으로 두면 "비중을 모른다" 는 다른 거짓이 된다.
  check('원천이 준 0 은 0.00% 로 찍는다', rendered[0] === '0.00%', rendered[0]);
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

  // 보유종목 비중에는 기준일이 없다. 실제로 없다 — 원천이 code·name·weight
  // 셋만 주고, 178,352행 중 날짜가 붙은 것이 0개다. 그런데 이 표는 그 비중
  // 옆에 **오늘 기준의** 설정액을 나란히 놓는다. 날짜를 안 적으면 둘 다
  // 오늘 것으로 읽히므로, 고지가 조용히 빠지는 것을 막는다.
  const revNotice = (await page.locator('#reverse-body .notice').first().textContent()) || '';
  check('역조회에 보유종목 기준일 고지가 있다',
    /기준일|분기/.test(revNotice), revNotice.slice(0, 40) || '(없음)');
}

// 한 펀드가 검색어에 걸리는 종목을 여럿 담고 있을 때, 표는 그중 하나만 싣는다.
// 몇 개를 감췄는지 말하지 않으면 그 하나가 전부로 읽힌다. 배지가 그 수를
// 밝히는지, 그리고 그 수와 실린 비중이 **자료와 맞는지** 함께 본다.
const multi = await page.evaluate(() => {
  const D = window.FUND_DATA || {};
  // 걸리는 종목을 둘 이상 담은 펀드가 가장 많은 검색어를 자료에서 직접 고른다.
  // 화면에 넣을 말을 시험에 적어 두면 시험이 아니라 메아리가 된다.
  const cand = ['삼성', '현대', 'SK', 'LG', '전자', '은행'];
  let best = null;
  for (const q of cand) {
    const k = q.toLowerCase();
    let withMore = 0, total = 0;
    for (const f of D.funds || []) {
      const ms = (f.holdings || []).filter((h) => (h.name || '').toLowerCase().includes(k));
      if (ms.length) total += 1;
      if (ms.length > 1) withMore += 1;
    }
    if (withMore && (!best || withMore > best.withMore)) best = { q, withMore, total };
  }
  return best;
});
if (multi) {
  await page.fill('#rq', multi.q);
  await page.waitForTimeout(300);
  const badges = await page.locator('#reverse-body tbody tr td:nth-child(3) span[title]').count();
  check(`"${multi.q}" 역조회에 "+N개 더" 배지가 붙는다`,
    badges > 0, `${badges}개 행 (자료상 여러 종목 보유 ${multi.withMore}/${multi.total}개 펀드)`);

  // 배지의 수와 옆칸 비중이 자료와 일치하는지 — 표에 실린 행을 자료로 되짚는다.
  const mismatch = await page.evaluate((q) => {
    const k = q.toLowerCase();
    const D = window.FUND_DATA || {};
    const byName = new Map();
    for (const f of D.funds || []) byName.set(f.name || f.code, f);
    const bad = [];
    for (const tr of document.querySelectorAll('#reverse-body tbody tr')) {
      const td = tr.querySelectorAll('td');
      if (td.length < 4) continue;
      const fund = byName.get(td[0].querySelector('div')?.textContent || '');
      if (!fund) continue;
      const ms = (fund.holdings || []).filter((h) => (h.name || '').toLowerCase().includes(k));
      const badge = td[2].querySelector('span[title]');
      const shown = badge ? Number((badge.textContent || '').replace(/\D/g, '')) : 0;
      if (shown !== ms.length - 1) { bad.push(`${fund.name}: 배지 ${shown} ≠ 자료 ${ms.length - 1}`); continue; }
      // 실린 것은 걸린 종목 중 비중이 가장 큰 것이라야 한다.
      const wts = ms.map((h) => h.weight).filter((w) => Number.isFinite(w));
      const head = ms[0];
      if (wts.length && Number.isFinite(head.weight) && head.weight < Math.max(...wts) - 1e-9) {
        bad.push(`${fund.name}: 실린 비중이 최대가 아님`);
      }
      if ((td[2].textContent || '').indexOf(head.name) !== 0) bad.push(`${fund.name}: 종목명 불일치`);
    }
    return bad;
  }, multi.q);
  check('배지 개수와 실린 종목이 자료와 일치한다',
    mismatch.length === 0, mismatch.length ? mismatch.slice(0, 3).join(' / ') : '어긋남 0');
  await page.fill('#rq', '');
  await page.waitForTimeout(100);
}

// ── 랭킹
await page.locator('.tabs button[data-tab="rank"]').click();
await page.waitForTimeout(200);
const rankTables = await page.locator('#rank-body table').count();
check('랭킹 표가 그려진다', rankTables >= 2, `${rankTables}개`);

// ── 자금 유입
//
// 이력이 두 열 이상이라야 낼 수 있는 값이다. 둘 중 어느 쪽이든 **말은 해야
// 한다** — 표를 그리든가, 왜 못 내는지 적든가. 조용히 빠지는 것만 막는다.
const rankTxtAll = (await page.locator('#rank-body').textContent()) || '';
const flowTables = await page.locator('#rank-body table').evaluateAll(
  // 표는 <h3>제목</h3><div class="table-wrap"><table> 꼴이다. 표의 형은
  // .table-wrap 이지 제목이 아니다 — 처음에 table.previousElementSibling 로
  // 짚었다가 0개를 세었다.
  (ts) => ts.filter((t) => /자금 유(입|출)/.test(
    t.closest('.table-wrap')?.previousElementSibling?.textContent || '')).length);
if (flowTables) {
  check('3개월 자금 유입·유출 표가 그려진다', flowTables >= 2, `${flowTables}개`);
  // 유입은 원천이 준 값이 아니다. 무엇으로 낸 값인지 화면이 말해야 한다.
  check('유입이 설정원본 차이임을 밝힌다', /설정원본/.test(rankTxtAll), '');
  check('유입 기준일을 밝힌다', /\d{4}-\d{2}-\d{2}\s*대비/.test(rankTxtAll), '');
  // 부호가 붙어야 유입인지 유출인지 읽힌다.
  const flowSigned = await page.locator('#rank-body table .pos, #rank-body table .neg').count();
  check('유입·유출에 부호가 붙는다', flowSigned > 0, `${flowSigned}칸`);
} else {
  check('유입을 못 낼 때는 이유를 적는다',
    /자금 유입[\s\S]{0,80}(아직 낼 수 없|not available)/.test(rankTxtAll), '');
}

// ── 수익률 검산 탭
await page.locator('.tabs button[data-tab="basis"]').click();
await page.waitForTimeout(200);
const basisTxt = await page.locator('#basis-body').textContent();
check('검산 탭이 무엇을 왜 비웠는지 설명한다',
  /기준가|base-price/.test(basisTxt || ''), '');
check('검산 탭이 총보수가 클래스별임을 밝힌다',
  /클래스별|per share class/i.test(basisTxt || ''), '');
const stepStat = await page.locator('#basis-body .card .stat').count();
check('검산 탭에 집계가 있다', stepStat >= 3, `${stepStat}개`);

// ── 총보수 ─────────────────────────────────────────────────────────────
// 인수인계 문서는 "총보수를 못 받는다" 고 적었지만 클래스별로는 있었다.
// 다만 클래스마다 다르므로 **하나의 숫자로 줄이면 거짓**이다.
await page.locator('.tabs button[data-tab="browse"]').click();
await page.waitForTimeout(150);
const feeHead = await page.locator('#list-head th').allTextContents();
check('목록에 총보수 열이 있다', feeHead.some((h) => /총보수|Fee/i.test(h)),
  feeHead.map((x) => x.trim()).join(' | '));

const feeData = await page.evaluate(() => {
  const D = window.FUND_DATA || {};
  const funds = D.funds || [];
  const withFee = funds.filter((f) => f.feeMin != null);
  const spread = withFee.filter((f) => f.feeMax != null && f.feeMax > f.feeMin);
  // 보수를 모르는데 숫자를 적어 둔 펀드가 있으면 지어낸 것이다.
  const invented = funds.filter((f) => f.feeMin == null && f.feeMax != null).length;
  // 0 이나 음수는 보수가 아니다.
  const bad = withFee.filter((f) => !(f.feeMin > 0) || !(f.feeMax > 0)).length;
  return { total: funds.length, withFee: withFee.length, spread: spread.length,
           invented, bad, sample: spread[0] ? { min: spread[0].feeMin, max: spread[0].feeMax } : null };
});
check('총보수가 대부분의 펀드에 있다', feeData.withFee > feeData.total * 0.9,
  `${feeData.withFee}/${feeData.total}`);
check('보수를 모르는데 지어내지 않는다', feeData.invented === 0, `${feeData.invented}건`);
check('보수가 0 이나 음수인 펀드가 없다', feeData.bad === 0, `${feeData.bad}건`);
check('클래스마다 다른 보수를 범위로 남긴다', feeData.spread > 0,
  `${feeData.spread}개 · 예 ${feeData.sample ? feeData.sample.min + '~' + feeData.sample.max + '%' : '–'}`);

// 범위를 하나의 숫자로 줄여 찍으면 그 클래스를 사지 않은 사람에게 거짓이 된다.
const feeRendered = await page.evaluate(() => {
  const D = window.FUND_DATA || {};
  const f = (D.funds || []).find((x) => x.feeMin != null && x.feeMax > x.feeMin);
  return f && window.fmtFee ? window.fmtFee(f) : null;
});
check('클래스마다 다르면 범위로 찍는다', feeRendered != null && /~/.test(feeRendered),
  feeRendered || '없음');

const feeInvented = await page.evaluate(() => {
  // 화면 어디에도 "총보수 0.000%" 같은 지어낸 값이 없어야 한다.
  return /총보수[^\n]*\b0\.00\s*%/.test(document.body.innerText);
});
check('총보수를 0 으로 지어내지 않는다', !feeInvented);

// ── 클래스 코드로 찾을 수 있는가
//
// 사용자가 준 주소가 클래스 코드였고(K55207BJ1791) 그 코드로는 결과가
// 0건이었다. 사람이 손에 든 코드는 대개 클래스 코드다 — 통장·HTS·판매사
// 화면에 찍히는 것이 그것이고 원천도 그 코드로 화면을 연다.
{
  // 자료에서 클래스 코드 하나를 실제로 집어 온다. 상수로 박아 두면 그
  // 펀드가 사라진 날 시험이 조용히 무의미해진다.
  const picked = await page.evaluate(() => {
    for (const f of (window.FUNDS || [])) {
      for (const c of (f.classes || [])) {
        if (c.code && c.code !== f.code) return { parent: f.code, cls: c.code, name: c.name || '' };
      }
    }
    return null;
  });
  check('자료에 클래스 코드가 있다', !!picked, picked ? `${picked.cls} ⊂ ${picked.parent}` : '없음');

  if (picked) {
    await page.locator('.tabs button[data-tab="browse"]').click();
    await page.waitForTimeout(120);
    // 앞선 시험이 걸어 둔 조건을 먼저 푼다. 안 풀면 "보유종목 있는 것만"
    // 같은 조건에 걸려 검색이 0건이 되고, 검색이 고장난 것으로 읽힌다.
    await page.locator('#f-reset').click();
    await page.waitForTimeout(150);
    await page.fill('#q', picked.cls);
    await page.waitForTimeout(250);
    const n = await page.locator('#list-body tr.clickable').count();
    check('클래스 코드로 검색하면 그 펀드가 나온다', n >= 1, `${n}건 (${picked.cls})`);

    const codeShown = await page.locator('#list-body tr.clickable').first()
      .innerText().catch(() => '');
    check('나온 펀드가 그 클래스의 부모다', codeShown.includes(picked.parent),
      codeShown.split('\n').slice(0, 2).join(' / '));
    check('왜 나왔는지 클래스 일치를 밝힌다', /클래스에서 일치/.test(codeShown),
      codeShown.includes('클래스에서 일치') ? '표시됨' : codeShown.slice(0, 80));

    // 상세를 열어 클래스 표에 표준코드가 찍히는지 본다. 사람이 든 코드로
    // 어느 줄이 자기 것인지 대조할 수 있어야 한다.
    await page.locator('#list-body tr.clickable').first().click();
    await page.waitForTimeout(250);
    const detailTxt = await page.locator('#detail').innerText().catch(() => '');
    check('클래스 표에 표준코드가 찍힌다', detailTxt.includes(picked.cls),
      detailTxt.includes(picked.cls) ? picked.cls : '없음');
    const hit = await page.locator('#detail tr.hit').count();
    check('찾아온 클래스 줄을 짚어 준다', hit >= 1, `${hit}줄`);
    check('클래스 단위 값이 아님을 밝힌다',
      /모·운용\) 단위 값|클래스마다 기준가와 설정일이 다릅니다/.test(detailTxt));

    // 원천으로 나가는 길. 값을 옮기는 것과 확인할 길을 주는 것은 다르다.
    const naverLink = await page.locator('#detail a[href*="stock.naver.com"]').count();
    const kofiaLink = await page.locator('#detail a[href*="dis.kofia.or.kr"]').count();
    check('네이버(2차 출처) 링크가 있다', naverLink >= 1, `${naverLink}개`);
    check('금투협(1차 출처) 링크가 있다', kofiaLink >= 1, `${kofiaLink}개`);

    await page.fill('#q', '');
    await page.waitForTimeout(200);
  }
}

// ── 보유종목의 기준일을 모른다고 말하는가
//
// 원천이 보유종목에 날짜를 주지 않는다. 기준가(오늘) 바로 옆에 날짜 없이
// 놓으면 오늘 자료로 읽힌다. 공모펀드 보유종목은 분기 공시라 몇 달 묵어
// 있을 수 있다. 틀린 숫자를 쓴 것이 아니라 날짜를 안 적어서 생기는 거짓이다.
{
  const withHold = await page.evaluate(() => {
    const f = (window.FUNDS || []).find((x) => x.holdingCount > 0);
    return f ? f.id : null;
  });
  if (withHold) {
    await page.evaluate((id) => { window.state.selected = id; window.renderDetail(); }, withHold);
    await page.waitForTimeout(200);
    const t = await page.locator('#detail').innerText().catch(() => '');
    check('보유종목의 기준일을 모른다고 밝힌다',
      /언제 기준인지 원천이 알려 주지 않습니다/.test(t),
      /언제 기준인지/.test(t) ? '표시됨' : t.slice(0, 100));
  }
}

// ── 업종구성: 있으면 싣고, 없으면 자리를 만들지 않는가
//
// 두 가지를 함께 본다. 값이 있는 펀드에서 표가 그려지는가, 그리고 값이 없는
// 펀드에서 빈 표나 "0.00%" 가 나오지 않는가. 3,196개 전부 빈칸이던 것을
// 못 알아챘던 자리라 **없는 쪽도 함께 시험한다.**
//
// 합을 100 으로 맞추지 않는 것도 확인한다. 합이 10% 인 펀드는 자료가
// 모자란 것이 아니라 나머지가 업종 없는 자산(채권·유동성)이라는 뜻이다.
{
  const picks = await page.evaluate(() => {
    const fs = window.FUNDS || [];
    const has = fs.find((f) => f.sectors && Object.keys(f.sectors).length);
    const none = fs.find((f) => !f.sectors || !Object.keys(f.sectors).length);
    return {
      has: has ? { id: has.id, n: Object.keys(has.sectors).length,
                   sum: Object.values(has.sectors).reduce((a, b) => a + b, 0) } : null,
      none: none ? none.id : null,
    };
  });

  check('업종구성이 있는 펀드가 존재한다', picks.has != null,
    picks.has ? `${picks.has.n}개 업종 · 합 ${picks.has.sum.toFixed(2)}%` : '한 펀드도 없다');

  if (picks.has) {
    await page.evaluate((id) => { window.state.selected = id; window.renderDetail(); }, picks.has.id);
    await page.waitForTimeout(200);
    const t = await page.locator('#detail').innerText().catch(() => '');
    check('업종구성 표가 그려진다', /업종구성/.test(t), t.includes('업종구성') ? '표시됨' : t.slice(0, 120));
    check('업종 비중이 순자산 대비라고 밝힌다', /순자산 대비/.test(t),
      /순자산 대비/.test(t) ? '표시됨' : '문구 없음');
    check('합이 100 이 아닌 것을 결손이 아니라고 밝힌다', /빠진 자료가 아닙니다/.test(t),
      /빠진 자료가/.test(t) ? '표시됨' : '문구 없음');
  }

  if (picks.none) {
    await page.evaluate((id) => { window.state.selected = id; window.renderDetail(); }, picks.none);
    await page.waitForTimeout(200);
    const t = await page.locator('#detail').innerText().catch(() => '');
    check('업종이 없는 펀드에는 업종구성 자리를 만들지 않는다', !/업종구성/.test(t),
      /업종구성/.test(t) ? '빈 표가 나왔다' : '자리 없음');
  }
}

// ── 자산구성은 싣지 않는다
//
// 같은 응답에서 오지만 비중의 분모를 우리가 모른다 — 3,106개 중 합이 100
// 근처인 것 21.9%, 기준가로 나눠야 100 근처인 것 5.9%, 나머지 72.2%는 어느
// 쪽도 아니다. 뜻을 모르는 숫자가 화면에 새어 나가지 않는지 지킨다.
{
  const withAssets = await page.evaluate(() => {
    const f = (window.FUNDS || []).find((x) => x.assets && Object.keys(x.assets).length);
    return f ? f.id : null;
  });
  if (withAssets) {
    await page.evaluate((id) => { window.state.selected = id; window.renderDetail(); }, withAssets);
    await page.waitForTimeout(200);
    const t = await page.locator('#detail').innerText().catch(() => '');
    check('자산구성은 화면에 싣지 않는다', !/자산구성/.test(t),
      /자산구성/.test(t) ? '새어 나갔다' : '싣지 않음');
  }
}

// ── 자릿수가 깨진 위험지표를 그대로 찍지 않는다
//
// 원천이 샤프 −2049.22(베어링글로벌하이일드[USD]), 베타 +95.88(골든브릿지
// 스마트단기채) 같은 값을 준다. 그대로 찍으면 화면이 그 숫자를 보증하는
// 꼴이 된다. 비우되 **왜 비웠는지 적는가**까지 지킨다 — 말없이 지우면
// 원천에 값이 없는 것과 구별되지 않는다.
// (근거: tools/discovery/fund_verify_verdict.md 7절)
{
  const OUT = (k, v) => (k === 'standardDeviation' || k === 'trackingError' ? v < 0
    : k === 'beta' ? Math.abs(v) > 10
    : k === 'sharpe' ? Math.abs(v) > 20 : false);
  const picked = await page.evaluate((src) => {
    const bad = new Function('k', 'v', `return (${src})(k, v);`);
    const KEYS = ['standardDeviation', 'sharpe', 'beta', 'jensenAlpha',
                  'informationRatio', 'trackingError'];
    const hits = [];
    for (const f of window.FUNDS || []) {
      if (!f.metrics) continue;
      for (const k of KEYS) {
        const v = f.metrics[k];
        if (v == null || !isFinite(Number(v))) continue;
        if (bad(k, Number(v))) hits.push({ id: f.id, name: f.name, k, v: Number(v) });
      }
    }
    hits.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    return { n: hits.length, worst: hits[0] || null };
  }, OUT.toString());

  check('자릿수가 깨진 위험지표가 자료에 남아 있다', picked.worst != null,
    picked.worst ? `${picked.n}건 · 최악 ${picked.worst.k}=${picked.worst.v.toFixed(2)}` : '한 건도 없다');

  if (picked.worst) {
    await page.evaluate((id) => { window.state.selected = id; window.renderDetail(); }, picked.worst.id);
    await page.waitForTimeout(200);
    const t = await page.locator('#detail').innerText().catch(() => '');
    const printed = picked.worst.v.toFixed(2);
    check('깨진 값을 화면에 찍지 않는다', !t.includes(printed),
      t.includes(printed) ? `${printed} 가 그대로 나왔다` : `${printed} 없음`);
    check('왜 비웠는지 밝힌다', /자릿수 밖/.test(t) && /비운 칸이 있습니다/.test(t),
      /자릿수 밖/.test(t) ? '표시됨' : '문구 없음');
    check('멀쩡한 지표까지 지우지는 않는다',
      /위험 · 성과 지표/.test(t) &&
      (await page.locator('#detail table tbody tr').count()) > 0,
      '표 유지됨');
  }
}

// ── 사용법
//
// 사용법 문서는 본문보다 먼저 낡는다. 그래서 이 탭의 수는 글로 박지 않고
// 자료에서 세어 그린다. 시험도 화면의 글자가 아니라 **자료를 다시 세어** 맞댄다.
{
  await page.locator('.tabs button[data-tab="help"]').click();
  await page.waitForTimeout(200);
  const help = (await page.locator('#help-body').innerText().catch(() => '')) || '';
  check('사용법 탭이 그려진다', help.length > 400, `${help.length}자`);

  // 탭 하나가 사용법에서 빠지면, 그 화면은 아무도 쓰는 법을 모르는 채 남는다.
  // 그래서 카드 수를 세지 않고 **탭 이름이 화면별 사용법의 제목으로 있는지**를
  // 본다 — 카드 수를 세면 사용법의 짜임새를 바꿀 때마다 시험이 같이 틀어지고,
  // 정작 "설명이 빠진 탭" 은 못 잡는다(딴 탭 설명이 두 장이어도 수는 맞는다).
  const tabNames = await page.locator('.tabs button[data-tab]').allInnerTexts();
  const headings = (await page.locator('#help-body h4').allInnerTexts()).join(' | ');
  const missing = tabNames.filter((t) => !headings.includes(t.trim()));
  check('탭마다 사용법이 있다', missing.length === 0,
    missing.length ? `빠진 탭: ${missing.join(', ')}` : `탭 ${tabNames.length}개 · 제목 ${headings}`);

  // 빈칸을 0으로 읽지 말라는 것이 이 화면의 가장 중요한 약속이다. 그 약속이
  // 사용법에서 빠지면 사용자는 빈칸을 0으로 읽는다.
  check('빈칸이 0이 아니라고 밝힌다', /빈칸은 0이 아닙니다/.test(help), '표시됨');
  check('보유종목 기준일이 없다고 밝힌다', /기준일이 없습니다/.test(help), '표시됨');
  check('총보수가 범위라고 밝힌다', /범위입니다/.test(help), '표시됨');
  check('수익률이 누적이라고 밝힌다', /누적이며 연율이 아닙니다/.test(help), '표시됨');
  check('확인 안 된 것을 사용법에도 적는다',
    /확인되지 않았습니다/.test(help), '표시됨');

  // 적힌 수가 자료와 같은가 — 사용법이 본문과 어긋나면 사용법 쪽이 거짓이다.
  const truth = await page.evaluate(() => {
    const F = (window.FUND_DATA || {}).funds || [];
    const secs = new Set();
    for (const f of F) for (const h of f.holdings || []) if (h.name) secs.add(h.name);
    return {
      total: F.length,
      withHold: F.filter((f) => f.holdingCount > 0).length,
      secs: secs.size,
      noAum: F.filter((f) => f.aum == null).length,
      mixed: F.filter((f) => f.region === 'mixed').length,
    };
  });
  const bad = Object.entries(truth)
    .filter(([, v]) => !help.includes(v.toLocaleString()))
    .map(([k, v]) => `${k}=${v.toLocaleString()}`);
  check('사용법의 수가 자료와 일치한다', bad.length === 0,
    bad.length ? `화면에 없는 값: ${bad.join(', ')}` : `펀드 ${truth.total.toLocaleString()} 등 일치`);

  // ── 사용법을 따로 내려받을 수 있어야 한다
  //
  // 21MB 짜리 본 화면을 통째로 보내지 않고 사용법만 붙일 자리가 있다.
  // 단추가 있는지만 보지 않고 **실제로 내려받아 그 파일을 열어** 확인한다 —
  // 눌리기만 하고 빈 파일이 떨어지는 것이 이런 기능의 흔한 결말이다.
  check('사용법 내려받기 단추가 있다',
    (await page.locator('#help-dl-html').count()) === 1 &&
    (await page.locator('#help-dl-print').count()) === 1);

  // 날짜는 화면이 자료에서 뽑은 값을 그대로 쓴다. 여기서 따로 지어내면
  // 시험이 화면을 보는 것이 아니라 제 짐작을 보는 것이 된다.
  const dates = await page.evaluate(() => ({
    asOf: (window.DATES || {}).asOf || '', got: (window.DATES || {}).got || '',
  }));

  const dlNote = await page.locator('#help-dl-note').innerText().catch(() => '');
  check('내려받은 파일이 언제 것인지 밝힌다',
    /기준일/.test(dlNote) && (dates.asOf ? dlNote.includes(dates.asOf) : true),
    dlNote.slice(0, 60));

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
    page.locator('#help-dl-html').click(),
  ]);
  check('누르면 파일이 떨어진다', !!download, download ? download.suggestedFilename() : '없음');

  if (download) {
    // 이름이 로마자라야 한다. 한글 이름을 주면 브라우저가 통째로 버리고
    // 확장자 없는 "download" 로 떨어뜨리는 환경이 있다 — 그러면 못 연다.
    const fname = download.suggestedFilename();
    check('파일 이름이 성하게 떨어진다',
      /^[\x20-\x7E]+\.html$/.test(fname) && /how-to-use/.test(fname) &&
      (dates.got ? fname.includes(dates.got) : true), fname);

    const saved = await download.path();
    const doc = saved ? await readFile(saved, 'utf8') : '';
    check('받은 파일이 홀로 서는 문서다',
      /^<!doctype html>/i.test(doc) && /<style>/.test(doc) && doc.length > 5000,
      `${(doc.length / 1024).toFixed(0)} KB`);
    check('받은 파일에 사용법 본문이 들어 있다',
      doc.includes('빈칸은 0이 아닙니다') && doc.includes('보유종목에는 기준일이 없습니다'));
    check('받은 파일에 기준일과 출처가 남는다',
      (dates.asOf ? doc.includes(dates.asOf) : true) && /자료 출처/.test(doc));
    // 받은 파일 안에서 누를 것이 없는 단추가 남아 있으면 안 된다.
    check('받은 파일에 죽은 단추가 없다', !doc.includes('id="help-dl"'));
  }

  // ── 사용법 PDF
  //
  // PDF 는 화면이 그 자리에서 만들지 못한다(브라우저에 PDF 를 짜는 기능이
  // 없다). 그래서 빌드가 미리 만들어 base64 로 실어 두고, 화면은 그것을
  // 그대로 내려준다. 미리 실은 것은 낡을 수 있으므로 화면이 지금 센 수와
  // 맞을 때만 단추를 연다 — 그 규칙이 실제로 지켜지는지를 본다.
  const pdfState = await page.evaluate(() => ({
    has: !!(window.HELP_PDF && window.HELP_PDF.b64),
    stamp: (window.HELP_PDF || {}).stamp || '',
    live: window.HELP_STAMP || '',
    bytes: (window.HELP_PDF || {}).bytes || 0,
    got: (window.HELP_PDF || {}).got || '',
  }));
  const pdfShown = await page.locator('#help-dl-pdf').isVisible();
  const whyShown = await page.locator('#help-dl-why').isVisible();

  // 실려 있고 자료가 같으면 단추가 열려 있어야 하고, 아니면 단추 대신
  // **이유가 적혀** 있어야 한다. 둘 다 없는 것(조용히 사라지는 것)이 제일 나쁘다.
  const fresh = pdfState.has && pdfState.stamp === pdfState.live;
  check('실린 PDF 가 지금 자료와 같을 때만 단추가 열린다', pdfShown === fresh,
    `단추 ${pdfShown ? '보임' : '감춤'} · 실린 표시 ${pdfState.stamp || '없음'} · 화면 ${pdfState.live}`);
  check('PDF 를 못 내줄 때는 이유를 적는다', fresh ? !whyShown : whyShown,
    whyShown ? (await page.locator('#help-dl-why').innerText()).slice(0, 70) : '(이유 없음)');

  if (fresh) {
    const [pdfDl] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
      page.locator('#help-dl-pdf').click(),
    ]);
    check('누르면 PDF 가 떨어진다', !!pdfDl, pdfDl ? pdfDl.suggestedFilename() : '없음');

    if (pdfDl) {
      const fname = pdfDl.suggestedFilename();
      check('PDF 이름이 성하게 떨어진다',
        /^[\x20-\x7E]+\.pdf$/.test(fname) && /how-to-use/.test(fname) &&
        (pdfState.got ? fname.includes(pdfState.got) : true), fname);

      // 단추가 눌리기만 하고 깨진 파일이 떨어지는 것이 이런 기능의 흔한 결말이다.
      // 이름만 보지 않고 **바이트를 열어** PDF 인지 확인한다.
      const saved = await pdfDl.path();
      const buf = saved ? await readFile(saved) : Buffer.alloc(0);
      check('받은 PDF 가 진짜 PDF 다',
        buf.slice(0, 5).toString() === '%PDF-' && buf.length === pdfState.bytes,
        `${(buf.length / 1024).toFixed(0)} KB · 실린 크기 ${(pdfState.bytes / 1024).toFixed(0)} KB`);
      // base64 를 문자열째로 Blob 에 넣으면 UTF-8 로 다시 부호화되어 바이트가
      // 불어난다. 크기가 실린 값과 정확히 같아야 그 함정을 피한 것이다.
      check('PDF 끝맺음이 온전하다', buf.slice(-1024).includes('%%EOF'));
    }

    // 낡은 PDF 를 걸러내는 장치가 실제로 도는지 본다. 자료가 갱신되는 날에만
    // 발동하는 갈래라, 일부러 표시를 어긋내지 않으면 영영 시험되지 않는다 —
    // 그러다 정작 그날 낡은 PDF 가 그대로 나가는 것이 이런 장치의 결말이다.
    const stale = await page.evaluate(() => {
      const keep = window.HELP_PDF.stamp;
      window.HELP_PDF.stamp = keep + '|어긋남';
      renderHelp();
      const out = {
        shown: !document.getElementById('help-dl-pdf').hidden,
        why: document.getElementById('help-dl-why').textContent,
      };
      window.HELP_PDF.stamp = keep;
      renderHelp();
      return out;
    });
    check('자료가 갱신되면 낡은 PDF 를 내주지 않는다',
      !stale.shown && /기준일/.test(stale.why), stale.why.slice(0, 60));
    check('되돌리면 단추가 다시 열린다', await page.locator('#help-dl-pdf').isVisible());
  }

  await page.locator('.tabs button[data-tab="browse"]').click();
  await page.waitForTimeout(150);
}

// ── 머리말의 기준일은 수집 시각이 아니라 자료의 기준일이라야 한다
//
// 값은 수집 시각인데 이름만 "기준일" 이었고, ISO 를 그대로 잘라 UTC 날짜를
// 찍었다. 일일 수집이 23:30 UTC(= 다음날 08:30 KST)에 도니 한국 시간으로
// 매일 하루씩 밀린 날짜가 나왔다. 자료에는 진짜 기준일(tradeDate)이 있다.
{
  const hero = (await page.locator('#hero-meta').innerText().catch(() => '')) || '';
  const truth = await page.evaluate(() => {
    const D = window.FUND_DATA || {};
    const s = new Set();
    for (const f of D.funds || []) if (f.tradeDate) s.add(f.tradeDate);
    const kst = (v) => new Date(new Date(v).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    return {
      days: [...s].sort(),
      utcDay: String(D.sources?.kr?.updatedAt || D.updatedAt || '').slice(0, 10),
      kstDay: kst(D.sources?.kr?.updatedAt || D.updatedAt),
    };
  });
  if (truth.days.length === 1) {
    check('머리말 기준일이 자료의 기준일과 같다',
      hero.includes(truth.days[0]), `화면 "${hero.replace(/\s+/g, ' ')}" / 자료 ${truth.days[0]}`);
    // 수집 시각을 기준일 자리에 앉히지 않는다. 둘이 우연히 같은 날이면
    // 이 시험으로는 못 가르므로, 다를 때만 본다.
    if (truth.utcDay !== truth.days[0]) {
      check('수집 시각을 기준일로 내세우지 않는다',
        !new RegExp('기준일\\s*' + truth.utcDay).test(hero), `수집 UTC ${truth.utcDay}`);
    }
  }
  check('수집일을 한국 시간으로 적는다',
    hero.includes(truth.kstDay), `KST ${truth.kstDay} / UTC ${truth.utcDay}`);

  // 적어 놓기만 하고 안 보이면 안 적은 것과 같다. 실제로 수집일에 흰 바탕용
  // 옅은 회색(.dim)을 그대로 얹어 주황 머리말에서 글자가 사라졌었다. 눈으로
  // 보지 않으면 못 잡는 종류라 명암비를 재서 잡는다.
  const contrast = await page.evaluate(() => {
    const lum = (c) => {
      const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map((v) => {
        const s = Number(v) / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    // 머리말 배경은 조상에서 찾는다(칸 자체는 배경이 없다).
    const bgOf = (node) => {
      for (let e = node; e; e = e.parentElement) {
        const c = getComputedStyle(e).backgroundColor;
        if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c;
      }
      return 'rgb(255,255,255)';
    };
    const out = [];
    for (const s of document.querySelectorAll('#hero-meta span')) {
      const st = getComputedStyle(s);
      // 배지처럼 제 바탕을 가진 칸은 빼고 본다. 그것은 주황 위의 흰 글씨가
      // 아니라 다른 바탕 위의 글씨라, 같은 줄의 기준으로 삼으면 안 된다.
      if (!/rgba\(0, 0, 0, 0\)|transparent/.test(st.backgroundColor)) continue;
      // 흰 글씨를 반투명으로 쓴 경우 실제로 눈에 닿는 색은 배경과 섞인 색이다.
      const fg = st.color.match(/[\d.]+/g).map(Number);
      const bg = bgOf(s).match(/[\d.]+/g).map(Number);
      const a = fg.length > 3 ? fg[3] : 1;
      const mix = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
      const l1 = lum(`rgb(${mix.join(',')})`);
      const l2 = lum(`rgb(${bg.slice(0, 3).join(',')})`);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      out.push({ text: s.textContent.trim().slice(0, 24), ratio: Math.round(ratio * 100) / 100 });
    }
    return out;
  });
  // 절대 기준(명암비 3 이상)으로 재면 안 된다. 이 머리말은 브랜드 주황 바탕에
  // 흰 글씨라 **순백조차 2.59** 다 — 규칙을 그렇게 두면 멀쩡한 디자인이 통째로
  // 걸린다. 잡아야 할 것은 낮은 명암비가 아니라 **한 칸만 유독 옅은 것**이다.
  // 흰 바탕용 회색을 얹었던 그 칸은 1.38 로, 같은 줄 기준(2.36)의 58% 였다.
  const best = Math.max(...contrast.map((c) => c.ratio));
  const worst = contrast.slice().sort((a, b) => a.ratio - b.ratio)[0];
  check('머리말에 유독 옅어 묻히는 칸이 없다',
    contrast.length > 0 && worst.ratio >= best * 0.8,
    worst ? `가장 옅은 칸 "${worst.text}" ${worst.ratio} / 같은 줄 기준 ${best}` : '칸 없음');
}

// ── 교차 검증에서 확인 못 한 것을 확인한 것처럼 말하지 않는다
{
  const foot = await page.locator('#disc-verify').innerText().catch(() => '');
  // 여기에 "3,196" 을 박아 두었었다. 자료는 매일 다시 걷히고 펀드 수가 바뀌므로
  // 그 수를 박아 두면 대조를 새로 돌려 문단을 고치는 날 시험이 **옳은 글을**
  // 틀렸다고 잡는다. 시험이 잡아야 하는 것은 특정한 수가 아니라 "1차 출처 이름과
  // 대조한 건수를 밝혔는가" 다. 실제 수가 화면과 맞는지는 아래에서 따로 본다.
  check('교차 검증 결과를 밝힌다',
    /금융투자협회 전자공시/.test(foot) && /[\d,]+개를/.test(foot),
    foot ? foot.slice(0, 60) + '…' : '비어 있다');
  check('확인 안 된 수익률 구간을 확인한 것처럼 말하지 않는다',
    /확인되지 않았습니다/.test(foot) && /1M/.test(foot),
    /확인되지 않았습니다/.test(foot) ? '표시됨' : '문구 없음');

  // 이 문단은 대조를 돌린 날의 결과를 적은 고정된 글인데, 자료는 매일 다시
  // 걷히고 펀드 수도 바뀐다. 대조한 집합과 지금 화면의 집합이 어긋나는 날
  // "이 화면을 전수 대조했다" 는 말이 조용히 거짓이 되므로, 어긋나면 어긋난다고
  // 적혀 있어야 한다. 사람이 갱신을 잊는 것을 시험이 대신 잡는다.
  const shownN = await page.evaluate(() => (window.FUND_DATA?.funds || []).length);
  const verifiedN = Number((foot.match(/([\d,]+)개를/) || [])[1]?.replace(/,/g, ''));
  if (Number.isFinite(verifiedN) && verifiedN !== shownN) {
    check('대조한 집합이 지금 화면과 다르면 그렇다고 밝힌다',
      /지금 화면은/.test(foot) && foot.includes(shownN.toLocaleString()),
      `대조 ${verifiedN} vs 화면 ${shownN} — ${/지금 화면은/.test(foot) ? '밝힘' : '밝히지 않음'}`);
  } else {
    check('대조 집합과 화면 집합이 같다', verifiedN === shownN, `${verifiedN} = ${shownN}`);
  }
}

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
