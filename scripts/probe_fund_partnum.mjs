#!/usr/bin/env node
/**
 * 「제N부」 를 **어떤 글자로 적었나** 를 센다.
 *
 *   node scripts/probe_fund_partnum.mjs [표준코드 …]        지정한 종목만
 *   node scripts/probe_fund_partnum.mjs --sample 60          전체를 일정 간격으로
 *
 * 왜 —
 *
 * 한국밸류10년투자퇴직연금의 목차 쪽이 이렇게 적혀 있어 목차로 안 잡혔다.
 *
 *   p.3 「3 제I부. 모집 또는 매출에 관한 사항 1. 집합투자기구의 명칭 …
 *        제2부. 집합투자기구에 관한 사항 1. 집합투자기구의 명칭 …」
 *
 * 제1부는 **로마숫자 I**, 제2부는 아라비아 2 — 한 쪽 안에서 섞여 있다. 목차 판정과
 * 제1부 판정이 모두 아라비아 숫자만 알아서 이 쪽을 놓쳤다.
 *
 * 「로마숫자도 받자」 는 한 줄이면 되지만, 그 한 줄이 목차 판정을 건드린다. 이 판정은
 * 지금까지 네 번 말썽을 냈다 — 우리프랭클린의 낱말 없는 목차, 제2부 첫 쪽, 그 다음
 * 쪽, 그리고 트러스톤의 「제1부」 로 시작하는 목차. 느슨하게 고치면 값비싼 자리가
 * 또 무너진다.
 *
 * 그래서 고치기 전에 **얼마나 흔한지부터 센다.** 로마숫자를 쓰는 문서가 몇이고,
 * 그 문서들이 지금 어떻게 판정되고 있는지를 본다. 한 종목을 살리려다 멀쩡한
 * 수백 종목을 흔드는 것이 가장 나쁘다.
 *
 * 읽기만 한다. 아무것도 커밋하지 않는다.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tocPages, findPart2, mapPages, flat, BODY_SEQ } from './fund_doc_anchors.mjs';
import { docPages } from './fund_doc_text.mjs';

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const log = (s = '') => console.log(s);
const bar = (s) => { log(); log('━'.repeat(78)); log(s); log('━'.repeat(78)); };

/* 「제 ? 부」 의 ? 자리에 무엇이 오는지 그대로 꺼낸다 — 미리 정한 낱말로 세면
   내가 아는 꼴만 세게 된다. 무엇이 오든 한 글자를 집어 와서 갈래를 짓는다. */
const PART_ANY = /제\s*([0-9IVXⅠⅡⅢⅣⅤlie一二三四五])\s*부/g;
/* 그 뒤에 진짜 부 제목이 붙는 것만 센다 — 「제3부」 가 본문 문장에 스칠 수 있다 */
const PART_TITLED = /제\s*([0-9IVXⅠⅡⅢⅣⅤlie一二三四五])\s*부[.\s]*(모\s*집|집\s*합\s*투\s*자\s*기\s*구|투\s*자\s*신\s*탁|자\s*산\s*운\s*용)/g;

async function pdfPagesOf(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const { perPage } = await docPages(doc);
  return perPage.map(flat);
}

async function main() {
  const g = {};
  new Function('window', readFileSync('data/fund-catalog.js', 'utf8'))(g);
  const C = g.FUND_CATALOG;
  const argv = process.argv.slice(2);
  const si = argv.indexOf('--sample');
  let pick;
  if (si >= 0) {
    const how = Number(argv[si + 1] || 60);
    const withT = C.items.filter((x) => x.docT);
    const step = Math.max(1, Math.floor(withT.length / how));
    pick = [];
    for (let i = 0; i < withT.length && pick.length < how; i += step) pick.push(withT[i]);
    log(`전체 ${withT.length}종목을 ${step}종목마다 하나씩 — 표본 ${pick.length}종목`);
  } else {
    pick = argv.filter(Boolean).map((c) => C.items.find((x) => x.code === c)).filter(Boolean);
    log(`지정한 ${pick.length}종목`);
  }
  log('「제N부」 의 N 자리에 무엇이 오는지 세고, 지금 판정이 어떻게 나는지 나란히 적는다\n');

  const glyphTally = {};      /* 글자별 — 몇 종목에서 보였나 */
  const romanDocs = [];       /* 로마숫자를 쓴 종목 */
  let read = 0, fail = 0;

  for (const it of pick) {
    let pages;
    try {
      const r = await fetch(`${C.docBase}${it.code}/${it.code}_T_${it.docT}.pdf`, { signal: AbortSignal.timeout(90000) });
      if (!r.ok) { fail++; continue; }
      pages = await pdfPagesOf(Buffer.from(await r.arrayBuffer()));
    } catch { fail++; continue; }
    read++;

    /* 이 문서에 쓰인 글자를 모은다 (제목이 붙은 것만) */
    const seen = new Map();
    pages.forEach((t, i) => {
      PART_TITLED.lastIndex = 0;
      let m;
      while ((m = PART_TITLED.exec(t))) {
        if (!seen.has(m[1])) seen.set(m[1], { page: i + 1, snip: t.slice(Math.max(0, m.index - 20), m.index + 70).trim() });
      }
    });
    for (const k of seen.keys()) glyphTally[k] = (glyphTally[k] || 0) + 1;

    const roman = [...seen.keys()].filter((k) => /[IVXⅠⅡⅢⅣⅤlie]/.test(k));
    if (!roman.length) continue;

    const toc = tocPages(pages);
    const { at } = mapPages(pages);
    const body = BODY_SEQ.filter((k) => at[k]).length;
    romanDocs.push(it.code);
    log('━'.repeat(78));
    log(`${it.code} · ${it.mgr} · ${it.name.slice(0, 40)}  (${pages.length}쪽)`);
    log(`   쓰인 글자 : ${[...seen.keys()].map((k) => `「제${k}부」`).join(' ')}`);
    for (const [k, v] of seen) log(`     제${k}부  p.${v.page}  「${v.snip}」`);
    log(`   지금 판정 : 목차 p.${[...toc].map((x) => x + 1).join(',') || '없음'} · 요약 ${at.summary || '-'} · 제1부 ${at.part1 || '-'} · 제2부 ${at.part2 || '-'} · 본문 ${body}/7`);
  }

  bar('「제N부」 의 N 자리 글자 — 몇 종목에서 보였나');
  Object.entries(glyphTally).sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => log(`  ${String(v).padStart(4)}  「제${k}부」`));

  bar('요약');
  log(`읽은 종목 ${read} · 못 받음 ${fail}`);
  log(`로마숫자를 쓴 종목 ${romanDocs.length}${romanDocs.length ? ' — ' + romanDocs.join(' ') : ''}`);
  log('');
  log('읽는 법 — 로마숫자가 표본에서 드물면 그 문서만 살리는 좁은 고침이 낫다.');
  log('흔하면 지금 잘 되는 문서도 그 규칙을 지나가므로, 고칠 때 회귀를 넓게 봐야 한다.');
  bar('조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 실패:', (e && e.stack) || e); process.exit(1); });
