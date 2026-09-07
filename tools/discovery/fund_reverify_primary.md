# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-09-07T01:06:44.852Z

**1차 출처에서 조회 경로를 찾음 (전자공시 펀드검색(표준코드))**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1020.45 | 119257억 | 0.051~0.09% |
| K55107BJ2329 | 우리큰만족법인MMF 1(국공채) | MMF | 1022.98 | 93798억 | 0.078~0.098% |
| KR5223385430 | KB법인용MMF I-1(운용) | MMF | 1028.71 | 93484억 | 0.06~0.09% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5748.34 | 9218억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2654.38 | 8338억 | 0.45~1.35% |

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

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17887432064024651.8479410156415` → 200
- `GET https://dis.kofia.or.kr/wq/fundann/DISFundAnnList.xml?postfix=17887432076136607.943809880755` → 307
- `GET https://dis.kofia.or.kr/common/error.html` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17887432079033329.012570675756` → 200

### 전자공시 펀드검색(표준코드)

- `GET https://dis.kofia.or.kr/websquare/config.xml?postfix=17887432145451355.8163495891463` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/DISComFundSmryInfo.xml?postfix=17887432157604035.1976282310443` → 200
- `GET https://dis.kofia.or.kr/websquare/skin/stylesheet.css?postfix=17887432159227809.58410860066` → 200
- `GET https://dis.kofia.or.kr/css/pop.css?postfix=17887432160725373.180104289614` → 200
- `GET https://dis.kofia.or.kr/css/common.css?postfix=17887432162204827.300561398349` → 200
- `GET https://dis.kofia.or.kr/wq/com/popup/loading.xml?postfix=17887432163846473.1196672047645` → 200
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

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=1020826749&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2F&_u=YGBAgEABAAAAACAAI~&jid=172805678&gjid=154612201&cid=546317658.1788743231&tid=UA-150939181-1&_gid=582097050.1788743231&_slc=1&gtm=45He6921n81WSBDNCLza200&gcd=13l3l3l3l1l1&dma=0&tag_exp=115616985~115938465~115938468~118897920~118897930~120385423~120469145~120469153&z=824380391` → 200
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=546317658.1788743231&jid=172805678&gjid=154612201&_gid=582097050.1788743231&_u=YGBAgEABAAAAAGAAI~&z=203743775` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je6921v9136902590za20g&_p=1788743230330&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=546317658.1788743231&frm=0&pscdl=noapi&rcb=2&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115616985~115938465~115938469~118897920~118897930~120213116~120385423~120469145~120469153&sid=1788743230&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_ss=1&tfd=984` → 204
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200

### 펀드닥터 펀드검색

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=1355257466&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2Fafn%2Ffund%2Ffdlist.jsp&_u=YGDAgUABAAAAACAAI~&jid=450061526&gjid=431430807&cid=1987618498.1788743241&tid=UA-150939181-1&_gid=462722161.1788743241&_slc=1&gtm=45He6921n81WSBDNCLza200&gcd=13l3l3l3l1l1&dma=0&tag_exp=115938465~115938468~118897920~118897930~120385422~120469145~120469153&z=225337098` → 200
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=1987618498.1788743241&jid=450061526&gjid=431430807&_gid=462722161.1788743241&_u=YGDAgUABAAAAAGAAI~&z=695224916` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je6921v9136902590za20g&_p=1788743239033&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=1987618498.1788743241&frm=0&pscdl=noapi&rcb=8&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115616985~115938465~115938468~118897920~118897930~120213116~120385422~120469145~120469153&sid=1788743240&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_ss=1&tfd=2632` → 204
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200
