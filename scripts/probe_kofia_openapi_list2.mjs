#!/usr/bin/env node
/**
 * 탐침 — 금투협 오픈API 목록, 스킴만 바꿔 한 번 더.
 *
 *   node scripts/probe_kofia_openapi_list2.mjs
 *   -> tools/discovery/kofia_openapi_list2.md
 *
 * ── 왜 한 번 더 여는가 ──────────────────────────────────────────────────────
 *
 * 22차가 목록을 채우는 AJAX 두 건을 잡았다. 둘 다 이렇게 돌아왔다:
 *
 *     The request / response that are contrary to the Web firewall
 *     security policies have been blocked.        (HTTP 200, 310바이트)
 *
 * 그러니 22차의 빈 표는 **"목록이 비었다" 가 아니라 "막혔다"** 이다.
 * 눈에 띄는 차이가 하나 있다 — 막힌 요청은 `http://` 로 나갔고 메인은
 * `https://` 였다. 스킴만 바꿔 **한 번** 열어 본다.
 *
 * 뚫는 것이 목적이 아니다. 공개된 API 목록 한 장을 읽는 것이 목적이고,
 * 이번에도 막히면 **"확인 실패"로 닫는다.** 더 두드리지 않는다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = 'tools/discovery/kofia_openapi_list2.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const URL_HTTPS = 'https://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp';

const BLOCKED = /Web firewall security policies have been blocked/i;
const FUND_WORD = /(펀드|집합투자|수익증권|기준가|설정원본|좌수|순자산)/;

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });

const xhr = [];
ctx.on('response', async (res) => {
  try {
    const u = res.url();
    if (!/kofia\.or\.kr/i.test(u)) return;
    if (/\.(css|js|png|jpg|gif|ico|woff2?)(\?|$)/i.test(u)) return;
    const body = await res.text().catch(() => '');
    if (!body) return;
    xhr.push({ url: u, status: res.status(), len: body.length, blocked: BLOCKED.test(body), body: body.slice(0, 4000) });
  } catch { /* 못 잡은 것은 못 잡은 것이다 */ }
});

const out = { at: new Date().toISOString(), status: null, rows: [], error: null };
try {
  const page = await ctx.newPage();
  const res = await page.goto(URL_HTTPS, { waitUntil: 'networkidle', timeout: 90000 });
  out.status = res ? res.status() : null;
  await page.waitForTimeout(10000);
  out.rows = await page.evaluate(() => {
    const seen = [];
    for (const tr of document.querySelectorAll('tr')) {
      const cells = [...tr.querySelectorAll('th,td')].map((c) => (c.innerText || '').replace(/\s+/g, ' ').trim());
      if (cells.filter(Boolean).length >= 2) seen.push(cells);
    }
    return seen.slice(0, 300);
  });
  // 분류 드롭다운이 채워졌는지도 본다. 채워졌으면 통신이 살아 있다는 뜻이다.
  out.options = await page.evaluate(() => {
    const sel = document.getElementById('stdSelect');
    return sel ? [...sel.options].map((o) => `${o.value}:${o.text}`) : null;
  });
  await page.close();
} catch (e) {
  out.error = String(e.message || e).split('\n')[0].slice(0, 160);
}
await browser.close();
await mkdir('tools/discovery', { recursive: true });

const dataRows = out.rows.filter((c) => c.join('').length > 6 && !/^분류 \| 오픈API명/.test(c.join(' | ')));
const hits = dataRows.filter((c) => FUND_WORD.test(c.join(' ')));
const blockedCalls = xhr.filter((x) => x.blocked);

const md = [
  '# 탐침 — 금투협 오픈API 목록 (https 로 한 번 더)',
  '',
  `받은 때: ${out.at}`,
  '',
  `\`${URL_HTTPS}\``,
  '',
  '22차는 목록을 채우는 AJAX 두 건이 **웹방화벽에 막혀** 빈 표가 나왔다.',
  '막힌 요청이 `http://` 였으므로 스킴만 바꿔 한 번 더 연다. 또 막히면',
  '**확인 실패로 닫는다** — 더 두드리지 않는다.',
  '',
  out.error ? `> **판정 못 함.** 화면을 못 받았다: ${out.error}` : `- HTTP ${out.status}`,
  '',
  `- 목록을 채우는 통신 ${xhr.length}건 중 **막힌 것 ${blockedCalls.length}건**`,
  `- 분류 드롭다운: ${out.options ? (out.options.length ? out.options.join(' · ') : '_비어 있다_') : '_못 읽음_'}`,
  '',
  '## 표에서 읽은 줄 (머리글 제외)',
  '',
  dataRows.length ? dataRows.map((c) => `- ${c.join(' | ')}`).join('\n')
    : '_줄이 하나도 없다._ 위의 막힌 통신 수가 0이 아니면 이것은 **막힌 것이지**\n' +
      '**목록이 빈 것이 아니다.** 이 빈칸을 근거로 "펀드 API 는 없다" 고 말하지 말 것.',
  '',
  '## 펀드 낱말이 걸린 줄',
  '',
  hits.length ? hits.map((c) => `- **${c.join(' | ')}**`).join('\n') : '_없음._',
  '',
  '## 오간 통신',
  '',
  ...xhr.map((x) => [
    `### ${x.status}${x.blocked ? ' — **방화벽 차단**' : ''} \`${x.url}\``, '',
    `- ${x.len}바이트`, '', '```', x.body.slice(0, 2500), '```', '',
  ].join('\n')),
].join('\n');

await writeFile(OUT, md, 'utf8');
console.log(`[kofia2] ${OUT} — 줄 ${dataRows.length}, 막힘 ${blockedCalls.length}/${xhr.length}`);
