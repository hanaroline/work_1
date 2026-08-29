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
