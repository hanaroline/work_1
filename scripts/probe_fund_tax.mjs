#!/usr/bin/env node
/**
 * 「과세」 절 제목이 펀드 투자설명서에서 실제로 어떻게 쓰이는지 본다.
 *
 * 표본 40종목에서 과세만 0% 였다. 두 번 고쳤는데도 0% 라면 제목 형태가
 * 내 짐작과 다른 것이다. 세 번째로 추측하지 않고 원문을 찍는다.
 *
 * 읽기만 한다.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const N = Number(process.argv[2] || 8);
const log = (s = '') => console.log(s);

async function pages(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    out.push(tc.items.map((x) => x.str).join(' ').replace(/\s+/g, ' ').trim());
  }
  return out;
}

const g = {};
new Function('window', readFileSync('data/fund-catalog.js', 'utf8'))(g);
const C = g.FUND_CATALOG;
const byMgr = new Map();
for (const it of C.items.filter((x) => x.docT)) if (!byMgr.has(it.mgr)) byMgr.set(it.mgr, it);
const pick = [...byMgr.values()].slice(0, N);

log(`${pick.length}종목에서 「과세」 가 나오는 대목을 그대로 찍는다\n`);
for (const it of pick) {
  const url = `${C.docBase}${it.code}/${it.code}_T_${it.docT}.pdf`;
  let P;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
    if (!r.ok) { log(`✗ ${it.name.slice(0, 30)} HTTP ${r.status}`); continue; }
    P = await pages(Buffer.from(await r.arrayBuffer()));
  } catch (e) { log(`✗ ${it.name.slice(0, 30)} ${e.name}`); continue; }

  log('━'.repeat(72));
  log(`${it.name.slice(0, 44)}  (${it.mgr}, ${P.length}쪽)`);
  /* 「과세」 앞뒤를 통째로 본다 — 번호가 붙는지, 무슨 말이 앞에 오는지 */
  const seen = new Set();
  P.forEach((t, i) => {
    const re = /.{0,42}과\s*세.{0,30}/g;
    let m, shown = 0;
    while ((m = re.exec(t)) && shown < 2) {
      const s = m[0].trim();
      /* 번호 붙은 제목처럼 보이는 것만 — 본문 서술은 걸러 낸다 */
      if (!/\d\s*[.)]|제\s*\d+\s*[부장절]|[가나다라마바]\s*\./.test(s)) continue;
      if (seen.has(s)) continue;
      seen.add(s); shown++;
      log(`  p.${String(i + 1).padStart(3)}  ${s}`);
    }
  });
  if (!seen.size) log('  「과세」 가 번호 붙은 제목 꼴로는 한 번도 안 나옴');
}
log('\n조사 끝 — 아무것도 커밋하지 않았습니다');
