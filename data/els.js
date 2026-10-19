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
  "updatedAt": "2026-10-19T01:37:57.518Z",
  "checkedAt": "2026-10-19T01:37:57.518Z",
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
  "history": {"updatedAt":"2026-10-19T01:37:58.984Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20161017,20161018,20161019,20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827,20260828,20260831,20260901,20260902,20260903,20260904,20260907,20260908,20260909,20260910,20260911,20260914,20260915,20260916,20260917,20260918,20260921,20260922,20260923,20260924,20260925,20260928,20260929,20260930,20261001,20261002,20261005,20261006,20261007,20261008,20261009,20261012,20261013,20261014,20261015,20261016,20261019],"series":{"AMD":[100,100.9,101.5,104.35,97.75,105.1,112.44,109.3,106.6,107.95,108.4,106.3,101.35,100.45,98.35,104.35,104.95,104.05,94.45,100.3,101.8,104.5,114.99,126.84,130.58,134.03,130.28,131.93,131.93,131.48,132.38,133.88,133.58,125.79,127.89,130.13,141.68,143.33,155.02,155.02,160.12,158.02,158.17,162.82,159.82,164.17,172.56,171.96,173.91,173.61,173.61,180.96,173.16,173.76,170.01,170.01,171.36,171.36,168.52,169.72,172.26,171.51,167.92,161.32,158.62,158.62,147.23,148.13,146.48,146.18,148.58,156.52,155.17,157.72,159.97,159.07,155.47,180.81,184.11,183.51,204.35,199.25,203.3,201.2,203.6,202.25,198.8,199.4,194.45,196.85,196.85,209.9,214.09,214.69,211.69,227.89,216.79,224.29,208.4,195.35,195.5,195.65,198.2,199.85,208.55,214.09,211.39,209.6,204.65,202.25,215.89,207.2,211.39,206.75,205.4,205.4,205.25,205.55,210.64,218.14,219.49,212.29,212.44,198.95,202.7,196.4,196.4,191.3,184.56,184.56,191.75,194.15,192.5,196.55,194.9,196.85,202.25,201.05,204.2,199.4,204.2,154.72,155.77,151.42,152.77,150.52,152.62,161.77,165.97,168.82,171.21,191.15,167.92,169.12,171.06,165.52,163.27,163.27,164.62,164.92,164.92,166.72,167.77,163.87,163.42,168.52,180.36,185.61,193.4,184.11,181.26,179.31,176.46,172.41,171.51,178.86,189.51,209.6,215.59,212.44,211.09,200.9,198.35,188.91,187.11,182.16,182.16,197.75,195.2,200.3,207.05,208.25,214.24,202.85,208.7,206.9,202.1,203.15,206.9,208.1,212.29,211.54,221.29,211.69,209.15,204.05,205.55,200.45,198.5,196.7,201.35,196.55,192.35,181.71,183.36,191.3,195.2,189.36,185.01,185.46,180.66,182.46,187.11,187.41,186.36,183.36,182.16,189.96,194.9,197.75,197.75,193.7,192.8,189.36,183.66,188.16,184.41,183.21,183.81,187.71,196.1,196.7,206,201.05,199.4,189.06,186.66,191,191,191.15,190.55,201.2,199.55,200,198.35,201.95,205.4,208.1,212.89,213.19,213.79,212.29,210.94,209.15,207.05,211.39,213.64,184.86,180.06,177.51,163.27,164.77,161.92,162.67,166.72,178.86,180.66,175.56,166.72,168.82,166.27,166.72,165.97,168.67,170.61,170.01,170.91,170.46,170.46,170.61,173.16,167.47,162.37,163.27,160.87,150.37,148.58,149.93,150.52,149.03,152.32,148.43,151.57,151.87,154.27,164.62,164.17,164.62,163.27,158.02,158.02,156.82,157.87,158.17,154.12,164.62,173.16,181.71,178.11,184.11,177.21,179.31,182.01,180.21,180.21,178.56,182.61,186.96,188.76,189.66,194,190.55,186.06,194.15,199.7,192.95,206,198.65,186.66,173.46,174.66,173.91,168.22,169.57,175.11,176.61,182.91,182.76,177.21,177.21,180.21,175.71,177.51,180.96,186.21,187.86,181.56,178.41,177.06,178.56,176.31,183.51,179.46,175.41,172.71,174.51,170.31,171.81,171.96,171.36,166.57,168.82,163.57,159.37,156.52,149.93,147.08,150.67,150.67,142.88,143.18,146.48,150.22,144.08,142.88,149.63,147.23,151.12,148.88,151.27,157.72,155.32,151.57,149.78,150.52,151.27,145.58,165.52,166.57,163.12,166.87,164.47,163.87,169.12,173.76,174.06,179.16,181.86,179.16,183.36,186.66,192.2,192.2,194.9,194.75,194.6,196.4,201.05,203,203,200.3,207.2,205.85,215.89,222.64,222.64,234.93,223.24,228.64,235.83,237.63,244.68,243.63,244.98,256.52,250.22,247.68,234.63,236.88,226.54,232.38,224.44,229.54,224.74,227.29,224.89,224.89,232.38,245.28,249.03,248.13,243.93,248.28,243.93,248.58,252.92,252.62,250.52,247.38,249.78,242.73,240.63,275.11,283.96,291.15,274.81,277.06,281.71,277.21,291.3,293.25,293.55,286.36,285.76,295.8,300.15,295.35,289.81,296.4,299.55,305.85,313.34,334.18,359.52,378.71,375.56,377.81,373.16,377.36,377.36,420.69,427.44,417.39,410.49,448.13,451.27,482.91,456.97,490.55,486.21,478.71,467.92,467.47,465.07,488.91,488.31,482.61,488.61,463.12,471.06,435.08,426.24,416.49,410.04,396.7,408.4,374.81,379.31,394.9,393.7,422.49,409.3,399.1,354.72,375.26,376.16,341.68,288.91,264.32,252.62,257.87,273.01,303.15,303.3,298.35,310.04,327.44,317.84,315.29,285.31,294,311.99,322.19,309.75,286.51,288.01,280.81,280.81,290.55,301.05,315.59,319.94,321.29,319.34,355.47,316.64,316.64,319.34,291.75,299.7,299.55,307.05,297.75,298.35,282.31,292.35,272.26,268.97,253.82,249.63,249.63,268.37,262.22,267.17,276.76,282.31,255.62,284.86,308.4,311.09,302.7,295.95,303.9,303.3,305.55,295.8,303.6,311.39,311.39,296.25,296.85,312.59,328.79,302.55,288.61,346.18,365.97,367.47,361.77,349.48,348.73,339.88,345.58,344.23,342.13,342.58,346.78,355.02,355.02,359.07,359.07,358.62,365.22,370.46,362.97,352.02,352.77,355.02,350.37,352.32,335.98,331.03,329.99,344.23,352.17,350.52,342.13,349.18,348.58,389.81,385.31,418.14,395.35,389.36,385.16,373.16,375.71,382.61,395.2,401.05,435.08,436.13,434.48,427.74,408.4,417.24,416.64,417.54,409.75,418.74,412.14,414.99,414.99,422.49,419.34,426.69,414.69,417.99,415.14,414.24,401.95,424.14,423.09,411.09,399.7,406.15,407.95,419.19,393.4,409.6,413.49,419.94,412.29,400,410.04,410.94,395.2,396.4,396.4,435.53,421.14,420.24,410.94,413.49,443.33,442.28,477.06,485.91,498.2,485.91,482.46,470.61,455.17,437.78,456.52,457.27,449.93,436.28,438.68,432.68,448.58,460.87,455.32,467.77,468.37,467.62,467.62,472.26,480.36,497,506.6,495.65,497.9,515.59,507.5,503.75,494.75,487.41,492.5,502.1,511.39,504.8,510.04,501.95,507.8,456.52,447.68,441.38,419.64,432.68,437.63,508.55,512.59,486.21,481.41,453.37,444.83,467.47,471.96,460.57,475.26,478.26,442.88,453.97,452.77,461.47,471.51,471.51,471.51,463.27,464.02,472.26,458.17,457.27,453.22,446.18,452.92,460.12,462.22,464.62,456.07,454.12,450.52,459.37,442.58,442.88,441.83,430.58,434.63,431.18,424.44,429.99,434.93,433.73,423.24,426.69,425.49,446.03,457.72,460.57,461.92,466.87,464.32,480.21,472.41,470.16,475.56,490.4,505.1,495.2,496.7,508.7,523.09,544.08,541.98,538.68,543.93,544.08,544.38,550.37,562.52,574.96,578.11,597.9,619.04,614.39,592.5,586.96,596.55,584.56,590.85,590.85,586.96,580.66,583.21,595.05,594,594.15,583.66,591.3,591.75,638.53,616.94,634.93,641.23,634.18,642.13,661.92,681.56,697.75,697.75,699.1,692.35,682.46,687.56,736.13,728.64,725.49,723.39,717.09,734.18,722.19,730.88,722.79,727.89,746.18,763.57,763.57,765.37,771.06,775.26,754.87,738.53,757.57,712.29,731.33,704.65,719.94,741.38,747.23,739.43,745.58,783.51,806.6,807.95,817.54,829.24,829.24,852.92,883.06,858.62,798.8,736.43,713.19,711.99,659.82,681.86,711.54,700.9,751.27,721.29,728.49,648.73,680.36,685.16,584.86,658.17,580.36,627.89,586.51,597,593.85,624.29,692.95,669.12,712.14,698.35,717.54,681.86,654.57,667.02,638.53,712.44,713.04,731.48,725.34,725.34,763.72,823.54,824.44,853.82,848.58,854.12,793.4,838.38,838.08,842.28,846.93,832.23,804.5,785.46,747.83,788.01,782.46,782.01,778.86,797.45,835.68,806,782.31,817.24,812.59,818.44,831.63,845.43,819.34,827.14,827.14,797.45,790.7,775.71,806.6,804.05,802.7,790.55,789.06,796.1,794.15,845.43,861.17,792.05,802.1,819.79,816.49,817.84,810.19,813.04,820.99,809.45,785.46,778.56,751.12,753.82,788.76,788.31,784.71,784.71,800.6,793.55,801.05,858.47,837.78,803.45,820.39,829.69,823.39,825.19,861.47,854.57,926.39,893.1,1040.48,1034.03,1013.64,1140.78,1172.41,1160.87,1164.47,1274.96,1279.01,1300,1272.11,1232.98,1152.62,1238.53,1226.99,1218.89,1235.68,1224.29,1215.74,1240.93,1256.52,1245.58,1294.6,1289.66,1256.37,1282.61,1361.62,1382.01,1352.62,1237.48,1229.54,1229.54,1179.76,1228.04,1184.11,1144.53,1167.92,1183.36,1149.33,1147.68,1123.39,1168.52,1164.92,1120.39,1136.73,1170.31,1191.6,1225.94,1229.24,1272.26,1226.39,1291.6,1266.57,1299.7,1297,1245.88,1263.72,1278.56,1262.52,1246.33,1246.93,1229.39,1222.79,1187.41,1190.7,1228.79,1232.83,1182.61,1145.43,1169.72,1128.79,1119.94,1148.13,1219.64,1244.38,1287.56,1246.18,1169.27,1218.59,1226.99,1220.84,1255.32,1249.78,1237.48,1282.46,1268.97,1279.01,1275.41,1300,1300,1307.2,1389.21,1388.76,1405.4,1383.96,1409.9,1410.34,1393.1,1346.78,1374.21,1374.06,1420.99,1456.07,1452.02,1451.87,1438.08,1397.75,1396.7,1372.56,1376.46,1376.46,1373.31,1358.62,1383.66,1374.96,1383.81,1390.85,1354.27,1426.69,1417.99,1458.02,1429.69,1376.01,1361.17,1322.49,1322.49,1341.08,1330.58,1372.26,1391.15,1411.24,1419.94,1331.93,1312.14,1283.96,1314.24,1332.23,1317.69,1316.94,1317.84,1371.36,1362.97,1384.56,1389.21,1405.85,1405.85,1371.21,1348.43,1328.94,1343.03,1279.91,1270.46,1303.45,1235.68,1267.02,1295.2,1261.32,1212.29,1165.67,1177.21,1108.85,1177.36,1162.22,1217.84,1215.14,1236.88,1240.63,1238.83,1171.21,1185.31,1203.9,1175.11,1146.63,1142.73,1160.57,1156.52,1139.43,1176.91,1215.74,1215.74,1220.84,1220.99,1232.38,1249.63,1240.78,1178.11,1202.25,1177.66,1244.53,1231.63,1216.04,1188.46,1223.54,1185.31,1240.78,1280.51,1277.51,1259.67,1258.02,1223.69,1177.66,1178.56,1166.87,1167.77,1181.56,1139.28,1151.87,1119.04,1095.8,1118.29,1119.19,1116.04,1142.88,1170.31,1156.97,1161.02,1167.32,1174.51,1175.71,1200.6,1200.6,1211.54,1228.94,1203.6,1223.09,1219.64,1212.74,1198.8,1222.79,1219.04,1222.64,1206.45,1201.05,1267.77,1269.12,1238.23,1253.07,1256.67,1290.85,1283.66,1305.55,1342.13,1408.25,1398.95,1419.79,1419.79,1416.34,1357.42,1345.43,1362.82,1361.47,1353.22,1335.08,1303.3,1287.71,1298.05,1306,1340.48,1367.47,1381.56,1376.61,1364.77,1468.22,1543.48,1592.05,1628.64,1687.56,1780.66,1684.41,1650.82,1612.89,1596.4,1614.39,1596.7,1657.42,1611.39,1612.59,1550.82,1554.72,1568.97,1630.73,1613.94,1623.69,1608.25,1670.16,1668.97,1659.97,1649.03,1637.18,1647.98,1647.98,1636.43,1591.75,1591.45,1577.21,1571.21,1585.16,1583.21,1592.5,1557.42,1522.49,1541.53,1564.92,1591.45,1586.21,1621.59,1522.04,1504.5,1542.73,1535.98,1504.35,1526.39,1553.82,1595.95,1575.11,1569.42,1574.81,1636.58,1679.01,1680.96,1745.58,1744.08,1744.98,1789.06,1796.4,1834.48,1843.03,1833.28,1816.49,1802.55,1877.51,1913.49,1956.97,2061.47,2044.08,2251.27,2232.68,2097,2189.06,2217.24,2196.25,2285.61,2268.97,2324.14,2329.99,2286.66,2247.68,2365.82,2365.82,2320.99,2427.44,2374.36,2235.53,2259.07,2159.07,2084.86,2171.66,2177.51,2070.46,2077.21,2006,2032.98,2196.4,2078.56,2065.22,2035.98,2162.67,2157.12,2191,2191,2314.24,2296.1,2222.79,2176.16,2157.42,2252.47,2165.22,2041.23,2042.43,1979.01,1979.01,2058.62,2061.02,1990.11,2052.17,2052.17,1977.96,1923.09,1827.44,1781.26,1747.08,1666.12,1659.82,1538.23,1577.81,1712.89,1750.82,1840.48,1800.3,1853.07,1854.12,1922.49,1991.75,1885.61,1696.85,1713.19,1821.14,1764.47,1684.71,1706.6,1706.6,1733.88,1645.58,1748.28,1814.99,1849.18,1706.6,1773.31,1678.86,1625.34,1543.48,1582.16,1664.92,1596.1,1563.57,1532.98,1639.13,1729.69,1674.51,1701.05,1737.93,1720.84,1707.95,1807.05,1794.15,1802.7,1847.53,1787.41,1639.28,1622.04,1657.12,1601.5,1554.27,1555.02,1514.24,1459.82,1425.79,1465.37,1395.2,1395.2,1407.65,1453.22,1409.6,1347.08,1321.44,1359.67,1276.76,1273.01,1343.93,1282.16,1346.93,1366.27,1490.55,1407.35,1429.39,1294.75,1330.28,1318.14,1305.25,1426.09,1412.89,1536.28,1443.48,1449.33,1401.8,1425.34,1366.72,1389.06,1480.51,1533.13,1533.13,1527.14,1517.54,1628.04,1593.7,1583.96,1578.41,1527.74,1481.26,1421.59,1304.2,1304.2,1338.83,1230.13,1222.94,1222.94,1256.22,1255.62,1235.83,1305.55,1291.75,1211.09,1169.27,1146.48,1104.5,1104.5,1127.44,1129.69,1188.91,1189.66,1153.67,1144.83,1162.22,1178.41,1216.04,1220.84,1287.56,1340.78,1365.67,1320.84,1312.44,1278.11,1346.63,1374.36,1416.34,1450.97,1488.61,1470.61,1557.87,1533.88,1500.3,1432.38,1485.01,1471.06,1511.69,1514.39,1502.25,1473.31,1505.85,1438.53,1391.9,1386.66,1390.25,1456.97,1367.02,1326.69,1303.45,1272.41,1234.33,1203,1203,1180.21,1193.55,1241.08,1281.11,1268.97,1154.87,1161.17,1149.33,1147.08,1150.97,1128.19,1116.64,1041.98,1018.89,994,1007.05,1024.89,961.62,949.93,991.15,1017.99,1018.59,1017.24,876.16,866.72,864.02,867.32,883.66,838.68,868.97,868.37,858.02,866.12,881.86,880.06,921.59,895.5,878.56,929.69,900.45,894.45,879.01,901.2,932.38,945.73,957.27,898.35,1026.54,1085.01,1102.4,1144.98,1089.95,1107.95,1103,1086.36,1128.19,1145.43,1145.43,1126.54,1097.3,1100.3,1163.87,1161.62,1124.14,1103.75,1053.52,1051.57,1056.52,1028.34,1059.52,1074.21,1033.43,997.45,980.66,968.37,975.26,1014.69,957.42,967.32,967.32,948.58,938.08,971.81,971.06,971.06,959.82,969.42,934.48,958.92,1008.1,1020.24,1035.38,1061.47,1064.47,1064.47,1073.31,1057.42,1015.14,1050.52,1147.38,1119.94,1123.09,1126.84,1130.43,1086.21,1126.69,1268.97,1323.99,1290.7,1254.57,1288.01,1269.72,1247.53,1221.59,1246.33,1288.61,1277.06,1200.6,1176.91,1176.91,1150.97,1148.58,1195.65,1170.76,1180.96,1178.11,1173.76,1206,1222.19,1216.79,1231.03,1279.91,1259.82,1239.43,1229.54,1311.09,1344.53,1448.28,1466.87,1451.42,1438.23,1462.97,1503.45,1468.52,1448.43,1417.69,1440.63,1467.47,1469.42,1447.68,1437.33,1387.71,1386.36,1386.36,1431.48,1409.75,1384.26,1380.66,1375.56,1347.38,1346.03,1348.43,1350.97,1325.79,1312.89,1256.37,1288.46,1310.94,1339.88,1344.68,1347.98,1223.69,1298.5,1346.93,1424.89,1425.19,1454.57,1455.77,1428.19,1460.27,1521.44,1555.47,1618.14,1586.51,1619.19,1620.99,1623.24,1804.35,1904.5,1904.5,1878.11,1772.26,1791.15,1767.02,1768.07,1862.52,1766.57,1814.84,1872.86,1936.88,1867.02,1909,1862.67,1800.3,1800.3,1783.06,1680.81,1659.67,1649.33,1611.84,1655.02,1651.72,1667.77,1707.8,1736.43,1736.43,1708.4,1701.35,1696.7,1702.85,1668.97,1717.84,1737.93,1738.23,1773.91,1768.07,1745.58,1652.92,1663.42,1658.32,1694.15,1650.52,1665.67,1693.55,1715.14,1763.12,1639.43,1696.4,1736.43,1751.27,1697.6,1656.22,1652.62,1612.74,1678.86,1669.42,1607.05,1565.82,1580.96,1622.49,1584.11,1640.63,1526.24,1532.98,1538.38,1588.01,1598.05,1585.01,1640.93,1640.93,1660.87,1638.38,1598.05,1590.55,1579.01,1578.86,1614.84,1598.65,1521.59,1534.78,1523.39,1504.35,1440.93,1442.28,1459.97,1438.68,1470.31,1540.63,1541.53,1548.28,1500.45,1560.27,1542.88,1607.8,1603.75,1634.33,1623.84,1631.03,1575.56,1596.1,1576.31,1531.78,1535.23,1526.39,1499.4,1524.29,1440.18,1404.35,1445.73,1441.98,1476.76,1619.79,1616.64,1682.91,1675.41,1700.9,1703,1701.5,1777.96,1750.97,1797.3,1769.12,1796.55,1808.4,1822.04,1786.51,1836.73,1836.73,1833.73,1838.83,1829.24,1856.82,1816.49,1819.94,1777.66,1774.81,1751.42,1924.59,1932.83,2015.14,2063.12,2071.81,2068.97,2086.21,2082.46,2101.2,2031.03,2097.6,2092.95,2092.95,2150.07,2189.96,2230.28,2210.05,2077.66,2028.79,2039.13,2077.66,2191.6,2237.78,2226.99,2219.19,2197.3,2197.3,2379.91,2401.35,2438.83,2612.14,2521.44,2525.04,2673.01,2703.6,2657.42,2666.12,2579.61,2514.09,2555.92,2663.57,2612.14,2516.94,2562.82,2538.98,2585.91,2577.36,2571.81,2679.16,2650.07,2606.75,2606.75,2484.11,2463.12,2726.54,2646.48,2638.83,2668.67,2646.78,2886.51,3038.08,3078.86,3075.41,3157.87,3169.12,3109.3,2974.36,3039.88,2920.39,2804.5,2864.47,2858.32,2719.94,2694.6,2678.86,2693.4,2678.11,2666.72,2692.5,2706,2706,2748.73,2679.16,2710.19,2486.21,2555.02,2547.23,2560.42,2505.85,2556.22,2447.98,2403.6,2450.67,2309.15,2325.04,2198.5,2228.49,2282.91,2274.96,2305.25,2359.82,2401.8,2374.51,2162.97,2191.3,2257.87,2335.53,2315.29,2303.15,2284.71,2277.66,2257.27,2296.25,2393.85,2438.08,2465.82,2493.7,2468.67,2481.56,2405.25,2494.15,2494.15,2572.86,2475.86,2500,2502.25,2452.02,2398.65,2491.3,2500.45,2516.79,2403.9,2383.21,2402.4,2397.3,2393.25,2374.81,2318.29,2318.29,2425.49,2417.24,2402.55,2402.55,2361.92,2390.85,2431.93,2364.17,2463.42,2457.27,2457.27,2577.21,2679.01,2655.17,2758.02,2727.74,2722.79,2696.1,2661.92,2390.25,2335.38,2272.56,2336.88,2308.85,2168.37,2073.76,2098.8,2095.2,2075.56,2166.12,1987.11,1986.51,2021.29,1951.72,1929.09,2043.78,2013.04,2050.52,2115.89,2110.19,2209.3,2227.29,2328.04,2344.83,2365.97,2274.36,2323.54,2248.73,2256.37,2194.3,2181.26,2227.29,2227.29,2053.07,2111.99,2090.55,2014.24,2071.21,2141.53,2246.78,2260.42,2283.51,2280.06,2261.17,2223.24,2349.93,2338.08,2350.07,2373.61,2429.09,2511.09,2464.02,2459.97,2395.05,2395.5,2441.53,2562.22,2563.27,2590.7,2564.02,2461.47,2517.09,2477.81,2348.43,2340.78,2342.58,2338.38,2367.32,2310.19,2292.5,2300.45,2342.28,2397.6,2492.5,2227.89,2159.97,2126.84,2109.6,2123.84,2175.41,2246.18,2218.14,2209.15,2153.37,2088.46,2081.56,2022.49,2082.91,2089.81,2062.97,2061.32,2074.21,2115.89,2064.77,2042.58,2042.58,2056.67,2129.84,2128.64,2158.77,2119.34,2077.81,1962.07,1915.14,1951.27,1958.02,1902.7,1899.4,1874.36,1820.24,1782.31,1787.26,1868.07,1893.4,1893.4,1874.96,1876.91,1835.68,1810.94,1808.55,1879.61,1942.28,1909,1826.69,1826.69,1739.73,1758.92,1740.48,1798.5,1775.71,1820.99,1820.99,1833.28,1855.32,1844.68,1841.68,1724.29,1711.69,1759.37,1782.01,1738.38,1713.19,1791.6,1679.31,1651.57,1612.59,1656.37,1665.67,1674.96,1676.31,1695.65,1695.65,1713.34,1719.49,1711.69,1661.77,1620.84,1558.62,1570.31,1491.9,1497.15,1472.71,1510.49,1524.29,1482.01,1503.9,1448.73,1450.67,1511.09,1470.91,1513.79,1568.07,1551.87,1592.65,1606.3,1595.8,1706.9,1721.29,1652.02,1598.95,1547.53,1540.33,1540.93,1543.63,1406.3,1285.76,1253.97,1172.56,1451.87,1329.84,1400.3,1416.79,1428.64,1323.69,1311.84,1311.84,1282.76,1293.25,1355.17,1416.34,1449.03,1445.13,1440.18,1459.52,1449.03,1481.26,1508.1,1478.56,1504.65,1524.74,1541.83,1620.99,1686.06,1764.92,1723.99,1756.67,1720.24,1701.8,1680.06,1659.82,1653.82,1653.82,1717.54,1692.05,1694.6,1660.12,1718.59,1758.77,1777.81,1734.48,1741.98,1825.04,1847.68,1816.19,1776.61,1741.53,1894.9,1905.55,1900.9,1900.9,1922.64,1942.73,2075.41,2149.92,2154.12,2156.07,2127.44,2040.63,2076.76,2067.62,2067.62,2020.99,2066.27,2075.11,2161.32,2195.2,2192.5,2332.98,2400,2404.95,2353.67,2353.82,2319.64,2378.56,2430.58,2495.8,2603.6,2660.27,2691.3,2643.33,2574.21,2650.37,2613.34,2445.58,2584.71,2590.1,2582.91,2622.94,2764.92,2712.89,2661.32,2640.78,2497,2476.76,2454.42,2515.14,2449.18,2498.05,2505.7,2527.44,2438.23,2438.23,2433.58,2430.73,2425.64,2265.97,2270.02,2336.13,2391.9,2333.88,2377.36,2416.19,2405.7,2386.21,2367.62,2359.67,2395.65,2412.29,2411.99,2417.84,2390.7,2419.19,2425.64,2458.92,2544.68,2468.82,3054.12,3171.06,3531.63,3491.6,3221.89,3244.68,3269.72,3577.21,3516.64,3494.45,3606.6,3568.67,3451.72,3523.09,3791.9,3893.1,3868.22,3962.97,3820.69,3839.88,3892.8,3748.88,3843.03,3563.72,3501.35,3657.87,3561.02,3881.41,3717.54,3700.3,3606,3452.62,3351.57,3088.76,3055.17,3224.14,3090.4,3211.99,3211.99,3261.32,3294.75,3226.99,3262.37,3238.08,3267.92,3314.99,3322.64,3319.64,3319.79,3160.12,3112.14,3135.98,2970.16,3014.39,3199.85,3222.64,3221.89,3223.99,3223.99,3223.24,3232.53,3228.49,3210.79,3350.37,3314.54,3213.64,3148.73,3068.67,3046.03,3113.79,3312.89,3352.32,3417.09,3475.71,3475.71,3477.06,3745.13,3804.05,3893.25,3767.77,3778.56,3789.21,3780.81,3549.18,3692.2,3629.84,3001.35,2886.06,3125.04,3238.38,3201.95,3202.1,3087.56,3108.25,3108.25,3044.68,3000.3,3049.03,3000.75,2947.53,3206,3161.32,3053.67,3001.65,2977.81,2862.82,3029.54,2990.25,2885.01,3038.68,3046.93,3070.91,2964.62,2899.4,2947.23,2943.18,2990.4,3077.51,3018.44,3038.68,3079.01,3302.4,3055.02,3028.34,2939.13,3049.92,3151.57,3260.87,3260.87,3301.05,3321.29,3475.56,3547.83,3673.76,3700.6,3824.14,3869.86,4171.81,4173.76,4122.19,4265.22,4549.63,4577.66,5214.54,5016.94,4845.73,5054.12,5314.69,5405.4,5120.54,5326.24,6317.69,6123.84,6824.44,6878.41,6720.99,6679.16,6742.13,6358.32,6311.69,6207.65,6710.34,6740.48,7009.15,7009.15,7554.57,7429.39,7767.47,7737.63,7648.13,7819.19,8133.73,7844.08,6992.2,7351.27,7129.09,6782.61,7323.09,7669.72,8204.8,7605.55,7683.36,8056.52,8056.52,8270.31,7793.85,7792.2,7984.56,7819.79,8088.31,8709.29,8109.15,7763.42,7763.42,8276.61,7737.78,7757.27,8196.7,8364.17,8011.84,8217.84,7933.13,7510.34,7432.68,7549.78,8162.37,8280.81,8091.3,7825.34,7420.54,6815.89,6440.18,7277.21,7138.68,7265.97,7774.81,7227.14,7335.53,7246.78,7039.88,7111.24,7240.33,7241.53,7711.99,7586.21,7262.22,6992.8,7038.38,7095.2,6847.83,7184.11,7210.34,7146.48,6980.21,7057.27,6890.7,6852.47,6838.98,7159.97,7159.97,7582.31,7812.59,7550.22,7738.08,7397.45,7559.22,7683.66,8172.26,8393.1,9228.19,9351.87,9214.54,9434.18,9454.72,9113.49,9109,9171.81,9231.33,9503.9,9471.51,9736.43,9683.06,9305.55,9116.94,8909.15,9078.41,8558.02,8429.23,7927.29,7927.29],"EuroStoxx50":[100,101.27,101.57,102.26,102.29,102.83,102.62,102.4,102.54,102.34,101.55,100.48,99.05,98.83,98.2,100.02,100.49,101.58,101.26,100.71,101.03,101.36,100.59,101.1,100.4,100.81,101.18,100.78,101.06,101.32,100.27,100.99,101.43,100.74,100.21,101.46,103.06,104.44,105.89,106.28,106.33,107.58,106.75,108.01,108.33,108.28,109,108.71,108.67,108.82,108.82,108.97,108.97,108.74,109.37,109.37,110.18,110.26,110.23,110.38,109.98,109.89,109.95,109.24,110.49,109.5,109.18,109.48,109.36,109.66,108.79,109.07,110.55,110.32,109.79,108.44,107.38,108.32,108.14,108.79,107.63,107.54,107.62,108.94,108.71,109.86,109.98,110.47,110.05,109.97,110.09,110.99,110.99,110.81,109.82,109.99,110.33,112.68,112.5,113.12,112.59,112.51,112.66,113.33,113.55,113.52,112.99,113.31,114.33,114.61,114.25,113.99,113.69,114.74,114.47,114.24,115.17,115.51,115.72,116.36,115.43,115.72,115.42,115.98,116.19,115.68,115.33,115.28,114.61,114.61,114.61,113.33,113.7,114.34,114.34,118.9,119.09,118.94,118.43,118.31,118.31,118.93,119.2,120.58,121.61,121.05,121.28,121.17,120.43,120.9,121.04,121.04,119.15,118.4,119.22,118.87,119.49,119.21,119.21,118.95,118.95,118.36,118.14,118.56,119.38,119.38,118.13,117.95,118.45,119.19,117.79,118.25,117.9,117.17,117.79,118.97,118.34,118.13,118.18,117.78,118.38,117.6,117.52,115.38,114.4,116.06,115.65,115.61,115.07,115.13,115.6,115.15,116.83,117.25,117.19,116.87,115.62,116.34,116.31,114.72,114.77,115.45,116.04,116.1,115.26,114.65,114.65,114.98,115.21,116.57,116.52,116.85,115.28,114.12,113.22,114.69,115.06,115.82,115.06,114.53,113.79,114.85,114.29,114.49,114.29,113.7,112.61,113.13,113.72,114.46,114.02,113.7,114.13,114.59,114.59,116.17,116.75,117.1,117.21,116.85,117.22,117.36,117.18,117.64,117.71,117.59,117.54,118.16,118.44,119.48,119.74,119.84,119.48,120.1,119.76,120,119.61,119.9,119.84,119.8,119.86,119.91,120.31,119.72,119.82,119.95,120.01,119.37,120.89,121.39,121.72,122.11,122.89,122.6,122.64,122.39,121.61,121.48,120.07,119.44,118.81,118.2,117.85,118.48,117.91,118.37,118.96,118.41,118.72,119.03,118.46,119.1,119.32,118.65,117.24,118.86,118.67,118.37,118.76,119.37,119.06,119.66,119.05,118.2,118.34,119.97,119.06,118.08,118.68,118.1,118.1,118.1,118,117.14,116.46,116.46,116.66,118.62,119.91,120.2,120.41,119.98,119.49,120.07,120.04,120.38,120.08,120.35,121.28,121.82,122.05,121.09,120.65,121.23,121.08,119.88,119.96,118.9,117.1,115.62,112.84,114.82,112.25,110.55,111.95,111.04,112,112.66,113.9,113.26,114.17,114.01,114.07,114.38,115.1,114.93,114.3,112.98,110.5,111.52,111.6,112.25,113.45,113.69,113.98,112.92,112.71,113.47,114.25,112.83,113.41,113.04,111.28,109.62,108.97,110.24,110.72,111.73,111.73,111.73,111.24,111.02,114,113.27,113.5,114.29,113.66,114.47,114.6,114.37,115.59,116.03,115.88,116.14,116.76,116.69,115.86,116.53,116.95,117.54,117.54,118.12,117.3,118.01,118.46,118.25,118.65,118.65,118.51,118.51,118.47,118.42,119.39,118.78,118.78,119.23,117.72,117.05,116.84,115.75,113.94,114.37,113.23,114.78,115.32,114.89,115.03,114.99,114.58,115.67,115.52,115.65,117.23,116.5,115.22,114.18,114.32,113.12,114.39,111.98,111.97,112.91,111.86,112.86,112.08,113.22,113.4,114.36,114.62,115.01,115.44,113.75,114.52,114.82,114.64,114.92,115.83,115.39,115,114.8,115.77,115.28,116.64,117.23,116.74,117.18,117.18,115.31,115.74,115.77,116.47,116.12,116.13,113.88,113.33,113.32,111.64,112.26,112.11,112.79,113.39,113.68,113.65,113.92,114.87,114.59,114.87,114.03,112.77,112.84,111.65,110.2,109.55,109.46,109.99,110.07,110.57,110.8,111.16,111.21,111.62,111.96,113.11,114.03,113.35,113.66,114.11,114.66,112.98,113.48,112.64,113.19,112.18,111.19,110,110.41,108.58,106.66,106.17,106.7,108.26,107.79,106.74,106.72,106.03,104.39,104.04,105.17,104.19,104.86,104.6,106.27,106.5,106.84,106.93,106.6,107.89,107.61,107.34,106.16,107.18,106.54,106.04,105.72,105.04,103.57,104.83,103.92,104.27,105.45,105.24,105.3,105.5,105.46,106.86,106,104.7,101.24,101.66,100.27,101.55,103.3,103.44,102.79,101.83,101.04,101.42,99.71,99.73,99.73,99.73,99.73,97.63,99.26,99.26,99.26,98.2,101.1,100.83,101.54,102.04,102.23,102.04,101.54,101.97,102.28,102.02,104.19,103.87,103.46,103.44,103.91,105.14,104.27,104.81,105.09,105.01,105.4,105.2,106.86,106.78,104.72,104.22,105.21,106.05,106.44,105.78,107.73,107.85,107.67,108.33,108.47,108.7,109.02,109.33,109.11,109.62,110.08,110.25,110.58,110.5,109.98,109.14,109.83,109.81,110.46,111.08,112.54,112.6,113.3,112.09,111.92,109.87,109.7,110.33,110.41,110.36,111.4,112.52,112.86,114.19,114.4,114.58,114.27,113.58,113.82,114.18,114.59,114.68,115.11,115.59,116.3,116.3,116.3,116.46,116.42,116.06,116.34,116.39,116.81,116.81,115.96,116.41,115.1,113.04,113.58,111.37,111.71,110.37,111.82,112.53,114.29,113.86,112,112.56,112.56,110.59,111.37,111.81,111.31,109.61,109.61,109.03,109.69,110.79,111.01,110.96,112.29,112.29,113.04,112.56,112.69,112.31,112.45,114.76,114.82,115.27,115.23,114.85,114.48,114.43,114.41,115.45,116.25,116.59,117.68,117.8,117.26,117.12,116.65,116.38,116.22,116.25,116.4,117.04,116.38,115.76,115.67,115.99,117.42,117.42,116.67,117.14,117.11,115.09,115.23,115.23,112.21,110.04,109.4,110.01,112.19,110.8,110.56,111.58,109.31,109.11,110.65,111.98,111.35,112.84,112.13,110.82,111.3,112.02,111.85,113.38,113.89,114.09,113.69,114.69,115.82,116.17,116.16,116.29,116.89,117.62,117.99,116.94,117.04,117.26,118.08,118.7,117.56,117.39,116.76,117.4,117.85,118.64,116.94,113.45,113.58,114.56,115.37,114.09,115.07,116.13,118.65,118.2,119.61,119.63,119.27,118.97,119.65,119.81,119.88,120.36,120.47,120.51,120.39,120.33,119.8,120.44,121.82,122.2,122.6,123.2,122.96,122.87,123.38,122.96,122.6,123.36,123.14,122.86,122.44,122.3,122.55,123.23,123.16,123.4,123.12,123.09,120.54,120.02,121.65,121.25,122.72,122.05,122.04,122.56,123.19,124.01,125.39,124.48,124.27,124.28,125.52,125.52,125.52,125.52,125.52,125.71,124.59,124.59,124.59,125.41,124.72,124.95,125.39,126.16,125.95,125.62,125.46,125.27,125.44,126.57,126.27,125.94,125.3,124.2,125.61,122.24,123.61,124.18,122.67,121.01,121.69,124.05,125.56,126.48,126.25,126.07,127.16,128.11,127.85,127.66,128.07,127.51,128.47,127.06,126.31,121.25,118.74,118.91,114.86,110.66,110.97,112.07,113.69,111.79,107.42,98.35,96.72,96.57,84.6,85.95,81.44,84.11,79.3,81.57,84.7,82.61,90.24,93.07,94.65,90.69,91.92,92.63,89.08,89.36,88.51,92.93,94.98,94.77,96.15,96.15,96.15,96.98,93.34,93.47,96,96.7,92.78,94.22,94.81,93.36,95.79,97.45,99.58,97.31,97.31,93.61,95.59,94.52,95.74,96.66,95.85,95.86,93.41,91.74,92.09,96.78,96.47,97.8,97.8,96.57,98.76,99.68,101.41,102.85,101.38,101.38,105,108.67,108.41,112.48,111.88,110.37,109.47,104.52,104.82,104.24,107.78,108.59,108.02,108.65,107.74,109.64,106.23,106.99,106.5,107.42,107.49,107.3,110.35,109.49,111.34,110.4,109.22,108.39,109.56,111.34,110.39,112.28,111.85,111.86,112.62,113.18,112.03,112.07,110.04,109.78,109.8,109.69,106.63,105.5,107.96,108.16,108.63,107.7,108.11,108.34,110.75,111.78,111.11,109.85,109.88,109.34,110.27,108.82,108.34,110.74,110.67,111.57,110.71,110.2,108.77,108.94,110.94,109.82,108.37,110.15,108.6,110.51,110.11,110.21,110.24,110.75,110.97,110.23,109.14,105.06,105.17,105.7,105.02,104.27,107.13,106.83,106.15,106.16,106.06,107.03,107.46,107.47,108.21,108.79,109.62,108.99,108.79,106.11,107.87,107.77,107.28,105.72,105.41,106.32,103.21,102.06,98.5,98.38,98.32,100.36,102.99,105.06,106.87,106.49,113.27,114.42,115.24,113.94,114.07,115.21,115.28,115.74,114.73,115.25,115.1,116.59,116.72,116.69,117.25,116.08,117.17,117.04,116.9,117.63,117.33,117.19,117.29,117.07,115.86,116.46,117.04,117.76,118.35,117.85,114.62,116.25,117.63,117.63,117.63,118.83,119.03,118.71,118.71,118.47,117.92,120.02,120.4,121.15,120.34,120.06,120.2,121.03,119.64,119.74,119.5,120.45,120.26,119.73,118.09,119.41,117.54,118.22,115.71,117.35,119.34,119.98,121.05,121.51,121.83,121.68,121.26,122.03,122.83,124.11,123.85,122.97,122.35,123.42,122.97,122.61,123.17,122.49,120.86,123.2,123.23,123.4,123.14,121.96,125.08,125.84,126.96,127.82,127.41,127.29,127.99,127.95,128.54,127.53,127.42,127.2,127.38,127.38,128.52,129.05,130.49,130.26,131.15,131.15,131.15,131.96,131.51,132.21,132.24,131.68,131.85,132.16,132.73,134.04,133.61,130.97,132.16,133.44,133.39,133.64,133.34,133.45,132.84,132.11,132.96,130.45,133.04,132.93,134.09,133.72,131.15,131.2,131.2,133.53,133.17,133.12,130.84,132.94,133.8,133.8,134.14,134,134.25,135.29,134.26,135.33,135.89,135.58,135.92,136.19,136.14,136.17,136.14,137.16,137.36,137.72,137.99,138.2,135.72,136.68,137.04,135.47,137.02,136.96,135.94,136.52,135.08,135.57,135.75,135.85,134.7,135.56,132.67,135.21,136.05,136.09,136.25,134.82,134.14,130.57,131.5,133.83,134.91,136.57,136.36,135.1,136.37,136.83,135.91,136.82,136.87,137.76,138.3,138.75,138.83,139.19,139.8,140.47,140.58,139.68,139.47,139.24,137.09,137.85,138.81,138.87,138.97,138.59,139.29,139.55,139.47,140.5,140.66,139.66,141.13,140.43,138.83,138.83,138.61,139.25,139.32,137.8,138.59,137.3,134.4,136.19,137.94,139.43,138.22,138.45,134.9,135.61,134.54,134.12,132.83,135.12,133.37,136.22,135.38,135.36,134.78,135.71,137.9,139.03,137.98,138.49,138.67,138.12,139.22,139.21,140.39,140.29,140.72,141.27,142.27,142.79,143.24,144.03,145.01,144.66,144.4,144.54,144.85,145.26,145.78,146.29,146.27,145.7,144.79,144.2,142.38,142.13,142.69,135.92,136.59,135.04,138.9,136.54,135.61,137.5,142.13,140.69,139.87,139.57,139.03,137.75,138.25,139.66,138.31,136.51,138.76,140.16,141.78,141.78,142.52,143.31,142.41,143.12,143.12,143.98,145.17,145.98,143.74,143.11,140.91,142.3,143.46,143.45,141.99,142.99,141.52,141.86,142.9,140.58,134.75,135.55,138.42,139.09,137.5,138.75,140.41,140.33,137.63,135.82,136.95,137.24,139.73,139.5,138.11,135.09,137.72,137.51,136.71,135.42,132.47,132.46,132.06,127.27,131.97,130.43,125.16,126.98,124.36,118.19,116.73,116.5,125.17,121.36,122.54,124.34,124.24,129.28,129.14,129.7,129.02,130.49,128.6,128.41,128.55,129.19,133.02,131.59,129.71,130.24,131.32,130.22,127.12,126.37,128.24,127.62,127.35,127.23,127.92,127.92,127.92,127.32,129.52,130.55,127.63,124.89,123.69,124.13,125.54,126.39,124.05,125.01,123.81,122.86,120.62,117.22,118.15,121.24,120.1,123.09,122.49,124.36,122.67,120.76,121.55,123.25,121.23,122.21,122.21,126.59,127.68,125.94,124.95,126.14,125.76,125.76,126.52,125.93,123.79,119.63,116.41,115.5,117.4,113.93,114.28,115.33,116.13,115.15,114.21,117.43,117.62,117.97,116.8,114.83,114.61,114.75,111.67,113.73,115.95,116.55,115.39,115.9,114.8,112.89,115.57,116.72,119.23,119.16,119.54,119.54,119.79,118.83,119.91,121.39,123.25,123.25,122.47,124.06,124.79,123.82,124.88,123.49,124.62,124.87,125.53,125.95,126.47,124.84,125.55,123.98,121.59,121.4,121.89,122.13,119.77,118.67,118.39,116.9,114.89,117.8,116,116.33,116.4,116.74,118.66,121.2,119.19,118.57,117.72,116.34,116.31,115.23,116.06,113.91,111.3,111.1,110.63,110.85,108.98,110.29,111.08,115.81,114.59,114.12,112.19,111.57,111.02,110.73,111.76,112.4,114.39,115.13,115.37,116.09,115.55,117.25,119.17,119.83,119.8,120.08,120.24,121.35,120.38,119.43,122.59,123.27,124.28,123.91,127.85,128.58,129.21,130.12,129.05,128.91,130.45,129.93,130.62,131.17,131.68,131.7,130.8,130.77,131.77,132.43,132.21,131.5,130.93,130.32,130.33,131.04,130.35,132.51,132.12,127.49,126.43,126.67,126.38,128.7,127.07,126.86,126.86,127.39,126.59,127.96,126.09,126.09,129.03,132.08,131.6,133.54,135.23,134.86,136.26,137.16,137.96,138.17,138.74,138.74,136.08,136.93,137.96,138.03,137.87,138.73,138.86,138.22,138.38,138.65,140.96,141.52,139.78,139.9,139.9,141.26,139.53,140.97,140.88,142.25,142.83,142.08,141.96,141.27,141.02,141.53,138.89,141.19,140.87,140.12,140.94,142.75,143.38,142.22,142.53,142.46,140.58,136.16,138.91,134.11,136.83,135.11,136.92,138.98,139.45,139.83,137.29,138.42,138.54,140.63,142.43,143.42,143.29,143.43,142.86,143.23,143.23,143.23,144.02,144.05,145.02,145.93,145.17,146.04,146.03,145.74,146.53,146.3,145.51,144.5,144.85,144.89,144.89,142.75,143.26,142.49,144.26,144.53,143.69,143.14,143.24,143.51,143.46,143.43,143.69,143.69,146.09,145.76,144.33,141.71,141.91,144.16,144.16,142.64,140.19,141.51,143.7,142.69,142.76,142.65,142.84,142.58,143.47,144.5,145.44,145.08,146.07,144.99,144.35,143.67,143.07,141.97,142.27,143.09,144.41,144.74,146.21,146.18,145.94,144.6,140.36,140.81,141.47,142.47,144.93,145.97,146.25,144.81,145.24,144.99,145.37,145.96,145.68,145.95,144.45,147.82,148.45,148.61,148.61,144.13,143.07,144.01,144.16,142.55,143.49,145.71,143.63,143.92,142.54,142.4,140.52,140.02,140.42,141.6,141.81,140.67,140.8,142.71,143.8,143.43,142.82,142.34,142.25,141.89,140.87,140.29,140.83,141.4,141,140.37,142.24,142.75,141.12,141.01,142.12,140.01,139.83,138.51,137.24,137.32,138.32,138.75,137.52,136.12,136.27,136.26,137.75,136.69,139.77,139.62,139.54,137.47,137.93,138.01,136.47,135.95,133.77,134.33,135.12,135.38,134.59,133.42,133.89,134.98,136,138.58,138.75,138.22,138.04,138.88,140.56,139.51,140.66,142.64,143.43,143,144.27,144.33,143.98,144.65,144.96,145.31,144.73,144.51,145.26,145.66,146.86,146.74,148,149.01,148.69,150.34,150.9,150.78,150.57,150.87,151.21,150.27,150.74,150.69,150.39,150.28,150.28,150.28,150.51,150.04,150.28,150.28,147.84,148.7,148.35,149.08,148.47,148.53,147.65,148.9,148.06,147.79,146.34,148,147.86,148.91,148.43,151.7,152.3,154.07,154.2,154.97,154.5,154.17,154.7,154.73,155.91,155.51,156.57,156.74,157.75,155.86,156.52,157.65,158.39,158.31,158.22,158.72,161.38,161.95,161.67,162.39,162.32,162.12,162.69,163.29,162.63,163.37,165.33,164.89,163.87,165.63,166.2,165.95,165.72,165.61,166.45,166.19,167.92,167.22,167.65,168.32,168.9,168.96,168.96,168.96,167.58,168.49,168.54,166.67,167.71,165.88,166.21,165.08,164.69,165.67,163.42,163.33,164.08,163.46,164.08,166.46,165.85,164.16,166.41,165.56,163.57,163.57,162.55,163.57,164.75,166.72,167.45,167.45,169.01,168.81,168.85,169.54,168.59,168.32,168.32,167.75,167.02,167.43,167.36,168.15,167.19,164.96,165.59,165.64,166.3,164.63,167.37,168.48,167.89,166.73,165.02,167.33,164.04,160.84,162.21,163.37,162.38,164.45,163.1,164.55,164.06,163.39,162.95,162.66,163.86,163.07,165.05,165.77,165.5,165.18,162.98,164.82,165.39,167.61,165.62,164.45,162.58,161.87,160.44,162.77,163.42,161.59,159.91,161.61,160.05,160.9,161.96,161.96,154.18,151.95,152.07,155.15,155.17,155.39,155.28,156.04,157.13,159.79,160.88,161.91,161.45,162.37,162.36,163.17,162.75,162.82,163.29,165.06,164.79,165.29,163.28,161.14,160.04,157.48,158.83,157.78,158.33,160,161,160.45,161.56,160.71,164.3,161.91,162.38,164.21,163.42,167.27,168.43,166.2,164.66,164.96,163.57,164.69,165.18,164.49,165.6,165.2,166.31,167.55,164.41,163.15,164.43,165.73,164.23,164.17,163.61,164.04,164.29,165.18,164.52,162.39,160.45,162.12,161.27,161.87,159.56,161.26,159.63,161.33,157.7,157.55,160.65,159.37,159.21,157.92,157.2,158.07,159.17,159.53,158.27,157.31,158.16,159.68,161.09,162.15,163.49,164.57,165.45,165.7,164.58,164.83,165.04,165.12,164.42,164.28,164.76,162.16,161.61,161.3,161.3,161.3,161.3,162.82,161.84,161.84,161.84,161.91,165.74,166.58,166.06,166.78,165.43,164.66,165.53,167.26,169.74,171.11,171.65,171.7,173.02,173.41,173.47,172.45,172.69,173.85,175.56,175.72,173.43,174.98,175.19,178.04,177,178.09,179.18,179.67,182.82,182.58,183.46,183.93,181.51,181.51,181.97,181.27,181.07,183.73,181.89,181.59,184.15,179.06,182.44,183.48,181.75,179.05,176.48,178.13,177.1,179.62,180.99,182.3,183.05,181.17,180.27,180,181.97,179.87,178.85,177.2,174.44,176.83,176.29,169.95,162.14,154.76,158.66,153.62,160.17,159.11,163.24,165.2,165.07,164.03,164.03,164.03,164.9,169.47,170.01,171.31,171.85,171.56,171.51,171.51,175.66,175.59,174.94,173.83,175.79,176.48,179.22,180.02,179.59,179.88,180.39,180.38,181.29,181.29,180.29,177.03,179.32,179.99,178.76,178.76,178.37,178,178.67,179.65,179.83,180.48,180.48,179.99,179.25,178.18,175.84,177.47,175.78,175.05,172.73,173.95,173.56,176.06,174.56,174.29,177.01,176.26,175.57,176.78,177.59,175.78,177.54,178.55,181,180.75,178.93,178.51,177.96,176.09,178.72,178.12,177.58,175.84,177.63,177.99,177.89,177.4,178.79,179.25,176.82,176.82,174.24,174.48,174.93,177.22,177.74,177.21,177.35,179.09,180.63,181.09,180.63,182.25,181.88,181.54,182.41,180.94,178.94,179.25,179.37,177.87,178.38,175.86,176.99,177.71,176.76,178.24,178.44,178.2,179.04,179.17,180.82,178.56,178.47,181.36,181.42,180.88,181.88,181.62,180.97,182.79,183.03,183.8,185.5,187.65,187.84,187.08,186.58,187.78,186.98,183.84,185.07,184.53,186.29,187.85,186.37,188.82,189.01,187.43,188.4,188.6,189.82,189.59,189.64,189.42,188.19,188.76,188.13,188.42,186.5,185.01,188.27,190.3,192.35,190.87,189.24,187.49,183.96,184.2,185.13,183.3,183.75,185.26,187.97,187.89,188.39,188.37,188.99,189.27,190.05,190.24,190.3,190.06,189.72,191.24,190.14,191.19,190.04,188.84,190.84,191.46,190.9,191.09,191.09,191.09,191.09,191.17,192.65,192.65,192.65,196.88,197.15,196.88,196.24,199.34,199.96,200.41,199.59,200.79,200.4,196.95,195.83,195.53,197.96,197.7,198.02,199.24,197.2,195.83,197.69,199.67,199.27,198.44,196.95,199.37,201.38,200.98,200.6,199.8,198.93,198.72,200.15,202.86,201.4,203.78,203.21,203.3,205.18,204.79,204.02,198.99,191.83,195.13,192.2,190.11,188.96,194.01,192.6,191.07,190,190.75,191.75,190.67,186.59,182.84,185.27,185.5,187.77,184.99,182.99,184.19,185.12,190.54,189.21,189.21,189.21,187.23,196.54,195.97,196.96,196.26,198.91,197.44,197.2,201.34,198.84,197.1,196.3,195.92,195.55,194.78,193.97,193.32,195.48,195.48,191.56,195.09,200.32,198.51,196.48,195.95,193.05,194.8,194.8,193.7,194.4,194.47,198.62,198.1,200.07,200.07,201.55,201.76,201.25,201.1,200.58,203,201.2,202.85,201.48,201.49,201.07,199.75,201.31,205.66,207.05,207.98,209.39,210.16,209.16,209.77,207.08,206.56,208.31,206.78,207.12,210.32,208.81,211.4,213.14,212.65,210.05,206.23,208.87,208.39,208.43,208.73,208.25,208.85,207.09,206.98,208.91,209.96,206.41,208.76,208.8,209.04,207.69,210.87,211.32,213.6,215.6,215.27,216.12,216.83,217.22,217.74,217.17,217.55,217.35,217.05,214.98,214.19,213.45,214.78,214.31,214.56,215.07,213.54,215.56,213.39,211.68,211.46,212.14,212.48,212.85,213.15,209.78,208.36,210.23,208.07,207.28,208.28,210.15,207.27,210,210.21,209.39,208.48,209.49,209.43,210.06,208.36,205.25,207.35,207.47,208.47,205.41,203.63,205.18,206.11,204.97,205.75,205.01,206.21,206.21],"HSCEI":[100,101.88,101.05,101.52,101.52,103.27,103.11,101.65,100.71,99.73,100.19,101.73,99.78,99.38,99.48,100.7,101.24,98.3,100.05,98.87,97.92,98.5,98.13,97.75,97.99,98.99,101.16,101.31,101.44,102.61,103.51,103.2,103.11,103.68,102.52,101.79,102.39,103.02,103.73,103.43,101.66,101.87,101.73,99.35,99.26,98.28,97.3,97.8,96.43,96.23,96.23,96.23,97.48,97.61,98.47,98.47,99.15,98.95,100.6,100.73,100.64,101.29,102.02,101.91,102.58,101.31,101.69,102.74,102.63,101.83,101.95,102.29,102.11,103.28,102.76,102.76,102.76,102.26,101.63,101.49,103.14,103.2,104.34,105.6,106.12,107.51,107.48,109.38,109.58,108.58,109.48,109.09,110.44,110.28,109.2,108.28,107.93,107.83,107.4,106.32,106.6,107.22,107.75,105.81,105.53,107.52,108.11,107.67,110.33,110.19,110.93,111.56,109.6,109.92,109.82,108.6,109.27,109.4,108.54,107.68,108.11,108.11,108.64,107.71,107.68,107.47,106.55,106.99,106.95,106.95,106.95,105.27,104.64,105.4,105.33,105.94,107.66,108.14,107.55,107.11,107.11,106.63,106.63,105.73,104.04,104.63,106.16,107.19,107.51,107.77,109.53,109.36,108.83,107.65,107.61,108.73,108.95,108.91,110.8,110.89,111.3,111.3,111.13,111.31,111.79,111.07,111.16,111.22,111.62,111.02,109.9,110.32,110.21,108.44,108.84,110.27,109.72,108.94,109.03,109.32,110.37,110.03,109.09,109.34,108.64,109.13,108.02,108.8,108.44,107.45,107.06,109.17,110.23,111.91,112.44,113.02,112.73,113.83,113.69,113.06,113.41,113.01,113.52,113.8,112.73,113.49,115.54,115.87,115.31,115.32,115.86,116.13,114.9,113.01,110.82,112.22,112.54,113.38,113.21,112.08,112.69,114.82,114.82,115.83,118.31,118.88,118.39,119.22,118.39,118.28,117.21,117.3,116.64,116.33,116.86,117.61,117.83,117.25,116.35,116,117.35,116.61,117.11,117.37,116.43,114.37,114.96,115.67,113.98,114.35,114.35,118.49,119.45,119.45,120.1,119.33,119.68,119.6,120.53,120.74,121.61,121.25,121.81,119.04,121.14,120.44,119.54,120.46,119.97,122.04,121.2,120.61,121.96,121.56,121.6,120.79,122.06,121.33,123.09,123.11,122.47,121.6,119.62,120.89,121.67,120.93,124.46,125.34,123.02,124.81,123.39,122.69,122.08,120.28,120,120.72,120.37,116.99,116.87,118.33,119.81,118.57,120.74,120.86,119.13,119.64,120.97,120.59,121.55,122.14,122.14,122.14,121.77,122.46,122.73,126.5,126.7,127.91,127.99,128.24,128.45,128.8,128.87,130.69,130.7,134.02,134.88,137.25,138.13,138.4,141.39,142.76,140.32,143.84,143.17,140.33,142.14,140.8,141.9,141.28,132.97,130.31,129.76,124.74,124.73,125.82,128.51,131.38,131.38,131.38,129.93,132.97,131.31,133.48,134.51,132.55,129.78,130.27,127.91,125.69,129.04,127.66,129.28,130.29,133.08,133.6,132.95,133.32,132.83,132.69,132.03,131.24,130.25,127.12,127.84,128.93,125.78,125.75,125.75,125.75,127.2,124.28,124.28,125.43,126.54,129.17,129.17,128.8,128.51,125.86,124.73,125.63,128.29,126.34,125.77,128.34,126.76,125.24,126.47,129.25,129.25,127.8,125.97,124.63,125.42,127.29,127.72,128.22,129.39,131.48,130.39,130.38,128.69,129.49,129.44,129.44,126.72,127.37,126.27,126.98,125.34,123.35,125.54,125.98,128.39,128.49,128.74,130.05,127.51,127.57,127.94,126.15,125.26,124.41,124.41,120.46,120.59,119.11,118.85,117.48,116.54,114.02,113.91,116.06,116.06,113.95,112.28,111.18,111.34,112.86,113.46,111.71,112.7,112.63,112.19,111.01,110.87,110.29,111.96,112.48,115.02,116.07,115.51,115.79,115.78,115.55,115.01,112.49,112.08,112.17,113.89,114.26,115.5,114.69,112.84,112.61,110.42,109.84,110.2,111.44,112.54,113.72,113.35,112.98,115.81,116.31,116.16,114.95,113.99,113.34,114.14,111.58,110.87,110.67,109.35,108.3,107.31,110.08,110.84,109.65,110.65,112.58,113.12,115.58,113.48,113.48,115.14,114.65,115.48,115.48,112.72,113.05,110.55,110.37,108.93,109.22,109.45,105.78,107.94,106.32,106.89,106.89,106.24,107.14,109.95,107.27,107.18,106.66,105.42,104.94,104.8,106.26,107.74,112.02,110.52,111.44,111.53,112.18,109.33,109.43,109.83,109.06,110.63,110.93,111.43,109.7,109.9,109.49,108.88,110.28,110.21,111.46,110.94,111.33,114.06,114.32,112.74,109.85,108.68,107.67,107.38,109.18,110.65,108.58,108.5,107.23,106.86,105.76,105.87,105.47,105.47,105.47,104.72,104.73,106.12,103.07,103.09,105.12,106.11,106.21,108.56,108.95,109.58,107.88,110.08,110.63,110.18,111.49,112.28,111.24,111.42,112.05,113.97,114.06,113.9,114.21,115.67,115.96,115.67,115.67,115.67,115.67,114.84,115.47,115.76,117.38,117.08,114.63,116.85,116.52,117.7,118.5,119.77,121.9,120.99,120.08,119.14,120.6,121.32,121.4,121.5,120.11,116.93,118.19,120.18,119.54,119.98,120.62,122.36,122.49,121.84,120.99,120.71,117.72,117.72,118.49,118.38,119.27,121.14,121.02,122.68,122.55,122.55,123.61,123.83,123.3,121.77,122.21,121.91,123.9,124.19,123.35,123.35,123.35,122.95,122.25,120.55,120.65,121.98,120.97,120.97,121.13,121.32,117.74,118.03,116.31,113.67,114.57,114.57,112.82,113.24,113.32,112.03,111.45,111.46,111.15,109.01,109.48,109.03,109.18,108.9,109.53,108.87,109.32,108.39,108.43,108.31,108.31,110.33,111.31,110,109.76,109.21,109.3,110.13,112.82,114.48,114.47,114.8,112.59,112.84,114.21,114.05,114.05,115.09,114.48,114.38,114.19,112.41,111.63,112.17,113.03,113.07,113.6,113.88,113.7,113.03,114.34,112.88,113.3,113.81,114.56,113.75,112.99,113.39,111.89,111.32,108.46,105.67,104.94,104.74,105.25,104.75,104.79,103.2,103.41,103.8,104.44,105.95,106.2,106.67,106.1,106.85,104.95,104.77,104.61,104.73,105.68,105.89,105.18,107.83,108.84,109.32,109.18,109.04,110.73,111.02,112.02,111.39,110.08,109.83,108.85,108.75,107.83,107.65,106.58,107.03,106.37,106.92,106.92,106.73,107.13,106.35,106.35,106.92,106.58,107.1,109.55,110.13,110.05,110.39,110.97,110.47,110.51,110.33,109.54,110.39,109.7,110.78,110.54,109.83,110.4,111.33,113.34,114.01,113.83,114.62,114.06,111.24,112.05,110.25,109.29,109.26,110.64,112.11,111.3,109.53,110.12,111.4,111.28,111.31,110.7,107.97,108.62,108.54,107.47,108.18,109.08,109.09,108.95,110.08,111.25,113.59,112.97,114.92,115.55,115.14,115.61,115.84,115.67,115.67,115.67,117.33,117.65,117.05,118.65,117.95,117.02,117.37,116.13,118.24,118.09,119.45,119.02,118.39,118.73,119.69,118.77,114.98,117.12,114.79,115.04,115.04,115.04,111.29,108.22,107.33,107.62,109.37,109.99,112.82,112.2,111.67,113.28,114.08,113.57,113.86,114.85,113.25,114.33,114.39,113.1,110.77,110.89,110.07,111.03,107.98,109.89,109.89,110.28,112.44,109.6,104.65,106.42,105.55,101.94,101.14,96.71,96.59,92.24,89.71,95.57,91.73,96.26,99.88,99.02,99.62,98.54,100.56,98.57,99.85,99.48,101.17,103.21,101.48,102.83,102.83,102.83,103.21,101.92,101.38,102.87,102.97,100.77,101.35,101.71,101.21,103.51,104.64,105.24,105.24,105.24,100.61,101.65,102.8,102.34,103.43,104.71,103.05,103.09,101.53,101.4,101.94,103.59,103.74,103.24,98.8,99.21,100.57,100.28,100.11,100.21,103.07,103.51,104.47,104.47,105.5,104.9,106.08,106.31,104.23,103.05,101.2,103.42,103.86,103.93,104.54,103.54,104.74,104.15,104.15,103.27,102.27,102.28,102.28,105.41,107.36,112.43,111.1,112.65,113,110.48,110.85,109.06,108.9,106.21,106.94,107.91,109.48,107.36,108.22,105.66,105.6,106.4,106.74,105.83,105.23,105.16,106.95,107.5,106.93,105.47,104.71,106.42,107.07,107.37,107.6,108.85,109.27,108.09,106.44,107.03,108.34,107.87,107.96,106.93,106.73,104.72,104.95,104.82,104.18,103.59,102.35,103.03,101.96,101.5,102.22,102.78,103.02,103.19,102,102.75,101.04,100.37,100.19,98.22,97.5,98.35,97.28,98.49,98.49,98.49,99.02,99.95,100.92,100.87,100.8,103.54,103.54,103.98,102.32,103.92,104.58,104.69,105.63,105.7,106.13,106.13,104.84,104.43,104.34,102.3,104.15,105.56,105.85,109.83,110.03,111.45,110.96,110.48,110.88,110.52,110.88,110.58,111.52,110.63,110.61,111.8,111.23,110.66,112.16,113.09,110.54,111.72,110.82,110.96,111.36,109.77,109.1,109.93,109.17,109.55,109.45,109,109.65,110.53,109.88,109.02,108.84,109.87,109.32,109.32,108.07,109.52,111.76,112.55,112.39,112.92,114.24,113.16,114.83,115.91,117.57,117.23,118.43,118.65,120.14,122.99,125.24,124.61,122.39,125.36,122.58,122.12,118.79,117.48,120.05,121.67,122.12,121.2,121.17,121.16,121.61,123.78,124.52,124.52,124.52,126.15,128.17,126.21,126.89,124.66,124.82,120.63,122.81,117.88,120.05,119.08,122.27,118.7,118.35,115.45,115.01,115.92,118.86,117.1,116.8,118.74,119.05,120.22,118.27,118.51,116.46,113.7,112.61,114.94,114.69,115.51,115,117.57,117.57,117.57,117.57,116.03,116.44,115.05,113.98,113.72,115.28,114.3,115.58,116.27,116.19,114.12,114.65,116,115.1,115.12,115.44,115.81,113.46,112.28,112.84,112.38,112.74,112.14,111.63,109.33,110.64,108.37,109.05,110.09,111.67,111.67,111.55,112.17,111.53,113.12,113.78,113.7,113.13,114.13,115.19,114.79,113.48,113.25,112.65,112.46,112.2,112.32,112.68,112.68,111.82,110.71,110.99,111.58,110.55,109.73,111.87,111.91,114.02,113.86,112.75,111.76,111.76,109.17,107.68,107.64,106.38,102.95,103.61,104.24,106,105.49,106.64,106.41,104.38,103.39,103.04,104.88,103.12,98.05,93.07,95.07,98.69,96.77,97.86,97.69,98.72,97.44,97.2,97.62,99.56,100.07,99.21,98.29,97.11,94.94,95.9,93.45,91.63,92.4,95.36,95.13,93.67,93.89,94.29,96.25,97.17,97.91,97.39,98.22,99.24,99.04,96.25,98.38,96.83,95.19,93.66,92.29,93.71,90.54,90.56,90.56,91.54,90.19,89.97,91.4,91.82,91.46,91.46,89.31,89.25,88.17,91.32,91.98,94.32,92.75,92.75,92.75,93.97,94.03,95.76,97.23,97.2,98.07,97.7,97.05,95.31,94.88,93.93,93.27,92.9,92.83,93.84,92.45,92.17,92.3,93.4,94.84,95.53,95.23,96.7,96.35,94.71,94.02,93.59,92.52,92.18,92.33,89.89,89.07,87.71,88.32,89.16,88.62,86.73,89.37,89.33,90.74,89.91,89.62,88.24,87.44,87.51,86.13,84.3,85.33,85.89,85.99,85.96,85.96,85.89,84.88,84.86,86.33,85.83,85.74,84.01,84.57,86.27,87.68,87.72,90.27,90.16,89.66,88.71,88.55,88.48,91.83,92.1,90.75,89.12,89.22,86.9,86.05,87.52,87.52,87.52,87.52,89.97,90.03,89.23,91.43,92.13,92.07,90.33,89.38,90.96,91.3,89.49,88.63,86.69,87.17,84.17,83.76,84.1,84.4,82.89,82.8,80.57,77.69,75.86,75.35,76.05,74,68.71,64.18,72.21,77.64,77.21,75.93,79.01,80.02,78.9,76.34,77.52,78.74,79.75,78.88,79,81.45,81.45,79.75,78.56,78.51,75.55,76.14,76.67,77.41,77.41,77.41,75.12,74.4,72.97,73.08,70.06,70.72,71.12,72.51,76.5,76.5,76.17,74.81,74.6,71.37,71.37,69.79,70.95,69.12,71.34,71.55,74.17,74.3,72.31,74.64,73.6,72.14,72.3,72.08,74.23,76.04,77.73,76.99,76.17,76.17,78.61,78.27,80.49,79.72,79.76,76.94,76.86,78.11,76.09,77.22,77.56,79.13,76.88,78.22,79.96,81.93,82.73,80.65,80.36,80.36,80.16,80.1,79.09,79.02,79.15,76.73,75.38,74.9,74.69,72.93,75.14,74.39,75.24,74.41,74.49,74.17,75.31,74.33,74.23,72.17,72.07,70.24,70.61,72.11,72.34,71.5,71.22,69.64,71.52,71.87,71.42,70.52,70.8,70.23,70.43,70.17,69.69,68.81,71.78,72.54,72.03,71.69,71.95,70.66,69.93,68.94,68.71,68.27,67.46,69.47,69.47,69.52,67.82,68.22,67.29,66.43,67.13,65.69,64.94,64.08,64.33,64.46,62.45,61.97,61.99,61.39,61.39,65.24,64.83,63.67,61.64,60.05,59.66,58.28,59,59.04,60.33,58.67,57.77,57.83,53.6,54.29,54.69,54.95,52.71,51.76,54.6,56.13,54.19,57.46,59.07,58.72,58.01,56.78,61.5,62.67,65.71,65.25,64.36,64.2,62.91,61.85,62.31,62.81,62.58,61.55,65.37,66.81,66.92,66.75,70.29,69.73,67.42,69.87,71.63,69.47,69.75,70.25,69.09,69.54,69.22,67.84,68.13,70.39,69.62,69.62,69.62,70.99,70.18,70.27,70.27,71.63,74.05,75.17,74.87,76.37,76.13,76.63,76.64,77.47,77.04,76.66,76.94,76.64,78.44,78.44,78.44,78.44,80.77,81.48,78.57,77.82,79.24,78.67,77.42,75.35,75.8,75.35,76.66,74.69,74.88,74.52,73.56,74.31,73.28,74.04,72.58,71.61,71.9,70.26,69.91,68.98,72.47,71.87,72.73,72.71,72.45,70.51,69.69,67.56,69.07,67.49,68.75,67.94,69.34,67.81,68.65,69.59,71.65,71.22,69.68,70.53,72.1,72.56,73.04,72.74,72.06,72.06,72.26,72.26,72.26,72.85,71.97,72.06,72.47,73.96,73.4,72.2,72.27,70.9,70.57,69.19,69.74,69.96,70.25,70.25,70.02,69.06,70.42,71.25,72.29,70.59,70.05,70.17,69.84,71.06,71.16,69.56,70.39,69.11,70.16,69.21,67.9,66.38,66.38,65.52,65.86,64.6,64.45,67.38,67.75,67.91,68.56,68.55,69.06,69.02,69.37,68.93,70.98,71.62,71.02,69.75,68.19,68.19,67.02,66.79,68.17,68.35,67.36,67.34,69.08,69.32,68.02,65.7,64.97,65.35,65.99,66.85,68.59,68.74,68.74,67.08,66.89,66.7,67.24,65.73,69.22,68.64,69.92,71.36,72.31,71.84,69.9,69.72,70.56,70.58,69.05,69.31,69.47,68.55,67.33,66.73,65.75,65.95,64.43,63.21,63.91,64.12,65.69,64.72,65.47,66.94,66.62,66.37,66.37,68.48,67.04,67.12,66.18,66.18,66.02,65.61,65.36,65.77,66.13,65.08,65.36,64.79,63.93,65.64,64.25,63.21,63.62,62.79,64.44,64.44,62.35,61.66,61.71,62.62,62.87,63.44,64.28,65.69,64.1,63.41,63.86,63.68,62.09,61.54,61.54,60.78,61.36,61.41,62.67,62.47,61.44,61.41,61.95,63.43,64.79,63.8,63.3,63.2,61.85,62.77,62.51,65.03,64.11,62.62,63.97,63.69,63.67,64.68,63.32,63.15,62.44,60.99,61.39,60.39,59.78,58.79,59.36,58.86,58.67,57.99,58.85,58.18,58.42,59.75,59.05,58.62,58.83,58.9,57.53,57.53,57.53,58.73,60.42,60.46,59.45,59,59.21,58.77,57.44,57.12,56.82,57.59,57.46,57.08,56,53.8,54.21,53.74,52.43,53.88,56.11,57.32,56.18,56.69,55.29,54.44,54.75,54.7,54.68,57.37,56.82,56.18,55.62,55.62,55.62,56.45,56.71,58.26,57.49,57.85,59.14,60.35,60.42,59.99,60.86,59.62,59.51,60.04,59.88,58.3,59.46,58.84,59.29,60.25,62.36,62.18,61.91,61,61.29,60.58,60.83,61.89,60.35,60.31,61.06,60.04,60.9,60.9,60.9,62.47,61.58,61.58,61.46,61.51,61.79,63.06,62.93,61.62,61.38,60.2,60.26,60.83,60.23,61.12,62.41,63.94,64.15,65.71,65.85,65.76,65.76,67.47,68.62,68.89,68.41,67.67,68.76,70.42,70.87,70.66,70.66,72.02,72.68,73,71.49,71.46,70.24,69.23,70.1,70.08,68.73,67.74,67,68.46,68.7,68.57,68.7,68.24,68.24,67.62,66.65,67.31,66.81,66.8,66.74,69.05,68.71,67.5,67.51,67.75,67.89,66.28,66.36,66.36,66.82,67.66,67.82,66.89,65.87,65.77,65.52,66.78,68.47,67.31,66.2,66,66.1,64.62,65.55,64.93,64.38,63.06,63,63.73,62.75,64.01,63.79,62.62,61.59,61.34,62.19,62.27,63.07,63.2,63.4,63.15,63.26,64.58,65.25,64.94,64.37,65.24,65.18,65.81,66.1,65.25,65.48,66.36,65.1,65.02,64.29,63.99,63.99,62.92,63.16,62.7,63.07,63.64,63.83,64.73,64.73,66.09,66.88,66.96,70.37,70.91,74.28,76.51,78.71,78.71,84.28,82.95,85.49,87.32,78.44,77.2,79.87,79.87,79.45,76.28,76.18,75.25,78.31,76.94,77.17,78.38,77.13,77.4,77.47,77.74,76.37,76.14,76.96,77.22,79.2,77.18,79.1,78.2,77.09,74.7,74.74,73.08,73.16,73.97,74.23,74.32,73.73,72.18,71.92,71.81,73.65,72.58,72.81,73.46,74.12,74.26,73.52,74.8,77.15,76.58,75.98,77.14,75.32,74.76,74.47,75.26,74.96,74.87,75.61,76.55,76.55,76.55,76.57,76.31,76.41,74.32,75.04,74.79,73.89,73.27,73.15,72.3,71.73,73.23,73.49,74.4,74.51,75.84,76.73,75.22,75.09,76.64,77.38,77.37,77.37,77.37,77.37,77.39,80.11,79.3,80.6,81.58,83.29,82.2,84.46,83.88,87.32,87.24,88.83,88.7,87.23,90.84,90.33,89.08,92.16,91.55,88.22,88.25,87.7,90.46,93.68,93.43,91.45,91.76,91,90.56,93.05,93.58,96.19,96.04,93.81,91.63,92.76,90.3,90.71,90.95,90.2,89.26,89.48,89.42,88.25,88.25,76.12,77.88,78.98,80.37,81.77,83.49,83.67,81.53,82.77,82.77,82.77,83.33,85.07,84.44,84.69,84.69,84.56,84.65,84.65,86.27,86.27,86.59,86.39,86.99,87.08,89.71,87.9,90.06,89.19,88.76,88.67,90.02,90.78,89.69,89.97,88.43,88.77,88.5,89.71,88.38,87.61,89.3,89.89,91.02,90.45,92.02,91.89,92.92,91.5,90.72,91.5,91.13,90.08,88.16,89.37,90.11,91.82,92.85,92.27,91.84,90.96,90.96,91.45,90.64,90.23,90.23,91.28,90.11,90.85,91.05,91.53,93.04,92.88,92.79,94.19,94.75,95.12,96.86,97.03,95.91,96.19,95.86,94.73,93.1,92.28,93.21,93.82,93.62,94.14,93.23,93.16,93.46,95.9,95.68,94.74,94.68,94.39,94.47,94.06,95.17,96.93,95.89,94.54,93.46,93.78,95.61,95.46,94.85,93.67,94.93,95.6,96.87,97.77,97.06,98.15,98.36,98.38,100.58,99.11,99.28,98.21,97.37,98.97,98.98,97.51,99.09,100.15,100.15,101.92,101.23,100.34,100.34,99.82,99.89,98.08,96.66,95.16,96.96,97.05,94.45,96.77,97.5,96.67,97.48,98.14,99.23,98.27,98.27,97.96,96.1,97.04,96.14,96.04,98.06,97.13,98.97,99.17,99.98,100.61,98.5,97.77,96.16,95.91,95.83,93.49,95.16,95.99,96.03,96.06,95.69,96.14,96.24,94.63,95.44,96.41,95.2,93.66,93.85,93.64,95.16,93.47,91.79,92.69,92.67,93.29,93.7,93.43,93.44,93.44,93.44,93.19,94.23,93.42,96.1,95.89,96.89,95.78,94.74,94.84,96.64,97.32,97.64,97.13,96.64,95.74,95.32,95.62,95.53,96.01,95.87,96.9,99.7,100.12,97.65,95.17,94.89,94.84,95.31,94.66,96.09,96.87,97.14,96.17,94.67,95.07,95.07,95.07,95.07,93.91,96.4,94.41,94.69,92.38,92.86,91.2,90.23,88.92,88.58,90.43,89.94,91.29,91.23,91.18,90.89,92.4,92.51,92.6,91.14,89.86,87.07,89.08,89.96,87.93,88.6,88.03,87.77,89.14,88.64,88.64,88.64,88.64,90.95,90.26,90.71,90.16,90.89,91.38,93.33,92.7,93.27,93.74,92.25,91.53,91.98,91.77,90.61,92.29,90.99,90.99,91.96,91.5,92.24,93.49,93.17,93.12,93.1,93.03,92.85,91.09,90.12,90.56,90.19,88.83,89.62,89.62,89.89,88.7,87.67,88.31,89.17,91.84,90.1,89.11,88.42,87.43,87.25,87.19,86.12,87.77,87.79,86.36,85.36,83.6,83.6,82.95,81.33,81.38,79.74,78.2,79.71,79.22,79.22,79.79,80.7,81.88,81.44,84.73,83.82,84.26,84.54,84.93,85.78,87.18,85.28,87.85,87.63,86.48,87.54,86.69,87.68,88.42,90.38,90.61,90.26,90.68,89.87,90.18,89.08,89.42,90.37,89.38,88.53,88.32,87.42,88.46,88.6,88.79,89.59,90.5,88.79,88.52,89.44,88.99,88.99,89.23,88.7,88.57,87.89,89.67,88.35,88.01,87.72,86.73,86.43,86.83,86,86.01,85.69,86.21,87.41,87.65,86.72,86.64,85.59,86.12,85.72,86.15,86.15,84.17,84.39,85.2,84.71,83.96,85.4,85.61,85.68,85.77,84.93,85.19,85.19],"KOSPI200":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100],"Nikkei225":[null,null,100,101.39,101.09,101.39,102.16,102.31,101.99,102.63,102.51,102.61,100.8,100.8,99.45,101.05,101.01,95.6,102.03,102.21,103.96,103.94,105.08,105.08,105.7,106.51,106.85,106.85,107.85,108.13,107.99,107.7,107.7,108.91,108.4,107.51,108.01,108.81,110.39,111.75,112.68,113.25,113.26,113.38,114.13,114.08,114.68,114.39,114.29,114.29,114.11,114.14,114.14,112.63,112.44,112.44,112.44,115.27,114.83,114.44,114.44,113.55,113.92,112.56,113.46,112.33,110.67,111.15,112.2,112.58,111.13,110.52,112.11,114.14,114.52,113.94,112.02,112.64,111.27,111.29,111.63,111.25,111.82,111.23,114,114.47,113.18,114.35,113.82,113.15,113.25,114.02,114.01,113.96,113.44,112.4,112.47,114.09,115.09,114.53,114,113.8,113.27,113.65,115.33,115.5,115.36,115.17,115.24,114.84,114.84,114.45,112.02,112.27,113.32,111.69,112.97,113.05,112.14,111.24,111.67,110.66,110.96,109.4,109.8,110.58,110.29,109.14,108.4,107.86,107.98,108.35,108.43,108.42,109.54,111.04,112.24,113.47,113.25,112.93,113.6,114.39,114.39,114.39,114.39,117.04,116.73,117.07,117.43,116.97,116.89,117.18,116.57,115.03,115.25,115.76,115.38,116.14,116.56,115.81,115.79,115.76,115.6,116.83,118.7,118.66,117.54,117.56,117.12,117.73,117.12,117.06,116.97,116.67,117.32,118.05,119.01,118.47,118.3,118.44,118.56,118.98,118.42,118.95,117.85,117.98,117.84,118.13,117.62,117.24,118.13,118.8,118.23,118.24,118.35,118.35,117.65,117.78,118.51,118.24,117.51,117.39,117.95,118.12,117.42,117.21,117.57,118.13,117.83,117.37,117.98,117.63,116.12,116.06,116.06,114.93,116.2,116.06,115.91,114.54,114.08,114.03,114.33,113.85,114.43,114.42,113.9,114.75,115.57,115.84,114.76,114.04,113.88,114.1,113.39,114.98,116.34,116.87,116.52,117.12,117.12,119.42,119.48,119.7,119.4,119.99,119.6,119.23,119.79,119.75,120.01,121.27,121.34,121.35,121.72,121.72,122.5,122.84,123.27,124.45,125.04,125.51,125.67,126.18,126.23,127.64,128.27,127.7,127.89,129.47,129.49,129.49,131.89,132.59,132.59,132.65,134.94,134.8,134.53,133.43,131.66,131.66,129.59,131.49,131.75,130.96,131.87,132.5,132.5,132.66,132.34,132.28,132.93,133.68,134.24,133.58,133.08,130.46,132.35,134.19,134.94,134.52,133.88,133.51,132.67,134.72,134.53,134.67,134.52,134.73,134.95,134.67,134.78,134.03,133.92,133.92,133.92,138.28,139.51,139.51,140.3,139.94,139.48,139.15,139.51,140.9,140.41,139.79,140.06,140.11,141.92,140.84,139.24,139.02,139.01,137.02,135.88,138.16,136.92,133.43,127.13,127.33,128.78,125.79,125.79,124.98,124.44,126.27,127.77,130.3,128.98,129.25,127.87,128.79,130.32,131.71,129.82,127.8,124.61,123.78,125.99,125.02,125.7,126.3,128.38,129.23,128.11,128.27,127.52,126.37,125.78,125.78,127.02,121.29,122.16,125.4,123.72,124.47,126.21,125.82,125.26,125.42,127.33,126.88,127.53,128.21,127.58,127.42,128.12,128.45,128.52,130.35,130.54,130.37,129.94,131.06,130.69,131.3,132.17,132.17,132.41,132.2,132.2,132.2,132.17,132.41,131.83,132.34,133.88,134.51,134.23,133.64,134.35,134.89,135.32,135.07,133.48,131.99,132.07,132.25,131.53,129.53,130.61,130.43,132.22,132.59,133.1,134.26,133.51,134.15,134.59,135.11,133.77,134.43,133.42,131.06,132.69,133.5,132.46,131.41,131.43,131.02,131.01,131.21,128.31,128.16,127.76,126.76,128.17,129.73,130.58,129.02,130.53,132.93,132.93,133.52,134.09,133.92,133.53,131.76,132.42,133.03,132.87,133.61,132.63,132.68,133.81,132.44,132.51,132.4,133.32,133.21,132.94,131.17,128.58,131.51,130.62,130.55,131.01,130.59,130.71,131.55,131.84,132.96,134.12,134.21,134.41,134.54,134.51,133.58,133.52,132.84,132.29,131.23,131.61,133.33,132.98,134.25,135.86,135.86,137.78,139.26,139.27,140.42,140.42,140.83,141.38,139.99,141.89,142.63,142.78,141.84,141.04,139.91,139.91,138.06,138.28,132.9,133.51,131.02,132.65,134.37,133.29,132.55,133.04,129.48,129.96,125.12,124.62,124.42,126.23,128.95,127.58,130.85,128.83,130.29,129.92,132.28,130.89,131.01,128.31,128.52,128.26,127.54,128.37,126.97,126.52,127.34,127.34,128.31,129.14,130.46,130.96,131.49,132.8,129.63,128.95,126.49,127.53,124.83,124.41,127.08,128.34,125.74,126.52,124.22,123.47,119.96,118.63,118.63,112.69,113.7,118.11,117.74,117.74,117.74,117.74,115.08,117.88,118.85,120.17,118.62,119.77,119.77,120.92,120.26,120.02,121.57,121.89,121.32,121.15,121.03,122.21,121.47,121.56,120.93,122.2,122.29,122.85,122.62,122.8,122.07,119.61,119.61,122.74,124.39,124.36,122.95,125.2,125.32,126.08,126.27,126.04,126.64,126.18,126.81,125.8,127.08,128.37,127.81,127.05,126.22,123.69,124.27,126.5,125.24,125.23,126.19,126.98,126.87,127.12,127.12,127.23,123.4,126.06,125.77,123.74,124.75,126.53,126.51,127.73,127.8,128.29,128.02,128.26,127.58,127.72,128.66,130.41,130.72,131.06,129.95,130.6,130.7,130.95,130.6,131.23,130.94,130.94,130.94,130.94,130.94,130.94,130.94,128.97,127.08,125.9,125.57,124.66,123.93,124.65,123.91,125.01,125.31,125.14,125.2,124.43,124.23,124.61,125.07,123.56,123.2,121.19,120.07,120.06,122.22,122.21,122.86,124.33,124.74,124.3,123.73,124.22,124.27,123.38,125.5,126.26,125.06,125.22,124.68,124.05,125.53,125.16,127.83,127.97,127.29,127.67,127.93,126.68,126.86,126.68,127.32,127.57,127.57,126.69,126.3,123.81,126.28,125.99,127.19,127.71,127.99,127.41,127.17,127.71,126.61,126.72,124.05,121.89,121.1,120.69,121.15,121.68,121.68,120.33,121.51,120.04,120.12,120.97,121.64,121.29,121.35,121.84,119.19,120.34,120.47,120.37,121.8,121.3,121.33,121.47,124.04,124.71,125.41,125.84,127.05,128.01,129.35,129.35,129.43,129.19,129.68,129.89,129.89,130,129.54,129.7,128.71,127.98,128.74,128.12,125.55,125.95,125.74,127,126.22,126.78,128.24,128.24,130.64,132.2,132.08,132.32,132.65,132.65,133.1,133.84,134.13,134.52,135.15,134.38,134.87,134.42,134.42,136.79,137.09,137.25,137.61,137.25,138.36,137.18,136.14,137.09,137.75,137.02,136.18,135.53,135.97,137.03,137.5,137.88,137.71,137.03,138.42,137.54,136.1,137.07,137.39,137.84,137.72,137.61,137.8,141.32,140.91,141.57,140.8,140.39,140.11,140.13,140.19,139.91,140.74,140.23,139.17,139.17,139.17,139.17,136.51,138.69,136.51,139.66,140.31,140.31,141.33,140.69,140.79,141.43,141.68,140.39,141.37,139.98,140.17,137.32,136.57,137.53,135.17,136.51,135.14,135.8,137.18,140.44,140.17,139.34,139.34,140.37,140.17,139.35,138.38,136.44,137.66,138.12,137.58,137.58,132.98,131.93,129.12,124.38,125.56,124.02,124.13,125.47,122.07,115.88,116.87,114.22,109.18,102.54,100.02,100.07,98.4,97.38,97.38,99.35,106.43,114.99,109.8,114.06,112.27,111.28,106.27,104.82,104.83,109.28,111.48,113.85,113.81,114.7,112.03,115.53,115.01,113.48,117.05,115.71,113.42,112.58,114.3,113.31,116.38,116.31,116.31,118.79,115.42,115.42,115.42,115.42,115.74,118.71,119.95,119.81,119.23,117.15,117.88,118.44,120.2,121.16,120.9,119.94,122.02,125.13,126,128.93,128.7,129.79,131.34,133.03,133.51,134.5,136.35,135.84,136.04,132.2,131.22,126.66,132.85,132.1,131.51,132.24,131.99,132.65,132.56,130.95,132.43,129.39,131.12,130.14,130.28,131.22,133.62,133.04,132,132.53,131.13,134.04,132.87,134.98,133.95,133.52,133.64,134.62,133.84,133.84,133.84,133.63,133.29,131.76,131.42,127.71,130.57,132.79,132.45,131.88,131.36,131.36,133.83,134.38,136.77,137.01,135.87,135.6,135.95,134.6,134.83,135.22,137.05,137.01,136.53,134.61,136.12,136.12,136.76,138.04,136.51,135.83,136.92,135.49,136.69,137.69,138.59,137.98,138.1,137.18,137.42,137.42,137.42,137.34,135.82,136.51,138.31,138.47,136.39,136.39,135.48,137.14,137.85,137.79,139.11,138.95,138.59,138.84,138.99,138.29,137.72,139.25,138.64,139.06,138.09,138.34,138.21,138.16,137.76,137.26,135.17,137.04,137.04,139.39,141.8,143.1,146.13,146.51,149.12,150.13,149.34,152.4,153.04,151.35,150.8,150.17,150.17,153.93,154.7,156.11,156.74,155.5,157.58,157.66,157.71,157.37,156.17,155.7,157.76,157.4,156.79,157.26,157,157.41,157.7,157.44,157.15,155.52,156.04,156.88,156.81,157.98,162.18,161.45,161.45,160.35,159.77,159.16,161.72,165.53,165.53,165.68,167.4,168.82,167.77,166.14,168.44,167.79,169.17,168.43,169.55,167.93,168.45,165.88,162.74,165.25,166.85,168.52,166.73,169.3,172.88,173.58,173.91,173.91,173.66,176.98,179.23,178.2,177.87,176.59,177.4,177.4,174.55,177.47,170.4,174.5,173,173.89,170.19,169.8,169.09,170.76,170.81,171.84,174.82,175.11,176.02,175.98,177.76,175.26,171.62,170.58,167.1,169.01,171.64,172.86,173.14,171.65,172.89,175.62,177.01,174.7,174.9,174.77,175.12,173.77,175.02,174.25,174.38,174.62,174.63,171.19,167.71,171.71,170.72,171.34,170.55,170.92,170.92,169.5,169.5,169.5,169.5,172.55,172.7,173.65,168.3,165.58,161.47,165.21,163.69,167.11,164.98,165.29,166.59,166.86,167.98,168.49,167.95,171.48,169.78,169.51,170.28,170.94,170.26,170.71,170.38,169.78,170.36,170.3,171.55,173.2,172.31,170.71,170.39,164.78,169.92,169.86,169.87,170.99,170.88,169.5,169.37,168.88,169.32,168.24,168.5,166.88,165.41,164.37,168.06,168.94,168.3,166.36,164.73,162.67,161.12,162.06,162.06,162.06,163.74,164.54,162.26,163.44,160.5,163.43,162.61,162.27,163.12,163.66,163.66,164.06,165.13,164.8,164.58,161.91,161.33,162.28,160.49,158.91,161.74,163.14,163.1,163.2,162.61,163.48,165.24,167.37,167.91,171.35,174.48,175.99,177.55,176.53,178.73,179.11,180.42,179.49,178.38,179.42,179.42,175.54,174.36,174.36,177.95,177.89,177.56,173.8,173.26,169.25,167.33,163.67,161.94,162.82,165,167.65,166.07,165.54,167.96,171,170.75,171.87,172.1,168.88,169.45,168.25,171.22,171.18,169.54,169.97,174.41,173.66,173.66,175.27,174.2,173.58,172.28,171.23,172.23,174.19,175.17,175.35,174.65,174.12,174.99,175.15,175.15,172.38,173.54,169.14,166.39,163.67,164.34,163.27,164.89,164.29,167.4,169.78,168.98,167.29,168.48,167.26,167.42,170.99,167.93,164.35,167.76,168.02,169.41,169.32,168.7,171.01,170.05,169.37,169.37,169.37,172.37,172.55,167.59,167.53,167.53,166.03,169.22,167.59,165.45,166.68,166.23,161.58,163.38,161.91,162.29,159.61,158.9,153.95,157.17,158.85,159.3,161.97,160.25,161.42,160.3,160.51,162.24,162.93,162.93,159.3,158.04,161.54,160.2,159.55,158.31,155.6,155.6,152.78,155.75,156.05,157.92,155.26,156.35,152.87,148.37,145.84,145.41,151.13,148.03,148.88,149.11,151.55,156.79,157.82,157.82,160.15,164.95,165.37,165.6,164.39,166.2,164.88,163.67,162.75,163.17,163.47,160.89,158.18,158.75,157.78,154.92,157.91,159.85,159.38,157.66,158.75,160.12,162.09,159.45,156.43,157.07,155.23,157.94,157.94,157.77,157.77,157.77,157.77,158.85,154.83,153.93,154.21,151.47,155.47,156.17,156.83,158.31,155.32,157.3,158.84,157.35,156.94,156.51,157.55,161.01,160.48,161.53,161.27,163.31,164.22,164.39,166.09,166.17,163.68,158.76,156.66,154.87,155.49,152.73,151.61,154.4,153.83,153.96,155.85,158.08,159.12,157.68,155.26,152.57,153.86,155.44,153.58,155.84,155.99,157.73,154.93,155.77,156.74,157.59,157.59,158.61,162.84,163.56,164.21,162.95,162.69,163.04,163.63,163.55,164.68,162.33,163.2,164.32,165.75,166.18,164.72,163.65,163.65,167.93,169.84,169.83,171.91,170.26,170.19,169.39,167.38,166.56,167.53,168.49,164,165.87,165.25,162.72,162.66,162.48,162.52,161.37,165.1,165.98,167.91,168.33,163.65,163.99,162.17,162.17,162.88,160.68,159.74,159.74,155.49,156.32,153.97,155.43,152.58,154.22,158.79,159.54,160.67,159.52,159.52,155.31,155.29,154.35,159.37,157.51,159.75,160.35,158.87,158.19,158.69,160.31,161.37,160.86,159.45,162.29,162.83,162.74,162.74,160.01,161.94,163.96,163.05,161.46,166.27,164.5,164.66,164.88,164.31,164.13,164.39,165.4,165.4,166.97,166.38,165.67,164.88,164.53,166.05,163.41,163.66,164.05,162.87,162.21,164.13,163.79,164.45,165.64,165.02,161.93,160.23,156.29,155.23,155.94,154.33,155.34,155.59,154.95,153.5,153.51,153.51,153.51,151.29,151.9,152.8,152.8,153.98,155.57,155.6,153.65,151.91,153.77,157.6,155.33,156.21,158.28,160.59,161.16,160.97,161.08,161.38,160.76,160.87,161.2,161.83,162.91,162.87,162.4,162.27,162.78,161.35,162.38,161.79,162.93,161.85,161.96,161.62,159.45,159.45,161.5,161.33,161.45,161.87,161.77,164.29,166.12,166.54,167.33,168.38,165.56,163.73,160.14,160.18,158.9,160.8,158.51,158.51,161.58,161.3,161.1,161.64,161.88,164.03,163.44,164.96,165.82,166.41,163.62,161.61,161.88,162.56,164.27,165.2,165.64,167.62,167.74,168.59,168.29,168.58,168.04,168.21,168.36,167.17,167.41,169.75,171.32,171.53,171.53,171.53,171.53,170.3,172.03,171.32,171.34,172.88,174.28,175.56,177.03,179.86,181.24,182.88,182.12,180.5,181.19,181.87,183.74,184.3,181.71,183.24,185.45,189.53,191.23,187.74,186.14,189.81,190.8,194.24,197.09,196.99,198.28,196.31,196.42,197.51,195.69,192.84,192.36,191.41,195.27,195.51,195.24,198.56,196.62,196.12,192.79,190.53,189.36,189.44,187.92,190.71,190.55,190.55,191.15,193.52,191.13,190.04,192.37,192.26,192.18,193.49,192.71,195.14,196.93,192.41,189.18,189.38,189.74,190.47,189.45,191.03,191.03,188.6,189.65,186.88,186.05,185.02,185.69,187.4,188.31,189.94,186.04,189.25,189.58,190.21,191.89,192.43,193.77,194.35,195.55,194.08,191.82,191,192.81,192.4,195.12,197.27,197.27,195.56,194.27,191.61,190.61,192.24,190.1,190.44,187.5,187.41,186.83,183.76,179.58,182.81,182.33,182.33,186.76,187.87,191.16,190.11,186.24,188.48,188.5,184.9,183.89,182.36,182.73,183.95,180.02,182.32,180.58,181.53,185.9,187.95,187.95,192.42,189.85,189.23,192.05,191.59,191.69,192.34,197.19,196.63,197.57,196.41,196.21,196.79,196.79,197.81,196.76,196.53,196.02,196.99,196.67,195.49,192.81,196.75,193.3,190.06,192.91,193.21,193.7,192.28,193.96,192.71,195.42,198.11,194.96,195.12,195.62,195.93,198.14,197.3,196.86,196.86,196.86,195.83,196.35,196.35,198.62,202.61,206.19,209.29,211.2,209.54,208.71,208.64,211.56,215,214.82,213.11,213.17,210.31,211.94,212.17,213.46,211.85,212.71,213.86,212.72,212.48,216.86,217.06,217.06,223.33,221.8,224.47,226.41,226.31,225.68,225.09,230.01,230.01,230.8,230.84,230.65,230.4,234.78,235.95,235.88,235.84,232.95,233.48,228.37,228.24,227.64,228.29,227.71,233.78,235.33,235.33,240.11,240.54,237.75,237.65,239.8,236.3,237.48,234.15,234.36,232.08,233.97,229.38,231.47,233.97,232.85,232.03,232.51,230.8,226.32,223.32,224.01,218.06,220.24,220.91,226.25,221.36,223.16,223.16,225.93,225.16,224.93,224.93,224.93,228.46,224.73,223.98,224.89,224.6,225.64,225.81,228.96,228.18,229.84,229.11,227.17,230.03,227.34,228.84,228.58,226.82,223.86,226.41,228.97,228.47,226.43,227.68,227.57,229.65,230.22,228.7,227.78,228.34,224.15,226.38,226.9,227.27,227.05,228.28,230.45,233.35,231.44,232.86,233.14,235.75,238.73,240.68,240.68,239.9,244.6,246.09,248.39,242.31,242.31,242.81,241.77,236.05,235.68,232.95,232.92,230.34,222.78,221.59,226.3,226.64,230.03,224.29,211.25,185.06,203.99,206.42,204.9,206.04,206.04,213.15,214.38,216.05,223.91,219.95,223.91,223.26,224.79,225.69,224.19,225.24,225.73,225.68,227.35,227.67,227.58,217.94,215.64,214.08,213.05,212.71,209.54,216.68,215.2,215.2,212.97,214.01,218.57,221.92,221.92,223.19,222.78,228.99,234.31,223.07,227.38,222.42,226.79,227.28,231.38,229.06,231.06,231.67,232.99,232.99,234.78,230.49,228.9,229.32,229.16,225.97,224.16,224.39,223.04,227.11,228.86,231.06,229.9,223.86,223.86,226.34,232.25,231.67,232.37,232.56,231.64,227.79,226.7,227.33,224.84,225.98,225.62,223.7,225.21,228.13,226.14,224.34,225.6,224.77,226.56,230.89,231.05,231.75,229.96,230.37,231.59,231.62,234.42,232.19,232.12,231.57,229.91,228.33,227.67,230.38,229.64,230.19,232.77,236.96,234.69,234.69,234.69,234.69,231.23,235.8,235.2,232.99,230.55,230.55,226.33,226.16,226.91,226.2,228.85,229.59,233.23,235.07,234.91,232.75,229.53,231.87,232.45,232.79,226.6,228.24,228.44,229.82,228.17,228.26,228.26,229.21,232.14,230.31,230.45,231.02,230.39,227.53,228.11,228.11,224.94,224.38,225.05,218.58,222.28,219.61,220.12,221.81,217,217.83,216.44,216.6,216.43,217.97,219.99,222.63,222.08,222.08,221.64,221.24,222.25,223.7,222.37,218.37,209.53,209.57,210.17,204.34,198.72,183.17,194.2,186.57,203.6,197.57,199.91,201.59,199.54,202.23,204.31,201.66,201.31,205.12,206.13,210.05,210.84,210.84,212.05,214.44,216.67,216.67,216.67,216.36,217.24,220.62,221.45,224.62,224.3,222.11,222.09,220.59,220.78,219.42,217.58,218.61,220.79,221.92,221.91,226.09,223.34,220.43,220.29,222.06,220.92,222.02,224.06,224.79,226.02,224.56,222.57,225.38,226.7,228.75,226.42,225.92,225.63,228.19,229.09,232.87,236.2,238.18,235.23,233.91,234.05,234.2,232.88,233.48,234.26,233.23,232.78,232.13,233.42,233.33,234.73,234.25,234.25,233.99,242.2,246.05,243.88,241.18,239.28,239.16,241.6,240.01,237.02,238.54,239.99,241.54,246.02,246.02,251.3,254.57,250.89,255.18,257.16,256.17,252.3,250.66,250.8,251.83,249.39,250.14,251.95,251.3,248.19,248.9,246.72,250.49,253.07,256.74,255.66,257.89,261.03,263.36,263.36,264.15,263.49,266.51,264.99,267.63,267.63,268.43,269.16,266.81,264.98,264.33,262.08,264.35,269.25,282.05,282.08,280.81,285.79,282.89,282.89,275.59,280.45,284,279.91,289.35,290.11,290.06,286.15,290.02,297.15,295.43,301.83,301.93,308.32,308.32,302.94,295.39,299.33,295.76,299.5,299.1,300.39,301.68,296.35,296.04,286.51,285.53,293.1,286.05,286.05,286.25,291.54,295.12,295.63,290.04,290.04,293.34,300.19,297.03,297.56,297.99,297.68,295.01,299.06,295.13,290.51,291.27,288.26,291.24,296.5,296.57,296.16,296.54,298.55,297.24,296.13,296.13,296.13,304.92,308.95,305.68,300.71,305.55,305.55,315.02,319.67,318.32,317.29,315.22,311.73,310.46,315.84,316.77,311.11,313.75,313.89,313.99,313.68,309.76,321.91,319.39,316.6,319.16,331.57,339.14,339.14,339.08,334.97,334.18,332.77,336.16,338.07,334.29,334.29,337.2,344.63,345.63,346.2,341.54,331.07,319.11,325.19,327.2,310.19,319.13,323.7,320.33,316.61,316.2,315.9,324.96,313.98,313.98,303.05,307.39,316.19,315.34,313.98,305.23,300.39,316.14,308.63,312.51,314.22,314.31,331.25,328.82,334.87,332.39,340.48,341.99,350.13,344,346.05,349.14,350.53,347.91,351.29,356.12,352.48,352.48,348.76,350.1,350.1,350.1,350.1,369.63,368.93,367.19,369.1,372.21,368.58,361.25,357.76,356.2,351.81,362.87,372.61,383.31,382.35,382.37,380.57,390.2,393.76,392.58,402.39,396.91,391.72,376.64,384.83,377.55,377.77,388.38,407.78,408.29,411.22,417.99,419.14,425.64,410.55,406.94,425.71,408.03,408.66,412.16,414.59,404.34,410.29,410.25,401.54,393.08,398.52,403.31,395.57,398.52,404.45,393.18,377.32,377.32,389.63,388.94,390.75,380.09,381.97,366.88,361.4,363.95,378.62,375.05,376.24,390.03,386.4,385.95,393.97,393.97,397.23,401.84,404.22,407.2,396.85,384.3,389.54,388.36,385.48,387.42,389.8,389.04,390.65,390.1,389.53,378.41,377.76,382.5,390.61,383.96,383.22,383.97,376.56,373.51,373.46,376.04,377.3,382.49,382.49,382.49,382.49,385.4,390.4,387.54,385.21,392.69,405.65,401.85,411.48,415.81,412,406.16,406.09,406.09,398.72,398.52,379,384.29,380.39],"S&P500":[100,100.62,100.84,100.7,100.69,101.17,100.78,100.61,100.31,100,99.98,99.3,98.66,98.22,98.06,100.24,100.61,101.73,101.93,101.78,101.77,102.53,102.37,102.85,102.61,103.37,103.59,103.68,103.68,104.08,103.54,103.68,103.4,103.04,103.08,103.68,104.03,105.4,105.63,106.26,106.13,106.83,105.96,106.37,106.19,106.4,106.78,106.52,106.32,106.46,106.46,106.7,105.8,105.77,105.28,105.28,106.18,106.78,106.7,107.08,106.7,106.7,107,106.77,106.97,106.97,106.65,106.84,106.45,106.81,106.52,107.22,108.08,108,107.91,107.26,107.17,107.2,107.26,108.04,107.81,107.83,107.91,108.53,108.92,109.49,109.93,110.47,110.38,110.56,110.56,111.23,111.11,111.16,111.33,111.44,111.15,112.67,112.01,112.07,111.7,111.38,111.12,111.21,111.57,111.61,111.24,112.17,111.99,111.84,111.61,110.23,110.44,110.32,110.23,110.11,110.91,111.03,111.36,111.11,110.93,110.99,110.65,110.86,110.77,110.85,110.69,110.27,109.52,109.52,110.46,110.14,109.95,110.78,110.45,111.65,112.33,112.27,112.33,112.12,112.31,112.45,112.3,112.37,112.83,112.83,112.72,112.84,112.6,112.43,112.97,112.89,110.84,111.25,112,112.58,112.79,113.07,113.57,113.61,113.61,113.47,113.42,114.28,114.7,114.56,114.24,114.42,114.45,114.36,114.24,114.76,114.64,114.39,114.42,115.38,114.6,114.54,114.48,114.66,114.7,113.77,114.77,113.79,113.96,114.23,114.23,114.39,113.32,114.05,114.15,114.06,114.9,115.11,115.65,115.64,115.71,116.33,116.32,116.27,116.15,116.49,116.52,116.41,116.25,116.17,116.45,116.51,116.25,116.47,116.67,116.38,116.34,114.66,114.8,115.96,115.9,116.06,114.27,114.06,114.2,115.33,114.93,114.69,114.89,114.94,115.04,115.57,116.23,116.46,116.46,115.58,115.94,115.92,115.75,117,117.4,117.49,117.36,117.57,117.75,117.88,117.95,117.59,117.67,117.41,117.42,117.9,118.04,118.47,118.93,119.19,119.34,120.01,119.88,119.67,119.95,120.16,119.96,120.06,120.27,120.36,120.44,120.48,121.1,120.62,120.81,120.25,120.4,121.38,120.99,121.1,121.3,121.32,121.69,121.85,121.83,122,121.54,121.43,121.55,121.27,120.6,121.59,121.27,121.43,122.22,122.13,122.13,122.38,122.33,123.54,123.49,124.5,124.25,124.12,123.66,123.64,124.01,124.69,125.09,125.28,125.22,124.71,125.83,126.51,126.1,125.99,126.24,126.19,126.19,126.05,126.15,126.38,125.73,126.77,127.58,128.1,129,129.21,129.38,129.24,130.15,131.02,131.02,130.56,131.79,131.58,132.16,133.22,133.51,133.44,133.52,135.1,134.19,132.73,132.79,132.71,129.89,124.57,126.74,126.11,121.37,123.19,124.9,125.23,126.9,128.44,128.48,128.48,127.73,127.03,127.16,129.19,130.71,129.05,127.62,125.92,126.56,127.95,128.29,128.23,128.8,131.04,130.87,130.04,129.3,129.19,129.42,127.58,127.77,127.53,124.32,121.71,125.02,122.86,122.5,124.19,124.19,121.41,122.95,124.37,125.22,122.48,122.89,124.94,124.25,125.28,124.91,125.93,127.27,127.38,126.65,125.57,125.57,123.89,124.12,125.41,125.55,124.53,124.84,123.94,123.66,125.25,125.68,125.65,126.87,128.05,128.27,128.39,127.51,128.03,127.92,127.58,128.52,128.12,128.53,128.27,127.97,127.97,126.49,128.1,127.22,128.6,129.17,129.26,130.37,130.28,130.69,130.83,131.05,130.53,130.85,130.72,130.44,129.91,130.13,129.31,129.55,127.77,128.05,126.95,127.74,127.83,128.23,127.59,127.59,128.69,129.78,130.93,131.38,130.45,131.59,131.73,131.6,132.12,132.41,131.88,131.76,132,132.63,133.84,133.43,132.56,131.79,132.44,132.3,132.95,133.57,134.04,134.42,134.39,134.19,133.24,132.7,133.55,132.54,133.59,134.03,134.35,134.63,134.58,134.35,135.18,136.22,136.26,137.03,136.43,136.45,136.45,136.22,135.84,135.34,135.04,135.3,135.8,135.85,136.57,136.61,135.85,136.58,136.75,137.82,137.77,137.29,137.11,136.66,137.03,137.03,137.53,137.48,137.57,136.45,135.7,135.64,135.45,131,128.3,130.13,129.36,132.14,132.1,130.2,130.16,129.6,128.88,124.9,127.23,125.03,124.21,126.15,127.52,128.87,128.05,128.77,129.58,132.32,131.99,130.78,128.2,128.01,127.04,128.39,128.67,126.53,124.24,124.61,124.61,123.8,125.72,126.13,129.03,128.75,129.8,131.22,126.97,126.97,126.78,123.82,124.04,124,124.67,124.64,122.26,119.72,119.73,117.89,116.03,113.64,110.56,110.56,116.05,117.04,116.89,117.89,118.04,115.11,119.07,119.9,121.06,121.56,122.11,122.09,121.45,122.75,123.02,123.96,125.59,125.59,123.81,124.09,124.26,125.31,124.33,124.15,126.08,127.16,127.28,128.14,128.74,128.46,127.25,127.34,127.43,129.07,129.46,129.12,130.52,130.52,130.72,130.95,130.49,131.33,131.49,131.38,131.31,130.94,131.85,131.33,131.19,130.33,129.27,128.99,130.89,131.27,132.19,132.07,132.73,133.22,133.2,132.81,134.25,131.71,131.59,132.54,131.92,132.4,133.29,134.83,134.83,135.12,135.41,136.03,136.18,135.35,135.82,135.83,136.72,136.64,136.71,136.4,136.61,136.61,136.75,137.96,137.66,137.6,138.25,138.4,138.53,137.49,137.2,138.52,137.9,135.62,135.41,135,135.5,132.23,133.29,134.07,135.26,134.47,133.56,134.7,134.32,132.72,132.9,132.9,131.78,130.87,131.15,129.42,129.06,131.83,132.9,133.72,135.12,135.75,135.7,135.43,135.98,135.76,135.89,137.21,137.62,138.92,138.75,138.51,137.19,137.02,137.55,138.34,139.4,139.81,140.88,140.88,140.63,139.95,140.12,140.75,141.07,141.72,141.75,141.27,140.34,140.85,139.98,140.37,141.33,142,141.25,142.29,142.06,141.7,140.15,138.89,137.88,133.78,135.52,135.62,138.17,137.25,135.56,137.61,133.58,133.91,135.84,137.49,136.4,137.52,137.45,133.89,135.36,134.92,135.81,137.53,137.62,137.62,136.67,138.15,139.95,140.08,140.06,140.11,141.12,141.53,141.42,140.98,141.34,141.39,141.4,140.7,140.69,139.51,140.37,140.02,139.28,139.98,138.27,135.79,136.87,138.82,138.2,136.05,137.29,138.17,139.68,139.49,140.87,140.59,140.98,140.43,141.39,140.89,141.29,141.56,142.14,142.93,142.81,143.28,142.84,144.22,144.76,144.59,144.69,145.08,145.45,145.17,145.4,145.5,145.62,146.74,146.82,146.73,146.18,145.95,146.26,147.36,147.68,148.3,148.3,147.71,146.43,145.46,146.38,146.6,147.94,147.47,147.31,147.74,149,149.01,150.08,150.13,150.07,150.73,151.48,151.61,151.58,151.58,152.36,152.36,151.48,151.93,153.2,152.12,152.66,152.23,152.98,153.99,153.56,154.63,154.39,154.68,155.98,156.58,156.58,156.16,156.21,156.39,154.97,152.53,154.07,153.93,154.42,151.68,152.78,155.07,156.82,157.34,156.49,157.63,157.9,158.92,158.66,158.95,158.95,158.49,159.24,158.63,156.96,151.7,147.11,146.55,140.08,138.92,145.32,141.24,147.2,142.2,139.78,129.16,135.54,128.92,116.65,127.49,112.21,118.94,112.77,113.3,108.39,105.22,115.09,116.41,123.68,119.51,123.52,121.54,116.18,118.83,117.03,125.26,125.06,129.32,131.19,131.19,129.87,133.84,130.89,131.65,135.18,132.76,128.69,131.64,131.57,133.4,135.36,134.65,138.23,136.96,133.12,133.68,134.89,133.95,135.49,137.78,137.79,134.97,132.61,134.14,134.67,138.91,137.45,139.74,138.66,138.98,138.98,140.69,142.78,142.47,143.16,143.7,144.88,146.85,146.36,150.2,152.01,150.82,150.02,141.18,143.02,144.21,146.94,146.41,146.5,145.67,146.62,147.25,143.44,145.02,141.5,143.58,145.79,146.53,147.19,147.19,149.53,147.91,149.07,148.23,149.78,148.38,150.37,151.73,151.21,151.64,152.92,153.18,154.06,152.16,151.22,152.34,151.35,153.23,152.66,153.83,154.93,155.49,156.49,157.5,157.6,158.03,156.77,158.96,158.64,158.61,159.04,159.41,158.7,159.21,159.75,161.36,161.94,163.59,163.86,164.97,164.6,165.84,168.39,162.48,161.15,161.15,156.68,159.84,157.03,157.11,159.11,159.94,159.2,157.87,156.1,154.29,155.92,152.22,152.67,155.11,157.61,156.85,158.15,158.98,157.46,160.29,158.05,160.8,162.09,163.51,166.2,165.15,164.06,163.81,163.83,161.15,161.91,161.56,162.4,162.96,159.93,159.45,153.82,155.66,153.77,155.67,158.44,161.93,165.08,165.03,166.96,166.73,168.01,166.33,168.59,170.56,169.74,167.78,168.44,167.3,168.24,170.96,170.69,170.69,171.1,170.31,172.23,172.54,172.43,173.95,173.62,174.1,172.72,172.49,172.28,171.53,173.74,174.05,175.05,174.44,173.76,173.4,173.53,174.14,174.14,175.66,175.27,175.5,176.63,174.03,175.26,176.26,178.88,179.86,178.68,178.75,179.16,178.49,177.2,177.2,178.65,181.14,181.19,180.65,181.3,181.03,176.38,178.1,174.66,177.47,179.93,180.12,182.07,182.78,184.13,183.93,183.86,184.17,185.04,185.04,184.93,184.87,184.06,183.72,182.29,182.52,184.6,180.08,179.22,183.49,182,179.62,177.21,180.67,179.7,182.25,183.34,185.25,185.44,186.64,186.35,186.89,184.13,184.02,185.31,183.89,182.89,183.85,186.91,186.74,186.15,186.83,189.04,189.04,191.77,191.58,191.86,192.67,194.16,194.12,194.76,193.96,196.12,196.82,195.78,194.45,196.26,194.45,196.58,196.93,196.88,196.72,198.05,196.62,197.16,195.85,195.98,197.58,199.04,196.96,195.26,191.07,193.39,196.28,195.78,194.11,193.54,195.59,195.43,197.37,196.95,197.32,197.55,197.7,197.7,197.6,197.89,197.17,198.91,198.75,198.79,198.43,199.35,199.74,200.1,199.7,198.62,198.54,195.93,198.67,199.69,199.48,200.63,201.3,201.77,201.82,202.09,203.15,204.67,204.67,204.26,204.94,203.19,205.48,206.19,205.46,205.7,205.03,203.49,200.26,203.29,204.97,205.38,207.47,207.96,206.98,206.94,207.81,206.69,206.31,208,207.04,208.28,208.63,208.43,208.64,208.91,209.77,210.11,210.66,209.17,206.93,207.19,208.87,210.65,210.97,211.44,210.2,212.06,212.97,212.68,212.75,213.35,213.28,213.28,212.56,212.28,211.3,209.67,210.14,208.94,210.71,210.38,208.46,204.92,204.76,206.71,209.22,209.52,208.94,204.69,205.01,202.56,204.89,202.23,204.36,205.2,206.9,206.51,205.09,204.59,205.21,208.71,210.27,210.98,212.54,213.32,213.96,213.73,214.74,215.13,214.05,216.15,216.57,216.96,217.76,219.17,220.08,220.9,221.1,220.33,218.51,218.63,220.21,220.21,221.06,220.49,221.23,220.92,220.22,220.58,221.09,221.09,216.06,218.92,214.77,212.23,215.24,213.42,215.93,220.4,221.08,219.49,221.59,219.56,217.92,221.48,219.55,217.29,214.81,218.63,220.86,222.23,222.23,225.31,225.08,225.4,224.72,224.13,225.56,225.42,221.05,220.83,219.94,219.62,221.64,222.26,219.09,219.27,219.27,215.24,213.16,210.8,206.82,207.39,204.86,204.56,203.46,208.41,212.35,213.8,215.82,210.55,211.64,210.86,212.63,215.72,211.81,207.79,206.99,210.25,210.44,205.98,204.51,204.51,202.43,198.71,201.68,206.19,205.69,202.5,206.28,205.2,203.57,197.56,196.13,201.17,200.31,197.71,196.24,200.44,204.93,207.46,209.88,209.79,212.16,209.56,212.56,213.64,215.17,217.8,216.43,213.05,213.77,215.5,212.8,210.73,211.63,211.06,207.5,206.79,209.1,206.56,206.56,206.52,209.84,209.71,206.61,200.88,202.03,196.34,196.75,201.62,194.31,195.41,196.35,202.22,195.01,193.9,187.69,188.15,185.05,184.81,189.23,188.48,192.28,184.51,183.44,183.46,186.87,185.35,187.1,190.82,195.54,195.54,194.32,192.86,196.42,193.21,193.81,195.66,193.55,188.94,183.44,176.33,175.66,178.23,172.43,172.81,172.81,177.04,176.81,178.5,183.95,183.41,179.71,179.58,178.01,179.89,179.89,180.17,180.82,183.52,183.37,181.26,179.58,178.78,178.24,181.67,180.15,185.13,186.22,188.05,186.3,186.54,184.39,189.21,191.51,194.23,193.68,192.39,195.4,195.25,194.93,194.69,193.86,197.99,197.85,201.28,202.08,202.45,200.99,201.45,198.85,194.59,194.16,194.72,197.47,190.81,189.54,187.45,185.99,186.54,184.54,184.54,183.79,187.16,188.39,191.27,193.29,184.94,185.56,183.46,182.15,183.39,181.33,178.22,176.72,173.68,171.88,171.52,174.89,171.2,168.62,172.98,178.27,177.91,176.09,171.16,169.87,168.77,168.21,172.58,168.5,172.96,174.93,173.77,172.39,176.48,178.57,181.48,180.14,179.04,183.45,182.08,181.34,176.8,174.93,177.31,179.02,180.02,176.28,186.05,187.77,186.09,187.71,186.16,185.59,186.47,185.75,188.27,189.38,189.38,189.33,186.41,186.11,191.87,191.7,191.47,188.05,185.34,185,186.39,185.02,187.66,189.03,187.88,183.2,181.16,179.53,179.71,182.39,179.75,180.81,180.81,180.07,177.91,181.01,180.55,180.55,179.83,181.19,179.08,183.17,183.03,184.31,186.67,187.31,188.06,188.06,187.68,184.76,183.35,186.81,189.03,188.9,188.87,190.94,191.42,188.94,191.7,193.71,196.56,194.52,193.33,195.81,193.64,191.94,192.36,194.56,194.5,195.04,192.35,191.82,191.82,187.98,187.68,188.68,186.69,187.27,186.7,185.82,187.23,190.25,190.38,187.46,187.73,184.26,181.59,181.32,184.31,183.02,186.23,184.18,185.83,188.24,185.14,185.69,186.74,187.05,186.75,189.41,190.49,193.24,193.96,192.83,192.35,193.04,193.04,193.23,193.23,192.43,194.98,194.58,195.22,195.39,195.37,194.21,194.38,194.55,191.47,190.74,194.47,196.07,196,193.73,192.37,190.98,194.51,194.6,193.71,194.58,194.25,193.94,194.51,193.27,195.57,197.42,197.13,197.16,194.95,193.52,195.22,197.76,197.76,197.77,196.56,198.5,201.38,200.98,201.45,200.68,201.92,202.16,204.04,205.46,205.62,208.13,207.36,207.36,206.38,205.3,206.06,204.48,203.57,205.9,205.82,206.75,209.28,209.53,209.53,209.11,207.46,206.86,207.36,208.76,210.31,212.09,211.87,212.69,214.2,214.71,213.26,213.32,214.18,214.79,214.75,213.37,215.48,215.8,215.22,212.25,211.7,210.58,212.48,211.59,210.1,210.15,209.92,211.13,208.69,207.12,205.52,205.49,206.9,206.33,208.61,205.8,207.18,208.48,211.5,212.31,211.98,212.36,212.36,211.47,209.99,209.32,209.62,211.03,209.82,210.08,211.86,209.28,209.43,208.98,207.02,203.62,203.15,203.97,200.97,201.01,202.2,201.65,201.66,198.89,200.51,200.24,202.61,203.89,204.95,205.83,204.54,203.52,205.67,205.65,202.9,201.18,198.64,198.31,199.75,196.89,194.56,193.62,195.95,197.22,199.29,203.05,204.95,205.31,205.9,206.1,204.44,207.63,207.46,211.41,211.75,212,212.27,213.84,213.41,214.28,214.28,214.41,213.99,214.2,213.99,214.8,216.07,214.9,214.77,213.94,215.64,216.52,217.37,218.37,221.35,221.94,221.92,222.93,224.24,220.94,223.22,223.59,223.59,224.54,224.86,224.94,224.3,223.03,221.25,220.49,220.89,224.01,223.68,224.94,224.79,224.96,224.96,224.12,222.86,224.83,227.6,228.09,228.76,228.95,230.15,230,231.74,231.6,227.87,230.72,233.18,232.44,232.98,234.9,235.03,236.38,236.16,232.93,235.16,236.53,235.39,235.39,233.98,234.27,239.22,239.3,238.4,238.8,238.41,239.66,241.57,241.29,238.83,240.05,242.53,240.94,240.67,243.37,242.9,242.2,240.63,242.15,243.52,245.69,246.49,246.14,245.39,244.7,246.81,247.09,247.09,246.59,244.81,245.07,242.05,244.74,244.65,245,242.68,244.49,240.93,238.04,237.55,236.17,235.65,233.59,235.63,238.45,238.5,237.41,239.83,240.59,236.81,235.99,238.15,241.14,243.63,243.95,243.95,245.2,245.6,245.54,246.73,249.62,249.1,249.39,249.62,250.24,249.57,247.72,249.46,249.46,249.52,247.68,246.2,248.18,248.46,248.83,251.78,251.73,251.45,252.09,252.78,254.93,255.53,255.42,257.38,258.03,258.03,257.38,256.98,256.19,257.2,257.6,257.84,256.78,257.47,259.06,260.38,260.38,261.8,262.07,262.26,264.94,262.62,264.07,264.81,266.5,262.79,260.74,258.88,261.67,261.26,255.21,253.9,256.72,256.93,255.65,259.69,256.13,251.43,243.89,246.42,244.51,250.14,251.31,251.32,255.56,256.53,260.67,261.19,263.73,263.21,264.32,261.96,264.97,264.14,264.56,262.98,262.97,265.62,265.62,260,259.58,258.8,254.33,257.28,258.43,261.19,263.14,264.57,264.9,264.97,264.2,268.69,268.17,268.92,269.59,269.09,270.18,269.84,270.98,268.46,268.49,268.04,270.45,267.86,270.45,272.37,271.81,273.46,275.56,273.47,274.75,274.7,275.79,275.29,275.16,272.63,273.21,273.13,273.85,274.3,273.39,268.3,269.4,268.64,271.94,278.82,280.89,281.94,282.22,281.4,281.47,279.76,276.07,277.15,278.25,278.26,279.74,280.71,281.56,283.17,282.09,282.09,283.68,284.37,284.5,286.22,285.69,286.4,284.64,283.8,286.11,284.56,284.56,285.64,284.53,276.14,275.9,278.9,280.93,284.04,284.04,283.92,280.78,277.78,276.59,275.97,279.45,281,277.88,278.31,278.31,274.02,274.45,274.77,279.8,279.21,282,282,284.47,286.22,287.74,286.91,282.73,285.34,284,285.5,284.06,281.9,283.94,285.04,286.08,283.38,285.28,285.38,284.6,287.57,287.54,287.54,288.25,288.93,287.68,282.77,281.37,280.05,280.09,275.64,280.01,275.09,271.72,274.75,269.86,271.35,264.03,262.03,263.31,259.65,265.17,266.88,264.03,266.88,266.3,266.52,271.22,271.65,268.62,267.73,262.45,263.9,264.9,266.68,253.77,238.61,238.06,234.32,256.61,247.73,252.22,254.22,253.78,248.09,248.42,248.42,242.57,248.66,252.8,257.92,259.83,259.99,261.5,261.89,263.54,267.42,265.71,263.67,264.81,266.35,266.16,274.83,276.82,277.1,278.25,280.2,280.44,279.35,274.85,274.72,272.88,272.88,278.46,276.91,278.02,278,279.14,280.76,280.78,279.3,282.17,282.43,283.98,283.2,284.28,281.07,283.71,281.34,281.25,281.25,280.64,283.34,286.49,286.49,288.79,290.29,291.79,291.47,292.85,295.29,295.29,292.97,292.76,294.53,295.34,294.37,294.78,293.62,294.55,296.14,296.11,296.52,296.71,299.03,299.24,300.43,300.48,299.59,299.22,298.11,293.35,297.67,296.22,298.38,298.14,300.47,299.72,303.12,304.09,304.19,303.31,303.28,301.5,300.77,299.56,304.11,302.81,304.06,304.79,305.75,303.8,303.8,301.69,303.23,305.76,304.8,305.44,306.26,307.17,309.78,309.63,311.09,310.69,310.39,311.87,313.4,314.78,313.05,312.15,310.59,312.42,313.25,314.53,315.6,315.79,315.81,316.97,315.76,317.6,316.72,308.14,312.94,312.45,313.71,311.74,313.38,316.72,316.73,315.04,316.88,319.38,323.31,324.05,324.03,320.82,321.66,322.22,318.44,319.6,316.03,316.43,321.3,321.97,322.17,316.83,316.68,313.77,311.18,312.35,307.49,310.51,315.31,318.17,320.37,320.37,322.08,320.37,321.16,322.11,322.46,323.08,321.96,321.68,323.85,324.52,321.06,320.55,319.79,316.08,318.59,321.4,323.47,324.94,325.98,325.98,325.88,324.75,324.3,321.91,322.52,324.57,326.58,325.46,325.49,327.59,328.11,327.47,325.73,326.57,326.36,326.36,319.63,323.33,325.1,325.21,326.84,328.17,328.15,327.72,326.31,328.07,325.31,323.66,319.7,326,327.53,326.44,326.43,321.31,321.48,321.48,321.81,323.6,322.68,324.92,321.55,324.01,326.65,324.89,323.48,323.61,320.56,323.04,321.22,316.95,319.59,318.9,318.64,313.78,311.88,315.04,315.83,311.53,310.67,305.97,309.48,308.32,309.99,304.59,299.5,298.32,307.01,309.21,309.56,309.56,310.93,311.16,318.97,320.93,320.57,323.83,327.65,330.26,331.12,335.11,334.31,332.19,335.66,334.28,336.94,337.36,335.71,335.57,339.01,340,338.62,341.37,346.35,345.03,347.94,348.59,348.03,350.07,352.75,348.39,348.13,345.81,349.54,350.14,351.44,351.44,353.59,353.65,355.68,356.46,357.39,357.85,355.22,356.66,347.23,348.26,347.36,341.73,347.72,349.47,355.25,353.23,348.93,352.72,352.72,351.41,346.37,346.02,345.99,345.83,349.89,352.66,351.9,351.9,351.9,354.45,352.87,351.88,354.74,356.24,353.41,354.74,356.1,354.28,350.7,350.02,353.12,352.64,348.38,348.55,348.61,349.34,344.05,349.76,352.21,357.42,363.81,363.2,362.57,364.81,364.59,363.42,364.38,366.75,366.13,364.22,361.71,362.47,359.33,360.89,359.88,361.03,360.95,363.55,362.65,361.45,358.87,360.53,364.34,362.97,362.97,360.85,359.1,357,360.07,358.33,356.72,355.13,359.17,359.77,365.14,365.14,362.38,362.29,364.14,361.33,360.73,359.82,360.52,363.17,365.57,367.69,366.88,365.17,367.34,367.14,367.06,362.99,364.17,360.19,360.19],"SK하이닉스":[null,null,100,100,102.25,100.25,102.5,107.12,107.37,105.99,102.37,104.87,102.37,102.75,102.87,103.62,103.62,99,102.37,99.5,99.13,99.13,102,104.62,104.87,101.75,106.62,107.49,106.49,106.37,106.37,105.87,107.12,110.36,110.86,110.86,112.86,112.98,115.48,113.61,113.11,112.23,114.48,113.86,115.86,112.73,112.73,112.36,113.61,115.61,113.98,113.98,113.23,111.61,111.61,114.36,117.98,116.1,117.23,119.85,123.72,124.22,128.84,126.34,125.59,123.1,123.1,121.97,123.85,122.72,126.84,128.84,129.09,133.08,133.08,133.08,134.08,134.83,131.84,134.08,134.08,133.08,136.33,131.59,124.84,126.59,120.97,119.6,123.85,125.84,124.59,127.09,126.34,125.34,118.6,114.86,116.6,116.6,119.1,117.6,123.22,121.85,119.85,119.85,122.85,127.34,125.59,121.85,122.72,116.73,118.85,118.73,121.47,120.97,123.6,126.59,126.84,128.09,127.09,126.09,129.34,127.34,125.59,123.35,124.34,122.35,121.97,122.35,124.22,124.34,122.85,125.34,124.47,128.34,129.84,130.84,130.84,134.08,133.83,134.83,134.83,138.33,138.33,139.58,139.58,142.07,142.07,138.83,140.82,138.08,138.83,138.08,136.58,139.08,135.33,139.83,137.58,139.33,139.33,142.57,144.57,143.32,142.32,140.82,142.57,140.07,140.07,141.07,141.57,145.57,143.57,146.82,148.06,151.31,151.06,156.8,159.8,161.8,162.3,162.3,168.54,172.78,167.79,171.04,168.29,165.54,164.29,169.79,170.04,166.29,168.04,172.28,172.03,176.28,177.53,177.78,176.78,177.28,178.03,177.78,182.27,175.78,166.79,170.79,161.3,164.79,163.55,169.79,163.55,159.8,160.05,165.54,160.3,160.8,153.31,162.55,162.55,165.04,165.79,167.29,167.79,170.29,169.79,170.04,170.79,169.54,168.79,171.04,171.29,171.54,170.04,174.53,179.03,178.28,181.27,184.27,186.52,189.01,191.76,192.76,199,197.75,201.5,207.49,207.49,215.48,215.48,205.74,207.74,206.99,206.99,206.99,206.99,206.99,206.99,206.99,221.47,222.47,220.97,214.98,210.24,208.49,202,197.25,202.75,211.49,204.24,204,196.5,195.76,199.25,205.24,212.98,208.24,210.74,208.49,205.74,207.74,205.74,204.74,205.49,208.24,204.74,205.99,207.24,204.99,212.23,216.73,211.49,212.48,207.49,206.24,205.74,191.76,193.26,197.5,194.51,193.51,189.76,196.5,196.5,194.26,191.76,189.76,189.01,192.76,200.25,200.25,192.26,191.51,191.51,184.77,187.52,191.01,191.01,191.26,194.01,192.51,198,195.26,192.01,182.02,181.27,185.77,181.52,185.77,185.02,187.77,183.02,177.53,178.03,180.77,189.26,188.51,188.01,182.52,183.52,185.77,180.27,175.28,175.28,177.53,184.52,183.27,186.02,194.01,193.76,193.76,193.76,191.01,188.51,192.01,189.51,193.01,193.51,196.5,191.76,191.76,193.26,195.51,205.74,206.49,208.49,207.99,211.99,224.72,226.47,223.72,224.22,224.47,223.72,220.72,221.22,207.49,209.74,203.25,200.5,200.5,203,203,204.24,200.75,206.99,200.5,201.25,200.75,202.75,209.74,210.24,209.74,206.74,211.24,219.48,210.74,210.74,204.99,205.74,215.98,217.48,210.99,210.99,207.49,206.99,207.24,207.24,208.49,208.24,214.23,214.98,213.23,211.24,217.23,216.48,219.48,222.47,222.47,237.95,236.2,237.7,235.96,236.7,237.2,233.21,228.21,224.22,227.22,227.22,226.97,220.72,222.72,220.72,220.72,215.48,217.23,209.74,209.99,219.23,220.97,223.47,211.74,210.49,212.73,208.49,213.98,208.99,214.98,212.23,215.23,212.98,218.73,217.98,216.73,213.73,221.72,222.97,221.22,222.97,225.47,219.48,204,208.74,201,207.49,214.98,214.48,215.48,213.73,207.74,207.99,198.25,201.5,199.25,194.76,187.52,188.26,189.51,189.51,186.52,186.02,186.52,195.76,199.25,202.5,204.24,208.49,205.74,206.74,206.49,207.24,201.25,202.75,199.75,196.75,189.51,191.01,191.26,187.52,186.02,194.01,192.76,194.76,196.75,197.5,191.51,191.51,191.51,191.51,187.27,182.52,184.02,179.03,179.03,174.78,175.53,177.78,177.78,175.53,172.28,180.77,175.53,174.03,175.78,171.54,176.78,174.78,172.53,166.54,161.55,167.29,166.79,170.29,170.29,170.54,181.27,176.03,175.03,176.78,182.02,182.02,186.02,179.53,175.78,179.28,175.03,174.28,168.54,170.04,173.03,173.03,177.03,176.78,179.53,178.53,173.78,176.03,172.28,170.29,164.79,166.79,163.55,162.05,165.29,163.55,154.31,155.31,152.56,150.56,146.32,149.81,150.81,150.81,150.06,153.81,151.06,151.06,151.31,144.07,145.57,146.57,147.82,158.8,163.05,162.55,155.06,159.8,161.8,162.05,161.3,167.29,166.29,166.79,176.03,186.27,179.28,183.27,189.51,184.52,189.51,189.51,189.51,189.51,191.51,183.52,185.02,189.51,190.26,193.26,184.27,186.52,184.02,189.01,191.51,191.51,188.26,187.77,184.02,174.78,174.78,175.03,174.03,170.04,170.04,166.54,166.29,169.04,166.79,168.04,170.04,169.29,169.79,176.03,189.51,190.01,182.02,181.52,183.27,180.52,185.27,191.26,190.76,199.5,195.76,197.25,194.51,194.26,196.25,195.76,195.01,199,200.75,200.25,197.75,204.24,201,202.25,196,200.25,196.25,199.75,197.25,197.25,201.5,200.75,200.75,199.5,200.5,189.76,185.77,183.52,186.27,186.02,179.53,178.78,177.03,175.53,172.03,169.79,168.79,167.04,164.54,165.04,164.54,163.05,166.29,162.55,162.55,162.55,163.3,166.79,167.79,164.04,158.55,157.55,159.05,158.3,167.79,168.04,164.54,167.04,166.54,172.03,175.28,173.53,174.78,178.28,172.53,175.28,170.79,168.29,174.28,182.02,188.51,186.52,190.26,190.01,186.27,186.52,191.76,195.76,196.75,193.76,197.75,199.25,192.26,197,192.01,194.01,190.01,188.26,179.78,183.02,180.52,183.02,186.02,186.02,192.01,192.01,190.76,187.52,190.76,189.26,184.27,185.77,179.28,182.27,183.02,183.02,193.26,193.76,192.26,199.75,207.24,204.49,210.49,207.49,206.24,206.24,206.24,198.5,198.25,200.25,206.49,205.24,206.74,208.24,204.49,207.99,203.25,205.24,204.74,198.5,198.5,200.5,200.5,202,202,197.25,199.75,201,202.75,205.74,202.25,193.26,193.51,197.5,194.01,199.75,206.99,206.99,207.24,203.5,204.74,207.49,211.49,212.48,208.49,208.74,205.49,203,207.74,208.24,208.24,212.73,213.48,212.98,206.49,202,204,204,205.49,206.49,206.74,202,201,196.5,194.01,196.75,201.25,201.5,201.5,201.25,208.24,219.48,221.22,231.71,232.21,233.71,237.2,236.2,234.21,234.21,236.7,239.7,234.96,234.96,236.45,235.96,235.46,234.71,243.2,247.19,246.94,250.94,250.94,245.19,247.69,247.19,249.44,247.94,252.18,246.44,246.44,246.44,240.45,244.44,234.71,233.46,236.45,242.45,243.95,250.94,247.94,246.69,249.19,249.69,254.68,260.92,262.17,254.68,258.43,259.68,257.18,248.44,244.69,236.2,231.71,219.48,229.96,231.71,235.46,236.95,231.21,231.21,222.47,213.48,206.74,205.99,201.25,200.75,182.52,172.28,186.77,173.28,196.5,210.99,201.5,207.99,208.99,207.99,195.76,199.75,198.75,207.49,214.23,210.99,212.23,209.99,203.25,205.49,205.49,203,209.99,204.74,203,209.49,206.24,203.25,206.24,208.24,208.99,208.99,208.99,202.25,202.25,205.74,205.74,212.23,210.99,213.98,208.74,201.25,204.49,202.5,206.49,209.99,208.24,203,203.25,204.49,203.25,209.49,203.5,208.74,207.99,221.47,218.98,225.72,227.22,224.22,226.72,220.97,212.73,204.74,213.23,216.73,215.23,213.23,211.99,209.99,214.73,210.49,211.24,208.74,212.48,212.98,210.74,213.23,214.73,211.74,208.99,207.24,206.74,207.24,206.99,207.24,206.49,206.99,205.24,209.99,207.74,205.74,208.99,206.74,207.49,207.74,212.98,206.74,204.24,203.75,201.5,202.5,201.25,203.25,203,202.25,201.5,200.25,200.25,195.01,187.27,179.28,186.02,188.51,192.26,196.75,197.5,194.26,187.52,187.77,188.51,196.5,196.5,195.76,198.25,193.01,191.26,195.76,199.75,204.49,203.5,205.24,208.99,210.99,203,208.74,210.49,206.99,205.99,209.74,209.74,209.74,209.74,207.74,207.24,208.24,206.99,206.99,213.48,220.22,215.98,217.48,212.98,216.48,212.73,209.24,207.99,209.49,207.74,206.24,206.99,204,199.5,198.75,203.25,207.74,214.98,215.48,214.73,215.98,217.23,219.98,223.97,244.69,244.94,244.69,245.19,241.7,249.69,246.19,242.7,248.19,246.69,243.45,250.94,272.16,278.4,287.14,294.63,287.14,300.87,290.89,288.39,292.13,293.38,293.38,298.38,295.88,289.64,280.9,289.64,294.63,294.63,288.39,289.64,295.88,295.88,314.61,325.84,327.09,335.83,344.57,332.08,322.1,332.08,325.84,318.35,324.59,325.84,325.84,328.34,320.85,337.08,322.1,320.85,307.12,305.87,312.11,324.59,324.59,312.11,318.35,312.11,313.36,314.61,314.61,314.61,329.59,330.84,324.59,314.61,332.08,340.82,345.82,339.58,370.79,353.31,353.31,360.8,367.04,354.56,349.56,338.33,340.82,332.08,342.07,349.56,340.82,350.81,349.56,354.56,344.57,344.57,337.08,333.33,332.08,337.08,329.59,335.83,330.84,350.81,352.06,357.05,357.05,358.3,359.55,349.56,343.32,348.31,342.07,343.32,343.32,344.57,345.82,330.84,332.08,330.84,328.34,337.08,324.59,324.59,319.6,328.34,329.59,329.59,322.1,323.35,324.59,307.12,298.38,293.38,295.88,293.38,302.12,302.12,305.87,305.87,298.38,307.12,307.12,313.36,312.11,317.1,320.85,314.61,322.1,320.85,320.85,318.35,305.87,307.12,319.6,317.1,320.85,323.35,315.86,310.86,304.62,304.62,309.61,314.61,320.85,314.61,312.11,318.35,310.86,305.87,307.12,312.11,308.36,303.37,298.38,299.63,307.12,308.36,308.36,303.37,297.13,295.88,292.13,298.38,295.88,292.13,289.64,284.64,284.64,280.9,289.64,299.63,302.12,299.63,294.63,289.64,280.9,263.42,250.94,253.43,253.43,253.43,259.68,255.93,255.93,257.18,262.17,258.43,259.68,258.43,258.43,265.92,269.66,265.92,267.17,264.67,260.92,264.67,257.18,262.17,265.92,268.41,268.41,259.68,267.17,267.17,267.17,267.17,263.42,259.68,260.92,258.43,249.69,257.18,249.69,249.69,244.44,240.95,238.95,234.71,234.71,228.46,229.71,234.21,245.69,242.45,243.95,244.44,240.45,245.94,249.69,254.68,253.43,265.92,257.18,265.92,268.41,263.42,264.67,267.17,268.41,272.16,270.91,268.41,265.92,277.15,279.65,275.91,274.66,278.4,298.38,297.13,298.38,293.38,288.39,289.64,284.64,290.89,299.63,294.63,295.88,303.37,299.63,308.36,300.87,303.37,302.12,308.36,309.61,304.62,300.87,310.86,317.1,318.35,319.6,314.61,318.35,317.1,327.09,327.09,327.09,320.85,313.36,312.11,317.1,310.86,319.6,320.85,323.35,320.85,317.1,315.86,317.1,312.11,297.13,297.13,294.63,294.63,283.4,300.87,300.87,300.87,300.87,309.61,310.86,307.12,307.12,307.12,323.35,329.59,330.84,317.1,325.84,332.08,328.34,328.34,328.34,328.34,305.87,307.12,307.12,307.12,312.11,322.1,322.1,298.38,294.63,294.63,294.63,294.63,289.64,289.64,289.64,289.64,309.61,309.61,308.36,308.36,300.87,294.63,294.63,299.63,302.12,294.63,289.64,292.13,290.89,282.15,283.4,279.65,278.4,277.15,282.15,274.66,269.66,272.16,280.9,280.9,282.15,275.91,269.66,277.15,270.91,273.41,280.9,275.91,274.66,273.41,273.41,268.41,268.41,274.66,275.91,272.16,280.9,275.91,280.9,283.4,277.15,280.9,282.15,270.91,269.66,257.18,264.67,267.17,269.66,269.66,267.17,267.17,267.17,259.68,264.67,263.42,258.43,247.19,247.44,244.44,243.2,240.7,235.96,237.7,230.21,225.22,228.71,237.2,237.95,234.71,227.22,218.48,222.47,230.96,229.96,234.46,236.7,233.96,232.96,234.71,234.71,246.44,252.18,249.69,254.68,255.93,249.69,249.69,250.94,249.69,248.19,244.44,242.45,240.95,243.45,243.45,245.94,240.45,237.45,229.21,232.96,232.96,232.96,241.45,242.45,238.95,240.7,237.7,233.71,232.71,234.96,237.45,230.96,232.71,237.7,230.71,228.96,227.47,229.21,225.72,225.72,225.72,225.72,236.7,232.21,229.71,227.72,224.72,219.73,219.73,214.73,208.49,205.99,204.74,202.75,201.75,207.49,207.49,215.23,224.22,224.47,227.72,227.72,225.22,234.71,236.95,238.45,237.7,239.2,231.96,225.22,225.97,229.21,233.46,234.46,224.72,208.24,206.49,209.49,210.99,206.49,210.99,215.98,218.98,222.72,222.47,233.46,226.97,228.71,228.46,218.98,220.72,215.48,212.73,212.73,216.98,212.48,207.49,208.99,212.23,211.49,204.49,202.25,202.25,197,196.75,203.5,202.5,205.49,204.24,200.25,195.76,197.25,195.51,194.76,197.75,194.26,192.26,192.26,189.76,187.27,187.27,189.01,188.76,202.25,203.25,207.49,214.73,215.98,217.98,216.73,213.98,214.23,214.73,212.48,213.48,218.73,218.73,218.73,228.21,228.21,228.46,226.47,220.97,228.21,228.21,230.21,222.47,226.72,236.95,236.95,233.46,226.22,233.21,228.96,231.96,229.71,230.96,227.72,222.47,231.46,227.22,224.72,223.22,223.22,219.98,217.98,223.97,221.97,216.73,213.73,207.99,210.49,202.5,197.5,197.25,209.74,208.99,208.74,216.98,220.97,217.98,213.48,220.72,216.98,221.72,221.22,217.73,210.99,211.24,209.24,222.47,226.47,229.21,225.47,221.47,222.97,220.97,218.73,220.22,218.98,222.47,217.73,213.48,218.23,221.72,223.47,223.47,225.22,224.22,221.47,221.47,221.47,217.98,216.98,215.48,217.73,215.73,225.72,229.46,233.71,242.95,245.19,244.44,243.95,258.43,272.66,272.66,275.41,271.16,275.41,275.41,271.41,271.41,269.66,273.91,288.14,286.64,298.38,296.63,297.13,296.88,286.64,289.89,287.39,284.64,283.65,283.4,282.15,285.39,290.14,287.64,293.63,294.38,291.39,284.14,279.15,275.41,283.15,288.14,284.89,294.63,292.63,294.13,293.38,291.89,287.39,284.64,283.15,282.15,309.61,319.6,308.11,312.36,298.38,299.63,299.88,304.37,296.13,295.88,295.88,287.89,286.89,286.89,289.14,286.64,292.63,290.64,290.89,289.64,301.87,290.89,289.39,296.13,298.13,304.12,299.63,297.63,298.13,295.13,295.88,283.9,289.39,291.39,295.88,305.12,305.62,297.13,297.63,294.63,290.89,292.88,292.13,287.14,286.39,286.39,286.39,286.39,286.39,288.14,300.12,300.62,300.62,298.38,297.63,310.11,311.36,309.86,324.59,324.59,313.86,315.11,309.61,316.6,318.35,299.63,297.38,297.38,290.39,300.37,312.86,314.11,332.08,325.59,318.6,319.6,325.84,329.09,324.59,334.83,330.34,324.34,328.09,329.59,327.84,324.84,319.6,326.34,328.09,325.59,334.33,331.09,327.34,314.36,313.61,313.61,318.35,321.85,327.09,327.59,341.32,349.56,349.56,345.07,350.81,350.81,351.06,351.06,351.81,350.56,353.31,353.31,355.56,341.57,340.57,343.32,339.58,343.07,333.33,339.58,334.83,334.83,329.84,327.09,340.07,352.81,356.05,351.56,353.31,343.07,339.58,337.08,341.82,336.33,331.34,336.83,330.34,344.57,344.57,356.55,356.55,356.55,374.53,371.29,371.79,366.54,377.78,373.53,372.03,390.76,403,404,384.02,394.51,390.01,390.01,415.73,413.98,406.74,411.74,429.21,415.98,413.73,408.49,404.24,402.5,410.24,400,390.76,424.47,423.97,422.97,440.95,452.43,444.94,456.93,463.17,465.17,447.44,469.41,456.43,452.43,456.68,456.68,470.41,467.92,469.91,447.19,446.19,455.18,432.71,428.46,426.97,448.94,425.97,443.95,439.2,434.96,434.96,433.46,432.46,432.46,448.44,444.44,437.95,449.19,458.93,462.67,462.67,481.9,474.16,474.66,479.4,493.63,499.38,495.88,503.12,505.62,505.62,488.64,472.41,484.89,482.65,483.65,483.65,518.1,519.35,530.59,536.83,554.31,551.81,556.8,585.52,583.02,593.01,584.27,556.8,561.8,591.76,590.51,590.51,588.01,579.28,589.26,574.28,589.26,583.02,595.51,596.75,601.75,581.77,574.28,581.77,550.56,530.59,523.1,511.86,511.86,520.6,474.41,478.9,488.39,471.66,485.89,482.65,432.46,389.76,408.74,422.72,407.99,428.21,441.95,454.18,466.17,466.17,498.63,484.14,498.63,480.9,477.15,463.17,448.44,436.95,447.69,423.72,433.71,434.46,420.22,386.52,398,390.51,392.01,388.26,392.51,421.47,406.49,406.49,406.49,406.49,381.52,392.26,404.49,408.24,412.73,451.69,458.93,435.96,435.96,422.22,422.22,434.71,461.67,444.44,444.44,466.17,464.42,464.42,481.65,471.16,489.39,467.67,476.65,468.91,489.39,494.88,501.87,489.39,475.16,486.89,465.17,454.93,484.39,482.4,488.89,488.89,500.62,480.9,463.92,456.68,431.96,444.94,428.71,425.97,425.97,421.47,441.2,441.95,442.2,420.22,402.25,399.25,396.5,411.74,419.48,431.96,417.23,421.72,425.47,428.96,439.7,438.2,447.69,459.43,458.18,436.95,420.72,423.47,420.72,420.72,424.72,435.71,434.21,434.21,427.47,454.18,498.88,486.89,486.14,511.86,508.11,485.14,486.89,494.88,524.34,535.58,529.34,544.32,563.05,548.06,551.81,551.81,551.81,551.81,551.81,497.38,476.65,477.15,496.38,508.11,506.87,494.63,498.63,496.63,520.6,524.34,529.34,524.34,545.57,529.34,523.1,511.86,500.62,506.87,497.38,474.91,474.91,464.67,482.15,480.4,480.4,469.16,468.91,496.63,498.63,510.61,514.36,506.87,513.11,524.34,538.08,528.09,519.35,534.33,516.85,497.63,476.15,491.89,494.13,485.89,454.93,411.49,423.22,411.99,457.43,451.44,449.94,450.94,434.46,436.95,436.95,440.95,433.96,451.94,445.19,460.42,454.43,451.44,443.2,443.2,464.42,464.42,464.42,476.4,475.16,474.66,486.89,495.63,514.36,500.62,510.61,497.88,504.37,500.62,491.64,499.38,506.87,505.62,519.35,529.34,510.61,518.1,518.1,543.07,560.55,560.55,571.79,575.53,599.25,588.01,588.01,619.23,621.72,615.48,614.23,641.7,647.94,695.38,714.11,731.59,709.11,729.09,712.86,696.63,695.38,675.41,676.65,704.12,701.62,741.57,735.33,749.06,745.32,739.08,672.91,671.66,680.4,670.41,671.66,672.91,664.17,654.18,655.43,657.93,682.9,644.19,644.19,657.93,645.44,654.18,640.45,666.67,671.66,694.13,690.39,690.39,667.92,656.68,637.95,611.74,626.72,647.94,652.93,649.19,670.41,671.66,639.2,650.44,655.43,662.92,682.9,691.64,719.1,759.05,766.54,820.22,826.47,868.91,832.71,887.64,887.64,876.4,901.37,892.63,890.14,840.2,871.41,867.67,898.88,987.52,987.52,987.52,987.52,987.52,987.52,1068.66,1036.2,1027.47,1054.93,1129.84,1162.3,1212.23,1196,1202.25,1194.76,1273.41,1335.83,1300.87,1393.26,1418.23,1395.76,1548.06,1463.17,1445.69,1480.65,1448.19,1513.11,1545.57,1540.57,1528.09,1398.25,1513.11,1423.22,1403.25,1425.72,1300.87,1298.38,1295.88,1308.36,1358.3,1323.35,1343.32,1393.26,1378.28,1353.31,1358.3,1440.7,1413.23,1465.67,1410.74,1425.72,1383.27,1323.35,1375.78,1378.28,1365.79,1448.19,1458.18,1468.16,1468.16,1495.63,1598,1625.47,1625.47,1690.39,1737.83,1812.73,1852.68,1887.64,1857.68,1870.16,1842.7,1852.68,1870.16,1887.64,1907.62,1855.18,1847.69,1885.14,1915.11,1837.7,1997.5,2099.88,2149.81,2269.66,2072.41,2264.67,2247.19,2102.37,2094.88,2214.73,2187.27,2147.32,2217.23,2197.25,2197.25,2197.25,2197.25,2232.21,2369.54,2374.53,2509.36,2541.82,2744.07,2649.19,2649.19,2344.57,2119.85,2349.56,2307.12,2087.39,2342.07,2384.52,2322.1,2272.16,2431.96,2421.97,2636.7,2529.34,2514.36,2329.59,2461.92,2484.39,2329.59,2329.59,2179.78,2014.98,2239.7,2072.41,2187.27,2212.23,2287.14,2579.28,2491.89,2564.29,2596.75,2754.06,2836.45,2883.9,2816.48,2911.36,3056.18,3053.68,3058.68,3051.19,3225.97,3245.94,3228.46,3210.99,3210.99,3612.98,3612.98,3997.5,4129.84,4209.74,4694.13,4581.77,4933.83,4918.85,4541.82,4594.26,4357.05,4357.05,4843.95,4846.44,4846.44,5123.6,5600.5,5715.36,5825.22,5900.12,5892.63,5892.63,5737.83,5168.54,4771.54,5530.59,5113.61,5245.94,5368.29,5712.86,5947.57,6294.63,6704.12,6901.37,7288.39,6379.53,6544.32,7283.4,6674.16,6561.8,6616.73,6392.01,5460.67,6054.93,5850.19,5495.63,5183.52,5458.18,5443.2,4606.74,4776.53,5198.5,4599.25,4599.25,4404.49,4584.27,4569.29,4791.51,4392.01,4534.33,3870.16,3498.13,3300.87,4289.64,3912.61,3937.58,4164.79,3732.83,3550.56,3545.57,3558.05,3755.31,3977.53,4107.37,4107.37,4149.81,3745.32,4222.22,4319.6,4172.28,4189.76,4214.73,4319.6,4127.34,4179.78,4227.22,4027.47,3985.02,4112.36,4451.94,4476.9,4634.21,4626.72,4524.34,4237.2,4219.73,4392.01,4357.05,4636.7,4664.17,4594.26,4649.19,4649.19,4649.19,4414.48,4406.99,4434.46,4576.78,4596.75,4596.75,4426.97,4302.12,4197.25,4197.25,4007.49,3603,3543.07,3151.06,3176.03,3121.1],"마이크론 테크놀로지":[100,102.47,101.35,101.24,99.71,100.41,103.24,103.83,103.18,101.24,101,99.94,98.18,97.82,98.18,102.3,102.47,101.24,100,104,104.24,106.53,107.36,112.89,113.07,114.71,116.19,117.19,117.19,118.48,117.66,114.3,114.95,108.77,110.59,109.54,112.18,120.31,121.6,120.66,117.83,118.48,117.83,119.42,119.31,119.78,121.54,121.13,136.49,136.9,136.9,137.14,134.08,131.08,129.02,129.02,132.73,131.61,130.14,129.72,131.49,132.31,134.14,131.31,130.55,130.55,127.96,131.37,127.78,129.25,128.84,134.49,138.67,138.43,141.08,142.32,141.91,145.67,145.91,144.79,143.26,144.79,142.5,143.91,141.55,140.67,136.08,135.49,135.26,137.43,137.43,139.91,139.79,138.2,136.79,139.85,137.96,144.5,145.38,150.5,151.32,150.91,149.38,148.03,148.2,151.27,150.56,153.74,153.27,151.85,154.27,150.21,153.38,155.8,167.33,169.28,168.86,167.75,170.51,170.1,168.57,168.28,166.33,168.45,167.86,162.68,159.98,157.09,157.39,157.39,159.68,159.74,160.45,164.57,160.8,156.39,158.86,157.68,162.63,162.86,166.51,163.45,164.8,163.57,165.98,165.16,169.57,172.57,170.87,170.28,169.69,170.81,158.92,161.74,163.74,165.16,166.51,170.63,173.22,175.16,175.16,180.69,181.11,181.05,183.7,183.7,185.82,191.29,190.99,180.11,183.64,185.64,182.81,179.87,175.75,183.64,181.46,188.4,187.7,186.76,191.29,186.34,189.76,185.23,175.75,171.51,171.51,179.58,177.16,177.75,179.52,184.64,185.11,183.23,187.11,186.7,187.76,187.29,188.35,188.4,186.4,175.99,175.46,177.99,172.34,165.51,166.8,168.51,163.8,164.33,168.28,169.75,168.22,161.8,164.86,172.1,174.69,180.64,174.34,178.81,173.98,179.22,179.22,177.87,178.28,182.93,185.29,186.05,188.17,191.88,191.88,188.76,189.82,193,190.99,196.82,201.82,203.59,203.53,203.94,208.53,211.6,211.71,211.36,212.3,205.24,201.18,218.3,223.43,231.49,235.49,237.61,232.84,231.72,233.49,241.08,247.09,244.91,238.85,237.79,244.2,237.73,245.14,243.14,244.26,244.61,244.85,241.67,238.96,240.44,245.14,260.8,261.21,260.98,257.27,254.56,258.68,259.51,256.03,263.57,268.39,269.57,266.98,271.81,271.69,280.4,290.76,289.23,289.23,292.41,282.81,282.11,257.45,249.5,247.15,234.84,242.55,244.73,254.27,254.33,253.15,246.38,247.5,248.62,249.56,257.27,258.86,269.28,261.45,259.68,259.68,248.68,250.03,246.09,242.02,257.03,264.74,275.93,269.57,268.1,252.91,254.91,252.03,251.97,251.97,252.62,260.51,258.92,251.62,252.38,258.68,253.56,253.15,257.03,254.8,245.26,257.33,250.09,240.26,231.9,258.27,247.26,235.43,237.85,248.32,250.91,255.74,256.03,260.21,260.21,264.27,262.15,260.45,273.87,282.4,285.93,287.29,280.28,289.05,306.24,316.3,317.66,325.01,321.31,349.44,349.79,351.85,346.32,356.56,353.97,359.92,359.45,346.79,319.07,327.02,308.42,303.06,306.89,306.89,294.64,303.41,314.24,293.35,285.23,282.28,297.12,297.12,309.54,307.42,304,307.59,317.89,302.65,297.94,288.52,277.28,280.16,295.11,279.69,270.63,275.4,270.1,274.4,280.05,285.34,285.87,300.24,309.95,305,311.95,317.89,332.55,321.95,314.24,326.55,347.44,352.97,361.92,361.09,361.09,368.57,368.28,338.96,345.73,347.85,349.68,349.74,350.97,361.33,361.33,356.39,353.44,348.32,342.73,344.03,348.73,346.97,349.85,336.08,312.89,321.31,307.59,312.77,308.65,320.66,303,303,311.01,313.3,319.66,328.08,318.89,326.37,331.67,330.49,335.26,338.14,330.9,323.84,319.54,312.95,314.24,316.42,317.6,312.01,310.71,307.77,314.3,310.83,310.01,312.18,314.24,307.59,302.35,302.18,297.94,279.52,277.22,277.28,282.93,293.94,295.7,292.53,298.41,306.47,308.06,305.06,310.54,309.12,309.12,305.65,291.58,262.8,264.04,264.27,256.62,245.67,256.74,260.74,256.5,266.8,265.21,271.1,263.33,265.8,262.74,261.04,264.8,266.22,265.74,269.33,265.74,259.92,256.5,253.5,248.79,244.91,247.03,249.97,249.21,254.33,249.26,243.08,238.08,234.02,227.66,208.53,216.48,208.36,204,211.95,222.01,236.14,237.32,234.96,234.26,240.91,238.02,230.19,220.36,222.78,223.84,234.9,232.14,216.77,212.6,214.13,214.13,214.24,215.24,217.78,227.84,223.13,226.96,235.61,217.07,217.07,221.72,207.83,204.83,207.24,212.07,206.12,201.29,199.41,200.77,184.87,184.11,178.46,170.81,170.81,181.81,187.93,185.82,186.76,192.76,182.46,192.47,200.12,198.59,208.59,211.36,211.95,204.06,200.06,197.65,199.41,210.48,210.48,199.35,201.53,215.36,229.31,224.13,220.07,225.07,224.96,233.08,232.31,231.72,244.38,231.78,227.07,227.07,237.79,245.32,248.56,247.15,247.15,246.97,248.44,244.44,250.56,251.62,252.85,243.2,240.61,244.73,241.67,235.37,223.25,222.66,227.49,229.72,231.02,228.55,226.07,232.73,233.14,237.61,236.2,258.92,244.97,238.67,237.32,230.9,231.55,243.26,248.68,249.79,258.39,252.44,254.97,252.5,245.56,248.2,248.85,247.26,246.14,251.68,253.97,255.44,255.44,255.44,251.74,253.27,251.62,247.79,247.85,247.56,246.62,250.5,255.03,247.97,236.96,233.96,231.14,229.19,220.01,226.66,226.07,219.6,212.24,203.77,209.77,204.41,199.06,200.12,200.12,193.88,195.94,196.12,191.94,192.41,203,196.23,197,200.06,205.65,205.06,194,196.47,192.23,190.88,201.82,199.76,201,195.7,195.35,192.35,218.01,224.07,227.13,236.08,233.08,233.02,233.02,232.02,237.85,243.38,252.5,255.92,261.98,261.33,253.44,255.27,262.92,267.92,277.75,276.34,282.46,281.17,279.52,275.57,279.34,264.21,256.62,259.45,246.85,250.85,245.73,250.91,244.38,247.97,259.98,247.44,248.62,256.33,264.92,260.33,259.98,263.57,252.85,255.62,249.79,253.97,262.92,266.45,266.45,264.8,275.52,288.58,288.23,289.17,290.7,297.12,296.88,297.23,295.17,299.23,297.12,293.23,289.35,291.94,285.52,291.17,286.05,254.33,252.21,248.97,247.09,255.8,262.21,259.92,250.97,252.38,254.74,265.45,264.04,273.45,265.8,267.8,255.86,266.16,262.86,262.86,277.22,282.7,286.58,283.17,281.81,279.87,284.76,291.88,286.52,280.64,284.87,277.75,272.28,276.04,272.51,275.46,280.81,281.46,274.16,268.22,268.1,269.98,279.69,274.99,283.46,283.46,279.64,273.04,266.22,272.51,274.4,282.11,273.4,279.34,289.94,300,301.35,311.6,311.95,312.18,320.95,324.07,326.07,326.19,326.19,324.37,318.01,313.18,316.54,326.02,320.95,315.3,342.97,338.55,337.32,333.55,338.14,338.55,330.61,339.49,339.38,339.38,347.09,348.26,348.44,339.96,326.13,332.37,325.49,323.9,312.48,316.54,326.66,334.14,345.38,334.79,337.43,336.96,348.85,349.21,344.32,344.32,339.91,353.09,347.26,335.43,323.78,306.65,308.24,297.7,309.36,321.31,304.89,325.43,316.19,302.94,270.57,281.7,257.33,228.43,253.03,202.88,220.01,204.18,213.6,212.54,225.13,254.68,250.15,263.63,255.92,262.04,247.56,234.79,241.85,242.61,272.93,273.93,284.23,271.51,271.51,271.75,280.28,273.28,267.98,268.98,255.44,243.73,258.45,257.62,259.92,266.51,266.69,293.29,281.87,265.21,261.68,267.27,271.22,274.22,283.99,283.7,268.92,256.21,269.16,261.39,270.28,265.57,274.51,266.16,264.51,264.51,269.57,291.05,273.51,281.99,272.75,275.57,287.93,301.47,316.19,316.07,312.83,308.83,285.58,286.58,289.82,300.29,299.94,297.12,299.18,301.06,293.35,284.23,289.52,285.4,289.29,303.24,292.53,293.29,293.29,299.71,288.93,292.58,294.17,298.41,291.11,292.58,297.29,294.88,291.17,301.41,303.24,304,309.83,294.41,303.65,294.82,296.59,298.65,294.64,296.59,301.94,300.47,286.64,286.93,289.29,281.11,285.34,271.57,268.39,266.16,261.33,259.27,253.03,251.09,257.56,265.45,264.63,262.63,268.92,267.86,269.33,281.52,272.69,273.57,273.57,265.04,265.74,264.1,271.28,288.58,288.7,295.53,300.06,298.65,289.29,292.53,293.41,291.17,289.23,292.64,298.47,276.4,282.05,273.98,280.16,278.52,284.93,293.7,293.64,298.29,305.18,303.88,305.71,303.77,309.77,315.07,313.77,320.07,311.07,306.89,305.83,294.29,297.12,296.29,292.58,300.65,305.83,321.25,324.66,329.37,326.13,331.72,331.08,340.97,364.1,364.86,357.5,363.92,361.39,377.75,376.4,373.34,373.34,378.05,377.22,394.82,406.77,411.42,431.67,427.37,430.78,420.31,419.54,415.13,421.07,430.55,429.61,425.31,420.6,420.66,414.6,411.71,415.42,415.42,415.89,413.24,423.31,442.5,435.84,454.74,453.86,465.63,455.68,463.04,467.69,470.34,478.52,475.1,475.1,503.24,491.47,500.35,484.28,478.4,467.98,441.97,461.39,460.68,473.4,480.4,465.63,478.22,477.34,494.47,490.41,484.7,509.01,518.01,518.01,516.42,506.47,521.13,535.37,507.83,519.31,544.56,518.66,538.73,557.74,536.14,524.49,496.35,523.43,500.59,525.6,502.71,525.66,516.6,522.95,538.14,557.74,528.66,532.73,537.26,502.65,488.52,494.94,517.89,509.65,509.36,519.19,543.91,543.91,551.8,550.26,553.03,560.86,560.92,562.63,542.38,533.67,531.31,533.61,520.36,514.89,526.72,498.59,506.36,517.01,526.55,506.36,518.3,506.59,500.41,496.82,501.18,499.12,506.06,475.87,474.87,452.03,454.33,469.1,473.16,464.27,470.45,477.52,475.1,487.93,478.1,484.05,494,495.23,495.23,495.29,496.41,482.81,493,494.64,473.98,462.98,466.63,466.98,473.75,483.7,473.75,474.63,452.91,453.62,457.09,465.1,474.28,482.81,490.76,488.11,500.18,471.51,472.81,472.81,477.22,460.39,453.86,463.45,468.28,461.74,461.98,452.74,441.5,438.96,443.73,454.33,444.56,446.97,449.09,436.85,444.67,453.68,456.62,456.97,475.93,482.52,479.64,482.64,472.1,446.79,441.61,413.48,417.42,417.48,416.6,415.66,413.66,413.36,422.25,423.66,435.79,428.31,435.55,430.61,433.78,433.9,435.49,434.43,434.43,433.43,425.37,428.9,432.61,437.61,432.55,434.49,439.26,437.32,425.96,424.6,435.37,435.79,435.84,442.5,430.25,421.66,417.78,417.83,415.66,414.95,411.65,415.19,412.71,407.42,392.7,390.7,399.06,398.35,395.88,397.7,401.82,404,397.35,404.71,405.77,401.65,409.54,406.71,416.13,416.48,419.36,425.19,429.19,438.85,444.91,432.08,438.79,454.97,451.91,452.09,444.14,453.33,488.7,493.58,502.71,507.42,507.42,490.99,507,494.41,501.18,487.82,480.4,485.29,505.18,506.3,499.88,503.47,496.47,490.23,504.18,486.7,488.52,482.81,533.73,531.72,555.74,555.74,555.8,547.03,566.04,552.62,548.26,563.57,567.04,555.62,562.98,555.92,552.62,554.44,559.8,562.8,573.04,573.04,546.62,529.72,500.71,482.22,488.23,475.1,482.46,463.33,466.57,484.23,479.4,497.41,482.46,477.75,475.99,495.11,518.66,535.73,528.31,528.9,565.04,565.39,551.68,534.43,534.43,533.08,513.89,522.84,530.31,523.01,507.71,549.15,524.9,482.11,445.56,454.15,467.57,445.67,428.61,408.48,430.31,468.92,473.93,467.39,461.15,465.69,445.26,460.33,459.68,470.04,482.93,465.92,458.45,448.38,457.15,439.14,434.26,431.31,424.6,423.96,423.54,426.02,412.77,412.77,418.78,428.08,430.84,417.42,408.53,412.71,394.82,391.23,413.07,401.35,415.54,419.42,433.31,419.6,414.07,399.82,405.59,394.11,398.53,423.31,414.77,438.38,418.19,408.48,405.53,409.59,392.11,399.47,415.54,431.55,431.55,434.61,432.9,443.61,411.65,414.66,416.48,403.77,388.58,368.57,346.32,345.5,347.97,323.78,328.13,328.13,334.31,331.61,330.9,343.97,345.97,340.55,329.72,325.37,315.77,315.77,333.9,337.67,346.38,348.09,340.26,348.32,346.44,349.32,362.15,355.8,367.27,372.57,374.57,360.74,354.03,351.15,364.27,365.33,364.1,368.1,367.69,378.16,381.7,367.63,361.68,348.15,361.39,366.8,382.81,380.81,375.87,362.68,370.69,356.15,343.2,340.55,343.2,360.21,339.2,335.55,331.37,332.73,337.32,331.55,331.55,325.07,323.72,326.02,338.08,341.02,315.6,312.6,310.12,311.07,306.65,299,294.88,292.29,294.88,287.7,297.7,300.18,294.35,294.88,304.41,317.6,322.13,321.48,311.42,302.41,316.13,310.48,322.9,310.3,314.89,309.3,312.12,316.07,329.9,331.02,328.84,326.37,307.3,318.07,318.42,322.9,314.6,314.77,330.55,332.9,338.38,329.43,354.74,367.98,363.63,371.39,346.5,345.73,344.79,336.43,345.03,346.85,346.85,343.79,328.13,324.43,339.32,326.6,321.84,318.07,315.95,316.77,324.9,322.95,325.78,325.13,321.31,306.3,306.47,304.41,298.29,301.29,290.94,295.47,295.47,294.41,289.11,298.12,294.17,294.17,296.47,319.01,322.01,334.14,331.72,336.73,341.73,337.08,335.08,335.08,334.61,332.61,331.72,344.08,363.86,360.57,362.21,369.63,375.93,363.21,354.91,368.45,371.81,367.33,353.03,365.69,354.62,354.21,352.09,353.86,365.33,363.98,353.44,347.32,347.32,339.02,335.37,345.79,342.44,340.79,340.32,337.49,332.14,334.2,334.49,327.02,334.84,327.25,323.31,317.25,319.42,318.6,332.96,333.49,339.26,345.09,342.38,361.04,359.98,351.91,348.91,373.98,371.34,355.15,350.85,337.08,335.61,344.67,344.67,372.4,374.16,364.69,370.81,368.63,368.1,364.51,356.97,361.74,359.8,350.26,342.2,359.15,364.33,378.81,366.98,364.33,358.51,356.15,360.39,358.27,358.62,353.09,362.63,358.56,380.46,375.1,382.11,397.7,401.24,389.82,388.52,391.58,409.71,435.14,435.14,421.95,401.41,406.65,407.12,398.88,397.53,394.7,384.46,385.11,397,399.47,406.83,405.06,398.23,398.23,393.76,387.29,389.94,384.23,385.23,393.11,394.76,378.63,371.45,376.1,376.1,365.27,360.39,356.97,367.75,374.34,375.46,379.81,377.16,383.52,382.22,382.34,380.75,386.4,385.4,386.58,396.59,418.3,419.07,420.19,416.48,401.24,407.18,411.48,408.36,398.18,392.58,385.17,378.87,401.88,384.52,377.99,374.1,374.28,376.46,373.22,383.7,374.87,375.04,384.4,392.47,400.77,411.65,414.3,414.3,413.71,414.42,411.24,413.07,412.18,413.83,417.01,422.54,411.3,414.95,416.19,410.12,399.65,405.41,403.65,399.88,401.47,383.76,400.41,400,399.23,400.88,406.42,411.77,408.95,406.53,413.24,410.54,407.36,406.59,406.12,406.95,397.47,395.64,393.64,400.65,391.41,379.81,386.4,388.88,393.58,408.48,414.6,427.19,429.19,428.49,425.43,433.02,443.56,440.14,454.21,454.03,451.27,456.5,462.74,451.5,453.8,453.8,452.44,456.21,448.03,451.38,448.03,446.91,437.26,433.73,430.43,433.49,441.2,457.86,460.04,469.63,483.76,479.16,480.05,483.64,463.15,503.12,509.06,509.06,512.42,510.06,506.18,502.3,484.64,484.17,486.82,491.17,500,490.46,484.87,490.82,484.93,484.93,498,490.17,499.23,515.07,525.25,515.19,518.42,525.01,518.25,524.25,507.12,504.71,503.88,509.01,511.95,497.94,501.29,499.59,503.59,504.41,479.87,481.64,480.46,467.92,467.92,475.04,479.64,505.65,506.18,526.55,540.61,528.02,533.31,560.04,563.68,556.03,562.45,582.58,574.57,556.27,573.4,554.21,538.14,548.85,551.97,553.27,566.51,646.56,648.68,689.41,699.23,701.88,693.88,693.88,731.61,722.48,753.44,730.37,727.37,723.66,721.78,719.25,750.5,721.13,714.36,716.72,684.7,658.8,628.43,642.26,661.92,657.92,656.74,675.93,673.1,664.86,645.67,661.15,675.1,707.06,701.65,702.3,693.41,713.6,723.96,734.61,752.27,752.74,737.43,759.27,750.44,743.26,743.2,762.15,762.15,780.87,774.46,743.32,735.73,754.38,745.38,786.99,765.57,770.69,793.53,795,828.43,842.5,832.02,870.1,903.18,903.18,848.68,821.31,818.19,830.61,837.9,778.28,774.16,774.1,780.4,805.3,805.3,774.57,769.22,771.87,802.77,766.51,786.05,770.28,750.38,703.35,691.29,672.51,678.52,672.45,649.09,632.43,643.97,634.79,603.65,646.38,597.47,545.62,532.2,523.84,510.89,541.91,547.85,557.03,573.51,590.99,629.49,635.61,639.38,635.61,637.61,613.66,605.36,582.17,575.99,558.33,562.51,566.45,566.45,521.37,525.54,526.13,508.42,507.77,511.18,533.55,513.3,536.9,513.13,522.25,514.13,525.31,535.02,550.74,553.27,563.68,646.73,632.73,610.42,590.41,587.7,599.29,601.82,605.71,603.53,598.59,622.07,629.31,637.67,614.01,642.97,659.51,654.21,642.02,634.61,618.3,628.9,635.14,626.19,636.73,612.6,586.52,586.99,598.76,620.89,658.21,667.51,658.62,639.49,612.71,588.11,583.76,567.04,573.93,575.22,578.99,604.83,604.12,614.95,599.18,577.99,577.99,576.52,580.05,587.64,607.42,593.7,595.47,605.18,577.4,600.71,578.22,603.3,637.2,639.2,611.54,512.6,530.43,528.08,525.49,525.49,528.66,521.66,502.12,495.35,514.01,528.96,584.23,599.82,585.11,585.11,584.7,559.51,573.04,607.36,603.88,622.42,622.42,643.79,642.91,617.07,607.36,536.26,519.42,523.9,544.44,537.02,529.25,533.61,550.91,556.44,543.26,564.63,553.74,539.61,563.04,585.76,585.76,628.55,614.24,607.3,581.75,561.57,548.68,575.1,540.44,551.09,532.9,536.79,555.27,525.43,547.15,512.54,524.13,562.92,558.45,593.23,606.89,598.71,600.71,606.24,557.5,570.57,554.33,542.26,536.55,520.54,511.42,522.13,521.48,437.55,380.93,402.41,385.76,458.33,412.3,409.36,418.01,418.13,408.06,404.94,404.94,392.82,413.24,429.25,455.68,469.57,462.39,452.5,452.91,457.74,475.1,473.34,473.87,486.29,501.18,505.36,543.2,570.51,561.04,561.8,576.81,580.64,577.4,564.1,558.15,549.56,549.56,567.27,566.1,569.75,555.97,577.87,601.82,607.71,625.6,638.96,653.03,671.81,682.93,683.81,680.4,705.36,708.3,717.01,717.01,727.49,718.54,752.85,748.97,741.61,734.31,725.43,711.54,716.54,719.78,719.78,705.83,732.31,719.48,724.6,732.96,698.12,706.95,685.29,666.63,673.28,666.45,642.85,646.44,657.62,654.86,654.8,658.98,675.34,642.38,617.3,634.31,641.91,640.26,658.45,699.76,728.19,751.91,731.43,737.43,711.42,727.19,718.36,689.88,681.52,692.64,685.23,685.7,693.05,718.07,700.47,700.47,697.35,698.76,731.08,773.22,773.75,796,824.01,886.23,925.43,928.61,934.79,941.67,994.06,957.8,968.92,979.46,951.8,923.07,925.66,964.69,984.81,1072.1,1081.52,1105.53,1123.96,1092.94,1156.8,1132.02,1068.86,1134.61,1101,1129.72,1192.05,1191.17,1217.01,1190.64,1168.16,1216.66,1289.11,1295.47,1306.12,1333.9,1318.48,1317.07,1381.4,1283.28,1397.88,1402.77,1400.35,1490.88,1419.13,1441.44,1394.64,1452.8,1424.07,1344.91,1329.72,1185.23,1220.54,1318.01,1321.54,1355.27,1355.27,1391.88,1415.3,1409.59,1378.22,1334.02,1396.23,1453.33,1485.7,1552.15,1521.25,1419.31,1397.88,1368.51,1327.37,1462.92,1565.16,1627.96,1626.07,1687.35,1687.35,1676.22,1732.61,1722.37,1679.87,1856.5,1837.26,2021.37,1998.53,1924.78,2031.14,2035.73,1990.17,1962.04,1981.34,2135.08,2135.08,2148.32,2290.23,2340.08,2352.27,2290.11,2414.6,2561.98,2564.98,2441.91,2576.81,2468.75,2233.08,2253.62,2323.07,2257.21,2196.88,2415.19,2436.55,2422.95,2422.95,2353.03,2477.63,2456.45,2520.13,2477.75,2460.33,2525.01,2445.91,2427.13,2428.9,2234.73,2358.86,2336.96,2179.52,2291.47,2372.63,2464.33,2385.82,2508.12,2600.35,2717.42,2717.66,2614.89,2489.11,2379.93,2328.02,2248.91,2092.17,2102.53,1894.06,1988.46,2165.1,2155.62,2155.62,2223.43,2222.37,2393.94,2480.93,2475.52,2510.65,2740.79,2685.29,2691.17,2678.46,2639.32,2644.97,2869.22,2835.31,2923.6,3087.46,2968.16,3051.56,3043.91,3191.35,3392.88,3768.1,3923.43,3805.94,4395.59,4681.17,4511.95,4730.02,4567.45,4265.21,4011.42,4112.65,4308.36,4485.58,4420.25,4420.25,5272.98,5464.45,5435.67,5715.13,6094.76,6263.1,6354.15,5862.27,5085.4,5587.29,5508.48,5249.44,5861.51,5777.58,6403.71,6008,6140.02,6674.46,6674.46,7129.96,6190.52,6171.34,7142.79,6664.68,6740.91,6793.94,6075.81,5741.97,5741.97,5796.06,5523.13,5584.46,5836.61,5763.98,5515.01,5786.46,5322.43,5021.78,4996.76,5093.94,5714.07,5647.32,5828.19,5420.54,5298.41,4829.49,4349.62,5148.09,4844.2,4882.28,5254.09,5257.15,5188.17,5165.21,5067.69,5111.95,5363.68,5590.52,5719.01,5954.97,5537.14,5515.66,5734.73,5690.29,5358.62,5491.29,5523.25,5505.53,5490.64,5642.91,5494.06,5627.31,5639.55,5983.46,5983.46,5887.35,6049.26,5752.85,5740.2,5438.67,5459.68,5453.5,5753.38,5978.81,6144.56,6451.8,6308.89,6359.8,6370.1,6203.53,6268.86,6269.04,6459.03,6326.6,6262.27,6153.97,6403.77,6096.76,6056.5,5821.31,5610.3,5380.4,5481.11,5172.69,5172.69],"삼성전자":[null,null,100,99.69,97.78,98.95,98.28,96.43,96.8,99.32,100.86,101.66,101.11,99.45,100.12,100.92,101.17,98.22,101.48,98.34,95.57,94.71,95.88,96.49,97.6,98.03,100.92,101.48,101.54,101.54,103.2,103.2,107.45,107.63,106.28,105.72,107.57,109.05,110.15,109.54,107.82,108.68,109.35,108.25,110.34,110.46,111.51,111.08,111.32,109.66,110.65,110.71,110.03,110.89,110.89,111.08,112.25,111.26,109.42,111.38,114.52,114.58,117.78,119.38,115.26,112.8,113.72,113.66,115.32,114.46,117.11,117.42,121.23,122.77,122.77,122.77,121.42,120.37,121.11,121.42,121.72,119.45,118.15,118.15,118.03,116.8,115.63,116.06,116.98,116.49,118.95,119.82,120.92,120.55,117.6,117.11,118.28,118.28,122.22,121.91,123.32,123.69,123.69,123.69,123.63,124.92,127.26,127.38,128.74,130.46,128.92,130.95,130.65,128.62,127.69,126.77,127.63,128.55,129.17,126.77,127.51,129.48,129.66,128.74,128,129.05,128,128.92,130.52,129.29,127.88,127.69,125.85,123.94,125.42,126.89,131.38,131.69,134.89,137.29,137.29,138.15,138.15,140.06,140.06,144.68,144.68,140.31,140,140.98,141.85,142.71,142.58,141.35,137.6,138.77,138.22,138.09,140.55,141.78,140.37,137.35,137.54,137.48,141.42,141.35,141.35,139.38,138.95,141.85,139.63,139.69,139.57,140.55,140.25,143.26,148.12,146.09,147.57,146.52,148.55,148.62,146.77,147.51,146.28,145.29,144.62,146.4,147.88,147.26,149.72,150.77,153.48,155.57,155.32,155.82,156.43,156.12,157.54,157.17,156.49,153.85,153.35,153.23,146.95,148.31,149.54,150.77,147.02,146.77,146.4,146.83,142.4,141.23,137.29,138.46,138.46,142.15,144.74,144.31,144.12,144.62,146.09,146.22,144.68,141.85,141.78,142.15,142.52,143.02,141.66,143.88,144.62,148.06,151.02,153.23,152.62,152.68,154.77,155.08,161.48,160.37,160.68,162.46,162.46,164.98,164.98,159.02,157.72,157.78,157.78,157.78,157.78,157.78,157.78,157.78,162.46,168.12,168.62,166.15,165.91,168.62,168.49,163.02,165.66,167.08,166.28,165.85,161.23,163.32,166.28,169.48,176.06,175.57,173.48,173.48,172.62,174.65,173.35,173.54,173.48,172.06,170.28,171.63,171.75,169.85,170.09,172.18,170.15,170.65,161.97,163.94,161.85,156.31,156.43,157.97,157.72,153.91,156.12,160,159.32,160.31,157.91,157.11,155.75,157.54,158.65,158.65,151.2,152.92,152.92,148.31,151.88,156.8,156.8,156.98,158.83,157.17,160.37,160.06,155.08,150.28,148.43,148.31,149.35,153.85,152.68,153.54,151.75,148.43,151.26,151.82,154.65,156.25,157.6,153.23,153.54,153.29,146.77,147.45,145.91,140.92,141.54,137.54,140.68,146.28,150.77,150.77,150.77,148.86,145.85,145.48,143.88,145.29,145.78,145.78,144.8,144.8,141.6,139.08,144.68,149.6,151.38,153.05,153.05,158.95,159.26,158.58,157.35,156.12,157.54,157.11,159.32,152.98,154.71,153.78,149.85,150.89,151.45,149.35,148.06,144.37,149.97,148.92,151.38,150.4,150.34,150.77,153.23,154.89,153.78,158.03,162.4,158.83,159.69,155.26,155.08,160.43,163.08,163.08,163.08,163.08,163.08,159.69,159.69,161.85,156.62,158.77,157.85,154.15,151.38,153.38,152,152.31,153.85,153.85,159.38,158.15,162.15,160.92,157.85,152.31,156,157.85,157.23,157.85,157.85,155.69,152.77,153.54,152,152,148.31,146.62,143.38,144.62,144.62,144.77,145.38,143.54,144.62,147.54,144,143.54,140.15,142,142.31,141.38,138.15,140.31,142.46,141.54,140,143.08,141.69,141.08,143.23,144.31,146,143.08,142,142,144.31,144.31,143.08,142.31,143.23,140.15,140.77,140.92,143.69,144,144.31,139.69,138.62,138.92,138.92,136.15,135.69,134.92,137.85,141.85,142.15,142,142.46,143.23,144,146.62,149.08,146,146.62,143.38,141.85,138.15,140,138.62,137.08,135.54,141.08,138.92,140,142,145.38,145.85,145.85,145.85,145.85,146.15,142.92,142.62,140.62,140.62,137.54,137.54,138.31,138.31,139.38,132.62,135.38,134.77,134.15,135.85,135.54,135.08,134,132.46,130.92,126.15,126.15,127.38,130.31,130.46,129.69,135.85,134.77,134.62,135.38,135.54,136.31,139.08,136.92,135.69,136.15,135.38,134.31,131.69,129.54,130.62,130.46,131.08,132.46,132.77,132.77,128.77,133.08,129.69,127.54,124.62,126,123.69,123.85,124.46,123.08,119.85,120.46,119.69,120.31,118.92,118.92,119.38,119.38,118,117.69,119.08,119.08,119.23,115.69,115.23,119.23,117.23,121.85,122.46,124.62,123.23,126.46,127.54,129.08,130.15,131.54,129.69,129.23,132.46,137.69,138.62,140,142.77,142,142.62,142.62,142.62,142.62,142.15,137.85,138.46,141.69,142.15,146.15,141.69,142.15,141.38,144.31,144.46,145.08,145.69,143.85,143.85,138.77,138.77,138,136.15,135.38,136.77,134.77,134.31,137.38,134.92,134.92,136,134.46,135.08,135.54,141.08,143.23,140,139.23,139.54,138,137.38,138.62,140.77,143.38,144.46,144.15,143.54,143.54,143.69,142.31,144.15,144.77,145.38,144.77,140.31,139.38,139.54,139.08,137.69,137.38,138,142,141.08,141.08,141.23,139.38,139.38,138,136.15,130.62,132,131.23,131.23,130.92,127.85,126.77,129.23,132.77,133.85,134.92,131.38,131.23,130.92,128.62,130.92,130.77,134.77,133.69,135.08,135.08,136,137.85,138,137.23,134.62,135.38,135.08,136.46,139.54,140,140.62,140,140.31,140.62,143.08,144.62,143.38,142.31,139.69,141.54,140.46,136.62,138.77,140.15,142.15,142.46,142.92,144.15,141.69,141.85,144,145.23,145.54,142.77,145.23,145.08,141.85,143.23,139.54,139.08,138.31,135.23,133.85,132.92,131.23,132.77,134.46,132.31,134.46,134.46,135.08,134.15,136.77,136.92,135.54,135.23,134.15,135.54,135.85,133.54,135.38,134.77,133.08,135.69,140.62,142.46,144.31,144.62,145.08,145.08,145.08,144.92,144.31,146.77,151.23,151.38,151.69,152.31,150.46,151.38,148.92,150.92,150.31,146.46,146.46,147.69,146.92,150.46,150.46,149.38,151.23,153.85,154.15,156,155.38,153.54,154.77,157.54,157.54,156,156.62,157.85,157.23,155.08,155.08,157.54,160.92,162.15,164,162.77,160.31,158.77,161.85,161.54,162.46,165.23,164.62,164.62,160,156.92,158.77,159.38,159.38,160.62,157.85,154.77,155.08,153.54,152.15,152.31,155.08,157.54,158.46,159.69,164,168.31,168.31,174.46,173.23,172.31,172.31,170.77,169.23,169.23,170.46,173.85,171.69,171.69,169.85,170.77,170.77,171.69,174.77,180.31,183.08,184.62,184.62,181.54,186.77,188.62,192,188.92,191.69,187.08,187.08,187.08,180.92,181.85,176,173.54,176,181.23,183.08,188,185.85,183.69,184.31,186.15,186.77,190.15,189.23,184,185.23,184.62,182.15,174.77,178.15,173.85,172,166.77,169.23,170.46,176.62,177.85,173.85,173.85,168,160.31,160.31,153.69,150.46,145.54,140.31,132.15,139.69,130.77,144.46,149.69,147.08,148.62,147.23,146.92,140.92,144,144.62,149.85,152.62,149.54,151.08,151.54,148.62,150.77,150.77,150.77,158.15,154.15,151.54,153.38,153.38,151.85,153.38,154.15,153.85,153.85,153.85,149.23,149.23,151.38,150.15,150.15,148.92,147.38,149.38,147.69,147.23,150.15,154.77,153.85,153.69,150,150.31,151.54,153.54,155.08,156,157.54,158.15,167.69,168,170.77,168.92,170.77,170.46,167.08,160.92,153.54,160.31,160.62,160.92,162.77,160,158.15,162.77,159.69,164,161.23,162.46,161.85,162.77,164.92,169.23,164.31,163.08,162.46,162.15,164.31,165.54,168.31,165.54,167.38,166.77,170.15,168.31,166.46,166.77,171.08,180.31,181.54,181.54,178.15,174.77,176.31,175.08,178.46,176.92,177.85,179.08,181.54,180.62,178.46,178.46,179.69,177.85,170.46,172,172.62,173.54,173.54,171.08,170.46,166.15,166.77,167.38,173.54,171.08,173.85,180.62,179.69,182.15,181.54,185.85,187.69,187.69,183.08,182.46,182.15,179.08,180.31,177.85,178.15,179.08,179.08,179.08,179.08,179.08,180.62,181.54,184.31,183.69,183.69,185.85,187.38,187.38,184.62,183.08,184.62,187.38,187.38,184.92,185.23,185.85,184,181.54,178.77,174.15,176.62,180.92,180,185.54,184.92,185.23,185.23,188.62,187.69,194.46,204,202.15,199.38,198.77,199.08,207.69,208.31,204.92,209.23,209.85,205.23,208.62,213.85,214.46,220,224.31,220.62,227.38,224.31,225.85,227.08,227.08,227.08,225.54,224.62,224.62,222.46,227.38,239.38,239.38,242.15,240.92,249.23,249.23,255.38,258.15,252.92,255.08,273.23,280,278.77,276,276,270.77,261.54,267.69,268.31,271.08,267.08,275.08,266.77,263.38,257.54,252.31,255.38,259.69,260.31,253.85,256.92,255.38,254.46,251.08,251.08,251.08,259.08,261.23,256,252.62,254.15,252.92,252.31,252.31,262.46,253.85,253.85,257.23,258.46,253.54,252.62,252.31,250.46,248.92,252.31,254.77,251.69,254.77,253.23,255.08,252,252.31,251.69,249.23,249.85,250.77,251.08,252.92,250.46,255.08,260.92,262.77,264.62,263.38,260.62,257.23,256,258.46,258.46,258.77,258.15,256.31,258.15,254.15,253.54,254.77,256.92,255.08,252.62,251.38,250.77,251.38,254.15,254.15,253.23,252,256,249.85,246.15,241.54,246.46,244.92,244.92,244.92,244.62,246.46,245.23,245.85,245.54,244.92,246.46,247.69,248,248.62,254.77,252.92,252,252,249.54,249.23,249.23,247.69,248.92,251.69,248.92,247.69,245.85,246.15,246.46,249.85,251.08,252,249.23,248.31,246.46,246.15,247.38,249.85,248.62,245.85,244.31,245.23,245.54,244.62,248,245.54,243.08,243.08,241.54,245.23,244,242.46,241.54,243.69,243.08,241.54,244,250.46,255.08,252.62,250.77,250.77,246.77,241.54,236.92,228.92,228.92,228.31,227.38,224.92,223.69,225.54,232.62,232.92,229.54,228.62,229.54,236,236.31,233.85,235.69,237.85,234.15,234.77,231.69,231.69,234.77,235.69,236.92,234.15,237.54,237.54,237.54,237.54,238.15,237.85,239.08,234.77,228,228,225.23,225.23,222.15,219.38,220.31,220,220,212.31,211.69,213.54,215.69,216,217.23,216.31,216,216.62,216,218.77,215.69,217.54,214.77,215.08,220,216.62,217.23,216,217.23,216.92,216,215.08,217.23,219.69,219.38,217.54,216,219.08,230.46,231.69,230.15,226.77,222.46,222.46,219.38,228.92,233.23,232.62,234.77,238.15,238.15,240.62,236.62,236.31,236.92,238.77,239.38,240,237.23,240.31,244.31,245.85,247.69,246.77,247.08,242.46,240.92,240.92,240.92,242.15,238.15,236.62,240.92,240,242.77,242.77,239.69,237.85,238.46,236.92,234.77,235.38,232.62,231.08,227.69,227.69,219.38,225.54,225.54,225.54,225.54,225.54,227.69,224.62,224.62,224.62,232,230.46,226.77,226.77,230.15,230.77,228.62,228.62,228.62,228.62,220,221.23,221.23,221.23,220.62,224.31,224.31,215.69,213.85,213.85,213.85,215.38,216,216,216.62,216.62,217.54,215.08,216.31,216.92,214.77,214.77,214.46,216,215.08,214.15,212.62,213.23,212.92,210.77,209.23,208.62,208.92,206.15,211.38,207.69,204.92,205.23,207.08,207.38,208.31,206.15,204,203.38,200,199.38,207.38,207.08,207.69,208.92,208.92,204.62,204.62,202.15,202.15,199.69,204.62,204,208,209.54,207.69,209.23,208.92,204.62,204.31,202.77,204.62,208.31,207.38,207.38,205.23,205.54,205.54,201.54,200.92,200.62,196.31,191.08,190.46,186.77,187.38,184,180.62,180,177.23,176.62,179.69,180.92,182.77,178.46,175.38,172.92,175.69,176,173.54,179.08,180.62,180.92,178.77,178.46,176.92,184.62,190.46,187.38,186.15,190.15,188.62,188,189.85,190.15,190.46,188.92,188.62,189.85,188.62,189.23,189.23,187.08,184.62,181.85,184.31,185.23,185.23,187.69,185.85,189.23,187.38,184.62,181.85,181.54,183.69,184.62,180.31,180.92,183.69,179.69,176.92,175.69,175.69,172.31,171.08,171.08,171.08,178.77,174.77,172.31,172.92,173.54,171.69,170.15,167.38,167.69,165.85,166.77,162.77,161.85,163.38,163.38,169.85,172.31,173.23,172.92,172.92,170.46,171.69,169.85,173.23,174.15,173.85,171.69,170.77,172,176.92,177.54,182.77,183.08,176.31,182.77,184.62,183.38,182.15,182.77,185.23,190.15,190.77,185.85,193.54,190.46,192,192.92,188.92,190.15,188.92,186.46,187.69,188.92,187.69,184.92,186.46,191.38,192.62,185.85,185.54,182.15,181.23,182.15,185.85,183.08,183.69,186.15,182.46,183.08,183.08,180.31,178.46,181.85,178.77,178.15,178.77,174.15,170.15,170.15,170.77,170.46,177.85,179.08,181.54,186.77,185.85,186.15,186.15,187.08,188,187.69,185.85,189.23,190.15,190.15,190.15,194.77,196.31,198.77,194.77,188.92,187.69,195.38,195.38,189.54,190.77,194.15,194.77,193.54,193.54,194.46,191.38,196,192.62,192.92,191.08,188,190.77,188.62,186.15,186.46,186.46,187.08,186.15,189.23,186.77,185.54,184.92,183.08,184.62,181.54,184,184.31,188.62,185.23,185.54,188,191.69,193.85,191.08,193.54,192.92,194.46,196.92,194.15,195.69,196.62,191.69,200,202.15,202.77,203.08,203.38,200.31,200.92,201.85,201.54,200.92,202.15,200.62,195.69,197.23,198.77,201.54,201.54,202.15,201.23,200.31,200.31,202.77,200.92,198.77,197.54,197.23,198.46,201.23,200,203.69,210.46,210.77,210.46,210.77,211.69,216.31,216.31,222.46,219.69,218.15,222.15,220.62,220.62,218.46,218.15,221.54,218.46,221.54,221.23,220,220.92,219.08,219.69,216.92,219.38,220.31,222.77,223.38,223.69,222.77,222.15,224.62,224.62,221.54,220.31,215.08,213.85,220,221.23,221.23,225.85,225.54,221.54,220.62,218.46,216.31,216.62,215.38,214.77,220.62,217.23,214.77,218.77,215.08,211.69,210.15,210.77,208,212,209.23,207.69,207.08,207.08,206.15,205.23,204,204.92,204.92,206.46,209.85,206.46,205.54,205.54,206.46,205.85,218.46,219.08,217.54,215.38,216.62,216.31,217.85,216.92,218.15,220.62,221.54,216,214.77,214.15,212,211.69,213.54,211.08,210.46,210.46,210.46,210.46,210.46,207.69,205.23,203.08,203.08,204.31,209.85,212,209.23,207.08,213.54,216.92,213.85,211.69,210.46,210.77,209.23,205.23,207.08,207.08,205.85,211.08,214.46,214.15,218.15,218.15,215.08,216.31,216.92,216.62,217.85,222.15,224,223.08,223.69,224,224,222.77,220.62,219.38,223.69,223.69,224,221.54,223.38,219.08,220.62,220,223.38,224.62,226.15,224,224.92,225.54,224.31,225.85,230.15,230.77,233.54,233.54,235.69,240,241.54,241.54,244.92,236.92,235.69,235.69,235.38,229.85,226.46,225.23,224.92,227.38,223.38,218.46,220.62,229.85,231.08,231.38,227.69,228,225.85,228.92,228.62,223.69,226.46,231.38,228.62,228.92,230.77,228,228,228,231.38,227.69,225.23,224,227.08,225.54,224.62,224.92,224.31,224,224.31,225.23,225.85,225.85,230.46,226.77,224.31,222.15,225.54,222.77,225.54,228,228.62,222.46,224,224,236.62,244,242.77,240.62,245.85,245.54,248.62,253.54,252.31,261.54,258.77,262.46,260,260,257.23,257.23,258.77,257.54,252.92,246.15,242.77,244.92,238.77,234.15,232.31,241.85,234.77,236,236,238.46,238.46,240,238.77,238.77,250.15,250.15,245.23,243.69,241.23,240.92,240.92,240.62,238.15,242.77,241.23,239.08,240.92,233.54,237.54,238.77,231.38,226.15,226.15,232.92,231.69,238.15,238.15,237.85,232.92,231.38,235.38,241.85,244.92,240.31,245.54,249.85,251.08,246.15,248,248.62,250.15,251.08,250.77,251.69,251.69,251.69,260.31,268,268.92,270.15,270.15,269.54,259.69,266.77,269.85,266.77,267.38,259.69,255.38,258.15,252.31,247.38,248.92,249.85,249.23,258.15,255.69,244.92,219.69,223.08,229.85,225.85,229.85,232.31,234.15,237.54,237.54,246.77,240.92,242.77,240.92,240.92,239.08,234.15,233.23,235.08,227.69,228.62,228.92,223.08,215.38,212.31,212,207.69,203.69,199.69,204,198.15,198.15,198.15,198.15,194.15,193.85,192.62,194.46,191.38,199.08,197.54,189.23,189.23,188.62,188.62,186.46,187.69,185.54,185.54,181.23,182.46,182.46,187.69,183.08,183.69,182.15,181.54,177.54,181.85,174.15,172,178.77,183.38,181.85,182.15,179.38,180.62,177.23,176.31,176.31,175.38,169.23,163.08,155.69,153.54,164.62,174.46,173.23,170.15,173.54,172.31,178.15,179.38,173.23,170.77,166.77,164.92,164.92,163.38,165.23,166.46,164.31,166.15,166.15,172,172.62,171.08,166.77,168.92,163.38,163.08,164.62,167.38,167.38,164.92,165.23,163.69,163.69,164.31,167.38,172,170.46,176.31,172.62,170.15,166.46,165.85,165.23,167.08,165.23,164.31,164.62,167.08,165.23,165.23,165.23,165.23,165.23,165.23,161.23,156.92,162.15,162.77,166.15,165.23,171.08,171.38,171.69,171.69,172.31,172.31,175.08,180.62,179.69,179.08,176.31,176,174.15,173.23,167.69,167.69,167.69,166.15,167.08,165.23,165.23,164.92,168.92,168.31,168.31,177.23,177.23,180,185.23,189.85,186.15,184,188.92,190.15,185.23,177.85,180.92,180.92,177.23,172.62,163.69,164.62,163.08,173.54,169.85,172.92,174.15,168.31,169.54,170.15,170.46,169.23,171.38,171.38,171.38,171.69,171.69,170.77,170.77,167.08,167.08,167.08,168,168,168.62,177.23,175.08,176.62,176.31,174.77,171.69,172,171.38,168.31,166.77,168.31,165.85,172,172.62,172.92,174.77,174.77,177.85,181.85,181.85,184,182.15,184.31,183.08,179.38,176,178.77,184,182.15,183.08,178.46,186.15,188.62,185.23,187.08,184,185.23,187.08,196.31,194.77,189.85,188.92,185.85,187.69,192.62,192.31,196,199.08,205.23,206.46,208.62,203.08,204.31,203.08,202.77,216.62,217.23,223.38,219.69,212,214.46,215.08,211.69,216.92,220.92,218.46,218.77,221.23,220.31,220.31,215.38,215.38,216.92,217.23,219.69,220,216.31,217.23,214.15,214.46,208,212.62,214.77,215.69,213.85,215.69,220,223.38,225.85,232,235.38,244.31,240.62,247.08,247.08,256.92,260.62,262.77,264.92,256.31,259.08,258.15,264.62,276.15,276.15,276.15,276.15,276.15,276.15,290.46,287.08,281.85,292.31,300.62,301.23,301.85,300,303.38,296.92,304,313.85,306.15,309.23,320.31,330.77,341.85,322.77,309.54,305.23,301.23,309.54,318.46,317.23,316.31,299.08,309.54,300.92,296.92,309.54,291.69,297.54,305.54,316.31,318.46,309.23,310.15,318.15,321.54,323.38,333.54,336.92,333.54,332.31,330.15,335.08,322.46,316.31,332,331.08,327.08,340,343.08,341.85,341.85,360,367.69,368.92,368.92,395.38,424.92,427.38,433.85,427.08,427.69,427.08,423.38,431.69,442.77,458.15,459.38,446.77,460,468.62,468,468,490.77,499.69,494.46,493.85,462.77,515.38,520.31,490.15,488,512,510.15,516.31,549.54,557.54,557.54,557.54,557.54,584.62,584.92,593.85,615.38,626.15,670.77,666.15,666.15,600.31,529.85,589.54,579.08,533.85,578.15,584.62,578.15,564.62,580.62,596.62,641.54,616.92,613.54,573.23,583.69,581.54,554.15,554.15,542.46,514.46,583.54,548.92,572.92,594.15,604.62,647.69,627.69,633.85,618.46,635.38,649.23,669.23,664.62,660,673.85,669.23,690.77,675.38,690.77,683.08,695.38,678.46,678.46,715.38,715.38,818.46,835.38,826.15,878.46,858.46,873.85,910.77,832.31,864.62,847.69,849.23,921.54,900,900,920,944.62,921.54,975.38,1073.85,1109.23,1109.23,1081.54,1012.31,909.23,990.77,930.77,920,992.31,1036.92,1055.38,1066.15,1115.38,1089.23,1087.69,953.85,1047.69,1103.08,1044.62,993.85,1027.69,967.69,880,952.31,978.46,910.77,853.85,855.38,876.92,783.08,809.23,860,784.62,784.62,750.77,796.92,801.54,830.77,767.69,781.54,676.92,641.54,636.92,807.69,736.92,738.46,756.92,709.23,710.77,707.69,736.92,786.15,824.62,844.62,844.62,826.15,761.54,833.85,866.15,790.77,790.77,804.62,818.46,790.77,800,803.08,770.77,769.23,786.15,830.77,829.23,829.23,827.69,798.46,766.15,764.62,780,776.92,803.08,843.08,850.77,878.46,878.46,878.46,830.77,838.46,826.15,849.23,849.23,849.23,836.92,826.15,806.15,806.15,770.77,713.85,713.85,646.15,663.08,667.69],"어플라이드 머티어리얼즈":[100,100.79,101.87,102.09,102.27,104.86,103.81,103.78,103.81,103.09,104.6,103.96,102.84,101.69,101.51,105.5,106.15,104.78,101.37,103.67,104.28,106.51,107.99,110.54,110.58,112.77,113.92,114.68,114.68,114.68,114.53,115.68,115.83,108.27,113.09,113.42,113.71,116.94,117.66,116.37,115.11,115.22,115.61,118.92,116.94,116.69,117.3,117.19,118.74,118.35,118.35,119.89,118.35,117.48,116.08,116.08,114.89,115.97,115.47,115.25,117.91,119.17,120.4,119.82,121.55,121.55,119.78,121.19,121.4,121.73,121.4,122.41,123.81,122.23,126.04,123.53,123.2,126.01,125.68,127.01,126.55,127.84,128.06,127.37,127.05,127.55,126.73,127.66,126.55,128.31,128.31,131.58,131.33,130.07,130.58,131.04,130.29,132.55,131.26,132.63,132.59,132.99,133.78,134.46,137.12,138.27,137.66,140,140.47,141.29,142.34,138.78,139.64,139.75,140.18,139.78,139.64,139.82,139.89,139.93,139.89,140.29,138.06,138.78,140.04,139.78,137.41,135.86,134.96,134.96,136.76,136.87,141.19,143.49,143.13,145.47,146.73,146.44,148.67,146.08,150,150.04,149.46,149.71,150.47,149.42,151.22,154.21,156.4,156.26,159.42,162.12,153.81,157.95,158.56,160.9,161.55,160.54,161.94,163.67,163.67,163.88,165.04,165.47,168.35,168.06,167.52,170,170.61,160.94,159.5,161.33,158.2,155.25,155.07,159.32,155.97,156.91,155.9,158.6,155.58,150.68,153.56,149.06,148.6,147.52,147.52,151.51,151.47,156.62,159.03,163.31,162.88,162.95,165.9,166.01,167.7,169.71,169.96,168.38,168.27,166.91,170.68,165.61,162.77,159.39,158.63,153.71,153.6,154.03,158.13,157.91,157.59,151.19,154.96,157.48,157.84,159.93,155.11,159.35,155.79,159.89,158.35,157.27,155.79,156.94,158.35,163.56,162.3,162.23,162.23,160,160.9,162.66,159.53,163.96,164.21,165.9,169.24,169.57,172.84,173.6,170.07,169.6,171.83,166.65,165.18,175.68,182.09,187.37,187.34,186.47,185.61,185,188.49,189.53,189.17,191.47,191.76,194.03,197.99,198.31,199.06,199.03,201.76,202.77,202.81,198.92,201.19,203.92,201.08,202.99,200.4,202.37,203.42,202.63,203.13,204.75,199.57,202.73,205.14,202.95,200.61,208.06,203.2,207.27,211.51,207.48,207.48,208.31,204.82,206.22,190.32,189.82,186.73,179.03,180.14,183.49,188.13,185,185.68,181.55,182.59,184.57,188.99,192.09,190.5,191.69,186.65,187.27,187.27,183.63,185.9,186.04,183.88,190.79,194.17,195.29,196.4,201.15,197.34,191.73,191.37,192.27,192.27,196.04,206.26,206.47,206.47,206.69,207.88,204.6,200.58,205.47,199.03,192.01,192.91,191.65,182.3,173.78,180.76,175.14,164.57,172.95,178.06,178.24,186.91,194.21,197.95,197.95,203.81,201.91,201.69,205.07,211.55,207.34,207.16,205.29,208.74,207.3,215.79,213.74,213.56,221.62,219.32,214.71,216.65,216.83,213.81,210.43,213.06,218.63,212.09,199.21,210.32,199.42,194.46,200.04,200.04,190.25,194.17,199.86,195.29,188.27,190.72,197.12,197.66,202.99,201.69,204.57,208.13,196.87,184.14,183.78,180.5,175.25,176.76,181.62,177.7,178.67,183.13,181.76,182.41,189.06,189.17,192.27,194.71,199.75,197.27,198.78,194.57,198.45,194.1,178.09,179.86,180.76,181.08,182.63,182.91,182.91,187.12,185.58,182.66,187.91,188.09,190.32,188.96,184.35,183.99,179.46,182.95,183.38,178.74,177.37,173.81,174.64,174.75,176.22,172.52,168.02,167.88,162.77,162.91,166.15,164.32,161.15,161.15,163.45,165.94,167.34,168.13,162.59,164.32,165.94,166.58,170.14,173.67,167.88,168.2,167.01,165.14,165.32,169.68,173.74,172.34,174.93,172.55,173.06,175.68,177.99,178.53,180.5,176.83,173.13,173.56,174.03,170.9,170.61,157.45,156.58,157.41,154.64,153.92,153.71,157.37,156.12,155.04,155.18,154.75,154.75,153.31,152.88,144.86,143.35,142.45,140.94,138.09,139.89,140.65,139.21,140.97,140.43,141.69,142.55,140.65,138.78,137.63,137.95,139.03,137.91,139.93,140,136.29,133.96,131.62,128.49,123.85,117.95,121.19,120.25,125.04,125.76,122.01,123.35,120.61,120.58,114.42,117.41,116.4,111.94,116.62,118.27,127.16,126.87,123.45,125.43,126.8,125.68,123.31,117.34,120.47,120.79,125.97,127.34,123.81,128.67,126.58,126.58,126.08,129.53,129.5,133.49,131.44,134.1,137.91,127.45,127.45,124.78,121.01,122.91,122.37,123.02,121.26,117.45,117.52,119.71,113.42,111.15,109.03,104.28,104.28,110.22,113.49,116.47,117.77,120.43,113.45,121.22,123.38,118.38,123.38,125.04,125.11,121.8,121.4,121.01,124.24,128.45,128.45,123.88,123.42,136.04,140.97,139.21,137.41,142.45,140.58,141.4,139.93,140.72,144.89,143.6,143.09,143.53,146.37,146.94,146.44,140.65,140.65,141.37,140.29,139.68,141.83,142.66,142.37,139.5,137.91,138.71,140.58,140.04,136.94,135.14,135.76,138.53,139.24,138.85,140.04,145.29,143.88,145.22,142.34,148.67,143.38,141.73,142.55,140.04,138.53,142.66,147.95,147.45,152.63,153.31,154.82,154.39,151.12,151.69,152.77,154.64,153.63,157.27,157.88,158.09,158.09,157.52,157.66,159.93,159.89,160.65,159.14,158.53,156.04,157.19,158.13,155.07,151.26,149.57,147.27,146.76,140.61,143.92,149.28,149.86,153.6,145.14,148.45,145.65,143.67,142.09,142.09,140.32,141.62,142.99,139.17,139.5,145.4,146.01,148.85,149.32,155.18,157.37,149.28,149.82,148.31,145.68,152.19,152.99,155.43,154.53,152.27,151.01,156.76,160.76,161.55,164.32,160.65,160.68,160.68,158.2,156.29,158.17,160.86,162.88,167.3,166.47,165.5,166.26,173.27,171.98,182.48,183.56,187.55,182.81,182.52,182.27,182.48,177.59,174.35,171.04,163.53,166.65,167.91,172.16,169.6,167.12,172.88,168.02,169.64,167.73,169.42,168.09,168.45,169.17,162.3,164.06,163.71,165.11,170.18,172.73,172.73,171.26,178.09,181.12,180.22,182.23,180.54,185.47,184.35,184.71,183.17,184.17,187.37,185.9,183.31,186.19,184.03,186.8,187.59,177.81,179.5,179.93,177.91,178.56,183.02,182.19,177.37,182.88,183.49,186.15,186.83,190.32,185.47,187.55,185.9,189.35,186.98,181.76,198.09,200.43,204.86,199.71,198.6,195.18,199.5,200.5,201.01,200.79,201.22,201.55,203.56,202.95,205.47,204.89,223.24,224.28,219.21,214.57,203.02,201.22,209.64,207.09,209.68,209.68,208.27,203.96,199.06,201.76,200.86,203.6,203.6,203.67,212.37,217.12,215.36,215.68,218.67,217.19,218.24,222.34,219.71,221.22,221.22,220.54,220.04,219.17,219.57,223.74,220.18,215.43,221.65,221.51,222.91,221.12,222.34,224.28,222.77,227.37,226.08,226.08,227.34,229.82,229.82,223.02,212.41,216.51,215.18,216.73,208.6,214.82,226.65,229.5,227.3,221.98,226.33,231.83,235.14,242.34,240.47,240.47,234.39,242.48,238.85,231.19,219.71,211.73,215.14,205.04,209.06,216.4,208.78,217.7,212.7,207.88,187.3,202.05,188.81,162.27,183.06,145.79,161.37,140.94,144.57,136.65,144.5,162.37,160.9,176.98,162.05,170.14,164.82,155.76,155.54,152.09,166.01,171.08,185.11,178.38,178.38,179.42,188.74,181.19,187.88,191.37,182.12,173.85,187.45,183.09,186.12,183.56,181.37,195.47,178.71,168.67,171.15,175.72,181.65,184.35,193.56,194.28,188.24,185.22,195.79,187.19,195.54,199.53,204.6,197.91,195.65,195.65,198.35,202.88,196.65,202.09,200.32,200.68,207.95,209.1,216.51,215.47,215.07,215.32,199.32,203.42,205.22,210.58,215.83,217.19,219.24,220.4,218.85,215.72,215.76,210,212.45,217.45,214.68,219.42,219.42,228.27,223.67,225.79,228.38,225.14,221.26,224.96,223.38,224.24,224.1,229.24,229.53,231.01,228.88,218.06,226.65,224.1,227.52,231.73,231.4,233.85,233.27,233.35,228.81,228.67,234.68,231.87,239.21,234.06,243.24,240.79,238.96,236.94,229.46,223.99,229.28,230.4,229.35,223.13,226.87,221.58,222.63,234.1,221.08,219.28,219.28,200.11,198.56,198.27,197.84,203.09,205.76,203.13,202.66,201.98,206.19,208.24,205.94,207.88,209.46,213.53,214.57,213.85,218.17,209.39,217.99,217.27,219.86,225.18,227.66,232.66,232.7,230.14,228.45,226.62,223.2,223.96,223.42,221.94,219.24,214.06,211.62,206.19,214.03,213.06,217.01,222.41,233.31,251.62,253.71,256.47,249.6,255.97,251.08,261.91,267.91,267.52,272.34,277.88,275.97,289.57,298.38,291.87,291.87,297.34,296.69,303.13,306.8,309.71,319.57,320.65,322.84,315.9,316.15,317.63,318.35,318.24,318.53,314.75,309.68,310.83,308.06,302.27,306.94,306.94,305.29,303.13,312.88,310.43,312.48,322.3,326.73,340.14,343.74,352.37,359.75,352.7,380.58,371.01,371.01,392.88,387.91,388.38,382.48,388.92,379.6,354.6,363.85,347.77,364.06,372.63,359.24,371.37,362.27,381.98,379.06,380.86,406.47,419.78,419.78,425.72,416.22,408.02,429.71,414.5,417.77,441.76,409.82,425.14,439.75,422.66,415.25,389.35,408.09,380.14,410.86,405.32,421.55,411.12,413.24,426.26,431.29,411.08,413.17,429.24,418.63,435.61,430.65,462.73,452.19,455.97,480.58,509.06,509.06,514.57,501.94,500.5,501.26,499.68,485.61,485.97,482.52,483.49,481.04,470.83,462.55,485.79,473.92,485.11,493.88,492.01,488.09,487.01,477.37,477.88,463.02,468.67,473.85,478.24,448.53,444.42,413.24,431.37,449.03,444.5,438.17,448.92,468.74,462.81,484.1,494.6,492.45,495.76,496.87,496.87,497.16,500.04,490.58,503.06,499.89,488.71,484.35,493.38,492.16,500.11,498.71,492.73,493.96,472.05,478.6,480,487.41,497.34,489.89,507.16,510.5,512.23,496.22,496.98,496.98,492.01,485.14,476.73,485.25,492.09,490.25,487.95,479.14,461.08,462.66,474.71,496.4,493.45,497.95,498.13,485.25,493.56,494.6,503.35,510.83,511.37,513.53,511.76,513.13,510.79,496.62,484.96,464.82,467.27,473.71,463.31,458.17,464.75,457.55,472.99,472.81,477.77,476.58,491.19,489.39,486.08,480.07,483.63,488.6,488.6,490.97,480.43,485.61,492.23,501.58,504.1,508.02,518.31,506.47,487.52,486.26,496.76,507.59,510.5,513.45,478.02,461.4,463.06,464.5,450.36,460.68,455.11,460,454.03,458.63,455.97,461.19,475.07,473.35,479.42,484.17,481.94,479.64,488.96,488.35,474.82,475.4,489.28,491.55,501.83,507.95,513.49,540.04,551.4,550.22,562.19,541.01,553.6,564.1,562.12,567.84,561.08,571.01,539.68,530.76,535.68,536.01,536.01,515.43,543.96,529.46,545.58,526.94,524.57,530.14,564.35,565.79,549.1,549.39,529.14,531.4,552.73,527.7,525.72,521.62,544.68,547.91,559.32,559.32,585.32,574.24,579.06,568.27,566.04,575.29,569.64,553.02,562.37,542.48,538.09,548.38,573.92,565.4,600.72,600.72,548.06,514.64,500.54,485.83,501.04,478.38,487.7,468.17,476.44,497.05,498.6,506.33,491.04,487.66,489.68,499.1,518.71,502.77,476.58,474.32,503.02,507.05,490.9,479.68,479.68,468.56,459.93,479.93,488.2,482.73,466.22,479.06,469.93,452.3,428.85,446.58,462.66,449.53,444.75,432.12,447.52,469.35,474.78,486.12,482.73,487.34,472.73,498.53,493.02,495.18,508.78,488.49,474.1,458.31,465.61,437.81,429.24,440.29,431.51,418.13,412.09,420.36,407.77,407.77,413.2,421.08,424.06,416.15,405.76,411.76,391.8,391.4,412.34,396.94,406.37,409.35,427.37,408.17,404.68,380.4,385.54,373.81,384.03,402.37,397.41,420.29,400.5,398.35,382.95,395.43,383.42,390.4,413.92,429.78,429.78,421.91,411.73,422.05,413.53,413.67,416.08,404.53,385.76,366.47,346.47,347.55,350.43,322.27,323.13,323.13,342.34,337.91,335.54,350.22,351.12,341.8,330.72,327.27,310.32,310.32,309.35,311.37,326.44,328.02,318.78,319.17,320.43,329.75,339.82,335.04,353.35,367.73,373.53,365.72,363.31,355.79,372.16,378.27,381.22,382.73,377.66,392.12,399.5,394.32,387.88,358.49,377.88,379.6,397.05,394.89,390.25,381.29,389.46,376.37,362.63,366.65,365.04,377.7,355.4,347.27,340,338.38,330.25,328.2,328.2,324.78,330.72,337.37,347.16,346.4,325.14,326.04,319.86,319.68,322.73,316.98,313.27,305.9,303.2,298.35,302.7,309.35,303.67,294.71,310.25,321.62,320.94,316.98,297.12,284.86,274.46,273.42,285.68,269.14,267.66,270.61,277.91,282.95,296.47,305.54,314.86,317.05,311.29,322.73,317.59,322.99,315.68,310.43,329.86,341.87,350.58,339.5,376.94,397.59,387.09,397.34,374.89,375.72,376.62,378.2,385.04,387.3,387.3,380.65,372.19,371.4,394.24,384.93,383.85,382.84,376.65,381.69,390.68,386.12,393.42,402.41,394.39,376.12,376.73,374.06,372.3,380.94,351.08,349.71,349.71,342.95,338.96,349.42,350.29,350.29,347.95,357.23,352.23,375.07,383.06,388.63,395.9,396.4,395.58,395.58,393.56,394.6,381.87,394.42,410.65,406.44,409.89,415.76,404.68,389.21,401.04,428.09,446.98,431.58,423.35,433.53,417.09,417.55,412.84,419.17,426.04,429.71,415.07,415.25,415.25,400.29,397.16,406.15,400.4,403.13,417.81,421.8,426.08,427.91,426.4,418.6,426.8,421.01,411.47,416.69,432.88,426.19,441.83,441.01,446.19,433.09,427.55,441.65,429.96,427.59,418.71,431.12,439.24,441.83,440,432.09,422.01,411.69,411.69,419.06,418.63,407.05,408.17,406.12,402.12,400.25,396.91,411.47,408.13,408.67,397.88,396.8,401.73,406.58,406.29,403.45,407.52,404.5,417.48,416.37,409.5,415.14,415.32,417.59,435.65,434.96,452.16,467.34,456.65,455.22,447.81,437.88,469.32,489.42,489.42,491.26,479.5,485,484.28,481.04,481.8,485.65,489.93,489.64,503.63,510.04,507.81,503.99,499.75,499.75,498.27,491.62,499.71,489.46,502.88,527.16,518.09,518.81,519.93,523.27,523.27,511.73,504.96,502.05,505.61,494.82,499.6,513.13,513.45,523.38,519.82,510,482.16,490.65,497.66,503.81,500.07,525.68,546.51,545.29,549.03,529.96,531.69,523.96,540.94,532.41,522.16,520.18,499.39,510.4,503.88,497.3,494.93,513.17,535.14,531.83,532.37,512.66,519.28,523.09,539.5,542.99,549.5,553.92,553.92,552.55,551.01,533.2,530.68,527.73,517.88,520.07,520.04,497.3,504.57,495.36,492.7,486.29,489.82,491.33,482.3,485.83,497.19,498.02,501.83,491.8,501.08,501.01,504.64,504.14,508.63,511.44,521.58,507.7,507.19,513.38,508.81,483.56,482.45,482.84,485.25,468.02,470.65,472.3,471.33,476.08,486.65,498.24,502.7,504.89,509.86,518.81,515,542.01,538.63,554.24,558.88,556.87,534.5,548.81,536.87,537.7,537.7,540.79,542.48,532.59,537.27,538.78,545.29,533.35,525.72,520.5,533.78,531.37,558.06,565.54,564.71,581.8,582.55,576.83,583.92,564.46,580.54,582.91,582.91,590.94,590.68,586.76,582.99,555.29,544.78,537.09,535.97,545.18,543.27,538.88,546.58,544.06,544.06,553.09,551.69,576.76,604.1,605.4,600.9,626.4,620.97,600.36,606.04,597.99,591.01,600.61,604.96,615.43,606.83,614.75,625.5,668.49,667.41,648.6,669.75,675.04,717.88,717.88,680.36,684.64,718.45,709.21,732.19,729.71,710.58,725.25,756.29,753.56,746.01,763.2,764.78,739.42,724.35,737.19,721.44,722.12,714.57,722.05,724.24,737.63,758.27,756.29,749.86,743.42,748.2,741.83,741.83,750.68,741.4,745.97,731.62,747.66,751.94,756.87,752.7,766.12,747.7,739.86,753.53,719.03,698.99,682.63,681.51,695.11,705.25,710.43,731.58,738.35,714.57,697.81,711.91,734.14,751.29,745.76,745.9,742.19,754.42,743.27,754.75,782.34,769.89,762.88,791.19,790.65,784.71,783.99,794.57,794.57,796.12,787.95,778.92,773.67,770.54,763.38,803.49,797.66,797.59,820.72,827.23,854.86,854.5,852.63,873.6,891.47,891.47,863.27,846.8,826.76,842.7,835.14,836.44,848.88,853.99,866.4,875.22,875.22,872.63,885.94,904.57,917.16,867.84,875.54,883.27,884.32,791.62,782.91,756.33,803.85,790.11,742.91,727.77,742.7,739.46,707.7,763.31,706.12,653.99,654.28,659.39,642.12,685.43,687.7,694.57,722.3,725.29,761.98,747.84,758.78,741.58,752.23,720.14,729.03,705.86,704.21,693.85,694.17,709.57,709.57,659.6,656.04,648.35,628.6,638.67,640.47,668.85,659.03,677.95,674.75,678.38,669.57,707.59,691.22,697.99,707.84,709.75,753.99,737.12,726.8,709.35,723.56,717.95,726.51,719.89,722.59,737.63,733.67,737.63,769.39,687.12,663.99,659.14,670.36,663.53,658.27,657.19,660.97,670.94,666.69,683.88,666.55,653.17,659.64,654.03,670.79,674.53,698.17,690.76,678.27,671.26,657.52,669.06,607.48,614.14,609.03,613.27,632.19,629.06,627.88,623.02,616.26,616.26,628.45,659.24,658.85,651.65,618.81,622.37,618.2,604.93,615.58,608.2,609.17,609.39,612.73,595.14,580.72,588.45,602.37,605.65,605.65,602.7,600.11,588.63,585,589.46,611.73,638.42,639.64,636.65,636.65,617.45,614.6,624.64,641.65,670.79,690.83,690.83,693.78,703.27,685.97,671.76,627.95,621.76,630.5,653.67,648.74,643.17,642.3,649.89,657.55,647.48,660.65,658.99,650.68,662.84,608.63,608.63,618.71,626.12,633.13,618.63,606.37,595.47,606.15,563.45,568.6,547.23,549.89,558.71,545.11,560,539.53,528.74,536.19,539.39,559.93,559.21,552.19,555.61,555.32,547.19,557.37,552.66,542.01,531.22,521.8,522.01,523.96,531.47,487.45,456.65,477.88,463.88,538.6,497.27,521.37,519.89,523.2,497.09,494.46,494.46,487.63,497.48,516.47,540.18,545.14,542.41,537.95,542.12,535.83,557.91,556.15,550.47,560.47,561.15,559.75,604.28,622.41,626.4,628.6,595.58,596.91,596.15,583.56,577.41,566.58,566.58,582.12,581.26,573.67,563.85,565.72,581.8,582.48,590.61,599.78,610.76,625.07,621.55,629.5,613.63,635.07,626.22,621.73,621.73,609.57,618.56,648.13,658.53,660.14,659.03,658.53,661.01,683.49,687.23,687.23,686.26,701.4,702.84,712.34,711.98,708.99,716.87,700.76,692.52,685.04,692.84,673.17,672.7,676.69,667.95,684.42,677.73,681.26,647.7,647.45,657.63,644.42,640.79,658.81,665,663.24,677.88,683.56,677.12,581.87,588.24,583.53,578.99,574.96,584.5,582.7,591.76,591.33,594.5,578.27,578.27,566.8,562.05,569.21,585.43,582.91,588.13,587.84,612.05,603.6,614.86,624.24,640.76,682.59,683.81,721.29,722.55,724.6,717.99,733.53,737.23,736.47,783.24,804.28,782.48,805.43,761.01,782.41,792.45,755.22,789.5,784.86,818.63,819.14,809.32,820.61,812.95,793.38,821.83,822.84,832.12,818.85,848.02,836.51,838.49,855.07,828.02,866.51,840.04,827.59,845.61,822.55,829.96,802.99,812.99,822.7,809.78,845.79,792.19,805.79,830.61,872.16,899.17,899.17,907.37,916.37,954.42,966.3,969.21,964.03,964.6,960.94,989.75,971.62,932.41,939.82,931.08,893.06,911.87,922.34,931.69,936.08,938.06,938.06,942.09,946.22,935.14,924.42,967.16,1022.73,1064.78,1051.08,1013.09,1083.38,1105.18,1096.65,1085.94,1147.77,1176.3,1176.3,1144.71,1169.93,1146.73,1159.64,1149.14,1196.8,1211.33,1227.84,1159.42,1181.29,1146.3,1070.5,1093.49,1160.11,1189.1,1183.71,1222.59,1181.26,1276.65,1276.65,1291.83,1328.42,1330.32,1350.29,1343.71,1359.46,1420.68,1351.51,1339.21,1338.78,1263.74,1286.91,1246.51,1168.13,1219.21,1244.17,1262.84,1213.2,1228.53,1245.25,1267.84,1257.09,1284.93,1284.39,1301.4,1345.29,1328.56,1217.81,1212.84,1162.3,1229.46,1272.66,1253.49,1253.49,1268.42,1274.5,1387.48,1430.97,1437.01,1423.49,1423.17,1418.2,1402.52,1427.84,1408.71,1418.45,1451.37,1452.91,1500.14,1456.33,1370.9,1376.22,1419.03,1399.57,1407.84,1477.77,1541.8,1477.12,1566.33,1595.76,1551.08,1570.54,1584.75,1570.58,1487.66,1463.71,1535.43,1537.27,1554.53,1554.53,1636.3,1612.41,1617.55,1618.92,1648.09,1762.77,1801.33,1804.68,1629.53,1770.4,1795.72,1787.81,1987.91,2040.47,2107.12,2043.99,2132.81,2219.82,2219.82,2302.81,2107.48,2118.6,2402.88,2254.82,2498.71,2600.72,2341.4,2169.21,2169.21,2132.34,1994.6,2052.16,2117.48,2167.27,2069.75,2142.81,2084.28,2017.73,1905.25,1891.01,2030.76,1992.52,2024.46,1928.96,1859.32,1713.88,1569.96,1804.93,1826.15,1864.06,1966.26,1921.73,1897.41,1939.35,1878.13,1890.68,1971.76,1922.81,1824.39,1925.58,1850.11,1784.78,1784.93,1770.94,1741.69,1726.76,1725.76,1735.11,1660.68,1648.88,1589.39,1577.19,1568.02,1635.65,1635.65,1700.68,1686.51,1633.13,1642.05,1525.94,1515,1494.17,1501.44,1599.17,1669.93,1699.5,1706.4,1705.94,1744.6,1750.94,1841.76,1839.5,1903.96,1942.59,1950.65,1907.45,1872.84,1832.99,1823.85,1789.68,1669.93,1606.58,1546.8,1472.27,1472.27],"테슬라":[100,102.65,104.95,102.65,103.16,104.54,104.32,104.27,105.18,103.1,101.94,98.37,96.94,96.63,98.25,99.61,100.51,97.99,95.56,97.22,93.55,94.75,94.83,97.27,95.39,95.13,98.56,99.58,99.58,101.39,101.11,97.74,97.65,93.77,93.56,96.31,95.82,99.58,99.14,99.08,99.21,102.16,102.44,101.87,104.4,104.52,107.65,107.08,107.47,109.99,109.99,113.18,113.29,110.68,110.17,110.17,111.87,117.03,116.91,118.07,119.24,118.51,118.44,118.37,122.58,122.58,121.46,122.89,125.68,126.18,128.34,131.27,131.2,130.19,130.41,129.22,129.89,128.5,129.69,129.58,132.9,132.75,135.12,138.79,138.81,144.67,144.86,144.24,138.66,140.35,140.35,143.01,141.01,131.98,132.5,126.95,128.89,128.9,129.14,129.7,129.52,128.17,127.28,126.26,125.64,126.92,133.02,131.85,135.11,134.82,135.04,129.24,131.48,131.36,135.68,139.32,143.04,143.01,143.29,143.48,153.91,156.58,152.09,154,155.98,161.06,159.16,153.04,156.73,156.73,155.41,154.8,157.52,155.97,157.56,158.81,161.78,159.91,159.12,161.93,166.44,164.41,160.35,152.33,158.98,158.38,165.63,167.67,166.58,167.46,162.86,163.44,157.82,161.4,160.25,160.01,156.66,159.94,163.35,167.63,167.63,172.77,175.81,175.48,175.22,179.07,181.92,185.42,190.76,184.22,185.09,193.83,196.26,193.51,191.48,190.66,191.92,194.06,197.26,197.7,194.62,186.83,191.4,185.99,186.44,181.8,181.8,168.64,159.22,161.49,162.95,168.7,169.89,166.74,168.99,164.76,169.23,167.69,170.1,169.31,176.59,175.09,177.28,172.44,172.75,166.77,164.76,168.02,178.95,184.01,183.12,188.3,187.43,183.23,184.51,187.56,186.81,187.11,181.44,179.14,174.19,175.99,181.88,181.96,179.44,178.21,179.09,182.09,183.49,183.23,183.23,180.24,177.63,180.76,177.05,187.51,187.02,188.82,194.7,195.82,198.49,193.39,192.78,188.95,181.01,177.87,178,175.79,175.09,175.86,176.08,179.49,183.03,183.2,184,176.81,183.33,182.82,183.38,183.32,180.76,183.41,185.42,181.38,177.92,173.76,173.92,167.99,168.16,165.43,165.02,170.93,165.54,154.29,157.81,156.1,157.79,156.93,156.21,156.21,162.61,159.16,160.5,161.12,162.43,159.18,163.85,161.17,161.17,162.69,163.34,163.72,158.56,159.23,158.04,157.35,156.58,161.51,160.47,162.47,169.58,175.82,174.79,174.21,177.07,174.71,170.71,169.61,170.99,167.66,167.66,163.59,160.67,162.59,160.52,165.26,163.56,162.21,163.22,173.44,172.04,172.61,174.24,173.35,173.35,175.32,178.99,177.65,180.46,181.25,181.89,178.33,174.08,176.76,180.21,178.29,182.67,180.06,177.23,171.75,172.18,177.87,162.52,160.04,162.78,166.87,166.17,172.24,172.97,172.97,172.6,171.84,178.47,181.51,184.28,180.96,176.87,170.62,172.78,171.87,169.21,171.32,169.67,168.68,178.13,176.24,168.4,167.87,165.68,161.66,160.11,163.19,159.36,155.47,156.83,143.94,132.9,137.21,137.21,130.17,137.93,147.94,157.62,154.31,149.34,157.09,155.15,151.62,154.85,150.14,148.32,151.24,154.71,149.64,146.1,146.14,144.72,147.18,151.62,151.53,154.63,155.26,146.65,151.62,156.1,155.69,158.2,157.26,155.22,150.53,146.51,147.7,146.7,142.72,146.67,141.79,143.88,143.25,143.77,143.77,146.3,150.4,146.8,150.45,152.99,150.1,164.72,162.97,163.78,171.22,176.72,177.76,184.43,184.66,191.19,181.76,186.75,179.17,172.01,171.69,176.33,177.61,180.41,176.81,172.75,160.27,160.27,159.39,159.26,164.21,166.26,164.45,163.29,164.4,159.88,166.37,166.97,165.1,161.67,156.32,153.35,159.18,158.1,153.22,149.6,153.71,155.1,180.21,179.51,176.32,195.69,190.94,181.71,183.28,183.75,179.23,174.62,172.95,157.51,159.02,165.96,165.83,165.03,166.44,164.61,160.79,157.25,156.3,155.53,155.53,148.97,144.74,144.85,135.72,147.2,144.07,149.79,149.24,152.2,152.01,146.92,154.17,153.81,154.21,154.51,155.18,159.61,158.55,136.51,160.19,155.2,151.99,145.3,135.05,129.18,135.49,132.44,130.04,133.42,133.84,142.6,140.12,136.06,134.05,134.54,151.65,148.74,162.33,170.6,172.64,170.09,173.91,177.5,178.6,176.02,175.84,179.5,181.17,180.71,170.8,174.64,177.36,179.65,182.67,182.24,179.16,174.36,174.36,167.99,178.39,177.31,179.35,175.9,180.7,184.83,185.45,185.45,187.18,184.56,188.26,189.09,189.01,194.26,188.55,179.63,173.76,171.67,162.6,164.86,152.29,152.29,168.12,162.99,172.13,171.58,159.89,154.86,163.79,172.7,172.9,174.54,177.86,179.04,172.41,177.58,178.41,179.06,155.84,155.84,154.11,148.27,150.29,153.14,152.8,153.36,159.19,158.29,160.97,161.32,165.68,163.55,158.54,157.66,161.29,160.76,158.88,156.61,158.73,158.73,157.58,155.99,150.15,151.94,154.04,153.57,162.27,164.92,151.98,147.12,142.58,142.42,142.6,146.49,149.99,146.09,148.98,149.49,142,138.94,137.9,141.06,141.28,136.38,134.26,138.05,141.69,143.65,144.29,149.09,147.39,150.45,138.06,141.76,140.85,140.39,142.33,138.39,138.02,137.34,140.94,139.84,140.88,140.88,135.47,136.06,133.36,127.67,121.23,124.49,123.06,120.65,125.85,131.49,131.65,127.38,126.23,124.76,123.49,117.04,119.77,119.59,117.72,108.8,105.88,105.73,99.37,100.79,98.28,98.28,97.29,97.89,97.04,95.46,92.27,99.81,101.36,106.18,105.43,109.75,111.93,107.89,110.29,110.81,116.02,115.87,116.74,113.23,114.38,115.3,113.3,113.05,114.89,115.21,117.12,115.77,121.11,121.11,120.18,118.76,118.61,123.18,123.02,126.36,130.7,130.12,131.4,130.72,133.11,131.82,134.14,136.56,117.97,117.57,121.56,124.9,124.57,120.57,120.82,117.71,118.97,120.34,122.86,121.16,118.07,121.16,113.23,111.18,113.39,116.95,116.45,113.85,114.53,108.99,110.85,110.37,111.15,114.31,116.32,116.32,116.01,113.78,118.36,117.27,119.5,121.44,127.4,126.76,126.42,125.19,126.21,125.54,127.14,124.06,124.37,115.08,117.91,125.06,124.84,124.19,126.15,125.35,120.14,119.32,122.56,123.76,126.07,126.18,127.8,132.48,132.96,133.92,135.06,132.48,130.7,131.77,131.31,154.51,169.17,168.96,163.03,162.41,162.36,161.53,163.68,163.55,168.37,172.99,173.82,177.92,180.41,178.44,180.11,181.57,180.44,185.36,181.59,182.94,171.71,173.41,169.58,170.8,170.8,170.11,172.65,173.33,171.7,170.33,173.17,175.05,179.85,181.84,185.44,184.78,196.69,195.4,202.7,208.31,209.11,216.14,219.25,219.25,222.18,221.89,213.81,215.68,221.83,228.4,232.8,241.83,253.73,248.16,246.52,270.6,277.34,267.32,264.74,263.2,263.2,282.12,293.65,295.01,291.2,287.7,292.28,299.54,330.38,335.41,402.14,457.34,378.79,386.14,385.68,397.65,399.25,395.59,414.52,412.47,412.47,442.57,472.99,463.71,464.53,429.88,412.41,401.53,350.07,344.4,383.39,384.36,386.42,373.55,362.69,313.47,332.71,326.99,289,281.82,229.46,221.8,186.23,220.48,220.42,223.91,260.36,278.02,272.3,265.19,258.88,270.16,248.28,234.31,247.48,266.16,281.22,282.97,295.42,295.42,335.61,366,376.28,384.21,388.68,384.8,354.05,377.45,363.8,373.87,411.81,396.54,412.72,403.11,361.58,392.45,396.07,403.47,402.17,422.47,418.28,417.31,407.8,414.17,412.03,419.48,416.59,420.48,426.69,421.16,421.16,422.18,422.89,415.45,430.5,463.03,454.51,455.23,445.65,456.62,489.75,484.98,528.49,501.57,482.2,510.88,506.36,511.34,517.61,516.03,512.64,516.49,495.39,508.34,494.81,520.39,556.72,577.25,623.15,623.15,707.15,716.57,704.21,718.85,796.38,771.84,782.02,797.08,773.69,773.79,847.08,808.6,820.96,780.09,730.56,793.77,761.23,772.9,766.91,737.66,765.62,766.65,765.63,767.98,748.97,731.37,708.59,801.59,835.74,851.06,946.4,972.93,968.51,1032.08,1056.91,1038.46,1043.17,1110.11,1154.23,1141.16,1284.59,1224.61,1153.25,1049.19,1078.37,1078.37,851.23,944.22,957.26,960.82,1081.72,1159.41,1138.79,1091.54,1139.8,1158.46,1093.6,980.51,999.66,1050.06,1085.79,1080.3,1105.92,1155.29,1070.04,1097.34,1067.18,1096.36,1097.96,1118.79,1140.18,1151.4,1189.16,1157.15,1133.4,1110.62,1087.7,1089.5,1097.62,1084.32,1083.42,1094.76,1046.66,1059.06,1000.31,1032.46,1092.75,1085.22,1129.33,1108.35,1085.95,1057.85,1075.3,1061.46,1053.05,1052,1138.4,1254.49,1287.04,1262.14,1345.25,1431.69,1479.69,1479.69,1510,1463.19,1507.42,1466.33,1529.65,1544.24,1654.36,1675.29,1558.26,1616.49,1572.46,1649.39,1632.42,1605.41,1690.81,1791.61,1675.24,1650.7,1665.24,1705.94,1705.94,1710.89,1716.82,1791.04,1819.11,1881.24,1895,1948.8,2103.63,2268.56,2091.13,2189.73,2202.54,2178.28,2129.72,2129.72,2177.12,2192.33,2178.26,2182.51,2270.57,2276.47,2227.68,2153.61,2045.6,2164.91,2249.92,2203.26,2191.15,2196.92,2225.77,2189.78,2074.71,2092.34,2103.84,2103.84,2052.54,2057.51,2029.75,2014.07,1841.87,1801.51,1912.82,1758.66,1741.34,1852.01,1769.54,1683.85,1601.98,1541.43,1451.33,1736.39,1722.16,1803.46,1788.33,1824.96,1744.9,1809.16,1683.75,1688.16,1727.16,1706.95,1624.74,1650.83,1594.94,1575.81,1638.53,1721.82,1705.89,1705.89,1781.42,1782.89,1729.66,1762.73,1745.26,1809.6,1965.15,1887.58,1904.65,1907.04,1842.21,1853.45,1918.23,1855.25,1880.28,1902.97,1816.71,1790.06,1745.21,1828.83,1765.57,1736.44,1729.58,1710.51,1733.27,1621.57,1591.05,1520.65,1473.73,1520.26,1486.98,1489.66,1452.52,1512.63,1497.42,1563.31,1558.8,1596.02,1626.24,1611.72,1611.72,1608.32,1559.91,1476.7,1544.26,1559.94,1555.97,1543.57,1572.8,1572.21,1592.31,1545.06,1559.26,1589.5,1606.8,1600.41,1607.83,1692.54,1752.47,1731.98,1775.42,1754.9,1752.17,1747.58,1750.1,1750.1,1700.3,1661.81,1682.85,1693.52,1767.63,1723.4,1684.32,1677.15,1660.7,1665.86,1702.67,1689.24,1673.7,1658.54,1695.25,1662.15,1667.82,1746.11,1771.5,1829.42,1829.6,1832.65,1842.21,1802.18,1839.97,1830.25,1824.65,1861.85,1848.76,1768.84,1716.1,1776.11,1736.11,1753.61,1820.74,1826.38,1833.37,1807.49,1835.22,1884.18,1896.58,1892.37,1887.99,1891.03,1891.03,1940.92,1943.36,1945.92,1897.99,1915.34,1919.18,1948.42,1951.41,1957.85,1882.27,1906.01,1938.39,1942.77,1996.26,2040.01,2004.43,2014.1,1999.07,1998.4,2014.67,2012.24,2017.81,2045.81,2024.88,2041.5,2077.03,2090.84,2109.51,2173.21,2243.01,2227.96,2231.9,2304.6,2345.02,2641.94,2625.36,2675.45,2776.45,2871.73,3115.57,3021.24,3129.15,3170.52,3150.37,2997.89,2638.43,2753.02,2741.57,2664,2612.37,2718.94,2807.31,2826.3,2931.17,2982.24,2858.91,2876.88,2876.88,2789.03,2930.99,2951.02,2822.75,2795.94,2616.44,2601.08,2711.25,2755.62,2587.65,2621.75,2491.26,2470.9,2515.96,2389.46,2404.03,2319.91,2419.39,2600.72,2750.57,2750.57,2820.01,2805.91,2800.04,2759.18,2724.22,3092.85,2963.47,2805.01,2744.64,2647.35,2727.68,2743.86,2851.67,2659.21,2705.74,2705.74,2656.5,2566.64,2568.24,2433.23,2397.4,2367.5,2416.5,2137.3,2181.76,2414.72,2400.62,2334.66,2297.23,2380.18,2338.99,2376.78,2402.56,2331.8,2216.95,2257.58,2377.89,2380.36,2259.1,2209.17,2209.17,2117.78,1969.58,2064.27,2087.72,2243.84,2228.22,2268.23,2163.56,2160.99,2074.09,2125.18,2214.3,2161.01,2050.29,1975.59,2067.15,2165.99,2246.85,2333.96,2374.61,2562.33,2575.56,2613.73,2605.28,2814.6,2834.53,2820.14,2777.89,2795.91,2952.8,2813.11,2695.81,2725.46,2643.56,2515.8,2544.21,2635.52,2539.18,2539.18,2588.91,2650.42,2519.08,2600.48,2590.87,2572.75,2259.28,2272.4,2262.09,2244.69,2327.64,2343.91,2455.71,2251.19,2231.52,2029.05,2062.38,1892.14,1876.68,1983.89,1867.32,1963.32,1829.78,1828.78,1711.44,1739.79,1619.3,1698.29,1824.42,1958.21,1958.21,1954.68,1908.56,1997.83,1813.65,1842.75,1847.44,1870.49,1853.78,1795.96,1668.41,1708.26,1801.92,1648.02,1676.32,1676.32,1833.14,1825.79,1817.93,1900.19,1894.1,1799.31,1767.04,1735.98,1757.55,1757.55,1802.43,1792.12,1891.19,1939.29,1812.31,1802.46,1833.16,1843.01,1856.57,1860.28,1898.82,1914.05,2101.26,2105.41,2075.94,2001.91,2125.34,2172.36,2298.03,2299,2324.6,2377.27,2386.83,2228.58,2246,2191.17,2276.42,2216.67,2320.3,2392.14,2370.82,2350.97,2342.26,2294.29,2242.06,2292.64,2297.61,2289.67,2227.96,2202.67,2147.61,2131.44,2143.43,2089.68,2089.68,2122.24,2194.01,2237.01,2317.59,2354.25,2259.2,2340.25,2349.07,2345.97,2390.21,2387.58,2326.25,2231.83,2129.28,2134.54,2188.13,2225.79,2074.22,2051.32,1874.61,1929.06,1862.32,1841.59,1725.12,1724.27,1674.31,1680.04,1714.68,1585.3,1696.35,1702.85,1717.16,1603.01,1658.38,1633.71,1720.1,1737.27,1740.75,1767.27,1759.69,1761.86,1662.56,1665.11,1604.48,1524.13,1479.43,1373.4,1474.94,1515.54,1476.72,1503.56,1445.56,1416.55,1393.51,1298.23,1314.01,1416.79,1416.79,1414.16,1414.62,1398.46,1505.72,1505.72,1506.96,1410.99,1390.65,1345.95,1341.31,1384.69,1297.84,1244.72,1212.62,1219.35,1161.81,1159.03,1065.68,1063.9,969.4,952.39,952.39,843.73,871.65,942.1,952.62,952.62,836,878.84,853.32,874.36,926.25,919.13,952.93,955.56,946.59,946.59,1016.88,995.93,983.48,1031.81,1111.7,1112.78,1116.96,1239.46,1375.8,1288.87,1339.61,1402.94,1456,1469.22,1506.19,1522.04,1556.69,1603.32,1522.66,1505.26,1618.25,1656.84,1562.49,1610.98,1610.98,1526.37,1553.36,1562.72,1522.58,1605.72,1590.87,1568.13,1476.34,1529.62,1498.84,1451.67,1407.51,1337.29,1341.31,1349.35,1417.25,1395.52,1423.98,1393.04,1417.17,1528,1478.27,1486.54,1472.55,1483.37,1463.11,1499.38,1510.21,1604.4,1506.26,1489.33,1434.73,1431.17,1431.17,1426.92,1444.55,1396.22,1437.67,1430.71,1446.48,1425.37,1396.6,1260.49,1276.65,1257.09,1242.55,1189.03,1238.84,1270.7,1251.52,1239.77,1242.09,1246.65,1315.17,1328.55,1308.13,1303.41,1330.79,1299.08,1286.48,1287.79,1344.56,1367.99,1393.12,1460.64,1436.66,1414.47,1426.61,1493.89,1493.89,1555.68,1577.1,1604.87,1654.75,1682.9,1711.51,1736.72,1816.3,1890.08,1932.07,2000.75,1985.9,1979.02,2014.9,2014.9,2122.47,2006.55,2046.38,1984.43,1864.17,1935.01,1981.65,1991.39,2024.41,2164,2164,2184.57,2138.64,2122.32,2085.04,2086.44,2103.45,2149.15,2176.07,2245.67,2268.56,2252.47,2033.15,2010.88,2080.79,2051.56,2044.36,1977.55,2060.53,2068.18,2019,1965.17,2005.47,1963.24,1944.6,1931.07,1872.99,1897.35,1876.55,1854.2,1801.61,1744.69,1695.35,1666.5,1788.62,1803.39,1831.77,1779.03,1845.15,1846.93,1988.92,1986.75,1995.88,1894.8,1894.8,1983.58,1948.24,1944.91,1921.79,2115.75,2068.57,2098.11,2134.77,2122.01,2051.56,2060.99,2030.75,1977.47,1893.79,1910.11,1887.91,1859.92,1905.39,1935.09,1945.76,1906.55,2019.69,2011.11,2014.82,2008.17,2038.72,2033.85,2001.98,1942.05,1963.7,1970.9,1876.78,1702.23,1639.44,1640.13,1674.47,1642.76,1591.26,1603.17,1526.29,1553.21,1590.48,1689.86,1701.07,1695.74,1718.24,1717.7,1623.89,1660.01,1730.07,1836.02,1878.02,1806.48,1811.97,1822.03,1865.33,1811.28,1811.28,1820.87,1825.74,1908.02,1888.07,1856.67,1847,1821.87,1846.15,1851.18,1876.47,1885.75,1854.04,1832.93,1850.56,1941.51,1960.46,1949.47,1989.22,1911.27,1968.19,1953.03,1953.03,1984.51,2021.86,1957.98,1921.63,1921.17,1844.07,1840.04,1836.64,1859.53,1817.08,1809.19,1757.22,1692.8,1692.8,1700.69,1666.97,1638.59,1640.98,1614.77,1617.4,1607.26,1412.38,1417.17,1476.57,1481.67,1448.42,1460.56,1453.21,1400.24,1431.48,1450.66,1465.97,1496.98,1454.91,1423.13,1459.4,1550.19,1546.32,1546.32,1498.45,1506.26,1526.68,1484.61,1542.07,1544.62,1562.49,1561.25,1567.13,1454.99,1397.76,1365.28,1381.6,1356,1374.79,1373.01,1310.68,1256.7,1264.98,1344.09,1324.91,1358.48,1336.51,1321.12,1335.04,1374.02,1390.72,1359.48,1359.48,1355.07,1288.64,1302.18,1323.29,1275.26,1337.75,1367.91,1328.32,1350.28,1322.82,1248.81,1215.02,1202.18,1159.49,1137.22,1098.55,1118.89,1253.84,1316.1,1301.48,1500.7,1417.41,1391.96,1392.12,1401.24,1428.85,1375.1,1351.21,1329.94,1302.87,1329.32,1373.09,1345.56,1352.13,1372.4,1352.99,1443.08,1392.89,1343.63,1386.16,1386.16,1366.91,1362.57,1382.68,1377.19,1363.35,1351.59,1353.37,1376.11,1372.55,1344.01,1319.81,1371.08,1411.14,1376.65,1449.58,1429.62,1429.62,1404.18,1415.32,1411.99,1448.88,1518.64,1526.76,1530.32,1622.96,1788.46,1905.47,1905.47,1945.14,1956.12,2028.74,2035.94,1864.02,1919.7,1953.8,1984.12,1921.79,1927.43,1849.87,1945.07,1905.39,1670.37,1703.32,1699.84,1794.96,1721.64,1794.73,1677.1,1606.03,1538.05,1551.66,1482.99,1537.74,1546.71,1527.3,1607.26,1557.38,1656.06,1671.38,1722.42,1709.89,1726.67,1629.15,1703.86,1648.87,1617.94,1591.18,1595.28,1655.83,1655.83,1628.69,1696.82,1780.03,1629.69,1672.54,1749.1,1764.26,1777.25,1780.96,1753.82,1762.24,1757.06,1886.37,1842.52,1933.39,1966.41,1987.68,1966.02,2014.28,2023.33,1995.41,1925.81,1861.16,1934.01,1862.47,1890.85,1864.17,1846.54,1684.37,1694.89,1698.06,1711.67,1708.26,1706.8,1692.49,1685.68,1652.27,2014.44,2081.8,2030.14,2007.01,1991.78,1932.23,1925.5,1878.02,1944.52,2231.36,2296.17,2484.17,2706.74,2540.39,2553.93,2406.53,2480.31,2619.66,2675.81,2645.11,2626.62,2726.54,2618.5,2615.72,2574.42,2574.42,2669.31,2761.57,2717.73,2768.07,2857.47,3010.05,3014.46,3101.08,3284.98,3233.4,3373.61,3580.79,3711.02,3403.77,3373.14,3256.29,3330.07,3575.07,3575.07,3512.04,3338.27,3228.06,3123.12,2933.18,3174.16,3178.88,3049.8,3054.29,3054.29,3052.74,3119.02,3065.27,3311.66,3200.3,3298.36,3298.36,3279.57,3210.28,3189.16,3144.31,3071.38,3078.65,3009.13,3095.59,3129,2967.21,3033.18,2924.6,2894.82,2796.61,2712.39,2540.47,2602.42,2752.68,2751.91,2751.91,2738.53,2788.41,2740.77,2612.39,2556.17,2341.72,2248.92,2180.48,2265.78,2201.36,2103.84,2158.43,2037.4,2031.37,1718.01,1783.2,1918.62,1861.31,1933.23,1840.66,1742.45,1824.04,1827.13,1923.41,2152.94,2228.35,2103.99,2112.27,2038.18,2004.23,2076.15,2186.74,2067.02,1851.64,1804.16,1715.77,2105.07,1951.95,1951.25,1951.56,1965.17,1868.04,1866.65,1866.65,1759.38,1840.35,1939.11,2006.93,2203.68,2210.87,2258.43,2182.1,2169.42,2221.15,2167.41,2129.43,2136.16,2202.67,2306.61,2462.21,2583.55,2688.8,2651.22,2706.59,2645.57,2658.95,2587.8,2637.45,2624.3,2624.3,2806.43,2760.11,2771.94,2679.37,2650.21,2662.43,2567.93,2201.74,2282.48,2386.42,2521.83,2524.46,2467.85,2515.8,2545.34,2446.51,2490.59,2490.59,2491.44,2696.54,2633.04,2533.13,2519.44,2502.81,2456.64,2325.56,2441.1,2438.78,2438.78,2273.2,2303.13,2288.2,2396.4,2424.55,2450.76,2403.43,2487.65,2470.17,2549.37,2540.39,2568.39,2571.87,2361.05,2444.27,2517.97,2484.02,2467.31,2384.02,2340.41,2391.68,2387.5,2474.04,2492.29,2549.37,2621.91,2635.9,2624.61,2595.23,2556.4,2591.98,2546.74,2504.9,2475.59,2629.49,2680.45,2719.66,2703.65,2675.65,2582,2582,2547.12,2583.7,2618.04,2713.24,2678.9,2683.31,2689.65,2852.21,3062.02,3171.07,3260.62,3293.41,3223.73,3295.04,3357.99,3293.33,3424.34,3274.31,3405.86,3427.59,3439.27,3553.26,3371.83,3324.11,3505.23,3349.32,3392.63,3368.27,3197.75,3371.06,3319.55,3365.26,3315.76,3397.43,3460.22,3422.87,3394.8,3472.21,3354.2,3498.81,3561.69,3569.11,3403.54,3530.83,3622.16,3435.71,3573.44,3448.47,3321.72,3443.21,3399.82,3330.07,3108.81,3127.06,3162.4,3103.09,3124.28,3056.53,3024.52,3230.92,3243.45,3298.98,3298.98,3326.74,3326.51,3319.55,3454.89,3515.13,3518.77,3399.52,3442.75,3491.31,3456.05,3549.39,3675.84,3788.51,3613.58,3738.17,3721.39,3779.62,3755.1,3753.87,3753.87,3674.91,3554.65,3514.36,3477.93,3387.84,3493.01,3348.32,3336.33,3370.28,3441.51,3472.06,3458.45,3396.58,3391.7,3383.43,3383.43,3242.29,3336.56,3475.15,3472.83,3365.64,3332.39,3336.72,3221.49,3328.6,3262.09,3263.25,3139.9,3071.84,3179.34,3227.37,3288.38,3312.05,3225.43,3228.29,3228.29,3175.63,3180.97,3183.98,3184.83,3092.11,3165.96,3227.99,3159.78,3112.83,3119.1,3034.88,3139.36,3136.34,3068.13,3083.21,3087.54,3153.9,3054.83,3025.37,3059.08,3087.78,3037.58,2941.07,2845.64,2945.32,2962.18,2984.76,2877.73,2798.23,2747.58,2874.95,2948.49,2788.64,2788.64,2728.55,2680.84,2654.54,2672.87,2698.62,2725.46,2816.56,3031.17,3007.58,3098.22,3035.42,2988.4,2996.83,2890.18,2910.14,2928.46,2907.97,2883.07,2951.36,3022.43,3035.5,3011.21,3083.6,3184.6,3312.67,3441.43,3352.11,3443.52,3428.28,3265.42,3170.68,3125.21,3226.9,3231.47,3294.57,3294.57,3353.19,3405.55,3419,3370.21,3216.23,3277.02,3276.71,3236.11,3023.82,3162.64,3067.75,2951.05,3086.85,3143.15,3179.65,3129.46,3065.43,3097.21,3097.21,3132.48,2951.2,2904.18,2901.01,2936.51,3184.99,3252.73,3289.08,3042.77,3042.77,3246.31,3115.85,3047.48,3144.08,3153.43,3052.9,3063.88,3050.58,3024.28,2945.25,2858.09,2930.48,2892.43,2472.34,2420.83,2391.37,2377.6,2307.07,2388.51,2406.76,2490.82,2531.58,2486.72,2471.1,2541.09,2558.88,2573.8,2532.82,2629.1,2646.96,2623.99,2605.2,2715.41,2669.08,2806.2,2698.62,2708.68,2674.42,2743.94,2697.08,2845.56,2753.84,2760.96,2910.68,2738.3,2738.3,2847.18,2844.48,2811.61,2826.15,2776.11,2757.63,2769.23,2832.03,2817.1,2902.4,2930.24,2939.68,2922.82,2877.73,2764.36,2728.71,2743.94,2738.53,2865.98,2928.93,2944.01,2921.81,2900.08,2959.63,2923.52,2901.86,2839.45,2802.95,2743.25,2743.25],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1957.16,1960.95,1961.89,1893.89,1783.79,1921.37,1835.05,1835.05,1792.63,1784.53,1745.89,1760.32,1824.32,1816.42,1835.16,1855.16,1869.89,1927.26,1947.26,2018.84,2027.26,1996.53,1973.47,1968.11,1968.95,2000.42,1986.84,1993.68,2021.79,2043.37,2092.42,2200.53,2200,2196.53,2115.47,2110.53,1958.21,1958.21]},"symbols":{"AMD":"AMD","EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","어플라이드 머티어리얼즈":"AMAT","테슬라":"TSLA","팔란티어 테크":"PLTR"},"missing":[]}
};
