// 일별시세(거래대금)·투자자별 매매동향 화면이 **실제로 부르는 주소**를 브라우저로 관찰한다.
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
// 오간 요청을 전부 적는다.
//
// ── 2026-09-18 두 번째 관찰: 거래대금을 겨눈다 ─────────────────────────
// 첫 관찰로 투자자별은 되찾았지만(`domestic/market/trend/daily`) **거래대금은
// 못 찾았다.** 그때 잡힌 지수 일별시세 API 는 종가·시가·고저·등락률뿐이고
// (`securityFe/api/index/KOSPI/price`), 차트 API 에는 거래량만 있었다.
// 그래서 이번에는 세 가지를 바꾼다.
//
//   ① **문을 거래대금이 보이는 화면으로** — 지수 상세(코스피·코스닥)를 직접
//      연다. 첫 관찰에서는 링크를 타고 스쳐 지나갔을 뿐이다.
//   ② **화면을 실제로 만져 본다** — 일별시세 표는 탭을 누르거나 아래로
//      내려야 비로소 불러오는 수가 있다. 탭을 눌러 보고 끝까지 내린다.
//   ③ **저장 문턱을 낮춘다** — 「날짜 5개 + 값말」이면 놓친다. 이번에는
//      **거래대금 낱말이 보이면 무조건 남긴다.** 날짜가 하나뿐인 응답에
//      오늘치 거래대금만 들어 있을 수도 있기 때문이다.
//
// 화면에 거래대금이 **글자로 찍혔는지**도 함께 적는다. 화면에 있는데 응답에
// 없다면 다른 요청이 나르고 있다는 뜻이고, 화면에도 없다면 네이버가 지수
// 거래대금 자체를 걷어낸 것이라 다른 원천을 찾아야 한다 — 이 구분이 다음
// 걸음을 정한다.
//
// 브리핑 세션은 네이버에 직접 못 붙으므로(CONNECT 403) **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'data/market/raw';
fs.mkdirSync(OUT, { recursive: true });

// 들어가는 문. **새 API 주소가 아니라 「사람이 여는 화면」만 적는다** —
// 주소를 맞히는 것이 아니라 화면이 부르는 것을 보는 것이 이 파일의 일이다.
// 앞의 둘이 이번 관찰의 과녁(거래대금)이고, 나머지는 첫 관찰에서 쓸모가
// 확인된 자리라 그대로 둔다.
const ENTRIES = [
  ['코스피 상세(거래대금 과녁)', 'https://stock.naver.com/domestic/index/KOSPI/price'],
  ['코스닥 상세(거래대금 과녁)', 'https://stock.naver.com/domestic/index/KOSDAQ/price'],
  ['옛 국내증시 허브', 'https://finance.naver.com/sise/'],
  ['새 증권 첫 화면', 'https://stock.naver.com/'],
  ['옛 일별시세(410 확인용)', 'https://finance.naver.com/sise/sise_index_day.naver?code=KOSPI&page=1'],
];

// 화면 안에서 타고 들어갈 말. 지수·일별·투자자별 쪽으로 가는 링크를 찾는다.
const FOLLOW = ['코스피', '지수', '일별', '시세', '투자자', '매매동향', '국내증시'];

// 눌러 볼 것. 일별시세 표는 탭을 눌러야 비로소 불러오는 수가 있다.
const CLICKS = ['일별', '시세', '거래', '더보기', '전체', '일별시세'];

// 거래대금을 나르는 응답인지 가리는 낱말. **하나라도 보이면 남긴다.**
const MONEY_WORDS =
  /거래대금|accumulatedTradingValue|accTradingValue|tradingValue|tradeValue|transactionAmount|dealAmount/i;

const lines = [
  `거래대금·투자자별 원천 관찰 ${new Date().toISOString()}`,
  '(브라우저로 열어 오가는 요청을 그대로 적는다. 수집 결과는 바꾸지 않는다.)',
  '이번 과녁은 **지수 일별 거래대금**이다 — 첫 관찰에서 못 찾은 하나.',
  '',
];

function score(body) {
  const dates = new Set(body.match(/20\d{2}[-.]?\d{2}[-.]?\d{2}/g) || []);
  return { dates: dates.size, money: MONEY_WORDS.test(body) };
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
    seen.push({ url: u, status: res.status(), type, bytes: body.length, ...score(body), body });
  });

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    lines.push(`    첫 응답 ${resp ? resp.status() : '?'}`);
    await page.waitForTimeout(3000);
  } catch (e) {
    lines.push(`    페이지 열기 실패: ${String(e).slice(0, 140)}`);
  }

  // ① 화면을 만져 본다 — 탭을 눌러 보고 끝까지 내린다. 일별시세 표가
  //    그제야 불려 오는 경우를 잡으려는 것이다.
  for (const word of CLICKS) {
    try {
      const el = page.getByText(word, { exact: false }).first();
      if (await el.isVisible({ timeout: 800 })) {
        await el.click({ timeout: 2500 });
        lines.push(`    눌러 봄: 「${word}」`);
        await page.waitForTimeout(2500);
      }
    } catch {
      /* 없으면 그만이다 */
    }
  }
  try {
    for (let i = 0; i < 4; i += 1) {
      await page.mouse.wheel(0, 2500);
      await page.waitForTimeout(1200);
    }
  } catch {
    /* 무시 */
  }

  // ② 화면에 거래대금이 **글자로 찍혔는지** 본다. 화면에 있는데 응답에
  //    없으면 다른 요청이 나르는 것이고, 화면에도 없으면 네이버가 지수
  //    거래대금 자체를 걷어낸 것이다 — 다음 걸음이 갈린다.
  try {
    const shown = await page.evaluate(() => {
      const t = document.body.innerText || '';
      const i = t.indexOf('거래대금');
      return {
        has: i >= 0,
        around: i >= 0 ? t.slice(Math.max(0, i - 80), i + 220).replace(/\s+/g, ' ') : '',
        hasVol: t.includes('거래량'),
      };
    });
    lines.push(
      `    화면 글자: 거래대금 ${shown.has ? '있음' : '없음'} · 거래량 ${shown.hasVol ? '있음' : '없음'}`,
    );
    if (shown.around) lines.push(`      「${shown.around}」`);
  } catch {
    /* 무시 */
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
          out.push(`${t.replace(/\s+/g, ' ')} → ${h}`);
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

  // 오간 요청을 적는다 — 거래대금을 나른 것부터.
  seen.sort((a, b) => Number(b.money) - Number(a.money) || b.dates - a.dates);
  for (const r of seen.slice(0, 25)) {
    lines.push(
      `    [${r.status}] 날짜 ${String(r.dates).padStart(3)} 개${r.money ? ' ·거래대금말' : '           '}` +
        ` · ${String(r.bytes).padStart(7)} bytes · ${r.type} · ${r.url.slice(0, 150)}`,
    );
  }

  // ③ 저장 문턱: **거래대금 낱말이 보이면 무조건 남긴다.** 날짜가 적어도
  //    놓치지 않으려는 것이다. 값이 든 계열(날짜 5개 이상)도 함께 남긴다.
  let n = 0;
  for (const r of seen) {
    if (!r.money && r.dates < 5) continue;
    if (!r.body) continue;
    const f = path.join(OUT, `turnover_xhr_${saved}_${n++}.json`);
    fs.writeFileSync(f, r.body.slice(0, 400000));
    lines.push(`    → 본문을 ${f} 에 남겼다  (${r.url.slice(0, 130)})`);
    if (n >= 8) break;
  }
  if (n === 0) lines.push('    거래대금이 담긴 응답을 하나도 못 찾았다');
  lines.push('');
  saved += 1;
  await ctx.close();
}

await browser.close();
const dest = path.join(OUT, 'turnover_xhr.txt');
fs.writeFileSync(dest, lines.join('\n') + '\n');
console.log(lines.join('\n'));
