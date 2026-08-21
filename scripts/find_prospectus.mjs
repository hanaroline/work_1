#!/usr/bin/env node
/**
 * 최근 발행분 일괄신고추가서류의 접수번호를 찾는다.
 *
 * 이미 주소를 아는 6월 공시(제37821~37839회)는 확보했지만, 지금 필요한 건
 * 8월 발행분(제37982~38023회)이다. DART·KIND 공시검색에서 접수번호를 긁는다.
 */
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/141 Safari/537.36';

const tries = [
  ['DART 통합검색(회사명)', 'https://dart.fss.or.kr/dsab007/main.do?option=corp&textCrpNm=%EB%AF%B8%EB%9E%98%EC%97%90%EC%85%8B%EC%A6%9D%EA%B6%8C', 'GET', null],
  ['DART 상세검색 POST', 'https://dart.fss.or.kr/dsab007/detailSearch.ax', 'POST',
    'currentPage=1&maxResults=100&textCrpNm=미래에셋증권&startDate=20260801&endDate=20260821&publicType=B001'],
  ['DART 공시검색 POST', 'https://dart.fss.or.kr/dsab001/search.ax', 'POST',
    'currentPage=1&maxResults=100&textCrpNm=미래에셋증권&startDate=20260801&endDate=20260821'],
  ['KIND 당일공시', 'https://kind.krx.co.kr/disclosure/todaydisclosure.do', 'POST',
    'method=searchTodayDisclosureSub&currentPageSize=100&pageIndex=1&orderMode=0&orderStat=D&forward=todaydisclosure_sub&searchCorpName=미래에셋증권'],
  ['KIND 상세검색', 'https://kind.krx.co.kr/disclosure/details.do', 'POST',
    'method=searchDetailsSub&currentPageSize=100&pageIndex=1&forward=details_sub&searchCorpName=미래에셋증권&fromDate=2026-08-01&toDate=2026-08-21'],
];

for (const [label, url, method, body] of tries) {
  try {
    const r = await fetch(url, {
      method,
      headers: {
        'User-Agent': UA,
        'Referer': new URL(url).origin,
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : {}),
      },
      body: body || undefined,
      signal: AbortSignal.timeout(45000),
    });
    const buf = Buffer.from(await r.arrayBuffer());
    const probe = buf.subarray(0, 2000).toString('latin1').toLowerCase();
    const txt = new TextDecoder(/euc-kr|ks_c_5601/.test(probe) ? 'euc-kr' : 'utf-8').decode(buf);
    const rcp = [...new Set(txt.match(/rcpNo=(\d{14})/g) || [])].slice(0, 30);
    const acpt = [...new Set(txt.match(/acptno=['"]?(\d{14})/gi) || [])].slice(0, 30);
    const bulk = (txt.match(/일괄신고추가서류/g) || []).length;
    console.log(`${label}\n  HTTP ${r.status} | ${buf.length}B | 일괄신고추가서류 언급 ${bulk}회`);
    if (rcp.length) console.log(`  rcpNo: ${rcp.join(' ')}`);
    if (acpt.length) console.log(`  acptno: ${acpt.join(' ')}`);
    if (!rcp.length && !acpt.length) console.log(`  (접수번호 없음) 앞부분: ${txt.replace(/\s+/g, ' ').slice(0, 160)}`);
  } catch (e) {
    console.log(`${label}\n  실패: ${e.name} ${e.message}`);
  }
}
