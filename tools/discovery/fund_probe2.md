# 펀드 원천 탐색 2차 — 화면 관찰

조사 시각: 2026-08-28T15:37:39.590Z

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
| GET | `https://polling.finance.naver.com/api/realtime?_callback=window.__jindo2_callback._5210&query=SERVICE_INDEX%3AKOSPI%2CKOSDAQ%2CKPI200` |
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
| GET | `https://dis.kofia.or.kr/websquare/config.xml?postfix=17879314662491211.652552360718` |
| GET | `https://dis.kofia.or.kr/wq/main/main.xml?postfix=17879314676045741.223449884577` |
| GET | `https://dis.kofia.or.kr/wq/com/gnb.xml?postfix=17879314681859182.70664350825` |
| GET | `https://dis.kofia.or.kr/wq/com/gnbTop.xml?postfix=17879314689254872.460234492636` |
| GET | `https://dis.kofia.or.kr/wq/com/quick.xml?postfix=17879314691366421.792933128722` |
| GET | `https://dis.kofia.or.kr/wq/com/footer.xml?postfix=17879314693217870.649181504708` |
| GET | `https://dis.kofia.or.kr/wq/com/popup/multiPop.xml?postfix=17879314695074491.944461598513` |
| GET | `https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17879314696914222.190191897569` |
| GET | `https://dis.kofia.or.kr/js/cond/gnbTotalSearch.js?postfix=2026_08` |

## 금투협 펀드공시(통합검색)

- 요청 주소: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeStstCom.xml`
- 최종 도착: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeStstCom.xml`
- 제목: 금융투자협회
- 기록한 요청: 3건

| 방식 | 주소 |
|---|---|
| GET | `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeStstCom.xml` |
| GET | `https://dis.kofia.or.kr/websquare/config.xml?postfix=17879314710396088.586159371242` |
| GET | `https://dis.kofia.or.kr/wq/fundann/DISFundFeeStstCom.xml?postfix=17879314725823232.511238407748` |

## 금투협 펀드 자산구성

- 요청 주소: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAssetStst.xml`
- 최종 도착: `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAssetStst.xml`
- 제목: 금융투자협회
- 기록한 요청: 3건

| 방식 | 주소 |
|---|---|
| GET | `https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundAssetStst.xml` |
| GET | `https://dis.kofia.or.kr/websquare/config.xml?postfix=17879314772236284.579709615359` |
| GET | `https://dis.kofia.or.kr/wq/fundann/DISFundAssetStst.xml?postfix=1787931478764723.6510284964081` |

## 펀드다모아

- 요청 주소: `https://fundamoa.kofia.or.kr/`
- 최종 도착: `https://fundamoa.kofia.or.kr/`
- 제목: 펀드다모아
- 기록한 요청: 0건

## 제로인 펀드닥터

- 요청 주소: `https://www.funddoctor.co.kr/`
- 최종 도착: `https://www.funddoctor.co.kr/#0`
- 제목: 펀드닥터
- 기록한 요청: 7건

| 방식 | 주소 |
|---|---|
| GET | `https://www.google.com/recaptcha/api.js` |
| POST | `https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je68q1h1v9136902590za20g&_p=1787931487648&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=1688012500.17` |
| GET | `https://www.funddoctor.co.kr/static/image/common/icon_search.svg` |
| GET | `https://www.google.com/recaptcha/api2/anchor?ar=1&k=6LcqaAgpAAAAACv26quLzq3mkW_G2mlFrLl0Y3KY&co=aHR0cHM6Ly93d3cuZnVuZGRvY3Rvci5jby5rcjo0NDM.&hl=en&v=ox8dsmiqR62P1bqhciWOn7Fg&size=n` |
| GET | `https://www.google.com/recaptcha/api2/webworker.js?hl=en&v=ox8dsmiqR62P1bqhciWOn7Fg` |
| GET | `https://www.gstatic.com/recaptcha/api2/logo_48.png` |
| GET | `https://www.google.com/recaptcha/api2/bframe?hl=en&v=ox8dsmiqR62P1bqhciWOn7Fg&k=6LcqaAgpAAAAACv26quLzq3mkW_G2mlFrLl0Y3KY&bft=0dAFcWeA4_SSmgEG1KV7V3mmYRb9oFRA3gxfDVn0tIwIF7NzYyz0ZIk` |

화면에 보인 글:

```
Home Fund My펀드 Contact 회원가입 로그인
이전 이용약관 신규 이용약관
오늘 이창 열지않음
-->
펀드닥터는 데이터로 이야기합니다.
펀드평가의 올바른 기준
펀드 평가
펀드시장에 대한 모니터링과 분석으로 양질의 정보를 제공하고자 노력합니다.
더보기
문의하기
master@kggroup.co.kr
 
보내기
footer menu
제로인 소개
개인정보처리방침
약관 및 유의사항
제휴 및 광고문의
서울시 중구 통일로 92 케이지타워 17층 04517   대표이사 : 한수혁   사업자등록번호 : 207-81-45704   통신판매업신고번호 : 제19-2169   메일문의 : master@zeroin.co.kr
개인정보관리책임자 : 김홍록 실장    (주)KG제로인은 자본시장과 금융투자업에 관한 법률 제258조 제1항의 규정에 의해 금융위원회에 등록(등록번호 : 2004-05-01)된 집합투자기구평가회사입니다.
Copyright KG ZEROIN All rights reserved.
```

## 재현 결과

| 출처 | 방식 | 주소 | 결과 |
|---|---|---|---|
| 네이버 펀드 | GET | `https://polling.finance.naver.com/api/realtime?_callback=window.__jindo2_callback._5210&query=SERVICE_INDEX%3AKOSPI%2CKO` | ✓ 200 573B |