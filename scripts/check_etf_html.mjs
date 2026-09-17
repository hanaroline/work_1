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
