// 단독 HTML 브리핑을 요약본·전체본 두 개의 A4 PDF 로 뽑는다.
//
//   node scripts/to_pdf.mjs <단독HTML> <출력디렉터리> "<꼬리말>"
//
// 화면의 «요약 PDF» / «전체 PDF» 버튼이 하는 일과 같게 맞춘다 — 요약본은
// 상세를 접고, 전체본은 모두 펼친다.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const [src, outdir, footer] = process.argv.slice(2);
if (!src || !outdir) {
  console.error('사용법: node scripts/to_pdf.mjs <단독HTML> <출력디렉터리> "<꼬리말>"');
  process.exit(2);
}
fs.mkdirSync(outdir, { recursive: true });
const base = path.basename(src).replace(/\.html$/, '');

// 이 컨테이너에는 프리텐다드·맑은고딕이 없다. HTML 의 글꼴 스택은 고객 PC 를
// 겨냥한 것이므로 건드리지 않고, PDF 를 뽑을 때만 여기 있는 한글 글꼴로 바꾼다.
// html:root 로 특정도를 올린다. 본문 <style> 이 <head> 보다 뒤에 오므로
// 같은 :root 로는 밀린다 — 지침 6절의 그 함정이다.
const FONT = `html:root{
  --font-kr:'Noto Sans CJK KR','Noto Sans KR',sans-serif;
  --font-en:'Noto Sans CJK KR','DejaVu Sans',sans-serif;
  --font-num:'DejaVu Sans','Noto Sans CJK KR',sans-serif;
}`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const made = [];

for (const [full, suffix] of [[false, '_요약'], [true, '_전체']]) {
  const name = path.join(outdir, base + suffix + '.pdf');
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.goto('file://' + path.resolve(src), { waitUntil: 'load' });
  await p.evaluate((css) => {
    const st = document.createElement('style');
    st.textContent = css;
    document.body.appendChild(st);
  }, FONT);
  await p.waitForTimeout(700);

  const state = await p.evaluate((open) => {
    document.querySelectorAll('details.exp').forEach(d => {
      if (open) d.setAttribute('open', ''); else d.removeAttribute('open');
    });
    // 화면의 «요약 PDF» 단추가 붙이는 표시. 절마다 달린 data-brief 를 보고
    // 요약본에서 뺄 절을 인쇄에서 감춘다. 이 표시가 없는 판(정식판)에는
    // data-brief 도 규칙도 없으므로 아무 일도 일어나지 않는다.
    document.body.classList.toggle('brief-print', !open);
    document.querySelectorAll('table.data tr.clickable').forEach(r => {
      r.setAttribute('aria-expanded', open ? 'true' : 'false');
      const next = r.nextElementSibling;
      if (next && next.classList.contains('detail-row')) {
        if (open) next.removeAttribute('hidden'); else next.setAttribute('hidden', '');
      }
    });
    const secs = document.querySelectorAll('main .section').length;
    const kept = document.querySelectorAll('main .section[data-brief="1"]').length;
    return {
      details: document.querySelectorAll('details.exp').length,
      opened: document.querySelectorAll('details.exp[open]').length,
      secs, shown: open || !kept ? secs : kept,
      height: document.documentElement.scrollHeight,
    };
  }, full);
  await p.waitForTimeout(400);
  await p.emulateMedia({ media: 'print' });
  await p.waitForTimeout(300);

  // 꼬리말은 페이지와 별개의 렌더 문맥이라 본문 CSS 가 닿지 않는다.
  // 글꼴을 여기서 따로 지정하지 않으면 한글이 중국어 글꼴로 나온다.
  await p.pdf({
    path: name, format: 'A4', printBackground: true,
    margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-size:8pt;color:#777;'
      + "font-family:'Noto Sans CJK KR',sans-serif;padding:0 12mm;display:flex;justify-content:space-between\">"
      + '<span>' + (footer || '미래에셋증권 마포WM') + '</span>'
      + '<span class="pageNumber"></span>/<span class="totalPages"></span></div>',
  });
  const kb = Math.round(fs.statSync(name).size / 1024);
  console.log('만듦: %s (%dKB · 절 %d개 중 %d개 실림 · 상세 %d개 중 %d개 펼침 · 문서 높이 %dpx)',
              name, kb, state.secs, state.shown, state.details, state.opened, state.height);
  made.push(name);
  await p.close();
}
await b.close();
if (made.length !== 2) process.exit(1);
