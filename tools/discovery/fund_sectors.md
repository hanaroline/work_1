# 펀드 12차 — 업종구성의 모양

표본 40개. 11차에서 열쇠 이름만 보고 모양을 짐작해 수집기에
넣었다가 3,196개 전부 빈칸이 나왔다. 이번엔 본문을 찍어 놓고 읽는다.

## 모양별 개수

| 모양 | 개수 |
|---|---:|
| `object:result` | 40 |

## 비중의 분모

합이 100 근처면 순자산 대비고, 기준가에 비례해 부풀어 있으면 설정원본 대비다.
둘 다 아니면 **뜻을 모르는 값이므로 싣지 않는다.**

| 코드 | 유형 | 항목수 | 합 | 기준가 | 합÷(기준가/1000) |
|---|---|---:|---:|---:|---:|
| K55364BQ3334 | sectors:true | 10 | 1.00 | 1889.08 | 0.5 |
| K55364BQ3193 | sectors:true | 10 | 1.00 | 1884.72 | 0.5 |
| K55213EO8806 | sectors:true | 8 | 1.00 | 1209.28 | 0.8 |
| K55210BD3228 | sectors:true | 10 | 1.00 | 2144.16 | 0.5 |
| K55210CL5818 | sectors:true | 10 | 1.00 | 1735.25 | 0.6 |
| KR5363AP6407 | sectors:true | 6 | 1.00 | 1316.72 | 0.8 |
| KR5363AH5607 | sectors:true | 6 | 1.00 | 1311.6 | 0.8 |
| KR5363A43940 | sectors:true | 6 | 1.00 | 1313.51 | 0.8 |
| K55101B90814 | sectors:true | 8 | 0.98 | 1175.72 | 0.8 |
| KR5101AU8213 | sectors:true | 8 | 0.98 | 1898.08 | 0.5 |
| KR5101717746 | sectors:true | 8 | 0.98 | 1875.98 | 0.5 |
| K55101B41155 | sectors:true | 8 | 0.98 | 1177.94 | 0.8 |
| KR5101964199 | sectors:true | 8 | 0.98 | 1707.93 | 0.6 |
| K55101B38276 | sectors:true | 8 | 0.98 | 1046.2 | 0.9 |
| KR5363AF6839 | sectors:true | 6 | 1.00 | 1505.72 | 0.7 |
| KR5363AG8636 | sectors:true | 6 | 1.00 | 1504.96 | 0.7 |
| KR5363A44260 | sectors:true | 6 | 1.00 | 1508.83 | 0.7 |
| K55229DL4512 | sectors:true | 10 | 1.00 | 1801.32 | 0.6 |
| K55210BL5223 | sectors:true | 10 | 1.00 | 1539.58 | 0.6 |
| K55229DC7680 | sectors:true | 10 | 1.00 | 1878.53 | 0.5 |
| K55229DC7722 | sectors:true | 10 | 1.00 | 1867.08 | 0.5 |
| K55224EM9100 | sectors:true | 4 | 1.00 | 692.32 | 1.4 |
| K55301D16225 | sectors:true | 2 | 0.99 | 1258.47 | 0.8 |
| K55213EO9085 | sectors:true | 8 | 1.00 | 1015.44 | 1.0 |
| K55229DL4611 | sectors:true | 10 | 1.00 | 1606.53 | 0.6 |

합이 90~110: 0/40 · 기준가로 나눈 값이 90~110: 0/40

## 본문 (앞 다섯)

```json
[
 {
  "code": "K55364BQ3334",
  "type": "sectors:true",
  "name": "에셋플러스알파로보코리아인컴성과보수증권자투자신탁 1-2(주식)",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 1889.08,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "산업재",
     "weight": 0.22478862
    },
    {
     "sectorName": "금융",
     "weight": 0.148242466
    },
    {
     "sectorName": "에너지",
     "weight": 0.145230048
    },
    {
     "sectorName": "IT",
     "weight": 0.121332916
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.114726015
    },
    {
     "sectorName": "의료",
     "weight": 0.081576226
    },
    {
     "sectorName": "필수소비재",
     "weight": 0.064086529
    },
    {
     "sectorName": "소재",
     "weight": 0.041413186
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.031516017
    },
    {
     "sectorName": "유틸리티",
     "weight": 0.027087976
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 },
 {
  "code": "K55364BQ3193",
  "type": "sectors:true",
  "name": "에셋플러스알파로보코리아인컴증권자투자신탁 1-1(주식)",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 1884.72,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "산업재",
     "weight": 0.224788621
    },
    {
     "sectorName": "금융",
     "weight": 0.148242466
    },
    {
     "sectorName": "에너지",
     "weight": 0.14523005
    },
    {
     "sectorName": "IT",
     "weight": 0.121332915
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.114726015
    },
    {
     "sectorName": "의료",
     "weight": 0.081576226
    },
    {
     "sectorName": "필수소비재",
     "weight": 0.064086527
    },
    {
     "sectorName": "소재",
     "weight": 0.041413185
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.031516018
    },
    {
     "sectorName": "유틸리티",
     "weight": 0.027087976
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 },
 {
  "code": "K55213EO8806",
  "type": "sectors:true",
  "name": "한화자사주품은고배당주증권자투자신탁(주식)",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 1209.28,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "금융",
     "weight": 0.54198052
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.171972124
    },
    {
     "sectorName": "산업재",
     "weight": 0.100086915
    },
    {
     "sectorName": "필수소비재",
     "weight": 0.057411704
    },
    {
     "sectorName": "에너지",
     "weight": 0.05305244
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.038894348
    },
    {
     "sectorName": "소재",
     "weight": 0.020134692
    },
    {
     "sectorName": "유틸리티",
     "weight": 0.016467254
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 },
 {
  "code": "K55210BD3228",
  "type": "sectors:true",
  "name": "신한커버드콜인덱스증권자투자신탁[주식혼합-파생형]",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 2144.16,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "IT",
     "weight": 0.705066995
    },
    {
     "sectorName": "산업재",
     "weight": 0.095407133
    },
    {
     "sectorName": "금융",
     "weight": 0.076389243
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.048698063
    },
    {
     "sectorName": "소재",
     "weight": 0.018613566
    },
    {
     "sectorName": "의료",
     "weight": 0.017529456
    },
    {
     "sectorName": "필수소비재",
     "weight": 0.014275646
    },
    {
     "sectorName": "에너지",
     "weight": 0.01215692
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.007826067
    },
    {
     "sectorName": "유틸리티",
     "weight": 0.00381297
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 },
 {
  "code": "K55210CL5818",
  "type": "sectors:true",
  "name": "신한커버드콜마일드증권자투자신탁[주식혼합-파생형]",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 1735.25,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "IT",
     "weight": 0.705067028
    },
    {
     "sectorName": "산업재",
     "weight": 0.095407138
    },
    {
     "sectorName": "금융",
     "weight": 0.076389242
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.048698053
    },
    {
     "sectorName": "소재",
     "weight": 0.018613567
    },
    {
     "sectorName": "의료",
     "weight": 0.017529436
    },
    {
     "sectorName": "필수소비재",
     "weight": 0.014275644
    },
    {
     "sectorName": "에너지",
     "weight": 0.012156915
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.00782606
    },
    {
     "sectorName": "유틸리티",
     "weight": 0.003812975
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 }
]
```