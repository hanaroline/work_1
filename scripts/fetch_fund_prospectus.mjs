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
/**
 * --incremental : 이미 판독해 둔 결과를 그대로 두고, 설명서가 바뀐 것만 다시 읽는다.
 *
 * 전량은 3,200건 × 2.6초 = 두 시간이 넘는다. 그런데 하루 사이에 설명서가 바뀌는 것은
 * 보통 수십 건이다(2026-08-31 → 09-06 사이 51건). 안 바뀐 3,100건을 다시 읽어 봐야
 * 같은 값이 나오므로 러너만 붙잡는다.
 *
 * 무엇이 바뀌었는지는 카탈로그의 설명서 참조(docT/docG)로 가른다. 그래서 판독 결과에
 * 종목마다 그때 읽은 참조(refs)를 남긴다 — 남기지 않으면 다음 판에 무엇을 다시
 * 읽어야 하는지 알 길이 없다. 참조가 없는 종목(새로 생겼거나 지난번에 실패한 것)은
 * 다시 읽는다.
 */
const INCREMENTAL = args.includes('--incremental');
/**
 * --seed-refs 카탈로그경로 : 참조를 안 남기던 판이 만든 결과에 참조를 채워 넣는다.
 *
 * 지금 있는 data/fund-prospectus.js 는 참조를 남기기 전에 만든 것이라 무엇을 읽었는지
 * 적혀 있지 않다. 그래도 그때 쓴 카탈로그가 무엇인지는 안다 — 그 카탈로그의 docT/docG
 * 가 곧 그때 읽은 문서다. 그것을 참조로 채우면 전량을 두 시간 다시 읽지 않아도 된다.
 *
 * 카탈로그를 잘못 대면 어떻게 되나 — 참조가 어긋나 그 종목을 「다시 읽는」 쪽으로
 * 기운다. 안 읽고 넘어가는 쪽이 아니라 더 읽는 쪽이므로 값이 낡을 위험은 없다.
 * 다만 그 카탈로그에 없는 종목은 참조를 채우지 않아 어차피 다시 읽는다.
 */
const SEED_REFS = argOf('--seed-refs', '');

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
/**
 * 이 종목이 지금 가리키는 설명서 — 이것이 바뀌면 다시 읽어야 한다.
 *
 * 문서번호(docT/docG)만으로 가리지 않고 게시일(docAt)까지 넣는다. 번호가 그대로인 채
 * 게시일만 올라간 것이 2026-08-31 → 09-06 사이에 49건 있었다. 같은 파일을 다시 올린
 * 것으로 보이지만, 같은 이름으로 내용을 갈아끼웠을 가능성을 배제할 수 없다.
 * 49건을 더 읽는 데 2분이면 되고, 안 읽고 낡은 문구를 남기는 쪽이 훨씬 비싸다.
 */
const refOf = (x) => (x.docT ? 'T' : 'G') + (x.docT || x.docG) + '@' + (x.docAt || '');

/* ── 이어서 판독할 때 쓸 직전 결과 ───────────────────────────── */
let prev = null;
if (INCREMENTAL) {
  try {
    const pg = {};
    new Function('window', await readFile(OUT, 'utf8'))(pg);
    prev = pg.FUND_PROSPECTUS || null;
  } catch {
    prev = null;
  }
  if (!prev) {
    console.log(`${OUT} 을 읽지 못했습니다 — 이어서 판독할 것이 없으므로 전량 판독합니다.`);
  } else if (!prev.refs && SEED_REFS) {
    const sg = {};
    new Function('window', await readFile(SEED_REFS, 'utf8'))(sg);
    const seedCat = sg.FUND_CATALOG;
    const seeded = {};
    for (const x of seedCat.items) {
      if (!prev.items[x.code]) continue;
      if (!(x.docT || x.docG)) continue;
      /* refOf 를 그대로 쓴다. 앞 판은 여기서 참조를 손으로 다시 조립하다가
         게시일(@docAt)을 빠뜨렸다 — 그래서 채운 참조가 refOf 와 형식이 달라
         3,019건이 전부 「바뀐 것」 으로 잡히고 두 시간 전량 판독이 돌았다.
         가르는 기준은 한 군데(refOf)에만 둔다. */
      seeded[x.code] = refOf(x);
    }
    prev = { ...prev, refs: seeded };
    console.log(
      `${SEED_REFS} (기준 ${seedCat.updatedAt}) 로 설명서 참조 ${Object.keys(seeded).length}건을 채웠습니다 — ` +
      `판독 결과 ${Object.keys(prev.items).length}건 중 ${Object.keys(prev.items).length - Object.keys(seeded).length}건은 참조를 못 채워 다시 읽습니다.`
    );
  } else if (!prev.refs) {
    // 참조를 안 남기던 판이 만든 결과다. 무엇이 바뀌었는지 알 수 없으므로
    // 있는 것을 바뀐 것으로 치지 않는다 — 전량 다시 읽어 참조를 남긴다.
    console.log(`${OUT} 에 설명서 참조(refs)가 없습니다 — 무엇이 바뀌었는지 가릴 수 없어 전량 판독합니다 (--seed-refs 로 채울 수 있습니다).`);
    prev = null;
  }
}

const prevItems = (prev && prev.items) || {};
const prevPool = (prev && prev.pool) || [];
const prevRefs = (prev && prev.refs) || {};

const spread0 = EVERY ? targets.filter((x, n) => n % EVERY === 0) : targets;
const spread = prev
  ? spread0.filter((x) => prevRefs[x.code] !== refOf(x))
  : spread0;
const slice = spread.slice(FROM, LIMIT ? FROM + LIMIT : undefined);

if (prev) {
  const kept = targets.filter((x) => prevRefs[x.code] === refOf(x)).length;
  const gone = Object.keys(prevItems).filter((c) => !targets.some((x) => x.code === c)).length;
  console.log(
    `이어서 판독 — 설명서 ${targets.length}건 중 그대로 ${kept}건은 직전 판독을 쓰고, ` +
    `${spread.length}건만 다시 읽습니다 (판매 종료로 빠지는 ${gone}건 제외)`
  );
  /**
   * 이어서 판독하겠다고 했는데 직전 판독을 하나도 못 쓴다면, 하루 사이에 설명서가
   * 전부 바뀐 것이 아니라 참조를 맞대는 방식이 어긋난 것이다. 실제로 그렇게
   * 두 시간짜리 전량 판독이 한 번 돌았다(참조를 조립할 때 게시일을 빠뜨렸다).
   * 조용히 넘어가면 다음에도 같은 일이 되풀이되므로 로그에 크게 남긴다.
   */
  if (!kept && Object.keys(prevRefs).length) {
    console.log(
      '::warning::이어서 판독인데 직전 판독을 하나도 쓰지 못했습니다 — 참조 형식이 어긋난 것으로 보입니다.\n' +
      `  직전 참조 표본  ${Object.values(prevRefs)[0]}\n` +
      `  지금 참조 표본  ${refOf(targets[0])}\n` +
      '  이대로 전량을 읽습니다 (결과는 옳지만 두 시간이 걸립니다).'
    );
  }
} else {
  console.log(`투자설명서 ${targets.length}건 중 ${slice.length}건 판독 (from ${FROM})`);
}
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
const refs = {};

/* 다시 읽지 않는 종목은 직전 판독을 그대로 옮긴다. 문구 풀은 새로 짜므로
   옛 번호를 값으로 되돌려 다시 담는다 — 옛 번호를 그대로 두면 딴 문구를 가리킨다.
   카탈로그에서 빠진 종목(판매 종료)은 옮기지 않는다. */
if (prev) {
  const live = new Set(targets.map((x) => x.code));
  let carried = 0;
  for (const code of Object.keys(prevItems)) {
    if (!live.has(code)) continue;
    if (slice.some((x) => x.code === code)) continue;   // 이번에 다시 읽는다
    const f = {};
    for (const [k, idx] of Object.entries(prevItems[code])) {
      const v = prevPool[idx];
      if (v === undefined) continue;
      f[k] = intern(v);
    }
    if (Object.keys(f).length) { items[code] = f; refs[code] = prevRefs[code]; carried++; }
  }
  console.log(`  직전 판독에서 옮긴 것 ${carried}건`);
}

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
    if (Object.keys(f).length) { items[it.code] = f; refs[it.code] = refOf(it); ok++; }
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
  ' *\n' +
  ' * refs[표준코드] = 그 값을 뽑아낸 설명서 (T/G + 문서번호).\n' +
  ' * 카탈로그의 설명서가 이것과 달라지면 --incremental 판독이 그 종목만 다시 읽는다.\n' +
  ' */\n' +
  'window.FUND_PROSPECTUS = ' + JSON.stringify({
    updatedAt: new Date().toISOString(),
    source: '펀드 투자설명서 PDF 판독',
    count: Object.keys(items).length,
    pool,
    refs,
    items,
  }) + ';\n';
await writeFile(OUT, body);
console.log(`\n${OUT} 기록 — ${Object.keys(items).length}건 · 이번에 읽은 것 ${ok}건 · 실패 ${fail} · 빈문서 ${empty}`);
console.log(`  문구 풀 ${pool.length}개 (중복 제거)`);
console.log(`  크기 ${(Buffer.byteLength(body) / 1024 / 1024).toFixed(2)}MB`);
if (prev) {
  /* 설명서가 바뀌었는데 이번에 못 읽은 종목은 직전 값을 물려주지 않는다.
     바뀐 설명서를 두고 옛 설명서의 문구를 창구가 읽으면 그게 오독이다.
     담지 않으면 화면에서 「확인필요」로 남아 창구가 원문을 확인한다. */
  const lost = slice.filter((x) => !items[x.code]).length;
  if (lost) console.log(`  설명서가 바뀌었으나 이번에 읽지 못한 ${lost}건은 담지 않습니다 (화면에서 「확인필요」).`);
}
