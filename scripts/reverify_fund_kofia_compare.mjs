#!/usr/bin/env node
/**
 * 재검증 L3 (본 대조) — 1차 출처(금융투자협회)와 값을 맞댄다.
 *
 *   node scripts/reverify_fund_kofia_compare.mjs [표본수]
 *   -> tools/discovery/fund_reverify_kofia_compare.{json,md}
 *
 * ── 경로를 찾았다 ──────────────────────────────────────────────────────────
 *
 * 브라우저로 열어 보니 금투협 전자공시의 펀드요약 팝업이 **표준코드로 바로**
 * 열린다.
 *
 *   https://dis.kofia.or.kr/websquare/index.jsp
 *     ?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml&standardCd={표준코드}
 *
 * 여기서 기준가·펀드유형·투자지역·총보수·설정원본·순자산총액·설정일·운용사가
 * 한 화면에 나온다. 이게 **1차 출처**다. 네이버는 2차다.
 *
 * ── 무엇을 대조하고 무엇을 대조하지 못하나 ──────────────────────────────────
 *
 * 대조 가능: 기준가 · 펀드유형 · 투자지역 · 설정원본 · 순자산총액 · 설정일 · 운용사
 * 대조 불가: 기간수익률 · 보유종목 · 위험지표 — 이 화면에 없다
 *
 * ── 기준일이 다르면 값도 다르다 ─────────────────────────────────────────────
 *
 * 금투협은 오늘 기준(어제 종가), 네이버는 그보다 하루 이를 수 있다. 기준일이
 * 다른 두 값을 "틀렸다" 고 말하면 안 된다. 그래서 **양쪽의 기준일을 함께
 * 뽑아** 같은 날인지부터 보고, 다르면 그렇게 적는다.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_reverify_kofia_compare.json';
const OUT_MD = 'tools/discovery/fund_reverify_kofia_compare.md';
const N = Number(process.argv[2]) || 12;

const out = { at: new Date().toISOString(), rows: [], errors: [] };
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[kofia-cmp] 중단:', e?.message || e);
  process.exit(1);
});

const src = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FUNDS = DATA.funds || [];
out.dataUpdatedAt = DATA.updatedAt;

// 유형이 골고루 섞이게 고른다. 한 유형만 보면 그 유형의 함정만 보게 된다.
const byType = new Map();
for (const f of FUNDS) {
  if (!(f.aum > 0)) continue;
  const k = f.type || '(미상)';
  if (!byType.has(k)) byType.set(k, []);
  byType.get(k).push(f);
}
const targets = [];
for (const [, list] of byType) {
  list.sort((a, b) => Number(b.aum) - Number(a.aum));
  targets.push(list[0]);                       // 유형마다 가장 큰 것 하나
}
targets.sort((a, b) => Number(b.aum) - Number(a.aum));
const pick = targets.slice(0, N);
console.log(`=== 대조 대상 ${pick.length}개 (유형별 최대 규모) ===`);

/** 금투협 화면 글자에서 값을 뽑는다. */
function parseKofia(text) {
  const t = String(text || '').replace(/\r/g, '');
  const grab = (label, re) => {
    // "레이블\n\n\t\n\n값" 꼴이라 레이블 뒤 200자 안에서 첫 값을 잡는다.
    const i = t.indexOf(label);
    if (i < 0) return null;
    const seg = t.slice(i + label.length, i + label.length + 220);
    const m = seg.match(re);
    return m ? m[1].trim() : null;
  };
  const num = (s) => {
    if (s == null) return null;
    const v = Number(String(s).replace(/,/g, ''));
    return Number.isFinite(v) ? v : null;
  };
  // 기준가와 기준일
  const bp = t.match(/기준가\s*\n+\s*([\d,]+\.?\d*)/);
  const bd = t.match(/\[기준일:\s*(\d{4})\/(\d{2})\/(\d{2})\]/);
  return {
    basePrice: bp ? num(bp[1]) : null,
    baseDate: bd ? `${bd[1]}-${bd[2]}-${bd[3]}` : null,
    fundType: grab('펀드유형', /([가-힣A-Za-z()·\s]+?)\s*\n/),
    region: grab('투자지역', /([가-힣]+)\s*\n/),
    totalFee: num(grab('총보수', /([\d,]+\.?\d*)/)),
    inception: grab('최초설정일', /(\d{4}\/\d{2}\/\d{2})/),
    // [단위:백만원]
    principalMn: num(grab('설정원본', /([\d,]+)/)),
    netAssetMn: num(grab('순자산총액', /([\d,]+)/)),
    manager: grab('운용회사', /\s*([가-힣A-Za-z0-9()\s]+?)\s*\n/),
    feeSum: num(grab('보수합계', /([\d,]+\.?\d*)/)),
    ter: num(grab('총비용비율(TER)', /([\d,]+\.?\d*)/)),
  };
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  locale: 'ko-KR',
});

for (const f of pick) {
  const row = { code: f.code, name: f.name, type: f.type, mine: {
    basePrice: f.basePrice, baseDate: f.tradeDate, region: f.region,
    aum: f.aum, nav: f.nav, inception: f.inceptionDate, company: f.company,
    feeMin: f.feeMin, feeMax: f.feeMax, classCount: f.classCount,
  } };
  const page = await ctx.newPage();
  try {
    await page.goto(
      'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml' +
      `&companyCd=&standardCd=${encodeURIComponent(f.code)}&standardDt=&grntGb=`,
      { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4500);
    const text = await page.evaluate(() => document.body?.innerText || '');
    row.found = text.includes(f.code);
    row.kofiaText = text.slice(0, 2500);
    row.kofia = parseKofia(text);
  } catch (e) {
    row.error = `${e.name}: ${e.message}`.slice(0, 160);
  }
  await page.close();

  // ── 대조 ────────────────────────────────────────────────────────────────
  const k = row.kofia || {};
  row.cmp = {};
  const put = (field, mine, theirs, ok, note) =>
    (row.cmp[field] = { mine, theirs, ok, note });

  if (row.found) {
    // 기준가 — 기준일이 같아야 견줄 수 있다
    const sameDay = k.baseDate && row.mine.baseDate && k.baseDate === row.mine.baseDate;
    put('기준가', row.mine.basePrice, k.basePrice,
        sameDay ? (k.basePrice != null && Math.abs(k.basePrice - row.mine.basePrice) < 0.02) : null,
        sameDay ? null : `기준일 다름 (금투협 ${k.baseDate} vs 내 자료 ${row.mine.baseDate})`);

    // 설정원본·순자산 — 금투협은 백만원 단위
    const princWon = k.principalMn == null ? null : k.principalMn * 1e6;
    const netWon = k.netAssetMn == null ? null : k.netAssetMn * 1e6;
    const relP = (princWon && row.mine.aum) ? Math.abs(princWon - row.mine.aum) / princWon : null;
    const relN = (netWon && row.mine.nav) ? Math.abs(netWon - row.mine.nav) / netWon : null;
    put('설정원본', row.mine.aum, princWon, relP == null ? null : relP < 0.03,
        relP == null ? null : `상대차 ${(relP * 100).toFixed(2)}%` + (sameDay ? '' : ' · 기준일 다름'));
    put('순자산', row.mine.nav, netWon, relN == null ? null : relN < 0.03,
        relN == null ? null : `상대차 ${(relN * 100).toFixed(2)}%` + (sameDay ? '' : ' · 기준일 다름'));

    // 설정일
    const kInc = k.inception ? k.inception.replace(/\//g, '-') : null;
    put('설정일', row.mine.inception, kInc,
        kInc && row.mine.inception ? kInc === row.mine.inception : null);

    // 투자지역 — 여기서 갈린다. 금투협은 명시하고 네이버 유형명에는 없다.
    const mineR = row.mine.region === 'domestic' ? '국내'
                : row.mine.region === 'overseas' ? '해외' : null;
    put('투자지역', mineR, k.region,
        (mineR && k.region) ? mineR === k.region : null,
        mineR == null && k.region ? '내 자료는 "미상" — 유형명에 지역이 없어 지어내지 않았다' : null);

    // 총보수 — 금투협의 펀드 단위 총보수는 종류형에서 0 이다(보수는 클래스가 진다)
    put('총보수(펀드단위)', null, k.totalFee, null,
        '펀드 단위 보수는 종류형에서 0 이다. 실제 보수는 클래스가 진다 — ' +
        `내 자료의 클래스 범위 ${row.mine.feeMin}~${row.mine.feeMax}% (클래스 ${row.mine.classCount}개)`);
    if (k.ter != null) put('TER(참고)', null, k.ter, null, '금투협 총비용비율. 내 자료에는 없는 항목');
  }

  out.rows.push(row);
  const c = row.cmp || {};
  const okN = Object.values(c).filter((x) => x.ok === true).length;
  const badN = Object.values(c).filter((x) => x.ok === false).length;
  console.log(`  ${row.found ? '✓' : '✗'} ${f.code} ${(f.name || '').slice(0, 26).padEnd(28)} ` +
    `일치 ${okN} · 불일치 ${badN}` + (row.error ? ` · ${row.error}` : ''));
  await save();
}

await ctx.close();
await browser.close();

// ── 집계 ────────────────────────────────────────────────────────────────────
const found = out.rows.filter((r) => r.found);
const tally = {};
for (const r of found) {
  for (const [field, v] of Object.entries(r.cmp || {})) {
    tally[field] = tally[field] || { same: 0, diff: 0, na: 0 };
    if (v.ok === true) tally[field].same += 1;
    else if (v.ok === false) tally[field].diff += 1;
    else tally[field].na += 1;
  }
}
out.tally = tally;
out.summary = { targets: pick.length, found: found.length };

console.log(`\n=== 1차 출처에서 찾은 펀드 ${found.length}/${pick.length} ===`);
console.log('항목별 (일치 / 불일치 / 판정보류)');
for (const [k, v] of Object.entries(tally)) {
  console.log(`  ${k.padEnd(16)} ${String(v.same).padStart(3)} / ${String(v.diff).padStart(3)} / ${String(v.na).padStart(3)}`);
}
const diffs = [];
for (const r of found) {
  for (const [field, v] of Object.entries(r.cmp || {})) {
    if (v.ok === false) diffs.push({ code: r.code, name: r.name, field, ...v });
  }
}
out.diffs = diffs;
if (diffs.length) {
  console.log('\n=== 불일치 ===');
  for (const d of diffs) console.log(`  ${d.code} ${d.field}: 내 자료 ${d.mine} vs 금투협 ${d.theirs} ${d.note ?? ''}`);
}

out.verdict = found.length === 0
  ? '1차 출처에서 대조 대상을 찾지 못함'
  : `1차 출처 ${found.length}개 대조 · 불일치 ${diffs.length}건`;
console.log(`\n판정: ${out.verdict}`);
await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const fmtWon = (v) => v == null ? '–' : (v >= 1e12 ? `${(v / 1e12).toFixed(3)}조` : `${Math.round(v / 1e8).toLocaleString()}억`);
const md = ['# 재검증 L3 (본 대조) — 1차 출처와 값을 맞댄다', '', `검증 시각: ${out.at}`,
  `내 자료 기준: ${out.dataUpdatedAt}`, '', `**${out.verdict}**`, '',
  '금융투자협회 전자공시의 펀드요약 팝업이 **표준코드로 바로** 열립니다.', '',
  '```',
  'https://dis.kofia.or.kr/websquare/index.jsp',
  '  ?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml&standardCd={표준코드}',
  '```', '',
  '여기서 기준가·펀드유형·투자지역·총보수·설정원본·순자산총액·설정일·운용사가 나옵니다.',
  '**이것이 1차 출처입니다.** 네이버 Npay 증권은 2차입니다.', '',
  '## 대조 결과', '',
  '| 표준코드 | 펀드 | 유형 | 항목 | 내 자료 | 금투협 | |',
  '|---|---|---|---|---:|---:|:-:|'];
for (const r of found) {
  for (const [field, v] of Object.entries(r.cmp || {})) {
    const fmt = (x) => (field.includes('설정원본') || field.includes('순자산')) ? fmtWon(x)
      : (x == null ? '–' : String(x));
    md.push(`| ${r.code} | ${(r.name || '').slice(0, 22)} | ${r.type} | ${field} | ` +
      `${fmt(v.mine)} | ${fmt(v.theirs)} | ${v.ok === true ? '○' : v.ok === false ? '✗' : '–'} |`);
  }
}
md.push('', '## 항목별', '', '| 항목 | 일치 | 불일치 | 판정보류 |', '|---|---:|---:|---:|');
for (const [k, v] of Object.entries(tally)) md.push(`| ${k} | ${v.same} | ${v.diff} | ${v.na} |`);
md.push('');
if (diffs.length) {
  md.push('## 불일치', '', '| 표준코드 | 항목 | 내 자료 | 금투협 | 비고 |', '|---|---|---:|---:|---|');
  for (const d of diffs) {
    md.push(`| ${d.code} | ${d.field} | ${d.mine ?? '–'} | ${d.theirs ?? '–'} | ${d.note ?? ''} |`);
  }
  md.push('');
}
md.push('## 이 대조가 닿지 못하는 것', '',
  '금투협 펀드요약 화면에 **없는** 항목은 여기서 대조되지 않습니다.', '',
  '| 항목 | 대조 |', '|---|---|',
  '| 기간수익률 | ✗ 이 화면에 없음 — 2차 출처(네이버) 단독 |',
  '| 보유종목·비중 | ✗ 이 화면에 없음 — 2차 출처 단독. 운용보고서(분기)에 있음 |',
  '| 위험지표(샤프·베타 등) | ✗ 이 화면에 없음 — 2차 출처 단독 |',
  '| 클래스별 총보수 | △ 펀드 단위 보수만 보임(종류형은 0). 클래스별은 투자설명서 |', '');
if (out.errors.length) {
  md.push('## 오류', '');
  for (const e of out.errors.slice(0, 20)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[kofia-cmp] ${OUT_MD} · ${OUT_JSON} 기록`);
