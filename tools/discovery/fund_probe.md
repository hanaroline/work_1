# 펀드 원천 탐색

조사 시각: 2026-08-28T15:00:05.166Z

ETF 화면이 가능했던 이유는 네이버 etfAnalysis 하나가 편입종목을 줬기 때문이다.
펀드에도 그런 자리가 있는지 확인한 기록. **보유종목 상위 10을 못 구하면
화면의 본체가 없다.**

| 분류 | 대상 | 상태 | 크기 | 인코딩 | 보유종목 | 수익률 | 설정액 | 보수 |
|---|---|---|---:|---|:-:|:-:|:-:|:-:|
| naver | 펀드 메인 | 200 | 185762 | euc-kr | ○ | · | · | ○ |
| naver | 펀드 검색 화면 | 200 | 185770 | euc-kr | ○ | · | · | ○ |
| naver | 펀드 목록 API 후보 | 404 | 2741 | euc-kr | · | · | · | ○ |
| naver | 모바일 펀드 홈 | 404 | 4209 | utf-8 | · | · | · | · |
| naver | 모바일 펀드 API 후보 | 404 | 4209 | utf-8 | · | · | · | · |
| kofia | 펀드다모아 | ✗ fetch failed | – | – | · | · | · | · |
| kofia | 전자공시 dis | 200 | 536 | utf-8 | · | · | · | · |
| kofia | 펀드다모아 검색 API 후보 | ✗ fetch failed | – | – | · | · | · | · |
| kofia | dis .wjson 후보 | 200 | 695 | utf-8 | · | · | · | · |
| vendor | 펀드닥터(제로인) | 200 | 42168 | utf-8 | ○ | ○ | · | ○ |
| vendor | 에프앤가이드 펀드 | 404 | 80828 | utf-8 | · | ○ | · | ○ |
| vendor | 한국포스증권(펀드슈퍼마켓) | ✗ fetch failed | – | – | · | · | · | · |
| amc | 미래에셋자산운용 | 403 | 257 | utf-8 | · | · | · | · |
| amc | 미래에셋 펀드 목록 후보 | 403 | 257 | utf-8 | · | · | · | · |
| amc | 삼성자산운용 | 200 | 128503 | utf-8 | · | ○ | ○ | ○ |
| amc | KB자산운용 | ✗ fetch failed | – | – | · | · | · | · |
| open | 공공데이터포털 금투협 펀드 | 401 | 60 | utf-8 | · | · | · | · |
| open | 금감원 오픈API | 200 | 39661 | utf-8 | · | · | · | ○ |
| yahoo | 뮤추얼펀드 VFIAX | 200 | 23253 | euc-kr | ○ | ○ | ○ | ○ |
| yahoo | 뮤추얼펀드 FXAIX | 200 | 20631 | utf-8 | ○ | ○ | ○ | ○ |
| yahoo | 뮤추얼펀드 VTSAX | 200 | 23461 | utf-8 | ○ | ○ | ○ | ○ |
| yahoo | 국내 공모펀드 후보(KR) | 400 | 95 | utf-8 | · | · | · | · |

## 응답 맛보기

### [naver] 펀드 메인

```


	
	
	
<html lang='ko'>
<head>


	
	
		
			
				<title>Npay 증권</title>
			
			
		
	




<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<meta http-equiv="Content-Script-Type" content="text/javascript">
<meta http-equiv="Content-Style-Type" content="text/css">
<meta name="apple-mobile-web-app-title" content="Npay 증권" />





	
		<meta property="og:title" content="Npay 증권"/>
		<meta property="og:image" content="https://ssl.pstatic.net/static/m/stock/im/2016/08/og_stock-200.png"/>
		<meta property="og:url" content="https://finance.naver.com"/>
		<meta property="og:descript
```

### [naver] 펀드 검색 화면

```


	
	
	
<html lang='ko'>
<head>


	
	
		
			
				<title>Npay 증권</title>
			
			
		
	




<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<meta http-equiv="Content-Script-Type" content="text/javascript">
<meta http-equiv="Content-Style-Type" content="text/css">
<meta name="apple-mobile-web-app-title" content="Npay 증권" />





	
		<meta property="og:title" content="Npay 증권"/>
		<meta property="og:image" content="https://ssl.pstatic.net/static/m/stock/im/2016/08/og_stock-200.png"/>
		<meta property="og:url" content="https://finance.naver.com"/>
		<meta property="og:descript
```

### [naver] 펀드 목록 API 후보

```

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=euc-kr">
<title>네이버 :: 세상의 모든 지식, 네이버</title>

<style type="text/css">
.error_content * {margin:0;padding:0;}
.error_content img{border:none;}
.error_content em {font-style:normal;}
.error_content {width:410px; margin:80px auto 0; padding:57px 0 0 0; font-size:12px; font-family:"나눔고딕", "NanumGothic", "돋움", Dotum, AppleGothic, Sans-serif; text-align:left; line-height:14px; background:url(https://ssl.pstatic.net/static/c
```

### [naver] 모바일 펀드 홈

```
<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no">
    <title>Npay 증권</title>
    <link rel="shortcut icon" href="https://ssl.pstatic.net/imgstock/favicon.ico">
    <link rel="stylesheet" type="text/css" href="https://ssl.pstatic.net/imgstock/static.mobile/css/finance/min/20260826170058/mstock_error.css">
</head>
<body>
<!-- header -->
<header id="header">
    <div class="header">
        <h1>
            <a href="/" class="button">
                <spa
```

### [naver] 모바일 펀드 API 후보

```
<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no">
    <title>Npay 증권</title>
    <link rel="shortcut icon" href="https://ssl.pstatic.net/imgstock/favicon.ico">
    <link rel="stylesheet" type="text/css" href="https://ssl.pstatic.net/imgstock/static.mobile/css/finance/min/20260826170058/mstock_error.css">
</head>
<body>
<!-- header -->
<header id="header">
    <div class="header">
        <h1>
            <a href="/" class="button">
                <spa
```

### [kofia] 전자공시 dis

```
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=EUC-KR">
<title>Insert title here</title>
<script type="text/javascript" src="/js/com/disCommon.js"></script>
<script type="text/javascript">
window.onload = function () {
	//location.href = menuLinkUrl + "?w2xPath=/wq/main/intro.xml";
	location.href = menuLinkUrl + "?w2xPath=/wq/main/main.xml";  
}
</script>
</head>
<body>

</body>
</html>

```

### [kofia] dis .wjson 후보

```
<?xml version="1.0" encoding="UTF-8"?><root><message>
<proframeHeader>
<pfmAppName>FS-COM</pfmAppName>
<pfmSvcName>COMFundUnityInfoSO</pfmSvcName>
<pfmFnName>select</pfmFnName>
<pfmGlobalNo>48e25d250afe0096180672196c952f36</pfmGlobalNo>
<pfmTrDate>20260828</pfmTrDate>
<pfmTrTime>20260828235949669</pfmTrTime>
<pfmClntIp>135.232.225.20</pfmClntIp>
<pfmResponseType>S</pfmResponseType>
<pfmResponseCode>COMS9009</pfmResponseCode>
<pfmResponseTitle>MODULE ERROR</pfmResponseTitle>
<pfmResponseBasc>proframe application name [FS-COM] [COMFundUnityInfoSO] is not found.</pfmResponseBasc>
<pfmResponseDta
```

### [vendor] 펀드닥터(제로인)

```

<!DOCTYPE html>
<html>
<body>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WSBDNCL');</script>
<!-- End Google Tag Manager -->
<!-- 2019.12.26 김사랑 추가 Google Tag Manager >
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event
```

### [vendor] 에프앤가이드 펀드

```

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--Str : favicon -->
    <link rel="icon" href="/favicon.ico?v=20251020">
    <!--End : favicon -->
    <!--Str : apple-touch-icon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png">
    <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png">
    <link rel="apple-touch-icon" href="/apple-touch
```

### [amc] 미래에셋자산운용

```
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>301 Moved Permanently</title>
</head><body>
<h1>Moved Permanently</h1>
<p>The document has moved <a href="http://investments.miraeasset.com/magi/index.html">here</a>.</p>
</body></html>

```

### [amc] 미래에셋 펀드 목록 후보

```
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>301 Moved Permanently</title>
</head><body>
<h1>Moved Permanently</h1>
<p>The document has moved <a href="http://investments.miraeasset.com/magi/index.html">here</a>.</p>
</body></html>

```

### [amc] 삼성자산운용

```
<!DOCTYPE html>


<html lang="ko" id="top-of-site" class="">
	<head>
		




<script>
	var lang			= "ko";
	var langUri         = "";
	var resourceDomain	= "/assets";
</script>


		

		
		
		







<script>
	(function() {
		const hostname	= location.hostname;
		const isLocal	= hostname.endsWith("localhost");
		const isMobPage	= hostname.endsWith("m.samsungfund.com");

		const width		= top.innerWidth;
		const height	= top.innerHeight;
		const isDesktop	= width > 1280;
		const isTablet	= width > 680 && !isDesktop;
		const isMobile	= !isDesktop && !isTablet;
```

### [open] 공공데이터포털 금투협 펀드

```
{"code":-401,"msg":"인증키는 필수 항목 입니다."}

```

### [open] 금감원 오픈API

```











<!-- 시스템 공지사항 표출 여부 -->


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="utf-8">
<head>
<title>전자공시 OPENDART 시스템</title>
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="x-ua-compatible" content="ie=edge" />
<link rel="stylesheet" type="text/css" href="/css/common.css" />
<link rel="stylesheet" type="text/css" 
```

### [yahoo] 뮤추얼펀드 VFIAX

```
{"quoteSummary":{"result":[{"fundProfile":{"maxAge":1,"styleBoxUrl":"https://s.yimg.com/lq/i/fi/3_0stylelargeeq2.gif","family":"Vanguard","categoryName":"Large Blend","legalType":null,"managementInfo":{"managerName":"","managerBio":"Aur챕lie Denis, CFA, Portfolio Manager at Vanguard. She has been with Vanguard since 2016, has worked in investment management since 2017, has managed investment portfolios since 2023, and has co-managed the Fund since February 2023. Education: B.S., Pennsylvania State University.","startdate":{"raw":1739836800,"fmt":"2025-02-18"}},"feesExpensesInvestment":{"annualR
```

### [yahoo] 뮤추얼펀드 FXAIX

```
{"quoteSummary":{"result":[{"fundProfile":{"maxAge":1,"styleBoxUrl":"https://s.yimg.com/lq/i/fi/3_0stylelargeeq2.gif","family":"Fidelity Investments","categoryName":"Large Blend","legalType":null,"managementInfo":{"managerName":"","managerBio":"Robert Regan is a Portfolio Manager. He has been with Geode since 2016. Prior to joining Geode, Mr. Regan was a Senior Implementation Portfolio Manager at State Street Global Advisors from 2008 to 2016. Previously, Mr. Regan was employed by PanAgora Asset Management from 1997 to 2008, most recently as a Portfolio Manager. Mr. Regan began his career at I
```

### [yahoo] 뮤추얼펀드 VTSAX

```
{"quoteSummary":{"result":[{"fundProfile":{"maxAge":1,"styleBoxUrl":"https://s.yimg.com/lq/i/fi/3_0stylelargeeq2.gif","family":"Vanguard","categoryName":"Large Blend","legalType":null,"managementInfo":{"managerName":"","managerBio":"Nicholas Birkett, CFA, Portfolio Manager at Vanguard. He worked in investment banking from 2005 to 2016, has been with Vanguard since 2017, and has co-managed the Fund since August 2023. Education: B.S., University of Bath.","startdate":{"raw":1739836800,"fmt":"2025-02-18"}},"feesExpensesInvestment":{"annualReportExpenseRatio":{"raw":4.0E-4,"fmt":"0.04%"},"frontEnd
```

### [yahoo] 국내 공모펀드 후보(KR)

```
{"finance":{"result":null,"error":{"code":"Bad Request","description":"Invalid Search Query"}}}
```
