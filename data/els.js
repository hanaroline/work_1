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
  "updatedAt": "2026-11-26T09:27:22.477Z",
  "checkedAt": "2026-11-26T09:27:22.477Z",
  "checkedCount": 37,
  "source": "live",
  "sourceNote": "미래에셋증권 홈페이지 ELS/DLS 캘린더 (청약 진행중)",
  "sourceNoteEn": "Mirae Asset Securities ELS/DLS calendar — currently on offer",
  "products": [
    {
      "code": "KR6MD00095B1",
      "name": "미래에셋증권(ELS)38287e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 29.3,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095A3",
      "name": "미래에셋증권(ELS)38286e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "팔란티어 테크",
        "AMD"
      ],
      "couponRate": 27,
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
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70 , KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009596",
      "name": "미래에셋증권(ELS)38285e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "테슬라"
      ],
      "couponRate": 22.3,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009588",
      "name": "미래에셋증권(ELS)38284e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "AMD"
      ],
      "couponRate": 21,
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
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009570",
      "name": "미래에셋증권(ELS)38283e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 20.6,
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
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009547",
      "name": "미래에셋증권(ELS)38280",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 20.4,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 3,
          "barrier": 85
        },
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 9,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 15,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 21,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 27,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 33,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-80-80-80-75-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009539",
      "name": "미래에셋증권(ELS)38279",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 18.4,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009521",
      "name": "미래에셋증권(ELS)38278",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "S&P500",
        "삼성전자"
      ],
      "couponRate": 14.4,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009562",
      "name": "미래에셋증권(ELS)38282e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 12.5,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009513",
      "name": "미래에셋증권(ELS)38277",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 12.1,
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
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009505",
      "name": "미래에셋증권(ELS)38276",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 11.6,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009554",
      "name": "미래에셋증권(ELS)38281e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 11.2,
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
      "knockIn": 50,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 50, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00094Z3",
      "name": "미래에셋증권(ELS)38275",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 11,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00094Y6",
      "name": "미래에셋증권(ELS)38274",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 10.25,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00094V2",
      "name": "미래에셋증권(ELS)38272",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 10,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00094X8",
      "name": "미래에셋증권(ELS)38273",
      "type": "ELS",
      "shape": "스텝다운 노낙인",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 10,
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
          "barrier": 70
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
      "knockIn": null,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75-75-70-65-60, KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00094T6",
      "name": "미래에셋증권(ELS)38271",
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
          "barrier": 65
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095D7",
      "name": "미래에셋증권(ELB)4123",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 7.02,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85(월지급배리어:70), 원금지급형, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095C9",
      "name": "미래에셋증권(ELB)4122",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 6.51,
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
      "offerStart": "2026-11-23",
      "offerEnd": "2026-11-27",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85(월지급배리어:80), 원금지급형, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095Y3",
      "name": "미래에셋증권(ELS)38306e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "AMD"
      ],
      "couponRate": 27,
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
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095X5",
      "name": "미래에셋증권(ELS)38305e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "테슬라"
      ],
      "couponRate": 23,
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
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095W7",
      "name": "미래에셋증권(ELS)38304e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "엔비디아",
        "AMD"
      ],
      "couponRate": 22.5,
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
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70 , KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095T3",
      "name": "미래에셋증권(ELS)38302e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 20.6,
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
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095Q9",
      "name": "미래에셋증권(ELS)38299",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 20.4,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 3,
          "barrier": 85
        },
        {
          "months": 6,
          "barrier": 85
        },
        {
          "months": 9,
          "barrier": 85
        },
        {
          "months": 12,
          "barrier": 85
        },
        {
          "months": 15,
          "barrier": 85
        },
        {
          "months": 18,
          "barrier": 85
        },
        {
          "months": 21,
          "barrier": 80
        },
        {
          "months": 24,
          "barrier": 80
        },
        {
          "months": 27,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 75
        },
        {
          "months": 33,
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
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-80-80-80-75-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095V9",
      "name": "미래에셋증권(ELS)38303e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 19.2,
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
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095P1",
      "name": "미래에셋증권(ELS)38298",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 18.5,
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
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095N6",
      "name": "미래에셋증권(ELS)38297",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "S&P500",
        "SK하이닉스"
      ],
      "couponRate": 15,
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
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095M8",
      "name": "미래에셋증권(ELS)38296",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 14,
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
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095S5",
      "name": "미래에셋증권(ELS)38301e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "삼성전자"
      ],
      "couponRate": 14,
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
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095L0",
      "name": "미래에셋증권(ELS)38295",
      "type": "ELS",
      "shape": "월지급식",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 12.81,
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
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65(월지급배리어:60), KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095K2",
      "name": "미래에셋증권(ELS)38294",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 12.1,
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
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095J4",
      "name": "미래에셋증권(ELS)38293",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 11.3,
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
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095R7",
      "name": "미래에셋증권(ELS)38300e",
      "type": "ELS",
      "shape": "스텝다운 노낙인",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "KOSPI200"
      ],
      "couponRate": 11,
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
          "barrier": 70
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
      "knockIn": null,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75-75-70-65-60, KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095H8",
      "name": "미래에셋증권(ELS)38292",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 10.1,
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
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095G0",
      "name": "미래에셋증권(ELS)38291",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
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
          "barrier": 65
        }
      ],
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095F2",
      "name": "미래에셋증권(ELS)38290",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 8,
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
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00095Z0",
      "name": "미래에셋증권(ELB)4124",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 7.11,
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
      "offerStart": "2026-11-25",
      "offerEnd": "2026-12-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-80-80(월지급배리어:75), 원금지급형, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    }
  ],
  "history": {"updatedAt":"2026-11-26T09:27:23.669Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20160919,20160920,20160921,20160922,20160923,20160926,20160927,20160928,20160929,20160930,20161003,20161004,20161005,20161006,20161007,20161010,20161011,20161012,20161013,20161014,20161017,20161018,20161019,20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827,20260828,20260831,20260901,20260902,20260903,20260904,20260907,20260908,20260909,20260910,20260911,20260914,20260915,20260916,20260917,20260918,20260921,20260922,20260923,20260924,20260925,20260928,20260929,20260930,20261001,20261002,20261005,20261006,20261007,20261008,20261009,20261012,20261013,20261014,20261015,20261016,20261019,20261020,20261021,20261022,20261023,20261026,20261027,20261028,20261029,20261030,20261102,20261103,20261104,20261105,20261106,20261109,20261110,20261111,20261112,20261113,20261116,20261117,20261118,20261119,20261120,20261123,20261124,20261125,20261126],"series":{"AMD":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,101.13,100.91,95.02,96.6,98.3,107.02,108.27,117.1,117.1,120.95,119.37,119.48,122.99,120.72,124.01,130.35,129.9,131.37,131.14,131.14,136.69,130.8,131.26,128.43,128.43,129.45,129.45,127.29,128.2,130.12,129.56,126.84,121.86,119.82,119.82,111.21,111.89,110.65,110.42,112.23,118.23,117.21,119.14,120.84,120.16,117.44,136.58,139.07,138.62,154.36,150.51,153.57,151.98,153.79,152.77,150.17,150.62,146.89,148.7,148.7,158.55,161.72,162.17,159.91,172.14,163.76,169.42,157.42,147.57,147.68,147.79,149.72,150.96,157.53,161.72,159.68,158.32,154.59,152.77,163.08,156.51,159.68,156.17,155.15,155.15,155.04,155.27,159.12,164.78,165.8,160.36,160.48,150.28,153.11,148.36,148.36,144.51,139.41,139.41,144.85,146.66,145.41,148.47,147.23,148.7,152.77,151.87,154.25,150.62,154.25,116.87,117.67,114.38,115.4,113.7,115.29,122.2,125.37,127.52,129.33,144.39,126.84,127.75,129.22,125.03,123.33,123.33,124.35,124.58,124.58,125.93,126.73,123.78,123.44,127.29,136.24,140.2,146.09,139.07,136.92,135.45,133.3,130.24,129.56,135.11,143.15,158.32,162.85,160.48,159.46,151.76,149.83,142.7,141.34,137.6,137.6,149.38,147.45,151.3,156.4,157.3,161.83,153.23,157.64,156.29,152.66,153.45,156.29,157.19,160.36,159.8,167.16,159.91,157.98,154.13,155.27,151.42,149.94,148.58,152.1,148.47,145.3,137.26,138.51,144.51,147.45,143.04,139.75,140.09,136.47,137.83,141.34,141.56,140.77,138.51,137.6,143.49,147.23,149.38,149.38,146.32,145.64,143.04,138.73,142.13,139.3,138.39,138.84,141.79,148.13,148.58,155.61,151.87,150.62,142.81,141,144.28,144.28,144.39,143.94,151.98,150.74,151.08,149.83,152.55,155.15,157.19,160.82,161.04,161.49,160.36,159.34,157.98,156.4,159.68,161.38,139.64,136.01,134.09,123.33,124.46,122.31,122.88,125.93,135.11,136.47,132.62,125.93,127.52,125.59,125.93,125.37,127.41,128.88,128.43,129.11,128.77,128.77,128.88,130.8,126.5,122.65,123.33,121.52,113.59,112.23,113.25,113.7,112.57,115.06,112.12,114.5,114.72,116.53,124.35,124.01,124.35,123.33,119.37,119.37,118.46,119.25,119.48,116.42,124.35,130.8,137.26,134.54,139.07,133.86,135.45,137.49,136.13,136.13,134.88,137.94,141.22,142.58,143.26,146.55,143.94,140.54,146.66,150.85,145.75,155.61,150.06,141,131.03,131.94,131.37,127.07,128.09,132.28,133.41,138.17,138.05,133.86,133.86,136.13,132.73,134.09,136.69,140.66,141.9,137.15,134.77,133.75,134.88,133.18,138.62,135.56,132.5,130.46,131.82,128.65,129.78,129.9,129.45,125.82,127.52,123.56,120.39,118.23,113.25,111.1,113.82,113.82,107.93,108.15,110.65,113.48,108.83,107.93,113.02,111.21,114.16,112.46,114.27,119.14,117.33,114.5,113.14,113.7,114.27,109.97,125.03,125.82,123.22,126.05,124.24,123.78,127.75,131.26,131.48,135.33,137.37,135.33,138.51,141,145.19,145.19,147.23,147.11,147,148.36,151.87,153.34,153.34,151.3,156.51,155.49,163.08,168.18,168.18,177.46,168.63,172.71,178.14,179.5,184.82,184.03,185.05,193.77,189.01,187.09,177.24,178.94,171.12,175.54,169.54,173.39,169.76,171.69,169.88,169.88,175.54,185.28,188.11,187.43,184.26,187.54,184.26,187.77,191.05,190.83,189.24,186.86,188.67,183.35,181.77,207.81,214.5,219.93,207.59,209.29,212.8,209.4,220.05,221.52,221.74,216.31,215.86,223.44,226.73,223.1,218.91,223.9,226.27,231.03,236.69,252.43,271.57,286.07,283.69,285.39,281.88,285.05,285.05,317.78,322.88,315.29,310.08,338.51,340.88,364.78,345.19,370.55,367.27,361.61,353.45,353.11,351.3,369.31,368.86,364.55,369.08,349.83,355.83,328.65,321.97,314.61,309.74,299.66,308.49,283.13,286.52,298.3,297.4,319.14,309.17,301.47,267.95,283.47,284.14,258.1,218.23,199.66,190.83,194.79,206.23,228.99,229.11,225.37,234.2,247.34,240.09,238.17,215.52,222.08,235.67,243.37,233.98,216.42,217.55,212.12,212.12,219.48,227.41,238.39,241.68,242.7,241.22,268.52,239.18,239.18,241.22,220.39,226.39,226.27,231.94,224.92,225.37,213.25,220.84,205.66,203.17,191.73,188.56,188.56,202.72,198.07,201.81,209.06,213.25,193.09,215.18,232.96,234.99,228.65,223.56,229.56,229.11,230.8,223.44,229.33,235.22,235.22,223.78,224.24,236.13,248.36,228.54,218.01,261.49,276.44,277.58,273.27,263.99,263.42,256.74,261.04,260.02,258.44,258.78,261.95,268.18,268.18,271.23,271.23,270.89,275.88,279.84,274.18,265.91,266.48,268.18,264.67,266.14,253.79,250.06,249.26,260.02,266.02,264.78,258.44,263.76,263.31,294.45,291.05,315.86,298.64,294.11,290.94,281.88,283.81,289.01,298.53,302.94,328.65,329.45,328.2,323.1,308.49,315.18,314.72,315.4,309.51,316.31,311.33,313.48,313.48,319.14,316.76,322.31,313.25,315.74,313.59,312.91,303.62,320.39,319.59,310.53,301.93,306.8,308.15,316.65,297.17,309.4,312.34,317.21,311.44,302.15,309.74,310.42,298.53,299.43,299.43,328.99,318.12,317.44,310.42,312.34,334.88,334.09,360.36,367.04,376.33,367.04,364.44,355.49,343.83,330.69,344.85,345.41,339.86,329.56,331.37,326.84,338.84,348.13,343.94,353.34,353.79,353.23,353.23,356.74,362.85,375.42,382.67,374.41,376.1,389.47,383.35,380.52,373.73,368.18,372.03,379.28,386.3,381.31,385.28,379.16,383.58,344.85,338.17,333.41,316.99,326.84,330.58,384.14,387.2,367.27,363.65,342.47,336.01,353.11,356.51,347.9,359,361.27,334.54,342.92,342.02,348.58,356.17,356.17,356.17,349.94,350.51,356.74,346.09,345.41,342.36,337.03,342.13,347.57,349.15,350.96,344.51,343.04,340.32,347,334.31,334.54,333.75,325.25,328.31,325.71,320.61,324.8,328.54,327.63,319.71,322.31,321.4,336.92,345.75,347.9,348.92,352.66,350.74,362.74,356.85,355.15,359.23,370.44,381.54,374.07,375.2,384.26,395.13,410.99,409.4,406.91,410.87,410.99,411.21,415.74,424.92,434.31,436.69,451.64,467.61,464.1,447.57,443.37,450.62,441.56,446.32,446.32,443.37,438.62,440.54,449.49,448.7,448.81,440.88,446.66,447,482.33,466.02,479.61,484.37,479.05,485.05,500,514.84,527.07,527.07,528.09,522.99,515.52,519.37,556.06,550.4,548.02,546.43,541.68,554.59,545.53,552.1,545.98,549.83,563.65,576.78,576.78,578.14,582.45,585.62,570.22,557.87,572.25,538.05,552.43,532.28,543.83,560.02,564.44,558.55,563.19,591.85,609.29,610.31,617.55,626.39,626.39,644.28,667.04,648.58,603.4,556.29,538.73,537.83,498.41,515.06,537.49,529.45,567.5,544.85,550.28,490.03,513.93,517.55,441.79,497.17,438.39,474.29,443.04,450.96,448.58,471.57,523.44,505.44,537.94,527.52,542.02,515.06,494.45,503.85,482.33,538.17,538.62,552.55,547.9,547.9,576.9,622.08,622.76,644.96,641,645.19,599.32,633.3,633.07,636.24,639.75,628.65,607.7,593.32,564.89,595.24,591.05,590.71,588.34,602.38,631.26,608.83,590.94,617.33,613.82,618.23,628.2,638.62,618.91,624.8,624.8,602.38,597.28,585.96,609.29,607.36,606.34,597.17,596.04,601.36,599.89,638.62,650.51,598.3,605.89,619.25,616.76,617.78,612,614.16,620.16,611.44,593.32,588.11,567.38,569.42,595.81,595.47,592.75,592.75,604.76,599.43,605.1,648.47,632.84,606.91,619.71,626.73,621.97,623.33,650.74,645.53,699.77,674.63,785.96,781.09,765.69,861.72,885.62,876.9,879.61,963.08,966.14,981.99,960.93,931.37,870.67,935.56,926.84,920.72,933.41,924.8,918.35,937.37,949.15,940.88,977.92,974.18,949.04,968.86,1028.54,1043.94,1021.74,934.77,928.77,928.77,891.17,927.63,894.45,864.55,882.22,893.88,868.18,866.93,848.58,882.67,879.95,846.32,858.66,884.03,900.11,926.05,928.54,961.04,926.39,975.65,956.74,981.77,979.73,941.11,954.59,965.8,953.68,941.45,941.9,928.65,923.67,896.94,899.43,928.2,931.26,893.32,865.23,883.58,852.66,845.98,867.27,921.29,939.98,972.59,941.34,883.24,920.5,926.84,922.2,948.24,944.05,934.77,968.74,958.55,966.14,963.42,981.99,981.99,987.43,1049.38,1049.04,1061.61,1045.41,1065.01,1065.35,1052.32,1017.33,1038.05,1037.94,1073.39,1099.89,1096.83,1096.72,1086.3,1055.83,1055.04,1036.81,1039.75,1039.75,1037.37,1026.27,1045.19,1038.62,1045.3,1050.62,1022.99,1077.69,1071.12,1101.36,1079.95,1039.41,1028.2,998.98,998.98,1013.02,1005.1,1036.58,1050.85,1066.02,1072.59,1006.12,991.17,969.88,992.75,1006.34,995.36,994.79,995.47,1035.9,1029.56,1045.87,1049.38,1061.95,1061.95,1035.79,1018.57,1003.85,1014.5,966.82,959.68,984.6,933.41,957.08,978.37,952.77,915.74,880.52,889.24,837.6,889.35,877.92,919.93,917.89,934.31,937.15,935.79,884.71,895.36,909.4,887.66,866.14,863.19,876.67,873.61,860.7,889.01,918.35,918.35,922.2,922.31,930.92,943.94,937.26,889.92,908.15,889.58,940.09,930.35,918.57,897.73,924.24,895.36,937.26,967.27,965.01,951.53,950.28,924.35,889.58,890.26,881.43,882.11,892.53,860.59,870.1,845.3,827.75,844.73,845.41,843.04,863.31,884.03,873.95,877.01,881.77,887.2,888.11,906.91,906.91,915.18,928.31,909.17,923.9,921.29,916.08,905.55,923.67,920.84,923.56,911.33,907.25,957.64,958.66,935.33,946.55,949.26,975.08,969.65,986.18,1013.82,1063.76,1056.74,1072.48,1072.48,1069.88,1025.37,1016.31,1029.45,1028.43,1022.2,1008.49,984.48,972.71,980.52,986.52,1012.57,1032.96,1043.6,1039.86,1030.92,1109.06,1165.91,1202.6,1230.24,1274.75,1345.07,1272.37,1247,1218.35,1205.89,1219.48,1206.12,1251.98,1217.21,1218.12,1171.46,1174.41,1185.16,1231.82,1219.14,1226.5,1214.84,1261.61,1260.7,1253.91,1245.64,1236.69,1244.85,1244.85,1236.13,1202.38,1202.15,1191.39,1186.86,1197.4,1195.92,1202.94,1176.44,1150.06,1164.44,1182.11,1202.15,1198.19,1224.92,1149.72,1136.47,1165.35,1160.25,1136.35,1153,1173.73,1205.55,1189.81,1185.5,1189.58,1236.24,1268.29,1269.76,1318.57,1317.44,1318.12,1351.42,1356.96,1385.73,1392.19,1384.82,1372.14,1361.61,1418.23,1445.41,1478.26,1557.19,1544.05,1700.57,1686.52,1584.03,1653.57,1674.86,1659,1726.5,1713.93,1755.61,1760.02,1727.29,1697.85,1787.09,1787.09,1753.23,1833.64,1793.54,1688.67,1706.46,1630.92,1574.86,1640.43,1644.85,1563.99,1569.08,1515.29,1535.67,1659.12,1570.1,1560.02,1537.94,1633.64,1629.45,1655.04,1655.04,1748.13,1734.43,1679.05,1643.83,1629.67,1701.47,1635.56,1541.9,1542.81,1494.9,1494.9,1555.04,1556.85,1503.28,1550.17,1550.17,1494.11,1452.66,1380.41,1345.53,1319.71,1258.55,1253.79,1161.95,1191.85,1293.88,1322.54,1390.26,1359.91,1399.77,1400.57,1452.21,1504.53,1424.35,1281.77,1294.11,1375.65,1332.84,1272.59,1289.13,1289.13,1309.74,1243.04,1320.61,1371.01,1396.83,1289.13,1339.52,1268.18,1227.75,1165.91,1195.13,1257.64,1205.66,1181.09,1157.98,1238.17,1306.57,1264.89,1284.94,1312.8,1299.89,1290.15,1365.01,1355.27,1361.72,1395.58,1350.17,1238.28,1225.25,1251.76,1209.74,1174.07,1174.63,1143.83,1102.72,1077.01,1106.91,1053.91,1053.91,1063.31,1097.74,1064.78,1017.55,998.19,1027.07,964.44,961.61,1015.18,968.52,1017.44,1032.05,1125.93,1063.08,1079.73,978.03,1004.87,995.7,985.96,1077.24,1067.27,1160.48,1090.37,1094.79,1058.89,1076.67,1032.39,1049.26,1118.35,1158.1,1158.1,1153.57,1146.32,1229.78,1203.85,1196.49,1192.3,1154.02,1118.91,1073.84,985.16,985.16,1011.33,929.22,923.78,923.78,948.92,948.47,933.52,986.18,975.76,914.84,883.24,866.02,834.31,834.31,851.64,853.34,898.07,898.64,871.46,864.78,877.92,890.15,918.57,922.2,972.59,1012.8,1031.6,997.73,991.39,965.46,1017.21,1038.17,1069.88,1096.04,1124.46,1110.87,1176.78,1158.66,1133.3,1081.99,1121.74,1111.21,1141.9,1143.94,1134.77,1112.91,1137.49,1086.64,1051.42,1047.45,1050.17,1100.57,1032.62,1002.15,984.6,961.16,932.39,908.72,908.72,891.51,901.59,937.49,967.72,958.55,872.37,877.12,868.18,866.48,869.42,852.21,843.49,787.09,769.65,750.85,760.7,774.18,726.39,717.55,748.7,768.97,769.42,768.4,661.83,654.7,652.66,655.15,667.5,633.52,656.4,655.95,648.13,654.25,666.14,664.78,696.15,676.44,663.65,702.26,680.18,675.65,663.99,680.75,704.3,714.38,723.1,678.6,775.42,819.59,832.73,864.89,823.33,836.92,833.18,820.61,852.21,865.23,865.23,850.96,828.88,831.14,879.16,877.46,849.15,833.75,795.81,794.34,798.07,776.78,800.34,811.44,780.63,753.45,740.77,731.48,736.69,766.48,723.22,730.69,730.69,716.53,708.61,734.09,733.52,733.52,725.03,732.28,705.89,724.35,761.49,770.67,782.11,801.81,804.08,804.08,810.76,798.75,766.82,793.54,866.7,845.98,848.36,851.19,853.91,820.5,851.08,958.55,1000.11,974.97,947.68,972.93,959.12,942.36,922.76,941.45,973.39,964.67,906.91,889.01,889.01,869.42,867.61,903.17,884.37,892.07,889.92,886.64,910.99,923.22,919.14,929.9,966.82,951.64,936.24,928.77,990.37,1015.63,1094,1108.04,1096.38,1086.41,1105.1,1135.67,1109.29,1094.11,1070.89,1088.22,1108.49,1109.97,1093.54,1085.73,1048.24,1047.23,1047.23,1081.31,1064.89,1045.64,1042.92,1039.07,1017.78,1016.76,1018.57,1020.5,1001.47,991.73,949.04,973.27,990.26,1012.12,1015.74,1018.23,924.35,980.86,1017.44,1076.33,1076.56,1098.75,1099.66,1078.82,1103.06,1149.26,1174.97,1222.31,1198.41,1223.1,1224.46,1226.16,1362.97,1438.62,1438.62,1418.69,1338.73,1353,1334.77,1335.56,1406.91,1334.43,1370.89,1414.72,1463.08,1410.31,1442.02,1407.02,1359.91,1359.91,1346.89,1269.65,1253.68,1245.87,1217.55,1250.17,1247.68,1259.8,1290.03,1311.66,1311.66,1290.49,1285.16,1281.65,1286.3,1260.7,1297.62,1312.8,1313.02,1339.98,1335.56,1318.57,1248.58,1256.51,1252.66,1279.73,1246.77,1258.21,1279.28,1295.58,1331.82,1238.39,1281.43,1311.66,1322.88,1282.33,1251.08,1248.36,1218.23,1268.18,1261.04,1213.93,1182.79,1194.22,1225.59,1196.6,1239.3,1152.89,1157.98,1162.06,1199.55,1207.13,1197.28,1239.52,1239.52,1254.59,1237.6,1207.13,1201.47,1192.75,1192.64,1219.82,1207.59,1149.38,1159.34,1150.74,1136.35,1088.45,1089.47,1102.83,1086.75,1110.65,1163.76,1164.44,1169.54,1133.41,1178.6,1165.46,1214.5,1211.44,1234.54,1226.61,1232.05,1190.15,1205.66,1190.71,1157.08,1159.68,1153,1132.62,1151.42,1087.88,1060.82,1092.07,1089.24,1115.52,1223.56,1221.18,1271.23,1265.57,1284.82,1286.41,1285.28,1343.04,1322.65,1357.64,1336.35,1357.08,1366.02,1376.33,1349.49,1387.43,1387.43,1385.16,1389.01,1381.77,1402.6,1372.14,1374.75,1342.81,1340.66,1322.99,1453.79,1460.02,1522.2,1558.44,1565.01,1562.85,1575.88,1573.05,1587.2,1534.2,1584.48,1580.97,1580.97,1624.12,1654.25,1684.71,1669.42,1569.42,1532.5,1540.32,1569.42,1655.49,1690.37,1682.22,1676.33,1659.8,1659.8,1797.74,1813.93,1842.24,1973.16,1904.64,1907.36,2019.14,2042.24,2007.36,2013.93,1948.58,1899.09,1930.69,2012,1973.16,1901.25,1935.9,1917.89,1953.34,1946.89,1942.7,2023.78,2001.81,1969.08,1969.08,1876.44,1860.59,2059.57,1999.09,1993.32,2015.86,1999.32,2180.41,2294.9,2325.71,2323.1,2385.39,2393.88,2348.7,2246.77,2296.26,2206,2118.46,2163.76,2159.12,2054.59,2035.45,2023.56,2034.54,2022.99,2014.38,2033.86,2044.05,2044.05,2076.33,2023.78,2047.23,1878.03,1930.01,1924.12,1934.09,1892.87,1930.92,1849.15,1815.63,1851.19,1744.28,1756.29,1660.7,1683.35,1724.46,1718.46,1741.34,1782.56,1814.27,1793.66,1633.86,1655.27,1705.55,1764.21,1748.92,1739.75,1725.82,1720.5,1705.1,1734.54,1808.27,1841.68,1862.63,1883.69,1864.78,1874.52,1816.87,1884.03,1884.03,1943.49,1870.22,1888.45,1890.15,1852.21,1811.89,1881.88,1888.79,1901.13,1815.86,1800.23,1814.72,1810.87,1807.81,1793.88,1751.19,1751.19,1832.16,1825.93,1814.84,1814.84,1784.14,1806,1837.03,1785.84,1860.82,1856.17,1856.17,1946.77,2023.67,2005.66,2083.35,2060.48,2056.74,2036.58,2010.76,1805.55,1764.1,1716.65,1765.23,1744.05,1637.94,1566.48,1585.39,1582.67,1567.84,1636.24,1501.02,1500.57,1526.84,1474.29,1457.19,1543.83,1520.61,1548.92,1598.3,1594,1668.86,1682.45,1758.55,1771.23,1787.2,1718.01,1755.15,1698.64,1704.42,1657.53,1647.68,1682.45,1682.45,1550.85,1595.36,1579.16,1521.52,1564.55,1617.67,1697.17,1707.47,1724.92,1722.31,1708.04,1679.39,1775.09,1766.14,1775.2,1792.98,1834.88,1896.83,1861.27,1858.21,1809.17,1809.51,1844.28,1935.45,1936.24,1956.96,1936.81,1859.34,1901.36,1871.69,1773.95,1768.18,1769.54,1766.36,1788.22,1745.07,1731.71,1737.71,1769.31,1811.1,1882.79,1682.9,1631.6,1606.57,1593.54,1604.3,1643.26,1696.72,1675.54,1668.74,1626.61,1577.58,1572.37,1527.75,1573.39,1578.6,1558.32,1557.08,1566.82,1598.3,1559.68,1542.92,1542.92,1553.57,1608.83,1607.93,1630.69,1600.91,1569.54,1482.11,1446.66,1473.95,1479.05,1437.26,1434.77,1415.86,1374.97,1346.32,1350.06,1411.1,1430.24,1430.24,1416.31,1417.78,1386.64,1367.95,1366.14,1419.82,1467.16,1442.02,1379.84,1379.84,1314.16,1328.65,1314.72,1358.55,1341.34,1375.54,1375.54,1384.82,1401.47,1393.43,1391.17,1302.49,1292.98,1328.99,1346.09,1313.14,1294.11,1353.34,1268.52,1247.57,1218.12,1251.19,1258.21,1265.23,1266.25,1280.86,1280.86,1294.22,1298.87,1292.98,1255.27,1224.35,1177.35,1186.18,1126.95,1130.92,1112.46,1141,1151.42,1119.48,1136.01,1094.34,1095.81,1141.45,1111.1,1143.49,1184.48,1172.25,1203.06,1213.36,1205.44,1289.35,1300.23,1247.9,1207.81,1168.97,1163.53,1163.99,1166.02,1062.29,971.23,947.23,885.73,1096.72,1004.53,1057.76,1070.22,1079.16,999.89,990.94,990.94,968.97,976.9,1023.67,1069.88,1094.56,1091.62,1087.88,1102.49,1094.56,1118.91,1139.18,1116.87,1136.58,1151.76,1164.67,1224.46,1273.61,1333.18,1302.26,1326.95,1299.43,1285.5,1269.08,1253.79,1249.26,1249.26,1297.4,1278.14,1280.07,1254.02,1298.19,1328.54,1342.92,1310.19,1315.86,1378.6,1395.7,1371.91,1342.02,1315.52,1431.37,1439.41,1435.9,1435.9,1452.32,1467.5,1567.72,1624.01,1627.18,1628.65,1607.02,1541.45,1568.74,1561.83,1561.83,1526.61,1560.82,1567.5,1632.62,1658.21,1656.17,1762.29,1812.91,1816.65,1777.92,1778.03,1752.21,1796.72,1836.01,1885.28,1966.7,2009.51,2032.96,1996.72,1944.51,2002.04,1974.07,1847.34,1952.43,1956.51,1951.08,1981.31,2088.56,2049.26,2010.31,1994.79,1886.18,1870.89,1854.02,1899.89,1850.06,1886.98,1892.75,1909.17,1841.79,1841.79,1838.28,1836.13,1832.28,1711.66,1714.72,1764.67,1806.79,1762.97,1795.81,1825.14,1817.21,1802.49,1788.45,1782.45,1809.63,1822.2,1821.97,1826.39,1805.89,1827.41,1832.28,1857.42,1922.2,1864.89,2307.02,2395.36,2667.72,2637.49,2433.75,2450.96,2469.88,2702.15,2656.4,2639.64,2724.35,2695.7,2607.36,2661.27,2864.33,2940.77,2921.97,2993.54,2886.07,2900.57,2940.54,2831.82,2902.94,2691.96,2644.85,2763.08,2689.92,2931.94,2808.15,2795.13,2723.9,2608.04,2531.71,2333.18,2307.81,2435.45,2334.43,2426.27,2426.27,2463.53,2488.79,2437.6,2464.33,2445.98,2468.52,2504.08,2509.85,2507.59,2507.7,2387.09,2350.85,2368.86,2243.6,2277.01,2417.1,2434.31,2433.75,2435.33,2435.33,2434.77,2441.79,2438.73,2425.37,2530.8,2503.74,2427.52,2378.48,2318.01,2300.91,2352.1,2502.49,2532.28,2581.2,2625.48,2625.48,2626.5,2828.99,2873.5,2940.88,2846.09,2854.25,2862.29,2855.95,2680.97,2789.01,2741.9,2267.16,2180.07,2360.59,2446.21,2418.69,2418.8,2332.28,2347.9,2347.9,2299.89,2266.36,2303.17,2266.7,2226.5,2421.74,2388,2306.68,2267.38,2249.38,2162.51,2288.45,2258.78,2179.28,2295.36,2301.59,2319.71,2239.41,2190.15,2226.27,2223.22,2258.89,2324.69,2280.07,2295.36,2325.82,2494.56,2307.7,2287.54,2220.16,2303.85,2380.63,2463.19,2463.19,2493.54,2508.83,2625.37,2679.95,2775.08,2795.36,2888.68,2923.22,3151.3,3152.77,3113.82,3221.86,3436.69,3457.87,3938.96,3789.69,3660.36,3817.78,4014.61,4083.13,3867.95,4023.33,4772.25,4625.82,5155.04,5195.81,5076.9,5045.3,5092.87,4802.94,4767.72,4689.13,5068.86,5091.62,5294.56,5294.56,5706.57,5612,5867.38,5844.85,5777.24,5906.46,6144.05,5925.26,5281.77,5553,5385.16,5123.44,5531.71,5793.54,6197.74,5745.07,5803.85,6085.73,6085.73,6247.23,5887.32,5886.07,6031.37,5906.91,6109.74,6578.82,6125.48,5864.33,5864.33,6251.98,5844.96,5859.68,6191.62,6318.12,6051.98,6207.59,5992.53,5673.16,5614.5,5702.94,6165.69,6255.15,6112,5911.1,5605.32,5148.58,4864.78,5497.06,5392.41,5488.56,5872.93,5459.23,5541.11,5474.07,5317.78,5371.69,5469.2,5470.1,5825.48,5730.46,5485.73,5282.22,5316.65,5359.57,5172.71,5426.73,5446.55,5398.3,5272.71,5330.92,5205.1,5176.22,5166.03,5408.49,5408.49,5727.52,5901.47,5703.28,5845.19,5587.88,5710.08,5804.08,6173.16,6339.98,6970.78,7064.21,6960.48,7126.39,7141.9,6884.14,6880.75,6928.2,6973.16,7179.05,7154.59,7354.7,7314.38,7029.22,6886.75,6729.78,6857.64,6464.55,6367.27,5988.11,6093.43,6055.95,6259.57,5752.32,5852.66,6016.76,6344.96,6550.85,6414.72,5716.87,5286.98,5480.18,5535.45,4579.84,5085.39,5759.68,5834.77,6261.61,6628.54,6048.24,5710.99,5701.13,6003.85,5540.09,4806.23,5135.45,4680.29,4598.3,4598.3],"EuroStoxx50":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.72,101.15,100.47,99.94,101.19,102.78,104.16,105.6,105.99,106.04,107.29,106.46,107.72,108.04,107.99,108.7,108.42,108.38,108.52,108.52,108.68,108.68,108.45,109.07,109.07,109.89,109.97,109.93,110.09,109.68,109.59,109.65,108.95,110.19,109.21,108.89,109.19,109.07,109.37,108.49,108.78,110.25,110.02,109.5,108.15,107.09,108.03,107.85,108.5,107.34,107.26,107.33,108.65,108.42,109.56,109.68,110.17,109.75,109.68,109.8,110.69,110.69,110.51,109.52,109.7,110.04,112.38,112.2,112.81,112.29,112.21,112.36,113.03,113.24,113.22,112.68,113.01,114.03,114.31,113.94,113.68,113.39,114.43,114.17,113.93,114.86,115.2,115.41,116.05,115.12,115.41,115.11,115.67,115.88,115.37,115.02,114.97,114.3,114.3,114.3,113.03,113.4,114.03,114.04,118.58,118.77,118.63,118.11,117.99,117.99,118.61,118.88,120.26,121.28,120.73,120.96,120.85,120.11,120.58,120.72,120.72,118.83,118.08,118.9,118.55,119.17,118.89,118.89,118.64,118.63,118.05,117.83,118.24,119.06,119.06,117.81,117.64,118.13,118.87,117.47,117.94,117.58,116.86,117.47,118.65,118.03,117.82,117.87,117.46,118.06,117.29,117.2,115.07,114.09,115.75,115.34,115.3,114.76,114.82,115.29,114.84,116.52,116.94,116.88,116.56,115.31,116.03,116,114.42,114.46,115.14,115.72,115.79,114.95,114.34,114.34,114.67,114.9,116.26,116.21,116.54,114.97,113.81,112.91,114.38,114.75,115.51,114.76,114.23,113.48,114.54,113.98,114.18,113.98,113.4,112.31,112.83,113.41,114.16,113.71,113.39,113.82,114.28,114.28,115.86,116.43,116.78,116.89,116.53,116.9,117.05,116.86,117.33,117.39,117.27,117.22,117.85,118.13,119.16,119.42,119.52,119.16,119.78,119.44,119.68,119.29,119.58,119.52,119.48,119.54,119.59,119.98,119.4,119.5,119.63,119.69,119.05,120.56,121.06,121.39,121.78,122.56,122.28,122.31,122.06,121.28,121.16,119.75,119.12,118.49,117.89,117.53,118.16,117.59,118.05,118.65,118.09,118.41,118.71,118.14,118.78,119,118.33,116.93,118.54,118.36,118.06,118.44,119.05,118.74,119.34,118.73,117.88,118.02,119.64,118.74,117.76,118.36,117.79,117.79,117.79,117.68,116.82,116.15,116.15,116.34,118.3,119.58,119.88,120.09,119.66,119.17,119.75,119.72,120.06,119.76,120.02,120.96,121.5,121.73,120.76,120.33,120.9,120.76,119.56,119.64,118.58,116.79,115.31,112.53,114.51,111.95,110.25,111.65,110.74,111.7,112.36,113.59,112.96,113.87,113.7,113.76,114.08,114.8,114.63,113.99,112.67,110.21,111.22,111.31,111.95,113.14,113.38,113.68,112.61,112.4,113.17,113.94,112.53,113.1,112.74,110.98,109.32,108.68,109.95,110.42,111.43,111.43,111.43,110.94,110.72,113.69,112.97,113.19,113.99,113.36,114.16,114.29,114.06,115.28,115.71,115.57,115.82,116.45,116.38,115.55,116.22,116.64,117.23,117.23,117.8,116.98,117.69,118.14,117.94,118.33,118.33,118.19,118.2,118.15,118.1,119.07,118.46,118.46,118.91,117.4,116.74,116.53,115.44,113.63,114.07,112.92,114.48,115.01,114.58,114.72,114.68,114.27,115.36,115.21,115.34,116.92,116.18,114.91,113.87,114.01,112.82,114.08,111.68,111.67,112.61,111.56,112.56,111.78,112.91,113.1,114.06,114.31,114.71,115.13,113.44,114.21,114.51,114.33,114.61,115.52,115.08,114.69,114.49,115.46,114.97,116.32,116.92,116.43,116.86,116.86,115,115.43,115.46,116.16,115.8,115.82,113.57,113.02,113.02,111.35,111.96,111.81,112.49,113.09,113.37,113.34,113.61,114.56,114.28,114.56,113.73,112.47,112.54,111.36,109.91,109.25,109.17,109.7,109.77,110.27,110.5,110.87,110.92,111.33,111.66,112.81,113.72,113.05,113.36,113.8,114.35,112.68,113.17,112.34,112.88,111.88,110.9,109.71,110.11,108.29,106.38,105.89,106.42,107.97,107.5,106.46,106.43,105.74,104.11,103.76,104.89,103.91,104.58,104.32,105.99,106.21,106.55,106.65,106.32,107.6,107.32,107.05,105.88,106.9,106.25,105.75,105.43,104.76,103.29,104.54,103.64,103.99,105.17,104.96,105.02,105.22,105.18,106.57,105.72,104.42,100.97,101.38,100.01,101.28,103.02,103.16,102.51,101.55,100.77,101.15,99.45,99.46,99.46,99.46,99.46,97.37,99,99,99,97.94,100.83,100.56,101.26,101.77,101.95,101.76,101.27,101.7,102,101.74,103.92,103.59,103.18,103.16,103.63,104.85,103.99,104.53,104.8,104.73,105.12,104.92,106.57,106.5,104.44,103.94,104.93,105.77,106.15,105.5,107.44,107.56,107.38,108.04,108.18,108.41,108.72,109.03,108.82,109.33,109.79,109.95,110.29,110.21,109.68,108.84,109.53,109.52,110.16,110.78,112.24,112.3,113,111.79,111.62,109.58,109.4,110.03,110.12,110.06,111.1,112.22,112.56,113.88,114.09,114.28,113.96,113.27,113.52,113.87,114.29,114.37,114.8,115.28,115.99,115.99,115.99,116.14,116.1,115.75,116.03,116.08,116.5,116.5,115.65,116.1,114.79,112.74,113.27,111.07,111.41,110.08,111.52,112.23,113.98,113.55,111.7,112.26,112.26,110.29,111.07,111.51,111.01,109.31,109.31,108.74,109.39,110.5,110.71,110.66,111.99,111.99,112.74,112.26,112.39,112.01,112.15,114.46,114.52,114.96,114.92,114.54,114.17,114.13,114.11,115.14,115.94,116.28,117.36,117.48,116.94,116.8,116.34,116.07,115.91,115.94,116.09,116.73,116.07,115.45,115.36,115.68,117.11,117.11,116.35,116.83,116.8,114.79,114.92,114.92,111.91,109.75,109.11,109.72,111.89,110.51,110.27,111.28,109.01,108.82,110.35,111.68,111.05,112.53,111.83,110.52,111.01,111.72,111.55,113.08,113.59,113.78,113.39,114.39,115.51,115.86,115.85,115.98,116.57,117.31,117.68,116.63,116.72,116.95,117.76,118.38,117.24,117.08,116.45,117.08,117.54,118.32,116.62,113.14,113.28,114.25,115.06,113.79,114.76,115.82,118.33,117.88,119.29,119.31,118.95,118.65,119.33,119.49,119.56,120.04,120.15,120.18,120.06,120,119.48,120.12,121.49,121.87,122.27,122.87,122.63,122.54,123.05,122.63,122.28,123.03,122.81,122.53,122.11,121.97,122.23,122.9,122.83,123.07,122.8,122.77,120.22,119.7,121.32,120.93,122.39,121.72,121.71,122.23,122.86,123.68,125.06,124.15,123.94,123.94,125.18,125.19,125.19,125.19,125.19,125.37,124.25,124.25,124.25,125.08,124.39,124.61,125.05,125.82,125.61,125.29,125.13,124.93,125.1,126.24,125.93,125.6,124.96,123.87,125.27,121.91,123.28,123.85,122.34,120.69,121.36,123.72,125.23,126.14,125.91,125.74,126.82,127.77,127.51,127.32,127.73,127.17,128.12,126.72,125.97,120.92,118.42,118.59,114.56,110.36,110.67,111.77,113.38,111.49,107.14,98.09,96.46,96.31,84.37,85.72,81.22,83.88,79.08,81.35,84.48,82.39,90,92.82,94.4,90.45,91.67,92.38,88.85,89.12,88.27,92.68,94.73,94.51,95.89,95.89,95.89,96.72,93.09,93.22,95.74,96.44,92.53,93.97,94.55,93.11,95.53,97.19,99.31,97.05,97.05,93.36,95.33,94.26,95.49,96.4,95.59,95.6,93.16,91.5,91.84,96.52,96.21,97.53,97.53,96.31,98.49,99.42,101.14,102.57,101.11,101.11,104.71,108.38,108.12,112.18,111.58,110.07,109.18,104.24,104.54,103.96,107.49,108.3,107.73,108.36,107.45,109.35,105.94,106.7,106.21,107.13,107.2,107.02,110.05,109.2,111.05,110.1,108.93,108.1,109.26,111.04,110.1,111.98,111.55,111.56,112.32,112.88,111.73,111.77,109.75,109.48,109.51,109.39,106.34,105.22,107.67,107.87,108.34,107.41,107.82,108.05,110.45,111.48,110.81,109.55,109.58,109.04,109.97,108.52,108.05,110.44,110.37,111.27,110.42,109.9,108.48,108.64,110.64,109.53,108.08,109.85,108.31,110.21,109.81,109.91,109.94,110.46,110.67,109.94,108.85,104.78,104.88,105.41,104.73,103.99,106.84,106.55,105.86,105.88,105.77,106.74,107.18,107.18,107.92,108.5,109.33,108.7,108.5,105.83,107.58,107.48,107,105.43,105.12,106.03,102.93,101.78,98.23,98.12,98.06,100.09,102.72,104.78,106.59,106.21,112.96,114.11,114.93,113.64,113.77,114.9,114.97,115.43,114.42,114.94,114.79,116.28,116.41,116.38,116.94,115.77,116.85,116.72,116.58,117.32,117.01,116.87,116.98,116.76,115.55,116.15,116.73,117.44,118.03,117.53,114.32,115.93,117.32,117.32,117.32,118.52,118.71,118.39,118.39,118.15,117.6,119.7,120.07,120.83,120.02,119.73,119.88,120.7,119.32,119.42,119.18,120.13,119.94,119.41,117.78,119.09,117.22,117.91,115.4,117.04,119.02,119.65,120.73,121.18,121.5,121.36,120.94,121.71,122.5,123.78,123.52,122.64,122.02,123.09,122.64,122.29,122.85,122.16,120.54,122.87,122.9,123.07,122.81,121.64,124.74,125.5,126.62,127.47,127.07,126.95,127.65,127.61,128.2,127.19,127.08,126.86,127.04,127.04,128.17,128.71,130.14,129.91,130.8,130.8,130.8,131.61,131.16,131.86,131.89,131.33,131.5,131.8,132.37,133.68,133.25,130.62,131.81,133.08,133.03,133.28,132.99,133.09,132.49,131.75,132.6,130.1,132.68,132.57,133.73,133.36,130.8,130.85,130.85,133.17,132.82,132.77,130.49,132.59,133.45,133.45,133.79,133.64,133.89,134.93,133.9,134.97,135.52,135.22,135.55,135.83,135.77,135.8,135.78,136.79,136.99,137.35,137.62,137.83,135.35,136.31,136.67,135.11,136.65,136.59,135.57,136.15,134.72,135.21,135.39,135.49,134.34,135.19,132.31,134.85,135.69,135.73,135.89,134.46,133.78,130.22,131.14,133.48,134.55,136.21,135.99,134.74,136.01,136.46,135.55,136.46,136.5,137.39,137.93,138.38,138.46,138.82,139.43,140.09,140.2,139.3,139.1,138.87,136.72,137.48,138.44,138.49,138.59,138.22,138.92,139.18,139.1,140.12,140.28,139.29,140.75,140.05,138.46,138.46,138.24,138.87,138.94,137.43,138.22,136.93,134.04,135.82,137.57,139.05,137.85,138.08,134.54,135.25,134.18,133.76,132.47,134.76,133.01,135.85,135.02,134.99,134.42,135.35,137.53,138.65,137.61,138.12,138.3,137.75,138.85,138.83,140.01,139.91,140.34,140.9,141.89,142.41,142.85,143.64,144.62,144.28,144.01,144.15,144.46,144.87,145.39,145.9,145.88,145.31,144.41,143.82,142,141.75,142.31,135.56,136.22,134.68,138.53,136.17,135.25,137.14,141.75,140.32,139.5,139.19,138.66,137.38,137.88,139.28,137.94,136.14,138.39,139.79,141.4,141.4,142.14,142.93,142.03,142.74,142.74,143.59,144.78,145.59,143.36,142.73,140.53,141.92,143.08,143.06,141.61,142.61,141.14,141.48,142.52,140.2,134.39,135.18,138.05,138.72,137.13,138.38,140.03,139.95,137.27,135.46,136.59,136.88,139.36,139.12,137.74,134.73,137.35,137.14,136.34,135.05,132.12,132.11,131.71,126.93,131.62,130.08,124.83,126.64,124.03,117.87,116.42,116.19,124.83,121.04,122.21,124.01,123.91,128.93,128.79,129.36,128.67,130.14,128.26,128.06,128.21,128.85,132.66,131.24,129.36,129.9,130.97,129.87,126.78,126.03,127.9,127.27,127,126.89,127.57,127.57,127.57,126.98,129.17,130.21,127.29,124.56,123.35,123.79,125.2,126.06,123.72,124.67,123.47,122.53,120.3,116.91,117.83,120.92,119.78,122.76,122.16,124.02,122.34,120.44,121.22,122.92,120.91,121.89,121.89,126.25,127.34,125.6,124.62,125.8,125.42,125.42,126.18,125.59,123.46,119.31,116.1,115.19,117.09,113.63,113.98,115.02,115.82,114.84,113.91,117.12,117.31,117.65,116.49,114.52,114.3,114.44,111.37,113.43,115.64,116.23,115.08,115.59,114.49,112.59,115.26,116.41,118.92,118.84,119.22,119.22,119.47,118.51,119.59,121.06,122.92,122.92,122.14,123.73,124.46,123.49,124.54,123.16,124.28,124.54,125.19,125.62,126.13,124.5,125.21,123.65,121.26,121.07,121.57,121.8,119.45,118.35,118.07,116.59,114.58,117.49,115.69,116.02,116.09,116.43,118.34,120.87,118.87,118.26,117.4,116.03,116,114.93,115.75,113.6,111,110.8,110.34,110.56,108.69,109.99,110.79,115.5,114.28,113.81,111.89,111.27,110.72,110.43,111.46,112.1,114.08,114.82,115.06,115.78,115.24,116.94,118.85,119.51,119.48,119.76,119.91,121.02,120.06,119.11,122.26,122.94,123.95,123.58,127.5,128.23,128.86,129.78,128.71,128.56,130.1,129.58,130.27,130.82,131.33,131.34,130.45,130.42,131.42,132.08,131.86,131.15,130.58,129.97,129.98,130.69,130,132.15,131.77,127.14,126.09,126.33,126.04,128.35,126.73,126.53,126.53,127.05,126.25,127.62,125.75,125.75,128.69,131.73,131.25,133.18,134.87,134.5,135.9,136.79,137.59,137.8,138.37,138.37,135.72,136.57,137.59,137.66,137.5,138.36,138.49,137.85,138.01,138.27,140.58,141.14,139.4,139.53,139.52,140.88,139.15,140.59,140.51,141.87,142.44,141.7,141.58,140.89,140.64,141.15,138.52,140.81,140.49,139.74,140.57,142.36,142.99,141.84,142.15,142.08,140.2,135.79,138.54,133.75,136.47,134.75,136.55,138.61,139.08,139.46,136.92,138.05,138.17,140.26,142.05,143.03,142.9,143.04,142.48,142.85,142.85,142.85,143.64,143.66,144.63,145.54,144.78,145.65,145.64,145.35,146.13,145.91,145.12,144.12,144.46,144.5,144.5,142.36,142.87,142.11,143.88,144.15,143.3,142.76,142.86,143.13,143.08,143.05,143.31,143.31,145.69,145.37,143.94,141.33,141.53,143.78,143.78,142.26,139.82,141.13,143.31,142.31,142.38,142.27,142.46,142.2,143.08,144.11,145.05,144.69,145.68,144.6,143.97,143.29,142.68,141.59,141.89,142.71,144.02,144.35,145.82,145.79,145.55,144.22,139.99,140.43,141.09,142.09,144.54,145.58,145.85,144.42,144.85,144.6,144.98,145.57,145.29,145.56,144.06,147.42,148.05,148.21,148.21,143.75,142.69,143.63,143.78,142.17,143.11,145.32,143.24,143.54,142.16,142.01,140.14,139.65,140.04,141.22,141.43,140.29,140.42,142.33,143.41,143.04,142.44,141.96,141.87,141.51,140.49,139.92,140.45,141.02,140.62,140,141.86,142.37,140.74,140.64,141.74,139.64,139.46,138.14,136.87,136.96,137.95,138.38,137.15,135.76,135.9,135.9,137.38,136.32,139.39,139.25,139.16,137.1,137.56,137.64,136.1,135.59,133.41,133.97,134.76,135.02,134.23,133.07,133.53,134.62,135.63,138.21,138.38,137.85,137.67,138.51,140.19,139.13,140.29,142.26,143.05,142.62,143.89,143.94,143.59,144.26,144.57,144.93,144.34,144.13,144.87,145.27,146.46,146.35,147.6,148.61,148.3,149.94,150.5,150.38,150.17,150.46,150.8,149.87,150.34,150.29,149.99,149.88,149.88,149.88,150.11,149.64,149.88,149.88,147.45,148.3,147.96,148.68,148.08,148.14,147.25,148.5,147.66,147.39,145.95,147.61,147.47,148.51,148.03,151.29,151.89,153.66,153.78,154.56,154.08,153.76,154.29,154.31,155.49,155.09,156.15,156.32,157.33,155.44,156.1,157.23,157.97,157.88,157.79,158.29,160.94,161.51,161.24,161.95,161.89,161.69,162.25,162.85,162.19,162.94,164.88,164.45,163.43,165.18,165.76,165.51,165.28,165.17,166,165.75,167.47,166.77,167.2,167.87,168.45,168.5,168.5,168.5,167.13,168.03,168.08,166.23,167.26,165.44,165.77,164.63,164.25,165.22,162.99,162.89,163.64,163.02,163.65,166.01,165.4,163.72,165.97,165.11,163.13,163.13,162.11,163.14,164.31,166.27,167,167,168.56,168.36,168.4,169.08,168.14,167.86,167.86,167.3,166.57,166.98,166.91,167.7,166.74,164.52,165.15,165.2,165.86,164.19,166.92,168.03,167.44,166.28,164.58,166.88,163.6,160.41,161.77,162.94,161.94,164.01,162.67,164.11,163.62,162.95,162.51,162.23,163.42,162.63,164.6,165.32,165.06,164.74,162.54,164.37,164.95,167.16,165.18,164.01,162.14,161.43,160.01,162.34,162.98,161.16,159.48,161.18,159.62,160.47,161.53,161.53,153.76,151.54,151.66,154.74,154.76,154.97,154.86,155.63,156.71,159.37,160.45,161.48,161.02,161.94,161.93,162.73,162.31,162.38,162.86,164.62,164.35,164.85,162.84,160.71,159.61,157.06,158.4,157.36,157.9,159.58,160.57,160.02,161.12,160.28,163.86,161.48,161.95,163.77,162.98,166.82,167.97,165.75,164.22,164.52,163.13,164.24,164.73,164.05,165.16,164.76,165.87,167.1,163.97,162.71,163.99,165.28,163.79,163.73,163.17,163.6,163.85,164.74,164.08,161.95,160.02,161.69,160.84,161.44,159.13,160.83,159.2,160.9,157.28,157.13,160.22,158.94,158.79,157.49,156.78,157.64,158.75,159.1,157.85,156.89,157.74,159.25,160.66,161.71,163.05,164.13,165,165.26,164.14,164.39,164.6,164.68,163.98,163.84,164.32,161.73,161.17,160.86,160.86,160.86,160.86,162.39,161.41,161.41,161.41,161.48,165.3,166.13,165.62,166.33,164.98,164.22,165.09,166.81,169.28,170.65,171.19,171.24,172.56,172.95,173.01,171.99,172.23,173.38,175.09,175.25,172.96,174.51,174.73,177.56,176.52,177.62,178.7,179.18,182.33,182.09,182.97,183.43,181.03,181.02,181.48,180.78,180.59,183.24,181.4,181.1,183.66,178.58,181.95,182.99,181.27,178.57,176.01,177.65,176.62,179.14,180.51,181.82,182.56,180.69,179.79,179.52,181.49,179.39,178.37,176.72,173.97,176.36,175.81,169.49,161.7,154.35,158.24,153.21,159.74,158.69,162.8,164.76,164.63,163.6,163.6,163.6,164.46,169.01,169.55,170.85,171.39,171.11,171.05,171.05,175.19,175.12,174.47,173.37,175.32,176.01,178.74,179.53,179.11,179.4,179.91,179.9,180.81,180.8,179.81,176.55,178.84,179.51,178.28,178.28,177.89,177.52,178.19,179.17,179.35,180,180,179.51,178.77,177.7,175.37,176.99,175.31,174.59,172.27,173.48,173.09,175.59,174.09,173.83,176.53,175.79,175.1,176.3,177.11,175.31,177.06,178.07,180.51,180.27,178.45,178.03,177.48,175.62,178.24,177.65,177.11,175.37,177.15,177.51,177.41,176.93,178.31,178.77,176.34,176.34,173.77,174.01,174.47,176.75,177.27,176.74,176.88,178.61,180.15,180.61,180.15,181.76,181.39,181.06,181.92,180.45,178.46,178.77,178.89,177.4,177.91,175.39,176.51,177.23,176.28,177.76,177.96,177.72,178.56,178.69,180.34,178.08,177.99,180.88,180.93,180.39,181.4,181.14,180.49,182.3,182.54,183.31,185,187.15,187.34,186.58,186.08,187.28,186.47,183.35,184.57,184.04,185.79,187.35,185.87,188.31,188.51,186.93,187.89,188.1,189.31,189.09,189.13,188.91,187.68,188.25,187.62,187.92,186,184.52,187.76,189.79,191.84,190.36,188.74,186.98,183.46,183.71,184.63,182.81,183.26,184.76,187.47,187.39,187.89,187.86,188.48,188.76,189.54,189.74,189.79,189.55,189.21,190.73,189.63,190.68,189.53,188.33,190.32,190.94,190.39,190.58,190.58,190.58,190.58,190.66,192.13,192.13,192.13,196.36,196.63,196.35,195.71,198.8,199.43,199.88,199.05,200.25,199.86,196.43,195.31,195,197.43,197.17,197.49,198.71,196.67,195.3,197.16,199.14,198.73,197.91,196.42,198.83,200.84,200.45,200.07,199.26,198.4,198.19,199.61,202.31,200.86,203.24,202.66,202.75,204.63,204.24,203.47,198.45,191.32,194.61,191.69,189.6,188.45,193.49,192.08,190.56,189.49,190.24,191.24,190.16,186.09,182.35,184.78,185.01,187.26,184.5,182.5,183.7,184.62,190.03,188.71,188.71,188.71,186.73,196.01,195.45,196.44,195.74,198.37,196.91,196.67,200.8,198.31,196.57,195.78,195.4,195.02,194.26,193.45,192.8,194.96,194.96,191.05,194.56,199.79,197.98,195.95,195.42,192.54,194.28,194.28,193.18,193.88,193.95,198.09,197.57,199.53,199.53,201.01,201.22,200.71,200.56,200.04,202.46,200.66,202.31,200.94,200.95,200.54,199.22,200.77,205.11,206.49,207.42,208.83,209.6,208.6,209.21,206.53,206,207.75,206.23,206.56,209.76,208.25,210.83,212.57,212.08,209.49,205.68,208.31,207.84,207.87,208.17,207.69,208.29,206.54,206.42,208.35,209.39,205.85,208.2,208.24,208.48,207.13,210.3,210.75,213.02,215.02,214.7,215.54,216.25,216.64,217.16,216.59,216.97,216.77,216.47,214.4,213.62,212.88,214.21,213.74,213.99,214.49,212.97,214.99,212.81,211.12,210.89,211.57,211.91,212.28,212.58,209.21,207.8,209.66,207.52,206.73,207.72,209.59,206.72,209.43,209.65,208.82,207.92,208.92,208.87,209.5,207.8,204.7,206.79,206.91,207.91,204.86,203.09,204.63,205.56,204.42,205.2,204.46,205.66,203.69,202.92,205.77,201.77,201.15,202.74,204.35,204.45,205.75,203.24,204.72,203.68,207.69,206.56,204.54,208.51,209.75,211.93,212.11,211.71,210.43,205.92,204,202.66,196.96,201.35,199.01,195.39,199.49],"HSCEI":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.7,99.62,100.17,99.05,98.34,98.92,99.53,100.22,99.92,98.22,98.42,98.28,95.99,95.9,94.96,94,94.49,93.16,92.97,92.97,92.97,94.18,94.3,95.13,95.13,95.79,95.6,97.2,97.32,97.23,97.86,98.57,98.46,99.11,97.88,98.24,99.26,99.16,98.38,98.49,98.82,98.65,99.79,99.28,99.28,99.28,98.8,98.19,98.05,99.64,99.7,100.81,102.02,102.53,103.87,103.84,105.68,105.87,104.91,105.77,105.4,106.7,106.54,105.5,104.61,104.28,104.18,103.76,102.72,102.99,103.59,104.1,102.23,101.96,103.88,104.45,104.02,106.59,106.46,107.17,107.78,105.89,106.2,106.1,104.93,105.57,105.69,104.86,104.03,104.45,104.45,104.96,104.06,104.03,103.83,102.94,103.37,103.33,103.33,103.33,101.7,101.1,101.83,101.77,102.35,104.02,104.48,103.91,103.49,103.49,103.02,103.02,102.15,100.51,101.08,102.57,103.56,103.87,104.12,105.82,105.65,105.14,104.01,103.97,105.05,105.26,105.22,107.05,107.13,107.53,107.53,107.37,107.54,108.01,107.31,107.4,107.45,107.84,107.26,106.18,106.58,106.47,104.77,105.16,106.53,106,105.25,105.34,105.61,106.63,106.3,105.39,105.63,104.96,105.44,104.36,105.12,104.77,103.81,103.43,105.47,106.5,108.12,108.63,109.19,108.91,109.97,109.84,109.23,109.57,109.19,109.68,109.95,108.92,109.64,111.63,111.95,111.41,111.42,111.94,112.19,111.01,109.18,107.06,108.42,108.73,109.54,109.38,108.28,108.87,110.93,110.93,111.9,114.31,114.85,114.38,115.18,114.38,114.28,113.24,113.33,112.69,112.39,112.9,113.63,113.84,113.28,112.41,112.07,113.37,112.66,113.14,113.39,112.49,110.5,111.07,111.75,110.12,110.48,110.48,114.48,115.41,115.41,116.04,115.29,115.63,115.55,116.45,116.65,117.49,117.14,117.68,115.01,117.04,116.36,115.49,116.38,115.9,117.9,117.09,116.53,117.83,117.45,117.49,116.7,117.92,117.22,118.93,118.94,118.32,117.48,115.57,116.79,117.55,116.84,120.24,121.09,118.85,120.58,119.21,118.53,117.95,116.2,115.94,116.63,116.29,113.03,112.91,114.32,115.76,114.55,116.65,116.77,115.09,115.59,116.87,116.51,117.43,118,118,118,117.64,118.31,118.57,122.21,122.41,123.57,123.66,123.89,124.1,124.44,124.5,126.26,126.28,129.48,130.31,132.6,133.46,133.71,136.6,137.93,135.57,138.97,138.32,135.58,137.33,136.03,137.09,136.5,128.46,125.9,125.36,120.52,120.5,121.56,124.16,126.93,126.93,126.93,125.53,128.47,126.87,128.96,129.96,128.06,125.38,125.86,123.58,121.43,124.67,123.34,124.9,125.88,128.57,129.07,128.44,128.8,128.33,128.2,127.56,126.79,125.84,122.81,123.51,124.57,121.52,121.5,121.5,121.5,122.9,120.07,120.07,121.18,122.25,124.79,124.8,124.44,124.16,121.59,120.5,121.37,123.94,122.06,121.51,123.99,122.47,121,122.19,124.87,124.87,123.47,121.7,120.4,121.17,122.98,123.39,123.88,125.01,127.03,125.98,125.97,124.33,125.11,125.05,125.05,122.43,123.06,122,122.68,121.1,119.17,121.29,121.72,124.04,124.14,124.38,125.64,123.19,123.25,123.6,121.87,121.01,120.2,120.2,116.38,116.51,115.08,114.83,113.5,112.59,110.16,110.05,112.13,112.13,110.09,108.48,107.42,107.56,109.04,109.61,107.93,108.88,108.82,108.39,107.25,107.12,106.56,108.17,108.67,111.12,112.14,111.6,111.87,111.86,111.64,111.11,108.68,108.29,108.37,110.03,110.39,111.59,110.81,109.02,108.8,106.68,106.12,106.46,107.66,108.73,109.87,109.51,109.16,111.88,112.37,112.23,111.06,110.13,109.5,110.28,107.8,107.12,106.93,105.65,104.63,103.68,106.35,107.08,105.94,106.9,108.77,109.29,111.66,109.64,109.64,111.24,110.77,111.57,111.57,108.9,109.22,106.81,106.63,105.24,105.52,105.74,102.2,104.29,102.72,103.27,103.27,102.65,103.51,106.23,103.64,103.55,103.05,101.85,101.39,101.25,102.66,104.09,108.22,106.78,107.67,107.76,108.38,105.63,105.72,106.11,105.36,106.89,107.17,107.66,105.98,106.18,105.78,105.19,106.54,106.48,107.69,107.18,107.56,110.19,110.45,108.93,106.13,105,104.03,103.74,105.48,106.9,104.9,104.82,103.59,103.24,102.18,102.28,101.9,101.9,101.9,101.17,101.18,102.52,99.58,99.59,101.56,102.51,102.61,104.89,105.26,105.87,104.22,106.35,106.89,106.45,107.71,108.48,107.47,107.65,108.26,110.11,110.2,110.04,110.34,111.75,112.03,111.76,111.76,111.76,111.76,110.95,111.56,111.84,113.4,113.11,110.75,112.9,112.57,113.71,114.48,115.71,117.78,116.89,116.02,115.11,116.52,117.21,117.29,117.38,116.05,112.97,114.19,116.11,115.5,115.92,116.53,118.22,118.34,117.71,116.9,116.63,113.74,113.73,114.48,114.37,115.23,117.03,116.92,118.53,118.4,118.4,119.42,119.64,119.12,117.64,118.07,117.78,119.7,119.98,119.17,119.17,119.17,118.79,118.11,116.47,116.56,117.85,116.88,116.88,117.02,117.21,113.75,114.03,112.37,109.82,110.69,110.69,109,109.4,109.48,108.23,107.67,107.69,107.38,105.32,105.77,105.34,105.48,105.21,105.82,105.18,105.62,104.71,104.75,104.65,104.65,106.6,107.54,106.27,106.04,105.51,105.6,106.4,109,110.6,110.59,110.91,108.78,109.02,110.34,110.19,110.19,111.2,110.6,110.51,110.32,108.6,107.85,108.37,109.2,109.24,109.76,110.02,109.85,109.2,110.47,109.06,109.46,109.96,110.68,109.9,109.16,109.55,108.1,107.55,104.79,102.09,101.38,101.19,101.68,101.2,101.24,99.71,99.91,100.28,100.9,102.37,102.6,103.06,102.5,103.23,101.4,101.22,101.07,101.19,102.1,102.31,101.62,104.18,105.15,105.62,105.49,105.34,106.98,107.26,108.22,107.62,106.35,106.11,105.16,105.06,104.18,104,102.97,103.41,102.77,103.3,103.3,103.11,103.5,102.75,102.75,103.3,102.97,103.47,105.84,106.4,106.33,106.65,107.22,106.73,106.76,106.6,105.83,106.66,105.98,107.03,106.8,106.11,106.66,107.56,109.5,110.15,109.98,110.74,110.19,107.47,108.26,106.52,105.59,105.56,106.9,108.31,107.53,105.82,106.39,107.63,107.51,107.54,106.95,104.32,104.95,104.86,103.83,104.52,105.38,105.39,105.26,106.35,107.49,109.75,109.15,111.03,111.64,111.24,111.69,111.92,111.75,111.75,111.75,113.36,113.67,113.09,114.63,113.95,113.06,113.4,112.19,114.23,114.09,115.4,114.98,114.38,114.71,115.64,114.74,111.08,113.16,110.9,111.15,111.15,111.15,107.53,104.55,103.7,103.98,105.67,106.26,109,108.4,107.89,109.45,110.22,109.72,110,110.96,109.41,110.46,110.52,109.27,107.02,107.13,106.34,107.27,104.32,106.17,106.17,106.54,108.63,105.89,101.1,102.81,101.97,98.48,97.72,93.44,93.32,89.12,86.68,92.34,88.62,93,96.5,95.67,96.25,95.21,97.16,95.24,96.47,96.11,97.74,99.71,98.04,99.35,99.35,99.35,99.72,98.47,97.95,99.39,99.48,97.36,97.92,98.26,97.78,100,101.1,101.67,101.67,101.67,97.2,98.2,99.31,98.87,99.93,101.16,99.56,99.6,98.09,97.96,98.49,100.08,100.23,99.74,95.46,95.85,97.16,96.88,96.72,96.82,99.58,100.01,100.93,100.94,101.93,101.35,102.49,102.71,100.7,99.56,97.78,99.92,100.35,100.41,101,100.04,101.19,100.62,100.62,99.77,98.81,98.82,98.82,101.84,103.72,108.62,107.34,108.84,109.18,106.74,107.09,105.36,105.21,102.62,103.32,104.25,105.77,103.73,104.55,102.08,102.02,102.8,103.13,102.24,101.66,101.6,103.32,103.86,103.31,101.9,101.17,102.81,103.45,103.74,103.96,105.17,105.57,104.43,102.84,103.41,104.67,104.22,104.3,103.31,103.11,101.17,101.4,101.27,100.65,100.09,98.88,99.54,98.51,98.06,98.75,99.3,99.53,99.7,98.55,99.27,97.62,96.98,96.79,94.89,94.2,95.02,93.98,95.16,95.16,95.16,95.67,96.57,97.51,97.46,97.39,100.03,100.03,100.46,98.85,100.4,101.04,101.14,102.05,102.12,102.53,102.53,101.29,100.89,100.81,98.83,100.62,101.98,102.26,106.11,106.3,107.67,107.2,106.74,107.13,106.78,107.12,106.83,107.74,106.88,106.86,108.01,107.46,106.91,108.36,109.26,106.79,107.94,107.07,107.2,107.59,106.05,105.41,106.21,105.47,105.84,105.75,105.31,105.94,106.79,106.15,105.33,105.15,106.15,105.62,105.62,104.41,105.81,107.97,108.74,108.58,109.1,110.37,109.33,110.94,111.99,113.59,113.26,114.42,114.63,116.07,118.82,121,120.39,118.25,121.11,118.43,117.98,114.77,113.5,115.99,117.55,117.99,117.09,117.07,117.06,117.49,119.59,120.3,120.3,120.3,121.88,123.83,121.93,122.59,120.44,120.6,116.55,118.65,113.89,115.98,115.05,118.13,114.68,114.35,111.54,111.11,111.99,114.83,113.14,112.85,114.72,115.02,116.15,114.26,114.49,112.51,109.85,108.8,111.04,110.81,111.6,111.1,113.59,113.59,113.59,113.59,112.1,112.49,111.16,110.12,109.87,111.38,110.43,111.66,112.33,112.26,110.26,110.77,112.07,111.2,111.22,111.54,111.89,109.62,108.48,109.01,108.57,108.92,108.34,107.85,105.63,106.9,104.7,105.36,106.36,107.89,107.89,107.77,108.37,107.76,109.29,109.92,109.85,109.3,110.26,111.29,110.9,109.63,109.42,108.84,108.65,108.4,108.51,108.86,108.86,108.03,106.96,107.23,107.81,106.81,106.02,108.08,108.12,110.16,110,108.93,107.98,107.98,105.47,104.04,103.99,102.78,99.46,100.1,100.71,102.41,101.92,103.02,102.81,100.84,99.89,99.55,101.33,99.63,94.73,89.91,91.85,95.34,93.5,94.54,94.38,95.38,94.14,93.9,94.31,96.19,96.68,95.85,94.96,93.82,91.72,92.66,90.28,88.53,89.27,92.13,91.9,90.5,90.71,91.09,93,93.88,94.59,94.09,94.89,95.88,95.68,92.99,95.05,93.55,91.96,90.49,89.17,90.53,87.47,87.49,87.49,88.44,87.13,86.92,88.3,88.71,88.36,88.36,86.29,86.23,85.19,88.23,88.86,91.13,89.61,89.61,89.61,90.79,90.84,92.51,93.94,93.9,94.75,94.4,93.76,92.08,91.67,90.75,90.11,89.76,89.69,90.66,89.32,89.05,89.17,90.23,91.62,92.29,92,93.42,93.09,91.5,90.84,90.42,89.39,89.06,89.21,86.84,86.05,84.74,85.32,86.14,85.62,83.79,86.35,86.3,87.67,86.86,86.59,85.25,84.48,84.55,83.22,81.44,82.44,82.99,83.08,83.05,83.05,82.98,82.01,81.98,83.4,82.92,82.83,81.17,81.71,83.35,84.71,84.74,87.21,87.11,86.63,85.71,85.55,85.48,88.72,88.98,87.67,86.11,86.2,83.96,83.14,84.55,84.55,84.55,84.55,86.93,86.98,86.21,88.33,89.01,88.95,87.27,86.36,87.88,88.21,86.46,85.63,83.75,84.22,81.32,80.92,81.25,81.55,80.08,80,77.84,75.06,73.29,72.8,73.47,71.5,66.38,62.01,69.76,75.01,74.59,73.36,76.34,77.31,76.23,73.76,74.89,76.08,77.05,76.21,76.32,78.69,78.69,77.05,75.9,75.85,72.99,73.56,74.07,74.79,74.79,74.79,72.58,71.88,70.5,70.6,67.69,68.32,68.72,70.06,73.91,73.91,73.59,72.28,72.07,68.95,68.95,67.42,68.55,66.78,68.93,69.12,71.66,71.79,69.86,72.11,71.11,69.7,69.86,69.64,71.72,73.47,75.1,74.38,73.59,73.59,75.94,75.62,77.76,77.02,77.05,74.33,74.26,75.47,73.51,74.61,74.93,76.45,74.27,75.57,77.25,79.15,79.93,77.92,77.64,77.64,77.44,77.39,76.41,76.34,76.47,74.13,72.82,72.36,72.16,70.46,72.59,71.87,72.7,71.89,71.96,71.66,72.76,71.81,71.72,69.72,69.63,67.87,68.22,69.66,69.89,69.07,68.8,67.28,69.09,69.44,69,68.13,68.4,67.85,68.05,67.8,67.33,66.48,69.35,70.08,69.59,69.26,69.52,68.27,67.57,66.6,66.38,65.95,65.18,67.12,67.12,67.17,65.52,65.91,65.02,64.18,64.86,63.46,62.74,61.91,62.15,62.28,60.34,59.87,59.89,59.31,59.31,63.03,62.64,61.51,59.55,58.02,57.64,56.31,57,57.04,58.29,56.68,55.82,55.87,51.79,52.46,52.83,53.09,50.92,50.01,52.75,54.23,52.36,55.52,57.07,56.73,56.05,54.85,59.41,60.55,63.48,63.04,62.18,62.03,60.78,59.76,60.2,60.68,60.46,59.46,63.15,64.55,64.65,64.49,67.91,67.37,65.14,67.51,69.2,67.12,67.39,67.87,66.75,67.18,66.88,65.54,65.82,68.01,67.27,67.27,67.27,68.58,67.8,67.89,67.89,69.2,71.55,72.63,72.34,73.78,73.55,74.03,74.04,74.84,74.43,74.06,74.33,74.05,75.78,75.78,75.78,75.78,78.04,78.72,75.91,75.18,76.56,76,74.8,72.8,73.23,72.8,74.06,72.16,72.34,72,71.07,71.79,70.79,71.53,70.12,69.19,69.46,67.88,67.54,66.64,70.01,69.44,70.27,70.25,69.99,68.12,67.33,65.27,66.73,65.2,66.43,65.64,66.99,65.51,66.32,67.24,69.23,68.8,67.32,68.15,69.66,70.1,70.57,70.28,69.62,69.62,69.81,69.81,69.81,70.38,69.53,69.62,70.02,71.45,70.91,69.76,69.82,68.49,68.18,66.85,67.38,67.6,67.87,67.87,67.64,66.72,68.03,68.83,69.85,68.2,67.67,67.79,67.48,68.66,68.75,67.2,68,66.77,67.78,66.87,65.6,64.13,64.13,63.3,63.63,62.41,62.27,65.09,65.45,65.61,66.24,66.22,66.72,66.69,67.02,66.6,68.58,69.19,68.62,67.39,65.88,65.88,64.75,64.52,65.87,66.03,65.08,65.06,66.74,66.97,65.72,63.48,62.77,63.14,63.75,64.58,66.26,66.42,66.42,64.81,64.62,64.44,64.96,63.5,66.87,66.32,67.55,68.94,69.86,69.41,67.53,67.36,68.17,68.19,66.71,66.97,67.12,66.23,65.05,64.47,63.52,63.72,62.24,61.07,61.74,61.94,63.47,62.53,63.25,64.67,64.37,64.12,64.12,66.16,64.77,64.84,63.94,63.94,63.78,63.39,63.14,63.54,63.89,62.88,63.14,62.6,61.76,63.42,62.08,61.07,61.46,60.66,62.26,62.26,60.24,59.57,59.62,60.5,60.74,61.29,62.1,63.46,61.93,61.26,61.69,61.52,59.99,59.46,59.46,58.72,59.28,59.33,60.54,60.35,59.36,59.33,59.86,61.29,62.6,61.64,61.16,61.06,59.75,60.65,60.4,62.82,61.94,60.5,61.8,61.53,61.51,62.49,61.17,61.01,60.32,58.92,59.31,58.34,57.75,56.8,57.35,56.87,56.69,56.02,56.85,56.21,56.44,57.72,57.05,56.63,56.83,56.91,55.58,55.58,55.58,56.74,58.37,58.41,57.44,57,57.2,56.78,55.5,55.18,54.9,55.64,55.51,55.15,54.11,51.98,52.37,51.92,50.65,52.06,54.21,55.38,54.28,54.77,53.42,52.59,52.89,52.85,52.83,55.43,54.9,54.28,53.74,53.74,53.74,54.54,54.79,56.29,55.54,55.89,57.14,58.31,58.38,57.95,58.8,57.6,57.49,58.01,57.85,56.33,57.44,56.85,57.28,58.21,60.25,60.07,59.81,58.94,59.22,58.53,58.77,59.8,58.3,58.27,58.99,58,58.84,58.84,58.84,60.36,59.49,59.49,59.37,59.43,59.7,60.93,60.8,59.54,59.3,58.16,58.22,58.77,58.19,59.05,60.3,61.77,61.98,63.49,63.62,63.53,63.53,65.18,66.3,66.55,66.09,65.38,66.43,68.04,68.47,68.26,68.26,69.58,70.22,70.53,69.07,69.04,67.86,66.88,67.72,67.7,66.4,65.44,64.73,66.14,66.37,66.25,66.38,65.92,65.92,65.33,64.4,65.03,64.55,64.54,64.48,66.71,66.39,65.21,65.22,65.46,65.59,64.04,64.12,64.12,64.55,65.37,65.52,64.63,63.64,63.55,63.3,64.52,66.15,65.03,63.96,63.77,63.86,62.43,63.33,62.73,62.2,60.92,60.86,61.57,60.62,61.84,61.63,60.5,59.51,59.26,60.08,60.16,60.94,61.06,61.26,61.01,61.11,62.4,63.04,62.74,62.19,63.03,62.98,63.58,63.86,63.04,63.26,64.11,62.9,62.82,62.11,61.82,61.82,60.79,61.02,60.58,60.93,61.48,61.67,62.54,62.54,63.85,64.62,64.7,67.99,68.51,71.76,73.92,76.04,76.04,81.43,80.14,82.59,84.36,75.78,74.58,77.17,77.17,76.75,73.7,73.6,72.7,75.66,74.33,74.56,75.72,74.52,74.78,74.84,75.11,73.78,73.56,74.35,74.61,76.52,74.56,76.42,75.55,74.48,72.17,72.21,70.61,70.68,71.46,71.71,71.8,71.24,69.74,69.49,69.38,71.16,70.12,70.34,70.97,71.61,71.74,71.03,72.26,74.53,73.98,73.41,74.53,72.77,72.23,71.95,72.71,72.42,72.34,73.05,73.96,73.96,73.96,73.97,73.72,73.82,71.8,72.5,72.25,71.39,70.79,70.67,69.85,69.3,70.75,71,71.88,71.98,73.27,74.13,72.68,72.55,74.04,74.76,74.75,74.75,74.75,74.75,74.77,77.4,76.62,77.87,78.82,80.47,79.42,81.6,81.03,84.36,84.29,85.82,85.7,84.27,87.76,87.28,86.06,89.04,88.45,85.24,85.26,84.73,87.39,90.51,90.26,88.35,88.66,87.92,87.5,89.9,90.41,92.93,92.79,90.63,88.53,89.62,87.25,87.63,87.87,87.15,86.24,86.45,86.39,85.26,85.26,73.54,75.24,76.31,77.65,79,80.66,80.83,78.77,79.97,79.97,79.97,80.51,82.19,81.58,81.82,81.82,81.7,81.78,81.78,83.35,83.35,83.66,83.46,84.05,84.14,86.67,84.92,87.01,86.17,85.75,85.67,86.97,87.7,86.65,86.92,85.44,85.77,85.5,86.68,85.38,84.65,86.27,86.85,87.94,87.39,88.91,88.78,89.77,88.4,87.64,88.4,88.04,87.03,85.17,86.35,87.06,88.71,89.71,89.15,88.73,87.88,87.88,88.35,87.57,87.18,87.17,88.18,87.06,87.78,87.97,88.43,89.89,89.73,89.65,91,91.54,91.9,93.58,93.74,92.66,92.93,92.61,91.52,89.95,89.15,90.06,90.64,90.45,90.95,90.07,90,90.29,92.65,92.44,91.53,91.48,91.2,91.27,90.88,91.94,93.65,92.64,91.34,90.29,90.61,92.37,92.23,91.64,90.5,91.71,92.37,93.59,94.46,93.77,94.83,95.03,95.05,97.18,95.76,95.92,94.89,94.07,95.62,95.63,94.2,95.73,96.76,96.76,98.47,97.8,96.94,96.94,96.44,96.5,94.76,93.39,91.94,93.67,93.76,91.26,93.49,94.2,93.4,94.18,94.82,95.87,94.94,94.94,94.65,92.84,93.75,92.89,92.79,94.74,93.84,95.62,95.81,96.59,97.2,95.16,94.46,92.9,92.66,92.59,90.32,91.94,92.74,92.78,92.8,92.45,92.88,92.98,91.42,92.21,93.14,91.98,90.49,90.68,90.47,91.94,90.3,88.68,89.55,89.53,90.13,90.52,90.26,90.27,90.27,90.27,90.04,91.04,90.26,92.85,92.64,93.61,92.54,91.53,91.63,93.36,94.02,94.33,93.84,93.37,92.5,92.09,92.38,92.29,92.76,92.62,93.61,96.32,96.73,94.35,91.95,91.67,91.62,92.08,91.45,92.84,93.59,93.85,92.91,91.47,91.85,91.85,91.85,91.85,90.72,93.13,91.21,91.49,89.25,89.71,88.12,87.17,85.91,85.58,87.37,86.9,88.2,88.14,88.09,87.81,89.27,89.38,89.47,88.05,86.82,84.13,86.07,86.91,84.96,85.6,85.05,84.8,86.12,85.64,85.64,85.64,85.64,87.87,87.2,87.64,87.1,87.81,88.28,90.17,89.56,90.11,90.56,89.13,88.43,88.86,88.67,87.54,89.17,87.91,87.91,88.85,88.41,89.12,90.32,90.01,89.96,89.94,89.88,89.7,88.01,87.06,87.49,87.14,85.82,86.59,86.59,86.85,85.7,84.7,85.32,86.15,88.73,87.05,86.09,85.43,84.46,84.3,84.24,83.21,84.8,84.81,83.44,82.47,80.77,80.77,80.14,78.57,78.63,77.04,75.55,77.01,76.54,76.54,77.08,77.97,79.11,78.68,81.86,80.98,81.41,81.68,82.05,82.88,84.23,82.39,84.88,84.66,83.55,84.58,83.75,84.71,85.43,87.32,87.54,87.21,87.61,86.82,87.12,86.06,86.39,87.3,86.36,85.53,85.33,84.46,85.46,85.6,85.78,86.56,87.43,85.78,85.52,86.41,85.97,85.97,86.2,85.69,85.57,84.91,86.63,85.36,85.03,84.75,83.79,83.5,83.89,83.08,83.1,82.78,83.29,84.45,84.68,83.78,83.7,82.69,83.2,82.82,83.24,83.24,81.32,81.53,82.31,81.84,81.12,82.51,82.72,82.78,82.86,82.05,82.31,82.31,81.31,80.44,77.86,78.54,79,78.65,78.9,78.53,79.61,80.06,80.43,81.59,84.75,83.78,83.64,83.7,82.74,81.58,80.38,80.82,80.04,79.35,77.87,76.5,76.23,75.46,74.78,75.88],"KOSPI200":[100,100.46,101.02,101.74,101.75,101.4,102.22,101.69,102.53,101.4,101.4,102.07,101.99,102.84,102.41,102.51,100.87,100.89,100,100.46,100.89,101.59,101.69,101.76,101.31,102.19,101.83,100.63,101.08,101.02,100.79,100.81,99.57,99.59,99.46,100.26,100.52,98.32,100.54,99.24,98.46,98.14,98.58,98.63,98.54,98.26,99.39,99.89,99.25,99.34,99.62,99.6,100.13,100.22,99.59,99.3,100.67,100.95,103.18,102.75,102.67,103.03,103.18,102.96,103.4,103.15,103.41,103.22,103.17,103.02,103.02,103.37,102.27,102.39,102.39,102.39,103.56,103.62,103.17,103.65,103.86,103.86,105.6,106.31,105.51,104.81,105.29,105.18,105.42,104.96,105.19,105.27,105.6,106.52,106.52,106.52,105.58,106.16,105.73,105.88,106.13,105.92,105.43,105.42,105.8,105.86,105.5,105.86,105.91,105.87,106.22,107.16,107.45,107.47,106.48,105.92,106.35,106.35,107.37,106.24,106.49,107.06,107.23,106.97,107.23,108.46,109.44,109.44,110.31,111,110.56,111.78,111.3,111.37,111.18,110.41,110.76,111,110.92,110.52,110.9,110.63,110.56,110.06,109.88,109.17,108.49,108.77,109.92,109.92,109.52,109.57,108.88,109.38,110.29,111.04,112.4,112.94,113.16,113.11,113.11,114.07,114.07,115.18,115.18,118.09,118.09,116.64,118.04,117.45,117.7,118.01,117.88,117.54,117.39,118.39,118.68,118.82,120.2,120.88,120.71,119.95,119.98,119.73,121.23,121.03,121.03,120.38,120.6,121.84,120.6,121.3,121.27,120.78,120.82,121.53,121.81,121.1,121.87,122.18,122.83,122.92,122.41,123.09,122.77,123.02,122.26,122.78,122.82,122.34,122.66,123.49,123.49,124.58,124.98,125.44,125.49,125.59,126.26,126.72,126.81,126.08,125.81,126.22,123.71,123.89,124.85,125.11,122.98,123.44,123.64,123.42,121.89,121.44,119.21,120.08,120.08,120.96,121.69,121.45,121.35,121.82,121.97,122.37,122.56,121.9,121.55,121.94,121.4,121.21,121.21,119.74,119.4,120.89,121.07,122.01,122.25,122.08,123.07,123.53,125.6,125.43,125.42,125.33,125.33,124.6,123.77,123.59,123.6,124.55,124.55,124.55,124.55,124.55,124.55,124.55,127,128.43,129.21,128.91,129.1,129.37,129.33,128.57,129.52,129.74,129.55,129.69,128.77,129.65,130.11,131.36,133.41,132.92,133.43,132.87,132.62,133.03,132.77,132.3,131.66,131.38,130.81,131.67,131.6,131.11,131.34,132.12,131.73,132.1,129.77,130.35,130.22,128.09,127.9,129.47,129.8,127.8,127.43,127.86,128.02,127.62,128.45,127.89,128.47,128.62,128.68,128.68,125.91,126.5,126.5,125.58,126.12,127.89,127.89,128.38,128.83,127.82,129.55,130.46,130.06,129.02,128.25,128.67,128.93,129.96,129.64,129.61,129.77,128.49,130.32,130.32,131.56,132.08,133.13,131.3,131.29,131.28,128.78,127.31,125.24,122.27,122.72,120.04,121.34,122.42,123.81,123.81,123.81,124.68,123.2,123.84,122.94,124.76,124.97,124.77,123.21,123.21,121.43,119.95,122.26,122.53,123.96,125.1,126.29,127.19,126.8,127.1,127.15,126.16,126.72,126.65,127.33,123.03,124.01,124.58,122.79,123.59,123.9,123.66,123.41,121.51,123.28,122.71,123.44,123.63,123.24,123.35,123.99,124.12,123.91,125.48,126.07,125.19,125.19,124.39,123.65,125.26,126.33,127.42,127.42,127.02,126.24,124.74,124.74,124.39,123.82,124.96,125.43,125.12,124.03,124.43,123.77,124.2,124.54,124.54,125.35,125.03,125.25,125.62,124.52,121.79,122.44,123.35,123.99,124.35,124.35,125.1,124.04,124.92,124.77,124.77,122.55,121.58,120.25,118.67,119.73,118.54,119.6,119.47,119.23,119.03,117.46,118.01,115.36,115.52,115.09,114.85,115.43,116.25,116.64,115.95,115.94,117.61,117.11,116.91,116.75,116.53,116.94,116,116.37,116.11,116.94,117.27,117.08,117.14,117.63,115.6,116.41,116.27,117.03,117.04,117.12,115.64,114.15,114.63,114.63,113.51,113.64,113.66,114.96,115.39,115.89,116.39,116.89,117.05,117.37,117.37,118.17,117.15,117.67,116.16,115.89,115.33,115.66,115.17,115.13,115.16,117.08,116.26,116.61,116.82,117.76,118.46,118.46,118.46,118.46,119.16,118.34,118.21,116.78,116.78,114.91,114.71,114.17,114.17,113.36,108.36,110.02,109.16,109.05,110.29,109.27,109.73,110.03,107.33,106.86,105.04,103.45,102.47,103.36,103.97,103.55,107.34,106.36,106.95,106.51,107.16,106.85,106.95,106.21,105.89,106.93,106.98,107.24,106.16,105.65,105.45,104.88,106.25,107.15,107.69,107.97,106.86,108.76,107.62,106.92,105.22,105.65,104.5,104.24,105.73,106.1,104.58,104.88,104.43,105.27,104.28,104.38,104.14,104.14,102.78,102.61,103.17,103.17,101.69,100.72,101.56,103.01,102.25,104.6,104.58,105.2,104.36,106.3,106.81,107.07,107.86,107.9,107.4,107.85,108.93,110.92,110.91,111.45,112.87,112.59,112.55,112.55,112.55,112.55,112.49,110.85,111.09,111.72,112.22,113.68,111.83,112.59,112.2,113.57,113.58,113.71,113.81,113.37,113.72,111.76,111.76,111.26,110.44,110.21,109.82,108.23,108.32,109.37,108.69,108.94,110.22,110.24,110.2,110.24,111.2,111.5,109.26,109.32,109.2,108.33,108.88,110.39,110.94,112.49,112.69,112.9,112.78,112.91,113.39,113.19,113.56,113.96,114.45,114.33,112.56,112.59,112.58,112.81,111.72,111.38,110.79,112.94,112.2,112.2,112.68,111.71,111.71,110.78,110.33,106.72,107.14,105.82,105.77,106.19,104.75,104.1,104.34,104.8,105.01,104.9,104.13,104.12,104.24,102.93,103.94,103.92,105.6,105.41,105.54,105.54,105.65,107.16,107.59,107.41,106.77,106.52,106.36,106.86,108.42,108.7,108.49,108.53,108.41,108.51,109.38,109.28,109.19,108.68,107.26,108.12,108.04,105.76,105.43,105.84,107.03,107.38,107.37,107.92,106.91,106.59,108.12,108.12,108.66,107.6,107.53,107.21,105.44,105.92,104.89,104.65,103.57,101.28,99.8,99.24,99.4,100.36,100.56,99.57,100.37,100.37,99.99,100.46,101.62,101.75,100.93,100.86,99.31,99.83,100.63,100.15,102,102.03,101.7,103.06,104.14,104.57,105.3,105.84,106.66,106.66,106.66,107.12,106.99,107.53,108.27,108.86,108.95,109.47,108.07,108.25,106.85,107.73,108.07,105.76,105.76,105.3,105.41,106.86,106.86,105.86,106.84,107.99,108.04,108.82,108.52,107.44,107.82,109.25,108.78,108.97,109.11,109.39,109.3,108.5,108.62,109.65,111.27,111.99,112.05,111.99,111.5,110.6,111.7,110.77,111.81,113.14,113.09,112.72,111.14,109.59,110.04,111.13,110.99,111.39,110.75,109,109.26,108.77,107.96,107.63,108.91,109.49,109.99,110.38,112.28,114.25,114.11,115.94,115.87,115.9,116.3,116.12,115.35,115.35,115.8,116.25,115.69,115.69,114.34,114.5,113.59,114.69,113.98,115.94,116.98,118.19,118.75,118.04,119.24,119.44,120.34,118.97,120.54,119.06,119.06,119.06,115.3,115.77,113.56,112.05,112.26,114.47,115,118.4,117.44,116.66,117.86,118.75,118.51,119.33,119.23,117.25,117.49,116.82,115.16,110.67,111.94,110.24,109.12,105.55,106.47,106.94,109.53,110.81,108.34,103.62,104.23,101.21,97.52,94.77,91.75,89.35,85,78.48,84.15,79.5,86.77,91.71,90.32,92.07,91.54,93.26,89.14,91.3,91.25,94.83,96.43,95.26,96.72,97.66,95.85,97.45,97.45,97.31,100.43,99.3,98.22,99.19,99.93,98.56,100.36,100.97,101.66,101.66,101.66,98.69,98.69,100.42,100.21,101.06,100.4,99.78,100.76,99.89,99.94,100.59,103.1,103.46,103.86,102.24,103.48,105.27,105.4,105.66,105.67,107.58,108.72,112.59,112.81,114.45,114.51,114.72,114.95,113.66,110.97,105.52,111.29,111.46,111.02,111.59,110.83,111.03,112.91,110.16,111.6,109.49,110.3,110.37,111.79,112.59,114.45,112.93,112.62,113.12,112.26,114.14,114.06,115.1,113.91,114.82,114.52,116.24,115.8,115.14,114.46,115.59,118.19,118.64,118.87,117.88,117.93,119.34,120.76,122.6,123.09,124.75,126.42,127.07,127.33,125.72,125.72,123.2,123.47,118.77,120.57,121.82,123.49,123.73,122.62,122.96,120.95,122.01,122.67,124.61,122.88,123.53,124.99,123.57,124.65,124.62,126.4,127.34,126.93,125.23,125.38,124.4,121.62,121.94,119.12,119.55,120.91,121.86,121.86,121.86,121.86,123.46,123.83,124.98,125.02,125.02,125.68,125.85,124.67,123.62,122.8,123.1,123.94,124.35,123.57,123.97,123.47,122.79,123.33,122.06,118.77,120.49,122.9,123.59,126.61,126.85,128.31,128.43,130.4,129.85,131.15,134.14,133.84,133.88,133.96,134.14,137.23,137.94,137.16,138.67,138.91,136.28,138.78,141.24,142.43,144.78,145.65,143.13,146.29,145.46,146.59,146.32,146.06,146.71,146.5,146.32,146.57,144.3,146.23,149.32,149.32,149.62,150.15,153.31,153.31,157.48,159.9,158.34,161.78,169.42,169.78,168.5,169.49,169.28,165.57,161.66,165.93,166.98,169.44,168.21,172.21,168.05,166.85,163.98,159.32,163.61,165.81,167.45,164.73,166.7,164.99,164.58,165.26,165.26,165.26,168.16,169.04,167.05,164.39,165.77,164.17,163.75,160.34,166.39,161.43,161.43,163.35,165.51,163.1,162.25,160.81,159.8,158.89,161.86,163.88,163.11,164.34,163.04,164.24,162.61,162.5,160.95,160.32,160.88,162.6,162.27,164.06,163.45,165.17,166.87,167.31,167.72,168.04,168.1,167.09,167.06,168.98,169.62,170.39,170.29,170.11,171.15,168.06,168.3,168.46,170.27,170.18,168.35,167.87,166.33,165.54,166.81,166.81,167,168.77,171.56,168.85,166.13,163.85,165.47,164.72,166.62,166.62,166.06,166.22,165.62,167.11,166.79,166.58,167.74,168.51,169.46,169.4,170.86,170.21,170.62,170.47,168.61,169.08,170.43,170.61,170.96,172.08,171.2,171.31,169.91,171.08,171.99,172.64,173.43,173.27,172.31,172.82,171.83,171.7,172.35,173.08,172.08,170.37,168.49,169.84,171.19,170.74,172,171.24,169.29,168.77,167.76,169.88,169.95,168.34,168.64,169,169.14,166.94,168.07,169.33,171.72,171.2,170.63,169.99,168.77,167.27,166.34,163.85,163.85,161.98,162.79,159.48,157.83,159.33,162.44,163.02,161.61,161.56,162.05,165.32,165.37,163.78,165.09,165.55,164.53,163.25,160.39,160.95,161.34,162.39,162.58,161.15,161.85,161.85,161.85,161.85,161.64,161.4,161.84,159.97,157.56,158.04,155.47,155.47,152.8,150.41,152.85,152.57,152.57,149.92,151.26,153.42,154.84,154.38,155.72,155.06,154.84,154.9,155.56,157.16,155.74,155.12,152.98,153.51,155.48,153.38,154.19,153.53,153.42,153.73,152.1,152,153.74,155.3,155.19,153.37,152.58,153.79,157.16,156.12,155.71,154.35,151.64,150.29,146.99,150.88,153.44,154.36,154.71,156.07,156.45,157.97,156.72,156.45,155.72,155.81,156.61,157.11,154.13,155.14,155.98,156.8,157.73,156.98,158,156.23,155.24,155.24,155.24,155.71,153.74,152.1,153.92,152.61,153.18,155.42,154.77,152.58,151.15,150.05,148.94,149.8,148.1,146.22,142.71,142.1,137.27,140.98,140.98,140.98,140.98,142.4,144.27,142.92,143.14,145.18,146.33,145.16,142.94,141.94,144.65,145.53,145.14,145.04,143.15,143.52,139.82,141.16,142.38,142.38,142,144.55,142.44,139.03,137.59,137.59,140.99,139.92,139.65,138.24,140.23,142.35,142.69,141.29,142.43,143.68,143.1,142.58,142.58,143.26,143.54,143.98,143.03,143.72,143.64,142.17,140.09,140.2,140.11,138.75,141.38,140.74,139.35,139.26,140.73,140.79,141.39,139.97,137.43,138.1,136.34,137.9,139.83,139.42,139.14,139.35,139.35,137.44,137.44,135.34,135.25,133.08,136.06,135.45,136.86,137.18,135.17,137.55,137.97,135.5,136.1,135.57,137.06,138.81,139.62,139.62,138.03,138.62,138.62,136.13,136.34,136.5,134.64,129.91,129.26,126.89,126.91,126.05,123.83,124.59,121.32,120.29,122.9,124.52,125.67,123.21,120.98,119.73,119.72,121.7,119.04,121.42,122.14,121.41,120.12,120.74,120.25,121.26,124,123.62,124.45,125.89,124.97,125.37,125.87,125.92,126.66,127.32,127.19,126.66,127.52,128.17,128.97,128.87,129.21,127.73,129.93,130.22,130.22,130.66,129.92,129.48,128.69,127.11,125.5,125.96,127.45,127.56,124.58,125.82,127.18,124.06,123.23,123.05,123.27,121.36,121.73,121.73,121.73,125.45,123.16,122.33,121.57,120.7,121.11,119.98,118.79,117.25,114.11,114.28,111.52,111.31,110.8,110.8,113.52,113.83,114.7,114.37,114.37,112.22,113.06,111.28,113.95,114.04,115.62,114.71,113.66,113.64,114.78,114.83,115.72,117.68,116.2,117.98,119.67,119.67,118.8,119.85,121.24,122.87,124.14,122.53,127.24,126.62,126.93,126.79,124.74,124.88,123.92,122.88,123.7,124.96,124.47,122.95,124.28,126.41,126.81,124.06,123.62,122.14,121.4,121.39,122.72,121.94,121.91,123.35,121.19,121.09,120.81,119.74,119.41,121.09,118.96,119.04,119.8,117,114.64,114.64,114.12,114.04,116.56,117.3,118.75,121.96,121.91,122.23,122.36,123.57,124.46,123.56,122.83,123.58,124.28,124.28,124.28,126.32,128.21,129.16,127.07,124.94,126.49,127.57,128.33,125.56,126.24,128.24,127.95,127.47,126.71,127.39,125.23,127.63,126.33,126.72,126.63,124.42,125.8,124.81,123.63,123.97,123.97,124.55,124.59,126.39,125.94,124.2,123.67,122.34,123.35,120.34,121.73,121.45,122.9,121.88,122.22,123.7,124.35,123.77,123.2,124.59,124.84,125.25,126.82,126.17,126.71,127.42,125.16,127.34,128.53,130.3,130.78,131.17,131.41,131.5,131.34,131.44,131,130.33,129.45,127.78,127.58,128.02,128.56,128.56,129.6,128.59,128.45,128.45,129.52,129.26,128.4,128.1,127.44,127.78,128.11,128.62,129.89,131.62,132.43,132.75,132.51,132.06,132.76,132.76,134.49,133.55,133.14,134.95,135.43,135.43,135.16,134.98,136.57,135.69,136.41,135.73,135.15,135.93,135.13,134.91,133.67,134.34,133.28,134.04,134.02,133.27,132.47,133.09,135.11,134.52,133.52,132.4,130.58,130.29,132.72,133.68,134.34,136.62,136.16,135.23,135.12,134.55,134.84,135.6,135.83,134.12,135.77,135.48,136.11,138.23,135.39,134.5,134.39,133.77,133.09,134.53,134.08,133.49,132.45,132.45,130.46,130.05,129.33,129.5,129.84,129.62,131.46,130.06,130.95,131.44,131.9,131.83,133.22,134.3,134.01,133.05,132.61,132.48,132.94,132.14,132.32,134.36,135.86,134.16,133.43,133.4,131.15,130.75,130.58,128.74,128.66,128.66,128.66,128.66,128.66,125.8,125.46,125.6,125.6,125.67,127.89,129.5,128.29,127.31,128.91,129.49,127.11,125.22,124.25,125.4,124.64,121.19,121.5,121.67,120.33,121.97,124.11,125.33,131.6,128.89,127.59,128.1,127.5,127.32,128.61,131.52,131.65,130.77,131.62,132.54,132.64,132.68,131.53,131.4,132.92,132.56,133.28,131.85,132.38,131.08,131.32,131.01,132.56,133.08,133.8,132.59,134.42,135.47,135.27,135.45,137.88,137.35,137.5,137.5,138,138.8,140.98,140.98,141.99,138.31,137.07,136.74,136.09,135.4,134.16,134.01,133.19,133.6,131.82,128.43,128.83,131.13,130.99,131.91,131.24,131.45,131.62,133.04,132.9,132.41,134.84,139.18,137.5,136.97,138.72,139.13,139.13,139.13,140.74,138.89,138.31,140.01,142.12,140.56,140.21,140.85,141.21,139.99,138.92,140.51,140.03,140.03,142.2,140.82,140.29,140.52,142.44,141.12,142.21,142.97,144.4,141.53,142.29,140.72,143.08,147.15,146.75,146,147.52,147.32,146.98,147.53,147.39,148.21,145.6,147.92,146.33,146.7,145.82,145.82,145.99,144.63,143.86,140.46,138.93,141.4,138.85,140.55,140.19,143.19,140.4,142.17,143.54,143.79,143.79,143.47,143.18,143.18,146.81,147.32,145.25,146.13,146.1,146.12,146.12,147.52,145.94,147.16,146.32,146.26,146.35,144.17,146.17,146.23,143.72,141.26,141.07,143.93,142.76,144.31,144.31,146.26,144.71,144.81,146.15,147.58,148.07,147.23,148.75,150.83,151.53,149.99,149.01,149.59,150.83,150.54,151.23,151.36,150.12,150.92,153.01,155.74,155.35,155.87,155.79,156.94,154.49,155.1,155.68,154.2,153.19,151.18,149.58,150.3,149.12,146.21,147.36,149.15,147.63,149.84,149.86,143.81,130.69,134.58,137.47,136.53,138.43,140.04,140.6,141.92,141.92,145.36,143.95,145.31,145.01,145.36,144.89,144.26,143.57,143.85,141.81,142.38,142.59,141.3,136.52,136.23,134.83,133.97,133.3,132.18,135.41,135.35,135.35,135.35,135.35,135.19,135.73,136.17,137.68,135.69,140.37,139.38,135.77,135.77,134.18,134.18,134.58,136.79,135.56,135.56,135.95,136.04,137.73,138.25,136.75,136.94,136.03,136.5,134.72,136.36,135.03,135.22,136.76,137.16,135.86,133.63,132.91,135.31,134.47,134.14,134.24,133.78,131.78,128.9,125.56,125.11,126.23,129.34,129.21,129.57,129.76,130.89,132.57,132.16,130.87,130.53,128.17,128.12,130.52,128.61,127.54,126.83,123.55,126.33,127.54,129.58,130.15,129.8,128.09,129.85,126.96,125.36,127.19,127.35,127.35,126.59,125.64,125.16,125.16,125.14,127.59,130.56,130.31,131.91,132.08,131.75,130.08,130.25,130.34,132.21,131.96,131.51,131.71,133.41,131.73,132.61,132.61,132.61,132.61,132.61,131.28,127.81,129.45,130.93,132.53,131.49,131.73,132.58,132.8,134.31,134.98,135.91,136.98,139.62,138.68,138.59,137.79,136.86,137.56,136.44,131.64,131.64,131.54,132.75,134.02,133.27,133.42,131.91,134.25,134.45,134.21,137.12,136.98,138.17,139.21,139.87,139.11,138.26,139.8,137.94,135.06,130.9,133.19,132.42,131.11,129.43,121.92,122.09,119.93,128.02,126.93,128.12,129.22,127.41,128.5,129.31,129.69,129.41,131.51,131.42,132.66,132.75,133.52,133.4,133.4,133.42,133.42,133.42,134.41,134.47,134.48,136.68,136.72,138.54,137.5,138.01,136.48,136.66,137.59,135.79,135.97,138.66,138.34,140.34,142.98,141.62,141.65,141.65,145.67,148.28,148.28,150.83,151.53,153.5,153.83,152.52,155.22,155.63,157.07,157.24,159.62,159.22,164.52,165.21,163.69,162.53,163.27,163.93,163.21,165.77,162.54,162.65,165.88,166.2,168.72,168.58,170.32,171.22,169.79,169.98,169.77,171.13,168.57,169.35,169.35,169.65,170.67,171.64,173.2,172.72,165.68,167.29,169.83,169.61,171.44,170.7,170.63,169.98,172.06,171.93,171.93,169.02,167.83,166.84,167.14,168.75,170.87,169.11,169.46,170.05,169.39,166.71,168.61,169.48,170.25,170.46,171.25,173.78,177.23,178.79,182.23,182.98,186.21,183.91,187.19,186.45,188.36,189.63,189.18,189.28,184.31,187.15,186.68,188.78,194.31,194.31,194.31,194.31,194.31,194.31,199.65,197.64,195.68,201.06,206.53,206.94,210.8,210.8,213.68,211.23,216.6,222.77,220.34,225.07,226.52,228.2,235.9,229.17,222.66,223.83,219.74,226.56,228.96,231.06,231.82,221.88,227.09,219.14,217.64,222.19,212.8,212.98,214.48,220.29,221.86,218.17,218.15,222.79,224.78,224.37,228.73,232.02,230.68,230.58,228.47,231.53,226.24,221.13,225.5,222.76,223.84,229.48,230.24,230.07,230.07,232.38,238.53,238.64,238.64,245.8,255.48,259.7,261.68,261.56,263.16,264.98,268.07,270.06,274.24,277.49,281.16,279.01,281.55,284.45,286.41,283.56,293.44,298.79,301.5,302.61,285.69,306.99,311.26,298.09,294.61,307.54,307.47,310.62,321.46,320.79,320.79,320.79,320.79,330.89,338.51,340.84,349.26,355.94,371.76,367.56,367.56,338.44,298.03,327.34,326.4,305.32,324.11,328.46,325.88,320.14,325.61,331.15,349.93,339.61,339.66,316.96,325.93,330.29,318.55,317.09,307.3,293.22,320.5,305.06,314.39,319.71,323.36,347.66,340.94,346.07,342.92,353.25,360.97,369.34,366.8,368.51,378.95,379.84,384.21,382.73,391.97,393.43,396.4,390.72,390.72,413.37,413.37,444.86,452.83,453.34,477.08,466.04,480.51,489.57,457.76,461.27,445.96,443.24,482.5,482.82,482.82,496.41,511.5,509.03,528.82,551.3,554.18,554.18,543.28,510.78,467.27,509.35,483.25,484.99,508.53,535.68,548.08,558.02,574.66,574.76,581.74,520.5,539.37,572.66,538.14,532.64,539.81,525.88,480.3,511.68,509.25,482.64,456.18,460.65,471.27,424.83,430.13,458.35,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64],"Nikkei225":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.73,99.74,100.85,100.38,99.55,100.02,100.76,102.23,103.48,104.35,104.87,104.88,104.99,105.69,105.64,106.2,105.92,105.83,105.83,105.66,105.7,105.69,104.29,104.13,104.13,104.13,106.74,106.34,105.98,105.98,105.15,105.49,104.24,105.07,104.02,102.49,102.93,103.9,104.25,102.91,102.35,103.82,105.7,106.05,105.51,103.73,104.31,103.04,103.06,103.38,103.02,103.54,103,105.57,106,104.81,105.89,105.4,104.78,104.87,105.58,105.57,105.53,105.05,104.09,104.15,105.65,106.58,106.06,105.57,105.38,104.89,105.24,106.8,106.96,106.82,106.65,106.72,106.34,106.34,105.99,103.73,103.97,104.93,103.42,104.61,104.69,103.85,103.01,103.41,102.47,102.75,101.31,101.68,102.4,102.13,101.07,100.38,99.88,99.99,100.34,100.41,100.4,101.44,102.83,103.94,105.08,104.88,104.58,105.19,105.93,105.93,105.93,105.93,108.38,108.1,108.41,108.74,108.32,108.24,108.51,107.94,106.52,106.72,107.2,106.84,107.55,107.93,107.24,107.22,107.2,107.05,108.19,109.92,109.88,108.84,108.87,108.46,109.02,108.45,108.4,108.32,108.03,108.64,109.32,110.21,109.71,109.55,109.67,109.79,110.18,109.66,110.15,109.13,109.25,109.13,109.4,108.92,108.56,109.39,110.02,109.49,109.49,109.6,109.6,108.95,109.06,109.74,109.49,108.82,108.71,109.22,109.38,108.73,108.54,108.87,109.39,109.11,108.69,109.26,108.93,107.53,107.48,107.48,106.43,107.61,107.48,107.33,106.07,105.64,105.59,105.87,105.43,105.97,105.95,105.48,106.26,107.02,107.27,106.27,105.61,105.45,105.66,105,106.48,107.73,108.22,107.9,108.46,108.46,110.58,110.64,110.84,110.57,111.12,110.75,110.41,110.93,110.89,111.13,112.3,112.36,112.38,112.71,112.71,113.44,113.75,114.15,115.24,115.79,116.23,116.38,116.84,116.89,118.19,118.78,118.25,118.43,119.89,119.91,119.91,122.13,122.78,122.78,122.83,124.95,124.82,124.58,123.56,121.92,121.92,120,121.76,122.01,121.27,122.11,122.7,122.7,122.85,122.55,122.49,123.1,123.8,124.31,123.7,123.24,120.81,122.56,124.26,124.96,124.56,123.98,123.63,122.86,124.76,124.57,124.7,124.56,124.76,124.96,124.71,124.81,124.12,124.01,124.01,124.01,128.05,129.19,129.19,129.92,129.59,129.16,128.86,129.19,130.48,130.02,129.45,129.7,129.74,131.42,130.42,128.94,128.74,128.72,126.88,125.83,127.94,126.79,123.56,117.72,117.91,119.25,116.48,116.48,115.73,115.24,116.93,118.32,120.66,119.44,119.69,118.41,119.26,120.68,121.97,120.22,118.35,115.39,114.63,116.67,115.78,116.4,116.95,118.89,119.67,118.63,118.78,118.08,117.02,116.47,116.47,117.62,112.32,113.12,116.13,114.57,115.27,116.87,116.52,115.99,116.14,117.91,117.49,118.09,118.73,118.14,118,118.64,118.95,119.02,120.71,120.89,120.73,120.33,121.36,121.02,121.59,122.39,122.39,122.61,122.42,122.42,122.42,122.39,122.62,122.07,122.55,123.98,124.56,124.3,123.75,124.41,124.91,125.31,125.08,123.6,122.23,122.3,122.47,121.8,119.95,120.95,120.78,122.44,122.79,123.25,124.33,123.63,124.23,124.63,125.11,123.87,124.49,123.55,121.36,122.87,123.62,122.66,121.69,121.71,121.33,121.32,121.5,118.82,118.68,118.3,117.38,118.69,120.13,120.92,119.48,120.87,123.1,123.1,123.64,124.17,124.01,123.65,122.01,122.63,123.19,123.04,123.73,122.81,122.86,123.91,122.64,122.71,122.61,123.46,123.36,123.11,121.47,119.07,121.79,120.96,120.89,121.32,120.93,121.04,121.82,122.08,123.12,124.2,124.28,124.47,124.58,124.56,123.7,123.64,123.01,122.5,121.52,121.88,123.47,123.14,124.32,125.81,125.81,127.58,128.96,128.97,130.03,130.03,130.42,130.93,129.63,131.4,132.08,132.22,131.35,130.61,129.56,129.56,127.85,128.05,123.06,123.63,121.32,122.84,124.43,123.43,122.74,123.2,119.9,120.34,115.86,115.4,115.21,116.89,119.41,118.14,121.17,119.3,120.65,120.31,122.5,121.21,121.32,118.81,119.01,118.78,118.1,118.87,117.58,117.16,117.92,117.92,118.82,119.59,120.81,121.28,121.76,122.98,120.04,119.41,117.13,118.1,115.59,115.2,117.68,118.84,116.44,117.16,115.03,114.33,111.09,109.86,109.86,104.35,105.29,109.37,109.03,109.03,109.03,109.03,106.56,109.16,110.06,111.28,109.84,110.91,110.91,111.98,111.36,111.14,112.58,112.87,112.34,112.19,112.08,113.16,112.49,112.57,111.98,113.16,113.25,113.77,113.55,113.71,113.04,110.77,110.77,113.66,115.19,115.16,113.86,115.93,116.05,116.75,116.93,116.72,117.28,116.85,117.43,116.5,117.68,118.88,118.35,117.65,116.88,114.54,115.08,117.14,115.98,115.96,116.85,117.58,117.49,117.72,117.72,117.82,114.27,116.73,116.46,114.58,115.52,117.17,117.15,118.28,118.35,118.8,118.55,118.77,118.14,118.27,119.14,120.77,121.05,121.36,120.34,120.94,121.03,121.26,120.94,121.52,121.26,121.26,121.26,121.26,121.26,121.26,121.26,119.43,117.68,116.59,116.28,115.44,114.76,115.43,114.74,115.76,116.04,115.88,115.94,115.22,115.04,115.39,115.82,114.42,114.09,112.23,111.19,111.18,113.18,113.17,113.77,115.13,115.51,115.11,114.57,115.04,115.07,114.25,116.22,116.92,115.81,115.96,115.45,114.87,116.24,115.9,118.38,118.51,117.87,118.23,118.46,117.31,117.48,117.3,117.9,118.13,118.13,117.31,116.95,114.65,116.94,116.67,117.78,118.26,118.52,117.98,117.76,118.26,117.24,117.35,114.87,112.87,112.14,111.76,112.18,112.68,112.68,111.43,112.52,111.16,111.23,112.02,112.64,112.32,112.37,112.82,110.37,111.44,111.56,111.46,112.79,112.33,112.36,112.49,114.87,115.49,116.13,116.53,117.65,118.54,119.78,119.78,119.85,119.63,120.09,120.28,120.28,120.38,119.96,120.11,119.19,118.52,119.22,118.64,116.26,116.63,116.44,117.6,116.88,117.41,118.75,118.75,120.97,122.42,122.31,122.53,122.84,122.84,123.25,123.93,124.2,124.57,125.15,124.44,124.9,124.48,124.48,126.67,126.95,127.09,127.43,127.1,128.13,127.04,126.06,126.95,127.56,126.89,126.1,125.5,125.91,126.89,127.33,127.68,127.52,126.89,128.18,127.36,126.03,126.93,127.22,127.64,127.53,127.43,127.61,130.87,130.48,131.1,130.38,130,129.74,129.77,129.82,129.56,130.33,129.86,128.87,128.87,128.87,128.87,126.41,128.43,126.41,129.32,129.93,129.93,130.88,130.29,130.38,130.97,131.2,130,130.91,129.63,129.8,127.16,126.47,127.36,125.17,126.41,125.14,125.75,127.03,130.05,129.8,129.03,129.03,129.99,129.8,129.04,128.14,126.35,127.48,127.9,127.4,127.4,123.14,122.17,119.56,115.18,116.27,114.85,114.94,116.19,113.04,107.31,108.23,105.77,101.1,94.96,92.62,92.67,91.12,90.17,90.17,92,98.56,106.48,101.68,105.62,103.97,103.05,98.41,97.07,97.08,101.2,103.23,105.43,105.39,106.22,103.74,106.98,106.5,105.08,108.39,107.15,105.03,104.25,105.84,104.93,107.77,107.7,107.7,110.01,106.88,106.88,106.88,106.88,107.18,109.93,111.08,110.95,110.41,108.49,109.16,109.68,111.31,112.19,111.96,111.07,112.99,115.88,116.68,119.39,119.18,120.19,121.62,123.19,123.64,124.55,126.26,125.79,125.97,122.42,121.51,117.29,123.02,122.33,121.78,122.45,122.23,122.84,122.76,121.26,122.64,119.82,121.42,120.51,120.64,121.52,123.74,123.19,122.24,122.73,121.43,124.12,123.04,125,124.04,123.64,123.75,124.66,123.94,123.94,123.94,123.75,123.43,122.01,121.69,118.27,120.91,122.97,122.65,122.12,121.64,121.64,123.93,124.44,126.65,126.87,125.82,125.57,125.9,124.64,124.86,125.21,126.91,126.88,126.43,124.65,126.05,126.05,126.64,127.83,126.41,125.78,126.79,125.47,126.58,127.51,128.34,127.77,127.88,127.03,127.26,127.26,127.26,127.18,125.77,126.41,128.08,128.23,126.3,126.3,125.46,126.99,127.66,127.6,128.82,128.67,128.34,128.57,128.71,128.06,127.53,128.95,128.38,128.78,127.88,128.11,127.99,127.94,127.57,127.1,125.17,126.9,126.9,129.08,131.31,132.51,135.32,135.67,138.09,139.03,138.29,141.13,141.72,140.16,139.64,139.06,139.06,142.54,143.25,144.56,145.15,144,145.93,146,146.05,145.73,144.62,144.18,146.09,145.76,145.19,145.63,145.38,145.76,146.03,145.79,145.53,144.01,144.49,145.28,145.21,146.29,150.18,149.5,149.5,148.49,147.95,147.39,149.75,153.29,153.29,153.43,155.02,156.34,155.36,153.85,155.98,155.38,156.65,155.97,157.01,155.51,155.99,153.61,150.7,153.03,154.5,156.05,154.39,156.78,160.1,160.73,161.05,161.05,160.81,163.88,165.97,165.02,164.71,163.52,164.28,164.28,161.64,164.34,157.79,161.59,160.2,161.02,157.6,157.24,156.58,158.13,158.18,159.13,161.89,162.16,163,162.96,164.61,162.29,158.93,157.96,154.74,156.51,158.94,160.07,160.34,158.95,160.1,162.63,163.91,161.77,161.96,161.84,162.16,160.91,162.07,161.36,161.48,161.7,161.71,158.53,155.3,159,158.09,158.67,157.93,158.27,158.27,156.96,156.96,156.96,156.96,159.78,159.93,160.8,155.85,153.33,149.52,152.99,151.58,154.75,152.77,153.07,154.26,154.52,155.55,156.03,155.52,158.79,157.22,156.97,157.69,158.3,157.66,158.08,157.78,157.22,157.75,157.7,158.86,160.38,159.56,158.08,157.78,152.59,157.35,157.3,157.3,158.34,158.24,156.96,156.84,156.38,156.8,155.79,156.04,154.53,153.17,152.21,155.63,156.44,155.85,154.05,152.55,150.64,149.2,150.07,150.07,150.07,151.62,152.37,150.25,151.35,148.63,151.34,150.58,150.27,151.05,151.55,151.55,151.92,152.92,152.61,152.41,149.93,149.4,150.28,148.62,147.16,149.78,151.07,151.03,151.13,150.58,151.38,153.02,154.99,155.49,158.68,161.57,162.97,164.41,163.47,165.51,165.86,167.08,166.21,165.19,166.15,166.15,162.55,161.46,161.46,164.78,164.73,164.43,160.94,160.44,156.73,154.95,151.56,149.96,150.78,152.8,155.25,153.79,153.3,155.53,158.35,158.12,159.15,159.37,156.39,156.92,155.8,158.56,158.51,157,157.39,161.5,160.82,160.82,162.31,161.31,160.74,159.53,158.56,159.49,161.3,162.21,162.38,161.73,161.24,162.04,162.2,162.2,159.63,160.7,156.63,154.08,151.56,152.18,151.19,152.69,152.14,155.01,157.22,156.48,154.92,156.02,154.89,155.04,158.34,155.5,152.19,155.35,155.59,156.88,156.79,156.22,158.36,157.47,156.84,156.84,156.84,159.62,159.79,155.19,155.14,155.14,153.74,156.7,155.2,153.21,154.35,153.93,149.63,151.29,149.93,150.29,147.8,147.15,142.56,145.54,147.09,147.51,149.99,148.4,149.48,148.44,148.63,150.24,150.88,150.88,147.52,146.35,149.59,148.35,147.75,146.6,144.09,144.09,141.48,144.23,144.51,146.24,143.78,144.78,141.56,137.39,135.05,134.65,139.95,137.08,137.87,138.08,140.34,145.19,146.14,146.14,148.3,152.75,153.13,153.35,152.23,153.91,152.68,151.56,150.71,151.1,151.38,148.99,146.48,147.01,146.11,143.46,146.23,148.02,147.59,145.99,147,148.27,150.1,147.66,144.85,145.45,143.74,146.26,146.26,146.1,146.1,146.1,146.1,147.1,143.38,142.55,142.8,140.27,143.97,144.62,145.23,146.6,143.83,145.66,147.09,145.71,145.33,144.93,145.89,149.1,148.61,149.58,149.34,151.23,152.07,152.23,153.81,153.87,151.57,147.02,145.07,143.41,143.99,141.43,140.39,142.98,142.45,142.57,144.32,146.38,147.35,146.02,143.78,141.29,142.47,143.94,142.22,144.31,144.45,146.06,143.47,144.24,145.14,145.93,145.93,146.87,150.79,151.46,152.07,150.89,150.65,150.98,151.53,151.45,152.5,150.32,151.13,152.16,153.49,153.89,152.53,151.55,151.55,155.51,157.28,157.26,159.19,157.66,157.6,156.86,155,154.24,155.14,156.03,151.87,153.6,153.03,150.69,150.63,150.46,150.5,149.43,152.89,153.7,155.48,155.88,151.54,151.86,150.18,150.18,150.83,148.79,147.92,147.92,143.99,144.75,142.58,143.94,141.29,142.81,147.04,147.74,148.78,147.72,147.72,143.82,143.8,142.93,147.58,145.86,147.93,148.49,147.12,146.49,146.95,148.45,149.44,148.96,147.66,150.28,150.78,150.7,150.7,148.17,149.96,151.83,150.99,149.51,153.97,152.33,152.48,152.69,152.15,151.99,152.23,153.16,153.16,154.62,154.07,153.42,152.68,152.36,153.76,151.32,151.55,151.91,150.82,150.21,151.99,151.67,152.29,153.38,152.81,149.96,148.38,144.73,143.75,144.4,142.92,143.85,144.08,143.49,142.15,142.15,142.15,142.15,140.09,140.66,141.49,141.49,142.59,144.07,144.09,142.29,140.67,142.39,145.95,143.84,144.65,146.57,148.71,149.24,149.06,149.17,149.44,148.87,148.97,149.27,149.86,150.86,150.82,150.39,150.27,150.74,149.41,150.37,149.82,150.88,149.88,149.98,149.66,147.65,147.65,149.55,149.39,149.51,149.9,149.8,152.14,153.83,154.22,154.95,155.93,153.32,151.62,148.29,148.33,147.14,148.9,146.79,146.79,149.63,149.37,149.18,149.68,149.91,151.9,151.35,152.76,153.56,154.1,151.51,149.66,149.91,150.54,152.11,152.98,153.39,155.22,155.34,156.12,155.84,156.11,155.61,155.76,155.91,154.8,155.02,157.2,158.65,158.84,158.84,158.84,158.84,157.71,159.3,158.64,158.67,160.09,161.39,162.57,163.94,166.55,167.83,169.35,168.64,167.15,167.79,168.42,170.15,170.66,168.26,169.68,171.73,175.51,177.08,173.85,172.37,175.77,176.69,179.87,182.51,182.41,183.62,181.79,181.89,182.9,181.21,178.58,178.13,177.25,180.83,181.04,180.8,183.87,182.07,181.61,178.53,176.44,175.36,175.43,174.02,176.61,176.45,176.45,177.01,179.2,176.99,175.98,178.14,178.04,177.96,179.18,178.46,180.71,182.37,178.18,175.19,175.37,175.71,176.38,175.43,176.9,176.9,174.65,175.62,173.05,172.28,171.33,171.96,173.54,174.38,175.89,172.27,175.25,175.56,176.14,177.7,178.19,179.44,179.97,181.08,179.72,177.63,176.87,178.55,178.17,180.68,182.67,182.67,181.09,179.9,177.43,176.51,178.02,176.04,176.35,173.63,173.55,173.01,170.17,166.3,169.28,168.84,168.84,172.94,173.98,177.02,176.04,172.46,174.54,174.55,171.22,170.29,168.87,169.21,170.34,166.7,168.83,167.22,168.1,172.15,174.05,174.05,178.18,175.8,175.23,177.84,177.42,177.51,178.11,182.6,182.08,182.96,181.88,181.7,182.23,182.23,183.18,182.21,181.99,181.52,182.42,182.12,181.03,178.55,182.2,179,176,178.63,178.92,179.37,178.06,179.61,178.46,180.96,183.45,180.53,180.69,181.15,181.44,183.48,182.71,182.3,182.3,182.3,181.34,181.83,181.83,183.93,187.62,190.94,193.81,195.58,194.04,193.27,193.2,195.91,199.09,198.93,197.35,197.4,194.76,196.26,196.47,197.67,196.17,196.97,198.04,196.99,196.76,200.81,201,201,206.81,205.39,207.87,209.66,209.57,208.99,208.43,212.99,212.99,213.73,213.76,213.59,213.36,217.42,218.5,218.43,218.4,215.72,216.21,211.48,211.35,210.8,211.4,210.86,216.49,217.92,217.92,222.35,222.74,220.16,220.07,222.06,218.82,219.91,216.83,217.02,214.92,216.67,212.41,214.34,216.67,215.62,214.87,215.31,213.72,209.57,206.8,207.44,201.93,203.95,204.57,209.51,204.98,206.65,206.65,209.22,208.5,208.29,208.29,208.29,211.56,208.11,207.41,208.25,207.98,208.95,209.11,212.02,211.3,212.83,212.17,210.37,213.02,210.53,211.91,211.67,210.04,207.3,209.66,212.03,211.57,209.68,210.84,210.73,212.66,213.19,211.78,210.93,211.44,207.56,209.63,210.12,210.46,210.26,211.39,213.4,216.09,214.31,215.63,215.89,218.31,221.07,222.88,222.87,222.15,226.51,227.88,230.02,224.39,224.39,224.85,223.88,218.59,218.25,215.72,215.69,213.3,206.3,205.19,209.56,209.87,213.01,207.69,195.62,171.37,188.9,191.15,189.74,190.8,190.8,197.38,198.52,200.07,207.35,203.68,207.35,206.74,208.16,208.99,207.61,208.58,209.03,208.98,210.54,210.82,210.75,201.82,199.69,198.24,197.29,196.98,194.04,200.65,199.28,199.28,197.22,198.18,202.41,205.5,205.5,206.68,206.3,212.05,216.97,206.57,210.56,205.96,210.01,210.47,214.27,212.11,213.97,214.53,215.75,215.75,217.41,213.44,211.97,212.35,212.21,209.25,207.58,207.79,206.54,210.31,211.93,213.97,212.9,207.3,207.3,209.59,215.07,214.53,215.18,215.36,214.5,210.94,209.92,210.51,208.21,209.26,208.93,207.15,208.55,211.26,209.41,207.74,208.91,208.14,209.8,213.81,213.96,214.61,212.95,213.33,214.46,214.48,217.08,215.02,214.95,214.44,212.9,211.44,210.83,213.33,212.66,213.16,215.55,219.43,217.33,217.33,217.33,217.33,214.13,218.36,217.8,215.75,213.49,213.49,209.59,209.43,210.13,209.47,211.92,212.61,215.97,217.68,217.53,215.54,212.55,214.71,215.25,215.57,209.84,211.36,211.54,212.82,211.29,211.37,211.37,212.26,214.97,213.27,213.4,213.93,213.35,210.7,211.24,211.24,208.3,207.78,208.4,202.41,205.84,203.36,203.84,205.4,200.94,201.71,200.43,200.57,200.42,201.85,203.72,206.16,205.66,205.66,205.25,204.87,205.81,207.16,205.92,202.21,194.03,194.07,194.62,189.23,184.02,169.62,179.84,172.76,188.53,182.96,185.12,186.67,184.78,187.27,189.19,186.74,186.42,189.95,190.88,194.51,195.24,195.24,196.36,198.58,200.64,200.64,200.64,200.36,201.17,204.3,205.07,208.01,207.7,205.67,205.67,204.28,204.44,203.19,201.48,202.43,204.45,205.5,205.49,209.37,206.82,204.12,203.99,205.63,204.58,205.6,207.49,208.16,209.3,207.95,206.1,208.7,209.93,211.83,209.67,209.2,208.94,211.31,212.14,215.64,218.72,220.56,217.83,216.61,216.74,216.87,215.66,216.21,216.93,215.98,215.56,214.96,216.15,216.07,217.36,216.92,216.92,216.68,224.28,227.85,225.83,223.34,221.58,221.47,223.73,222.26,219.49,220.9,222.23,223.67,227.82,227.82,232.71,235.74,232.33,236.31,238.14,237.22,233.64,232.12,232.25,233.2,230.95,231.63,233.31,232.71,229.83,230.49,228.46,231.96,234.35,237.75,236.75,238.81,241.72,243.88,243.88,244.61,244,246.79,245.39,247.83,247.83,248.57,249.25,247.07,245.38,244.77,242.69,244.79,249.33,261.18,261.21,260.04,264.64,261.97,261.97,255.2,259.7,263,259.21,267.94,268.65,268.61,264.98,268.56,275.17,273.57,279.5,279.6,285.51,285.51,280.53,273.53,277.19,273.88,277.34,276.97,278.17,279.36,274.43,274.14,265.31,264.41,271.42,264.89,264.89,265.07,269.98,273.29,273.76,268.58,268.58,271.64,277.98,275.06,275.55,275.95,275.66,273.19,276.93,273.29,269.02,269.72,266.94,269.69,274.57,274.63,274.25,274.6,276.47,275.25,274.23,274.23,274.23,282.36,286.09,283.07,278.46,282.94,282.94,291.71,296.03,294.77,293.82,291.9,288.67,287.49,292.47,293.33,288.09,290.54,290.67,290.77,290.48,286.84,298.09,295.77,293.18,295.55,307.05,314.05,314.05,314,310.19,309.46,308.15,311.29,313.06,309.56,309.56,312.26,319.13,320.06,320.59,316.27,306.58,295.51,301.13,303,287.24,295.52,299.75,296.63,293.18,292.81,292.54,300.92,290.75,290.75,280.63,284.65,292.8,292.01,290.75,282.65,278.17,292.75,285.8,289.39,290.97,291.06,306.74,304.49,310.1,307.8,315.29,316.69,324.23,318.55,320.45,323.31,324.6,322.17,325.31,329.78,326.4,326.4,322.96,324.2,324.2,324.2,324.2,342.29,341.64,340.02,341.79,344.68,341.31,334.53,331.3,329.85,325.79,336.03,345.04,354.95,354.07,354.09,352.42,361.33,364.63,363.54,372.62,367.55,362.74,348.78,356.36,349.62,349.83,359.65,377.61,378.08,380.8,387.07,388.14,394.15,380.18,376.83,394.22,377.85,378.43,381.67,383.92,374.43,379.93,379.9,371.83,364,369.04,373.47,366.31,369.04,374.53,364.09,349.41,349.41,360.8,360.17,361.84,351.97,353.72,339.74,334.67,337.03,350.62,347.31,348.41,361.17,357.81,357.4,364.82,364.82,367.84,372.11,374.32,377.08,367.5,355.87,360.72,359.63,356.97,358.76,360.97,360.26,361.75,361.24,360.71,350.42,349.81,354.2,361.72,355.56,354.87,355.57,348.7,345.88,345.83,348.22,349.39,354.19,354.19,354.19,354.19,356.89,361.52,358.87,356.71,363.64,375.64,372.12,381.04,385.05,381.52,376.11,376.05,376.05,369.22,369.04,350.96,355.86,353.64,349.05,352.03,342.69,341.52,338.78,344.66,348.39,352.24,344.78,343.64,343.64,338.78,332.72,312.88,320.18,329.36,333.65,331.32,333.08,325.01,320.64,321.54,323.83,307.44,307.44,319.47,310.57,313.23],"S&P500":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.13,99.87,99.52,99.56,100.14,100.48,101.8,102.02,102.63,102.51,103.18,102.34,102.74,102.56,102.76,103.14,102.88,102.69,102.82,102.82,103.05,102.19,102.16,101.69,101.69,102.55,103.14,103.06,103.42,103.05,103.05,103.34,103.12,103.31,103.31,103.01,103.19,102.81,103.16,102.88,103.56,104.39,104.31,104.22,103.6,103.5,103.53,103.59,104.35,104.13,104.15,104.22,104.82,105.2,105.75,106.17,106.7,106.61,106.79,106.79,107.43,107.32,107.36,107.52,107.63,107.35,108.82,108.18,108.24,107.88,107.57,107.32,107.41,107.76,107.8,107.44,108.34,108.16,108.02,107.8,106.46,106.66,106.55,106.46,106.35,107.12,107.24,107.56,107.31,107.14,107.2,106.87,107.07,106.99,107.06,106.91,106.5,105.78,105.78,106.69,106.38,106.2,107,106.68,107.83,108.49,108.44,108.5,108.29,108.48,108.6,108.47,108.53,108.97,108.98,108.87,108.99,108.75,108.59,109.11,109.04,107.05,107.45,108.18,108.73,108.93,109.21,109.69,109.72,109.72,109.59,109.54,110.37,110.78,110.65,110.34,110.51,110.54,110.45,110.34,110.84,110.73,110.48,110.51,111.43,110.69,110.62,110.57,110.75,110.78,109.89,110.85,109.9,110.07,110.32,110.32,110.48,109.45,110.15,110.25,110.17,110.97,111.18,111.7,111.69,111.76,112.36,112.34,112.3,112.18,112.51,112.54,112.43,112.28,112.2,112.47,112.53,112.28,112.5,112.68,112.41,112.37,110.74,110.88,112,111.94,112.1,110.37,110.17,110.29,111.39,111.01,110.78,110.96,111.02,111.11,111.62,112.26,112.48,112.48,111.63,111.98,111.96,111.8,113.01,113.39,113.47,113.35,113.56,113.72,113.85,113.92,113.57,113.65,113.4,113.4,113.87,114,114.43,114.87,115.12,115.26,115.91,115.79,115.58,115.85,116.06,115.86,115.96,116.17,116.24,116.33,116.37,116.96,116.5,116.69,116.14,116.29,117.23,116.86,116.97,117.15,117.17,117.54,117.69,117.66,117.83,117.39,117.29,117.4,117.13,116.48,117.44,117.13,117.28,118.05,117.96,117.96,118.2,118.15,119.32,119.27,120.25,120.01,119.88,119.43,119.42,119.77,120.43,120.81,121,120.94,120.45,121.53,122.18,121.79,121.69,121.93,121.87,121.87,121.75,121.84,122.07,121.43,122.44,123.22,123.72,124.59,124.8,124.96,124.82,125.7,126.55,126.55,126.1,127.29,127.08,127.64,128.67,128.95,128.88,128.96,130.48,129.6,128.19,128.25,128.17,125.45,120.31,122.41,121.8,117.23,118.98,120.63,120.95,122.57,124.05,124.09,124.09,123.37,122.69,122.81,124.78,126.25,124.64,123.26,121.62,122.23,123.58,123.91,123.85,124.4,126.56,126.4,125.6,124.88,124.78,124.99,123.22,123.4,123.17,120.07,117.56,120.75,118.66,118.32,119.95,119.95,117.27,118.75,120.12,120.94,118.29,118.69,120.67,120.01,121,120.65,121.62,122.92,123.02,122.32,121.28,121.28,119.66,119.88,121.13,121.26,120.27,120.58,119.71,119.44,120.97,121.39,121.36,122.53,123.68,123.89,124,123.15,123.65,123.55,123.22,124.13,123.74,124.14,123.89,123.6,123.6,122.17,123.72,122.87,124.2,124.76,124.85,125.92,125.83,126.22,126.36,126.58,126.07,126.38,126.25,125.98,125.47,125.69,124.89,125.12,123.41,123.68,122.61,123.37,123.47,123.84,123.23,123.23,124.29,125.35,126.45,126.89,125.99,127.1,127.23,127.1,127.61,127.88,127.38,127.26,127.49,128.1,129.27,128.87,128.03,127.29,127.91,127.78,128.41,129.01,129.46,129.83,129.79,129.61,128.68,128.17,128.99,128.01,129.02,129.45,129.76,130.03,129.98,129.76,130.57,131.57,131.6,132.35,131.77,131.78,131.78,131.57,131.2,130.72,130.43,130.68,131.17,131.21,131.91,131.94,131.21,131.91,132.08,133.11,133.06,132.59,132.42,131.99,132.35,132.35,132.83,132.78,132.87,131.79,131.06,131.01,130.82,126.52,123.92,125.68,124.94,127.62,127.59,125.76,125.71,125.17,124.48,120.64,122.88,120.76,119.96,121.84,123.16,124.46,123.68,124.37,125.15,127.8,127.48,126.31,123.82,123.64,122.7,124,124.28,122.21,119.99,120.36,120.36,119.57,121.43,121.82,124.62,124.35,125.36,126.74,122.63,122.63,122.45,119.59,119.8,119.76,120.41,120.38,118.09,115.63,115.64,113.86,112.07,109.76,106.78,106.78,112.08,113.04,112.9,113.86,114,111.18,115,115.8,116.93,117.41,117.94,117.92,117.3,118.56,118.82,119.72,121.3,121.3,119.58,119.85,120.01,121.03,120.08,119.91,121.77,122.82,122.93,123.76,124.34,124.07,122.91,122.99,123.08,124.66,125.04,124.71,126.07,126.07,126.25,126.48,126.03,126.84,127,126.9,126.83,126.47,127.34,126.85,126.7,125.88,124.85,124.59,126.41,126.79,127.67,127.56,128.19,128.67,128.65,128.27,129.67,127.21,127.1,128.01,127.42,127.87,128.74,130.23,130.23,130.51,130.78,131.39,131.52,130.73,131.18,131.18,132.05,131.97,132.04,131.74,131.94,131.94,132.08,133.24,132.95,132.9,133.53,133.67,133.8,132.79,132.51,133.79,133.19,130.99,130.78,130.39,130.87,127.71,128.74,129.49,130.64,129.88,129,130.1,129.73,128.18,128.36,128.36,127.28,126.4,126.67,125,124.65,127.32,128.36,129.15,130.5,131.11,131.07,130.8,131.34,131.12,131.25,132.52,132.92,134.18,134.01,133.77,132.5,132.34,132.85,133.61,134.64,135.03,136.07,136.07,135.82,135.16,135.33,135.94,136.25,136.88,136.91,136.44,135.55,136.04,135.19,135.58,136.51,137.15,136.42,137.43,137.21,136.86,135.37,134.15,133.17,129.21,130.89,130.99,133.45,132.56,130.93,132.91,129.02,129.34,131.2,132.79,131.74,132.82,132.76,129.31,130.73,130.31,131.17,132.83,132.92,132.92,132,133.43,135.17,135.29,135.28,135.32,136.3,136.69,136.59,136.16,136.52,136.56,136.57,135.9,135.88,134.74,135.57,135.24,134.52,135.2,133.54,131.15,132.2,134.08,133.48,131.4,132.6,133.45,134.91,134.72,136.06,135.79,136.16,135.63,136.56,136.07,136.46,136.72,137.28,138.05,137.93,138.38,137.96,139.3,139.81,139.65,139.74,140.13,140.48,140.21,140.43,140.53,140.65,141.73,141.8,141.72,141.18,140.96,141.27,142.33,142.64,143.23,143.23,142.66,141.43,140.49,141.38,141.59,142.88,142.43,142.28,142.69,143.91,143.92,144.95,145,144.94,145.58,146.3,146.43,146.4,146.4,147.15,147.16,146.31,146.74,147.97,146.92,147.44,147.03,147.75,148.73,148.31,149.34,149.12,149.4,150.65,151.23,151.23,150.83,150.87,151.04,149.68,147.32,148.8,148.67,149.14,146.5,147.56,149.77,151.46,151.96,151.14,152.25,152.51,153.49,153.24,153.52,153.52,153.08,153.8,153.21,151.6,146.52,142.08,141.54,135.29,134.18,140.36,136.41,142.17,137.34,135,124.75,130.91,124.51,112.67,123.13,108.38,114.87,108.92,109.43,104.69,101.62,111.16,112.44,119.46,115.43,119.3,117.39,112.21,114.77,113.03,120.98,120.79,124.9,126.71,126.71,125.43,129.27,126.42,127.15,130.56,128.23,124.29,127.14,127.07,128.84,130.74,130.05,133.51,132.28,128.57,129.11,130.28,129.37,130.86,133.07,133.09,130.36,128.08,129.56,130.07,134.16,132.76,134.97,133.92,134.23,134.23,135.88,137.9,137.61,138.27,138.79,139.93,141.84,141.36,145.07,146.81,145.67,144.89,136.35,138.13,139.28,141.92,141.41,141.5,140.7,141.61,142.22,138.54,140.06,136.67,138.68,140.81,141.52,142.16,142.16,144.42,142.86,143.98,143.16,144.66,143.31,145.23,146.55,146.05,146.46,147.7,147.94,148.79,146.96,146.05,147.13,146.18,148,147.44,148.57,149.64,150.18,151.14,152.12,152.21,152.63,151.41,153.53,153.22,153.19,153.61,153.96,153.28,153.77,154.3,155.85,156.41,158,158.26,159.33,158.98,160.18,162.64,156.93,155.65,155.65,151.33,154.38,151.66,151.74,153.68,154.48,153.77,152.47,150.77,149.02,150.59,147.02,147.46,149.81,152.23,151.49,152.74,153.55,152.08,154.82,152.65,155.31,156.55,157.93,160.52,159.51,158.45,158.21,158.23,155.65,156.38,156.04,156.85,157.39,154.47,154,148.57,150.34,148.52,150.35,153.02,156.4,159.44,159.4,161.26,161.03,162.27,160.65,162.83,164.73,163.94,162.05,162.69,161.58,162.49,165.12,164.86,164.86,165.25,164.49,166.34,166.64,166.54,168.01,167.69,168.15,166.82,166.6,166.39,165.67,167.81,168.1,169.07,168.48,167.82,167.47,167.6,168.19,168.19,169.66,169.28,169.51,170.6,168.08,169.27,170.24,172.76,173.71,172.57,172.65,173.04,172.39,171.15,171.15,172.54,174.95,175,174.48,175.11,174.85,170.36,172.02,168.7,171.41,173.79,173.96,175.85,176.54,177.84,177.64,177.58,177.88,178.72,178.72,178.61,178.56,177.77,177.44,176.07,176.29,178.29,173.92,173.1,177.22,175.78,173.49,171.16,174.5,173.56,176.02,177.08,178.92,179.1,180.27,179.98,180.5,177.84,177.73,178.98,177.61,176.64,177.57,180.52,180.36,179.79,180.44,182.58,182.58,185.21,185.03,185.31,186.09,187.53,187.49,188.11,187.34,189.42,190.1,189.09,187.8,189.55,187.81,189.86,190.2,190.16,190,191.28,189.9,190.43,189.15,189.29,190.83,192.24,190.23,188.58,184.54,186.79,189.57,189.09,187.48,186.93,188.9,188.76,190.63,190.22,190.58,190.8,190.95,190.95,190.85,191.13,190.44,192.12,191.96,192,191.65,192.54,192.91,193.26,192.88,191.84,191.75,189.24,191.89,192.87,192.66,193.78,194.43,194.88,194.93,195.19,196.21,197.68,197.68,197.28,197.94,196.25,198.46,199.15,198.45,198.68,198.03,196.54,193.42,196.35,197.97,198.37,200.38,200.86,199.91,199.87,200.71,199.63,199.26,200.9,199.96,201.17,201.5,201.31,201.51,201.77,202.61,202.93,203.46,202.03,199.86,200.11,201.74,203.46,203.76,204.21,203.02,204.81,205.69,205.42,205.48,206.06,205.99,205.99,205.3,205.02,204.08,202.5,202.97,201.8,203.51,203.19,201.34,197.92,197.76,199.65,202.07,202.36,201.8,197.69,198,195.64,197.89,195.32,197.38,198.19,199.83,199.45,198.08,197.6,198.2,201.58,203.09,203.77,205.28,206.03,206.65,206.42,207.41,207.78,206.73,208.76,209.17,209.55,210.32,211.68,212.56,213.36,213.55,212.8,211.05,211.17,212.69,212.69,213.51,212.95,213.68,213.38,212.69,213.05,213.54,213.54,208.68,211.44,207.43,204.98,207.89,206.13,208.55,212.87,213.52,211.99,214.02,212.06,210.48,213.92,212.05,209.87,207.48,211.16,213.31,214.64,214.64,217.61,217.39,217.7,217.05,216.48,217.86,217.72,213.5,213.29,212.43,212.12,214.06,214.67,211.61,211.78,211.78,207.89,205.87,203.6,199.75,200.3,197.87,197.57,196.51,201.29,205.09,206.5,208.45,203.36,204.41,203.65,205.36,208.35,204.57,200.69,199.92,203.07,203.25,198.95,197.52,197.52,195.52,191.92,194.79,199.15,198.66,195.59,199.23,198.19,196.61,190.81,189.43,194.3,193.46,190.96,189.54,193.6,197.93,200.37,202.71,202.62,204.91,202.4,205.3,206.34,207.82,210.36,209.04,205.77,206.47,208.14,205.53,203.53,204.4,203.85,200.41,199.73,201.96,199.51,199.51,199.47,202.67,202.54,199.56,194.02,195.13,189.63,190.03,194.73,187.67,188.73,189.65,195.31,188.35,187.28,181.28,181.72,178.73,178.5,182.76,182.04,185.71,178.21,177.17,177.2,180.48,179.02,180.71,184.3,188.86,188.86,187.68,186.27,189.71,186.61,187.19,188.97,186.93,182.49,177.17,170.3,169.66,172.14,166.54,166.91,166.91,170.99,170.77,172.4,177.67,177.14,173.57,173.45,171.93,173.74,173.74,174.02,174.64,177.25,177.11,175.06,173.45,172.67,172.16,175.46,173.99,178.8,179.85,181.63,179.93,180.17,178.09,182.75,184.97,187.59,187.06,185.82,188.72,188.58,188.27,188.04,187.24,191.23,191.09,194.4,195.17,195.54,194.12,194.56,192.05,187.94,187.52,188.07,190.72,184.3,183.07,181.05,179.63,180.17,178.24,178.24,177.51,180.76,181.96,184.74,186.69,178.62,179.22,177.2,175.92,177.13,175.13,172.13,170.68,167.74,166.01,165.66,168.92,165.35,162.86,167.07,172.18,171.83,170.07,165.31,164.07,163,162.47,166.68,162.74,167.05,168.96,167.83,166.5,170.45,172.47,175.28,173.98,172.92,177.18,175.86,175.14,170.76,168.95,171.25,172.9,173.87,170.26,179.69,181.36,179.73,181.3,179.8,179.25,180.1,179.4,181.84,182.91,182.91,182.86,180.04,179.75,185.31,185.15,184.93,181.62,179.01,178.67,180.02,178.7,181.25,182.57,181.46,176.94,174.97,173.39,173.57,176.16,173.61,174.63,174.63,173.92,171.83,174.83,174.39,174.39,173.69,175,172.96,176.91,176.77,178.01,180.3,180.91,181.63,181.63,181.27,178.45,177.08,180.43,182.58,182.45,182.41,184.42,184.88,182.48,185.16,187.09,189.84,187.87,186.72,189.12,187.03,185.38,185.78,187.91,187.86,188.38,185.78,185.27,185.27,181.56,181.27,182.24,180.32,180.87,180.32,179.47,180.83,183.75,183.88,181.06,181.31,177.97,175.39,175.12,178.01,176.77,179.87,177.89,179.48,181.81,178.81,179.35,180.36,180.66,180.37,182.94,183.98,186.64,187.33,186.25,185.78,186.45,186.45,186.63,186.62,185.85,188.32,187.93,188.55,188.71,188.69,187.57,187.74,187.9,184.93,184.22,187.82,189.37,189.3,187.11,185.8,184.46,187.86,187.95,187.09,187.93,187.61,187.31,187.87,186.67,188.89,190.67,190.4,190.43,188.29,186.91,188.55,191.01,191.01,191.01,189.84,191.71,194.5,194.11,194.57,193.83,195.03,195.25,197.07,198.44,198.6,201.02,200.28,200.28,199.33,198.29,199.02,197.5,196.61,198.86,198.79,199.68,202.13,202.37,202.37,201.97,200.37,199.8,200.28,201.63,203.12,204.84,204.63,205.42,206.88,207.37,205.97,206.04,206.87,207.45,207.42,206.08,208.12,208.43,207.87,204.99,204.47,203.39,205.22,204.36,202.92,202.97,202.75,203.92,201.56,200.04,198.5,198.47,199.83,199.28,201.48,198.77,200.1,201.36,204.28,205.06,204.73,205.1,205.1,204.24,202.82,202.17,202.45,203.82,202.66,202.91,204.62,202.13,202.28,201.84,199.94,196.66,196.21,197,194.1,194.14,195.29,194.76,194.77,192.1,193.66,193.4,195.69,196.92,197.95,198.8,197.56,196.56,198.65,198.63,195.96,194.3,191.86,191.53,192.93,190.16,187.91,187.01,189.25,190.48,192.48,196.11,197.95,198.3,198.86,199.06,197.45,200.54,200.37,204.19,204.52,204.76,205.02,206.54,206.12,206.96,206.96,207.08,206.68,206.88,206.68,207.47,208.68,207.55,207.44,206.63,208.27,209.13,209.95,210.91,213.79,214.36,214.34,215.31,216.57,213.39,215.59,215.95,215.95,216.86,217.17,217.26,216.64,215.41,213.69,212.96,213.34,216.36,216.04,217.26,217.11,217.28,217.28,216.47,215.25,217.15,219.82,220.3,220.95,221.12,222.29,222.14,223.82,223.69,220.08,222.83,225.22,224.5,225.02,226.87,227,228.3,228.09,224.97,227.12,228.45,227.35,227.35,225.98,226.27,231.05,231.13,230.25,230.65,230.26,231.47,233.32,233.04,230.67,231.85,234.24,232.71,232.45,235.06,234.6,233.93,232.41,233.88,235.2,237.3,238.07,237.73,237.01,236.34,238.38,238.65,238.65,238.17,236.44,236.7,233.78,236.38,236.29,236.63,234.39,236.14,232.7,229.9,229.43,228.1,227.6,225.61,227.58,230.3,230.35,229.29,231.64,232.37,228.72,227.93,230.01,232.9,235.3,235.62,235.62,236.82,237.21,237.15,238.3,241.09,240.59,240.87,241.09,241.69,241.04,239.26,240.94,240.94,241,239.22,237.79,239.7,239.97,240.33,243.17,243.13,242.86,243.48,244.14,246.22,246.8,246.7,248.59,249.22,249.22,248.59,248.2,247.44,248.41,248.8,249.03,248.01,248.67,250.21,251.49,251.49,252.86,253.11,253.3,255.89,253.64,255.04,255.76,257.4,253.81,251.83,250.03,252.73,252.34,246.5,245.23,247.95,248.15,246.92,250.82,247.38,242.84,235.56,238,236.16,241.6,242.73,242.74,246.83,247.77,251.77,252.27,254.72,254.22,255.29,253.01,255.92,255.11,255.52,253.99,253.98,256.54,256.54,251.12,250.72,249.96,245.65,248.49,249.6,252.26,254.15,255.53,255.85,255.92,255.18,259.51,259,259.73,260.38,259.9,260.95,260.62,261.73,259.29,259.32,258.89,261.21,258.7,261.21,263.07,262.52,264.11,266.15,264.12,265.36,265.31,266.37,265.88,265.76,263.31,263.88,263.8,264.5,264.93,264.05,259.14,260.2,259.46,262.65,269.29,271.29,272.31,272.58,271.79,271.85,270.21,266.64,267.68,268.74,268.75,270.18,271.12,271.94,273.5,272.46,272.46,273.98,274.66,274.78,276.44,275.93,276.61,274.91,274.1,276.34,274.84,274.83,275.88,274.81,266.71,266.48,269.37,271.34,274.33,274.33,274.22,271.19,268.29,267.14,266.54,269.9,271.4,268.38,268.8,268.8,264.66,265.08,265.38,270.24,269.67,272.36,272.36,274.75,276.44,277.91,277.11,273.07,275.59,274.3,275.75,274.36,272.27,274.23,275.31,276.31,273.69,275.53,275.63,274.87,277.74,277.72,277.72,278.4,279.06,277.85,273.11,271.75,270.48,270.52,266.23,270.45,265.69,262.44,265.37,260.64,262.08,255.01,253.08,254.31,250.78,256.12,257.76,255.01,257.77,257.2,257.42,261.96,262.37,259.44,258.58,253.48,254.88,255.85,257.57,245.1,230.46,229.92,226.31,247.85,239.27,243.6,245.53,245.11,239.62,239.94,239.94,234.28,240.16,244.17,249.11,250.95,251.11,252.57,252.94,254.53,258.28,256.63,254.66,255.77,257.25,257.07,265.44,267.36,267.64,268.74,270.62,270.86,269.81,265.46,265.34,263.56,263.56,268.95,267.45,268.53,268.5,269.6,271.17,271.19,269.76,272.53,272.78,274.28,273.52,274.57,271.47,274.02,271.73,271.65,271.65,271.05,273.66,276.7,276.7,278.92,280.37,281.82,281.51,282.84,285.2,285.2,282.96,282.76,284.47,285.25,284.31,284.71,283.59,284.49,286.02,285.99,286.39,286.58,288.82,289.02,290.17,290.22,289.36,289,287.93,283.32,287.5,286.1,288.19,287.96,290.2,289.48,292.76,293.71,293.79,292.94,292.91,291.2,290.49,289.33,293.72,292.47,293.68,294.38,295.31,293.42,293.42,291.39,292.87,295.32,294.38,295,295.8,296.68,299.2,299.05,300.46,300.07,299.78,301.22,302.69,304.02,302.35,301.49,299.98,301.75,302.55,303.78,304.82,305,305.02,306.14,304.97,306.75,305.9,297.61,302.25,301.78,302.99,301.09,302.67,305.9,305.91,304.28,306.05,308.47,312.26,312.98,312.96,309.86,310.68,311.21,307.56,308.68,305.23,305.62,310.32,310.97,311.16,306.01,305.86,303.05,300.55,301.68,296.98,299.9,304.54,307.3,309.42,309.42,311.08,309.42,310.18,311.11,311.44,312.05,310.96,310.69,312.79,313.44,310.09,309.6,308.86,305.28,307.7,310.42,312.41,313.84,314.85,314.85,314.75,313.65,313.22,310.92,311.51,313.48,315.43,314.34,314.37,316.4,316.9,316.29,314.6,315.41,315.21,315.21,308.71,312.28,314,314.1,315.67,316.96,316.94,316.53,315.16,316.86,314.2,312.61,308.78,314.86,316.34,315.29,315.27,310.34,310.49,310.49,310.81,312.54,311.66,313.82,310.56,312.94,315.49,313.79,312.43,312.56,309.6,312.01,310.24,306.13,308.67,308.01,307.75,303.06,301.23,304.28,305.04,300.89,300.06,295.52,298.9,297.78,299.4,294.19,289.27,288.13,296.52,298.64,298.98,298.98,300.3,300.53,308.07,309.97,309.62,312.77,316.45,318.98,319.81,323.66,322.89,320.84,324.2,322.86,325.43,325.83,324.24,324.11,327.43,328.39,327.05,329.71,334.52,333.24,336.05,336.68,336.14,338.11,340.7,336.49,336.24,333.99,337.6,338.18,339.44,339.44,341.51,341.57,343.53,344.28,345.18,345.63,343.08,344.47,335.36,336.36,335.49,330.06,335.84,337.53,343.11,341.16,337.01,340.67,340.67,339.41,334.53,334.2,334.17,334.01,337.94,340.61,339.88,339.88,339.88,342.34,340.82,339.86,342.62,344.07,341.34,342.62,343.93,342.18,338.72,338.07,341.06,340.6,336.48,336.64,336.7,337.41,332.29,337.81,340.18,345.21,351.39,350.8,350.18,352.34,352.14,351.01,351.93,354.22,353.62,351.77,349.35,350.09,347.05,348.56,347.59,348.69,348.62,351.13,350.26,349.1,346.61,348.21,351.89,350.57,350.57,348.52,346.84,344.81,347.77,346.09,344.54,343,346.9,347.48,352.67,352.66,350,349.91,351.7,348.99,348.4,347.53,348.2,350.76,353.09,355.13,354.35,352.7,354.79,354.6,354.52,350.59,351.73,347.88,349.31,350.3,352.32,348.07,346.26,348.67,350.75,351.72,350.65,344.28,342.52,343.77,349.21,334,335.05,342.91,341.59,346.06,344.84,343.44,336.85,333.4,332.63,325.92,313.86,328.71,327.07,326.23,326.23],"SK하이닉스":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.53,100.7,103.76,104.23,104.23,106.1,106.22,108.57,106.81,106.34,105.52,107.63,107.04,108.92,105.99,105.99,105.63,106.81,108.69,107.16,107.16,106.46,104.93,104.93,107.51,110.92,109.15,110.21,112.68,116.31,116.78,121.13,118.78,118.08,115.73,115.73,114.67,116.43,115.38,119.25,121.13,121.36,125.12,125.12,125.12,126.06,126.76,123.94,126.06,126.06,125.12,128.17,123.71,117.37,119.01,113.73,112.44,116.43,118.31,117.14,119.48,118.78,117.84,111.5,107.98,109.62,109.62,111.97,110.56,115.85,114.55,112.68,112.68,115.49,119.72,118.08,114.55,115.38,109.74,111.74,111.62,114.2,113.73,116.2,119.01,119.25,120.42,119.48,118.54,121.6,119.72,118.08,115.96,116.9,115.02,114.67,115.02,116.78,116.9,115.49,117.84,117.02,120.66,122.07,123,123,126.06,125.82,126.76,126.76,130.05,130.05,131.22,131.22,133.57,133.57,130.52,132.39,129.81,130.52,129.81,128.4,130.75,127.23,131.46,129.34,130.99,130.99,134.04,135.92,134.74,133.8,132.39,134.04,131.69,131.69,132.63,133.1,136.85,134.98,138.03,139.2,142.25,142.02,147.42,150.23,152.11,152.58,152.58,158.45,162.44,157.75,160.8,158.22,155.63,154.46,159.62,159.86,156.34,157.98,161.97,161.74,165.73,166.9,167.14,166.2,166.67,167.37,167.14,171.36,165.26,156.81,160.56,151.64,154.93,153.76,159.62,153.76,150.23,150.47,155.63,150.7,151.17,144.13,152.82,152.82,155.16,155.87,157.28,157.75,160.09,159.62,159.86,160.56,159.39,158.69,160.8,161.03,161.27,159.86,164.08,168.31,167.61,170.42,173.24,175.35,177.7,180.28,181.22,187.09,185.92,189.44,195.07,195.07,202.58,202.58,193.43,195.31,194.6,194.6,194.6,194.6,194.6,194.6,194.6,208.22,209.15,207.75,202.11,197.65,196.01,189.91,185.45,190.61,198.83,192.02,191.78,184.74,184.04,187.32,192.96,200.23,195.77,198.12,196.01,193.43,195.31,193.43,192.49,193.19,195.77,192.49,193.66,194.84,192.72,199.53,203.76,198.83,199.77,195.07,193.9,193.43,180.28,181.69,185.68,182.86,181.92,178.4,184.74,184.74,182.63,180.28,178.4,177.7,181.22,188.26,188.26,180.75,180.05,180.05,173.71,176.29,179.58,179.58,179.81,182.39,180.99,186.15,183.57,180.52,171.13,170.42,174.65,170.66,174.65,173.94,176.53,172.07,166.9,167.37,169.95,177.93,177.23,176.76,171.6,172.54,174.65,169.48,164.79,164.79,166.9,173.47,172.3,174.88,182.39,182.16,182.16,182.16,179.58,177.23,180.52,178.17,181.46,181.92,184.74,180.28,180.28,181.69,183.8,193.43,194.13,196.01,195.54,199.3,211.27,212.91,210.33,210.8,211.03,210.33,207.51,207.98,195.07,197.18,191.08,188.5,188.5,190.85,190.85,192.02,188.73,194.6,188.5,189.2,188.73,190.61,197.18,197.65,197.18,194.37,198.59,206.34,198.12,198.12,192.72,193.43,203.05,204.46,198.36,198.36,195.07,194.6,194.84,194.84,196.01,195.77,201.41,202.11,200.47,198.59,204.23,203.52,206.34,209.15,209.15,223.71,222.07,223.47,221.83,222.54,223,219.25,214.55,210.8,213.62,213.62,213.38,207.51,209.39,207.51,207.51,202.58,204.23,197.18,197.42,206.1,207.75,210.09,199.06,197.89,200,196.01,201.17,196.48,202.11,199.53,202.35,200.23,205.63,204.93,203.76,200.94,208.45,209.62,207.98,209.62,211.97,206.34,191.78,196.24,188.97,195.07,202.11,201.64,202.58,200.94,195.31,195.54,186.38,189.44,187.32,183.1,176.29,177,178.17,178.17,175.35,174.88,175.35,184.04,187.32,190.38,192.02,196.01,193.43,194.37,194.13,194.84,189.2,190.61,187.79,184.98,178.17,179.58,179.81,176.29,174.88,182.39,181.22,183.1,184.98,185.68,180.05,180.05,180.05,180.05,176.06,171.6,173,168.31,168.31,164.32,165.02,167.14,167.14,165.02,161.97,169.95,165.02,163.62,165.26,161.27,166.2,164.32,162.21,156.57,151.88,157.28,156.81,160.09,160.09,160.33,170.42,165.49,164.55,166.2,171.13,171.13,174.88,168.78,165.26,168.54,164.55,163.85,158.45,159.86,162.68,162.68,166.43,166.2,168.78,167.84,163.38,165.49,161.97,160.09,154.93,156.81,153.76,152.35,155.4,153.76,145.07,146.01,143.43,141.55,137.56,140.85,141.78,141.78,141.08,144.6,142.02,142.02,142.25,135.45,136.85,137.79,138.97,149.3,153.29,152.82,145.77,150.23,152.11,152.35,151.64,157.28,156.34,156.81,165.49,175.12,168.54,172.3,178.17,173.47,178.17,178.17,178.17,178.17,180.05,172.54,173.94,178.17,178.87,181.69,173.24,175.35,173,177.7,180.05,180.05,177,176.53,173,164.32,164.32,164.55,163.62,159.86,159.86,156.57,156.34,158.92,156.81,157.98,159.86,159.15,159.62,165.49,178.17,178.64,171.13,170.66,172.3,169.72,174.18,179.81,179.34,187.56,184.04,185.45,182.86,182.63,184.51,184.04,183.33,187.09,188.73,188.26,185.92,192.02,188.97,190.14,184.27,188.26,184.51,187.79,185.45,185.45,189.44,188.73,188.73,187.56,188.5,178.4,174.65,172.54,175.12,174.88,168.78,168.08,166.43,165.02,161.74,159.62,158.69,157.04,154.69,155.16,154.69,153.29,156.34,152.82,152.82,152.82,153.52,156.81,157.75,154.23,149.06,148.12,149.53,148.83,157.75,157.98,154.69,157.04,156.57,161.74,164.79,163.15,164.32,167.61,162.21,164.79,160.56,158.22,163.85,171.13,177.23,175.35,178.87,178.64,175.12,175.35,180.28,184.04,184.98,182.16,185.92,187.32,180.75,185.21,180.52,182.39,178.64,177,169.01,172.07,169.72,172.07,174.88,174.88,180.52,180.52,179.34,176.29,179.34,177.93,173.24,174.65,168.54,171.36,172.07,172.07,181.69,182.16,180.75,187.79,194.84,192.25,197.89,195.07,193.9,193.9,193.9,186.62,186.38,188.26,194.13,192.96,194.37,195.77,192.25,195.54,191.08,192.96,192.49,186.62,186.62,188.5,188.5,189.91,189.91,185.45,187.79,188.97,190.61,193.43,190.14,181.69,181.92,185.68,182.39,187.79,194.6,194.6,194.84,191.31,192.49,195.07,198.83,199.77,196.01,196.24,193.19,190.85,195.31,195.77,195.77,200,200.7,200.23,194.13,189.91,191.78,191.78,193.19,194.13,194.37,189.91,188.97,184.74,182.39,184.98,189.2,189.44,189.44,189.2,195.77,206.34,207.98,217.84,218.31,219.72,223,222.07,220.19,220.19,222.54,225.35,220.89,220.89,222.3,221.83,221.36,220.66,228.64,232.39,232.16,235.92,235.92,230.52,232.86,232.39,234.51,233.1,237.09,231.69,231.69,231.69,226.06,229.81,220.66,219.48,222.3,227.93,229.34,235.92,233.1,231.92,234.27,234.74,239.44,245.31,246.48,239.44,242.96,244.13,241.78,233.57,230.05,222.07,217.84,206.34,216.2,217.84,221.36,222.77,217.37,217.37,209.15,200.7,194.37,193.66,189.2,188.73,171.6,161.97,175.59,162.91,184.74,198.36,189.44,195.54,196.48,195.54,184.04,187.79,186.85,195.07,201.41,198.36,199.53,197.42,191.08,193.19,193.19,190.85,197.42,192.49,190.85,196.95,193.9,191.08,193.9,195.77,196.48,196.48,196.48,190.14,190.14,193.43,193.43,199.53,198.36,201.17,196.24,189.2,192.25,190.38,194.13,197.42,195.77,190.85,191.08,192.25,191.08,196.95,191.31,196.24,195.54,208.22,205.87,212.21,213.62,210.8,213.15,207.75,200,192.49,200.47,203.76,202.35,200.47,199.3,197.42,201.88,197.89,198.59,196.24,199.77,200.23,198.12,200.47,201.88,199.06,196.48,194.84,194.37,194.84,194.6,194.84,194.13,194.6,192.96,197.42,195.31,193.43,196.48,194.37,195.07,195.31,200.23,194.37,192.02,191.55,189.44,190.38,189.2,191.08,190.85,190.14,189.44,188.26,188.26,183.33,176.06,168.54,174.88,177.23,180.75,184.98,185.68,182.63,176.29,176.53,177.23,184.74,184.74,184.04,186.38,181.46,179.81,184.04,187.79,192.25,191.31,192.96,196.48,198.36,190.85,196.24,197.89,194.6,193.66,197.18,197.18,197.18,197.18,195.31,194.84,195.77,194.6,194.6,200.7,207.04,203.05,204.46,200.23,203.52,200,196.71,195.54,196.95,195.31,193.9,194.6,191.78,187.56,186.85,191.08,195.31,202.11,202.58,201.88,203.05,204.23,206.81,210.56,230.05,230.28,230.05,230.52,227.23,234.74,231.46,228.17,233.33,231.92,228.87,235.92,255.87,261.74,269.95,277,269.95,282.86,273.47,271.13,274.65,275.82,275.82,280.52,278.17,272.3,264.08,272.3,277,277,271.13,272.3,278.17,278.17,295.77,306.34,307.51,315.73,323.94,312.21,302.82,312.21,306.34,299.3,305.16,306.34,306.34,308.69,301.64,316.9,302.82,301.64,288.73,287.56,293.43,305.16,305.16,293.43,299.3,293.43,294.6,295.77,295.77,295.77,309.86,311.03,305.16,295.77,312.21,320.42,325.12,319.25,348.59,332.16,332.16,339.2,345.07,333.33,328.64,318.08,320.42,312.21,321.6,328.64,320.42,329.81,328.64,333.33,323.94,323.94,316.9,313.38,312.21,316.9,309.86,315.73,311.03,329.81,330.99,335.68,335.68,336.85,338.03,328.64,322.77,327.46,321.6,322.77,322.77,323.94,325.12,311.03,312.21,311.03,308.69,316.9,305.16,305.16,300.47,308.69,309.86,309.86,302.82,303.99,305.16,288.73,280.52,275.82,278.17,275.82,284.04,284.04,287.56,287.56,280.52,288.73,288.73,294.6,293.43,298.12,301.64,295.77,302.82,301.64,301.64,299.3,287.56,288.73,300.47,298.12,301.64,303.99,296.95,292.25,286.38,286.38,291.08,295.77,301.64,295.77,293.43,299.3,292.25,287.56,288.73,293.43,289.91,285.21,280.52,281.69,288.73,289.91,289.91,285.21,279.34,278.17,274.65,280.52,278.17,274.65,272.3,267.61,267.61,264.08,272.3,281.69,284.04,281.69,277,272.3,264.08,247.65,235.92,238.26,238.26,238.26,244.13,240.61,240.61,241.78,246.48,242.96,244.13,242.96,242.96,250,253.52,250,251.17,248.83,245.31,248.83,241.78,246.48,250,252.35,252.35,244.13,251.17,251.17,251.17,251.17,247.65,244.13,245.31,242.96,234.74,241.78,234.74,234.74,229.81,226.53,224.65,220.66,220.66,214.79,215.96,220.19,230.99,227.93,229.34,229.81,226.06,231.22,234.74,239.44,238.26,250,241.78,250,252.35,247.65,248.83,251.17,252.35,255.87,254.69,252.35,250,260.56,262.91,259.39,258.22,261.74,280.52,279.34,280.52,275.82,271.13,272.3,267.61,273.47,281.69,277,278.17,285.21,281.69,289.91,282.86,285.21,284.04,289.91,291.08,286.38,282.86,292.25,298.12,299.3,300.47,295.77,299.3,298.12,307.51,307.51,307.51,301.64,294.6,293.43,298.12,292.25,300.47,301.64,303.99,301.64,298.12,296.95,298.12,293.43,279.34,279.34,277,277,266.43,282.86,282.86,282.86,282.86,291.08,292.25,288.73,288.73,288.73,303.99,309.86,311.03,298.12,306.34,312.21,308.69,308.69,308.69,308.69,287.56,288.73,288.73,288.73,293.43,302.82,302.82,280.52,277,277,277,277,272.3,272.3,272.3,272.3,291.08,291.08,289.91,289.91,282.86,277,277,281.69,284.04,277,272.3,274.65,273.47,265.26,266.43,262.91,261.74,260.56,265.26,258.22,253.52,255.87,264.08,264.08,265.26,259.39,253.52,260.56,254.69,257.04,264.08,259.39,258.22,257.04,257.04,252.35,252.35,258.22,259.39,255.87,264.08,259.39,264.08,266.43,260.56,264.08,265.26,254.69,253.52,241.78,248.83,251.17,253.52,253.52,251.17,251.17,251.17,244.13,248.83,247.65,242.96,232.39,232.63,229.81,228.64,226.29,221.83,223.47,216.43,211.74,215.02,223,223.71,220.66,213.62,205.4,209.15,217.14,216.2,220.42,222.54,219.95,219.01,220.66,220.66,231.69,237.09,234.74,239.44,240.61,234.74,234.74,235.92,234.74,233.33,229.81,227.93,226.53,228.87,228.87,231.22,226.06,223.24,215.49,219.01,219.01,219.01,227,227.93,224.65,226.29,223.47,219.72,218.78,220.89,223.24,217.14,218.78,223.47,216.9,215.26,213.85,215.49,212.21,212.21,212.21,212.21,222.54,218.31,215.96,214.08,211.27,206.57,206.57,201.88,196.01,193.66,192.49,190.61,189.67,195.07,195.07,202.35,210.8,211.03,214.08,214.08,211.74,220.66,222.77,224.18,223.47,224.88,218.08,211.74,212.44,215.49,219.48,220.42,211.27,195.77,194.13,196.95,198.36,194.13,198.36,203.05,205.87,209.39,209.15,219.48,213.38,215.02,214.79,205.87,207.51,202.58,200,200,203.99,199.77,195.07,196.48,199.53,198.83,192.25,190.14,190.14,185.21,184.98,191.31,190.38,193.19,192.02,188.26,184.04,185.45,183.8,183.1,185.92,182.63,180.75,180.75,178.4,176.06,176.06,177.7,177.46,190.14,191.08,195.07,201.88,203.05,204.93,203.76,201.17,201.41,201.88,199.77,200.7,205.63,205.63,205.63,214.55,214.55,214.79,212.91,207.75,214.55,214.55,216.43,209.15,213.15,222.77,222.77,219.48,212.68,219.25,215.26,218.08,215.96,217.14,214.08,209.15,217.61,213.62,211.27,209.86,209.86,206.81,204.93,210.56,208.69,203.76,200.94,195.54,197.89,190.38,185.68,185.45,197.18,196.48,196.24,203.99,207.75,204.93,200.7,207.51,203.99,208.45,207.98,204.69,198.36,198.59,196.71,209.15,212.91,215.49,211.97,208.22,209.62,207.75,205.63,207.04,205.87,209.15,204.69,200.7,205.16,208.45,210.09,210.09,211.74,210.8,208.22,208.22,208.22,204.93,203.99,202.58,204.69,202.82,212.21,215.73,219.72,228.4,230.52,229.81,229.34,242.96,256.34,256.34,258.92,254.93,258.92,258.92,255.16,255.16,253.52,257.51,270.89,269.48,280.52,278.87,279.34,279.11,269.48,272.54,270.19,267.61,266.67,266.43,265.26,268.31,272.77,270.42,276.06,276.76,273.94,267.14,262.44,258.92,266.2,270.89,267.84,277,275.12,276.53,275.82,274.41,270.19,267.61,266.2,265.26,291.08,300.47,289.67,293.66,280.52,281.69,281.92,286.15,278.4,278.17,278.17,270.66,269.72,269.72,271.83,269.48,275.12,273.24,273.47,272.3,283.8,273.47,272.07,278.4,280.28,285.92,281.69,279.81,280.28,277.46,278.17,266.9,272.07,273.94,278.17,286.85,287.32,279.34,279.81,277,273.47,275.35,274.65,269.95,269.25,269.25,269.25,269.25,269.25,270.89,282.16,282.63,282.63,280.52,279.81,291.55,292.72,291.31,305.16,305.16,295.07,296.24,291.08,297.65,299.3,281.69,279.58,279.58,273,282.39,294.13,295.31,312.21,306.1,299.53,300.47,306.34,309.39,305.16,314.79,310.56,304.93,308.45,309.86,308.22,305.4,300.47,306.81,308.45,306.1,314.32,311.27,307.75,295.54,294.84,294.84,299.3,302.58,307.51,307.98,320.89,328.64,328.64,324.41,329.81,329.81,330.05,330.05,330.75,329.58,332.16,332.16,334.27,321.13,320.19,322.77,319.25,322.54,313.38,319.25,314.79,314.79,310.09,307.51,319.72,331.69,334.74,330.52,332.16,322.54,319.25,316.9,321.36,316.2,311.5,316.67,310.56,323.94,323.94,335.21,335.21,335.21,352.11,349.06,349.53,344.6,355.16,351.17,349.77,367.37,378.87,379.81,361.03,370.89,366.67,366.67,390.85,389.2,382.39,387.09,403.52,391.08,388.97,384.04,380.05,378.4,385.68,376.06,367.37,399.06,398.59,397.65,414.55,425.35,418.31,429.58,435.45,437.32,420.66,441.31,429.11,425.35,429.34,429.34,442.25,439.91,441.78,420.42,419.48,427.93,406.81,402.82,401.41,422.07,400.47,417.37,412.91,408.92,408.92,407.51,406.57,406.57,421.6,417.84,411.74,422.3,431.46,434.98,434.98,453.05,445.77,446.24,450.7,464.08,469.48,466.2,473,475.35,475.35,459.39,444.13,455.87,453.76,454.69,454.69,487.09,488.26,498.83,504.69,521.13,518.78,523.47,550.47,548.12,557.51,549.3,523.47,528.17,556.34,555.16,555.16,552.82,544.6,553.99,539.91,553.99,548.12,559.86,561.03,565.73,546.95,539.91,546.95,517.61,498.83,491.78,481.22,481.22,489.44,446.01,450.23,459.15,443.43,456.81,453.76,406.57,366.43,384.27,397.42,383.57,402.58,415.49,427,438.26,438.26,468.78,455.16,468.78,452.11,448.59,435.45,421.6,410.8,420.89,398.36,407.75,408.45,395.07,363.38,374.18,367.14,368.54,365.02,369.01,396.24,382.16,382.16,382.16,382.16,358.69,368.78,380.28,383.8,388.03,424.65,431.46,409.86,409.86,396.95,396.95,408.69,434.04,417.84,417.84,438.26,436.62,436.62,452.82,442.96,460.09,439.67,448.12,440.85,460.09,465.26,471.83,460.09,446.71,457.75,437.32,427.7,455.4,453.52,459.62,459.62,470.66,452.11,436.15,429.34,406.1,418.31,403.05,400.47,400.47,396.24,414.79,415.49,415.73,395.07,378.17,375.35,372.77,387.09,394.37,406.1,392.25,396.48,400,403.29,413.38,411.97,420.89,431.92,430.75,410.8,395.54,398.12,395.54,395.54,399.3,409.62,408.22,408.22,401.88,427,469.01,457.75,457.04,481.22,477.7,456.1,457.75,465.26,492.96,503.52,497.65,511.74,529.34,515.26,518.78,518.78,518.78,518.78,518.78,467.61,448.12,448.59,466.67,477.7,476.53,465.02,468.78,466.9,489.44,492.96,497.65,492.96,512.91,497.65,491.78,481.22,470.66,476.53,467.61,446.48,446.48,436.85,453.29,451.64,451.64,441.08,440.85,466.9,468.78,480.05,483.57,476.53,482.39,492.96,505.87,496.48,488.26,502.35,485.92,467.84,447.65,462.44,464.55,456.81,427.7,386.85,397.89,387.32,430.05,424.41,423,423.94,408.45,410.8,410.8,414.55,407.98,424.88,418.54,432.86,427.23,424.41,416.67,416.67,436.62,436.62,436.62,447.89,446.71,446.24,457.75,465.96,483.57,470.66,480.05,468.08,474.18,470.66,462.21,469.48,476.53,475.35,488.26,497.65,480.05,487.09,487.09,510.56,527,527,537.56,541.08,563.38,552.82,552.82,582.16,584.51,578.64,577.46,603.29,609.15,653.76,671.36,687.79,666.67,685.45,670.19,654.93,653.76,634.98,636.15,661.97,659.62,697.18,691.31,704.23,700.7,694.84,632.63,631.46,639.67,630.28,631.46,632.63,624.41,615.02,616.2,618.54,642.02,605.63,605.63,618.54,606.81,615.02,602.11,626.76,631.46,652.58,649.06,649.06,627.93,617.37,599.77,575.12,589.2,609.15,613.85,610.33,630.28,631.46,600.94,611.5,616.2,623.24,642.02,650.23,676.06,713.62,720.66,771.13,777,816.9,782.86,834.51,834.51,823.94,847.42,839.2,836.85,789.91,819.25,815.73,845.07,928.4,928.4,928.4,928.4,928.4,928.4,1004.69,974.18,965.96,991.78,1062.21,1092.72,1139.67,1124.41,1130.28,1123.24,1197.18,1255.87,1223,1309.86,1333.33,1312.21,1455.4,1375.59,1359.15,1392.02,1361.5,1422.54,1453.05,1448.36,1436.62,1314.55,1422.54,1338.03,1319.25,1340.38,1223,1220.66,1218.31,1230.05,1277,1244.13,1262.91,1309.86,1295.77,1272.3,1277,1354.46,1328.64,1377.93,1326.29,1340.38,1300.47,1244.13,1293.43,1295.77,1284.04,1361.5,1370.89,1380.28,1380.28,1406.1,1502.35,1528.17,1528.17,1589.2,1633.8,1704.23,1741.78,1774.65,1746.48,1758.22,1732.39,1741.78,1758.22,1774.65,1793.43,1744.13,1737.09,1772.3,1800.47,1727.7,1877.93,1974.18,2021.13,2133.8,1948.36,2129.11,2112.68,1976.53,1969.48,2082.16,2056.34,2018.78,2084.51,2065.73,2065.73,2065.73,2065.73,2098.59,2227.7,2232.39,2359.15,2389.67,2579.81,2490.61,2490.61,2204.23,1992.96,2208.92,2169.01,1962.44,2201.88,2241.78,2183.1,2136.15,2286.38,2277,2478.87,2377.93,2363.85,2190.14,2314.55,2335.68,2190.14,2190.14,2049.3,1894.37,2105.63,1948.36,2056.34,2079.81,2150.23,2424.88,2342.72,2410.8,2441.31,2589.2,2666.67,2711.27,2647.89,2737.09,2873.24,2870.89,2875.59,2868.54,3032.86,3051.64,3035.21,3018.78,3018.78,3396.71,3396.71,3758.22,3882.63,3957.75,4413.15,4307.51,4638.5,4624.41,4269.95,4319.25,4096.24,4096.24,4553.99,4556.34,4556.34,4816.9,5265.26,5373.24,5476.53,5546.95,5539.91,5539.91,5394.37,4859.15,4485.92,5199.53,4807.51,4931.92,5046.95,5370.89,5591.55,5917.84,6302.82,6488.26,6852.11,5997.65,6152.58,6847.42,6274.65,6169.01,6220.66,6009.39,5133.8,5692.49,5500,5166.67,4873.24,5131.46,5117.37,4330.99,4490.61,4887.32,4323.94,4323.94,4140.85,4309.86,4295.77,4504.69,4129.11,4262.91,3638.5,3288.73,3103.29,4032.86,3678.4,3701.88,3915.49,3509.39,3338.03,3333.33,3345.07,3530.52,3739.44,3861.5,3861.5,3901.41,3521.13,3969.48,4061.03,3922.54,3938.97,3962.44,4061.03,3880.28,3929.58,3974.18,3786.38,3746.48,3866.2,4185.45,4208.92,4356.81,4349.77,4253.52,3983.57,3967.14,4129.11,4096.24,4359.15,4384.98,4319.25,4370.89,4370.89,4370.89,4150.23,4143.19,4169.01,4302.82,4321.6,4321.6,4161.97,4044.6,3946.01,3946.01,3767.61,3387.32,3330.99,2962.44,2985.92,2997.65,2870.89,3037.56,2870.89,2997.65,2992.96,3147.89,3490.61,3582.16,3328.64,3455.4,3281.69,3277,2967.14,2657.28,2666.67,2845.07,2997.65,2943.66,2854.46,2629.11,2577.46,2685.45,2777,2612.68,2546.95,2718.31,2417.84,2471.83],"마이크론 테크놀로지":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,97.15,97.7,92.45,94,93.1,95.35,102.25,103.35,102.55,100.15,100.7,100.15,101.5,101.4,101.8,103.3,102.95,116.01,116.36,116.36,116.56,113.96,111.41,109.65,109.65,112.81,111.86,110.61,110.26,111.76,112.46,114.01,111.61,110.96,110.96,108.75,111.66,108.6,109.85,109.5,114.31,117.86,117.66,119.91,120.96,120.61,123.81,124.01,123.06,121.76,123.06,121.11,122.31,120.31,119.56,115.66,115.16,114.96,116.81,116.81,118.91,118.81,117.46,116.26,118.86,117.26,122.81,123.56,127.91,128.61,128.26,126.96,125.81,125.96,128.56,127.96,130.67,130.27,129.06,131.12,127.66,130.37,132.42,142.22,143.87,143.52,142.57,144.92,144.57,143.27,143.02,141.37,143.17,142.67,138.27,135.97,133.52,133.77,133.77,135.72,135.77,136.37,139.87,136.67,132.92,135.02,134.02,138.22,138.42,141.52,138.92,140.07,139.02,141.07,140.37,144.12,146.67,145.22,144.72,144.22,145.17,135.07,137.47,139.17,140.37,141.52,145.02,147.22,148.87,148.87,153.58,153.93,153.88,156.13,156.13,157.93,162.58,162.33,153.08,156.08,157.78,155.38,152.88,149.37,156.08,154.23,160.13,159.53,158.73,162.58,158.38,161.28,157.43,149.37,145.77,145.77,152.63,150.58,151.08,152.58,156.93,157.33,155.73,159.03,158.68,159.58,159.18,160.08,160.13,158.43,149.57,149.12,151.28,146.47,140.67,141.77,143.22,139.22,139.67,143.02,144.27,142.97,137.52,140.12,146.27,148.47,153.53,148.17,151.98,147.87,152.33,152.33,151.18,151.53,155.48,157.48,158.13,159.93,163.08,163.08,160.43,161.33,164.03,162.33,167.28,171.54,173.04,172.99,173.34,177.24,179.84,179.94,179.64,180.44,174.44,170.99,185.54,189.89,196.75,200.15,201.95,197.9,196.95,198.45,204.9,210.01,208.15,203,202.1,207.55,202.05,208.35,206.65,207.6,207.9,208.1,205.4,203.1,204.35,208.35,221.66,222.01,221.81,218.66,216.36,219.86,220.56,217.61,224.01,228.11,229.11,226.91,231.02,230.92,238.32,247.12,245.82,245.82,248.52,240.37,239.77,218.81,212.06,210.06,199.6,206.15,208,216.11,216.16,215.16,209.4,210.36,211.31,212.11,218.66,220.01,228.86,222.21,220.71,220.71,211.36,212.51,209.15,205.7,218.46,225.01,234.52,229.11,227.86,214.96,216.66,214.21,214.16,214.16,214.71,221.41,220.06,213.86,214.51,219.86,215.51,215.16,218.46,216.56,208.45,218.71,212.56,204.2,197.1,219.51,210.16,200.1,202.15,211.06,213.26,217.36,217.61,221.16,221.16,224.61,222.81,221.36,232.77,240.02,243.02,244.17,238.22,245.67,260.28,268.83,269.99,276.24,273.09,297,297.3,299.05,294.35,303.05,300.85,305.9,305.5,294.75,271.19,277.94,262.13,257.58,260.83,260.83,250.43,257.88,267.08,249.32,242.42,239.92,252.53,252.53,263.08,261.28,258.38,261.43,270.19,257.23,253.23,245.22,235.67,238.12,250.83,237.72,230.02,234.07,229.56,233.22,238.02,242.52,242.97,255.18,263.43,259.23,265.13,270.19,282.64,273.64,267.08,277.54,295.3,300,307.6,306.9,306.9,313.26,313.01,288.09,293.85,295.65,297.2,297.25,298.3,307.1,307.1,302.9,300.4,296.05,291.3,292.4,296.4,294.9,297.35,285.64,265.93,273.09,261.43,265.83,262.33,272.54,257.53,257.53,264.33,266.28,271.69,278.84,271.04,277.39,281.89,280.89,284.94,287.39,281.24,275.24,271.59,265.98,267.08,268.93,269.93,265.18,264.08,261.58,267.13,264.18,263.48,265.33,267.08,261.43,256.98,256.83,253.23,237.57,235.62,235.67,240.47,249.82,251.33,248.62,253.63,260.48,261.83,259.28,263.93,262.73,262.73,259.78,247.82,223.36,224.41,224.61,218.11,208.8,218.21,221.61,218.01,226.76,225.41,230.42,223.81,225.91,223.31,221.86,225.06,226.26,225.86,228.91,225.86,220.91,218.01,215.46,211.46,208.15,209.95,212.46,211.81,216.16,211.86,206.6,202.35,198.9,193.5,177.24,183.99,177.09,173.39,180.14,188.69,200.7,201.7,199.7,199.1,204.75,202.3,195.65,187.29,189.34,190.25,199.65,197.3,184.24,180.69,181.99,181.99,182.09,182.94,185.09,193.65,189.64,192.9,200.25,184.49,184.49,188.44,176.64,174.09,176.14,180.24,175.19,171.09,169.48,170.64,157.13,156.48,151.68,145.17,145.17,154.53,159.73,157.93,158.73,163.83,155.08,163.58,170.09,168.78,177.29,179.64,180.14,173.44,170.04,167.98,169.48,178.89,178.89,169.43,171.29,183.04,194.9,190.5,187.04,191.3,191.2,198.1,197.45,196.95,207.7,197,193,193,202.1,208.5,211.26,210.06,210.06,209.9,211.16,207.75,212.96,213.86,214.91,206.7,204.5,208,205.4,200.05,189.74,189.24,193.35,195.25,196.35,194.25,192.15,197.8,198.15,201.95,200.75,220.06,208.2,202.85,201.7,196.25,196.8,206.75,211.36,212.31,219.61,214.56,216.71,214.61,208.7,210.96,211.51,210.16,209.2,213.91,215.86,217.11,217.11,217.11,213.96,215.26,213.86,210.61,210.66,210.41,209.6,212.91,216.76,210.76,201.4,198.85,196.45,194.8,186.99,192.65,192.15,186.64,180.39,173.19,178.29,173.74,169.18,170.09,170.09,164.78,166.53,166.68,163.13,163.53,172.54,166.78,167.43,170.04,174.79,174.29,164.88,166.98,163.38,162.23,171.54,169.78,170.84,166.33,166.03,163.48,185.29,190.45,193.05,200.65,198.1,198.05,198.05,197.2,202.15,206.85,214.61,217.51,222.66,222.11,215.41,216.96,223.46,227.71,236.07,234.87,240.07,238.97,237.57,234.22,237.42,224.56,218.11,220.51,209.8,213.21,208.85,213.26,207.7,210.76,220.96,210.31,211.31,217.86,225.16,221.26,220.96,224.01,214.91,217.26,212.31,215.86,223.46,226.46,226.46,225.06,234.17,245.27,244.97,245.77,247.07,252.53,252.33,252.63,250.88,254.33,252.53,249.22,245.92,248.12,242.67,247.47,243.12,216.16,214.36,211.61,210.01,217.41,222.86,220.91,213.31,214.51,216.51,225.61,224.41,232.42,225.91,227.61,217.46,226.21,223.41,223.41,235.62,240.27,243.57,240.67,239.52,237.87,242.02,248.07,243.52,238.52,242.12,236.07,231.42,234.62,231.62,234.12,238.67,239.22,233.02,227.96,227.86,229.46,237.72,233.72,240.92,240.92,237.67,232.07,226.26,231.62,233.22,239.77,232.37,237.42,246.42,254.98,256.13,264.83,265.13,265.33,272.79,275.44,277.14,277.24,277.24,275.69,270.29,266.18,269.03,277.09,272.79,267.98,291.5,287.74,286.69,283.49,287.39,287.74,280.99,288.54,288.44,288.44,295,296,296.15,288.94,277.19,282.49,276.64,275.29,265.58,269.03,277.64,283.99,293.55,284.54,286.79,286.39,296.5,296.8,292.65,292.65,288.89,300.1,295.15,285.09,275.19,260.63,261.98,253.03,262.93,273.09,259.13,276.59,268.73,257.48,229.96,239.42,218.71,194.15,215.06,172.44,186.99,173.54,181.54,180.64,191.35,216.46,212.61,224.06,217.51,222.71,210.41,199.55,205.55,206.2,231.97,232.82,241.57,230.77,230.77,230.97,238.22,232.27,227.76,228.61,217.11,207.15,219.66,218.96,220.91,226.51,226.66,249.27,239.57,225.41,222.41,227.16,230.52,233.07,241.37,241.12,228.56,217.76,228.76,222.16,229.71,225.71,233.32,226.21,224.81,224.81,229.11,247.37,232.47,239.67,231.82,234.22,244.72,256.23,268.73,268.63,265.88,262.48,242.72,243.57,246.32,255.23,254.93,252.53,254.28,255.88,249.32,241.57,246.07,242.57,245.87,257.73,248.62,249.27,249.27,254.73,245.57,248.67,250.03,253.63,247.42,248.67,252.68,250.63,247.47,256.18,257.73,258.38,263.33,250.23,258.08,250.58,252.08,253.83,250.43,252.08,256.63,255.38,243.62,243.87,245.87,238.92,242.52,230.82,228.11,226.21,222.11,220.36,215.06,213.41,218.91,225.61,224.91,223.21,228.56,227.66,228.91,239.27,231.77,232.52,232.52,225.26,225.86,224.46,230.57,245.27,245.37,251.18,255.03,253.83,245.87,248.62,249.37,247.47,245.82,248.72,253.68,234.92,239.72,232.87,238.12,236.72,242.17,249.62,249.57,253.53,259.38,258.28,259.83,258.18,263.28,267.78,266.68,272.04,264.38,260.83,259.93,250.13,252.53,251.83,248.67,255.53,259.93,273.04,275.94,279.94,277.19,281.94,281.39,289.79,309.45,310.11,303.85,309.3,307.15,321.06,319.91,317.31,317.31,321.31,320.61,335.57,345.72,349.67,366.88,363.23,366.13,357.23,356.58,352.83,357.88,365.93,365.13,361.48,357.48,357.53,352.38,349.92,353.08,353.08,353.48,351.23,359.78,376.09,370.44,386.49,385.74,395.75,387.29,393.55,397.5,399.75,406.7,403.8,403.8,427.71,417.71,425.26,411.61,406.6,397.75,375.64,392.15,391.55,402.35,408.3,395.75,406.45,405.7,420.26,416.81,411.96,432.62,440.27,440.27,438.92,430.47,442.92,455.03,431.62,441.37,462.83,440.82,457.88,474.04,455.68,445.77,421.86,444.87,425.46,446.72,427.26,446.77,439.07,444.47,457.38,474.04,449.32,452.78,456.63,427.21,415.21,420.66,440.17,433.17,432.92,441.27,462.28,462.28,468.98,467.68,470.04,476.69,476.74,478.19,460.98,453.58,451.58,453.53,442.27,437.62,447.67,423.76,430.37,439.42,447.52,430.37,440.52,430.57,425.31,422.26,425.96,424.21,430.12,404.45,403.6,384.19,386.14,398.7,402.15,394.6,399.85,405.85,403.8,414.71,406.35,411.41,419.86,420.91,420.91,420.96,421.91,410.36,419.01,420.41,402.85,393.5,396.6,396.9,402.65,411.11,402.65,403.4,384.94,385.54,388.49,395.3,403.1,410.36,417.11,414.86,425.11,400.75,401.85,401.85,405.6,391.3,385.74,393.9,398,392.45,392.65,384.79,375.24,373.09,377.14,386.14,377.84,379.89,381.69,371.29,377.94,385.59,388.09,388.39,404.5,410.11,407.65,410.21,401.25,379.74,375.34,351.43,354.78,354.83,354.08,353.28,351.58,351.33,358.88,360.08,370.39,364.03,370.19,365.98,368.68,368.78,370.14,369.23,369.23,368.38,361.53,364.53,367.68,371.94,367.63,369.28,373.34,371.69,362.03,360.88,370.04,370.39,370.44,376.09,365.68,358.38,355.08,355.13,353.28,352.68,349.87,352.88,350.78,346.27,333.77,332.07,339.17,338.57,336.47,338.02,341.52,343.37,337.72,343.97,344.87,341.37,348.07,345.67,353.68,353.98,356.43,361.38,364.78,372.99,378.14,367.23,372.94,386.69,384.09,384.24,377.49,385.29,415.36,419.51,427.26,431.27,431.27,417.31,430.92,420.21,425.96,414.61,408.3,412.46,429.36,430.32,424.86,427.91,421.96,416.66,428.51,413.66,415.21,410.36,453.63,451.93,472.34,472.34,472.39,464.93,481.09,469.68,465.98,478.99,481.94,472.24,478.49,472.49,469.68,471.24,475.79,478.34,487.04,487.04,464.58,450.23,425.56,409.85,414.96,403.8,410.06,393.8,396.55,411.56,407.45,422.76,410.06,406.05,404.55,420.81,440.82,455.33,449.02,449.52,480.24,480.54,468.88,454.23,454.23,453.08,436.77,444.37,450.73,444.52,431.52,466.73,446.12,409.75,378.69,385.99,397.4,378.79,364.28,347.17,365.73,398.55,402.8,397.25,391.95,395.8,378.44,391.25,390.7,399.5,410.46,396,389.64,381.09,388.54,373.24,369.08,366.58,360.88,360.33,359.98,362.08,350.83,350.83,355.93,363.83,366.18,354.78,347.22,350.78,335.57,332.52,351.08,341.12,353.18,356.48,368.28,356.63,351.93,339.82,344.72,334.97,338.72,359.78,352.53,372.59,355.43,347.17,344.67,348.12,333.27,339.52,353.18,366.78,366.78,369.38,367.93,377.04,349.87,352.43,353.98,343.17,330.27,313.26,294.35,293.65,295.75,275.19,278.89,278.89,284.14,281.84,281.24,292.35,294.05,289.44,280.24,276.54,268.38,268.38,283.79,286.99,294.4,295.85,289.19,296.05,294.45,296.9,307.8,302.4,312.16,316.66,318.36,306.6,300.9,298.45,309.6,310.51,309.45,312.86,312.51,321.41,324.41,312.46,307.4,295.9,307.15,311.76,325.36,323.66,319.46,308.25,315.06,302.7,291.7,289.44,291.7,306.15,288.29,285.19,281.64,282.79,286.69,281.79,281.79,276.29,275.14,277.09,287.34,289.84,268.23,265.68,263.58,264.38,260.63,254.13,250.63,248.42,250.63,244.52,253.03,255.13,250.18,250.63,258.73,269.93,273.79,273.24,264.68,257.03,268.68,263.88,274.44,263.73,267.63,262.88,265.28,268.63,280.39,281.34,279.49,277.39,261.18,270.34,270.64,274.44,267.38,267.53,280.94,282.94,287.59,279.99,301.5,312.76,309.05,315.66,294.5,293.85,293.05,285.94,293.25,294.8,294.8,292.2,278.89,275.74,288.39,277.59,273.54,270.34,268.53,269.23,276.14,274.49,276.89,276.34,273.09,260.33,260.48,258.73,253.53,256.08,247.27,251.13,251.13,250.23,245.72,253.38,250.03,250.03,251.98,271.14,273.69,283.99,281.94,286.19,290.45,286.49,284.79,284.79,284.39,282.69,281.94,292.45,309.25,306.45,307.85,314.16,319.51,308.7,301.65,313.16,316.01,312.21,300.05,310.81,301.4,301.05,299.25,300.75,310.51,309.35,300.4,295.2,295.2,288.14,285.04,293.9,291.05,289.64,289.24,286.84,282.29,284.04,284.29,277.94,284.59,278.14,274.79,269.63,271.49,270.79,282.99,283.44,288.34,293.3,291,306.85,305.95,299.1,296.55,317.86,315.61,301.85,298.2,286.49,285.24,292.95,292.95,316.51,318.01,309.95,315.16,313.31,312.86,309.8,303.4,307.45,305.8,297.7,290.85,305.25,309.65,321.96,311.91,309.65,304.7,302.7,306.3,304.5,304.8,300.1,308.2,304.75,323.36,318.81,324.76,338.02,341.02,331.32,330.22,332.82,348.22,369.83,369.83,358.63,341.17,345.62,346.02,339.02,337.87,335.47,326.76,327.31,337.42,339.52,345.77,344.27,338.47,338.47,334.67,329.16,331.42,326.56,327.41,334.12,335.52,321.81,315.71,319.66,319.66,310.46,306.3,303.4,312.56,318.16,319.11,322.81,320.56,325.96,324.86,324.96,323.61,328.41,327.56,328.56,337.07,355.53,356.18,357.13,353.98,341.02,346.07,349.72,347.07,338.42,333.67,327.36,322.01,341.57,326.81,321.26,317.96,318.11,319.96,317.21,326.11,318.61,318.76,326.71,333.57,340.62,349.87,352.13,352.13,351.63,352.23,349.52,351.08,350.33,351.73,354.43,359.13,349.57,352.68,353.73,348.57,339.67,344.57,343.07,339.87,341.22,326.16,340.32,339.97,339.32,340.72,345.42,349.97,347.57,345.52,351.23,348.92,346.22,345.57,345.17,345.87,337.82,336.27,334.57,340.52,332.67,322.81,328.41,330.52,334.52,347.17,352.38,363.08,364.78,364.18,361.58,368.03,376.99,374.09,386.04,385.89,383.54,387.99,393.3,383.74,385.69,385.69,384.54,387.74,380.79,383.64,380.79,379.84,371.64,368.63,365.83,368.43,374.99,389.14,391,399.15,411.16,407.25,408,411.06,393.65,427.61,432.67,432.67,435.52,433.52,430.22,426.91,411.91,411.51,413.76,417.46,424.96,416.86,412.11,417.16,412.16,412.16,423.26,416.61,424.31,437.77,446.42,437.87,440.62,446.22,440.47,445.57,431.02,428.96,428.26,432.62,435.12,423.21,426.06,424.61,428.01,428.71,407.85,409.35,408.35,397.7,397.7,403.75,407.65,429.76,430.22,447.52,459.48,448.77,453.28,475.99,479.09,472.59,478.04,495.15,488.34,472.79,487.34,471.04,457.38,466.48,469.13,470.24,481.49,549.52,551.33,585.94,594.3,596.55,589.74,589.74,621.81,614.06,640.37,620.76,618.21,615.06,613.46,611.31,637.87,612.91,607.15,609.15,581.94,559.93,534.12,545.87,562.58,559.18,558.18,574.49,572.09,565.08,548.77,561.93,573.79,600.95,596.35,596.9,589.34,606.5,615.31,624.36,639.37,639.77,626.76,645.32,637.82,631.72,631.67,647.77,647.77,663.68,658.23,631.77,625.31,641.17,633.52,668.88,650.68,655.03,674.44,675.69,704.1,716.06,707.15,739.52,767.63,767.63,721.31,698.05,695.4,705.95,712.16,661.48,657.98,657.93,663.28,684.44,684.44,658.33,653.78,656.03,682.29,651.48,668.08,654.68,637.77,597.8,587.54,571.59,576.69,571.54,551.68,537.52,547.32,539.52,513.06,549.37,507.8,463.73,452.33,445.22,434.22,460.58,465.63,473.44,487.44,502.3,535.02,540.22,543.42,540.22,541.92,521.56,514.51,494.8,489.54,474.54,478.09,481.44,481.44,443.12,446.67,447.17,432.12,431.57,434.47,453.48,436.27,456.33,436.12,443.87,436.97,446.47,454.73,468.08,470.24,479.09,549.67,537.77,518.81,501.8,499.5,509.35,511.51,514.81,512.96,508.75,528.71,534.87,541.97,521.86,546.47,560.53,556.03,545.67,539.37,525.51,534.52,539.82,532.22,541.17,520.66,498.5,498.9,508.9,527.71,559.43,567.33,559.78,543.52,520.76,499.85,496.15,481.94,487.79,488.89,492.1,514.06,513.46,522.66,509.25,491.25,491.25,489.99,493,499.45,516.26,504.6,506.1,514.36,490.75,510.56,491.45,512.76,541.57,543.27,519.76,435.67,450.83,448.82,446.62,446.62,449.32,443.37,426.76,421.01,436.87,449.57,496.55,509.8,497.3,497.3,496.95,475.54,487.04,516.21,513.26,529.01,529.01,547.17,546.42,524.46,516.21,455.78,441.47,445.27,462.73,456.43,449.82,453.53,468.23,472.94,461.73,479.89,470.64,458.63,478.54,497.85,497.85,534.22,522.06,516.16,494.45,477.29,466.33,488.79,459.33,468.38,452.93,456.23,471.94,446.57,465.03,435.62,445.47,478.44,474.64,504.2,515.81,508.85,510.56,515.26,473.84,484.94,471.14,460.88,456.03,442.42,434.67,443.77,443.22,371.89,323.76,342.02,327.86,389.54,350.43,347.92,355.28,355.38,346.82,344.17,344.17,333.87,351.23,364.83,387.29,399.1,393,384.59,384.94,389.04,403.8,402.3,402.75,413.31,425.96,429.51,461.68,484.89,476.84,477.49,490.25,493.5,490.75,479.44,474.39,467.08,467.08,482.14,481.14,484.24,472.54,491.15,511.51,516.51,531.72,543.07,555.03,570.99,580.44,581.19,578.29,599.5,602,609.4,609.4,618.31,610.71,639.87,636.57,630.32,624.11,616.56,604.75,609,611.76,611.76,599.9,622.41,611.51,615.86,622.96,593.35,600.85,582.44,566.58,572.24,566.43,546.37,549.42,558.93,556.58,556.53,560.08,573.99,545.97,524.66,539.12,545.57,544.17,559.63,594.75,618.91,639.07,621.66,626.76,604.65,618.06,610.56,586.34,579.24,588.69,582.39,582.79,589.04,610.31,595.35,595.35,592.7,593.9,621.36,657.18,657.63,676.54,700.35,753.23,786.54,789.24,794.5,800.35,844.87,814.06,823.51,832.47,808.95,784.54,786.74,819.91,837.02,911.21,919.21,939.62,955.28,928.91,983.19,962.13,908.45,964.33,935.77,960.18,1013.16,1012.41,1034.37,1011.96,992.85,1034.07,1095.65,1101.05,1110.11,1133.72,1120.61,1119.41,1174.09,1090.7,1188.09,1192.25,1190.2,1267.13,1206.15,1225.11,1185.34,1234.77,1210.36,1143.07,1130.17,1007.35,1037.37,1120.21,1123.21,1151.88,1151.88,1182.99,1202.9,1198.05,1171.39,1133.82,1186.69,1235.22,1262.73,1319.21,1292.95,1206.3,1188.09,1163.13,1128.16,1243.37,1330.27,1383.64,1382.04,1434.12,1434.12,1424.66,1472.59,1463.88,1427.76,1577.89,1561.53,1718.01,1698.6,1635.92,1726.31,1730.22,1691.5,1667.58,1683.99,1814.66,1814.66,1825.91,1946.52,1988.89,1999.25,1946.42,2052.23,2177.49,2180.04,2075.44,2190.1,2098.25,1897.95,1915.41,1974.44,1918.46,1867.18,2052.73,2070.89,2059.33,2059.33,1999.9,2105.8,2087.79,2141.92,2105.9,2091.1,2146.07,2078.84,2062.88,2064.38,1899.35,2004.85,1986.24,1852.43,1947.57,2016.56,2094.5,2027.76,2131.72,2210.11,2309.6,2309.8,2222.46,2115.56,2022.76,1978.64,1911.41,1778.19,1786.99,1609.8,1690.05,1840.17,1832.12,1832.12,1889.74,1888.84,2034.67,2108.6,2104,2133.87,2329.46,2282.29,2287.29,2276.49,2243.22,2248.02,2438.62,2409.8,2484.84,2624.11,2522.71,2593.6,2587.09,2712.41,2883.69,3202.6,3334.62,3234.77,3735.92,3978.64,3834.82,4020.16,3881.99,3625.11,3409.4,3495.45,3661.78,3812.41,3756.88,3756.88,4481.64,4644.37,4619.91,4857.43,5180.09,5323.16,5400.55,4982.49,4322.21,4748.77,4681.79,4461.63,4981.84,4910.51,5442.67,5106.35,5218.56,5672.79,5672.79,6059.93,5261.48,5245.17,6070.84,5664.48,5729.26,5774.34,5163.98,4880.24,4880.24,4926.21,4694.25,4746.37,4960.68,4898.95,4687.34,4918.06,4523.66,4268.13,4246.87,4329.46,4856.53,4799.8,4953.53,4607.05,4503.25,4104.7,3696.85,4375.49,4117.21,4149.57,4465.58,4468.18,4409.55,4390.05,4307.15,4344.77,4558.73,4751.53,4860.73,5061.28,4706.15,4687.89,4874.09,4836.32,4554.43,4667.18,4694.35,4679.29,4666.63,4796.05,4669.53,4782.79,4793.2,5085.49,5085.49,5003.8,5141.42,4889.49,4878.74,4622.46,4640.32,4635.07,4889.95,5081.54,5222.41,5483.54,5362.08,5405.35,5414.11,5272.54,5328.06,5328.21,5489.69,5377.14,5322.46,5230.42,5442.72,5181.79,5147.57,4947.67,4768.33,4572.94,4658.53,4396.4,4526.76,4482.59,4570.64,4284.59,4389.94,4520.76,4646.12,4918.61,4673.69,4425.91,4170.04,4277.64,3978.14,3283.59,3451.73,3667.58,3627.36,4058.53,3994.2,3893.5,3596.9,3563.88,3528.11,3453.93,2974.04,3540.27,3150.53,3007.75,3007.75],"삼성전자":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100,104.11,104.29,102.98,102.44,104.23,105.66,106.74,106.14,104.47,105.31,105.96,104.89,106.92,107.04,108.05,107.63,107.87,106.26,107.22,107.27,106.62,107.45,107.45,107.63,108.77,107.81,106.02,107.93,110.97,111.03,114.13,115.68,111.69,109.3,110.2,110.14,111.75,110.91,113.48,113.77,117.47,118.96,118.96,118.96,117.65,116.64,117.35,117.65,117.95,115.74,114.49,114.49,114.37,113.18,112.05,112.46,113.36,112.88,115.27,116.1,117.17,116.82,113.95,113.48,114.61,114.61,118.43,118.13,119.5,119.86,119.86,119.86,119.8,121.05,123.32,123.43,124.75,126.42,124.93,126.89,126.6,124.63,123.73,122.84,123.67,124.57,125.16,122.84,123.55,125.46,125.64,124.75,124.03,125.04,124.03,124.93,126.48,125.28,123.91,123.73,121.94,120.1,121.53,122.96,127.31,127.61,130.71,133.04,133.04,133.87,133.87,135.72,135.72,140.19,140.19,135.96,135.66,136.61,137.45,138.28,138.16,136.97,133.33,134.47,133.93,133.81,136.2,137.39,136.02,133.09,133.27,133.21,137.03,136.97,136.97,135.06,134.65,137.45,135.3,135.36,135.24,136.2,135.9,138.82,143.53,141.56,142.99,141.98,143.95,144.01,142.22,142.93,141.74,140.79,140.13,141.86,143.29,142.7,145.08,146.09,148.72,150.75,150.51,150.98,151.58,151.28,152.65,152.3,151.64,149.08,148.6,148.48,142.4,143.71,144.9,146.09,142.46,142.22,141.86,142.28,137.98,136.85,133.04,134.17,134.17,137.75,140.25,139.83,139.65,140.13,141.56,141.68,140.19,137.45,137.39,137.75,138.1,138.58,137.27,139.42,140.13,143.47,146.33,148.48,147.88,147.94,149.97,150.27,156.47,155.4,155.69,157.42,157.42,159.87,159.87,154.08,152.83,152.89,152.89,152.89,152.89,152.89,152.89,152.89,157.42,162.91,163.39,161,160.76,163.39,163.27,157.96,160.52,161.9,161.12,160.7,156.23,158.26,161.12,164.22,170.6,170.13,168.1,168.1,167.26,169.23,167.98,168.16,168.1,166.73,165,166.31,166.43,164.58,164.82,166.85,164.88,165.35,156.95,158.86,156.83,151.46,151.58,153.07,152.83,149.14,151.28,155.04,154.38,155.34,153.01,152.24,150.92,152.65,153.73,153.73,146.51,148.18,148.18,143.71,147.17,151.94,151.94,152.12,153.91,152.3,155.4,155.1,150.27,145.62,143.83,143.71,144.72,149.08,147.94,148.78,147.05,143.83,146.57,147.11,149.85,151.4,152.71,148.48,148.78,148.54,142.22,142.87,141.38,136.55,137.15,133.27,136.31,141.74,146.09,146.09,146.09,144.25,141.32,140.97,139.42,140.79,141.26,141.26,140.31,140.31,137.21,134.76,140.19,144.96,146.69,148.3,148.3,154.03,154.32,153.67,152.47,151.28,152.65,152.24,154.38,148.24,149.91,149.02,145.2,146.21,146.75,144.72,143.47,139.89,145.32,144.31,146.69,145.74,145.68,146.09,148.48,150.09,149.02,153.13,157.36,153.91,154.74,150.45,150.27,155.46,158.02,158.02,158.02,158.02,158.02,154.74,154.74,156.83,151.76,153.85,152.95,149.37,146.69,148.63,147.29,147.58,149.08,149.08,154.44,153.25,157.13,155.93,152.95,147.58,151.16,152.95,152.36,152.95,152.95,150.86,148.03,148.78,147.29,147.29,143.71,142.07,138.94,140.13,140.13,140.28,140.88,139.09,140.13,142.96,139.53,139.09,135.81,137.6,137.9,137,133.87,135.96,138.04,137.15,135.66,138.64,137.3,136.7,138.79,139.83,141.47,138.64,137.6,137.6,139.83,139.83,138.64,137.9,138.79,135.81,136.4,136.55,139.24,139.53,139.83,135.36,134.32,134.62,134.62,131.93,131.48,130.74,133.57,137.45,137.75,137.6,138.04,138.79,139.53,142.07,144.45,141.47,142.07,138.94,137.45,133.87,135.66,134.32,132.83,131.34,136.7,134.62,135.66,137.6,140.88,141.32,141.32,141.32,141.32,141.62,138.49,138.19,136.26,136.26,133.27,133.27,134.02,134.02,135.06,128.5,131.19,130.59,129.99,131.63,131.34,130.89,129.84,128.35,126.86,122.24,122.24,123.43,126.27,126.42,125.67,131.63,130.59,130.44,131.19,131.34,132.08,134.76,132.68,131.48,131.93,131.19,130.14,127.61,125.52,126.57,126.42,127.01,128.35,128.65,128.65,124.78,128.95,125.67,123.58,120.75,122.09,119.86,120.01,120.6,119.26,116.13,116.73,115.98,116.58,115.24,115.24,115.68,115.68,114.34,114.04,115.38,115.38,115.53,112.1,111.66,115.53,113.6,118.07,118.66,120.75,119.41,122.54,123.58,125.07,126.12,127.46,125.67,125.22,128.35,133.42,134.32,135.66,138.34,137.6,138.19,138.19,138.19,138.19,137.75,133.57,134.17,137.3,137.75,141.62,137.3,137.75,137,139.83,139.98,140.58,141.17,139.39,139.39,134.47,134.47,133.72,131.93,131.19,132.53,130.59,130.14,133.12,130.74,130.74,131.78,130.29,130.89,131.34,136.7,138.79,135.66,134.91,135.21,133.72,133.12,134.32,136.4,138.94,139.98,139.68,139.09,139.09,139.24,137.9,139.68,140.28,140.88,140.28,135.96,135.06,135.21,134.76,133.42,133.12,133.72,137.6,136.7,136.7,136.85,135.06,135.06,133.72,131.93,126.57,127.91,127.16,127.16,126.86,123.88,122.84,125.22,128.65,129.7,130.74,127.31,127.16,126.86,124.63,126.86,126.71,130.59,129.55,130.89,130.89,131.78,133.57,133.72,132.98,130.44,131.19,130.89,132.23,135.21,135.66,136.26,135.66,135.96,136.26,138.64,140.13,138.94,137.9,135.36,137.15,136.11,132.38,134.47,135.81,137.75,138.04,138.49,139.68,137.3,137.45,139.53,140.73,141.03,138.34,140.73,140.58,137.45,138.79,135.21,134.76,134.02,131.04,129.7,128.8,127.16,128.65,130.29,128.21,130.29,130.29,130.89,129.99,132.53,132.68,131.34,131.04,129.99,131.34,131.63,129.4,131.19,130.59,128.95,131.48,136.26,138.04,139.83,140.13,140.58,140.58,140.58,140.43,139.83,142.22,146.54,146.69,146.99,147.58,145.8,146.69,144.31,146.24,145.65,141.92,141.92,143.11,142.37,145.8,145.8,144.75,146.54,149.08,149.37,151.16,150.57,148.78,149.97,152.65,152.65,151.16,151.76,152.95,152.36,150.27,150.27,152.65,155.93,157.13,158.91,157.72,155.34,153.85,156.83,156.53,157.42,160.11,159.51,159.51,155.04,152.06,153.85,154.44,154.44,155.64,152.95,149.97,150.27,148.78,147.44,147.58,150.27,152.65,153.55,154.74,158.91,163.09,163.09,169.05,167.86,166.96,166.96,165.47,163.98,163.98,165.18,168.46,166.37,166.37,164.58,165.47,165.47,166.37,169.35,174.72,177.4,178.89,178.89,175.91,180.98,182.77,186.05,183.06,185.75,181.28,181.28,181.28,175.31,176.21,170.54,168.16,170.54,175.61,177.4,182.17,180.08,178,178.59,180.38,180.98,184.26,183.36,178.29,179.49,178.89,176.51,169.35,172.63,168.46,166.67,161.6,163.98,165.18,171.14,172.33,168.46,168.46,162.79,155.34,155.34,148.93,145.8,141.03,135.96,128.06,135.36,126.71,139.98,145.05,142.52,144.01,142.67,142.37,136.55,139.53,140.13,145.2,147.88,144.9,146.39,146.84,144.01,146.09,146.09,146.09,153.25,149.37,146.84,148.63,148.63,147.14,148.63,149.37,149.08,149.08,149.08,144.6,144.6,146.69,145.5,145.5,144.31,142.81,144.75,143.11,142.67,145.5,149.97,149.08,148.93,145.35,145.65,146.84,148.78,150.27,151.16,152.65,153.25,162.49,162.79,165.47,163.69,165.47,165.18,161.9,155.93,148.78,155.34,155.64,155.93,157.72,155.04,153.25,157.72,154.74,158.91,156.23,157.42,156.83,157.72,159.81,163.98,159.21,158.02,157.42,157.13,159.21,160.41,163.09,160.41,162.19,161.6,164.88,163.09,161.3,161.6,165.77,174.72,175.91,175.91,172.63,169.35,170.84,169.65,172.93,171.44,172.33,173.52,175.91,175.01,172.93,172.93,174.12,172.33,165.18,166.67,167.26,168.16,168.16,165.77,165.18,161,161.6,162.19,168.16,165.77,168.46,175.01,174.12,176.51,175.91,180.08,181.87,181.87,177.4,176.8,176.51,173.52,174.72,172.33,172.63,173.52,173.52,173.52,173.52,173.52,175.01,175.91,178.59,178,178,180.08,181.57,181.57,178.89,177.4,178.89,181.57,181.57,179.19,179.49,180.08,178.29,175.91,173.23,168.75,171.14,175.31,174.42,179.79,179.19,179.49,179.49,182.77,181.87,188.43,197.67,195.89,193.2,192.61,192.9,201.25,201.85,198.57,202.74,203.34,198.87,202.15,207.22,207.81,213.18,217.35,213.77,220.33,217.35,218.84,220.04,220.04,220.04,218.55,217.65,217.65,215.56,220.33,231.96,231.96,234.65,233.45,241.5,241.5,247.47,250.15,245.08,247.17,264.76,271.32,270.13,267.44,267.44,262.37,253.43,259.39,259.99,262.67,258.8,266.55,258.5,255.22,249.55,244.48,247.47,251.64,252.24,245.97,248.96,247.47,246.57,243.29,243.29,243.29,251.04,253.13,248.06,244.78,246.27,245.08,244.48,244.48,254.32,245.97,245.97,249.25,250.45,245.68,244.78,244.48,242.7,241.2,244.48,246.87,243.89,246.87,245.38,247.17,244.19,244.48,243.89,241.5,242.1,242.99,243.29,245.08,242.7,247.17,252.83,254.62,256.41,255.22,252.53,249.25,248.06,250.45,250.45,250.75,250.15,248.36,250.15,246.27,245.68,246.87,248.96,247.17,244.78,243.59,242.99,243.59,246.27,246.27,245.38,244.19,248.06,242.1,238.52,234.05,238.82,237.33,237.33,237.33,237.03,238.82,237.63,238.22,237.92,237.33,238.82,240.01,240.31,240.91,246.87,245.08,244.19,244.19,241.8,241.5,241.5,240.01,241.2,243.89,241.2,240.01,238.22,238.52,238.82,242.1,243.29,244.19,241.5,240.61,238.82,238.52,239.71,242.1,240.91,238.22,236.73,237.63,237.92,237.03,240.31,237.92,235.54,235.54,234.05,237.63,236.43,234.94,234.05,236.14,235.54,234.05,236.43,242.7,247.17,244.78,242.99,242.99,239.12,234.05,229.58,221.82,221.82,221.23,220.33,217.95,216.76,218.55,225.4,225.7,222.42,221.53,222.42,228.68,228.98,226.6,228.38,230.47,226.89,227.49,224.51,224.51,227.49,228.38,229.58,226.89,230.17,230.17,230.17,230.17,230.77,230.47,231.66,227.49,220.93,220.93,218.25,218.25,215.27,212.58,213.48,213.18,213.18,205.72,205.13,206.92,209,209.3,210.49,209.6,209.3,209.9,209.3,211.99,209,210.79,208.11,208.41,213.18,209.9,210.49,209.3,210.49,210.2,209.3,208.41,210.49,212.88,212.58,210.79,209.3,212.28,223.32,224.51,223.02,219.74,215.56,215.56,212.58,221.82,226,225.4,227.49,230.77,230.77,233.15,229.28,228.98,229.58,231.37,231.96,232.56,229.87,232.86,236.73,238.22,240.01,239.12,239.42,234.94,233.45,233.45,233.45,234.65,230.77,229.28,233.45,232.56,235.24,235.24,232.26,230.47,231.07,229.58,227.49,228.09,225.4,223.91,220.63,220.63,212.58,218.55,218.55,218.55,218.55,218.55,220.63,217.65,217.65,217.65,224.81,223.32,219.74,219.74,223.02,223.61,221.53,221.53,221.53,221.53,213.18,214.37,214.37,214.37,213.77,217.35,217.35,209,207.22,207.22,207.22,208.71,209.3,209.3,209.9,209.9,210.79,208.41,209.6,210.2,208.11,208.11,207.81,209.3,208.41,207.51,206.02,206.62,206.32,204.23,202.74,202.15,202.44,199.76,204.83,201.25,198.57,198.87,200.66,200.95,201.85,199.76,197.67,197.08,193.8,193.2,200.95,200.66,201.25,202.44,202.44,198.27,198.27,195.89,195.89,193.5,198.27,197.67,201.55,203.04,201.25,202.74,202.44,198.27,197.97,196.48,198.27,201.85,200.95,200.95,198.87,199.17,199.17,195.29,194.69,194.39,190.22,185.15,184.56,180.98,181.57,178.29,175.01,174.42,171.74,171.14,174.12,175.31,177.1,172.93,169.95,167.56,170.24,170.54,168.16,173.52,175.01,175.31,173.23,172.93,171.44,178.89,184.56,181.57,180.38,184.26,182.77,182.17,183.96,184.26,184.56,183.06,182.77,183.96,182.77,183.36,183.36,181.28,178.89,176.21,178.59,179.49,179.49,181.87,180.08,183.36,181.57,178.89,176.21,175.91,178,178.89,174.72,175.31,178,174.12,171.44,170.24,170.24,166.96,165.77,165.77,165.77,173.23,169.35,166.96,167.56,168.16,166.37,164.88,162.19,162.49,160.7,161.6,157.72,156.83,158.32,158.32,164.58,166.96,167.86,167.56,167.56,165.18,166.37,164.58,167.86,168.75,168.46,166.37,165.47,166.67,171.44,172.03,177.1,177.4,170.84,177.1,178.89,177.7,176.51,177.1,179.49,184.26,184.85,180.08,187.54,184.56,186.05,186.94,183.06,184.26,183.06,180.68,181.87,183.06,181.87,179.19,180.68,185.45,186.64,180.08,179.79,176.51,175.61,176.51,180.08,177.4,178,180.38,176.8,177.4,177.4,174.72,172.93,176.21,173.23,172.63,173.23,168.75,164.88,164.88,165.47,165.18,172.33,173.52,175.91,180.98,180.08,180.38,180.38,181.28,182.17,181.87,180.08,183.36,184.26,184.26,184.26,188.73,190.22,192.61,188.73,183.06,181.87,189.33,189.33,183.66,184.85,188.13,188.73,187.54,187.54,188.43,185.45,189.92,186.64,186.94,185.15,182.17,184.85,182.77,180.38,180.68,180.68,181.28,180.38,183.36,180.98,179.79,179.19,177.4,178.89,175.91,178.29,178.59,182.77,179.49,179.79,182.17,185.75,187.84,185.15,187.54,186.94,188.43,190.82,188.13,189.62,190.52,185.75,193.8,195.89,196.48,196.78,197.08,194.1,194.69,195.59,195.29,194.69,195.89,194.39,189.62,191.12,192.61,195.29,195.29,195.89,194.99,194.1,194.1,196.48,194.69,192.61,191.41,191.12,192.31,194.99,193.8,197.38,203.94,204.23,203.94,204.23,205.13,209.6,209.6,215.56,212.88,211.39,215.27,213.77,213.77,211.69,211.39,214.67,211.69,214.67,214.37,213.18,214.07,212.28,212.88,210.2,212.58,213.48,215.86,216.46,216.76,215.86,215.27,217.65,217.65,214.67,213.48,208.41,207.22,213.18,214.37,214.37,218.84,218.55,214.67,213.77,211.69,209.6,209.9,208.71,208.11,213.77,210.49,208.11,211.99,208.41,205.13,203.64,204.23,201.55,205.43,202.74,201.25,200.66,200.66,199.76,198.87,197.67,198.57,198.57,200.06,203.34,200.06,199.17,199.17,200.06,199.46,211.69,212.28,210.79,208.71,209.9,209.6,211.09,210.2,211.39,213.77,214.67,209.3,208.11,207.51,205.43,205.13,206.92,204.53,203.94,203.94,203.94,203.94,203.94,201.25,198.87,196.78,196.78,197.97,203.34,205.43,202.74,200.66,206.92,210.2,207.22,205.13,203.94,204.23,202.74,198.87,200.66,200.66,199.46,204.53,207.81,207.51,211.39,211.39,208.41,209.6,210.2,209.9,211.09,215.27,217.05,216.16,216.76,217.05,217.05,215.86,213.77,212.58,216.76,216.76,217.05,214.67,216.46,212.28,213.77,213.18,216.46,217.65,219.14,217.05,217.95,218.55,217.35,218.84,223.02,223.61,226.3,226.3,228.38,232.56,234.05,234.05,237.33,229.58,228.38,228.38,228.09,222.72,219.44,218.25,217.95,220.33,216.46,211.69,213.77,222.72,223.91,224.21,220.63,220.93,218.84,221.82,221.53,216.76,219.44,224.21,221.53,221.82,223.61,220.93,220.93,220.93,224.21,220.63,218.25,217.05,220.04,218.55,217.65,217.95,217.35,217.05,217.35,218.25,218.84,218.84,223.32,219.74,217.35,215.27,218.55,215.86,218.55,220.93,221.53,215.56,217.05,217.05,229.28,236.43,235.24,233.15,238.22,237.92,240.91,245.68,244.48,253.43,250.75,254.32,251.94,251.94,249.25,249.25,250.75,249.55,245.08,238.52,235.24,237.33,231.37,226.89,225.1,234.35,227.49,228.68,228.68,231.07,231.07,232.56,231.37,231.37,242.4,242.4,237.63,236.14,233.75,233.45,233.45,233.15,230.77,235.24,233.75,231.66,233.45,226.3,230.17,231.37,224.21,219.14,219.14,225.7,224.51,230.77,230.77,230.47,225.7,224.21,228.09,234.35,237.33,232.86,237.92,242.1,243.29,238.52,240.31,240.91,242.4,243.29,242.99,243.89,243.89,243.89,252.24,259.69,260.58,261.78,261.78,261.18,251.64,258.5,261.48,258.5,259.09,251.64,247.47,250.15,244.48,239.71,241.2,242.1,241.5,250.15,247.76,237.33,212.88,216.16,222.72,218.84,222.72,225.1,226.89,230.17,230.17,239.12,233.45,235.24,233.45,233.45,231.66,226.89,226,227.79,220.63,221.53,221.82,216.16,208.71,205.72,205.43,201.25,197.38,193.5,197.67,192.01,192.01,192.01,192.01,188.13,187.84,186.64,188.43,185.45,192.9,191.41,183.36,183.36,182.77,182.77,180.68,181.87,179.79,179.79,175.61,176.8,176.8,181.87,177.4,178,176.51,175.91,172.03,176.21,168.75,166.67,173.23,177.7,176.21,176.51,173.82,175.01,171.74,170.84,170.84,169.95,163.98,158.02,150.86,148.78,159.51,169.05,167.86,164.88,168.16,166.96,172.63,173.82,167.86,165.47,161.6,159.81,159.81,158.32,160.11,161.3,159.21,161,161,166.67,167.26,165.77,161.6,163.69,158.32,158.02,159.51,162.19,162.19,159.81,160.11,158.62,158.62,159.21,162.19,166.67,165.18,170.84,167.26,164.88,161.3,160.7,160.11,161.9,160.11,159.21,159.51,161.9,160.11,160.11,160.11,160.11,160.11,160.11,156.23,152.06,157.13,157.72,161,160.11,165.77,166.07,166.37,166.37,166.96,166.96,169.65,175.01,174.12,173.52,170.84,170.54,168.75,167.86,162.49,162.49,162.49,161,161.9,160.11,160.11,159.81,163.69,163.09,163.09,171.74,171.74,174.42,179.49,183.96,180.38,178.29,183.06,184.26,179.49,172.33,175.31,175.31,171.74,167.26,158.62,159.51,158.02,168.16,164.58,167.56,168.75,163.09,164.28,164.88,165.18,163.98,166.07,166.07,166.07,166.37,166.37,165.47,165.47,161.9,161.9,161.9,162.79,162.79,163.39,171.74,169.65,171.14,170.84,169.35,166.37,166.67,166.07,163.09,161.6,163.09,160.7,166.67,167.26,167.56,169.35,169.35,172.33,176.21,176.21,178.29,176.51,178.59,177.4,173.82,170.54,173.23,178.29,176.51,177.4,172.93,180.38,182.77,179.49,181.28,178.29,179.49,181.28,190.22,188.73,183.96,183.06,180.08,181.87,186.64,186.34,189.92,192.9,198.87,200.06,202.15,196.78,197.97,196.78,196.48,209.9,210.49,216.46,212.88,205.43,207.81,208.41,205.13,210.2,214.07,211.69,211.99,214.37,213.48,213.48,208.71,208.71,210.2,210.49,212.88,213.18,209.6,210.49,207.51,207.81,201.55,206.02,208.11,209,207.22,209,213.18,216.46,218.84,224.81,228.09,236.73,233.15,239.42,239.42,248.96,252.53,254.62,256.71,248.36,251.04,250.15,256.41,267.59,267.59,267.59,267.59,267.59,267.59,281.45,278.18,273.11,283.24,291.29,291.89,292.49,290.7,293.98,287.72,294.57,304.11,296.66,299.64,310.38,320.51,331.25,312.76,299.94,295.77,291.89,299.94,308.59,307.39,306.5,289.8,299.94,291.59,287.72,299.94,282.65,288.31,296.06,306.5,308.59,299.64,300.54,308.29,311.57,313.36,323.2,326.48,323.2,322,319.92,324.69,312.46,306.5,321.71,320.81,316.94,329.46,332.44,331.25,331.25,348.84,356.29,357.48,357.48,383.12,411.75,414.13,420.39,413.83,414.43,413.83,410.26,418.31,429.04,443.95,445.14,432.92,445.74,454.08,453.49,453.49,475.55,484.2,479.13,478.53,448.42,499.4,504.17,474.96,472.87,496.12,494.34,500.3,532.5,540.25,540.25,540.25,540.25,566.49,566.79,575.43,596.3,606.74,649.97,645.5,645.5,581.69,513.42,571.26,561.12,517.29,560.23,566.49,560.23,547.11,562.61,578.12,621.65,597.79,594.51,555.46,565.59,563.51,536.97,536.97,525.64,498.51,565.44,531.9,555.16,575.73,585.87,627.61,608.23,614.19,599.28,615.68,629.1,648.48,644.01,639.53,652.95,648.48,669.35,654.44,669.35,661.9,673.82,657.42,657.42,693.2,693.2,793.08,809.48,800.54,851.22,831.84,846.75,882.53,806.5,837.81,821.41,822.9,892.96,872.09,872.09,891.47,915.32,892.96,945.14,1040.55,1074.84,1074.84,1048,980.92,881.04,960.05,901.91,891.47,961.54,1004.77,1022.66,1033.09,1080.8,1055.46,1053.97,924.27,1015.21,1068.87,1012.22,963.03,995.83,937.69,852.71,922.78,948.12,882.53,827.37,828.86,849.73,758.8,784.14,833.33,760.29,760.29,727.49,772.21,776.68,805.01,743.89,757.3,655.93,621.65,617.17,782.65,714.07,715.56,733.45,687.24,688.73,685.75,714.07,761.78,799.05,818.43,818.43,800.54,737.92,807.99,839.3,766.25,766.25,779.67,793.08,766.25,775.19,778.18,746.87,745.38,761.78,805.01,803.52,803.52,802.03,773.7,742.4,740.91,755.81,752.83,778.18,816.94,824.39,851.22,851.22,851.22,805.01,812.46,800.54,822.9,822.9,822.9,810.97,800.54,781.16,781.16,746.87,691.71,691.71,626.12,642.52,649.97,630.59,666.37,639.53,642.52,635.06,661.9,721.53,691.71,670.84,682.77,654.44,649.97,600.78,562.61,566.19,593.02,614.19,620.16,614.19,586.76,567.38,580.5,587.06,545.92,529.22,564.7,508.94,510.73],"엔비디아":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.09,97.97,93.13,93.99,97.63,99.23,101.02,99.33,97.57,95.2,96.88,102.49,104.89,106.69,107.99,111.75,112.45,113.81,116.65,116.65,124.66,116.09,118.4,113.42,113.42,108.39,110.92,108.11,109.55,113.99,113.13,111.74,109.91,109.9,109.9,107.44,109.39,111.74,110.52,111.67,114.05,114.54,116.51,118.77,116.91,116.01,121.08,122.61,121.54,124.65,126.59,126.03,123.66,120.73,115.16,115.59,115.82,113.96,113.94,113.94,118.02,117.69,106.78,107.81,110.94,107.83,109.22,105.2,104.59,103.78,104.92,104.73,104.71,105.32,108.22,108.15,108.97,110.31,112.71,116.3,112.54,114.83,113.79,114.2,115.02,114.43,114.06,116.25,115.75,115.16,107.09,106.29,107.07,106.61,103.89,104.26,103.4,101.47,101.47,105.44,105.5,105.92,107.6,108.04,109.39,111.3,110.53,112.25,110.83,113.31,109.96,110.77,110.35,110.36,109.2,109.38,128.88,134.42,135.89,142.72,145.37,135.71,141.4,144.51,147.59,145.61,147.24,146.91,150.72,150.72,153.94,153.38,153.39,152.63,157.27,156.56,158.45,169.95,158.96,159.36,160.88,161.22,161.91,161.11,167.17,166.92,169.45,168.28,163.46,161.67,155.75,161.25,155.86,153.61,148.05,148.05,152,152.46,155.95,163.32,165.64,172.68,170.68,175.27,174.53,176.35,175.43,177.98,178.62,176.55,175.7,177.73,171.86,174.68,172.68,174.78,174.68,176.9,177.68,183.14,180.96,182.88,175.05,165.72,178.94,177.43,175.49,171.58,171.61,169.11,172.72,176.18,175.53,174.06,175.29,175.01,176.05,180.04,181.13,181.13,176.29,176.19,177.01,173.93,179.58,180.23,181.03,180,191.38,199.29,199.08,197.47,192.07,190.2,181.7,182.72,186.73,186.68,189.96,190.2,190.6,192.19,192.08,192.65,196.99,200.75,202.89,202.99,206.77,210.32,210.13,209.95,210.18,209.22,208.93,211.11,205.78,207.94,214.49,216.6,219.75,220.17,218.83,221.75,222.75,225.3,222.25,218.17,229.67,225.94,227.58,223.12,224.85,224.59,227.48,229.57,228.38,228.38,230.54,227.54,223.9,208.71,213.27,210.05,198.34,199.49,201.11,204.01,203.47,206.84,202.78,197.83,198.14,203.55,210.29,208.38,209.12,208.15,207.49,207.49,209.8,209.51,209.75,205.61,211.83,225.77,226.96,228.88,235.89,235.83,237.68,238.1,236.94,236.94,233.89,238.78,238.49,244.51,248.32,253.86,250.56,251.14,258.56,262.3,257.91,261.18,255.55,248.14,227.07,239.7,243.12,231.13,246.61,242.3,247.19,256.53,261.93,259.1,259.1,264.67,256.63,257.31,261.32,262.01,261.46,257.15,246.74,251.34,250.4,257.32,256.98,256.27,260.68,265.39,263.21,264.31,264.95,266.16,256.08,265.2,264.12,256.99,247.55,259.78,239.63,235.2,246.08,246.08,234.88,239.45,240.4,235.24,227.66,228.89,242.17,240.4,249.28,245.99,245.98,252.41,251.16,243.37,243.02,237.89,235.04,230.22,239.32,240.5,238.98,241.36,240.47,247.57,254.02,264.24,266.07,271.79,276.41,270.46,271.34,260.93,261.41,263.21,261.33,259.53,257.89,263.03,263.19,264.88,264.88,264.15,268.82,267.97,273.74,281.43,281.66,281.74,279.35,278.7,276.93,279.01,278.82,283.61,281.86,281.68,276.45,278.73,273.2,266.66,254.09,257.14,250.47,255.93,251.73,257.4,251.66,251.66,257.92,262.81,264.85,269.1,263.02,266.95,264.92,263.73,269.57,267.45,267.8,266.59,265.02,264.28,267.63,270.79,267.79,259.41,260.18,261.9,266.31,267.88,269.93,273.03,274.59,272.51,270.74,272.15,277.79,275.29,273.55,260.14,263.35,269.17,279.27,283.54,289.26,293.17,291.55,295.92,295.2,298.25,298.25,301.46,295.85,289.79,288.87,291.92,289.87,284.99,288.32,293.73,291.07,287.98,289,282.95,279.94,282.33,285.21,283.63,284.14,298.61,307.47,304.41,304.68,296.77,286.75,282.4,282.16,261.07,249.85,261.97,250.11,261.22,258.27,254.52,243.51,245.69,234.9,211.89,220.85,210.7,197.24,215.71,224.03,231.76,228.37,225.02,224.27,227.17,218.88,218.54,201.4,211.78,209.53,215.06,174.72,153.76,158.41,153.77,153.77,154.08,162.63,163.35,170.09,167.21,173.66,180.68,166.94,166.94,168.2,156.85,161.36,157.46,158.22,158.21,155.62,152.57,156.14,147.18,143.56,137.68,135.03,135.03,141.43,139.38,142.01,141.86,144.75,136,144.71,152.37,148.58,151.5,154.32,158.14,159.86,159.25,158.16,161.22,166.75,166.75,158.08,158.63,167.72,170.17,146.65,139.84,145.99,152.75,153.79,158.52,159.33,162.58,156.65,157.44,155.62,160.63,162.45,164.2,167.19,167.19,166.44,168.47,165.52,169.15,168.62,166.93,165.14,163.91,166.24,166.59,166.32,161.57,158.6,160.07,171.23,172.69,179.17,175.92,180.44,179.52,186.71,185.32,195.45,188.61,184.66,187.94,187.55,188.34,190.8,193.69,194.45,200.43,200.04,202.9,203.79,201.11,204.12,203.53,201.9,196.26,199.99,199.01,197.96,197.96,200.27,202.6,203.13,198.61,189.24,190.55,192.33,191.76,194.66,194.46,191.11,183.94,184.81,180.84,179.39,168.37,172.18,169.57,170.22,166.33,161.25,164.76,161.73,156.54,154.23,154.23,152.3,149.12,147.82,143.94,142.15,151.95,150.12,152.78,154.61,157.72,160.18,155.35,157.54,153.69,154.11,162.45,162.7,163.74,161.26,162.21,160.96,169.23,173.45,174.51,176.57,172.38,172.94,172.94,170.26,167.05,167.16,170.08,176.69,178.1,177.74,177.54,180.33,180.83,178.98,182.04,186.65,189.84,184.23,186.03,185.76,186.43,179.28,175.24,171.28,160.23,161.89,163.52,168.16,163.83,160.93,165.82,159.46,158.08,169.55,181.47,178.38,181.95,182.21,172.61,175.8,171.93,171.31,177.45,177.99,177.99,174.44,179.32,190.99,189.83,191.8,194.64,195.87,195.8,193.33,191.49,192.4,191.24,188.01,183.5,185.78,183.33,189.38,188.44,182.51,184.96,184.89,183.87,192.66,193.36,195.87,188.32,192.02,194.49,197.63,198.2,208.66,206.36,206.45,202.41,208.28,207.85,207.3,209.18,217.34,219.73,215.62,215.71,213.6,215.27,223.67,222.73,220.62,221.38,220.78,221.21,222.73,221.62,222.92,216.97,225.57,221.01,224.4,223.33,224.09,235.05,230.58,231.9,231.9,230.3,222.35,220.66,222.53,221.8,225.45,225.45,227.37,230.94,238.09,238.01,239.24,242.58,243.87,250.2,254.35,253.77,253.55,253.55,254.16,251.69,246.86,250.03,254.93,250.84,251.9,254.95,255.42,258.23,259.61,267.75,262.76,260.94,264.51,264.88,264.88,263.46,265.76,268.69,266.16,255.23,263.49,260.91,261.19,251.23,255.37,262.6,266.45,270.16,267.34,279.43,284.66,289.6,287.73,307.93,307.93,315.13,334.4,328.02,312.47,290.38,278.45,284.4,268.41,286.97,293.73,282.53,302.32,290.39,282.69,260.8,277.42,261.9,229.85,255.91,208.69,230.87,215.51,226.3,218.63,226,264.78,260.99,273.34,268.55,282.21,280.1,258.28,271.46,259.18,285.2,275.24,283.66,279.41,279.41,286.74,301.72,298.42,313.14,310.62,305.02,286.38,304.06,301.79,307.71,315.67,309.6,317.14,310.57,300.48,309.52,312.12,316.43,323.95,332.06,342.81,331.63,330.68,341.32,360.89,371.92,374.26,381.26,372.98,383.65,383.65,370.53,362.35,360.73,377.24,374.3,375.1,372.73,372.61,379.13,374.24,384.49,398.12,373.87,379.66,389.92,385.44,392.56,391.8,393.64,404.92,401.66,392.54,403.36,389.12,391.03,403.69,405.06,408.55,408.55,418.2,419.58,434.22,446.67,445.4,427.26,441.06,434.69,430.76,433.6,446.74,439,443.68,430.55,433.3,442.95,434.19,444.82,451.13,451.16,467.97,477.22,479.73,481.8,476.02,474.55,461.16,486.25,486.37,491.51,524.37,521.12,515.93,516.03,539.09,540.65,541.92,542.9,536.74,558.82,568.46,587.44,609.78,553.2,536.5,536.5,506.34,540.43,523.29,517.03,547.12,552.16,531.91,529.74,518.09,532.03,537.15,515.3,524.83,547.18,554.03,562.14,575.09,578.66,555.19,579.85,583.85,593.52,588.19,584.96,604.65,605.6,599.1,593.77,587.04,573.7,579.98,574.85,567.89,577.63,558.55,569.41,536.69,553.56,532.74,534.73,553.37,586.3,601.85,618.94,579.35,542.77,570.31,571.96,565.17,574.44,570.49,570.77,571.26,556.27,558.5,550.75,562.52,562.52,563.65,569.61,569.12,575.69,569.38,576.27,578.33,567.42,549.6,551.37,553.11,565.67,567.87,562.85,567.05,564.11,566.67,564.37,552.94,552.28,552.28,548.29,550.13,558.74,554.88,557.37,569.75,536.16,567.17,564.31,578.96,573.15,575.15,561.06,546.57,546.57,553.62,568.09,589.42,582.83,580.31,571.04,549.05,554.71,552.11,562.62,576.21,575.09,580.78,577.66,613.7,606.24,627.53,648.21,635.9,635.9,651.59,633.56,630.28,634.43,610.17,601.08,616.26,565.61,582.91,588.32,569.81,544.25,525.78,529.66,492.75,532.15,529.94,552.27,546.42,560.67,564.92,567.05,540.75,545.99,560.46,555.55,537.37,532.79,545.71,550.35,547.09,567.35,587.05,587.05,594.52,589.16,601.15,608.52,612.05,646.43,666.43,649.33,685.89,676.34,652.93,644.83,652.87,631.19,648.83,657.87,653.78,649.31,651.35,637.96,630.61,609.98,614.54,617.28,629.57,606.34,608.06,584.78,580.82,605.38,602.08,595.72,597.84,621.08,637.2,663.56,665.08,667.3,658.29,690.45,690.45,691.3,713.13,721.27,747.14,748.87,741.98,737.79,740.62,757.63,765.86,756.07,757,793,792.21,783.22,802.75,810,816.3,808.88,849.43,851.21,850.18,859.08,870.77,870.77,879.76,865.87,845.94,852.2,871.85,860.69,843.33,806.13,771.91,798.2,791.07,824.99,832.81,831.28,820.06,816.41,828.94,835.7,828.77,839.44,842.21,861.71,877.14,865.63,862.61,847.35,837.28,846.03,858.06,847.94,827.03,809.27,841.48,884.75,933.29,926.28,944.13,937.97,962.11,964.32,951.44,953.82,951.91,970.91,970.91,963.21,949.48,942.6,955.39,941.54,945.36,949.57,945.36,930.83,897.38,903.03,932.57,955.56,938.52,920.62,879.78,872.04,880.5,881.61,838.68,869.24,879.82,895.76,885.39,879.61,878.59,889.98,924.28,929.21,944.51,947.4,939.45,964.49,965.93,984.63,1050.56,1039.25,1060.08,1086.69,1097.74,1122.13,1130.51,1266.65,1264.56,1309.28,1303.03,1252.11,1291.68,1291.68,1276.17,1283.73,1243.69,1346.3,1401.98,1358.24,1349.31,1388.76,1388.76,1338.99,1418.6,1388.84,1336.1,1365.47,1304.56,1276.68,1378.26,1352.71,1295.93,1283.52,1196.94,1204.42,1294.61,1206.55,1181.64,1178.15,1235.79,1249.6,1259.8,1259.8,1315.27,1288.79,1275.15,1257.51,1250.07,1280.25,1244.93,1173.27,1197.66,1158.09,1164.59,1182.32,1190.05,1129.53,1145.13,1145.13,1100.97,1065.43,1026.46,993.48,993.39,948.85,967.89,932.7,970.78,1040.74,1047.2,1072.87,1017.87,1033.64,1051.03,1067.18,1135.05,1097.61,1017.92,1031.43,1126.13,1126.81,1041.63,1004.87,1004.87,994.16,951.52,1009.37,1026.76,1036.45,997.85,1029.43,1007.93,974.86,907.53,914.42,978.17,963.04,939.33,906.6,976.43,1041.16,1052.64,1124.34,1136.29,1127.36,1089.53,1196.47,1177.01,1199.4,1217.98,1176.92,1159.75,1135.35,1162.89,1102.16,1037.38,1028.92,982.64,931.55,913.99,943.7,903.54,903.54,925.85,943.49,913.06,857.85,829.45,845.9,798.55,782.7,840.8,788.31,830.22,833.15,864.27,800.94,793.75,720.43,747.85,706.83,687.49,752.57,733.78,772.59,719.92,727.83,709.55,718.22,686.6,721.5,758.73,799.53,799.53,793.62,778.66,832.73,795.66,798.47,804.42,792.6,767.1,721.45,665.05,673.08,702.45,663.1,674.95,674.95,704.11,695.36,689.62,727.91,716.99,679.29,660.59,644.31,617.28,617.28,636.02,643.08,674.02,673.17,644.01,641.04,644.52,653.36,669.94,684.35,722.22,756.86,767.19,736.12,723.58,702.71,756.14,764.38,771.99,783.81,787.42,803.02,816.7,807.1,756.26,726.21,769.18,762.6,795.2,808.93,802.42,779.3,797.92,758.64,724,730.25,731.99,761.36,691.11,671.6,657.44,641.55,592.37,580.04,580.04,572.31,582.89,594.62,611.5,616.51,558.11,557.99,549.53,560.96,568.78,560.03,563.64,533.89,531.97,519.73,527.6,541.32,519.39,515.95,531.8,559.64,561.43,558.07,513.27,496.02,492.45,488.79,508.34,477.19,505.28,508.64,512.21,518.29,529.85,535.5,563.64,548.12,560.03,587.99,573.67,575.62,561.85,570.44,601.68,607.84,620.64,585.53,669.43,693.95,692.59,708.36,676.23,666.33,654.94,651.03,681.67,702.11,702.11,691.53,672.7,664.71,719.29,728.3,717.29,705.98,679.5,685.16,729.74,722.6,745.3,768.12,751.21,720.52,704.32,690.85,683.67,701.35,651.96,646.31,646.31,600.19,596.58,620.68,621.15,621.15,608.44,626.88,606.31,631.56,664.24,676.19,680.1,701.77,718.27,718.27,752.4,738.58,712.57,758.22,815.77,818.83,821.29,841.65,865.58,814.45,830.39,890.15,922.71,896.82,896.36,942.43,943.79,949.4,903.84,926.07,976.35,967.55,935.16,909.06,909.06,877.91,882.12,1005.8,989.74,998.87,986.76,964.74,990.93,1015.41,1001.13,989.82,1027.78,996.11,976.09,976.13,1022.76,1029.77,1085.58,1093.4,1100.84,1113.55,1124.98,1155.71,1138.2,1127.66,1122.52,1146.91,1163.87,1180.62,1188.61,1166.85,1142.54,1149.17,1149.17,1172.2,1154.78,1126.13,1124.77,1137.31,1147.68,1175.94,1187.16,1152.01,1152.65,1149.38,1115.33,1145.72,1157.2,1179.43,1228.77,1199.02,1181.68,1171.48,1219,1239.02,1214.37,1227.71,1214.66,1204.55,1230.6,1241.65,1282.67,1346.42,1328.83,1325.09,1304.35,1297.97,1614.28,1655.34,1655.34,1704.86,1608.08,1690.36,1671.53,1664.9,1642.93,1592.82,1636.81,1647.86,1678.12,1743.58,1827.52,1812.9,1814.56,1814.56,1861.99,1829.56,1828.71,1794.03,1727,1779.87,1747.61,1735.08,1797.98,1802.7,1802.7,1798.62,1789.52,1806.52,1792.8,1802.36,1865.99,1954.18,1932.59,1974.75,2018.66,2000.94,1934.76,1883.29,1896.16,1941.52,1931.87,1950.91,1987.04,1986.14,1976.71,1881.59,1892.04,1899.05,1930.38,1898.37,1808.69,1801.64,1736.48,1859.65,1867.6,1848.31,1842.27,1840.36,1996.26,1941.05,2002.59,2004.59,1955.92,1990.65,2073.49,2093.89,2097.76,2061.8,2061.8,2063.46,2000.26,1965.4,1936.97,1920.22,1907.13,1933.27,1937.35,1865.9,1868.71,1849.75,1795.3,1743.36,1768.57,1794.58,1781.36,1805.04,1831.43,1848.86,1903.39,1849.62,1871.89,1899.39,1945.04,1924.26,1946.57,1989.42,1995.32,1932.25,1959.2,1867.52,1793.48,1789.44,1759.09,1826.59,1855.83,1775.75,1713.99,1721.39,1749.48,1733.29,1798.96,1849.16,1912.87,1944.58,1953.25,1979.56,1995.54,2054.4,2066.52,2110.55,2077.91,2103.07,2095.34,2142.56,2122.79,2070.6,2070.6,2030.64,2050.45,2032.56,2046.12,1987.89,1987.67,1934.33,1979.22,1934.03,1980.49,2019.17,1981.81,2025.59,2043.91,2055.04,2077.99,2128.45,2108.34,2044.88,2082.24,2075.44,2075.44,2094.53,2100.39,2104.86,2104.86,2047.31,2021.85,2040.08,2086.79,2220.93,2258.63,2310.06,2330.12,2325.36,2325.36,2396.43,2382.45,2427.24,2528.57,2535.5,2544.81,2608.1,2618.94,2594.03,2654.98,2668.11,2615.11,2678.87,2812.03,2946.85,2899.71,2979.45,2959.98,3065.9,3070.79,3065.69,3141.01,3088.22,3086.3,3086.3,2951.95,2867.79,3338.14,3349.99,3361.68,3345.06,3300.95,3362.53,3497.14,3622.87,3653.77,3770.06,3938.75,3720.24,3645.69,3906.62,3863.05,3737.92,3733.38,3759.64,3799.72,3841.12,3886.3,4007.61,4037.91,3934.16,3835.94,3840.44,3840.44,3840.74,3802.02,3781.28,3651.26,3740.64,3703.45,3627.84,3699.46,3851.49,3748.21,3655.34,3715.44,3571.78,3598.81,3238.76,3379.79,3503.26,3386.55,3512.15,3729.04,3729.98,3672.38,3529.53,3647.52,3773.84,3916.27,3848.86,3842.82,3772.05,3820.13,3842.27,3882.95,4022.1,4010.58,3930.68,4028.48,4054.23,4035.7,4411.82,4525.3,4525.3,4841.19,4880.46,4696.63,4659.78,4887.9,4948.97,5204.12,5142.83,5138.16,5176.5,5139.09,5321.43,5508.87,5605.36,5567.1,5762.62,5762.62,5558.6,5379.66,5020.08,5359.26,5372.44,5270,5250.88,5283.18,5213.9,5452.34,5452.34,5348.21,5448.94,5584.1,5734.14,5414.94,5493.15,5459.14,5370.74,5014.98,5146.74,5012.43,5250.88,5210.5,4856.02,4772.29,4805.44,4742.96,4408.88,4973.75,4641.8,4559.35,4269.47,4430.98,4204.02,4461.59,4452.24,4633.73,4936.35,5018.81,5221.97,5295.08,5525.45,5408.56,5461.69,5259.38,5498.67,5374.99,5453.19,5338.86,4997.98,5073.64,5073.64,4590.37,4514.29,4556.8,4370.63,4525.34,4594.62,4969.08,5063.86,5062.16,4963.55,4912.97,4818.62,5009.88,4930.4,4941.45,5137.39,5249.6,5272.13,5159.92,5161.62,4972.9,5051.54,5221.55,5309.53,5428.54,5648.28,5638.08,5729.89,5729.47,5868.45,5593.45,5768.57,5820,5865.48,6108.17,6103.07,5931.78,5967.91,6015.94,5972.59,6003.61,5922.43,5642.76,5754.97,5782.59,5946.66,6188.93,6327.91,6274.78,6174.05,6302.84,6216.98,6237.81,6034.64,5956.86,6248.43,6200.83,6233.98,6033.36,5781.32,5819.57,5752.42,5752.42,5876.1,5892.25,5961.53,6168.95,6165.55,6054.19,5899.9,5740.94,5921.16,5837.42,5706.09,5610.46,5542.03,5479.12,5554.35,5725.21,5936.46,5959.83,5959.83,5947.51,5823.4,5843.8,5707.79,5878.65,6140.47,6351.29,5956.43,5955.16,5955.16,5776.64,5662.73,5600.25,5790.67,5677.19,5853.15,5853.15,5985.76,6250.98,6257.36,6061.84,5033.26,5482.52,5257.68,5298.06,5103.39,4958.45,5043.03,5305.71,5469.34,5518.65,5677.19,5644.46,5573.9,5750.29,5901.6,5901.6,5924.98,5917.76,5955.16,5713.74,5537.35,5382.21,5579.85,5106.79,5309.53,4847.94,4929.98,4985.66,4699.61,4789.71,4547.02,4622.68,4919.35,4912.55,5171.39,5080.44,4906.17,4995.01,5037.93,5002.66,5160.34,5129.74,4835.19,4736.16,4661.35,4606.52,4681.76,4693.23,4326.85,4008.5,4150.04,4093.08,4859.42,4572.1,4714.91,4705.56,4768.89,4441.19,4313.68,4313.68,4119.01,4203.17,4365.53,4523.64,4718.31,4621.4,4633.73,4629.48,4743.81,4866.65,4837.74,4825.84,4975.45,4988.63,4958.03,5227.92,5522.47,5752.42,5730.74,5754.97,5762.19,5711.61,5601.96,5645.73,5580.28,5580.28,5759.22,5729.89,5916.06,5743.49,5839.12,6002.34,6032.09,5950.06,6023.59,6062.27,6118.8,6070.77,6163,6034.22,6149.82,6125.6,6183.4,6183.4,6114.12,6127.72,6286.26,6558.71,6588.89,6704.92,6715.12,6515.78,6683.67,6772.5,6772.5,6725.75,6800.55,6922.96,6974.82,7009.67,6973.54,7255.34,7283.82,7353.1,7328.02,7284.24,7099.35,7258.74,7384.55,7374.35,7512.49,7459.78,7619.59,7560.09,7383.7,7650.62,7576.67,7625.97,7683.35,7765.38,7738.18,7784.93,7718.2,7736.48,7669.75,7736.05,7465.31,7455.11,7437.25,7565.19,7642.55,7725.85,7718.63,7657.85,7403.25,7403.25,7258.74,7251.94,7296.14,7098.93,7153.76,7257.89,7537.14,7530.34,7557.96,7554.99,7433,7237.91,7490.81,7509.08,7804.06,7583.89,7521.84,7552.44,7573.69,7729.25,7930.29,7958.35,8028.48,7974.5,7886.09,7864.84,8037.83,8184.89,7784.93,8004.25,7651.9,7643.4,7727.55,7787.48,7762.83,7699.93,7662.52,7742.43,7916.69,8138.99,8544.47,8799.91,8623.53,8606.52,8793.11,8445.01,8297.1,7994.05,7997.02,8460.31,8209.97,8237.17,7942.2,8082.88,7931.14,7708.43,7927.74,7677.82,7603.02,7759.01,7557.96,7661.67,7661.67,7523.11,7647.22,7712.68,7633.19,7794.28,7753.05,7886.52,7861.86,7811.28,7690.15,7438.95,7492.93,7553.71,7265.54,7401.55,7692.7,7807.46,8042.08,8016.58,8016.58,8098.18,8000,7971.1,7926.89,8026.78,7995.75,7958.35,8037.83,7864.84,7857.19,7860.59,7897.57,7784.08,7950.27,7915.42,7915.42,7568.59,7791.73,7856.34,7976.62,7925.62,8012.75,8140.26,8182.34,8123.69,7889.07,7665.07,7403.68,7305.49,7880.57,8077.36,8013.6,8077.78,7945.6,7770.06,7770.06,7861.86,7989.8,7986.4,8068.01,8141.54,8196.79,8311.98,7858.46,7531.19,7756.03,7652.75,7779.83,7792.58,7557.96,7763.26,7853.36,7906.92,7784.08,7661.25,7787.48,7732.65,7667.62,7589.42,7340.35,7465.31,7446.6,7594.52,7278.29,7120.18,7020.3,7412.6,7469.98,7539.69,7539.69,7550.31,7569.87,7739.03,7816.81,8017.43,8046.33,8352.35,8452.66,8430.56,8572.1,8588.25,8495.59,8606.95,8485.39,8852.19,9206.67,9060.46,8893.85,8482.41,8434.81,8436.09,8351.93,8833.49,8989.48,9146.74,9326.96,9383.91,9598.55,10019.76,9576.88,9449.37,9376.69,9498.25,9329.93,9152.27,9152.27,9132.29,9036.23,9106.36,8974.18,9536.07,9470.62,9127.62,9293.81,8717.46,8867.92,8848.79,8518.54,8707.68,8721.28,9029.86,8815.64,8698.33,8955.05,8955.05,8868.35,8502.39,8458.19,8319.63,8183.19,8286.9,8504.52,8397.83,8280.95,8280.95,8311.55,8370.2,8675.8,8618.85,8966.53,8650.73,9002.23,9031.98,8815.22,8620.13,8640.1,8810.54,9013.28,8873.02,8791.41,8352.35,8373.6,8076.08,8289.87,8532.57,8782.91,9008.18,9317.61,9307.83,9519.07,9246.63,9244.5,9524.6,9576.03,9570.08,9563.7,9339.71,9247.05,9216.87,9126.34,8861.12,9055.36,8911.27,9689.94,9246.63,9383.91,9241.95,9538.2,9709.91,9791.1,9791.1,9594.3,9506.75,9281.05,9278.08,8966.53,9017.96,9091.49,9322.71,9447.24,9664.44,9727.76,9584.95,9545.43,9566.25,9727.34,9657.21,9706.94,9812.35,9943.68,10154.07,10168.53,10093.29,9796.2,9745.19,9619.38,9712.89,9406.01,9233.02,9101.26,9227.07,9200.72,9434.49,9019.66,8966.53,9180.75,9263.2,9154.39,9081.29,8697.91,8588.25,8785.04,8506.22,7718.63,7932.84,7594.09,7178.41,7384.12,7063.65,6921.69,6636.49,6607.59,6416.32,6204.65,5335.46,7015.19,6604.19,6345.77,6345.77],"테슬라":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,96.66,96.57,92.74,92.53,95.25,94.76,98.49,98.05,97.99,98.12,101.04,101.31,100.74,103.25,103.37,106.46,105.9,106.29,108.78,108.78,111.94,112.04,109.46,108.96,108.96,110.64,115.74,115.62,116.77,117.93,117.21,117.14,117.07,121.23,121.23,120.12,121.54,124.29,124.79,126.92,129.82,129.75,128.75,128.98,127.79,128.46,127.09,128.26,128.15,131.43,131.29,133.63,137.26,137.28,143.08,143.27,142.65,137.14,138.81,138.81,141.44,139.46,130.53,131.04,125.55,127.47,127.48,127.72,128.27,128.09,126.75,125.88,124.87,124.26,125.52,131.55,130.39,133.62,133.34,133.55,127.82,130.03,129.91,134.18,137.78,141.47,141.43,141.71,141.9,152.21,154.85,150.42,152.3,154.26,159.29,157.41,151.36,155.01,155.01,153.7,153.1,155.78,154.25,155.82,157.06,160,158.15,157.37,160.14,164.61,162.6,158.59,150.65,157.23,156.63,163.81,165.83,164.75,165.62,161.06,161.64,156.08,159.63,158.49,158.24,154.94,158.18,161.55,165.79,165.79,170.86,173.88,173.55,173.29,177.1,179.92,183.38,188.66,182.19,183.06,191.69,194.1,191.38,189.37,188.56,189.8,191.92,195.09,195.52,192.48,184.77,189.29,183.94,184.38,179.8,179.8,166.78,157.47,159.71,161.15,166.85,168.02,164.9,167.13,162.95,167.37,165.85,168.22,167.45,174.65,173.16,175.33,170.54,170.85,164.93,162.95,166.17,176.98,181.99,181.1,186.22,185.36,181.22,182.48,185.5,184.75,185.04,179.44,177.17,172.27,174.05,179.87,179.96,177.47,176.25,177.12,180.08,181.47,181.22,181.22,178.25,175.67,178.77,175.1,185.44,184.96,186.74,192.56,193.66,196.31,191.26,190.65,186.87,179.02,175.91,176.04,173.86,173.16,173.92,174.14,177.51,181.02,181.18,181.97,174.86,181.31,180.81,181.36,181.3,178.77,181.39,183.38,179.39,175.96,171.84,172.01,166.14,166.31,163.61,163.21,169.04,163.72,152.59,156.07,154.39,156.05,155.21,154.49,154.49,160.82,157.4,158.73,159.34,160.64,157.42,162.05,159.39,159.39,160.9,161.54,161.92,156.81,157.48,156.3,155.62,154.85,159.73,158.7,160.68,167.71,173.89,172.87,172.29,175.12,172.79,168.83,167.74,169.11,165.82,165.82,161.78,158.9,160.8,158.75,163.44,161.76,160.42,161.42,171.53,170.15,170.71,172.32,171.44,171.44,173.39,177.01,175.69,178.47,179.26,179.88,176.37,172.16,174.82,178.22,176.33,180.66,178.08,175.28,169.86,170.29,175.91,160.73,158.28,160.99,165.03,164.34,170.34,171.06,171.06,170.7,169.95,176.51,179.51,182.25,178.97,174.92,168.74,170.87,169.97,167.35,169.44,167.81,166.82,176.17,174.3,166.55,166.02,163.85,159.88,158.35,161.4,157.61,153.75,155.1,142.35,131.44,135.7,135.7,128.74,136.41,146.31,155.88,152.61,147.7,155.36,153.44,149.95,153.14,148.49,146.69,149.58,153.01,147.99,144.49,144.53,143.12,145.56,149.95,149.86,152.93,153.55,145.04,149.95,154.38,153.97,156.46,155.53,153.51,148.87,144.9,146.07,145.08,141.15,145.06,140.23,142.3,141.67,142.18,142.18,144.69,148.75,145.18,148.8,151.31,148.44,162.91,161.17,161.97,169.34,174.78,175.8,182.4,182.63,189.08,179.76,184.69,177.19,170.12,169.8,174.38,175.66,178.43,174.87,170.85,158.51,158.51,157.64,157.51,162.41,164.42,162.64,161.49,162.59,158.12,164.54,165.13,163.28,159.89,154.6,151.66,157.42,156.36,151.53,147.96,152.02,153.4,178.23,177.53,174.38,193.54,188.83,179.71,181.26,181.73,177.26,172.7,171.04,155.77,157.27,164.13,164,163.22,164.6,162.79,159.01,155.52,154.57,153.81,153.81,147.33,143.15,143.25,134.22,145.57,142.48,148.14,147.59,150.52,150.34,145.3,152.47,152.12,152.51,152.8,153.47,157.85,156.8,135,158.42,153.49,150.32,143.7,133.57,127.76,134,130.98,128.61,131.95,132.36,141.03,138.58,134.57,132.57,133.06,149.98,147.1,160.54,168.72,170.74,168.21,172,175.55,176.63,174.08,173.9,177.52,179.18,178.72,168.92,172.72,175.4,177.67,180.66,180.23,177.18,172.44,172.44,166.14,176.42,175.36,177.38,173.96,178.71,182.79,183.41,183.41,185.12,182.53,186.19,187.01,186.93,192.12,186.47,177.66,171.85,169.78,160.81,163.05,150.62,150.62,166.27,161.19,170.24,169.69,158.13,153.15,161.99,170.79,170.99,172.61,175.9,177.07,170.51,175.62,176.45,177.09,154.12,154.12,152.42,146.64,148.64,151.46,151.12,151.67,157.44,156.55,159.19,159.54,163.85,161.75,156.8,155.92,159.51,158.99,157.13,154.89,156.99,156.99,155.84,154.27,148.5,150.27,152.34,151.88,160.48,163.1,150.31,145.5,141.01,140.85,141.03,144.88,148.34,144.48,147.34,147.85,140.44,137.41,136.38,139.51,139.72,134.88,132.79,136.53,140.13,142.07,142.7,147.45,145.77,148.79,136.54,140.2,139.3,138.85,140.76,136.87,136.5,135.83,139.38,138.3,139.33,139.33,133.97,134.56,131.89,126.26,119.9,123.12,121.71,119.32,124.46,130.04,130.2,125.97,124.84,123.38,122.13,115.75,118.45,118.27,116.42,107.6,104.71,104.57,98.27,99.68,97.2,97.2,96.22,96.81,95.97,94.41,91.26,98.72,100.24,105.01,104.27,108.55,110.7,106.7,109.07,109.59,114.74,114.59,115.45,111.98,113.12,114.03,112.05,111.8,113.62,113.94,115.83,114.5,119.77,119.77,118.86,117.45,117.31,121.82,121.66,124.96,129.26,128.69,129.95,129.28,131.64,130.37,132.66,135.06,116.67,116.28,120.22,123.53,123.19,119.24,119.49,116.42,117.66,119.02,121.51,119.83,116.77,119.82,111.98,109.95,112.15,115.66,115.16,112.6,113.27,107.79,109.63,109.16,109.93,113.05,115.04,115.04,114.73,112.52,117.06,115.97,118.19,120.1,125.99,125.37,125.03,123.81,124.82,124.15,125.74,122.69,123,113.81,116.61,123.68,123.46,122.82,124.77,123.97,118.82,118,121.21,122.4,124.68,124.79,126.4,131.02,131.5,132.44,133.58,131.02,129.26,130.32,129.86,152.8,167.31,167.1,161.24,160.62,160.58,159.75,161.88,161.75,166.52,171.09,171.9,175.96,178.43,176.48,178.13,179.57,178.46,183.32,179.59,180.92,169.81,171.5,167.71,168.92,168.92,168.23,170.75,171.43,169.81,168.45,171.27,173.12,177.87,179.84,183.4,182.74,194.52,193.24,200.46,206.02,206.81,213.76,216.83,216.83,219.73,219.45,211.45,213.3,219.39,225.89,230.24,239.17,250.94,245.43,243.8,267.62,274.28,264.38,261.82,260.3,260.3,279.01,290.41,291.76,288,284.53,289.06,296.24,326.74,331.72,397.72,452.3,374.62,381.89,381.43,393.27,394.85,391.23,409.95,407.93,407.93,437.69,467.79,458.6,459.41,425.14,407.87,397.1,346.22,340.6,379.17,380.13,382.16,369.44,358.7,310.01,329.05,323.39,285.82,278.72,226.94,219.36,184.18,218.05,217.99,221.44,257.5,274.96,269.3,262.27,256.03,267.18,245.54,231.73,244.75,263.23,278.12,279.85,292.17,292.17,331.91,361.97,372.13,379.98,384.4,380.56,350.15,373.3,359.8,369.75,407.28,392.17,408.17,398.67,357.6,388.12,391.7,399.03,397.74,417.82,413.67,412.71,403.3,409.61,407.49,414.86,412,415.85,421.99,416.52,416.52,417.54,418.23,410.88,425.76,457.93,449.5,450.21,440.74,451.59,484.36,479.64,522.66,496.04,476.89,505.25,500.78,505.71,511.91,510.35,507,510.8,489.93,502.74,489.36,514.66,550.59,570.89,616.29,616.29,699.36,708.68,696.45,710.93,787.6,763.34,773.4,788.3,765.16,765.27,837.75,799.69,811.92,771.5,722.52,785.03,752.85,764.38,758.46,729.53,757.19,758.21,757.2,759.52,740.73,723.32,700.79,792.76,826.53,841.68,935.98,962.21,957.85,1020.72,1045.27,1027.02,1031.68,1097.88,1141.52,1128.59,1270.45,1211.12,1140.55,1037.63,1066.49,1066.49,841.86,933.82,946.72,950.23,1069.8,1146.64,1126.25,1079.52,1127.24,1145.7,1081.56,969.71,988.65,1038.5,1073.83,1068.4,1093.74,1142.57,1058.26,1085.25,1055.43,1084.29,1085.87,1106.47,1127.63,1138.72,1176.07,1144.4,1120.92,1098.38,1075.72,1077.5,1085.53,1072.38,1071.49,1082.7,1035.13,1047.39,989.29,1021.08,1080.72,1073.27,1116.89,1096.14,1073.99,1046.2,1063.46,1049.77,1041.45,1040.41,1125.87,1240.67,1272.87,1248.24,1330.44,1415.92,1463.39,1463.39,1493.37,1447.07,1490.82,1450.18,1512.8,1527.23,1636.14,1656.84,1541.1,1598.69,1555.14,1631.22,1614.45,1587.73,1672.19,1771.87,1656.79,1632.52,1646.9,1687.16,1687.16,1692.05,1697.91,1771.31,1799.08,1860.52,1874.13,1927.34,2080.46,2243.58,2068.1,2165.61,2178.28,2154.29,2106.26,2106.26,2153.15,2168.19,2154.27,2158.47,2245.56,2251.4,2203.14,2129.89,2023.07,2141.06,2225.14,2179,2167.01,2172.73,2201.25,2165.66,2051.86,2069.29,2080.66,2080.66,2029.93,2034.85,2007.39,1991.89,1821.59,1781.66,1891.75,1739.29,1722.16,1831.61,1750.05,1665.31,1584.34,1524.45,1435.35,1717.26,1703.19,1783.6,1768.64,1804.86,1725.68,1789.24,1665.2,1669.56,1708.14,1688.15,1606.85,1632.65,1577.38,1558.46,1620.49,1702.86,1687.1,1687.1,1761.8,1763.26,1710.61,1743.32,1726.04,1789.67,1943.5,1866.79,1883.67,1886.04,1821.92,1833.04,1897.1,1834.82,1859.58,1882.01,1796.71,1770.34,1725.98,1808.69,1746.12,1717.32,1710.53,1691.67,1714.18,1603.71,1573.53,1503.9,1457.5,1503.52,1470.6,1473.26,1436.52,1495.97,1480.93,1546.09,1541.63,1578.45,1608.33,1593.97,1593.97,1590.61,1542.73,1460.43,1527.25,1542.75,1538.83,1526.57,1555.48,1554.89,1574.78,1528.04,1542.09,1572,1589.1,1582.78,1590.12,1673.9,1733.17,1712.91,1755.86,1735.57,1732.87,1728.33,1730.83,1730.83,1681.57,1643.51,1664.31,1674.87,1748.16,1704.42,1665.77,1658.68,1642.41,1647.51,1683.92,1670.64,1655.26,1640.27,1676.58,1643.84,1649.45,1726.88,1751.99,1809.27,1809.45,1812.46,1821.92,1782.33,1819.7,1810.09,1804.56,1841.35,1828.4,1749.36,1697.2,1756.55,1716.98,1734.3,1800.68,1806.27,1813.18,1787.58,1815.01,1863.43,1875.69,1871.53,1867.2,1870.21,1870.21,1919.54,1921.96,1924.48,1877.09,1894.25,1898.05,1926.96,1929.92,1936.29,1861.54,1885.02,1917.04,1921.37,1974.28,2017.54,1982.36,1991.92,1977.05,1976.39,1992.48,1990.08,1995.59,2023.28,2002.57,2019.02,2054.15,2067.82,2086.27,2149.27,2218.31,2203.42,2207.32,2279.22,2319.19,2612.84,2596.45,2645.98,2745.87,2840.1,3081.25,2987.97,3094.69,3135.61,3115.67,2964.87,2609.37,2722.7,2711.38,2634.66,2583.6,2688.99,2776.39,2795.18,2898.89,2949.39,2827.43,2845.2,2845.2,2758.31,2898.71,2918.52,2791.66,2765.14,2587.62,2572.43,2681.39,2725.27,2559.15,2592.88,2463.82,2443.68,2488.25,2363.14,2377.55,2294.36,2392.74,2572.07,2720.27,2720.27,2788.96,2775.01,2769.2,2728.79,2694.22,3058.79,2930.83,2774.12,2714.41,2618.19,2697.63,2713.64,2820.26,2629.92,2675.94,2675.94,2627.24,2538.37,2539.95,2406.43,2371,2341.42,2389.89,2113.76,2157.74,2388.13,2374.18,2308.94,2271.93,2353.97,2313.23,2350.6,2376.1,2306.11,2192.54,2232.71,2351.7,2354.15,2234.22,2184.84,2184.84,2094.46,1947.89,2041.53,2064.73,2219.13,2203.68,2243.24,2139.74,2137.19,2051.24,2101.77,2189.91,2137.21,2027.71,1953.83,2044.39,2142.13,2222.11,2308.26,2348.46,2534.11,2547.19,2584.95,2576.59,2783.6,2803.31,2789.08,2747.3,2765.12,2920.28,2782.12,2666.12,2695.44,2614.45,2488.09,2516.19,2606.49,2511.22,2511.22,2560.4,2621.23,2491.33,2571.84,2562.33,2544.41,2234.4,2247.37,2237.18,2219.97,2302.01,2318.1,2428.67,2226.39,2206.94,2006.7,2039.67,1871.3,1856.01,1962.04,1846.75,1941.69,1809.63,1808.64,1692.59,1720.63,1601.47,1679.58,1804.33,1936.65,1936.65,1933.15,1887.54,1975.83,1793.67,1822.46,1827.1,1849.89,1833.37,1776.18,1650.04,1689.45,1782.07,1629.87,1657.86,1657.86,1812.95,1805.68,1797.9,1879.26,1873.24,1779.5,1747.58,1716.86,1738.2,1738.2,1782.58,1772.38,1870.36,1917.93,1792.35,1782.61,1812.97,1822.71,1836.12,1839.79,1877.91,1892.97,2078.12,2082.22,2053.08,1979.86,2101.93,2148.43,2272.72,2273.68,2299,2351.09,2360.54,2204.03,2221.27,2167.04,2251.35,2192.25,2294.74,2365.8,2344.71,2325.08,2316.46,2269.02,2217.37,2267.39,2272.31,2264.46,2203.42,2178.41,2123.95,2107.97,2119.82,2066.67,2066.67,2098.87,2169.85,2212.37,2292.07,2328.32,2234.32,2314.48,2323.19,2320.14,2363.88,2361.28,2300.63,2207.25,2105.83,2111.03,2164.03,2201.28,2051.37,2028.73,1853.97,1907.81,1841.81,1821.31,1706.12,1705.28,1655.87,1661.53,1695.8,1567.84,1677.67,1684.1,1698.25,1585.36,1640.12,1615.72,1701.15,1718.13,1721.57,1747.81,1740.31,1742.45,1644.25,1646.77,1586.81,1507.34,1463.13,1358.28,1458.7,1498.85,1460.46,1487,1429.63,1400.95,1378.16,1283.93,1299.54,1401.18,1401.18,1398.58,1399.04,1383.06,1489.14,1489.14,1490.36,1395.45,1375.33,1331.12,1326.53,1369.44,1283.55,1231.01,1199.27,1205.92,1149.02,1146.26,1053.95,1052.19,958.72,941.9,941.9,834.44,862.05,931.73,942.13,942.13,826.79,869.16,843.92,864.73,916.05,909.01,942.43,945.03,936.16,936.16,1005.69,984.96,972.64,1020.45,1099.45,1100.53,1104.66,1225.81,1360.65,1274.68,1324.85,1387.49,1439.96,1453.04,1489.6,1505.28,1539.54,1585.66,1505.89,1488.68,1600.42,1638.59,1545.28,1593.23,1593.23,1509.56,1536.25,1545.51,1505.81,1588.03,1573.35,1550.86,1460.08,1512.77,1482.33,1435.68,1392,1322.56,1326.53,1334.49,1401.64,1380.15,1408.3,1377.7,1401.57,1511.17,1461.99,1470.17,1456.33,1467.04,1447,1482.87,1493.58,1586.73,1489.67,1472.92,1418.93,1415.41,1415.41,1411.2,1428.64,1380.84,1421.83,1414.95,1430.55,1409.67,1381.22,1246.61,1262.59,1243.24,1228.86,1175.94,1225.19,1256.71,1237.74,1226.11,1228.41,1232.92,1300.68,1313.91,1293.72,1289.06,1316.13,1284.77,1272.31,1273.61,1329.75,1352.92,1377.78,1444.55,1420.84,1398.89,1410.9,1477.44,1477.44,1538.55,1559.73,1587.19,1636.52,1664.36,1692.66,1717.6,1796.3,1869.26,1910.79,1978.71,1964.03,1957.22,1992.71,1992.71,2099.1,1984.45,2023.84,1962.57,1843.64,1913.7,1959.82,1969.46,2002.12,2140.17,2140.17,2160.51,2115.08,2098.94,2062.08,2063.46,2080.28,2125.48,2152.1,2220.94,2243.58,2227.67,2010.76,1988.73,2057.87,2028.96,2021.85,1955.77,2037.83,2045.41,1996.76,1943.53,1983.38,1941.62,1923.18,1909.8,1852.36,1876.45,1855.88,1833.78,1781.77,1725.47,1676.68,1648.15,1768.92,1783.53,1811.59,1759.43,1824.83,1826.59,1967.01,1964.87,1973.89,1873.93,1873.93,1961.73,1926.78,1923.49,1900.62,2092.44,2045.79,2075,2111.26,2098.64,2028.96,2038.29,2008.39,1955.69,1872.93,1889.07,1867.12,1839.43,1884.41,1913.78,1924.33,1885.55,1997.45,1988.96,1992.63,1986.05,2016.27,2011.45,1979.94,1920.66,1942.08,1949.19,1856.11,1683.48,1621.38,1622.07,1656.03,1624.67,1573.73,1585.51,1509.48,1536.1,1572.97,1671.25,1682.34,1677.06,1699.32,1698.78,1606.01,1641.72,1711.02,1815.8,1857.33,1786.58,1792.02,1801.96,1844.79,1791.33,1791.33,1800.81,1805.63,1887.01,1867.28,1836.22,1826.66,1801.8,1825.82,1830.79,1855.8,1864.98,1833.62,1812.74,1830.18,1920.13,1938.86,1928,1967.32,1890.22,1946.51,1931.52,1931.52,1962.65,1999.59,1936.42,1900.47,1900.01,1823.76,1819.78,1816.41,1839.05,1797.06,1789.26,1737.86,1674.15,1674.15,1681.95,1648.61,1620.54,1622.91,1596.98,1599.58,1589.56,1396.82,1401.57,1460.3,1465.35,1432.46,1444.47,1437.21,1384.82,1415.71,1434.68,1449.83,1480.5,1438.89,1407.45,1443.33,1533.12,1529.29,1529.29,1481.95,1489.67,1509.87,1468.26,1525.09,1527.61,1545.28,1544.05,1549.87,1438.97,1382.37,1350.24,1366.38,1341.07,1359.65,1357.89,1296.25,1242.86,1251.05,1329.29,1310.32,1343.51,1321.79,1306.57,1320.34,1358.89,1375.41,1344.51,1344.51,1340.15,1274.45,1287.83,1308.71,1261.22,1323.02,1352.85,1313.69,1335.41,1308.26,1235.06,1201.64,1188.94,1146.72,1124.69,1086.45,1106.57,1240.03,1301.6,1287.15,1484.17,1401.79,1376.63,1376.78,1385.81,1413.11,1359.96,1336.32,1315.29,1288.52,1314.68,1357.97,1330.74,1337.24,1357.28,1338.08,1427.19,1377.55,1328.83,1370.9,1370.9,1351.85,1347.57,1367.45,1362.02,1348.33,1336.71,1338.47,1360.95,1357.43,1329.21,1305.27,1355.98,1395.6,1361.49,1433.61,1413.88,1413.88,1388.72,1399.73,1396.44,1432.92,1501.91,1509.94,1513.46,1605.09,1768.76,1884.48,1884.48,1923.72,1934.58,2006.4,2013.51,1843.49,1898.56,1932.29,1962.27,1900.62,1906.21,1829.49,1923.64,1884.41,1651.97,1684.56,1681.11,1775.19,1702.68,1774.96,1658.63,1588.34,1521.11,1534.57,1466.65,1520.8,1529.68,1510.48,1589.56,1540.23,1637.82,1652.97,1703.45,1691.06,1707.65,1611.21,1685.09,1630.71,1600.12,1573.65,1577.71,1637.59,1637.59,1610.75,1678.13,1760.43,1611.74,1654.11,1729.83,1744.82,1757.67,1761.35,1734.5,1742.84,1737.71,1865.59,1822.23,1912.09,1944.75,1965.79,1944.37,1992.1,2001.05,1973.43,1904.6,1840.66,1912.71,1841.96,1870.03,1843.64,1826.2,1665.82,1676.22,1679.35,1692.82,1689.45,1688,1673.85,1667.12,1634.08,1992.25,2058.87,2007.78,1984.91,1969.84,1910.95,1904.29,1857.33,1923.11,2206.79,2270.88,2456.81,2676.93,2512.42,2525.8,2380.02,2452.99,2590.81,2646.34,2615.97,2597.7,2696.51,2589.66,2586.91,2546.07,2546.07,2639.91,2731.16,2687.79,2737.58,2826,2976.9,2981.26,3066.92,3248.8,3197.79,3336.45,3541.35,3670.15,3366.28,3335.99,3220.43,3293.39,3535.69,3535.69,3473.36,3301.5,3192.51,3088.72,2900.88,3139.2,3143.87,3016.21,3020.65,3020.65,3019.12,3084.67,3031.51,3275.19,3165.05,3262.03,3262.03,3243.45,3174.92,3154.04,3109.68,3037.55,3044.74,2975.98,3061.49,3094.53,2934.53,2999.77,2892.39,2862.94,2765.81,2682.52,2512.49,2573.76,2722.36,2721.6,2721.6,2708.37,2757.7,2710.59,2583.62,2528.02,2315.93,2224.15,2156.46,2240.82,2177.11,2080.66,2134.66,2014.97,2009,1699.09,1763.56,1897.49,1840.81,1911.94,1820.39,1723.26,1803.95,1807.01,1902.23,2129.23,2203.8,2080.82,2089,2015.73,1982.15,2053.28,2162.66,2044.26,1831.25,1784.29,1696.87,2081.89,1930.45,1929.76,1930.07,1943.53,1847.47,1846.09,1846.09,1740.01,1820.08,1917.75,1984.83,2179.41,2186.52,2233.56,2158.07,2145.52,2196.69,2143.53,2105.98,2112.64,2178.41,2281.21,2435.09,2555.09,2659.19,2622.02,2676.78,2616.43,2629.67,2559.3,2608.4,2595.4,2595.4,2775.52,2729.71,2741.41,2649.86,2621.02,2633.11,2539.64,2177.49,2257.34,2360.14,2494.06,2496.66,2440.67,2488.09,2517.31,2419.56,2463.16,2463.16,2464,2666.84,2604.04,2505.23,2491.69,2475.24,2429.58,2299.94,2414.21,2411.92,2411.92,2248.16,2277.76,2263,2370,2397.84,2423.77,2376.96,2460.25,2442.97,2521.29,2512.42,2540.1,2543.54,2335.05,2417.35,2490.24,2456.66,2440.14,2357.77,2314.63,2365.34,2361.21,2446.79,2464.84,2521.29,2593.03,2606.87,2595.71,2566.64,2528.25,2563.43,2518.69,2477.31,2448.32,2600.53,2650.93,2689.71,2673.87,2646.19,2553.56,2553.56,2519.07,2555.25,2589.21,2683.36,2649.4,2653.76,2660.03,2820.8,3028.3,3136.14,3224.71,3257.14,3188.23,3258.74,3321,3257.06,3386.63,3238.25,3368.35,3389.84,3401.39,3514.12,3334.69,3287.5,3466.63,3312.44,3355.27,3331.17,3162.53,3333.93,3282.99,3328.19,3279.24,3360.01,3422.11,3385.17,3357.41,3433.97,3317.25,3460.28,3522.46,3529.8,3366.05,3491.94,3582.27,3397.87,3534.09,3410.49,3285.13,3405.29,3362.38,3293.39,3074.57,3092.62,3127.57,3068.91,3089.87,3022.87,2991.2,3195.34,3207.73,3262.65,3262.65,3290.1,3289.87,3282.99,3416.84,3476.42,3480.01,3362.07,3404.83,3452.86,3417.98,3510.3,3635.35,3746.79,3573.78,3697,3680.4,3737.99,3713.75,3712.52,3712.52,3634.43,3515.5,3475.65,3439.63,3350.53,3454.54,3311.44,3299.59,3333.16,3403.6,3433.82,3420.35,3359.17,3354.35,3346.17,3346.17,3206.58,3299.82,3436.88,3434.58,3328.57,3295.69,3299.97,3186.01,3291.94,3226.16,3227.31,3105.32,3038.01,3144.32,3191.82,3252.17,3275.57,3189.91,3192.74,3192.74,3140.65,3145.93,3148.91,3149.76,3058.05,3131.09,3192.43,3124.97,3078.55,3084.74,3001.45,3104.78,3101.8,3034.34,3049.26,3053.54,3119.16,3021.19,2992.05,3025.39,3053.77,3004.13,2908.68,2814.3,2912.88,2929.56,2951.89,2846.04,2767.41,2717.32,2843.28,2916.02,2757.93,2757.93,2698.5,2651.31,2625.31,2643.43,2668.9,2695.44,2785.54,2997.78,2974.45,3064.09,3001.99,2955.49,2963.82,2858.35,2878.08,2896.21,2875.94,2851.32,2918.85,2989.14,3002.07,2978.05,3049.64,3149.53,3276.18,3403.53,3315.19,3405.59,3390.53,3229.45,3135.76,3090.79,3191.36,3195.87,3258.29,3258.29,3316.26,3368.04,3381.35,3333.09,3180.81,3240.92,3240.62,3200.46,2990.52,3127.8,3033.96,2918.54,3052.85,3108.53,3144.63,3094.99,3031.66,3063.1,3063.1,3097.98,2918.7,2872.2,2869.06,2904.17,3149.91,3216.91,3252.86,3009.25,3009.25,3210.56,3081.53,3013.92,3109.45,3118.7,3019.27,3030.13,3016.98,2990.97,2912.81,2826.61,2898.2,2860.57,2445.11,2394.17,2365.03,2351.42,2281.66,2362.2,2380.25,2463.39,2503.7,2459.34,2443.89,2513.1,2530.7,2545.46,2504.92,2600.14,2617.81,2595.09,2576.51,2685.5,2639.68,2775.29,2668.9,2678.84,2644.96,2713.72,2667.37,2814.22,2723.51,2730.55,2878.62,2708.14,2708.14,2815.83,2813.15,2780.64,2795.02,2745.54,2727.26,2738.73,2800.84,2786.07,2870.44,2897.97,2907.3,2890.63,2846.04,2733.91,2698.65,2713.72,2708.37,2834.41,2896.67,2911.58,2889.63,2868.14,2927.03,2891.32,2869.9,2808.18,2772.08,2713.03,2815.06,2858.28,2955.87,2864.93,2846.88,2995.26,3116.41,3091.63,3084.59,3057.9,3088.57,3047.88,2946.08,2628.67,2739.8,2891.47,2904.7,2989.29,3039.85,2984.55,2904.4,2907.22,2934.84,2863.63,2644.96,2948.14,2942.18,2907.45,2907.45],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1957.16,1960.95,1961.89,1893.89,1783.79,1921.37,1835.05,1835.05,1792.63,1784.53,1745.89,1760.32,1824.32,1816.42,1835.16,1855.16,1869.89,1927.26,1947.26,2018.84,2027.26,1996.53,1973.47,1968.11,1968.95,2000.42,1986.84,1993.68,2021.79,2043.37,2092.42,2200.53,2200,2196.53,2115.47,2110.53,1958.21,2043.68,2027.37,2123.37,2065.16,2071.05,2093.05,2091.89,2071.68,2067.58,1938,1877.26,1846.32,1807.37,1631.47,1688.21,1781.05,1777.05,1814.74,1806.11,1768.32,1688.32,1648,1649.16,1617.68,1510.42,1677.47,1696.63,1722,1722]},"symbols":{"AMD":"AMD","EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","엔비디아":"NVDA","테슬라":"TSLA","팔란티어 테크":"PLTR"},"missing":[],"stale":["KOSPI200"]}
};
