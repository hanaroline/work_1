#!/usr/bin/env node
/**
 * 탐침 — 후보 데이터셋이 **펀드별 일별 설정원본**을 주는가.
 *
 *   node scripts/probe_fund_api_detail.mjs
 *   -> tools/discovery/fund_api_detail.md
 *
 * ── 왜 이 스크립트가 있나 ───────────────────────────────────────────────────
 *
 * 15차가 공공데이터포털 목록에서 이런 줄을 찾아 왔다:
 *
 *   집합투자증권 설정, 환매 및 인수도대금 현황
 *   증권관리현황 ; 집합투자증권 잔고현황
 *   금융위원회_펀드상품 판매현황정보   (키워드: 판매, 잔액)
 *
 * 이름만 보면 우리가 찾던 것이다. 그런데 이름은 근거가 아니다. 갈라야 할
 * 것이 셋이다:
 *
 *   ① **펀드별인가, 합계인가.** "집합투자증권 설정·환매 현황" 이 전체
 *      시장 합계 통계면 3,196개 펀드 순위를 못 낸다.
 *   ② **일별인가, 분기별인가.** 분기 자료로는 3개월 유입을 못 낸다.
 *   ③ **과거를 주는가.** 오늘치만 주면 금투협과 다를 게 없다 —
 *      13차에서 `standardDt` 가 무시되는 것을 이미 봤다.
 *
 * 그래서 상세 화면을 열어 **출력 항목 목록**을 그대로 받아 온다.
 * 표준코드·기준일자·설정원본(좌수)에 해당하는 칸이 셋 다 있어야 쓸모가 있다.
 *
 * ── 이 세션에서는 못 돌린다 ─────────────────────────────────────────────────
 *
 * data.go.kr 은 이그레스 정책에 막혀 있다. GitHub Actions 에서 돌린다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = 'tools/discovery/fund_api_detail.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const KEYWORDS = ['펀드', '집합투자', '수익증권'];
const LIST = (kw) =>
  `https://www.data.go.kr/tcs/dss/selectDataSetList.do?keyword=${encodeURIComponent(kw)}`;

// 제목이 이것에 걸리는 것만 연다. 벤처·모태·산단 펀드는 우리 것이 아니다.
const WANT_TITLE = /(펀드|집합투자|수익증권)/;
const SKIP_TITLE = /(모태|벤처|산단|퇴직연금|우체국|대학|보증공사|중소기업은행)/;
const MAX_OPEN = 12;

// 상세 화면에서 이것들이 다 있어야 쓸모가 있다. 하나라도 없으면 못 쓴다.
const NEED = {
  '표준코드(펀드 식별)': /(표준코드|펀드코드|종목코드|standardCd|fundCd)/i,
  '기준일자(과거 조회)': /(기준일|기준년월|영업일|일자|basDt|standardDt|기준일자)/i,
  '설정원본·좌수·설정액': /(설정원본|설정액|설정잔액|좌수|수익증권좌수|발행좌수|설정)/,
  '순자산·잔액(차선)': /(순자산|잔액|평가액|판매잔액)/,
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

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });

async function open(url, wait = 5000) {
  const page = await ctx.newPage();
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(wait);
    return { status: res ? res.status() : null, url: page.url(), html: await page.content() };
  } finally {
    await page.close();
  }
}

// ── 1. 목록에서 후보의 주소를 모은다 ────────────────────────────────────────
const found = new Map();   // href -> title
for (const kw of KEYWORDS) {
  try {
    const r = await open(LIST(kw), 6000);
    for (const m of r.html.matchAll(
      /<a[^>]+href\s*=\s*["']([^"']*\/data\/\d+\/(?:openapi|fileData|standard)\.do[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const title = toText(m[2]).replace(/\s+/g, ' ').trim();
      if (!title || !WANT_TITLE.test(title) || SKIP_TITLE.test(title)) continue;
      const href = new URL(m[1], r.url).href;
      if (!found.has(href)) found.set(href, title);
    }
    console.log(`[detail] "${kw}" 목록 — 지금까지 후보 ${found.size}개`);
  } catch (e) {
    console.log(`[detail] "${kw}" 목록 실패: ${e.message}`);
  }
}

// ── 2. 상세 화면을 열어 출력 항목을 본다 ────────────────────────────────────
const results = [];
for (const [href, title] of [...found].slice(0, MAX_OPEN)) {
  const rec = { title, href, status: null, has: {}, error: null };
  try {
    const r = await open(href, 5000);
    rec.status = r.status;
    const text = toText(r.html);
    rec.text = text;
    for (const [label, re] of Object.entries(NEED)) {
      const hit = text.match(new RegExp(`.{0,60}${re.source}.{0,60}`, re.flags.includes('i') ? 'i' : ''));
      rec.has[label] = hit ? hit[0].replace(/\s+/g, ' ').trim() : null;
    }
  } catch (e) {
    rec.error = String(e.message || e).slice(0, 120);
  }
  results.push(rec);
  console.log(`[detail] ${rec.status ?? '실패'} ${title}`);
}

await browser.close();

// ── 3. 기록 ─────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });

const md = [
  '# 탐침 — 후보 데이터셋이 펀드별 일별 설정원본을 주는가',
  '',
  `받은 때: ${new Date().toISOString()}`,
  '',
  '이름이 그럴듯한 것과 쓸 수 있는 것은 다르다. 셋이 다 있어야 쓸모가 있다:',
  '**표준코드**(어느 펀드인지) · **기준일자**(과거를 부를 수 있는지) ·',
  '**설정원본/좌수**(수익률이 안 섞인 값). 순자산·잔액만 있으면 3개월',
  '유입을 못 낸다 — 순자산 차이에는 수익률이 섞이기 때문이다.',
  '',
  `후보 ${found.size}개를 찾아 ${results.length}개를 열었다.`,
  '',
  '## 한눈에',
  '',
  '| 데이터셋 | 표준코드 | 기준일자 | 설정원본·좌수 | 순자산·잔액 |',
  '|---|:--:|:--:|:--:|:--:|',
  ...results.map((r) => {
    const y = (k) => (r.has[k] ? '있음' : '—');
    return `| ${r.title.slice(0, 50)} | ${y('표준코드(펀드 식별)')} | ${y('기준일자(과거 조회)')} | ` +
           `${y('설정원본·좌수·설정액')} | ${y('순자산·잔액(차선)')} |`;
  }),
  '',
  '판정은 사람이 아래 원문을 보고 한다. 표의 "있음" 은 낱말이 화면 어딘가에',
  '있다는 뜻일 뿐, 그 칸이 **출력 항목**이라는 뜻이 아니다.',
  '',
];

for (const r of results) {
  md.push(`## ${r.title}`, '', `\`${r.href}\``, '');
  if (r.error) { md.push(`> 실패: ${r.error}`, ''); continue; }
  md.push(`- HTTP ${r.status}`, '');
  for (const [label, hit] of Object.entries(r.has)) {
    md.push(`- **${label}**: ${hit ? `\`${hit.slice(0, 140)}\`` : '_안 보인다_'}`);
  }
  md.push('', '<details><summary>본문</summary>', '', '```', (r.text || '').slice(0, 9000), '```', '', '</details>', '');
}

await writeFile(OUT, md.join('\n'), 'utf8');
console.log(`[detail] ${OUT} — 후보 ${found.size}개 중 ${results.length}개 확인`);
