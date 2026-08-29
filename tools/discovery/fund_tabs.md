# 펀드 탐색 11차 — 안 열어 본 탭 둘 (자산구성·성과분석)

조사 시각: 2026-08-29T08:21:39.352Z

## 탭이 부르는 호출

### KR5207698899 · /allocation

- `200` https://stock.naver.com/api/fund/funds/KR5207698899/fund-allocation
- `200` https://stock.naver.com/api/fund/funds/KR5207698899/left-panel

### KR5207698899 · /performance

- `200` https://stock.naver.com/api/fund/funds/KR5207698899/left-panel
- `200` https://stock.naver.com/api/fund/funds/KR5207698899/classes/returns
- `200` https://stock.naver.com/api/fund/funds/KR5207698899/prices/daily?date=2026-08-29&size=10
- `200` https://stock.naver.com/api/fund/funds/KR5207698899/fund-performance
- `200` https://stock.naver.com/api/fund/funds/KR5207698899/metrics/detail?term=1y

### K55301BM7814 · /allocation

- `200` https://stock.naver.com/api/fund/funds/K55301BM7814/left-panel
- `200` https://stock.naver.com/api/fund/funds/K55301BM7814/fund-allocation

### K55301BM7814 · /performance

- `200` https://stock.naver.com/api/fund/funds/K55301BM7814/left-panel
- `200` https://stock.naver.com/api/fund/funds/K55301BM7814/classes/returns
- `200` https://stock.naver.com/api/fund/funds/K55301BM7814/prices/daily?date=2026-08-29&size=10
- `200` https://stock.naver.com/api/fund/funds/K55301BM7814/fund-performance
- `200` https://stock.naver.com/api/fund/funds/K55301BM7814/metrics/detail?term=1y

## 브라우저 없이 재현

### OK undefined

```json

```

### OK undefined

```json

```

### OK undefined

```json

```

### OK undefined

```json

```

### OK undefined

```json

```

### OK undefined

```json

```

### OK undefined

```json

```

### OK undefined

```json

```

## 판매수수료

```json
{
 "목록표본": 400,
 "목록선취있음": 25,
 "목록후취있음": 25,
 "목록총보수있음": 25,
 "상세표본": 200,
 "상세보수자리": {
  "managementFee": 0,
  "salesFee": 0,
  "custodyFee": 0,
  "backOfficeFee": 0,
  "totalFee": 0,
  "preSalesFee": 0,
  "postSalesFee": 0
 }
}
```

## 메모

```json
[
 {
  "물음": "선취·후취 판매수수료를 받을 수 있는가",
  "답": "표본 400개 중 선취 25개 · 후취 25개가 채워져 있다."
 }
]
```