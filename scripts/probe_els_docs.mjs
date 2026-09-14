#!/usr/bin/env node
/**
 * 미래에셋증권 홈페이지에 ELS 회차별 「설명서」 가 어떤 모습으로 걸려 있는지 조사한다.
 *
 * 왜 조사부터 하나
 *   지금 투자설명서 값은 전부 DART 일괄신고추가서류에서 온다. 그건 검증된
 *   파이프라인이 이미 있어서 그대로 쓴 것이지, 홈페이지 문서를 보고 버린 것이
 *   아니다. 무엇이 걸려 있는지 모르는 채로 수집기를 쓰면 헛수고가 되므로
 *   **읽어만 보고 아무것도 커밋하지 않는다.**
 *
 * 보려는 것
 *   ① 회차 상세 화면이 따로 있나, 있으면 주소 규칙이 무엇인가
 *   ② 그 화면이 부르는 .json/.wjson 응답에 문서(파일명·경로) 항목이 있나
 *   ③ PDF 로 바로 가는 링크가 있나 (요약투자설명서·투자설명서·상품제안서·핵심설명서)
 *   ④ 로그인이 필요한가 (목록 API 는 로그인 없이 된다 — 상세도 그런가)
 *   ⑤ DART 에 없는 값이 있나 (판매수수료·청약방법·판매채널 같은 판매사 관점 항목)
 *
 * 결과는 **로그에 찍는다.** 이 저장소에서 아티팩트 내려받기가 막힌 적이 있어
 * (Azure blob 403) 로그만 보고도 판단할 수 있어야 한다.
 *
 * 사용: node scripts/probe_els_docs.mjs [회차수]
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const SCREEN = '/hks/hks4022/n01.do';      // ELS/DLS 캘린더 (청약중 목록)
const INTRO = '/hks/hks4023/n01.do';       // ELS/DLS 상품 소개
const LIST_API = '/hks/hks4022/a01.json';
const HOW_MANY = Number(process.argv[2] || 3);

/* 문서로 볼 만한 것 — 넓게 잡고 나중에 눈으로 거른다 */
const DOC_WORD = /투자설명서|요약투자설명서|간이투자설명서|핵심설명서|상품설명서|설명서|제안서|약관|공시|첨부|다운로드|파일/;
const DOC_EXT = /\.(pdf|hwp|hwpx|docx?|xlsx?|zip)(\?|$)/i;

const line = (s = '') => console.log(s);
const head = (s) => { line(); line('━'.repeat(72)); line(s); line('━'.repeat(72)); };

/* 응답 본문에서 문서로 보이는 대목만 추려 낸다 — 통째로 찍으면 로그가 묻힌다 */
function docHints(text) {
  const out = new Set();
  if (!text) return [];
  /* "키": "값" 중 파일처럼 보이는 것 */
  const re = /"([A-Za-z0-9_]{2,40})"\s*:\s*"([^"]{1,200})"/g;
  let m;
  while ((m = re.exec(text))) {
    const [, k, v] = m;
    if (DOC_EXT.test(v) || DOC_WORD.test(v) || /file|doc|pdf|atch|attach/i.test(k)) {
      out.add(`${k} = ${v.slice(0, 120)}`);
    }
  }
  return [...out].slice(0, 40);
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    acceptDownloads: false,
  });
  const page = await ctx.newPage();

  /* 오가는 통신을 전부 적어 둔다 — 어디서 문서가 나오는지 이걸로 찾는다 */
  const calls = [];
  page.on('response', async (res) => {
    const req = res.request();
    const url = res.url();
    if (/google|analytics|doubleclick|facebook|\.(png|jpg|jpeg|gif|svg|woff2?|css)(\?|$)/i.test(url)) return;
    const type = req.resourceType();
    if (!['xhr', 'fetch', 'document', 'other'].includes(type)) return;
    let text = '';
    try { text = (await res.text()).slice(0, 200000); } catch { /* 바이너리 */ }
    calls.push({ url, method: req.method(), status: res.status(), type,
                 bytes: text.length, hints: docHints(text),
                 postData: (req.postData() || '').slice(0, 300) });
  });

  head('① 캘린더 화면을 열고 세션을 잡는다');
  await page.goto(ORIGIN + SCREEN, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  line(`제목: ${await page.title()}`);
  line(`로그인 화면으로 튕겼나: ${/login|로그인/i.test(page.url()) ? '예 — ' + page.url() : '아니오'}`);

  head('② 목록 API 로 실제 회차를 받는다');
  const list = await page.evaluate(async ({ origin, api }) => {
    const r = await fetch(origin + api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: 'omkt_drvs_tcd=0&dlbr_term_yn=0&itm_nm=&prgs_scd=01&qry_sort_tp=0&qry_sort_sqn=0&next_key=',
      credentials: 'include',
    });
    return { status: r.status, text: (await r.text()).slice(0, 400000) };
  }, { origin: ORIGIN, api: LIST_API });

  let rows = [];
  try { rows = (JSON.parse(list.text).grid01) || []; } catch { /* 아래에서 알린다 */ }
  line(`HTTP ${list.status} · ${list.text.length}B · 상품 ${rows.length}건`);
  if (!rows.length) { line('!! 목록을 못 받았습니다 — 아래 응답 앞머리를 보십시오'); line(list.text.slice(0, 600)); }

  /* 목록 응답 자체에 문서 항목이 있는지 먼저 본다 (있으면 상세를 볼 필요도 없다) */
  head('③ 목록 응답에 문서로 보이는 항목이 있나');
  if (rows.length) {
    const keys = Object.keys(rows[0]);
    line(`한 행의 항목 ${keys.length}개:`);
    line('  ' + keys.join(', '));
    const docKeys = keys.filter((k) => /file|doc|pdf|atch|attach|url|link|path/i.test(k));
    line(`문서로 보이는 키: ${docKeys.length ? docKeys.join(', ') : '없음'}`);
    docKeys.forEach((k) => line(`  ${k} = ${JSON.stringify(rows[0][k])}`));
    const hints = docHints(list.text);
    line(`값에서 걸린 문서 흔적: ${hints.length ? '' : '없음'}`);
    hints.forEach((h) => line('  ' + h));
  }

  head('④ 화면에 걸린 링크·버튼 중 문서로 보이는 것');
  const links = await page.evaluate((src) => {
    const DOC = new RegExp(src.word);
    const EXT = new RegExp(src.ext, 'i');
    const out = [];
    document.querySelectorAll('a,button,[onclick],[data-href]').forEach((el) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const href = el.getAttribute('href') || el.getAttribute('data-href') || '';
      const oc = (el.getAttribute('onclick') || '').slice(0, 200);
      if (DOC.test(t) || DOC.test(href) || DOC.test(oc) || EXT.test(href)) {
        out.push({ tag: el.tagName.toLowerCase(), text: t, href: href.slice(0, 160), onclick: oc });
      }
    });
    return out.slice(0, 60);
  }, { word: DOC_WORD.source, ext: DOC_EXT.source });
  line(`${links.length}건`);
  links.forEach((l) => line(`  <${l.tag}> "${l.text}"  href=${l.href || '-'}  onclick=${l.onclick || '-'}`));

  head('⑤ 회차를 눌러 상세로 들어가 본다');
  const before = calls.length;
  const names = rows.slice(0, HOW_MANY).map((r) => String(r.itm_nm || ''));
  line(`대상: ${names.join(', ') || '(목록 없음)'}`);

  for (const nm of names) {
    line();
    line(`── ${nm}`);
    const mark = calls.length;
    const clicked = await page.evaluate((n) => {
      const rowsEl = [...document.querySelectorAll('table tbody tr')];
      const tr = rowsEl.find((r) => (r.textContent || '').includes(n));
      if (!tr) return ' 행을 못 찾음';
      const a = tr.querySelector('a,button') || tr.querySelector('td');
      if (!a) return ' 누를 것이 없음';
      a.click();
      return ' 클릭함: <' + a.tagName.toLowerCase() + '> ' + (a.textContent || '').trim().slice(0, 40);
    }, nm);
    line('  ' + clicked);
    await page.waitForTimeout(3000);

    line(`  주소: ${page.url()}`);
    const fresh = calls.slice(mark);
    line(`  이 사이 오간 요청 ${fresh.length}건:`);
    fresh.forEach((c) => {
      line(`    ${c.method} ${c.url.replace(ORIGIN, '')}  ${c.status} ${c.bytes}B` +
           (c.postData ? `  body=${c.postData.slice(0, 120)}` : ''));
      c.hints.forEach((h) => line(`        ↳ ${h}`));
    });

    /* 상세가 열렸으면 그 안의 문서 링크와 본문 낱말을 본다 */
    const detail = await page.evaluate((src) => {
      const DOC = new RegExp(src.word);
      const EXT = new RegExp(src.ext, 'i');
      const txt = (document.body.innerText || '').replace(/\s+/g, ' ');
      const anchors = [];
      document.querySelectorAll('a,button,[onclick]').forEach((el) => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
        const href = el.getAttribute('href') || '';
        const oc = (el.getAttribute('onclick') || '').slice(0, 200);
        if (DOC.test(t) || DOC.test(href) || DOC.test(oc) || EXT.test(href)) {
          anchors.push(`"${t}" href=${href.slice(0, 140)} onclick=${oc}`);
        }
      });
      const words = ['투자설명서', '요약투자설명서', '간이투자설명서', '핵심설명서', '상품제안서',
                     '판매수수료', '청약방법', '판매채널', '수수료', '중도상환', '모의실험'];
      const found = words.filter((w) => txt.includes(w));
      return { anchors: anchors.slice(0, 30), found, len: txt.length,
               around: found.slice(0, 4).map((w) => {
                 const i = txt.indexOf(w);
                 return w + ' → …' + txt.slice(Math.max(0, i - 60), i + 120) + '…';
               }) };
    }, { word: DOC_WORD.source, ext: DOC_EXT.source });

    line(`  본문 ${detail.len}자 · 문서 낱말: ${detail.found.join(', ') || '없음'}`);
    detail.anchors.forEach((a) => line(`    링크 ${a}`));
    detail.around.forEach((a) => line(`    ${a}`));

    /* 캘린더로 되돌아간다 (상세가 같은 화면을 덮었을 수 있다) */
    await page.goto(ORIGIN + SCREEN, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
  }

  head('⑥ 「상품 소개」 화면(hks4023)도 본다');
  const mark2 = calls.length;
  await page.goto(ORIGIN + INTRO, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => line('  열기 실패: ' + e.message));
  await page.waitForTimeout(2500);
  line(`제목: ${await page.title()}`);
  const intro = await page.evaluate((src) => {
    const DOC = new RegExp(src.word);
    const EXT = new RegExp(src.ext, 'i');
    const out = [];
    document.querySelectorAll('a,button,[onclick]').forEach((el) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const href = el.getAttribute('href') || '';
      const oc = (el.getAttribute('onclick') || '').slice(0, 200);
      if (DOC.test(t) || DOC.test(href) || DOC.test(oc) || EXT.test(href)) out.push(`"${t}" href=${href.slice(0,140)} onclick=${oc}`);
    });
    return out.slice(0, 40);
  }, { word: DOC_WORD.source, ext: DOC_EXT.source });
  line(`문서로 보이는 링크 ${intro.length}건`);
  intro.forEach((a) => line('  ' + a));
  calls.slice(mark2).forEach((c) => {
    if (c.hints.length) {
      line(`  ${c.method} ${c.url.replace(ORIGIN, '')} ${c.status}`);
      c.hints.forEach((h) => line(`      ↳ ${h}`));
    }
  });

  head('⑦ 전체 요약 — 문서 흔적이 나온 요청만');
  const withDocs = calls.filter((c) => c.hints.length);
  line(`오간 요청 ${calls.length}건 중 문서 흔적 ${withDocs.length}건`);
  withDocs.forEach((c) => {
    line(`  ${c.method} ${c.url.replace(ORIGIN, '')}  ${c.status} ${c.bytes}B`);
    c.hints.slice(0, 8).forEach((h) => line(`      ↳ ${h}`));
  });
  line();
  line('오간 .json / .wjson 요청 (문서와 무관해도 경로 규칙을 보기 위해):');
  [...new Set(calls.filter((c) => /\.(w?json)(\?|$)/.test(c.url)).map((c) => `${c.method} ${c.url.replace(ORIGIN, '')} ${c.status}`))]
    .slice(0, 40).forEach((u) => line('  ' + u));

  await browser.close();
  head('조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 조사 실패:', e && e.stack || e); process.exit(1); });
