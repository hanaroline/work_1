// ETFCHECK 이 **실제로 부르는 주소**를 브라우저로 관찰한다.
//
// 이 파일은 **수집기가 아니다.** data/ 를 건드리지 않는다. 관찰 결과만
// tools/etfcheck-discovery/ 에 남기고, 그걸 보고 collect_cc_etf.mjs 의
// 필드 매핑을 확정한다.
//
// 지금까지 알아낸 것
// ──────────────────────────────────────────────────────────────────────
// 주소
//   GET /user/common/getEtpMast              국내 ETP 마스터 1,535행
//   GET /user/common/getEtpCtgMap            종목-분류 대응 9,092행
//   GET /user/common/getEtpCtgMiddle         분류 이름 (커버드콜 0609005, 월배당 0609002)
//   GET /user/etp/getEtpItemOutline?code=&befDate=   낱개 상세
//   GET /user/etp/getEtpLatestFee?code=      TER / TOTAL_FEE
//   GET /user/etp/getEtpTermHist?F16013=&gubun=1Y    1년 일별 종가·거래량
//   GET /user/etp/getSimpleEtpHist?F16013=&limit=&type=diff  일별 NAV·상장좌수·설정환매
// 키
//   F16013 종목코드 · F16002 종목명 · F15001 종가 · F15301 NAV
//   F15023 거래대금(당일) · F15015 거래량 · F16017 상장일 · F33961 운용사
//   **F15028 순자산총액** — getEtpItemOutlineAssetRank2 의 NET_ASSET 과 같은 값이라
//   확인했다(498400: 5,759,831,000,000 원). 마스터의 W00065 는 음수가 나오므로
//   순자산이 아니다.
// 403 의 정체
//   앱 요청에는 `authorization: Bearer` 와 `checkclient: <해시>` 가 붙는다.
//   같은 머리글을 달아 fetch 하면 200 이 온다(맨몸 403 → 머리글 복사 200,
//   1,177,037 bytes). 그래서 수집기는 브라우저로 화면을 한 번만 열어 머리글을
//   얻고, 나머지는 fetch 로 부른다. 종목마다 화면을 여는 것보다 훨씬 빠르고,
//   잇달아 열다 ERR_EMPTY_RESPONSE 를 맞는 일도 없다.
// 아직 못 찾은 것
//   · 분배금(월분배율) 주소. /dividend 화면은 잇달아 열면 빈 응답이 온다.
//     이번 판은 화면을 여는 대신 **앱의 자바스크립트 묶음을 읽어** 주소
//     목록을 뽑는다. 짐작이 아니라 앱이 가진 목록 그대로다.
//
// 세션(클로드 쪽)에서는 etfcheck.co.kr 로 CONNECT 가 403 이라 못 돈다.
// **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'tools/etfcheck-discovery';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.etfcheck.co.kr';
const log = [];
const say = (s) => {
  log.push(s);
  console.log(s);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const ctx = await browser.newContext({
  locale: 'ko-KR',
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

const xhr = [];
let appHeaders = null;
page.on('response', async (res) => {
  const url = res.url();
  if (!url.startsWith(BASE)) return;
  if (/\/user\/|\/stock\/|\/etc\//.test(url) && !appHeaders) {
    const h = res.request().headers();
    if (h.checkclient) appHeaders = h;
  }
  if (/\.(css|png|jpe?g|gif|svg|webp|woff2?|ico)(\?|$)/i.test(url)) return;
  if (/\.js(\?|$)/i.test(url)) {
    xhr.push({ url, kind: 'js' });
    return;
  }
  let body = '';
  try {
    body = await res.text();
  } catch {
    return;
  }
  const head = body.slice(0, 200).trim();
  if (head.startsWith('{') || head.startsWith('[')) xhr.push({ url, kind: 'json', body });
});

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(10000);

const mastRes = [...xhr].reverse().find((x) => /getEtpMast/.test(x.url));
const mast = mastRes ? JSON.parse(mastRes.body).results || [] : [];
const ctgMapRes = [...xhr].reverse().find((x) => /getEtpCtgMap/.test(x.url));
const ctgMap = ctgMapRes ? JSON.parse(ctgMapRes.body).results || [] : [];
say(`[마스터] ${mast.length}행, [분류대응] ${ctgMap.length}행`);

// 분류로 고른 국내 월배당 커버드콜
const pick = new Set(
  ctgMap
    .filter(
      (r) =>
        r.F16013 &&
        r.domestic_flag === 1 &&
        String(r.ctgInfo || '').includes('0609005') &&
        String(r.ctgInfo || '').includes('0609002'),
    )
    .map((r) => r.F16013),
);
const universe = mast.filter((r) => pick.has(r.F16013));
say(`[모집단] 국내 ∧ 커버드콜(0609005) ∧ 월배당(0609002) = ${universe.length}종목`);
fs.writeFileSync(path.join(OUT, 'universe.json'), JSON.stringify(universe, null, 2));

// ── 앱의 자바스크립트 묶음에서 주소 목록을 뽑는다 ──────────────────────
const scripts = await page.evaluate(() =>
  performance
    .getEntriesByType('resource')
    .map((e) => e.name)
    .filter((n) => /\.js(\?|$)/.test(n) && n.includes(location.host)),
);
say(`\n[묶음] 자바스크립트 ${scripts.length}개를 읽는다`);

const endpoints = new Set();
for (const url of scripts) {
  const text = await page.evaluate(async (u) => {
    try {
      return await (await fetch(u)).text();
    } catch {
      return '';
    }
  }, url);
  for (const m of text.matchAll(/["'`](\/(?:user|stock|etc)\/[A-Za-z0-9_\-/]+)["'`]/g)) {
    endpoints.add(m[1]);
  }
}
const all = [...endpoints].sort();
fs.writeFileSync(path.join(OUT, 'endpoints.json'), JSON.stringify(all, null, 2));
say(`[묶음] 주소 ${all.length}개를 찾았다`);

const dvd = all.filter((p) => /dvd|divid|dist|pay|분배/i.test(p));
say(`\n[분배 후보 주소] ${dvd.length}개`);
for (const p of dvd) say(`   ${p}`);

// ── 머리글을 달아 직접 불러 본다 ───────────────────────────────────────
if (!appHeaders) {
  say('\n[중단] 앱 머리글을 못 잡았다.');
} else {
  const hdrs = Object.fromEntries(
    Object.entries(appHeaders).filter(
      ([k]) => !/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k),
    ),
  );
  say(`\n[머리글] ${Object.keys(hdrs).join(', ')}`);

  const target = universe.sort((a, b) => Number(b.F15023 || 0) - Number(a.F15023 || 0))[0];
  const code = target.F16013;
  say(`[표본] ${code} ${target.F16002}`);

  // 분배 후보 + 이미 아는 낱개 주소를 한 번씩 부른다. 인자 이름이
  // code 인지 F16013 인지 모르므로 둘 다 달아 본다.
  const tries = [
    ...dvd.map((p) => `${p}?code=${code}&F16013=${code}&limit=24`),
    `/user/etp/getEtpItemOutline?code=${code}&befDate=20250916`,
    `/user/etp/getEtpLatestFee?code=${code}`,
  ];
  for (const p of tries) {
    const r = await page.evaluate(
      async ({ base, p, headers }) => {
        try {
          const res = await fetch(base + p, { headers, credentials: 'include' });
          const t = await res.text();
          return { status: res.status, bytes: t.length, head: t.slice(0, 2500) };
        } catch (e) {
          return { status: 0, head: String(e).slice(0, 200) };
        }
      },
      { base: BASE, p, headers: hdrs },
    );
    say(`\n  ${p}\n    → ${r.status}, ${r.bytes ?? 0}B`);
    if (r.status === 200) say(`    ${r.head.replace(/\s+/g, ' ')}`);
  }
}

fs.writeFileSync(
  path.join(OUT, 'report.md'),
  `# ETFCHECK 관찰 ${new Date().toISOString()}\n\n\`\`\`\n${log.join('\n')}\n\`\`\`\n`,
);
await browser.close();
say('\n관찰 끝.');
