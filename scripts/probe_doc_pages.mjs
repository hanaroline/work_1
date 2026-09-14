#!/usr/bin/env node
/**
 * 교부 문서의 「쪽 구성」 을 본다 — 스크립트 항목에 페이지 번호를 붙이기 전에.
 *
 * 왜 조사가 먼저인가
 *   창구는 이 페이지 번호를 고객 앞에서 손가락으로 짚는 데 쓴다. 틀린 쪽을
 *   짚으면 그 자리에서 드러난다. 문서를 보지 않고 매칭 규칙을 쓰면 그게 바로
 *   틀리는 지점이므로, 실제 PDF 가 쪽마다 무엇을 담고 있는지 먼저 본다.
 *
 * 보는 것
 *   ① PDF 가 글자로 되어 있나, 이미지(스캔)인가
 *      — 이미지면 쪽 매칭 자체가 불가능하다. 가장 먼저 확인해야 할 것.
 *   ② 쪽마다 어떤 제목이 오나 (쪽 첫 줄들)
 *   ③ 우리 스크립트의 설명 항목이 몇 쪽에 걸리나, **한 쪽에만 걸리나**
 *      — 여러 쪽에 흩어지면 「짚을 쪽」 을 고를 수 없다. 그 사실을 봐야 한다.
 *   ④ 회차가 달라도 쪽 구성이 같은가
 *      — 같으면 한 번 만든 지도를 재사용할 수 있고, 다르면 회차마다 읽어야 한다.
 *
 * 읽기만 한다. 아무것도 커밋하지 않는다.
 *
 * 사용: node scripts/probe_doc_pages.mjs
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const SCREEN = '/hks/hks4022/n01.do';
const LIST_API = '/hks/hks4022/a01.json';
/* 1차 조사에서 얻은 규칙 — ISIN 하나로 주소가 정해진다 */
const DOC_MAIN = (isin) => `/public/editor/elsdls/${isin}.pdf`;   // 간이투자설명서 및 투자설명서 (교부본)
const DOC_SUM = (isin) => `/public/hks4412/002/${isin}.pdf`;      // 요약설명서

/* 우리 ELS 스크립트가 설명하는 항목 — 평가표 항목에서 그대로 가져왔다.
   여기 낱말이 문서의 몇 쪽에 있는지 본다. */
const ITEMS = [
  ['명칭·위험등급', ['위험등급', '상품위험등급', '투자위험등급']],
  ['고난도 안내', ['고난도']],
  ['유의사항·유사상품', ['유의사항', '유사상품']],
  ['불이익·유동성위험', ['유동성위험', '불이익']],
  ['기초자산·변동성', ['기초자산', '변동성']],
  ['기준가격 결정일', ['최초기준가격', '기준가격']],
  ['손익구조·상환조건', ['손익구조', '자동조기상환', '만기상환', '상환조건']],
  ['낙인(KI)', ['원금손실조건', '낙인', 'Knock', 'KI ']],
  ['최대손실·손실사례', ['최대손실', '원금손실', '손실률']],
  ['중도상환·공정가액', ['중도상환', '공정가액']],
  ['수수료·비용', ['수수료', '보수', '비용']],
  ['청약·숙려·철회', ['청약철회', '숙려', '청약기간']],
  ['과세', ['과세', '세금', '배당소득']],
  ['모의실험', ['모의실험', '시뮬레이션']],
];

const line = (s = '') => console.log(s);
const head = (s) => { line(); line('━'.repeat(74)); line(s); line('━'.repeat(74)); };

/* 브라우저 안에서 pdf.js 로 쪽마다 글자를 뽑는다.
   러너에서 node 로 PDF 를 받으면 인증서·리다이렉트에 걸릴 수 있어, 이미 세션을
   가진 브라우저가 받아 그 자리에서 읽게 한다 (금투협 수집기와 같은 이유다). */
async function readPdf(page, url) {
  return page.evaluate(async (u) => {
    const res = await fetch(u, { credentials: 'include' });
    if (!res.ok) return { error: 'HTTP ' + res.status };
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 1000) return { error: '너무 작음 ' + buf.byteLength + 'B' };
    const head8 = new TextDecoder().decode(new Uint8Array(buf.slice(0, 8)));
    if (!head8.startsWith('%PDF')) return { error: 'PDF 가 아님 (' + head8.replace(/[^\x20-\x7e]/g, '.') + ')' };
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const p = await pdf.getPage(i);
      const tc = await p.getTextContent();
      pages.push(tc.items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim());
    }
    return { bytes: buf.byteLength, numPages: pdf.numPages, pages };
  }, url);
}

async function report(label, doc) {
  line();
  line(`── ${label}`);
  if (doc.error) { line(`   받지 못함: ${doc.error}`); return null; }
  const empty = doc.pages.filter((t) => t.length < 40).length;
  line(`   ${doc.numPages}쪽 · ${(doc.bytes / 1024).toFixed(0)}KB · 글자가 거의 없는 쪽 ${empty}개`);
  if (empty === doc.numPages) {
    line('   !! 모든 쪽에 글자가 없습니다 — 스캔 이미지입니다. 쪽 매칭 불가.');
    return doc;
  }

  line('   ── 쪽마다 첫 머리 ──');
  doc.pages.forEach((t, i) => line(`     p.${String(i + 1).padStart(2)} (${String(t.length).padStart(5)}자) ${t.slice(0, 88)}`));

  line('   ── 설명 항목이 걸리는 쪽 ──');
  const map = {};
  for (const [name, words] of ITEMS) {
    const hits = [];
    doc.pages.forEach((t, i) => { if (words.some((w) => t.includes(w))) hits.push(i + 1); });
    map[name] = hits;
    const verdict = hits.length === 0 ? '없음 — 짚을 수 없음'
      : hits.length === 1 ? `p.${hits[0]}  ← 한 쪽뿐, 짚을 수 있음`
        : `p.${hits.join(', p.')}  (${hits.length}쪽에 흩어짐)`;
    line(`     ${name.padEnd(18)} ${verdict}`);
  }
  return { ...doc, map };
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  head('① 세션을 잡고 pdf.js 를 올린다');
  await page.goto(ORIGIN + SCREEN, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' });
  await page.evaluate(() => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  });
  line('pdf.js 준비됨');

  const listText = await page.evaluate(async ({ origin, api }) => {
    const r = await fetch(origin + api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: 'omkt_drvs_tcd=0&dlbr_term_yn=0&itm_nm=&prgs_scd=01&qry_sort_tp=0&qry_sort_sqn=0&next_key=',
      credentials: 'include',
    });
    return (await r.text()).slice(0, 400000);
  }, { origin: ORIGIN, api: LIST_API });

  let rows = [];
  try { rows = JSON.parse(listText).grid01 || []; } catch { /* 아래에서 알린다 */ }
  const els = rows.filter((r) => /\(ELS\)/.test(String(r.itm_nm || '')));
  const pick = [els[0], els[1], els[els.length - 1]].filter(Boolean);
  line(`ELS ${els.length}건 중 ${pick.length}건을 본다: ${pick.map((r) => r.itm_nm).join(', ')}`);

  head('② 교부본 —「간이투자설명서 및 투자설명서」');
  const maps = [];
  for (const r of pick) {
    const doc = await readPdf(page, ORIGIN + DOC_MAIN(r.itm_no));
    const res = await report(`${r.itm_nm}  (${r.itm_no})  ${DOC_MAIN(r.itm_no)}`, doc);
    if (res && res.map) maps.push({ name: r.itm_nm, numPages: res.numPages, map: res.map });
  }

  head('③ 회차가 달라도 쪽 구성이 같은가');
  if (maps.length >= 2) {
    const base = maps[0];
    line(`기준: ${base.name} (${base.numPages}쪽)`);
    maps.slice(1).forEach((m) => {
      const samePages = m.numPages === base.numPages;
      const diff = Object.keys(base.map).filter((k) => base.map[k].join(',') !== (m.map[k] || []).join(','));
      line(`  ${m.name} (${m.numPages}쪽) — 쪽수 ${samePages ? '같음' : '다름'} · 항목 위치가 다른 것 ${diff.length}개`);
      diff.forEach((k) => line(`      ${k}: 기준 p.${base.map[k].join(',') || '-'} ↔ 이 회차 p.${(m.map[k] || []).join(',') || '-'}`));
    });
  } else {
    line('비교할 만큼 받지 못했습니다.');
  }

  head('④ 요약설명서도 한 건 본다 (창구가 함께 짚는 문서)');
  if (pick[0]) {
    const doc = await readPdf(page, ORIGIN + DOC_SUM(pick[0].itm_no));
    await report(`${pick[0].itm_nm} 요약설명서  ${DOC_SUM(pick[0].itm_no)}`, doc);
  }

  await browser.close();
  head('조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 조사 실패:', (e && e.stack) || e); process.exit(1); });
