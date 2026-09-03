/**
 * sales-script.html + vendor/*.js + data/*.js + js/*.js 를 단일 파일로 합친다.
 *
 *   node scripts/build_sales_script.mjs
 *   → sales-script-standalone.html  (로컬 서버 없이 더블클릭으로 열림)
 *
 * 외부 <script src> 를 순서대로 인라인한다. PDF 판독 워커는 별도 파일이라
 * file:// 에서 로드할 수 없으므로, 소스를 문자열로 심어 앱이 Blob URL 로
 * 만들어 쓰게 한다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'sales-script.html';
/* 내보낼 파일 이름 — 새 기능을 따로 받아 보려면 인자로 다른 이름을 준다.
   예) node scripts/build_sales_script.mjs sales-script-standalone-v2.html */
const OUT = process.argv[2] || 'sales-script-standalone.html';
const PDF_TAG = '<script src="vendor/pdf.min.js"></script>';

let html = readFileSync(resolve(root, SRC), 'utf8');
const log = [];

/* ── 1) PDF 워커 소스를 문자열로 주입 (스크립트 인라인보다 먼저) ── */
if (html.includes(PDF_TAG)) {
  try {
    const worker = readFileSync(resolve(root, 'vendor/pdf.worker.min.js'), 'utf8');
    html = html.replace(
      PDF_TAG,
      '<script>window.SS_PDF_WORKER_SRC = ' +
        JSON.stringify(worker).replace(/<\/script>/gi, '<\\/script>') +
        ';</scr' + 'ipt>\n' + PDF_TAG
    );
    log.push(`워커 인라인 vendor/pdf.worker.min.js (${(worker.length / 1024).toFixed(0)} KB)`);
  } catch {
    console.warn('  건너뜀 (파일 없음): vendor/pdf.worker.min.js — 단일 파일에서 PDF 판독이 비활성됩니다');
  }
}

/* ── 2) 외부 <script src> 인라인 ── */
html = html.replace(/<script\s+src="([^"]+)"\s*><\/script>/g, (_, src) => {
  let code;
  try {
    code = readFileSync(resolve(root, src), 'utf8');
  } catch {
    console.log(`  건너뜀 (파일 없음): ${src}`);
    return '';
  }
  log.push(`인라인 ${src} (${(code.length / 1024).toFixed(0)} KB)`);
  // </script> 가 코드 안 문자열에 있으면 조기 종료되므로 분리한다
  return `<script>\n/* ===== inlined: ${src} ===== */\n${code.replace(/<\/script>/gi, '<\\/script>')}\n</script>`;
});

/* ── 3) 산출물 표시 ── */
html = html.replace(
  '<title>',
  `<!-- 이 파일은 scripts/build_sales_script.mjs 가 생성한 산출물입니다.\n     소스는 ${SRC} / data/sales-script-*.js / js/sales-script-*.js 를 수정하세요. -->\n<title>`
);

writeFileSync(resolve(root, OUT), html);

console.log(`${OUT} 생성 완료 — ${(html.length / 1024 / 1024).toFixed(2)} MB`);
log.forEach((l) => console.log('  ' + l));
