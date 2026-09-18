#!/usr/bin/env node
/**
 * 차례가 어긋나 **버려진** 종목의 원문을 펼친다.
 *
 *   node scripts/probe_fund_skipped.mjs [표준코드 …]
 *
 * 왜 이 도구가 필요한가 —
 *
 * 전량 5차에서 108종목이 checkOrder 에 걸려 통째로 버려졌다. 까닭은 모두 하나다.
 *
 *     요약정보가 제1부보다 뒤
 *
 * 그런데 요약정보·제1부는 **보조** 자리다 — 못 찾아도 그 종목만 빈칸이고 창구가
 * 짚는 일곱 자리와는 상관이 없다. 보조 하나가 어긋났다고 필수 일곱을 통째로
 * 버리는 것이 맞는지 가려야 한다. 갈림길은 둘이다.
 *
 *   (가) 요약정보 정규식이 엉뚱한 쪽을 잡았다 → 보조만 비우고 필수는 살린다
 *   (나) 문서 구조가 내가 아는 것과 다르다   → 그 문서는 통째로 비우는 게 맞다
 *
 * 둘을 가르는 것은 통계가 아니라 원문이다. 그래서 잡힌 쪽의 글을 그대로 찍는다.
 * 통계만 보고 규칙을 고쳐 이번 작업에서 네 번 틀렸다 — 과세에서 두 번,
 * 매입·환매에서 한 번, 제2부에서 한 번.
 *
 * ★ 판정은 여전히 mapPages()/checkOrder() 한 곳에서만 한다 ★ 이 스크립트는
 * 그것이 내놓은 답과 그 근거가 된 원문을 나란히 적을 뿐이다.
 *
 * 읽기만 한다. 아무것도 커밋하지 않는다.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { ANCHORS, BODY_SEQ, mapPages, checkOrder, tocPages, flat } from './fund_doc_anchors.mjs';

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

/* 전량 5차가 이름을 찍어 준 10종목. 인자를 주면 그것으로 갈음한다. */
const DEFAULT = [
  'K55306B99307', 'K55306DL4955', 'KR5363A44260', 'KR5363AG8636', 'KR5363AF6839',
  'KR5363AP6407', 'KR5363AH5607', 'KR5363A43940', 'KR5363AA5596', 'K55363E34192',
];

const log = (s = '') => console.log(s);
const bar = (s) => { log(); log('━'.repeat(78)); log(s); log('━'.repeat(78)); };
const WHAT = Object.fromEntries(ANCHORS.map((a) => [a[0], a[3]]));

async function pdfPages(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    out.push(flat(tc.items.map((x) => x.str).join(' ')));
  }
  return out;
}

/** 그 자리를 잡은 걸림이 쪽 어디에 있었는지, 그 둘레 글이 무엇인지 */
function where(pages, page, re) {
  if (!page) return null;
  const t = pages[page - 1] || '';
  const head = t.slice(0, 200);                 /* 앞머리 자리는 HEAD 안에서 찾는다 */
  const m = head.match(re);
  if (!m) return { idx: -1, snip: head.slice(0, 110) };
  return { idx: m.index, snip: t.slice(Math.max(0, m.index - 30), m.index + 90).trim() };
}

async function main() {
  const g = {};
  new Function('window', readFileSync('data/fund-catalog.js', 'utf8'))(g);
  const C = g.FUND_CATALOG;
  const codes = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;

  log(`버려진 종목 ${codes.length}건의 원문을 펼친다`);
  log('보고 싶은 것 — 요약정보로 잡힌 쪽에 정말 요약정보 구간이 있나\n');

  const tally = {};
  let bodyOk = 0;

  for (const code of codes) {
    const it = C.items.find((x) => x.code === code);
    if (!it || !it.docT) { log(`${code} — 목록에 없거나 투자설명서가 없다`); continue; }

    let pages;
    try {
      const r = await fetch(`${C.docBase}${code}/${code}_T_${it.docT}.pdf`, { signal: AbortSignal.timeout(90000) });
      if (!r.ok) { log(`${code} — 내려받기 ${r.status}`); continue; }
      pages = await pdfPages(Buffer.from(await r.arrayBuffer()));
    } catch (e) { log(`${code} — 내려받기 실패 ${e.name}`); continue; }

    const toc = tocPages(pages);
    const { at, how } = mapPages(pages);
    const bad = checkOrder(at);

    log('━'.repeat(78));
    log(`${code} · ${it.mgr} · ${it.name.slice(0, 40)}  (${pages.length}쪽, 목차 p.${[...toc].map((k) => k + 1).join(',') || '없음'})`);
    log(`   판정 : ${bad.bad ? '버림 — ' + bad.why : '통과'}`);

    /* 앞머리 세 자리 — 잡힌 쪽의 원문을 그대로 */
    for (const key of ['summary', 'part1', 'part2']) {
      const a = ANCHORS.find((x) => x[0] === key);
      const w = where(pages, at[key], a[2]);
      log(`   ${WHAT[key].padEnd(18)} ${at[key] ? 'p.' + String(at[key]).padStart(3) : '  없음'}${how[key] ? ' (' + how[key] + ')' : ''}`);
      if (w) log(`        「${w.snip}」`);
    }

    /* 필수 일곱 자리가 실제로 쓸 만한가 — 이것이 살릴 가치를 정한다 */
    const body = BODY_SEQ.map((k) => at[k]).filter(Boolean);
    const seq = body.every((v, i) => i === 0 || v >= body[i - 1]);
    const afterP2 = at.part2 ? body.every((v) => v >= at.part2) : false;
    log(`   필수 일곱 : ${body.length}/7 자리 · 차례 ${seq ? '맞음' : '★어긋남★'} · 제2부 뒤 ${at.part2 ? (afterP2 ? '맞음' : '★아님★') : '제2부 없음'}`);
    log(`        ${BODY_SEQ.map((k) => WHAT[k].slice(0, 4) + ' ' + (at[k] || '-')).join(' · ')}`);
    if (body.length === 7 && seq && afterP2) bodyOk++;

    tally[bad.why || '통과'] = (tally[bad.why || '통과'] || 0) + 1;
  }

  bar('버린 까닭 — 종목 수');
  Object.entries(tally).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => log(`  ${String(v).padStart(3)}  ${k}`));

  bar('요약');
  log(`필수 일곱 자리가 온전한(7/7 · 차례 맞음 · 제2부 뒤) 종목 ${bodyOk}/${codes.length}`);
  log('');
  log('읽는 법 — 요약정보로 잡힌 쪽 글이 정말 요약 구간 첫머리면, 그 문서는 구조가');
  log('다른 것이므로 통째로 비우는 지금이 맞다. 그게 아니라 유의사항·표지 같은');
  log('엉뚱한 쪽이면 요약정보 정규식이 헛짚은 것이니, 보조만 비우고 필수는 살린다.');
  bar('조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 실패:', (e && e.stack) || e); process.exit(1); });
