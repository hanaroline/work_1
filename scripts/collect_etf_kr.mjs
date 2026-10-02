#!/usr/bin/env node
/**
 * 국내 ETF 수집 — 네이버.
 *
 *   node scripts/collect_etf_kr.mjs
 *   -> data/etf-kr.js   (window.ETF_KR)
 *
 * 왜 KRX 가 아니라 네이버인가:
 *   KRX 정보데이터시스템은 러너에서 열리지 않는다. 세션 쿠키를 받아 쥐고
 *   불러도 통계 요청은 전부 400 "LOGOUT" 이고, OTP→CSV 정식 경로는 403 이다
 *   (tools/discovery/etf_probe2.md). 기관 IP 를 막는 것으로 보인다.
 *
 *   대신 네이버 모바일의 etfAnalysis 하나가 이 화면에 필요한 것을 거의 다 준다:
 *   상위10 편입종목·비중, 운용사, 기초지수, 총보수, 순자산, 상장일,
 *   기간수익률(시장가 기준과 NAV 기준), 섹터·국가·자산 비중,
 *   자금유입, 괴리율, 추적오차, 배당수익률.
 *
 * **기간수익률은 야후 일봉에서 계산한다. 네이버 값을 쓰지 않는다.**
 *
 * 처음에는 네이버의 시장가·NAV 수익률을 그대로 실었다. 그런데 그 둘 중
 * 어느 쪽에도 분배금이 반영되지 않아, 분배율 20%가 넘는 커버드콜의 성과가
 * 통째로 사라졌다.
 *
 * 야후 배당 이력으로 총수익률을 만들 수 있다는 것을 확인했다
 * (tools/discovery/etf_dividend_probe.md). 네 종목 표본에서 최근 12개월
 * 배당을 현재가로 나눈 값이 표기 분배율과 거의 일치했다 —
 * 0.8/0.78, 2.9/3.2, 20.9/21.4, 14.7/14.5.
 *
 * 그런데 **총수익률만 야후에서 받고 시장가는 네이버를 쓰면 안 된다.** 두
 * 원천의 1년 수익률이 크게 다르기 때문이다(TIGER 배당커버드콜액티브에서
 * 네이버 131.45% vs 야후 76.06%). 서로 다른 계열을 빼면 "분배금 효과" 가
 * 아니라 원천 차이가 나온다 — 검산이 국내를 "분배금 미반영" 으로 판정한
 * 것이 이 탓이었다.
 *
 * 그래서 price 와 tr 을 **한 원천(야후)에서 짝으로** 만든다. 해외 수집기와
 * 같은 계산기를 쓰므로 두 시장의 두 계열이 모두 한 뜻이 된다.
 * 네이버의 기준가 수익률은 nav 로만 남긴다 — 국내에만 있는 참고값이다.
 *
 * 호출 수는 종목 수만큼(약 1,160회)이다. 한꺼번에 던지면 막히므로 동시
 * 6개로 묶고, 실패한 종목은 건너뛴다. 수집률이 기준에 못 미치면 파일을
 * 쓰지 않고 끝낸다 — 반쪽짜리로 어제 데이터를 덮는 것이 제일 나쁘다.
 */

import { getJson, getJsonIn, mapLimit, num, parsePercent, parseKoreanAmount,
         periodMap, weightMap, writeDataFile, assertEnough,
         fetchYahooReturns, sleep } from './etf_lib.mjs';

const LIST_URL = 'https://finance.naver.com/api/sise/etfItemList.nhn';
const DETAIL = (code) => `https://m.stock.naver.com/api/stock/${code}/etfAnalysis`;
const OUT = 'data/etf-kr.js';

// 네이버 ETF 목록 화면의 분류 탭. 우리 테마 태깅과 별개로 같이 들고 간다 —
// 사람이 만든 분류라 자동 태깅이 틀렸을 때 대조군이 된다.
const TAB_LABELS = {
  1: '국내 시장지수', 2: '국내 업종·테마', 3: '국내 파생',
  4: '해외 주식', 5: '원자재', 6: '채권', 7: '기타',
};

async function fetchList() {
  // 이 목록만 EUC-KR 이다. 상세(m.stock)는 UTF-8 이라 그쪽은 그냥 읽는다.
  const json = await getJsonIn(LIST_URL, 'euc-kr',
    { headers: { Referer: 'https://finance.naver.com/sise/etf.naver' } });
  const list = json?.result?.etfItemList;
  if (!Array.isArray(list) || !list.length) throw new Error('ETF 목록이 비어 있다');
  return list;
}

/** etfAnalysis 응답 하나를 우리 스키마로 옮긴다. */
function shapeDetail(d) {
  if (!d || !d.itemCode) return null;
  return {
    // 기본 정보
    name: d.itemName || null,               // 상세 쪽 이름이 정본이다(UTF-8)
    manager: d.issuerName || null,          // "삼성자산운용(ETF)" 꼴로 온다
    indexName: d.etfBaseIndex || null,
    listedDate: d.listedDate || null,       // "20021014"
    ter: num(d.totalFee),                   // 총보수 %
    summary: d.etfSummary || null,

    // 규모 — marketValueRaw 는 시가총액(원). totalNav 는 표기 문자열뿐이라 파싱한다.
    marketCap: num(d.marketValueRaw),
    aum: parseKoreanAmount(d.totalNav),     // 순자산총액 = 흔히 말하는 설정액
    nav: num(d.nav),

    // 품질 지표
    premium: (d.deviationSign === '-' ? -1 : 1) * (num(d.deviationRate) ?? 0),  // 괴리율 %
    trackingError: num(d.chaseErrorRate),
    dividendYield: num(d.dividend?.dividendYieldTtm),

    // 수익률 — 두 기준을 모두 들고 간다. 화면에서 토글한다.
    //   price = 시장가(거래소 종가) 기준, nav = 순자산가치 기준
    retAsOf: d.returnPerformanceReferenceDate || null,
    ret: { price: periodMap(d.returnPerformanceList), nav: periodMap(d.navPerformanceList) },

    // 구성 비중
    sectors: weightMap(d.sectorPortfolioList),
    countries: weightMap(d.countryPortfolioList),
    assets: weightMap(d.assetPortfolioList),

    // 자금 유입 — 설정액 증감. 랭킹 화면의 "자금이 몰린 ETF" 가 이것이다.
    flow: d.cumulativeNetInflowList ? {
      d1: parseKoreanAmount(d.cumulativeNetInflowList.cumulativeNetInflow1d),
      w1: parseKoreanAmount(d.cumulativeNetInflowList.cumulativeNetInflow1w),
      m1: parseKoreanAmount(d.cumulativeNetInflowList.cumulativeNetInflow1m),
      m3: parseKoreanAmount(d.cumulativeNetInflowList.cumulativeNetInflow3m),
      m6: parseKoreanAmount(d.cumulativeNetInflowList.cumulativeNetInflow6m),
      ytd: parseKoreanAmount(d.cumulativeNetInflowList.cumulativeNetInflowYtd),
      y1: parseKoreanAmount(d.cumulativeNetInflowList.cumulativeNetInflow1y),
    } : null,

    // 상위 10 편입종목 — 이 도구의 본체
    holdings: (d.etfTop10MajorConstituentAssets || [])
      .map((h) => ({
        code: h.itemCode || null,
        name: h.itemName || null,
        weight: parsePercent(h.etfWeight),
        shares: num(h.stockCount),
      }))
      .filter((h) => h.name),
  };
}

// 국내 ETF 는 모두 유가증권시장 상장이라 .KS 를 붙인다.
const yahooSymbol = (code) => `${code}.KS`;

async function main() {
  const list = await fetchList();
  console.log(`[kr] 목록 ${list.length}종목`);

  const details = await mapLimit(list, 6, async (item) => {
    const d = await getJson(DETAIL(item.itemcode), {
      headers: { Referer: `https://m.stock.naver.com/domestic/stock/${item.itemcode}/total` },
    });
    return shapeDetail(d);
  }, (done, total) => console.log(`[kr] 상세 ${done}/${total}`));

  // ── 기간수익률 (야후 일봉). price 와 tr 을 한 원천에서 짝으로 만든다.
  const retRows = await mapLimit(list, 5, async (item) => {
    const r = await fetchYahooReturns(yahooSymbol(item.itemcode), {
      headers: { Referer: 'https://finance.yahoo.com/' },
    });
    await sleep(80);
    return r;
  }, (done, total) => console.log(`[kr] 수익률 ${done}/${total}`));

  let withTr = 0;
  const trMethod = {};
  const retMissing = [];
  const anomalyRows = [];

  const etfs = [];
  let withHoldings = 0;
  const failures = [];

  list.forEach((item, i) => {
    const res = details[i];
    const d = res?.ok ? res.value : null;
    if (!res?.ok) failures.push({ code: item.itemcode, name: item.itemname, error: res?.error });

    // 이름은 상세(UTF-8)를 정본으로 쓰고, 상세가 실패했을 때만 목록 값을 쓴다.
    const name = d?.name || item.itemname;

    // 야후에서 온 시장가·총수익률 짝. 네이버 기준가는 nav 로 따로 붙인다.
    const yRes = retRows[i];
    const y = yRes?.ok ? yRes.value : null;
    if (y?.tr) {
      withTr += 1;
      trMethod[y.method] = (trMethod[y.method] || 0) + 1;
    } else retMissing.push(item.itemcode);
    if (y?.anomalies) anomalyRows.push({ code: item.itemcode, name: item.itemname, anomalies: y.anomalies });
    const navSeries = d?.ret?.nav || null;
    // 네이버가 자기 화면에 싣는 시장가수익률. 예전에는 받아 놓고 버렸는데,
    // 그 바람에 화면의 price(야후) 와 nav(네이버) 가 **서로 다른 원천**이
    // 되어 나란히 놓였다. 사용자의 브리핑 화면(네이버)이 1개월 +23.79% 일 때
    // 이 도구(야후)는 +18.13% 였다. 이제 네이버 값도 들고 가서
    // 감사와 화면이 둘을 견줄 수 있게 한다.
    const naverPrice = d?.ret?.price || null;
    const ret = (y || navSeries || naverPrice) ? Object.assign({},
      y?.price ? { price: y.price } : {},
      y?.tr ? { tr: y.tr } : {},
      // 어느 날과 견준 값인지. 하루 차이로 1개월 수익률이 -4.98% 와 +5.14%
      // 를 오간 일이 있어(2026-07-28 코스피 -10.84%) 화면이 이걸 밝힌다.
      y?.baseDays ? { baseDays: y.baseDays } : {},
      navSeries ? { nav: navSeries } : {},
      naverPrice ? { naverPrice } : {}) : null;
    // 운용사 표기에서 "(ETF)" 꼬리를 뗀다. 필터 항목으로 쓰기에 지저분하다.
    const managerRaw = d?.manager ? d.manager.replace(/\s*\(ETF\)\s*$/, '') : null;

    etfs.push({
      id: `KR:${item.itemcode}`,
      code: item.itemcode,
      market: 'KR',
      name,
      // 목록 API 가 주는 시세
      price: num(item.nowVal),
      change: num(item.changeVal),
      changeRate: num(item.changeRate),
      volume: num(item.quant),
      turnover: num(item.amonut),         // 거래대금 (네이버 철자 그대로 amonut)
      marketCap: num(item.marketSum) != null ? num(item.marketSum) * 1e8 : d?.marketCap ?? null,
      navList: num(item.nav),
      naverTab: TAB_LABELS[item.etfTabCode] || null,

      // 상세에서 온 것
      manager: managerRaw,
      indexName: d?.indexName || null,
      ter: d?.ter ?? null,
      aum: d?.aum ?? null,
      nav: d?.nav ?? null,
      listedDate: d?.listedDate ?? null,
      premium: d?.premium ?? null,
      trackingError: d?.trackingError ?? null,
      dividendYield: d?.dividendYield ?? null,
      // price·tr = 야후 일봉(종가 / 배당 재투자), nav = 네이버 기준가
      // 야후를 못 받으면 네이버 날짜로 물러서는데, 네이버는 "2026.08.27" 이고
      // 야후는 "2026-08-28" 이다. 그대로 두면 화면의 같은 칸에 두 형식이
      // 섞인다(실제로 5종목이 그랬다). 물러설 때도 형식은 맞춘다.
      retAsOf: y?.asOf ?? (d?.retAsOf ? String(d.retAsOf).replace(/\./g, '-') : null),
      // 기준가(NAV) 칸은 네이버 값이라 야후 기준일과 하루 어긋날 수 있다.
      // 두 계열의 기준일이 다른 채로 한 표에 놓이면 읽는 사람이 속는다 —
      // 442580 은 총수익률이 8/28, 기준가가 8/27 이었다. 날짜를 같이 싣는다.
      // 네이버는 "2026.08.27" 로 준다. 야후는 "2026-08-28" 이다. 형식이 다르면
      // 같은 날에도 "다르다" 가 되어 화면이 없는 경고를 띄운다.
      navAsOf: d?.retAsOf ? String(d.retAsOf).replace(/\./g, '-') : null,
      // 계산기가 버린 레코드(주가 대비 30% 넘는 분배금, 내포분배율이 한도를
      // 넘은 구간). 빈칸이 왜 빈칸인지 화면과 감사가 말할 수 있어야 한다.
      retAnomalies: y?.anomalies ?? null,
      ret: ret,
      flow: d?.flow ?? null,
      sectors: d?.sectors ?? null,
      countries: d?.countries ?? null,
      assets: d?.assets ?? null,
      // 분류(지역·자산군·테마·플래그)는 여기서 붙이지 않는다.
      // scripts/build_etf_data.mjs 가 사전을 읽어 붙인다 — 사전을 고쳤을 때
      // 1,160종목을 다시 받지 않고 빌드만 다시 돌리면 되게 하려는 것이다.

      holdings: d?.holdings ?? null,
    });
    if (d?.holdings?.length) withHoldings += 1;
  });

  console.log(`[kr] 편입종목 확보 ${withHoldings}/${list.length}`);
  if (anomalyRows.length) {
    console.log(`[kr] 버린 레코드가 있는 종목 ${anomalyRows.length}: ` +
                anomalyRows.slice(0, 8).map((a) => `${a.code} ${a.name}(${a.anomalies.length})`).join(' | '));
  }
  console.log(`[kr] 총수익률 확보 ${withTr}/${list.length} · 산출 방식 ` +
              JSON.stringify(trMethod) +
              (retMissing.length ? ` · 없는 종목 ${retMissing.length}` : ''));
  if (failures.length) {
    console.log(`[kr] 실패 ${failures.length}종목 (앞 5개): ` +
                failures.slice(0, 5).map((f) => `${f.code} ${f.error}`).join(' | '));
  }

  // 편입종목이 이 도구의 존재 이유다. 목록만 받아 오고 상세가 다 실패한
  // 결과로 어제 파일을 덮으면 화면이 껍데기가 된다.
  assertEnough('kr.holdings', withHoldings, list.length, 0.7);

  await writeDataFile(OUT, 'ETF_KR', {
    updatedAt: new Date().toISOString(),
    source: 'naver',
    count: etfs.length,
    withHoldings,
    withTr,
    trMethod,
    retMissing: retMissing.slice(0, 80),
    anomalies: anomalyRows,
    failures: failures.slice(0, 50),
    etfs,
  }, `국내 ETF — 네이버 수집 ${new Date().toISOString()}`);
}

await main();
