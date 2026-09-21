/**
 * 건네는 한 장을 **종이로** 시험한다 — 실제로 PDF 를 떠서 쪽을 센다.
 *
 *   node scripts/check_report_print.mjs [--file kis-timing-report.html]
 *
 * **왜 따로 있는가.** 인쇄를 「단추가 숨는가」로만 보고 있었다. 그래서 열 쪽짜리
 * 판의 **첫 쪽이 통째로 비어 있는 것**을 여태 지나쳤다. 한 쪽보다 큰 덩어리에
 * `page-break-inside: avoid` 를 걸면 브라우저가 그것을 통째로 다음 쪽으로 미는데,
 * 화면으로는 아무 표도 나지 않는다. 종이는 열어 봐야만 안다.
 *
 * 세 갈래로 잰다. **어느 하나만으로도 모자라다** — 이 검사기를 지으며 확인했다.
 *
 *   잉크    탭마다 진짜로 PDF 를 떠서, **첫 쪽에 들어간 내용 스트림의 길이**를
 *           나머지 쪽의 중앙값과 견준다. 첫 쪽이 비면 여기서 걸린다.
 *   쪽 수   같은 PDF 의 쪽을 센다. 「줄었다」가 아니라 **몇 쪽인가**를 안다.
 *   규칙    절·표에 「쪼개지 마라」가 도로 붙지 않았는가, 줄에는 붙어 있는가,
 *           머리글이 넘어간 쪽에서 다시 찍히는가.
 *
 * 처음에는 종이 칸(182×269mm)을 뷰포트에 주고 첫 절·표 첫 줄의 y 좌표만 재려
 * 했다. **그것으로는 못 잡는다.** 옛 규칙을 되심어 확인했더니 좌표는 그대로
 * 첫 쪽 안이었다 — 뷰포트는 쪽을 나누지 않기 때문이다. 좌표는 남겨 두되(다른
 * 흠은 잡는다), 비었는지를 말하는 것은 **잉크**다. 되심어 재 본 값:
 *
 *   성한 판    1쪽 잉크 / 나머지 중앙값 = 0.94 ~ 1.33
 *   옛 규칙    같은 비 = 0.11 ~ 0.15   ← 첫 쪽에 머리띠만 남은 그 판
 *
 * 브라우저에 PDF 뷰어가 없어 종이를 눈으로 볼 수 없다. 그래서 떠낸 PDF 를
 * **바이트로** 센다 — 화면을 못 보는 자리에서 쓸 수 있는 유일한 잣대다.
 *
 * 나가는 값이 0 이 아니면 어긋난 자리를 모두 적고 끝낸다.
 */
import { chromium } from 'playwright';
import { readFileSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i >= 0 ? process.argv[i + 1] : d;
};
const FILE = resolve(arg('--file', 'kis-timing-report.html'));

const fails = [];
const ok = [];
const check = (cond, label, detail) => {
  if (cond) ok.push(label);
  else fails.push(detail ? `${label} — ${detail}` : label);
};

// A4 에서 여백을 뺀 종이 칸. 인쇄 CSS 의 @page 와 같아야 한다 —
// 여기 따로 적어 두면 한쪽을 고칠 때 다른 쪽이 남는다.
const MM = 96 / 25.4;
const PAPER_W = Math.round(182 * MM); // 688px
const PAPER_H = Math.round(269 * MM); // 1017px

// 한 탭이 아무리 길어도 이만큼을 넘으면 무언가 밀려난 것이다. 넷을 합쳐 32 쪽
// 안쪽이면 손에 쥘 만하다.
const MAX_PAGES = 12;

// 첫 쪽의 잉크가 나머지 쪽 중앙값의 이만큼은 되어야 한다. 성한 판이 0.94,
// 첫 쪽이 빈 판이 0.15 였으므로 그 사이에 둔다. 표가 짧은 날 첫 쪽이 조금
// 성길 수는 있어도 여섯 배씩 차이가 나지는 않는다.
const MIN_INK = 0.4;

/** PDF 에서 쪽마다 들어간 내용 스트림의 길이를 뽑는다.
 *
 *  개체의 끝을 **다음 개체가 시작하는 자리**로 끊는다. 넉넉히 잘라 보다가
 *  짧은 개체의 창이 다음 개체까지 넘어가 쪽을 한 장씩 더 세었다. */
function pageInk(buf) {
  const starts = [...buf.matchAll(/(\d+)\s+0\s+obj\b/g)]
    .map((m) => ({ n: +m[1], at: m.index + m[0].length }));
  const body = new Map();
  starts.forEach((s, i) => {
    body.set(s.n, buf.slice(s.at, i + 1 < starts.length ? starts[i + 1].at : buf.length));
  });
  const out = [];
  for (const s of starts) {
    const h = body.get(s.n);
    if (!/\/Type\s*\/Page\b/.test(h)) continue;
    const c = /\/Contents\s+(\d+)\s+0\s+R/.exec(h);
    const L = c ? /\/Length\s+(\d+)/.exec(body.get(+c[1]) || '') : null;
    out.push(L ? +L[1] : null);
  }
  return out;
}

const browser = await chromium.launch();

// ── 가. 인쇄 규칙이 제자리에 있는가 ─────────────────────────────────
{
  const p = await browser.newPage({ viewport: { width: PAPER_W, height: PAPER_H } });
  await p.goto('file://' + FILE, { waitUntil: 'load' });
  await p.emulateMedia({ media: 'print' });
  await p.waitForTimeout(200);

  const rules = await p.evaluate(() => {
    const g = (sel, prop) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).getPropertyValue(prop) : '(없음)';
    };
    return {
      // **한 쪽보다 큰 것에 걸면 안 된다.** 절과 표가 바로 그것이다.
      section: g('.panel:not([hidden]) .section', 'break-inside'),
      table: g('.panel:not([hidden]) table.data', 'break-inside'),
      // **줄과 작은 상자에는 걸어야 한다.** 이것들은 한 쪽 안에 든다.
      row: g('.panel:not([hidden]) table.data tbody tr', 'break-inside'),
      warn: g('.panel:not([hidden]) .warn', 'break-inside'),
      // 넘어간 쪽에서 머리글이 없으면 그 쪽의 숫자는 못 읽는다.
      thead: g('.panel:not([hidden]) table.data thead', 'display'),
      tabs: g('.tabs', 'display'),
      // **단추는 제 display 로 재면 안 된다.** 숨는 것은 단추를 담은 `.tools`
      // 이고, 그러면 단추 자신의 display 는 여전히 inline-block 이다. 부모가
      // 숨어 실제로는 종이에 나가지 않는데도 어긋난 것으로 읽힌다 — 이 검사기
      // 첫 판에서 그랬다. 차지한 자리로 잰다.
      btnBox: (() => {
        const b = document.querySelector('.panel:not([hidden]) .btnPrint');
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { w: r.width, h: r.height };
      })(),
      bg: getComputedStyle(document.body).backgroundColor,
    };
  });
  check(rules.section === 'auto', '절에 「쪼개지 마라」가 걸려 있지 않음', rules.section);
  check(rules.table === 'auto', '표에 「쪼개지 마라」가 걸려 있지 않음', rules.table);
  check(rules.row === 'avoid', '표의 줄은 쪼개지 않음', rules.row);
  check(rules.warn === 'avoid', '작은 상자는 쪼개지 않음', rules.warn);
  check(rules.thead === 'table-header-group', '넘어간 쪽에 표 머리글이 다시 찍힘', rules.thead);
  check(rules.tabs === 'none', '인쇄판에서 탭줄이 숨음', rules.tabs);
  check(rules.btnBox !== null && rules.btnBox.w === 0 && rules.btnBox.h === 0,
    '인쇄판에서 단추가 자리를 차지하지 않음',
    rules.btnBox ? `${rules.btnBox.w}×${rules.btnBox.h}` : '못 찾음');
  check(rules.bg === 'rgb(255, 255, 255)', '인쇄판 바탕이 흼', rules.bg);
  await p.close();
}

// ── 나·다. 탭마다 첫 쪽의 자리와 쪽 수 ─────────────────────────────
const slugs = await (async () => {
  const p = await browser.newPage();
  await p.goto('file://' + FILE, { waitUntil: 'load' });
  const s = await p.evaluate(() =>
    Array.prototype.map.call(document.querySelectorAll('[role="tab"]'),
      (b) => b.getAttribute('data-slug')));
  await p.close();
  return s;
})();
check(slugs.length > 0, '탭이 있음', `${slugs.length} 개`);

let total = 0;
for (const slug of slugs) {
  const p = await browser.newPage({ viewport: { width: PAPER_W, height: PAPER_H } });
  await p.goto('file://' + FILE + '#' + slug, { waitUntil: 'load' });
  await p.waitForTimeout(250);
  await p.emulateMedia({ media: 'print' });
  await p.waitForTimeout(250);

  // 인쇄에 판이 하나만 나가는가 — 넷이 다 나가면 아무도 안 읽는다.
  const shown = await p.evaluate(() =>
    Array.prototype.filter.call(document.querySelectorAll('.panel'),
      (s) => s.getBoundingClientRect().height > 0).map((s) => s.id));
  check(shown.length === 1 && shown[0] === 'panel-' + slug,
    `[${slug}] 인쇄에 판 하나만 나감`, shown.join(','));

  // **첫 쪽이 비지 않았는가.** 머리띠 끝·첫 절·표 첫 줄의 y 좌표를 잰다.
  const geo = await p.evaluate(() => {
    const vis = document.querySelector('.panel:not([hidden])');
    const box = (sel) => {
      const el = vis.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
    };
    return {
      hero: box('.hero'),
      section: box('.section'),
      row: box('table.data tbody tr'),
    };
  });
  for (const [name, label] of [['hero', '머리띠가'], ['section', '첫 절이'], ['row', '표 첫 줄이']]) {
    const b = geo[name];
    check(b !== null && b.top < PAPER_H,
      `[${slug}] ${label} 첫 쪽 안에 있음`,
      b === null ? '못 찾음' : `top ${Math.round(b.top)}px (한 쪽 ${PAPER_H}px)`);
  }

  await p.close();

  // 진짜로 떠 본다. **새 탭에서 뜬다.** emulateMedia 를 걸었다 푼 탭에서
  // 그대로 뜨면 앞의 배치가 남아 잉크가 흐려진다 — 첫 쪽이 빈 판의 비가
  // 0.13 에서 0.34 로 올라가 문턱에 걸리다 말았다. 실제로 그랬다.
  const q = await browser.newPage({ viewport: { width: PAPER_W, height: PAPER_H } });
  await q.goto('file://' + FILE + '#' + slug, { waitUntil: 'load' });
  await q.waitForTimeout(250);
  const out = join(tmpdir(), `report-print-${slug}.pdf`);
  await q.pdf({ path: out, format: 'A4', printBackground: true,
    margin: { top: '14mm', right: '14mm', bottom: '14mm', left: '14mm' } });
  await q.close();
  const ink = pageInk(readFileSync(out).toString('latin1'));
  unlinkSync(out);
  const pages = ink.length;
  total += pages;
  check(pages >= 1 && pages <= MAX_PAGES, `[${slug}] 쪽 수 ${pages}`,
    `${pages} 쪽 (넘으면 안 되는 수 ${MAX_PAGES})`);

  const rest = ink.slice(1).filter(Boolean).sort((a, b) => a - b);
  const med = rest.length ? rest[Math.floor(rest.length / 2)] : 0;
  const ratio = med ? ink[0] / med : 0;
  check(med > 0 && ratio >= MIN_INK,
    `[${slug}] 첫 쪽이 비지 않음 (잉크 ${ratio.toFixed(2)})`,
    `1쪽 ${ink[0]} · 나머지 중앙값 ${med} · 비 ${ratio.toFixed(2)} (적어도 ${MIN_INK})`);
}
check(total > 0, `넷을 합쳐 ${total} 쪽`);

await browser.close();

for (const l of ok) console.log('  ok  ' + l);
if (fails.length) {
  console.error('\n어긋난 자리 ' + fails.length + ' 곳');
  for (const f of fails) console.error('  !!  ' + f);
  process.exit(1);
}
console.log(`\n검사 ${ok.length} 가지 — 어긋남 없음`);
