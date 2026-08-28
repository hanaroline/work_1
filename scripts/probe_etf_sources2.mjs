#!/usr/bin/env node
/**
 * ETF 원천 탐색 2차 — 1차에서 남은 구멍만 판다.
 *
 * 1차(scripts/probe_etf_sources.mjs)에서 확인된 것:
 *   - 야후 quoteSummary 는 미국·홍콩·일본 모두 상위10 + 섹터비중 + 운용사 +
 *     총보수 + 순자산을 준다. 쿠키+crumb 흐름도 러너에서 된다.
 *   - 한국 종목(069500.KS)은 야후에 편입종목이 없다. 국내는 다른 데서 받아야 한다.
 *   - 네이버 ETF 목록 API 가 1,163종목을 한 번에 준다. m.stock 의 etfAnalysis 는
 *     운용사·기초지수·순자산·괴리율까지 준다.
 *   - KRX 는 finder 만 통하고 나머지는 전부 400 "LOGOUT" 이었다.
 *
 * 그래서 2차가 볼 것:
 *   1. KRX — 세션 쿠키를 먼저 받아 쥐면 통계 화면이 열리는가. (LOGOUT 은
 *      "권한 없음"이 아니라 "세션 없음"이다. node fetch 는 쿠키를 안 물고 있다.)
 *   2. 국내 편입종목(PDF) 을 어디서 받는가 — 이 도구의 핵심이고 유일한 구멍.
 *   3. 중국 본토(상해·심천) 상장 ETF 도 야후가 편입종목을 주는가.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_DIR = 'tools/discovery';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
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

// ─────────────────── 쿠키를 물고 다니는 fetch ───────────────────
// KRX 가 400 "LOGOUT" 을 뱉은 이유가 이것이다. 화면을 한 번 열어 세션을 받은
// 뒤에야 통계 요청을 받아 준다.
function jar() {
  const store = new Map();
  return {
    header() { return [...store].map(([k, v]) => `${k}=${v}`).join('; '); },
    absorb(res) {
      for (const line of res.headers.getSetCookie?.() || []) {
        const [pair] = line.split(';');
        const idx = pair.indexOf('=');
        if (idx > 0) store.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
      }
    },
    size() { return store.size; },
  };
}

async function get(url, { cookies, headers = {}, encoding = 'utf-8' } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
               ...(cookies ? { Cookie: cookies.header() } : {}), ...headers },
    redirect: 'follow',
  });
  cookies?.absorb(res);
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, ok: res.ok, bytes: buf.length,
           text: new TextDecoder(encoding, { fatal: false }).decode(buf),
           contentType: res.headers.get('content-type') || '' };
}

async function post(url, body, { cookies, headers = {} } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
               'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
               'X-Requested-With': 'XMLHttpRequest',
               ...(cookies ? { Cookie: cookies.header() } : {}), ...headers },
    body: new URLSearchParams(body).toString(),
  });
  cookies?.absorb(res);
  const text = await res.text();
  return { status: res.status, ok: res.ok, bytes: text.length, text };
}

/** KRX 응답에서 블록 이름과 컬럼만 뽑는다. 원문은 크고 우리가 볼 건 스키마다. */
function krxDigest(raw) {
  const out = { status: raw.status, bytes: raw.bytes };
  let json;
  try { json = JSON.parse(raw.text); } catch {
    out.ok = false;
    out.summary = `JSON 아님: ${raw.text.slice(0, 120).replace(/\s+/g, ' ')}`;
    return out;
  }
  const blocks = {};
  for (const [k, v] of Object.entries(json)) {
    if (Array.isArray(v)) blocks[k] = { rows: v.length, columns: v.length ? Object.keys(v[0]) : [] };
  }
  out.blocks = blocks;
  const main = Object.entries(blocks).find(([, b]) => b.rows > 0);
  if (main) {
    out.summary = `${main[0]} ${main[1].rows}행 — ${main[1].columns.join(',')}`;
    out.sampleRow = json[main[0]][0];
    out.ok = true;
  } else {
    out.ok = false;
    out.summary = `행 없음 (keys: ${Object.keys(json).join(',')})`;
  }
  return out;
}

function recentDates(n = 10) {
  const out = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    out.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}
const DATES = recentDates();

// ───────────────────────────── 1. KRX ─────────────────────────────
const KRX_JSON = 'https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd';
let krxTradeDate = null;

async function probeKrx() {
  const cookies = jar();

  // 화면을 먼저 연다. 이게 1차에서 빠졌던 한 수다.
  await probe('krx.session', '세션 쿠키 획득 (화면 선진입)', async () => {
    await get('https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101',
              { cookies });
    return { ok: cookies.size() > 0, summary: `쿠키 ${cookies.size()}개` };
  });

  const ref = { Referer: 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101',
                Origin: 'https://data.krx.co.kr' };

  await probe('krx.etf.all', 'ETF 전종목 시세 (세션 있음)', async () => {
    for (const dd of DATES) {
      const out = krxDigest(await post(KRX_JSON, {
        bld: 'dbms/MDC/STAT/standard/MDCSTAT04301', locale: 'ko_KR',
        trdDd: dd, share: '1', money: '1', csvxls_isNo: 'false',
      }, { cookies, headers: ref }));
      if (out.ok) { krxTradeDate = dd; out.trdDd = dd; return out; }
    }
    return { ok: false, error: '영업일 10일 모두 빈 응답' };
  });

  // ETF 화면들. 어느 화면이 운용사·총보수·상장일·구성종목을 주는지 여기서 정한다.
  const CANDIDATES = [
    ['04301', 'ETF 전종목 시세'],
    ['04401', 'ETF 개별 시세 추이'],
    ['04501', 'ETF 전종목 등락률'],
    ['04601', 'ETF 투자자별 거래'],
    ['04701', 'ETF 상세 정보'],
    ['04801', 'ETF 구성종목 후보 A'],
    ['04901', 'ETF 구성종목 후보 B'],
    ['05001', 'ETF 구성종목(PDF) 후보 C'],
    ['05101', 'ETF 후보 D'],
  ];
  for (const [code, note] of CANDIDATES) {
    await probe(`krx2.stat.${code}`, `MDCSTAT${code} — ${note}`, async () =>
      krxDigest(await post(KRX_JSON, {
        bld: `dbms/MDC/STAT/standard/MDCSTAT${code}`, locale: 'ko_KR',
        trdDd: krxTradeDate || DATES[0],
        strtDd: DATES[DATES.length - 1], endDd: krxTradeDate || DATES[0],
        isuCd: 'KR7069500007', isuCd2: 'KR7069500007',
        tboxisuCd_finder_secuprodisu1_0: '069500/KODEX 200',
        codeNmisuCd_finder_secuprodisu1_0: 'KODEX 200',
        param1isuCd_finder_secuprodisu1_0: '',
        mktId: 'ALL', share: '1', money: '1', csvxls_isNo: 'false',
      }, { cookies, headers: ref })));
  }

  // OTP 발급 후 CSV 를 받는 정식 경로. 이 저장소가 선물 통계에 이미 쓰고 있다.
  // JSON 이 막혀도 이쪽은 열려 있는 경우가 있다.
  await probe('krx.otp.csv', 'OTP → CSV 내려받기 (PDF 구성종목)', async () => {
    const params = new URLSearchParams({
      locale: 'ko_KR', trdDd: krxTradeDate || DATES[0],
      isuCd: 'KR7069500007', isuCd2: 'KR7069500007',
      tboxisuCd_finder_secuprodisu1_0: '069500/KODEX 200',
      codeNmisuCd_finder_secuprodisu1_0: 'KODEX 200',
      share: '1', money: '1', csvxls_isNo: 'false',
      name: 'fileDown', url: 'dbms/MDC/STAT/standard/MDCSTAT05001',
    });
    const otp = (await get(
      `https://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd?${params}`,
      { cookies, headers: ref })).text.trim();
    if (!otp || otp.includes('<')) {
      return { ok: false, summary: `OTP 발급 실패 (${otp.length}B): ${otp.slice(0, 80)}` };
    }
    const csv = await post('https://data.krx.co.kr/comm/fileDn/download_csv/download.cmd',
                           { code: otp }, { cookies, headers: ref });
    const lines = csv.text.split('\n').filter((l) => l.trim());
    return { ok: lines.length > 1, status: csv.status, bytes: csv.bytes,
             summary: `${lines.length}행 · 헤더: ${(lines[0] || '').slice(0, 150)}`,
             sampleRow: lines[1]?.slice(0, 200) };
  });
}

// ─────────────────────────── 2. 네이버 ───────────────────────────
// 국내 편입종목을 여기서 못 찾으면 이 도구의 절반이 비어 버린다.
// 그래서 후보를 넓게 훑고, etfAnalysis 응답은 통째로 저장해 눈으로 본다.
let naverAnalysisDump = null;

async function probeNaver() {
  await probe('naver.analysis.full', 'etfAnalysis 전문 저장 (구성종목이 섞여 있는가)', async () => {
    const raw = await get('https://m.stock.naver.com/api/stock/069500/etfAnalysis',
                          { headers: { Referer: 'https://m.stock.naver.com/' } });
    const json = JSON.parse(raw.text);
    naverAnalysisDump = json;
    // 배열로 된 필드 = 목록일 가능성. 구성종목이 있다면 여기 있다.
    const arrays = Object.entries(json)
      .filter(([, v]) => Array.isArray(v) && v.length)
      .map(([k, v]) => `${k}[${v.length}]{${Object.keys(v[0] || {}).join(',')}}`);
    return { status: raw.status, bytes: raw.bytes,
             summary: `키 ${Object.keys(json).length}개 · 배열필드: ${arrays.join(' | ') || '없음'}`,
             keys: Object.keys(json), arrays };
  });

  // 네이버가 ETF 구성종목을 어디로 내주는지 후보를 훑는다.
  const PATHS = [
    ['m.stock', 'https://m.stock.naver.com/api/stock/069500/etfComposition'],
    ['m.stock2', 'https://m.stock.naver.com/api/stock/069500/etfConstituent'],
    ['m.stock3', 'https://m.stock.naver.com/api/stock/069500/etfPortfolio'],
    ['m.stock4', 'https://m.stock.naver.com/api/stock/069500/etfComponent'],
    ['m.stock5', 'https://m.stock.naver.com/api/stock/069500/componentStock'],
    ['m.stock6', 'https://m.stock.naver.com/api/stock/069500/etf/component'],
    ['api.etf', 'https://api.stock.naver.com/etf/069500/componentStocks'],
    ['api.etf2', 'https://api.stock.naver.com/stock/069500/etfAnalysis'],
    ['pc.etf', 'https://finance.naver.com/item/etf_component.naver?code=069500'],
    ['pc.coinfo', 'https://finance.naver.com/item/coinfo.naver?code=069500'],
    ['pc.main', 'https://finance.naver.com/item/main.naver?code=069500'],
  ];
  for (const [id, url] of PATHS) {
    await probe(`naver.pdf.${id}`, `국내 구성종목 후보 — ${url.replace(/^https:\/\//, '')}`, async () => {
      const isPc = url.includes('finance.naver.com');
      const raw = await get(url, { encoding: isPc ? 'euc-kr' : 'utf-8',
                                   headers: { Referer: 'https://finance.naver.com/' } });
      if (!raw.ok) return { ok: false, status: raw.status, summary: raw.text.slice(0, 100) };
      // HTML 이면 "구성종목" 표가 들어 있는지만 본다.
      if (raw.text.trimStart().startsWith('<')) {
        const hit = /구성종목|구성자산|CU당|PDF/.test(raw.text);
        return { ok: hit, status: raw.status, bytes: raw.bytes,
                 summary: hit ? 'HTML 안에 구성종목 표 흔적 있음' : 'HTML · 구성종목 흔적 없음' };
      }
      const json = JSON.parse(raw.text);
      const arrays = Object.entries(json).filter(([, v]) => Array.isArray(v) && v.length);
      return { status: raw.status, bytes: raw.bytes,
               summary: `JSON 키: ${Object.keys(json).slice(0, 20).join(',')}` +
                        (arrays.length ? ` · 배열: ${arrays.map(([k, v]) => `${k}[${v.length}]`).join(',')}` : ''),
               sample: JSON.stringify(json).slice(0, 600) };
    });
  }

  // ETF 목록 API 의 탭 코드 = 네이버가 붙여 둔 분류. 우리 테마 태깅의 대조군.
  await probe('naver.tabs', 'ETF 목록의 분류 탭 코드 분포', async () => {
    const raw = await get('https://finance.naver.com/api/sise/etfItemList.nhn',
                          { headers: { Referer: 'https://finance.naver.com/sise/etf.naver' } });
    const list = JSON.parse(raw.text).result.etfItemList;
    const tabs = {};
    for (const it of list) tabs[it.etfTabCode] = (tabs[it.etfTabCode] || 0) + 1;
    return { status: raw.status, count: list.length, tabs,
             summary: `${list.length}종목 · 탭 ${JSON.stringify(tabs)}` };
  });
}

// ─────────────────────────── 3. 중국·야후 ───────────────────────────
async function probeChina() {
  const cookies = jar();
  let crumb = '';
  await probe('yahoo.crumb2', '쿠키 + crumb', async () => {
    await get('https://fc.yahoo.com/', { cookies }).catch(() => null);
    const res = await get('https://query1.finance.yahoo.com/v1/test/getcrumb', { cookies });
    crumb = res.text.trim();
    return { ok: Boolean(crumb), summary: `crumb ${crumb ? 'O' : 'X'} / 쿠키 ${cookies.size()}개` };
  });

  const SYMBOLS = [
    ['510300.SS', '상해 · CSI300'],
    ['510500.SS', '상해 · CSI500'],
    ['588000.SS', '상해 · 과창판50'],
    ['512880.SS', '상해 · 증권'],
    ['159915.SZ', '심천 · 촹예반'],
    ['159949.SZ', '심천 · 촹예반50'],
    ['2823.HK', '홍콩 · CSI300 (본토 익스포저)'],
    ['3188.HK', '홍콩 · CSI300 (다른 운용사)'],
    ['MCHI', '미국 상장 중국'],
    ['KWEB', '미국 상장 중국 인터넷'],
  ];
  for (const [sym, note] of SYMBOLS) {
    await probe(`yahoo.cn.${sym}`, `quoteSummary ${note}`, async () => {
      const qs = new URLSearchParams({
        modules: 'topHoldings,fundProfile,price,summaryDetail,defaultKeyStatistics' });
      if (crumb) qs.set('crumb', crumb);
      const raw = await get(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(sym)}?${qs}`,
        { cookies, headers: { Referer: 'https://finance.yahoo.com/' } });
      if (!raw.ok) return { ok: false, status: raw.status, summary: raw.text.slice(0, 120) };
      const r = JSON.parse(raw.text).quoteSummary?.result?.[0];
      if (!r) return { ok: false, status: raw.status, summary: '결과 없음' };
      const th = r.topHoldings;
      const n = th?.holdings?.length ?? 0;
      return { ok: n > 0, status: raw.status, holdingCount: n,
               summary: `holdings ${n}개 · sector ${th?.sectorWeightings?.length ?? 0}개 · ` +
                        `family ${r.fundProfile?.family ?? '-'} · ` +
                        `AUM ${r.summaryDetail?.totalAssets?.fmt ?? '-'}`,
               sampleHolding: th?.holdings?.[0] ?? null };
    });
  }
}

// ─────────────────────────── 4. 발행사 (국내 폴백) ───────────────────────────
// 네이버·KRX 가 둘 다 국내 구성종목을 안 주면 여기로 가야 한다.
async function probeIssuersKr() {
  const TARGETS = [
    ['tiger', '미래에셋 TIGER', 'https://www.tigeretf.com/ko/index.do'],
    ['kodex', '삼성 KODEX', 'https://www.kodex.com/ko/index.do'],
    ['kodex.api', '삼성 KODEX 상품 API',
     'https://www.kodex.com/ko/product/list.do'],
    ['seibro', '예탁결제원 SEIBRO ETF',
     'https://seibro.or.kr/websquare/control.jsp?w2xPath=/IPORTAL/user/etf/BIP_CNTS06001V.xml'],
  ];
  for (const [id, note, url] of TARGETS) {
    await probe(`issuer.kr.${id}`, note, async () => {
      const raw = await get(url, {
        headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                   'Accept-Encoding': 'gzip, deflate, br',
                   'Upgrade-Insecure-Requests': '1' },
      });
      return { ok: raw.ok, status: raw.status, bytes: raw.bytes,
               summary: `${raw.bytes}B · ${raw.text.slice(0, 90).replace(/\s+/g, ' ')}` };
    });
  }
}

// ─────────────────────────── 실행 ───────────────────────────
await probeKrx();
await probeNaver();
await probeChina();
await probeIssuersKr();

await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}/etf_probe2.json`,
  JSON.stringify({ probedAt: new Date().toISOString(), krxTradeDate, results }, null, 2) + '\n');
if (naverAnalysisDump) {
  await writeFile(`${OUT_DIR}/naver_etf_analysis.json`,
    JSON.stringify(naverAnalysisDump, null, 2) + '\n');
}

const lines = ['# ETF 원천 탐색 2차', '',
  `- 탐색 시각: ${new Date().toISOString()}`,
  `- KRX 기준일: ${krxTradeDate || '(못 찾음)'}`, '',
  '| 결과 | 항목 | 설명 | 상태 | 요약 |', '|---|---|---|---|---|'];
for (const r of results) {
  lines.push(`| ${r.ok ? '✅' : '❌'} | \`${r.id}\` | ${r.note} | ${r.status ?? '-'} | ` +
             `${(r.summary || r.error || '').replace(/\|/g, '\\|').slice(0, 200)} |`);
}
await writeFile(`${OUT_DIR}/etf_probe2.md`, lines.join('\n') + '\n');
console.log(`\n[probe2] ${results.filter((r) => r.ok).length}/${results.length} 성공`);
