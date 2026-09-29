// ETF 편입종목 화면 — 1단계: 원천을 찔러 본다.
//
// 아무것도 만들지 않고 아무것도 덮어쓰지 않는다. 어느 주소가 열리고, 무엇을
// 주고, 몇 개를 주는지만 적는다(tools/discovery/etf_src_probe.{json,md}).
//
// 클로드 세션 컨테이너에서는 네이버·야후·KRX 가 모두 CONNECT 403 이라
// 러너에서 돈다(.github/workflows/etf-src-probe.yml).
//
// 한 주소에 한 번만, 사이에 0.6초 쉰다 — 탐침 때문에 원천이 우리를 막으면
// 뒤의 매일 수집까지 막힌다.

import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = { ranAt: new Date().toISOString(), probes: [] };

// 값의 모양만 남긴다(배열은 길이 + 첫 원소의 모양). 원문 전체는 커서 안 남긴다.
function shape(v, depth = 0) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return v.length ? [`len=${v.length}`, depth < 4 ? shape(v[0], depth + 1) : '…'] : '[]';
  if (typeof v === 'object') {
    if (depth >= 4) return '{…}';
    const o = {};
    for (const [k, x] of Object.entries(v).slice(0, 60)) o[k] = shape(x, depth + 1);
    return o;
  }
  if (typeof v === 'string') return `str:${v.slice(0, 60)}`;
  return `${typeof v}:${v}`;
}

let cookieJar = '';
async function hit(group, label, url, opt = {}) {
  const rec = { group, label, url };
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: opt.method || 'GET',
      headers: { 'User-Agent': UA, Accept: '*/*', 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8', ...(opt.cookie ? { Cookie: cookieJar } : {}), ...(opt.headers || {}) },
      body: opt.body,
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
    rec.status = res.status;
    rec.contentType = res.headers.get('content-type');
    if (opt.keepCookie) {
      const sc = res.headers.getSetCookie?.() || [];
      cookieJar = [cookieJar, ...sc.map((c) => c.split(';')[0])].filter(Boolean).join('; ');
      rec.setCookies = sc.length;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    rec.bytes = buf.length;
    let text = buf.toString('utf8');
    if (opt.euckr) text = new TextDecoder('euc-kr').decode(buf);
    rec.ms = Date.now() - t0;
    let json = null;
    try { json = JSON.parse(text); } catch { /* 글 */ }
    if (json !== null) {
      rec.kind = 'json';
      rec.shape = shape(json);
      if (opt.pick) {
        try { rec.pick = opt.pick(json); } catch (e) { rec.pickError = String(e); }
      }
    } else {
      rec.kind = 'text';
      rec.head = text.slice(0, 600);
      if (opt.grep) {
        rec.grep = {};
        for (const [k, re] of Object.entries(opt.grep)) {
          const m = text.match(re);
          rec.grep[k] = m ? m.slice(0, 3).map((s) => String(s).slice(0, 400)) : null;
        }
      }
      if (opt.pickText) {
        try { rec.pick = opt.pickText(text); } catch (e) { rec.pickError = String(e); }
      }
    }
    rec._json = json;
  } catch (e) {
    rec.error = String(e?.cause?.code || e?.message || e);
    rec.ms = Date.now() - t0;
  }
  const { _json, ...keep } = rec;
  out.probes.push(keep);
  console.log(`[${group}] ${label} → ${rec.status ?? rec.error} ${rec.bytes ?? ''}B ${rec.ms}ms`);
  await sleep(600);
  return rec;
}

// ─────────────── 국내(네이버) ───────────────
const KR_SAMPLES = ['069500', '360750', '305720', '453850', '252670']; // 주식·해외주식·섹터·채권·인버스2X

const list = await hit('KR', '네이버 ETF 전체 목록', 'https://finance.naver.com/api/sise/etfItemList.nhn?etfType=0&targetColumn=market_sum&sortOrder=desc', {
  euckr: true,
  pickText: (t) => {
    const j = JSON.parse(t);
    const items = j.result?.etfItemList || [];
    const byType = {};
    for (const it of items) byType[it.etfTabCode] = (byType[it.etfTabCode] || 0) + 1;
    return { count: items.length, byTabCode: byType, first: items.slice(0, 3), fields: Object.keys(items[0] || {}) };
  },
});

for (const code of KR_SAMPLES.slice(0, 2)) {
  await hit('KR', `모바일 integration ${code}`, `https://m.stock.naver.com/api/stock/${code}/integration`, {
    pick: (j) => ({ keys: Object.keys(j), etfKeyIndicator: j.etfKeyIndicator, totalInfos: j.totalInfos?.map((x) => [x.code, x.key, x.value]), etfTop10: j.etfTop10MajorConstituentAssets ?? null }),
  });
  await hit('KR', `모바일 basic ${code}`, `https://m.stock.naver.com/api/stock/${code}/basic`, { pick: (j) => j });
}
for (const code of KR_SAMPLES) {
  await hit('KR', `모바일 etfAnalysis ${code}`, `https://m.stock.naver.com/api/stock/${code}/etfAnalysis`, { pick: (j) => j });
}
// 편입종목(구성자산) 후보 — 이름이 확실하지 않아 여럿을 찔러 본다.
for (const path of ['etfComponent', 'etf/component', 'constituent', 'etfTop10']) {
  await hit('KR', `모바일 ${path} 069500`, `https://m.stock.naver.com/api/stock/069500/${path}`, { pick: (j) => j });
}
await hit('KR', 'PC 종목 페이지 069500 (구성종목 표가 있나)', 'https://finance.naver.com/item/main.naver?code=069500', {
  euckr: true,
  grep: { cu: /구성종목[^<]{0,40}/g, iframe: /<iframe[^>]+src="[^"]+"/g, wise: /wisereport[^"']+/g },
});
await hit('KR', 'wisereport ETF 069500', 'https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd=069500', {
  grep: { ajax: /url\s*:\s*['"][^'"]+['"]/g, data: /var\s+\w+\s*=\s*[\[{][^;]{0,300}/g, names: /(삼성전자|SK하이닉스)[^<]{0,80}/g },
});
await hit('KR', 'wisereport ETF 453850 (채권)', 'https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd=453850', {
  grep: { data: /var\s+\w+\s*=\s*[\[{][^;]{0,300}/g },
});
// 일봉(가격) — 수정주가가 아니라 원가격인지, 분배금은 어디서 오는지
await hit('KR', '네이버 siseJson 일봉 069500', 'https://api.finance.naver.com/siseJson.naver?symbol=069500&requestType=1&startTime=20150101&endTime=20260930&timeframe=day', {
  pickText: (t) => { const rows = t.trim().split('\n').filter((l) => /\d{8}/.test(l)); return { rows: rows.length, first: rows[0], last: rows.slice(-3) }; },
});
await hit('KR', '네이버 fchart 일봉 069500', 'https://fchart.stock.naver.com/sise.nhn?symbol=069500&timeframe=day&count=3000&requestType=0', {
  euckr: true,
  pickText: (t) => { const m = t.match(/data="[^"]+"/g) || []; return { rows: m.length, first: m[0], last: m.slice(-2) }; },
});
await hit('KR', '모바일 분배금 069500', 'https://m.stock.naver.com/api/stock/069500/dividend/history?pageSize=20', { pick: (j) => j });
await hit('KR', '모바일 price 069500', 'https://m.stock.naver.com/api/stock/069500/price?pageSize=5&page=1', { pick: (j) => j });

// KRX — 회사 IP 는 막힌다고 들었다. 러너에서도 막히는지만 본다.
await hit('KR', 'KRX 정보데이터시스템 첫 화면', 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201030101', {});
await hit('KR', 'KRX ETF 전종목 시세(JSON)', 'https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', Referer: 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201030101' },
  body: 'bld=dbms/MDC/STAT/standard/MDCSTAT04301&locale=ko_KR&trdDd=20260925&share=1&money=1&csvxls_isNo=false',
  pick: (j) => ({ keys: Object.keys(j), n: j.output?.length, first: j.output?.[0] }),
});

// ─────────────── 야후 ───────────────
await hit('Y', '쿠키 받기 fc.yahoo.com', 'https://fc.yahoo.com', { keepCookie: true });
const crumbRec = await hit('Y', 'crumb', 'https://query1.finance.yahoo.com/v1/test/getcrumb', { cookie: true, pickText: (t) => t.slice(0, 40) });
const crumb = crumbRec.kind === 'text' && crumbRec.status === 200 ? crumbRec.head.trim() : '';
const Y_SAMPLES = ['SPY', 'QQQ', 'AGG', '2800.HK', '3033.HK', '1306.T', '1321.T', '510300.SS', '159919.SZ', '069500.KS', '069500.KQ', '360750.KS'];
for (const s of Y_SAMPLES) {
  await hit('Y', `quoteSummary ${s}`, `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(s)}?modules=quoteType,price,topHoldings,fundProfile,summaryDetail,defaultKeyStatistics,fundPerformance&crumb=${encodeURIComponent(crumb)}`, {
    cookie: true,
    pick: (j) => {
      const r = j.quoteSummary?.result?.[0];
      if (!r) return { error: j.quoteSummary?.error };
      const th = r.topHoldings || {};
      return {
        quoteType: r.quoteType?.quoteType, longName: r.quoteType?.longName, exchange: r.quoteType?.exchange, currency: r.price?.currency,
        holdings: (th.holdings || []).length, holdingsSample: (th.holdings || []).slice(0, 3),
        sectorWeightings: (th.sectorWeightings || []).length, cashPosition: th.cashPosition, stockPosition: th.stockPosition, bondPosition: th.bondPosition,
        family: r.fundProfile?.family, categoryName: r.fundProfile?.categoryName, expense: r.fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio,
        totalAssets: r.summaryDetail?.totalAssets ?? r.defaultKeyStatistics?.totalAssets, yieldTTM: r.summaryDetail?.yield, navPrice: r.summaryDetail?.navPrice,
        fundInceptionDate: r.defaultKeyStatistics?.fundInceptionDate, trailingReturns: r.fundPerformance?.trailingReturns ? Object.keys(r.fundPerformance.trailingReturns) : null,
      };
    },
  });
}
for (const s of ['SPY', '2800.HK', '1306.T', '510300.SS', '069500.KS']) {
  await hit('Y', `chart 10y ${s}`, `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=10y&interval=1d&events=div%7Csplit`, {
    pick: (j) => {
      const r = j.chart?.result?.[0];
      if (!r) return { error: j.chart?.error };
      const ts = r.timestamp || [];
      const c = r.indicators?.quote?.[0]?.close || [];
      const ac = r.indicators?.adjclose?.[0]?.adjclose || [];
      const nulls = c.filter((x) => x == null).length;
      return {
        instrumentType: r.meta?.instrumentType, currency: r.meta?.currency, exchangeName: r.meta?.exchangeName,
        bars: ts.length, first: ts[0] && new Date(ts[0] * 1000).toISOString().slice(0, 10), last: ts.at(-1) && new Date(ts.at(-1) * 1000).toISOString().slice(0, 10),
        lastClose: c.at(-1), lastAdj: ac.at(-1), nullCloses: nulls, dividends: Object.keys(r.events?.dividends || {}).length,
      };
    },
  });
}
// 목록(유니버스) — 야후 스크리너가 지역별 ETF 를 순자산 순으로 주는지
for (const region of ['us', 'hk', 'jp', 'cn']) {
  const body = JSON.stringify({
    size: 25, offset: 0, sortField: 'fundnetassets', sortType: 'DESC', quoteType: 'ETF',
    query: { operator: 'AND', operands: [{ operator: 'eq', operands: ['region', region] }] }, userId: '', userIdType: 'guid',
  });
  await hit('Y', `screener ETF region=${region}`, `https://query2.finance.yahoo.com/v1/finance/screener?crumb=${encodeURIComponent(crumb)}&lang=en-US&region=US&formatted=false`, {
    method: 'POST', cookie: true, headers: { 'Content-Type': 'application/json' }, body,
    pick: (j) => { const r = j.finance?.result?.[0]; return r ? { total: r.total, count: r.count, sample: (r.quotes || []).slice(0, 5).map((q) => [q.symbol, q.shortName, q.netAssets ?? q.fundNetAssets, q.exchange]) } : { error: j.finance?.error }; },
  });
}

// ─────────────── 해외 편입종목 다른 길 ───────────────
// 중국 본토: "주는 데가 없다" 고 들었다. 동방재부(eastmoney) 펀드 보유종목을 찔러 확인한다.
await hit('CN', 'eastmoney 510300 보유종목', 'https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=510300&topline=10&year=&month=', {
  grep: { rows: /<tr>.*?<\/tr>/g, date: /截止至：[^<]{0,30}/g },
});
await hit('CN', 'eastmoney 159919 보유종목', 'https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=159919&topline=10&year=&month=', {
  grep: { rows: /<tr>.*?<\/tr>/g },
});
// 네이버 해외주식(미국 ETF) — 편입종목을 주는지
await hit('NV-US', '네이버 해외 basic SPY', 'https://api.stock.naver.com/stock/SPY/basic', { pick: (j) => ({ keys: Object.keys(j), stockItemTotalInfos: j.stockItemTotalInfos?.map((x) => [x.code, x.key, x.value]) }) });
await hit('NV-US', '네이버 해외 integration SPY', 'https://api.stock.naver.com/stock/SPY/integration', { pick: (j) => ({ keys: Object.keys(j) }) });
await hit('NV-US', '네이버 해외 ETF 구성 SPY', 'https://api.stock.naver.com/etf/SPY/holdings', { pick: (j) => j });

// 미국 목록 다른 길 — nasdaq 스크리너
await hit('US', 'nasdaq ETF 스크리너', 'https://api.nasdaq.com/api/screener/etf?download=true', {
  pick: (j) => { const rows = j.data?.data?.rows || j.data?.rows || []; return { count: rows.length, first: rows[0] }; },
});

// 환율(원화 환산 병기)
for (const s of ['KRW=X', 'HKDKRW=X', 'JPYKRW=X', 'CNYKRW=X']) {
  await hit('FX', `chart ${s}`, `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=5d&interval=1d`, {
    pick: (j) => { const r = j.chart?.result?.[0]; return r ? { last: r.meta?.regularMarketPrice, time: r.meta?.regularMarketTime } : j.chart?.error; },
  });
}

// ─────────────── 정리 ───────────────
fs.mkdirSync('tools/discovery', { recursive: true });
fs.writeFileSync('tools/discovery/etf_src_probe.json', JSON.stringify(out, null, 1));
const lines = [`# ETF 원천 탐침 (${out.ranAt})`, '', '| 묶음 | 무엇 | 응답 | 크기 | 요점 |', '|---|---|---|---|---|'];
for (const p of out.probes) {
  const gist = p.error ? p.error : JSON.stringify(p.pick ?? p.grep ?? p.head ?? '').slice(0, 220).replace(/\|/g, '/').replace(/\n/g, ' ');
  lines.push(`| ${p.group} | ${p.label} | ${p.status ?? '-'} | ${p.bytes ?? '-'} | ${gist} |`);
}
fs.writeFileSync('tools/discovery/etf_src_probe.md', lines.join('\n') + '\n');
console.log('done', out.probes.length);
