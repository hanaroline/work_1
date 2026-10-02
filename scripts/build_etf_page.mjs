#!/usr/bin/env node
/**
 * etf.html + data/etf.js -> etf-holdings-search.html
 *
 * 서버 없이 더블클릭만으로 열리는 배포용 한 파일을 만든다. 외부 폰트 CDN 도
 * 걷어내 사내망·오프라인에서 그대로 동작하게 한다. (els-product-search.html
 * 과 같은 방식이다.)
 *
 * 데이터가 커서(국내 1,100여 종목 + 해외) 인라인하면 파일이 몇 MB 가 된다.
 * 그래도 한 파일로 두는 편이 낫다 — 받는 사람이 압축을 풀거나 서버를 띄우지
 * 않아도 되고, 메일로 그대로 보낼 수 있다.
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'etf.html';
const DATA = 'data/etf.js';
const OUT = 'etf-holdings-search.html';

const html = await readFile(SRC, 'utf8');
const data = await readFile(DATA, 'utf8');

let out = html.replace(
  /<script src="data\/etf\.js"><\/script>/,
  '<script>\n/* ==== data/etf.js (인라인) ==== */\n' + data + '\n</script>'
);

// 사용법 PDF 도 같이 담는다. 없으면 태그만 지우고 넘어간다 —
// PDF 를 아직 안 만들었다고 도구가 안 만들어질 이유는 없다.
try {
  const pdfJs = await readFile('data/etf-howto-pdf.js', 'utf8');
  out = out.replace(
    /<script src="data\/etf-howto-pdf\.js"><\/script>/,
    '<script>\n/* ==== data/etf-howto-pdf.js (인라인) ==== */\n' + pdfJs + '\n</script>'
  );
  console.log(`[build] 사용법 PDF 포함 (${(pdfJs.length / 1024).toFixed(0)} KB)`);
} catch {
  out = out.replace(/\s*<script src="data\/etf-howto-pdf\.js"><\/script>\n?/, '\n');
  console.log('[build] 사용법 PDF 없음 — 단추를 띄우지 않는다');
}

// 화면 그림도 담는다.
try {
  const shotsJs = await readFile('data/etf-howto-shots.js', 'utf8');
  out = out.replace(
    /<script src="data\/etf-howto-shots\.js"><\/script>/,
    '<script>\n/* ==== data/etf-howto-shots.js (인라인) ==== */\n' + shotsJs + '\n</script>'
  );
  console.log(`[build] 화면 그림 포함 (${(shotsJs.length / 1024).toFixed(0)} KB)`);
} catch {
  out = out.replace(/\s*<script src="data\/etf-howto-shots\.js"><\/script>\n?/, '\n');
  console.log('[build] 화면 그림 없음 — 그림 자리를 접는다');
}

if (out === html) {
  console.error(`[build] ${SRC} 안에서 data/etf.js 스크립트 태그를 찾지 못했습니다.`);
  process.exit(1);
}

// 외부 폰트 CDN 제거 (오프라인 동작 보장, 시스템 폰트로 폴백)
out = out
  .replace(/\s*<link rel="preconnect"[^>]*>\n?/g, '')
  .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, '');

await writeFile(OUT, out);
console.log(`[build] ${OUT} 생성 완료 (${(out.length / 1024 / 1024).toFixed(2)} MB)`);
