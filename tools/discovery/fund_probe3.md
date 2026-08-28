# 펀드 원천 탐색 3차 — 금투협 호출 정의

조사 시각: 2026-08-28T15:27:57.661Z

WebSquare 는 화면을 .xml 로 내려받아 그린다. 그 안에 서비스 이름과 보낼
필드가 적혀 있으므로, 버튼을 눌러 가며 알아내는 것보다 이걸 읽는 편이 빠르다.

- 펀드 관련 화면: 5개
- 뽑은 서비스명: 0개
- 뽑은 DTO: 0개
- 뽑은 엔드포인트: 0개

## 화면

| 경로 | 상태 | 크기 |
|---|---|---:|
| `/wq/fundann/DISFundAssetStst.xml` | 200 | 1580 |
| `/wq/fundann/DISFundFeeStstCom.xml` | 200 | 1580 |
| `/wq/fundann/DISFundStndPrcStst.xml` | 200 | 1580 |
| `/wq/fundann/DISFundAnnList.xml` | 200 | 1580 |
| `/wq/fundann/DISFundUnityInfo.xml` | 200 | 1580 |

## 뽑은 이름

```
서비스: 

DTO: 

엔드포인트: 
```

## 호출 결과

| 서비스 | DTO | 결과 | 행 흔적 |
|---|---|---|---:|
| COMFundUnityInfoSO | COMFundUnityInfoInputDTO | 200 696B (오류) | 0 |
| COMFundPriceModSO | COMFundPriceModInputDTO | 200 704B (오류) | 0 |

## 응답 맛보기

### COMFundUnityInfoSO

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message>
<proframeHeader>
<pfmAppName>FS-COM</pfmAppName>
<pfmSvcName>COMFundUnityInfoSO</pfmSvcName>
<pfmFnName>select</pfmFnName>
<pfmGlobalNo>48fc40280afe009667ff91b0547adf2b</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829002806184</pfmTrTime>
<pfmClntIp>130.131.215.209</pfmClntIp>
<pfmResponseType>S</pfmResponseType>
<pfmResponseCode>COMS9009</pfmResponseCode>
<pfmResponseTitle>MODULE ERROR</pfmResponseTitle>
<pfmResponseBasc>proframe application name [FS-COM] [COMFundUnityInfoSO] is not found.</pfmResponseBasc>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<data /></message></root>
```

### COMFundPriceModSO

```xml
<?xml version="1.0" encoding="UTF-8"?><root><message>
<proframeHeader>
<pfmAppName>FS-COM</pfmAppName>
<pfmSvcName>COMFundPriceModSO</pfmSvcName>
<pfmFnName>select</pfmFnName>
<pfmGlobalNo>48fc40cf0afe00965b04f5b448ce91ec</pfmGlobalNo>
<pfmTrDate>20260829</pfmTrDate>
<pfmTrTime>20260829002806351</pfmTrTime>
<pfmClntIp>130.131.215.209</pfmClntIp>
<pfmResponseType>S</pfmResponseType>
<pfmResponseCode>COMS9009</pfmResponseCode>
<pfmResponseTitle>MODULE ERROR</pfmResponseTitle>
<pfmResponseBasc>proframe service operation [FS-COM] [COMFundPriceModSO] [select] is not found.</pfmResponseBasc>
<pfmResponseDtal></pfmResponseDtal>
</proframeHeader>
<systemHeader>
</systemHeader>
<data /></message></root>
```
