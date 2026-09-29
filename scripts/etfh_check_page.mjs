// 브라우저로 눌러 보는 시험 — file:// 로 열고 바깥 요청을 전부 막은 채로.
//   node scripts/etfh_check_page.mjs [etf-holdings.html]
// 보는 것: 바깥 요청 0 · 콘솔 오류 0 · 행 눌러 상세 펼침 · 비중 모르는 종목 막대 없음 ·
//          정렬 · 더 보기 · 필터 · EN 전환 뒤 한글 잔존(자료 값 제외) · 인쇄 때 숨은 탭 · 휴대폰 폭 가로 넘침
import { chromium } from 'playwright';
import path from 'node:path';

const file = path.resolve(process.argv[2] || 'etf-holdings.html');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log(cond ? 'ok  ' : 'FAIL', msg); };

async function open(viewport) {
  const ctx = await browser.newContext({ viewport, offline: true });
  const page = await ctx.newPage();
  const ext = [], errs = [];
  page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) ext.push(r.url()); });
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + file);
  return { ctx, page, ext, errs };
}

const { ctx, page, ext, errs } = await open({ width: 1280, height: 900 });
const n = await page.evaluate(() => window.__etfh.ITEMS.length);
ok(n > 0, `자료 ${n}종목`);
const rows = await page.locator('tr.row').count();
ok(rows > 0 && rows <= 60, `첫 화면 행 ${rows}개 (60개씩)`);

// 행 → 상세
await page.locator('tr.row').first().click();
ok(await page.locator('tr.detail').count() === 1, '행을 누르면 바로 아래 상세가 펼쳐진다');
ok(await page.locator('tr.detail .kv dt').count() === 12, '상세 항목 12칸');

// 비중 모르는 편입종목에는 막대가 없어야 한다 — 전 종목에서 센다
const barCheck = await page.evaluate(() => {
  let bad = 0, unknown = 0;
  for (const it of window.__etfh.ITEMS) for (const h of it.holdings || []) if (typeof h.w !== 'number') unknown++;
  // 화면에서: 비중 칸이 '비중 미제공' 인 행에 막대가 있으면 잘못
  document.querySelectorAll('tr.detail tbody tr').forEach((tr) => { if (tr.querySelector('.mut') && tr.querySelector('.hb')) bad++; });
  return { bad, unknown };
});
ok(barCheck.bad === 0, `비중 모르는 종목에 막대 없음 (자료 전체 비중 미제공 편입 ${barCheck.unknown}건)`);

// 비중 모르는 종목이 있는 ETF 를 직접 열어 확인
const unkId = await page.evaluate(() => { const it = window.__etfh.ITEMS.find((x) => (x.holdings || []).some((h) => typeof h.w !== 'number')); return it ? it.id : null; });
if (unkId !== null) {
  await page.evaluate((id) => { const S = window.__etfh.S; S.onlyHold = false; S.lev = true; S.q = ''; }, unkId);
  const code = await page.evaluate((id) => window.__etfh.ITEMS[id].code, unkId);
  await page.fill('#q', code);
  await page.locator(`tr.row[data-id="${unkId}"]`).click();
  const r = await page.evaluate(() => { let bars = 0, mut = 0; document.querySelectorAll('tr.detail tbody tr').forEach((tr) => { if (tr.querySelector('.mut')) { mut++; if (tr.querySelector('.hb')) bars++; } }); return { bars, mut }; });
  ok(r.mut > 0 && r.bars === 0, `비중 미제공 ETF(${code}) — 미제공 ${r.mut}행, 막대 ${r.bars}개`);
  await page.fill('#q', '');
}

// 정렬: 설정액 머리 두 번
await page.click('#btn-reset');
await page.click('th[data-sort="fee"]');
const fees = await page.evaluate(() => window.__etfh.filtered().slice(0, 30).map((x) => x.fee).filter((v) => typeof v === 'number'));
ok(fees.every((v, i) => i === 0 || fees[i - 1] <= v), '총보수 오름차순 정렬');
ok(await page.locator('th[data-sort="index"]').count() === 0, '기초지수는 정렬하지 않는다');

// 더 보기
const total = await page.evaluate(() => window.__etfh.filtered().length);
if (total > 60) { await page.click('#more'); ok(await page.locator('tr.row').count() === Math.min(120, total), '더 보기로 60개 더'); }

// 기본값: 레버리지 꺼짐, 편입종목 있는 것만 켜짐
ok(!(await page.isChecked('#lev')) && (await page.isChecked('#hold')), '기본: 레버리지·인버스 꺼짐, 편입종목 있는 것만 켜짐');
const liShown = await page.evaluate(() => window.__etfh.filtered().some((x) => x.li));
ok(!liShown, '기본 목록에 레버리지·인버스 없음');

// EN
await page.click('.lang button[data-lang="en"]');
const leftover = await page.evaluate(() => {
  const walk = (el, out) => {
    for (const n of el.childNodes) {
      if (n.nodeType === 3) { if (/[가-힣]/.test(n.textContent)) out.push(n.textContent.trim()); }
      else if (n.nodeType === 1 && !n.closest('.nm, .sm, td') && n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE' && n.tagName !== 'OPTION') walk(n, out);
    }
    return out;
  };
  return walk(document.body, []);
});
ok(leftover.length === 0, `EN 모드 화면 글자에 한글 없음 (자료 값 제외) ${leftover.slice(0, 5).join(' / ')}`);
await page.click('.lang button[data-lang="ko"]');

// 인쇄: 숨은 탭은 인쇄에도 숨는다
await page.emulateMedia({ media: 'print' });
const printVis = await page.evaluate(() => [...document.querySelectorAll('.panel')].filter((p) => getComputedStyle(p).display !== 'none').length);
ok(printVis === 1, `인쇄 때 보이는 탭 ${printVis}개`);
await page.emulateMedia({ media: 'screen' });

ok(ext.length === 0, `바깥 요청 ${ext.length}건 ${ext.slice(0, 3).join(' ')}`);
ok(errs.length === 0, `콘솔 오류 ${errs.length}건 ${errs.slice(0, 3).join(' | ')}`);
await ctx.close();

// 휴대폰 폭
const m = await open({ width: 375, height: 800 });
await m.page.locator('tr.row').first().click();
const over = await m.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok(over <= 0, `휴대폰 폭(375) 가로 넘침 ${over}px`);
await m.page.screenshot({ path: process.env.SHOT_DIR ? `${process.env.SHOT_DIR}/m.png` : '/dev/null', fullPage: false }).catch(() => {});
await m.ctx.close();

await browser.close();
console.log(fails.length ? `\n실패 ${fails.length}` : '\n모두 통과');
process.exit(fails.length ? 1 : 0);
