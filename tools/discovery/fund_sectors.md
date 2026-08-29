# 펀드 12차 — 업종구성의 모양

표본 25개. 11차에서 열쇠 이름만 보고 모양을 짐작해 수집기에
넣었다가 3,196개 전부 빈칸이 나왔다. 이번엔 본문을 찍어 놓고 읽는다.

## 모양별 개수

| 모양 | 개수 |
|---|---:|
| `object:result` | 25 |

## 비중의 분모

합이 100 근처면 순자산 대비고, 기준가에 비례해 부풀어 있으면 설정원본 대비다.
둘 다 아니면 **뜻을 모르는 값이므로 싣지 않는다.**

| 코드 | 유형 | 항목수 | 합 | 기준가 | 합÷(기준가/1000) |
|---|---|---:|---:|---:|---:|
| K55224EM9100 | sectors:true | 4 | 1.00 | 804.61 | 1.2 |
| K55210CL5818 | sectors:true | 10 | 1.00 | 1655.17 | 0.6 |
| K55229ET4695 | sectors:true | 4 | 0.10 | 1092.03 | 0.1 |
| K55210BL5223 | sectors:true | 10 | 1.00 | 1488.88 | 0.7 |
| K55229DL4512 | sectors:true | 10 | 1.00 | 1823.94 | 0.5 |
| K55229DC7680 | sectors:true | 10 | 1.00 | 1902.64 | 0.5 |
| K55105DR1537 | sectors:true | 1 | 0.01 | 1256.64 | 0.0 |
| K55229DC7722 | sectors:true | 10 | 1.00 | 1863.74 | 0.5 |
| K55364BQ3334 | sectors:true | 10 | 1.00 | 1971.98 | 0.5 |
| K55364BQ3193 | sectors:true | 10 | 1.00 | 1966.44 | 0.5 |
| K55105ED1888 | sectors:true | 1 | 0.02 | 1335.02 | 0.0 |
| K55229DL4611 | sectors:true | 10 | 1.00 | 1619.13 | 0.6 |
| KR5363AP6407 | sectors:true | 6 | 1.00 | 1300.73 | 0.8 |
| KR5363AH5607 | sectors:true | 6 | 1.00 | 1295.7 | 0.8 |
| KR5363A43940 | sectors:true | 6 | 1.00 | 1297.6 | 0.8 |
| KR5363AF6839 | sectors:true | 7 | 0.99 | 1478.36 | 0.7 |
| KR5363A44260 | sectors:true | 7 | 0.99 | 1481.41 | 0.7 |
| KR5363AG8636 | sectors:true | 7 | 0.99 | 1477.57 | 0.7 |
| K55206B62216 | sectors:true | 2 | 0.97 | 1574.87 | 0.6 |
| K55301CH3124 | sectors:true | 7 | 0.99 | 1089.18 | 0.9 |
| KR5303AL4201 | sectors:true | 8 | 1.00 | 2280.54 | 0.4 |
| KR5303AP5485 | sectors:true | 8 | 1.00 | 2022.15 | 0.5 |
| KR5303AL0068 | sectors:true | 8 | 1.00 | 1980.53 | 0.5 |
| KRM226538606 | sectors:true | 7 | 1.00 | 1029.29 | 1.0 |
| K55301BO7531 | sectors:true | 1 | 0.01 | 2352.96 | 0.0 |

합이 90~110: 0/25 · 기준가로 나눈 값이 90~110: 0/25

## 본문 (앞 다섯)

```json
[
 {
  "code": "K55224EM9100",
  "type": "sectors:true",
  "name": "흥국K뷰티엔터목표전환형증권투자신탁 1[주식]",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 804.61,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "필수소비재",
     "weight": 0.395627224
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.305548419
    },
    {
     "sectorName": "의료",
     "weight": 0.200298263
    },
    {
     "sectorName": "금융",
     "weight": 0.098526094
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
  "basePrice": 1655.17,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "IT",
     "weight": 0.751803322
    },
    {
     "sectorName": "산업재",
     "weight": 0.08663662
    },
    {
     "sectorName": "금융",
     "weight": 0.058280898
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.042894362
    },
    {
     "sectorName": "소재",
     "weight": 0.015935003
    },
    {
     "sectorName": "의료",
     "weight": 0.013101544
    },
    {
     "sectorName": "에너지",
     "weight": 0.011141865
    },
    {
     "sectorName": "필수소비재",
     "weight": 0.010704992
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.006244873
    },
    {
     "sectorName": "유틸리티",
     "weight": 0.00305829
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 },
 {
  "code": "K55229ET4695",
  "type": "sectors:true",
  "name": "카디안글로벌디지털자산밸류체인증권자투자신탁(H)[주식]",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 1092.03,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "IT",
     "weight": 0.084329331
    },
    {
     "sectorName": "금융",
     "weight": 0.008998294
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.004877663
    },
    {
     "sectorName": "산업재",
     "weight": 0.001348846
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 },
 {
  "code": "K55210BL5223",
  "type": "sectors:true",
  "name": "신한퇴직연금커버드콜인덱스증권자투자신탁[주식혼합-파생형] (종류)",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 1488.88,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "IT",
     "weight": 0.751803292
    },
    {
     "sectorName": "산업재",
     "weight": 0.086636613
    },
    {
     "sectorName": "금융",
     "weight": 0.058280899
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.04289437
    },
    {
     "sectorName": "소재",
     "weight": 0.015934997
    },
    {
     "sectorName": "의료",
     "weight": 0.01310154
    },
    {
     "sectorName": "에너지",
     "weight": 0.011141855
    },
    {
     "sectorName": "필수소비재",
     "weight": 0.010705004
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.006244884
    },
    {
     "sectorName": "유틸리티",
     "weight": 0.003058304
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 },
 {
  "code": "K55229DL4512",
  "type": "sectors:true",
  "name": "카디안변액보험코리아원자재지수연계증권투자신탁4[주식혼합-파생형]",
  "avail": {
   "status": "available",
   "assets": true,
   "portfolio": true,
   "sectors": true
  },
  "basePrice": 1823.94,
  "allocationsSectors": {
   "result": [
    {
     "sectorName": "IT",
     "weight": 0.757630358
    },
    {
     "sectorName": "산업재",
     "weight": 0.086955992
    },
    {
     "sectorName": "금융",
     "weight": 0.055763199
    },
    {
     "sectorName": "경기소비재",
     "weight": 0.04238307
    },
    {
     "sectorName": "의료",
     "weight": 0.01528606
    },
    {
     "sectorName": "소재",
     "weight": 0.012690086
    },
    {
     "sectorName": "에너지",
     "weight": 0.011958286
    },
    {
     "sectorName": "필수소비재",
     "weight": 0.007342652
    },
    {
     "sectorName": "통신서비스",
     "weight": 0.006913443
    },
    {
     "sectorName": "유틸리티",
     "weight": 0.003076857
    }
   ]
  },
  "allocationsAssetsKeys": [
   "assetTypes"
  ]
 }
]
```