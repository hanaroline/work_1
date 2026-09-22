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

// **어느 글꼴로 그려졌는지 실제로 묻는다.** CSS 가 바라는 이름이 아니라
// 기계가 고른 이름을 본다 — 그 둘은 자주 다르다. 러너가 한 번은 문서 전체를
// Noto Sans KR **Thin**(굵기 100)으로 그려 7.4px 표가 종잇장이 됐고, 이 세션은
// 중국어 글꼴(WenQuanYi)을 골랐다. 둘 다 조용히 일어났다. 크롬의
// CSS.getPlatformFontsForNode 가 이것을 그대로 말해 준다.
const cdp = await page.context().newCDPSession(page);
await cdp.send('DOM.enable');
await cdp.send('CSS.enable');
const { root } = await cdp.send('DOM.getDocument');
// 글자가 **실제로 들어 있는** 마디를 물어야 한다. 빈 상자를 물으면 빈 답이
// 온다. 표 칸과 제목을 차례로 시도해 처음 답하는 것을 쓴다.
let used = [];
for (const sel of ['table.dt tbody td', '.blk h2', '.hd h1', 'body']) {
  const { nodeId } = await cdp.send('DOM.querySelector',
    { nodeId: root.nodeId, selector: sel }).catch(() => ({ nodeId: 0 }));
  if (!nodeId) continue;
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId })
    .catch(() => ({ fonts: [] }));
  if (fonts && fonts.length) { used = fonts.slice(); break; }
}
used.sort((a, b) => b.glyphCount - a.glyphCount);
const main = used[0]?.familyName || '(모름)';
const thin = /\bthin\b|\blight\b|\bextralight\b/i.test(main);
const cjkWrong = /wenquanyi|zenhei|ipa[pg]?gothic|droid sans fallback/i.test(main);
console.log(`글꼴  ${used.map((f) => `${f.familyName}(${f.glyphCount})`).join(' · ') || '(못 읽음)'}`);
if (thin || cjkWrong) {
  console.warn(
    `경고: 한글이 「${main}」 로 그려졌습니다 — ` +
    (thin ? '가는 굵기라 작은 표 글자가 읽히지 않습니다.'
          : '한국어 글꼴이 아닙니다(중국어·일본어 대체글꼴).') +
    ' 이 기계에 `fonts-noto-cjk` 를 깔면 Noto Sans CJK KR 의 Regular·Bold 를 씁니다.');
}

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
