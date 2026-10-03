#!/usr/bin/env node
/**
 * fund.html + data/fund.js -> fund-search.html
 *
 * 서버 없이 더블클릭만으로 열리는 배포용 한 파일을 만든다. 외부 폰트 CDN 도
 * 걷어내 사내망·오프라인에서 그대로 동작하게 한다. (etf-holdings-search.html
 * 과 같은 방식이다.)
 *
 * 데이터가 커서(공모펀드 3,200여 개, 보유종목 40~72개씩) 인라인하면 파일이
 * 몇 MB 가 된다. 그래도 한 파일로 두는 편이 낫다 — 받는 사람이 압축을 풀거나
 * 서버를 띄우지 않아도 되고, 메일로 그대로 보낼 수 있다.
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'fund.html';
const DATA = 'data/fund.js';
const OUT = 'fund-search.html';

const html = await readFile(SRC, 'utf8');
const data = await readFile(DATA, 'utf8');

let out = html.replace(
  /<script src="data\/fund\.js"><\/script>/,
  '<script>\n/* ==== data/fund.js (인라인) ==== */\n' + data + '\n</script>'
);

if (out === html) {
  console.error(`[build] ${SRC} 안에서 data/fund.js 스크립트 태그를 찾지 못했습니다.`);
  process.exit(1);
}

// 미리 만들어 둔 사용법 PDF(base64)도 같이 넣는다.
//
// 없으면 그냥 태그를 지운다 — 배포본은 파일 하나로 돌아다니므로 걷어내지
// 않으면 열 때마다 없는 파일을 찾다가 404 를 낸다. PDF 가 빠진 화면은
// "사용법 내려받기 (PDF)" 단추를 스스로 감추고 왜 없는지를 적는다.
const PDFJS = 'data/fund-help-pdf.js';
let pdfjs = null;
try {
  pdfjs = await readFile(PDFJS, 'utf8');
} catch {
  console.warn(`[build] ${PDFJS} 가 없습니다 — PDF 내려받기 없이 만듭니다.`);
}
const pdfTag = /<script src="data\/fund-help-pdf\.js"><\/script>/;
if (!pdfTag.test(out)) {
  console.error(`[build] ${SRC} 안에서 ${PDFJS} 스크립트 태그를 찾지 못했습니다.`);
  process.exit(1);
}
out = out.replace(
  pdfTag,
  pdfjs ? '<script>\n/* ==== data/fund-help-pdf.js (인라인) ==== */\n' + pdfjs + '\n</script>' : ''
);

// 그림이 붙은 사용법 문서도 같이 넣는다.
//
// PDF 와 같은 빌드가 같은 원고로 만든 것인데, 이쪽은 **화면 안에서 그대로
// 그리는** 몫이다. 없으면 태그를 지운다 — 그때 사용법 탭은 그림 없는 글로
// 물러선다(화면이 스스로 그렇게 한다). 빠져 있는 것을 없는 파일로 찾게
// 두면 배포본이 열릴 때마다 404 를 낸다.
const DOCJS = 'data/fund-help-doc.js';
let docjs = null;
try {
  docjs = await readFile(DOCJS, 'utf8');
} catch {
  console.warn(`[build] ${DOCJS} 가 없습니다 — 사용법 탭은 그림 없는 글로 나갑니다.`);
}
const docTag = /<script src="data\/fund-help-doc\.js"><\/script>/;
if (!docTag.test(out)) {
  console.error(`[build] ${SRC} 안에서 ${DOCJS} 스크립트 태그를 찾지 못했습니다.`);
  process.exit(1);
}
out = out.replace(
  docTag,
  docjs ? '<script>\n/* ==== data/fund-help-doc.js (인라인) ==== */\n' + docjs + '\n</script>' : ''
);

// 외부 폰트 CDN 제거 (오프라인 동작 보장, 시스템 폰트로 폴백)
out = out
  .replace(/\s*<link rel="preconnect"[^>]*>\n?/g, '')
  .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, '');

await writeFile(OUT, out);
console.log(`[build] ${OUT} 생성 완료 (${(out.length / 1024 / 1024).toFixed(2)} MB)`);
