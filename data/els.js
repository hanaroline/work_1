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
  "updatedAt": "2026-11-25T08:28:15.603Z",
  "checkedAt": "2026-11-25T08:28:15.603Z",
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
  "history": {"updatedAt":"2026-11-25T08:28:16.522Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20160919,20160920,20160921,20160922,20160923,20160926,20160927,20160928,20160929,20160930,20161003,20161004,20161005,20161006,20161007,20161010,20161011,20161012,20161013,20161014,20161017,20161018,20161019,20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827,20260828,20260831,20260901,20260902,20260903,20260904,20260907,20260908,20260909,20260910,20260911,20260914,20260915,20260916,20260917,20260918,20260921,20260922,20260923,20260924,20260925,20260928,20260929,20260930,20261001,20261002,20261005,20261006,20261007,20261008,20261009,20261012,20261013,20261014,20261015,20261016,20261019,20261020,20261021,20261022,20261023,20261026,20261027,20261028,20261029,20261030,20261102,20261103,20261104,20261105,20261106,20261109,20261110,20261111,20261112,20261113,20261116,20261117,20261118,20261119,20261120,20261123,20261124,20261125],"series":{"AMD":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.68,101.82,101.6,95.67,97.26,98.97,107.75,109.01,117.9,117.9,121.78,120.18,120.3,123.83,121.55,124.86,131.24,130.79,132.27,132.04,132.04,137.63,131.7,132.16,129.3,129.3,130.33,130.33,128.16,129.08,131.01,130.44,127.71,122.69,120.64,120.64,111.97,112.66,111.4,111.17,113,119.04,118.02,119.95,121.66,120.98,118.24,137.51,140.02,139.57,155.42,151.54,154.62,153.02,154.85,153.82,151.2,151.65,147.89,149.71,149.71,159.64,162.83,163.28,161,173.32,164.88,170.58,158.49,148.57,148.69,148.8,150.74,152,158.61,162.83,160.78,159.41,155.64,153.82,164.2,157.58,160.78,157.24,156.21,156.21,156.1,156.33,160.21,165.91,166.93,161.46,161.57,151.31,154.16,149.37,149.37,145.5,140.36,140.36,145.84,147.66,146.41,149.49,148.23,149.71,153.82,152.91,155.3,151.65,155.3,117.67,118.47,115.17,116.19,114.48,116.08,123.03,126.23,128.39,130.22,145.38,127.71,128.62,130.1,125.88,124.17,124.17,125.2,125.43,125.43,126.8,127.59,124.63,124.29,128.16,137.17,141.16,147.09,140.02,137.86,136.37,134.21,131.13,130.44,136.03,144.13,159.41,163.97,161.57,160.55,152.79,150.86,143.67,142.3,138.54,138.54,150.4,148.46,152.34,157.47,158.38,162.94,154.28,158.72,157.35,153.71,154.5,157.35,158.27,161.46,160.89,168.3,161,159.06,155.19,156.33,152.45,150.97,149.6,153.14,149.49,146.29,138.2,139.45,145.5,148.46,144.01,140.71,141.05,137.4,138.77,142.3,142.53,141.73,139.45,138.54,144.47,148.23,150.4,150.4,147.32,146.64,144.01,139.68,143.1,140.25,139.34,139.79,142.76,149.14,149.6,156.67,152.91,151.65,143.79,141.96,145.27,145.27,145.38,144.93,153.02,151.77,152.11,150.86,153.59,156.21,158.27,161.92,162.14,162.6,161.46,160.43,159.06,157.47,160.78,162.49,140.59,136.94,135.01,124.17,125.31,123.15,123.72,126.8,136.03,137.4,133.52,126.8,128.39,126.45,126.8,126.23,128.28,129.76,129.3,129.99,129.65,129.65,129.76,131.7,127.37,123.49,124.17,122.35,114.37,113,114.03,114.48,113.34,115.85,112.88,115.28,115.51,117.33,125.2,124.86,125.2,124.17,120.18,120.18,119.27,120.07,120.3,117.22,125.2,131.7,138.2,135.46,140.02,134.78,136.37,138.43,137.06,137.06,135.8,138.88,142.19,143.56,144.24,147.55,144.93,141.51,147.66,151.88,146.75,156.67,151.08,141.96,131.93,132.84,132.27,127.94,128.96,133.18,134.32,139.11,139,134.78,134.78,137.06,133.64,135.01,137.63,141.62,142.87,138.08,135.69,134.66,135.8,134.09,139.57,136.49,133.41,131.36,132.73,129.53,130.67,130.79,130.33,126.68,128.39,124.4,121.21,119.04,114.03,111.86,114.6,114.6,108.67,108.89,111.4,114.25,109.58,108.67,113.8,111.97,114.94,113.23,115.05,119.95,118.13,115.28,113.91,114.48,115.05,110.72,125.88,126.68,124.06,126.91,125.09,124.63,128.62,132.16,132.38,136.26,138.31,136.26,139.45,141.96,146.18,146.18,148.23,148.12,148,149.37,152.91,154.39,154.39,152.34,157.58,156.56,164.2,169.33,169.33,178.68,169.78,173.89,179.36,180.73,186.09,185.29,186.32,195.1,190.31,188.37,178.45,180.16,172.29,176.74,170.7,174.57,170.92,172.86,171.04,171.04,176.74,186.55,189.4,188.71,185.52,188.83,185.52,189.05,192.36,192.13,190.54,188.14,189.97,184.61,183.01,209.24,215.96,221.44,209.01,210.72,214.25,210.83,221.55,223.03,223.26,217.79,217.33,224.97,228.28,224.63,220.41,225.43,227.82,232.61,238.31,254.16,273.43,288.03,285.63,287.34,283.81,287,287,319.95,325.09,317.45,312.2,340.82,343.22,367.27,347.55,373.09,369.78,364.08,355.87,355.53,353.71,371.84,371.38,367.05,371.61,352.22,358.27,330.9,324.17,316.76,311.86,301.71,310.6,285.06,288.48,300.34,299.43,321.32,311.29,303.53,269.78,285.4,286.09,259.86,219.73,201.03,192.13,196.12,207.64,230.56,230.67,226.91,235.8,249.03,241.73,239.79,216.99,223.6,237.29,245.04,235.58,217.9,219.04,213.57,213.57,220.98,228.96,240.02,243.33,244.36,242.87,270.35,240.82,240.82,242.87,221.89,227.94,227.82,233.52,226.45,226.91,214.71,222.35,207.07,204.56,193.04,189.85,189.85,204.1,199.43,203.19,210.49,214.71,194.41,216.65,234.55,236.6,230.22,225.09,231.13,230.67,232.38,224.97,230.9,236.83,236.83,225.31,225.77,237.74,250.06,230.1,219.5,263.28,278.34,279.48,275.14,265.79,265.22,258.49,262.83,261.8,260.21,260.55,263.74,270.01,270.01,273.09,273.09,272.75,277.77,281.76,276.05,267.73,268.3,270.01,266.48,267.96,255.53,251.77,250.97,261.8,267.84,266.59,260.21,265.56,265.11,296.47,293.04,318.02,300.68,296.12,292.93,283.81,285.75,290.99,300.57,305.02,330.9,331.7,330.44,325.31,310.6,317.33,316.88,317.56,311.63,318.47,313.45,315.62,315.62,321.32,318.93,324.52,315.39,317.9,315.74,315.05,305.7,322.58,321.78,312.66,303.99,308.89,310.26,318.81,299.2,311.52,314.48,319.38,313.57,304.22,311.86,312.54,300.57,301.48,301.48,331.24,320.3,319.61,312.54,314.48,337.17,336.37,362.83,369.56,378.91,369.56,366.93,357.92,346.18,332.95,347.21,347.78,342.19,331.81,333.64,329.08,341.16,350.51,346.29,355.76,356.21,355.64,355.64,359.18,365.34,377.99,385.29,376.97,378.68,392.13,385.97,383.12,376.28,370.7,374.57,381.87,388.94,383.92,387.91,381.76,386.2,347.21,340.48,335.69,319.16,329.08,332.84,386.77,389.85,369.78,366.13,344.81,338.31,355.53,358.95,350.29,361.46,363.74,336.83,345.27,344.36,350.97,358.61,358.61,358.61,352.34,352.91,359.18,348.46,347.78,344.7,339.34,344.47,349.94,351.54,353.36,346.86,345.38,342.65,349.37,336.6,336.83,336.03,327.48,330.56,327.94,322.8,327.02,330.79,329.87,321.89,324.52,323.6,339.22,348.12,350.29,351.31,355.07,353.14,365.22,359.29,357.58,361.69,372.98,384.15,376.62,377.77,386.89,397.83,413.8,412.2,409.69,413.68,413.8,414.03,418.59,427.82,437.29,439.68,454.73,470.81,467.27,450.63,446.41,453.71,444.58,449.37,449.37,446.41,441.62,443.56,452.57,451.77,451.88,443.9,449.71,450.06,485.63,469.21,482.9,487.69,482.33,488.37,503.42,518.36,530.67,530.67,531.7,526.57,519.04,522.92,559.86,554.16,551.77,550.17,545.38,558.38,549.26,555.87,549.71,553.59,567.5,580.73,580.73,582.1,586.43,589.62,574.12,561.69,576.17,541.73,556.21,535.92,547.55,563.85,568.3,562.37,567.05,595.9,613.45,614.48,621.78,630.67,630.67,648.69,671.61,653.02,607.53,560.09,542.42,541.51,501.82,518.59,541.16,533.07,571.38,548.57,554.05,493.39,517.45,521.09,444.81,500.57,441.39,477.54,446.07,454.05,451.65,474.8,527.02,508.89,541.62,531.13,545.72,518.59,497.83,507.3,485.63,541.85,542.3,556.33,551.65,551.65,580.84,626.34,627.02,649.37,645.38,649.6,603.42,637.63,637.4,640.59,644.13,632.95,611.86,597.38,568.76,599.32,595.1,594.75,592.36,606.5,635.58,613,594.98,621.55,618.02,622.46,632.5,642.99,623.15,629.08,629.08,606.5,601.37,589.97,613.45,611.52,610.49,601.25,600.11,605.47,603.99,642.99,654.96,602.39,610.03,623.49,620.98,622.01,616.19,618.36,624.4,615.62,597.38,592.13,571.27,573.32,599.89,599.54,596.81,596.81,608.89,603.53,609.24,652.91,637.17,611.06,623.95,631.01,626.23,627.59,655.19,649.94,704.56,679.25,791.33,786.43,770.92,867.62,891.68,882.9,885.63,969.67,972.75,988.71,967.5,937.74,876.62,941.96,933.18,927.02,939.79,931.13,924.63,943.79,955.64,947.32,984.61,980.84,955.53,975.48,1035.58,1051.08,1028.73,941.16,935.12,935.12,897.26,933.98,900.57,870.47,888.26,900,874.12,872.86,854.39,888.71,885.97,852.11,864.54,890.08,906.27,932.38,934.89,967.62,932.73,982.33,963.28,988.48,986.43,947.55,961.12,972.41,960.21,947.89,948.35,935.01,929.99,903.08,905.59,934.55,937.63,899.43,871.15,889.62,858.49,851.77,873.2,927.59,946.41,979.25,947.78,889.28,926.8,933.18,928.51,954.73,950.51,941.16,975.37,965.11,972.75,970.01,988.71,988.71,994.18,1056.56,1056.21,1068.87,1052.57,1072.29,1072.63,1059.52,1024.29,1045.15,1045.04,1080.73,1107.41,1104.33,1104.22,1093.73,1063.06,1062.26,1043.9,1046.86,1046.86,1044.47,1033.3,1052.34,1045.72,1052.45,1057.81,1029.99,1085.06,1078.45,1108.89,1087.34,1046.52,1035.23,1005.82,1005.82,1019.95,1011.97,1043.67,1058.04,1073.32,1079.93,1013,997.95,976.51,999.54,1013.23,1002.17,1001.6,1002.28,1042.99,1036.6,1053.02,1056.56,1069.21,1069.21,1042.87,1025.54,1010.72,1021.44,973.43,966.25,991.33,939.79,963.63,985.06,959.29,922.01,886.54,895.32,843.33,895.44,883.92,926.23,924.17,940.71,943.56,942.19,890.76,901.48,915.62,893.73,872.06,869.1,882.67,879.59,866.59,895.1,924.63,924.63,928.51,928.62,937.29,950.4,943.67,896.01,914.37,895.67,946.52,936.72,924.86,903.88,930.56,901.48,943.67,973.89,971.61,958.04,956.78,930.67,895.67,896.35,887.46,888.14,898.63,866.48,876.05,851.08,833.41,850.51,851.2,848.8,869.21,890.08,879.93,883.01,887.8,893.27,894.18,913.11,913.11,921.44,934.66,915.39,930.22,927.59,922.35,911.74,929.99,927.14,929.87,917.56,913.45,964.2,965.22,941.73,953.02,955.76,981.76,976.28,992.93,1020.75,1071.04,1063.97,1079.82,1079.82,1077.19,1032.38,1023.26,1036.49,1035.46,1029.19,1015.39,991.22,979.36,987.23,993.27,1019.5,1040.02,1050.74,1046.98,1037.97,1116.65,1173.89,1210.83,1238.65,1283.47,1354.28,1281.07,1255.53,1226.68,1214.14,1227.82,1214.37,1260.55,1225.54,1226.45,1179.48,1182.44,1193.27,1240.25,1227.48,1234.89,1223.15,1270.24,1269.33,1262.49,1254.16,1245.15,1253.36,1253.36,1244.58,1210.6,1210.38,1199.54,1194.98,1205.59,1204.1,1211.17,1184.49,1157.92,1172.41,1190.19,1210.38,1206.39,1233.3,1157.58,1144.24,1173.32,1168.19,1144.13,1160.89,1181.76,1213.8,1197.95,1193.61,1197.72,1244.7,1276.97,1278.45,1327.59,1326.45,1327.14,1360.66,1366.25,1395.21,1401.71,1394.3,1381.53,1370.92,1427.94,1455.3,1488.37,1567.84,1554.62,1712.2,1698.06,1594.87,1664.88,1686.32,1670.35,1738.31,1725.66,1767.62,1772.06,1739.11,1709.46,1799.32,1799.32,1765.22,1846.18,1805.82,1700.23,1718.13,1642.08,1585.63,1651.65,1656.1,1574.69,1579.82,1525.66,1546.18,1670.47,1580.84,1570.7,1548.46,1644.81,1640.59,1666.36,1666.36,1760.09,1746.29,1690.54,1655.07,1640.82,1713.11,1646.75,1552.45,1553.36,1505.13,1505.13,1565.68,1567.5,1513.57,1560.78,1560.78,1504.33,1462.6,1389.85,1354.73,1328.73,1267.16,1262.37,1169.9,1200,1302.74,1331.58,1399.77,1369.21,1409.35,1410.15,1462.14,1514.82,1434.09,1290.54,1302.96,1385.06,1341.96,1281.3,1297.95,1297.95,1318.7,1251.54,1329.65,1380.39,1406.39,1297.95,1348.69,1276.85,1236.15,1173.89,1203.31,1266.25,1213.91,1189.17,1165.91,1246.64,1315.51,1273.55,1293.73,1321.78,1308.78,1298.97,1374.34,1364.54,1371.04,1405.13,1359.41,1246.75,1233.64,1260.32,1218.02,1182.1,1182.67,1151.65,1110.26,1084.38,1114.48,1061.12,1061.12,1070.58,1105.25,1072.06,1024.52,1005.02,1034.09,971.04,968.19,1022.12,975.14,1024.4,1039.11,1133.64,1070.35,1087.12,984.72,1011.74,1002.51,992.7,1084.61,1074.57,1168.42,1097.83,1102.28,1066.13,1084.04,1039.45,1056.44,1126,1166.02,1166.02,1161.46,1154.16,1238.2,1212.09,1204.67,1200.46,1161.92,1126.57,1081.19,991.9,991.9,1018.24,935.58,930.1,930.1,955.42,954.96,939.91,992.93,982.44,921.09,889.28,871.95,840.02,840.02,857.47,859.18,904.22,904.79,877.42,870.7,883.92,896.24,924.86,928.51,979.25,1019.73,1038.65,1004.56,998.18,972.06,1024.17,1045.27,1077.19,1103.53,1132.16,1118.47,1184.83,1166.59,1141.05,1089.4,1129.42,1118.81,1149.71,1151.77,1142.53,1120.52,1145.27,1094.07,1058.61,1054.62,1057.35,1108.1,1039.68,1009.01,991.33,967.73,938.77,914.94,914.94,897.61,907.75,943.9,974.34,965.11,878.34,883.12,874.12,872.41,875.37,858.04,849.26,792.47,774.91,755.99,765.91,779.48,731.36,722.46,753.82,774.23,774.69,773.66,666.36,659.18,657.13,659.64,672.06,637.86,660.89,660.43,652.57,658.72,670.7,669.33,700.91,681.07,668.19,707.07,684.83,680.27,668.53,685.4,709.12,719.27,728.05,683.24,780.73,825.2,838.43,870.81,828.96,842.65,838.88,826.23,858.04,871.15,871.15,856.78,834.55,836.83,885.18,883.47,854.96,839.45,801.25,799.77,803.53,782.1,805.82,816.99,785.97,758.61,745.84,736.49,741.73,771.72,728.16,735.69,735.69,721.44,713.45,739.11,738.54,738.54,729.99,737.29,710.72,729.3,766.7,775.94,787.46,807.3,809.58,809.58,816.31,804.22,772.06,798.97,872.63,851.77,854.16,857.01,859.75,826.11,856.9,965.11,1006.96,981.64,954.16,979.59,965.68,948.8,929.08,947.89,980.05,971.27,913.11,895.1,895.1,875.37,873.55,909.35,890.42,898.18,896.01,892.7,917.22,929.53,925.43,936.26,973.43,958.15,942.65,935.12,997.15,1022.58,1101.48,1115.62,1103.88,1093.84,1112.66,1143.44,1116.88,1101.6,1078.22,1095.67,1116.08,1117.56,1101.03,1093.16,1055.42,1054.39,1054.39,1088.71,1072.18,1052.79,1050.06,1046.18,1024.74,1023.72,1025.54,1027.48,1008.32,998.52,955.53,979.93,997.04,1019.04,1022.69,1025.2,930.67,987.57,1024.4,1083.69,1083.92,1106.27,1107.18,1086.2,1110.6,1157.13,1183.01,1230.67,1206.61,1231.47,1232.84,1234.55,1372.29,1448.46,1448.46,1428.39,1347.89,1362.26,1343.9,1344.7,1416.53,1343.56,1380.27,1424.4,1473.09,1419.95,1451.88,1416.65,1369.21,1369.21,1356.1,1278.34,1262.26,1254.39,1225.88,1258.72,1256.21,1268.41,1298.86,1320.64,1320.64,1299.32,1293.96,1290.42,1295.1,1269.33,1306.5,1321.78,1322.01,1349.14,1344.7,1327.59,1257.13,1265.11,1261.23,1288.48,1255.3,1266.82,1288.03,1304.45,1340.93,1246.86,1290.19,1320.64,1331.93,1291.11,1259.64,1256.9,1226.57,1276.85,1269.67,1222.23,1190.88,1202.39,1233.98,1204.79,1247.78,1160.78,1165.91,1170.01,1207.75,1215.39,1205.47,1248,1248,1263.17,1246.07,1215.39,1209.69,1200.91,1200.8,1228.16,1215.85,1157.24,1167.27,1158.61,1144.13,1095.9,1096.92,1110.38,1094.18,1118.24,1171.72,1172.41,1177.54,1141.16,1186.66,1173.43,1222.8,1219.73,1242.99,1235.01,1240.48,1198.29,1213.91,1198.86,1164.99,1167.62,1160.89,1140.36,1159.29,1095.32,1068.07,1099.54,1096.69,1123.15,1231.93,1229.53,1279.93,1274.23,1293.61,1295.21,1294.07,1352.22,1331.7,1366.93,1345.5,1366.36,1375.37,1385.75,1358.72,1396.92,1396.92,1394.64,1398.52,1391.22,1412.2,1381.53,1384.15,1352,1349.83,1332.04,1463.74,1470.01,1532.61,1569.1,1575.71,1573.55,1586.66,1583.81,1598.06,1544.7,1595.32,1591.79,1591.79,1635.23,1665.56,1696.24,1680.84,1580.16,1542.99,1550.86,1580.16,1666.82,1701.94,1693.73,1687.8,1671.15,1671.15,1810.03,1826.34,1854.85,1986.66,1917.67,1920.41,2032.95,2056.21,2021.09,2027.71,1961.92,1912.09,1943.9,2025.77,1986.66,1914.25,1949.14,1931.01,1966.7,1960.21,1955.99,2037.63,2015.51,1982.55,1982.55,1889.28,1873.32,2073.66,2012.77,2006.96,2029.65,2013,2195.32,2310.6,2341.62,2339,2401.71,2410.26,2364.77,2262.14,2311.97,2221.09,2132.95,2178.56,2173.89,2068.64,2049.37,2037.4,2048.46,2036.83,2028.16,2047.78,2058.04,2058.04,2090.54,2037.63,2061.23,1890.88,1943.22,1937.29,1947.32,1905.82,1944.13,1861.8,1828.05,1863.85,1756.21,1768.3,1672.06,1694.87,1736.26,1730.22,1753.25,1794.75,1826.68,1805.93,1645.04,1666.59,1717.22,1776.28,1760.89,1751.65,1737.63,1732.27,1716.76,1746.41,1820.64,1854.28,1875.37,1896.58,1877.54,1887.34,1829.3,1896.92,1896.92,1956.78,1883.01,1901.37,1903.08,1864.88,1824.29,1894.75,1901.71,1914.14,1828.28,1812.54,1827.14,1823.26,1820.18,1806.16,1763.17,1763.17,1844.7,1838.43,1827.25,1827.25,1796.35,1818.36,1849.6,1798.06,1873.55,1868.87,1868.87,1960.09,2037.51,2019.38,2097.61,2074.57,2070.81,2050.51,2024.52,1817.9,1776.17,1728.39,1777.31,1755.99,1649.14,1577.19,1596.24,1593.5,1578.56,1647.43,1511.29,1510.83,1537.29,1484.38,1467.16,1554.39,1531.01,1559.52,1609.24,1604.9,1680.27,1693.96,1770.58,1783.35,1799.43,1729.76,1767.16,1710.26,1716.08,1668.87,1658.95,1693.96,1693.96,1561.46,1606.27,1589.97,1531.93,1575.26,1628.73,1708.78,1719.16,1736.72,1734.09,1719.73,1690.88,1787.23,1778.22,1787.34,1805.25,1847.43,1909.81,1874,1870.92,1821.55,1821.89,1856.9,1948.69,1949.49,1970.35,1950.06,1872.06,1914.37,1884.49,1786.09,1780.27,1781.64,1778.45,1800.46,1757.01,1743.56,1749.6,1781.41,1823.49,1895.67,1694.41,1642.76,1617.56,1604.45,1615.28,1654.5,1708.32,1687,1680.16,1637.74,1588.37,1583.12,1538.2,1584.15,1589.4,1568.99,1567.73,1577.54,1609.24,1570.35,1553.48,1553.48,1564.2,1619.84,1618.93,1641.85,1611.86,1580.27,1492.25,1456.56,1484.04,1489.17,1447.09,1444.58,1425.54,1384.38,1355.53,1359.29,1420.75,1440.02,1440.02,1426,1427.48,1396.12,1377.31,1375.48,1429.53,1477.19,1451.88,1389.28,1389.28,1323.15,1337.74,1323.72,1367.84,1350.51,1384.95,1384.95,1394.3,1411.06,1402.96,1400.68,1311.4,1301.82,1338.08,1355.3,1322.12,1302.96,1362.6,1277.19,1256.1,1226.45,1259.75,1266.82,1273.89,1274.91,1289.62,1289.62,1303.08,1307.75,1301.82,1263.85,1232.73,1185.4,1194.3,1134.66,1138.65,1120.07,1148.8,1159.29,1127.14,1143.79,1101.82,1103.31,1149.26,1118.7,1151.31,1192.59,1180.27,1211.29,1221.66,1213.68,1298.18,1309.12,1256.44,1216.08,1176.97,1171.49,1171.95,1174,1069.56,977.88,953.71,891.79,1104.22,1011.4,1064.99,1077.54,1086.54,1006.73,997.72,997.72,975.6,983.58,1030.67,1077.19,1102.05,1099.09,1095.32,1110.03,1102.05,1126.57,1146.98,1124.52,1144.36,1159.64,1172.63,1232.84,1282.33,1342.3,1311.17,1336.03,1308.32,1294.3,1277.77,1262.37,1257.81,1257.81,1306.27,1286.89,1288.83,1262.6,1307.07,1337.63,1352.11,1319.16,1324.86,1388.03,1405.25,1381.3,1351.2,1324.52,1441.16,1449.26,1445.72,1445.72,1462.26,1477.54,1578.45,1635.12,1638.31,1639.79,1618.02,1552,1579.48,1572.52,1572.52,1537.06,1571.49,1578.22,1643.79,1669.56,1667.5,1774.34,1825.31,1829.08,1790.08,1790.19,1764.2,1809.01,1848.57,1898.18,1980.16,2023.26,2046.86,2010.38,1957.81,2015.74,1987.57,1859.98,1965.79,1969.9,1964.42,1994.87,2102.85,2063.28,2024.06,2008.44,1899.09,1883.69,1866.7,1912.88,1862.71,1899.89,1905.7,1922.23,1854.39,1854.39,1850.86,1848.69,1844.81,1723.38,1726.45,1776.74,1819.16,1775.03,1808.1,1837.63,1829.65,1814.82,1800.68,1794.64,1822.01,1834.66,1834.44,1838.88,1818.24,1839.91,1844.81,1870.13,1935.35,1877.65,2322.8,2411.74,2685.97,2655.53,2450.4,2467.73,2486.77,2720.64,2674.57,2657.7,2742.99,2714.14,2625.2,2679.48,2883.92,2960.89,2941.96,3014.02,2905.82,2920.41,2960.66,2851.2,2922.8,2710.38,2662.94,2781.98,2708.32,2952,2827.37,2814.25,2742.53,2625.88,2549.03,2349.14,2323.6,2452.11,2350.4,2442.87,2442.87,2480.39,2505.82,2454.28,2481.19,2462.71,2485.4,2521.21,2527.02,2524.74,2524.86,2403.42,2366.93,2385.06,2258.95,2292.59,2433.64,2450.97,2450.4,2452,2452,2451.43,2458.49,2455.42,2441.96,2548.12,2520.87,2444.13,2394.75,2333.87,2316.65,2368.19,2519.61,2549.6,2598.86,2643.44,2643.44,2644.47,2848.35,2893.16,2961,2865.56,2873.77,2881.87,2875.48,2699.32,2808.1,2760.66,2282.67,2194.98,2376.74,2462.94,2435.23,2435.35,2348.23,2363.97,2363.97,2315.62,2281.87,2318.93,2282.21,2241.73,2438.31,2404.33,2322.46,2282.9,2264.77,2177.31,2304.1,2274.23,2194.18,2311.06,2317.33,2335.58,2254.73,2205.13,2241.51,2238.43,2274.34,2340.59,2295.67,2311.06,2341.73,2511.63,2323.49,2303.19,2235.35,2319.61,2396.92,2480.05,2480.05,2510.6,2526,2643.33,2698.29,2794.07,2814.48,2908.44,2943.22,3172.86,3174.34,3135.12,3243.9,3460.2,3481.53,3965.91,3815.62,3685.4,3843.9,4042.07,4111.06,3894.41,4050.86,4804.9,4657.47,5190.31,5231.36,5111.63,5079.82,5127.71,4835.8,4800.34,4721.21,5103.53,5126.45,5330.79,5330.79,5745.61,5650.4,5907.53,5884.83,5816.76,5946.86,6186.09,5965.79,5317.9,5590.99,5422.01,5158.49,5569.56,5833.18,6240.14,5784.38,5843.56,6127.37,6127.37,6289.97,5927.59,5926.34,6072.63,5947.32,6151.54,6623.83,6167.39,5904.45,5904.45,6294.75,5884.95,5899.77,6233.98,6361.35,6093.39,6250.06,6033.52,5711.97,5652.91,5741.96,6207.87,6297.95,6153.82,5951.54,5643.67,5183.81,4898.06,5534.66,5429.3,5526.11,5913.11,5496.58,5579.02,5511.52,5354.16,5408.44,5506.61,5507.53,5865.34,5769.67,5523.26,5318.36,5353.02,5396.24,5208.1,5463.85,5483.81,5435.23,5308.78,5367.39,5240.71,5211.63,5201.37,5445.5,5445.5,5766.7,5941.85,5742.3,5885.18,5626.11,5749.14,5843.79,6215.39,6383.35,7018.47,7112.54,7008.1,7175.14,7190.76,6931.24,6927.82,6975.6,7020.87,7228.16,7203.53,7405.02,7364.42,7077.31,6933.86,6775.83,6904.56,6508.78,6410.83,6029.08,6135.12,6097.38,6302.39,5791.68,5892.7,6057.92,6388.37,6595.67,6458.61,5755.99,5323.15,5517.67,5573.32,4611.17,5120.18,5799.09,5874.69,6304.45,6673.89,6089.62,5750.06,5740.14,6044.93,5577.99,4839.11,5170.58,4712.31,4712.31],"EuroStoxx50":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,98.96,99.67,100.11,99.43,98.91,100.14,101.72,103.08,104.51,104.89,104.94,106.18,105.36,106.61,106.92,106.87,107.58,107.29,107.25,107.4,107.4,107.55,107.56,107.33,107.94,107.94,108.75,108.83,108.79,108.95,108.55,108.46,108.51,107.82,109.05,108.07,107.76,108.06,107.94,108.24,107.37,107.65,109.11,108.88,108.36,107.03,105.98,106.91,106.73,107.37,106.23,106.15,106.22,107.53,107.3,108.43,108.55,109.03,108.62,108.54,108.66,109.54,109.54,109.37,108.39,108.56,108.9,111.21,111.03,111.65,111.12,111.05,111.19,111.86,112.07,112.04,111.52,111.84,112.85,113.12,112.76,112.51,112.21,113.25,112.98,112.75,113.67,114,114.21,114.85,113.93,114.21,113.92,114.47,114.68,114.17,113.83,113.78,113.12,113.12,113.12,111.86,112.22,112.85,112.86,117.35,117.54,117.4,116.89,116.77,116.77,117.38,117.64,119.01,120.02,119.48,119.71,119.6,118.87,119.33,119.47,119.47,117.6,116.86,117.67,117.33,117.93,117.66,117.66,117.41,117.4,116.82,116.61,117.01,117.83,117.83,116.59,116.42,116.91,117.64,116.26,116.71,116.36,115.65,116.25,117.43,116.8,116.6,116.64,116.25,116.84,116.07,115.99,113.87,112.91,114.55,114.14,114.11,113.57,113.63,114.1,113.65,115.31,115.73,115.67,115.35,114.12,114.82,114.8,113.23,113.28,113.95,114.53,114.59,113.76,113.15,113.15,113.48,113.71,115.06,115.01,115.33,113.78,112.63,111.74,113.2,113.57,114.31,113.57,113.04,112.31,113.36,112.8,113,112.8,112.22,111.15,111.66,112.24,112.97,112.53,112.22,112.64,113.1,113.1,114.66,115.23,115.57,115.68,115.33,115.69,115.84,115.65,116.11,116.17,116.06,116.01,116.62,116.9,117.93,118.18,118.28,117.93,118.54,118.2,118.44,118.06,118.34,118.28,118.24,118.3,118.35,118.74,118.16,118.26,118.39,118.45,117.82,119.32,119.81,120.14,120.52,121.29,121.01,121.05,120.8,120.02,119.9,118.51,117.89,117.26,116.66,116.31,116.94,116.37,116.83,117.42,116.87,117.18,117.48,116.92,117.55,117.76,117.11,115.72,117.32,117.13,116.83,117.21,117.82,117.51,118.11,117.5,116.66,116.8,118.4,117.51,116.54,117.14,116.57,116.57,116.57,116.46,115.61,114.94,114.94,115.14,117.07,118.35,118.64,118.85,118.42,117.94,118.51,118.48,118.82,118.51,118.78,119.71,120.24,120.47,119.51,119.08,119.65,119.51,118.32,118.4,117.35,115.58,114.12,111.37,113.32,110.79,109.11,110.49,109.6,110.54,111.19,112.41,111.79,112.69,112.52,112.58,112.89,113.61,113.44,112.81,111.51,109.07,110.07,110.15,110.79,111.97,112.21,112.5,111.45,111.24,112,112.76,111.36,111.93,111.57,109.84,108.19,107.56,108.81,109.28,110.27,110.27,110.27,109.79,109.58,112.52,111.8,112.02,112.81,112.18,112.98,113.11,112.88,114.09,114.52,114.38,114.62,115.24,115.17,114.35,115.01,115.43,116.01,116.01,116.58,115.77,116.47,116.92,116.71,117.1,117.1,116.96,116.97,116.92,116.88,117.84,117.23,117.23,117.68,116.19,115.53,115.32,114.25,112.46,112.89,111.75,113.29,113.82,113.4,113.53,113.5,113.09,114.17,114.01,114.14,115.7,114.98,113.72,112.69,112.83,111.65,112.9,110.52,110.51,111.44,110.4,111.39,110.62,111.74,111.93,112.88,113.13,113.52,113.94,112.27,113.03,113.32,113.14,113.42,114.33,113.88,113.5,113.31,114.27,113.78,115.12,115.71,115.22,115.65,115.65,113.81,114.24,114.27,114.96,114.61,114.62,112.4,111.85,111.84,110.19,110.8,110.65,111.33,111.92,112.2,112.17,112.43,113.37,113.1,113.38,112.55,111.3,111.37,110.2,108.77,108.12,108.04,108.56,108.64,109.13,109.36,109.72,109.77,110.17,110.5,111.64,112.55,111.88,112.18,112.62,113.17,111.51,112,111.17,111.71,110.72,109.75,108.57,108.97,107.17,105.28,104.79,105.31,106.85,106.39,105.35,105.33,104.65,103.04,102.69,103.81,102.84,103.5,103.24,104.89,105.11,105.45,105.54,105.22,106.49,106.21,105.94,104.78,105.79,105.15,104.66,104.34,103.67,102.22,103.46,102.57,102.91,104.08,103.87,103.93,104.13,104.09,105.47,104.62,103.34,99.92,100.33,98.97,100.23,101.95,102.09,101.45,100.5,99.73,100.1,98.41,98.43,98.43,98.43,98.43,96.36,97.97,97.97,97.97,96.93,99.79,99.52,100.22,100.72,100.9,100.71,100.22,100.65,100.95,100.69,102.84,102.52,102.11,102.09,102.56,103.77,102.92,103.45,103.72,103.64,104.03,103.83,105.47,105.39,103.36,102.86,103.85,104.67,105.05,104.4,106.33,106.44,106.27,106.93,107.06,107.29,107.6,107.9,107.69,108.2,108.65,108.82,109.15,109.06,108.54,107.72,108.4,108.38,109.02,109.63,111.08,111.14,111.83,110.63,110.47,108.44,108.27,108.89,108.98,108.92,109.95,111.06,111.39,112.7,112.91,113.09,112.78,112.1,112.34,112.69,113.1,113.19,113.61,114.08,114.79,114.79,114.79,114.94,114.9,114.55,114.83,114.88,115.29,115.29,114.45,114.9,113.6,111.57,112.1,109.92,110.26,108.94,110.37,111.07,112.8,112.38,110.54,111.09,111.1,109.15,109.92,110.36,109.86,108.18,108.18,107.61,108.26,109.35,109.56,109.51,110.83,110.83,111.57,111.1,111.22,110.85,110.98,113.27,113.33,113.77,113.73,113.36,112.99,112.94,112.92,113.95,114.74,115.08,116.15,116.26,115.73,115.59,115.13,114.86,114.71,114.74,114.89,115.52,114.87,114.25,114.16,114.48,115.89,115.89,115.15,115.62,115.59,113.6,113.73,113.73,110.75,108.61,107.98,108.58,110.73,109.36,109.13,110.13,107.88,107.69,109.21,110.52,109.9,111.37,110.67,109.38,109.86,110.57,110.4,111.91,112.41,112.6,112.22,113.2,114.31,114.66,114.65,114.78,115.37,116.09,116.46,115.42,115.51,115.73,116.54,117.16,116.03,115.87,115.24,115.87,116.32,117.09,115.41,111.97,112.1,113.07,113.87,112.61,113.57,114.62,117.11,116.66,118.05,118.07,117.72,117.42,118.1,118.25,118.32,118.8,118.91,118.94,118.82,118.76,118.24,118.87,120.23,120.61,121.01,121.6,121.36,121.27,121.78,121.36,121.01,121.76,121.54,121.26,120.85,120.71,120.96,121.63,121.56,121.8,121.52,121.49,118.97,118.46,120.06,119.67,121.12,120.46,120.45,120.96,121.58,122.4,123.76,122.86,122.66,122.66,123.89,123.89,123.89,123.89,123.89,124.07,122.97,122.97,122.97,123.78,123.1,123.32,123.76,124.52,124.31,123.99,123.83,123.64,123.81,124.93,124.62,124.3,123.67,122.58,123.97,120.65,122.01,122.57,121.07,119.44,120.11,122.43,123.93,124.84,124.61,124.43,125.5,126.44,126.19,126,126.4,125.86,126.79,125.41,124.67,119.67,117.19,117.36,113.37,109.22,109.53,110.62,112.21,110.34,106.03,97.07,95.46,95.31,83.49,84.83,80.38,83.01,78.27,80.5,83.6,81.54,89.07,91.86,93.42,89.51,90.72,91.42,87.93,88.19,87.36,91.72,93.74,93.53,94.9,94.9,94.9,95.71,92.12,92.26,94.75,95.44,91.57,93,93.57,92.15,94.54,96.18,98.28,96.05,96.05,92.39,94.34,93.29,94.5,95.4,94.6,94.61,92.2,90.55,90.89,95.52,95.22,96.52,96.52,95.31,97.47,98.39,100.09,101.51,100.06,100.06,103.63,107.26,107,111.02,110.43,108.93,108.05,103.16,103.46,102.89,106.37,107.18,106.61,107.24,106.34,108.22,104.85,105.59,105.11,106.02,106.09,105.91,108.91,108.07,109.9,108.96,107.8,106.98,108.13,109.89,108.96,110.82,110.4,110.41,111.15,111.71,110.58,110.61,108.61,108.35,108.37,108.26,105.24,104.13,106.56,106.75,107.22,106.3,106.7,106.93,109.31,110.33,109.66,108.42,108.45,107.91,108.83,107.4,106.93,109.3,109.23,110.12,109.27,108.76,107.35,107.52,109.49,108.39,106.96,108.72,107.18,109.07,108.67,108.77,108.81,109.31,109.53,108.8,107.72,103.69,103.8,104.32,103.65,102.91,105.73,105.44,104.76,104.78,104.68,105.64,106.07,106.07,106.8,107.37,108.19,107.57,107.38,104.73,106.47,106.37,105.89,104.34,104.04,104.94,101.87,100.73,97.22,97.1,97.04,99.05,101.65,103.7,105.48,105.11,111.79,112.93,113.74,112.46,112.59,113.71,113.78,114.23,113.24,113.75,113.6,115.08,115.21,115.17,115.73,114.57,115.64,115.51,115.38,116.1,115.8,115.66,115.77,115.55,114.35,114.94,115.52,116.23,116.81,116.32,113.13,114.73,116.1,116.1,116.1,117.29,117.48,117.16,117.16,116.93,116.38,118.46,118.83,119.57,118.77,118.49,118.64,119.45,118.08,118.18,117.95,118.88,118.7,118.17,116.56,117.86,116.01,116.69,114.21,115.83,117.78,118.42,119.48,119.93,120.24,120.1,119.68,120.45,121.23,122.5,122.24,121.37,120.75,121.82,121.37,121.02,121.57,120.89,119.29,121.59,121.63,121.8,121.54,120.38,123.45,124.2,125.31,126.15,125.75,125.64,126.33,126.29,126.87,125.87,125.77,125.54,125.72,125.72,126.84,127.37,128.8,128.57,129.44,129.44,129.44,130.25,129.8,130.49,130.52,129.97,130.13,130.44,131,132.3,131.87,129.26,130.44,131.7,131.65,131.9,131.61,131.71,131.12,130.39,131.23,128.75,131.31,131.2,132.34,131.98,129.45,129.49,129.49,131.79,131.44,131.39,129.14,131.21,132.06,132.06,132.4,132.26,132.5,133.53,132.51,133.57,134.12,133.82,134.15,134.42,134.37,134.39,134.37,135.37,135.57,135.93,136.2,136.4,133.95,134.9,135.26,133.71,135.23,135.18,134.17,134.74,133.33,133.81,133.98,134.08,132.95,133.79,130.94,133.45,134.28,134.32,134.48,133.07,132.39,128.87,129.79,132.09,133.15,134.8,134.58,133.34,134.6,135.05,134.15,135.04,135.09,135.97,136.5,136.94,137.03,137.38,137.99,138.64,138.75,137.86,137.66,137.43,135.31,136.06,137,137.06,137.16,136.79,137.48,137.74,137.66,138.67,138.83,137.84,139.29,138.6,137.03,137.03,136.81,137.43,137.5,136,136.79,135.51,132.65,134.42,136.14,137.61,136.42,136.65,133.15,133.85,132.79,132.38,131.1,133.36,131.63,134.44,133.62,133.6,133.02,133.95,136.11,137.22,136.18,136.69,136.87,136.33,137.41,137.39,138.56,138.46,138.89,139.44,140.42,140.93,141.37,142.15,143.13,142.78,142.52,142.66,142.96,143.37,143.89,144.39,144.37,143.8,142.91,142.33,140.53,140.28,140.84,134.16,134.81,133.29,137.09,134.76,133.85,135.72,140.28,138.86,138.05,137.75,137.22,135.96,136.46,137.84,136.51,134.73,136.96,138.34,139.94,139.94,140.66,141.45,140.56,141.26,141.26,142.1,143.28,144.08,141.87,141.25,139.07,140.45,141.6,141.58,140.15,141.13,139.67,140.02,141.05,138.75,133,133.78,136.62,137.29,135.71,136.94,138.58,138.5,135.84,134.06,135.17,135.46,137.91,137.68,136.31,133.33,135.93,135.72,134.93,133.65,130.75,130.74,130.34,125.62,130.26,128.73,123.54,125.33,122.75,116.65,115.22,114.99,123.54,119.78,120.94,122.72,122.63,127.6,127.46,128.02,127.34,128.79,126.93,126.74,126.88,127.51,131.29,129.88,128.02,128.55,129.61,128.52,125.47,124.72,126.57,125.96,125.69,125.57,126.25,126.25,126.25,125.67,127.83,128.86,125.97,123.27,122.08,122.51,123.9,124.75,122.44,123.38,122.2,121.27,119.05,115.7,116.61,119.67,118.54,121.49,120.9,122.74,121.07,119.19,119.97,121.65,119.66,120.62,120.62,124.95,126.02,124.3,123.33,124.5,124.12,124.12,124.88,124.29,122.18,118.07,114.9,114,115.88,112.45,112.8,113.83,114.62,113.66,112.73,115.9,116.09,116.43,115.28,113.33,113.12,113.25,110.22,112.25,114.44,115.03,113.89,114.39,113.31,111.42,114.07,115.2,117.68,117.61,117.98,117.98,118.23,117.29,118.35,119.81,121.64,121.64,120.87,122.44,123.17,122.21,123.25,121.88,122.99,123.25,123.9,124.32,124.83,123.21,123.91,122.37,120.01,119.82,120.31,120.54,118.22,117.13,116.85,115.38,113.39,116.27,114.49,114.82,114.88,115.22,117.11,119.62,117.64,117.03,116.19,114.83,114.8,113.74,114.55,112.42,109.85,109.65,109.19,109.41,107.57,108.85,109.64,114.31,113.1,112.63,110.73,110.12,109.58,109.29,110.3,110.94,112.9,113.63,113.87,114.58,114.05,115.73,117.62,118.27,118.24,118.52,118.67,119.77,118.82,117.87,120.99,121.66,122.66,122.3,126.18,126.9,127.53,128.43,127.37,127.23,128.75,128.24,128.92,129.46,129.97,129.98,129.1,129.07,130.06,130.71,130.49,129.79,129.22,128.62,128.63,129.33,128.65,130.79,130.41,125.83,124.79,125.03,124.74,127.02,125.42,125.21,125.21,125.74,124.95,126.3,124.45,124.45,127.36,130.36,129.89,131.8,133.47,133.1,134.49,135.37,136.16,136.37,136.94,136.94,134.31,135.15,136.16,136.24,136.08,136.92,137.06,136.42,136.58,136.84,139.13,139.68,137.96,138.08,138.08,139.42,137.71,139.13,139.05,140.4,140.97,140.24,140.11,139.43,139.18,139.69,137.08,139.35,139.04,138.29,139.11,140.89,141.51,140.37,140.68,140.6,138.75,134.38,137.1,132.36,135.05,133.35,135.13,137.17,137.64,138.01,135.5,136.62,136.74,138.8,140.58,141.55,141.42,141.56,141,141.37,141.37,141.37,142.15,142.17,143.13,144.04,143.28,144.14,144.13,143.84,144.62,144.4,143.61,142.62,142.96,143,143,140.89,141.39,140.63,142.38,142.65,141.82,141.28,141.38,141.65,141.6,141.57,141.82,141.82,144.18,143.87,142.45,139.87,140.06,142.29,142.29,140.78,138.37,139.67,141.83,140.84,140.9,140.79,140.98,140.72,141.6,142.62,143.55,143.19,144.17,143.1,142.47,141.8,141.21,140.13,140.42,141.23,142.53,142.85,144.31,144.28,144.04,142.72,138.54,138.98,139.63,140.62,143.04,144.07,144.34,142.92,143.35,143.1,143.48,144.06,143.78,144.05,142.57,145.9,146.52,146.68,146.68,142.26,141.21,142.14,142.29,140.69,141.63,143.82,141.76,142.05,140.68,140.54,138.69,138.2,138.59,139.76,139.97,138.84,138.97,140.85,141.93,141.56,140.96,140.49,140.4,140.05,139.03,138.47,139,139.56,139.16,138.55,140.39,140.9,139.28,139.18,140.27,138.19,138.01,136.71,135.45,135.54,136.52,136.95,135.73,134.35,134.49,134.49,135.96,134.91,137.95,137.8,137.72,135.68,136.13,136.21,134.69,134.18,132.03,132.59,133.36,133.62,132.84,131.69,132.15,133.22,134.23,136.78,136.95,136.42,136.25,137.07,138.74,137.69,138.83,140.79,141.57,141.14,142.4,142.45,142.1,142.77,143.07,143.42,142.84,142.63,143.37,143.76,144.95,144.83,146.07,147.07,146.76,148.38,148.94,148.82,148.61,148.9,149.24,148.31,148.78,148.73,148.43,148.32,148.32,148.32,148.55,148.09,148.33,148.33,145.92,146.77,146.42,147.14,146.54,146.6,145.73,146.96,146.13,145.86,144.44,146.08,145.94,146.97,146.5,149.72,150.32,152.06,152.19,152.96,152.49,152.17,152.69,152.71,153.88,153.49,154.53,154.7,155.7,153.83,154.48,155.6,156.33,156.25,156.16,156.65,159.28,159.84,159.57,160.27,160.21,160.01,160.57,161.16,160.51,161.25,163.18,162.75,161.74,163.47,164.04,163.8,163.56,163.46,164.28,164.03,165.74,165.04,165.47,166.13,166.7,166.76,166.76,166.76,165.4,166.29,166.34,164.51,165.53,163.72,164.05,162.93,162.55,163.51,161.3,161.2,161.94,161.33,161.95,164.29,163.69,162.02,164.25,163.4,161.44,161.44,160.43,161.45,162.61,164.55,165.27,165.27,166.81,166.61,166.66,167.33,166.4,166.13,166.13,165.56,164.85,165.25,165.18,165.96,165.02,162.81,163.44,163.49,164.14,162.49,165.19,166.29,165.7,164.56,162.88,165.15,161.91,158.74,160.1,161.25,160.26,162.31,160.98,162.41,161.92,161.26,160.83,160.54,161.72,160.95,162.9,163.61,163.35,163.03,160.86,162.67,163.24,165.43,163.47,162.31,160.46,159.76,158.35,160.66,161.29,159.49,157.83,159.51,157.97,158.81,159.85,159.85,152.17,149.97,150.09,153.13,153.15,153.37,153.26,154.01,155.09,157.72,158.79,159.8,159.35,160.26,160.25,161.04,160.63,160.7,161.17,162.92,162.64,163.14,161.15,159.04,157.96,155.43,156.76,155.73,156.27,157.92,158.9,158.37,159.45,158.62,162.16,159.81,160.27,162.08,161.3,165.09,166.23,164.04,162.52,162.82,161.44,162.54,163.03,162.35,163.45,163.05,164.15,165.37,162.27,161.03,162.29,163.57,162.09,162.03,161.48,161.9,162.15,163.03,162.38,160.27,158.37,160.01,159.17,159.77,157.48,159.17,157.55,159.23,155.65,155.5,158.56,157.29,157.14,155.86,155.15,156.01,157.1,157.46,156.21,155.27,156.1,157.61,158.99,160.04,161.37,162.43,163.29,163.54,162.44,162.69,162.89,162.97,162.28,162.14,162.62,160.05,159.5,159.2,159.2,159.2,159.2,160.7,159.73,159.73,159.73,159.8,163.58,164.41,163.9,164.61,163.28,162.52,163.38,165.08,167.53,168.89,169.42,169.47,170.77,171.16,171.22,170.2,170.44,171.59,173.28,173.43,171.17,172.7,172.92,175.72,174.7,175.78,176.85,177.33,180.44,180.21,181.07,181.53,179.15,179.15,179.6,178.91,178.71,181.34,179.52,179.23,181.76,176.73,180.07,181.1,179.39,176.72,174.19,175.81,174.79,177.28,178.64,179.93,180.67,178.81,177.93,177.66,179.61,177.53,176.52,174.89,172.17,174.53,173.99,167.74,160.03,152.75,156.6,151.63,158.08,157.04,161.11,163.05,162.92,161.9,161.9,161.9,162.76,167.26,167.79,169.08,169.61,169.33,169.28,169.28,173.38,173.31,172.66,171.57,173.5,174.18,176.89,177.68,177.26,177.54,178.05,178.04,178.94,178.93,177.95,174.73,176.99,177.65,176.43,176.43,176.05,175.69,176.35,177.31,177.49,178.13,178.13,177.65,176.92,175.86,173.55,175.16,173.49,172.78,170.48,171.68,171.3,173.77,172.29,172.03,174.7,173.97,173.29,174.48,175.28,173.5,175.23,176.22,178.64,178.4,176.6,176.19,175.64,173.8,176.39,175.81,175.27,173.55,175.31,175.67,175.57,175.1,176.46,176.92,174.52,174.52,171.97,172.21,172.66,174.91,175.43,174.91,175.04,176.76,178.28,178.74,178.28,179.88,179.52,179.18,180.04,178.59,176.61,176.92,177.04,175.56,176.06,173.57,174.68,175.4,174.46,175.92,176.12,175.88,176.71,176.84,178.47,176.23,176.15,179,179.06,178.52,179.52,179.26,178.62,180.41,180.65,181.41,183.09,185.21,185.4,184.65,184.15,185.34,184.54,181.45,182.66,182.13,183.87,185.41,183.95,186.36,186.55,184.99,185.95,186.15,187.35,187.13,187.18,186.96,185.74,186.3,185.68,185.97,184.07,182.61,185.82,187.83,189.85,188.39,186.78,185.05,181.56,181.8,182.72,180.92,181.36,182.85,185.53,185.45,185.94,185.92,186.53,186.81,187.58,187.77,187.82,187.59,187.25,188.75,187.66,188.71,187.57,186.38,188.35,188.96,188.42,188.6,188.6,188.6,188.6,188.68,190.14,190.14,190.14,194.32,194.59,194.32,193.69,196.74,197.36,197.8,196.99,198.18,197.79,194.39,193.29,192.98,195.39,195.13,195.44,196.65,194.63,193.28,195.11,197.07,196.67,195.86,194.39,196.77,198.76,198.37,198,197.2,196.34,196.13,197.54,200.22,198.78,201.13,200.56,200.65,202.51,202.13,201.37,196.4,189.34,192.59,189.7,187.64,186.5,191.48,190.09,188.59,187.53,188.26,189.26,188.19,184.16,180.47,182.86,183.09,185.32,182.59,180.61,181.79,182.71,188.06,186.75,186.75,186.75,184.79,193.98,193.42,194.4,193.71,196.32,194.87,194.64,198.72,196.26,194.54,193.75,193.37,193,192.24,191.45,190.81,192.94,192.94,189.07,192.55,197.72,195.93,193.92,193.4,190.54,192.27,192.27,191.18,191.87,191.94,196.04,195.52,197.46,197.46,198.93,199.14,198.63,198.48,197.97,200.36,198.58,200.22,198.86,198.87,198.46,197.15,198.69,202.98,204.35,205.27,206.67,207.43,206.44,207.04,204.39,203.87,205.6,204.09,204.42,207.59,206.09,208.65,210.36,209.88,207.32,203.55,206.15,205.68,205.72,206.02,205.54,206.13,204.4,204.29,206.2,207.22,203.72,206.04,206.08,206.32,204.99,208.12,208.57,210.82,212.79,212.47,213.31,214.01,214.4,214.91,214.34,214.72,214.53,214.23,212.18,211.41,210.67,211.99,211.52,211.77,212.27,210.76,212.76,210.61,208.93,208.71,209.38,209.72,210.08,210.38,207.05,205.65,207.49,205.37,204.58,205.57,207.42,204.57,207.26,207.48,206.66,205.77,206.76,206.71,207.33,205.65,202.58,204.65,204.77,205.76,202.74,200.98,202.51,203.43,202.3,203.07,202.35,203.53,201.58,200.82,203.63,199.68,199.06,200.64,202.23,202.33,203.62,201.13,202.6,201.57,205.54,204.42,202.42,206.35,207.58,209.73,209.91,209.52,208.25,203.78,201.89,200.56,194.92,199.27,196.95,197.17],"HSCEI":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.87,100.57,100.49,101.04,99.91,99.2,99.78,100.4,101.09,100.79,99.07,99.28,99.14,96.82,96.73,95.78,94.82,95.32,93.97,93.78,93.78,93.78,95,95.12,95.96,95.96,96.62,96.43,98.04,98.17,98.08,98.71,99.42,99.31,99.97,98.73,99.1,100.13,100.02,99.24,99.35,99.68,99.51,100.66,100.14,100.14,100.14,99.66,99.04,98.91,100.51,100.57,101.69,102.91,103.42,104.78,104.74,106.6,106.79,105.82,106.69,106.32,107.63,107.47,106.42,105.52,105.19,105.08,104.66,103.62,103.89,104.49,105.01,103.12,102.85,104.79,105.36,104.93,107.52,107.39,108.11,108.72,106.81,107.12,107.02,105.84,106.49,106.61,105.78,104.94,105.36,105.36,105.87,104.97,104.94,104.73,103.84,104.27,104.23,104.23,104.23,102.59,101.98,102.72,102.65,103.24,104.92,105.39,104.81,104.39,104.39,103.92,103.92,103.04,101.39,101.96,103.46,104.47,104.77,105.03,106.74,106.57,106.06,104.91,104.87,105.97,106.18,106.14,107.98,108.06,108.47,108.47,108.3,108.47,108.95,108.24,108.34,108.39,108.78,108.19,107.11,107.51,107.4,105.68,106.07,107.46,106.93,106.16,106.26,106.54,107.56,107.23,106.31,106.56,105.87,106.36,105.27,106.03,105.68,104.71,104.33,106.39,107.43,109.06,109.58,110.14,109.86,110.93,110.79,110.18,110.53,110.14,110.64,110.91,109.87,110.6,112.6,112.92,112.38,112.39,112.91,113.17,111.97,110.13,108,109.37,109.68,110.5,110.33,109.23,109.82,111.9,111.9,112.88,115.3,115.85,115.38,116.18,115.37,115.27,114.22,114.31,113.67,113.37,113.89,114.62,114.83,114.27,113.39,113.05,114.36,113.64,114.13,114.38,113.47,111.46,112.03,112.72,111.08,111.44,111.44,115.48,116.41,116.41,117.05,116.29,116.63,116.56,117.47,117.67,118.52,118.16,118.71,116.01,118.06,117.37,116.5,117.4,116.91,118.93,118.11,117.54,118.86,118.47,118.51,117.72,118.95,118.24,119.96,119.97,119.35,118.5,116.57,117.81,118.57,117.86,121.29,122.15,119.89,121.63,120.25,119.56,118.98,117.22,116.95,117.65,117.31,114.02,113.9,115.31,116.77,115.55,117.67,117.79,116.09,116.6,117.89,117.52,118.45,119.03,119.03,119.03,118.67,119.34,119.6,123.28,123.48,124.65,124.73,124.97,125.18,125.52,125.59,127.36,127.38,130.61,131.45,133.75,134.62,134.88,137.8,139.13,136.75,140.18,139.52,136.76,138.52,137.22,138.29,137.69,129.58,127,126.46,121.57,121.55,122.62,125.24,128.04,128.04,128.04,126.62,129.59,127.97,130.08,131.09,129.18,126.47,126.95,124.65,122.49,125.75,124.41,125.99,126.98,129.69,130.2,129.56,129.92,129.45,129.32,128.67,127.9,126.94,123.88,124.59,125.65,122.58,122.55,122.55,122.55,123.97,121.11,121.11,122.24,123.32,125.88,125.89,125.52,125.24,122.65,121.55,122.43,125.02,123.13,122.57,125.07,123.53,122.05,123.25,125.96,125.96,124.55,122.76,121.45,122.23,124.05,124.47,124.96,126.1,128.13,127.07,127.07,125.42,126.2,126.14,126.14,123.5,124.13,123.06,123.75,122.15,120.21,122.35,122.78,125.12,125.22,125.47,126.74,124.26,124.33,124.68,122.94,122.07,121.25,121.25,117.39,117.52,116.08,115.83,114.49,113.57,111.12,111.01,113.1,113.1,111.05,109.42,108.35,108.5,109.99,110.57,108.87,109.83,109.77,109.34,108.19,108.05,107.49,109.12,109.61,112.09,113.11,112.57,112.84,112.83,112.61,112.08,109.63,109.23,109.31,110.99,111.35,112.56,111.78,109.97,109.75,107.61,107.04,107.39,108.6,109.68,110.83,110.46,110.11,112.86,113.35,113.21,112.03,111.09,110.45,111.24,108.74,108.05,107.86,106.57,105.55,104.58,107.28,108.02,106.86,107.83,109.72,110.24,112.63,110.6,110.6,112.21,111.73,112.54,112.54,109.85,110.17,107.74,107.56,106.16,106.44,106.66,103.09,105.2,103.62,104.17,104.17,103.54,104.41,107.15,104.54,104.46,103.95,102.74,102.27,102.13,103.56,105,109.17,107.71,108.6,108.69,109.33,106.55,106.64,107.03,106.28,107.82,108.11,108.59,106.9,107.11,106.7,106.11,107.47,107.41,108.63,108.12,108.49,111.15,111.41,109.87,107.05,105.92,104.93,104.65,106.4,107.83,105.81,105.74,104.5,104.14,103.07,103.17,102.79,102.79,102.79,102.05,102.06,103.42,100.44,100.46,102.45,103.41,103.51,105.8,106.17,106.79,105.13,107.28,107.82,107.37,108.65,109.43,108.41,108.59,109.2,111.07,111.16,111,111.31,112.72,113.01,112.73,112.73,112.73,112.73,111.91,112.53,112.81,114.39,114.1,111.72,113.88,113.55,114.7,115.48,116.72,118.8,117.91,117.03,116.11,117.53,118.24,118.31,118.4,117.06,113.96,115.19,117.12,116.5,116.93,117.55,119.25,119.37,118.74,117.91,117.64,114.73,114.72,115.48,115.37,116.23,118.05,117.94,119.56,119.43,119.43,120.46,120.68,120.16,118.67,119.1,118.81,120.74,121.03,120.21,120.21,120.21,119.82,119.14,117.48,117.58,118.88,117.9,117.9,118.04,118.23,114.74,115.02,113.35,110.77,111.65,111.65,109.95,110.36,110.43,109.18,108.61,108.62,108.32,106.24,106.69,106.26,106.4,106.13,106.74,106.1,106.54,105.63,105.67,105.56,105.56,107.52,108.48,107.2,106.97,106.43,106.52,107.33,109.95,111.56,111.55,111.88,109.73,109.97,111.31,111.15,111.15,112.17,111.56,111.47,111.29,109.55,108.79,109.31,110.15,110.19,110.71,110.98,110.8,110.16,111.43,110.01,110.42,110.92,111.65,110.86,110.12,110.5,109.04,108.49,105.7,102.98,102.27,102.07,102.57,102.08,102.12,100.58,100.78,101.16,101.78,103.26,103.5,103.95,103.4,104.13,102.28,102.1,101.95,102.07,102.99,103.2,102.51,105.09,106.07,106.54,106.41,106.26,107.91,108.19,109.17,108.56,107.27,107.03,106.08,105.98,105.08,104.91,103.87,104.31,103.66,104.2,104.2,104.01,104.4,103.65,103.65,104.2,103.87,104.37,106.77,107.33,107.25,107.58,108.15,107.66,107.69,107.52,106.76,107.59,106.91,107.96,107.73,107.04,107.59,108.5,110.45,111.11,110.94,111.7,111.15,108.41,109.2,107.45,106.51,106.48,107.83,109.26,108.47,106.74,107.31,108.57,108.45,108.48,107.88,105.23,105.86,105.78,104.74,105.43,106.3,106.31,106.18,107.28,108.42,110.7,110.1,112,112.61,112.21,112.67,112.89,112.72,112.72,112.72,114.34,114.66,114.07,115.63,114.95,114.05,114.39,113.17,115.23,115.09,116.41,115.99,115.37,115.71,116.65,115.74,112.05,114.14,111.87,112.11,112.11,112.11,108.46,105.46,104.6,104.88,106.59,107.19,109.95,109.35,108.83,110.4,111.18,110.68,110.96,111.93,110.37,111.42,111.48,110.22,107.95,108.07,107.27,108.2,105.23,107.1,107.1,107.47,109.58,106.81,101.98,103.71,102.86,99.34,98.57,94.25,94.14,89.89,87.43,93.14,89.39,93.81,97.34,96.5,97.09,96.04,98,96.06,97.31,96.94,98.59,100.58,98.89,100.21,100.21,100.21,100.58,99.33,98.8,100.26,100.35,98.21,98.77,99.12,98.63,100.87,101.98,102.56,102.56,102.56,98.05,99.06,100.18,99.73,100.8,102.05,100.43,100.46,98.95,98.82,99.35,100.95,101.1,100.61,96.29,96.69,98.01,97.72,97.56,97.66,100.45,100.88,101.81,101.82,102.82,102.23,103.38,103.61,101.58,100.43,98.63,100.79,101.22,101.29,101.88,100.91,102.08,101.5,101.5,100.64,99.67,99.68,99.68,102.72,104.63,109.57,108.28,109.78,110.13,107.67,108.02,106.28,106.13,103.51,104.22,105.16,106.69,104.63,105.46,102.97,102.91,103.69,104.03,103.13,102.55,102.48,104.23,104.76,104.21,102.79,102.05,103.71,104.35,104.64,104.86,106.08,106.49,105.34,103.73,104.31,105.58,105.12,105.21,104.21,104.01,102.06,102.28,102.15,101.53,100.96,99.74,100.41,99.37,98.91,99.61,100.17,100.4,100.57,99.41,100.13,98.47,97.82,97.64,95.72,95.02,95.84,94.8,95.99,95.99,95.99,96.5,97.41,98.36,98.31,98.24,100.9,100.9,101.33,99.71,101.27,101.92,102.02,102.94,103.01,103.43,103.43,102.17,101.77,101.69,99.69,101.49,102.87,103.16,107.03,107.23,108.61,108.14,107.67,108.06,107.71,108.06,107.76,108.68,107.82,107.79,108.95,108.4,107.84,109.31,110.21,107.72,108.88,108,108.13,108.52,106.98,106.33,107.13,106.39,106.76,106.67,106.22,106.86,107.72,107.08,106.25,106.07,107.07,106.54,106.54,105.32,106.73,108.91,109.68,109.53,110.05,111.33,110.28,111.9,112.96,114.58,114.25,115.41,115.63,117.08,119.86,122.05,121.44,119.28,122.17,119.46,119.01,115.77,114.49,117,118.58,119.01,118.11,118.09,118.08,118.51,120.63,121.35,121.35,121.35,122.94,124.91,123,123.66,121.49,121.65,117.56,119.68,114.88,116.99,116.05,119.16,115.68,115.34,112.51,112.08,112.97,115.83,114.12,113.83,115.72,116.02,117.16,115.26,115.49,113.49,110.8,109.74,112.01,111.77,112.57,112.07,114.58,114.58,114.58,114.58,113.08,113.48,112.13,111.08,110.83,112.35,111.4,112.64,113.31,113.23,111.22,111.74,113.05,112.17,112.19,112.51,112.87,110.57,109.43,109.96,109.52,109.87,109.28,108.79,106.55,107.83,105.62,106.28,107.29,108.83,108.83,108.71,109.32,108.69,110.24,110.88,110.81,110.25,111.22,112.26,111.86,110.59,110.37,109.78,109.59,109.34,109.46,109.81,109.81,108.98,107.89,108.17,108.75,107.74,106.94,109.03,109.06,111.12,110.96,109.88,108.92,108.92,106.39,104.94,104.9,103.67,100.33,100.97,101.59,103.3,102.81,103.92,103.7,101.72,100.76,100.42,102.21,100.5,95.56,90.7,92.65,96.17,94.31,95.37,95.2,96.21,94.96,94.72,95.14,97.03,97.53,96.68,95.79,94.64,92.52,93.46,91.07,89.3,90.04,92.94,92.7,91.29,91.5,91.89,93.81,94.7,95.41,94.91,95.72,96.71,96.52,93.8,95.88,94.37,92.76,91.28,89.94,91.32,88.24,88.26,88.26,89.21,87.89,87.68,89.07,89.48,89.13,89.13,87.04,86.98,85.93,89,89.64,91.92,90.39,90.39,90.39,91.58,91.64,93.32,94.75,94.72,95.57,95.22,94.58,92.89,92.47,91.54,90.9,90.54,90.47,91.45,90.1,89.82,89.95,91.02,92.42,93.1,92.8,94.23,93.9,92.3,91.63,91.21,90.17,89.83,89.98,87.6,86.8,85.48,86.07,86.89,86.37,84.52,87.1,87.06,88.43,87.62,87.34,85.99,85.22,85.29,83.94,82.15,83.16,83.71,83.8,83.78,83.78,83.7,82.72,82.7,84.13,83.64,83.55,81.87,82.42,84.08,85.45,85.48,87.97,87.87,87.38,86.45,86.3,86.23,89.49,89.76,88.44,86.86,86.95,84.69,83.86,85.29,85.29,85.29,85.29,87.68,87.74,86.96,89.1,89.78,89.73,88.03,87.11,88.65,88.98,87.21,86.37,84.48,84.95,82.03,81.63,81.96,82.26,80.78,80.69,78.52,75.71,73.93,73.44,74.11,72.12,66.96,62.55,70.37,75.66,75.24,74,77,77.99,76.89,74.4,75.55,76.74,77.72,76.87,76.99,79.37,79.37,77.72,76.56,76.51,73.63,74.2,74.72,75.44,75.44,75.44,73.21,72.5,71.11,71.22,68.28,68.92,69.31,70.67,74.55,74.55,74.23,72.91,72.7,69.55,69.55,68.01,69.15,67.36,69.53,69.73,72.28,72.41,70.47,72.74,71.73,70.31,70.46,70.25,72.34,74.11,75.76,75.03,74.23,74.23,76.61,76.28,78.44,77.69,77.73,74.98,74.91,76.13,74.15,75.26,75.58,77.11,74.92,76.23,77.93,79.84,80.63,78.6,78.31,78.31,78.12,78.06,77.08,77.01,77.14,74.78,73.46,72.99,72.79,71.07,73.22,72.49,73.33,72.52,72.59,72.29,73.39,72.43,72.34,70.33,70.24,68.46,68.81,70.27,70.5,69.68,69.4,67.86,69.7,70.04,69.6,68.72,69,68.44,68.64,68.39,67.91,67.06,69.96,70.69,70.2,69.87,70.12,68.86,68.15,67.18,66.96,66.53,65.75,67.7,67.7,67.75,66.09,66.48,65.58,64.74,65.43,64.01,63.29,62.45,62.69,62.82,60.86,60.39,60.41,59.82,59.82,63.58,63.18,62.05,60.07,58.52,58.14,56.8,57.5,57.54,58.8,57.18,56.3,56.36,52.24,52.91,53.29,53.55,51.37,50.44,53.21,54.7,52.81,56,57.57,57.23,56.53,55.33,59.93,61.08,64.04,63.59,62.72,62.57,61.3,60.28,60.72,61.21,60.99,59.98,63.7,65.11,65.22,65.05,68.5,67.95,65.71,68.1,69.81,67.7,67.97,68.46,67.33,67.77,67.46,66.11,66.39,68.6,67.85,67.85,67.85,69.18,68.39,68.49,68.49,69.8,72.17,73.26,72.97,74.42,74.19,74.68,74.69,75.5,75.08,74.71,74.98,74.69,76.44,76.44,76.44,76.44,78.72,79.4,76.57,75.84,77.22,76.67,75.45,73.43,73.87,73.43,74.7,72.79,72.98,72.63,71.69,72.42,71.41,72.15,70.73,69.79,70.07,68.47,68.13,67.22,70.62,70.04,70.88,70.86,70.6,68.71,67.92,65.84,67.31,65.77,67,66.21,67.57,66.08,66.9,67.82,69.83,69.4,67.91,68.74,70.26,70.71,71.18,70.89,70.23,70.23,70.42,70.42,70.42,70.99,70.14,70.23,70.63,72.07,71.53,70.37,70.43,69.09,68.77,67.43,67.97,68.18,68.46,68.46,68.23,67.31,68.63,69.43,70.45,68.79,68.26,68.39,68.06,69.25,69.35,67.79,68.59,67.35,68.37,67.45,66.17,64.69,64.69,63.85,64.18,62.95,62.81,65.66,66.02,66.18,66.81,66.8,67.31,67.27,67.6,67.18,69.18,69.79,69.22,67.98,66.45,66.45,65.32,65.09,66.44,66.61,65.64,65.63,67.32,67.55,66.29,64.03,63.32,63.69,64.31,65.15,66.84,66.99,66.99,65.37,65.19,65,65.52,64.05,67.46,66.9,68.14,69.54,70.47,70.01,68.12,67.95,68.77,68.79,67.29,67.55,67.71,66.81,65.61,65.03,64.07,64.27,62.79,61.6,62.28,62.48,64.02,63.08,63.8,65.24,64.93,64.68,64.68,66.73,65.34,65.41,64.5,64.5,64.34,63.94,63.69,64.1,64.45,63.43,63.69,63.14,62.3,63.97,62.62,61.6,62,61.19,62.8,62.8,60.77,60.09,60.14,61.02,61.27,61.82,62.64,64.02,62.47,61.79,62.23,62.06,60.51,59.98,59.98,59.24,59.79,59.85,61.07,60.88,59.87,59.85,60.38,61.82,63.15,62.18,61.69,61.59,60.27,61.17,60.92,63.37,62.48,61.02,62.34,62.07,62.05,63.03,61.71,61.54,60.85,59.44,59.83,58.85,58.26,57.3,57.85,57.36,57.18,56.51,57.35,56.7,56.93,58.23,57.55,57.13,57.33,57.4,56.07,56.07,56.07,57.24,58.88,58.92,57.94,57.49,57.7,57.27,55.98,55.67,55.37,56.12,55.99,55.63,54.58,52.43,52.83,52.37,51.09,52.51,54.68,55.86,54.75,55.25,53.88,53.05,53.35,53.31,53.29,55.91,55.38,54.75,54.2,54.2,54.2,55.02,55.27,56.78,56.02,56.37,57.64,58.82,58.89,58.46,59.31,58.1,58,58.52,58.35,56.82,57.95,57.34,57.78,58.72,60.77,60.6,60.33,59.45,59.73,59.04,59.28,60.32,58.81,58.78,59.5,58.51,59.35,59.35,59.35,60.88,60.01,60.01,59.89,59.95,60.22,61.46,61.33,60.06,59.82,58.67,58.73,59.28,58.7,59.56,60.82,62.31,62.52,64.04,64.17,64.08,64.08,65.75,66.88,67.13,66.67,65.95,67.01,68.63,69.07,68.86,68.86,70.19,70.83,71.14,69.67,69.64,68.45,67.47,68.31,68.29,66.98,66.01,65.3,66.72,66.95,66.83,66.96,66.5,66.5,65.9,64.96,65.59,65.11,65.1,65.05,67.29,66.97,65.78,65.79,66.03,66.16,64.6,64.68,64.68,65.12,65.94,66.1,65.19,64.19,64.1,63.85,65.08,66.73,65.59,64.52,64.32,64.42,62.97,63.88,63.27,62.74,61.45,61.39,62.11,61.15,62.38,62.17,61.03,60.03,59.78,60.6,60.69,61.47,61.59,61.79,61.54,61.65,62.94,63.59,63.28,62.73,63.58,63.52,64.13,64.41,63.59,63.81,64.67,63.45,63.36,62.65,62.36,62.36,61.32,61.55,61.11,61.46,62.02,62.21,63.08,63.08,64.41,65.18,65.26,68.58,69.11,72.39,74.56,76.71,76.71,82.14,80.84,83.31,85.09,76.44,75.23,77.84,77.84,77.42,74.34,74.24,73.33,76.32,74.98,75.21,76.38,75.17,75.43,75.5,75.76,74.43,74.2,75,75.26,77.19,75.21,77.09,76.21,75.13,72.8,72.84,71.22,71.3,72.08,72.34,72.43,71.86,70.35,70.09,69.98,71.78,70.73,70.96,71.59,72.24,72.37,71.64,72.89,75.18,74.63,74.05,75.18,73.41,72.86,72.58,73.35,73.05,72.97,73.68,74.6,74.6,74.6,74.62,74.36,74.46,72.42,73.13,72.88,72.01,71.4,71.29,70.46,69.9,71.37,71.62,72.51,72.61,73.91,74.78,73.31,73.18,74.69,75.41,75.4,75.4,75.4,75.4,75.42,78.07,77.28,78.55,79.51,81.17,80.11,82.31,81.74,85.1,85.02,86.57,86.44,85.01,88.52,88.04,86.81,89.81,89.22,85.98,86,85.47,88.15,91.3,91.05,89.12,89.43,88.68,88.26,90.68,91.2,93.74,93.6,91.42,89.3,90.4,88.01,88.4,88.64,87.91,86.99,87.2,87.14,86.01,86.01,74.18,75.9,76.97,78.33,79.69,81.36,81.54,79.46,80.67,80.67,80.67,81.21,82.9,82.29,82.54,82.53,82.41,82.49,82.49,84.07,84.07,84.39,84.19,84.78,84.87,87.43,85.66,87.77,86.92,86.5,86.42,87.73,88.47,87.41,87.68,86.18,86.51,86.25,87.43,86.13,85.38,87.02,87.61,88.71,88.15,89.68,89.55,90.56,89.17,88.41,89.17,88.81,87.78,85.91,87.1,87.82,89.48,90.49,89.92,89.5,88.64,88.64,89.12,88.34,87.94,87.93,88.95,87.81,88.54,88.74,89.2,90.67,90.51,90.43,91.79,92.34,92.7,94.39,94.56,93.47,93.74,93.42,92.32,90.73,89.93,90.84,91.43,91.24,91.74,90.86,90.79,91.08,93.46,93.25,92.33,92.27,91.99,92.06,91.67,92.74,94.46,93.45,92.14,91.08,91.4,93.17,93.03,92.44,91.29,92.51,93.17,94.4,95.28,94.59,95.66,95.86,95.88,98.02,96.59,96.75,95.72,94.89,96.45,96.47,95.02,96.57,97.6,97.6,99.33,98.65,97.79,97.79,97.28,97.34,95.59,94.2,92.74,94.49,94.58,92.05,94.3,95.02,94.21,95,95.65,96.7,95.77,95.77,95.47,93.65,94.57,93.7,93.6,95.56,94.66,96.46,96.64,97.43,98.05,95.99,95.28,93.71,93.47,93.39,91.11,92.74,93.55,93.59,93.61,93.26,93.69,93.79,92.22,93.02,93.95,92.78,91.28,91.47,91.26,92.74,91.09,89.46,90.33,90.31,90.92,91.31,91.05,91.06,91.06,91.06,90.82,91.84,91.05,93.65,93.44,94.42,93.35,92.33,92.42,94.18,94.84,95.15,94.65,94.18,93.3,92.9,93.18,93.1,93.57,93.43,94.43,97.16,97.57,95.17,92.75,92.47,92.42,92.88,92.25,93.65,94.41,94.67,93.72,92.26,92.65,92.65,92.65,92.65,91.52,93.94,92.01,92.28,90.03,90.49,88.88,87.93,86.66,86.33,88.13,87.65,88.97,88.91,88.86,88.57,90.05,90.16,90.25,88.82,87.58,84.86,86.82,87.67,85.7,86.35,85.79,85.54,86.87,86.38,86.38,86.38,86.38,88.63,87.96,88.4,87.86,88.57,89.05,90.96,90.35,90.9,91.35,89.9,89.2,89.64,89.44,88.3,89.94,88.68,88.68,89.62,89.18,89.89,91.11,90.8,90.75,90.73,90.67,90.48,88.77,87.82,88.25,87.9,86.57,87.34,87.34,87.61,86.44,85.44,86.06,86.9,89.51,87.81,86.84,86.17,85.2,85.03,84.97,83.93,85.54,85.55,84.17,83.19,81.47,81.47,80.84,79.26,79.31,77.71,76.21,77.68,77.2,77.2,77.76,78.65,79.8,79.37,82.57,81.69,82.11,82.39,82.77,83.6,84.96,83.11,85.61,85.4,84.28,85.32,84.48,85.45,86.17,88.08,88.3,87.97,88.38,87.58,87.88,86.81,87.14,88.07,87.11,86.27,86.07,85.2,86.21,86.34,86.53,87.31,88.19,86.53,86.26,87.17,86.72,86.72,86.96,86.44,86.31,85.65,87.38,86.1,85.77,85.48,84.52,84.23,84.62,83.81,83.82,83.51,84.02,85.18,85.42,84.51,84.43,83.41,83.93,83.54,83.96,83.96,82.03,82.24,83.03,82.56,81.82,83.22,83.44,83.5,83.59,82.77,83.02,83.02,82.02,81.14,78.54,79.22,79.69,79.33,79.59,79.22,80.31,80.76,81.13,82.3,85.48,84.51,84.37,84.43,83.47,82.29,81.08,81.53,80.74,80.04,78.55,77.16,76.89,76.12,75.43],"KOSPI200":[100,100.46,101.02,101.74,101.75,101.4,102.22,101.69,102.53,101.4,101.4,102.07,101.99,102.84,102.41,102.51,100.87,100.89,100,100.46,100.89,101.59,101.69,101.76,101.31,102.19,101.83,100.63,101.08,101.02,100.79,100.81,99.57,99.59,99.46,100.26,100.52,98.32,100.54,99.24,98.46,98.14,98.58,98.63,98.54,98.26,99.39,99.89,99.25,99.34,99.62,99.6,100.13,100.22,99.59,99.3,100.67,100.95,103.18,102.75,102.67,103.03,103.18,102.96,103.4,103.15,103.41,103.22,103.17,103.02,103.02,103.37,102.27,102.39,102.39,102.39,103.56,103.62,103.17,103.65,103.86,103.86,105.6,106.31,105.51,104.81,105.29,105.18,105.42,104.96,105.19,105.27,105.6,106.52,106.52,106.52,105.58,106.16,105.73,105.88,106.13,105.92,105.43,105.42,105.8,105.86,105.5,105.86,105.91,105.87,106.22,107.16,107.45,107.47,106.48,105.92,106.35,106.35,107.37,106.24,106.49,107.06,107.23,106.97,107.23,108.46,109.44,109.44,110.31,111,110.56,111.78,111.3,111.37,111.18,110.41,110.76,111,110.92,110.52,110.9,110.63,110.56,110.06,109.88,109.17,108.49,108.77,109.92,109.92,109.52,109.57,108.88,109.38,110.29,111.04,112.4,112.94,113.16,113.11,113.11,114.07,114.07,115.18,115.18,118.09,118.09,116.64,118.04,117.45,117.7,118.01,117.88,117.54,117.39,118.39,118.68,118.82,120.2,120.88,120.71,119.95,119.98,119.73,121.23,121.03,121.03,120.38,120.6,121.84,120.6,121.3,121.27,120.78,120.82,121.53,121.81,121.1,121.87,122.18,122.83,122.92,122.41,123.09,122.77,123.02,122.26,122.78,122.82,122.34,122.66,123.49,123.49,124.58,124.98,125.44,125.49,125.59,126.26,126.72,126.81,126.08,125.81,126.22,123.71,123.89,124.85,125.11,122.98,123.44,123.64,123.42,121.89,121.44,119.21,120.08,120.08,120.96,121.69,121.45,121.35,121.82,121.97,122.37,122.56,121.9,121.55,121.94,121.4,121.21,121.21,119.74,119.4,120.89,121.07,122.01,122.25,122.08,123.07,123.53,125.6,125.43,125.42,125.33,125.33,124.6,123.77,123.59,123.6,124.55,124.55,124.55,124.55,124.55,124.55,124.55,127,128.43,129.21,128.91,129.1,129.37,129.33,128.57,129.52,129.74,129.55,129.69,128.77,129.65,130.11,131.36,133.41,132.92,133.43,132.87,132.62,133.03,132.77,132.3,131.66,131.38,130.81,131.67,131.6,131.11,131.34,132.12,131.73,132.1,129.77,130.35,130.22,128.09,127.9,129.47,129.8,127.8,127.43,127.86,128.02,127.62,128.45,127.89,128.47,128.62,128.68,128.68,125.91,126.5,126.5,125.58,126.12,127.89,127.89,128.38,128.83,127.82,129.55,130.46,130.06,129.02,128.25,128.67,128.93,129.96,129.64,129.61,129.77,128.49,130.32,130.32,131.56,132.08,133.13,131.3,131.29,131.28,128.78,127.31,125.24,122.27,122.72,120.04,121.34,122.42,123.81,123.81,123.81,124.68,123.2,123.84,122.94,124.76,124.97,124.77,123.21,123.21,121.43,119.95,122.26,122.53,123.96,125.1,126.29,127.19,126.8,127.1,127.15,126.16,126.72,126.65,127.33,123.03,124.01,124.58,122.79,123.59,123.9,123.66,123.41,121.51,123.28,122.71,123.44,123.63,123.24,123.35,123.99,124.12,123.91,125.48,126.07,125.19,125.19,124.39,123.65,125.26,126.33,127.42,127.42,127.02,126.24,124.74,124.74,124.39,123.82,124.96,125.43,125.12,124.03,124.43,123.77,124.2,124.54,124.54,125.35,125.03,125.25,125.62,124.52,121.79,122.44,123.35,123.99,124.35,124.35,125.1,124.04,124.92,124.77,124.77,122.55,121.58,120.25,118.67,119.73,118.54,119.6,119.47,119.23,119.03,117.46,118.01,115.36,115.52,115.09,114.85,115.43,116.25,116.64,115.95,115.94,117.61,117.11,116.91,116.75,116.53,116.94,116,116.37,116.11,116.94,117.27,117.08,117.14,117.63,115.6,116.41,116.27,117.03,117.04,117.12,115.64,114.15,114.63,114.63,113.51,113.64,113.66,114.96,115.39,115.89,116.39,116.89,117.05,117.37,117.37,118.17,117.15,117.67,116.16,115.89,115.33,115.66,115.17,115.13,115.16,117.08,116.26,116.61,116.82,117.76,118.46,118.46,118.46,118.46,119.16,118.34,118.21,116.78,116.78,114.91,114.71,114.17,114.17,113.36,108.36,110.02,109.16,109.05,110.29,109.27,109.73,110.03,107.33,106.86,105.04,103.45,102.47,103.36,103.97,103.55,107.34,106.36,106.95,106.51,107.16,106.85,106.95,106.21,105.89,106.93,106.98,107.24,106.16,105.65,105.45,104.88,106.25,107.15,107.69,107.97,106.86,108.76,107.62,106.92,105.22,105.65,104.5,104.24,105.73,106.1,104.58,104.88,104.43,105.27,104.28,104.38,104.14,104.14,102.78,102.61,103.17,103.17,101.69,100.72,101.56,103.01,102.25,104.6,104.58,105.2,104.36,106.3,106.81,107.07,107.86,107.9,107.4,107.85,108.93,110.92,110.91,111.45,112.87,112.59,112.55,112.55,112.55,112.55,112.49,110.85,111.09,111.72,112.22,113.68,111.83,112.59,112.2,113.57,113.58,113.71,113.81,113.37,113.72,111.76,111.76,111.26,110.44,110.21,109.82,108.23,108.32,109.37,108.69,108.94,110.22,110.24,110.2,110.24,111.2,111.5,109.26,109.32,109.2,108.33,108.88,110.39,110.94,112.49,112.69,112.9,112.78,112.91,113.39,113.19,113.56,113.96,114.45,114.33,112.56,112.59,112.58,112.81,111.72,111.38,110.79,112.94,112.2,112.2,112.68,111.71,111.71,110.78,110.33,106.72,107.14,105.82,105.77,106.19,104.75,104.1,104.34,104.8,105.01,104.9,104.13,104.12,104.24,102.93,103.94,103.92,105.6,105.41,105.54,105.54,105.65,107.16,107.59,107.41,106.77,106.52,106.36,106.86,108.42,108.7,108.49,108.53,108.41,108.51,109.38,109.28,109.19,108.68,107.26,108.12,108.04,105.76,105.43,105.84,107.03,107.38,107.37,107.92,106.91,106.59,108.12,108.12,108.66,107.6,107.53,107.21,105.44,105.92,104.89,104.65,103.57,101.28,99.8,99.24,99.4,100.36,100.56,99.57,100.37,100.37,99.99,100.46,101.62,101.75,100.93,100.86,99.31,99.83,100.63,100.15,102,102.03,101.7,103.06,104.14,104.57,105.3,105.84,106.66,106.66,106.66,107.12,106.99,107.53,108.27,108.86,108.95,109.47,108.07,108.25,106.85,107.73,108.07,105.76,105.76,105.3,105.41,106.86,106.86,105.86,106.84,107.99,108.04,108.82,108.52,107.44,107.82,109.25,108.78,108.97,109.11,109.39,109.3,108.5,108.62,109.65,111.27,111.99,112.05,111.99,111.5,110.6,111.7,110.77,111.81,113.14,113.09,112.72,111.14,109.59,110.04,111.13,110.99,111.39,110.75,109,109.26,108.77,107.96,107.63,108.91,109.49,109.99,110.38,112.28,114.25,114.11,115.94,115.87,115.9,116.3,116.12,115.35,115.35,115.8,116.25,115.69,115.69,114.34,114.5,113.59,114.69,113.98,115.94,116.98,118.19,118.75,118.04,119.24,119.44,120.34,118.97,120.54,119.06,119.06,119.06,115.3,115.77,113.56,112.05,112.26,114.47,115,118.4,117.44,116.66,117.86,118.75,118.51,119.33,119.23,117.25,117.49,116.82,115.16,110.67,111.94,110.24,109.12,105.55,106.47,106.94,109.53,110.81,108.34,103.62,104.23,101.21,97.52,94.77,91.75,89.35,85,78.48,84.15,79.5,86.77,91.71,90.32,92.07,91.54,93.26,89.14,91.3,91.25,94.83,96.43,95.26,96.72,97.66,95.85,97.45,97.45,97.31,100.43,99.3,98.22,99.19,99.93,98.56,100.36,100.97,101.66,101.66,101.66,98.69,98.69,100.42,100.21,101.06,100.4,99.78,100.76,99.89,99.94,100.59,103.1,103.46,103.86,102.24,103.48,105.27,105.4,105.66,105.67,107.58,108.72,112.59,112.81,114.45,114.51,114.72,114.95,113.66,110.97,105.52,111.29,111.46,111.02,111.59,110.83,111.03,112.91,110.16,111.6,109.49,110.3,110.37,111.79,112.59,114.45,112.93,112.62,113.12,112.26,114.14,114.06,115.1,113.91,114.82,114.52,116.24,115.8,115.14,114.46,115.59,118.19,118.64,118.87,117.88,117.93,119.34,120.76,122.6,123.09,124.75,126.42,127.07,127.33,125.72,125.72,123.2,123.47,118.77,120.57,121.82,123.49,123.73,122.62,122.96,120.95,122.01,122.67,124.61,122.88,123.53,124.99,123.57,124.65,124.62,126.4,127.34,126.93,125.23,125.38,124.4,121.62,121.94,119.12,119.55,120.91,121.86,121.86,121.86,121.86,123.46,123.83,124.98,125.02,125.02,125.68,125.85,124.67,123.62,122.8,123.1,123.94,124.35,123.57,123.97,123.47,122.79,123.33,122.06,118.77,120.49,122.9,123.59,126.61,126.85,128.31,128.43,130.4,129.85,131.15,134.14,133.84,133.88,133.96,134.14,137.23,137.94,137.16,138.67,138.91,136.28,138.78,141.24,142.43,144.78,145.65,143.13,146.29,145.46,146.59,146.32,146.06,146.71,146.5,146.32,146.57,144.3,146.23,149.32,149.32,149.62,150.15,153.31,153.31,157.48,159.9,158.34,161.78,169.42,169.78,168.5,169.49,169.28,165.57,161.66,165.93,166.98,169.44,168.21,172.21,168.05,166.85,163.98,159.32,163.61,165.81,167.45,164.73,166.7,164.99,164.58,165.26,165.26,165.26,168.16,169.04,167.05,164.39,165.77,164.17,163.75,160.34,166.39,161.43,161.43,163.35,165.51,163.1,162.25,160.81,159.8,158.89,161.86,163.88,163.11,164.34,163.04,164.24,162.61,162.5,160.95,160.32,160.88,162.6,162.27,164.06,163.45,165.17,166.87,167.31,167.72,168.04,168.1,167.09,167.06,168.98,169.62,170.39,170.29,170.11,171.15,168.06,168.3,168.46,170.27,170.18,168.35,167.87,166.33,165.54,166.81,166.81,167,168.77,171.56,168.85,166.13,163.85,165.47,164.72,166.62,166.62,166.06,166.22,165.62,167.11,166.79,166.58,167.74,168.51,169.46,169.4,170.86,170.21,170.62,170.47,168.61,169.08,170.43,170.61,170.96,172.08,171.2,171.31,169.91,171.08,171.99,172.64,173.43,173.27,172.31,172.82,171.83,171.7,172.35,173.08,172.08,170.37,168.49,169.84,171.19,170.74,172,171.24,169.29,168.77,167.76,169.88,169.95,168.34,168.64,169,169.14,166.94,168.07,169.33,171.72,171.2,170.63,169.99,168.77,167.27,166.34,163.85,163.85,161.98,162.79,159.48,157.83,159.33,162.44,163.02,161.61,161.56,162.05,165.32,165.37,163.78,165.09,165.55,164.53,163.25,160.39,160.95,161.34,162.39,162.58,161.15,161.85,161.85,161.85,161.85,161.64,161.4,161.84,159.97,157.56,158.04,155.47,155.47,152.8,150.41,152.85,152.57,152.57,149.92,151.26,153.42,154.84,154.38,155.72,155.06,154.84,154.9,155.56,157.16,155.74,155.12,152.98,153.51,155.48,153.38,154.19,153.53,153.42,153.73,152.1,152,153.74,155.3,155.19,153.37,152.58,153.79,157.16,156.12,155.71,154.35,151.64,150.29,146.99,150.88,153.44,154.36,154.71,156.07,156.45,157.97,156.72,156.45,155.72,155.81,156.61,157.11,154.13,155.14,155.98,156.8,157.73,156.98,158,156.23,155.24,155.24,155.24,155.71,153.74,152.1,153.92,152.61,153.18,155.42,154.77,152.58,151.15,150.05,148.94,149.8,148.1,146.22,142.71,142.1,137.27,140.98,140.98,140.98,140.98,142.4,144.27,142.92,143.14,145.18,146.33,145.16,142.94,141.94,144.65,145.53,145.14,145.04,143.15,143.52,139.82,141.16,142.38,142.38,142,144.55,142.44,139.03,137.59,137.59,140.99,139.92,139.65,138.24,140.23,142.35,142.69,141.29,142.43,143.68,143.1,142.58,142.58,143.26,143.54,143.98,143.03,143.72,143.64,142.17,140.09,140.2,140.11,138.75,141.38,140.74,139.35,139.26,140.73,140.79,141.39,139.97,137.43,138.1,136.34,137.9,139.83,139.42,139.14,139.35,139.35,137.44,137.44,135.34,135.25,133.08,136.06,135.45,136.86,137.18,135.17,137.55,137.97,135.5,136.1,135.57,137.06,138.81,139.62,139.62,138.03,138.62,138.62,136.13,136.34,136.5,134.64,129.91,129.26,126.89,126.91,126.05,123.83,124.59,121.32,120.29,122.9,124.52,125.67,123.21,120.98,119.73,119.72,121.7,119.04,121.42,122.14,121.41,120.12,120.74,120.25,121.26,124,123.62,124.45,125.89,124.97,125.37,125.87,125.92,126.66,127.32,127.19,126.66,127.52,128.17,128.97,128.87,129.21,127.73,129.93,130.22,130.22,130.66,129.92,129.48,128.69,127.11,125.5,125.96,127.45,127.56,124.58,125.82,127.18,124.06,123.23,123.05,123.27,121.36,121.73,121.73,121.73,125.45,123.16,122.33,121.57,120.7,121.11,119.98,118.79,117.25,114.11,114.28,111.52,111.31,110.8,110.8,113.52,113.83,114.7,114.37,114.37,112.22,113.06,111.28,113.95,114.04,115.62,114.71,113.66,113.64,114.78,114.83,115.72,117.68,116.2,117.98,119.67,119.67,118.8,119.85,121.24,122.87,124.14,122.53,127.24,126.62,126.93,126.79,124.74,124.88,123.92,122.88,123.7,124.96,124.47,122.95,124.28,126.41,126.81,124.06,123.62,122.14,121.4,121.39,122.72,121.94,121.91,123.35,121.19,121.09,120.81,119.74,119.41,121.09,118.96,119.04,119.8,117,114.64,114.64,114.12,114.04,116.56,117.3,118.75,121.96,121.91,122.23,122.36,123.57,124.46,123.56,122.83,123.58,124.28,124.28,124.28,126.32,128.21,129.16,127.07,124.94,126.49,127.57,128.33,125.56,126.24,128.24,127.95,127.47,126.71,127.39,125.23,127.63,126.33,126.72,126.63,124.42,125.8,124.81,123.63,123.97,123.97,124.55,124.59,126.39,125.94,124.2,123.67,122.34,123.35,120.34,121.73,121.45,122.9,121.88,122.22,123.7,124.35,123.77,123.2,124.59,124.84,125.25,126.82,126.17,126.71,127.42,125.16,127.34,128.53,130.3,130.78,131.17,131.41,131.5,131.34,131.44,131,130.33,129.45,127.78,127.58,128.02,128.56,128.56,129.6,128.59,128.45,128.45,129.52,129.26,128.4,128.1,127.44,127.78,128.11,128.62,129.89,131.62,132.43,132.75,132.51,132.06,132.76,132.76,134.49,133.55,133.14,134.95,135.43,135.43,135.16,134.98,136.57,135.69,136.41,135.73,135.15,135.93,135.13,134.91,133.67,134.34,133.28,134.04,134.02,133.27,132.47,133.09,135.11,134.52,133.52,132.4,130.58,130.29,132.72,133.68,134.34,136.62,136.16,135.23,135.12,134.55,134.84,135.6,135.83,134.12,135.77,135.48,136.11,138.23,135.39,134.5,134.39,133.77,133.09,134.53,134.08,133.49,132.45,132.45,130.46,130.05,129.33,129.5,129.84,129.62,131.46,130.06,130.95,131.44,131.9,131.83,133.22,134.3,134.01,133.05,132.61,132.48,132.94,132.14,132.32,134.36,135.86,134.16,133.43,133.4,131.15,130.75,130.58,128.74,128.66,128.66,128.66,128.66,128.66,125.8,125.46,125.6,125.6,125.67,127.89,129.5,128.29,127.31,128.91,129.49,127.11,125.22,124.25,125.4,124.64,121.19,121.5,121.67,120.33,121.97,124.11,125.33,131.6,128.89,127.59,128.1,127.5,127.32,128.61,131.52,131.65,130.77,131.62,132.54,132.64,132.68,131.53,131.4,132.92,132.56,133.28,131.85,132.38,131.08,131.32,131.01,132.56,133.08,133.8,132.59,134.42,135.47,135.27,135.45,137.88,137.35,137.5,137.5,138,138.8,140.98,140.98,141.99,138.31,137.07,136.74,136.09,135.4,134.16,134.01,133.19,133.6,131.82,128.43,128.83,131.13,130.99,131.91,131.24,131.45,131.62,133.04,132.9,132.41,134.84,139.18,137.5,136.97,138.72,139.13,139.13,139.13,140.74,138.89,138.31,140.01,142.12,140.56,140.21,140.85,141.21,139.99,138.92,140.51,140.03,140.03,142.2,140.82,140.29,140.52,142.44,141.12,142.21,142.97,144.4,141.53,142.29,140.72,143.08,147.15,146.75,146,147.52,147.32,146.98,147.53,147.39,148.21,145.6,147.92,146.33,146.7,145.82,145.82,145.99,144.63,143.86,140.46,138.93,141.4,138.85,140.55,140.19,143.19,140.4,142.17,143.54,143.79,143.79,143.47,143.18,143.18,146.81,147.32,145.25,146.13,146.1,146.12,146.12,147.52,145.94,147.16,146.32,146.26,146.35,144.17,146.17,146.23,143.72,141.26,141.07,143.93,142.76,144.31,144.31,146.26,144.71,144.81,146.15,147.58,148.07,147.23,148.75,150.83,151.53,149.99,149.01,149.59,150.83,150.54,151.23,151.36,150.12,150.92,153.01,155.74,155.35,155.87,155.79,156.94,154.49,155.1,155.68,154.2,153.19,151.18,149.58,150.3,149.12,146.21,147.36,149.15,147.63,149.84,149.86,143.81,130.69,134.58,137.47,136.53,138.43,140.04,140.6,141.92,141.92,145.36,143.95,145.31,145.01,145.36,144.89,144.26,143.57,143.85,141.81,142.38,142.59,141.3,136.52,136.23,134.83,133.97,133.3,132.18,135.41,135.35,135.35,135.35,135.35,135.19,135.73,136.17,137.68,135.69,140.37,139.38,135.77,135.77,134.18,134.18,134.58,136.79,135.56,135.56,135.95,136.04,137.73,138.25,136.75,136.94,136.03,136.5,134.72,136.36,135.03,135.22,136.76,137.16,135.86,133.63,132.91,135.31,134.47,134.14,134.24,133.78,131.78,128.9,125.56,125.11,126.23,129.34,129.21,129.57,129.76,130.89,132.57,132.16,130.87,130.53,128.17,128.12,130.52,128.61,127.54,126.83,123.55,126.33,127.54,129.58,130.15,129.8,128.09,129.85,126.96,125.36,127.19,127.35,127.35,126.59,125.64,125.16,125.16,125.14,127.59,130.56,130.31,131.91,132.08,131.75,130.08,130.25,130.34,132.21,131.96,131.51,131.71,133.41,131.73,132.61,132.61,132.61,132.61,132.61,131.28,127.81,129.45,130.93,132.53,131.49,131.73,132.58,132.8,134.31,134.98,135.91,136.98,139.62,138.68,138.59,137.79,136.86,137.56,136.44,131.64,131.64,131.54,132.75,134.02,133.27,133.42,131.91,134.25,134.45,134.21,137.12,136.98,138.17,139.21,139.87,139.11,138.26,139.8,137.94,135.06,130.9,133.19,132.42,131.11,129.43,121.92,122.09,119.93,128.02,126.93,128.12,129.22,127.41,128.5,129.31,129.69,129.41,131.51,131.42,132.66,132.75,133.52,133.4,133.4,133.42,133.42,133.42,134.41,134.47,134.48,136.68,136.72,138.54,137.5,138.01,136.48,136.66,137.59,135.79,135.97,138.66,138.34,140.34,142.98,141.62,141.65,141.65,145.67,148.28,148.28,150.83,151.53,153.5,153.83,152.52,155.22,155.63,157.07,157.24,159.62,159.22,164.52,165.21,163.69,162.53,163.27,163.93,163.21,165.77,162.54,162.65,165.88,166.2,168.72,168.58,170.32,171.22,169.79,169.98,169.77,171.13,168.57,169.35,169.35,169.65,170.67,171.64,173.2,172.72,165.68,167.29,169.83,169.61,171.44,170.7,170.63,169.98,172.06,171.93,171.93,169.02,167.83,166.84,167.14,168.75,170.87,169.11,169.46,170.05,169.39,166.71,168.61,169.48,170.25,170.46,171.25,173.78,177.23,178.79,182.23,182.98,186.21,183.91,187.19,186.45,188.36,189.63,189.18,189.28,184.31,187.15,186.68,188.78,194.31,194.31,194.31,194.31,194.31,194.31,199.65,197.64,195.68,201.06,206.53,206.94,210.8,210.8,213.68,211.23,216.6,222.77,220.34,225.07,226.52,228.2,235.9,229.17,222.66,223.83,219.74,226.56,228.96,231.06,231.82,221.88,227.09,219.14,217.64,222.19,212.8,212.98,214.48,220.29,221.86,218.17,218.15,222.79,224.78,224.37,228.73,232.02,230.68,230.58,228.47,231.53,226.24,221.13,225.5,222.76,223.84,229.48,230.24,230.07,230.07,232.38,238.53,238.64,238.64,245.8,255.48,259.7,261.68,261.56,263.16,264.98,268.07,270.06,274.24,277.49,281.16,279.01,281.55,284.45,286.41,283.56,293.44,298.79,301.5,302.61,285.69,306.99,311.26,298.09,294.61,307.54,307.47,310.62,321.46,320.79,320.79,320.79,320.79,330.89,338.51,340.84,349.26,355.94,371.76,367.56,367.56,338.44,298.03,327.34,326.4,305.32,324.11,328.46,325.88,320.14,325.61,331.15,349.93,339.61,339.66,316.96,325.93,330.29,318.55,317.09,307.3,293.22,320.5,305.06,314.39,319.71,323.36,347.66,340.94,346.07,342.92,353.25,360.97,369.34,366.8,368.51,378.95,379.84,384.21,382.73,391.97,393.43,396.4,390.72,390.72,413.37,413.37,444.86,452.83,453.34,477.08,466.04,480.51,489.57,457.76,461.27,445.96,443.24,482.5,482.82,482.82,496.41,511.5,509.03,528.82,551.3,554.18,554.18,543.28,510.78,467.27,509.35,483.25,484.99,508.53,535.68,548.08,558.02,574.66,574.76,581.74,520.5,539.37,572.66,538.14,532.64,539.81,525.88,480.3,511.68,509.25,482.64,456.18,460.65,471.27,424.83,430.13,458.35,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64],"Nikkei225":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.87,99.6,99.6,100.72,100.24,99.42,99.89,100.63,102.09,103.35,104.21,104.73,104.75,104.86,105.55,105.5,106.06,105.78,105.69,105.69,105.52,105.56,105.55,104.16,103.99,103.99,103.99,106.6,106.2,105.84,105.84,105.01,105.35,104.1,104.93,103.88,102.35,102.79,103.76,104.12,102.77,102.21,103.68,105.56,105.91,105.37,103.59,104.17,102.9,102.92,103.24,102.88,103.41,102.86,105.43,105.86,104.67,105.75,105.26,104.64,104.73,105.44,105.43,105.39,104.91,103.95,104.01,105.51,106.44,105.92,105.43,105.24,104.75,105.1,106.66,106.81,106.68,106.51,106.58,106.2,106.2,105.85,103.59,103.83,104.79,103.29,104.47,104.55,103.71,102.87,103.28,102.33,102.61,101.17,101.54,102.27,101.99,100.93,100.25,99.75,99.86,100.2,100.28,100.27,101.3,102.69,103.8,104.94,104.74,104.44,105.06,105.79,105.79,105.79,105.79,108.24,107.95,108.26,108.6,108.18,108.1,108.37,107.8,106.38,106.58,107.06,106.7,107.41,107.79,107.1,107.08,107.05,106.91,108.05,109.77,109.74,108.7,108.72,108.31,108.88,108.31,108.26,108.17,107.89,108.5,109.18,110.06,109.56,109.41,109.53,109.64,110.03,109.52,110.01,108.99,109.11,108.98,109.25,108.77,108.42,109.25,109.87,109.34,109.35,109.45,109.45,108.81,108.92,109.59,109.35,108.67,108.56,109.08,109.24,108.59,108.4,108.73,109.24,108.97,108.55,109.11,108.78,107.39,107.34,107.34,106.29,107.46,107.33,107.19,105.93,105.51,105.45,105.73,105.29,105.83,105.81,105.34,106.12,106.88,107.13,106.13,105.47,105.31,105.52,104.86,106.34,107.59,108.08,107.76,108.31,108.31,110.44,110.5,110.7,110.42,110.97,110.6,110.26,110.78,110.74,110.99,112.15,112.22,112.23,112.56,112.56,113.29,113.6,114,115.09,115.64,116.08,116.22,116.69,116.74,118.04,118.63,118.1,118.27,119.73,119.75,119.75,121.97,122.62,122.62,122.67,124.79,124.66,124.41,123.39,121.76,121.75,119.84,121.6,121.85,121.11,121.95,122.53,122.53,122.68,122.39,122.33,122.94,123.63,124.14,123.53,123.07,120.65,122.4,124.1,124.79,124.4,123.81,123.47,122.7,124.59,124.41,124.54,124.4,124.6,124.8,124.54,124.64,123.95,123.85,123.85,123.85,127.88,129.01,129.01,129.75,129.42,128.99,128.68,129.02,130.31,129.85,129.28,129.52,129.57,131.24,130.25,128.77,128.57,128.55,126.72,125.66,127.77,126.62,123.4,117.57,117.76,119.09,116.33,116.33,115.58,115.09,116.78,118.17,120.5,119.28,119.53,118.25,119.1,120.52,121.81,120.06,118.19,115.24,114.48,116.52,115.62,116.25,116.8,118.73,119.51,118.48,118.62,117.93,116.86,116.32,116.32,117.47,112.17,112.97,115.97,114.42,115.11,116.72,116.36,115.84,115.99,117.76,117.33,117.94,118.57,117.99,117.84,118.48,118.79,118.86,120.55,120.73,120.57,120.17,121.2,120.86,121.43,122.23,122.23,122.45,122.26,122.26,122.26,122.23,122.45,121.91,122.39,123.81,124.4,124.14,123.59,124.25,124.75,125.14,124.91,123.44,122.06,122.14,122.3,121.64,119.79,120.79,120.62,122.28,122.62,123.09,124.17,123.47,124.06,124.47,124.94,123.71,124.32,123.39,121.2,122.71,123.46,122.5,121.53,121.55,121.17,121.16,121.34,118.66,118.52,118.15,117.22,118.53,119.97,120.76,119.32,120.71,122.94,122.94,123.48,124.01,123.85,123.48,121.85,122.46,123.03,122.88,123.56,122.65,122.7,123.75,122.48,122.54,122.45,123.29,123.19,122.94,121.31,118.91,121.62,120.8,120.73,121.16,120.77,120.88,121.66,121.92,122.96,124.04,124.11,124.3,124.42,124.39,123.54,123.48,122.85,122.34,121.36,121.72,123.3,122.98,124.16,125.64,125.64,127.42,128.79,128.8,129.86,129.86,130.24,130.75,129.46,131.22,131.91,132.04,131.17,130.44,129.39,129.39,127.68,127.88,122.9,123.47,121.16,122.68,124.26,123.27,122.58,123.03,119.75,120.18,115.71,115.25,115.06,116.73,119.25,117.99,121.01,119.14,120.49,120.15,122.34,121.05,121.16,118.66,118.85,118.62,117.95,118.71,117.42,117.01,117.76,117.76,118.66,119.43,120.65,121.12,121.6,122.81,119.88,119.25,116.98,117.94,115.44,115.05,117.53,118.69,116.29,117,114.88,114.18,110.94,109.71,109.71,104.21,105.15,109.23,108.89,108.89,108.89,108.89,106.42,109.02,109.92,111.13,109.7,110.76,110.76,111.83,111.22,111,112.43,112.72,112.2,112.04,111.93,113.02,112.34,112.42,111.83,113.01,113.1,113.61,113.4,113.56,112.89,110.62,110.62,113.51,115.03,115.01,113.71,115.78,115.89,116.59,116.77,116.56,117.12,116.69,117.27,116.34,117.53,118.72,118.2,117.49,116.73,114.39,114.93,116.99,115.83,115.81,116.7,117.43,117.33,117.56,117.56,117.66,114.12,116.58,116.31,114.43,115.37,117.02,117,118.13,118.19,118.64,118.39,118.61,117.99,118.12,118.98,120.61,120.89,121.2,120.18,120.78,120.87,121.1,120.78,121.36,121.09,121.09,121.09,121.09,121.09,121.09,121.09,119.27,117.53,116.43,116.12,115.29,114.61,115.27,114.59,115.61,115.89,115.73,115.79,115.07,114.88,115.24,115.66,114.27,113.93,112.08,111.04,111.03,113.03,113.02,113.62,114.98,115.36,114.95,114.42,114.88,114.92,114.1,116.06,116.77,115.65,115.8,115.3,114.72,116.09,115.75,118.22,118.35,117.72,118.07,118.31,117.15,117.32,117.15,117.75,117.98,117.98,117.16,116.8,114.5,116.79,116.51,117.62,118.11,118.36,117.83,117.6,118.11,117.08,117.19,114.72,112.73,111.99,111.62,112.03,112.53,112.53,111.28,112.37,111.01,111.09,111.87,112.49,112.17,112.22,112.67,110.23,111.29,111.41,111.31,112.64,112.18,112.21,112.34,114.71,115.33,115.98,116.38,117.5,118.38,119.62,119.62,119.69,119.47,119.93,120.12,120.12,120.23,119.8,119.95,119.03,118.36,119.06,118.48,116.11,116.48,116.29,117.44,116.73,117.25,118.59,118.59,120.81,122.26,122.15,122.37,122.67,122.67,123.09,123.77,124.04,124.41,124.99,124.27,124.73,124.32,124.32,126.5,126.78,126.92,127.26,126.93,127.96,126.87,125.9,126.78,127.4,126.72,125.94,125.34,125.74,126.72,127.16,127.51,127.35,126.73,128.01,127.19,125.86,126.76,127.06,127.47,127.36,127.26,127.44,130.69,130.31,130.93,130.21,129.83,129.57,129.59,129.65,129.39,130.16,129.69,128.7,128.7,128.7,128.7,126.24,128.26,126.24,129.15,129.76,129.76,130.7,130.11,130.2,130.79,131.02,129.83,130.74,129.46,129.63,127,126.3,127.19,125.01,126.24,124.98,125.59,126.87,129.88,129.63,128.86,128.86,129.81,129.63,128.87,127.97,126.18,127.31,127.73,127.23,127.23,122.98,122.01,119.41,115.02,116.12,114.7,114.79,116.04,112.89,107.17,108.08,105.63,100.97,94.83,92.5,92.55,91,90.05,90.05,91.88,98.43,106.34,101.54,105.48,103.83,102.91,98.28,96.94,96.95,101.06,103.1,105.29,105.25,106.08,103.6,106.84,106.36,104.95,108.25,107.01,104.89,104.12,105.7,104.79,107.63,107.56,107.56,109.86,106.74,106.74,106.74,106.74,107.04,109.78,110.93,110.8,110.26,108.34,109.01,109.53,111.16,112.04,111.81,110.92,112.84,115.72,116.53,119.23,119.02,120.03,121.46,123.03,123.47,124.39,126.1,125.62,125.81,122.26,121.35,117.14,122.85,122.17,121.62,122.29,122.07,122.67,122.59,121.1,122.47,119.66,121.25,120.35,120.48,121.35,123.57,123.03,122.07,122.57,121.27,123.96,122.88,124.83,123.88,123.48,123.59,124.5,123.78,123.78,123.78,123.58,123.26,121.85,121.53,118.11,120.75,122.81,122.49,121.96,121.48,121.48,123.77,124.28,126.49,126.7,125.65,125.41,125.73,124.48,124.69,125.05,126.74,126.71,126.26,124.49,125.89,125.88,126.47,127.66,126.25,125.62,126.62,125.3,126.41,127.34,128.17,127.6,127.71,126.87,127.09,127.09,127.09,127.01,125.61,126.24,127.91,128.06,126.13,126.13,125.29,126.83,127.49,127.43,128.65,128.5,128.17,128.4,128.54,127.89,127.36,128.78,128.21,128.61,127.71,127.94,127.82,127.77,127.4,126.93,125,126.74,126.74,128.91,131.14,132.34,135.14,135.49,137.91,138.84,138.11,140.94,141.53,139.97,139.46,138.88,138.88,142.35,143.06,144.37,144.96,143.81,145.73,145.81,145.85,145.54,144.43,143.99,145.9,145.56,145,145.43,145.19,145.57,145.84,145.6,145.34,143.82,144.3,145.08,145.02,146.09,149.98,149.31,149.31,148.29,147.75,147.19,149.56,153.09,153.09,153.22,154.81,156.13,155.15,153.65,155.78,155.18,156.45,155.76,156.8,155.3,155.79,153.4,150.5,152.82,154.3,155.85,154.19,156.57,159.88,160.52,160.83,160.83,160.6,163.67,165.75,164.8,164.49,163.31,164.06,164.06,161.42,164.13,157.58,161.38,159.99,160.81,157.39,157.03,156.37,157.92,157.97,158.92,161.67,161.94,162.78,162.74,164.39,162.08,158.72,157.75,154.54,156.3,158.73,159.86,160.12,158.74,159.89,162.42,163.7,161.56,161.75,161.63,161.95,160.7,161.86,161.15,161.27,161.49,161.5,158.32,155.1,158.79,157.88,158.46,157.73,158.06,158.06,156.75,156.75,156.75,156.75,159.57,159.72,160.59,155.64,153.13,149.33,152.79,151.38,154.54,152.57,152.86,154.06,154.31,155.34,155.82,155.32,158.58,157.01,156.76,157.48,158.09,157.45,157.87,157.57,157.01,157.54,157.49,158.65,160.17,159.35,157.87,157.57,152.39,157.14,157.09,157.09,158.13,158.03,156.75,156.64,156.18,156.59,155.58,155.83,154.33,152.97,152.01,155.43,156.24,155.64,153.85,152.35,150.44,149,149.87,149.87,149.87,151.42,152.17,150.05,151.15,148.43,151.14,150.38,150.07,150.85,151.35,151.35,151.72,152.71,152.41,152.21,149.74,149.2,150.08,148.42,146.96,149.58,150.87,150.83,150.93,150.38,151.18,152.82,154.78,155.29,158.47,161.36,162.75,164.2,163.25,165.29,165.64,166.86,165.99,164.97,165.93,165.93,162.34,161.25,161.25,164.56,164.52,164.21,160.73,160.23,156.52,154.75,151.36,149.77,150.58,152.6,155.04,153.58,153.09,155.33,158.14,157.91,158.94,159.16,156.18,156.71,155.6,158.35,158.3,156.79,157.19,161.29,160.6,160.6,162.09,161.1,160.53,159.32,158.35,159.28,161.09,162,162.17,161.51,161.03,161.83,161.98,161.98,159.42,160.49,156.42,153.87,151.36,151.98,150.99,152.49,151.93,154.81,157.01,156.28,154.71,155.81,154.68,154.83,158.13,155.3,151.99,155.15,155.39,156.67,156.59,156.01,158.15,157.26,156.64,156.64,156.64,159.41,159.58,154.98,154.93,154.93,153.54,156.49,154.99,153.01,154.14,153.73,149.43,151.09,149.73,150.09,147.6,146.95,142.38,145.35,146.9,147.32,149.79,148.2,149.28,148.24,148.44,150.04,150.68,150.68,147.32,146.16,149.39,148.16,147.55,146.4,143.89,143.89,141.29,144.04,144.31,146.04,143.59,144.59,141.37,137.21,134.87,134.47,139.76,136.89,137.68,137.89,140.15,145,145.95,145.95,148.11,152.55,152.93,153.14,152.02,153.7,152.48,151.36,150.51,150.9,151.18,148.79,146.28,146.81,145.92,143.27,146.04,147.82,147.4,145.8,146.81,148.07,149.9,147.46,144.66,145.26,143.55,146.06,146.06,145.9,145.9,145.9,145.9,146.91,143.19,142.36,142.61,140.08,143.78,144.42,145.04,146.41,143.64,145.47,146.9,145.52,145.14,144.74,145.7,148.9,148.41,149.38,149.14,151.03,151.87,152.02,153.6,153.67,151.37,146.82,144.88,143.22,143.79,141.25,140.2,142.79,142.26,142.38,144.13,146.19,147.16,145.83,143.59,141.1,142.29,143.75,142.03,144.12,144.26,145.87,143.28,144.05,144.95,145.74,145.74,146.68,150.59,151.26,151.87,150.69,150.45,150.78,151.33,151.25,152.29,150.12,150.93,151.96,153.29,153.69,152.33,151.35,151.35,155.31,157.07,157.06,158.98,157.45,157.39,156.65,154.79,154.03,154.94,155.82,151.67,153.39,152.83,150.49,150.43,150.26,150.3,149.23,152.68,153.5,155.28,155.67,151.34,151.65,149.98,149.98,150.63,148.59,147.73,147.73,143.8,144.56,142.4,143.74,141.11,142.62,146.85,147.54,148.58,147.52,147.52,143.63,143.61,142.74,147.38,145.67,147.74,148.29,146.93,146.29,146.75,148.25,149.24,148.77,147.46,150.09,150.58,150.5,150.5,147.98,149.76,151.63,150.79,149.32,153.76,152.13,152.28,152.48,151.95,151.78,152.03,152.96,152.96,154.41,153.87,153.22,152.48,152.16,153.56,151.12,151.35,151.71,150.62,150.01,151.79,151.47,152.08,153.18,152.61,149.76,148.18,144.54,143.56,144.21,142.73,143.66,143.89,143.3,141.96,141.96,141.96,141.96,139.91,140.47,141.31,141.31,142.4,143.88,143.9,142.1,140.48,142.2,145.75,143.65,144.46,146.38,148.52,149.04,148.86,148.97,149.25,148.67,148.78,149.08,149.66,150.66,150.62,150.19,150.07,150.54,149.21,150.17,149.62,150.68,149.68,149.78,149.46,147.46,147.46,149.36,149.2,149.31,149.7,149.6,151.93,153.62,154.01,154.75,155.72,153.11,151.42,148.1,148.14,146.95,148.7,146.59,146.59,149.43,149.17,148.98,149.48,149.71,151.7,151.15,152.56,153.35,153.89,151.31,149.46,149.71,150.34,151.91,152.78,153.18,155.01,155.13,155.91,155.63,155.91,155.4,155.56,155.7,154.6,154.82,156.99,158.44,158.63,158.63,158.63,158.63,157.5,159.09,158.43,158.46,159.88,161.18,162.36,163.72,166.33,167.61,169.12,168.42,166.92,167.57,168.2,169.92,170.44,168.04,169.46,171.5,175.27,176.85,173.62,172.14,175.53,176.45,179.63,182.26,182.17,183.37,181.55,181.65,182.66,180.97,178.34,177.89,177.02,180.59,180.8,180.56,183.63,181.83,181.37,178.3,176.2,175.12,175.2,173.79,176.37,176.22,176.22,176.78,178.97,176.76,175.75,177.9,177.8,177.73,178.94,178.22,180.47,182.12,177.94,174.96,175.14,175.48,176.14,175.2,176.67,176.67,174.42,175.39,172.82,172.06,171.1,171.73,173.31,174.15,175.65,172.05,175.02,175.33,175.9,177.46,177.96,179.2,179.73,180.84,179.48,177.39,176.64,178.31,177.93,180.45,182.43,182.43,180.85,179.66,177.2,176.28,177.78,175.8,176.11,173.4,173.32,172.78,169.94,166.08,169.06,168.62,168.62,172.71,173.75,176.78,175.81,172.24,174.31,174.32,170.99,170.06,168.65,168.99,170.12,166.48,168.61,167,167.88,171.92,173.82,173.82,177.95,175.57,175,177.61,177.18,177.27,177.88,182.36,181.84,182.71,181.64,181.46,181.99,181.99,182.93,181.97,181.75,181.28,182.18,181.88,180.79,178.31,181.96,178.76,175.77,178.4,178.68,179.13,177.82,179.37,178.22,180.72,183.21,180.3,180.45,180.91,181.19,183.24,182.47,182.06,182.06,182.06,181.1,181.58,181.58,183.68,187.37,190.68,193.55,195.32,193.78,193.01,192.95,195.65,198.83,198.67,197.08,197.14,194.5,196,196.21,197.41,195.91,196.71,197.78,196.73,196.5,200.55,200.73,200.73,206.54,205.12,207.59,209.38,209.29,208.71,208.16,212.71,212.71,213.44,213.48,213.3,213.08,217.13,218.21,218.14,218.11,215.43,215.92,211.2,211.07,210.52,211.13,210.58,216.2,217.63,217.63,222.05,222.45,219.87,219.78,221.76,218.53,219.62,216.54,216.74,214.63,216.38,212.13,214.06,216.38,215.34,214.58,215.02,213.44,209.3,206.52,207.17,201.66,203.68,204.3,209.24,204.71,206.38,206.38,208.94,208.22,208.02,208.02,208.02,211.28,207.83,207.14,207.98,207.71,208.67,208.83,211.74,211.02,212.55,211.88,210.09,212.73,210.25,211.63,211.39,209.76,207.03,209.39,211.75,211.29,209.4,210.56,210.45,212.38,212.91,211.5,210.65,211.16,207.29,209.36,209.84,210.18,209.98,211.11,213.12,215.8,214.03,215.35,215.61,218.02,220.77,222.58,222.58,221.86,226.21,227.58,229.71,224.09,224.09,224.55,223.59,218.3,217.96,215.43,215.41,213.02,206.02,204.92,209.28,209.59,212.73,207.42,195.36,171.14,188.65,190.9,189.49,190.55,190.55,197.12,198.26,199.81,207.07,203.41,207.08,206.47,207.88,208.71,207.33,208.3,208.76,208.71,210.26,210.55,210.47,201.55,199.43,197.98,197.03,196.72,193.78,200.39,199.02,199.02,196.96,197.92,202.14,205.23,205.23,206.41,206.03,211.77,216.69,206.3,210.28,205.69,209.74,210.19,213.98,211.83,213.69,214.25,215.47,215.47,217.13,213.15,211.69,212.07,211.93,208.97,207.3,207.51,206.26,210.03,211.65,213.68,212.62,207.02,207.02,209.32,214.79,214.25,214.9,215.07,214.22,210.66,209.65,210.23,207.93,208.99,208.65,206.88,208.28,210.98,209.14,207.47,208.63,207.86,209.52,213.53,213.68,214.33,212.67,213.05,214.17,214.2,216.79,214.73,214.66,214.16,212.62,211.16,210.55,213.05,212.37,212.88,215.26,219.14,217.04,217.04,217.04,217.04,213.84,218.07,217.51,215.46,213.21,213.21,209.31,209.15,209.85,209.19,211.64,212.33,215.69,217.39,217.24,215.25,212.26,214.43,214.97,215.29,209.56,211.08,211.26,212.54,211.01,211.09,211.09,211.98,214.68,212.99,213.12,213.64,213.07,210.42,210.96,210.96,208.03,207.51,208.13,202.14,205.57,203.09,203.57,205.13,200.68,201.45,200.17,200.31,200.15,201.58,203.45,205.89,205.38,205.38,204.98,204.6,205.54,206.88,205.64,201.95,193.77,193.81,194.36,188.98,183.78,169.39,179.6,172.53,188.28,182.72,184.88,186.43,184.54,187.03,188.94,186.49,186.17,189.7,190.62,194.25,194.98,194.98,196.1,198.31,200.37,200.37,200.37,200.09,200.9,204.03,204.8,207.73,207.43,205.4,205.39,204.01,204.17,202.92,201.22,202.17,204.18,205.23,205.22,209.09,206.54,203.85,203.72,205.36,204.31,205.33,207.21,207.88,209.02,207.67,205.83,208.43,209.65,211.55,209.39,208.93,208.66,211.03,211.86,215.35,218.43,220.26,217.54,216.32,216.45,216.58,215.37,215.92,216.64,215.69,215.27,214.67,215.86,215.78,217.08,216.63,216.63,216.39,223.99,227.55,225.54,223.04,221.28,221.18,223.43,221.96,219.19,220.6,221.94,223.38,227.52,227.52,232.4,235.43,232.03,235.99,237.82,236.91,233.33,231.81,231.94,232.89,230.64,231.32,233,232.4,229.52,230.18,228.16,231.65,234.04,237.44,236.43,238.49,241.4,243.55,243.55,244.28,243.67,246.47,245.06,247.5,247.5,248.24,248.92,246.75,245.05,244.45,242.37,244.47,249,260.84,260.87,259.69,264.29,261.62,261.62,254.87,259.36,262.65,258.86,267.59,268.3,268.25,264.63,268.21,274.8,273.21,279.13,279.23,285.14,285.14,280.16,273.17,276.82,273.52,276.98,276.6,277.8,278.99,274.07,273.78,264.96,264.06,271.06,264.54,264.54,264.72,269.62,272.93,273.4,268.23,268.23,271.28,277.61,274.69,275.18,275.58,275.3,272.83,276.57,272.93,268.66,269.36,266.58,269.34,274.21,274.26,273.89,274.24,276.1,274.88,273.86,273.86,273.86,281.99,285.72,282.69,278.1,282.57,282.57,291.33,295.63,294.38,293.43,291.51,288.29,287.11,292.09,292.95,287.71,290.15,290.29,290.38,290.09,286.46,297.7,295.37,292.79,295.16,306.64,313.64,313.64,313.58,309.78,309.05,307.74,310.88,312.64,309.15,309.15,311.85,318.71,319.64,320.17,315.85,306.18,295.11,300.73,302.6,286.86,295.13,299.36,296.24,292.8,292.42,292.15,300.52,290.36,290.36,280.26,284.27,292.42,291.62,290.37,282.28,277.8,292.36,285.42,289.01,290.59,290.67,306.34,304.09,309.69,307.39,314.87,316.27,323.8,318.13,320.03,322.88,324.17,321.74,324.88,329.34,325.97,325.97,322.53,323.77,323.77,323.77,323.77,341.84,341.18,339.57,341.34,344.22,340.86,334.09,330.86,329.42,325.36,335.58,344.59,354.48,353.6,353.62,351.95,360.85,364.15,363.06,372.13,367.06,362.26,348.32,355.89,349.16,349.36,359.17,377.11,377.58,380.29,386.55,387.62,393.63,379.67,376.34,393.7,377.35,377.93,381.16,383.41,373.93,379.43,379.4,371.34,363.52,368.55,372.98,365.82,368.55,374.03,363.61,348.95,348.95,360.33,359.69,361.36,351.51,353.25,339.29,334.22,336.58,350.15,346.85,347.95,360.7,357.34,356.92,364.34,364.34,367.35,371.62,373.83,376.58,367.01,355.4,360.24,359.15,356.49,358.28,360.49,359.78,361.27,360.76,360.23,349.95,349.35,353.74,361.24,355.09,354.4,355.1,348.24,345.42,345.37,347.76,348.92,353.72,353.72,353.72,353.72,356.42,361.04,358.4,356.24,363.16,375.15,371.63,380.53,384.54,381.02,375.61,375.55,375.55,368.73,368.55,350.5,355.39,353.17,348.59,351.56,342.24,341.07,338.33,344.2,347.93,351.77,344.32,343.19,343.19,338.33,332.28,312.46,319.76,328.92,333.21,330.88,332.63,324.58,320.22,321.11,323.4,307.03,307.03,319.05,310.16],"S&P500":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.47,99.61,99.34,98.99,99.03,99.61,99.95,101.27,101.48,102.09,101.97,102.64,101.8,102.2,102.02,102.22,102.59,102.34,102.15,102.28,102.28,102.51,101.65,101.62,101.15,101.15,102.01,102.59,102.51,102.87,102.51,102.51,102.8,102.58,102.77,102.77,102.46,102.64,102.27,102.62,102.34,103.01,103.84,103.76,103.67,103.05,102.96,102.99,103.05,103.8,103.58,103.6,103.67,104.27,104.64,105.19,105.61,106.14,106.05,106.23,106.23,106.87,106.75,106.8,106.96,107.07,106.79,108.25,107.62,107.67,107.32,107,106.76,106.85,107.19,107.23,106.87,107.77,107.59,107.45,107.23,105.9,106.1,105.99,105.9,105.79,106.56,106.68,106.99,106.75,106.57,106.63,106.31,106.51,106.42,106.5,106.34,105.94,105.22,105.22,106.13,105.82,105.64,106.44,106.11,107.26,107.92,107.87,107.93,107.72,107.91,108.03,107.9,107.96,108.4,108.4,108.29,108.42,108.18,108.02,108.54,108.46,106.49,106.88,107.61,108.16,108.36,108.63,109.11,109.15,109.15,109.02,108.97,109.79,110.2,110.06,109.76,109.93,109.96,109.87,109.76,110.26,110.15,109.9,109.93,110.85,110.11,110.04,109.99,110.16,110.2,109.31,110.27,109.32,109.49,109.74,109.74,109.9,108.87,109.57,109.67,109.59,110.39,110.59,111.11,111.1,111.17,111.77,111.75,111.71,111.59,111.92,111.95,111.84,111.69,111.61,111.88,111.94,111.69,111.9,112.09,111.82,111.78,110.16,110.3,111.41,111.35,111.51,109.79,109.59,109.71,110.81,110.42,110.19,110.38,110.43,110.52,111.03,111.67,111.89,111.89,111.05,111.39,111.37,111.21,112.41,112.79,112.88,112.75,112.96,113.13,113.25,113.32,112.98,113.05,112.8,112.81,113.27,113.41,113.83,114.27,114.51,114.66,115.3,115.18,114.97,115.24,115.45,115.25,115.35,115.56,115.63,115.72,115.76,116.35,115.89,116.07,115.53,115.68,116.61,116.24,116.35,116.54,116.56,116.92,117.07,117.05,117.22,116.77,116.67,116.78,116.51,115.87,116.82,116.51,116.66,117.43,117.34,117.34,117.58,117.53,118.69,118.65,119.62,119.38,119.25,118.8,118.79,119.14,119.8,120.18,120.37,120.31,119.82,120.89,121.54,121.15,121.05,121.29,121.23,121.23,121.11,121.2,121.42,120.79,121.8,122.58,123.07,123.94,124.14,124.3,124.17,125.04,125.88,125.88,125.44,126.62,126.42,126.97,127.99,128.27,128.2,128.28,129.8,128.92,127.52,127.58,127.5,124.79,119.68,121.77,121.16,116.61,118.35,120,120.31,121.93,123.4,123.44,123.44,122.72,122.05,122.17,124.12,125.58,123.99,122.61,120.98,121.59,122.93,123.26,123.2,123.75,125.9,125.74,124.94,124.22,124.13,124.34,122.57,122.75,122.53,119.44,116.94,120.11,118.04,117.69,119.32,119.32,116.65,118.12,119.49,120.31,117.67,118.06,120.04,119.38,120.36,120.01,120.99,122.28,122.38,121.68,120.64,120.64,119.03,119.25,120.49,120.63,119.64,119.94,119.08,118.81,120.33,120.75,120.72,121.89,123.03,123.24,123.35,122.5,123,122.9,122.57,123.48,123.09,123.49,123.24,122.95,122.95,121.53,123.07,122.23,123.55,124.1,124.19,125.26,125.17,125.56,125.69,125.91,125.4,125.71,125.59,125.32,124.81,125.03,124.24,124.47,122.76,123.03,121.97,122.72,122.82,123.19,122.58,122.58,123.64,124.69,125.79,126.23,125.33,126.43,126.56,126.43,126.94,127.21,126.71,126.59,126.82,127.43,128.59,128.2,127.36,126.62,127.24,127.11,127.73,128.33,128.78,129.15,129.11,128.93,128.01,127.5,128.31,127.34,128.34,128.77,129.08,129.35,129.3,129.08,129.88,130.88,130.91,131.66,131.07,131.09,131.09,130.87,130.51,130.03,129.74,129.99,130.48,130.52,131.21,131.25,130.52,131.22,131.38,132.41,132.36,131.9,131.73,131.29,131.66,131.65,132.13,132.08,132.18,131.1,130.37,130.32,130.13,125.86,123.27,125.02,124.28,126.95,126.92,125.09,125.05,124.51,123.83,120,122.24,120.12,119.33,121.2,122.52,123.81,123.03,123.72,124.49,127.13,126.81,125.65,123.17,122.99,122.06,123.35,123.63,121.57,119.36,119.72,119.72,118.94,120.79,121.18,123.97,123.69,124.71,126.07,121.99,121.99,121.8,118.96,119.17,119.13,119.78,119.75,117.47,115.03,115.04,113.27,111.48,109.18,106.22,106.22,111.49,112.45,112.31,113.26,113.4,110.6,114.39,115.2,116.31,116.79,117.32,117.3,116.68,117.93,118.2,119.09,120.66,120.66,118.96,119.22,119.38,120.39,119.45,119.28,121.13,122.17,122.28,123.11,123.69,123.42,122.26,122.34,122.43,124.01,124.38,124.05,125.4,125.4,125.59,125.81,125.37,126.17,126.33,126.23,126.16,125.8,126.67,126.18,126.04,125.22,124.2,123.93,125.75,126.12,127,126.89,127.52,127.99,127.98,127.6,128.98,126.54,126.43,127.34,126.75,127.2,128.06,129.54,129.54,129.82,130.09,130.7,130.83,130.04,130.49,130.5,131.36,131.28,131.34,131.04,131.25,131.25,131.38,132.54,132.25,132.21,132.82,132.97,133.09,132.1,131.81,133.09,132.49,130.3,130.09,129.7,130.18,127.04,128.06,128.81,129.95,129.19,128.32,129.41,129.05,127.51,127.68,127.68,126.61,125.74,126,124.34,124,126.65,127.69,128.47,129.82,130.42,130.38,130.11,130.65,130.43,130.56,131.83,132.22,133.47,133.3,133.07,131.81,131.65,132.15,132.91,133.93,134.32,135.35,135.35,135.11,134.45,134.62,135.23,135.54,136.16,136.19,135.72,134.84,135.32,134.48,134.86,135.79,136.42,135.71,136.71,136.49,136.14,134.65,133.44,132.47,128.53,130.2,130.3,132.74,131.87,130.24,132.21,128.34,128.66,130.51,132.09,131.05,132.13,132.06,128.63,130.05,129.63,130.48,132.13,132.22,132.22,131.31,132.73,134.46,134.58,134.57,134.61,135.58,135.97,135.88,135.45,135.8,135.85,135.85,135.18,135.17,134.03,134.86,134.53,133.81,134.49,132.84,130.46,131.5,133.37,132.78,130.71,131.9,132.75,134.2,134.01,135.35,135.08,135.45,134.92,135.84,135.36,135.75,136.01,136.56,137.32,137.21,137.65,137.24,138.56,139.08,138.91,139.01,139.39,139.75,139.47,139.69,139.79,139.91,140.98,141.05,140.97,140.44,140.22,140.52,141.58,141.89,142.48,142.48,141.91,140.69,139.75,140.64,140.85,142.13,141.68,141.53,141.94,143.16,143.17,144.19,144.24,144.18,144.82,145.54,145.66,145.63,145.63,146.38,146.39,145.54,145.97,147.19,146.15,146.67,146.26,146.97,147.95,147.53,148.56,148.33,148.61,149.85,150.43,150.43,150.03,150.08,150.25,148.89,146.55,148.02,147.89,148.36,145.73,146.79,148.99,150.66,151.16,150.35,151.45,151.7,152.68,152.44,152.72,152.72,152.27,152.99,152.4,150.8,145.75,141.33,140.8,134.58,133.47,139.62,135.69,141.42,136.62,134.29,124.09,130.22,123.86,112.08,122.48,107.81,114.27,108.35,108.86,104.14,101.09,110.57,111.85,118.83,114.82,118.67,116.77,111.62,114.17,112.44,120.35,120.15,124.25,126.05,126.05,124.77,128.59,125.75,126.48,129.87,127.55,123.64,126.47,126.41,128.16,130.05,129.37,132.81,131.58,127.89,128.44,129.6,128.69,130.17,132.37,132.39,129.67,127.41,128.88,129.38,133.46,132.06,134.26,133.21,133.53,133.53,135.17,137.17,136.88,137.54,138.06,139.19,141.09,140.62,144.3,146.04,144.9,144.13,135.64,137.41,138.55,141.18,140.67,140.75,139.96,140.87,141.47,137.82,139.33,135.95,137.95,140.07,140.78,141.42,141.42,143.66,142.11,143.22,142.41,143.9,142.55,144.47,145.78,145.28,145.69,146.92,147.17,148.01,146.19,145.28,146.36,145.41,147.22,146.67,147.79,148.85,149.39,150.35,151.32,151.41,151.83,150.62,152.73,152.41,152.39,152.8,153.15,152.48,152.96,153.48,155.03,155.58,157.17,157.43,158.49,158.15,159.34,161.78,156.1,154.83,154.83,150.53,153.57,150.87,150.95,152.87,153.67,152.96,151.67,149.97,148.24,149.8,146.25,146.68,149.03,151.43,150.7,151.94,152.75,151.28,154,151.85,154.49,155.73,157.1,159.68,158.67,157.62,157.38,157.4,154.83,155.56,155.22,156.03,156.57,153.66,153.19,147.79,149.55,147.74,149.56,152.22,155.58,158.6,158.56,160.41,160.19,161.41,159.8,161.98,163.87,163.08,161.19,161.83,160.73,161.64,164.25,163.99,163.99,164.38,163.63,165.47,165.77,165.66,167.13,166.8,167.27,165.94,165.73,165.52,164.79,166.92,167.22,168.18,167.59,166.94,166.59,166.72,167.31,167.31,168.76,168.39,168.61,169.7,167.2,168.38,169.34,171.86,172.8,171.67,171.74,172.13,171.48,170.25,170.25,171.64,174.03,174.08,173.56,174.19,173.93,169.46,171.12,167.81,170.5,172.87,173.05,174.93,175.61,176.91,176.71,176.65,176.94,177.78,177.78,177.68,177.62,176.83,176.51,175.14,175.36,177.35,173.01,172.19,176.29,174.86,172.58,170.26,173.58,172.65,175.09,176.15,177.98,178.16,179.32,179.04,179.55,176.9,176.8,178.04,176.68,175.71,176.63,179.57,179.42,178.85,179.5,181.62,181.62,184.24,184.06,184.33,185.11,186.54,186.5,187.12,186.35,188.42,189.1,188.1,186.82,188.56,186.82,188.86,189.2,189.16,189,190.28,188.91,189.43,188.16,188.29,189.83,191.23,189.23,187.59,183.57,185.8,188.58,188.1,186.5,185.95,187.91,187.76,189.62,189.22,189.58,189.8,189.94,189.94,189.85,190.12,189.43,191.11,190.96,190.99,190.64,191.53,191.9,192.25,191.86,190.83,190.75,188.24,190.88,191.86,191.65,192.76,193.4,193.85,193.91,194.16,195.18,196.64,196.64,196.24,196.9,195.22,197.42,198.1,197.4,197.63,196.99,195.5,192.4,195.32,196.93,197.32,199.33,199.8,198.86,198.82,199.66,198.58,198.21,199.84,198.91,200.11,200.44,200.26,200.45,200.71,201.54,201.87,202.4,200.97,198.81,199.06,200.68,202.39,202.69,203.14,201.96,203.74,204.61,204.34,204.4,204.98,204.91,204.91,204.22,203.95,203.01,201.44,201.9,200.74,202.44,202.13,200.28,196.88,196.72,198.6,201.01,201.3,200.74,196.65,196.96,194.62,196.85,194.3,196.34,197.15,198.78,198.4,197.04,196.56,197.16,200.52,202.02,202.7,204.2,204.95,205.56,205.34,206.32,206.69,205.65,207.67,208.07,208.45,209.21,210.57,211.45,212.24,212.42,211.68,209.94,210.06,211.57,211.57,212.39,211.84,212.55,212.26,211.58,211.93,212.41,212.41,207.59,210.33,206.34,203.9,206.8,205.05,207.45,211.75,212.4,210.88,212.89,210.95,209.37,212.79,210.93,208.76,206.38,210.05,212.19,213.51,213.51,216.47,216.25,216.55,215.9,215.34,216.71,216.57,212.37,212.17,211.31,211.01,212.94,213.54,210.5,210.67,210.67,206.8,204.79,202.53,198.7,199.25,196.83,196.53,195.47,200.23,204.01,205.41,207.35,202.29,203.34,202.58,204.28,207.25,203.5,199.64,198.87,202,202.18,197.9,196.48,196.48,194.49,190.91,193.77,198.1,197.62,194.56,198.19,197.14,195.58,189.81,188.43,193.28,192.45,189.95,188.54,192.58,196.89,199.32,201.65,201.56,203.84,201.33,204.22,205.26,206.72,209.26,207.94,204.69,205.38,207.05,204.45,202.46,203.32,202.78,199.36,198.68,200.9,198.46,198.46,198.42,201.6,201.48,198.51,193,194.1,188.64,189.03,193.71,186.68,187.74,188.65,194.28,187.36,186.29,180.33,180.77,177.79,177.56,181.8,181.08,184.74,177.27,176.24,176.26,179.54,178.08,179.76,183.33,187.87,187.87,186.69,185.3,188.71,185.63,186.21,187.98,185.95,181.53,176.24,169.41,168.77,171.23,165.67,166.03,166.03,170.09,169.87,171.49,176.73,176.21,172.66,172.54,171.02,172.83,172.83,173.1,173.72,176.32,176.18,174.14,172.53,171.77,171.25,174.54,173.08,177.86,178.91,180.67,178.99,179.22,177.15,181.79,183.99,186.61,186.08,184.84,187.73,187.59,187.28,187.05,186.25,190.22,190.09,193.38,194.15,194.51,193.1,193.54,191.04,186.96,186.54,187.08,189.72,183.33,182.1,180.1,178.69,179.22,177.3,177.3,176.57,179.81,181,183.76,185.71,177.68,178.28,176.26,175,176.2,174.21,171.23,169.79,166.86,165.14,164.79,168.03,164.48,162,166.19,171.28,170.93,169.18,164.44,163.21,162.15,161.61,165.81,161.88,166.17,168.07,166.95,165.62,169.55,171.57,174.36,173.07,172.02,176.25,174.94,174.22,169.86,168.07,170.35,171.99,172.96,169.36,178.75,180.4,178.79,180.35,178.86,178.31,179.16,178.46,180.88,181.95,181.95,181.9,179.09,178.81,184.34,184.18,183.96,180.67,178.07,177.74,179.07,177.76,180.3,181.61,180.51,176.01,174.05,172.48,172.66,175.23,172.7,173.71,173.71,173.01,170.93,173.91,173.47,173.47,172.78,174.08,172.05,175.98,175.85,177.07,179.35,179.96,180.68,180.68,180.31,177.51,176.15,179.48,181.62,181.49,181.45,183.45,183.91,181.52,184.18,186.11,188.84,186.89,185.74,188.13,186.05,184.4,184.81,186.92,186.87,187.39,184.81,184.29,184.29,180.6,180.32,181.28,179.37,179.92,179.37,178.53,179.88,182.78,182.91,180.11,180.36,177.03,174.47,174.2,177.08,175.84,178.93,176.96,178.53,180.85,177.87,178.4,179.41,179.71,179.42,181.98,183.02,185.66,186.35,185.27,184.8,185.47,185.47,185.65,185.64,184.88,187.33,186.94,187.56,187.72,187.7,186.59,186.75,186.91,183.96,183.25,186.84,188.38,188.31,186.12,184.82,183.49,186.88,186.96,186.11,186.94,186.62,186.33,186.88,185.69,187.89,189.67,189.4,189.42,187.3,185.93,187.56,190,190,190.01,188.85,190.71,193.48,193.09,193.55,192.81,194,194.22,196.03,197.39,197.56,199.96,199.23,199.23,198.28,197.24,197.98,196.46,195.58,197.82,197.75,198.63,201.07,201.31,201.31,200.91,199.32,198.75,199.22,200.57,202.05,203.77,203.56,204.34,205.8,206.28,204.89,204.95,205.78,206.36,206.33,205,207.03,207.33,206.78,203.92,203.4,202.32,204.14,203.28,201.85,201.9,201.69,202.85,200.5,198.99,197.45,197.43,198.78,198.23,200.42,197.72,199.05,200.3,203.2,203.98,203.66,204.02,204.02,203.17,201.75,201.1,201.39,202.75,201.59,201.84,203.54,201.07,201.21,200.78,198.89,195.63,195.18,195.97,193.08,193.12,194.26,193.74,193.75,191.09,192.64,192.39,194.66,195.89,196.91,197.75,196.52,195.53,197.6,197.58,194.94,193.28,190.85,190.53,191.91,189.16,186.92,186.02,188.26,189.48,191.47,195.08,196.91,197.26,197.82,198.02,196.41,199.48,199.32,203.12,203.44,203.68,203.95,205.45,205.04,205.87,205.87,205.99,205.59,205.79,205.6,206.37,207.59,206.46,206.35,205.54,207.18,208.03,208.84,209.8,212.67,213.23,213.21,214.18,215.44,212.27,214.46,214.82,214.82,215.73,216.03,216.11,215.5,214.28,212.57,211.84,212.22,215.22,214.9,216.12,215.97,216.14,216.14,215.33,214.12,216,218.66,219.14,219.78,219.96,221.12,220.98,222.65,222.51,218.93,221.66,224.03,223.32,223.83,225.68,225.81,227.1,226.89,223.79,225.93,227.25,226.15,226.15,224.8,225.08,229.83,229.91,229.04,229.43,229.05,230.25,232.1,231.82,229.46,230.63,233.01,231.49,231.23,233.82,233.37,232.7,231.19,232.65,233.97,236.05,236.81,236.48,235.76,235.1,237.13,237.39,237.39,236.92,235.2,235.46,232.55,235.13,235.05,235.39,233.16,234.9,231.48,228.69,228.22,226.91,226.4,224.42,226.38,229.09,229.14,228.09,230.42,231.15,227.51,226.73,228.8,231.68,234.07,234.38,234.38,235.57,235.96,235.91,237.05,239.82,239.32,239.6,239.82,240.42,239.77,238,239.67,239.67,239.73,237.96,236.54,238.44,238.71,239.06,241.9,241.85,241.58,242.2,242.86,244.92,245.5,245.4,247.28,247.91,247.91,247.28,246.89,246.14,247.11,247.49,247.72,246.71,247.37,248.9,250.16,250.16,251.53,251.78,251.97,254.54,252.31,253.7,254.42,256.05,252.48,250.51,248.72,251.4,251.01,245.2,243.94,246.64,246.84,245.62,249.5,246.08,241.56,234.32,236.75,234.92,240.33,241.45,241.46,245.53,246.47,250.44,250.94,253.38,252.88,253.95,251.68,254.57,253.77,254.18,252.66,252.65,255.2,255.2,249.8,249.4,248.65,244.35,247.18,248.29,250.94,252.82,254.19,254.51,254.57,253.84,258.14,257.64,258.37,259.02,258.53,259.58,259.25,260.35,257.92,257.96,257.53,259.84,257.34,259.84,261.69,261.14,262.73,264.75,262.74,263.97,263.92,264.97,264.49,264.36,261.93,262.49,262.41,263.11,263.53,262.66,257.77,258.83,258.1,261.27,267.88,269.87,270.88,271.14,270.36,270.42,268.79,265.24,266.28,267.33,267.34,268.76,269.7,270.51,272.06,271.03,271.03,272.55,273.21,273.34,274.99,274.48,275.16,273.47,272.66,274.89,273.4,273.39,274.43,273.37,265.31,265.08,267.96,269.91,272.89,272.89,272.78,269.76,266.88,265.73,265.14,268.48,269.97,266.97,267.39,267.39,263.27,263.68,263.98,268.82,268.25,270.93,270.93,273.31,274.98,276.45,275.66,271.64,274.14,272.86,274.3,272.91,270.84,272.79,273.86,274.86,272.26,274.08,274.18,273.43,276.28,276.26,276.26,276.94,277.6,276.39,271.68,270.33,269.06,269.1,264.83,269.03,264.29,261.06,263.97,259.27,260.7,253.67,251.75,252.98,249.46,254.77,256.4,253.67,256.41,255.85,256.06,260.58,260.99,258.08,257.23,252.15,253.55,254.5,256.22,243.82,229.25,228.71,225.12,246.54,238.01,242.32,244.24,243.82,238.36,238.67,238.67,233.05,238.9,242.88,247.8,249.63,249.79,251.24,251.61,253.2,256.93,255.29,253.32,254.42,255.9,255.72,264.04,265.96,266.23,267.33,269.2,269.44,268.39,264.06,263.94,262.17,262.17,267.54,266.05,267.11,267.09,268.19,269.74,269.76,268.34,271.1,271.35,272.84,272.09,273.13,270.04,272.58,270.3,270.22,270.22,269.63,272.22,275.25,275.25,277.45,278.9,280.34,280.03,281.36,283.7,283.7,281.47,281.27,282.98,283.75,282.82,283.22,282.1,283,284.52,284.49,284.89,285.07,287.3,287.5,288.64,288.69,287.84,287.48,286.42,281.84,285.99,284.6,286.67,286.44,288.68,287.95,291.22,292.16,292.25,291.4,291.38,289.67,288.96,287.81,292.18,290.93,292.13,292.83,293.76,291.88,291.88,289.86,291.33,293.77,292.84,293.45,294.24,295.12,297.62,297.48,298.88,298.5,298.21,299.63,301.1,302.43,300.76,299.91,298.4,300.16,300.96,302.19,303.21,303.4,303.42,304.53,303.37,305.14,304.29,296.04,300.66,300.19,301.4,299.5,301.08,304.3,304.31,302.68,304.45,306.85,310.62,311.33,311.32,308.24,309.04,309.57,305.94,307.06,303.63,304.01,308.69,309.33,309.53,304.4,304.25,301.46,298.97,300.1,295.42,298.33,302.94,305.69,307.8,307.8,309.44,307.8,308.55,309.47,309.81,310.41,309.33,309.06,311.14,311.79,308.46,307.97,307.24,303.68,306.09,308.79,310.77,312.19,313.19,313.19,313.1,312,311.57,309.28,309.87,311.84,313.77,312.69,312.71,314.74,315.24,314.62,312.95,313.75,313.55,313.55,307.08,310.64,312.35,312.45,314.01,315.3,315.27,314.86,313.51,315.2,312.55,310.96,307.15,313.2,314.67,313.63,313.62,308.71,308.86,308.86,309.18,310.9,310.02,312.17,308.93,311.3,313.83,312.14,310.79,310.91,307.98,310.37,308.61,304.52,307.05,306.39,306.13,301.47,299.64,302.68,303.44,299.31,298.48,293.97,297.33,296.22,297.82,292.64,287.75,286.61,294.96,297.08,297.41,297.41,298.72,298.95,306.45,308.34,307.99,311.12,314.79,317.3,318.13,321.96,321.19,319.15,322.49,321.16,323.72,324.12,322.53,322.4,325.71,326.66,325.33,327.97,332.76,331.49,334.29,334.91,334.38,336.33,338.91,334.72,334.47,332.24,335.82,336.4,337.65,337.65,339.72,339.77,341.73,342.47,343.37,343.81,341.28,342.66,333.6,334.59,333.73,328.33,334.08,335.76,341.31,339.37,335.24,338.88,338.88,337.62,332.77,332.45,332.41,332.26,336.16,338.82,338.1,338.1,338.1,340.54,339.03,338.07,340.82,342.26,339.55,340.82,342.12,340.38,336.94,336.29,339.27,338.81,334.71,334.88,334.93,335.64,330.55,336.03,338.39,343.39,349.54,348.95,348.34,350.49,350.29,349.16,350.08,352.36,351.76,349.92,347.52,348.25,345.23,346.73,345.76,346.86,346.79,349.29,348.42,347.26,344.79,346.38,350.04,348.73,348.73,346.69,345.01,343,345.95,344.27,342.73,341.19,345.08,345.65,350.81,350.81,348.16,348.08,349.85,347.15,346.57,345.7,346.37,348.92,351.23,353.26,352.49,350.84,352.93,352.73,352.65,348.74,349.88,346.06,347.47,348.46,350.47,346.24,344.44,346.84,348.91,349.88,348.81,342.47,340.72,341.97,347.37,332.24,333.29,341.11,339.8,344.25,343.03,341.64,335.08,331.65,330.88,324.21,312.21,326.98,325.35,325.35],"SK하이닉스":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100,99.53,100.7,103.76,104.23,104.23,106.1,106.22,108.57,106.81,106.34,105.52,107.63,107.04,108.92,105.99,105.99,105.63,106.81,108.69,107.16,107.16,106.46,104.93,104.93,107.51,110.92,109.15,110.21,112.68,116.31,116.78,121.13,118.78,118.08,115.73,115.73,114.67,116.43,115.38,119.25,121.13,121.36,125.12,125.12,125.12,126.06,126.76,123.94,126.06,126.06,125.12,128.17,123.71,117.37,119.01,113.73,112.44,116.43,118.31,117.14,119.48,118.78,117.84,111.5,107.98,109.62,109.62,111.97,110.56,115.85,114.55,112.68,112.68,115.49,119.72,118.08,114.55,115.38,109.74,111.74,111.62,114.2,113.73,116.2,119.01,119.25,120.42,119.48,118.54,121.6,119.72,118.08,115.96,116.9,115.02,114.67,115.02,116.78,116.9,115.49,117.84,117.02,120.66,122.07,123,123,126.06,125.82,126.76,126.76,130.05,130.05,131.22,131.22,133.57,133.57,130.52,132.39,129.81,130.52,129.81,128.4,130.75,127.23,131.46,129.34,130.99,130.99,134.04,135.92,134.74,133.8,132.39,134.04,131.69,131.69,132.63,133.1,136.85,134.98,138.03,139.2,142.25,142.02,147.42,150.23,152.11,152.58,152.58,158.45,162.44,157.75,160.8,158.22,155.63,154.46,159.62,159.86,156.34,157.98,161.97,161.74,165.73,166.9,167.14,166.2,166.67,167.37,167.14,171.36,165.26,156.81,160.56,151.64,154.93,153.76,159.62,153.76,150.23,150.47,155.63,150.7,151.17,144.13,152.82,152.82,155.16,155.87,157.28,157.75,160.09,159.62,159.86,160.56,159.39,158.69,160.8,161.03,161.27,159.86,164.08,168.31,167.61,170.42,173.24,175.35,177.7,180.28,181.22,187.09,185.92,189.44,195.07,195.07,202.58,202.58,193.43,195.31,194.6,194.6,194.6,194.6,194.6,194.6,194.6,208.22,209.15,207.75,202.11,197.65,196.01,189.91,185.45,190.61,198.83,192.02,191.78,184.74,184.04,187.32,192.96,200.23,195.77,198.12,196.01,193.43,195.31,193.43,192.49,193.19,195.77,192.49,193.66,194.84,192.72,199.53,203.76,198.83,199.77,195.07,193.9,193.43,180.28,181.69,185.68,182.86,181.92,178.4,184.74,184.74,182.63,180.28,178.4,177.7,181.22,188.26,188.26,180.75,180.05,180.05,173.71,176.29,179.58,179.58,179.81,182.39,180.99,186.15,183.57,180.52,171.13,170.42,174.65,170.66,174.65,173.94,176.53,172.07,166.9,167.37,169.95,177.93,177.23,176.76,171.6,172.54,174.65,169.48,164.79,164.79,166.9,173.47,172.3,174.88,182.39,182.16,182.16,182.16,179.58,177.23,180.52,178.17,181.46,181.92,184.74,180.28,180.28,181.69,183.8,193.43,194.13,196.01,195.54,199.3,211.27,212.91,210.33,210.8,211.03,210.33,207.51,207.98,195.07,197.18,191.08,188.5,188.5,190.85,190.85,192.02,188.73,194.6,188.5,189.2,188.73,190.61,197.18,197.65,197.18,194.37,198.59,206.34,198.12,198.12,192.72,193.43,203.05,204.46,198.36,198.36,195.07,194.6,194.84,194.84,196.01,195.77,201.41,202.11,200.47,198.59,204.23,203.52,206.34,209.15,209.15,223.71,222.07,223.47,221.83,222.54,223,219.25,214.55,210.8,213.62,213.62,213.38,207.51,209.39,207.51,207.51,202.58,204.23,197.18,197.42,206.1,207.75,210.09,199.06,197.89,200,196.01,201.17,196.48,202.11,199.53,202.35,200.23,205.63,204.93,203.76,200.94,208.45,209.62,207.98,209.62,211.97,206.34,191.78,196.24,188.97,195.07,202.11,201.64,202.58,200.94,195.31,195.54,186.38,189.44,187.32,183.1,176.29,177,178.17,178.17,175.35,174.88,175.35,184.04,187.32,190.38,192.02,196.01,193.43,194.37,194.13,194.84,189.2,190.61,187.79,184.98,178.17,179.58,179.81,176.29,174.88,182.39,181.22,183.1,184.98,185.68,180.05,180.05,180.05,180.05,176.06,171.6,173,168.31,168.31,164.32,165.02,167.14,167.14,165.02,161.97,169.95,165.02,163.62,165.26,161.27,166.2,164.32,162.21,156.57,151.88,157.28,156.81,160.09,160.09,160.33,170.42,165.49,164.55,166.2,171.13,171.13,174.88,168.78,165.26,168.54,164.55,163.85,158.45,159.86,162.68,162.68,166.43,166.2,168.78,167.84,163.38,165.49,161.97,160.09,154.93,156.81,153.76,152.35,155.4,153.76,145.07,146.01,143.43,141.55,137.56,140.85,141.78,141.78,141.08,144.6,142.02,142.02,142.25,135.45,136.85,137.79,138.97,149.3,153.29,152.82,145.77,150.23,152.11,152.35,151.64,157.28,156.34,156.81,165.49,175.12,168.54,172.3,178.17,173.47,178.17,178.17,178.17,178.17,180.05,172.54,173.94,178.17,178.87,181.69,173.24,175.35,173,177.7,180.05,180.05,177,176.53,173,164.32,164.32,164.55,163.62,159.86,159.86,156.57,156.34,158.92,156.81,157.98,159.86,159.15,159.62,165.49,178.17,178.64,171.13,170.66,172.3,169.72,174.18,179.81,179.34,187.56,184.04,185.45,182.86,182.63,184.51,184.04,183.33,187.09,188.73,188.26,185.92,192.02,188.97,190.14,184.27,188.26,184.51,187.79,185.45,185.45,189.44,188.73,188.73,187.56,188.5,178.4,174.65,172.54,175.12,174.88,168.78,168.08,166.43,165.02,161.74,159.62,158.69,157.04,154.69,155.16,154.69,153.29,156.34,152.82,152.82,152.82,153.52,156.81,157.75,154.23,149.06,148.12,149.53,148.83,157.75,157.98,154.69,157.04,156.57,161.74,164.79,163.15,164.32,167.61,162.21,164.79,160.56,158.22,163.85,171.13,177.23,175.35,178.87,178.64,175.12,175.35,180.28,184.04,184.98,182.16,185.92,187.32,180.75,185.21,180.52,182.39,178.64,177,169.01,172.07,169.72,172.07,174.88,174.88,180.52,180.52,179.34,176.29,179.34,177.93,173.24,174.65,168.54,171.36,172.07,172.07,181.69,182.16,180.75,187.79,194.84,192.25,197.89,195.07,193.9,193.9,193.9,186.62,186.38,188.26,194.13,192.96,194.37,195.77,192.25,195.54,191.08,192.96,192.49,186.62,186.62,188.5,188.5,189.91,189.91,185.45,187.79,188.97,190.61,193.43,190.14,181.69,181.92,185.68,182.39,187.79,194.6,194.6,194.84,191.31,192.49,195.07,198.83,199.77,196.01,196.24,193.19,190.85,195.31,195.77,195.77,200,200.7,200.23,194.13,189.91,191.78,191.78,193.19,194.13,194.37,189.91,188.97,184.74,182.39,184.98,189.2,189.44,189.44,189.2,195.77,206.34,207.98,217.84,218.31,219.72,223,222.07,220.19,220.19,222.54,225.35,220.89,220.89,222.3,221.83,221.36,220.66,228.64,232.39,232.16,235.92,235.92,230.52,232.86,232.39,234.51,233.1,237.09,231.69,231.69,231.69,226.06,229.81,220.66,219.48,222.3,227.93,229.34,235.92,233.1,231.92,234.27,234.74,239.44,245.31,246.48,239.44,242.96,244.13,241.78,233.57,230.05,222.07,217.84,206.34,216.2,217.84,221.36,222.77,217.37,217.37,209.15,200.7,194.37,193.66,189.2,188.73,171.6,161.97,175.59,162.91,184.74,198.36,189.44,195.54,196.48,195.54,184.04,187.79,186.85,195.07,201.41,198.36,199.53,197.42,191.08,193.19,193.19,190.85,197.42,192.49,190.85,196.95,193.9,191.08,193.9,195.77,196.48,196.48,196.48,190.14,190.14,193.43,193.43,199.53,198.36,201.17,196.24,189.2,192.25,190.38,194.13,197.42,195.77,190.85,191.08,192.25,191.08,196.95,191.31,196.24,195.54,208.22,205.87,212.21,213.62,210.8,213.15,207.75,200,192.49,200.47,203.76,202.35,200.47,199.3,197.42,201.88,197.89,198.59,196.24,199.77,200.23,198.12,200.47,201.88,199.06,196.48,194.84,194.37,194.84,194.6,194.84,194.13,194.6,192.96,197.42,195.31,193.43,196.48,194.37,195.07,195.31,200.23,194.37,192.02,191.55,189.44,190.38,189.2,191.08,190.85,190.14,189.44,188.26,188.26,183.33,176.06,168.54,174.88,177.23,180.75,184.98,185.68,182.63,176.29,176.53,177.23,184.74,184.74,184.04,186.38,181.46,179.81,184.04,187.79,192.25,191.31,192.96,196.48,198.36,190.85,196.24,197.89,194.6,193.66,197.18,197.18,197.18,197.18,195.31,194.84,195.77,194.6,194.6,200.7,207.04,203.05,204.46,200.23,203.52,200,196.71,195.54,196.95,195.31,193.9,194.6,191.78,187.56,186.85,191.08,195.31,202.11,202.58,201.88,203.05,204.23,206.81,210.56,230.05,230.28,230.05,230.52,227.23,234.74,231.46,228.17,233.33,231.92,228.87,235.92,255.87,261.74,269.95,277,269.95,282.86,273.47,271.13,274.65,275.82,275.82,280.52,278.17,272.3,264.08,272.3,277,277,271.13,272.3,278.17,278.17,295.77,306.34,307.51,315.73,323.94,312.21,302.82,312.21,306.34,299.3,305.16,306.34,306.34,308.69,301.64,316.9,302.82,301.64,288.73,287.56,293.43,305.16,305.16,293.43,299.3,293.43,294.6,295.77,295.77,295.77,309.86,311.03,305.16,295.77,312.21,320.42,325.12,319.25,348.59,332.16,332.16,339.2,345.07,333.33,328.64,318.08,320.42,312.21,321.6,328.64,320.42,329.81,328.64,333.33,323.94,323.94,316.9,313.38,312.21,316.9,309.86,315.73,311.03,329.81,330.99,335.68,335.68,336.85,338.03,328.64,322.77,327.46,321.6,322.77,322.77,323.94,325.12,311.03,312.21,311.03,308.69,316.9,305.16,305.16,300.47,308.69,309.86,309.86,302.82,303.99,305.16,288.73,280.52,275.82,278.17,275.82,284.04,284.04,287.56,287.56,280.52,288.73,288.73,294.6,293.43,298.12,301.64,295.77,302.82,301.64,301.64,299.3,287.56,288.73,300.47,298.12,301.64,303.99,296.95,292.25,286.38,286.38,291.08,295.77,301.64,295.77,293.43,299.3,292.25,287.56,288.73,293.43,289.91,285.21,280.52,281.69,288.73,289.91,289.91,285.21,279.34,278.17,274.65,280.52,278.17,274.65,272.3,267.61,267.61,264.08,272.3,281.69,284.04,281.69,277,272.3,264.08,247.65,235.92,238.26,238.26,238.26,244.13,240.61,240.61,241.78,246.48,242.96,244.13,242.96,242.96,250,253.52,250,251.17,248.83,245.31,248.83,241.78,246.48,250,252.35,252.35,244.13,251.17,251.17,251.17,251.17,247.65,244.13,245.31,242.96,234.74,241.78,234.74,234.74,229.81,226.53,224.65,220.66,220.66,214.79,215.96,220.19,230.99,227.93,229.34,229.81,226.06,231.22,234.74,239.44,238.26,250,241.78,250,252.35,247.65,248.83,251.17,252.35,255.87,254.69,252.35,250,260.56,262.91,259.39,258.22,261.74,280.52,279.34,280.52,275.82,271.13,272.3,267.61,273.47,281.69,277,278.17,285.21,281.69,289.91,282.86,285.21,284.04,289.91,291.08,286.38,282.86,292.25,298.12,299.3,300.47,295.77,299.3,298.12,307.51,307.51,307.51,301.64,294.6,293.43,298.12,292.25,300.47,301.64,303.99,301.64,298.12,296.95,298.12,293.43,279.34,279.34,277,277,266.43,282.86,282.86,282.86,282.86,291.08,292.25,288.73,288.73,288.73,303.99,309.86,311.03,298.12,306.34,312.21,308.69,308.69,308.69,308.69,287.56,288.73,288.73,288.73,293.43,302.82,302.82,280.52,277,277,277,277,272.3,272.3,272.3,272.3,291.08,291.08,289.91,289.91,282.86,277,277,281.69,284.04,277,272.3,274.65,273.47,265.26,266.43,262.91,261.74,260.56,265.26,258.22,253.52,255.87,264.08,264.08,265.26,259.39,253.52,260.56,254.69,257.04,264.08,259.39,258.22,257.04,257.04,252.35,252.35,258.22,259.39,255.87,264.08,259.39,264.08,266.43,260.56,264.08,265.26,254.69,253.52,241.78,248.83,251.17,253.52,253.52,251.17,251.17,251.17,244.13,248.83,247.65,242.96,232.39,232.63,229.81,228.64,226.29,221.83,223.47,216.43,211.74,215.02,223,223.71,220.66,213.62,205.4,209.15,217.14,216.2,220.42,222.54,219.95,219.01,220.66,220.66,231.69,237.09,234.74,239.44,240.61,234.74,234.74,235.92,234.74,233.33,229.81,227.93,226.53,228.87,228.87,231.22,226.06,223.24,215.49,219.01,219.01,219.01,227,227.93,224.65,226.29,223.47,219.72,218.78,220.89,223.24,217.14,218.78,223.47,216.9,215.26,213.85,215.49,212.21,212.21,212.21,212.21,222.54,218.31,215.96,214.08,211.27,206.57,206.57,201.88,196.01,193.66,192.49,190.61,189.67,195.07,195.07,202.35,210.8,211.03,214.08,214.08,211.74,220.66,222.77,224.18,223.47,224.88,218.08,211.74,212.44,215.49,219.48,220.42,211.27,195.77,194.13,196.95,198.36,194.13,198.36,203.05,205.87,209.39,209.15,219.48,213.38,215.02,214.79,205.87,207.51,202.58,200,200,203.99,199.77,195.07,196.48,199.53,198.83,192.25,190.14,190.14,185.21,184.98,191.31,190.38,193.19,192.02,188.26,184.04,185.45,183.8,183.1,185.92,182.63,180.75,180.75,178.4,176.06,176.06,177.7,177.46,190.14,191.08,195.07,201.88,203.05,204.93,203.76,201.17,201.41,201.88,199.77,200.7,205.63,205.63,205.63,214.55,214.55,214.79,212.91,207.75,214.55,214.55,216.43,209.15,213.15,222.77,222.77,219.48,212.68,219.25,215.26,218.08,215.96,217.14,214.08,209.15,217.61,213.62,211.27,209.86,209.86,206.81,204.93,210.56,208.69,203.76,200.94,195.54,197.89,190.38,185.68,185.45,197.18,196.48,196.24,203.99,207.75,204.93,200.7,207.51,203.99,208.45,207.98,204.69,198.36,198.59,196.71,209.15,212.91,215.49,211.97,208.22,209.62,207.75,205.63,207.04,205.87,209.15,204.69,200.7,205.16,208.45,210.09,210.09,211.74,210.8,208.22,208.22,208.22,204.93,203.99,202.58,204.69,202.82,212.21,215.73,219.72,228.4,230.52,229.81,229.34,242.96,256.34,256.34,258.92,254.93,258.92,258.92,255.16,255.16,253.52,257.51,270.89,269.48,280.52,278.87,279.34,279.11,269.48,272.54,270.19,267.61,266.67,266.43,265.26,268.31,272.77,270.42,276.06,276.76,273.94,267.14,262.44,258.92,266.2,270.89,267.84,277,275.12,276.53,275.82,274.41,270.19,267.61,266.2,265.26,291.08,300.47,289.67,293.66,280.52,281.69,281.92,286.15,278.4,278.17,278.17,270.66,269.72,269.72,271.83,269.48,275.12,273.24,273.47,272.3,283.8,273.47,272.07,278.4,280.28,285.92,281.69,279.81,280.28,277.46,278.17,266.9,272.07,273.94,278.17,286.85,287.32,279.34,279.81,277,273.47,275.35,274.65,269.95,269.25,269.25,269.25,269.25,269.25,270.89,282.16,282.63,282.63,280.52,279.81,291.55,292.72,291.31,305.16,305.16,295.07,296.24,291.08,297.65,299.3,281.69,279.58,279.58,273,282.39,294.13,295.31,312.21,306.1,299.53,300.47,306.34,309.39,305.16,314.79,310.56,304.93,308.45,309.86,308.22,305.4,300.47,306.81,308.45,306.1,314.32,311.27,307.75,295.54,294.84,294.84,299.3,302.58,307.51,307.98,320.89,328.64,328.64,324.41,329.81,329.81,330.05,330.05,330.75,329.58,332.16,332.16,334.27,321.13,320.19,322.77,319.25,322.54,313.38,319.25,314.79,314.79,310.09,307.51,319.72,331.69,334.74,330.52,332.16,322.54,319.25,316.9,321.36,316.2,311.5,316.67,310.56,323.94,323.94,335.21,335.21,335.21,352.11,349.06,349.53,344.6,355.16,351.17,349.77,367.37,378.87,379.81,361.03,370.89,366.67,366.67,390.85,389.2,382.39,387.09,403.52,391.08,388.97,384.04,380.05,378.4,385.68,376.06,367.37,399.06,398.59,397.65,414.55,425.35,418.31,429.58,435.45,437.32,420.66,441.31,429.11,425.35,429.34,429.34,442.25,439.91,441.78,420.42,419.48,427.93,406.81,402.82,401.41,422.07,400.47,417.37,412.91,408.92,408.92,407.51,406.57,406.57,421.6,417.84,411.74,422.3,431.46,434.98,434.98,453.05,445.77,446.24,450.7,464.08,469.48,466.2,473,475.35,475.35,459.39,444.13,455.87,453.76,454.69,454.69,487.09,488.26,498.83,504.69,521.13,518.78,523.47,550.47,548.12,557.51,549.3,523.47,528.17,556.34,555.16,555.16,552.82,544.6,553.99,539.91,553.99,548.12,559.86,561.03,565.73,546.95,539.91,546.95,517.61,498.83,491.78,481.22,481.22,489.44,446.01,450.23,459.15,443.43,456.81,453.76,406.57,366.43,384.27,397.42,383.57,402.58,415.49,427,438.26,438.26,468.78,455.16,468.78,452.11,448.59,435.45,421.6,410.8,420.89,398.36,407.75,408.45,395.07,363.38,374.18,367.14,368.54,365.02,369.01,396.24,382.16,382.16,382.16,382.16,358.69,368.78,380.28,383.8,388.03,424.65,431.46,409.86,409.86,396.95,396.95,408.69,434.04,417.84,417.84,438.26,436.62,436.62,452.82,442.96,460.09,439.67,448.12,440.85,460.09,465.26,471.83,460.09,446.71,457.75,437.32,427.7,455.4,453.52,459.62,459.62,470.66,452.11,436.15,429.34,406.1,418.31,403.05,400.47,400.47,396.24,414.79,415.49,415.73,395.07,378.17,375.35,372.77,387.09,394.37,406.1,392.25,396.48,400,403.29,413.38,411.97,420.89,431.92,430.75,410.8,395.54,398.12,395.54,395.54,399.3,409.62,408.22,408.22,401.88,427,469.01,457.75,457.04,481.22,477.7,456.1,457.75,465.26,492.96,503.52,497.65,511.74,529.34,515.26,518.78,518.78,518.78,518.78,518.78,467.61,448.12,448.59,466.67,477.7,476.53,465.02,468.78,466.9,489.44,492.96,497.65,492.96,512.91,497.65,491.78,481.22,470.66,476.53,467.61,446.48,446.48,436.85,453.29,451.64,451.64,441.08,440.85,466.9,468.78,480.05,483.57,476.53,482.39,492.96,505.87,496.48,488.26,502.35,485.92,467.84,447.65,462.44,464.55,456.81,427.7,386.85,397.89,387.32,430.05,424.41,423,423.94,408.45,410.8,410.8,414.55,407.98,424.88,418.54,432.86,427.23,424.41,416.67,416.67,436.62,436.62,436.62,447.89,446.71,446.24,457.75,465.96,483.57,470.66,480.05,468.08,474.18,470.66,462.21,469.48,476.53,475.35,488.26,497.65,480.05,487.09,487.09,510.56,527,527,537.56,541.08,563.38,552.82,552.82,582.16,584.51,578.64,577.46,603.29,609.15,653.76,671.36,687.79,666.67,685.45,670.19,654.93,653.76,634.98,636.15,661.97,659.62,697.18,691.31,704.23,700.7,694.84,632.63,631.46,639.67,630.28,631.46,632.63,624.41,615.02,616.2,618.54,642.02,605.63,605.63,618.54,606.81,615.02,602.11,626.76,631.46,652.58,649.06,649.06,627.93,617.37,599.77,575.12,589.2,609.15,613.85,610.33,630.28,631.46,600.94,611.5,616.2,623.24,642.02,650.23,676.06,713.62,720.66,771.13,777,816.9,782.86,834.51,834.51,823.94,847.42,839.2,836.85,789.91,819.25,815.73,845.07,928.4,928.4,928.4,928.4,928.4,928.4,1004.69,974.18,965.96,991.78,1062.21,1092.72,1139.67,1124.41,1130.28,1123.24,1197.18,1255.87,1223,1309.86,1333.33,1312.21,1455.4,1375.59,1359.15,1392.02,1361.5,1422.54,1453.05,1448.36,1436.62,1314.55,1422.54,1338.03,1319.25,1340.38,1223,1220.66,1218.31,1230.05,1277,1244.13,1262.91,1309.86,1295.77,1272.3,1277,1354.46,1328.64,1377.93,1326.29,1340.38,1300.47,1244.13,1293.43,1295.77,1284.04,1361.5,1370.89,1380.28,1380.28,1406.1,1502.35,1528.17,1528.17,1589.2,1633.8,1704.23,1741.78,1774.65,1746.48,1758.22,1732.39,1741.78,1758.22,1774.65,1793.43,1744.13,1737.09,1772.3,1800.47,1727.7,1877.93,1974.18,2021.13,2133.8,1948.36,2129.11,2112.68,1976.53,1969.48,2082.16,2056.34,2018.78,2084.51,2065.73,2065.73,2065.73,2065.73,2098.59,2227.7,2232.39,2359.15,2389.67,2579.81,2490.61,2490.61,2204.23,1992.96,2208.92,2169.01,1962.44,2201.88,2241.78,2183.1,2136.15,2286.38,2277,2478.87,2377.93,2363.85,2190.14,2314.55,2335.68,2190.14,2190.14,2049.3,1894.37,2105.63,1948.36,2056.34,2079.81,2150.23,2424.88,2342.72,2410.8,2441.31,2589.2,2666.67,2711.27,2647.89,2737.09,2873.24,2870.89,2875.59,2868.54,3032.86,3051.64,3035.21,3018.78,3018.78,3396.71,3396.71,3758.22,3882.63,3957.75,4413.15,4307.51,4638.5,4624.41,4269.95,4319.25,4096.24,4096.24,4553.99,4556.34,4556.34,4816.9,5265.26,5373.24,5476.53,5546.95,5539.91,5539.91,5394.37,4859.15,4485.92,5199.53,4807.51,4931.92,5046.95,5370.89,5591.55,5917.84,6302.82,6488.26,6852.11,5997.65,6152.58,6847.42,6274.65,6169.01,6220.66,6009.39,5133.8,5692.49,5500,5166.67,4873.24,5131.46,5117.37,4330.99,4490.61,4887.32,4323.94,4323.94,4140.85,4309.86,4295.77,4504.69,4129.11,4262.91,3638.5,3288.73,3103.29,4032.86,3678.4,3701.88,3915.49,3509.39,3338.03,3333.33,3345.07,3530.52,3739.44,3861.5,3861.5,3901.41,3521.13,3969.48,4061.03,3922.54,3938.97,3962.44,4061.03,3880.28,3929.58,3974.18,3786.38,3746.48,3866.2,4185.45,4208.92,4356.81,4349.77,4253.52,3983.57,3967.14,4129.11,4096.24,4359.15,4384.98,4319.25,4370.89,4370.89,4370.89,4150.23,4143.19,4169.01,4302.82,4321.6,4321.6,4161.97,4044.6,3946.01,3946.01,3767.61,3387.32,3330.99,2962.44,2985.92,2997.65,2870.89,3037.56,2870.89,2997.65,2992.96,3147.89,3490.61,3582.16,3328.64,3455.4,3281.69,3277,2967.14,2657.28,2666.67,2845.07,2997.65,2943.66,2854.46,2629.11,2577.46,2685.45,2777,2612.68,2546.95,2718.31,2417.84],"마이크론 테크놀로지":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.3,96.47,97.02,91.8,93.34,92.45,94.68,101.54,102.63,101.84,99.45,100,99.45,100.79,100.7,101.09,102.58,102.24,115.2,115.55,115.55,115.75,113.16,110.63,108.89,108.89,112.02,111.08,109.84,109.49,110.98,111.67,113.21,110.83,110.18,110.18,108,110.88,107.85,109.09,108.74,113.51,117.04,116.84,119.08,120.12,119.77,122.95,123.15,122.21,120.91,122.21,120.27,121.46,119.47,118.73,114.85,114.36,114.16,116,116,118.08,117.98,116.64,115.45,118.03,116.44,121.96,122.7,127.02,127.72,127.37,126.08,124.94,125.09,127.67,127.07,129.76,129.36,128.17,130.2,126.78,129.46,131.5,141.23,142.87,142.52,141.58,143.91,143.57,142.28,142.03,140.39,142.18,141.68,137.31,135.02,132.59,132.84,132.84,134.77,134.82,135.42,138.9,135.72,131.99,134.08,133.08,137.26,137.46,140.54,137.95,139.1,138.05,140.09,139.39,143.12,145.65,144.21,143.72,143.22,144.16,134.13,136.51,138.2,139.39,140.54,144.01,146.2,147.84,147.84,152.51,152.86,152.81,155.04,155.04,156.83,161.45,161.2,152.01,154.99,156.68,154.3,151.81,148.34,154.99,153.15,159.02,158.42,157.63,161.45,157.28,160.16,156.33,148.34,144.76,144.76,151.56,149.53,150.02,151.52,155.84,156.23,154.64,157.92,157.58,158.47,158.07,158.97,159.02,157.33,148.53,148.09,150.22,145.45,139.69,140.78,142.23,138.25,138.7,142.03,143.27,141.98,136.56,139.15,145.26,147.44,152.46,147.14,150.92,146.85,151.27,151.27,150.12,150.47,154.4,156.38,157.03,158.82,161.95,161.95,159.31,160.21,162.89,161.2,166.12,170.34,171.83,171.78,172.13,176.01,178.59,178.69,178.39,179.19,173.22,169.8,184.25,188.57,195.38,198.76,200.55,196.52,195.58,197.07,203.48,208.54,206.71,201.59,200.7,206.11,200.65,206.91,205.22,206.16,206.46,206.66,203.97,201.69,202.93,206.91,220.12,220.47,220.27,217.14,214.85,218.33,219.03,216.1,222.45,226.53,227.52,225.34,229.41,229.31,236.66,245.4,244.11,244.11,246.8,238.7,238.1,217.29,210.58,208.59,198.21,204.72,206.56,214.61,214.65,213.66,207.95,208.89,209.84,210.63,217.14,218.48,227.27,220.67,219.18,219.18,209.89,211.03,207.7,204.27,216.94,223.45,232.89,227.52,226.28,213.46,215.15,212.72,212.67,212.67,213.21,219.87,218.53,212.37,213.02,218.33,214.01,213.66,216.94,215.05,207,217.19,211.08,202.78,195.73,217.98,208.69,198.71,200.75,209.59,211.77,215.85,216.1,219.62,219.62,223.05,221.26,219.82,231.15,238.35,241.33,242.47,236.56,243.96,258.47,266.96,268.11,274.32,271.19,294.93,295.23,296.97,292.3,300.94,298.76,303.78,303.38,292.7,269.3,276.01,260.31,255.79,259.02,259.02,248.68,256.09,265.23,247.59,240.74,238.25,250.77,250.77,261.25,259.46,256.58,259.61,268.31,255.44,251.47,243.52,234.03,236.46,249.08,236.07,228.42,232.44,227.97,231.59,236.36,240.83,241.28,253.4,261.6,257.43,263.29,268.31,280.68,271.73,265.23,275.61,293.24,297.91,305.46,304.77,304.77,311.08,310.83,286.09,291.8,293.59,295.13,295.18,296.22,304.97,304.97,300.79,298.31,293.99,289.27,290.36,294.34,292.85,295.28,283.66,264.08,271.19,259.61,263.98,260.51,270.64,255.74,255.74,262.49,264.43,269.8,276.9,269.15,275.46,279.93,278.94,282.96,285.39,279.28,273.32,269.7,264.13,265.23,267.06,268.06,263.34,262.25,259.76,265.28,262.34,261.65,263.49,265.23,259.61,255.19,255.04,251.47,235.92,233.98,234.03,238.8,248.09,249.58,246.9,251.86,258.67,260.01,257.48,262.1,260.9,260.9,257.97,246.1,221.81,222.85,223.05,216.59,207.35,216.69,220.07,216.49,225.19,223.85,228.81,222.26,224.34,221.76,220.32,223.5,224.69,224.29,227.32,224.29,219.37,216.49,213.96,209.99,206.71,208.49,210.98,210.33,214.65,210.38,205.17,200.94,197.52,192.15,176.01,182.71,175.86,172.18,178.89,187.38,199.3,200.3,198.31,197.71,203.33,200.89,194.29,185.99,188.03,188.92,198.26,195.93,182.96,179.43,180.73,180.73,180.82,181.67,183.81,192.3,188.33,191.55,198.86,183.21,183.21,187.13,175.41,172.88,174.91,178.99,173.97,169.9,168.31,169.45,156.04,155.39,150.62,144.16,144.16,153.45,158.62,156.83,157.63,162.69,154,162.44,168.9,167.61,176.06,178.39,178.89,172.23,168.85,166.82,168.31,177.65,177.65,168.26,170.09,181.77,193.54,189.17,185.74,189.97,189.87,196.72,196.08,195.58,206.26,195.63,191.65,191.65,200.7,207.05,209.79,208.59,208.59,208.45,209.69,206.31,211.48,212.37,213.41,205.27,203.08,206.56,203.97,198.66,188.43,187.93,192,193.89,194.98,192.9,190.81,196.42,196.77,200.55,199.35,218.53,206.76,201.44,200.3,194.88,195.43,205.32,209.89,210.83,218.08,213.07,215.2,213.11,207.25,209.49,210.03,208.69,207.75,212.42,214.36,215.6,215.6,215.6,212.47,213.76,212.37,209.14,209.19,208.94,208.15,211.43,215.25,209.29,200,197.47,195.08,193.44,185.69,191.31,190.81,185.35,179.14,171.98,177.05,172.53,168.01,168.9,168.9,163.64,165.38,165.52,162,162.39,171.34,165.62,166.27,168.85,173.57,173.08,163.74,165.82,162.25,161.1,170.34,168.6,169.65,165.18,164.88,162.34,184,189.12,191.7,199.25,196.72,196.67,196.67,195.83,200.75,205.41,213.11,216,221.11,220.57,213.91,215.45,221.91,226.13,234.43,233.23,238.4,237.31,235.92,232.59,235.77,223,216.59,218.98,208.35,211.72,207.4,211.77,206.26,209.29,219.42,208.84,209.84,216.34,223.6,219.72,219.42,222.45,213.41,215.75,210.83,214.36,221.91,224.89,224.89,223.5,232.54,243.57,243.27,244.06,245.36,250.77,250.57,250.87,249.13,252.56,250.77,247.49,244.21,246.4,240.98,245.75,241.43,214.65,212.87,210.13,208.54,215.9,221.31,219.37,211.82,213.02,215,224.04,222.85,230.8,224.34,226.03,215.95,224.64,221.86,221.86,233.98,238.6,241.88,239,237.85,236.21,240.34,246.35,241.83,236.86,240.44,234.43,229.81,232.99,230,232.49,237.01,237.56,231.4,226.38,226.28,227.87,236.07,232.09,239.24,239.24,236.02,230.45,224.69,230,231.59,238.1,230.75,235.77,244.71,253.2,254.35,262.99,263.29,263.49,270.89,273.52,275.21,275.31,275.31,273.77,268.41,264.33,267.16,275.16,270.89,266.12,289.47,285.74,284.7,281.52,285.39,285.74,279.04,286.54,286.44,286.44,292.95,293.94,294.09,286.93,275.26,280.53,274.71,273.37,263.74,267.16,275.71,282.02,291.51,282.56,284.8,284.4,294.44,294.73,290.61,290.61,286.89,298.01,293.09,283.11,273.27,258.82,260.16,251.27,261.1,271.19,257.33,274.66,266.87,255.69,228.37,237.75,217.19,192.8,213.56,171.24,185.69,172.33,180.28,179.38,190.01,214.95,211.13,222.5,216,221.16,208.94,198.16,204.12,204.77,230.35,231.2,239.89,229.16,229.16,229.36,236.56,230.65,226.18,227.02,215.6,205.71,218.13,217.44,219.37,224.94,225.09,247.54,237.9,223.85,220.86,225.58,228.91,231.45,239.69,239.44,226.97,216.24,227.17,220.62,228.12,224.14,231.69,224.64,223.25,223.25,227.52,245.65,230.85,238,230.2,232.59,243.02,254.45,266.87,266.77,264.03,260.66,241.03,241.88,244.61,253.45,253.15,250.77,252.51,254.1,247.59,239.89,244.36,240.88,244.16,255.94,246.9,247.54,247.54,252.96,243.86,246.94,248.29,251.86,245.7,246.94,250.92,248.88,245.75,254.4,255.94,256.58,261.5,248.48,256.28,248.83,250.32,252.06,248.68,250.32,254.84,253.6,241.93,242.18,244.16,237.26,240.83,229.21,226.53,224.64,220.57,218.83,213.56,211.92,217.39,224.04,223.35,221.66,226.97,226.08,227.32,237.61,230.15,230.9,230.9,223.7,224.29,222.9,228.96,243.57,243.67,249.43,253.25,252.06,244.16,246.9,247.64,245.75,244.11,246.99,251.91,233.28,238.05,231.25,236.46,235.07,240.49,247.89,247.84,251.76,257.58,256.48,258.02,256.38,261.45,265.92,264.83,270.14,262.54,259.02,258.12,248.39,250.77,250.07,246.94,253.75,258.12,271.14,274.02,277.99,275.26,279.98,279.43,287.78,307.3,307.95,301.74,307.15,305.02,318.83,317.69,315.1,315.1,319.08,318.38,333.23,343.32,347.24,364.33,360.71,363.59,354.74,354.1,350.37,355.39,363.39,362.59,358.97,354.99,355.04,349.93,347.49,350.62,350.62,351.02,348.78,357.28,373.47,367.86,383.81,383.06,393,384.6,390.81,394.73,396.97,403.87,400.99,400.99,424.74,414.8,422.31,408.74,403.78,394.98,373.03,389.42,388.82,399.55,405.46,393,403.63,402.88,417.34,413.91,409.09,429.61,437.21,437.21,435.87,427.47,439.84,451.86,428.61,438.3,459.61,437.75,454.69,470.74,452.51,442.67,418.93,441.78,422.5,443.62,424.29,443.67,436.02,441.38,454.2,470.74,446.2,449.63,453.45,424.24,412.32,417.73,437.11,430.15,429.91,438.2,459.07,459.07,465.72,464.43,466.77,473.37,473.42,474.86,457.77,450.42,448.44,450.37,439.2,434.58,444.56,420.81,427.37,436.36,444.41,427.37,437.46,427.57,422.35,419.32,423,421.26,427.12,401.64,400.79,381.52,383.46,395.93,399.35,391.85,397.07,403.03,400.99,411.82,403.53,408.54,416.94,417.98,417.98,418.03,418.98,407.5,416.1,417.49,400.05,390.76,393.84,394.14,399.85,408.25,399.85,400.6,382.27,382.86,385.79,392.55,400.3,407.5,414.21,411.97,422.16,397.96,399.06,399.06,402.78,388.57,383.06,391.16,395.23,389.72,389.92,382.12,372.63,370.49,374.52,383.46,375.21,377.25,379.04,368.7,375.31,382.91,385.39,385.69,401.69,407.25,404.82,407.35,398.46,377.1,372.73,348.98,352.31,352.36,351.61,350.82,349.13,348.88,356.38,357.58,367.81,361.5,367.61,363.44,366.12,366.22,367.56,366.67,366.67,365.82,359.02,362,365.13,369.35,365.08,366.72,370.74,369.1,359.51,358.37,367.46,367.81,367.86,373.47,363.14,355.89,352.61,352.66,350.82,350.22,347.44,350.42,348.34,343.86,331.45,329.76,336.81,336.21,334.13,335.67,339.15,340.98,335.37,341.58,342.47,339,345.65,343.27,351.22,351.52,353.95,358.87,362.25,370.39,375.51,364.68,370.34,384,381.42,381.57,374.86,382.61,412.47,416.59,424.29,428.27,428.27,414.41,427.92,417.29,423,411.72,405.46,409.59,426.38,427.32,421.91,424.94,419.03,413.76,425.53,410.78,412.32,407.5,450.47,448.78,469.05,469.05,469.1,461.7,477.74,466.42,462.74,475.66,478.59,468.95,475.16,469.2,466.42,467.96,472.48,475.01,483.66,483.66,461.35,447.09,422.6,407,412.07,400.99,407.2,391.06,393.79,408.69,404.62,419.82,407.2,403.23,401.74,417.88,437.75,452.16,445.9,446.4,476.9,477.2,465.62,451.07,451.07,449.93,433.73,441.28,447.59,441.43,428.51,463.49,443.02,406.91,376.06,383.31,394.63,376.16,361.75,344.76,363.19,395.78,400,394.49,389.22,393.05,375.81,388.52,387.98,396.72,407.6,393.24,386.93,378.44,385.84,370.64,366.52,364.03,358.37,357.82,357.48,359.56,348.39,348.39,353.45,361.3,363.64,352.31,344.81,348.34,333.23,330.2,348.63,338.75,350.72,354,365.72,354.15,349.48,337.46,342.32,332.64,336.36,357.28,350.07,370,352.96,344.76,342.28,345.7,330.95,337.16,350.72,364.23,364.23,366.82,365.38,374.42,347.44,349.98,351.52,340.78,327.97,311.08,292.3,291.6,293.69,273.27,276.95,276.95,282.17,279.88,279.28,290.31,292,287.43,278.29,274.62,266.52,266.52,281.82,285,292.35,293.79,287.18,293.99,292.4,294.83,305.66,300.3,309.99,314.46,316.15,304.47,298.81,296.37,307.45,308.35,307.3,310.68,310.33,319.18,322.16,310.28,305.27,293.84,305.02,309.59,323.1,321.41,317.24,306.11,312.87,300.6,289.67,287.43,289.67,304.02,286.29,283.21,279.68,280.82,284.7,279.83,279.83,274.37,273.22,275.16,285.35,287.83,266.37,263.84,261.75,262.54,258.82,252.36,248.88,246.7,248.88,242.82,251.27,253.35,248.44,248.88,256.93,268.06,271.88,271.34,262.84,255.24,266.82,262.05,272.53,261.9,265.77,261.05,263.44,266.77,278.44,279.38,277.55,275.46,259.36,268.46,268.75,272.53,265.52,265.67,278.99,280.97,285.59,278.04,299.4,310.58,306.91,313.46,292.45,291.8,291.01,283.95,291.21,292.75,292.75,290.16,276.95,273.82,286.39,275.66,271.63,268.46,266.67,267.36,274.22,272.58,274.96,274.42,271.19,258.52,258.67,256.93,251.76,254.3,245.55,249.38,249.38,248.48,244.01,251.61,248.29,248.29,250.22,269.25,271.78,282.02,279.98,284.2,288.43,284.5,282.81,282.81,282.41,280.73,279.98,290.41,307.1,304.32,305.71,311.97,317.29,306.56,299.55,310.98,313.81,310.03,297.96,308.64,299.3,298.96,297.17,298.66,308.35,307.2,298.31,293.14,293.14,286.14,283.06,291.85,289.02,287.63,287.23,284.85,280.33,282.07,282.31,276.01,282.61,276.2,272.88,267.76,269.6,268.9,281.02,281.47,286.34,291.26,288.97,304.72,303.83,297.02,294.49,315.65,313.41,299.75,296.13,284.5,283.26,290.91,290.91,314.31,315.8,307.8,312.97,311.13,310.68,307.65,301.29,305.32,303.68,295.63,288.82,303.13,307.5,319.72,309.74,307.5,302.58,300.6,304.17,302.38,302.68,298.01,306.06,302.63,321.11,316.59,322.5,335.67,338.65,329.01,327.92,330.5,345.8,367.26,367.26,356.14,338.8,343.22,343.62,336.66,335.52,333.13,324.49,325.04,335.07,337.16,343.37,341.88,336.12,336.12,332.34,326.88,329.11,324.29,325.14,331.79,333.18,319.57,313.51,317.44,317.44,308.3,304.17,301.29,310.38,315.95,316.89,320.57,318.33,323.7,322.6,322.7,321.36,326.13,325.29,326.28,334.72,353.06,353.7,354.64,351.52,338.65,343.67,347.29,344.66,336.07,331.35,325.09,319.77,339.2,324.54,319.03,315.75,315.9,317.73,315,323.85,316.39,316.54,324.44,331.25,338.25,347.44,349.68,349.68,349.18,349.78,347.09,348.63,347.89,349.28,351.96,356.63,347.14,350.22,351.27,346.15,337.31,342.18,340.69,337.51,338.85,323.89,337.95,337.61,336.96,338.35,343.02,347.54,345.16,343.12,348.78,346.5,343.82,343.17,342.77,343.47,335.47,333.93,332.24,338.15,330.35,320.57,326.13,328.22,332.19,344.76,349.93,360.56,362.25,361.65,359.07,365.47,374.37,371.49,383.36,383.21,380.87,385.3,390.56,381.07,383.01,383.01,381.87,385.05,378.14,380.97,378.14,377.2,369.05,366.07,363.29,365.87,372.38,386.44,388.28,396.37,408.3,404.42,405.17,408.2,390.91,424.64,429.66,429.66,432.49,430.5,427.22,423.94,409.04,408.64,410.88,414.56,422.01,413.96,409.24,414.26,409.29,409.29,420.32,413.71,421.36,434.72,443.32,434.82,437.56,443.12,437.41,442.47,428.02,425.98,425.29,429.61,432.09,420.27,423.1,421.66,425.04,425.73,405.02,406.51,405.51,394.93,394.93,400.94,404.82,426.78,427.22,444.41,456.28,445.65,450.12,472.68,475.76,469.3,474.71,491.7,484.95,469.5,483.95,467.76,454.2,463.24,465.87,466.96,478.14,545.7,547.49,581.87,590.16,592.4,585.64,585.64,617.49,609.79,635.92,616.44,613.91,610.78,609.19,607.05,633.43,608.64,602.93,604.92,577.89,556.04,530.4,542.08,558.67,555.29,554.3,570.49,568.11,561.15,544.96,558.02,569.8,596.77,592.2,592.75,585.25,602.29,611.03,620.02,634.92,635.32,622.4,640.83,633.38,627.32,627.27,643.27,643.27,659.07,653.65,627.37,620.96,636.71,629.11,664.23,646.15,650.47,669.75,670.99,699.21,711.08,702.24,734.38,762.3,762.3,716.29,693.19,690.56,701.04,707.2,656.88,653.4,653.35,658.67,679.68,679.68,653.75,649.23,651.47,677.55,646.94,663.44,650.12,633.33,593.64,583.46,567.61,572.68,567.56,547.84,533.78,543.52,535.77,509.49,545.55,504.27,460.51,449.18,442.13,431.2,457.38,462.39,470.14,484.05,498.81,531.3,536.46,539.64,536.46,538.15,517.93,510.93,491.36,486.14,471.24,474.76,478.09,478.09,440.04,443.57,444.06,429.11,428.56,431.45,450.32,433.23,453.15,433.08,440.78,433.93,443.37,451.56,464.83,466.96,475.76,545.85,534.03,515.2,498.31,496.03,505.81,507.95,511.23,509.39,505.22,525.04,531.15,538.2,518.23,542.67,556.63,552.16,541.88,535.62,521.86,530.8,536.07,528.51,537.41,517.04,495.03,495.43,505.37,524.04,555.54,563.39,555.89,539.74,517.14,496.37,492.7,478.59,484.4,485.49,488.67,510.48,509.89,519.03,505.71,487.83,487.83,486.59,489.57,495.98,512.67,501.09,502.58,510.78,487.33,507,488.03,509.19,537.8,539.49,516.15,432.64,447.69,445.7,443.52,443.52,446.2,440.29,423.8,418.08,433.83,446.45,493.09,506.26,493.84,493.84,493.49,472.23,483.66,512.62,509.69,525.34,525.34,543.37,542.62,520.81,512.62,452.61,438.4,442.18,459.51,453.25,446.7,450.37,464.98,469.65,458.52,476.55,467.36,455.44,475.21,494.39,494.39,530.5,518.43,512.57,491.01,473.97,463.09,485.39,456.14,465.13,449.78,453.06,468.65,443.47,461.8,432.59,442.37,475.11,471.34,500.7,512.22,505.32,507,511.67,470.54,481.57,467.86,457.68,452.86,439.34,431.64,440.69,440.14,369.3,321.51,339.64,325.58,386.84,347.99,345.5,352.81,352.91,344.41,341.78,341.78,331.54,348.78,362.3,384.6,396.32,390.26,381.92,382.27,386.34,400.99,399.5,399.95,410.43,423,426.53,458.47,481.52,473.52,474.17,486.84,490.06,487.33,476.11,471.09,463.84,463.84,478.79,477.79,480.87,469.25,487.73,507.95,512.92,528.02,539.29,551.17,567.01,576.4,577.15,574.27,595.33,597.81,605.17,605.17,614.01,606.46,635.42,632.14,625.93,619.77,612.27,600.55,604.77,607.5,607.5,595.73,618.08,607.25,611.57,618.63,589.22,596.67,578.39,562.64,568.26,562.49,542.57,545.6,555.04,552.71,552.66,556.18,570,542.18,521.01,535.37,541.78,540.39,555.74,590.61,614.61,634.62,617.34,622.4,600.45,613.76,606.31,582.27,575.21,584.6,578.34,578.74,584.95,606.06,591.21,591.21,588.57,589.77,617.04,652.61,653.06,671.83,695.48,747.99,781.07,783.76,788.97,794.78,839,808.4,817.78,826.68,803.33,779.09,781.27,814.21,831.2,904.87,912.82,933.08,948.63,922.45,976.35,955.44,902.14,957.63,929.26,953.5,1006.11,1005.37,1027.17,1004.92,985.94,1026.88,1088.03,1093.39,1102.38,1125.83,1112.82,1111.62,1165.92,1083.11,1179.83,1183.95,1181.92,1258.32,1197.76,1216.59,1177.1,1226.18,1201.94,1135.12,1122.31,1000.35,1030.15,1112.42,1115.4,1143.86,1143.86,1174.76,1194.54,1189.72,1163.24,1125.93,1178.44,1226.63,1253.95,1310.03,1283.95,1197.91,1179.83,1155.04,1120.32,1234.72,1321.01,1374.02,1372.43,1424.14,1424.14,1414.75,1462.34,1453.7,1417.83,1566.92,1550.67,1706.06,1686.79,1624.54,1714.31,1718.18,1679.73,1655.99,1672.28,1802.04,1802.04,1813.21,1932.99,1975.06,1985.35,1932.89,2037.95,2162.34,2164.88,2061,2174.86,2083.66,1884.75,1902.09,1960.71,1905.12,1854.2,2038.45,2056.48,2045.01,2045.01,1985.99,2091.16,2073.27,2127.02,2091.26,2076.55,2131.15,2064.38,2048.53,2050.02,1886.14,1990.91,1972.43,1839.54,1934.03,2002.53,2079.93,2013.66,2116.89,2194.73,2293.54,2293.74,2207,2100.84,2008.69,1964.88,1898.11,1765.82,1774.57,1598.61,1678.29,1827.37,1819.37,1819.37,1876.6,1875.71,2020.52,2093.94,2089.37,2119.03,2313.26,2266.42,2271.39,2260.66,2227.62,2232.39,2421.66,2393.05,2467.56,2605.86,2505.17,2575.56,2569.1,2693.54,2863.64,3180.33,3311.43,3212.27,3709.94,3950.97,3808.15,3992.2,3854.99,3599.9,3385.69,3471.14,3636.31,3785.89,3730.75,3730.75,4450.47,4612.07,4587.78,4823.65,5144.06,5286.14,5362.99,4947.84,4292.15,4715.75,4649.23,4430.6,4947.19,4876.35,5404.82,5070.84,5182.27,5633.33,5633.33,6017.78,5224.89,5208.69,6028.61,5625.09,5689.42,5734.18,5128.07,4846.3,4846.3,4891.95,4661.6,4713.36,4926.18,4864.88,4654.74,4883.86,4492.2,4238.45,4217.34,4299.35,4822.75,4766.42,4919.08,4575.01,4471.93,4076.16,3671.14,4345.06,4088.57,4120.72,4434.53,4437.11,4378.89,4359.51,4277.2,4314.56,4527.02,4718.48,4826.93,5026.08,4673.42,4655.29,4840.19,4802.68,4522.75,4634.72,4661.7,4646.75,4634.18,4762.69,4637.06,4749.53,4759.86,5050.12,5050.12,4969,5105.66,4855.49,4844.81,4590.31,4608.05,4602.83,4855.94,5046.2,5186.09,5445.41,5324.79,5367.76,5376.45,5235.87,5291.01,5291.16,5451.52,5339.74,5285.44,5194.04,5404.87,5145.75,5111.77,4913.26,4735.17,4541.13,4626.13,4365.82,4495.28,4451.42,4538.85,4254.79,4359.41,4489.32,4613.81,4884.4,4641.18,4395.13,4141.03,4247.89,3950.47,3260.76,3427.72,3642.08,3602.14,4030.3,3966.42,3866.42,3571.88,3539.1,3503.58,3429.91,2953.35,3515.65,3128.61,3128.61],"삼성전자":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,101.64,101.64,105.82,106,104.67,104.12,105.94,107.39,108.48,107.88,106.18,107.03,107.7,106.61,108.67,108.79,109.82,109.39,109.64,108,108.97,109.03,108.36,109.21,109.21,109.39,110.55,109.58,107.76,109.7,112.79,112.85,116,117.58,113.52,111.09,112,111.94,113.58,112.73,115.33,115.64,119.39,120.91,120.91,120.91,119.58,118.55,119.27,119.58,119.88,117.64,116.36,116.36,116.24,115.03,113.88,114.3,115.21,114.73,117.15,118,119.09,118.73,115.82,115.33,116.48,116.48,120.36,120.06,121.45,121.82,121.82,121.82,121.76,123.03,125.33,125.45,126.79,128.48,126.97,128.97,128.67,126.67,125.76,124.85,125.7,126.61,127.21,124.85,125.58,127.52,127.7,126.79,126.06,127.09,126.06,126.97,128.55,127.33,125.94,125.76,123.94,122.06,123.52,124.97,129.39,129.7,132.85,135.21,135.21,136.06,136.06,137.94,137.94,142.48,142.48,138.18,137.88,138.85,139.7,140.55,140.42,139.21,135.52,136.67,136.12,136,138.42,139.64,138.24,135.27,135.45,135.39,139.27,139.21,139.21,137.27,136.85,139.7,137.52,137.58,137.45,138.42,138.12,141.09,145.88,143.88,145.33,144.3,146.3,146.36,144.55,145.27,144.06,143.09,142.42,144.18,145.64,145.03,147.45,148.48,151.15,153.21,152.97,153.45,154.06,153.76,155.15,154.79,154.12,151.52,151.03,150.91,144.73,146.06,147.27,148.48,144.79,144.55,144.18,144.61,140.24,139.09,135.21,136.36,136.36,140,142.55,142.12,141.94,142.42,143.88,144,142.48,139.7,139.64,140,140.36,140.85,139.52,141.7,142.42,145.82,148.73,150.91,150.3,150.36,152.42,152.73,159.03,157.94,158.24,160,160,162.48,162.48,156.61,155.33,155.39,155.39,155.39,155.39,155.39,155.39,155.39,160,165.58,166.06,163.64,163.39,166.06,165.94,160.55,163.15,164.55,163.76,163.33,158.79,160.85,163.76,166.91,173.39,172.91,170.85,170.85,170,172,170.73,170.91,170.85,169.45,167.7,169.03,169.15,167.27,167.52,169.58,167.58,168.06,159.52,161.45,159.39,153.94,154.06,155.58,155.33,151.58,153.76,157.58,156.91,157.88,155.52,154.73,153.39,155.15,156.24,156.24,148.91,150.61,150.61,146.06,149.58,154.42,154.42,154.61,156.42,154.79,157.94,157.64,152.73,148,146.18,146.06,147.09,151.52,150.36,151.21,149.45,146.18,148.97,149.52,152.3,153.88,155.21,150.91,151.21,150.97,144.55,145.21,143.7,138.79,139.39,135.45,138.55,144.06,148.48,148.48,148.48,146.61,143.64,143.27,141.7,143.09,143.58,143.58,142.61,142.61,139.45,136.97,142.48,147.33,149.09,150.73,150.73,156.55,156.85,156.18,154.97,153.76,155.15,154.73,156.91,150.67,152.36,151.45,147.58,148.61,149.15,147.09,145.82,142.18,147.7,146.67,149.09,148.12,148.06,148.48,150.91,152.55,151.45,155.64,159.94,156.42,157.27,152.91,152.73,158,160.61,160.61,160.61,160.61,160.61,157.27,157.27,159.39,154.24,156.36,155.45,151.82,149.09,151.06,149.7,150,151.52,151.52,156.97,155.76,159.7,158.48,155.45,150,153.64,155.45,154.85,155.45,155.45,153.33,150.45,151.21,149.7,149.7,146.06,144.39,141.21,142.42,142.42,142.58,143.18,141.36,142.42,145.3,141.82,141.36,138.03,139.85,140.15,139.24,136.06,138.18,140.3,139.39,137.88,140.91,139.55,138.94,141.06,142.12,143.79,140.91,139.85,139.85,142.12,142.12,140.91,140.15,141.06,138.03,138.64,138.79,141.52,141.82,142.12,137.58,136.52,136.82,136.82,134.09,133.64,132.88,135.76,139.7,140,139.85,140.3,141.06,141.82,144.39,146.82,143.79,144.39,141.21,139.7,136.06,137.88,136.52,135,133.48,138.94,136.82,137.88,139.85,143.18,143.64,143.64,143.64,143.64,143.94,140.76,140.45,138.48,138.48,135.45,135.45,136.21,136.21,137.27,130.61,133.33,132.73,132.12,133.79,133.48,133.03,131.97,130.45,128.94,124.24,124.24,125.45,128.33,128.48,127.73,133.79,132.73,132.58,133.33,133.48,134.24,136.97,134.85,133.64,134.09,133.33,132.27,129.7,127.58,128.64,128.48,129.09,130.45,130.76,130.76,126.82,131.06,127.73,125.61,122.73,124.09,121.82,121.97,122.58,121.21,118.03,118.64,117.88,118.48,117.12,117.12,117.58,117.58,116.21,115.91,117.27,117.27,117.42,113.94,113.48,117.42,115.45,120,120.61,122.73,121.36,124.55,125.61,127.12,128.18,129.55,127.73,127.27,130.45,135.61,136.52,137.88,140.61,139.85,140.45,140.45,140.45,140.45,140,135.76,136.36,139.55,140,143.94,139.55,140,139.24,142.12,142.27,142.88,143.48,141.67,141.67,136.67,136.67,135.91,134.09,133.33,134.7,132.73,132.27,135.3,132.88,132.88,133.94,132.42,133.03,133.48,138.94,141.06,137.88,137.12,137.42,135.91,135.3,136.52,138.64,141.21,142.27,141.97,141.36,141.36,141.52,140.15,141.97,142.58,143.18,142.58,138.18,137.27,137.42,136.97,135.61,135.3,135.91,139.85,138.94,138.94,139.09,137.27,137.27,135.91,134.09,128.64,130,129.24,129.24,128.94,125.91,124.85,127.27,130.76,131.82,132.88,129.39,129.24,128.94,126.67,128.94,128.79,132.73,131.67,133.03,133.03,133.94,135.76,135.91,135.15,132.58,133.33,133.03,134.39,137.42,137.88,138.48,137.88,138.18,138.48,140.91,142.42,141.21,140.15,137.58,139.39,138.33,134.55,136.67,138.03,140,140.3,140.76,141.97,139.55,139.7,141.82,143.03,143.33,140.61,143.03,142.88,139.7,141.06,137.42,136.97,136.21,133.18,131.82,130.91,129.24,130.76,132.42,130.3,132.42,132.42,133.03,132.12,134.7,134.85,133.48,133.18,132.12,133.48,133.79,131.52,133.33,132.73,131.06,133.64,138.48,140.3,142.12,142.42,142.88,142.88,142.88,142.73,142.12,144.55,148.94,149.09,149.39,150,148.18,149.09,146.67,148.64,148.03,144.24,144.24,145.45,144.7,148.18,148.18,147.12,148.94,151.52,151.82,153.64,153.03,151.21,152.42,155.15,155.15,153.64,154.24,155.45,154.85,152.73,152.73,155.15,158.48,159.7,161.52,160.3,157.88,156.36,159.39,159.09,160,162.73,162.12,162.12,157.58,154.55,156.36,156.97,156.97,158.18,155.45,152.42,152.73,151.21,149.85,150,152.73,155.15,156.06,157.27,161.52,165.76,165.76,171.82,170.61,169.7,169.7,168.18,166.67,166.67,167.88,171.21,169.09,169.09,167.27,168.18,168.18,169.09,172.12,177.58,180.3,181.82,181.82,178.79,183.94,185.76,189.09,186.06,188.79,184.24,184.24,184.24,178.18,179.09,173.33,170.91,173.33,178.48,180.3,185.15,183.03,180.91,181.52,183.33,183.94,187.27,186.36,181.21,182.42,181.82,179.39,172.12,175.45,171.21,169.39,164.24,166.67,167.88,173.94,175.15,171.21,171.21,165.45,157.88,157.88,151.36,148.18,143.33,138.18,130.15,137.58,128.79,142.27,147.42,144.85,146.36,145,144.7,138.79,141.82,142.42,147.58,150.3,147.27,148.79,149.24,146.36,148.48,148.48,148.48,155.76,151.82,149.24,151.06,151.06,149.55,151.06,151.82,151.52,151.52,151.52,146.97,146.97,149.09,147.88,147.88,146.67,145.15,147.12,145.45,145,147.88,152.42,151.52,151.36,147.73,148.03,149.24,151.21,152.73,153.64,155.15,155.76,165.15,165.45,168.18,166.36,168.18,167.88,164.55,158.48,151.21,157.88,158.18,158.48,160.3,157.58,155.76,160.3,157.27,161.52,158.79,160,159.39,160.3,162.42,166.67,161.82,160.61,160,159.7,161.82,163.03,165.76,163.03,164.85,164.24,167.58,165.76,163.94,164.24,168.48,177.58,178.79,178.79,175.45,172.12,173.64,172.42,175.76,174.24,175.15,176.36,178.79,177.88,175.76,175.76,176.97,175.15,167.88,169.39,170,170.91,170.91,168.48,167.88,163.64,164.24,164.85,170.91,168.48,171.21,177.88,176.97,179.39,178.79,183.03,184.85,184.85,180.3,179.7,179.39,176.36,177.58,175.15,175.45,176.36,176.36,176.36,176.36,176.36,177.88,178.79,181.52,180.91,180.91,183.03,184.55,184.55,181.82,180.3,181.82,184.55,184.55,182.12,182.42,183.03,181.21,178.79,176.06,171.52,173.94,178.18,177.27,182.73,182.12,182.42,182.42,185.76,184.85,191.52,200.91,199.09,196.36,195.76,196.06,204.55,205.15,201.82,206.06,206.67,202.12,205.45,210.61,211.21,216.67,220.91,217.27,223.94,220.91,222.42,223.64,223.64,223.64,222.12,221.21,221.21,219.09,223.94,235.76,235.76,238.48,237.27,245.45,245.45,251.52,254.24,249.09,251.21,269.09,275.76,274.55,271.82,271.82,266.67,257.58,263.64,264.24,266.97,263.03,270.91,262.73,259.39,253.64,248.48,251.52,255.76,256.36,250,253.03,251.52,250.61,247.27,247.27,247.27,255.15,257.27,252.12,248.79,250.3,249.09,248.48,248.48,258.48,250,250,253.33,254.55,249.7,248.79,248.48,246.67,245.15,248.48,250.91,247.88,250.91,249.39,251.21,248.18,248.48,247.88,245.45,246.06,246.97,247.27,249.09,246.67,251.21,256.97,258.79,260.61,259.39,256.67,253.33,252.12,254.55,254.55,254.85,254.24,252.42,254.24,250.3,249.7,250.91,253.03,251.21,248.79,247.58,246.97,247.58,250.3,250.3,249.39,248.18,252.12,246.06,242.42,237.88,242.73,241.21,241.21,241.21,240.91,242.73,241.52,242.12,241.82,241.21,242.73,243.94,244.24,244.85,250.91,249.09,248.18,248.18,245.76,245.45,245.45,243.94,245.15,247.88,245.15,243.94,242.12,242.42,242.73,246.06,247.27,248.18,245.45,244.55,242.73,242.42,243.64,246.06,244.85,242.12,240.61,241.52,241.82,240.91,244.24,241.82,239.39,239.39,237.88,241.52,240.3,238.79,237.88,240,239.39,237.88,240.3,246.67,251.21,248.79,246.97,246.97,243.03,237.88,233.33,225.45,225.45,224.85,223.94,221.52,220.3,222.12,229.09,229.39,226.06,225.15,226.06,232.42,232.73,230.3,232.12,234.24,230.61,231.21,228.18,228.18,231.21,232.12,233.33,230.61,233.94,233.94,233.94,233.94,234.55,234.24,235.45,231.21,224.55,224.55,221.82,221.82,218.79,216.06,216.97,216.67,216.67,209.09,208.48,210.3,212.42,212.73,213.94,213.03,212.73,213.33,212.73,215.45,212.42,214.24,211.52,211.82,216.67,213.33,213.94,212.73,213.94,213.64,212.73,211.82,213.94,216.36,216.06,214.24,212.73,215.76,226.97,228.18,226.67,223.33,219.09,219.09,216.06,225.45,229.7,229.09,231.21,234.55,234.55,236.97,233.03,232.73,233.33,235.15,235.76,236.36,233.64,236.67,240.61,242.12,243.94,243.03,243.33,238.79,237.27,237.27,237.27,238.48,234.55,233.03,237.27,236.36,239.09,239.09,236.06,234.24,234.85,233.33,231.21,231.82,229.09,227.58,224.24,224.24,216.06,222.12,222.12,222.12,222.12,222.12,224.24,221.21,221.21,221.21,228.48,226.97,223.33,223.33,226.67,227.27,225.15,225.15,225.15,225.15,216.67,217.88,217.88,217.88,217.27,220.91,220.91,212.42,210.61,210.61,210.61,212.12,212.73,212.73,213.33,213.33,214.24,211.82,213.03,213.64,211.52,211.52,211.21,212.73,211.82,210.91,209.39,210,209.7,207.58,206.06,205.45,205.76,203.03,208.18,204.55,201.82,202.12,203.94,204.24,205.15,203.03,200.91,200.3,196.97,196.36,204.24,203.94,204.55,205.76,205.76,201.52,201.52,199.09,199.09,196.67,201.52,200.91,204.85,206.36,204.55,206.06,205.76,201.52,201.21,199.7,201.52,205.15,204.24,204.24,202.12,202.42,202.42,198.48,197.88,197.58,193.33,188.18,187.58,183.94,184.55,181.21,177.88,177.27,174.55,173.94,176.97,178.18,180,175.76,172.73,170.3,173.03,173.33,170.91,176.36,177.88,178.18,176.06,175.76,174.24,181.82,187.58,184.55,183.33,187.27,185.76,185.15,186.97,187.27,187.58,186.06,185.76,186.97,185.76,186.36,186.36,184.24,181.82,179.09,181.52,182.42,182.42,184.85,183.03,186.36,184.55,181.82,179.09,178.79,180.91,181.82,177.58,178.18,180.91,176.97,174.24,173.03,173.03,169.7,168.48,168.48,168.48,176.06,172.12,169.7,170.3,170.91,169.09,167.58,164.85,165.15,163.33,164.24,160.3,159.39,160.91,160.91,167.27,169.7,170.61,170.3,170.3,167.88,169.09,167.27,170.61,171.52,171.21,169.09,168.18,169.39,174.24,174.85,180,180.3,173.64,180,181.82,180.61,179.39,180,182.42,187.27,187.88,183.03,190.61,187.58,189.09,190,186.06,187.27,186.06,183.64,184.85,186.06,184.85,182.12,183.64,188.48,189.7,183.03,182.73,179.39,178.48,179.39,183.03,180.3,180.91,183.33,179.7,180.3,180.3,177.58,175.76,179.09,176.06,175.45,176.06,171.52,167.58,167.58,168.18,167.88,175.15,176.36,178.79,183.94,183.03,183.33,183.33,184.24,185.15,184.85,183.03,186.36,187.27,187.27,187.27,191.82,193.33,195.76,191.82,186.06,184.85,192.42,192.42,186.67,187.88,191.21,191.82,190.61,190.61,191.52,188.48,193.03,189.7,190,188.18,185.15,187.88,185.76,183.33,183.64,183.64,184.24,183.33,186.36,183.94,182.73,182.12,180.3,181.82,178.79,181.21,181.52,185.76,182.42,182.73,185.15,188.79,190.91,188.18,190.61,190,191.52,193.94,191.21,192.73,193.64,188.79,196.97,199.09,199.7,200,200.3,197.27,197.88,198.79,198.48,197.88,199.09,197.58,192.73,194.24,195.76,198.48,198.48,199.09,198.18,197.27,197.27,199.7,197.88,195.76,194.55,194.24,195.45,198.18,196.97,200.61,207.27,207.58,207.27,207.58,208.48,213.03,213.03,219.09,216.36,214.85,218.79,217.27,217.27,215.15,214.85,218.18,215.15,218.18,217.88,216.67,217.58,215.76,216.36,213.64,216.06,216.97,219.39,220,220.3,219.39,218.79,221.21,221.21,218.18,216.97,211.82,210.61,216.67,217.88,217.88,222.42,222.12,218.18,217.27,215.15,213.03,213.33,212.12,211.52,217.27,213.94,211.52,215.45,211.82,208.48,206.97,207.58,204.85,208.79,206.06,204.55,203.94,203.94,203.03,202.12,200.91,201.82,201.82,203.33,206.67,203.33,202.42,202.42,203.33,202.73,215.15,215.76,214.24,212.12,213.33,213.03,214.55,213.64,214.85,217.27,218.18,212.73,211.52,210.91,208.79,208.48,210.3,207.88,207.27,207.27,207.27,207.27,207.27,204.55,202.12,200,200,201.21,206.67,208.79,206.06,203.94,210.3,213.64,210.61,208.48,207.27,207.58,206.06,202.12,203.94,203.94,202.73,207.88,211.21,210.91,214.85,214.85,211.82,213.03,213.64,213.33,214.55,218.79,220.61,219.7,220.3,220.61,220.61,219.39,217.27,216.06,220.3,220.3,220.61,218.18,220,215.76,217.27,216.67,220,221.21,222.73,220.61,221.52,222.12,220.91,222.42,226.67,227.27,230,230,232.12,236.36,237.88,237.88,241.21,233.33,232.12,232.12,231.82,226.36,223.03,221.82,221.52,223.94,220,215.15,217.27,226.36,227.58,227.88,224.24,224.55,222.42,225.45,225.15,220.3,223.03,227.88,225.15,225.45,227.27,224.55,224.55,224.55,227.88,224.24,221.82,220.61,223.64,222.12,221.21,221.52,220.91,220.61,220.91,221.82,222.42,222.42,226.97,223.33,220.91,218.79,222.12,219.39,222.12,224.55,225.15,219.09,220.61,220.61,233.03,240.3,239.09,236.97,242.12,241.82,244.85,249.7,248.48,257.58,254.85,258.48,256.06,256.06,253.33,253.33,254.85,253.64,249.09,242.42,239.09,241.21,235.15,230.61,228.79,238.18,231.21,232.42,232.42,234.85,234.85,236.36,235.15,235.15,246.36,246.36,241.52,240,237.58,237.27,237.27,236.97,234.55,239.09,237.58,235.45,237.27,230,233.94,235.15,227.88,222.73,222.73,229.39,228.18,234.55,234.55,234.24,229.39,227.88,231.82,238.18,241.21,236.67,241.82,246.06,247.27,242.42,244.24,244.85,246.36,247.27,246.97,247.88,247.88,247.88,256.36,263.94,264.85,266.06,266.06,265.45,255.76,262.73,265.76,262.73,263.33,255.76,251.52,254.24,248.48,243.64,245.15,246.06,245.45,254.24,251.82,241.21,216.36,219.7,226.36,222.42,226.36,228.79,230.61,233.94,233.94,243.03,237.27,239.09,237.27,237.27,235.45,230.61,229.7,231.52,224.24,225.15,225.45,219.7,212.12,209.09,208.79,204.55,200.61,196.67,200.91,195.15,195.15,195.15,195.15,191.21,190.91,189.7,191.52,188.48,196.06,194.55,186.36,186.36,185.76,185.76,183.64,184.85,182.73,182.73,178.48,179.7,179.7,184.85,180.3,180.91,179.39,178.79,174.85,179.09,171.52,169.39,176.06,180.61,179.09,179.39,176.67,177.88,174.55,173.64,173.64,172.73,166.67,160.61,153.33,151.21,162.12,171.82,170.61,167.58,170.91,169.7,175.45,176.67,170.61,168.18,164.24,162.42,162.42,160.91,162.73,163.94,161.82,163.64,163.64,169.39,170,168.48,164.24,166.36,160.91,160.61,162.12,164.85,164.85,162.42,162.73,161.21,161.21,161.82,164.85,169.39,167.88,173.64,170,167.58,163.94,163.33,162.73,164.55,162.73,161.82,162.12,164.55,162.73,162.73,162.73,162.73,162.73,162.73,158.79,154.55,159.7,160.3,163.64,162.73,168.48,168.79,169.09,169.09,169.7,169.7,172.42,177.88,176.97,176.36,173.64,173.33,171.52,170.61,165.15,165.15,165.15,163.64,164.55,162.73,162.73,162.42,166.36,165.76,165.76,174.55,174.55,177.27,182.42,186.97,183.33,181.21,186.06,187.27,182.42,175.15,178.18,178.18,174.55,170,161.21,162.12,160.61,170.91,167.27,170.3,171.52,165.76,166.97,167.58,167.88,166.67,168.79,168.79,168.79,169.09,169.09,168.18,168.18,164.55,164.55,164.55,165.45,165.45,166.06,174.55,172.42,173.94,173.64,172.12,169.09,169.39,168.79,165.76,164.24,165.76,163.33,169.39,170,170.3,172.12,172.12,175.15,179.09,179.09,181.21,179.39,181.52,180.3,176.67,173.33,176.06,181.21,179.39,180.3,175.76,183.33,185.76,182.42,184.24,181.21,182.42,184.24,193.33,191.82,186.97,186.06,183.03,184.85,189.7,189.39,193.03,196.06,202.12,203.33,205.45,200,201.21,200,199.7,213.33,213.94,220,216.36,208.79,211.21,211.82,208.48,213.64,217.58,215.15,215.45,217.88,216.97,216.97,212.12,212.12,213.64,213.94,216.36,216.67,213.03,213.94,210.91,211.21,204.85,209.39,211.52,212.42,210.61,212.42,216.67,220,222.42,228.48,231.82,240.61,236.97,243.33,243.33,253.03,256.67,258.79,260.91,252.42,255.15,254.24,260.61,271.97,271.97,271.97,271.97,271.97,271.97,286.06,282.73,277.58,287.88,296.06,296.67,297.27,295.45,298.79,292.42,299.39,309.09,301.52,304.55,315.45,325.76,336.67,317.88,304.85,300.61,296.67,304.85,313.64,312.42,311.52,294.55,304.85,296.36,292.42,304.85,287.27,293.03,300.91,311.52,313.64,304.55,305.45,313.33,316.67,318.48,328.48,331.82,328.48,327.27,325.15,330,317.58,311.52,326.97,326.06,322.12,334.85,337.88,336.67,336.67,354.55,362.12,363.33,363.33,389.39,418.48,420.91,427.27,420.61,421.21,420.61,416.97,425.15,436.06,451.21,452.42,440,453.03,461.52,460.91,460.91,483.33,492.12,486.97,486.36,455.76,507.58,512.42,482.73,480.61,504.24,502.42,508.48,541.21,549.09,549.09,549.09,549.09,575.76,576.06,584.85,606.06,616.67,660.61,656.06,656.06,591.21,521.82,580.61,570.3,525.76,569.39,575.76,569.39,556.06,571.82,587.58,631.82,607.58,604.24,564.55,574.85,572.73,545.76,545.76,534.24,506.67,574.7,540.61,564.24,585.15,595.45,637.88,618.18,624.24,609.09,625.76,639.39,659.09,654.55,650,663.64,659.09,680.3,665.15,680.3,672.73,684.85,668.18,668.18,704.55,704.55,806.06,822.73,813.64,865.15,845.45,860.61,896.97,819.7,851.52,834.85,836.36,907.58,886.36,886.36,906.06,930.3,907.58,960.61,1057.58,1092.42,1092.42,1065.15,996.97,895.45,975.76,916.67,906.06,977.27,1021.21,1039.39,1050,1098.48,1072.73,1071.21,939.39,1031.82,1086.36,1028.79,978.79,1012.12,953.03,866.67,937.88,963.64,896.97,840.91,842.42,863.64,771.21,796.97,846.97,772.73,772.73,739.39,784.85,789.39,818.18,756.06,769.7,666.67,631.82,627.27,795.45,725.76,727.27,745.45,698.48,700,696.97,725.76,774.24,812.12,831.82,831.82,813.64,750,821.21,853.03,778.79,778.79,792.42,806.06,778.79,787.88,790.91,759.09,757.58,774.24,818.18,816.67,816.67,815.15,786.36,754.55,753.03,768.18,765.15,790.91,830.3,837.88,865.15,865.15,865.15,818.18,825.76,813.64,836.36,836.36,836.36,824.24,813.64,793.94,793.94,759.09,703.03,703.03,636.36,653.03,660.61,640.91,677.27,650,653.03,645.45,672.73,733.33,703.03,681.82,693.94,665.15,660.61,610.61,571.82,575.45,602.73,624.24,630.3,624.24,596.36,576.67,590,596.67,554.85,537.88,573.94,517.27],"엔비디아":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.95,99.03,97.92,93.08,93.94,97.58,99.18,100.97,99.28,97.51,95.15,96.82,102.43,104.83,106.64,107.93,111.69,112.39,113.75,116.59,116.59,124.6,116.03,118.34,113.36,113.36,108.34,110.86,108.05,109.49,113.93,113.07,111.68,109.86,109.84,109.84,107.38,109.34,111.68,110.46,111.61,113.99,114.48,116.45,118.7,116.84,115.95,121.02,122.55,121.47,124.59,126.52,125.97,123.6,120.67,115.1,115.53,115.76,113.9,113.88,113.88,117.96,117.63,106.72,107.75,110.89,107.77,109.17,105.14,104.53,103.73,104.86,104.67,104.65,105.27,108.17,108.09,108.91,110.25,112.65,116.24,112.48,114.77,113.73,114.14,114.96,114.37,114,116.19,115.69,115.1,107.03,106.23,107.01,106.55,103.83,104.21,103.35,101.41,101.41,105.38,105.45,105.86,107.54,107.99,109.34,111.24,110.47,112.19,110.77,113.25,109.9,110.72,110.29,110.3,109.14,109.32,128.81,134.35,135.82,142.64,145.3,135.64,141.32,144.44,147.51,145.53,147.16,146.84,150.64,150.64,153.86,153.3,153.31,152.55,157.19,156.48,158.37,169.86,158.88,159.27,160.79,161.13,161.82,161.02,167.08,166.83,169.36,168.19,163.37,161.59,155.67,161.16,155.78,153.53,147.97,147.97,151.92,152.38,155.86,163.23,165.55,172.59,170.59,175.18,174.44,176.25,175.34,177.89,178.53,176.45,175.61,177.63,171.77,174.59,172.59,174.69,174.59,176.81,177.58,183.04,180.86,182.78,174.96,165.63,178.84,177.34,175.39,171.48,171.52,169.02,172.63,176.08,175.44,173.97,175.2,174.92,175.96,179.95,181.03,181.03,176.2,176.09,176.91,173.84,179.48,180.13,180.94,179.91,191.28,199.18,198.97,197.37,191.97,190.1,181.61,182.63,186.63,186.58,189.86,190.1,190.49,192.09,191.98,192.54,196.89,200.65,202.78,202.88,206.66,210.21,210.01,209.83,210.07,209.11,208.81,211,205.67,207.83,214.38,216.48,219.64,220.05,218.71,221.63,222.63,225.18,222.13,218.05,229.55,225.82,227.46,223,224.73,224.47,227.36,229.45,228.26,228.26,230.42,227.42,223.78,208.6,213.16,209.94,198.24,199.38,201,203.9,203.37,206.73,202.68,197.73,198.04,203.44,210.17,208.27,209.01,208.04,207.38,207.38,209.69,209.4,209.64,205.5,211.71,225.65,226.84,228.76,235.77,235.71,237.55,237.98,236.81,236.81,233.76,238.66,238.36,244.38,248.18,253.73,250.42,251.01,258.42,262.16,257.77,261.05,255.42,248,226.95,239.57,242.99,231.01,246.47,242.17,247.06,256.39,261.79,258.96,258.96,264.53,256.49,257.17,261.18,261.87,261.32,257.01,246.61,251.21,250.27,257.18,256.84,256.14,260.55,265.25,263.07,264.17,264.8,266.02,255.95,265.06,263.98,256.85,247.42,259.64,239.51,235.08,245.95,245.95,234.76,239.33,240.27,235.11,227.54,228.77,242.05,240.27,249.15,245.86,245.85,252.27,251.03,243.25,242.9,237.77,234.92,230.1,239.19,240.37,238.85,241.23,240.35,247.44,253.89,264.1,265.93,271.64,276.26,270.32,271.2,260.79,261.27,263.07,261.19,259.39,257.75,262.89,263.05,264.74,264.74,264.01,268.68,267.83,273.6,281.28,281.51,281.6,279.21,278.55,276.78,278.87,278.67,283.46,281.71,281.53,276.31,278.58,273.06,266.51,253.95,257,250.34,255.8,251.59,257.26,251.53,251.53,257.78,262.67,264.71,268.96,262.88,266.81,264.78,263.59,269.42,267.31,267.66,266.45,264.88,264.14,267.49,270.65,267.65,259.27,260.05,261.76,266.16,267.74,269.79,272.89,274.45,272.37,270.59,272.01,277.64,275.15,273.41,260,263.21,269.03,279.12,283.39,289.1,293.01,291.4,295.76,295.04,298.09,298.09,301.3,295.69,289.63,288.72,291.77,289.72,284.83,288.17,293.57,290.92,287.83,288.85,282.8,279.79,282.18,285.06,283.47,283.98,298.45,307.31,304.25,304.51,296.61,286.6,282.25,282.01,260.93,249.71,261.83,249.98,261.08,258.14,254.39,243.38,245.56,234.77,211.78,220.73,210.59,197.13,215.59,223.91,231.64,228.25,224.9,224.15,227.05,218.77,218.43,201.3,211.67,209.42,214.94,174.63,153.67,158.33,153.69,153.69,153.99,162.54,163.26,170,167.12,173.57,180.59,166.85,166.85,168.11,156.77,161.28,157.38,158.14,158.12,155.53,152.49,156.05,147.1,143.48,137.61,134.96,134.96,141.36,139.31,141.94,141.78,144.67,135.93,144.64,152.29,148.5,151.42,154.24,158.06,159.77,159.17,158.07,161.13,166.66,166.66,158,158.55,167.63,170.08,146.57,139.76,145.91,152.67,153.71,158.43,159.25,162.49,156.56,157.36,155.53,160.55,162.36,164.11,167.1,167.1,166.36,168.38,165.43,169.06,168.53,166.84,165.05,163.83,166.15,166.5,166.23,161.48,158.52,159.98,171.13,172.6,179.08,175.83,180.34,179.43,186.61,185.22,195.35,188.51,184.56,187.84,187.45,188.24,190.7,193.59,194.35,200.32,199.94,202.79,203.69,201,204.01,203.42,201.79,196.16,199.88,198.91,197.85,197.85,200.16,202.5,203.03,198.5,189.14,190.45,192.23,191.66,194.55,194.36,191,183.85,184.71,180.75,179.29,168.28,172.09,169.48,170.13,166.24,161.16,164.68,161.64,156.46,154.15,154.15,152.22,149.04,147.74,143.86,142.08,151.87,150.04,152.7,154.52,157.64,160.1,155.27,157.46,153.61,154.03,162.36,162.62,163.66,161.17,162.13,160.88,169.14,173.35,174.42,176.48,172.29,172.84,172.84,170.17,166.96,167.07,169.99,176.59,178.01,177.64,177.44,180.24,180.73,178.89,181.95,186.55,189.74,184.13,185.93,185.66,186.33,179.18,175.15,171.19,160.14,161.8,163.43,168.08,163.74,160.84,165.73,159.38,158,169.46,181.37,178.28,181.85,182.12,172.51,175.71,171.84,171.22,177.36,177.9,177.9,174.35,179.23,190.89,189.73,191.69,194.54,195.76,195.7,193.22,191.39,192.3,191.14,187.91,183.4,185.68,183.23,189.28,188.34,182.41,184.87,184.79,183.77,192.56,193.26,195.76,188.22,191.92,194.38,197.53,198.1,208.55,206.26,206.34,202.3,208.17,207.74,207.19,209.07,217.23,219.62,215.51,215.59,213.49,215.16,223.56,222.61,220.51,221.26,220.67,221.09,222.61,221.51,222.8,216.85,225.45,220.89,224.28,223.22,223.97,234.93,230.46,231.78,231.78,230.18,222.23,220.54,222.41,221.69,225.33,225.33,227.25,230.82,237.97,237.88,239.11,242.45,243.74,250.06,254.22,253.63,253.42,253.42,254.03,251.56,246.73,249.89,254.79,250.71,251.76,254.81,255.29,258.09,259.47,267.61,262.62,260.8,264.37,264.74,264.74,263.32,265.62,268.54,266.02,255.1,263.35,260.77,261.06,251.09,255.24,262.46,266.31,270.02,267.19,279.28,284.51,289.44,287.57,307.76,307.76,314.96,334.22,327.85,312.31,290.23,278.3,284.25,268.27,286.82,293.57,282.38,302.16,290.24,282.54,260.66,277.27,261.76,229.73,255.78,208.58,230.75,215.4,226.18,218.51,225.88,264.63,260.85,273.19,268.4,282.06,279.95,258.15,271.31,259.04,285.05,275.1,283.51,279.26,279.26,286.59,301.56,298.26,312.98,310.45,304.85,286.23,303.9,301.62,307.55,315.51,309.43,316.97,310.41,300.32,309.36,311.96,316.26,323.78,331.88,342.63,331.46,330.5,341.14,360.69,371.72,374.07,381.05,372.78,383.44,383.44,370.34,362.16,360.54,377.04,374.1,374.9,372.54,372.41,378.93,374.04,384.28,397.91,373.67,379.46,389.71,385.24,392.35,391.59,393.43,404.7,401.44,392.33,403.14,388.91,390.82,403.47,404.84,408.34,408.34,417.98,419.36,433.98,446.43,445.17,427.03,440.82,434.46,430.53,433.37,446.51,438.76,443.45,430.32,433.07,442.71,433.96,444.58,450.89,450.92,467.73,476.96,479.47,481.54,475.76,474.3,460.92,485.99,486.11,491.25,524.09,520.85,515.65,515.76,538.81,540.37,541.63,542.61,536.46,558.53,568.16,587.13,609.45,552.91,536.21,536.21,506.07,540.14,523.01,516.76,546.82,551.87,531.63,529.46,517.81,531.74,536.86,515.03,524.55,546.89,553.74,561.84,574.79,578.36,554.9,579.55,583.54,593.2,587.88,584.65,604.33,605.28,598.78,593.46,586.72,573.4,579.67,574.54,567.59,577.33,558.25,569.11,536.41,553.27,532.46,534.44,553.08,585.99,601.53,618.61,579.05,542.48,570.01,571.65,564.87,574.14,570.19,570.47,570.95,555.98,558.2,550.46,562.22,562.22,563.35,569.31,568.82,575.38,569.07,575.97,578.03,567.12,549.31,551.07,552.81,565.37,567.57,562.55,566.75,563.81,566.37,564.07,552.64,551.99,551.99,548,549.84,558.44,554.59,557.07,569.45,535.88,566.86,564.01,578.65,572.84,574.84,560.76,546.28,546.28,553.32,567.79,589.1,582.52,580,570.74,548.76,554.42,551.82,562.32,575.9,574.79,580.47,577.36,613.37,605.92,627.2,647.87,635.57,635.57,651.24,633.22,629.95,634.09,609.84,600.76,615.93,565.31,582.6,588.01,569.51,543.96,525.5,529.38,492.49,531.87,529.66,551.98,546.13,560.38,564.62,566.75,540.46,545.7,560.16,555.26,537.09,532.51,545.42,550.05,546.8,567.05,586.74,586.74,594.2,588.85,600.83,608.2,611.72,646.09,666.08,648.98,685.52,675.98,652.58,644.49,652.53,630.85,648.48,657.52,653.43,648.97,651.01,637.62,630.28,609.65,614.21,616.95,629.24,606.02,607.74,584.47,580.51,605.06,601.76,595.4,597.53,620.75,636.86,663.21,664.73,666.95,657.94,690.08,690.08,690.93,712.75,720.89,746.74,748.47,741.59,737.39,740.23,757.23,765.45,755.67,756.6,792.58,791.79,782.81,802.33,809.57,815.87,808.45,848.98,850.75,849.72,858.62,870.31,870.31,879.29,865.41,845.49,851.75,871.39,860.24,842.88,805.7,771.5,797.78,790.65,824.55,832.37,830.84,819.63,815.97,828.5,835.26,828.33,839,841.76,861.26,876.68,865.17,862.15,846.9,836.83,845.58,857.6,847.49,826.59,808.84,841.04,884.28,932.8,925.79,943.63,937.47,961.6,963.81,950.93,953.31,951.4,970.39,970.39,962.7,948.98,942.1,954.89,941.04,944.86,949.07,944.86,930.33,896.9,902.55,932.07,955.06,938.02,920.14,879.31,871.58,880.03,881.14,838.23,868.78,879.35,895.28,884.92,879.14,878.12,889.51,923.79,928.72,944.01,946.9,938.95,963.98,965.42,984.11,1050,1038.7,1059.52,1086.11,1097.15,1121.54,1129.91,1265.97,1263.89,1308.58,1302.34,1251.44,1290.99,1290.99,1275.49,1283.05,1243.03,1345.58,1401.23,1357.52,1348.6,1388.02,1388.02,1338.28,1417.84,1388.11,1335.39,1364.74,1303.87,1276,1377.53,1352,1295.24,1282.84,1196.3,1203.78,1293.93,1205.9,1181.01,1177.53,1235.13,1248.94,1259.13,1259.13,1314.57,1288.11,1274.47,1256.84,1249.41,1279.57,1244.27,1172.64,1197.03,1157.48,1163.98,1181.69,1189.42,1128.93,1144.52,1144.52,1100.38,1064.87,1025.91,992.95,992.86,948.34,967.37,932.2,970.26,1040.19,1046.64,1072.3,1017.33,1033.09,1050.47,1066.61,1134.45,1097.03,1017.37,1030.88,1125.53,1126.21,1041.08,1004.33,1004.33,993.63,951.02,1008.84,1026.21,1035.9,997.32,1028.89,1007.39,974.34,907.05,913.93,977.66,962.53,938.83,906.12,975.91,1040.61,1052.08,1123.75,1135.68,1126.76,1088.95,1195.84,1176.38,1198.77,1217.33,1176.3,1159.13,1134.75,1162.28,1101.57,1036.83,1028.38,982.12,931.05,913.51,943.2,903.06,903.06,925.36,942.99,912.57,857.39,829.01,845.45,798.13,782.29,840.36,787.89,829.78,832.71,863.81,800.51,793.33,720.05,747.45,706.46,687.13,752.17,733.39,772.17,719.54,727.44,709.18,717.84,686.24,721.11,758.33,799.11,799.11,793.2,778.25,832.29,795.24,798.05,803.99,792.18,766.69,721.07,664.7,672.73,702.08,662.74,674.6,674.6,703.74,694.99,689.25,727.53,716.61,678.93,660.24,643.97,616.95,616.95,635.68,642.74,673.66,672.81,643.67,640.7,644.18,653.02,669.58,683.98,721.84,756.46,766.78,735.73,723.19,702.34,755.73,763.98,771.58,783.39,787,802.59,816.27,806.67,755.86,725.83,768.78,762.19,794.77,808.5,802,778.89,797.49,758.24,723.62,729.86,731.61,760.96,690.74,671.24,657.09,641.21,592.06,579.74,579.74,572.01,582.58,594.31,611.17,616.19,557.82,557.69,549.24,560.66,568.48,559.73,563.34,533.6,531.69,519.46,527.32,541.04,519.12,515.68,531.52,559.35,561.13,557.77,513,495.75,492.18,488.53,508.07,476.93,505.01,508.37,511.94,518.01,529.57,535.22,563.34,547.83,559.73,587.68,573.36,575.32,561.55,570.14,601.36,607.52,620.31,585.22,669.07,693.59,692.23,707.99,675.87,665.97,654.59,650.68,681.31,701.74,701.74,691.16,672.34,664.36,718.9,727.91,716.91,705.61,679.14,684.79,729.35,722.22,744.9,767.71,750.81,720.14,703.95,690.48,683.3,700.98,651.61,645.96,645.96,599.87,596.26,620.35,620.82,620.82,608.11,626.55,605.99,631.22,663.89,675.83,679.74,701.4,717.88,717.88,752,738.19,712.19,757.82,815.34,818.39,820.86,841.21,865.12,814.02,829.95,889.68,922.22,896.35,895.88,941.93,943.29,948.9,903.36,925.57,975.83,967.03,934.66,908.58,908.58,877.44,881.65,1005.27,989.21,998.34,986.24,964.23,990.4,1014.87,1000.59,989.29,1027.23,995.58,975.57,975.62,1022.22,1029.23,1085,1092.82,1100.25,1112.96,1124.38,1155.1,1137.6,1127.06,1121.92,1146.3,1163.25,1179.99,1187.98,1166.23,1141.93,1148.56,1148.56,1171.58,1154.16,1125.53,1124.17,1136.7,1147.07,1175.32,1186.53,1151.4,1152.04,1148.77,1114.74,1145.11,1156.58,1178.8,1228.12,1198.39,1181.05,1170.86,1218.35,1238.36,1213.72,1227.06,1214.02,1203.91,1229.95,1240.99,1281.99,1345.71,1328.12,1324.38,1303.65,1297.28,1613.42,1654.46,1654.46,1703.95,1607.22,1689.46,1670.65,1664.02,1642.06,1591.97,1635.94,1646.98,1677.23,1742.65,1826.55,1811.94,1813.59,1813.59,1861,1828.59,1827.74,1793.08,1726.08,1778.93,1746.69,1734.15,1797.03,1801.74,1801.74,1797.66,1788.57,1805.56,1791.84,1801.4,1865,1953.14,1931.56,1973.7,2017.59,1999.87,1933.73,1882.29,1895.16,1940.48,1930.84,1949.87,1985.98,1985.09,1975.66,1880.59,1891.04,1898.05,1929.35,1897.37,1807.73,1800.68,1735.56,1858.67,1866.61,1847.32,1841.29,1839.38,1995.2,1940.02,2001.53,2003.53,1954.89,1989.59,2072.39,2092.78,2096.64,2060.71,2060.71,2062.36,1999.19,1964.36,1935.94,1919.2,1906.12,1932.24,1936.32,1864.91,1867.71,1848.77,1794.35,1742.44,1767.63,1793.63,1780.42,1804.08,1830.46,1847.88,1902.38,1848.64,1870.9,1898.39,1944.01,1923.24,1945.54,1988.36,1994.26,1931.22,1958.16,1866.52,1792.52,1788.49,1758.16,1825.62,1854.84,1774.81,1713.08,1720.48,1748.56,1732.37,1798,1848.17,1911.85,1943.54,1952.21,1978.5,1994.48,2053.31,2065.42,2109.43,2076.81,2101.95,2094.22,2141.42,2121.67,2069.5,2069.5,2029.57,2049.36,2031.48,2045.03,1986.83,1986.62,1933.3,1978.16,1933.01,1979.44,2018.1,1980.76,2024.51,2042.82,2053.95,2076.89,2127.32,2107.22,2043.8,2081.14,2074.34,2074.34,2093.42,2099.28,2103.74,2103.74,2046.22,2020.77,2039,2085.68,2219.75,2257.43,2308.84,2328.89,2324.13,2324.13,2395.16,2381.18,2425.96,2527.23,2534.15,2543.46,2606.71,2617.54,2592.65,2653.57,2666.69,2613.72,2677.44,2810.54,2945.28,2898.17,2977.87,2958.41,3064.27,3069.16,3064.06,3139.34,3086.58,3084.66,3084.66,2950.38,2866.27,3336.36,3348.22,3359.9,3343.29,3299.19,3360.75,3495.28,3620.94,3651.83,3768.05,3936.66,3718.27,3643.76,3904.55,3861,3735.94,3731.39,3757.65,3797.71,3839.08,3884.24,4005.48,4035.77,3932.07,3833.9,3838.4,3838.4,3838.7,3800,3779.27,3649.32,3738.66,3701.49,3625.91,3697.49,3849.45,3746.22,3653.4,3713.47,3569.88,3596.9,3237.04,3377.99,3501.4,3384.75,3510.28,3727.06,3727.99,3670.43,3527.65,3645.58,3771.84,3914.19,3846.81,3840.78,3770.05,3818.1,3840.23,3880.88,4019.97,4008.45,3928.59,4026.34,4052.08,4033.56,4409.47,4522.9,4522.9,4838.61,4877.87,4694.14,4657.31,4885.3,4946.35,5201.36,5140.1,5135.43,5173.75,5136.36,5318.61,5505.95,5602.38,5564.15,5759.56,5759.56,5555.65,5376.81,5017.42,5356.41,5369.58,5267.2,5248.09,5280.37,5211.13,5449.45,5449.45,5345.37,5446.05,5581.14,5731.1,5412.06,5490.23,5456.24,5367.88,5012.32,5144.01,5009.77,5248.09,5207.73,4853.44,4769.75,4802.89,4740.44,4406.54,4971.11,4639.34,4556.92,4267.2,4428.63,4201.78,4459.22,4449.87,4631.27,4933.73,5016.14,5219.2,5292.27,5522.51,5405.69,5458.79,5256.58,5495.75,5372.13,5450.3,5336.02,4995.33,5070.94,5070.94,4587.94,4511.89,4554.38,4368.31,4522.94,4592.18,4966.44,5061.17,5059.47,4960.92,4910.36,4816.06,5007.22,4927.78,4938.83,5134.66,5246.81,5269.33,5157.18,5158.88,4970.26,5048.85,5218.78,5306.71,5425.66,5645.28,5635.09,5726.85,5726.42,5865.34,5590.48,5765.51,5816.91,5862.36,6104.93,6099.83,5928.63,5964.74,6012.74,5969.41,6000.42,5919.29,5639.76,5751.91,5779.52,5943.5,6185.64,6324.55,6271.45,6170.77,6299.49,6213.68,6234.49,6031.44,5953.7,6245.11,6197.54,6230.67,6030.16,5778.25,5816.48,5749.36,5749.36,5872.98,5889.12,5958.37,6165.68,6162.28,6050.98,5896.77,5737.89,5918.01,5834.32,5703.06,5607.48,5539.08,5476.21,5551.4,5722.17,5933.3,5956.67,5956.67,5944.35,5820.31,5840.7,5704.76,5875.53,6137.21,6347.92,5953.27,5952,5952,5773.58,5659.73,5597.28,5787.6,5674.17,5850.04,5850.04,5982.58,6247.66,6254.04,6058.62,5030.59,5479.61,5254.88,5295.24,5100.68,4955.82,5040.36,5302.89,5466.44,5515.72,5674.17,5641.46,5570.94,5747.24,5898.47,5898.47,5921.83,5914.61,5952,5710.7,5534.41,5379.35,5576.89,5104.08,5306.71,4845.37,4927.36,4983.01,4697.11,4787.17,4544.6,4620.22,4916.74,4909.94,5168.65,5077.74,4903.57,4992.35,5035.26,5000,5157.6,5127.02,4832.63,4733.64,4658.88,4604.08,4679.27,4690.74,4324.55,4006.37,4147.83,4090.91,4856.84,4569.67,4712.4,4703.06,4766.35,4438.83,4311.38,4311.38,4116.82,4200.93,4363.21,4521.24,4715.8,4618.95,4631.27,4627.02,4741.29,4864.06,4835.17,4823.28,4972.81,4985.98,4955.39,5225.15,5519.54,5749.36,5727.7,5751.91,5759.13,5708.58,5598.98,5642.74,5577.31,5577.31,5756.16,5726.85,5912.91,5740.44,5836.02,5999.15,6028.89,5946.9,6020.39,6059.05,6115.55,6067.54,6159.73,6031.01,6146.56,6122.34,6180.12,6180.12,6110.88,6124.47,6282.92,6555.22,6585.39,6701.36,6711.55,6512.32,6680.12,6768.9,6768.9,6722.17,6796.94,6919.29,6971.11,7005.95,6969.84,7251.49,7279.95,7349.19,7324.13,7280.37,7095.58,7254.88,7380.63,7370.43,7508.5,7455.82,7615.55,7556.07,7379.78,7646.56,7572.64,7621.92,7679.27,7761.26,7734.07,7780.8,7714.1,7732.37,7665.68,7731.95,7461.34,7451.15,7433.3,7561.17,7638.49,7721.75,7714.53,7653.78,7399.32,7399.32,7254.88,7248.09,7292.27,7095.16,7149.96,7254.04,7533.13,7526.34,7553.95,7550.98,7429.06,7234.07,7486.83,7505.1,7799.91,7579.86,7517.84,7548.43,7569.67,7725.15,7926.08,7954.12,8024.21,7970.26,7881.9,7860.66,8033.56,8180.54,7780.8,8000,7647.83,7639.34,7723.45,7783.35,7758.71,7695.84,7658.45,7738.32,7912.49,8134.66,8539.93,8795.24,8618.95,8601.95,8788.45,8440.53,8292.69,7989.8,7992.78,8455.82,8205.61,8232.8,7937.98,8078.59,7926.93,7704.33,7923.53,7673.75,7598.98,7754.89,7553.95,7657.6,7657.6,7519.12,7643.16,7708.58,7629.14,7790.14,7748.94,7882.33,7857.69,7807.14,7686.07,7435,7488.95,7549.7,7261.68,7397.62,7688.62,7803.31,8037.81,8012.32,8012.32,8093.88,7995.75,7966.86,7922.68,8022.51,7991.5,7954.12,8033.56,7860.66,7853.02,7856.41,7893.37,7779.95,7946.05,7911.21,7911.21,7564.57,7787.6,7852.17,7972.39,7921.41,8008.5,8135.94,8177.99,8119.37,7884.88,7661,7399.74,7301.61,7876.38,8073.07,8009.35,8073.49,7941.38,7765.93,7765.93,7857.69,7985.56,7982.16,8063.72,8137.21,8192.44,8307.56,7854.29,7527.19,7751.91,7648.68,7775.7,7788.44,7553.95,7759.13,7849.19,7902.72,7779.95,7657.18,7783.35,7728.55,7663.55,7585.39,7336.45,7461.34,7442.65,7590.48,7274.43,7116.4,7016.57,7408.67,7466.02,7535.68,7535.68,7546.3,7565.85,7734.92,7812.66,8013.17,8042.06,8347.92,8448.17,8426.08,8567.54,8583.69,8491.08,8602.38,8480.88,8847.49,9201.78,9055.65,8889.12,8477.91,8430.33,8431.61,8347.49,8828.8,8984.71,9141.89,9322,9378.93,9593.46,10014.44,9571.79,9444.35,9371.71,9493.2,9324.98,9147.41,9147.41,9127.44,9031.44,9101.53,8969.41,9531.01,9465.59,9122.77,9288.87,8712.83,8863.21,8844.09,8514.02,8703.06,8716.65,9025.06,8810.96,8693.71,8950.3,8950.3,8863.64,8497.88,8453.7,8315.21,8178.84,8282.5,8500,8393.37,8276.55,8276.55,8307.14,8365.76,8671.2,8614.27,8961.77,8646.13,8997.45,9027.19,8810.53,8615.55,8635.51,8805.86,9008.5,8868.31,8786.75,8347.92,8369.16,8071.79,8285.47,8528.04,8778.25,9003.4,9312.66,9302.89,9514.02,9241.72,9239.59,9519.54,9570.94,9565,9558.62,9334.75,9242.14,9211.98,9121.5,8856.41,9050.55,8906.54,9684.79,9241.72,9378.93,9237.04,9533.13,9704.76,9785.9,9785.9,9589.21,9501.7,9276.13,9273.15,8961.77,9013.17,9086.66,9317.76,9442.23,9659.3,9722.6,9579.86,9540.36,9561.17,9722.17,9652.08,9701.78,9807.14,9938.4,10148.68,10163.13,10087.94,9790.99,9740.02,9614.27,9707.73,9401.02,9228.12,9096.43,9222.17,9195.84,9429.48,9014.87,8961.77,9175.87,9258.28,9149.53,9076.47,8693.29,8583.69,8780.37,8501.7,7714.53,7928.63,7590.06,7174.6,7380.2,7059.9,6918.01,6632.96,6604.08,6412.91,6201.36,5332.63,7011.47,6600.68,6600.68],"테슬라":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.73,96.4,96.31,92.49,92.28,94.99,94.51,98.22,97.78,97.73,97.85,100.76,101.04,100.47,102.97,103.09,106.17,105.62,106,108.49,108.49,111.63,111.74,109.17,108.67,108.67,110.34,115.43,115.31,116.46,117.61,116.89,116.82,116.75,120.9,120.9,119.8,121.21,123.96,124.45,126.58,129.47,129.4,128.41,128.63,127.45,128.11,126.74,127.92,127.81,131.08,130.93,133.27,136.89,136.91,142.69,142.88,142.26,136.77,138.43,138.43,141.06,139.08,130.18,130.69,125.21,127.12,127.14,127.37,127.93,127.74,126.41,125.54,124.54,123.92,125.18,131.2,130.04,133.26,132.98,133.19,127.48,129.68,129.56,133.82,137.41,141.09,141.05,141.33,141.52,151.8,154.44,150.01,151.89,153.85,158.86,156.98,150.95,154.59,154.59,153.29,152.68,155.36,153.83,155.4,156.64,159.57,157.73,156.94,159.71,164.16,162.16,158.16,150.25,156.8,156.21,163.37,165.38,164.3,165.17,160.63,161.21,155.66,159.2,158.06,157.82,154.52,157.75,161.11,165.34,165.34,170.4,173.41,173.08,172.82,176.62,179.43,182.89,188.15,181.7,182.56,191.18,193.57,190.87,188.86,188.05,189.29,191.41,194.56,194.99,191.96,184.27,188.78,183.45,183.89,179.31,179.31,166.33,157.05,159.28,160.72,166.4,167.57,164.46,166.68,162.51,166.92,165.4,167.77,167,174.18,172.69,174.85,170.08,170.39,164.49,162.51,165.72,176.5,181.5,180.61,185.72,184.86,180.73,181.98,185,184.25,184.55,178.96,176.69,171.81,173.58,179.39,179.47,176.99,175.77,176.64,179.6,180.98,180.73,180.73,177.77,175.2,178.29,174.62,184.94,184.46,186.23,192.04,193.14,195.78,190.74,190.14,186.36,178.54,175.43,175.57,173.39,172.69,173.46,173.67,177.04,180.53,180.69,181.48,174.39,180.82,180.32,180.87,180.81,178.29,180.91,182.89,178.9,175.49,171.38,171.54,165.7,165.86,163.17,162.77,168.59,163.27,152.18,155.65,153.97,155.63,154.79,154.08,154.08,160.39,156.98,158.3,158.91,160.21,157,161.61,158.96,158.96,160.46,161.1,161.48,156.39,157.06,155.88,155.2,154.44,159.3,158.27,160.25,167.26,173.42,172.4,171.82,174.65,172.32,168.37,167.29,168.65,165.37,165.37,161.35,158.47,160.37,158.33,163,161.33,159.99,160.99,171.07,169.69,170.25,171.85,170.97,170.97,172.93,176.54,175.22,177.99,178.77,179.4,175.89,171.7,174.35,177.74,175.86,180.17,177.6,174.8,169.4,169.83,175.44,160.3,157.85,160.55,164.59,163.9,169.88,170.6,170.6,170.24,169.49,176.03,179.02,181.75,178.48,174.45,168.28,170.41,169.51,166.9,168.98,167.35,166.37,175.7,173.83,166.1,165.57,163.41,159.45,157.92,160.96,157.18,153.34,154.68,141.97,131.09,135.33,135.33,128.39,136.04,145.91,155.46,152.2,147.3,154.95,153.03,149.54,152.73,148.09,146.3,149.17,152.6,147.59,144.1,144.14,142.74,145.17,149.54,149.45,152.51,153.14,144.65,149.55,153.96,153.56,156.04,155.11,153.09,148.47,144.51,145.68,144.69,140.77,144.67,139.85,141.91,141.29,141.8,141.8,144.3,148.34,144.79,148.4,150.9,148.04,162.47,160.74,161.54,168.88,174.3,175.33,181.91,182.14,188.57,179.28,184.2,176.71,169.66,169.34,173.91,175.18,177.95,174.4,170.39,158.08,158.08,157.21,157.08,161.97,163.98,162.2,161.05,162.15,157.69,164.09,164.68,162.84,159.46,154.18,151.25,157,155.94,151.12,147.56,151.61,152.98,177.75,177.05,173.91,193.02,188.32,179.23,180.77,181.24,176.78,172.23,170.58,155.35,156.85,163.69,163.56,162.78,164.16,162.35,158.59,155.1,154.16,153.4,153.4,146.94,142.76,142.87,133.86,145.18,142.1,147.74,147.2,150.11,149.93,144.91,152.06,151.71,152.1,152.39,153.06,157.43,156.38,134.64,158,153.07,149.91,143.32,133.21,127.41,133.64,130.63,128.26,131.59,132.01,140.65,138.2,134.2,132.21,132.7,149.58,146.71,160.11,168.27,170.28,167.76,171.53,175.07,176.16,173.61,173.44,177.05,178.69,178.24,168.46,172.25,174.93,177.19,180.17,179.75,176.7,171.98,171.98,165.69,175.95,174.89,176.9,173.49,178.23,182.3,182.91,182.91,184.62,182.03,185.69,186.5,186.42,191.6,185.97,177.18,171.39,169.32,160.38,162.61,150.21,150.21,165.82,160.76,169.78,169.23,157.7,152.74,161.55,170.33,170.53,172.15,175.42,176.59,170.05,175.15,175.97,176.61,153.7,153.7,152.01,146.24,148.24,151.05,150.71,151.26,157.02,156.13,158.76,159.11,163.41,161.31,156.37,155.5,159.08,158.56,156.71,154.47,156.56,156.56,155.42,153.86,148.1,149.87,151.93,151.47,160.05,162.66,149.91,145.11,140.63,140.47,140.65,144.49,147.94,144.09,146.94,147.45,140.06,137.04,136.01,139.13,139.34,134.52,132.43,136.17,139.76,141.68,142.31,147.05,145.38,148.39,136.17,139.82,138.93,138.47,140.38,136.5,136.13,135.46,139.01,137.93,138.96,138.96,133.61,134.2,131.53,125.92,119.57,122.79,121.38,119,124.13,129.69,129.84,125.63,124.51,123.05,121.8,115.44,118.13,117.95,116.11,107.31,104.43,104.29,98.01,99.41,96.94,96.94,95.96,96.55,95.71,94.16,91.01,98.45,99.97,104.73,103.99,108.25,110.4,106.41,108.78,109.29,114.43,114.28,115.14,111.68,112.82,113.72,111.75,111.5,113.32,113.63,115.52,114.19,119.45,119.45,118.54,117.13,116.99,121.5,121.33,124.63,128.91,128.34,129.6,128.93,131.29,130.02,132.3,134.7,116.36,115.96,119.89,123.19,122.86,118.92,119.17,116.1,117.34,118.7,121.18,119.51,116.46,119.5,111.68,109.66,111.84,115.35,114.85,112.3,112.97,107.5,109.33,108.86,109.63,112.74,114.73,114.73,114.42,112.22,116.75,115.66,117.87,119.78,125.65,125.03,124.69,123.47,124.48,123.82,125.4,122.36,122.67,113.51,116.3,123.35,123.13,122.49,124.43,123.64,118.5,117.69,120.88,122.07,124.35,124.45,126.06,130.67,131.14,132.09,133.22,130.66,128.91,129.97,129.51,152.39,166.86,166.65,160.8,160.19,160.14,159.32,161.44,161.31,166.07,170.63,171.44,175.48,177.95,176,177.65,179.08,177.98,182.82,179.11,180.44,169.36,171.03,167.26,168.47,168.47,167.78,170.29,170.96,169.35,168,170.81,172.66,177.39,179.35,182.9,182.25,194,192.72,199.92,205.46,206.25,213.18,216.25,216.25,219.14,218.86,210.88,212.73,218.79,225.28,229.62,238.53,250.26,244.77,243.15,266.9,273.54,263.67,261.12,259.6,259.6,278.26,289.63,290.97,287.22,283.76,288.28,295.44,325.86,330.83,396.64,451.09,373.61,380.86,380.41,392.21,393.79,390.18,408.85,406.83,406.83,436.51,466.52,457.37,458.17,424,406.77,396.03,345.28,339.68,378.14,379.11,381.13,368.44,357.73,309.18,328.16,322.52,285.05,277.97,226.33,218.76,183.69,217.46,217.41,220.84,256.8,274.22,268.58,261.56,255.34,266.46,244.88,231.11,244.09,262.52,277.37,279.09,291.38,291.38,331.02,360.99,371.13,378.95,383.37,379.54,349.21,372.29,358.83,368.75,406.18,391.11,407.07,397.6,356.63,387.08,390.65,397.96,396.66,416.69,412.56,411.6,402.22,408.51,406.39,413.75,410.89,414.73,420.85,415.4,415.4,416.41,417.1,409.77,424.61,456.7,448.29,449,439.55,450.37,483.05,478.35,521.26,494.71,475.61,503.89,499.43,504.34,510.53,508.98,505.63,509.42,488.61,501.39,488.04,513.27,549.1,569.35,614.62,614.62,697.47,706.77,694.57,709.02,785.48,761.28,771.32,786.17,763.1,763.2,835.49,797.54,809.73,769.42,720.57,782.91,750.82,762.32,756.41,727.57,755.15,756.17,755.16,757.48,738.73,721.37,698.9,790.62,824.31,839.42,933.46,959.62,955.27,1017.97,1042.45,1024.26,1028.9,1094.92,1138.44,1125.55,1267.02,1207.86,1137.48,1034.83,1063.62,1063.62,839.59,931.3,944.16,947.67,1066.92,1143.55,1123.21,1076.61,1124.21,1142.61,1078.64,967.1,985.99,1035.7,1070.94,1065.52,1090.8,1139.49,1055.4,1082.33,1052.58,1081.36,1082.94,1103.48,1124.59,1135.65,1172.9,1141.32,1117.9,1095.42,1072.82,1074.6,1082.61,1069.49,1068.6,1079.79,1032.34,1044.57,986.63,1018.33,1077.8,1070.38,1113.88,1093.19,1071.09,1043.38,1060.59,1046.94,1038.65,1037.6,1122.83,1237.33,1269.44,1244.88,1326.85,1412.1,1459.45,1459.45,1489.35,1443.17,1486.8,1446.28,1508.72,1523.11,1631.73,1652.38,1536.94,1594.38,1550.95,1626.82,1610.09,1583.45,1667.68,1767.1,1652.33,1628.12,1642.46,1682.61,1682.61,1687.49,1693.34,1766.54,1794.23,1855.5,1869.08,1922.15,2074.85,2237.53,2062.52,2159.78,2172.41,2148.49,2100.58,2100.58,2147.34,2162.34,2148.46,2152.66,2239.51,2245.33,2197.2,2124.15,2017.62,2135.29,2219.15,2173.12,2161.17,2166.87,2195.32,2159.83,2046.33,2063.72,2075.06,2075.06,2024.46,2029.37,2001.98,1986.52,1816.68,1776.86,1886.65,1734.6,1717.52,1826.67,1745.33,1660.82,1580.07,1520.34,1431.48,1712.64,1698.6,1778.79,1763.87,1800,1721.03,1784.41,1660.72,1665.06,1703.53,1683.6,1602.52,1628.25,1573.12,1554.26,1616.12,1698.27,1682.56,1682.56,1757.06,1758.5,1706,1738.62,1721.38,1784.85,1938.27,1861.76,1878.59,1880.96,1817.01,1828.1,1891.99,1829.88,1854.56,1876.94,1791.86,1765.57,1721.33,1803.81,1741.42,1712.69,1705.92,1687.11,1709.56,1599.39,1569.29,1499.85,1453.57,1499.47,1466.64,1469.29,1432.65,1491.94,1476.94,1541.93,1537.48,1574.19,1603.99,1589.68,1589.68,1586.32,1538.57,1456.5,1523.14,1538.6,1534.68,1522.45,1551.28,1550.7,1570.53,1523.93,1537.94,1567.76,1584.82,1578.52,1585.84,1669.39,1728.5,1708.29,1751.13,1730.89,1728.2,1723.67,1726.16,1726.16,1677.04,1639.08,1659.83,1670.35,1743.45,1699.82,1661.28,1654.21,1637.99,1643.07,1679.38,1666.13,1650.8,1635.85,1672.06,1639.41,1645,1722.22,1747.27,1804.4,1804.58,1807.58,1817.01,1777.52,1814.8,1805.21,1799.69,1836.38,1823.47,1744.65,1692.63,1751.82,1712.36,1729.62,1795.83,1801.4,1808.29,1782.76,1810.12,1858.4,1870.63,1866.49,1862.17,1865.17,1865.17,1914.37,1916.78,1919.3,1872.03,1889.14,1892.93,1921.76,1924.71,1931.07,1856.52,1879.94,1911.87,1916.2,1968.96,2012.1,1977.02,1986.55,1971.73,1971.07,1987.11,1984.72,1990.21,2017.82,1997.18,2013.58,2048.61,2062.24,2080.65,2143.48,2212.33,2197.48,2201.37,2273.07,2312.94,2605.8,2589.45,2638.85,2738.47,2832.44,3072.95,2979.91,3086.35,3127.15,3107.27,2956.88,2602.34,2715.36,2704.07,2627.56,2576.63,2681.74,2768.9,2787.64,2891.08,2941.44,2819.81,2837.53,2837.53,2750.88,2890.9,2910.65,2784.13,2757.69,2580.65,2565.5,2674.17,2717.93,2552.25,2585.89,2457.18,2437.1,2481.54,2356.78,2371.14,2288.18,2386.3,2565.14,2712.94,2712.94,2781.44,2767.53,2761.73,2721.43,2686.96,3050.55,2922.93,2766.64,2707.09,2611.14,2690.36,2706.33,2812.66,2622.83,2668.73,2668.73,2620.16,2531.53,2533.1,2399.95,2364.61,2335.11,2383.45,2108.06,2151.92,2381.69,2367.79,2302.72,2265.8,2347.62,2306.99,2344.27,2369.69,2299.9,2186.63,2226.7,2345.36,2347.8,2228.2,2178.95,2178.95,2088.81,1942.64,2036.03,2059.17,2213.15,2197.74,2237.2,2133.97,2131.43,2045.72,2096.11,2184.01,2131.45,2022.25,1948.56,2038.88,2136.36,2216.12,2302.03,2342.13,2527.28,2540.33,2577.98,2569.64,2776.1,2795.75,2781.57,2739.89,2757.67,2912.41,2774.62,2658.94,2688.18,2607.4,2481.39,2509.41,2599.47,2504.45,2504.45,2553.5,2614.16,2484.62,2564.91,2555.43,2537.55,2228.38,2241.32,2231.15,2213.98,2295.8,2311.85,2422.12,2220.39,2200.99,2001.3,2034.17,1866.26,1851,1956.75,1841.77,1936.46,1804.75,1803.76,1688.02,1715.99,1597.15,1675.06,1799.47,1931.43,1931.43,1927.94,1882.46,1970.51,1788.84,1817.54,1822.17,1844.9,1828.43,1771.4,1645.59,1684.9,1777.27,1625.48,1653.39,1653.39,1808.06,1800.81,1793.06,1874.19,1868.19,1774.7,1742.87,1712.23,1733.51,1733.51,1777.78,1767.61,1865.32,1912.76,1787.52,1777.8,1808.09,1817.8,1831.17,1834.83,1872.85,1887.87,2072.51,2076.61,2047.55,1974.52,2096.26,2142.64,2266.59,2267.56,2292.8,2344.75,2354.18,2198.09,2215.28,2161.2,2245.28,2186.35,2288.56,2359.42,2338.39,2318.82,2310.22,2262.9,2211.39,2261.28,2266.18,2258.35,2197.48,2172.54,2118.23,2102.29,2114.11,2061.1,2061.1,2093.21,2164,2206.41,2285.89,2322.04,2228.3,2308.24,2316.93,2313.88,2357.51,2354.92,2294.43,2201.3,2100.15,2105.34,2158.2,2195.35,2045.84,2023.26,1848.97,1902.67,1836.84,1816.4,1701.53,1700.69,1651.41,1657.06,1691.23,1563.62,1673.15,1679.56,1693.67,1581.08,1635.7,1611.37,1696.57,1713.5,1716.93,1743.1,1735.62,1737.76,1639.82,1642.33,1582.53,1503.28,1459.19,1354.61,1454.77,1494.81,1456.52,1482.99,1425.78,1397.18,1374.45,1280.47,1296.03,1397.41,1397.41,1394.81,1395.27,1379.33,1485.13,1485.13,1486.35,1391.69,1371.62,1327.54,1322.96,1365.75,1280.09,1227.69,1196.03,1202.67,1145.92,1143.17,1051.11,1049.35,956.14,939.36,939.36,832.19,859.73,929.21,939.59,939.59,824.56,866.82,841.65,862.4,913.58,906.56,939.89,942.49,933.64,933.64,1002.97,982.3,970.02,1017.7,1096.49,1097.56,1101.68,1222.5,1356.98,1271.24,1321.28,1383.75,1436.08,1449.12,1485.58,1501.22,1535.39,1581.39,1501.83,1484.67,1596.11,1634.17,1541.11,1588.94,1588.94,1505.49,1532.11,1541.34,1501.75,1583.75,1569.11,1546.68,1456.14,1508.7,1478.34,1431.81,1388.25,1318.99,1322.96,1330.89,1397.86,1376.43,1404.5,1373.99,1397.79,1507.09,1458.05,1466.21,1452.4,1463.08,1443.1,1478.87,1489.55,1582.46,1485.66,1468.96,1415.1,1411.59,1411.59,1407.4,1424.79,1377.12,1418,1411.14,1426.7,1405.87,1377.5,1243.25,1259.19,1239.89,1225.55,1172.77,1221.89,1253.32,1234.4,1222.81,1225.1,1229.6,1297.18,1310.37,1290.24,1285.58,1312.59,1281.31,1268.88,1270.18,1326.16,1349.28,1374.07,1440.66,1417.01,1395.12,1407.09,1473.46,1473.46,1534.4,1555.53,1582.91,1632.11,1659.88,1688.1,1712.97,1791.46,1864.23,1905.64,1973.38,1958.73,1951.95,1987.34,1987.34,2093.44,1979.1,2018.38,1957.28,1838.67,1908.54,1954.54,1964.15,1996.72,2134.4,2134.4,2154.69,2109.38,2093.29,2056.52,2057.89,2074.68,2119.76,2146.3,2214.95,2237.53,2221.66,2005.34,1983.37,2052.33,2023.49,2016.4,1950.5,2032.34,2039.89,1991.38,1938.29,1978.03,1936.38,1918,1904.65,1847.37,1871.4,1850.88,1828.83,1776.96,1720.82,1672.16,1643.71,1764.15,1778.72,1806.71,1754.69,1819.91,1821.66,1961.71,1959.57,1968.57,1868.88,1868.88,1956.45,1921.59,1918.31,1895.5,2086.8,2040.27,2069.41,2105.57,2092.98,2023.49,2032.8,2002.97,1950.42,1867.89,1883.98,1862.09,1834.48,1879.33,1908.62,1919.15,1880.47,1992.07,1983.6,1987.26,1980.7,2010.83,2006.03,1974.6,1915.48,1936.84,1943.94,1851.11,1678.95,1617.01,1617.7,1651.56,1620.29,1569.49,1581.24,1505.42,1531.96,1568.73,1666.74,1677.8,1672.54,1694.74,1694.2,1601.68,1637.3,1706.41,1810.91,1852.33,1781.77,1787.19,1797.1,1839.82,1786.5,1786.5,1795.96,1800.76,1881.92,1862.24,1831.27,1821.74,1796.95,1820.9,1825.86,1850.8,1859.95,1828.68,1807.86,1825.25,1914.95,1933.64,1922.81,1962.01,1885.13,1941.27,1926.32,1926.32,1957.36,1994.2,1931.2,1895.35,1894.89,1818.84,1814.87,1811.52,1834.1,1792.22,1784.44,1733.18,1669.64,1669.64,1677.42,1644.16,1616.17,1618.54,1592.68,1595.27,1585.28,1393.06,1397.79,1456.37,1461.4,1428.6,1440.58,1433.33,1381.08,1411.9,1430.82,1445.92,1476.51,1435.01,1403.66,1439.44,1528.99,1525.17,1525.17,1477.96,1485.66,1505.8,1464.3,1520.98,1523.49,1541.11,1539.89,1545.69,1435.09,1378.64,1346.61,1362.7,1337.45,1355.99,1354.23,1292.75,1239.51,1247.67,1325.71,1306.79,1339.89,1318.23,1303.05,1316.78,1355.23,1371.7,1340.88,1340.88,1336.54,1271.01,1284.36,1305.19,1257.82,1319.45,1349.2,1310.14,1331.81,1304.73,1231.73,1198.4,1185.74,1143.63,1121.66,1083.52,1103.59,1236.69,1298.09,1283.68,1480.17,1398.02,1372.92,1373.07,1382.07,1409.31,1356.29,1332.72,1311.75,1285.05,1311.14,1354.31,1327.15,1333.64,1353.62,1334.48,1423.34,1373.84,1325.25,1367.2,1367.2,1348.21,1343.94,1363.77,1358.35,1344.7,1333.1,1334.86,1357.28,1353.78,1325.63,1301.75,1352.33,1391.84,1357.82,1429.75,1410.07,1410.07,1384.97,1395.96,1392.68,1429.06,1497.86,1505.87,1509.38,1600.76,1764,1879.41,1879.41,1918.54,1929.37,2000.99,2008.09,1838.52,1893.44,1927.08,1956.98,1895.5,1901.07,1824.56,1918.46,1879.33,1647.52,1680.02,1676.58,1770.4,1698.09,1770.18,1654.16,1584.06,1517.01,1530.43,1462.7,1516.7,1525.55,1506.41,1585.28,1536.08,1633.41,1648.51,1698.86,1686.5,1703.05,1606.87,1680.55,1626.32,1595.8,1569.41,1573.46,1633.18,1633.18,1606.41,1673.61,1755.68,1607.4,1649.66,1725.17,1740.12,1752.94,1756.6,1729.82,1738.14,1733.03,1860.56,1817.32,1906.94,1939.51,1960.49,1939.13,1986.73,1995.65,1968.12,1899.47,1835.7,1907.55,1836.99,1864.99,1838.67,1821.28,1661.33,1671.7,1674.83,1688.25,1684.9,1683.45,1669.34,1662.62,1629.67,1986.88,2053.32,2002.36,1979.56,1964.53,1905.8,1899.16,1852.33,1917.93,2200.84,2264.76,2450.19,2669.72,2505.64,2518.99,2373.61,2446.38,2583.83,2639.21,2608.92,2590.69,2689.24,2582.69,2579.94,2539.21,2539.21,2632.8,2723.8,2680.55,2730.21,2818.38,2968.88,2973.23,3058.66,3240.05,3189.17,3327.46,3531.81,3660.26,3357.21,3327,3211.75,3284.52,3526.16,3526.16,3464,3292.6,3183.91,3080.4,2893.06,3130.74,3135.39,3008.09,3012.51,3012.51,3010.98,3076.35,3023.34,3266.36,3156.52,3253.24,3253.24,3234.71,3166.36,3145.54,3101.3,3029.37,3036.54,2967.96,3053.24,3086.19,2926.62,2991.69,2884.59,2855.23,2758.35,2675.29,2505.72,2566.82,2715.03,2714.26,2714.26,2701.07,2750.27,2703.28,2576.66,2521.21,2309.69,2218.15,2150.65,2234.78,2171.24,2075.06,2128.91,2009.53,2003.59,1694.51,1758.81,1892.37,1835.85,1906.79,1815.48,1718.61,1799.08,1802.14,1897.1,2123.49,2197.86,2075.21,2083.37,2010.3,1976.81,2047.75,2156.83,2038.75,1826.32,1779.48,1692.3,2076.28,1925.25,1924.56,1924.87,1938.29,1842.49,1841.11,1841.11,1735.32,1815.18,1912.59,1979.48,2173.53,2180.63,2227.54,2152.25,2139.74,2190.77,2137.76,2100.31,2106.94,2172.54,2275.06,2428.53,2548.21,2652.02,2614.95,2669.57,2609.38,2622.58,2552.4,2601.37,2588.41,2588.41,2768.04,2722.35,2734.02,2642.72,2613.96,2626.01,2532.8,2171.62,2251.26,2353.78,2487.34,2489.93,2434.1,2481.39,2510.53,2413.04,2456.52,2456.52,2457.36,2659.65,2597.03,2498.47,2484.97,2468.57,2423.04,2293.75,2407.7,2405.42,2405.42,2242.11,2271.62,2256.9,2363.62,2391.38,2417.24,2370.56,2453.62,2436.38,2514.49,2505.64,2533.26,2536.69,2328.76,2410.83,2483.52,2450.04,2433.56,2351.41,2308.39,2358.96,2354.84,2440.2,2458.2,2514.49,2586.04,2599.85,2588.71,2559.73,2521.43,2556.52,2511.9,2470.63,2441.72,2593.52,2643.78,2682.46,2666.67,2639.05,2546.68,2546.68,2512.28,2548.36,2582.23,2676.13,2642.26,2646.61,2652.86,2813.2,3020.14,3127.69,3216.02,3248.36,3179.63,3249.96,3312.05,3248.28,3377.5,3229.52,3359.27,3380.7,3392.22,3504.65,3325.71,3278.64,3457.28,3303.51,3346.22,3322.2,3154,3324.94,3274.14,3319.22,3270.4,3350.95,3412.89,3376.05,3348.36,3424.71,3308.31,3450.95,3512.97,3520.29,3356.98,3482.53,3572.62,3388.71,3524.56,3401.3,3276.28,3396.11,3353.32,3284.52,3066.29,3084.29,3119.15,3060.64,3081.54,3014.72,2983.14,3186.73,3199.08,3253.85,3253.85,3281.24,3281.01,3274.14,3407.63,3467.05,3470.63,3353.01,3395.65,3443.55,3408.77,3500.84,3625.55,3736.69,3564.15,3687.03,3670.48,3727.92,3703.74,3702.52,3702.52,3624.64,3506.03,3466.29,3430.36,3341.5,3445.23,3302.52,3290.69,3324.18,3394.43,3424.56,3411.14,3350.11,3345.31,3337.15,3337.15,3197.94,3290.92,3427.61,3425.32,3319.6,3286.8,3291.08,3177.42,3283.07,3217.47,3218.61,3096.95,3029.82,3135.85,3183.22,3243.4,3266.74,3181.31,3184.13,3184.13,3132.19,3137.45,3140.43,3141.27,3049.81,3122.65,3183.83,3116.55,3070.25,3076.43,2993.36,3096.42,3093.44,3026.16,3041.04,3045.31,3110.76,3013.04,2983.98,3017.24,3045.54,2996.03,2900.84,2806.71,2905.03,2921.66,2943.94,2838.37,2759.95,2709.99,2835.62,2908.16,2750.5,2750.5,2691.23,2644.16,2618.23,2636.31,2661.71,2688.18,2778.03,2989.7,2966.44,3055.84,2993.9,2947.52,2955.84,2850.65,2870.33,2888.41,2868.19,2843.63,2910.98,2981.08,2993.97,2970.02,3041.42,3141.04,3267.35,3394.36,3306.25,3396.41,3381.39,3220.75,3127.31,3082.46,3182.76,3187.26,3249.5,3249.5,3307.32,3358.96,3372.24,3324.1,3172.24,3232.19,3231.88,3191.84,2982.46,3119.37,3025.78,2910.68,3044.62,3100.15,3136.16,3086.65,3023.49,3054.84,3054.84,3089.63,2910.83,2864.45,2861.33,2896.34,3141.42,3208.24,3244.09,3001.14,3001.14,3201.91,3073.23,3005.8,3101.07,3110.3,3011.14,3021.97,3008.85,2982.91,2904.96,2818.99,2890.39,2852.86,2438.52,2387.72,2358.66,2345.08,2275.51,2355.84,2373.84,2456.75,2496.95,2452.71,2437.3,2506.33,2523.88,2538.6,2498.17,2593.14,2610.76,2588.1,2569.57,2678.26,2632.57,2767.81,2661.71,2671.62,2637.83,2706.41,2660.18,2806.64,2716.17,2723.19,2870.86,2700.84,2700.84,2808.24,2805.57,2773.15,2787.49,2738.14,2719.91,2731.35,2793.29,2778.57,2862.7,2890.16,2899.47,2882.84,2838.37,2726.54,2691.38,2706.41,2701.07,2826.77,2888.86,2903.74,2881.85,2860.41,2919.15,2883.52,2862.17,2800.61,2764.61,2705.72,2807.48,2850.57,2947.9,2857.21,2839.21,2987.19,3108.01,3083.3,3076.28,3049.66,3080.24,3039.66,2938.14,2621.59,2732.42,2883.68,2896.87,2981.24,3031.66,2976.51,2896.57,2899.39,2926.93,2855.91,2637.83,2940.2,2934.25,2934.25],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1957.16,1960.95,1961.89,1893.89,1783.79,1921.37,1835.05,1835.05,1792.63,1784.53,1745.89,1760.32,1824.32,1816.42,1835.16,1855.16,1869.89,1927.26,1947.26,2018.84,2027.26,1996.53,1973.47,1968.11,1968.95,2000.42,1986.84,1993.68,2021.79,2043.37,2092.42,2200.53,2200,2196.53,2115.47,2110.53,1958.21,2043.68,2027.37,2123.37,2065.16,2071.05,2093.05,2091.89,2071.68,2067.58,1938,1877.26,1846.32,1807.37,1631.47,1688.21,1781.05,1777.05,1814.74,1806.11,1768.32,1688.32,1648,1649.16,1617.68,1510.42,1677.47,1696.63,1696.63]},"symbols":{"AMD":"AMD","EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","엔비디아":"NVDA","테슬라":"TSLA","팔란티어 테크":"PLTR"},"missing":[],"stale":["KOSPI200"]}
};
