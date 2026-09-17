// 순위·목록 계열 항목이 **한 번 호출로 여러 종목**을 주는지 본다.
//
// 왜 필요한가
// ──────────────────────────────────────────────────────────────────────
// 분기·연배당을 담으려면 국내 상장 1,540종목의 지급주기를 알아야 하는데,
// 종목마다 물으면 원천이 막는다. 세 판을 재서 알아낸 것은 이렇다 —
// getEtpItemDivOutline 을 1초에 한 번씩 부르면 서른 번째쯤에서 막히고,
// 수집기처럼 1.65초에 한 번씩 부르면 192번을 탈 없이 돈다. 종목 수가 아니라
// **속도**가 한계다. 안전한 속도로 1,348종목을 재면 37분인데, 매월 1일
// 수집(13분) 위에 그걸 얹고 2단계까지 더하면 한도 75분을 넘긴다.
//
// 그래서 전수 조사 대신 모집단을 먼저 좁히려 한다. 고객 제안서에 올릴 종목은
// 어차피 규모와 유동성이 받쳐 주는 것들이므로, 순자산 상위 몇백 종목만 재면
// 된다. 문제는 순자산을 **싸게** 얻을 수 있느냐다.
//
// 이 측정기는 순위·목록 계열을 한 번씩만 불러 본다. 통틀어 열 번 남짓이고
// 2초씩 띄우므로 막힐 일이 없다. 무엇이 몇 행 오는지, 종목코드와 순자산이
// 들어 있는지, 국내 종목을 몇이나 덮는지만 적는다.
//
// 세션(클로드 쪽)에서는 etfcheck.co.kr 로 CONNECT 가 403 이라 못 돈다.
// **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://www.etfcheck.co.kr';
const OUT = 'tools/etfcheck-discovery/rank-endpoints.json';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
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
  if (!appHeaders && res.request().headers().checkclient) appHeaders = res.request().headers();
  if (!/getEtpMast|getEtpCtgMap/.test(url)) return;
  try {
    seen.push({ url, body: await res.text() });
  } catch {
    /* 못 읽는 응답은 넘긴다 */
  }
});

console.log('첫 화면을 연다');
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);
if (!appHeaders) throw new Error('앱 머리글(checkclient)을 못 잡았습니다.');

const HDRS = Object.fromEntries(
  Object.entries(appHeaders).filter(
    ([k]) => !/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k),
  ),
);

const grab = (re) => [...seen].reverse().find((x) => re.test(x.url));
const ctgMap = JSON.parse(grab(/getEtpCtgMap/)?.body || '{}').results || [];
const domestic = new Set(ctgMap.filter((r) => r.F16013 && r.domestic_flag === 1).map((r) => r.F16013));
console.log(`국내 상장 ${domestic.size}종목 (이 중 몇을 덮는지 볼 참이다)`);

async function tryOne(label, p) {
  const r = await page.evaluate(
    async ({ url, headers }) => {
      try {
        const res = await fetch(url, { headers, credentials: 'include' });
        return { status: res.status, text: await res.text() };
      } catch (e) {
        return { status: 0, text: String(e).slice(0, 200) };
      }
    },
    { url: BASE + p, headers: HDRS },
  );
  const out = { label, path: p, status: r.status, bytes: r.text.length };
  if (r.status === 200) {
    try {
      const j = JSON.parse(r.text);
      out.success = j.success;
      const rows = j.results ?? [];
      out.rows = Array.isArray(rows) ? rows.length : null;
      if (Array.isArray(rows) && rows.length) {
        out.keys = Object.keys(rows[0]);
        // 쓸모를 가르는 세 가지: 종목코드가 있나, 순자산이 있나, 국내를 덮나.
        out.hasCode = 'F16013' in rows[0];
        out.hasAum = 'F15028' in rows[0];
        out.domesticCovered = rows.filter((x) => domestic.has(x.F16013)).length;
        out.sample = rows[0];
      }
    } catch {
      out.note = `JSON 아님: ${r.text.slice(0, 80)}`;
    }
  } else {
    out.note = r.text.slice(0, 120);
  }
  console.log(
    `  ${label.padEnd(22)} ${out.status} · ${out.rows ?? '-'}행` +
      (out.domesticCovered !== undefined ? ` · 국내 ${out.domesticCovered}` : '') +
      (out.hasAum ? ' · 순자산 있음' : '') +
      (out.note ? ` · ${out.note}` : ''),
  );
  return out;
}

// 앞에서 관찰해 둔 경로들이다. 매개변수는 지어내지 않고, 있는 그대로 부른 뒤
// 오는 것만 적는다. 몇 행이 최대인지 모르므로 limit 을 크게 준 판도 같이 본다.
const PROBES = [
  ['순자산 순위', '/user/etp/getEtpRankListMarketCap'],
  ['순자산 순위(limit)', '/user/etp/getEtpRankListMarketCap?limit=2000'],
  ['거래량 순위', '/user/etp/getEtpRankListVolume'],
  ['수익률 순위', '/user/etp/getEtpRankListYield'],
  ['자금유입 목록', '/user/etp/getEtpInflowList'],
  ['분배 순위', '/user/etp/getEtpRankListCash'],
  ['최근 분배 목록', '/user/etp/getIssueRecentDiv'],
  ['최근 분배(limit)', '/user/etp/getIssueRecentDiv?limit=2000'],
  ['스크리너', '/user/etp/getEtpScreenerMobileList3'],
  ['스크리너(limit)', '/user/etp/getEtpScreenerMobileList3?limit=2000'],
];

const results = [];
for (const [label, p] of PROBES) {
  results.push(await tryOne(label, p));
  await sleep(2000); // 넉넉히 띄운다. 열 번짜리라 서두를 이유가 없다
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify({ when: new Date().toISOString(), domesticCount: domestic.size, results }, null, 2),
);

// 쓸 만한 것 = 종목코드가 있고, 국내를 100종목 넘게 덮는 응답.
const useful = results.filter((r) => r.hasCode && (r.domesticCovered || 0) >= 100);
console.log('');
console.log('══ 결론 ══');
if (useful.length) {
  for (const u of useful) {
    console.log(`  ${u.label}: 국내 ${u.domesticCovered}종목${u.hasAum ? ' (순자산 포함)' : ' (순자산 없음)'}`);
  }
} else {
  console.log('  한 번에 여러 종목을 주는 목록을 못 찾았습니다. 모집단을 싸게 좁힐 길이 없습니다.');
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const L = ['### 순위·목록 항목 확인', '', '| 항목 | 상태 | 행 | 국내 | 순자산 |', '|---|---:|---:|---:|---|'];
  for (const r of results) {
    L.push(
      `| ${r.label} | ${r.status}${r.success === false ? ' (success=false)' : ''} | ${r.rows ?? '-'} | ${r.domesticCovered ?? '-'} | ${r.hasAum ? '있음' : '없음'} |`,
    );
  }
  L.push('');
  L.push(
    useful.length
      ? `**쓸 만한 것: ${useful.map((u) => `${u.label}(국내 ${u.domesticCovered})`).join(', ')}**`
      : '**한 번에 여러 종목을 주는 목록 없음 — 모집단을 싸게 좁힐 길이 없습니다.**',
  );
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, L.join('\n') + '\n');
}

await browser.close();
