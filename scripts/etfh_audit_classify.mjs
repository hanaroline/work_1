// 분류 점검 — 빌드가 남긴 data/etfh/classify.json 을 읽어 사람이 볼 표를 만든다.
//   node scripts/etfh_build.mjs && node scripts/etfh_audit_classify.mjs
// 결과: tools/discovery/etfh_classify_audit.md
import fs from 'node:fs';

const rows = JSON.parse(fs.readFileSync('data/etfh/classify.json', 'utf8'));
const cnt = (f) => { const c = {}; for (const r of rows) { const k = f(r); c[k] = (c[k] || 0) + 1; } return Object.entries(c).sort((a, b) => b[1] - a[1]); };
const L = [];
const p = (s = '') => L.push(s);
const tbl = (head, data) => { p(`| ${head.join(' | ')} |`); p(`|${head.map(() => '---').join('|')}|`); for (const d of data) p(`| ${d.map((x) => String(x ?? '').replace(/\|/g, '/')).join(' | ')} |`); p(); };

p(`# 분류 점검 (${new Date().toISOString().slice(0, 10)}) — ${rows.length}종목`);
p();
p('## 자산군 × 상장시장');
const mk = ['KR', 'US', 'HK', 'JP', 'SH', 'SZ'];
const assets = [...new Set(rows.map((r) => r.asset))];
tbl(['자산군', ...mk, '계'], assets.map((a) => [a, ...mk.map((m) => rows.filter((r) => r.asset === a && r.mkt === m).length), rows.filter((r) => r.asset === a).length]));
p('## 투자지역 × 상장시장 (자료 값)');
const regions = [...new Set(rows.map((r) => r.region))];
tbl(['지역', ...mk, '계'], regions.map((a) => [a, ...mk.map((m) => rows.filter((r) => r.region === a && r.mkt === m).length), rows.filter((r) => r.region === a).length]));
p('지역을 정한 자료: ' + cnt((r) => r.regionSrc || '없음').map(([k, v]) => `${k} ${v}`).join(' · '));
p();

// 이름으로 본 지역과 자료 지역이 다른 것
const mis = rows.filter((r) => r.nameRegion && !r.nameRegion.includes('+') && r.nameRegion !== r.region);
p(`## 이름으로 본 지역 ≠ 자료 지역 — ${mis.length}종목`);
p('자료 지역이 기준이다. 여기 나온 것은 자료가 틀렸거나(원천 확인), 이름이 투자대상을 다 말하지 않는 경우다.');
p();
tbl(['코드', '이름', '자료 지역', '이름 지역', '자료 출처'], mis.slice(0, 200).map((r) => [r.code, r.name, r.region, r.nameRegion, r.regionSrc]));
const pairs = cnt((r) => (mis.includes(r) ? `${r.region} ← 이름 ${r.nameRegion}` : null)).filter(([k]) => k !== 'null');
p('어긋난 짝 집계: ' + pairs.map(([k, v]) => `${k} ${v}`).join(' · '));
p();

p(`## 레버리지·인버스 — L ${rows.filter((r) => r.li === 'L').length} · I ${rows.filter((r) => r.li === 'I').length}`);
const tab3 = rows.filter((r) => r.raw?.tab === 3 && !r.li);
p(`네이버 '국내 파생' 탭인데 레버리지·인버스로 안 잡힌 것 ${tab3.length}종목 (단순 선물형이면 맞다):`);
p();
tbl(['코드', '이름'], tab3.map((r) => [r.code, r.name]));
const liNot3 = rows.filter((r) => r.mkt === 'KR' && r.li && r.raw?.tab !== 3);
p(`국내 파생 탭 밖인데 레버리지·인버스로 잡힌 것 ${liNot3.length}종목(해외 지수 레버리지 등):`);
p();
tbl(['코드', '이름', 'L/I', '탭'], liNot3.map((r) => [r.code, r.name, r.li, r.raw?.tab]));
tbl(['해외 코드', '이름', 'L/I'], rows.filter((r) => r.mkt !== 'KR' && r.li).map((r) => [r.code, r.name, r.li]));

p('## 테마');
const themed = rows.filter((r) => r.themes.length);
if (!themed.length && !rows.some((r) => r.themes.length)) p('사전(data/etfh/dictionary.json 의 "테마")이 비어 있다 — 받은 파일을 넣으면 여기에 테마별 개수와 테마 안 붙은 종목이 나온다.');
else {
  tbl(['테마', '개수'], cnt((r) => r.themes.join(',') || '(없음)'));
  p(`테마 안 붙은 종목 ${rows.length - themed.length}`);
}
p();
p('## 국내 자산군을 정한 자료 (wisereport 유형 / 네이버 탭·테마)');
tbl(['wisereport 유형', '개수', '→ 자산군'], cnt((r) => (r.mkt === 'KR' ? `${r.raw?.wise || '(없음)'}→${r.asset}` : null)).filter(([k]) => k !== 'null').map(([k, v]) => { const [a, b] = k.split('→'); return [a, v, b]; }));
fs.writeFileSync('tools/discovery/etfh_classify_audit.md', L.join('\n') + '\n');
console.log(`분류 점검 → tools/discovery/etfh_classify_audit.md (지역 어긋남 ${mis.length}, 파생탭 미판정 ${tab3.length})`);
