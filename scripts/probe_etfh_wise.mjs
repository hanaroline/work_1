// 탐침 2 — 네이버가 비중을 "-" 로 주는 국내 ETF(해외 종목을 담은 것)에
// wisereport(네이버 종목분석이 쓰는 곳)가 비중을 주는지. 결과: tools/discovery/etfh_wise_probe.{json,md}
import fs from 'node:fs';
import { get, sleep } from './etfh_lib.mjs';

// 해외주식 · 해외채권 · 국내채권 · 금 · 커버드콜 · 리츠 · 혼합 · 국내주식(대조)
const CODES = ['360750', '133690', '381170', '453850', '148070', '132030', '441640', '329200', '448330', '458730', '069500'];
const out = [];
for (const code of CODES) {
  const rec = { code };
  try {
    const r = await get(`https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd=${code}`);
    rec.status = r.status;
    const t = r.text;
    const sm = t.match(/var summary_data = (\{.*?\});/);
    rec.summary = sm ? JSON.parse(sm[1]) : null;
    // ETF_WEIGHT 가 든 배열 변수를 모두 찾는다
    rec.vars = [];
    for (const m of t.matchAll(/var (\w+)\s*=\s*(\[.*?\]|\{.*?\});\s*$/gms)) {
      if (!/ETF_WEIGHT|STK_NM/.test(m[2])) continue;
      let v = null; try { v = JSON.parse(m[2]); } catch { /* */ }
      rec.vars.push({ name: m[1], len: Array.isArray(v) ? v.length : null, sample: Array.isArray(v) ? v.slice(0, 12) : String(m[2]).slice(0, 800) });
    }
    if (!rec.vars.length) rec.weightContext = (t.match(/.{0,300}ETF_WEIGHT.{0,300}/s) || [null])[0];
  } catch (e) { rec.error = String(e.message || e); }
  out.push(rec);
  console.log(code, rec.status, rec.vars?.map((v) => `${v.name}:${v.len}`).join(','));
  await sleep(700);
}
fs.mkdirSync('tools/discovery', { recursive: true });
fs.writeFileSync('tools/discovery/etfh_wise_probe.json', JSON.stringify(out, null, 1));
const md = ['# wisereport 편입비중 탐침', '', '| 코드 | 이름 | 유형 | 변수 | 비중 예 |', '|---|---|---|---|---|'];
for (const r of out) {
  const v = r.vars?.[0];
  const ex = v && Array.isArray(v.sample) ? v.sample.slice(0, 3).map((x) => JSON.stringify(x)).join(' ').slice(0, 300) : (r.error || r.weightContext || '').slice(0, 200);
  md.push(`| ${r.code} | ${r.summary?.CMP_KOR || ''} | ${r.summary?.ETF_TYP_SVC_NM || ''} | ${(r.vars || []).map((x) => `${x.name}(${x.len})`).join(' ')} | ${ex.replace(/\|/g, '/')} |`);
}
fs.writeFileSync('tools/discovery/etfh_wise_probe.md', md.join('\n') + '\n');
