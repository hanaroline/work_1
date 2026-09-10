#!/usr/bin/env node
/**
 * els.html + data/els.js -> els-product-search.html
 *
 * CSS·JS·상품 데이터·과거 시세를 한 파일에 인라인해, 서버 없이 더블클릭만으로
 * 열리는 배포용 산출물을 만든다. 외부 폰트 CDN 도 제거해 오프라인/사내망에서도
 * 그대로 동작한다. (받는 사람이 파일 이름만 보고 알 수 있게 els-product-search.html
 * 로 내보낸다 — 저장소의 다른 산출물 standalone.html 과 달리 이름이 용도를 말한다.)
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'els.html';
const DATA = 'data/els.js';
const OUT = 'els-product-search.html';

const html = await readFile(SRC, 'utf8');
const data = await readFile(DATA, 'utf8');

let out = html.replace(
  /<script src="data\/els\.js"><\/script>/,
  '<script>\n/* ==== data/els.js (인라인) ==== */\n' + data + '\n</script>'
);

if (out === html) {
  console.error(`[build] ${SRC} 안에서 data/els.js 스크립트 태그를 찾지 못했습니다.`);
  process.exit(1);
}

// 외부 폰트 CDN 제거 (오프라인 동작 보장, 시스템 폰트로 폴백)
out = out
  .replace(/\s*<link rel="preconnect"[^>]*>\n?/g, '')
  .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, '');

await writeFile(OUT, out);
console.log(`[build] ${OUT} 생성 완료 (${(out.length / 1024).toFixed(0)} KB)`);
