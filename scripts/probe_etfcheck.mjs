// ETFCHECK 이 **실제로 부르는 주소**를 브라우저로 관찰한다.
//
// 이 파일은 **수집기가 아니다.** data/ 를 건드리지 않는다. 관찰 결과만
// tools/etfcheck-discovery/ 에 남기고, 그걸 보고 collect_cc_etf.mjs 의
// 필드 매핑을 확정한다.
//
// 지금까지 알아낸 것
// ──────────────────────────────────────────────────────────────────────
// 403 의 정체 (4차)
//   앱 요청에는 `authorization: Bearer` 와 `checkclient: <해시>` 가 붙는다.
//   같은 머리글을 달아 fetch 하면 200 이 온다. 그래서 수집기는 화면을 한 번만
//   열어 머리글을 얻고, 나머지는 fetch 로 부른다.
// 모집단 (5차)
//   분류 대응(getEtpCtgMap)에서 국내 ∧ 커버드콜(0609005) ∧ 월배당(0609002)
//   = 61종목. 이름으로 거른 63종목과 어긋나지 않았다(이름에 '커버드콜'이
//   있는데 분류에 없는 종목 0건). 분류 쪽이 오래간다 — 상품명은 바뀐다.
// 주소·키
//   /user/common/getEtpMast              마스터 1,535행
//   /user/etp/getEtpItemOutline?code=    낱개 상세. **F15028 순자산총액**
//                                        (AssetRank2 의 NET_ASSET 과 값이 같다)
//   /user/etp/getEtpLatestFee?code=      TER / TOTAL_FEE
//   /user/etp/getEtpTermHist?F16013=&gubun=1Y   1년 일별 종가(F15001)·거래량(F15015)
//   F16013 코드 · F16002 이름 · F15001 종가 · F15301 NAV · F15023 거래대금
//   F16017 상장일 · F33961 운용사 · F34777 기초지수
// 분배금 (6차, 이번 판)
//   앱 자바스크립트에서 주소 209개를 뽑아 보니 ETFCHECK 은 분배금을
//   **Cash** 라고 부른다. dividend 로만 찾다가 못 찾았던 이유다.
//     getEtpItemDivOutline / getEtpItemCash / getEtpItemCashMonthly
//     getEtpItemCashYearly / getEtpItemCashHist
//     getEtpRankListCash / getEtpRankItemCashMonthly   ← 전 종목 한 번에?
//   이번 판은 이것들을 실제로 불러 본문을 본다.
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

const seen = [];
let appHeaders = null;
page.on('response', async (res) => {
  const url = res.url();
  if (!url.startsWith(BASE)) return;
  if (!appHeaders) {
    const h = res.request().headers();
    if (h.checkclient) appHeaders = h;
  }
  if (!/getEtpMast|getEtpCtgMap/.test(url)) return;
  try {
    seen.push({ url, body: await res.text() });
  } catch {
    /* 못 읽는 응답은 넘긴다 */
  }
});

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(10000);

const grab = (re) => [...seen].reverse().find((x) => re.test(x.url));
const mast = JSON.parse(grab(/getEtpMast/)?.body || '{}').results || [];
const ctgMap = JSON.parse(grab(/getEtpCtgMap/)?.body || '{}').results || [];
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
say(`[모집단] ${universe.length}종목 (마스터 ${mast.length}행)`);
fs.writeFileSync(path.join(OUT, 'universe.json'), JSON.stringify(universe, null, 2));

if (!appHeaders) {
  say('[중단] 앱 머리글을 못 잡았다.');
  await browser.close();
  process.exit(1);
}
const hdrs = Object.fromEntries(
  Object.entries(appHeaders).filter(
    ([k]) => !/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k),
  ),
);

const target = universe.sort((a, b) => Number(b.F15023 || 0) - Number(a.F15023 || 0))[0];
const code = target.F16013;
const isin = target.F16012;
say(`[표본] ${code} ${target.F16002}\n`);

async function call(p) {
  return page.evaluate(
    async ({ base, p, headers }) => {
      try {
        const res = await fetch(base + p, { headers, credentials: 'include' });
        const t = await res.text();
        return { status: res.status, bytes: t.length, body: t };
      } catch (e) {
        return { status: 0, bytes: 0, body: String(e).slice(0, 200) };
      }
    },
    { base: BASE, p, headers: hdrs },
  );
}

// 인자 이름을 모르므로 code 와 F16013 을 둘 다 달아 본다. 서버가 모르는
// 인자는 대개 무시한다.
const q = `code=${code}&F16013=${code}&F16012=${isin}&limit=36&etpType=ETF`;
const TRIES = [
  `/user/etp/getEtpItemDivOutline?${q}`,
  `/user/etp/getEtpItemCash?${q}`,
  `/user/etp/getEtpItemCashMonthly?${q}`,
  `/user/etp/getEtpItemCashYearly?${q}`,
  `/user/etp/getEtpItemCashHist?${q}`,
  `/user/etp/getEtpRankItemCash?${q}`,
  `/user/etp/getEtpRankItemCashMonthly?${q}`,
  `/user/etp/getEtpRankListCash?${q}`,
  `/user/etp/getEtpYieldList?${q}`,
  `/user/etp/getEtpItemTaxBaseHist?${q}`,
  `/user/etp/getIssueRecentDiv?${q}`,
  `/user/etp/getEtpScreenerMobileList3?${q}`,
];

const keep = {};
for (const p of TRIES) {
  const r = await call(p);
  const name = p.split('?')[0].split('/').pop();
  say(`  ${name} → ${r.status}, ${r.bytes}B`);
  if (r.status === 200 && r.bytes > 40) {
    say(`    ${r.body.slice(0, 2200).replace(/\s+/g, ' ')}`);
    keep[name] = r.body.slice(0, 200_000);
  }
  say('');
}
fs.writeFileSync(path.join(OUT, 'cash-endpoints.json'), JSON.stringify(keep, null, 2));

fs.writeFileSync(
  path.join(OUT, 'report.md'),
  `# ETFCHECK 관찰 ${new Date().toISOString()}\n\n\`\`\`\n${log.join('\n')}\n\`\`\`\n`,
);
await browser.close();
say('관찰 끝.');
