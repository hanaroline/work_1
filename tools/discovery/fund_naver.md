# 네이버 펀드 API — 목록과 보유종목

조사 시각: 2026-08-28T16:23:11.821Z

**판정: 보유종목이 채워지는 펀드가 2/12개 있다. ETF 와 같은 화면을 만들 수 있다.**

## 확인된 엔드포인트

```
/api/fund/funds/{표준코드}/left-panel         기본정보·설정액·순자산·운용사·벤치마크
/api/fund/funds/{표준코드}/fund-performance   기간수익률 + 벤치마크 대비
/api/fund/funds/{표준코드}/chart-price-panel  자산구성·포트폴리오·섹터
/api/fund/funds/{표준코드}/base-price/chart   기준가 시계열
/api/fund/funds/{표준코드}/prices/daily       일별 기준가
/api/fund/funds/{표준코드}/metrics/detail     표준편차·추적오차·샤프·젠센알파·베타
/api/fund/funds/{표준코드}/classes/returns    클래스별 수익률
```

## 목록 자리 찾기

| 후보 | 결과 |
|---|---|
| 펀드 목록 `https://stock.naver.com/api/fund/funds?page=0&size=20` | ✓ 200 10878B |
| 펀드 랭킹 `https://stock.naver.com/api/fund/funds/ranking?page=0&size=20` | ✗ 400 108B |
| 펀드 검색 `https://stock.naver.com/api/fund/funds/search?page=0&size=20` | ✗ 400 108B |
| 펀드 홈 `https://stock.naver.com/api/fund/home` | ✗ 404 85B |
| 펀드 유형별 `https://stock.naver.com/api/fund/peer-groups` | ✗ 404 92B |
| 펀드 운용사 `https://stock.naver.com/api/fund/companies` | ✗ 404 90B |
| 자동완성(전체) `https://ac.stock.naver.com/ac?q=%EA%B8%80%EB%A1%9C%EB%B2%8C&target=index%2Cstock%2Cmarketi` | ✓ 200 2124B |
| 자동완성(펀드) `https://ac.stock.naver.com/ac?q=%ED%94%BC%EB%8D%B8%EB%A6%AC%ED%8B%B0&target=fund` | ✓ 200 2457B |

## 하위 경로

| 경로 | 결과 |
|---|---|
| `portfolio` | ✗ 404 109B |
| `allocations` | ✓ 200 71B |
| `assets` | ✗ 404 106B |
| `sectors` | ✗ 404 107B |
| `holdings` | ✗ 404 108B |
| `composition` | ✗ 404 111B |
| `asset-allocation` | ✗ 404 116B |
| `stock-holdings` | ✗ 404 114B |
| `top-holdings` | ✗ 404 112B |
| `constituents` | ✗ 404 112B |
| `chart-price-panel` | ✓ 200 1722B |
| `left-panel` | ✓ 200 1050B |
| `summary` | ✗ 404 107B |
| `profile` | ✗ 404 107B |
| `fees` | ✗ 404 104B |

## 펀드별 보유종목 유무

| 표준코드 | 이름 | 유형 | 운용사 | 포트폴리오 | 자산구성 |
|---|---|---|---|:-:|:-:|
| K55235B39916 | 피델리티글로벌테크놀로지증권모투자신탁(주식-재간접형) | 해외주식형 | 피델리티자산운용 | · | · |
| K55309BY1419 | 골든브릿지으뜸단기증권투자신탁 1[채권] | 국내채권형 | 골든브릿지자산운용 | · | ○ |
| K55309BQ0684 | 골든브릿지스마트단기채증권투자신탁 1[채권] | 국내채권형 | 골든브릿지자산운용 | · | ○ |
| K55235249622 | 피델리티글로벌인컴증권모투자신탁H(채권-재간접형) | 해외채권형 | 피델리티자산운용 | · | · |
| K55235249630 | 피델리티글로벌인컴증권모투자신탁UH(채권-재간접형) | 해외채권형 | 피델리티자산운용 | · | · |
| K55235B04290 | 피델리티글로벌금융주증권자투자신탁PRS(주식-재간접형) | 해외주식형 | 피델리티자산운용 | · | · |
| K55235B04308 | 피델리티글로벌금융주증권자투자신탁(주식-재간접형)PRS-e | 해외주식형 | 피델리티자산운용 | · | · |
| K55105AS1091 | 삼성클래식인디아연금증권자투자신탁UH[주식] | 해외주식형 | 삼성자산운용 | ○ | ○ |
| K55105AZ7255 | 삼성스마트MMF법인 1Cp(퇴직연금) | MMF | 삼성자산운용 | · | ○ |
| K55105B00244 | 삼성KODEX단기채권PLUS증권상장지수투자신탁[채권] | 국내채권형 | 삼성자산운용 | · | ○ |
| K55105B00640 | 삼성아문디파이어니어스트래티직인컴증권모투자신탁[채권-재간접형] | 해외채권형 | 삼성자산운용 | · | ○ |
| K55205AJ1893 | 미래에셋안정증권자투자신탁 1[채권혼합]종류C | 국내혼합형 | 미래에셋자산운용 | ○ | ○ |

### 삼성클래식인디아연금증권자투자신탁UH[주식] — 포트폴리오

```json
{"result":[{"itemCode":"INE090A01021","itemName":"ICICI BANK LTD","weight":0.090869256},{"itemCode":"INE040A01034","itemName":"HDFC BANK LIMITED","weight":0.085959615},{"itemCode":"INE002A01018","itemName":"RELIANCE INDUSTRIES LIMITED","weight":0.065519809},{"itemCode":"INE062A01020","itemName":"STATE BANK OF INDIA","weight":0.037130897},{"itemCode":"INE238A01034","itemName":"AXIS BANK LTD","weight":0.035564228},{"itemCode":"INE018A01030","itemName":"LARSEN & TOUBRO LTD","weight":0.030486672},{"itemCode":"INE0AG901020","itemName":"Ceigall India Ltd","weight":0.024840534},{"itemCode":"INE497B01018","itemName":"SEAMEC Ltd","weight":0.024349913},{"itemCode":"INE397D01024","itemName":"BHARTI AIRTEL LTD","weight":0.023733749},{"itemCode":"INE009A01021","itemName":"Infosys Ltd","weight":0.022006337},{"itemCode":"INE721A01047","itemName":"Shriram Finance Ltd","weight":0.020411678},{"itemCode":"
```

### 미래에셋안정증권자투자신탁 1[채권혼합]종류C — 포트폴리오

```json
{"result":[{"itemCode":"KR7388210007","itemName":"씨엠티엑스","weight":0.0527492},{"itemCode":"KR7098070006","itemName":"한텍","weight":0.041046213},{"itemCode":"KR7476830005","itemName":"알지노믹스","weight":0.035839785}]}
```
