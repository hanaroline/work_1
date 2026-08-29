#!/usr/bin/env node
/**
 * 펀드 탐색 9차 — 8차가 남긴 세 물음.
 *
 *   node scripts/probe_fund_class_page2.mjs
 *   -> tools/discovery/fund_class_probe2.{json,md} + fund_class_page2_*.png
 *
 * 8차에서 갈린 것:
 *   - 클래스 코드로 화면이 열린다 (200, 안 넘어감)
 *   - 상세 API 6개가 클래스 코드에 전부 답한다
 *   - 클래스는 부모와 **다른 값**을 가진다 — 기준가 3,856.76 vs 4,000.71,
 *     설정일 2017-06-28 vs 2007-06-04, 설정액·수익률·총보수가 다르다
 *   - 목록 3,196개에 클래스는 **하나도 안 섞여 있다** (한 펀드를 둘로 세지 않는다)
 *
 * 8차가 못 본 것 셋. 여기서 본다.
 *
 * 1. **클래스 화면이 빈칸으로 찍혔다.** 기준가도 수익률도 '-' 였다. API 는
 *    답하는데 화면이 비었다는 것은 둘 중 하나다 — 내가 너무 일찍 찍었거나,
 *    네이버가 클래스 화면을 반쪽만 그린다. 이걸 가리지 않고 "클래스 화면이
 *    있다" 고 화면에 링크를 걸면 사용자를 빈 화면으로 보낸다.
 *    값이 들어찰 때까지 기다렸다가 다시 찍는다.
 *
 * 2. **부모 화면에 유형평균이 찍혀 있었다.** 변동성 41.78 옆에 41.84,
 *    샤프 2.23 옆에 2.22 가 있다. 인수인계 문서에는 `peerMetric` 자리가
 *    "표본에서 null" 이라고 적혀 있고 수집기는 그래서 안 받는다.
 *    화면에 찍히는데 API 에 없을 리 없다. 원자료를 통째로 찍어 확인한다.
 *    **"표본에서 안 보였다" 는 "없다" 가 아니다** — 클래스별 총보수를 그렇게
 *    놓칠 뻔했다.
 *
 * 3. **화면에 있는데 우리가 안 싣는 것.** 매매 기준일(매수·환매 소요일),
 *    위험등급 숫자(2등급), 수수료, 자산구성(주식 347.86%)이 부모 화면에
 *    찍혀 있다. 이것들이 응답 어느 자리에 있는지 찾는다.
 *
 * 응답을 통째로 남긴다. 8차에서 요약만 남겼다가 이 물음들에 답을 못 했다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

import { getJson } from './etf_lib.mjs';

const OUT_JSON = 'tools/discovery/fund_class_probe2.json';
const OUT_MD = 'tools/discovery/fund_class_probe2.md';
const API = 'https://stock.naver.com/api/fund/funds';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const headers = { Referer: 'https://stock.naver.com/domestic/fund' };

const CLASS = 'K55207BJ1791';
const PARENT = 'KR5207698899';
const ENDPOINTS = ['left-panel', 'chart-price-panel', 'fund-performance',
                   'metrics/detail', 'classes/returns'];

const out = { at: new Date().toISOString(), raw: {}, page: {}, notes: [] };

// ─────────────── 2·3번: 응답을 통째로 남긴다 ───────────────
/** 긴 배열은 앞 세 개만 남긴다. 모양을 보려는 것이지 값을 다 받으려는 게 아니다. */
function trim(v, depth = 0) {
  if (Array.isArray(v)) return v.slice(0, 3).map((x) => trim(x, depth + 1))
    .concat(v.length > 3 ? [`…(총 ${v.length}개)`] : []);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = trim(v[k], depth + 1);
    return o;
  }
  return v;
}

for (const code of [PARENT, CLASS]) {
  out.raw[code] = {};
  for (const ep of ENDPOINTS) {
    try {
      const j = await getJson(`${API}/${code}/${ep}`, { headers });
      out.raw[code][ep] = trim(j);
    } catch (e) {
      out.raw[code][ep] = { __오류: String(e).slice(0, 200) };
    }
  }
}

// 유형평균이 정말 있는지 한 자리에서 답한다.
{
  const m = out.raw[PARENT]['metrics/detail'];
  const keys = m && typeof m === 'object' ? Object.keys(m) : [];
  out.notes.push({
    물음: 'metrics/detail 에 유형평균(peer)이 있는가',
    최상위키: keys,
    peer자리: JSON.stringify(m?.peerMetric ?? m?.peer ?? null),
    fund자리: JSON.stringify(m?.fundMetric ?? null),
  });
}

// 매매 기준일·수수료·위험등급 숫자가 어느 자리에 있는지 찾는다.
{
  const lp = out.raw[PARENT]['left-panel'];
  const found = [];
  (function walk(v, path) {
    if (v == null) return;
    if (typeof v === 'object') {
      for (const k of Object.keys(v)) {
        const p = path ? `${path}.${k}` : k;
        if (/fee|commission|redeem|redemption|buy|sell|deadline|grade|day|term/i.test(k)) {
          const s = JSON.stringify(v[k]);
          found.push({ 자리: p, 값: s && s.length > 160 ? s.slice(0, 160) + '…' : s });
        }
        walk(v[k], p);
      }
    }
  })(lp, '');
  out.notes.push({ 물음: '매매 기준일·수수료·위험등급 숫자가 어느 자리인가', 후보: found.slice(0, 40) });
}

// ─────────────── 1번: 클래스 화면이 정말 그려지는가 ───────────────
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1280, height: 2400 } });

async function render(label, code) {
  const url = `https://stock.naver.com/domestic/fund/${code}/total`;
  const page = await ctx.newPage();
  const rec = { label, code, url };
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    // 값이 들어찰 때까지 기다린다. 코드가 화면에 찍히는 것을 신호로 삼는다 —
    // 8차는 이걸 안 기다려서 빈 화면을 찍고 "빈 화면" 이라고 적을 뻔했다.
    let filled = false;
    for (let i = 0; i < 40; i += 1) {
      const t = await page.evaluate(() => document.body.innerText || '');
      if (t.includes(code) || /\d,\d{3}\.\d{2}/.test(t)) { filled = true; break; }
      await page.waitForTimeout(500);
    }
    rec.값이들어찼나 = filled;
    rec.기다린뒤글자 = (await page.evaluate(() => document.body.innerText || ''))
      .replace(/\n{3,}/g, '\n\n').slice(0, 9000);
    await page.screenshot({ path: `tools/discovery/fund_class_page2_${label}.png`, fullPage: true });
  } catch (e) {
    rec.error = String(e).slice(0, 300);
  }
  await page.close();
  return rec;
}

out.page.class = await render('class', CLASS);
await browser.close();

// ─────────────── 적기 ───────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = [];
md.push('# 펀드 탐색 9차 — 클래스 화면·유형평균·안 싣는 항목', '');
md.push(`조사 시각: ${out.at}`, '');
md.push('## 1. 클래스 화면이 값을 그리는가', '');
md.push(`값이 들어찼나: **${out.page.class.값이들어찼나}**`, '');
md.push('```', (out.page.class.기다린뒤글자 || out.page.class.error || '').slice(0, 6000), '```', '');
md.push('## 2·3. 응답 원자료', '');
for (const code of [PARENT, CLASS]) {
  md.push(`### ${code}`, '');
  for (const ep of ENDPOINTS) {
    md.push(`#### ${ep}`, '', '```json',
            JSON.stringify(out.raw[code][ep], null, 1).slice(0, 6000), '```', '');
  }
}
md.push('## 찾은 자리', '', '```json', JSON.stringify(out.notes, null, 1).slice(0, 8000), '```');
await writeFile(OUT_MD, md.join('\n'));

console.log(`[9차] 클래스 화면 값들어참=${out.page.class.값이들어찼나} · 원자료 ${ENDPOINTS.length}종 × 2코드`);
