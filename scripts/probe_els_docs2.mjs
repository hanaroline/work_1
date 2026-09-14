#!/usr/bin/env node
/**
 * ELS 홈페이지 설명서 조사 — 2차.
 *
 * 1차(probe_els_docs.mjs)에서 두 가지를 놓쳤다.
 *   ① 회차 상세가 새 창으로 열리는데 그 창으로 따라가지 않아, 세 번 다
 *      캘린더 본문을 읽고는 「문서 낱말 없음」 이라고 적었다.
 *   ② 상세 응답 24KB 는 HTML 인데 문서 탐지기가 JSON 꼴만 찾게 돼 있었다.
 *   ③ 표본이 앞줄 ELB 였다 — 정작 보려던 ELS 회차가 아니었다.
 *
 * 그래서 이번에는 **상세 주소를 직접 연다.** 1차에서 주소 규칙을 얻었다:
 *   GET /hks/hks4023/p02.do?item_cd=<ISIN>&...
 * 우리는 모든 상품의 ISIN 을 이미 갖고 있으므로 클릭이 필요 없다.
 *
 * 그리고 1차에서 나온 단서 하나를 확인한다 —
 *   「청약투자설명서/조견표」 게시판 /bbs/board/message/list.do?categoryId=41
 *
 * 읽기만 한다. 아무것도 커밋하지 않는다.
 *
 * 사용: node scripts/probe_els_docs2.mjs
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const SCREEN = '/hks/hks4022/n01.do';
const LIST_API = '/hks/hks4022/a01.json';
const DETAIL = '/hks/hks4023/p02.do';
const BOARD = '/bbs/board/message/list.do?categoryId=41';

/* DART 에서 이미 채우고 있는 값 — 홈페이지에 더 있는지 견주어 본다 */
const DART_HAS = ['기초자산', '조기상환', '낙인', '만기', '지급률', '변동성', '손실'];
/* DART 에 옅게 나오는, 판매사만 아는 값 */
const SALES_ONLY = ['판매수수료', '수수료', '청약방법', '판매채널', '최소청약', '청약단위',
                    '영업점', '온라인', '판매사', '창구', '숙려', '철회'];

const line = (s = '') => console.log(s);
const head = (s) => { line(); line('━'.repeat(72)); line(s); line('━'.repeat(72)); };

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  head('① 세션을 잡고 목록에서 ELS 회차를 고른다');
  await page.goto(ORIGIN + SCREEN, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const list = await page.evaluate(async ({ origin, api }) => {
    const r = await fetch(origin + api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: 'omkt_drvs_tcd=0&dlbr_term_yn=0&itm_nm=&prgs_scd=01&qry_sort_tp=0&qry_sort_sqn=0&next_key=',
      credentials: 'include',
    });
    return (await r.text()).slice(0, 400000);
  }, { origin: ORIGIN, api: LIST_API });

  let rows = [];
  try { rows = JSON.parse(list).grid01 || []; } catch { /* 아래에서 알린다 */ }
  const els = rows.filter((r) => /\(ELS\)/.test(String(r.itm_nm || ''))).slice(0, 3);
  line(`전체 ${rows.length}건 중 ELS ${rows.filter((r) => /\(ELS\)/.test(String(r.itm_nm))).length}건`);
  line(`살펴볼 회차: ${els.map((r) => `${r.itm_nm}(${r.itm_no})`).join(', ') || '없음'}`);

  head('② 상세 페이지를 주소로 직접 연다 — 새 창을 기다리지 않는다');
  for (const r of els) {
    const url = `${ORIGIN}${DETAIL}?item_cd=${encodeURIComponent(r.itm_no)}`
      + `&hlv_fn_ivst_pd_yn=${r.hlv_fn_ivst_pd_yn ?? 0}`
      + `&cpt_r=${r.cpt_r ?? ''}&apy_a=${r.apy_a ?? ''}`
      + `&omkt_drvs_pcd_nm=${encodeURIComponent(r.omkt_drvs_pcd_nm ?? '')}`;
    line();
    line(`── ${r.itm_nm}  (${r.itm_no})`);
    line(`   ${url.slice(0, 150)}…`);

    const d = await ctx.newPage();
    let ok = true;
    await d.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => { ok = false; line('   열기 실패: ' + e.message); });
    if (!ok) { await d.close(); continue; }
    await d.waitForTimeout(1500);

    const info = await d.evaluate(({ dart, sales }) => {
      const txt = (document.body.innerText || '').replace(/[ \t]+/g, ' ');
      const anchors = [];
      document.querySelectorAll('a,button,[onclick]').forEach((el) => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50);
        const href = el.getAttribute('href') || '';
        const oc = (el.getAttribute('onclick') || '').slice(0, 160);
        if (/설명서|제안서|조견표|약관|다운로드|파일|첨부|\.pdf|\.hwp/i.test(t + ' ' + href + ' ' + oc)) {
          anchors.push(`"${t}" href=${href.slice(0, 120)} onclick=${oc}`);
        }
      });
      return {
        title: document.title,
        len: txt.length,
        head: txt.slice(0, 700),
        anchors: anchors.slice(0, 25),
        dartWords: dart.filter((w) => txt.includes(w)),
        salesWords: sales.filter((w) => txt.includes(w)),
        salesAround: sales.filter((w) => txt.includes(w)).slice(0, 6).map((w) => {
          const i = txt.indexOf(w);
          return w + ' → …' + txt.slice(Math.max(0, i - 70), i + 130).replace(/\n/g, ' ') + '…';
        }),
      };
    }, { dart: DART_HAS, sales: SALES_ONLY });

    line(`   제목: ${info.title}`);
    line(`   본문 ${info.len}자`);
    line(`   DART 가 이미 가진 값: ${info.dartWords.join(', ') || '없음'}`);
    line(`   판매사만 아는 값: ${info.salesWords.join(', ') || '없음'}`);
    info.salesAround.forEach((s) => line(`     ${s}`));
    line(`   설명서/제안서 링크 ${info.anchors.length}건`);
    info.anchors.forEach((a) => line(`     ${a}`));
    line('   ── 본문 앞머리 ──');
    info.head.split('\n').filter((s) => s.trim()).slice(0, 22).forEach((s) => line('     | ' + s.trim().slice(0, 110)));
    await d.close();
  }

  head('③ 「청약투자설명서/조견표」 게시판을 연다');
  const b = await ctx.newPage();
  let bok = true;
  await b.goto(ORIGIN + BOARD, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => { bok = false; line('열기 실패: ' + e.message); });
  if (bok) {
    await b.waitForTimeout(2000);
    line(`제목: ${await b.title()}`);
    line(`주소: ${b.url}`);
    line(`로그인으로 튕겼나: ${/login|로그인/i.test(b.url) ? '예' : '아니오'}`);
    const posts = await b.evaluate(() => {
      const out = [];
      document.querySelectorAll('table tbody tr, ul li, .board-list li').forEach((el) => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length < 6) return;
        const a = el.querySelector('a');
        out.push({ text: t.slice(0, 130), href: (a && (a.getAttribute('href') || '')).slice(0, 160) || '',
                   onclick: (a && (a.getAttribute('onclick') || '')).slice(0, 160) || '' });
      });
      return out.slice(0, 25);
    });
    line(`목록 ${posts.length}건`);
    posts.forEach((p) => { line(`  ${p.text}`); if (p.href || p.onclick) line(`      href=${p.href} onclick=${p.onclick}`); });
  }
  await b.close();

  await browser.close();
  head('2차 조사 끝 — 아무것도 커밋하지 않았습니다');
}

main().catch((e) => { console.error('!! 조사 실패:', (e && e.stack) || e); process.exit(1); });
