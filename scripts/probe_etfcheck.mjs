// ETFCHECK 이 **실제로 부르는 주소**를 브라우저로 관찰한다.
//
// 왜 관찰부터 하나
// ──────────────────────────────────────────────────────────────────────
// ETFCHECK 은 화면 껍데기만 내려주고 값은 브라우저가 나중에 API 로 받아
// 그린다. 주소를 짐작해서 맞히려 들면 이 저장소가 2026-09-10 네이버 개편
// 때 겪은 일(후보 스물다섯 개를 찍어 전부 빗나감)을 그대로 반복하게 된다.
// 그래서 짐작하지 않는다. 화면을 열고, 그 화면이 보내는 요청을 전부 적고,
// 값이 담겨 온 응답만 본문까지 남긴다.
//
// 이 파일은 **수집기가 아니다.** data/ 를 건드리지 않는다. 관찰 결과만
// discovery/etfcheck/ 에 남기고, 그걸 보고 collect_cc_etf.mjs 의 필드
// 매핑을 확정한다. 관찰과 수집을 한 파일에 섞으면 원천이 바뀐 날
// "수집은 성공했는데 값이 빈" 상태를 구별할 수 없게 된다.
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

// 종목코드 모양. 국내 ETF 는 여섯 자리인데 2024년 뒤 상장분에는
// `0040Y0` 처럼 숫자·영문이 섞인 것이 있다. 여섯 자리 숫자만 찾으면
// 최근 상장한 커버드콜을 통째로 놓친다.
const CODE = /^[0-9][0-9A-Z]{5}$/;

// 열어 볼 화면. 주소가 바뀌었으면 여는 데 실패할 뿐 관찰 자체는 계속된다.
const ENTRIES = [
  ['메인', 'https://www.etfcheck.co.kr/'],
  ['모바일메인', 'https://www.etfcheck.co.kr/mobile/main'],
];

// 검색창에 넣어 볼 말. 검색은 주소를 몰라도 되는 가장 튼튼한 길이다 —
// 화면이 알아서 제 API 를 부르고, 우리는 그걸 받아 적기만 하면 된다.
const QUERIES = ['커버드콜', '월배당'];

const captured = [];
let seq = 0;

function looksLikeJson(type, body) {
  if (/json/i.test(type)) return true;
  const head = body.slice(0, 200).trim();
  return head.startsWith('{') || head.startsWith('[');
}

// 응답 본문 어디에 종목 명단이 들어 있는지 찾는다. 키 이름을 짐작하지
// 않고 **모양**으로 찾는다: "여섯 자리 코드 같은 값을 가진 객체가 여럿
// 담긴 배열". 원천이 키 이름을 바꿔도 이 기준은 살아남는다.
function findRowArrays(node, trail = '$', hits = []) {
  if (node === null || typeof node !== 'object') return hits;
  if (Array.isArray(node)) {
    const objs = node.filter((v) => v && typeof v === 'object' && !Array.isArray(v));
    if (objs.length >= 3) {
      const codeKeys = new Set();
      for (const o of objs.slice(0, 40)) {
        for (const [k, v] of Object.entries(o)) {
          if (typeof v === 'string' && CODE.test(v)) codeKeys.add(k);
        }
      }
      if (codeKeys.size) {
        const keys = new Set();
        for (const o of objs.slice(0, 40)) for (const k of Object.keys(o)) keys.add(k);
        hits.push({
          path: trail,
          rows: objs.length,
          codeKeys: [...codeKeys],
          keys: [...keys],
          sample: objs.slice(0, 2),
        });
      }
    }
    node.slice(0, 50).forEach((v, i) => findRowArrays(v, `${trail}[${i}]`, hits));
    return hits;
  }
  for (const [k, v] of Object.entries(node)) findRowArrays(v, `${trail}.${k}`, hits);
  return hits;
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

async function watch(label, fn) {
  const ctx = await browser.newContext({
    locale: 'ko-KR',
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  page.on('response', async (res) => {
    const url = res.url();
    if (/\.(js|css|png|jpe?g|gif|svg|webp|woff2?|ico)(\?|$)/i.test(url)) return;
    const type = (res.headers()['content-type'] || '').split(';')[0];
    let body = '';
    try {
      body = await res.text();
    } catch {
      return; // 본문을 못 읽는 응답이 있다. 그건 그냥 넘긴다.
    }
    if (!looksLikeJson(type, body)) return;

    let parsed = null;
    try {
      parsed = JSON.parse(body);
    } catch {
      return;
    }
    const hits = findRowArrays(parsed);
    captured.push({
      seq: seq++,
      label,
      url,
      status: res.status(),
      method: res.request().method(),
      postData: res.request().postData() || null,
      bytes: body.length,
      hits: hits.map((h) => ({ ...h, sample: h.sample })),
      // 본문은 명단이 들어 있는 것만 남긴다. 전부 남기면 커밋이 수십 MB 가 된다.
      body: hits.length ? body.slice(0, 400_000) : null,
    });
  });

  try {
    await fn(page);
  } catch (e) {
    captured.push({ seq: seq++, label, url: null, error: String(e).slice(0, 300) });
  }
  await ctx.close();
}

for (const [label, url] of ENTRIES) {
  await watch(label, async (page) => {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);

    // 화면 안의 링크를 적어 둔다. 스크리너·순위·분배 화면의 주소를
    // 짐작하는 대신 여기서 주워 간다.
    const links = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && !h.startsWith('javascript'))
        .slice(0, 400),
    );
    fs.writeFileSync(
      path.join(OUT, `links-${label}.json`),
      JSON.stringify([...new Set(links)], null, 2),
    );
  });
}

// 검색창으로 들어가 본다.
for (const q of QUERIES) {
  await watch(`검색:${q}`, async (page) => {
    await page.goto('https://www.etfcheck.co.kr/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(4000);
    const box = page
      .locator('input[type="text"], input[type="search"], input[placeholder]')
      .first();
    await box.click({ timeout: 15000 });
    await box.type(q, { delay: 90 });
    await page.waitForTimeout(6000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(8000);
    fs.writeFileSync(path.join(OUT, `url-after-search-${q}.txt`), page.url());
  });
}

fs.writeFileSync(path.join(OUT, 'captured.json'), JSON.stringify(captured, null, 2));

// 사람이 먼저 읽을 요약. 명단이 담겨 온 응답만 위로 올린다.
const withRows = captured.filter((c) => c.hits && c.hits.length);
const lines = [
  `# ETFCHECK 관찰 ${new Date().toISOString()}`,
  '',
  `관찰한 JSON 응답 ${captured.length}건, 그중 종목 명단으로 보이는 것 ${withRows.length}건.`,
  '',
];
for (const c of withRows) {
  lines.push(`## [${c.label}] ${c.method} ${c.url}`);
  lines.push(`- 상태 ${c.status}, ${c.bytes} bytes`);
  if (c.postData) lines.push(`- 보낸 본문: \`${c.postData.slice(0, 400)}\``);
  for (const h of c.hits) {
    lines.push(`- \`${h.path}\` — ${h.rows}행, 코드키 ${h.codeKeys.join(',')}`);
    lines.push(`  - 키: ${h.keys.join(', ')}`);
    lines.push('  - 표본:');
    lines.push('```json');
    lines.push(JSON.stringify(h.sample[0], null, 2).slice(0, 2500));
    lines.push('```');
  }
  lines.push('');
}
if (!withRows.length) {
  lines.push('명단이 담겨 온 응답이 없다. 아래는 그래도 받아 본 주소 전부다.');
  lines.push('');
  for (const c of captured) lines.push(`- [${c.label}] ${c.status} ${c.url || c.error}`);
}
fs.writeFileSync(path.join(OUT, 'report.md'), lines.join('\n'));

await browser.close();
console.log(`관찰 끝. JSON ${captured.length}건, 명단 후보 ${withRows.length}건.`);
console.log(lines.slice(0, 200).join('\n'));
