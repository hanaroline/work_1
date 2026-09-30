#!/usr/bin/env node
/**
 * 교부문서에서 **한 자리의 원문이 뭐라고 적혀 있는지** 찍어 본다 (읽기만 한다).
 *
 *   node scripts/probe_doc_midredeem.mjs KR6MD000XXXX KR6MD000YYYY
 *   node scripts/probe_doc_midredeem.mjs --name 38165e 38158
 *
 * 왜 이게 따로 있나
 *   build_doc_pages.mjs 에도 진단이 있지만 **앞의 두 건만** 105자씩 찍는다.
 *   그래서 뒤쪽 회차가 비면 까닭을 볼 수 없다. 2026-09-30 에 38165e·38158 의
 *   중도상환 자리가 비었는데 그 진단은 38142 에서 이미 소진됐다.
 *
 *   제목 정규식을 원문 없이 고쳐 틀린 적이 있다(펀드 과세 자리를 두 번 헛고쳤다).
 *   그래서 고치기 전에 **문서가 실제로 뭐라고 쓰는지** 본다.
 *
 * 보여 주는 것
 *   ① 지금 규칙이 잡는지 (쪽 앞부분 HEAD_CHARS 안에서)
 *   ② 낱말이 문서 어디에 있는지 — 쪽 번호와 **쪽 안에서의 위치**
 *      위치가 HEAD_CHARS 를 넘으면 규칙이 아니라 「앞부분」 길이가 문제다
 *   ③ 그 언저리 원문 그대로
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const SCREEN = '/hks/hks4022/n01.do';
const DOC = (isin) => `/public/editor/elsdls/${isin}.pdf`;
const HEAD_CHARS = 220;                       /* 생성기와 같은 값 */
const RULE = /중도상환가격\s*평가일/;          /* 지금 쓰는 규칙 */
const BOUNDARY = /투\s*자\s*설\s*명\s*서\s*20\d\d년/;
const LOOSE = /중\s*도\s*상\s*환/;             /* 느슨하게 — 어디 있는지부터 본다 */

const argv = process.argv.slice(2);
const byName = argv[0] === '--name';
const want = byName ? argv.slice(1) : argv;
if (!want.length) { console.error('쓰기: probe_doc_midredeem.mjs <ISIN…>  또는  --name <회차…>'); process.exit(1); }

const g = {};
new Function('window', readFileSync('data/els.js', 'utf8'))(g);
const all = g.ELS_DATA.products;
const targets = byName
  ? want.map((n) => all.find((p) => p.name.includes(n))).filter(Boolean)
  : want.map((c) => all.find((p) => p.code === c) || { code: c, name: c });

if (!targets.length) { console.error('대상을 못 찾았습니다'); process.exit(1); }
console.log(`대상 ${targets.length}건 — ${targets.map((p) => p.name).join(' / ')}\n`);

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

for (const p of targets) {
  console.log('━'.repeat(78));
  console.log(`${p.name}  (${p.code})`);
  console.log('━'.repeat(78));
  const doc = await page.evaluate(async (u) => {
    const res = await fetch(u, { credentials: 'include' });
    if (!res.ok) return { error: 'HTTP ' + res.status };
    const buf = await res.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const tc = await (await pdf.getPage(i)).getTextContent();
      pages.push(tc.items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim());
    }
    return { numPages: pdf.numPages, pages };
  }, ORIGIN + DOC(p.code));

  if (doc.error) { console.log(`  ✗ ${doc.error}\n`); continue; }

  let bIdx = doc.pages.findIndex((t) => BOUNDARY.test(t.slice(0, HEAD_CHARS)));
  if (bIdx < 0) bIdx = doc.pages.length;
  console.log(`전체 ${doc.numPages}쪽 · 간이투자설명서 구간 p.1~${bIdx}\n`);

  const hitHead = [];
  for (let i = 0; i < bIdx; i++) if (RULE.test(doc.pages[i].slice(0, HEAD_CHARS))) hitHead.push(i + 1);
  console.log(`[지금 규칙 ${RULE}] 앞부분 ${HEAD_CHARS}자 안에서 잡힌 쪽: ${hitHead.length ? 'p.' + hitHead.join(', p.') : '없음'}`);

  const hitAny = [];
  for (let i = 0; i < bIdx; i++) if (RULE.test(doc.pages[i])) hitAny.push(i + 1);
  console.log(`[같은 규칙 · 쪽 전체] 잡힌 쪽: ${hitAny.length ? 'p.' + hitAny.join(', p.') : '없음'}`);
  console.log('');

  console.log(`[느슨하게 「중도상환」 이 나오는 자리 · 간이 구간]`);
  let shown = 0;
  for (let i = 0; i < bIdx; i++) {
    const t = doc.pages[i];
    const m = t.match(LOOSE);
    if (!m) continue;
    const pos = m.index;
    console.log(`  p.${String(i + 1).padStart(2)}  쪽 안 위치 ${pos}자${pos > HEAD_CHARS ? '  ← 앞부분(' + HEAD_CHARS + '자) 밖' : ''}`);
    console.log(`        앞머리: ${t.slice(0, 150)}`);
    console.log(`        언저리: …${t.slice(Math.max(0, pos - 60), pos + 160)}…`);
    if (++shown >= 6) { console.log('  (여섯 쪽까지만)'); break; }
  }
  console.log('');
}

await browser.close();
console.log('━'.repeat(78));
console.log('조사 끝 — 아무것도 커밋하지 않았습니다');
