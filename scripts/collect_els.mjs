#!/usr/bin/env node
/**
 * 미래에셋증권 ELS 상품 주간 수집기
 *
 * 사이트가 WebSquare 기반 SPA 라 정적 HTML 에는 상품 정보가 없다.
 * 헤드리스 브라우저로 상품 목록 화면을 렌더링하면서 오가는 `.wjson` 응답을 가로채고,
 * 그중 상품 레코드로 보이는 JSON 을 data/els.js 스키마로 정규화한다.
 *
 * 설계 원칙
 *  - 사이트 구조 변경에 대비해 화면 후보를 여러 개 두고, 하나라도 되면 성공으로 본다
 *  - 필드명은 확정된 하나에 의존하지 않고 여러 후보 키를 순서대로 본다
 *  - 한 건도 못 얻으면 **exit 1 로 실패**시킨다. data/els.js 는 건드리지 않으므로
 *    페이지는 직전 주 데이터를 그대로 유지한다 (빈 화면이 되는 것보다 낫다)
 *
 * 사용: node scripts/collect_els.mjs
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const OUT_DATA = 'data/els.js';
const DEBUG_DIR = 'collect-debug';

/**
 * ELS 상품 목록이 있을 만한 화면들.
 * scripts/discover_els.mjs 로 찾은 경로를 여기에 추가한다.
 */
const SCREENS = [
  '/hki/hki3028/r01.do',   // 금융상품 > ELS/DLS 청약
  '/hki/hki3028/p01.do',
  '/hki/hki3029/r01.do',
  '/hki/hki7000/v05.do',
];

/** 상품 레코드로 보이는 객체인가 */
function looksLikeProduct(o) {
  if (!o || typeof o !== 'object') return false;
  const keys = Object.keys(o).join(' ');
  const vals = JSON.stringify(o);
  return /제\s*\d{3,6}\s*회|ELS|ELB|DLS|파생결합/i.test(vals) &&
         /NM|NAME|종목|상품|PDT|ITEM/i.test(keys);
}

/** 여러 후보 키 중 처음 값이 있는 것 */
function pick(o, ...keys) {
  for (const k of keys) {
    for (const actual of Object.keys(o)) {
      if (actual.toUpperCase() === k.toUpperCase() && o[actual] != null && o[actual] !== '') {
        return o[actual];
      }
    }
  }
  return null;
}

function toNum(v) {
  if (v == null) return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toDate(v) {
  if (!v) return null;
  const s = String(v).replace(/[^0-9]/g, '');
  if (s.length < 8) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

/** "90-90-85-85-80-75" / "90,90,85" 형태의 배리어 문자열을 파싱 */
function parseBarriers(v) {
  if (!v) return null;
  const nums = String(v).match(/\d{2,3}(?:\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  return nums.map(Number).filter((n) => n > 0 && n <= 130);
}

/** 원시 레코드 -> data/els.js 스키마 */
function normalize(raw) {
  const name = pick(raw, 'PDT_NM', 'ITEM_NM', 'GOODS_NM', 'PRDT_NM', 'SECN_NM', '상품명', 'NAME');
  if (!name) return null;

  const type = /ELB|원금지급/i.test(JSON.stringify(raw)) ? 'ELB'
             : /DLS|DLB/i.test(String(name)) ? 'DLS' : 'ELS';

  const maturityMonths = toNum(pick(raw, 'MTRT_MM', 'TERM_MM', 'INVT_TERM', '만기', 'MATURITY')) ?? 36;
  const couponAnnual = toNum(pick(raw, 'ERNRT', 'YELD', 'RATE', 'PROFIT_RT', 'EXP_ERNRT', '수익률'));
  if (couponAnnual == null) return null;

  const barriers = parseBarriers(pick(raw, 'EXER_PRC', 'BARRIER', 'RDMPT_CNDT', '행사가격', 'STRIKE'));
  const count = barriers?.length || Math.max(1, Math.round(maturityMonths / 6));
  const step = maturityMonths / count;
  const schedule = Array.from({ length: count }, (_, i) => ({
    months: Math.round(step * (i + 1)),
    barrier: barriers ? barriers[i] : 90,
  }));

  const kiRaw = pick(raw, 'KI_PRC', 'KNOCK_IN', 'NOCKIN', '낙인', 'KI');
  const knockIn = kiRaw == null || /없|NO|N\/A/i.test(String(kiRaw)) ? null : toNum(kiRaw);

  const underRaw = pick(raw, 'UNDLY_AST', 'BASE_AST', 'UNDERLYING', '기초자산', 'BASE_ITEM_NM');
  const underlyings = underRaw
    ? String(underRaw).split(/[,/·]|\s{2,}/).map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    code: String(pick(raw, 'PDT_CD', 'ITEM_CD', 'GOODS_CD', 'SECN_CD', 'CODE') ?? name).slice(0, 40),
    name: String(name).trim(),
    type,
    shape: 'stepdown',
    underlyings,
    couponAnnual,
    maturityMonths,
    schedule,
    knockIn,
    principalProtection: type === 'ELB' ? 100 : 0,
    riskGrade: toNum(pick(raw, 'RISK_GRD', 'RISK_GRADE', '위험등급')) ?? null,
    offerStart: toDate(pick(raw, 'SBSCR_STRT_DT', 'OFFER_START', 'STRT_DT', '청약시작일')),
    offerEnd: toDate(pick(raw, 'SBSCR_END_DT', 'OFFER_END', 'END_DT', '청약종료일')),
    issueDate: toDate(pick(raw, 'ISSU_DT', 'ISSUE_DATE', '발행일')),
    minAmount: toNum(pick(raw, 'MIN_AMT', 'MIN_AMOUNT', '최소가입금액')) ?? 1000000,
    url: null,
  };
}

/** 임의 깊이 JSON 에서 상품처럼 보이는 객체를 전부 긁어온다 */
function harvest(node, acc = [], depth = 0) {
  if (depth > 8 || !node || typeof node !== 'object') return acc;
  if (Array.isArray(node)) {
    for (const x of node) harvest(x, acc, depth + 1);
    return acc;
  }
  if (looksLikeProduct(node)) acc.push(node);
  for (const v of Object.values(node)) harvest(v, acc, depth + 1);
  return acc;
}

async function main() {
  await mkdir(DEBUG_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  const bodies = [];
  page.on('response', async (res) => {
    const req = res.request();
    if (!['xhr', 'fetch'].includes(req.resourceType())) return;
    if (/google|analytics|doubleclick/.test(res.url())) return;
    try {
      const body = await res.text();
      if (body.length > 200) bodies.push({ url: res.url(), post: req.postData() || '', body });
    } catch {}
  });

  // 세션 쿠키 확보
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);

  const tried = [];
  for (const path of SCREENS) {
    try {
      await page.goto(ORIGIN + path, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3000);
      tried.push({ path, title: await page.title(), ok: true });
    } catch (e) {
      tried.push({ path, error: String(e?.message ?? e) });
    }
  }
  await browser.close();

  // 응답에서 상품 레코드 수확
  const rawProducts = [];
  for (const b of bodies) {
    let json;
    try { json = JSON.parse(b.body); } catch { continue; }
    for (const r of harvest(json)) rawProducts.push(r);
  }

  await writeFile(join(DEBUG_DIR, 'tried.json'), JSON.stringify(tried, null, 2));
  await writeFile(join(DEBUG_DIR, 'bodies.json'),
    JSON.stringify(bodies.map((b) => ({ url: b.url, post: b.post, body: b.body.slice(0, 8000) })), null, 2));
  await writeFile(join(DEBUG_DIR, 'raw-products.json'), JSON.stringify(rawProducts.slice(0, 200), null, 2));

  const products = [];
  const seen = new Set();
  for (const r of rawProducts) {
    const p = normalize(r);
    if (!p || seen.has(p.code)) continue;
    seen.add(p.code);
    products.push(p);
  }

  console.log(`방문 화면 ${tried.length}건, 응답 ${bodies.length}건, 원시 레코드 ${rawProducts.length}건, 정규화 ${products.length}건`);
  tried.forEach((t) => console.log(`  ${t.ok ? 'OK ' : 'ERR'} ${t.path} ${t.title || t.error}`));

  if (!products.length) {
    console.error(
      '\n상품을 한 건도 수집하지 못했습니다.\n' +
      `  · ${OUT_DATA} 는 그대로 두므로 페이지는 직전 데이터를 유지합니다.\n` +
      `  · ${DEBUG_DIR}/ 의 응답 원문을 보고 SCREENS / normalize() 를 갱신하세요.\n` +
      '  · 화면 경로가 바뀌었다면 scripts/discover_els.mjs 를 다시 돌리세요.'
    );
    process.exit(1);
  }

  // 기존 파일의 헤더 주석은 유지하고 데이터만 교체
  const header = (await readFile(OUT_DATA, 'utf8')).split('window.ELS_DATA')[0];
  const payload = {
    updatedAt: new Date().toISOString(),
    source: 'live',
    sourceNote: '미래에셋증권 홈페이지 자동 수집',
    sourceNoteEn: 'Auto-collected from the Mirae Asset Securities website',
    products,
  };
  await writeFile(OUT_DATA, header + 'window.ELS_DATA = ' + JSON.stringify(payload, null, 2) + ';\n');
  console.log(`\n${OUT_DATA} 갱신 완료 — 상품 ${products.length}건`);
}

main().catch((e) => { console.error(e); process.exit(1); });
