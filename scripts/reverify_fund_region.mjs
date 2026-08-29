#!/usr/bin/env node
/**
 * 재검증 L3-b — **투자지역**을 1차 출처와 전수에 가깝게 대조한다.
 *
 *   node scripts/reverify_fund_region.mjs [표본수]
 *   -> tools/discovery/fund_reverify_region.{json,md}
 *
 * ── 왜 이 한 필드만 따로 보나 ───────────────────────────────────────────────
 *
 * 이 화면의 **주축**이기 때문이다. 사용자가 정한 범위가 "국내에 설정된
 * 공모펀드를 투자 지역으로 가른다" 였고, 화면의 첫 필터가 투자지역이다.
 * 이 한 칸이 틀리면 화면이 하는 일 자체가 틀린다.
 *
 * 그런데 1차 출처 대조(12종목)에서 하나가 어긋났다.
 *
 *   미래에셋평생소득TIF혼합자산자투자신탁
 *     내 자료  해외      (유형명 "해외혼합형" 의 앞머리에서 읽음)
 *     금투협   혼합
 *
 * 네이버 유형명의 "혼합" 은 **자산**(주식+채권)을 뜻하는데, 금투협은
 * **투자지역** 자체를 국내/해외/혼합 셋으로 나눈다. 곧 네이버 유형명에서
 * 지역을 읽는 내 방식은 "지역이 혼합인 펀드" 를 표현할 수 없다.
 *
 * 12종목 중 1건이면 8%다. 3,196개에 그 비율이면 250개가 넘는다.
 * **짐작하지 말고 세어야 한다.**
 *
 * ── 세어 본 결과와 그 뒤 ────────────────────────────────────────────────────
 *
 * 표본 318개에서 34개(10.7%)가 어긋났고, 내 자료가 "미상" 인 것이 36개였다.
 * 그래서 **투자지역을 금투협에서 직접 받도록 고쳤다**
 * (scripts/collect_fund_region.mjs). 전수에서 315개가 실제로 달랐고
 * 344개의 빈칸이 채워졌다 — 합쳐서 3,196개 중 659개(20.6%)다.
 *
 * 이 검산은 그 뒤로도 남겨 둔다. 고친 뒤에는 **0 이 나와야** 하고,
 * 0 이 아니면 1차 출처 수집이 새고 있다는 뜻이다.
 *
 * ── 빠르게 세는 법 ──────────────────────────────────────────────────────────
 *
 * 브라우저로 한 종목씩 열면 5초씩 걸려 전수가 안 된다. 그래서 브라우저로
 * **한 번만** 열어 조회 POST 의 실제 본문을 잡고, 그 본문의 표준코드만 갈아
 * 끼워 그대로 다시 부른다. 계약을 추측하지 않고 관찰한 것을 쓴다.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_reverify_region.json';
const OUT_MD = 'tools/discovery/fund_reverify_region.md';
const N = Number(process.argv[2]) || 300;

const out = { at: new Date().toISOString(), rows: [], errors: [] };
async function save() {
  await mkdir('tools/discovery', { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(out, null, 2));
}
process.on('unhandledRejection', async (e) => {
  out.errors.push(`unhandledRejection: ${String(e?.message || e)}`);
  await save();
  console.error('[region] 중단:', e?.message || e);
  process.exit(1);
});

const src = await readFile('data/fund.js', 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FUNDS = DATA.funds || [];
out.dataUpdatedAt = DATA.updatedAt;

// ── 1. 브라우저로 조회 POST 의 실제 본문을 잡는다 ───────────────────────────
console.log('=== 1. 조회 계약 관찰 ===');
const seed = FUNDS.find((f) => f.type === '해외혼합형') || FUNDS[0];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  locale: 'ko-KR',
});
const page = await ctx.newPage();
const captured = [];
page.on('request', (r) => {
  if (r.method() !== 'POST') return;
  if (!r.url().includes('/proframeWeb/XMLSERVICES/')) return;
  const body = r.postData() || '';
  if (body.includes(seed.code)) captured.push(body);
});
await page.goto(
  'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml' +
  `&companyCd=&standardCd=${encodeURIComponent(seed.code)}&standardDt=&grntGb=`,
  { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(6000);
const seedText = await page.evaluate(() => document.body?.innerText || '');
await page.close();
await ctx.close();
await browser.close();

// 투자지역이 들어 있는 응답을 내는 POST 를 고른다.
const template = captured.find((b) => b.includes('fundBasInfoSrch'))
              || captured.find((b) => b.includes('COMFundUnityBasInfoSO'))
              || captured[0];
out.capturedCount = captured.length;
out.template = template ? template.slice(0, 900) : null;
console.log(`  표준코드가 들어간 POST ${captured.length}건`);
if (!template) {
  out.errors.push('조회 POST 본문을 잡지 못했다');
  console.log('  본문을 못 잡음 — 대조 불가');
  await save();
  process.exit(1);
}
console.log(`  본문 확보 (${template.length}자)`);

// 씨앗 펀드의 화면 글자에서 투자지역이 어떻게 나오는지 확인해 둔다.
const seedRegion = (seedText.match(/투자지역\s*\n+\s*\n*\s*([가-힣]+)/) || [])[1] || null;
console.log(`  씨앗 ${seed.code} (${seed.type}) → 금투협 투자지역 "${seedRegion}"`);

// ── 2. 본문을 갈아 끼워 그대로 다시 부른다 ──────────────────────────────────
async function fetchRegion(code) {
  const body = template.split(seed.code).join(code);
  const res = await fetch('https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      Accept: 'application/xml, text/xml, */*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Origin: 'https://dis.kofia.or.kr',
      Referer: 'https://dis.kofia.or.kr/websquare/index.jsp',
    },
    body,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  // 투자지역구분 / 투자지역 이 담긴 태그를 찾는다. 이름을 모르니 값으로 찾는다.
  const tag = (name) => {
    const m = xml.match(new RegExp(`<${name}>\\s*([^<]*)\\s*</${name}>`));
    return m ? m[1].trim() : null;
  };
  // 후보 태그를 훑는다.
  let region = null;
  for (const t of ['vInvRgnNm', 'investRegionNm', 'invRgnNm', 'vInvestRegion',
                   'vInvstRgnNm', 'investmentArea', 'vInvAreaNm']) {
    const v = tag(t);
    if (v) { region = v; break; }
  }
  if (!region) {
    // 태그 이름을 모르면 국내/해외/혼합 을 값으로 갖는 태그를 찾는다.
    const m = xml.match(/<([A-Za-z][\w]*)>\s*(국내|해외|혼합)\s*<\/\1>/);
    if (m) { region = m[2]; out.regionTag = out.regionTag || m[1]; }
  }
  return { region, xmlHead: xml.slice(0, 400) };
}

// 계약이 실제로 도는지 씨앗으로 먼저 확인한다.
console.log('\n=== 2. 재생 확인 ===');
let replayWorks = false;
try {
  const r = await fetchRegion(seed.code);
  replayWorks = !!r.region;
  console.log(`  씨앗 재생 → 투자지역 "${r.region}" ${replayWorks ? '✓' : '✗'}`);
  if (!replayWorks) out.errors.push(`재생 응답에서 투자지역을 못 찾음: ${r.xmlHead}`);
} catch (e) {
  out.errors.push(`재생 실패: ${e.message}`);
  console.log(`  재생 실패: ${e.message}`);
}
if (!replayWorks) {
  out.verdict = '조회 POST 재생에 실패 — 투자지역 전수 대조 불가';
  console.log(`\n판정: ${out.verdict}`);
  await save();
  const md = ['# 재검증 L3-b — 투자지역 대조 (실패)', '', `검증 시각: ${out.at}`, '',
    `**${out.verdict}**`, '', '브라우저로 잡은 조회 POST 를 그대로 재생하지 못했습니다.',
    '세션·토큰이 필요한 것으로 보입니다. 브라우저로 한 종목씩 여는 방법은 되지만',
    '전수에는 너무 느립니다.', '',
    '## 확인된 것', '',
    `- 씨앗 ${seed.code} (${seed.type}) 의 금투협 투자지역: **${seedRegion ?? '못 읽음'}**`, ''];
  if (out.errors.length) { md.push('## 오류', ''); for (const e of out.errors) md.push(`- ${e}`); }
  await writeFile(OUT_MD, md.join('\n'));
  process.exit(0);
}

// ── 3. 표본을 훑는다 ────────────────────────────────────────────────────────
// 유형이 골고루 섞이게 고른다. 특히 "혼합" 이 들어간 유형을 넉넉히 본다 —
// 어긋남이 거기서 났기 때문이다.
console.log('\n=== 3. 표본 대조 ===');
const byType = new Map();
for (const f of FUNDS) {
  const k = f.type || '(미상)';
  if (!byType.has(k)) byType.set(k, []);
  byType.get(k).push(f);
}
const pick = [];
for (const [type, list] of byType) {
  // 유형마다 개수 비례로 뽑되 최소 12개는 본다.
  const want = Math.max(12, Math.round(N * (list.length / FUNDS.length)));
  const step = Math.max(1, Math.floor(list.length / want));
  list.filter((_, i) => i % step === 0).slice(0, want).forEach((f) => pick.push(f));
}
console.log(`  표본 ${pick.length}개 (유형 ${byType.size}종)`);
out.sampleSize = pick.length;

// 셋 다 적는다. **'혼합' 을 빠뜨렸다가 검증에 구멍이 났다** — 지역이 혼합인
// 369개가 mine=null 이 되어 "내 자료가 미상" 으로 세어지고 대조에서 통째로
// 빠졌다. 하필 혼합은 옛 방식이 표현하지 못하던 값이라 **가장 봐야 할 것이
// 안 보이고 있었다.** 대조가 건너뛴 것을 일치로 세면 안 된다.
const MAP = { domestic: '국내', overseas: '해외', mixed: '혼합' };
let done = 0;
for (const f of pick) {
  const row = { code: f.code, name: f.name, type: f.type,
                mine: MAP[f.region] ?? null };
  try {
    const r = await fetchRegion(f.code);
    row.kofia = r.region;
    row.ok = row.mine && r.region ? row.mine === r.region : null;
  } catch (e) {
    row.error = String(e.message || e).slice(0, 80);
  }
  out.rows.push(row);
  done += 1;
  if (done % 40 === 0) { console.log(`  ${done}/${pick.length}`); await save(); }
  await new Promise((r) => setTimeout(r, 120));
}

// ── 집계 ────────────────────────────────────────────────────────────────────
const got = out.rows.filter((r) => r.kofia);
const same = got.filter((r) => r.ok === true);
const diff = got.filter((r) => r.ok === false);
const mineNull = got.filter((r) => r.mine == null);

// 유형별로 어긋남이 어디에 몰리는지 본다.
const byTypeStat = {};
for (const r of got) {
  const k = r.type || '(미상)';
  byTypeStat[k] = byTypeStat[k] || { n: 0, same: 0, diff: 0, mineNull: 0, kofia: {} };
  const s = byTypeStat[k];
  s.n += 1;
  if (r.ok === true) s.same += 1;
  else if (r.ok === false) s.diff += 1;
  if (r.mine == null) s.mineNull += 1;
  s.kofia[r.kofia] = (s.kofia[r.kofia] || 0) + 1;
}
out.byType = byTypeStat;
out.summary = {
  asked: pick.length, answered: got.length,
  same: same.length, diff: diff.length, mineUnknown: mineNull.length,
  diffRate: got.length ? +(diff.length / got.length * 100).toFixed(1) : null,
};

console.log(`\n=== 판정 ===`);
console.log(`  물어본 것 ${pick.length} · 답이 온 것 ${got.length}`);
console.log(`  일치 ${same.length} · **불일치 ${diff.length}** · 내 자료가 미상 ${mineNull.length}`);
console.log('\n  유형별 (표본 / 일치 / 불일치 / 내가 미상)  · 금투협 분포');
for (const [k, v] of Object.entries(byTypeStat).sort((a, b) => b[1].diff - a[1].diff)) {
  console.log(`  ${k.padEnd(10)} ${String(v.n).padStart(4)} / ${String(v.same).padStart(4)} / ` +
    `${String(v.diff).padStart(4)} / ${String(v.mineNull).padStart(4)}   ${JSON.stringify(v.kofia)}`);
}
if (diff.length) {
  console.log('\n  불일치 예:');
  for (const r of diff.slice(0, 10)) {
    console.log(`    ${r.code} ${(r.name || '').slice(0, 26).padEnd(28)} ${r.type} · 내 자료 ${r.mine} vs 금투협 ${r.kofia}`);
  }
}

const rate = out.summary.diffRate;
// 대조하지 못한 것이 있으면 판정문에 그대로 적는다. "전부 일치" 라는 말이
// "빼고 남은 것끼리 일치" 를 덮으면 안 된다.
const skipped = mineNull.length;
const compared = same.length + diff.length;
out.verdict = diff.length === 0
  ? (skipped
      ? `대조한 ${compared}개는 1차 출처와 일치 · 대조 못 한 것 ${skipped}개(내 자료에 지역 없음)`
      : `투자지역 ${got.length}개 전부 1차 출처와 일치`)
  : `투자지역 불일치 ${diff.length}/${compared} (${rate}%) — 전체 3,196개로 환산하면 약 ${Math.round(FUNDS.length * diff.length / compared)}개`;
console.log(`\n판정: ${out.verdict}`);
await save();

// ── 기록 ────────────────────────────────────────────────────────────────────
const md = ['# 재검증 L3-b — 투자지역을 1차 출처와 대조한다', '', `검증 시각: ${out.at}`,
  `내 자료 기준: ${out.dataUpdatedAt}`, '', `**${out.verdict}**`, '',
  '이 화면의 **주축**입니다. 사용자가 정한 범위가 "국내에 설정된 공모펀드를 투자',
  '지역으로 가른다" 였고 화면의 첫 필터가 투자지역입니다. 이 한 칸이 틀리면 화면이',
  '하는 일 자체가 틀립니다.', '',
  '한때 이 값을 네이버 유형명의 앞머리(국내/해외)에서 읽었습니다. 금투협은 투자지역을',
  '**국내·해외·혼합** 셋으로 따로 분류하고, 네이버 유형명의 "혼합" 은 **자산**(주식+채권)을',
  '뜻합니다. 곧 유형명에서 읽는 방식은 "지역이 혼합인 펀드" 를 표현할 수 없었습니다.',
  '이 검증이 그것을 잡아내서(표본 318개 중 34개, 10.7%) 지금은 금투협에서 직접 받습니다.', '',
  '**그래서 이 검증은 고친 뒤에도 남겨 둡니다.** 이제는 0 이 나와야 하고, 0 이 아니면',
  '1차 출처 수집이 새고 있다는 뜻입니다.', '',
  '## 결과', '', '| 항목 | 수 |', '|---|---:|',
  `| 물어본 펀드 | ${out.summary.asked} |`,
  `| 답이 온 펀드 | ${out.summary.answered} |`,
  `| 대조한 펀드 | ${compared} |`,
  `| 일치 | ${out.summary.same} |`,
  `| **불일치** | **${out.summary.diff}** (${rate}%) |`,
  `| 대조 못 함 (내 자료에 지역 없음) | ${out.summary.mineUnknown} |`, '',
  '## 유형별', '',
  '| 유형 | 표본 | 일치 | 불일치 | 대조 못 함 | 금투협 분포 |',
  '|---|---:|---:|---:|---:|---|'];
for (const [k, v] of Object.entries(byTypeStat).sort((a, b) => b[1].diff - a[1].diff)) {
  md.push(`| ${k} | ${v.n} | ${v.same} | ${v.diff} | ${v.mineNull} | ${JSON.stringify(v.kofia)} |`);
}
if (diff.length) {
  md.push('', '## 불일치', '', '| 표준코드 | 펀드 | 유형 | 내 자료 | 금투협 |', '|---|---|---|---|---|');
  for (const r of diff.slice(0, 200)) {
    md.push(`| ${r.code} | ${(r.name || '').slice(0, 28)} | ${r.type} | ${r.mine} | ${r.kofia} |`);
  }
}
md.push('', '## 뜻', '');
if (diff.length) {
  md.push(`표본에서 ${rate}% 가 어긋났습니다. 3,196개로 환산하면 약 ` +
    `**${Math.round(FUNDS.length * diff.length / got.length)}개**입니다.`, '',
    '화면은 이 펀드들을 "해외 투자" 또는 "국내 투자" 로 단정하는데, 1차 출처는',
    '"혼합" 이라고 말합니다. **투자 지역으로 가르는 것이 이 화면의 목적**이므로',
    '가볍게 볼 수 없습니다.', '',
    '고치는 길은 하나뿐입니다 — 투자지역을 네이버 유형명에서 읽지 말고',
    '**금투협에서 직접 받아** 싣는 것입니다. 그러면 "혼합" 이라는 셋째 값도',
    '표현할 수 있고, 지금 "미상" 인 MMF·기타형 344개도 채워집니다.', '');
} else if (skipped) {
  md.push(`대조한 ${compared}개는 모두 맞았습니다. 다만 **${skipped}개는 대조하지 못했습니다** —`,
    '내 자료에 투자지역이 비어 있어 맞댈 것이 없었습니다. 이것은 "맞았다" 가 아니라',
    '"확인하지 못했다" 입니다. 1차 출처 수집이 그만큼 새고 있다는 뜻이므로,',
    '`collect_fund_region.mjs` 의 실패 목록부터 봐야 합니다.', '');
} else {
  md.push(`표본 ${compared}개를 빠짐없이 대조했고 어긋남이 없었습니다.`, '');
}
if (out.errors.length) {
  md.push('## 오류', '');
  for (const e of out.errors.slice(0, 20)) md.push(`- ${e}`);
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[region] ${OUT_MD} · ${OUT_JSON} 기록`);
