#!/usr/bin/env node
/**
 * 수익률 필드의 기준 확인용 (1회성)
 *
 * 수집한 omkt_drv_frcs_ern_r 가 "연 수익률"인지 "만기 기준 총 수익률"인지
 * 홈페이지 화면의 컬럼 라벨과 표시값을 직접 읽어 확인한다.
 *
 * 원금 100% 보장인 ELB 가 10.71% 로 나오는데, 이게 연율이면 비현실적이고
 * 3년 총액이면 연 3.57% 로 타당하다 — 그 판단을 눈으로 확인하려는 것.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const OUT = 'discovery';

const SCREENS = [
  '/hks/hks4022/n01.do',   // ELS/DLS 캘린더
  '/hks/hks4023/n01.do',   // ELS/DLS 상품 소개
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: 'ko-KR', viewport: { width: 1600, height: 1200 } });
const page = await ctx.newPage();
await mkdir(OUT, { recursive: true });

for (const s of SCREENS) {
  console.log(`\n===== ${s} =====`);
  try {
    await page.goto(ORIGIN + s, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4000);

    const tables = await page.evaluate(() =>
      Array.from(document.querySelectorAll('table')).map((t) => ({
        caption: (t.caption?.textContent || '').replace(/\s+/g, ' ').trim(),
        headers: Array.from(t.querySelectorAll('thead th, thead td'))
          .map((th) => (th.textContent || '').replace(/\s+/g, ' ').trim()),
        rows: Array.from(t.querySelectorAll('tbody tr')).slice(0, 4).map((tr) =>
          Array.from(tr.children).map((td) => (td.textContent || '').replace(/\s+/g, ' ').trim())),
      })).filter((t) => t.headers.length || t.rows.length)
    );

    tables.forEach((t, i) => {
      if (!t.rows.length) return;
      console.log(`\n  [표 ${i}] ${t.caption}`);
      console.log(`  헤더: ${t.headers.join(' | ')}`);
      t.rows.forEach((r) => console.log(`   행 : ${r.join(' | ')}`));
    });

    // 수익률 근처 안내 문구
    const notes = await page.evaluate(() => {
      const txt = document.body.innerText;
      const out = [];
      for (const m of txt.matchAll(/[^\n]{0,120}(수익률|세전|연환산|만기시)[^\n]{0,120}/g)) out.push(m[0].trim());
      return [...new Set(out)].slice(0, 25);
    });
    console.log('\n  수익률 관련 문구:');
    notes.forEach((n) => console.log('   · ' + n));

    await writeFile(join(OUT, 'verify' + s.replace(/\//g, '_') + '.html'), await page.content());
    await page.screenshot({ path: join(OUT, 'verify' + s.replace(/\//g, '_') + '.png'), fullPage: true });
  } catch (e) {
    console.log('  ERROR ' + (e?.message ?? e));
  }
}

await browser.close();
