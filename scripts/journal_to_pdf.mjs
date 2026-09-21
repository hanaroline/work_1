// 시장일지 HTML 을 **PDF 로 굽는다.**
//
// 텔레그램·메일로 건네려면 HTML 보다 PDF 가 낫다 — 받는 쪽 브라우저에
// 기대지 않고, 인쇄하면 잰 그대로 A4 로 나온다.
//
//   node scripts/journal_to_pdf.mjs docs/journal/2026-09-21.html
//   node scripts/journal_to_pdf.mjs <입력.html> [출력.pdf]
//
// **쪽 수를 센다.** 화면에서 재는 scripts/check_journal_fit.mjs 와 달리
// 여기서는 실제로 구운 PDF 의 쪽 수를 읽어 `.sheet` 개수와 맞는지 본다.
// 어긋나면 어느 장이 흘러넘쳐 꼬리 쪽이 생긴 것이므로 끝 상태 1 이다.
// 「A4 몇 장」은 이 자료의 약속이라, 눈이 아니라 자로 재고 또 센다.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const src = process.argv[2];
if (!src) {
  console.error('쓰임: node scripts/journal_to_pdf.mjs <입력.html> [출력.pdf]');
  process.exit(2);
}
const out = process.argv[3] || src.replace(/\.html$/, '.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + path.resolve(src), { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// 한/영 토글이 지난번 선택을 기억한다. 구울 때는 **늘 한국어**로 못박는다 —
// 굽는 기계의 저장소 상태에 따라 산출물이 달라지면 안 된다.
await page.evaluate(() => {
  const ko = document.getElementById('ko');
  if (ko && ko.getAttribute('aria-checked') !== 'true') ko.click();
});
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(300);

const sheets = await page.evaluate(() => document.querySelectorAll('.sheet').length);

await page.pdf({
  path: out,
  format: 'A4',
  printBackground: true,      // 오렌지 괘선·표 머리 바탕이 빠지면 안 된다
  preferCSSPageSize: true,    // @page{size:A4;margin:9mm 9mm 7mm} 를 따른다
});
await browser.close();

// 구운 것의 쪽 수를 읽는다. 크로미움은 쪽 객체를 압축하지 않고 쓰므로
// 원문에서 바로 세어진다. 못 세면 **센 척하지 않고** 그렇다고 말한다.
function pdfPageCount(file) {
  const buf = fs.readFileSync(file).toString('latin1');
  const byType = buf.match(/\/Type\s*\/Page[^s]/g);
  if (byType && byType.length) return byType.length;
  const counts = [...buf.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  return counts.length ? Math.max(...counts) : null;
}

const kb = Math.round(fs.statSync(out).size / 1024);
const pages = pdfPageCount(out);

if (pages === null) {
  console.log(`구웠음  ${out} — ${kb}KB · 쪽 수를 세지 못했습니다(형식을 읽을 수 없음)`);
  process.exit(0);
}
console.log(`구웠음  ${out} — ${kb}KB · ${pages} 쪽 (장 ${sheets}개)`);
if (pages !== sheets) {
  console.error(
    `\n장은 ${sheets}개인데 PDF 는 ${pages} 쪽입니다 — 어느 장이 A4 를 넘쳐 ` +
    `꼬리 쪽이 생겼습니다. 표의 줄 수를 줄이십시오.`);
  process.exit(1);
}
