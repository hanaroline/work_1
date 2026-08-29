#!/usr/bin/env node
/**
 * 탐침 — 광주 빅데이터 플랫폼의 집합투자증권 자료 넷이 무엇을 주는가.
 *
 *   node scripts/probe_fund_gwangju.mjs
 *   -> tools/discovery/fund_gwangju.md
 *
 * ── 왜 여기까지 왔나 ────────────────────────────────────────────────────────
 *
 * 20차가 공공데이터포털에서 이 넉 줄을 드디어 열었다:
 *
 *   권리행사 현황 ; 집합투자증권                      /data/121580/linkedData.do
 *   증권관리현황 ; 집합투자증권 잔고현황               /data/121539/linkedData.do
 *   집합투자증권 설정,환매 및 인수도대금 현황          /data/121576/linkedData.do
 *   예탁증권 보관현황 ; 집합투자증권보관 총괄          /data/121546/linkedData.do
 *
 * 그런데 넷 다 **연계데이터**였다. 포털은 항목도 파일도 안 들고 있고
 * 바깥 주소 하나만 걸어 둔다. 전체 행 `-`, 확장자 빈칸, 바로가기 횟수 0.
 * 그러니 포털 화면만 보고는 **판정을 못 한다.** 실물은 광주 쪽에 있다.
 *
 * 판정 기준은 앞과 같다. 셋이 다 있어야 3개월 자금유입을 낼 수 있다:
 *   ① 표준코드 — 어느 펀드인지 (없으면 시장 합계다)
 *   ② 기준일자 — 과거를 부를 수 있는지 (없으면 오늘치뿐이다)
 *   ③ 설정원본·좌수 — 수익률이 안 섞인 값 (순자산 차이는 수익률이 섞인다)
 *
 * 이름이 그럴듯한 것과 쓸 수 있는 것은 다르다. 이름으로 닫지 않는다.
 *
 * data.go.kr 과 마찬가지로 이 세션에서는 못 부른다. GitHub Actions 에서 돈다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = 'tools/discovery/fund_gwangju.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const BASE = 'https://bigdata.gwangju.go.kr/usr/dataSet/getDataDetailView.rd?dataSetUncd=';
const TARGETS = [
  ['DS000303386', '집합투자증권 계열 (포털 연계 4건 중 하나)'],
  ['DS000303393', '집합투자증권 계열 (포털 연계 4건 중 하나)'],
  ['DS000303423', '집합투자증권 설정,환매 및 인수도대금 현황'],
  ['DS000303427', '집합투자증권 계열 (포털 연계 4건 중 하나)'],
];

// 포털이 어느 번호를 어느 제목에 걸었는지는 20차 결과에 섞여 있어 확실치
// 않다. 그래서 제목을 짐작해 적지 않고, **화면에서 읽은 제목을 쓴다.**

const NEED = {
  '표준코드(펀드 식별)': /(표준코드|펀드코드|종목코드|standardCd|fundCd|ISIN)/i,
  '기준일자(과거 조회)': /(기준일|기준년월|영업일|일자|basDt|standardDt)/,
  '설정원본·좌수·설정액': /(설정원본|설정액|설정잔액|좌수|발행좌수)/,
  '순자산·잔액(차선)': /(순자산|잔액|평가액|보관금액)/,
};

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });

// 못 받은 것을 없는 것처럼 적지 않는다. 물러섰다 다시 부른다.
async function open(url, tries = 4) {
  let last = null;
  for (let i = 0; i < tries; i += 1) {
    if (i) await sleep(20000 * i);
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(6000);
      return { status: res ? res.status() : null, html: await page.content(), tries: i + 1 };
    } catch (e) {
      last = e;
      console.log(`[gj] ${i + 1}번째 실패: ${String(e.message).split('\n')[0]}`);
    } finally {
      await page.close();
    }
  }
  throw last;
}

const results = [];
for (const [code, note] of TARGETS) {
  const rec = { code, note, url: BASE + code, status: null, title: null, has: {}, error: null };
  try {
    const r = await open(rec.url);
    rec.status = r.status;
    const text = toText(r.html);
    rec.text = text;
    // 제목은 짐작하지 않고 화면에서 읽는다.
    rec.title = (r.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1].trim() || null;
    for (const [label, re] of Object.entries(NEED)) {
      const hit = text.match(new RegExp(`.{0,70}${re.source}.{0,70}`, re.flags.includes('i') ? 'i' : ''));
      rec.has[label] = hit ? hit[0].replace(/\s+/g, ' ').trim() : null;
    }
  } catch (e) {
    rec.error = String(e.message || e).split('\n')[0].slice(0, 160);
  }
  results.push(rec);
  console.log(`[gj] ${rec.status ?? '실패'} ${code} ${rec.title ?? ''}`);
  await sleep(8000);   // 남의 서버다. 몰아치지 않는다.
}

await browser.close();
await mkdir('tools/discovery', { recursive: true });

const gotAny = results.some((r) => r.status);

const md = [
  '# 탐침 — 광주 빅데이터 플랫폼의 집합투자증권 자료 넷',
  '',
  `받은 때: ${new Date().toISOString()}`,
  '',
  '공공데이터포털이 든 넉 줄은 **연계데이터**라 포털에는 항목도 파일도 없다.',
  '포털 화면만 보고는 판정을 못 하므로 실물이 있는 광주 쪽을 연다.',
  '',
  '판정 기준: **표준코드**(어느 펀드인지) · **기준일자**(과거를 부르는지) ·',
  '**설정원본·좌수**(수익률이 안 섞인 값). 셋이 다 있어야 3개월 유입을 낸다.',
  '',
  gotAny
    ? ''
    : '> **판정 못 함.** 넷 다 화면을 못 받았다. 없다는 뜻이 아니다.\n' +
      '> 이 파일의 빈 표를 근거로 아무것도 말하지 말 것.',
  '',
  '## 한눈에',
  '',
  '| 자료 | HTTP | 표준코드 | 기준일자 | 설정원본·좌수 | 순자산·잔액 |',
  '|---|:--:|:--:|:--:|:--:|:--:|',
  ...results.map((r) => {
    const y = (k) => (r.has[k] ? '있음' : '—');
    const name = (r.title || r.code).slice(0, 44);
    return r.error
      ? `| ${name} | **못 받음** | — | — | — | — |`
      : `| ${name} | ${r.status} | ${y('표준코드(펀드 식별)')} | ${y('기준일자(과거 조회)')} | ` +
        `${y('설정원본·좌수·설정액')} | ${y('순자산·잔액(차선)')} |`;
  }),
  '',
  '표의 "있음" 은 낱말이 화면 어딘가에 있다는 뜻일 뿐, 그 칸이 **출력 항목**',
  '이라는 뜻이 아니다. 판정은 아래 원문을 보고 한다.',
  '',
];

for (const r of results) {
  md.push(`## ${r.title || r.code}`, '', `\`${r.url}\``, '', `_${r.note}_`, '');
  if (r.error) { md.push(`> 실패: ${r.error} — 못 받은 것이지 없는 것이 아니다.`, ''); continue; }
  md.push(`- HTTP ${r.status}`, '');
  for (const [label, hit] of Object.entries(r.has)) {
    md.push(`- **${label}**: ${hit ? `\`${hit.slice(0, 160)}\`` : '_안 보인다_'}`);
  }
  md.push('', '<details><summary>본문</summary>', '', '```', (r.text || '').slice(0, 9000), '```', '', '</details>', '');
}

await writeFile(OUT, md.join('\n'), 'utf8');
console.log(`[gj] ${OUT} — ${results.filter((r) => r.status).length}/${results.length} 받음`);
