#!/usr/bin/env node
/**
 * 금융투자협회 전자공시에서 투자설명서를 받아 판독한다 — data/fund-prospectus-kofia.js
 *
 *   node scripts/collect_fund_prospectus_kofia.mjs [--limit N] [--all] [--codes 코드,코드]
 *
 * ── 왜 두 번째 원천인가 ──────────────────────────────────────────────────
 * 지금 쓰는 원천(공모펀드 카탈로그)에는 3,194종목 중 175종목의 투자설명서 주소가
 * 없다. 목표전환형 64 · 사모투자재간접 21 · 지수연계 9 종목이 그렇고, 대개 최근
 * 설정된 펀드다. 창구에서 그 종목을 고르면 설명서에서만 나오는 항목이 열 몇 건씩
 * 「확인필요」로 남는다 (창구가 짚어 준 BNK고배당주주가치목표전환형이 13건이었다).
 *
 * 금투협 전자공시는 공모펀드 투자설명서를 법정 공시한다. 판매회사 원천이 아직
 * 싣지 않은 신규 펀드도 여기에는 있다 — 설명서 주소가 없던
 * 삼성알아서투자해주는반도체목표전환형(2026-05-29 설정)으로 확인했다.
 *
 * ── 조회 계약 (scripts/probe_kofia_prospectus.mjs 로 관찰한 것) ──────────
 *   목록  POST https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/
 *         pfmAppName FS-COM · pfmSvcName COMFundUnityBasInfoSO · pfmFnName srchFile
 *         COMFundInfoFileListDTO { standardCd, uGb }
 *         응답 <list> { fileNm, serverPath, originalFileNm, standardDt }
 *   받기  GET https://disdown.kofia.or.kr/COMFSFileDownload.jsp
 *         ?serverPath=…&serverFileNm=…&filename=…
 *
 *   ★ uGb 가 문서 종류다 ★ 화면이 같은 서비스를 세 번 부르는데 uGb 만 다르다.
 *     uGb=Y  규약            (serverPath …/2RF0400)
 *     uGb=T  투자설명서       (…/2RF0500)
 *     uGb=G  간이투자설명서    (…/2RF0501)
 *   한 번 부르면 한 종류만 온다 (dbio_total_count_ = 1). 앞 판에 uGb=Y 만 걸어
 *   규약만 받아 놓고 「설명서가 없다」 고 볼 뻔했다.
 *
 * ★ 주소를 외워 쓰지 않는다 ★ 씨앗 한 종목으로 계약이 살아 있는지 먼저 확인하고,
 * 응답 모양이 달라졌으면 거기서 멈춘다 — 175번 헛부르고 나서 알 일이 아니다.
 * 멈추면 탐색기를 다시 돌려 관찰부터 한다.
 *
 * ★ 값을 만들어내지 않는다 ★ 원문에서 못 읽은 것은 담지 않아 화면에서
 * 「확인필요」로 남는다. 판독 규칙은 앱과 똑같은 것을 쓴다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LIMIT = Number(argOf('--limit', 0)) || 0;
/** 기본은 「카탈로그에 주소가 없는 종목」만. --all 이면 전 종목 (대조용) */
const ALL = args.includes('--all');
const CODES = String(argOf('--codes', '')).split(/[,\s]+/).filter(Boolean);
const OUT = argOf('--out', 'data/fund-prospectus-kofia.js');
const CONCURRENCY = Number(argOf('--concurrency', 3)) || 3;

const DIS = 'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/';
const DOWN = 'https://disdown.kofia.or.kr/COMFSFileDownload.jsp';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/* ── 앱과 똑같은 추출 규칙·본문 판독 ───────────────────────────── */
const prosSrc = await readFile('js/sales-script-prospectus.js', 'utf8');
const win = {};
new Function('window', prosSrc)(win);
const PROS = win.SS_PROS;
if (!PROS) throw new Error('js/sales-script-prospectus.js 를 불러오지 못했습니다.');
const rulesStamp = (function (s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return s.length + '-' + h.toString(36);
}(prosSrc));

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

/** PDF -> 텍스트. scripts/fetch_fund_prospectus.mjs 와 같은 규칙이어야 한다 —
    서식이 달라지면 앱에서 통하던 추출 규칙이 여기서는 안 통한다. */
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

/* 카탈로그에 이미 있는 항목은 담지 않는다 (fetch_fund_prospectus.mjs 와 같은 목록) */
const SKIP = new Set(['name', 'mgr', 'fundType', 'riskGrade', 'riskLabel', 'targets',
  'ret1y', 'retPeer', 'buyCut', 'buyBefore', 'buyAfter', 'redBefore', 'redAfter', 'redPay', 'docDate']);
const CAP = { risk1: 170, risk2: 170, strategy: 200 };

/* ── 대상 ─────────────────────────────────────────────────────── */
const cg = {};
new Function('window', await readFile('data/fund-catalog.js', 'utf8'))(cg);
const C = cg.FUND_CATALOG;
const pool0 = C.pool || [];
const un = (v) => (typeof v === 'number' ? pool0[v] : v);

let targets;
if (CODES.length) {
  targets = CODES.map((c) => C.items.find((x) => x.code === c)).filter(Boolean);
} else if (ALL) {
  targets = C.items.slice();
} else {
  targets = C.items.filter((x) => !x.docT && !x.docG);
}
if (LIMIT) targets = targets.slice(0, LIMIT);
console.log(`대상 ${targets.length}종목` +
  (CODES.length ? ' (지목)' : ALL ? ' (전 종목)' : ' (카탈로그에 설명서 주소가 없는 종목)'));
if (!targets.length) { console.log('대상이 없습니다 — 아무것도 쓰지 않고 끝냅니다.'); process.exit(0); }

/* ── 목록 조회 ─────────────────────────────────────────────────── */
function listBody(code, uGb) {
  return '<?xml version="1.0" encoding="utf-8"?>' +
    '<message><proframeHeader><pfmAppName>FS-COM</pfmAppName>' +
    '<pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName><pfmFnName>srchFile</pfmFnName>' +
    '</proframeHeader><systemHeader></systemHeader>' +
    '<COMFundInfoFileListDTO><standardCd>' + code + '</standardCd>' +
    '<uGb>' + uGb + '</uGb></COMFundInfoFileListDTO></message>';
}

/** 응답 <list> 를 뜯는다. 태그는 관찰로 확인한 것이다 (fileNm·serverPath·originalFileNm·standardDt) */
function parseList(xml) {
  const out = [];
  const re = /<list>([\s\S]*?)<\/list>/g;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[1];
    const g = (t) => {
      const r = b.match(new RegExp('<' + t + '>([\\s\\S]*?)</' + t + '>'));
      return r ? r[1].trim() : '';
    };
    const row = {
      fileNm: g('fileNm'), serverPath: g('serverPath'),
      originalFileNm: g('originalFileNm'), standardDt: g('standardDt')
    };
    if (row.fileNm && row.serverPath) out.push(row);
  }
  return out;
}

async function post(body, tries = 3) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(DIS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          Accept: 'application/xml, text/xml, */*',
          'User-Agent': UA,
          Origin: 'https://dis.kofia.or.kr',
          Referer: 'https://dis.kofia.or.kr/websquare/index.jsp'
        },
        body,
        signal: AbortSignal.timeout(20000)
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } catch (e) {
      last = e;
      if (i < tries) await new Promise((s) => setTimeout(s, 500 * 2 ** (i - 1)));
    }
  }
  throw last;
}

/**
 * 한 종목의 파일 목록. uGb 하나에 한 종류만 오므로 필요한 종류만 부른다 —
 * 정식 투자설명서(T)를 먼저, 없으면 간이(G)를. 규약(Y)은 부르지 않는다.
 */
const UGB = String(argOf('--ugb', 'T,G')).split(',').map((s) => s.trim()).filter(Boolean);
const UGB_NAME = { T: '투자설명서', G: '간이투자설명서', Y: '규약' };
async function fileList(code) {
  const rows = [];
  for (const u of UGB) {
    let xml;
    try { xml = await post(listBody(code, u)); } catch { continue; }
    for (const r of parseList(xml)) rows.push({ ...r, uGb: u });
  }
  return rows;
}

/**
 * 목록에서 투자설명서를 고른다. 간이는 마지막 수단이다 —
 * 완전판매 설명은 정식 투자설명서를 기준으로 한다.
 * 무엇을 골랐는지는 uGb 로 안다(서버가 그 종류로 준 것). 이름으로 되짚어 확인만 한다.
 */
function pickProspectus(rows) {
  for (const u of ['T', 'G']) {
    const r = rows.find((x) => x.uGb === u);
    if (!r) continue;
    /* 종류가 어긋나면(규약이 왔다든지) 그것을 설명서로 쓰지 않는다 */
    if (/^규약|^약관/.test(r.originalFileNm || '')) continue;
    return { row: r, kind: UGB_NAME[u] || u };
  }
  return null;
}

function downUrl(row) {
  return DOWN + '?serverPath=' + encodeURIComponent(row.serverPath) +
    '&serverFileNm=' + encodeURIComponent(row.fileNm) +
    '&filename=' + encodeURIComponent(row.originalFileNm || row.fileNm);
}

async function getPdf(row, tries = 3) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(downUrl(row), {
        headers: { 'User-Agent': UA, Referer: 'https://dis.kofia.or.kr/websquare/index.jsp' },
        signal: AbortSignal.timeout(60000)
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      /* PDF 가 아니면(오류 페이지 등) 판독에서 죽는 대신 여기서 가른다 */
      if (buf.slice(0, 5).toString('latin1') !== '%PDF-') {
        throw new Error('PDF 아님 (' + buf.length + '바이트, 머리 ' +
          JSON.stringify(buf.slice(0, 20).toString('latin1')) + ')');
      }
      return buf;
    } catch (e) {
      last = e;
      if (i < tries) await new Promise((s) => setTimeout(s, 600 * 2 ** (i - 1)));
    }
  }
  /* node fetch 의 「fetch failed」 는 그 자체로는 아무것도 말해 주지 않는다 —
     진짜 이유는 cause 에 있다. 그것을 붙여 던진다. */
  const c = last && last.cause;
  const msg = String(last && last.message || last) +
    (c ? ' (' + (c.code || '') + ' ' + String(c.message || c).slice(0, 120) + ')' : '');
  throw new Error(msg);
}

/* ── 씨앗으로 계약이 살아 있는지 먼저 본다 ───────────────────── */
const seed = targets[0];
console.log(`\n계약 확인 — ${seed.code} ${un(seed.name)}`);
const seedRows = await fileList(seed.code);
console.log(`  파일 ${seedRows.length}건`);
seedRows.forEach((r) => console.log('   uGb=' + r.uGb + ' · ' + r.serverPath.slice(-7) + ' · ' + r.standardDt + ' · ' + r.originalFileNm.slice(0, 70)));
const seedPick = pickProspectus(seedRows);
if (!seedPick) {
  console.error(
    '\n씨앗 종목에서 투자설명서를 못 찾았습니다 — 조회 계약이 바뀌었을 수 있습니다.\n' +
    '  · 받은 파일 목록을 위에서 확인하세요 (uGb=T 가 투자설명서, G 가 간이입니다).\n' +
    '  · scripts/probe_kofia_prospectus.mjs 로 화면이 보내는 POST 를 다시 관찰하세요.\n' +
    `  · ${OUT} 은 그대로 두므로 페이지는 직전 결과를 유지합니다.`
  );
  process.exit(1);
}
console.log(`  → ${seedPick.kind} 로 진행합니다 (${seedPick.row.originalFileNm.slice(0, 60)})`);
/* 받아서 판독까지 되는지도 씨앗으로 미리 본다 — 목록만 되고 내려받기가 막히면 전수가 헛돈다 */
try {
  const { text, pages } = await pdfText(await getPdf(seedPick.row));
  const got = PROS.extract(text, 'fund').filter((x) => !SKIP.has(x.id));
  console.log(`  내려받기·판독 확인 — ${pages}쪽 · 본문 ${text.length}자 · 항목 ${got.length}개`);
  if (!got.length) throw new Error('판독 항목 0개');
} catch (e) {
  console.error(
    '\n씨앗 종목을 받아 판독하지 못했습니다 — ' + String(e && e.message || e) + '\n' +
    `  · ${OUT} 은 그대로 둡니다.`
  );
  process.exit(1);
}

/* ── 전수 ─────────────────────────────────────────────────────── */
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
const kinds = {};
let ok = 0, noDoc = 0, fail = 0, empty = 0, done = 0;
const misses = [];

async function one(it) {
  try {
    const rows = await fileList(it.code);
    const pick = pickProspectus(rows);
    if (!pick) { noDoc++; misses.push({ code: it.code, why: '금투협에도 설명서 없음 (파일 ' + rows.length + '건)' }); return; }
    const { text, pages } = await pdfText(await getPdf(pick.row));
    if (text.length < 300) { empty++; misses.push({ code: it.code, why: '본문 ' + text.length + '자' }); return; }
    const f = {};
    for (const x of PROS.extract(text, 'fund')) {
      if (SKIP.has(x.id)) continue;
      f[x.id] = intern(CAP[x.id] ? String(x.value).slice(0, CAP[x.id]) : x.value);
    }
    if (f.varPct != null && f.varBasis != null) delete f.varBasis;
    delete f.affiliate;
    if (!Object.keys(f).length) { empty++; misses.push({ code: it.code, why: '판독 항목 0개 (' + pages + '쪽)' }); return; }
    items[it.code] = f;
    refs[it.code] = pick.row.serverPath.slice(-7) + '/' + pick.row.fileNm;
    kinds[pick.kind] = (kinds[pick.kind] || 0) + 1;
    ok++;
  } catch (e) {
    fail++;
    if (fail <= 8) console.log(`  ${it.code} 실패 — ${String(e && e.message || e).slice(0, 90)}`);
    misses.push({ code: it.code, why: String(e && e.message || e).slice(0, 60) });
  } finally {
    done++;
    if (done % 20 === 0 || done === targets.length) {
      console.log(`  ${done}/${targets.length} · 판독 ${ok} · 설명서없음 ${noDoc} · 실패 ${fail} · 빈문서 ${empty}`);
    }
  }
}

/* 공시 서버를 몰아치지 않는다 — 동시 3, 요청 사이 짧은 틈 */
console.log('');
const queue = targets.slice();
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
  while (queue.length) {
    const it = queue.shift();
    await one(it);
    await new Promise((s) => setTimeout(s, 150));
  }
}));

/* ── 기록 ─────────────────────────────────────────────────────── */
const body =
  '/**\n' +
  ' * 금융투자협회 전자공시 투자설명서 판독 결과 (두 번째 원천)\n' +
  ' *\n' +
  ' * 생성 : scripts/collect_fund_prospectus_kofia.mjs (러너에서 실행)\n' +
  ' * 왜   : 공모펀드 카탈로그(원천)에 설명서 주소가 없는 종목을 메운다.\n' +
  ' *        앱은 data/fund-prospectus.js 를 먼저 보고, 없을 때 이 파일을 본다.\n' +
  ' *\n' +
  ' * FUND_PROSPECTUS_KOFIA.items[표준코드] = { …항목: pool 번호 }\n' +
  ' *   실제 값 = FUND_PROSPECTUS_KOFIA.pool[ items[코드][항목] ]\n' +
  ' * refs[표준코드] = 그 값을 뽑아낸 문서 (공시 경로 끝자리/파일명)\n' +
  ' *\n' +
  ' * 카탈로그에 이미 있는 항목은 담지 않는다.\n' +
  ' * 원문에서 못 읽은 것은 담지 않으므로 화면에서 「확인필요」로 남는다.\n' +
  ' */\n' +
  'window.FUND_PROSPECTUS_KOFIA = ' + JSON.stringify({
    updatedAt: new Date().toISOString(),
    source: '금융투자협회 전자공시 (dis.kofia.or.kr) 투자설명서 PDF 판독',
    count: Object.keys(items).length,
    scope: CODES.length ? 'codes' : (ALL ? 'all' : 'catalog-missing'),
    kinds,
    rulesStamp,
    pool,
    refs,
    items
  }) + ';\n';
await writeFile(OUT, body);

console.log(`\n${OUT} 기록 — ${Object.keys(items).length}건`);
console.log(`  대상 ${targets.length} · 판독 ${ok} · 금투협에도 없음 ${noDoc} · 실패 ${fail} · 빈문서 ${empty}`);
console.log(`  문서 종류: ${JSON.stringify(kinds)}`);
console.log(`  문구 풀 ${pool.length}개 · 크기 ${(Buffer.byteLength(body) / 1024 / 1024).toFixed(2)}MB`);

/* 항목별 성공률 — 무엇이 여전히 확인필요로 남는지 */
const cnt = {};
Object.keys(items).forEach((k) => Object.keys(items[k]).forEach((f) => { cnt[f] = (cnt[f] || 0) + 1; }));
const n = Math.max(1, Object.keys(items).length);
console.log('\n항목별 판독률');
Object.entries(cnt).sort((a, b) => b[1] - a[1])
  .forEach(([f, v]) => console.log('  ' + f.padEnd(14) + String(v).padStart(4) + '건  ' + Math.round(100 * v / n) + '%'));

if (misses.length) {
  console.log('\n못 담은 종목 ' + misses.length + '건 (앞 20)');
  misses.slice(0, 20).forEach((m) => console.log('  ' + m.code + ' — ' + m.why));
}

/* 하나도 못 담았으면 실패로 끝낸다 — 초록으로 두면 자료가 조용히 안 는다 */
if (!ok) {
  console.error('\n한 건도 판독하지 못했습니다 — 계약이 바뀌었는지 확인하세요.');
  process.exit(1);
}
