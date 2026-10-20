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
  "updatedAt": "2026-10-20T05:56:44.842Z",
  "checkedAt": "2026-10-20T05:56:44.842Z",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
      "status": "진행중",
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
  "history": {"updatedAt":"2026-10-20T05:56:46.520Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20160919,20160920,20160921,20160922,20160923,20160926,20160927,20160928,20160929,20160930,20161003,20161004,20161005,20161006,20161007,20161010,20161011,20161012,20161013,20161014,20161017,20161018,20161019,20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827,20260828,20260831,20260901,20260902,20260903,20260904,20260907,20260908,20260909,20260910,20260911,20260914,20260915,20260916,20260917,20260918,20260921,20260922,20260923,20260924,20260925,20260928,20260929,20260930,20261001,20261002,20261005,20261006,20261007,20261008,20261009,20261012,20261013,20261014,20261015,20261016,20261019,20261020],"series":{"AMD":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,93.68,100.72,107.76,104.74,102.16,103.45,103.88,101.87,97.13,96.26,94.25,100,100.57,99.71,90.52,96.12,97.56,100.14,110.2,121.55,125.14,128.45,124.86,126.44,126.44,126.01,126.87,128.3,128.02,120.55,122.56,124.71,135.78,137.36,148.56,148.56,153.45,151.44,151.58,156.03,153.16,157.33,165.37,164.8,166.67,166.38,166.38,173.42,165.95,166.52,162.93,162.93,164.22,164.22,161.49,162.64,165.09,164.37,160.92,154.6,152.01,152.01,141.09,141.95,140.37,140.09,142.39,150,148.71,151.15,153.3,152.44,148.99,173.28,176.44,175.86,195.83,190.95,194.83,192.82,195.11,193.82,190.52,191.09,186.35,188.65,188.65,201.15,205.17,205.75,202.87,218.39,207.76,214.94,199.71,187.21,187.36,187.5,189.94,191.52,199.86,205.17,202.59,200.86,196.12,193.82,206.9,198.56,202.59,198.13,196.84,196.84,196.7,196.98,201.87,209.05,210.34,203.45,203.59,190.66,194.25,188.22,188.22,183.33,176.87,176.87,183.76,186.06,184.48,188.36,186.78,188.65,193.82,192.67,195.69,191.09,195.69,148.28,149.28,145.11,146.41,144.25,146.26,155.03,159.05,161.78,164.08,183.19,160.92,162.07,163.94,158.62,156.47,156.47,157.76,158.05,158.05,159.77,160.78,157.04,156.61,161.49,172.84,177.87,185.34,176.44,173.71,171.84,169.11,165.23,164.37,171.41,181.61,200.86,206.61,203.59,202.3,192.53,190.09,181.03,179.31,174.57,174.57,189.51,187.07,191.95,198.42,199.57,205.32,194.4,200,198.28,193.68,194.68,198.28,199.43,203.45,202.73,212.07,202.87,200.43,195.55,196.98,192.1,190.23,188.51,192.96,188.36,184.34,174.14,175.72,183.33,187.07,181.47,177.3,177.73,173.13,174.86,179.31,179.6,178.59,175.72,174.57,182.04,186.78,189.51,189.51,185.63,184.77,181.47,176.01,180.32,176.72,175.57,176.15,179.89,187.93,188.51,197.41,192.67,191.09,181.18,178.88,183.05,183.05,183.19,182.61,192.82,191.24,191.67,190.09,193.53,196.84,199.43,204.02,204.31,204.89,203.45,202.16,200.43,198.42,202.59,204.74,177.16,172.56,170.11,156.47,157.9,155.17,155.89,159.77,171.41,173.13,168.25,159.77,161.78,159.34,159.77,159.05,161.64,163.51,162.93,163.79,163.36,163.36,163.51,165.95,160.49,155.6,156.47,154.17,144.11,142.39,143.68,144.25,142.82,145.98,142.24,145.26,145.55,147.84,157.76,157.33,157.76,156.47,151.44,151.44,150.29,151.29,151.58,147.7,157.76,165.95,174.14,170.69,176.44,169.83,171.84,174.43,172.7,172.7,171.12,175,179.17,180.89,181.75,185.92,182.61,178.3,186.06,191.38,184.91,197.41,190.37,178.88,166.24,167.39,166.67,161.21,162.5,167.82,169.25,175.29,175.14,169.83,169.83,172.7,168.39,170.11,173.42,178.45,180.03,173.99,170.98,169.68,171.12,168.97,175.86,171.98,168.1,165.52,167.24,163.22,164.66,164.8,164.22,159.63,161.78,156.75,152.73,150,143.68,140.95,144.4,144.4,136.93,137.21,140.37,143.97,138.07,136.93,143.39,141.09,144.83,142.67,144.97,151.15,148.85,145.26,143.53,144.25,144.97,139.51,158.62,159.63,156.32,159.91,157.61,157.04,162.07,166.52,166.81,171.7,174.28,171.7,175.72,178.88,184.2,184.2,186.78,186.64,186.49,188.22,192.67,194.54,194.54,191.95,198.56,197.27,206.9,213.36,213.36,225.14,213.94,219.11,226.01,227.73,234.48,233.48,234.77,245.83,239.8,237.36,224.86,227.01,217.1,222.7,215.09,219.97,215.37,217.82,215.52,215.52,222.7,235.06,238.65,237.79,233.76,237.93,233.76,238.22,242.39,242.1,240.09,237.07,239.37,232.61,230.6,263.65,272.13,279.02,263.36,265.52,269.97,265.66,279.17,281.03,281.32,274.43,273.85,283.48,287.64,283.05,277.73,284.05,287.07,293.1,300.29,320.26,344.54,362.93,359.91,362.07,357.61,361.64,361.64,403.16,409.63,400,393.39,429.45,432.47,462.79,437.93,470.11,465.95,458.76,448.42,447.99,445.69,468.53,467.96,462.5,468.25,443.82,451.44,416.95,408.48,399.14,392.96,380.17,391.38,359.2,363.51,378.45,377.3,404.89,392.24,382.47,339.94,359.63,360.49,327.44,276.87,253.3,242.1,247.13,261.64,290.52,290.66,285.92,297.13,313.79,304.6,302.16,273.42,281.75,298.99,308.76,296.84,274.57,276.01,269.11,269.11,278.45,288.51,302.44,306.61,307.9,306.03,340.66,303.45,303.45,306.03,279.6,287.21,287.07,294.25,285.34,285.92,270.55,280.17,260.92,257.76,243.25,239.22,239.22,257.18,251.29,256.03,265.23,270.55,244.97,272.99,295.55,298.13,290.09,283.62,291.24,290.66,292.82,283.48,290.95,298.42,298.42,283.91,284.48,299.57,315.09,289.94,276.58,331.75,350.72,352.16,346.7,334.91,334.2,325.72,331.18,329.89,327.87,328.3,332.33,340.23,340.23,344.11,344.11,343.68,350,355.03,347.84,337.36,338.07,340.23,335.78,337.64,321.98,317.24,316.24,329.89,337.5,335.92,327.87,334.63,334.05,373.56,369.25,400.72,378.88,373.13,369.11,357.61,360.06,366.67,378.74,384.34,416.95,417.96,416.38,409.91,391.38,399.86,399.28,400.14,392.67,401.29,394.97,397.7,397.7,404.89,401.87,408.91,397.41,400.57,397.84,396.98,385.2,406.47,405.46,393.97,383.05,389.22,390.95,401.72,377.01,392.53,396.26,402.44,395.11,383.33,392.96,393.82,378.74,379.89,379.89,417.39,403.59,402.73,393.82,396.26,424.86,423.85,457.18,465.66,477.44,465.66,462.36,451.01,436.21,419.54,437.5,438.22,431.18,418.1,420.4,414.66,429.89,441.67,436.35,448.28,448.85,448.13,448.13,452.59,460.34,476.29,485.49,475,477.16,494.11,486.35,482.76,474.14,467.1,471.98,481.18,490.09,483.76,488.79,481.03,486.64,437.5,429.02,422.99,402.16,414.66,419.4,487.36,491.24,465.95,461.35,434.48,426.29,447.99,452.3,441.38,455.46,458.33,424.43,435.06,433.91,442.24,451.87,451.87,451.87,443.97,444.68,452.59,439.08,438.22,434.34,427.59,434.05,440.95,442.96,445.26,437.07,435.2,431.75,440.23,424.14,424.43,423.42,412.64,416.52,413.22,406.75,412.07,416.81,415.66,405.6,408.91,407.76,427.44,438.65,441.38,442.67,447.41,444.97,460.2,452.73,450.57,455.75,469.97,484.05,474.57,476.01,487.5,501.29,521.41,519.4,516.24,521.26,521.41,521.7,527.44,539.08,551.01,554.02,572.99,593.25,588.79,567.82,562.5,571.7,560.2,566.24,566.24,562.5,556.47,558.91,570.26,569.25,569.4,559.34,566.67,567.1,611.93,591.24,608.48,614.51,607.76,615.37,634.34,653.16,668.68,668.68,669.97,663.51,654.02,658.91,705.46,698.28,695.26,693.25,687.21,703.59,692.1,700.43,692.67,697.56,715.09,731.75,731.75,733.48,738.94,742.96,723.42,707.76,726.01,682.61,700.86,675.29,689.94,710.49,716.09,708.62,714.51,750.86,772.99,774.28,783.48,794.68,794.68,817.39,846.26,822.84,765.52,705.75,683.48,682.33,632.33,653.45,681.9,671.7,719.97,691.24,698.13,621.7,652.01,656.61,560.49,630.75,556.18,601.72,562.07,572.13,569.11,598.28,664.08,641.24,682.47,669.25,687.64,653.45,627.3,639.22,611.93,682.76,683.33,701.01,695.11,695.11,731.9,789.22,790.09,818.25,813.22,818.53,760.34,803.45,803.16,807.18,811.64,797.56,770.98,752.73,716.67,755.17,749.86,749.43,746.41,764.22,800.86,772.41,749.71,783.19,778.74,784.34,796.98,810.2,785.2,792.67,792.67,764.22,757.76,743.39,772.99,770.55,769.25,757.61,756.18,762.93,761.06,810.2,825.29,759.05,768.68,785.63,782.47,783.76,776.44,779.17,786.78,775.72,752.73,746.12,719.83,722.41,755.89,755.46,752.01,752.01,767.24,760.49,767.67,822.7,802.87,769.97,786.21,795.11,789.08,790.8,825.57,818.97,887.79,855.89,997.13,990.95,971.41,1093.25,1123.56,1112.5,1115.95,1221.84,1225.72,1245.83,1219.11,1181.61,1104.6,1186.93,1175.86,1168.1,1184.2,1173.28,1165.09,1189.22,1204.17,1193.68,1240.66,1235.92,1204.02,1229.17,1304.89,1324.43,1296.26,1185.92,1178.3,1178.3,1130.6,1176.87,1134.77,1096.84,1119.25,1134.05,1101.44,1099.86,1076.58,1119.83,1116.38,1073.71,1089.37,1121.55,1141.95,1174.86,1178.02,1219.25,1175.29,1237.79,1213.79,1245.55,1242.96,1193.97,1211.06,1225.29,1209.91,1194.4,1194.97,1178.16,1171.84,1137.93,1141.09,1177.59,1181.47,1133.33,1097.7,1120.98,1081.75,1073.28,1100.29,1168.82,1192.53,1233.91,1194.25,1120.55,1167.82,1175.86,1169.97,1203.02,1197.7,1185.92,1229.02,1216.09,1225.72,1222.27,1245.83,1245.83,1252.73,1331.32,1330.89,1346.84,1326.29,1351.15,1351.58,1335.06,1290.66,1316.95,1316.81,1361.78,1395.4,1391.52,1391.38,1378.16,1339.51,1338.51,1315.37,1319.11,1319.11,1316.09,1302.01,1326.01,1317.67,1326.15,1332.9,1297.84,1367.24,1358.91,1397.27,1370.11,1318.68,1304.45,1267.39,1267.39,1285.2,1275.14,1315.09,1333.19,1352.44,1360.78,1276.44,1257.47,1230.46,1259.48,1276.72,1262.79,1262.07,1262.93,1314.22,1306.18,1326.87,1331.32,1347.27,1347.27,1314.08,1292.24,1273.56,1287.07,1226.58,1217.53,1249.14,1184.2,1214.22,1241.24,1208.76,1161.78,1117.1,1128.16,1062.64,1128.3,1113.79,1167.1,1164.51,1185.34,1188.94,1187.21,1122.41,1135.92,1153.74,1126.15,1098.85,1095.11,1112.21,1108.33,1091.95,1127.87,1165.09,1165.09,1169.97,1170.11,1181.03,1197.56,1189.08,1129.02,1152.16,1128.59,1192.67,1180.32,1165.37,1138.94,1172.56,1135.92,1189.08,1227.16,1224.28,1207.18,1205.6,1172.7,1128.59,1129.45,1118.25,1119.11,1132.33,1091.81,1103.88,1072.41,1050.14,1071.7,1072.56,1069.54,1095.26,1121.55,1108.76,1112.64,1118.68,1125.57,1126.72,1150.57,1150.57,1161.06,1177.73,1153.45,1172.13,1168.82,1162.21,1148.85,1171.84,1168.25,1171.7,1156.18,1151.01,1214.94,1216.24,1186.64,1200.86,1204.31,1237.07,1230.17,1251.15,1286.21,1349.57,1340.66,1360.63,1360.63,1357.33,1300.86,1289.37,1306.03,1304.74,1296.84,1279.45,1248.99,1234.05,1243.97,1251.58,1284.63,1310.49,1323.99,1319.25,1307.9,1407.04,1479.17,1525.72,1560.78,1617.24,1706.47,1614.22,1582.04,1545.69,1529.89,1547.13,1530.17,1588.36,1544.25,1545.4,1486.21,1489.94,1503.59,1562.79,1546.7,1556.03,1541.24,1600.57,1599.43,1590.8,1580.32,1568.97,1579.31,1579.31,1568.25,1525.43,1525.14,1511.49,1505.75,1519.11,1517.24,1526.15,1492.53,1459.05,1477.3,1499.71,1525.14,1520.11,1554.02,1458.62,1441.81,1478.45,1471.98,1441.67,1462.79,1489.08,1529.45,1509.48,1504.02,1509.2,1568.39,1609.05,1610.92,1672.84,1671.41,1672.27,1714.51,1721.55,1758.05,1766.24,1756.9,1740.8,1727.44,1799.28,1833.76,1875.43,1975.57,1958.91,2157.47,2139.66,2009.63,2097.84,2124.86,2104.74,2190.37,2174.43,2227.3,2232.9,2191.38,2154.02,2267.24,2267.24,2224.28,2326.29,2275.43,2142.39,2164.94,2069.11,1997.99,2081.18,2086.78,1984.2,1990.66,1922.41,1948.28,2104.89,1991.95,1979.17,1951.15,2072.56,2067.24,2099.71,2099.71,2217.82,2200.43,2130.17,2085.49,2067.53,2158.62,2075,1956.18,1957.33,1896.55,1896.55,1972.84,1975.14,1907.18,1966.67,1966.67,1895.55,1842.96,1751.29,1707.04,1674.28,1596.7,1590.66,1474.14,1512.07,1641.52,1677.87,1763.79,1725.29,1775.86,1776.87,1842.38,1908.76,1807.04,1626.15,1641.81,1745.26,1690.95,1614.51,1635.49,1635.49,1661.64,1577.01,1675.43,1739.37,1772.13,1635.49,1699.43,1608.91,1557.61,1479.17,1516.24,1595.55,1529.6,1498.42,1469.11,1570.83,1657.61,1604.74,1630.17,1665.52,1649.14,1636.78,1731.75,1719.4,1727.59,1770.55,1712.93,1570.98,1554.45,1588.07,1534.77,1489.51,1490.23,1451.15,1398.99,1366.38,1404.31,1337.07,1337.07,1348.99,1392.67,1350.86,1290.95,1266.38,1303.02,1223.56,1219.97,1287.93,1228.74,1290.8,1309.34,1428.45,1348.71,1369.83,1240.8,1274.86,1263.22,1250.86,1366.67,1354.02,1472.27,1383.33,1388.94,1343.39,1365.95,1309.77,1331.18,1418.82,1469.25,1469.25,1463.51,1454.31,1560.2,1527.3,1517.96,1512.64,1464.08,1419.54,1362.36,1249.86,1249.86,1283.05,1178.88,1171.98,1171.98,1203.88,1203.3,1184.34,1251.15,1237.93,1160.63,1120.55,1098.71,1058.48,1058.48,1080.46,1082.61,1139.37,1140.09,1105.6,1097.13,1113.79,1129.31,1165.37,1169.97,1233.91,1284.91,1308.76,1265.8,1257.76,1224.86,1290.52,1317.1,1357.33,1390.52,1426.58,1409.34,1492.96,1469.97,1437.79,1372.7,1423.13,1409.77,1448.71,1451.29,1439.66,1411.93,1443.1,1378.59,1333.91,1328.88,1332.33,1396.26,1310.06,1271.41,1249.14,1219.4,1182.9,1152.87,1152.87,1131.03,1143.82,1189.37,1227.73,1216.09,1106.75,1112.79,1101.44,1099.28,1103.02,1081.18,1070.11,998.56,976.44,952.59,965.09,982.18,921.55,910.34,949.86,975.57,976.15,974.86,839.66,830.6,828.02,831.18,846.84,803.74,832.76,832.18,822.27,830.03,845.11,843.39,883.19,858.19,841.95,890.95,862.93,857.18,842.39,863.65,893.53,906.32,917.39,860.92,983.76,1039.8,1056.47,1097.27,1044.54,1061.78,1057.04,1041.09,1081.18,1097.7,1097.7,1079.6,1051.58,1054.45,1115.37,1113.22,1077.3,1057.76,1009.63,1007.76,1012.5,985.49,1015.37,1029.45,990.37,955.89,939.8,928.02,934.63,972.41,917.53,927.01,927.01,909.05,898.99,931.32,930.6,930.6,919.83,929.02,895.55,918.97,966.09,977.73,992.24,1017.24,1020.11,1020.11,1028.59,1013.36,972.84,1006.75,1099.57,1073.28,1076.29,1079.89,1083.33,1040.95,1079.74,1216.09,1268.82,1236.93,1202.3,1234.34,1216.81,1195.55,1170.69,1194.4,1234.91,1223.85,1150.57,1127.87,1127.87,1103.02,1100.72,1145.83,1121.98,1131.75,1129.02,1124.86,1155.75,1171.26,1166.09,1179.74,1226.58,1207.33,1187.79,1178.3,1256.47,1288.51,1387.93,1405.75,1390.95,1378.3,1402.01,1440.8,1407.33,1388.07,1358.62,1380.6,1406.32,1408.19,1387.36,1377.44,1329.89,1328.59,1328.59,1371.84,1351.01,1326.58,1323.13,1318.25,1291.24,1289.94,1292.24,1294.68,1270.55,1258.19,1204.02,1234.77,1256.32,1284.05,1288.65,1291.81,1172.7,1244.4,1290.8,1365.52,1365.8,1393.97,1395.11,1368.68,1399.43,1458.05,1490.66,1550.72,1520.4,1551.72,1553.45,1555.6,1729.17,1825.14,1825.14,1799.86,1698.42,1716.52,1693.39,1694.4,1784.91,1692.96,1739.22,1794.83,1856.18,1789.22,1829.45,1785.06,1725.29,1725.29,1708.76,1610.78,1590.52,1580.6,1544.68,1586.06,1582.9,1598.28,1636.64,1664.08,1664.08,1637.21,1630.46,1626.01,1631.9,1599.43,1646.26,1665.52,1665.8,1700,1694.4,1672.84,1584.05,1594.11,1589.22,1623.56,1581.75,1596.26,1622.99,1643.68,1689.66,1571.12,1625.72,1664.08,1678.3,1626.87,1587.21,1583.76,1545.55,1608.91,1599.86,1540.09,1500.57,1515.09,1554.89,1518.1,1572.27,1462.64,1469.11,1474.28,1521.84,1531.47,1518.97,1572.56,1572.56,1591.67,1570.11,1531.47,1524.28,1513.22,1513.07,1547.56,1532.04,1458.19,1470.83,1459.91,1441.67,1380.89,1382.18,1399.14,1378.74,1409.05,1476.44,1477.3,1483.76,1437.93,1495.26,1478.59,1540.8,1536.93,1566.24,1556.18,1563.07,1509.91,1529.6,1510.63,1467.96,1471.26,1462.79,1436.93,1460.78,1380.17,1345.83,1385.49,1381.9,1415.23,1552.3,1549.28,1612.79,1605.6,1630.03,1632.04,1630.6,1703.88,1678.02,1722.41,1695.4,1721.7,1733.05,1746.12,1712.07,1760.2,1760.2,1757.33,1762.21,1753.02,1779.45,1740.8,1744.11,1703.59,1700.86,1678.45,1844.4,1852.3,1931.18,1977.16,1985.49,1982.76,1999.28,1995.69,2013.65,1946.41,2010.2,2005.75,2005.75,2060.49,2098.71,2137.36,2117.96,1991.09,1944.25,1954.17,1991.09,2100.29,2144.54,2134.2,2126.72,2105.75,2105.75,2280.75,2301.29,2337.21,2503.3,2416.38,2419.83,2561.64,2590.95,2546.7,2555.03,2472.13,2409.34,2449.43,2552.59,2503.3,2412.07,2456.03,2433.19,2478.16,2469.97,2464.66,2567.53,2539.66,2498.13,2498.13,2380.6,2360.49,2612.93,2536.21,2528.88,2557.47,2536.49,2766.24,2911.49,2950.57,2947.27,3026.29,3037.07,2979.74,2850.43,2913.22,2798.71,2687.64,2745.11,2739.22,2606.61,2582.33,2567.24,2581.18,2566.52,2555.6,2580.32,2593.25,2593.25,2634.2,2567.53,2597.27,2382.61,2448.56,2441.09,2453.74,2401.44,2449.71,2345.98,2303.45,2348.56,2212.93,2228.16,2106.9,2135.63,2187.79,2180.17,2209.2,2261.49,2301.72,2275.57,2072.84,2100,2163.79,2238.22,2218.82,2207.18,2189.51,2182.76,2163.22,2200.57,2294.11,2336.49,2363.07,2389.8,2365.8,2378.16,2305.03,2390.23,2390.23,2465.66,2372.7,2395.83,2397.99,2349.86,2298.71,2387.5,2396.26,2411.93,2303.74,2283.91,2302.3,2297.41,2293.53,2275.86,2221.7,2221.7,2324.43,2316.52,2302.44,2302.44,2263.51,2291.24,2330.6,2265.66,2360.78,2354.88,2354.88,2469.83,2567.39,2544.54,2643.1,2614.08,2609.34,2583.76,2551.01,2290.66,2238.07,2177.87,2239.51,2212.64,2078.02,1987.36,2011.35,2007.9,1989.08,2075.86,1904.31,1903.74,1937.07,1870.4,1848.71,1958.62,1929.17,1965.09,2027.73,2022.27,2117.24,2134.48,2231.03,2247.13,2267.39,2179.6,2226.72,2155.03,2162.36,2102.87,2090.37,2134.48,2134.48,1967.53,2023.99,2003.45,1930.32,1984.91,2052.3,2153.16,2166.24,2188.36,2185.06,2166.95,2130.6,2252.01,2240.66,2252.16,2274.71,2327.87,2406.47,2361.35,2357.47,2295.26,2295.69,2339.8,2455.46,2456.47,2482.76,2457.18,2358.91,2412.21,2374.57,2250.57,2243.25,2244.97,2240.95,2268.68,2213.94,2196.98,2204.6,2244.68,2297.7,2388.65,2135.06,2069.97,2038.22,2021.7,2035.34,2084.77,2152.59,2125.72,2117.1,2063.65,2001.44,1994.83,1938.22,1996.12,2002.73,1977.01,1975.43,1987.79,2027.73,1978.74,1957.47,1957.47,1970.98,2041.09,2039.94,2068.82,2031.03,1991.24,1880.32,1835.34,1869.97,1876.44,1823.42,1820.26,1796.26,1744.4,1708.05,1712.79,1790.23,1814.51,1814.51,1796.84,1798.71,1759.2,1735.49,1733.19,1801.29,1861.35,1829.45,1750.57,1750.57,1667.24,1685.63,1667.96,1723.56,1701.72,1745.11,1745.11,1756.9,1778.02,1767.82,1764.94,1652.44,1640.37,1686.06,1707.76,1665.95,1641.81,1716.95,1609.34,1582.76,1545.4,1587.36,1596.26,1605.17,1606.47,1625,1625,1641.95,1647.84,1640.37,1592.53,1553.3,1493.68,1504.89,1429.74,1434.77,1411.35,1447.56,1460.78,1420.26,1441.24,1388.36,1390.23,1448.13,1409.63,1450.72,1502.73,1487.21,1526.29,1539.37,1529.31,1635.78,1649.57,1583.19,1532.33,1483.05,1476.15,1476.72,1479.31,1347.7,1232.18,1201.72,1123.71,1391.38,1274.43,1341.95,1357.76,1369.11,1268.53,1257.18,1257.18,1229.31,1239.37,1298.71,1357.33,1388.65,1384.91,1380.17,1398.71,1388.65,1419.54,1445.26,1416.95,1441.95,1461.21,1477.59,1553.45,1615.8,1691.38,1652.16,1683.48,1648.56,1630.89,1610.06,1590.66,1584.91,1584.91,1645.98,1621.55,1623.99,1590.95,1646.98,1685.49,1703.74,1662.21,1669.4,1748.99,1770.69,1740.52,1702.59,1668.97,1815.95,1826.15,1821.7,1821.7,1842.53,1861.78,1988.94,2060.34,2064.37,2066.24,2038.79,1955.6,1990.23,1981.47,1981.47,1936.78,1980.17,1988.65,2071.26,2103.74,2101.15,2235.78,2300,2304.74,2255.6,2255.75,2222.99,2279.45,2329.31,2391.81,2495.11,2549.43,2579.17,2533.19,2466.95,2539.94,2504.45,2343.68,2477.01,2482.18,2475.29,2513.65,2649.71,2599.86,2550.43,2530.75,2392.96,2373.56,2352.16,2410.34,2347.13,2393.97,2401.29,2422.13,2336.64,2336.64,2332.18,2329.45,2324.57,2171.55,2175.43,2238.79,2292.24,2236.64,2278.3,2315.52,2305.46,2286.78,2268.97,2261.35,2295.83,2311.78,2311.49,2317.1,2291.09,2318.39,2324.57,2356.47,2438.65,2365.95,2926.87,3038.94,3384.48,3346.12,3087.64,3109.48,3133.48,3428.16,3370.11,3348.85,3456.32,3419.97,3307.9,3376.29,3633.91,3730.89,3707.04,3797.84,3661.49,3679.88,3730.6,3592.67,3682.9,3415.23,3355.46,3505.46,3412.64,3719.68,3562.64,3546.12,3455.75,3308.76,3211.93,2960.06,2927.87,3089.8,2961.64,3078.16,3078.16,3125.43,3157.47,3092.53,3126.44,3103.16,3131.75,3176.87,3184.2,3181.32,3181.47,3028.45,2982.47,3005.32,2846.41,2888.79,3066.52,3088.36,3087.64,3089.66,3089.66,3088.94,3097.84,3093.97,3077.01,3210.78,3176.44,3079.74,3017.53,2940.8,2919.11,2984.05,3174.86,3212.64,3274.71,3330.89,3330.89,3332.18,3589.08,3645.55,3731.03,3610.78,3621.12,3631.32,3623.28,3401.29,3538.36,3478.59,2876.29,2765.8,2994.83,3103.45,3068.53,3068.68,2958.91,2978.74,2978.74,2917.82,2875.29,2921.98,2875.72,2824.71,3072.41,3029.6,2926.44,2876.58,2853.74,2743.53,2903.3,2865.66,2764.8,2912.07,2919.97,2942.96,2841.09,2778.59,2824.43,2820.55,2865.8,2949.28,2892.67,2912.07,2950.72,3164.8,2927.73,2902.16,2816.67,2922.84,3020.26,3125,3125,3163.51,3182.9,3330.75,3400,3520.69,3546.41,3664.8,3708.62,3997.99,3999.86,3950.43,4087.5,4360.06,4386.93,4997.27,4807.9,4643.82,4843.53,5093.25,5180.17,4907.18,5104.31,6054.45,5868.68,6540.09,6591.81,6440.95,6400.86,6461.21,6093.39,6048.71,5948.99,6430.75,6459.63,6717.1,6717.1,7239.8,7119.83,7443.82,7415.23,7329.45,7493.39,7794.83,7517.24,6700.86,7044.97,6832.04,6500,7017.96,7350.14,7862.93,7288.65,7363.22,7720.83,7720.83,7925.72,7469.11,7467.53,7651.87,7493.97,7751.29,8346.41,7771.26,7439.94,7439.94,7931.75,7415.37,7434.05,7855.17,8015.66,7678.02,7875.43,7602.59,7197.41,7122.99,7235.2,7822.27,7935.78,7754.17,7499.28,7111.35,6531.9,6171.84,6973.99,6841.24,6963.22,7450.86,6926.01,7029.89,6944.83,6746.55,6814.94,6938.65,6939.8,7390.66,7270.11,6959.63,6701.44,6745.11,6799.57,6562.5,6884.77,6909.91,6848.71,6689.37,6763.22,6603.59,6566.95,6554.02,6861.64,6861.64,7266.38,7487.07,7235.63,7415.66,7089.22,7244.25,7363.51,7831.75,8043.39,8843.68,8962.21,8830.6,9041.09,9060.78,8733.76,8729.45,8789.66,8846.7,9107.9,9076.87,9330.75,9279.6,8917.82,8737.07,8537.93,8700.14,8201.44,8078.02,7596.98,7730.6,7730.6],"EuroStoxx50":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.68,100.71,101.24,101.03,100.82,100.96,100.76,99.98,98.93,97.52,97.3,96.68,98.47,98.94,100.01,99.69,99.15,99.47,99.8,99.03,99.54,98.85,99.25,99.62,99.22,99.5,99.75,98.72,99.43,99.86,99.18,98.66,99.9,101.47,102.82,104.25,104.63,104.68,105.92,105.1,106.34,106.65,106.61,107.31,107.03,106.99,107.13,107.13,107.28,107.29,107.06,107.68,107.68,108.48,108.56,108.53,108.68,108.28,108.19,108.25,107.55,108.78,107.81,107.5,107.79,107.67,107.97,107.1,107.38,108.84,108.61,108.1,106.77,105.72,106.64,106.47,107.11,105.97,105.88,105.96,107.26,107.03,108.16,108.28,108.76,108.35,108.27,108.39,109.27,109.27,109.1,108.12,108.29,108.63,110.94,110.76,111.37,110.85,110.77,110.92,111.58,111.79,111.77,111.24,111.56,112.57,112.84,112.49,112.23,111.94,112.97,112.7,112.47,113.39,113.72,113.93,114.56,113.65,113.93,113.63,114.19,114.39,113.89,113.55,113.5,112.84,112.84,112.84,111.58,111.95,112.57,112.58,117.06,117.25,117.11,116.6,116.48,116.48,117.09,117.35,118.72,119.73,119.18,119.41,119.3,118.57,119.03,119.17,119.17,117.31,116.57,117.38,117.04,117.64,117.37,117.37,117.12,117.11,116.53,116.32,116.72,117.54,117.54,116.3,116.13,116.62,117.35,115.97,116.42,116.07,115.36,115.97,117.14,116.52,116.31,116.36,115.96,116.55,115.79,115.7,113.59,112.63,114.26,113.86,113.82,113.29,113.35,113.81,113.37,115.03,115.44,115.38,115.07,113.83,114.54,114.51,112.95,113,113.67,114.24,114.31,113.48,112.87,112.87,113.2,113.43,114.77,114.72,115.04,113.5,112.36,111.47,112.92,113.28,114.03,113.29,112.76,112.03,113.08,112.52,112.72,112.52,111.95,110.87,111.38,111.96,112.69,112.25,111.94,112.36,112.82,112.82,114.37,114.94,115.29,115.4,115.04,115.41,115.55,115.37,115.83,115.89,115.77,115.72,116.34,116.61,117.63,117.89,117.99,117.64,118.25,117.91,118.15,117.76,118.05,117.98,117.95,118.01,118.06,118.45,117.87,117.97,118.09,118.15,117.52,119.02,119.51,119.84,120.22,120.99,120.71,120.75,120.5,119.73,119.6,118.21,117.6,116.97,116.38,116.03,116.65,116.08,116.54,117.13,116.58,116.89,117.19,116.63,117.26,117.47,116.82,115.43,117.03,116.84,116.55,116.92,117.52,117.22,117.81,117.21,116.37,116.51,118.11,117.22,116.25,116.85,116.28,116.28,116.28,116.17,115.33,114.66,114.66,114.85,116.79,118.05,118.34,118.55,118.13,117.65,118.22,118.19,118.52,118.22,118.49,119.41,119.94,120.17,119.22,118.79,119.35,119.21,118.02,118.11,117.06,115.29,113.84,111.09,113.04,110.52,108.84,110.22,109.33,110.27,110.92,112.14,111.51,112.41,112.25,112.31,112.62,113.33,113.16,112.53,111.23,108.8,109.8,109.88,110.52,111.69,111.93,112.22,111.17,110.96,111.72,112.48,111.09,111.65,111.29,109.56,107.92,107.29,108.54,109.01,110,110,110,109.52,109.31,112.24,111.52,111.74,112.53,111.9,112.7,112.83,112.6,113.81,114.23,114.09,114.34,114.96,114.89,114.07,114.73,115.15,115.73,115.73,116.29,115.48,116.19,116.63,116.43,116.81,116.81,116.68,116.68,116.63,116.59,117.55,116.94,116.94,117.39,115.9,115.24,115.03,113.96,112.18,112.61,111.48,113.01,113.54,113.12,113.25,113.21,112.81,113.88,113.73,113.86,115.42,114.7,113.44,112.41,112.55,111.37,112.62,110.25,110.24,111.16,110.13,111.11,110.35,111.47,111.65,112.6,112.85,113.24,113.66,111.99,112.75,113.04,112.86,113.14,114.04,113.6,113.22,113.03,113.98,113.5,114.83,115.42,114.93,115.37,115.37,113.52,113.96,113.98,114.67,114.32,114.34,112.12,111.58,111.57,109.92,110.52,110.37,111.05,111.64,111.92,111.89,112.16,113.09,112.82,113.1,112.27,111.03,111.09,109.93,108.5,107.85,107.77,108.29,108.37,108.86,109.09,109.45,109.5,109.9,110.23,111.36,112.27,111.6,111.91,112.34,112.89,111.23,111.72,110.9,111.44,110.44,109.48,108.3,108.7,106.9,105.01,104.53,105.05,106.59,106.12,105.09,105.07,104.39,102.78,102.43,103.55,102.58,103.24,102.98,104.63,104.85,105.19,105.28,104.96,106.22,105.94,105.68,104.52,105.53,104.89,104.4,104.08,103.42,101.97,103.21,102.31,102.66,103.82,103.62,103.68,103.87,103.83,105.2,104.36,103.09,99.67,100.08,98.73,99.98,101.7,101.84,101.2,100.25,99.48,99.85,98.17,98.19,98.19,98.19,98.19,96.12,97.73,97.73,97.73,96.69,99.54,99.27,99.97,100.47,100.65,100.46,99.98,100.4,100.7,100.44,102.58,102.26,101.86,101.84,102.3,103.51,102.66,103.19,103.46,103.39,103.77,103.58,105.21,105.13,103.1,102.61,103.59,104.41,104.79,104.15,106.06,106.18,106,106.66,106.8,107.02,107.33,107.64,107.42,107.93,108.38,108.55,108.88,108.79,108.28,107.45,108.13,108.12,108.75,109.36,110.8,110.86,111.55,110.35,110.19,108.17,108,108.63,108.71,108.65,109.68,110.78,111.12,112.42,112.63,112.81,112.5,111.82,112.07,112.42,112.82,112.91,113.33,113.8,114.51,114.51,114.51,114.66,114.62,114.27,114.54,114.59,115.01,115.01,114.17,114.61,113.32,111.3,111.82,109.65,109.98,108.67,110.09,110.79,112.52,112.1,110.27,110.82,110.82,108.88,109.65,110.08,109.59,107.91,107.91,107.35,107.99,109.08,109.29,109.24,110.55,110.55,111.29,110.82,110.95,110.58,110.71,112.99,113.05,113.49,113.45,113.08,112.71,112.66,112.65,113.67,114.45,114.79,115.86,115.98,115.45,115.31,114.85,114.58,114.42,114.45,114.6,115.23,114.58,113.97,113.88,114.2,115.61,115.61,114.86,115.33,115.3,113.32,113.45,113.45,110.48,108.34,107.71,108.31,110.45,109.09,108.86,109.86,107.62,107.42,108.94,110.25,109.63,111.09,110.4,109.11,109.58,110.29,110.13,111.63,112.13,112.32,111.94,112.92,114.03,114.37,114.37,114.5,115.08,115.8,116.17,115.13,115.23,115.45,116.25,116.87,115.74,115.58,114.96,115.58,116.03,116.8,115.13,111.69,111.83,112.79,113.59,112.33,113.29,114.33,116.82,116.37,117.76,117.78,117.43,117.13,117.81,117.96,118.03,118.5,118.61,118.64,118.53,118.47,117.95,118.58,119.94,120.31,120.71,121.29,121.06,120.97,121.47,121.06,120.71,121.46,121.24,120.96,120.55,120.41,120.66,121.33,121.26,121.5,121.22,121.19,118.68,118.16,119.77,119.38,120.83,120.17,120.15,120.67,121.28,122.09,123.46,122.56,122.35,122.36,123.58,123.58,123.58,123.58,123.58,123.77,122.66,122.66,122.66,123.48,122.79,123.01,123.45,124.21,124.01,123.68,123.53,123.33,123.5,124.62,124.32,123.99,123.36,122.28,123.67,120.35,121.7,122.27,120.77,119.14,119.81,122.13,123.62,124.53,124.3,124.12,125.19,126.13,125.88,125.69,126.09,125.54,126.48,125.1,124.36,119.37,116.9,117.07,113.09,108.95,109.26,110.34,111.93,110.07,105.76,96.83,95.23,95.08,83.29,84.62,80.18,82.81,78.07,80.31,83.39,81.33,88.85,91.63,93.19,89.29,90.5,91.2,87.71,87.98,87.14,91.49,93.51,93.3,94.66,94.66,94.66,95.48,91.89,92.03,94.51,95.21,91.34,92.77,93.34,91.92,94.31,95.95,98.04,95.81,95.81,92.16,94.11,93.06,94.26,95.16,94.37,94.38,91.97,90.32,90.67,95.29,94.98,96.28,96.28,95.08,97.23,98.14,99.84,101.26,99.81,99.81,103.37,106.99,106.73,110.74,110.16,108.66,107.78,102.9,103.2,102.63,106.11,106.92,106.35,106.98,106.08,107.95,104.59,105.33,104.85,105.76,105.83,105.65,108.64,107.8,109.62,108.69,107.53,106.72,107.86,109.62,108.69,110.55,110.12,110.13,110.88,111.43,110.3,110.33,108.34,108.08,108.1,107.99,104.98,103.87,106.29,106.49,106.95,106.04,106.44,106.67,109.04,110.05,109.39,108.15,108.18,107.65,108.56,107.13,106.67,109.03,108.96,109.84,109,108.49,107.09,107.25,109.22,108.12,106.7,108.45,106.92,108.8,108.4,108.5,108.54,109.04,109.26,108.53,107.45,103.44,103.54,104.06,103.39,102.65,105.47,105.18,104.51,104.52,104.42,105.38,105.8,105.81,106.54,107.11,107.92,107.31,107.11,104.47,106.2,106.11,105.63,104.08,103.78,104.68,101.61,100.48,96.98,96.86,96.8,98.81,101.4,103.44,105.22,104.85,111.52,112.65,113.46,112.18,112.31,113.43,113.5,113.95,112.96,113.47,113.32,114.79,114.92,114.89,115.44,114.29,115.36,115.23,115.09,115.82,115.52,115.38,115.48,115.26,114.07,114.66,115.23,115.94,116.52,116.03,112.85,114.45,115.82,115.82,115.82,117,117.19,116.87,116.87,116.64,116.1,118.17,118.54,119.28,118.48,118.2,118.34,119.16,117.79,117.89,117.65,118.59,118.4,117.88,116.27,117.57,115.72,116.4,113.92,115.54,117.49,118.12,119.18,119.63,119.95,119.8,119.39,120.15,120.93,122.19,121.94,121.07,120.46,121.52,121.07,120.72,121.27,120.59,119,121.29,121.33,121.49,121.23,120.08,123.15,123.89,125,125.84,125.44,125.32,126.02,125.98,126.56,125.56,125.46,125.23,125.41,125.41,126.53,127.06,128.48,128.25,129.12,129.12,129.12,129.92,129.48,130.17,130.2,129.65,129.81,130.12,130.68,131.97,131.54,128.94,130.12,131.38,131.33,131.57,131.28,131.38,130.79,130.07,130.9,128.43,130.98,130.87,132.01,131.66,129.13,129.17,129.17,131.46,131.12,131.07,128.82,130.89,131.74,131.74,132.07,131.93,132.18,133.2,132.18,133.24,133.79,133.49,133.82,134.09,134.03,134.06,134.04,135.04,135.23,135.59,135.86,136.07,133.62,134.57,134.92,133.38,134.9,134.84,133.83,134.41,133,133.47,133.65,133.75,132.62,133.46,130.62,133.12,133.95,133.99,134.15,132.74,132.06,128.55,129.46,131.77,132.82,134.46,134.25,133.01,134.26,134.71,133.81,134.71,134.75,135.63,136.16,136.6,136.69,137.04,137.64,138.3,138.41,137.52,137.32,137.09,134.97,135.72,136.67,136.72,136.82,136.45,137.14,137.4,137.32,138.33,138.49,137.5,138.95,138.26,136.69,136.69,136.47,137.09,137.16,135.67,136.45,135.17,132.32,134.08,135.81,137.27,136.08,136.31,132.82,133.52,132.47,132.05,130.78,133.03,131.31,134.11,133.29,133.27,132.7,133.62,135.77,136.88,135.85,136.35,136.53,135.99,137.07,137.05,138.22,138.12,138.55,139.09,140.07,140.59,141.02,141.8,142.77,142.43,142.17,142.31,142.61,143.01,143.53,144.03,144.01,143.45,142.56,141.98,140.18,139.93,140.49,133.82,134.48,132.96,136.75,134.43,133.52,135.38,139.93,138.52,137.71,137.41,136.88,135.62,136.12,137.5,136.17,134.4,136.62,138,139.59,139.59,140.32,141.1,140.21,140.91,140.91,141.75,142.92,143.73,141.52,140.9,138.73,140.11,141.25,141.23,139.8,140.78,139.33,139.67,140.7,138.4,132.67,133.45,136.28,136.95,135.37,136.61,138.24,138.16,135.51,133.73,134.84,135.12,137.57,137.34,135.97,133,135.6,135.38,134.6,133.32,130.43,130.42,130.02,125.31,129.93,128.41,123.23,125.02,122.44,116.36,114.93,114.7,123.24,119.49,120.64,122.42,122.32,127.28,127.14,127.7,127.02,128.48,126.61,126.42,126.56,127.2,130.96,129.56,127.7,128.23,129.29,128.2,125.16,124.41,126.26,125.64,125.38,125.26,125.94,125.94,125.94,125.35,127.52,128.54,125.66,122.96,121.77,122.21,123.6,124.44,122.14,123.08,121.89,120.97,118.76,115.41,116.32,119.37,118.24,121.19,120.6,122.43,120.77,118.89,119.67,121.35,119.36,120.33,120.33,124.64,125.71,123.99,123.02,124.19,123.81,123.81,124.57,123.99,121.88,117.78,114.61,113.72,115.59,112.17,112.52,113.54,114.33,113.37,112.45,115.62,115.8,116.14,115,113.05,112.84,112.97,109.94,111.97,114.15,114.75,113.6,114.11,113.02,111.15,113.78,114.92,117.39,117.32,117.69,117.69,117.94,117,118.06,119.51,121.34,121.34,120.57,122.14,122.86,121.91,122.95,121.58,122.69,122.94,123.59,124.01,124.52,122.91,123.61,122.07,119.71,119.52,120.01,120.24,117.92,116.84,116.56,115.1,113.11,115.98,114.2,114.54,114.6,114.94,116.82,119.33,117.35,116.74,115.9,114.54,114.51,113.45,114.27,112.15,109.58,109.38,108.92,109.14,107.3,108.58,109.37,114.02,112.82,112.35,110.46,109.85,109.31,109.02,110.03,110.66,112.62,113.35,113.59,114.3,113.77,115.44,117.33,117.98,117.95,118.23,118.38,119.47,118.52,117.58,120.69,121.36,122.36,121.99,125.87,126.59,127.21,128.11,127.06,126.91,128.43,127.92,128.6,129.14,129.65,129.66,128.78,128.75,129.74,130.39,130.17,129.47,128.9,128.3,128.32,129.01,128.33,130.46,130.08,125.52,124.48,124.72,124.43,126.71,125.11,124.9,124.9,125.42,124.64,125.99,124.14,124.14,127.04,130.04,129.57,131.48,133.14,132.77,134.16,135.04,135.83,136.03,136.6,136.6,133.98,134.82,135.83,135.9,135.74,136.59,136.72,136.08,136.24,136.5,138.78,139.33,137.62,137.74,137.74,139.08,137.37,138.79,138.71,140.06,140.62,139.89,139.77,139.09,138.84,139.34,136.74,139.01,138.69,137.95,138.77,140.54,141.16,140.02,140.33,140.26,138.4,134.05,136.77,132.04,134.72,133.02,134.8,136.84,137.3,137.67,135.17,136.28,136.4,138.46,140.23,141.2,141.07,141.21,140.66,141.02,141.02,141.02,141.8,141.82,142.78,143.68,142.92,143.78,143.77,143.49,144.26,144.04,143.26,142.27,142.61,142.65,142.65,140.54,141.04,140.29,142.03,142.3,141.47,140.93,141.03,141.29,141.25,141.22,141.47,141.47,143.83,143.51,142.1,139.52,139.72,141.94,141.94,140.43,138.03,139.32,141.48,140.49,140.55,140.44,140.63,140.38,141.25,142.27,143.2,142.84,143.81,142.75,142.12,141.45,140.86,139.78,140.07,140.88,142.17,142.5,143.95,143.92,143.69,142.37,138.19,138.63,139.29,140.27,142.69,143.71,143.99,142.57,142.99,142.75,143.12,143.7,143.43,143.7,142.22,145.53,146.16,146.32,146.32,141.9,140.86,141.79,141.94,140.34,141.28,143.46,141.41,141.7,140.34,140.19,138.35,137.86,138.25,139.41,139.62,138.49,138.62,140.5,141.58,141.21,140.61,140.14,140.05,139.7,138.69,138.13,138.65,139.22,138.82,138.21,140.05,140.55,138.94,138.83,139.92,137.85,137.67,136.37,135.12,135.2,136.18,136.61,135.4,134.02,134.16,134.16,135.62,134.58,137.61,137.46,137.38,135.35,135.8,135.88,134.36,133.85,131.7,132.26,133.03,133.29,132.51,131.36,131.82,132.89,133.89,136.44,136.61,136.08,135.91,136.73,138.39,137.35,138.49,140.44,141.22,140.79,142.04,142.1,141.75,142.41,142.72,143.07,142.49,142.28,143.02,143.41,144.59,144.47,145.71,146.71,146.4,148.02,148.57,148.45,148.24,148.54,148.87,147.95,148.41,148.36,148.07,147.96,147.96,147.96,148.18,147.72,147.96,147.96,145.56,146.4,146.06,146.78,146.18,146.24,145.37,146.6,145.77,145.5,144.08,145.72,145.58,146.61,146.14,149.35,149.95,151.69,151.81,152.58,152.11,151.79,152.31,152.34,153.5,153.11,154.15,154.32,155.32,153.45,154.1,155.21,155.95,155.86,155.77,156.26,158.88,159.45,159.17,159.88,159.81,159.62,160.18,160.77,160.12,160.85,162.77,162.34,161.34,163.07,163.63,163.39,163.16,163.05,163.87,163.63,165.33,164.64,165.06,165.72,166.29,166.35,166.35,166.35,164.99,165.88,165.93,164.1,165.12,163.32,163.64,162.53,162.14,163.11,160.9,160.81,161.54,160.94,161.55,163.88,163.28,161.62,163.84,163,161.04,161.04,160.04,161.05,162.21,164.14,164.86,164.86,166.4,166.2,166.24,166.92,165.99,165.71,165.71,165.15,164.44,164.85,164.77,165.55,164.61,162.41,163.03,163.08,163.73,162.09,164.78,165.88,165.29,164.16,162.47,164.74,161.51,158.35,159.7,160.85,159.87,161.91,160.58,162.01,161.52,160.87,160.43,160.15,161.32,160.55,162.5,163.21,162.94,162.63,160.46,162.27,162.83,165.02,163.06,161.91,160.06,159.37,157.96,160.26,160.89,159.1,157.44,159.12,157.57,158.41,159.46,159.46,151.79,149.6,149.72,152.75,152.78,152.99,152.88,153.63,154.7,157.33,158.4,159.41,158.96,159.86,159.85,160.64,160.24,160.3,160.77,162.51,162.24,162.73,160.75,158.65,157.57,155.04,156.37,155.34,155.88,157.53,158.51,157.98,159.06,158.23,161.76,159.41,159.87,161.68,160.9,164.68,165.82,163.63,162.12,162.41,161.04,162.14,162.62,161.95,163.05,162.65,163.74,164.96,161.87,160.63,161.89,163.17,161.69,161.63,161.08,161.5,161.75,162.63,161.98,159.88,157.98,159.62,158.78,159.37,157.09,158.77,157.16,158.84,155.26,155.12,158.17,156.9,156.75,155.48,154.77,155.63,156.71,157.07,155.83,154.88,155.72,157.22,158.6,159.64,160.97,162.03,162.89,163.14,162.04,162.29,162.49,162.57,161.88,161.74,162.22,159.66,159.11,158.8,158.8,158.8,158.8,160.31,159.34,159.34,159.34,159.41,163.18,164,163.5,164.2,162.87,162.12,162.98,164.67,167.11,168.47,169,169.05,170.35,170.73,170.79,169.78,170.02,171.16,172.85,173,170.75,172.27,172.49,175.29,174.26,175.34,176.41,176.89,179.99,179.76,180.63,181.08,178.71,178.7,179.15,178.46,178.27,180.89,179.08,178.78,181.31,176.29,179.62,180.65,178.94,176.28,173.76,175.38,174.36,176.84,178.2,179.49,180.22,178.37,177.48,177.22,179.16,177.09,176.09,174.46,171.74,174.1,173.56,167.32,159.63,152.37,156.21,151.25,157.69,156.65,160.72,162.65,162.52,161.5,161.5,161.5,162.35,166.85,167.38,168.66,169.19,168.91,168.86,168.86,172.95,172.88,172.23,171.15,173.07,173.75,176.46,177.24,176.82,177.1,177.61,177.6,178.49,178.49,177.51,174.29,176.55,177.21,176,176,175.61,175.25,175.91,176.87,177.05,177.69,177.69,177.21,176.48,175.42,173.12,174.73,173.06,172.35,170.06,171.26,170.88,173.34,171.86,171.6,174.27,173.54,172.86,174.05,174.84,173.07,174.79,175.79,178.2,177.96,176.16,175.75,175.21,173.37,175.96,175.37,174.84,173.12,174.88,175.24,175.14,174.66,176.02,176.48,174.08,174.08,171.55,171.78,172.23,174.48,174.99,174.47,174.61,176.32,177.84,178.3,177.84,179.43,179.07,178.74,179.59,178.14,176.17,176.48,176.6,175.13,175.63,173.14,174.25,174.96,174.03,175.49,175.68,175.44,176.27,176.4,178.03,175.8,175.71,178.56,178.62,178.08,179.07,178.82,178.17,179.97,180.2,180.96,182.63,184.75,184.94,184.19,183.7,184.88,184.09,181,182.21,181.68,183.41,184.95,183.49,185.9,186.09,184.53,185.49,185.69,186.88,186.66,186.71,186.5,185.28,185.84,185.22,185.51,183.62,182.15,185.36,187.36,189.38,187.92,186.32,184.59,181.11,181.35,182.27,180.47,180.92,182.4,185.07,184.99,185.48,185.46,186.07,186.34,187.11,187.31,187.36,187.12,186.79,188.29,187.2,188.24,187.11,185.92,187.89,188.5,187.95,188.13,188.13,188.13,188.13,188.21,189.67,189.67,189.67,193.84,194.11,193.84,193.21,196.26,196.87,197.32,196.5,197.69,197.3,193.91,192.81,192.51,194.9,194.64,194.96,196.16,194.15,192.8,194.63,196.58,196.19,195.37,193.91,196.29,198.27,197.88,197.51,196.71,195.86,195.65,197.05,199.72,198.29,200.64,200.07,200.15,202.01,201.63,200.87,195.91,188.87,192.12,189.23,187.17,186.04,191.01,189.62,188.12,187.07,187.8,188.79,187.73,183.7,180.02,182.41,182.64,184.86,182.13,180.17,181.34,182.26,187.59,186.29,186.29,186.29,184.34,193.5,192.95,193.92,193.23,195.83,194.39,194.16,198.23,195.77,194.06,193.27,192.89,192.53,191.77,190.98,190.33,192.46,192.46,188.6,192.07,197.23,195.44,193.44,192.92,190.07,191.79,191.79,190.7,191.4,191.47,195.56,195.04,196.98,196.98,198.44,198.65,198.14,197.99,197.48,199.87,198.09,199.72,198.37,198.38,197.97,196.66,198.2,202.48,203.85,204.76,206.16,206.92,205.93,206.53,203.88,203.36,205.09,203.59,203.92,207.08,205.58,208.13,209.84,209.36,206.81,203.04,205.64,205.17,205.21,205.51,205.03,205.62,203.89,203.78,205.69,206.71,203.22,205.53,205.57,205.81,204.48,207.61,208.05,210.3,212.27,211.95,212.78,213.48,213.87,214.38,213.81,214.19,214,213.7,211.66,210.88,210.15,211.46,211,211.25,211.74,210.24,212.23,210.09,208.41,208.19,208.86,209.2,209.56,209.86,206.53,205.14,206.98,204.86,204.08,205.06,206.91,204.07,206.75,206.96,206.15,205.26,206.25,206.2,206.82,205.14,202.08,204.14,204.26,205.25,202.24,200.49,202.01,202.92,201.8,202.57,201.84,203.02,201.08,201.08],"HSCEI":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100,101.72,101.56,100.13,99.2,98.23,98.69,100.2,98.28,97.89,97.99,99.19,99.73,96.82,98.55,97.39,96.45,97.02,96.66,96.29,96.52,97.51,99.64,99.79,99.92,101.07,101.95,101.65,101.57,102.13,100.98,100.26,100.85,101.48,102.17,101.87,100.13,100.35,100.2,97.86,97.77,96.81,95.84,96.34,94.98,94.79,94.79,94.79,96.02,96.14,96.99,96.99,97.66,97.47,99.09,99.22,99.13,99.77,100.49,100.38,101.04,99.79,100.16,101.2,101.09,100.3,100.42,100.75,100.58,101.73,101.21,101.21,101.21,100.73,100.1,99.97,101.59,101.65,102.78,104.01,104.53,105.9,105.86,107.74,107.94,106.96,107.84,107.46,108.79,108.62,107.56,106.65,106.31,106.21,105.79,104.73,105,105.61,106.13,104.23,103.95,105.91,106.49,106.05,108.67,108.54,109.27,109.89,107.96,108.27,108.17,106.98,107.63,107.75,106.91,106.06,106.48,106.48,107.01,106.09,106.06,105.86,104.95,105.39,105.35,105.35,105.35,103.69,103.07,103.82,103.75,104.35,106.05,106.52,105.93,105.51,105.51,105.03,105.03,104.15,102.48,103.06,104.57,105.59,105.9,106.16,107.89,107.72,107.19,106.04,106,107.1,107.32,107.27,109.14,109.22,109.63,109.63,109.46,109.64,110.12,109.4,109.5,109.55,109.95,109.35,108.25,108.67,108.55,106.81,107.21,108.61,108.07,107.3,107.4,107.68,108.72,108.38,107.45,107.7,107.01,107.5,106.4,107.17,106.81,105.84,105.45,107.53,108.58,110.23,110.75,111.32,111.04,112.12,111.98,111.36,111.71,111.32,111.82,112.1,111.04,111.78,113.81,114.13,113.58,113.59,114.12,114.39,113.18,111.31,109.15,110.54,110.86,111.68,111.51,110.4,111,113.1,113.1,114.09,116.54,117.09,116.62,117.43,116.61,116.51,115.45,115.54,114.89,114.58,115.11,115.84,116.06,115.49,114.61,114.26,115.58,114.86,115.35,115.61,114.69,112.66,113.24,113.93,112.27,112.63,112.63,116.71,117.66,117.66,118.3,117.54,117.88,117.81,118.73,118.93,119.79,119.43,119.98,117.25,119.33,118.63,117.75,118.65,118.17,120.21,119.38,118.8,120.13,119.74,119.78,118.98,120.23,119.51,121.25,121.26,120.63,119.77,117.82,119.07,119.85,119.12,122.59,123.46,121.17,122.94,121.53,120.85,120.25,118.47,118.2,118.91,118.57,115.24,115.12,116.55,118.02,116.79,118.93,119.05,117.34,117.85,119.16,118.78,119.72,120.3,120.3,120.3,119.94,120.62,120.88,124.6,124.8,125.99,126.07,126.31,126.52,126.87,126.94,128.73,128.74,132.01,132.85,135.19,136.06,136.32,139.27,140.62,138.22,141.68,141.02,138.23,140.01,138.69,139.77,139.16,130.97,128.36,127.81,122.87,122.86,123.93,126.58,129.41,129.41,129.41,127.98,130.98,129.34,131.47,132.5,130.56,127.83,128.31,125.99,123.8,127.1,125.75,127.34,128.34,131.08,131.59,130.95,131.32,130.83,130.7,130.05,129.27,128.3,125.21,125.93,127,123.9,123.87,123.87,123.87,125.3,122.41,122.41,123.55,124.64,127.23,127.24,126.87,126.58,123.97,122.86,123.74,126.36,124.45,123.89,126.41,124.86,123.36,124.57,127.31,127.31,125.88,124.08,122.76,123.54,125.38,125.8,126.3,127.45,129.51,128.44,128.43,126.76,127.55,127.49,127.49,124.82,125.46,124.38,125.07,123.46,121.5,123.66,124.09,126.46,126.56,126.81,128.1,125.6,125.66,126.02,124.25,123.38,122.55,122.55,118.65,118.78,117.33,117.07,115.72,114.79,112.31,112.2,114.32,114.32,112.24,110.59,109.52,109.67,111.17,111.75,110.03,111.01,110.94,110.51,109.35,109.21,108.64,110.29,110.79,113.29,114.33,113.78,114.05,114.04,113.82,113.28,110.81,110.4,110.48,112.18,112.54,113.77,112.97,111.15,110.92,108.76,108.19,108.54,109.77,110.85,112.01,111.65,111.29,114.07,114.57,114.42,113.23,112.28,111.64,112.43,109.9,109.21,109.01,107.71,106.68,105.7,108.43,109.18,108.01,108.99,110.89,111.42,113.84,111.78,111.78,113.41,112.93,113.75,113.75,111.03,111.35,108.89,108.71,107.3,107.58,107.81,104.19,106.33,104.73,105.29,105.29,104.65,105.53,108.3,105.66,105.58,105.06,103.84,103.37,103.23,104.67,106.12,110.34,108.86,109.77,109.86,110.5,107.69,107.78,108.18,107.42,108.97,109.26,109.76,108.05,108.26,107.85,107.25,108.62,108.56,109.79,109.28,109.66,112.34,112.61,111.05,108.2,107.05,106.06,105.77,107.54,108.99,106.95,106.87,105.62,105.26,104.17,104.28,103.89,103.89,103.89,103.15,103.16,104.53,101.52,101.54,103.54,104.52,104.62,106.94,107.31,107.93,106.26,108.43,108.97,108.53,109.81,110.6,109.57,109.75,110.37,112.26,112.35,112.19,112.5,113.93,114.22,113.94,113.94,113.94,113.94,113.11,113.74,114.02,115.62,115.32,112.91,115.1,114.77,115.93,116.72,117.97,120.08,119.18,118.28,117.35,118.8,119.5,119.58,119.67,118.31,115.18,116.42,118.37,117.75,118.18,118.81,120.53,120.65,120.01,119.18,118.9,115.96,115.95,116.71,116.61,117.48,119.32,119.21,120.84,120.71,120.71,121.75,121.98,121.45,119.94,120.37,120.08,122.04,122.33,121.5,121.5,121.5,121.11,120.41,118.74,118.84,120.15,119.16,119.16,119.31,119.5,115.97,116.26,114.57,111.96,112.85,112.85,111.13,111.54,111.62,110.35,109.78,109.79,109.48,107.38,107.84,107.4,107.54,107.27,107.88,107.23,107.68,106.76,106.8,106.69,106.69,108.68,109.64,108.35,108.12,107.57,107.66,108.48,111.13,112.76,112.75,113.08,110.9,111.15,112.5,112.34,112.34,113.37,112.76,112.67,112.48,110.72,109.95,110.48,111.33,111.38,111.9,112.17,111.99,111.34,112.63,111.19,111.6,112.1,112.84,112.05,111.3,111.69,110.21,109.65,106.84,104.08,103.36,103.17,103.67,103.17,103.22,101.65,101.86,102.24,102.87,104.36,104.61,105.07,104.51,105.25,103.38,103.2,103.04,103.16,104.1,104.3,103.61,106.21,107.2,107.68,107.55,107.4,109.07,109.35,110.34,109.72,108.42,108.18,107.22,107.12,106.21,106.04,104.98,105.43,104.77,105.31,105.31,105.13,105.52,104.76,104.76,105.32,104.99,105.49,107.91,108.48,108.4,108.73,109.31,108.81,108.85,108.68,107.9,108.74,108.05,109.12,108.88,108.18,108.74,109.66,111.64,112.3,112.13,112.9,112.35,109.57,110.37,108.6,107.65,107.62,108.98,110.43,109.63,107.89,108.46,109.73,109.61,109.64,109.04,106.35,106.99,106.91,105.86,106.56,107.44,107.45,107.32,108.43,109.58,111.89,111.28,113.2,113.82,113.42,113.87,114.11,113.93,113.93,113.93,115.57,115.89,115.3,116.87,116.18,115.27,115.61,114.39,116.47,116.32,117.66,117.23,116.61,116.95,117.9,116.98,113.25,115.37,113.07,113.32,113.32,113.32,109.63,106.59,105.72,106.01,107.73,108.34,111.13,110.52,109.99,111.58,112.37,111.86,112.15,113.13,111.55,112.62,112.67,111.4,109.11,109.22,108.42,109.36,106.36,108.25,108.25,108.62,110.75,107.95,103.08,104.82,103.97,100.41,99.63,95.26,95.15,90.86,88.37,94.14,90.35,94.82,98.38,97.53,98.13,97.07,99.05,97.09,98.35,97.98,99.65,101.66,99.95,101.29,101.29,101.29,101.66,100.4,99.86,101.33,101.43,99.26,99.83,100.18,99.69,101.95,103.07,103.66,103.66,103.66,99.1,100.12,101.25,100.8,101.88,103.14,101.5,101.54,100.01,99.88,100.41,102.03,102.18,101.69,97.32,97.72,99.06,98.77,98.61,98.71,101.52,101.96,102.9,102.91,103.92,103.33,104.49,104.72,102.67,101.51,99.68,101.87,102.3,102.38,102.98,101.99,103.17,102.58,102.58,101.72,100.74,100.75,100.75,103.82,105.75,110.74,109.44,110.96,111.31,108.83,109.18,107.42,107.27,104.62,105.34,106.29,107.84,105.75,106.6,104.07,104.02,104.81,105.14,104.24,103.65,103.58,105.34,105.89,105.33,103.89,103.14,104.82,105.47,105.76,105.99,107.22,107.63,106.47,104.85,105.43,106.72,106.25,106.34,105.32,105.13,103.15,103.38,103.25,102.62,102.04,100.81,101.49,100.44,99.97,100.68,101.24,101.47,101.65,100.47,101.2,99.53,98.87,98.68,96.75,96.04,96.87,95.82,97.02,97.02,97.02,97.54,98.45,99.41,99.36,99.29,101.99,101.99,102.42,100.78,102.36,103.01,103.12,104.04,104.12,104.53,104.53,103.27,102.86,102.78,100.76,102.58,103.97,104.26,108.18,108.38,109.77,109.3,108.83,109.22,108.87,109.21,108.92,109.85,108.97,108.95,110.12,109.56,109,110.48,111.4,108.88,110.05,109.16,109.29,109.69,108.12,107.47,108.28,107.53,107.91,107.81,107.36,108.01,108.87,108.23,107.39,107.2,108.22,107.68,107.68,106.45,107.87,110.08,110.86,110.7,111.23,112.53,111.46,113.1,114.18,115.81,115.47,116.65,116.87,118.34,121.14,123.36,122.74,120.56,123.48,120.74,120.28,117.01,115.72,118.25,119.85,120.29,119.38,119.36,119.34,119.78,121.93,122.65,122.65,122.65,124.26,126.25,124.31,124.99,122.79,122.95,118.82,120.97,116.11,118.25,117.29,120.44,116.92,116.58,113.71,113.28,114.18,117.08,115.35,115.05,116.96,117.26,118.42,116.49,116.73,114.71,111.99,110.92,113.21,112.97,113.78,113.27,115.81,115.81,115.81,115.81,114.29,114.69,113.33,112.27,112.02,113.55,112.59,113.85,114.52,114.45,112.41,112.93,114.26,113.37,113.39,113.71,114.08,111.76,110.6,111.14,110.69,111.05,110.45,109.96,107.69,108.98,106.75,107.42,108.44,109.99,109.99,109.87,110.49,109.86,111.42,112.07,112,111.43,112.42,113.47,113.06,111.77,111.55,110.96,110.77,110.51,110.63,110.99,110.99,110.14,109.05,109.33,109.91,108.89,108.09,110.2,110.23,112.31,112.15,111.06,110.09,110.09,107.53,106.07,106.02,104.78,101.41,102.05,102.68,104.41,103.91,105.04,104.82,102.81,101.84,101.49,103.31,101.58,96.58,91.67,93.65,97.21,95.32,96.39,96.22,97.24,95.97,95.74,96.16,98.07,98.57,97.72,96.81,95.65,93.51,94.47,92.05,90.25,91.01,93.93,93.7,92.27,92.48,92.87,94.81,95.72,96.44,95.93,96.75,97.75,97.55,94.81,96.91,95.38,93.76,92.26,90.91,92.3,89.18,89.2,89.2,90.17,88.84,88.62,90.03,90.44,90.09,90.09,87.97,87.91,86.85,89.95,90.6,92.91,91.36,91.36,91.36,92.56,92.62,94.32,95.77,95.74,96.6,96.24,95.59,93.88,93.46,92.52,91.87,91.51,91.44,92.43,91.06,90.78,90.91,91.99,93.41,94.09,93.8,95.25,94.91,93.29,92.61,92.19,91.13,90.8,90.95,88.54,87.73,86.39,86.99,87.82,87.29,85.43,88.03,87.99,89.38,88.56,88.28,86.91,86.13,86.2,84.84,83.03,84.05,84.61,84.7,84.68,84.68,84.6,83.61,83.59,85.03,84.54,84.45,82.75,83.3,84.98,86.36,86.4,88.92,88.81,88.32,87.38,87.23,87.15,90.45,90.72,89.38,87.79,87.88,85.6,84.76,86.2,86.2,86.2,86.2,88.62,88.68,87.89,90.06,90.75,90.69,88.98,88.04,89.6,89.93,88.14,87.3,85.38,85.87,82.91,82.5,82.84,83.14,81.64,81.56,79.36,76.53,74.72,74.22,74.91,72.89,67.68,63.22,71.13,76.47,76.05,74.79,77.83,78.82,77.72,75.2,76.36,77.56,78.56,77.7,77.81,80.23,80.23,78.55,77.38,77.33,74.42,75,75.52,76.25,76.25,76.25,74,73.28,71.88,71.98,69.01,69.66,70.06,71.43,75.35,75.35,75.03,73.69,73.48,70.3,70.3,68.74,69.89,68.08,70.27,70.47,73.06,73.19,71.23,73.52,72.5,71.06,71.22,71,73.12,74.9,76.57,75.83,75.03,75.03,77.43,77.1,79.28,78.53,78.56,75.78,75.71,76.94,74.94,76.06,76.39,77.94,75.72,77.05,78.76,80.7,81.49,79.44,79.15,79.15,78.95,78.9,77.9,77.83,77.96,75.58,74.24,73.77,73.57,71.83,74.01,73.27,74.12,73.29,73.37,73.06,74.18,73.21,73.12,71.08,70.99,69.19,69.55,71.02,71.26,70.42,70.15,68.59,70.44,70.8,70.35,69.46,69.74,69.17,69.37,69.12,68.64,67.78,70.71,71.45,70.95,70.62,70.87,69.6,68.88,67.9,67.68,67.24,66.45,68.43,68.43,68.48,66.8,67.2,66.29,65.44,66.13,64.7,63.97,63.12,63.37,63.5,61.52,61.04,61.06,60.46,60.46,64.26,63.86,62.71,60.71,59.15,58.77,57.41,58.12,58.16,59.43,57.79,56.91,56.96,52.8,53.48,53.86,54.13,51.92,50.98,53.78,55.28,53.38,56.6,58.19,57.84,57.14,55.93,60.57,61.73,64.72,64.27,63.39,63.24,61.96,60.92,61.38,61.86,61.64,60.63,64.39,65.81,65.92,65.75,69.23,68.68,66.41,68.83,70.55,68.43,68.7,69.19,68.05,68.5,68.18,66.82,67.11,69.34,68.58,68.58,68.58,69.92,69.12,69.22,69.22,70.55,72.94,74.05,73.75,75.22,74.99,75.48,75.49,76.3,75.88,75.51,75.78,75.5,77.26,77.26,77.26,77.26,79.56,80.25,77.39,76.65,78.05,77.49,76.26,74.22,74.66,74.22,75.51,73.57,73.76,73.41,72.45,73.2,72.18,72.93,71.49,70.54,70.82,69.2,68.86,67.95,71.38,70.79,71.64,71.62,71.36,69.45,68.65,66.55,68.04,66.47,67.72,66.92,68.3,66.79,67.62,68.55,70.58,70.15,68.64,69.48,71.02,71.47,71.94,71.65,70.98,70.98,71.17,71.17,71.17,71.75,70.89,70.98,71.38,72.85,72.3,71.12,71.19,69.83,69.51,68.15,68.7,68.92,69.19,69.19,68.96,68.03,69.36,70.18,71.21,69.53,69,69.12,68.79,70,70.09,68.52,69.33,68.07,69.1,68.17,66.88,65.39,65.39,64.53,64.87,63.63,63.49,66.36,66.73,66.89,67.53,67.52,68.03,67.99,68.33,67.9,69.92,70.54,69.96,68.7,67.16,67.16,66.02,65.79,67.15,67.32,66.35,66.33,68.04,68.28,67,64.71,64,64.37,65,65.84,67.56,67.71,67.71,66.07,65.89,65.7,66.23,64.74,68.18,67.61,68.87,70.29,71.23,70.76,68.85,68.68,69.51,69.52,68.01,68.27,68.43,67.52,66.32,65.73,64.76,64.96,63.46,62.26,62.95,63.15,64.71,63.75,64.48,65.94,65.62,65.37,65.37,67.45,66.04,66.11,65.19,65.19,65.03,64.63,64.38,64.78,65.14,64.11,64.38,63.82,62.97,64.65,63.29,62.26,62.66,61.85,63.47,63.47,61.42,60.73,60.79,61.68,61.93,62.48,63.31,64.7,63.14,62.46,62.9,62.72,61.16,60.62,60.62,59.87,60.44,60.49,61.73,61.53,60.52,60.49,61.02,62.48,63.82,62.84,62.35,62.26,60.92,61.83,61.58,64.05,63.15,61.68,63.01,62.73,62.72,63.71,62.37,62.2,61.5,60.07,60.47,59.48,58.88,57.91,58.47,57.98,57.79,57.12,57.96,57.31,57.54,58.85,58.17,57.74,57.94,58.02,56.67,56.67,56.67,57.85,59.51,59.55,58.56,58.11,58.32,57.89,56.58,56.26,55.97,56.72,56.59,56.23,55.16,52.99,53.4,52.93,51.64,53.07,55.26,56.46,55.34,55.84,54.46,53.62,53.93,53.88,53.86,56.51,55.97,55.34,54.79,54.79,54.79,55.61,55.86,57.39,56.62,56.98,58.25,59.45,59.52,59.09,59.95,58.73,58.62,59.14,58.98,57.43,58.57,57.96,58.4,59.35,61.42,61.25,60.98,60.09,60.37,59.67,59.92,60.96,59.44,59.41,60.14,59.14,59.99,59.99,59.99,61.54,60.65,60.65,60.53,60.59,60.86,62.12,61.98,60.7,60.46,59.3,59.36,59.92,59.33,60.2,61.47,62.98,63.19,64.73,64.86,64.77,64.77,66.46,67.59,67.85,67.38,66.66,67.73,69.36,69.81,69.6,69.6,70.94,71.59,71.9,70.42,70.38,69.19,68.19,69.05,69.03,67.7,66.72,66,67.43,67.67,67.54,67.67,67.21,67.21,66.61,65.65,66.3,65.81,65.8,65.74,68.01,67.68,66.48,66.5,66.74,66.87,65.29,65.37,65.37,65.81,66.65,66.8,65.89,64.88,64.79,64.54,65.78,67.44,66.3,65.21,65.01,65.11,63.65,64.56,63.95,63.41,62.11,62.05,62.77,61.81,63.05,62.83,61.68,60.67,60.42,61.25,61.34,62.13,62.25,62.45,62.2,62.31,63.61,64.27,63.96,63.41,64.26,64.21,64.82,65.11,64.28,64.49,65.36,64.13,64.04,63.33,63.03,63.03,61.97,62.21,61.76,62.12,62.68,62.87,63.76,63.76,65.1,65.88,65.96,69.32,69.85,73.16,75.36,77.53,77.53,83.02,81.7,84.21,86.01,77.26,76.04,78.67,78.67,78.25,75.13,75.03,74.12,77.14,75.78,76.01,77.2,75.97,76.24,76.31,76.58,75.22,74.99,75.8,76.06,78.01,76.02,77.91,77.03,75.94,73.58,73.62,71.99,72.06,72.86,73.12,73.2,72.63,71.1,70.84,70.73,72.55,71.49,71.72,72.36,73.01,73.14,72.41,73.68,75.99,75.43,74.84,75.98,74.19,73.64,73.35,74.13,73.84,73.75,74.47,75.4,75.4,75.4,75.42,75.16,75.26,73.2,73.91,73.67,72.78,72.17,72.05,71.21,70.65,72.14,72.39,73.29,73.39,74.7,75.58,74.1,73.96,75.49,76.22,76.21,76.21,76.21,76.21,76.23,78.91,78.11,79.39,80.36,82.04,80.97,83.19,82.62,86.01,85.93,87.5,87.37,85.92,89.47,88.98,87.74,90.78,90.17,86.9,86.92,86.38,89.1,92.27,92.03,90.08,90.39,89.63,89.2,91.65,92.18,94.75,94.6,92.4,90.25,91.37,88.95,89.34,89.59,88.85,87.92,88.14,88.08,86.93,86.93,74.98,76.71,77.8,79.17,80.54,82.24,82.41,80.31,81.53,81.53,81.53,82.08,83.79,83.18,83.42,83.42,83.29,83.38,83.38,84.98,84.98,85.29,85.09,85.69,85.78,88.36,86.58,88.71,87.85,87.42,87.34,88.67,89.41,88.35,88.62,87.11,87.44,87.17,88.37,87.05,86.3,87.96,88.54,89.66,89.09,90.64,90.51,91.53,90.13,89.36,90.13,89.76,88.72,86.83,88.03,88.76,90.44,91.46,90.89,90.46,89.59,89.59,90.07,89.28,88.88,88.87,89.91,88.76,89.49,89.69,90.15,91.65,91.48,91.4,92.77,93.33,93.69,95.4,95.57,94.47,94.74,94.42,93.31,91.71,90.89,91.81,92.41,92.22,92.73,91.83,91.76,92.06,94.46,94.25,93.32,93.26,92.98,93.05,92.65,93.74,95.47,94.45,93.12,92.06,92.37,94.17,94.03,93.43,92.26,93.5,94.17,95.42,96.3,95.6,96.68,96.89,96.9,99.07,97.63,97.79,96.74,95.91,97.49,97.5,96.04,97.6,98.65,98.65,100.39,99.71,98.83,98.83,98.32,98.39,96.61,95.21,93.73,95.5,95.59,93.04,95.32,96.04,95.22,96.02,96.67,97.74,96.79,96.79,96.49,94.65,95.59,94.7,94.6,96.59,95.68,97.49,97.68,98.48,99.1,97.02,96.3,94.72,94.47,94.39,92.09,93.73,94.55,94.59,94.62,94.26,94.7,94.8,93.21,94.01,94.96,93.78,92.26,92.45,92.24,93.73,92.06,90.41,91.3,91.28,91.89,92.29,92.02,92.04,92.04,92.04,91.8,92.82,92.02,94.66,94.45,95.44,94.35,93.32,93.41,95.19,95.86,96.17,95.67,95.19,94.3,93.89,94.18,94.09,94.57,94.43,95.44,98.2,98.62,96.19,93.74,93.46,93.41,93.88,93.24,94.65,95.42,95.68,94.72,93.25,93.64,93.64,93.64,93.64,92.5,94.95,93,93.27,91,91.46,89.84,88.87,87.59,87.25,89.07,88.59,89.92,89.86,89.81,89.52,91.02,91.13,91.22,89.77,88.52,85.77,87.75,88.61,86.62,87.27,86.71,86.45,87.8,87.31,87.31,87.31,87.31,89.58,88.91,89.35,88.81,89.52,90.01,91.93,91.31,91.87,92.33,90.87,90.15,90.6,90.4,89.25,90.91,89.63,89.63,90.58,90.13,90.86,92.08,91.77,91.72,91.7,91.64,91.45,89.72,88.76,89.2,88.84,87.5,88.28,88.28,88.55,87.37,86.35,86.99,87.83,90.47,88.75,87.77,87.1,86.11,85.94,85.88,84.83,86.46,86.47,85.07,84.08,82.34,82.34,81.71,80.11,80.16,78.55,77.02,78.52,78.03,78.03,78.59,79.49,80.65,80.22,83.46,82.56,82.99,83.27,83.65,84.49,85.87,84,86.53,86.31,85.18,86.23,85.39,86.36,87.09,89.03,89.25,88.91,89.32,88.52,88.82,87.74,88.08,89.01,88.04,87.2,86.99,86.11,87.13,87.27,87.45,88.25,89.14,87.46,87.19,88.1,87.65,87.65,87.89,87.37,87.24,86.57,88.32,87.03,86.69,86.4,85.43,85.13,85.53,84.71,84.72,84.4,84.92,86.1,86.33,85.42,85.34,84.3,84.83,84.44,84.86,84.86,82.91,83.12,83.92,83.44,82.7,84.12,84.33,84.39,84.48,83.66,83.91,83.91,82.92],"KOSPI200":[100,100.46,101.02,101.74,101.75,101.4,102.22,101.69,102.53,101.4,101.4,102.07,101.99,102.84,102.41,102.51,100.87,100.89,100,100.46,100.89,101.59,101.69,101.76,101.31,102.19,101.83,100.63,101.08,101.02,100.79,100.81,99.57,99.59,99.46,100.26,100.52,98.32,100.54,99.24,98.46,98.14,98.58,98.63,98.54,98.26,99.39,99.89,99.25,99.34,99.62,99.6,100.13,100.22,99.59,99.3,100.67,100.95,103.18,102.75,102.67,103.03,103.18,102.96,103.4,103.15,103.41,103.22,103.17,103.02,103.02,103.37,102.27,102.39,102.39,102.39,103.56,103.62,103.17,103.65,103.86,103.86,105.6,106.31,105.51,104.81,105.29,105.18,105.42,104.96,105.19,105.27,105.6,106.52,106.52,106.52,105.58,106.16,105.73,105.88,106.13,105.92,105.43,105.42,105.8,105.86,105.5,105.86,105.91,105.87,106.22,107.16,107.45,107.47,106.48,105.92,106.35,106.35,107.37,106.24,106.49,107.06,107.23,106.97,107.23,108.46,109.44,109.44,110.31,111,110.56,111.78,111.3,111.37,111.18,110.41,110.76,111,110.92,110.52,110.9,110.63,110.56,110.06,109.88,109.17,108.49,108.77,109.92,109.92,109.52,109.57,108.88,109.38,110.29,111.04,112.4,112.94,113.16,113.11,113.11,114.07,114.07,115.18,115.18,118.09,118.09,116.64,118.04,117.45,117.7,118.01,117.88,117.54,117.39,118.39,118.68,118.82,120.2,120.88,120.71,119.95,119.98,119.73,121.23,121.03,121.03,120.38,120.6,121.84,120.6,121.3,121.27,120.78,120.82,121.53,121.81,121.1,121.87,122.18,122.83,122.92,122.41,123.09,122.77,123.02,122.26,122.78,122.82,122.34,122.66,123.49,123.49,124.58,124.98,125.44,125.49,125.59,126.26,126.72,126.81,126.08,125.81,126.22,123.71,123.89,124.85,125.11,122.98,123.44,123.64,123.42,121.89,121.44,119.21,120.08,120.08,120.96,121.69,121.45,121.35,121.82,121.97,122.37,122.56,121.9,121.55,121.94,121.4,121.21,121.21,119.74,119.4,120.89,121.07,122.01,122.25,122.08,123.07,123.53,125.6,125.43,125.42,125.33,125.33,124.6,123.77,123.59,123.6,124.55,124.55,124.55,124.55,124.55,124.55,124.55,127,128.43,129.21,128.91,129.1,129.37,129.33,128.57,129.52,129.74,129.55,129.69,128.77,129.65,130.11,131.36,133.41,132.92,133.43,132.87,132.62,133.03,132.77,132.3,131.66,131.38,130.81,131.67,131.6,131.11,131.34,132.12,131.73,132.1,129.77,130.35,130.22,128.09,127.9,129.47,129.8,127.8,127.43,127.86,128.02,127.62,128.45,127.89,128.47,128.62,128.68,128.68,125.91,126.5,126.5,125.58,126.12,127.89,127.89,128.38,128.83,127.82,129.55,130.46,130.06,129.02,128.25,128.67,128.93,129.96,129.64,129.61,129.77,128.49,130.32,130.32,131.56,132.08,133.13,131.3,131.29,131.28,128.78,127.31,125.24,122.27,122.72,120.04,121.34,122.42,123.81,123.81,123.81,124.68,123.2,123.84,122.94,124.76,124.97,124.77,123.21,123.21,121.43,119.95,122.26,122.53,123.96,125.1,126.29,127.19,126.8,127.1,127.15,126.16,126.72,126.65,127.33,123.03,124.01,124.58,122.79,123.59,123.9,123.66,123.41,121.51,123.28,122.71,123.44,123.63,123.24,123.35,123.99,124.12,123.91,125.48,126.07,125.19,125.19,124.39,123.65,125.26,126.33,127.42,127.42,127.02,126.24,124.74,124.74,124.39,123.82,124.96,125.43,125.12,124.03,124.43,123.77,124.2,124.54,124.54,125.35,125.03,125.25,125.62,124.52,121.79,122.44,123.35,123.99,124.35,124.35,125.1,124.04,124.92,124.77,124.77,122.55,121.58,120.25,118.67,119.73,118.54,119.6,119.47,119.23,119.03,117.46,118.01,115.36,115.52,115.09,114.85,115.43,116.25,116.64,115.95,115.94,117.61,117.11,116.91,116.75,116.53,116.94,116,116.37,116.11,116.94,117.27,117.08,117.14,117.63,115.6,116.41,116.27,117.03,117.04,117.12,115.64,114.15,114.63,114.63,113.51,113.64,113.66,114.96,115.39,115.89,116.39,116.89,117.05,117.37,117.37,118.17,117.15,117.67,116.16,115.89,115.33,115.66,115.17,115.13,115.16,117.08,116.26,116.61,116.82,117.76,118.46,118.46,118.46,118.46,119.16,118.34,118.21,116.78,116.78,114.91,114.71,114.17,114.17,113.36,108.36,110.02,109.16,109.05,110.29,109.27,109.73,110.03,107.33,106.86,105.04,103.45,102.47,103.36,103.97,103.55,107.34,106.36,106.95,106.51,107.16,106.85,106.95,106.21,105.89,106.93,106.98,107.24,106.16,105.65,105.45,104.88,106.25,107.15,107.69,107.97,106.86,108.76,107.62,106.92,105.22,105.65,104.5,104.24,105.73,106.1,104.58,104.88,104.43,105.27,104.28,104.38,104.14,104.14,102.78,102.61,103.17,103.17,101.69,100.72,101.56,103.01,102.25,104.6,104.58,105.2,104.36,106.3,106.81,107.07,107.86,107.9,107.4,107.85,108.93,110.92,110.91,111.45,112.87,112.59,112.55,112.55,112.55,112.55,112.49,110.85,111.09,111.72,112.22,113.68,111.83,112.59,112.2,113.57,113.58,113.71,113.81,113.37,113.72,111.76,111.76,111.26,110.44,110.21,109.82,108.23,108.32,109.37,108.69,108.94,110.22,110.24,110.2,110.24,111.2,111.5,109.26,109.32,109.2,108.33,108.88,110.39,110.94,112.49,112.69,112.9,112.78,112.91,113.39,113.19,113.56,113.96,114.45,114.33,112.56,112.59,112.58,112.81,111.72,111.38,110.79,112.94,112.2,112.2,112.68,111.71,111.71,110.78,110.33,106.72,107.14,105.82,105.77,106.19,104.75,104.1,104.34,104.8,105.01,104.9,104.13,104.12,104.24,102.93,103.94,103.92,105.6,105.41,105.54,105.54,105.65,107.16,107.59,107.41,106.77,106.52,106.36,106.86,108.42,108.7,108.49,108.53,108.41,108.51,109.38,109.28,109.19,108.68,107.26,108.12,108.04,105.76,105.43,105.84,107.03,107.38,107.37,107.92,106.91,106.59,108.12,108.12,108.66,107.6,107.53,107.21,105.44,105.92,104.89,104.65,103.57,101.28,99.8,99.24,99.4,100.36,100.56,99.57,100.37,100.37,99.99,100.46,101.62,101.75,100.93,100.86,99.31,99.83,100.63,100.15,102,102.03,101.7,103.06,104.14,104.57,105.3,105.84,106.66,106.66,106.66,107.12,106.99,107.53,108.27,108.86,108.95,109.47,108.07,108.25,106.85,107.73,108.07,105.76,105.76,105.3,105.41,106.86,106.86,105.86,106.84,107.99,108.04,108.82,108.52,107.44,107.82,109.25,108.78,108.97,109.11,109.39,109.3,108.5,108.62,109.65,111.27,111.99,112.05,111.99,111.5,110.6,111.7,110.77,111.81,113.14,113.09,112.72,111.14,109.59,110.04,111.13,110.99,111.39,110.75,109,109.26,108.77,107.96,107.63,108.91,109.49,109.99,110.38,112.28,114.25,114.11,115.94,115.87,115.9,116.3,116.12,115.35,115.35,115.8,116.25,115.69,115.69,114.34,114.5,113.59,114.69,113.98,115.94,116.98,118.19,118.75,118.04,119.24,119.44,120.34,118.97,120.54,119.06,119.06,119.06,115.3,115.77,113.56,112.05,112.26,114.47,115,118.4,117.44,116.66,117.86,118.75,118.51,119.33,119.23,117.25,117.49,116.82,115.16,110.67,111.94,110.24,109.12,105.55,106.47,106.94,109.53,110.81,108.34,103.62,104.23,101.21,97.52,94.77,91.75,89.35,85,78.48,84.15,79.5,86.77,91.71,90.32,92.07,91.54,93.26,89.14,91.3,91.25,94.83,96.43,95.26,96.72,97.66,95.85,97.45,97.45,97.31,100.43,99.3,98.22,99.19,99.93,98.56,100.36,100.97,101.66,101.66,101.66,98.69,98.69,100.42,100.21,101.06,100.4,99.78,100.76,99.89,99.94,100.59,103.1,103.46,103.86,102.24,103.48,105.27,105.4,105.66,105.67,107.58,108.72,112.59,112.81,114.45,114.51,114.72,114.95,113.66,110.97,105.52,111.29,111.46,111.02,111.59,110.83,111.03,112.91,110.16,111.6,109.49,110.3,110.37,111.79,112.59,114.45,112.93,112.62,113.12,112.26,114.14,114.06,115.1,113.91,114.82,114.52,116.24,115.8,115.14,114.46,115.59,118.19,118.64,118.87,117.88,117.93,119.34,120.76,122.6,123.09,124.75,126.42,127.07,127.33,125.72,125.72,123.2,123.47,118.77,120.57,121.82,123.49,123.73,122.62,122.96,120.95,122.01,122.67,124.61,122.88,123.53,124.99,123.57,124.65,124.62,126.4,127.34,126.93,125.23,125.38,124.4,121.62,121.94,119.12,119.55,120.91,121.86,121.86,121.86,121.86,123.46,123.83,124.98,125.02,125.02,125.68,125.85,124.67,123.62,122.8,123.1,123.94,124.35,123.57,123.97,123.47,122.79,123.33,122.06,118.77,120.49,122.9,123.59,126.61,126.85,128.31,128.43,130.4,129.85,131.15,134.14,133.84,133.88,133.96,134.14,137.23,137.94,137.16,138.67,138.91,136.28,138.78,141.24,142.43,144.78,145.65,143.13,146.29,145.46,146.59,146.32,146.06,146.71,146.5,146.32,146.57,144.3,146.23,149.32,149.32,149.62,150.15,153.31,153.31,157.48,159.9,158.34,161.78,169.42,169.78,168.5,169.49,169.28,165.57,161.66,165.93,166.98,169.44,168.21,172.21,168.05,166.85,163.98,159.32,163.61,165.81,167.45,164.73,166.7,164.99,164.58,165.26,165.26,165.26,168.16,169.04,167.05,164.39,165.77,164.17,163.75,160.34,166.39,161.43,161.43,163.35,165.51,163.1,162.25,160.81,159.8,158.89,161.86,163.88,163.11,164.34,163.04,164.24,162.61,162.5,160.95,160.32,160.88,162.6,162.27,164.06,163.45,165.17,166.87,167.31,167.72,168.04,168.1,167.09,167.06,168.98,169.62,170.39,170.29,170.11,171.15,168.06,168.3,168.46,170.27,170.18,168.35,167.87,166.33,165.54,166.81,166.81,167,168.77,171.56,168.85,166.13,163.85,165.47,164.72,166.62,166.62,166.06,166.22,165.62,167.11,166.79,166.58,167.74,168.51,169.46,169.4,170.86,170.21,170.62,170.47,168.61,169.08,170.43,170.61,170.96,172.08,171.2,171.31,169.91,171.08,171.99,172.64,173.43,173.27,172.31,172.82,171.83,171.7,172.35,173.08,172.08,170.37,168.49,169.84,171.19,170.74,172,171.24,169.29,168.77,167.76,169.88,169.95,168.34,168.64,169,169.14,166.94,168.07,169.33,171.72,171.2,170.63,169.99,168.77,167.27,166.34,163.85,163.85,161.98,162.79,159.48,157.83,159.33,162.44,163.02,161.61,161.56,162.05,165.32,165.37,163.78,165.09,165.55,164.53,163.25,160.39,160.95,161.34,162.39,162.58,161.15,161.85,161.85,161.85,161.85,161.64,161.4,161.84,159.97,157.56,158.04,155.47,155.47,152.8,150.41,152.85,152.57,152.57,149.92,151.26,153.42,154.84,154.38,155.72,155.06,154.84,154.9,155.56,157.16,155.74,155.12,152.98,153.51,155.48,153.38,154.19,153.53,153.42,153.73,152.1,152,153.74,155.3,155.19,153.37,152.58,153.79,157.16,156.12,155.71,154.35,151.64,150.29,146.99,150.88,153.44,154.36,154.71,156.07,156.45,157.97,156.72,156.45,155.72,155.81,156.61,157.11,154.13,155.14,155.98,156.8,157.73,156.98,158,156.23,155.24,155.24,155.24,155.71,153.74,152.1,153.92,152.61,153.18,155.42,154.77,152.58,151.15,150.05,148.94,149.8,148.1,146.22,142.71,142.1,137.27,140.98,140.98,140.98,140.98,142.4,144.27,142.92,143.14,145.18,146.33,145.16,142.94,141.94,144.65,145.53,145.14,145.04,143.15,143.52,139.82,141.16,142.38,142.38,142,144.55,142.44,139.03,137.59,137.59,140.99,139.92,139.65,138.24,140.23,142.35,142.69,141.29,142.43,143.68,143.1,142.58,142.58,143.26,143.54,143.98,143.03,143.72,143.64,142.17,140.09,140.2,140.11,138.75,141.38,140.74,139.35,139.26,140.73,140.79,141.39,139.97,137.43,138.1,136.34,137.9,139.83,139.42,139.14,139.35,139.35,137.44,137.44,135.34,135.25,133.08,136.06,135.45,136.86,137.18,135.17,137.55,137.97,135.5,136.1,135.57,137.06,138.81,139.62,139.62,138.03,138.62,138.62,136.13,136.34,136.5,134.64,129.91,129.26,126.89,126.91,126.05,123.83,124.59,121.32,120.29,122.9,124.52,125.67,123.21,120.98,119.73,119.72,121.7,119.04,121.42,122.14,121.41,120.12,120.74,120.25,121.26,124,123.62,124.45,125.89,124.97,125.37,125.87,125.92,126.66,127.32,127.19,126.66,127.52,128.17,128.97,128.87,129.21,127.73,129.93,130.22,130.22,130.66,129.92,129.48,128.69,127.11,125.5,125.96,127.45,127.56,124.58,125.82,127.18,124.06,123.23,123.05,123.27,121.36,121.73,121.73,121.73,125.45,123.16,122.33,121.57,120.7,121.11,119.98,118.79,117.25,114.11,114.28,111.52,111.31,110.8,110.8,113.52,113.83,114.7,114.37,114.37,112.22,113.06,111.28,113.95,114.04,115.62,114.71,113.66,113.64,114.78,114.83,115.72,117.68,116.2,117.98,119.67,119.67,118.8,119.85,121.24,122.87,124.14,122.53,127.24,126.62,126.93,126.79,124.74,124.88,123.92,122.88,123.7,124.96,124.47,122.95,124.28,126.41,126.81,124.06,123.62,122.14,121.4,121.39,122.72,121.94,121.91,123.35,121.19,121.09,120.81,119.74,119.41,121.09,118.96,119.04,119.8,117,114.64,114.64,114.12,114.04,116.56,117.3,118.75,121.96,121.91,122.23,122.36,123.57,124.46,123.56,122.83,123.58,124.28,124.28,124.28,126.32,128.21,129.16,127.07,124.94,126.49,127.57,128.33,125.56,126.24,128.24,127.95,127.47,126.71,127.39,125.23,127.63,126.33,126.72,126.63,124.42,125.8,124.81,123.63,123.97,123.97,124.55,124.59,126.39,125.94,124.2,123.67,122.34,123.35,120.34,121.73,121.45,122.9,121.88,122.22,123.7,124.35,123.77,123.2,124.59,124.84,125.25,126.82,126.17,126.71,127.42,125.16,127.34,128.53,130.3,130.78,131.17,131.41,131.5,131.34,131.44,131,130.33,129.45,127.78,127.58,128.02,128.56,128.56,129.6,128.59,128.45,128.45,129.52,129.26,128.4,128.1,127.44,127.78,128.11,128.62,129.89,131.62,132.43,132.75,132.51,132.06,132.76,132.76,134.49,133.55,133.14,134.95,135.43,135.43,135.16,134.98,136.57,135.69,136.41,135.73,135.15,135.93,135.13,134.91,133.67,134.34,133.28,134.04,134.02,133.27,132.47,133.09,135.11,134.52,133.52,132.4,130.58,130.29,132.72,133.68,134.34,136.62,136.16,135.23,135.12,134.55,134.84,135.6,135.83,134.12,135.77,135.48,136.11,138.23,135.39,134.5,134.39,133.77,133.09,134.53,134.08,133.49,132.45,132.45,130.46,130.05,129.33,129.5,129.84,129.62,131.46,130.06,130.95,131.44,131.9,131.83,133.22,134.3,134.01,133.05,132.61,132.48,132.94,132.14,132.32,134.36,135.86,134.16,133.43,133.4,131.15,130.75,130.58,128.74,128.66,128.66,128.66,128.66,128.66,125.8,125.46,125.6,125.6,125.67,127.89,129.5,128.29,127.31,128.91,129.49,127.11,125.22,124.25,125.4,124.64,121.19,121.5,121.67,120.33,121.97,124.11,125.33,131.6,128.89,127.59,128.1,127.5,127.32,128.61,131.52,131.65,130.77,131.62,132.54,132.64,132.68,131.53,131.4,132.92,132.56,133.28,131.85,132.38,131.08,131.32,131.01,132.56,133.08,133.8,132.59,134.42,135.47,135.27,135.45,137.88,137.35,137.5,137.5,138,138.8,140.98,140.98,141.99,138.31,137.07,136.74,136.09,135.4,134.16,134.01,133.19,133.6,131.82,128.43,128.83,131.13,130.99,131.91,131.24,131.45,131.62,133.04,132.9,132.41,134.84,139.18,137.5,136.97,138.72,139.13,139.13,139.13,140.74,138.89,138.31,140.01,142.12,140.56,140.21,140.85,141.21,139.99,138.92,140.51,140.03,140.03,142.2,140.82,140.29,140.52,142.44,141.12,142.21,142.97,144.4,141.53,142.29,140.72,143.08,147.15,146.75,146,147.52,147.32,146.98,147.53,147.39,148.21,145.6,147.92,146.33,146.7,145.82,145.82,145.99,144.63,143.86,140.46,138.93,141.4,138.85,140.55,140.19,143.19,140.4,142.17,143.54,143.79,143.79,143.47,143.18,143.18,146.81,147.32,145.25,146.13,146.1,146.12,146.12,147.52,145.94,147.16,146.32,146.26,146.35,144.17,146.17,146.23,143.72,141.26,141.07,143.93,142.76,144.31,144.31,146.26,144.71,144.81,146.15,147.58,148.07,147.23,148.75,150.83,151.53,149.99,149.01,149.59,150.83,150.54,151.23,151.36,150.12,150.92,153.01,155.74,155.35,155.87,155.79,156.94,154.49,155.1,155.68,154.2,153.19,151.18,149.58,150.3,149.12,146.21,147.36,149.15,147.63,149.84,149.86,143.81,130.69,134.58,137.47,136.53,138.43,140.04,140.6,141.92,141.92,145.36,143.95,145.31,145.01,145.36,144.89,144.26,143.57,143.85,141.81,142.38,142.59,141.3,136.52,136.23,134.83,133.97,133.3,132.18,135.41,135.35,135.35,135.35,135.35,135.19,135.73,136.17,137.68,135.69,140.37,139.38,135.77,135.77,134.18,134.18,134.58,136.79,135.56,135.56,135.95,136.04,137.73,138.25,136.75,136.94,136.03,136.5,134.72,136.36,135.03,135.22,136.76,137.16,135.86,133.63,132.91,135.31,134.47,134.14,134.24,133.78,131.78,128.9,125.56,125.11,126.23,129.34,129.21,129.57,129.76,130.89,132.57,132.16,130.87,130.53,128.17,128.12,130.52,128.61,127.54,126.83,123.55,126.33,127.54,129.58,130.15,129.8,128.09,129.85,126.96,125.36,127.19,127.35,127.35,126.59,125.64,125.16,125.16,125.14,127.59,130.56,130.31,131.91,132.08,131.75,130.08,130.25,130.34,132.21,131.96,131.51,131.71,133.41,131.73,132.61,132.61,132.61,132.61,132.61,131.28,127.81,129.45,130.93,132.53,131.49,131.73,132.58,132.8,134.31,134.98,135.91,136.98,139.62,138.68,138.59,137.79,136.86,137.56,136.44,131.64,131.64,131.54,132.75,134.02,133.27,133.42,131.91,134.25,134.45,134.21,137.12,136.98,138.17,139.21,139.87,139.11,138.26,139.8,137.94,135.06,130.9,133.19,132.42,131.11,129.43,121.92,122.09,119.93,128.02,126.93,128.12,129.22,127.41,128.5,129.31,129.69,129.41,131.51,131.42,132.66,132.75,133.52,133.4,133.4,133.42,133.42,133.42,134.41,134.47,134.48,136.68,136.72,138.54,137.5,138.01,136.48,136.66,137.59,135.79,135.97,138.66,138.34,140.34,142.98,141.62,141.65,141.65,145.67,148.28,148.28,150.83,151.53,153.5,153.83,152.52,155.22,155.63,157.07,157.24,159.62,159.22,164.52,165.21,163.69,162.53,163.27,163.93,163.21,165.77,162.54,162.65,165.88,166.2,168.72,168.58,170.32,171.22,169.79,169.98,169.77,171.13,168.57,169.35,169.35,169.65,170.67,171.64,173.2,172.72,165.68,167.29,169.83,169.61,171.44,170.7,170.63,169.98,172.06,171.93,171.93,169.02,167.83,166.84,167.14,168.75,170.87,169.11,169.46,170.05,169.39,166.71,168.61,169.48,170.25,170.46,171.25,173.78,177.23,178.79,182.23,182.98,186.21,183.91,187.19,186.45,188.36,189.63,189.18,189.28,184.31,187.15,186.68,188.78,194.31,194.31,194.31,194.31,194.31,194.31,199.65,197.64,195.68,201.06,206.53,206.94,210.8,210.8,213.68,211.23,216.6,222.77,220.34,225.07,226.52,228.2,235.9,229.17,222.66,223.83,219.74,226.56,228.96,231.06,231.82,221.88,227.09,219.14,217.64,222.19,212.8,212.98,214.48,220.29,221.86,218.17,218.15,222.79,224.78,224.37,228.73,232.02,230.68,230.58,228.47,231.53,226.24,221.13,225.5,222.76,223.84,229.48,230.24,230.07,230.07,232.38,238.53,238.64,238.64,245.8,255.48,259.7,261.68,261.56,263.16,264.98,268.07,270.06,274.24,277.49,281.16,279.01,281.55,284.45,286.41,283.56,293.44,298.79,301.5,302.61,285.69,306.99,311.26,298.09,294.61,307.54,307.47,310.62,321.46,320.79,320.79,320.79,320.79,330.89,338.51,340.84,349.26,355.94,371.76,367.56,367.56,338.44,298.03,327.34,326.4,305.32,324.11,328.46,325.88,320.14,325.61,331.15,349.93,339.61,339.66,316.96,325.93,330.29,318.55,317.09,307.3,293.22,320.5,305.06,314.39,319.71,323.36,347.66,340.94,346.07,342.92,353.25,360.97,369.34,366.8,368.51,378.95,379.84,384.21,382.73,391.97,393.43,396.4,390.72,390.72,413.37,413.37,444.86,452.83,453.34,477.08,466.04,480.51,489.57,457.76,461.27,445.96,443.24,482.5,482.82,482.82,496.41,511.5,509.03,528.82,551.3,554.18,554.18,543.28,510.78,467.27,509.35,483.25,484.99,508.53,535.68,548.08,558.02,574.66,574.76,581.74,520.5,539.37,572.66,538.14,532.64,539.81,525.88,480.3,511.68,509.25,482.64,456.18,460.65,471.27,424.83,430.13,458.35,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64],"Nikkei225":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.7,99.99,100.75,100.91,100.59,101.22,101.1,101.2,99.42,99.42,98.08,99.66,99.63,94.29,100.63,100.81,102.54,102.51,103.64,103.64,104.25,105.05,105.38,105.38,106.37,106.65,106.51,106.22,106.23,107.41,106.91,106.03,106.53,107.32,108.88,110.22,111.14,111.69,111.71,111.83,112.57,112.51,113.11,112.82,112.72,112.72,112.54,112.58,112.57,111.08,110.9,110.9,110.9,113.68,113.26,112.87,112.87,111.99,112.35,111.02,111.9,110.79,109.16,109.62,110.66,111.04,109.61,109.01,110.57,112.57,112.95,112.38,110.48,111.1,109.74,109.76,110.1,109.72,110.28,109.7,112.44,112.9,111.62,112.78,112.25,111.6,111.69,112.45,112.44,112.39,111.88,110.86,110.93,112.52,113.51,112.96,112.44,112.23,111.71,112.09,113.75,113.91,113.77,113.59,113.66,113.26,113.26,112.88,110.48,110.73,111.76,110.15,111.41,111.5,110.6,109.71,110.14,109.14,109.43,107.9,108.29,109.06,108.77,107.64,106.91,106.38,106.5,106.86,106.94,106.93,108.04,109.52,110.7,111.92,111.7,111.38,112.04,112.82,112.82,112.82,112.82,115.43,115.13,115.46,115.82,115.37,115.28,115.57,114.97,113.45,113.67,114.17,113.8,114.55,114.96,114.22,114.2,114.17,114.01,115.23,117.07,117.03,115.92,115.95,115.51,116.12,115.51,115.45,115.36,115.06,115.71,116.43,117.38,116.84,116.68,116.81,116.93,117.35,116.8,117.32,116.23,116.36,116.23,116.51,116.01,115.63,116.51,117.17,116.61,116.62,116.73,116.73,116.04,116.16,116.88,116.62,115.9,115.78,116.33,116.5,115.81,115.61,115.96,116.5,116.21,115.76,116.36,116.02,114.52,114.47,114.47,113.35,114.61,114.47,114.31,112.97,112.52,112.46,112.76,112.29,112.86,112.85,112.34,113.18,113.99,114.25,113.19,112.48,112.31,112.54,111.83,113.4,114.74,115.26,114.92,115.51,115.51,117.78,117.84,118.06,117.76,118.35,117.96,117.59,118.15,118.11,118.36,119.6,119.68,119.69,120.05,120.05,120.82,121.15,121.58,122.74,123.32,123.79,123.95,124.44,124.5,125.88,126.51,125.95,126.13,127.69,127.71,127.71,130.08,130.77,130.77,130.83,133.08,132.95,132.68,131.6,129.85,129.85,127.81,129.68,129.95,129.16,130.06,130.68,130.68,130.84,130.52,130.46,131.11,131.85,132.4,131.75,131.25,128.67,130.53,132.35,133.09,132.67,132.04,131.67,130.85,132.88,132.68,132.82,132.67,132.88,133.09,132.82,132.93,132.19,132.08,132.08,132.08,136.38,137.59,137.59,138.38,138.02,137.57,137.24,137.59,138.97,138.48,137.87,138.13,138.18,139.97,138.9,137.33,137.11,137.1,135.14,134.02,136.27,135.04,131.6,125.38,125.59,127.01,124.06,124.06,123.26,122.74,124.54,126.02,128.51,127.21,127.47,126.11,127.02,128.53,129.91,128.04,126.04,122.9,122.09,124.27,123.31,123.98,124.56,126.62,127.46,126.35,126.51,125.77,124.63,124.05,124.05,125.28,119.62,120.48,123.68,122.02,122.76,124.48,124.1,123.54,123.7,125.59,125.13,125.78,126.45,125.83,125.67,126.36,126.69,126.76,128.56,128.75,128.58,128.15,129.26,128.89,129.5,130.36,130.36,130.59,130.39,130.39,130.39,130.35,130.59,130.02,130.53,132.04,132.67,132.39,131.8,132.51,133.04,133.46,133.22,131.65,130.18,130.26,130.43,129.72,127.75,128.81,128.64,130.4,130.77,131.27,132.42,131.67,132.31,132.74,133.25,131.93,132.59,131.59,129.26,130.87,131.66,130.64,129.61,129.63,129.22,129.21,129.41,126.55,126.4,126,125.02,126.41,127.95,128.79,127.25,128.73,131.11,131.11,131.69,132.25,132.08,131.69,129.95,130.61,131.21,131.05,131.78,130.8,130.86,131.98,130.62,130.69,130.59,131.49,131.38,131.12,129.37,126.82,129.71,128.83,128.76,129.21,128.8,128.92,129.75,130.03,131.13,132.28,132.36,132.56,132.69,132.66,131.75,131.69,131.01,130.47,129.43,129.81,131.5,131.15,132.41,133.99,133.99,135.89,137.35,137.36,138.49,138.49,138.9,139.44,138.07,139.94,140.67,140.82,139.89,139.11,137.99,137.99,136.17,136.38,131.07,131.67,129.22,130.83,132.52,131.46,130.73,131.21,127.71,128.17,123.4,122.91,122.71,124.49,127.18,125.83,129.06,127.06,128.5,128.14,130.47,129.1,129.21,126.54,126.75,126.5,125.79,126.61,125.22,124.79,125.59,125.59,126.55,127.37,128.67,129.17,129.68,130.98,127.85,127.18,124.75,125.78,123.12,122.7,125.34,126.58,124.02,124.78,122.51,121.77,118.32,117,117,111.14,112.14,116.49,116.13,116.13,116.13,116.13,113.5,116.27,117.22,118.52,116.99,118.13,118.13,119.26,118.61,118.37,119.9,120.21,119.65,119.48,119.37,120.53,119.81,119.9,119.27,120.53,120.61,121.17,120.94,121.11,120.4,117.97,117.97,121.05,122.68,122.65,121.27,123.48,123.6,124.35,124.54,124.31,124.91,124.45,125.07,124.08,125.34,126.61,126.06,125.3,124.49,121.99,122.57,124.76,123.53,123.51,124.46,125.23,125.13,125.37,125.37,125.48,121.71,124.33,124.04,122.04,123.04,124.79,124.77,125.98,126.05,126.53,126.26,126.5,125.83,125.97,126.89,128.62,128.93,129.26,128.17,128.81,128.91,129.15,128.8,129.43,129.14,129.14,129.14,129.14,129.14,129.14,129.14,127.2,125.34,124.17,123.84,122.95,122.23,122.94,122.21,123.29,123.59,123.42,123.49,122.72,122.52,122.9,123.35,121.86,121.51,119.53,118.42,118.41,120.54,120.53,121.17,122.62,123.03,122.59,122.03,122.52,122.56,121.68,123.78,124.53,123.34,123.5,122.97,122.34,123.8,123.44,126.08,126.22,125.54,125.92,126.17,124.94,125.12,124.94,125.58,125.82,125.82,124.95,124.56,122.11,124.55,124.26,125.44,125.96,126.23,125.66,125.42,125.96,124.87,124.98,122.35,120.22,119.44,119.04,119.48,120.01,120.01,118.68,119.84,118.39,118.47,119.31,119.97,119.63,119.68,120.16,117.55,118.69,118.82,118.71,120.13,119.64,119.67,119.81,122.34,123,123.69,124.12,125.31,126.25,127.58,127.58,127.65,127.42,127.9,128.1,128.1,128.22,127.76,127.92,126.94,126.23,126.98,126.36,123.82,124.22,124.02,125.25,124.49,125.04,126.48,126.48,128.85,130.39,130.27,130.5,130.83,130.83,131.27,132,132.28,132.68,133.3,132.54,133.02,132.58,132.58,134.91,135.21,135.36,135.72,135.37,136.46,135.3,134.27,135.21,135.86,135.14,134.31,133.67,134.1,135.14,135.61,135.99,135.82,135.15,136.52,135.65,134.23,135.19,135.5,135.94,135.83,135.72,135.91,139.38,138.97,139.63,138.87,138.46,138.18,138.21,138.26,137.99,138.81,138.31,137.26,137.26,137.26,137.26,134.63,136.79,134.63,137.74,138.38,138.38,139.39,138.76,138.86,139.49,139.73,138.46,139.43,138.06,138.24,135.44,134.7,135.65,133.32,134.64,133.28,133.94,135.3,138.51,138.25,137.43,137.43,138.44,138.25,137.43,136.48,134.57,135.77,136.23,135.69,135.69,131.16,130.12,127.34,122.67,123.84,122.32,122.42,123.75,120.39,114.29,115.27,112.65,107.68,101.13,98.65,98.7,97.05,96.04,96.04,97.98,104.97,113.41,108.29,112.5,110.73,109.76,104.82,103.38,103.39,107.78,109.95,112.29,112.24,113.13,110.49,113.94,113.43,111.92,115.44,114.12,111.87,111.04,112.73,111.76,114.78,114.71,114.71,117.16,113.83,113.83,113.83,113.83,114.15,117.08,118.31,118.17,117.59,115.55,116.26,116.82,118.55,119.49,119.24,118.29,120.34,123.41,124.27,127.16,126.94,128.01,129.53,131.2,131.68,132.65,134.48,133.97,134.17,130.39,129.42,124.92,131.02,130.29,129.71,130.42,130.18,130.83,130.74,129.15,130.61,127.61,129.32,128.35,128.49,129.42,131.79,131.21,130.19,130.71,129.33,132.2,131.05,133.13,132.11,131.68,131.81,132.77,132,132,132,131.8,131.46,129.95,129.61,125.96,128.78,130.97,130.63,130.07,129.56,129.56,132,132.54,134.89,135.12,134.01,133.74,134.09,132.75,132.98,133.36,135.17,135.13,134.66,132.76,134.26,134.25,134.88,136.15,134.64,133.97,135.04,133.63,134.81,135.8,136.69,136.08,136.2,135.3,135.54,135.54,135.54,135.46,133.96,134.63,136.41,136.57,134.52,134.52,133.62,135.26,135.96,135.9,137.2,137.04,136.69,136.94,137.08,136.39,135.83,137.34,136.74,137.16,136.2,136.44,136.31,136.26,135.87,135.37,133.31,135.16,135.16,137.48,139.86,141.13,144.12,144.5,147.08,148.07,147.29,150.31,150.94,149.27,148.73,148.11,148.11,151.81,152.57,153.97,154.59,153.37,155.42,155.5,155.55,155.21,154.03,153.56,155.6,155.24,154.64,155.1,154.84,155.25,155.53,155.28,155,153.38,153.9,154.73,154.66,155.81,159.95,159.23,159.23,158.15,157.57,156.98,159.5,163.26,163.26,163.41,165.1,166.51,165.47,163.86,166.13,165.49,166.85,166.12,167.23,165.62,166.14,163.6,160.5,162.98,164.56,166.21,164.44,166.98,170.51,171.19,171.52,171.52,171.27,174.55,176.77,175.75,175.43,174.16,174.96,174.96,172.15,175.04,168.06,172.11,170.63,171.5,167.85,167.47,166.77,168.42,168.47,169.49,172.42,172.71,173.6,173.56,175.32,172.85,169.27,168.23,164.81,166.69,169.28,170.49,170.77,169.29,170.51,173.21,174.58,172.3,172.5,172.37,172.71,171.38,172.62,171.86,171.99,172.22,172.23,168.84,165.41,169.35,168.38,168.99,168.21,168.57,168.57,167.17,167.17,167.17,167.17,170.18,170.33,171.26,165.99,163.31,159.25,162.95,161.44,164.82,162.71,163.03,164.3,164.57,165.67,166.18,165.64,169.12,167.45,167.18,167.94,168.59,167.92,168.37,168.05,167.45,168.02,167.96,169.2,170.82,169.95,168.36,168.05,162.52,167.59,167.53,167.53,168.64,168.54,167.17,167.05,166.56,167,165.93,166.19,164.58,163.14,162.11,165.76,166.62,165.99,164.07,162.47,160.44,158.91,159.83,159.83,159.83,161.49,162.28,160.03,161.19,158.3,161.18,160.38,160.04,160.88,161.41,161.41,161.81,162.86,162.54,162.32,159.69,159.12,160.05,158.28,156.73,159.52,160.9,160.86,160.96,160.37,161.23,162.97,165.07,165.61,169,172.09,173.57,175.11,174.11,176.27,176.65,177.95,177.03,175.94,176.96,176.96,173.13,171.97,171.97,175.5,175.45,175.13,171.42,170.88,166.93,165.04,161.42,159.72,160.59,162.74,165.35,163.79,163.27,165.65,168.66,168.41,169.51,169.74,166.57,167.13,165.94,168.87,168.83,167.21,167.63,172.01,171.28,171.28,172.87,171.81,171.2,169.91,168.88,169.87,171.8,172.76,172.95,172.25,171.73,172.58,172.75,172.75,170.01,171.15,166.82,164.1,161.42,162.08,161.02,162.63,162.03,165.1,167.45,166.66,165,166.17,164.97,165.12,168.64,165.62,162.09,165.46,165.72,167.09,167,166.38,168.66,167.72,167.05,167.05,167.05,170.01,170.18,165.29,165.23,165.23,163.75,166.9,165.29,163.18,164.39,163.95,159.36,161.14,159.68,160.07,157.42,156.72,151.84,155.01,156.66,157.11,159.75,158.05,159.21,158.1,158.3,160.02,160.69,160.69,157.12,155.87,159.32,158,157.36,156.14,153.46,153.46,150.68,153.62,153.91,155.75,153.13,154.2,150.77,146.33,143.84,143.41,149.06,145.99,146.84,147.06,149.47,154.64,155.65,155.65,157.95,162.69,163.1,163.32,162.13,163.92,162.61,161.42,160.52,160.93,161.23,158.69,156.01,156.57,155.62,152.79,155.75,157.65,157.19,155.49,156.57,157.92,159.86,157.26,154.28,154.91,153.09,155.77,155.77,155.6,155.6,155.6,155.6,156.67,152.7,151.82,152.09,149.39,153.33,154.03,154.68,156.14,153.19,155.14,156.66,155.19,154.78,154.36,155.39,158.8,158.28,159.31,159.05,161.07,161.97,162.13,163.81,163.89,161.44,156.58,154.51,152.74,153.35,150.64,149.52,152.28,151.72,151.85,153.71,155.91,156.94,155.52,153.13,150.48,151.74,153.31,151.48,153.7,153.85,155.56,152.8,153.63,154.58,155.43,155.43,156.43,160.6,161.31,161.96,160.71,160.45,160.81,161.38,161.3,162.42,160.1,160.96,162.06,163.48,163.9,162.46,161.41,161.41,165.63,167.51,167.5,169.55,167.92,167.85,167.07,165.08,164.27,165.23,166.18,161.75,163.59,162.99,160.49,160.43,160.25,160.29,159.15,162.83,163.7,165.6,166.02,161.4,161.74,159.95,159.95,160.65,158.47,157.55,157.55,153.36,154.17,151.86,153.3,150.49,152.1,156.61,157.35,158.46,157.33,157.33,153.18,153.15,152.23,157.18,155.35,157.56,158.15,156.69,156.02,156.51,158.11,159.16,158.66,157.26,160.06,160.59,160.5,160.5,157.81,159.71,161.71,160.81,159.24,163.98,162.24,162.4,162.62,162.05,161.87,162.14,163.13,163.13,164.68,164.1,163.4,162.62,162.28,163.77,161.17,161.41,161.79,160.64,159.99,161.88,161.54,162.19,163.36,162.76,159.71,158.03,154.15,153.1,153.8,152.22,153.21,153.45,152.83,151.39,151.4,151.4,151.4,149.21,149.81,150.7,150.7,151.87,153.44,153.46,151.54,149.82,151.66,155.44,153.2,154.06,156.11,158.39,158.95,158.76,158.87,159.17,158.55,158.67,158.99,159.61,160.68,160.63,160.17,160.04,160.55,159.13,160.15,159.57,160.69,159.63,159.74,159.4,157.26,157.26,159.28,159.11,159.24,159.65,159.55,162.03,163.83,164.25,165.03,166.07,163.29,161.49,157.94,157.98,156.71,158.59,156.34,156.34,159.36,159.09,158.89,159.42,159.66,161.78,161.2,162.7,163.55,164.12,161.37,159.4,159.66,160.33,162.01,162.94,163.37,165.32,165.44,166.28,165.98,166.27,165.73,165.9,166.05,164.87,165.11,167.42,168.97,169.17,169.17,169.17,169.17,167.97,169.67,168.97,168.99,170.51,171.89,173.15,174.6,177.39,178.75,180.37,179.62,178.02,178.71,179.38,181.22,181.77,179.21,180.72,182.9,186.92,188.6,185.16,183.58,187.2,188.18,191.57,194.38,194.28,195.56,193.61,193.72,194.8,193,190.2,189.72,188.79,192.59,192.82,192.56,195.84,193.92,193.43,190.15,187.92,186.76,186.84,185.34,188.1,187.93,187.93,188.53,190.86,188.51,187.43,189.73,189.62,189.54,190.83,190.07,192.46,194.23,189.77,186.59,186.78,187.14,187.85,186.85,188.41,188.41,186.01,187.05,184.31,183.49,182.48,183.14,184.83,185.72,187.33,183.48,186.65,186.98,187.6,189.26,189.79,191.11,191.68,192.86,191.41,189.18,188.38,190.17,189.76,192.44,194.56,194.56,192.87,191.6,188.98,188,189.6,187.49,187.82,184.92,184.84,184.27,181.24,177.12,180.3,179.83,179.83,184.19,185.29,188.53,187.5,183.69,185.9,185.91,182.36,181.37,179.86,180.22,181.43,177.55,179.81,178.1,179.04,183.35,185.37,185.37,189.77,187.24,186.63,189.41,188.96,189.06,189.7,194.48,193.93,194.86,193.72,193.52,194.09,194.09,195.09,194.06,193.83,193.33,194.29,193.97,192.81,190.16,194.05,190.64,187.45,190.26,190.56,191.04,189.64,191.29,190.07,192.74,195.39,192.28,192.45,192.94,193.24,195.42,194.6,194.16,194.16,194.16,193.14,193.66,193.66,195.89,199.83,203.36,206.42,208.3,206.66,205.84,205.77,208.66,212.04,211.87,210.19,210.24,207.43,209.03,209.25,210.53,208.94,209.79,210.93,209.8,209.57,213.88,214.08,214.08,220.27,218.75,221.39,223.3,223.2,222.58,222,226.85,226.85,227.63,227.67,227.48,227.24,231.56,232.71,232.65,232.61,229.75,230.27,225.24,225.1,224.51,225.16,224.58,230.57,232.1,232.1,236.81,237.23,234.48,234.39,236.5,233.05,234.22,230.94,231.14,228.9,230.76,226.23,228.29,230.76,229.65,228.85,229.31,227.63,223.21,220.25,220.94,215.07,217.22,217.88,223.14,218.32,220.1,220.1,222.83,222.07,221.84,221.84,221.84,225.32,221.65,220.9,221.8,221.52,222.54,222.71,225.81,225.04,226.68,225.97,224.06,226.88,224.22,225.7,225.44,223.71,220.79,223.31,225.83,225.33,223.32,224.56,224.44,226.5,227.06,225.56,224.66,225.2,221.07,223.27,223.79,224.15,223.94,225.14,227.28,230.15,228.26,229.66,229.94,232.51,235.45,237.38,237.37,236.61,241.25,242.71,244.98,238.99,238.99,239.48,238.45,232.81,232.45,229.75,229.73,227.18,219.72,218.55,223.19,223.53,226.87,221.21,208.35,182.52,201.19,203.59,202.09,203.21,203.21,210.22,211.44,213.09,220.84,216.93,220.84,220.2,221.7,222.59,221.11,222.15,222.63,222.58,224.23,224.54,224.46,214.95,212.68,211.14,210.12,209.79,206.67,213.71,212.25,212.25,210.05,211.08,215.57,218.87,218.87,220.13,219.72,225.85,231.09,220.01,224.26,219.37,223.68,224.16,228.21,225.91,227.89,228.49,229.79,229.79,231.56,227.32,225.76,226.17,226.01,222.87,221.08,221.31,219.98,223.99,225.72,227.89,226.75,220.79,220.79,223.23,229.07,228.49,229.18,229.37,228.46,224.66,223.58,224.21,221.76,222.88,222.52,220.63,222.12,225,223.04,221.26,222.5,221.68,223.45,227.72,227.88,228.57,226.81,227.21,228.41,228.44,231.2,229.01,228.93,228.39,226.75,225.2,224.55,227.21,226.49,227.03,229.57,233.71,231.47,231.47,231.47,231.47,228.06,232.56,231.97,229.79,227.38,227.38,223.23,223.05,223.8,223.09,225.71,226.44,230.03,231.84,231.68,229.56,226.38,228.68,229.26,229.6,223.49,225.11,225.3,226.66,225.04,225.12,225.12,226.07,228.95,227.14,227.29,227.85,227.23,224.41,224.98,224.98,221.85,221.3,221.96,215.58,219.23,216.59,217.1,218.76,214.02,214.84,213.47,213.62,213.45,214.98,216.97,219.58,219.04,219.04,218.6,218.2,219.2,220.63,219.31,215.37,206.65,206.69,207.28,201.54,195.99,180.65,191.54,184,200.8,194.86,197.16,198.82,196.81,199.46,201.5,198.89,198.55,202.31,203.3,207.16,207.94,207.94,209.13,211.5,213.69,213.69,213.69,213.39,214.26,217.59,218.41,221.54,221.22,219.06,219.05,217.57,217.75,216.41,214.59,215.6,217.76,218.87,218.86,222.99,220.27,217.4,217.27,219.01,217.89,218.98,220.99,221.7,222.92,221.48,219.51,222.28,223.59,225.61,223.31,222.81,222.53,225.06,225.94,229.67,232.95,234.91,232,230.7,230.84,230.98,229.69,230.27,231.04,230.03,229.58,228.94,230.21,230.13,231.51,231.03,231.03,230.77,238.88,242.68,240.53,237.87,235.99,235.88,238.29,236.72,233.77,235.27,236.69,238.22,242.64,242.64,247.85,251.08,247.45,251.68,253.63,252.65,248.84,247.22,247.36,248.37,245.97,246.7,248.49,247.85,244.78,245.48,243.33,247.05,249.59,253.22,252.15,254.35,257.45,259.74,259.74,260.52,259.87,262.85,261.35,263.95,263.95,264.75,265.47,263.15,261.34,260.7,258.48,260.72,265.55,278.17,278.21,276.96,281.86,279.01,279.01,271.81,276.6,280.11,276.07,285.37,286.13,286.08,282.22,286.04,293.07,291.37,297.69,297.79,304.09,304.09,298.79,291.33,295.23,291.7,295.39,294.99,296.27,297.54,292.28,291.98,282.57,281.61,289.08,282.13,282.13,282.32,287.54,291.07,291.57,286.06,286.06,289.31,296.07,292.95,293.48,293.9,293.6,290.96,294.95,291.07,286.52,287.27,284.31,287.24,292.43,292.49,292.1,292.46,294.45,293.16,292.07,292.07,292.07,300.73,304.71,301.48,296.58,301.35,301.35,310.69,315.29,313.95,312.94,310.89,307.45,306.2,311.5,312.42,306.84,309.44,309.59,309.68,309.38,305.5,317.49,315.01,312.25,314.78,327.02,334.49,334.49,334.43,330.38,329.59,328.2,331.55,333.43,329.7,329.7,332.58,339.9,340.89,341.45,336.85,326.53,314.73,320.72,322.71,305.93,314.75,319.26,315.93,312.26,311.86,311.57,320.5,309.67,309.67,298.89,303.17,311.85,311.01,309.67,301.04,296.27,311.8,304.39,308.22,309.91,310,326.7,324.3,330.27,327.83,335.8,337.29,345.32,339.28,341.3,344.34,345.72,343.13,346.47,351.24,347.64,347.64,343.97,345.29,345.29,345.29,345.29,364.56,363.86,362.15,364.03,367.1,363.52,356.3,352.85,351.31,346.98,357.89,367.49,378.05,377.11,377.13,375.35,384.84,388.35,387.19,396.87,391.46,386.34,371.47,379.55,372.37,372.59,383.05,402.18,402.68,405.57,412.25,413.39,419.8,404.91,401.35,419.87,402.43,403.05,406.5,408.89,398.79,404.65,404.62,396.03,387.68,393.05,397.77,390.14,393.05,398.89,387.78,372.15,372.15,384.28,383.6,385.38,374.87,376.73,361.84,356.44,358.95,373.43,369.9,371.08,384.67,381.09,380.65,388.56,388.56,391.77,396.32,398.68,401.61,391.41,379.02,384.19,383.03,380.19,382.1,384.45,383.7,385.28,384.74,384.18,373.22,372.57,377.25,385.25,378.69,377.96,378.7,371.39,368.38,368.33,370.88,372.12,377.24,377.24,377.24,377.24,380.11,385.04,382.22,379.92,387.3,400.09,396.33,405.83,410.11,406.35,400.58,400.52,400.52,393.24,393.05,373.8,379.01,376.65,371.11],"S&P500":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.99,100.47,100.08,99.91,99.61,99.3,99.29,98.62,97.97,97.54,97.38,99.54,99.92,101.02,101.22,101.08,101.07,101.82,101.66,102.14,101.89,102.65,102.88,102.96,102.96,103.36,102.82,102.96,102.68,102.32,102.36,102.96,103.31,104.67,104.9,105.52,105.4,106.09,105.23,105.64,105.45,105.66,106.04,105.78,105.59,105.72,105.72,105.96,105.07,105.04,104.55,104.55,105.44,106.04,105.96,106.33,105.96,105.96,106.26,106.03,106.23,106.23,105.91,106.1,105.71,106.07,105.78,106.48,107.33,107.25,107.16,106.52,106.42,106.45,106.52,107.29,107.06,107.09,107.16,107.78,108.16,108.73,109.16,109.71,109.61,109.8,109.8,110.46,110.34,110.39,110.55,110.67,110.38,111.89,111.24,111.29,110.93,110.6,110.35,110.44,110.8,110.84,110.47,111.39,111.21,111.06,110.84,109.47,109.67,109.56,109.46,109.35,110.14,110.26,110.59,110.34,110.16,110.22,109.88,110.09,110,110.08,109.92,109.51,108.76,108.76,109.7,109.38,109.19,110.02,109.68,110.87,111.55,111.49,111.55,111.34,111.53,111.67,111.53,111.59,112.05,112.05,111.94,112.06,111.82,111.65,112.19,112.11,110.07,110.48,111.23,111.8,112.01,112.28,112.78,112.82,112.82,112.68,112.63,113.48,113.9,113.77,113.45,113.63,113.66,113.56,113.45,113.96,113.85,113.6,113.63,114.58,113.81,113.74,113.69,113.87,113.9,112.98,113.98,113,113.17,113.43,113.43,113.6,112.53,113.26,113.36,113.27,114.1,114.31,114.85,114.84,114.91,115.53,115.51,115.47,115.34,115.68,115.71,115.6,115.45,115.36,115.64,115.7,115.45,115.67,115.86,115.58,115.54,113.86,114.01,115.15,115.1,115.26,113.48,113.27,113.4,114.53,114.14,113.9,114.09,114.15,114.24,114.77,115.43,115.65,115.65,114.78,115.14,115.12,114.95,116.19,116.58,116.67,116.54,116.76,116.93,117.06,117.13,116.78,116.85,116.59,116.6,117.08,117.22,117.65,118.11,118.36,118.51,119.18,119.05,118.84,119.11,119.33,119.13,119.23,119.44,119.52,119.61,119.65,120.26,119.78,119.98,119.42,119.57,120.54,120.15,120.26,120.46,120.48,120.85,121.01,120.98,121.16,120.7,120.59,120.71,120.43,119.77,120.75,120.43,120.59,121.37,121.28,121.28,121.53,121.49,122.68,122.64,123.64,123.39,123.26,122.8,122.79,123.15,123.82,124.22,124.41,124.35,123.85,124.96,125.63,125.22,125.12,125.37,125.31,125.31,125.18,125.28,125.51,124.86,125.89,126.7,127.21,128.1,128.32,128.48,128.34,129.24,130.12,130.12,129.66,130.88,130.67,131.24,132.3,132.59,132.51,132.59,134.16,133.26,131.81,131.87,131.79,128.99,123.7,125.86,125.23,120.53,122.33,124.03,124.36,126.03,127.55,127.59,127.59,126.85,126.15,126.27,128.3,129.81,128.16,126.74,125.05,125.68,127.07,127.4,127.34,127.91,130.13,129.97,129.14,128.4,128.3,128.52,126.69,126.88,126.65,123.46,120.87,124.15,122.01,121.65,123.33,123.33,120.57,122.09,123.51,124.35,121.63,122.03,124.08,123.39,124.41,124.05,125.05,126.39,126.49,125.77,124.69,124.7,123.03,123.26,124.55,124.68,123.66,123.98,123.09,122.81,124.38,124.81,124.78,125.99,127.17,127.38,127.5,126.62,127.14,127.03,126.69,127.63,127.23,127.64,127.39,127.09,127.09,125.62,127.21,126.34,127.71,128.28,128.37,129.47,129.38,129.78,129.92,130.15,129.62,129.94,129.81,129.53,129.01,129.23,128.41,128.65,126.89,127.17,126.07,126.85,126.95,127.34,126.71,126.71,127.8,128.88,130.02,130.47,129.55,130.68,130.82,130.69,131.21,131.49,130.97,130.84,131.09,131.71,132.91,132.51,131.64,130.88,131.52,131.38,132.03,132.64,133.11,133.49,133.45,133.26,132.31,131.78,132.63,131.62,132.66,133.1,133.42,133.7,133.65,133.42,134.25,135.28,135.31,136.08,135.48,135.5,135.5,135.28,134.9,134.4,134.11,134.36,134.86,134.91,135.62,135.66,134.91,135.63,135.8,136.87,136.81,136.33,136.16,135.71,136.08,136.08,136.58,136.52,136.62,135.5,134.76,134.7,134.51,130.09,127.41,129.22,128.46,131.22,131.19,129.3,129.25,128.7,127.99,124.04,126.35,124.16,123.35,125.28,126.64,127.97,127.17,127.88,128.68,131.41,131.08,129.87,127.31,127.13,126.16,127.5,127.78,125.66,123.38,123.75,123.75,122.94,124.85,125.26,128.13,127.85,128.9,130.31,126.09,126.09,125.9,122.96,123.18,123.14,123.8,123.78,121.42,118.89,118.9,117.07,115.23,112.86,109.8,109.8,115.24,116.23,116.08,117.07,117.22,114.32,118.24,119.07,120.22,120.72,121.26,121.24,120.61,121.9,122.17,123.1,124.72,124.72,122.96,123.23,123.4,124.44,123.47,123.29,125.2,126.28,126.39,127.25,127.85,127.57,126.37,126.46,126.55,128.18,128.57,128.22,129.62,129.62,129.81,130.04,129.59,130.42,130.58,130.47,130.4,130.03,130.93,130.42,130.28,129.43,128.37,128.1,129.98,130.36,131.27,131.16,131.81,132.3,132.28,131.89,133.32,130.79,130.68,131.62,131.01,131.48,132.37,133.9,133.9,134.19,134.47,135.09,135.23,134.41,134.88,134.88,135.78,135.69,135.76,135.45,135.66,135.66,135.8,137,136.7,136.65,137.29,137.44,137.57,136.54,136.25,137.56,136.95,134.68,134.47,134.06,134.56,131.31,132.37,133.14,134.32,133.54,132.64,133.76,133.39,131.8,131.98,131.98,130.87,129.97,130.24,128.52,128.17,130.91,131.98,132.79,134.18,134.81,134.76,134.49,135.04,134.82,134.95,136.26,136.66,137.96,137.79,137.55,136.24,136.07,136.59,137.38,138.43,138.84,139.9,139.9,139.65,138.98,139.15,139.78,140.09,140.74,140.77,140.29,139.37,139.87,139.01,139.4,140.35,141.01,140.27,141.31,141.08,140.71,139.18,137.93,136.93,132.85,134.58,134.68,137.21,136.3,134.62,136.66,132.66,132.98,134.9,136.53,135.45,136.57,136.5,132.96,134.42,133.99,134.87,136.58,136.66,136.66,135.72,137.19,138.98,139.1,139.09,139.14,140.14,140.55,140.44,140,140.37,140.41,140.42,139.73,139.72,138.54,139.39,139.05,138.31,139.01,137.31,134.85,135.93,137.86,137.24,135.11,136.34,137.21,138.71,138.52,139.9,139.62,140,139.45,140.41,139.91,140.31,140.58,141.15,141.94,141.82,142.28,141.85,143.22,143.75,143.58,143.68,144.08,144.45,144.16,144.39,144.49,144.61,145.72,145.8,145.71,145.16,144.93,145.25,146.34,146.66,147.27,147.27,146.68,145.42,144.45,145.37,145.58,146.91,146.45,146.29,146.71,147.97,147.98,149.04,149.09,149.03,149.69,150.43,150.56,150.53,150.53,151.3,151.31,150.43,150.88,152.14,151.07,151.6,151.18,151.92,152.93,152.49,153.55,153.32,153.61,154.89,155.49,155.49,155.08,155.12,155.3,153.9,151.48,153,152.87,153.35,150.63,151.72,154,155.73,156.25,155.4,156.54,156.81,157.82,157.56,157.85,157.85,157.39,158.13,157.53,155.87,150.65,146.09,145.53,139.11,137.96,144.31,140.26,146.18,141.22,138.81,128.26,134.6,128.02,115.85,126.6,111.43,118.11,111.99,112.52,107.64,104.49,114.29,115.61,122.82,118.69,122.66,120.7,115.37,118.01,116.22,124.39,124.19,128.42,130.28,130.28,128.97,132.91,129.98,130.74,134.24,131.84,127.8,130.73,130.66,132.47,134.42,133.72,137.27,136.01,132.19,132.76,133.96,133.02,134.55,136.82,136.84,134.03,131.69,133.21,133.73,137.95,136.5,138.77,137.69,138.02,138.02,139.71,141.79,141.49,142.17,142.7,143.87,145.84,145.35,149.16,150.95,149.77,148.98,140.2,142.03,143.21,145.92,145.4,145.49,144.66,145.6,146.23,142.45,144.01,140.52,142.59,144.78,145.51,146.17,146.17,148.49,146.89,148.04,147.2,148.74,147.35,149.32,150.68,150.17,150.59,151.86,152.12,152.99,151.1,150.17,151.28,150.3,152.17,151.6,152.76,153.86,154.41,155.41,156.4,156.5,156.93,155.68,157.86,157.54,157.51,157.94,158.3,157.6,158.1,158.65,160.24,160.82,162.46,162.73,163.82,163.46,164.69,167.22,161.35,160.04,160.04,155.6,158.73,155.94,156.02,158.01,158.84,158.1,156.77,155.02,153.22,154.84,151.16,151.61,154.04,156.52,155.77,157.05,157.88,156.37,159.18,156.96,159.69,160.97,162.38,165.05,164.01,162.92,162.67,162.69,160.04,160.79,160.44,161.28,161.83,158.82,158.34,152.76,154.58,152.71,154.59,157.34,160.81,163.94,163.89,165.81,165.58,166.84,165.18,167.43,169.38,168.56,166.61,167.27,166.14,167.07,169.77,169.5,169.5,169.91,169.13,171.04,171.34,171.23,172.75,172.41,172.89,171.52,171.3,171.08,170.34,172.54,172.84,173.84,173.23,172.55,172.19,172.32,172.93,172.93,174.44,174.05,174.29,175.41,172.82,174.04,175.04,177.64,178.61,177.44,177.51,177.92,177.25,175.98,175.98,177.41,179.88,179.94,179.4,180.04,179.78,175.16,176.87,173.45,176.24,178.69,178.87,180.81,181.51,182.86,182.65,182.59,182.89,183.76,183.76,183.65,183.59,182.78,182.44,181.03,181.26,183.32,178.83,177.98,182.21,180.74,178.38,175.99,179.42,178.46,180.98,182.07,183.97,184.15,185.35,185.06,185.59,182.85,182.74,184.02,182.62,181.62,182.57,185.61,185.45,184.86,185.53,187.73,187.73,190.44,190.25,190.53,191.34,192.81,192.78,193.41,192.62,194.76,195.46,194.42,193.1,194.9,193.1,195.21,195.56,195.52,195.35,196.67,195.26,195.8,194.49,194.63,196.21,197.66,195.6,193.9,189.74,192.05,194.92,194.42,192.77,192.2,194.23,194.08,196,195.58,195.95,196.18,196.33,196.33,196.23,196.52,195.8,197.53,197.38,197.41,197.05,197.97,198.35,198.71,198.31,197.25,197.16,194.57,197.3,198.31,198.09,199.24,199.91,200.37,200.43,200.69,201.74,203.25,203.25,202.84,203.52,201.78,204.06,204.76,204.04,204.28,203.61,202.08,198.87,201.89,203.55,203.96,206.03,206.52,205.55,205.51,206.37,205.26,204.88,206.56,205.6,206.84,207.18,206.99,207.2,207.46,208.32,208.65,209.2,207.72,205.49,205.75,207.42,209.19,209.51,209.97,208.75,210.59,211.49,211.21,211.27,211.87,211.8,211.8,211.08,210.81,209.83,208.21,208.69,207.49,209.25,208.92,207.02,203.5,203.34,205.28,207.77,208.07,207.49,203.27,203.59,201.16,203.47,200.83,202.94,203.78,205.47,205.07,203.67,203.17,203.79,207.27,208.81,209.52,211.07,211.84,212.47,212.25,213.25,213.64,212.56,214.65,215.07,215.46,216.25,217.65,218.56,219.37,219.57,218.8,217,217.12,218.69,218.69,219.53,218.96,219.7,219.39,218.69,219.05,219.56,219.56,214.57,217.4,213.28,210.76,213.75,211.94,214.43,218.87,219.55,217.97,220.05,218.04,216.41,219.95,218.03,215.78,213.33,217.12,219.33,220.69,220.69,223.75,223.52,223.83,223.17,222.58,224,223.86,219.52,219.3,218.42,218.1,220.1,220.72,217.58,217.75,217.75,213.75,211.68,209.34,205.38,205.95,203.45,203.14,202.05,206.97,210.87,212.32,214.32,209.1,210.17,209.4,211.15,214.22,210.34,206.35,205.56,208.8,208.98,204.56,203.09,203.09,201.03,197.33,200.28,204.76,204.26,201.1,204.85,203.77,202.16,196.19,194.77,199.78,198.92,196.34,194.88,199.06,203.51,206.02,208.43,208.34,210.69,208.11,211.09,212.16,213.68,216.29,214.93,211.57,212.29,214.01,211.32,209.27,210.16,209.6,206.06,205.36,207.65,205.13,205.13,205.09,208.38,208.26,205.18,199.49,200.63,194.98,195.39,200.23,192.96,194.06,194.99,200.82,193.66,192.56,186.39,186.85,183.77,183.53,187.91,187.17,190.95,183.23,182.17,182.19,185.57,184.07,185.81,189.5,194.19,194.19,192.97,191.53,195.06,191.87,192.47,194.3,192.21,187.63,182.17,175.11,174.45,176.99,171.24,171.61,171.61,175.81,175.59,177.26,182.68,182.13,178.47,178.34,176.78,178.64,178.64,178.92,179.56,182.25,182.1,180,178.34,177.54,177.01,180.41,178.9,183.84,184.93,186.75,185.01,185.25,183.11,187.9,190.18,192.88,192.34,191.06,194.05,193.89,193.58,193.34,192.52,196.62,196.48,199.88,200.68,201.05,199.6,200.05,197.47,193.24,192.81,193.37,196.1,189.49,188.23,186.15,184.7,185.25,183.26,183.26,182.51,185.86,187.09,189.94,191.96,183.66,184.28,182.19,180.88,182.12,180.07,176.99,175.5,172.47,170.69,170.33,173.68,170.01,167.45,171.78,177.04,176.68,174.87,169.97,168.7,167.6,167.05,171.38,167.33,171.76,173.72,172.56,171.19,175.25,177.33,180.22,178.89,177.8,182.18,180.82,180.08,175.58,173.72,176.08,177.78,178.77,175.06,184.76,186.47,184.8,186.41,184.87,184.3,185.18,184.46,186.97,188.07,188.07,188.02,185.11,184.82,190.54,190.37,190.15,186.74,184.06,183.71,185.09,183.73,186.36,187.72,186.58,181.93,179.9,178.28,178.47,181.12,178.5,179.55,179.55,178.82,176.68,179.76,179.3,179.3,178.59,179.93,177.84,181.9,181.76,183.03,185.38,186.01,186.76,186.76,186.38,183.48,182.08,185.52,187.72,187.59,187.56,189.62,190.09,187.63,190.38,192.37,195.19,193.17,191.99,194.46,192.3,190.6,191.02,193.21,193.16,193.69,191.02,190.49,190.49,186.67,186.38,187.37,185.4,185.97,185.4,184.53,185.93,188.93,189.06,186.16,186.43,182.98,180.34,180.06,183.03,181.75,184.94,182.91,184.54,186.93,183.86,184.4,185.44,185.75,185.46,188.1,189.17,191.9,192.61,191.5,191.02,191.7,191.7,191.89,191.89,191.09,193.63,193.23,193.87,194.03,194.01,192.86,193.03,193.2,190.14,189.41,193.12,194.71,194.64,192.38,191.04,189.66,193.16,193.25,192.36,193.23,192.9,192.59,193.16,191.93,194.21,196.05,195.76,195.79,193.6,192.18,193.86,196.39,196.39,196.4,195.2,197.12,199.99,199.58,200.05,199.29,200.53,200.76,202.63,204.03,204.2,206.69,205.93,205.93,204.95,203.88,204.63,203.07,202.15,204.47,204.4,205.31,207.83,208.07,208.07,207.67,206.02,205.43,205.92,207.31,208.85,210.62,210.4,211.21,212.72,213.22,211.78,211.85,212.7,213.3,213.27,211.9,213.99,214.3,213.73,210.77,210.24,209.12,211.01,210.12,208.64,208.69,208.47,209.67,207.25,205.68,204.09,204.06,205.47,204.9,207.16,204.37,205.75,207.03,210.04,210.84,210.51,210.89,210.89,210,208.54,207.87,208.16,209.56,208.37,208.63,210.39,207.83,207.98,207.53,205.58,202.21,201.75,202.56,199.57,199.62,200.79,200.25,200.27,197.51,199.12,198.86,201.21,202.47,203.53,204.4,203.13,202.11,204.25,204.23,201.49,199.78,197.27,196.93,198.37,195.52,193.21,192.28,194.59,195.85,197.91,201.64,203.53,203.89,204.47,204.67,203.02,206.19,206.02,209.95,210.28,210.53,210.8,212.36,211.93,212.79,212.79,212.92,212.5,212.71,212.51,213.32,214.57,213.41,213.29,212.45,214.15,215.02,215.87,216.86,219.82,220.4,220.38,221.38,222.68,219.41,221.67,222.04,222.04,222.98,223.3,223.38,222.75,221.49,219.71,218.96,219.36,222.46,222.13,223.39,223.24,223.4,223.4,222.57,221.32,223.27,226.02,226.51,227.18,227.36,228.56,228.41,230.13,229.99,226.29,229.12,231.57,230.83,231.36,233.27,233.4,234.74,234.52,231.31,233.53,234.89,233.76,233.76,232.35,232.65,237.56,237.65,236.75,237.15,236.76,237.99,239.9,239.61,237.17,238.39,240.85,239.27,239.01,241.68,241.22,240.53,238.97,240.48,241.83,243.99,244.78,244.43,243.69,243.01,245.1,245.38,245.38,244.88,243.11,243.38,240.37,243.04,242.95,243.3,241,242.79,239.26,236.39,235.9,234.54,234.02,231.97,233.99,236.79,236.84,235.76,238.17,238.92,235.17,234.36,236.5,239.47,241.94,242.26,242.26,243.5,243.9,243.84,245.02,247.89,247.37,247.66,247.89,248.51,247.84,246.01,247.73,247.73,247.79,245.97,244.5,246.46,246.73,247.1,250.03,249.98,249.7,250.35,251.03,253.16,253.75,253.65,255.6,256.24,256.24,255.6,255.2,254.41,255.41,255.82,256.05,255,255.69,257.27,258.58,258.58,259.99,260.25,260.44,263.1,260.8,262.24,262.98,264.66,260.97,258.93,257.08,259.86,259.45,253.45,252.14,254.94,255.15,253.88,257.89,254.36,249.68,242.2,244.71,242.82,248.41,249.57,249.58,253.79,254.76,258.87,259.38,261.9,261.38,262.49,260.15,263.13,262.3,262.72,261.15,261.14,263.78,263.78,258.2,257.79,257.01,252.57,255.5,256.64,259.38,261.32,262.73,263.06,263.13,262.37,266.83,266.31,267.06,267.73,267.23,268.31,267.97,269.11,266.6,266.63,266.19,268.57,266,268.58,270.49,269.93,271.56,273.65,271.57,272.84,272.8,273.88,273.38,273.25,270.74,271.32,271.24,271.96,272.4,271.5,266.44,267.53,266.78,270.05,276.88,278.94,279.99,280.26,279.45,279.52,277.82,274.16,275.23,276.32,276.33,277.8,278.77,279.61,281.21,280.14,280.14,281.71,282.4,282.53,284.24,283.71,284.41,282.67,281.83,284.13,282.59,282.58,283.66,282.56,274.23,273.99,276.97,278.99,282.07,282.07,281.95,278.84,275.85,274.67,274.06,277.51,279.05,275.95,276.38,276.38,272.12,272.55,272.86,277.86,277.27,280.04,280.04,282.5,284.23,285.74,284.93,280.77,283.36,282.03,283.52,282.09,279.94,281.97,283.07,284.1,281.41,283.3,283.4,282.63,285.57,285.55,285.55,286.25,286.93,285.69,280.81,279.42,278.11,278.15,273.73,278.07,273.18,269.84,272.85,267.99,269.47,262.2,260.21,261.49,257.85,263.34,265.03,262.2,265.03,264.46,264.67,269.34,269.77,266.76,265.88,260.63,262.07,263.06,264.83,252.02,236.96,236.41,232.69,254.84,246.02,250.47,252.46,252.02,246.37,246.7,246.7,240.89,246.94,251.05,256.14,258.03,258.19,259.69,260.07,261.71,265.57,263.87,261.84,262.98,264.5,264.32,272.92,274.9,275.18,276.32,278.25,278.5,277.42,272.94,272.82,270.99,270.99,276.53,274.99,276.1,276.07,277.21,278.81,278.84,277.36,280.22,280.47,282.01,281.24,282.31,279.12,281.74,279.39,279.31,279.31,278.7,281.37,284.5,284.5,286.78,288.28,289.77,289.45,290.82,293.24,293.24,290.94,290.73,292.49,293.3,292.33,292.74,291.58,292.51,294.08,294.06,294.47,294.66,296.96,297.17,298.35,298.4,297.52,297.15,296.05,291.31,295.61,294.17,296.31,296.08,298.39,297.64,301.02,301.99,302.08,301.2,301.17,299.41,298.68,297.49,302,300.71,301.96,302.68,303.64,301.69,301.69,299.6,301.13,303.65,302.68,303.32,304.14,305.04,307.63,307.48,308.93,308.53,308.23,309.71,311.22,312.6,310.88,309.99,308.44,310.26,311.08,312.35,313.41,313.61,313.63,314.77,313.57,315.4,314.53,306,310.77,310.29,311.54,309.58,311.21,314.53,314.54,312.86,314.68,317.17,321.07,321.8,321.79,318.6,319.44,319.99,316.23,317.38,313.84,314.23,319.07,319.73,319.94,314.64,314.48,311.6,309.03,310.19,305.36,308.36,313.13,315.96,318.15,318.15,319.85,318.15,318.93,319.88,320.23,320.85,319.73,319.45,321.61,322.27,318.84,318.33,317.57,313.89,316.38,319.17,321.22,322.69,323.72,323.72,323.63,322.5,322.05,319.68,320.29,322.32,324.32,323.21,323.23,325.32,325.84,325.2,323.47,324.3,324.1,324.1,317.41,321.09,322.85,322.96,324.57,325.9,325.87,325.45,324.05,325.8,323.06,321.42,317.48,323.74,325.26,324.18,324.16,319.09,319.25,319.25,319.58,321.36,320.45,322.67,319.32,321.76,324.38,322.64,321.24,321.37,318.33,320.8,318.99,314.76,317.37,316.69,316.43,311.61,309.72,312.86,313.64,309.37,308.52,303.85,307.33,306.18,307.84,302.48,297.42,296.25,304.88,307.07,307.41,307.41,308.77,309.01,316.76,318.71,318.35,321.59,325.37,327.97,328.83,332.79,331.99,329.89,333.34,331.96,334.61,335.02,333.38,333.25,336.66,337.64,336.27,339,343.95,342.64,345.53,346.18,345.62,347.64,350.31,345.97,345.72,343.41,347.12,347.71,349.01,349.01,351.14,351.2,353.22,353.99,354.92,355.37,352.75,354.19,344.82,345.85,344.95,339.37,345.31,347.05,352.78,350.78,346.52,350.28,350.28,348.98,343.96,343.63,343.59,343.43,347.47,350.22,349.46,349.47,349.47,352,350.43,349.44,352.29,353.77,350.96,352.28,353.63,351.83,348.27,347.6,350.68,350.2,345.97,346.14,346.19,346.92,341.66,347.34,349.77,354.94,361.29,360.69,360.05,362.28,362.07,360.9,361.85,364.21,363.59,361.69,359.2,359.96,356.84,358.39,357.39,358.53,358.45,361.04,360.14,358.94,356.39,358.03,361.82,360.46,360.46,358.35,356.62,354.53,357.58,355.85,354.25,352.67,356.68,357.28,362.61,362.61,359.87,359.78,361.62,358.83,358.23,357.32,358.02,360.65,363.04,365.14,364.34,362.64,364.8,364.6,364.51,360.47,361.65,357.69,359.15,359.15],"SK하이닉스":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,102.25,100.25,102.5,107.12,107.37,105.99,102.37,104.87,102.37,102.75,102.87,103.62,103.62,99,102.37,99.5,99.13,99.13,102,104.62,104.87,101.75,106.62,107.49,106.49,106.37,106.37,105.87,107.12,110.36,110.86,110.86,112.86,112.98,115.48,113.61,113.11,112.23,114.48,113.86,115.86,112.73,112.73,112.36,113.61,115.61,113.98,113.98,113.23,111.61,111.61,114.36,117.98,116.1,117.23,119.85,123.72,124.22,128.84,126.34,125.59,123.1,123.1,121.97,123.85,122.72,126.84,128.84,129.09,133.08,133.08,133.08,134.08,134.83,131.84,134.08,134.08,133.08,136.33,131.59,124.84,126.59,120.97,119.6,123.85,125.84,124.59,127.09,126.34,125.34,118.6,114.86,116.6,116.6,119.1,117.6,123.22,121.85,119.85,119.85,122.85,127.34,125.59,121.85,122.72,116.73,118.85,118.73,121.47,120.97,123.6,126.59,126.84,128.09,127.09,126.09,129.34,127.34,125.59,123.35,124.34,122.35,121.97,122.35,124.22,124.34,122.85,125.34,124.47,128.34,129.84,130.84,130.84,134.08,133.83,134.83,134.83,138.33,138.33,139.58,139.58,142.07,142.07,138.83,140.82,138.08,138.83,138.08,136.58,139.08,135.33,139.83,137.58,139.33,139.33,142.57,144.57,143.32,142.32,140.82,142.57,140.07,140.07,141.07,141.57,145.57,143.57,146.82,148.06,151.31,151.06,156.8,159.8,161.8,162.3,162.3,168.54,172.78,167.79,171.04,168.29,165.54,164.29,169.79,170.04,166.29,168.04,172.28,172.03,176.28,177.53,177.78,176.78,177.28,178.03,177.78,182.27,175.78,166.79,170.79,161.3,164.79,163.55,169.79,163.55,159.8,160.05,165.54,160.3,160.8,153.31,162.55,162.55,165.04,165.79,167.29,167.79,170.29,169.79,170.04,170.79,169.54,168.79,171.04,171.29,171.54,170.04,174.53,179.03,178.28,181.27,184.27,186.52,189.01,191.76,192.76,199,197.75,201.5,207.49,207.49,215.48,215.48,205.74,207.74,206.99,206.99,206.99,206.99,206.99,206.99,206.99,221.47,222.47,220.97,214.98,210.24,208.49,202,197.25,202.75,211.49,204.24,204,196.5,195.76,199.25,205.24,212.98,208.24,210.74,208.49,205.74,207.74,205.74,204.74,205.49,208.24,204.74,205.99,207.24,204.99,212.23,216.73,211.49,212.48,207.49,206.24,205.74,191.76,193.26,197.5,194.51,193.51,189.76,196.5,196.5,194.26,191.76,189.76,189.01,192.76,200.25,200.25,192.26,191.51,191.51,184.77,187.52,191.01,191.01,191.26,194.01,192.51,198,195.26,192.01,182.02,181.27,185.77,181.52,185.77,185.02,187.77,183.02,177.53,178.03,180.77,189.26,188.51,188.01,182.52,183.52,185.77,180.27,175.28,175.28,177.53,184.52,183.27,186.02,194.01,193.76,193.76,193.76,191.01,188.51,192.01,189.51,193.01,193.51,196.5,191.76,191.76,193.26,195.51,205.74,206.49,208.49,207.99,211.99,224.72,226.47,223.72,224.22,224.47,223.72,220.72,221.22,207.49,209.74,203.25,200.5,200.5,203,203,204.24,200.75,206.99,200.5,201.25,200.75,202.75,209.74,210.24,209.74,206.74,211.24,219.48,210.74,210.74,204.99,205.74,215.98,217.48,210.99,210.99,207.49,206.99,207.24,207.24,208.49,208.24,214.23,214.98,213.23,211.24,217.23,216.48,219.48,222.47,222.47,237.95,236.2,237.7,235.96,236.7,237.2,233.21,228.21,224.22,227.22,227.22,226.97,220.72,222.72,220.72,220.72,215.48,217.23,209.74,209.99,219.23,220.97,223.47,211.74,210.49,212.73,208.49,213.98,208.99,214.98,212.23,215.23,212.98,218.73,217.98,216.73,213.73,221.72,222.97,221.22,222.97,225.47,219.48,204,208.74,201,207.49,214.98,214.48,215.48,213.73,207.74,207.99,198.25,201.5,199.25,194.76,187.52,188.26,189.51,189.51,186.52,186.02,186.52,195.76,199.25,202.5,204.24,208.49,205.74,206.74,206.49,207.24,201.25,202.75,199.75,196.75,189.51,191.01,191.26,187.52,186.02,194.01,192.76,194.76,196.75,197.5,191.51,191.51,191.51,191.51,187.27,182.52,184.02,179.03,179.03,174.78,175.53,177.78,177.78,175.53,172.28,180.77,175.53,174.03,175.78,171.54,176.78,174.78,172.53,166.54,161.55,167.29,166.79,170.29,170.29,170.54,181.27,176.03,175.03,176.78,182.02,182.02,186.02,179.53,175.78,179.28,175.03,174.28,168.54,170.04,173.03,173.03,177.03,176.78,179.53,178.53,173.78,176.03,172.28,170.29,164.79,166.79,163.55,162.05,165.29,163.55,154.31,155.31,152.56,150.56,146.32,149.81,150.81,150.81,150.06,153.81,151.06,151.06,151.31,144.07,145.57,146.57,147.82,158.8,163.05,162.55,155.06,159.8,161.8,162.05,161.3,167.29,166.29,166.79,176.03,186.27,179.28,183.27,189.51,184.52,189.51,189.51,189.51,189.51,191.51,183.52,185.02,189.51,190.26,193.26,184.27,186.52,184.02,189.01,191.51,191.51,188.26,187.77,184.02,174.78,174.78,175.03,174.03,170.04,170.04,166.54,166.29,169.04,166.79,168.04,170.04,169.29,169.79,176.03,189.51,190.01,182.02,181.52,183.27,180.52,185.27,191.26,190.76,199.5,195.76,197.25,194.51,194.26,196.25,195.76,195.01,199,200.75,200.25,197.75,204.24,201,202.25,196,200.25,196.25,199.75,197.25,197.25,201.5,200.75,200.75,199.5,200.5,189.76,185.77,183.52,186.27,186.02,179.53,178.78,177.03,175.53,172.03,169.79,168.79,167.04,164.54,165.04,164.54,163.05,166.29,162.55,162.55,162.55,163.3,166.79,167.79,164.04,158.55,157.55,159.05,158.3,167.79,168.04,164.54,167.04,166.54,172.03,175.28,173.53,174.78,178.28,172.53,175.28,170.79,168.29,174.28,182.02,188.51,186.52,190.26,190.01,186.27,186.52,191.76,195.76,196.75,193.76,197.75,199.25,192.26,197,192.01,194.01,190.01,188.26,179.78,183.02,180.52,183.02,186.02,186.02,192.01,192.01,190.76,187.52,190.76,189.26,184.27,185.77,179.28,182.27,183.02,183.02,193.26,193.76,192.26,199.75,207.24,204.49,210.49,207.49,206.24,206.24,206.24,198.5,198.25,200.25,206.49,205.24,206.74,208.24,204.49,207.99,203.25,205.24,204.74,198.5,198.5,200.5,200.5,202,202,197.25,199.75,201,202.75,205.74,202.25,193.26,193.51,197.5,194.01,199.75,206.99,206.99,207.24,203.5,204.74,207.49,211.49,212.48,208.49,208.74,205.49,203,207.74,208.24,208.24,212.73,213.48,212.98,206.49,202,204,204,205.49,206.49,206.74,202,201,196.5,194.01,196.75,201.25,201.5,201.5,201.25,208.24,219.48,221.22,231.71,232.21,233.71,237.2,236.2,234.21,234.21,236.7,239.7,234.96,234.96,236.45,235.96,235.46,234.71,243.2,247.19,246.94,250.94,250.94,245.19,247.69,247.19,249.44,247.94,252.18,246.44,246.44,246.44,240.45,244.44,234.71,233.46,236.45,242.45,243.95,250.94,247.94,246.69,249.19,249.69,254.68,260.92,262.17,254.68,258.43,259.68,257.18,248.44,244.69,236.2,231.71,219.48,229.96,231.71,235.46,236.95,231.21,231.21,222.47,213.48,206.74,205.99,201.25,200.75,182.52,172.28,186.77,173.28,196.5,210.99,201.5,207.99,208.99,207.99,195.76,199.75,198.75,207.49,214.23,210.99,212.23,209.99,203.25,205.49,205.49,203,209.99,204.74,203,209.49,206.24,203.25,206.24,208.24,208.99,208.99,208.99,202.25,202.25,205.74,205.74,212.23,210.99,213.98,208.74,201.25,204.49,202.5,206.49,209.99,208.24,203,203.25,204.49,203.25,209.49,203.5,208.74,207.99,221.47,218.98,225.72,227.22,224.22,226.72,220.97,212.73,204.74,213.23,216.73,215.23,213.23,211.99,209.99,214.73,210.49,211.24,208.74,212.48,212.98,210.74,213.23,214.73,211.74,208.99,207.24,206.74,207.24,206.99,207.24,206.49,206.99,205.24,209.99,207.74,205.74,208.99,206.74,207.49,207.74,212.98,206.74,204.24,203.75,201.5,202.5,201.25,203.25,203,202.25,201.5,200.25,200.25,195.01,187.27,179.28,186.02,188.51,192.26,196.75,197.5,194.26,187.52,187.77,188.51,196.5,196.5,195.76,198.25,193.01,191.26,195.76,199.75,204.49,203.5,205.24,208.99,210.99,203,208.74,210.49,206.99,205.99,209.74,209.74,209.74,209.74,207.74,207.24,208.24,206.99,206.99,213.48,220.22,215.98,217.48,212.98,216.48,212.73,209.24,207.99,209.49,207.74,206.24,206.99,204,199.5,198.75,203.25,207.74,214.98,215.48,214.73,215.98,217.23,219.98,223.97,244.69,244.94,244.69,245.19,241.7,249.69,246.19,242.7,248.19,246.69,243.45,250.94,272.16,278.4,287.14,294.63,287.14,300.87,290.89,288.39,292.13,293.38,293.38,298.38,295.88,289.64,280.9,289.64,294.63,294.63,288.39,289.64,295.88,295.88,314.61,325.84,327.09,335.83,344.57,332.08,322.1,332.08,325.84,318.35,324.59,325.84,325.84,328.34,320.85,337.08,322.1,320.85,307.12,305.87,312.11,324.59,324.59,312.11,318.35,312.11,313.36,314.61,314.61,314.61,329.59,330.84,324.59,314.61,332.08,340.82,345.82,339.58,370.79,353.31,353.31,360.8,367.04,354.56,349.56,338.33,340.82,332.08,342.07,349.56,340.82,350.81,349.56,354.56,344.57,344.57,337.08,333.33,332.08,337.08,329.59,335.83,330.84,350.81,352.06,357.05,357.05,358.3,359.55,349.56,343.32,348.31,342.07,343.32,343.32,344.57,345.82,330.84,332.08,330.84,328.34,337.08,324.59,324.59,319.6,328.34,329.59,329.59,322.1,323.35,324.59,307.12,298.38,293.38,295.88,293.38,302.12,302.12,305.87,305.87,298.38,307.12,307.12,313.36,312.11,317.1,320.85,314.61,322.1,320.85,320.85,318.35,305.87,307.12,319.6,317.1,320.85,323.35,315.86,310.86,304.62,304.62,309.61,314.61,320.85,314.61,312.11,318.35,310.86,305.87,307.12,312.11,308.36,303.37,298.38,299.63,307.12,308.36,308.36,303.37,297.13,295.88,292.13,298.38,295.88,292.13,289.64,284.64,284.64,280.9,289.64,299.63,302.12,299.63,294.63,289.64,280.9,263.42,250.94,253.43,253.43,253.43,259.68,255.93,255.93,257.18,262.17,258.43,259.68,258.43,258.43,265.92,269.66,265.92,267.17,264.67,260.92,264.67,257.18,262.17,265.92,268.41,268.41,259.68,267.17,267.17,267.17,267.17,263.42,259.68,260.92,258.43,249.69,257.18,249.69,249.69,244.44,240.95,238.95,234.71,234.71,228.46,229.71,234.21,245.69,242.45,243.95,244.44,240.45,245.94,249.69,254.68,253.43,265.92,257.18,265.92,268.41,263.42,264.67,267.17,268.41,272.16,270.91,268.41,265.92,277.15,279.65,275.91,274.66,278.4,298.38,297.13,298.38,293.38,288.39,289.64,284.64,290.89,299.63,294.63,295.88,303.37,299.63,308.36,300.87,303.37,302.12,308.36,309.61,304.62,300.87,310.86,317.1,318.35,319.6,314.61,318.35,317.1,327.09,327.09,327.09,320.85,313.36,312.11,317.1,310.86,319.6,320.85,323.35,320.85,317.1,315.86,317.1,312.11,297.13,297.13,294.63,294.63,283.4,300.87,300.87,300.87,300.87,309.61,310.86,307.12,307.12,307.12,323.35,329.59,330.84,317.1,325.84,332.08,328.34,328.34,328.34,328.34,305.87,307.12,307.12,307.12,312.11,322.1,322.1,298.38,294.63,294.63,294.63,294.63,289.64,289.64,289.64,289.64,309.61,309.61,308.36,308.36,300.87,294.63,294.63,299.63,302.12,294.63,289.64,292.13,290.89,282.15,283.4,279.65,278.4,277.15,282.15,274.66,269.66,272.16,280.9,280.9,282.15,275.91,269.66,277.15,270.91,273.41,280.9,275.91,274.66,273.41,273.41,268.41,268.41,274.66,275.91,272.16,280.9,275.91,280.9,283.4,277.15,280.9,282.15,270.91,269.66,257.18,264.67,267.17,269.66,269.66,267.17,267.17,267.17,259.68,264.67,263.42,258.43,247.19,247.44,244.44,243.2,240.7,235.96,237.7,230.21,225.22,228.71,237.2,237.95,234.71,227.22,218.48,222.47,230.96,229.96,234.46,236.7,233.96,232.96,234.71,234.71,246.44,252.18,249.69,254.68,255.93,249.69,249.69,250.94,249.69,248.19,244.44,242.45,240.95,243.45,243.45,245.94,240.45,237.45,229.21,232.96,232.96,232.96,241.45,242.45,238.95,240.7,237.7,233.71,232.71,234.96,237.45,230.96,232.71,237.7,230.71,228.96,227.47,229.21,225.72,225.72,225.72,225.72,236.7,232.21,229.71,227.72,224.72,219.73,219.73,214.73,208.49,205.99,204.74,202.75,201.75,207.49,207.49,215.23,224.22,224.47,227.72,227.72,225.22,234.71,236.95,238.45,237.7,239.2,231.96,225.22,225.97,229.21,233.46,234.46,224.72,208.24,206.49,209.49,210.99,206.49,210.99,215.98,218.98,222.72,222.47,233.46,226.97,228.71,228.46,218.98,220.72,215.48,212.73,212.73,216.98,212.48,207.49,208.99,212.23,211.49,204.49,202.25,202.25,197,196.75,203.5,202.5,205.49,204.24,200.25,195.76,197.25,195.51,194.76,197.75,194.26,192.26,192.26,189.76,187.27,187.27,189.01,188.76,202.25,203.25,207.49,214.73,215.98,217.98,216.73,213.98,214.23,214.73,212.48,213.48,218.73,218.73,218.73,228.21,228.21,228.46,226.47,220.97,228.21,228.21,230.21,222.47,226.72,236.95,236.95,233.46,226.22,233.21,228.96,231.96,229.71,230.96,227.72,222.47,231.46,227.22,224.72,223.22,223.22,219.98,217.98,223.97,221.97,216.73,213.73,207.99,210.49,202.5,197.5,197.25,209.74,208.99,208.74,216.98,220.97,217.98,213.48,220.72,216.98,221.72,221.22,217.73,210.99,211.24,209.24,222.47,226.47,229.21,225.47,221.47,222.97,220.97,218.73,220.22,218.98,222.47,217.73,213.48,218.23,221.72,223.47,223.47,225.22,224.22,221.47,221.47,221.47,217.98,216.98,215.48,217.73,215.73,225.72,229.46,233.71,242.95,245.19,244.44,243.95,258.43,272.66,272.66,275.41,271.16,275.41,275.41,271.41,271.41,269.66,273.91,288.14,286.64,298.38,296.63,297.13,296.88,286.64,289.89,287.39,284.64,283.65,283.4,282.15,285.39,290.14,287.64,293.63,294.38,291.39,284.14,279.15,275.41,283.15,288.14,284.89,294.63,292.63,294.13,293.38,291.89,287.39,284.64,283.15,282.15,309.61,319.6,308.11,312.36,298.38,299.63,299.88,304.37,296.13,295.88,295.88,287.89,286.89,286.89,289.14,286.64,292.63,290.64,290.89,289.64,301.87,290.89,289.39,296.13,298.13,304.12,299.63,297.63,298.13,295.13,295.88,283.9,289.39,291.39,295.88,305.12,305.62,297.13,297.63,294.63,290.89,292.88,292.13,287.14,286.39,286.39,286.39,286.39,286.39,288.14,300.12,300.62,300.62,298.38,297.63,310.11,311.36,309.86,324.59,324.59,313.86,315.11,309.61,316.6,318.35,299.63,297.38,297.38,290.39,300.37,312.86,314.11,332.08,325.59,318.6,319.6,325.84,329.09,324.59,334.83,330.34,324.34,328.09,329.59,327.84,324.84,319.6,326.34,328.09,325.59,334.33,331.09,327.34,314.36,313.61,313.61,318.35,321.85,327.09,327.59,341.32,349.56,349.56,345.07,350.81,350.81,351.06,351.06,351.81,350.56,353.31,353.31,355.56,341.57,340.57,343.32,339.58,343.07,333.33,339.58,334.83,334.83,329.84,327.09,340.07,352.81,356.05,351.56,353.31,343.07,339.58,337.08,341.82,336.33,331.34,336.83,330.34,344.57,344.57,356.55,356.55,356.55,374.53,371.29,371.79,366.54,377.78,373.53,372.03,390.76,403,404,384.02,394.51,390.01,390.01,415.73,413.98,406.74,411.74,429.21,415.98,413.73,408.49,404.24,402.5,410.24,400,390.76,424.47,423.97,422.97,440.95,452.43,444.94,456.93,463.17,465.17,447.44,469.41,456.43,452.43,456.68,456.68,470.41,467.92,469.91,447.19,446.19,455.18,432.71,428.46,426.97,448.94,425.97,443.95,439.2,434.96,434.96,433.46,432.46,432.46,448.44,444.44,437.95,449.19,458.93,462.67,462.67,481.9,474.16,474.66,479.4,493.63,499.38,495.88,503.12,505.62,505.62,488.64,472.41,484.89,482.65,483.65,483.65,518.1,519.35,530.59,536.83,554.31,551.81,556.8,585.52,583.02,593.01,584.27,556.8,561.8,591.76,590.51,590.51,588.01,579.28,589.26,574.28,589.26,583.02,595.51,596.75,601.75,581.77,574.28,581.77,550.56,530.59,523.1,511.86,511.86,520.6,474.41,478.9,488.39,471.66,485.89,482.65,432.46,389.76,408.74,422.72,407.99,428.21,441.95,454.18,466.17,466.17,498.63,484.14,498.63,480.9,477.15,463.17,448.44,436.95,447.69,423.72,433.71,434.46,420.22,386.52,398,390.51,392.01,388.26,392.51,421.47,406.49,406.49,406.49,406.49,381.52,392.26,404.49,408.24,412.73,451.69,458.93,435.96,435.96,422.22,422.22,434.71,461.67,444.44,444.44,466.17,464.42,464.42,481.65,471.16,489.39,467.67,476.65,468.91,489.39,494.88,501.87,489.39,475.16,486.89,465.17,454.93,484.39,482.4,488.89,488.89,500.62,480.9,463.92,456.68,431.96,444.94,428.71,425.97,425.97,421.47,441.2,441.95,442.2,420.22,402.25,399.25,396.5,411.74,419.48,431.96,417.23,421.72,425.47,428.96,439.7,438.2,447.69,459.43,458.18,436.95,420.72,423.47,420.72,420.72,424.72,435.71,434.21,434.21,427.47,454.18,498.88,486.89,486.14,511.86,508.11,485.14,486.89,494.88,524.34,535.58,529.34,544.32,563.05,548.06,551.81,551.81,551.81,551.81,551.81,497.38,476.65,477.15,496.38,508.11,506.87,494.63,498.63,496.63,520.6,524.34,529.34,524.34,545.57,529.34,523.1,511.86,500.62,506.87,497.38,474.91,474.91,464.67,482.15,480.4,480.4,469.16,468.91,496.63,498.63,510.61,514.36,506.87,513.11,524.34,538.08,528.09,519.35,534.33,516.85,497.63,476.15,491.89,494.13,485.89,454.93,411.49,423.22,411.99,457.43,451.44,449.94,450.94,434.46,436.95,436.95,440.95,433.96,451.94,445.19,460.42,454.43,451.44,443.2,443.2,464.42,464.42,464.42,476.4,475.16,474.66,486.89,495.63,514.36,500.62,510.61,497.88,504.37,500.62,491.64,499.38,506.87,505.62,519.35,529.34,510.61,518.1,518.1,543.07,560.55,560.55,571.79,575.53,599.25,588.01,588.01,619.23,621.72,615.48,614.23,641.7,647.94,695.38,714.11,731.59,709.11,729.09,712.86,696.63,695.38,675.41,676.65,704.12,701.62,741.57,735.33,749.06,745.32,739.08,672.91,671.66,680.4,670.41,671.66,672.91,664.17,654.18,655.43,657.93,682.9,644.19,644.19,657.93,645.44,654.18,640.45,666.67,671.66,694.13,690.39,690.39,667.92,656.68,637.95,611.74,626.72,647.94,652.93,649.19,670.41,671.66,639.2,650.44,655.43,662.92,682.9,691.64,719.1,759.05,766.54,820.22,826.47,868.91,832.71,887.64,887.64,876.4,901.37,892.63,890.14,840.2,871.41,867.67,898.88,987.52,987.52,987.52,987.52,987.52,987.52,1068.66,1036.2,1027.47,1054.93,1129.84,1162.3,1212.23,1196,1202.25,1194.76,1273.41,1335.83,1300.87,1393.26,1418.23,1395.76,1548.06,1463.17,1445.69,1480.65,1448.19,1513.11,1545.57,1540.57,1528.09,1398.25,1513.11,1423.22,1403.25,1425.72,1300.87,1298.38,1295.88,1308.36,1358.3,1323.35,1343.32,1393.26,1378.28,1353.31,1358.3,1440.7,1413.23,1465.67,1410.74,1425.72,1383.27,1323.35,1375.78,1378.28,1365.79,1448.19,1458.18,1468.16,1468.16,1495.63,1598,1625.47,1625.47,1690.39,1737.83,1812.73,1852.68,1887.64,1857.68,1870.16,1842.7,1852.68,1870.16,1887.64,1907.62,1855.18,1847.69,1885.14,1915.11,1837.7,1997.5,2099.88,2149.81,2269.66,2072.41,2264.67,2247.19,2102.37,2094.88,2214.73,2187.27,2147.32,2217.23,2197.25,2197.25,2197.25,2197.25,2232.21,2369.54,2374.53,2509.36,2541.82,2744.07,2649.19,2649.19,2344.57,2119.85,2349.56,2307.12,2087.39,2342.07,2384.52,2322.1,2272.16,2431.96,2421.97,2636.7,2529.34,2514.36,2329.59,2461.92,2484.39,2329.59,2329.59,2179.78,2014.98,2239.7,2072.41,2187.27,2212.23,2287.14,2579.28,2491.89,2564.29,2596.75,2754.06,2836.45,2883.9,2816.48,2911.36,3056.18,3053.68,3058.68,3051.19,3225.97,3245.94,3228.46,3210.99,3210.99,3612.98,3612.98,3997.5,4129.84,4209.74,4694.13,4581.77,4933.83,4918.85,4541.82,4594.26,4357.05,4357.05,4843.95,4846.44,4846.44,5123.6,5600.5,5715.36,5825.22,5900.12,5892.63,5892.63,5737.83,5168.54,4771.54,5530.59,5113.61,5245.94,5368.29,5712.86,5947.57,6294.63,6704.12,6901.37,7288.39,6379.53,6544.32,7283.4,6674.16,6561.8,6616.73,6392.01,5460.67,6054.93,5850.19,5495.63,5183.52,5458.18,5443.2,4606.74,4776.53,5198.5,4599.25,4599.25,4404.49,4584.27,4569.29,4791.51,4392.01,4534.33,3870.16,3498.13,3300.87,4289.64,3912.61,3937.58,4164.79,3732.83,3550.56,3545.57,3558.05,3755.31,3977.53,4107.37,4107.37,4149.81,3745.32,4222.22,4319.6,4172.28,4189.76,4214.73,4319.6,4127.34,4179.78,4227.22,4027.47,3985.02,4112.36,4451.94,4476.9,4634.21,4626.72,4524.34,4237.2,4219.73,4392.01,4357.05,4636.7,4664.17,4594.26,4649.19,4649.19,4649.19,4414.48,4406.99,4434.46,4576.78,4596.75,4596.75,4426.97,4302.12,4197.25,4197.25,4007.49,3603,3543.07,3151.06,3176.03,3188.51,3031.21],"마이크론 테크놀로지":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,98.49,99.19,101.98,102.56,101.92,100,99.77,98.72,96.98,96.63,96.98,101.05,101.22,100,98.78,102.73,102.97,105.23,106.05,111.51,111.69,113.31,114.77,115.76,115.76,117.03,116.22,112.91,113.55,107.44,109.24,108.2,110.81,118.84,120.12,119.19,116.4,117.03,116.4,117.97,117.85,118.31,120.06,119.65,134.83,135.23,135.23,135.47,132.44,129.48,127.44,127.44,131.1,130,128.55,128.14,129.88,130.7,132.5,129.71,128.95,128.95,126.4,129.77,126.22,127.67,127.27,132.85,136.98,136.74,139.36,140.58,140.17,143.9,144.13,143.02,141.51,143.02,140.76,142.15,139.83,138.95,134.42,133.84,133.6,135.76,135.76,138.2,138.08,136.51,135.12,138.14,136.28,142.73,143.6,148.66,149.48,149.07,147.56,146.22,146.4,149.42,148.72,151.86,151.4,150,152.38,148.37,151.51,153.9,165.29,167.21,166.8,165.7,168.43,168.02,166.51,166.22,164.3,166.4,165.81,160.7,158.02,155.17,155.47,155.47,157.73,157.79,158.49,162.56,158.84,154.48,156.92,155.76,160.64,160.87,164.48,161.45,162.79,161.57,163.95,163.14,167.5,170.47,168.78,168.2,167.62,168.72,156.98,159.77,161.74,163.14,164.48,168.55,171.1,173.02,173.02,178.49,178.9,178.84,181.45,181.45,183.55,188.95,188.66,177.91,181.4,183.37,180.58,177.67,173.6,181.4,179.24,186.1,185.41,184.48,188.95,184.07,187.44,182.97,173.6,169.42,169.42,177.38,175,175.58,177.33,182.38,182.85,180.99,184.83,184.42,185.47,185,186.05,186.1,184.13,173.84,173.31,175.81,170.23,163.49,164.77,166.45,161.8,162.33,166.22,167.67,166.16,159.83,162.85,170,172.56,178.43,172.21,176.63,171.86,177.03,177.03,175.7,176.1,180.7,183.02,183.78,185.87,189.53,189.53,186.45,187.5,190.64,188.66,194.42,199.36,201.1,201.05,201.45,205.99,209.01,209.13,208.78,209.71,202.73,198.72,215.64,220.7,228.66,232.62,234.71,230,228.9,230.64,238.14,244.07,241.92,235.93,234.88,241.22,234.83,242.15,240.17,241.28,241.63,241.86,238.72,236.05,237.5,242.15,257.62,258.02,257.79,254.13,251.45,255.52,256.34,252.91,260.35,265.12,266.28,263.72,268.49,268.37,276.98,287.21,285.7,285.7,288.84,279.36,278.66,254.3,246.45,244.13,231.98,239.59,241.74,251.16,251.22,250.06,243.37,244.48,245.58,246.51,254.13,255.7,265.99,258.26,256.51,256.51,245.64,246.98,243.08,239.07,253.9,261.51,272.56,266.28,264.83,249.83,251.8,248.95,248.9,248.9,249.53,257.33,255.76,248.55,249.3,255.52,250.47,250.06,253.9,251.69,242.27,254.19,247.03,237.33,229.07,255.12,244.24,232.56,234.94,245.29,247.85,252.62,252.91,257.03,257.03,261.05,258.95,257.27,270.52,278.95,282.44,283.78,276.86,285.52,302.5,312.44,313.78,321.05,317.38,345.17,345.52,347.56,342.09,352.21,349.65,355.52,355.06,342.56,315.17,323.02,304.65,299.36,303.14,303.14,291.05,299.71,310.41,289.77,281.74,278.84,293.49,293.49,305.76,303.66,300.29,303.84,314.01,298.95,294.3,285,273.9,276.74,291.51,276.28,267.33,272.03,266.8,271.05,276.63,281.86,282.38,296.57,306.16,301.28,308.14,314.01,328.49,318.02,310.41,322.56,343.2,348.66,357.5,356.69,356.69,364.07,363.78,334.83,341.51,343.6,345.41,345.47,346.69,356.92,356.92,352.03,349.13,344.07,338.55,339.83,344.48,342.73,345.58,331.98,309.07,317.38,303.84,308.95,304.88,316.74,299.3,299.3,307.21,309.48,315.76,324.07,315,322.38,327.62,326.45,331.16,334.01,326.86,319.88,315.64,309.13,310.41,312.56,313.72,308.2,306.92,304.01,310.47,307.03,306.22,308.37,310.41,303.84,298.66,298.49,294.3,276.1,273.84,273.9,279.48,290.35,292.09,288.95,294.77,302.73,304.3,301.34,306.74,305.35,305.35,301.92,288.02,259.59,260.81,261.05,253.49,242.67,253.6,257.56,253.37,263.55,261.98,267.79,260.12,262.56,259.53,257.85,261.57,262.97,262.5,266.05,262.5,256.74,253.37,250.41,245.76,241.92,244.01,246.92,246.16,251.22,246.22,240.12,235.17,231.16,224.88,205.99,213.84,205.81,201.51,209.36,219.3,233.26,234.42,232.09,231.4,237.97,235.12,227.38,217.67,220.06,221.1,232.03,229.3,214.13,210,211.51,211.51,211.63,212.62,215.12,225.06,220.41,224.19,232.73,214.42,214.42,219.01,205.29,202.33,204.71,209.48,203.6,198.84,196.98,198.31,182.62,181.86,176.28,168.72,168.72,179.59,185.64,183.55,184.48,190.41,180.23,190.12,197.67,196.16,206.05,208.78,209.36,201.57,197.62,195.23,196.98,207.91,207.91,196.92,199.07,212.73,226.51,221.4,217.38,222.33,222.21,230.23,229.48,228.9,241.4,228.95,224.3,224.3,234.88,242.33,245.52,244.13,244.13,243.95,245.41,241.45,247.5,248.55,249.77,240.23,237.67,241.74,238.72,232.5,220.52,219.94,224.71,226.92,228.2,225.76,223.31,229.88,230.29,234.71,233.31,255.76,241.98,235.76,234.42,228.08,228.72,240.29,245.64,246.74,255.23,249.36,251.86,249.42,242.56,245.17,245.81,244.24,243.14,248.6,250.87,252.33,252.33,252.33,248.66,250.17,248.55,244.77,244.83,244.53,243.6,247.44,251.92,244.94,234.07,231.1,228.31,226.4,217.33,223.9,223.31,216.92,209.65,201.28,207.21,201.92,196.63,197.67,197.67,191.51,193.55,193.72,189.59,190.06,200.52,193.84,194.59,197.62,203.14,202.56,191.63,194.07,189.88,188.55,199.36,197.33,198.55,193.31,192.97,190,215.35,221.34,224.36,233.2,230.23,230.17,230.17,229.19,234.94,240.41,249.42,252.79,258.78,258.14,250.35,252.15,259.71,264.65,274.36,272.97,279.01,277.73,276.1,272.21,275.93,260.99,253.49,256.28,243.84,247.79,242.73,247.85,241.4,244.94,256.8,244.42,245.58,253.2,261.69,257.15,256.8,260.35,249.77,252.5,246.74,250.87,259.71,263.2,263.2,261.57,272.15,285.06,284.71,285.64,287.15,293.49,293.26,293.6,291.57,295.58,293.49,289.65,285.81,288.37,282.03,287.62,282.56,251.22,249.13,245.93,244.07,252.67,259.01,256.74,247.91,249.3,251.63,262.21,260.81,270.12,262.56,264.53,252.73,262.91,259.65,259.65,273.84,279.24,283.08,279.71,278.37,276.45,281.28,288.31,283.02,277.21,281.4,274.36,268.95,272.67,269.19,272.09,277.38,278.02,270.81,264.94,264.83,266.69,276.28,271.63,280,280,276.22,269.71,262.97,269.19,271.05,278.66,270.06,275.93,286.4,296.34,297.67,307.79,308.14,308.37,317.03,320.12,322.09,322.21,322.21,320.41,314.13,309.36,312.67,322.03,317.03,311.45,338.78,334.42,333.2,329.48,334.01,334.42,326.57,335.35,335.23,335.23,342.85,344.01,344.19,335.81,322.15,328.31,321.51,319.94,308.66,312.67,322.67,330.06,341.16,330.7,333.31,332.85,344.59,344.94,340.12,340.12,335.76,348.78,343.02,331.34,319.83,302.91,304.48,294.07,305.58,317.38,301.16,321.45,312.33,299.24,267.27,278.26,254.19,225.64,249.94,200.41,217.33,201.69,210.99,209.94,222.38,251.57,247.09,260.41,252.79,258.84,244.53,231.92,238.9,239.65,269.59,270.58,280.76,268.2,268.2,268.43,276.86,269.94,264.71,265.7,252.33,240.76,255.29,254.48,256.74,263.26,263.43,289.71,278.43,261.98,258.49,264.01,267.91,270.87,280.52,280.23,265.64,253.08,265.87,258.2,266.98,262.33,271.16,262.91,261.28,261.28,266.28,287.5,270.17,278.55,269.42,272.21,284.42,297.79,312.33,312.21,309.01,305.06,282.09,283.08,286.28,296.63,296.28,293.49,295.52,297.38,289.77,280.76,285.99,281.92,285.76,299.53,288.95,289.71,289.71,296.05,285.41,289.01,290.58,294.77,287.56,289.01,293.66,291.28,287.62,297.73,299.53,300.29,306.05,290.81,299.94,291.22,292.97,295,291.05,292.97,298.26,296.8,283.14,283.43,285.76,277.67,281.86,268.26,265.12,262.91,258.14,256.1,249.94,248.02,254.42,262.21,261.4,259.42,265.64,264.59,266.05,278.08,269.36,270.23,270.23,261.8,262.5,260.87,267.97,285.06,285.17,291.92,296.4,295,285.76,288.95,289.83,287.62,285.7,289.07,294.83,273.02,278.6,270.64,276.74,275.12,281.45,290.12,290.06,294.65,301.45,300.17,301.98,300.06,305.99,311.22,309.94,316.16,307.27,303.14,302.09,290.7,293.49,292.67,289.01,296.98,302.09,317.33,320.7,325.35,322.15,327.67,327.03,336.8,359.65,360.41,353.14,359.48,356.98,373.14,371.8,368.78,368.78,373.43,372.62,390,401.8,406.4,426.4,422.15,425.52,415.17,414.42,410.06,415.93,425.29,424.36,420.12,415.47,415.52,409.53,406.69,410.35,410.35,410.81,408.2,418.14,437.09,430.52,449.19,448.31,459.94,450.12,457.38,461.98,464.59,472.67,469.3,469.3,497.09,485.47,494.24,478.37,472.56,462.27,436.57,455.76,455.06,467.62,474.53,459.94,472.38,471.51,488.43,484.42,478.78,502.79,511.69,511.69,510.12,500.29,514.77,528.84,501.63,512.97,537.91,512.33,532.15,550.93,529.59,518.08,490.29,517.03,494.48,519.19,496.57,519.24,510.29,516.57,531.57,550.93,522.21,526.22,530.7,496.51,482.56,488.9,511.57,503.43,503.14,512.85,537.27,537.27,545.06,543.55,546.28,554.01,554.07,555.76,535.76,527.15,524.83,527.09,514.01,508.6,520.29,492.5,500.17,510.7,520.12,500.17,511.98,500.41,494.3,490.76,495.06,493.02,499.88,470.06,469.07,446.51,448.78,463.37,467.38,458.6,464.71,471.69,469.3,481.98,472.27,478.14,487.97,489.19,489.19,489.24,490.35,476.92,486.98,488.6,468.2,457.33,460.93,461.28,467.97,477.79,467.97,468.84,447.38,448.08,451.51,459.42,468.49,476.92,484.77,482.15,494.07,465.76,467.03,467.03,471.4,454.77,448.31,457.79,462.56,456.1,456.34,447.21,436.1,433.6,438.31,448.78,439.13,441.51,443.6,431.51,439.24,448.14,451.05,451.4,470.12,476.63,473.78,476.74,466.34,441.34,436.22,408.43,412.33,412.38,411.51,410.58,408.6,408.31,417.09,418.49,430.47,423.08,430.23,425.35,428.49,428.6,430.17,429.13,429.13,428.14,420.17,423.66,427.33,432.27,427.27,429.19,433.9,431.98,420.76,419.42,430.06,430.47,430.52,437.09,425,416.51,412.67,412.73,410.58,409.88,406.63,410.12,407.67,402.44,387.91,385.93,394.19,393.49,391.05,392.85,396.92,399.07,392.5,399.77,400.81,396.74,404.53,401.74,411.05,411.4,414.24,420,423.95,433.49,439.48,426.8,433.43,449.42,446.4,446.57,438.72,447.79,482.73,487.56,496.57,501.22,501.22,485,500.81,488.37,495.06,481.86,474.53,479.36,499.01,500.12,493.78,497.33,490.41,484.24,498.02,480.76,482.56,476.92,527.21,525.23,548.95,548.95,549.01,540.35,559.13,545.87,541.57,556.69,560.12,548.84,556.1,549.13,545.87,547.67,552.97,555.93,566.05,566.05,539.94,523.26,494.59,476.34,482.27,469.3,476.57,457.67,460.87,478.31,473.55,491.34,476.57,471.92,470.17,489.07,512.33,529.19,521.86,522.44,558.14,558.49,544.94,527.91,527.91,526.57,507.62,516.45,523.84,516.63,501.51,542.44,518.49,476.22,440.12,448.6,461.86,440.23,423.37,403.49,425.06,463.2,468.14,461.69,455.52,460,439.83,454.71,454.07,464.3,477.03,460.23,452.85,442.91,451.57,433.78,428.95,426.05,419.42,418.78,418.37,420.81,407.73,407.73,413.66,422.85,425.58,412.33,403.55,407.67,390,386.45,408.02,396.45,410.47,414.3,428.02,414.48,409.01,394.94,400.64,389.3,393.66,418.14,409.71,433.02,413.08,403.49,400.58,404.59,387.33,394.59,410.47,426.28,426.28,429.3,427.62,438.2,406.63,409.59,411.4,398.84,383.84,364.07,342.09,341.28,343.72,319.83,324.13,324.13,330.23,327.56,326.86,339.77,341.74,336.4,325.7,321.4,311.92,311.92,329.83,333.55,342.15,343.84,336.1,344.07,342.21,345.06,357.73,351.45,362.79,368.02,370,356.34,349.71,346.86,359.83,360.87,359.65,363.6,363.2,373.55,377.03,363.14,357.27,343.9,356.98,362.33,378.14,376.16,371.28,358.26,366.16,351.8,339.01,336.4,339.01,355.81,335.06,331.45,327.33,328.66,333.2,327.5,327.5,321.1,319.77,322.03,333.95,336.86,311.74,308.78,306.34,307.27,302.91,295.35,291.28,288.72,291.28,284.19,294.07,296.51,290.76,291.28,300.7,313.72,318.2,317.56,307.62,298.72,312.27,306.69,318.95,306.51,311.05,305.52,308.31,312.21,325.87,326.98,324.83,322.38,303.55,314.19,314.53,318.95,310.76,310.93,326.51,328.84,334.24,325.41,350.41,363.49,359.19,366.86,342.27,341.51,340.58,332.33,340.81,342.62,342.62,339.59,324.13,320.47,335.17,322.62,317.91,314.19,312.09,312.91,320.93,319.01,321.8,321.16,317.38,302.56,302.73,300.7,294.65,297.62,287.38,291.86,291.86,290.81,285.58,294.48,290.58,290.58,292.85,315.12,318.08,330.06,327.67,332.62,337.56,332.97,330.99,330.99,330.52,328.55,327.67,339.88,359.42,356.16,357.79,365.12,371.34,358.78,350.58,363.95,367.27,362.85,348.72,361.22,350.29,349.88,347.79,349.53,360.87,359.53,349.13,343.08,343.08,334.88,331.28,341.57,338.26,336.63,336.16,333.37,328.08,330.12,330.41,323.02,330.76,323.26,319.36,313.37,315.52,314.71,328.9,329.42,335.12,340.87,338.2,356.63,355.58,347.62,344.65,369.42,366.8,350.81,346.57,332.97,331.51,340.47,340.47,367.85,369.59,360.23,366.28,364.13,363.6,360.06,352.62,357.33,355.41,345.99,338.02,354.77,359.88,374.19,362.5,359.88,354.13,351.8,355.99,353.9,354.24,348.78,358.2,354.19,375.81,370.52,377.44,392.85,396.34,385.06,383.78,386.8,404.71,429.83,429.83,416.8,396.51,401.69,402.15,394.01,392.67,389.88,379.77,380.41,392.15,394.59,401.86,400.12,393.37,393.37,388.95,382.56,385.17,379.53,380.52,388.31,389.94,374.01,366.92,371.51,371.51,360.81,355.99,352.62,363.26,369.77,370.87,375.17,372.56,378.84,377.56,377.67,376.1,381.69,380.7,381.86,391.74,413.2,413.95,415.06,411.4,396.34,402.21,406.45,403.37,393.31,387.79,380.47,374.24,396.98,379.83,373.37,369.53,369.71,371.86,368.66,379.01,370.29,370.47,379.71,387.67,395.87,406.63,409.24,409.24,408.66,409.36,406.22,408.02,407.15,408.78,411.92,417.38,406.28,409.88,411.1,405.12,394.77,400.47,398.72,395,396.57,379.07,395.52,395.12,394.36,395.99,401.45,406.74,403.95,401.57,408.2,405.52,402.38,401.63,401.16,401.98,392.62,390.81,388.84,395.76,386.63,375.17,381.69,384.13,388.78,403.49,409.53,421.98,423.95,423.26,420.23,427.73,438.14,434.77,448.66,448.49,445.76,450.93,457.09,445.99,448.26,448.26,446.92,450.64,442.56,445.87,442.56,441.45,431.92,428.43,425.17,428.2,435.81,452.27,454.42,463.9,477.85,473.31,474.19,477.73,457.5,496.98,502.85,502.85,506.16,503.84,500,496.16,478.72,478.26,480.87,485.17,493.9,484.48,478.95,484.83,479.01,479.01,491.92,484.19,493.14,508.78,518.84,508.9,512.09,518.6,511.92,517.85,500.93,498.55,497.73,502.79,505.7,491.86,495.17,493.49,497.44,498.26,474.01,475.76,474.59,462.21,462.21,469.24,473.78,499.48,500,520.12,534.01,521.57,526.8,553.2,556.8,549.24,555.58,575.47,567.56,549.48,566.4,547.44,531.57,542.15,545.23,546.51,559.59,638.66,640.76,680.99,690.7,693.31,685.41,685.41,722.67,713.66,744.24,721.45,718.49,714.83,712.97,710.47,741.34,712.33,705.64,707.97,676.34,650.76,620.76,634.42,653.84,649.88,648.72,667.67,664.88,656.74,637.79,653.08,666.86,698.43,693.08,693.72,684.94,704.88,715.12,725.64,743.08,743.55,728.43,750,741.28,734.19,734.13,752.85,752.85,771.34,765,734.24,726.74,745.17,736.28,777.38,756.22,761.28,783.84,785.29,818.31,832.21,821.86,859.48,892.15,892.15,838.31,811.28,808.2,820.47,827.67,768.78,764.71,764.65,770.87,795.47,795.47,765.12,759.83,762.44,792.97,757.15,776.45,760.87,741.22,694.77,682.85,664.3,670.23,664.24,641.16,624.71,636.1,627.03,596.28,638.49,590.17,538.95,525.7,517.44,504.65,535.29,541.16,550.23,566.51,583.78,621.8,627.85,631.57,627.85,629.83,606.16,597.97,575.06,568.95,551.51,555.64,559.53,559.53,515,519.13,519.71,502.21,501.57,504.94,527.03,507.03,530.35,506.86,515.87,507.85,518.9,528.49,544.01,546.51,556.8,638.84,625,602.97,583.2,580.52,591.98,594.48,598.31,596.16,591.28,614.48,621.63,629.88,606.51,635.12,651.45,646.22,634.19,626.86,610.76,621.22,627.38,618.55,628.95,605.12,579.36,579.83,591.45,613.31,650.17,659.36,650.58,631.69,605.23,580.93,576.63,560.12,566.92,568.2,571.92,597.44,596.74,607.44,591.86,570.93,570.93,569.48,572.97,580.47,600,586.45,588.2,597.79,570.35,593.37,571.16,595.93,629.42,631.4,604.07,506.34,523.95,521.63,519.07,519.07,522.21,515.29,495.99,489.3,507.73,522.5,577.09,592.5,577.97,577.97,577.56,552.67,566.05,599.94,596.51,614.83,614.83,635.93,635.06,609.53,599.94,529.71,513.08,517.5,537.79,530.47,522.79,527.09,544.19,549.65,536.63,557.73,546.98,533.02,556.16,578.6,578.6,620.87,606.74,599.88,574.65,554.71,541.98,568.08,533.84,544.36,526.4,530.23,548.49,519.01,540.47,506.28,517.73,556.05,551.63,585.99,599.48,591.4,593.37,598.84,550.7,563.6,547.56,535.64,530,514.19,505.17,515.76,515.12,432.21,376.28,397.5,381.05,452.73,407.27,404.36,412.91,413.02,403.08,400,400,388.02,408.2,424.01,450.12,463.84,456.74,446.98,447.38,452.15,469.3,467.56,468.08,480.35,495.06,499.19,536.57,563.55,554.19,554.94,569.77,573.55,570.35,557.21,551.34,542.85,542.85,560.35,559.19,562.79,549.19,570.81,594.48,600.29,617.97,631.16,645.06,663.6,674.59,675.47,672.09,696.74,699.65,708.26,708.26,718.6,709.77,743.66,739.83,732.56,725.35,716.57,702.85,707.79,710.99,710.99,697.21,723.37,710.7,715.76,724.01,689.59,698.31,676.92,658.49,665.06,658.31,635,638.55,649.59,646.86,646.8,650.93,667.09,634.53,609.77,626.57,634.07,632.44,650.41,691.22,719.3,742.73,722.5,728.43,702.73,718.31,709.59,681.45,673.2,684.19,676.86,677.33,684.59,709.3,691.92,691.92,688.84,690.23,722.15,763.78,764.3,786.28,813.95,875.41,914.13,917.27,923.37,930.17,981.92,946.1,957.09,967.5,940.17,911.8,914.36,952.91,972.79,1059.01,1068.31,1092.03,1110.23,1079.59,1142.67,1118.2,1055.81,1120.76,1087.56,1115.93,1177.5,1176.63,1202.15,1176.1,1153.9,1201.8,1273.37,1279.65,1290.17,1317.62,1302.38,1300.99,1364.53,1267.62,1380.81,1385.64,1383.26,1472.67,1401.8,1423.84,1377.62,1435.06,1406.69,1328.49,1313.49,1170.76,1205.64,1301.92,1305.41,1338.72,1338.72,1374.88,1398.02,1392.38,1361.4,1317.73,1379.19,1435.58,1467.56,1533.2,1502.67,1401.98,1380.81,1351.8,1311.16,1445.06,1546.05,1608.08,1606.22,1666.74,1666.74,1655.76,1711.45,1701.34,1659.36,1833.84,1814.83,1996.69,1974.13,1901.28,2006.34,2010.87,1965.87,1938.08,1957.15,2109.01,2109.01,2122.09,2262.27,2311.51,2323.55,2262.15,2385.12,2530.7,2533.66,2412.09,2545.35,2438.6,2205.81,2226.1,2294.71,2229.65,2170.06,2385.7,2406.8,2393.37,2393.37,2324.3,2447.38,2426.45,2489.36,2447.5,2430.29,2494.19,2416.05,2397.5,2399.24,2207.44,2330.06,2308.43,2152.91,2263.49,2343.66,2434.24,2356.69,2477.5,2568.6,2684.24,2684.48,2582.96,2458.72,2350.87,2299.59,2221.45,2066.63,2076.86,1870.93,1964.19,2138.66,2129.3,2129.3,2196.28,2195.23,2364.71,2450.64,2445.29,2480,2707.33,2652.5,2658.31,2645.76,2607.09,2612.67,2834.19,2800.7,2887.91,3049.77,2931.92,3014.3,3006.74,3152.38,3351.45,3722.09,3875.52,3759.48,4341.92,4624.01,4456.86,4672.27,4511.69,4213.14,3962.44,4062.44,4255.76,4430.81,4366.28,4366.28,5208.6,5397.73,5369.3,5645.35,6020.35,6186.63,6276.57,5790.7,5023.31,5519.07,5441.22,5185.35,5789.94,5707.03,6325.52,5934.65,6065.06,6592.96,6592.96,7042.91,6114.94,6095.99,7055.58,6583.31,6658.6,6710.99,6001.63,5671.86,5671.86,5725.29,5455.7,5516.28,5765.35,5693.6,5447.67,5715.81,5257.44,4960.46,4935.76,5031.74,5644.3,5578.37,5757.03,5354.36,5233.72,4770.52,4296.51,5085.23,4785.06,4822.67,5189.94,5192.96,5124.83,5102.15,5005.81,5049.53,5298.2,5522.27,5649.19,5882.27,5469.53,5448.31,5664.71,5620.81,5293.2,5424.24,5455.81,5438.31,5423.6,5574.01,5426.98,5558.6,5570.7,5910.41,5910.41,5815.46,5975.41,5682.62,5670.12,5372.27,5393.02,5386.92,5683.14,5905.81,6069.53,6373.02,6231.86,6282.15,6292.33,6127.79,6192.33,6192.5,6380.17,6249.36,6185.81,6078.84,6325.58,6022.33,5982.56,5750.23,5541.8,5314.71,5414.19,5109.53,5261.05,5261.05],"삼성전자":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,98.09,99.26,98.58,96.73,97.1,99.63,101.17,101.98,101.42,99.75,100.43,101.23,101.48,98.52,101.79,98.64,95.86,95,96.17,96.79,97.9,98.33,101.23,101.79,101.85,101.85,103.52,103.52,107.78,107.96,106.6,106.05,107.9,109.38,110.49,109.88,108.15,109.01,109.69,108.58,110.68,110.8,111.85,111.42,111.67,110,110.99,111.05,110.37,111.23,111.23,111.42,112.59,111.6,109.75,111.73,114.88,114.94,118.15,119.75,115.62,113.15,114.07,114.01,115.68,114.81,117.47,117.78,121.6,123.15,123.15,123.15,121.79,120.74,121.48,121.79,122.1,119.81,118.52,118.52,118.4,117.16,115.99,116.42,117.35,116.85,119.32,120.19,121.3,120.93,117.96,117.47,118.64,118.64,122.59,122.28,123.7,124.07,124.07,124.07,124.01,125.31,127.65,127.78,129.14,130.86,129.32,131.36,131.05,129.01,128.09,127.16,128.02,128.95,129.57,127.16,127.9,129.88,130.06,129.14,128.4,129.44,128.4,129.32,130.93,129.69,128.27,128.09,126.23,124.32,125.8,127.28,131.79,132.1,135.31,137.72,137.72,138.58,138.58,140.49,140.49,145.12,145.12,140.74,140.43,141.42,142.28,143.15,143.02,141.79,138.02,139.2,138.64,138.52,140.99,142.22,140.8,137.78,137.96,137.9,141.85,141.79,141.79,139.81,139.38,142.28,140.06,140.12,140,140.99,140.68,143.7,148.58,146.54,148.02,146.98,149.01,149.07,147.22,147.96,146.73,145.74,145.06,146.85,148.33,147.72,150.19,151.23,153.95,156.05,155.8,156.3,156.91,156.6,158.02,157.65,156.98,154.32,153.83,153.7,147.41,148.77,150,151.23,147.47,147.22,146.85,147.28,142.84,141.67,137.72,138.89,138.89,142.59,145.19,144.75,144.57,145.06,146.54,146.67,145.12,142.28,142.22,142.59,142.96,143.46,142.1,144.32,145.06,148.52,151.48,153.7,153.09,153.15,155.25,155.56,161.98,160.86,161.17,162.96,162.96,165.49,165.49,159.51,158.21,158.27,158.27,158.27,158.27,158.27,158.27,158.27,162.96,168.64,169.14,166.67,166.42,169.14,169.01,163.52,166.17,167.59,166.79,166.36,161.73,163.83,166.79,170,176.6,176.11,174.01,174.01,173.15,175.19,173.89,174.07,174.01,172.59,170.8,172.16,172.28,170.37,170.62,172.72,170.68,171.17,162.47,164.44,162.35,156.79,156.91,158.46,158.21,154.38,156.6,160.49,159.81,160.8,158.4,157.59,156.23,158.02,159.14,159.14,151.67,153.4,153.4,148.77,152.35,157.28,157.28,157.47,159.32,157.65,160.86,160.56,155.56,150.74,148.89,148.77,149.81,154.32,153.15,154.01,152.22,148.89,151.73,152.28,155.12,156.73,158.09,153.7,154.01,153.77,147.22,147.9,146.36,141.36,141.98,137.96,141.11,146.73,151.23,151.23,151.23,149.32,146.3,145.93,144.32,145.74,146.23,146.23,145.25,145.25,142.04,139.51,145.12,150.06,151.85,153.52,153.52,159.44,159.75,159.07,157.84,156.6,158.02,157.59,159.81,153.46,155.19,154.26,150.31,151.36,151.91,149.81,148.52,144.81,150.43,149.38,151.85,150.86,150.8,151.23,153.7,155.37,154.26,158.52,162.9,159.32,160.19,155.74,155.56,160.93,163.58,163.58,163.58,163.58,163.58,160.19,160.19,162.35,157.1,159.26,158.33,154.63,151.85,153.86,152.47,152.78,154.32,154.32,159.88,158.64,162.65,161.42,158.33,152.78,156.48,158.33,157.72,158.33,158.33,156.17,153.24,154.01,152.47,152.47,148.77,147.07,143.83,145.06,145.06,145.22,145.83,143.98,145.06,147.99,144.44,143.98,140.59,142.44,142.75,141.82,138.58,140.74,142.9,141.98,140.43,143.52,142.13,141.51,143.67,144.75,146.45,143.52,142.44,142.44,144.75,144.75,143.52,142.75,143.67,140.59,141.2,141.36,144.14,144.44,144.75,140.12,139.04,139.35,139.35,136.57,136.11,135.34,138.27,142.28,142.59,142.44,142.9,143.67,144.44,147.07,149.54,146.45,147.07,143.83,142.28,138.58,140.43,139.04,137.5,135.96,141.51,139.35,140.43,142.44,145.83,146.3,146.3,146.3,146.3,146.6,143.36,143.06,141.05,141.05,137.96,137.96,138.73,138.73,139.81,133.02,135.8,135.19,134.57,136.27,135.96,135.49,134.41,132.87,131.33,126.54,126.54,127.78,130.71,130.86,130.09,136.27,135.19,135.03,135.8,135.96,136.73,139.51,137.35,136.11,136.57,135.8,134.72,132.1,129.94,131.02,130.86,131.48,132.87,133.18,133.18,129.17,133.49,130.09,127.93,125,126.39,124.07,124.23,124.85,123.46,120.22,120.83,120.06,120.68,119.29,119.29,119.75,119.75,118.36,118.06,119.44,119.44,119.6,116.05,115.59,119.6,117.59,122.22,122.84,125,123.61,126.85,127.93,129.48,130.56,131.94,130.09,129.63,132.87,138.12,139.04,140.43,143.21,142.44,143.06,143.06,143.06,143.06,142.59,138.27,138.89,142.13,142.59,146.6,142.13,142.59,141.82,144.75,144.91,145.52,146.14,144.29,144.29,139.2,139.2,138.43,136.57,135.8,137.19,135.19,134.72,137.81,135.34,135.34,136.42,134.88,135.49,135.96,141.51,143.67,140.43,139.66,139.97,138.43,137.81,139.04,141.2,143.83,144.91,144.6,143.98,143.98,144.14,142.75,144.6,145.22,145.83,145.22,140.74,139.81,139.97,139.51,138.12,137.81,138.43,142.44,141.51,141.51,141.67,139.81,139.81,138.43,136.57,131.02,132.41,131.64,131.64,131.33,128.24,127.16,129.63,133.18,134.26,135.34,131.79,131.64,131.33,129.01,131.33,131.17,135.19,134.1,135.49,135.49,136.42,138.27,138.43,137.65,135.03,135.8,135.49,136.88,139.97,140.43,141.05,140.43,140.74,141.05,143.52,145.06,143.83,142.75,140.12,141.98,140.9,137.04,139.2,140.59,142.59,142.9,143.36,144.6,142.13,142.28,144.44,145.68,145.99,143.21,145.68,145.52,142.28,143.67,139.97,139.51,138.73,135.65,134.26,133.33,131.64,133.18,134.88,132.72,134.88,134.88,135.49,134.57,137.19,137.35,135.96,135.65,134.57,135.96,136.27,133.95,135.8,135.19,133.49,136.11,141.05,142.9,144.75,145.06,145.52,145.52,145.52,145.37,144.75,147.22,151.7,151.85,152.16,152.78,150.93,151.85,149.38,151.39,150.77,146.91,146.91,148.15,147.38,150.93,150.93,149.85,151.7,154.32,154.63,156.48,155.86,154.01,155.25,158.02,158.02,156.48,157.1,158.33,157.72,155.56,155.56,158.02,161.42,162.65,164.51,163.27,160.8,159.26,162.35,162.04,162.96,165.74,165.12,165.12,160.49,157.41,159.26,159.88,159.88,161.11,158.33,155.25,155.56,154.01,152.62,152.78,155.56,158.02,158.95,160.19,164.51,168.83,168.83,175,173.77,172.84,172.84,171.3,169.75,169.75,170.99,174.38,172.22,172.22,170.37,171.3,171.3,172.22,175.31,180.86,183.64,185.19,185.19,182.1,187.35,189.2,192.59,189.51,192.28,187.65,187.65,187.65,181.48,182.41,176.54,174.07,176.54,181.79,183.64,188.58,186.42,184.26,184.88,186.73,187.35,190.74,189.81,184.57,185.8,185.19,182.72,175.31,178.7,174.38,172.53,167.28,169.75,170.99,177.16,178.4,174.38,174.38,168.52,160.8,160.8,154.17,150.93,145.99,140.74,132.56,140.12,131.17,144.91,150.15,147.53,149.07,147.69,147.38,141.36,144.44,145.06,150.31,153.09,150,151.54,152.01,149.07,151.23,151.23,151.23,158.64,154.63,152.01,153.86,153.86,152.31,153.86,154.63,154.32,154.32,154.32,149.69,149.69,151.85,150.62,150.62,149.38,147.84,149.85,148.15,147.69,150.62,155.25,154.32,154.17,150.46,150.77,152.01,154.01,155.56,156.48,158.02,158.64,168.21,168.52,171.3,169.44,171.3,170.99,167.59,161.42,154.01,160.8,161.11,161.42,163.27,160.49,158.64,163.27,160.19,164.51,161.73,162.96,162.35,163.27,165.43,169.75,164.81,163.58,162.96,162.65,164.81,166.05,168.83,166.05,167.9,167.28,170.68,168.83,166.98,167.28,171.6,180.86,182.1,182.1,178.7,175.31,176.85,175.62,179.01,177.47,178.4,179.63,182.1,181.17,179.01,179.01,180.25,178.4,170.99,172.53,173.15,174.07,174.07,171.6,170.99,166.67,167.28,167.9,174.07,171.6,174.38,181.17,180.25,182.72,182.1,186.42,188.27,188.27,183.64,183.02,182.72,179.63,180.86,178.4,178.7,179.63,179.63,179.63,179.63,179.63,181.17,182.1,184.88,184.26,184.26,186.42,187.96,187.96,185.19,183.64,185.19,187.96,187.96,185.49,185.8,186.42,184.57,182.1,179.32,174.69,177.16,181.48,180.56,186.11,185.49,185.8,185.8,189.2,188.27,195.06,204.63,202.78,200,199.38,199.69,208.33,208.95,205.56,209.88,210.49,205.86,209.26,214.51,215.12,220.68,225,221.3,228.09,225,226.54,227.78,227.78,227.78,226.23,225.31,225.31,223.15,228.09,240.12,240.12,242.9,241.67,250,250,256.17,258.95,253.7,255.86,274.07,280.86,279.63,276.85,276.85,271.6,262.35,268.52,269.14,271.91,267.9,275.93,267.59,264.2,258.33,253.09,256.17,260.49,261.11,254.63,257.72,256.17,255.25,251.85,251.85,251.85,259.88,262.04,256.79,253.4,254.94,253.7,253.09,253.09,263.27,254.63,254.63,258.02,259.26,254.32,253.4,253.09,251.23,249.69,253.09,255.56,252.47,255.56,254.01,255.86,252.78,253.09,252.47,250,250.62,251.54,251.85,253.7,251.23,255.86,261.73,263.58,265.43,264.2,261.42,258.02,256.79,259.26,259.26,259.57,258.95,257.1,258.95,254.94,254.32,255.56,257.72,255.86,253.4,252.16,251.54,252.16,254.94,254.94,254.01,252.78,256.79,250.62,246.91,242.28,247.22,245.68,245.68,245.68,245.37,247.22,245.99,246.6,246.3,245.68,247.22,248.46,248.77,249.38,255.56,253.7,252.78,252.78,250.31,250,250,248.46,249.69,252.47,249.69,248.46,246.6,246.91,247.22,250.62,251.85,252.78,250,249.07,247.22,246.91,248.15,250.62,249.38,246.6,245.06,245.99,246.3,245.37,248.77,246.3,243.83,243.83,242.28,245.99,244.75,243.21,242.28,244.44,243.83,242.28,244.75,251.23,255.86,253.4,251.54,251.54,247.53,242.28,237.65,229.63,229.63,229.01,228.09,225.62,224.38,226.23,233.33,233.64,230.25,229.32,230.25,236.73,237.04,234.57,236.42,238.58,234.88,235.49,232.41,232.41,235.49,236.42,237.65,234.88,238.27,238.27,238.27,238.27,238.89,238.58,239.81,235.49,228.7,228.7,225.93,225.93,222.84,220.06,220.99,220.68,220.68,212.96,212.35,214.2,216.36,216.67,217.9,216.98,216.67,217.28,216.67,219.44,216.36,218.21,215.43,215.74,220.68,217.28,217.9,216.67,217.9,217.59,216.67,215.74,217.9,220.37,220.06,218.21,216.67,219.75,231.17,232.41,230.86,227.47,223.15,223.15,220.06,229.63,233.95,233.33,235.49,238.89,238.89,241.36,237.35,237.04,237.65,239.51,240.12,240.74,237.96,241.05,245.06,246.6,248.46,247.53,247.84,243.21,241.67,241.67,241.67,242.9,238.89,237.35,241.67,240.74,243.52,243.52,240.43,238.58,239.2,237.65,235.49,236.11,233.33,231.79,228.4,228.4,220.06,226.23,226.23,226.23,226.23,226.23,228.4,225.31,225.31,225.31,232.72,231.17,227.47,227.47,230.86,231.48,229.32,229.32,229.32,229.32,220.68,221.91,221.91,221.91,221.3,225,225,216.36,214.51,214.51,214.51,216.05,216.67,216.67,217.28,217.28,218.21,215.74,216.98,217.59,215.43,215.43,215.12,216.67,215.74,214.81,213.27,213.89,213.58,211.42,209.88,209.26,209.57,206.79,212.04,208.33,205.56,205.86,207.72,208.02,208.95,206.79,204.63,204.01,200.62,200,208.02,207.72,208.33,209.57,209.57,205.25,205.25,202.78,202.78,200.31,205.25,204.63,208.64,210.19,208.33,209.88,209.57,205.25,204.94,203.4,205.25,208.95,208.02,208.02,205.86,206.17,206.17,202.16,201.54,201.23,196.91,191.67,191.05,187.35,187.96,184.57,181.17,180.56,177.78,177.16,180.25,181.48,183.33,179.01,175.93,173.46,176.23,176.54,174.07,179.63,181.17,181.48,179.32,179.01,177.47,185.19,191.05,187.96,186.73,190.74,189.2,188.58,190.43,190.74,191.05,189.51,189.2,190.43,189.2,189.81,189.81,187.65,185.19,182.41,184.88,185.8,185.8,188.27,186.42,189.81,187.96,185.19,182.41,182.1,184.26,185.19,180.86,181.48,184.26,180.25,177.47,176.23,176.23,172.84,171.6,171.6,171.6,179.32,175.31,172.84,173.46,174.07,172.22,170.68,167.9,168.21,166.36,167.28,163.27,162.35,163.89,163.89,170.37,172.84,173.77,173.46,173.46,170.99,172.22,170.37,173.77,174.69,174.38,172.22,171.3,172.53,177.47,178.09,183.33,183.64,176.85,183.33,185.19,183.95,182.72,183.33,185.8,190.74,191.36,186.42,194.14,191.05,192.59,193.52,189.51,190.74,189.51,187.04,188.27,189.51,188.27,185.49,187.04,191.98,193.21,186.42,186.11,182.72,181.79,182.72,186.42,183.64,184.26,186.73,183.02,183.64,183.64,180.86,179.01,182.41,179.32,178.7,179.32,174.69,170.68,170.68,171.3,170.99,178.4,179.63,182.1,187.35,186.42,186.73,186.73,187.65,188.58,188.27,186.42,189.81,190.74,190.74,190.74,195.37,196.91,199.38,195.37,189.51,188.27,195.99,195.99,190.12,191.36,194.75,195.37,194.14,194.14,195.06,191.98,196.6,193.21,193.52,191.67,188.58,191.36,189.2,186.73,187.04,187.04,187.65,186.73,189.81,187.35,186.11,185.49,183.64,185.19,182.1,184.57,184.88,189.2,185.8,186.11,188.58,192.28,194.44,191.67,194.14,193.52,195.06,197.53,194.75,196.3,197.22,192.28,200.62,202.78,203.4,203.7,204.01,200.93,201.54,202.47,202.16,201.54,202.78,201.23,196.3,197.84,199.38,202.16,202.16,202.78,201.85,200.93,200.93,203.4,201.54,199.38,198.15,197.84,199.07,201.85,200.62,204.32,211.11,211.42,211.11,211.42,212.35,216.98,216.98,223.15,220.37,218.83,222.84,221.3,221.3,219.14,218.83,222.22,219.14,222.22,221.91,220.68,221.6,219.75,220.37,217.59,220.06,220.99,223.46,224.07,224.38,223.46,222.84,225.31,225.31,222.22,220.99,215.74,214.51,220.68,221.91,221.91,226.54,226.23,222.22,221.3,219.14,216.98,217.28,216.05,215.43,221.3,217.9,215.43,219.44,215.74,212.35,210.8,211.42,208.64,212.65,209.88,208.33,207.72,207.72,206.79,205.86,204.63,205.56,205.56,207.1,210.49,207.1,206.17,206.17,207.1,206.48,219.14,219.75,218.21,216.05,217.28,216.98,218.52,217.59,218.83,221.3,222.22,216.67,215.43,214.81,212.65,212.35,214.2,211.73,211.11,211.11,211.11,211.11,211.11,208.33,205.86,203.7,203.7,204.94,210.49,212.65,209.88,207.72,214.2,217.59,214.51,212.35,211.11,211.42,209.88,205.86,207.72,207.72,206.48,211.73,215.12,214.81,218.83,218.83,215.74,216.98,217.59,217.28,218.52,222.84,224.69,223.77,224.38,224.69,224.69,223.46,221.3,220.06,224.38,224.38,224.69,222.22,224.07,219.75,221.3,220.68,224.07,225.31,226.85,224.69,225.62,226.23,225,226.54,230.86,231.48,234.26,234.26,236.42,240.74,242.28,242.28,245.68,237.65,236.42,236.42,236.11,230.56,227.16,225.93,225.62,228.09,224.07,219.14,221.3,230.56,231.79,232.1,228.4,228.7,226.54,229.63,229.32,224.38,227.16,232.1,229.32,229.63,231.48,228.7,228.7,228.7,232.1,228.4,225.93,224.69,227.78,226.23,225.31,225.62,225,224.69,225,225.93,226.54,226.54,231.17,227.47,225,222.84,226.23,223.46,226.23,228.7,229.32,223.15,224.69,224.69,237.35,244.75,243.52,241.36,246.6,246.3,249.38,254.32,253.09,262.35,259.57,263.27,260.8,260.8,258.02,258.02,259.57,258.33,253.7,246.91,243.52,245.68,239.51,234.88,233.02,242.59,235.49,236.73,236.73,239.2,239.2,240.74,239.51,239.51,250.93,250.93,245.99,244.44,241.98,241.67,241.67,241.36,238.89,243.52,241.98,239.81,241.67,234.26,238.27,239.51,232.1,226.85,226.85,233.64,232.41,238.89,238.89,238.58,233.64,232.1,236.11,242.59,245.68,241.05,246.3,250.62,251.85,246.91,248.77,249.38,250.93,251.85,251.54,252.47,252.47,252.47,261.11,268.83,269.75,270.99,270.99,270.37,260.49,267.59,270.68,267.59,268.21,260.49,256.17,258.95,253.09,248.15,249.69,250.62,250,258.95,256.48,245.68,220.37,223.77,230.56,226.54,230.56,233.02,234.88,238.27,238.27,247.53,241.67,243.52,241.67,241.67,239.81,234.88,233.95,235.8,228.4,229.32,229.63,223.77,216.05,212.96,212.65,208.33,204.32,200.31,204.63,198.77,198.77,198.77,198.77,194.75,194.44,193.21,195.06,191.98,199.69,198.15,189.81,189.81,189.2,189.2,187.04,188.27,186.11,186.11,181.79,183.02,183.02,188.27,183.64,184.26,182.72,182.1,178.09,182.41,174.69,172.53,179.32,183.95,182.41,182.72,179.94,181.17,177.78,176.85,176.85,175.93,169.75,163.58,156.17,154.01,165.12,175,173.77,170.68,174.07,172.84,178.7,179.94,173.77,171.3,167.28,165.43,165.43,163.89,165.74,166.98,164.81,166.67,166.67,172.53,173.15,171.6,167.28,169.44,163.89,163.58,165.12,167.9,167.9,165.43,165.74,164.2,164.2,164.81,167.9,172.53,170.99,176.85,173.15,170.68,166.98,166.36,165.74,167.59,165.74,164.81,165.12,167.59,165.74,165.74,165.74,165.74,165.74,165.74,161.73,157.41,162.65,163.27,166.67,165.74,171.6,171.91,172.22,172.22,172.84,172.84,175.62,181.17,180.25,179.63,176.85,176.54,174.69,173.77,168.21,168.21,168.21,166.67,167.59,165.74,165.74,165.43,169.44,168.83,168.83,177.78,177.78,180.56,185.8,190.43,186.73,184.57,189.51,190.74,185.8,178.4,181.48,181.48,177.78,173.15,164.2,165.12,163.58,174.07,170.37,173.46,174.69,168.83,170.06,170.68,170.99,169.75,171.91,171.91,171.91,172.22,172.22,171.3,171.3,167.59,167.59,167.59,168.52,168.52,169.14,177.78,175.62,177.16,176.85,175.31,172.22,172.53,171.91,168.83,167.28,168.83,166.36,172.53,173.15,173.46,175.31,175.31,178.4,182.41,182.41,184.57,182.72,184.88,183.64,179.94,176.54,179.32,184.57,182.72,183.64,179.01,186.73,189.2,185.8,187.65,184.57,185.8,187.65,196.91,195.37,190.43,189.51,186.42,188.27,193.21,192.9,196.6,199.69,205.86,207.1,209.26,203.7,204.94,203.7,203.4,217.28,217.9,224.07,220.37,212.65,215.12,215.74,212.35,217.59,221.6,219.14,219.44,221.91,220.99,220.99,216.05,216.05,217.59,217.9,220.37,220.68,216.98,217.9,214.81,215.12,208.64,213.27,215.43,216.36,214.51,216.36,220.68,224.07,226.54,232.72,236.11,245.06,241.36,247.84,247.84,257.72,261.42,263.58,265.74,257.1,259.88,258.95,265.43,277.01,277.01,277.01,277.01,277.01,277.01,291.36,287.96,282.72,293.21,301.54,302.16,302.78,300.93,304.32,297.84,304.94,314.81,307.1,310.19,321.3,331.79,342.9,323.77,310.49,306.17,302.16,310.49,319.44,318.21,317.28,300,310.49,301.85,297.84,310.49,292.59,298.46,306.48,317.28,319.44,310.19,311.11,319.14,322.53,324.38,334.57,337.96,334.57,333.33,331.17,336.11,323.46,317.28,333.02,332.1,328.09,341.05,344.14,342.9,342.9,361.11,368.83,370.06,370.06,396.6,426.23,428.7,435.19,428.4,429.01,428.4,424.69,433.02,444.14,459.57,460.8,448.15,461.42,470.06,469.44,469.44,492.28,501.23,495.99,495.37,464.2,516.98,521.91,491.67,489.51,513.58,511.73,517.9,551.23,559.26,559.26,559.26,559.26,586.42,586.73,595.68,617.28,628.09,672.84,668.21,668.21,602.16,531.48,591.36,580.86,535.49,579.94,586.42,579.94,566.36,582.41,598.46,643.52,618.83,615.43,575,585.49,583.33,555.86,555.86,544.14,516.05,585.34,550.62,574.69,595.99,606.48,649.69,629.63,635.8,620.37,637.35,651.23,671.3,666.67,662.04,675.93,671.3,692.9,677.47,692.9,685.19,697.53,680.56,680.56,717.59,717.59,820.99,837.96,828.7,881.17,861.11,876.54,913.58,834.88,867.28,850.31,851.85,924.38,902.78,902.78,922.84,947.53,924.38,978.4,1077.16,1112.65,1112.65,1084.88,1015.43,912.04,993.83,933.64,922.84,995.37,1040.12,1058.64,1069.44,1118.83,1092.59,1091.05,956.79,1050.93,1106.48,1047.84,996.91,1030.86,970.68,882.72,955.25,981.48,913.58,856.48,858.02,879.63,785.49,811.73,862.65,787.04,787.04,753.09,799.38,804.01,833.33,770.06,783.95,679.01,643.52,638.89,810.19,739.2,740.74,759.26,711.42,712.96,709.88,739.2,788.58,827.16,847.22,847.22,828.7,763.89,836.42,868.83,793.21,793.21,807.1,820.99,793.21,802.47,805.56,773.15,771.6,788.58,833.33,831.79,831.79,830.25,800.93,768.52,766.98,782.41,779.32,805.56,845.68,853.4,881.17,881.17,881.17,833.33,841.05,828.7,851.85,851.85,851.85,839.51,828.7,808.64,808.64,773.15,716.05,716.05,648.15,665.12,672.84,647.38],"어플라이드 머티어리얼즈":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.18,102.71,101.69,101.66,101.69,100.99,102.47,101.83,100.74,99.61,99.44,103.35,103.98,102.64,99.3,101.55,102.15,104.33,105.78,108.28,108.32,110.47,111.59,112.33,112.33,112.33,112.19,113.32,113.46,106.06,110.78,111.1,111.38,114.55,115.26,113.99,112.76,112.86,113.25,116.49,114.55,114.31,114.9,114.8,116.31,115.93,115.93,117.44,115.93,115.08,113.71,113.71,112.54,113.6,113.11,112.9,115.5,116.74,117.94,117.37,119.06,119.06,117.34,118.71,118.92,119.24,118.92,119.91,121.28,119.73,123.47,121,120.68,123.43,123.11,124.42,123.96,125.23,125.44,124.77,124.45,124.95,124.14,125.05,123.96,125.69,125.69,128.89,128.65,127.41,127.91,128.37,127.63,129.84,128.58,129.92,129.88,130.27,131.04,131.71,134.32,135.45,134.85,137.14,137.6,138.41,139.43,135.94,136.79,136.89,137.32,136.93,136.79,136.96,137.03,137.07,137.03,137.42,135.24,135.94,137.17,136.93,134.6,133.09,132.21,132.21,133.97,134.07,138.3,140.56,140.2,142.49,143.73,143.45,145.63,143.09,146.93,146.97,146.41,146.65,147.39,146.37,148.13,151.06,153.21,153.07,156.17,158.81,150.67,154.72,155.32,157.61,158.25,157.26,158.63,160.32,160.32,160.54,161.66,162.09,164.9,164.62,164.09,166.53,167.12,157.65,156.24,158.03,154.97,152.08,151.9,156.06,152.78,153.7,152.71,155.36,152.4,147.6,150.42,146.02,145.56,144.5,144.5,148.41,148.38,153.42,155.78,159.97,159.55,159.62,162.51,162.61,164.27,166.24,166.49,164.94,164.83,163.5,167.2,162.23,159.44,156.13,155.39,150.56,150.46,150.88,154.9,154.69,154.37,148.1,151.8,154.26,154.62,156.66,151.94,156.1,152.61,156.62,155.11,154.05,152.61,153.74,155.11,160.22,158.99,158.91,158.91,156.73,157.61,159.34,156.27,160.61,160.85,162.51,165.79,166.1,169.31,170.05,166.6,166.14,168.32,163.25,161.8,172.09,178.37,183.54,183.51,182.66,181.82,181.22,184.64,185.66,185.31,187.56,187.84,190.06,193.94,194.26,195,194.96,197.64,198.63,198.66,194.86,197.08,199.75,196.97,198.84,196.3,198.24,199.26,198.48,198.98,200.56,195.49,198.59,200.95,198.8,196.51,203.81,199.05,203.03,207.19,203.24,203.24,204.05,200.63,202.01,186.43,185.94,182.91,175.37,176.46,179.74,184.28,181.22,181.89,177.84,178.86,180.8,185.13,188.16,186.61,187.77,182.84,183.44,183.44,179.88,182.1,182.24,180.13,186.89,190.2,191.3,192.39,197.04,193.31,187.81,187.46,188.34,188.34,192.04,202.04,202.26,202.26,202.47,203.63,200.42,196.48,201.27,194.96,188.09,188.97,187.74,178.58,170.23,177.06,171.56,161.21,169.42,174.42,174.59,183.09,190.24,193.9,193.9,199.65,197.78,197.57,200.88,207.22,203.1,202.92,201.09,204.47,203.07,211.38,209.37,209.2,217.09,214.83,210.32,212.23,212.4,209.44,206.13,208.7,214.16,207.75,195.14,206.03,195.35,190.49,195.95,195.95,186.36,190.2,195.77,191.3,184.43,186.82,193.09,193.62,198.84,197.57,200.39,203.88,192.85,180.37,180.02,176.81,171.67,173.15,177.91,174.07,175.02,179.39,178.05,178.68,185.2,185.31,188.34,190.73,195.67,193.23,194.71,190.59,194.4,190.13,174.45,176.18,177.06,177.38,178.89,179.18,179.18,183.3,181.78,178.93,184.07,184.25,186.43,185.1,180.58,180.23,175.79,179.21,179.63,175.09,173.75,170.26,171.07,171.18,172.62,168.99,164.59,164.45,159.44,159.58,162.76,160.96,157.86,157.86,160.11,162.54,163.92,164.69,159.27,160.96,162.54,163.18,166.67,170.12,164.45,164.76,163.6,161.77,161.95,166.21,170.19,168.82,171.35,169.03,169.52,172.09,174.35,174.88,176.81,173.22,169.59,170.01,170.47,167.41,167.12,154.23,153.38,154.19,151.48,150.78,150.56,154.16,152.92,151.87,152.01,151.59,151.59,150.18,149.75,141.9,140.42,139.53,138.05,135.27,137.03,137.77,136.36,138.09,137.56,138.79,139.64,137.77,135.94,134.81,135.13,136.19,135.1,137.07,137.14,133.51,131.22,128.93,125.86,121.32,115.54,118.71,117.79,122.48,123.19,119.52,120.82,118.15,118.11,112.09,115.01,114.02,109.65,114.24,115.86,124.56,124.28,120.93,122.87,124.21,123.11,120.79,114.94,118.01,118.32,123.4,124.74,121.28,126.04,124,124,123.5,126.89,126.85,130.76,128.75,131.36,135.1,124.84,124.84,122.23,118.53,120.4,119.87,120.51,118.78,115.05,115.12,117.27,111.1,108.88,106.8,102.15,102.15,107.96,111.17,114.09,115.36,117.97,111.13,118.75,120.86,115.96,120.86,122.48,122.55,119.31,118.92,118.53,121.71,125.83,125.83,121.35,120.9,133.26,138.09,136.36,134.6,139.53,137.7,138.51,137.07,137.84,141.93,140.66,140.17,140.59,143.38,143.94,143.45,137.77,137.77,138.48,137.42,136.82,138.94,139.75,139.46,136.65,135.1,135.87,137.7,137.17,134.14,132.38,132.98,135.69,136.4,136.01,137.17,142.32,140.94,142.25,139.43,145.63,140.45,138.83,139.64,137.17,135.69,139.75,144.93,144.43,149.51,150.18,151.66,151.23,148.03,148.59,149.65,151.48,150.49,154.05,154.65,154.86,154.86,154.3,154.44,156.66,156.62,157.36,155.88,155.29,152.85,153.98,154.9,151.9,148.17,146.51,144.26,143.76,137.74,140.98,146.23,146.79,150.46,142.18,145.42,142.67,140.73,139.18,139.18,137.46,138.72,140.06,136.33,136.65,142.42,143.02,145.81,146.26,152.01,154.16,146.23,146.76,145.28,142.71,149.08,149.86,152.26,151.37,149.15,147.92,153.56,157.47,158.25,160.96,157.36,157.4,157.4,154.97,153.1,154.93,157.58,159.55,163.88,163.07,162.12,162.86,169.73,168.46,178.75,179.81,183.72,179.07,178.79,178.54,178.75,173.96,170.79,167.55,160.18,163.25,164.48,168.64,166.14,163.71,169.34,164.59,166.17,164.31,165.96,164.66,165.01,165.72,158.99,160.71,160.36,161.73,166.7,169.2,169.2,167.76,174.45,177.41,176.53,178.51,176.85,181.68,180.58,180.94,179.42,180.41,183.54,182.1,179.56,182.38,180.27,182.98,183.76,174.17,175.83,176.25,174.28,174.91,179.28,178.47,173.75,179.14,179.74,182.35,183.02,186.43,181.68,183.72,182.1,185.48,183.16,178.05,194.05,196.34,200.67,195.63,194.54,191.19,195.42,196.41,196.9,196.69,197.11,197.43,199.4,198.8,201.27,200.7,218.68,219.7,214.73,210.18,198.87,197.11,205.36,202.85,205.39,205.39,204.02,199.79,195,197.64,196.76,199.44,199.44,199.51,208.03,212.68,210.96,211.28,214.2,212.76,213.78,217.79,215.22,216.7,216.7,216.03,215.54,214.69,215.08,219.17,215.68,211.03,217.12,216.98,218.36,216.6,217.79,219.7,218.22,222.73,221.46,221.46,222.69,225.12,225.12,218.46,208.07,212.09,210.78,212.3,204.33,210.43,222.02,224.81,222.66,217.44,221.71,227.1,230.34,237.39,235.55,235.55,229.6,237.53,233.97,226.46,215.22,207.4,210.75,200.85,204.79,211.98,204.51,213.25,208.35,203.63,183.47,197.92,184.95,158.95,179.32,142.81,158.07,138.05,141.61,133.86,141.54,159.06,157.61,173.36,158.74,166.67,161.45,152.57,152.36,148.98,162.61,167.58,181.32,174.74,174.74,175.76,184.88,177.48,184.04,187.46,178.4,170.3,183.62,179.35,182.31,179.81,177.66,191.47,175.05,165.22,167.65,172.13,177.94,180.58,189.61,190.31,184.39,181.43,191.79,183.37,191.54,195.45,200.42,193.87,191.65,191.65,194.29,198.73,192.64,197.96,196.23,196.58,203.7,204.83,212.09,211.06,210.68,210.92,195.24,199.26,201.02,206.27,211.42,212.76,214.76,215.89,214.38,211.31,211.35,205.71,208.1,213,210.29,214.94,214.94,223.61,219.1,221.18,223.71,220.54,216.74,220.37,218.82,219.66,219.52,224.56,224.84,226.29,224.21,213.6,222.02,219.52,222.87,226.99,226.67,229.07,228.51,228.58,224.14,224,229.88,227.13,234.32,229.28,238.27,235.87,234.07,232.1,224.77,219.42,224.59,225.69,224.67,218.57,222.23,217.05,218.08,229.32,216.56,214.8,214.8,196.02,194.5,194.22,193.8,198.94,201.55,198.98,198.52,197.85,201.97,203.98,201.73,203.63,205.18,209.16,210.18,209.48,213.71,205.11,213.53,212.83,215.36,220.58,223.01,227.91,227.94,225.44,223.78,221.99,218.64,219.38,218.85,217.41,214.76,209.69,207.29,201.97,209.65,208.7,212.58,217.86,228.54,246.48,248.52,251.23,244.5,250.74,245.95,256.55,262.44,262.05,266.77,272.2,270.33,283.65,292.28,285.91,285.91,291.26,290.63,296.93,300.53,303.38,313.04,314.09,316.24,309.44,309.69,311.13,311.84,311.73,312.02,308.32,303.35,304.48,301.76,296.09,300.67,300.67,299.05,296.93,306.48,304.09,306.1,315.72,320.05,333.19,336.72,345.17,352.4,345.49,372.8,363.42,363.42,384.85,379.99,380.44,374.67,380.97,371.85,347.36,356.41,340.66,356.62,365.01,351.9,363.78,354.86,374.17,371.32,373.08,398.17,411.21,411.21,417.02,407.72,399.68,420.93,406.03,409.23,432.73,401.44,416.46,430.76,414.02,406.77,381.4,399.75,372.37,402.47,397.04,412.93,402.71,404.79,417.55,422.48,402.68,404.72,420.47,410.08,426.71,421.85,453.28,442.95,446.65,470.75,498.66,498.66,504.05,491.68,490.27,491.01,489.46,475.69,476.04,472.66,473.61,471.21,461.21,453.1,475.86,464.24,475.19,483.79,481.96,478.12,477.06,467.62,468.11,453.56,459.09,464.16,468.46,439.36,435.34,404.79,422.55,439.85,435.41,429.21,439.75,459.16,453.35,474.21,484.5,482.38,485.62,486.72,486.72,487,489.82,480.55,492.78,489.68,478.72,474.45,483.3,482.1,489.89,488.51,482.66,483.86,462.4,468.82,470.19,477.45,487.17,479.88,496.79,500.07,501.76,486.08,486.82,486.82,481.96,475.23,466.98,475.33,482.03,480.23,477.98,469.34,451.66,453.21,465.01,486.26,483.37,487.77,487.95,475.33,483.47,484.5,493.06,500.39,500.92,503.03,501.3,502.64,500.35,486.47,475.05,455.32,457.72,464.02,453.84,448.8,455.25,448.2,463.32,463.14,468.01,466.84,481.15,479.39,476.15,470.26,473.75,478.61,478.61,480.94,470.61,475.69,482.17,491.33,493.8,497.64,507.72,496.12,477.55,476.32,486.61,497.22,500.07,502.96,468.25,451.97,453.59,455,441.16,451.27,445.81,450.6,444.75,449.26,446.65,451.76,465.36,463.67,469.63,474.28,472.09,469.84,478.96,478.37,465.12,465.68,479.28,481.5,491.58,497.57,503,529,540.13,538.97,550.7,529.95,542.28,552.57,550.63,556.24,549.61,559.34,528.65,519.91,524.74,525.05,525.05,504.9,532.84,518.64,534.43,516.17,513.85,519.31,552.82,554.23,537.88,538.16,518.32,520.54,541.44,516.91,514.98,510.96,533.54,536.72,547.89,547.89,573.36,562.51,567.23,556.66,554.48,563.53,558,541.72,550.88,531.4,527.1,537.17,562.19,553.84,588.44,588.44,536.86,504.12,490.31,475.9,490.8,468.6,477.73,458.6,466.7,486.89,488.41,495.98,481.01,477.7,479.67,488.9,508.1,492.49,466.84,464.62,492.74,496.69,480.87,469.87,469.87,458.99,450.53,470.12,478.22,472.87,456.69,469.27,460.32,443.06,420.08,437.46,453.21,440.35,435.66,423.29,438.37,459.76,465.08,476.18,472.87,477.38,463.07,488.34,482.95,485.06,498.38,478.51,464.41,448.94,456.1,428.86,420.47,431.29,422.69,409.58,403.66,411.77,399.44,399.44,404.76,412.47,415.4,407.65,397.46,403.35,383.79,383.4,403.91,388.83,398.06,400.99,418.64,399.82,396.41,372.62,377.66,366.17,376.18,394.15,389.29,411.7,392.32,390.2,375.12,387.35,375.58,382.42,405.46,421,421,413.28,403.31,413.42,405.07,405.21,407.58,396.26,377.87,358.99,339.39,340.45,343.27,315.68,316.53,316.53,335.34,331.01,328.68,343.06,343.94,334.81,323.96,320.58,303.98,303.98,303.03,305,319.77,321.32,312.26,312.65,313.88,323.01,332.88,328.19,346.12,360.22,365.89,358.25,355.88,348.52,364.55,370.54,373.43,374.91,369.94,384.11,391.33,386.26,379.95,351.16,370.16,371.85,388.94,386.82,382.28,373.5,381.5,368.68,355.21,359.16,357.58,369.98,348.13,340.17,333.05,331.47,323.5,321.49,321.49,318.15,323.96,330.48,340.06,339.32,318.5,319.38,313.32,313.14,316.14,310.5,306.87,299.65,297,292.25,296.51,303.03,297.46,288.69,303.91,315.05,314.38,310.5,291.05,279.03,268.85,267.83,279.84,263.64,262.19,265.08,272.23,277.17,290.42,299.3,308.42,310.57,304.93,316.14,311.1,316.38,309.23,304.09,323.11,334.88,343.41,332.56,369.24,389.46,379.18,389.22,367.23,368.04,368.92,370.47,377.17,379.39,379.39,372.87,364.59,363.81,386.19,377.06,376,375.02,368.96,373.89,382.7,378.22,385.38,394.19,386.33,368.43,369.03,366.42,364.69,373.15,343.9,342.57,342.57,335.94,332.03,342.28,343.13,343.13,340.84,349.93,345.03,367.41,375.23,380.69,387.81,388.3,387.49,387.49,385.52,386.54,374.07,386.36,402.26,398.13,401.52,407.26,396.41,381.25,392.85,419.34,437.84,422.76,414.69,424.67,408.56,409.02,404.4,410.61,417.34,420.93,406.59,406.77,406.77,392.11,389.04,397.85,392.21,394.89,409.27,413.18,417.37,419.17,417.69,410.04,418.08,412.4,403.07,408.17,424.03,417.48,432.8,431.99,437.07,424.24,418.82,432.63,421.18,418.85,410.15,422.3,430.27,432.8,431.01,423.26,413.39,403.28,403.28,410.5,410.08,398.73,399.82,397.82,393.9,392.07,388.79,403.07,399.79,400.32,389.75,388.69,393.52,398.27,397.99,395.21,399.19,396.23,408.95,407.86,401.13,406.66,406.84,409.06,426.74,426.07,442.92,457.79,447.32,445.91,438.65,428.93,459.73,479.42,479.42,481.22,469.7,475.09,474.38,471.21,471.95,475.72,479.92,479.63,493.34,499.61,497.43,493.69,489.53,489.53,488.09,481.57,489.5,479.46,492.6,516.38,507.51,508.21,509.3,512.58,512.58,501.27,494.64,491.79,495.28,484.71,489.39,502.64,502.96,512.69,509.2,499.58,472.3,480.62,487.49,493.52,489.85,514.94,535.34,534.14,537.81,519.13,520.82,513.25,529.88,521.53,511.49,509.55,489.18,499.96,493.59,487.14,484.81,502.68,524.21,520.97,521.49,502.18,508.67,512.4,528.47,531.89,538.27,542.6,542.6,541.26,539.75,522.3,519.84,516.95,507.29,509.44,509.41,487.14,494.26,485.24,482.63,476.36,479.81,481.29,472.45,475.9,487.03,487.84,491.58,481.75,490.84,490.77,494.33,493.83,498.24,500.99,510.92,497.32,496.83,502.89,498.41,473.68,472.59,472.97,475.33,458.46,461.03,462.65,461.7,466.35,476.71,488.05,492.42,494.57,499.44,508.21,504.47,530.94,527.63,542.92,547.46,545.49,523.57,537.6,525.9,526.71,526.71,529.74,531.4,521.71,526.29,527.77,534.14,522.45,514.98,509.87,522.87,520.51,546.65,553.98,553.17,569.91,570.65,565.05,571.99,552.92,568.68,571,571,578.86,578.61,574.77,571.07,543.94,533.65,526.11,525.02,534.04,532.17,527.87,535.41,532.95,532.95,541.79,540.42,564.98,591.75,593.02,588.62,613.6,608.28,588.09,593.66,585.76,578.93,588.34,592.6,602.85,594.43,602.18,612.72,654.83,653.77,635.34,656.06,661.24,703.21,703.21,666.46,670.65,703.77,694.71,717.23,714.8,696.05,710.43,740.84,738.16,730.76,747.6,749.15,724.31,709.55,722.13,706.69,707.36,699.96,707.29,709.44,722.55,742.78,740.84,734.53,728.22,732.91,726.67,726.67,735.34,726.25,730.73,716.67,732.38,736.58,741.4,737.32,750.46,732.42,724.74,738.13,704.33,684.71,668.68,667.58,680.9,690.84,695.91,716.63,723.26,699.96,683.54,697.36,719.13,735.94,730.51,730.66,727.03,739.01,728.08,739.32,766.35,754.16,747.29,775.02,774.49,768.68,767.97,778.33,778.33,779.85,771.85,763,757.86,754.79,747.78,787.07,781.36,781.29,803.95,810.32,837.39,837.03,835.2,855.74,873.26,873.26,845.63,829.49,809.87,825.48,818.08,819.34,831.54,836.54,848.7,857.33,857.33,854.79,867.83,886.08,898.41,850.11,857.65,865.22,866.24,775.44,766.91,740.87,787.42,773.96,727.73,712.9,727.52,724.35,693.23,747.71,691.68,640.63,640.91,645.91,629,671.42,673.64,680.37,707.54,710.47,746.41,732.56,743.27,726.43,736.86,705.43,714.13,691.44,689.82,679.67,679.99,695.07,695.07,646.12,642.64,635.1,615.75,625.62,627.38,655.18,645.56,664.09,660.96,664.52,655.88,693.13,677.1,683.72,693.38,695.24,738.58,722.06,711.95,694.86,708.77,703.28,711.66,705.18,707.82,722.55,718.68,722.55,753.66,673.08,650.42,645.67,656.66,649.96,644.82,643.76,647.46,657.22,653.07,669.91,652.92,639.82,646.16,640.66,657.08,660.75,683.9,676.64,664.41,657.54,644.08,655.39,595.07,601.59,596.58,600.74,619.27,616.21,615.05,610.29,603.66,603.66,615.61,645.77,645.38,638.34,606.17,609.65,605.57,592.57,603,595.77,596.72,596.93,600.21,582.98,568.85,576.43,590.06,593.27,593.27,590.38,587.84,576.6,573.04,577.41,599.22,625.37,626.57,623.64,623.64,604.83,602.04,611.87,628.54,657.08,676.71,676.71,679.6,688.9,671.95,658.03,615.12,609.06,617.62,640.31,635.48,630.02,629.18,636.61,644.12,634.25,647.15,645.53,637.39,649.3,596.19,596.19,606.06,613.32,620.19,605.99,593.97,583.3,593.76,551.94,556.98,536.05,538.65,547.29,533.97,548.56,528.51,517.94,525.23,528.37,548.48,547.78,540.91,544.26,543.97,536.01,545.98,541.37,530.94,520.37,511.13,511.35,513.25,520.61,477.48,447.32,468.11,454.4,527.59,487.1,510.71,509.27,512.51,486.93,484.36,484.36,477.66,487.32,505.92,529.14,534,531.32,526.96,531.04,524.88,546.51,544.79,539.22,549.01,549.68,548.31,591.93,609.69,613.6,615.75,583.4,584.71,583.97,571.63,565.61,555,555,570.23,569.38,561.95,552.33,554.16,569.91,570.58,578.54,587.53,598.27,612.3,608.84,616.63,601.09,622.09,613.42,609.02,609.02,597.11,605.92,634.88,645.07,646.65,645.56,645.07,647.5,669.52,673.19,673.19,672.23,687.07,688.48,697.78,697.43,694.5,702.22,686.43,678.37,671.04,678.68,659.41,658.95,662.86,654.3,670.44,663.88,667.34,634.46,634.21,644.19,631.25,627.7,645.35,651.41,649.68,664.02,669.59,663.28,569.98,576.22,571.6,567.16,563.21,572.55,570.79,579.67,579.25,582.35,566.46,566.46,555.21,550.56,557.58,573.47,571,576.11,575.83,599.54,591.26,602.29,611.49,627.66,668.64,669.84,706.55,707.79,709.8,703.31,718.53,722.16,721.42,767.23,787.84,766.49,788.97,745.45,766.42,776.25,739.78,773.36,768.82,801.9,802.4,792.78,803.84,796.34,777.17,805.04,806.03,815.12,802.11,830.69,819.42,821.35,837.6,811.1,848.8,822.87,810.68,828.33,805.74,813,786.58,796.37,805.88,793.23,828.51,776,789.32,813.64,854.33,880.8,880.8,888.83,897.64,934.92,946.55,949.4,944.33,944.89,941.3,969.52,951.76,913.35,920.61,912.05,874.81,893.23,903.49,912.65,916.95,918.89,918.89,922.83,926.89,916.03,905.53,947.39,1001.83,1043.02,1029.6,992.39,1061.24,1082.59,1074.24,1063.74,1124.31,1152.26,1152.26,1121.32,1146.02,1123.29,1135.94,1125.65,1172.34,1186.58,1202.75,1135.73,1157.15,1122.87,1048.63,1071.14,1136.4,1164.8,1159.51,1197.6,1157.12,1250.56,1250.56,1265.43,1301.27,1303.14,1322.69,1316.24,1331.68,1391.65,1323.89,1311.84,1311.42,1237.91,1260.61,1221.04,1144.26,1194.29,1218.75,1237.03,1188.41,1203.42,1219.8,1241.93,1231.4,1258.67,1258.14,1274.81,1317.79,1301.41,1192.92,1188.06,1138.55,1204.33,1246.65,1227.87,1227.87,1242.49,1248.45,1359.13,1401.73,1407.65,1394.4,1394.08,1389.22,1373.85,1398.66,1379.92,1389.46,1421.71,1423.22,1469.49,1426.57,1342.88,1348.1,1390.03,1370.97,1379.07,1447.57,1510.29,1446.93,1534.32,1563.14,1519.38,1538.44,1552.36,1538.48,1457.26,1433.79,1504.05,1505.85,1522.76,1522.76,1602.85,1579.46,1584.5,1585.84,1614.41,1726.74,1764.52,1767.79,1596.23,1734.21,1759.02,1751.27,1947.29,1998.77,2064.06,2002.22,2089.22,2174.45,2174.45,2255.74,2064.41,2075.3,2353.77,2208.74,2447.64,2547.57,2293.55,2124.88,2124.88,2088.76,1953.84,2010.22,2074.21,2122.97,2027.45,2099.01,2041.68,1976.5,1866.31,1852.36,1989.25,1951.8,1983.09,1889.53,1821.32,1678.86,1537.88,1768.04,1788.83,1825.97,1926.07,1882.45,1858.63,1899.72,1839.75,1852.04,1931.47,1883.51,1787.1,1886.22,1812.3,1748.31,1748.45,1734.74,1706.1,1691.47,1690.49,1699.65,1626.74,1615.19,1556.91,1544.96,1535.98,1602.22,1602.22,1665.93,1652.04,1599.75,1608.49,1494.75,1484.04,1463.64,1470.75,1566.49,1635.8,1664.76,1671.53,1671.07,1708.95,1715.15,1804.12,1801.9,1865.05,1902.89,1910.78,1868.46,1834.57,1795.53,1786.58,1753.1,1635.8,1573.75,1515.19,1442.18,1455.64,1455.64],"테슬라":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.5,101.84,101.63,101.58,102.47,100.44,99.31,95.83,94.43,94.13,95.71,97.04,97.91,95.46,93.09,94.71,91.14,92.3,92.38,94.76,92.93,92.68,96.02,97.01,97.01,98.77,98.5,95.21,95.13,91.35,91.15,93.82,93.35,97.01,96.58,96.52,96.65,99.52,99.79,99.24,101.7,101.82,104.87,104.32,104.7,107.15,107.15,110.26,110.37,107.83,107.33,107.33,108.99,114.01,113.89,115.02,116.16,115.45,115.38,115.31,119.41,119.41,118.32,119.72,122.43,122.92,125.02,127.88,127.81,126.83,127.05,125.88,126.53,125.18,126.34,126.23,129.47,129.32,131.63,135.21,135.22,140.93,141.13,140.51,135.08,136.73,136.73,139.32,137.37,128.57,129.08,123.67,125.56,125.58,125.81,126.35,126.17,124.86,123.99,123,122.4,123.64,129.58,128.44,131.62,131.34,131.55,125.91,128.08,127.97,132.17,135.72,139.35,139.32,139.59,139.78,149.93,152.54,148.17,150.03,151.95,156.9,155.05,149.09,152.69,152.69,151.4,150.8,153.45,151.94,153.49,154.71,157.6,155.79,155.01,157.74,162.14,160.17,156.21,148.4,154.87,154.29,161.36,163.35,162.28,163.14,158.65,159.22,153.75,157.24,156.12,155.88,152.62,155.81,159.13,163.3,163.3,168.31,171.28,170.95,170.69,174.45,177.22,180.64,185.84,179.47,180.32,188.82,191.19,188.52,186.54,185.74,186.96,189.05,192.17,192.59,189.6,182,186.46,181.19,181.62,177.11,177.11,164.28,155.11,157.32,158.74,164.35,165.5,162.44,164.63,160.51,164.86,163.37,165.71,164.94,172.03,170.57,172.7,167.99,168.29,162.47,160.51,163.68,174.33,179.26,178.39,183.44,182.59,178.5,179.74,182.72,181.98,182.28,176.76,174.52,169.69,171.45,177.18,177.26,174.81,173.61,174.47,177.39,178.75,178.5,178.5,175.59,173.04,176.1,172.48,182.67,182.19,183.94,189.67,190.76,193.37,188.4,187.8,184.07,176.34,173.27,173.41,171.26,170.57,171.32,171.54,174.86,178.31,178.47,179.25,172.25,178.6,178.1,178.64,178.59,176.09,178.68,180.64,176.7,173.33,169.27,169.43,163.66,163.82,161.16,160.76,166.51,161.27,150.31,153.74,152.07,153.72,152.88,152.18,152.18,158.41,155.05,156.35,156.96,158.24,155.07,159.62,157.01,157.01,158.49,159.12,159.49,154.47,155.12,153.96,153.29,152.54,157.34,156.32,158.28,165.2,171.29,170.28,169.71,172.5,170.2,166.3,165.23,166.58,163.34,163.34,159.36,156.52,158.39,156.38,160.99,159.34,158.02,159.01,168.97,167.6,168.16,169.74,168.87,168.87,170.8,174.36,173.06,175.8,176.57,177.19,173.73,169.58,172.2,175.56,173.69,177.96,175.41,172.65,167.32,167.74,173.28,158.33,155.91,158.58,162.56,161.88,167.79,168.5,168.5,168.14,167.4,173.87,176.82,179.52,176.29,172.31,166.21,168.32,167.43,164.84,166.9,165.29,164.32,173.54,171.69,164.05,163.54,161.4,157.49,155.98,158.98,155.25,151.45,152.78,140.22,129.47,133.67,133.67,126.81,134.37,144.12,153.55,150.33,145.48,153.04,151.15,147.7,150.85,146.26,144.5,147.34,150.72,145.78,142.33,142.37,140.98,143.39,147.7,147.61,150.64,151.26,142.87,147.71,152.07,151.67,154.12,153.2,151.21,146.64,142.73,143.89,142.91,139.04,142.89,138.13,140.17,139.55,140.06,140.06,142.52,146.52,143.01,146.57,149.04,146.22,160.47,158.76,159.55,166.8,172.16,173.17,179.67,179.89,186.25,177.07,181.93,174.54,167.57,167.26,171.77,173.03,175.76,172.25,168.29,156.13,156.13,155.28,155.15,159.97,161.96,160.2,159.07,160.16,155.75,162.07,162.66,160.84,157.5,152.29,149.39,155.07,154.02,149.26,145.74,149.74,151.1,175.56,174.87,171.77,190.64,186.01,177.02,178.55,179.01,174.61,170.11,168.48,153.44,154.92,161.68,161.55,160.77,162.14,160.36,156.63,153.19,152.26,151.51,151.51,145.13,141,141.11,132.21,143.4,140.35,145.93,145.38,148.27,148.09,143.12,150.19,149.84,150.23,150.52,151.18,155.49,154.46,132.98,156.05,151.19,148.07,141.55,131.57,125.85,131.99,129.02,126.69,129.97,130.38,138.92,136.5,132.55,130.59,131.06,147.73,144.9,158.14,166.2,168.18,165.7,169.42,172.92,173.99,171.47,171.3,174.87,176.49,176.05,166.39,170.13,172.78,175.01,177.96,177.53,174.53,169.86,169.86,163.65,173.78,172.74,174.72,171.36,176.03,180.06,180.66,180.66,182.35,179.79,183.4,184.21,184.13,189.25,183.68,175,169.28,167.24,158.4,160.61,148.36,148.36,163.78,158.78,167.69,167.15,155.76,150.86,159.56,168.24,168.43,170.03,173.26,174.41,167.96,172.99,173.81,174.44,151.81,151.81,150.14,144.45,146.41,149.19,148.86,149.4,155.08,154.2,156.81,157.15,161.4,159.33,154.45,153.59,157.13,156.61,154.78,152.57,154.64,154.64,153.51,151.96,146.27,148.02,150.06,149.6,158.08,160.66,148.06,143.32,138.9,138.74,138.92,142.71,146.12,142.32,145.13,145.64,138.34,135.35,134.34,137.42,137.63,132.86,130.8,134.49,138.04,139.94,140.56,145.24,143.59,146.56,134.5,138.1,137.22,136.77,138.65,134.82,134.46,133.79,137.3,136.23,137.25,137.25,131.97,132.55,129.91,124.37,118.1,121.28,119.88,117.53,122.6,128.09,128.25,124.09,122.97,121.54,120.3,114.02,116.68,116.5,114.68,105.99,103.14,103,96.8,98.19,95.75,95.75,94.78,95.36,94.54,93,89.89,97.24,98.74,103.44,102.71,106.92,109.04,105.1,107.44,107.95,113.02,112.88,113.73,110.31,111.43,112.33,110.38,110.13,111.92,112.24,114.1,112.78,117.98,117.98,117.08,115.69,115.55,120,119.84,123.09,127.32,126.76,128.01,127.34,129.67,128.42,130.67,133.04,114.93,114.54,118.42,121.68,121.35,117.45,117.7,114.68,115.9,117.24,119.69,118.04,115.02,118.03,110.31,108.31,110.47,113.93,113.44,110.91,111.58,106.18,107.99,107.52,108.28,111.36,113.31,113.31,113.01,110.84,115.31,114.24,116.42,118.3,124.11,123.49,123.15,121.95,122.95,122.3,123.86,120.85,121.16,112.11,114.87,121.83,121.61,120.98,122.9,122.11,117.04,116.24,119.4,120.57,122.82,122.92,124.51,129.06,129.53,130.46,131.58,129.06,127.32,128.37,127.92,150.52,164.81,164.6,158.82,158.22,158.17,157.36,159.45,159.33,164.03,168.53,169.33,173.32,175.76,173.84,175.46,176.88,175.79,180.57,176.91,178.22,167.27,168.93,165.2,166.39,166.39,165.72,168.19,168.86,167.27,165.93,168.7,170.53,175.21,177.15,180.65,180.01,191.61,190.35,197.46,202.93,203.71,210.56,213.59,213.59,216.44,216.16,208.29,210.11,216.1,222.51,226.79,235.59,247.18,241.76,240.16,263.62,270.18,260.42,257.91,256.4,256.4,274.84,286.07,287.39,283.69,280.27,284.73,291.81,321.85,326.76,391.76,445.53,369.01,376.17,375.73,387.38,388.94,385.38,403.82,401.82,401.82,431.14,460.78,451.74,452.54,418.78,401.76,391.16,341.03,335.5,373.49,374.44,376.44,363.91,353.33,305.37,324.12,318.55,281.54,274.55,223.54,216.07,181.43,214.79,214.73,218.13,253.64,270.84,265.27,258.34,252.2,263.18,241.87,228.26,241.09,259.29,273.96,275.66,287.8,287.8,326.95,356.55,366.56,374.29,378.65,374.87,344.91,367.71,354.41,364.21,401.18,386.3,402.06,392.71,352.25,382.32,385.84,393.06,391.78,411.56,407.48,406.53,397.27,403.48,401.39,408.65,405.83,409.62,415.67,410.29,410.29,411.29,411.97,404.73,419.39,451.08,442.77,443.48,434.14,444.83,477.11,472.46,514.84,488.62,469.75,497.69,493.28,498.14,504.25,502.71,499.41,503.15,482.6,495.22,482.04,506.96,542.35,562.35,607.06,607.06,688.89,698.07,686.03,700.29,775.82,751.91,761.83,776.5,753.71,753.81,825.21,787.72,799.76,759.95,711.7,773.28,741.58,752.94,747.11,718.61,745.86,746.86,745.87,748.16,729.64,712.49,690.3,780.89,814.16,829.09,921.97,947.81,943.51,1005.44,1029.62,1011.65,1016.24,1081.45,1124.44,1111.7,1251.43,1192.99,1123.48,1022.1,1050.53,1050.53,829.26,919.84,932.55,936.01,1053.79,1129.48,1109.39,1063.36,1110.37,1128.55,1065.37,955.2,973.86,1022.95,1057.76,1052.41,1077.37,1125.46,1042.42,1069.01,1039.63,1068.06,1069.61,1089.9,1110.75,1121.67,1158.46,1127.27,1104.14,1081.94,1059.62,1061.38,1069.29,1056.33,1055.45,1066.5,1019.64,1031.72,974.49,1005.8,1064.54,1057.21,1100.18,1079.73,1057.91,1030.54,1047.54,1034.05,1025.87,1024.84,1109.02,1222.1,1253.82,1229.56,1310.52,1394.73,1441.49,1441.49,1471.02,1425.41,1468.51,1428.48,1490.16,1504.37,1611.65,1632.04,1518.03,1574.76,1531.87,1606.81,1590.28,1563.96,1647.16,1745.35,1631.99,1608.09,1622.25,1661.9,1661.9,1666.73,1672.5,1744.8,1772.15,1832.67,1846.08,1898.49,2049.32,2210,2037.14,2133.2,2145.68,2122.05,2074.74,2074.74,2120.92,2135.74,2122.02,2126.17,2211.95,2217.7,2170.17,2098.02,1992.79,2109.02,2191.84,2146.38,2134.58,2140.21,2168.31,2133.25,2021.15,2038.32,2049.52,2049.52,1999.55,2004.39,1977.35,1962.08,1794.32,1755,1863.44,1713.26,1696.38,1804.19,1723.86,1640.38,1560.62,1501.63,1413.86,1691.56,1677.7,1756.91,1742.16,1777.85,1699.85,1762.46,1640.28,1644.58,1682.57,1662.88,1582.8,1608.21,1553.77,1535.13,1596.23,1677.37,1661.85,1661.85,1735.43,1736.87,1685.01,1717.23,1700.2,1762.88,1914.42,1838.85,1855.47,1857.81,1794.65,1805.6,1868.71,1807.36,1831.74,1853.84,1769.81,1743.85,1700.15,1781.62,1719.99,1691.61,1684.93,1666.35,1688.52,1579.71,1549.98,1481.39,1435.69,1481.01,1448.59,1451.21,1415.02,1473.58,1458.76,1522.95,1518.56,1554.82,1584.25,1570.12,1570.12,1566.8,1519.64,1438.57,1504.39,1519.66,1515.8,1503.72,1532.19,1531.62,1551.21,1505.17,1519.01,1548.47,1565.32,1559.09,1566.32,1648.84,1707.23,1687.27,1729.58,1709.59,1706.93,1702.46,1704.92,1704.92,1656.4,1618.91,1639.4,1649.8,1722,1678.91,1640.83,1633.85,1617.83,1622.85,1658.71,1645.63,1630.49,1615.72,1651.48,1619.24,1624.76,1701.03,1725.77,1782.2,1782.37,1785.33,1794.65,1755.65,1792.47,1783,1777.55,1813.79,1801.03,1723.18,1671.8,1730.26,1691.29,1708.34,1773.73,1779.23,1786.04,1760.82,1787.85,1835.54,1847.61,1843.52,1839.25,1842.22,1842.22,1890.81,1893.19,1895.68,1849,1865.9,1869.64,1898.12,1901.03,1907.31,1833.68,1856.81,1888.35,1892.62,1944.73,1987.34,1952.69,1962.1,1947.46,1946.81,1962.66,1960.3,1965.72,1992.99,1972.6,1988.8,2023.41,2036.87,2055.05,2117.1,2185.11,2170.44,2174.28,2245.1,2284.48,2573.73,2557.58,2606.38,2704.77,2797.59,3035.13,2943.24,3048.37,3088.67,3069.04,2920.49,2570.32,2681.94,2670.79,2595.23,2544.93,2648.74,2734.83,2753.34,2855.5,2905.25,2785.11,2802.61,2802.61,2717.03,2855.32,2874.84,2749.87,2723.76,2548.9,2533.93,2641.26,2684.48,2520.84,2554.07,2426.95,2407.11,2451,2327.78,2341.96,2260.02,2356.93,2533.58,2679.56,2679.56,2747.21,2733.48,2727.75,2687.95,2653.89,3013.01,2886.97,2732.6,2673.78,2579.01,2657.26,2673.03,2778.05,2590.56,2635.89,2635.89,2587.92,2500.38,2501.93,2370.42,2335.51,2306.38,2354.12,2082.12,2125.44,2352.39,2338.65,2274.38,2237.92,2318.73,2278.6,2315.42,2340.53,2271.6,2159.72,2199.3,2316.5,2318.91,2200.78,2152.13,2152.13,2063.11,1918.73,2010.97,2033.83,2185.91,2170.69,2209.67,2107.71,2105.2,2020.54,2070.32,2157.13,2105.22,1997.36,1924.59,2013.79,2110.07,2188.85,2273.71,2313.31,2496.18,2509.07,2546.26,2538.02,2741.94,2761.35,2747.34,2706.18,2723.73,2876.57,2740.48,2626.22,2655.1,2575.31,2450.85,2478.53,2567.48,2473.63,2473.63,2522.07,2581.99,2454.04,2533.35,2523.98,2506.33,2200.95,2213.74,2203.69,2186.74,2267.55,2283.4,2392.32,2193.07,2173.91,1976.67,2009.14,1843.29,1828.23,1932.67,1819.11,1912.63,1782.55,1781.57,1667.25,1694.88,1577.5,1654.45,1777.32,1907.66,1907.66,1904.22,1859.29,1946.26,1766.83,1795.18,1799.75,1822.2,1805.93,1749.6,1625.34,1664.16,1755.4,1605.47,1633.05,1633.05,1785.81,1778.65,1770.99,1851.13,1845.2,1752.86,1721.42,1691.16,1712.18,1712.18,1755.9,1745.86,1842.37,1889.23,1765.52,1755.93,1785.84,1795.43,1808.64,1812.26,1849.8,1864.64,2047.01,2051.05,2022.35,1950.23,2070.47,2116.27,2238.7,2239.65,2264.59,2315.9,2325.21,2171.04,2188.02,2134.61,2217.65,2159.44,2260.4,2330.39,2309.62,2290.28,2281.79,2235.06,2184.18,2233.45,2238.3,2230.56,2170.44,2145.81,2092.16,2076.42,2088.1,2035.74,2035.74,2067.45,2137.37,2179.26,2257.76,2293.47,2200.88,2279.83,2288.42,2285.41,2328.5,2325.94,2266.2,2174.21,2074.31,2079.43,2131.64,2168.33,2020.67,1998.37,1826.22,1879.26,1814.24,1794.05,1680.59,1679.76,1631.09,1636.67,1670.42,1544.37,1652.56,1658.89,1672.83,1561.63,1615.57,1591.54,1675.69,1692.42,1695.81,1721.65,1714.26,1716.37,1619.64,1622.12,1563.06,1484.78,1441.24,1337.95,1436.87,1476.42,1438.6,1464.74,1408.24,1379.98,1357.53,1264.72,1280.09,1380.21,1380.21,1377.65,1378.1,1362.36,1466.85,1466.85,1468.06,1374.56,1354.75,1311.2,1306.68,1348.95,1264.34,1212.58,1181.32,1187.87,1131.82,1129.11,1038.17,1036.44,944.37,927.8,927.8,821.95,849.15,917.78,928.03,928.03,814.41,856.15,831.29,851.78,902.34,895.4,928.33,930.89,922.15,922.15,990.63,970.22,958.09,1005.17,1083,1084.05,1088.12,1207.46,1340.28,1255.6,1305.02,1366.73,1418.41,1431.29,1467.3,1482.75,1516.5,1561.93,1483.35,1466.4,1576.47,1614.06,1522.15,1569.39,1569.39,1486.97,1513.26,1522.38,1483.27,1564.26,1549.8,1527.65,1438.22,1490.13,1460.15,1414.19,1371.17,1302.76,1306.68,1314.52,1380.66,1359.49,1387.22,1357.08,1380.59,1488.55,1440.11,1448.17,1434.53,1445.08,1425.34,1460.67,1471.22,1562.98,1467.38,1450.88,1397.69,1394.22,1394.22,1390.08,1407.26,1360.17,1400.55,1393.77,1409.14,1388.57,1360.55,1227.95,1243.7,1224.64,1210.47,1158.34,1206.86,1237.9,1219.21,1207.76,1210.02,1214.47,1281.22,1294.25,1274.36,1269.76,1296.43,1265.54,1253.26,1254.55,1309.84,1332.67,1357.16,1422.93,1399.57,1377.95,1389.78,1455.32,1455.32,1515.52,1536.39,1563.44,1612.03,1639.45,1667.33,1691.89,1769.41,1841.29,1882.19,1949.1,1934.63,1927.93,1962.88,1962.88,2067.68,1954.75,1993.55,1933.2,1816.05,1885.06,1930.49,1939.98,1972.15,2108.14,2108.14,2128.18,2083.43,2067.53,2031.22,2032.57,2049.15,2093.67,2119.89,2187.69,2210,2194.32,1980.66,1958.97,2027.07,1998.59,1991.59,1926.49,2007.33,2014.79,1966.88,1914.44,1953.69,1912.56,1894.4,1881.22,1824.64,1848.37,1828.1,1806.33,1755.1,1699.65,1651.58,1623.48,1742.44,1756.83,1784.48,1733.1,1797.51,1799.25,1937.57,1935.46,1944.35,1845.88,1845.88,1932.37,1897.94,1894.7,1872.17,2061.13,2015.17,2043.95,2079.66,2067.23,1998.59,2007.79,1978.33,1926.42,1844.9,1860.8,1839.18,1811.9,1856.2,1885.13,1895.53,1857.33,1967.55,1959.19,1962.81,1956.33,1986.09,1981.34,1950.3,1891.91,1913.01,1920.02,1828.33,1658.29,1597.11,1597.79,1631.24,1600.35,1550.18,1561.78,1486.89,1513.11,1549.42,1646.23,1657.16,1651.96,1673.88,1673.36,1581.97,1617.15,1685.41,1788.62,1829.53,1759.84,1765.19,1774.99,1817.18,1764.52,1764.52,1773.86,1778.6,1858.76,1839.33,1808.74,1799.32,1774.84,1798.49,1803.39,1828.03,1837.07,1806.18,1785.61,1802.79,1891.39,1909.84,1899.15,1937.87,1861.93,1917.38,1902.61,1902.61,1933.27,1969.66,1907.43,1872.02,1871.57,1796.46,1792.54,1789.23,1811.53,1770.17,1762.48,1711.85,1649.1,1649.1,1656.78,1623.93,1596.28,1598.62,1573.08,1575.64,1565.77,1375.92,1380.59,1438.45,1443.42,1411.02,1422.85,1415.7,1364.09,1394.53,1413.21,1428.13,1458.34,1417.35,1386.39,1421.72,1510.17,1506.4,1506.4,1459.77,1467.38,1487.27,1446.28,1502.26,1504.75,1522.15,1520.94,1526.67,1417.43,1361.68,1330.04,1345.93,1320.99,1339.3,1337.57,1276.85,1224.26,1232.32,1309.39,1290.71,1323.41,1302.01,1287.02,1300.58,1338.55,1354.82,1324.38,1324.38,1320.09,1255.37,1268.56,1289.13,1242.34,1303.21,1332.6,1294.02,1315.42,1288.67,1216.57,1183.65,1171.15,1129.56,1107.86,1070.19,1090.01,1221.47,1282.12,1267.88,1461.95,1380.81,1356.03,1356.18,1365.07,1391.96,1339.6,1316.32,1295.61,1269.24,1295,1337.64,1310.82,1317.23,1336.97,1318.06,1405.83,1356.93,1308.94,1350.38,1350.38,1331.62,1327.4,1346.99,1341.64,1328.15,1316.7,1318.43,1340.58,1337.12,1309.32,1285.74,1335.69,1374.71,1341.11,1412.15,1392.72,1392.72,1367.93,1378.78,1375.54,1411.48,1479.43,1487.34,1490.81,1581.06,1742.29,1856.28,1856.28,1894.93,1905.63,1976.37,1983.38,1815.9,1870.14,1903.37,1932.9,1872.17,1877.67,1802.11,1894.85,1856.2,1627.25,1659.34,1655.95,1748.62,1677.2,1748.39,1633.8,1564.57,1498.34,1511.6,1444.7,1498.04,1506.78,1487.87,1565.77,1517.18,1613.31,1628.23,1677.95,1665.75,1682.09,1587.09,1659.87,1606.3,1576.17,1550.1,1554.09,1613.08,1613.08,1586.64,1653.01,1734.08,1587.62,1629.36,1703.94,1718.71,1731.37,1734.98,1708.54,1716.75,1711.7,1837.67,1794.95,1883.48,1915.65,1936.36,1915.27,1962.28,1971.1,1943.9,1876.09,1813.11,1884.08,1814.39,1842.04,1816.05,1798.87,1640.88,1651.13,1654.22,1667.48,1664.16,1662.73,1648.79,1642.16,1609.62,1962.43,2028.05,1977.72,1955.2,1940.36,1882.35,1875.79,1829.53,1894.32,2173.76,2236.89,2420.04,2636.87,2474.81,2488,2344.4,2416.27,2552.03,2606.73,2576.82,2558.81,2656.15,2550.9,2548.19,2507.96,2507.96,2600.4,2690.28,2647.56,2696.61,2783.7,2932.35,2936.64,3021.02,3200.18,3149.92,3286.51,3488.35,3615.22,3315.9,3286.06,3172.23,3244.1,3482.77,3482.77,3421.37,3252.08,3144.73,3042.49,2857.46,3092.22,3096.81,2971.07,2975.44,2975.44,2973.93,3038.5,2986.14,3226.17,3117.68,3213.21,3213.21,3194.9,3127.4,3106.83,3063.13,2992.09,2999.17,2931.44,3015.67,3048.22,2890.61,2954.87,2849.1,2820.09,2724.41,2642.37,2474.89,2535.23,2681.62,2680.86,2680.86,2667.83,2716.42,2670.02,2544.95,2490.18,2281.27,2190.86,2124.18,2207.28,2144.53,2049.52,2102.71,1984.81,1978.93,1673.66,1737.17,1869.09,1813.26,1883.33,1793.14,1697.46,1776.95,1779.96,1873.76,2097.36,2170.82,2049.67,2057.73,1985.56,1952.49,2022.55,2130.29,2013.66,1803.84,1757.58,1671.47,2050.73,1901.56,1900.88,1901.18,1914.44,1819.81,1818.46,1818.46,1713.96,1792.84,1889.05,1955.12,2146.79,2153.79,2200.13,2125.77,2113.41,2163.81,2111.45,2074.46,2081.01,2145.81,2247.06,2398.64,2516.85,2619.39,2582.77,2636.72,2577.27,2590.31,2520.99,2569.36,2556.55,2556.55,2733.98,2688.85,2700.38,2610.2,2581.79,2593.7,2501.63,2144.9,2223.56,2324.81,2456.73,2459.29,2404.14,2450.85,2479.63,2383.35,2426.29,2426.29,2427.12,2626.92,2565.07,2467.73,2454.39,2438.2,2393.22,2265.52,2378.08,2375.82,2375.82,2214.52,2243.67,2229.13,2334.53,2361.95,2387.49,2341.39,2423.43,2406.4,2483.55,2474.81,2502.08,2505.47,2300.1,2381.17,2452.96,2419.89,2403.62,2322.48,2279.99,2329.93,2325.87,2410.17,2427.95,2483.55,2554.22,2567.86,2556.86,2528.23,2490.41,2525.06,2480.99,2440.23,2411.68,2561.6,2611.25,2649.45,2633.85,2606.58,2515.34,2515.34,2481.37,2517,2550.45,2643.19,2609.74,2614.04,2620.22,2778.58,2982.97,3089.2,3176.44,3208.39,3140.51,3209.97,3271.3,3208.31,3335.94,3189.78,3317.93,3339.1,3350.48,3461.53,3284.78,3238.3,3414.74,3262.86,3305.05,3281.32,3115.19,3284.03,3233.85,3278.38,3230.16,3309.72,3370.89,3334.51,3307.16,3382.57,3267.6,3408.49,3469.74,3476.97,3315.67,3439.68,3528.65,3347.01,3481.19,3359.44,3235.96,3354.32,3312.05,3244.1,3028.55,3046.33,3080.76,3022.98,3043.62,2977.62,2946.43,3147.51,3159.72,3213.81,3213.81,3240.86,3240.63,3233.85,3365.7,3424.38,3427.93,3311.75,3353.87,3401.18,3366.83,3457.76,3580.94,3690.71,3520.29,3641.66,3625.31,3682.04,3658.16,3656.96,3656.96,3580.04,3462.88,3423.63,3388.15,3300.38,3402.84,3261.88,3250.2,3283.27,3352.66,3382.42,3369.16,3308.89,3304.14,3296.08,3296.08,3158.59,3250.43,3385.43,3383.17,3278.75,3246.36,3250.58,3138.32,3242.67,3177.88,3179.01,3058.84,2992.54,3097.26,3144.05,3203.49,3226.54,3142.16,3144.95,3144.95,3093.65,3098.85,3101.78,3102.61,3012.28,3084.23,3144.65,3078.2,3032.47,3038.57,2956.53,3058.31,3055.37,2988.93,3003.62,3007.84,3072.48,2975.97,2947.26,2980.11,3008.06,2959.17,2865.14,2772.17,2869.29,2885.71,2907.71,2803.44,2725.99,2676.65,2800.73,2872.38,2716.65,2716.65,2658.11,2611.63,2586.01,2603.87,2628.96,2655.1,2743.85,2952.91,2929.93,3018.23,2957.06,2911.25,2919.46,2815.57,2835.01,2852.86,2832.9,2808.64,2875.16,2944.4,2957.13,2933.48,3003.99,3102.39,3227.15,3352.59,3265.57,3354.62,3339.78,3181.12,3088.82,3044.53,3143.6,3148.04,3209.52,3209.52,3266.62,3317.63,3330.74,3283.2,3133.2,3192.42,3192.11,3152.56,2945.76,3080.99,2988.55,2874.86,3007.16,3062,3097.56,3048.67,2986.29,3017.25,3017.25,3051.61,2875.01,2829.21,2826.12,2860.7,3102.76,3168.76,3204.17,2964.21,2964.21,3162.51,3035.41,2968.81,3062.91,3072.02,2974.08,2984.78,2971.82,2946.21,2869.21,2784.3,2854.82,2817.76,2408.51,2358.34,2329.63,2316.22,2247.51,2326.85,2344.63,2426.52,2466.22,2422.53,2407.31,2475.49,2492.82,2507.36,2467.43,2561.23,2578.63,2556.25,2537.95,2645.3,2600.18,2733.75,2628.96,2638.75,2605.37,2673.1,2627.45,2772.1,2682.75,2689.68,2835.54,2667.6,2667.6,2773.68,2771.04,2739.03,2753.19,2704.45,2686.44,2697.74,2758.92,2744.37,2827.47,2854.6,2863.79,2847.36,2803.44,2692.99,2658.26,2673.1,2667.83,2791.99,2853.32,2868.01,2846.38,2825.21,2883.22,2848.04,2826.95,2766.15,2730.59,2672.43,2772.93,2772.93],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1957.16,1960.95,1961.89,1893.89,1783.79,1921.37,1835.05,1835.05,1792.63,1784.53,1745.89,1760.32,1824.32,1816.42,1835.16,1855.16,1869.89,1927.26,1947.26,2018.84,2027.26,1996.53,1973.47,1968.11,1968.95,2000.42,1986.84,1993.68,2021.79,2043.37,2092.42,2200.53,2200,2196.53,2115.47,2110.53,1958.21,2043.68,2043.68]},"symbols":{"AMD":"AMD","EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","어플라이드 머티어리얼즈":"AMAT","테슬라":"TSLA","팔란티어 테크":"PLTR"},"missing":[],"stale":["KOSPI200"]}
};
