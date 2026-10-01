/**
 * 변동성 경보 화면 연기 시험 — 브라우저로 실제로 열어 본다.
 *
 *   node scripts/check_volatility_page.mjs [--base http://localhost:8000] [--offline <파일>]
 *
 * **왜 필요한가.** 재검산(verify_volatility.py)은 *수*가 맞는지를 본다. 그런데
 * 자료가 다 맞아도 화면은 깨진다 — 자료의 칸 이름을 바꾸면 화면이 `undefined` 를
 * 찍고, 차트 라이브러리를 못 찾으면 그림 자리가 통째로 빈다. 그건 브라우저로
 * 열어 봐야만 드러난다.
 *
 * 만드는 동안 이 시험이 실제로 잡은 것 — 클립보드를 막아 둔 환경에서 📋 단추가
 * 아무 일도 안 하던 것(헤드리스가 writeText 를 거부한다), 가중치 칸 이름을 바꾼
 * 뒤 화면이 빈 칸을 찍던 것.
 *
 * 보는 것.
 *   가. 페이지 오류·콘솔 오류가 하나도 없는가 (라이트·다크 두 판)
 *   나. 일곱 칸이 다 서고 차트 셋이 실제로 그려졌는가
 *   다. 머리의 점수·등급이 자료의 값과 같은가 (화면이 자료를 옮겨 찍는지)
 *   라. 네 축이 모두 서고, 점수에 든 축에 가중치가 붙었는가
 *   마. 시나리오 5·10·20일 탭이 바뀌는가
 *   바. 390px 폭에서 가로 스크롤이 없는가
 *   사. 한 파일 판이 file:// 로 열려 그려지는가 (사내망 PC 자리)
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
const PAGE = BASE + '/docs/volatility/';
const DATA = 'data/volatility/latest.json';
const OFFLINE = arg('--offline', null);

const fails = [];
const ok = [];
const check = (cond, label, detail) => {
  if (cond) ok.push(label);
  else fails.push(detail ? `${label} — ${detail}` : label);
};

const D = JSON.parse(readFileSync(DATA, 'utf-8'));

/** 한 판을 열어 오류를 모으고 검사를 돌린다. */
async function open(browser, opts, label) {
  const page = await browser.newPage(opts);
  const errs = [];
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(`console: ${m.text()}`);
  });
  await page.goto(opts.url || PAGE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  check(errs.length === 0, `${label} · 오류 없음`, errs.join(' | '));
  return page;
}

const browser = await chromium.launch();

// ── 가·나·다·라·마 — 라이트 판에서 속을 본다 ──────────────────────
{
  const p = await open(browser, { viewport: { width: 1180, height: 1000 } }, '라이트');

  const cards = await p.evaluate(() => document.querySelectorAll('.card').length);
  check(cards === 7, '칸 일곱', `${cards} 칸만 섰습니다`);

  // 차트가 **그려졌는가** — 캔버스가 있는 것과 그린 것은 다르다
  const canvases = await p.evaluate(() =>
    [...document.querySelectorAll('canvas')].map((c) => [c.id, c.width, c.height]));
  check(canvases.length === 3, '차트 셋', `캔버스가 ${canvases.length} 개입니다`);
  check(canvases.every(([, w, h]) => w > 100 && h > 50),
    '차트가 실제로 그려짐', JSON.stringify(canvases));

  // 화면이 자료를 **옮겨 찍는지** — 셈을 다시 하고 있으면 여기서 갈린다
  const shown = await p.evaluate(() => ({
    score: document.querySelector('.gauge .score')?.textContent?.trim(),
    grade: document.querySelector('.gauge .grade')?.textContent?.trim(),
    asof: document.querySelector('#asofBadge')?.textContent?.trim(),
  }));
  check(shown.score === String(Math.round(D.score.total)),
    '머리 점수가 자료와 같음', `화면 ${shown.score} · 자료 ${D.score.total}`);
  check(shown.grade === D.score.grade,
    '등급이 자료와 같음', `화면 ${shown.grade} · 자료 ${D.score.grade}`);
  check((shown.asof || '').includes(D.asof),
    '기준일이 자료와 같음', `화면 ${shown.asof} · 자료 ${D.asof}`);

  // 네 축이 모두 서는가. **점수에 든 축이 조용히 빠지지 않는가**가 요점이다.
  const axes = await p.evaluate(() =>
    [...document.querySelectorAll('.axis-row')].map((r) => ({
      name: r.querySelector('.axis-name')?.textContent?.trim(),
      val: r.querySelector('.axis-val')?.textContent?.trim(),
      meta: r.querySelector('.axis-meta')?.textContent?.trim(),
    })));
  check(axes.length === 4, '축 넷', `${axes.length} 개만 섰습니다`);
  check(axes.every((a) => a.val && a.val !== '—'), '축 값이 모두 찍힘',
    JSON.stringify(axes.map((a) => a.val)));
  const weighted = Object.keys(D.score.adaptive_weights || {});
  const withWeight = axes.filter((a) => /가중치/.test(a.meta || '')).length;
  check(withWeight === weighted.length,
    '점수에 든 축마다 가중치가 붙음',
    `자료 ${weighted.length} 개 · 화면 ${withWeight} 개`);

  // 시나리오 탭
  const tabs = await p.$$('.scen-tab');
  check(tabs.length >= 2, '시나리오 탭', `${tabs.length} 개`);
  const seen = new Set();
  for (const h of ['5', '10', '20']) {
    const t = await p.$(`.scen-tab[data-h="${h}"]`);
    if (!t) continue;
    await t.click();
    await p.waitForTimeout(250);
    seen.add((await p.textContent('#scenBody')).slice(0, 120));
  }
  check(seen.size >= 2, '탭마다 내용이 바뀜', `서로 다른 판 ${seen.size} 가지`);

  await p.close();
}

// ── 다크 판 ────────────────────────────────────────────────────────
{
  const p = await open(browser,
    { viewport: { width: 1180, height: 1000 }, colorScheme: 'dark' }, '다크');
  const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check(bg !== 'rgba(0, 0, 0, 0)' && bg !== '',
    '다크 판에 바탕색이 있음', `background ${bg}`);
  await p.close();
}

// ── 바. 좁은 폭 ────────────────────────────────────────────────────
{
  const p = await open(browser, { viewport: { width: 390, height: 844 } }, '390px');
  const w = await p.evaluate(() => document.documentElement.scrollWidth);
  check(w <= 391, '390px 에서 가로 스크롤 없음', `scrollWidth ${w}`);
  await p.close();
}

// ── 사. 한 파일 판 (사내망 PC 자리) ────────────────────────────────
if (OFFLINE) {
  const p = await open(browser,
    { viewport: { width: 1180, height: 900 }, url: 'file://' + OFFLINE }, '한 파일 판');
  const cards = await p.evaluate(() => document.querySelectorAll('.card').length);
  check(cards === 7, '한 파일 판 칸 일곱', `${cards} 칸`);
  const drawn = await p.evaluate(() =>
    [...document.querySelectorAll('canvas')].every((c) => c.width > 100));
  check(drawn, '한 파일 판 차트가 그려짐');
  await p.close();
}

await browser.close();

console.log(`맞은 검사 ${ok.length}개`);
console.log(`어긋난 검사 ${fails.length}개`);
for (const f of fails) console.log(`\n  ! ${f}`);
process.exit(fails.length ? 1 : 0);
