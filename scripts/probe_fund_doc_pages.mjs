#!/usr/bin/env node
/**
 * 펀드 투자설명서의 쪽 구성을 본다 — 특히 **핵심요약설명서가 안에 들어 있는가.**
 *
 * 확인할 것
 *   ① 투자설명서 안에 핵심(요약)설명서가 포함돼 있나, 있으면 몇 쪽부터인가
 *   ② 쪽마다 어떤 제목이 오나 (쪽 지도의 제목을 여기서 딴다)
 *   ③ **운용사가 다르면 쪽 구성도 다른가** — 이게 핵심이다.
 *      ELS 는 한 발행사가 같은 서식으로 찍어 쪽이 거의 같았다. 펀드는 운용사가
 *      제각각이라 같으리라는 보장이 없다. 다르면 회차마다가 아니라 **종목마다**
 *      읽어야 하고, 3,019종목이면 비용이 달라진다.
 *
 * 읽기만 한다. 아무것도 커밋하지 않는다.
 *
 * 사용: node scripts/probe_fund_doc_pages.mjs [건수]
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const HOW_MANY = Number(process.argv[2] || 6);
const HEAD = 220;

/* 펀드 스크립트가 설명하는 것들 — 평가표 항목에서 가져왔다 */
const LOOK = [
  ['핵심요약설명서', /핵심\s*\(?\s*요약\s*\)?\s*(상품)?\s*설명서/],
  ['투자목적·투자전략', /투자목적|투자전략/],
  ['투자대상', /투자대상/],
  ['주요 투자위험', /투자위험|주요\s*위험/],
  ['보수·수수료', /보수\s*및\s*수수료|보수및수수료|수수료\s*및\s*보수/],
  ['매입·환매', /매입.{0,3}환매|환매\s*방법|환매수수료/],
  ['과세', /과세|세제/],
  ['운용전문인력', /운용전문인력|운용인력/],
  ['목차', /목\s*차/],
];

const log = (s = '') => console.log(s);
const head = (s) => { log(); log('━'.repeat(74)); log(s); log('━'.repeat(74)); };

async function pdfPages(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    out.push(tc.items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim());
  }
  return out;
}

async function main() {
  const g = {};
  new Function('window', readFileSync('data/fund-catalog.js', 'utf8'))(g);
  const C = g.FUND_CATALOG;
  const withT = C.items.filter((x) => x.docT);
  log(`카탈로그 ${C.items.length}종목 · 투자설명서(docT) 있는 것 ${withT.length}종목`);

  /* 운용사를 골고루 — 쪽 구성이 운용사마다 다른지 보려는 것이므로 */
  const byMgr = new Map();
  for (const it of withT) if (!byMgr.has(it.mgr)) byMgr.set(it.mgr, it);
  const pick = [...byMgr.values()].slice(0, HOW_MANY);
  log(`살펴볼 ${pick.length}종목 (운용사 각각): ${pick.map((x) => x.mgr).join(', ')}`);

  const summary = [];
  for (const it of pick) {
    const url = `${C.docBase}${it.code}/${it.code}_T_${it.docT}.pdf`;
    head(`${it.name}\n   운용사 ${it.mgr} · ${url}`);
    let pages;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
      if (!r.ok) { log(`   받지 못함: HTTP ${r.status}`); continue; }
      pages = await pdfPages(Buffer.from(await r.arrayBuffer()));
    } catch (e) {
      log(`   받지 못함: ${e.name} ${e.message}`);
      continue;
    }
    const empty = pages.filter((t) => t.length < 40).length;
    log(`   ${pages.length}쪽 · 글자 없는 쪽 ${empty}개`);
    if (empty === pages.length) { log('   !! 스캔 이미지 — 쪽 매칭 불가'); continue; }

    log('   ── 쪽마다 첫 머리 (앞 30쪽까지) ──');
    pages.slice(0, 30).forEach((t, i) => {
      if (t.length > 20) log(`     p.${String(i + 1).padStart(2)} ${t.slice(0, 92)}`);
    });

    log('   ── 찾는 것이 쪽 앞부분(제목 자리)에 오는 쪽 ──');
    const at = {};
    for (const [name, re] of LOOK) {
      const hits = [];
      pages.forEach((t, i) => { if (re.test(t.slice(0, HEAD))) hits.push(i + 1); });
      at[name] = hits;
      log(`     ${name.padEnd(16)} ${hits.length === 1 ? `p.${hits[0]}  ← 한 쪽뿐` : hits.length ? `p.${hits.join(', p.')}` : '없음'}`);
    }
    /* 핵심요약설명서는 제목 자리 밖에도 있을 수 있다 — 본문 전체로도 한 번 본다 */
    const anywhere = [];
    pages.forEach((t, i) => { if (LOOK[0][1].test(t)) anywhere.push(i + 1); });
    log(`     핵심요약설명서(본문 전체) ${anywhere.length ? 'p.' + anywhere.join(', p.') : '문서 어디에도 없음'}`);

    summary.push({ name: it.name, mgr: it.mgr, pages: pages.length, at, anywhere });
  }

  head('종합 — 운용사가 다르면 쪽 구성도 다른가');
  log('종목                                        쪽수   핵심요약설명서(제목자리)  투자목적·전략  보수·수수료');
  summary.forEach((s) => {
    const f = (k) => { const h = s.at[k] || []; return h.length === 1 ? 'p.' + h[0] : h.length ? 'p.' + h[0] + '…' : '—'; };
    log(`  ${s.name.slice(0, 38).padEnd(40)} ${String(s.pages).padStart(4)}   ${f('핵심요약설명서').padEnd(22)} ${f('투자목적·투자전략').padEnd(13)} ${f('보수·수수료')}`);
  });
  log();
  const hasCore = summary.filter((s) => s.anywhere.length).length;
  log(`핵심요약설명서가 투자설명서 안에 있는 종목: ${hasCore}/${summary.length}`);
  const pageCounts = [...new Set(summary.map((s) => s.pages))];
  log(`쪽수: ${pageCounts.join(', ')} — ${pageCounts.length === 1 ? '모두 같다' : '제각각이다 (종목마다 읽어야 한다)'}`);

  head('조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 조사 실패:', (e && e.stack) || e); process.exit(1); });
