// 실제 화면을 찍어 넣은 사용법 문서를 만든다.
//
//   node scripts/build_fund_howto.mjs [--built]
//
// 왜 글만으로는 모자라나 —
// 화면 안의 사용법 탭은 "무엇을 어떻게 읽나" 를 글로 적는다. 그것만으로는
// 처음 여는 사람이 **어느 칸이 그 칸인지**를 못 찾는다. "왼쪽 맨 앞 ⊕" 라고
// 적어도, 표를 처음 보는 사람에게는 ⊕ 가 어디 있는지가 안 보인다. 그래서
// 화면을 실제로 찍어 그 옆에 설명을 붙인다.
//
// 찍는 방식 —
// 그림을 그리지 않는다. **살아 있는 화면을 그대로 몰아서** 찍는다. 검색어를
// 치고, 필터를 고르고, 줄을 누르고, 비교함에 담는다. 그래야 문서의 그림과
// 사람이 여는 화면이 어긋나지 않는다. 손으로 만든 예시 그림은 화면이 바뀌는
// 날 조용히 거짓이 된다.
//
// 수 —
// 문서에 찍히는 수는 전부 화면에서 읽는다. 글로 박지 않는다. 화면이 세는
// 표시(HELP_STAMP)를 같이 적어 두고, 화면은 자기가 지금 센 수와 다르면
// 내려받기 단추를 감춘다.
//
// 나오는 자리 —
//   tools/discovery/fund_help.pdf  — 완성된 PDF
//   tools/discovery/fund_howto.html — 같은 내용의 HTML(그림 포함, 한 파일)
//   data/fund-help-pdf.js          — 화면에 실어 넣을 base64
// **데이터 빌드 뒤·단일 파일 빌드 앞**에 돌아야 한다.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const SRC = process.argv.includes('--built') ? '/fund-search.html' : '/fund.html';
const PDF_OUT = 'tools/discovery/fund_help.pdf';
const HTML_OUT = 'tools/discovery/fund_howto.html';
const JS_OUT = 'data/fund-help-pdf.js';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
// 폭을 좁게 잡는다. 1280 으로 찍으면 A4 폭에 맞추느라 글자가 깨알이 된다.
// deviceScaleFactor 2 로 찍어야 축소해도 글자가 뭉개지지 않는다.
const page = await browser.newPage({
  viewport: { width: 1100, height: 1500 },
  deviceScaleFactor: 2,
});

const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base + SRC, { waitUntil: 'networkidle' });

// ── 찍기 도우미.
//
// 요소를 통째로 찍되 너무 길면 위에서 잘라 낸다. 표 스무 줄을 다 실으면
// 한 쪽이 표 하나로 차 버리고, 정작 설명이 밀린다. 자른 것은 자른 티가
// 나도록 아래에 옅은 띠를 남긴다.
// 요소의 **머리가 화면 맨 위에 오도록** 굴린다. scrollIntoViewIfNeeded 는
// "보이기만 하면" 가만히 있어서, 표가 화면보다 길면 머리글이 화면 위로 밀린
// 채로 남는다. 그러면 clip 이 0 부터 시작해 머리글 없는 표가 찍히고, 그림만
// 봐서는 어느 열이 무슨 열인지 알 수 없게 된다.
async function toTop(loc) {
  await loc.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await page.evaluate(() => window.scrollBy(0, -16));
}

async function shot(sel, opts = {}) {
  const loc = page.locator(sel).first();
  await toTop(loc);
  await page.waitForTimeout(120);
  const box = await loc.boundingBox();
  if (!box) throw new Error(`요소를 못 찾았다: ${sel}`);
  const vh = page.viewportSize().height;
  const top = Math.max(box.y, 0);
  const height = Math.min(box.height - (top - box.y), opts.maxH || 1e5, vh - top);
  if (height < 20) throw new Error(`잘린 높이가 너무 작다: ${sel} (${height})`);
  const buf = await page.screenshot({
    clip: { x: Math.max(box.x, 0), y: top, width: Math.min(box.width, 1100), height },
  });
  return {
    src: 'data:image/png;base64,' + buf.toString('base64'),
    cut: box.height > height + 2,
  };
}

// 여러 요소를 위에서 아래로 한 장에 담는다(예: 검색창부터 목록 몇 줄까지).
async function shotRange(fromSel, toSel, opts = {}) {
  const a = page.locator(fromSel).first();
  const b = page.locator(toSel).first();
  await toTop(a);
  await page.waitForTimeout(120);
  const ba = await a.boundingBox();
  const bb = await b.boundingBox();
  if (!ba || !bb) throw new Error(`구간을 못 잡았다: ${fromSel} → ${toSel}`);
  const vh = page.viewportSize().height;
  const top = Math.max(ba.y, 0);
  const wanted = bb.y + bb.height - top;
  const height = Math.min(wanted, opts.maxH || 1e5, vh - top);
  if (height < 20) throw new Error(`구간 높이가 너무 작다: ${fromSel}`);
  const x = Math.max(Math.min(ba.x, bb.x), 0);
  const buf = await page.screenshot({
    clip: { x, y: top, width: Math.min(Math.max(ba.width, bb.width), 1100), height },
  });
  return { src: 'data:image/png;base64,' + buf.toString('base64'), cut: wanted > height + 2 };
}

async function tab(name) {
  await page.click(`.tabs button[data-tab="${name}"]`);
  await page.waitForTimeout(250);
}

// ── 화면이 지금 세고 있는 수. 지어내지 않고 화면에서 읽는다.
//
// 사용법 탭을 먼저 연다. HELP_STAMP 는 사용법을 그릴 때 매겨지므로, 열지
// 않고 읽으면 빈 문자열이 나온다 — 그러면 이 문서는 "무엇을 근거로 만든
// 문서인지" 를 잃고, 화면은 낡음 여부를 판정하지 못한다.
await tab('help');
const raw = await page.evaluate(() => ({
  stamp: window.HELP_STAMP || '',
  asOf: (window.DATES || {}).asOf || '',
  got: (window.DATES || {}).got || '',
  maxCompare: window.MAX_COMPARE || 8,
  classes: (window.FUNDS || []).reduce((s, f) => s + (f.classes || []).length, 0),
}));
if (!raw.stamp) throw new Error('HELP_STAMP 가 비어 있다 — 사용법이 그려지지 않았다');

// 수는 다시 세지 않고 **화면이 이미 센 것을 그대로 받는다.**
//
// 여기서 같은 조건을 손으로 옮겨 적으면 반드시 어긋난다 — 실제로 그랬다.
// 화면은 `f.retDropped` 를 세는데 이쪽은 `f.dropped` 를 세어, 88개짜리 수가
// 문서에는 0개로 찍혔다. 0개는 "그런 펀드가 없다" 는 뜻이라 그냥 틀린 수가
// 아니라 **없는 것을 0 이라고 말한 것**이 된다.
//
// HELP_STAMP 는 사용법에 찍히는 수를 정해진 차례로 이어 붙인 줄이다. 그것을
// 도로 풀어 쓰면, 문서의 수와 화면의 수는 어긋날 수가 없다. 차례가 바뀌면
// 아래 이름표도 같이 고쳐야 하므로, 마디 수가 다르면 바로 멈춘다.
const STAMP_KEYS = ['total', 'withHold', 'noAum', 'feeVaries', 'noFee', 'mixed', 'dropped',
                    'datedHold', 'secs', 'comps', 'types', 'stepped', 'withFlow', 'asOf', 'got'];
const parts = raw.stamp.split('|');
if (parts.length !== STAMP_KEYS.length) {
  throw new Error(`HELP_STAMP 의 마디가 ${parts.length}개다 — 이름표는 ${STAMP_KEYS.length}개다. `
    + '사용법에 수가 늘었으면 STAMP_KEYS 도 같이 고쳐야 한다.');
}
const facts = { ...raw };
STAMP_KEYS.forEach((k, i) => { facts[k] = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i]; });
for (const k of STAMP_KEYS) {
  if (k === 'asOf' || k === 'got') continue;
  if (!Number.isFinite(facts[k])) throw new Error(`HELP_STAMP 의 ${k} 가 수가 아니다: ${facts[k]}`);
}
const fmt = (v) => Number(v).toLocaleString('ko-KR');
const flowOn = facts.withFlow > 0;

// ══════════════════ 1. 펀드 찾기 ══════════════════
await tab('browse');
const s1 = await shotRange('.finder-search', '#list-table', { maxH: 640 });

// 필터를 실제로 걸어 본다. 문서에 "이렇게 좁혀집니다" 를 적으려면 좁혀진
// 화면이 있어야 한다. 고르는 값도 지어내지 않고 화면의 선택지에서 가져온다.
const filterPick = await page.evaluate(() => {
  const sel = document.getElementById('f-type');
  const hit = [...sel.options].find((o) => /국내주식/.test(o.textContent));
  return hit ? { value: hit.value, label: hit.textContent.trim() } : null;
});
let s1b = null;
if (filterPick) {
  await page.selectOption('#f-type', filterPick.value);
  await page.waitForTimeout(300);
  s1b = await shotRange('.finder-filters', '#result-count', { maxH: 260 });
}
const filteredCount = (await page.locator('#result-count').innerText().catch(() => '')).trim();
await page.click('#f-reset');
await page.waitForTimeout(300);

// 상세를 편다. 보유종목이 실제로 있는 펀드라야 아래 그림이 다 나온다.
const openId = await page.evaluate(() => {
  const F = window.FUNDS || [];
  const good = F.filter((f) => f.holdingCount > 5 && (f.classes || []).length > 1);
  good.sort((a, b) => (b.aum || 0) - (a.aum || 0));
  const f = good[0] || F.find((x) => x.holdingCount > 0);
  if (!f) return null;
  window.state.q = f.name;
  window.renderList();
  window.state.selected = f.id;
  window.renderList();
  window.renderDetail();
  return { id: f.id, name: f.name, company: f.company, type: f.type, holdings: f.holdingCount };
});
if (!openId) throw new Error('상세를 열 펀드를 못 찾았다');
await page.waitForTimeout(400);

const s1c = await shot('#detail .detail-head', { maxH: 120 });
const s1kv = await shot('#detail .kv', { maxH: 420 });
const s1ret = await shotRange('#detail h4', '#detail table', { maxH: 560 });
// 보유종목은 한 덩어리로 싸여 있지 않다 — `.hold-row` 가 형제로 죽 늘어선다.
// 그래서 첫 줄만 찍으면 한 줄짜리 그림이 나오고, "막대 길이가 비중" 이라는
// 설명이 비교할 대상 없이 붕 뜬다. 처음 여덟 줄을 한 장에 담는다.
const holdMarked = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#detail .hold-row')].filter((r) => !r.hidden);
  if (!rows.length) return 0;
  rows[0].setAttribute('data-shot', 'holdtop');
  rows[Math.min(7, rows.length - 1)].setAttribute('data-shot', 'holdend');
  return rows.length;
});
const s1holds = holdMarked
  ? await shotRange('#detail [data-shot="holdtop"]', '#detail [data-shot="holdend"]', { maxH: 420 })
  : null;

const classMarked = await page.evaluate(() => {
  const hs = [...document.querySelectorAll('#detail h4')];
  const h = hs.find((x) => /클래스별|Share classes/.test(x.textContent));
  if (!h) return false;
  const t = h.nextElementSibling;
  if (!t) return false;
  t.setAttribute('data-shot', 'classes');
  return true;
});
const s1cls = classMarked ? await shot('#detail [data-shot="classes"]', { maxH: 420 }) : null;

// ══════════════════ 2. 비교 · 중복도 ══════════════════
// 보유종목이 있는 펀드 넷을 실제로 담는다.
const picked = await page.evaluate(() => {
  const F = window.FUNDS || [];
  const good = F.filter((f) => f.holdingCount > 5 && f.region === 'domestic');
  good.sort((a, b) => (b.aum || 0) - (a.aum || 0));
  const four = good.slice(0, 4);
  window.state.picks = four.map((f) => f.id);
  window.state.q = '';
  window.state.selected = null;
  window.renderList();
  return four.map((f) => f.name);
});
await tab('compare');
await page.waitForTimeout(400);
// 담은 수를 적어 주는 띠. 표까지 같이 찍으면 바로 아래 겹침 표 그림과
// 똑같은 그림이 두 장 들어간다.
const s2bar = await shot('#compare-body .finder-bar', { maxH: 70 });
const cmpMarked = await page.evaluate(() => {
  const tables = [...document.querySelectorAll('#compare-body table')];
  if (!tables.length) return { n: 0 };
  tables[0].setAttribute('data-shot', 'ov');
  if (tables[1]) tables[1].setAttribute('data-shot', 'sx');
  return { n: tables.length };
});
const s2ov = cmpMarked.n ? await shot('#compare-body [data-shot="ov"]', { maxH: 420 }) : null;
const s2sx = cmpMarked.n > 1 ? await shot('#compare-body [data-shot="sx"]', { maxH: 520 }) : null;

// ══════════════════ 3. 종목 → 펀드 ══════════════════
await tab('reverse');
const revTerm = await page.evaluate(() => {
  const F = window.FUNDS || [];
  const c = new Map();
  for (const f of F) for (const h of f.holdings || []) if (h.name) c.set(h.name, (c.get(h.name) || 0) + 1);
  let best = null;
  for (const [k, v] of c) if (!best || v > best[1]) best = [k, v];
  return best ? { name: best[0], funds: best[1] } : null;
});
if (!revTerm) throw new Error('역조회에 쓸 종목을 못 찾았다');
await page.fill('#rq', revTerm.name);
await page.waitForTimeout(500);
const s3 = await shotRange('#tab-reverse .finder-search', '#reverse-body', { maxH: 560 });
// 그림 밑에 적을 수는 **화면이 적어 놓은 것**을 그대로 옮긴다. 여기서 다시
// 세면 화면의 검색 방식(부분 일치)과 어긋나 그림과 설명이 다른 수를 말한다.
const revShown = (await page.locator('#reverse-body .count, #tab-reverse .count').first()
  .innerText().catch(() => '')).trim();

// ══════════════════ 4. 랭킹 ══════════════════
await tab('rank');
await page.waitForTimeout(400);
// 고르는 띠와 그 결과를 한 장에 담는다. 띠만 따로 찍으면 빈 상자 한 장이
// 되고, "고르면 아래가 다시 그려진다" 는 말이 그림에서 안 보인다.
const s4 = await shotRange('#tab-rank .finder-bar', '#rank-body', { maxH: 700 });

// ══════════════════ 5. 수익률 검산 ══════════════════
await tab('basis');
await page.waitForTimeout(400);
// 위쪽 세 칸(검산한 펀드 · 계단 · 비운 칸)과 아래 "무엇을 왜 비웠나" 표를
// 나눠 찍는다. 한 장으로 찍으면 표가 머리글에서 잘려 "빈 표" 처럼 보인다.
const s5 = await shot('#basis-body .grid-3', { maxH: 200 })
  .catch(() => shot('#basis-body', { maxH: 620 }));
// 이 탭에는 표가 둘이다 — "무엇을 왜 비웠나"(수익률) 와 "수익률 말고 비운
// 것"(설정액·순자산). 마지막 표를 집으면 뒤엣것이 잡히면서 그림과 설명이
// 다른 표를 가리키게 된다. 제목을 보고 그 다음 표를 집는다.
const basisMarked = await page.evaluate(() => {
  const after = (re, tag) => {
    const h = [...document.querySelectorAll('#basis-body h3')].find((x) => re.test(x.textContent));
    if (!h) return false;
    let node = h.nextElementSibling;
    while (node && !node.querySelector?.('table')) node = node.nextElementSibling;
    const t = node && node.querySelector('table');
    if (!t) return false;
    t.setAttribute('data-shot', tag);
    return true;
  };
  return { drop: after(/무엇을 왜 비웠나/, 'drop'), other: after(/수익률 말고 비운 것/, 'other') };
});
const s5b = basisMarked.drop ? await shot('#basis-body [data-shot="drop"]', { maxH: 420 }) : null;
const s5c = basisMarked.other ? await shot('#basis-body [data-shot="other"]', { maxH: 360 }) : null;

// ══════════════════ 6. 사용법 ══════════════════
await tab('help');
await page.waitForTimeout(300);
const s6 = await shot('#help-dl', { maxH: 140 });

// ── 문서 조립.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const figs = [];
function fig(s, caption) {
  if (!s) return '';
  figs.push(1);
  return '<figure><img src="' + s.src + '" alt="' + esc(caption) + '">'
    + '<figcaption>' + esc(caption) + (s.cut ? ' <span class="cut">(아래는 잘랐습니다)</span>' : '') + '</figcaption></figure>';
}
function steps(list) {
  return '<ol class="steps">' + list.map((t) => '<li>' + t + '</li>').join('') + '</ol>';
}
function tip(title, body) {
  return '<div class="tip"><strong>' + title + '</strong> ' + body + '</div>';
}
function head(n, title, sub) {
  return '<div class="scr"><div class="badge">' + n + '</div><div><h2>' + esc(title) + '</h2>'
    + '<p>' + esc(sub) + '</p></div></div>';
}

const CARDS = [
  ['펀드 찾기', '조건으로 좁혀 보유종목 보기'],
  ['비교 · 중복도', '여러 개를 담아 겹침 보기'],
  ['종목 → 펀드', '이 종목을 담은 펀드 찾기'],
  ['랭킹', '수익률 · 설정액으로 줄 세우기'],
  ['수익률 검산', '빈칸이 왜 빈칸인가'],
  ['사용법', '이 문서 · 내려받기'],
];

const body = `
<header class="doc-head">
  <h1>공모펀드 조회 — 사용법</h1>
  <p class="sub">수집 데이터 · 펀드 ${fmt(facts.total)}개 · 보유종목이 있는 펀드 ${fmt(facts.withHold)}개 ·
     실린 종목 ${fmt(facts.secs)}개 · 운용사 ${fmt(facts.comps)}개사 · 기준일 ${esc(facts.asOf)}</p>
</header>

<div class="eyebrow">사용법</div>
<h2 class="lead-h">무엇을 할 수 있고, 숫자를 어떻게 읽나</h2>
<p class="lead">이 도구는 <strong>국내에 설정된 공모펀드가 실제로 무엇을 담고 있는지</strong>에서 출발합니다.
이름이 비슷해도 속은 다르고, 이름이 달라도 속은 같습니다. 그래서 보유종목을 먼저 보여 주고,
그 위에 비교 · 역조회 · 랭킹을 얹었습니다. 아래 그림은 모두 <strong>실제 화면을 그대로 찍은 것</strong>입니다.</p>

<h3 class="grid-h">화면은 여섯 개입니다</h3>
<div class="cards">
  ${CARDS.map((c, i) => '<div class="card"><span class="no">' + (i + 1) + '</span><b>' + esc(c[0]) + '</b><span class="d">' + esc(c[1]) + '</span></div>').join('')}
</div>

${head(1, '펀드 찾기', '조건으로 좁힌 다음, 눌러서 안을 봅니다. 가장 많이 쓰는 화면입니다.')}
${steps([
  '<strong>검색창에 아무거나 넣습니다.</strong> 펀드 이름 · 표준코드 · 클래스 코드 · 운용사는 물론 <u>보유종목 이름</u>도 됩니다 — "삼성전자" 를 넣으면 삼성전자를 담은 펀드가 나옵니다.',
  '<strong>필터로 좁힙니다.</strong> 투자 지역 · 자산군 · 유형 · 운용사 · 설정액 · 위험등급 · 총보수 일곱 개를 겹쳐 걸 수 있습니다. 오른쪽 아래 <strong>조건 초기화</strong>로 한 번에 풉니다.',
  `<strong>괄호 안의 수는 전체 ${fmt(facts.total)}개 기준입니다.</strong> 걸러진 뒤의 수가 아닙니다 — 지금 몇 개가 남았는지는 표 바로 위 <strong>결과 수</strong>에 나옵니다.`,
  '<strong>열 머리를 누르면 정렬</strong>됩니다. 수익률 · 설정액 · 총보수 순으로 세울 수 있습니다.',
  '<strong>행을 누르면 그 자리에서 펼쳐집니다.</strong> 탭이 바뀌지 않으니 목록을 잃지 않습니다.',
  `맨 왼쪽 <strong>⊕</strong> 는 비교함에 담는 단추입니다. 담기면 <strong>✓</strong> 로 바뀝니다. 최대 ${facts.maxCompare}개.`,
])}
${fig(s1, '검색창 · 필터 일곱 개 · 목록')}
${s1b ? fig(s1b, `유형을 "${filterPick.label}" 로 좁힌 결과 — ${filteredCount}`) : ''}
${tip('목록이 너무 적게 나온다면', `아래 <strong>"보유종목 있는 것만"</strong> 체크가 켜져 있는지 보십시오. 보유종목이 오는 펀드는 ${fmt(facts.total)}개 중 ${fmt(facts.withHold)}개뿐입니다 — 채권형 · MMF 는 원천이 보유종목을 주지 않습니다.`)}

${head('1-1', '행을 누르면 — 상세', '네 덩어리가 펼쳐집니다. 요약값 → 기간 수익률 → 보유종목 → 클래스별.')}
${fig(s1c, `상세 머리 — 펀드 이름과 투자 지역 · 유형 배지 (예: ${openId.name})`)}
<h4>① 요약값</h4>
<p>표준코드 · 유형 · 투자 지역 · 운용사 · 기준가 · 설정액 · 순자산 · 설정일 · 위험등급 · 보유종목 수 ·
상위 10종목 비중 · 총보수 범위 · 벤치마크가 한 줄로 놓입니다.</p>
${fig(s1kv, '요약값')}
<h4>② 기간 수익률</h4>
<p>1일부터 5년까지 열한 구간입니다. <strong>누적이며 연율이 아닙니다</strong> — 3년 30%를 연 30%로 읽으면 안 됩니다.
빈칸은 값이 0이라는 뜻이 아니라 <u>검산을 통과하지 못해 비운 것</u>입니다.</p>
${fig(s1ret, '기간 수익률')}
<h4>③ 보유종목</h4>
<p>비중 순으로 놓이고, <strong>막대 길이가 비중</strong>입니다. 원천이 비중을 안 준 종목은 <strong>–</strong> 로 비워 둡니다 —
그것은 "0" 이 아니라 "담았는데 비중 미공시" 라는 뜻입니다. 처음 12종목이 보이고, 나머지는 아래 단추로 폅니다.</p>
${s1holds ? fig(s1holds, `보유종목 — 처음 여덟 줄 (이 펀드는 ${fmt(openId.holdings)}종목)`) : ''}
<h4>④ 클래스별</h4>
<p><strong>총보수는 클래스마다 다릅니다.</strong> 목록의 총보수 열은 <u>최저 클래스</u> 기준이라, 실제로 가입하는 클래스의 보수는 더 높을 수 있습니다.
지금 자료에서 ${fmt(facts.total)}개 중 ${fmt(facts.feeVaries)}개가 클래스마다 다릅니다.</p>
${s1cls ? fig(s1cls, '클래스별 수익률과 총보수') : ''}
${tip('기준가 · 설정액 · 설정일은 펀드(모) 단위입니다.', '클래스마다 기준가와 설정일이 다릅니다 — 한 클래스가 펀드보다 10년 늦게 설정되기도 합니다. 클래스 단위 값은 표의 코드를 눌러 원천에서 보십시오.')}

${head(2, '비교 · 중복도', '두 개를 같이 사면 얼마나 겹치는지 봅니다.')}
${steps([
  `<strong>먼저 담습니다.</strong> 펀드 찾기에서 <strong>⊕</strong> 를 눌러 2~${facts.maxCompare}개를 고릅니다. 하나만 담으면 비교할 것이 없어 안 그려집니다.`,
  '<strong>비교 탭으로 옮깁니다.</strong> 맨 위에 몇 개를 담았는지가 적히고(<strong>비우기</strong> 로 한 번에 지웁니다), 그 아래에 <strong>겹침 표</strong>가 나옵니다.',
  '<strong>겹침 표를 읽습니다.</strong> 칸의 숫자는 두 펀드가 공유하는 <u>비중의 합</u>입니다. 진할수록 많이 겹칩니다.',
  '<strong>종목 × 펀드 표를 봅니다.</strong> 어느 종목이 어느 펀드에 들었는지 한눈에 보입니다. <strong>○</strong> 는 담았지만 비중을 모르는 것, <strong>·</strong> 는 안 담은 것입니다.',
])}
${fig(s2bar, '담은 수와 비우기 (예: ' + picked.slice(0, 2).join(' / ') + ' 등 ' + picked.length + '개를 담았을 때)')}
${s2ov ? fig(s2ov, '겹침 표 — 칸의 숫자는 두 펀드가 공유하는 비중의 합') : ''}
${s2sx ? fig(s2sx, '종목 × 펀드 표') : ''}
${tip('펀드의 겹침은 하한이 아닙니다.', 'ETF 와 달리 원천이 보유종목을 <u>전부</u> 주므로, 여기 숫자는 실제 포트폴리오 중복에 가깝습니다. 다만 <strong>양쪽 모두 비중이 다 있을 때만</strong> 비율을 냅니다 — 한쪽이라도 비중 미공시가 섞이면 겹친 <u>종목 수만</u> 세고 비율은 비웁니다.')}

${head(3, '종목 → 펀드', '반대로 찾습니다. 이 종목이 어느 펀드에 들어 있나.')}
${steps([
  '<strong>종목 이름을 넣습니다.</strong> 국내 · 해외 모두 됩니다.',
  '<strong>비중 순으로 나옵니다.</strong> 위쪽일수록 그 종목에 많이 쏠린 펀드입니다.',
  '<strong>줄을 누르면 표 아래에 그 펀드의 상세가 펼쳐집니다.</strong> 다른 화면으로 넘어가지 않습니다.',
])}
${fig(s3, `"${revTerm.name}" 로 찾은 결과${revShown ? ' — ' + revShown : ''}`)}
${tip('표가 잘릴 때는 잘렸다고 적습니다.', '역조회 결과는 200행까지만 그립니다. 그럴 때 표 위에 <strong>몇 개 중 몇 개를</strong> 보여 주는지 적어 둡니다 — 표에 보이는 것이 전부가 아닐 수 있다는 뜻입니다.')}

${head(4, '랭킹', '기간 수익률과 설정액으로 줄을 세웁니다.')}
${steps([
  '<strong>위에서 대상과 기간을 고릅니다.</strong> 대상은 유형, 기간은 1일부터 5년까지입니다. 바꾸면 아래 표가 모두 다시 그려집니다.',
  '<strong>수익률은 상위 20 · 하위 20 이 나란히</strong> 나옵니다. 가장 많이 오른 것과 가장 많이 빠진 것을 같이 보십시오.',
  '<strong>설정액 상위 20</strong> 이 이어집니다.'
    + (flowOn ? ' 그 아래에 <strong>3개월 자금 유입 · 유출 상위 20</strong> 도 나옵니다.' : ''),
  '<strong>줄을 누르면 표 아래에 그 펀드의 상세가 열립니다.</strong> 순위표는 밀리지 않습니다.',
])}
${fig(s4, '대상 · 기간을 고르면 아래 순위표가 다시 그려집니다')}
${tip(
  flowOn ? '자금 유입은 설정원본의 차이로 냅니다.' : '3개월 자금 유입 표는 아직 없습니다.',
  flowOn
    ? `원천이 펀드에는 유입액을 따로 주지 않아(ETF 에는 줍니다) <strong>설정원본의 3개월 차이</strong>로 냅니다. 지금 ${fmt(facts.withFlow)}개가 대상입니다.`
    : '원천이 펀드에는 유입액을 주지 않아 <strong>설정원본의 차이</strong>로 내야 하는데, 그 이력이 아직 3개월치가 안 쌓였습니다. 하루치 차이에 "3개월" 이라는 이름을 붙이지 않습니다 — 탭에 가시면 표 대신 그 사정이 적혀 있습니다.'
)}

${head(5, '수익률 검산', '읽는 화면입니다. 조작할 것이 없습니다.')}
${steps([
  '<strong>위 카드에서 검산한 펀드 수와 기준가 계단이 있는 펀드 수</strong>를 봅니다. 지금 계단이 있는 펀드는 ' + fmt(facts.stepped) + '개입니다.',
  '<strong>무엇을 왜 비웠나</strong> 표에서 펀드별로 어느 기간을 무슨 까닭으로 비웠는지, 그리고 <strong>원천이 준 값은 얼마였는지</strong>를 봅니다.',
  '<strong>수익률 말고 비운 것</strong>도 이어집니다. 설정액 · 순자산이 기준가와 앞뒤가 안 맞아 싣지 않은 펀드입니다.',
  '<strong>줄을 누르면 그 펀드의 상세로 갑니다.</strong>',
])}
${fig(s5, '검산한 펀드 · 기준가 계단이 있는 펀드 · 비운 칸')}
${s5b ? fig(s5b, '무엇을 왜 비웠나 — 펀드 · 유형 · 비운 기간 · 까닭 · 원천이 준 값') : ''}
${s5c ? fig(s5c, '수익률 말고 비운 것 — 설정액 · 순자산이 기준가와 안 맞은 펀드') : ''}
${tip('여기가 빈칸의 출처입니다.', `어떤 펀드의 수익률이 비어 있다면 이 탭에서 그 이름을 찾아 보십시오. 값이 <u>없어서</u>가 아니라 <u>검산을 통과하지 못해</u> 비운 것일 수 있습니다. 지금 수익률에서 한 칸이라도 비운 펀드가 ${fmt(facts.dropped)}개입니다.`)}

${head(6, '사용법', '이 문서입니다. 화면 안에서도 볼 수 있고, 따로 받아 갈 수도 있습니다.')}
${steps([
  '<strong>사용법 내려받기 (HTML)</strong> — 이 절만 담은 파일 하나를 받습니다. 브라우저만 있으면 열립니다.',
  '<strong>사용법 내려받기 (PDF)</strong> — 지금 보고 계신 이 문서입니다. 미리 만들어 화면 안에 실어 둔 완성본을 그대로 받습니다.',
  '<strong>사용법만 인쇄 · PDF 저장</strong> — 브라우저의 인쇄창으로 직접 뽑습니다. 인쇄 설정에서 <strong>배경 그래픽</strong>을 켜야 주황 머리말이 나옵니다.',
  '오른쪽 위 <strong>KO / EN</strong> 으로 화면 전체의 언어를 바꿉니다.',
])}
${fig(s6, '사용법 탭의 내려받기 단추')}
${tip('PDF 단추가 안 보일 때', '실어 둔 PDF 는 만든 날의 자료를 담습니다. 화면이 <u>지금 세는 수</u>와 PDF 에 적힌 수가 다르면 낡은 것이므로, 화면이 스스로 단추를 감추고 왜 없는지를 적습니다. 그때는 옆의 인쇄 단추로 직접 뽑으십시오.')}

<h3 class="grid-h">숫자를 읽기 전에</h3>
<p class="lead">이 도구를 만들면서 실제로 걸렸던 것들입니다. 여기 적은 것만 알면 다른 화면과 숫자가 달라도 당황하지 않습니다.</p>

<div class="note"><b>빈칸은 0이 아닙니다.</b> 값이 없어서 비운 칸과 값이 0인 칸은 다릅니다.
이 화면은 <u>확인하지 못한 값을 0으로 채우지 않고 비웁니다</u>. 지금 설정액이 빈 펀드가 ${fmt(facts.noAum)}개,
총보수가 빈 펀드가 ${fmt(facts.noFee)}개, 수익률에서 한 칸이라도 비운 펀드가 ${fmt(facts.dropped)}개입니다.
빈칸을 0으로 읽으면 순위와 평균이 전부 틀어집니다.</div>

<div class="note"><b>기준일과 수집일은 다릅니다.</b> 자료를 오늘 걷어 왔다고 해서 그 안의 값이 오늘 것이 되지는 않습니다.
이 자료는 <strong>${esc(facts.got)}</strong> 에 걷었고, 값의 기준일은 <strong>${esc(facts.asOf)}</strong> 입니다.
주말 · 공휴일 다음에는 그 앞 영업일 값입니다.</div>

<div class="note"><b>보유종목에는 기준일이 없습니다.</b> 원천이 종목명과 비중만 주고 언제 기준인지는 알려 주지 않습니다
(${fmt(facts.total)}개 중 기준일이 붙은 것 ${fmt(facts.datedHold)}개). 공모펀드 보유종목은 분기 공시라 몇 달 앞선 것일 수 있습니다.
정확한 기준일은 펀드 상세의 운용보고서에서 확인하십시오.</div>

<div class="note"><b>총보수는 하나의 숫자가 아니라 범위입니다.</b> 국내 공모펀드의 보수는 클래스마다 다릅니다 —
지금 ${fmt(facts.feeVaries)}개 펀드가 그렇습니다. 목록의 총보수 열과 필터는 <strong>최저 클래스</strong> 기준이므로,
실제로 가입하는 클래스의 보수는 더 높을 수 있습니다.</div>

<div class="note"><b>수익률은 누적이며 연율이 아닙니다.</b> 3년 · 5년도 연 환산하지 않은 누적 수익률입니다.
분배금 재투자 여부는 원천이 밝히지 않으므로 이 화면도 단정하지 않습니다.</div>

<div class="note"><b>투자 지역의 "혼합" 은 자산이 아니라 지역입니다.</b> 투자 지역은 1차 출처인 금융투자협회 전자공시에서
직접 받아 국내 · 해외 · 혼합 셋으로 가릅니다(지금 혼합 ${fmt(facts.mixed)}개). 유형 이름에 나오는 "혼합" 은
<strong>주식+채권</strong>이라는 자산 이야기라 서로 다른 말입니다.</div>

<h3 class="grid-h">자료는 어디서 오고 언제 것인가</h3>
<div class="note src"><b>기준일 ${esc(facts.asOf)}</b> · 수집 ${esc(facts.got)}(한국 시간).
네이버 Npay 증권 펀드 API 에서 걷은 뒤, 계보가 다른 1차 출처인 <strong>금융투자협회 전자공시</strong>에 전수 다시 물어 맞대 봤습니다.
대상은 <strong>국내에 설정된 공모펀드 ${fmt(facts.total)}개</strong>이며, 해외에 설정된 뮤추얼펀드는 포함하지 않습니다.
클래스는 ${fmt(facts.classes)}개, 운용사는 ${fmt(facts.comps)}개사, 유형은 ${fmt(facts.types)}개입니다.</div>
<p class="lead">1개월 이상 기간수익률 · 보유종목 · 위험지표는 금융투자협회가 주지 않아
<u>외부 원천으로는 확인되지 않았습니다</u> — 그 값들은 원천 자체의 기준가 시계열로 검산한 데까지입니다.
화면에 실리는 모든 숫자는 매일 전수 감사를 통과한 것만 나갑니다.</p>

<div class="callout">
  <h3>찾는 펀드가 안 보인다면</h3>
  <p>찾기 화면 아래쪽 <strong>"보유종목 있는 것만"</strong> 체크를 풀어 보십시오.
     원천이 보유종목을 주지 않는 유형(채권형 · MMF 등)이 그 체크에 걸려 빠집니다 —
     보유종목이 오는 펀드는 ${fmt(facts.total)}개 중 ${fmt(facts.withHold)}개입니다.</p>
  <p>그래도 없으면 이 도구가 다루는 범위 밖입니다. <strong>국내에 설정된 공모펀드</strong>만 싣습니다 —
     사모펀드와 해외에 설정된 뮤추얼펀드는 들어 있지 않습니다.</p>
</div>

<p class="disc">본 문서는 정보 제공 목적의 참고 자료이며 투자 권유가 아닙니다. 실제 상품 내용은 각 펀드의
투자설명서와 운용사 공시가 우선합니다.</p>
`;

const doc = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<title>공모펀드 조회 — 사용법</title>
<style>
:root{--orange:#F58220;--orange-soft:#FAB072;--blue:#043B72;--ink:#1A1A1A;--body:#3D3D3D;
      --muted:#6C6C6C;--hairline:#CDCECB;--hairline-soft:#E5E4E1;--subtle:#F7F8FA;}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--body);
  font-family:'Spoqa Han Sans Neo','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;
  font-size:11pt;line-height:1.65;}
.wrap{max-width:760px;margin:0 auto;padding:0 4px}
h1,h2,h3,h4{color:var(--ink);margin:0}
.doc-head{border-bottom:3px solid var(--orange);padding-bottom:12px;margin-bottom:26px}
.doc-head h1{font-size:23pt;letter-spacing:-.5px}
.doc-head .sub{margin:8px 0 0;color:var(--muted);font-size:9.5pt}
.eyebrow{color:var(--orange);font-weight:600;font-size:9.5pt;margin-bottom:4px}
.lead-h{font-size:16pt;margin-bottom:8px}
.lead{margin:0 0 18px;font-size:10.5pt}
.grid-h{font-size:14pt;margin:30px 0 12px}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:26px}
.card{border:1px solid var(--hairline);border-radius:3px;padding:10px 12px;font-size:10pt}
.card .no{color:var(--orange);font-weight:700;margin-right:6px}
.card b{color:var(--ink)}
.card .d{display:block;color:var(--muted);font-size:9pt;margin-top:2px}
.scr{display:flex;gap:12px;align-items:flex-start;background:var(--subtle);
  border:1px solid var(--hairline-soft);border-radius:3px;padding:14px 16px;margin:26px 0 0;
  page-break-after:avoid;break-after:avoid}
.scr .badge{flex:none;width:30px;height:30px;border-radius:50%;background:var(--orange);color:#fff;
  display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10pt}
.scr h2{font-size:14pt}
.scr p{margin:2px 0 0;color:var(--muted);font-size:9.5pt}
ol.steps{margin:14px 0 0;padding-left:0;list-style:none;counter-reset:s}
ol.steps li{counter-increment:s;position:relative;padding-left:26px;margin-bottom:7px;font-size:10pt}
ol.steps li::before{content:counter(s);position:absolute;left:0;top:1px;width:17px;height:17px;
  border:1px solid var(--hairline);border-radius:50%;color:var(--muted);font-size:8pt;
  display:flex;align-items:center;justify-content:center}
h4{font-size:11pt;margin:16px 0 4px}
p{margin:0 0 10px;font-size:10pt}
figure{margin:14px 0;page-break-inside:avoid;break-inside:avoid}
figure img{width:100%;display:block;border:1px solid var(--hairline-soft);border-radius:2px}
figcaption{color:var(--muted);font-size:8.5pt;margin-top:5px}
figcaption .cut{color:#A0A6A8}
.tip{border:1px solid var(--hairline);border-radius:3px;padding:11px 14px;margin:14px 0;
  font-size:9.5pt;page-break-inside:avoid;break-inside:avoid}
.tip strong{color:var(--ink)}
.note{border-left:3px solid var(--orange-soft);background:var(--subtle);padding:10px 14px;
  margin:10px 0;font-size:9.5pt;page-break-inside:avoid;break-inside:avoid}
.note b{color:var(--ink)}
.note.src{border-left-color:var(--blue)}
u{text-decoration-color:var(--orange-soft);text-underline-offset:2px}
.callout{background:var(--orange);color:#fff;border-radius:3px;padding:18px 20px;margin:26px 0;
  page-break-inside:avoid;break-inside:avoid}
.callout h3{color:#fff;font-size:13pt;margin-bottom:8px}
.callout p{color:#fff;font-size:9.5pt;margin-bottom:6px}
.callout strong{color:#fff}
.disc{color:var(--muted);font-size:8.5pt;margin-top:24px;border-top:1px solid var(--hairline-soft);padding-top:12px}
@page{size:A4;margin:12mm 12mm 14mm}
</style></head><body><div class="wrap">${body}</div></body></html>`;

await writeFile(HTML_OUT, doc, 'utf8');

// 문서를 새 창에 띄워 PDF 로 뽑는다.
const doc2 = await browser.newPage({ viewport: { width: 900, height: 1200 } });
const docErrors = [];
doc2.on('pageerror', (e) => docErrors.push(e.message));
await doc2.setContent(doc, { waitUntil: 'load' });
await doc2.emulateMedia({ media: 'print' });
await doc2.waitForTimeout(400);

await doc2.pdf({
  path: PDF_OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '14mm', left: '12mm', right: '12mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  // 꼬리말은 본문과 다른 렌더 문맥이라 문서 CSS 가 닿지 않는다. 글꼴을 여기서
  // 따로 주지 않으면 한글이 엉뚱한 글꼴로 나온다.
  footerTemplate:
    '<div style="width:100%;font-size:8pt;color:#777;font-family:sans-serif;'
    + 'padding:0 12mm;display:flex;justify-content:space-between">'
    + `<span>공모펀드 조회 — 사용법 · 기준일 ${facts.asOf || '미상'}</span>`
    + '<span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>',
});

const bytes = await readFile(PDF_OUT);
if (bytes.slice(0, 5).toString() !== '%PDF-') throw new Error('PDF 서명이 없다');
if (bytes.length < 20000) throw new Error(`PDF 가 너무 작다 (${bytes.length}B) — 빈 문서일 수 있다`);
if (figs.length < 8) throw new Error(`그림이 ${figs.length}장뿐이다 — 화면을 못 찍었다`);

// 화면에 실을 형태로 떨군다. 여기 적는 stamp 가 화면의 HELP_STAMP 와 다르면
// 화면이 스스로 단추를 감춘다 — 낡은 PDF 를 내주지 않게 하는 장치다.
const js = '/* 자동 생성 — scripts/build_fund_howto.mjs. 손으로 고치지 마십시오. */\n'
  + 'window.HELP_PDF = '
  + JSON.stringify({
    stamp: facts.stamp,
    asOf: facts.asOf,
    got: facts.got,
    bytes: bytes.length,
    b64: bytes.toString('base64'),
  })
  + ';\n';
await writeFile(JS_OUT, js, 'utf8');

console.log(`[howto] ${PDF_OUT} — ${(bytes.length / 1024).toFixed(0)} KB · 그림 ${figs.length}장 (${SRC}, 펀드 ${facts.total}개, 기준일 ${facts.asOf})`);
console.log(`[howto] ${HTML_OUT} — ${(Buffer.byteLength(doc) / 1024).toFixed(0)} KB`);
console.log(`[howto] ${JS_OUT} — ${(Buffer.byteLength(js) / 1024).toFixed(0)} KB · stamp ${facts.stamp}`);

if (errors.length) console.error('조회 화면 오류:', errors.join(' / '));
if (docErrors.length) console.error('사용법 문서 오류:', docErrors.join(' / '));
if (errors.length || docErrors.length) process.exitCode = 1;

await browser.close();
server.close();
