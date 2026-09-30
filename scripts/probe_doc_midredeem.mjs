#!/usr/bin/env node
/**
 * 교부문서에서 **한 자리의 원문이 뭐라고 적혀 있는지** 찍어 본다 (읽기만 한다).
 *
 *   node scripts/probe_doc_midredeem.mjs --name 38165e 38158     원문 펼치기
 *   node scripts/probe_doc_midredeem.mjs --try-fix                전량에 고침안 재 보기
 *
 * 왜 이게 따로 있나
 *   build_doc_pages.mjs 에도 진단이 있지만 **앞의 두 건만** 105자씩 찍고 끝난다
 *   (diagShown < 2). 2026-09-30 에 38165e·38158 의 중도상환 자리가 비었는데
 *   그 진단은 38142 에서 이미 소진돼 까닭을 볼 수 없었다.
 *
 *   제목 정규식을 원문 없이 고치면 또 틀린다 — 펀드 과세 자리를 두 번 헛고치고
 *   원문을 보고서야 한 번에 끝냈다. 그 절차를 여기서도 지킨다.
 *
 * ── 2026-09-30 조사로 알아낸 것 ──────────────────────────────────
 *   표현은 회차마다 **똑같다**. 다른 것은 표가 쪽을 걸치는 자리다.
 *
 *     38169e (76쪽)  p.17 「5. 중도상환에 대한 사항」(416자)
 *                    p.18 「중도상환가격 평가일 …」 ← 표가 쪽 맨 앞(0자)  ✓ 잡힘
 *     38158  (81쪽)  p.18 「5. 중도상환에 대한 사항」(531자)
 *                         그 뒤로 표 제목행이 쪽 아래로 밀림      ✗ 220자 밖
 *                    p.19 「신청가능일 …」(26자) ← 표 중간 행부터
 *
 *   그래서 지금 규칙을 **쪽 전체로 넓히면 p.18·p.19 둘 다 걸려 「여러 쪽이라
 *   비움」** 이 된다. 넓히는 것만으로는 안 되고, 차례를 둔 대비책이 필요하다.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const SCREEN = '/hks/hks4022/n01.do';
const DOC = (isin) => `/public/editor/elsdls/${isin}.pdf`;
const HEAD_CHARS = 220;                       /* 생성기와 같은 값 */
const RULE = /중도상환가격\s*평가일/;          /* 지금 쓰는 규칙 (쪽 앞부분에서 찾는다) */
const FALLBACK = /5\s*\.\s*중도상환에\s*대한\s*사항/;  /* 고침안 — 절 제목, 쪽 전체에서 찾는다 */
const BOUNDARY = /투\s*자\s*설\s*명\s*서\s*20\d\d년/;
const LOOSE = /중\s*도\s*상\s*환/;

const argv = process.argv.slice(2);
const TRY_FIX = argv.includes('--try-fix');
const byName = argv[0] === '--name';
const want = byName ? argv.slice(1) : argv.filter((a) => !a.startsWith('--'));

const g = {};
new Function('window', readFileSync('data/els.js', 'utf8'))(g);
const all = g.ELS_DATA.products;

let targets;
if (TRY_FIX) targets = all;
else if (byName) targets = want.map((n) => all.find((p) => p.name.includes(n))).filter(Boolean);
else targets = want.map((c) => all.find((p) => p.code === c) || { code: c, name: c });

if (!targets.length) { console.error('대상을 못 찾았습니다'); process.exit(1); }
console.log(`대상 ${targets.length}건${TRY_FIX ? ' (전량 · 고침안 재 보기)' : ''}\n`);

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

const readDoc = (isin) => page.evaluate(async (u) => {
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
}, ORIGIN + DOC(isin));

const briefEnd = (pages) => {
  const i = pages.findIndex((t) => BOUNDARY.test(t.slice(0, HEAD_CHARS)));
  return i < 0 ? pages.length : i;
};
/* 한 쪽에만 걸릴 때만 담는다 — 여러 쪽이면 어느 쪽을 짚을지 고를 수 없다 */
const oneHit = (pages, to, re, whole) => {
  const hits = [];
  for (let i = 0; i < to; i++) if (re.test(whole ? pages[i] : pages[i].slice(0, HEAD_CHARS))) hits.push(i + 1);
  return hits;
};

if (TRY_FIX) {
  /* ★ 늘어난 것과 줄어든 것을 함께 센다 ★ 전량을 바꿀 때의 규율이다. */
  let same = 0, gained = 0, lost = 0, moved = 0, failed = 0;
  const gainedEx = [], lostEx = [], movedEx = [];
  for (const p of targets) {
    const doc = await readDoc(p.code);
    if (doc.error) { failed++; console.log(`  ✗ ${p.name} — ${doc.error}`); continue; }
    const to = briefEnd(doc.pages);
    const now = oneHit(doc.pages, to, RULE, false);
    const nowVal = now.length === 1 ? now[0] : 0;
    let fixVal = nowVal;
    let via = '지금 규칙';
    if (!nowVal) {
      const fb = oneHit(doc.pages, to, FALLBACK, true);
      if (fb.length === 1) { fixVal = fb[0]; via = '대비책(절 제목)'; }
      else via = fb.length ? `대비책도 여러 쪽 p.${fb.join(',')}` : '대비책도 못 찾음';
    }
    const nm = p.name.replace('미래에셋증권', '');
    if (nowVal && fixVal === nowVal) same++;
    else if (!nowVal && fixVal) { gained++; gainedEx.push(`${nm} → p.${fixVal} (${via})`); }
    else if (nowVal && !fixVal) { lost++; lostEx.push(`${nm} p.${nowVal} → 빈칸`); }
    else if (nowVal && fixVal !== nowVal) { moved++; movedEx.push(`${nm} p.${nowVal} → p.${fixVal}`); }
    else lostEx.push(`${nm} 여전히 빈칸 (${via})`);
    console.log(`  ${nm.padEnd(14)} ${doc.numPages}쪽 · 지금 ${nowVal ? 'p.' + nowVal : '빈칸'} → 고침안 ${fixVal ? 'p.' + fixVal : '빈칸'}  [${via}]`);
  }
  console.log('\n' + '━'.repeat(70));
  console.log(`그대로 ${same}건 · 새로 채움 ${gained}건 · 잃음 ${lost}건 · 쪽 바뀜 ${moved}건 · 못 받음 ${failed}건`);
  if (gainedEx.length) { console.log('\n새로 채운 것:'); gainedEx.forEach((s) => console.log('   + ' + s)); }
  if (lostEx.length) { console.log('\n★ 잃거나 여전히 빈 것:'); lostEx.forEach((s) => console.log('   - ' + s)); }
  if (movedEx.length) { console.log('\n★ 쪽이 바뀐 것 (까닭을 대야 함):'); movedEx.forEach((s) => console.log('   ~ ' + s)); }
  console.log(lost || moved ? '\n★ 잃거나 바뀐 것이 있다 — 올리기 전에 원문을 볼 것' : '\n잃은 것도 바뀐 것도 없다');
} else {
  for (const p of targets) {
    console.log('━'.repeat(78));
    console.log(`${p.name}  (${p.code})`);
    console.log('━'.repeat(78));
    const doc = await readDoc(p.code);
    if (doc.error) { console.log(`  ✗ ${doc.error}\n`); continue; }
    const to = briefEnd(doc.pages);
    console.log(`전체 ${doc.numPages}쪽 · 간이투자설명서 구간 p.1~${to}\n`);
    console.log(`[지금 규칙 ${RULE}] 앞부분 ${HEAD_CHARS}자: ${oneHit(doc.pages, to, RULE, false).map((x) => 'p.' + x).join(', ') || '없음'}`);
    console.log(`[같은 규칙 · 쪽 전체] ${oneHit(doc.pages, to, RULE, true).map((x) => 'p.' + x).join(', ') || '없음'}`);
    console.log(`[대비책 ${FALLBACK} · 쪽 전체] ${oneHit(doc.pages, to, FALLBACK, true).map((x) => 'p.' + x).join(', ') || '없음'}`);
    console.log('');
    console.log('[느슨하게 「중도상환」 이 나오는 자리 · 간이 구간]');
    let shown = 0;
    for (let i = 0; i < to; i++) {
      const t = doc.pages[i]; const m = t.match(LOOSE);
      if (!m) continue;
      const pos = m.index;
      console.log(`  p.${String(i + 1).padStart(2)}  쪽 안 위치 ${pos}자${pos > HEAD_CHARS ? '  ← 앞부분(' + HEAD_CHARS + '자) 밖' : ''}`);
      console.log(`        앞머리: ${t.slice(0, 150)}`);
      console.log(`        언저리: …${t.slice(Math.max(0, pos - 60), pos + 160)}…`);
      if (++shown >= 6) { console.log('  (여섯 쪽까지만)'); break; }
    }
    console.log('');
  }
}

await browser.close();
console.log('━'.repeat(78));
console.log('조사 끝 — 아무것도 커밋하지 않았습니다');
