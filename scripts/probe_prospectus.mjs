#!/usr/bin/env node
/**
 * 투자설명서(일괄신고추가서류) 확보 경로 탐색.
 *
 * 페이지의 과거 시뮬레이션은 우리가 종가로 계산한 값이고, 발행사 설명서의
 * "수익률 모의실험"(2003년~ 20년 롤링)은 별개 데이터다. 후자를 쓰려면 공시 원문이
 * 필요한데 개발 컨테이너에서는 KIND·DART·미래에셋이 모두 막혀 있다.
 * 러너에서는 열리는지 먼저 확인한다.
 */
const TARGETS = [
  ['KIND 투자설명서(2026-07-30)', 'https://kind.krx.co.kr/external/2026/07/30/000510/20260730001210/10603.htm'],
  ['KIND 일괄신고추가서류(2026-06-05)', 'https://kind.krx.co.kr/external/2026/06/05/000396/20260605001024/10131.htm'],
  ['KIND 공시검색', 'https://kind.krx.co.kr/disclosure/details.do?method=searchDetailsMain'],
  ['DART 공시뷰어', 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260729000127'],
  ['DART 공시검색', 'https://dart.fss.or.kr/dsab001/main.do'],
  ['미래에셋 투자설명서 PDF', 'https://securities.miraeasset.com/public/hks4000/T520101.pdf'],
  ['미래에셋 ELS 캘린더', 'https://securities.miraeasset.com/hks/hks4022/n01.do'],
];

for (const [label, url] of TARGETS) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/141 Safari/537.36' },
      signal: AbortSignal.timeout(30000),
    });
    const buf = Buffer.from(await r.arrayBuffer());
    const ct = r.headers.get('content-type') || '';
    // 한글 공시는 EUC-KR 인 경우가 많다. 판별만 하면 되므로 대충 훑는다.
    const head = buf.subarray(0, 400).toString('utf8').replace(/\s+/g, ' ').slice(0, 120);
    console.log(`${label}\n  HTTP ${r.status} | ${ct} | ${buf.length}B | ${Date.now() - t0}ms\n  ${head}`);
  } catch (e) {
    console.log(`${label}\n  실패: ${e.name} ${e.message} (${Date.now() - t0}ms)`);
  }
}
