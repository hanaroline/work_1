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
 * **총수익률(분배금 재투자)은 네이버가 주지 않는다.** 네이버의 NAV 수익률에도
 * 분배금이 반영되지 않는다(검산: scripts/check_etf_return_basis.mjs — 분배율
 * 4.6% 표본에서 시장가와의 차이 중앙값이 0.02%p 로, 차이는 괴리율뿐이다).
 * 분배율이 20% 넘는 커버드콜이 국내에만 수십 종목이라 이 값이 없으면 그 상품들의
 * 성과가 통째로 사라진다. 그래서 야후 일봉(수정종가)으로 총수익률을 따로 받는다.
 * 해외 수집기와 **같은 계산기**(etf_lib 의 computeReturns)를 쓰므로 두 시장의
 * 총수익률이 한 뜻이 된다.
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

/**
 * 국내 ETF 의 야후 심볼.
 *
 * 국내 ETF 는 모두 유가증권시장 상장이므로 .KS 를 붙인다. 다만 최근 부여되는
 * 영문 섞인 코드(0167A0 꼴)는 야후에 없을 수 있다 — 없으면 그 종목만
 * 총수익률이 빠지고 나머지는 그대로 간다.
 */
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

  // ── 총수익률 (야후 수정종가). chart 는 crumb 없이 열려 있다.
  const trRows = await mapLimit(list, 5, async (item) => {
    const r = await fetchYahooReturns(yahooSymbol(item.itemcode), {
      headers: { Referer: 'https://finance.yahoo.com/' },
    });
    await sleep(80);
    return r;
  }, (done, total) => console.log(`[kr] 총수익률 ${done}/${total}`));

  let withTr = 0;
  const trMissing = [];

  const etfs = [];
  let withHoldings = 0;
  const failures = [];

  list.forEach((item, i) => {
    const res = details[i];
    const d = res?.ok ? res.value : null;
    if (!res?.ok) failures.push({ code: item.itemcode, name: item.itemname, error: res?.error });

    // 이름은 상세(UTF-8)를 정본으로 쓰고, 상세가 실패했을 때만 목록 값을 쓴다.
    const name = d?.name || item.itemname;

    // 네이버의 두 계열(시장가·기준가)에 야후 총수익률을 얹는다.
    const trRes = trRows[i];
    const tr = trRes?.ok ? trRes.value : null;
    if (tr?.tr) withTr += 1;
    else trMissing.push(item.itemcode);
    const ret = (d?.ret || tr)
      ? Object.assign({}, d?.ret || {}, tr?.tr ? { tr: tr.tr } : {})
      : null;
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
      retAsOf: d?.retAsOf ?? null,
      // price = 네이버 시장가, nav = 네이버 기준가(분배금 미반영),
      // tr = 야후 수정종가 총수익률(분배금 재투자, 해외와 같은 계산기)
      ret: ret,
      trAsOf: tr?.asOf ?? null,
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
  console.log(`[kr] 총수익률 확보 ${withTr}/${list.length}` +
              (trMissing.length ? ` (없는 종목 앞 5: ${trMissing.slice(0, 5).join(',')})` : ''));
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
    trMissing: trMissing.slice(0, 80),
    failures: failures.slice(0, 50),
    etfs,
  }, `국내 ETF — 네이버 수집 ${new Date().toISOString()}`);
}

await main();
