# 비중 0 은 "0" 인가 "모름" 인가 (6차)

조사 시각: 2026-08-29T08:08:13.970Z

**가려지지 않았다 — 전부 0 인 펀드 0, 비중 합 중앙값 6.57%**

화면 시험이 걸렸다. 원천이 보유종목의 `weight` 를 **정확히 0** 으로 주는
펀드가 있다. 이것이 갈려야 화면에 무엇을 찍을지 정해진다.

| 뜻 | 화면 |
|---|---|
| 진짜 0 | `0.00%` 로 찍는다. 원천이 그렇게 말했으니 옮기는 것이다 |
| 모름 | 빈칸으로 둔다. 없는 것을 0 이라고 하면 "안 담았다" 는 거짓이 된다 |

## 1. 걸린 펀드의 원자료

### KR5223702725 — KB이머징유럽증권자투자신탁(주식)(운용) (해외주식형)

45종목 · `weight === 0` 인 것 **0** · `weight == null` 인 것 **0** · 비중 합 **94.89%**

```json
[
  {
    "itemCode": "NL0009805522",
    "itemName": "Nebius Group NV",
    "weight": 0.073994263
  },
  {
    "itemCode": "HU0000061726",
    "itemName": "OTP BANK NYRT",
    "weight": 0.072319673
  },
  {
    "itemCode": "PLPKO0000016",
    "itemName": "PKO BANK POLSKI SA",
    "weight": 0.066897359
  },
  {
    "itemCode": "GRS003003035",
    "itemName": "NATIONAL BANK OF GREECE",
    "weight": 0.058615599
  },
  {
    "itemCode": "PLPEKAO00016",
    "itemName": "BANK PEKAO SA",
    "weight": 0.056047433
  },
  {
    "itemCode": "GRS829003003",
    "itemName": "EUROBANK ERGASIAS SA",
    "weight": 0.046499007
  },
  {
    "itemCode": "CZ0008040318",
    "itemName": "MONETA MONEY BANK",
    "weight": 0.045546332
  },
  {
    "itemCode": "CZ0005112300",
    "itemName": "CESKE ENERGETICKE",
    "weight": 0.039396847
  },
  {
    "itemCode": "PLPKN0000018",
    "itemName": "ORLEN SA",
    "weight": 0.038877673
  },
  {
    "itemCode": "PLPZU0000011",
    "itemName": "POWSZECHNY ZAKLAD",
    "weight": 0.037867979
  },
  {
    "itemCode": "GRS830003000",
    "itemName": "ALPHA BANK SA",
    "weight": 0.033829627
  },
  {
    "itemCode": "RU000902954A",
    "itemName": "SBERBANK-CLS(RUB)",
    "weight": 0.031971448
  },
  {
    "itemCode": "PLBUDMX00013",
    "itemName": "BUDIMEX SA",
    "weight": 0.024794376
  },
  {
    "itemCode": "GRS831003009",
    "itemName": "PIRAEUS FINANCIAL HOLDINGS SA",
    "weight": 0.024569133
  },
  {
    "itemCode": "RU000A0JNAAA",
    "itemName": "POLYUS PJSC(RUB)",
    "weight": 0.024176132
  },
  {
    "itemCode": "HU0000153937",
    "itemNa
```

### K55223D11016 — KB글로벌주식인덱스증권자투자신탁(주식)(H)(운용) (해외주식형)

878종목 · `weight === 0` 인 것 **0** · `weight == null` 인 것 **0** · 비중 합 **86.51%**

```json
[
  {
    "itemCode": "US67066G1040",
    "itemName": "NVIDIA CORP",
    "weight": 0.045152258
  },
  {
    "itemCode": "US0378331005",
    "itemName": "APPLE INC",
    "weight": 0.042509375
  },
  {
    "itemCode": "US5949181045",
    "itemName": "MICROSOFT CORP",
    "weight": 0.026123965
  },
  {
    "itemCode": "US0231351067",
    "itemName": "AMAZONCOM INC",
    "weight": 0.023902348
  },
  {
    "itemCode": "US02079K3059",
    "itemName": "ALPHABET INC-CL A",
    "weight": 0.021509163
  },
  {
    "itemCode": "US11135F1012",
    "itemName": "BROADCOM INC",
    "weight": 0.017207254
  },
  {
    "itemCode": "US02079K1079",
    "itemName": "ALPHABET INC",
    "weight": 0.017174188
  },
  {
    "itemCode": "US5951121038",
    "itemName": "MICRON TECHNOLOGY INC",
    "weight": 0.016074572
  },
  {
    "itemCode": "US30303M1027",
    "itemName": "Meta Platforms Inc",
    "weight": 0.013160616
  },
  {
    "itemCode": "US88160R1014",
    "itemName": "TESLA INC",
    "weight": 0.011753436
  },
  {
    "itemCode": "US0079031078",
    "itemName": "ADVANCED MICRO DEVICES",
    "weight": 0.010096012
  },
  {
    "itemCode": "US5324571083",
    "itemName": "ELI LILLY & CO",
    "weight": 0.009638328
  },
  {
    "itemCode": "NL0010273215",
    "itemName": "ASML HOLDING N.V.",
    "weight": 0.00837972
  },
  {
    "itemCode": "US5128073062",
    "itemName": "LAM RESEARCH CORP",
    "weight": 0.008170378
  },
  {
    "itemCode": "US46625H1005",
    "itemName": "JP MORGAN CHASE &",
    "weight": 0.008013463
  },
  {
    "itemCode": "US0382221051",
    "itemName": "APPLIED MATERIALS"
```

## 2. 표본에서 얼마나 되나

| 항목 | 수 |
|---|---:|
| 보유종목이 있는 펀드 | 140 |
| 0 인 종목이 있는 펀드 | 1 |
| **전부 0 인 펀드** | **0** |
| null 인 종목이 있는 펀드 | 0 |
| 비중 합 중앙값 (전체) | 34.5% |
| 비중 합 중앙값 (0 이 있는 펀드) | 6.57% |

**아직 갈리지 않았다.** 화면에 0 을 찍기 전에 더 봐야 한다.
