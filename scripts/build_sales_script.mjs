/**
 * sales-script.html + data/*.js + js/*.js 를 단일 파일로 합친다.
 *
 *   node scripts/build_sales_script.mjs
 *   → sales-script-standalone.html  (로컬 서버 없이 더블클릭으로 열림)
 *
 * 외부 <script src> 를 순서대로 인라인하기만 하므로, 소스를 고친 뒤
 * 이 스크립트를 다시 실행하면 배포용 파일이 갱신된다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'sales-script.html';
const OUT = 'sales-script-standalone.html';

let html = readFileSync(resolve(root, SRC), 'utf8');

const tagRe = /<script\s+src="([^"]+)"\s*><\/script>/g;
const found = [];
html = html.replace(tagRe, (_, src) => {
  const path = resolve(root, src);
  let code;
  try {
    code = readFileSync(path, 'utf8');
  } catch {
    console.warn(`  건너뜀 (파일 없음): ${src}`);
    return '';
  }
  found.push({ src, bytes: code.length });
  // </script> 가 문자열 안에 있으면 조기 종료되므로 분리한다
  const safe = code.replace(/<\/script>/gi, '<\\/script>');
  return `<script>\n/* ===== inlined: ${src} ===== */\n${safe}\n</script>`;
});

// 폰트 CDN 은 차단 환경에서도 폴백되므로 그대로 둔다.
html = html.replace(
  '<title>',
  `<!-- 이 파일은 scripts/build_sales_script.mjs 가 생성한 산출물입니다.\n     소스는 ${SRC} / data/sales-script-*.js / js/sales-script-app.js 를 수정하세요. -->\n<title>`
);

writeFileSync(resolve(root, OUT), html);

console.log(`${OUT} 생성 완료 — ${(html.length / 1024).toFixed(0)} KB`);
found.forEach((f) => console.log(`  인라인 ${f.src} (${(f.bytes / 1024).toFixed(0)} KB)`));
