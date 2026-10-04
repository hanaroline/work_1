#!/usr/bin/env node
/**
 * 펀드 원천 탐색 — 편입종목 상위 10개를 주는 곳이 있는가.
 *
 *   node scripts/probe_fund_sources.mjs
 *   -> tools/discovery/fund_probe.{json,md}
 *
 * ETF 화면이 가능했던 이유는 네이버 etfAnalysis 하나가 편입종목·운용사·
 * 기초지수·총보수·순자산·수익률을 통째로 줬기 때문이다. 펀드에도 그런 자리가
 * 있는지는 아직 모른다. **없으면 화면의 본체가 없는 것**이므로, 만들기 전에
 * 여기서 먼저 가른다.
 *
 * 확인할 것은 셋이다.
 *
 *   1. 펀드 목록을 어디서 받나 (코드·이름·운용사·유형)
 *   2. 그 코드로 **보유종목 상위 10** 을 받을 수 있나  ← 이게 핵심이다
 *   3. 기간수익률·설정액·보수를 같이 주나
 *
 * 후보는 넓게 잡는다. 국내 공모펀드는 금투협(펀드다모아·전자공시)이 원천이고,
 * 네이버·에프앤가이드·제로인이 그것을 받아 화면으로 만든다. 운용사 사이트도
 * 자사 펀드는 확실히 갖고 있다. 해외 뮤추얼펀드는 야후가 topHoldings 를 준다.
 *
 * 세션은 이 호스트들에 직접 못 붙는다(이그레스 정책). 러너에서 돈다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_probe.json';
const OUT_MD = 'tools/discovery/fund_probe.md';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const TIMEOUT = 15000;

const results = [];

/** 한 곳을 찔러 보고 결과를 남긴다. 실패도 결과다. */
async function probe(group, name, url, opts = {}) {
  const row = { group, name, url, method: opts.method || 'GET' };
  try {
    const res = await fetch(url, {
      method: opts.method || 'GET',
      headers: { 'User-Agent': UA, Accept: '*/*', ...(opts.headers || {}) },
      body: opts.body,
      signal: AbortSignal.timeout(TIMEOUT),
    });
    row.status = res.status;
    row.type = (res.headers.get('content-type') || '').split(';')[0];
    const buf = Buffer.from(await res.arrayBuffer());
    row.bytes = buf.length;
    // 한글이 EUC-KR 로 오는 곳이 많다. 둘 다 떠 보고 한글이 살아 있는 쪽을 쓴다.
    const utf8 = buf.toString('utf8');
    const euckr = new TextDecoder('euc-kr', { fatal: false }).decode(buf);
    const koScore = (s) => (s.match(/[가-힣]/g) || []).length;
    const text = koScore(euckr) > koScore(utf8) ? euckr : utf8;
    row.encoding = koScore(euckr) > koScore(utf8) ? 'euc-kr' : 'utf-8';
    row.sample = text.slice(0, opts.sample || 600);

    // 이 응답에 우리가 찾는 것이 들어 있는지 표를 붙인다.
    row.hasJson = /^\s*[{[]/.test(text);
    row.looksFrame = /<frame|<frameset/i.test(text) && buf.length < 8000;
    row.mentions = {
      보유종목: /보유종목|주식보유|자산구성|포트폴리오|holding/i.test(text),
      수익률: /수익률|returnRate|yield/i.test(text),
      설정액: /설정액|순자산|운용규모|netAsset/i.test(text),
      보수: /보수|수수료|TER|expense/i.test(text),
      펀드코드: /fundCd|fund_cd|펀드코드|standardCode/i.test(text),
    };
    if (opts.keep) row.body = text.slice(0, 40000);
  } catch (e) {
    row.error = String(e.message || e).slice(0, 120);
  }
  const mark = row.error ? '✗' : (row.status < 400 ? '✓' : '△');
  console.log(`${mark} [${group}] ${name} — ${row.error || row.status + ' ' + (row.bytes || 0) + 'B ' + (row.encoding || '')}`);
  results.push(row);
  return row;
}

// 표본 펀드. 미래에셋 대표 펀드 몇 개를 이름으로 검색해 찾는다.
const SAMPLE_NAMES = ['미래에셋', '글로벌', 'TDF'];

console.log('\n=== 1. 네이버 금융 펀드 ===');
// 네이버 펀드 화면이 아직 살아 있는지, 살아 있다면 어떤 API 를 쓰는지.
await probe('naver', '펀드 메인', 'https://finance.naver.com/fund/', {}, {});
await probe('naver', '펀드 검색 화면',
  'https://finance.naver.com/fund/fundFinder.naver');
await probe('naver', '펀드 목록 API 후보',
  'https://finance.naver.com/api/fund/fundList.nhn');
await probe('naver', '모바일 펀드 홈',
  'https://m.stock.naver.com/fund');
await probe('naver', '모바일 펀드 API 후보',
  'https://m.stock.naver.com/api/fund/ranking');

console.log('\n=== 2. 금융투자협회 (펀드다모아 · 전자공시) ===');
await probe('kofia', '펀드다모아', 'https://fundamoa.kofia.or.kr/');
await probe('kofia', '전자공시 dis', 'https://dis.kofia.or.kr/');
await probe('kofia', '펀드다모아 검색 API 후보',
  'https://fundamoa.kofia.or.kr/fundamoa/websquare/websquare.html?w2xPath=/fundamoa/ui/main.xml');
// 금투협은 WebSquare 라 .wjson POST 로 오간다. ELS 수집기가 같은 구조를 다뤘다.
await probe('kofia', 'dis .wjson 후보',
  'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: '<?xml version="1.0" encoding="utf-8"?><message><proframeHeader>' +
          '<pfmAppName>FS-COM</pfmAppName><pfmSvcName>COMFundUnityInfoSO</pfmSvcName>' +
          '<pfmFnName>select</pfmFnName></proframeHeader><systemHeader></systemHeader>' +
          '<COMFundUnityInfoInputDTO></COMFundUnityInfoInputDTO></message>',
  });

console.log('\n=== 3. 제로인 · 에프앤가이드 ===');
await probe('vendor', '펀드닥터(제로인)', 'https://www.funddoctor.co.kr/');
await probe('vendor', '에프앤가이드 펀드', 'https://www.fnguide.com/fgdd/');
await probe('vendor', '한국포스증권(펀드슈퍼마켓)', 'https://www.fosskorea.com/');

console.log('\n=== 4. 운용사 (자사 펀드는 반드시 갖고 있다) ===');
await probe('amc', '미래에셋자산운용', 'https://investments.miraeasset.com/');
await probe('amc', '미래에셋 펀드 목록 후보',
  'https://investments.miraeasset.com/fund/fund_list.do');
await probe('amc', '삼성자산운용', 'https://www.samsungfund.com/');
await probe('amc', 'KB자산운용', 'https://www.kbam.co.kr/');

console.log('\n=== 5. 공공데이터 · 기타 ===');
await probe('open', '공공데이터포털 금투협 펀드',
  'https://api.odcloud.kr/api/GetFundInfoService/v1/getFundList?page=1&perPage=5');
await probe('open', '금감원 오픈API', 'https://opendart.fss.or.kr/');

console.log('\n=== 6. 야후 — 해외 뮤추얼펀드 ===');
// 해외 펀드가 "미국 뮤추얼펀드" 를 뜻한다면 야후가 ETF 와 같은 자리를 준다.
// 크럼이 필요하므로 쿠키부터 받는다.
let cookie = '';
let crumb = '';
try {
  const res = await fetch('https://fc.yahoo.com/', {
    headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(TIMEOUT),
  });
  cookie = (res?.headers?.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
  const cr = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie }, signal: AbortSignal.timeout(TIMEOUT),
  });
  crumb = (await cr.text()).trim();
  console.log(`  크럼 ${crumb ? '확보' : '실패'}`);
} catch (e) { console.log('  크럼 실패:', String(e.message || e)); }

for (const sym of ['VFIAX', 'FXAIX', 'VTSAX']) {
  await probe('yahoo', `뮤추얼펀드 ${sym}`,
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${sym}` +
    `?modules=topHoldings,fundProfile,fundPerformance,defaultKeyStatistics,price&crumb=${encodeURIComponent(crumb)}`,
    { headers: { Cookie: cookie, Referer: 'https://finance.yahoo.com/' } }, { keep: true });
}

// 국내 공모펀드도 야후에 있는지 — 있을 리 없지만 확인은 해 둔다.
await probe('yahoo', '국내 공모펀드 후보(KR)',
  `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent('미래에셋')}&quotesCount=10`,
  { headers: { Cookie: cookie, Referer: 'https://finance.yahoo.com/' } });

// ── 기록 ──────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(results, null, 2));

const md = ['# 펀드 원천 탐색', '', `조사 시각: ${new Date().toISOString()}`, '',
  'ETF 화면이 가능했던 이유는 네이버 etfAnalysis 하나가 편입종목을 줬기 때문이다.',
  '펀드에도 그런 자리가 있는지 확인한 기록. **보유종목 상위 10을 못 구하면',
  '화면의 본체가 없다.**', '',
  '| 분류 | 대상 | 상태 | 크기 | 인코딩 | 보유종목 | 수익률 | 설정액 | 보수 |',
  '|---|---|---|---:|---|:-:|:-:|:-:|:-:|'];
for (const r of results) {
  const yn = (b) => (b ? '○' : '·');
  md.push(`| ${r.group} | ${r.name} | ${r.error ? '✗ ' + r.error : r.status + (r.looksFrame ? ' (프레임)' : '')} | ` +
    `${r.bytes ?? '–'} | ${r.encoding || '–'} | ${yn(r.mentions?.보유종목)} | ${yn(r.mentions?.수익률)} | ` +
    `${yn(r.mentions?.설정액)} | ${yn(r.mentions?.보수)} |`);
}
md.push('', '## 응답 맛보기', '');
for (const r of results) {
  if (r.error || !r.sample) continue;
  md.push(`### [${r.group}] ${r.name}`, '', '```', r.sample.slice(0, 700).replace(/```/g, "'''"), '```', '');
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[probe] ${OUT_MD} · ${OUT_JSON} 기록 — ${results.length}건`);
