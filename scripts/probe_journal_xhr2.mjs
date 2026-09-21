// 1차 관찰에서 남은 **한 자리**를 마저 본다 — 기관·외국인 **종목별** 순매수.
//
// 1차(scripts/probe_journal_xhr.mjs)로 이만큼 풀렸다.
//   전종목 한 벌  stock.naver.com/api/domestic/market/stock/default (pageSize 1000 까지)
//                 → 상승률·거래대금·거래량급증·신고가·상한가를 여기서 매긴다
//   ETF          stock.naver.com/api/stockSecurity/etfs/v2/domestic?listingType=…
//   테마·업종     stock.naver.com/api/stockSecurity/rankings/v2/domestic/{themes,industries}
//
// 남은 것이 종목별 수급이다. 옛 `sise_deal_rank.naver` 는 국내증시 첫 화면으로
// 튕겨 사라졌고, `aggregateInvestorRanking` 은 **브라우저에서는 200 인데
// 평범한 요청으로는 404** 다. 그 차이가 무엇인지, 그리고 화면 왼쪽 차림표에
// 보이던 `/market/stock/kr/trend/foreigner` 가 종목별 값을 주는지 본다.
//
// 두 가지를 한다.
//   ① 후보 화면을 열어 오가는 요청을 적고, 종목코드가 담긴 본문을 남긴다.
//   ② 후보 주소를 **화면 안에서** fetch 한다 — 쿠키와 Referer 가 자동으로
//      붙으므로, 브라우저에서만 열리는 자리인지 아닌지가 여기서 갈린다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'data/journal/raw';
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['외국인매매동향_코스피', 'https://stock.naver.com/market/stock/kr/trend/foreigner?tradeType=0&marketType=kospi&periodType=segment-1day'],
  ['외국인매매동향_코스닥', 'https://stock.naver.com/market/stock/kr/trend/foreigner?tradeType=0&marketType=kosdaq&periodType=segment-1day'],
  ['투자자별매매동향', 'https://stock.naver.com/market/stock/kr/trend/trader?tradeType=0&marketType=kospi'],
  ['종목순위', 'https://stock.naver.com/market/stock/kr/stocklist'],
  ['외국인보유', 'https://stock.naver.com/market/stock/kr/foreignHold'],
];

// 화면 안에서 직접 찔러 볼 후보. 쿠키·Referer 가 자동으로 붙는다.
const INPAGE = [
  'https://stock.naver.com/api/domestic/home/marketaggregate/aggregateInvestorRanking',
  'https://stock.naver.com/api/domestic/home/marketaggregate/aggregateInvestor',
  'https://stock.naver.com/api/stockSecurity/etfs/v2/domestic?listingType=changeRateDesc&size=100&index=0',
  'https://stock.naver.com/api/stockSecurity/etfs/v2/domestic?listingType=tradingValueDesc&size=100&index=0',
  'https://stock.naver.com/api/stockSecurity/etfs/v1/domestic/leverage-types',
  'https://stock.naver.com/api/domestic/market/stock/default?tradeType=KRX&marketType=ALL&orderType=marketSum&startIdx=1000&pageSize=1000',
  'https://stock.naver.com/api/domestic/market/stock/default?tradeType=KRX&marketType=ALL&orderType=marketSum&startIdx=1900&pageSize=100',
];

const lines = [
  `시장일지 원천 관찰 2차 ${new Date().toISOString()}`,
  '(남은 자리는 기관·외국인 종목별 순매수다.)',
  '',
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const ctx = await browser.newContext({
  locale: 'ko-KR',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});

// ── ① 화면 관찰 ─────────────────────────────────────────────────────
for (const [label, url] of PAGES) {
  lines.push(`### ${label}  ${url}`);
  const page = await ctx.newPage();
  const seen = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (/\.(js|css|png|jpe?g|gif|svg|woff2?|ico)(\?|$)/i.test(u)) return;
    if (!/naver\.com/.test(u)) return;
    let body = '';
    try {
      body = await res.text();
    } catch {
      /* 무시 */
    }
    const codes = new Set(body.match(/"\d{6}"/g) || []);
    seen.push({ url: u, status: res.status(), bytes: body.length, codes: codes.size, body });
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(4000);
  } catch (e) {
    lines.push(`    페이지 열기 실패: ${String(e).slice(0, 160)}`);
  }
  lines.push(`    닿은 자리 ${page.url()}`);
  seen.sort((a, b) => b.codes - a.codes);
  for (const r of seen.slice(0, 14)) {
    lines.push(`    [${r.status}] 코드 ${String(r.codes).padStart(3)} 개 · ${String(r.bytes).padStart(7)} bytes · ${r.url.slice(0, 165)}`);
  }
  let n = 0;
  for (const r of seen) {
    if (r.codes < 5) continue;
    if (/polling\.finance/.test(r.url)) continue; // 실시간 시세 되풀이는 건너뛴다
    if (/text\/html/.test(r.url)) continue;
    fs.writeFileSync(path.join(OUT, `x2_${label}_${n++}.json`), r.body.slice(0, 400000));
    lines.push(`    → 본문을 x2_${label}_${n - 1}.json 에 남겼다  (${r.url.slice(0, 150)})`);
    if (n >= 4) break;
  }
  if (n === 0) lines.push('    값이 담긴 응답을 하나도 못 찾았다');
  lines.push('');
  await page.close();
}

// ── ② 화면 안에서 후보 주소를 직접 찌른다 ───────────────────────────
lines.push('### 화면 안에서 직접 부르기 (쿠키·Referer 가 붙은 상태)');
const page = await ctx.newPage();
await page.goto('https://stock.naver.com/market/stock/kr', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(2000);

let k = 0;
for (const url of INPAGE) {
  let out;
  try {
    out = await page.evaluate(async (u) => {
      const r = await fetch(u, { credentials: 'include' });
      const t = await r.text();
      return { status: r.status, body: t.slice(0, 400000) };
    }, url);
  } catch (e) {
    lines.push(`    [실패] ${url.slice(0, 150)} — ${String(e).slice(0, 100)}`);
    continue;
  }
  const codes = new Set(out.body.match(/"\d{6}"/g) || []).size;
  lines.push(`    [${out.status}] 코드 ${String(codes).padStart(4)} 개 · ${String(out.body.length).padStart(8)} bytes · ${url.slice(0, 150)}`);
  if (out.status === 200 && out.body.length > 50) {
    const f = path.join(OUT, `x2_inpage_${k++}.json`);
    fs.writeFileSync(f, out.body);
    lines.push(`      → ${f}`);
  }
}
lines.push('');

// 쿠키를 들고 평범한 요청으로도 되는지 — 되면 수집기는 브라우저 없이 돈다.
const cookies = await ctx.cookies('https://stock.naver.com');
lines.push(`### 쿠키 ${cookies.length} 개: ` + cookies.map((c) => c.name).join(', ').slice(0, 300));
fs.writeFileSync(
  path.join(OUT, 'x2_cookies.txt'),
  cookies.map((c) => `${c.name}=${c.value}`).join('; ') + '\n',
);
lines.push('    → 쿠키 한 줄을 x2_cookies.txt 에 남겼다 (수집기가 흉내 낼 수 있는지 확인용)');

await browser.close();
const dest = path.join(OUT, 'journal_xhr2.txt');
fs.writeFileSync(dest, lines.join('\n') + '\n');
console.log(lines.join('\n'));
