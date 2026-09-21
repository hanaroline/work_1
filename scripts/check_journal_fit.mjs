// 시장일지가 **A4 한 장씩에 들어가는지** 눈이 아니라 자로 잰다.
//
// 「A4 한 장」은 이 자료의 약속이다. 표가 한 줄 늘어 넘치면 넘친 줄만
// 다음 쪽으로 흘러 아무도 읽지 않는 꼬리가 생긴다. 그래서 짓고 나서
// 쪽마다 안쪽 높이를 재어 297mm 를 넘는지 본다.
//
//   node scripts/check_journal_fit.mjs docs/journal/2026-09-21.html
//
// 넘으면 끝 상태 1. 줄 수를 줄이거나(빌더의 cap) 표를 dense 로 돌린다.
import { chromium } from 'playwright';
import path from 'node:path';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 1400 } });
await p.goto('file://' + path.resolve(process.argv[2]), { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
const r = await p.evaluate(() => [...document.querySelectorAll('.sheet')].map((s, i) => {
  // 안쪽 내용이 실제로 차지한 높이 (min-height 를 뺀 값)
  let bottom = 0;
  for (const el of s.children) {
    const b = el.getBoundingClientRect();
    bottom = Math.max(bottom, b.bottom);
  }
  const top = s.getBoundingClientRect().top;
  return { sheet: i + 1, contentPx: Math.round(bottom - top), limitPx: Math.round(297 * 96 / 25.4) };
}));
await b.close();
const PAD = Math.round((9 + 7) * 96 / 25.4);   // .sheet 위·아래 안쪽 여백
let over = 0;
for (const x of r) {
  const need = x.contentPx + Math.round(7 * 96 / 25.4);
  const bad = need > x.limitPx;
  if (bad) over += 1;
  console.log(`${bad ? '넘침' : '들어감'}  ${x.sheet} 쪽 — 안쪽 ${need}px / A4 ${x.limitPx}px`);
}
if (over) {
  console.error(`\n${over} 쪽이 A4 를 넘었습니다. 표의 줄 수를 줄이십시오.`);
  process.exit(1);
}
