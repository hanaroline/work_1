// 시장일지에 필요한 **순위 화면**이 실제로 부르는 주소를 브라우저로 관찰한다.
//
// 시장일지는 「수급·거래량으로 그날의 주요종목을 짚는」 자료라, 지수보다
// **종목 순위**가 본문이다. 필요한 것은 다섯 갈래다.
//
//   ① 기관·외국인 매수/매도 상위 (코스피·코스닥 각각)
//   ② 상승률 상위 · 거래대금 상위 · 거래량 급증
//   ③ 52주 신고가 · 상한가
//   ④ ETF 상승률·거래대금 상위
//   ⑤ 테마·업종 등락률 상위
//
// ②③은 `stock.naver.com/api/domestic/market/stock/default` 한 곳이 다 준다는
// 것을 2026-09-18 상한가 관찰에서 이미 봤다(scripts/probe_limit_xhr.mjs).
// **①이 빈자리다.** 옛 화면 `sise_deal_rank.naver` 는 개편으로 껍데기만 오고,
// 주소를 짐작하면 또 다섯 바퀴를 헛돈다. 그래서 같은 방법을 쓴다 —
// 화면을 열고, 그 화면이 보내는 요청을 그대로 적는다.
//
// 세션은 네이버에 직접 못 붙으므로(CONNECT 403) **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'data/journal/raw';
fs.mkdirSync(OUT, { recursive: true });

// 첫 칸은 이름, 둘째 칸은 열 주소. 옛 주소는 새 화면으로 튕기는데,
// **튕겨 간 자리가 바로 우리가 찾던 화면**인 경우가 많다.
const PAGES = [
  ['투자자별매매상위', 'https://finance.naver.com/sise/sise_deal_rank.naver'],
  ['투자자별매매상위_기관', 'https://finance.naver.com/sise/sise_deal_rank.naver?investor_gubun=1000&type=buy&sosok=01'],
  ['투자자동향', 'https://stock.naver.com/market/stock/kr/trend/trader'],
  ['거래상위', 'https://finance.naver.com/sise/sise_quant.naver'],
  ['상승률상위', 'https://finance.naver.com/sise/sise_rise.naver'],
  ['ETF', 'https://finance.naver.com/sise/etf.naver'],
  ['신고가', 'https://finance.naver.com/sise/sise_high_price.naver'],
];

const lines = [
  `시장일지 순위 원천 관찰 ${new Date().toISOString()}`,
  '(브라우저로 열어 오가는 요청을 그대로 적는다. 수집 결과는 바꾸지 않는다.)',
  '',
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

let saved = 0;

for (const [label, url] of PAGES) {
  lines.push(`### ${label}  ${url}`);
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  const seen = [];

  page.on('response', async (res) => {
    const u = res.url();
    if (/\.(js|css|png|jpe?g|gif|svg|woff2?|ico)(\?|$)/i.test(u)) return;
    const type = (res.headers()['content-type'] || '').split(';')[0];
    let body = '';
    try {
      body = await res.text();
    } catch {
      /* 본문을 못 읽는 응답도 있다 */
    }
    // 종목코드 여섯 자리가 여럿 보이면 명단일 가능성이 크다.
    const codes = new Set((body.match(/"\d{6}"/g) || []));
    // 투자자 구분 코드(9000·9001·1000…)나 「순매수」 낱말이 보이면 ① 후보다.
    const investor =
      /investorGubun|investor_gubun|netPurchase|순매수|foreignerPureBuy|organPureBuy/i.test(body);
    seen.push({ url: u, status: res.status(), type, bytes: body.length, codes: codes.size, investor, body });
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(4000);
  } catch (e) {
    lines.push(`    페이지 열기 실패: ${String(e).slice(0, 160)}`);
  }

  // 어디로 튕겼는지, 화면에 표가 그려졌는지 함께 적는다.
  let landed = url;
  let onPage = 0;
  try {
    landed = page.url();
    onPage = await page.evaluate(
      () => document.querySelectorAll('a[href*="code="], a[href*="/domestic/stock/"]').length,
    );
  } catch {
    /* 무시 */
  }
  lines.push(`    닿은 자리 ${landed}`);
  lines.push(`    화면에 그려진 종목 링크 ${onPage} 개 · 오간 요청 ${seen.length} 건`);

  // 투자자 낱말이 보인 것을 맨 위로, 그 다음 종목코드가 많은 것 순으로 적는다.
  seen.sort((a, b) => (b.investor ? 1 : 0) - (a.investor ? 1 : 0) || b.codes - a.codes);
  for (const r of seen.slice(0, 20)) {
    lines.push(
      `    [${r.status}] ${r.investor ? '수급' : '    '} 코드 ${String(r.codes).padStart(3)} 개 · ` +
        `${String(r.bytes).padStart(7)} bytes · ${r.type} · ${r.url.slice(0, 170)}`,
    );
  }

  // 값이 담긴 응답은 본문을 남겨 다음 세션이 파서를 붙일 수 있게 한다.
  let n = 0;
  for (const r of seen) {
    if (r.codes < 3 && !r.investor) continue;
    if (r.bytes < 200) continue;
    const f = path.join(OUT, `xhr_${label}_${n++}.json`);
    fs.writeFileSync(f, r.body.slice(0, 400000));
    lines.push(`    → 본문을 ${f} 에 남겼다  (${r.url.slice(0, 150)})`);
    saved += 1;
    if (n >= 5) break;
  }
  if (n === 0) lines.push('    값이 담긴 응답을 하나도 못 찾았다');
  lines.push('');
  await ctx.close();
}

await browser.close();
const dest = path.join(OUT, 'journal_xhr.txt');
fs.writeFileSync(dest, lines.join('\n') + '\n');
console.log(lines.join('\n'));
console.log(`\n본문 ${saved} 건을 ${OUT} 에 남겼다.`);
