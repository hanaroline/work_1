// 상한가·하한가 화면이 **실제로 부르는 주소**를 브라우저로 관찰한다.
//
// 왜 이렇게까지 하나. 2026-09-10 네이버 개편 뒤 옛 화면(`sise_upper.naver`)은
// React 셸만 주고 값은 브라우저가 나중에 API 로 받아 그린다. 그 주소를
// 다섯 바퀴 동안 찍어서 맞히려 했지만 전부 빗나갔다.
//
//   네이버 앱 API 후보 7 → 404      랭킹 화면 후보 6 → 404
//   다음 금융 3 → 500                KRX 전종목 날짜 6 → 400
//   `_buildManifest.js` → 없음(App Router)   사이트맵 3 → 404
//   야후 스크리너 → 200 이지만 region=KR 이 무시돼 미국 종목이 온다
//
// **짐작을 그만두고 눈으로 본다.** 브라우저를 띄워 화면을 열고, 그 화면이
// 보내는 모든 요청을 적는다. 값이 담겨 오는 응답은 본문까지 남긴다.
//
// 브리핑 세션은 네이버에 직접 못 붙으므로(CONNECT 403) **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'data/market/raw';
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['상한가', 'https://finance.naver.com/sise/sise_upper.naver'],
  ['하한가', 'https://finance.naver.com/sise/sise_lower.naver'],
];

const lines = [
  `상한가 화면이 부르는 주소 관찰 ${new Date().toISOString()}`,
  '(브라우저로 열어 오가는 요청을 그대로 적는다. 수집 결과는 바꾸지 않는다.)',
  '',
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

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
    // 그림·글꼴·묶음은 건너뛴다. 값이 오는 것만 본다.
    if (/\.(js|css|png|jpe?g|gif|svg|woff2?|ico)(\?|$)/i.test(u)) return;
    const type = (res.headers()['content-type'] || '').split(';')[0];
    let body = '';
    try {
      body = await res.text();
    } catch {
      /* 본문을 못 읽는 응답도 있다 */
    }
    // 종목코드 여섯 자리가 여럿 보이면 명단일 가능성이 크다.
    const codes = new Set((body.match(/"\d{6}"/g) || []).map((s) => s));
    seen.push({ url: u, status: res.status(), type, bytes: body.length, codes: codes.size, body });
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    // 값이 늦게 채워지는 화면이 있으므로 조금 더 기다린다.
    await page.waitForTimeout(4000);
  } catch (e) {
    lines.push(`    페이지 열기 실패: ${String(e).slice(0, 120)}`);
  }

  // 화면에 실제로 표가 그려졌는지, 종목 링크가 몇 개인지 함께 적는다.
  let onPage = 0;
  try {
    onPage = await page.evaluate(
      () => document.querySelectorAll('a[href*="code="]').length,
    );
  } catch {
    /* 무시 */
  }
  lines.push(`    화면에 그려진 종목 링크 ${onPage} 개 · 오간 요청 ${seen.length} 건`);

  // 값이 담겨 온 것부터 적는다.
  seen.sort((a, b) => b.codes - a.codes);
  for (const r of seen.slice(0, 25)) {
    lines.push(
      `    [${r.status}] 코드 ${String(r.codes).padStart(3)} 개 · ${String(r.bytes).padStart(7)} bytes · ${r.type} · ${r.url.slice(0, 150)}`,
    );
  }
  // 코드가 셋 이상 담긴 응답은 본문을 남겨 다음 세션이 파서를 붙일 수 있게 한다.
  let n = 0;
  for (const r of seen) {
    if (r.codes < 3) continue;
    const f = path.join(OUT, `limit_xhr_${label}_${n++}.json`);
    fs.writeFileSync(f, r.body.slice(0, 400000));
    lines.push(`    → 본문을 ${f} 에 남겼다`);
    if (n >= 4) break;
  }
  if (n === 0) lines.push('    값이 담긴 응답을 하나도 못 찾았다');
  lines.push('');
  await ctx.close();
}

await browser.close();
const dest = path.join(OUT, 'limit_xhr.txt');
fs.writeFileSync(dest, lines.join('\n') + '\n');
console.log(lines.join('\n'));
