/**
 * ELS 상품 데이터
 *
 * 이 파일은 scripts/collect_els.mjs 가 매주 자동 생성한다.
 * 수집에 실패하면 `source: "sample"` 인 아래 예시 데이터가 그대로 남고,
 * 페이지에는 "예시" 배지가 표시된다.
 *
 * 필드 정의는 README 의 "ELS 데이터 스키마" 절 참고.
 */
window.ELS_DATA = {
  "updatedAt": "2026-10-21T05:43:19.492Z",
  "checkedAt": "2026-10-21T05:43:19.492Z",
  "checkedCount": 34,
  "source": "live",
  "sourceNote": "미래에셋증권 홈페이지 ELS/DLS 캘린더 (청약 진행중)",
  "sourceNoteEn": "Mirae Asset Securities ELS/DLS calendar — currently on offer",
  "products": [
    {
      "code": "KR6MD00091V8",
      "name": "미래에셋증권(ELS)38202e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 23.5,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091P0",
      "name": "미래에셋증권(ELS)38197",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 20,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091N5",
      "name": "미래에셋증권(ELS)38196",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 17,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 75
        },
        {
          "months": 12,
          "barrier": 75
        },
        {
          "months": 18,
          "barrier": 75
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 65
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091T2",
      "name": "미래에셋증권(ELS)38201e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "팔란티어 테크",
        "테슬라"
      ],
      "couponRate": 17,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 75
        },
        {
          "months": 12,
          "barrier": 75
        },
        {
          "months": 18,
          "barrier": 75
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091S4",
      "name": "미래에셋증권(ELS)38200e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "테슬라"
      ],
      "couponRate": 15.3,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 65
        }
      ],
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091M7",
      "name": "미래에셋증권(ELS)38195",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 13,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 70
        },
        {
          "months": 12,
          "barrier": 70
        },
        {
          "months": 18,
          "barrier": 70
        },
        {
          "months": 24,
          "barrier": 70
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 65
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-70-70-65, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091R6",
      "name": "미래에셋증권(ELS)38199e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 13,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091L9",
      "name": "미래에셋증권(ELS)38194",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 12,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 65
        },
        {
          "months": 12,
          "barrier": 65
        },
        {
          "months": 18,
          "barrier": 65
        },
        {
          "months": 24,
          "barrier": 65
        },
        {
          "months": 30,
          "barrier": 65
        },
        {
          "months": 36,
          "barrier": 60
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "65-65-65-65-65-60, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091K1",
      "name": "미래에셋증권(ELS)38193",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "KOSPI200"
      ],
      "couponRate": 11.5,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091Q8",
      "name": "미래에셋증권(ELS)38198e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 10.7,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091J3",
      "name": "미래에셋증권(ELS)38192",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 10.5,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091H7",
      "name": "미래에셋증권(ELS)38191",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 10.1,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091G9",
      "name": "미래에셋증권(ELS)38190",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 9.7,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00091W6",
      "name": "미래에셋증권(ELB)4106",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 7.41,
      "rateBasis": "annual",
      "maxLossRate": 0,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 80
        },
        {
          "months": 12,
          "barrier": 80
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 80
        },
        {
          "months": 36,
          "barrier": 80
        }
      ],
      "knockIn": null,
      "principalProtection": 100,
      "riskGrade": 5,
      "riskLabel": "낮은위험",
      "riskCode": "15",
      "status": "청약 마지막날",
      "offerStart": "2026-10-12",
      "offerEnd": "2026-10-21",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-80-80(월지급배리어:75), KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092S2",
      "name": "미래에셋증권(ELS)38223",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 21,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-15",
      "offerEnd": "2026-10-22",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092Q6",
      "name": "미래에셋증권(ELS)38222",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 12.6,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-15",
      "offerEnd": "2026-10-22",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092M5",
      "name": "미래에셋증권(ELS)38220e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 20.5,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092G7",
      "name": "미래에셋증권(ELS)38215",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 18,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092N3",
      "name": "미래에셋증권(ELS)38221e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "어플라이드 머티어리얼즈",
        "AMD"
      ],
      "couponRate": 17.5,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 80
        },
        {
          "months": 12,
          "barrier": 80
        },
        {
          "months": 18,
          "barrier": 75
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70 , KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092L7",
      "name": "미래에셋증권(ELS)38219e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "팔란티어 테크",
        "테슬라"
      ],
      "couponRate": 17,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 75
        },
        {
          "months": 12,
          "barrier": 75
        },
        {
          "months": 18,
          "barrier": 75
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092F9",
      "name": "미래에셋증권(ELS)38214",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "S&P500",
        "SK하이닉스"
      ],
      "couponRate": 15.1,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 80
        },
        {
          "months": 12,
          "barrier": 80
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092K9",
      "name": "미래에셋증권(ELS)38218e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 13.5,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 80
        },
        {
          "months": 12,
          "barrier": 75
        },
        {
          "months": 18,
          "barrier": 75
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 65
        }
      ],
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75-75-75-70-65, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092E2",
      "name": "미래에셋증권(ELS)38213",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "삼성전자"
      ],
      "couponRate": 12.7,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092D4",
      "name": "미래에셋증권(ELS)38212",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 12.4,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092C6",
      "name": "미래에셋증권(ELS)38211",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 11,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092B8",
      "name": "미래에셋증권(ELS)38210",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 10.5,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092A0",
      "name": "미래에셋증권(ELS)38209",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 10.2,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009299",
      "name": "미래에셋증권(ELS)38208",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 10,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 90
        },
        {
          "months": 18,
          "barrier": 90
        },
        {
          "months": 24,
          "barrier": 85
        },
        {
          "months": 30,
          "barrier": 80
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-90-90-85-80-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009281",
      "name": "미래에셋증권(ELS)38207",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "KOSPI200"
      ],
      "couponRate": 9.4,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092J1",
      "name": "미래에셋증권(ELS)38217e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "S&P500"
      ],
      "couponRate": 9.2,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009273",
      "name": "미래에셋증권(ELS)38206",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "S&P500"
      ],
      "couponRate": 9,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092H5",
      "name": "미래에셋증권(ELS)38216e",
      "type": "ELS",
      "shape": "슈퍼리자드",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 9,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 85,
          "lizard": 65,
          "lizardRate": 9
        },
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 65
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90(75)-85(65)-80-75-70-65, KI 45, 원화, 리자드 조건 충족 시 연 9%",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009265",
      "name": "미래에셋증권(ELS)38205",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 8.5,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092P8",
      "name": "미래에셋증권(ELB)4107",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 7.2,
      "rateBasis": "annual",
      "maxLossRate": 0,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 85
        },
        {
          "months": 30,
          "barrier": 85
        },
        {
          "months": 36,
          "barrier": 85
        }
      ],
      "knockIn": null,
      "principalProtection": 100,
      "riskGrade": 5,
      "riskLabel": "낮은위험",
      "riskCode": "15",
      "status": "진행중",
      "offerStart": "2026-10-19",
      "offerEnd": "2026-10-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85(월지급배리어:75), 원금지급형, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    }
  ],
  "history": {"updatedAt":"2026-10-21T05:43:21.447Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827,20260828,20260831,20260901,20260902,20260903,20260904,20260907,20260908,20260909,20260910,20260911,20260914,20260915,20260916,20260917,20260918,20260921,20260922,20260923,20260924,20260925,20260928,20260929,20260930,20261001,20261002,20261005,20261006,20261007,20261008,20261009,20261012,20261013,20261014,20261015,20261016,20261019,20261020,20261021],"series":{"AMD":[null,100,107.52,115.03,111.81,109.05,110.43,110.89,108.74,103.68,102.76,100.61,106.75,107.36,106.44,96.63,102.61,104.14,106.9,117.64,129.75,133.59,137.12,133.28,134.97,134.97,134.51,135.43,136.96,136.66,128.68,130.83,133.13,144.94,146.63,158.59,158.59,163.8,161.66,161.81,166.56,163.5,167.94,176.53,175.92,177.91,177.61,177.61,185.12,177.15,177.76,173.93,173.93,175.31,175.31,172.39,173.62,176.23,175.46,171.78,165.03,162.27,162.27,150.61,151.53,149.85,149.54,151.99,160.12,158.74,161.35,163.65,162.73,159.05,184.97,188.34,187.73,209.05,203.83,207.98,205.83,208.28,206.9,203.37,203.99,198.93,201.38,201.38,214.72,219.02,219.63,216.56,233.13,221.78,229.45,213.19,199.85,200,200.15,202.76,204.45,213.34,219.02,216.26,214.42,209.36,206.9,220.86,211.96,216.26,211.5,210.12,210.12,209.97,210.28,215.49,223.16,224.54,217.18,217.33,203.53,207.36,200.92,200.92,195.71,188.8,188.8,196.17,198.62,196.93,201.07,199.39,201.38,206.9,205.67,208.9,203.99,208.9,158.28,159.36,154.91,156.29,153.99,156.13,165.49,169.79,172.7,175.15,195.55,171.78,173.01,175,169.33,167.02,167.02,168.4,168.71,168.71,170.55,171.63,167.64,167.18,172.39,184.51,189.88,197.85,188.34,185.43,183.44,180.52,176.38,175.46,182.98,193.87,214.42,220.55,217.33,215.95,205.52,202.91,193.25,191.41,186.35,186.35,202.3,199.69,204.91,211.81,213.04,219.17,207.52,213.5,211.66,206.75,207.82,211.66,212.88,217.18,216.41,226.38,216.56,213.96,208.74,210.28,205.06,203.07,201.23,205.98,201.07,196.78,185.89,187.58,195.71,199.69,193.71,189.26,189.72,184.82,186.66,191.41,191.72,190.64,187.58,186.35,194.33,199.39,202.3,202.3,198.16,197.24,193.71,187.88,192.48,188.65,187.42,188.04,192.02,200.61,201.23,210.74,205.67,203.99,193.4,190.95,195.4,195.4,195.55,194.94,205.83,204.14,204.6,202.91,206.6,210.12,212.88,217.79,218.1,218.71,217.18,215.8,213.96,211.81,216.26,218.56,189.11,184.2,181.6,167.02,168.56,165.64,166.41,170.55,182.98,184.82,179.6,170.55,172.7,170.09,170.55,169.79,172.55,174.54,173.93,174.85,174.39,174.39,174.54,177.15,171.32,166.1,167.02,164.57,153.83,151.99,153.37,153.99,152.45,155.83,151.84,155.06,155.37,157.82,168.4,167.94,168.4,167.02,161.66,161.66,160.43,161.5,161.81,157.67,168.4,177.15,185.89,182.21,188.34,181.29,183.44,186.2,184.36,184.36,182.67,186.81,191.26,193.1,194.02,198.47,194.94,190.34,198.62,204.29,197.39,210.74,203.22,190.95,177.45,178.68,177.91,172.09,173.47,179.14,180.67,187.12,186.96,181.29,181.29,184.36,179.75,181.6,185.12,190.49,192.18,185.74,182.52,181.13,182.67,180.37,187.73,183.59,179.45,176.69,178.53,174.23,175.77,175.92,175.31,170.4,172.7,167.33,163.04,160.12,153.37,150.46,154.14,154.14,146.17,146.47,149.85,153.68,147.39,146.17,153.07,150.61,154.6,152.3,154.75,161.35,158.9,155.06,153.22,153.99,154.75,148.93,169.33,170.4,166.87,170.71,168.25,167.64,173.01,177.76,178.07,183.28,186.04,183.28,187.58,190.95,196.63,196.63,199.39,199.23,199.08,200.92,205.67,207.67,207.67,204.91,211.96,210.58,220.86,227.76,227.76,240.34,228.37,233.9,241.26,243.1,250.31,249.23,250.61,262.42,255.98,253.37,240.03,242.33,231.75,237.73,229.6,234.82,229.91,232.52,230.06,230.06,237.73,250.92,254.75,253.83,249.54,253.99,249.54,254.29,258.74,258.44,256.29,253.07,255.52,248.31,246.17,281.44,290.49,297.85,281.13,283.44,288.19,283.59,298.01,300,300.31,292.94,292.33,302.61,307.06,302.15,296.47,303.22,306.44,312.88,320.55,341.87,367.79,387.42,384.2,386.5,381.75,386.04,386.04,430.37,437.27,426.99,419.94,458.44,461.66,494.02,467.48,501.84,497.39,489.72,478.68,478.22,475.77,500.15,499.54,493.71,499.85,473.77,481.9,445.09,436.04,426.07,419.48,405.83,417.79,383.44,388.04,403.99,402.76,432.21,418.71,408.28,362.88,383.9,384.82,349.54,295.55,270.4,258.44,263.8,279.29,310.12,310.28,305.21,317.18,334.97,325.15,322.55,291.87,300.77,319.17,329.6,316.87,293.1,294.63,287.27,287.27,297.24,307.98,322.85,327.3,328.68,326.69,363.65,323.93,323.93,326.69,298.47,306.6,306.44,314.11,304.6,305.21,288.8,299.08,278.53,275.15,259.66,255.37,255.37,274.54,268.25,273.31,283.13,288.8,261.5,291.41,315.49,318.25,309.66,302.76,310.89,310.28,312.58,302.61,310.58,318.56,318.56,303.07,303.68,319.79,336.35,309.51,295.25,354.14,374.39,375.92,370.09,357.52,356.75,347.7,353.53,352.15,350,350.46,354.75,363.19,363.19,367.33,367.33,366.87,373.62,378.99,371.32,360.12,360.89,363.19,358.44,360.43,343.71,338.65,337.58,352.15,360.28,358.59,350,357.21,356.6,398.77,394.17,427.76,404.45,398.31,394.02,381.75,384.36,391.41,404.29,410.28,445.09,446.17,444.48,437.58,417.79,426.84,426.23,427.15,419.17,428.37,421.63,424.54,424.54,432.21,428.99,436.5,424.23,427.61,424.69,423.77,411.2,433.9,432.82,420.55,408.9,415.49,417.33,428.83,402.45,419.02,423.01,429.6,421.78,409.2,419.48,420.4,404.29,405.52,405.52,445.55,430.83,429.91,420.4,423.01,453.53,452.45,488.04,497.09,509.66,497.09,493.56,481.44,465.64,447.85,467.02,467.79,460.28,446.32,448.77,442.64,458.9,471.47,465.8,478.53,479.14,478.37,478.37,483.13,491.41,508.44,518.25,507.06,509.36,527.45,519.17,515.34,506.13,498.62,503.83,513.65,523.16,516.41,521.78,513.5,519.48,467.02,457.98,451.53,429.29,442.64,447.7,520.25,524.39,497.39,492.48,463.8,455.06,478.22,482.82,471.17,486.2,489.26,453.07,464.42,463.19,472.09,482.36,482.36,482.36,473.93,474.69,483.13,468.71,467.79,463.65,456.44,463.34,470.71,472.85,475.31,466.56,464.57,460.89,469.94,452.76,453.07,451.99,440.49,444.63,441.1,434.2,439.88,444.94,443.71,432.98,436.5,435.28,456.29,468.25,471.17,472.55,477.61,475,491.26,483.28,480.98,486.5,501.69,516.72,506.6,508.13,520.4,535.12,556.6,554.45,551.07,556.44,556.6,556.9,563.04,575.46,588.19,591.41,611.66,633.28,628.53,606.13,600.46,610.28,598.01,604.45,604.45,600.46,594.02,596.63,608.74,607.67,607.82,597.09,604.91,605.37,653.22,631.13,649.54,655.98,648.77,656.9,677.15,697.24,713.8,713.8,715.18,708.28,698.16,703.37,753.07,745.4,742.18,740.03,733.59,751.07,738.8,747.7,739.42,744.63,763.34,781.13,781.13,782.98,788.8,793.1,772.24,755.52,775,728.68,748.16,720.86,736.5,758.44,764.42,756.44,762.73,801.53,825.15,826.53,836.35,848.31,848.31,872.55,903.37,878.37,817.18,753.37,729.6,728.37,675,697.55,727.91,717.02,768.56,737.88,745.25,663.65,696.01,700.92,598.31,673.31,593.71,642.33,600,610.74,607.52,638.65,708.9,684.51,728.53,714.42,734.05,697.55,669.63,682.36,653.22,728.83,729.45,748.31,742.02,742.02,781.29,842.48,843.4,873.47,868.1,873.77,811.66,857.67,857.36,861.66,866.41,851.38,823.01,803.53,765.03,806.13,800.46,800,796.78,815.8,854.91,824.54,800.31,836.04,831.29,837.27,850.77,864.88,838.19,846.17,846.17,815.8,808.9,793.56,825.15,822.55,821.17,808.74,807.21,814.42,812.42,864.88,880.98,810.28,820.55,838.65,835.28,836.66,828.83,831.75,839.88,828.07,803.53,796.47,768.4,771.17,806.9,806.44,802.76,802.76,819.02,811.81,819.48,878.22,857.06,821.93,839.26,848.77,842.33,844.17,881.29,874.23,947.7,913.65,1064.42,1057.82,1036.96,1167.02,1199.39,1187.58,1191.26,1304.29,1308.44,1329.91,1301.38,1261.35,1179.14,1267.02,1255.21,1246.93,1264.11,1252.45,1243.71,1269.48,1285.43,1274.23,1324.39,1319.33,1285.28,1312.12,1392.94,1413.8,1383.74,1265.95,1257.82,1257.82,1206.9,1256.29,1211.35,1170.86,1194.79,1210.58,1175.77,1174.08,1149.23,1195.4,1191.72,1146.17,1162.88,1197.24,1219.02,1254.14,1257.52,1301.53,1254.6,1321.32,1295.71,1329.6,1326.84,1274.54,1292.79,1307.98,1291.56,1275,1275.61,1257.67,1250.92,1214.72,1218.1,1257.06,1261.2,1209.82,1171.78,1196.63,1154.75,1145.71,1174.54,1247.7,1273.01,1317.18,1274.85,1196.17,1246.63,1255.21,1248.93,1284.2,1278.53,1265.95,1311.96,1298.16,1308.44,1304.75,1329.91,1329.91,1337.27,1421.17,1420.71,1437.73,1415.8,1442.33,1442.79,1425.15,1377.76,1405.83,1405.67,1453.68,1489.57,1485.43,1485.28,1471.17,1429.91,1428.83,1404.14,1408.13,1408.13,1404.91,1389.88,1415.49,1406.6,1415.64,1422.85,1385.43,1459.51,1450.61,1491.56,1462.58,1407.67,1392.48,1352.91,1352.91,1371.93,1361.2,1403.83,1423.16,1443.71,1452.61,1362.58,1342.33,1313.5,1344.48,1362.88,1348.01,1347.24,1348.16,1402.91,1394.33,1416.41,1421.17,1438.19,1438.19,1402.76,1379.45,1359.51,1373.93,1309.36,1299.69,1333.44,1264.11,1296.17,1325,1290.34,1240.18,1192.48,1204.29,1134.36,1204.45,1188.96,1245.86,1243.1,1265.34,1269.17,1267.33,1198.16,1212.58,1231.6,1202.15,1173.01,1169.02,1187.27,1183.13,1165.64,1203.99,1243.71,1243.71,1248.93,1249.08,1260.74,1278.37,1269.33,1205.21,1229.91,1204.75,1273.16,1259.97,1244.02,1215.8,1251.69,1212.58,1269.33,1309.97,1306.9,1288.65,1286.96,1251.84,1204.75,1205.67,1193.71,1194.63,1208.74,1165.49,1178.37,1144.79,1121.01,1144.02,1144.94,1141.72,1169.17,1197.24,1183.59,1187.73,1194.17,1201.53,1202.76,1228.22,1228.22,1239.42,1257.21,1231.29,1251.23,1247.7,1240.64,1226.38,1250.92,1247.09,1250.77,1234.2,1228.68,1296.93,1298.31,1266.72,1281.9,1285.58,1320.55,1313.19,1335.58,1373.01,1440.64,1431.13,1452.45,1452.45,1448.93,1388.65,1376.38,1394.17,1392.79,1384.36,1365.8,1333.28,1317.33,1327.91,1336.04,1371.32,1398.93,1413.34,1408.28,1396.17,1501.99,1578.99,1628.68,1666.1,1726.38,1821.63,1723.16,1688.8,1650,1633.13,1651.53,1633.44,1695.55,1648.47,1649.69,1586.5,1590.49,1605.06,1668.25,1651.07,1661.04,1645.25,1708.59,1707.36,1698.16,1686.96,1674.85,1685.89,1685.89,1674.08,1628.37,1628.07,1613.5,1607.36,1621.63,1619.63,1629.14,1593.25,1557.52,1576.99,1600.92,1628.07,1622.7,1658.9,1557.06,1539.11,1578.22,1571.32,1538.96,1561.5,1589.57,1632.67,1611.35,1605.52,1611.04,1674.23,1717.64,1719.63,1785.74,1784.2,1785.12,1830.21,1837.73,1876.69,1885.43,1875.46,1858.28,1844.02,1920.71,1957.52,2001.99,2108.9,2091.1,2303.07,2284.05,2145.25,2239.42,2268.25,2246.78,2338.19,2321.17,2377.61,2383.59,2339.26,2299.39,2420.25,2420.25,2374.39,2483.28,2428.99,2286.96,2311.04,2208.74,2132.82,2221.63,2227.61,2118.1,2125,2052.15,2079.75,2246.93,2126.38,2112.73,2082.82,2212.42,2206.75,2241.41,2241.41,2367.48,2348.93,2273.93,2226.23,2207.06,2304.29,2215.03,2088.19,2089.42,2024.54,2024.54,2105.98,2108.44,2035.89,2099.39,2099.39,2023.47,1967.33,1869.48,1822.24,1787.27,1704.45,1698.01,1573.62,1614.11,1752.3,1791.1,1882.82,1841.72,1895.71,1896.78,1966.72,2037.58,1928.99,1735.89,1752.61,1863.04,1805.06,1723.47,1745.86,1745.86,1773.77,1683.44,1788.5,1856.75,1891.72,1745.86,1814.11,1717.48,1662.73,1578.99,1618.56,1703.22,1632.82,1599.54,1568.25,1676.84,1769.48,1713.04,1740.18,1777.91,1760.43,1747.24,1848.62,1835.43,1844.17,1890.03,1828.53,1676.99,1659.36,1695.25,1638.34,1590.03,1590.8,1549.08,1493.4,1458.59,1499.08,1427.3,1427.3,1440.03,1486.66,1442.02,1378.07,1351.84,1390.95,1306.14,1302.3,1374.85,1311.66,1377.91,1397.7,1524.85,1439.72,1462.27,1324.54,1360.89,1348.47,1335.28,1458.9,1445.4,1571.63,1476.69,1482.67,1434.05,1458.13,1398.16,1421.01,1514.57,1568.4,1568.4,1562.27,1552.45,1665.49,1630.37,1620.4,1614.72,1562.88,1515.34,1454.29,1334.2,1334.2,1369.63,1258.44,1251.07,1251.07,1285.12,1284.51,1264.26,1335.58,1321.47,1238.96,1196.17,1172.85,1129.91,1129.91,1153.37,1155.67,1216.26,1217.02,1180.21,1171.17,1188.96,1205.52,1244.02,1248.93,1317.18,1371.63,1397.09,1351.23,1342.64,1307.52,1377.61,1405.98,1448.93,1484.36,1522.85,1504.45,1593.71,1569.17,1534.82,1465.34,1519.17,1504.91,1546.47,1549.23,1536.81,1507.21,1540.49,1471.63,1423.93,1418.56,1422.24,1490.49,1398.47,1357.21,1333.44,1301.69,1262.73,1230.67,1230.67,1207.36,1221.01,1269.63,1310.58,1298.16,1181.44,1187.88,1175.77,1173.47,1177.45,1154.14,1142.33,1065.95,1042.33,1016.87,1030.21,1048.47,983.74,971.78,1013.96,1041.41,1042.02,1040.64,896.32,886.66,883.9,887.27,903.99,857.98,888.96,888.34,877.76,886.04,902.15,900.31,942.79,916.1,898.77,951.07,921.17,915.03,899.23,921.93,953.83,967.48,979.29,919.02,1050.15,1109.97,1127.76,1171.32,1115.03,1133.44,1128.37,1111.35,1154.14,1171.78,1171.78,1152.45,1122.55,1125.61,1190.64,1188.34,1150,1129.14,1077.76,1075.77,1080.83,1051.99,1083.9,1098.93,1057.21,1020.4,1003.22,990.64,997.7,1038.04,979.45,989.57,989.57,970.4,959.66,994.17,993.4,993.4,981.9,991.72,955.98,980.98,1031.29,1043.71,1059.2,1085.89,1088.96,1088.96,1098.01,1081.75,1038.5,1074.69,1173.77,1145.71,1148.93,1152.76,1156.44,1111.2,1152.61,1298.16,1354.45,1320.4,1283.44,1317.64,1298.93,1276.23,1249.69,1275,1318.25,1306.44,1228.22,1203.99,1203.99,1177.45,1175,1223.16,1197.7,1208.13,1205.21,1200.77,1233.74,1250.31,1244.79,1259.36,1309.36,1288.8,1267.94,1257.82,1341.26,1375.46,1481.6,1500.61,1484.82,1471.32,1496.63,1538.04,1502.3,1481.75,1450.31,1473.77,1501.23,1503.22,1480.98,1470.4,1419.63,1418.25,1418.25,1464.42,1442.18,1416.1,1412.42,1407.21,1378.37,1376.99,1379.45,1382.06,1356.29,1343.1,1285.28,1318.1,1341.1,1370.71,1375.61,1378.99,1251.84,1328.37,1377.91,1457.67,1457.98,1488.04,1489.26,1461.04,1493.87,1556.44,1591.26,1655.37,1623.01,1656.44,1658.28,1660.58,1845.86,1948.31,1948.31,1921.32,1813.04,1832.36,1807.67,1808.74,1905.37,1807.21,1856.6,1915.95,1981.44,1909.97,1952.91,1905.52,1841.72,1841.72,1824.08,1719.48,1697.85,1687.27,1648.93,1693.1,1689.72,1706.13,1747.09,1776.38,1776.38,1747.7,1740.49,1735.74,1742.02,1707.36,1757.36,1777.91,1778.22,1814.72,1808.74,1785.74,1690.95,1701.69,1696.47,1733.13,1688.5,1703.99,1732.52,1754.6,1803.68,1677.15,1735.43,1776.38,1791.56,1736.66,1694.33,1690.64,1649.85,1717.48,1707.82,1644.02,1601.84,1617.33,1659.82,1620.55,1678.37,1561.35,1568.25,1573.77,1624.54,1634.82,1621.47,1678.68,1678.68,1699.08,1676.07,1634.82,1627.15,1615.34,1615.18,1651.99,1635.43,1556.6,1570.09,1558.44,1538.96,1474.08,1475.46,1493.56,1471.78,1504.14,1576.07,1576.99,1583.9,1534.97,1596.17,1578.37,1644.79,1640.64,1671.93,1661.2,1668.56,1611.81,1632.82,1612.58,1567.02,1570.55,1561.5,1533.9,1559.36,1473.31,1436.66,1478.99,1475.15,1510.74,1657.06,1653.83,1721.63,1713.96,1740.03,1742.18,1740.64,1818.86,1791.26,1838.65,1809.82,1837.88,1850,1863.96,1827.61,1878.99,1878.99,1875.92,1881.13,1871.32,1899.54,1858.28,1861.81,1818.56,1815.64,1791.72,1968.86,1977.3,2061.5,2110.58,2119.48,2116.56,2134.2,2130.37,2149.54,2077.76,2145.86,2141.1,2141.1,2199.54,2240.34,2281.6,2260.89,2125.46,2075.46,2086.04,2125.46,2242.02,2289.26,2278.22,2270.25,2247.85,2247.85,2434.66,2456.6,2494.94,2672.24,2579.45,2583.13,2734.51,2765.8,2718.56,2727.45,2638.96,2571.93,2614.72,2724.85,2672.24,2574.85,2621.78,2597.39,2645.4,2636.66,2630.98,2740.8,2711.04,2666.72,2666.72,2541.26,2519.79,2789.26,2707.36,2699.54,2730.06,2707.67,2952.91,3107.98,3149.69,3146.17,3230.52,3242.02,3180.83,3042.79,3109.82,2987.58,2869.02,2930.37,2924.08,2782.52,2756.6,2740.49,2755.37,2739.72,2728.07,2754.45,2768.25,2768.25,2811.96,2740.8,2772.55,2543.4,2613.8,2605.83,2619.33,2563.5,2615.03,2504.29,2458.9,2507.06,2362.27,2378.53,2249.08,2279.75,2335.43,2327.3,2358.28,2414.11,2457.06,2429.14,2212.73,2241.72,2309.82,2389.26,2368.56,2356.13,2337.27,2330.06,2309.2,2349.08,2448.93,2494.17,2522.55,2551.07,2525.46,2538.65,2460.58,2551.53,2551.53,2632.06,2532.82,2557.52,2559.82,2508.44,2453.83,2548.62,2557.98,2574.69,2459.2,2438.04,2457.67,2452.45,2448.31,2429.45,2371.63,2371.63,2481.29,2472.85,2457.82,2457.82,2416.26,2445.86,2487.88,2418.56,2520.09,2513.8,2513.8,2636.5,2740.64,2716.26,2821.47,2790.49,2785.43,2758.13,2723.16,2445.25,2389.11,2324.85,2390.64,2361.96,2218.25,2121.47,2147.09,2143.4,2123.31,2215.95,2032.82,2032.21,2067.79,1996.63,1973.47,2090.8,2059.36,2097.7,2164.57,2158.74,2260.12,2278.53,2381.6,2398.77,2420.4,2326.69,2376.99,2300.46,2308.28,2244.79,2231.44,2278.53,2278.53,2100.31,2160.58,2138.65,2060.58,2118.86,2190.8,2298.47,2312.42,2336.04,2332.52,2313.19,2274.39,2403.99,2391.87,2404.14,2428.22,2484.97,2568.87,2520.71,2516.56,2450.15,2450.61,2497.7,2621.17,2622.24,2650.31,2623.01,2518.1,2575,2534.82,2402.45,2394.63,2396.47,2392.18,2421.78,2363.34,2345.25,2353.37,2396.17,2452.76,2549.85,2279.14,2209.66,2175.77,2158.13,2172.7,2225.46,2297.85,2269.17,2259.97,2202.91,2136.5,2129.45,2069.02,2130.83,2137.88,2110.43,2108.74,2121.93,2164.57,2112.27,2089.57,2089.57,2103.99,2178.83,2177.61,2208.44,2168.1,2125.61,2007.21,1959.2,1996.17,2003.07,1946.47,1943.1,1917.48,1862.12,1823.31,1828.37,1911.04,1936.96,1936.96,1918.1,1920.09,1877.91,1852.61,1850.15,1922.85,1986.96,1952.91,1868.71,1868.71,1779.75,1799.39,1780.52,1839.88,1816.56,1862.88,1862.88,1875.46,1898.01,1887.12,1884.05,1763.96,1751.07,1799.85,1823.01,1778.37,1752.61,1832.82,1717.94,1689.57,1649.69,1694.48,1703.99,1713.5,1714.88,1734.66,1734.66,1752.76,1759.05,1751.07,1700,1658.13,1594.48,1606.44,1526.23,1531.6,1506.6,1545.25,1559.36,1516.1,1538.5,1482.06,1484.05,1545.86,1504.75,1548.62,1604.14,1587.58,1629.29,1643.25,1632.52,1746.17,1760.89,1690.03,1635.74,1583.13,1575.77,1576.38,1579.14,1438.65,1315.34,1282.82,1199.54,1485.28,1360.43,1432.52,1449.39,1461.5,1354.14,1342.02,1342.02,1312.27,1323.01,1386.35,1448.93,1482.36,1478.37,1473.31,1493.1,1482.36,1515.34,1542.79,1512.58,1539.26,1559.82,1577.3,1658.28,1724.85,1805.52,1763.65,1797.09,1759.82,1740.95,1718.71,1698.01,1691.87,1691.87,1757.06,1730.98,1733.59,1698.31,1758.13,1799.23,1818.71,1774.39,1782.06,1867.02,1890.18,1857.98,1817.48,1781.6,1938.5,1949.39,1944.63,1944.63,1966.87,1987.42,2123.16,2199.39,2203.68,2205.67,2176.38,2087.58,2124.54,2115.18,2115.18,2067.48,2113.8,2122.85,2211.04,2245.71,2242.94,2386.66,2455.21,2460.28,2407.82,2407.98,2373.01,2433.28,2486.5,2553.22,2663.5,2721.47,2753.22,2704.14,2633.44,2711.35,2673.47,2501.84,2644.17,2649.69,2642.33,2683.28,2828.53,2775.31,2722.55,2701.53,2554.45,2533.74,2510.89,2573.01,2505.52,2555.52,2563.34,2585.58,2494.33,2494.33,2489.57,2486.66,2481.44,2318.1,2322.24,2389.88,2446.93,2387.58,2432.06,2471.78,2461.04,2441.1,2422.09,2413.96,2450.77,2467.79,2467.48,2473.47,2445.71,2474.85,2481.44,2515.49,2603.22,2525.61,3124.39,3244.02,3612.88,3571.93,3296.01,3319.33,3344.94,3659.51,3597.55,3574.85,3689.57,3650.77,3531.13,3604.14,3879.14,3982.67,3957.21,4054.14,3908.59,3928.22,3982.36,3835.12,3931.44,3645.71,3581.9,3742.02,3642.94,3970.71,3803.07,3785.43,3688.96,3532.06,3428.68,3159.82,3125.46,3298.31,3161.5,3285.89,3285.89,3336.35,3370.55,3301.23,3337.42,3312.58,3343.1,3391.26,3399.08,3396.01,3396.17,3232.82,3183.74,3208.13,3038.5,3083.74,3273.47,3296.78,3296.01,3298.16,3298.16,3297.39,3306.9,3302.76,3284.66,3427.45,3390.8,3287.58,3221.17,3139.26,3116.1,3185.43,3389.11,3429.45,3495.71,3555.67,3555.67,3557.06,3831.29,3891.56,3982.82,3854.45,3865.49,3876.38,3867.79,3630.83,3777.15,3713.34,3070.4,2952.45,3196.93,3312.88,3275.61,3275.77,3158.59,3179.75,3179.75,3114.72,3069.33,3119.17,3069.79,3015.34,3279.75,3234.05,3123.93,3070.71,3046.32,2928.68,3099.23,3059.05,2951.38,3108.59,3117.02,3141.56,3032.82,2966.1,3015.03,3010.89,3059.2,3148.31,3087.88,3108.59,3149.85,3378.37,3125.31,3098.01,3006.75,3120.09,3224.08,3335.89,3335.89,3376.99,3397.7,3555.52,3629.45,3758.28,3785.74,3912.12,3958.9,4267.79,4269.79,4217.02,4363.34,4654.29,4682.98,5334.51,5132.36,4957.21,5170.4,5436.96,5529.75,5238.34,5448.77,6463.04,6264.72,6981.44,7036.66,6875.61,6832.82,6897.24,6504.6,6456.9,6350.46,6864.72,6895.55,7170.4,7170.4,7728.37,7600.31,7946.17,7915.64,7824.08,7999.08,8320.86,8024.54,7153.07,7520.4,7293.1,6938.65,7491.56,7846.17,8393.56,7780.52,7860.12,8241.87,8241.87,8460.58,7973.16,7971.47,8168.25,7999.69,8274.39,8909.66,8295.71,7942.02,7942.02,8467.02,7915.8,7935.74,8385.28,8556.6,8196.17,8406.9,8115.64,7683.13,7603.68,7723.47,8350.15,8471.32,8277.45,8005.37,7591.26,6972.7,6588.34,7444.63,7302.91,7433.13,7953.68,7393.4,7504.29,7413.5,7201.84,7274.85,7406.9,7408.13,7889.42,7760.74,7429.29,7153.68,7200.31,7258.44,7005.37,7349.39,7376.23,7310.89,7140.8,7219.63,7049.23,7010.12,6996.32,7324.69,7324.69,7756.75,7992.33,7723.93,7916.1,7567.64,7733.13,7860.43,8360.28,8586.2,9440.49,9567.02,9426.53,9651.23,9672.24,9323.16,9318.56,9382.82,9443.71,9722.55,9689.42,9960.43,9905.83,9519.63,9326.69,9114.11,9287.27,8754.91,8623.16,8109.66,8252.3,8201.53,8201.53],"EuroStoxx50":[100,100.03,100.56,100.35,100.14,100.28,100.08,99.31,98.26,96.86,96.65,96.03,97.81,98.27,99.34,99.02,98.49,98.8,99.13,98.37,98.87,98.19,98.58,98.95,98.55,98.83,99.08,98.06,98.76,99.19,98.52,98,99.22,100.78,102.13,103.55,103.93,103.98,105.2,104.39,105.63,105.94,105.89,106.59,106.31,106.27,106.41,106.41,106.56,106.57,106.34,106.95,106.95,107.75,107.83,107.8,107.95,107.55,107.46,107.52,106.83,108.05,107.08,106.77,107.07,106.95,107.24,106.38,106.66,108.11,107.88,107.37,106.05,105.01,105.92,105.75,106.39,105.26,105.17,105.25,106.54,106.31,107.43,107.55,108.03,107.62,107.55,107.66,108.54,108.54,108.36,107.39,107.56,107.9,110.19,110.01,110.62,110.1,110.03,110.17,110.83,111.04,111.01,110.49,110.81,111.81,112.08,111.73,111.47,111.18,112.21,111.95,111.72,112.63,112.96,113.16,113.79,112.88,113.16,112.87,113.42,113.62,113.13,112.79,112.74,112.08,112.08,112.08,110.83,111.19,111.81,111.82,116.28,116.46,116.32,115.82,115.7,115.7,116.3,116.56,117.92,118.92,118.38,118.61,118.5,117.78,118.23,118.37,118.37,116.52,115.78,116.59,116.25,116.85,116.58,116.58,116.33,116.33,115.75,115.54,115.94,116.75,116.75,115.52,115.35,115.84,116.56,115.19,115.64,115.29,114.59,115.19,116.35,115.73,115.53,115.57,115.18,115.77,115.01,114.92,112.83,111.87,113.49,113.09,113.06,112.53,112.59,113.05,112.61,114.26,114.67,114.6,114.29,113.07,113.77,113.74,112.19,112.24,112.9,113.47,113.54,112.71,112.11,112.11,112.44,112.67,114,113.95,114.27,112.74,111.6,110.72,112.16,112.52,113.26,112.52,112.01,111.28,112.32,111.77,111.96,111.76,111.19,110.13,110.63,111.21,111.94,111.5,111.19,111.61,112.06,112.06,113.6,114.17,114.51,114.62,114.27,114.63,114.77,114.59,115.05,115.11,114.99,114.94,115.55,115.83,116.84,117.1,117.2,116.85,117.45,117.12,117.35,116.97,117.25,117.19,117.16,117.21,117.26,117.65,117.08,117.18,117.3,117.36,116.73,118.22,118.71,119.03,119.41,120.18,119.9,119.94,119.69,118.92,118.8,117.42,116.81,116.18,115.59,115.25,115.87,115.3,115.76,116.34,115.8,116.1,116.4,115.84,116.47,116.68,116.03,114.66,116.24,116.05,115.76,116.14,116.73,116.43,117.02,116.42,115.59,115.73,117.32,116.43,115.47,116.06,115.5,115.5,115.5,115.39,114.55,113.89,113.89,114.08,116,117.26,117.55,117.75,117.33,116.86,117.42,117.4,117.73,117.43,117.69,118.61,119.13,119.36,118.42,117.99,118.55,118.41,117.23,117.31,116.27,114.52,113.07,110.35,112.28,109.77,108.1,109.48,108.59,109.53,110.17,111.38,110.76,111.65,111.49,111.55,111.86,112.56,112.4,111.78,110.48,108.06,109.06,109.14,109.77,110.94,111.18,111.47,110.42,110.22,110.97,111.73,110.34,110.9,110.54,108.83,107.2,106.57,107.81,108.28,109.26,109.26,109.26,108.79,108.57,111.48,110.77,110.99,111.77,111.15,111.94,112.07,111.84,113.04,113.46,113.33,113.57,114.19,114.11,113.3,113.96,114.37,114.95,114.95,115.51,114.71,115.41,115.85,115.64,116.03,116.03,115.89,115.9,115.85,115.8,116.76,116.16,116.16,116.6,115.12,114.47,114.26,113.2,111.43,111.85,110.73,112.25,112.77,112.36,112.49,112.45,112.05,113.12,112.97,113.1,114.64,113.92,112.68,111.66,111.8,110.62,111.86,109.51,109.49,110.42,109.39,110.37,109.61,110.72,110.9,111.84,112.09,112.48,112.89,111.24,111.99,112.28,112.11,112.38,113.28,112.84,112.46,112.27,113.22,112.74,114.06,114.64,114.16,114.59,114.59,112.76,113.19,113.22,113.9,113.55,113.57,111.36,110.83,110.82,109.18,109.78,109.63,110.3,110.89,111.17,111.14,111.4,112.33,112.06,112.33,111.52,110.28,110.35,109.19,107.77,107.13,107.04,107.56,107.64,108.12,108.35,108.71,108.76,109.16,109.49,110.61,111.51,110.85,111.15,111.59,112.13,110.48,110.97,110.15,110.69,109.7,108.74,107.58,107.97,106.18,104.31,103.83,104.35,105.87,105.41,104.39,104.36,103.69,102.09,101.75,102.85,101.89,102.54,102.29,103.93,104.15,104.48,104.57,104.25,105.51,105.23,104.97,103.82,104.82,104.18,103.69,103.38,102.72,101.28,102.51,101.63,101.97,103.12,102.92,102.98,103.17,103.14,104.5,103.66,102.39,99,99.41,98.06,99.31,101.02,101.16,100.52,99.58,98.81,99.18,97.51,97.53,97.53,97.53,97.53,95.47,97.07,97.07,97.07,96.04,98.87,98.6,99.3,99.79,99.97,99.79,99.3,99.72,100.02,99.76,101.89,101.57,101.18,101.15,101.61,102.82,101.97,102.5,102.77,102.69,103.07,102.88,104.5,104.42,102.41,101.92,102.89,103.71,104.09,103.45,105.35,105.47,105.29,105.94,106.08,106.3,106.61,106.91,106.7,107.2,107.65,107.82,108.14,108.06,107.55,106.73,107.4,107.39,108.02,108.63,110.06,110.12,110.8,109.61,109.45,107.45,107.28,107.9,107.98,107.92,108.94,110.04,110.37,111.67,111.87,112.05,111.75,111.07,111.31,111.66,112.07,112.15,112.57,113.04,113.74,113.74,113.74,113.89,113.85,113.5,113.77,113.82,114.24,114.24,113.4,113.84,112.56,110.55,111.07,108.91,109.24,107.94,109.35,110.05,111.76,111.34,109.53,110.07,110.08,108.14,108.91,109.34,108.85,107.19,107.19,106.62,107.27,108.35,108.56,108.51,109.81,109.81,110.55,110.08,110.2,109.83,109.96,112.23,112.29,112.72,112.69,112.32,111.95,111.91,111.89,112.91,113.68,114.02,115.08,115.2,114.67,114.53,114.08,113.81,113.65,113.68,113.83,114.46,113.81,113.2,113.12,113.43,114.83,114.83,114.09,114.56,114.53,112.55,112.68,112.68,109.73,107.62,106.99,107.58,109.71,108.36,108.12,109.12,106.89,106.7,108.21,109.51,108.89,110.34,109.65,108.37,108.85,109.55,109.39,110.88,111.38,111.57,111.18,112.16,113.26,113.6,113.6,113.73,114.31,115.02,115.39,114.36,114.45,114.67,115.47,116.08,114.96,114.8,114.18,114.81,115.25,116.02,114.35,110.94,111.08,112.03,112.83,111.58,112.53,113.56,116.03,115.59,116.97,116.99,116.64,116.34,117.01,117.17,117.24,117.71,117.81,117.85,117.73,117.67,117.15,117.78,119.13,119.5,119.9,120.48,120.25,120.16,120.66,120.25,119.9,120.64,120.42,120.15,119.74,119.6,119.85,120.51,120.44,120.68,120.41,120.38,117.88,117.37,118.96,118.58,120.01,119.36,119.34,119.85,120.47,121.27,122.63,121.73,121.53,121.53,122.75,122.75,122.75,122.75,122.75,122.94,121.84,121.84,121.84,122.65,121.97,122.19,122.62,123.38,123.17,122.85,122.7,122.5,122.67,123.78,123.48,123.16,122.53,121.46,122.83,119.54,120.89,121.44,119.96,118.34,119,121.31,122.79,123.69,123.46,123.29,124.35,125.28,125.03,124.84,125.24,124.7,125.63,124.26,123.52,118.57,116.12,116.29,112.33,108.22,108.52,109.6,111.18,109.33,105.05,96.18,94.58,94.44,82.73,84.05,79.64,82.25,77.55,79.77,82.83,80.79,88.25,91.01,92.56,88.69,89.89,90.58,87.12,87.38,86.56,90.88,92.88,92.68,94.02,94.02,94.02,94.84,91.28,91.41,93.88,94.57,90.73,92.14,92.71,91.3,93.68,95.3,97.38,95.17,95.17,91.54,93.48,92.43,93.63,94.52,93.73,93.75,91.35,89.72,90.06,94.65,94.34,95.64,95.64,94.44,96.58,97.48,99.17,100.58,99.14,99.14,102.68,106.27,106.01,110,109.41,107.93,107.06,102.21,102.51,101.94,105.4,106.2,105.63,106.26,105.36,107.22,103.88,104.62,104.15,105.05,105.12,104.93,107.91,107.08,108.89,107.96,106.81,106,107.14,108.89,107.96,109.8,109.38,109.39,110.13,110.68,109.56,109.59,107.61,107.35,107.38,107.27,104.28,103.18,105.58,105.77,106.23,105.32,105.72,105.95,108.3,109.31,108.65,107.42,107.45,106.92,107.83,106.41,105.95,108.29,108.23,109.11,108.27,107.77,106.37,106.53,108.49,107.4,105.98,107.72,106.2,108.07,107.68,107.77,107.81,108.31,108.52,107.8,106.73,102.74,102.84,103.36,102.7,101.96,104.76,104.47,103.8,103.82,103.72,104.67,105.09,105.1,105.82,106.39,107.2,106.58,106.39,103.77,105.49,105.39,104.92,103.38,103.08,103.97,100.93,99.8,96.32,96.21,96.15,98.14,100.72,102.74,104.52,104.14,110.77,111.9,112.7,111.43,111.55,112.66,112.74,113.18,112.2,112.71,112.56,114.02,114.15,114.12,114.66,113.52,114.58,114.45,114.32,115.04,114.74,114.6,114.7,114.49,113.3,113.89,114.46,115.16,115.74,115.25,112.09,113.68,115.04,115.04,115.04,116.21,116.41,116.09,116.09,115.85,115.32,117.37,117.74,118.48,117.68,117.41,117.55,118.36,117,117.1,116.86,117.79,117.61,117.09,115.49,116.78,114.94,115.61,113.16,114.76,116.7,117.33,118.38,118.82,119.14,119,118.58,119.34,120.12,121.37,121.12,120.26,119.65,120.7,120.26,119.91,120.46,119.78,118.2,120.48,120.51,120.68,120.42,119.27,122.32,123.06,124.16,125,124.6,124.48,125.17,125.13,125.71,124.72,124.61,124.39,124.57,124.57,125.68,126.21,127.61,127.39,128.26,128.26,128.26,129.05,128.61,129.29,129.32,128.77,128.94,129.24,129.8,131.08,130.66,128.08,129.25,130.49,130.45,130.69,130.4,130.5,129.91,129.19,130.02,127.57,130.1,129.99,131.13,130.77,128.26,128.3,128.3,130.58,130.23,130.19,127.96,130.01,130.85,130.85,131.18,131.04,131.29,132.31,131.29,132.34,132.89,132.59,132.92,133.19,133.13,133.16,133.13,134.13,134.32,134.68,134.95,135.15,132.72,133.66,134.01,132.48,133.99,133.93,132.93,133.51,132.1,132.58,132.75,132.85,131.72,132.56,129.74,132.23,133.05,133.09,133.25,131.85,131.18,127.69,128.59,130.88,131.93,133.56,133.35,132.12,133.36,133.81,132.91,133.8,133.85,134.72,135.25,135.69,135.77,136.12,136.72,137.37,137.48,136.59,136.4,136.17,134.07,134.81,135.75,135.8,135.9,135.53,136.22,136.47,136.4,137.4,137.56,136.58,138.01,137.33,135.77,135.77,135.55,136.17,136.24,134.76,135.53,134.27,131.43,133.18,134.89,136.35,135.16,135.39,131.92,132.62,131.58,131.16,129.9,132.14,130.42,133.21,132.39,132.37,131.8,132.72,134.86,135.96,134.93,135.43,135.61,135.07,136.15,136.13,137.29,137.19,137.61,138.16,139.13,139.64,140.08,140.85,141.81,141.47,141.21,141.35,141.65,142.05,142.56,143.06,143.04,142.48,141.6,141.02,139.24,138.99,139.54,132.92,133.57,132.06,135.84,133.52,132.62,134.47,138.99,137.59,136.78,136.49,135.96,134.71,135.2,136.57,135.26,133.49,135.7,137.07,138.65,138.65,139.37,140.15,139.27,139.96,139.96,140.8,141.96,142.76,140.57,139.95,137.8,139.16,140.3,140.28,138.86,139.83,138.39,138.73,139.75,137.47,131.78,132.56,135.36,136.02,134.46,135.69,137.31,137.23,134.6,132.83,133.93,134.21,136.65,136.42,135.06,132.11,134.68,134.47,133.69,132.43,129.55,129.54,129.15,124.46,129.06,127.55,122.4,124.18,121.62,115.58,114.16,113.93,122.41,118.68,119.83,121.6,121.5,126.43,126.28,126.84,126.17,127.61,125.76,125.57,125.71,126.34,130.08,128.68,126.84,127.37,128.42,127.34,124.31,123.58,125.41,124.8,124.53,124.42,125.09,125.09,125.09,124.51,126.66,127.67,124.81,122.13,120.96,121.39,122.76,123.6,121.32,122.25,121.07,120.15,117.96,114.63,115.54,118.57,117.45,120.37,119.78,121.61,119.96,118.09,118.86,120.53,118.56,119.52,119.52,123.8,124.86,123.16,122.2,123.35,122.98,122.98,123.73,123.15,121.06,116.99,113.84,112.95,114.81,111.42,111.76,112.78,113.57,112.61,111.69,114.84,115.02,115.36,114.23,112.29,112.08,112.21,109.2,111.22,113.39,113.97,112.84,113.34,112.26,110.4,113.02,114.15,116.6,116.53,116.9,116.9,117.15,116.21,117.26,118.71,120.52,120.52,119.76,121.32,122.04,121.09,122.12,120.76,121.87,122.12,122.76,123.17,123.68,122.08,122.78,121.25,118.9,118.72,119.2,119.43,117.13,116.05,115.77,114.32,112.35,115.2,113.44,113.77,113.83,114.16,116.04,118.52,116.56,115.96,115.12,113.77,113.74,112.69,113.5,111.39,108.84,108.64,108.19,108.41,106.58,107.85,108.63,113.26,112.06,111.6,109.71,109.11,108.57,108.29,109.29,109.92,111.86,112.59,112.83,113.53,113,114.66,116.54,117.18,117.16,117.43,117.58,118.67,117.73,116.79,119.88,120.55,121.54,121.17,125.03,125.74,126.36,127.25,126.2,126.06,127.57,127.06,127.73,128.27,128.78,128.79,127.92,127.88,128.87,129.51,129.29,128.6,128.04,127.44,127.45,128.15,127.47,129.58,129.21,124.67,123.64,123.88,123.59,125.86,124.27,124.06,124.06,124.58,123.8,125.14,123.3,123.3,126.19,129.17,128.7,130.59,132.24,131.88,133.25,134.13,134.91,135.12,135.68,135.68,133.08,133.91,134.91,134.99,134.83,135.67,135.8,135.17,135.33,135.58,137.85,138.4,136.69,136.82,136.81,138.14,136.45,137.86,137.77,139.11,139.67,138.95,138.83,138.15,137.91,138.4,135.82,138.07,137.76,137.02,137.83,139.59,140.21,139.08,139.39,139.31,137.47,133.15,135.85,131.15,133.81,132.12,133.89,135.91,136.37,136.75,134.26,135.36,135.48,137.53,139.29,140.25,140.12,140.26,139.71,140.07,140.07,140.07,140.85,140.87,141.82,142.71,141.96,142.82,142.8,142.52,143.29,143.07,142.29,141.31,141.65,141.69,141.69,139.6,140.09,139.34,141.08,141.34,140.51,139.98,140.08,140.34,140.3,140.27,140.52,140.52,142.86,142.55,141.14,138.58,138.78,140.98,140.98,139.49,137.1,138.39,140.53,139.54,139.61,139.5,139.69,139.43,140.3,141.31,142.23,141.88,142.85,141.79,141.17,140.5,139.91,138.84,139.13,139.93,141.22,141.54,142.98,142.95,142.72,141.41,137.26,137.7,138.35,139.33,141.73,142.75,143.02,141.61,142.03,141.79,142.16,142.73,142.46,142.73,141.26,144.56,145.18,145.33,145.33,140.95,139.91,140.83,140.98,139.4,140.33,142.49,140.46,140.75,139.39,139.25,137.42,136.93,137.32,138.48,138.68,137.56,137.69,139.56,140.62,140.26,139.67,139.2,139.11,138.76,137.76,137.2,137.72,138.28,137.89,137.28,139.11,139.6,138,137.9,138.98,136.92,136.75,135.45,134.21,134.29,135.26,135.69,134.49,133.12,133.26,133.26,134.71,133.67,136.68,136.54,136.46,134.44,134.88,134.96,133.45,132.95,130.81,131.37,132.14,132.4,131.62,130.48,130.93,132,132.99,135.53,135.69,135.17,135,135.81,137.46,136.43,137.56,139.49,140.27,139.84,141.09,141.14,140.8,141.45,141.76,142.11,141.53,141.32,142.06,142.44,143.62,143.5,144.73,145.72,145.41,147.02,147.57,147.45,147.25,147.54,147.87,146.95,147.41,147.36,147.07,146.96,146.96,146.96,147.19,146.73,146.97,146.97,144.58,145.42,145.08,145.79,145.2,145.26,144.39,145.61,144.79,144.53,143.11,144.74,144.6,145.62,145.16,148.35,148.94,150.67,150.79,151.55,151.09,150.77,151.29,151.31,152.47,152.08,153.11,153.28,154.27,152.42,153.06,154.17,154.9,154.81,154.72,155.21,157.81,158.37,158.1,158.8,158.74,158.54,159.1,159.69,159.04,159.77,161.68,161.25,160.25,161.97,162.53,162.29,162.06,161.96,162.77,162.53,164.22,163.53,163.95,164.6,165.17,165.23,165.23,165.23,163.88,164.77,164.82,162.99,164.01,162.22,162.54,161.43,161.05,162.01,159.82,159.72,160.45,159.85,160.46,162.78,162.19,160.53,162.74,161.9,159.95,159.95,158.96,159.96,161.12,163.04,163.76,163.76,165.28,165.08,165.13,165.8,164.87,164.6,164.6,164.04,163.33,163.74,163.67,164.44,163.5,161.32,161.94,161.98,162.63,161,163.67,164.76,164.18,163.05,161.38,163.63,160.42,157.29,158.63,159.77,158.79,160.82,159.5,160.92,160.43,159.78,159.35,159.07,160.24,159.47,161.4,162.11,161.85,161.53,159.38,161.18,161.74,163.91,161.97,160.82,158.99,158.29,156.9,159.18,159.81,158.03,156.38,158.05,156.52,157.35,158.39,158.39,150.77,148.59,148.71,151.73,151.75,151.96,151.85,152.6,153.66,156.27,157.33,158.34,157.89,158.79,158.78,159.56,159.16,159.23,159.69,161.42,161.15,161.64,159.67,157.58,156.51,154,155.32,154.3,154.83,156.47,157.44,156.91,157.99,157.16,160.68,158.34,158.8,160.59,159.81,163.57,164.71,162.53,161.03,161.32,159.96,161.05,161.53,160.86,161.95,161.55,162.64,163.85,160.78,159.55,160.8,162.07,160.6,160.54,160,160.42,160.67,161.53,160.89,158.8,156.91,158.54,157.71,158.3,156.04,157.7,156.1,157.77,154.22,154.08,157.1,155.85,155.7,154.43,153.73,154.58,155.66,156.01,154.78,153.84,154.67,156.16,157.53,158.57,159.88,160.94,161.79,162.04,160.95,161.19,161.4,161.47,160.79,160.65,161.13,158.58,158.04,157.74,157.74,157.74,157.74,159.23,158.27,158.27,158.27,158.34,162.08,162.9,162.4,163.1,161.78,161.03,161.88,163.57,165.99,167.34,167.86,167.91,169.21,169.58,169.65,168.64,168.88,170.01,171.69,171.84,169.6,171.12,171.33,174.11,173.09,174.16,175.22,175.7,178.78,178.55,179.41,179.87,177.5,177.5,177.95,177.26,177.07,179.68,177.88,177.58,180.09,175.1,178.41,179.43,177.74,175.09,172.59,174.2,173.19,175.65,177,178.28,179.01,177.17,176.29,176.03,177.96,175.9,174.9,173.29,170.59,172.93,172.39,166.2,158.56,151.35,155.16,150.23,156.63,155.6,159.64,161.55,161.43,160.41,160.41,160.41,161.26,165.72,166.25,167.52,168.06,167.78,167.72,167.72,171.79,171.72,171.08,170,171.91,172.58,175.27,176.04,175.63,175.91,176.41,176.4,177.29,177.29,176.31,173.12,175.36,176.02,174.81,174.81,174.43,174.07,174.73,175.68,175.86,176.5,176.5,176.02,175.29,174.24,171.96,173.55,171.9,171.19,168.92,170.11,169.73,172.17,170.71,170.45,173.1,172.37,171.7,172.87,173.67,171.9,173.62,174.61,177,176.76,174.98,174.57,174.03,172.2,174.77,174.19,173.66,171.96,173.7,174.06,173.96,173.49,174.84,175.3,172.91,172.91,170.39,170.63,171.07,173.31,173.82,173.3,173.44,175.13,176.64,177.1,176.64,178.22,177.87,177.54,178.38,176.95,174.99,175.29,175.41,173.95,174.45,171.98,173.08,173.78,172.86,174.31,174.5,174.26,175.09,175.21,176.83,174.62,174.53,177.36,177.42,176.88,177.87,177.62,176.98,178.76,178.99,179.74,181.41,183.51,183.7,182.95,182.46,183.63,182.85,179.79,180.98,180.46,182.18,183.71,182.26,184.65,184.84,183.29,184.24,184.44,185.63,185.41,185.46,185.24,184.03,184.59,183.97,184.26,182.38,180.93,184.11,186.1,188.11,186.66,185.07,183.35,179.9,180.13,181.04,179.26,179.7,181.17,183.82,183.75,184.23,184.21,184.82,185.09,185.86,186.05,186.1,185.86,185.53,187.02,185.94,186.97,185.85,184.67,186.62,187.23,186.69,186.87,186.87,186.87,186.87,186.95,188.4,188.4,188.4,192.54,192.8,192.53,191.91,194.94,195.55,195.99,195.18,196.36,195.98,192.61,191.51,191.21,193.59,193.33,193.65,194.84,192.85,191.51,193.32,195.26,194.87,194.06,192.6,194.97,196.94,196.55,196.18,195.39,194.54,194.33,195.73,198.38,196.96,199.29,198.72,198.81,200.65,200.27,199.52,194.59,187.6,190.82,187.96,185.91,184.79,189.73,188.35,186.86,185.81,186.54,187.52,186.47,182.47,178.81,181.18,181.41,183.62,180.91,178.96,180.13,181.03,186.33,185.04,185.04,185.04,183.1,192.2,191.65,192.62,191.93,194.52,193.08,192.85,196.89,194.45,192.75,191.97,191.6,191.23,190.48,189.69,189.05,191.17,191.17,187.34,190.78,195.9,194.13,192.14,191.62,188.79,190.5,190.5,189.42,190.11,190.18,194.24,193.73,195.65,195.65,197.1,197.31,196.81,196.66,196.15,198.52,196.76,198.38,197.04,197.04,196.64,195.34,196.87,201.12,202.48,203.39,204.77,205.53,204.55,205.14,202.51,202,203.71,202.22,202.55,205.68,204.2,206.73,208.43,207.96,205.42,201.68,204.26,203.79,203.83,204.13,203.65,204.24,202.52,202.41,204.3,205.32,201.85,204.15,204.19,204.43,203.11,206.21,206.66,208.88,210.84,210.52,211.35,212.05,212.43,212.93,212.37,212.75,212.56,212.26,210.24,209.46,208.74,210.04,209.58,209.83,210.32,208.82,210.8,208.68,207.01,206.79,207.45,207.79,208.15,208.45,205.15,203.76,205.59,203.48,202.71,203.68,205.51,202.7,205.36,205.57,204.76,203.88,204.86,204.81,205.43,203.76,200.72,202.77,202.89,203.87,200.88,199.14,200.65,201.56,200.45,201.21,200.49,201.66,199.73,198.97,198.97],"HSCEI":[null,null,100,99.85,98.44,97.52,96.57,97.02,98.51,96.62,96.24,96.33,97.52,98.04,95.19,96.88,95.74,94.82,95.38,95.02,94.66,94.89,95.86,97.96,98.1,98.23,99.36,100.23,99.93,99.85,100.4,99.27,98.57,99.15,99.76,100.45,100.15,98.44,98.65,98.51,96.21,96.12,95.17,94.22,94.71,93.38,93.19,93.19,93.19,94.39,94.52,95.35,95.35,96.01,95.82,97.42,97.55,97.46,98.08,98.79,98.68,99.33,98.1,98.47,99.49,99.39,98.61,98.72,99.05,98.88,100.01,99.5,99.5,99.5,99.02,98.41,98.28,99.87,99.93,101.04,102.26,102.76,104.11,104.08,105.92,106.11,105.15,106.01,105.64,106.95,106.79,105.74,104.85,104.52,104.42,104,102.96,103.23,103.82,104.34,102.47,102.19,104.12,104.69,104.26,106.84,106.7,107.42,108.03,106.13,106.44,106.34,105.17,105.82,105.93,105.1,104.27,104.69,104.69,105.2,104.3,104.27,104.07,103.18,103.61,103.57,103.57,103.57,101.93,101.33,102.06,102,102.59,104.25,104.72,104.14,103.72,103.72,103.26,103.26,102.39,100.74,101.31,102.8,103.8,104.11,104.36,106.06,105.89,105.38,104.25,104.21,105.29,105.5,105.46,107.29,107.38,107.78,107.78,107.61,107.78,108.26,107.55,107.65,107.7,108.09,107.5,106.42,106.83,106.72,105.01,105.4,106.78,106.25,105.49,105.58,105.86,106.88,106.55,105.64,105.88,105.2,105.68,104.6,105.36,105.01,104.05,103.67,105.72,106.74,108.37,108.88,109.44,109.16,110.23,110.09,109.48,109.83,109.44,109.93,110.2,109.17,109.89,111.89,112.2,111.66,111.67,112.19,112.45,111.26,109.43,107.31,108.67,108.98,109.79,109.63,108.53,109.12,111.18,111.18,112.16,114.57,115.11,114.65,115.44,114.64,114.54,113.5,113.59,112.95,112.64,113.16,113.89,114.1,113.54,112.67,112.33,113.63,112.92,113.4,113.66,112.75,110.75,111.32,112.01,110.37,110.73,110.73,114.74,115.67,115.67,116.3,115.55,115.89,115.82,116.72,116.92,117.76,117.41,117.95,115.27,117.31,116.63,115.76,116.65,116.17,118.17,117.36,116.8,118.1,117.72,117.76,116.97,118.19,117.49,119.2,119.21,118.59,117.75,115.83,117.06,117.82,117.11,120.52,121.37,119.12,120.86,119.48,118.8,118.22,116.47,116.2,116.9,116.56,113.29,113.17,114.58,116.02,114.81,116.92,117.04,115.36,115.86,117.14,116.78,117.7,118.27,118.27,118.27,117.91,118.58,118.84,122.49,122.69,123.86,123.94,124.18,124.39,124.73,124.79,126.55,126.57,129.78,130.61,132.9,133.76,134.02,136.92,138.24,135.88,139.29,138.64,135.89,137.64,136.35,137.41,136.81,128.76,126.19,125.65,120.79,120.78,121.84,124.44,127.23,127.23,127.23,125.82,128.76,127.16,129.25,130.26,128.35,125.67,126.14,123.86,121.71,124.95,123.62,125.19,126.17,128.87,129.37,128.74,129.1,128.62,128.49,127.85,127.08,126.13,123.09,123.8,124.85,121.8,121.77,121.77,121.77,123.18,120.34,120.34,121.46,122.53,125.08,125.09,124.72,124.44,121.87,120.78,121.65,124.23,122.34,121.79,124.28,122.75,121.28,122.47,125.15,125.15,123.76,121.98,120.68,121.45,123.26,123.67,124.17,125.3,127.32,126.26,126.26,124.62,125.4,125.34,125.34,122.71,123.34,122.28,122.96,121.38,119.45,121.57,122,124.32,124.42,124.67,125.93,123.47,123.54,123.89,122.15,121.29,120.47,120.47,116.64,116.78,115.34,115.09,113.76,112.85,110.42,110.31,112.38,112.38,110.35,108.73,107.66,107.81,109.29,109.87,108.17,109.13,109.07,108.64,107.5,107.36,106.8,108.42,108.92,111.38,112.39,111.86,112.12,112.11,111.89,111.37,108.93,108.53,108.62,110.28,110.64,111.84,111.06,109.27,109.05,106.92,106.36,106.71,107.91,108.98,110.12,109.76,109.41,112.14,112.63,112.49,111.31,110.38,109.75,110.53,108.05,107.37,107.17,105.89,104.87,103.92,106.6,107.33,106.18,107.15,109.02,109.54,111.92,109.89,109.89,111.5,111.02,111.82,111.82,109.15,109.47,107.05,106.88,105.48,105.76,105.99,102.43,104.53,102.96,103.51,103.51,102.88,103.75,106.47,103.88,103.79,103.28,102.09,101.62,101.48,102.9,104.33,108.47,107.02,107.91,108,108.63,105.87,105.96,106.35,105.61,107.13,107.42,107.9,106.22,106.43,106.02,105.44,106.79,106.72,107.93,107.43,107.8,110.45,110.7,109.18,106.37,105.24,104.27,103.98,105.73,107.14,105.14,105.06,103.83,103.48,102.41,102.52,102.13,102.13,102.13,101.4,101.41,102.76,99.81,99.82,101.79,102.75,102.85,105.13,105.5,106.11,104.46,106.59,107.13,106.69,107.96,108.73,107.72,107.9,108.51,110.36,110.45,110.3,110.6,112,112.29,112.01,112.01,112.01,112.01,111.2,111.81,112.1,113.66,113.37,111.01,113.15,112.83,113.97,114.75,115.98,118.05,117.16,116.28,115.37,116.79,117.48,117.56,117.65,116.31,113.23,114.45,116.37,115.76,116.18,116.8,118.49,118.61,117.99,117.16,116.89,114,113.99,114.74,114.63,115.5,117.3,117.19,118.8,118.67,118.67,119.7,119.91,119.4,117.91,118.34,118.06,119.98,120.26,119.44,119.44,119.44,119.06,118.38,116.74,116.83,118.12,117.15,117.15,117.29,117.48,114.01,114.29,112.63,110.07,110.94,110.94,109.25,109.65,109.73,108.48,107.92,107.93,107.63,105.56,106.01,105.58,105.72,105.46,106.06,105.42,105.86,104.96,104.99,104.89,104.89,106.84,107.79,106.51,106.29,105.75,105.84,106.65,109.25,110.85,110.85,111.16,109.03,109.27,110.6,110.44,110.44,111.45,110.85,110.76,110.58,108.85,108.1,108.62,109.45,109.49,110.01,110.28,110.1,109.46,110.72,109.31,109.71,110.21,110.94,110.15,109.42,109.8,108.35,107.8,105.03,102.32,101.62,101.43,101.92,101.43,101.47,99.94,100.13,100.51,101.13,102.6,102.84,103.29,102.74,103.47,101.63,101.45,101.3,101.42,102.34,102.54,101.86,104.42,105.39,105.86,105.73,105.59,107.23,107.51,108.47,107.87,106.59,106.35,105.4,105.31,104.42,104.24,103.21,103.65,103,103.53,103.53,103.35,103.74,102.99,102.99,103.54,103.21,103.71,106.09,106.65,106.57,106.89,107.46,106.97,107.01,106.84,106.08,106.9,106.23,107.28,107.04,106.36,106.9,107.81,109.75,110.4,110.23,110.99,110.45,107.72,108.51,106.76,105.83,105.8,107.14,108.56,107.78,106.06,106.63,107.88,107.76,107.79,107.2,104.56,105.19,105.11,104.07,104.76,105.63,105.63,105.5,106.59,107.73,110,109.4,111.29,111.89,111.5,111.95,112.18,112.01,112.01,112.01,113.62,113.93,113.35,114.9,114.22,113.32,113.66,112.45,114.5,114.36,115.67,115.25,114.64,114.98,115.9,115.01,111.34,113.42,111.16,111.4,111.4,111.4,107.77,104.79,103.93,104.21,105.91,106.51,109.25,108.65,108.13,109.7,110.47,109.97,110.26,111.21,109.66,110.71,110.77,109.52,107.26,107.38,106.58,107.51,104.56,106.42,106.42,106.79,108.88,106.13,101.34,103.05,102.21,98.71,97.94,93.65,93.54,89.32,86.87,92.55,88.82,93.22,96.72,95.89,96.47,95.43,97.38,95.45,96.69,96.33,97.96,99.94,98.26,99.58,99.58,99.58,99.94,98.7,98.17,99.62,99.71,97.58,98.15,98.49,98,100.23,101.33,101.91,101.91,101.91,97.42,98.43,99.54,99.1,100.16,101.4,99.79,99.83,98.32,98.19,98.72,100.31,100.46,99.97,95.68,96.07,97.38,97.1,96.94,97.04,99.81,100.24,101.16,101.17,102.17,101.58,102.72,102.95,100.93,99.79,98,100.15,100.58,100.64,101.24,100.27,101.43,100.85,100.85,100,99.03,99.04,99.04,102.07,103.96,108.87,107.59,109.09,109.43,106.99,107.34,105.61,105.46,102.85,103.56,104.49,106.01,103.96,104.79,102.31,102.26,103.03,103.36,102.48,101.9,101.83,103.56,104.1,103.55,102.14,101.4,103.05,103.68,103.98,104.2,105.41,105.81,104.67,103.07,103.65,104.91,104.46,104.54,103.54,103.35,101.41,101.63,101.5,100.89,100.32,99.11,99.77,98.74,98.28,98.98,99.53,99.76,99.93,98.77,99.49,97.84,97.2,97.01,95.11,94.41,95.23,94.2,95.38,95.38,95.38,95.89,96.79,97.73,97.68,97.61,100.26,100.26,100.69,99.08,100.63,101.27,101.37,102.28,102.36,102.77,102.77,101.52,101.12,101.04,99.06,100.85,102.22,102.5,106.35,106.55,107.92,107.45,106.99,107.37,107.03,107.37,107.08,107.99,107.13,107.11,108.26,107.71,107.15,108.61,109.51,107.04,108.19,107.32,107.44,107.83,106.3,105.65,106.45,105.71,106.09,105.99,105.55,106.18,107.03,106.4,105.57,105.39,106.39,105.86,105.86,104.65,106.05,108.22,108.99,108.83,109.35,110.63,109.58,111.19,112.25,113.85,113.52,114.68,114.9,116.34,119.1,121.28,120.67,118.52,121.39,118.7,118.25,115.03,113.76,116.25,117.82,118.26,117.36,117.34,117.33,117.76,119.87,120.58,120.58,120.58,122.16,124.11,122.21,122.88,120.71,120.87,116.82,118.92,114.15,116.25,115.31,118.4,114.95,114.61,111.79,111.37,112.25,115.1,113.4,113.1,114.99,115.28,116.42,114.52,114.76,112.77,110.1,109.05,111.3,111.06,111.85,111.36,113.85,113.85,113.85,113.85,112.36,112.75,111.41,110.37,110.13,111.64,110.69,111.92,112.59,112.51,110.51,111.02,112.33,111.45,111.47,111.79,112.15,109.87,108.73,109.26,108.82,109.17,108.59,108.1,105.87,107.14,104.94,105.6,106.61,108.13,108.13,108.02,108.62,108,109.54,110.18,110.1,109.55,110.52,111.55,111.15,109.88,109.67,109.09,108.9,108.65,108.76,109.11,109.11,108.28,107.21,107.48,108.05,107.05,106.26,108.33,108.37,110.41,110.26,109.18,108.23,108.23,105.71,104.28,104.23,103.01,99.69,100.33,100.94,102.64,102.15,103.26,103.05,101.07,100.12,99.78,101.56,99.86,94.95,90.12,92.07,95.56,93.71,94.76,94.6,95.6,94.35,94.12,94.53,96.41,96.91,96.07,95.18,94.04,91.93,92.87,90.49,88.73,89.47,92.35,92.12,90.71,90.92,91.3,93.21,94.1,94.81,94.3,95.11,96.1,95.9,93.21,95.27,93.77,92.17,90.7,89.37,90.74,87.68,87.69,87.69,88.64,87.33,87.12,88.5,88.91,88.57,88.57,86.48,86.43,85.38,88.43,89.07,91.34,89.81,89.81,89.81,91,91.05,92.72,94.15,94.12,94.97,94.61,93.98,92.3,91.88,90.96,90.32,89.96,89.89,90.87,89.53,89.25,89.37,90.44,91.83,92.5,92.21,93.64,93.3,91.71,91.05,90.63,89.59,89.26,89.41,87.04,86.25,84.93,85.52,86.33,85.82,83.98,86.54,86.5,87.87,87.06,86.79,85.44,84.67,84.74,83.41,81.63,82.63,83.18,83.27,83.24,83.24,83.17,82.2,82.17,83.59,83.11,83.02,81.35,81.89,83.54,84.9,84.94,87.41,87.31,86.83,85.9,85.75,85.68,88.92,89.18,87.87,86.3,86.39,84.15,83.33,84.75,84.75,84.75,84.75,87.13,87.18,86.4,88.54,89.21,89.16,87.47,86.56,88.09,88.41,86.65,85.82,83.94,84.41,81.51,81.11,81.44,81.73,80.26,80.18,78.02,75.23,73.46,72.97,73.64,71.66,66.53,62.15,69.92,75.18,74.76,73.53,76.51,77.49,76.41,73.93,75.07,76.25,77.23,76.38,76.5,78.87,78.87,77.22,76.07,76.02,73.16,73.73,74.24,74.96,74.96,74.96,72.75,72.04,70.66,70.76,67.85,68.48,68.87,70.22,74.08,74.08,73.76,72.44,72.24,69.11,69.11,67.58,68.71,66.93,69.09,69.28,71.82,71.95,70.02,72.27,71.27,69.86,70.02,69.8,71.88,73.63,75.27,74.55,73.76,73.76,76.12,75.79,77.94,77.2,77.23,74.5,74.43,75.64,73.68,74.78,75.1,76.62,74.45,75.75,77.43,79.34,80.12,78.1,77.81,77.81,77.62,77.57,76.59,76.52,76.64,74.3,72.99,72.53,72.32,70.62,72.76,72.03,72.86,72.06,72.13,71.83,72.92,71.97,71.88,69.88,69.79,68.02,68.38,69.82,70.05,69.23,68.96,67.43,69.25,69.6,69.16,68.28,68.56,68,68.2,67.95,67.48,66.64,69.51,70.24,69.75,69.42,69.68,68.43,67.72,66.76,66.54,66.1,65.33,67.27,67.27,67.32,65.67,66.06,65.17,64.33,65.01,63.61,62.88,62.06,62.29,62.42,60.48,60.01,60.02,59.44,59.44,63.18,62.78,61.65,59.69,58.15,57.77,56.44,57.13,57.17,58.42,56.81,55.95,56,51.91,52.58,52.95,53.21,51.04,50.12,52.87,54.35,52.48,55.64,57.2,56.86,56.17,54.98,59.55,60.69,63.63,63.19,62.32,62.17,60.92,59.89,60.34,60.82,60.6,59.6,63.3,64.7,64.8,64.64,68.06,67.52,65.29,67.66,69.36,67.27,67.54,68.02,66.9,67.34,67.03,65.69,65.97,68.17,67.42,67.42,67.42,68.74,67.96,68.05,68.05,69.36,71.71,72.8,72.5,73.95,73.72,74.2,74.21,75.02,74.6,74.23,74.5,74.22,75.95,75.95,75.95,75.95,78.22,78.9,76.08,75.36,76.73,76.18,74.97,72.97,73.4,72.97,74.23,72.33,72.51,72.17,71.23,71.96,70.96,71.69,70.28,69.35,69.62,68.04,67.7,66.8,70.18,69.6,70.43,70.41,70.15,68.28,67.49,65.42,66.89,65.35,66.58,65.79,67.14,65.66,66.48,67.39,69.39,68.96,67.48,68.3,69.82,70.26,70.73,70.44,69.78,69.78,69.97,69.97,69.97,70.54,69.69,69.78,70.18,71.62,71.07,69.92,69.98,68.65,68.34,67,67.54,67.75,68.02,68.02,67.8,66.88,68.19,68.99,70.01,68.36,67.83,67.95,67.63,68.81,68.91,67.36,68.16,66.92,67.94,67.02,65.75,64.28,64.28,63.44,63.78,62.55,62.41,65.24,65.6,65.76,66.39,66.38,66.88,66.84,67.17,66.75,68.74,69.35,68.78,67.54,66.03,66.03,64.9,64.67,66.02,66.19,65.23,65.21,66.89,67.12,65.87,63.62,62.91,63.28,63.9,64.73,66.42,66.57,66.57,64.96,64.77,64.59,65.11,63.65,67.03,66.47,67.7,69.1,70.02,69.57,67.69,67.51,68.33,68.35,66.86,67.12,67.28,66.38,65.2,64.62,63.67,63.86,62.39,61.21,61.89,62.09,63.62,62.67,63.39,64.82,64.51,64.27,64.27,66.31,64.92,64.99,64.09,64.09,63.93,63.54,63.29,63.69,64.04,63.02,63.29,62.74,61.9,63.56,62.22,61.21,61.6,60.8,62.4,62.4,60.38,59.71,59.76,60.63,60.88,61.43,62.24,63.61,62.07,61.4,61.84,61.66,60.13,59.59,59.59,58.86,59.41,59.47,60.68,60.49,59.49,59.47,59.99,61.43,62.74,61.78,61.3,61.2,59.89,60.79,60.54,62.97,62.08,60.64,61.94,61.67,61.66,62.63,61.31,61.15,60.46,59.06,59.45,58.48,57.88,56.93,57.48,57,56.82,56.15,56.98,56.34,56.57,57.85,57.19,56.76,56.96,57.04,55.71,55.71,55.71,56.87,58.51,58.55,57.57,57.13,57.34,56.91,55.63,55.31,55.02,55.77,55.64,55.28,54.23,52.09,52.49,52.04,50.77,52.18,54.33,55.5,54.4,54.9,53.54,52.72,53.01,52.97,52.95,55.55,55.02,54.4,53.86,53.86,53.86,54.67,54.92,56.42,55.67,56.02,57.27,58.44,58.51,58.09,58.94,57.73,57.63,58.14,57.98,56.46,57.58,56.98,57.41,58.35,60.38,60.21,59.95,59.07,59.35,58.67,58.91,59.93,58.44,58.41,59.12,58.14,58.98,58.98,58.98,60.5,59.63,59.63,59.51,59.57,59.83,61.07,60.94,59.67,59.44,58.3,58.36,58.91,58.32,59.18,60.44,61.91,62.12,63.63,63.77,63.67,63.67,65.33,66.45,66.71,66.24,65.53,66.59,68.19,68.63,68.42,68.42,69.74,70.38,70.69,69.23,69.19,68.02,67.04,67.88,67.86,66.55,65.59,64.88,66.3,66.52,66.4,66.53,66.08,66.08,65.48,64.54,65.18,64.7,64.69,64.63,66.86,66.54,65.36,65.37,65.61,65.74,64.18,64.26,64.26,64.7,65.52,65.67,64.78,63.79,63.69,63.45,64.67,66.3,65.18,64.11,63.92,64.01,62.57,63.47,62.87,62.34,61.06,61,61.71,60.76,61.98,61.77,60.64,59.64,59.4,60.22,60.3,61.08,61.2,61.4,61.15,61.25,62.54,63.19,62.88,62.33,63.17,63.12,63.72,64.01,63.19,63.4,64.26,63.04,62.96,62.26,61.97,61.97,60.93,61.16,60.72,61.07,61.62,61.81,62.68,62.68,64,64.77,64.84,68.15,68.67,71.93,74.09,76.22,76.22,81.61,80.32,82.78,84.55,75.95,74.76,77.35,77.35,76.93,73.86,73.76,72.87,75.84,74.5,74.73,75.9,74.69,74.96,75.02,75.28,73.95,73.73,74.52,74.78,76.69,74.73,76.6,75.73,74.65,72.34,72.37,70.77,70.84,71.62,71.88,71.97,71.4,69.9,69.65,69.54,71.32,70.28,70.5,71.14,71.78,71.91,71.19,72.43,74.71,74.15,73.58,74.7,72.94,72.39,72.12,72.88,72.59,72.51,73.22,74.13,74.13,74.13,74.14,73.89,73.99,71.96,72.66,72.42,71.55,70.95,70.83,70.01,69.46,70.92,71.16,72.05,72.15,73.44,74.3,72.84,72.71,74.21,74.93,74.92,74.92,74.92,74.92,74.94,77.58,76.79,78.05,79,80.65,79.6,81.78,81.22,84.56,84.48,86.02,85.89,84.47,87.96,87.48,86.26,89.24,88.65,85.43,85.45,84.92,87.59,90.72,90.47,88.55,88.86,88.12,87.7,90.11,90.62,93.15,93,90.84,88.73,89.83,87.45,87.83,88.07,87.35,86.44,86.65,86.59,85.46,85.46,73.71,75.42,76.48,77.83,79.18,80.85,81.02,78.95,80.15,80.15,80.15,80.69,82.37,81.77,82.01,82.01,81.88,81.97,81.97,83.54,83.54,83.85,83.65,84.24,84.33,86.87,85.11,87.21,86.37,85.95,85.87,87.17,87.9,86.85,87.12,85.64,85.96,85.7,86.88,85.58,84.84,86.47,87.05,88.14,87.59,89.11,88.98,89.98,88.6,87.85,88.6,88.24,87.22,85.37,86.54,87.26,88.91,89.92,89.35,88.93,88.08,88.08,88.55,87.78,87.38,87.37,88.39,87.26,87.98,88.17,88.63,90.1,89.94,89.85,91.21,91.75,92.11,93.79,93.96,92.87,93.14,92.82,91.73,90.16,89.36,90.26,90.85,90.66,91.16,90.28,90.21,90.5,92.87,92.65,91.74,91.69,91.41,91.48,91.09,92.15,93.86,92.85,91.55,90.5,90.81,92.58,92.44,91.85,90.71,91.92,92.58,93.8,94.67,93.99,95.05,95.25,95.27,97.4,95.98,96.14,95.11,94.29,95.84,95.85,94.42,95.95,96.98,96.98,98.7,98.03,97.16,97.16,96.66,96.72,94.98,93.6,92.15,93.89,93.98,91.47,93.71,94.42,93.61,94.4,95.04,96.09,95.16,95.16,94.86,93.05,93.97,93.1,93,94.96,94.06,95.84,96.03,96.81,97.42,95.38,94.68,93.12,92.88,92.8,90.53,92.15,92.95,92.99,93.02,92.66,93.1,93.2,91.63,92.42,93.36,92.19,90.7,90.88,90.68,92.15,90.51,88.89,89.76,89.74,90.34,90.73,90.47,90.48,90.48,90.48,90.24,91.25,90.47,93.06,92.85,93.82,92.75,91.74,91.84,93.58,94.24,94.55,94.05,93.58,92.71,92.31,92.59,92.5,92.98,92.84,93.83,96.54,96.95,94.56,92.16,91.88,91.83,92.29,91.66,93.05,93.81,94.07,93.12,91.68,92.06,92.06,92.06,92.06,90.93,93.35,91.42,91.7,89.46,89.92,88.32,87.37,86.11,85.78,87.57,87.1,88.4,88.34,88.29,88.01,89.48,89.59,89.67,88.26,87.02,84.32,86.26,87.11,85.15,85.8,85.25,84.99,86.32,85.83,85.83,85.83,85.83,88.07,87.4,87.84,87.3,88.01,88.48,90.38,89.77,90.32,90.77,89.33,88.63,89.07,88.87,87.74,89.37,88.11,88.11,89.05,88.61,89.32,90.53,90.22,90.17,90.15,90.09,89.91,88.21,87.26,87.69,87.34,86.02,86.79,86.79,87.05,85.89,84.89,85.52,86.35,88.94,87.25,86.29,85.63,84.66,84.49,84.43,83.4,84.99,85.01,83.63,82.66,80.95,80.95,80.33,78.75,78.81,77.22,75.72,77.19,76.71,76.71,77.26,78.15,79.29,78.86,82.05,81.17,81.59,81.86,82.24,83.07,84.42,82.58,85.07,84.86,83.74,84.77,83.95,84.9,85.62,87.52,87.74,87.41,87.81,87.02,87.32,86.26,86.59,87.51,86.55,85.72,85.52,84.65,85.66,85.79,85.98,86.75,87.63,85.98,85.71,86.61,86.17,86.17,86.4,85.89,85.76,85.1,86.83,85.56,85.23,84.94,83.98,83.69,84.08,83.27,83.29,82.97,83.48,84.64,84.87,83.97,83.89,82.88,83.4,83.01,83.43,83.43,81.5,81.72,82.5,82.03,81.3,82.7,82.91,82.97,83.05,82.24,82.5,82.5,81.5,81],"KOSPI200":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100],"Nikkei225":[null,100,100.29,101.05,101.21,100.88,101.52,101.4,101.5,99.71,99.71,98.38,99.96,99.92,94.57,100.93,101.11,102.84,102.81,103.94,103.95,104.56,105.36,105.69,105.69,106.69,106.96,106.82,106.53,106.54,107.73,107.22,106.35,106.84,107.64,109.2,110.54,111.47,112.02,112.04,112.16,112.9,112.84,113.44,113.15,113.05,113.05,112.87,112.91,112.9,111.41,111.23,111.23,111.23,114.02,113.59,113.21,113.21,112.32,112.69,111.35,112.24,111.12,109.48,109.95,110.98,111.37,109.93,109.33,110.9,112.91,113.28,112.71,110.8,111.43,110.07,110.09,110.43,110.04,110.61,110.03,112.77,113.24,111.95,113.11,112.59,111.93,112.03,112.78,112.77,112.73,112.21,111.19,111.26,112.85,113.85,113.29,112.77,112.57,112.04,112.42,114.08,114.25,114.11,113.92,114,113.6,113.6,113.22,110.8,111.06,112.09,110.48,111.74,111.83,110.93,110.04,110.47,109.46,109.76,108.22,108.61,109.39,109.1,107.96,107.23,106.7,106.81,107.18,107.26,107.25,108.36,109.84,111.03,112.25,112.03,111.71,112.37,113.16,113.16,113.16,113.16,115.78,115.47,115.8,116.16,115.71,115.63,115.92,115.31,113.79,114,114.51,114.13,114.89,115.3,114.56,114.54,114.51,114.35,115.57,117.41,117.38,116.27,116.29,115.86,116.46,115.85,115.79,115.71,115.4,116.05,116.78,117.72,117.19,117.03,117.16,117.28,117.69,117.14,117.67,116.58,116.71,116.57,116.86,116.35,115.97,116.85,117.52,116.96,116.96,117.08,117.08,116.38,116.5,117.22,116.96,116.24,116.12,116.68,116.85,116.15,115.95,116.3,116.85,116.55,116.11,116.71,116.36,114.86,114.81,114.81,113.69,114.95,114.81,114.65,113.3,112.85,112.8,113.09,112.62,113.2,113.18,112.67,113.51,114.32,114.59,113.52,112.81,112.65,112.87,112.16,113.74,115.08,115.6,115.26,115.86,115.86,118.13,118.19,118.41,118.11,118.7,118.3,117.94,118.5,118.46,118.72,119.96,120.03,120.04,120.4,120.4,121.18,121.51,121.94,123.11,123.69,124.16,124.32,124.81,124.87,126.26,126.89,126.32,126.51,128.07,128.09,128.09,130.47,131.16,131.16,131.21,133.48,133.34,133.08,131.99,130.24,130.23,128.19,130.06,130.33,129.54,130.45,131.07,131.07,131.23,130.91,130.85,131.5,132.24,132.79,132.14,131.64,129.05,130.92,132.74,133.48,133.06,132.43,132.06,131.24,133.27,133.07,133.21,133.06,133.27,133.49,133.22,133.32,132.58,132.47,132.47,132.47,136.79,138,138,138.79,138.43,137.97,137.65,138,139.38,138.89,138.28,138.54,138.59,140.38,139.32,137.74,137.52,137.5,135.54,134.41,136.67,135.44,131.99,125.75,125.96,127.39,124.43,124.43,123.63,123.1,124.91,126.39,128.89,127.59,127.85,126.49,127.4,128.92,130.29,128.42,126.42,123.26,122.45,124.63,123.67,124.34,124.93,127,127.84,126.73,126.88,126.14,125,124.42,124.42,125.65,119.98,120.84,124.05,122.38,123.13,124.85,124.46,123.9,124.06,125.96,125.51,126.15,126.82,126.2,126.04,126.73,127.06,127.13,128.94,129.13,128.97,128.53,129.64,129.27,129.88,130.74,130.74,130.98,130.77,130.77,130.77,130.74,130.98,130.4,130.91,132.44,133.06,132.78,132.2,132.9,133.44,133.85,133.61,132.04,130.56,130.64,130.82,130.11,128.13,129.2,129.02,130.79,131.16,131.66,132.81,132.06,132.7,133.13,133.65,132.32,132.98,131.98,129.64,131.25,132.05,131.03,129.99,130.01,129.6,129.6,129.79,126.93,126.77,126.38,125.39,126.79,128.33,129.17,127.63,129.12,131.5,131.5,132.08,132.64,132.47,132.08,130.33,130.99,131.6,131.44,132.17,131.19,131.24,132.37,131,131.08,130.97,131.88,131.77,131.5,129.76,127.19,130.09,129.21,129.14,129.6,129.18,129.3,130.13,130.41,131.52,132.67,132.76,132.96,133.08,133.06,132.14,132.08,131.4,130.86,129.81,130.19,131.89,131.54,132.8,134.39,134.39,136.29,137.75,137.77,138.9,138.9,139.31,139.86,138.48,140.36,141.09,141.23,140.31,139.52,138.4,138.4,136.57,136.79,131.46,132.06,129.6,131.22,132.92,131.85,131.12,131.6,128.08,128.55,123.77,123.28,123.07,124.86,127.56,126.2,129.44,127.43,128.88,128.52,130.86,129.48,129.59,126.92,127.13,126.88,126.16,126.98,125.6,125.16,125.96,125.96,126.93,127.74,129.05,129.55,130.06,131.37,128.23,127.55,125.12,126.15,123.48,123.06,125.71,126.95,124.38,125.15,122.87,122.13,118.67,117.35,117.35,111.47,112.47,116.84,116.47,116.47,116.47,116.47,113.83,116.61,117.57,118.87,117.34,118.48,118.48,119.61,118.96,118.72,120.26,120.57,120.01,119.84,119.73,120.88,120.16,120.25,119.62,120.88,120.97,121.53,121.3,121.47,120.76,118.32,118.32,121.41,123.04,123.02,121.62,123.84,123.96,124.71,124.9,124.68,125.28,124.82,125.44,124.44,125.71,126.99,126.43,125.68,124.86,122.35,122.93,125.13,123.89,123.87,124.83,125.6,125.5,125.75,125.75,125.85,122.07,124.7,124.41,122.4,123.4,125.16,125.14,126.35,126.42,126.9,126.63,126.87,126.2,126.34,127.27,129.01,129.31,129.64,128.55,129.19,129.29,129.53,129.19,129.81,129.53,129.53,129.53,129.53,129.53,129.53,129.53,127.58,125.71,124.54,124.21,123.32,122.59,123.3,122.57,123.66,123.96,123.79,123.85,123.08,122.88,123.26,123.72,122.22,121.87,119.88,118.77,118.76,120.9,120.89,121.53,122.98,123.39,122.96,122.39,122.88,122.92,122.04,124.15,124.9,123.71,123.87,123.33,122.71,124.17,123.81,126.45,126.59,125.92,126.29,126.55,125.31,125.49,125.31,125.95,126.19,126.19,125.32,124.93,122.47,124.92,124.63,125.82,126.33,126.61,126.03,125.79,126.33,125.24,125.35,122.71,120.57,119.79,119.39,119.84,120.37,120.37,119.03,120.2,118.74,118.82,119.66,120.32,119.98,120.04,120.52,117.9,119.04,119.17,119.07,120.48,119.99,120.02,120.16,122.7,123.36,124.06,124.48,125.68,126.62,127.95,127.95,128.03,127.79,128.28,128.48,128.48,128.6,128.14,128.3,127.32,126.6,127.35,126.73,124.19,124.59,124.39,125.62,124.86,125.41,126.85,126.85,129.23,130.77,130.65,130.89,131.22,131.22,131.66,132.39,132.68,133.07,133.69,132.93,133.42,132.97,132.97,135.31,135.61,135.76,136.12,135.77,136.87,135.7,134.66,135.61,136.27,135.54,134.71,134.07,134.5,135.54,136.01,136.39,136.22,135.55,136.92,136.05,134.63,135.59,135.9,136.35,136.23,136.12,136.31,139.79,139.38,140.04,139.28,138.87,138.59,138.62,138.67,138.4,139.22,138.72,137.66,137.66,137.66,137.66,135.03,137.19,135.03,138.15,138.79,138.79,139.81,139.17,139.27,139.9,140.15,138.87,139.84,138.47,138.65,135.84,135.1,136.05,133.71,135.03,133.68,134.33,135.7,138.92,138.66,137.83,137.83,138.85,138.66,137.84,136.89,134.97,136.17,136.63,136.09,136.09,131.54,130.5,127.72,123.03,124.2,122.68,122.78,124.12,120.75,114.63,115.61,112.99,108,101.43,98.94,98.99,97.33,96.32,96.32,98.27,105.28,113.75,108.61,112.83,111.06,110.08,105.13,103.69,103.7,108.1,110.27,112.62,112.58,113.47,110.82,114.28,113.77,112.25,115.79,114.46,112.2,111.37,113.06,112.09,115.12,115.05,115.05,117.51,114.17,114.17,114.17,114.17,114.49,117.43,118.66,118.52,117.94,115.89,116.6,117.16,118.91,119.85,119.6,118.64,120.7,123.78,124.64,127.53,127.31,128.38,129.92,131.59,132.07,133.05,134.88,134.37,134.57,130.77,129.8,125.29,131.41,130.67,130.09,130.81,130.57,131.22,131.13,129.53,131,127.99,129.7,128.73,128.87,129.81,132.18,131.6,130.57,131.1,129.71,132.59,131.44,133.52,132.5,132.07,132.2,133.17,132.4,132.4,132.4,132.19,131.85,130.33,130,126.33,129.16,131.36,131.02,130.45,129.94,129.94,132.39,132.93,135.29,135.52,134.4,134.14,134.48,133.15,133.38,133.76,135.57,135.53,135.06,133.16,134.65,134.64,135.28,136.55,135.04,134.36,135.44,134.03,135.21,136.21,137.1,136.49,136.61,135.7,135.94,135.94,135.94,135.86,134.35,135.03,136.82,136.98,134.92,134.92,134.01,135.66,136.36,136.3,137.61,137.45,137.09,137.34,137.49,136.79,136.23,137.75,137.14,137.56,136.6,136.85,136.72,136.67,136.28,135.77,133.71,135.56,135.56,137.89,140.27,141.55,144.55,144.93,147.51,148.51,147.72,150.76,151.38,149.72,149.17,148.55,148.55,152.26,153.03,154.43,155.05,153.82,155.88,155.96,156.01,155.67,154.48,154.02,156.06,155.7,155.1,155.56,155.3,155.71,155.99,155.74,155.46,153.84,154.35,155.19,155.12,156.27,160.42,159.7,159.7,158.62,158.04,157.44,159.97,163.75,163.75,163.89,165.59,167,165.96,164.35,166.62,165.98,167.34,166.61,167.72,166.11,166.63,164.09,160.98,163.47,165.04,166.7,164.93,167.47,171.02,171.7,172.03,172.03,171.78,175.06,177.3,176.28,175.95,174.68,175.48,175.48,172.66,175.55,168.56,172.62,171.13,172.01,168.35,167.97,167.26,168.92,168.97,169.99,172.93,173.22,174.12,174.08,175.84,173.36,169.77,168.73,165.3,167.18,169.78,170.99,171.27,169.8,171.02,173.73,175.09,172.81,173.01,172.88,173.23,171.89,173.13,172.37,172.5,172.73,172.74,169.34,165.9,169.85,168.88,169.49,168.71,169.07,169.07,167.67,167.67,167.67,167.67,170.68,170.84,171.77,166.48,163.8,159.72,163.43,161.92,165.3,163.2,163.51,164.79,165.06,166.16,166.67,166.13,169.63,167.94,167.68,168.44,169.09,168.42,168.87,168.54,167.95,168.51,168.46,169.7,171.32,170.45,168.86,168.55,163,168.08,168.03,168.03,169.14,169.04,167.67,167.54,167.05,167.49,166.42,166.68,165.07,163.62,162.59,166.25,167.12,166.48,164.56,162.95,160.92,159.38,160.31,160.31,160.31,161.97,162.76,160.5,161.67,158.77,161.66,160.85,160.52,161.35,161.89,161.89,162.29,163.35,163.02,162.8,160.16,159.59,160.53,158.75,157.19,159.99,161.38,161.34,161.44,160.85,161.71,163.46,165.56,166.1,169.5,172.6,174.09,175.63,174.62,176.8,177.18,178.47,177.55,176.46,177.48,177.48,173.64,172.48,172.48,176.02,175.97,175.65,171.92,171.39,167.42,165.53,161.9,160.2,161.06,163.22,165.84,164.28,163.75,166.14,169.16,168.9,170.01,170.24,167.06,167.62,166.43,169.37,169.33,167.71,168.13,172.52,171.79,171.79,173.38,172.31,171.71,170.42,169.38,170.37,172.31,173.28,173.46,172.76,172.24,173.1,173.26,173.26,170.52,171.66,167.31,164.59,161.9,162.56,161.5,163.11,162.51,165.59,167.94,167.16,165.48,166.66,165.45,165.61,169.14,166.11,162.57,165.95,166.21,167.58,167.49,166.87,169.16,168.21,167.54,167.54,167.54,170.51,170.69,165.78,165.72,165.72,164.23,167.39,165.78,163.66,164.88,164.43,159.84,161.62,160.16,160.54,157.88,157.18,152.29,155.47,157.13,157.57,160.22,158.52,159.68,158.57,158.77,160.49,161.17,161.17,157.58,156.33,159.8,158.47,157.83,156.6,153.91,153.91,151.13,154.07,154.36,156.21,153.59,154.66,151.21,146.77,144.26,143.84,149.5,146.43,147.27,147.5,149.91,155.1,156.11,156.11,158.42,163.17,163.58,163.81,162.61,164.41,163.1,161.9,160.99,161.4,161.7,159.16,156.47,157.03,156.08,153.25,156.21,158.12,157.66,155.95,157.03,158.39,160.34,157.73,154.74,155.37,153.55,156.23,156.23,156.06,156.06,156.06,156.06,157.14,153.16,152.27,152.54,149.84,153.79,154.48,155.14,156.6,153.64,155.6,157.13,155.65,155.24,154.82,155.85,159.27,158.75,159.78,159.53,161.55,162.45,162.61,164.3,164.37,161.91,157.04,154.96,153.2,153.81,151.08,149.97,152.73,152.17,152.29,154.16,156.37,157.41,155.98,153.59,150.92,152.19,153.76,151.92,154.15,154.31,156.03,153.26,154.08,155.04,155.89,155.89,156.89,161.08,161.79,162.44,161.19,160.93,161.28,161.86,161.78,162.9,160.58,161.43,162.54,163.96,164.39,162.94,161.89,161.89,166.12,168.01,167.99,170.05,168.42,168.35,167.56,165.57,164.76,165.72,166.67,162.23,164.07,163.47,160.97,160.9,160.72,160.76,159.62,163.32,164.19,166.09,166.51,161.88,162.21,160.42,160.42,161.12,158.94,158.01,158.01,153.81,154.63,152.31,153.75,150.93,152.55,157.07,157.82,158.93,157.79,157.79,153.63,153.61,152.68,157.65,155.81,158.03,158.62,157.16,156.48,156.97,158.57,159.63,159.13,157.73,160.54,161.07,160.98,160.98,158.28,160.19,162.19,161.29,159.71,164.47,162.72,162.88,163.1,162.53,162.35,162.62,163.61,163.61,165.17,164.58,163.88,163.1,162.76,164.25,161.64,161.89,162.27,161.11,160.46,162.36,162.02,162.67,163.85,163.24,160.18,158.5,154.6,153.55,154.25,152.67,153.66,153.9,153.28,151.84,151.85,151.85,151.85,149.65,150.26,151.15,151.15,152.32,153.89,153.92,151.99,150.26,152.11,155.9,153.66,154.52,156.57,158.86,159.42,159.23,159.34,159.64,159.02,159.14,159.46,160.08,161.15,161.11,160.65,160.52,161.02,159.6,160.63,160.04,161.17,160.1,160.21,159.87,157.72,157.72,159.76,159.58,159.71,160.12,160.02,162.51,164.32,164.74,165.52,166.56,163.77,161.96,158.41,158.45,157.18,159.06,156.8,156.8,159.83,159.56,159.36,159.89,160.13,162.26,161.67,163.18,164.03,164.61,161.85,159.87,160.13,160.8,162.49,163.42,163.85,165.81,165.93,166.77,166.47,166.76,166.22,166.39,166.54,165.36,165.6,167.92,169.47,169.67,169.67,169.67,169.67,168.46,170.17,169.47,169.49,171.02,172.4,173.66,175.12,177.91,179.28,180.9,180.15,178.55,179.24,179.91,181.75,182.3,179.74,181.26,183.44,187.48,189.16,185.71,184.13,187.76,188.74,192.14,194.96,194.86,196.14,194.19,194.3,195.38,193.57,190.76,190.28,189.35,193.16,193.4,193.13,196.42,194.49,194,190.71,188.47,187.32,187.4,185.89,188.65,188.49,188.49,189.09,191.43,189.07,187.98,190.29,190.18,190.1,191.4,190.63,193.03,194.81,190.33,187.14,187.33,187.69,188.41,187.4,188.97,188.97,186.56,187.6,184.86,184.04,183.02,183.69,185.38,186.27,187.88,184.03,187.2,187.53,188.15,189.82,190.35,191.68,192.25,193.44,191.98,189.74,188.94,190.73,190.32,193.01,195.13,195.13,193.44,192.17,189.54,188.56,190.16,188.05,188.38,185.47,185.38,184.82,181.78,177.64,180.83,180.36,180.36,184.74,185.84,189.09,188.05,184.23,186.45,186.46,182.9,181.9,180.39,180.76,181.96,178.08,180.35,178.63,179.57,183.9,185.92,185.92,190.34,187.8,187.18,189.98,189.52,189.62,190.26,195.06,194.5,195.44,194.29,194.09,194.66,194.66,195.67,194.64,194.41,193.9,194.87,194.54,193.38,190.73,194.63,191.21,188,190.82,191.12,191.6,190.21,191.86,190.63,193.31,195.97,192.85,193.02,193.51,193.81,196,195.17,194.73,194.73,194.73,193.71,194.23,194.23,196.47,200.42,203.96,207.03,208.92,207.27,206.45,206.38,209.28,212.67,212.5,210.81,210.87,208.04,209.65,209.87,211.16,209.56,210.41,211.55,210.42,210.19,214.51,214.71,214.71,220.92,219.4,222.05,223.96,223.87,223.24,222.65,227.52,227.52,228.31,228.34,228.16,227.91,232.25,233.4,233.33,233.29,230.43,230.96,225.9,225.77,225.18,225.83,225.25,231.26,232.79,232.79,237.51,237.94,235.18,235.08,237.21,233.74,234.92,231.62,231.83,229.58,231.45,226.9,228.97,231.45,230.33,229.52,229.99,228.3,223.87,220.91,221.59,215.71,217.86,218.52,223.81,218.97,220.75,220.75,223.49,222.72,222.5,222.5,222.5,225.99,222.31,221.56,222.46,222.17,223.2,223.37,226.48,225.71,227.35,226.64,224.72,227.55,224.89,226.37,226.11,224.37,221.44,223.97,226.5,226,223.98,225.22,225.11,227.17,227.73,226.23,225.32,225.87,221.72,223.93,224.45,224.81,224.6,225.81,227.96,230.83,228.93,230.34,230.62,233.2,236.15,238.08,238.08,237.31,241.96,243.43,245.71,239.7,239.7,240.19,239.15,233.5,233.14,230.43,230.41,227.85,220.37,219.19,223.86,224.19,227.54,221.86,208.96,183.06,201.78,204.19,202.69,203.82,203.82,210.84,212.06,213.72,221.49,217.57,221.49,220.85,222.36,223.25,221.77,222.81,223.29,223.24,224.9,225.21,225.12,215.59,213.31,211.77,210.75,210.42,207.28,214.34,212.88,212.88,210.67,211.7,216.21,219.52,219.52,220.78,220.37,226.51,231.77,220.66,224.92,220.02,224.34,224.83,228.88,226.58,228.57,229.16,230.47,230.47,232.25,228,226.43,226.84,226.68,223.53,221.74,221.96,220.63,224.65,226.39,228.56,227.42,221.44,221.44,223.89,229.74,229.17,229.86,230.05,229.14,225.33,224.25,224.87,222.41,223.54,223.18,221.28,222.78,225.67,223.7,221.91,223.16,222.34,224.11,228.4,228.56,229.25,227.48,227.88,229.09,229.11,231.89,229.69,229.61,229.07,227.42,225.86,225.21,227.89,227.16,227.71,230.25,234.4,232.15,232.15,232.15,232.15,228.73,233.25,232.66,230.47,228.06,228.06,223.89,223.72,224.46,223.76,226.38,227.11,230.71,232.53,232.37,230.24,227.05,229.36,229.94,230.28,224.15,225.77,225.97,227.33,225.71,225.79,225.79,226.74,229.63,227.82,227.96,228.52,227.91,225.07,225.65,225.65,222.51,221.96,222.62,216.21,219.88,217.24,217.74,219.41,214.65,215.47,214.11,214.26,214.09,215.62,217.62,220.23,219.68,219.68,219.25,218.85,219.85,221.29,219.96,216.01,207.26,207.3,207.89,202.13,196.57,181.19,192.11,184.55,201.4,195.44,197.75,199.41,197.39,200.05,202.1,199.48,199.14,202.91,203.9,207.78,208.56,208.56,209.75,212.12,214.32,214.32,214.32,214.03,214.89,218.24,219.06,222.19,221.87,219.71,219.7,218.21,218.39,217.05,215.23,216.24,218.4,219.52,219.51,223.65,220.93,218.05,217.91,219.66,218.54,219.62,221.64,222.36,223.58,222.14,220.16,222.94,224.25,226.28,223.97,223.47,223.19,225.73,226.61,230.35,233.64,235.6,232.69,231.38,231.52,231.67,230.37,230.96,231.73,230.71,230.26,229.62,230.89,230.81,232.19,231.71,231.71,231.46,239.58,243.39,241.24,238.58,236.69,236.58,238.99,237.42,234.46,235.96,237.39,238.93,243.36,243.36,248.58,251.82,248.18,252.43,254.38,253.4,249.58,247.96,248.09,249.11,246.7,247.43,249.23,248.59,245.5,246.21,244.05,247.78,250.33,253.97,252.9,255.1,258.21,260.51,260.51,261.29,260.64,263.63,262.13,264.74,264.74,265.53,266.26,263.93,262.12,261.47,259.25,261.49,266.34,279,279.03,277.78,282.7,279.84,279.84,272.61,277.42,280.94,276.89,286.22,286.98,286.93,283.05,286.88,293.94,292.23,298.57,298.67,304.99,304.99,299.67,292.19,296.1,292.57,296.26,295.86,297.15,298.42,293.15,292.84,283.41,282.45,289.93,282.96,282.96,283.16,288.39,291.93,292.44,286.9,286.91,290.17,296.94,293.82,294.34,294.77,294.47,291.82,295.83,291.94,287.37,288.12,285.15,288.09,293.3,293.36,292.96,293.33,295.33,294.02,292.93,292.93,292.93,301.62,305.61,302.38,297.46,302.25,302.25,311.61,316.22,314.88,313.86,311.81,308.36,307.1,312.42,313.34,307.75,310.36,310.5,310.6,310.29,306.41,318.43,315.94,313.18,315.71,327.99,335.48,335.48,335.42,331.35,330.57,329.17,332.53,334.41,330.68,330.68,333.56,340.9,341.9,342.46,337.84,327.5,315.66,321.67,323.67,306.84,315.68,320.2,316.87,313.19,312.79,312.49,321.45,310.58,310.58,299.78,304.06,312.78,311.93,310.59,301.93,297.15,312.72,305.29,309.13,310.82,310.92,327.67,325.26,331.25,328.8,336.8,338.29,346.35,340.28,342.31,345.36,346.74,344.15,347.5,352.28,348.67,348.67,344.99,346.32,346.32,346.32,346.32,365.64,364.94,363.22,365.11,368.19,364.59,357.35,353.9,352.35,348.01,358.95,368.58,379.17,378.22,378.24,376.46,385.98,389.5,388.34,398.04,392.62,387.49,372.57,380.67,373.47,373.69,384.18,403.37,403.88,406.77,413.47,414.62,421.04,406.11,402.54,421.11,403.62,404.25,407.7,410.11,399.97,405.85,405.82,397.2,388.83,394.21,398.95,391.3,394.21,400.08,388.93,373.25,373.25,385.42,384.74,386.52,375.98,377.85,362.91,357.5,360.02,374.53,371,372.18,385.81,382.22,381.78,389.71,389.71,392.93,397.5,399.86,402.8,392.57,380.15,385.33,384.16,381.32,383.23,385.59,384.83,386.43,385.88,385.32,374.32,373.67,378.37,386.39,379.81,379.08,379.82,372.49,369.48,369.42,371.98,373.22,378.36,378.36,378.36,378.36,381.24,386.18,383.35,381.05,388.45,401.27,397.5,407.03,411.32,407.55,401.77,401.7,401.7,394.41,394.22,374.91,380.13,377.76,372.87,376.86],"S&P500":[null,100,100.47,100.09,99.92,99.62,99.31,99.3,98.63,97.98,97.55,97.39,99.55,99.93,101.03,101.23,101.09,101.08,101.83,101.67,102.15,101.9,102.66,102.89,102.97,102.97,103.37,102.83,102.97,102.69,102.33,102.37,102.97,103.32,104.68,104.91,105.53,105.41,106.1,105.24,105.65,105.46,105.67,106.05,105.79,105.6,105.73,105.73,105.96,105.08,105.05,104.56,104.56,105.45,106.05,105.97,106.34,105.97,105.97,106.27,106.04,106.23,106.23,105.92,106.11,105.72,106.08,105.79,106.49,107.34,107.26,107.17,106.53,106.43,106.46,106.52,107.3,107.07,107.1,107.17,107.79,108.17,108.74,109.17,109.72,109.62,109.81,109.81,110.47,110.35,110.4,110.56,110.68,110.39,111.9,111.24,111.3,110.94,110.61,110.36,110.45,110.81,110.85,110.48,111.4,111.22,111.07,110.85,109.47,109.68,109.56,109.47,109.36,110.15,110.27,110.6,110.35,110.17,110.23,109.89,110.1,110.01,110.09,109.93,109.52,108.77,108.77,109.71,109.39,109.2,110.03,109.69,110.88,111.56,111.5,111.56,111.35,111.54,111.68,111.53,111.6,112.06,112.06,111.94,112.07,111.83,111.66,112.2,112.12,110.08,110.49,111.24,111.81,112.01,112.29,112.79,112.83,112.83,112.69,112.64,113.49,113.91,113.77,113.46,113.64,113.67,113.57,113.46,113.97,113.86,113.6,113.64,114.59,113.82,113.75,113.7,113.88,113.91,112.99,113.99,113.01,113.18,113.44,113.44,113.61,112.54,113.26,113.37,113.28,114.11,114.32,114.86,114.85,114.92,115.54,115.52,115.48,115.35,115.69,115.72,115.61,115.46,115.37,115.65,115.71,115.46,115.68,115.87,115.59,115.55,113.87,114.02,115.16,115.11,115.27,113.49,113.28,113.41,114.54,114.15,113.91,114.1,114.15,114.25,114.78,115.44,115.66,115.66,114.79,115.15,115.13,114.96,116.2,116.59,116.68,116.55,116.77,116.94,117.07,117.14,116.79,116.86,116.6,116.61,117.09,117.23,117.66,118.12,118.37,118.52,119.19,119.06,118.85,119.12,119.34,119.14,119.24,119.45,119.53,119.62,119.66,120.27,119.79,119.99,119.43,119.58,120.55,120.16,120.27,120.47,120.49,120.86,121.02,120.99,121.17,120.71,120.6,120.72,120.44,119.78,120.76,120.44,120.6,121.38,121.29,121.29,121.54,121.5,122.69,122.65,123.65,123.4,123.27,122.81,122.8,123.16,123.83,124.23,124.42,124.36,123.86,124.97,125.64,125.23,125.13,125.38,125.32,125.32,125.19,125.29,125.52,124.87,125.9,126.71,127.22,128.12,128.33,128.5,128.35,129.26,130.13,130.13,129.67,130.89,130.68,131.25,132.31,132.6,132.52,132.6,134.17,133.27,131.82,131.88,131.8,129,123.72,125.87,125.24,120.54,122.34,124.04,124.37,126.04,127.56,127.6,127.6,126.86,126.16,126.28,128.31,129.82,128.17,126.75,125.06,125.69,127.08,127.41,127.35,127.92,130.14,129.98,129.15,128.41,128.31,128.53,126.7,126.89,126.66,123.47,120.88,124.16,122.02,121.66,123.34,123.34,120.58,122.1,123.52,124.36,121.64,122.04,124.09,123.4,124.42,124.06,125.06,126.4,126.5,125.78,124.71,124.71,123.04,123.27,124.56,124.69,123.67,123.99,123.1,122.82,124.39,124.82,124.79,126,127.18,127.39,127.51,126.63,127.15,127.04,126.71,127.64,127.24,127.65,127.4,127.1,127.1,125.63,127.22,126.35,127.72,128.29,128.38,129.48,129.39,129.79,129.93,130.16,129.63,129.95,129.82,129.54,129.02,129.24,128.42,128.66,126.9,127.18,126.08,126.86,126.96,127.35,126.72,126.72,127.81,128.89,130.03,130.48,129.56,130.69,130.83,130.7,131.22,131.5,130.98,130.86,131.1,131.72,132.92,132.52,131.65,130.89,131.53,131.39,132.04,132.65,133.12,133.5,133.47,133.27,132.32,131.79,132.64,131.63,132.67,133.11,133.43,133.71,133.66,133.43,134.26,135.29,135.32,136.1,135.49,135.51,135.51,135.29,134.91,134.42,134.12,134.37,134.88,134.92,135.64,135.67,134.92,135.64,135.81,136.88,136.83,136.35,136.17,135.72,136.09,136.09,136.59,136.53,136.63,135.52,134.77,134.71,134.52,130.1,127.42,129.24,128.47,131.23,131.2,129.31,129.27,128.71,128,124.05,126.36,124.17,123.36,125.29,126.65,127.99,127.18,127.89,128.69,131.42,131.09,129.88,127.32,127.14,126.17,127.51,127.79,125.67,123.39,123.76,123.76,122.95,124.86,125.27,128.15,127.87,128.91,130.32,126.1,126.1,125.91,122.97,123.19,123.15,123.81,123.79,121.43,118.9,118.91,117.08,115.24,112.86,109.8,109.8,115.25,116.24,116.09,117.08,117.23,114.33,118.25,119.08,120.23,120.73,121.27,121.25,120.62,121.91,122.18,123.11,124.73,124.73,122.97,123.24,123.41,124.45,123.48,123.3,125.21,126.29,126.4,127.26,127.86,127.58,126.38,126.47,126.56,128.19,128.58,128.24,129.63,129.63,129.82,130.06,129.6,130.43,130.59,130.49,130.41,130.05,130.94,130.43,130.29,129.44,128.39,128.11,129.99,130.37,131.28,131.17,131.82,132.31,132.29,131.9,133.33,130.8,130.69,131.63,131.02,131.49,132.38,133.91,133.91,134.2,134.48,135.1,135.24,134.42,134.89,134.9,135.79,135.7,135.77,135.46,135.68,135.68,135.81,137.01,136.71,136.66,137.3,137.45,137.58,136.55,136.26,137.57,136.96,134.7,134.48,134.07,134.57,131.32,132.38,133.15,134.33,133.55,132.65,133.78,133.4,131.81,131.99,131.99,130.88,129.98,130.25,128.53,128.18,130.92,131.99,132.8,134.2,134.82,134.77,134.5,135.05,134.83,134.96,136.27,136.68,137.97,137.8,137.56,136.25,136.08,136.6,137.39,138.45,138.85,139.92,139.92,139.66,138.99,139.16,139.79,140.11,140.75,140.78,140.3,139.38,139.88,139.02,139.41,140.37,141.02,140.28,141.32,141.09,140.73,139.19,137.94,136.94,132.86,134.59,134.69,137.22,136.31,134.63,136.67,132.67,132.99,134.91,136.55,135.46,136.58,136.51,132.97,134.43,134,134.88,136.59,136.68,136.68,135.73,137.21,138.99,139.12,139.1,139.15,140.15,140.56,140.46,140.02,140.38,140.43,140.43,139.74,139.73,138.55,139.4,139.07,138.33,139.02,137.32,134.86,135.94,137.87,137.25,135.12,136.35,137.22,138.72,138.53,139.91,139.63,140.02,139.47,140.42,139.92,140.32,140.59,141.16,141.95,141.83,142.3,141.87,143.24,143.77,143.6,143.7,144.09,144.46,144.17,144.4,144.5,144.62,145.74,145.81,145.72,145.18,144.95,145.26,146.35,146.67,147.29,147.29,146.7,145.43,144.46,145.38,145.6,146.93,146.46,146.3,146.73,147.98,147.99,149.05,149.1,149.04,149.7,150.44,150.57,150.54,150.54,151.32,151.32,150.45,150.89,152.15,151.08,151.61,151.19,151.93,152.94,152.5,153.57,153.34,153.62,154.91,155.51,155.51,155.09,155.14,155.31,153.91,151.49,153.01,152.88,153.36,150.64,151.74,154.01,155.74,156.26,155.42,156.55,156.82,157.83,157.58,157.87,157.87,157.4,158.15,157.54,155.89,150.66,146.1,145.55,139.12,137.97,144.33,140.27,146.19,141.23,138.82,128.27,134.61,128.03,115.85,126.61,111.44,118.12,112,112.53,107.65,104.49,114.3,115.62,122.83,118.7,122.67,120.71,115.38,118.02,116.23,124.4,124.2,128.43,130.29,130.29,128.98,132.92,129.99,130.75,134.25,131.85,127.81,130.74,130.67,132.49,134.44,133.73,137.29,136.02,132.2,132.77,133.97,133.03,134.56,136.83,136.85,134.05,131.7,133.22,133.75,137.96,136.51,138.79,137.71,138.03,138.03,139.73,141.8,141.5,142.18,142.71,143.89,145.85,145.36,149.17,150.96,149.79,148.99,140.21,142.04,143.22,145.94,145.41,145.5,144.68,145.62,146.24,142.46,144.02,140.53,142.6,144.79,145.52,146.18,146.18,148.5,146.9,148.05,147.21,148.75,147.36,149.34,150.69,150.18,150.61,151.87,152.13,153,151.12,150.18,151.29,150.31,152.18,151.61,152.77,153.87,154.43,155.42,156.42,156.52,156.95,155.7,157.87,157.55,157.52,157.95,158.32,157.62,158.12,158.66,160.25,160.83,162.47,162.74,163.84,163.48,164.71,167.24,161.36,160.05,160.05,155.61,158.74,155.95,156.04,158.02,158.85,158.11,156.78,155.03,153.24,154.85,151.18,151.63,154.05,156.53,155.78,157.06,157.9,156.38,159.19,156.97,159.7,160.98,162.4,165.06,164.02,162.93,162.68,162.71,160.05,160.81,160.45,161.29,161.85,158.84,158.36,152.77,154.59,152.72,154.6,157.35,160.82,163.95,163.9,165.82,165.59,166.86,165.19,167.44,169.39,168.58,166.63,167.29,166.15,167.09,169.79,169.52,169.52,169.92,169.14,171.05,171.36,171.25,172.76,172.43,172.91,171.53,171.31,171.1,170.35,172.55,172.86,173.85,173.24,172.57,172.21,172.34,172.95,172.95,174.45,174.07,174.3,175.42,172.83,174.06,175.05,177.65,178.63,177.46,177.53,177.93,177.27,175.99,175.99,177.42,179.9,179.95,179.41,180.06,179.79,175.17,176.88,173.47,176.25,178.7,178.88,180.82,181.53,182.87,182.67,182.61,182.91,183.77,183.77,183.67,183.61,182.8,182.46,181.05,181.27,183.33,178.84,177.99,182.23,180.76,178.39,176,179.43,178.47,181,182.09,183.98,184.17,185.36,185.07,185.61,182.87,182.76,184.04,182.64,181.64,182.59,185.63,185.46,184.88,185.55,187.74,187.74,190.45,190.27,190.55,191.35,192.83,192.79,193.43,192.64,194.77,195.48,194.44,193.12,194.91,193.12,195.23,195.58,195.54,195.37,196.69,195.28,195.81,194.5,194.64,196.23,197.68,195.62,193.92,189.76,192.07,194.93,194.44,192.78,192.22,194.25,194.09,196.02,195.6,195.97,196.2,196.35,196.35,196.25,196.53,195.82,197.55,197.39,197.43,197.07,197.99,198.37,198.73,198.33,197.26,197.18,194.59,197.31,198.32,198.11,199.26,199.92,200.39,200.44,200.71,201.76,203.27,203.27,202.86,203.54,201.8,204.07,204.78,204.06,204.3,203.63,202.09,198.89,201.9,203.57,203.98,206.05,206.54,205.56,205.53,206.39,205.27,204.9,206.58,205.62,206.86,207.2,207.01,207.21,207.48,208.34,208.67,209.22,207.74,205.51,205.77,207.44,209.21,209.52,209.99,208.77,210.6,211.51,211.23,211.29,211.89,211.82,211.82,211.1,210.82,209.85,208.23,208.71,207.51,209.27,208.94,207.04,203.52,203.36,205.29,207.78,208.09,207.51,203.28,203.6,201.18,203.49,200.85,202.96,203.79,205.48,205.09,203.68,203.19,203.81,207.28,208.83,209.53,211.08,211.86,212.49,212.26,213.27,213.66,212.58,214.67,215.09,215.48,216.27,217.67,218.58,219.39,219.59,218.82,217.02,217.14,218.71,218.7,219.55,218.98,219.72,219.41,218.71,219.07,219.58,219.58,214.59,217.42,213.3,210.78,213.77,211.96,214.45,218.89,219.56,217.99,220.07,218.06,216.43,219.97,218.04,215.8,213.34,217.14,219.35,220.71,220.71,223.77,223.54,223.85,223.18,222.6,224.02,223.88,219.53,219.32,218.43,218.12,220.12,220.74,217.59,217.77,217.77,213.77,211.7,209.36,205.4,205.97,203.46,203.16,202.06,206.98,210.89,212.34,214.34,209.11,210.19,209.41,211.17,214.24,210.36,206.37,205.57,208.82,209,204.57,203.11,203.11,201.05,197.35,200.3,204.78,204.28,201.12,204.87,203.79,202.17,196.21,194.79,199.79,198.94,196.36,194.9,199.07,203.53,206.04,208.44,208.35,210.71,208.12,211.11,212.18,213.69,216.31,214.95,211.59,212.31,214.03,211.34,209.29,210.18,209.62,206.08,205.38,207.67,205.15,205.15,205.11,208.4,208.27,205.2,199.51,200.64,195,195.41,200.24,192.98,194.07,195.01,200.83,193.67,192.58,186.41,186.86,183.79,183.55,187.93,187.19,190.96,183.25,182.18,182.21,185.59,184.08,185.82,189.52,194.21,194.21,192.99,191.54,195.07,191.88,192.49,194.32,192.22,187.65,182.18,175.12,174.46,177.01,171.25,171.63,171.63,175.83,175.6,177.27,182.69,182.15,178.48,178.35,176.79,178.66,178.66,178.94,179.58,182.27,182.12,180.02,178.35,177.56,177.02,180.42,178.91,183.86,184.94,186.77,185.02,185.27,183.13,187.92,190.2,192.9,192.36,191.07,194.06,193.91,193.6,193.36,192.53,196.63,196.49,199.9,200.69,201.07,199.61,200.07,197.49,193.26,192.83,193.39,196.11,189.51,188.24,186.17,184.71,185.27,183.28,183.28,182.53,185.87,187.1,189.96,191.97,183.67,184.29,182.21,180.9,182.14,180.09,177,175.51,172.49,170.7,170.34,173.69,170.02,167.46,171.8,177.05,176.69,174.88,169.99,168.71,167.61,167.06,171.4,167.34,171.77,173.74,172.58,171.21,175.27,177.35,180.23,178.9,177.81,182.19,180.84,180.09,175.59,173.73,176.1,177.79,178.79,175.07,184.78,186.48,184.82,186.43,184.89,184.32,185.2,184.48,186.98,188.09,188.09,188.03,185.13,184.84,190.56,190.39,190.16,186.76,184.07,183.73,185.11,183.75,186.37,187.73,186.6,181.95,179.92,178.3,178.48,181.14,178.52,179.57,179.57,178.84,176.69,179.78,179.32,179.32,178.6,179.95,177.85,181.91,181.77,183.04,185.4,186.03,186.77,186.77,186.39,183.49,182.09,185.54,187.74,187.61,187.57,189.64,190.11,187.64,190.39,192.38,195.21,193.19,192,194.47,192.32,190.62,191.04,193.23,193.17,193.71,191.04,190.51,190.51,186.69,186.4,187.39,185.42,185.99,185.42,184.54,185.94,188.95,189.08,186.18,186.44,183,180.35,180.08,183.05,181.77,184.96,182.92,184.55,186.95,183.87,184.42,185.46,185.77,185.47,188.11,189.19,191.92,192.63,191.51,191.04,191.72,191.72,191.91,191.9,191.11,193.64,193.24,193.88,194.05,194.03,192.88,193.05,193.21,190.16,189.43,193.14,194.73,194.65,192.4,191.05,189.67,193.18,193.27,192.38,193.24,192.92,192.61,193.18,191.95,194.23,196.06,195.78,195.81,193.61,192.2,193.88,196.41,196.41,196.41,195.21,197.14,200,199.6,200.07,199.31,200.54,200.77,202.64,204.05,204.22,206.7,205.94,205.94,204.97,203.89,204.65,203.08,202.17,204.49,204.42,205.33,207.85,208.09,208.09,207.68,206.04,205.45,205.94,207.33,208.87,210.64,210.42,211.23,212.73,213.24,211.8,211.86,212.72,213.32,213.28,211.91,214.01,214.32,213.75,210.79,210.25,209.14,211.03,210.14,208.66,208.71,208.49,209.69,207.26,205.7,204.11,204.08,205.49,204.91,207.18,204.39,205.76,207.05,210.06,210.86,210.52,210.9,210.9,210.02,208.55,207.88,208.18,209.58,208.39,208.65,210.4,207.85,208,207.55,205.6,202.23,201.76,202.57,199.59,199.64,200.81,200.27,200.28,197.53,199.13,198.87,201.22,202.49,203.55,204.42,203.14,202.12,204.26,204.24,201.51,199.8,197.28,196.95,198.38,195.54,193.22,192.3,194.61,195.87,197.92,201.66,203.55,203.91,204.49,204.69,203.04,206.21,206.04,209.97,210.3,210.55,210.82,212.38,211.95,212.81,212.81,212.94,212.52,212.73,212.53,213.33,214.59,213.43,213.3,212.47,214.16,215.04,215.88,216.88,219.84,220.42,220.4,221.4,222.7,219.43,221.69,222.06,222.06,223,223.32,223.4,222.77,221.51,219.73,218.98,219.38,222.47,222.15,223.4,223.25,223.42,223.42,222.59,221.34,223.29,226.04,226.53,227.19,227.38,228.58,228.43,230.15,230.01,226.31,229.14,231.59,230.85,231.38,233.29,233.42,234.76,234.54,231.33,233.55,234.91,233.78,233.78,232.37,232.67,237.58,237.67,236.77,237.17,236.78,238.01,239.92,239.63,237.19,238.41,240.87,239.3,239.03,241.7,241.24,240.55,238.99,240.5,241.86,244.01,244.8,244.46,243.71,243.03,245.12,245.4,245.4,244.9,243.13,243.4,240.39,243.06,242.97,243.32,241.02,242.82,239.28,236.41,235.92,234.56,234.04,231.99,234.01,236.81,236.86,235.78,238.19,238.94,235.19,234.38,236.52,239.49,241.96,242.28,242.28,243.52,243.92,243.86,245.04,247.91,247.39,247.68,247.91,248.53,247.86,246.03,247.75,247.75,247.81,245.99,244.52,246.48,246.75,247.12,250.05,250,249.72,250.37,251.05,253.18,253.78,253.68,255.62,256.26,256.26,255.62,255.22,254.44,255.44,255.84,256.07,255.02,255.71,257.29,258.6,258.6,260.01,260.27,260.47,263.12,260.82,262.26,263,264.68,260.99,258.95,257.1,259.88,259.47,253.47,252.16,254.96,255.17,253.9,257.91,254.38,249.7,242.22,244.73,242.84,248.43,249.59,249.6,253.81,254.78,258.89,259.4,261.93,261.41,262.51,260.17,263.16,262.33,262.75,261.18,261.16,263.8,263.8,258.22,257.81,257.03,252.59,255.52,256.66,259.4,261.34,262.76,263.09,263.16,262.39,266.85,266.33,267.08,267.75,267.25,268.33,267.99,269.13,266.62,266.66,266.21,268.6,266.02,268.6,270.51,269.95,271.58,273.68,271.59,272.86,272.82,273.9,273.4,273.27,270.76,271.34,271.26,271.98,272.42,271.52,266.47,267.56,266.8,270.08,276.91,278.97,280.01,280.29,279.47,279.54,277.85,274.18,275.25,276.34,276.35,277.83,278.79,279.63,281.23,280.16,280.16,281.73,282.42,282.55,284.26,283.73,284.44,282.69,281.85,284.15,282.62,282.61,283.68,282.59,274.25,274.01,276.99,279.01,282.09,282.09,281.98,278.86,275.88,274.69,274.08,277.54,279.07,275.97,276.4,276.4,272.14,272.57,272.89,277.88,277.3,280.07,280.07,282.52,284.26,285.77,284.95,280.8,283.38,282.06,283.55,282.11,279.97,281.99,283.09,284.12,281.44,283.32,283.42,282.65,285.6,285.58,285.58,286.27,286.95,285.71,280.84,279.44,278.13,278.17,273.76,278.1,273.2,269.86,272.87,268.01,269.49,262.22,260.24,261.51,257.88,263.36,265.05,262.23,265.06,264.48,264.7,269.37,269.79,266.78,265.9,260.65,262.09,263.08,264.86,252.04,236.98,236.43,232.71,254.86,246.04,250.49,252.48,252.04,246.39,246.72,246.72,240.91,246.96,251.07,256.16,258.05,258.21,259.71,260.1,261.73,265.59,263.89,261.86,263,264.53,264.34,272.95,274.92,275.21,276.34,278.28,278.52,277.44,272.96,272.84,271.01,271.01,276.56,275.02,276.12,276.1,277.23,278.84,278.86,277.39,280.24,280.5,282.03,281.26,282.34,279.15,281.77,279.41,279.33,279.33,278.72,281.4,284.53,284.53,286.81,288.3,289.79,289.47,290.84,293.27,293.27,290.96,290.75,292.52,293.32,292.35,292.76,291.61,292.54,294.11,294.08,294.49,294.68,296.98,297.19,298.37,298.43,297.54,297.17,296.07,291.34,295.63,294.2,296.34,296.1,298.41,297.66,301.04,302.01,302.1,301.23,301.2,299.43,298.71,297.51,302.03,300.74,301.98,302.71,303.66,301.72,301.72,299.63,301.16,303.67,302.71,303.35,304.16,305.07,307.66,307.51,308.96,308.56,308.26,309.74,311.25,312.62,310.9,310.02,308.46,310.29,311.1,312.38,313.44,313.63,313.65,314.8,313.6,315.42,314.55,306.03,310.8,310.31,311.56,309.6,311.23,314.56,314.57,312.89,314.71,317.2,321.1,321.83,321.82,318.63,319.46,320.01,316.26,317.41,313.86,314.26,319.1,319.76,319.96,314.67,314.51,311.63,309.05,310.21,305.38,308.38,313.15,315.99,318.17,318.17,319.88,318.17,318.96,319.91,320.25,320.87,319.76,319.48,321.63,322.3,318.87,318.36,317.6,313.92,316.41,319.2,321.25,322.71,323.75,323.75,323.65,322.52,322.08,319.71,320.32,322.35,324.35,323.23,323.26,325.35,325.86,325.23,323.5,324.33,324.12,324.12,317.44,321.12,322.88,322.98,324.6,325.93,325.9,325.48,324.08,325.83,323.09,321.45,317.51,323.76,325.28,324.21,324.19,319.11,319.27,319.27,319.6,321.38,320.48,322.7,319.35,321.79,324.41,322.67,321.27,321.4,318.36,320.83,319.02,314.78,317.4,316.72,316.45,311.64,309.75,312.89,313.67,309.4,308.55,303.88,307.36,306.21,307.87,302.51,297.45,296.27,304.91,307.09,307.44,307.44,308.8,309.03,316.78,318.74,318.37,321.61,325.4,328,328.85,332.81,332.02,329.92,333.37,331.99,334.64,335.05,333.41,333.27,336.69,337.67,336.3,339.03,343.98,342.67,345.56,346.21,345.65,347.67,350.34,346,345.75,343.44,347.15,347.74,349.04,349.04,351.17,351.23,353.25,354.02,354.95,355.4,352.78,354.22,344.85,345.87,344.98,339.4,345.34,347.08,352.81,350.81,346.55,350.3,350.3,349.01,343.99,343.66,343.62,343.46,347.5,350.25,349.49,349.49,349.49,352.03,350.46,349.47,352.32,353.8,350.99,352.31,353.66,351.85,348.3,347.63,350.71,350.23,345.99,346.17,346.22,346.95,341.69,347.36,349.8,354.97,361.32,360.72,360.08,362.31,362.1,360.94,361.88,364.24,363.62,361.72,359.23,359.99,356.87,358.42,357.42,358.56,358.48,361.07,360.17,358.97,356.42,358.06,361.85,360.49,360.49,358.38,356.65,354.56,357.61,355.88,354.28,352.7,356.71,357.31,362.64,362.64,359.9,359.81,361.65,358.86,358.26,357.35,358.05,360.68,363.07,365.17,364.37,362.67,364.83,364.63,364.54,360.5,361.68,357.72,359.19,360.21,360.21],"SK하이닉스":[null,100,98.05,100.24,104.76,105.01,103.66,100.12,102.56,100.12,100.49,100.61,101.34,101.34,96.83,100.12,97.31,96.95,96.95,99.76,102.32,102.56,99.51,104.27,105.13,104.15,104.03,104.03,103.54,104.76,107.94,108.42,108.42,110.38,110.5,112.94,111.11,110.62,109.77,111.97,111.36,113.31,110.26,110.26,109.89,111.11,113.06,111.48,111.48,110.74,109.16,109.16,111.84,115.38,113.55,114.65,117.22,121,121.49,126.01,123.57,122.83,120.39,120.39,119.29,121.12,120.02,124.05,126.01,126.25,130.16,130.16,130.16,131.14,131.87,128.94,131.14,131.14,130.16,133.33,128.69,122.1,123.81,118.32,116.97,121.12,123.08,121.86,124.3,123.57,122.59,116,112.33,114.04,114.04,116.48,115.02,120.51,119.17,117.22,117.22,120.15,124.54,122.83,119.17,120.02,114.16,116.24,116.12,118.8,118.32,120.88,123.81,124.05,125.27,124.3,123.32,126.5,124.54,122.83,120.63,121.61,119.66,119.29,119.66,121.49,121.61,120.15,122.59,121.73,125.52,126.98,127.96,127.96,131.14,130.89,131.87,131.87,135.29,135.29,136.51,136.51,138.95,138.95,135.78,137.73,135.04,135.78,135.04,133.58,136.02,132.36,136.75,134.55,136.26,136.26,139.44,141.39,140.17,139.19,137.73,139.44,137,137,137.97,138.46,142.37,140.42,143.59,144.81,147.99,147.74,153.36,156.29,158.24,158.73,158.73,164.84,168.99,164.1,167.28,164.59,161.9,160.68,166.06,166.3,162.64,164.35,168.5,168.25,172.41,173.63,173.87,172.89,173.38,174.11,173.87,178.27,171.92,163.13,167.03,157.75,161.17,159.95,166.06,159.95,156.29,156.53,161.9,156.78,157.26,149.94,158.97,158.97,161.42,162.15,163.61,164.1,166.54,166.06,166.3,167.03,165.81,165.08,167.28,167.52,167.77,166.3,170.7,175.09,174.36,177.29,180.22,182.42,184.86,187.55,188.52,194.63,193.41,197.07,202.93,202.93,210.74,210.74,201.22,203.17,202.44,202.44,202.44,202.44,202.44,202.44,202.44,216.61,217.58,216.12,210.26,205.62,203.91,197.56,192.92,198.29,206.84,199.76,199.51,192.19,191.45,194.87,200.73,208.3,203.66,206.11,203.91,201.22,203.17,201.22,200.24,200.98,203.66,200.24,201.47,202.69,200.49,207.57,211.97,206.84,207.81,202.93,201.71,201.22,187.55,189.01,193.16,190.23,189.26,185.59,192.19,192.19,189.99,187.55,185.59,184.86,188.52,195.85,195.85,188.03,187.3,187.3,180.71,183.39,186.81,186.81,187.06,189.74,188.28,193.65,190.96,187.79,178.02,177.29,181.68,177.53,181.68,180.95,183.64,179,173.63,174.11,176.8,185.1,184.37,183.88,178.51,179.49,181.68,176.31,171.43,171.43,173.63,180.46,179.24,181.93,189.74,189.5,189.5,189.5,186.81,184.37,187.79,185.35,188.77,189.26,192.19,187.55,187.55,189.01,191.21,201.22,201.95,203.91,203.42,207.33,219.78,221.49,218.8,219.29,219.54,218.8,215.87,216.36,202.93,205.13,198.78,196.09,196.09,198.53,198.53,199.76,196.34,202.44,196.09,196.83,196.34,198.29,205.13,205.62,205.13,202.2,206.59,214.65,206.11,206.11,200.49,201.22,211.23,212.7,206.35,206.35,202.93,202.44,202.69,202.69,203.91,203.66,209.52,210.26,208.55,206.59,212.45,211.72,214.65,217.58,217.58,232.72,231.01,232.48,230.77,231.5,231.99,228.08,223.2,219.29,222.22,222.22,221.98,215.87,217.83,215.87,215.87,210.74,212.45,205.13,205.37,214.41,216.12,218.56,207.08,205.86,208.06,203.91,209.28,204.4,210.26,207.57,210.5,208.3,213.92,213.19,211.97,209.04,216.85,218.07,216.36,218.07,220.51,214.65,199.51,204.15,196.58,202.93,210.26,209.77,210.74,209.04,203.17,203.42,193.89,197.07,194.87,190.48,183.39,184.13,185.35,185.35,182.42,181.93,182.42,191.45,194.87,198.05,199.76,203.91,201.22,202.2,201.95,202.69,196.83,198.29,195.36,192.43,185.35,186.81,187.06,183.39,181.93,189.74,188.52,190.48,192.43,193.16,187.3,187.3,187.3,187.3,183.15,178.51,179.98,175.09,175.09,170.94,171.67,173.87,173.87,171.67,168.5,176.8,171.67,170.21,171.92,167.77,172.89,170.94,168.74,162.88,158,163.61,163.13,166.54,166.54,166.79,177.29,172.16,171.18,172.89,178.02,178.02,181.93,175.58,171.92,175.34,171.18,170.45,164.84,166.3,169.23,169.23,173.14,172.89,175.58,174.6,169.96,172.16,168.5,166.54,161.17,163.13,159.95,158.49,161.66,159.95,150.92,151.89,149.21,147.25,143.1,146.52,147.5,147.5,146.76,150.43,147.74,147.74,147.99,140.9,142.37,143.35,144.57,155.31,159.46,158.97,151.65,156.29,158.24,158.49,157.75,163.61,162.64,163.13,172.16,182.17,175.34,179.24,185.35,180.46,185.35,185.35,185.35,185.35,187.3,179.49,180.95,185.35,186.08,189.01,180.22,182.42,179.98,184.86,187.3,187.3,184.13,183.64,179.98,170.94,170.94,171.18,170.21,166.3,166.3,162.88,162.64,165.32,163.13,164.35,166.3,165.57,166.06,172.16,185.35,185.84,178.02,177.53,179.24,176.56,181.2,187.06,186.57,195.12,191.45,192.92,190.23,189.99,191.94,191.45,190.72,194.63,196.34,195.85,193.41,199.76,196.58,197.8,191.7,195.85,191.94,195.36,192.92,192.92,197.07,196.34,196.34,195.12,196.09,185.59,181.68,179.49,182.17,181.93,175.58,174.85,173.14,171.67,168.25,166.06,165.08,163.37,160.93,161.42,160.93,159.46,162.64,158.97,158.97,158.97,159.71,163.13,164.1,160.44,155.07,154.09,155.56,154.82,164.1,164.35,160.93,163.37,162.88,168.25,171.43,169.72,170.94,174.36,168.74,171.43,167.03,164.59,170.45,178.02,184.37,182.42,186.08,185.84,182.17,182.42,187.55,191.45,192.43,189.5,193.41,194.87,188.03,192.67,187.79,189.74,185.84,184.13,175.82,179,176.56,179,181.93,181.93,187.79,187.79,186.57,183.39,186.57,185.1,180.22,181.68,175.34,178.27,179,179,189.01,189.5,188.03,195.36,202.69,200,205.86,202.93,201.71,201.71,201.71,194.14,193.89,195.85,201.95,200.73,202.2,203.66,200,203.42,198.78,200.73,200.24,194.14,194.14,196.09,196.09,197.56,197.56,192.92,195.36,196.58,198.29,201.22,197.8,189.01,189.26,193.16,189.74,195.36,202.44,202.44,202.69,199.02,200.24,202.93,206.84,207.81,203.91,204.15,200.98,198.53,203.17,203.66,203.66,208.06,208.79,208.3,201.95,197.56,199.51,199.51,200.98,201.95,202.2,197.56,196.58,192.19,189.74,192.43,196.83,197.07,197.07,196.83,203.66,214.65,216.36,226.62,227.11,228.57,231.99,231.01,229.06,229.06,231.5,234.43,229.79,229.79,231.26,230.77,230.28,229.55,237.85,241.76,241.51,245.42,245.42,239.8,242.25,241.76,243.96,242.49,246.64,241.03,241.03,241.03,235.16,239.07,229.55,228.33,231.26,237.12,238.58,245.42,242.49,241.27,243.71,244.2,249.08,255.19,256.41,249.08,252.75,253.97,251.53,242.98,239.32,231.01,226.62,214.65,224.91,226.62,230.28,231.75,226.13,226.13,217.58,208.79,202.2,201.47,196.83,196.34,178.51,168.5,182.66,169.47,192.19,206.35,197.07,203.42,204.4,203.42,191.45,195.36,194.38,202.93,209.52,206.35,207.57,205.37,198.78,200.98,200.98,198.53,205.37,200.24,198.53,204.88,201.71,198.78,201.71,203.66,204.4,204.4,204.4,197.8,197.8,201.22,201.22,207.57,206.35,209.28,204.15,196.83,200,198.05,201.95,205.37,203.66,198.53,198.78,200,198.78,204.88,199.02,204.15,203.42,216.61,214.16,220.76,222.22,219.29,221.73,216.12,208.06,200.24,208.55,211.97,210.5,208.55,207.33,205.37,210.01,205.86,206.59,204.15,207.81,208.3,206.11,208.55,210.01,207.08,204.4,202.69,202.2,202.69,202.44,202.69,201.95,202.44,200.73,205.37,203.17,201.22,204.4,202.2,202.93,203.17,208.3,202.2,199.76,199.27,197.07,198.05,196.83,198.78,198.53,197.8,197.07,195.85,195.85,190.72,183.15,175.34,181.93,184.37,188.03,192.43,193.16,189.99,183.39,183.64,184.37,192.19,192.19,191.45,193.89,188.77,187.06,191.45,195.36,200,199.02,200.73,204.4,206.35,198.53,204.15,205.86,202.44,201.47,205.13,205.13,205.13,205.13,203.17,202.69,203.66,202.44,202.44,208.79,215.38,211.23,212.7,208.3,211.72,208.06,204.64,203.42,204.88,203.17,201.71,202.44,199.51,195.12,194.38,198.78,203.17,210.26,210.74,210.01,211.23,212.45,215.14,219.05,239.32,239.56,239.32,239.8,236.39,244.2,240.78,237.36,242.74,241.27,238.1,245.42,266.18,272.28,280.83,288.16,280.83,294.26,284.49,282.05,285.71,286.94,286.94,291.82,289.38,283.27,274.73,283.27,288.16,288.16,282.05,283.27,289.38,289.38,307.69,318.68,319.9,328.45,337,324.79,315.02,324.79,318.68,311.36,317.46,318.68,318.68,321.12,313.8,329.67,315.02,313.8,300.37,299.15,305.25,317.46,317.46,305.25,311.36,305.25,306.47,307.69,307.69,307.69,322.34,323.57,317.46,307.69,324.79,333.33,338.22,332.11,362.64,345.54,345.54,352.87,358.97,346.76,341.88,330.89,333.33,324.79,334.55,341.88,333.33,343.1,341.88,346.76,337,337,329.67,326.01,324.79,329.67,322.34,328.45,323.57,343.1,344.32,349.21,349.21,350.43,351.65,341.88,335.78,340.66,334.55,335.78,335.78,337,338.22,323.57,324.79,323.57,321.12,329.67,317.46,317.46,312.58,321.12,322.34,322.34,315.02,316.24,317.46,300.37,291.82,286.94,289.38,286.94,295.48,295.48,299.15,299.15,291.82,300.37,300.37,306.47,305.25,310.13,313.8,307.69,315.02,313.8,313.8,311.36,299.15,300.37,312.58,310.13,313.8,316.24,308.91,304.03,297.92,297.92,302.81,307.69,313.8,307.69,305.25,311.36,304.03,299.15,300.37,305.25,301.59,296.7,291.82,293.04,300.37,301.59,301.59,296.7,290.6,289.38,285.71,291.82,289.38,285.71,283.27,278.39,278.39,274.73,283.27,293.04,295.48,293.04,288.16,283.27,274.73,257.63,245.42,247.86,247.86,247.86,253.97,250.31,250.31,251.53,256.41,252.75,253.97,252.75,252.75,260.07,263.74,260.07,261.29,258.85,255.19,258.85,251.53,256.41,260.07,262.52,262.52,253.97,261.29,261.29,261.29,261.29,257.63,253.97,255.19,252.75,244.2,251.53,244.2,244.2,239.07,235.65,233.7,229.55,229.55,223.44,224.66,229.06,240.29,237.12,238.58,239.07,235.16,240.54,244.2,249.08,247.86,260.07,251.53,260.07,262.52,257.63,258.85,261.29,262.52,266.18,264.96,262.52,260.07,271.06,273.5,269.84,268.62,272.28,291.82,290.6,291.82,286.94,282.05,283.27,278.39,284.49,293.04,288.16,289.38,296.7,293.04,301.59,294.26,296.7,295.48,301.59,302.81,297.92,294.26,304.03,310.13,311.36,312.58,307.69,311.36,310.13,319.9,319.9,319.9,313.8,306.47,305.25,310.13,304.03,312.58,313.8,316.24,313.8,310.13,308.91,310.13,305.25,290.6,290.6,288.16,288.16,277.17,294.26,294.26,294.26,294.26,302.81,304.03,300.37,300.37,300.37,316.24,322.34,323.57,310.13,318.68,324.79,321.12,321.12,321.12,321.12,299.15,300.37,300.37,300.37,305.25,315.02,315.02,291.82,288.16,288.16,288.16,288.16,283.27,283.27,283.27,283.27,302.81,302.81,301.59,301.59,294.26,288.16,288.16,293.04,295.48,288.16,283.27,285.71,284.49,275.95,277.17,273.5,272.28,271.06,275.95,268.62,263.74,266.18,274.73,274.73,275.95,269.84,263.74,271.06,264.96,267.4,274.73,269.84,268.62,267.4,267.4,262.52,262.52,268.62,269.84,266.18,274.73,269.84,274.73,277.17,271.06,274.73,275.95,264.96,263.74,251.53,258.85,261.29,263.74,263.74,261.29,261.29,261.29,253.97,258.85,257.63,252.75,241.76,242,239.07,237.85,235.41,230.77,232.48,225.15,220.27,223.69,231.99,232.72,229.55,222.22,213.68,217.58,225.89,224.91,229.3,231.5,228.82,227.84,229.55,229.55,241.03,246.64,244.2,249.08,250.31,244.2,244.2,245.42,244.2,242.74,239.07,237.12,235.65,238.1,238.1,240.54,235.16,232.23,224.18,227.84,227.84,227.84,236.14,237.12,233.7,235.41,232.48,228.57,227.59,229.79,232.23,225.89,227.59,232.48,225.64,223.93,222.47,224.18,220.76,220.76,220.76,220.76,231.5,227.11,224.66,222.71,219.78,214.9,214.9,210.01,203.91,201.47,200.24,198.29,197.31,202.93,202.93,210.5,219.29,219.54,222.71,222.71,220.27,229.55,231.75,233.21,232.48,233.94,226.86,220.27,221,224.18,228.33,229.3,219.78,203.66,201.95,204.88,206.35,201.95,206.35,211.23,214.16,217.83,217.58,228.33,221.98,223.69,223.44,214.16,215.87,210.74,208.06,208.06,212.21,207.81,202.93,204.4,207.57,206.84,200,197.8,197.8,192.67,192.43,199.02,198.05,200.98,199.76,195.85,191.45,192.92,191.21,190.48,193.41,189.99,188.03,188.03,185.59,183.15,183.15,184.86,184.62,197.8,198.78,202.93,210.01,211.23,213.19,211.97,209.28,209.52,210.01,207.81,208.79,213.92,213.92,213.92,223.2,223.2,223.44,221.49,216.12,223.2,223.2,225.15,217.58,221.73,231.75,231.75,228.33,221.25,228.08,223.93,226.86,224.66,225.89,222.71,217.58,226.37,222.22,219.78,218.32,218.32,215.14,213.19,219.05,217.09,211.97,209.04,203.42,205.86,198.05,193.16,192.92,205.13,204.4,204.15,212.21,216.12,213.19,208.79,215.87,212.21,216.85,216.36,212.94,206.35,206.59,204.64,217.58,221.49,224.18,220.51,216.61,218.07,216.12,213.92,215.38,214.16,217.58,212.94,208.79,213.43,216.85,218.56,218.56,220.27,219.29,216.61,216.61,216.61,213.19,212.21,210.74,212.94,210.99,220.76,224.42,228.57,237.61,239.8,239.07,238.58,252.75,266.67,266.67,269.35,265.2,269.35,269.35,265.45,265.45,263.74,267.89,281.81,280.34,291.82,290.11,290.6,290.35,280.34,283.52,281.07,278.39,277.41,277.17,275.95,279.12,283.76,281.32,287.18,287.91,284.98,277.9,273.02,269.35,276.92,281.81,278.63,288.16,286.2,287.67,286.94,285.47,281.07,278.39,276.92,275.95,302.81,312.58,301.34,305.49,291.82,293.04,293.28,297.68,289.62,289.38,289.38,281.56,280.59,280.59,282.78,280.34,286.2,284.25,284.49,283.27,295.24,284.49,283.03,289.62,291.58,297.44,293.04,291.09,291.58,288.64,289.38,277.66,283.03,284.98,289.38,298.41,298.9,290.6,291.09,288.16,284.49,286.45,285.71,280.83,280.1,280.1,280.1,280.1,280.1,281.81,293.53,294.02,294.02,291.82,291.09,303.3,304.52,303.05,317.46,317.46,306.96,308.18,302.81,309.65,311.36,293.04,290.84,290.84,284,293.77,305.98,307.2,324.79,318.44,311.6,312.58,318.68,321.86,317.46,327.47,323.08,317.22,320.88,322.34,320.63,317.7,312.58,319.17,320.88,318.44,326.98,323.81,320.15,307.45,306.72,306.72,311.36,314.77,319.9,320.39,333.82,341.88,341.88,337.48,343.1,343.1,343.35,343.35,344.08,342.86,345.54,345.54,347.74,334.07,333.09,335.78,332.11,335.53,326.01,332.11,327.47,327.47,322.59,319.9,332.6,345.05,348.23,343.83,345.54,335.53,332.11,329.67,334.31,328.94,324.05,329.43,323.08,337,337,348.72,348.72,348.72,366.3,363.13,363.61,358.49,369.47,365.32,363.86,382.17,394.14,395.12,375.58,385.84,381.44,381.44,406.59,404.88,397.8,402.69,419.78,406.84,404.64,399.51,395.36,393.65,401.22,391.21,382.17,415.14,414.65,413.68,431.26,442.49,435.16,446.89,452.99,454.95,437.61,459.1,446.4,442.49,446.64,446.64,460.07,457.63,459.58,437.36,436.39,445.18,423.2,419.05,417.58,439.07,416.61,434.19,429.55,425.4,425.4,423.93,422.95,422.95,438.58,434.68,428.33,439.32,448.84,452.5,452.5,471.31,463.74,464.22,468.86,482.78,488.4,484.98,492.06,494.51,494.51,477.9,462.03,474.24,472.04,473.02,473.02,506.72,507.94,518.93,525.03,542.12,539.68,544.57,572.65,570.21,579.98,571.43,544.57,549.45,578.75,577.53,577.53,575.09,566.54,576.31,561.66,576.31,570.21,582.42,583.64,588.52,568.99,561.66,568.99,538.46,518.93,511.6,500.61,500.61,509.16,463.98,468.38,477.66,461.29,475.21,472.04,422.95,381.2,399.76,413.43,399.02,418.8,432.23,444.2,455.92,455.92,487.67,473.5,487.67,470.33,466.67,452.99,438.58,427.35,437.85,414.41,424.18,424.91,410.99,378.02,389.26,381.93,383.39,379.73,383.88,412.21,397.56,397.56,397.56,397.56,373.14,383.64,395.6,399.27,403.66,441.76,448.84,426.37,426.37,412.94,412.94,425.15,451.53,434.68,434.68,455.92,454.21,454.21,471.06,460.81,478.63,457.39,466.18,458.61,478.63,484,490.84,478.63,464.71,476.19,454.95,444.93,473.75,471.79,478.14,478.14,489.62,470.33,453.72,446.64,422.47,435.16,419.29,416.61,416.61,412.21,431.5,432.23,432.48,410.99,393.41,390.48,387.79,402.69,410.26,422.47,408.06,412.45,416.12,419.54,430.04,428.57,437.85,449.33,448.11,427.35,411.48,414.16,411.48,411.48,415.38,426.13,424.66,424.66,418.07,444.2,487.91,476.19,475.46,500.61,496.95,474.48,476.19,484,512.82,523.81,517.7,532.36,550.67,536.02,539.68,539.68,539.68,539.68,539.68,486.45,466.18,466.67,485.47,496.95,495.73,483.76,487.67,485.71,509.16,512.82,517.7,512.82,533.58,517.7,511.6,500.61,489.62,495.73,486.45,464.47,464.47,454.46,471.55,469.84,469.84,458.85,458.61,485.71,487.67,499.39,503.05,495.73,501.83,512.82,526.25,516.48,507.94,522.59,505.49,486.69,465.69,481.07,483.27,475.21,444.93,402.44,413.92,402.93,447.37,441.51,440.05,441.03,424.91,427.35,427.35,431.26,424.42,442,435.41,450.31,444.44,441.51,433.46,433.46,454.21,454.21,454.21,465.93,464.71,464.22,476.19,484.74,503.05,489.62,499.39,486.94,493.28,489.62,480.83,488.4,495.73,494.51,507.94,517.7,499.39,506.72,506.72,531.14,548.23,548.23,559.22,562.88,586.08,575.09,575.09,605.62,608.06,601.95,600.73,627.59,633.7,680.1,698.41,715.51,693.53,713.06,697.19,681.32,680.1,660.56,661.78,688.64,686.2,725.27,719.17,732.6,728.94,722.83,658.12,656.9,665.45,655.68,656.9,658.12,649.57,639.8,641.03,643.47,667.89,630.04,630.04,643.47,631.26,639.8,626.37,652.01,656.9,678.88,675.21,675.21,653.24,642.25,623.93,598.29,612.94,633.7,638.58,634.92,655.68,656.9,625.15,636.14,641.03,648.35,667.89,676.43,703.3,742.37,749.69,802.2,808.3,849.82,814.41,868.13,868.13,857.14,881.56,873.02,870.57,821.73,852.26,848.6,879.12,965.81,965.81,965.81,965.81,965.81,965.81,1045.18,1013.43,1004.88,1031.75,1105.01,1136.75,1185.59,1169.72,1175.82,1168.5,1245.42,1306.47,1272.28,1362.64,1387.06,1365.08,1514.04,1431.01,1413.92,1448.11,1416.36,1479.85,1511.6,1506.72,1494.51,1367.52,1479.85,1391.94,1372.41,1394.38,1272.28,1269.84,1267.4,1279.61,1328.45,1294.26,1313.8,1362.64,1347.99,1323.57,1328.45,1409.04,1382.17,1433.46,1379.73,1394.38,1352.87,1294.26,1345.54,1347.99,1335.78,1416.36,1426.13,1435.9,1435.9,1462.76,1562.88,1589.74,1589.74,1653.24,1699.63,1772.89,1811.97,1846.15,1816.85,1829.06,1802.2,1811.97,1829.06,1846.15,1865.69,1814.41,1807.08,1843.71,1873.02,1797.31,1953.6,2053.72,2102.56,2219.78,2026.86,2214.9,2197.8,2056.17,2048.84,2166.06,2139.19,2100.12,2168.5,2148.96,2148.96,2148.96,2148.96,2183.15,2317.46,2322.34,2454.21,2485.96,2683.76,2590.96,2590.96,2293.04,2073.26,2297.92,2256.41,2041.51,2290.6,2332.11,2271.06,2222.22,2378.51,2368.74,2578.75,2473.75,2459.1,2278.39,2407.81,2429.79,2278.39,2278.39,2131.87,1970.7,2190.48,2026.86,2139.19,2163.61,2236.87,2522.59,2437.12,2507.94,2539.68,2693.53,2774.11,2820.51,2754.58,2847.37,2989.01,2986.57,2991.45,2984.13,3155.07,3174.6,3157.51,3140.42,3140.42,3533.58,3533.58,3909.65,4039.07,4117.22,4590.96,4481.07,4825.4,4810.74,4442,4493.28,4261.29,4261.29,4737.48,4739.93,4739.93,5010.99,5477.41,5589.74,5697.19,5770.45,5763.13,5763.13,5611.72,5054.95,4666.67,5409.04,5001.22,5130.65,5250.31,5587.3,5816.85,6156.29,6556.78,6749.69,7128.21,6239.32,6400.49,7123.32,6527.47,6417.58,6471.31,6251.53,5340.66,5921.86,5721.61,5374.85,5069.6,5338.22,5323.57,4505.49,4671.55,5084.25,4498.17,4498.17,4307.69,4483.52,4468.86,4686.2,4295.48,4434.68,3785.1,3421.25,3228.33,4195.36,3826.62,3851.04,4073.26,3650.79,3472.53,3467.64,3479.85,3672.77,3890.11,4017.09,4017.09,4058.61,3663,4129.43,4224.66,4080.59,4097.68,4122.1,4224.66,4036.63,4087.91,4134.31,3938.95,3897.44,4021.98,4354.09,4378.51,4532.36,4525.03,4424.91,4144.08,4126.98,4295.48,4261.29,4534.8,4561.66,4493.28,4547.01,4547.01,4547.01,4317.46,4310.13,4337,4476.19,4495.73,4495.73,4329.67,4207.57,4105.01,4105.01,3919.41,3523.81,3465.2,3081.81,3106.23,3118.44,2986.57,3130.65],"마이크론 테크놀로지":[null,100,100.71,103.54,104.13,103.48,101.53,101.3,100.24,98.47,98.11,98.47,102.6,102.77,101.53,100.3,104.31,104.55,106.85,107.67,113.22,113.4,115.05,116.53,117.53,117.53,118.83,118,114.64,115.29,109.09,110.92,109.86,112.51,120.66,121.96,121.02,118.18,118.83,118.18,119.78,119.66,120.13,121.9,121.49,136.89,137.31,137.31,137.54,134.47,131.46,129.4,129.4,133.12,132,130.52,130.11,131.88,132.7,134.53,131.7,130.93,130.93,128.34,131.76,128.16,129.63,129.22,134.89,139.08,138.84,141.5,142.74,142.33,146.1,146.34,145.22,143.68,145.22,142.92,144.33,141.97,141.09,136.48,135.89,135.66,137.84,137.84,140.32,140.2,138.61,137.19,140.26,138.37,144.92,145.81,150.94,151.77,151.36,149.82,148.47,148.64,151.71,151,154.19,153.72,152.3,154.72,150.65,153.84,156.26,167.83,169.78,169.36,168.24,171.02,170.6,169.07,168.77,166.82,168.95,168.36,163.16,160.45,157.56,157.85,157.85,160.15,160.21,160.92,165.05,161.28,156.85,159.33,158.15,163.11,163.34,167,163.93,165.29,164.05,166.47,165.64,170.07,173.08,171.37,170.78,170.19,171.31,159.39,162.22,164.23,165.64,167,171.13,173.73,175.68,175.68,181.23,181.64,181.58,184.24,184.24,186.36,191.85,191.56,180.64,184.18,186.19,183.35,180.4,176.27,184.18,182,188.96,188.25,187.31,191.85,186.89,190.32,185.77,176.27,172.02,172.02,180.11,177.69,178.28,180.05,185.18,185.66,183.77,187.66,187.25,188.31,187.84,188.9,188.96,186.95,176.51,175.97,178.51,172.85,166,167.3,169.01,164.29,164.82,168.77,170.25,168.71,162.28,165.35,172.61,175.21,181.17,174.85,179.34,174.5,179.75,179.75,178.39,178.81,183.47,185.83,186.6,188.72,192.44,192.44,189.32,190.38,193.57,191.56,197.4,202.42,204.19,204.13,204.55,209.15,212.22,212.34,211.98,212.93,205.84,201.77,218.95,224.08,232.17,236.19,238.31,233.53,232.41,234.18,241.79,247.82,245.63,239.55,238.49,244.92,238.43,245.87,243.86,244.98,245.34,245.57,242.38,239.67,241.15,245.87,261.57,261.98,261.75,258.03,255.31,259.45,260.27,256.79,264.34,269.19,270.37,267.77,272.61,272.49,281.23,291.62,290.08,290.08,293.27,283.65,282.94,258.21,250.24,247.87,235.54,243.27,245.45,255.02,255.08,253.9,247.11,248.23,249.35,250.3,258.03,259.62,270.07,262.22,260.45,260.45,249.41,250.77,246.81,242.74,257.79,265.53,276.74,270.37,268.89,253.66,255.67,252.77,252.72,252.72,253.36,261.28,259.68,252.36,253.13,259.45,254.31,253.9,257.79,255.55,245.99,258.09,250.83,240.97,232.59,259.03,247.99,236.13,238.55,249.06,251.65,256.49,256.79,260.98,260.98,265.05,262.93,261.22,274.68,283.23,286.78,288.13,281.11,289.91,307.14,317.24,318.6,325.97,322.26,350.47,350.83,352.89,347.34,357.62,355.02,360.98,360.51,347.82,320.01,327.98,309.33,303.96,307.79,307.79,295.51,304.31,315.17,294.21,286.07,283.12,297.99,297.99,310.45,308.32,304.9,308.5,318.83,303.54,298.82,289.37,278.1,280.99,295.99,280.52,271.43,276.21,270.9,275.21,280.87,286.19,286.72,301.12,310.86,305.9,312.87,318.83,333.53,322.9,315.17,327.51,348.47,354.01,362.99,362.16,362.16,369.66,369.36,339.96,346.75,348.88,350.71,350.77,352.01,362.4,362.4,357.44,354.49,349.35,343.74,345.04,349.76,347.99,350.89,337.07,313.81,322.26,308.5,313.7,309.56,321.61,303.9,303.9,311.92,314.23,320.6,329.04,319.83,327.33,332.64,331.46,336.25,339.14,331.88,324.79,320.48,313.87,315.17,317.36,318.54,312.93,311.63,308.68,315.23,311.75,310.92,313.11,315.17,308.5,303.25,303.07,298.82,280.34,278.04,278.1,283.77,294.81,296.58,293.39,299.29,307.38,308.97,305.96,311.45,310.04,310.04,306.55,292.44,263.58,264.82,265.05,257.38,246.4,257.5,261.51,257.26,267.59,266,271.9,264.11,266.59,263.52,261.81,265.58,267,266.53,270.13,266.53,260.68,257.26,254.25,249.53,245.63,247.76,250.71,249.94,255.08,250,243.8,238.78,234.71,228.34,209.15,217.12,208.97,204.6,212.57,222.67,236.84,238.02,235.66,234.95,241.62,238.72,230.87,221.02,223.44,224.5,235.6,232.82,217.41,213.22,214.76,214.76,214.88,215.88,218.42,228.51,223.79,227.63,236.3,217.71,217.71,222.37,208.44,205.43,207.85,212.69,206.73,201.89,200,201.36,185.42,184.65,178.98,171.31,171.31,182.35,188.49,186.36,187.31,193.33,183,193.03,200.71,199.17,209.21,211.98,212.57,204.66,200.65,198.23,200,211.1,211.1,199.94,202.13,216,229.99,224.79,220.72,225.74,225.62,233.77,233,232.41,245.1,232.47,227.74,227.74,238.49,246.04,249.29,247.87,247.87,247.7,249.17,245.16,251.3,252.36,253.6,243.92,241.32,245.45,242.38,236.07,223.91,223.32,228.16,230.4,231.7,229.22,226.74,233.41,233.83,238.31,236.89,259.68,245.69,239.37,238.02,231.58,232.23,243.98,249.41,250.53,259.15,253.19,255.73,253.25,246.28,248.94,249.59,247.99,246.87,252.42,254.72,256.2,256.2,256.2,252.48,254.01,252.36,248.52,248.58,248.29,247.34,251.24,255.79,248.7,237.66,234.65,231.82,229.87,220.66,227.33,226.74,220.25,212.87,204.37,210.39,205.02,199.65,200.71,200.71,194.45,196.52,196.69,192.5,192.98,203.6,196.81,197.58,200.65,206.26,205.67,194.57,197.05,192.8,191.44,202.42,200.35,201.59,196.28,195.93,192.92,218.65,224.73,227.8,236.78,233.77,233.71,233.71,232.7,238.55,244.1,253.25,256.67,262.75,262.1,254.19,256.02,263.7,268.71,278.57,277.15,283.29,282,280.34,276.39,280.17,264.99,257.38,260.21,247.58,251.59,246.46,251.65,245.1,248.7,260.74,248.17,249.35,257.08,265.7,261.1,260.74,264.34,253.6,256.38,250.53,254.72,263.7,267.24,267.24,265.58,276.33,289.43,289.08,290.02,291.56,297.99,297.76,298.11,296.04,300.12,297.99,294.1,290.2,292.8,286.36,292.03,286.89,255.08,252.95,249.7,247.82,256.55,262.99,260.68,251.71,253.13,255.49,266.23,264.82,274.26,266.59,268.6,256.61,266.94,263.64,263.64,278.04,283.53,287.43,284,282.64,280.7,285.6,292.74,287.37,281.46,285.71,278.57,273.08,276.86,273.32,276.27,281.64,282.29,274.97,269.01,268.89,270.78,280.52,275.8,284.3,284.3,280.46,273.85,267,273.32,275.21,282.94,274.2,280.17,290.79,300.89,302.24,312.51,312.87,313.11,321.9,325.03,327.04,327.15,327.15,325.32,318.95,314.11,317.47,326.98,321.9,316.23,343.98,339.55,338.31,334.53,339.14,339.55,331.58,340.5,340.38,340.38,348.11,349.29,349.47,340.97,327.1,333.35,326.45,324.85,313.4,317.47,327.63,335.12,346.4,335.77,338.43,337.96,349.88,350.24,345.34,345.34,340.91,354.13,348.29,336.42,324.73,307.56,309.15,298.58,310.27,322.26,305.79,326.39,317.12,303.84,271.37,282.53,258.09,229.1,253.78,203.48,220.66,204.78,214.23,213.16,225.8,255.43,250.89,264.4,256.67,262.81,248.29,235.48,242.56,243.33,273.73,274.73,285.06,272.31,272.31,272.55,281.11,274.08,268.77,269.78,256.2,244.45,259.21,258.38,260.68,267.3,267.47,294.16,282.7,266,262.46,268.06,272.02,275.03,284.83,284.53,269.72,256.97,269.95,262.16,271.07,266.35,275.32,266.94,265.29,265.29,270.37,291.91,274.32,282.82,273.55,276.39,288.78,302.36,317.12,317,313.75,309.74,286.42,287.43,290.67,301.18,300.83,297.99,300.06,301.95,294.21,285.06,290.38,286.25,290.14,304.13,293.39,294.16,294.16,300.59,289.79,293.45,295.04,299.29,291.97,293.45,298.17,295.75,292.03,302.3,304.13,304.9,310.74,295.28,304.55,295.69,297.46,299.53,295.51,297.46,302.83,301.36,287.49,287.78,290.14,281.94,286.19,272.37,269.19,266.94,262.1,260.04,253.78,251.83,258.32,266.23,265.41,263.4,269.72,268.65,270.13,282.35,273.49,274.38,274.38,265.82,266.53,264.88,272.08,289.43,289.55,296.4,300.94,299.53,290.14,293.39,294.27,292.03,290.08,293.51,299.35,277.21,282.88,274.79,280.99,279.34,285.77,294.57,294.51,299.17,306.08,304.78,306.61,304.66,310.68,316,314.7,321.02,311.98,307.79,306.73,295.16,297.99,297.17,293.45,301.53,306.73,322.2,325.62,330.34,327.1,332.7,332.05,341.97,365.17,365.94,358.56,364.99,362.46,378.87,377.51,374.44,374.44,379.16,378.34,395.99,407.97,412.63,432.94,428.63,432.05,421.55,420.78,416.35,422.31,431.82,430.87,426.56,421.84,421.9,415.82,412.93,416.65,416.65,417.12,414.46,424.56,443.8,437.13,456.08,455.19,467,457.02,464.4,469.07,471.72,479.93,476.51,476.51,504.72,492.92,501.83,485.71,479.81,469.36,443.27,462.75,462.04,474.79,481.82,467,479.63,478.75,495.93,491.85,486.13,510.51,519.54,519.54,517.95,507.97,522.67,536.95,509.33,520.84,546.16,520.19,540.32,559.39,537.72,526.03,497.82,524.97,502.07,527.15,504.19,527.21,518.12,524.5,539.73,559.39,530.22,534.3,538.84,504.13,489.96,496.4,519.42,511.16,510.86,520.72,545.51,545.51,553.42,551.89,554.66,562.51,562.57,564.29,543.98,535.24,532.88,535.18,521.9,516.41,528.28,500.06,507.85,518.54,528.1,507.85,519.83,508.09,501.89,498.29,502.66,500.59,507.56,477.27,476.27,453.36,455.67,470.48,474.56,465.64,471.84,478.93,476.51,489.37,479.52,485.48,495.45,496.69,496.69,496.75,497.87,484.24,494.45,496.1,475.38,464.34,468,468.36,475.15,485.12,475.15,476.03,454.25,454.96,458.44,466.47,475.68,484.24,492.21,489.55,501.65,472.9,474.2,474.2,478.63,461.75,455.19,464.82,469.66,463.11,463.34,454.07,442.8,440.26,445.04,455.67,445.87,448.29,450.41,438.13,445.99,455.02,457.97,458.32,477.33,483.94,481.05,484.06,473.49,448.11,442.92,414.7,418.65,418.71,417.83,416.88,414.88,414.58,423.49,424.91,437.07,429.57,436.84,431.88,435.06,435.18,436.78,435.71,435.71,434.71,426.62,430.17,433.88,438.9,433.83,435.77,440.55,438.61,427.21,425.86,436.66,437.07,437.13,443.8,431.52,422.9,419.01,419.07,416.88,416.17,412.87,416.41,413.93,408.62,393.86,391.85,400.24,399.53,397.05,398.88,403.01,405.19,398.52,405.9,406.97,402.83,410.74,407.91,417.36,417.71,420.6,426.45,430.46,440.14,446.22,433.35,440.08,456.32,453.25,453.42,445.45,454.66,490.14,495.04,504.19,508.91,508.91,492.44,508.5,495.87,502.66,489.26,481.82,486.72,506.67,507.79,501.36,504.96,497.93,491.68,505.67,488.13,489.96,484.24,535.3,533.29,557.38,557.38,557.44,548.64,567.71,554.25,549.88,565.23,568.71,557.26,564.64,557.56,554.25,556.08,561.45,564.46,574.73,574.73,548.23,531.29,502.18,483.65,489.67,476.51,483.88,464.7,467.95,485.66,480.81,498.88,483.88,479.16,477.39,496.58,520.19,537.31,529.87,530.46,566.71,567.06,553.31,536.01,536.01,534.65,515.41,524.38,531.88,524.56,509.21,550.77,526.45,483.53,446.87,455.49,468.95,446.99,429.87,409.68,431.58,470.31,475.32,468.77,462.51,467.06,446.58,461.69,461.04,471.43,484.36,467.3,459.8,449.7,458.5,440.44,435.54,432.59,425.86,425.21,424.79,427.27,413.99,413.99,420.01,429.34,432.11,418.65,409.74,413.93,395.99,392.38,414.29,402.54,416.77,420.66,434.59,420.84,415.29,401,406.79,395.28,399.7,424.56,416,439.67,419.42,409.68,406.73,410.8,393.27,400.65,416.77,432.82,432.82,435.89,434.18,444.92,412.87,415.88,417.71,404.96,389.73,369.66,347.34,346.52,349,324.73,329.1,329.1,335.3,332.59,331.88,344.98,346.99,341.56,330.7,326.33,316.71,316.71,334.89,338.67,347.4,349.11,341.26,349.35,347.46,350.35,363.22,356.85,368.36,373.67,375.68,361.81,355.08,352.18,365.35,366.41,365.17,369.19,368.77,379.28,382.82,368.71,362.75,349.17,362.46,367.89,383.94,381.94,376.98,363.75,371.78,357.2,344.21,341.56,344.21,361.28,340.2,336.54,332.35,333.71,338.31,332.53,332.53,326.03,324.68,326.98,339.08,342.03,316.53,313.52,311.04,311.98,307.56,299.88,295.75,293.15,295.75,288.55,298.58,301.06,295.22,295.75,305.31,318.54,323.08,322.43,312.34,303.31,317.06,311.39,323.85,311.22,315.82,310.21,313.05,317,330.87,332,329.81,327.33,308.21,319.01,319.36,323.85,315.53,315.7,331.52,333.88,339.37,330.4,355.79,369.07,364.7,372.49,347.52,346.75,345.81,337.43,346.04,347.87,347.87,344.81,329.1,325.38,340.32,327.57,322.79,319.01,316.88,317.71,325.86,323.91,326.74,326.09,322.26,307.2,307.38,305.31,299.17,302.18,291.79,296.34,296.34,295.28,289.96,299,295.04,295.04,297.34,319.95,322.96,335.12,332.7,337.72,342.74,338.08,336.07,336.07,335.6,333.59,332.7,345.1,364.94,361.63,363.28,370.72,377.04,364.29,355.96,369.54,372.9,368.42,354.07,366.77,355.67,355.25,353.13,354.9,366.41,365.05,354.49,348.35,348.35,340.02,336.36,346.81,343.45,341.79,341.32,338.49,333.12,335.18,335.48,327.98,335.83,328.22,324.26,318.18,320.37,319.54,333.94,334.47,340.26,346.1,343.39,362.1,361.04,352.95,349.94,375.09,372.43,356.2,351.89,338.08,336.6,345.69,345.69,373.49,375.27,365.76,371.9,369.72,369.19,365.58,358.03,362.81,360.86,351.3,343.21,360.21,365.41,379.93,368.06,365.41,359.56,357.2,361.45,359.33,359.68,354.13,363.7,359.62,381.58,376.21,383.23,398.88,402.42,390.97,389.67,392.74,410.92,436.42,436.42,423.2,402.6,407.85,408.32,400.06,398.7,395.87,385.6,386.25,398.17,400.65,408.03,406.26,399.41,399.41,394.92,388.43,391.09,385.36,386.36,394.27,395.93,379.75,372.55,377.21,377.21,366.35,361.45,358.03,368.83,375.44,376.56,380.93,378.28,384.65,383.35,383.47,381.88,387.54,386.54,387.72,397.76,419.54,420.31,421.43,417.71,402.42,408.38,412.69,409.56,399.35,393.74,386.3,379.99,403.07,385.66,379.1,375.21,375.38,377.57,374.32,384.83,375.97,376.15,385.54,393.62,401.95,412.87,415.53,415.53,414.94,415.64,412.46,414.29,413.4,415.05,418.24,423.79,412.51,416.17,417.41,411.33,400.83,406.61,404.84,401.06,402.66,384.89,401.59,401.18,400.41,402.07,407.62,412.99,410.15,407.73,414.46,411.75,408.56,407.79,407.32,408.15,398.64,396.81,394.81,401.83,392.56,380.93,387.54,390.02,394.75,409.68,415.82,428.45,430.46,429.75,426.68,434.3,444.86,441.44,455.55,455.37,452.6,457.85,464.11,452.83,455.14,455.14,453.78,457.56,449.35,452.72,449.35,448.23,438.55,435.01,431.7,434.77,442.5,459.21,461.39,471.02,485.18,480.58,481.46,485.06,464.52,504.6,510.57,510.57,513.93,511.57,507.67,503.78,486.07,485.6,488.25,492.62,501.48,491.91,486.3,492.27,486.36,486.36,499.47,491.62,500.71,516.59,526.8,516.71,519.95,526.56,519.78,525.8,508.62,506.2,505.37,510.51,513.46,499.41,502.77,501.06,505.08,505.9,481.29,483.06,481.88,469.3,469.3,476.45,481.05,507.14,507.67,528.1,542.21,529.57,534.89,561.69,565.35,557.67,564.11,584.3,576.27,557.91,575.09,555.84,539.73,550.47,553.6,554.9,568.18,648.47,650.59,691.44,701.3,703.96,695.93,695.93,733.77,724.62,755.67,732.53,729.52,725.8,723.91,721.37,752.72,723.26,716.47,718.83,686.72,660.74,630.28,644.16,663.87,659.86,658.68,677.92,675.09,666.82,647.58,663.11,677.1,709.15,703.72,704.37,695.45,715.7,726.09,736.78,754.49,754.96,739.61,761.51,752.66,745.45,745.4,764.4,764.4,783.18,776.74,745.51,737.9,756.61,747.58,789.32,767.83,772.96,795.87,797.34,830.87,844.98,834.47,872.67,905.84,905.84,851.18,823.73,820.6,833.06,840.38,780.58,776.45,776.39,782.7,807.67,807.67,776.86,771.49,774.14,805.14,768.77,788.37,772.55,752.6,705.43,693.33,674.5,680.52,674.44,651,634.3,645.87,636.66,605.43,648.29,599.23,547.23,533.77,525.38,512.4,543.51,549.47,558.68,575.21,592.74,631.35,637.49,641.26,637.49,639.49,615.47,607.14,583.88,577.69,559.98,564.17,568.12,568.12,522.9,527.1,527.69,509.92,509.27,512.69,535.12,514.82,538.49,514.64,523.79,515.64,526.86,536.6,552.36,554.9,565.35,648.64,634.59,612.22,592.15,589.43,601.06,603.6,607.5,605.31,600.35,623.91,631.17,639.55,615.82,644.86,661.45,656.14,643.92,636.48,620.13,630.76,637.01,628.04,638.61,614.4,588.25,588.72,600.53,622.73,660.15,669.48,660.57,641.38,614.52,589.85,585.48,568.71,575.62,576.92,580.7,606.61,605.9,616.77,600.94,579.69,579.69,578.22,581.76,589.37,609.21,595.45,597.23,606.97,579.1,602.48,579.93,605.08,639.08,641.09,613.34,514.11,532,529.63,527.04,527.04,530.22,523.2,503.6,496.81,515.53,530.52,585.95,601.59,586.84,586.84,586.42,561.16,574.73,609.15,605.67,624.26,624.26,645.69,644.81,618.89,609.15,537.84,520.96,525.44,546.04,538.61,530.81,535.18,552.54,558.09,544.86,566.29,555.37,541.2,564.7,587.49,587.49,630.4,616.06,609.09,583.47,563.22,550.3,576.8,542.03,552.72,534.47,538.37,556.91,526.98,548.76,514.05,525.68,564.58,560.09,594.98,608.68,600.47,602.48,608.03,559.15,572.26,555.96,543.86,538.13,522.08,512.93,523.67,523.02,438.84,382.05,403.6,386.89,459.68,413.52,410.57,419.24,419.36,409.27,406.14,406.14,393.98,414.46,430.52,457.02,470.96,463.75,453.84,454.25,459.09,476.51,474.73,475.27,487.72,502.66,506.85,544.81,572.2,562.69,563.46,578.51,582.35,579.1,565.76,559.8,551.18,551.18,568.95,567.77,571.43,557.62,579.57,603.6,609.5,627.45,640.85,654.96,673.79,684.95,685.83,682.41,707.44,710.39,719.13,719.13,729.63,720.66,755.08,751.18,743.8,736.48,727.57,713.64,718.65,721.9,721.9,707.91,734.47,721.61,726.74,735.12,700.18,709.03,687.31,668.6,675.27,668.42,644.75,648.35,659.56,656.79,656.73,660.92,677.33,644.27,619.13,636.19,643.8,642.15,660.39,701.83,730.34,754.13,733.59,739.61,713.52,729.34,720.48,691.91,683.53,694.69,687.25,687.72,695.1,720.19,702.54,702.54,699.41,700.83,733.23,775.5,776.03,798.35,826.45,888.84,928.16,931.35,937.54,944.45,996.99,960.63,971.78,982.35,954.6,925.8,928.39,967.53,987.72,1075.27,1084.71,1108.8,1127.27,1096.16,1160.21,1135.36,1072.02,1137.96,1104.25,1133.06,1195.57,1194.69,1220.6,1194.16,1171.61,1220.25,1292.92,1299.29,1309.98,1337.84,1322.37,1320.96,1385.48,1287.07,1402.01,1406.91,1404.49,1495.28,1423.32,1445.69,1398.76,1457.08,1428.28,1348.88,1333.65,1188.72,1224.14,1321.9,1325.44,1359.27,1359.27,1395.99,1419.48,1413.75,1382.29,1337.96,1400.35,1457.62,1490.08,1556.73,1525.74,1423.49,1402.01,1372.55,1331.29,1467.24,1569.78,1632.76,1630.87,1692.33,1692.33,1681.17,1737.72,1727.45,1684.83,1861.98,1842.68,2027.33,2004.43,1930.46,2037.13,2041.74,1996.04,1967.83,1987.19,2141.38,2141.38,2154.66,2296.99,2346.99,2359.21,2296.87,2421.72,2569.54,2572.55,2449.11,2584.42,2476.03,2239.67,2260.27,2329.93,2263.87,2203.36,2422.31,2443.74,2430.11,2430.11,2359.98,2484.95,2463.7,2527.57,2485.06,2467.59,2532.47,2453.13,2434.3,2436.07,2241.32,2365.82,2343.86,2185.95,2298.23,2379.63,2471.61,2392.86,2515.53,2608.03,2725.44,2725.68,2622.61,2496.46,2386.95,2334.89,2255.55,2098.35,2108.74,1899.65,1994.33,2171.49,2161.98,2161.98,2229.99,2228.93,2401,2488.25,2482.82,2518.06,2748.88,2693.21,2699.11,2686.36,2647.11,2652.77,2877.69,2843.68,2932.23,3096.58,2976.92,3060.57,3052.89,3200.77,3402.89,3779.22,3935.01,3817.18,4408.56,4694.98,4525.27,4743.98,4580.93,4277.8,4023.26,4124.79,4321.07,4498.82,4433.29,4433.29,5288.55,5480.58,5451.71,5732,6112.75,6281.58,6372.9,5879.57,5100.41,5603.78,5524.73,5264.93,5878.81,5794.63,6422.61,6025.74,6158.15,6694.16,6694.16,7151,6208.8,6189.55,7163.87,6684.36,6760.8,6813.99,6093.74,5758.91,5758.91,5813.16,5539.43,5600.94,5853.84,5780.99,5531.29,5803.54,5338.13,5036.6,5011.51,5108.97,5730.93,5663.99,5845.4,5436.54,5314.05,4843.74,4362.46,5163.28,4858.5,4896.69,5269.6,5272.67,5203.48,5180.46,5082.64,5127.04,5379.52,5607.02,5735.89,5972.55,5553.48,5531.94,5751.65,5707.08,5374.44,5507.5,5539.55,5521.78,5506.85,5659.56,5510.27,5643.92,5656.2,6001.12,6001.12,5904.72,6067.12,5769.83,5757.14,5454.72,5475.8,5469.6,5770.37,5996.46,6162.69,6470.84,6327.51,6378.57,6388.9,6221.84,6287.37,6287.54,6478.1,6345.28,6280.76,6172.14,6422.67,6114.76,6074.38,5838.49,5626.86,5396.28,5497.28,5187.96,5341.79,5289.67,5289.67],"삼성전자":[null,100,101.2,100.5,98.62,98.99,101.57,103.15,103.96,103.4,101.7,102.39,103.21,103.46,100.44,103.78,100.57,97.73,96.85,98.05,98.68,99.81,100.25,103.21,103.78,103.84,103.84,105.54,105.54,109.88,110.07,108.68,108.12,110.01,111.52,112.65,112.02,110.26,111.14,111.83,110.7,112.84,112.96,114.03,113.59,113.85,112.15,113.15,113.22,112.52,113.4,113.4,113.59,114.79,113.78,111.89,113.91,117.12,117.18,120.45,122.09,117.87,115.36,116.3,116.24,117.94,117.05,119.76,120.08,123.98,125.55,125.55,125.55,124.17,123.1,123.85,124.17,124.48,122.15,120.83,120.83,120.7,119.45,118.25,118.69,119.63,119.13,121.65,122.53,123.66,123.29,120.26,119.76,120.96,120.96,124.98,124.67,126.12,126.49,126.49,126.49,126.43,127.75,130.14,130.27,131.66,133.42,131.84,133.92,133.61,131.53,130.59,129.64,130.52,131.47,132.1,129.64,130.4,132.41,132.6,131.66,130.9,131.97,130.9,131.84,133.48,132.22,130.77,130.59,128.7,126.75,128.26,129.77,134.36,134.68,137.95,140.4,140.4,141.28,141.28,143.23,143.23,147.95,147.95,143.49,143.17,144.18,145.06,145.94,145.81,144.56,140.72,141.91,141.35,141.22,143.74,145,143.55,140.47,140.65,140.59,144.62,144.56,144.56,142.54,142.1,145.06,142.79,142.86,142.73,143.74,143.42,146.51,151.48,149.4,150.91,149.84,151.92,151.98,150.09,150.85,149.59,148.58,147.89,149.72,151.23,150.6,153.12,154.19,156.95,159.09,158.84,159.35,159.97,159.66,161.11,160.73,160.04,157.33,156.83,156.7,150.28,151.67,152.93,154.19,150.35,150.09,149.72,150.16,145.63,144.43,140.4,141.6,141.6,145.37,148.02,147.58,147.39,147.89,149.4,149.53,147.95,145.06,145,145.37,145.75,146.26,144.87,147.14,147.89,151.42,154.44,156.7,156.07,156.14,158.28,158.59,165.14,164,164.32,166.14,166.14,168.72,168.72,162.62,161.3,161.36,161.36,161.36,161.36,161.36,161.36,161.36,166.14,171.93,172.44,169.92,169.67,172.44,172.31,166.71,169.41,170.86,170.04,169.6,164.88,167.02,170.04,173.32,180.05,179.55,177.41,177.41,176.53,178.6,177.28,177.47,177.41,175.96,174.13,175.52,175.65,173.69,173.95,176.09,174.01,174.51,165.64,167.65,165.51,159.85,159.97,161.55,161.3,157.39,159.66,163.62,162.93,163.94,161.49,160.67,159.28,161.11,162.24,162.24,154.63,156.39,156.39,151.67,155.32,160.35,160.35,160.54,162.43,160.73,164,163.69,158.59,153.68,151.79,151.67,152.74,157.33,156.14,157.02,155.19,151.79,154.69,155.25,158.15,159.79,161.17,156.7,157.02,156.77,150.09,150.79,149.21,144.12,144.75,140.65,143.86,149.59,154.19,154.19,154.19,152.23,149.15,148.77,147.14,148.58,149.09,149.09,148.08,148.08,144.81,142.23,147.95,152.99,154.81,156.51,156.51,162.56,162.87,162.18,160.92,159.66,161.11,160.67,162.93,156.45,158.21,157.27,153.24,154.31,154.88,152.74,151.42,147.64,153.37,152.3,154.81,153.81,153.74,154.19,156.7,158.4,157.27,161.61,166.08,162.43,163.31,158.78,158.59,164.07,166.77,166.77,166.77,166.77,166.77,163.31,163.31,165.51,160.16,162.37,161.42,157.65,154.81,156.86,155.44,155.76,157.33,157.33,163,161.74,165.83,164.57,161.42,155.76,159.53,161.42,160.79,161.42,161.42,159.22,156.23,157.02,155.44,155.44,151.67,149.94,146.63,147.89,147.89,148.05,148.68,146.79,147.89,150.88,147.26,146.79,143.33,145.22,145.53,144.59,141.28,143.49,145.69,144.75,143.17,146.32,144.9,144.27,146.48,147.58,149.31,146.32,145.22,145.22,147.58,147.58,146.32,145.53,146.48,143.33,143.96,144.12,146.95,147.26,147.58,142.86,141.76,142.07,142.07,139.24,138.77,137.98,140.97,145.06,145.37,145.22,145.69,146.48,147.26,149.94,152.45,149.31,149.94,146.63,145.06,141.28,143.17,141.76,140.18,138.61,144.27,142.07,143.17,145.22,148.68,149.15,149.15,149.15,149.15,149.47,146.16,145.85,143.8,143.8,140.65,140.65,141.44,141.44,142.54,135.62,138.45,137.82,137.19,138.92,138.61,138.14,137.04,135.46,133.89,129.01,129.01,130.27,133.26,133.42,132.63,138.92,137.82,137.67,138.45,138.61,139.4,142.23,140.03,138.77,139.24,138.45,137.35,134.68,132.47,133.57,133.42,134.05,135.46,135.78,135.78,131.69,136.09,132.63,130.43,127.44,128.85,126.49,126.65,127.28,125.87,122.56,123.19,122.4,123.03,121.62,121.62,122.09,122.09,120.67,120.36,121.77,121.77,121.93,118.31,117.84,121.93,119.89,124.61,125.24,127.44,126.02,129.33,130.43,132,133.1,134.52,132.63,132.16,135.46,140.81,141.76,143.17,146,145.22,145.85,145.85,145.85,145.85,145.37,140.97,141.6,144.9,145.37,149.47,144.9,145.37,144.59,147.58,147.73,148.36,148.99,147.11,147.11,141.91,141.91,141.13,139.24,138.45,139.87,137.82,137.35,140.5,137.98,137.98,139.08,137.51,138.14,138.61,144.27,146.48,143.17,142.39,142.7,141.13,140.5,141.76,143.96,146.63,147.73,147.42,146.79,146.79,146.95,145.53,147.42,148.05,148.68,148.05,143.49,142.54,142.7,142.23,140.81,140.5,141.13,145.22,144.27,144.27,144.43,142.54,142.54,141.13,139.24,133.57,134.99,134.2,134.2,133.89,130.74,129.64,132.16,135.78,136.88,137.98,134.36,134.2,133.89,131.53,133.89,133.73,137.82,136.72,138.14,138.14,139.08,140.97,141.13,140.34,137.67,138.45,138.14,139.55,142.7,143.17,143.8,143.17,143.49,143.8,146.32,147.89,146.63,145.53,142.86,144.75,143.64,139.71,141.91,143.33,145.37,145.69,146.16,147.42,144.9,145.06,147.26,148.52,148.84,146,148.52,148.36,145.06,146.48,142.7,142.23,141.44,138.29,136.88,135.93,134.2,135.78,137.51,135.31,137.51,137.51,138.14,137.19,139.87,140.03,138.61,138.29,137.19,138.61,138.92,136.56,138.45,137.82,136.09,138.77,143.8,145.69,147.58,147.89,148.36,148.36,148.36,148.21,147.58,150.09,154.66,154.81,155.13,155.76,153.87,154.81,152.3,154.34,153.71,149.78,149.78,151.04,150.25,153.87,153.87,152.77,154.66,157.33,157.65,159.53,158.9,157.02,158.28,161.11,161.11,159.53,160.16,161.42,160.79,158.59,158.59,161.11,164.57,165.83,167.72,166.46,163.94,162.37,165.51,165.2,166.14,168.97,168.34,168.34,163.62,160.48,162.37,163,163,164.25,161.42,158.28,158.59,157.02,155.6,155.76,158.59,161.11,162.05,163.31,167.72,172.12,172.12,178.41,177.16,176.21,176.21,174.64,173.06,173.06,174.32,177.78,175.58,175.58,173.69,174.64,174.64,175.58,178.73,184.39,187.22,188.8,188.8,185.65,191,192.89,196.35,193.2,196.04,191.32,191.32,191.32,185.02,185.97,179.99,177.47,179.99,185.34,187.22,192.26,190.06,187.85,188.48,190.37,191,194.46,193.52,188.17,189.43,188.8,186.28,178.73,182.19,177.78,175.9,170.55,173.06,174.32,180.62,181.88,177.78,177.78,171.81,163.94,163.94,157.17,153.87,148.84,143.49,135.15,142.86,133.73,147.73,153.08,150.41,151.98,150.57,150.25,144.12,147.26,147.89,153.24,156.07,152.93,154.5,154.97,151.98,154.19,154.19,154.19,161.74,157.65,154.97,156.86,156.86,155.29,156.86,157.65,157.33,157.33,157.33,152.61,152.61,154.81,153.56,153.56,152.3,150.72,152.77,151.04,150.57,153.56,158.28,157.33,157.17,153.4,153.71,154.97,157.02,158.59,159.53,161.11,161.74,171.49,171.81,174.64,172.75,174.64,174.32,170.86,164.57,157.02,163.94,164.25,164.57,166.46,163.62,161.74,166.46,163.31,167.72,164.88,166.14,165.51,166.46,168.66,173.06,168.03,166.77,166.14,165.83,168.03,169.29,172.12,169.29,171.18,170.55,174.01,172.12,170.23,170.55,174.95,184.39,185.65,185.65,182.19,178.73,180.3,179.04,182.5,180.93,181.88,183.13,185.65,184.71,182.5,182.5,183.76,181.88,174.32,175.9,176.53,177.47,177.47,174.95,174.32,169.92,170.55,171.18,177.47,174.95,177.78,184.71,183.76,186.28,185.65,190.06,191.94,191.94,187.22,186.6,186.28,183.13,184.39,181.88,182.19,183.13,183.13,183.13,183.13,183.13,184.71,185.65,188.48,187.85,187.85,190.06,191.63,191.63,188.8,187.22,188.8,191.63,191.63,189.11,189.43,190.06,188.17,185.65,182.82,178.1,180.62,185.02,184.08,189.74,189.11,189.43,189.43,192.89,191.94,198.87,208.62,206.73,203.9,203.27,203.59,212.4,213.03,209.57,213.97,214.6,209.88,213.34,218.69,219.32,224.98,229.39,225.61,232.54,229.39,230.96,232.22,232.22,232.22,230.65,229.7,229.7,227.5,232.54,244.81,244.81,247.64,246.38,254.88,254.88,261.17,264,258.65,260.86,279.42,286.34,285.08,282.25,282.25,276.9,267.46,273.76,274.39,277.22,273.13,281.31,272.81,269.35,263.37,258.02,261.17,265.58,266.21,259.6,262.74,261.17,260.23,256.77,256.77,256.77,264.95,267.15,261.8,258.34,259.91,258.65,258.02,258.02,268.41,259.6,259.6,263.06,264.32,259.28,258.34,258.02,256.14,254.56,258.02,260.54,257.39,260.54,258.97,260.86,257.71,258.02,257.39,254.88,255.51,256.45,256.77,258.65,256.14,260.86,266.83,268.72,270.61,269.35,266.52,263.06,261.8,264.32,264.32,264.63,264,262.11,264,259.91,259.28,260.54,262.74,260.86,258.34,257.08,256.45,257.08,259.91,259.91,258.97,257.71,261.8,255.51,251.73,247.01,252.05,250.47,250.47,250.47,250.16,252.05,250.79,251.42,251.1,250.47,252.05,253.3,253.62,254.25,260.54,258.65,257.71,257.71,255.19,254.88,254.88,253.3,254.56,257.39,254.56,253.3,251.42,251.73,252.05,255.51,256.77,257.71,254.88,253.93,252.05,251.73,252.99,255.51,254.25,251.42,249.84,250.79,251.1,250.16,253.62,251.1,248.58,248.58,247.01,250.79,249.53,247.95,247.01,249.21,248.58,247.01,249.53,256.14,260.86,258.34,256.45,256.45,252.36,247.01,242.29,234.11,234.11,233.48,232.54,230.02,228.76,230.65,237.89,238.2,234.74,233.79,234.74,241.35,241.66,239.14,241.03,243.23,239.46,240.09,236.94,236.94,240.09,241.03,242.29,239.46,242.92,242.92,242.92,242.92,243.55,243.23,244.49,240.09,233.17,233.17,230.33,230.33,227.19,224.35,225.3,224.98,224.98,217.12,216.49,218.38,220.58,220.89,222.15,221.21,220.89,221.52,220.89,223.73,220.58,222.47,219.63,219.95,224.98,221.52,222.15,220.89,222.15,221.84,220.89,219.95,222.15,224.67,224.35,222.47,220.89,224.04,235.68,236.94,235.37,231.91,227.5,227.5,224.35,234.11,238.51,237.89,240.09,243.55,243.55,246.07,241.98,241.66,242.29,244.18,244.81,245.44,242.61,245.75,249.84,251.42,253.3,252.36,252.67,247.95,246.38,246.38,246.38,247.64,243.55,241.98,246.38,245.44,248.27,248.27,245.12,243.23,243.86,242.29,240.09,240.72,237.89,236.31,232.85,232.85,224.35,230.65,230.65,230.65,230.65,230.65,232.85,229.7,229.7,229.7,237.26,235.68,231.91,231.91,235.37,236,233.79,233.79,233.79,233.79,224.98,226.24,226.24,226.24,225.61,229.39,229.39,220.58,218.69,218.69,218.69,220.26,220.89,220.89,221.52,221.52,222.47,219.95,221.21,221.84,219.63,219.63,219.32,220.89,219.95,219.01,217.43,218.06,217.75,215.54,213.97,213.34,213.66,210.82,216.17,212.4,209.57,209.88,211.77,212.08,213.03,210.82,208.62,207.99,204.53,203.9,212.08,211.77,212.4,213.66,213.66,209.25,209.25,206.73,206.73,204.22,209.25,208.62,212.71,214.29,212.4,213.97,213.66,209.25,208.94,207.36,209.25,213.03,212.08,212.08,209.88,210.2,210.2,206.1,205.48,205.16,200.76,195.41,194.78,191,191.63,188.17,184.71,184.08,181.25,180.62,183.76,185.02,186.91,182.5,179.36,176.84,179.67,179.99,177.47,183.13,184.71,185.02,182.82,182.5,180.93,188.8,194.78,191.63,190.37,194.46,192.89,192.26,194.15,194.46,194.78,193.2,192.89,194.15,192.89,193.52,193.52,191.32,188.8,185.97,188.48,189.43,189.43,191.94,190.06,193.52,191.63,188.8,185.97,185.65,187.85,188.8,184.39,185.02,187.85,183.76,180.93,179.67,179.67,176.21,174.95,174.95,174.95,182.82,178.73,176.21,176.84,177.47,175.58,174.01,171.18,171.49,169.6,170.55,166.46,165.51,167.09,167.09,173.69,176.21,177.16,176.84,176.84,174.32,175.58,173.69,177.16,178.1,177.78,175.58,174.64,175.9,180.93,181.56,186.91,187.22,180.3,186.91,188.8,187.54,186.28,186.91,189.43,194.46,195.09,190.06,197.92,194.78,196.35,197.29,193.2,194.46,193.2,190.69,191.94,193.2,191.94,189.11,190.69,195.72,196.98,190.06,189.74,186.28,185.34,186.28,190.06,187.22,187.85,190.37,186.6,187.22,187.22,184.39,182.5,185.97,182.82,182.19,182.82,178.1,174.01,174.01,174.64,174.32,181.88,183.13,185.65,191,190.06,190.37,190.37,191.32,192.26,191.94,190.06,193.52,194.46,194.46,194.46,199.18,200.76,203.27,199.18,193.2,191.94,199.81,199.81,193.83,195.09,198.55,199.18,197.92,197.92,198.87,195.72,200.44,196.98,197.29,195.41,192.26,195.09,192.89,190.37,190.69,190.69,191.32,190.37,193.52,191,189.74,189.11,187.22,188.8,185.65,188.17,188.48,192.89,189.43,189.74,192.26,196.04,198.24,195.41,197.92,197.29,198.87,201.38,198.55,200.13,201.07,196.04,204.53,206.73,207.36,207.68,207.99,204.85,205.48,206.42,206.1,205.48,206.73,205.16,200.13,201.7,203.27,206.1,206.1,206.73,205.79,204.85,204.85,207.36,205.48,203.27,202.01,201.7,202.96,205.79,204.53,208.31,215.23,215.54,215.23,215.54,216.49,221.21,221.21,227.5,224.67,223.1,227.19,225.61,225.61,223.41,223.1,226.56,223.41,226.56,226.24,224.98,225.93,224.04,224.67,221.84,224.35,225.3,227.82,228.45,228.76,227.82,227.19,229.7,229.7,226.56,225.3,219.95,218.69,224.98,226.24,226.24,230.96,230.65,226.56,225.61,223.41,221.21,221.52,220.26,219.63,225.61,222.15,219.63,223.73,219.95,216.49,214.92,215.54,212.71,216.8,213.97,212.4,211.77,211.77,210.82,209.88,208.62,209.57,209.57,211.14,214.6,211.14,210.2,210.2,211.14,210.51,223.41,224.04,222.47,220.26,221.52,221.21,222.78,221.84,223.1,225.61,226.56,220.89,219.63,219.01,216.8,216.49,218.38,215.86,215.23,215.23,215.23,215.23,215.23,212.4,209.88,207.68,207.68,208.94,214.6,216.8,213.97,211.77,218.38,221.84,218.69,216.49,215.23,215.54,213.97,209.88,211.77,211.77,210.51,215.86,219.32,219.01,223.1,223.1,219.95,221.21,221.84,221.52,222.78,227.19,229.07,228.13,228.76,229.07,229.07,227.82,225.61,224.35,228.76,228.76,229.07,226.56,228.45,224.04,225.61,224.98,228.45,229.7,231.28,229.07,230.02,230.65,229.39,230.96,235.37,236,238.83,238.83,241.03,245.44,247.01,247.01,250.47,242.29,241.03,241.03,240.72,235.05,231.59,230.33,230.02,232.54,228.45,223.41,225.61,235.05,236.31,236.63,232.85,233.17,230.96,234.11,233.79,228.76,231.59,236.63,233.79,234.11,236,233.17,233.17,233.17,236.63,232.85,230.33,229.07,232.22,230.65,229.7,230.02,229.39,229.07,229.39,230.33,230.96,230.96,235.68,231.91,229.39,227.19,230.65,227.82,230.65,233.17,233.79,227.5,229.07,229.07,241.98,249.53,248.27,246.07,251.42,251.1,254.25,259.28,258.02,267.46,264.63,268.41,265.89,265.89,263.06,263.06,264.63,263.37,258.65,251.73,248.27,250.47,244.18,239.46,237.57,247.33,240.09,241.35,241.35,243.86,243.86,245.44,244.18,244.18,255.82,255.82,250.79,249.21,246.7,246.38,246.38,246.07,243.55,248.27,246.7,244.49,246.38,238.83,242.92,244.18,236.63,231.28,231.28,238.2,236.94,243.55,243.55,243.23,238.2,236.63,240.72,247.33,250.47,245.75,251.1,255.51,256.77,251.73,253.62,254.25,255.82,256.77,256.45,257.39,257.39,257.39,266.21,274.07,275.02,276.27,276.27,275.65,265.58,272.81,275.96,272.81,273.44,265.58,261.17,264,258.02,252.99,254.56,255.51,254.88,264,261.49,250.47,224.67,228.13,235.05,230.96,235.05,237.57,239.46,242.92,242.92,252.36,246.38,248.27,246.38,246.38,244.49,239.46,238.51,240.4,232.85,233.79,234.11,228.13,220.26,217.12,216.8,212.4,208.31,204.22,208.62,202.64,202.64,202.64,202.64,198.55,198.24,196.98,198.87,195.72,203.59,202.01,193.52,193.52,192.89,192.89,190.69,191.94,189.74,189.74,185.34,186.6,186.6,191.94,187.22,187.85,186.28,185.65,181.56,185.97,178.1,175.9,182.82,187.54,185.97,186.28,183.45,184.71,181.25,180.3,180.3,179.36,173.06,166.77,159.22,157.02,168.34,178.41,177.16,174.01,177.47,176.21,182.19,183.45,177.16,174.64,170.55,168.66,168.66,167.09,168.97,170.23,168.03,169.92,169.92,175.9,176.53,174.95,170.55,172.75,167.09,166.77,168.34,171.18,171.18,168.66,168.97,167.4,167.4,168.03,171.18,175.9,174.32,180.3,176.53,174.01,170.23,169.6,168.97,170.86,168.97,168.03,168.34,170.86,168.97,168.97,168.97,168.97,168.97,168.97,164.88,160.48,165.83,166.46,169.92,168.97,174.95,175.27,175.58,175.58,176.21,176.21,179.04,184.71,183.76,183.13,180.3,179.99,178.1,177.16,171.49,171.49,171.49,169.92,170.86,168.97,168.97,168.66,172.75,172.12,172.12,181.25,181.25,184.08,189.43,194.15,190.37,188.17,193.2,194.46,189.43,181.88,185.02,185.02,181.25,176.53,167.4,168.34,166.77,177.47,173.69,176.84,178.1,172.12,173.38,174.01,174.32,173.06,175.27,175.27,175.27,175.58,175.58,174.64,174.64,170.86,170.86,170.86,171.81,171.81,172.44,181.25,179.04,180.62,180.3,178.73,175.58,175.9,175.27,172.12,170.55,172.12,169.6,175.9,176.53,176.84,178.73,178.73,181.88,185.97,185.97,188.17,186.28,188.48,187.22,183.45,179.99,182.82,188.17,186.28,187.22,182.5,190.37,192.89,189.43,191.32,188.17,189.43,191.32,200.76,199.18,194.15,193.2,190.06,191.94,196.98,196.66,200.44,203.59,209.88,211.14,213.34,207.68,208.94,207.68,207.36,221.52,222.15,228.45,224.67,216.8,219.32,219.95,216.49,221.84,225.93,223.41,223.73,226.24,225.3,225.3,220.26,220.26,221.84,222.15,224.67,224.98,221.21,222.15,219.01,219.32,212.71,217.43,219.63,220.58,218.69,220.58,224.98,228.45,230.96,237.26,240.72,249.84,246.07,252.67,252.67,262.74,266.52,268.72,270.93,262.11,264.95,264,270.61,282.41,282.41,282.41,282.41,282.41,282.41,297.04,293.58,288.23,298.93,307.43,308.06,308.68,306.8,310.26,303.65,310.89,320.96,313.09,316.24,327.56,338.26,349.59,330.08,316.55,312.15,308.06,316.55,325.68,324.42,323.47,305.85,316.55,307.74,303.65,316.55,298.3,304.28,312.46,323.47,325.68,316.24,317.18,325.36,328.82,330.71,341.1,344.56,341.1,339.84,337.63,342.67,329.77,323.47,339.52,338.58,334.49,347.7,350.85,349.59,349.59,368.16,376.02,377.28,377.28,404.34,434.55,437.07,443.68,436.75,437.38,436.75,432.98,441.47,452.8,468.53,469.79,456.89,470.42,479.23,478.6,478.6,501.89,511.01,505.66,505.03,473.25,527.06,532.1,501.26,499.06,523.6,521.71,528.01,561.99,570.17,570.17,570.17,570.17,597.86,598.17,607.3,629.33,640.34,685.97,681.25,681.25,613.91,541.85,602.89,592.2,545.94,591.25,597.86,591.25,577.41,593.77,610.13,656.07,630.9,627.44,586.22,596.92,594.71,566.71,566.71,554.75,526.12,596.76,561.36,585.9,607.61,618.31,662.37,641.91,648.21,632.47,649.78,663.94,684.39,679.67,674.95,689.11,684.39,706.42,690.69,706.42,698.55,711.14,693.83,693.83,731.59,731.59,837,854.31,844.87,898.36,877.91,893.64,931.4,851.16,884.2,866.9,868.47,942.42,920.39,920.39,940.84,966.02,942.42,997.48,1098.17,1134.36,1134.36,1106.04,1035.24,929.83,1013.22,951.86,940.84,1014.79,1060.42,1079.3,1090.31,1140.65,1113.91,1112.33,975.46,1071.43,1128.07,1068.28,1016.36,1050.98,989.62,899.94,973.88,1000.63,931.4,873.19,874.76,896.79,800.82,827.56,879.48,802.39,802.39,767.78,814.98,819.7,849.59,785.08,799.24,692.26,656.07,651.35,825.99,753.62,755.19,774.07,725.3,726.87,723.73,753.62,803.96,843.3,863.75,863.75,844.87,778.79,852.74,885.78,808.68,808.68,822.84,837,808.68,818.12,821.27,788.23,786.66,803.96,849.59,848.02,848.02,846.44,816.55,783.51,781.94,797.67,794.52,821.27,862.18,870.04,898.36,898.36,898.36,849.59,857.46,844.87,868.47,868.47,868.47,855.88,844.87,824.42,824.42,788.23,730.02,730.02,660.79,678.1,685.97,665.51,695.41],"어플라이드 머티어리얼즈":[null,100,102.53,101.51,101.48,101.51,100.81,102.29,101.65,100.56,99.44,99.26,103.17,103.8,102.46,99.12,101.37,101.97,104.15,105.59,108.09,108.13,110.27,111.4,112.14,112.14,112.14,111.99,113.12,113.26,105.87,110.59,110.9,111.19,114.35,115.05,113.79,112.56,112.66,113.05,116.29,114.35,114.1,114.7,114.6,116.11,115.72,115.72,117.24,115.72,114.88,113.51,113.51,112.35,113.4,112.91,112.7,115.3,116.53,117.73,117.16,118.85,118.85,117.13,118.5,118.71,119.03,118.71,119.7,121.07,119.52,123.25,120.79,120.47,123.21,122.9,124.2,123.74,125.01,125.22,124.55,124.23,124.73,123.92,124.83,123.74,125.47,125.47,128.67,128.42,127.19,127.68,128.14,127.4,129.62,128.35,129.69,129.65,130.04,130.81,131.48,134.08,135.21,134.61,136.9,137.35,138.16,139.18,135.7,136.55,136.65,137.07,136.69,136.55,136.72,136.79,136.83,136.79,137.18,135,135.7,136.93,136.69,134.37,132.85,131.97,131.97,133.73,133.84,138.06,140.31,139.96,142.24,143.48,143.19,145.37,142.84,146.68,146.71,146.15,146.39,147.13,146.11,147.87,150.79,152.94,152.8,155.89,158.53,150.4,154.45,155.05,157.33,157.97,156.98,158.35,160.04,160.04,160.25,161.38,161.8,164.61,164.33,163.81,166.23,166.83,157.37,155.96,157.76,154.7,151.81,151.64,155.79,152.51,153.43,152.44,155.08,152.13,147.34,150.16,145.76,145.3,144.25,144.25,148.15,148.12,153.15,155.5,159.69,159.27,159.34,162.22,162.33,163.98,165.95,166.2,164.65,164.54,163.21,166.9,161.94,159.16,155.86,155.12,150.3,150.19,150.62,154.63,154.41,154.1,147.84,151.53,153.99,154.34,156.38,151.67,155.82,152.34,156.35,154.84,153.78,152.34,153.46,154.84,159.94,158.71,158.64,158.64,156.45,157.33,159.06,156,160.32,160.57,162.22,165.49,165.81,169.01,169.75,166.3,165.85,168.03,162.96,161.52,171.79,178.05,183.22,183.19,182.34,181.5,180.9,184.31,185.33,184.98,187.23,187.51,189.73,193.6,193.91,194.65,194.62,197.29,198.28,198.31,194.51,196.73,199.4,196.62,198.49,195.95,197.89,198.91,198.14,198.63,200.21,195.15,198.24,200.6,198.45,196.17,203.45,198.7,202.67,206.82,202.88,202.88,203.69,200.28,201.65,186.11,185.61,182.59,175.06,176.15,179.42,183.96,180.9,181.57,177.52,178.54,180.48,184.8,187.83,186.28,187.44,182.52,183.12,183.12,179.56,181.78,181.92,179.81,186.56,189.87,190.96,192.05,196.69,192.97,187.48,187.13,188.01,188.01,191.7,201.69,201.9,201.9,202.11,203.27,200.07,196.13,200.91,194.62,187.76,188.64,187.41,178.26,169.93,176.75,171.26,160.92,169.12,174.11,174.29,182.76,189.91,193.56,193.56,199.3,197.43,197.22,200.53,206.86,202.74,202.57,200.74,204.12,202.71,211.01,209,208.83,216.71,214.46,209.95,211.85,212.03,209.07,205.77,208.34,213.79,207.39,194.79,205.66,195.01,190.15,195.6,195.6,186.04,189.87,195.43,190.96,184.1,186.49,192.75,193.28,198.49,197.22,200.04,203.52,192.51,180.06,179.7,176.5,171.37,172.85,177.59,173.76,174.71,179.07,177.73,178.37,184.88,184.98,188.01,190.4,195.32,192.89,194.37,190.26,194.06,189.8,174.15,175.87,176.75,177.07,178.58,178.86,178.86,182.98,181.46,178.61,183.75,183.93,186.11,184.77,180.27,179.92,175.48,178.9,179.32,174.78,173.44,169.96,170.77,170.88,172.32,168.7,164.3,164.16,159.16,159.3,162.47,160.68,157.58,157.58,159.83,162.26,163.63,164.4,158.99,160.68,162.26,162.89,166.37,169.82,164.16,164.47,163.31,161.48,161.66,165.92,169.89,168.52,171.05,168.73,169.22,171.79,174.04,174.57,176.5,172.92,169.29,169.72,170.17,167.11,166.83,153.96,153.11,153.92,151.21,150.51,150.3,153.89,152.66,151.6,151.74,151.32,151.32,149.91,149.49,141.65,140.17,139.29,137.81,135.03,136.79,137.53,136.12,137.85,137.32,138.55,139.4,137.53,135.7,134.58,134.89,135.95,134.86,136.83,136.9,133.27,130.99,128.7,125.64,121.1,115.34,118.5,117.59,122.27,122.97,119.31,120.61,117.94,117.9,111.89,114.81,113.82,109.46,114.03,115.65,124.34,124.06,120.72,122.65,123.99,122.9,120.58,114.74,117.8,118.11,123.18,124.52,121.07,125.82,123.78,123.78,123.29,126.66,126.63,130.53,128.53,131.13,134.86,124.62,124.62,122.02,118.33,120.19,119.66,120.3,118.57,114.84,114.91,117.06,110.9,108.69,106.61,101.97,101.97,107.77,110.97,113.89,115.16,117.76,110.94,118.54,120.65,115.76,120.65,122.27,122.34,119.1,118.71,118.33,121.49,125.61,125.61,121.14,120.68,133.03,137.85,136.12,134.37,139.29,137.46,138.27,136.83,137.6,141.68,140.42,139.92,140.34,143.12,143.69,143.19,137.53,137.53,138.23,137.18,136.58,138.69,139.5,139.22,136.41,134.86,135.63,137.46,136.93,133.91,132.15,132.75,135.46,136.16,135.77,136.93,142.07,140.7,142,139.18,145.37,140.2,138.59,139.4,136.93,135.46,139.5,144.67,144.18,149.24,149.91,151.39,150.97,147.77,148.33,149.38,151.21,150.23,153.78,154.38,154.59,154.59,154.03,154.17,156.38,156.35,157.09,155.61,155.01,152.59,153.71,154.63,151.64,147.91,146.25,144,143.51,137.5,140.73,145.97,146.54,150.19,141.93,145.16,142.42,140.49,138.94,138.94,137.21,138.48,139.82,136.09,136.41,142.17,142.77,145.55,146.01,151.74,153.89,145.97,146.5,145.02,142.46,148.82,149.6,151.99,151.11,148.89,147.66,153.29,157.19,157.97,160.68,157.09,157.12,157.12,154.7,152.83,154.66,157.3,159.27,163.59,162.79,161.84,162.57,169.43,168.17,178.44,179.49,183.4,178.75,178.47,178.23,178.44,173.65,170.49,167.25,159.9,162.96,164.19,168.34,165.85,163.42,169.05,164.3,165.88,164.02,165.67,164.37,164.72,165.42,158.71,160.43,160.08,161.45,166.41,168.91,168.91,167.46,174.15,177.1,176.22,178.19,176.54,181.36,180.27,180.62,179.11,180.09,183.22,181.78,179.25,182.06,179.95,182.66,183.43,173.87,175.52,175.94,173.97,174.6,178.97,178.16,173.44,178.83,179.42,182.03,182.69,186.11,181.36,183.4,181.78,185.16,182.84,177.73,193.7,195.99,200.32,195.29,194.2,190.85,195.08,196.06,196.55,196.34,196.76,197.08,199.05,198.45,200.91,200.35,218.29,219.31,214.35,209.81,198.52,196.76,204.99,202.5,205.03,205.03,203.66,199.44,194.65,197.29,196.41,199.09,199.09,199.16,207.67,212.31,210.59,210.9,213.82,212.38,213.4,217.41,214.84,216.32,216.32,215.65,215.16,214.32,214.7,218.78,215.3,210.66,216.74,216.6,217.97,216.22,217.41,219.31,217.83,222.34,221.07,221.07,222.3,224.73,224.73,218.08,207.7,211.71,210.41,211.92,203.97,210.06,221.63,224.41,222.27,217.06,221.32,226.7,229.93,236.97,235.14,235.14,229.19,237.11,233.56,226.06,214.84,207.03,210.38,200.49,204.43,211.61,204.15,212.87,207.98,203.27,183.15,197.57,184.63,158.67,179,142.56,157.79,137.81,141.36,133.63,141.29,158.78,157.33,173.06,158.46,166.37,161.17,152.3,152.09,148.72,162.33,167.29,181.01,174.43,174.43,175.45,184.56,177.17,183.71,187.13,178.09,170,183.29,179.04,181.99,179.49,177.35,191.14,174.74,164.93,167.36,171.83,177.63,180.27,189.27,189.98,184.07,181.11,191.45,183.05,191.21,195.11,200.07,193.53,191.31,191.31,193.95,198.38,192.3,197.61,195.88,196.24,203.34,204.47,211.71,210.69,210.31,210.55,194.9,198.91,200.67,205.91,211.04,212.38,214.39,215.51,214,210.94,210.97,205.35,207.74,212.63,209.92,214.56,214.56,223.21,218.71,220.79,223.32,220.15,216.36,219.98,218.43,219.28,219.13,224.16,224.45,225.89,223.81,213.23,221.63,219.13,222.48,226.59,226.28,228.67,228.1,228.17,223.74,223.6,229.48,226.73,233.91,228.88,237.85,235.46,233.66,231.69,224.38,219.03,224.2,225.29,224.27,218.19,221.84,216.67,217.69,228.91,216.18,214.42,214.42,195.67,194.16,193.88,193.46,198.59,201.2,198.63,198.17,197.5,201.62,203.62,201.37,203.27,204.82,208.79,209.81,209.11,213.33,204.75,213.16,212.45,214.98,220.19,222.62,227.51,227.54,225.04,223.39,221.6,218.26,218.99,218.47,217.02,214.39,209.32,206.93,201.62,209.29,208.34,212.21,217.48,228.14,246.04,248.08,250.79,244.07,250.3,245.52,256.1,261.98,261.59,266.3,271.72,269.86,283.15,291.77,285.4,285.4,290.75,290.12,296.41,300,302.85,312.49,313.54,315.69,308.9,309.15,310.59,311.29,311.19,311.47,307.77,302.81,303.94,301.23,295.57,300.14,300.14,298.52,296.41,305.94,303.55,305.56,315.16,319.49,332.61,336.12,344.57,351.78,344.88,372.14,362.79,362.79,384.17,379.32,379.77,374.01,380.3,371.19,346.75,355.79,340.06,356,364.37,351.28,363.14,354.24,373.51,370.66,372.42,397.47,410.48,410.48,416.29,407,398.98,420.19,405.31,408.51,431.97,400.74,415.72,430,413.3,406.05,380.72,399.05,371.72,401.76,396.34,412.21,402,404.08,416.81,421.74,401.97,404.01,419.73,409.36,425.96,421.1,452.48,442.17,445.87,469.93,497.78,497.78,503.17,490.82,489.41,490.15,488.6,474.85,475.2,471.83,472.78,470.38,460.39,452.3,475.03,463.42,474.36,482.94,481.11,477.28,476.22,466.8,467.29,452.76,458.28,463.35,467.64,438.59,434.58,404.08,421.81,439.08,434.65,428.46,438.97,458.35,452.55,473.37,483.64,481.53,484.77,485.86,485.86,486.14,488.96,479.7,491.91,488.81,477.88,473.62,482.45,481.25,489.03,487.65,481.81,483.01,461.59,467.99,469.36,476.61,486.32,479.04,495.92,499.19,500.88,485.23,485.97,485.97,481.11,474.39,466.16,474.5,481.18,479.39,477.14,468.52,450.86,452.41,464.19,485.4,482.52,486.92,487.09,474.5,482.62,483.64,492.19,499.51,500.04,502.15,500.42,501.76,499.47,485.61,474.22,454.52,456.91,463.21,453.04,448.01,454.45,447.41,462.5,462.33,467.18,466.02,480.3,478.54,475.31,469.43,472.92,477.77,477.77,480.09,469.79,474.85,481.32,490.47,492.93,496.76,506.82,495.25,476.71,475.48,485.75,496.34,499.19,502.08,467.43,451.18,452.8,454.2,440.38,450.47,445.02,449.81,443.97,448.47,445.87,450.97,464.54,462.86,468.8,473.44,471.26,469.01,478.12,477.52,464.3,464.86,478.44,480.65,490.71,496.69,502.11,528.07,539.18,538.02,549.74,529.02,541.33,551.6,549.67,555.26,548.65,558.35,527.72,518.99,523.81,524.13,524.13,504.01,531.9,517.73,533.49,515.27,512.94,518.4,551.85,553.25,536.93,537.21,517.41,519.63,540.49,516,514.07,510.06,532.61,535.77,546.92,546.92,572.35,561.52,566.23,555.68,553.5,562.54,557.02,540.77,549.91,530.46,526.17,536.23,561.2,552.87,587.41,587.41,535.91,503.24,489.45,475.06,489.94,467.78,476.89,457.79,465.88,486.04,487.55,495.11,480.16,476.86,478.83,488.04,507.21,491.63,466.02,463.81,491.87,495.81,480.02,469.05,469.05,458.18,449.74,469.29,477.38,472.04,455.89,468.45,459.51,442.28,419.35,436.69,452.41,439.57,434.89,422.55,437.6,458.95,464.26,475.34,472.04,476.54,462.26,487.48,482.1,484.21,497.5,477.66,463.59,448.15,455.29,428.1,419.73,430.53,421.95,408.86,402.95,411.04,398.73,398.73,404.05,411.75,414.67,406.93,396.76,402.64,383.12,382.73,403.2,388.15,397.36,400.28,417.9,399.12,395.71,371.97,377,365.53,375.52,393.46,388.6,410.97,391.63,389.52,374.46,386.67,374.92,381.74,404.75,420.26,420.26,412.56,402.6,412.7,404.36,404.5,406.86,395.57,377.21,358.35,338.8,339.85,342.67,315.12,315.97,315.97,334.75,330.43,328.1,342.46,343.33,334.22,323.39,320.01,303.45,303.45,302.5,304.47,319.21,320.75,311.71,312.1,313.33,322.44,332.29,327.61,345.52,359.58,365.25,357.62,355.26,347.91,363.91,369.89,372.78,374.25,369.29,383.43,390.64,385.58,379.28,350.55,369.5,371.19,388.25,386.14,381.6,372.85,380.83,368.03,354.59,358.53,356.95,369.33,347.52,339.57,332.47,330.88,322.93,320.93,320.93,317.59,323.39,329.9,339.47,338.73,317.94,318.82,312.77,312.59,315.58,309.95,306.33,299.12,296.48,291.73,295.99,302.5,296.94,288.18,303.38,314.49,313.82,309.95,290.54,278.54,268.38,267.36,279.35,263.17,261.73,264.61,271.76,276.68,289.91,298.77,307.88,310.02,304.4,315.58,310.55,315.83,308.69,303.55,322.55,334.29,342.81,331.97,368.59,388.78,378.51,388.53,366.58,367.39,368.27,369.82,376.5,378.72,378.72,372.21,363.95,363.17,385.51,376.4,375.34,374.36,368.31,373.23,382.03,377.56,384.7,393.49,385.65,367.78,368.38,365.78,364.05,372.49,343.3,341.96,341.96,335.35,331.45,341.68,342.53,342.53,340.24,349.31,344.42,366.76,374.57,380.02,387.13,387.62,386.81,386.81,384.84,385.86,373.41,385.68,401.55,397.43,400.81,406.54,395.71,380.58,392.16,418.61,437.07,422.02,413.96,423.92,407.84,408.3,403.69,409.88,416.6,420.19,405.87,406.05,406.05,391.42,388.36,397.15,391.52,394.2,408.55,412.45,416.64,418.43,416.95,409.32,417.34,411.68,402.36,407.46,423.29,416.74,432.04,431.23,436.3,423.5,418.08,431.87,420.44,418.11,409.43,421.56,429.51,432.04,430.25,422.51,412.66,402.57,402.57,409.78,409.36,398.03,399.12,397.12,393.21,391.38,388.11,402.36,399.09,399.61,389.06,388.01,392.82,397.57,397.29,394.51,398.49,395.53,408.23,407.14,400.42,405.94,406.12,408.34,425.99,425.33,442.14,456.98,446.54,445.13,437.88,428.17,458.92,478.58,478.58,480.37,468.87,474.25,473.55,470.38,471.12,474.89,479.07,478.79,492.47,498.73,496.55,492.82,488.67,488.67,487.23,480.72,488.64,478.61,491.73,515.48,506.61,507.32,508.41,511.68,511.68,500.39,493.77,490.93,494.41,483.86,488.53,501.76,502.08,511.78,508.3,498.7,471.47,479.77,486.63,492.65,488.99,514.03,534.4,533.2,536.86,518.22,519.91,512.35,528.95,520.61,510.59,508.65,488.32,499.09,492.72,486.28,483.96,501.79,523.29,520.05,520.58,501.3,507.77,511.5,527.54,530.95,537.32,541.65,541.65,540.31,538.8,521.39,518.92,516.04,506.4,508.55,508.51,486.28,493.39,484.38,481.78,475.52,478.97,480.44,471.61,475.06,486.18,486.99,490.71,480.9,489.98,489.91,493.46,492.97,497.36,500.11,510.02,496.45,495.95,502,497.54,472.85,471.76,472.14,474.5,457.65,460.22,461.84,460.89,465.53,475.87,487.2,491.56,493.7,498.56,507.32,503.59,530,526.7,541.96,546.5,544.53,522.65,536.65,524.97,525.78,525.78,528.81,530.46,520.79,525.36,526.84,533.2,521.53,514.07,508.97,521.95,519.59,545.69,553.01,552.2,568.91,569.64,564.05,570.98,551.95,567.67,570,570,577.84,577.59,573.76,570.07,542.98,532.71,525.18,524.09,533.1,531.23,526.94,534.47,532.01,532.01,540.84,539.47,563.98,590.71,591.98,587.58,612.52,607.21,587.06,592.61,584.73,577.91,587.3,591.56,601.79,593.39,601.13,611.64,653.68,652.62,634.22,654.91,660.08,701.97,701.97,665.28,669.47,702.53,693.49,715.97,713.54,694.83,709.18,739.54,736.86,729.48,746.29,747.84,723.04,708.3,720.86,705.45,706.12,698.73,706.05,708.2,721.28,741.47,739.54,733.24,726.94,731.62,725.4,725.4,734.05,724.97,729.44,715.41,731.09,735.28,740.1,736.02,749.14,731.13,723.46,736.83,703.1,683.5,667.5,666.41,679.7,689.62,694.69,715.37,721.98,698.73,682.34,696.13,717.87,734.65,729.23,729.37,725.75,737.71,726.8,738.02,765,752.83,745.97,773.65,773.13,767.32,766.62,776.96,776.96,778.47,770.49,761.66,756.52,753.46,746.46,785.68,779.99,779.92,802.53,808.9,835.91,835.56,833.73,854.24,871.72,871.72,844.14,828.03,808.44,824.02,816.64,817.9,830.07,835.07,847.2,855.82,855.82,853.29,866.3,884.52,896.83,848.61,856.14,863.7,864.72,774.08,765.56,739.57,786.04,772.6,726.45,711.64,726.24,723.07,692.02,746.39,690.47,639.5,639.78,644.78,627.89,670.24,672.46,679.18,706.3,709.22,745.09,731.27,741.96,725.15,735.56,704.19,712.87,690.22,688.6,678.47,678.79,693.84,693.84,644.99,641.51,633.98,614.67,624.52,626.28,654.03,644.42,662.93,659.8,663.35,654.73,691.91,675.91,682.52,692.16,694.02,737.28,720.79,710.69,693.63,707.53,702.04,710.41,703.94,706.58,721.28,717.41,721.28,752.34,671.9,649.28,644.53,655.5,648.82,643.69,642.63,646.32,656.07,651.92,668.73,651.78,638.69,645.02,639.54,655.93,659.58,682.69,675.45,663.24,656.38,642.95,654.24,594.02,600.53,595.53,599.68,618.19,615.12,613.96,609.22,602.6,602.6,614.53,644.64,644.25,637.21,605.1,608.58,604.5,591.52,601.93,594.72,595.67,595.88,599.16,581.96,567.85,575.41,589.03,592.23,592.23,589.34,586.81,575.59,572.04,576.4,598.17,624.27,625.47,622.55,622.55,603.76,600.98,610.8,627.44,655.93,675.52,675.52,678.4,687.69,670.77,656.88,614.03,607.98,616.53,639.18,634.37,628.91,628.07,635.49,642.98,633.13,646.01,644.39,636.26,648.15,595.15,595.15,604.99,612.24,619.1,604.92,592.93,582.27,592.72,550.97,556,535.1,537.71,546.32,533.03,547.59,527.58,517.02,524.31,527.44,547.52,546.82,539.96,543.3,543.02,535.07,545.02,540.42,530,519.45,510.24,510.45,512.35,519.7,476.64,446.54,467.29,453.61,526.66,486.25,509.81,508.37,511.61,486.07,483.5,483.5,476.82,486.46,505.03,528.21,533.06,530.39,526.03,530.11,523.95,545.55,543.83,538.27,548.05,548.72,547.34,590.89,608.62,612.52,614.67,582.38,583.68,582.94,570.63,564.61,554.03,554.03,569.22,568.38,560.96,551.35,553.18,568.91,569.57,577.52,586.49,597.22,611.22,607.77,615.55,600.04,621,612.35,607.95,607.95,596.06,604.85,633.77,643.93,645.52,644.42,643.93,646.36,668.34,672,672,671.05,685.86,687.27,696.55,696.2,693.28,700.98,685.23,677.17,669.86,677.49,658.25,657.79,661.7,653.15,669.26,662.72,666.16,633.35,633.1,643.05,630.14,626.59,644.21,650.26,648.54,662.86,668.41,662.12,568.98,575.2,570.59,566.16,562.22,571.54,569.79,578.65,578.23,581.32,565.46,565.46,554.24,549.6,556.6,572.46,570,575.1,574.82,598.49,590.22,601.23,610.41,626.56,667.46,668.66,705.31,706.54,708.55,702.08,717.27,720.89,720.15,765.88,786.46,765.14,787.58,744.14,765.07,774.89,738.48,772,767.46,800.49,800.98,791.38,802.43,794.93,775.8,803.62,804.61,813.68,800.7,829.23,817.97,819.91,836.12,809.67,847.31,821.42,809.25,826.87,804.33,811.57,785.19,794.97,804.47,791.84,827.05,774.64,787.94,812.21,852.83,879.25,879.25,887.27,896.06,933.27,944.88,947.73,942.67,943.23,939.64,967.82,950.09,911.75,918.99,910.45,873.27,891.66,901.9,911.04,915.34,917.27,917.27,921.21,925.25,914.42,903.94,945.73,1000.07,1041.19,1027.79,990.64,1059.37,1080.69,1072.35,1061.87,1122.34,1150.23,1150.23,1119.35,1144,1121.32,1133.94,1123.67,1170.28,1184.49,1200.63,1133.73,1155.12,1120.89,1046.78,1069.26,1134.4,1162.75,1157.47,1195.5,1155.08,1248.36,1248.36,1263.21,1298.98,1300.84,1320.37,1313.93,1329.34,1389.2,1321.56,1309.53,1309.11,1235.74,1258.39,1218.89,1142.24,1192.19,1216.6,1234.86,1186.32,1201.3,1217.66,1239.75,1229.23,1256.45,1255.93,1272.56,1315.48,1299.12,1190.82,1185.97,1136.55,1202.22,1244.46,1225.71,1225.71,1240.31,1246.25,1356.74,1399.26,1405.17,1391.95,1391.63,1386.77,1371.44,1396.2,1377.49,1387.02,1419.21,1420.72,1466.9,1424.06,1340.52,1345.73,1387.58,1368.55,1376.64,1445.02,1507.63,1444.39,1531.62,1560.39,1516.71,1535.74,1549.63,1535.77,1454.7,1431.27,1501.41,1503.2,1520.08,1520.08,1600.04,1576.68,1581.71,1583.05,1611.57,1723.71,1761.41,1764.69,1593.42,1731.16,1755.93,1748.19,1943.86,1995.25,2060.43,1998.7,2085.54,2170.63,2170.63,2251.78,2060.78,2071.65,2349.63,2204.85,2443.33,2543.09,2289.52,2121.14,2121.14,2085.09,1950.4,2006.68,2070.56,2119.24,2023.88,2095.32,2038.09,1973.02,1863.03,1849.1,1985.75,1948.36,1979.6,1886.21,1818.11,1675.91,1535.17,1764.93,1785.68,1822.76,1922.69,1879.14,1855.36,1896.38,1836.51,1848.79,1928.07,1880.2,1783.96,1882.91,1809.11,1745.23,1745.37,1731.69,1703.1,1688.5,1687.51,1696.66,1623.88,1612.35,1554.17,1542.24,1533.27,1599.4,1599.4,1663,1649.14,1596.94,1605.66,1492.12,1481.43,1461.06,1468.17,1563.74,1632.92,1661.84,1668.59,1668.13,1705.94,1712.14,1800.95,1798.73,1861.77,1899.54,1907.42,1865.18,1831.34,1792.37,1783.43,1750.02,1632.92,1570.98,1512.52,1439.64,1453.08,1424.48,1424.48],"테슬라":[null,100,101.33,101.12,101.07,101.96,99.94,98.82,95.35,93.97,93.67,95.24,96.56,97.43,94.99,92.63,94.24,90.68,91.84,91.92,94.29,92.47,92.22,95.54,96.53,96.53,98.28,98.02,94.74,94.66,90.9,90.69,93.36,92.88,96.53,96.1,96.05,96.17,99.03,99.3,98.75,101.2,101.32,104.35,103.8,104.18,106.62,106.62,109.72,109.82,107.29,106.8,106.8,108.45,113.44,113.32,114.45,115.59,114.88,114.81,114.74,118.82,118.82,117.74,119.13,121.83,122.31,124.4,127.25,127.18,126.2,126.42,125.26,125.91,124.56,125.72,125.61,128.83,128.68,130.98,134.54,134.55,140.24,140.43,139.82,134.41,136.05,136.05,138.63,136.69,127.94,128.44,123.06,124.94,124.95,125.18,125.73,125.55,124.24,123.38,122.39,121.79,123.03,128.94,127.81,130.97,130.69,130.9,125.28,127.45,127.33,131.52,135.05,138.66,138.63,138.9,139.09,149.19,151.78,147.43,149.28,151.2,156.12,154.29,148.35,151.93,151.93,150.65,150.06,152.69,151.19,152.73,153.95,156.82,155.02,154.25,156.96,161.34,159.37,155.44,147.66,154.11,153.53,160.56,162.54,161.48,162.33,157.87,158.43,152.99,156.46,155.35,155.11,151.86,155.04,158.34,162.5,162.5,167.47,170.43,170.11,169.85,173.58,176.35,179.74,184.92,178.58,179.42,187.89,190.24,187.59,185.62,184.82,186.04,188.12,191.22,191.64,188.66,181.1,185.54,180.29,180.72,176.23,176.23,163.47,154.35,156.54,157.95,163.54,164.69,161.63,163.82,159.71,164.05,162.56,164.89,164.13,171.18,169.72,171.85,167.15,167.46,161.66,159.71,162.87,173.47,178.37,177.51,182.53,181.68,177.62,178.85,181.82,181.08,181.37,175.88,173.65,168.85,170.6,176.31,176.39,173.95,172.75,173.6,176.51,177.87,177.62,177.62,174.72,172.19,175.23,171.62,181.76,181.29,183.03,188.74,189.82,192.41,187.47,186.87,183.16,175.47,172.42,172.55,170.41,169.72,170.47,170.69,173.99,177.43,177.59,178.36,171.39,177.72,177.22,177.76,177.71,175.22,177.8,179.74,175.83,172.47,168.43,168.59,162.85,163.01,160.36,159.97,165.69,160.47,149.56,152.98,151.32,152.96,152.13,151.43,151.43,157.63,154.28,155.58,156.18,157.45,154.3,158.83,156.23,156.23,157.7,158.33,158.7,153.7,154.36,153.2,152.53,151.78,156.56,155.55,157.49,164.38,170.44,169.44,168.87,171.65,169.36,165.48,164.42,165.76,162.53,162.53,158.57,155.75,157.61,155.6,160.19,158.55,157.24,158.22,168.13,166.77,167.32,168.9,168.03,168.03,169.95,173.5,172.21,174.93,175.7,176.32,172.87,168.74,171.35,174.69,172.83,177.08,174.55,171.8,166.49,166.91,172.42,157.54,155.14,157.79,161.76,161.08,166.96,167.67,167.67,167.31,166.58,173.01,175.95,178.63,175.42,171.45,165.39,167.48,166.6,164.03,166.08,164.48,163.51,172.68,170.84,163.24,162.73,160.6,156.71,155.21,158.19,154.48,150.7,152.02,139.53,128.83,133.01,133.01,126.18,133.7,143.41,152.79,149.58,144.76,152.28,150.4,146.97,150.1,145.54,143.78,146.61,149.97,145.05,141.62,141.67,140.28,142.68,146.97,146.88,149.89,150.51,142.16,146.98,151.32,150.92,153.36,152.44,150.46,145.92,142.03,143.18,142.21,138.35,142.18,137.44,139.47,138.86,139.36,139.36,141.82,145.79,142.3,145.84,148.3,145.5,159.68,157.97,158.76,165.98,171.31,172.31,178.78,179,185.33,176.2,181.03,173.68,166.74,166.43,170.92,172.17,174.89,171.4,167.46,155.36,155.36,154.51,154.38,159.18,161.16,159.41,158.28,159.36,154.98,161.27,161.85,160.04,156.72,151.53,148.65,154.3,153.26,148.52,145.02,149,150.35,174.69,174.01,170.92,189.7,185.09,176.15,177.67,178.12,173.74,169.27,167.65,152.68,154.15,160.88,160.75,159.98,161.34,159.56,155.86,152.44,151.51,150.76,150.76,144.41,140.31,140.41,131.56,142.69,139.66,145.2,144.66,147.53,147.35,142.42,149.44,149.1,149.48,149.77,150.43,154.72,153.69,132.33,155.28,150.44,147.33,140.85,130.92,125.22,131.34,128.38,126.06,129.33,129.74,138.23,135.83,131.9,129.94,130.42,147,144.19,157.36,165.38,167.35,164.88,168.58,172.06,173.13,170.62,170.45,174,175.62,175.18,165.57,169.29,171.92,174.14,177.08,176.66,173.67,169.02,169.02,162.84,172.92,171.88,173.86,170.51,175.16,179.16,179.77,179.77,181.45,178.9,182.49,183.3,183.22,188.31,182.77,174.13,168.44,166.41,157.62,159.81,147.63,147.63,162.97,157.99,166.86,166.33,154.99,150.11,158.77,167.4,167.6,169.19,172.41,173.55,167.12,172.14,172.95,173.58,151.06,151.06,149.39,143.73,145.69,148.45,148.12,148.66,154.32,153.44,156.03,156.37,160.6,158.54,153.69,152.83,156.35,155.83,154.02,151.82,153.87,153.87,152.75,151.21,145.55,147.29,149.32,148.86,157.3,159.87,147.33,142.62,138.21,138.06,138.23,142.01,145.39,141.62,144.42,144.91,137.65,134.68,133.67,136.74,136.95,132.21,130.15,133.82,137.35,139.25,139.87,144.52,142.88,145.84,133.83,137.42,136.54,136.09,137.97,134.15,133.79,133.13,136.62,135.55,136.57,136.57,131.32,131.89,129.27,123.76,117.52,120.68,119.29,116.95,122,127.46,127.61,123.47,122.36,120.94,119.71,113.45,116.1,115.92,114.11,105.47,102.63,102.49,96.32,97.7,95.27,95.27,94.31,94.89,94.07,92.54,89.44,96.76,98.25,102.93,102.2,106.39,108.5,104.58,106.91,107.41,112.46,112.32,113.16,109.76,110.88,111.77,109.83,109.59,111.37,111.68,113.53,112.22,117.4,117.4,116.5,115.12,114.98,119.41,119.25,122.48,126.69,126.13,127.37,126.71,129.03,127.78,130.03,132.38,114.36,113.97,117.83,121.08,120.75,116.87,117.12,114.11,115.32,116.66,119.1,117.45,114.45,117.45,109.76,107.77,109.92,113.36,112.88,110.37,111.03,105.65,107.45,106.99,107.75,110.81,112.75,112.75,112.45,110.29,114.74,113.67,115.84,117.72,123.49,122.88,122.54,121.35,122.34,121.69,123.24,120.26,120.56,111.55,114.3,121.23,121.01,120.38,122.29,121.51,116.46,115.66,118.81,119.97,122.21,122.31,123.89,128.42,128.89,129.82,130.93,128.42,126.69,127.73,127.28,149.77,163.99,163.78,158.04,157.43,157.39,156.58,158.66,158.54,163.22,167.69,168.49,172.47,174.89,172.98,174.6,176.01,174.92,179.68,176.03,177.34,166.45,168.09,164.39,165.57,165.57,164.9,167.36,168.02,166.44,165.11,167.87,169.69,174.34,176.27,179.76,179.11,190.66,189.41,196.49,201.93,202.7,209.52,212.53,212.53,215.37,215.09,207.26,209.07,215.03,221.41,225.67,234.42,245.96,240.56,238.97,262.31,268.84,259.13,256.63,255.14,255.14,273.48,284.65,285.97,282.28,278.88,283.32,290.36,320.26,325.14,389.82,443.33,367.18,374.31,373.87,385.47,387.02,383.47,401.82,399.84,399.84,429.01,458.5,449.5,450.3,416.71,399.78,389.22,339.35,333.84,371.64,372.59,374.58,362.11,351.58,303.86,322.52,316.97,280.15,273.19,222.43,215,180.53,213.72,213.67,217.05,252.39,269.5,263.96,257.06,250.95,261.88,240.67,227.13,239.9,258,272.6,274.3,286.37,286.37,325.33,354.79,364.75,372.44,376.78,373.01,343.21,365.89,352.66,362.41,399.2,384.39,400.07,390.76,350.5,380.42,383.93,391.11,389.84,409.53,405.46,404.52,395.3,401.48,399.41,406.63,403.82,407.6,413.61,408.26,408.26,409.25,409.93,402.72,417.31,448.85,440.58,441.28,432,442.63,474.75,470.12,512.29,486.2,467.43,495.23,490.84,495.67,501.75,500.22,496.94,500.66,480.21,492.77,479.65,504.45,539.66,559.56,604.06,604.06,685.48,694.62,682.63,696.83,771.98,748.19,758.06,772.66,749.98,750.08,821.13,783.83,795.81,756.19,708.18,769.45,737.91,749.22,743.41,715.06,742.17,743.17,742.18,744.46,726.03,708.97,686.89,777.03,810.14,824.98,917.41,943.12,938.84,1000.46,1024.53,1006.65,1011.21,1076.1,1118.87,1106.2,1245.24,1187.09,1117.92,1017.04,1045.33,1045.33,825.15,915.29,927.93,931.38,1048.58,1123.89,1103.9,1058.1,1104.88,1122.97,1060.1,950.47,969.04,1017.89,1052.53,1047.2,1072.04,1119.9,1037.26,1063.72,1034.48,1062.77,1064.32,1084.51,1105.25,1116.12,1152.73,1121.7,1098.68,1076.59,1054.38,1056.12,1064,1051.1,1050.23,1061.22,1014.59,1026.61,969.66,1000.82,1059.27,1051.98,1094.73,1074.39,1052.68,1025.44,1042.36,1028.94,1020.79,1019.77,1103.53,1216.05,1247.61,1223.47,1304.04,1387.83,1434.35,1434.35,1463.74,1418.36,1461.24,1421.41,1482.78,1496.93,1603.68,1623.97,1510.52,1566.97,1524.29,1598.86,1582.41,1556.22,1639.01,1736.72,1623.92,1600.13,1614.22,1653.68,1653.68,1658.48,1664.23,1736.17,1763.38,1823.6,1836.95,1889.1,2039.18,2199.06,2027.06,2122.64,2135.06,2111.55,2064.47,2064.47,2110.43,2125.17,2111.52,2115.65,2201.01,2206.73,2159.43,2087.64,1982.93,2098.58,2180.99,2135.76,2124.02,2129.62,2157.58,2122.69,2011.15,2028.24,2039.38,2039.38,1989.65,1994.48,1967.56,1952.37,1785.45,1746.31,1854.22,1704.78,1687.99,1795.27,1715.33,1632.27,1552.9,1494.2,1406.87,1683.19,1669.4,1748.21,1733.54,1769.05,1691.44,1753.74,1632.17,1636.44,1674.25,1654.66,1574.97,1600.25,1546.08,1527.54,1588.34,1669.07,1653.63,1653.63,1726.85,1728.27,1676.67,1708.73,1691.79,1754.16,1904.94,1829.75,1846.29,1848.62,1785.77,1796.67,1859.46,1798.42,1822.68,1844.67,1761.06,1735.22,1691.74,1772.8,1711.48,1683.24,1676.6,1658.1,1680.17,1571.89,1542.31,1474.06,1428.58,1473.69,1441.43,1444.03,1408.02,1466.29,1451.55,1515.42,1511.05,1547.13,1576.42,1562.35,1562.35,1559.05,1512.12,1431.46,1496.95,1512.14,1508.3,1496.28,1524.61,1524.04,1543.53,1497.73,1511.49,1540.81,1557.57,1551.38,1558.57,1640.69,1698.79,1678.92,1721.03,1701.13,1698.49,1694.04,1696.49,1696.49,1648.21,1610.9,1631.29,1641.64,1713.48,1670.6,1632.72,1625.77,1609.83,1614.82,1650.51,1637.49,1622.42,1607.73,1643.31,1611.23,1616.72,1692.61,1717.23,1773.38,1773.55,1776.5,1785.77,1746.96,1783.6,1774.18,1768.75,1804.81,1792.12,1714.65,1663.53,1721.7,1682.92,1699.89,1764.96,1770.43,1777.2,1752.11,1779,1826.45,1838.47,1834.4,1830.15,1833.1,1833.1,1881.45,1883.83,1886.3,1839.85,1856.66,1860.39,1888.73,1891.62,1897.87,1824.6,1847.62,1879,1883.25,1935.1,1977.51,1943.03,1952.4,1937.83,1937.18,1952.95,1950.6,1955.99,1983.13,1962.84,1978.96,2013.39,2026.79,2044.88,2106.63,2174.3,2159.7,2163.53,2233.99,2273.18,2561,2544.93,2593.48,2691.39,2783.75,3020.12,2928.68,3033.29,3073.39,3053.85,2906.04,2557.6,2668.67,2657.58,2582.39,2532.34,2635.64,2721.3,2739.72,2841.37,2890.87,2771.33,2788.75,2788.75,2703.58,2841.2,2860.61,2736.27,2710.28,2536.28,2521.39,2628.19,2671.2,2508.37,2541.43,2414.94,2395.2,2438.88,2316.26,2330.38,2248.84,2345.27,2521.04,2666.3,2666.3,2733.62,2719.95,2714.25,2674.65,2640.76,2998.1,2872.68,2719.08,2660.55,2566.25,2644.11,2659.8,2764.31,2577.74,2622.84,2622.84,2575.12,2488.01,2489.55,2358.69,2323.95,2294.97,2342.47,2071.82,2114.92,2340.75,2327.08,2263.13,2226.85,2307.26,2267.33,2303.96,2328.95,2260.36,2149.03,2188.42,2305.04,2307.44,2189.89,2141.49,2141.49,2052.9,1909.24,2001.02,2023.76,2175.1,2159.95,2198.74,2097.28,2094.78,2010.55,2060.07,2146.46,2094.81,1987.48,1915.06,2003.82,2099.63,2178.02,2262.46,2301.86,2483.83,2496.65,2533.66,2525.46,2728.37,2747.69,2733.74,2692.79,2710.26,2862.34,2726.92,2613.22,2641.96,2562.57,2438.73,2466.27,2554.78,2461.39,2461.39,2509.6,2569.22,2441.9,2520.82,2511.49,2493.93,2190.06,2202.78,2192.79,2175.92,2256.33,2272.1,2380.48,2182.22,2163.15,1966.89,1999.2,1834.17,1819.18,1923.11,1810.11,1903.17,1773.73,1772.75,1659,1686.49,1569.69,1646.26,1768.53,1898.22,1898.22,1894.8,1850.09,1936.63,1758.08,1786.3,1790.84,1813.18,1796.99,1740.94,1617.3,1655.93,1746.71,1597.53,1624.97,1624.97,1776.98,1769.85,1762.23,1841.97,1836.07,1744.19,1712.9,1682.79,1703.71,1703.71,1747.21,1737.22,1833.25,1879.88,1756.78,1747.24,1777,1786.55,1799.69,1803.29,1840.65,1855.42,2036.88,2040.91,2012.34,1940.58,2060.22,2105.8,2227.62,2228.57,2253.39,2304.44,2313.71,2160.3,2177.2,2124.04,2206.68,2148.76,2249.21,2318.86,2298.19,2278.95,2270.5,2224,2173.37,2222.4,2227.22,2219.53,2159.7,2135.19,2081.81,2066.15,2077.77,2025.66,2025.66,2057.22,2126.79,2168.47,2246.59,2282.12,2189.99,2268.55,2277.1,2274.1,2316.98,2314.43,2254.99,2163.45,2064.05,2069.14,2121.1,2157.6,2010.67,1988.48,1817.18,1869.96,1805.26,1785.17,1672.27,1671.45,1623.02,1628.57,1662.15,1536.73,1644.39,1650.68,1664.55,1553.9,1607.58,1583.66,1667.4,1684.04,1687.42,1713.13,1705.78,1707.88,1611.62,1614.1,1555.33,1477.44,1434.1,1331.33,1429.76,1469.11,1431.48,1457.49,1401.27,1373.16,1350.82,1258.46,1273.75,1373.38,1373.38,1370.83,1371.28,1355.62,1459.59,1459.59,1460.79,1367.76,1348.04,1304.71,1300.21,1342.27,1258.08,1206.58,1175.47,1181.99,1126.22,1123.52,1033.04,1031.31,939.7,923.21,923.21,817.88,844.94,913.24,923.43,923.43,810.39,851.92,827.18,847.57,897.87,890.97,923.73,926.28,917.59,917.59,985.73,965.42,953.35,1000.2,1077.64,1078.69,1082.74,1201.48,1333.65,1249.39,1298.57,1359.96,1411.39,1424.21,1460.04,1475.41,1509,1554.2,1476.01,1459.14,1568.67,1606.08,1514.62,1561.62,1561.62,1479.61,1505.77,1514.84,1475.94,1556.52,1542.13,1520.09,1431.11,1482.76,1452.92,1407.19,1364.39,1296.32,1300.21,1308.01,1373.83,1352.77,1380.35,1350.37,1373.76,1481.18,1432.98,1441,1427.43,1437.93,1418.29,1453.45,1463.94,1555.25,1460.12,1443.7,1390.77,1387.33,1387.33,1383.2,1400.29,1353.44,1393.62,1386.88,1402.17,1381.7,1353.82,1221.88,1237.54,1218.58,1204.48,1152.61,1200.88,1231.77,1213.18,1201.78,1204.03,1208.46,1274.88,1287.85,1268.05,1263.48,1290.02,1259.28,1247.06,1248.34,1303.36,1326.08,1350.44,1415.89,1392.65,1371.13,1382.9,1448.12,1448.12,1508.02,1528.79,1555.7,1604.05,1631.34,1659.08,1683.52,1760.66,1832.18,1872.88,1939.45,1925.06,1918.39,1953.17,1953.17,2057.45,1945.07,1983.68,1923.63,1807.06,1875.73,1920.94,1930.38,1962.39,2097.71,2097.71,2117.65,2073.12,2057.3,2021.17,2022.52,2039.01,2083.31,2109.4,2176.87,2199.06,2183.47,1970.86,1949.27,2017.04,1988.71,1981.73,1916.96,1997.4,2004.82,1957.14,1904.97,1944.03,1903.09,1885.03,1871.91,1815.61,1839.22,1819.06,1797.39,1746.41,1691.24,1643.41,1615.45,1733.82,1748.14,1775.65,1724.52,1788.62,1790.34,1927.98,1925.88,1934.73,1836.75,1836.75,1922.81,1888.55,1885.33,1862.91,2050.93,2005.2,2033.83,2069.37,2057,1988.71,1997.85,1968.54,1916.89,1835.77,1851.59,1830.08,1802.94,1847.02,1875.81,1886.15,1848.14,1957.82,1949.5,1953.1,1946.65,1976.26,1971.54,1940.65,1882.55,1903.54,1910.52,1819.28,1650.08,1589.21,1589.88,1623.17,1592.43,1542.51,1554.05,1479.53,1505.62,1541.76,1638.09,1648.96,1643.79,1665.6,1665.08,1574.14,1609.15,1677.07,1779.77,1820.48,1751.14,1756.46,1766.21,1808.19,1755.79,1755.79,1765.08,1769.8,1849.57,1830.23,1799.79,1790.42,1766.06,1789.59,1794.47,1818.98,1827.98,1797.24,1776.78,1793.87,1882.03,1900.39,1889.75,1928.28,1852.72,1907.89,1893.2,1893.2,1923.71,1959.92,1898,1862.76,1862.31,1787.57,1783.67,1780.37,1802.56,1761.41,1753.76,1703.38,1640.94,1640.94,1648.58,1615.9,1588.39,1590.71,1565.3,1567.84,1558.02,1369.11,1373.76,1431.33,1436.28,1404.04,1415.81,1408.69,1357.34,1387.63,1406.22,1421.06,1451.12,1410.34,1379.53,1414.69,1502.7,1498.95,1498.95,1452.55,1460.12,1479.91,1439.13,1494.83,1497.3,1514.62,1513.42,1519.12,1410.42,1354.94,1323.45,1339.27,1314.46,1332.68,1330.95,1270.53,1218.2,1226.22,1302.91,1284.32,1316.86,1295.57,1280.65,1294.14,1331.93,1348.12,1317.83,1317.83,1313.56,1249.16,1262.28,1282.75,1236.19,1296.77,1326,1287.62,1308.91,1282.3,1210.56,1177.8,1165.35,1123.97,1102.38,1064.9,1084.61,1215.43,1275.78,1261.61,1454.72,1373.98,1349.32,1349.47,1358.31,1385.08,1332.98,1309.81,1289.19,1262.96,1288.6,1331.03,1304.34,1310.71,1330.35,1311.53,1398.87,1350.22,1302.46,1343.7,1343.7,1325.03,1320.83,1340.32,1335,1321.58,1310.19,1311.91,1333.95,1330.5,1302.84,1279.37,1329.08,1367.91,1334.47,1405.17,1385.83,1385.83,1361.16,1371.96,1368.73,1404.49,1472.11,1479.98,1483.43,1573.24,1733.67,1847.09,1847.09,1885.55,1896.2,1966.59,1973.56,1806.91,1860.89,1893.95,1923.33,1862.91,1868.38,1793.19,1885.48,1847.02,1619.2,1651.13,1647.76,1739.97,1668.9,1739.74,1625.72,1556.82,1490.93,1504.12,1437.55,1490.63,1499.33,1480.51,1558.02,1509.67,1605.33,1620.17,1669.65,1657.5,1673.77,1579.24,1651.66,1598.36,1568.37,1542.43,1546.4,1605.1,1605.1,1578.79,1644.83,1725.5,1579.76,1621.3,1695.51,1710.21,1722.8,1726.4,1700.09,1708.26,1703.23,1828.58,1786.07,1874.16,1906.17,1926.78,1905.79,1952.57,1961.34,1934.28,1866.81,1804.14,1874.76,1805.41,1832.93,1807.06,1789.97,1632.77,1642.96,1646.03,1659.23,1655.93,1654.51,1640.64,1634.04,1601.65,1952.72,2018.02,1967.94,1945.52,1930.76,1873.03,1866.51,1820.48,1884.95,2163,2225.82,2408.07,2623.82,2462.57,2475.69,2332.8,2404.32,2539.41,2593.83,2564.07,2546.15,2643.01,2538.28,2535.58,2495.55,2495.55,2587.54,2676.97,2634.46,2683.27,2769.93,2917.84,2922.11,3006.07,3184.34,3134.34,3270.25,3471.09,3597.33,3299.49,3269.8,3156.53,3228.05,3465.54,3465.54,3404.44,3235.99,3129.17,3027.44,2843.32,3076.92,3081.49,2956.37,2960.72,2960.72,2959.22,3023.46,2971.36,3210.21,3102.25,3197.31,3197.31,3179.09,3111.92,3091.46,3047.98,2977.29,2984.33,2916.94,3000.75,3033.14,2876.31,2940.25,2835,2806.14,2710.93,2629.29,2462.64,2522.69,2668.35,2667.6,2667.6,2654.63,2702.98,2656.8,2532.36,2477.86,2269.98,2180.02,2113.67,2196.36,2133.91,2039.38,2092.31,1974.99,1969.14,1665.38,1728.57,1859.84,1804.29,1874.01,1784.27,1689.06,1768.15,1771.15,1864.49,2086.99,2160.08,2039.53,2047.55,1975.74,1942.83,2012.54,2119.75,2003.7,1794.92,1748.89,1663.2,2040.58,1892.15,1891.47,1891.77,1904.97,1810.81,1809.46,1809.46,1705.48,1783.97,1879.7,1945.45,2136.16,2143.14,2189.24,2115.25,2102.95,2153.11,2101,2064.2,2070.72,2135.19,2235.94,2386.78,2504.4,2606.43,2569.99,2623.67,2564.52,2577.49,2508.52,2556.65,2543.91,2543.91,2720.45,2675.55,2687.02,2597.28,2569.02,2580.86,2489.25,2134.29,2212.55,2313.31,2444.58,2447.12,2392.25,2438.73,2467.36,2371.56,2414.29,2414.29,2415.11,2613.92,2552.38,2455.52,2442.25,2426.13,2381.38,2254.31,2366.31,2364.06,2364.06,2203.56,2232.57,2218.1,2322.98,2350.27,2375.68,2329.8,2411.44,2394.5,2471.26,2462.57,2489.7,2493.08,2288.72,2369.38,2440.83,2407.92,2391.72,2310.99,2268.7,2318.41,2314.36,2398.25,2415.94,2471.26,2541.58,2555.15,2544.21,2515.72,2478.08,2512.57,2468.71,2428.16,2399.75,2548.93,2598.33,2636.34,2620.82,2593.68,2502.9,2502.9,2469.09,2504.55,2537.83,2630.12,2596.83,2601.1,2607.25,2764.83,2968.21,3073.92,3160.73,3192.51,3124.97,3194.09,3255.11,3192.44,3319.43,3174,3301.51,3322.58,3333.9,3444.4,3268.53,3222.28,3397.85,3246.71,3288.7,3265.08,3099.78,3267.78,3217.85,3262.16,3214.18,3293.34,3354.22,3318.01,3290.79,3365.84,3251.44,3391.62,3452.57,3459.77,3299.27,3422.66,3511.2,3330.45,3463.97,3342.82,3219.95,3337.72,3295.67,3228.05,3013.57,3031.26,3065.52,3008.02,3028.56,2962.89,2931.86,3131.94,3144.09,3197.91,3197.91,3224.82,3224.6,3217.85,3349.04,3407.44,3410.97,3295.37,3337.27,3384.35,3350.17,3440.65,3563.22,3672.45,3502.87,3623.64,3607.38,3663.83,3640.06,3638.86,3638.86,3562.32,3445.75,3406.69,3371.38,3284.05,3386,3245.74,3234.12,3267.03,3336.07,3365.69,3352.49,3292.52,3287.8,3279.77,3279.77,3142.96,3234.34,3368.68,3366.44,3262.53,3230.3,3234.49,3122.79,3226.62,3162.15,3163.28,3043.71,2977.74,3081.94,3128.49,3187.64,3210.58,3126.62,3129.39,3129.39,3078.34,3083.51,3086.44,3087.26,2997.38,3068.97,3129.09,3062.97,3017.47,3023.54,2941.9,3043.18,3040.26,2974.14,2988.76,2992.95,3057.27,2961.24,2932.68,2965.37,2993.18,2944.53,2850.97,2758.46,2855.09,2871.43,2893.32,2789.57,2712.5,2663.4,2786.87,2858.16,2703.21,2703.21,2644.96,2598.71,2573.22,2590.98,2615.95,2641.96,2730.27,2938.3,2915.44,3003.3,2942.43,2896.85,2905.02,2801.64,2820.98,2838.75,2818.88,2794.74,2860.94,2929.83,2942.5,2918.96,2989.13,3087.04,3211.18,3336,3249.41,3338.02,3323.25,3165.38,3073.54,3029.46,3128.04,3132.47,3193.64,3193.64,3250.46,3301.21,3314.26,3266.96,3117.7,3176.62,3176.32,3136.96,2931.18,3065.75,2973.76,2860.64,2992.28,3046.85,3082.24,3033.59,2971.51,3002.32,3002.32,3036.51,2860.79,2815.21,2812.13,2846.54,3087.41,3153.08,3188.32,2949.55,2949.55,3146.86,3020.39,2954.12,3047.75,3056.82,2959.37,2970.01,2957.12,2931.63,2855.02,2770.53,2840.7,2803.81,2396.6,2346.67,2318.11,2304.76,2236.39,2315.33,2333.03,2414.51,2454.02,2410.54,2395.4,2463.24,2480.48,2494.95,2455.22,2548.55,2565.87,2543.61,2525.39,2632.22,2587.31,2720.23,2615.95,2625.69,2592.48,2659.88,2614.45,2758.38,2669.47,2676.37,2821.51,2654.41,2654.41,2759.96,2757.33,2725.47,2739.57,2691.06,2673.15,2684.39,2745.26,2730.8,2813.48,2840.47,2849.62,2833.28,2789.57,2679.67,2645.11,2659.88,2654.63,2778.17,2839.2,2853.82,2832.3,2811.24,2868.96,2833.95,2812.96,2752.46,2717.08,2659.2,2759.21,2801.56,2801.56],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1957.16,1960.95,1961.89,1893.89,1783.79,1921.37,1835.05,1835.05,1792.63,1784.53,1745.89,1760.32,1824.32,1816.42,1835.16,1855.16,1869.89,1927.26,1947.26,2018.84,2027.26,1996.53,1973.47,1968.11,1968.95,2000.42,1986.84,1993.68,2021.79,2043.37,2092.42,2200.53,2200,2196.53,2115.47,2110.53,1958.21,2043.68,2027.37,2027.37]},"symbols":{"AMD":"AMD","EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","어플라이드 머티어리얼즈":"AMAT","테슬라":"TSLA","팔란티어 테크":"PLTR"},"missing":[]}
};
