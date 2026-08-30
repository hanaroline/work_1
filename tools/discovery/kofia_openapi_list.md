# 탐침 — 금투협 오픈API 서비스 목록 (렌더해서 읽는다)

받은 때: 2026-08-30T05:02:20.379Z

`http://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp`

앞선 탐침은 HTML 만 받아서 표 머리글까지만 봤다. 그건 **못 읽은 것이지**
**없는 것이 아니다.** 이번엔 브라우저로 열어 렌더가 끝난 뒤 읽는다.

- HTTP 200 · 검색 버튼: false

## 표에서 읽은 줄

- 분류 | 오픈API명 | 설명

## 펀드 낱말이 걸린 줄

_없음._ 표를 못 읽었다면 이 칸은 아무 뜻도 없다.

## 오간 통신 (목록을 채우는 응답이 여기 있을 수 있다)


### 200 `http://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp`

- text/html; charset=utf-8 · 8614바이트

```


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title>금융투자협회 오픈API서비스</title>
<script language="javascript" src="../js/COMUtil.js"></script>
<script language="javascript" src="../js/COMAjaxLibProframe.js"></script>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<link rel="stylesheet" href="../lib/css/sub.css" type="text/css" />
<script type="text/javascript" src="../lib/jquery-1.9.1.js"></script>
<script type="text/javascript" src="../lib/jquery.carouFredSel-6.2.0-packed.js"></script>
<script language="javascript" src="../js/COMUtil.js"></script>
<script language="javascript" src="../js/COMAjaxLibProframe.js"></script>
<script type="text/javascript">
<!--
		var OPENAPIDataDTO = {"OPENAPIDataDTO":{}};


		$(document).ready(function() {
			setApiBrnNmList();
			setApiInfoList();  //API정보목록 가져오기
//			getServiceReady();	//서비스준비중
		});

		
		/*===============================================================
		//API분류명 가져오는 부분
		================================================================*/
		function setApiBrnNmList(){
			var appId = "FS-OPENAPI";		
			var svcId = "OPENAPISvcStutSO";
			var fnId = "getApiBrnList";
						
			callProFrame(appId,svcId,fnId,OPENAPIDataDTO,getApiBrnNm);
		}	
	
	
		function getApiBrnNm(xmlHttp){	
			var brnCd="";
			var brnNm="";
			var totalcount=0;
			var sel = document.getElementById("stdSelect");			
			var cnt = sel.options.length;			

			if(xmlHttp.readyState == 4) {	
		        if(xmlHttp.status == 200) {  		
					var responseXml = xmlHttp.responseXML;	
		
					totalcount = responseXml.getElementsByTagName("dbio_total_count_")[0].childNodes[0].nodeValue;		

					if(totalcount>0){
						var i;
						for(i=0;i<totalcount;i++){	
							brnCd  = responseXml.getElementsByTagName("val1")[i].childNodes[0].nodeValue;		
							brnNm  = responseXml.getElementsByTagName("val2")[i].childNodes[0].nodeValue;		
		
							sel.options.add(new Option(brnNm,brnCd));
						}
					}
		      } else {
		            alert(xmlHttp.statusText);
	     	  }
	   	   }
		}
		/*===============================================================
		//API분류명 가져오는 부분 끝
		================================================================*/ 

		
		/*===============================================================
		//API정보목록 가져오는 부분
		================================================================*/
		function setApiInfoList(){
			var appId = "FS-OPENAPI";		
			var svcId = "OPENAPISvcStutSO";
			var fnId = "getApiInfoList";
			var srchNM = document.getElementById("stdApiNm").value;
			var srchBrnCd = document.getElementById("stdSelect").value;

			pfm_insertValue(OPENAPIDataDTO,"val1",srchBrnCd);
			pfm_insertValue(OPENAPIDataDTO,"val2",srchNM);
			callProFrame(appId,svcId,fnId,OPENAPIDataDTO,getApiInfoList);
		}	
	
	
		function g
```

### 200 `http://openapi.kofia.or.kr/proframeWeb/XMLSERVICES/`

- text/html · 310바이트

```
<br>
<br>
<center>
<h2>
The request / response that are contrary to the Web firewall security policies have been blocked.
</h2>
<table>
<tr>
<td>Detect time</td>
<td></td>
</tr>
<tr>
<td>Detect client IP</td>
<td></td>
</tr>
<tr>
<td>Detect URL</td>
<td></td>
</tr>
</table>
</center>
<br>
```

### 200 `http://openapi.kofia.or.kr/proframeWeb/XMLSERVICES/`

- text/html · 310바이트

```
<br>
<br>
<center>
<h2>
The request / response that are contrary to the Web firewall security policies have been blocked.
</h2>
<table>
<tr>
<td>Detect time</td>
<td></td>
</tr>
<tr>
<td>Detect client IP</td>
<td></td>
</tr>
<tr>
<td>Detect URL</td>
<td></td>
</tr>
</table>
</center>
<br>
```

### 200 `http://openapi.kofia.or.kr/guide/sub1.jsp`

- text/html; charset=utf-8 · 11841바이트

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>금융투자협회 오픈API서비스</title>
	
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<link rel="stylesheet" href="../lib/css/sub.css" type="text/css" />
<script type="text/javascript" src="../lib/jquery-1.9.1.js"></script>
<script type="text/javascript" src="../lib/jquery.carouFredSel-6.2.0-packed.js"></script>
<script language="javascript" src="../js/COMUtil.js"></script>
<script language="javascript" src="../js/COMAjaxLibProframe.js"></script>
</head>
<body>
<div id="wrap">
	<div id="header">
		
<div class="hgroup">
	<h1><a href="../main.jsp"><img src="../images/logo.png" alt="금융투자협회 오픈API서비스"/></a></h1>
	<ul id="topmenu">
	<li><a href="../guide/sub1.jsp">소개 및 이용방법</a></li>
	<li><a href="../apiStut/OPENAPISvcStut.jsp">API서비스현황</a></li>
	</ul>
</div>
	</div>
	<div id="container">		
		
		<!-- contents -->
		<div class="sub_content sub1_contents">
			
			<p id="tab_tit1"><a href="#tab_con1" onclick="dp_tab(1);return false;"><img src="../images/sub1_tab1_on.gif" alt="소개 및 이용방법"/></a></p>

			<div id="tab_con1">
				<!--<div class="head_msg">
					<h2>금융투자협회 오픈(API) 서비스란?</h2>
					<p>금융투자협회 오픈 API 서비스는 자본시장정보를 공개하고 소통함으로써 신뢰성,효율성,투명성을 높이고 새로운 서비스와 자본시장 정보의 가치를 창출할 수 있도록 하는 서비스 입니다.</p>
				</div>-->
				<div class="sub1_info_box" style="top:70px;">
					<div class="sub1_left_box">
						<h3>소개</h3>
						<div class="sub1_in1" style="padding: 20px 0 65px 162px;">
						<!--금융투자협회에서 서비스하고 있는 자본시장 정보를 외부(기관, 기업, 개인)에서 활용할 수 있도록 열어 놓은 개방형 API 기능 입니다.<br/><br/> 
						제공되는 서비스 대상은 펀드공시, 금융투자회사공시 등이며 자료제공 형태는 JSON, XML 이고 모든 서비스는 HTTP 프로토콜을 이용한 REST 방식으로 통신합니다. 
						--><br/><br/> 
						<p>Do-not-call, 금융투자 교육원의 학습 진도 및 현황 데이터 조회를 제공하고 있습니다.</p>
						</div>
						<h3 class="top_line">이용방법</h3>
						<div class="sub1_in2" style="height:100px;"><br/><br/><p>활용 신청을 하시면 심사과정을 거쳐 서비스를 이용할 수 있는 인증키를 발급 받아 서비스 활용이 가능합니다.</p> 
						</div>
					</div>
					<div class="sub1_img_txt" style="top:10px;">
						<img src="../images/sub1_infotxt.gif" alt="활용자 : 소개 및 이용방법 확인 → 활용요청[제공자 : 신청양식 메일전송] → 신청서작성 및 공문발송[제공자 : 심사 및 서비스 등록(인증키발급) → 인증키전송] → 서비스 활용"/>
					</div>
				</div>		

			</div>
			
			<p id="tab_tit2"><a href="#tab_con2" onclick="dp_tab(2);return false;"><img src="../images/sub1_tab2_off.gif" alt="API 활용약관"/></a></p>

			<div id="tab_con2">
				
				<div class="head_msg">
					<h2>API 활용약관</h2>
					<p>금융투자협회 오픈API 서비스의 활용약관 입니다.</p>
				</div>

				<div class="sub2_info_box">
					<div class="sub2_info_b">
						<div class="sub2_info_m">
							<!--이용약관-->
							<h4 class="tit_term">제 01 조 [목적]</h4>
							<p class="mg_t05">본 활용 약관(이하 ‘약관’이라 합니다.)은 금융투자협회가 제공하는 오픈API 서비스의 이용에 관한 제반 사항과 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

							<h4 class="tit_term mg_t20">제 02 조 [용어의 정의]</h4>
							<ul class="txt_term_list">
			
```

## 이용안내의 링크 (인증키를 어디서 신청하는가)

- 소개 및 이용방법 — `http://openapi.kofia.or.kr/guide/sub1.jsp`
- API서비스현황 — `http://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp`
- 개인정보처리/취급방침 — `http://www.kofia.or.kr/wpge/m_34/etc02.do`
- 이메일무단수집거부 — `http://www.kofia.or.kr/wpge/m_35/etc03.do`

## 화면 본문

```
금융투자협회 오픈API서비스 

 소개 및 이용방법

 API서비스현황

 API 서비스 현황

 금융투자협회 오픈API 서비스현황을 확인 하실 수 있습니다.

 검색 
 
 오픈API명 
 
 분류 

 전체 

 API 서비스 현황 리스트 

 분류

 오픈API명

 설명

 개인정보처리/취급방침

 이메일무단수집거부

 서울특별시 영등포구 의사당대로 143 금융투자협회 대표전화 : 02-2003-9000 
 금융투자협회에서 제공하는 정보는 참고용이며 이용자의 판단에 따른 투자수익 및 정보의 오류등에 따른 손익에 대해서는 책임지지 않습니다.

 COPYRIGHT©2014 KOREA. ALL RIGHT RESERVED.
```
