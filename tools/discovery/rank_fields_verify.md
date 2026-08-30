# 랭킹 네 칸 되짚기

- 시각: 2026-08-30T23:14:45.859Z
- 대상: 1348종목 (화면이 쓰는 data/etf.js 그대로)
- 자료 기준: 2026-08-30T23:08:07.875Z

## 가. 설정액 — `totalAssets` 는 ETF 인가 펀드 전체인가

상장주식수는 ETF 에 붙지 않아 그 길이 막혔다. 대신 **같은 펀드의 다른 클래스**를 쓴다.
뱅가드 ETF 는 인덱스펀드의 한 클래스이고, 같은 펀드의 뮤추얼펀드 클래스에는 따로
티커가 있다(VTI ↔ VTSAX). 두 티커의 `totalAssets` 가 **같은 값**으로 나오면 그것은
클래스별 순자산이 아니라 **펀드 전체**를 세는 값이라는 뜻이다. 그러면 국내 ETF 의
순자산총액과 한 줄로 세울 수 없다. 클래스가 하나뿐인 SPY·IVV·QQQ 는 대조군이다.

| 펀드 | ETF 클래스 | totalAssets | 뮤추얼펀드 클래스 | totalAssets | 같은가 |
| --- | --- | ---: | --- | ---: | --- |
| Vanguard Total Stock Market Index | VTI (ETF) | $2290.0B | VTSAX (MUTUALFUND) | $2290.0B | **같다 — 펀드 전체 값이다** |
| Vanguard 500 Index | VOO (ETF) | $1686.9B | VFIAX (MUTUALFUND) | $1686.9B | **같다 — 펀드 전체 값이다** |
| Vanguard Total International Stock Index | VXUS (ETF) | $645.8B | VTIAX (MUTUALFUND) | $645.8B | **같다 — 펀드 전체 값이다** |
| Vanguard Total Bond Market Index | BND (ETF) | $396.7B | VBTLX (MUTUALFUND) | $396.7B | **같다 — 펀드 전체 값이다** |
| Vanguard Growth Index | VUG (ETF) | $372.0B | VIGAX (MUTUALFUND) | $372.0B | **같다 — 펀드 전체 값이다** |
| Vanguard Value Index | VTV (ETF) | $256.4B | VVIAX (MUTUALFUND) | $256.4B | **같다 — 펀드 전체 값이다** |
| Vanguard Developed Markets Index | VEA (ETF) | $314.9B | VTMGX (MUTUALFUND) | $314.9B | **같다 — 펀드 전체 값이다** |
| Vanguard Emerging Markets Stock Index | VWO (ETF) | $162.0B | VEMAX (MUTUALFUND) | $162.0B | **같다 — 펀드 전체 값이다** |
| SPDR S&P 500 (클래스 하나 — 대조군) | SPY (ETF) | $795.3B | 없음 | — | 대조군 |
| iShares Core S&P 500 (클래스 하나 — 대조군) | IVV (ETF) | $869.2B | 없음 | — | 대조군 |
| Invesco QQQ (클래스 하나 — 대조군) | QQQ (ETF) | $452.8B | 없음 | — | 대조군 |

**클래스가 둘인 8개 펀드 중 8개에서 두 티커의 totalAssets 가 같다.**

> 야후 `totalAssets` 는 **펀드 전체**를 센다. 뱅가드 ETF 의 설정액은 ETF 로 들어온
> 돈이 아니라 같은 펀드의 뮤추얼펀드 클래스까지 합친 값이다. 국내 ETF 는
> 네이버 `totalNav`(그 ETF 만의 순자산총액)를 쓰므로, 둘을 한 표에 세우면
> 뱅가드 상품만 실제보다 서너 배 크게 나온다.

## 나. 순유입 — `cumulativeNetInflow3m` 이 정말 설정·환매 순액인가

| 종목 | 저장 설정액 | 저장 3M순유입 | 네이버 원값(3M) | 네이버 totalNav | 상장일 |
| --- | ---: | ---: | --- | --- | --- |
| 0194T0 ACE SK하이닉스단일종목레버리지 | 498억 | 1,216억 | "1,216억" | "498억" | 20260527 |
| 0192L0 RISE SK하이닉스단일종목레버리지 | 384억 | 875억 | "875억" | "384억" | 20260527 |
| 0195S0 TIGER SK하이닉스단일종목레버리지 | 1.35조 | 3.04조 | "3조 401억" | "1조 3,543억" | 20260527 |
| 0193T0 KODEX SK하이닉스단일종목레버리지 | 2.24조 | 4.92조 | "4조 9,161억" | "2조 2,440억" | 20260527 |
| 0198D0 1Q SK하이닉스선물단일종목레버리지 | 241억 | 495억 | "495억" | "241억" | 20260527 |
| 0194M0 ACE 삼성전자단일종목레버리지 | 416억 | 804억 | "804억" | "416억" | 20260527 |
| 0192M0 RISE 삼성전자단일종목레버리지 | 290억 | 496억 | "496억" | "290억" | 20260527 |
| 0198B0 1Q 삼성전자선물단일종목레버리지 | 218억 | 350억 | "350억" | "218억" | 20260527 |
| 0167A0 SOL AI반도체TOP2플러스 | 5.54조 | 3.81조 | "3조 8,052억" | "5조 5,403억" | 20260317 |
| 360750 TIGER 미국S&P500 | 20.47조 | 3.18조 | "3조 1,833억" | "20조 4,714억" | 20200807 |
| 0193W0 KODEX 삼성전자단일종목레버리지 | 1.49조 | 2.39조 | "2조 3,929억" | "1조 4,930억" | 20260527 |
| 233740 KODEX 코스닥150레버리지 | 3.67조 | 2.15조 | "2조 1,505억" | "3조 6,655억" | 20151217 |
| 379810 KODEX 미국나스닥100 | 9.30조 | 2.04조 | "2조 365억" | "9조 2,956억" | 20210409 |
| 133690 TIGER 미국나스닥100 | 11.57조 | 1.91조 | "1조 9,083억" | "11조 5,723억" | 20101018 |

네이버 상세 응답의 최상위 칸 이름 (순유입·상장일이 어디 있는지 확인용):

```
itemCode, itemName, etfSummary, listedDate, issuerName, etfBaseIndex, marketValue, totalNav, nav, etfChaseEarningRateSymbol, etfChaseEarningRate, deviationSign, deviationRate, totalFee, chaseErrorRate, taxationTypeCode, themeReturns, returnPerformanceReferenceDate, returnPerformanceList, navPerformanceReferenceDate, navPerformanceList, cumulativeNetInflowList, assetPortfolioTotalWeight, assetPortfolioList, countryPortfolioTotalWeight, countryPortfolioList, sectorPortfolioTotalWeight, sectorPortfolioList, etfTop10MajorConstituentAssets, dividend, marketValueRaw
```

`cumulativeNetInflowList` 안의 칸 전부:

```json
{
  "referenceDate": "2026.08.28",
  "cumulativeNetInflow1d": "-12.3억",
  "cumulativeNetInflow1w": "-31.5억",
  "cumulativeNetInflow1m": "-62억",
  "cumulativeNetInflow3m": "1,216억",
  "cumulativeNetInflow6m": "1,216억",
  "cumulativeNetInflowYtd": "1,216억",
  "cumulativeNetInflow1y": "1,216억"
}
```

## 다. 총보수 — 원값과 단위

| 종목 | 저장 TER | 거래정지 | 네이버 원값 |
| --- | ---: | --- | --- |
| 265690 ACE 러시아MSCI(합성) | 0.0004 | 예 | totalFee=0.0004 · {"listedDate":"20170321","totalNav":"0.9억","nav":48.38,"totalFee":0.0004,"returnPerformanceReferenceDate":"2026.08.28","navPerformanceReferenceDate":"2026.08.28"} |
| 360200 ACE 미국S&P500 | 0.0047 | 아니오 | totalFee=0.0047 · {"listedDate":"20200807","totalNav":"3조 9,678억","nav":26565.94,"totalFee":0.0047,"returnPerformanceReferenceDate":"2026.08.28","navPerformanceReferenceDate":"2026.08.28"} |
| 379780 RISE 미국S&P500 | 0.0047 | 아니오 | totalFee=0.0047 · {"listedDate":"20210409","totalNav":"1조 4,810억","nav":22972.85,"totalFee":0.0047,"returnPerformanceReferenceDate":"2026.08.28","navPerformanceReferenceDate":"2026.08.28"} |
| 069500 KODEX 200 | 0.15 | 아니오 | totalFee=0.15 · {"listedDate":"20021014","totalNav":"24조 9,192억","nav":109431.83,"totalFee":0.15,"returnPerformanceReferenceDate":"2026.08.28","navPerformanceReferenceDate":"2026.08.28"} |
| 102110 TIGER 200 | 0.05 | 아니오 | totalFee=0.05 · {"listedDate":"20080403","totalNav":"10조 1,652억","nav":109698.05,"totalFee":0.05,"returnPerformanceReferenceDate":"2026.08.28","navPerformanceReferenceDate":"2026.08.28"} |
| 133690 TIGER 미국나스닥100 | 0.0068 | 아니오 | totalFee=0.0068 · {"listedDate":"20101018","totalNav":"11조 5,723억","nav":178642.05,"totalFee":0.0068,"returnPerformanceReferenceDate":"2026.08.28","navPerformanceReferenceDate":"2026.08.28"} |
| 360750 TIGER 미국S&P500 | 0.0068 | 아니오 | totalFee=0.0068 · {"listedDate":"20200807","totalNav":"20조 4,714억","nav":26278.38,"totalFee":0.0068,"returnPerformanceReferenceDate":"2026.08.28","navPerformanceReferenceDate":"2026.08.28"} |

069500 (KODEX 200) 응답의 최상위 칸 전부 — 총보수·순유입이 실제로 어느 칸에 있는지:

```json
{
  "itemCode": "069500",
  "itemName": "KODEX 200",
  "etfSummary": "1좌당 순자산가치의 변동률을 기초지수인 KOSPI200의 변동률과 유사하도록 투자신탁재산을 운용하는 것을 목표로 합니다.한국거래소가 산출하는 KOSPI200 지수는 한국을 대표하는 200개 종목의 시가총액을 지수화한 것입니다. 200개 종목은 시장 대표성, 유동성, 업종 대표성을 고려하여 선정하는데, 전체 종목을 9개업 군으로 분류하여 시가총액과 거래량 비중이 높은 종목들을 우선 선정합니다.",
  "listedDate": "20021014",
  "issuerName": "삼성자산운용(ETF)",
  "etfBaseIndex": "코스피 200",
  "marketValue": "24조 9,247억",
  "totalNav": "24조 9,192억",
  "nav": 109431.83,
  "etfChaseEarningRateSymbol": "+",
  "etfChaseEarningRate": 1,
  "deviationSign": "+",
  "deviationRate": 0.02,
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
  "returnPerformanceReferenceDate": "2026.08.28",
  "returnPerformanceList": "[배열 10]",
  "navPerformanceReferenceDate": "2026.08.28",
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
  "assetPortfolioTotalWeight": 98.95,
  "assetPortfolioList": "[배열 5]",
  "countryPortfolioTotalWeight": 98.95,
  "countryPortfolioList": "[배열 6]",
  "sectorPortfolioTotalWeight": 98.95,
  "sectorPortfolioList": "[배열 12]",
  "etfTop10MajorConstituentAssets": "[배열 10]",
  "dividend": [
    "dividendYieldTtm",
    "dividendPerShareTtm",
    "dividendCountThisYear",
    "dividendMonthThisYear"
  ],
  "marketValueRaw": "24924709000000"
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
| 512690 Penghua China Secs Wine ET | -31.21% | -31.21% | +0.00%p |
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
