/**
 * 이미 판독된 위험 항목에서 표 행 번호를 떼어 낸다 (한 번 쓰는 보수 도구).
 *
 * 위험표 맨 왼쪽에 행 번호 칸을 둔 설명서가 있다. 그 칸이 「1」 처럼 숫자만
 * 있는 줄로 떨어져 나와 위험 이름 앞에 붙었고, 창구에서
 * 「1 시장위험 및 개별위험 — …」 을 그대로 읽게 됐다.
 *
 * 규칙(js/sales-script-prospectus.js 의 riskItems)은 고쳤다. 다만 규칙을 고치면
 * 지문(rulesStamp)이 바뀌어 3,019종목을 처음부터 다시 읽어야 하고 70분이 걸린다.
 * 값 자체는 앞머리의 번호만 떼면 고친 규칙의 결과와 같으므로, 이미 받아 둔
 * 판독 결과를 그 자리에서 고쳐 쓴다. 다음 정기 판독이 원문에서 같은 값을
 * 다시 만들어 낼 것이므로 이 도구는 그때까지의 다리 역할만 한다.
 *
 * 값 문구는 pool 에 한 번만 담고 여러 종목이 번호로 공유한다. 그래서 pool 의
 * 문구를 그 자리에서 바꾸면 그 문구를 쓰는 다른 항목까지 함께 바뀐다.
 * 고친 문구를 pool 뒤에 새로 담고 risk1·risk2 만 그쪽을 가리키게 한다.
 *
 *   node scripts/fix_risk_rownum.mjs data/fund-prospectus.js FUND_PROSPECTUS
 *   node scripts/fix_risk_rownum.mjs data/fund-prospectus-kofia.js FUND_PROSPECTUS_KOFIA
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [file, key] = process.argv.slice(2);
if (!file || !key) {
  console.error('쓰임: node scripts/fix_risk_rownum.mjs <파일> <전역이름>');
  process.exit(2);
}

const src = readFileSync(file, 'utf8');
const g = {};
new Function('window', src)(g);
const P = g[key];
if (!P || !P.items || !P.pool) {
  console.error(file + ' 에서 ' + key + '.items / .pool 을 찾지 못했습니다');
  process.exit(1);
}

/** 「1 시장위험 …」 처럼 이름 앞에 붙은 표 행 번호 */
const ROWNUM = /^\s*\d{1,2}\s+(?=\S)/;

const pool = P.pool.slice();
const at = new Map(pool.map((s, i) => [s, i]));
const intern = (s) => {
  if (at.has(s)) return at.get(s);
  at.set(s, pool.length);
  pool.push(s);
  return pool.length - 1;
};

let fixed = 0, looked = 0;
const samples = [];
for (const code of Object.keys(P.items)) {
  const it = P.items[code];
  for (const f of ['risk1', 'risk2']) {
    if (it[f] == null) continue;
    looked++;
    const was = String(pool[it[f]]);
    if (!ROWNUM.test(was)) continue;
    const now = was.replace(ROWNUM, '');
    it[f] = intern(now);
    fixed++;
    if (samples.length < 3) samples.push(code + ' ' + f + ' : ' + was.slice(0, 44) + ' → ' + now.slice(0, 40));
  }
}
P.pool = pool;

/* 남은 것이 없어야 한다 */
let left = 0;
for (const code of Object.keys(P.items)) {
  for (const f of ['risk1', 'risk2']) {
    if (P.items[code][f] != null && ROWNUM.test(String(P.pool[P.items[code][f]]))) left++;
  }
}

const head = src.slice(0, src.indexOf('window.' + key));
writeFileSync(file, head + 'window.' + key + ' = ' + JSON.stringify(P) + ';\n');

console.log(file);
console.log('  위험 항목 ' + looked + '건 중 ' + fixed + '건에서 행 번호를 뗐습니다 (' +
  (100 * fixed / looked).toFixed(1) + '%)');
samples.forEach((s) => console.log('    ' + s));
console.log('  남은 것 ' + left + '건' + (left ? ' ← 확인이 필요합니다' : ''));
console.log('  문구 풀 ' + P.pool.length + '개');
process.exit(left ? 1 : 0);
