# 펀드 원천 탐색 2차 — 화면 관찰

조사 시각: 2026-08-28T15:19:07.595Z

경로를 찍어 맞히는 대신 화면을 열어 **실제로 무엇을 부르는지** 기록했다.
브라우저 없이 재현되는 것만 수집기에 쓸 수 있다.

## 네이버 펀드

- 요청 주소: `https://finance.naver.com/fund/`
- 최종 도착: `https://finance.naver.com/main/main.naver`
- 제목: Npay 증권
- 기록한 요청: 3건

| 방식 | 주소 |
|---|---|
| POST | `https://finance.naver.com/item/item_right_ajax.naver?type=mystock&code=000000&page=1&pageSize=30` |
| GET | `https://polling.finance.naver.com/api/realtime?_callback=window.__jindo2_callback._6219&query=SERVICE_INDEX%3AKOSPI%2CKOSDAQ%2CKPI200` |
| POST | `https://finance.naver.com/item/item_right_ajax.naver?type=recent&code=000000&page=1&pageSize=30` |

화면에 보인 글:

```
메인 메뉴로 바로가기
본문으로 바로가기
네이버
페이
증권
증권 종목명·지수명 검색
검색
자동완성
사용자 링크
로그인
서비스 더보기
증권 홈
선택됨
국내증시
해외증시
시장지표
리서치
뉴스
MY
 새로운 증권 보기
NEW
더 편리해진 증권을 만나보세요
본문시작
오늘의 코스피/코스닥 지수
2026년 08월 28일 장마감
코스피 지수 6,788.88 전일대비 하락 123.49 마이너스 1.79 퍼센트
코스닥 지수 838.41 전일대비 상승 0.76 플러스 0.09 퍼센트
새로운 증권 바로가기
최근조회종목
MY STOCK
최근 조회종목 리스트

최근조회 종목이 없습니다.

주요뉴스
9월 주총 앞두고 MBK·고려아연 공방…'최윤범 선행·원아시아 후속투자' 쟁점[주간사모펀드]
한가인 "주식 폭락 전 다 팔아"…"포폴 잘 짰네" 최근 매입 종목은?
“저희는 건강한 유증입니다”...확장 위해 3조 조달 선언한 삼바, 주가는 뚝
이장한 종근당 회장, 지분 전량 세 자녀 증여…장남 지분 5.32%로
"따따블은 무슨 본전도 못 건졌다"…쓴맛 본 개미들 '눈물' [분석+]
“지식산업센터 거래 살아났다?”…속내 들여다보니 '부실 털기'
주요뉴스 더보기
TOP 종목
KRX
NXT
넥스
```

## 금투협 전자공시 홈

- 요청 주소: `https://dis.kofia.or.kr/`
- 최종 도착: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/main/main.xml`
- 제목: 금융투자협회 전자공시>메인
- 기록한 요청: 10건

| 방식 | 주소 |
|---|---|
| GET | `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/main/main.xml` |
| GET | `https://dis.kofia.or.kr/websquare/config.xml?postfix=17879303547814376.608421610072` |
| GET | `https://dis.kofia.or.kr/wq/main/main.xml?postfix=17879303561063393.657603532073` |
| GET | `https://dis.kofia.or.kr/wq/com/gnb.xml?postfix=17879303566741887.1975635741135` |
| GET | `https://dis.kofia.or.kr/wq/com/gnbTop.xml?postfix=17879303573949434.922768646558` |
| GET | `https://dis.kofia.or.kr/wq/com/quick.xml?postfix=17879303576031236.4875721065239` |
| GET | `https://dis.kofia.or.kr/wq/com/footer.xml?postfix=17879303577816922.853435793285` |
| GET | `https://dis.kofia.or.kr/wq/com/popup/multiPop.xml?postfix=17879303579623401.527374708576` |
| GET | `https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17879303581408753.49882166562` |
| GET | `https://dis.kofia.or.kr/js/cond/gnbTotalSearch.js?postfix=2026_08` |

## 금투협 펀드공시(통합검색)

- 요청 주소: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeStstCom.xml`
- 최종 도착: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeStstCom.xml`
- 제목: 금융투자협회
- 기록한 요청: 3건

| 방식 | 주소 |
|---|---|
| GET | `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeStstCom.xml` |
| GET | `https://dis.kofia.or.kr/websquare/config.xml?postfix=1787930359468269.87658566932527` |
| GET | `https://dis.kofia.or.kr/wq/fundann/DISFundFeeStstCom.xml?postfix=17879303609939124.340893476614` |

## 금투협 펀드 자산구성

- 요청 주소: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAssetStst.xml`
- 최종 도착: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAssetStst.xml`
- 제목: 금융투자협회
- 기록한 요청: 3건

| 방식 | 주소 |
|---|---|
| GET | `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAssetStst.xml` |
| GET | `https://dis.kofia.or.kr/websquare/config.xml?postfix=17879303655771933.6720903641935` |
| GET | `https://dis.kofia.or.kr/wq/fundann/DISFundAssetStst.xml?postfix=17879303670378204.47460066953` |

## 펀드다모아

- 요청 주소: `https://fundamoa.kofia.or.kr/`
- 최종 도착: `https://fundamoa.kofia.or.kr/`
- 제목: 펀드다모아
- 기록한 요청: 0건

## 제로인 펀드닥터

- 요청 주소: `https://www.funddoctor.co.kr/`
- 최종 도착: `(못 열림)` — page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "https://www.funddoctor.co.kr/", waiting until "domcontentloaded"

- 제목: –
- 기록한 요청: 0건

## 재현 결과

| 출처 | 방식 | 주소 | 결과 |
|---|---|---|---|
| 네이버 펀드 | GET | `https://polling.finance.naver.com/api/realtime?_callback=window.__jindo2_callback._6219&query=SERVICE_INDEX%3AKOSPI%2CKO` | ✓ 200 573B |