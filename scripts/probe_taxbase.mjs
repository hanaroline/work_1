// 과세표준기준가(getEtpItemTaxBaseHist)가 무슨 값인지 **재 보는** 일회성 측정기다.
// 아무것도 만들지 않고 아무것도 덮어쓰지 않는다 —
// `tools/etfcheck-discovery/taxbase.json` 에 잰 것을 적기만 한다.
//
// 왜 재야 하나
// ──────────────────────────────────────────────────────────────────────
// 지금 제안서는 분배금 **전액이 과세된다**고 보고 15.4% 를 곱한다. 그런데 ETF
// 분배금의 과세 대상은 분배금 전액이 아니라 **과표기준가 증가분을 한도로** 한다.
// 국내주식 매매차익·장내파생 손익은 과표에 반영되지 않으므로, 그 재원으로
// 분배하는 상품은 상당 부분이 비과세다. 그래서 지금 문서는 세후 수령액을
// 실제보다 적게 적고 있을 수 있다.
//
// 고칠 재료는 있다 — getEtpItemTaxBaseHist 가 일별 과표기준가를 준다. 다만
// 탐사 기록에 남은 응답이 이렇게 생겼다:
//
//   {"TRADE_DATE":"20260915","TAX_BASE":"-9791.89"}
//   {"TRADE_DATE":"20260911","TAX_BASE":"2.00"}
//
// 값이 음수고, 중간에 2.00 같은 수가 섞이고, 기본 36일치만 온다. 뜻을 모르는
// 채로 세금을 계산해 고객 문서에 넣을 수는 없다. 그래서 먼저 잰다.
//
// 재는 것
//   A. limit 이 먹는가. 12개월 창을 쓰려면 250일쯤 필요하다.
//   B. TAX_BASE 가 무엇인가 — 가격 수준인가, 누적값인가, 일별 증감인가.
//      음수는 무슨 뜻인가. 2.00 같은 튀는 값은 무엇인가.
//   C. 분배기준일 앞뒤로 값이 어떻게 움직이는가. 그 변화가 분배금과 어떤
//      관계인가(= 과세 대상 비율을 낼 수 있는가).
//   D. 성격이 다른 상품끼리 그 비율이 실제로 갈리는가. 갈리지 않으면 종목별로
//      달리 계산할 까닭이 없다.
//
// 세션(클로드 쪽)에서는 etfcheck.co.kr 로 CONNECT 가 403 이라 못 돈다.
// **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'https://www.etfcheck.co.kr';
const OUT = 'tools/etfcheck-discovery/taxbase.json';

// 성격이 갈리는 상품만 고른다. 여덟 종목이면 충분하고, 적게 물어야 원천이
// 막지 않는다. 앞선 실측에서 배운 것 — 많이 묻는 것이 화근이었다.
const TARGETS = [
  { code: '498400', name: 'KODEX 200타겟위클리커버드콜', kind: '국내주식형 커버드콜' },
  { code: '472150', name: 'TIGER 배당커버드콜액티브', kind: '국내주식형 커버드콜' },
  { code: '486290', name: 'TIGER 미국나스닥100타겟데일리커버드콜', kind: '해외주식형 커버드콜' },
  { code: '441640', name: 'KODEX 미국배당커버드콜액티브', kind: '해외주식형 커버드콜' },
  { code: '069500', name: 'KODEX 200', kind: '국내주식형 일반' },
  { code: '453850', name: 'ACE 미국30년국채액티브(H)', kind: '해외채권형' },
  { code: '214980', name: 'KODEX 단기채권PLUS', kind: '국내채권형' },
  { code: '459580', name: 'KODEX CD금리액티브(합성)', kind: '파킹형' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const t0 = Date.now();
const lap = () => ((Date.now() - t0) / 1000).toFixed(0);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const ctx = await browser.newContext({
  locale: 'ko-KR',
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

let appHeaders = null;
page.on('response', (res) => {
  if (!res.url().startsWith(BASE)) return;
  if (!appHeaders && res.request().headers().checkclient) appHeaders = res.request().headers();
});

console.log(`[${lap()}s] 첫 화면을 연다 (머리글을 받으려고)`);
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);
if (!appHeaders) throw new Error('앱 머리글(checkclient)을 못 잡았습니다.');

const HDRS = Object.fromEntries(
  Object.entries(appHeaders).filter(
    ([k]) => !/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k),
  ),
);

// 화면을 다시 열지 않는다. 앞선 실측에서 실패할 때마다 화면을 열었다가
// ERR_EMPTY_RESPONSE 악순환에 빠졌다. 실패하면 쉬었다 다시 묻기만 한다.
async function api(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const r = await page.evaluate(
      async ({ url, headers }) => {
        try {
          const res = await fetch(url, { headers: { ...headers }, credentials: 'include' });
          return { status: res.status, text: await res.text() };
        } catch (e) {
          return { status: 0, text: String(e).slice(0, 200) };
        }
      },
      { url: BASE + url, headers: HDRS },
    );
    if (r.status === 200) {
      try {
        const j = JSON.parse(r.text);
        if (j.success === true) return j.results ?? [];
        return { __err: String(j.message || 'success=false').slice(0, 120) };
      } catch {
        return { __err: `JSON 아님: ${r.text.slice(0, 80)}` };
      }
    }
    if (i < tries - 1) await sleep(1200 * (i + 1));
    else return { __err: `HTTP ${r.status}` };
  }
  return { __err: '알 수 없음' };
}

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const out = { probedAt: new Date().toISOString(), items: [] };

// ── A. limit 이 먹는지부터. 한 종목으로만 재면 된다. ────────────────────
console.log(`[${lap()}s] A. limit 이 먹는지 잰다`);
const limitTest = {};
for (const q of ['', '&limit=250', '&limit=400']) {
  const r = await api(`/user/etp/getEtpItemTaxBaseHist?code=${TARGETS[0].code}${q}`);
  limitTest[q || '(없음)'] = Array.isArray(r)
    ? { 일수: r.length, 처음: r[0]?.TRADE_DATE, 끝: r[r.length - 1]?.TRADE_DATE }
    : r;
  console.log(`   ${q || '(매개변수 없음)'} → ${JSON.stringify(limitTest[q || '(없음)'])}`);
  await sleep(400);
}
out.limitTest = limitTest;

// 제일 많이 준 매개변수를 이후에 쓴다.
const best = Object.entries(limitTest)
  .filter(([, v]) => v && v.일수)
  .sort((a, b) => b[1].일수 - a[1].일수)[0];
const LIMQ = best && best[0] !== '(없음)' ? `&${best[0].replace(/^&/, '')}` : '';
console.log(`   → 가장 많이 주는 것: ${best ? best[0] : '(없음)'} (${best?.[1].일수}일)`);

// ── B~D. 종목마다 과표 이력과 분배 이력을 함께 받아 맞춰 본다 ──────────
for (const [i, t] of TARGETS.entries()) {
  console.log(`[${lap()}s] (${i + 1}/${TARGETS.length}) ${t.name}`);
  const tax = await api(`/user/etp/getEtpItemTaxBaseHist?code=${t.code}${LIMQ}`);
  await sleep(500);
  const hist = await api(`/user/etp/getEtpItemCashHist?code=${t.code}&limit=30`);
  await sleep(500);

  const rec = { ...t };
  if (!Array.isArray(tax)) {
    rec.error = tax.__err;
    out.items.push(rec);
    continue;
  }

  // 과표 이력을 날짜 오름차순으로 정리한다.
  const rows = tax
    .map((r) => ({ date: String(r.TRADE_DATE), v: num(r.TAX_BASE) }))
    .filter((r) => /^\d{8}$/.test(r.date) && r.v !== null)
    .sort((a, b) => Number(a.date) - Number(b.date));
  rec.taxDays = rows.length;
  rec.taxFrom = rows[0]?.date;
  rec.taxTo = rows[rows.length - 1]?.date;
  rec.taxMin = Math.min(...rows.map((r) => r.v));
  rec.taxMax = Math.max(...rows.map((r) => r.v));
  rec.taxHead = rows.slice(-6); // 최근 6일
  // 값이 어떤 성격인가 — 날마다 얼마나 움직이나
  const steps = rows.slice(1).map((r, k) => r.v - rows[k].v);
  rec.stepMedian = steps.length
    ? steps.map(Math.abs).sort((a, b) => a - b)[Math.floor(steps.length / 2)]
    : null;
  // 튀는 값(앞뒤와 크게 다른 날)을 따로 적어 둔다. 2.00 같은 것의 정체.
  rec.outliers = rows
    .filter((r, k) => k > 0 && k < rows.length - 1 && Math.abs(r.v - rows[k - 1].v) > Math.abs(rows[k - 1].v) * 0.5)
    .slice(0, 6);

  // 분배기준일 앞뒤로 과표가 얼마나 줄었나 = 그 분배 중 과세 대상분
  const at = new Map(rows.map((r) => [r.date, r.v]));
  const dates = rows.map((r) => r.date);
  const divs = Array.isArray(hist)
    ? hist
        .map((h) => ({ date: String(h.F12506), amt: num(h.F31892) }))
        .filter((h) => /^\d{8}$/.test(h.date) && h.amt)
    : [];
  rec.divs = divs.slice(0, 8).map((d) => {
    // 그 날짜 직전 거래일과 그 날짜(또는 직후)의 과표를 집는다.
    const idx = dates.findIndex((x) => x >= d.date);
    if (idx <= 0) return { ...d, note: '과표 이력 범위 밖' };
    const before = at.get(dates[idx - 1]);
    const on = at.get(dates[idx]);
    const drop = before - on;
    return {
      ...d,
      전일: dates[idx - 1],
      당일: dates[idx],
      과표_전: before,
      과표_후: on,
      과표감소: Number(drop.toFixed(4)),
      // 과세 대상 비율 = 과표 감소분 / 분배금 (0~1 이면 말이 된다)
      과세비율: d.amt ? Number((drop / d.amt).toFixed(4)) : null,
    };
  });
  out.items.push(rec);
}

fs.mkdirSync('tools/etfcheck-discovery', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
await browser.close();

// ── 사람이 읽을 요약 ──────────────────────────────────────────────────
console.log(`\n${'='.repeat(72)}`);
console.log('limit 시험:', JSON.stringify(out.limitTest));
console.log(`${'='.repeat(72)}`);
for (const it of out.items) {
  if (it.error) {
    console.log(`\n── ${it.name} [${it.kind}] — 실패: ${it.error}`);
    continue;
  }
  console.log(`\n── ${it.name} [${it.kind}]`);
  console.log(`   과표 ${it.taxDays}일 (${it.taxFrom}~${it.taxTo}) · 범위 ${it.taxMin} ~ ${it.taxMax} · 하루 변동 중앙 ${it.stepMedian}`);
  if (it.outliers?.length) console.log(`   튀는 날: ${it.outliers.map((o) => `${o.date}=${o.v}`).join(', ')}`);
  for (const d of (it.divs || []).slice(0, 4)) {
    if (d.note) { console.log(`   ${d.date} 분배 ${d.amt}원 — ${d.note}`); continue; }
    console.log(
      `   ${d.date} 분배 ${String(d.amt).padStart(6)}원 · 과표 ${d.과표_전} → ${d.과표_후}` +
        ` (감소 ${d.과표감소}) · 과세비율 ${d.과세비율}`,
    );
  }
}
console.log(`\n적었습니다: ${OUT}`);
