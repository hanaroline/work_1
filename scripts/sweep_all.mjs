// 보관된 판 **전체**를 한 번에 훑어 넘침이 있는 판만 추려 낸다.
//
// scripts/sweep.mjs 는 판 하나를 340~1920px 20px 간격으로 촘촘히 재지만,
// 129 판을 그렇게 돌리면 너무 오래 걸린다. 이 스크립트는 폭을 여덟 개로
// 줄이는 대신 **전체를 훑어 어느 판이 문제인지 먼저 찾는 용도**다.
// 문제 판을 찾으면 그 판만 sweep.mjs 로 다시 촘촘히 재라.
//
//   node scripts/sweep_all.mjs <결과를 적을 파일>
//
// 2026-10-01 에 옛 판의 340px 넘침을 고치면서 만들었다. 그때 8/6·8/7·FOMC
// 세 판 말고도 같은 계열(그 시기 판에 좁은 화면 표 규칙이 없음)이 더 있는지
// 확인해야 했는데, 한 판씩 재서는 알 수 없었다.

import { chromium } from 'playwright';
import { readdirSync, appendFileSync } from 'fs';
const out = process.argv[2];
const files = [...readdirSync('docs/briefings').filter(f=>/^20\d\d-.*\.html$/.test(f)).sort().map(f=>'docs/briefings/'+f),
               'docs/fomc/2026-09-fomc.html'];
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const p = await b.newPage();
const widths=[340,360,420,560,700,760,900,1280];
let n=0, bad=0;
for (const f of files) {
  let wd=0, wt=0, at=0;
  for (const w of widths) {
    await p.setViewportSize({width:w,height:900});
    await p.goto('file:///home/user/work_1/'+f);
    const r = await p.evaluate(()=>{
      const doc=Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth);
      let t=0; document.querySelectorAll('table.data').forEach(x=>{
        const wr=x.closest('.table-wrap')||x.parentElement; t=Math.max(t,x.scrollWidth-wr.clientWidth); });
      return {doc,tbl:t};
    });
    if(r.doc>wd) wd=r.doc;
    if(r.tbl>wt){wt=r.tbl; at=w;}
  }
  n++;
  if(wd>1||wt>1){ bad++; appendFileSync(out, `${f.split('/').pop().padEnd(34)} doc+${wd}  tbl+${wt}@${at}px\n`); }
}
appendFileSync(out, `\n검사 ${n}판 · 넘침 있는 판 ${bad}\n`);
await b.close();
