# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-09-09T00:24:14.387Z

**1차 출처에서 조회 경로를 찾음 (전자공시 펀드검색(표준코드))**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1020.81 | 118078억 | 0.051~0.09% |
| K55107BJ2329 | 우리큰만족법인MMF 1(국공채) | MMF | 1023.33 | 97494억 | 0.078~0.098% |
| KR5234472706 | IBK그랑프리국공채MMF법인투자신탁 1[국공채] | MMF | 1018.37 | 93457억 | 0.093~0.168% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5771.29 | 9218억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2765.89 | 8331억 | 0.45~1.35% |

## 접근 결과

| 사이트 | 등급 | 열림 | XHR | 표준코드 보임 | 대조 필드 보임 |
|---|---|:-:|---:|:-:|:-:|
| 전자공시 펀드공시 | 1차 | ✓ | 4 | · | · |
| 전자공시 펀드검색(표준코드) | 1차 | ✓ | 14 | ○ | ○ |
| 펀드다모아 | 1차 | ✓ | 0 | · | · |
| 펀드다모아(www) | 1차 | ✗ | 0 | · | · |
| 펀드닥터 (에프앤가이드) | 2차 | ✗ | 0 | · | · |
| 펀드닥터 펀드검색 | 2차 | ✗ | 0 | · | · |

## 잡힌 XHR (다음 시도의 출발점)

### 전자공시 펀드공시

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17889134559619927.11756133806` → 200
- `GET https://dis.kofia.or.kr/wq/fundann/DISFundAnnList.xml?postfix=17889134573125824.176699157008` → 307
- `GET https://dis.kofia.or.kr/common/error.html` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=1788913457635471.8452145861007` → 200

### 전자공시 펀드검색(표준코드)

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17889134643614215.991730331423` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/DISComFundSmryInfo.xml?postfix=17889134657604348.497482442193` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=1788913465947554.2200357958582` → 200
- `GET https://dis.kofia.or.kr/css/pop.css?postfix=17889134661232085.163984503908` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17889134662967327.631119537079` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17889134664846290.337070805991` → 200
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
