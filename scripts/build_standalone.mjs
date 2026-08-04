#!/usr/bin/env node
/**
 * els.html + data/els.js -> els-standalone.html
 *
 * 저장소의 기존 컨벤션(index.html / standalone.html)과 동일하게,
 * 서버 없이 파일을 더블클릭만 해도 열리는 단일 파일 산출물을 만든다.
 * 외부 폰트 CDN 도 제거해 오프라인/사내망에서도 그대로 동작하게 한다.
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'els.html';
const DATA = 'data/els.js';
const OUT = 'els-standalone.html';

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
