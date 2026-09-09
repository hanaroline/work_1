# 랭킹 네 칸 되짚기

- 시각: 2026-09-09T00:36:02.840Z
- 대상: 1353종목 (화면이 쓰는 data/etf.js 그대로)
- 자료 기준: 2026-09-09T00:24:26.210Z

## 가. 설정액 — `totalAssets` 는 ETF 인가 펀드 전체인가

상장주식수는 ETF 에 붙지 않아 그 길이 막혔다. 대신 **같은 펀드의 다른 클래스**를 쓴다.
뱅가드 ETF 는 인덱스펀드의 한 클래스이고, 같은 펀드의 뮤추얼펀드 클래스에는 따로
티커가 있다(VTI ↔ VTSAX). 두 티커의 `totalAssets` 가 **같은 값**으로 나오면 그것은
클래스별 순자산이 아니라 **펀드 전체**를 세는 값이라는 뜻이다. 그러면 국내 ETF 의
순자산총액과 한 줄로 세울 수 없다. 클래스가 하나뿐인 SPY·IVV·QQQ 는 대조군이다.

| 펀드 | ETF 클래스 | totalAssets | 뮤추얼펀드 클래스 | totalAssets | 같은가 |
| --- | --- | ---: | --- | ---: | --- |
| Vanguard Total Stock Market Index | VTI (ETF) | $2343.7B | VTSAX (MUTUALFUND) | $2315.0B | 다르다 |
| Vanguard 500 Index | VOO (ETF) | $1756.9B | VFIAX (MUTUALFUND) | $1741.1B | 다르다 |
| Vanguard Total International Stock Index | VXUS (ETF) | $665.7B | VTIAX (MUTUALFUND) | $653.0B | 다르다 |
| Vanguard Total Bond Market Index | BND (ETF) | $398.8B | VBTLX (MUTUALFUND) | $399.1B | **같다 — 펀드 전체 값이다** |
| Vanguard Growth Index | VUG (ETF) | $384.5B | VIGAX (MUTUALFUND) | $379.4B | 다르다 |
| Vanguard Value Index | VTV (ETF) | $262.3B | VVIAX (MUTUALFUND) | $260.9B | 다르다 |
| Vanguard Developed Markets Index | VEA (ETF) | $323.8B | VTMGX (MUTUALFUND) | $322.8B | 다르다 |
| Vanguard Emerging Markets Stock Index | VWO (ETF) | $168.4B | VEMAX (MUTUALFUND) | $167.5B | 다르다 |
| SPDR S&P 500 (클래스 하나 — 대조군) | SPY (ETF) | $811.9B | 없음 | — | 대조군 |
| iShares Core S&P 500 (클래스 하나 — 대조군) | IVV (ETF) | $884.0B | 없음 | — | 대조군 |
| Invesco QQQ (클래스 하나 — 대조군) | QQQ (ETF) | $489.0B | 없음 | — | 대조군 |

**클래스가 둘인 8개 펀드 중 1개에서 두 티커의 totalAssets 가 같다.**

## 나. 순유입 — `cumulativeNetInflow3m` 이 정말 설정·환매 순액인가

| 종목 | 저장 설정액 | 저장 3M순유입 | 네이버 원값(3M) | 네이버 totalNav | 상장일 |
| --- | ---: | ---: | --- | --- | --- |
| 0193T0 KODEX SK하이닉스단일종목레버리지 | 2.60조 | 4.18조 | "4조 1,811억" | "2조 6,050억" | 20260527 |
| 0210A0 ACE K반도체TOP2+ | 3,127억 | 4,496억 | "4,496억" | "3,127억" | 20260623 |
| 0208N0 IBK 코스피액티브 | 127억 | 171억 | "171억" | "127억" | 20260623 |
| 0216Z0 ACE K방산TOP5+ | 113억 | 149억 | "149억" | "113억" | 20260707 |
| 0198D0 1Q SK하이닉스선물단일종목레버리지 | 256억 | 329억 | "329억" | "256억" | 20260527 |
| 0195S0 TIGER SK하이닉스단일종목레버리지 | 1.56조 | 1.97조 | "1조 9,671억" | "1조 5,646억" | 20260527 |
| 0210E0 PLUS 200커버드콜액티브 | 707억 | 845억 | "845억" | "707억" | 20260623 |
| 0207G0 SOL 우주항공밸류체인 | 390억 | 457억 | "457억" | "390억" | 20260616 |
| 360750 TIGER 미국S&P500 | 20.32조 | 3.21조 | "3조 2,139억" | "20조 3,212억" | 20200807 |
| 133690 TIGER 미국나스닥100 | 11.51조 | 1.86조 | "1조 8,634억" | "11조 5,130억" | 20101018 |
| 0167A0 SOL AI반도체TOP2플러스 | 5.65조 | 1.85조 | "1조 8,499억" | "5조 6,468억" | 20260317 |
| 379810 KODEX 미국나스닥100 | 9.05조 | 1.71조 | "1조 7,069억" | "9조 541억" | 20210409 |
| 233740 KODEX 코스닥150레버리지 | 3.32조 | 1.64조 | "1조 6,361억" | "3조 3,167억" | 20151217 |
| 0193W0 KODEX 삼성전자단일종목레버리지 | 1.59조 | 1.38조 | "1조 3,762억" | "1조 5,911억" | 20260527 |

네이버 상세 응답의 최상위 칸 이름 (순유입·상장일이 어디 있는지 확인용):

```
itemCode, itemName, etfSummary, listedDate, issuerName, etfBaseIndex, marketValue, totalNav, nav, etfChaseEarningRateSymbol, etfChaseEarningRate, deviationSign, deviationRate, totalFee, chaseErrorRate, taxationTypeCode, themeReturns, returnPerformanceReferenceDate, returnPerformanceList, navPerformanceReferenceDate, navPerformanceList, cumulativeNetInflowList, assetPortfolioTotalWeight, assetPortfolioList, countryPortfolioTotalWeight, countryPortfolioList, sectorPortfolioTotalWeight, sectorPortfolioList, etfTop10MajorConstituentAssets, dividend, marketValueRaw
```

`cumulativeNetInflowList` 안의 칸 전부:

```json
{
  "referenceDate": "2026.09.08",
  "cumulativeNetInflow1d": "-266억",
  "cumulativeNetInflow1w": "69.9억",
  "cumulativeNetInflow1m": "-2,921억",
  "cumulativeNetInflow3m": "4조 1,811억",
  "cumulativeNetInflow6m": "6조 5,082억",
  "cumulativeNetInflowYtd": "6조 5,082억",
  "cumulativeNetInflow1y": "6조 5,082억"
}
```

## 다. 총보수 — 원값과 단위

| 종목 | 저장 TER | 거래정지 | 네이버 원값 |
| --- | ---: | --- | --- |
| 265690 ACE 러시아MSCI(합성) | 0.0004 | 예 | totalFee=0.0004 · {"listedDate":"20170321","totalNav":"0.9억","nav":48.41,"totalFee":0.0004,"returnPerformanceReferenceDate":"2026.09.08","navPerformanceReferenceDate":"2026.09.08"} |
| 360200 ACE 미국S&P500 | 0.0047 | 아니오 | totalFee=0.0047 · {"listedDate":"20200807","totalNav":"3조 9,111억","nav":26039.47,"totalFee":0.0047,"returnPerformanceReferenceDate":"2026.09.08","navPerformanceReferenceDate":"2026.09.08"} |
| 379780 RISE 미국S&P500 | 0.0047 | 아니오 | totalFee=0.0047 · {"listedDate":"20210409","totalNav":"1조 4,704억","nav":22517.08,"totalFee":0.0047,"returnPerformanceReferenceDate":"2026.09.08","navPerformanceReferenceDate":"2026.09.08"} |
| 069500 KODEX 200 | 0.15 | 아니오 | totalFee=0.15 · {"listedDate":"20021014","totalNav":"25조 7,099억","nav":110604.2,"totalFee":0.15,"returnPerformanceReferenceDate":"2026.09.08","navPerformanceReferenceDate":"2026.09.08"} |
| 102110 TIGER 200 | 0.05 | 아니오 | totalFee=0.05 · {"listedDate":"20080403","totalNav":"10조 3,438억","nav":110866.37,"totalFee":0.05,"returnPerformanceReferenceDate":"2026.09.08","navPerformanceReferenceDate":"2026.09.08"} |
| 133690 TIGER 미국나스닥100 | 0.0068 | 아니오 | totalFee=0.0068 · {"listedDate":"20101018","totalNav":"11조 5,130억","nav":176013.44,"totalFee":0.0068,"returnPerformanceReferenceDate":"2026.09.08","navPerformanceReferenceDate":"2026.09.08"} |
| 360750 TIGER 미국S&P500 | 0.0068 | 아니오 | totalFee=0.0068 · {"listedDate":"20200807","totalNav":"20조 3,212억","nav":25757.28,"totalFee":0.0068,"returnPerformanceReferenceDate":"2026.09.08","navPerformanceReferenceDate":"2026.09.08"} |

069500 (KODEX 200) 응답의 최상위 칸 전부 — 총보수·순유입이 실제로 어느 칸에 있는지:

```json
{
  "itemCode": "069500",
  "itemName": "KODEX 200",
  "etfSummary": "1좌당 순자산가치의 변동률을 기초지수인 KOSPI200의 변동률과 유사하도록 투자신탁재산을 운용하는 것을 목표로 합니다.한국거래소가 산출하는 KOSPI200 지수는 한국을 대표하는 200개 종목의 시가총액을 지수화한 것입니다. 200개 종목은 시장 대표성, 유동성, 업종 대표성을 고려하여 선정하는데, 전체 종목을 9개업 군으로 분류하여 시가총액과 거래량 비중이 높은 종목들을 우선 선정합니다.",
  "listedDate": "20021014",
  "issuerName": "삼성자산운용(ETF)",
  "etfBaseIndex": "코스피 200",
  "marketValue": "25조 8,066억",
  "totalNav": "25조 7,099억",
  "nav": 110604.2,
  "etfChaseEarningRateSymbol": "+",
  "etfChaseEarningRate": 1,
  "deviationSign": "-",
  "deviationRate": 0.24,
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
  "returnPerformanceReferenceDate": "2026.09.08",
  "returnPerformanceList": "[배열 10]",
  "navPerformanceReferenceDate": "2026.09.08",
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
  "assetPortfolioTotalWeight": 98.99,
  "assetPortfolioList": "[배열 5]",
  "countryPortfolioTotalWeight": 98.99,
  "countryPortfolioList": "[배열 6]",
  "sectorPortfolioTotalWeight": 98.99,
  "sectorPortfolioList": "[배열 12]",
  "etfTop10MajorConstituentAssets": "[배열 10]",
  "dividend": [
    "dividendYieldTtm",
    "dividendPerShareTtm",
    "dividendCountThisYear",
    "dividendMonthThisYear"
  ],
  "marketValueRaw": "25806599000000"
}
```


## 라. 1년 수익률 상위·하위 — 원가격에서 재계산

| 종목 | 화면 1년 | 야후 원가격 재계산 | 차이 |
| --- | ---: | ---: | ---: |
| 442580 PLUS 글로벌HBM반도체 | 379.15% | 372.71% | +6.44%p |
| 395270 HANARO Fn K-반도체 | 368.88% | 366.35% | +2.53%p |
| 363580 KODEX 200IT TR | 330.92% | 325.90% | +5.02%p |
| 367760 RISE 네트워크인프라 | 324.78% | 327.76% | -2.98%p |
| 139260 TIGER 200 IT | 319.70% | 317.50% | +2.20%p |
| 0005G0 IBK K-AI반도체코어테크 | 300.52% | 297.06% | +3.46%p |
| 469150 ACE AI반도체TOP3+ | 288.58% | 286.86% | +1.72%p |
| 494220 UNICORN SK하이닉스밸류체인액티브 | 280.27% | 277.03% | +3.24%p |
| 474590 WON 반도체밸류체인액티브 | 275.45% | 268.18% | +7.27%p |
| 395160 KODEX AI반도체TOP2플러스 | 275.34% | 270.07% | +5.27%p |
| 266370 KODEX IT | 262.60% | 261.80% | +0.80%p |
| 091230 TIGER 반도체 | 249.84% | 250.47% | -0.63%p |
| 091160 KODEX 반도체 | 244.83% | 243.51% | +1.32%p |
| 487750 BNK 온디바이스AI | 242.35% | 239.76% | +2.59%p |
| 469790 KIWOOM 코리아테크TOP10 | 242.29% | 240.07% | +2.22%p |
| 513050 E Fund CSI China Ovsea Net | -31.75% | -31.75% | +0.00%p |
| 307510 TIGER 의료기기 | -32.40% | -32.82% | +0.42%p |
| 0000Z0 RISE 바이오TOP10액티브 | -32.82% | -32.99% | +0.17%p |
| 427120 RISE AI플랫폼 | -34.21% | -34.85% | +0.64%p |
| 385560 RISE KIS국고채30년Enhanced | -35.86% | -36.17% | +0.31%p |
| 256440 ACE MSCI인도네시아(합성) | -38.93% | -36.22% | -2.71%p |
| 464610 SOL 의료기기소부장Fn | -41.12% | -40.57% | -0.55%p |
| 451530 TIGER 국고채30년스트립액티브 | -41.53% | -41.78% | +0.25%p |
| ETHA iShares Ethereum Trust ETF | -42.66% | -42.66% | +0.00%p |
| 395150 KODEX 웹툰&드라마 | -43.25% | -43.78% | +0.53%p |
| 0090B0 PLUS K방산소부장 | -44.08% | -40.63% | -3.45%p |
| 475050 ACE KPOP포커스 | -44.90% | -44.93% | +0.03%p |
| 395290 HANARO Fn K-POP&미디어 | -47.14% | -47.36% | +0.22%p |
| 476000 UNICORN 포스트IPO액티브 | -47.34% | -47.80% | +0.46%p |
| 228810 TIGER 미디어컨텐츠 | -54.92% | -54.59% | -0.33%p |

**2%p 넘게 벌어진 종목: 13 / 30**

> 국내 ETF 는 네이버가 준 값을 그대로 쓰고, 여기 재계산은 야후 원가격에서 낸다.
> 두 원천이 분배금을 다르게 다루므로 몇 %p 차이는 있을 수 있다. 두 자릿수로
> 벌어지는 것만 문제로 본다.
