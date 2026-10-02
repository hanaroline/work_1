# 탐침 — 금투협 오픈API 목록 (https 로 한 번 더)

받은 때: 2026-08-30T05:05:44.893Z

`https://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp`

22차는 목록을 채우는 AJAX 두 건이 **웹방화벽에 막혀** 빈 표가 나왔다.
막힌 요청이 `http://` 였으므로 스킴만 바꿔 한 번 더 연다. 또 막히면
**확인 실패로 닫는다** — 더 두드리지 않는다.

- HTTP 200

- 목록을 채우는 통신 3건 중 **막힌 것 2건**
- 분류 드롭다운: :전체

## 표에서 읽은 줄 (머리글 제외)

_줄이 하나도 없다._ 위의 막힌 통신 수가 0이 아니면 이것은 **막힌 것이지**
**목록이 빈 것이 아니다.** 이 빈칸을 근거로 "펀드 API 는 없다" 고 말하지 말 것.

## 펀드 낱말이 걸린 줄

_없음._

## 오간 통신

### 200 `https://openapi.kofia.or.kr/apiStut/OPENAPISvcStut.jsp`

- 8614바이트

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
		====================
```

### 200 — **방화벽 차단** `https://openapi.kofia.or.kr/proframeWeb/XMLSERVICES/`

- 310바이트

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

### 200 — **방화벽 차단** `https://openapi.kofia.or.kr/proframeWeb/XMLSERVICES/`

- 310바이트

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
