#!/usr/bin/env node
/**
 * ELS/DLS 목록 API 조회조건 확정용 탐색기
 *
 *   node scripts/probe_els_list.mjs
 *
 * 왜 필요한가 —
 *   2026-09-07 수집에서 화면은 40건을 그렸는데 목록 API 는 21건만 주고
 *   continueYn=0 으로 끝났다. 빠진 19건이 바로 그날 새로 모집을 시작한
 *   상품(청약 2026.09.07~09.16)이다. 우리 수집기가 보내는 조회조건
 *   (prgs_scd=01)이 화면이 실제로 보내는 조건과 다르다는 뜻이다.
 *
 * 짐작으로 값을 바꾸지 않는다. 화면이 스스로 보내는 요청을 가로채 그 본문을
 * 그대로 찍고, 그 다음에 조건값을 하나씩 바꿔 가며 건수와 청약기간 분포를
 * 비교한다.
 *
 * 저장소에 아무것도 쓰지 않는다 — 잡 로그로만 본다.
 */

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const SCREEN = '/hks/hks4022/n01.do';
const LIST_API = '/hks/hks4022/a01.json';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  locale: 'ko-KR',
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
});
const page = await ctx.newPage();

/* ── 1) 화면이 스스로 보내는 요청을 가로챈다 ── */
const seen = [];
page.on('request', (r) => {
  if (r.method() === 'POST' && r.url().includes('/hks/hks4022/')) {
    seen.push({ url: r.url().replace(ORIGIN, ''), body: r.postData() || '' });
  }
});

await page.goto(ORIGIN + SCREEN, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);

console.log('=== 화면이 보낸 POST ' + seen.length + '건 ===');
seen.forEach((s, i) => {
  console.log(' ' + (i + 1) + ') ' + s.url);
  console.log('     ' + s.body.slice(0, 400));
});

/* 화면에 그려진 청약기간 분포 — 정답지 */
const rendered = await page.evaluate(() => {
  const out = {};
  let n = 0;
  for (const tr of document.querySelectorAll('table tbody tr')) {
    const txt = (tr.textContent || '').replace(/\s+/g, ' ').trim();
    if (!/미래에셋증권\((?:ELS|ELB|DLS|DLB)\)/.test(txt)) continue;
    n++;
    const p = (txt.match(/(\d{4}\.\d{2}\.\d{2}\s*~\s*\d{4}\.\d{2}\.\d{2})/) || [])[1] || '(기간없음)';
    out[p] = (out[p] || 0) + 1;
  }
  return { n, out };
});
console.log('\n=== 화면 렌더링 ' + rendered.n + '건 ===');
Object.entries(rendered.out).forEach(([k, v]) => console.log('   ' + k + '  ' + v + '건'));

/* ── 2) 조회조건을 하나씩 바꿔 가며 건수를 비교한다 ── */
/* 조건값이 서버가 모르는 것이면 응답이 영영 안 올 수 있다. 앞 판에서 그렇게
   잡 하나를 15분 통째로 잡아먹었다 — 요청마다 시한을 건다. */
async function call(body) {
  try {
    return await page.evaluate(
      async ({ origin, api, body }) => {
        try {
          const r = await fetch(origin + api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body,
            credentials: 'include',
            signal: AbortSignal.timeout(15000),
          });
          const text = await r.text();
          let json = null;
          try { json = JSON.parse(text); } catch { /* 그대로 둔다 */ }
          return { status: r.status, bytes: text.length, json, head: text.slice(0, 200) };
        } catch (e) {
          return { status: 0, bytes: 0, json: null, head: '요청 실패: ' + String(e && e.message || e) };
        }
      },
      { origin: ORIGIN, api: LIST_API, body }
    );
  } catch (e) {
    return { status: 0, bytes: 0, json: null, head: '브라우저 오류: ' + String(e && e.message || e) };
  }
}

function summary(res) {
  if (!res.json) return 'HTTP ' + res.status + ' · JSON 아님 · ' + res.head;
  const grid = res.json.grid01 || [];
  const per = {};
  for (const r of grid) {
    const s = String(r.apy_strt_dt ?? '').replace(/[^0-9]/g, '');
    const e = String(r.apy_end_dt ?? '').replace(/[^0-9]/g, '');
    const k = s && e ? s + '~' + e : '(기간없음)';
    per[k] = (per[k] || 0) + 1;
  }
  const stat = {};
  for (const r of grid) {
    const k = String(r.prgs_stat_nm ?? '(없음)');
    stat[k] = (stat[k] || 0) + 1;
  }
  return 'HTTP ' + res.status + ' · ' + grid.length + '건 · continueYn=' + res.json.continueYn +
    ' · 청약기간 ' + JSON.stringify(per) + ' · 진행상태 ' + JSON.stringify(stat);
}

const BASE = 'omkt_drvs_tcd=0&dlbr_term_yn=0&itm_nm=&qry_sort_tp=0&qry_sort_sqn=0&next_key=';

console.log('\n=== prgs_scd 값별 ===');
for (const v of ['', '00', '01', '02', '03', '04', '09', '1', '0']) {
  const res = await call(BASE + '&prgs_scd=' + encodeURIComponent(v));
  console.log('  prgs_scd=' + JSON.stringify(v).padEnd(6) + ' → ' + summary(res));
}

console.log('\n=== 화면이 보낸 본문 그대로 (있으면) ===');
for (const s of seen) {
  if (!s.url.includes('a01.json')) continue;
  const res = await call(s.body);
  console.log('  ' + s.body.slice(0, 200));
  console.log('    → ' + summary(res));
}

console.log('\n=== omkt_drvs_tcd 값별 (prgs_scd 는 위에서 가장 많이 나온 값으로 따로 확인) ===');
for (const v of ['', '0', '1', '2']) {
  const res = await call(
    'omkt_drvs_tcd=' + encodeURIComponent(v) +
    '&dlbr_term_yn=0&itm_nm=&prgs_scd=01&qry_sort_tp=0&qry_sort_sqn=0&next_key='
  );
  console.log('  omkt_drvs_tcd=' + JSON.stringify(v).padEnd(4) + ' → ' + summary(res));
}

await browser.close();
console.log('\n탐색 끝.');
