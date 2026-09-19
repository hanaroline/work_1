/**
 * 전략빌더 10종 매매 타이밍 화면 연기 시험 — 브라우저로 실제로 열어 본다.
 *
 *   node scripts/check_kis_timing_page.mjs [--base http://localhost:8000]
 *
 * **왜 필요한가.** 재검산(verify_kis_timing.py)은 *수*가 맞는지를 본다. 그런데
 * 자료가 다 맞아도 화면은 깨진다 — 자료의 칸 이름을 하나 바꾸면 화면이
 * `undefined` 를 찍고, 그리는 함수 하나가 던지면 그 아래가 통째로 빈다. 그건
 * 브라우저로 열어 봐야만 드러난다.
 *
 * 만드는 동안 이 시험이 실제로 잡은 것 — 표를 `.tblwrap` 없이 격자 칸에 넣어
 * 좁은 폭에서 쪽 전체가 40px 밀리던 것(격자 칸의 기본 `min-width:auto` 가
 * 가로 스크롤을 먹는다), 그리는 함수 가운데 하나에 남아 있던 이름표 오타.
 *
 * 보는 것.
 *   가. 페이지 오류·콘솔 오류가 하나도 없는가 (라이트·다크 두 판)
 *   나. 여섯 칸이 다 섰는가
 *   다. 시장 탭이 자료의 시장 수만큼 서고, **자료가 정한 차례대로 서며**,
 *       눌러도 오류가 나지 않는가
 *   라. 히트맵이 매수 전략 수만큼 줄을 갖고, 합의 멤버에 테두리가 둘렸는가
 *   마. 화면의 매수 종목·손절가가 **자료의 값과 같은가** (화면이 옮겨 찍는지)
 *   바. 합의 K 표와 전략 명세 10줄이 섰는가
 *   사. 390px 폭에서 가로 스크롤이 없는가
 *
 * 나가는 값이 0 이 아니면 어긋난 자리를 모두 적고 끝낸다.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i >= 0 ? process.argv[i + 1] : d;
};
const BASE = arg('--base', 'http://localhost:8000');
const PAGE = BASE + '/docs/kis-timing/';
const DATA = 'data/kis_timing/latest.json';

const fails = [];
const ok = [];
const check = (cond, label, detail) => {
  if (cond) ok.push(label);
  else fails.push(detail ? `${label} — ${detail}` : label);
};

const D = JSON.parse(readFileSync(DATA, 'utf-8'));

/** 화면이 시장을 늘어놓는 차례. **자료가 정한다**(view_order) — 여기에 차례를
 *  또 적어 두면 화면과 검사기가 갈라지고, 갈라진 뒤에는 이 검사가 엉뚱한 탭의
 *  자료를 맞대게 된다. */
const MKS = (() => {
  const have = Object.keys(D.markets);
  const want = (D.view_order || []).filter((k) => have.includes(k));
  return want.concat(have.filter((k) => !want.includes(k)));
})();

async function open(browser, opts, label) {
  const page = await browser.newPage(opts);
  const errs = [];
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(`console: ${m.text()}`);
  });
  await page.goto(opts.url || PAGE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  page._errs = errs;
  check(errs.length === 0, `${label} · 오류 없음`, errs.join(' | '));
  return page;
}

const browser = await chromium.launch();

// ── 가·나·다·라·마·바 — 라이트 판에서 속을 본다 ────────────────────
{
  const p = await open(browser, { viewport: { width: 1240, height: 1000 } }, '라이트');

  const cards = await p.evaluate(() => document.querySelectorAll('.card').length);
  check(cards === 6, '칸 여섯', `${cards} 칸만 섰습니다`);

  // 다. 탭 — **눌러 본다.** 서 있기만 한 탭은 아무것도 보장하지 않는다.
  const tabs = await p.$$('#tabs button');
  check(tabs.length === MKS.length, `시장 탭 ${MKS.length} 개`, `${tabs.length} 개`);

  // 차례가 자료와 같은가. 첫 탭이 어디냐가 이 화면의 기본값이라 눈에 띄게 본다.
  const order = await p.$$eval('#tabs button', (ns) => ns.map((n) => n.dataset.mk));
  check(order.join(',') === MKS.join(','), `탭 차례가 자료의 view_order 와 같음`,
    `화면 ${order.join('>')} · 자료 ${MKS.join('>')}`);
  check(order[0] === MKS[0], `첫 탭이 ${D.markets[MKS[0]].label}`,
    `${(D.markets[order[0]] || {}).label}`);
  for (let i = 0; i < tabs.length; i++) {
    await (await p.$$('#tabs button'))[i].click();
    await p.waitForTimeout(150);
  }
  check(p._errs.length === 0, '탭을 모두 눌러도 오류 없음', p._errs.join(' | '));
  await (await p.$$('#tabs button'))[0].click();
  await p.waitForTimeout(200);

  // 라. 히트맵 — 매수 신호를 내는 전략(매도 전용을 뺀 것)만큼 줄이 선다.
  const buyable = D.strategies.filter((s) => s.buy_rule).length;
  const rows = await p.evaluate(() => document.querySelectorAll('#matrix tbody tr').length);
  check(rows === buyable, `히트맵 ${buyable} 줄`, `${rows} 줄`);

  const wantMembers = MKS.reduce((n, k) => n + D.markets[k].members.length, 0);
  const gotMembers = await p.evaluate(
    () => document.querySelectorAll('#matrix td.member').length);
  check(gotMembers === wantMembers,
    `합의 멤버 ${wantMembers} 칸에 테두리`, `${gotMembers} 칸`);

  // 마. 화면이 자료를 **옮겨 찍는지.** 첫 탭의 합의 매수 종목과 손절가를 맞대 본다.
  //     화면이 스스로 셈하기 시작하면 여기서 갈린다.
  const first = D.markets[MKS[0]];
  const shown = await p.evaluate(() =>
    [...document.querySelectorAll('#today .plan.buy')].map((el) => ({
      nm: el.querySelector('.nm').textContent.trim(),
      txt: el.textContent.replace(/\s+/g, ' '),
    })));
  check(shown.length === first.buy.length,
    `${first.label} 합의 매수 ${first.buy.length} 종`, `화면 ${shown.length} 종`);
  for (const p0 of first.buy) {
    const hit = shown.find((s) => s.nm === p0.name);
    if (!hit) { check(false, `${p0.name} 카드가 있음`); continue; }
    const stop = Number(p0.stop_ref).toLocaleString('ko-KR',
      p0.stop_ref < 1000 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {});
    check(hit.txt.includes(stop), `${p0.name} 손절가가 자료와 같음`, `자료 ${stop}`);
  }

  // 바. 나머지 표들.
  const cons = await p.evaluate(() => document.querySelectorAll('#consensus tbody tr').length);
  check(cons > 0, '합의 K 표가 섬', `${cons} 줄`);
  const specs = await p.evaluate(() => document.querySelectorAll('#specs tbody tr').length);
  check(specs === 10, '전략 명세 10 줄', `${specs} 줄`);
  const bf = await p.evaluate(
    () => document.querySelectorAll('#breakoutFail tbody tr').length);
  check(bf === MKS.length, `돌파 실패 표 ${MKS.length} 줄`, `${bf} 줄`);

  await p.close();
}

// ── 다크 판 ────────────────────────────────────────────────────────
{
  const p = await open(browser,
    { viewport: { width: 1240, height: 1000 }, colorScheme: 'dark' }, '다크');
  const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check(bg !== 'rgba(0, 0, 0, 0)' && bg !== '',
    '다크 판에 바탕색이 있음', `background ${bg}`);
  await p.close();
}

// ── 사. 좁은 폭 ────────────────────────────────────────────────────
{
  const p = await open(browser, { viewport: { width: 390, height: 844 } }, '390px');
  const w = await p.evaluate(() => document.documentElement.scrollWidth);
  check(w <= 391, '390px 에서 가로 스크롤 없음', `scrollWidth ${w}`);
  await p.close();
}

await browser.close();

console.log(`맞은 검사 ${ok.length}개`);
console.log(`어긋난 검사 ${fails.length}개`);
for (const f of fails) console.log(`\n  ! ${f}`);
process.exit(fails.length ? 1 : 0);
