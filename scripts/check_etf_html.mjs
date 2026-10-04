// HTML 제안서가 **엑셀과 같은 숫자**를 내놓는지 본다.
//
// 왜 필요한가
// ──────────────────────────────────────────────────────────────────────
// 같은 자료로 두 벌을 만들면, 둘이 어긋나는 순간 하나만 있는 것보다 나빠진다.
// 담당자는 엑셀을 보고 고객은 HTML 을 보는데 월 분배금이 다르게 적혀 있으면
// 어느 쪽이 맞는지 알 길이 없고, 그 자리에서 문서 전체를 못 믿게 된다.
//
// 그래서 파이썬 검사기가 엑셀을 실제로 계산해서 적어 둔 값
// (discovery/etf-expected.json)을, 이 검사기가 **브라우저로 HTML 을 열어**
// 화면에 찍힌 값과 맞춰 본다. 두 구현이 서로 다른 언어로 따로 계산한 값이
// 맞아떨어져야 통과다.
//
// 화면에 찍힌 글자를 읽는다는 점이 중요하다. 계산식만 맞고 화면에 안 붙으면
// 고객이 보는 것은 여전히 틀린 문서다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const HTML = process.argv[2] || 'docs/etf-proposal.html';
const EXPECT = process.argv[3] || 'discovery/etf-expected.json';

if (!fs.existsSync(HTML)) {
  console.error(`[중단] ${HTML} 가 없습니다.`);
  process.exit(1);
}
if (!fs.existsSync(EXPECT)) {
  console.error(`[중단] ${EXPECT} 가 없습니다. 먼저 check_etf_proposal.py 를 돌리십시오.`);
  process.exit(1);
}
const want = JSON.parse(fs.readFileSync(EXPECT, 'utf8'));

const won = (s) => Number(String(s).replace(/[^0-9.-]/g, ''));
const problems = [];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
// localStorage 에 지난 판이 남아 있으면 기본 구성이 아니라 그것을 그린다.
// 검사는 늘 같은 자리에서 시작해야 하므로 비우고 연다.
await page.addInitScript(() => {
  try {
    localStorage.clear();
  } catch {
    /* 막혀 있으면 그대로 둔다 */
  }
});
await page.goto('file://' + path.resolve(HTML), { waitUntil: 'load' });
await page.waitForTimeout(800);

const got = await page.evaluate(() => ({
  pick: document.querySelector('#pfBody select')?.selectedOptions[0]?.textContent?.trim() || '',
  amount: document.getElementById('amt').value,
  invest: document.getElementById('kInvest').textContent,
  pre: document.getElementById('kPre').textContent,
  post: document.getElementById('kPost').textContent,
  annRate: document.getElementById('kAnnRate').textContent,
  qCount: document.getElementById('qBody').querySelectorAll('tr').length,
  cmpCount: document.getElementById('cmpBody').querySelectorAll('tr').length,
  warnFreq: document.getElementById('wFreq').textContent,
}));

const near = (a, b, tol) => Math.abs(a - b) <= tol;

// 1. 기본으로 고른 종목이 엑셀과 같은가
if (!got.pick.startsWith(want.defaultName)) {
  problems.push(`기본 종목이 다릅니다 — HTML "${got.pick}" / 엑셀 "${want.defaultName}"`);
}
// 2. 같은 투자금액에서 출발하는가
if (!near(won(got.amount), want.amount, 1)) {
  problems.push(`총 투자금액이 다릅니다 — HTML ${won(got.amount)} / 엑셀 ${want.amount}`);
}
// 3. 실투자금액·월 분배금이 원 단위까지 같은가
//    둘 다 "수량을 정수로 내림한 뒤 곱한다" 를 지켜야 여기서 맞는다.
for (const [key, label, tol] of [
  ['invest', '실제 투자금액', 1],
  ['pre', '월 분배금(세전)', 1],
  ['post', '월 분배금(세후)', 1],
]) {
  const g = won(got[key]);
  if (!near(g, want[key], tol)) {
    problems.push(`${label}이 다릅니다 — HTML ${g.toLocaleString()} / 엑셀 ${want[key].toLocaleString()}`);
  }
}
// 4. 연 수익률
const gRate = won(got.annRate);
if (!near(gRate, want.annRate, 0.01)) {
  problems.push(`연 수익률이 다릅니다 — HTML ${gRate}% / 엑셀 ${want.annRate}%`);
}
// 5. 표가 실제로 그려졌는가. 계산이 맞아도 화면이 비어 있으면 소용없다.
if (got.qCount < 5) problems.push(`종목 조회 표가 ${got.qCount}줄뿐입니다.`);
if (got.cmpCount !== want.compareCount) {
  problems.push(`비교표가 ${got.cmpCount}줄인데 엑셀은 ${want.compareCount}줄입니다.`);
}
// 6. 월배당 기본 구성에서는 주기 경고가 뜨면 안 된다.
if (want.defaultFreq === '월배당' && got.warnFreq.trim()) {
  problems.push(`월배당만 담았는데 주기 경고가 떴습니다: ${got.warnFreq.slice(0, 60)}`);
}

// 7. 분기·연배당을 담으면 경고가 **뜨는지** 도 본다. 안 뜨는 경고는 없는 것과 같다.
const other = await page.evaluate(() => {
  const el = document.querySelector('#pfBody select');
  const opt = [...el.options].find((o) => {
    const it = DATA.items.find((x) => x.code === o.value);
    return it && it.freq && it.freq !== '월배당';
  });
  if (!opt) return null;
  el.value = opt.value;
  el.dispatchEvent(new Event('change'));
  return document.getElementById('wFreq').textContent.trim();
});
if (other === null) {
  console.log('  · 월배당이 아닌 종목이 목록에 없어 주기 경고는 시험하지 못했습니다.');
} else if (!other) {
  problems.push('월배당이 아닌 종목을 담았는데 주기 경고가 뜨지 않았습니다.');
}

// 8. 수익률 넉 칸이 **원천과 같은가.**
//
// 엑셀 쪽은 파이썬 검사기가 원천과 맞춰 본다. 여기서 HTML 도 같은 원천과
// 맞으면 두 벌이 서로 맞는 셈이다. 화면에 찍힌 글자를 읽는 것이 핵심이다 —
// 칸 차례가 한 칸 밀리면 총수익 자리에 3개월치가 찍히는데, 값 자체는 모두
// '원천에 있는 수'라서 숫자만 보는 검사로는 절대 안 잡힌다. 그래서 머리글
// 자리부터 확인하고, 줄마다 종목명으로 원천을 찾아 넉 칸을 맞춰 본다.
const RET_HEAD = ['총수익(1년)', '기준가(1년)', '기준가(6개월)', '기준가(3개월)'];
const RET_KEY = ['returnTotal', 'returnNav', 'returnNav6m', 'returnNav3m'];
const SRC = process.argv[4] || 'data/cc_etf.json';
if (!fs.existsSync(SRC)) {
  problems.push(`${SRC} 가 없어 수익률을 원천과 맞춰 보지 못했습니다.`);
} else {
  const srcBy = new Map(JSON.parse(fs.readFileSync(SRC, 'utf8')).items.map((x) => [x.name, x]));
  const table = await page.evaluate(() => {
    const tb = document.getElementById('qBody');
    const heads = [...tb.closest('table').querySelectorAll('thead th')].map((th) =>
      th.textContent.replace(/[▲▼↕\s]+$/u, '').trim(),
    );
    const rows = [...tb.querySelectorAll('tr')].map((tr) => {
      const td = [...tr.children];
      return {
        name: td[0]?.textContent.replace(/기준 미달/, '').trim() || '',
        rets: [7, 8, 9, 10].map((i) => ({
          text: td[i]?.textContent.trim() ?? '',
          title: td[i]?.querySelector('[title]')?.getAttribute('title') || '',
        })),
      };
    });
    return { heads, rows };
  });
  // 머리글 자리가 밀렸는지부터 본다. 밀렸으면 아래 대조는 뜻이 없다.
  const headBad = RET_HEAD.filter((h, i) => table.heads[7 + i] !== h);
  if (headBad.length) {
    problems.push(
      `조회표 머리글 8~11번째가 ${JSON.stringify(table.heads.slice(7, 11))} 입니다 — ` +
        `${JSON.stringify(RET_HEAD)} 이어야 합니다. 칸 차례가 바뀌었다면 이 검사기도 함께 고치십시오.`,
    );
  } else {
    const fmt = (v) => (v > 0 ? '+' : '') + v.toFixed(2) + '%';
    let seen = 0;
    let filled = 0;
    let noTip = 0;
    for (const row of table.rows) {
      const src = srcBy.get(row.name);
      if (!src) continue; // 이름으로 못 찾은 줄은 건너뛴다(원천이 더 최신일 수 있다)
      seen += 1;
      for (let i = 0; i < 4; i += 1) {
        const v = src[RET_KEY[i]];
        const cell = row.rets[i];
        if (v == null) {
          // 빈칸이어야 한다. 0 이나 숫자가 찍히면 '본전' 으로 읽힌다.
          if (cell.text !== '—') {
            problems.push(
              `'${row.name}' ${RET_HEAD[i]} 에 "${cell.text}" 가 찍혔는데 원천에는 그 창의 수익률이 없습니다.`,
            );
          } else if (!cell.title) {
            noTip += 1; // 왜 비었는지 설명이 안 붙었다
          }
          continue;
        }
        if (cell.text !== fmt(v)) {
          problems.push(`'${row.name}' ${RET_HEAD[i]} 이 "${cell.text}" 인데 원천은 "${fmt(v)}" 입니다.`);
        } else {
          filled += 1;
        }
      }
      if (problems.length > 12) break; // 같은 까닭이면 몇 개만 봐도 안다
    }
    if (noTip) problems.push(`빈 수익률 ${noTip}칸에 까닭 설명(title)이 안 붙었습니다.`);
    if (seen < 20) {
      problems.push(`조회표에서 원천과 이름이 맞는 줄이 ${seen}줄뿐이라 수익률을 제대로 못 맞춰 봤습니다.`);
    } else if (filled < 20) {
      problems.push(`조회표에 실린 수익률이 ${filled}칸뿐입니다 — 거의 다 비어 있습니다.`);
    } else {
      console.log(`  · 조회표 ${seen}줄의 수익률 넉 칸을 원천과 맞췄습니다 (실린 칸 ${filled}).`);
    }
  }
}

// 9. 배분 칸에 **여러 자리를 칠 수 있는가.**
//
// 한동안 한 자리밖에 못 넣었다. 글자 하나마다 표를 통째로 다시 그려서,
// 치고 있던 input 이 지워지고 새로 만들어지는 바람에 커서가 날아갔다.
// "20" 을 치면 2 만 들어갔다. 값이 화면에 찍히는지만 보던 검사기는 이걸
// 못 잡는다 — 찍히는 값은 늘 맞았고, 사람이 칠 수가 없었을 뿐이다.
// 그래서 사람이 치듯 한 글자씩 쳐 본다.
const typed = [];
const allocSel = '#pfBody tr:first-child input.num';
const typeInto = async (sel, text) => {
  await page.click(sel);
  await page.keyboard.press('Control+a');
  await page.keyboard.type(text, { delay: 30 });
  return page.$eval(sel, (el) => el.value);
};

await page.selectOption('#mode', '비율');
for (const t of ['20', '12.5']) {
  const v = await typeInto(allocSel, t);
  if (v !== t) typed.push(`배분 칸에 "${t}" 를 쳤는데 "${v}" 만 들어갔습니다.`);
}

await page.selectOption('#mode', '금액');
const big = await typeInto(allocSel, '30000000');
if (big !== '30000000') typed.push(`배분 칸(금액)에 "30000000" 을 쳤는데 "${big}" 만 들어갔습니다.`);
// 칸만 채워지고 셈이 멈추면 소용없다. 배정금액이 따라 움직였는지 본다.
const assign = await page.$eval('#pfBody tr:first-child [data-f="assign"]', (el) => el.textContent);
if (!/30,000,000/.test(assign || '')) typed.push(`배분을 고쳤는데 배정금액이 안 따라왔습니다: "${assign}"`);

await page.selectOption('#mode', '비율');
const amt = await typeInto('#amt', '250000000');
if (!/250,?000,?000/.test(amt)) typed.push(`총 투자금액에 "250000000" 을 쳤는데 "${amt}" 만 들어갔습니다.`);

// 종목을 바꿔도 배분값이 살아 있어야 한다.
await typeInto(allocSel, '55');
const optVal = await page.$eval('#pfBody tr:first-child select', (el) => el.options[3]?.value || '');
if (optVal) {
  await page.selectOption('#pfBody tr:first-child select', optVal);
  await page.waitForTimeout(120);
  const keep = await page.$eval(allocSel, (el) => el.value);
  if (keep !== '55') typed.push(`종목을 바꿨더니 배분값이 "${keep}" 로 바뀌었습니다(55 여야 함).`);
}
problems.push(...typed);

await browser.close();

if (problems.length) {
  console.log(`\n[문제 ${problems.length}건]`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(1);
}
console.log(
  `  · HTML 이 엑셀과 같은 값을 냅니다 — ${want.defaultName} · ` +
    `실투자 ${want.invest.toLocaleString()}원 · 월 세전 ${want.pre.toLocaleString()}원 · ` +
    `연 ${want.annRate}% · 조회 ${got.qCount}줄 · 비교 ${got.cmpCount}줄`,
);
console.log(other ? '  · 월배당이 아닌 종목을 담으면 주기 경고가 뜹니다.' : '');
console.log('  · 배분 칸에 20 / 12.5 / 30000000, 총액에 250000000 이 온전히 들어가고 셈에 반영됩니다.');
