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

const require0 = createRequire(import.meta.url);
const pdfjs = require0('pdfjs-dist/legacy/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = require0.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const HOW_MANY = Number(process.argv[2] || 40);
const HEAD = 200;

/* 쪽 앞부분은 「22 9. 집합투자기구의 투자전략…」 처럼 인쇄 쪽번호로 시작한다.
   그래서 제목을 줄머리에 고정하지 않고 앞부분 안에서 찾는다. */
/* zone 'head' — 쪽을 새로 여는 것들. 쪽 앞부분에서만 찾는다.
   zone 'body' — 절 제목이 **쪽 중간에서 시작**하는 것들. 쪽 전체에서 찾되
                 첫 번째로 나온 쪽을 쓴다.
   왜 갈랐나: 첫 표본에서 투자전략 30%, 보수 28%, 과세 0% 였다. 원인은 규칙이
   아니라 문서 구조였다 — 펀드 투자설명서는 ELS 와 달리 절이 쪽 경계에서
   시작하지 않고 본문 중간에서 이어진다. 쪽 앞부분만 보면 못 찾는다.
   번호 붙은 제목(「9. 집합투자기구의 투자전략 및 수익구조」)은 문서에서 한 번만
   제목으로 쓰이므로, 목차를 뺀 뒤 첫 번째 것을 쓰는 것은 추측이 아니다. */
const ANCHORS = [
  /* 요약정보는 **목차보다 앞**에 오는 문서가 많다. 목차 다음부터 보면 통째로
     놓친다. 그래서 zone 'first' — 목차 쪽만 빼고 처음부터 보되 첫 쪽을 쓴다.
     구간이 여러 쪽에 걸쳐도 창구가 짚는 것은 시작 쪽이다. */
  ['summary', 'first', /요\s*약\s*정\s*보/, '요약정보 (간이투자설명서)'],
  ['part1', 'first', /제\s*1\s*부[.\s]*모집\s*또는\s*매출/, '제1부 모집 또는 매출'],
  ['part2', 'first', /제\s*2\s*부[.\s]*집합투자기구에\s*관한/, '제2부 집합투자기구'],
  ['manager', 'body', /\d+\s*\.\s*운용전문인력에\s*관한\s*사항/, '운용전문인력'],
  ['object', 'body', /\d+\s*\.\s*(집합투자기구의\s*)?투자목적\s*(및|,)?\s*/, '투자목적'],
  ['target', 'body', /\d+\s*\.\s*(집합투자기구의\s*)?투자대상/, '투자대상'],
  ['strategy', 'body', /\d+\s*\.\s*(집합투자기구의\s*)?투자전략/, '투자전략 및 수익구조'],
  ['risk', 'body', /\d+\s*\.\s*(집합투자기구의\s*)?투자위험/, '투자위험'],
  ['trade', 'body', /\d+\s*\.\s*매입\s*,?\s*환매\s*,?\s*전환/, '매입·환매·전환절차'],
  ['fee', 'body', /\d+\s*\.\s*(집합투자기구의\s*)?보수\s*(및|,)\s*수수료/, '보수 및 수수료'],
  /* 과세는 두 번 고쳐도 0% 였다. 원문을 찍어 보니 제목이 「과세」 로 시작하지
     않았다 — 「14. 이익배분 및 과세에 관한 사항」 이고, 「이익 배분」 처럼 사이가
     벌어진 문서도 있다. 짐작으로 세 번째 규칙을 쓰지 않고 원문대로 적는다. */
  ['tax', 'body', /\d+\s*\.\s*이익\s*배\s*분\s*(및|,)?\s*과세/, '이익배분 및 과세'],
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

function mapPages(pages) {
  /* 목차 쪽을 찾아 그 다음부터 본다. 목차에 제목이 다 적혀 있어 빼지 않으면
     어느 제목이든 두 쪽 이상에 걸린다. 「상세 목차」·「목 차」 도 잡는다. */
  let toc = -1;
  for (let i = 0; i < Math.min(pages.length, 12); i++) {
    if (/목\s*차/.test(pages[i].slice(0, 120))) toc = i;
  }
  const from = toc + 1;

  const found = {}, ambig = {}, miss = [], how = {}, all = {};
  for (const [key, zone, re, what] of ANCHORS) {
    const hits = [];
    const start = zone === 'first' ? 0 : from;
    for (let i = start; i < pages.length; i++) {
      if (zone === 'first' && i === toc) continue;   // 목차에는 제목이 다 적혀 있다
      const t = pages[i];
      if (re.test(zone === 'body' ? t : t.slice(0, HEAD))) hits.push(i + 1);
    }
    all[key] = hits;
    if (!hits.length) { miss.push(what); continue; }
    if (zone === 'head') {
      if (hits.length === 1) { found[key] = hits[0]; how[key] = 'head'; }
      else ambig[key] = hits;
    } else if (zone === 'first') {
      found[key] = hits[0];
      how[key] = hits.length === 1 ? 'first' : 'first(+' + (hits.length - 1) + ')';
    } else {
      /* 번호 붙은 제목은 문서에서 한 번만 제목으로 쓰인다. 뒤의 것들은
         상호참조라 첫 번째를 쓴다 — 다만 몇 곳에 나왔는지 함께 적어 둔다. */
      found[key] = hits[0];
      how[key] = hits.length === 1 ? 'body' : 'body(+' + (hits.length - 1) + ')';
    }
  }
  return { found, ambig, miss, how, all, toc: toc + 1 };
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
      if (zone === 'first' && m.found[key]) m.peek[key] = pages[m.found[key] - 1].slice(0, 76);
    }
    res.push({ ...it, pages: pages.length, ...m });
    if ((i + 1) % 10 === 0) log(`  … ${i + 1}/${pick.length}`);
  }

  head('자리별 적중률');
  log('자리                      한 쪽(담김)   여러 쪽(비움)   없음');
  for (const [key, , , what] of ANCHORS) {
    const one = res.filter((r) => r.found[key]).length;
    const many = res.filter((r) => r.ambig[key]).length;
    const none = res.length - one - many;
    const pct = (100 * one / res.length).toFixed(0);
    log(`  ${what.padEnd(24)} ${String(one).padStart(3)} (${pct.padStart(3)}%)      ${String(many).padStart(3)}          ${String(none).padStart(3)}`);
  }

  head('여러 쪽에 걸린 예 (규칙이 더 좁아져야 하는 자리)');
  let shown = 0;
  for (const r of res) {
    for (const [k, hits] of Object.entries(r.ambig)) {
      if (shown++ >= 12) break;
      const what = (ANCHORS.find((a) => a[0] === k) || [])[3];
      log(`  ${r.name.slice(0, 28).padEnd(30)} ${what} → p.${hits.join(', p.')}`);
    }
    if (shown >= 12) break;
  }

  head('요약정보로 고른 쪽이 정말 시작 쪽인가 (앞 10종목)');
  res.slice(0, 10).forEach((r) => {
    const p = r.found.summary;
    log(`  ${r.name.slice(0, 26).padEnd(28)} ${p ? 'p.' + String(p).padStart(2) + ' (' + r.how.summary + ')  ' + r.peek.summary : '— 없음'}`);
  });

  head('한 자리도 못 찾은 종목 (서식이 다른 문서)');
  const bad = res.filter((r) => Object.keys(r.found).length <= 2);
  log(`${bad.length}/${res.length}종목`);
  bad.slice(0, 10).forEach((r) => log(`  ${r.mgr} · ${r.name.slice(0, 34)} (${r.pages}쪽, 목차 p.${r.toc}) — 담긴 자리 ${Object.keys(r.found).length}개`));

  head('요약');
  const avg = res.reduce((s, r) => s + Object.keys(r.found).length, 0) / res.length;
  log(`읽은 종목 ${res.length}개 · 쪽수 ${Math.min(...res.map((r) => r.pages))}~${Math.max(...res.map((r) => r.pages))}`);
  log(`종목당 담긴 자리 평균 ${avg.toFixed(1)}/${ANCHORS.length}개`);
  log('');
  log('판단 기준 — 창구가 실제로 짚는 자리(투자전략·투자위험·보수·매입환매)가');
  log('90% 넘게 「한 쪽」 으로 잡히면 전량을 돌릴 만하다. 아니면 규칙을 더 고친다.');
  head('표본 조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 실패:', (e && e.stack) || e); process.exit(1); });
