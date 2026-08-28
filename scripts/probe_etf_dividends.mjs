#!/usr/bin/env node
/**
 * 국내 ETF 분배금 이력을 주는 곳 찾기 — 러너에서만 돈다.
 *
 *   node scripts/probe_etf_dividends.mjs
 *   -> tools/discovery/etf_dividend_probe.{json,md}
 *
 * 왜 필요한가. 업계 표준 수익률은 분배금을 재투자한 총수익률인데, 국내는
 * 그 값을 만들 원천을 아직 못 찾았다. 지금까지 확인된 것:
 *
 *   네이버  시장가·NAV 어느 쪽에도 분배금이 반영되지 않는다
 *   야후    심볼은 잡히지만(1,158/1,163) 분배금 자료가 정작 분배율 큰
 *           상품에서 부족하다 (분배율 4.59% 표본에서 비율 -0.12)
 *   KRX     러너에서 열리지 않는다 (400 LOGOUT / 403)
 *
 * 그래서 "분배금 지급 이력(일자 + 주당 금액)"을 주는 곳을 넓게 훑는다.
 * 필요한 것은 분배율 한 숫자가 아니라 **이력**이다 — 총수익률은 지급일마다
 * 재투자해야 나오기 때문이다.
 *
 * 표본은 분배율이 크게 갈리는 네 종목으로 잡는다. 분배율이 낮은 종목만 보면
 * 자료가 있는지 없는지 구분이 안 된다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_DIR = 'tools/discovery';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// 분배율이 크게 갈리는 표본. 마지막 둘은 커버드콜이라 분배금이 성과의 대부분이다.
const SAMPLES = [
  { code: '069500', name: 'KODEX 200', yield: 0.78 },
  { code: '458730', name: 'TIGER 미국배당다우존스', yield: 3.2 },
  { code: '472150', name: 'TIGER 배당커버드콜액티브', yield: 21.4 },
  { code: '498400', name: 'KODEX 200타겟위클리커버드콜', yield: 14.5 },
];

const results = [];

async function probe(id, note, fn) {
  const started = Date.now();
  const row = { id, note };
  try {
    Object.assign(row, await fn());
    if (row.ok === undefined) row.ok = true;
  } catch (err) {
    row.ok = false;
    row.error = `${err.name}: ${err.message}`;
  }
  row.ms = Date.now() - started;
  results.push(row);
  console.log(`[${row.ok ? ' OK ' : 'FAIL'}] ${id} — ${row.error || row.summary || ''}`);
  return row;
}

async function get(url, { headers = {}, encoding = 'utf-8' } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', ...headers },
    redirect: 'follow',
  });
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, ok: res.ok, bytes: buf.length,
           text: new TextDecoder(encoding, { fatal: false }).decode(buf),
           type: res.headers.get('content-type') || '' };
}

/**
 * 응답이 "분배금 이력" 처럼 보이는가.
 *
 * 날짜와 금액이 짝지어 여러 건 들어 있어야 쓸 수 있다. 분배율 한 숫자만
 * 있는 응답은 우리가 이미 갖고 있는 것이고 총수익률을 만들 수 없다.
 */
function looksLikeHistory(json) {
  const found = [];
  const walk = (v, path) => {
    if (Array.isArray(v)) {
      if (v.length >= 2 && v[0] && typeof v[0] === 'object') {
        const keys = Object.keys(v[0]).join(',');
        const hasDate = /date|dt|ymd|기준일|지급/i.test(keys);
        const hasAmount = /amount|amt|per ?share|dividend|분배|금액/i.test(keys);
        if (hasDate && hasAmount) found.push({ path, len: v.length, keys, sample: v[0] });
      }
      v.slice(0, 5).forEach((x, i) => walk(x, `${path}[${i}]`));
      return;
    }
    if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
    }
  };
  walk(json, '');
  return found;
}

// ─────────────────── 1. 네이버 후보 경로 훑기 ───────────────────
// 나머지 국내 자료를 전부 네이버에서 받고 있으므로 여기가 열리면 가장 싸다.
async function probeNaver() {
  const PATHS = [
    (c) => `https://m.stock.naver.com/api/stock/${c}/dividend`,
    (c) => `https://m.stock.naver.com/api/stock/${c}/dividendList`,
    (c) => `https://m.stock.naver.com/api/stock/${c}/etfDividend`,
    (c) => `https://m.stock.naver.com/api/stock/${c}/etfDividendList`,
    (c) => `https://m.stock.naver.com/api/stock/${c}/dividendHistory`,
    (c) => `https://m.stock.naver.com/api/stock/${c}/finance/dividend`,
    (c) => `https://m.stock.naver.com/api/stock/${c}/distribution`,
    (c) => `https://api.stock.naver.com/stock/${c}/dividend`,
    (c) => `https://api.stock.naver.com/etf/${c}/dividend`,
  ];
  // 분배율이 큰 종목으로 먼저 본다 — 자료가 있으면 여기서 티가 난다.
  const probeCode = '472150';
  for (const make of PATHS) {
    const url = make(probeCode);
    await probe(`naver:${url.replace(/^https:\/\//, '').replace(probeCode, '{code}')}`,
      `네이버 분배금 후보`, async () => {
        const raw = await get(url, { headers: { Referer: 'https://m.stock.naver.com/' } });
        if (!raw.ok) return { ok: false, status: raw.status, summary: `HTTP ${raw.status}` };
        let json;
        try { json = JSON.parse(raw.text); } catch {
          return { ok: false, status: raw.status, summary: 'JSON 아님' };
        }
        const hist = looksLikeHistory(json);
        return { ok: hist.length > 0, status: raw.status, bytes: raw.bytes,
                 summary: hist.length
                   ? `이력 발견 — ${hist.map((h) => `${h.path}[${h.len}] {${h.keys}}`).join(' | ')}`
                   : `이력 없음 (키: ${Object.keys(json).slice(0, 12).join(',')})`,
                 history: hist.slice(0, 2) };
      });
  }
}

// ─────────────────── 2. 네이버 화면이 실제로 무엇을 부르는가 ───────────────────
// 경로를 찍어 맞히는 것보다 화면을 열어 관찰하는 편이 확실하다.
// (이 저장소가 ELS 수집기를 만들 때 쓴 방법과 같다.)
async function probeNaverRendered() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    await probe('naver.rendered', '네이버 ETF 화면의 XHR 관찰',
      async () => ({ ok: false, summary: 'playwright 미설치 — 워크플로에서 설치해야 한다' }));
    return;
  }
  await probe('naver.rendered', '네이버 ETF 화면이 부르는 분배금 API 관찰', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ userAgent: UA, locale: 'ko-KR' });
    const seen = [];
    page.on('response', (res) => {
      const u = res.url();
      if (/dividend|분배|distribution/i.test(u)) seen.push(`${res.status()} ${u}`);
    });
    const urls = [
      'https://m.stock.naver.com/domestic/etf/472150/total',
      'https://m.stock.naver.com/domestic/stock/472150/total',
    ];
    const allXhr = [];
    page.on('response', (res) => {
      const u = res.url();
      if (u.includes('/api/')) allXhr.push(u.replace(/^https?:\/\//, ''));
    });
    for (const u of urls) {
      try {
        await page.goto(u, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);
      } catch { /* 화면이 없으면 다음 것 */ }
    }
    await browser.close();
    return { ok: seen.length > 0,
             summary: seen.length ? `분배금 관련 응답 ${seen.length}건: ${seen.slice(0, 3).join(' | ')}`
                                  : `분배금 관련 호출 없음 (전체 API 호출 ${allXhr.length}건)`,
             dividendCalls: seen.slice(0, 10),
             allApiCalls: [...new Set(allXhr)].slice(0, 40) };
  });
}

// ─────────────────── 3. 그 밖의 원천 ───────────────────
async function probeOthers() {
  const TARGETS = [
    ['fnguide.etf', '에프앤가이드 ETF 스냅샷',
     'https://comp.fnguide.com/SVO2/ASP/etf_snapshot.asp?pGB=1&gicode=A472150'],
    ['fnguide.main', '에프앤가이드 종목 메인',
     'https://comp.fnguide.com/SVO2/ASP/SVD_Main.asp?pGB=1&gicode=A472150'],
    ['seibro', '예탁결제원 SEIBRO',
     'https://seibro.or.kr/websquare/control.jsp?w2xPath=/IPORTAL/user/etf/BIP_CNTS06001V.xml'],
    ['kofia', '금융투자협회 전자공시', 'https://dis.kofia.or.kr/'],
    ['krx.data', 'KRX 정보데이터시스템', 'https://data.krx.co.kr/'],
    ['krx.etf', 'KRX ETF 전용 사이트', 'https://etf.krx.co.kr/'],
    ['kodex', '삼성 KODEX', 'https://www.kodex.com/ko/index.do'],
    ['tiger', '미래에셋 TIGER', 'https://www.tigeretf.com/ko/index.do'],
    ['ace', '한국투자 ACE', 'https://www.aceetf.co.kr/'],
    ['sol', '신한 SOL', 'https://www.soletf.com/'],
    ['rise', 'KB RISE', 'https://www.riseetf.co.kr/'],
    ['investing', 'Investing.com 국내 ETF 배당',
     'https://kr.investing.com/etfs/tiger-covered-call-dividend-history'],
  ];
  for (const [id, note, url] of TARGETS) {
    await probe(`site.${id}`, note, async () => {
      const raw = await get(url, {
        headers: { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      });
      // 화면에 분배금 흔적이 있는가 (있어도 서버 렌더가 아니면 못 긁는다)
      const hit = /분배금|분배 내역|배당내역|dividend/i.test(raw.text);
      return { ok: raw.ok, status: raw.status, bytes: raw.bytes,
               summary: `${raw.status} · ${raw.bytes}B · 분배금 흔적 ${hit ? '있음' : '없음'}` +
                        (raw.ok ? '' : ` · ${raw.text.slice(0, 60).replace(/\s+/g, ' ')}`) };
    });
  }
}

// ─────────────────── 4. 야후 배당을 종목별로 다시 본다 ───────────────────
// "분배율 큰 종목에서 부족하다" 를 종목 단위로 눈에 보이게 남긴다.
async function probeYahooPerFund() {
  for (const s of SAMPLES) {
    await probe(`yahoo.div.${s.code}`, `야후 배당 이력 — ${s.name} (분배율 ${s.yield}%)`,
      async () => {
        const raw = await get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${s.code}.KS` +
          '?range=2y&interval=1d&events=div',
          { headers: { Referer: 'https://finance.yahoo.com/' } });
        if (!raw.ok) return { ok: false, status: raw.status, summary: `HTTP ${raw.status}` };
        const r = JSON.parse(raw.text)?.chart?.result?.[0];
        const divs = Object.values(r?.events?.dividends || {});
        const sum = divs.reduce((a, d) => a + (Number(d.amount) || 0), 0);
        const last = r?.meta?.regularMarketPrice;
        // 2년치 분배금 합을 현재가로 나누면 대략의 연 분배율이 나온다.
        const impliedYield = last ? (sum / last) * 100 / 2 : null;
        return { ok: divs.length > 0, status: raw.status,
                 divCount: divs.length, divSum: +sum.toFixed(2),
                 summary: `배당 ${divs.length}건 · 합 ${sum.toFixed(0)}원 · ` +
                          `역산 연분배율 ${impliedYield == null ? '?' : impliedYield.toFixed(1)}% ` +
                          `(실제 ${s.yield}%)` };
      });
  }
}

// ─────────────────── 실행 ───────────────────
await probeNaver();
await probeNaverRendered();
await probeYahooPerFund();
await probeOthers();

await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}/etf_dividend_probe.json`,
  JSON.stringify({ probedAt: new Date().toISOString(), samples: SAMPLES, results }, null, 2) + '\n');

const lines = ['# 국내 ETF 분배금 이력 — 원천 탐색', '',
  `- 탐색 시각: ${new Date().toISOString()}`,
  '- 찾는 것: 분배율 한 숫자가 아니라 **지급일 + 주당 금액의 이력**',
  '', '| 결과 | 항목 | 설명 | 요약 |', '|---|---|---|---|'];
for (const r of results) {
  lines.push(`| ${r.ok ? '✅' : '❌'} | \`${r.id}\` | ${r.note} | ` +
             `${(r.summary || r.error || '').replace(/\|/g, '\\|').slice(0, 220)} |`);
}
await writeFile(`${OUT_DIR}/etf_dividend_probe.md`, lines.join('\n') + '\n');
console.log(`\n[dividend] ${results.filter((r) => r.ok).length}/${results.length} 성공`);
