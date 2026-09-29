# ETF 편입종목 화면 — 1단계 원천 확인 (2026-09-29)

원자료: `etf_src_probe.json` / `etf_src_probe.md` (러너에서 한 번씩 호출, 2026-09-29 05:07 UTC)

## 어디서 도는가
- 클로드 세션 컨테이너: 네이버·야후·KRX·etfcheck 모두 CONNECT 403 → **수집은 러너(GitHub Actions) 몫**.

## 국내 (네이버) — 쓸 수 있음
| 필요한 것 | 원천 | 확인 |
|---|---|---|
| 전 종목 목록 | `finance.naver.com/api/sise/etfItemList.nhn` | 1,171종목, 순자산(marketSum, 억원)·NAV·3개월 수익률 |
| 상위10 편입종목 | `m.stock.naver.com/api/stock/{code}/etfAnalysis` → `etfTop10MajorConstituentAssets` | 종목코드·이름·수량·비중. **채권형은 비중이 `"-"`** (453850: 10개 전부) → 비중 모름으로 둬야 함 |
| 섹터·자산·국가 비중 | 같은 응답 `sectorPortfolioList`·`assetPortfolioList`·`countryPortfolioList` | 섹터 12코드(IT … UNCLASSIFIED, REAL_ESTATE) = 요청하신 12개와 1:1. 현금은 `CASH` |
| 운용사·기초지수·총보수·괴리율·추적오차·상장일·분배율(TTM) | 같은 응답 | issuerName, etfBaseIndex, totalFee, deviationRate, chaseErrorRate, listedDate, dividend.dividendYieldTtm |
| 3개월 자금 유입 | 같은 응답 `cumulativeNetInflowList.cumulativeNetInflow3m` | "1조 8,838억" 같은 글자 → 파싱 필요 |
| 원가격 일봉 | `api.finance.naver.com/siseJson.naver` | 069500: 2015-01-02부터 2,881봉, 수정주가 아님 |
| 분배금 이력 | 네이버 `/dividend/history` **404** | 아직 없음 → 총수익률에 필요, 2단계에서 더 찾음(후보: 야후 `.KS` 차트 events=div, 069500 36건) |

- 네이버 **발표 수익률**(`returnPerformanceList`)도 오지만 화면엔 쓰지 않음 — [6] 수익률 기준 탭 대조용으로만.
- `fchart`는 장중 오늘(09-29) 봉까지 줌 → 확정 안 된 봉은 빼야 함.

## KRX — 막힘 (까닭이 IP가 아님)
- 러너(미국 IP)에서도 첫 화면이 `alert('로그인 또는 회원가입이 필요합니다.')`, JSON 은 `400 LOGOUT`.
- **회사 IP 차단이 아니라 로그인 요구**로 보임.

## 야후 — 해외는 쓸 수 있음, 국내·중국 본토는 편입종목 0
| 종목 | quoteType | 상위 편입 | 비고 |
|---|---|---|---|
| SPY, QQQ | ETF | 10 | 비중 있음 |
| AGG | ETF | **1** (현금펀드만) | 채권형은 빈약 |
| 2800.HK, 3033.HK | ETF | 10 | |
| 1306.T, 1321.T | ETF | 10 | |
| 510300.SS, 159919.SZ | **EQUITY** | 0 | 본토는 종류부터 ETF 로 안 잡힘 |
| 069500.KS, 360750.KS | ETF | 0 | 말씀하신 대로 국내 0 |
| 069500.KQ | — | 404 | 이 코드에선 엉뚱한 펀드가 안 잡힘(다른 코드는 2단계에서 확인) |

- 일봉(chart, 10년, adjclose 있음): SPY 2,512봉 결측 0 / 2800.HK 결측 2 / 1306.T 결측 1 / 069500.KS **결측 27** → "날짜는 있고 종가가 빈" 봉 실재.
- 목록(스크리너, 순자산 순): 미국 5,996 / 홍콩 352 / 일본 477 / **중국 0** → 본토 목록은 다른 길 필요.
- 환율: KRW=X, HKDKRW=X, JPYKRW=X, CNYKRW=X 모두 됨.

## 중국 본토 편입종목
- 야후 0개, eastmoney 보유종목 주소는 러너에서 404 → 이번 탐침으론 "주는 데가 없다"를 뒤집지 못함(단 eastmoney 404 는 주소가 바뀐 탓일 수도 있어 확정은 아님).

## 기타
- 네이버 해외(미국 ETF) 편입종목 주소 404. 미국 목록은 nasdaq 스크리너(5,254)도 됨.
