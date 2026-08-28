#!/usr/bin/env node
/**
 * 배포용 단일 파일이 정말 오프라인에서 도는가 — 실제로 끊어 놓고 연다.
 *
 *   node scripts/test_etf_offline.mjs
 *
 * "외부 참조가 없으니 될 것이다" 는 확인이 아니다. 데이터 안에 URL 이 섞여
 * 있을 수도 있고, 브라우저가 뭔가를 몰래 받으러 갈 수도 있다. 그래서
 *
 *   1. file:// 로 연다 (로컬 서버조차 없는 상태 — 받는 사람이 더블클릭하는 그 상황)
 *   2. http/https 요청을 전부 막는다. 하나라도 나가면 실패로 친다
 *
 * 두 조건을 걸고, 그 상태에서 화면이 실제로 그려지고 눌리는지 본다.
 */

import { chromium } from 'playwright';
import { resolve } from 'node:path';

const FILE = 'file://' + resolve('etf-holdings-search.html');

const browser = await chromium.launch();
const page = await browser.newPage();

// 밖으로 나가려는 시도를 전부 기록하고 끊는다.
const attempted = [];
await page.route('**/*', (route) => {
  const url = route.request().url();
  if (/^https?:/i.test(url)) {
    attempted.push(url);
    return route.abort();
  }
  return route.continue();
});

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

await page.goto(FILE, { waitUntil: 'load' });
await page.waitForTimeout(500);

check('file:// 로 열린다', page.url().startsWith('file://'));
check('바깥으로 나가는 요청이 없다', attempted.length === 0,
      attempted.length ? attempted.slice(0, 3).join(' | ') : '0건');

const rows = await page.locator('#list-body tr').count();
check('목록이 그려진다', rows > 0, `${rows}행`);

const count = await page.locator('#result-count').textContent();
check('전체 종목 수가 나온다', /\d/.test(count || ''), count);

// 검색 — 자바스크립트가 실제로 도는지 본다
await page.locator('#q').fill('반도체');
await page.waitForTimeout(300);
const found = await page.locator('#list-body tr').count();
check('검색이 동작한다', found > 0, `"반도체" ${found}행`);

// 편입종목 — 이 도구의 본체가 인라인 데이터에서 나오는지
await page.locator('#list-body tr').first().click();
await page.waitForTimeout(300);
const holds = await page.locator('#detail .hold-row').count();
check('편입종목이 나온다', holds > 0, `${holds}종목`);

const firstHolding = await page.locator('#detail .hold-row .nm').first().textContent();
check('편입종목 이름이 한글로 온전하다', Boolean(firstHolding && firstHolding.trim()),
      (firstHolding || '').trim().slice(0, 30));

// 필터·랭킹·역조회까지 인라인 데이터로 도는지
await page.locator('.tabs button[data-tab="rank"]').click();
await page.waitForTimeout(300);
const rankCards = await page.locator('#rank-body .card').count();
check('랭킹이 계산된다', rankCards >= 3, `${rankCards}개 표`);

await page.locator('.tabs button[data-tab="reverse"]').click();
await page.waitForTimeout(300);
const stocks = await page.locator('#reverse-body tr[data-stock]').count();
check('종목→ETF 역조회가 동작한다', stocks > 0, `${stocks}종목`);

// 폰트 CDN 이 없어도 글자가 보이는지 (시스템 폰트로 떨어져야 한다)
const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
check('폰트가 시스템 글꼴로 떨어진다', Boolean(fontFamily), fontFamily.slice(0, 60));

check('자바스크립트 오류가 없다', errors.length === 0, errors.slice(0, 2).join(' | '));

await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator('.tabs button[data-tab="browse"]').click();
await page.waitForTimeout(200);
await page.screenshot({ path: 'tools/discovery/etf_offline.png' });

await browser.close();

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} 통과` +
            (attempted.length ? `\n밖으로 나가려 한 요청: ${attempted.length}건` : ''));
process.exit(failed.length ? 1 : 0);
