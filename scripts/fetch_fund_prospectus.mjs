#!/usr/bin/env node
/**
 * 펀드 투자설명서 미리 판독 — data/fund-prospectus.js
 *
 *   node scripts/fetch_fund_prospectus.mjs [--limit N] [--from N] [--out 경로]
 *
 * 카탈로그(data/fund-catalog.js)가 갖고 있는 투자설명서 PDF 주소를 받아 텍스트를 뽑고,
 * js/sales-script-prospectus.js 의 RULES.fund 로 항목을 추출해 담는다.
 *
 * ── 왜 미리 판독하나 ────────────────────────────────────────────
 * 브라우저는 다른 도메인의 파일을 앱이 직접 읽는 것을 막는다(CORS). 게다가 이 도구는
 * 인터넷이 없는 업무용PC 에서 쓴다. 그래서 ELS 와 같은 방식이 필요하다 —
 * 판독은 러너에서 미리 해 두고, 결과만 파일에 실어 오프라인에서 쓴다.
 *
 * ── 무엇을 담나 ─────────────────────────────────────────────────
 * 카탈로그에 이미 있는 것(명칭·운용사·유형·위험등급·수익률·기준일)은 담지 않는다.
 * 투자설명서에만 있는 것만 담는다 — 보수·수수료, 환매수수료, 계약기간, 투자전략,
 * 주요 투자위험, VaR, 유동성위험, 환헤지. 그래야 파일이 커지지 않는다.
 *
 * ★ 값을 만들어내지 않는다 ★ 원문에서 못 읽은 것은 담지 않아 화면에서 「확인필요」로 남는다.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LIMIT = Number(argOf('--limit', 0)) || 0;
const FROM = Number(argOf('--from', 0)) || 0;
const OUT = argOf('--out', 'data/fund-prospectus.js');
/**
 * --dump 경로 : 판독한 본문을 그대로 저장한다.
 * 추출 규칙을 손볼 때 원문이 있어야 한다. 이 PC 에서는 stock.pstatic.net 이 막혀 있어
 * PDF 를 받을 수 없으므로, 러너에서 표본을 받아 두고 규칙은 그 표본으로 다듬는다.
 * --every N : N건마다 한 건씩만 골라 운용사가 골고루 섞이게 한다.
 */
const DUMP = argOf('--dump', '');
const EVERY = Number(argOf('--every', 0)) || 0;

/* ── 앱과 똑같은 추출 규칙·본문 판독을 쓴다 ───────────────── */
const prosSrc = await readFile('js/sales-script-prospectus.js', 'utf8');
const win = {};
new Function('window', prosSrc)(win);
const PROS = win.SS_PROS;
if (!PROS) throw new Error('js/sales-script-prospectus.js 를 불러오지 못했습니다.');

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

/**
 * PDF -> 텍스트. 앱의 pdfToText 와 같은 규칙으로 만든다 —
 * y 가 바뀌면 줄을 나누고, 폭이 넓은 공백 항목은 표의 칸 구분(탭)으로 본다.
 * 여기서 서식이 달라지면 앱에서 통하던 규칙이 러너에서는 안 통한다.
 */
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
  return { text: chunks.join('\n'), pages: doc.numPages };
}
/** 줄바꿈으로 끊긴 본문을 잇는다 (앱과 같은 규칙) */
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

/* 카탈로그에 이미 있는 항목은 담지 않는다 */
const SKIP = new Set(['name', 'mgr', 'fundType', 'riskGrade', 'riskLabel', 'targets',
  'ret1y', 'retPeer', 'buyCut', 'buyBefore', 'buyAfter', 'redBefore', 'redAfter', 'redPay', 'docDate']);
/* 서술 항목은 길어서 잘라 담는다 — 파일 크기가 곧 배포 가능성이다 */
const CAP = { risk1: 170, risk2: 170, strategy: 200 };

const catSrc = await readFile('data/fund-catalog.js', 'utf8');
const cg = {};
new Function('window', catSrc)(cg);
const C = cg.FUND_CATALOG;
const base = C.docBase;
const targets = C.items.filter((x) => x.docT || x.docG);
const spread = EVERY ? targets.filter((x, n) => n % EVERY === 0) : targets;
const slice = spread.slice(FROM, LIMIT ? FROM + LIMIT : undefined);
console.log(`투자설명서 ${targets.length}건 중 ${slice.length}건 판독 (from ${FROM})`);
if (DUMP) await mkdir(DUMP, { recursive: true });

/**
 * 같은 문구가 펀드마다 되풀이된다 — 시장위험·환매수수료 없음·개방형 설명 등은
 * 운용사·유형이 같으면 글자까지 같다. 그대로 실으면 3,000건에 3.5MB 가 되어
 * 단일 파일이 7MB 를 넘는다. 값을 한 번만 담고 번호로 가리킨다.
 */
const pool = [];
const poolIdx = new Map();
const intern = (v) => {
  const k = String(v);
  if (poolIdx.has(k)) return poolIdx.get(k);
  const i = pool.length;
  pool.push(k); poolIdx.set(k, i);
  return i;
};

const items = {};
let ok = 0, fail = 0, empty = 0;
for (let i = 0; i < slice.length; i++) {
  const it = slice[i];
  const kind = it.docT ? 'T' : 'G';
  const url = `${base}${it.code}/${it.code}_${kind}_${it.docT || it.docG}.pdf`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const { text, pages } = await pdfText(Buffer.from(await r.arrayBuffer()));
    if (text.length < 300) { empty++; continue; }
    if (DUMP) await writeFile(`${DUMP}/${it.code}.txt`, it.name + '\n' + text);
    const f = {};
    for (const x of PROS.extract(text, 'fund')) {
      if (SKIP.has(x.id)) continue;
      f[x.id] = intern(CAP[x.id] ? String(x.value).slice(0, CAP[x.id]) : x.value);
    }
    /* varBasis 는 varPct 가 없을 때만 쓰는 값이다 — 둘 다 담을 이유가 없다 */
    if (f.varPct != null && f.varBasis != null) delete f.varBasis;
    /* affiliate 는 운용사명으로 화면에서 판정한다 (계열=미래에셋) — 담지 않는다 */
    delete f.affiliate;
    if (Object.keys(f).length) { items[it.code] = f; ok++; }
    if ((i + 1) % 25 === 0 || i === slice.length - 1) {
      console.log(`  ${i + 1}/${slice.length} · 추출 ${ok}건 · 실패 ${fail} · 빈문서 ${empty} (${it.code} ${pages}쪽 ${Object.keys(f).length}항목)`);
    }
  } catch (e) {
    fail++;
    if (fail <= 5) console.log(`  ${it.code} 실패 — ${e.name} ${e.message}`);
  }
}

const body =
  '/**\n' +
  ' * 펀드 투자설명서 판독 결과 — 투자설명서에만 있는 항목\n' +
  ' *\n' +
  ' * 생성 : scripts/fetch_fund_prospectus.mjs (러너에서 실행)\n' +
  ' * FUND_PROSPECTUS.items[표준코드] = { clsA, clsAExp, clsCExp, redeemFee, term,\n' +
  ' *   redeemable, strategy, risk1, risk2, varPct, liqRisk, fxHedge, fxHedgeSize, ... }\n' +
  ' *\n' +
  ' * 값은 pool 에 한 번만 담고 items 는 번호로 가리킨다 — 문구가 펀드마다 겹치기 때문이다.\n' +
  ' *   실제 값 = FUND_PROSPECTUS.pool[ items[코드][항목] ]\n' +
  ' *\n' +
  ' * 카탈로그(data/fund-catalog.js)에 이미 있는 항목은 담지 않는다.\n' +
  ' * 원문에서 못 읽은 것은 담지 않으므로 화면에서 「확인필요」로 남는다.\n' +
  ' */\n' +
  'window.FUND_PROSPECTUS = ' + JSON.stringify({
    updatedAt: new Date().toISOString(),
    source: '펀드 투자설명서 PDF 판독',
    count: Object.keys(items).length,
    pool,
    items,
  }) + ';\n';
await writeFile(OUT, body);
console.log(`\n${OUT} 기록 — ${Object.keys(items).length}건 · 실패 ${fail} · 빈문서 ${empty}`);
console.log(`  문구 풀 ${pool.length}개 (중복 제거)`);
console.log(`  크기 ${(Buffer.byteLength(body) / 1024 / 1024).toFixed(2)}MB`);
