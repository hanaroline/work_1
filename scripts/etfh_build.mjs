// 수집 파일(data/etfh/{kr,global}.json)을 읽어 분류·순위를 붙이고 한 파일 HTML 을 만든다.
//   node scripts/etfh_build.mjs [--out etf-holdings.html]
// 자료가 한 번도 없으면 「예시 데이터」 뱃지를 단 예시로 만든다.
//
// 결과 파일은 바깥을 부르지 않는다(글꼴·그림·자료 모두 안에). 시험: scripts/etfh_check_page.mjs

import fs from 'node:fs';
import { classifyKR, classifyGlobal, sector1 } from './etfh_classify.mjs';
import { PERIODS } from './etfh_lib.mjs';

const args = process.argv.slice(2);
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'etf-holdings.html';
const read = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);
const kr = read('data/etfh/kr.json');
const gl = read('data/etfh/global.json');

const items = [];
const meta = { sample: false, base: {}, collectedAt: {}, fx: gl?.fx || null, notes: [] };
const r4 = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 1e4) / 1e4 : null);
const retOf = (ret) => {
  if (!ret?.r) return null;
  const o = {};
  for (const p of PERIODS) if (ret.r[p]) o[p] = [ret.r[p].v, ret.r[p].from];
  return o;
};
const top10Of = (hs) => (hs.length && hs.every((h) => typeof h.w === 'number') ? r4(hs.reduce((a, h) => a + h.w, 0)) : null);

if (kr) {
  meta.base.KR = kr.base;
  meta.collectedAt.KR = kr.collectedAt;
  for (const r of kr.items) {
    const c = classifyKR(r);
    items.push({
      code: r.code, name: r.name, mkt: 'KR', cur: 'KRW', issuer: r.issuer, index: r.index,
      aumKrw: r.aumKrw ?? r.aumEok, aum: null, fee: r.fee, cash: r.cash, divYield: r.divYield, dev: r.dev, te: r.te,
      listed: r.listed, price: r.price, priceDate: r.priceDate, stop: r.tradeStop || null, flow3m: r.flow3mEok,
      holdings: r.holdings, sectors: r.sectors, sector1: sector1(r.sectors), top10: top10Of(r.holdings),
      asset: c.asset, region: c.region, li: c.li, ret: retOf(r.ret), retBase: r.ret?.r ? r.ret.base : null, divSrc: r.divSrc || null,
      raw: { tab: r.tab, theme: r.theme },
    });
  }
}
if (gl) {
  const fx = gl.fx || {};
  for (const r of gl.items) {
    const c = classifyGlobal(r);
    const rate = fx[r.currency]?.rate;
    const base = r.ret?.base;
    if (base) meta.base[r.market] = !meta.base[r.market] || base > meta.base[r.market] ? base : meta.base[r.market];
    items.push({
      code: r.code, name: r.name, nameLocal: r.nameLocal || null, mkt: r.market, cur: r.currency, issuer: r.issuer, index: r.index,
      aum: r.aum, aumKrw: typeof r.aum === 'number' && rate ? r.aum * rate / 1e8 : null, aumSrc: r.aumSrc && r.aumSrc !== 'Yahoo totalAssets' ? r.aumSrc : null,
      fee: r.fee, cash: r.cash, divYield: r.divYield, dev: null, te: null, listed: r.listed,
      price: r.price, priceKrw: typeof r.price === 'number' && rate ? r.price * rate : null, priceDate: r.priceDate, stop: null, flow3m: null,
      holdings: r.holdings, sectors: r.sectors, sector1: sector1(r.sectors), top10: top10Of(r.holdings),
      asset: c.asset, region: c.region, li: c.li, ret: retOf(r.ret), retBase: r.ret?.r ? r.ret.base : null, divSrc: r.divSrc || null,
      category: r.category || null,
    });
  }
  meta.collectedAt.GLOBAL = gl.collectedAt;
  if (gl.cnNote) meta.notes.push(gl.cnNote);
}

if (!items.length) {
  // 한 번도 못 받았을 때 — 화면 모양만 보이는 예시. 숫자는 실제가 아니다.
  meta.sample = true;
  meta.base.KR = '2026-09-28';
  const ex = (code, name, extra) => ({ code, name, mkt: 'KR', cur: 'KRW', issuer: '예시운용', index: '예시지수', aumKrw: 1000, fee: 0.1, cash: 0.5, holdings: [], sectors: null, asset: '주식', region: '국내', li: null, ret: null, ...extra });
  items.push(
    ex('000001', '예시 ETF A', { holdings: [{ code: '000010', name: '예시종목 1', w: 20 }, { code: '000020', name: '예시종목 2', w: 10 }, { code: null, name: '원화예금', w: 1 }], sectors: { IT: 60, 금융: 40 }, sector1: 'IT', top10: 31, ret: { Y1: [10, '2025-09-26'] } }),
    ex('000002', '예시 채권 ETF B', { asset: '채권', holdings: [{ code: null, name: '예시채권', w: null }] }),
    ex('000003', '예시 ETF C (편입 미제공)', {}),
  );
}

// ── 동일 유형 순위 ──
// 유형 = 상장시장 × 자산군 × 투자지역, 레버리지·인버스는 따로. 정지 종목은 뺀다.
// 무리가 8개 미만이면 투자지역을 빼고 다시 묶는다. 값 가진 게 20개 미만이면 순위를 비운다.
// 순위 = 반올림(자리/모수×100), 최소 1. 1이 최고, 100이 최저. 평균은 그 무리의 산술평균.
const live = items.filter((it) => !it.stop);
const key3 = (it) => [it.mkt, it.asset || '미분류', it.region || '미분류', it.li ? 'LI' : ''].join('|');
const key2 = (it) => [it.mkt, it.asset || '미분류', '*', it.li ? 'LI' : ''].join('|');
const count3 = {};
for (const it of live) count3[key3(it)] = (count3[key3(it)] || 0) + 1;
const groups = {};
for (const it of live) {
  const k = count3[key3(it)] >= 8 ? key3(it) : key2(it);
  it.group = k.split('|').filter((x) => x && x !== '*').join('|');
  (groups[k] ||= []).push(it);
}
for (const g of Object.values(groups)) {
  for (const p of PERIODS) {
    const has = g.filter((it) => it.ret && it.ret[p]).sort((a, b) => b.ret[p][0] - a.ret[p][0]);
    if (!has.length) continue;
    const avg = has.reduce((s, it) => s + it.ret[p][0], 0) / has.length;
    has.forEach((it, i) => {
      (it.avg ||= {})[p] = r4(avg);
      if (has.length >= 20) {
        // 같은 값은 같은 자리
        let pos = i; while (pos > 0 && has[pos - 1].ret[p][0] === it.ret[p][0]) pos--;
        (it.rank ||= {})[p] = [Math.max(1, Math.round(((pos + 1) / has.length) * 100)), has.length];
      }
    });
  }
}

items.forEach((it, i) => { it.id = i; delete it.raw; });
const data = JSON.stringify({ meta, items }).replace(/</g, '\\u003c');
const css = fs.readFileSync('src/etfh/style.css', 'utf8');
const js = fs.readFileSync('src/etfh/app.js', 'utf8');
let html = fs.readFileSync('src/etfh/page.html', 'utf8');
html = html.replace('/*__CSS__*/', () => css).replace('/*__DATA__*/', () => data).replace('/*__JS__*/', () => js.replace(/<\/script/gi, '<\\/script'));
fs.writeFileSync(OUT, html);
console.log(`${OUT} ${(Buffer.byteLength(html) / 1e6).toFixed(2)}MB · ${items.length}종목${meta.sample ? ' (예시)' : ''} · 기준일 ${JSON.stringify(meta.base)}`);
