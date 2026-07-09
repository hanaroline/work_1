# 종목 통합 리포트 대시보드

주식 종목명 또는 종목코드를 입력하면 해당 종목의 **시세 · 증권사 투자의견/레포트 · 시황(뉴스) · 재무제표**를
**한 장의 리포트**처럼 보여주는 단일 HTML 대시보드입니다. 빌드 도구 없이 `index.html` 하나로 동작합니다.

## 화면 구성

| 섹션 | 내용 |
|------|------|
| **종목 요약** | 종목명·코드·시장(KOSPI/KOSDAQ), 현재가·등락, 시가총액, PER/PBR/EPS |
| **시세** | 가격 차트(1M/3M/6M/1Y 토글) + 거래량, 52주 최고/최저, 전일종가 |
| **증권사 투자의견** | 목표주가 밴드(최저·평균·최고 vs 현재가), 상승여력, 매수/중립/매도 의견분포, 최근 레포트 목록 |
| **시황 · 뉴스** | 종목 관련 최신 뉴스 헤드라인 |
| **재무제표** | 연간 손익(매출·영업이익·순이익) 차트 + 표, 재무상태(자산·부채·자본), ROE·부채비율 |

- 라이트/다크 테마 전환(◐ 버튼), 상태 저장(localStorage)
- 인쇄/PDF 저장(🖨 버튼, A4 한 장 지향 `@media print`)
- 종목명 자동완성(주요 KOSPI/KOSDAQ 종목 내장), 6자리 코드 직접 입력 지원

## 실행 방법

### 방법 1) 단일 파일 (가장 간단)

`standalone.html` **한 파일**에 CSS·JS·차트 라이브러리·데이터가 모두 인라인되어 있습니다.
별도 서버 없이 파일을 브라우저로 열기만 하면(더블클릭) 바로 동작합니다.

```
standalone.html  ← 이 파일만 열면 됨
```

### 방법 2) 분리 파일 + 로컬 서버 (개발용)

`index.html`은 `data/*.js`, `vendor/*.js`를 외부에서 로드하므로 로컬 서버로 열어야 합니다
(파일 프로토콜로 열면 브라우저 보안정책에 막힐 수 있음).

```bash
# 저장소 루트에서
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

> `standalone.html`은 `index.html` + `data/*.js` + `vendor/chart.umd.js`를 합쳐 생성한 산출물입니다.
> 소스를 수정할 때는 `index.html` / `data/*.js`를 고친 뒤 다시 합치면 됩니다.

## 데이터 소스

무료 공개 소스를 우선 사용하고, 실패 시 **섹션별로 샘플 데이터로 폴백**합니다.
각 섹션에는 `실시간` / `샘플` 배지가 표시됩니다.

| 섹션 | 실시간 소스 | 폴백 |
|------|-------------|------|
| 시세/현재가/차트 | Yahoo Finance `v8/finance/chart/{code}.KS\|.KQ` | 내장 샘플 |
| 재무제표 | Yahoo Finance `v10/finance/quoteSummary` (손익/재무상태) | 내장 샘플 |
| 투자의견/목표주가 | Yahoo Finance `quoteSummary` (financialData, recommendationTrend) | 내장 샘플 |
| 시황/뉴스 | Google News RSS(`news.google.com/rss/search`) | 내장 샘플 |
| 증권사 레포트 목록 | (실시간 API 부재) | 예시 데이터 + 네이버 리서치 딥링크 |

> 증권사 원문 리포트(PDF)는 공개 API가 없어, 목록은 예시로 채우고
> [네이버 금융 리서치](https://finance.naver.com/research/)로 연결되는 딥링크를 제공합니다.

### 브라우저 CORS 안내

순수 브라우저(단일 HTML)에서 위 API를 직접 호출하면 **CORS로 차단**되는 경우가 많습니다.
이를 위해 `index.html`의 `PROXIES` 배열에 **CORS 프록시 폴백**이 설정되어 있습니다.

```js
var PROXIES = [
  function (u) { return u; },                                              // 1) 직접 호출
  function (u) { return "https://corsproxy.io/?url=" + encodeURIComponent(u); },      // 2) 프록시
  function (u) { return "https://api.allorigins.win/raw?url=" + encodeURIComponent(u); } // 3) 프록시
];
```

- 사내망/폐쇄망 등으로 외부 접근이 막히면 세 경로 모두 실패하고 **샘플 데이터**로 표시됩니다(화면은 항상 정상 렌더).
- 안정적인 실시간 연동이 필요하면, 자체 백엔드 프록시(예: `/api/proxy?url=...`)를 만들어 `PROXIES`에 추가하는 것을 권장합니다.
- 미래에셋 **사내 API**가 있다면 `fetchYahoo` / `fetchNews`를 사내 엔드포인트 호출로 교체하면 됩니다.

## 파일 구조

```
index.html            # 대시보드 (레이아웃 + CSS + 앱 로직)
vendor/chart.umd.js   # Chart.js 4.4.1 로컬 번들 (CDN 차단 환경 대비, 실패 시 CDN 폴백)
data/tickers.js       # 종목명↔코드↔시장 매핑 + 조회 함수
data/sample.js        # 샘플/폴백 데이터 생성기 (종목코드 시드 기반 결정적 생성)
```

## 종목 추가

`data/tickers.js`의 `TICKERS` 배열에 `{ code, name, market, aliases }` 항목을 추가하면
자동완성·조회에 반영됩니다. 미등록 종목도 6자리 코드로 조회할 수 있습니다.

## 유의사항

본 화면은 정보 제공 목적의 참고 자료이며, 투자 판단과 그 결과에 대한 책임은 이용자에게 있습니다.
샘플 데이터는 실제 수치가 아닌 예시입니다.
