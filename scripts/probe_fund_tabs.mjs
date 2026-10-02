#!/usr/bin/env node
/**
 * 펀드 탐색 11차 — 안 열어 본 탭 둘.
 *
 *   node scripts/probe_fund_tabs.mjs
 *   -> tools/discovery/fund_tabs.{json,md}
 *
 * 사용자가 미래에셋증권의 펀드 상세 화면을 보여 주었다. 그 화면에 있는데
 * 우리 화면에 없는 것이 눈에 띈다.
 *
 *   - **업종구성** (전자기술 19.72% · 건강기술 2.07% …)
 *   - **보유종목의 기준일** (2026.07.01 — 기준가 날짜와 두 달 다르다)
 *   - **자산구분** (같은 표에서 채권/주식/유동성을 나눠 적는다)
 *   - 선취판매수수료 · 환매수수료
 *
 * 보유종목 기준일이 특히 걸린다. 우리 화면은 보유종목을 기준가(8월 27일)
 * 옆에 나란히 놓는다. 미래에셋 화면은 그 표에 7월 1일이라고 적어 두었다.
 * 두 달 묵은 자료를 오늘 것처럼 보이게 두는 것은 **날짜를 안 적어서 생기는
 * 거짓**이다. 원천이 그 날짜를 주는지 반드시 확인해야 한다.
 *
 * 네이버 펀드 화면에는 탭이 셋인데(8차에서 확인) 우리는 첫 탭만 봤다.
 *
 *   /domestic/fund/{code}/total        ← 여기만 봤다
 *   /domestic/fund/{code}/performance
 *   /domestic/fund/{code}/allocation   ← 자산구성. availability.sectors 가 true 다
 *
 * `chart-price-panel.availability` 가 `sectors: true` 라고 답하는데 그 응답
 * 어디에도 업종은 없다. **다른 자리에 있다는 뜻이다.** 탭을 열어 오가는
 * 호출을 기록해 그 자리를 찾는다.
 *
 * 가릴 것:
 *   1. 업종구성을 주는 자리가 있는가
 *   2. 보유종목의 기준일을 주는 자리가 있는가 (없으면 "모른다" 고 적어야 한다)
 *   3. 보유종목의 자산구분(주식/채권/유동성)을 주는가
 *   4. 선취·후취 판매수수료가 채워지는 펀드가 있는가 (목록 표본에서 센다)
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

import { getJson, mapLimit } from './etf_lib.mjs';

const OUT_JSON = 'tools/discovery/fund_tabs.json';
const OUT_MD = 'tools/discovery/fund_tabs.md';
const API = 'https://stock.naver.com/api/fund/funds';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const headers = { Referer: 'https://stock.naver.com/domestic/fund' };

// 주식형이라 업종이 있을 펀드와, 채권이 섞여 자산구분이 갈릴 펀드를 함께 본다.
const CODES = ['KR5207698899', 'K55301BM7814'];

const out = { at: new Date().toISOString(), calls: [], guesses: [], fees: null, notes: [] };

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1280, height: 1800 } });

/** 탭 하나를 열고 오가는 api 호출을 본문까지 기록한다. */
async function openTab(code, tab) {
  const url = `https://stock.naver.com/domestic/fund/${code}/${tab}`;
  const page = await ctx.newPage();
  const seen = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (!u.includes('/api/fund/funds/')) return;      // 펀드 것만 본다
    let body = '';
    try { body = await res.text(); } catch { /* 못 읽는 응답 */ }
    seen.push({ status: res.status(), url: u.slice(0, 240), body: body.slice(0, 3000) });
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    // 값이 들어찰 때까지 기다린다. 9차에서 일찍 찍어 빈 화면을 받았다.
    for (let i = 0; i < 30; i += 1) {
      const t = await page.evaluate(() => document.body.innerText || '');
      if (t.includes(code)) break;
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(2500);
    out.calls.push({ code, tab, url, seen });
  } catch (e) {
    out.calls.push({ code, tab, url, error: String(e).slice(0, 300) });
  }
  await page.close();
}

for (const code of CODES) {
  for (const tab of ['allocation', 'performance']) await openTab(code, tab);
}
await browser.close();

// 잡은 주소를 브라우저 없이 다시 던져 본다. 재현되어야 수집기가 쓸 수 있다.
{
  const urls = [...new Set(out.calls.flatMap((c) => (c.seen || []).map((s) => s.url)))]
    .filter((u) => !/left-panel|chart-price-panel|base-price|prices\/daily/.test(u));
  out.guesses = await mapLimit(urls.slice(0, 20), 3, async (u) => {
    try {
      const j = await getJson(u, { headers });
      return { url: u, ok: true, keys: j && typeof j === 'object' ? Object.keys(j) : null,
               sample: JSON.stringify(j).slice(0, 1200) };
    } catch (e) { return { url: u, ok: false, error: String(e).slice(0, 200) }; }
  });
}

// 4번: 수수료·보수 자리가 채워지는 펀드가 있는가.
//
// 미래에셋 화면은 보수를 **쪼개서** 적는다 — 연 0.83% = 판매 0.45 / 운용 0.35 /
// 수탁 0.015 / 사무수탁 0.015. 네이버 detail 에 그 네 자리가 그대로 있다
// (managementFee·salesFee·custodyFee·backOfficeFee). 우리는 앞의 둘만 받고
// 뒤의 둘은 안 받는다. 그리고 표본 하나에서 null 인 것을 보고 "없다" 로
// 넘기지 않는다 — 그 함정을 이미 세 번 밟았다. 400개로 센다.
{
  let pre = 0, post = 0, fee = 0, n = 0;
  const list = [];
  for (let page = 0; page < 20; page += 1) {
    let d;
    try { d = await getJson(`${API}?page=${page}&size=20`, { headers }); } catch { break; }
    for (const f of (d?.funds || [])) {
      n += 1;
      list.push(f.fundCode);
      if (f.preSalesFee != null) pre += 1;
      if (f.postSalesFee != null) post += 1;
      if (f.totalFee != null) fee += 1;
    }
    if (d?.hasNext === false) break;
  }
  // 상세의 보수 네 자리를 200개로 센다.
  const cnt = { managementFee: 0, salesFee: 0, custodyFee: 0, backOfficeFee: 0,
                totalFee: 0, preSalesFee: 0, postSalesFee: 0 };
  const got = await mapLimit(list.slice(0, 200), 6, async (code) => {
    try { return (await getJson(`${API}/${code}/left-panel`, { headers }))?.detail || null; }
    catch { return null; }
  });
  let seen = 0;
  for (const d of got) {
    if (!d) continue;
    seen += 1;
    for (const k of Object.keys(cnt)) if (d[k] != null) cnt[k] += 1;
  }
  out.fees = { 목록표본: n, 목록선취있음: pre, 목록후취있음: post, 목록총보수있음: fee,
               상세표본: seen, 상세보수자리: cnt };
  out.notes.push({
    물음: '선취·후취 판매수수료를 받을 수 있는가',
    답: pre === 0 && post === 0
      ? `표본 ${n}개에서 하나도 안 왔다. **이것을 "없다" 로 단정하지 않는다** — 총보수도 ` +
        '펀드 자리에서는 비어 있다가 클래스 자리에 차 있었다. 다른 자리를 더 보기 전에는 ' +
        '"이 표본에서 확인되지 않았다" 까지만 말한다.'
      : `표본 ${n}개 중 선취 ${pre}개 · 후취 ${post}개가 채워져 있다.`,
  });
}

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = [];
md.push('# 펀드 탐색 11차 — 안 열어 본 탭 둘 (자산구성·성과분석)', '');
md.push(`조사 시각: ${out.at}`, '');
md.push('## 탭이 부르는 호출', '');
for (const c of out.calls) {
  md.push(`### ${c.code} · /${c.tab}`, '');
  for (const s of (c.seen || [])) md.push(`- \`${s.status}\` ${s.url}`);
  md.push('');
}
md.push('## 브라우저 없이 재현', '');
for (const g of out.guesses) {
  md.push(`### ${g.ok ? 'OK' : '실패'} ${g.url}`, '');
  md.push('```json', (g.sample || g.error || '').slice(0, 1800), '```', '');
}
md.push('## 판매수수료', '', '```json', JSON.stringify(out.fees, null, 1), '```', '');
md.push('## 메모', '', '```json', JSON.stringify(out.notes, null, 1), '```');
await writeFile(OUT_MD, md.join('\n'));

console.log(`[11차] 탭 ${out.calls.length}개 · 새 주소 ${out.guesses.length}개 · ` +
            `수수료 ${JSON.stringify(out.fees)}`);
