# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-11-07T01:02:05.721Z

**1차 출처에서 조회 경로를 찾음 (전자공시 펀드검색(표준코드))**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1026.29 | 118868억 | 0.05~0.09% |
| KR5223385430 | KB법인용MMF I-1(운용) | MMF | 1004.53 | 95407억 | 0.06~0.09% |
| KR5234472706 | IBK그랑프리국공채MMF법인투자신탁 1[국공채] | MMF | 1023.69 | 94052억 | 0.093~0.168% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5724.01 | 9230억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2388.14 | 8317억 | 0.45~1.35% |

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

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17940133280256994.737945042626` → 200
- `GET https://dis.kofia.or.kr/wq/fundann/DISFundAnnList.xml?postfix=17940133293288171.932305564677` → 307
- `GET https://dis.kofia.or.kr/common/error.html` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17940133296394580.482755308486` → 200

### 전자공시 펀드검색(표준코드)

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17940133363214249.769695554245` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/DISComFundSmryInfo.xml?postfix=17940133374711382.0169889311574` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17940133376427312.126418184846` → 200
- `GET https://dis.kofia.or.kr/css/pop.css?postfix=17940133378015601.23215992686` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17940133379597743.369277706596` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17940133381363803.583569856742` → 200
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

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17940133451774181.2980269869295` → 200
- `GET https://dis.kofia.or.kr/wq/damoa/DISFundDamoaNotice.xml?postfix=17940133464007558.841406559971` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17940133465647596.440420703477` → 200
- `GET https://dis.kofia.or.kr/wq/com/gnb.xml?postfix=17940133467397052.976747362858` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17940133469119212.704436762435` → 200
- `GET https://dis.kofia.or.kr/css/layout.css?postfix=17940133470754214.184529632354` → 200
- `GET https://dis.kofia.or.kr/css/sub.css?postfix=17940133472397183.290980144592` → 200
- `GET https://dis.kofia.or.kr/wq/com/gnbTop.xml?postfix=17940133474061328.0784989480176` → 200
- `GET https://dis.kofia.or.kr/wq/com/snb.xml?postfix=17940133475825392.720830098814` → 200
- `GET https://dis.kofia.or.kr/wq/com/subTit.xml?postfix=17940133477508409.255131641436` → 200
- `GET https://dis.kofia.or.kr/wq/com/subTip.xml?postfix=17940133479162338.055849865598` → 200
- `GET https://dis.kofia.or.kr/wq/com/quick.xml?postfix=17940133481815658.960921040016` → 200

### 펀드닥터 (에프앤가이드)

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=1924446938&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2F&_u=YCDAgEABAAAAACAAI~&jid=1746016584&gjid=604828085&cid=1806961084.1794013356&tid=UA-150939181-1&_gid=1879534465.1794013356&_slc=1&gtm=45He6b41h1n81WSBDNCLza200xf1&gcd=13l3l3l3l1l1&dma=0&tag_exp=115616985~115938465~115938468~118897920~118897930~120385423~120412526~120420414~120469145~120469153~121246026~121246034~123814183&z=971442210` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je6b41v9136902590za20oxf1&_p=1794013354656&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=1806961084.1794013356&frm=0&pscdl=noapi&rcb=11&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115616986~115938465~115938469~118897920~118897930~120213116~120385422~120412526~120420416~120469145~120469153~121246026~121246034~123814185~124013662&sid=1794013355&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_nsi=1&_ss=1&tfd=2411` → 204
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=1806961084.1794013356&jid=1746016584&gjid=604828085&_gid=1879534465.1794013356&_u=YCDAgEABAAAAAGAAI~&z=1751954504` → 200
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200

### 펀드닥터 펀드검색

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=949590436&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2Fafn%2Ffund%2Ffdlist.jsp&_u=YCDAgEABAAAAACAAI~&jid=1181513624&gjid=27977629&cid=511715867.1794013371&tid=UA-150939181-1&_gid=2122335072.1794013371&_slc=1&gtm=45He6b41n81WSBDNCLza200xf1&gcd=13l3l3l3l1l1&dma=0&tag_exp=115616985~115938466~115938469~118012009~118897920~118897930~119863601~120385422~120412526~120420416~120469145~120469153~121246026~121246034~123814185&z=933692861` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je6b41v9136902590za20oxf1&_p=1794013366796&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=511715867.1794013371&frm=0&pscdl=noapi&rcb=13&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115616985~115938466~115938468~118897920~118897930~119863601~120213116~120385422~120412526~120420416~120469145~120469153~121246026~121246034~123814183~124013662&sid=1794013370&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_nsi=1&_ss=1&tfd=4912` → 204
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=511715867.1794013371&jid=1181513624&gjid=27977629&_gid=2122335072.1794013371&_u=YCDAgEABAAAAAGAAI~&z=1391863594` → 200
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200
