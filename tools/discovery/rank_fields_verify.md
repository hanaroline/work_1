# 랭킹 네 칸 되짚기

- 시각: 2026-08-30T05:15:35.617Z
- 대상: 1348종목 (화면이 쓰는 data/etf.js 그대로)

## 가. 설정액 — `totalAssets` 는 ETF 인가 펀드 전체인가

상장주식수 × 가격 으로 ETF 클래스의 순자산을 따로 구해 `totalAssets` 와 나눈다.
클래스가 하나뿐인 상품(SPY·IVV·QQQ)은 1배 근처여야 한다. 크게 넘으면
`totalAssets` 가 **펀드 전체**를 세고 있다는 뜻이고, 그러면 국내 ETF 의
순자산총액과 한 줄로 세울 수 없다.

| 종목 | totalAssets | 상장주식수×가격 | 배수 | 판정 |
| --- | ---: | ---: | ---: | --- |
| 1306 NEXT FUNDS TOPIX Exchange Traded F | $33637B | — | — | 확인 못 함 |
| 1321 NEXT FUNDS Nikkei 225 Exchange Tra | $17148B | — | — | 확인 못 함 |
| 1305 iFreeETF TOPIX (Yearly Dividend Ty | $15175B | — | — | 확인 못 함 |
| 1330 Amova Exchange Traded Index Fund 2 | $8325B | — | — | 확인 못 함 |
| 1320 iFreeETF Nikkei225 (Yearly Dividen | $7715B | — | — | 확인 못 함 |
| 1348 MAXIS TOPIX ETF | $4817B | — | — | 확인 못 함 |
| VTI Vanguard Morningstar Total Stock M | $2290B | — | — | 확인 못 함 |
| 1329 iShares Core Nikkei 225 ETF | $2074B | — | — | 확인 못 함 |
| VOO Vanguard S&P 500 ETF | $1687B | — | — | 확인 못 함 |
| 1540 Japan Physical Gold ETF | $1476B | — | — | 확인 못 함 |
| IVV iShares Core S&P 500 ETF | $869B | — | — | 확인 못 함 |
| SPY State Street SPDR S&P 500 ETF Trus | $795B | — | — | 확인 못 함 |
| 1570 NEXT FUNDS Nikkei 225 Leveraged In | $726B | — | — | 확인 못 함 |
| VXUS Vanguard Total International Stock | $646B | — | — | 확인 못 함 |
| 1343 NEXT FUNDS REIT INDEX ETF | $551B | — | — | 확인 못 함 |
| 1489 NEXT FUNDS Nikkei 225 High Dividen | $537B | — | — | 확인 못 함 |
| QQQ Invesco QQQ Trust | $453B | — | — | 확인 못 함 |
| BND Vanguard Total Bond Market Index F | $397B | — | — | 확인 못 함 |
| 1476 iShares Core Japan REIT ETF | $386B | — | — | 확인 못 함 |
| VUG Vanguard Morningstar Growth ETF | $372B | — | — | 확인 못 함 |

**배수가 1.3 을 넘는 종목: 0 / 0**

## 나. 순유입 — `cumulativeNetInflow3m` 이 정말 설정·환매 순액인가

| 종목 | 저장 설정액 | 저장 3M순유입 | 네이버 원값(3M) | 네이버 totalNav | 상장일 |
| --- | ---: | ---: | --- | --- | --- |
| 0194T0 ACE SK하이닉스단일종목레버리지 | 556억 | 1,229억 | "1,229억" | "556억" | 20260527 |
| 0192L0 RISE SK하이닉스단일종목레버리지 | 422억 | 875억 | "875억" | "422억" | 20260527 |
| 0195S0 TIGER SK하이닉스단일종목레버리지 | 1.50조 | 3.05조 | "3조 466억" | "1조 4,967억" | 20260527 |
| 0193T0 KODEX SK하이닉스단일종목레버리지 | 2.46조 | 4.91조 | "4조 9,063억" | "2조 4,606억" | 20260527 |
| 0198D0 1Q SK하이닉스선물단일종목레버리지 | 268억 | 498억 | "498억" | "268억" | 20260527 |
| 0194M0 ACE 삼성전자단일종목레버리지 | 463억 | 809억 | "809억" | "463억" | 20260527 |
| 0192M0 RISE 삼성전자단일종목레버리지 | 313억 | 498억 | "498억" | "313억" | 20260527 |
| 0194R0 KIWOOM SK하이닉스선물단일종목레버리지 | 135억 | 206억 | "206억" | "135억" | 20260527 |
| 0167A0 SOL AI반도체TOP2플러스 | 5.70조 | 4.02조 | "4조 204억" | "5조 6,952억" | 20260317 |
| 360750 TIGER 미국S&P500 | 20.41조 | 3.26조 | "3조 2,647억" | "20조 4,065억" | 20200807 |
| 0193W0 KODEX 삼성전자단일종목레버리지 | 1.61조 | 2.40조 | "2조 3,981억" | "1조 6,107억" | 20260527 |
| 233740 KODEX 코스닥150레버리지 | 3.66조 | 2.07조 | "2조 651억" | "3조 6,613억" | 20151217 |
| 379810 KODEX 미국나스닥100 | 9.20조 | 1.99조 | "1조 9,887억" | "9조 1,984억" | 20210409 |
| 133690 TIGER 미국나스닥100 | 11.48조 | 1.95조 | "1조 9,516억" | "11조 4,849억" | 20101018 |

네이버 상세 응답의 최상위 칸 이름 (순유입·상장일이 어디 있는지 확인용):

```
itemCode, itemName, etfSummary, listedDate, issuerName, etfBaseIndex, marketValue, totalNav, nav, etfChaseEarningRateSymbol, etfChaseEarningRate, deviationSign, deviationRate, totalFee, chaseErrorRate, taxationTypeCode, themeReturns, returnPerformanceReferenceDate, returnPerformanceList, navPerformanceReferenceDate, navPerformanceList, cumulativeNetInflowList, assetPortfolioTotalWeight, assetPortfolioList, countryPortfolioTotalWeight, countryPortfolioList, sectorPortfolioTotalWeight, sectorPortfolioList, etfTop10MajorConstituentAssets, dividend, marketValueRaw
```

`cumulativeNetInflowList` 안의 칸 전부:

```json
{
  "referenceDate": "2026.08.27",
  "cumulativeNetInflow1d": "-",
  "cumulativeNetInflow1w": "-32.8억",
  "cumulativeNetInflow1m": "-35.3억",
  "cumulativeNetInflow3m": "1,229억",
  "cumulativeNetInflow6m": "1,229억",
  "cumulativeNetInflowYtd": "1,229억",
  "cumulativeNetInflow1y": "1,229억"
}
```

## 다. 총보수 — 원값과 단위

| 종목 | 저장 TER | 거래정지 | 네이버 원값 |
| --- | ---: | --- | --- |
| 265690 ACE 러시아MSCI(합성) | 0.0004 | 예 | totalFee=0.0004 · {"listedDate":"20170321","totalNav":"0.9억","nav":48.38,"totalFee":0.0004,"returnPerformanceReferenceDate":"2026.08.27","navPerformanceReferenceDate":"2026.08.27"} |
| 360200 ACE 미국S&P500 | 0.0047 | 아니오 | totalFee=0.0047 · {"listedDate":"20200807","totalNav":"3조 9,583억","nav":26565.94,"totalFee":0.0047,"returnPerformanceReferenceDate":"2026.08.27","navPerformanceReferenceDate":"2026.08.27"} |
| 379780 RISE 미국S&P500 | 0.0047 | 아니오 | totalFee=0.0047 · {"listedDate":"20210409","totalNav":"1조 4,795억","nav":22972.85,"totalFee":0.0047,"returnPerformanceReferenceDate":"2026.08.27","navPerformanceReferenceDate":"2026.08.27"} |
| 069500 KODEX 200 | 0.15 | 아니오 | totalFee=0.15 · {"listedDate":"20021014","totalNav":"25조 5,797억","nav":109431.83,"totalFee":0.15,"returnPerformanceReferenceDate":"2026.08.27","navPerformanceReferenceDate":"2026.08.27"} |
| 102110 TIGER 200 | 0.05 | 아니오 | totalFee=0.05 · {"listedDate":"20080403","totalNav":"10조 3,994억","nav":109698.05,"totalFee":0.05,"returnPerformanceReferenceDate":"2026.08.27","navPerformanceReferenceDate":"2026.08.27"} |
| 133690 TIGER 미국나스닥100 | 0.0068 | 아니오 | totalFee=0.0068 · {"listedDate":"20101018","totalNav":"11조 4,849억","nav":178642.05,"totalFee":0.0068,"returnPerformanceReferenceDate":"2026.08.27","navPerformanceReferenceDate":"2026.08.27"} |
| 360750 TIGER 미국S&P500 | 0.0068 | 아니오 | totalFee=0.0068 · {"listedDate":"20200807","totalNav":"20조 4,065억","nav":26278.38,"totalFee":0.0068,"returnPerformanceReferenceDate":"2026.08.27","navPerformanceReferenceDate":"2026.08.27"} |

069500 (KODEX 200) 응답의 최상위 칸 전부 — 총보수·순유입이 실제로 어느 칸에 있는지:

```json
{
  "itemCode": "069500",
  "itemName": "KODEX 200",
  "etfSummary": "1좌당 순자산가치의 변동률을 기초지수인 KOSPI200의 변동률과 유사하도록 투자신탁재산을 운용하는 것을 목표로 합니다.한국거래소가 산출하는 KOSPI200 지수는 한국을 대표하는 200개 종목의 시가총액을 지수화한 것입니다. 200개 종목은 시장 대표성, 유동성, 업종 대표성을 고려하여 선정하는데, 전체 종목을 9개업 군으로 분류하여 시가총액과 거래량 비중이 높은 종목들을 우선 선정합니다.",
  "listedDate": "20021014",
  "issuerName": "삼성자산운용(ETF)",
  "etfBaseIndex": "코스피 200",
  "marketValue": "25조 533억",
  "totalNav": "25조 5,797억",
  "nav": 109431.83,
  "etfChaseEarningRateSymbol": "+",
  "etfChaseEarningRate": 1,
  "deviationSign": "-",
  "deviationRate": 0.27,
  "totalFee": 0.15,
  "chaseErrorRate": 0.39,
  "taxationTypeCode": "1",
  "themeReturns": [
    "themeId",
    "themeLargeCode",
    "themeLargeCodeDesc",
    "themeMiddleCode",
    "themeMiddleCodeDesc",
    "todayChangeRate",
    "returnRate1d",
    "returnRate1w",
    "returnRate1m",
    "returnRate3m",
    "returnRate6m",
    "returnRateYtd",
    "returnRate1y",
    "returnRate3y",
    "returnRate5y",
    "returnRate10y"
  ],
  "returnPerformanceReferenceDate": "2026.08.27",
  "returnPerformanceList": "[배열 10]",
  "navPerformanceReferenceDate": "2026.08.27",
  "navPerformanceList": "[배열 10]",
  "cumulativeNetInflowList": [
    "referenceDate",
    "cumulativeNetInflow1d",
    "cumulativeNetInflow1w",
    "cumulativeNetInflow1m",
    "cumulativeNetInflow3m",
    "cumulativeNetInflow6m",
    "cumulativeNetInflowYtd",
    "cumulativeNetInflow1y"
  ],
  "assetPortfolioTotalWeight": 98.93,
  "assetPortfolioList": "[배열 5]",
  "countryPortfolioTotalWeight": 98.93,
  "countryPortfolioList": "[배열 6]",
  "sectorPortfolioTotalWeight": 98.93,
  "sectorPortfolioList": "[배열 12]",
  "etfTop10MajorConstituentAssets": "[배열 10]",
  "dividend": [
    "dividendYieldTtm",
    "dividendPerShareTtm",
    "dividendCountThisYear",
    "dividendMonthThisYear"
  ],
  "marketValueRaw": "25053325000000"
}
```


## 라. 1년 수익률 상위·하위 — 원가격에서 재계산

| 종목 | 화면 1년 | 야후 원가격 재계산 | 차이 |
| --- | ---: | ---: | ---: |
| 442580 PLUS 글로벌HBM반도체 | 370.52% | 370.52% | +0.00%p |
| 395270 HANARO Fn K-반도체 | 356.58% | 356.58% | +0.00%p |
| 367760 RISE 네트워크인프라 | 347.35% | 347.35% | +0.00%p |
| 363580 KODEX 200IT TR | 322.47% | 322.47% | +0.00%p |
| 139260 TIGER 200 IT | 314.39% | 314.39% | +0.00%p |
| 0005G0 IBK K-AI반도체코어테크 | 303.34% | 303.34% | +0.00%p |
| 494220 UNICORN SK하이닉스밸류체인액티브 | 284.33% | 284.33% | +0.00%p |
| 474590 WON 반도체밸류체인액티브 | 270.80% | 270.80% | +0.00%p |
| 469150 ACE AI반도체TOP3+ | 270.49% | 270.49% | +0.00%p |
| 395160 KODEX AI반도체TOP2플러스 | 260.42% | 260.42% | +0.00%p |
| 266370 KODEX IT | 259.80% | 259.80% | +0.00%p |
| 487750 BNK 온디바이스AI | 253.03% | 253.03% | +0.00%p |
| 469790 KIWOOM 코리아테크TOP10 | 240.17% | 240.17% | +0.00%p |
| 091230 TIGER 반도체 | 238.18% | 238.18% | +0.00%p |
| 091160 KODEX 반도체 | 232.09% | 232.09% | +0.00%p |
| 427120 RISE AI플랫폼 | -30.39% | -30.39% | +0.00%p |
| IBIT iShares Bitcoin Trust ETF | -30.95% | -30.95% | +0.00%p |
| FBTC Fidelity Wise Origin Bitco | -30.95% | -30.95% | +0.00%p |
| 512690 Penghua CSI Alcohol ETF | -32.86% | -31.21% | -1.65%p |
| 385560 RISE KIS국고채30년Enhanced | -33.11% | -33.11% | +0.00%p |
| 464610 SOL 의료기기소부장Fn | -33.55% | -33.55% | +0.00%p |
| 256440 ACE MSCI인도네시아(합성) | -37.79% | -37.79% | +0.00%p |
| 0090B0 PLUS K방산소부장 | -38.94% | -38.94% | +0.00%p |
| 451530 TIGER 국고채30년스트립액티브 | -40.10% | -40.10% | +0.00%p |
| 476000 UNICORN 포스트IPO액티브 | -43.93% | -43.93% | +0.00%p |
| 395150 KODEX 웹툰&드라마 | -44.74% | -44.74% | +0.00%p |
| ETHA iShares Ethereum Trust ETF | -45.28% | -45.28% | +0.00%p |
| 475050 ACE KPOP포커스 | -46.29% | -46.29% | +0.00%p |
| 395290 HANARO Fn K-POP&미디어 | -48.54% | -48.54% | +0.00%p |
| 228810 TIGER 미디어컨텐츠 | -55.33% | -55.33% | +0.00%p |

**2%p 넘게 벌어진 종목: 0 / 30**

> 국내 ETF 는 네이버가 준 값을 그대로 쓰고, 여기 재계산은 야후 원가격에서 낸다.
> 두 원천이 분배금을 다르게 다루므로 몇 %p 차이는 있을 수 있다. 두 자릿수로
> 벌어지는 것만 문제로 본다.
