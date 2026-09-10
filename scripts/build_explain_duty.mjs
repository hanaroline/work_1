#!/usr/bin/env node
/**
 * explain-duty.html + data/*.js + vendor/pdf*.js -> explain-duty-offline.html
 *
 * 창구 PC 가 인터넷에 연결되어 있지 않아도 되도록, 필요한 것을 전부 한 파일에 넣는다.
 *   - 상품 데이터(ELS / 펀드)와 화면 로직
 *   - PDF 판독기(pdf.js) 본체와 워커 — 워커 스크립트를 같이 넣어두면 pdf.js 가
 *     globalThis.pdfjsWorker 를 찾아 메인 스레드에서 돌리므로 워커 파일을 받으러 나가지 않는다
 *   - 외부 폰트 CDN 링크 제거 (없으면 시스템 폰트로 떨어진다)
 *
 * 결과물은 더블클릭만으로 열린다. 네트워크 요청이 하나도 없어야 정상이다.
 *
 * 사용: node scripts/build_explain_duty.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'explain-duty.html';
const OUT = 'explain-duty-offline.html';

const html = await readFile(SRC, 'utf8');

// <script src="..."></script> 를 파일 내용으로 바꾼다
const tag = /<script src="([^"]+)"><\/script>/g;
const wanted = [...html.matchAll(tag)].map((m) => m[1]);
if (!wanted.length) {
  console.error(`[build] ${SRC} 안에 인라인할 <script src> 가 없습니다.`);
  process.exit(1);
}

const inlined = new Map();
for (const path of wanted) {
  const code = await readFile(path, 'utf8');
  // 스크립트 안에 </script 가 있으면 태그가 거기서 끊긴다. 지금은 없지만 방어해 둔다.
  inlined.set(path, code.replace(/<\/script/gi, '<\\/script'));
}

let out = html.replace(tag, (_, path) =>
  `<script>\n/* ==== ${path} (인라인) ==== */\n${inlined.get(path)}\n</script>`
);

// 외부 폰트 CDN 제거 (오프라인 동작 보장)
out = out
  .replace(/\s*<link rel="preconnect"[^>]*>\n?/g, '')
  .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, '');

// 오프라인 배포본임을 파일 안에도 남긴다
out = out.replace(
  /<meta name="robots"[^>]*>/,
  (m) => `${m}\n<!-- explain-duty-offline.html — scripts/build_explain_duty.mjs 생성물. 외부 요청 없음. -->`
);

if (/https:\/\/fonts\./.test(out)) {
  console.error('[build] 외부 폰트 링크가 남아 있습니다.');
  process.exit(1);
}
if (/<script src=/.test(out)) {
  console.error('[build] 인라인되지 않은 <script src> 가 남아 있습니다.');
  process.exit(1);
}

await writeFile(OUT, out);
console.log(`[build] ${OUT} 생성 완료 (${(out.length / 1024 / 1024).toFixed(2)} MB, 스크립트 ${wanted.length}개 인라인)`);
