#!/usr/bin/env node
/**
 * etf.html + data/etf.js -> 아티팩트로 올릴 수 있는 한 조각.
 *
 *   node scripts/build_etf_artifact.mjs [출력경로]
 *
 * 팀에 링크로 공유하려고 아티팩트(claude.ai 호스팅)에 올릴 때 쓴다.
 * 배포용 단일 파일(etf-holdings-search.html)과 내용은 같지만 **껍데기가
 * 다르다.** 아티팩트 호스트가 <!doctype>·<html>·<head>·<body> 를 직접
 * 씌우므로, 이쪽은 그 안에 들어갈 알맹이만 넘겨야 한다. 온전한 문서를
 * 그대로 올리면 문서 안에 문서가 들어가 화면이 깨진다.
 *
 * 알맹이 = <title> + <style> + <body> 안쪽.
 *
 * 폰트는 되살린다. 단일 파일은 사내망·오프라인을 염두에 두고 폰트 CDN 을
 * 걷어내지만, 아티팩트는 브라우저로 여는 웹페이지이고 호스트가 구글 폰트를
 * 허용한다. 다만 <link> 대신 @import 로 넣는다 — 이쪽 <head> 는 우리가
 * 못 건드리기 때문이다.
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'etf.html';
const DATA = 'data/etf.js';
const OUT = process.argv[2] || 'etf-artifact.html';

const FONTS = "@import url('https://fonts.googleapis.com/css2?" +
              "family=Noto+Sans+KR:wght@300;400;500;700" +
              "&family=Inter:wght@400;500;600;700&display=swap');";

const html = await readFile(SRC, 'utf8');
const data = await readFile(DATA, 'utf8');

function pick(re, what) {
  const m = html.match(re);
  if (!m) {
    console.error(`[artifact] ${SRC} 에서 ${what} 를 찾지 못했습니다.`);
    process.exit(1);
  }
  return m[1];
}

const title = pick(/<title>([\s\S]*?)<\/title>/, '<title>');
let style = pick(/<style>([\s\S]*?)<\/style>/, '<style>');
let body = pick(/<body>([\s\S]*?)<\/body>/, '<body>');

// 데이터를 인라인한다 (배포용 단일 파일과 같은 방식).
const inlined = body.replace(
  /<script src="data\/etf\.js"><\/script>/,
  '<script>\n/* ==== data/etf.js (인라인) ==== */\n' + data + '\n</script>'
);
if (inlined === body) {
  console.error('[artifact] data/etf.js 스크립트 태그를 찾지 못했습니다.');
  process.exit(1);
}
body = inlined;

// @import 는 스타일시트 맨 앞에 있어야 브라우저가 받아들인다.
style = FONTS + '\n' + style;

// 이 페이지는 미래에셋 브랜드 화면이라 밝은 한 가지 모습으로만 간다.
// 아티팩트는 보는 사람의 테마 위에 얹히므로, 바탕을 우리가 직접 칠하지 않으면
// 어두운 테마에서 흰 글씨 위에 흰 바탕 같은 꼴이 난다. body 는 이미 --canvas 를
// 칠하지만 html 은 안 칠하고 있어, 스크롤 여백에 host 의 어두운 바탕이 비친다.
style += '\n/* 아티팩트 전용 — 보는 사람의 테마와 무관하게 바탕을 직접 칠한다 */\n' +
         'html{background:var(--canvas); color-scheme:light;}\n';

const out = `<title>${title}</title>\n<style>\n${style}\n</style>\n${body}\n`;

await writeFile(OUT, out);
console.log(`[artifact] ${OUT} 생성 완료 (${(out.length / 1024 / 1024).toFixed(2)} MB)`);
