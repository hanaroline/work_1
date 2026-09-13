# 랭킹 네 칸 되짚기

- 시각: 2026-09-13T15:36:23.223Z
- 대상: 1353종목 (화면이 쓰는 data/etf.js 그대로)
- 자료 기준: 2026-09-09T00:46:52.008Z

## 가. 설정액 — `totalAssets` 는 ETF 인가 펀드 전체인가

상장주식수는 ETF 에 붙지 않아 그 길이 막혔다. 대신 **같은 펀드의 다른 클래스**를 쓴다.
뱅가드 ETF 는 인덱스펀드의 한 클래스이고, 같은 펀드의 뮤추얼펀드 클래스에는 따로
티커가 있다(VTI ↔ VTSAX). 두 티커의 `totalAssets` 가 **같은 값**으로 나오면 그것은
클래스별 순자산이 아니라 **펀드 전체**를 세는 값이라는 뜻이다. 그러면 국내 ETF 의
순자산총액과 한 줄로 세울 수 없다. 클래스가 하나뿐인 SPY·IVV·QQQ 는 대조군이다.

| 펀드 | ETF 클래스 | totalAssets | 뮤추얼펀드 클래스 | totalAssets | 같은가 |
| --- | --- | ---: | --- | ---: | --- |
| Vanguard Total Stock Market Index | VTI (ETF) | $2343.7B | VTSAX (MUTUALFUND) | $2343.7B | **같다 — 펀드 전체 값이다** |
| Vanguard 500 Index | VOO (ETF) | $1756.9B | VFIAX (MUTUALFUND) | $1756.9B | **같다 — 펀드 전체 값이다** |
| Vanguard Total International Stock Index | VXUS (ETF) | $665.7B | VTIAX (MUTUALFUND) | $665.7B | **같다 — 펀드 전체 값이다** |
| Vanguard Total Bond Market Index | BND (ETF) | $398.8B | VBTLX (MUTUALFUND) | $398.8B | **같다 — 펀드 전체 값이다** |
| Vanguard Growth Index | VUG (ETF) | $384.5B | VIGAX (MUTUALFUND) | $384.5B | **같다 — 펀드 전체 값이다** |
| Vanguard Value Index | VTV (ETF) | $262.3B | VVIAX (MUTUALFUND) | $262.3B | **같다 — 펀드 전체 값이다** |
| Vanguard Developed Markets Index | VEA (ETF) | $323.8B | VTMGX (MUTUALFUND) | $323.8B | **같다 — 펀드 전체 값이다** |
| Vanguard Emerging Markets Stock Index | VWO (ETF) | $168.4B | VEMAX (MUTUALFUND) | $168.4B | **같다 — 펀드 전체 값이다** |
| SPDR S&P 500 (클래스 하나 — 대조군) | SPY (ETF) | $811.9B | 없음 | — | 대조군 |
| iShares Core S&P 500 (클래스 하나 — 대조군) | IVV (ETF) | $884.0B | 없음 | — | 대조군 |
| Invesco QQQ (클래스 하나 — 대조군) | QQQ (ETF) | $489.0B | 없음 | — | 대조군 |

**클래스가 둘인 8개 펀드 중 8개에서 두 티커의 totalAssets 가 같다.**

> 야후 `totalAssets` 는 **펀드 전체**를 센다. 뱅가드 ETF 의 설정액은 ETF 로 들어온
> 돈이 아니라 같은 펀드의 뮤추얼펀드 클래스까지 합친 값이다. 국내 ETF 는
> 네이버 `totalNav`(그 ETF 만의 순자산총액)를 쓰므로, 둘을 한 표에 세우면
> 뱅가드 상품만 실제보다 서너 배 크게 나온다.

## 나. 순유입 — `cumulativeNetInflow3m` 이 정말 설정·환매 순액인가

| 종목 | 저장 설정액 | 저장 3M순유입 | 네이버 원값(3M) | 네이버 totalNav | 상장일 |
| --- | ---: | ---: | --- | --- | --- |
| 0193T0 KODEX SK하이닉스단일종목레버리지 | 2.60조 | 4.18조 | "3조 3,684억" | "2조 6,397억" | 20260527 |
| 0210A0 ACE K반도체TOP2+ | 3,127억 | 4,496억 | "5,033억" | "3,723억" | 20260623 |
| 0208N0 IBK 코스피액티브 | 127억 | 171억 | "171억" | "128억" | 20260623 |
| 0216Z0 ACE K방산TOP5+ | 113억 | 149억 | "140억" | "108억" | 20260707 |
| 0198D0 1Q SK하이닉스선물단일종목레버리지 | 256억 | 329억 | "290억" | "273억" | 20260527 |
| 0195S0 TIGER SK하이닉스단일종목레버리지 | 1.56조 | 1.97조 | "1조 5,144억" | "1조 6,116억" | 20260527 |
| 0210E0 PLUS 200커버드콜액티브 | 707억 | 845억 | "838억" | "708억" | 20260623 |
| 0207G0 SOL 우주항공밸류체인 | 390억 | 457억 | "460억" | "405억" | 20260616 |
| 360750 TIGER 미국S&P500 | 20.32조 | 3.21조 | "3조 765억" | "20조 324억" | 20200807 |
| 133690 TIGER 미국나스닥100 | 11.51조 | 1.86조 | "1조 7,606억" | "11조 3,691억" | 20101018 |
| 0167A0 SOL AI반도체TOP2플러스 | 5.65조 | 1.85조 | "1조 3,954억" | "5조 6,856억" | 20260317 |
| 379810 KODEX 미국나스닥100 | 9.05조 | 1.71조 | "1조 6,526억" | "9조 169억" | 20210409 |
| 233740 KODEX 코스닥150레버리지 | 3.32조 | 1.64조 | "1조 1,052억" | "3조 5,453억" | 20151217 |
| 0193W0 KODEX 삼성전자단일종목레버리지 | 1.59조 | 1.38조 | "1조 1,149억" | "1조 5,283억" | 20260527 |

네이버 상세 응답의 최상위 칸 이름 (순유입·상장일이 어디 있는지 확인용):

```
itemCode, itemName, etfSummary, listedDate, issuerName, etfBaseIndex, marketValue, totalNav, nav, etfChaseEarningRateSymbol, etfChaseEarningRate, deviationSign, deviationRate, totalFee, chaseErrorRate, taxationTypeCode, themeReturns, returnPerformanceReferenceDate, returnPerformanceList, navPerformanceReferenceDate, navPerformanceList, cumulativeNetInflowList, assetPortfolioTotalWeight, assetPortfolioList, countryPortfolioTotalWeight, countryPortfolioList, sectorPortfolioTotalWeight, sectorPortfolioList, etfTop10MajorConstituentAssets, dividend, marketValueRaw
```

`cumulativeNetInflowList` 안의 칸 전부:

```json
{
  "referenceDate": "2026.09.10",
  "cumulativeNetInflow1d": "-1,089억",
  "cumulativeNetInflow1w": "-1,435억",
  "cumulativeNetInflow1m": "-4,251억",
  "cumulativeNetInflow3m": "3조 3,684억",
  "cumulativeNetInflow6m": "6조 3,708억",
  "cumulativeNetInflowYtd": "6조 3,708억",
  "cumulativeNetInflow1y": "6조 3,708억"
}
```

## 다. 총보수 — 원값과 단위

| 종목 | 저장 TER | 거래정지 | 네이버 원값 |
| --- | ---: | --- | --- |
| 265690 ACE 러시아MSCI(합성) | 0.0004 | 예 | totalFee=0.0004 · {"listedDate":"20170321","totalNav":"0.9억","nav":48.41,"totalFee":0.0004,"returnPerformanceReferenceDate":"2026.09.10","navPerformanceReferenceDate":"2026.09.10"} |
| 360200 ACE 미국S&P500 | 0.0047 | 아니오 | totalFee=0.0047 · {"listedDate":"20200807","totalNav":"3조 8,540억","nav":25641.98,"totalFee":0.0047,"returnPerformanceReferenceDate":"2026.09.10","navPerformanceReferenceDate":"2026.09.10"} |
| 379780 RISE 미국S&P500 | 0.0047 | 아니오 | totalFee=0.0047 · {"listedDate":"20210409","totalNav":"1조 4,481억","nav":22176.08,"totalFee":0.0047,"returnPerformanceReferenceDate":"2026.09.10","navPerformanceReferenceDate":"2026.09.10"} |
| 069500 KODEX 200 | 0.15 | 아니오 | totalFee=0.15 · {"listedDate":"20021014","totalNav":"25조 8,166억","nav":111808.68,"totalFee":0.15,"returnPerformanceReferenceDate":"2026.09.10","navPerformanceReferenceDate":"2026.09.10"} |
| 102110 TIGER 200 | 0.05 | 아니오 | totalFee=0.05 · {"listedDate":"20080403","totalNav":"10조 3,507억","nav":112080.86,"totalFee":0.05,"returnPerformanceReferenceDate":"2026.09.10","navPerformanceReferenceDate":"2026.09.10"} |
| 133690 TIGER 미국나스닥100 | 0.0068 | 아니오 | totalFee=0.0068 · {"listedDate":"20101018","totalNav":"11조 3,691억","nav":174452.6,"totalFee":0.0068,"returnPerformanceReferenceDate":"2026.09.10","navPerformanceReferenceDate":"2026.09.10"} |
| 360750 TIGER 미국S&P500 | 0.0068 | 아니오 | totalFee=0.0068 · {"listedDate":"20200807","totalNav":"20조 324억","nav":25363.91,"totalFee":0.0068,"returnPerformanceReferenceDate":"2026.09.10","navPerformanceReferenceDate":"2026.09.10"} |

069500 (KODEX 200) 응답의 최상위 칸 전부 — 총보수·순유입이 실제로 어느 칸에 있는지:

```json
{
  "itemCode": "069500",
  "itemName": "KODEX 200",
  "etfSummary": "1좌당 순자산가치의 변동률을 기초지수인 KOSPI200의 변동률과 유사하도록 투자신탁재산을 운용하는 것을 목표로 합니다.한국거래소가 산출하는 KOSPI200 지수는 한국을 대표하는 200개 종목의 시가총액을 지수화한 것입니다. 200개 종목은 시장 대표성, 유동성, 업종 대표성을 고려하여 선정하는데, 전체 종목을 9개업 군으로 분류하여 시가총액과 거래량 비중이 높은 종목들을 우선 선정합니다.",
  "listedDate": "20021014",
  "issuerName": "삼성자산운용(ETF)",
  "etfBaseIndex": "코스피 200",
  "marketValue": "25조 2,836억",
  "totalNav": "25조 8,166억",
  "nav": 111808.68,
  "etfChaseEarningRateSymbol": "+",
  "etfChaseEarningRate": 1,
  "deviationSign": "+",
  "deviationRate": 0.05,
  "totalFee": 0.15,
  "chaseErrorRate": 0.38,
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
  "returnPerformanceReferenceDate": "2026.09.10",
  "returnPerformanceList": "[배열 10]",
  "navPerformanceReferenceDate": "2026.09.10",
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
  "assetPortfolioTotalWeight": 99.03,
  "assetPortfolioList": "[배열 5]",
  "countryPortfolioTotalWeight": 99.03,
  "countryPortfolioList": "[배열 6]",
  "sectorPortfolioTotalWeight": 99.03,
  "sectorPortfolioList": "[배열 12]",
  "etfTop10MajorConstituentAssets": "[배열 10]",
  "dividend": [
    "dividendYieldTtm",
    "dividendPerShareTtm",
    "dividendCountThisYear",
    "dividendMonthThisYear"
  ],
  "marketValueRaw": "25283550000000"
}
```


## 라. 1년 수익률 상위·하위 — 원가격에서 재계산

| 종목 | 화면 1년 | 야후 원가격 재계산 | 차이 |
| --- | ---: | ---: | ---: |
| 442580 PLUS 글로벌HBM반도체 | 379.15% | 341.43% | +37.72%p |
| 395270 HANARO Fn K-반도체 | 368.88% | 333.24% | +35.64%p |
| 363580 KODEX 200IT TR | 330.92% | 301.04% | +29.88%p |
| 367760 RISE 네트워크인프라 | 324.78% | 304.29% | +20.49%p |
| 139260 TIGER 200 IT | 319.70% | 294.22% | +25.48%p |
| 0005G0 IBK K-AI반도체코어테크 | 300.52% | 277.97% | +22.55%p |
| 469150 ACE AI반도체TOP3+ | 288.58% | 255.62% | +32.96%p |
| 494220 UNICORN SK하이닉스밸류체인액티브 | 280.27% | 257.02% | +23.25%p |
| 474590 WON 반도체밸류체인액티브 | 275.45% | 253.75% | +21.70%p |
| 395160 KODEX AI반도체TOP2플러스 | 275.34% | 248.11% | +27.23%p |
| 266370 KODEX IT | 262.60% | 243.71% | +18.89%p |
| 091230 TIGER 반도체 | 249.84% | 223.96% | +25.88%p |
| 091160 KODEX 반도체 | 244.83% | 216.11% | +28.72%p |
| 487750 BNK 온디바이스AI | 242.35% | 227.82% | +14.53%p |
| 469790 KIWOOM 코리아테크TOP10 | 242.29% | 220.43% | +21.86%p |
| 513050 E Fund CSI China Ovsea Net | -31.75% | -37.15% | +5.40%p |
| 307510 TIGER 의료기기 | -32.40% | -34.21% | +1.81%p |
| 0000Z0 RISE 바이오TOP10액티브 | -32.82% | -34.96% | +2.14%p |
| 427120 RISE AI플랫폼 | -34.21% | -36.36% | +2.15%p |
| 385560 RISE KIS국고채30년Enhanced | -35.86% | -36.15% | +0.29%p |
| 256440 ACE MSCI인도네시아(합성) | -38.93% | -38.84% | -0.09%p |
| 464610 SOL 의료기기소부장Fn | -41.12% | -42.18% | +1.06%p |
| 451530 TIGER 국고채30년스트립액티브 | -41.53% | -43.14% | +1.61%p |
| ETHA iShares Ethereum Trust ETF | -42.66% | -42.79% | +0.13%p |
| 395150 KODEX 웹툰&드라마 | -43.25% | -43.95% | +0.70%p |
| 0090B0 PLUS K방산소부장 | -44.08% | -43.34% | -0.74%p |
| 475050 ACE KPOP포커스 | -44.90% | -44.37% | -0.53%p |
| 395290 HANARO Fn K-POP&미디어 | -47.14% | -47.15% | +0.01%p |
| 476000 UNICORN 포스트IPO액티브 | -47.34% | -47.77% | +0.43%p |
| 228810 TIGER 미디어컨텐츠 | -54.92% | -55.03% | +0.11%p |

**2%p 넘게 벌어진 종목: 18 / 30**

> 국내 ETF 는 네이버가 준 값을 그대로 쓰고, 여기 재계산은 야후 원가격에서 낸다.
> 두 원천이 분배금을 다르게 다루므로 몇 %p 차이는 있을 수 있다. 두 자릿수로
> 벌어지는 것만 문제로 본다.
