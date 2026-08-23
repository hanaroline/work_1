#!/usr/bin/env node
/**
 * 마지막 판매 주간 회차를 찾고, 그 회차의 공시 원문(일괄신고추가서류)을 받아
 * 조건·수익률 모의실험·이론가 변수를 tools/discovery/ 에 남긴다.
 *
 * 두 단계로 나뉜다.
 *  1) 미래에셋 목록 API 를 진행상태 코드별로 두드려 "지금 청약중" 말고 "직전에 팔린" 회차까지 본다.
 *     (기본 수집기는 prgs_scd=01 = 청약중만 가져오므로 청약이 없는 주에는 빈손이다.)
 *  2) DART 공시검색에서 미래에셋증권 일괄신고추가서류 접수번호를 긁고, 뷰어 문서를 받아
 *     회차 번호가 맞는 문서를 골라 표를 뜬다.
 *
 * 개발 컨테이너에서는 세 사이트 모두 egress 차단이라 러너에서만 돈다.
 */
import { writeFile, mkdir } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/141 Safari/537.36';
const OUT = 'tools/discovery';
const MAS = 'https://securities.miraeasset.com';
const DART = 'https://dart.fss.or.kr';

await mkdir(OUT, { recursive: true });

const decode = (buf) => {
  const probe = buf.subarray(0, 3000).toString('latin1').toLowerCase();
  return new TextDecoder(/euc-kr|ks_c_5601/.test(probe) ? 'euc-kr' : 'utf-8').decode(buf);
};

const toText = (html) => html
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<\/tr>/gi, '\n').replace(/<\/(p|div|h\d|table)>/gi, '\n\n')
  .replace(/<t[dh][^>]*>/gi, '\t')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[ \t]*\n/g, '\n').replace(/\n{3,}/g, '\n\n');

const grab = async (url, opts = {}) => {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, ...(opts.body ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : {}), ...(opts.headers || {}) },
    method: opts.body ? 'POST' : 'GET',
    body: opts.body,
    signal: AbortSignal.timeout(90000),
  });
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: r.status, buf, text: decode(buf) };
};

// ── 1. 미래에셋 목록 — 진행상태별로 훑어 마지막 판매 주간을 찾는다 ────────────
console.log('## 1. 미래에셋 상품 목록 (진행상태 코드별)');
const listing = {};
for (const code of ['01', '02', '03', '04', '00', '']) {
  try {
    const body = `omkt_drvs_tcd=0&dlbr_term_yn=0&itm_nm=&prgs_scd=${code}&qry_sort_tp=0&qry_sort_sqn=0&next_key=`;
    const { status, text } = await grab(`${MAS}/hks/hks4022/a01.json`, { body, headers: { Referer: `${MAS}/hks/hks4022/n01.do` } });
    let rows = [];
    try { rows = JSON.parse(text).grid01 || []; } catch { /* JSON 아님 */ }
    const periods = {};
    for (const r of rows) {
      const k = `${r.apy_strt_dt || '?'}~${r.apy_end_dt || '?'}`;
      (periods[k] = periods[k] || []).push(r.itm_nm);
    }
    listing[code] = {
      status, count: rows.length,
      periods: Object.fromEntries(Object.entries(periods).map(([k, v]) => [k, v.length])),
      sample: rows.slice(0, 3).map((r) => ({ nm: r.itm_nm, stat: r.prgs_stat_nm, from: r.apy_strt_dt, to: r.apy_end_dt })),
    };
    console.log(`  prgs_scd=${code || '(빈값)'}: HTTP ${status}, ${rows.length}건`,
      rows.length ? JSON.stringify(listing[code].periods) : '');
  } catch (e) {
    console.log(`  prgs_scd=${code || '(빈값)'}: 실패 ${e.name} ${e.message}`);
  }
}
await writeFile(`${OUT}/offer_states.json`, JSON.stringify(listing, null, 2));

// ── 2. DART 공시검색 → 접수번호 ─────────────────────────────────────────────
// 검색 구간은 실행일 기준으로 굴린다. 날짜를 박아두면 그 주에만 맞고 다음 주부터는
// 빈손으로 끝나는데, 잡은 초록이라 조용히 낡는다.
const ymd = (d) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
const DAYS_BACK = Number(process.env.DART_DAYS_BACK || 45);
const today = new Date();
const since = new Date(today.getTime() - DAYS_BACK * 86400000);
console.log(`\n## 2. DART 일괄신고추가서류 접수번호 (${ymd(since)}~${ymd(today)})`);
const search = await grab(`${DART}/dsab001/search.ax`, {
  body: `currentPage=1&maxResults=100&textCrpNm=미래에셋증권&startDate=${ymd(since)}&endDate=${ymd(today)}`,
  headers: { Referer: `${DART}/dsab001/main.do` },
});
const filings = [];
for (const tr of search.text.split(/<tr[^>]*>/i).slice(1)) {
  const rcp = (tr.match(/rcpNo=(\d{14})/) || [])[1];
  if (!rcp) continue;
  const plain = toText(tr).replace(/\s+/g, ' ').trim();
  const date = (plain.match(/(\d{4}\.\d{2}\.\d{2})/) || [])[1];
  const name = (plain.match(/(일괄신고추가서류|투자설명서[^\s]*|증권신고서[^\s]*)/) || [])[1];
  if (name) filings.push({ rcpNo: rcp, date, name, row: plain.slice(0, 120) });
}
const uniq = [...new Map(filings.map((f) => [f.rcpNo, f])).values()]
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
console.log(`  ${uniq.length}건`);
uniq.slice(0, 20).forEach((f) => console.log(`  ${f.date} ${f.rcpNo} ${f.name}`));
await writeFile(`${OUT}/dart_filings.json`, JSON.stringify(uniq, null, 2));

// ── 3. 문서 본문 받아 회차 확인 ─────────────────────────────────────────────
console.log('\n## 3. 문서 본문');
const wanted = uniq.filter((f) => f.name === '일괄신고추가서류');
const docs = [];
for (const f of wanted) {
  try {
    const main = await grab(`${DART}/dsaf001/main.do?rcpNo=${f.rcpNo}`);
    // 뷰어 파라미터는 main.do 안의 스크립트에 들어 있다
    const dcm = (main.text.match(/dcmNo["'\s:=]+(\d+)/) || main.text.match(/viewDoc\(\s*'[^']*'\s*,\s*'(\d+)'/) || [])[1];
    if (!dcm) { console.log(`  ${f.rcpNo}: dcmNo 없음 (main.do ${main.buf.length}B)`); continue; }
    const doc = await grab(`${DART}/report/viewer.do?rcpNo=${f.rcpNo}&dcmNo=${dcm}&eleId=0&offset=0&length=0&dtd=dart3.xsd`);
    const text = toText(doc.text);
    const series = [...new Set(text.match(/제\s?\d{4,5}\s?회/g) || [])];
    const nums = series.map((s) => Number(s.replace(/\D/g, ''))).filter((n) => n > 30000);
    const range = nums.length ? `${Math.min(...nums)}~${Math.max(...nums)}` : '–';
    console.log(`  ${f.date} ${f.rcpNo} dcm=${dcm} ${(doc.buf.length / 1024 / 1024).toFixed(2)}MB 회차 ${series.length}종 (${range})`);
    docs.push({ ...f, dcmNo: dcm, chars: text.length, series, range });
    // 회차 번호대를 박아두면 번호가 굴러간 다음 달부터 아무것도 안 남는다.
    // 여러 회차를 한 번에 담은 문서(=주간 발행분)이면 표를 떠 둔다.
    if (nums.length >= 5) {
      // 회차별 조건·모의실험을 로컬에서 파싱할 수 있게 본문 전체를 남긴다
      await writeFile(`${OUT}/prospectus_${f.rcpNo}.txt`, text);
      const slices = (needle, before, after, max) => {
        const found = []; let from = 0;
        while (found.length < max) {
          const i = text.indexOf(needle, from);
          if (i < 0) break;
          found.push(text.slice(Math.max(0, i - before), i + after));
          from = i + after;
        }
        return found;
      };
      await writeFile(`${OUT}/prospectus_${f.rcpNo}.json`, JSON.stringify({
        rcpNo: f.rcpNo, date: f.date, source: `${DART}/dsaf001/main.do?rcpNo=${f.rcpNo}`,
        fetchedAt: new Date().toISOString(), chars: text.length, series,
        simulation: slices('모의실험', 500, 3200, 25),
        volatility: slices('변동성', 400, 2000, 6),
        correlation: slices('상관계수', 400, 2000, 6),
        fairValue: slices('공정가액', 400, 1500, 6),
        terms: slices('자동조기상환 발생조건', 600, 2500, 25),
        offer: slices('청약기간', 300, 900, 4),
        maxLoss: slices('최대손실액', 300, 2200, 25),
      }, null, 2));
      console.log(`    -> prospectus_${f.rcpNo}.json 저장`);
    }
  } catch (e) {
    console.log(`  ${f.rcpNo}: 실패 ${e.name} ${e.message}`);
  }
}
await writeFile(`${OUT}/dart_docs.json`, JSON.stringify(docs, null, 2));
console.log(`\n완료 — 문서 ${docs.length}건 확인`);
