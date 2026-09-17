#!/usr/bin/env node
/**
 * 제2부를 **왜** 못 찾았는지 찍는다.
 *
 *   node scripts/probe_fund_part2_why.mjs [종목수]
 *
 * 왜 이 도구가 필요한가 —
 *
 * 표본에서 제2부 인식이 75% 에 멈춰 있다. 규칙을 세 번 고쳤는데(쪽 한가운데 제목
 * 잡기 · 쪽 끝 제목 잇기 · 목차 판정 조이기) 숫자가 움직이지 않았다. 지금 조사가
 * 보여 주는 것은 「못 찾았다」 뿐이고, **무엇을 보고 물리쳤는지**는 안 보인다.
 * 그 상태로 정규식을 또 고치는 것은 짐작이다. 과세에서 두 번, 매입·환매에서 한 번
 * 그렇게 틀렸다.
 *
 * 그래서 판정 과정을 그대로 펼친다. 제2부가 쓰인 자리를 하나도 빠짐없이 찍고,
 * 그 자리마다 판정에 쓰이는 사실 네 가지를 함께 적는다.
 *
 *     ① 그 쪽이 목차로 걸러졌나
 *     ② 「제2부」 뒤에 「집합투자기구에 관한」 이 붙나
 *     ③ 그 뒤 160자 안에 「1. 집합투자기구의 명칭」 이 오나 (다음 쪽까지 이어 봄)
 *     ④ 쪽을 그 제목으로 여나 (앞 12자 안) · 참조를 뜻하는 말이 뒤따르나
 *
 * ★ 판정은 여전히 findPart2() 한 곳에서만 한다 ★ 이 스크립트는 사실을 늘어놓고
 * findPart2() 가 실제로 내놓은 답을 나란히 적을 뿐이다. 여기에 규칙을 한 벌 더
 * 두면 그것부터 어긋난다 — 표본과 전량을 두 벌로 뒀다가 이미 한 번 겪었다.
 *
 * 읽기만 한다. 아무것도 커밋하지 않는다.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tocPages, findPart2, flat } from './fund_doc_anchors.mjs';

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const HOW_MANY = Number(process.argv[2] || 40);
const log = (s = '') => console.log(s);
const bar = (s) => { log(); log('━'.repeat(78)); log(s); log('━'.repeat(78)); };

/* 아래 셋은 **판정용이 아니라 설명용**이다. findPart2() 가 보는 것과 같은 사실을
   눈에 보이게 적기 위한 것으로, 답을 내는 데는 쓰지 않는다. */
const LOOSE = /제\s*2\s*부/g;                                   /* 제2부가 쓰인 자리 전부 */
const PHRASE = /^제\s*2\s*부[.\s]*집합투자기구에\s*관한(\s*사항)?/;
const FIRST_SECTION = /1\s*\.\s*집합투자기구의\s*명\s*칭/;
const REFERS = /참\s*고|설명되어|바랍니다|페이지|참조/;

async function pdfPages(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    out.push(flat(tc.items.map((x) => x.str).join(' ')));
  }
  return out;
}

/** 한 자리를 설명한다 — 판정이 아니라 사실 나열 */
function explain(pages, toc, i, idx) {
  const t = pages[i];
  const tail = t.slice(idx);
  const isToc = toc.has(i);
  const phrase = PHRASE.test(tail);
  let after = t.slice(idx, idx + 160);
  let spilled = false;
  if (after.length < 160 && !toc.has(i + 1)) {
    after += ' ' + (pages[i + 1] || '').slice(0, 160 - after.length);
    spilled = true;
  }
  const first = FIRST_SECTION.test(after);
  const opens = idx <= 12;
  const refers = REFERS.test(after);

  /* 제목이 쪽의 **맨 끝**에 오나 — 구간을 여는 속표지는 제목으로 쪽이 끝나고,
     상호참조는 문장 한가운데라 뒤에 말이 더 있다. 판정에는 안 쓰고 보여만 준다. */
  const endsPage = tail.replace(PHRASE, '').trim() === '';

  let why, rank;
  if (isToc) { why = '목차 쪽이라 건너뜀'; rank = 0; }
  else if (!phrase) { why = '뒤에 「집합투자기구에 관한」 이 안 붙음 (상호참조 꼴)'; rank = 1; }
  else if (first) { why = '★ 받았어야 함 — 「1. 집합투자기구의 명칭」 이 이어짐'; rank = 9; }
  else if (opens && !refers) { why = '★ 받았어야 함 — 쪽을 이 제목으로 엶'; rank = 9; }
  else if (opens && refers) { why = '쪽은 열지만 참조를 뜻하는 말이 뒤따름'; rank = 3; }
  else if (endsPage) { why = '제목으로 쪽이 끝남(속표지로 보임) — 다음 쪽에 「1. 집합투자기구의 명칭」 이 없어 물리침'; rank = 5; }
  else { why = '쪽 한가운데인데 「1. 집합투자기구의 명칭」 이 안 이어짐'; rank = 4; }

  return {
    isToc, phrase, first, opens, refers, spilled, endsPage, why, rank,
    snip: t.slice(Math.max(0, idx - 24), idx + 86).trim(),
    /* 물리친 자리가 진짜 제2부였는지 가리려면 다음 쪽 첫머리를 봐야 한다 —
       여기가 이번 진단에서 가장 알고 싶은 대목이다 */
    next: (pages[i + 1] || '').slice(0, 96),
  };
}

async function main() {
  const g = {};
  new Function('window', readFileSync('data/fund-catalog.js', 'utf8'))(g);
  const C = g.FUND_CATALOG;
  const withT = C.items.filter((x) => x.docT);
  /* 전체를 일정 간격으로 훑는다 (표본 조사와 같은 방식 — 운용사별로 고르면
     서식이 다른 것들이 빠져 전량을 예고하지 못한다) */
  const step = Math.max(1, Math.floor(withT.length / HOW_MANY));
  const pick = [];
  for (let i = 0; i < withT.length && pick.length < HOW_MANY; i += step) pick.push(withT[i]);

  log(`투자설명서 있는 ${withT.length}종목 · 표본 ${pick.length}종목 (${step}종목마다 하나씩)`);
  log('제2부를 못 찾은 것만 펼쳐 본다\n');

  const tally = {};
  let found = 0, miss = 0, fail = 0, silent = 0;
  const shouldHave = [];

  for (const it of pick) {
    let pages;
    try {
      const r = await fetch(`${C.docBase}${it.code}/${it.code}_T_${it.docT}.pdf`, { signal: AbortSignal.timeout(90000) });
      if (!r.ok) { fail++; continue; }
      pages = await pdfPages(Buffer.from(await r.arrayBuffer()));
    } catch { fail++; continue; }

    const toc = tocPages(pages);
    const p2 = findPart2(pages, toc);
    if (p2) { found++; continue; }
    miss++;

    /* 제2부가 쓰인 자리를 하나도 빠짐없이 모은다 */
    const spots = [];
    pages.forEach((t, i) => {
      LOOSE.lastIndex = 0;
      let x;
      while ((x = LOOSE.exec(t))) spots.push({ i, idx: x.index });
    });

    log('━'.repeat(78));
    log(`${it.mgr} · ${it.name.slice(0, 44)}  (${pages.length}쪽, 목차 p.${[...toc].map((k) => k + 1).join(',') || '없음'})`);
    if (!spots.length) {
      silent++;
      tally['「제2부」 라는 말이 문서에 아예 없음'] = (tally['「제2부」 라는 말이 문서에 아예 없음'] || 0) + 1;
      log('   「제2부」 가 한 번도 안 나옴 — 서식이 다른 문서다');
      continue;
    }
    /* 이 종목에서 **가장 아까운** 자리 하나를 골라 셈에 넣는다.
       처음엔 첫 자리를 담았는데, 첫 자리는 거의 늘 목차라 셈이 「목차 때문」 이라고
       거짓말을 했다. 진짜 제2부일 법한 자리일수록 rank 를 높게 두고 그것을 고른다. */
    let best = null;
    for (const s of spots) {
      const e = explain(pages, toc, s.i, s.idx);
      log(`   p.${String(s.i + 1).padStart(3)}  ${e.why}${e.spilled ? ' (다음 쪽까지 이어 봄)' : ''}`);
      log(`          「${e.snip}」`);
      /* 물리친 속표지라면 다음 쪽 첫머리를 보여 준다 — 진짜 제2부였는지는 여기서 갈린다 */
      if (e.rank >= 4) log(`      다음 쪽 → 「${e.next}」`);
      if (!best || e.rank > best.rank) best = e;
    }
    tally[best.why] = (tally[best.why] || 0) + 1;
    if (best.why.startsWith('★')) shouldHave.push(`${it.code} ${it.name.slice(0, 32)}`);
  }

  bar('못 찾은 까닭 — 종목 수');
  Object.entries(tally).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => log(`  ${String(v).padStart(3)}  ${k}`));

  bar('규칙대로라면 받았어야 하는 종목 (여기 있으면 코드에 버그다)');
  log(shouldHave.length ? shouldHave.map((s) => '  ' + s).join('\n') : '  없음 — 물리친 자리는 모두 물리칠 만했다');

  bar('요약');
  log(`찾음 ${found} · 못 찾음 ${miss} (그중 「제2부」 자체가 없는 문서 ${silent}) · 못 받음 ${fail}`);
  log('');
  log('읽는 법 — ★ 로 시작하는 줄은 규칙이 받았어야 하는 자리다. 그런 줄이 있으면');
  log('정규식이 아니라 코드를 봐야 한다. ★ 가 하나도 없으면 물리친 것이 맞고,');
  log('남은 문서는 서식이 달라 제2부라는 뼈대 자체가 없는 것이다 — 그건 비워 둔다.');
  bar('조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 실패:', (e && e.stack) || e); process.exit(1); });
