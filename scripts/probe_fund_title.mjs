#!/usr/bin/env node
/**
 * 못 찾은 자리의 **제목 원문**을 찍는다.
 *
 *   node scripts/probe_fund_title.mjs <자리> <낱말> [종목수]
 *   예) node scripts/probe_fund_title.mjs trade '환\s*매' 40
 *
 * 왜 이런 도구를 두나 — 적중률이 낮을 때 정규식을 짐작으로 고치면 반드시 또
 * 틀린다. 과세가 그랬다. 두 번 고쳐도 0% 였고, 원문을 찍고 나서야 제목이
 * 「14. 이익배분 및 과세에 관한 사항」 이라는 것을 알았다. 그 한 번으로 끝났다.
 *
 * 이 도구는 **못 찾은 종목만** 골라 그 낱말이 제목처럼 쓰인 대목을 보여 준다.
 * 찾은 종목은 건너뛴다 — 이미 통하는 것을 봐야 고칠 거리가 나오지 않는다.
 *
 * 읽기만 한다. 아무것도 커밋하지 않는다.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { ANCHORS, mapPages, flat } from './fund_doc_anchors.mjs';

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const KEY = process.argv[2] || 'trade';
const WORD = new RegExp(process.argv[3] || '환\\s*매');
const HOW_MANY = Number(process.argv[4] || 40);

const A = ANCHORS.find((a) => a[0] === KEY);
if (!A) { console.error(`자리 「${KEY}」 가 없습니다. 있는 것: ${ANCHORS.map((a) => a[0]).join(', ')}`); process.exit(1); }
const log = (s = '') => console.log(s);

async function pdfPages(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    out.push(flat(tc.items.map((x) => x.str).join(' ')));
  }
  return out;
}

const g = {};
new Function('window', readFileSync('data/fund-catalog.js', 'utf8'))(g);
const C = g.FUND_CATALOG;

/* 운용사를 골고루 — 한 곳에 몰리면 그 운용사의 서식만 보게 된다 */
const byMgr = new Map();
for (const it of C.items.filter((x) => x.docT)) {
  if (!byMgr.has(it.mgr)) byMgr.set(it.mgr, []);
  byMgr.get(it.mgr).push(it);
}
const mgrs = [...byMgr.keys()];
const pick = [];
for (let round = 0; pick.length < HOW_MANY && round < 8; round++) {
  for (const m of mgrs) {
    if (byMgr.get(m)[round]) pick.push(byMgr.get(m)[round]);
    if (pick.length >= HOW_MANY) break;
  }
}

log(`자리 「${A[3]}」 · 지금 규칙 ${A[2]}`);
log(`${pick.length}종목을 읽어 **못 찾은 것만** 원문을 찍는다\n`);

let hit = 0, miss = 0, fail = 0;
for (const it of pick) {
  const url = `${C.docBase}${it.code}/${it.code}_T_${it.docT}.pdf`;
  let P;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
    if (!r.ok) { fail++; continue; }
    P = await pdfPages(Buffer.from(await r.arrayBuffer()));
  } catch { fail++; continue; }

  const m = mapPages(P);
  if (m.at[KEY]) { hit++; continue; }
  miss++;

  log('━'.repeat(74));
  log(`${it.name.slice(0, 46)}  (${P.length}쪽, 목차 p.${m.toc.join(',') || '없음'}, 본문 p.${m.from}부터)`);
  /* 그 낱말이 「번호 붙은 제목」 처럼 쓰인 대목만 — 본문 서술은 걸러 낸다 */
  const seen = new Set();
  P.forEach((t, i) => {
    if (i + 1 < m.from) return;           // 목차 앞은 볼 것 없다
    const re = /.{0,46}환\s*매.{0,34}/g;
    let x, shown = 0;
    while ((x = re.exec(t)) && shown < 2) {
      const s = x[0].trim();
      if (!WORD.test(s)) continue;
      if (!/\d\s*[.)]/.test(s)) continue;  // 번호가 붙은 것만
      if (seen.has(s)) continue;
      seen.add(s); shown++;
      log(`  p.${String(i + 1).padStart(3)}  ${s}`);
    }
  });
  if (!seen.size) log('  번호 붙은 제목 꼴로는 한 번도 안 나옴 — 이 문서에는 그 절이 없을 수 있다');
}

log('');
log('━'.repeat(74));
log(`찾음 ${hit} · 못 찾음 ${miss} · 못 받음 ${fail}  (적중 ${(100 * hit / (hit + miss)).toFixed(0)}%)`);
log('조사 끝 — 아무것도 커밋하지 않았습니다');
