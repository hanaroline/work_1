#!/usr/bin/env node
/**
 * 교부 문서(간이투자설명서 및 투자설명서)의 **쪽 지도**를 만든다.
 *
 *   node scripts/build_doc_pages.mjs  →  data/doc-pages.js
 *
 * 창구는 이 번호를 고객 앞에서 손가락으로 짚는 데 쓴다. 그래서 규칙이 하나다 —
 *
 *      ★ 제목이 정확히 한 쪽에서만 잡힐 때만 쪽을 담는다. 아니면 비운다. ★
 *
 * 빈칸은 창구가 목차를 보게 하지만, 틀린 쪽은 고객 앞에서 엉뚱한 데를 짚게 한다.
 *
 * 왜 낱말이 아니라 제목인가
 *   조사(probe_doc_pages.mjs)에서 「기초자산」 으로 찾으니 53쪽에 걸렸다. 낱말은
 *   문서 전체에 흩어져 있어 짚을 쪽을 고를 수 없다. 반면 쪽 첫머리의 제목은
 *   또렷하다 — "(2) 손익구조", "6. 투자자 유의사항" 처럼.
 *   그래서 **쪽의 앞부분에서만** 찾고, 그 제목이 한 쪽에만 있을 때 담는다.
 *
 * 문서 구조 (조사로 확인, 회차 3건)
 *   p.1~4    표지·빈 쪽
 *   p.5~21   간이투자설명서   ← 창구가 고객과 실제로 짚어 가는 곳. 회차가 달라도 쪽이 같았다
 *   p.22~    투자설명서        ← 회차마다 1~5쪽씩 밀린다. 그래서 회차마다 읽어 정한다
 */
import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const SCREEN = '/hks/hks4022/n01.do';
const DOC = (isin) => `/public/editor/elsdls/${isin}.pdf`;
const OUT = 'data/doc-pages.js';
const HEAD_CHARS = 220;   /* 「쪽 앞부분」 의 길이 — 제목은 여기 온다 */

/**
 * 짚을 자리들. key 는 스크립트 항목이 쓰는 이름이다.
 *   re   쪽 앞부분에서 찾을 제목
 *   what 창구에 보여 줄 짧은 이름
 * 제목은 조사에서 실제로 본 문장에서 땄다. 지어내지 않았다.
 */
/* 교부본은 같은 내용을 두 번 담고 있다 — 앞의 간이투자설명서(p.5~21)와
   뒤의 투자설명서 본문(p.22~). 그래서 「(예상 손익구조 그래프)」 같은 제목은
   p.14 와 p.38 두 곳에서 잡힌다. 문서 전체에서 한 번을 찾으려 하면 전부 비어
   버린다(첫 실행에서 그렇게 됐다).

   나누어 찾는다. 경계는 「투 자 설 명 서 20XX년」 이 오는 쪽이다.
   zone 'brief' = 그 앞(간이투자설명서), 'full' = 그 뒤(투자설명서 본문).
   창구가 고객과 짚어 가는 곳은 앞쪽이므로 기본으로 앞쪽 쪽번호를 쓰고,
   뒤쪽은 함께 담아 둔다(더 자세한 근거를 찾을 때 쓴다). */
const BOUNDARY = /투\s*자\s*설\s*명\s*서\s*20\d\d년/;

const ANCHORS = [
  ['docStart', 'brief', /간\s*이\s*투\s*자\s*설\s*명\s*서/, '간이투자설명서 첫 쪽 (명칭·위험등급)'],
  ['target', 'brief', /목표시장\s*설정\s*근거/, '목표시장·고난도 해당근거'],
  ['fixDate', 'brief', /평가일\s*,?\s*관찰일\s*및\s*평가방법/, '평가일·최초기준가격'],
  ['payoff', 'brief', /\(2\)\s*손익구조/, '손익구조 (차수별 상환조건)'],
  ['payoffChart', 'brief', /\(\s*예상\s*손익구조\s*그래프\s*\)/, '예상 손익구조 그래프'],
  ['lossCase', 'brief', /손실률\s*사례\s*1/, '손실 발생 사례'],
  ['sim', 'brief', /과거\s*데이터를\s*이용한\s*수익률\s*모의실험/, '수익률 모의실험'],
  ['midRedeem', 'brief', /중도상환가격\s*평가일/, '중도상환 가격평가일'],
  ['caution', 'brief', /투자자\s*유의사항/, '투자자 유의사항'],
  ['prospectus', 'full', BOUNDARY, '투자설명서 본문 시작'],
  ['riskFactors', 'full', /Ⅲ\.\s*투자위험요소/, '투자위험요소'],
  ['offering', 'full', /\[\s*모집\s*또는\s*매출의\s*개요\s*\]/, '모집·매출 개요'],
  ['fundUse', 'full', /Ⅵ\.\s*자금의\s*사용목적/, '자금의 사용목적'],
];

const log = (s = '') => console.log(s);

async function readPdf(page, url) {
  return page.evaluate(async (u) => {
    const res = await fetch(u, { credentials: 'include' });
    if (!res.ok) return { error: 'HTTP ' + res.status };
    const buf = await res.arrayBuffer();
    const head8 = new TextDecoder().decode(new Uint8Array(buf.slice(0, 8)));
    if (!head8.startsWith('%PDF')) return { error: 'PDF 가 아님' };
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const tc = await (await pdf.getPage(i)).getTextContent();
      pages.push(tc.items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim());
    }
    return { numPages: pdf.numPages, pages, bytes: buf.byteLength };
  }, url);
}

/**
 * 한 문서에서 자리별 쪽을 찾는다.
 * 구간(간이투자설명서 / 투자설명서 본문)을 나눈 뒤, **그 구간 안에서 한 쪽에만**
 * 걸릴 때만 담는다. 두 쪽 이상이면 비운다 — 어느 쪽을 짚을지 고를 수 없으므로.
 */
function mapPages(pages) {
  /* 경계: 「투 자 설 명 서 20XX년」 이 쪽 앞부분에 오는 첫 쪽 */
  let bIdx = pages.findIndex((t) => BOUNDARY.test(t.slice(0, HEAD_CHARS)));
  if (bIdx < 0) bIdx = pages.length;          /* 못 찾으면 전부 간이 구간으로 본다 */

  const found = {}, ambiguous = [], missing = [];
  for (const [key, zone, re, what] of ANCHORS) {
    const from = zone === 'full' ? bIdx : 0;
    const to = zone === 'full' ? pages.length : bIdx;
    const hits = [];
    for (let i = from; i < to; i++) {
      if (re.test(pages[i].slice(0, HEAD_CHARS))) hits.push(i + 1);
    }
    if (hits.length === 1) found[key] = hits[0];
    else if (hits.length === 0) missing.push(what);
    else ambiguous.push(`${what} (p.${hits.join(',')})`);
  }
  return { found, ambiguous, missing, boundary: bIdx + 1 };
}

async function main() {
  const els = (() => {
    const g = {};
    new Function('window', readFileSync('data/els.js', 'utf8'))(g);
    return g.ELS_DATA.products.filter((p) => p.code);
  })();
  log(`대상 ${els.length}건`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.goto(ORIGIN + SCREEN, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' });
  await page.evaluate(() => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  });

  const items = {};
  let ok = 0, fail = 0;
  const missTally = {};
  for (const p of els) {
    const doc = await readPdf(page, ORIGIN + DOC(p.code));
    if (doc.error) {
      fail++;
      log(`  ✗ ${p.name} (${p.code}) — ${doc.error}`);
      continue;
    }
    const { found, ambiguous, missing, boundary } = mapPages(doc.pages);
    items[p.code] = { name: p.name, url: ORIGIN + DOC(p.code), pages: doc.numPages, briefUntil: boundary - 1, at: found };
    ok++;
    missing.concat(ambiguous).forEach((m) => { missTally[m] = (missTally[m] || 0) + 1; });
    log(`  ✓ ${p.name}  ${doc.numPages}쪽 · 짚을 자리 ${Object.keys(found).length}/${ANCHORS.length}`
      + (ambiguous.length ? `  · 여러 쪽이라 비움: ${ambiguous.join(' / ')}` : ''));
  }
  await browser.close();

  log();
  log(`받음 ${ok}건 · 못 받음 ${fail}건`);
  log('자리별로 담긴 건수:');
  for (const [key, , , what] of ANCHORS) {
    const n = Object.values(items).filter((it) => it.at[key]).length;
    const pgs = [...new Set(Object.values(items).map((it) => it.at[key]).filter(Boolean))].sort((a, b) => a - b);
    log(`  ${what.padEnd(26)} ${String(n).padStart(3)}/${ok}건  쪽: ${pgs.length <= 6 ? 'p.' + pgs.join(', p.') : `p.${pgs[0]}~p.${pgs[pgs.length - 1]} (${pgs.length}가지)`}`);
  }
  if (Object.keys(missTally).length) {
    log('비운 자리:');
    Object.entries(missTally).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => log(`  ${k} — ${v}건`));
  }

  const body =
    '/**\n'
    + ' * 교부 문서(간이투자설명서 및 투자설명서)의 쪽 지도 — scripts/build_doc_pages.mjs 생성물.\n'
    + ' *\n'
    + ' * 창구가 고객 앞에서 짚을 쪽이다. 제목이 정확히 한 쪽에서만 잡힌 자리만 담겨 있고,\n'
    + ' * 여러 쪽에 걸리거나 못 찾은 자리는 **비어 있다** — 틀린 쪽을 짚게 하느니 비운다.\n'
    + ' */\n'
    + '(function (g) {\n  g.DOC_PAGES = '
    + JSON.stringify({
      updatedAt: new Date().toISOString(),
      source: 'securities.miraeasset.com /public/editor/elsdls/<ISIN>.pdf',
      docLabel: '간이투자설명서 및 투자설명서 (교부본)',
      anchors: ANCHORS.map(([key, zone, , what]) => ({ key, zone, what })),
      items,
    }, null, 1)
    + ';\n}(typeof window !== \'undefined\' ? window : this));\n';
  await writeFile(OUT, body);
  log(`\n${OUT} 생성 — ${ok}건 · ${(body.length / 1024).toFixed(0)}KB`);
  if (!ok) { console.error('!! 한 건도 받지 못했습니다'); process.exit(1); }
}

main().catch((e) => { console.error('!! 실패:', (e && e.stack) || e); process.exit(1); });
