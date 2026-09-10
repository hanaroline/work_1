#!/usr/bin/env node
/**
 * 펀드 목록 파일(CSV / JSON) -> data/funds.js
 *
 * 왜 수집기가 아니라 변환기인가
 *   ELS 는 홈페이지 공개 화면에서 긁어올 수 있어 scripts/collect_els.mjs 가 있지만,
 *   펀드는 판매사가 취급하는 목록·보수·환매조건이 사내 시스템에 있고 화면마다 다르다.
 *   그래서 **사내에서 내려받은 목록 파일을 그대로 밀어 넣는** 방식으로 만든다.
 *   (공개 사이트를 추측해서 긁는 코드는 검증할 수 없어 넣지 않았다.)
 *
 * 입력
 *   CSV  : 첫 줄이 헤더. 아래 표의 한글/영문 머리글을 알아본다. 쉼표·따옴표 처리 포함.
 *   JSON : 객체 배열. 키 이름은 CSV 헤더와 같게.
 *
 *   | 필드            | 알아보는 머리글                          | 필수 |
 *   |-----------------|------------------------------------------|------|
 *   | name            | 펀드명 · 상품명 · name                    |  ●   |
 *   | code            | 펀드코드 · 표준코드 · code                |      |
 *   | manager         | 운용사 · 집합투자업자 · manager           |      |
 *   | region          | 지역 · 구분 (국내/해외) · region          |  ●   |
 *   | assetType       | 유형 · 자산유형 · assetType               |      |
 *   | riskGrade       | 위험등급 (1~6) · riskGrade                |      |
 *   | riskLabel       | 위험등급명 · riskLabel                    |      |
 *   | hedge           | 환헤지 (H/UH/환헤지형/환노출형) · hedge   |      |
 *   | invests         | 주요투자대상 · 투자대상 · invests         |      |
 *   | benchmark       | 비교지수 · 벤치마크 · benchmark           |      |
 *   | feeFront        | 선취수수료 · 선취판매수수료(%)            |      |
 *   | feeBack         | 후취수수료(%)                             |      |
 *   | totalExpense    | 총보수 · 총보수율(%)                      |      |
 *   | otherCost       | 기타비용(%)                               |      |
 *   | redemptionFee   | 환매수수료                                |      |
 *   | redemptionPricing | 환매기준가 · 기준가적용일                |      |
 *   | redemptionPayout  | 환매지급일 · 지급일                      |      |
 *   | derivatives     | 파생형 (Y/N)                              |      |
 *   | highComplexity  | 고난도 (Y/N)                              |      |
 *   | docDate         | 설명서기준일                              |      |
 *
 * 사용
 *   node scripts/build_funds_data.mjs funds.csv
 *   node scripts/build_funds_data.mjs funds.json --out data/funds.js
 *
 * 값이 비어 있으면 비운 채로 둔다. 화면은 빈 항목을 "확인필요"로 표시하지, 채워 넣지 않는다.
 */

import { readFile, writeFile } from 'node:fs/promises';

const HEADERS = {
  name: ['펀드명', '상품명', 'name'],
  code: ['펀드코드', '표준코드', '코드', 'code'],
  manager: ['운용사', '집합투자업자', 'manager'],
  region: ['지역', '구분', 'region'],
  assetType: ['유형', '자산유형', '펀드유형', 'assettype'],
  riskGrade: ['위험등급', 'riskgrade'],
  riskLabel: ['위험등급명', '위험등급문구', 'risklabel'],
  hedge: ['환헤지', '환헤지여부', 'hedge'],
  invests: ['주요투자대상', '투자대상', 'invests'],
  benchmark: ['비교지수', '벤치마크', 'benchmark'],
  feeFront: ['선취수수료', '선취판매수수료', 'feefront'],
  feeBack: ['후취수수료', '후취판매수수료', 'feeback'],
  totalExpense: ['총보수', '총보수율', 'totalexpense'],
  otherCost: ['기타비용', 'othercost'],
  redemptionFee: ['환매수수료', 'redemptionfee'],
  redemptionPricing: ['환매기준가', '기준가적용일', 'redemptionpricing'],
  redemptionPayout: ['환매지급일', '지급일', 'redemptionpayout'],
  derivatives: ['파생형', 'derivatives'],
  highComplexity: ['고난도', '고난도여부', 'highcomplexity'],
  docDate: ['설명서기준일', '기준일', 'docdate'],
};

const norm = (s) => String(s ?? '').replace(/\s|\(%\)|%/g, '').toLowerCase();

function headerKey(raw) {
  const n = norm(raw);
  for (const [key, names] of Object.entries(HEADERS)) {
    if (names.some((v) => norm(v) === n)) return key;
  }
  return null;
}

/** 따옴표와 줄바꿈을 포함한 CSV 를 읽는다 */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const s = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ''));
}

const num = (v) => {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const yes = (v) => /^(y|yes|1|true|o|예|해당|파생|고난도)$/i.test(String(v ?? '').trim());

const RISK_LABEL = { 1: '매우높은위험', 2: '높은위험', 3: '다소높은위험', 4: '보통위험', 5: '낮은위험', 6: '매우낮은위험' };

function toProduct(raw, rowNo, problems) {
  const name = String(raw.name ?? '').trim();
  if (!name) { problems.push(`${rowNo}행: 펀드명이 비어 있어 건너뜁니다.`); return null; }

  const regionRaw = String(raw.region ?? '').trim();
  let region = /해외|글로벌|overseas|global/i.test(regionRaw) ? 'overseas'
    : /국내|domestic/i.test(regionRaw) ? 'domestic' : null;
  if (!region) {
    region = /해외|글로벌|월드|아시아|미국|중국|유럽|신흥|글로벌|world|global/i.test(name) ? 'overseas' : 'domestic';
    problems.push(`${rowNo}행: 지역(국내/해외)이 없어 펀드명으로 "${region === 'overseas' ? '해외' : '국내'}"로 판단했습니다 — 확인 필요.`);
  }

  let riskGrade = num(raw.riskGrade);
  if (riskGrade !== null && !(riskGrade >= 1 && riskGrade <= 6)) {
    problems.push(`${rowNo}행: 위험등급 "${raw.riskGrade}" 는 1~6 범위가 아니라 비웠습니다.`);
    riskGrade = null;
  }

  const hedgeRaw = String(raw.hedge ?? '').trim();
  const hedge = /^(h|환헤지|환헤지형|헤지|hedged)$/i.test(hedgeRaw) ? 'H'
    : /^(uh|환노출|환노출형|언헤지|unhedged)$/i.test(hedgeRaw) ? 'UH' : null;

  const pctField = (key) => {
    const v = num(raw[key]);
    if (v === null) return null;
    if (v < 0 || v > 20) { problems.push(`${rowNo}행: ${key} 값 "${raw[key]}" 이 보수율 범위(0~20%)를 벗어나 비웠습니다.`); return null; }
    return v;
  };

  const text = (key) => {
    const v = String(raw[key] ?? '').trim();
    return v === '' ? null : v;
  };

  return {
    code: text('code') || '',
    name,
    manager: text('manager'),
    region,
    assetType: text('assetType'),
    riskGrade,
    riskLabel: text('riskLabel') || (riskGrade ? RISK_LABEL[riskGrade] : null),
    hedge,
    currency: region === 'overseas' ? null : 'KRW',
    invests: text('invests'),
    benchmark: text('benchmark'),
    feeFront: pctField('feeFront'),
    feeBack: pctField('feeBack'),
    totalExpense: pctField('totalExpense'),
    expenseBreakdown: null,
    otherCost: pctField('otherCost'),
    redemptionFee: text('redemptionFee'),
    redemptionPricing: text('redemptionPricing'),
    redemptionPayout: text('redemptionPayout'),
    derivatives: yes(raw.derivatives),
    highComplexity: yes(raw.highComplexity),
    docDate: text('docDate'),
    url: null,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const src = args.find((a) => !a.startsWith('--'));
  const outIdx = args.indexOf('--out');
  const out = outIdx >= 0 ? args[outIdx + 1] : 'data/funds.js';
  if (!src) {
    console.error('사용: node scripts/build_funds_data.mjs <funds.csv|funds.json> [--out data/funds.js]');
    process.exit(1);
  }

  const text = await readFile(src, 'utf8');
  let rows;
  if (src.toLowerCase().endsWith('.json')) {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) { console.error('JSON 은 객체 배열이어야 합니다.'); process.exit(1); }
    rows = arr.map((o) => {
      const mapped = {};
      for (const [k, v] of Object.entries(o)) {
        const key = headerKey(k);
        if (key) mapped[key] = v;
      }
      return mapped;
    });
  } else {
    const table = parseCsv(text);
    if (table.length < 2) { console.error('CSV 에 데이터 행이 없습니다.'); process.exit(1); }
    const keys = table[0].map(headerKey);
    const unknown = table[0].filter((h, i) => keys[i] === null && String(h).trim() !== '');
    if (unknown.length) console.warn(`[변환] 알아보지 못한 열은 무시합니다: ${unknown.join(', ')}`);
    if (!keys.includes('name')) { console.error('펀드명 열을 찾지 못했습니다.'); process.exit(1); }
    rows = table.slice(1).map((r) => {
      const o = {};
      keys.forEach((k, i) => { if (k) o[k] = r[i]; });
      return o;
    });
  }

  const problems = [];
  const products = rows.map((r, i) => toProduct(r, i + 2, problems)).filter(Boolean);
  if (!products.length) { console.error('변환된 상품이 하나도 없습니다.'); process.exit(1); }

  const data = {
    updatedAt: new Date().toISOString(),
    source: 'live',
    sourceNote: `사내 목록 파일(${src}) 변환 — ${products.length}건`,
    sourceNoteEn: `Converted from an internal list file (${src}) — ${products.length} product(s)`,
    products,
  };

  const body = `/**
 * 펀드 상품 데이터 (국내 / 해외)
 *
 * scripts/build_funds_data.mjs 가 ${src} 를 변환해 만든 파일이다. 직접 고치지 말고
 * 원본 목록 파일을 고친 뒤 다시 변환한다.
 *
 * 필드 정의는 README 의 "펀드 데이터 스키마" 절 참고.
 */
window.FUND_DATA = ${JSON.stringify(data, null, 2)};
`;

  await writeFile(out, body);
  console.log(`[변환] ${out} 생성 완료 — 상품 ${products.length}건`);
  const overseas = products.filter((p) => p.region === 'overseas').length;
  console.log(`[변환] 국내 ${products.length - overseas} · 해외 ${overseas}`);
  const noGrade = products.filter((p) => p.riskGrade === null).length;
  const noExpense = products.filter((p) => p.totalExpense === null).length;
  if (noGrade) console.log(`[변환] 위험등급 없음 ${noGrade}건 — 화면에서 "확인필요"로 표시됩니다.`);
  if (noExpense) console.log(`[변환] 총보수 없음 ${noExpense}건 — 화면에서 "확인필요"로 표시됩니다.`);
  if (problems.length) {
    console.log('[변환] 확인이 필요한 행:');
    for (const p of problems) console.log('  - ' + p);
  }
  console.log('[변환] 이어서: node scripts/build_explain_duty.mjs 로 오프라인 배포본을 다시 만드십시오.');
}

main();
