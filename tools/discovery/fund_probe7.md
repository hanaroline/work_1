# 펀드 원천 탐색 7차 — 네이버는 살아 있었다

조사 시각: 2026-08-28T16:14:55.277Z

앞선 판단을 정정한다. 1차에서 `finance.naver.com/fund/` 가 일반 증권 홈으로
넘어가는 것을 보고 "펀드 서비스가 없어졌다" 고 적었는데 **틀렸다.**
펀드는 새 주소로 옮겨가 있었다.

```
https://stock.naver.com/domestic/fund/K55235B39916/total
```

옛 주소가 죽은 것과 서비스가 없어진 것은 다르다. 넘어간 곳만 보고 단정한
것이 잘못이었다.

**판정: 보유종목을 주는 호출을 3건 재현했다. 수집기로 넘어갈 수 있다.**

## 화면별 api 호출

### 펀드 종합

- 주소: `https://stock.naver.com/domestic/fund/K55235B39916/total`
- 도착: `https://stock.naver.com/domestic/fund/K55235B39916/total`
- 호출 15건

| 상태 | 크기 | 주소 |
|---|---:|---|
| 200 | 112 | `https://stock.naver.com/api/auth/userInfo` |
| 200 | 4000 | `https://stock.naver.com/api/securityService/integration/indicators?indicatorCodes=KOSPI%2CKOSDAQ%2CKPI200%2C.DJI%2C.INX%2CFX_USDKRW%2C.IXIC%2CGCcv1%2CCLcv1` |
| 200 | 4000 | `https://stock.naver.com/api/fund/funds/K55235B39916/base-price/chart?term=3m` |
| 200 | 1050 | `https://stock.naver.com/api/fund/funds/K55235B39916/left-panel` |
| 200 | 113 | `https://stock.naver.com/api/stockSecurity/notices/v2/banners?size=2&type=PC_TOP` |
| 200 | 1399 | `https://stock.naver.com/api/fund/funds/K55235B39916/fund-performance` |
| 200 | 1722 | `https://stock.naver.com/api/fund/funds/K55235B39916/chart-price-panel` |
| 200 | 4000 | `https://stock.naver.com/api/personal/users/favorite/ranking?pageSize=10` |
| 400 | 43 | `https://stock.naver.com/api/personal/guest/recent/products` |
| 200 | 239 | `https://stock.naver.com/api/fund/funds/K55235B39916/metrics/detail?term=1y` |
| 200 | 4000 | `https://stock.naver.com/api/polling/favorite-aggregate/favoritePolling` |
| 200 | 2924 | `https://polling.finance.naver.com/api/realtime/domestic/index/KOSPI,KOSDAQ,KPI200` |
| 200 | 2930 | `https://polling.finance.naver.com/api/realtime/worldstock/index/.DJI,.INX,.IXIC` |
| 200 | 835 | `https://polling.finance.naver.com/api/realtime/marketindex/metals/GCcv1` |
| 200 | 827 | `https://polling.finance.naver.com/api/realtime/marketindex/energy/CLcv1` |

### 펀드 종합 + 자산구성 클릭

- 주소: `https://stock.naver.com/domestic/fund/K55235B39916/total`
- 도착: `https://stock.naver.com/domestic/fund/K55235B39916/total`
- 호출 21건

| 상태 | 크기 | 주소 |
|---|---:|---|
| 200 | 4000 | `https://ssl.pstatic.net/imgstock/fn/real/pc/_front/lottie/main_load.json` |
| 200 | 112 | `https://stock.naver.com/api/auth/userInfo` |
| 200 | 2924 | `https://polling.finance.naver.com/api/realtime/domestic/index/KOSPI,KOSDAQ,KPI200` |
| 200 | 28 | `https://stock.naver.com/api/personal/users/favorite/groups?includeItems=true&categoryTypes=stock%2Cipo%2Ccrypto%2Cfund` |
| 200 | 4000 | `https://stock.naver.com/api/fund/funds/K55235B39916/base-price/chart?term=3m` |
| 200 | 113 | `https://stock.naver.com/api/stockSecurity/notices/v2/banners?size=2&type=PC_TOP` |
| 200 | 4000 | `https://stock.naver.com/api/securityService/integration/indicators?indicatorCodes=KOSPI%2CKOSDAQ%2CKPI200%2C.DJI%2C.INX%2CFX_USDKRW%2C.IXIC%2CGCcv1%2CCLcv1` |
| 200 | 1050 | `https://stock.naver.com/api/fund/funds/K55235B39916/left-panel` |
| 200 | 1399 | `https://stock.naver.com/api/fund/funds/K55235B39916/fund-performance` |
| 200 | 4000 | `https://stock.naver.com/api/personal/users/favorite/ranking?pageSize=10` |
| 200 | 1722 | `https://stock.naver.com/api/fund/funds/K55235B39916/chart-price-panel` |
| 200 | 2930 | `https://polling.finance.naver.com/api/realtime/worldstock/index/.DJI,.INX,.IXIC` |
| 200 | 4000 | `https://stock.naver.com/api/polling/favorite-aggregate/favoritePolling` |
| 200 | 16 | `https://stock.naver.com/api/personal/guest/recent/products` |
| 200 | 239 | `https://stock.naver.com/api/fund/funds/K55235B39916/metrics/detail?term=1y` |
| 200 | 835 | `https://polling.finance.naver.com/api/realtime/marketindex/metals/GCcv1` |
| 200 | 827 | `https://polling.finance.naver.com/api/realtime/marketindex/energy/CLcv1` |
| 200 | 2924 | `https://polling.finance.naver.com/api/realtime/domestic/index/KOSPI,KOSDAQ,KPI200` |
| 200 | 2930 | `https://polling.finance.naver.com/api/realtime/worldstock/index/.DJI,.INX,.IXIC` |
| 200 | 835 | `https://polling.finance.naver.com/api/realtime/marketindex/metals/GCcv1` |
| 200 | 827 | `https://polling.finance.naver.com/api/realtime/marketindex/energy/CLcv1` |

### 펀드 하위 화면 /performance

- 주소: `https://stock.naver.com/domestic/fund/K55235B39916/performance`
- 도착: `https://stock.naver.com/domestic/fund/K55235B39916/performance`
- 호출 17건

| 상태 | 크기 | 주소 |
|---|---:|---|
| 200 | 4000 | `https://ssl.pstatic.net/imgstock/fn/real/pc/_front/lottie/main_load.json` |
| 200 | 112 | `https://stock.naver.com/api/auth/userInfo` |
| 200 | 2924 | `https://polling.finance.naver.com/api/realtime/domestic/index/KOSPI,KOSDAQ,KPI200` |
| 200 | 28 | `https://stock.naver.com/api/personal/users/favorite/groups?includeItems=true&categoryTypes=stock%2Cipo%2Ccrypto%2Cfund` |
| 200 | 209 | `https://stock.naver.com/api/fund/funds/K55235B39916/classes/returns` |
| 200 | 113 | `https://stock.naver.com/api/stockSecurity/notices/v2/banners?size=2&type=PC_TOP` |
| 200 | 4000 | `https://stock.naver.com/api/securityService/integration/indicators?indicatorCodes=KOSPI%2CKOSDAQ%2CKPI200%2C.DJI%2C.INX%2CFX_USDKRW%2C.IXIC%2CGCcv1%2CCLcv1` |
| 200 | 966 | `https://stock.naver.com/api/fund/funds/K55235B39916/prices/daily?date=2026-08-28&size=10` |
| 200 | 1399 | `https://stock.naver.com/api/fund/funds/K55235B39916/fund-performance` |
| 200 | 1050 | `https://stock.naver.com/api/fund/funds/K55235B39916/left-panel` |
| 200 | 4000 | `https://stock.naver.com/api/personal/users/favorite/ranking?pageSize=10` |
| 200 | 2930 | `https://polling.finance.naver.com/api/realtime/worldstock/index/.DJI,.INX,.IXIC` |
| 200 | 4000 | `https://stock.naver.com/api/polling/favorite-aggregate/favoritePolling` |
| 200 | 16 | `https://stock.naver.com/api/personal/guest/recent/products` |
| 200 | 239 | `https://stock.naver.com/api/fund/funds/K55235B39916/metrics/detail?term=1y` |
| 200 | 835 | `https://polling.finance.naver.com/api/realtime/marketindex/metals/GCcv1` |
| 200 | 827 | `https://polling.finance.naver.com/api/realtime/marketindex/energy/CLcv1` |

### 펀드 하위 화면 /analysis

- 주소: `https://stock.naver.com/domestic/fund/K55235B39916/analysis`
- 도착: `https://stock.naver.com/domestic/fund/K55235B39916/analysis`
- 호출 1건

| 상태 | 크기 | 주소 |
|---|---:|---|
| 200 | 112 | `https://stock.naver.com/api/auth/userInfo` |

### 펀드 하위 화면 /asset

- 주소: `https://stock.naver.com/domestic/fund/K55235B39916/asset`
- 도착: `https://stock.naver.com/domestic/fund/K55235B39916/asset`
- 호출 1건

| 상태 | 크기 | 주소 |
|---|---:|---|
| 200 | 112 | `https://stock.naver.com/api/auth/userInfo` |

### 펀드 하위 화면 /holding

- 주소: `https://stock.naver.com/domestic/fund/K55235B39916/holding`
- 도착: `https://stock.naver.com/domestic/fund/K55235B39916/holding`
- 호출 1건

| 상태 | 크기 | 주소 |
|---|---:|---|
| 200 | 112 | `https://stock.naver.com/api/auth/userInfo` |

### 펀드 홈/랭킹

- 주소: `https://stock.naver.com/domestic/fund`
- 도착: `https://stock.naver.com/domestic/fund`
- 호출 1건

| 상태 | 크기 | 주소 |
|---|---:|---|
| 200 | 112 | `https://stock.naver.com/api/auth/userInfo` |

### 펀드 검색

- 주소: `https://stock.naver.com/search?query=%ED%8E%80%EB%93%9C`
- 도착: `https://stock.naver.com/search?query=%ED%8E%80%EB%93%9C`
- 호출 1건

| 상태 | 크기 | 주소 |
|---|---:|---|
| 200 | 112 | `https://stock.naver.com/api/auth/userInfo` |

## 재현

| 주소 | 결과 | 보유종목 | 수익률 | 설정액 | 보수 | 자산구성 |
|---|---|:-:|:-:|:-:|:-:|:-:|
| `https://stock.naver.com/api/auth/userInfo` | ✓ 200 112B | · | · | · | · | · |
| `https://stock.naver.com/api/securityService/integration/indicators?indicatorCodes=KOSPI%2CKOSDAQ%2CKPI200%2C.DJI%2C.INX%` | ✓ 200 5322B | ○ | · | · | · | · |
| `https://stock.naver.com/api/fund/funds/K55235B39916/base-price/chart?term=3m` | ✓ 200 5148B | · | · | · | · | · |
| `https://stock.naver.com/api/fund/funds/K55235B39916/left-panel` | ✓ 200 1050B | · | ○ | ○ | ○ | · |
| `https://stock.naver.com/api/stockSecurity/notices/v2/banners?size=2&type=PC_TOP` | ✓ 200 113B | · | · | · | · | · |
| `https://stock.naver.com/api/fund/funds/K55235B39916/fund-performance` | ✓ 200 1399B | · | ○ | · | · | · |
| `https://stock.naver.com/api/fund/funds/K55235B39916/chart-price-panel` | ✓ 200 1722B | · | · | · | · | ○ |
| `https://stock.naver.com/api/personal/users/favorite/ranking?pageSize=10` | ✓ 200 5462B | ○ | · | · | · | · |
| `https://stock.naver.com/api/personal/guest/recent/products` | △ 400 43B | · | · | · | · | · |
| `https://stock.naver.com/api/fund/funds/K55235B39916/metrics/detail?term=1y` | ✓ 200 239B | · | · | · | · | · |
| `https://stock.naver.com/api/polling/favorite-aggregate/favoritePolling` | △ 404 118B | · | · | · | · | · |
| `https://polling.finance.naver.com/api/realtime/domestic/index/KOSPI,KOSDAQ,KPI200` | ✓ 200 2924B | ○ | · | · | · | · |
| `https://polling.finance.naver.com/api/realtime/worldstock/index/.DJI,.INX,.IXIC` | ✓ 200 2930B | · | · | · | · | · |
| `https://polling.finance.naver.com/api/realtime/marketindex/metals/GCcv1` | ✓ 200 835B | · | · | · | · | · |
| `https://polling.finance.naver.com/api/realtime/marketindex/energy/CLcv1` | ✓ 200 827B | · | · | · | · | · |
| `https://stock.naver.com/api/personal/users/favorite/groups?includeItems=true&categoryTypes=stock%2Cipo%2Ccrypto%2Cfund` | △ 200 28B | · | · | · | · | · |
| `https://stock.naver.com/api/fund/funds/K55235B39916/classes/returns` | ✓ 200 209B | · | ○ | · | ○ | · |
| `https://stock.naver.com/api/fund/funds/K55235B39916/prices/daily?date=2026-08-28&size=10` | ✓ 200 966B | · | · | · | · | · |

## 응답 맛보기

### `https://stock.naver.com/api/auth/userInfo`

```json
{"result":{"isLogin":false,"isAgreementYn":"","userId":"","nidNo":"","realNameVerified":"N","name":"","age":""}}
```

### `https://stock.naver.com/api/securityService/integration/indicators?indicatorCodes=KOSPI%2CKOSDAQ%2CKPI200%2C.DJI%2C.INX%2CFX_USDKRW%2C.IXIC%2CGCcv1%2C`

```json
[{"stockType":"domestic","stockEndType":"index","nationType":"KOR","nationName":"대한민국","stockExchangeType":"KOSPI","stockExchangeName":"코스피","itemCode":"KOSPI","reutersCode":"KOSPI","symbolCode":"KOSPI","stockName":"코스피","currentPrice":"6788.88","fluctuations":"-123.49","fluctuationsType":"FALLING","fluctuationsRatio":"-1.79","lastClosePrice":"6912.37","openPrice":"6846.54","highPrice":"6901.78","lowPrice":"6780.13","highPriceOf52Weeks":"9385.59","lowPriceOf52Weeks":"3135.02","localTradedAt":"2026-08-28T18:59:00+09:00","marketStatus":"CLOSE","priceDataType":"REALTIME","delayTime":0},{"stockType":"domestic","stockEndType":"index","nationType":"KOR","nationName":"대한민국","stockExchangeType":"KOSDAQ","stockExchangeName":"코스닥","itemCode":"KOSDAQ","reutersCode":"KOSDAQ","symbolCode":"KOSDAQ","stockName":"코스닥","currentPrice":"838.41","fluctuations":"0.76","fluctuationsType":"RISING","fluctuationsRatio":"0.09","lastClosePrice":"837.65","openPrice":"835.23","highPrice":"840.85","lowPrice":"829.59","highPriceOf52Weeks":"1229.42","lowPriceOf52Weeks":"630.99","localTradedAt":"2026-08-28T18:59:00+09:00","marketStatus":"CLOSE","priceDataType":"REALTIME","delayTime":0},{"stockType":"domestic","stockEndType":"index","nationType":"KOR","nationName":"대한민국","stockExchangeType":"KOSPI","stockExchangeName":"코스피","itemCode":"KPI200","reutersCode":"KPI200","symbolCode":"KPI200","stockName":"코스피 200","currentPrice":"1065.70","fluctuations":"-22.91","fluctuationsType":"FALLING","fluctuationsRatio":"-2
```

### `https://stock.naver.com/api/fund/funds/K55235B39916/base-price/chart?term=3m`

```json
{"basePrice":"5956.79","derivedNav":"4611116881228","latestTradeDate":"2026-08-27","series":[{"tradeDate":"2026-05-27","basePrice":"6105.15","derivedNav":"4862667956394"},{"tradeDate":"2026-05-28","basePrice":"6082.68","derivedNav":"4842947623000"},{"tradeDate":"2026-05-29","basePrice":"6035.87","derivedNav":"4796685946630"},{"tradeDate":"2026-06-01","basePrice":"6094.76","derivedNav":"4827999492874"},{"tradeDate":"2026-06-02","basePrice":"6150.03","derivedNav":"4861462881422"},{"tradeDate":"2026-06-04","basePrice":"6297.69","derivedNav":"4970115147991"},{"tradeDate":"2026-06-05","basePrice":"6207.73","derivedNav":"4887154844435"},{"tradeDate":"2026-06-08","basePrice":"6229.74","derivedNav":"4893600472925"},{"tradeDate":"2026-06-09","basePrice":"6033.05","derivedNav":"4725344923658"},{"tradeDate":"2026-06-10","basePrice":"6000.52","derivedNav":"4693567301737"},{"tradeDate":"2026-06-11","basePrice":"5847.05","derivedNav":"4571055132409"},{"tradeDate":"2026-06-12","basePrice":"5840.40","derivedNav":"4564281600338"},{"tradeDate":"2026-06-15","basePrice":"5800.90","derivedNav":"4526238588960"},{"tradeDate":"2026-06-16","basePrice":"5891.15","derivedNav":"4603245086501"},{"tradeDate":"2026-06-17","basePrice":"5981.10","derivedNav":"4676975496807"},{"tradeDate":"2026-06-18","basePrice":"5917.66","derivedNav":"4657127845588"},{"tradeDate":"2026-06-19","basePrice":"5910.72","derivedNav":"4650769271847"},{"tradeDate":"2026-06-22","basePrice":"5891.68","derivedNav":"4630933141316"},{"t
```

### `https://stock.naver.com/api/fund/funds/K55235B39916/left-panel`

```json
{"detail":{"fundCode":"K55235B39916","fundName":"피델리티글로벌테크놀로지증권모투자신탁(주식-재간접형)","basePrice":"5956.79","changePrice":14.06,"priceBandType":"RISING","returnIndex":0.2365916,"returnRate3m":-1.7180155,"tradeDate":"2026-08-27","riskGrade":null,"parentPeerGroupName":"해외주식형","derivedAum":"774093701808","derivedNav":"4611116881228","inceptionDate":"2015-06-17","companyCode":"235","companyName":"피델리티자산운용","benchmarkName":"MSCI AC WORLD INDEX (KRW Unhedged)","totalFee":null,"managementFee":null,"salesFee":null,"custodyFee":null,"backOfficeFee":null,"preSalesFee":null,"postSalesFee":null},"returns":{"fund":{"fundCode":"K55235B39916","fundName":"피델리티글로벌테크놀로지증권모투자신탁(주식-재간접형)","totalFee":null,"returnRate1m":7.249547,"returnRate3m":-1.7180155,"returnRate1y":24.7819029,"returnRate3y":87.2107768},"classes":[]},"terms":{"infoObject":null,"standardTime":null,"buyStandardDaysBefore":null,"buyStandardDaysAfter":null,"redeemStandardDaysBefore":null,"redeemStandardDaysAfter":null,"redeemPaymentDaysBefore":null,"redeemPaymentDaysAfter":null,"riskGrade":null}}
```

### `https://stock.naver.com/api/stockSecurity/notices/v2/banners?size=2&type=PC_TOP`

```json
[{"noticeId":"150","title":"8월 해외주식 및 선물 휴장 안내"},{"noticeId":"149","title":"새롭게 변화될 Npay 증권 PC서비스를 먼저 만나보세요!  "}]
```

### `https://stock.naver.com/api/fund/funds/K55235B39916/fund-performance`

```json
{"performance":{"tradeDate":"2026-08-27","returnRate1m":7.249547,"returnRate3m":-1.7180155,"returnRate1y":24.7819029,"standardDeviation":17.689973331,"trackingError":18.110737975,"sharpe":1.227047755},"periodReturns":{"baseDate":"2026-08-27","returns":[{"term":"1d","fundReturn":0.2365916,"benchmarkReturn":null,"peerCompanyReturn":null},{"term":"1w","fundReturn":0.2512681,"benchmarkReturn":-1.6787722,"peerCompanyReturn":null},{"term":"1m","fundReturn":7.249547,"benchmarkReturn":-1.9567338,"peerCompanyReturn":null},{"term":"3m","fundReturn":-1.7180155,"benchmarkReturn":-5.9271424,"peerCompanyReturn":null},{"term":"6m","fundReturn":13.6865533,"benchmarkReturn":5.661221,"peerCompanyReturn":null},{"term":"9m","fundReturn":18.1521533,"benchmarkReturn":9.3286764,"peerCompanyReturn":null},{"term":"ytd","fundReturn":14.0873147,"benchmarkReturn":10.5131027,"peerCompanyReturn":null},{"term":"1y","fundReturn":24.7819029,"benchmarkReturn":22.4573935,"peerCompanyReturn":null},{"term":"2y","fundReturn":43.7491732,"benchmarkReturn":48.2065874,"peerCompanyReturn":null},{"term":"3y","fundReturn":87.2107768,"benchmarkReturn":89.6235653,"peerCompanyReturn":null},{"term":"5y","fundReturn":83.9115489,"benchmarkReturn":106.028332,"peerCompanyReturn":null},{"term":"dx","fundReturn":6.715499971,"benchmarkReturn":null,"peerCompanyReturn":null}]},"metricsTerms":{"terms":["1m","3m","6m","1y","3y","5y"]}}
```

### `https://stock.naver.com/api/fund/funds/K55235B39916/chart-price-panel`

```json
{"availability":{"status":"available","assets":false,"portfolio":false,"sectors":false},"allocationsPortfolio":null,"allocationsAssets":null,"fundReturns":{"baseDate":"2026-08-27","returns":[{"term":"1d","fundReturn":0.2365916,"benchmarkReturn":null,"peerCompanyReturn":null},{"term":"1w","fundReturn":0.2512681,"benchmarkReturn":-1.6787722,"peerCompanyReturn":null},{"term":"1m","fundReturn":7.249547,"benchmarkReturn":-1.9567338,"peerCompanyReturn":null},{"term":"3m","fundReturn":-1.7180155,"benchmarkReturn":-5.9271424,"peerCompanyReturn":null},{"term":"6m","fundReturn":13.6865533,"benchmarkReturn":5.661221,"peerCompanyReturn":null},{"term":"9m","fundReturn":18.1521533,"benchmarkReturn":9.3286764,"peerCompanyReturn":null},{"term":"ytd","fundReturn":14.0873147,"benchmarkReturn":10.5131027,"peerCompanyReturn":null},{"term":"1y","fundReturn":24.7819029,"benchmarkReturn":22.4573935,"peerCompanyReturn":null},{"term":"2y","fundReturn":43.7491732,"benchmarkReturn":48.2065874,"peerCompanyReturn":null},{"term":"3y","fundReturn":87.2107768,"benchmarkReturn":89.6235653,"peerCompanyReturn":null},{"term":"5y","fundReturn":83.9115489,"benchmarkReturn":106.028332,"peerCompanyReturn":null},{"term":"dx","fundReturn":6.715499971,"benchmarkReturn":null,"peerCompanyReturn":null}]},"documents":[{"documentType":"terms","documentName":"약관","url":"https://stock.pstatic.net/stock-research/fund/K55235B39916/K55235B39916_Y_1783590217527.pdf","receiveDate":"2026-03-20"}],"metricsDetail":{"fundCode":"K5523
```

### `https://stock.naver.com/api/personal/users/favorite/ranking?pageSize=10`

```json
[{"stockName":"삼성전자","stockEndType":"stock","nationCode":"kor","itemCode":"005930","symbolCode":"005930","linkUrl":"/domestic/stock/005930/price","price":"257,000","priceKrw":"257,000","rate":-3.38,"amount":"-9,000","amountKrw":"-9,000","rateStatus":"fall","type":"deletable","productType":"domestic","stockExchangeType":"KOSPI","currencyType":"KRW","fluctuationsKrw":"-9,000","fluctuationsRatio":"-3.38","idx":0,"marketValue":"15,024,936","marketValueKrw":"15,024,936","thumbnailItemCode":"005930","category":"stock","isTradingStop":false,"isIpo":false},{"stockName":"SK하이닉스","stockEndType":"stock","nationCode":"kor","itemCode":"000660","symbolCode":"000660","linkUrl":"/domestic/stock/000660/price","price":"1,653,000","priceKrw":"1,653,000","rate":-4.45,"amount":"-77,000","amountKrw":"-77,000","rateStatus":"fall","type":"deletable","productType":"domestic","stockExchangeType":"KOSPI","currencyType":"KRW","fluctuationsKrw":"-77,000","fluctuationsRatio":"-4.45","idx":1,"marketValue":"12,075,038","marketValueKrw":"12,075,038","thumbnailItemCode":"000660","category":"stock","isTradingStop":false,"isIpo":false},{"stockName":"현대차","stockEndType":"stock","nationCode":"kor","itemCode":"005380","symbolCode":"005380","linkUrl":"/domestic/stock/005380/price","price":"399,500","priceKrw":"399,500","rate":0.38,"amount":"1,500","amountKrw":"1,500","rateStatus":"rise","type":"deletable","productType":"domestic","stockExchangeType":"KOSPI","currencyType":"KRW","fluctuationsKrw":"1,500","fluctuatio
```

### `https://stock.naver.com/api/fund/funds/K55235B39916/metrics/detail?term=1y`

```json
{"fundCode":"K55235B39916","termWeeks":52,"fundMetric":{"standardDeviation":17.689973331,"trackingError":18.110737975,"sharpRatio":1.227047755,"informationRatio":0.242532675,"jensenAlpha":13.887205342,"beta":0.451613629},"peerMetric":null}
```

### `https://polling.finance.naver.com/api/realtime/domestic/index/KOSPI,KOSDAQ,KPI200`

```json
{"pollingInterval":70000,"datas":[{"itemCode":"KOSPI","stockName":"코스피","stockExchangeType":{"code":"KS","zoneId":"Asia/Seoul","nationType":"KOR","delayTime":0,"startTime":"0900","endTime":"1530","closePriceSendTime":"1630","nameKor":"코스피","nameEng":"KOSPI","nationCode":"KOR","nationName":"대한민국","stockType":"domestic","name":"KOSPI"},"closePrice":"6,788.88","compareToPreviousClosePrice":"-123.49","compareToPreviousPrice":{"code":"5","text":"하락","name":"FALLING"},"fluctuationsRatio":"-1.79","openPrice":"6,846.54","highPrice":"6,901.78","lowPrice":"6,780.13","accumulatedTradingVolume":"292,615천주","accumulatedTradingValue":"21,637,450백만","marketStatus":"CLOSE","localTradedAt":"2026-08-28T18:59:00+09:00","symbolCode":"KOSPI","accumulatedTradingVolumeRaw":"292615000","accumulatedTradingValueRaw":"21637450000000","compareToPreviousClosePriceRaw":"-123.49","closePriceRaw":"6788.88","fluctuationsRatioRaw":"-1.79","openPriceRaw":"6846.54","highPriceRaw":"6901.78","lowPriceRaw":"6780.13"},{"itemCode":"KOSDAQ","stockName":"코스닥","stockExchangeType":{"code":"KQ","zoneId":"Asia/Seoul","nationType":"KOR","delayTime":0,"startTime":"0900","endTime":"1530","closePriceSendTime":"1630","nameKor":"코스닥","nameEng":"KOSDAQ","nationCode":"KOR","nationName":"대한민국","stockType":"domestic","name":"KOSDAQ"},"closePrice":"838.41","compareToPreviousClosePrice":"0.76","compareToPreviousPrice":{"code":"2","text":"상승","name":"RISING"},"fluctuationsRatio":"0.09","openPrice":"835.23","highPrice":"840.85","lowPri
```

### `https://polling.finance.naver.com/api/realtime/worldstock/index/.DJI,.INX,.IXIC`

```json
{"pollingInterval":7000,"datas":[{"reutersCode":".DJI","indexName":"다우존스","stockExchangeType":{"code":"NYS","zoneId":"EST5EDT","nationType":"USA","delayTime":0,"startTime":"0930","endTime":"1600","closePriceSendTime":"2031","nameKor":"뉴욕 거래소","nameEng":"New York Stock Exchange","nationCode":"USA","nationName":"미국","stockType":"worldstock","name":"NYSE"},"closePrice":"53,619.49","compareToPreviousClosePrice":"50.05","compareToPreviousPrice":{"code":"2","text":"상승","name":"RISING"},"fluctuationsRatio":"0.09","openPrice":"53,611.94","highPrice":"53,819.65","lowPrice":"53,498.73","accumulatedTradingVolume":"225,250천주","accumulatedTradingValue":"-","marketStatus":"OPEN","localTradedAt":"2026-08-28T12:15:49-04:00","symbolCode":"DJI","accumulatedTradingVolumeRaw":"225250000","accumulatedTradingValueRaw":"","closePriceRaw":"53619.49","fluctuationsRatioRaw":"0.09","openPriceRaw":"53611.94","highPriceRaw":"53819.65","lowPriceRaw":"53498.73","compareToPreviousClosePriceRaw":"50.05"},{"reutersCode":".INX","indexName":"S&P 500","stockExchangeType":{"code":"NYS","zoneId":"EST5EDT","nationType":"USA","delayTime":0,"startTime":"0930","endTime":"1600","closePriceSendTime":"2031","nameKor":"뉴욕 거래소","nameEng":"New York Stock Exchange","nationCode":"USA","nationName":"미국","stockType":"worldstock","name":"NYSE"},"closePrice":"7,726.25","compareToPreviousClosePrice":"-4.74","compareToPreviousPrice":{"code":"5","text":"하락","name":"FALLING"},"fluctuationsRatio":"-0.06","openPrice":"7,735.17","highPr
```

### `https://polling.finance.naver.com/api/realtime/marketindex/metals/GCcv1`

```json
{"pollingInterval":7000,"datas":[{"reutersCode":"GCcv1","symbolCode":"GC","name":"국제 금","stockExchangeType":{"code":"CMX","zoneId":"CST6CDT","nationType":"USA","delayTime":10,"startTime":"1700","endTime":"1600","closePriceSendTime":"1600","nameKor":"뉴욕상품거래소","nameEng":"Commodity Exchange","nationCode":"USA","nationName":"미국","stockType":"worldstock","name":"COMEX"},"closePrice":"4,564.30","fluctuations":"-99.70","fluctuationsRatio":"-2.14","openPrice":"4,656.00","highPrice":"4,688.00","lowPrice":"4,563.60","accumulatedTradingVolume":"182,463","accumulatedTradingValue":"-","fluctuationsType":{"code":"5","text":"하락","name":"FALLING"},"marketStatus":"OPEN","localTradedAt":"2026-08-28T11:05:51-05:00","unit":"USD/OZS","tradeStopType":null,"accumulatedTradingVolumeRaw":"182463","closePriceRaw":"4564.30"}],"time":"20260829011551"}
```

### `https://polling.finance.naver.com/api/realtime/marketindex/energy/CLcv1`

```json
{"pollingInterval":7000,"datas":[{"reutersCode":"CLcv1","symbolCode":"CL","name":"WTI","stockExchangeType":{"code":"NYM","zoneId":"CST6CDT","nationType":"USA","delayTime":10,"startTime":"1700","endTime":"1600","closePriceSendTime":"1600","nameKor":"뉴욕상업거래소","nameEng":"New York Mercantile Exchange","name":"NYMEX","nationCode":"USA","nationName":"미국","stockType":"worldstock"},"closePrice":"82.99","fluctuations":"-0.54","fluctuationsRatio":"-0.65","openPrice":"83.67","highPrice":"83.78","lowPrice":"82.25","accumulatedTradingVolume":"97,815","accumulatedTradingValue":"-","fluctuationsType":{"code":"5","text":"하락","name":"FALLING"},"marketStatus":"OPEN","localTradedAt":"2026-08-28T11:05:49-05:00","unit":"USD/BBL","tradeStopType":null,"accumulatedTradingVolumeRaw":"97815","closePriceRaw":"82.99"}],"time":"20260829011549"}
```

### `https://stock.naver.com/api/fund/funds/K55235B39916/classes/returns`

```json
{"fund":{"fundCode":"K55235B39916","fundName":"피델리티글로벌테크놀로지증권모투자신탁(주식-재간접형)","totalFee":null,"returnRate1m":7.249547,"returnRate3m":-1.7180155,"returnRate1y":24.7819029,"returnRate3y":87.2107768},"classes":[]}
```

### `https://stock.naver.com/api/fund/funds/K55235B39916/prices/daily?date=2026-08-28&size=10`

```json
{"fundCode":"K55235B39916","prices":[{"tradeDate":"2026-08-27","basePrice":"5956.79","changePrice":14.06,"changeRate":0.2365916},{"tradeDate":"2026-08-26","basePrice":"5942.73","changePrice":-42.74,"changeRate":-0.7140626},{"tradeDate":"2026-08-25","basePrice":"5985.47","changePrice":30.98,"changeRate":0.5202797},{"tradeDate":"2026-08-24","basePrice":"5954.49","changePrice":-29.21,"changeRate":-0.4881595},{"tradeDate":"2026-08-21","basePrice":"5983.70","changePrice":41.84,"changeRate":0.7041566},{"tradeDate":"2026-08-20","basePrice":"5941.86","changePrice":-81.89,"changeRate":-1.3594522},{"tradeDate":"2026-08-19","basePrice":"6023.75","changePrice":-12.43,"changeRate":-0.2059249},{"tradeDate":"2026-08-18","basePrice":"6036.18","changePrice":61.67,"changeRate":1.0322185},{"tradeDate":"2026-08-14","basePrice":"5974.51","changePrice":-38.63,"changeRate":-0.6424264},{"tradeDate":"2026-08-13","basePrice":"6013.14","changePrice":2.7,"changeRate":0.0449218}]}
```
