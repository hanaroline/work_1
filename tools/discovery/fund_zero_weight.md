# 비중 0 은 "0" 인가 "모름" 인가 (6차)

조사 시각: 2026-10-03T09:07:34.092Z

**가려지지 않았다 — 전부 0 인 펀드 0, 비중 합 중앙값 null%**

화면 시험이 걸렸다. 원천이 보유종목의 `weight` 를 **정확히 0** 으로 주는
펀드가 있다. 이것이 갈려야 화면에 무엇을 찍을지 정해진다.

| 뜻 | 화면 |
|---|---|
| 진짜 0 | `0.00%` 로 찍는다. 원천이 그렇게 말했으니 옮기는 것이다 |
| 모름 | 빈칸으로 둔다. 없는 것을 0 이라고 하면 "안 담았다" 는 거짓이 된다 |

## 1. 걸린 펀드의 원자료

### KR5223702725 — KB이머징유럽증권자투자신탁(주식)(운용) (해외주식형)

45종목 · `weight === 0` 인 것 **0** · `weight == null` 인 것 **0** · 비중 합 **88.69%**

```json
[
  {
    "itemCode": "PLPKO0000016",
    "itemName": "PKO BANK POLSKI SA",
    "weight": 0.067004241
  },
  {
    "itemCode": "HU0000061726",
    "itemName": "OTP BANK NYRT",
    "weight": 0.066896797
  },
  {
    "itemCode": "GRS003003035",
    "itemName": "NATIONAL BANK OF GREECE",
    "weight": 0.059012183
  },
  {
    "itemCode": "PLPEKAO00016",
    "itemName": "BANK PEKAO SA",
    "weight": 0.055343441
  },
  {
    "itemCode": "NL0009805522",
    "itemName": "Nebius Group NV",
    "weight": 0.048440268
  },
  {
    "itemCode": "GRS829003003",
    "itemName": "EUROBANK ERGASIAS SA",
    "weight": 0.045833438
  },
  {
    "itemCode": "CZ0008040318",
    "itemName": "MONETA MONEY BANK",
    "weight": 0.042378892
  },
  {
    "itemCode": "PLPKN0000018",
    "itemName": "ORLEN SA",
    "weight": 0.041552389
  },
  {
    "itemCode": "CZ0005112300",
    "itemName": "CESKE ENERGETICKE",
    "weight": 0.039626362
  },
  {
    "itemCode": "PLPZU0000011",
    "itemName": "POWSZECHNY ZAKLAD",
    "weight": 0.037580084
  },
  {
    "itemCode": "GRS830003000",
    "itemName": "ALPHA BANK SA",
    "weight": 0.03347558
  },
  {
    "itemCode": "HU0000153937",
    "itemName": "MOL HUNGARIAN OIL AND GAS PL",
    "weight": 0.025977033
  },
  {
    "itemCode": "RU000902954A",
    "itemName": "SBERBANK-CLS(RUB)",
    "weight": 0.025314178
  },
  {
    "itemCode": "GRS831003009",
    "itemName": "PIRAEUS FINANCIAL HOLDINGS SA",
    "weight": 0.024682099
  },
  {
    "itemCode": "PLBUDMX00013",
    "itemName": "BUDIMEX SA",
    "weight": 0.022933848
  },
  {
    "itemCode": "GRS260333000",

```

### K55223D11016 — KB글로벌주식인덱스증권자투자신탁(주식)(H)(운용) (해외주식형)

877종목 · `weight === 0` 인 것 **0** · `weight == null` 인 것 **0** · 비중 합 **82.46%**

```json
[
  {
    "itemCode": "US0378331005",
    "itemName": "APPLE INC",
    "weight": 0.047498326
  },
  {
    "itemCode": "US67066G1040",
    "itemName": "NVIDIA CORP",
    "weight": 0.04264546
  },
  {
    "itemCode": "US5949181045",
    "itemName": "MICROSOFT CORP",
    "weight": 0.030187655
  },
  {
    "itemCode": "US0231351067",
    "itemName": "AMAZONCOM INC",
    "weight": 0.022131171
  },
  {
    "itemCode": "US02079K3059",
    "itemName": "ALPHABET INC-CL A",
    "weight": 0.019159819
  },
  {
    "itemCode": "US11135F1012",
    "itemName": "BROADCOM INC",
    "weight": 0.0169174
  },
  {
    "itemCode": "US02079K1079",
    "itemName": "ALPHABET INC",
    "weight": 0.01540247
  },
  {
    "itemCode": "US30303M1027",
    "itemName": "Meta Platforms Inc",
    "weight": 0.01190493
  },
  {
    "itemCode": "US5951121038",
    "itemName": "MICRON TECHNOLOGY INC",
    "weight": 0.01159056
  },
  {
    "itemCode": "US0079031078",
    "itemName": "ADVANCED MICRO DEVICES",
    "weight": 0.008576197
  },
  {
    "itemCode": "US5324571083",
    "itemName": "ELI LILLY & CO",
    "weight": 0.008545342
  },
  {
    "itemCode": "US88160R1014",
    "itemName": "TESLA INC",
    "weight": 0.008321878
  },
  {
    "itemCode": "US46625H1005",
    "itemName": "JP MORGAN CHASE &",
    "weight": 0.008058769
  },
  {
    "itemCode": "NL0010273215",
    "itemName": "ASML HOLDING N.V.",
    "weight": 0.007142194
  },
  {
    "itemCode": "US30233Q1085",
    "itemName": "EXXONMOBIL HOLDINGS CORP",
    "weight": 0.006170929
  },
  {
    "itemCode": "US92826C8394",
    "itemName": "VISA INC",
    "
```

## 2. 표본에서 얼마나 되나

| 항목 | 수 |
|---|---:|
| 보유종목이 있는 펀드 | 158 |
| 0 인 종목이 있는 펀드 | 0 |
| **전부 0 인 펀드** | **0** |
| null 인 종목이 있는 펀드 | 0 |
| 비중 합 중앙값 (전체) | 29.25% |
| 비중 합 중앙값 (0 이 있는 펀드) | null% |

**아직 갈리지 않았다.** 화면에 0 을 찍기 전에 더 봐야 한다.
