# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-09-21T05:48:49.429Z

**1차 출처에서 조회 경로를 찾음 (전자공시 펀드검색(표준코드))**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1021.74 | 117947억 | 0.05~0.09% |
| KR5223385430 | KB법인용MMF I-1(운용) | MMF | 1000 | 89192억 | 0.06~0.09% |
| K55107BJ2329 | 우리큰만족법인MMF 1(국공채) | MMF | 1024.21 | 86490억 | 0.078~0.098% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5707.74 | 9221억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2682.09 | 8311억 | 0.45~1.35% |

## 접근 결과

| 사이트 | 등급 | 열림 | XHR | 표준코드 보임 | 대조 필드 보임 |
|---|---|:-:|---:|:-:|:-:|
| 전자공시 펀드공시 | 1차 | ✓ | 4 | · | · |
| 전자공시 펀드검색(표준코드) | 1차 | ✓ | 14 | ○ | ○ |
| 펀드다모아 | 1차 | ✓ | 0 | · | · |
| 펀드다모아(www) | 1차 | ✗ | 0 | · | · |
| 펀드닥터 (에프앤가이드) | 2차 | ✓ | 4 | · | · |
| 펀드닥터 펀드검색 | 2차 | ✓ | 4 | · | · |

## 잡힌 XHR (다음 시도의 출발점)

### 전자공시 펀드공시

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17899697316971353.0636720091138` → 200
- `GET https://dis.kofia.or.kr/wq/fundann/DISFundAnnList.xml?postfix=17899697331122884.385227634911` → 307
- `GET https://dis.kofia.or.kr/common/error.html` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17899697334478308.624350581646` → 200

### 전자공시 펀드검색(표준코드)

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17899697401747828.152356625853` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/DISComFundSmryInfo.xml?postfix=17899697415898475.987798772863` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17899697417755203.317005853061` → 200
- `GET https://dis.kofia.or.kr/css/pop.css?postfix=17899697419474385.042402603859` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17899697421184854.812069054384` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17899697423053693.639424292027` → 200
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

### 펀드닥터 (에프앤가이드)

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=644203831&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2F&_u=YCDAgUABAAAAACAAI~&jid=1565942832&gjid=1531249008&cid=1621537459.1789969756&tid=UA-150939181-1&_gid=1440944389.1789969757&_slc=1&gtm=45He69g1n81WSBDNCLza200xf1&gcd=13l3l3l3l1l1&dma=0&tag_exp=115616986~115938466~115938469~118897920~118897930~119791749~120385423~120469145~120469153&z=839518897` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je69g1v9136902590za20gxf1&_p=1789969756159&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=1621537459.1789969756&frm=0&pscdl=noapi&rcb=9&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115616986~115938466~115938469~118897920~118897930~120213116~120385422~120469145~120469153&sid=1789969756&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_nsi=1&_ss=1&tfd=1617` → 204
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=1621537459.1789969756&jid=1565942832&gjid=1531249008&_gid=1440944389.1789969757&_u=YCDAgUABAAAAAGAAI~&z=47402761` → 200
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200

### 펀드닥터 펀드검색

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=1234099954&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2Fafn%2Ffund%2Ffdlist.jsp&_u=aGDAgUABAAAAACAAI~&jid=185878950&gjid=1596625585&cid=1968470697.1789969767&tid=UA-150939181-1&_gid=1163104424.1789969767&_slc=1&gtm=45He69g1n81WSBDNCLza200xf1&gcd=13l3l3l3l1l1&dma=0&tag_exp=115938466~115938468~118897920~118897930~120385422~120469145~120469153&z=1487867318` → 200
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=1968470697.1789969767&jid=185878950&gjid=1596625585&_gid=1163104424.1789969767&_u=aGDAgUABAAAAAGAAI~&z=304516316` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je69g1v9136902590za20gxf1&_p=1789969764622&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=1968470697.1789969767&frm=0&pscdl=noapi&rcb=6&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115938466~115938468~118897920~118897930~120213116~120385423~120469145~120469153&sid=1789969766&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_ss=1&tfd=2810` → 204
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200
