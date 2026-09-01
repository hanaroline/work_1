#!/usr/bin/env node
/**
 * 펀드 투자설명서 수집기 (DART 공시)
 *
 * 펀드의 (간이)투자설명서는 자산운용사가 DART 에 「투자설명서」 로 공시한다.
 * ELS 수집기(scripts/fetch_prospectus.mjs)와 같은 경로·같은 방식을 쓴다.
 *   1) POST /dsab001/search.ax   제출인(자산운용사) + 기간으로 접수번호 목록
 *   2) GET  /dsaf001/main.do     접수번호 -> dcmNo
 *   3) GET  /report/viewer.do    문서 본문 -> 텍스트
 *   4) js/sales-script-prospectus.js 의 RULES.fund 로 항목 추출
 *   -> data/fund-prospectus.js
 *
 * ── 실행 ─────────────────────────────────────────────────────
 *   node scripts/fetch_fund_prospectus.mjs --probe
 *       접수번호·문서 크기·펀드명 후보만 출력하고 파일은 쓰지 않는다.
 *   node scripts/fetch_fund_prospectus.mjs --mgr "미래에셋자산운용" --limit 5
 *       특정 운용사 5건 수집
 *   node scripts/fetch_fund_prospectus.mjs
 *       MGRS 목록 전체 수집
 *
 * ── 검증 상태 ────────────────────────────────────────────────
 * ⚠ DART 접근 경로(search.ax -> main.do -> viewer.do)는 ELS 수집기에서 이미
 *   검증된 것과 동일하다. 다만 「펀드 투자설명서 본문의 텍스트 서식」은 확인하지
 *   못했다(개발 컨테이너 egress 차단). 따라서 항목 추출률은 실행해 봐야 안다.
 *   먼저 --probe 로 돌려 tools/discovery/fund_probe.json 의 본문 샘플을 보고
 *   js/sales-script-prospectus.js 의 RULES.fund 정규식을 조정하십시오.
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/141 Safari/537.36';
const DART = 'https://dart.fss.or.kr';
const OUT_DIR = 'tools/discovery';
const OUT = 'data/fund-prospectus.js';

/** 기본 수집 대상 운용사 — 필요에 맞게 늘리십시오 */
const MGRS = [
  '미래에셋자산운용', '삼성자산운용', 'KB자산운용', '한국투자신탁운용',
  '신영자산운용', '한국투자밸류자산운용', '흥국자산운용', '피델리티자산운용',
];

const args = process.argv.slice(2);
const PROBE = args.includes('--probe');
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LIMIT = Number(argOf('--limit', PROBE ? 3 : 0)) || 0;
const ONLY_MGR = argOf('--mgr', null);
const DAYS_BACK = Number(process.env.DART_DAYS_BACK || argOf('--days', 120));

/* ── 공통 유틸 (ELS 수집기와 동일) ───────────────────────────── */
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
const ymd = (d) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;

/** 앱과 같은 추출 규칙을 쓴다 */
async function loadExtractor() {
  const src = await readFile('js/sales-script-prospectus.js', 'utf8');
  const g = {};
  new Function('window', src)(g);
  if (!g.SS_PROS) throw new Error('추출 규칙(js/sales-script-prospectus.js)을 불러오지 못했습니다.');
  return g.SS_PROS;
}

/** 문서 본문에서 펀드 명칭들을 뽑는다 — 한 문서에 여러 펀드가 담기는 경우가 있다 */
function fundNames(text) {
  const re = /[가-힣A-Za-z0-9()\[\]·\-\s]{4,60}(?:증권\s*)?자?투자신탁\s*(?:제?\d+호)?\s*\([^)]{1,24}\)/g;
  return [...new Set((text.match(re) || []).map((s) => s.replace(/\s+/g, ' ').trim()))].slice(0, 40);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const PROS = await loadExtractor();

  const today = new Date();
  const since = new Date(today.getTime() - DAYS_BACK * 86400000);
  const mgrs = ONLY_MGR ? [ONLY_MGR] : MGRS;
  console.log(`펀드 투자설명서 수집 — 운용사 ${mgrs.length}곳 / ${ymd(since)}~${ymd(today)}${PROBE ? ' (probe)' : ''}`);

  const probe = { checkedAt: new Date().toISOString(), mgrs: [] };
  const items = {};

  for (const mgr of mgrs) {
    console.log(`\n## ${mgr}`);
    let filings = [];
    try {
      const search = await grab(`${DART}/dsab001/search.ax`, {
        body: `currentPage=1&maxResults=100&textCrpNm=${encodeURIComponent(mgr)}&startDate=${ymd(since)}&endDate=${ymd(today)}`,
        headers: { Referer: `${DART}/dsab001/main.do` },
      });
      for (const tr of search.text.split(/<tr[^>]*>/i).slice(1)) {
        const rcp = (tr.match(/rcpNo=(\d{14})/) || [])[1];
        if (!rcp) continue;
        const plain = toText(tr).replace(/\s+/g, ' ').trim();
        const date = (plain.match(/(\d{4}\.\d{2}\.\d{2})/) || [])[1];
        /* 「투자설명서」 / 「간이투자설명서」 만 고른다 */
        const name = (plain.match(/(간이투자설명서|투자설명서)/) || [])[1];
        if (name) filings.push({ rcpNo: rcp, date, name, row: plain.slice(0, 140) });
      }
      filings = [...new Map(filings.map((f) => [f.rcpNo, f])).values()]
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      console.log(`  공시 ${filings.length}건 (HTTP ${search.status})`);
    } catch (e) {
      console.log(`  검색 실패 — ${e.name} ${e.message}`);
      probe.mgrs.push({ mgr, error: e.message });
      continue;
    }

    const take = LIMIT ? filings.slice(0, LIMIT) : filings;
    const mgrProbe = { mgr, filings: filings.length, docs: [] };

    for (const f of take) {
      try {
        const main0 = await grab(`${DART}/dsaf001/main.do?rcpNo=${f.rcpNo}`);
        const dcm = (main0.text.match(/dcmNo["'\s:=]+(\d+)/) || main0.text.match(/viewDoc\(\s*'[^']*'\s*,\s*'(\d+)'/) || [])[1];
        if (!dcm) { console.log(`  ${f.rcpNo}: dcmNo 없음`); continue; }
        const doc = await grab(`${DART}/report/viewer.do?rcpNo=${f.rcpNo}&dcmNo=${dcm}&eleId=0&offset=0&length=0&dtd=dart3.xsd`);
        const text = toText(doc.text);
        const names = fundNames(text);
        const fields = {};
        PROS.extract(text, 'fund').forEach((x) => { fields[x.id] = x.value; });

        console.log(`  ${f.date} ${f.rcpNo} ${(doc.buf.length / 1024).toFixed(0)}KB · 펀드명 후보 ${names.length}건 · 항목 ${Object.keys(fields).length}건`);
        mgrProbe.docs.push({
          rcpNo: f.rcpNo, date: f.date, name: f.name, dcmNo: dcm,
          chars: text.length, names: names.slice(0, 10),
          fields, head: text.slice(0, 1200),
        });

        if (!PROBE) {
          /* 문서 원문을 남겨 두면 규칙을 고친 뒤 재파싱만 하면 된다 */
          await writeFile(`${OUT_DIR}/fund_prospectus_${f.rcpNo}.txt`, text);
          /* 명칭이 잡히면 명칭 키로, 아니면 접수번호 키로 담는다 */
          const key = fields.name || names[0] || f.rcpNo;
          items[key] = {
            key, mgr, rcpNo: f.rcpNo, docDate: f.date,
            docUrl: `${DART}/dsaf001/main.do?rcpNo=${f.rcpNo}`,
            collectedAt: new Date().toISOString(),
            names, fields,
          };
        }
      } catch (e) {
        console.log(`  ${f.rcpNo}: 실패 — ${e.name} ${e.message}`);
      }
    }
    probe.mgrs.push(mgrProbe);
  }

  await writeFile(`${OUT_DIR}/fund_probe.json`, JSON.stringify(probe, null, 2));
  console.log(`\n${OUT_DIR}/fund_probe.json 기록 — 본문 서식·추출률 확인용`);
  if (PROBE) return;

  const body =
    '/**\n' +
    ' * 펀드 투자설명서 — DART 공시에서 수집·파싱한 결과\n' +
    ' *\n' +
    ' * 생성 : scripts/fetch_fund_prospectus.mjs\n' +
    ' * FUND_PROSPECTUS.items[펀드명] = { fields, docUrl, mgr, docDate, ... }\n' +
    ' *\n' +
    ' * sales-script.html 이 펀드 선택 시 명칭으로 찾아 등록된 투자설명서로 적용한다.\n' +
    ' * 원문에 없는 값은 담지 않으므로 화면에서 「확인필요」로 남는다.\n' +
    ' */\n' +
    'window.FUND_PROSPECTUS = ' +
    JSON.stringify({ updatedAt: new Date().toISOString(), source: 'DART 투자설명서 공시', count: Object.keys(items).length, items }, null, 1) +
    ';\n';
  await writeFile(OUT, body);
  console.log(`${OUT} 기록 — ${Object.keys(items).length}건`);
}

main().catch((e) => { console.error(e); process.exit(1); });
