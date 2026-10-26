# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-10-26T05:43:45.960Z

**1차 출처에서 조회 경로를 찾음 (전자공시 펀드검색(표준코드))**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1025.05 | 115390억 | 0.05~0.09% |
| KR5223385430 | KB법인용MMF I-1(운용) | MMF | 1003.29 | 92927억 | 0.06~0.09% |
| K55107BJ2329 | 우리큰만족법인MMF 1(국공채) | MMF | 1027.45 | 91877억 | 0.078~0.098% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5844.65 | 9220억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2365.82 | 8315억 | 0.45~1.35% |

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

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17929934273354814.1929961880805` → 200
- `GET https://dis.kofia.or.kr/wq/fundann/DISFundAnnList.xml?postfix=1792993428552923.0421155981284` → 307
- `GET https://dis.kofia.or.kr/common/error.html` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17929934288119671.600257841797` → 200

### 전자공시 펀드검색(표준코드)

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17929934354322577.003462359875` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/DISComFundSmryInfo.xml?postfix=17929934365691974.3327121381649` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17929934367229425.371741858366` → 200
- `GET https://dis.kofia.or.kr/css/pop.css?postfix=17929934368649985.875172495666` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17929934370017087.889591244158` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17929934371605430.81612251852` → 200
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

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17929934439536945.553358864625` → 200
- `GET https://dis.kofia.or.kr/wq/damoa/DISFundDamoaNotice.xml?postfix=17929934450883792.190603710306` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17929934452216723.661528779332` → 200
- `GET https://dis.kofia.or.kr/wq/com/gnb.xml?postfix=17929934453715942.198434679264` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17929934455134247.539455578536` → 200
- `GET https://dis.kofia.or.kr/css/layout.css?postfix=17929934456471821.1064964420054` → 200
- `GET https://dis.kofia.or.kr/css/sub.css?postfix=17929934457826117.21261745541` → 200
- `GET https://dis.kofia.or.kr/wq/com/gnbTop.xml?postfix=17929934459195497.316414191667` → 200
- `GET https://dis.kofia.or.kr/wq/com/snb.xml?postfix=17929934460607348.559704796049` → 200
- `GET https://dis.kofia.or.kr/wq/com/subTit.xml?postfix=17929934461952438.290188133526` → 200
- `GET https://dis.kofia.or.kr/wq/com/subTip.xml?postfix=1792993446328262.6759037441295` → 200
- `GET https://dis.kofia.or.kr/wq/com/quick.xml?postfix=17929934464595721.830924310762` → 200
