#!/usr/bin/env node
/**
 * 탐침 — 금투협 오픈API 가 실제로 무슨 서비스를 주는가 (목록을 렌더해서 읽는다).
 *
 *   node scripts/probe_kofia_openapi_list.mjs
 *   -> tools/discovery/kofia_openapi_list.md
 *
 * ── 왜 다시 여는가 ──────────────────────────────────────────────────────────
 *
 * 앞선 탐침이 `apiStut/OPENAPISvcStut.jsp` 를 받아 왔는데 본문이
 *
 *     API 서비스 현황 리스트 / 분류 / 오픈API명 / 설명
 *
 * 머리글까지만 있고 **줄이 하나도 없었다.** 그걸 근거로 "펀드 API 는 없다" 고
 * 적었는데 그건 근거가 아니다. **못 읽은 것이지 없는 것이 아니다.**
 * 목록을 JS 로 채우는 화면이면 HTML 만 받아서는 영원히 빈 표가 나온다.
 *
 * 그래서 이번엔 브라우저로 열어 **렌더가 끝난 뒤** 표를 읽고, 목록을 채우는
 * XHR 이 있으면 그 응답도 통째로 잡는다. 둘 중 하나는 진실을 준다.
 *
 * 판정 기준은 앞과 같다. 셋이 다 있어야 3개월 자금유입을 낼 수 있다:
 *   ① 표준코드 ② 기준일자(과거 조회) ③ 설정원본·좌수
 *
 * 이 세션에서는 openapi.kofia.or.kr 이 이그레스에 막힌다. GitHub Actions 에서 돈다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = 'tools/discovery/kofia_openapi_list.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const LIST_URL = 'http://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp';
const GUIDE_URL = 'http://openapi.kofia.or.kr/guide/sub1.jsp';

// 목록에서 이 낱말이 걸리면 펀드 쪽 서비스일 수 있다는 신호일 뿐이다.
// 신호는 근거가 아니다 — 걸리면 그 줄을 통째로 적어 사람이 읽게 한다.
const FUND_WORD = /(펀드|집합투자|수익증권|기준가|설정원본|좌수|순자산)/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h\d|td|th|a)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/[ \t ]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });

// 목록을 채우는 통신을 통째로 잡는다. 화면이 안 그려져도 이건 남는다.
const xhr = [];
ctx.on('response', async (res) => {
  try {
    const u = res.url();
    if (!/openapi\.kofia\.or\.kr/i.test(u)) return;
    if (/\.(css|js|png|jpg|gif|ico|woff2?)(\?|$)/i.test(u)) return;
    const ct = (res.headers()['content-type'] || '').toLowerCase();
    const body = await res.text().catch(() => '');
    if (!body) return;
    xhr.push({ url: u, status: res.status(), ct, len: body.length, body: body.slice(0, 6000) });
  } catch { /* 못 잡은 것은 못 잡은 것이다. 지어내지 않는다. */ }
});

async function open(url, tries = 4) {
  let last = null;
  for (let i = 0; i < tries; i += 1) {
    if (i) await sleep(20000 * i);
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
      await page.waitForTimeout(8000);
      return { page, status: res ? res.status() : null, tries: i + 1 };
    } catch (e) {
      last = e;
      console.log(`[kofia] ${i + 1}번째 실패: ${String(e.message).split('\n')[0]}`);
      await page.close();
    }
  }
  throw last;
}

const out = { at: new Date().toISOString(), status: null, rows: [], error: null, text: '', clicked: null };

try {
  const r = await open(LIST_URL);
  out.status = r.status;
  const page = r.page;

  // 검색 버튼이 있으면 눌러 본다. 안 눌러도 채워지는 화면일 수 있으니 실패해도 그냥 간다.
  try {
    const btn = page.locator('input[type=submit], button, a').filter({ hasText: /검색|조회/ }).first();
    if (await btn.count()) { await btn.click({ timeout: 8000 }); await page.waitForTimeout(8000); out.clicked = true; }
    else out.clicked = false;
  } catch (e) { out.clicked = `누르다 실패: ${String(e.message).split('\n')[0].slice(0, 80)}`; }

  // 렌더가 끝난 표를 읽는다. 어느 표인지 모르니 모든 tr 을 긁고 사람이 판단하게 둔다.
  out.rows = await page.evaluate(() => {
    const seen = [];
    for (const tr of document.querySelectorAll('tr')) {
      const cells = [...tr.querySelectorAll('th,td')].map((c) => (c.innerText || '').replace(/\s+/g, ' ').trim());
      if (cells.filter(Boolean).length >= 2) seen.push(cells);
    }
    return seen.slice(0, 200);
  });
  out.text = toText(await page.content());
  await page.close();
} catch (e) {
  out.error = String(e.message || e).split('\n')[0].slice(0, 160);
}

// 신청 절차가 어디로 가는지도 같이 적어 둔다. 키를 받을 곳을 사람이 확인해야 한다.
const links = [];
try {
  const r = await open(GUIDE_URL, 3);
  links.push(...await r.page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map((a) => [(a.innerText || '').replace(/\s+/g, ' ').trim(), a.href])
      .filter(([t]) => t)));
  await r.page.close();
} catch (e) { links.push(['(이용안내를 못 받았다)', String(e.message).split('\n')[0].slice(0, 80)]); }

await browser.close();
await mkdir('tools/discovery', { recursive: true });

const dataRows = out.rows.filter((c) => c.join('').length > 6);
const hits = dataRows.filter((c) => FUND_WORD.test(c.join(' ')));

const md = [
  '# 탐침 — 금투협 오픈API 서비스 목록 (렌더해서 읽는다)',
  '',
  `받은 때: ${out.at}`,
  '',
  `\`${LIST_URL}\``,
  '',
  '앞선 탐침은 HTML 만 받아서 표 머리글까지만 봤다. 그건 **못 읽은 것이지**',
  '**없는 것이 아니다.** 이번엔 브라우저로 열어 렌더가 끝난 뒤 읽는다.',
  '',
  out.error
    ? `> **판정 못 함.** 화면을 못 받았다: ${out.error}\n> 이 파일을 근거로 "없다" 고 말하지 말 것.`
    : `- HTTP ${out.status} · 검색 버튼: ${out.clicked}`,
  '',
  '## 표에서 읽은 줄',
  '',
  dataRows.length
    ? dataRows.map((c) => `- ${c.join(' | ')}`).join('\n')
    : '_줄이 하나도 없다._ 렌더 뒤에도 비었다면 (가) 목록이 정말 비었거나 ' +
      '(나) 로그인·다른 경로로만 채워진다. **둘을 구별 못 했다.** 아래 통신 기록을 볼 것.',
  '',
  '## 펀드 낱말이 걸린 줄',
  '',
  hits.length ? hits.map((c) => `- **${c.join(' | ')}**`).join('\n')
              : '_없음._ 표를 못 읽었다면 이 칸은 아무 뜻도 없다.',
  '',
  '## 오간 통신 (목록을 채우는 응답이 여기 있을 수 있다)',
  '',
  xhr.length ? '' : '_잡힌 것이 없다._',
  ...xhr.map((x) => [
    `### ${x.status} \`${x.url}\``, '',
    `- ${x.ct} · ${x.len}바이트`, '',
    '```', x.body.slice(0, 3000), '```', '',
  ].join('\n')),
  '## 이용안내의 링크 (인증키를 어디서 신청하는가)',
  '',
  ...links.map(([t, h]) => `- ${t} — \`${h}\``),
  '',
  '## 화면 본문',
  '',
  '```', (out.text || '(못 받음)').slice(0, 6000), '```',
  '',
].join('\n');

await writeFile(OUT, md, 'utf8');
console.log(`[kofia] ${OUT} — 줄 ${dataRows.length}개, 통신 ${xhr.length}건`);
