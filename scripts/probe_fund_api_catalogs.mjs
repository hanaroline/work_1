#!/usr/bin/env node
/**
 * 탐침 — 펀드 시세·설정액을 주는 공개 API 가 또 어디 있나.
 *
 *   node scripts/probe_fund_api_catalogs.mjs
 *   -> tools/discovery/fund_api_catalogs.md
 *
 * ── 왜 이 스크립트가 있나 ───────────────────────────────────────────────────
 *
 * 사용자가 "펀드 시세를 더 받으려면 API 키 신청할 만한 다른 사이트가 있냐" 고
 * 물었다. 기억으로 목록을 적으면 그중 몇 개는 반드시 틀린다 — 바로 앞에서
 * 겪었다. 금투협 오픈API 가 펀드표준코드를 준다고 검색 요약을 믿고 전했는데,
 * 러너가 받아 온 이용안내 원문에는 이렇게 적혀 있었다:
 *
 *   "Do-not-call, 금융투자 교육원의 학습 진도 및 현황 데이터 조회를 제공"
 *
 * 펀드 얘기가 아예 없다. 그래서 후보 기관의 **목록 화면 원문**을 받아 온다.
 * 여기 실린 것만 사실로 적는다.
 *
 * ── 무엇을 찾는가 ───────────────────────────────────────────────────────────
 *
 * 우리에게 필요한 건 두 가지고, 둘은 값이 아주 다르다:
 *
 *   ① 펀드 기본정보(표준코드·명칭·유형) — 이미 있다. 더 안 필요하다.
 *   ② **펀드별 일별 설정원본(또는 좌수)** — 자금유입을 내려면 이것이 필요하다.
 *      순자산·기준가만 주는 곳은 우리 문제를 못 푼다. 순자산 차이는 수익률이
 *      섞여 있어서 "3개월 자금유입" 이라고 부를 수 없기 때문이다.
 *
 * 그래서 목록에서 '펀드/수익증권/집합투자/설정/좌수' 가 들어간 줄을 따로
 * 모아 둔다. 판단은 사람이 원문을 보고 한다.
 *
 * ── 이 세션에서는 못 돌린다 ─────────────────────────────────────────────────
 *
 * data.go.kr·seibro 등은 이그레스 정책에 막혀 있다. GitHub Actions 에서 돌린다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT = 'tools/discovery/fund_api_catalogs.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * 후보. 주소가 틀렸으면 틀린 대로 상태코드가 남는다 — 그것도 결과다.
 * mode:'browser' 는 목록을 자바스크립트로 그리는 곳이다(금투협 서비스현황을
 * 그냥 받았더니 표가 통째로 비어 있었다).
 */
const PAGES = [
  ['공공데이터포털 — 펀드 검색',
   'https://www.data.go.kr/tcs/dss/selectDataSetList.do?keyword=%ED%8E%80%EB%93%9C', 'browser'],
  ['공공데이터포털 — 수익증권 검색',
   'https://www.data.go.kr/tcs/dss/selectDataSetList.do?keyword=%EC%88%98%EC%9D%B5%EC%A6%9D%EA%B6%8C', 'browser'],
  ['공공데이터포털 — 집합투자 검색',
   'https://www.data.go.kr/tcs/dss/selectDataSetList.do?keyword=%EC%A7%91%ED%95%A9%ED%88%AC%EC%9E%90', 'browser'],
  ['금투협 오픈API 서비스현황 (자바스크립트로 그림)',
   'http://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp', 'browser'],
  ['한국거래소 오픈API', 'https://openapi.krx.co.kr/', 'browser'],
  ['예탁결제원 증권정보포털(세이브로)', 'https://seibro.or.kr/websquare/control.jsp?w2xPath=/IPORTAL/user/main/BIP_CNTS00000.xml', 'browser'],
  ['금융감독원 오픈API', 'https://www.fss.or.kr/fss/main/main.do', 'fetch'],
];

/** 한글 페이지는 EUC-KR 인 경우가 흔하다. 바이트로 받아 charset 을 보고 푼다. */
async function getText(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9' },
    signal: AbortSignal.timeout(30000),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const head = buf.subarray(0, 2048).toString('latin1');
  const ct = res.headers.get('content-type') || '';
  const m = /charset\s*=\s*["']?([\w-]+)/i.exec(ct) || /charset\s*=\s*["']?([\w-]+)/i.exec(head);
  let enc = (m?.[1] || 'utf-8').toLowerCase();
  if (enc === 'ks_c_5601-1987' || enc === 'cp949') enc = 'euc-kr';
  let text;
  try { text = new TextDecoder(enc).decode(buf); } catch { text = buf.toString('utf8'); }
  return { status: res.status, url: res.url, enc, html: text };
}

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
    .replace(/[ \t ]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

// 우리에게 값이 있는 낱말. '설정원본·좌수' 가 걸리면 그게 제일 큰 수확이다.
const WANT = /(펀드|수익증권|집합투자|설정원본|설정액|좌수|기준가|순자산)/;

let browser = null;
async function getBrowserText(url) {
  if (!browser) {
    const { chromium } = await import('playwright');
    browser = await chromium.launch();
  }
  const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });
  const page = await ctx.newPage();
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(6000);   // 목록이 그려질 시간을 준다
    const html = await page.content();
    return { status: res ? res.status() : null, url: page.url(), enc: '(브라우저)', html };
  } finally {
    await page.close(); await ctx.close();
  }
}

await mkdir('tools/discovery', { recursive: true });

const md = [
  '# 탐침 — 펀드 시세를 주는 공개 API 가 또 어디 있나',
  '',
  `받은 때: ${new Date().toISOString()}`,
  '',
  '세션에서는 이 주소들이 이그레스 정책에 막혀 열리지 않는다. 이 파일은',
  '러너가 받아 온 **원문**이다. 여기 실린 것만 사실이다.',
  '',
  '필요한 것은 **펀드별 일별 설정원본(좌수)** 이다. 기준가·순자산만 주는 곳은',
  '자금유입을 못 낸다 — 순자산 차이에는 수익률이 섞이기 때문이다.',
  '',
];

for (const [name, url, mode] of PAGES) {
  md.push(`## ${name}`, '', `\`${url}\``, '');
  try {
    const r = mode === 'browser' ? await getBrowserText(url) : await getText(url);
    md.push(`- HTTP ${r.status ?? '?'} · 인코딩 \`${r.enc}\` · 최종 \`${r.url}\``, '');
    if (r.status && r.status >= 400) { md.push('> 열리지 않았다.', ''); continue; }
    const body = toText(r.html);
    const hits = [...new Set(body.split('\n').map((l) => l.trim())
      .filter((l) => l.length > 3 && l.length < 200 && WANT.test(l)))];
    md.push(`### 관심 낱말이 걸린 줄 (${hits.length}개)`, '');
    md.push(hits.length ? ['```', ...hits.slice(0, 120), '```'].join('\n') : '_없다._', '');
    md.push('<details><summary>본문 전체</summary>', '', '```', body.slice(0, 9000), '```', '', '</details>', '');
  } catch (e) {
    md.push(`> 실패: ${String(e.message || e).slice(0, 200)}`, '');
  }
}

if (browser) await browser.close();

await writeFile(OUT, md.join('\n'), 'utf8');
console.log(`[api-catalogs] ${OUT} — 후보 ${PAGES.length}곳`);
