# 재검증 L3 (2차 시도) — 브라우저로 1차 출처를 연다

검증 시각: 2026-11-28T00:09:00.489Z

**1차 출처에서 표준코드 조회 경로를 찾지 못함 — 2차 출처 단독 근거로 남는다**

1차 시도는 주소를 추측해 찔렀고 실패했습니다. 금투협 전자공시는 WebSquare 라 화면
주소만으로는 자료가 안 나오고, 조회는 내부 서비스명을 갖춘 POST 로 이뤄집니다.
추측으로는 못 맞힙니다. 그래서 **브라우저로 열어 무엇을 부르는지** 봤습니다.

## 대조하려던 펀드

| 표준코드 | 펀드 | 유형 | 기준가 | 설정액 | 총보수 |
|---|---|---|---:|---:|---:|
| KR5105409225 | 삼성MMF법인 1 | MMF | 1028.31 | 111282억 | 0.05~0.09% |
| KR5234472706 | IBK그랑프리국공채MMF법인투자신탁 1[국공채] | MMF | 1025.73 | 103638억 | 0.093~0.168% |
| K55107BJ2329 | 우리큰만족법인MMF 1(국공채) | MMF | 1001.33 | 86172억 | 0.078~0.098% |
| K55235B39924 | 피델리티글로벌테크놀로지증권자투자신탁(주식-재간접형) | 해외주식형 | 5299.35 | 9210억 | 0.162~1.362% |
| KR5209676463 | 신영밸류고배당증권자투자신탁(주식)운용 | 국내주식형 | 2071.48 | 8292억 | 0.45~1.35% |

## 접근 결과

| 사이트 | 등급 | 열림 | XHR | 표준코드 보임 | 대조 필드 보임 |
|---|---|:-:|---:|:-:|:-:|
| 전자공시 펀드공시 | 1차 | ✗ | 0 | · | · |
| 전자공시 펀드검색(표준코드) | 1차 | ✗ | 0 | · | · |
| 펀드다모아 | 1차 | ✗ | 0 | · | · |
| 펀드다모아(www) | 1차 | ✗ | 0 | · | · |
| 펀드닥터 (에프앤가이드) | 2차 | ✓ | 4 | · | · |
| 펀드닥터 펀드검색 | 2차 | ✓ | 4 | · | · |

## 잡힌 XHR (다음 시도의 출발점)

### 펀드닥터 (에프앤가이드)

- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=1264200806&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2F&_u=YGBAgEABAAAAACAAI~&jid=511267444&gjid=964639659&cid=366016917.1795824663&tid=UA-150939181-1&_gid=1840693332.1795824663&_slc=1&gtm=45He6bi0h2n81WSBDNCLza200xf1&gcd=13l3l3l3l1l1&dma=0&tag_exp=115938465~115938468~120385422~120469145~120469153~121246026~121246034&z=424835027` → 200
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=366016917.1795824663&jid=511267444&gjid=964639659&_gid=1840693332.1795824663&_u=YGBAgEABAAAAAGAAI~&z=2077338809` → 200
- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je6bh1h1v9136902590za20oxf1&_p=1795824662699&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=366016917.1795824663&frm=0&pscdl=noapi&rcb=15&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115616986~115938465~115938469~120213116~120385422~120469145~120469153~121246026~121246034&sid=1795824662&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2F&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_ss=1&tfd=1219` → 204
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200

### 펀드닥터 펀드검색

- `POST https://analytics.google.com/g/collect?v=2&tid=G-D7RCDX73LB&gtm=45je6bh1v9136902590za20oxf1&_p=1795824671399&_gaz=1&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAIAGAC&are=1&cid=646892827.1795824673&frm=0&pscdl=noapi&rcb=19&sr=1280x720&uaa=x86&uab=64&uafvl=HeadlessChrome%3B141.0.7390.37%7CNot%253FA_Brand%3B8.0.0.0%7CChromium%3B141.0.7390.37&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=ko-kr&gaf=2&_s=1&tag_exp=115616985~115938466~115938468~120213116~120385423~120469145~120469153~121246026~121246034&sid=1795824672&sct=1&seg=0&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&en=page_view&_fv=1&_nsi=1&_ss=1&tfd=2210` → 204
- `POST https://stats.g.doubleclick.net/j/collect?t=dc&aip=1&_r=3&v=1&_v=j102&tid=UA-150939181-1&cid=646892827.1795824673&jid=1978420907&gjid=525352287&_gid=1552183596.1795824673&_u=YCDAgEABAAAAAGAAI~&z=1938433074` → 200
- `POST https://www.google-analytics.com/j/collect?v=1&_v=j102&a=327766143&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.funddoctor.co.kr%2Fafn%2Ffund%2Ffdlist.jsp%3Ffund_cd%3DKR5105409225&ul=ko-kr&dt=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0&sr=1280x720&vp=1280x720&ec=%ED%8E%80%EB%93%9C%EB%8B%A5%ED%84%B0%EC%83%81%EB%8B%A8%EB%B0%B0%EB%84%88&ea=undefined&el=%2Fafn%2Ffund%2Ffdlist.jsp&_u=YCDAgEABAAAAACAAI~&jid=1978420907&gjid=525352287&cid=646892827.1795824673&tid=UA-150939181-1&_gid=1552183596.1795824673&_slc=1&gtm=45He6bi0h2n81WSBDNCLza200xf1&gcd=13l3l3l3l1l1&dma=0&tag_exp=115938466~115938468~120385422~120469145~120469153~121246026~121246034~123785234&z=27779105` → 200
- `GET https://www.funddoctor.co.kr/common/footer.jsp` → 200

## 대조하지 못했습니다

**이 화면의 숫자는 네이버 Npay 증권 한 곳에서 왔고, 그것은 2차 출처입니다.**
두 차례 시도했으나 1차 출처에서 표준코드로 조회되는 경로를 재현하지 못했습니다.

이것이 뜻하는 바를 분명히 적습니다.

- 확인된 것: **내가 네이버를 정확히 옮겼다** (표본 400개 전 필드 일치)
- 확인되지 않은 것: **네이버가 맞는가**

네이버가 틀린 값을 실었다면 이 화면도 똑같이 틀립니다. 그 가능성은 이 검증으로
배제되지 않습니다.

### 사용자가 확인할 수 있는 경로

| 확인할 것 | 어디서 | 어떻게 |
|---|---|---|
| 총보수 (클래스별) | 금융투자협회 전자공시 dis.kofia.or.kr | 펀드공시 → 표준코드 입력 → 보수 항목 |
| 총보수 | 각 펀드 투자설명서 | 운용사 홈페이지 또는 판매사 |
| 설정액·순자산 | 운용사 월간 운용보고서 | 운용사 홈페이지 |
| 기준가 | 운용사 기준가 조회 | 운용사 홈페이지 |
| 유형(분류) | 펀드다모아 fundamoa.kofia.or.kr | 유형 분류 대조 |

위 표의 5개 펀드를 짚어 확인해 주시면 계열 전체의 신뢰도를 판단할 수 있습니다.
한 종목이라도 어긋나면 원천 자체를 다시 봐야 합니다.
