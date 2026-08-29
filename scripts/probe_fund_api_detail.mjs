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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 첫 판은 한 번 부르고 실패하면 그냥 넘어갔다. 세 번 다 끊겨서
 * "후보 0개" 라고만 적힌 파일이 남았다 — **못 받은 것을 없는 것처럼**
 * 적은 것이다. 20분 전 15차는 같은 주소를 200 으로 열었으므로 원천이
 * 없는 게 아니라 연달아 두드려서 끊긴 것이다. 물러섰다가 다시 부른다.
 */
async function open(url, wait = 5000, tries = 3) {
  let last = null;
  for (let i = 0; i < tries; i += 1) {
    if (i) await sleep(8000 * i);
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(wait);
      return { status: res ? res.status() : null, url: page.url(), html: await page.content(), tries: i + 1, how: '브라우저' };
    } catch (e) {
      last = e;
      console.log(`[detail] ${i + 1}번째 실패: ${String(e.message).split('\n')[0]}`);
    } finally {
      await page.close();
    }
  }

  // 브라우저로 아홉 번 다 끊겼다. 브라우저는 문서 말고도 여럿 받으려 하므로
  // 문서 하나만 달라고 다시 물어본다. 이것도 끊기면 **길이 없는 것이 맞다.**
  // 다만 이 화면은 목록을 자바스크립트로 그리므로, 받아져도 상세링크가
  // 0개일 수 있다. 그때는 "없다" 가 아니라 "이 방식으로는 안 보인다" 이다.
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9' },
      signal: AbortSignal.timeout(40000),
    });
    console.log(`[detail] 브라우저 대신 fetch — HTTP ${res.status}`);
    return { status: res.status, url: res.url, html: await res.text(), tries, how: 'fetch(문서만)' };
  } catch (e) {
    console.log(`[detail] fetch 도 실패: ${String(e.message).split('\n')[0]}`);
  }
  throw last;
}

// ── 1. 목록에서 후보의 주소를 모은다 ────────────────────────────────────────
const found = new Map();   // href -> title
const lists = [];          // 목록 화면을 받았는가. 이것을 안 적으면 0 이 거짓말이 된다.
for (const kw of KEYWORDS) {
  const before = found.size;
  try {
    const r = await open(LIST(kw), 6000);
    for (const m of r.html.matchAll(
      /<a[^>]+href\s*=\s*["']([^"']*\/data\/\d+\/(?:openapi|fileData|standard)\.do[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const title = toText(m[2]).replace(/\s+/g, ' ').trim();
      if (!title || !WANT_TITLE.test(title) || SKIP_TITLE.test(title)) continue;
      const href = new URL(m[1], r.url).href;
      if (!found.has(href)) found.set(href, title);
    }
    // 링크가 하나도 안 걸렸는데 화면은 받은 경우 — 규칙(정규식)이 틀린 것이다.
    // 그때는 원문을 남겨 사람이 실제 href 모양을 보게 한다.
    const anchors = (r.html.match(/\/data\/\d+\/(?:openapi|fileData|standard)\.do/g) || []).length;
    lists.push({ kw, ok: true, status: r.status, tries: r.tries, how: r.how, anchors,
                 added: found.size - before,
                 sample: anchors ? null : (r.html.match(/<a[^>]+href="[^"]*data[^"]*"[^>]*>/i) || [null])[0] });
    console.log(`[detail] "${kw}" 목록 HTTP ${r.status} — 상세링크 ${anchors}개, 후보 누적 ${found.size}개`);
  } catch (e) {
    lists.push({ kw, ok: false, error: String(e.message || e).split('\n')[0].slice(0, 160) });
    console.log(`[detail] "${kw}" 목록 실패: ${e.message}`);
  }
}
const gotAnyList = lists.some((l) => l.ok);

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
  await sleep(3000);   // 남의 서버다. 몰아치지 않는다.
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
  '## 목록 화면을 받았는가',
  '',
  '**이 표를 먼저 본다.** 목록을 못 받으면 아래 후보 수 0 은 "없다" 가 아니라',
  '"못 봤다" 이다. 둘을 섞으면 없는 것을 있다고 말하는 것만큼 나쁜 거짓이 된다.',
  '',
  '| 검색어 | 받았나 | 어떻게 | HTTP | 상세링크 | 새 후보 |',
  '|---|:--:|:--:|:--:|:--:|:--:|',
  ...lists.map((l) => (l.ok
    ? `| ${l.kw} | 받음 | ${l.how} | ${l.status} | ${l.anchors} | ${l.added} |`
    : `| ${l.kw} | **못 받음** | 브라우저 3회 + fetch 1회 모두 실패 | — | — | — |`)),
  '',
  ...lists.filter((l) => !l.ok).map((l) => `- \`${l.kw}\` 실패: ${l.error}`),
  ...lists.filter((l) => l.ok && l.anchors === 0)
          .map((l) => `- \`${l.kw}\` 화면은 받았는데 상세링크가 0개다 — ` +
                      (l.how === 'fetch(문서만)'
                        ? '**이 목록은 자바스크립트로 그린다.** 문서만 받아서는 안 보이는 것이지 없는 것이 아니다.'
                        : '**내 정규식이 틀렸을 수 있다.**') +
                      ` 본 것: \`${(l.sample || '없음').slice(0, 120)}\``),
  '',
  gotAnyList
    ? (found.size === 0
        ? '> 목록은 받았으나 후보가 안 걸렸다. 링크 추출 규칙부터 의심할 것.'
        : '')
    : '> **판정 못 함.** 목록 화면을 하나도 못 받았다. 후보가 없다는 뜻이 아니다.\n' +
      '> data.go.kr 이 연달아 두드리면 끊는 것으로 보인다(15차는 같은 주소를 200 으로 열었다).\n' +
      '> 다시 돌려야 한다 — 이 파일의 빈 표를 근거로 아무것도 말하지 말 것.',
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
