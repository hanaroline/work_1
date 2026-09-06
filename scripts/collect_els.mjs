#!/usr/bin/env node
/**
 * 미래에셋증권 ELS/ELB 상품 주간 수집기
 *
 * 엔드포인트 (scripts/discover_els.mjs 로 특정, 로그인 불필요)
 *   화면  : https://securities.miraeasset.com/hks/hks4022/n01.do  (ELS/DLS 캘린더)
 *           https://securities.miraeasset.com/hks/hks4023/n01.do  (ELS/DLS 상품 소개)
 *   데이터: POST /hks/hks4022/a01.json
 *           omkt_drvs_tcd=&qry_strt_dt=<오늘>&qry_end_dt=<오늘>
 *           &dlbr_term_yn=0&qry_sort_tp=0&qry_sort_sqn=0&next_key=
 *
 *   ★ 조회조건은 화면이 스스로 보내는 것과 같아야 한다 ★
 *   앞 판은 prgs_scd=01 (진행중) 로 물었다. 2026-09-07 에 화면은 40건을 그렸는데
 *   이 조건으로는 21건만 왔다 — 그날 새로 모집을 시작한 19건이 통째로 빠졌다.
 *   HTTP 200 · continueYn=0 으로 멀쩡하게 끝나서 빠진 줄도 몰랐다.
 *   이 화면은 「캘린더」 라 날짜로 묻는다. 그날 청약 가능한 것을 모두 준다
 *   (scripts/probe_els_list.mjs 로 화면의 요청을 가로채 확인했다).
 *
 * 응답 필드 (grid01[] 원소)
 *   itm_nm                  상품명            "미래에셋증권(ELB)4039"
 *   itm_no                  종목코드(ISIN)    "KR6MD0008RM9"
 *   uast_cn                 기초자산          "삼성전자, SK하이닉스"
 *   omkt_drv_frcs_ern_r     제시수익률(연 %)  "10.71000000"
 *   omkt_drv_desc_cn        구조 설명         "90-90-85-85-80-75, KI 50, 원화"
 *   omkt_drv_exrt_cycl_cn   만기              "3년"
 *   omkt_drv_rpy_cycl_cn    상환주기          "6개월"
 *   kni_yn                  낙인 여부         "0" | "1"
 *   lwrk_bar_rt             낙인 배리어율     "50.00000000"
 *   pca_grte_r              원금지급률(%)     "100.00000000"
 *   apy_strt_dt/apy_end_dt  청약 시작/종료    "20260727"
 *   prgs_stat_nm            진행상태          "진행중"
 *   omkt_drvs_pcd_nm        상품유형          "하이파이브 월지급식"
 *   omkt_drvs_risk_gcd      위험등급 코드     "15"
 *
 * 세션 쿠키가 필요해 헤드리스 브라우저로 홈을 한 번 열고 그 컨텍스트에서 호출한다.
 *
 * 사용: node scripts/collect_els.mjs
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// 파서만 재사용하는 쪽(reparse_els.mjs)에서는 playwright 가 없어도 되도록 지연 로딩한다
const require = createRequire(import.meta.url);
const playwright = () => require('playwright');

const ORIGIN = 'https://securities.miraeasset.com';
const LIST_API = '/hks/hks4022/a01.json';
const SCREEN = '/hks/hks4022/n01.do';
const OUT_DATA = 'data/els.js';
const DEBUG_DIR = 'collect-debug';
const MAX_PAGES = 20;

/** 금융투자상품 위험등급 문구 -> 등급 숫자 (1등급이 가장 위험) */
const RISK_GRADE = {
  '매우높은위험': 1, '높은위험': 2, '다소높은위험': 3,
  '보통위험': 4, '낮은위험': 5, '매우낮은위험': 6,
};

function toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toDate(v) {
  const s = String(v ?? '').replace(/[^0-9]/g, '');
  if (s.length < 8) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

/**
 * 오늘(한국 시각) — "20260907" 꼴.
 *
 * 러너는 UTC 로 돈다. 수집은 08:00 KST 에 도는데 그때 UTC 는 전날 23:00 이므로,
 * UTC 날짜로 물으면 캘린더가 하루 전을 답해 그날 새로 모집을 시작한 상품이 통째로
 * 빠진다. 화면이 쓰는 날짜와 같아야 화면과 같은 목록이 온다.
 */
function kstToday() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/** "3년" / "1년6개월" / "18개월" -> 개월 수 */
function toMonths(v) {
  const s = String(v ?? '');
  const y = Number((s.match(/(\d+)\s*년/) || [])[1] || 0);
  const m = Number((s.match(/(\d+)\s*개?월/) || [])[1] || 0);
  const total = y * 12 + m;
  return total > 0 ? total : null;
}

/**
 * 구조 설명 문자열에서 배리어 시퀀스와 낙인, 리자드 조건을 뽑는다.
 *   "90-90-85-85-80-75, KI 50, 원화"                        -> [90,90,85,85,80,75], KI 50
 *   "70-70-...-70(월지급배리어:70), KI -, 원화"              -> [70,...], KI 없음
 *   "95-90-90-85-85-80/ KI 45"                              -> [...], KI 45
 *   "80-75(45)-75-70-65-60, KI -, 원화, 리자드 조건 충족 시 연 20.5%"
 *                                                           -> [80,75,75,70,65,60], 2차에 리자드 45%
 *
 * 회차 뒤 괄호는 두 가지다. 숫자만 있으면 그 회차의 **리자드 배리어**이고
 * ("(45)"), "(월지급배리어:70)" 처럼 이름이 붙으면 별개의 월지급 조건이다.
 * 어느 쪽이든 괄호가 시퀀스를 끊어버리면 안 되므로 토큰 단위로 읽는다.
 */
function parseStructure(desc) {
  const s = String(desc ?? '');
  const seq = (s.match(
    /\d{2,3}(?:\.\d+)?(?:\([^)]*\))?(?:\s*-\s*\d{2,3}(?:\.\d+)?(?:\([^)]*\))?)+/
  ) || [])[0];

  let barriers = null;
  let lizard = null;
  if (seq) {
    barriers = [];
    for (const token of seq.split(/\s*-\s*/)) {
      const m = token.match(/^(\d{2,3}(?:\.\d+)?)(?:\((.*)\))?$/);
      if (!m) continue;
      const bar = Number(m[1]);
      if (!(bar > 0 && bar <= 200)) continue;
      const index = barriers.push(bar) - 1;
      if (m[2] && /^\d{2,3}(?:\.\d+)?$/.test(m[2])) lizard = { index, barrier: Number(m[2]) };
    }
    if (!barriers.length) barriers = null;
  }

  // "리자드 조건 충족 시 연 20.5%" — 리자드 상환 시 적용되는 수익률
  if (lizard) {
    const rate = (s.match(/리자드[^0-9%]*(\d+(?:\.\d+)?)\s*%/) || [])[1];
    if (rate) lizard.rate = Number(rate);
  }

  const kiRaw = (s.match(/(?:KI|K\.I|낙인|녹인)\s*[:\s]*([0-9]{2,3}(?:\.\d+)?|-|없음)/i) || [])[1];
  const knockIn = !kiRaw || kiRaw === '-' || kiRaw === '없음' ? null : Number(kiRaw);

  return { barriers, knockIn, lizard };
}

/**
 * data/els.js 본문 직렬화.
 * 상품 목록은 사람이 diff 로 읽을 수 있게 들여쓰고, 과거 시세(history)는
 * 수천 개의 숫자라 한 줄로 눌러 담는다(줄마다 숫자 하나가 되는 걸 막는다).
 */
function serializeData(data) {
  if (!data.history) return JSON.stringify(data, null, 2);
  const compact = JSON.stringify(data.history);
  return JSON.stringify({ ...data, history: '@@HISTORY@@' }, null, 2)
    .replace('"@@HISTORY@@"', compact);
}

/** data/els.js 읽어 { header, data } 로 분해 */
async function readData(file) {
  const src = await readFile(file, 'utf8');
  const header = src.split('window.ELS_DATA')[0];
  const body = src.split(/window\.ELS_DATA\s*=\s*/)[1];
  if (!body) throw new Error(`${file} 에서 window.ELS_DATA 를 찾지 못했습니다.`);
  return { header, data: JSON.parse(body.trim().replace(/;\s*$/, '')) };
}

/** grid01 원소 -> data/els.js 스키마 */
function normalize(r) {
  const name = String(r.itm_nm ?? '').trim();
  if (!name) return null;

  const couponRate = toNum(r.omkt_drv_frcs_ern_r);
  if (couponRate == null) return null;

  const { barriers, knockIn: descKi, lizard } = parseStructure(r.omkt_drv_desc_cn);

  const maturityMonths = toMonths(r.omkt_drv_exrt_cycl_cn)
    ?? (barriers ? barriers.length * (toMonths(r.omkt_drv_rpy_cycl_cn) ?? 6) : 36);

  // 상환주기가 있으면 그걸로 회차 간격을 잡고, 없으면 배리어 개수로 균등 분할
  const cycle = toMonths(r.omkt_drv_rpy_cycl_cn);
  const count = barriers?.length ?? (cycle ? Math.round(maturityMonths / cycle) : 6);
  const step = maturityMonths / count;
  const schedule = Array.from({ length: count }, (_, i) => ({
    months: Math.round(step * (i + 1)),
    barrier: barriers ? barriers[i] : null,
    ...(lizard && lizard.index === i
      ? { lizard: lizard.barrier, lizardRate: lizard.rate ?? null }
      : {}),
  })).filter((x) => x.barrier != null);
  if (!schedule.length) return null;

  // 낙인은 kni_yn / lwrk_bar_rt 를 우선하고, 없으면 설명 문자열에서 뽑은 값을 쓴다
  const kniYn = String(r.kni_yn ?? '');
  const barRate = toNum(r.lwrk_bar_rt);
  const knockIn = kniYn === '0' ? null
                : barRate && barRate > 0 ? barRate
                : descKi;

  const principalProtection = toNum(r.pca_grte_r) ?? 0;
  const type = /\(ELB\)|ELB/i.test(name) ? 'ELB'
             : /\(DLS\)|DLS/i.test(name) ? 'DLS'
             : /\(DLB\)|DLB/i.test(name) ? 'DLB' : 'ELS';

  const underlyings = String(r.uast_cn ?? '')
    .split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);

  return {
    code: String(r.itm_no ?? name).trim(),
    name,
    type,
    shape: String(r.omkt_drvs_pcd_nm ?? '').trim() || null,
    underlyings,
    couponRate,
    // omkt_drv_frcs_ern_r 은 "조건 충족시 연 수익률(세전)" 의 최대치다.
    // 홈페이지 화면의 컬럼 헤더와 표시값으로 확인 (scripts/verify_rate_basis.mjs).
    // 원금지급형 ELB 도 10%대가 나오는데, 이는 월지급 쿠폰이 조건부라
    // "최대" 연율일 뿐 확정 수익이 아니기 때문이다.
    rateBasis: 'annual',
    maxLossRate: toNum(r.max_abl_los_r),   // 조건 미충족시 최대손실률 %
    maturityMonths,
    schedule,
    knockIn,
    principalProtection,
    // 응답의 omkt_drvs_risk_gcd 는 사내 코드값이라 등급으로 쓰지 않는다.
    // 아래 두 값은 화면에서 읽은 위험등급 문구로 main() 에서 채운다.
    riskGrade: null,                       // 1(매우높은위험) ~ 6(매우낮은위험)
    riskLabel: null,                       // "높은위험" 등 원문 표기
    riskCode: String(r.omkt_drvs_risk_gcd ?? '') || null,
    status: String(r.prgs_stat_nm ?? '') || null,
    offerStart: toDate(r.apy_strt_dt),
    offerEnd: toDate(r.apy_end_dt),
    issueDate: null,
    minAmount: null,
    structureDesc: String(r.omkt_drv_desc_cn ?? '') || null,
    url: ORIGIN + SCREEN,
  };
}

async function main() {
  await mkdir(DEBUG_DIR, { recursive: true });

  const browser = await playwright().chromium.launch();
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  // 세션 쿠키 확보
  await page.goto(ORIGIN + SCREEN, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);

  // 페이지네이션 (continueYn / next_key)
  const rows = [];
  const pages = [];
  let nextKey = '';
  for (let i = 0; i < MAX_PAGES; i++) {
    const res = await page.evaluate(
      async ({ origin, api, nextKey, today }) => {
        const body =
          'omkt_drvs_tcd=&qry_strt_dt=' + today + '&qry_end_dt=' + today +
          '&dlbr_term_yn=0&qry_sort_tp=0&qry_sort_sqn=0&next_key=' + encodeURIComponent(nextKey);
        const r = await fetch(origin + api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body,
          credentials: 'include',
        });
        return { status: r.status, text: await r.text() };
      },
      { origin: ORIGIN, api: LIST_API, nextKey, today: kstToday() }
    );

    pages.push({ nextKey, status: res.status, bytes: res.text.length });
    let json;
    try { json = JSON.parse(res.text); } catch {
      pages[pages.length - 1].parseError = true;
      break;
    }
    const grid = json.grid01 || [];
    rows.push(...grid);
    // 0건일 때 "판매 상품이 없다" 와 "엔드포인트가 깨졌다" 를 구분해야 하므로
    // 응답 상태와 크기를 함께 남긴다.
    console.log(`  페이지 ${i + 1}: ${grid.length}건 (누적 ${rows.length}, ` +
                `HTTP ${res.status}, ${res.text.length}B, continueYn=${json.continueYn})`);

    if (String(json.continueYn) !== '1' || !grid.length) break;
    nextKey = json.cts?.[0]?.next_key || grid[grid.length - 1]?.next_key || '';
    if (!nextKey) break;
  }

  // 화면에 실제로 그려진 목록을 그대로 떠 둔다.
  //  - 위험등급은 목록 API 응답에 없다(omkt_drvs_risk_gcd 는 사내 코드값). 화면에만
  //    "낮은위험" 같은 문구로 나오므로 여기서 읽는다.
  //  - 수집 결과가 홈페이지 화면과 같은지 눈으로 대조할 수 있게 원문도 저장한다.
  const rendered = await page.evaluate(() => {
    const GRADES = ['매우높은위험', '높은위험', '다소높은위험', '보통위험', '낮은위험', '매우낮은위험'];
    const rows = [];
    for (const tr of document.querySelectorAll('table tbody tr')) {
      const txt = (tr.textContent || '').replace(/\s+/g, ' ').trim();
      const name = (txt.match(/미래에셋증권\((?:ELS|ELB|DLS|DLB)\)[0-9A-Za-z]+/) || [])[0];
      if (!name) continue;
      const cells = Array.from(tr.children).map((td) => (td.textContent || '').replace(/\s+/g, ' ').trim());
      rows.push({
        name,
        grade: GRADES.find((g) => txt.includes(g)) || null,
        // 화면에 보이는 수익률·손실률·청약기간 (수집값과 대조용)
        rate: (txt.match(/(?:최대\s*)?(-?\d+(?:\.\d+)?)\s*%/) || [])[1] || null,
        period: (txt.match(/(\d{4}\.\d{2}\.\d{2}\s*~\s*\d{4}\.\d{2}\.\d{2})/) || [])[1] || null,
        cells,
      });
    }
    return { title: document.title, count: rows.length, rows };
  }).catch(() => ({ title: null, count: 0, rows: [] }));

  const riskByName = {};
  for (const r of rendered.rows) if (r.grade) riskByName[r.name] = r.grade;
  console.log(`화면 렌더링 목록 ${rendered.count}건 / 위험등급 ${Object.keys(riskByName).length}건 확인`);

  /**
   * 화면이 그린 목록과 수집한 목록이 같은지 본다.
   *
   * 이것이 없어서 2026-09-07 에 19건이 조용히 빠졌다. 목록 API 가 HTTP 200 에
   * continueYn=0 으로 멀쩡하게 답했으므로 수집기는 다 받은 줄 알았고, 창구는
   * 그날 새로 나온 상품이 목록에 없는 것을 보고서야 알았을 것이다.
   *
   * 화면이 곧 창구가 보는 것이다. 그보다 적게 받았으면 그것은 수집 실패다.
   * 조용히 넘어가지 않는다.
   */
  if (rendered.count && rows.length < rendered.count) {
    const got = new Set(rows.map((r) => String(r.itm_nm ?? '')));
    const missing = rendered.rows.filter((r) => !got.has(r.name));
    console.error(
      `\n수집한 ${rows.length}건이 화면의 ${rendered.count}건보다 적습니다.\n` +
      '  · 목록 API 조회조건이 화면과 어긋났을 때 이렇게 됩니다.\n' +
      '  · scripts/probe_els_list.mjs 로 화면이 보내는 요청을 다시 확인하세요.'
    );
    missing.slice(0, 20).forEach((r) => console.error(`    빠짐: ${r.name} (청약 ${r.period || '?'})`));
    process.exit(1);
  }

  await browser.close();

  await writeFile(join(DEBUG_DIR, 'pages.json'), JSON.stringify(pages, null, 2));

  // 홈페이지 화면 원문 목록을 저장소에 남긴다. 수집 결과가 실제 판매 상품과
  // 같은지 이 파일로 대조한다 (사이트 접근이 안 되는 환경에서의 확인 수단).
  // 0건일 때 덮어쓰면 대조 기준이 사라지므로 직전 내용을 그대로 둔다.
  if (rendered.count) {
    await mkdir('tools/discovery', { recursive: true });
    await writeFile('tools/discovery/rendered_list.json', JSON.stringify({
      capturedAt: new Date().toISOString(),
      screen: ORIGIN + SCREEN,
      title: rendered.title,
      apiCount: rows.length,
      renderedCount: rendered.count,
      rows: rendered.rows,
    }, null, 2));
  } else {
    console.log('화면 목록이 0건이라 tools/discovery/rendered_list.json 은 직전 내용을 유지합니다.');
  }
  await writeFile(join(DEBUG_DIR, 'raw-rows.json'), JSON.stringify(rows.slice(0, 300), null, 2));

  const products = [];
  const seen = new Set();
  const skipped = [];
  for (const r of rows) {
    const p = normalize(r);
    if (!p) { skipped.push({ itm_nm: r.itm_nm, desc: r.omkt_drv_desc_cn }); continue; }
    if (seen.has(p.code)) continue;
    seen.add(p.code);
    const label = riskByName[p.name];
    if (label) { p.riskLabel = label; p.riskGrade = RISK_GRADE[label] ?? null; }
    products.push(p);
  }

  // 청약 마감일이 가까운 순 → 수익률 높은 순
  // 청약 마감이 임박한 순 → 연 환산 수익률 높은 순
  const annual = (p) => p.couponRate * 12 / p.maturityMonths;
  products.sort((a, b) =>
    (a.offerEnd || '9999').localeCompare(b.offerEnd || '9999') || annual(b) - annual(a));

  console.log(`\n원시 ${rows.length}건 → 정규화 ${products.length}건 (스킵 ${skipped.length}건)`);
  if (skipped.length) {
    console.log('스킵된 항목:');
    skipped.slice(0, 10).forEach((s) => console.log(`  ${s.itm_nm} | ${s.desc}`));
  }

  if (!products.length) {
    // 청약 진행중인 상품이 실제로 없는 날이 있다. 그건 고장이 아니므로
    // 정상 종료하되, 홈페이지를 확인한 시각만 남겨 화면이 "언제 확인한 결과인지"
    // 말할 수 있게 한다. 응답 자체가 깨졌을 때만 실패로 다룬다.
    const first = pages[0] || {};
    const apiHealthy = first.status === 200 && !first.parseError;

    if (apiHealthy && !rows.length && !rendered.count) {
      console.log(
        '\n현재 청약 진행중인 상품이 0건입니다 (목록 API·홈페이지 화면 모두 0건).\n' +
        `  · ${OUT_DATA} 의 상품 목록은 그대로 두고 확인 시각만 기록합니다.`
      );
      const keep = await readData(OUT_DATA).catch(() => null);
      if (keep) {
        keep.data.checkedAt = new Date().toISOString();
        keep.data.checkedCount = 0;
        await writeFile(OUT_DATA, keep.header + 'window.ELS_DATA = ' + serializeData(keep.data) + ';\n');
      }
      return;
    }

    console.error(
      '\n상품을 한 건도 수집하지 못했습니다.\n' +
      `  · 목록 API: HTTP ${first.status ?? '응답없음'}${first.parseError ? ' (JSON 파싱 실패)' : ''}` +
      `, 원시 ${rows.length}건 / 화면 ${rendered.count}건\n` +
      `  · ${OUT_DATA} 는 그대로 두므로 페이지는 직전 데이터를 유지합니다.\n` +
      `  · ${DEBUG_DIR}/raw-rows.json 의 실제 응답과 normalize() 를 대조하세요.\n` +
      '  · 엔드포인트가 바뀌었다면 scripts/discover_els.mjs 를 다시 돌리세요.'
    );
    process.exit(1);
  }

  // 과거 시세는 collect_history.mjs 가 따로 채운다. 상품만 갈아끼우고 그대로 둔다.
  const prev = await readData(OUT_DATA).catch(() => ({ header: '', data: {} }));
  const payload = {
    updatedAt: new Date().toISOString(),
    checkedAt: new Date().toISOString(),
    checkedCount: products.length,
    source: 'live',
    sourceNote: '미래에셋증권 홈페이지 ELS/DLS 캘린더 (청약 진행중)',
    sourceNoteEn: 'Mirae Asset Securities ELS/DLS calendar — currently on offer',
    products,
    ...(prev.data.history ? { history: prev.data.history } : {}),
  };
  await writeFile(OUT_DATA, prev.header + 'window.ELS_DATA = ' + serializeData(payload) + ';\n');
  console.log(`${OUT_DATA} 갱신 완료 — 상품 ${products.length}건`);
}

// 수집기로 직접 실행할 때만 돈다. scripts/reparse_els.mjs 가 파서를 재사용한다.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

export { parseStructure, normalize, serializeData, readData };
