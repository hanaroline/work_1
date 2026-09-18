/*
 * docs/signal/signal_engine.js 가 scripts/signal_lib.py 와 **같은 값을 내는지** 본다.
 *
 * 브라우저 없이 돈다 — signal_engine.js 는 순수 셈만 하므로 node 에서 그대로
 * 불러 쓸 수 있다. 화면이 그것을 제대로 부르는지는 check_signal_page.mjs 가
 * 헤드리스 브라우저에서 따로 본다. 둘은 다른 것을 묻는다.
 *
 *   node scripts/check_signal_golden.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const E = (await import(path.join(ROOT, 'docs/signal/signal_engine.js'))).default;
const golden = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/signal/golden.json'), 'utf8'));

// 부동소수 셈 차례가 달라 생기는 오차는 봐 준다. 그보다 큰 것은 **약속이 다른
// 것**이다 — 표본표준편차를 모표준편차로 바꾸면 밴드가 2.6% 달라져 여기 걸린다.
const REL_TOL = 1e-6;
const ABS_TOL = 1e-9;

let checks = 0;
const fails = [];

function near(name, got, want) {
  checks++;
  if (got == null && want == null) return;
  if (got == null || want == null) {
    fails.push(`${name}: 한쪽이 없음 js=${got} py=${want}`);
    return;
  }
  const d = Math.abs(got - want);
  if (d > ABS_TOL + REL_TOL * Math.abs(want)) {
    fails.push(`${name}: js=${got} py=${want} (차 ${d.toExponential(2)})`);
  }
}

function same(name, got, want) {
  checks++;
  if (got !== want) fails.push(`${name}: js=${JSON.stringify(got)} py=${JSON.stringify(want)}`);
}

for (const c of golden.cases) {
  const bars = c.bars;
  const ind = E.computeIndicators(bars);
  const rows = E.scoreSeries(ind, bars);

  for (const pt of c.points) {
    const i = pt.i;
    for (const [k, want] of Object.entries(pt.ind)) {
      near(`${c.symbol}@${pt.d} ind.${k}`, ind[k] ? ind[k][i] : null, want);
    }
    near(`${c.symbol}@${pt.d} axis.t`, rows[i].t, pt.axes.t);
    near(`${c.symbol}@${pt.d} axis.m`, rows[i].m, pt.axes.m);
    near(`${c.symbol}@${pt.d} axis.f`, rows[i].f, pt.axes.f);
    near(`${c.symbol}@${pt.d} axis.s`, rows[i].s, pt.axes.s);
    near(`${c.symbol}@${pt.d} total`, rows[i].total, pt.total);
    near(`${c.symbol}@${pt.d} conf`, rows[i].conf, pt.conf);
    if (pt.vp) {
      for (const [k, want] of Object.entries(pt.vp)) {
        near(`${c.symbol}@${pt.d} vp.${k}`, rows[i].vp ? rows[i].vp[k] : null, want);
      }
    }
  }

  for (const [h, want] of Object.entries(c.horizons)) {
    const ad = E.adaptiveSeries(bars, rows, Number(h));
    const sp = E.selfPctSeries(ad.score);
    const i = bars.length - 1;
    near(`${c.symbol} h=${h} score`, ad.score[i], want.score);
    near(`${c.symbol} h=${h} self_pct`, sp[i], want.self_pct);
    for (const [k, w] of Object.entries(want.weights || {})) {
      near(`${c.symbol} h=${h} w.${k}`, (ad.weights[i] || {})[k], w);
    }
    const rw = Object.assign({}, rows[i], { weights_used: ad.weights[i] || rows[i].weights_used });
    const plan = E.planOf(ind, rw, i, Number(h), sp[i]);
    same(`${c.symbol} h=${h} band`, plan.band, want.band);
    near(`${c.symbol} h=${h} stop`, plan.stop ?? null, want.stop);
    near(`${c.symbol} h=${h} target`, plan.target ?? null, want.target);
    near(`${c.symbol} h=${h} weight`, plan.weight ?? null, want.weight);
  }
}

console.log(`대조 ${checks} 가지, 종목 ${golden.cases.length}`);
if (fails.length) {
  console.log(`\n어긋남 ${fails.length}`);
  for (const f of fails.slice(0, 40)) console.log('  - ' + f);
  if (fails.length > 40) console.log(`  ... 그리고 ${fails.length - 40} 가지 더`);
  console.log('\nsignal_lib.py 와 signal_engine.js 가 갈라졌다. 둘 중 하나를 고쳐야 한다.');
  process.exit(1);
}
console.log('어긋남 없음 — 파이썬과 JS 가 같은 값을 낸다.');
