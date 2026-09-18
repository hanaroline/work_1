// KRX 정보데이터시스템의 **지수 일별 시세 화면이 부르는 것**을 관찰한다.
//
// ── 왜 KRX 로 넘어왔나 ────────────────────────────────────────────────
// 2026-09-18, 네이버 옛 일별시세(`sise_index_day.naver`)가 410 으로 끊겼다.
// 두 차례 브라우저 관찰로 알아낸 것은 이렇다.
//
//   · 새 지수 상세 화면에 **거래대금 표 자체가 없다** — 화면 글자를 읽어
//     확인했다(「거래량 있음 · 거래대금 없음」).
//   · 거래대금 값은 두 자리에 남아 있다. `securityFe/api/index/KOSPI/
//     integration` 의 `totalInfos`(key 「대금」)와 실시간 폴링
//     `polling.finance.naver.com/api/realtime/domestic/index/KOSPI`.
//     **그러나 둘 다 「오늘 한 점」이고 장전에는 `-` 다.**
//   · 지수 차트 API 에는 거래량(`accumulatedTradingVolume`)만 있다.
//
// 브리핑은 **아침 7시 30분**에 돈다. 그 시각 네이버가 주는 거래대금은 언제나
// 빈 값이고, 전날치 계열도 없다. 그래서 네이버로는 이 항목을 되살릴 수 없다 —
// 원천을 KRX 로 옮긴다.
//
// ── 그런데 또 주소를 짐작하지 않는다 ──────────────────────────────────
// KRX 통계 화면은 `getJsonData.cmd` 한 자리에 **`bld` 이름**을 실어 보내는
// 구조다. 그 이름을 외워서 적으면 화면이 바뀔 때 또 헛돈다. 상한가·투자자별
// 때와 같이 **화면을 열어 오가는 요청을 적고, 거기서 이름을 읽는다.**
//
// 응답만 보아서는 모자란다 — KRX 는 무엇을 달라는지가 **보내는 쪽(postData)**
// 에 들어 있기 때문이다. 그래서 이 파일은 요청 본문까지 그대로 적는다.
//
// 브리핑 세션은 KRX 에 직접 못 붙으므로 **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'data/market/raw';
fs.mkdirSync(OUT, { recursive: true });

// 들어가는 문. 사람이 여는 화면만 적는다.
const ENTRIES = [
  ['KRX 정보데이터시스템 뿌리', 'http://data.krx.co.kr/'],
  ['KRX 통계 첫 화면', 'http://data.krx.co.kr/contents/MDC/MDI/mainChart/index.cmd'],
];

// 화면 안에서 지수 일별 시세 쪽으로 가는 말.
const FOLLOW = ['통계', '지수', '주가지수', '일별', '시세', '기본 통계', '전체'];

// **누를 차례.** 첫 관찰(2026-09-18)에서 KRX 뿌리 화면의 글자를 읽어 온
// 메뉴 이름 그대로다 — 「기본통계 / 지수 / 주가지수 / 전체지수 시세 /
// 전체지수 등락률 / **개별지수 시세 추이** / …」. 짐작한 이름이 아니라
// 화면이 내어 준 이름이므로 그대로 적는다. 우리가 찾는 것은 날짜별
// 거래대금이라 「개별지수 시세 추이」가 과녁이고, 안 되면 「전체지수
// 시세」로 물러선다.
const MENU = ['개별지수 시세 추이', '전체지수 시세', '주가지수', '지수'];

// 거래대금을 나르는 응답인지 가리는 말. KRX 는 `ACC_TRDVAL` 로 적는다.
const MONEY = /ACC_TRDVAL|TRD_VAL|거래대금|ACC_TRDVOL/i;

const lines = [
  `KRX 지수 일별시세 원천 관찰 ${new Date().toISOString()}`,
  '(화면이 부르는 주소와 **보내는 본문**을 그대로 적는다. bld 이름을 여기서 읽는다.)',
  '',
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

let saved = 0;
// 오간 요청을 **기계가 읽을 수 있게** 따로 모은다. 다음 단계
// (`probe_krx_index.py`)가 이것을 그대로 되보내 브라우저 없이도 열리는지
// 확인한다 — 사람이 기록을 읽고 주소를 옮겨 적는 자리를 없애려는 것이다.
// 옮겨 적는 자리가 곧 짐작이 끼어드는 자리였다.
const allPosts = [];

for (const [label, url] of ENTRIES) {
  lines.push(`### ${label}  ${url}`);
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  const posts = [];
  const seen = [];

  // **보내는 쪽**을 적는다 — KRX 는 무엇을 달라는지가 여기 들어 있다.
  page.on('request', (req) => {
    if (req.method() !== 'POST') return;
    const u = req.url();
    if (!/getJsonData|fileDn|GenerateOTP|MDC/i.test(u)) return;
    posts.push({ url: u, data: (req.postData() || '').slice(0, 1200) });
  });

  page.on('response', async (res) => {
    const u = res.url();
    if (/\.(js|css|png|jpe?g|gif|svg|woff2?|ico)(\?|$)/i.test(u)) return;
    let body = '';
    try {
      body = await res.text();
    } catch {
      /* 못 읽는 응답도 있다 */
    }
    if (!body) return;
    seen.push({ url: u, status: res.status(), bytes: body.length, money: MONEY.test(body), body });
  });

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    lines.push(`    첫 응답 ${resp ? resp.status() : '?'}`);
    await page.waitForTimeout(3000);
  } catch (e) {
    lines.push(`    페이지 열기 실패: ${String(e).slice(0, 140)}`);
  }

  // 화면 안의 관련 링크를 **주소까지** 적는다. 첫 관찰은 글자만 적어서,
  // 메뉴 이름은 읽었으나 어디로 가는지는 몰랐다.
  try {
    const links = await page.evaluate((words) => {
      const out = [];
      document.querySelectorAll('a[href]').forEach((a) => {
        const t = (a.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 30);
        if (!t || !words.some((w) => t.includes(w))) return;
        out.push(`${t} → ${a.getAttribute('href')}`);
      });
      return [...new Set(out)].slice(0, 40);
    }, FOLLOW);
    if (links.length) {
      lines.push('    화면 안의 관련 링크:');
      for (const l of links) lines.push(`      ${l}`);
    }
  } catch {
    /* 무시 */
  }

  // 메뉴를 **이름 그대로** 눌러 들어간다. 첫 관찰은 「지수」 같은 넓은 말로
  // 눌러 보다 아무것도 못 짚었다 — 화면이 내어 준 이름을 그대로 쓴다.
  let entered = false;
  for (const name of MENU) {
    try {
      const el = page.getByText(name, { exact: true }).first();
      if (await el.isVisible({ timeout: 1500 })) {
        await el.click({ timeout: 4000 });
        lines.push(`    눌러 들어감: 「${name}」`);
        await page.waitForTimeout(4000);
        entered = true;
        break;
      }
    } catch {
      /* 다음 이름으로 */
    }
  }
  if (!entered) {
    lines.push('    메뉴를 못 짚었다 — 화면 글자에서 이름을 다시 읽어야 한다');
  }

  // 조회 단추를 눌러야 자료를 부르는 화면이 많다.
  for (const word of ['조회', 'Search']) {
    try {
      const el = page.getByText(word, { exact: false }).first();
      if (await el.isVisible({ timeout: 1200 })) {
        await el.click({ timeout: 3000 });
        lines.push(`    눌러 봄: 「${word}」`);
        await page.waitForTimeout(4000);
      }
    } catch {
      /* 무시 */
    }
  }

  // **이것이 이 관찰의 알맹이다** — 무엇을 달라고 보냈는지.
  for (const p of posts) allPosts.push({ entry: label, ...p });
  if (posts.length) {
    lines.push('    보낸 요청(POST):');
    for (const p of posts.slice(0, 20)) {
      lines.push(`      → ${p.url.slice(0, 120)}`);
      lines.push(`        ${p.data}`);
    }
  } else {
    lines.push('    보낸 POST 요청이 없다 — 화면을 더 깊이 들어가야 한다');
  }

  seen.sort((a, b) => Number(b.money) - Number(a.money) || b.bytes - a.bytes);
  for (const r of seen.slice(0, 15)) {
    lines.push(
      `    [${r.status}]${r.money ? ' ·거래대금말' : '           '} · ${String(r.bytes).padStart(8)} bytes · ${r.url.slice(0, 140)}`,
    );
  }
  let n = 0;
  for (const r of seen) {
    if (!r.money) continue;
    const f = path.join(OUT, `krx_xhr_${saved}_${n++}.json`);
    fs.writeFileSync(f, r.body.slice(0, 400000));
    lines.push(`    → 본문을 ${f} 에 남겼다  (${r.url.slice(0, 130)})`);
    if (n >= 4) break;
  }
  if (n === 0) lines.push('    거래대금이 담긴 응답을 못 찾았다');
  lines.push('');
  saved += 1;
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'krx_posts.json'),
  JSON.stringify(allPosts, null, 1));
lines.push(`보낸 요청 ${allPosts.length}건을 ${OUT}/krx_posts.json 에 모았다.`);
const dest = path.join(OUT, 'krx_xhr.txt');
fs.writeFileSync(dest, lines.join('\n') + '\n');
console.log(lines.join('\n'));
