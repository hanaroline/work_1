# ETF 원천 탐색 2차

- 탐색 시각: 2026-08-28T13:40:07.375Z
- KRX 기준일: (못 찾음)

| 결과 | 항목 | 설명 | 상태 | 요약 |
|---|---|---|---|---|
| ✅ | `krx.session` | 세션 쿠키 획득 (화면 선진입) | - | 쿠키 2개 |
| ❌ | `krx.etf.all` | ETF 전종목 시세 (세션 있음) | - | 영업일 10일 모두 빈 응답 |
| ❌ | `krx2.stat.04301` | MDCSTAT04301 — ETF 전종목 시세 | 400 | JSON 아님: LOGOUT |
| ❌ | `krx2.stat.04401` | MDCSTAT04401 — ETF 개별 시세 추이 | 400 | JSON 아님: LOGOUT |
| ❌ | `krx2.stat.04501` | MDCSTAT04501 — ETF 전종목 등락률 | 400 | JSON 아님: LOGOUT |
| ❌ | `krx2.stat.04601` | MDCSTAT04601 — ETF 투자자별 거래 | 400 | JSON 아님: LOGOUT |
| ❌ | `krx2.stat.04701` | MDCSTAT04701 — ETF 상세 정보 | 400 | JSON 아님: LOGOUT |
| ❌ | `krx2.stat.04801` | MDCSTAT04801 — ETF 구성종목 후보 A | 400 | JSON 아님: LOGOUT |
| ❌ | `krx2.stat.04901` | MDCSTAT04901 — ETF 구성종목 후보 B | 400 | JSON 아님: LOGOUT |
| ❌ | `krx2.stat.05001` | MDCSTAT05001 — ETF 구성종목(PDF) 후보 C | 400 | JSON 아님: LOGOUT |
| ❌ | `krx2.stat.05101` | MDCSTAT05101 — ETF 후보 D | 400 | JSON 아님: LOGOUT |
| ✅ | `krx.otp.csv` | OTP → CSV 내려받기 (PDF 구성종목) | 403 | 35행 · 헤더: 		<html> |
| ✅ | `naver.analysis.full` | etfAnalysis 전문 저장 (구성종목이 섞여 있는가) | 200 | 키 30개 · 배열필드: returnPerformanceList[10]{periodTypeCode,value} \| navPerformanceList[10]{periodTypeCode,value} \| assetPortfolioList[5]{detailTypeCode,weight} \| countryPortfolioList[6]{detailTypeCode, |
| ❌ | `naver.pdf.m.stock` | 국내 구성종목 후보 — m.stock.naver.com/api/stock/069500/etfComposition | 404 | <!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content |
| ❌ | `naver.pdf.m.stock2` | 국내 구성종목 후보 — m.stock.naver.com/api/stock/069500/etfConstituent | 404 | <!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content |
| ❌ | `naver.pdf.m.stock3` | 국내 구성종목 후보 — m.stock.naver.com/api/stock/069500/etfPortfolio | 404 | <!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content |
| ❌ | `naver.pdf.m.stock4` | 국내 구성종목 후보 — m.stock.naver.com/api/stock/069500/etfComponent | 404 | <!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content |
| ❌ | `naver.pdf.m.stock5` | 국내 구성종목 후보 — m.stock.naver.com/api/stock/069500/componentStock | 404 | <!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content |
| ❌ | `naver.pdf.m.stock6` | 국내 구성종목 후보 — m.stock.naver.com/api/stock/069500/etf/component | 404 | <!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content |
| ❌ | `naver.pdf.api.etf` | 국내 구성종목 후보 — api.stock.naver.com/etf/069500/componentStocks | 404 | {"timestamp":"2026-08-28T13:39:57.743+0000","status":404,"error":"Not Found","message":"No message a |
| ❌ | `naver.pdf.api.etf2` | 국내 구성종목 후보 — api.stock.naver.com/stock/069500/etfAnalysis | 404 | {"timestamp":"2026-08-28T13:39:58.042+0000","status":404,"error":"Not Found","message":"No message a |
| ❌ | `naver.pdf.pc.etf` | 국내 구성종목 후보 — finance.naver.com/item/etf_component.naver?code=069500 | 404 | 
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dt |
| ❌ | `naver.pdf.pc.coinfo` | 국내 구성종목 후보 — finance.naver.com/item/coinfo.naver?code=069500 | 200 | HTML · 구성종목 흔적 없음 |
| ❌ | `naver.pdf.pc.main` | 국내 구성종목 후보 — finance.naver.com/item/main.naver?code=069500 | 200 | HTML · 구성종목 흔적 없음 |
| ✅ | `naver.tabs` | ETF 목록의 분류 탭 코드 분포 | 200 | 1163종목 · 탭 {"1":99,"2":336,"3":37,"4":376,"5":23,"6":171,"7":121} |
| ✅ | `yahoo.crumb2` | 쿠키 + crumb | - | crumb O / 쿠키 1개 |
| ❌ | `yahoo.cn.510300.SS` | quoteSummary 상해 · CSI300 | 200 | holdings 0개 · sector 0개 · family - · AUM - |
| ❌ | `yahoo.cn.510500.SS` | quoteSummary 상해 · CSI500 | 200 | holdings 0개 · sector 0개 · family - · AUM - |
| ❌ | `yahoo.cn.588000.SS` | quoteSummary 상해 · 과창판50 | 200 | holdings 0개 · sector 0개 · family - · AUM - |
| ❌ | `yahoo.cn.512880.SS` | quoteSummary 상해 · 증권 | 200 | holdings 0개 · sector 0개 · family - · AUM - |
| ❌ | `yahoo.cn.159915.SZ` | quoteSummary 심천 · 촹예반 | 200 | holdings 0개 · sector 0개 · family - · AUM - |
| ❌ | `yahoo.cn.159949.SZ` | quoteSummary 심천 · 촹예반50 | 200 | holdings 0개 · sector 0개 · family - · AUM - |
| ✅ | `yahoo.cn.2823.HK` | quoteSummary 홍콩 · CSI300 (본토 익스포저) | 200 | holdings 10개 · sector 11개 · family BlackRock Asset Management North Asia Ltd - ETF · AUM 12.81B |
| ✅ | `yahoo.cn.3188.HK` | quoteSummary 홍콩 · CSI300 (다른 운용사) | 200 | holdings 9개 · sector 11개 · family China Asset Management (HK) Limited · AUM 14.6B |
| ✅ | `yahoo.cn.MCHI` | quoteSummary 미국 상장 중국 | 200 | holdings 10개 · sector 11개 · family iShares · AUM 6.28B |
| ✅ | `yahoo.cn.KWEB` | quoteSummary 미국 상장 중국 인터넷 | 200 | holdings 10개 · sector 11개 · family KraneShares · AUM 5.58B |
| ❌ | `issuer.kr.tiger` | 미래에셋 TIGER | 403 | 261B · <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>301 Moved Permanent |
| ✅ | `issuer.kr.kodex` | 삼성 KODEX | 200 | 138726B · <!DOCTYPE html> <html lang="ko" id="top-of-site" class=""> <head>  |
| ✅ | `issuer.kr.kodex.api` | 삼성 KODEX 상품 API | 200 | 138726B · <!DOCTYPE html> <html lang="ko" id="top-of-site" class=""> <head>  |
| ✅ | `issuer.kr.seibro` | 예탁결제원 SEIBRO ETF | 200 | 1048B ·  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org |
