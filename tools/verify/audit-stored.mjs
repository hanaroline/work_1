import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

const win = {};
new Function('window', fs.readFileSync(path.join(ROOT,'data','fund-prospectus.js'),'utf8'))(win);
const P = win.FUND_PROSPECTUS;
const pool = P.pool, items = P.items;
const V = (x) => (typeof x === 'number' ? pool[x] : x);

const codes = Object.keys(items);
console.log('판독 종목 ' + codes.length + ' · rulesStamp ' + P.rulesStamp + ' · 생성 ' + (P.builtAt||'-'));

const FIELDS = ['clsA','clsAExp','clsCExp','clsPExp','clsPName','redeemFee','strategy',
  'risk1','risk2','varPct','varBasis','fxHedge','fxHedgeSize'];
const cnt = {};
FIELDS.forEach(f => cnt[f] = 0);
codes.forEach(c => FIELDS.forEach(f => { if (items[c][f] != null) cnt[f]++; }));
console.log('\n[판독 건수]');
FIELDS.forEach(f => console.log('  ' + f.padEnd(12) + String(cnt[f]).padStart(6)));

const rateOk = (v) => {
  const s = String(v==null?'':v).replace(/[%\s]/g,'');
  if (!/^\d+(?:\.\d+)?$/.test(s)) return false;
  const n = parseFloat(s);
  return n > 0 && n <= 10;
};
console.log('\n[가] 보수율답지 않은 값');
let bad = 0;
['clsAExp','clsCExp','clsPExp'].forEach(f => {
  const hit = [];
  codes.forEach(c => { const v = V(items[c][f]); if (v != null && !rateOk(v)) hit.push(c + ' ' + JSON.stringify(v)); });
  bad += hit.length;
  console.log('  ' + f.padEnd(10) + String(hit.length).padStart(4) + '건' + (hit.length? '  ' + hit.slice(0,8).join(' | ') : ''));
});
console.log('  ── 합계 ' + bad + '건 (직전 판 59건)');

console.log('\n[나] clsPName 오염');
const wrongKind = [], noRetire = [], numy = [];
codes.forEach(c => {
  const v = V(items[c].clsPName); if (v == null) return;
  const s = String(v);
  if (/개인\s*연금|연금\s*저축|인연금/.test(s)) wrongKind.push(c + ' ' + s);
  if (!/퇴\s*직/.test(s)) noRetire.push(c + ' ' + s);
  const toks = s.trim().split(/\s+/).filter(t => /^[\d,]+(?:\.\d+)?%?$/.test(t));
  if (toks.length >= 2) numy.push(c + ' ' + s);
});
console.log('  개인연금·연금저축 섞임 ' + wrongKind.length + '건' + (wrongKind.length?'  '+wrongKind.slice(0,6).join(' | '):''));
console.log('  「퇴직」 없음        ' + noRetire.length + '건' + (noRetire.length?'  '+noRetire.slice(0,6).join(' | '):''));
console.log('  숫자 칸 둘 이상      ' + numy.length + '건' + (numy.length?'  '+numy.slice(0,6).join(' | '):''));

console.log('\n[다] 위험 항목 앞 행번호 잔존');
let rn = 0; const ex = [];
codes.forEach(c => ['risk1','risk2'].forEach(f => {
  const v = V(items[c][f]); if (v == null) return;
  String(v).split('\n').forEach(ln => {
    if (/^\s*\d{1,2}\s+\S/.test(ln)) { rn++; if (ex.length<5) ex.push(c+' '+ln.trim().slice(0,50)); }
  });
}));
console.log('  ' + rn + '건' + (rn? '  '+ex.join(' | ') : ''));
