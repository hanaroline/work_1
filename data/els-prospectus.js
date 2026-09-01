/**
 * ELS/DLS 투자설명서 — DART 일괄신고추가서류에서 수집·파싱한 결과
 *
 * 생성 : scripts/fetch_prospectus.mjs -> scripts/parse_prospectus.mjs -> scripts/build_els_prospectus.mjs
 *
 * ELS_PROSPECTUS.byRound[회차번호]  = { fields, schedule, matBarrier, knockIn, docUrl, ... }
 * ELS_PROSPECTUS.codeToRound[상품코드] = 회차 번호 (data/els.js 상품 목록과의 연결)
 *   상품 목록에 아직 없는 회차도 byRound 에 들어 있어, 다음 주 상품이 목록에 뜨면 바로 붙는다.
 *
 * sales-script.html 이 상품 선택 시 이 값을 등록된 투자설명서로 자동 적용한다.
 * 원문에 없는 값은 담지 않으므로 화면에서 「확인필요」로 남는다.
 */
window.ELS_PROSPECTUS = {
 "updatedAt": "2026-09-01T07:35:25.821Z",
 "source": "DART 일괄신고추가서류",
 "rcpNos": [
  "20260724000225",
  "20260731000093",
  "20260804000229",
  "20260821000193",
  "20260825000251",
  "20260828000836"
 ],
 "matched": 38,
 "productCount": 40,
 "unmatched": [
  {
   "code": "KR6MD0008VN9",
   "name": "미래에셋증권(ELB)4058",
   "no": 4058
  },
  {
   "code": "KR6MD0008WJ5",
   "name": "미래에셋증권(ELB)4063",
   "no": 4063
  }
 ],
 "codeToRound": {
  "KR6MD0008VJ7": 38062,
  "KR6MD0008VF5": 38059,
  "KR6MD0008VE8": 38058,
  "KR6MD0008VD0": 38057,
  "KR6MD0008VC2": 38056,
  "KR6MD0008VK5": 38063,
  "KR6MD0008VM1": 38065,
  "KR6MD0008VB4": 38055,
  "KR6MD0008VL3": 38064,
  "KR6MD0008VH1": 38061,
  "KR6MD0008VG3": 38060,
  "KR6MD0008VA6": 38054,
  "KR6MD0008V90": 38053,
  "KR6MD0008V82": 38052,
  "KR6MD0008V74": 38051,
  "KR6MD0008V66": 38050,
  "KR6MD0008V58": 38049,
  "KR6MD0008V41": 38048,
  "KR6MD0008W99": 38081,
  "KR6MD0008W81": 38080,
  "KR6MD0008WD8": 38085,
  "KR6MD0008W73": 38079,
  "KR6MD0008WH9": 38089,
  "KR6MD0008W65": 38078,
  "KR6MD0008WC0": 38084,
  "KR6MD0008W57": 38077,
  "KR6MD0008WG1": 38088,
  "KR6MD0008WB2": 38083,
  "KR6MD0008WF3": 38087,
  "KR6MD0008W40": 38076,
  "KR6MD0008WA4": 38082,
  "KR6MD0008W32": 38075,
  "KR6MD0008WE6": 38086,
  "KR6MD0008W24": 38074,
  "KR6MD0008W16": 38073,
  "KR6MD0008W08": 38072,
  "KR6MD0008VZ3": 38071,
  "KR6MD0008VY6": 38070
 },
 "byRound": {
  "37982": {
   "no": 37982,
   "name": "미래에셋증권 제37982회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.810Z",
   "fields": {
    "name": "미래에셋증권 제37982회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37982회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, Nikkei225",
    "underVol": "EuroStoxx50 22.59%, S&P500 24.7%, Nikkei225 31.86%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "45%",
    "coupon": "연 13%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, S&P500, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 45% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-07-14 과거 데이터 4,812회) 기준 만기 손실 발생 비율은 3.37% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,689.12원 입니다 (액면 대비 -3.11%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 90,
     "payRate": 106.5,
     "annRate": 13,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 90,
     "payRate": 113,
     "annRate": 13,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 119.5,
     "annRate": 13,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 126,
     "annRate": 13,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 132.5,
     "annRate": 13,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 139,
     "annRate": 13,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "45",
   "lizard": null,
   "sim": {
    "runs": 4812,
    "loss": 3.37,
    "first": 80.32,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37983": {
   "no": 37983,
   "name": "미래에셋증권 제37983회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.810Z",
   "fields": {
    "name": "미래에셋증권 제37983회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37983회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 52.38%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "25%",
    "coupon": "연 17.3%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-14 과거 데이터 5,080회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,993.32원 입니다 (액면 대비 -0.07%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 104.325,
     "annRate": 17.3,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 108.65,
     "annRate": 17.3,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 112.975,
     "annRate": 17.3,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 117.3,
     "annRate": 17.3,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 121.625,
     "annRate": 17.3,
     "evalDate": "2027-11-02"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 125.95,
     "annRate": 17.3,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 130.275,
     "annRate": 17.3,
     "evalDate": "2028-04-27"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 134.6,
     "annRate": 17.3,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 138.925,
     "annRate": 17.3,
     "evalDate": "2028-11-01"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 143.25,
     "annRate": 17.3,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 147.575,
     "annRate": 17.3,
     "evalDate": "2029-04-27"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 151.9,
     "annRate": 17.3,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 5080,
    "loss": 0,
    "first": 96.06,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37984": {
   "no": 37984,
   "name": "미래에셋증권 제37984회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37984회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37984회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 67.01%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2027년 8월 6일",
    "matTerm": "1년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "35%",
    "coupon": "연 19%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2005-01-03~2025-07-14 과거 데이터 5,068회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,731.12원 입니다 (액면 대비 -2.69%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 104.75,
     "annRate": 19,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 80,
     "payRate": 109.5,
     "annRate": 19,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 75,
     "payRate": 114.25,
     "annRate": 19,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 70,
     "payRate": 119,
     "annRate": 19,
     "evalDate": "2027-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5068,
    "loss": 0,
    "first": 96.61,
    "range": {
     "from": "2005-01-03",
     "to": "2025-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37985": {
   "no": 37985,
   "name": "미래에셋증권 제37985회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37985회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37985회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, KOSPI200, Nikkei225",
    "underVol": "S&P500 24.7%, KOSPI200 52.38%, Nikkei225 31.86%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "25%",
    "coupon": "연 20%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(S&P500, KOSPI200, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-07-14 과거 데이터 4,660회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 10,135.33원 입니다 (액면 대비 1.35%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 105,
     "annRate": 20,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 110,
     "annRate": 20,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 115,
     "annRate": 20,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 120,
     "annRate": 20,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 80,
     "payRate": 125,
     "annRate": 20,
     "evalDate": "2027-11-02"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 80,
     "payRate": 130,
     "annRate": 20,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 80,
     "payRate": 135,
     "annRate": 20,
     "evalDate": "2028-04-27"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 80,
     "payRate": 140,
     "annRate": 20,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 75,
     "payRate": 145,
     "annRate": 20,
     "evalDate": "2028-11-01"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 75,
     "payRate": 150,
     "annRate": 20,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 155,
     "annRate": 20,
     "evalDate": "2029-04-27"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 160,
     "annRate": 20,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 4660,
    "loss": 0,
    "first": 93.71,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37986": {
   "no": 37986,
   "name": "미래에셋증권 제37986회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37986회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37986회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 52.38%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "30%",
    "coupon": "연 20.3%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-14 과거 데이터 5,080회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,958.82원 입니다 (액면 대비 -0.41%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 105.075,
     "annRate": 20.3,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 110.15,
     "annRate": 20.3,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 115.225,
     "annRate": 20.3,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 120.3,
     "annRate": 20.3,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 125.375,
     "annRate": 20.3,
     "evalDate": "2027-11-02"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 130.45,
     "annRate": 20.3,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 135.525,
     "annRate": 20.3,
     "evalDate": "2028-04-27"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 140.6,
     "annRate": 20.3,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 145.675,
     "annRate": 20.3,
     "evalDate": "2028-11-01"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 150.75,
     "annRate": 20.3,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 155.825,
     "annRate": 20.3,
     "evalDate": "2029-04-27"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 160.9,
     "annRate": 20.3,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 5080,
    "loss": 0,
    "first": 96.06,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37987": {
   "no": 37987,
   "name": "미래에셋증권 제37987회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37987회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37987회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.59%, S&P500 24.7%, KOSPI200 52.38%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "없음 (노낙인)",
    "coupon": "연 20.5%",
    "maxLoss": "100%",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 10,195.55원 입니다 (액면 대비 1.96%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 110.25,
     "annRate": 20.5,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 120.5,
     "annRate": 20.5,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 130.75,
     "annRate": 20.5,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 70,
     "payRate": 141,
     "annRate": 20.5,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 65,
     "payRate": 151.25,
     "annRate": 20.5,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 60,
     "payRate": 161.5,
     "annRate": 20.5,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 60,
   "knockIn": "",
   "lizard": {
    "step": 2,
    "barrier": 45,
    "payout": 120.5
   },
   "sim": {
    "runs": 4887,
    "loss": 0,
    "first": 94.29,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37988": {
   "no": 37988,
   "name": "미래에셋증권 제37988회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37988회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37988회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, KOSPI200, Nikkei225",
    "underVol": "S&P500 24.7%, KOSPI200 52.38%, Nikkei225 31.86%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "없음 (노낙인)",
    "coupon": "연 23.5%",
    "maxLoss": "100%",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,799.04원 입니다 (액면 대비 -2.01%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 111.75,
     "annRate": 23.5,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 123.5,
     "annRate": 23.5,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 135.25,
     "annRate": 23.5,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 70,
     "payRate": 147,
     "annRate": 23.5,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 65,
     "payRate": 158.75,
     "annRate": 23.5,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 60,
     "payRate": 170.5,
     "annRate": 23.5,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 60,
   "knockIn": "",
   "lizard": null,
   "sim": {
    "runs": 4660,
    "loss": 0.28,
    "first": 95.58,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37989": {
   "no": 37989,
   "name": "미래에셋증권 제37989회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37989회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37989회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, HSCEI, Nikkei225",
    "underVol": "KOSPI200 52.38%, HSCEI 26.63%, Nikkei225 31.86%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "35%",
    "coupon": "연 24.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-07-14 과거 데이터 4,633회) 기준 만기 손실 발생 비율은 1.51% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,889.17원 입니다 (액면 대비 -1.11%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 112.1,
     "annRate": 24.2,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 124.2,
     "annRate": 24.2,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 136.3,
     "annRate": 24.2,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 148.4,
     "annRate": 24.2,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 160.5,
     "annRate": 24.2,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 172.6,
     "annRate": 24.2,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 4633,
    "loss": 1.51,
    "first": 80.12,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37990": {
   "no": 37990,
   "name": "미래에셋증권 제37990회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37990회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제37990회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 63.91%, SK하이닉스 74.73%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "25%",
    "coupon": "연 33%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-14 과거 데이터 5,065회) 기준 만기 손실 발생 비율은 0.08% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,747.21원 입니다 (액면 대비 -2.53%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 75,
     "payRate": 108.25,
     "annRate": 33,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 75,
     "payRate": 116.5,
     "annRate": 33,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 75,
     "payRate": 124.75,
     "annRate": 33,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 75,
     "payRate": 133,
     "annRate": 33,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 75,
     "payRate": 141.25,
     "annRate": 33,
     "evalDate": "2027-11-02"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 75,
     "payRate": 149.5,
     "annRate": 33,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 75,
     "payRate": 157.75,
     "annRate": 33,
     "evalDate": "2028-04-27"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 75,
     "payRate": 166,
     "annRate": 33,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 70,
     "payRate": 174.25,
     "annRate": 33,
     "evalDate": "2028-11-01"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 70,
     "payRate": 182.5,
     "annRate": 33,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 70,
     "payRate": 190.75,
     "annRate": 33,
     "evalDate": "2029-04-27"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 65,
     "payRate": 199,
     "annRate": 33,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 5065,
    "loss": 0.08,
    "first": 94.57,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37991": {
   "no": 37991,
   "name": "미래에셋증권 제37991회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37991회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제37991회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 63.91%, SK하이닉스 74.73%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "30%",
    "coupon": "연 34.41%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-14 과거 데이터 5,065회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,734.59원 입니다 (액면 대비 -2.65%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 100,
     "annRate": 34.41,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 100,
     "annRate": 34.41,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 100,
     "annRate": 34.41,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 100,
     "annRate": 34.41,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 100,
     "annRate": 34.41,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 102.8675,
     "annRate": 34.41,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 5065,
    "loss": 0,
    "first": 77.67,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37992": {
   "no": 37992,
   "name": "미래에셋증권 제37992회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37992회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제37992회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, SK하이닉스",
    "underVol": "KOSPI200 67.01%, SK하이닉스 91.57%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2027년 8월 6일",
    "matTerm": "1년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "35%",
    "coupon": "연 42.3%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2005-01-03~2025-07-14 과거 데이터 5,068회) 기준 만기 손실 발생 비율은 0.34% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,772.84원 입니다 (액면 대비 -2.27%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 70,
     "payRate": 110.575,
     "annRate": 42.3,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 70,
     "payRate": 121.15,
     "annRate": 42.3,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 70,
     "payRate": 131.725,
     "annRate": 42.3,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 65,
     "payRate": 142.3,
     "annRate": 42.3,
     "evalDate": "2027-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5068,
    "loss": 0.34,
    "first": 96.8,
    "range": {
     "from": "2005-01-03",
     "to": "2025-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37993": {
   "no": 37993,
   "name": "미래에셋증권 제37993회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37993회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제37993회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 63.91%, SK하이닉스 74.73%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "35%",
    "coupon": "연 53%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-14 과거 데이터 5,065회) 기준 만기 손실 발생 비율은 0.48% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,913.23원 입니다 (액면 대비 -0.87%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 113.25,
     "annRate": 53,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 126.5,
     "annRate": 53,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 139.75,
     "annRate": 53,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 153,
     "annRate": 53,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 166.25,
     "annRate": 53,
     "evalDate": "2027-11-02"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 179.5,
     "annRate": 53,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 192.75,
     "annRate": 53,
     "evalDate": "2028-04-27"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 206,
     "annRate": 53,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 219.25,
     "annRate": 53,
     "evalDate": "2028-11-01"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 232.5,
     "annRate": 53,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 245.75,
     "annRate": 53,
     "evalDate": "2029-04-27"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 259,
     "annRate": 53,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5065,
    "loss": 0.48,
    "first": 84.05,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37994": {
   "no": 37994,
   "name": "미래에셋증권 제37994회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37994회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37994회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, HSCEI, Nikkei225",
    "underVol": "S&P500 24.7%, HSCEI 26.63%, Nikkei225 31.86%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "50%",
    "coupon": "연 13.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(S&P500, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 50% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-07-14 과거 데이터 4,634회) 기준 만기 손실 발생 비율은 5.37% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,368.57원 입니다 (액면 대비 -6.31%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 106.75,
     "annRate": 13.5,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 113.5,
     "annRate": 13.5,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 120.25,
     "annRate": 13.5,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 127,
     "annRate": 13.5,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 133.75,
     "annRate": 13.5,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 140.5,
     "annRate": 13.5,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "50",
   "lizard": null,
   "sim": {
    "runs": 4634,
    "loss": 5.37,
    "first": 80.56,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37995": {
   "no": 37995,
   "name": "미래에셋증권 제37995회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37995회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37995회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.59%, S&P500 24.7%, KOSPI200 52.38%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "30%",
    "coupon": "연 22.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, S&P500, KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-14 과거 데이터 4,887회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 10,053.41원 입니다 (액면 대비 0.53%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 105.55,
     "annRate": 22.2,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 111.1,
     "annRate": 22.2,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 116.65,
     "annRate": 22.2,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 122.2,
     "annRate": 22.2,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 80,
     "payRate": 127.75,
     "annRate": 22.2,
     "evalDate": "2027-11-02"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 80,
     "payRate": 133.3,
     "annRate": 22.2,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 80,
     "payRate": 138.85,
     "annRate": 22.2,
     "evalDate": "2028-04-27"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 80,
     "payRate": 144.4,
     "annRate": 22.2,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 75,
     "payRate": 149.95,
     "annRate": 22.2,
     "evalDate": "2028-11-01"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 75,
     "payRate": 155.5,
     "annRate": 22.2,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 161.05,
     "annRate": 22.2,
     "evalDate": "2029-04-27"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 166.6,
     "annRate": 22.2,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 4887,
    "loss": 0,
    "first": 93.21,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37996": {
   "no": 37996,
   "name": "미래에셋증권 제37996회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37996회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제37996회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, HSCEI, Nikkei225",
    "underVol": "KOSPI200 52.38%, HSCEI 26.63%, Nikkei225 31.86%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "40%",
    "coupon": "연 24.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-07-14 과거 데이터 4,633회) 기준 만기 손실 발생 비율은 2.07% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,712.98원 입니다 (액면 대비 -2.87%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 112.1,
     "annRate": 24.2,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 124.2,
     "annRate": 24.2,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 136.3,
     "annRate": 24.2,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 148.4,
     "annRate": 24.2,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 160.5,
     "annRate": 24.2,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 172.6,
     "annRate": 24.2,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 4633,
    "loss": 2.07,
    "first": 88.95,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37997": {
   "no": 37997,
   "name": "미래에셋증권 제37997회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37997회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제37997회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 63.91%, SK하이닉스 74.73%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "30%",
    "coupon": "연 40.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-14 과거 데이터 5,065회) 기준 만기 손실 발생 비율은 0.08% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,929.18원 입니다 (액면 대비 -0.71%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 75,
     "payRate": 110.125,
     "annRate": 40.5,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 75,
     "payRate": 120.25,
     "annRate": 40.5,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 75,
     "payRate": 130.375,
     "annRate": 40.5,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 75,
     "payRate": 140.5,
     "annRate": 40.5,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 75,
     "payRate": 150.625,
     "annRate": 40.5,
     "evalDate": "2027-11-02"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 75,
     "payRate": 160.75,
     "annRate": 40.5,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 75,
     "payRate": 170.875,
     "annRate": 40.5,
     "evalDate": "2028-04-27"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 75,
     "payRate": 181,
     "annRate": 40.5,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 70,
     "payRate": 191.125,
     "annRate": 40.5,
     "evalDate": "2028-11-01"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 70,
     "payRate": 201.25,
     "annRate": 40.5,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 70,
     "payRate": 211.375,
     "annRate": 40.5,
     "evalDate": "2029-04-27"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 65,
     "payRate": 221.5,
     "annRate": 40.5,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 5065,
    "loss": 0.08,
    "first": 94.57,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37998": {
   "no": 37998,
   "name": "미래에셋증권 제37998회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37998회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제37998회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 79.49%, SK하이닉스 91.57%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2027년 8월 6일",
    "matTerm": "1년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "40%",
    "coupon": "연 50.4%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2005-01-03~2025-07-14 과거 데이터 5,065회) 기준 만기 손실 발생 비율은 0.34% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 9,631.62원 입니다 (액면 대비 -3.68%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 70,
     "payRate": 112.6,
     "annRate": 50.4,
     "evalDate": "2026-11-04"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 70,
     "payRate": 125.2,
     "annRate": 50.4,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 70,
     "payRate": 137.8,
     "annRate": 50.4,
     "evalDate": "2027-04-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 65,
     "payRate": 150.4,
     "annRate": 50.4,
     "evalDate": "2027-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 5065,
    "loss": 0.34,
    "first": 96.64,
    "range": {
     "from": "2005-01-03",
     "to": "2025-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "37999": {
   "no": 37999,
   "name": "미래에셋증권 제37999회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제37999회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제37999회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "마이크론 테크놀로지, 팔란티어 테크",
    "underVol": "마이크론 테크놀로지 96.25%, 팔란티어 테크 61.12%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "30%",
    "coupon": "연 40.6%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(마이크론 테크놀로지, 팔란티어 테크) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2020-09-30~2023-07-14 과거 데이터 701회) 기준 만기 손실 발생 비율은 2.14% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 7,793.03원 입니다 (액면 대비 -22.07%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 120.3,
     "annRate": 40.6,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 140.6,
     "annRate": 40.6,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 160.9,
     "annRate": 40.6,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 181.2,
     "annRate": 40.6,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 201.5,
     "annRate": 40.6,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 221.8,
     "annRate": 40.6,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 701,
    "loss": 2.14,
    "first": 63.48,
    "range": {
     "from": "2020-09-30",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38000": {
   "no": 38000,
   "name": "미래에셋증권 제38000회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260724000225",
   "rcpNo": "20260724000225",
   "docDate": "2026-07-24",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제38000회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38000회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, 마이크론 테크놀로지",
    "underVol": "KOSPI200 52.38%, 마이크론 테크놀로지 96.25%",
    "issueDate": "2026년 8월 6일",
    "matDate": "2029년 8월 6일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 6일",
    "knockIn": "35%",
    "coupon": "연 44.6%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, 마이크론 테크놀로지) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-14 과거 데이터 4,922회) 기준 만기 손실 발생 비율은 1.2% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 5일",
    "docDate": "2026년 7월 24일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 3일 ~ 2026년 8월 4일 이며, 가입의사 확인은 2026년 08월 05일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 7월 31일 로, 일반 청약종료일(2026년 8월 5일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 21일 기준 이 증권의 공정가격은 액면 10,000원 당 8,300.99원 입니다 (액면 대비 -16.99%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 122.3,
     "annRate": 44.6,
     "evalDate": "2027-02-02"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 144.6,
     "annRate": 44.6,
     "evalDate": "2027-08-03"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 166.9,
     "annRate": 44.6,
     "evalDate": "2028-02-01"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 189.2,
     "annRate": 44.6,
     "evalDate": "2028-08-01"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 211.5,
     "annRate": 44.6,
     "evalDate": "2029-02-01"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 233.8,
     "annRate": 44.6,
     "evalDate": "2029-08-06",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 4922,
    "loss": 1.2,
    "first": 78.38,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38008": {
   "no": 38008,
   "name": "미래에셋증권 제38008회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.811Z",
   "fields": {
    "name": "미래에셋증권 제38008회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38008회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, HSCEI, Nikkei225",
    "underVol": "S&P500 24.59%, HSCEI 26.42%, Nikkei225 31.59%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "45%",
    "coupon": "연 13%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(S&P500, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 45% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-07-20 과거 데이터 4,637회) 기준 만기 손실 발생 비율은 4.17% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,597.38원 입니다 (액면 대비 -4.03%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 90,
     "payRate": 106.5,
     "annRate": 13,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 113,
     "annRate": 13,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 119.5,
     "annRate": 13,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 126,
     "annRate": 13,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 132.5,
     "annRate": 13,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 139,
     "annRate": 13,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "45",
   "lizard": null,
   "sim": {
    "runs": 4637,
    "loss": 4.17,
    "first": 69.05,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38009": {
   "no": 38009,
   "name": "미래에셋증권 제38009회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38009회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38009회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, KOSPI200, Nikkei225",
    "underVol": "S&P500 24.59%, KOSPI200 52.5%, Nikkei225 31.59%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "없음 (노낙인)",
    "coupon": "연 18.4%",
    "maxLoss": "100%",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 10,262.73원 입니다 (액면 대비 2.63%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 109.2,
     "annRate": 18.4,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 118.4,
     "annRate": 18.4,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 127.6,
     "annRate": 18.4,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 70,
     "payRate": 136.8,
     "annRate": 18.4,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 65,
     "payRate": 146,
     "annRate": 18.4,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 60,
     "payRate": 155.2,
     "annRate": 18.4,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 60,
   "knockIn": "",
   "lizard": {
    "step": 2,
    "barrier": 40,
    "payout": 118.4
   },
   "sim": {
    "runs": 4663,
    "loss": 0,
    "first": 95.58,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38010": {
   "no": 38010,
   "name": "미래에셋증권 제38010회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38010회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38010회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 63.99%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2027년 8월 13일",
    "matTerm": "1년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "40%",
    "coupon": "연 19%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2005-01-03~2025-07-18 과거 데이터 5,072회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,649.3원 입니다 (액면 대비 -3.51%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 104.75,
     "annRate": 19,
     "evalDate": "2026-11-10"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 80,
     "payRate": 109.5,
     "annRate": 19,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 75,
     "payRate": 114.25,
     "annRate": 19,
     "evalDate": "2027-05-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 70,
     "payRate": 119,
     "annRate": 19,
     "evalDate": "2027-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 5072,
    "loss": 0,
    "first": 96.57,
    "range": {
     "from": "2005-01-03",
     "to": "2025-07-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38011": {
   "no": 38011,
   "name": "미래에셋증권 제38011회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38011회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38011회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 52.5%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "35%",
    "coupon": "연 20%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 5,084회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,843.56원 입니다 (액면 대비 -1.56%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 105,
     "annRate": 20,
     "evalDate": "2026-11-10"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 110,
     "annRate": 20,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 115,
     "annRate": 20,
     "evalDate": "2027-05-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 120,
     "annRate": 20,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 125,
     "annRate": 20,
     "evalDate": "2027-11-09"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 130,
     "annRate": 20,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 135,
     "annRate": 20,
     "evalDate": "2028-05-09"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 140,
     "annRate": 20,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 145,
     "annRate": 20,
     "evalDate": "2028-11-08"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 150,
     "annRate": 20,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 155,
     "annRate": 20,
     "evalDate": "2029-05-08"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 160,
     "annRate": 20,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5084,
    "loss": 0,
    "first": 96.01,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38012": {
   "no": 38012,
   "name": "미래에셋증권 제38012회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38012회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38012회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.63%, S&P500 24.59%, KOSPI200 52.5%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "없음 (노낙인)",
    "coupon": "연 21.4%",
    "maxLoss": "100%",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,684.42원 입니다 (액면 대비 -3.16%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 110.7,
     "annRate": 21.4,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 121.4,
     "annRate": 21.4,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 132.1,
     "annRate": 21.4,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 70,
     "payRate": 142.8,
     "annRate": 21.4,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 65,
     "payRate": 153.5,
     "annRate": 21.4,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 60,
     "payRate": 164.2,
     "annRate": 21.4,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 60,
   "knockIn": "",
   "lizard": null,
   "sim": {
    "runs": 4891,
    "loss": 0,
    "first": 94.25,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38013": {
   "no": 38013,
   "name": "미래에셋증권 제38013회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38013회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38013회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.63%, S&P500 24.59%, KOSPI200 52.5%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "40%",
    "coupon": "연 23%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, S&P500, KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 4,891회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,613.9원 입니다 (액면 대비 -3.86%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 111.5,
     "annRate": 23,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 123,
     "annRate": 23,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 134.5,
     "annRate": 23,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 146,
     "annRate": 23,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 157.5,
     "annRate": 23,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 169,
     "annRate": 23,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 4891,
    "loss": 0,
    "first": 90.08,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38014": {
   "no": 38014,
   "name": "미래에셋증권 제38014회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38014회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38014회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 63.88%, SK하이닉스 74.55%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "20%",
    "coupon": "연 27%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 20% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 5,069회) 기준 만기 손실 발생 비율은 0.12% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,696.94원 입니다 (액면 대비 -3.03%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 75,
     "payRate": 106.75,
     "annRate": 27,
     "evalDate": "2026-11-10"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 75,
     "payRate": 113.5,
     "annRate": 27,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 75,
     "payRate": 120.25,
     "annRate": 27,
     "evalDate": "2027-05-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 75,
     "payRate": 127,
     "annRate": 27,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 75,
     "payRate": 133.75,
     "annRate": 27,
     "evalDate": "2027-11-09"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 75,
     "payRate": 140.5,
     "annRate": 27,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 75,
     "payRate": 147.25,
     "annRate": 27,
     "evalDate": "2028-05-09"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 75,
     "payRate": 154,
     "annRate": 27,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 70,
     "payRate": 160.75,
     "annRate": 27,
     "evalDate": "2028-11-08"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 70,
     "payRate": 167.5,
     "annRate": 27,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 70,
     "payRate": 174.25,
     "annRate": 27,
     "evalDate": "2029-05-08"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 65,
     "payRate": 181,
     "annRate": 27,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "20",
   "lizard": null,
   "sim": {
    "runs": 5069,
    "loss": 0.12,
    "first": 94.77,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38015": {
   "no": 38015,
   "name": "미래에셋증권 제38015회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38015회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38015회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 63.88%, SK하이닉스 74.55%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "25%",
    "coupon": "연 33.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 5,069회) 기준 만기 손실 발생 비율은 0.55% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,538.48원 입니다 (액면 대비 -4.62%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 116.75,
     "annRate": 33.5,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 133.5,
     "annRate": 33.5,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 150.25,
     "annRate": 33.5,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 167,
     "annRate": 33.5,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 183.75,
     "annRate": 33.5,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 200.5,
     "annRate": 33.5,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 5069,
    "loss": 0.55,
    "first": 90.59,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38016": {
   "no": 38016,
   "name": "미래에셋증권 제38016회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38016회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38016회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 63.88%, SK하이닉스 74.55%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "35%",
    "coupon": "연 37.41%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 5,069회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,942.04원 입니다 (액면 대비 -0.58%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 100,
     "annRate": 37.41,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 100,
     "annRate": 37.41,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 100,
     "annRate": 37.41,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 100,
     "annRate": 37.41,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 100,
     "annRate": 37.41,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 103.1175,
     "annRate": 37.41,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5069,
    "loss": 0,
    "first": 77.69,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38017": {
   "no": 38017,
   "name": "미래에셋증권 제38017회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38017회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38017회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 71.26%, SK하이닉스 82.47%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2028년 2월 11일",
    "matTerm": "18개월",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "35%",
    "coupon": "연 52%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2005-01-03~2025-01-20 과거 데이터 4,950회) 기준 만기 손실 발생 비율은 1.42% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,569.14원 입니다 (액면 대비 -4.31%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 113,
     "annRate": 52,
     "evalDate": "2026-11-10"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 126,
     "annRate": 52,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 139,
     "annRate": 52,
     "evalDate": "2027-05-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 80,
     "payRate": 152,
     "annRate": 52,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 75,
     "payRate": 165,
     "annRate": 52,
     "evalDate": "2027-11-09"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 70,
     "payRate": 178,
     "annRate": 52,
     "evalDate": "2028-02-11",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 4950,
    "loss": 1.42,
    "first": 84.99,
    "range": {
     "from": "2005-01-03",
     "to": "2025-01-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38018": {
   "no": 38018,
   "name": "미래에셋증권 제38018회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38018회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38018회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, HSCEI, Nikkei225",
    "underVol": "KOSPI200 52.5%, HSCEI 26.42%, Nikkei225 31.59%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "30%",
    "coupon": "연 21%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-07-20 과거 데이터 4,636회) 기준 만기 손실 발생 비율은 0.93% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 10,036.04원 입니다 (액면 대비 0.36%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 110.5,
     "annRate": 21,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 121,
     "annRate": 21,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 131.5,
     "annRate": 21,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 142,
     "annRate": 21,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 152.5,
     "annRate": 21,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 163,
     "annRate": 21,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 4636,
    "loss": 0.93,
    "first": 80.09,
    "range": {
     "from": "2003-01-06",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38019": {
   "no": 38019,
   "name": "미래에셋증권 제38019회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38019회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38019회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.63%, S&P500 24.59%, KOSPI200 52.5%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "40%",
    "coupon": "연 22%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, S&P500, KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 4,891회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,669.08원 입니다 (액면 대비 -3.31%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 111,
     "annRate": 22,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 122,
     "annRate": 22,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 133,
     "annRate": 22,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 144,
     "annRate": 22,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 155,
     "annRate": 22,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 166,
     "annRate": 22,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 4891,
    "loss": 0,
    "first": 94.25,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38020": {
   "no": 38020,
   "name": "미래에셋증권 제38020회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38020회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38020회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 63.88%, SK하이닉스 74.55%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "30%",
    "coupon": "연 46%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 5,069회) 기준 만기 손실 발생 비율은 0.54% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,745.41원 입니다 (액면 대비 -2.55%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 111.5,
     "annRate": 46,
     "evalDate": "2026-11-10"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 123,
     "annRate": 46,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 134.5,
     "annRate": 46,
     "evalDate": "2027-05-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 146,
     "annRate": 46,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 157.5,
     "annRate": 46,
     "evalDate": "2027-11-09"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 169,
     "annRate": 46,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 180.5,
     "annRate": 46,
     "evalDate": "2028-05-09"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 192,
     "annRate": 46,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 203.5,
     "annRate": 46,
     "evalDate": "2028-11-08"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 215,
     "annRate": 46,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 226.5,
     "annRate": 46,
     "evalDate": "2029-05-08"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 238,
     "annRate": 46,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 5069,
    "loss": 0.54,
    "first": 84.34,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38021": {
   "no": 38021,
   "name": "미래에셋증권 제38021회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38021회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38021회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 76.09%, SK하이닉스 87.7%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2027년 8월 13일",
    "matTerm": "1년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "40%",
    "coupon": "연 50%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2005-01-03~2025-07-18 과거 데이터 5,069회) 기준 만기 손실 발생 비율은 0.32% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 9,776.28원 입니다 (액면 대비 -2.24%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 70,
     "payRate": 112.5,
     "annRate": 50,
     "evalDate": "2026-11-10"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 70,
     "payRate": 125,
     "annRate": 50,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 70,
     "payRate": 137.5,
     "annRate": 50,
     "evalDate": "2027-05-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 65,
     "payRate": 150,
     "annRate": 50,
     "evalDate": "2027-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 5069,
    "loss": 0.32,
    "first": 96.82,
    "range": {
     "from": "2005-01-03",
     "to": "2025-07-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38022": {
   "no": 38022,
   "name": "미래에셋증권 제38022회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38022회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38022회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "어플라이드 머티어리얼즈, 마이크론 테크놀로지",
    "underVol": "어플라이드 머티어리얼즈 71.68%, 마이크론 테크놀로지 96.8%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "25%",
    "coupon": "연 42.4%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(어플라이드 머티어리얼즈, 마이크론 테크놀로지) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 5,172회) 기준 만기 손실 발생 비율은 3.58% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 8,566.16원 입니다 (액면 대비 -14.34%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 121.2,
     "annRate": 42.4,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 142.4,
     "annRate": 42.4,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 163.6,
     "annRate": 42.4,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 184.8,
     "annRate": 42.4,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 206,
     "annRate": 42.4,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 227.2,
     "annRate": 42.4,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 5172,
    "loss": 3.58,
    "first": 75.6,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38023": {
   "no": 38023,
   "name": "미래에셋증권 제38023회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260731000093",
   "rcpNo": "20260731000093",
   "docDate": "2026-07-31",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38023회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38023회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, 마이크론 테크놀로지",
    "underVol": "KOSPI200 52.5%, 마이크론 테크놀로지 96.8%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "35%",
    "coupon": "연 42.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, 마이크론 테크놀로지) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-20 과거 데이터 4,926회) 기준 만기 손실 발생 비율은 0.79% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 7월 31일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 7월 24일 기준 이 증권의 공정가격은 액면 10,000원 당 8,458.09원 입니다 (액면 대비 -15.42%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 121.25,
     "annRate": 42.5,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 142.5,
     "annRate": 42.5,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 163.75,
     "annRate": 42.5,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 185,
     "annRate": 42.5,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 206.25,
     "annRate": 42.5,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 227.5,
     "annRate": 42.5,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 4926,
    "loss": 0.79,
    "first": 83.09,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-20"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38024": {
   "no": 38024,
   "name": "미래에셋증권 제38024회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260804000229",
   "rcpNo": "20260804000229",
   "docDate": "2026-08-04",
   "collectedAt": "2026-09-01T07:35:25.813Z",
   "fields": {
    "name": "미래에셋증권 제38024회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38024회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 47.53%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "25%",
    "coupon": "연 12%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-28 과거 데이터 5,090회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 8월 4일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 3일 기준 이 증권의 공정가격은 액면 10,000원 당 9,889.7원 입니다 (액면 대비 -1.1%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 90,
     "payRate": 103,
     "annRate": 12,
     "evalDate": "2026-11-10"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 90,
     "payRate": 106,
     "annRate": 12,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 90,
     "payRate": 109,
     "annRate": 12,
     "evalDate": "2027-05-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 90,
     "payRate": 112,
     "annRate": 12,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 115,
     "annRate": 12,
     "evalDate": "2027-11-09"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 118,
     "annRate": 12,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 121,
     "annRate": 12,
     "evalDate": "2028-05-09"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 124,
     "annRate": 12,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 80,
     "payRate": 127,
     "annRate": 12,
     "evalDate": "2028-11-08"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 130,
     "annRate": 12,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 80,
     "payRate": 133,
     "annRate": 12,
     "evalDate": "2029-05-08"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 136,
     "annRate": 12,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 5090,
    "loss": 0,
    "first": 91.36,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-28"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38025": {
   "no": 38025,
   "name": "미래에셋증권 제38025회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260804000229",
   "rcpNo": "20260804000229",
   "docDate": "2026-08-04",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38025회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38025회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 47.53%",
    "issueDate": "2026년 8월 13일",
    "matDate": "2029년 8월 13일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 13일",
    "knockIn": "35%",
    "coupon": "연 17%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-07-28 과거 데이터 5,090회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 12일",
    "docDate": "2026년 8월 4일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 10일 ~ 2026년 8월 11일 이며, 가입의사 확인은 2026년 08월 12일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 7일 로, 일반 청약종료일(2026년 8월 12일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 3일 기준 이 증권의 공정가격은 액면 10,000원 당 10,034.06원 입니다 (액면 대비 0.34%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 108.5,
     "annRate": 17,
     "evalDate": "2027-02-10"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 117,
     "annRate": 17,
     "evalDate": "2027-08-10"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 125.5,
     "annRate": 17,
     "evalDate": "2028-02-08"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 134,
     "annRate": 17,
     "evalDate": "2028-08-08"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 142.5,
     "annRate": 17,
     "evalDate": "2029-02-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 151,
     "annRate": 17,
     "evalDate": "2029-08-13",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5090,
    "loss": 0,
    "first": 98.47,
    "range": {
     "from": "2003-01-02",
     "to": "2023-07-28"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38031": {
   "no": 38031,
   "name": "미래에셋증권 제38031회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38031회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38031회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 40.52%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 11.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,100회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,842.68원 입니다 (액면 대비 -1.57%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 105.75,
     "annRate": 11.5,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 111.5,
     "annRate": 11.5,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 117.25,
     "annRate": 11.5,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 123,
     "annRate": 11.5,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 128.75,
     "annRate": 11.5,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 134.5,
     "annRate": 11.5,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5100,
    "loss": 0,
    "first": 95.04,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38032": {
   "no": 38032,
   "name": "미래에셋증권 제38032회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38032회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38032회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 40.52%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "40%",
    "coupon": "연 12.6%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,100회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 USD 10,000 당 USD 9,908.98 입니다 (액면 대비 -0.91%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 106.3,
     "annRate": 12.6,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 112.6,
     "annRate": 12.6,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 118.9,
     "annRate": 12.6,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 125.2,
     "annRate": 12.6,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 131.5,
     "annRate": 12.6,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 137.8,
     "annRate": 12.6,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 5100,
    "loss": 0,
    "first": 98.57,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38033": {
   "no": 38033,
   "name": "미래에셋증권 제38033회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38033회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38033회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, KOSPI200, Nikkei225",
    "underVol": "EuroStoxx50 22.24%, KOSPI200 40.52%, Nikkei225 30.42%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 13.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, KOSPI200, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-08-10 과거 데이터 4,767회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,889.92원 입니다 (액면 대비 -1.1%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 106.6,
     "annRate": 13.2,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 113.2,
     "annRate": 13.2,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 119.8,
     "annRate": 13.2,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 126.4,
     "annRate": 13.2,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 133,
     "annRate": 13.2,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 139.6,
     "annRate": 13.2,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 4767,
    "loss": 0,
    "first": 88.13,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-10"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38034": {
   "no": 38034,
   "name": "미래에셋증권 제38034회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38034회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38034회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.24%, S&P500 24.17%, KOSPI200 40.52%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "40%",
    "coupon": "연 14.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, S&P500, KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 4,907회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,743.09원 입니다 (액면 대비 -2.57%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 107.1,
     "annRate": 14.2,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 114.2,
     "annRate": 14.2,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 121.3,
     "annRate": 14.2,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 128.4,
     "annRate": 14.2,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 135.5,
     "annRate": 14.2,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 142.6,
     "annRate": 14.2,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 4907,
    "loss": 0,
    "first": 90.2,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38035": {
   "no": 38035,
   "name": "미래에셋증권 제38035회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38035회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38035회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, KOSPI200, Nikkei225",
    "underVol": "S&P500 24.17%, KOSPI200 40.52%, Nikkei225 30.42%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "없음 (노낙인)",
    "coupon": "연 15.6%",
    "maxLoss": "100%",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,780.32원 입니다 (액면 대비 -2.2%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 107.8,
     "annRate": 15.6,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 115.6,
     "annRate": 15.6,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 123.4,
     "annRate": 15.6,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 70,
     "payRate": 131.2,
     "annRate": 15.6,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 65,
     "payRate": 139,
     "annRate": 15.6,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 60,
     "payRate": 146.8,
     "annRate": 15.6,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 60,
   "knockIn": "",
   "lizard": null,
   "sim": {
    "runs": 4678,
    "loss": 0.21,
    "first": 96,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-10"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38036": {
   "no": 38036,
   "name": "미래에셋증권 제38036회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38036회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38036회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, 삼성전자",
    "underVol": "KOSPI200 40.52%, 삼성전자 51.73%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 20.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, 삼성전자) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,097회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,886.17원 입니다 (액면 대비 -1.14%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 110.25,
     "annRate": 20.5,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 120.5,
     "annRate": 20.5,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 130.75,
     "annRate": 20.5,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 141,
     "annRate": 20.5,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 151.25,
     "annRate": 20.5,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 161.5,
     "annRate": 20.5,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5097,
    "loss": 0,
    "first": 95.17,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38037": {
   "no": 38037,
   "name": "미래에셋증권 제38037회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38037회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38037회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.73%, SK하이닉스 60.91%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "25%",
    "coupon": "연 27.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,085회) 기준 만기 손실 발생 비율은 0.47% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,981.06원 입니다 (액면 대비 -0.19%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 106.875,
     "annRate": 27.5,
     "evalDate": "2026-11-27"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 113.75,
     "annRate": 27.5,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 120.625,
     "annRate": 27.5,
     "evalDate": "2027-05-26"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 127.5,
     "annRate": 27.5,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 134.375,
     "annRate": 27.5,
     "evalDate": "2027-11-24"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 141.25,
     "annRate": 27.5,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 148.125,
     "annRate": 27.5,
     "evalDate": "2028-05-26"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 155,
     "annRate": 27.5,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 161.875,
     "annRate": 27.5,
     "evalDate": "2028-11-27"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 168.75,
     "annRate": 27.5,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 175.625,
     "annRate": 27.5,
     "evalDate": "2029-05-25"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 182.5,
     "annRate": 27.5,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 5085,
    "loss": 0.47,
    "first": 84.44,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38038": {
   "no": 38038,
   "name": "미래에셋증권 제38038회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38038회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38038회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.73%, SK하이닉스 60.91%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 30%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,085회) 기준 만기 손실 발생 비율은 0.49% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,936.09원 입니다 (액면 대비 -0.64%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 115,
     "annRate": 30,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 130,
     "annRate": 30,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 145,
     "annRate": 30,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 160,
     "annRate": 30,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 175,
     "annRate": 30,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 190,
     "annRate": 30,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5085,
    "loss": 0.49,
    "first": 90.86,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38039": {
   "no": 38039,
   "name": "미래에셋증권 제38039회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38039회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38039회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.73%, SK하이닉스 60.91%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "30%",
    "coupon": "연 31.3%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,085회) 기준 만기 손실 발생 비율은 0.47% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,898.64원 입니다 (액면 대비 -1.01%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 107.825,
     "annRate": 31.3,
     "evalDate": "2026-11-27"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 115.65,
     "annRate": 31.3,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 123.475,
     "annRate": 31.3,
     "evalDate": "2027-05-26"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 131.3,
     "annRate": 31.3,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 139.125,
     "annRate": 31.3,
     "evalDate": "2027-11-24"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 146.95,
     "annRate": 31.3,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 154.775,
     "annRate": 31.3,
     "evalDate": "2028-05-26"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 162.6,
     "annRate": 31.3,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 170.425,
     "annRate": 31.3,
     "evalDate": "2028-11-27"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 178.25,
     "annRate": 31.3,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 186.075,
     "annRate": 31.3,
     "evalDate": "2029-05-25"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 193.9,
     "annRate": 31.3,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 5085,
    "loss": 0.47,
    "first": 84.44,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38040": {
   "no": 38040,
   "name": "미래에셋증권 제38040회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38040회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38040회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.73%, SK하이닉스 60.91%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 35.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,085회) 기준 만기 손실 발생 비율은 1.36% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,930.31원 입니다 (액면 대비 -0.7%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 117.6,
     "annRate": 35.2,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 135.2,
     "annRate": 35.2,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 152.8,
     "annRate": 35.2,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 170.4,
     "annRate": 35.2,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 188,
     "annRate": 35.2,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 205.6,
     "annRate": 35.2,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5085,
    "loss": 1.36,
    "first": 78.21,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38041": {
   "no": 38041,
   "name": "미래에셋증권 제38041회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38041회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38041회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.73%, SK하이닉스 60.91%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 40%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,085회) 기준 만기 손실 발생 비율은 0.47% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 USD 10,000 당 USD 9,964.77 입니다 (액면 대비 -0.35%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 110,
     "annRate": 40,
     "evalDate": "2026-11-27"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 120,
     "annRate": 40,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 130,
     "annRate": 40,
     "evalDate": "2027-05-26"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 140,
     "annRate": 40,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 150,
     "annRate": 40,
     "evalDate": "2027-11-24"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 160,
     "annRate": 40,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 170,
     "annRate": 40,
     "evalDate": "2028-05-26"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 180,
     "annRate": 40,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 190,
     "annRate": 40,
     "evalDate": "2028-11-27"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 200,
     "annRate": 40,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 210,
     "annRate": 40,
     "evalDate": "2029-05-25"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 220,
     "annRate": 40,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5085,
    "loss": 0.47,
    "first": 84.44,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38042": {
   "no": 38042,
   "name": "미래에셋증권 제38042회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38042회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38042회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, HSCEI, Nikkei225",
    "underVol": "KOSPI200 40.52%, HSCEI 26.19%, Nikkei225 30.42%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "45%",
    "coupon": "연 16.6%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 45% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-08-10 과거 데이터 4,651회) 기준 만기 손실 발생 비율은 4.21% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,445.48원 입니다 (액면 대비 -5.55%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 108.3,
     "annRate": 16.6,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 116.6,
     "annRate": 16.6,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 124.9,
     "annRate": 16.6,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 133.2,
     "annRate": 16.6,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 141.5,
     "annRate": 16.6,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 149.8,
     "annRate": 16.6,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "45",
   "lizard": null,
   "sim": {
    "runs": 4651,
    "loss": 4.21,
    "first": 79.75,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-10"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38043": {
   "no": 38043,
   "name": "미래에셋증권 제38043회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38043회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38043회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.73%, SK하이닉스 60.91%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "20%",
    "coupon": "연 19.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 20% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,085회) 기준 만기 손실 발생 비율은 0.49% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 9,983.41원 입니다 (액면 대비 -0.17%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 109.6,
     "annRate": 19.2,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 119.2,
     "annRate": 19.2,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 128.8,
     "annRate": 19.2,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 138.4,
     "annRate": 19.2,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 148,
     "annRate": 19.2,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 157.6,
     "annRate": 19.2,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "20",
   "lizard": null,
   "sim": {
    "runs": 5085,
    "loss": 0.49,
    "first": 90.86,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38044": {
   "no": 38044,
   "name": "미래에셋증권 제38044회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38044회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38044회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, SK하이닉스",
    "underVol": "KOSPI200 40.52%, SK하이닉스 60.91%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 24%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,088회) 기준 만기 손실 발생 비율은 0.06% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 10,012.92원 입니다 (액면 대비 0.13%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 75,
     "payRate": 106,
     "annRate": 24,
     "evalDate": "2026-11-27"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 75,
     "payRate": 112,
     "annRate": 24,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 75,
     "payRate": 118,
     "annRate": 24,
     "evalDate": "2027-05-26"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 75,
     "payRate": 124,
     "annRate": 24,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 75,
     "payRate": 130,
     "annRate": 24,
     "evalDate": "2027-11-24"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 75,
     "payRate": 136,
     "annRate": 24,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 75,
     "payRate": 142,
     "annRate": 24,
     "evalDate": "2028-05-26"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 75,
     "payRate": 148,
     "annRate": 24,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 70,
     "payRate": 154,
     "annRate": 24,
     "evalDate": "2028-11-27"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 70,
     "payRate": 160,
     "annRate": 24,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 70,
     "payRate": 166,
     "annRate": 24,
     "evalDate": "2029-05-25"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 65,
     "payRate": 172,
     "annRate": 24,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5088,
    "loss": 0.06,
    "first": 95.17,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38045": {
   "no": 38045,
   "name": "미래에셋증권 제38045회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38045회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38045회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "어플라이드 머티어리얼즈, 마이크론 테크놀로지",
    "underVol": "어플라이드 머티어리얼즈 75.33%, 마이크론 테크놀로지 98.09%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 30.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(어플라이드 머티어리얼즈, 마이크론 테크놀로지) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 5,188회) 기준 만기 손실 발생 비율은 3.4% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 7,768.05원 입니다 (액면 대비 -22.32%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 115.1,
     "annRate": 30.2,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 130.2,
     "annRate": 30.2,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 145.3,
     "annRate": 30.2,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 160.4,
     "annRate": 30.2,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 175.5,
     "annRate": 30.2,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 190.6,
     "annRate": 30.2,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5188,
    "loss": 3.4,
    "first": 75.79,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38046": {
   "no": 38046,
   "name": "미래에셋증권 제38046회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38046회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38046회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "마이크론 테크놀로지, 팔란티어 테크",
    "underVol": "마이크론 테크놀로지 98.09%, 팔란티어 테크 67.29%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "25%",
    "coupon": "연 25%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(마이크론 테크놀로지, 팔란티어 테크) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2020-09-30~2023-08-11 과거 데이터 721회) 기준 만기 손실 발생 비율은 2.07% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 6,833.73원 입니다 (액면 대비 -31.66%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 112.5,
     "annRate": 25,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 125,
     "annRate": 25,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 137.5,
     "annRate": 25,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 150,
     "annRate": 25,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 162.5,
     "annRate": 25,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 175,
     "annRate": 25,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 721,
    "loss": 2.07,
    "first": 65.19,
    "range": {
     "from": "2020-09-30",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38047": {
   "no": 38047,
   "name": "미래에셋증권 제38047회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260821000193",
   "rcpNo": "20260821000193",
   "docDate": "2026-08-21",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38047회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38047회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, 마이크론 테크놀로지",
    "underVol": "KOSPI200 40.52%, 마이크론 테크놀로지 98.09%",
    "issueDate": "2026년 8월 31일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 8월 31일",
    "knockIn": "35%",
    "coupon": "연 29%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, 마이크론 테크놀로지) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-11 과거 데이터 4,942회) 기준 만기 손실 발생 비율은 1.21% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 8월 28일",
    "docDate": "2026년 8월 21일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 26일 ~ 2026년 8월 27일 이며, 가입의사 확인은 2026년 08월 28일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 25일 로, 일반 청약종료일(2026년 8월 28일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 18일 기준 이 증권의 공정가격은 액면 10,000원 당 7,795.14원 입니다 (액면 대비 -22.05%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 114.5,
     "annRate": 29,
     "evalDate": "2027-02-22"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 129,
     "annRate": 29,
     "evalDate": "2027-08-26"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 143.5,
     "annRate": 29,
     "evalDate": "2028-02-24"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 158,
     "annRate": 29,
     "evalDate": "2028-08-28"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 172.5,
     "annRate": 29,
     "evalDate": "2029-02-23"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 187,
     "annRate": 29,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 4942,
    "loss": 1.21,
    "first": 78.65,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-11"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   }
  },
  "38048": {
   "no": 38048,
   "name": "미래에셋증권 제38048회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38048회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38048회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.06%, S&P500 24.18%, KOSPI200 40.4%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "없음 (노낙인)",
    "coupon": "연 10%",
    "maxLoss": "100%",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 10,081.85원 입니다 (액면 대비 0.82%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 105,
     "annRate": 10,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 110,
     "annRate": 10,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 115,
     "annRate": 10,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 70,
     "payRate": 120,
     "annRate": 10,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 65,
     "payRate": 125,
     "annRate": 10,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 60,
     "payRate": 130,
     "annRate": 10,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 60,
   "knockIn": "",
   "lizard": {
    "step": 2,
    "barrier": 45,
    "payout": 110
   },
   "sim": {
    "runs": 4908,
    "loss": 0,
    "first": 90.2,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008V41",
   "productName": "미래에셋증권(ELS)38048"
  },
  "38049": {
   "no": 38049,
   "name": "미래에셋증권 제38049회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38049회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38049회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 40.4%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 10.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,101회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,914.38원 입니다 (액면 대비 -0.86%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 105.1,
     "annRate": 10.2,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 110.2,
     "annRate": 10.2,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 115.3,
     "annRate": 10.2,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 120.4,
     "annRate": 10.2,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 125.5,
     "annRate": 10.2,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 130.6,
     "annRate": 10.2,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5101,
    "loss": 0,
    "first": 98.57,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008V58",
   "productName": "미래에셋증권(ELS)38049"
  },
  "38050": {
   "no": 38050,
   "name": "미래에셋증권 제38050회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38050회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38050회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, HSCEI, Nikkei225",
    "underVol": "S&P500 24.18%, HSCEI 26.14%, Nikkei225 30.69%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "45%",
    "coupon": "연 11%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(S&P500, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 45% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-08-14 과거 데이터 4,653회) 기준 만기 손실 발생 비율은 4.02% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,489.25원 입니다 (액면 대비 -5.11%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 90,
     "payRate": 105.5,
     "annRate": 11,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 111,
     "annRate": 11,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 116.5,
     "annRate": 11,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 122,
     "annRate": 11,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 127.5,
     "annRate": 11,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 133,
     "annRate": 11,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "45",
   "lizard": null,
   "sim": {
    "runs": 4653,
    "loss": 4.02,
    "first": 69.2,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008V66",
   "productName": "미래에셋증권(ELS)38050"
  },
  "38051": {
   "no": 38051,
   "name": "미래에셋증권 제38051회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38051회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38051회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 40.4%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 11.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,101회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,848.14원 입니다 (액면 대비 -1.52%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 105.75,
     "annRate": 11.5,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 111.5,
     "annRate": 11.5,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 117.25,
     "annRate": 11.5,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 123,
     "annRate": 11.5,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 128.75,
     "annRate": 11.5,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 134.5,
     "annRate": 11.5,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5101,
    "loss": 0,
    "first": 95.04,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008V74",
   "productName": "미래에셋증권(ELS)38051"
  },
  "38052": {
   "no": 38052,
   "name": "미래에셋증권 제38052회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38052회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38052회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 40.4%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 11.9%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,101회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,875원 입니다 (액면 대비 -1.25%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 90,
     "payRate": 102.975,
     "annRate": 11.9,
     "evalDate": "2026-11-30"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 90,
     "payRate": 105.95,
     "annRate": 11.9,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 90,
     "payRate": 108.925,
     "annRate": 11.9,
     "evalDate": "2027-05-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 90,
     "payRate": 111.9,
     "annRate": 11.9,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 114.875,
     "annRate": 11.9,
     "evalDate": "2027-11-30"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 117.85,
     "annRate": 11.9,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 120.825,
     "annRate": 11.9,
     "evalDate": "2028-05-30"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 123.8,
     "annRate": 11.9,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 80,
     "payRate": 126.775,
     "annRate": 11.9,
     "evalDate": "2028-11-28"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 129.75,
     "annRate": 11.9,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 80,
     "payRate": 132.725,
     "annRate": 11.9,
     "evalDate": "2029-05-29"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 135.7,
     "annRate": 11.9,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5101,
    "loss": 0,
    "first": 91.32,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008V82",
   "productName": "미래에셋증권(ELS)38052"
  },
  "38053": {
   "no": 38053,
   "name": "미래에셋증권 제38053회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38053회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38053회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, HSCEI, Nikkei225",
    "underVol": "KOSPI200 40.4%, HSCEI 26.14%, Nikkei225 30.69%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "30%",
    "coupon": "연 12%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-08-14 과거 데이터 4,652회) 기준 만기 손실 발생 비율은 0.95% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 10,083.02원 입니다 (액면 대비 0.83%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 106,
     "annRate": 12,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 112,
     "annRate": 12,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 118,
     "annRate": 12,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 124,
     "annRate": 12,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 130,
     "annRate": 12,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 136,
     "annRate": 12,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 4652,
    "loss": 0.95,
    "first": 79.73,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008V90",
   "productName": "미래에셋증권(ELS)38053"
  },
  "38054": {
   "no": 38054,
   "name": "미래에셋증권 제38054회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38054회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38054회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.06%, S&P500 24.18%, KOSPI200 40.4%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 13.2%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, S&P500, KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 4,908회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,970.34원 입니다 (액면 대비 -0.3%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 106.6,
     "annRate": 13.2,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 113.2,
     "annRate": 13.2,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 119.8,
     "annRate": 13.2,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 126.4,
     "annRate": 13.2,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 133,
     "annRate": 13.2,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 139.6,
     "annRate": 13.2,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 4908,
    "loss": 0,
    "first": 90.2,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VA6",
   "productName": "미래에셋증권(ELS)38054"
  },
  "38055": {
   "no": 38055,
   "name": "미래에셋증권 제38055회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38055회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38055회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.61%, SK하이닉스 61.05%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "30%",
    "coupon": "연 28%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,086회) 기준 만기 손실 발생 비율은 0.47% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,963.19원 입니다 (액면 대비 -0.37%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 114,
     "annRate": 28,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 128,
     "annRate": 28,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 142,
     "annRate": 28,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 156,
     "annRate": 28,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 170,
     "annRate": 28,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 184,
     "annRate": 28,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 5086,
    "loss": 0.47,
    "first": 90.86,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VB4",
   "productName": "미래에셋증권(ELS)38055"
  },
  "38056": {
   "no": 38056,
   "name": "미래에셋증권 제38056회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38056회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38056회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.61%, SK하이닉스 61.05%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 30%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,086회) 기준 만기 손실 발생 비율은 0.47% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,942.79원 입니다 (액면 대비 -0.57%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 115,
     "annRate": 30,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 130,
     "annRate": 30,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 145,
     "annRate": 30,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 160,
     "annRate": 30,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 175,
     "annRate": 30,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 190,
     "annRate": 30,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5086,
    "loss": 0.47,
    "first": 90.86,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VC2",
   "productName": "미래에셋증권(ELS)38056"
  },
  "38057": {
   "no": 38057,
   "name": "미래에셋증권 제38057회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38057회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38057회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.61%, SK하이닉스 61.05%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 33%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,086회) 기준 만기 손실 발생 비율은 0.49% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 USD 10,000 당 USD 9,960.19 입니다 (액면 대비 -0.4%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 116.5,
     "annRate": 33,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 133,
     "annRate": 33,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 149.5,
     "annRate": 33,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 166,
     "annRate": 33,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 182.5,
     "annRate": 33,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 199,
     "annRate": 33,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5086,
    "loss": 0.49,
    "first": 90.86,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VD0",
   "productName": "미래에셋증권(ELS)38057"
  },
  "38058": {
   "no": 38058,
   "name": "미래에셋증권 제38058회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38058회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38058회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.61%, SK하이닉스 61.05%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 35%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,086회) 기준 만기 손실 발생 비율은 0.53% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,904.38원 입니다 (액면 대비 -0.96%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 108.75,
     "annRate": 35,
     "evalDate": "2026-11-30"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 117.5,
     "annRate": 35,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 126.25,
     "annRate": 35,
     "evalDate": "2027-05-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 135,
     "annRate": 35,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 143.75,
     "annRate": 35,
     "evalDate": "2027-11-30"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 152.5,
     "annRate": 35,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 161.25,
     "annRate": 35,
     "evalDate": "2028-05-30"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 170,
     "annRate": 35,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 178.75,
     "annRate": 35,
     "evalDate": "2028-11-28"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 187.5,
     "annRate": 35,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 196.25,
     "annRate": 35,
     "evalDate": "2029-05-29"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 205,
     "annRate": 35,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5086,
    "loss": 0.53,
    "first": 84.45,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VE8",
   "productName": "미래에셋증권(ELS)38058"
  },
  "38059": {
   "no": 38059,
   "name": "미래에셋증권 제38059회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38059회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38059회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 51.61%, SK하이닉스 61.05%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 40%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,086회) 기준 만기 손실 발생 비율은 0.53% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 USD 10,000 당 USD 9,973.65 입니다 (액면 대비 -0.26%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 110,
     "annRate": 40,
     "evalDate": "2026-11-30"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 120,
     "annRate": 40,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 130,
     "annRate": 40,
     "evalDate": "2027-05-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 140,
     "annRate": 40,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 150,
     "annRate": 40,
     "evalDate": "2027-11-30"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 160,
     "annRate": 40,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 170,
     "annRate": 40,
     "evalDate": "2028-05-30"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 180,
     "annRate": 40,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 190,
     "annRate": 40,
     "evalDate": "2028-11-28"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 200,
     "annRate": 40,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 210,
     "annRate": 40,
     "evalDate": "2029-05-29"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 220,
     "annRate": 40,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5086,
    "loss": 0.53,
    "first": 84.45,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VF5",
   "productName": "미래에셋증권(ELS)38059"
  },
  "38060": {
   "no": 38060,
   "name": "미래에셋증권 제38060회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38060회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38060회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, KOSPI200, Nikkei225",
    "underVol": "S&P500 24.18%, KOSPI200 40.4%, Nikkei225 30.69%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "40%",
    "coupon": "연 15.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(S&P500, KOSPI200, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-08-14 과거 데이터 4,679회) 기준 만기 손실 발생 비율은 0.49% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,764.4원 입니다 (액면 대비 -2.36%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 107.75,
     "annRate": 15.5,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 115.5,
     "annRate": 15.5,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 123.25,
     "annRate": 15.5,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 131,
     "annRate": 15.5,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 138.75,
     "annRate": 15.5,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 146.5,
     "annRate": 15.5,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 4679,
    "loss": 0.49,
    "first": 91.13,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VG3",
   "productName": "미래에셋증권(ELS)38060e"
  },
  "38061": {
   "no": 38061,
   "name": "미래에셋증권 제38061회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38061회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38061회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, SK하이닉스",
    "underVol": "KOSPI200 40.4%, SK하이닉스 61.05%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 24%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,089회) 기준 만기 손실 발생 비율은 0.12% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 10,012.11원 입니다 (액면 대비 0.12%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 75,
     "payRate": 106,
     "annRate": 24,
     "evalDate": "2026-11-30"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 75,
     "payRate": 112,
     "annRate": 24,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 75,
     "payRate": 118,
     "annRate": 24,
     "evalDate": "2027-05-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 75,
     "payRate": 124,
     "annRate": 24,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 75,
     "payRate": 130,
     "annRate": 24,
     "evalDate": "2027-11-30"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 75,
     "payRate": 136,
     "annRate": 24,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 75,
     "payRate": 142,
     "annRate": 24,
     "evalDate": "2028-05-30"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 75,
     "payRate": 148,
     "annRate": 24,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 70,
     "payRate": 154,
     "annRate": 24,
     "evalDate": "2028-11-28"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 70,
     "payRate": 160,
     "annRate": 24,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 70,
     "payRate": 166,
     "annRate": 24,
     "evalDate": "2029-05-29"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 65,
     "payRate": 172,
     "annRate": 24,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5089,
    "loss": 0.12,
    "first": 95.17,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VH1",
   "productName": "미래에셋증권(ELS)38061e"
  },
  "38062": {
   "no": 38062,
   "name": "미래에셋증권 제38062회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38062회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38062회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 65.17%, SK하이닉스 75.45%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2027년 9월 3일",
    "matTerm": "1년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "40%",
    "coupon": "연 29%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2005-01-03~2025-08-14 과거 데이터 5,088회) 기준 만기 손실 발생 비율은 0.59% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 9,541.97원 입니다 (액면 대비 -4.58%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 75,
     "payRate": 107.25,
     "annRate": 29,
     "evalDate": "2026-11-30"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 75,
     "payRate": 114.5,
     "annRate": 29,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 75,
     "payRate": 121.75,
     "annRate": 29,
     "evalDate": "2027-05-28"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 70,
     "payRate": 129,
     "annRate": 29,
     "evalDate": "2027-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 5088,
    "loss": 0.59,
    "first": 95.09,
    "range": {
     "from": "2005-01-03",
     "to": "2025-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VJ7",
   "productName": "미래에셋증권(ELS)38062e"
  },
  "38063": {
   "no": 38063,
   "name": "미래에셋증권 제38063회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38063회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38063회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "어플라이드 머티어리얼즈, 마이크론 테크놀로지",
    "underVol": "어플라이드 머티어리얼즈 75.11%, 마이크론 테크놀로지 97.98%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 8월 31일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 29.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(어플라이드 머티어리얼즈, 마이크론 테크놀로지) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 5,189회) 기준 만기 손실 발생 비율은 2.61% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 7,943.55원 입니다 (액면 대비 -20.56%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 114.75,
     "annRate": 29.5,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 129.5,
     "annRate": 29.5,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 144.25,
     "annRate": 29.5,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 159,
     "annRate": 29.5,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 173.75,
     "annRate": 29.5,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 188.5,
     "annRate": 29.5,
     "evalDate": "2029-08-31",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5189,
    "loss": 2.61,
    "first": 81.44,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VK5",
   "productName": "미래에셋증권(ELS)38063e"
  },
  "38064": {
   "no": 38064,
   "name": "미래에셋증권 제38064회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38064회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38064회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "마이크론 테크놀로지, 브로드컴",
    "underVol": "마이크론 테크놀로지 97.98%, 브로드컴 58.41%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 27.1%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(마이크론 테크놀로지, 브로드컴) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2009-08-06~2023-08-14 과거 데이터 3,529회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 7,527.49원 입니다 (액면 대비 -24.73%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 113.55,
     "annRate": 27.1,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 127.1,
     "annRate": 27.1,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 140.65,
     "annRate": 27.1,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 154.2,
     "annRate": 27.1,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 167.75,
     "annRate": 27.1,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 181.3,
     "annRate": 27.1,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 3529,
    "loss": 0,
    "first": 79.77,
    "range": {
     "from": "2009-08-06",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VL3",
   "productName": "미래에셋증권(ELS)38064e"
  },
  "38065": {
   "no": 38065,
   "name": "미래에셋증권 제38065회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260825000251",
   "rcpNo": "20260825000251",
   "docDate": "2026-08-25",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38065회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38065회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, 마이크론 테크놀로지",
    "underVol": "KOSPI200 40.4%, 마이크론 테크놀로지 97.98%",
    "issueDate": "2026년 9월 3일",
    "matDate": "2029년 9월 3일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 3일",
    "knockIn": "35%",
    "coupon": "연 29%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, 마이크론 테크놀로지) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-14 과거 데이터 4,943회) 기준 만기 손실 발생 비율은 1.25% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 2일",
    "docDate": "2026년 8월 25일",
    "coolNote": "이 회차의 숙려기간은 2026년 8월 31일 ~ 2026년 9월 1일 이며, 가입의사 확인은 2026년 09월 02일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 8월 28일 로, 일반 청약종료일(2026년 9월 2일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 20일 기준 이 증권의 공정가격은 액면 10,000원 당 7,797.17원 입니다 (액면 대비 -22.03%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 114.5,
     "annRate": 29,
     "evalDate": "2027-02-25"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 129,
     "annRate": 29,
     "evalDate": "2027-08-31"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 143.5,
     "annRate": 29,
     "evalDate": "2028-02-28"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 158,
     "annRate": 29,
     "evalDate": "2028-08-29"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 172.5,
     "annRate": 29,
     "evalDate": "2029-02-26"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 187,
     "annRate": 29,
     "evalDate": "2029-09-03",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 4943,
    "loss": 1.25,
    "first": 78.66,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-14"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VM1",
   "productName": "미래에셋증권(ELS)38065e"
  },
  "38070": {
   "no": 38070,
   "name": "미래에셋증권 제38070회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38070회 파생결합증권(주가연계증권)(높은위험,원금비보장)(상품위험등급:2등급)",
    "issuer": "미래에셋증권",
    "round": "제38070회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "2",
    "riskLabel": "높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, Nikkei225",
    "underVol": "EuroStoxx50 22.04%, S&P500 23.98%, Nikkei225 30.04%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "45%",
    "coupon": "연 10%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, S&P500, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 45% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-08-18 과거 데이터 4,835회) 기준 만기 손실 발생 비율은 3.26% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 9,594.52원 입니다 (액면 대비 -4.05%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 90,
     "payRate": 105,
     "annRate": 10,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 90,
     "payRate": 110,
     "annRate": 10,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 115,
     "annRate": 10,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 120,
     "annRate": 10,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 125,
     "annRate": 10,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 130,
     "annRate": 10,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "45",
   "lizard": null,
   "sim": {
    "runs": 4835,
    "loss": 3.26,
    "first": 80.83,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VY6",
   "productName": "미래에셋증권(ELS)38070"
  },
  "38071": {
   "no": 38071,
   "name": "미래에셋증권 제38071회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.814Z",
   "fields": {
    "name": "미래에셋증권 제38071회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38071회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "S&P500, KOSPI200, Nikkei225",
    "underVol": "S&P500 23.98%, KOSPI200 36.29%, Nikkei225 30.04%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "없음 (노낙인)",
    "coupon": "연 10.5%",
    "maxLoss": "100%",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,293.06원 입니다 (액면 대비 2.93%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 105.25,
     "annRate": 10.5,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 110.5,
     "annRate": 10.5,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 115.75,
     "annRate": 10.5,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 70,
     "payRate": 121,
     "annRate": 10.5,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 65,
     "payRate": 126.25,
     "annRate": 10.5,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 60,
     "payRate": 131.5,
     "annRate": 10.5,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 60,
   "knockIn": "",
   "lizard": {
    "step": 2,
    "barrier": 40,
    "payout": 110.5
   },
   "sim": {
    "runs": 4682,
    "loss": 0,
    "first": 95.88,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008VZ3",
   "productName": "미래에셋증권(ELS)38071"
  },
  "38072": {
   "no": 38072,
   "name": "미래에셋증권 제38072회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38072회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38072회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 36.29%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "35%",
    "coupon": "연 11.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,104회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,056.03원 입니다 (액면 대비 0.56%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 105.75,
     "annRate": 11.5,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 111.5,
     "annRate": 11.5,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 117.25,
     "annRate": 11.5,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 123,
     "annRate": 11.5,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 128.75,
     "annRate": 11.5,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 134.5,
     "annRate": 11.5,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5104,
    "loss": 0,
    "first": 94.93,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W08",
   "productName": "미래에셋증권(ELS)38072"
  },
  "38073": {
   "no": 38073,
   "name": "미래에셋증권 제38073회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38073회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38073회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200",
    "underVol": "KOSPI200 36.29%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "35%",
    "coupon": "연 12%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,104회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,091.99원 입니다 (액면 대비 0.92%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 90,
     "payRate": 106,
     "annRate": 12,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 90,
     "payRate": 112,
     "annRate": 12,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 90,
     "payRate": 118,
     "annRate": 12,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 85,
     "payRate": 124,
     "annRate": 12,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 80,
     "payRate": 130,
     "annRate": 12,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 136,
     "annRate": 12,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5104,
    "loss": 0,
    "first": 87.56,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W16",
   "productName": "미래에셋증권(ELS)38073"
  },
  "38074": {
   "no": 38074,
   "name": "미래에셋증권 제38074회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38074회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38074회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, S&P500, KOSPI200",
    "underVol": "EuroStoxx50 22.04%, S&P500 23.98%, KOSPI200 36.29%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "없음 (노낙인)",
    "coupon": "연 14.5%",
    "maxLoss": "100%",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 9,910.75원 입니다 (액면 대비 -0.89%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 107.25,
     "annRate": 14.5,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 114.5,
     "annRate": 14.5,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 121.75,
     "annRate": 14.5,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 70,
     "payRate": 129,
     "annRate": 14.5,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 65,
     "payRate": 136.25,
     "annRate": 14.5,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 60,
     "payRate": 143.5,
     "annRate": 14.5,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 60,
   "knockIn": "",
   "lizard": null,
   "sim": {
    "runs": 4911,
    "loss": 0,
    "first": 94.44,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W24",
   "productName": "미래에셋증권(ELS)38074"
  },
  "38075": {
   "no": 38075,
   "name": "미래에셋증권 제38075회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38075회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38075회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "EuroStoxx50, KOSPI200, Nikkei225",
    "underVol": "EuroStoxx50 22.04%, KOSPI200 36.29%, Nikkei225 30.04%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "40%",
    "coupon": "연 16%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(EuroStoxx50, KOSPI200, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 40% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-08-18 과거 데이터 4,771회) 기준 만기 손실 발생 비율은 0.5% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,068.35원 입니다 (액면 대비 0.68%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 108,
     "annRate": 16,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 116,
     "annRate": 16,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 124,
     "annRate": 16,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 132,
     "annRate": 16,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 140,
     "annRate": 16,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 148,
     "annRate": 16,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "40",
   "lizard": null,
   "sim": {
    "runs": 4771,
    "loss": 0.5,
    "first": 88.03,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W32",
   "productName": "미래에셋증권(ELS)38075"
  },
  "38076": {
   "no": 38076,
   "name": "미래에셋증권 제38076회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38076회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38076회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 47.99%, SK하이닉스 56.61%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "20%",
    "coupon": "연 21%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 20% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,089회) 기준 만기 손실 발생 비율은 1.42% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,437.4원 입니다 (액면 대비 4.37%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 110.5,
     "annRate": 21,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 121,
     "annRate": 21,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 131.5,
     "annRate": 21,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 142,
     "annRate": 21,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 152.5,
     "annRate": 21,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 163,
     "annRate": 21,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "20",
   "lizard": null,
   "sim": {
    "runs": 5089,
    "loss": 1.42,
    "first": 78.19,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W40",
   "productName": "미래에셋증권(ELS)38076"
  },
  "38077": {
   "no": 38077,
   "name": "미래에셋증권 제38077회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38077회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38077회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, 삼성전자",
    "underVol": "KOSPI200 36.29%, 삼성전자 47.99%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "35%",
    "coupon": "연 25.1%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, 삼성전자) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,101회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,384.98원 입니다 (액면 대비 3.85%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 112.55,
     "annRate": 25.1,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 125.1,
     "annRate": 25.1,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 80,
     "payRate": 137.65,
     "annRate": 25.1,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 150.2,
     "annRate": 25.1,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 162.75,
     "annRate": 25.1,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 175.3,
     "annRate": 25.1,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5101,
    "loss": 0,
    "first": 95.28,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W57",
   "productName": "미래에셋증권(ELS)38077"
  },
  "38078": {
   "no": 38078,
   "name": "미래에셋증권 제38078회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38078회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38078회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, 삼성전자",
    "underVol": "KOSPI200 36.29%, 삼성전자 47.99%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "30%",
    "coupon": "연 29%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, 삼성전자) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-21 과거 데이터 5,102회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,551.48원 입니다 (액면 대비 5.51%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 90,
     "payRate": 107.25,
     "annRate": 29,
     "evalDate": "2026-12-07"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 90,
     "payRate": 114.5,
     "annRate": 29,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 90,
     "payRate": 121.75,
     "annRate": 29,
     "evalDate": "2027-06-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 90,
     "payRate": 129,
     "annRate": 29,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 136.25,
     "annRate": 29,
     "evalDate": "2027-12-07"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 143.5,
     "annRate": 29,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 150.75,
     "annRate": 29,
     "evalDate": "2028-06-05"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 158,
     "annRate": 29,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 80,
     "payRate": 165.25,
     "annRate": 29,
     "evalDate": "2028-12-05"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 172.5,
     "annRate": 29,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 80,
     "payRate": 179.75,
     "annRate": 29,
     "evalDate": "2029-06-04"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 187,
     "annRate": 29,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 5102,
    "loss": 0,
    "first": 82.97,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-21"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W65",
   "productName": "미래에셋증권(ELS)38078"
  },
  "38079": {
   "no": 38079,
   "name": "미래에셋증권 제38079회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38079회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38079회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 47.99%, SK하이닉스 56.61%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "35%",
    "coupon": "연 30%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,089회) 기준 만기 손실 발생 비율은 0.53% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,197.04원 입니다 (액면 대비 1.97%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 115,
     "annRate": 30,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 130,
     "annRate": 30,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 145,
     "annRate": 30,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 160,
     "annRate": 30,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 175,
     "annRate": 30,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 190,
     "annRate": 30,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5089,
    "loss": 0.53,
    "first": 90.86,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W73",
   "productName": "미래에셋증권(ELS)38079"
  },
  "38080": {
   "no": 38080,
   "name": "미래에셋증권 제38080회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38080회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38080회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 47.99%, SK하이닉스 56.61%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "35%",
    "coupon": "연 36.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,089회) 기준 만기 손실 발생 비율은 1.42% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 1,000,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,322.1원 입니다 (액면 대비 3.22%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 118.25,
     "annRate": 36.5,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 136.5,
     "annRate": 36.5,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 154.75,
     "annRate": 36.5,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 173,
     "annRate": 36.5,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 191.25,
     "annRate": 36.5,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 209.5,
     "annRate": 36.5,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5089,
    "loss": 1.42,
    "first": 78.19,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W81",
   "productName": "미래에셋증권(ELS)38080"
  },
  "38081": {
   "no": 38081,
   "name": "미래에셋증권 제38081회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38081회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38081회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 47.99%, SK하이닉스 56.61%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "35%",
    "coupon": "연 40%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,089회) 기준 만기 손실 발생 비율은 0.47% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 USD 10,000 당 USD 10,184.24 입니다 (액면 대비 1.84%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 110,
     "annRate": 40,
     "evalDate": "2026-12-07"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 120,
     "annRate": 40,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 130,
     "annRate": 40,
     "evalDate": "2027-06-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 140,
     "annRate": 40,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 150,
     "annRate": 40,
     "evalDate": "2027-12-07"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 160,
     "annRate": 40,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 170,
     "annRate": 40,
     "evalDate": "2028-06-05"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 180,
     "annRate": 40,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 190,
     "annRate": 40,
     "evalDate": "2028-12-05"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 200,
     "annRate": 40,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 210,
     "annRate": 40,
     "evalDate": "2029-06-04"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 220,
     "annRate": 40,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 5089,
    "loss": 0.47,
    "first": 84.46,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008W99",
   "productName": "미래에셋증권(ELS)38081"
  },
  "38082": {
   "no": 38082,
   "name": "미래에셋증권 제38082회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38082회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38082회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "KOSPI200, HSCEI, Nikkei225",
    "underVol": "KOSPI200 36.29%, HSCEI 26.28%, Nikkei225 30.04%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "45%",
    "coupon": "연 18%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(KOSPI200, HSCEI, Nikkei225) 중 어느 하나라도 종가기준으로 각 최초기준가격의 45% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-06~2023-08-18 과거 데이터 4,655회) 기준 만기 손실 발생 비율은 4.23% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 9,778.47원 입니다 (액면 대비 -2.22%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 109,
     "annRate": 18,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 118,
     "annRate": 18,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 127,
     "annRate": 18,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 136,
     "annRate": 18,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 145,
     "annRate": 18,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 154,
     "annRate": 18,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "45",
   "lizard": null,
   "sim": {
    "runs": 4655,
    "loss": 4.23,
    "first": 79.66,
    "range": {
     "from": "2003-01-06",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008WA4",
   "productName": "미래에셋증권(ELS)38082e"
  },
  "38083": {
   "no": 38083,
   "name": "미래에셋증권 제38083회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38083회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38083회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 47.99%, SK하이닉스 56.61%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "25%",
    "coupon": "연 24%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 65% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,089회) 기준 만기 손실 발생 비율은 0.53% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,250.56원 입니다 (액면 대비 2.51%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 112,
     "annRate": 24,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 124,
     "annRate": 24,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 136,
     "annRate": 24,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 148,
     "annRate": 24,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 160,
     "annRate": 24,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 65,
     "payRate": 172,
     "annRate": 24,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 65,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 5089,
    "loss": 0.53,
    "first": 90.86,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008WB2",
   "productName": "미래에셋증권(ELS)38083e"
  },
  "38084": {
   "no": 38084,
   "name": "미래에셋증권 제38084회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38084회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38084회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 47.99%, SK하이닉스 56.61%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "25%",
    "coupon": "연 27%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,089회) 기준 만기 손실 발생 비율은 1.42% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,416.96원 입니다 (액면 대비 4.17%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 85,
     "payRate": 113.5,
     "annRate": 27,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 85,
     "payRate": 127,
     "annRate": 27,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 85,
     "payRate": 140.5,
     "annRate": 27,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 80,
     "payRate": 154,
     "annRate": 27,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 75,
     "payRate": 167.5,
     "annRate": 27,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 181,
     "annRate": 27,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 5089,
    "loss": 1.42,
    "first": 78.19,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008WC0",
   "productName": "미래에셋증권(ELS)38084e"
  },
  "38085": {
   "no": 38085,
   "name": "미래에셋증권 제38085회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38085회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38085회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "삼성전자, SK하이닉스",
    "underVol": "삼성전자 47.99%, SK하이닉스 56.61%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "30%",
    "coupon": "연 32.3%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(삼성전자, SK하이닉스) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2003-01-02~2023-08-18 과거 데이터 5,089회) 기준 만기 손실 발생 비율은 0.47% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산이 모두 아시아 지역 거래자산)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 10,185.26원 입니다 (액면 대비 1.85%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 3,
     "barrier": 85,
     "payRate": 108.075,
     "annRate": 32.3,
     "evalDate": "2026-12-07"
    },
    {
     "seq": 2,
     "months": 6,
     "barrier": 85,
     "payRate": 116.15,
     "annRate": 32.3,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 3,
     "months": 9,
     "barrier": 85,
     "payRate": 124.225,
     "annRate": 32.3,
     "evalDate": "2027-06-07"
    },
    {
     "seq": 4,
     "months": 12,
     "barrier": 85,
     "payRate": 132.3,
     "annRate": 32.3,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 5,
     "months": 15,
     "barrier": 85,
     "payRate": 140.375,
     "annRate": 32.3,
     "evalDate": "2027-12-07"
    },
    {
     "seq": 6,
     "months": 18,
     "barrier": 85,
     "payRate": 148.45,
     "annRate": 32.3,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 7,
     "months": 21,
     "barrier": 85,
     "payRate": 156.525,
     "annRate": 32.3,
     "evalDate": "2028-06-05"
    },
    {
     "seq": 8,
     "months": 24,
     "barrier": 85,
     "payRate": 164.6,
     "annRate": 32.3,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 9,
     "months": 27,
     "barrier": 85,
     "payRate": 172.675,
     "annRate": 32.3,
     "evalDate": "2028-12-05"
    },
    {
     "seq": 10,
     "months": 30,
     "barrier": 80,
     "payRate": 180.75,
     "annRate": 32.3,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 11,
     "months": 33,
     "barrier": 75,
     "payRate": 188.825,
     "annRate": 32.3,
     "evalDate": "2029-06-04"
    },
    {
     "seq": 12,
     "months": 36,
     "barrier": 70,
     "payRate": 196.9,
     "annRate": 32.3,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 5089,
    "loss": 0.47,
    "first": 84.46,
    "range": {
     "from": "2003-01-02",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008WD8",
   "productName": "미래에셋증권(ELS)38085e"
  },
  "38086": {
   "no": 38086,
   "name": "미래에셋증권 제38086회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38086회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38086회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "테슬라, 팔란티어 테크",
    "underVol": "테슬라 55.7%, 팔란티어 테크 67.06%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "25%",
    "coupon": "연 16%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(테슬라, 팔란티어 테크) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2020-09-30~2023-08-18 과거 데이터 726회) 기준 만기 손실 발생 비율은 3.86% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 8,492.42원 입니다 (액면 대비 -15.08%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 108,
     "annRate": 16,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 116,
     "annRate": 16,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 124,
     "annRate": 16,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 132,
     "annRate": 16,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 140,
     "annRate": 16,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 148,
     "annRate": 16,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 726,
    "loss": 3.86,
    "first": 58.68,
    "range": {
     "from": "2020-09-30",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008WE6",
   "productName": "미래에셋증권(ELS)38086e"
  },
  "38087": {
   "no": 38087,
   "name": "미래에셋증권 제38087회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38087회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38087회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "마이크론 테크놀로지, 팔란티어 테크",
    "underVol": "마이크론 테크놀로지 97.77%, 팔란티어 테크 67.06%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "25%",
    "coupon": "연 23%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(마이크론 테크놀로지, 팔란티어 테크) 중 어느 하나라도 종가기준으로 각 최초기준가격의 25% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2020-09-30~2023-08-18 과거 데이터 726회) 기준 만기 손실 발생 비율은 2.07% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 6,760.18원 입니다 (액면 대비 -32.4%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 111.5,
     "annRate": 23,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 123,
     "annRate": 23,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 134.5,
     "annRate": 23,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 146,
     "annRate": 23,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 157.5,
     "annRate": 23,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 169,
     "annRate": 23,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "25",
   "lizard": null,
   "sim": {
    "runs": 726,
    "loss": 2.07,
    "first": 65.7,
    "range": {
     "from": "2020-09-30",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008WF3",
   "productName": "미래에셋증권(ELS)38087e"
  },
  "38088": {
   "no": 38088,
   "name": "미래에셋증권 제38088회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38088회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38088회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "마이크론 테크놀로지, 브로드컴",
    "underVol": "마이크론 테크놀로지 97.77%, 브로드컴 57.93%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "30%",
    "coupon": "연 24.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(마이크론 테크놀로지, 브로드컴) 중 어느 하나라도 종가기준으로 각 최초기준가격의 30% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2009-08-06~2023-08-18 과거 데이터 3,533회) 기준 만기 손실 발생 비율은 0% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 7,463.69원 입니다 (액면 대비 -25.36%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 80,
     "payRate": 112.25,
     "annRate": 24.5,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 80,
     "payRate": 124.5,
     "annRate": 24.5,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 136.75,
     "annRate": 24.5,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 149,
     "annRate": 24.5,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 161.25,
     "annRate": 24.5,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 173.5,
     "annRate": 24.5,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "30",
   "lizard": null,
   "sim": {
    "runs": 3533,
    "loss": 0,
    "first": 79.62,
    "range": {
     "from": "2009-08-06",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008WG1",
   "productName": "미래에셋증권(ELS)38088e"
  },
  "38089": {
   "no": 38089,
   "name": "미래에셋증권 제38089회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
   "docUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260828000836",
   "rcpNo": "20260828000836",
   "docDate": "2026-08-28",
   "collectedAt": "2026-09-01T07:35:25.815Z",
   "fields": {
    "name": "미래에셋증권 제38089회 파생결합증권(주가연계증권)(매우높은위험,원금비보장)(상품위험등급:1등급)",
    "issuer": "미래에셋증권",
    "round": "제38089회",
    "kind": "ELS",
    "highDiff": "해당 (고난도 금융투자상품)",
    "riskGrade": "1",
    "riskLabel": "매우높은위험",
    "riskReason": "최대 원금손실가능금액 20% 초과형",
    "under": "테슬라, 마이크론 테크놀로지",
    "underVol": "테슬라 55.7%, 마이크론 테크놀로지 97.77%",
    "issueDate": "2026년 9월 10일",
    "matDate": "2029년 9월 10일",
    "matTerm": "3년",
    "fixMethod": "최초기준가격평가일의 각 기초자산 종가",
    "fixDate": "2026년 9월 10일",
    "knockIn": "35%",
    "coupon": "연 29.5%",
    "maxLoss": "100%",
    "lossExample": "만기평가일에 모든 기초자산(테슬라, 마이크론 테크놀로지) 중 어느 하나라도 종가기준으로 각 최초기준가격의 35% 미만으로 하락한 적이 있고, 만기평가가격이 각 최초기준가격의 70% 미만인 경우, 하락률이 가장 큰 기초자산의 하락률만큼 원금손실이 발생하며 최대 원금 전액(100%) 손실이 가능합니다.\n발행사 수익률 모의실험(2010-06-29~2023-08-18 과거 데이터 3,308회) 기준 만기 손실 발생 비율은 0.18% 입니다.",
    "midPriceDate": "중도상환 신청 시 적용되는 공정가액은 중도상환 신청일의 익거래소영업일 및 영업일 종가를 반영하여 결정됩니다. (기초자산에 非아시아 지역 거래자산 포함)",
    "midAmt6": "공정가액(기준가)의 90% 이상",
    "midAmtAfter": "공정가액(기준가)의 95% 이상",
    "subUnit": "최소 100,000원",
    "offerEnd": "2026년 9월 9일",
    "docDate": "2026년 8월 28일",
    "coolNote": "이 회차의 숙려기간은 2026년 9월 7일 ~ 2026년 9월 8일 이며, 가입의사 확인은 2026년 09월 09일 오후 5시까지 입니다. 숙려제도 대상(개인 일반투자자) 청약종료일은 2026년 9월 4일 로, 일반 청약종료일(2026년 9월 9일)보다 앞섭니다.",
    "fairValueNote": "2026년 8월 25일 기준 이 증권의 공정가격은 액면 10,000원 당 7,725.54원 입니다 (액면 대비 -22.74%). 중도상환 금액은 이 공정가액을 기초로 산정되므로 발행 직후 중도상환 시에도 원금손실이 발생할 수 있습니다."
   },
   "schedule": [
    {
     "seq": 1,
     "months": 6,
     "barrier": 75,
     "payRate": 114.75,
     "annRate": 29.5,
     "evalDate": "2027-03-05"
    },
    {
     "seq": 2,
     "months": 12,
     "barrier": 75,
     "payRate": 129.5,
     "annRate": 29.5,
     "evalDate": "2027-09-07"
    },
    {
     "seq": 3,
     "months": 18,
     "barrier": 75,
     "payRate": 144.25,
     "annRate": 29.5,
     "evalDate": "2028-03-07"
    },
    {
     "seq": 4,
     "months": 24,
     "barrier": 75,
     "payRate": 159,
     "annRate": 29.5,
     "evalDate": "2028-09-05"
    },
    {
     "seq": 5,
     "months": 30,
     "barrier": 70,
     "payRate": 173.75,
     "annRate": 29.5,
     "evalDate": "2029-03-06"
    },
    {
     "seq": 6,
     "months": 36,
     "barrier": 70,
     "payRate": 188.5,
     "annRate": 29.5,
     "evalDate": "2029-09-10",
     "maturity": true
    }
   ],
   "matBarrier": 70,
   "knockIn": "35",
   "lizard": null,
   "sim": {
    "runs": 3308,
    "loss": 0.18,
    "first": 78.87,
    "range": {
     "from": "2010-06-29",
     "to": "2023-08-18"
    }
   },
   "derivedFrom": {
    "months": "차수별 평가일과 발행일의 차이로 계산",
    "midPriceDate": "기초자산 소재지(아시아 / 非아시아)로 판정",
    "maturityRow": "만기 배리어·만기일을 표 마지막 행으로 추가"
   },
   "productCode": "KR6MD0008WH9",
   "productName": "미래에셋증권(ELS)38089e"
  }
 }
};
