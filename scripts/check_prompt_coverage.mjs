#!/usr/bin/env node
/**
 * 재현 프롬프트가 화면을 다 말하고 있는가.
 *
 * `etf-prompt.txt` 는 다른 사람이 이 화면을 다시 만들도록 건네는 글이다.
 * 글이 성기면 읽은 사람이 만든 화면은 지금 것과 달라진다. 그래서 화면에서
 * **눈에 보이는 것**을 기계로 뽑아, 프롬프트가 그것을 말하는지 대조한다.
 *
 * 목록을 손으로 적지 않는 것이 요점이다. 내가 기억하는 것을 적으면 내가
 * 프롬프트에 쓴 것과 같아져 검사가 저절로 통과한다. etf.html 에서 뽑아야
 * 화면이 바뀌었을 때 이 검사가 깨진다.
 *
 * 이 검사가 말해 주는 것: 프롬프트에 **빠진 것**이 무엇인가.
 * 말해 주지 못하는 것: 읽은 사람이 같은 코드를 쓸 것인가. 그건 사람이 만들어
 * 봐야 안다.
 *
 *   node scripts/check_prompt_coverage.mjs
 */
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../etf.html', import.meta.url), 'utf8');
// 어느 판을 재는지 인자로 받는다. 줄인 판과 원래 판을 나란히 재 보려면
// 두 파일을 번갈아 가리킬 수 있어야 한다.
const promptPath = process.argv[2]
  ? new URL(process.argv[2], `file://${process.cwd()}/`)
  : new URL('../etf-prompt.txt', import.meta.url);
const prompt = readFileSync(promptPath, 'utf8');

/* ── 대조용 정규화 ──────────────────────────────────────────────────────
   프롬프트는 산문이라 화면 라벨과 띄어쓰기·가운뎃점이 어긋난다.
   "비교 · 중복도" 와 "비교·중복도" 가 다른 것으로 잡히면 검사가 잡음이 된다.
   공백을 지우고 구분점을 하나로 맞춘다. */
const norm = (s) =>
  String(s)
    .replace(/&nbsp;/g, ' ')
    .replace(/[·‧•]/g, '·')
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, '')
    .replace(/·/g, '');

const PROMPT = norm(prompt);
const has = (s) => PROMPT.includes(norm(s));

/* ── 화면에서 뽑아내기 ────────────────────────────────────────────────── */
const all = (re, pick = 1) => {
  const out = [];
  let m;
  const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  while ((m = rx.exec(html))) out.push(m[pick]);
  return out;
};

// 탭 이름
const tabs = all(/role="tab"[^>]*data-ko="([^"]+)"/);

// 필터 드롭다운 라벨 — .finder-filters 안쪽만
const filterBlock = (html.match(/<div class="finder-filters">([\s\S]*?)<\/div>\s*\n\s*<div class="finder-bar">/) || [])[1] || '';
const filters = [...filterBlock.matchAll(/<span data-ko="([^"]+)"/g)].map((m) => m[1]);

// 목록 표의 열
const colBlock = (html.match(/var COLUMNS = \[([\s\S]*?)\];/) || [])[1] || '';
const columns = [...colBlock.matchAll(/\[\s*'[^']+',\s*\['([^']+)'/g)].map((m) => m[1]);

// 수익률 기간
const perBlock = (html.match(/var PERIODS = \[([\s\S]*?)\];/) || [])[1] || '';
const periods = [...perBlock.matchAll(/\['[A-Z0-9]+',\s*'([^']+)'/g)].map((m) => m[1]);

// 설정액 구간
const aumBlock = (html.match(/var AUM_BUCKETS = \[([\s\S]*?)\];/) || [])[1] || '';
const aumBuckets = [...aumBlock.matchAll(/\['([^']+)',\s*'[^']*'\]/g)].map((m) => m[1]);

// 각 탭의 큰 제목
const titles = all(/class="section-title" data-ko="([^"]+)"/);

// 상세에 뜨는 항목 이름
const detailKeys = [...html.matchAll(/kvt?\(lang === 'ko' \? '([^']+)'/g)].map((m) => m[1]);

// 순위표 제목
const rankTitles = [...html.matchAll(/rankTable\(\s*\(?lang === 'ko' \? (?:periodLabel \+ )?'([^']+)'/g)].map((m) => m[1]);

// 체크박스 기본값
const defaults = [
  ['레버리지·인버스 기본 꺼짐', /id="f-lev"(?![^>]*checked)/.test(html)],
  ['편입종목 있는 것만 기본 켜짐', /id="f-hold" checked/.test(html)],
];

// 색과 글꼴
const orange = (html.match(/--orange:(#[0-9A-Fa-f]{6})/) || [])[1];
const blue = (html.match(/--blue:(#[0-9A-Fa-f]{6})/) || [])[1];
const fonts = [...(html.match(/--font-kr:([^;]+);/) || [])[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

// 비교함 최대 개수
const maxCompare = (html.match(/MAX_COMPARE\s*=\s*(\d+)/) || [])[1];

// 화면에 실제로 뜨는 안내 문구 가운데, 빠지면 화면이 달라지는 것들
const notices = ['편입종목 미제공', '펀드 전체 기준', '예시 데이터', '더 보기', '조건 초기화'];

/* ── 대조 ──────────────────────────────────────────────────────────── */
const groups = [
  ['탭 이름', tabs],
  ['필터 라벨', filters],
  ['목록 표의 열', columns],
  ['수익률 기간', periods],
  ['설정액 구간', aumBuckets],
  ['화면 제목', titles],
  ['상세 항목', detailKeys],
  ['순위표', rankTitles],
  ['화면 문구', notices],
  ['색·글꼴', [orange, blue, ...fonts]],
  ['비교함 최대', [maxCompare]],
];

let checked = 0;
let missed = 0;
const gaps = [];

console.log('화면에서 뽑은 것을 프롬프트와 대조한다\n');
for (const [name, items] of groups) {
  const uniq = [...new Set(items.filter(Boolean))];
  const miss = uniq.filter((x) => !has(x));
  checked += uniq.length;
  missed += miss.length;
  const mark = miss.length ? '✗' : '✓';
  console.log(`${mark} ${name.padEnd(14)} ${uniq.length - miss.length}/${uniq.length}`);
  for (const m of miss) {
    gaps.push(`${name}: ${m}`);
    console.log(`    빠짐 → ${m}`);
  }
}

/* ── 동작 규칙 ──────────────────────────────────────────────────────────
   라벨이 다 맞아도 동작이 다르면 화면은 여전히 달라진다. 화면 쪽 정규식은
   그 규칙이 **지금도 사실인지** 확인하고(화면이 바뀌면 이 검사가 깨진다),
   프롬프트 쪽 정규식은 그것을 **말하고 있는지** 본다. */
const RULES = [
  ['목록 첫 쪽 60개', /limit: 60,/, /60개씩|한 번에 60|60개 보여/],
  ['순위표 15개', /slice\(0, 15\)/, /15\s*(개|위)|상위 15|15개씩/],
  ['역조회 빈 화면 30개', /\.slice\(0, 30\)/, /30개/],
  ['역조회 결과 상한 200', /hits\.slice\(0, 200\)/, /200개/],
  ['인쇄에서 숨은 탭 감춤', /\.section\[hidden\]\{display:none !important;\}/, /숨은 건 인쇄에서도|숨어 있는 탭[\s\S]{0,80}인쇄/],
  ['정지 종목 순위 제외', /if \(e\.suspended\) return false;/, /거래 정지[\s\S]{0,60}순위/],
  ['잣대 다른 설정액 순위 제외', /aumScope !== 'etf'/, /펀드 전체를 센[\s\S]{0,120}순위에서 빼/],
  ['비중 모르면 겹침 비율 비움', /weightsKnown !== false/, /비중을 모르면[\s\S]{0,80}(비율은 비워|개수만)/],
  ['비중 모르면 막대 안 그림', /h\.weight != null && top > 0/, /비중을 모르는[\s\S]{0,60}막대를 아예 그리지/],
];

for (const [label, inPage, inPrompt] of RULES) {
  checked += 1;
  if (!inPage.test(html)) throw new Error(`화면에서 이 규칙이 사라졌다: ${label}`);
  if (inPrompt.test(prompt)) {
    console.log(`✓ 동작           ${label}`);
  } else {
    missed += 1;
    gaps.push(`동작: ${label}`);
    console.log(`✗ 동작           빠짐 → ${label}`);
  }
}

for (const [label, ok] of defaults) {
  checked += 1;
  // 화면의 기본값이 프롬프트에도 기본값으로 적혀 있는지는 문장으로 봐야 한다.
  const said = label.includes('레버리지')
    ? /레버리지[^\n]*기본으로 꺼|기본으로 꺼[^\n]*레버리지/.test(prompt)
    : /편입종목 있는 것만[^\n]*기본으로 켜/.test(prompt);
  if (!ok) throw new Error(`화면 기본값이 바뀌었다: ${label}`);
  if (!said) {
    missed += 1;
    gaps.push(`기본값: ${label}`);
    console.log(`✗ 기본값         빠짐 → ${label}`);
  } else {
    console.log(`✓ 기본값         ${label}`);
  }
}

console.log(`\n${checked - missed}/${checked} 항목이 프롬프트에 있다.`);
if (missed) {
  console.log(`\n${missed}개가 빠졌다. 이대로 건네면 그 부분은 다르게 나온다:`);
  gaps.forEach((g) => console.log(`  · ${g}`));
  process.exit(1);
}
console.log('빠진 것 없음.');
