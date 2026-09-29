/**
 * 퇴직소득세 교차 검증.
 *
 * rules.js (조문에서 옮긴 표) 와 화면(app.jsx 가 스스로 쓴 산식) 이 같은 답을 내는지
 * 격자로 맞댄다. 둘은 서로를 가져다 쓰지 않으므로 같은 답이 나오면 서로의 검산이 된다.
 *
 * 격자는 **공제표가 바뀌는 자리를 반드시 지난다.** 근속연수 5·10·20년, 환산급여
 * 800만·7,000만·1억·3억원, 세율 구간 경계가 그 자리다. 구간 안쪽만 훑으면 표를
 * 한 줄 잘못 옮겨도 드러나지 않는다.
 *
 *   node tools/retirement-tax/crosscheck.js
 */
const path = require('path');
const { chromium } = require('playwright');
const rules = require('./rules.js');

const APP = 'file://' + path.resolve(__dirname, '..', '..', 'retire-payout.html');

/**
 * 입사일.
 *
 * offset 이 0 이면 근속연수가 **정확히** n 년이고, 1 이면 하루를 더 거슬러 올라가
 * n 년 + 1일이 되어 **절상이 걸린다**(n+1 년). 격자에 둘 다 넣는다 - 정확히 떨어지는
 * 날짜만 쓰면 절상 코드를 통째로 빼도 거의 드러나지 않는다.
 */
function hireFor(retire, years, offset) {
  const d = new Date(retire + 'T00:00:00');
  d.setFullYear(d.getFullYear() - years);
  if (offset) d.setDate(d.getDate() - offset);
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

const RETIRE = '2026-06-30';
const 만 = 10000;

/** 근속연수 × 퇴직급여. 금액은 환산급여가 각 공제 구간에 걸치도록 고른다 */
const YEARS = [1, 4, 5, 6, 9, 10, 11, 19, 20, 21, 30, 35];
const AMOUNTS = [1000 * 만, 3000 * 만, 5000 * 만, 8000 * 만, 12000 * 만,
  20000 * 만, 30000 * 만, 50000 * 만, 100000 * 만];

/** 중간정산 케이스 - 분리/정산특례가 갈리는 자리를 본다 */
const MID = [
  { years: 20, amount: 30000 * 만, midYearsAgo: 10, midAmount: 10000 * 만, midPaidTax: 500 * 만 },
  { years: 25, amount: 20000 * 만, midYearsAgo: 15, midAmount: 30000 * 만, midPaidTax: 2000 * 만 },
  { years: 30, amount: 50000 * 만, midYearsAgo: 5, midAmount: 5000 * 만, midPaidTax: 100 * 만 },
  { years: 12, amount: 8000 * 만, midYearsAgo: 8, midAmount: 4000 * 만, midPaidTax: 0 }
];

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1200 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));

  await page.goto(APP, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('root').children.length > 0, { timeout: 20000 });
  await page.waitForTimeout(500);

  const L = (n) => page.getByLabel(n, { exact: true });
  const B = (n) => page.getByRole('button', { name: n, exact: true });

  // DB 로 둔다. 새로 생긴 '입사일' 칸을 쓰는 쪽이 DB·DC 이고, 거기가 새 경로다.
  // (퇴직금제도는 기존 '제도 가입일' 칸을 근속 기산일로 그대로 쓴다.)
  await L('생년월일').fill('650115');
  await B('DB').click();
  await page.waitForTimeout(200);
  await L('퇴직일').fill(RETIRE);
  await L('이연 퇴직소득세 직접 계산').check();
  await page.waitForTimeout(300);

  /**
   * 화면이 낸 이연퇴직소득세 (원 단위).
   *
   * 화면 글자는 '1억 2,345만원' 처럼 만원 단위로 반올림해 적는다. 그 글자로 맞대면
   * 1만원 미만의 어긋남이 통째로 묻히므로, 원 단위를 적어 둔 줄을 읽는다.
   */
  const screenTax = async () => {
    const l = page.getByLabel('이연퇴직소득세 원 단위', { exact: true });
    if (!(await l.count())) return null;
    const m = (await l.innerText()).replace(/\s+/g, ' ').match(/합계 ([0-9,]+)원/);
    return m ? Number(m[1].replace(/,/g, '')) : null;
  };

  let checked = 0;
  const bad = [];

  const run = async (label, fill, expect) => {
    await fill();
    await page.waitForTimeout(160);
    const got = await screenTax();
    checked += 1;
    if (got !== expect) bad.push(label + ' — 규칙표 ' + expect + ' / 화면 ' + got);
  };

  // ── 중간정산 없음 ────────────────────────────────────────────
  for (const y of YEARS) {
    for (const off of [0, 1]) {         // 정확히 n 년 / n 년 + 1일(절상)
      const hire = hireFor(RETIRE, y, off);
      for (const amt of AMOUNTS) {
        const want = rules.compute({ hireDate: hire, retireDate: RETIRE, amount: amt });
        await run('근속 ' + y + '년' + (off ? '+1일' : '') + ' · ' + (amt / 만) + '만원', async () => {
          await L('입사일').fill(hire);
          await L('퇴직급여').fill(String(amt));
        }, want.chosen.total);
      }
    }
  }

  // ── 중간정산 있음 ────────────────────────────────────────────
  await L('중간정산 받음').check();
  await page.waitForTimeout(250);
  for (const c of MID) {
    const hire = hireFor(RETIRE, c.years, 0);
    const mid = hireFor(RETIRE, c.midYearsAgo, 0);
    const want = rules.compute({
      hireDate: hire, retireDate: RETIRE, amount: c.amount,
      midDate: mid, midAmount: c.midAmount, midPaidTax: c.midPaidTax
    });
    await run('중간정산 · 근속 ' + c.years + '년 · ' + (c.amount / 만) + '만원', async () => {
      await L('입사일').fill(hire);
      await L('퇴직급여').fill(String(c.amount));
      await L('중간정산일').fill(mid);
      await L('중간정산 퇴직급여').fill(String(c.midAmount));
      await L('중간정산 때 낸 퇴직소득세').fill(String(c.midPaidTax));
    }, want.chosen.total);

    // 유리한 쪽 표시도 같은 답이어야 한다
    // '유리' 표시가 붙은 줄을 직접 찾는다. 블록 전체 글자에서 낱말을 찾으면 옆 줄의
    // 표시를 보고도 통과한다.
    const screenSettle = await page.getByLabel('중간정산 정산특례 비교', { exact: true })
      .evaluate((box) => Array.from(box.querySelectorAll('div'))
        .some((d) => d.innerText.indexOf('정산특례 신고') === 0 && d.innerText.indexOf('유리') > 0));
    checked += 1;
    if (screenSettle !== (want.mode === 'settle')) {
      bad.push('중간정산 유불리 · 근속 ' + c.years + '년 — 규칙표 ' + want.mode + ' / 화면 ' +
        (screenSettle ? 'settle' : 'plain'));
    }
  }

  // ── 비과세 퇴직급여는 과세표준에서 빠진다 ────────────────────
  await L('중간정산 받음').uncheck();
  await page.waitForTimeout(250);
  {
    const hire = hireFor(RETIRE, 20, 0);
    const want = rules.compute({ hireDate: hire, retireDate: RETIRE, amount: 30000 * 만 - 2000 * 만 });
    await run('비과세 2,000만원 차감', async () => {
      await L('입사일').fill(hire);
      await L('퇴직급여').fill(String(30000 * 만));
      await L('비과세 퇴직급여').fill(String(2000 * 만));
    }, want.chosen.total);
    await L('비과세 퇴직급여').fill('0');
  }

  await browser.close();

  for (const e of errors) console.log('  ! ' + e);
  console.log('  · 대조한 칸 ' + checked + '개 · 어긋난 칸 ' + bad.length + '개');
  for (const b of bad) console.log('  ✗ ' + b);
  const ok = bad.length === 0 && errors.length === 0;
  console.log((ok ? 'OK  ' : 'FAIL  ') + '대조 ' + checked + '건 · 어긋남 ' + bad.length + '건');
  process.exit(ok ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
