/**
 * 건네는 한 장을 **화면으로** 열어 본다 — 특히 미리 보기 창 안에서.
 *
 *   node scripts/check_report_page.mjs [--file kis-timing-report.html]
 *
 * **왜 srcdoc 까지 보는가.** 이 한 장은 메신저와 미리 보기 창으로 건네진다.
 * 그런 자리는 출처가 없는 문서(`about:srcdoc`)로 열리는데, 거기서는
 * `history.replaceState` 가 SecurityError 를 던진다. 받는 사람이 탭을 누를
 * 때마다 콘솔에 붉은 줄이 쌓였고, **그 화면을 보고 「오류가 난다」고 했다.**
 * file:// 로만 열어 보던 검사로는 한 번도 걸리지 않았다.
 *
 * 그래서 같은 판을 두 자리에서 연다.
 *
 *   file://      내 PC 에서 내려받아 여는 자리
 *   srcdoc       메신저·미리 보기 창 — **오류가 났던 그 자리**
 *
 * 보는 것.
 *   가. 탭을 누르면 그 판이 펴지는가 (두 자리 모두)
 *   나. **콘솔 오류가 하나도 없는가** (두 자리 모두)
 *   다. 막힌 시장에만 「보류」 딱지가 붙는가
 *   라. 390px 폭에서 가로로 넘치지 않는가
 *
 * 나가는 값이 0 이 아니면 어긋난 자리를 모두 적고 끝낸다.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

const browser = await chromium.launch();

/** 한 자리에서 탭을 모두 눌러 본다. 돌려주는 것은 쌓인 콘솔 오류. */
async function walkTabs(where, page, frame) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

  const slugs = await frame.evaluate(() =>
    Array.prototype.map.call(document.querySelectorAll('[role="tab"]'),
      (b) => b.getAttribute('data-slug')));
  check(slugs.length >= 2, `[${where}] 탭이 둘 이상`, `${slugs.length} 개`);

  for (const slug of slugs) {
    await frame.click(`[role="tab"][data-slug="${slug}"]`);
    await page.waitForTimeout(120);
    const on = await frame.evaluate(() => {
      const v = document.querySelector('.panel:not([hidden])');
      return v ? v.id : '(없음)';
    });
    check(on === 'panel-' + slug, `[${where}] ${slug} 탭을 누르면 그 판이 펴짐`, on);
  }
  // **여기가 요점이다.** 탭이 바뀌어도 오류가 쌓이면 받는 사람은 깨진 줄 안다.
  check(errs.length === 0, `[${where}] 콘솔 오류 없음`,
    `${errs.length} 건 — ${errs[0] ? errs[0].slice(0, 110) : ''}`);
  return slugs;
}

// ── file:// — 내려받아 여는 자리 ────────────────────────────────────
{
  const p = await browser.newPage({ viewport: { width: 1240, height: 900 } });
  await p.goto('file://' + FILE, { waitUntil: 'load' });
  await p.waitForTimeout(200);
  const slugs = await walkTabs('file', p, p.mainFrame());

  // 막힘 딱지 — 붉은 띠가 있는 판의 탭에만 붙어야 한다.
  const badge = await p.evaluate(() => {
    const out = {};
    Array.prototype.forEach.call(document.querySelectorAll('[role="tab"]'), (b) => {
      const slug = b.getAttribute('data-slug');
      const panel = document.getElementById('panel-' + slug);
      out[slug] = {
        tab: !!b.querySelector('.tab-block'),
        banner: (panel.textContent || '').indexOf('이 시장에서는 이 방식으로 사지 마십시오') >= 0,
      };
    });
    return out;
  });
  for (const slug of slugs) {
    const b = badge[slug];
    check(b.tab === b.banner, `[file] ${slug} 탭 딱지와 붉은 띠가 한목소리`,
      `딱지 ${b.tab} · 띠 ${b.banner}`);
  }
  check(Object.values(badge).some((b) => b.tab), '[file] 막힌 시장이 탭에서 보임');
  await p.close();
}

// ── about:srcdoc — 메신저·미리 보기 창 ──────────────────────────────
{
  const html = readFileSync(FILE, 'utf-8');
  const p = await browser.newPage({ viewport: { width: 1240, height: 900 } });
  await p.goto('about:blank');
  await p.setContent(
    '<iframe id="f" style="width:1200px;height:800px;border:0" srcdoc="'
    + html.replace(/"/g, '&quot;') + '"></iframe>');
  await p.waitForTimeout(500);
  const fr = p.frames().find((f) => f !== p.mainFrame());
  check(!!fr, '[srcdoc] 판이 열림');
  if (fr) await walkTabs('srcdoc', p, fr);
  await p.close();
}

// ── 좁은 폭 ─────────────────────────────────────────────────────────
{
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('file://' + FILE, { waitUntil: 'load' });
  await p.waitForTimeout(200);
  const w = await p.evaluate(() => document.documentElement.scrollWidth);
  check(w <= 391, '390px 에서 가로로 넘치지 않음', `scrollWidth ${w}`);
  await p.close();
}

await browser.close();

for (const l of ok) console.log('  ok  ' + l);
if (fails.length) {
  console.error('\n어긋난 자리 ' + fails.length + ' 곳');
  for (const f of fails) console.error('  !!  ' + f);
  process.exit(1);
}
console.log(`\n검사 ${ok.length} 가지 — 어긋남 없음`);
