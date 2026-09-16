// ETFCHECK 이 **실제로 부르는 주소**를 브라우저로 관찰한다.
//
// 왜 관찰부터 하나
// ──────────────────────────────────────────────────────────────────────
// ETFCHECK 은 화면 껍데기만 내려주고 값은 브라우저가 나중에 API 로 받아
// 그린다. 게다가 키 이름이 `F16002`, `W00065` 같은 사내 코드라 이름만
// 보고는 무슨 값인지 알 수 없다. 주소도 키 뜻도 짐작하지 않는다 —
// 화면을 열고, 오가는 요청을 전부 적고, 값이 담겨 온 응답만 남긴다.
//
// 이 파일은 **수집기가 아니다.** data/ 를 건드리지 않는다.
//
// 지금까지 알아낸 것
// ──────────────────────────────────────────────────────────────────────
// 1차  GET /user/common/getEtpMast             국내 ETP 마스터 1,535행
//      GET /stock/etp/getEtfTotalExpenseRatio  총보수/실부담비용률 1,171행
//      GET /user/common/getEtpCtgLarge|Middle|Map  분류 체계와 종목-분류 대응
// 2차  · 화면 안에서 fetch 로 직접 부르면 403 이다. 앱이 보내는 요청에만
//        답한다. 무엇이 다른지가 이번 판의 물음이다.
//      · 낱개 화면이 부르는 것들: getEtpItemOutline / getEtpLatestFee /
//        getEtpDesc / getEtpTermHist / getSimpleEtpHist / getEtpDiffHistAvg
// 3차  · 이름에 '커버드콜' 이 든 종목 63개.
//      · 분류에 커버드콜(0609005)·월배당(0609002) 이 따로 있다. 이름으로
//        거르는 것보다 이쪽이 오래간다 — 상품명은 운용사가 언제든 바꾼다.
//      · 낱개 화면을 잇달아 열었더니 ERR_EMPTY_RESPONSE. 너무 빨리 두드린
//        듯하다. 이번엔 사이를 띄우고, 새 문맥으로 연다.
// 아직 못 찾은 것 — 이번 판의 목표
//      · 분배금(월분배율) 주소
//      · 순자산총액. 마스터의 W00065 는 CD금리액티브에서 -989억이 나와
//        순자산이 아니다(자금유출입으로 보인다). 확인 전에는 쓰지 않는다.
//
// 세션(클로드 쪽)에서는 etfcheck.co.kr 로 CONNECT 가 403 이라 못 돈다.
// **러너에서만** 돈다.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'tools/etfcheck-discovery';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'https://www.etfcheck.co.kr';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const log = [];
const say = (s) => {
  log.push(s);
  console.log(s);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

const xhr = [];
function wire(page) {
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
    xhr.push({
      url,
      status: res.status(),
      bytes: body.length,
      body,
      reqHeaders: res.request().headers(),
    });
  });
}
const latest = (re) => [...xhr].reverse().find((x) => re.test(x.url));

async function fresh() {
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    viewport: { width: 1440, height: 900 },
    userAgent: UA,
  });
  const page = await ctx.newPage();
  wire(page);
  return { ctx, page };
}

// ── 1. 첫 화면. 마스터와 분류를 받아 둔다 ──────────────────────────────
let { ctx, page } = await fresh();
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(10000);

const mastRes = latest(/getEtpMast/);
const mast = mastRes ? JSON.parse(mastRes.body).results || [] : [];
say(`[마스터] ${mast.length}행`);

// 앱이 보내는 머리글을 그대로 적는다. 우리 fetch 와 무엇이 다른지가
// 403 의 답이다.
if (mastRes) {
  say('[앱이 보낸 머리글]');
  for (const [k, v] of Object.entries(mastRes.reqHeaders)) {
    say(`   ${k}: ${String(v).slice(0, 160)}`);
  }
}

// ── 2. 같은 주소를 화면 안에서 머리글까지 붙여 다시 불러 본다 ──────────
const replay = await page.evaluate(async ({ base, headers }) => {
  const out = {};
  for (const [label, init] of [
    ['맨몸', {}],
    ['머리글 복사', { headers }],
  ]) {
    try {
      const r = await fetch(`${base}/user/common/getEtpMast`, {
        credentials: 'include',
        ...init,
      });
      out[label] = { status: r.status, bytes: (await r.text()).length };
    } catch (e) {
      out[label] = { status: 0, error: String(e).slice(0, 120) };
    }
  }
  return out;
}, {
  base: BASE,
  headers: mastRes
    ? Object.fromEntries(
        Object.entries(mastRes.reqHeaders).filter(
          // 브라우저가 스스로 붙이는 것은 다시 붙일 수 없다(금지 머리글).
          ([k]) => !/^(host|:|accept-encoding|connection|content-length|cookie|referer|sec-|user-agent)/i.test(k),
        ),
      )
    : {},
});
say(`\n[재현] ${JSON.stringify(replay)}`);

// ── 3. 분류로 커버드콜·월배당 종목을 뽑는다 ────────────────────────────
const ctgMid = latest(/getEtpCtgMiddle/);
const ctgMap = latest(/getEtpCtgMap/);
if (ctgMid) fs.writeFileSync(path.join(OUT, 'ctgMiddle.json'), ctgMid.body);
if (ctgMap) {
  const map = JSON.parse(ctgMap.body);
  fs.writeFileSync(path.join(OUT, 'ctgMap-shape.json'), JSON.stringify(map).slice(0, 4000));
  const rows = map.results || map;
  say(`\n[분류대응] ${Array.isArray(rows) ? rows.length : '?'}행, 표본:`);
  say('   ' + JSON.stringify(Array.isArray(rows) ? rows.slice(0, 3) : rows).slice(0, 800));
  if (Array.isArray(rows)) {
    const cc = rows.filter((r) => JSON.stringify(r).includes('0609005'));
    const md = rows.filter((r) => JSON.stringify(r).includes('0609002'));
    say(`   커버드콜(0609005) ${cc.length}행, 월배당(0609002) ${md.length}행`);
    say('   커버드콜 표본: ' + JSON.stringify(cc.slice(0, 3)).slice(0, 600));
    fs.writeFileSync(
      path.join(OUT, 'ctg-coveredcall-rows.json'),
      JSON.stringify({ coveredCall: cc.slice(0, 200), monthly: md.slice(0, 200) }, null, 2),
    );
  }
}

const cc = mast.filter((r) => /커버드콜/.test(String(r.F16002 || '')));
fs.writeFileSync(path.join(OUT, 'mast-coveredcall.json'), JSON.stringify(cc, null, 2));

// ── 4. 낱개 화면 — 새 문맥으로, 사이를 띄워서 ──────────────────────────
// 3차에서 잇달아 열었다가 ERR_EMPTY_RESPONSE 를 맞았다. 사람이 보는
// 속도로 연다.
const target = cc.sort((a, b) => Number(b.F15023 || 0) - Number(a.F15023 || 0))[0];
const code = target?.F16013;
say(`\n[낱개] 표본 ${code} (${target?.F16002})`);

await ctx.close();
for (const sub of ['basic', 'dividend']) {
  ({ ctx, page } = await fresh());
  const before = xhr.length;
  let status = '?';
  try {
    // 리퍼러를 달아 준다. 앱 안에서 넘어간 것처럼 보이게 한다.
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    const r = await page.goto(`${BASE}/mobile/etpitem/${code}/${sub}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      referer: BASE + '/',
    });
    status = r ? r.status() : '?';
    await page.waitForTimeout(12000);
  } catch (e) {
    status = `실패 ${String(e).slice(0, 90)}`;
  }
  const known =
    /getEtpMast|getEtpCtg|TotalExpenseRatio|getbannerInfo|insert|update|BreakingNews|NewsList|TIekcerList|ScreenerLog|JangGubun|LastBusinessDay|AdPopup|getScaleCtgName/;
  say(`\n  /mobile/etpitem/${code}/${sub} → ${status}, 새 XHR ${xhr.length - before}건`);
  for (const x of xhr.slice(before)) {
    if (known.test(x.url)) {
      say(`      (기존) ${x.status} ${x.bytes}B ${x.url.slice(0, 100)}`);
      continue;
    }
    say(`      ★ ${x.status} ${x.bytes}B ${x.url}`);
    say(`        ${x.body.slice(0, 2000).replace(/\s+/g, ' ')}`);
  }
  await ctx.close();
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
