#!/usr/bin/env node
/**
 * 재검증 L3 — **원천 자체가 맞는가**. 1차 출처와 대조한다.
 *
 *   node scripts/reverify_fund_kofia.mjs
 *   -> tools/discovery/fund_reverify_kofia.{json,md}
 *
 * ── 왜 필요한가 ────────────────────────────────────────────────────────────
 *
 * 이 화면의 모든 숫자는 **네이버 Npay 증권** 한 곳에서 왔다. 네이버는 데이터
 * 벤더 페이지이므로 **2차 출처**다. L2(원천 재수집 대조)를 아무리 잘 돌려도
 * "내가 네이버를 정확히 옮겼다" 까지만 증명되고, "네이버가 맞다" 는 증명되지
 * 않는다. 네이버가 틀렸으면 나도 똑같이 틀린다.
 *
 * 국내 공모펀드의 **1차 출처**는 금융투자협회(KOFIA)다.
 *
 *   전자공시서비스   https://dis.kofia.or.kr
 *   펀드다모아       https://fundamoa.kofia.or.kr
 *
 * 여기서 몇 종목이라도 대조하면 계열 전체의 신뢰도가 달라진다. 못 붙으면
 * **못 붙었다고 적는다** — "확인했다" 로 넘기지 않는다.
 *
 * ── 대조할 것 ──────────────────────────────────────────────────────────────
 *
 * 1차 출처에서 확인 가능하고 화면에 실리는 것으로 고른다.
 *
 *   총보수    클래스별. 화면의 핵심 판단 재료다
 *   설정액·순자산
 *   기준가
 *   유형(분류)
 *
 * ── 앞선 세션의 기록 ───────────────────────────────────────────────────────
 *
 * ETF 작업에서 금투협을 여섯 차례 팠고 실패했다. 다만 그때는 **ETF 자료**를
 * 찾던 것이었고, "펀드 서비스가 없어졌다" 는 오판에서 출발한 헛수고였다
 * (tools/discovery/fund_probe7.md). 공모펀드 공시는 다른 화면이므로 다시 본다.
 * 이번에도 막히면 막힌 자리를 정확히 적어 사용자가 직접 확인할 수 있게 한다.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_reverify_kofia.json';
const OUT_MD = 'tools/discovery/fund_reverify_kofia.md';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = { at: new Date().toISOString(), attempts: [], errors: [] };
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[kofia] 중단:', e?.message || e);
  process.exit(1);
});

/** 무엇이 왔는지 그대로 적는다. 실패도 결과의 일부다. */
async function probe(label, url, opts = {}) {
  const row = { label, url, method: opts.method || 'GET' };
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: opts.method || 'GET',
      headers: {
        'User-Agent': UA,
        Accept: opts.accept || 'text/html,application/xhtml+xml,application/json,*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        ...(opts.headers || {}),
      },
      body: opts.body,
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    row.status = res.status;
    row.finalUrl = res.url;
    row.contentType = res.headers.get('content-type');
    const buf = Buffer.from(await res.arrayBuffer());
    row.bytes = buf.length;
    // 금투협은 EUC-KR 을 쓰는 화면이 있다. 둘 다 시도해 읽히는 쪽을 쓴다.
    let text = buf.toString('utf8');
    if (/�/.test(text.slice(0, 2000))) {
      try { text = new TextDecoder('euc-kr', { fatal: false }).decode(buf); row.encoding = 'euc-kr'; }
      catch { row.encoding = 'utf8(깨짐)'; }
    } else row.encoding = 'utf8';
    row.head = text.slice(0, 900);
    row.ok = res.ok;
  } catch (e) {
    row.ok = false;
    row.error = `${e.name}: ${e.message}`;
  }
  row.ms = Date.now() - t0;
  console.log(`  ${row.ok ? '✓' : '✗'} ${label.padEnd(40)} ${row.status ?? row.error} ${row.bytes ?? ''}`);
  out.attempts.push(row);
  await sleep(300);
  return row;
}

// ── 대조할 펀드를 고른다 ────────────────────────────────────────────────────
const src = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FUNDS = DATA.funds || [];
// 큰 펀드일수록 1차 출처에서 찾기 쉽고, 틀렸을 때 영향이 크다.
const targets = FUNDS
  .filter((f) => f.aum > 0 && f.feeMin != null && f.classes && f.classes.length)
  .sort((a, b) => b.aum - a.aum)
  .slice(0, 5)
  .map((f) => ({
    code: f.code, name: f.name, company: f.company, type: f.type,
    basePrice: f.basePrice, aum: f.aum, nav: f.nav,
    feeMin: f.feeMin, feeMax: f.feeMax,
    classSample: (f.classes || []).slice(0, 3).map((c) => ({ code: c.code, name: c.name, fee: c.totalFee })),
  }));
out.targets = targets;
console.log('=== 대조 대상 (설정액 상위 5) ===');
for (const t of targets) {
  console.log(`  ${t.code} ${t.name.slice(0, 30)} · 보수 ${t.feeMin}~${t.feeMax}% · 설정액 ${(t.aum / 1e8).toFixed(0)}억`);
}

// ── 1차 출처를 찌른다 ───────────────────────────────────────────────────────
console.log('\n=== 금융투자협회 (1차 출처) ===');
const one = targets[0];

await probe('전자공시 첫 화면', 'https://dis.kofia.or.kr/');
await probe('전자공시 펀드공시', 'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAnnPop.xml');
await probe('펀드다모아 첫 화면', 'https://fundamoa.kofia.or.kr/');
await probe('펀드다모아 검색(추정)',
  `https://fundamoa.kofia.or.kr/kor/fund/search.do?fundCd=${encodeURIComponent(one.code)}`);
await probe('금투협 본사이트', 'https://www.kofia.or.kr/');

// 전자공시의 조회 API 는 websquare 라 POST + XML 인 경우가 많다. 한 번 시도한다.
await probe('전자공시 조회 API(추정, POST)',
  'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/', {
    method: 'POST',
    accept: 'application/xml,text/xml,*/*',
    headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
    body: `<?xml version="1.0" encoding="UTF-8"?><message><proframeHeader>` +
          `<pfmAppName>FS-COM</pfmAppName><pfmSvcName>COMFundUnityInfoSO</pfmSvcName>` +
          `<pfmFnName>select</pfmFnName></proframeHeader><systemHeader></systemHeader>` +
          `<COMFundUnityInfoInputDTO><standardCd>${one.code}</standardCd></COMFundUnityInfoInputDTO></message>`,
  });

// 운용사 공시(1차)도 한 곳 본다.
console.log('\n=== 운용사 공시 (1차 출처) ===');
await probe('미래에셋자산운용', 'https://investments.miraeasset.com/');
await probe('삼성자산운용', 'https://www.samsungfund.com/');

// 다른 2차 출처로 교차확인이 되는지도 본다. 1차가 막히면 이쪽이 차선이다.
console.log('\n=== 다른 2차 출처 (교차확인용) ===');
await probe('네이버 펀드 화면(원천 자체)',
  `https://stock.naver.com/domestic/fund/${one.code}/total`);
await probe('FnGuide 펀드', 'https://www.fnguide.com/');
await probe('에프앤가이드 펀드닥터', 'http://www.funddoctor.co.kr/');

// ── 판정 ────────────────────────────────────────────────────────────────────
const reached = out.attempts.filter((a) => a.ok);
const blocked = out.attempts.filter((a) => !a.ok);
// 붙었다고 곧 대조가 된 것은 아니다. 표준코드로 조회한 값이 나와야 대조다.
const usable = out.attempts.filter((a) => a.ok && a.head &&
  (a.head.includes(one.code) || /총보수|보수율|설정액|순자산/.test(a.head)));

out.summary = {
  attempted: out.attempts.length,
  reached: reached.length,
  blocked: blocked.length,
  usableForComparison: usable.length,
  usableLabels: usable.map((a) => a.label),
};
console.log('\n=== 판정 ===');
console.log(`  찔러 본 곳 ${out.attempts.length} · 응답 ${reached.length} · 막힘 ${blocked.length}`);
console.log(`  실제로 대조에 쓸 수 있는 것 ${usable.length}` +
  (usable.length ? `: ${usable.map((a) => a.label).join(', ')}` : ''));

out.compared = usable.length > 0;
out.verdict = usable.length
  ? `1차 출처 대조 가능한 경로 ${usable.length}건`
  : '1차 출처에서 표준코드로 조회되는 경로를 찾지 못함 — 대조 실패';
console.log(`\n판정: ${out.verdict}`);
await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const md = ['# 재검증 L3 — 원천 자체가 맞는가 (1차 출처 대조)', '', `검증 시각: ${out.at}`, '',
  `**${out.verdict}**`, '',
  '이 화면의 모든 숫자는 **네이버 Npay 증권** 한 곳에서 왔습니다. 네이버는 데이터 벤더',
  '페이지이므로 **2차 출처**입니다. L2(원천 재수집 대조)는 "내가 네이버를 정확히 옮겼다"',
  '까지만 증명하고, **"네이버가 맞다" 는 증명하지 않습니다.**', '',
  '국내 공모펀드의 1차 출처는 금융투자협회(전자공시·펀드다모아)와 운용사 공시입니다.', '',
  '## 대조하려던 펀드 (설정액 상위 5)', '',
  '| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |', '|---|---|---|---:|---:|---:|'];
for (const t of targets) {
  md.push(`| ${t.code} | ${t.name.slice(0, 30)} | ${t.type} | ${t.basePrice} | ` +
    `${(t.aum / 1e8).toFixed(0)}억 | ${t.feeMin}~${t.feeMax}% |`);
}
md.push('', '## 접근 시도', '',
  '| 출처 | 등급 | 결과 | 크기 |', '|---|---|---|---:|');
const tierOf = (l) => /금투협|전자공시|펀드다모아|kofia|자산운용/i.test(l) ? '1차' : '2차';
for (const a of out.attempts) {
  md.push(`| ${a.label} | ${tierOf(a.label)} | ${a.ok ? `✓ ${a.status}` : `✗ ${a.status ?? a.error}`} | ${a.bytes ?? '–'} |`);
}
md.push('', '## 판정', '',
  `| 항목 | 수 |`, `|---|---:|`,
  `| 찔러 본 곳 | ${out.summary.attempted} |`,
  `| 응답이 온 곳 | ${out.summary.reached} |`,
  `| 막힌 곳 | ${out.summary.blocked} |`,
  `| **표준코드로 대조 가능한 곳** | **${out.summary.usableForComparison}** |`, '');
if (!out.compared) {
  md.push('### 대조하지 못했습니다', '',
    '1차 출처에서 표준코드로 조회되는 경로를 찾지 못했습니다. 금융투자협회 전자공시는',
    'WebSquare 기반이라 화면 주소만으로는 자료가 나오지 않고, 조회는 세션과 내부 서비스명을',
    '갖춘 POST 로 이뤄집니다. 이 환경에서 그 경로를 재현하지 못했습니다.', '',
    '**따라서 이 화면의 숫자는 2차 출처 단독 근거입니다.** 아래는 사용자가 직접 확인할 수',
    '있는 경로입니다.', '',
    '| 확인할 것 | 어디서 |', '|---|---|',
    '| 총보수 (클래스별) | 금융투자협회 전자공시 → 펀드공시 → 표준코드 조회 · 또는 각 펀드 투자설명서 |',
    '| 설정액·순자산 | 금융투자협회 펀드다모아 · 운용사 월간 운용보고서 |',
    '| 기준가 | 운용사 홈페이지 기준가 조회 |',
    '| 유형(분류) | 펀드다모아의 유형 분류와 대조 |', '',
    '표본 대조를 원하시면 위 표의 상위 5개 펀드를 짚어 확인해 주시면, 그 결과로 계열 전체의',
    '신뢰도를 판단할 수 있습니다.', '');
} else {
  md.push('### 대조 가능한 경로를 찾았습니다', '',
    usable.map((a) => `- ${a.label} — ${a.finalUrl}`).join('\n'), '',
    '다음 단계로 이 경로에서 값을 뽑아 네이버 값과 맞대야 합니다.', '');
}
if (out.errors.length) {
  md.push('## 오류', '');
  for (const e of out.errors.slice(0, 20)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[kofia] ${OUT_MD} · ${OUT_JSON} 기록`);
