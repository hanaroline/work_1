import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const widths = [[1440,'desktop-lg'],[1200,'desktop'],[1079,'break-under'],[1080,'break-at'],[768,'tablet'],[390,'mobile'],[360,'mobile-sm']];
for (const [w,name] of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto('file:///home/user/work_1/briefing/index.html');
  await p.waitForTimeout(350);
  const r = await p.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    mode: getComputedStyle(document.querySelector('.shell')).display,
    navDisp: getComputedStyle(document.querySelector('.sidenav-toc')).display,
  }));
  console.log(name.padEnd(13), w, JSON.stringify(r));
  await p.close();
}
// 인쇄 모드에서 사이드바가 숨는지 + 단일 컬럼인지
const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
await p.emulateMedia({ media: 'print' });
await p.goto('file:///home/user/work_1/briefing/index.html');
await p.waitForTimeout(400);
console.log('print:', await p.evaluate(() => ({
  sidenav: getComputedStyle(document.querySelector('.sidenav')).display,
  shell: getComputedStyle(document.querySelector('.shell')).display })));
// 인쇄 페이지 수 재확인 (사이드바 추가 후)
const pg = await b.newPage();
await pg.goto('file:///home/user/work_1/briefing/index.html');
await pg.waitForTimeout(300);
const o = { format:'A4', margin:{top:'14mm',bottom:'14mm',left:'13mm',right:'13mm'}, printBackground:true };
const out='/tmp/claude-0/-home-user-work-1/c64127d2-5379-512f-bed5-884dd6684892/scratchpad';
await pg.pdf({ path:`${out}/pdf-summary.pdf`, ...o });
await pg.evaluate(() => document.querySelector('.expand-all').click());
await pg.waitForTimeout(400);
await pg.pdf({ path:`${out}/pdf-full.pdf`, ...o });
await b.close();
