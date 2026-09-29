/**
 * 엑셀 내보내기.
 *
 * CSV 와 갈라 둔 이유가 그대로 지켜야 할 것이 된다.
 *
 *   · CSV  - 인출 스케줄 표 한 장. 값만 있고 어디서나 열린다.
 *   · 엑셀 - 상담 결과 전부 + 인출표는 **수식**. 금액이나 수익률을 바꾸면 다시 계산된다.
 *
 * 그래서 '파일이 만들어졌다' 로는 아무것도 지켜지지 않는다. 수식이 틀려도 앱이 적어
 * 둔 계산값은 맞아 보이기 때문이다. 검사 쪽에서 **수식을 직접 계산해** 맞댄다
 * (tests/xlsxlib.js - 앱의 코드를 한 줄도 가져다 쓰지 않는 별개 구현이다).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { openApp, fillCase, button, field, scheduleRows } = require('./helpers');
const { readWorkbook, makeEvaluator } = require('./xlsxlib');

const 만 = 10000;
const 억 = 100000000;

/** 엑셀 단추를 눌러 받은 파일을 읽어 온다 */
async function grab(page) {
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    button(page, '엑셀 내보내기').click()
  ]);
  const to = path.join(os.tmpdir(), 'xl-' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.xlsx');
  await dl.saveAs(to);
  const buf = fs.readFileSync(to);
  fs.unlinkSync(to);
  return { name: dl.suggestedFilename(), buf, wb: readWorkbook(buf) };
}

const sched = (wb) => wb.sheets.filter((s) => s.name.indexOf('스케줄') === 0);


/**
 * 시트의 모든 수식을 독립적으로 계산해 앱이 적어 둔 값과 맞댄다.
 * 반환값은 [맞댄 칸 수, 어긋난 칸 설명들].
 */
function recompute(sheet) {
  const ev = makeEvaluator(sheet.cells);
  let n = 0;
  const bad = [];
  for (const ref of Object.keys(sheet.cells)) {
    const c = sheet.cells[ref];
    if (c.f === undefined) continue;
    n += 1;
    let got;
    try { got = ev.evaluate(c.f); } catch (e) { bad.push(ref + ' — ' + e.message); continue; }
    const tol = Math.max(1e-6, Math.abs(c.v) * 1e-9);
    if (!(Math.abs(got - c.v) <= tol)) {
      bad.push(sheet.name + '!' + ref + ' 수식 ' + c.f + ' → ' + got + ' / 적힌 값 ' + c.v);
    }
  }
  return [n, bad];
}

/* ── 열 너비 ─────────────────────────────────────────────────────
   앱이 너비를 잘못 잡으면 엑셀에서 숫자가 `#######` 가 되고 글자는 옆 칸에
   가려 끊긴다. 파일을 열어 보기 전에는 드러나지 않으므로 여기서 잰다.
   앱과 같은 규칙을 쓰되 코드는 가져다 쓰지 않고 다시 쓴다.
   ---------------------------------------------------------------- */

const COL_N = (s) => { let n = 0; for (let i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64); return n; };
const COL_S = (n) => { let s = '', k = n; while (k > 0) { const r = (k - 1) % 26; s = String.fromCharCode(65 + r) + s; k = Math.floor((k - 1) / 26); } return s; };

/** 한글·전각은 두 칸 */
function vis(s) {
  const t = String(s === null || s === undefined ? '' : s);
  let w = 0;
  for (let i = 0; i < t.length; i++) {
    w += /[ᄀ-ᇿ①-⓿■-◿⺀-꓏가-힣豈-﫿︰-﹏＀-｠]/.test(t[i]) ? 2 : 1;
  }
  return w;
}

/**
 * 보이는 글자. 서식표를 읽지 않고 값에서 짐작한다 -
 * 1 보다 작은 0 아닌 수는 백분율 칸이고(가장 긴 `0.000%` 로 잡는다),
 * 나머지 수는 천단위 구분이 붙은 정수다.
 */
function shownOf(c) {
  if (c.text !== undefined) return c.text;
  if (typeof c.v !== 'number') return String(c.v === undefined ? '' : c.v);
  if (c.v !== 0 && Math.abs(c.v) < 1) return (c.v * 100).toFixed(3) + '%';
  return Math.round(c.v).toLocaleString('en-US');
}

/**
 * 열 너비에 잘리는 칸을 모아 준다.
 * 숫자는 넘쳐 흐르지 못하므로 언제나 보고, 글자는 **오른쪽 칸이 차 있을 때만**
 * 본다 - 비어 있으면 엑셀이 그리로 흘려 그대로 읽힌다.
 */
function clipped(sheet) {
  const bad = [];
  for (const ref of Object.keys(sheet.cells)) {
    const m = /^([A-Z]+)(\d+)$/.exec(ref);
    if (!m) continue;
    const c = sheet.cells[ref];
    const shown = shownOf(c);
    if (!shown) continue;
    const isNum = c.text === undefined;
    const right = sheet.cells[COL_S(COL_N(m[1]) + 1) + m[2]];
    const rightFilled = !!right && (right.text !== undefined || right.v !== undefined || right.f !== undefined);
    if (!isNum && !rightFilled) continue;
    const w = sheet.widths[COL_N(m[1])];
    const room = w === undefined ? 8.43 : w;
    if (vis(shown) > room) {
      bad.push(sheet.name + '!' + ref + ' "' + shown + '" ' + vis(shown) + '칸 > 너비 ' + room);
    }
  }
  return bad;
}

/**
 * 입력 블록에서 라벨로 칸을 찾는다.
 *
 * 열 문자를 검사에 박아 두면 입력 블록이 옮겨 갈 때 엉뚱한 칸을 고치고도
 * 통과한다(실제로 B 열에서 옮겼다). A 열의 라벨로 행을 찾고, 그 행에서
 * 값이 들어 있는 첫 칸을 돌려준다.
 */
function inputRef(sheet, labelPart) {
  for (const ref of Object.keys(sheet.cells)) {
    const m = /^A(\d+)$/.exec(ref);
    if (!m) continue;
    const c = sheet.cells[ref];
    if (c.text === undefined || c.text.indexOf(labelPart) < 0) continue;
    for (let i = 2; i <= 16; i++) {
      const v = sheet.cells[COL_S(i) + m[1]];
      if (v && (v.text !== undefined || v.v !== undefined)) return COL_S(i) + m[1];
    }
  }
  throw new Error('입력 칸을 찾지 못했습니다: ' + labelPart);
}

/** 입력 칸 하나를 바꿔 놓고 표를 다시 계산한다 (엑셀에서 고쳐 보는 것과 같은 일) */
function whatIf(sheet, changes) {
  const cells = {};
  for (const k of Object.keys(sheet.cells)) cells[k] = Object.assign({}, sheet.cells[k]);
  for (const ref of Object.keys(changes)) {
    cells[ref] = { v: changes[ref] };
  }
  const ev = makeEvaluator(cells);
  const at = (ref) => ev.valueOf(ref);
  return { at, cells };
}

/** 표의 마지막 자료행 번호 (합계행 바로 위) */
function lastDataRow(sheet) {
  let last = 0;
  for (const ref of Object.keys(sheet.cells)) {
    const m = /^A(\d+)$/.exec(ref);
    if (m && sheet.cells[ref].f === undefined && typeof sheet.cells[ref].v === 'number') {
      last = Math.max(last, Number(m[1]));
    }
  }
  return last;
}

module.exports = async function run(t) {
  const { browser, page, errors } = await openApp({});
  try {
    /* ── 1. 기본 케이스 — 기존 연금저축 + 합산 ───────────────── */

    await fillCase(page, {
      name: '엑셀기본', birth: '650115', system: 'DB', joinDate: '2005-03-02',
      retireDate: '2026-06-30', amount: 2.6 * 억, deferredTax: 1300 * 만,
      accounts: [{ kind: 'pension', join: '2008-03-02', balance: 5000 * 만, exempt: 500 * 만, merge: true }]
    });
    await page.waitForTimeout(800);

    const a = await grab(page);
    t.ok(/\.xlsx$/.test(a.name), '확장자가 .xlsx (' + a.name + ')');
    t.ok(/^[\x20-\x7E]+$/.test(a.name), '파일명은 ASCII 만 — file:// 에서 한글 이름은 통째로 버려진다');

    // zip 을 중앙 디렉터리부터 읽고 CRC 를 다시 계산해 본다. readWorkbook 이 여기서
    // 예외를 던지면 엑셀도 못 여는 파일이다.
    t.ok(!!a.wb.files['xl/workbook.xml'], 'zip 이 규격대로 읽힌다 (중앙 디렉터리 · CRC)');
    t.ok(!!a.wb.files['xl/styles.xml'], '서식 부품이 들어 있다');
    t.ok(!!a.wb.files['[Content_Types].xml'], '콘텐츠 형식 선언이 들어 있다');

    const names = a.wb.sheets.map((s) => s.name);
    t.includes(names.join(' | '), '요약', '요약 시트');
    t.includes(names.join(' | '), '계좌 비교', '계좌 비교 시트');
    t.is(sched(a.wb).length, 1, '배정된 계좌가 하나면 스케줄 시트도 하나');
    t.ok(names.every((n) => n.length <= 31), '시트 이름이 31자를 넘지 않는다 (엑셀 제한)');
    t.ok(names.every((n) => !/[\[\]:*?\/\\]/.test(n)), '시트 이름에 못 쓰는 글자가 없다');

    // 여기가 이 검사의 핵심이다
    const [n1, bad1] = recompute(sched(a.wb)[0]);
    t.ok(n1 > 200, '스케줄 시트가 수식으로 차 있다 (' + n1 + '칸)');
    t.is(bad1.length, 0, '수식을 직접 계산한 값이 앱의 값과 같다' +
      (bad1.length ? ' — ' + bad1.slice(0, 3).join(' ; ') : ''));

    /* ── 2. 엑셀의 숫자가 화면의 숫자다 ───────────────────────── */

    const screen = await scheduleRows(page);
    const sh = sched(a.wb)[0];
    const first = lastDataRow(sh) - screen.length + 1;
    t.is(lastDataRow(sh) - first + 1, screen.length, '엑셀 행 수 = 화면 행 수 (' + screen.length + ')');

    /*
     * 열 번호로 맞대지 않는다. 화면 표에 열이 하나 늘면 조용히 엉뚱한 칸을 보게 되고,
     * 그 회귀는 이 프로젝트에서 이미 여러 번 통과해 버렸다. 엑셀 값을 화면과 **같은
     * 표기로 찍어** 그 글자가 그 줄에 있는지 본다.
     */
    let rowsOk = 0;
    const rowBad = [];
    screen.forEach((tds, i) => {
      const r = first + i;
      const line = tds.join(' ');
      const shown = (line.match(/[\d,]+/g) || []).map((x) => Number(x.replace(/,/g, '')));
      [['F', '기초자산'], ['H', '인출액'], ['M', '세액'], ['O', '기말잔액']].forEach((c) => {
        const cell = sh.cells[c[0] + r];
        if (!cell) { rowBad.push(c[0] + r + ' 칸이 없다'); return; }
        const want = Math.round(cell.v / 10000);           // 화면 표는 만원 단위다
        if (!shown.some((v) => Math.abs(v - want) <= 1)) {
          rowBad.push((i + 1) + '회차 ' + c[1] + ' 엑셀 ' + want + '만원 이 화면 줄에 없음: ' + line);
        } else rowsOk += 1;
      });
    });
    t.ok(rowsOk >= screen.length * 4 - 2, '화면 표의 값이 엑셀에 그대로 담긴다 (' + rowsOk + '칸)');
    t.is(rowBad.length, 0, '화면과 엑셀이 어긋난 칸 없음' +
      (rowBad.length ? ' — ' + rowBad.slice(0, 3).join(' ; ') : ''));

    /* ── 3. 입력을 바꾸면 표가 따라 움직인다 ─────────────────── */

    // 이것이 CSV 와 갈리는 지점이다. 값만 있으면 바꿔도 아무 일이 없다.
    const base = whatIf(sh, {});
    const lastRow = lastDataRow(sh);
    const sumRow = lastRow + 2;
    const drawBefore = base.at('H' + sumRow);
    t.ok(drawBefore > 0, '합계행이 수식으로 인출액을 더한다');

    const retRef = inputRef(sh, '이연퇴직소득 원금');
    const retireCell = sh.cells[retRef];
    const doubled = whatIf(sh, { [retRef]: retireCell.v * 2 });
    t.ok(doubled.at('H' + sumRow) > drawBefore * 1.5,
      '② 원금을 두 배로 하면 총 인출액이 크게 는다 (수식이 살아 있다)');
    t.ok(doubled.at('F' + first) > base.at('F' + first),
      '첫 회차 기초자산도 함께 는다');

    // 균등 분할은 기간 안에 계좌를 비우므로 마지막 기말잔액은 어느 수익률에서나 0 에
    // 가깝다. 수익률이 흘러가는지는 '총 인출액' 으로 본다.
    const faster = whatIf(sh, { [inputRef(sh, '운용수익률')]: 0.10 });
    t.ok(faster.at('H' + sumRow) > base.at('H' + sumRow) * 1.05,
      '운용수익률을 올리면 총 인출액이 는다');

    const zeroed = whatIf(sh, {
      [retRef]: 0,
      [inputRef(sh, '세액공제 받지 않은 금액')]: 0,
      [inputRef(sh, '세액공제분')]: 0
    });
    t.is(Math.round(zeroed.at('H' + first)), 0, '자산을 0 으로 두면 인출액도 0 (0 으로 나누어 깨지지 않는다)');

    /* ── 4. 신규 IRP — 미래에셋 공시 수수료를 수식으로 ────────── */

    await fillCase(page, {
      name: '엑셀신규IRP', birth: '650115', system: 'DC', joinDate: '2015-03-02',
      retireDate: '2026-06-30', amount: 2 * 억, deferredTax: 1000 * 만,
      // 계좌를 비워 둔다. 합산 계좌가 하나라도 있으면 요율이 가중평균(정률)으로
      // 바뀌어 공시 수수료 수식을 볼 수 없다 - 앞 케이스의 계좌가 남아 통과해 버렸다.
      accounts: []
    });
    await page.waitForTimeout(800);
    const b = await grab(page);
    const bs = sched(b.wb)[0];
    t.includes(bs.name, '신규 IRP', '신규 IRP 스케줄 시트');
    t.includes(String(bs.cells[inputRef(bs, '수수료 방식')].text || ''), '체차',
      '수수료 방식이 공시 기준이라고 적힌다');

    const [n2, bad2] = recompute(bs);
    t.ok(n2 > 200, '신규 IRP 도 수식이다 (' + n2 + '칸)');
    t.is(bad2.length, 0, '체차적용·장기할인·연금개시 할인이 수식으로도 같은 값' +
      (bad2.length ? ' — ' + bad2.slice(0, 3).join(' ; ') : ''));

    // 수수료가 실제로 체차로 붙는지 - 2억이면 1억까지 0.20%, 나머지 0.18%
    const bFirst = lastDataRow(bs) - (await scheduleRows(page)).length + 1;
    const bEv = whatIf(bs, {});
    const bal1 = bEv.at('Q' + bFirst) + bEv.at('R' + bFirst) + bEv.at('S' + bFirst);
    const fee1 = bEv.at('N' + bFirst);
    const flat = bal1 * 0.0018 + bal1 * 0.001;          // '전액 0.18%' 로 보았을 때
    t.ok(fee1 > flat, '체차적용이라 전액 0.18% 보다 많다 (' + Math.round(fee1) + ' > ' + Math.round(flat) + ')');

    // 전액 면제 조건을 켜면 수수료가 0 이 된다 - 수식이 그 칸을 실제로 본다는 뜻
    const waived = whatIf(bs, { [inputRef(bs, '전액 면제면 1')]: 1 });
    t.is(Math.round(waived.at('N' + bFirst)), 0, '전액 면제 칸을 1 로 두면 수수료가 0');
    const bSum = lastDataRow(bs) + 2;
    t.ok(waived.at('H' + bSum) > bEv.at('H' + bSum),
      '면제하면 총 인출액이 는다 (수수료가 표 전체로 흘러간다)');

    /* ── 5. 화면의 면제 조건도 엑셀에 실린다 ──────────────────── */

    await field(page, '다이렉트 개설 및 직접 운용').check();
    await page.waitForTimeout(700);
    const c = await grab(page);
    const cs = sched(c.wb)[0];
    t.is(cs.cells[inputRef(cs, '전액 면제면 1')].v, 1, '다이렉트 개설을 켜면 전액 면제 칸이 1');
    const cFirst = lastDataRow(cs) - (await scheduleRows(page)).length + 1;
    t.is(Math.round(cs.cells['N' + cFirst].v), 0, '그때 수수료 칸이 0');
    const [, badC] = recompute(cs);
    t.is(badC.length, 0, '면제 상태에서도 수식과 값이 일치');
    await field(page, '다이렉트 개설 및 직접 운용').uncheck();
    await page.waitForTimeout(400);

    /* ── 6. 분할 입금이면 계좌마다 시트 ───────────────────────── */

    // DC 규약상 퇴직급여는 연금저축으로 못 가고, 같은 사람의 명퇴금은 갈 수 있다.
    await fillCase(page, {
      name: '엑셀분할', birth: '650115', system: 'DC', joinDate: '2015-03-02',
      retireDate: '2026-06-30', amount: 2 * 억, honor: 5000 * 만, deferredTax: 1000 * 만,
      accounts: [{ kind: 'pension', join: '2008-03-02', balance: 1000 * 만 }]
    });
    await page.waitForTimeout(900);
    const d = await grab(page);
    t.ok(sched(d.wb).length >= 2, '분할 입금이면 스케줄 시트가 둘 이상 (' + sched(d.wb).length + ')');
    let allBad = [];
    let allCells = 0;
    sched(d.wb).forEach((s) => {
      const [n, bad] = recompute(s);
      allCells += n;
      allBad = allBad.concat(bad);
    });
    t.is(allBad.length, 0, '시트마다 수식과 값이 일치 (' + allCells + '칸)' +
      (allBad.length ? ' — ' + allBad.slice(0, 3).join(' ; ') : ''));
    t.is(new Set(sched(d.wb).map((s) => s.name)).size, sched(d.wb).length, '시트 이름이 겹치지 않는다');

    /* ── 7. 퇴직소득세 시트는 직접 계산을 켰을 때만 ───────────── */

    t.is(d.wb.sheets.filter((s) => s.name === '퇴직소득세').length, 0,
      '영수증 값을 넣었으면 퇴직소득세 시트는 없다');

    await fillCase(page, {
      name: '엑셀세액', birth: '650115', system: 'DB', joinDate: '2005-03-02',
      retireDate: '2026-06-30', amount: 2.6 * 억, accounts: []
    });
    await field(page, '이연 퇴직소득세 직접 계산').check();
    await page.waitForTimeout(300);
    await field(page, '입사일').fill('2000-03-02');
    await page.waitForTimeout(900);
    const e = await grab(page);
    const tax = e.wb.sheets.find((s) => s.name === '퇴직소득세');
    t.ok(!!tax, '직접 계산을 켜면 퇴직소득세 시트가 생긴다');
    const taxText = Object.keys(tax.cells).map((k) => tax.cells[k].text || '').join(' ');
    t.includes(taxText, '환산급여', '계산 과정이 단계별로 담긴다');
    t.includes(taxText, '지방소득세', '지방소득세 줄이 있다');
    t.includes(taxText, '§48', '근거 조문이 함께 담긴다');
    t.includes(taxText, '연분연승', '해설이 함께 담긴다');

    // 화면의 이연퇴직소득세와 엑셀 요약이 같은 금액인지
    const summary = e.wb.sheets.find((s) => s.name === '요약');
    const sumText = Object.keys(summary.cells).map((k) => summary.cells[k].text || '').join(' | ');
    t.includes(sumText, '이연퇴직소득세 — 합계(원)', '요약에 합계가 적힌다');
    t.includes(sumText, '이 도구가 직접 계산', '어디서 나온 값인지 적는다');

    const totalRef = Object.keys(summary.cells).find((k) =>
      /^A\d+$/.test(k) && summary.cells[k].text === '이연퇴직소득세 — 합계(원)');
    const national = Object.keys(summary.cells).find((k) =>
      /^A\d+$/.test(k) && summary.cells[k].text === '이연퇴직소득세 — 국세(원)');
    const rowOf = (ref) => Number(/\d+/.exec(ref)[0]);
    const tot = summary.cells['B' + rowOf(totalRef)].v;
    const nat = summary.cells['B' + rowOf(national)].v;
    t.ok(tot > nat, '합계가 국세보다 크다 (지방소득세가 들어 있다)');
    t.ok(Math.abs(tot - nat - Math.floor(nat * 0.1)) <= 1, '지방소득세는 국세의 10%');

    // 그 합계가 스케줄 시트의 입력 칸으로 흘러간다
    const eSh = sched(e.wb)[0];
    t.ok(Math.abs(eSh.cells[inputRef(eSh, '이연퇴직소득세 (지방소득세')].v - tot) <= 1,
      '스케줄 시트의 이연퇴직소득세가 요약과 같다');

    /* ── 7-2. 구간을 실제로 지나가는 케이스 ───────────────────── */

    /*
     * 앞의 케이스들은 10년 수령 · 만 61세라 **감면율은 30% 한 가지, 연금소득세는
     * 5.5% 한 가지**만 지난다. 그러면 감면 3단계나 연령별 세율을 엑셀에서 틀리게
     * 써 놓아도 드러나지 않는다 - 지나가지 않는 분기는 검사되지 않는다.
     *
     * 30년 수령 · 만 76세 시작 · 과거 수령 8회로 잡으면 한 번에 지난다.
     *   · 실제 연차 9 → 38 : 감면 30% · 40% · 50% 를 모두 지난다
     *   · 나이 76 → 105    : 연금소득세 4.4% 와 3.3% 를 모두 지난다
     *   · 합산 잔고를 크게 두어 ③ 재원 연금수령분이 1,500만원을 넘게 한다
     */
    // 앞 절에서 켜 둔 직접 계산을 끈다 - 켜 두면 '이연 퇴직소득세' 칸 자체가 없다
    await field(page, '이연 퇴직소득세 직접 계산').uncheck();
    await page.waitForTimeout(300);
    await fillCase(page, {
      name: '엑셀구간', birth: '500115', system: 'DB', joinDate: '2005-03-02',
      retireDate: '2026-06-30', amount: 3 * 억, deferredTax: 2000 * 만,
      years: 30, pastCount: 8,
      accounts: [{ kind: 'pension', join: '2008-03-02', balance: 4 * 억, exempt: 3000 * 만, merge: true }]
    });
    await page.waitForTimeout(900);

    const g = await grab(page);
    const gs = sched(g.wb)[0];
    const gFirst = lastDataRow(gs) - (await scheduleRows(page)).length + 1;
    const gLast = lastDataRow(gs);

    // 지나가야 할 분기를 실제로 지났는지 먼저 확인한다 (안 지났으면 아래 검사가 헛돈다)
    // X = ③연금수령분 (1,500만원 판정이 걸리는 칸), L = 감면율, C = 나이
    const seen = { red: {}, age: {}, over: 0 };
    for (let r = gFirst; r <= gLast; r++) {
      seen.red[Math.round(gs.cells['L' + r].v * 100)] = true;
      const age = gs.cells['C' + r].v;
      seen.age[age < 70 ? 55 : age < 80 ? 44 : 33] = true;
      if (gs.cells['X' + r].v > 15000000) seen.over += 1;
    }
    t.ok(Object.keys(seen.red).length >= 3, '감면율 세 단계를 모두 지난다 (' +
      Object.keys(seen.red).sort().join('% · ') + '%)');
    t.ok(Object.keys(seen.age).length >= 2, '연령별 연금소득세 구간을 둘 이상 지난다');
    t.ok(seen.over > 0, '③ 재원 연금수령분이 1,500만원을 넘는 회차가 있다 (' + seen.over + '회)');

    const [n7, bad7] = recompute(gs);
    t.ok(n7 > 600, '30년 표도 전부 수식이다 (' + n7 + '칸)');
    t.is(bad7.length, 0, '감면 3단계 · 연령별 세율 · 1,500만원 초과까지 수식이 같은 값' +
      (bad7.length ? ' — ' + bad7.slice(0, 3).join(' ; ') : ''));

    /* ── 7-3. 열 너비 — 잘리는 칸이 없다 ──────────────────────── */

    /*
     * 너비를 손으로 적어 두었더니 **같은 열을 입력 블록과 표가 나눠 쓰면서**
     * 늘 한쪽이 잘렸다. 인출 스케줄 시트의 A 열은 '회차' 에 맞춘 여섯 칸인데
     * 그 위 입력 블록에는 '① 세액공제 받지 않은 금액 (과세제외)' 가 들어 있어
     * 끊겨 보였고, B 열은 '연도' 에 맞춘 일곱 칸인데 2억 5천만원이 들어와
     * `#######` 이 됐다. 파일을 열어 보기 전에는 드러나지 않던 자리다.
     */
    let clipBad = [];
    let clipSheets = 0;
    [g.wb, e.wb, d.wb].forEach((wb) => {
      wb.sheets.forEach((s) => { clipSheets += 1; clipBad = clipBad.concat(clipped(s)); });
    });
    t.ok(clipSheets >= 8, '시트 ' + clipSheets + '장의 모든 칸을 재 보았다');
    t.is(clipBad.length, 0, '열 너비에 잘리는 칸이 없다' +
      (clipBad.length ? ' (' + clipBad.length + '칸) — ' + clipBad.slice(0, 4).join(' ; ') : ''));

    // 입력 블록의 라벨이 표의 첫 열에 갇혀 있지 않은지 - 위 검사가 지키는 핵심
    const labelRef = Object.keys(gs.cells).find((k) =>
      /^A\d+$/.test(k) && (gs.cells[k].text || '').indexOf('세액공제 받지 않은 금액') >= 0);
    t.ok(!!labelRef, '입력 라벨이 A 열에 있다');
    const labelRow = /\d+/.exec(labelRef)[0];
    t.ok(!gs.cells['B' + labelRow], '라벨 오른쪽 칸이 비어 있어 글자가 흘러 읽힌다');
    t.ok(vis(gs.cells[labelRef].text) > (gs.widths[1] || 0),
      '라벨이 A 열 너비보다 길다 (흘려 보내야만 읽히는 길이다)');

    // 반대쪽도 - 값이 들어간 열은 숫자가 다 들어갈 만큼 넓다
    const valRef = inputRef(gs, '세액공제 받지 않은 금액');
    const valCol = COL_N(/^[A-Z]+/.exec(valRef)[0]);
    t.ok(gs.widths[valCol] >= vis(shownOf(gs.cells[valRef])),
      '값이 들어간 열은 그 숫자가 다 들어간다 (' + gs.widths[valCol] + '칸)');

    /* ── 8. CSV 와 엑셀이 따로 있다 ───────────────────────────── */

    /*
     * 둘은 **한자리에** 있어야 한다.
     *
     * 처음에는 엑셀만 저장 카드에 두고 CSV 는 인출 스케줄 표 옆에 남겨 두었는데,
     * "CSV 내보내기 기능은 없는 것 같다" 는 보고를 받았다. 있었지만 탭을 열어야
     * 보이는 자리였다. 고를 때 서로 비교하는 것이라 떨어뜨려 두면 안 된다.
     */
    t.is(await button(page, '엑셀 내보내기').count(), 1, '엑셀 단추가 하나');
    t.is(await button(page, 'CSV 내보내기').count(), 1, 'CSV 단추가 하나');

    // 탭을 열지 않은 상태에서도 둘 다 보인다 (판정 탭이 기본이다)
    await button(page, '판정').click();
    await page.waitForTimeout(300);
    t.is(await button(page, '엑셀 내보내기').isVisible(), true, '판정 탭에서도 엑셀 단추가 보인다');
    t.is(await button(page, 'CSV 내보내기').isVisible(), true, '판정 탭에서도 CSV 단추가 보인다');

    const boxX = await button(page, '엑셀 내보내기').boundingBox();
    const boxC = await button(page, 'CSV 내보내기').boundingBox();
    t.ok(Math.abs(boxX.y - boxC.y) < 5, '둘이 같은 줄에 나란히 있다');

    const [csvDl] = await Promise.all([
      page.waitForEvent('download'), button(page, 'CSV 내보내기').click()
    ]);
    t.ok(/\.csv$/.test(csvDl.suggestedFilename()), 'CSV 는 여전히 .csv 로 나온다');

    /* ── 9. 아직 계산할 것이 없으면 누를 수 없다 ──────────────── */

    await fillCase(page, { name: '빈값', birth: '', system: 'DB', amount: 0 });
    await page.waitForTimeout(600);
    t.is(await button(page, '엑셀 내보내기').isDisabled(), true,
      '판정할 것이 없으면 엑셀 단추가 꺼져 있다 (빈 파일을 받지 않는다)');

    t.is(errors.length, 0, '런타임 에러 없음');
  } finally {
    await browser.close();
  }
};
