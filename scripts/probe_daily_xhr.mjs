// 일별시세·투자자별 매매동향 화면이 **실제로 부르는 주소**를 브라우저로 관찰한다.
//
// 2026-09-18 아침에 옛 주소 둘이 **HTTP 410(Gone)** 으로 끊겼다.
//
//   finance.naver.com/sise/sise_index_day.naver?code=KOSPI   → 거래대금
//   finance.naver.com/sise/investorDealTrendDay.naver        → 투자자별 순매수
//
// 410 은 「없어졌다」라 일시적 오류가 아니다. 2026-09-10 개편으로 상한가
// 화면이 끊겼을 때와 같은 일이고, **그때 얻은 교훈이 이 파일의 설계다** —
// 주소를 찍어서 맞히려다 다섯 바퀴를 헛돌았고(앱 API 7 · 랭킹 6 · 다음 3 ·
// KRX 6 · 사이트맵 3 · 야후), 찾아낸 것은 브라우저로 화면을 열어 오가는
// 요청을 그대로 적은 뒤였다.
//
// **그래서 여기서도 주소를 짐작하지 않는다.** 확실히 살아 있는 자리(사이트
// 뿌리와 옛 허브)에서 시작해 **화면 안의 링크를 타고** 들어가고, 가는 동안
// 오간 요청을 전부 적는다. 새 화면의 주소 자체를 모르는 상태에서 쓸 수
// 있어야 하기 때문이다.
//
// 브리핑 세션은 네이버에 직접 못 붙으므로(CONNECT 403) **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'data/market/raw';
fs.mkdirSync(OUT, { recursive: true });

// 들어가는 문. **새 API 주소가 아니라 「사람이 여는 화면」만 적는다** —
// 주소를 맞히는 것이 아니라 화면이 부르는 것을 보는 것이 이 파일의 일이다.
const ENTRIES = [
  ['옛 국내증시 허브', 'https://finance.naver.com/sise/'],
  ['새 증권 첫 화면', 'https://stock.naver.com/'],
  ['옛 일별시세(410 확인용)', 'https://finance.naver.com/sise/sise_index_day.naver?code=KOSPI&page=1'],
  ['옛 투자자별(410 확인용)', 'https://finance.naver.com/sise/investorDealTrendDay.naver'],
];

// 화면 안에서 타고 들어갈 말. 지수·일별·투자자별 쪽으로 가는 링크를 찾는다.
const FOLLOW = ['코스피', '지수', '일별', '시세', '투자자', '매매동향', '국내증시'];

const lines = [
  `일별시세·투자자별 원천 관찰 ${new Date().toISOString()}`,
  '(브라우저로 열어 오가는 요청을 그대로 적는다. 수집 결과는 바꾸지 않는다.)',
  '',
];

// 값이 담겨 온 응답인지 가린다. 날짜가 여럿이면 계열일 가능성이 크다.
function score(body) {
  const dates = new Set((body.match(/20\d{2}[-.]?\d{2}[-.]?\d{2}/g) || []));
  const money = /거래대금|value|accTradingValue|tradingValue|투자자|foreign|individual|organ/i.test(body);
  return { dates: dates.size, money };
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

let saved = 0;

for (const [label, url] of ENTRIES) {
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
    const s = score(body);
    seen.push({ url: u, status: res.status(), type, bytes: body.length, ...s, body });
  });

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    lines.push(`    첫 응답 ${resp ? resp.status() : '?'}`);
    await page.waitForTimeout(3000);
  } catch (e) {
    lines.push(`    페이지 열기 실패: ${String(e).slice(0, 140)}`);
  }

  // 화면 안의 링크를 적어 둔다 — **새 주소는 여기서 읽는다.**
  try {
    const links = await page.evaluate((words) => {
      const out = [];
      document.querySelectorAll('a[href]').forEach((a) => {
        const t = (a.innerText || '').trim().slice(0, 24);
        const h = a.href;
        if (!h || h.startsWith('javascript')) return;
        if (words.some((w) => t.includes(w) || h.includes(encodeURIComponent(w)))) {
          out.push(`${t} → ${h}`);
        }
      });
      return [...new Set(out)].slice(0, 30);
    }, FOLLOW);
    if (links.length) {
      lines.push('    화면 안의 관련 링크:');
      for (const l of links) lines.push(`      ${l}`);
    }
  } catch {
    /* 무시 */
  }

  // 링크 하나를 실제로 타고 들어가 본다 — 그 화면이 부르는 것까지 보려는 것이다.
  try {
    const target = await page.evaluate((words) => {
      const a = [...document.querySelectorAll('a[href]')].find((x) => {
        const t = (x.innerText || '').trim();
        return words.some((w) => t.includes(w)) && x.href && !x.href.startsWith('javascript');
      });
      return a ? a.href : null;
    }, FOLLOW);
    if (target && target !== url) {
      lines.push(`    → 타고 들어감: ${target}`);
      await page.goto(target, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    lines.push(`    링크 타기 실패: ${String(e).slice(0, 120)}`);
  }

  // 값이 담겨 온 것부터 적는다.
  seen.sort((a, b) => b.dates - a.dates);
  for (const r of seen.slice(0, 25)) {
    lines.push(
      `    [${r.status}] 날짜 ${String(r.dates).padStart(3)} 개${r.money ? ' ·값말' : '     '}` +
      ` · ${String(r.bytes).padStart(7)} bytes · ${r.type} · ${r.url.slice(0, 150)}`,
    );
  }
  // 날짜가 다섯 이상 담기고 값 관련 낱말이 보이는 응답은 본문을 남긴다.
  let n = 0;
  for (const r of seen) {
    if (r.dates < 5 || !r.money) continue;
    const f = path.join(OUT, `daily_xhr_${saved}_${n++}.json`);
    fs.writeFileSync(f, r.body.slice(0, 400000));
    lines.push(`    → 본문을 ${f} 에 남겼다  (${r.url.slice(0, 120)})`);
    if (n >= 4) break;
  }
  if (n === 0) lines.push('    값이 담긴 응답을 하나도 못 찾았다');
  lines.push('');
  saved += 1;
  await ctx.close();
}

await browser.close();
const dest = path.join(OUT, 'daily_xhr.txt');
fs.writeFileSync(dest, lines.join('\n') + '\n');
console.log(lines.join('\n'));
