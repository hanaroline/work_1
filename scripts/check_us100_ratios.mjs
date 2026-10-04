/**
 * 화면과 수집기가 **같은 답을 내는가** — 비율 맞대기를 양쪽에서 돌려 견준다.
 *
 *   node scripts/check_us100_ratios.mjs
 *
 * **왜 견주는가.** 같은 규칙이 두 곳에 산다.
 *
 *   scripts/fetch_us100.py   reconcile_ratios   러너가 스냅숏을 만들 때
 *   us-top200.html           reconcileRatios    브라우저가 야후에 직접 붙을 때
 *
 * 한 곳만 고치면 절반만 고친 것이다. 화면은 스냅숏을 먼저 그린 뒤 실시간 값으로
 * 덮어쓰므로, 화면 쪽에 잣대가 없으면 **덮어쓰는 순간 다시 틀린 값이 찍힌다.**
 * 그렇다고 둘을 따로 두면 언젠가 갈라지고, 갈라진 뒤에는 어느 쪽이 맞는지
 * 알 수 없다.
 *
 * 그래서 시험 자료를 한 곳(data/fixtures/ratio_cases.json)에 두고, 두 구현에
 * 같은 것을 먹여 **버리는 칸이 글자까지 같은지** 본다. 파이썬 쪽은
 * `fetch_us100.py --selftest` 가 따로 돌므로 여기서는 화면 쪽이 그와 같은지를
 * 본다.
 *
 * 나가는 값이 0 이 아니면 어긋난 자리를 모두 적고 끝낸다.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PAGE = resolve(join(ROOT, 'us-top200.html'));
const FIX = resolve(join(ROOT, 'data', 'fixtures', 'ratio_cases.json'));

const fails = [];
const ok = [];
const check = (cond, label, detail) => {
  if (cond) ok.push(label);
  else fails.push(detail ? `${label} — ${detail}` : label);
};

const fixture = JSON.parse(readFileSync(FIX, 'utf-8'));
const cases = fixture.cases;
check(cases.length > 0, `시험 자료 ${cases.length} 가지를 읽음`);

const browser = await chromium.launch();
const p = await browser.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));

// 화면은 뜨면서 바깥으로 나가려 한다. **한 바이트도 내보내지 않는다** — 재려는
// 것은 순수 함수 하나뿐이고, 야후에 붙기를 기다릴 까닭이 없다.
let outbound = 0;
await p.route('**://**', (route) => {
  const u = route.request().url();
  if (u.startsWith('file://')) return route.continue();
  outbound += 1;
  return route.abort();
});
await p.goto('file://' + PAGE, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(400);

const has = await p.evaluate(() => typeof window.reconcileRatios === 'function');
check(has, '화면에 reconcileRatios 가 서 있음');

if (has) {
  const got = await p.evaluate((cs) => cs.map((c) => {
    const q = Object.assign({}, c.quote);
    const before = Object.assign({}, q);
    window.reconcileRatios(q);
    const keys = ['pbr', 'psr', 'revenue'];
    return {
      name: c.name,
      drop: keys.filter((k) => before[k] != null && q[k] == null).sort(),
      // 버리지 않은 칸을 조용히 고치지는 않는가
      touched: keys.filter((k) => q[k] != null && q[k] !== before[k]),
    };
  }), cases);

  for (let i = 0; i < cases.length; i += 1) {
    const want = (cases[i].drop || []).slice().sort();
    const g = got[i];
    check(JSON.stringify(g.drop) === JSON.stringify(want),
      `[${g.name}] 버리는 칸이 수집기와 같음`,
      `화면 ${JSON.stringify(g.drop)} · 시험 자료 ${JSON.stringify(want)}`);
    check(g.touched.length === 0,
      `[${g.name}] 버리지 않은 칸은 손대지 않음`, g.touched.join(','));
  }
}

check(errs.length === 0, '화면에 페이지 오류 없음', errs[0] || '');
check(true, `바깥으로 나간 요청 ${outbound} 건은 모두 끊음`);

await browser.close();

for (const l of ok) console.log('  ok  ' + l);
if (fails.length) {
  console.error('\n어긋난 자리 ' + fails.length + ' 곳');
  for (const f of fails) console.error('  !!  ' + f);
  process.exit(1);
}
console.log(`\n검사 ${ok.length} 가지 — 어긋남 없음`);
