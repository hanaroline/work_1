#!/usr/bin/env node
/**
 * 펀드 투자설명서 쪽 지도 — 표본으로 규칙 적중률을 본다.
 *
 * 1차 조사에서 배운 것
 *   ① 핵심(요약)설명서는 투자설명서 안에 없다 (6/6). 운용사가 만드는 문서에
 *      판매회사 심의필 양식이 들어 있을 리 없다. 대신 앞쪽에 「요약정보
 *      〈간이투자설명서〉」 구간이 있다 — ELS 교부본과 같은 꼴이다.
 *   ② 쪽 구성이 종목마다 다르다 (57·51·64·68·75·65쪽). 회차 단위로 재사용할 수
 *      없고 **종목마다** 읽어야 한다.
 *   ③ 내가 쓴 느슨한 낱말(투자목적|투자전략)은 본문에 걸려 쓸모없었다.
 *      ELS 때와 같은 실수다.
 *
 * 그래서 이번에는 **금융투자협회 표준 서식의 번호 붙은 제목**으로 잡는다.
 * 운용사가 달라도 이 제목은 같다 —
 *      「9. 집합투자기구의 투자전략 및 수익구조」
 *      「11. 매입, 환매, 전환절차 및 기준가격 적용기준」
 * 번호는 문서마다 다르므로 \d+ 로 둔다.
 *
 * ★ 목차 쪽을 반드시 뺀다 ★
 *   목차(p.2 근처)에 모든 제목이 나열돼 있어, 그대로 찾으면 어느 제목이든
 *   최소 두 쪽에 걸려 전부 비어 버린다. ELS 에서 교부본이 같은 내용을 두 번
 *   담아 겪은 것과 같은 함정이다.
 *
 * 읽기만 한다. 아무것도 커밋하지 않는다.
 *
 * 사용: node scripts/probe_fund_pages_sample.mjs [종목수]
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
/* 규칙은 scripts/fund_doc_anchors.mjs 한 곳에만 있다 — 표본과 전량이 같은 규칙을
   써야 표본에서 본 적중률이 전량에서 그대로 나온다. */
import { ANCHORS, mapPages, flat } from './fund_doc_anchors.mjs';

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const HOW_MANY = Number(process.argv[2] || 40);

const log = (s = '') => console.log(s);
const head = (s) => { log(); log('━'.repeat(74)); log(s); log('━'.repeat(74)); };

async function pdfPages(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    out.push(flat(tc.items.map((it) => it.str).join(' ')));
  }
  return out;
}

async function main() {
  const g = {};
  new Function('window', readFileSync('data/fund-catalog.js', 'utf8'))(g);
  const C = g.FUND_CATALOG;
  const withT = C.items.filter((x) => x.docT);

  /* 운용사가 골고루 섞이게 — 한 운용사에 몰리면 적중률이 부풀려진다 */
  const byMgr = new Map();
  for (const it of withT) {
    if (!byMgr.has(it.mgr)) byMgr.set(it.mgr, []);
    byMgr.get(it.mgr).push(it);
  }
  const mgrs = [...byMgr.keys()];
  const pick = [];
  for (let round = 0; pick.length < HOW_MANY && round < 6; round++) {
    for (const m of mgrs) {
      const l = byMgr.get(m);
      if (l[round]) pick.push(l[round]);
      if (pick.length >= HOW_MANY) break;
    }
  }
  log(`투자설명서 있는 ${withT.length}종목 · 운용사 ${mgrs.length}곳`);
  log(`표본 ${pick.length}종목 (운용사 ${new Set(pick.map((x) => x.mgr)).size}곳)`);

  const res = [];
  for (const [i, it] of pick.entries()) {
    const url = `${C.docBase}${it.code}/${it.code}_T_${it.docT}.pdf`;
    let pages;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
      if (!r.ok) { log(`  ✗ ${it.name.slice(0, 30)} — HTTP ${r.status}`); continue; }
      pages = await pdfPages(Buffer.from(await r.arrayBuffer()));
    } catch (e) { log(`  ✗ ${it.name.slice(0, 30)} — ${e.name}`); continue; }

    const m = mapPages(pages);
    /* 'first' 자리는 「첫 쪽을 쓴다」 는 판단이 들어간다. 정말 그 구간의 시작인지
       눈으로 확인할 수 있게 고른 쪽의 머리글을 함께 남긴다. 고객 앞에서 짚는
       값이라 통계만 보고 넘어가지 않는다. */
    m.peek = {};
    for (const [key, zone] of ANCHORS) {
      if (zone === 'first' && m.at[key]) m.peek[key] = pages[m.at[key] - 1].slice(0, 76);
    }
    /* 못 찾은 것은 왜 못 찾았는지 알아야 고친다. 앞쪽 머리글을 남겨 둔다 —
       요약정보가 정말 없는 문서인지, 낱말이 다른지 눈으로 가른다. */
    if (!m.at.summary) m.heads = pages.slice(0, 9).map((t, k) => `p.${k + 1} ${t.slice(0, 64)}`);
    res.push({ ...it, pages: pages.length, ...m });
    if ((i + 1) % 10 === 0) log(`  … ${i + 1}/${pick.length}`);
  }

  head('자리별 적중률');
  log('자리                      담김      비움(못 찾음)   제목이 두 곳 넘게 나온 것');
  for (const [key, , , what] of ANCHORS) {
    const one = res.filter((r) => r.at[key]).length;
    const none = res.length - one;
    /* 제목이 여러 곳에 나오면 첫 번째를 쓴다. 대부분 상호참조지만, 많이 나오는
       자리는 규칙이 느슨하다는 뜻이므로 몇 종목에서 그랬는지 세어 둔다. */
    const multi = res.filter((r) => /\(\+/.test(r.how[key] || '')).length;
    const pct = (100 * one / res.length).toFixed(0);
    log(`  ${what.padEnd(24)} ${String(one).padStart(3)} (${pct.padStart(3)}%)      ${String(none).padStart(3)}            ${String(multi).padStart(3)}`);
  }

  head('요약정보로 고른 쪽이 정말 시작 쪽인가 (앞 10종목)');
  res.slice(0, 10).forEach((r) => {
    const p = r.at.summary;
    log(`  ${r.name.slice(0, 26).padEnd(28)} ${p ? 'p.' + String(p).padStart(2) + ' (' + r.how.summary + ')  ' + r.peek.summary : '— 없음'}`);
  });

  head('요약정보를 못 찾은 종목 — 앞쪽 머리글 (앞 3종목)');
  res.filter((r) => r.heads).slice(0, 3).forEach((r) => {
    log(`  ${r.mgr} · ${r.name.slice(0, 40)} (${r.pages}쪽, 목차 p.${r.toc.join(',') || '없음'})`);
    r.heads.forEach((h) => log(`     ${h}`));
    log('');
  });

  head('한 자리도 못 찾은 종목 (서식이 다른 문서)');
  const bad = res.filter((r) => Object.keys(r.at).length <= 2);
  log(`${bad.length}/${res.length}종목`);
  bad.slice(0, 10).forEach((r) => log(`  ${r.mgr} · ${r.name.slice(0, 34)} (${r.pages}쪽, 목차 p.${r.toc.join(',') || '없음'}) — 담긴 자리 ${Object.keys(r.at).length}개`));

  head('요약');
  const avg = res.reduce((s, r) => s + Object.keys(r.at).length, 0) / res.length;
  log(`읽은 종목 ${res.length}개 · 쪽수 ${Math.min(...res.map((r) => r.pages))}~${Math.max(...res.map((r) => r.pages))}`);
  log(`종목당 담긴 자리 평균 ${avg.toFixed(1)}/${ANCHORS.length}개`);
  log('');
  log('판단 기준 — 창구가 실제로 짚는 자리(투자전략·투자위험·보수·매입환매)가');
  log('90% 넘게 「한 쪽」 으로 잡히면 전량을 돌릴 만하다. 아니면 규칙을 더 고친다.');
  head('표본 조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 실패:', (e && e.stack) || e); process.exit(1); });
