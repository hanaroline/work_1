// 리포트 다이제스트를 요약본·전체본 두 개의 A4 PDF 로 뽑는다.
//
//   node scripts/reports_to_pdf.mjs <한파일실행본HTML> <출력디렉터리> "<꼬리말>"
//
// 브리핑 쪽 scripts/to_pdf.mjs 와 짝이다. 다른 점은 이 화면이 「앱」이라
// 걸개·조회창처럼 종이에서 쓸모없는 것을 인쇄 CSS 로 지우고, 요약본에서는
// 전체 목록을 통째로 뺀다는 것이다(body.pdf-summary / body.pdf-full).
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const [src, outdir, footer] = process.argv.slice(2);
if (!src || !outdir) {
  console.error('사용법: node scripts/reports_to_pdf.mjs <실행본HTML> <출력디렉터리> "<꼬리말>"');
  process.exit(2);
}
fs.mkdirSync(outdir, { recursive: true });
const base = path.basename(src).replace(/\.html$/, '');

// 이 컨테이너에는 맑은고딕이 없다. 화면용 글꼴 스택은 고객 PC 를 겨냥한
// 것이므로 건드리지 않고, PDF 를 뽑을 때만 여기 있는 한글 글꼴로 바꾼다.
const FONT = `html:root, html:root body {
  font-family: 'Noto Sans CJK KR','Noto Sans KR','DejaVu Sans',sans-serif;
}`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const made = [];

for (const [mode, suffix, label] of [
  ['pdf-summary', '_요약', '요약본 — 머리 요약 · 주요 리포트 · 목표주가 변경'],
  ['pdf-weekly', '_주간인기', '주간본 — 한 주 인기 리포트 · 주간 셈'],
  ['pdf-full', '_전체', '전체본 — 위의 것 + 주간 + 전체 리포트 목록'],
]) {
  const name = path.join(outdir, base + suffix + '.pdf');
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.goto('file://' + path.resolve(src), { waitUntil: 'load' });
  // 자료를 그려 넣는 데 시간이 걸린다. 카드가 설 때까지 기다린다.
  await p.waitForFunction(() => document.querySelectorAll('#list .rp').length > 0,
                          null, { timeout: 15000 });
  await p.addStyleTag({ content: FONT });
  await p.evaluate((m) => {
    document.body.classList.remove('pdf-summary', 'pdf-full', 'pdf-weekly');
    document.body.classList.add(m);
    // 주간본은 표지 제목도 주간이어야 한다 — 「2026-08-28 증권사 리포트」가
    // 붙어 있으면 그날 판으로 오해한다.
    const t = document.getElementById('title');
    const w = document.getElementById('weekHint');
    if (m === 'pdf-weekly' && t && w) t.textContent = '주간 인기 증권사 리포트';
    // 전체본만 목록을 갈래로 묶고 차례를 세운다. 종이에는 걸러 보기가 없다.
    if (m === 'pdf-full' && typeof window.__groupList__ === 'function') window.__groupList__();
    // 종이에서는 조회 상태가 남아 있으면 안 된다 — 걸러 낸 것만 실린다.
    const q = document.getElementById('q');
    if (q && q.value) { q.value = ''; q.dispatchEvent(new Event('input')); }
  }, mode);
  await p.waitForTimeout(400);
  await p.emulateMedia({ media: 'print' });
  await p.waitForTimeout(300);

  const seen = await p.evaluate(() => ({
    highlights: document.querySelectorAll('#highlights .rp').length,
    moves: document.querySelectorAll('#moves .rp').length,
    weekly: document.querySelectorAll('#weekly .rp').length,
    list: document.querySelectorAll('#list .rp').length,
    title: (document.getElementById('title') || {}).textContent || '',
  }));

  // 꼬리말은 페이지와 별개의 렌더 문맥이라 본문 CSS 가 닿지 않는다.
  // 글꼴을 여기서 따로 지정하지 않으면 한글이 중국어 글꼴로 나온다.
  await p.pdf({
    path: name, format: 'A4', printBackground: true,
    // 여백은 화면 CSS 의 @page 가 잡는다. 여기서 또 주면 **더해져** 쪽수가
    // 부풀고(전체본 35→45쪽) 판이 좁아진다. 크로뮴은 문서가 @page 여백을
    // 선언하면 그것을 쓰므로, 이쪽은 0 으로 비워 둔다.
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-size:8pt;color:#777;'
      + "font-family:'Noto Sans CJK KR',sans-serif;padding:0 11mm;display:flex;justify-content:space-between\">"
      + '<span>' + (footer || '미래에셋증권 마포WM · 증권사 리포트 다이제스트') + '</span>'
      // 쪽번호는 한 덩이로 묶는다. 나눠 두면 space-between 이 「5」와 「/」와
      // 「33」을 각각 밀어내 한 줄에 널브러진다.
      + '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  const kb = Math.round(fs.statSync(name).size / 1024);
  console.log('만듦: %s (%dKB · %s)', name, kb, label);
  console.log('       주요 %d · 목표주가변경 %d · 주간 %d · 목록 %d',
              mode === 'pdf-weekly' ? 0 : seen.highlights,
              mode === 'pdf-weekly' ? 0 : seen.moves,
              mode === 'pdf-summary' ? 0 : seen.weekly,
              mode === 'pdf-full' ? seen.list : 0);
  made.push(name);
  await p.close();
}
await b.close();
if (made.length !== 3) process.exit(1);
