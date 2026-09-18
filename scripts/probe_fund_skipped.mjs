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
import { docPages } from './fund_doc_text.mjs';

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

/* ★ 글 뽑는 법은 전량 판독기와 같은 것을 쓴다 ★
   앞서는 조각을 그냥 공백으로 이어 붙였는데, 판독기는 x/y 좌표로 줄을 다시 세우고
   칸을 탭으로 가른다. flat() 을 거쳐도 둘은 같아지지 않아, 이 조사가 7/7 로
   통과시킨 종목(KR5212472819)이 전량 지도에는 없었다. 규칙만 한곳에 모으고 글
   뽑는 법을 두 벌로 뒀던 탓이다 — 같은 글을 봐야 같은 답이 나온다. */
async function pdfPages(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0 }).promise;
  const { perPage } = await docPages(doc);
  return perPage.map(flat);   /* 판독기도 mapPages 에 넘기기 전에 이렇게 한다 */
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

  /* ★ 먼저 모으고 나중에 찍는다 ★ 종목마다 원문을 스무 줄씩 찍으면 서른 종목에
     육백 줄이 되어, 실행 기록을 꼬리부터 몇 번씩 끊어 읽어야 한다. 그러다 정작
     중요한 줄을 놓친다 — 전량 점검에서 실제로 그렇게 두 시간을 버렸다.
     그래서 ① 종목마다 한 줄 ② 까닭별 셈 ③ 까닭마다 앞 두 종목만 원문 전체,
     이 차례로 찍는다. 까닭이 같으면 원문도 대개 같은 꼴이다. */
  const got = [];

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
    const body = BODY_SEQ.map((k) => at[k]).filter(Boolean);
    const seq = body.every((v, i) => i === 0 || v >= body[i - 1]);
    const afterP2 = at.part2 ? body.every((v) => v >= at.part2) : false;
    got.push({ code, it, pages, toc, at, how, bad, body, seq, afterP2,
      why: bad.bad ? bad.why : (body.length ? '통과' : '통과(본문 자리가 하나도 없음)') });
  }

  /* ① 종목마다 한 줄 — 어디가 빈지, 무엇에 걸렸는지 */
  bar('종목마다 한 줄');
  for (const r of got) {
    log(`${r.code} ${String(r.it.mgr).padStart(4)} ${r.it.name.slice(0, 30).padEnd(30)} ${String(r.pages.length).padStart(3)}쪽 ` +
        `목차 ${([...r.toc].map((k) => k + 1).join(',') || '없음').padEnd(7)} ` +
        `요약 ${String(r.at.summary || '-').padStart(3)} 제1부 ${String(r.at.part1 || '-').padStart(3)} 제2부 ${String(r.at.part2 || '-').padStart(3)} ` +
        `본문 ${r.body.length}/7  ${r.why}`);
  }

  /* ② 까닭별 셈 */
  const tally = {};
  for (const r of got) tally[r.why] = (tally[r.why] || 0) + 1;
  bar('버린 까닭 — 종목 수');
  Object.entries(tally).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => log(`  ${String(v).padStart(3)}  ${k}`));

  /* ③ 까닭마다 앞 두 종목의 원문 전체 */
  const shown = {};
  for (const r of got) {
    shown[r.why] = (shown[r.why] || 0) + 1;
    if (shown[r.why] > 2) continue;
    const { pages, toc, at, how } = r;

    log('');
    log('━'.repeat(78));
    log(`${r.code} · ${r.it.mgr} · ${r.it.name.slice(0, 40)}  (${pages.length}쪽, 목차 p.${[...toc].map((k) => k + 1).join(',') || '없음'})`);
    log(`   판정 : ${r.bad.bad ? '버림 — ' + r.bad.why : '통과'}`);

    /* 앞머리 세 자리 — 잡힌 쪽의 원문을 그대로 */
    for (const key of ['summary', 'part1', 'part2']) {
      const a = ANCHORS.find((x) => x[0] === key);
      const w = where(pages, at[key], a[2]);
      log(`   ${WHAT[key].padEnd(18)} ${at[key] ? 'p.' + String(at[key]).padStart(3) : '  없음'}${how[key] ? ' (' + how[key] + ')' : ''}`);
      if (w) log(`        「${w.snip}」`);
    }

    /* ★ 제2부로 고른 쪽에서 「제2부」 가 실제로 어떻게 쓰였는지 ★
       위의 한 줄은 쪽 앞머리 200자만 보여 준다. 그런데 findPart2 는 쪽 전체를
       훑으므로, 그 한 줄로는 무엇을 보고 그 쪽을 골랐는지 알 수 없다 — 실제로
       제2부로 고른 쪽인데 앞머리에는 제1부 글이 찍히는 일이 있었다.
       고르는 근거가 된 자리를 보려면 쪽 전체에서 걸림을 다 꺼내야 한다.
       판정은 findPart2 가 하고, 여기서는 그 근거만 늘어놓는다. */
    if (at.part2) {
      const t = pages[at.part2 - 1] || '';
      const g = /제\s*2\s*부/g;
      let m, n = 0;
      log(`   제2부로 고른 쪽(p.${at.part2})에서 「제2부」 가 쓰인 자리`);
      while ((m = g.exec(t)) && n < 6) {
        n++;
        log(`        ${n}) 「${t.slice(Math.max(0, m.index - 55), m.index + 95).trim()}」`);
      }
      if (!n) log('        (그 쪽에 「제2부」 가 없다 — 다음 쪽으로 확인한 속표지다)');
    } else {
      /* ★ 제2부를 아예 못 찾았을 때 — 어디를 물리쳤는지 봐야 한다 ★
         「제1부를 여는 쪽은 제2부가 아니다」 규칙을 넣은 뒤 36종목이 제2부를 잃었다.
         그 규칙이 제 몫을 한 것인지(그 쪽들이 정말 제1부였는지), 아니면 쪽마다
         박힌 머리글 때문에 진짜 제2부 쪽까지 물리친 것인지는 원문만이 가른다.
         제2부가 적힌 쪽을 모두 꺼내고, 그 쪽이 제1부 머리글을 이고 있는지 적는다. */
      const P1 = /제\s*1\s*부[.\s]*모\s*집\s*(또는|,)?\s*매\s*출/;
      log('   제2부를 못 찾았다 — 「제2부 … 집합투자기구에 관한」 이 적힌 쪽 전부');
      let shown = 0;
      for (let i = 0; i < pages.length && shown < 8; i++) {
        const t = pages[i];
        const m = t.match(/제\s*2\s*부[.\s]*집\s*합\s*투\s*자\s*기\s*구\s*에\s*관\s*한(\s*사\s*항)?/);
        if (!m) continue;
        shown++;
        log(`        p.${String(i + 1).padStart(3)} 제1부 머리글 ${P1.test(t) ? '★있음 → 이 쪽은 물리침' : '없음'} · 목차 ${toc.has(i) ? '그렇다' : '아니다'}`);
        log(`             「${t.slice(Math.max(0, m.index - 55), m.index + 95).trim()}」`);
      }
      if (!shown) log('        (문서에 「제2부 … 집합투자기구에 관한」 이 한 번도 안 나온다)');
      /* 제1부를 여는 쪽인가 — 제1부의 1절도 「1. 집합투자기구의 명칭」 이라
         제2부 확인 조건과 생김새가 같다. 이것이 겹치는지가 이번 관심사다. */
      log(`        그 쪽이 제1부를 여는가 : ${/제\s*1\s*부[.\s]*모\s*집\s*(또는|,)?\s*매\s*출/.test(t) ? '★ 그렇다' : '아니다'}`);
      const nx = pages[at.part2] || '';
      if (nx) log(`        다음 쪽이 제1부를 여는가 : ${/제\s*1\s*부[.\s]*모\s*집\s*(또는|,)?\s*매\s*출/.test(nx.slice(0, 400)) ? '★ 그렇다' : '아니다'}`);
    }

    /* ★ 목차 판정을 그 자리에서 따져 본다 ★
       앞서 버려진 108종목이 여기서 갈렸다 — 목차 쪽이 「제1부」 로 시작하는 바람에
       「제N부로 쪽을 열면 건너뛴다」 에 걸려 목차가 아닌 것으로 넘어갔고, 그래서
       제1부가 목차 쪽으로 잡혀 요약정보보다 앞섰다. 조건 이름을 옮겨 적지 않고
       tocPages 가 실제로 내놓은 집합과 나란히 놓는다. */
    log('   목차 판정 — 앞 여섯 쪽');
    for (let i = 0; i < Math.min(6, pages.length); i++) {
      const t = pages[i], head = t.slice(0, 120);
      const open = head.match(/^\s*\d{0,4}\s*제\s*([12])\s*부/);
      const other = open ? (open[1] === '1' ? /제\s*2\s*부/ : /제\s*1\s*부/).test(t) : false;
      const facts = [
        /목\s*차/.test(head) ? '「목차」 있음' : '「목차」 없음',
        open ? `제${open[1]}부로 쪽을 엶` + (other ? ' · 다른 부도 말함 → 목차로 봄' : ' · 다른 부는 안 말함 → 건너뜀') : '제N부로 안 엶',
        /제\s*1\s*부|\.{4,}|·{4,}|…{2,}/.test(t) ? '목차 표 있음' : '목차 표 없음',
        '절 제목 ' + (t.match(/\d+\s*\.\s*(집합투자기구의|투자목적|투자대상|투자전략|투자위험|매입|보수|이익\s*배\s*분|운용전문인력|재무|집합투자업자)/g) || []).length + '개',
      ];
      log(`     p.${String(i + 1).padStart(2)} ${toc.has(i) ? '목차로 봄  ' : '본문으로 봄'} · ${facts.join(' · ')}`);
      log(`          「${t.slice(0, 150)}」`);
    }

    log(`   필수 일곱 : ${r.body.length}/7 자리 · 차례 ${r.seq ? '맞음' : '★어긋남★'} · 제2부 뒤 ${at.part2 ? (r.afterP2 ? '맞음' : '★아님★') : '제2부 없음'}`);
    log(`        ${BODY_SEQ.map((k) => WHAT[k].slice(0, 4) + ' ' + (at[k] || '-')).join(' · ')}`);
  }

  const bodyOk = got.filter((r) => r.body.length === 7 && r.seq && r.afterP2).length;

  bar('요약');
  log(`읽은 종목 ${got.length}/${codes.length} · 필수 일곱 자리가 온전한(7/7 · 차례 맞음 · 제2부 뒤) 종목 ${bodyOk}`);
  log('');
  log('읽는 법 — 잡힌 쪽 글이 정말 그 구간 첫머리면, 그 문서는 구조가 다른 것이므로');
  log('통째로 비우는 지금이 맞다. 그게 아니라 유의사항·표지·목차 같은 엉뚱한 쪽이면');
  log('규칙이 헛짚은 것이니 고칠 데가 있다. 가르는 것은 숫자가 아니라 위의 원문이다.');
  bar('조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 실패:', (e && e.stack) || e); process.exit(1); });
