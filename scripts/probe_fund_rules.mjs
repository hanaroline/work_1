#!/usr/bin/env node
/**
 * 펀드 투자설명서 판독 규칙 시험 — 러너에서 돌린다
 *
 *   node scripts/probe_fund_rules.mjs [--limit N] [--every N] [--show 항목,항목]
 *
 * 왜 이 스크립트가 있나. 규칙을 다듬으려면 원문 서식을 봐야 하는데, 개발 PC 에서는
 * stock.pstatic.net 이 막혀 PDF 를 받을 수 없고 아티팩트 내려받기도 막혀 있다.
 * 그래서 원문을 가져오는 대신 원문을 보는 눈을 러너에 보낸다 —
 * 표본을 판독해 항목별 성공률을 내고, 못 읽은 항목은 그 항목의 낱말이 들어 있는
 * 줄을 그대로 찍어 준다. 그 출력을 보고 규칙을 고쳐 다시 돌린다.
 *
 * 저장소에 아무것도 쓰지 않는다 (판독 결과 파일도 만들지 않는다).
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LIMIT = Number(argOf('--limit', 40)) || 40;
const EVERY = Number(argOf('--every', 79)) || 79;
/* 못 읽었을 때 원문 줄을 찍어 볼 항목 */
/* 'none' 이면 성공률만 낸다 — 표가 로그 끝에 오므로 한눈에 보인다 */
const SHOW = String(argOf('--show', 'clsAExp,clsA,varPct,strategy'))
  .split(',').filter((x) => x && x !== 'none');
/* 항목마다 원문에서 찾아 볼 낱말 — 이 낱말이 든 줄을 찍는다 */
const PROBE = {
  clsA: [/선취/, /판매\s*수수료/],
  clsAExp: [/총\s*보수/, /합성/, /보수[·•∙]\s*비용/],
  clsCExp: [/종류\s*C|Class\s*C|\(C\d?\)/],
  varPct: [/최대\s*손실/, /VaR/i, /3\s*년이/],
  varBasis: [/3\s*년이/, /위험등급을?\s*(?:부여|분류|산정)/],
  strategy: [/투자\s*전략/, /운용\s*전략/],
  risk1: [/투자\s*위험/, /위험의?\s*핵심/],
  fxHedge: [/환\s*헤지/, /환위험/],
  fxHedgeSize: [/헤지\s*비율/, /목표\s*환/],
  redeemFee: [/환매\s*수수료/],
  term: [/존속\s*기간|계약\s*기간|신탁\s*계약\s*기간/],
};

const prosSrc = await readFile('js/sales-script-prospectus.js', 'utf8');
const win = {};
new Function('window', prosSrc)(win);
const PROS = win.SS_PROS;

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

/* 앱의 pdfToText 와 같은 규칙 — 서식이 달라지면 시험 결과가 거짓이 된다 */
async function pdfText(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const chunks = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const tc = await page.getTextContent();
    let lastY = null, lastEnd = null, line = [];
    const lines = [];
    const flush = () => { if (line.length) lines.push(line.join('').replace(/[ \t]+$/, '')); line = []; };
    for (const it of tc.items) {
      const tr = it.transform || [];
      const y = tr.length ? Math.round(tr[5]) : null;
      const x = tr.length ? tr[4] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) { flush(); lastEnd = null; }
      if (/^\s*$/.test(it.str)) {
        if (x !== null) lastEnd = x + (it.width || 0);
        if (y !== null) lastY = y;
        if (line.length) line.push((it.width || 0) > 8 ? '\t' : ' ');
        continue;
      }
      if (lastEnd !== null && x !== null && x - lastEnd > 8 && !/\t$/.test(line[line.length - 1] || '')) line.push('\t');
      line.push(it.str);
      if (x !== null) lastEnd = x + (it.width || 0);
      lastY = y;
    }
    flush();
    chunks.push(unwrap(lines).join('\n'));
  }
  return chunks.join('\n');
}
function unwrap(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    let cur = lines[i];
    while (cur.indexOf('\t') < 0 && cur.length >= 40 && /[가-힣,·]$/.test(cur) &&
      i + 1 < lines.length && lines[i + 1].indexOf('\t') < 0 &&
      !/^\s*(?:\d+\s*[.)]|[○◦□■※【(])/.test(lines[i + 1]) && lines[i + 1].trim()) {
      cur += lines[i + 1].trim(); i++;
    }
    out.push(cur);
  }
  return out;
}

const catSrc = await readFile('data/fund-catalog.js', 'utf8');
const cg = {};
new Function('window', catSrc)(cg);
const C = cg.FUND_CATALOG;
const P = C.pool || [];
const un = (v) => (typeof v === 'number' ? P[v] : v);
const withDoc = C.items.filter((x) => x.docT || x.docG);
const slice = withDoc.filter((x, n) => n % EVERY === 0).slice(0, LIMIT);
console.log(`표본 ${slice.length}건 (전체 ${withDoc.length}건에서 ${EVERY}건마다 1건)\n`);

const cnt = {}, seen = [];
for (const it of slice) {
  const kind = it.docT ? 'T' : 'G';
  const url = `${C.docBase}${it.code}/${it.code}_${kind}_${it.docT || it.docG}.pdf`;
  let text = '';
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    text = await pdfText(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    console.log(`  ${it.code} 실패 — ${e.message}`);
    continue;
  }
  if (text.length < 300) { console.log(`  ${it.code} 빈 문서`); continue; }
  const got = {};
  for (const x of PROS.extract(text, 'fund')) got[x.id] = x.value;
  Object.keys(got).forEach((k) => { cnt[k] = (cnt[k] || 0) + 1; });
  seen.push({ it, got, text });
}

console.log(`\n판독 ${seen.length}건 · 항목별 성공률`);
const ALL = Object.keys(PROBE).concat(Object.keys(cnt)).filter((v, i, a) => a.indexOf(v) === i);
ALL.sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0));
for (const f of ALL) {
  const n = cnt[f] || 0;
  console.log(`  ${f.padEnd(14)} ${String(n).padStart(3)}/${seen.length}  ${String(Math.round(100 * n / Math.max(1, seen.length))).padStart(3)}%`);
}

/**
 * 읽어 낸 값 — 성공률만 보면 「무엇이든 읽었다」 와 「제대로 읽었다」 를 구별할 수 없다.
 * 창구에서 소리 내어 읽는 문장이라 내용이 맞는지 눈으로 봐야 한다.
 */
const VAL = String(argOf('--values', '')).split(',').filter((x) => x && x !== 'none');
for (const f of VAL) {
  console.log(`\n${'='.repeat(70)}\n● ${f} — 읽어 낸 값 앞 6건`);
  for (const s of seen.filter((x) => x.got[f] != null).slice(0, 6)) {
    console.log(`\n── ${un(s.it.name)}`);
    console.log(`   ${String(s.got[f]).slice(0, 320)}`);
  }
}

/* 못 읽은 항목의 원문 줄 — 서식을 눈으로 보려면 이것이 있어야 한다 */
for (const f of SHOW) {
  const probes = PROBE[f] || [];
  const misses = seen.filter((s) => s.got[f] == null);
  console.log(`\n${'='.repeat(70)}\n■ ${f} — 못 읽은 ${misses.length}건 중 앞 4건의 원문`);
  for (const s of misses.slice(0, 4)) {
    console.log(`\n── ${un(s.it.name)} (${s.it.code})`);
    const lines = s.text.split('\n');
    let shown = 0;
    for (let i = 0; i < lines.length && shown < 14; i++) {
      if (!probes.some((p) => p.test(lines[i]))) continue;
      /* 표는 이름 줄과 숫자 줄이 갈라져 있다 — 뒤 두 줄까지 함께 본다 */
      for (let j = i; j <= Math.min(lines.length - 1, i + 2); j++) {
        console.log(`   ${String(j).padStart(5)}| ${lines[j].slice(0, 150)}`);
      }
      shown++; i += 2;
    }
    if (!shown) console.log('   (낱말이 든 줄이 없다 — 이미지 PDF 이거나 서식이 전혀 다르다)');
  }
}
