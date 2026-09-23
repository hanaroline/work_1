/**
 * 테스트 공용 헬퍼.
 *
 * 선택자는 전부 aria-label / 버튼 이름으로 잡는다. 인덱스로 잡으면
 * 컨트롤이 하나 늘어나는 것만으로 엉뚱한 칸을 눌러 놓고 테스트는 통과한 것처럼
 * 보인다 (실제로 그런 일이 있었다). 새 필드를 넣을 때는 여기 FIELDS 에도 넣고,
 * selectors 스펙이 그 라벨이 정확히 하나로 잡히는지 확인하게 한다.
 */
const path = require('path');
const { chromium } = require('playwright');

const APP = 'file://' + path.resolve(__dirname, '..', '..', '..', 'retirement-simulator.html');

/** 라벨이 고유해야 하는 컨트롤 (selectors 스펙이 검사한다) */
const FIELDS = {
  always: [
    '고객명', '생년월일', '제도 가입일', '퇴직일', '이연 퇴직소득세', '과거 연금 수령 횟수',
    '기존 연금저축 보유', '기존 IRP 보유', '상담 메모', '상담 메모 인쇄물 포함',
    '상담 케이스 가져오기', '수령 기간', '운용수익률',
    '신규 IRP 연간 수수료', '신규 연금저축 연간 수수료'
  ],
  whenDbDc: ['퇴직급여'],
  whenSeverance: ['법정퇴직금', '명예퇴직금'],
  whenDc: ['DB 에서 DC 로 전환'],
  whenConverted: ['전환 전 DB 가입일'],
  whenPension: ['기존 연금저축 가입일', '기존 연금저축 평가액', '기존 연금저축 연간 수수료',
    '기존 연금저축 세액공제 받지 않은 금액', '기존 연금저축 연금개시됨'],
  whenIrp: ['기존 IRP 가입일', '기존 IRP 평가액', '기존 IRP 연간 수수료',
    '기존 IRP 세액공제 받지 않은 금액', '기존 IRP 연금개시됨']
};

const BUTTONS = [
  'DB', 'DC', '퇴직금제도', '기간 균등 분할', '세법 한도 내 최대',
  '퇴직금 단독', '기존 연금저축 합산', '기존 IRP 합산', '전체 전액 합산',
  '판정', '계좌 비교', '인출 스케줄', 'A4 1장 인쇄', 'PDF 저장',
  '상담 저장', '파일로 내보내기', '가져오기', '전체 초기화'
];

/** 오프라인 + 에러 수집이 붙은 페이지를 연다 */
async function openApp(opts) {
  const o = opts || {};
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: o.viewport || { width: 1500, height: 1000 },
    deviceScaleFactor: o.deviceScaleFactor || 1,
    acceptDownloads: true,
    offline: o.online ? false : true
  });
  const page = await ctx.newPage();
  const errors = [];
  const external = [];

  // file:// 외의 모든 요청을 막아 오프라인 동작을 강제한다
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (!url.startsWith('file://')) { external.push(url); return route.abort(); }
    return route.continue();
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  if (o.stubPrint) {
    await page.addInitScript(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  }

  await page.goto(APP, { waitUntil: 'load' });
  await page.waitForFunction(() => document.getElementById('root').children.length > 0);
  await page.evaluate(() => document.fonts && document.fonts.ready);

  return { browser, page, errors, external };
}

const field = (page, name) => page.getByLabel(name, { exact: true });
const button = (page, name) => page.getByRole('button', { name, exact: true });

/** 상담 한 건을 라벨로만 채운다 */
async function fillCase(page, c) {
  if (c.name !== undefined) await field(page, '고객명').fill(c.name);
  if (c.birth) await field(page, '생년월일').fill(c.birth);
  if (c.system) await button(page, c.system === 'SEV' ? '퇴직금제도' : c.system).click();
  if (c.joinDate) await field(page, '제도 가입일').fill(c.joinDate);
  if (c.retireDate) await field(page, '퇴직일').fill(c.retireDate);
  if (c.dbConverted) {
    await field(page, 'DB 에서 DC 로 전환').check();
    if (c.dbJoin) await field(page, '전환 전 DB 가입일').fill(c.dbJoin);
  }

  if (c.legal !== undefined) await field(page, '법정퇴직금').fill(String(c.legal));
  if (c.honor !== undefined) await field(page, '명예퇴직금').fill(String(c.honor));
  if (c.amount !== undefined) await field(page, '퇴직급여').fill(String(c.amount));
  if (c.deferredTax !== undefined) await field(page, '이연 퇴직소득세').fill(String(c.deferredTax));

  // 앞선 케이스에서 켜 둔 계좌가 그대로 남아 판정을 오염시키지 않도록,
  // false 를 주면 명시적으로 끈다. undefined 는 '건드리지 않음'이다.
  for (const [key, label] of [['pension', '연금저축'], ['irp', 'IRP']]) {
    const a = c[key];
    if (a === false) { await field(page, '기존 ' + label + ' 보유').uncheck(); continue; }
    if (!a) continue;
    await field(page, '기존 ' + label + ' 보유').check();
    if (a.join) await field(page, '기존 ' + label + ' 가입일').fill(a.join);
    if (a.balance !== undefined) await field(page, '기존 ' + label + ' 평가액').fill(String(a.balance));
    if (a.exempt !== undefined) await field(page, '기존 ' + label + ' 세액공제 받지 않은 금액').fill(String(a.exempt));
    if (a.started) await field(page, '기존 ' + label + ' 연금개시됨').check();
  }

  if (c.pastCount !== undefined) await field(page, '과거 연금 수령 횟수').fill(String(c.pastCount));
  if (c.fees) {
    for (const [label, rate] of Object.entries(c.fees)) {
      await field(page, label + ' 연간 수수료').fill(String(rate));
    }
  }
  if (c.scope) await button(page, c.scope).click();
  if (c.mode) await button(page, c.mode).click();
  if (c.years !== undefined) await field(page, '수령 기간').fill(String(c.years));
  if (c.rate !== undefined) await field(page, '운용수익률').fill(String(c.rate));
  if (c.memo !== undefined) await field(page, '상담 메모').fill(c.memo);
  if (c.memoOnPrint) await field(page, '상담 메모 인쇄물 포함').check();

  await page.waitForTimeout(400);
}

/** 결과 영역 읽기 (역할·텍스트 기준) */
const verdictText = async (page) =>
  (await page.locator('.screen-only').getByText('판정 결과', { exact: true })
    .locator('xpath=../following-sibling::*[1]').innerText()).replace(/\s+/g, ' ').trim();

/**
 * 인출 스케줄 표.
 * 숨은 탭도 DOM 에는 남아 있으므로 '.screen-only table' 로 잡으면 계좌별 비교표 행까지
 * 섞여 들어온다. 제목으로 섹션을 좁힌 뒤 그 안의 표만 읽는다.
 */
async function scheduleRows(page) {
  await button(page, '인출 스케줄').click();
  await page.waitForTimeout(300);
  const section = page.locator('section').filter({
    has: page.getByRole('heading', { name: /인출 시뮬레이션/ })
  });
  if (await section.count() !== 1) throw new Error('인출 시뮬레이션 섹션을 찾지 못했습니다 (' + await section.count() + '개)');
  return section.locator('table tbody tr').evaluateAll((trs) =>
    trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.innerText.replace(/\s+/g, ' ').trim())));
}

/** 계좌별 비교표 */
async function comparisonRows(page) {
  await button(page, '계좌 비교').click();
  await page.waitForTimeout(300);
  const section = page.locator('section').filter({
    has: page.getByRole('heading', { name: '계좌별 비교' })
  });
  return section.locator('table tbody tr').evaluateAll((trs) =>
    trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.innerText.replace(/\s+/g, ' ').trim())));
}

/** 인쇄 시트 (A4 본문 높이는 1062px = 297mm - 상하 8mm 여백) */
const A4_CONTENT_PX = 1062;

async function printSheet(page) {
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(350);
  const el = page.locator('.sheet');
  const box = await el.boundingBox();
  const text = (await el.innerText()).replace(/\s+/g, ' ');
  await page.emulateMedia({ media: 'screen' });
  await page.waitForTimeout(150);
  return { height: Math.round(box.height), fitsA4: box.height <= A4_CONTENT_PX, text };
}

async function pdfPageCount(page) {
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(350);
  const buf = await page.pdf({
    format: 'A4', printBackground: true,
    margin: { top: '8mm', bottom: '8mm', left: '9mm', right: '9mm' }
  });
  await page.emulateMedia({ media: 'screen' });
  return (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
}

module.exports = { APP, FIELDS, BUTTONS, openApp, field, button, fillCase, verdictText, scheduleRows, comparisonRows, printSheet, pdfPageCount, A4_CONTENT_PX };
