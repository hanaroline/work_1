# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-11-09T07:32:39.293Z

**1차 출처에서 조회 경로를 찾음 (전자공시 펀드검색(표준코드))**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1026.38 | 119039억 | 0.05~0.09% |
| KR5234472706 | IBK그랑프리국공채MMF법인투자신탁 1[국공채] | MMF | 1023.78 | 95644억 | 0.093~0.168% |
| KR5223385430 | KB법인용MMF I-1(운용) | MMF | 1004.63 | 94672억 | 0.06~0.09% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5842.21 | 9230억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2310.33 | 8316억 | 0.45~1.35% |

## 접근 결과

| 사이트 | 등급 | 열림 | XHR | 표준코드 보임 | 대조 필드 보임 |
|---|---|:-:|---:|:-:|:-:|
| 전자공시 펀드공시 | 1차 | ✓ | 4 | · | · |
| 전자공시 펀드검색(표준코드) | 1차 | ✓ | 14 | ○ | ○ |
| 펀드다모아 | 1차 | ✓ | 18 | · | · |
| 펀드다모아(www) | 1차 | ✗ | 0 | · | · |
| 펀드닥터 (에프앤가이드) | 2차 | ✓ | 4 | · | · |
| 펀드닥터 펀드검색 | 2차 | ✓ | 4 | · | · |

## 잡힌 XHR (다음 시도의 출발점)

### 전자공시 펀드공시

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17942095606753305.3023215131507` → 200
- `GET https://dis.kofia.or.kr/wq/fundann/DISFundAnnList.xml?postfix=17942095618916250.6150900370685` → 307
- `GET https://dis.kofia.or.kr/common/error.html` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17942095622235536.6219613178055` → 200

### 전자공시 펀드검색(표준코드)

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17942095689312888.1399411192488` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/DISComFundSmryInfo.xml?postfix=17942095701382823.1340098803093` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17942095703233309.230103100359` → 200
- `GET https://dis.kofia.or.kr/css/pop.css?postfix=17942095704933862.070432743867` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17942095706687223.268218865123` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17942095708448135.684777270509` → 200
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

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17942095778694551.559682288498` → 200
- `GET https://dis.kofia.or.kr/wq/damoa/DISFundDamoaNotice.xml?postfix=17942095792186058.090785539014` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=1794209579382317.3597092169167` → 200
- `GET https://dis.kofia.or.kr/wq/com/gnb.xml?postfix=17942095795558251.35141709012` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17942095797245306.545928965578` → 200
- `GET https://dis.kofia.or.kr/css/layout.css?postfix=17942095799021483.731796599168` → 200
- `GET https://dis.kofia.or.kr/css/sub.css?postfix=17942095800689755.495021217936` → 200
- `GET https://dis.kofia.or.kr/wq/com/gnbTop.xml?postfix=17942095802385126.830784011599` → 200
- `GET https://dis.kofia.or.kr/wq/com/snb.xml?postfix=17942095804064263.815989939649` → 200
- `GET https://dis.kofia.or.kr/wq/com/subTit.xml?postfix=17942095805706582.234234543381` → 200
- `GET https://dis.kofia.or.kr/wq/com/subTip.xml?postfix=17942095807319195.986011995814` → 200
- `GET https://dis.kofia.or.kr/wq/com/quick.xml?postfix=17942095808967305.4217963257115` → 200

### 펀드닥터 (에프앤가이드)

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=20691967&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2F&_u=YCDAgEABAAAAACAAI~&jid=1179328516&gjid=1032396044&cid=814593811.1794209587&tid=UA-150939181-1&_gid=1107741806.1794209587&_slc=1&gtm=45He6b50h2n81WSBDNCLza200xf1&gcd=13l3l3l3l1l1&dma=0&tag_exp=115938465~115938468~118897920~118897930~120385423~120412526~120420414~120469145~120469153~121246026~121246034~123814183&z=922063679` → 200
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=814593811.1794209587&jid=1179328516&gjid=1032396044&_gid=1107741806.1794209587&_u=YCDAgEABAAAAAGAAI~&z=318789841` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je6b41v9136902590za20oxf1&_p=1794209586615&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=814593811.1794209587&frm=0&pscdl=noapi&rcb=14&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115938465~115938468~118897920~118897930~120213116~120385422~120412528~120420414~120469145~120469153~121246026~121246034~123814185&sid=1794209586&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_nsi=1&_ss=1&tfd=1189` → 204
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200

### 펀드닥터 펀드검색

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=1488759096&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2Fafn%2Ffund%2Ffdlist.jsp&_u=YCDAgEABAAAAACAAI~&jid=1275203199&gjid=820725104&cid=2108742493.1794209598&tid=UA-150939181-1&_gid=968036543.1794209598&_slc=1&gtm=45He6b41h1n81WSBDNCLza200xf1&gcd=13l3l3l3l1l1&dma=0&tag_exp=115616986~115938465~115938469~118012009~118897920~118897930~120385423~120412526~120420416~120469145~120469153~121246026~121246034~123814185&z=829532946` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je6b41v9136902590za20oxf1&_p=1794209595907&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=2108742493.1794209598&frm=0&pscdl=noapi&rcb=14&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115938465~115938468~118897920~118897930~120213116~120385422~120412528~120420416~120469145~120469153~121246026~121246034~123814183~124013660&sid=1794209598&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_nsi=1&_ss=1&tfd=3162` → 204
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=2108742493.1794209598&jid=1275203199&gjid=820725104&_gid=968036543.1794209598&_u=YCDAgEABAAAAAGAAI~&z=1436128850` → 200
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200
