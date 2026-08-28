#!/usr/bin/env node
/**
 * 다른 ETF 조회 사이트가 "유형 평균" 과 "순위" 를 어떻게 다루는지 관찰한다.
 *
 *   node scripts/probe_etf_peer_convention.mjs
 *   -> tools/discovery/etf_peer_convention.{json,md}
 *
 * 왜 관찰하나 —
 * 유형 평균을 산술평균으로 둘지 중앙값을 같이 낼지 정해야 하는데, 이건
 * 취향 문제가 아니라 **관행이 있는 문제**다. 그리고 이 세션에서 짐작으로
 * 단정했다가 틀린 적이 이미 두 번 있다(야후 배당, 네이버 펀드). 그러니
 * 화면을 열어 무엇이 적혀 있는지 눈으로 본다.
 *
 * 받아 둔 응답에서 이미 나온 것 —
 *   네이버 ETF(etfAnalysis)  유형평균·순위 필드가 아예 없다
 *   네이버 펀드(left-panel)  parentPeerGroupName: "해외주식형"
 *                            returns[]: {fundReturn, benchmarkReturn, peerCompanyReturn}
 *                            → 기간마다 값 하나. 중앙값 자리가 없다. 순위도 없다
 *
 * 여기서 확인할 것 둘.
 *   1. ETF 조회 사이트가 유형 평균을 아예 쓰는가, 쓴다면 값이 하나인가
 *   2. 순위를 매긴다면 **전체 시장 안에서인가, 같은 유형 안에서인가**
 *
 * 2번이 더 중요하다. 우리 화면은 "순위 · 한국 전체" 로 반도체 ETF 를 MMF·
 * 채권형과 한 줄에 세우고 있다. 그게 관행이 아니라면 고쳐야 한다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/etf_peer_convention.json';
const OUT_MD = 'tools/discovery/etf_peer_convention.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// 찾을 말. 화면에 이런 말이 있으면 그 자리를 통째로 떠서 남긴다.
const KO = ['유형평균', '유형 평균', '동일유형', '동일 유형', '유형내', '유형 내',
            '비교지수', '벤치마크', '백분위', '순위', '상위', '분류평균'];
const EN = ['category average', 'category avg', 'peer group', 'peer average',
            'rank in category', 'percentile', 'category rank', 'vs category'];

const TARGETS = [
  // 국내 — ETF 전용 조회 사이트
  { id: 'etfcheck', label: 'ETF CHECK (국내 ETF 전용)', url: 'https://www.etfcheck.co.kr/mobile/etpitem/069500/basic' },
  { id: 'naver.etf', label: '네이버 ETF 종목', url: 'https://stock.naver.com/domestic/etf/069500/total' },
  { id: 'naver.fund', label: '네이버 펀드 (대조군 — 유형평균을 쓰는 곳)', url: 'https://stock.naver.com/domestic/fund/K55235B39916/total' },
  { id: 'fundamoa', label: '펀드다모아 (금투협)', url: 'https://fundamoa.kofia.or.kr/' },
  // 해외 — 같은 질문을 다른 관행에서
  { id: 'yahoo', label: 'Yahoo Finance ETF', url: 'https://finance.yahoo.com/quote/SPY/performance/' },
  { id: 'morningstar', label: 'Morningstar ETF', url: 'https://www.morningstar.com/etfs/arcx/spy/performance' },
  { id: 'etfcom', label: 'ETF.com', url: 'https://www.etf.com/SPY' },
];

const out = { at: new Date().toISOString(), pages: [] };
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });

/** 본문에서 낱말이 나온 자리 앞뒤를 떠 온다. 화면 전체를 남기면 못 읽는다. */
function excerpts(text, words) {
  const found = [];
  const lower = text.toLowerCase();
  for (const w of words) {
    let from = 0;
    for (;;) {
      const i = lower.indexOf(w.toLowerCase(), from);
      if (i < 0) break;
      found.push({ word: w, at: i, text: text.slice(Math.max(0, i - 90), i + 150).replace(/\s+/g, ' ') });
      from = i + w.length;
      if (found.length > 40) return found;
    }
  }
  return found;
}

for (const t of TARGETS) {
  const page = await ctx.newPage();
  const row = { id: t.id, label: t.label, url: t.url, apiHits: [] };
  // 화면이 부르는 api 에 유형·순위 필드가 있는지도 같이 본다. 화면에 안 보여도
  // 응답에 있으면 그 사이트가 그 개념을 갖고 있다는 뜻이다.
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/|\.json|graphql/i.test(u)) return;
    let body = '';
    try { body = (await res.text()).slice(0, 20000); } catch { return; }
    const keys = [...new Set((body.match(
      /"[A-Za-z0-9_]*(?:[Rr]ank|[Aa]verage|[Aa]vg|[Pp]ercentile|[Pp]eer|[Cc]ategory|[Bb]enchmark|[Mm]edian)[A-Za-z0-9_]*"/g) || [])]);
    if (keys.length) row.apiHits.push({ url: u.slice(0, 180), keys: keys.slice(0, 25) });
  });

  try {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(7000);
    row.landedOn = page.url();
    row.title = await page.title().catch(() => '');
    const text = await page.evaluate(() => document.body?.innerText || '');
    row.bytes = text.length;
    row.ko = excerpts(text, KO);
    row.en = excerpts(text, EN);
    // 중앙값을 쓰는 곳이 하나라도 있는지 따로 센다 — 이게 이번 결정의 핵심이다.
    row.median = /중앙값|중위값|median/i.test(text);
  } catch (e) { row.error = String(e.message || e).slice(0, 200); }
  await page.close();

  console.log(`\n── ${t.label}`);
  console.log(`   ${row.landedOn || '(못 열림)'}${row.error ? ' · ' + row.error : ''}  본문 ${row.bytes || 0}자`);
  console.log(`   유형/순위 낱말 ${(row.ko || []).length + (row.en || []).length}건 · 중앙값 표기 ${row.median ? '있음' : '없음'}`);
  for (const x of [...(row.ko || []), ...(row.en || [])].slice(0, 8)) {
    console.log(`     [${x.word}] …${x.text}…`);
  }
  for (const a of row.apiHits.slice(0, 4)) {
    console.log(`     api ${a.url.slice(0, 110)}`);
    console.log(`         ${a.keys.join(' ')}`);
  }
  out.pages.push(row);
}
await browser.close();

// ── 판정 ──────────────────────────────────────────────────────────────────
const opened = out.pages.filter((p) => !p.error && (p.bytes || 0) > 500);
const withPeer = opened.filter((p) => (p.ko || []).some((x) => /유형/.test(x.word))
  || (p.en || []).some((x) => /category|peer/i.test(x.word)));
const withMedian = opened.filter((p) => p.median);
out.verdict = {
  열린곳: opened.length,
  유형평균쓰는곳: withPeer.map((p) => p.id),
  중앙값쓰는곳: withMedian.map((p) => p.id),
};
console.log(`\n판정: 열린 곳 ${opened.length} · 유형 개념을 쓰는 곳 ${withPeer.length}` +
            ` · 중앙값을 쓰는 곳 ${withMedian.length}`);

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# ETF 조회 사이트의 유형평균·순위 관행', '', `조사 시각: ${out.at}`, '',
  '유형 평균을 산술평균으로 둘지 중앙값을 같이 낼지, 그리고 순위를 전체 시장에서',
  '매길지 같은 유형 안에서 매길지 — 짐작하지 않고 화면을 열어 본 기록이다.', '',
  '## 요약', '', '| 사이트 | 열림 | 유형/순위 낱말 | 중앙값 표기 |', '|---|---|---:|---|'];
for (const p of out.pages) {
  md.push(`| ${p.label} | ${p.error ? '✗ ' + p.error.slice(0, 40) : '✓'} | ` +
          `${(p.ko || []).length + (p.en || []).length} | ${p.median ? '있음' : '없음'} |`);
}
md.push('', '## 화면에 적힌 것', '');
for (const p of out.pages) {
  md.push(`### ${p.label}`, '', `- \`${p.landedOn || p.url}\``);
  if (p.error) { md.push(`- 못 열림: ${p.error}`, ''); continue; }
  const all = [...(p.ko || []), ...(p.en || [])];
  if (!all.length) md.push('- 유형·순위에 해당하는 낱말이 화면에 없다.', '');
  else {
    md.push('');
    for (const x of all.slice(0, 20)) md.push(`- **${x.word}** — …${x.text}…`);
    md.push('');
  }
  if (p.apiHits.length) {
    md.push('응답에 있던 관련 필드:', '');
    for (const a of p.apiHits.slice(0, 6)) md.push(`- \`${a.url.slice(0, 130)}\`  ${a.keys.join(' ')}`);
    md.push('');
  }
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[peer] ${OUT_MD} · ${OUT_JSON} 기록`);
