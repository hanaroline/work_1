# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-08-30T23:23:16.177Z

**1차 출처에서 조회 경로를 찾음 (전자공시 펀드검색(표준코드))**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1019.82 | 120328억 | 0.051~0.09% |
| KR5234472706 | IBK그랑프리국공채MMF법인투자신탁 1[국공채] | MMF | 1017.44 | 99093억 | 0.093~0.168% |
| K55107BJ2329 | 우리큰만족법인MMF 1(국공채) | MMF | 1022.37 | 97487억 | 0.078~0.098% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5762.73 | 9217억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2713.1 | 8344억 | 0.45~1.35% |

## 접근 결과

| 사이트 | 등급 | 열림 | XHR | 표준코드 보임 | 대조 필드 보임 |
|---|---|:-:|---:|:-:|:-:|
| 전자공시 펀드공시 | 1차 | ✓ | 4 | · | · |
| 전자공시 펀드검색(표준코드) | 1차 | ✓ | 14 | ○ | ○ |
| 펀드다모아 | 1차 | ✓ | 0 | · | · |
| 펀드다모아(www) | 1차 | ✗ | 0 | · | · |
| 펀드닥터 (에프앤가이드) | 2차 | ✗ | 0 | · | · |
| 펀드닥터 펀드검색 | 2차 | ✓ | 4 | · | · |

## 잡힌 XHR (다음 시도의 출발점)

### 전자공시 펀드공시

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17881321978788580.820220290798` → 200
- `GET https://dis.kofia.or.kr/wq/fundann/DISFundAnnList.xml?postfix=17881321991732619.5772707933597` → 307
- `GET https://dis.kofia.or.kr/common/error.html` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17881321994808608.693669450553` → 200

### 전자공시 펀드검색(표준코드)

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17881322062135365.642240914622` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/DISComFundSmryInfo.xml?postfix=17881322075644290.871222969549` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17881322077471349.719769251102` → 200
- `GET https://dis.kofia.or.kr/css/pop.css?postfix=17881322079181903.4165140917048` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17881322080807184.4084833725665` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17881322082661914.641514050527` → 200
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

### 펀드닥터 펀드검색

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=494759195&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2Fafn%2Ffund%2Ffdlist.jsp&_u=aGDAgUABAAAAACAAI~&jid=882385033&gjid=174522911&cid=1293654982.1788132224&tid=UA-150939181-1&_gid=1574424960.1788132224&_slc=1&gtm=45He68q1n81WSBDNCLza200&gcd=13l3l3l3l1l1&dma=0&tag_exp=115616985~115938466~115938469~118897920~118897930~120385422&z=1512764059` → 200
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=1293654982.1788132224&jid=882385033&gjid=174522911&_gid=1574424960.1788132224&_u=aGDAgUABAAAAAGAAI~&z=2115413633` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je68q1v9136902590za20g&_p=1788132221961&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=1293654982.1788132224&frm=0&pscdl=noapi&rcb=14&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115938466~115938469~118897920~118897930~120385423&sid=1788132224&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_ss=1&tfd=2921` → 204
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200
