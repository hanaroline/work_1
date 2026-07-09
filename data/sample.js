/*
 * 샘플 / 폴백 데이터
 * ------------------
 * 실 API(Yahoo Finance 등) 호출이 CORS·네트워크·정책 등으로 실패할 때,
 * 대시보드가 항상 "깔끔한 한 장"으로 렌더되도록 종목별 그럴듯한 데이터를 생성한다.
 *
 * 반환 스키마(내부 통일 스키마, 실 API 응답도 이 형태로 정규화됨):
 * {
 *   quote:          { price, prevClose, change, changePct, marketCap, per, pbr,
 *                     eps, high52, low52, currency },
 *   chart:          { dates:[ISO...], close:[num...], volume:[num...] },  // ~1년 일봉
 *   recommendation: { targetMean, targetHigh, targetLow, currentPrice,
 *                     numberOfAnalysts, dist:{strongBuy,buy,hold,sell,strongSell},
 *                     ratingText },
 *   reports:        [{ broker, title, opinion, target, date }],
 *   news:           [{ title, source, date, url, summary }],
 *   financials:     { years:[...], revenue:[...], operatingIncome:[...],
 *                     netIncome:[...], assets:[...], liabilities:[...],
 *                     equity:[...], roe:[...], debtRatio:[...] },
 *   currency:       'KRW'
 * }
 * 금액 단위: 원(KRW). 재무 항목은 '억원' 단위 숫자.
 */

/* 코드 문자열을 시드로 하는 결정적 의사난수 (mulberry32) */
function seededRng(code) {
  let h = 1779033703 ^ String(code).length;
  for (let i = 0; i < String(code).length; i++) {
    h = Math.imul(h ^ String(code).charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 종목별 기준값(대표 종목은 실제에 가까운 스케일, 그 외는 시드 기반) */
const PROFILES = {
  "005930": { base: 74000, cap: 4420000, per: 13.5, pbr: 1.4, rev: 2790000, opm: 0.09, sector: "반도체" },
  "000660": { base: 178000, cap: 1300000, per: 18.2, pbr: 1.9, rev: 660000, opm: 0.13, sector: "반도체" },
  "373220": { base: 380000, cap: 890000, per: 45.0, pbr: 3.1, rev: 337000, opm: 0.07, sector: "2차전지" },
  "207940": { base: 780000, cap: 555000, per: 62.0, pbr: 5.5, rev: 37000, opm: 0.28, sector: "바이오" },
  "005380": { base: 245000, cap: 520000, per: 5.4, pbr: 0.6, rev: 1620000, opm: 0.09, sector: "자동차" },
  "000270": { base: 118000, cap: 470000, per: 4.8, pbr: 0.9, rev: 1000000, opm: 0.11, sector: "자동차" },
  "035420": { base: 215000, cap: 340000, per: 28.0, pbr: 1.3, rev: 96000, opm: 0.16, sector: "인터넷" },
  "035720": { base: 45000, cap: 195000, per: 40.0, pbr: 1.6, rev: 80000, opm: 0.06, sector: "인터넷" },
  "051910": { base: 380000, cap: 270000, per: 22.0, pbr: 1.5, rev: 550000, opm: 0.05, sector: "화학" },
  "005490": { base: 420000, cap: 355000, per: 12.0, pbr: 0.7, rev: 770000, opm: 0.06, sector: "철강" },
  "247540": { base: 220000, cap: 215000, per: 55.0, pbr: 6.0, rev: 69000, opm: 0.08, sector: "2차전지" },
  "086520": { base: 520000, cap: 140000, per: 30.0, pbr: 4.0, rev: 73000, opm: 0.05, sector: "2차전지" }
};

const BROKERS = [
  "미래에셋증권", "삼성증권", "KB증권", "NH투자증권", "한국투자증권",
  "키움증권", "신한투자증권", "하나증권", "대신증권", "메리츠증권"
];
const OPINIONS = ["매수", "매수", "매수", "중립", "매수", "Buy", "Outperform"];

/* ISO(yyyy-mm-dd) 문자열, days 전 날짜 */
function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function round(n, unit) {
  return Math.round(n / unit) * unit;
}

window.generateSampleData = function generateSampleData(ticker) {
  const rng = seededRng(ticker.code);
  const p = PROFILES[ticker.code] || {
    base: round(10000 + rng() * 240000, 100),
    cap: round(5000 + rng() * 120000, 100),
    per: +(6 + rng() * 40).toFixed(1),
    pbr: +(0.5 + rng() * 4).toFixed(1),
    rev: round(3000 + rng() * 300000, 100),
    opm: +(0.03 + rng() * 0.15).toFixed(3),
    sector: ["반도체", "2차전지", "바이오", "인터넷", "자동차", "화학", "금융", "소비재"][Math.floor(rng() * 8)]
  };

  // --- 1년(약 252거래일) 일봉 생성: 완만한 추세 + 변동성 ---
  const N = 252;
  const close = [];
  const volume = [];
  const dates = [];
  let price = p.base * (0.8 + rng() * 0.15); // 1년 전 시작가
  const drift = (p.base - price) / N; // 대략 현재가로 수렴하는 추세
  const vol = p.base * (0.012 + rng() * 0.02); // 일간 변동성
  let tradeDay = 0;
  for (let i = N - 1; i >= 0; i--) {
    const dayOffset = i;
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // 주말 제외
    const shock = (rng() - 0.5) * 2 * vol;
    price = Math.max(price + drift + shock, p.base * 0.4);
    dates.push(d.toISOString().slice(0, 10));
    close.push(Math.round(price / 10) * 10);
    const baseVol = p.cap * 12; // 대략적 거래량 스케일
    volume.push(Math.round(baseVol * (0.5 + rng())));
    tradeDay++;
  }
  // 시리즈 마지막 값이 곧 현재가 (드리프트로 기준값 부근에 수렴, 급락 없이 자연스럽게 마무리)
  const last = close[close.length - 1];
  const prevClose = close[close.length - 2] || last;
  const change = last - prevClose;
  const changePct = +((change / prevClose) * 100).toFixed(2);
  const high52 = Math.max.apply(null, close);
  const low52 = Math.min.apply(null, close);
  const eps = Math.round(last / p.per);

  // --- 투자의견 / 목표주가 ---
  const upside = 0.05 + rng() * 0.35; // 5~40% 상승여력
  const targetMean = Math.round((last * (1 + upside)) / 100) * 100;
  const targetHigh = Math.round((targetMean * (1.08 + rng() * 0.12)) / 100) * 100;
  const targetLow = Math.round((targetMean * (0.78 + rng() * 0.1)) / 100) * 100;
  const nAnalysts = 8 + Math.floor(rng() * 22);
  const strongBuy = Math.floor(nAnalysts * (0.25 + rng() * 0.25));
  const buy = Math.floor(nAnalysts * (0.2 + rng() * 0.2));
  const hold = Math.max(0, nAnalysts - strongBuy - buy - Math.floor(rng() * 3));
  const sell = Math.max(0, nAnalysts - strongBuy - buy - hold);
  const dist = { strongBuy, buy, hold, sell, strongSell: 0 };
  const ratingText = strongBuy + buy >= hold + sell ? "매수(Buy)" : "중립(Hold)";

  // --- 증권사 레포트 리스트 ---
  const reportTitles = [
    "실적 개선 모멘텀 지속",
    "밸류에이션 매력 부각",
    "하반기 이익 반등 기대",
    "업황 회복 국면 진입",
    "목표주가 상향 조정",
    "신사업 성장성 주목",
    "수급 개선과 이익 안정성",
    "구조적 성장 스토리 유효"
  ];
  const reports = [];
  const brokerPool = BROKERS.slice().sort(() => rng() - 0.5);
  for (let i = 0; i < 6; i++) {
    const t = round(targetMean * (0.9 + rng() * 0.25), 100);
    reports.push({
      broker: brokerPool[i % brokerPool.length],
      title: `[${ticker.name}] ${reportTitles[Math.floor(rng() * reportTitles.length)]}`,
      opinion: OPINIONS[Math.floor(rng() * OPINIONS.length)],
      target: t,
      date: isoDaysAgo(2 + Math.floor(rng() * 40))
    });
  }
  reports.sort((a, b) => (a.date < b.date ? 1 : -1));

  // --- 시황 / 뉴스 ---
  const newsTemplates = [
    { t: `${ticker.name}, ${p.sector} 업황 회복 기대감에 강세`, s: "한국경제" },
    { t: `${ticker.name} 2분기 실적 시장 기대치 부합`, s: "매일경제" },
    { t: `외국인·기관 ${ticker.name} 동반 순매수`, s: "연합인포맥스" },
    { t: `증권가 "${ticker.name} 목표주가 상향" 잇따라`, s: "이데일리" },
    { t: `${ticker.name}, 신규 투자·수주 소식에 투자심리 개선`, s: "서울경제" },
    { t: `${p.sector} 대장주 ${ticker.name} 수급 점검`, s: "머니투데이" }
  ];
  const news = newsTemplates.map((n, i) => ({
    title: n.t,
    source: n.s,
    date: isoDaysAgo(Math.floor(rng() * 7)),
    url: `https://news.google.com/search?q=${encodeURIComponent(ticker.name)}&hl=ko`,
    summary: `${ticker.name} 관련 최신 동향 요약입니다. (샘플 데이터)`
  }));

  // --- 재무제표(최근 4개 연도, 억원) ---
  const years = [];
  const revenue = [];
  const operatingIncome = [];
  const netIncome = [];
  const assets = [];
  const liabilities = [];
  const equity = [];
  const roe = [];
  const debtRatio = [];
  const thisYear = new Date().getFullYear();
  for (let i = 3; i >= 0; i--) {
    const y = thisYear - 1 - i;
    years.push(String(y));
    const g = 1 + (rng() - 0.4) * 0.25; // 연도별 성장률 변동
    const rev = round(p.rev * (0.8 + (3 - i) * 0.08) * g, 1);
    const op = round(rev * p.opm * (0.7 + rng() * 0.6), 1);
    const net = round(op * (0.7 + rng() * 0.25), 1);
    const eq = round(rev * (0.9 + rng() * 0.6), 1);
    const liab = round(eq * (0.4 + rng() * 0.8), 1);
    revenue.push(rev);
    operatingIncome.push(op);
    netIncome.push(net);
    equity.push(eq);
    liabilities.push(liab);
    assets.push(eq + liab);
    roe.push(+((net / eq) * 100).toFixed(1));
    debtRatio.push(+((liab / eq) * 100).toFixed(1));
  }

  return {
    quote: {
      price: last,
      prevClose,
      change,
      changePct,
      marketCap: Math.round(p.cap * 1e8), // 억원 -> 원
      per: p.per,
      pbr: p.pbr,
      eps,
      high52,
      low52,
      currency: "KRW"
    },
    chart: { dates, close, volume },
    recommendation: {
      targetMean,
      targetHigh,
      targetLow,
      currentPrice: last,
      numberOfAnalysts: nAnalysts,
      dist,
      ratingText
    },
    reports,
    news,
    financials: {
      years,
      revenue,
      operatingIncome,
      netIncome,
      assets,
      liabilities,
      equity,
      roe,
      debtRatio
    },
    currency: "KRW",
    sector: p.sector
  };
};
