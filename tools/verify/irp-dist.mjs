import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

const W = {};
new Function('window', fs.readFileSync(path.join(ROOT,'data','fund-catalog.js'),'utf8'))(W);
new Function('window', fs.readFileSync(path.join(ROOT,'data','fund-prospectus.js'),'utf8'))(W);
const C = W.FUND_CATALOG, P = W.FUND_PROSPECTUS;
const cp = C.pool, pooled = new Set(C.pooled || []);
const pp = P.pool, items = P.items;
const PV = (x) => (typeof x === 'number' ? pp[x] : x);
const CV = (k, v) => (pooled.has(k) && typeof v === 'number') ? cp[v] : v;

const rateOk = (v) => {
  const s = String(v==null?'':v).replace(/[%\s]/g,'');
  if (!/^\d+(?:\.\d+)?$/.test(s)) return false;
  const n = parseFloat(s); return n > 0 && n <= 10;
};

const cat = C.items || C.funds || C.list;
const codes = Array.isArray(cat) ? cat.map(x => x.code) : Object.keys(cat);
const get = (c) => Array.isArray(cat) ? cat.find(x => x.code === c) : cat[c];

const tally = { '설명서 퇴직연금': 0, '카탈로그 퇴직연금': 0, '설명서 기재': 0, 'C 대체': 0, 'A 대체': 0, '없음': 0 };
codes.forEach(c => {
  const it = get(c) || {};
  const pr = items[c] || {};
  const pick = (k) => { const v = PV(pr[k]); return (v != null && rateOk(v)) ? v : null; };
  if (pick('clsPExp')) tally['설명서 퇴직연금']++;
  else if (it.clsPExp != null && rateOk(CV('clsPExp', it.clsPExp))) tally['카탈로그 퇴직연금']++;
  else if (it.clsExp != null && rateOk(CV('clsExp', it.clsExp))) tally['설명서 기재']++;
  else if (pick('clsCExp')) tally['C 대체']++;
  else if (pick('clsAExp')) tally['A 대체']++;
  else tally['없음']++;
});
const n = codes.length;
console.log('IRP 총보수 출처 (' + n + '종목)');
Object.keys(tally).forEach(k => {
  const v = tally[k];
  console.log('  ' + k.padEnd(16) + String(v).padStart(6) + '  ' + Math.round(v/n*100) + '%');
});
