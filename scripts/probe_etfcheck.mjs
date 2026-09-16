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
// 지금까지 알아낸 것
// ──────────────────────────────────────────────────────────────────────
// 1차(2026-09-16)
//   GET /user/common/getEtpMast             국내 ETP 마스터 1,535행
//   GET /stock/etp/getEtfTotalExpenseRatio  총보수/실부담비용률 1,171행
//   GET /user/common/getEtpCtgLarge|Middle|Map  분류 체계와 종목-분류 대응
// 2차
//   · **화면 안에서 fetch 로 직접 부르면 403 이다.** 앱이 보내는 요청에만
//     답한다. 그러니 부르지 말고 화면을 열어 받아 적는 수밖에 없다.
//     이 한 줄이 수집기 설계를 정한다 — 수집기도 브라우저로 돈다.
//   · 낱개 화면 /mobile/etpitem/{코드}/basic 이 부르는 것들:
//       getEtpItemOutline?code=  getEtpLatestFee?code=  getEtpDesc?code=
//       getEtpTermHist?F16013=   getSimpleEtpHist?F16013=  getEtpDiffHistAvg?F16013=
//   · /mobile/etpitem/{코드}/dividend 라는 길이 있다(200). 코드를 제대로
//     넣으면 분배금 주소가 나올 것이다 — 이번 판에서 확인한다.
// 아직 못 찾은 것
//   · 분배금(월분배율) 주소
//   · 순자산총액. 마스터의 W00065 는 CD금리액티브에서 -989억이 나와
//     순자산이 아니다(자금유출입으로 보인다). 확인 전에는 쓰지 않는다.
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

// 오가는 JSON 을 전부 적는다. 본문은 자르지 않는다 — 마스터가 1.2MB 라
// 120KB 에서 자르면 파싱이 안 돼 아무것도 못 고른다(2차에서 겪었다).
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
  xhr.push({ url, status: res.status(), bytes: body.length, body });
});

const latest = (re) => [...xhr].reverse().find((x) => re.test(x.url));

async function visit(p, waitMs = 8000) {
  const before = xhr.length;
  let status = '?';
  try {
    const r = await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 45000 });
    status = r ? r.status() : '?';
    await page.waitForTimeout(waitMs);
  } catch (e) {
    status = `실패 ${String(e).slice(0, 80)}`;
  }
  return { status, fresh: xhr.slice(before) };
}

// ── 1. 마스터를 받는다 (화면이 스스로 부른다) ──────────────────────────
await visit('/', 9000);
const mastRes = latest(/getEtpMast/);
if (!mastRes) {
  say('[중단] 마스터 응답을 못 받았다. 화면 구조가 바뀌었을 수 있다.');
} else {
  say(`[마스터] ${mastRes.bytes} bytes`);
}
const mast = mastRes ? JSON.parse(mastRes.body).results || [] : [];
const cc = mast.filter((r) => /커버드콜/.test(String(r.F16002 || '')));
say(`[선별] 마스터 ${mast.length}행 중 이름에 '커버드콜' 이 든 것 ${cc.length}건`);
say(cc.slice(0, 40).map((r) => `   ${r.F16013}  ${r.F16002}`).join('\n'));
fs.writeFileSync(path.join(OUT, 'mast-coveredcall.json'), JSON.stringify(cc, null, 2));
fs.writeFileSync(path.join(OUT, 'mast-sample.json'), JSON.stringify(mast.slice(0, 3), null, 2));

// 분류 체계도 남긴다. 이름으로 거르는 것보다 분류로 거르는 편이 오래간다 —
// 상품명은 운용사가 언제든 바꾼다.
for (const [name, re] of [
  ['ctgLarge', /getEtpCtgLarge/],
  ['ctgMiddle', /getEtpCtgMiddle/],
  ['ctgMap', /getEtpCtgMap/],
  ['expense', /getEtfTotalExpenseRatio/],
]) {
  const r = latest(re);
  if (!r) continue;
  fs.writeFileSync(path.join(OUT, `${name}.json`), r.body.slice(0, 1_600_000));
  const hits = [...r.body.matchAll(/.{100}(커버드콜|월배당).{100}/g)].slice(0, 8);
  if (hits.length) {
    say(`\n[분류:${name}] '커버드콜/월배당' 주변 ${hits.length}곳`);
    for (const h of hits) say(`  …${h[0]}…`);
  }
}

// ── 2. 커버드콜 한 종목의 낱개 화면을 연다 ─────────────────────────────
// 유동성이 큰 것을 고른다. 거래가 거의 없는 종목은 화면이 빈 채로 끝나
// 어떤 주소를 부르는지 못 보는 수가 있다.
const target =
  cc.sort((a, b) => Number(b.F15023 || 0) - Number(a.F15023 || 0))[0] || mast[0];
const code = target?.F16013;
say(`\n[낱개] 표본 ${code} (${target?.F16002})  거래대금 ${target?.F15023}`);

for (const sub of ['basic', 'dividend', 'invest', 'price']) {
  const { status, fresh } = await visit(`/mobile/etpitem/${code}/${sub}`, 9000);
  say(`\n  /mobile/etpitem/${code}/${sub} → ${status}, 새 XHR ${fresh.length}건`);
  for (const x of fresh) {
    // 이미 아는 대량 조회는 줄여서 적는다. 새로 보이는 것만 본문까지 본다.
    const known = /getEtpMast|getEtpCtg|TotalExpenseRatio|getbannerInfo|insert|update|BreakingNews|NewsList|TIekcerList|ScreenerLog|JangGubun|LastBusinessDay|adtrafficquality|AdPopup/.test(
      x.url,
    );
    if (known) {
      say(`      (기존) ${x.status} ${x.bytes}B ${x.url.slice(0, 110)}`);
      continue;
    }
    say(`      ★ ${x.status} ${x.bytes}B ${x.url}`);
    say(`        ${x.body.slice(0, 1800).replace(/\n/g, ' ')}`);
  }
}

// ── 3. 분배금으로 보이는 응답을 한 번 더 추린다 ────────────────────────
const distLike = xhr.filter((x) => /divid|dist|분배|Dvd|DVD/i.test(x.url + x.body.slice(0, 4000)));
say(`\n[분배금 후보] ${distLike.length}건`);
for (const d of distLike.slice(0, 12)) {
  say(`  ${d.status} ${d.bytes}B ${d.url}`);
  say(`    ${d.body.slice(0, 1500).replace(/\n/g, ' ')}`);
}

fs.writeFileSync(
  path.join(OUT, 'xhr.json'),
  JSON.stringify(
    xhr.map((x) => ({ url: x.url, status: x.status, bytes: x.bytes, body: x.body.slice(0, 12_000) })),
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(OUT, 'report.md'),
  `# ETFCHECK 관찰 ${new Date().toISOString()}\n\n\`\`\`\n${log.join('\n')}\n\`\`\`\n`,
);

await browser.close();
say('\n관찰 끝.');
