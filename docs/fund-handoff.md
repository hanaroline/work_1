# 펀드 화면 — 인수인계

ETF 화면(`etf.html`)과 같은 구성으로 **국내 설정 공모펀드** 화면을 만드는
작업의 출발점입니다. 원천 조사는 끝났고 수집기·화면은 아직 없습니다.

이 문서는 ETF 세션에서 확인한 것만 적습니다. **짐작은 적지 않았습니다.**
확인 경로는 `tools/discovery/fund_probe*.md`, `fund_naver*.md` 에 있습니다.

---

## 범위

사용자가 정한 것 그대로입니다.

> "국내 설정 펀드를 투자지역으로 나누는 것임"

곧 **국내에 설정된 공모펀드를, 투자 지역(국내/해외)으로 가른** 화면입니다.
해외에 설정된 뮤추얼펀드가 아닙니다.

---

## 원천 — 네이버 Npay 증권

`stock.naver.com` 입니다. `finance.naver.com/fund/` 는 죽었습니다.

> **주의.** 옛 주소가 일반 증권 홈으로 넘어가는 것을 보고 "펀드 서비스가
> 없어졌다" 고 단정해 금투협을 여섯 차례 헛팠습니다. 사용자가 화면 사진을
> 주어 바로잡혔습니다. 넘어간 곳만 보고 단정하지 마십시오.

### 목록

```
GET https://stock.naver.com/api/fund/funds?page={0..159}&size=20
```

- **`size` 상한이 20 입니다.** 50·100 은 HTTP 400 입니다.
- 총 **3,196 개**, 160 페이지. 응답 meta 에 `totalCount`·`hasNext` 가 옵니다.
- `sort=return3m` 같은 정렬 인자를 받습니다.
- 주는 것: `fundCode`(금투협 표준코드, 예 `K55235B39916`), `fundName`,
  `riskGrade`, `nav`, `basePrice`, `returnIndex`, `returnRate1m/3m/6m/1y/3y/5y`,
  `tradeDate`, `changePrice`, `totalFee`, `preSalesFee`, `postSalesFee`,
  `pcUrl`, `mobileUrl`
- **없는 것: 유형·운용사·설정액.** 그래서 펀드마다 `left-panel` 을 또 불러야 합니다.

### 상세 (모두 브라우저 없이 재현됨)

```
GET https://stock.naver.com/api/fund/funds/{fundCode}/left-panel
                                          /fund-performance
                                          /chart-price-panel
                                          /base-price/chart
                                          /prices/daily
                                          /metrics/detail
                                          /classes/returns
```

`left-panel.detail` 의 주요 필드:

```json
{ "fundCode": "K55235B39916",
  "fundName": "피델리티글로벌테크놀로지증권모투자신탁(주식-재간접형)",
  "basePrice": "5956.79", "returnIndex": 0.2365916,
  "parentPeerGroupName": "해외주식형",          // ← 유형
  "derivedAum": "774093701808",                // 설정액
  "derivedNav": "4611116881228",               // 순자산
  "inceptionDate": "2015-06-17",
  "companyName": "피델리티자산운용",
  "benchmarkName": "MSCI AC WORLD INDEX (KRW Unhedged)",
  "totalFee": null, "managementFee": null, "salesFee": null }
```

`fund-performance` 는 **ETF 에 없던 것**을 줍니다 — 기간마다 세 값입니다.

```json
"returns": [
  { "term": "1m", "fundReturn": 7.249547,
    "benchmarkReturn": -1.9567338, "peerCompanyReturn": null }
]
```

`metrics/detail` 은 표준편차·추적오차·샤프·정보비율·젠센알파·베타를 줍니다
(`fundMetric`). 옆에 `peerMetric` 자리가 있으나 표본에서는 `null` 이었습니다.

### 보유종목

```
chart-price-panel.allocationsPortfolio.result[]
  -> { itemCode(ISIN), itemName, weight(소수) }
```

`availability` 가 유형별로 갈립니다. 60종목 표본:

| 유형 | 표본 | 보유종목 있음 | 종목수(중앙) |
|---|---:|---:|---:|
| 국내주식형 | 9 | **9 (100%)** | **72** |
| 국내혼합형 | 11 | **10** | 44 |
| 해외주식형 | 16 | **13** | 40 |
| 해외혼합형 | 8 | 5 | 38 |
| 기타형 | 6 | 1 | 2 |
| 해외채권형 | 2 | 1 | 1 |
| 국내채권형 | 6 | **0** | – |
| MMF | 1 | **0** | – |
| 국내대체 | 1 | 1 | 196 |

**주식형·혼합형은 나오고 채권형·MMF 는 없습니다.** 재간접형이 비는 것도
당연합니다 — 다른 펀드를 담으니 개별 종목이 없습니다.

ETF 는 상위 10개만 받았지만 펀드는 **전체 보유종목**(40~72개)을 줍니다.

### 안 되는 것

**총보수를 못 받습니다.** 60종목 중 59종목에서 `totalFee: null` 입니다.
목록·상세 모두 그렇습니다. 보수 비교는 이 원천으로 못 만듭니다 —
화면에서 빼거나 다른 원천을 찾아야 합니다.

---

## 아직 안 풀린 것

**단기채권 펀드의 1개월 수익률이 244.9% 로 옵니다.**
(골든브릿지으뜸단기증권투자신탁 1[채권], 기준가 3,361.5)

처음에는 "목록이 설정 이후 누적을 준다" 고 의심했는데 **틀렸습니다** —
목록과 상세를 16종목 대조하니 **16/16 완전 일치**했습니다. 즉 원천 불일치가
아니라 네이버가 두 곳에 같은 값을 싣고 있습니다.

기준가 3,361.5 는 설정 1,000 기준 3.36배이고 244.9% 와 가깝습니다. 일부
펀드에 설정 이후 누적이 실릴 가능성이 남아 있습니다. **화면을 만들기 전에
`base-price/chart` 의 기준가 시계열에서 직접 다시 계산해 검산하십시오.**
ETF 에서 쓴 방법 그대로입니다.

---

## ETF 작업에서 얻은 것 — 그대로 가져가십시오

ETF 화면은 사용자가 "수익률이 엉터리야" 라고 지적하면서 1,348종목 전수
감사를 했고, **794종목에서 오류**가 나왔습니다. 같은 함정이 펀드에도 있습니다.

### 1. 전수 감사를 관문으로 걸 것

`scripts/audit_etf_data.mjs` 를 그대로 본떠 `audit_fund_data.mjs` 를
만드십시오. 바깥 자료에 붙지 않고 **데이터 안에서 서로 어긋나는 것만** 잡습니다.
안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 것도 없이 틀린 것입니다.

일일 수집 워크플로의 커밋 **앞**에 두어, 오류가 있으면 커밋되지 않게 합니다.

### 2. `Number(null)` 은 `0` 이고 `Number.isFinite(0)` 은 `true`

이것 때문에 "비중 없음" 이 "비중 0%" 로 둔갑해 731종목의 화면이 거짓을
말했습니다. **null 여부를 먼저 보십시오.** 없는 것을 0 이라고 말하면
"안 담았다"·"겹치지 않는다" 는 거짓 진술이 됩니다.

펀드도 채권형·MMF 의 보유종목이 비므로 같은 자리가 옵니다.

### 3. 감사 규칙이 틀릴 수 있다 — 실물을 보고 물러설 것

처음 잡은 7,252건 중 대부분이 **제 규칙이 틀린** 오탐이었습니다.

| 잡은 것 | 실제 |
|---|---|
| 레버리지·선물형 비중 합 200% | 담보와 노출을 각각 적은 것 |
| 현금 −22% · 파생 −100% | 환매조건부·통화선도, 구조 그 자체 |
| 액티브 추적오차 25% | 지수를 그대로 안 따라가니 당연 |
| 1개월 내포분배율 연 56% | 연 1회 분배를 연율로 환산한 착각 |
| 2배 레버리지 1년 +843% | 기준가 +903% 와 맞는 실제 값 |

**마지막 것은 계산기 방어선에도 같은 착각이 들어가 있었습니다.** 연율로
걸었으면 정상값까지 버릴 뻔했습니다. 한도는 **누적**으로 거십시오.

### 4. 한 값이 깨지면 코호트 전체가 오염된다

총수익률 3,582% 짜리 한 종목이 국내 주식형 420종목의 유형 평균을 1년 기준
9.21%p 밀어 올렸고, 6개월은 **부호까지 뒤집었습니다**(+0.88% → −3.59%).
`audit_etf_data.mjs` 의 `유형평균-한종목이흔듦` 규칙을 가져가십시오.

### 5. 순위·유형평균은 상용 화면 관행을 따를 것

사용자가 모닝스타 기반 증권사 화면을 참조로 주었고, 그대로 맞췄습니다.

- 모집단은 **시장 전체가 아니라 동일 유형** 안에서
- 등수가 아니라 **백분율 순위 하나** (1 이 가장 좋음)
- **그 기간에 값이 있는 종목 수를 기간마다 따로** 적는다
- 유형 평균은 **산술평균 하나**. 중앙값을 같이 내는 곳은 없다

펀드는 `parentPeerGroupName`(해외주식형 등)이 **이미 유형 이름**이므로
ETF 처럼 우리가 분류를 지어낼 필요가 없습니다. 그걸 쓰십시오.

### 6. `continue-on-error` 가 죽음을 가린다

워크플로 단계가 **0초 만에 끝나고 success 로 찍히는** 일을 이 세션에서
두 번 겪었습니다. 스크립트에 `unhandledRejection` 처리를 넣어 지금까지
알아낸 것을 파일로 남기고 종료 코드 1 로 끝내십시오.

### 7. 이름이 같다고 뜻이 같지 않다

- 네이버가 "시장가" 라고 부른 것이 실은 **수정주가**였습니다.
- 상용 화면의 "PRICE(수정주가 기준)" 가 우리 `tr`(총수익률)과 소수점까지
  같았습니다. 우리 `price`(무보정 원가격)는 상용 화면에 나오지 않습니다.
- 같은 ETF 의 총보수가 0.07% 와 0.05%, 추적오차가 5.74 와 0.41 로 왔습니다.
  **정의가 다른 값**입니다.

계열을 쓰기 전에 그 계열이 무엇인지 먼저 확인하십시오.

---

## 만들 것

ETF 쪽 파일을 본뜨면 됩니다.

| ETF | 펀드 |
|---|---|
| `scripts/collect_etf_kr.mjs` | `scripts/collect_fund_kr.mjs` |
| `scripts/build_etf_data.mjs` | `scripts/build_fund_data.mjs` |
| `scripts/audit_etf_data.mjs` | `scripts/audit_fund_data.mjs` |
| `scripts/test_etf_page.mjs` | `scripts/test_fund_page.mjs` |
| `etf.html` → `etf-holdings-search.html` | `fund.html` → `fund-search.html` |
| `.github/workflows/etf-daily.yml` | `.github/workflows/fund-daily.yml` |

호출량은 목록 160 + 펀드당 2회(`left-panel`·`chart-price-panel`) ≈ **6,550회**
입니다. 동시 6개로 15~20분 걸립니다.

`scripts/etf_lib.mjs` 의 `getJson`·`mapLimit`·`writeDataFile`·`assertEnough` 를
그대로 쓰십시오. **네트워크 경로는 하나여야 합니다** — 검증이 수집기와 다른
경로로 부르면 검증의 뜻이 없습니다(야후 429 사고가 이것이었습니다).

### ETF 와 다른 점

- **시장가가 없습니다.** 펀드는 기준가뿐이라 시장가/총수익률 구분이 생기지
  않습니다. ETF 에서 크게 헤맨 자리가 펀드에는 없습니다.
- **벤치마크 대비**가 원천에 있습니다(`benchmarkReturn`). ETF 에는 없던 칸입니다.
- **클래스**(A/C/S 등)가 있습니다. `classes/returns` 로 옵니다.
- **위험지표**(샤프·젠센알파·베타)가 원천에 있습니다.
- **총보수가 없습니다.**

---

## 세션 이그레스

이 저장소의 세션은 KRX·네이버·야후에 직접 못 붙습니다(CONNECT 403).
러너는 그 정책 밖이므로, 조사·수집은 GitHub Actions 에서 돌리고 결과를
저장소에 커밋하는 방식으로 합니다. `.github/workflows/etf-probe.yml` 과
`etf-daily.yml` 이 그 본입니다 — `push` 로도 발동하게 되어 있습니다.
