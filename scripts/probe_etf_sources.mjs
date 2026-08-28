#!/usr/bin/env node
/**
 * ETF 원천 탐색 — 러너에서만 돈다.
 *
 * 브리핑 세션은 사내 이그레스 정책 때문에 KRX·네이버·야후 어디에도 직접
 * 붙지 못한다(CONNECT 403). 그래서 "어떤 엔드포인트가 실제로 응답하고,
 * 응답에 어떤 필드가 들어 있는지"를 여기서 확인해 파일로 남긴다.
 * 수집기(collect_etf_*.mjs)는 이 결과에 맞춰 쓴다.
 *
 *   node scripts/probe_etf_sources.mjs
 *   -> tools/discovery/etf_probe.json   (기계용: 상태·필드 목록)
 *   -> tools/discovery/etf_probe.md     (사람용: 한눈에 보는 표)
 *
 * 실패는 잡을 실패시키지 않는다. 못 붙은 칸도 그대로 기록해야 다음 수를 정한다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_DIR = 'tools/discovery';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const results = [];

/** 응답 본문에서 "무엇이 들어있는지"만 압축해 남긴다. 원문 전체는 너무 크다. */
function shape(value, depth = 0) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return depth > 2 ? `[${value.length}]` : `[${value.length} x ${shape(value[0], depth + 1)}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (depth > 2) return `{${keys.length} keys}`;
    return '{' + keys.slice(0, 40).join(', ') + (keys.length > 40 ? ', …' : '') + '}';
  }
  if (typeof value === 'string') return value.length > 60 ? `"${value.slice(0, 60)}…"` : `"${value}"`;
  return String(value);
}

async function probe(id, note, fn) {
  const started = Date.now();
  const row = { id, note };
  try {
    const out = await fn();
    Object.assign(row, out, { ok: out.ok !== false });
  } catch (err) {
    row.ok = false;
    row.error = `${err.name}: ${err.message}`;
  }
  row.ms = Date.now() - started;
  results.push(row);
  console.log(`[${row.ok ? ' OK ' : 'FAIL'}] ${id} — ${row.error || row.summary || ''}`);
  return row;
}

/** 공통 fetch. 본문을 JSON 으로 읽어보고, 안 되면 텍스트 앞머리만 남긴다. */
async function hit(url, init = {}) {
  const res = await fetch(url, {
    redirect: 'follow',
    ...init,
    headers: { 'User-Agent': UA, ...(init.headers || {}) },
  });
  const text = await res.text();
  const out = { status: res.status, bytes: text.length,
                contentType: res.headers.get('content-type') || '' };
  if (!res.ok) {
    out.ok = false;
    out.body = text.slice(0, 300);
    return out;
  }
  try {
    out.json = JSON.parse(text);
  } catch {
    out.text = text.slice(0, 400);
  }
  return out;
}

// ───────────────────────────── KRX ─────────────────────────────
// 이 저장소의 scripts/fetch_market.py 가 이미 쓰고 있는 요청 형태를 그대로 따른다.
const KRX_URL = 'https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd';
const KRX_HEADERS = {
  'Referer': 'https://data.krx.co.kr/contents/MDC/MDI/mainChart/index.cmd',
  'Origin': 'https://data.krx.co.kr',
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
};

async function krx(params) {
  return hit(KRX_URL, {
    method: 'POST',
    headers: KRX_HEADERS,
    body: new URLSearchParams({ locale: 'ko_KR', csvxls_isNo: 'false', ...params }).toString(),
  });
}

/** KRX 응답에서 데이터 블록 이름과 첫 행의 컬럼을 뽑는다 — 이게 이 프로브의 목적. */
function krxDigest(out) {
  if (!out.json) return out;
  const blocks = {};
  for (const [key, val] of Object.entries(out.json)) {
    if (Array.isArray(val)) {
      blocks[key] = { rows: val.length, columns: val.length ? Object.keys(val[0]) : [] };
    }
  }
  out.blocks = blocks;
  const main = Object.entries(blocks).find(([, b]) => b.rows > 0);
  out.summary = main
    ? `${main[0]} ${main[1].rows}행 / ${main[1].columns.length}열`
    : `데이터 블록 없음 (keys: ${Object.keys(out.json).join(',')})`;
  if (main) {
    const arr = out.json[main[0]];
    out.sampleRow = arr[0];
  }
  delete out.json;
  return out;
}

// 최근 영업일을 뒤로 훑는다. 휴장일이면 빈 응답이 오므로 며칠 시도해야 한다.
function recentDates(n = 7) {
  const out = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() - 1);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    out.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}

const DATES = recentDates();
let tradeDate = null;          // 실제로 데이터가 나온 날짜
let sampleIsuCd = null;        // PDF 조회에 필요한 표준코드 (KR7069500007 꼴)

async function probeKrx() {
  // 1) ETF 전종목 시세 — 유니버스의 뼈대. 날짜를 찾는 것도 겸한다.
  await probe('krx.etf.all', 'ETF 전종목 시세 (MDCSTAT04301)', async () => {
    for (const dd of DATES) {
      const out = krxDigest(await krx({ bld: 'dbms/MDC/STAT/standard/MDCSTAT04301',
                                        trdDd: dd, share: '1', money: '1' }));
      if (out.sampleRow) {
        tradeDate = dd;
        out.trdDd = dd;
        return out;
      }
    }
    return { ok: false, error: `최근 ${DATES.length} 영업일 모두 빈 응답` };
  });

  // 2) ETF 종목 finder — 종목코드(069500) -> 표준코드(KR7069500007).
  //    PDF 구성종목 조회가 표준코드를 요구하므로 이 경로가 살아 있어야 한다.
  await probe('krx.finder', 'ETF 종목 finder (finder_secuprodisu)', async () => {
    for (const bld of ['dbms/comm/finder/finder_secuprodisu',
                       'dbms/comm/finder/finder_secuprodisu1',
                       'dbms/comm/finder/finder_equisu']) {
      const out = krxDigest(await krx({ bld, mktsel: 'ETF', typeNo: '0', searchText: 'KODEX 200' }));
      if (out.sampleRow) {
        out.bld = bld;
        const row = out.sampleRow;
        sampleIsuCd = row.full_code || row.isu_cd || row.short_code || null;
        return out;
      }
    }
    return { ok: false, error: '세 finder 모두 빈 응답' };
  });

  // 3) ETF 관련 통계 화면들을 훑는다. 운용사·기초지수·총보수·상장일이
  //    어느 화면에 들어 있는지 여기서 확정한다.
  const codes = ['04301', '04302', '04401', '04501', '04601',
                 '04701', '04801', '04901', '05001', '05101'];
  for (const code of codes) {
    if (code === '04301') continue;                     // 위에서 이미 봤다
    await probe(`krx.stat.${code}`, `MDCSTAT${code} 필드 확인`, async () => {
      const params = { bld: `dbms/MDC/STAT/standard/MDCSTAT${code}`,
                       trdDd: tradeDate || DATES[0], share: '1', money: '1',
                       strtDd: DATES[DATES.length - 1], endDd: tradeDate || DATES[0],
                       mktId: 'ETF', secugrpId: 'ST' };
      if (sampleIsuCd) { params.isuCd = sampleIsuCd; params.isuCd2 = sampleIsuCd; }
      return krxDigest(await krx(params));
    });
  }

  // 4) PDF(구성종목) — 이 도구의 핵심. 코드가 위 훑기에서 안 잡히면 여기서 직접.
  await probe('krx.pdf', 'ETF 구성종목 PDF (MDCSTAT05001)', async () => {
    if (!sampleIsuCd) return { ok: false, error: 'finder 가 표준코드를 못 줘서 시도 불가' };
    const out = krxDigest(await krx({
      bld: 'dbms/MDC/STAT/standard/MDCSTAT05001',
      trdDd: tradeDate || DATES[0], isuCd: sampleIsuCd, isuCd2: sampleIsuCd,
      tboxisuCd_finder_secuprodisu1_0: '069500/KODEX 200',
      codeNmisuCd_finder_secuprodisu1_0: 'KODEX 200',
      param1isuCd_finder_secuprodisu1_0: '', money: '1',
    }));
    out.isuCd = sampleIsuCd;
    return out;
  });
}

// ──────────────────────────── 네이버 ────────────────────────────
async function probeNaver() {
  await probe('naver.etf.list', 'ETF 전종목 목록/시세', async () => {
    const out = await hit('https://finance.naver.com/api/sise/etfItemList.nhn',
                          { headers: { Referer: 'https://finance.naver.com/sise/etf.naver' } });
    if (out.json?.result?.etfItemList) {
      const list = out.json.result.etfItemList;
      out.summary = `${list.length}종목 / 컬럼 ${Object.keys(list[0] || {}).join(',')}`;
      out.sampleRow = list[0];
      out.count = list.length;
    }
    delete out.json;
    return out;
  });

  // 모바일 API 는 이 저장소가 시세에 이미 쓰고 있다. ETF 전용 화면이 있는지 본다.
  for (const path of ['etfAnalysis', 'integration', 'basic', 'etf/constituent']) {
    await probe(`naver.m.${path.replace('/', '.')}`, `m.stock 069500 ${path}`, async () => {
      const out = await hit(`https://m.stock.naver.com/api/stock/069500/${path}`,
                            { headers: { Referer: 'https://m.stock.naver.com/' } });
      if (out.json) { out.summary = shape(out.json); out.sample = out.json; delete out.json; }
      return out;
    });
  }
}

// ───────────────────────────── Yahoo ─────────────────────────────
// quoteSummary 는 쿠키+crumb 를 요구한다. 그 흐름이 러너에서 되는지부터 본다.
let yahooCookie = '';
let yahooCrumb = '';

async function probeYahoo() {
  await probe('yahoo.crumb', '쿠키 + crumb 획득', async () => {
    const first = await fetch('https://fc.yahoo.com/', {
      headers: { 'User-Agent': UA }, redirect: 'follow',
    }).catch(() => null);
    const setCookie = first?.headers?.getSetCookie?.() || [];
    yahooCookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    const res = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, Cookie: yahooCookie },
    });
    yahooCrumb = (await res.text()).trim();
    return { status: res.status, gotCookie: Boolean(yahooCookie), crumbLen: yahooCrumb.length,
             summary: `cookie ${yahooCookie ? 'O' : 'X'} / crumb ${yahooCrumb ? 'O' : 'X'}`,
             ok: Boolean(yahooCrumb) };
  });

  const MODULES = 'topHoldings,fundProfile,price,summaryDetail,defaultKeyStatistics';

  async function quoteSummary(symbol) {
    const qs = new URLSearchParams({ modules: MODULES });
    if (yahooCrumb) qs.set('crumb', yahooCrumb);
    const out = await hit(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?${qs}`,
      { headers: { Cookie: yahooCookie, Referer: 'https://finance.yahoo.com/' } });
    const r = out.json?.quoteSummary?.result?.[0];
    if (r) {
      const th = r.topHoldings;
      out.summary = [
        `modules: ${Object.keys(r).join(',')}`,
        `holdings ${th?.holdings?.length ?? 0}개`,
        `sectorWeightings ${th?.sectorWeightings?.length ?? 0}개`,
        `family ${r.fundProfile?.family ?? '-'}`,
        `TER ${r.fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio?.raw ?? '-'}`,
        `AUM ${r.summaryDetail?.totalAssets?.fmt ?? r.defaultKeyStatistics?.totalAssets?.fmt ?? '-'}`,
      ].join(' | ');
      out.sampleHolding = th?.holdings?.[0] ?? null;
      out.holdingCount = th?.holdings?.length ?? 0;
      out.hasSector = Boolean(th?.sectorWeightings?.length);
    } else if (out.json) {
      out.summary = `결과 없음: ${JSON.stringify(out.json).slice(0, 200)}`;
      out.ok = false;
    }
    delete out.json;
    return out;
  }

  // 미국 상장은 확실할 것으로 보지만, 이 도구의 진짜 관문은 홍콩·일본·유럽이다.
  // 여기서 편입종목이 안 나오면 그 시장은 발행사 폴백으로 가야 한다.
  const SYMBOLS = [
    ['SPY', '미국 · S&P500'],
    ['QQQ', '미국 · 나스닥100'],
    ['2800.HK', '홍콩 · 항셍'],
    ['3033.HK', '홍콩 · 항셍테크'],
    ['1306.T', '일본 · TOPIX'],
    ['1321.T', '일본 · 닛케이225'],
    ['EXS1.DE', '독일 · DAX'],
    ['IWDA.AS', '네덜란드 · MSCI World UCITS'],
    ['CSPX.L', '런던 · S&P500 UCITS'],
    ['069500.KS', '한국 · KODEX 200 (야후에도 있는지)'],
  ];
  for (const [sym, note] of SYMBOLS) {
    await probe(`yahoo.holdings.${sym}`, `quoteSummary ${note}`, () => quoteSummary(sym));
  }

  // 수익률 계산용. 편입종목과 달리 chart 는 crumb 없이 열려 있는 편이다.
  await probe('yahoo.chart', 'chart v8 (수익률 backfill)', async () => {
    const out = await hit('https://query1.finance.yahoo.com/v8/finance/chart/069500.KS' +
                          '?range=3y&interval=1d&events=div');
    const r = out.json?.chart?.result?.[0];
    if (r) {
      out.summary = `${r.timestamp?.length ?? 0}봉 / 배당 ${Object.keys(r.events?.dividends || {}).length}건 / ` +
                    `adjclose ${r.indicators?.adjclose ? 'O' : 'X'}`;
      out.hasAdjClose = Boolean(r.indicators?.adjclose);
      out.hasDividends = Boolean(r.events?.dividends);
    }
    delete out.json;
    return out;
  });
}

// ─────────────────────── 발행사 직접 제공 (폴백) ───────────────────────
// 야후가 막히거나 편입종목을 안 주는 시장은 발행사 파일로 간다.
async function probeIssuers() {
  const TARGETS = [
    ['ishares.us.ivv', 'iShares IVV (미국) holdings CSV',
     'https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf/1467271812596.ajax' +
     '?fileType=csv&fileName=IVV_holdings&dataType=fund'],
    ['ishares.ucits.cspx', 'iShares CSPX (UCITS) holdings CSV',
     'https://www.ishares.com/uk/individual/en/products/253743/' +
     '?fileType=csv&fileName=CSPX_holdings&dataType=fund'],
    ['ssga.spy', 'SPDR SPY holdings',
     'https://www.ssga.com/us/en/intermediary/library-content/products/fund-data/etfs/us/holdings-daily-us-en-spy.xlsx'],
    ['invesco.qqq', 'Invesco QQQ holdings CSV',
     'https://www.invesco.com/us/financial-products/etfs/holdings/main/holdings/0?audienceType=Investor&action=download&ticker=QQQ'],
    ['nomura.1306', '野村 NEXT FUNDS 1306 (일본)',
     'https://nextfunds.jp/lineup/1306/'],
    ['tiger.kr', '미래에셋 TIGER ETF 사이트',
     'https://www.tigeretf.com/ko/index.do'],
    ['krx.etf.site', 'KRX ETF 전용 사이트',
     'https://etf.krx.co.kr/'],
  ];
  for (const [id, note, url] of TARGETS) {
    await probe(`issuer.${id}`, note, async () => {
      const out = await hit(url);
      if (out.text) out.summary = `${out.bytes}B · ${out.text.slice(0, 80).replace(/\s+/g, ' ')}`;
      else if (out.json) { out.summary = shape(out.json); delete out.json; }
      else out.summary = `${out.bytes}B · ${out.contentType}`;
      return out;
    });
  }
}

// ───────────────────────────── 실행 ─────────────────────────────
await probeKrx();
await probeNaver();
await probeYahoo();
await probeIssuers();

await mkdir(OUT_DIR, { recursive: true });

const report = {
  probedAt: new Date().toISOString(),
  runner: `${process.platform} node ${process.version}`,
  tradeDate,
  sampleIsuCd,
  yahoo: { cookie: Boolean(yahooCookie), crumb: Boolean(yahooCrumb) },
  results,
};
await writeFile(`${OUT_DIR}/etf_probe.json`, JSON.stringify(report, null, 2) + '\n');

const lines = [
  '# ETF 원천 탐색 결과',
  '',
  `- 탐색 시각: ${report.probedAt}`,
  `- KRX 기준일: ${tradeDate || '(못 찾음)'} / 표본 표준코드: ${sampleIsuCd || '(못 찾음)'}`,
  `- Yahoo 쿠키·crumb: ${yahooCookie ? 'O' : 'X'} · ${yahooCrumb ? 'O' : 'X'}`,
  '',
  '| 결과 | 항목 | 설명 | 상태 | 요약 |',
  '|---|---|---|---|---|',
];
for (const r of results) {
  const summary = (r.summary || r.error || '').replace(/\|/g, '\\|').slice(0, 160);
  lines.push(`| ${r.ok ? '✅' : '❌'} | \`${r.id}\` | ${r.note} | ${r.status ?? '-'} | ${summary} |`);
}
await writeFile(`${OUT_DIR}/etf_probe.md`, lines.join('\n') + '\n');

const okCount = results.filter((r) => r.ok).length;
console.log(`\n[probe] ${okCount}/${results.length} 성공 → ${OUT_DIR}/etf_probe.{json,md}`);
