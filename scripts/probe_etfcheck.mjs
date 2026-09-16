// ETFCHECK 이 **실제로 부르는 주소**를 브라우저로 관찰한다.
//
// 왜 관찰부터 하나
// ──────────────────────────────────────────────────────────────────────
// ETFCHECK 은 화면 껍데기만 내려주고 값은 브라우저가 나중에 API 로 받아
// 그린다. 게다가 키 이름이 `F16002`, `W00065` 같은 사내 코드라 이름만
// 보고는 무슨 값인지 알 수 없다. 주소도 키 뜻도 짐작하지 않는다 —
// 화면을 열고, 오가는 요청을 전부 적고, 값이 담겨 온 응답만 남긴다.
//
// 이 파일은 **수집기가 아니다.** data/ 를 건드리지 않는다. 관찰 결과만
// tools/etfcheck-discovery/ 에 남기고, 그걸 보고 collect_cc_etf.mjs 의
// 필드 매핑을 확정한다.
//
// 1차 관찰(2026-09-16)에서 찾은 것
//   GET /user/common/getEtpMast            국내 ETP 마스터 1,535행 — 이름·현재가·NAV·수익률·운용사
//   GET /stock/etp/getEtfTotalExpenseRatio 총보수/실부담비용률 1,171행
//   GET /user/common/getEtpCtgLarge|Middle|Map  분류 체계와 종목-분류 대응
// 아직 못 찾은 것 — 이번 판에서 찾는다
//   · 분배금(월분배율) 이 담긴 주소
//   · 순자산총액. W00065 는 음수가 나오는 종목이 있어(CD금리액티브 -989억)
//     순자산이 아니다. 자금유출입으로 보인다. 확인 전에는 쓰지 않는다.
//
// 세션(클로드 쪽)에서는 etfcheck.co.kr 로 CONNECT 가 403 이라 못 돈다.
// **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

// `/discovery/` 는 .gitignore 에 걸려 있다. 관찰 결과는 저장소에 남아야
// 다음 사람이 필드 매핑을 고칠 때 근거로 쓸 수 있으므로 tools/ 밑에 둔다.
const OUT = 'tools/etfcheck-discovery';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.etfcheck.co.kr';

// 종목코드 모양. 국내 ETF 는 여섯 자리인데 2024년 뒤 상장분에는
// `0040Y0` 처럼 숫자·영문이 섞인 것이 있다. 여섯 자리 숫자만 찾으면
// 최근 상장한 커버드콜을 통째로 놓친다.
const CODE = /^[0-9][0-9A-Z]{5}$/;

// 1차에서 확인한 대량 조회 주소. 화면을 거치지 않고 바로 받는다.
const BULK = [
  ['mast', '/user/common/getEtpMast'],
  ['expense', '/stock/etp/getEtfTotalExpenseRatio'],
  ['ctgLarge', '/user/common/getEtpCtgLarge'],
  ['ctgMiddle', '/user/common/getEtpCtgMiddle'],
  ['ctgMap', '/user/common/getEtpCtgMap'],
];

// 낱개 종목 화면·스크리너 주소 후보. 맞는 것 하나만 열리면 그 화면이
// 부르는 분배금 주소를 우리가 받아 적는다.
const PAGE_CANDIDATES = (code) => [
  `/mobile/etpitem/${code}/basic`,
  `/mobile/etpitem/${code}/dividend`,
  `/mobile/etpitem/${code}/distribution`,
  `/etpitem/${code}/basic`,
  `/stock/etp/etpItem?code=${code}`,
  '/mobile/screener',
  '/screener',
  '/mobile/etpscreener',
];

const log = [];
const say = (s) => {
  log.push(s);
  console.log(s);
};

function summarize(node, depth = 0, key = '$') {
  const pad = '  '.repeat(depth);
  if (node === null || typeof node !== 'object') {
    return `${pad}${key}: ${JSON.stringify(node)}`.slice(0, 200);
  }
  if (Array.isArray(node)) {
    const out = [`${pad}${key}: 배열 ${node.length}개`];
    if (node.length) out.push(summarize(node[0], depth + 1, '[0]'));
    return out.join('\n');
  }
  const out = [`${pad}${key}: 객체 {${Object.keys(node).slice(0, 40).join(', ')}}`];
  if (depth < 2) {
    for (const [k, v] of Object.entries(node).slice(0, 8)) {
      out.push(summarize(v, depth + 1, k));
    }
  }
  return out.join('\n');
}

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

// 오가는 JSON 을 전부 적는다. 화면을 옮겨 다니는 동안 계속 쌓인다.
const xhr = [];
page.on('response', async (res) => {
  const url = res.url();
  if (!url.startsWith(BASE)) return;
  if (/\.(js|css|png|jpe?g|gif|svg|webp|woff2?|ico)(\?|$)/i.test(url)) return;
  let body = '';
  try {
    body = await res.text();
  } catch {
    return;
  }
  const head = body.slice(0, 200).trim();
  if (!(head.startsWith('{') || head.startsWith('['))) return;
  xhr.push({ url, status: res.status(), bytes: body.length, body: body.slice(0, 120_000) });
});

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);

// ── 1. 대량 조회 주소를 직접 받는다 ────────────────────────────────────
// 화면 안에서 fetch 하는 이유: 쿠키·리퍼러가 그대로 붙는다. 바깥에서
// 부르면 막히는 주소가 흔하다.
const bulk = {};
for (const [name, p] of BULK) {
  const r = await page.evaluate(async (u) => {
    try {
      const res = await fetch(u, { credentials: 'include' });
      return { status: res.status, text: await res.text() };
    } catch (e) {
      return { status: 0, text: String(e) };
    }
  }, BASE + p);
  say(`[대량] ${p} → ${r.status}, ${r.text.length} bytes`);
  try {
    bulk[name] = JSON.parse(r.text);
    say(summarize(bulk[name], 1, name));
  } catch {
    say(`  JSON 아님: ${r.text.slice(0, 200)}`);
  }
}

// ── 2. 커버드콜 종목을 골라낸다 ────────────────────────────────────────
const mastRows = bulk.mast?.results || [];
const cc = mastRows.filter((r) => /커버드콜/.test(String(r.F16002 || '')));
say(`\n[선별] 마스터 ${mastRows.length}행 중 이름에 '커버드콜' 이 든 것 ${cc.length}건`);
fs.writeFileSync(path.join(OUT, 'mast-coveredcall.json'), JSON.stringify(cc, null, 2));
fs.writeFileSync(
  path.join(OUT, 'mast-sample.json'),
  JSON.stringify(mastRows.slice(0, 3), null, 2),
);
if (bulk.expense) {
  fs.writeFileSync(
    path.join(OUT, 'expense-sample.json'),
    JSON.stringify((bulk.expense.results || []).slice(0, 5), null, 2),
  );
}

// 분류 체계에서 '커버드콜'·'배당' 이 어디에 있는지 본다. 이름으로 거르는
// 것보다 분류로 거르는 편이 튼튼하다 — 상품명은 운용사가 언제든 바꾼다.
for (const name of ['ctgLarge', 'ctgMiddle', 'ctgMap']) {
  if (!bulk[name]) continue;
  const text = JSON.stringify(bulk[name]);
  const hits = [...text.matchAll(/.{120}(커버드콜|월배당|분배).{120}/g)].slice(0, 12);
  say(`\n[분류:${name}] '커버드콜/월배당/분배' 주변 ${hits.length}곳`);
  for (const h of hits) say(`  …${h[0]}…`);
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(bulk[name]).slice(0, 900_000));
}

// ── 3. 낱개 화면을 열어 분배금 주소를 찾는다 ───────────────────────────
const target = cc[0]?.F16013 || mastRows[0]?.F16013;
say(`\n[낱개] 표본 종목 ${target} (${cc[0]?.F16002 || '?'})`);
for (const p of PAGE_CANDIDATES(target)) {
  const before = xhr.length;
  let status = '?';
  try {
    const resp = await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 });
    status = resp ? resp.status() : '?';
    await page.waitForTimeout(7000);
  } catch (e) {
    status = `실패 ${String(e).slice(0, 80)}`;
  }
  const fresh = xhr.slice(before).map((x) => `${x.status} ${x.bytes}B ${x.url}`);
  say(`\n  ${p} → ${status}, 새 XHR ${fresh.length}건`);
  for (const line of fresh) say(`      ${line}`);
}

// ── 4. 분배금으로 보이는 응답을 추려 낸다 ──────────────────────────────
// '분배' 라는 말이나 날짜+금액 쌍이 여럿 든 응답을 고른다.
const distLike = xhr.filter(
  (x) =>
    /divid|dist|분배/i.test(x.url) ||
    (/"20\d{6}"/.test(x.body) && /분배/.test(x.body)),
);
say(`\n[분배금 후보] ${distLike.length}건`);
for (const d of distLike) {
  say(`  ${d.status} ${d.url}`);
  say(`    ${d.body.slice(0, 1200)}`);
}

fs.writeFileSync(
  path.join(OUT, 'xhr.json'),
  JSON.stringify(
    xhr.map((x) => ({ ...x, body: x.body.slice(0, 20_000) })),
    null,
    2,
  ).slice(0, 4_000_000),
);
fs.writeFileSync(path.join(OUT, 'report.md'), `# ETFCHECK 관찰 ${new Date().toISOString()}\n\n\`\`\`\n${log.join('\n')}\n\`\`\`\n`);

await browser.close();
say('\n관찰 끝.');
