// 종목 판정 화면 연기 시험 — **수가 맞아도 화면은 깨진다.**
//
// verify_verdict.py 는 자료가 스스로 아귀가 맞는지를 본다. 이 대본은 그 자료로
// 브라우저가 **정말 그 화면을 그리는지**를 본다. 칸 이름을 하나 바꾸면 검산은
// 다 통과하는데 화면은 빈칸이 된다 — 그 자리를 여기서 잡는다.
//
// 쓰는 법
//   python3 -m http.server 8000 &
//   node scripts/check_kis_verdict_page.mjs
//   node scripts/check_kis_verdict_page.mjs --offline   # 바깥으로 한 번도 나가지 않는가

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:8000';
const URL = BASE + '/docs/kis-verdict/';
const OFFLINE = process.argv.includes('--offline');

const results = [];
const ok = (label, pass, detail) => {
  results.push({ label, pass: !!pass, detail: detail || '' });
  return !!pass;
};

const doc = JSON.parse(readFileSync('data/kis_timing/verdict.json', 'utf8'));
const items = Object.values(doc.markets).flatMap(m => m.items);

const browser = await chromium.launch();
const errors = [];

async function open(width) {
  const ctx = OFFLINE ? await sealedContext(width) : await browser.newContext({
    viewport: { width, height: 1000 },
  });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(`${width}px: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`${width}px: pageerror ${e.message}`));
  await page.goto(URL, { waitUntil: 'networkidle' });
  return page;
}

// **바깥으로 나가는지 증명한다.** 화면이 글꼴·라이브러리를 몰래 받아 오면 인터넷
// 없는 PC 에서 깨진다. 여기서는 제 저장소 밖으로 가는 요청을 전부 끊어 두고,
// 그래도 화면이 온전히 그려지는지 본다.
let outbound = [];
async function sealedContext(width) {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 } });
  await ctx.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith(BASE) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    outbound.push(u);
    return route.abort();
  });
  return ctx;
}

const page = await open(1180);

// 1. 머리 — 종목 수와 시장 수가 자료와 같은가
const stamp = await page.locator('#stamp').innerText();
ok('머리에 종목 수가 자료와 같게 찍힌다',
   stamp.includes(`${items.length} 종목`) && stamp.includes(`${Object.keys(doc.markets).length} 시장`),
   stamp);

// 2. 탭이 view_order 차례대로 선다 — 화면이 제 차례를 들고 있지 않아야 한다
const tabs = await page.locator('#tabs button').allInnerTexts();
const wantTabs = ['전체'].concat(doc.view_order.filter(mk => doc.markets[mk]).map(mk => doc.markets[mk].label));
ok('탭 차례가 자료의 view_order 와 같다',
   tabs.length === wantTabs.length && tabs.every((t, i) => t.startsWith(wantTabs[i])),
   tabs.join(' / '));

// 3. 검색 — 이름 · 티커 · 종목코드 세 길이 모두 통한다
const sample = items.find(x => x.market === 'KR_STOCK' && x.name);
for (const [how, term] of [['이름', sample.name], ['티커', sample.symbol], ['종목코드', sample.code]]) {
  await page.fill('#q', term);
  await page.waitForTimeout(150);
  const txt = await page.locator('#detail').innerText().catch(() => '');
  ok(`검색이 ${how}로 찾는다 (${term})`, txt.includes(sample.name), txt.split('\n')[0] || '빈칸');
}

// 4. 없는 종목을 지어내지 않는다
await page.fill('#q', 'zzz없는종목zzz');
await page.waitForTimeout(150);
const none = await page.locator('#hits').innerText();
ok('없는 종목에는 없다고 적는다', none.includes('우주에 없습니다'), none.slice(0, 60));

// 5. 판정 배지와 막는 딱지 — 보류에는 까닭이 뜬다
const blocked = items.find(x => x.verdict === 'BLOCKED');
if (blocked) {
  await page.fill('#q', blocked.symbol);
  await page.waitForTimeout(200);
  const txt = await page.locator('#detail').innerText();
  ok('보류 종목에 막힌 까닭이 뜬다',
     txt.includes('보류했습니다') && blocked.blocked_by.some(b => txt.includes(b.slice(0, 18))),
     txt.split('\n').slice(0, 2).join(' | '));
} else {
  ok('보류 종목이 없어 건너뜀 (오늘은 막힌 자리가 없습니다)', true);
}

// 6. 자료가 없는 겹을 **왜 없는지**와 함께 드러낸다
const etf = items.find(x => x.coverage && x.coverage.fundamentals === false);
if (etf) {
  await page.fill('#q', etf.symbol);
  await page.waitForTimeout(200);
  const txt = await page.locator('#detail').innerText();
  ok('자료가 없는 겹에 까닭을 적는다',
     txt.includes('없는 겹') && txt.includes('없는 것과 나쁜 것은 다른 말입니다'),
     txt.split('\n').slice(-2).join(' | '));
}

// 7. 실적이 있는 종목은 표가 뜬다 — 그리고 목표가 괴리가 자료와 같다
const withF = items.find(x => (x.facts || {}).fundamentals && x.facts.fundamentals.target);
if (withF) {
  await page.fill('#q', withF.symbol);
  await page.waitForTimeout(200);
  const txt = await page.locator('#detail').innerText();
  const up = withF.facts.fundamentals.target.upside_pct;
  ok('실적·밸류에이션 표가 뜬다', txt.includes('실적 · 밸류에이션'), '');
  ok('목표가 괴리가 자료의 값과 같다',
     up == null || txt.includes((up > 0 ? '+' : '') + up.toFixed(1) + '%'),
     '자료 ' + up);
}

// 8. 시황 — 지수와 기준 시각이 뜬다
const rgTxt = await page.locator('#regime').innerText();
ok('시황에 지수와 기준 시각이 뜬다',
   rgTxt.includes('코스피') && rgTxt.includes('VIX') && rgTxt.includes('시황 기준'),
   rgTxt.split('\n')[0]);

// 9. 막는 규칙 표가 자료의 BLOCKS 와 같은 수만큼 뜬다
const howRows = await page.locator('#how table tbody tr').count();
ok('막는 규칙이 자료와 같은 수만큼 뜬다', howRows === doc.how['막는 규칙'].length,
   `${howRows} vs ${doc.how['막는 규칙'].length}`);

// 10. 유의사항이 빠지지 않는다
const howTxt = await page.locator('#how').innerText();
ok('투자 권유가 아니라는 말이 화면에 있다', howTxt.includes('투자 권유가 아닙니다'), '');
ok('실적 겹의 값을 재지 못했다는 말이 화면에 있다',
   howTxt.includes('재지 못했습니다') || howTxt.includes('잴 수 없'), '');

// 11. 탭을 눌러도 깨지지 않는다
for (let i = 0; i < tabs.length; i++) {
  await page.locator('#tabs button').nth(i).click();
  await page.waitForTimeout(80);
}
const listTxt = await page.locator('#lists').innerText();
ok('탭을 모두 눌러도 목록이 그려진다', listTxt.length > 0, listTxt.split('\n')[0]);

await page.close();

// 12. 좁은 화면에서 가로로 넘치지 않는다
for (const w of [430, 390]) {
  const p = await open(w);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(`${w}px 에서 가로로 넘치지 않는다`, over <= 1, `넘침 ${over}px`);
  await p.close();
}

// 13. 인쇄판에서 검색칸과 탭이 사라진다
const pp = await open(1180);
await pp.emulateMedia({ media: 'print' });
const hidden = await pp.evaluate(() => ['#q', '#tabs', '#printBtn', '#theme']
  .every(s => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none'; }));
ok('인쇄판에서 검색칸·탭·단추가 사라진다', hidden, '');
await pp.close();

if (OFFLINE) {
  ok('바깥으로 나가는 요청이 하나도 없다', outbound.length === 0, outbound.slice(0, 3).join(', '));
}

await browser.close();

for (const e of errors) results.push({ label: '콘솔 오류', pass: false, detail: e });

const bad = results.filter(r => !r.pass);
for (const r of results) {
  if (!r.pass) console.log(`FAIL  ${r.label}${r.detail ? '  — ' + r.detail : ''}`);
}
console.log(`맞은 검사 ${results.length - bad.length}개`);
console.log(`어긋난 검사 ${bad.length}개`);
process.exit(bad.length ? 1 : 0);
