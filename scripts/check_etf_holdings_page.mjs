// ETF 속보기 화면 연기 시험 — 헤드리스 크로미움.
//
//   node scripts/check_etf_holdings_page.mjs [etf-holdings.html]
//
// 무엇을 보는가
//   1. **인터넷 없이 열리는가.** file:// 로 열고 file: 이 아닌 요청은 모두 끊는다. 끊긴 요청이
//      하나라도 있으면(=바깥에 기대는 것이 있으면) 실패. 브라우저를 오프라인 모드로도 한 번 더 연다.
//   2. 여섯 탭이 오류 없이 그려지는가. 콘솔 오류·페이지 오류가 하나라도 있으면 실패.
//   3. 휴대폰 폭(360px)과 PC 폭에서 **가로로 넘치지 않는가** — 탭마다, 상세 창까지.
//   4. 거꾸로 찾기: 「삼성전자」로 찾으면 ETF 가 나오고 비중 순인가.
//   5. 겹침: 구성 비중이 없는 ETF 와 짝지으면 「모름」이지 0 이 아닌가.
//   6. 인쇄: print 매체에서 보이는 탭이 하나뿐인가, 상세가 열려 있으면 상세만인가.
//   7. 영문 모드: 화면 틀(자료 이름 말고)에 한글이 남지 않는가.
//   8. 레버리지·인버스가 기본으로 빠지는가, 거래 정지·펀드 전체 기준이 순위에서 빠지는가.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const file = path.resolve(process.argv[2] || 'etf-holdings.html');
if (!fs.existsSync(file)) { console.error('없음:', file); process.exit(1); }
const url = 'file://' + file;
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); else console.log('  ✓', msg); };

const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? undefined : undefined });

async function open(viewport, offline) {
  const ctx = await browser.newContext({ viewport, offline: !!offline });
  const page = await ctx.newPage();
  const blocked = [], errors = [];
  await page.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:')) return r.continue();
    blocked.push(u); return r.abort();
  });
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__etf && document.querySelectorAll('#listRows .row[data-k]').length > 0);
  return { ctx, page, blocked, errors };
}

const overflow = page => page.evaluate(() => {
  const d = document.documentElement;
  const bad = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > d.clientWidth + 1 && getComputedStyle(el).position !== 'fixed') bad.push((el.id || el.className || el.tagName) + ' ' + Math.round(r.right));
  });
  return { sw: d.scrollWidth, cw: d.clientWidth, bad: bad.slice(0, 5) };
});

const TABS = ['list', 'rev', 'ovl', 'rank', 'theme', 'guide'];

// ── 1. 오프라인 + 2. 탭 + 3. 폭
for (const vp of [{ width: 360, height: 780 }, { width: 1280, height: 900 }]) {
  console.log('폭', vp.width);
  const { ctx, page, blocked, errors } = await open(vp, vp.width === 360);
  for (const t of TABS) {
    await page.click(`#tabs button[data-tab="${t}"]`);
    await page.waitForTimeout(80);
    const o = await overflow(page);
    ok(o.sw <= o.cw, `${vp.width}px ${t} 탭 가로 넘침 없음 (scroll ${o.sw} / view ${o.cw}) ${o.bad.join(' | ')}`);
  }
  await page.click('#tabs button[data-tab="list"]');
  await page.click('#listRows .row[data-k]');
  await page.waitForSelector('#ov.open');
  const o = await overflow(page);
  ok(o.sw <= o.cw, `${vp.width}px 상세 창 가로 넘침 없음 ${o.bad.join(' | ')}`);
  await page.keyboard.press('Escape');
  ok(blocked.length === 0, `${vp.width}px 바깥 요청 없음 (${blocked.slice(0, 3).join(', ')})`);
  ok(errors.length === 0, `${vp.width}px 콘솔·페이지 오류 없음 (${errors.slice(0, 3).join(' / ')})`);
  await ctx.close();
}

const { ctx, page, errors } = await open({ width: 1280, height: 900 });

// ── 4. 거꾸로 찾기
await page.click('#tabs button[data-tab="rev"]');
await page.fill('#revQ', '삼성전자');
await page.waitForSelector('#revSugg.open button');
const firstSugg = await page.textContent('#revSugg button');
await page.press('#revQ', 'Enter');
await page.waitForTimeout(100);
const rev = await page.evaluate(() => [...document.querySelectorAll('#revOut .row[data-k] .num b')].map(b => parseFloat(b.textContent)));
ok(/삼성전자/.test(firstSugg) && rev.length > 0, `「삼성전자」 거꾸로 찾기 — 첫 제안 「${firstSugg.trim().slice(0, 30)}」, ETF ${rev.length}개`);
ok(rev.every((v, i) => i === 0 || rev[i - 1] >= v), '거꾸로 찾기 결과가 비중 내림차순');

// ── 5. 겹침: 모름은 0 이 아니다
const pair = await page.evaluate(() => {
  const { E, overlap } = window.__etf;
  const a = E.find(e => e.hs === 'ok' && e.m === 'KR' && !e.lv);
  const noW = E.find(e => e.hs !== 'ok');
  const same = E.filter(e => e.hs === 'ok' && e.m === a.m && e.ix && e.ix === a.ix && e.k !== a.k)[0];
  return { a: a && a.k, noW: noW && noW.k, unk: noW ? overlap(a, noW) : 'skip', same: same ? overlap(a, same).v : null, sameK: same && same.k };
});
ok(pair.unk === null || pair.unk === 'skip', `비중 모르는 ETF 와의 겹침은 null(모름) — ${pair.a} ↔ ${pair.noW}`);
if (pair.noW) {
  await page.evaluate(k => { window.__etf.state.basket = []; }, null);
  await page.click('#tabs button[data-tab="ovl"]');
  for (const k of [pair.a, pair.noW, pair.sameK].filter(Boolean)) {
    await page.evaluate(k => { window.__etf.state.basket.push(k); }, k);
  }
  await page.click('#ovlClear').catch(() => {});
  for (const k of [pair.a, pair.noW, pair.sameK].filter(Boolean)) {
    await page.evaluate(k => { const s = window.__etf.state; if (s.basket.indexOf(k) < 0) s.basket.push(k); }, k);
  }
  await page.evaluate(() => { document.getElementById('ovlQ').dispatchEvent(new Event('input')); });
  // 다시 그리게 — 담기 함수를 쓰는 길로
  await page.evaluate(() => window.__etf.setTab('ovl'));
  await page.click('#tabs button[data-tab="ovl"]');
  await page.evaluate(() => { const b = document.getElementById('ovlClear'); }); // noop
}
if (pair.same != null) ok(pair.same > 0, `같은 지수 두 ETF 의 겹침이 0 보다 큼 (${pair.same.toFixed(1)}%)`);

// ── 8. 순위에서 빠지는 것
const rk = await page.evaluate(() => {
  const { E } = window.__etf;
  window.__etf.setTab('rank');
  const shown = [...document.querySelectorAll('#rkOut tr[data-k]')].map(tr => tr.getAttribute('data-k'));
  const bad = shown.map(k => E.find(e => e.k === k)).filter(e => e.lv || e.st === 1);
  return { n: shown.length, bad: bad.map(e => e.k) };
});
ok(rk.n > 0 && rk.bad.length === 0, `기본 순위에 레버리지·인버스·거래정지 없음 (${rk.n}줄)`);
await page.selectOption('#rkMetric', 'aum');
const rkAum = await page.evaluate(() => {
  const { E } = window.__etf;
  const all = { KR: 1, US: 1, HK: 1, JP: 1, CN: 1 };
  window.__etf.state.rank.mk = all;
  document.getElementById('rkMetric').dispatchEvent(new Event('change'));
  const shown = [...document.querySelectorAll('#rkOut tr[data-k]')].map(tr => E.find(e => e.k === tr.getAttribute('data-k')));
  return { n: shown.length, fund: shown.filter(e => e.ab === 'fund').map(e => e.k) };
});
ok(rkAum.n > 0 && rkAum.fund.length === 0, `규모 순위에 「펀드 전체 기준」 없음 (${rkAum.n}줄)`);
const lev = await page.evaluate(() => {
  const { E } = window.__etf;
  window.__etf.setTab('list');
  const shown = [...document.querySelectorAll('#listRows .row[data-k]')].map(r => E.find(e => e.k === r.getAttribute('data-k')));
  return shown.filter(e => e.lv).length;
});
ok(lev === 0, '목록에 기본으로 레버리지·인버스 없음');

// ── 6. 인쇄
await page.click('#tabs button[data-tab="rank"]');
await page.emulateMedia({ media: 'print' });
const pr = await page.evaluate(() => {
  const vis = el => el && getComputedStyle(el).display !== 'none';
  return { tabs: [...document.querySelectorAll('section.tab')].filter(vis).map(s => s.id), nav: vis(document.querySelector('.tabs')), bar: vis(document.querySelector('.bar')) };
});
ok(pr.tabs.length === 1 && pr.tabs[0] === 'tab-rank' && !pr.nav && !pr.bar, `인쇄하면 보고 있는 탭만 (${pr.tabs.join(',')})`);
await page.emulateMedia({ media: 'screen' });
await page.click('#tabs button[data-tab="list"]');
await page.click('#listRows .row[data-k]');
await page.emulateMedia({ media: 'print' });
const pr2 = await page.evaluate(() => {
  const vis = el => el && getComputedStyle(el).display !== 'none';
  return { main: vis(document.querySelector('main')), panel: vis(document.getElementById('ov')) };
});
ok(!pr2.main && pr2.panel, '상세가 열려 있으면 상세만 인쇄');
await page.emulateMedia({ media: 'screen' });
await page.keyboard.press('Escape');

// ── 7. 영문 모드
await page.click('.lang-toggle button[data-lang="en"]');
for (const t of TABS) {
  await page.click(`#tabs button[data-tab="${t}"]`);
  const left = await page.evaluate(() => {
    // 자료에서 온 이름(ETF·종목·운용사·지수)은 원문 그대로 둔다 — 틀만 본다.
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script,.words,.row,.nm,.meta,.top3,td,.bk,.pair,datalist,select#fIs,#asof,mark,.mx,.sugg-list,#ixList').forEach(n => n.remove());
    const txt = clone.innerText || clone.textContent;
    return (txt.match(/[가-힣]+/g) || []).slice(0, 8);
  });
  ok(left.length === 0, `EN ${t} 탭 틀에 한글 없음 ${left.join(' ')}`);
}
ok(errors.length === 0, `시험 동안 오류 없음 (${errors.slice(0, 3).join(' / ')})`);
await ctx.close();
await browser.close();

if (fails.length) { console.error('\n실패 ' + fails.length); fails.forEach(f => console.error('  ✗ ' + f)); process.exit(1); }
console.log('\n모두 통과');
