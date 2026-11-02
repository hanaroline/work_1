# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-11-02T07:11:39.345Z

**1차 출처에서 조회 경로를 찾음 (전자공시 펀드검색(표준코드))**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1025.72 | 112672억 | 0.05~0.09% |
| K55107BJ2329 | 우리큰만족법인MMF 1(국공채) | MMF | 1028.11 | 92576억 | 0.078~0.098% |
| KR5223385430 | KB법인용MMF I-1(운용) | MMF | 1003.95 | 89640억 | 0.06~0.09% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5844.58 | 9225억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2474.08 | 8317억 | 0.45~1.35% |

## 접근 결과

| 사이트 | 등급 | 열림 | XHR | 표준코드 보임 | 대조 필드 보임 |
|---|---|:-:|---:|:-:|:-:|
| 전자공시 펀드공시 | 1차 | ✓ | 4 | · | · |
| 전자공시 펀드검색(표준코드) | 1차 | ✓ | 14 | ○ | ○ |
| 펀드다모아 | 1차 | ✓ | 18 | · | · |
| 펀드다모아(www) | 1차 | ✗ | 0 | · | · |
| 펀드닥터 (에프앤가이드) | 2차 | ✗ | 0 | · | · |
| 펀드닥터 펀드검색 | 2차 | ✗ | 0 | · | · |

## 잡힌 XHR (다음 시도의 출발점)

### 전자공시 펀드공시

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17936035006404294.024694482073` → 200
- `GET https://dis.kofia.or.kr/wq/fundann/DISFundAnnList.xml?postfix=17936035017091874.692799556843` → 307
- `GET https://dis.kofia.or.kr/common/error.html` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17936035019805011.20165254302` → 200

### 전자공시 펀드검색(표준코드)

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17936035085834479.170199937697` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/DISComFundSmryInfo.xml?postfix=17936035098184317.219810802317` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17936035099714163.264552571094` → 200
- `GET https://dis.kofia.or.kr/css/pop.css?postfix=17936035101156052.805925185333` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17936035102566841.257062138857` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17936035104144460.080005173509` → 200
- `POST https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/` → 200
  - POST: `<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISComFundNmSO</pfmSvcName>
    <pfmFnName>select</pfmFnName>
  </proframeHeade`
- `POST https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/` → 200
  - POST: `<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-COM</pfmAppName>
    <pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName>
    <pfmFnName>srchFile</pfmFnName>
  </profr`
- `POST https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/` → 200
  - POST: `<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-COM</pfmAppName>
    <pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName>
    <pfmFnName>srchFile</pfmFnName>
  </profr`
- `POST https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/` → 200
  - POST: `<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-COM</pfmAppName>
    <pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName>
    <pfmFnName>srchFile</pfmFnName>
  </profr`
- `POST https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/` → 200
  - POST: `<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISComConnLogSO</pfmSvcName>
    <pfmFnName>insertFndInqLog</pfmFnName>
  </pro`
- `POST https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/` → 200
  - POST: `<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-COM</pfmAppName>
    <pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName>
    <pfmFnName>fundBasInfoSrch</pfmFnName>
  `

### 펀드다모아

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17936035172464391.820241813453` → 200
- `GET https://dis.kofia.or.kr/wq/damoa/DISFundDamoaNotice.xml?postfix=17936035183777802.900052088605` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17936035185126838.078673502875` → 200
- `GET https://dis.kofia.or.kr/wq/com/gnb.xml?postfix=17936035186543110.9597134643063` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17936035187936533.786393380779` → 200
- `GET https://dis.kofia.or.kr/css/layout.css?postfix=17936035189271670.6499557152988` → 200
- `GET https://dis.kofia.or.kr/css/sub.css?postfix=17936035190655498.151785138941` → 200
- `GET https://dis.kofia.or.kr/wq/com/gnbTop.xml?postfix=17936035192004031.8915303806434` → 200
- `GET https://dis.kofia.or.kr/wq/com/snb.xml?postfix=17936035193425580.820316278381` → 200
- `GET https://dis.kofia.or.kr/wq/com/subTit.xml?postfix=17936035194764151.89327498841` → 200
- `GET https://dis.kofia.or.kr/wq/com/subTip.xml?postfix=17936035196111853.3954578325074` → 200
- `GET https://dis.kofia.or.kr/wq/com/quick.xml?postfix=17936035197462698.3392245941227` → 200
