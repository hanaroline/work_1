# 펀드 원천 탐색 5차 — 메뉴에서 얻은 화면 경로

조사 시각: 2026-08-28T15:38:47.188Z

4차에서 헛짚었다. 내가 쓴 w2xPath 세 개가 전부 없는 화면이었다. 버튼 0개·
입력칸 0개가 그 증거다 — WebSquare 는 레이아웃을 못 받으면 빈 화면을 그린다.
"눌러도 아무 일이 없다" 가 아니라 "누를 것이 처음부터 없었다" 였다.

그래서 경로를 짐작하지 않고 메뉴에서 받아 왔다.

## 메뉴

| 메뉴 xml | 결과 | 긁은 경로 |
|---|---|---:|
| `/wq/com/gnb.xml` | 200 27155B | 2 |
| `/wq/com/gnbTop.xml` | 200 2169B | 4 |
| `/wq/com/quick.xml` | 200 4289B | 2 |
| `/wq/main/main.xml` | 200 142132B | 3 |
| `/wq/com/lnb.xml` | 200 1332B (오류) | – |
| `/wq/com/sitemap.xml` | 200 1332B (오류) | – |

## 찾은 화면 경로 (11개)

```
/wq/com/gnbTop.xml
/wq/com/popup/DISMenuSchInfo.xml
/wq/srvc/DISBoardList1.xml
/wq/srvc/DISRptKindLawPop.xml
/wq/srvc/DISUserGuide.xml
/wq/sitemap/DISSiteMap.xml
/wq/com/popup/DISComDictry.xml
/wq/etcann/DISDLSSubscribing.xml
/wq/com/gnb.xml
/wq/com/quick.xml
/wq/com/footer.xml
```

## 펀드 화면 열기 결과

| 경로 | 버튼 | 입력 | 그려짐 | 누름 | POST |
|---|---:|---:|:-:|---|---:|
| `/wq/fundann/DISFundAnnSrch.xml` | 2 | 16 | ○ | 검색 | 3 |
| `/wq/fundann/DISFTimeTotStut.xml` | 2 | 16 | ○ | 검색 | 4 |
| `/wq/fundann/DISFTimeAnnStut.xml` | 2 | 16 | ○ | 검색 | 4 |
| `/wq/fundann/DISSmallSizeFundPresent.xml` | 2 | 13 | ○ | 검색 | 4 |
| `/wq/fundtrn/DISFundTrnCompList.xml` | 0 | 5 | ○ | 검색 | 4 |
| `/wq/fundtrn/DISFundTrnFundList.xml` | 2 | 13 | ○ | 검색 | 4 |
| `/wq/fundann/DISSalCmsFTimeChgStut.xml` | 1 | 9 | ○ | 검색 | 4 |
| `/wq/fundann/DISSalCmsCmpStut.xml` | 1 | 10 | ○ | 검색 | 4 |

### `/wq/fundann/DISFundAnnSrch.xml`

버튼:

```
btnSearchWord : 검색
standardCdGbSear : 검색
```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectGrandMenu</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISMenuDTO>
</DISMenuDTO>
</message>

```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectService</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISServiceDTO>
    <divisionId>MDIS01001000000000</divisionId>
</DISServiceDTO>
</message>

```

응답 (200):

```xml
/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * 웹스퀘어 ajax통신을 위한 Object options JSON형태 객체 
 * 
 * 	[websquare 통신 Object 정의]
 *   SendOpt.action : ajax 요청주소
 *   SendOpt.mode : asynchronous(default)/synchronous 
 *   SendOpt.mediatype : application/x-www-form-urlencoded , application/json , application/xml , text/xml
 *   SendOpt.method : get/post/put/delete
 *   SendOpt.requestData : 요청본문
 *   SendOpt.timeout : ajax요청후 timeout 시간. 이시간이 초과해도 응답이 오지 않는 경우 error callback함수를 실행
 *   SendOpt.type : xml/json. xml인 경우 success callback함수의 인자객체의 responseBody속성에 xml객체가 설정되고,
	   		   json인 경우 자바스크립트 객체가 설정된다.나머지 경우는 text형식이 설정.
 *   SendOpt.beforeAjax : 요청전에 실행되는 함수로 이 함수내에서 false를 return하면 ajax요청을 하지 않는다
 *   SendOpt.success : 요청이 성공한 경우 실행되는 callback함수
 *   SendOpt.error : 요청이 실패한 경우 실행되는 callback함수
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
 */
function SendOpt() {
	if (location.href.indexOf('localhost') != -1) this.action = "/proxy/prfProxy.jsp";	
	else this.action = "/proframeWeb/XMLSERVICES/",

	this.mediatype = "text/xml";
	this.method = "post"; 
	this.type = "xml";
	this.requestData = "";
}

SendOpt.prototype.optInit = function optInit(opt) {
	for (var key in opt) {
		eval("this." + key + "=opt." + key + ";");
	}
};

SendOpt.prototype.optError = function optError(e){
	var errorBuffer = new StringBuffer();
	errorBuffer.append('[통신작업중 장애가 발생했습니다.]\n');
	errorBuffer.append('ERROR TYPE : ' + e.errorType + ", STATUS CODE : " + e.responseStatusCode);
	
	alert(errorBuffer.toString());
};

SendOpt.prototype.setRequestData = function setRequestData(reqMsg) {
	this.requestData = reqMsg;
};

SendOpt.prototype.getRequeatData = function getRequeatData
```

응답 (200):

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message><proframeHeader>
<pfmAppName>FS-DIS2</pfmAppName>
<pfmSvcName>DISMenuSO</pfmSvcName>
<pfmFnName>selectService</pfmFnName>
<pfmGlobalNo>490645cd0afe00972ab8bf2582212b54</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829003902989</pfmTrTime>
<pfmClntIp>9.234.151.22</pfmClntIp>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<DISServiceDTO>
<divisionId>MDIS01001000000000</divisionId>
<divisionNm>펀드공시검색</divisionNm>
<serviceId>SDIS01001000000</serviceId>
<serviceNm>펀드공시검색 서비스</serviceNm>
<serviceDesc>펀드에 대한 &lt;SPAN>전체적인(정기/수시) 공시사항&lt;/SPAN>을 검색할 수 있습니다. &lt;span style="color:#e63b3b; font-weight:bold;">※ 검색결과에서 제목 셀 클릭 시 정렬 가능&lt;/span></serviceDesc>
<principleAtc>&lt;ul>&lt;li>본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.&lt;/li>&lt;li>[구분]란에 &lt;img src="/img/sub/ico_jung.gif" class="middle" alt="정"/>는 분기· 결산등 단위로 공시되는 정기보고서이며 &lt;img src="/img/sub/ico_su.gif"  class="middle" alt="수"/>는 수시로 공시되는 수시보고서입니다.&lt;/li>&lt;li>&lt;img src="/img/sub/btn_inquire.gif"  class="middle" alt="돋보기"/>클릭하면 펀드에 대한 상세정보를 확인할 수 있습니다.&lt;/li>&lt;/ul></principleAtc>
<spclCont />
<outputFormNo>DIS0001</outputFormNo>
<formSrtDt>19000101</formSrtDt>
<orderSeq>1</orderSeq>
<serviceStt />
</DISServiceDTO></message></root>
```

화면 글:

```
본문바로가기
공지사항보고서 및 근거기준시스템 이용가이드업무지원서비스사이트 맵
펀드
	
메뉴검색

현재서비스모드

투자예정자
	
펀드공시
금융투자회사공시
펀드매니저/애널리스트
기타공시
ISA비교공시
펀드다모아
금융상품한눈에
디딤펀드
전체메뉴
마이서비스Zone 바로가기
펀드공시검색
수시공시
펀드판매사 변경
펀드기준가격 및 등락
펀드 보수 및 비용
펀드 설정현황
특정유형펀드
펀드비교검색
펀드운용실적비교
연금상품 펀드비교
매매비중 및 수수료율
펀드판매회사 관련 공시
펀드 수익비용 계산기
연금저축펀드 비교공시
연금저축펀드 비교공시(2020년 이후)
사모펀드 자산운용보고서
펀드공시검색

펀드에 대한 전체적인(정기/수시) 공시사항을 검색할 수 있습니다. ※ 검색결과에서 제목 셀 클릭 시 정렬 가능

회사선택

	

회사 전체




보고서유형

	
전체
정기공시
수시공시

보고서 전체




펀드 검색

	
펀드명
펀드선택
표준코드



조회기간

	
	

~

	
1주일
1개월
3개월
6개월

```

### `/wq/fundann/DISFTimeTotStut.xml`

버튼:

```
btnSearchWord : 검색
standardCdGbSear : 검색
```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectGrandMenu</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISMenuDTO>
</DISMenuDTO>
</message>

```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectService</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISServiceDTO>
    <divisionId>MDIS01001000000000</divisionId>
</DISServiceDTO>
</message>

```

응답 (200):

```xml
/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * 웹스퀘어 ajax통신을 위한 Object options JSON형태 객체 
 * 
 * 	[websquare 통신 Object 정의]
 *   SendOpt.action : ajax 요청주소
 *   SendOpt.mode : asynchronous(default)/synchronous 
 *   SendOpt.mediatype : application/x-www-form-urlencoded , application/json , application/xml , text/xml
 *   SendOpt.method : get/post/put/delete
 *   SendOpt.requestData : 요청본문
 *   SendOpt.timeout : ajax요청후 timeout 시간. 이시간이 초과해도 응답이 오지 않는 경우 error callback함수를 실행
 *   SendOpt.type : xml/json. xml인 경우 success callback함수의 인자객체의 responseBody속성에 xml객체가 설정되고,
	   		   json인 경우 자바스크립트 객체가 설정된다.나머지 경우는 text형식이 설정.
 *   SendOpt.beforeAjax : 요청전에 실행되는 함수로 이 함수내에서 false를 return하면 ajax요청을 하지 않는다
 *   SendOpt.success : 요청이 성공한 경우 실행되는 callback함수
 *   SendOpt.error : 요청이 실패한 경우 실행되는 callback함수
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
 */
function SendOpt() {
	if (location.href.indexOf('localhost') != -1) this.action = "/proxy/prfProxy.jsp";	
	else this.action = "/proframeWeb/XMLSERVICES/",

	this.mediatype = "text/xml";
	this.method = "post"; 
	this.type = "xml";
	this.requestData = "";
}

SendOpt.prototype.optInit = function optInit(opt) {
	for (var key in opt) {
		eval("this." + key + "=opt." + key + ";");
	}
};

SendOpt.prototype.optError = function optError(e){
	var errorBuffer = new StringBuffer();
	errorBuffer.append('[통신작업중 장애가 발생했습니다.]\n');
	errorBuffer.append('ERROR TYPE : ' + e.errorType + ", STATUS CODE : " + e.responseStatusCode);
	
	alert(errorBuffer.toString());
};

SendOpt.prototype.setRequestData = function setRequestData(reqMsg) {
	this.requestData = reqMsg;
};

SendOpt.prototype.getRequeatData = function getRequeatData
```

응답 (200):

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message><proframeHeader>
<pfmAppName>FS-DIS2</pfmAppName>
<pfmSvcName>DISMenuSO</pfmSvcName>
<pfmFnName>selectService</pfmFnName>
<pfmGlobalNo>49067e1d0afe00972140dc9dd58788d5</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829003917405</pfmTrTime>
<pfmClntIp>9.234.151.22</pfmClntIp>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<DISServiceDTO>
<divisionId>MDIS01001000000000</divisionId>
<divisionNm>펀드공시검색</divisionNm>
<serviceId>SDIS01001000000</serviceId>
<serviceNm>펀드공시검색 서비스</serviceNm>
<serviceDesc>펀드에 대한 &lt;SPAN>전체적인(정기/수시) 공시사항&lt;/SPAN>을 검색할 수 있습니다. &lt;span style="color:#e63b3b; font-weight:bold;">※ 검색결과에서 제목 셀 클릭 시 정렬 가능&lt;/span></serviceDesc>
<principleAtc>&lt;ul>&lt;li>본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.&lt;/li>&lt;li>[구분]란에 &lt;img src="/img/sub/ico_jung.gif" class="middle" alt="정"/>는 분기· 결산등 단위로 공시되는 정기보고서이며 &lt;img src="/img/sub/ico_su.gif"  class="middle" alt="수"/>는 수시로 공시되는 수시보고서입니다.&lt;/li>&lt;li>&lt;img src="/img/sub/btn_inquire.gif"  class="middle" alt="돋보기"/>클릭하면 펀드에 대한 상세정보를 확인할 수 있습니다.&lt;/li>&lt;/ul></principleAtc>
<spclCont />
<outputFormNo>DIS0001</outputFormNo>
<formSrtDt>19000101</formSrtDt>
<orderSeq>1</orderSeq>
<serviceStt />
</DISServiceDTO></message></root>
```

화면 글:

```
본문바로가기
공지사항보고서 및 근거기준시스템 이용가이드업무지원서비스사이트 맵
펀드
	
메뉴검색

현재서비스모드

투자예정자
	
펀드공시
금융투자회사공시
펀드매니저/애널리스트
기타공시
ISA비교공시
펀드다모아
금융상품한눈에
디딤펀드
전체메뉴
마이서비스Zone 바로가기
펀드공시검색
수시공시
펀드판매사 변경
펀드기준가격 및 등락
펀드 보수 및 비용
펀드 설정현황
특정유형펀드
펀드비교검색
펀드운용실적비교
연금상품 펀드비교
매매비중 및 수수료율
펀드판매회사 관련 공시
펀드 수익비용 계산기
연금저축펀드 비교공시
연금저축펀드 비교공시(2020년 이후)
사모펀드 자산운용보고서
펀드공시검색

펀드에 대한 전체적인(정기/수시) 공시사항을 검색할 수 있습니다. ※ 검색결과에서 제목 셀 클릭 시 정렬 가능

회사선택

	

회사 전체




보고서유형

	
전체
정기공시
수시공시

수시보고서 전체




펀드 검색

	
펀드명
펀드선택
표준코드



조회기간

	
	

~

	
1주일
1개월
3개월
6개
```

### `/wq/fundann/DISFTimeAnnStut.xml`

버튼:

```
btnSearchWord : 검색
standardCdGbSear : 검색
```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectGrandMenu</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISMenuDTO>
</DISMenuDTO>
</message>

```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectService</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISServiceDTO>
    <divisionId>MDIS01001000000000</divisionId>
</DISServiceDTO>
</message>

```

응답 (200):

```xml
/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * 웹스퀘어 ajax통신을 위한 Object options JSON형태 객체 
 * 
 * 	[websquare 통신 Object 정의]
 *   SendOpt.action : ajax 요청주소
 *   SendOpt.mode : asynchronous(default)/synchronous 
 *   SendOpt.mediatype : application/x-www-form-urlencoded , application/json , application/xml , text/xml
 *   SendOpt.method : get/post/put/delete
 *   SendOpt.requestData : 요청본문
 *   SendOpt.timeout : ajax요청후 timeout 시간. 이시간이 초과해도 응답이 오지 않는 경우 error callback함수를 실행
 *   SendOpt.type : xml/json. xml인 경우 success callback함수의 인자객체의 responseBody속성에 xml객체가 설정되고,
	   		   json인 경우 자바스크립트 객체가 설정된다.나머지 경우는 text형식이 설정.
 *   SendOpt.beforeAjax : 요청전에 실행되는 함수로 이 함수내에서 false를 return하면 ajax요청을 하지 않는다
 *   SendOpt.success : 요청이 성공한 경우 실행되는 callback함수
 *   SendOpt.error : 요청이 실패한 경우 실행되는 callback함수
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
 */
function SendOpt() {
	if (location.href.indexOf('localhost') != -1) this.action = "/proxy/prfProxy.jsp";	
	else this.action = "/proframeWeb/XMLSERVICES/",

	this.mediatype = "text/xml";
	this.method = "post"; 
	this.type = "xml";
	this.requestData = "";
}

SendOpt.prototype.optInit = function optInit(opt) {
	for (var key in opt) {
		eval("this." + key + "=opt." + key + ";");
	}
};

SendOpt.prototype.optError = function optError(e){
	var errorBuffer = new StringBuffer();
	errorBuffer.append('[통신작업중 장애가 발생했습니다.]\n');
	errorBuffer.append('ERROR TYPE : ' + e.errorType + ", STATUS CODE : " + e.responseStatusCode);
	
	alert(errorBuffer.toString());
};

SendOpt.prototype.setRequestData = function setRequestData(reqMsg) {
	this.requestData = reqMsg;
};

SendOpt.prototype.getRequeatData = function getRequeatData
```

응답 (200):

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message><proframeHeader>
<pfmAppName>FS-DIS2</pfmAppName>
<pfmSvcName>DISMenuSO</pfmSvcName>
<pfmFnName>selectService</pfmFnName>
<pfmGlobalNo>4906b54d0afe00970b404ca8f2e555e4</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829003931533</pfmTrTime>
<pfmClntIp>9.234.151.22</pfmClntIp>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<DISServiceDTO>
<divisionId>MDIS01001000000000</divisionId>
<divisionNm>펀드공시검색</divisionNm>
<serviceId>SDIS01001000000</serviceId>
<serviceNm>펀드공시검색 서비스</serviceNm>
<serviceDesc>펀드에 대한 &lt;SPAN>전체적인(정기/수시) 공시사항&lt;/SPAN>을 검색할 수 있습니다. &lt;span style="color:#e63b3b; font-weight:bold;">※ 검색결과에서 제목 셀 클릭 시 정렬 가능&lt;/span></serviceDesc>
<principleAtc>&lt;ul>&lt;li>본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.&lt;/li>&lt;li>[구분]란에 &lt;img src="/img/sub/ico_jung.gif" class="middle" alt="정"/>는 분기· 결산등 단위로 공시되는 정기보고서이며 &lt;img src="/img/sub/ico_su.gif"  class="middle" alt="수"/>는 수시로 공시되는 수시보고서입니다.&lt;/li>&lt;li>&lt;img src="/img/sub/btn_inquire.gif"  class="middle" alt="돋보기"/>클릭하면 펀드에 대한 상세정보를 확인할 수 있습니다.&lt;/li>&lt;/ul></principleAtc>
<spclCont />
<outputFormNo>DIS0001</outputFormNo>
<formSrtDt>19000101</formSrtDt>
<orderSeq>1</orderSeq>
<serviceStt />
</DISServiceDTO></message></root>
```

화면 글:

```
본문바로가기
공지사항보고서 및 근거기준시스템 이용가이드업무지원서비스사이트 맵
펀드
	
메뉴검색

현재서비스모드

투자예정자
	
펀드공시
금융투자회사공시
펀드매니저/애널리스트
기타공시
ISA비교공시
펀드다모아
금융상품한눈에
디딤펀드
전체메뉴
마이서비스Zone 바로가기
펀드공시검색
수시공시
펀드판매사 변경
펀드기준가격 및 등락
펀드 보수 및 비용
펀드 설정현황
특정유형펀드
펀드비교검색
펀드운용실적비교
연금상품 펀드비교
매매비중 및 수수료율
펀드판매회사 관련 공시
펀드 수익비용 계산기
연금저축펀드 비교공시
연금저축펀드 비교공시(2020년 이후)
사모펀드 자산운용보고서
펀드공시검색

펀드에 대한 전체적인(정기/수시) 공시사항을 검색할 수 있습니다. ※ 검색결과에서 제목 셀 클릭 시 정렬 가능

회사선택

	

회사 전체




보고서유형

	
전체
정기공시
수시공시

수시보고서 전체




펀드 검색

	
펀드명
펀드선택
표준코드



조회기간

	
	

~

	
1주일
1개월
3개월
6개
```

### `/wq/fundann/DISSmallSizeFundPresent.xml`

버튼:

```
btnSearchWord : 검색
standardCdGbSear : 검색
```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectGrandMenu</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISMenuDTO>
</DISMenuDTO>
</message>

```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectService</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISServiceDTO>
    <divisionId>MDIS01001000000000</divisionId>
</DISServiceDTO>
</message>

```

응답 (200):

```xml
/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * 웹스퀘어 ajax통신을 위한 Object options JSON형태 객체 
 * 
 * 	[websquare 통신 Object 정의]
 *   SendOpt.action : ajax 요청주소
 *   SendOpt.mode : asynchronous(default)/synchronous 
 *   SendOpt.mediatype : application/x-www-form-urlencoded , application/json , application/xml , text/xml
 *   SendOpt.method : get/post/put/delete
 *   SendOpt.requestData : 요청본문
 *   SendOpt.timeout : ajax요청후 timeout 시간. 이시간이 초과해도 응답이 오지 않는 경우 error callback함수를 실행
 *   SendOpt.type : xml/json. xml인 경우 success callback함수의 인자객체의 responseBody속성에 xml객체가 설정되고,
	   		   json인 경우 자바스크립트 객체가 설정된다.나머지 경우는 text형식이 설정.
 *   SendOpt.beforeAjax : 요청전에 실행되는 함수로 이 함수내에서 false를 return하면 ajax요청을 하지 않는다
 *   SendOpt.success : 요청이 성공한 경우 실행되는 callback함수
 *   SendOpt.error : 요청이 실패한 경우 실행되는 callback함수
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
 */
function SendOpt() {
	if (location.href.indexOf('localhost') != -1) this.action = "/proxy/prfProxy.jsp";	
	else this.action = "/proframeWeb/XMLSERVICES/",

	this.mediatype = "text/xml";
	this.method = "post"; 
	this.type = "xml";
	this.requestData = "";
}

SendOpt.prototype.optInit = function optInit(opt) {
	for (var key in opt) {
		eval("this." + key + "=opt." + key + ";");
	}
};

SendOpt.prototype.optError = function optError(e){
	var errorBuffer = new StringBuffer();
	errorBuffer.append('[통신작업중 장애가 발생했습니다.]\n');
	errorBuffer.append('ERROR TYPE : ' + e.errorType + ", STATUS CODE : " + e.responseStatusCode);
	
	alert(errorBuffer.toString());
};

SendOpt.prototype.setRequestData = function setRequestData(reqMsg) {
	this.requestData = reqMsg;
};

SendOpt.prototype.getRequeatData = function getRequeatData
```

응답 (200):

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message><proframeHeader>
<pfmAppName>FS-DIS2</pfmAppName>
<pfmSvcName>DISMenuSO</pfmSvcName>
<pfmFnName>selectService</pfmFnName>
<pfmGlobalNo>4906ed6e0afe00972e18fdd2e32f3f91</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829003945902</pfmTrTime>
<pfmClntIp>9.234.151.22</pfmClntIp>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<DISServiceDTO>
<divisionId>MDIS01001000000000</divisionId>
<divisionNm>펀드공시검색</divisionNm>
<serviceId>SDIS01001000000</serviceId>
<serviceNm>펀드공시검색 서비스</serviceNm>
<serviceDesc>펀드에 대한 &lt;SPAN>전체적인(정기/수시) 공시사항&lt;/SPAN>을 검색할 수 있습니다. &lt;span style="color:#e63b3b; font-weight:bold;">※ 검색결과에서 제목 셀 클릭 시 정렬 가능&lt;/span></serviceDesc>
<principleAtc>&lt;ul>&lt;li>본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.&lt;/li>&lt;li>[구분]란에 &lt;img src="/img/sub/ico_jung.gif" class="middle" alt="정"/>는 분기· 결산등 단위로 공시되는 정기보고서이며 &lt;img src="/img/sub/ico_su.gif"  class="middle" alt="수"/>는 수시로 공시되는 수시보고서입니다.&lt;/li>&lt;li>&lt;img src="/img/sub/btn_inquire.gif"  class="middle" alt="돋보기"/>클릭하면 펀드에 대한 상세정보를 확인할 수 있습니다.&lt;/li>&lt;/ul></principleAtc>
<spclCont />
<outputFormNo>DIS0001</outputFormNo>
<formSrtDt>19000101</formSrtDt>
<orderSeq>1</orderSeq>
<serviceStt />
</DISServiceDTO></message></root>
```

화면 글:

```
공지사항보고서 및 근거기준시스템 이용가이드업무지원서비스사이트 맵
펀드
	
메뉴검색

현재서비스모드

투자예정자
	
펀드공시
금융투자회사공시
펀드매니저/애널리스트
기타공시
ISA비교공시
펀드다모아
금융상품한눈에
디딤펀드
전체메뉴
마이서비스Zone 바로가기
펀드공시검색
수시공시
펀드판매사 변경
펀드기준가격 및 등락
펀드 보수 및 비용
펀드 설정현황
특정유형펀드
펀드비교검색
펀드운용실적비교
연금상품 펀드비교
매매비중 및 수수료율
펀드판매회사 관련 공시
펀드 수익비용 계산기
연금저축펀드 비교공시
연금저축펀드 비교공시(2020년 이후)
사모펀드 자산운용보고서
펀드공시검색

펀드에 대한 전체적인(정기/수시) 공시사항을 검색할 수 있습니다. ※ 검색결과에서 제목 셀 클릭 시 정렬 가능

소규모펀드 현황
소규모펀드 해소 현황
판매사별 소규모펀드

회사선택

	

회사 전체




펀드 검색

	
펀드명
펀드선택
표준코드


검색결과:0건


	

안내사항

본화면은 자본시장법 제 9조 제 7항(모
```

### `/wq/fundtrn/DISFundTrnCompList.xml`

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectGrandMenu</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISMenuDTO>
</DISMenuDTO>
</message>

```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectService</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISServiceDTO>
    <divisionId>MDIS01001000000000</divisionId>
</DISServiceDTO>
</message>

```

응답 (200):

```xml
/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * 웹스퀘어 ajax통신을 위한 Object options JSON형태 객체 
 * 
 * 	[websquare 통신 Object 정의]
 *   SendOpt.action : ajax 요청주소
 *   SendOpt.mode : asynchronous(default)/synchronous 
 *   SendOpt.mediatype : application/x-www-form-urlencoded , application/json , application/xml , text/xml
 *   SendOpt.method : get/post/put/delete
 *   SendOpt.requestData : 요청본문
 *   SendOpt.timeout : ajax요청후 timeout 시간. 이시간이 초과해도 응답이 오지 않는 경우 error callback함수를 실행
 *   SendOpt.type : xml/json. xml인 경우 success callback함수의 인자객체의 responseBody속성에 xml객체가 설정되고,
	   		   json인 경우 자바스크립트 객체가 설정된다.나머지 경우는 text형식이 설정.
 *   SendOpt.beforeAjax : 요청전에 실행되는 함수로 이 함수내에서 false를 return하면 ajax요청을 하지 않는다
 *   SendOpt.success : 요청이 성공한 경우 실행되는 callback함수
 *   SendOpt.error : 요청이 실패한 경우 실행되는 callback함수
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
 */
function SendOpt() {
	if (location.href.indexOf('localhost') != -1) this.action = "/proxy/prfProxy.jsp";	
	else this.action = "/proframeWeb/XMLSERVICES/",

	this.mediatype = "text/xml";
	this.method = "post"; 
	this.type = "xml";
	this.requestData = "";
}

SendOpt.prototype.optInit = function optInit(opt) {
	for (var key in opt) {
		eval("this." + key + "=opt." + key + ";");
	}
};

SendOpt.prototype.optError = function optError(e){
	var errorBuffer = new StringBuffer();
	errorBuffer.append('[통신작업중 장애가 발생했습니다.]\n');
	errorBuffer.append('ERROR TYPE : ' + e.errorType + ", STATUS CODE : " + e.responseStatusCode);
	
	alert(errorBuffer.toString());
};

SendOpt.prototype.setRequestData = function setRequestData(reqMsg) {
	this.requestData = reqMsg;
};

SendOpt.prototype.getRequeatData = function getRequeatData
```

응답 (200):

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message><proframeHeader>
<pfmAppName>FS-DIS2</pfmAppName>
<pfmSvcName>DISMenuSO</pfmSvcName>
<pfmFnName>selectService</pfmFnName>
<pfmGlobalNo>490724580afe00975e37fcc045d52220</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829003959960</pfmTrTime>
<pfmClntIp>9.234.151.22</pfmClntIp>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<DISServiceDTO>
<divisionId>MDIS01001000000000</divisionId>
<divisionNm>펀드공시검색</divisionNm>
<serviceId>SDIS01001000000</serviceId>
<serviceNm>펀드공시검색 서비스</serviceNm>
<serviceDesc>펀드에 대한 &lt;SPAN>전체적인(정기/수시) 공시사항&lt;/SPAN>을 검색할 수 있습니다. &lt;span style="color:#e63b3b; font-weight:bold;">※ 검색결과에서 제목 셀 클릭 시 정렬 가능&lt;/span></serviceDesc>
<principleAtc>&lt;ul>&lt;li>본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.&lt;/li>&lt;li>[구분]란에 &lt;img src="/img/sub/ico_jung.gif" class="middle" alt="정"/>는 분기· 결산등 단위로 공시되는 정기보고서이며 &lt;img src="/img/sub/ico_su.gif"  class="middle" alt="수"/>는 수시로 공시되는 수시보고서입니다.&lt;/li>&lt;li>&lt;img src="/img/sub/btn_inquire.gif"  class="middle" alt="돋보기"/>클릭하면 펀드에 대한 상세정보를 확인할 수 있습니다.&lt;/li>&lt;/ul></principleAtc>
<spclCont />
<outputFormNo>DIS0001</outputFormNo>
<formSrtDt>19000101</formSrtDt>
<orderSeq>1</orderSeq>
<serviceStt />
</DISServiceDTO></message></root>
```

화면 글:

```
본문바로가기
공지사항보고서 및 근거기준시스템 이용가이드업무지원서비스사이트 맵
펀드
	
메뉴검색

현재서비스모드

투자예정자
	
펀드공시
금융투자회사공시
펀드매니저/애널리스트
기타공시
ISA비교공시
펀드다모아
금융상품한눈에
디딤펀드
전체메뉴
마이서비스Zone 바로가기
펀드공시검색
수시공시
펀드판매사 변경
펀드기준가격 및 등락
펀드 보수 및 비용
펀드 설정현황
특정유형펀드
펀드비교검색
펀드운용실적비교
연금상품 펀드비교
매매비중 및 수수료율
펀드판매회사 관련 공시
펀드 수익비용 계산기
연금저축펀드 비교공시
연금저축펀드 비교공시(2020년 이후)
사모펀드 자산운용보고서
펀드공시검색

펀드에 대한 전체적인(정기/수시) 공시사항을 검색할 수 있습니다. ※ 검색결과에서 제목 셀 클릭 시 정렬 가능

검색결과:0건


	
데이터가 없음

안내사항

본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.
[구분]란에 는 분기· 결산
```

### `/wq/fundtrn/DISFundTrnFundList.xml`

버튼:

```
btnSearchWord : 검색
standardCdGbSear : 검색
```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectGrandMenu</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISMenuDTO>
</DISMenuDTO>
</message>

```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectService</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISServiceDTO>
    <divisionId>MDIS01001000000000</divisionId>
</DISServiceDTO>
</message>

```

응답 (200):

```xml
/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * 웹스퀘어 ajax통신을 위한 Object options JSON형태 객체 
 * 
 * 	[websquare 통신 Object 정의]
 *   SendOpt.action : ajax 요청주소
 *   SendOpt.mode : asynchronous(default)/synchronous 
 *   SendOpt.mediatype : application/x-www-form-urlencoded , application/json , application/xml , text/xml
 *   SendOpt.method : get/post/put/delete
 *   SendOpt.requestData : 요청본문
 *   SendOpt.timeout : ajax요청후 timeout 시간. 이시간이 초과해도 응답이 오지 않는 경우 error callback함수를 실행
 *   SendOpt.type : xml/json. xml인 경우 success callback함수의 인자객체의 responseBody속성에 xml객체가 설정되고,
	   		   json인 경우 자바스크립트 객체가 설정된다.나머지 경우는 text형식이 설정.
 *   SendOpt.beforeAjax : 요청전에 실행되는 함수로 이 함수내에서 false를 return하면 ajax요청을 하지 않는다
 *   SendOpt.success : 요청이 성공한 경우 실행되는 callback함수
 *   SendOpt.error : 요청이 실패한 경우 실행되는 callback함수
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
 */
function SendOpt() {
	if (location.href.indexOf('localhost') != -1) this.action = "/proxy/prfProxy.jsp";	
	else this.action = "/proframeWeb/XMLSERVICES/",

	this.mediatype = "text/xml";
	this.method = "post"; 
	this.type = "xml";
	this.requestData = "";
}

SendOpt.prototype.optInit = function optInit(opt) {
	for (var key in opt) {
		eval("this." + key + "=opt." + key + ";");
	}
};

SendOpt.prototype.optError = function optError(e){
	var errorBuffer = new StringBuffer();
	errorBuffer.append('[통신작업중 장애가 발생했습니다.]\n');
	errorBuffer.append('ERROR TYPE : ' + e.errorType + ", STATUS CODE : " + e.responseStatusCode);
	
	alert(errorBuffer.toString());
};

SendOpt.prototype.setRequestData = function setRequestData(reqMsg) {
	this.requestData = reqMsg;
};

SendOpt.prototype.getRequeatData = function getRequeatData
```

응답 (200):

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message><proframeHeader>
<pfmAppName>FS-DIS2</pfmAppName>
<pfmSvcName>DISMenuSO</pfmSvcName>
<pfmFnName>selectService</pfmFnName>
<pfmGlobalNo>49075ef60afe00976e981b92967dbc4e</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829004014966</pfmTrTime>
<pfmClntIp>9.234.151.22</pfmClntIp>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<DISServiceDTO>
<divisionId>MDIS01001000000000</divisionId>
<divisionNm>펀드공시검색</divisionNm>
<serviceId>SDIS01001000000</serviceId>
<serviceNm>펀드공시검색 서비스</serviceNm>
<serviceDesc>펀드에 대한 &lt;SPAN>전체적인(정기/수시) 공시사항&lt;/SPAN>을 검색할 수 있습니다. &lt;span style="color:#e63b3b; font-weight:bold;">※ 검색결과에서 제목 셀 클릭 시 정렬 가능&lt;/span></serviceDesc>
<principleAtc>&lt;ul>&lt;li>본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.&lt;/li>&lt;li>[구분]란에 &lt;img src="/img/sub/ico_jung.gif" class="middle" alt="정"/>는 분기· 결산등 단위로 공시되는 정기보고서이며 &lt;img src="/img/sub/ico_su.gif"  class="middle" alt="수"/>는 수시로 공시되는 수시보고서입니다.&lt;/li>&lt;li>&lt;img src="/img/sub/btn_inquire.gif"  class="middle" alt="돋보기"/>클릭하면 펀드에 대한 상세정보를 확인할 수 있습니다.&lt;/li>&lt;/ul></principleAtc>
<spclCont />
<outputFormNo>DIS0001</outputFormNo>
<formSrtDt>19000101</formSrtDt>
<orderSeq>1</orderSeq>
<serviceStt />
</DISServiceDTO></message></root>
```

화면 글:

```
본문바로가기
공지사항보고서 및 근거기준시스템 이용가이드업무지원서비스사이트 맵
펀드
	
메뉴검색

현재서비스모드

투자예정자
	
펀드공시
금융투자회사공시
펀드매니저/애널리스트
기타공시
ISA비교공시
펀드다모아
금융상품한눈에
디딤펀드
전체메뉴
마이서비스Zone 바로가기
펀드공시검색
수시공시
펀드판매사 변경
펀드기준가격 및 등락
펀드 보수 및 비용
펀드 설정현황
특정유형펀드
펀드비교검색
펀드운용실적비교
연금상품 펀드비교
매매비중 및 수수료율
펀드판매회사 관련 공시
펀드 수익비용 계산기
연금저축펀드 비교공시
연금저축펀드 비교공시(2020년 이후)
사모펀드 자산운용보고서
펀드공시검색

펀드에 대한 전체적인(정기/수시) 공시사항을 검색할 수 있습니다. ※ 검색결과에서 제목 셀 클릭 시 정렬 가능

운용사선택

	

자산운용사 전체




펀드 검색

	
펀드명
펀드선택
표준코드

펀드유형	
-all-
주식형
혼합주식형
혼합채권형
채권형
단기금융
투자계약
파생상품
부동산
실물
재간접
변액보험
특
```

### `/wq/fundann/DISSalCmsFTimeChgStut.xml`

버튼:

```
btnSearchWord : 검색
```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectGrandMenu</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISMenuDTO>
</DISMenuDTO>
</message>

```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectService</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISServiceDTO>
    <divisionId>MDIS01001000000000</divisionId>
</DISServiceDTO>
</message>

```

응답 (200):

```xml
/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * 웹스퀘어 ajax통신을 위한 Object options JSON형태 객체 
 * 
 * 	[websquare 통신 Object 정의]
 *   SendOpt.action : ajax 요청주소
 *   SendOpt.mode : asynchronous(default)/synchronous 
 *   SendOpt.mediatype : application/x-www-form-urlencoded , application/json , application/xml , text/xml
 *   SendOpt.method : get/post/put/delete
 *   SendOpt.requestData : 요청본문
 *   SendOpt.timeout : ajax요청후 timeout 시간. 이시간이 초과해도 응답이 오지 않는 경우 error callback함수를 실행
 *   SendOpt.type : xml/json. xml인 경우 success callback함수의 인자객체의 responseBody속성에 xml객체가 설정되고,
	   		   json인 경우 자바스크립트 객체가 설정된다.나머지 경우는 text형식이 설정.
 *   SendOpt.beforeAjax : 요청전에 실행되는 함수로 이 함수내에서 false를 return하면 ajax요청을 하지 않는다
 *   SendOpt.success : 요청이 성공한 경우 실행되는 callback함수
 *   SendOpt.error : 요청이 실패한 경우 실행되는 callback함수
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
 */
function SendOpt() {
	if (location.href.indexOf('localhost') != -1) this.action = "/proxy/prfProxy.jsp";	
	else this.action = "/proframeWeb/XMLSERVICES/",

	this.mediatype = "text/xml";
	this.method = "post"; 
	this.type = "xml";
	this.requestData = "";
}

SendOpt.prototype.optInit = function optInit(opt) {
	for (var key in opt) {
		eval("this." + key + "=opt." + key + ";");
	}
};

SendOpt.prototype.optError = function optError(e){
	var errorBuffer = new StringBuffer();
	errorBuffer.append('[통신작업중 장애가 발생했습니다.]\n');
	errorBuffer.append('ERROR TYPE : ' + e.errorType + ", STATUS CODE : " + e.responseStatusCode);
	
	alert(errorBuffer.toString());
};

SendOpt.prototype.setRequestData = function setRequestData(reqMsg) {
	this.requestData = reqMsg;
};

SendOpt.prototype.getRequeatData = function getRequeatData
```

응답 (200):

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message><proframeHeader>
<pfmAppName>FS-DIS2</pfmAppName>
<pfmSvcName>DISMenuSO</pfmSvcName>
<pfmFnName>selectService</pfmFnName>
<pfmGlobalNo>4907976f0afe00976412c1b673e0f016</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829004029423</pfmTrTime>
<pfmClntIp>9.234.151.22</pfmClntIp>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<DISServiceDTO>
<divisionId>MDIS01001000000000</divisionId>
<divisionNm>펀드공시검색</divisionNm>
<serviceId>SDIS01001000000</serviceId>
<serviceNm>펀드공시검색 서비스</serviceNm>
<serviceDesc>펀드에 대한 &lt;SPAN>전체적인(정기/수시) 공시사항&lt;/SPAN>을 검색할 수 있습니다. &lt;span style="color:#e63b3b; font-weight:bold;">※ 검색결과에서 제목 셀 클릭 시 정렬 가능&lt;/span></serviceDesc>
<principleAtc>&lt;ul>&lt;li>본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.&lt;/li>&lt;li>[구분]란에 &lt;img src="/img/sub/ico_jung.gif" class="middle" alt="정"/>는 분기· 결산등 단위로 공시되는 정기보고서이며 &lt;img src="/img/sub/ico_su.gif"  class="middle" alt="수"/>는 수시로 공시되는 수시보고서입니다.&lt;/li>&lt;li>&lt;img src="/img/sub/btn_inquire.gif"  class="middle" alt="돋보기"/>클릭하면 펀드에 대한 상세정보를 확인할 수 있습니다.&lt;/li>&lt;/ul></principleAtc>
<spclCont />
<outputFormNo>DIS0001</outputFormNo>
<formSrtDt>19000101</formSrtDt>
<orderSeq>1</orderSeq>
<serviceStt />
</DISServiceDTO></message></root>
```

화면 글:

```
본문바로가기
공지사항보고서 및 근거기준시스템 이용가이드업무지원서비스사이트 맵
펀드
	
메뉴검색

현재서비스모드

투자예정자
	
펀드공시
금융투자회사공시
펀드매니저/애널리스트
기타공시
ISA비교공시
펀드다모아
금융상품한눈에
디딤펀드
전체메뉴
마이서비스Zone 바로가기
펀드공시검색
수시공시
펀드판매사 변경
펀드기준가격 및 등락
펀드 보수 및 비용
펀드 설정현황
특정유형펀드
펀드비교검색
펀드운용실적비교
연금상품 펀드비교
매매비중 및 수수료율
펀드판매회사 관련 공시
펀드 수익비용 계산기
연금저축펀드 비교공시
연금저축펀드 비교공시(2020년 이후)
사모펀드 자산운용보고서
펀드공시검색

펀드에 대한 전체적인(정기/수시) 공시사항을 검색할 수 있습니다. ※ 검색결과에서 제목 셀 클릭 시 정렬 가능

운용사선택

	

자산운용사 전체


펀드명	
펀드유형	
-all-
주식형
혼합주식형
혼합채권형
채권형
단기금융
투자계약
파생상품
부동산
실물
재간접
변액보험
특별자산
혼합자산
기업성장


검색결과:
```

### `/wq/fundann/DISSalCmsCmpStut.xml`

버튼:

```
btnSearchWord : 검색
```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectGrandMenu</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISMenuDTO>
</DISMenuDTO>
</message>

```

보낸 본문:

```xml
<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISMenuSO</pfmSvcName>
    <pfmFnName>selectService</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <DISServiceDTO>
    <divisionId>MDIS01001000000000</divisionId>
</DISServiceDTO>
</message>

```

응답 (200):

```xml
/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * 웹스퀘어 ajax통신을 위한 Object options JSON형태 객체 
 * 
 * 	[websquare 통신 Object 정의]
 *   SendOpt.action : ajax 요청주소
 *   SendOpt.mode : asynchronous(default)/synchronous 
 *   SendOpt.mediatype : application/x-www-form-urlencoded , application/json , application/xml , text/xml
 *   SendOpt.method : get/post/put/delete
 *   SendOpt.requestData : 요청본문
 *   SendOpt.timeout : ajax요청후 timeout 시간. 이시간이 초과해도 응답이 오지 않는 경우 error callback함수를 실행
 *   SendOpt.type : xml/json. xml인 경우 success callback함수의 인자객체의 responseBody속성에 xml객체가 설정되고,
	   		   json인 경우 자바스크립트 객체가 설정된다.나머지 경우는 text형식이 설정.
 *   SendOpt.beforeAjax : 요청전에 실행되는 함수로 이 함수내에서 false를 return하면 ajax요청을 하지 않는다
 *   SendOpt.success : 요청이 성공한 경우 실행되는 callback함수
 *   SendOpt.error : 요청이 실패한 경우 실행되는 callback함수
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
 */
function SendOpt() {
	if (location.href.indexOf('localhost') != -1) this.action = "/proxy/prfProxy.jsp";	
	else this.action = "/proframeWeb/XMLSERVICES/",

	this.mediatype = "text/xml";
	this.method = "post"; 
	this.type = "xml";
	this.requestData = "";
}

SendOpt.prototype.optInit = function optInit(opt) {
	for (var key in opt) {
		eval("this." + key + "=opt." + key + ";");
	}
};

SendOpt.prototype.optError = function optError(e){
	var errorBuffer = new StringBuffer();
	errorBuffer.append('[통신작업중 장애가 발생했습니다.]\n');
	errorBuffer.append('ERROR TYPE : ' + e.errorType + ", STATUS CODE : " + e.responseStatusCode);
	
	alert(errorBuffer.toString());
};

SendOpt.prototype.setRequestData = function setRequestData(reqMsg) {
	this.requestData = reqMsg;
};

SendOpt.prototype.getRequeatData = function getRequeatData
```

응답 (200):

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message><proframeHeader>
<pfmAppName>FS-DIS2</pfmAppName>
<pfmSvcName>DISMenuSO</pfmSvcName>
<pfmFnName>selectService</pfmFnName>
<pfmGlobalNo>4907d0220afe00976b20f3968071088d</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829004043938</pfmTrTime>
<pfmClntIp>9.234.151.22</pfmClntIp>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<DISServiceDTO>
<divisionId>MDIS01001000000000</divisionId>
<divisionNm>펀드공시검색</divisionNm>
<serviceId>SDIS01001000000</serviceId>
<serviceNm>펀드공시검색 서비스</serviceNm>
<serviceDesc>펀드에 대한 &lt;SPAN>전체적인(정기/수시) 공시사항&lt;/SPAN>을 검색할 수 있습니다. &lt;span style="color:#e63b3b; font-weight:bold;">※ 검색결과에서 제목 셀 클릭 시 정렬 가능&lt;/span></serviceDesc>
<principleAtc>&lt;ul>&lt;li>본화면은 자본시장법 제 9조 제 7항(모집) 및 제 9항(매출)에서 정하는 방법으로 발행된 공모펀드에 대해서만 공시합니다.&lt;/li>&lt;li>[구분]란에 &lt;img src="/img/sub/ico_jung.gif" class="middle" alt="정"/>는 분기· 결산등 단위로 공시되는 정기보고서이며 &lt;img src="/img/sub/ico_su.gif"  class="middle" alt="수"/>는 수시로 공시되는 수시보고서입니다.&lt;/li>&lt;li>&lt;img src="/img/sub/btn_inquire.gif"  class="middle" alt="돋보기"/>클릭하면 펀드에 대한 상세정보를 확인할 수 있습니다.&lt;/li>&lt;/ul></principleAtc>
<spclCont />
<outputFormNo>DIS0001</outputFormNo>
<formSrtDt>19000101</formSrtDt>
<orderSeq>1</orderSeq>
<serviceStt />
</DISServiceDTO></message></root>
```

화면 글:

```
본문바로가기
공지사항보고서 및 근거기준시스템 이용가이드업무지원서비스사이트 맵
펀드
	
메뉴검색

현재서비스모드

투자예정자
	
펀드공시
금융투자회사공시
펀드매니저/애널리스트
기타공시
ISA비교공시
펀드다모아
금융상품한눈에
디딤펀드
전체메뉴
마이서비스Zone 바로가기
펀드공시검색
수시공시
펀드판매사 변경
펀드기준가격 및 등락
펀드 보수 및 비용
펀드 설정현황
특정유형펀드
펀드비교검색
펀드운용실적비교
연금상품 펀드비교
매매비중 및 수수료율
펀드판매회사 관련 공시
펀드 수익비용 계산기
연금저축펀드 비교공시
연금저축펀드 비교공시(2020년 이후)
사모펀드 자산운용보고서
펀드공시검색

펀드에 대한 전체적인(정기/수시) 공시사항을 검색할 수 있습니다. ※ 검색결과에서 제목 셀 클릭 시 정렬 가능

운용사선택

	

자산운용사 전체


기준일자	
최신일 기준
최근 월말
최근 년도
	

펀드명	
펀드유형	
-all-
주식형
혼합주식형
혼합채권형
채권형
단기금융
투자계약
파생상품
부동산
실물
재간접
```
