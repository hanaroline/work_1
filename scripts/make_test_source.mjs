#!/usr/bin/env node
/**
 * sales-script-expl.html  ->  sales-script-expl-test.html  (쪽 표시 테스트판)
 *
 * 기존 판을 손대지 않기 위한 장치다. 둘의 차이는 **딱 하나** —
 * 테스트판만 data/doc-pages.js 를 싣는다. 앱은 그 파일이 없으면 쪽 표시를
 * 아예 그리지 않으므로, 기존 배포본은 동작이 달라지지 않는다.
 *
 * 손으로 두 벌을 관리하면 한쪽만 고쳐 놓고 다른 쪽에서 「왜 안 되지」 를 하게 된다.
 * 껍데기는 sales-script.html 한 벌만 고치고, expl 은 make_expl_source.mjs 가,
 * 테스트판은 이 스크립트가 다시 만든다.
 *
 * 사용: node scripts/make_expl_source.mjs && node scripts/make_test_source.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'sales-script-expl.html';
const OUT = 'sales-script-expl-test.html';

let html = await readFile(SRC, 'utf8');

/* ① 쪽 지도를 싣는다 — 앱 스크립트보다 **먼저** 와야 한다 (앱이 로드 시점에 읽는다) */
const APP = '<script src="js/sales-script-app.js"></script>';
if (!html.includes(APP)) throw new Error(`${SRC} 에서 앱 스크립트 태그를 찾지 못했습니다`);
if (!html.includes('data/doc-pages.js')) {
  html = html.replace(APP, '<script src="data/doc-pages.js"></script>\n' + APP);
}

/* ② 테스트판임을 화면에서 알 수 있게 한다 — 창구가 두 파일을 헷갈리면 안 된다 */
html = html
  .replace(
    '<title>완전판매 스크립트 자동완성 · 상품설명의무</title>',
    '<title>[테스트] 완전판매 스크립트 · 상품설명의무 · 교부자료 쪽 표시</title>'
  )
  .replace(
    '<small>완전판매 · 상품을 고르면 그 상품의 값으로 완성됩니다 (적합성원칙 제외)</small>',
    '<small><b style="color:#c60">[테스트판]</b> 교부자료 쪽 표시 시험 중 — 쪽 번호는 짚어 주는 용도이며, 실제 자료와 대조해 쓰십시오</small>'
  );

await writeFile(OUT, html);
console.log(`[test] ${OUT} 생성 — data/doc-pages.js 적재 · 제목/상단바에 테스트 표시`);
