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
  "updatedAt": "2026-08-27T04:14:01.921Z",
  "checkedAt": "2026-08-27T04:14:01.921Z",
  "checkedCount": 36,
  "source": "live",
  "sourceNote": "미래에셋증권 홈페이지 ELS/DLS 캘린더 (청약 진행중)",
  "sourceNoteEn": "Mirae Asset Securities ELS/DLS calendar — currently on offer",
  "products": [
    {
      "code": "KR6MD0008TQ6",
      "name": "미래에셋증권(ELS)38041",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 40,
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
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 85
        },
        {
          "months": 27,
          "barrier": 85
        },
        {
          "months": 30,
          "barrier": 80
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "<달러청약 상품> 85-85-85-85-85-85-85-85-85-80-75-70, KI 35",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TP8",
      "name": "미래에셋증권(ELS)38040",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 35.2,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TN3",
      "name": "미래에셋증권(ELS)38039",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 31.3,
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
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 85
        },
        {
          "months": 27,
          "barrier": 85
        },
        {
          "months": 30,
          "barrier": 80
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
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TV6",
      "name": "미래에셋증권(ELS)38045e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "어플라이드 머티어리얼즈"
      ],
      "couponRate": 30.2,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70 , KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TM5",
      "name": "미래에셋증권(ELS)38038",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 30,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TX2",
      "name": "미래에셋증권(ELS)38047e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "KOSPI200"
      ],
      "couponRate": 29,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TL7",
      "name": "미래에셋증권(ELS)38037",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 27.5,
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
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 85
        },
        {
          "months": 27,
          "barrier": 85
        },
        {
          "months": 30,
          "barrier": 80
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
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TW4",
      "name": "미래에셋증권(ELS)38046e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 25,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TT0",
      "name": "미래에셋증권(ELS)38044e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 24,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 3,
          "barrier": 75
        },
        {
          "months": 6,
          "barrier": 75
        },
        {
          "months": 9,
          "barrier": 75
        },
        {
          "months": 12,
          "barrier": 75
        },
        {
          "months": 15,
          "barrier": 75
        },
        {
          "months": 18,
          "barrier": 75
        },
        {
          "months": 21,
          "barrier": 75
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 27,
          "barrier": 70
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 33,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-75-75-75-75-70-70-70-65, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TK9",
      "name": "미래에셋증권(ELS)38036",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "삼성전자"
      ],
      "couponRate": 20.5,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TS2",
      "name": "미래에셋증권(ELS)38043e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
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
          "barrier": 65
        }
      ],
      "knockIn": 20,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 20, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TR4",
      "name": "미래에셋증권(ELS)38042e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 16.6,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TJ1",
      "name": "미래에셋증권(ELS)38035",
      "type": "ELS",
      "shape": "스텝다운 노낙인",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 15.6,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75-75-70-65-60, KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TH5",
      "name": "미래에셋증권(ELS)38034",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 14.2,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TG7",
      "name": "미래에셋증권(ELS)38033",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "KOSPI200"
      ],
      "couponRate": 13.2,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TF9",
      "name": "미래에셋증권(ELS)38032",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 12.6,
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
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "<달러청약 상품> 75-75-75-75-75-70, KI 40",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008TE2",
      "name": "미래에셋증권(ELS)38031",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
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
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-24",
      "offerEnd": "2026-08-28",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VJ7",
      "name": "미래에셋증권(ELS)38062e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 29,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 12,
      "schedule": [
        {
          "months": 3,
          "barrier": 75
        },
        {
          "months": 6,
          "barrier": 75
        },
        {
          "months": 9,
          "barrier": 75
        },
        {
          "months": 12,
          "barrier": 70
        }
      ],
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "1년 만기, 75-75-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VF5",
      "name": "미래에셋증권(ELS)38059",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 40,
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
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 85
        },
        {
          "months": 27,
          "barrier": 85
        },
        {
          "months": 30,
          "barrier": 80
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "<달러청약 상품> 85-85-85-85-85-85-85-85-85-80-75-70, KI 35",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VE8",
      "name": "미래에셋증권(ELS)38058",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 35,
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
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 85
        },
        {
          "months": 27,
          "barrier": 85
        },
        {
          "months": 30,
          "barrier": 80
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VD0",
      "name": "미래에셋증권(ELS)38057",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 33,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "<달러청약 상품> 75-75-75-75-70-65, KI 35",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VC2",
      "name": "미래에셋증권(ELS)38056",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 30,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VK5",
      "name": "미래에셋증권(ELS)38063e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "어플라이드 머티어리얼즈"
      ],
      "couponRate": 29.5,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VM1",
      "name": "미래에셋증권(ELS)38065e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "KOSPI200"
      ],
      "couponRate": 29,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VB4",
      "name": "미래에셋증권(ELS)38055",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 28,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VL3",
      "name": "미래에셋증권(ELS)38064e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "브로드컴"
      ],
      "couponRate": 27.1,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70 , KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VH1",
      "name": "미래에셋증권(ELS)38061e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 24,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 3,
          "barrier": 75
        },
        {
          "months": 6,
          "barrier": 75
        },
        {
          "months": 9,
          "barrier": 75
        },
        {
          "months": 12,
          "barrier": 75
        },
        {
          "months": 15,
          "barrier": 75
        },
        {
          "months": 18,
          "barrier": 75
        },
        {
          "months": 21,
          "barrier": 75
        },
        {
          "months": 24,
          "barrier": 75
        },
        {
          "months": 27,
          "barrier": 70
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 33,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-75-75-75-75-70-70-70-65, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VG3",
      "name": "미래에셋증권(ELS)38060e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 15.5,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VA6",
      "name": "미래에셋증권(ELS)38054",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 13.2,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008V90",
      "name": "미래에셋증권(ELS)38053",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 12,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008V82",
      "name": "미래에셋증권(ELS)38052",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 11.9,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 3,
          "barrier": 90
        },
        {
          "months": 6,
          "barrier": 90
        },
        {
          "months": 9,
          "barrier": 90
        },
        {
          "months": 12,
          "barrier": 90
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
          "barrier": 85
        },
        {
          "months": 24,
          "barrier": 85
        },
        {
          "months": 27,
          "barrier": 80
        },
        {
          "months": 30,
          "barrier": 80
        },
        {
          "months": 33,
          "barrier": 80
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-90-90-90-85-85-85-85-80-80-80-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008V74",
      "name": "미래에셋증권(ELS)38051",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
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
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008V66",
      "name": "미래에셋증권(ELS)38050",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "S&P500"
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008V58",
      "name": "미래에셋증권(ELS)38049",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 10.2,
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008V41",
      "name": "미래에셋증권(ELS)38048",
      "type": "ELS",
      "shape": "리자드",
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
          "barrier": 80,
          "lizard": 45,
          "lizardRate": 10
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
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-80(45)-75-70-65-60, KI -, 원화, 리자드 조건 충족 시 연 10%",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008VN9",
      "name": "미래에셋증권(ELB)4058",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 6,
      "rateBasis": "annual",
      "maxLossRate": 0,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 3,
          "barrier": 70
        },
        {
          "months": 6,
          "barrier": 70
        },
        {
          "months": 9,
          "barrier": 70
        },
        {
          "months": 12,
          "barrier": 70
        },
        {
          "months": 15,
          "barrier": 70
        },
        {
          "months": 18,
          "barrier": 70
        },
        {
          "months": 21,
          "barrier": 70
        },
        {
          "months": 24,
          "barrier": 70
        },
        {
          "months": 27,
          "barrier": 70
        },
        {
          "months": 30,
          "barrier": 70
        },
        {
          "months": 33,
          "barrier": 70
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": null,
      "principalProtection": 100,
      "riskGrade": 5,
      "riskLabel": "낮은위험",
      "riskCode": "15",
      "status": "진행중",
      "offerStart": "2026-08-26",
      "offerEnd": "2026-09-02",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-70-70-70-70-70-70-70-70-70(월지급배리어:65), KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    }
  ],
  "history": {"updatedAt":"2026-08-27T04:14:03.500Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20160826,20160829,20160830,20160831,20160901,20160902,20160905,20160906,20160907,20160908,20160909,20160912,20160913,20160914,20160915,20160916,20160919,20160920,20160921,20160922,20160923,20160926,20160927,20160928,20160929,20160930,20161003,20161004,20161005,20161006,20161007,20161010,20161011,20161012,20161013,20161014,20161017,20161018,20161019,20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827],"series":{"EuroStoxx50":[100,99.61,100.68,100.42,100.24,102.3,102.24,101.99,102.7,102.43,101.42,100.08,98.82,98.49,98.78,97.5,98.6,98.49,99.06,101.37,100.73,98.85,98.69,99.36,99.38,99.73,99.61,100.64,100.53,100.37,99.67,100.84,100.34,99.92,98.83,100.49,99.95,101.22,101.51,102.2,102.24,102.77,102.56,102.35,102.49,102.29,101.49,100.42,99,98.78,98.15,99.96,100.43,101.53,101.2,100.65,100.98,101.31,100.53,101.04,100.35,100.75,101.13,100.72,101,101.26,100.21,100.93,101.37,100.68,100.16,101.41,103,104.38,105.83,106.22,106.27,107.52,106.69,107.95,108.27,108.22,108.94,108.65,108.61,108.76,108.76,108.91,108.91,108.68,109.31,109.31,110.12,110.2,110.17,110.32,109.92,109.83,109.89,109.18,110.43,109.44,109.12,109.42,109.3,109.6,108.73,109.01,110.49,110.26,109.73,108.38,107.32,108.26,108.08,108.73,107.57,107.49,107.56,108.88,108.65,109.8,109.92,110.41,109.99,109.91,110.03,110.93,110.93,110.75,109.76,109.93,110.27,112.62,112.44,113.06,112.53,112.45,112.6,113.27,113.48,113.46,112.92,113.25,114.27,114.55,114.19,113.93,113.63,114.68,114.41,114.18,115.1,115.44,115.65,116.3,115.37,115.66,115.35,115.92,116.13,115.62,115.27,115.22,114.55,114.55,114.55,113.27,113.64,114.27,114.28,118.84,119.03,118.88,118.37,118.24,118.24,118.86,119.13,120.51,121.54,120.99,121.22,121.11,120.37,120.83,120.98,120.98,119.08,118.33,119.16,118.81,119.42,119.14,119.14,118.89,118.89,118.3,118.08,118.49,119.32,119.32,118.06,117.89,118.39,119.12,117.73,118.19,117.83,117.11,117.72,118.91,118.28,118.07,118.12,117.72,118.32,117.54,117.45,115.31,114.33,115.99,115.58,115.55,115,115.06,115.54,115.09,116.77,117.19,117.13,116.81,115.56,116.27,116.25,114.66,114.71,115.39,115.97,116.04,115.19,114.58,114.58,114.91,115.15,116.51,116.46,116.78,115.22,114.06,113.15,114.63,115,115.75,115,114.47,113.72,114.79,114.23,114.43,114.22,113.64,112.55,113.07,113.66,114.4,113.95,113.64,114.07,114.53,114.53,116.11,116.68,117.03,117.14,116.78,117.15,117.3,117.11,117.58,117.64,117.52,117.47,118.1,118.38,119.42,119.68,119.78,119.42,120.04,119.7,119.94,119.55,119.83,119.77,119.74,119.8,119.85,120.24,119.66,119.76,119.88,119.94,119.3,120.82,121.32,121.65,122.04,122.82,122.54,122.58,122.32,121.54,121.42,120,119.38,118.74,118.14,117.78,118.42,117.84,118.31,118.9,118.35,118.66,118.96,118.39,119.04,119.25,118.59,117.18,118.8,118.61,118.31,118.69,119.3,119,119.6,118.98,118.13,118.28,119.9,119,118.01,118.62,118.04,118.04,118.04,117.93,117.07,116.4,116.4,116.59,118.55,119.84,120.13,120.35,119.91,119.43,120.01,119.98,120.32,120.01,120.28,121.22,121.76,121.99,121.02,120.59,121.16,121.02,119.81,119.9,118.83,117.04,115.56,112.77,114.75,112.19,110.48,111.89,110.98,111.94,112.6,113.83,113.2,114.11,113.95,114.01,114.32,115.04,114.87,114.24,112.92,110.44,111.46,111.54,112.19,113.38,113.63,113.92,112.86,112.64,113.41,114.19,112.77,113.34,112.98,111.22,109.56,108.91,110.18,110.66,111.66,111.66,111.66,111.18,110.96,113.94,113.21,113.44,114.23,113.6,114.4,114.54,114.31,115.53,115.96,115.82,116.07,116.7,116.63,115.79,116.47,116.89,117.48,117.48,118.05,117.23,117.95,118.4,118.19,118.58,118.58,118.44,118.45,118.4,118.35,119.33,118.72,118.72,119.16,117.65,116.99,116.78,115.69,113.88,114.31,113.16,114.72,115.25,114.83,114.96,114.93,114.51,115.61,115.45,115.59,117.17,116.43,115.16,114.12,114.26,113.06,114.33,111.92,111.9,112.85,111.8,112.8,112.02,113.15,113.34,114.3,114.55,114.95,115.38,113.69,114.45,114.76,114.57,114.85,115.77,115.32,114.94,114.74,115.71,115.22,116.57,117.17,116.67,117.11,117.11,115.24,115.68,115.71,116.41,116.05,116.07,113.82,113.26,113.26,111.58,112.2,112.04,112.73,113.33,113.61,113.58,113.85,114.8,114.52,114.81,113.97,112.71,112.78,111.59,110.14,109.49,109.4,109.93,110.01,110.51,110.74,111.1,111.15,111.56,111.9,113.05,113.97,113.29,113.6,114.04,114.6,112.92,113.41,112.58,113.13,112.12,111.13,109.94,110.35,108.52,106.6,106.11,106.64,108.2,107.73,106.68,106.66,105.97,104.34,103.99,105.12,104.14,104.8,104.54,106.22,106.44,106.78,106.88,106.55,107.83,107.55,107.28,106.1,107.12,106.48,105.98,105.66,104.98,103.51,104.77,103.86,104.21,105.39,105.18,105.25,105.44,105.41,106.8,105.94,104.65,101.18,101.6,100.22,101.49,103.24,103.38,102.73,101.77,100.99,101.36,99.66,99.68,99.68,99.68,99.68,97.58,99.21,99.21,99.21,98.15,101.05,100.77,101.48,101.99,102.17,101.98,101.49,101.92,102.22,101.96,104.14,103.81,103.4,103.38,103.85,105.08,104.22,104.75,105.03,104.95,105.34,105.14,106.8,106.72,104.66,104.16,105.16,105.99,106.38,105.72,107.67,107.79,107.61,108.28,108.42,108.64,108.96,109.27,109.05,109.56,110.02,110.19,110.52,110.44,109.92,109.08,109.77,109.75,110.4,111.02,112.48,112.54,113.24,112.03,111.86,109.81,109.64,110.27,110.35,110.3,111.34,112.46,112.8,114.12,114.34,114.52,114.21,113.52,113.76,114.12,114.53,114.62,115.05,115.53,116.24,116.24,116.24,116.39,116.35,116,116.28,116.33,116.75,116.75,115.9,116.35,115.03,112.98,113.52,111.31,111.65,110.31,111.76,112.47,114.22,113.8,111.94,112.5,112.5,110.52,111.31,111.75,111.24,109.55,109.55,108.97,109.63,110.73,110.95,110.9,112.23,112.23,112.98,112.5,112.63,112.25,112.39,114.7,114.76,115.2,115.17,114.79,114.42,114.37,114.35,115.39,116.19,116.53,117.61,117.73,117.19,117.05,116.59,116.32,116.16,116.19,116.34,116.97,116.32,115.69,115.61,115.93,117.36,117.36,116.6,117.08,117.05,115.03,115.16,115.16,112.15,109.98,109.34,109.95,112.13,110.74,110.5,111.52,109.25,109.05,110.59,111.92,111.29,112.77,112.07,110.76,111.24,111.96,111.79,113.32,113.83,114.02,113.63,114.63,115.76,116.11,116.1,116.23,116.82,117.56,117.93,116.88,116.97,117.2,118.01,118.64,117.49,117.33,116.7,117.33,117.79,118.57,116.87,113.39,113.52,114.49,115.31,114.03,115.01,116.06,118.59,118.13,119.54,119.56,119.21,118.9,119.59,119.75,119.82,120.3,120.41,120.44,120.32,120.26,119.73,120.38,121.75,122.13,122.53,123.13,122.9,122.8,123.31,122.89,122.54,123.29,123.07,122.79,122.37,122.23,122.49,123.16,123.09,123.34,123.06,123.03,120.47,119.95,121.58,121.19,122.65,121.98,121.97,122.49,123.12,123.94,125.33,124.41,124.2,124.21,125.45,125.46,125.46,125.46,125.46,125.64,124.52,124.52,124.52,125.35,124.65,124.88,125.32,126.09,125.88,125.56,125.4,125.2,125.37,126.51,126.2,125.87,125.23,124.13,125.54,122.17,123.55,124.12,122.6,120.95,121.62,123.98,125.49,126.41,126.18,126,127.09,128.04,127.78,127.59,128,127.44,128.4,126.99,126.24,121.18,118.67,118.85,114.8,110.6,110.91,112.01,113.63,111.73,107.36,98.3,96.67,96.52,84.55,85.9,81.4,84.06,79.25,81.52,84.66,82.57,90.19,93.02,94.6,90.64,91.87,92.58,89.04,89.31,88.46,92.88,94.93,94.72,96.09,96.09,96.09,96.92,93.28,93.42,95.95,96.65,92.72,94.17,94.75,93.31,95.74,97.4,99.53,97.26,97.26,93.56,95.53,94.47,95.69,96.6,95.79,95.81,93.36,91.69,92.04,96.73,96.42,97.74,97.74,96.52,98.7,99.63,101.35,102.79,101.32,101.32,104.94,108.61,108.35,112.42,111.82,110.31,109.41,104.46,104.76,104.19,107.72,108.53,107.96,108.59,107.68,109.58,106.17,106.93,106.44,107.36,107.43,107.24,110.29,109.43,111.28,110.34,109.16,108.33,109.5,111.28,110.33,112.22,111.79,111.8,112.56,113.12,111.97,112,109.98,109.72,109.74,109.63,106.57,105.45,107.9,108.1,108.57,107.64,108.05,108.28,110.69,111.72,111.04,109.79,109.82,109.28,110.21,108.76,108.28,110.68,110.61,111.51,110.65,110.14,108.71,108.88,110.88,109.76,108.31,110.09,108.54,110.45,110.05,110.15,110.18,110.69,110.91,110.17,109.08,105,105.11,105.64,104.96,104.21,107.07,106.77,106.09,106.1,106,106.97,107.41,107.41,108.15,108.73,109.56,108.93,108.73,106.06,107.81,107.71,107.23,105.66,105.35,106.26,103.15,102,98.44,98.33,98.27,100.3,102.94,105.01,106.82,106.43,113.21,114.36,115.18,113.88,114.01,115.14,115.22,115.67,114.67,115.19,115.04,116.53,116.66,116.63,117.19,116.02,117.1,116.97,116.83,117.57,117.26,117.12,117.23,117.01,115.79,116.4,116.98,117.69,118.29,117.78,114.56,116.18,117.57,117.57,117.57,118.77,118.97,118.64,118.64,118.4,117.85,119.96,120.33,121.08,120.27,119.99,120.14,120.96,119.57,119.68,119.43,120.39,120.2,119.67,118.03,119.35,117.47,118.16,115.65,117.29,119.27,119.91,120.99,121.44,121.76,121.62,121.19,121.97,122.76,124.04,123.79,122.9,122.28,123.36,122.9,122.55,123.11,122.42,120.8,123.13,123.17,123.33,123.07,121.9,125.01,125.77,126.89,127.75,127.34,127.22,127.92,127.88,128.47,127.46,127.35,127.13,127.31,127.31,128.45,128.98,130.42,130.19,131.08,131.08,131.08,131.89,131.44,132.14,132.17,131.61,131.78,132.09,132.66,133.97,133.54,130.9,132.09,133.37,133.32,133.57,133.27,133.37,132.77,132.04,132.88,130.38,132.97,132.86,134.01,133.65,131.08,131.13,131.13,133.45,133.1,133.05,130.77,132.87,133.73,133.73,134.07,133.93,134.18,135.22,134.19,135.26,135.81,135.51,135.84,136.12,136.06,136.09,136.07,137.08,137.28,137.64,137.92,138.13,135.64,136.61,136.96,135.4,136.94,136.88,135.86,136.45,135.01,135.5,135.68,135.78,134.62,135.48,132.6,135.14,135.98,136.02,136.18,134.75,134.06,130.5,131.42,133.76,134.84,136.5,136.28,135.03,136.3,136.75,135.84,136.75,136.79,137.69,138.23,138.67,138.76,139.11,139.73,140.39,140.5,139.6,139.4,139.17,137.02,137.77,138.73,138.79,138.89,138.52,139.22,139.48,139.4,140.42,140.58,139.58,141.05,140.35,138.76,138.76,138.53,139.17,139.24,137.72,138.52,137.22,134.32,136.11,137.86,139.35,138.14,138.37,134.83,135.54,134.47,134.05,132.76,135.05,133.29,136.14,135.31,135.28,134.7,135.64,137.83,138.95,137.9,138.42,138.59,138.05,139.15,139.13,140.31,140.21,140.64,141.2,142.19,142.71,143.16,143.95,144.93,144.59,144.32,144.46,144.77,145.18,145.7,146.21,146.19,145.62,144.72,144.13,142.3,142.05,142.62,135.85,136.51,134.97,138.83,136.46,135.54,137.43,142.05,140.62,139.79,139.49,138.95,137.67,138.18,139.58,138.23,136.43,138.69,140.08,141.71,141.71,142.44,143.24,142.34,143.04,143.04,143.9,145.09,145.9,143.66,143.03,140.83,142.23,143.38,143.37,141.92,142.91,141.44,141.79,142.83,140.5,134.68,135.47,138.34,139.02,137.42,138.67,140.33,140.25,137.56,135.75,136.88,137.17,139.65,139.42,138.03,135.02,137.65,137.43,136.63,135.34,132.4,132.39,131.99,127.2,131.9,130.36,125.1,126.91,124.3,118.13,116.67,116.44,125.1,121.29,122.47,124.27,124.17,129.21,129.06,129.63,128.95,130.42,128.53,128.34,128.48,129.12,132.95,131.52,129.64,130.17,131.25,130.15,127.05,126.3,128.17,127.55,127.28,127.16,127.85,127.85,127.85,127.25,129.45,130.48,127.56,124.82,123.62,124.06,125.47,126.33,123.99,124.94,123.74,122.8,120.56,117.16,118.09,121.18,120.03,123.02,122.42,124.29,122.6,120.69,121.48,123.19,121.17,122.15,122.15,126.53,127.61,125.87,124.89,126.07,125.69,125.69,126.45,125.86,123.72,119.56,116.35,115.44,117.34,113.87,114.22,115.26,116.07,115.09,114.15,117.37,117.56,117.9,116.74,114.77,114.55,114.68,111.61,113.67,115.88,116.48,115.32,115.83,114.74,112.83,115.51,116.66,119.17,119.1,119.47,119.47,119.73,118.77,119.85,121.32,123.18,123.18,122.4,123.99,124.72,123.75,124.81,123.42,124.55,124.8,125.46,125.89,126.4,124.77,125.48,123.92,121.52,121.33,121.83,122.06,119.71,118.61,118.32,116.84,114.83,117.74,115.93,116.27,116.33,116.68,118.59,121.13,119.13,118.51,117.65,116.28,116.25,115.17,116,113.84,111.24,111.04,110.57,110.79,108.93,110.23,111.02,115.75,114.53,114.05,112.13,111.51,110.96,110.67,111.69,112.34,114.33,115.06,115.31,116.03,115.49,117.19,119.11,119.76,119.74,120.02,120.17,121.28,120.32,119.36,122.52,123.2,124.21,123.84,127.78,128.51,129.14,130.05,128.98,128.84,130.38,129.86,130.55,131.1,131.61,131.63,130.73,130.7,131.7,132.36,132.14,131.43,130.85,130.25,130.26,130.97,130.28,132.44,132.05,127.42,126.36,126.6,126.31,128.63,127,126.8,126.8,127.32,126.52,127.89,126.02,126.02,128.96,132.01,131.53,133.47,135.15,134.78,136.19,137.08,137.88,138.09,138.67,138.67,136.01,136.86,137.88,137.96,137.79,138.65,138.79,138.14,138.3,138.57,140.88,141.44,139.7,139.83,139.82,141.18,139.45,140.89,140.81,142.18,142.75,142.01,141.88,141.19,140.94,141.45,138.81,141.11,140.79,140.04,140.87,142.67,143.3,142.14,142.46,142.38,140.5,136.08,138.84,134.03,136.76,135.03,136.84,138.91,139.38,139.76,137.21,138.34,138.46,140.56,142.36,143.34,143.21,143.35,142.79,143.15,143.15,143.15,143.95,143.97,144.94,145.85,145.09,145.96,145.95,145.66,146.45,146.22,145.43,144.42,144.77,144.81,144.81,142.67,143.18,142.41,144.18,144.46,143.61,143.06,143.16,143.43,143.39,143.36,143.61,143.61,146.01,145.68,144.25,141.64,141.83,144.09,144.09,142.56,140.12,141.43,143.62,142.62,142.68,142.57,142.76,142.5,143.39,144.42,145.36,145,145.99,144.91,144.27,143.6,142.99,141.9,142.19,143.01,144.33,144.66,146.13,146.1,145.86,144.52,140.29,140.73,141.4,142.39,144.85,145.89,146.17,144.73,145.16,144.91,145.29,145.88,145.6,145.87,144.37,147.74,148.37,148.53,148.53,144.05,142.99,143.93,144.09,142.47,143.42,145.63,143.55,143.84,142.46,142.32,140.44,139.95,140.34,141.52,141.73,140.59,140.72,142.63,143.72,143.35,142.74,142.26,142.17,141.82,140.79,140.22,140.75,141.32,140.92,140.3,142.17,142.68,141.04,140.94,142.04,139.94,139.76,138.43,137.17,137.25,138.24,138.68,137.45,136.05,136.19,136.19,137.67,136.61,139.69,139.54,139.46,137.4,137.85,137.93,136.39,135.88,133.69,134.26,135.05,135.31,134.52,133.35,133.82,134.9,135.92,138.51,138.68,138.14,137.97,138.8,140.49,139.43,140.59,142.57,143.36,142.92,144.19,144.25,143.9,144.57,144.88,145.24,144.65,144.44,145.18,145.58,146.78,146.66,147.91,148.93,148.61,150.26,150.82,150.7,150.49,150.78,151.13,150.19,150.66,150.61,150.31,150.2,150.2,150.2,150.43,149.96,150.2,150.2,147.76,148.62,148.27,149,148.39,148.45,147.57,148.82,147.98,147.71,146.26,147.92,147.78,148.83,148.35,151.61,152.22,153.98,154.11,154.89,154.41,154.09,154.62,154.64,155.82,155.42,156.49,156.65,157.67,155.77,156.43,157.56,158.31,158.22,158.13,158.63,161.29,161.86,161.58,162.3,162.23,162.03,162.6,163.2,162.54,163.29,165.24,164.8,163.78,165.54,166.11,165.86,165.63,165.52,166.36,166.1,167.83,167.13,167.56,168.23,168.81,168.86,168.86,168.86,167.49,168.39,168.44,166.58,167.62,165.79,166.12,164.99,164.6,165.58,163.34,163.24,163.99,163.37,164,166.36,165.76,164.07,166.32,165.46,163.48,163.48,162.46,163.48,164.66,166.63,167.36,167.36,168.92,168.72,168.76,169.44,168.5,168.22,168.22,167.65,166.93,167.34,167.27,168.06,167.1,164.87,165.5,165.55,166.21,164.54,167.28,168.39,167.8,166.64,164.93,167.24,163.95,160.75,162.12,163.29,162.29,164.36,163.01,164.46,163.97,163.3,162.86,162.57,163.77,162.98,164.96,165.68,165.41,165.09,162.89,164.73,165.3,167.52,165.53,164.36,162.49,161.78,160.35,162.69,163.33,161.5,159.82,161.53,159.96,160.81,161.87,161.87,154.09,151.86,151.98,155.07,155.09,155.31,155.19,155.96,157.04,159.71,160.8,161.82,161.36,162.28,162.27,163.08,162.66,162.73,163.2,164.97,164.7,165.2,163.19,161.05,159.95,157.39,158.74,157.7,158.24,159.92,160.91,160.37,161.47,160.62,164.21,161.83,162.29,164.12,163.33,167.18,168.33,166.11,164.57,164.87,163.48,164.6,165.09,164.4,165.51,165.11,166.22,167.46,164.32,163.06,164.34,165.64,164.14,164.08,163.52,163.95,164.2,165.09,164.43,162.3,160.37,162.03,161.18,161.79,159.47,161.18,159.54,161.24,157.61,157.47,160.56,159.28,159.13,157.83,157.11,157.98,159.09,159.45,158.19,157.23,158.08,159.6,161,162.06,163.4,164.48,165.35,165.61,164.49,164.74,164.95,165.03,164.33,164.19,164.67,162.07,161.52,161.21,161.21,161.21,161.21,162.73,161.75,161.75,161.75,161.82,165.65,166.49,165.97,166.69,165.34,164.57,165.44,167.17,169.65,171.02,171.56,171.61,172.93,173.32,173.38,172.35,172.59,173.76,175.47,175.62,173.33,174.88,175.1,177.94,176.9,178,179.08,179.57,182.72,182.48,183.36,183.83,181.41,181.41,181.87,181.17,180.97,183.63,181.79,181.49,184.05,178.96,182.34,183.38,181.65,178.95,176.39,178.03,177,179.52,180.89,182.2,182.95,181.07,180.17,179.91,181.87,179.77,178.75,177.1,174.34,176.73,176.19,169.86,162.05,154.68,158.57,153.54,160.08,159.03,163.15,165.11,164.98,163.95,163.95,163.95,164.81,169.37,169.91,171.21,171.76,171.47,171.42,171.42,175.57,175.5,174.84,173.74,175.69,176.38,179.13,179.92,179.49,179.78,180.3,180.29,181.2,181.19,180.19,176.93,179.23,179.89,178.66,178.66,178.27,177.9,178.57,179.55,179.73,180.38,180.38,179.89,179.15,178.08,175.74,177.37,175.68,174.96,172.64,173.85,173.46,175.96,174.46,174.2,176.91,176.17,175.48,176.68,177.49,175.69,177.44,178.45,180.9,180.65,178.83,178.41,177.86,175.99,178.62,178.03,177.49,175.74,177.53,177.89,177.79,177.31,178.69,179.15,176.72,176.72,174.14,174.38,174.84,177.12,177.64,177.12,177.25,178.99,180.53,181,180.53,182.15,181.78,181.45,182.31,180.84,178.84,179.15,179.27,177.78,178.29,175.76,176.89,177.61,176.66,178.15,178.34,178.1,178.94,179.07,180.72,178.46,178.37,181.26,181.32,180.78,181.79,181.53,180.87,182.69,182.93,183.7,185.4,187.55,187.74,186.98,186.48,187.68,186.87,183.74,184.97,184.43,186.19,187.75,186.27,188.71,188.91,187.33,188.29,188.5,189.71,189.49,189.54,189.32,188.09,188.66,188.02,188.32,186.4,184.91,188.17,190.2,192.25,190.77,189.14,187.38,183.86,184.1,185.03,183.2,183.65,185.16,187.87,187.79,188.29,188.27,188.89,189.17,189.95,190.14,190.2,189.95,189.62,191.14,190.03,191.09,189.94,188.74,190.73,191.35,190.8,190.98,190.98,190.98,190.98,191.06,192.54,192.54,192.54,196.78,197.05,196.77,196.13,199.23,199.85,200.3,199.48,200.68,200.29,196.85,195.73,195.42,197.86,197.59,197.91,199.13,197.09,195.72,197.58,199.56,199.16,198.33,196.84,199.26,201.27,200.87,200.5,199.69,198.82,198.61,200.04,202.75,201.29,203.67,203.1,203.18,205.07,204.68,203.91,198.88,191.73,195.02,192.1,190.01,188.85,193.9,192.49,190.97,189.9,190.64,191.65,190.57,186.48,182.74,185.17,185.4,187.66,184.89,182.9,184.09,185.02,190.43,189.11,189.11,189.11,187.13,196.43,195.87,196.86,196.16,198.8,197.33,197.1,201.23,198.73,196.99,196.2,195.81,195.44,194.67,193.87,193.22,195.38,195.38,191.46,194.98,200.21,198.4,196.37,195.84,192.95,194.7,194.7,193.59,194.3,194.37,198.52,197.99,199.96,199.96,201.44,201.65,201.14,200.99,200.47,202.89,201.09,202.74,201.37,201.38,200.96,199.64,201.2,205.54,206.93,207.86,209.28,210.05,209.05,209.65,206.97,206.44,208.2,206.67,207.01,210.21,208.7,211.29,213.02,212.53,209.94,206.12,208.75,208.28,208.31,208.62,208.13,208.73,206.98,206.87,208.8,209.84,206.29,208.64,208.69,208.93,207.58,210.75,211.2,213.48,215.48,215.16,216.01,216.71,217.1,217.62,217.05,217.43,217.24,216.93,214.86,214.08,213.33,214.67,214.19,214.45,214.95,214.95],"HSCEI":[null,100,101.05,100.46,101.14,101.99,103.5,104.64,104.97,105.37,105.9,101.65,100.77,100.47,101.03,101.03,102.63,102.67,103.7,104.17,103.14,101.38,102.62,102.34,103.12,100.89,101.95,102.73,103.3,104.73,104.49,104.49,103.23,101.85,99.99,101.09,100.46,102.34,101.51,101.99,101.99,103.74,103.58,102.12,101.17,100.18,100.65,102.19,100.23,99.83,99.93,101.16,101.71,98.75,100.51,99.32,98.37,98.95,98.58,98.2,98.44,99.44,101.62,101.77,101.91,103.08,103.98,103.67,103.58,104.15,102.98,102.25,102.85,103.49,104.2,103.9,102.12,102.34,102.19,99.8,99.71,98.73,97.74,98.25,96.87,96.67,96.67,96.67,97.92,98.05,98.92,98.92,99.6,99.4,101.06,101.19,101.1,101.75,102.49,102.37,103.05,101.77,102.15,103.21,103.1,102.29,102.41,102.75,102.57,103.75,103.22,103.22,103.22,102.72,102.09,101.95,103.61,103.67,104.82,106.08,106.61,108,107.97,109.88,110.08,109.08,109.98,109.59,110.95,110.78,109.7,108.77,108.42,108.32,107.89,106.81,107.09,107.71,108.24,106.3,106.01,108.01,108.61,108.16,110.83,110.69,111.44,112.07,110.1,110.42,110.32,109.1,109.77,109.89,109.03,108.17,108.6,108.6,109.13,108.2,108.17,107.96,107.03,107.48,107.44,107.44,107.44,105.75,105.12,105.88,105.81,106.42,108.15,108.63,108.04,107.6,107.6,107.12,107.12,106.21,104.51,105.1,106.65,107.68,108,108.26,110.03,109.85,109.32,108.14,108.1,109.23,109.45,109.4,111.31,111.39,111.81,111.81,111.64,111.81,112.3,111.57,111.67,111.73,112.13,111.52,110.4,110.82,110.71,108.93,109.34,110.77,110.22,109.43,109.53,109.82,110.87,110.53,109.59,109.84,109.13,109.63,108.51,109.3,108.93,107.94,107.55,109.67,110.73,112.42,112.95,113.53,113.24,114.35,114.2,113.57,113.93,113.53,114.04,114.32,113.25,114,116.07,116.4,115.84,115.85,116.39,116.66,115.42,113.52,111.32,112.73,113.06,113.9,113.73,112.59,113.2,115.34,115.34,116.35,118.85,119.42,118.93,119.76,118.93,118.82,117.74,117.83,117.17,116.86,117.39,118.14,118.36,117.79,116.88,116.53,117.88,117.14,117.64,117.9,116.96,114.89,115.48,116.19,114.49,114.87,114.87,119.03,120,120,120.65,119.87,120.23,120.15,121.08,121.29,122.16,121.8,122.36,119.58,121.69,120.99,120.09,121.01,120.51,122.59,121.75,121.16,122.52,122.12,122.16,121.34,122.61,121.88,123.66,123.67,123.02,122.15,120.16,121.44,122.23,121.48,125.02,125.91,123.58,125.38,123.95,123.24,122.64,120.82,120.55,121.27,120.92,117.53,117.4,118.86,120.36,119.11,121.29,121.41,119.67,120.19,121.52,121.14,122.1,122.69,122.69,122.69,122.32,123.02,123.28,127.07,127.28,128.49,128.57,128.82,129.04,129.39,129.46,131.28,131.3,134.63,135.49,137.87,138.76,139.03,142.04,143.41,140.96,144.5,143.82,140.97,142.79,141.44,142.54,141.93,133.57,130.91,130.35,125.31,125.3,126.39,129.09,131.98,131.98,131.98,130.52,133.58,131.91,134.08,135.13,133.15,130.37,130.86,128.49,126.26,129.62,128.24,129.87,130.88,133.69,134.21,133.55,133.92,133.43,133.3,132.63,131.84,130.85,127.7,128.43,129.52,126.36,126.33,126.33,126.33,127.78,124.84,124.84,126,127.11,129.76,129.76,129.39,129.1,126.43,125.3,126.2,128.87,126.92,126.35,128.92,127.34,125.81,127.05,129.83,129.83,128.38,126.54,125.19,125.99,127.87,128.3,128.81,129.98,132.08,130.99,130.98,129.28,130.08,130.03,130.03,127.3,127.95,126.85,127.56,125.91,123.91,126.12,126.56,128.97,129.08,129.33,130.64,128.09,128.16,128.52,126.72,125.83,124.98,124.98,121,121.14,119.66,119.39,118.02,117.07,114.54,114.43,116.58,116.58,114.47,112.79,111.69,111.84,113.38,113.97,112.22,113.21,113.15,112.7,111.52,111.38,110.8,112.47,112.99,115.54,116.6,116.04,116.32,116.3,116.08,115.53,113.01,112.59,112.68,114.41,114.78,116.03,115.22,113.36,113.12,110.92,110.34,110.7,111.95,113.05,114.24,113.86,113.5,116.33,116.84,116.69,115.48,114.51,113.85,114.66,112.09,111.38,111.18,109.85,108.8,107.8,110.58,111.34,110.15,111.15,113.1,113.63,116.1,114,114,115.66,115.17,116,116,113.23,113.56,111.05,110.87,109.43,109.72,109.95,106.26,108.44,106.81,107.38,107.38,106.73,107.63,110.45,107.76,107.67,107.15,105.9,105.42,105.28,106.75,108.23,112.53,111.02,111.95,112.04,112.7,109.83,109.92,110.33,109.55,111.14,111.43,111.94,110.19,110.41,109.99,109.38,110.78,110.71,111.97,111.45,111.83,114.58,114.84,113.26,110.35,109.18,108.16,107.87,109.68,111.15,109.07,108.99,107.71,107.35,106.24,106.35,105.95,105.95,105.95,105.19,105.21,106.6,103.54,103.55,105.6,106.59,106.7,109.06,109.44,110.08,108.37,110.58,111.14,110.68,111.99,112.79,111.75,111.93,112.56,114.49,114.58,114.42,114.73,116.19,116.49,116.2,116.2,116.2,116.2,115.36,115.99,116.29,117.91,117.61,115.16,117.39,117.05,118.23,119.04,120.31,122.46,121.54,120.63,119.68,121.15,121.88,121.95,122.05,120.66,117.47,118.73,120.72,120.09,120.53,121.17,122.92,123.05,122.4,121.54,121.26,118.26,118.26,119.03,118.92,119.81,121.69,121.57,123.24,123.11,123.11,124.17,124.4,123.86,122.32,122.76,122.47,124.46,124.75,123.91,123.91,123.91,123.51,122.8,121.1,121.19,122.54,121.53,121.53,121.68,121.87,118.28,118.56,116.84,114.18,115.09,115.09,113.33,113.75,113.83,112.54,111.96,111.97,111.65,109.51,109.98,109.53,109.67,109.4,110.03,109.36,109.82,108.88,108.92,108.81,108.81,110.84,111.82,110.5,110.26,109.71,109.8,110.63,113.34,115,114.99,115.32,113.1,113.35,114.73,114.57,114.57,115.62,115,114.9,114.71,112.92,112.14,112.68,113.54,113.59,114.12,114.4,114.21,113.55,114.86,113.4,113.81,114.33,115.08,114.27,113.51,113.9,112.4,111.83,108.96,106.15,105.42,105.22,105.73,105.22,105.27,103.67,103.88,104.27,104.91,106.44,106.69,107.15,106.58,107.34,105.43,105.25,105.08,105.21,106.16,106.38,105.66,108.32,109.33,109.82,109.68,109.53,111.24,111.52,112.53,111.9,110.58,110.33,109.34,109.24,108.32,108.14,107.06,107.52,106.85,107.4,107.4,107.21,107.61,106.84,106.84,107.41,107.07,107.59,110.05,110.63,110.55,110.89,111.48,110.97,111.01,110.83,110.04,110.9,110.2,111.29,111.05,110.33,110.9,111.84,113.85,114.53,114.35,115.14,114.58,111.75,112.56,110.75,109.79,109.76,111.15,112.62,111.81,110.03,110.62,111.91,111.79,111.82,111.2,108.47,109.12,109.03,107.96,108.68,109.57,109.58,109.45,110.58,111.76,114.11,113.49,115.45,116.08,115.67,116.13,116.37,116.19,116.19,116.19,117.86,118.19,117.59,119.19,118.49,117.56,117.91,116.66,118.78,118.63,119.99,119.56,118.93,119.27,120.24,119.31,115.5,117.66,115.31,115.57,115.57,115.57,111.8,108.71,107.82,108.11,109.87,110.49,113.33,112.71,112.18,113.8,114.6,114.08,114.38,115.37,113.76,114.85,114.91,113.61,111.27,111.39,110.57,111.53,108.47,110.4,110.4,110.78,112.95,110.1,105.12,106.9,106.03,102.4,101.6,97.15,97.03,92.66,90.12,96.01,92.14,96.7,100.33,99.47,100.07,98.99,101.02,99.02,100.3,99.93,101.63,103.68,101.94,103.3,103.3,103.3,103.68,102.39,101.84,103.34,103.44,101.23,101.81,102.17,101.67,103.98,105.12,105.72,105.72,105.72,101.07,102.11,103.26,102.81,103.9,105.19,103.52,103.56,101.99,101.86,102.41,104.06,104.21,103.71,99.25,99.66,101.03,100.73,100.57,100.67,103.54,103.98,104.95,104.95,105.98,105.38,106.56,106.8,104.7,103.52,101.66,103.89,104.34,104.41,105.02,104.01,105.22,104.62,104.62,103.74,102.74,102.75,102.75,105.89,107.85,112.94,111.61,113.16,113.52,110.99,111.35,109.55,109.4,106.7,107.43,108.4,109.98,107.85,108.71,106.14,106.08,106.89,107.23,106.31,105.71,105.64,107.43,107.99,107.42,105.96,105.19,106.9,107.56,107.86,108.09,109.35,109.77,108.59,106.93,107.52,108.83,108.36,108.45,107.41,107.21,105.2,105.43,105.3,104.66,104.07,102.81,103.5,102.43,101.96,102.68,103.25,103.49,103.66,102.47,103.21,101.5,100.83,100.64,98.67,97.94,98.8,97.72,98.94,98.94,98.94,99.48,100.41,101.38,101.33,101.26,104.01,104.01,104.45,102.78,104.39,105.06,105.16,106.11,106.18,106.61,106.61,105.32,104.9,104.82,102.76,104.62,106.04,106.33,110.33,110.53,111.95,111.47,110.99,111.39,111.03,111.38,111.08,112.03,111.13,111.11,112.31,111.74,111.16,112.67,113.61,111.04,112.23,111.33,111.46,111.86,110.27,109.6,110.43,109.66,110.05,109.95,109.49,110.15,111.03,110.38,109.52,109.33,110.37,109.82,109.82,108.57,110.02,112.27,113.06,112.9,113.44,114.76,113.68,115.35,116.44,118.11,117.76,118.97,119.19,120.69,123.55,125.81,125.18,122.95,125.93,123.14,122.67,119.33,118.01,120.6,122.23,122.68,121.75,121.73,121.71,122.16,124.35,125.09,125.09,125.09,126.73,128.75,126.78,127.47,125.23,125.39,121.18,123.37,118.42,120.59,119.62,122.83,119.24,118.89,115.97,115.53,116.44,119.4,117.64,117.33,119.28,119.59,120.77,118.81,119.05,116.99,114.22,113.12,115.46,115.22,116.04,115.52,118.11,118.11,118.11,118.11,116.56,116.97,115.58,114.5,114.24,115.81,114.83,116.11,116.79,116.72,114.64,115.18,116.53,115.62,115.64,115.97,116.34,113.98,112.79,113.35,112.89,113.25,112.65,112.14,109.83,111.15,108.87,109.55,110.59,112.18,112.18,112.06,112.68,112.04,113.63,114.3,114.22,113.64,114.65,115.72,115.31,113.99,113.77,113.16,112.97,112.71,112.83,113.19,113.19,112.33,111.21,111.5,112.09,111.06,110.23,112.38,112.42,114.54,114.38,113.26,112.27,112.27,109.66,108.17,108.13,106.86,103.42,104.08,104.72,106.48,105.97,107.12,106.9,104.85,103.86,103.51,105.36,103.59,98.5,93.49,95.51,99.14,97.21,98.3,98.13,99.17,97.88,97.64,98.06,100.01,100.53,99.66,98.74,97.55,95.37,96.34,93.87,92.05,92.82,95.8,95.56,94.1,94.31,94.71,96.69,97.62,98.35,97.83,98.67,99.69,99.49,96.69,98.83,97.27,95.62,94.09,92.71,94.13,90.95,90.97,90.97,91.96,90.6,90.38,91.81,92.24,91.88,91.88,89.72,89.66,88.58,91.74,92.4,94.75,93.17,93.17,93.17,94.4,94.46,96.19,97.67,97.64,98.52,98.15,97.49,95.75,95.31,94.36,93.7,93.32,93.25,94.26,92.87,92.59,92.72,93.82,95.27,95.96,95.66,97.14,96.79,95.14,94.45,94.02,92.94,92.6,92.76,90.3,89.48,88.11,88.72,89.56,89.03,87.12,89.78,89.74,91.16,90.32,90.03,88.64,87.84,87.91,86.53,84.68,85.72,86.29,86.38,86.36,86.36,86.28,85.27,85.25,86.72,86.22,86.13,84.4,84.96,86.66,88.08,88.12,90.68,90.57,90.07,89.11,88.96,88.88,92.25,92.52,91.16,89.53,89.62,87.3,86.44,87.91,87.91,87.91,87.91,90.38,90.44,89.63,91.85,92.55,92.49,90.74,89.79,91.38,91.72,89.89,89.03,87.08,87.57,84.56,84.14,84.48,84.79,83.26,83.18,80.93,78.05,76.2,75.7,76.39,74.34,69.02,64.48,72.54,77.99,77.56,76.28,79.37,80.39,79.26,76.69,77.87,79.1,80.12,79.24,79.36,81.82,81.82,80.11,78.92,78.86,75.9,76.49,77.02,77.76,77.76,77.76,75.47,74.74,73.3,73.41,70.38,71.04,71.45,72.84,76.85,76.85,76.51,75.15,74.94,71.7,71.7,70.1,71.28,69.43,71.67,71.87,74.51,74.64,72.64,74.98,73.94,72.47,72.63,72.41,74.57,76.39,78.09,77.34,76.52,76.52,78.97,78.63,80.86,80.09,80.12,77.29,77.21,78.47,76.43,77.57,77.91,79.49,77.23,78.58,80.32,82.3,83.11,81.01,80.72,80.72,80.52,80.47,79.45,79.38,79.51,77.08,75.72,75.24,75.03,73.26,75.48,74.73,75.59,74.75,74.82,74.51,75.65,74.66,74.57,72.5,72.4,70.56,70.93,72.43,72.67,71.82,71.54,69.95,71.84,72.2,71.75,70.84,71.12,70.55,70.75,70.49,70,69.13,72.11,72.87,72.36,72.02,72.28,70.99,70.25,69.25,69.02,68.58,67.77,69.79,69.79,69.84,68.13,68.53,67.6,66.73,67.44,65.99,65.23,64.38,64.62,64.76,62.74,62.25,62.27,61.66,61.66,65.54,65.13,63.96,61.92,60.33,59.93,58.55,59.27,59.31,60.61,58.94,58.04,58.09,53.85,54.54,54.93,55.2,52.95,52,54.85,56.38,54.44,57.72,59.34,58.99,58.27,57.04,61.78,62.96,66.01,65.55,64.65,64.49,63.19,62.13,62.59,63.09,62.87,61.83,65.66,67.11,67.22,67.05,70.61,70.05,67.73,70.19,71.96,69.79,70.07,70.57,69.4,69.86,69.54,68.15,68.44,70.71,69.94,69.94,69.94,71.31,70.5,70.59,70.59,71.95,74.39,75.52,75.21,76.71,76.48,76.97,76.98,77.82,77.39,77.01,77.29,76.99,78.79,78.79,78.79,78.79,81.14,81.85,78.92,78.17,79.6,79.03,77.78,75.69,76.15,75.69,77,75.03,75.22,74.86,73.89,74.65,73.61,74.37,72.91,71.94,72.23,70.58,70.23,69.29,72.8,72.2,73.07,73.04,72.78,70.83,70.01,67.87,69.39,67.79,69.07,68.25,69.66,68.12,68.96,69.91,71.98,71.54,70,70.86,72.43,72.89,73.37,73.07,72.39,72.39,72.59,72.59,72.59,73.18,72.3,72.39,72.8,74.29,73.73,72.53,72.6,71.22,70.89,69.5,70.06,70.28,70.57,70.57,70.33,69.38,70.74,71.57,72.62,70.91,70.37,70.49,70.16,71.39,71.48,69.88,70.71,69.43,70.48,69.53,68.21,66.69,66.69,65.82,66.16,64.89,64.75,67.68,68.06,68.22,68.87,68.86,69.38,69.34,69.68,69.25,71.31,71.94,71.35,70.07,68.5,68.5,67.33,67.09,68.49,68.66,67.66,67.65,69.39,69.63,68.33,66,65.27,65.65,66.29,67.15,68.9,69.06,69.06,67.38,67.19,67.01,67.54,66.03,69.53,68.95,70.23,71.68,72.64,72.17,70.22,70.04,70.89,70.9,69.36,69.63,69.79,68.86,67.63,67.03,66.05,66.25,64.72,63.49,64.2,64.41,65.99,65.02,65.76,67.24,66.93,66.67,66.67,68.79,67.35,67.42,66.49,66.49,66.32,65.91,65.65,66.07,66.43,65.38,65.65,65.09,64.22,65.94,64.54,63.5,63.91,63.07,64.73,64.73,62.64,61.94,61.99,62.9,63.15,63.73,64.57,65.99,64.39,63.7,64.15,63.97,62.37,61.82,61.82,61.06,61.63,61.69,62.95,62.75,61.72,61.69,62.24,63.72,65.09,64.09,63.59,63.49,62.13,63.06,62.8,65.32,64.4,62.9,64.26,63.98,63.96,64.97,63.61,63.44,62.72,61.27,61.67,60.66,60.05,59.06,59.63,59.13,58.94,58.25,59.11,58.44,58.68,60.02,59.32,58.88,59.09,59.17,57.79,57.79,57.79,59,60.7,60.73,59.72,59.26,59.48,59.03,57.71,57.38,57.08,57.85,57.72,57.34,56.26,54.04,54.46,53.98,52.66,54.13,56.36,57.58,56.44,56.95,55.54,54.69,55,54.95,54.93,57.63,57.08,56.43,55.87,55.87,55.87,56.71,56.97,58.53,57.75,58.11,59.41,60.63,60.7,60.26,61.14,59.89,59.78,60.32,60.15,58.57,59.73,59.11,59.56,60.53,62.64,62.46,62.19,61.28,61.57,60.86,61.11,62.18,60.62,60.59,61.33,60.31,61.18,61.18,61.18,62.76,61.86,61.86,61.74,61.79,62.07,63.35,63.21,61.9,61.66,60.47,60.54,61.11,60.5,61.4,62.69,64.23,64.44,66.01,66.15,66.05,66.05,67.77,68.93,69.2,68.72,67.98,69.08,70.74,71.19,70.98,70.98,72.35,73.01,73.33,71.82,71.78,70.56,69.54,70.42,70.4,69.04,68.05,67.31,68.77,69.01,68.88,69.02,68.55,68.55,67.93,66.96,67.61,67.12,67.1,67.05,69.36,69.03,67.8,67.82,68.06,68.2,66.58,66.67,66.67,67.12,67.97,68.13,67.2,66.17,66.07,65.82,67.09,68.78,67.61,66.51,66.3,66.4,64.91,65.85,65.22,64.67,63.35,63.28,64.02,63.03,64.3,64.08,62.91,61.87,61.62,62.47,62.56,63.36,63.48,63.69,63.44,63.54,64.88,65.55,65.23,64.67,65.53,65.48,66.11,66.4,65.55,65.77,66.66,65.4,65.32,64.58,64.28,64.28,63.2,63.45,62.99,63.36,63.93,64.12,65.03,65.03,66.39,67.19,67.27,70.69,71.23,74.61,76.86,79.07,79.07,84.66,83.33,85.88,87.71,78.79,77.55,80.24,80.24,79.81,76.63,76.52,75.59,78.67,77.29,77.52,78.74,77.48,77.76,77.82,78.1,76.72,76.48,77.31,77.57,79.56,77.53,79.46,78.56,77.44,75.04,75.08,73.42,73.49,74.3,74.57,74.66,74.07,72.51,72.25,72.14,73.99,72.91,73.14,73.8,74.46,74.6,73.85,75.14,77.5,76.92,76.33,77.49,75.67,75.1,74.81,75.6,75.3,75.22,75.95,76.9,76.9,76.9,76.92,76.65,76.75,74.65,75.38,75.13,74.22,73.6,73.48,72.63,72.06,73.57,73.82,74.74,74.85,76.18,77.08,75.57,75.43,76.99,77.73,77.72,77.72,77.72,77.72,77.75,80.48,79.66,80.97,81.96,83.67,82.57,84.84,84.26,87.72,87.64,89.24,89.11,87.63,91.25,90.75,89.49,92.58,91.96,88.62,88.65,88.1,90.87,94.11,93.85,91.86,92.18,91.41,90.97,93.47,94.01,96.63,96.48,94.23,92.05,93.19,90.72,91.12,91.36,90.62,89.67,89.89,89.83,88.65,88.65,76.47,78.24,79.34,80.74,82.14,83.87,84.05,81.9,83.15,83.15,83.15,83.71,85.45,84.83,85.08,85.07,84.95,85.03,85.03,86.66,86.66,86.98,86.78,87.39,87.48,90.12,88.3,90.47,89.6,89.16,89.08,90.43,91.19,90.1,90.38,88.84,89.18,88.9,90.12,88.78,88.01,89.7,90.3,91.44,90.86,92.44,92.31,93.34,91.92,91.13,91.92,91.54,90.49,88.56,89.78,90.52,92.24,93.28,92.69,92.26,91.37,91.37,91.86,91.06,90.64,90.64,91.69,90.52,91.27,91.47,91.94,93.46,93.3,93.21,94.62,95.18,95.55,97.3,97.47,96.34,96.62,96.29,95.16,93.53,92.7,93.64,94.24,94.05,94.57,93.66,93.58,93.88,96.34,96.12,95.17,95.11,94.82,94.9,94.49,95.6,97.37,96.32,94.97,93.88,94.21,96.04,95.9,95.29,94.1,95.36,96.04,97.31,98.21,97.5,98.6,98.81,98.83,101.04,99.57,99.73,98.66,97.82,99.42,99.44,97.95,99.54,100.61,100.61,102.39,101.69,100.8,100.8,100.27,100.34,98.53,97.1,95.59,97.4,97.49,94.88,97.21,97.95,97.11,97.92,98.59,99.68,98.72,98.72,98.41,96.53,97.48,96.58,96.48,98.51,97.58,99.43,99.62,100.43,101.07,98.95,98.22,96.6,96.35,96.27,93.91,95.59,96.43,96.47,96.49,96.13,96.58,96.68,95.06,95.88,96.85,95.64,94.09,94.28,94.07,95.59,93.89,92.21,93.11,93.09,93.72,94.12,93.85,93.86,93.86,93.86,93.62,94.66,93.85,96.54,96.32,97.33,96.22,95.17,95.27,97.08,97.76,98.08,97.57,97.08,96.17,95.76,96.05,95.96,96.45,96.31,97.34,100.15,100.58,98.1,95.6,95.32,95.27,95.74,95.09,96.53,97.31,97.58,96.6,95.1,95.5,95.5,95.5,95.5,94.33,96.84,94.84,95.12,92.8,93.28,91.62,90.64,89.33,88.98,90.84,90.35,91.71,91.65,91.6,91.3,92.82,92.93,93.03,91.56,90.27,87.47,89.49,90.37,88.34,89.01,88.43,88.17,89.54,89.04,89.04,89.04,89.04,91.36,90.67,91.13,90.57,91.3,91.79,93.76,93.13,93.7,94.16,92.67,91.94,92.4,92.19,91.02,92.71,91.41,91.41,92.38,91.92,92.66,93.91,93.59,93.54,93.52,93.46,93.27,91.51,90.53,90.97,90.6,89.23,90.03,90.03,90.3,89.1,88.07,88.71,89.58,92.26,90.51,89.51,88.83,87.82,87.65,87.59,86.52,88.17,88.19,86.76,85.75,83.98,83.98,83.33,81.7,81.76,80.11,78.55,80.07,79.58,79.58,80.15,81.07,82.25,81.81,85.12,84.2,84.64,84.92,85.32,86.17,87.58,85.67,88.25,88.03,86.87,87.94,87.08,88.08,88.82,90.79,91.02,90.68,91.1,90.28,90.59,89.48,89.83,90.78,89.79,88.93,88.72,87.82,88.86,89,89.19,90,90.91,89.19,88.92,89.85,89.3],"KOSPI200":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100],"Nikkei225":[null,100,99.93,100.9,101.13,101.12,101.79,102.06,101.64,101.32,101.36,99.61,99.95,99.26,98.01,98.7,98.7,98.53,100.42,100.42,100.1,98.85,99.68,98.37,99.74,98.28,99.17,99.99,100.49,100.97,100.73,100.73,101.72,100.61,100.22,100.71,100.97,101.35,101.56,102.98,102.67,102.97,103.75,103.91,103.58,104.24,104.11,104.21,102.37,102.37,101,102.63,102.59,97.1,103.63,103.81,105.59,105.56,106.72,106.72,107.35,108.18,108.52,108.52,109.54,109.82,109.68,109.38,109.39,110.61,110.09,109.19,109.7,110.51,112.12,113.5,114.44,115.01,115.03,115.15,115.91,115.86,116.47,116.17,116.07,116.07,115.89,115.93,115.92,114.38,114.2,114.2,114.2,117.07,116.63,116.23,116.23,115.32,115.7,114.32,115.23,114.09,112.4,112.89,113.95,114.34,112.87,112.25,113.86,115.92,116.31,115.72,113.76,114.4,113.01,113.03,113.38,112.98,113.56,112.97,115.78,116.26,114.95,116.13,115.59,114.92,115.02,115.8,115.79,115.74,115.21,114.16,114.23,115.87,116.89,116.32,115.78,115.57,115.04,115.42,117.13,117.3,117.16,116.97,117.04,116.63,116.63,116.24,113.76,114.03,115.09,113.43,114.73,114.82,113.9,112.98,113.42,112.38,112.69,111.11,111.51,112.31,112.01,110.84,110.09,109.55,109.67,110.04,110.13,110.12,111.25,112.78,113.99,115.25,115.02,114.69,115.37,116.18,116.18,116.18,116.18,118.87,118.55,118.9,119.26,118.8,118.71,119.01,118.39,116.83,117.05,117.57,117.18,117.96,118.38,117.62,117.6,117.57,117.4,118.66,120.55,120.51,119.37,119.4,118.95,119.57,118.95,118.89,118.8,118.49,119.15,119.9,120.87,120.32,120.15,120.28,120.41,120.84,120.27,120.81,119.69,119.83,119.69,119.98,119.46,119.07,119.98,120.66,120.08,120.09,120.2,120.2,119.49,119.62,120.36,120.09,119.35,119.22,119.79,119.97,119.25,119.05,119.41,119.97,119.67,119.21,119.83,119.47,117.93,117.88,117.88,116.73,118.02,117.87,117.72,116.33,115.87,115.81,116.11,115.63,116.22,116.21,115.68,116.54,117.38,117.65,116.55,115.82,115.66,115.89,115.16,116.78,118.16,118.69,118.34,118.95,118.95,121.28,121.35,121.57,121.26,121.87,121.46,121.09,121.66,121.62,121.89,123.16,123.24,123.25,123.62,123.62,124.41,124.76,125.2,126.39,126.99,127.48,127.64,128.15,128.2,129.63,130.28,129.69,129.89,131.49,131.51,131.51,133.95,134.66,134.66,134.72,137.04,136.9,136.63,135.51,133.72,133.71,131.61,133.54,133.81,133.01,133.93,134.57,134.57,134.73,134.4,134.35,135.01,135.77,136.33,135.67,135.16,132.5,134.42,136.29,137.05,136.62,135.97,135.59,134.75,136.83,136.63,136.77,136.62,136.84,137.05,136.77,136.89,136.13,136.01,136.01,136.01,140.44,141.69,141.69,142.49,142.13,141.66,141.32,141.69,143.1,142.6,141.98,142.24,142.29,144.13,143.04,141.42,141.19,141.18,139.16,138,140.32,139.06,135.52,129.11,129.32,130.79,127.75,127.75,126.93,126.39,128.24,129.77,132.33,130.99,131.27,129.87,130.8,132.36,133.77,131.85,129.8,126.55,125.72,127.96,126.98,127.67,128.27,130.39,131.25,130.11,130.27,129.51,128.34,127.74,127.74,129,123.18,124.07,127.36,125.65,126.42,128.18,127.79,127.21,127.38,129.32,128.86,129.52,130.21,129.57,129.41,130.12,130.46,130.53,132.39,132.58,132.41,131.97,133.1,132.73,133.35,134.24,134.24,134.48,134.27,134.27,134.27,134.23,134.48,133.88,134.41,135.97,136.61,136.33,135.73,136.45,137,137.43,137.18,135.56,134.05,134.13,134.32,133.58,131.55,132.65,132.47,134.29,134.66,135.18,136.36,135.59,136.25,136.69,137.22,135.85,136.53,135.51,133.11,134.76,135.58,134.53,133.46,133.48,133.07,133.06,133.26,130.32,130.16,129.75,128.73,130.18,131.75,132.62,131.04,132.56,135.01,135.01,135.61,136.19,136.01,135.61,133.81,134.49,135.11,134.95,135.7,134.7,134.75,135.9,134.5,134.58,134.47,135.4,135.29,135.02,133.22,130.59,133.57,132.66,132.59,133.06,132.63,132.75,133.61,133.9,135.04,136.22,136.3,136.51,136.64,136.61,135.67,135.61,134.91,134.36,133.28,133.67,135.41,135.05,136.35,137.98,137.98,139.93,141.43,141.45,142.61,142.61,143.03,143.59,142.18,144.11,144.86,145.01,144.05,143.25,142.1,142.1,140.22,140.44,134.97,135.59,133.06,134.72,136.47,135.37,134.62,135.11,131.51,131.99,127.07,126.57,126.36,128.2,130.97,129.58,132.9,130.84,132.32,131.95,134.35,132.94,133.05,130.31,130.52,130.27,129.53,130.37,128.95,128.5,129.33,129.33,130.32,131.16,132.5,133.01,133.54,134.88,131.66,130.96,128.46,129.52,126.78,126.35,129.07,130.34,127.71,128.5,126.16,125.39,121.84,120.49,120.49,114.45,115.47,119.96,119.58,119.58,119.58,119.58,116.88,119.73,120.71,122.04,120.47,121.64,121.64,122.81,122.14,121.9,123.47,123.79,123.21,123.04,122.93,124.11,123.37,123.46,122.82,124.11,124.2,124.77,124.54,124.71,123.98,121.48,121.48,124.66,126.33,126.3,124.87,127.15,127.28,128.04,128.24,128.01,128.62,128.15,128.79,127.77,129.07,130.38,129.81,129.03,128.19,125.62,126.21,128.48,127.2,127.18,128.16,128.96,128.85,129.1,129.1,129.21,125.33,128.03,127.73,125.67,126.7,128.51,128.49,129.73,129.8,130.29,130.02,130.26,129.57,129.72,130.67,132.45,132.77,133.1,131.98,132.64,132.74,132.99,132.64,133.28,132.99,132.99,132.99,132.99,132.99,132.99,132.99,130.99,129.07,127.87,127.53,126.61,125.87,126.59,125.84,126.96,127.27,127.09,127.16,126.37,126.17,126.56,127.02,125.49,125.12,123.08,121.95,121.93,124.13,124.12,124.78,126.27,126.69,126.24,125.66,126.17,126.21,125.3,127.46,128.23,127.01,127.18,126.62,125.98,127.49,127.12,129.83,129.97,129.28,129.66,129.93,128.66,128.84,128.65,129.31,129.56,129.56,128.66,128.27,125.74,128.26,127.96,129.18,129.71,129.99,129.4,129.15,129.7,128.58,128.7,125.99,123.8,122.99,122.58,123.04,123.58,123.58,122.21,123.41,121.92,121.99,122.86,123.54,123.19,123.24,123.74,121.05,122.22,122.36,122.25,123.7,123.2,123.23,123.37,125.98,126.66,127.37,127.81,129.04,130.01,131.37,131.37,131.45,131.21,131.71,131.91,131.91,132.03,131.56,131.73,130.72,129.98,130.76,130.12,127.51,127.92,127.71,128.98,128.19,128.76,130.24,130.24,132.68,134.27,134.14,134.39,134.72,134.72,135.18,135.93,136.22,136.62,137.26,136.48,136.98,136.52,136.52,138.92,139.23,139.39,139.76,139.4,140.52,139.33,138.26,139.23,139.91,139.16,138.3,137.65,138.09,139.17,139.65,140.03,139.86,139.17,140.58,139.69,138.22,139.21,139.53,139.99,139.87,139.76,139.95,143.53,143.11,143.79,143,142.58,142.3,142.32,142.38,142.09,142.94,142.42,141.34,141.34,141.34,141.34,138.64,140.86,138.64,141.84,142.5,142.5,143.54,142.89,142.99,143.64,143.89,142.58,143.58,142.17,142.36,139.47,138.7,139.68,137.28,138.64,137.25,137.92,139.33,142.64,142.36,141.51,141.51,142.56,142.36,141.52,140.54,138.57,139.81,140.28,139.73,139.73,135.06,133.99,131.13,126.32,127.52,125.96,126.06,127.43,123.97,117.69,118.7,116,110.89,104.14,101.58,101.64,99.93,98.9,98.9,100.9,108.09,116.78,111.51,115.84,114.03,113.02,107.93,106.46,106.47,110.99,113.22,115.63,115.58,116.5,113.78,117.33,116.8,115.25,118.88,117.52,115.2,114.34,116.08,115.08,118.2,118.13,118.13,120.65,117.22,117.22,117.22,117.22,117.55,120.56,121.83,121.68,121.09,118.98,119.72,120.29,122.08,123.05,122.79,121.81,123.92,127.09,127.97,130.94,130.71,131.81,133.39,135.11,135.6,136.6,138.48,137.96,138.16,134.27,133.27,128.64,134.92,134.16,133.57,134.3,134.05,134.72,134.63,132.99,134.5,131.41,133.16,132.17,132.31,133.27,135.71,135.11,134.06,134.6,133.18,136.13,134.95,137.09,136.04,135.6,135.73,136.72,135.93,135.93,135.93,135.72,135.37,133.81,133.47,129.71,132.61,134.87,134.52,133.94,133.41,133.41,135.92,136.48,138.91,139.14,137.99,137.72,138.08,136.7,136.94,137.33,139.19,139.15,138.66,136.71,138.25,138.24,138.89,140.2,138.64,137.95,139.05,137.61,138.82,139.84,140.76,140.13,140.26,139.32,139.57,139.57,139.57,139.49,137.94,138.64,140.47,140.64,138.52,138.52,137.59,139.28,140.01,139.94,141.28,141.12,140.75,141.01,141.16,140.45,139.87,141.43,140.8,141.24,140.25,140.5,140.37,140.32,139.92,139.4,137.28,139.18,139.18,141.57,144.02,145.33,148.41,148.8,151.45,152.48,151.67,154.78,155.43,153.72,153.16,152.52,152.52,156.33,157.11,158.55,159.19,157.93,160.05,160.13,160.18,159.83,158.61,158.13,160.23,159.86,159.24,159.72,159.45,159.87,160.16,159.9,159.61,157.95,158.48,159.33,159.26,160.44,164.71,163.97,163.97,162.86,162.26,161.65,164.24,168.12,168.12,168.27,170.02,171.46,170.39,168.74,171.07,170.42,171.81,171.06,172.2,170.55,171.08,168.47,165.28,167.83,169.45,171.15,169.33,171.94,175.58,176.29,176.63,176.63,176.37,179.74,182.03,180.98,180.65,179.35,180.17,180.17,177.28,180.24,173.06,177.23,175.7,176.6,172.85,172.45,171.73,173.43,173.48,174.53,177.55,177.85,178.77,178.73,180.53,178,174.3,173.24,169.71,171.65,174.32,175.56,175.85,174.33,175.59,178.37,179.77,177.43,177.63,177.5,177.85,176.48,177.75,176.97,177.1,177.35,177.36,173.86,170.33,174.39,173.39,174.02,173.22,173.59,173.59,172.14,172.14,172.14,172.14,175.24,175.4,176.36,170.93,168.17,163.99,167.79,166.24,169.72,167.55,167.88,169.19,169.47,170.6,171.13,170.57,174.16,172.43,172.15,172.94,173.61,172.91,173.38,173.05,172.43,173.02,172.96,174.23,175.9,175,173.37,173.05,167.35,172.57,172.52,172.52,173.66,173.55,172.14,172.02,171.51,171.97,170.86,171.13,169.48,167.99,166.93,170.69,171.58,170.92,168.96,167.31,165.21,163.63,164.59,164.59,164.59,166.29,167.11,164.79,165.99,163.01,165.98,165.15,164.8,165.66,166.21,166.21,166.62,167.71,167.38,167.15,164.44,163.85,164.82,162.99,161.39,164.27,165.69,165.64,165.75,165.15,166.03,167.82,169.98,170.54,174.03,177.21,178.74,180.32,179.29,181.52,181.91,183.24,182.3,181.17,182.23,182.23,178.28,177.08,177.08,180.72,180.67,180.34,176.52,175.97,171.9,169.95,166.23,164.47,165.37,167.58,170.27,168.67,168.13,170.58,173.67,173.42,174.55,174.79,171.52,172.1,170.88,173.9,173.85,172.19,172.62,177.13,176.38,176.38,178.01,176.92,176.29,174.97,173.9,174.92,176.91,177.9,178.09,177.38,176.84,177.72,177.89,177.89,175.07,176.25,171.78,168.99,166.22,166.9,165.82,167.47,166.86,170.01,172.43,171.62,169.9,171.12,169.87,170.04,173.66,170.55,166.92,170.38,170.65,172.06,171.96,171.33,173.68,172.71,172.02,172.02,172.02,175.07,175.25,170.2,170.15,170.15,168.62,171.86,170.21,168.03,169.28,168.83,164.11,165.93,164.43,164.83,162.1,161.38,156.36,159.63,161.33,161.78,164.5,162.76,163.94,162.8,163.01,164.78,165.47,165.47,161.79,160.51,164.07,162.71,162.04,160.78,158.03,158.03,155.17,158.19,158.49,160.39,157.69,158.79,155.25,150.69,148.12,147.68,153.49,150.34,151.2,151.44,153.92,159.24,160.28,160.28,162.65,167.53,167.95,168.18,166.95,168.8,167.45,166.22,165.29,165.71,166.02,163.41,160.65,161.23,160.25,157.34,160.38,162.34,161.87,160.12,161.23,162.62,164.62,161.94,158.87,159.52,157.65,160.41,160.41,160.23,160.23,160.23,160.23,161.34,157.25,156.34,156.62,153.84,157.89,158.61,159.28,160.78,157.75,159.76,161.32,159.81,159.39,158.95,160.01,163.52,162.99,164.05,163.79,165.86,166.79,166.95,168.69,168.76,166.24,161.24,159.1,157.29,157.92,155.12,153.97,156.81,156.23,156.36,158.28,160.55,161.61,160.15,157.69,154.96,156.26,157.87,155.98,158.27,158.43,160.19,157.35,158.2,159.18,160.05,160.05,161.09,165.38,166.11,166.78,165.49,165.23,165.59,166.19,166.1,167.25,164.87,165.75,166.88,168.34,168.78,167.29,166.21,166.21,170.56,172.5,172.48,174.59,172.92,172.85,172.04,169.99,169.16,170.15,171.12,166.57,168.46,167.84,165.27,165.2,165.02,165.06,163.89,167.68,168.57,170.53,170.96,166.21,166.55,164.71,164.71,165.43,163.19,162.23,162.23,157.92,158.76,156.38,157.86,154.96,156.63,161.27,162.03,163.17,162.01,162.01,157.74,157.71,156.76,161.86,159.97,162.25,162.85,161.36,160.66,161.16,162.81,163.89,163.38,161.94,164.82,165.37,165.28,165.28,162.51,164.47,166.53,165.59,163.98,168.86,167.07,167.23,167.46,166.87,166.69,166.96,167.98,167.98,169.58,168.98,168.26,167.46,167.1,168.64,165.96,166.22,166.61,165.42,164.75,166.7,166.35,167.02,168.22,167.6,164.46,162.73,158.73,157.66,158.37,156.75,157.76,158.02,157.37,155.9,155.9,155.9,155.9,153.65,154.27,155.18,155.18,156.39,158,158.03,156.05,154.28,156.17,160.07,157.76,158.65,160.75,163.1,163.67,163.48,163.6,163.9,163.27,163.39,163.72,164.36,165.46,165.41,164.94,164.81,165.32,163.87,164.92,164.31,165.48,164.38,164.49,164.14,161.94,161.94,164.02,163.85,163.98,164.4,164.3,166.86,168.71,169.14,169.94,171.01,168.15,166.29,162.64,162.69,161.38,163.31,160.99,160.99,164.1,163.82,163.62,164.16,164.41,166.59,165.99,167.54,168.41,169.01,166.17,164.14,164.41,165.1,166.83,167.78,168.23,170.24,170.36,171.23,170.91,171.22,170.66,170.84,170.99,169.78,170.02,172.41,174,174.21,174.21,174.21,174.21,172.96,174.71,173.99,174.02,175.58,177.01,178.3,179.8,182.67,184.07,185.73,184.96,183.32,184.02,184.71,186.61,187.17,184.54,186.1,188.34,192.49,194.22,190.67,189.04,192.77,193.78,197.27,200.16,200.06,201.38,199.38,199.49,200.6,198.74,195.86,195.36,194.4,198.32,198.56,198.29,201.66,199.69,199.19,195.81,193.51,192.32,192.4,190.85,193.69,193.53,193.53,194.14,196.54,194.12,193.01,195.38,195.27,195.18,196.51,195.72,198.19,200.01,195.42,192.14,192.34,192.71,193.44,192.41,194.02,194.02,191.55,192.61,189.79,188.95,187.91,188.59,190.33,191.25,192.9,188.94,192.2,192.54,193.18,194.89,195.43,196.8,197.38,198.6,197.11,194.81,193.98,195.83,195.41,198.17,200.35,200.35,198.61,197.3,194.6,193.59,195.24,193.07,193.41,190.43,190.34,189.75,186.63,182.39,185.66,185.18,185.18,189.67,190.81,194.14,193.08,189.15,191.43,191.44,187.79,186.76,185.21,185.59,186.83,182.83,185.16,183.4,184.37,188.81,190.89,190.89,195.42,192.81,192.18,195.05,194.58,194.68,195.35,200.27,199.7,200.66,199.48,199.28,199.86,199.86,200.9,199.84,199.6,199.08,200.07,199.74,198.54,195.82,199.83,196.32,193.03,195.92,196.23,196.72,195.29,196.99,195.72,198.47,201.2,198,198.17,198.68,198.99,201.23,200.39,199.94,199.94,199.94,198.88,199.42,199.42,201.72,205.78,209.41,212.56,214.5,212.81,211.97,211.9,214.87,218.35,218.18,216.44,216.5,213.6,215.25,215.48,216.8,215.15,216.03,217.2,216.05,215.8,220.24,220.45,220.45,226.82,225.26,227.98,229.95,229.85,229.21,228.6,233.6,233.6,234.41,234.44,234.25,234,238.45,239.64,239.57,239.53,236.59,237.13,231.94,231.8,231.19,231.86,231.26,237.43,239.01,239.01,243.86,244.29,241.46,241.36,243.54,239.99,241.19,237.81,238.02,235.71,237.63,232.96,235.08,237.63,236.49,235.65,236.14,234.4,229.85,226.81,227.51,221.47,223.68,224.36,229.78,224.82,226.65,226.65,229.46,228.67,228.45,228.45,228.45,232.02,228.24,227.48,228.4,228.11,229.16,229.34,232.53,231.74,233.43,232.69,230.72,233.63,230.9,232.41,232.15,230.36,227.36,229.95,232.55,232.04,229.96,231.24,231.12,233.24,233.82,232.27,231.34,231.9,227.65,229.92,230.45,230.82,230.6,231.84,234.04,237,235.05,236.49,236.78,239.43,242.45,244.44,244.44,243.65,248.43,249.93,252.27,246.1,246.1,246.6,245.54,239.74,239.37,236.59,236.56,233.94,226.26,225.05,229.84,230.18,233.62,227.79,214.55,187.95,207.17,209.65,208.1,209.26,209.26,216.48,217.73,219.43,227.41,223.38,227.41,226.75,228.3,229.21,227.69,228.76,229.26,229.2,230.91,231.22,231.14,221.35,219.01,217.42,216.38,216.04,212.81,220.06,218.56,218.56,216.3,217.36,221.99,225.39,225.39,226.68,226.26,232.57,237.97,226.55,230.93,225.89,230.33,230.83,235,232.64,234.67,235.29,236.63,236.63,238.45,234.09,232.48,232.9,232.74,229.5,227.66,227.89,226.52,230.65,232.43,234.67,233.5,227.36,227.36,229.87,235.88,235.29,236,236.2,235.26,231.35,230.24,230.88,228.35,229.51,229.14,227.19,228.73,231.7,229.68,227.84,229.12,228.28,230.1,234.5,234.66,235.37,233.55,233.97,235.21,235.23,238.08,235.82,235.74,235.19,233.5,231.9,231.23,233.97,233.23,233.79,236.4,240.66,238.35,238.35,238.35,238.35,234.84,239.48,238.87,236.63,234.15,234.15,229.87,229.69,230.46,229.73,232.43,233.18,236.87,238.74,238.58,236.39,233.11,235.49,236.08,236.43,230.14,231.81,232,233.41,231.74,231.82,231.82,232.79,235.77,233.9,234.05,234.63,233.99,231.09,231.68,231.68,228.46,227.89,228.57,221.99,225.75,223.04,223.56,225.27,220.39,221.23,219.82,219.98,219.81,221.38,223.43,226.11,225.55,225.55,225.11,224.7,225.72,227.2,225.84,221.78,212.8,212.84,213.45,207.53,201.83,186.03,197.24,189.48,206.78,200.66,203.03,204.74,202.66,205.39,207.5,204.81,204.45,208.33,209.35,213.33,214.13,214.13,215.36,217.79,220.05,220.05,220.05,219.74,220.63,224.07,224.91,228.13,227.8,225.57,225.56,224.04,224.22,222.85,220.98,222.02,224.24,225.39,225.38,229.62,226.83,223.87,223.73,225.53,224.37,225.49,227.56,228.3,229.55,228.07,226.04,228.9,230.24,232.32,229.95,229.44,229.15,231.76,232.66,236.5,239.89,241.9,238.9,237.57,237.71,237.85,236.52,237.13,237.92,236.87,236.41,235.76,237.06,236.97,238.39,237.9,237.9,237.64,245.98,249.9,247.68,244.95,243.01,242.9,245.38,243.76,240.72,242.27,243.73,245.31,249.86,249.86,255.22,258.55,254.81,259.17,261.18,260.17,256.24,254.58,254.72,255.76,253.29,254.04,255.89,255.23,252.06,252.79,250.57,254.4,257.02,260.75,259.65,261.91,265.11,267.47,267.47,268.27,267.61,270.67,269.13,271.81,271.81,272.62,273.37,270.98,269.12,268.45,266.17,268.48,273.45,286.45,286.49,285.2,290.25,287.31,287.31,279.89,284.83,288.44,284.28,293.86,294.64,294.59,290.61,294.55,301.79,300.04,306.54,306.65,313.14,313.14,307.68,300,304.01,300.38,304.18,303.77,305.08,306.39,300.98,300.67,290.98,289.99,297.68,290.52,290.52,290.72,296.1,299.73,300.25,294.57,294.57,297.92,304.87,301.67,302.21,302.64,302.33,299.62,303.73,299.73,295.05,295.82,292.76,295.79,301.13,301.2,300.79,301.17,303.21,301.88,300.76,300.76,300.76,309.68,313.78,310.45,305.41,310.32,310.32,319.94,324.67,323.29,322.25,320.14,316.6,315.31,320.77,321.71,315.97,318.65,318.8,318.9,318.58,314.59,326.93,324.38,321.54,324.14,336.75,344.44,344.44,344.38,340.21,339.4,337.96,341.41,343.35,339.51,339.51,342.47,350.01,351.03,351.61,346.87,336.25,324.1,330.26,332.31,315.03,324.11,328.76,325.34,321.55,321.14,320.84,330.03,318.88,318.88,307.79,312.19,321.13,320.26,318.88,310,305.09,321.07,313.45,317.39,319.13,319.22,336.42,333.95,340.1,337.58,345.79,347.33,355.6,349.37,351.46,354.59,356,353.34,356.78,361.69,357.98,357.98,354.2,355.57,355.57,355.57,355.57,375.41,374.69,372.92,374.86,378.03,374.33,366.9,363.35,361.77,357.31,368.54,378.43,389.29,388.33,388.35,386.52,396.29,399.91,398.71,408.68,403.11,397.84,382.52,390.84,383.45,383.67,394.44,414.15,414.66,417.64,424.52,425.69,432.29,416.96,413.29,432.36,414.4,415.04,418.6,421.06,410.65,416.69,416.66,407.81,399.22,404.74,409.61,401.75,404.74,410.76,399.32,383.22,383.22,395.71,395.02,396.85,386.03,387.94,372.61,367.05,369.63,384.54,380.91,382.12,396.12,392.43,391.97,400.12,400.12,403.43,408.12,410.54,413.56,403.05,390.3,395.62,394.42,391.5,393.47,395.89,397.03],"S&P500":[null,100,99.8,99.57,99.56,99.98,99.98,100.28,100.27,100.04,97.59,99.02,97.55,97.5,98.48,98.11,98.11,98.14,99.21,99.85,99.28,98.43,99.06,99.59,98.66,99.44,99.12,98.63,99.05,99.1,98.78,99.23,98,98.11,97.81,97.83,97.53,98.13,98.34,98.21,98.2,98.67,98.29,98.12,97.83,97.52,97.51,96.85,96.22,95.79,95.63,97.76,98.13,99.21,99.41,99.27,99.26,100,99.84,100.31,100.07,100.82,101.03,101.12,101.12,101.51,100.98,101.11,100.85,100.49,100.53,101.12,101.46,102.8,103.02,103.63,103.51,104.19,103.34,103.74,103.56,103.77,104.15,103.89,103.7,103.83,103.83,104.06,103.19,103.16,102.68,102.68,103.55,104.14,104.06,104.43,104.06,104.06,104.35,104.13,104.32,104.32,104.01,104.2,103.82,104.17,103.89,104.57,105.41,105.33,105.24,104.61,104.52,104.55,104.61,105.37,105.14,105.17,105.24,105.85,106.22,106.78,107.21,107.74,107.65,107.83,107.83,108.48,108.37,108.41,108.57,108.69,108.4,109.89,109.24,109.3,108.94,108.62,108.37,108.46,108.82,108.86,108.49,109.4,109.22,109.08,108.86,107.51,107.71,107.59,107.5,107.39,108.17,108.29,108.61,108.36,108.18,108.25,107.91,108.12,108.03,108.11,107.95,107.55,106.81,106.81,107.73,107.42,107.24,108.05,107.72,108.89,109.55,109.5,109.56,109.35,109.54,109.67,109.53,109.59,110.04,110.04,109.93,110.06,109.82,109.66,110.18,110.1,108.1,108.5,109.23,109.8,110,110.27,110.76,110.8,110.8,110.66,110.61,111.45,111.86,111.73,111.42,111.59,111.62,111.53,111.42,111.92,111.81,111.56,111.59,112.52,111.77,111.71,111.65,111.83,111.86,110.96,111.94,110.98,111.15,111.4,111.4,111.56,110.52,111.23,111.33,111.24,112.06,112.27,112.79,112.78,112.85,113.46,113.44,113.4,113.28,113.61,113.64,113.53,113.38,113.3,113.57,113.63,113.38,113.6,113.78,113.51,113.47,111.83,111.97,113.09,113.04,113.2,111.45,111.24,111.37,112.48,112.09,111.86,112.05,112.1,112.2,112.71,113.36,113.58,113.58,112.73,113.08,113.06,112.89,114.11,114.5,114.58,114.46,114.67,114.84,114.96,115.04,114.69,114.76,114.51,114.51,114.98,115.12,115.55,115.99,116.24,116.39,117.05,116.92,116.71,116.98,117.19,116.99,117.1,117.3,117.38,117.47,117.51,118.11,117.64,117.83,117.28,117.43,118.38,118,118.11,118.3,118.32,118.69,118.84,118.82,118.99,118.54,118.43,118.55,118.28,117.62,118.59,118.28,118.43,119.2,119.11,119.11,119.36,119.31,120.49,120.44,121.43,121.18,121.05,120.6,120.59,120.94,121.61,122,122.19,122.13,121.63,122.72,123.38,122.98,122.88,123.12,123.07,123.07,122.94,123.03,123.26,122.62,123.64,124.43,124.93,125.81,126.02,126.18,126.04,126.93,127.79,127.79,127.34,128.54,128.33,128.89,129.93,130.21,130.14,130.22,131.76,130.87,129.45,129.51,129.43,126.68,121.49,123.61,122.99,118.37,120.14,121.81,122.13,123.77,125.26,125.31,125.31,124.58,123.89,124.01,126,127.48,125.86,124.47,122.81,123.43,124.79,125.12,125.06,125.62,127.8,127.64,126.83,126.1,126,126.22,124.42,124.61,124.38,121.25,118.71,121.93,119.82,119.47,121.12,121.12,118.41,119.91,121.29,122.13,119.45,119.85,121.85,121.18,122.18,121.83,122.82,124.12,124.23,123.52,122.46,122.47,120.83,121.05,122.32,122.45,121.45,121.76,120.88,120.61,122.15,122.58,122.54,123.73,124.89,125.1,125.21,124.36,124.86,124.75,124.43,125.35,124.95,125.36,125.1,124.81,124.81,123.37,124.93,124.07,125.42,125.98,126.07,127.15,127.06,127.46,127.59,127.81,127.3,127.61,127.49,127.21,126.7,126.92,126.11,126.35,124.61,124.89,123.81,124.58,124.67,125.06,124.44,124.44,125.51,126.58,127.69,128.14,127.23,128.34,128.48,128.35,128.86,129.13,128.62,128.5,128.74,129.35,130.53,130.14,129.28,128.54,129.17,129.03,129.67,130.27,130.73,131.1,131.06,130.88,129.94,129.42,130.25,129.26,130.28,130.72,131.03,131.31,131.25,131.03,131.84,132.85,132.89,133.65,133.06,133.07,133.07,132.85,132.48,132,131.71,131.96,132.45,132.5,133.2,133.23,132.49,133.2,133.37,134.41,134.37,133.89,133.72,133.28,133.65,133.65,134.13,134.08,134.17,133.08,132.34,132.29,132.1,127.76,125.13,126.91,126.16,128.87,128.84,126.99,126.94,126.39,125.7,121.82,124.09,121.94,121.14,123.03,124.37,125.68,124.89,125.59,126.37,129.06,128.73,127.55,125.03,124.85,123.9,125.22,125.5,123.41,121.17,121.54,121.54,120.74,122.61,123.01,125.84,125.57,126.59,127.98,123.83,123.83,123.65,120.76,120.98,120.93,121.59,121.56,119.24,116.77,116.78,114.98,113.16,110.83,107.83,107.83,113.18,114.15,114,114.97,115.12,112.27,116.12,116.94,118.07,118.56,119.09,119.07,118.45,119.72,119.98,120.89,122.49,122.49,120.75,121.02,121.19,122.22,121.26,121.08,122.96,124.02,124.13,124.97,125.56,125.28,124.11,124.19,124.28,125.88,126.26,125.93,127.3,127.3,127.49,127.72,127.27,128.08,128.24,128.14,128.07,127.71,128.59,128.09,127.94,127.11,126.08,125.81,127.65,128.03,128.92,128.81,129.45,129.93,129.91,129.53,130.93,128.45,128.34,129.26,128.66,129.13,130,131.5,131.5,131.78,132.06,132.67,132.81,132,132.46,132.47,133.34,133.26,133.33,133.02,133.24,133.24,133.37,134.55,134.25,134.2,134.83,134.98,135.11,134.09,133.81,135.1,134.49,132.27,132.06,131.66,132.15,128.96,130,130.76,131.92,131.15,130.26,131.37,131,129.44,129.61,129.61,128.53,127.64,127.91,126.22,125.87,128.57,129.62,130.41,131.78,132.4,132.35,132.08,132.62,132.41,132.53,133.82,134.22,135.49,135.32,135.08,133.8,133.64,134.15,134.92,135.95,136.35,137.4,137.4,137.15,136.49,136.66,137.27,137.59,138.22,138.25,137.78,136.88,137.37,136.52,136.9,137.84,138.49,137.76,138.78,138.55,138.2,136.69,135.46,134.47,130.47,132.17,132.27,134.75,133.86,132.21,134.21,130.28,130.6,132.49,134.09,133.03,134.12,134.06,130.58,132.01,131.59,132.45,134.13,134.22,134.22,133.29,134.74,136.49,136.61,136.6,136.65,137.63,138.03,137.93,137.5,137.85,137.9,137.9,137.23,137.21,136.06,136.9,136.56,135.84,136.52,134.85,132.44,133.49,135.39,134.78,132.69,133.89,134.75,136.23,136.04,137.39,137.12,137.5,136.96,137.9,137.41,137.8,138.06,138.62,139.4,139.28,139.74,139.31,140.66,141.18,141.01,141.11,141.5,141.86,141.58,141.8,141.9,142.02,143.12,143.19,143.1,142.57,142.34,142.65,143.72,144.04,144.64,144.64,144.06,142.81,141.87,142.76,142.98,144.28,143.83,143.67,144.09,145.32,145.33,146.37,146.42,146.36,147.01,147.74,147.86,147.84,147.84,148.59,148.6,147.74,148.18,149.42,148.36,148.89,148.47,149.2,150.19,149.76,150.81,150.58,150.86,152.12,152.71,152.71,152.3,152.35,152.52,151.14,148.76,150.26,150.13,150.6,147.93,149.01,151.24,152.94,153.45,152.62,153.74,154,154.99,154.74,155.03,155.03,154.57,155.3,154.71,153.08,147.95,143.47,142.93,136.62,135.49,141.73,137.75,143.56,138.69,136.32,125.97,132.19,125.73,113.77,124.34,109.44,116,109.99,110.5,105.71,102.62,112.24,113.54,120.62,116.56,120.47,118.54,113.31,115.89,114.14,122.17,121.97,126.12,127.95,127.95,126.66,130.53,127.65,128.4,131.84,129.48,125.51,128.39,128.32,130.1,132.02,131.33,134.82,133.57,129.83,130.38,131.56,130.64,132.14,134.37,134.39,131.63,129.34,130.83,131.34,135.48,134.06,136.29,135.23,135.55,135.55,137.21,139.25,138.95,139.62,140.15,141.3,143.23,142.74,146.49,148.25,147.09,146.31,137.69,139.49,140.64,143.31,142.8,142.88,142.07,143,143.61,139.9,141.43,138.01,140.03,142.19,142.9,143.55,143.55,145.83,144.26,145.38,144.56,146.08,144.71,146.65,147.98,147.48,147.9,149.14,149.39,150.25,148.4,147.48,148.57,147.61,149.44,148.88,150.03,151.1,151.65,152.62,153.6,153.7,154.12,152.89,155.03,154.72,154.69,155.11,155.47,154.78,155.27,155.81,157.37,157.94,159.55,159.81,160.89,160.54,161.74,164.23,158.46,157.17,157.17,152.81,155.89,153.15,153.23,155.18,155.99,155.27,153.96,152.24,150.48,152.06,148.46,148.9,151.28,153.72,152.98,154.24,155.06,153.57,156.33,154.15,156.83,158.08,159.47,162.09,161.07,160,159.76,159.78,157.17,157.91,157.57,158.39,158.94,155.98,155.51,150.02,151.81,149.97,151.82,154.52,157.93,161,160.96,162.84,162.61,163.85,162.22,164.43,166.34,165.55,163.63,164.28,163.16,164.08,166.73,166.47,166.47,166.87,166.1,167.97,168.27,168.17,169.65,169.33,169.8,168.45,168.23,168.02,167.29,169.45,169.75,170.73,170.13,169.46,169.11,169.24,169.84,169.84,171.32,170.94,171.16,172.27,169.73,170.93,171.9,174.46,175.41,174.26,174.34,174.73,174.08,172.83,172.83,174.23,176.66,176.72,176.18,176.82,176.56,172.02,173.7,170.35,173.08,175.49,175.67,177.57,178.26,179.58,179.38,179.32,179.62,180.47,180.47,180.36,180.3,179.51,179.18,177.79,178.01,180.03,175.63,174.79,178.95,177.51,175.19,172.84,176.21,175.26,177.74,178.81,180.67,180.86,182.03,181.74,182.27,179.58,179.47,180.73,179.35,178.37,179.3,182.29,182.13,181.55,182.21,184.37,184.37,187.03,186.85,187.12,187.91,189.36,189.32,189.95,189.17,191.27,191.96,190.94,189.64,191.41,189.64,191.72,192.06,192.02,191.86,193.15,191.76,192.29,191.01,191.14,192.7,194.12,192.1,190.43,186.35,188.61,191.43,190.94,189.32,188.76,190.75,190.6,192.49,192.08,192.44,192.67,192.82,192.82,192.72,193,192.3,194,193.84,193.88,193.52,194.42,194.8,195.16,194.76,193.71,193.63,191.09,193.76,194.76,194.55,195.68,196.33,196.78,196.84,197.1,198.13,199.61,199.61,199.21,199.88,198.17,200.4,201.09,200.39,200.62,199.97,198.46,195.31,198.27,199.91,200.31,202.34,202.82,201.87,201.83,202.68,201.58,201.21,202.86,201.92,203.13,203.47,203.28,203.49,203.74,204.59,204.92,205.46,204,201.81,202.07,203.71,205.45,205.75,206.21,205.01,206.82,207.71,207.43,207.49,208.08,208.01,208.01,207.3,207.03,206.08,204.49,204.95,203.77,205.5,205.18,203.31,199.86,199.7,201.6,204.05,204.34,203.78,199.63,199.94,197.56,199.83,197.23,199.31,200.13,201.79,201.4,200.02,199.54,200.14,203.55,205.07,205.77,207.29,208.05,208.67,208.45,209.44,209.82,208.76,210.81,211.22,211.6,212.38,213.75,214.64,215.45,215.64,214.88,213.11,213.23,214.77,214.77,215.6,215.04,215.77,215.47,214.78,215.13,215.63,215.63,210.73,213.51,209.46,206.98,209.92,208.15,210.59,214.95,215.61,214.07,216.11,214.14,212.54,216.01,214.12,211.92,209.51,213.23,215.4,216.74,216.74,219.74,219.52,219.83,219.17,218.59,219.99,219.85,215.59,215.38,214.51,214.2,216.16,216.77,213.68,213.85,213.85,209.92,207.89,205.59,201.71,202.26,199.8,199.5,198.43,203.26,207.1,208.52,210.49,205.35,206.41,205.65,207.37,210.38,206.57,202.65,201.88,205.06,205.24,200.89,199.45,199.45,197.43,193.8,196.7,201.1,200.6,197.5,201.18,200.13,198.54,192.68,191.28,196.2,195.36,192.82,191.39,195.49,199.87,202.33,204.69,204.61,206.92,204.38,207.31,208.36,209.85,212.42,211.08,207.78,208.49,210.18,207.54,205.52,206.4,205.85,202.37,201.68,203.94,201.46,201.46,201.42,204.65,204.53,201.51,195.92,197.04,191.49,191.89,196.64,189.51,190.58,191.5,197.22,190.19,189.11,183.05,183.5,180.48,180.25,184.55,183.82,187.53,179.95,178.9,178.93,182.25,180.77,182.48,186.11,190.71,190.71,189.52,188.1,191.56,188.43,189.02,190.82,188.76,184.27,178.91,171.97,171.32,173.82,168.17,168.54,168.54,172.67,172.44,174.09,179.41,178.87,175.27,175.15,173.61,175.44,175.44,175.72,176.35,178.99,178.84,176.78,175.14,174.36,173.84,177.18,175.7,180.55,181.62,183.41,181.69,181.93,179.83,184.54,186.78,189.43,188.9,187.64,190.57,190.42,190.11,189.88,189.07,193.1,192.96,196.3,197.08,197.45,196.02,196.47,193.93,189.78,189.36,189.91,192.59,186.1,184.86,182.82,181.39,181.93,179.98,179.98,179.24,182.53,183.74,186.54,188.52,180.37,180.98,178.93,177.64,178.86,176.85,173.82,172.35,169.38,167.63,167.28,170.57,166.96,164.45,168.71,173.87,173.51,171.74,166.93,165.68,164.6,164.06,168.32,164.33,168.68,170.61,169.47,168.13,172.11,174.16,176.99,175.68,174.62,178.92,177.58,176.85,172.43,170.61,172.93,174.59,175.57,171.92,181.45,183.13,181.49,183.07,181.56,181,181.86,181.16,183.62,184.7,184.7,184.65,181.8,181.51,187.13,186.97,186.74,183.4,180.76,180.42,181.78,180.44,183.02,184.36,183.24,178.67,176.68,175.09,175.27,177.88,175.31,176.34,176.34,175.62,173.51,176.54,176.09,176.09,175.39,176.71,174.65,178.64,178.51,179.75,182.06,182.68,183.41,183.41,183.04,180.19,178.82,182.2,184.36,184.23,184.2,186.23,186.69,184.27,186.97,188.92,191.7,189.71,188.55,190.98,188.86,187.19,187.6,189.75,189.7,190.22,187.6,187.08,187.08,183.33,183.04,184.02,182.08,182.64,182.09,181.22,182.6,185.55,185.67,182.83,183.09,179.71,177.11,176.84,179.75,178.5,181.63,179.63,181.23,183.59,180.56,181.1,182.12,182.42,182.14,184.73,185.79,188.47,189.16,188.07,187.6,188.27,188.27,188.46,188.45,187.67,190.16,189.77,190.39,190.56,190.54,189.41,189.58,189.74,186.74,186.02,189.66,191.23,191.15,188.94,187.62,186.26,189.7,189.79,188.92,189.77,189.44,189.15,189.7,188.49,190.74,192.54,192.26,192.29,190.13,188.74,190.39,192.88,192.88,192.88,191.7,193.59,196.4,196.01,196.47,195.72,196.93,197.16,199,200.38,200.54,202.98,202.24,202.24,201.28,200.23,200.97,199.43,198.54,200.81,200.74,201.64,204.11,204.35,204.35,203.95,202.33,201.75,202.24,203.6,205.11,206.85,206.63,207.43,208.91,209.4,207.99,208.05,208.89,209.48,209.45,208.1,210.16,210.47,209.91,207,206.47,205.38,207.23,206.36,204.91,204.96,204.74,205.91,203.54,202,200.44,200.41,201.79,201.23,203.45,200.71,202.06,203.33,206.28,207.07,206.74,207.11,207.11,206.24,204.8,204.15,204.44,205.81,204.64,204.89,206.62,204.11,204.25,203.82,201.9,198.59,198.13,198.93,196,196.04,197.2,196.67,196.68,193.98,195.55,195.3,197.6,198.85,199.88,200.74,199.49,198.49,200.59,200.57,197.88,196.2,193.74,193.41,194.81,192.02,189.75,188.84,191.11,192.34,194.36,198.03,199.89,200.24,200.81,201.01,199.38,202.5,202.33,206.19,206.52,206.76,207.03,208.56,208.14,208.98,208.98,209.11,208.7,208.9,208.71,209.5,210.73,209.59,209.47,208.65,210.31,211.17,212,212.98,215.88,216.46,216.44,217.42,218.69,215.48,217.7,218.06,218.06,218.99,219.3,219.38,218.76,217.52,215.78,215.04,215.43,218.47,218.15,219.39,219.24,219.4,219.4,218.58,217.36,219.27,221.97,222.46,223.11,223.29,224.46,224.32,226.01,225.88,222.24,225.02,227.42,226.69,227.22,229.09,229.22,230.54,230.32,227.17,229.35,230.68,229.57,229.57,228.19,228.48,233.31,233.39,232.51,232.9,232.52,233.73,235.6,235.32,232.93,234.12,236.53,234.99,234.73,237.36,236.9,236.22,234.69,236.17,237.5,239.62,240.4,240.06,239.32,238.65,240.71,240.98,240.98,240.5,238.76,239.02,236.07,238.69,238.6,238.95,236.69,238.45,234.98,232.15,231.68,230.34,229.83,227.81,229.8,232.55,232.6,231.54,233.9,234.65,230.95,230.16,232.26,235.18,237.61,237.93,237.93,239.14,239.53,239.47,240.63,243.45,242.94,243.23,243.45,244.06,243.4,241.6,243.29,243.29,243.35,241.56,240.12,242.05,242.32,242.68,245.55,245.51,245.23,245.86,246.53,248.63,249.21,249.11,251.02,251.65,251.65,251.02,250.63,249.86,250.84,251.24,251.46,250.44,251.11,252.66,253.95,253.95,255.33,255.59,255.78,258.39,256.13,257.54,258.27,259.92,256.3,254.29,252.48,255.2,254.81,248.91,247.63,250.37,250.58,249.33,253.27,249.8,245.21,237.86,240.33,238.47,243.96,245.1,245.11,249.24,250.2,254.23,254.74,257.21,256.7,257.79,255.49,258.42,257.61,258.02,256.48,256.47,259.06,259.06,253.58,253.17,252.41,248.05,250.92,252.04,254.73,256.64,258.03,258.35,258.42,257.67,262.05,261.54,262.27,262.93,262.44,263.5,263.17,264.29,261.82,261.86,261.42,263.76,261.24,263.77,265.64,265.09,266.7,268.75,266.71,267.96,267.91,268.97,268.48,268.36,265.89,266.46,266.38,267.09,267.52,266.64,261.67,262.74,262,265.22,271.93,273.95,274.98,275.24,274.45,274.51,272.85,269.25,270.3,271.37,271.38,272.83,273.78,274.6,276.17,275.12,275.12,276.67,277.34,277.47,279.15,278.63,279.32,277.61,276.78,279.04,277.53,277.52,278.58,277.5,269.32,269.09,272.01,273.99,277.02,277.02,276.91,273.84,270.91,269.75,269.15,272.54,274.05,271.01,271.43,271.43,267.25,267.67,267.98,272.88,272.31,275.03,275.03,277.44,279.14,280.63,279.82,275.74,278.29,276.98,278.45,277.04,274.93,276.92,278,279.01,276.37,278.23,278.32,277.56,280.46,280.44,280.44,281.12,281.79,280.57,275.78,274.41,273.13,273.17,268.83,273.09,268.29,265.01,267.96,263.19,264.64,257.5,255.56,256.8,253.24,258.62,260.28,257.51,260.29,259.72,259.93,264.52,264.94,261.98,261.12,255.96,257.38,258.35,260.09,247.5,232.72,232.17,228.53,250.27,241.61,245.98,247.94,247.51,241.96,242.28,242.28,236.57,242.52,246.56,251.55,253.41,253.57,255.04,255.42,257.03,260.81,259.15,257.15,258.27,259.77,259.58,268.04,269.98,270.25,271.37,273.27,273.51,272.45,268.05,267.94,266.14,266.14,271.58,270.07,271.15,271.13,272.24,273.82,273.84,272.4,275.2,275.45,276.96,276.2,277.26,274.13,276.7,274.39,274.3,274.3,273.71,276.34,279.41,279.41,281.65,283.12,284.58,284.26,285.61,287.99,287.99,285.73,285.52,287.26,288.04,287.09,287.5,286.36,287.28,288.82,288.79,289.2,289.38,291.64,291.85,293.01,293.06,292.19,291.83,290.75,286.1,290.31,288.9,291.01,290.78,293.04,292.31,295.63,296.58,296.67,295.81,295.78,294.05,293.33,292.16,296.6,295.33,296.55,297.26,298.2,296.29,296.29,294.24,295.74,298.21,297.26,297.89,298.69,299.58,302.12,301.98,303.4,303.01,302.72,304.17,305.65,307,305.31,304.44,302.92,304.7,305.51,306.76,307.8,307.99,308.01,309.13,307.96,309.75,308.9,300.52,305.21,304.73,305.96,304.03,305.64,308.9,308.91,307.26,309.05,311.49,315.32,316.04,316.03,312.9,313.72,314.26,310.57,311.7,308.22,308.61,313.36,314.01,314.21,309.01,308.85,306.02,303.49,304.63,299.89,302.84,307.52,310.31,312.45,312.45,314.12,312.45,313.22,314.15,314.49,315.1,314.01,313.73,315.85,316.5,313.13,312.63,311.88,308.27,310.71,313.45,315.47,316.91,317.93,317.93,317.83,316.72,316.29,313.96,314.55,316.55,318.51,317.42,317.44,319.5,320,319.38,317.68,318.5,318.29,318.29,311.73,315.34,317.07,317.17,318.76,320.06,320.04,319.62,318.25,319.96,317.28,315.67,311.8,317.94,319.43,318.38,318.36,313.37,313.53,313.53,313.85,315.6,314.71,316.89,313.6,316,318.57,316.86,315.49,315.62,312.63,315.06,313.28,309.12,311.69,311.02,310.76,306.03,304.18,307.26,308.02,303.83,303,298.41,301.83,300.7,302.33,297.07,292.1,290.95,299.42,301.57,301.91,301.91,303.24,303.47,311.08,313,312.65,315.83,319.55,322.1,322.94,326.83,326.05,323.98,327.37,326.02,328.62,329.02,327.41,327.28,330.63,331.6,330.25,332.93,337.79,336.51,339.34,339.98,339.43,341.42,344.03,339.78,339.53,337.26,340.9,341.49,342.76,342.76,344.85,344.91,346.9,347.65,348.56,349.01,346.44,347.84,338.64,339.65,338.78,333.29,339.13,340.83,346.47,344.5,340.31,344,344,342.73,337.81,337.47,337.44,337.28,341.24,343.95,343.21,343.21,343.21,345.69,344.15,343.18,345.98,347.43,344.68,345.98,347.3,345.53,342.04,341.38,344.4,343.93,339.77,339.94,339.99,340.71,335.54,341.12,343.51,348.59,354.82,354.23,353.61,355.79,355.59,354.44,355.37,357.69,357.08,355.22,352.77,353.52,350.45,351.97,350.99,352.11,352.03,352.03],"SK하이닉스":[null,100,100.14,100.55,99.59,101.1,103.45,104.83,104.55,106.76,107.45,102.07,104.28,104.28,104.28,104.28,108.14,108.28,108,108.69,108.55,108.97,113.52,113.66,110.9,110.9,110.9,115.31,117.52,117.38,116.41,113.93,113.93,113.79,112.97,114.62,116.69,114.9,110.48,110.48,112.97,110.76,113.24,118.34,118.62,117.1,113.1,115.86,113.1,113.52,113.66,114.48,114.48,109.38,113.1,109.93,109.52,109.52,112.69,115.59,115.86,112.41,117.79,118.76,117.66,117.52,117.52,116.97,118.34,121.93,122.48,122.48,124.69,124.83,127.59,125.52,124.97,124,126.48,125.79,128,124.55,124.55,124.14,125.52,127.72,125.93,125.93,125.1,123.31,123.31,126.34,130.34,128.28,129.52,132.41,136.69,137.24,142.34,139.59,138.76,136,136,134.76,136.83,135.59,140.14,142.34,142.62,147.03,147.03,147.03,148.14,148.97,145.66,148.14,148.14,147.03,150.62,145.38,137.93,139.86,133.66,132.14,136.83,139.03,137.66,140.41,139.59,138.48,131.03,126.9,128.83,128.83,131.59,129.93,136.14,134.62,132.41,132.41,135.72,140.69,138.76,134.62,135.59,128.97,131.31,131.17,134.21,133.66,136.55,139.86,140.14,141.52,140.41,139.31,142.9,140.69,138.76,136.28,137.38,135.17,134.76,135.17,137.24,137.38,135.72,138.48,137.52,141.79,143.45,144.55,144.55,148.14,147.86,148.97,148.97,152.83,152.83,154.21,154.21,156.97,156.97,153.38,155.59,152.55,153.38,152.55,150.9,153.66,149.52,154.48,152,153.93,153.93,157.52,159.72,158.34,157.24,155.59,157.52,154.76,154.76,155.86,156.41,160.83,158.62,162.21,163.59,167.17,166.9,173.24,176.55,178.76,179.31,179.31,186.21,190.9,185.38,188.97,185.93,182.9,181.52,187.59,187.86,183.72,185.66,190.34,190.07,194.76,196.14,196.41,195.31,195.86,196.69,196.41,201.38,194.21,184.28,188.69,178.21,182.07,180.69,187.59,180.69,176.55,176.83,182.9,177.1,177.66,169.38,179.59,179.59,182.34,183.17,184.83,185.38,188.14,187.59,187.86,188.69,187.31,186.48,188.97,189.24,189.52,187.86,192.83,197.79,196.97,200.28,203.59,206.07,208.83,211.86,212.97,219.86,218.48,222.62,229.24,229.24,238.07,238.07,227.31,229.52,228.69,228.69,228.69,228.69,228.69,228.69,228.69,244.69,245.79,244.14,237.52,232.28,230.34,223.17,217.93,224,233.66,225.66,225.38,217.1,216.28,220.14,226.76,235.31,230.07,232.83,230.34,227.31,229.52,227.31,226.21,227.03,230.07,226.21,227.59,228.97,226.48,234.48,239.45,233.66,234.76,229.24,227.86,227.31,211.86,213.52,218.21,214.9,213.79,209.66,217.1,217.1,214.62,211.86,209.66,208.83,212.97,221.24,221.24,212.41,211.59,211.59,204.14,207.17,211.03,211.03,211.31,214.34,212.69,218.76,215.72,212.14,201.1,200.28,205.24,200.55,205.24,204.41,207.45,202.21,196.14,196.69,199.72,209.1,208.28,207.72,201.66,202.76,205.24,199.17,193.66,193.66,196.14,203.86,202.48,205.52,214.34,214.07,214.07,214.07,211.03,208.28,212.14,209.38,213.24,213.79,217.1,211.86,211.86,213.52,216,227.31,228.14,230.34,229.79,234.21,248.28,250.21,247.17,247.72,248,247.17,243.86,244.41,229.24,231.72,224.55,221.52,221.52,224.28,224.28,225.66,221.79,228.69,221.52,222.34,221.79,224,231.72,232.28,231.72,228.41,233.38,242.48,232.83,232.83,226.48,227.31,238.62,240.28,233.1,233.1,229.24,228.69,228.97,228.97,230.34,230.07,236.69,237.52,235.59,233.38,240,239.17,242.48,245.79,245.79,262.9,260.97,262.62,260.69,261.52,262.07,257.66,252.14,247.72,251.03,251.03,250.76,243.86,246.07,243.86,243.86,238.07,240,231.72,232,242.21,244.14,246.9,233.93,232.55,235.03,230.34,236.41,230.9,237.52,234.48,237.79,235.31,241.66,240.83,239.45,236.14,244.97,246.34,244.41,246.34,249.1,242.48,225.38,230.62,222.07,229.24,237.52,236.97,238.07,236.14,229.52,229.79,219.03,222.62,220.14,215.17,207.17,208,209.38,209.38,206.07,205.52,206.07,216.28,220.14,223.72,225.66,230.34,227.31,228.41,228.14,228.97,222.34,224,220.69,217.38,209.38,211.03,211.31,207.17,205.52,214.34,212.97,215.17,217.38,218.21,211.59,211.59,211.59,211.59,206.9,201.66,203.31,197.79,197.79,193.1,193.93,196.41,196.41,193.93,190.34,199.72,193.93,192.28,194.21,189.52,195.31,193.1,190.62,184,178.48,184.83,184.28,188.14,188.14,188.41,200.28,194.48,193.38,195.31,201.1,201.1,205.52,198.34,194.21,198.07,193.38,192.55,186.21,187.86,191.17,191.17,195.59,195.31,198.34,197.24,192,194.48,190.34,188.14,182.07,184.28,180.69,179.03,182.62,180.69,170.48,171.59,168.55,166.34,161.66,165.52,166.62,166.62,165.79,169.93,166.9,166.9,167.17,159.17,160.83,161.93,163.31,175.45,180.14,179.59,171.31,176.55,178.76,179.03,178.21,184.83,183.72,184.28,194.48,205.79,198.07,202.48,209.38,203.86,209.38,209.38,209.38,209.38,211.59,202.76,204.41,209.38,210.21,213.52,203.59,206.07,203.31,208.83,211.59,211.59,208,207.45,203.31,193.1,193.1,193.38,192.28,187.86,187.86,184,183.72,186.76,184.28,185.66,187.86,187.03,187.59,194.48,209.38,209.93,201.1,200.55,202.48,199.45,204.69,211.31,210.76,220.41,216.28,217.93,214.9,214.62,216.83,216.28,215.45,219.86,221.79,221.24,218.48,225.66,222.07,223.45,216.55,221.24,216.83,220.69,217.93,217.93,222.62,221.79,221.79,220.41,221.52,209.66,205.24,202.76,205.79,205.52,198.34,197.52,195.59,193.93,190.07,187.59,186.48,184.55,181.79,182.34,181.79,180.14,183.72,179.59,179.59,179.59,180.41,184.28,185.38,181.24,175.17,174.07,175.72,174.9,185.38,185.66,181.79,184.55,184,190.07,193.66,191.72,193.1,196.97,190.62,193.66,188.69,185.93,192.55,201.1,208.28,206.07,210.21,209.93,205.79,206.07,211.86,216.28,217.38,214.07,218.48,220.14,212.41,217.66,212.14,214.34,209.93,208,198.62,202.21,199.45,202.21,205.52,205.52,212.14,212.14,210.76,207.17,210.76,209.1,203.59,205.24,198.07,201.38,202.21,202.21,213.52,214.07,212.41,220.69,228.97,225.93,232.55,229.24,227.86,227.86,227.86,219.31,219.03,221.24,228.14,226.76,228.41,230.07,225.93,229.79,224.55,226.76,226.21,219.31,219.31,221.52,221.52,223.17,223.17,217.93,220.69,222.07,224,227.31,223.45,213.52,213.79,218.21,214.34,220.69,228.69,228.69,228.97,224.83,226.21,229.24,233.66,234.76,230.34,230.62,227.03,224.28,229.52,230.07,230.07,235.03,235.86,235.31,228.14,223.17,225.38,225.38,227.03,228.14,228.41,223.17,222.07,217.1,214.34,217.38,222.34,222.62,222.62,222.34,230.07,242.48,244.41,256,256.55,258.21,262.07,260.97,258.76,258.76,261.52,264.83,259.59,259.59,261.24,260.69,260.14,259.31,268.69,273.1,272.83,277.24,277.24,270.9,273.66,273.1,275.59,273.93,278.62,272.28,272.28,272.28,265.66,270.07,259.31,257.93,261.24,267.86,269.52,277.24,273.93,272.55,275.31,275.86,281.38,288.28,289.66,281.38,285.52,286.9,284.14,274.48,270.34,260.97,256,242.48,254.07,256,260.14,261.79,255.45,255.45,245.79,235.86,228.41,227.59,222.34,221.79,201.66,190.34,206.34,191.45,217.1,233.1,222.62,229.79,230.9,229.79,216.28,220.69,219.59,229.24,236.69,233.1,234.48,232,224.55,227.03,227.03,224.28,232,226.21,224.28,231.45,227.86,224.55,227.86,230.07,230.9,230.9,230.9,223.45,223.45,227.31,227.31,234.48,233.1,236.41,230.62,222.34,225.93,223.72,228.14,232,230.07,224.28,224.55,225.93,224.55,231.45,224.83,230.62,229.79,244.69,241.93,249.38,251.03,247.72,250.48,244.14,235.03,226.21,235.59,239.45,237.79,235.59,234.21,232,237.24,232.55,233.38,230.62,234.76,235.31,232.83,235.59,237.24,233.93,230.9,228.97,228.41,228.97,228.69,228.97,228.14,228.69,226.76,232,229.52,227.31,230.9,228.41,229.24,229.52,235.31,228.41,225.66,225.1,222.62,223.72,222.34,224.55,224.28,223.45,222.62,221.24,221.24,215.45,206.9,198.07,205.52,208.28,212.41,217.38,218.21,214.62,207.17,207.45,208.28,217.1,217.1,216.28,219.03,213.24,211.31,216.28,220.69,225.93,224.83,226.76,230.9,233.1,224.28,230.62,232.55,228.69,227.59,231.72,231.72,231.72,231.72,229.52,228.97,230.07,228.69,228.69,235.86,243.31,238.62,240.28,235.31,239.17,235.03,231.17,229.79,231.45,229.52,227.86,228.69,225.38,220.41,219.59,224.55,229.52,237.52,238.07,237.24,238.62,240,243.03,247.45,270.34,270.62,270.34,270.9,267.03,275.86,272,268.14,274.21,272.55,268.97,277.24,300.69,307.59,317.24,325.52,317.24,332.41,321.38,318.62,322.76,324.14,324.14,329.66,326.9,320,310.34,320,325.52,325.52,318.62,320,326.9,326.9,347.59,360,361.38,371.03,380.69,366.9,355.86,366.9,360,351.72,358.62,360,360,362.76,354.48,372.41,355.86,354.48,339.31,337.93,344.83,358.62,358.62,344.83,351.72,344.83,346.21,347.59,347.59,347.59,364.14,365.52,358.62,347.59,366.9,376.55,382.07,375.17,409.66,390.34,390.34,398.62,405.52,391.72,386.21,373.79,376.55,366.9,377.93,386.21,376.55,387.59,386.21,391.72,380.69,380.69,372.41,368.28,366.9,372.41,364.14,371.03,365.52,387.59,388.97,394.48,394.48,395.86,397.24,386.21,379.31,384.83,377.93,379.31,379.31,380.69,382.07,365.52,366.9,365.52,362.76,372.41,358.62,358.62,353.1,362.76,364.14,364.14,355.86,357.24,358.62,339.31,329.66,324.14,326.9,324.14,333.79,333.79,337.93,337.93,329.66,339.31,339.31,346.21,344.83,350.34,354.48,347.59,355.86,354.48,354.48,351.72,337.93,339.31,353.1,350.34,354.48,357.24,348.97,343.45,336.55,336.55,342.07,347.59,354.48,347.59,344.83,351.72,343.45,337.93,339.31,344.83,340.69,335.17,329.66,331.03,339.31,340.69,340.69,335.17,328.28,326.9,322.76,329.66,326.9,322.76,320,314.48,314.48,310.34,320,331.03,333.79,331.03,325.52,320,310.34,291.03,277.24,280,280,280,286.9,282.76,282.76,284.14,289.66,285.52,286.9,285.52,285.52,293.79,297.93,293.79,295.17,292.41,288.28,292.41,284.14,289.66,293.79,296.55,296.55,286.9,295.17,295.17,295.17,295.17,291.03,286.9,288.28,285.52,275.86,284.14,275.86,275.86,270.07,266.21,264,259.31,259.31,252.41,253.79,258.76,271.45,267.86,269.52,270.07,265.66,271.72,275.86,281.38,280,293.79,284.14,293.79,296.55,291.03,292.41,295.17,296.55,300.69,299.31,296.55,293.79,306.21,308.97,304.83,303.45,307.59,329.66,328.28,329.66,324.14,318.62,320,314.48,321.38,331.03,325.52,326.9,335.17,331.03,340.69,332.41,335.17,333.79,340.69,342.07,336.55,332.41,343.45,350.34,351.72,353.1,347.59,351.72,350.34,361.38,361.38,361.38,354.48,346.21,344.83,350.34,343.45,353.1,354.48,357.24,354.48,350.34,348.97,350.34,344.83,328.28,328.28,325.52,325.52,313.1,332.41,332.41,332.41,332.41,342.07,343.45,339.31,339.31,339.31,357.24,364.14,365.52,350.34,360,366.9,362.76,362.76,362.76,362.76,337.93,339.31,339.31,339.31,344.83,355.86,355.86,329.66,325.52,325.52,325.52,325.52,320,320,320,320,342.07,342.07,340.69,340.69,332.41,325.52,325.52,331.03,333.79,325.52,320,322.76,321.38,311.72,313.1,308.97,307.59,306.21,311.72,303.45,297.93,300.69,310.34,310.34,311.72,304.83,297.93,306.21,299.31,302.07,310.34,304.83,303.45,302.07,302.07,296.55,296.55,303.45,304.83,300.69,310.34,304.83,310.34,313.1,306.21,310.34,311.72,299.31,297.93,284.14,292.41,295.17,297.93,297.93,295.17,295.17,295.17,286.9,292.41,291.03,285.52,273.1,273.38,270.07,268.69,265.93,260.69,262.62,254.34,248.83,252.69,262.07,262.9,259.31,251.03,241.38,245.79,255.17,254.07,259.03,261.52,258.48,257.38,259.31,259.31,272.28,278.62,275.86,281.38,282.76,275.86,275.86,277.24,275.86,274.21,270.07,267.86,266.21,268.97,268.97,271.72,265.66,262.34,253.24,257.38,257.38,257.38,266.76,267.86,264,265.93,262.62,258.21,257.1,259.59,262.34,255.17,257.1,262.62,254.9,252.97,251.31,253.24,249.38,249.38,249.38,249.38,261.52,256.55,253.79,251.59,248.28,242.76,242.76,237.24,230.34,227.59,226.21,224,222.9,229.24,229.24,237.79,247.72,248,251.59,251.59,248.83,259.31,261.79,263.45,262.62,264.28,256.28,248.83,249.66,253.24,257.93,259.03,248.28,230.07,228.14,231.45,233.1,228.14,233.1,238.62,241.93,246.07,245.79,257.93,250.76,252.69,252.41,241.93,243.86,238.07,235.03,235.03,239.72,234.76,229.24,230.9,234.48,233.66,225.93,223.45,223.45,217.66,217.38,224.83,223.72,227.03,225.66,221.24,216.28,217.93,216,215.17,218.48,214.62,212.41,212.41,209.66,206.9,206.9,208.83,208.55,223.45,224.55,229.24,237.24,238.62,240.83,239.45,236.41,236.69,237.24,234.76,235.86,241.66,241.66,241.66,252.14,252.14,252.41,250.21,244.14,252.14,252.14,254.34,245.79,250.48,261.79,261.79,257.93,249.93,257.66,252.97,256.28,253.79,255.17,251.59,245.79,255.72,251.03,248.28,246.62,246.62,243.03,240.83,247.45,245.24,239.45,236.14,229.79,232.55,223.72,218.21,217.93,231.72,230.9,230.62,239.72,244.14,240.83,235.86,243.86,239.72,244.97,244.41,240.55,233.1,233.38,231.17,245.79,250.21,253.24,249.1,244.69,246.34,244.14,241.66,243.31,241.93,245.79,240.55,235.86,241.1,244.97,246.9,246.9,248.83,247.72,244.69,244.69,244.69,240.83,239.72,238.07,240.55,238.34,249.38,253.52,258.21,268.41,270.9,270.07,269.52,285.52,301.24,301.24,304.28,299.59,304.28,304.28,299.86,299.86,297.93,302.62,318.34,316.69,329.66,327.72,328.28,328,316.69,320.28,317.52,314.48,313.38,313.1,311.72,315.31,320.55,317.79,324.41,325.24,321.93,313.93,308.41,304.28,312.83,318.34,314.76,325.52,323.31,324.97,324.14,322.48,317.52,314.48,312.83,311.72,342.07,353.1,340.41,345.1,329.66,331.03,331.31,336.28,327.17,326.9,326.9,318.07,316.97,316.97,319.45,316.69,323.31,321.1,321.38,320,333.52,321.38,319.72,327.17,329.38,336,331.03,328.83,329.38,326.07,326.9,313.66,319.72,321.93,326.9,337.1,337.66,328.28,328.83,325.52,321.38,323.59,322.76,317.24,316.41,316.41,316.41,316.41,316.41,318.34,331.59,332.14,332.14,329.66,328.83,342.62,344,342.34,358.62,358.62,346.76,348.14,342.07,349.79,351.72,331.03,328.55,328.55,320.83,331.86,345.66,347.03,366.9,359.72,352,353.1,360,363.59,358.62,369.93,364.97,358.34,362.48,364.14,362.21,358.9,353.1,360.55,362.48,359.72,369.38,365.79,361.66,347.31,346.48,346.48,351.72,355.59,361.38,361.93,377.1,386.21,386.21,381.24,387.59,387.59,387.86,387.86,388.69,387.31,390.34,390.34,392.83,377.38,376.28,379.31,375.17,379.03,368.28,375.17,369.93,369.93,364.41,361.38,375.72,389.79,393.38,388.41,390.34,379.03,375.17,372.41,377.66,371.59,366.07,372.14,364.97,380.69,380.69,393.93,393.93,393.93,413.79,410.21,410.76,404.97,417.38,412.69,411.03,431.72,445.24,446.34,424.28,435.86,430.9,430.9,459.31,457.38,449.38,454.9,474.21,459.59,457.1,451.31,446.62,444.69,453.24,441.93,431.72,468.97,468.41,467.31,487.17,499.86,491.59,504.83,511.72,513.93,494.34,518.62,504.28,499.86,504.55,504.55,519.72,516.97,519.17,494.07,492.97,502.9,478.07,473.38,471.72,496,470.62,490.48,485.24,480.55,480.55,478.9,477.79,477.79,495.45,491.03,483.86,496.28,507.03,511.17,511.17,532.41,523.86,524.41,529.66,545.38,551.72,547.86,555.86,558.62,558.62,539.86,521.93,535.72,533.24,534.34,534.34,572.41,573.79,586.21,593.1,612.41,609.66,615.17,646.9,644.14,655.17,645.52,615.17,620.69,653.79,652.41,652.41,649.66,640,651.03,634.48,651.03,644.14,657.93,659.31,664.83,642.76,634.48,642.76,608.28,586.21,577.93,565.52,565.52,575.17,524.14,529.1,539.59,521.1,536.83,533.24,477.79,430.62,451.59,467.03,450.76,473.1,488.28,501.79,515.03,515.03,550.9,534.9,550.9,531.31,527.17,511.72,495.45,482.76,494.62,468.14,479.17,480,464.28,427.03,439.72,431.45,433.1,428.97,433.66,465.66,449.1,449.1,449.1,449.1,421.52,433.38,446.9,451.03,456,499.03,507.03,481.66,481.66,466.48,466.48,480.28,510.07,491.03,491.03,515.03,513.1,513.1,532.14,520.55,540.69,516.69,526.62,518.07,540.69,546.76,554.48,540.69,524.97,537.93,513.93,502.62,535.17,532.97,540.14,540.14,553.1,531.31,512.55,504.55,477.24,491.59,473.66,470.62,470.62,465.66,487.45,488.28,488.55,464.28,444.41,441.1,438.07,454.9,463.45,477.24,460.97,465.93,470.07,473.93,485.79,484.14,494.62,507.59,506.21,482.76,464.83,467.86,464.83,464.83,469.24,481.38,479.72,479.72,472.28,501.79,551.17,537.93,537.1,565.52,561.38,536,537.93,546.76,579.31,591.72,584.83,601.38,622.07,605.52,609.66,609.66,609.66,609.66,609.66,549.52,526.62,527.17,548.41,561.38,560,546.48,550.9,548.69,575.17,579.31,584.83,579.31,602.76,584.83,577.93,565.52,553.1,560,549.52,524.69,524.69,513.38,532.69,530.76,530.76,518.34,518.07,548.69,550.9,564.14,568.28,560,566.9,579.31,594.48,583.45,573.79,590.34,571.03,549.79,526.07,543.45,545.93,536.83,502.62,454.62,467.59,455.17,505.38,498.76,497.1,498.21,480,482.76,482.76,487.17,479.45,499.31,491.86,508.69,502.07,498.76,489.66,489.66,513.1,513.1,513.1,526.34,524.97,524.41,537.93,547.59,568.28,553.1,564.14,550.07,557.24,553.1,543.17,551.72,560,558.62,573.79,584.83,564.14,572.41,572.41,600,619.31,619.31,631.72,635.86,662.07,649.66,649.66,684.14,686.9,680,678.62,708.97,715.86,768.28,788.97,808.28,783.45,805.52,787.59,769.66,768.28,746.21,747.59,777.93,775.17,819.31,812.41,827.59,823.45,816.55,743.45,742.07,751.72,740.69,742.07,743.45,733.79,722.76,724.14,726.9,754.48,711.72,711.72,726.9,713.1,722.76,707.59,736.55,742.07,766.9,762.76,762.76,737.93,725.52,704.83,675.86,692.41,715.86,721.38,717.24,740.69,742.07,706.21,718.62,724.14,732.41,754.48,764.14,794.48,838.62,846.9,906.21,913.1,960,920,980.69,980.69,968.28,995.86,986.21,983.45,928.28,962.76,958.62,993.1,1091.03,1091.03,1091.03,1091.03,1091.03,1091.03,1180.69,1144.83,1135.17,1165.52,1248.28,1284.14,1339.31,1321.38,1328.28,1320,1406.9,1475.86,1437.24,1539.31,1566.9,1542.07,1710.34,1616.55,1597.24,1635.86,1600,1671.72,1707.59,1702.07,1688.28,1544.83,1671.72,1572.41,1550.34,1575.17,1437.24,1434.48,1431.72,1445.52,1500.69,1462.07,1484.14,1539.31,1522.76,1495.17,1500.69,1591.72,1561.38,1619.31,1558.62,1575.17,1528.28,1462.07,1520,1522.76,1508.97,1600,1611.03,1622.07,1622.07,1652.41,1765.52,1795.86,1795.86,1867.59,1920,2002.76,2046.9,2085.52,2052.41,2066.21,2035.86,2046.9,2066.21,2085.52,2107.59,2049.66,2041.38,2082.76,2115.86,2030.34,2206.9,2320,2375.17,2507.59,2289.66,2502.07,2482.76,2322.76,2314.48,2446.9,2416.55,2372.41,2449.66,2427.59,2427.59,2427.59,2427.59,2466.21,2617.93,2623.45,2772.41,2808.28,3031.72,2926.9,2926.9,2590.34,2342.07,2595.86,2548.97,2306.21,2587.59,2634.48,2565.52,2510.34,2686.9,2675.86,2913.1,2794.48,2777.93,2573.79,2720,2744.83,2573.79,2573.79,2408.28,2226.21,2474.48,2289.66,2416.55,2444.14,2526.9,2849.66,2753.1,2833.1,2868.97,3042.76,3133.79,3186.21,3111.72,3216.55,3376.55,3373.79,3379.31,3371.03,3564.14,3586.21,3566.9,3547.59,3547.59,3991.72,3991.72,4416.55,4562.76,4651.03,5186.21,5062.07,5451.03,5434.48,5017.93,5075.86,4813.79,4813.79,5351.72,5354.48,5354.48,5660.69,6187.59,6314.48,6435.86,6518.62,6510.34,6510.34,6339.31,5710.34,5271.72,6110.34,5649.66,5795.86,5931.03,6311.72,6571.03,6954.48,7406.9,7624.83,8052.41,7048.28,7230.34,8046.9,7373.79,7249.66,7310.34,7062.07,6033.1,6689.66,6463.45,6071.72,5726.9,6030.34,6013.79,5089.66,5277.24,5743.45,5081.38,5081.38,4866.21,5064.83,5048.28,5293.79,4852.41,5009.66,4275.86,3864.83,3646.9,4739.31,4322.76,4350.34,4601.38,4124.14,3922.76,3917.24,3931.03,4148.97,4394.48,4537.93,4537.93,4584.83,4137.93,4664.83,4772.41,4609.66,4628.97,4656.55,4797.24],"마이크론 테크놀로지":[null,100,98.99,97.52,98.4,98.76,98.76,100.59,101.48,103.19,99.41,101.42,99.05,100.12,103.19,103.37,100.24,100.06,104.44,104.02,103.37,102.66,106.45,103.13,103.73,105.14,104.85,105.26,104.67,104.85,104.14,103.49,99.7,99.23,99.65,101.3,100.47,102.96,101.83,101.71,100.18,100.89,103.73,104.32,103.67,101.71,101.48,100.41,98.64,98.29,98.64,102.78,102.96,101.71,100.47,104.49,104.73,107.04,107.87,113.42,113.6,115.26,116.74,117.74,117.74,119.04,118.21,114.84,115.49,109.28,111.12,110.05,112.71,120.88,122.18,121.23,118.39,119.04,118.39,119.99,119.87,120.34,122.12,121.7,137.14,137.55,137.55,137.79,134.71,131.7,129.63,129.63,133.35,132.23,130.75,130.34,132.11,132.94,134.77,131.93,131.16,131.16,128.56,131.99,128.39,129.86,129.45,135.13,139.33,139.09,141.75,142.99,142.58,146.36,146.6,145.48,143.94,145.48,143.17,144.59,142.22,141.34,136.72,136.13,135.9,138.08,138.08,140.57,140.45,138.85,137.43,140.51,138.62,145.18,146.07,151.21,152.04,151.63,150.09,148.73,148.91,151.98,151.27,154.46,153.99,152.57,155,150.92,154.11,156.53,168.13,170.08,169.66,168.54,171.32,170.9,169.37,169.07,167.12,169.25,168.66,163.45,160.73,157.84,158.13,158.13,160.44,160.5,161.21,165.35,161.56,157.13,159.61,158.43,163.39,163.63,167.3,164.22,165.58,164.34,166.77,165.94,170.37,173.39,171.67,171.08,170.49,171.61,159.67,162.51,164.52,165.94,167.3,171.44,174.04,175.99,175.99,181.55,181.96,181.9,184.57,184.57,186.69,192.19,191.9,180.96,184.51,186.52,183.68,180.72,176.58,184.51,182.32,189.3,188.59,187.64,192.19,187.23,190.66,186.1,176.58,172.32,172.32,180.43,178,178.59,180.37,185.51,185.98,184.09,188,187.58,188.65,188.17,189.24,189.3,187.29,176.82,176.29,178.83,173.15,166.29,167.59,169.31,164.58,165.11,169.07,170.55,169.01,162.57,165.64,172.92,175.52,181.49,175.16,179.66,174.81,180.07,180.07,178.71,179.12,183.8,186.16,186.93,189.06,192.79,192.79,189.65,190.72,193.91,191.9,197.75,202.78,204.55,204.49,204.91,209.52,212.6,212.71,212.36,213.31,206.21,202.13,219.34,224.48,232.58,236.61,238.73,233.94,232.82,234.59,242.22,248.26,246.07,239.98,238.91,245.36,238.85,246.3,244.29,245.42,245.77,246.01,242.81,240.09,241.57,246.3,262.03,262.45,262.21,258.49,255.77,259.91,260.73,257.24,264.81,269.66,270.85,268.24,273.09,272.97,281.73,292.13,290.6,290.6,293.79,284.15,283.44,258.66,250.68,248.31,235.96,243.7,245.89,255.47,255.53,254.35,247.55,248.67,249.79,250.74,258.49,260.08,270.55,262.68,260.91,260.91,249.85,251.21,247.25,243.17,258.25,266,277.23,270.85,269.37,254.11,256.12,253.22,253.16,253.16,253.81,261.74,260.14,252.81,253.58,259.91,254.76,254.35,258.25,256,246.42,258.55,251.27,241.4,233,259.49,248.43,236.55,238.97,249.5,252.1,256.95,257.24,261.44,261.44,265.52,263.39,261.68,275.16,283.74,287.29,288.65,281.61,290.42,307.69,317.8,319.16,326.55,322.83,351.09,351.45,353.52,347.96,358.25,355.65,361.62,361.15,348.43,320.58,328.56,309.88,304.49,308.34,308.34,296.04,304.85,315.73,294.74,286.58,283.62,298.52,298.52,311,308.87,305.44,309.05,319.4,304.08,299.35,289.89,278.59,281.49,296.51,281.02,271.91,276.7,271.38,275.69,281.37,286.69,287.23,301.66,311.41,306.45,313.42,319.4,334.12,323.48,315.73,328.09,349.08,354.64,363.63,362.8,362.8,370.31,370.02,340.57,347.37,349.5,351.33,351.39,352.63,363.04,363.04,358.07,355.12,349.97,344.35,345.65,350.38,348.61,351.51,337.67,314.37,322.83,309.05,314.25,310.11,322.18,304.44,304.44,312.48,314.78,321.17,329.63,320.4,327.91,333.23,332.05,336.84,339.74,332.47,325.37,321.05,314.43,315.73,317.92,319.1,313.48,312.18,309.23,315.79,312.3,311.47,313.66,315.73,309.05,303.78,303.61,299.35,280.84,278.53,278.59,284.27,295.33,297.1,293.91,299.82,307.92,309.52,306.51,312,310.59,310.59,307.1,292.96,264.04,265.29,265.52,257.84,246.84,257.95,261.98,257.72,268.07,266.47,272.38,264.58,267.06,263.99,262.27,266.06,267.47,267,270.61,267,261.15,257.72,254.7,249.97,246.07,248.2,251.15,250.38,255.53,250.44,244.23,239.21,235.13,228.74,209.52,217.5,209.34,204.97,212.95,223.06,237.26,238.44,236.07,235.36,242.05,239.15,231.28,221.41,223.83,224.9,236.01,233.23,217.8,213.6,215.14,215.14,215.26,216.26,218.81,228.92,224.19,228.03,236.72,218.1,218.1,222.77,208.81,205.8,208.22,213.07,207.1,202.25,200.35,201.71,185.75,184.98,179.3,171.61,171.61,182.67,188.82,186.69,187.64,193.67,183.32,193.38,201.06,199.53,209.58,212.36,212.95,205.03,201.01,198.58,200.35,211.47,211.47,200.3,202.48,216.38,230.4,225.19,221.11,226.14,226.02,234.18,233.41,232.82,245.54,232.88,228.15,228.15,238.91,246.48,249.73,248.31,248.31,248.14,249.62,245.59,251.74,252.81,254.05,244.35,241.75,245.89,242.81,236.49,224.31,223.71,228.56,230.81,232.11,229.63,227.14,233.83,234.24,238.73,237.32,260.14,246.13,239.8,238.44,231.99,232.64,244.41,249.85,250.98,259.61,253.64,256.18,253.7,246.72,249.38,250.03,248.43,247.31,252.87,255.17,256.65,256.65,256.65,252.93,254.46,252.81,248.97,249.02,248.73,247.78,251.69,256.24,249.14,238.08,235.07,232.23,230.28,221.05,227.74,227.14,220.64,213.25,204.73,210.76,205.38,200,201.06,201.06,194.8,196.87,197.04,192.84,193.32,203.96,197.16,197.93,201.01,206.62,206.03,194.91,197.4,193.14,191.78,202.78,200.71,201.95,196.63,196.27,193.26,219.04,225.13,228.21,237.2,234.18,234.12,234.12,233.12,238.97,244.53,253.7,257.13,263.22,262.57,254.64,256.48,264.16,269.19,279.07,277.65,283.8,282.5,280.84,276.88,280.66,265.46,257.84,260.67,248.02,252.04,246.9,252.1,245.54,249.14,261.21,248.61,249.79,257.54,266.17,261.56,261.21,264.81,254.05,256.83,250.98,255.17,264.16,267.71,267.71,266.06,276.82,289.95,289.59,290.54,292.08,298.52,298.29,298.64,296.57,300.65,298.52,294.62,290.72,293.32,286.87,292.55,287.4,255.53,253.4,250.15,248.26,257.01,263.45,261.15,252.16,253.58,255.94,266.71,265.29,274.75,267.06,269.07,257.07,267.42,264.1,264.1,278.53,284.03,287.94,284.51,283.15,281.19,286.1,293.26,287.88,281.96,286.22,279.07,273.57,277.35,273.8,276.76,282.14,282.79,275.46,269.49,269.37,271.26,281.02,276.29,284.8,284.8,280.96,274.33,267.47,273.8,275.69,283.44,274.69,280.66,291.31,301.42,302.78,313.07,313.42,313.66,322.47,325.61,327.62,327.74,327.74,325.9,319.52,314.67,318.04,327.56,322.47,316.79,344.59,340.15,338.91,335.13,339.74,340.15,332.17,341.1,340.98,340.98,348.73,349.91,350.09,341.57,327.68,333.94,327.03,325.43,313.96,318.04,328.21,335.72,347.01,336.37,339.03,338.56,350.5,350.86,345.95,345.95,341.51,354.76,348.91,337.02,325.31,308.1,309.7,299.11,310.82,322.83,306.33,326.97,317.68,304.38,271.85,283.03,258.55,229.51,254.23,203.84,221.05,205.14,214.61,213.54,226.2,255.88,251.33,264.87,257.13,263.28,248.73,235.9,242.99,243.76,274.22,275.22,285.57,272.8,272.8,273.03,281.61,274.57,269.25,270.25,256.65,244.88,259.67,258.84,261.15,267.77,267.95,294.68,283.21,266.47,262.92,268.54,272.5,275.52,285.33,285.04,270.2,257.42,270.43,262.63,271.56,266.82,275.81,267.42,265.76,265.76,270.85,292.43,274.81,283.32,274.04,276.88,289.3,302.9,317.68,317.56,314.31,310.29,286.93,287.94,291.19,301.71,301.36,298.52,300.59,302.48,294.74,285.57,290.89,286.75,290.66,304.67,293.91,294.68,294.68,301.12,290.3,293.97,295.56,299.82,292.49,293.97,298.7,296.27,292.55,302.84,304.67,305.44,311.3,295.8,305.09,296.22,297.99,300.06,296.04,297.99,303.37,301.89,288,288.29,290.66,282.44,286.69,272.86,269.66,267.42,262.57,260.5,254.23,252.28,258.78,266.71,265.88,263.87,270.2,269.13,270.61,282.85,273.98,274.87,274.87,266.29,267,265.35,272.56,289.95,290.07,296.92,301.48,300.06,290.66,293.91,294.8,292.55,290.6,294.03,299.88,277.71,283.38,275.28,281.49,279.83,286.28,295.09,295.03,299.7,306.62,305.32,307.16,305.2,311.24,316.56,315.26,321.58,312.54,308.34,307.27,295.68,298.52,297.69,293.97,302.07,307.27,322.77,326.2,330.93,327.68,333.29,332.64,342.58,365.82,366.59,359.2,365.64,363.1,379.54,378.18,375.1,375.1,379.83,379.01,396.69,408.69,413.36,433.71,429.39,432.82,422.29,421.53,417.09,423.06,432.58,431.64,427.32,422.59,422.65,416.56,413.66,417.39,417.39,417.86,415.2,425.31,444.59,437.91,456.89,456,467.83,457.84,465.23,469.9,472.56,480.78,477.35,477.35,505.62,493.79,502.72,486.58,480.66,470.2,444.06,463.57,462.86,475.64,482.67,467.83,480.48,479.6,496.81,492.73,486.99,511.41,520.46,520.46,518.86,508.87,523.6,537.91,510.23,521.76,547.13,521.11,541.28,560.38,538.68,526.97,498.7,525.9,502.96,528.09,505.09,528.15,519.04,525.43,540.69,560.38,531.16,535.25,539.8,505.03,490.83,497.28,520.34,512.06,511.77,521.64,546.48,546.48,554.41,552.87,555.65,563.51,563.57,565.29,544.94,536.19,533.83,536.13,522.83,517.33,529.21,500.95,508.75,519.46,529.04,508.75,520.76,508.99,502.78,499.17,503.55,501.48,508.46,478.12,477.11,454.17,456.48,471.32,475.4,466.47,472.68,479.78,477.35,490.24,480.37,486.34,496.33,497.58,497.58,497.63,498.76,485.1,495.33,496.98,476.23,465.17,468.84,469.19,475.99,485.98,475.99,476.88,455.06,455.77,459.25,467.3,476.52,485.1,493.08,490.42,502.54,473.74,475.04,475.04,479.48,462.57,456,465.64,470.49,463.93,464.16,454.88,443.58,441.04,445.83,456.48,446.66,449.08,451.21,438.91,446.78,455.82,458.78,459.14,478.18,484.8,481.9,484.92,474.33,448.91,443.7,415.43,419.4,419.46,418.57,417.62,415.61,415.32,424.25,425.67,437.85,430.34,437.61,432.64,435.84,435.96,437.55,436.49,436.49,435.48,427.38,430.93,434.65,439.68,434.59,436.55,441.34,439.39,427.97,426.61,437.43,437.85,437.91,444.59,432.29,423.65,419.75,419.81,417.62,416.91,413.6,417.15,414.67,409.34,394.56,392.55,400.95,400.24,397.75,399.59,403.73,405.91,399.23,406.62,407.69,403.55,411.47,408.63,418.1,418.45,421.35,427.2,431.22,440.92,447.01,434.12,440.86,457.13,454.05,454.23,446.24,455.47,491.01,495.92,505.09,509.82,509.82,493.32,509.4,496.75,503.55,490.12,482.67,487.58,507.57,508.69,502.25,505.85,498.82,492.55,506.56,489,490.83,485.1,536.25,534.24,558.37,558.37,558.43,549.62,568.72,555.23,550.86,566.23,569.72,558.25,565.64,558.55,555.23,557.07,562.45,565.46,575.75,575.75,549.2,532.23,503.08,484.51,490.54,477.35,484.74,465.52,468.78,486.52,481.67,499.76,484.74,480.01,478.24,497.46,521.11,538.26,530.81,531.4,567.71,568.07,554.29,536.96,536.96,535.6,516.32,525.31,532.82,525.49,510.11,551.74,527.38,484.39,447.66,456.3,469.78,447.78,430.63,410.41,432.35,471.14,476.17,469.6,463.34,467.89,447.37,462.51,461.86,472.26,485.22,468.13,460.62,450.5,459.31,441.22,436.31,433.35,426.61,425.96,425.55,428.03,414.73,414.73,420.76,430.1,432.88,419.4,410.47,414.67,396.69,393.08,415.02,403.25,417.5,421.41,435.36,421.58,416.03,401.71,407.51,395.98,400.41,425.31,416.74,440.45,420.17,410.41,407.45,411.53,393.97,401.36,417.5,433.59,433.59,436.66,434.95,445.71,413.6,416.62,418.45,405.68,390.42,370.31,347.96,347.13,349.62,325.31,329.69,329.69,335.9,333.18,332.47,345.59,347.6,342.16,331.28,326.91,317.27,317.27,335.48,339.27,348.02,349.73,341.87,349.97,348.08,350.98,363.87,357.48,369.01,374.33,376.35,362.45,355.71,352.81,366,367.06,365.82,369.84,369.43,379.95,383.5,369.37,363.39,349.79,363.1,368.54,384.62,382.61,377.65,364.4,372.44,357.84,344.83,342.16,344.83,361.92,340.8,337.14,332.94,334.3,338.91,333.12,333.12,326.61,325.25,327.56,339.68,342.64,317.09,314.07,311.59,312.54,308.1,300.41,296.27,293.67,296.27,289.06,299.11,301.6,295.74,296.27,305.85,319.1,323.65,323,312.89,303.84,317.62,311.95,324.42,311.77,316.38,310.76,313.6,317.56,331.46,332.58,330.4,327.91,308.75,319.57,319.93,324.42,316.09,316.26,332.11,334.48,339.98,330.99,356.42,369.72,365.35,373.15,348.14,347.37,346.42,338.02,346.66,348.49,348.49,345.42,329.69,325.96,340.92,328.15,323.36,319.57,317.45,318.27,326.43,324.48,327.32,326.67,322.83,307.75,307.92,305.85,299.7,302.72,292.31,296.87,296.87,295.8,290.48,299.53,295.56,295.56,297.87,320.52,323.54,335.72,333.29,338.32,343.35,338.68,336.66,336.66,336.19,334.18,333.29,345.71,365.58,362.27,363.93,371.38,377.71,364.93,356.59,370.2,373.57,369.07,354.7,367.42,356.3,355.88,353.76,355.53,367.06,365.7,355.12,348.97,348.97,340.63,336.96,347.43,344.06,342.4,341.93,339.09,333.71,335.78,336.07,328.56,336.43,328.8,324.84,318.75,320.93,320.11,334.54,335.07,340.86,346.72,344,362.74,361.68,353.58,350.56,375.75,373.09,356.83,352.51,338.68,337.2,346.3,346.3,374.16,375.93,366.41,372.56,370.37,369.84,366.23,358.66,363.45,361.5,351.92,343.82,360.85,366.06,380.6,368.72,366.06,360.2,357.84,362.09,359.96,360.32,354.76,364.34,360.26,382.26,376.88,383.91,399.59,403.13,391.66,390.36,393.44,411.65,437.2,437.2,423.95,403.31,408.57,409.05,400.77,399.41,396.57,386.28,386.93,398.88,401.36,408.75,406.98,400.12,400.12,395.62,389.12,391.78,386.04,387.05,394.97,396.63,380.43,373.21,377.88,377.88,367,362.09,358.66,369.49,376.11,377.23,381.61,378.95,385.33,384.03,384.15,382.55,388.23,387.23,388.41,398.46,420.28,421.05,422.18,418.45,403.13,409.11,413.42,410.29,400.06,394.44,386.99,380.66,403.78,386.34,379.78,375.87,376.05,378.24,374.99,385.51,376.64,376.82,386.22,394.32,402.66,413.6,416.26,416.26,415.67,416.38,413.19,415.02,414.13,415.79,418.98,424.54,413.25,416.91,418.15,412.06,401.54,407.33,405.56,401.77,403.37,385.57,402.31,401.89,401.12,402.78,408.34,413.72,410.88,408.46,415.2,412.48,409.28,408.52,408.04,408.87,399.35,397.52,395.51,402.54,393.26,381.61,388.23,390.72,395.45,410.41,416.56,429.21,431.22,430.51,427.44,435.07,445.65,442.22,456.36,456.18,453.4,458.66,464.93,453.64,455.94,455.94,454.58,458.37,450.15,453.52,450.15,449.02,439.33,435.78,432.47,435.54,443.29,460.02,462.21,471.85,486.04,481.43,482.32,485.93,465.35,505.5,511.47,511.47,514.84,512.48,508.57,504.67,486.93,486.46,489.12,493.49,502.37,492.79,487.17,493.14,487.23,487.23,500.35,492.49,501.6,517.5,527.74,517.62,520.88,527.5,520.7,526.73,509.52,507.1,506.27,511.41,514.37,500.3,503.67,501.95,505.97,506.8,482.14,483.91,482.73,470.14,470.14,477.29,481.9,508.04,508.57,529.04,543.17,530.51,535.84,562.68,566.35,558.66,565.11,585.33,577.29,558.9,576.11,556.83,540.69,551.45,554.58,555.88,569.19,649.62,651.74,692.67,702.54,705.2,697.16,697.16,735.07,725.9,757.01,733.83,730.81,727.08,725.19,722.65,754.05,724.54,717.74,720.11,687.94,661.92,631.4,645.3,665.05,661.03,659.85,679.12,676.29,668.01,648.73,664.28,678.3,710.41,704.97,705.62,696.69,716.97,727.38,738.08,755.82,756.3,740.92,762.86,753.99,746.78,746.72,765.76,765.76,784.57,778.12,746.84,739.21,757.95,748.91,790.72,769.19,774.33,797.28,798.76,832.35,846.48,835.96,874.22,907.45,907.45,852.69,825.19,822.06,834.54,841.87,781.96,777.82,777.76,784.09,809.11,809.11,778.24,772.86,775.52,806.56,770.14,789.77,773.92,753.93,706.68,694.56,675.69,681.73,675.64,652.16,635.42,647.01,637.79,606.51,649.44,600.3,548.2,534.71,526.32,513.31,544.47,550.44,559.67,576.23,593.79,632.47,638.62,642.4,638.62,640.63,616.56,608.22,584.92,578.71,560.97,565.17,569.13,569.13,523.83,528.03,528.62,510.82,510.17,513.6,536.07,515.73,539.44,515.55,524.72,516.56,527.79,537.55,553.34,555.88,566.35,649.79,635.72,613.31,593.2,590.48,602.13,604.67,608.57,606.39,601.42,625.01,632.29,640.69,616.91,646.01,662.63,657.3,645.06,637.61,621.23,631.87,638.14,629.15,639.74,615.49,589.3,589.77,601.6,623.83,661.32,670.67,661.74,642.52,615.61,590.89,586.52,569.72,576.64,577.94,581.73,607.69,606.98,617.86,602.01,580.72,580.72,579.24,582.79,590.42,610.29,596.51,598.29,608.04,580.13,603.55,580.96,606.15,640.21,642.22,614.43,515.02,532.94,530.57,527.97,527.97,531.16,524.13,504.49,497.69,516.44,531.46,586.99,602.66,587.88,587.88,587.46,562.15,575.75,610.23,606.74,625.37,625.37,646.84,645.95,619.99,610.23,538.79,521.88,526.37,547.01,539.56,531.76,536.13,553.52,559.08,545.83,567.3,556.36,542.16,565.7,588.53,588.53,631.52,617.15,610.17,584.51,564.22,551.27,577.82,542.99,553.7,535.42,539.33,557.89,527.91,549.73,514.96,526.61,565.58,561.09,596.04,609.76,601.54,603.55,609.11,560.14,573.27,556.95,544.83,539.09,523,513.84,524.6,523.95,439.62,382.73,404.32,387.58,460.5,414.25,411.3,419.99,420.11,409.99,406.86,406.86,394.68,415.2,431.28,457.84,471.79,464.58,454.64,455.06,459.91,477.35,475.58,476.11,488.59,503.55,507.75,545.77,573.21,563.69,564.46,579.54,583.38,580.13,566.77,560.79,552.16,552.16,569.96,568.78,572.44,558.6,580.6,604.67,610.59,628.56,641.99,656.12,674.99,686.16,687.05,683.62,708.69,711.65,720.4,720.4,730.93,721.94,756.42,752.51,745.12,737.79,728.86,714.9,719.93,723.18,723.18,709.17,735.78,722.89,728.03,736.43,701.42,710.29,688.53,669.78,676.46,669.6,645.89,649.5,660.73,657.95,657.89,662.09,678.53,645.42,620.22,637.32,644.94,643.29,661.56,703.08,731.64,755.47,734.89,740.92,714.78,730.63,721.76,693.14,684.74,695.92,688.47,688.94,696.33,721.47,703.78,703.78,700.65,702.07,734.54,776.88,777.41,799.76,827.91,890.42,929.8,933,939.21,946.13,998.76,962.33,973.51,984.09,956.3,927.44,930.04,969.25,989.47,1077.17,1086.64,1110.76,1129.27,1098.11,1162.27,1137.37,1073.92,1139.98,1106.21,1135.07,1197.69,1196.81,1222.77,1196.27,1173.68,1222.41,1295.21,1301.6,1312.3,1340.21,1324.72,1323.3,1387.94,1289.36,1404.49,1409.4,1406.98,1497.93,1425.84,1448.26,1401.24,1459.67,1430.81,1351.27,1336.01,1190.83,1226.32,1324.25,1327.79,1361.68,1361.68,1398.46,1422,1416.26,1384.74,1340.33,1402.84,1460.2,1492.73,1559.49,1528.44,1426.02,1404.49,1374.99,1333.65,1469.84,1572.56,1635.66,1633.77,1695.33,1695.33,1684.15,1740.8,1730.51,1687.82,1865.29,1845.95,2030.93,2007.98,1933.89,2040.75,2045.36,1999.59,1971.32,1990.72,2145.18,2145.18,2158.49,2301.06,2351.15,2363.39,2300.95,2426.02,2574.1,2577.11,2453.46,2589,2480.43,2243.64,2264.28,2334.06,2267.89,2207.27,2426.61,2448.08,2434.42,2434.42,2364.16,2489.36,2468.07,2532.05,2489.47,2471.97,2536.96,2457.48,2438.62,2440.39,2245.3,2370.02,2348.02,2189.83,2302.31,2383.86,2475.99,2397.1,2519.99,2612.66,2730.28,2730.51,2627.26,2500.89,2391.19,2339.03,2259.55,2102.07,2112.48,1903.02,1997.87,2175.34,2165.82,2165.82,2233.94,2232.88,2405.26,2492.67,2487.23,2522.53,2753.76,2697.99,2703.9,2691.13,2651.8,2657.48,2882.79,2848.73,2937.43,3102.07,2982.2,3066,3058.31,3206.45,3408.93,3785.93,3941.99,3823.95,4416.38,4703.31,4533.29,4752.4,4589.06,4285.39,4030.4,4132.11,4328.74,4506.8,4441.16,4441.16,5297.93,5490.3,5461.38,5742.16,6123.6,6292.73,6384.21,5890.01,5109.46,5613.72,5534.54,5274.28,5889.24,5804.91,6434,6036.43,6169.07,6706.03,6706.03,7163.69,6219.81,6200.53,7176.58,6696.22,6772.8,6826.08,6104.55,5769.13,5769.13,5823.48,5549.26,5610.88,5864.22,5791.25,5541.1,5813.84,5347.61,5045.54,5020.4,5118.04,5741.1,5674.04,5855.77,5446.19,5323.48,4852.34,4370.2,5172.44,4867.12,4905.38,5278.95,5282.02,5212.71,5189.65,5091.66,5136.13,5389.06,5616.97,5746.07,5983.15,5563.34,5541.75,5761.86,5717.21,5383.97,5517.27,5549.38,5549.38],"브로드컴":[null,100,99.77,99.45,99.83,97.58,97.58,96.45,95.21,94.92,90.63,92.72,93.15,95.61,97.36,96.53,96.24,94.83,95.73,95.17,93.94,93.96,96.31,96.22,97.22,97.25,95.87,95.29,97.79,98.19,98.2,98.52,96.49,96.09,95.23,95.88,95.2,97.05,96.88,97.75,97.47,99.52,97.89,97.52,97.09,95.46,95.99,95.15,97.27,97.51,97.05,99.75,99.77,97.76,94.67,94.44,92.32,93.83,94.61,94.16,94.79,97.28,99.79,99.82,99.82,99.63,98.45,98.9,96.1,91.76,92.57,93.65,92.87,95.01,96.23,100.95,100.43,101.15,100.12,101.47,100.57,101.72,102.63,102.76,101.8,102.56,102.56,102.77,101.57,101.39,99.64,99.64,100.53,99.81,98.24,99.54,99.76,101.79,101.14,100.82,101.72,101.72,100.96,104.3,104.6,107.71,107.67,111.47,114.14,115.09,115.96,114.55,112.46,114.82,115.02,116.21,116.44,116.07,116.62,115.75,115.85,116.52,115.74,116.12,117.35,118.61,118.61,119.93,120.72,118.7,118.59,120.23,118.9,121.27,122.49,123.07,122.85,123.59,123.8,125.15,127.59,127.65,126.47,127.36,125.34,124.68,124.71,121.77,122.56,122.24,123.43,123.48,124.55,124.75,124.04,123.43,123.34,123.43,122.4,122.6,123.03,122.9,122.63,117.93,119.12,119.12,120.56,120.12,120.42,123,122.69,124.71,125.82,124.96,125.76,124.47,124.76,127.09,126.78,125.93,127.65,126.88,128.78,130.4,130.26,133.01,134.74,135.67,130.32,133.97,131.96,134.37,133.34,135.06,135.77,135.97,135.97,135.19,134.99,132.24,143.48,142.17,143.1,143.34,143.71,137.17,136.79,136.94,135.59,134.15,133.17,135.94,135.28,138.17,137.56,138.25,136.84,132.66,135.88,131.93,131.37,129.52,129.52,130.56,132.49,135.07,136.29,135.79,138.91,139.41,141.09,140.37,141.42,143.4,142.86,142.68,142.63,143.35,144.88,141.46,141.13,139.04,140.02,142.82,141.09,140.46,142.3,141.69,140.46,135.69,137.64,141.44,143,142.85,139.21,140.57,140.71,143.85,144.83,143.77,138.44,137.12,136.26,138.68,142.09,142.46,142.46,140.39,140.57,138.98,137.6,139.65,139.31,138.8,139.21,141.23,140.82,140.79,136.93,135.5,134.86,132.76,133.75,135.61,136.94,136.72,135.55,135.01,136.41,137.36,138.52,138.91,138.66,141.15,140.21,139.77,139.05,136.76,137.54,137.71,137.68,137.69,139.62,138.57,137.41,142.56,147.25,148.77,146.16,146.28,154.24,156.44,152.94,153.55,149.74,149.36,149.39,148.4,149.72,153.39,153.25,154.95,155.91,155.23,155.23,159.18,160.44,156.37,153.04,156.67,153.08,148.6,147.49,148.75,148.75,146.51,146.53,145.83,147.71,146.19,149.79,149.04,148.65,149.74,147.42,147.89,147.89,145.49,146.07,146.8,144.81,150.51,152.16,152.21,153.11,153.48,151.35,148.16,148.53,148.98,148.98,148.39,149.84,152.09,150.16,147.75,148.2,144.79,139.4,141.37,138.37,135.84,139.81,134.61,132.74,128.58,135.5,133.81,129.41,132.75,137.77,138.59,139.61,141.96,140.3,140.3,140.71,140.15,140.56,143.02,142.59,141.94,138.93,137.15,141.41,139.22,141.47,139.26,139.21,143.06,148.16,147.25,146.89,150.94,143.67,138.08,136.62,138.67,137.3,136.69,139.64,137.75,133.42,132.84,132.84,128.34,133.47,133.59,133.21,129.01,132.32,135.15,135.47,134.97,139.2,140.57,141.91,140.69,136.9,133.66,131.6,128.74,129.09,129.89,131.22,129.32,129.86,128.94,126.97,129.94,133.02,134.64,134.19,137.27,137.19,137.97,136.18,135.57,134.98,133.03,134.75,134.44,135.6,137.28,140.94,140.94,140.75,140.59,142.09,144.5,145.64,146.14,148.55,149.2,145.42,147.03,147.37,148.58,151.33,152.33,149.1,147.1,147.25,146.36,146.4,142.29,141.79,139.3,138.05,136.78,136.44,134.89,134.89,138.33,139.62,139.48,141.24,137.23,118.37,114.13,114.57,117.42,117.69,118.59,118.56,122.16,122.51,127.38,125.81,124.61,126.94,125.01,122.21,121.96,122.78,122.29,124.19,123.71,122.09,119.63,118.99,116.85,116.45,117.64,117.97,116.53,118.66,116.99,115.89,117.81,120.05,120.87,121.19,122.13,123.47,123.47,123.69,124.81,121.74,131.1,135.63,131.09,129.59,132.71,133.22,132.37,135.14,136.3,138.07,139.85,140.61,139.6,138.35,138.92,139.08,140.65,139.85,140.6,139.89,137.67,136.06,137.94,130.68,129.03,131.31,131.04,134.34,133.69,128.53,128.68,128.87,129.11,123.29,125.28,120.15,119.22,124.58,125.98,129.58,124.45,124.06,128.66,132.13,135.43,134.72,126.06,126.74,127.51,133.22,133.94,129.16,128.36,129.65,129.65,129.59,132.64,132.94,132.59,132.91,133.83,136.45,130.8,130.8,128.09,128.84,134.86,139.14,143.73,145.6,143.65,143.25,140.74,137.48,136.35,138.06,131.79,131.79,139.88,141.4,142.95,143.34,142.9,130.19,131.47,134.15,133.07,138.83,140.65,141.25,141.41,144.58,141.88,143.93,147.02,147.02,145.6,145.16,148.56,151.04,150.86,150.12,152.66,151.21,150.4,153.39,152.2,155.7,151.69,154.49,155.42,157.49,158.58,158.68,158.92,158.92,158.77,159.76,158.37,155.86,157.05,155.02,153.04,155.22,153.75,154.95,156.15,152.96,149.67,148.92,151.67,151.99,152.88,151.18,163.64,165.64,168.72,164.05,167.31,164.97,164.69,167.44,166.84,168.59,169.51,172.37,170.83,171.48,170.24,171.52,171.63,171.05,173.34,174.41,178.71,178.35,179.54,180.68,179.61,179.61,177.56,177.93,177.19,175.77,174.98,176.28,179.48,179.76,178.03,177.97,175.63,173.22,171.02,171.4,171.34,165.38,170.24,171.57,167.58,163.41,153.66,155.2,151.76,146.61,144.27,144.27,143.45,143.25,144.66,141.85,142.72,149.77,149.79,153.77,154.94,157.95,159.8,157.68,158.74,149.9,149.93,156.74,156.42,157.3,154.45,157.38,155.87,158.65,161.05,162.27,169.31,166.48,160.59,160.59,159.33,154.99,155.32,154.74,155.61,160.87,162.54,160.16,160.7,163.35,163.47,166.94,169.55,171.23,169.33,169.63,170.09,168.86,163.47,160.85,157.01,150.88,150.19,152.23,152.75,155.43,155.38,159.92,153.08,151.43,154.33,157.15,158.04,162.06,162.13,153.4,156.27,155.34,155.61,159.74,159.32,159.32,154.48,159.54,164.05,164.55,164.94,165.98,167.99,169.44,163.65,162.72,162.81,162.2,163.83,160.24,160.91,159.14,155.45,156.09,154.53,155.62,154.93,152.24,154.7,158.64,155.63,152.38,153.97,154.71,158.35,158.77,163.65,162.62,163.15,161.63,163.23,162.04,158.02,159.14,163.37,164.35,162.44,163.61,165.08,167.19,171.93,177.02,176.53,175.73,176.67,176.3,177.86,176.82,174.17,176.39,175.35,179.09,175.69,177.71,177.52,180.17,178.28,179.5,179.5,178.25,175.15,172.78,174.59,175.42,178.16,177.22,177.6,180.23,184.78,177.8,182.15,182.53,184.58,182.69,179.82,180.12,180.67,180.67,179.24,178.43,176.7,178.14,181.73,177.11,176.84,176.23,174.04,172.64,168.67,169.77,173.72,170.88,173.08,174.06,174.06,173.66,176.42,180.19,182.64,174.2,179.43,178.98,177.68,172.02,172.06,175.65,178.91,180.21,177.69,177.11,180.47,183.03,182.62,179.13,179.13,175.17,177.95,174.32,171.65,164.37,159.35,161.15,154.43,153.68,160.64,154.59,160.91,154.48,151.89,139.64,148.2,138.65,123.33,132.03,105.74,112.46,94.63,109.61,108.35,109.06,119.93,122.63,137.07,130.04,135.35,133.65,126.06,133.63,132.05,142.3,142.77,147.18,143.35,143.35,146.52,150.86,145.12,145.6,149.88,145.59,139.6,146.54,145.96,149.27,151.32,149.23,155.59,153.11,146.39,147.84,149.31,148.92,150.93,155.03,155.24,151.32,148.34,150.28,146.79,154.19,153.3,157.09,154.9,155.95,155.95,158.97,162.11,159.61,164.19,163.47,168.02,174.48,174.12,178.74,178.99,177.75,177.59,165.59,169.25,171.41,175.15,176.69,179.66,170.67,176.74,175.48,173.04,174.1,173.29,174.62,177.91,176.29,177.83,177.83,179.7,176.51,180.14,181.23,180.07,175.48,177.61,176.88,175.5,176.27,178.77,177.19,176.89,174.56,172.37,176.26,173.25,174.1,175.93,178.55,181.08,185.11,185.76,185.55,183.73,184.53,182.66,188.07,185.69,184.79,186.2,185.25,185.57,185.36,186.03,188.28,189.48,191.47,191.17,194.37,195.69,202.67,211.39,198.47,204.59,204.59,197.6,202.95,201.29,202.76,204.17,206.83,206.9,206.27,202.78,198.3,203.83,198.19,198.71,201.13,207.05,205.33,205.37,207.78,201.14,206.37,205.17,206.73,210.45,212.34,215.57,215.05,214.37,214.17,213.44,211.82,212.51,209.72,210.47,210.1,204.64,202.71,195.72,200.12,197.09,198,199.41,205.54,214.7,214.55,211.69,204.7,211.91,208.68,210.54,214.66,214.54,214.55,216.65,216.08,218.15,221.1,220.31,220.31,222.63,226.37,228.06,227.58,225.37,232.06,237.25,238.68,234.62,231.14,228.76,232.13,235.66,239.52,240.19,244.96,241.76,244.14,239.83,243.21,243.21,243.45,241.85,245.11,246.82,239.7,241.32,239.83,249.94,251.21,251.27,253.32,254.35,254.83,251.32,251.32,258.89,260.36,263.15,262.13,262,261.48,250.68,254.64,253.95,263.1,268.82,262.23,265.29,262.69,266.46,267.55,264.97,269.67,274.14,274.14,275.72,271.97,272.41,276.19,268.52,266.01,271.07,257.7,264.86,275.98,270.86,261.03,250.05,253.74,237.46,250.06,246.67,255.74,254.32,265.37,269.55,272.6,261.64,267.45,267.91,261.59,257.76,260.26,271.72,266.41,257.14,261.36,268.29,268.29,275.36,272.76,271.96,273.66,273.44,272.64,273.37,269.05,270.57,269.89,260.43,257.76,259.18,256.54,262.76,265.98,262.88,258.85,262.85,257.16,253.74,250.59,250.19,252.86,255.12,245.83,248.07,238.09,242.73,248.94,247.99,244.5,249,256.48,254.36,258.84,259.04,259.58,263.63,266.25,266.25,263.99,267.04,262.01,267.76,261.43,261.29,261.52,264.19,265.33,268.22,265.36,262.54,265.6,261.27,261.9,261.81,263.06,264.97,260.54,266.52,268.97,268.79,264.74,263.91,263.91,266.79,264.68,265.22,270.68,273.82,272.84,271.47,269.08,263.85,262.5,264.14,270.02,268.51,272.35,271.84,267.96,269.25,272.89,273.62,273.21,274.4,274.97,274.9,273.64,273.21,271.85,272.58,272.98,274.05,275.16,269.84,264.36,266.93,267.85,271.96,271.38,272.5,273.81,279.56,281.22,280.28,277.99,277.28,280.54,280.54,279.93,278.68,278.18,280.81,281.26,282.9,287.34,285.99,285.23,278.93,276.77,282.18,284.27,284.62,284.58,276.79,275.92,273.35,274.72,268.29,273.63,275.52,278.42,277.82,277.53,273.55,273.4,280.5,283.68,283.74,287.71,287.14,289.83,290.54,294.29,300.94,294.88,298.52,299.7,297.66,302.75,305.73,309.26,315.06,315.08,314.43,309.34,313.08,317.49,318.92,320.61,321.1,324.02,320.59,311.88,312.92,314.95,314.95,308.11,318.12,312.11,312.72,311.41,314.61,318.48,332.81,331.77,328.87,356.08,350.43,346.62,360.69,349.88,357.93,363.6,364.28,369.33,374.75,374.75,380.09,377.11,379.15,374.9,375.09,373.91,378.2,362.46,359.09,349.01,350.15,350.65,350.62,336.63,336.17,336.17,325.7,317.91,308.75,300.58,305.29,301.09,314.05,305.7,315.73,330.26,334.11,340.15,327.42,332.67,331.25,338.34,344.61,333.35,323.24,326.14,339.78,336.65,326.38,326.94,326.94,325.51,318.6,326.94,331.46,331.14,321.38,330.2,326.16,335.96,321.7,324.66,336.54,331.3,325.73,320.07,334.14,342.23,339.72,344.09,338.95,344.61,337.87,353.12,354.49,356.75,361.6,355.74,354.95,353.43,357.86,346.18,339.35,339.94,330.89,327.29,329.8,334.01,323.48,323.48,330.61,336.88,336.93,334.12,330.86,331.39,315.71,315.41,326.35,312.51,324.89,327.6,340.28,326.94,327,317.32,327.73,319.68,322.19,331.59,328.45,342.81,321.63,307.9,306.2,296.71,295.49,299.68,310.41,328.79,328.79,327.02,323.35,325.11,317.54,316.36,322.99,318.69,313.54,305.11,291.78,293.22,296.91,280.26,281.09,281.09,283.97,279.65,279.92,286.97,285.07,280.98,276.44,273.85,269.36,269.36,268.49,272.05,281.03,281.11,272.19,271.35,271.55,273.19,278.73,276.81,286.92,288.48,291.82,288.91,289.24,288.1,297.51,300.79,301.85,302.35,299.44,308.2,311.61,310.85,307.51,300.34,310.26,307.46,314.67,315.08,310.96,303.6,314.8,309.15,298.06,298.64,299.23,310.11,293.61,289.84,285.45,281.35,277.34,281.97,281.97,280.83,284.74,288.57,294.48,298.23,283.91,287.91,281.93,283.26,282.89,277.94,271.78,269.23,264.19,260.57,261.98,262.66,253.74,250.29,257.49,270.5,273.28,270.29,259.57,246.73,242.82,242.71,246.88,240.76,245.42,245.11,245.38,242.56,253.51,257.34,259.34,259.97,256.71,266.57,265.01,263.75,257.06,250.35,262.29,267.88,271.76,264.64,285.55,292.05,289.3,295.61,288.46,288.68,290.39,291.68,298.79,300.81,300.81,298.71,294.37,293.91,310.61,310.46,304.85,299.12,296.4,292.28,299.37,307.06,313.77,321.89,323.81,314.54,313.37,309.83,306.66,316.36,311.78,311.4,311.4,312.03,307.15,314.44,315.18,315.18,312,315.81,312.86,331.7,325.19,324.09,325.9,328.04,326.38,326.38,326.52,323.73,317.49,321.75,327.86,329.78,330.15,337.42,333.14,327.76,329.77,339.77,341.47,336.88,338.95,346.36,339.18,337.89,334.41,338.85,339.52,342.55,338.52,335.73,335.73,327.81,324.79,329.09,325.68,330.02,335,334.59,337.46,356.69,356.78,352.4,356.4,350.91,346.58,347.5,356.52,352.9,358.79,355.68,362.86,358.93,355.65,360.33,358.61,353.35,352.14,352.59,357.24,361.63,362.16,357.62,354.57,350.98,350.98,353.66,350.38,347.63,351.88,349.23,353.64,356.44,357.67,356.83,356.76,357.69,350.63,347.34,348.6,353.16,359.61,345.17,345.66,343.95,355.2,354.6,348.65,353.03,353.82,355.78,360.65,361.58,370.61,382.13,384.58,382.4,386.98,383.05,410.82,458.13,458.13,452.84,455.45,445.29,457.72,452.25,445.32,446.8,453.33,453.56,482.16,479.77,499.54,497.99,489.35,489.35,489.31,477.82,474.88,463.44,463.15,478.24,477.98,486.23,488.97,494.05,494.05,485.83,478.02,477.31,494.77,497.21,501.66,501.89,500.89,513.16,509.26,508.1,500.76,505.5,508.22,517.47,503.43,503.68,507.21,506.57,518.6,502.99,498.86,496.98,505.67,497.84,479.55,475.14,467.73,481.45,474.93,469.55,466.23,465.52,487.68,482.41,494.13,481.66,480.17,485.39,501.65,502.98,520.23,491.84,491.84,491.64,491.7,483.11,483.4,484.3,476.05,480.79,491.34,480.09,479.14,478.69,468.19,455.67,467.35,470.06,460.08,460.43,469,468.2,470.66,459.32,464.38,464.41,476.47,482.46,483.88,492.99,510.48,497.85,508.78,498.53,500.02,489.19,481.19,486.03,496.68,478.93,466.04,472.58,474.21,474.28,480.8,491.15,497.56,496.52,506.1,513.6,513.74,539.75,533.78,548.46,549.83,540.9,551.14,561.28,553.1,547.91,547.91,551.79,535.65,533.46,530.34,521.83,524.24,520.84,514.72,509.38,519.88,532.3,580.18,604.44,614.26,623.73,636.83,646.56,642.38,625.92,635.45,632.46,632.46,638.04,634.82,632.7,629.23,611.83,596.72,591.32,591.48,605.89,610.2,609.11,620.06,624.4,624.4,628.5,622.14,644.82,682.75,687.99,691.27,706.8,693.35,679.19,686.45,681.04,665.16,676.44,690.16,700.73,689.21,708.6,718.58,723.47,713.08,705.55,711.51,713.12,702.07,702.07,691.4,691.91,735.57,730.76,737.95,730.68,726.84,733.08,788.71,790.45,756.91,760.99,793.13,737.72,728.93,728.23,709.06,711.54,696.45,697.43,697.86,719.28,759.86,762.95,761.88,750.56,743.37,747.13,747.13,761.14,754.66,768.44,742.67,755.03,753.16,752.02,745.42,779.29,757.65,738.83,749.19,723.02,709.69,679.09,690.23,704.17,708.47,729.66,757.65,754.58,732.96,700.6,698.18,720.47,738.62,734.56,747.11,736,751.3,753.95,777.92,809.57,796.01,786.52,797.09,788.73,784.8,785.39,793.6,793.6,796.2,783.92,768.93,748.9,745.15,750.18,796.56,789.89,792.92,811.99,823.58,843.02,946.44,978.04,1030.93,1016.08,1016.08,977.77,934.97,897.53,891.09,897.41,894.4,905.03,924.92,934.32,974.76,974.76,960.15,984.14,977.06,983.48,961.64,958.66,966.29,954.79,879.26,904.85,886.98,907.89,923.17,853.1,841.38,854.74,846.79,809.02,905.75,828.75,810.71,800.9,811.27,768.15,821.53,835.74,837.77,880.27,888.9,936.47,934.16,945.38,935.46,934.5,915.11,937.77,899.77,909.75,891.66,884.61,917.81,917.81,861.27,868.77,861.44,772.27,793.8,835.46,892.16,927.62,945.26,924.58,915.84,911.33,943.74,964.49,974.86,985.57,989.4,1003.89,973.45,972.38,944.02,962.01,968.94,995.72,986.92,1018.77,1048.2,1046.73,1023,1027.68,992,996.73,1023.28,1014.04,1014.6,1011.16,978.07,965.9,975.2,969.67,1010.37,995.72,956.99,952.2,950.11,980.27,1012.12,1036.13,1035.17,1008.51,993.35,978.47,960.43,929.2,933.88,932.07,920.24,924.13,925.76,929.09,928.64,900.06,900.06,913.64,938.61,947.86,961.44,960.94,1012.01,1008.68,968.49,1032.69,1018.38,1267.19,1409.24,1354.17,1260.54,1230.67,1244.59,1309.75,1351.07,1351.07,1383.09,1362.74,1327.96,1306.88,1307.67,1310.88,1332.64,1288.84,1292.62,1292.62,1264.43,1269.95,1266.63,1285.23,1293.18,1338.44,1338.44,1354.62,1358,1354.45,1379.37,1139.4,1168.88,1163.19,1215.67,1247.29,1227.34,1253.83,1307.78,1304.17,1267.59,1324.92,1324.92,1332.3,1329.2,1313.64,1313.64,1288.22,1289.35,1278.13,1232.58,1172.1,1141.71,1200.34,1114.99,1124.18,1056.2,1056.82,1079.93,1011.56,1098.99,1039.74,1071.53,1094.87,1078.69,1102.25,1096.39,1063.53,1102.42,1074.07,1080.38,1078.07,1061.22,1010.54,969.5,953.33,943.8,949.94,970.07,868.15,824.63,868.88,879.54,1043.69,971.25,1025.59,1005.41,1008.74,984.27,963.87,963.87,936.92,955.92,997.24,1060.6,1084.05,1084.95,1077.62,1084.95,1112.35,1147.91,1131.45,1127.9,1154.51,1171.2,1173.62,1249.04,1310.15,1308.46,1311.39,1288.67,1300.06,1305.98,1294.98,1299.49,1289.29,1289.29,1328.35,1349.66,1363.98,1364.54,1401.97,1447.86,1471.7,1465.22,1391.94,1377,1378.97,1425.65,1443.46,1401.92,1421.08,1405.69,1416.35,1416.35,1409.19,1430.5,1486.87,1491.83,1522.94,1518.32,1553.83,1492.33,1521.42,1551.18,1551.18,1545.55,1532.13,1566.52,1552.42,1546.67,1553.55,1583.65,1582.92,1614.71,1597.18,1624.63,1570.41,1599.15,1627.45,1635.74,1658.96,1676.55,1705.86,1655.58,1627.06,1678.24,1651.24,1700.51,1712.29,1719.11,1713.08,1763.42,1742.33,1754.4,1726.83,1723.56,1662.4,1641.32,1632.47,1657.27,1658.57,1679.88,1692.5,1739.85,1676.38,1676.38,1681.17,1704.57,1725.48,1887.77,1948.42,1897.8,2083.26,2027.23,2028.58,2052.37,2029.31,1951.35,1946.73,1944.42,1909.75,1910.6,1912.68,1894.59,1885.74,1848.37,1859.7,1879.31,1906.31,1907.38,1891.15,1896.34,1947.58,1944.87,1829.93,2010.71,1939.85,1980.44,1996.34,1969.17,1968.66,1931.57,1918.26,1940.76,1996.22,2040.87,2102.42,2175.76,2122.15,2083.6,2043.69,1983.88,2023.56,2004.45,1969.73,2020.24,1983.99,2002.37,1916.46,1930.44,1931.51,1919.39,1997.86,1955.02,1917.7,2130.55,2170.41,2241.09,2241.09,2271.48,2176.32,2150.9,2145.49,2147.86,2199.77,2260.99,2290.25,2327.9,2290.7,2028.92,1915.5,1923.9,1837.77,1859.53,1918.6,1924.75,1969.11,1974.18,1974.18,1984.95,1969.5,1972.1,1950.96,1959.53,1935.85,1937.82,1936.3,1874.18,1944.59,1985.4,1998.93,1915.95,1933.6,1982.58,1982.58,1874.86,1853.44,1834.78,1804.11,1831.17,1875.93,1878.47,1864.32,1867.53,1866.46,1805.69,1736.47,1750.34,1876.66,1938.78,1919.05,1932.13,1866.8,1832.98,1832.98,1874.52,1879.99,1882.69,1875.14,1862.12,1834.78,1873.22,1813.42,1801.3,1797.18,1769.11,1789.91,1875.82,1862.91,1948.99,1931.12,1925.42,1893.86,1816.01,1831.57,1811.22,1780.89,1802.93,1750.34,1817.98,1794.19,1797.13,1744.19,1694.93,1653.95,1744.7,1767.14,1773.11,1773.11,1772.44,1882.58,1976.49,2000.62,2094.42,2140.64,2146.45,2236.3,2246.17,2291.66,2252.71,2267.02,2382.47,2367.19,2383.09,2357.38,2253.83,2285.51,2353.04,2374.75,2347.8,2409.02,2398.2,2325.59,2423.9,2415.05,2363.59,2349.44,2479.09,2396.79,2371.53,2317.19,2354.9,2336.92,2334.5,2334.5,2378.86,2378.02,2404.62,2518.43,2592.84,2714.6,2701.41,2361.39,2174.35,2235.63,2210.6,2097.52,2173.45,2153.72,2220.63,2123.51,2214.77,2318.77,2318.77,2210.43,2142.9,2153.72,2135.91,2057.61,2099.49,2129.37,2081.96,2031.85,2031.85,2107.67,2090.08,2191.04,2261.05,2254.62,2164.88,2193.4,2222.55,2110.77,2090.36,2131.68,2178.69,2236.81,2212.35,2152.87,2160.2,2147.18,2087.49,2186.25,2194.36,2210.99,2357.16,2357.84,2370.74,2411.27,2381.06,2345.43,2345.26,2355.24,2215.28,2212.12,2142.05,2043.29,2052.03,2076.94,2022.32,2010.94,2004.45,2004.45],"삼성전자":[null,100,100.3,98.78,96.77,97.38,97.93,100.18,98.84,99.94,96.04,89.33,93.11,93.11,93.11,93.11,95,96.65,97.07,98.66,95.79,95.61,95.67,95.55,97.56,97.44,97.44,98.41,98.72,103.11,104.02,102.44,94.21,93.6,94.94,96.16,96.95,96.89,99.09,98.78,96.89,98.05,97.38,95.55,95.91,98.41,99.94,100.73,100.18,98.54,99.21,100,100.24,97.32,100.55,97.44,94.7,93.84,95,95.61,96.71,97.13,100,100.55,100.61,100.61,102.26,102.26,106.46,106.65,105.3,104.76,106.59,108.05,109.15,108.54,106.83,107.68,108.35,107.26,109.33,109.45,110.49,110.06,110.3,108.66,109.63,109.7,109.02,109.88,109.88,110.06,111.22,110.24,108.41,110.37,113.48,113.54,116.71,118.29,114.21,111.77,112.68,112.62,114.27,113.41,116.04,116.34,120.12,121.65,121.65,121.65,120.3,119.27,120,120.3,120.61,118.35,117.07,117.07,116.95,115.73,114.57,115,115.91,115.43,117.87,118.72,119.82,119.45,116.52,116.04,117.2,117.2,121.1,120.79,122.2,122.56,122.56,122.56,122.5,123.78,126.1,126.22,127.56,129.27,127.74,129.76,129.45,127.44,126.52,125.61,126.46,127.38,127.99,125.61,126.34,128.29,128.48,127.56,126.83,127.87,126.83,127.74,129.33,128.11,126.71,126.52,124.7,122.8,124.27,125.73,130.18,130.49,133.66,136.04,136.04,136.89,136.89,138.78,138.78,143.35,143.35,139.02,138.72,139.7,140.55,141.4,141.28,140.06,136.34,137.5,136.95,136.83,139.27,140.49,139.09,136.1,136.28,136.22,140.12,140.06,140.06,138.11,137.68,140.55,138.35,138.41,138.29,139.27,138.96,141.95,146.77,144.76,146.22,145.18,147.2,147.26,145.43,146.16,144.94,143.96,143.29,145.06,146.52,145.91,148.35,149.39,152.07,154.15,153.9,154.39,155,154.7,156.1,155.73,155.06,152.44,151.95,151.83,145.61,146.95,148.17,149.39,145.67,145.43,145.06,145.49,141.1,139.94,136.04,137.2,137.2,140.85,143.41,142.99,142.8,143.29,144.76,144.88,143.35,140.55,140.49,140.85,141.22,141.71,140.37,142.56,143.29,146.71,149.63,151.83,151.22,151.28,153.35,153.66,160,158.9,159.21,160.98,160.98,163.48,163.48,157.56,156.28,156.34,156.34,156.34,156.34,156.34,156.34,156.34,160.98,166.59,167.07,164.63,164.39,167.07,166.95,161.52,164.15,165.55,164.76,164.33,159.76,161.83,164.76,167.93,174.45,173.96,171.89,171.89,171.04,173.05,171.77,171.95,171.89,170.49,168.72,170.06,170.18,168.29,168.54,170.61,168.6,169.09,160.49,162.44,160.37,154.88,155,156.52,156.28,152.5,154.7,158.54,157.87,158.84,156.46,155.67,154.33,156.1,157.2,157.2,149.82,151.52,151.52,146.95,150.49,155.37,155.37,155.55,157.38,155.73,158.9,158.6,153.66,148.9,147.07,146.95,147.99,152.44,151.28,152.13,150.37,147.07,149.88,150.43,153.23,154.82,156.16,151.83,152.13,151.89,145.43,146.1,144.57,139.63,140.24,136.28,139.39,144.94,149.39,149.39,149.39,147.5,144.51,144.15,142.56,143.96,144.45,144.45,143.48,143.48,140.3,137.8,143.35,148.23,150,151.65,151.65,157.5,157.8,157.13,155.91,154.7,156.1,155.67,157.87,151.59,153.29,152.38,148.48,149.51,150.06,147.99,146.71,143.05,148.6,147.56,150,149.02,148.96,149.39,151.83,153.48,152.38,156.59,160.91,157.38,158.23,153.84,153.66,158.96,161.59,161.59,161.59,161.59,161.59,158.23,158.23,160.37,155.18,157.32,156.4,152.74,150,151.98,150.61,150.91,152.44,152.44,157.93,156.71,160.67,159.45,156.4,150.91,154.57,156.4,155.79,156.4,156.4,154.27,151.37,152.13,150.61,150.61,146.95,145.27,142.07,143.29,143.29,143.45,144.05,142.23,143.29,146.19,142.68,142.23,138.87,140.7,141.01,140.09,136.89,139.02,141.16,140.24,138.72,141.77,140.4,139.79,141.92,142.99,144.66,141.77,140.7,140.7,142.99,142.99,141.77,141.01,141.92,138.87,139.48,139.63,142.38,142.68,142.99,138.41,137.35,137.65,137.65,134.91,134.45,133.69,136.59,140.55,140.85,140.7,141.16,141.92,142.68,145.27,147.71,144.66,145.27,142.07,140.55,136.89,138.72,137.35,135.82,134.3,139.79,137.65,138.72,140.7,144.05,144.51,144.51,144.51,144.51,144.82,141.62,141.31,139.33,139.33,136.28,136.28,137.04,137.04,138.11,131.4,134.15,133.54,132.93,134.6,134.3,133.84,132.77,131.25,129.73,125,125,126.22,129.12,129.27,128.51,134.6,133.54,133.38,134.15,134.3,135.06,137.8,135.67,134.45,134.91,134.15,133.08,130.49,128.35,129.42,129.27,129.88,131.25,131.55,131.55,127.59,131.86,128.51,126.37,123.48,124.85,122.56,122.71,123.32,121.95,118.75,119.36,118.6,119.21,117.84,117.84,118.29,118.29,116.92,116.62,117.99,117.99,118.14,114.63,114.18,118.14,116.16,120.73,121.34,123.48,122.1,125.3,126.37,127.9,128.96,130.34,128.51,128.05,131.25,136.43,137.35,138.72,141.46,140.7,141.31,141.31,141.31,141.31,140.85,136.59,137.2,140.4,140.85,144.82,140.4,140.85,140.09,142.99,143.14,143.75,144.36,142.53,142.53,137.5,137.5,136.74,134.91,134.15,135.52,133.54,133.08,136.13,133.69,133.69,134.76,133.23,133.84,134.3,139.79,141.92,138.72,137.96,138.26,136.74,136.13,137.35,139.48,142.07,143.14,142.84,142.23,142.23,142.38,141.01,142.84,143.45,144.05,143.45,139.02,138.11,138.26,137.8,136.43,136.13,136.74,140.7,139.79,139.79,139.94,138.11,138.11,136.74,134.91,129.42,130.79,130.03,130.03,129.73,126.68,125.61,128.05,131.55,132.62,133.69,130.18,130.03,129.73,127.44,129.73,129.57,133.54,132.47,133.84,133.84,134.76,136.59,136.74,135.98,133.38,134.15,133.84,135.21,138.26,138.72,139.33,138.72,139.02,139.33,141.77,143.29,142.07,141.01,138.41,140.24,139.18,135.37,137.5,138.87,140.85,141.16,141.62,142.84,140.4,140.55,142.68,143.9,144.21,141.46,143.9,143.75,140.55,141.92,138.26,137.8,137.04,133.99,132.62,131.71,130.03,131.55,133.23,131.1,133.23,133.23,133.84,132.93,135.52,135.67,134.3,133.99,132.93,134.3,134.6,132.32,134.15,133.54,131.86,134.45,139.33,141.16,142.99,143.29,143.75,143.75,143.75,143.6,142.99,145.43,149.85,150,150.3,150.91,149.09,150,147.56,149.54,148.93,145.12,145.12,146.34,145.58,149.09,149.09,148.02,149.85,152.44,152.74,154.57,153.96,152.13,153.35,156.1,156.1,154.57,155.18,156.4,155.79,153.66,153.66,156.1,159.45,160.67,162.5,161.28,158.84,157.32,160.37,160.06,160.98,163.72,163.11,163.11,158.54,155.49,157.32,157.93,157.93,159.15,156.4,153.35,153.66,152.13,150.76,150.91,153.66,156.1,157.01,158.23,162.5,166.77,166.77,172.87,171.65,170.73,170.73,169.21,167.68,167.68,168.9,172.26,170.12,170.12,168.29,169.21,169.21,170.12,173.17,178.66,181.4,182.93,182.93,179.88,185.06,186.89,190.24,187.2,189.94,185.37,185.37,185.37,179.27,180.18,174.39,171.95,174.39,179.57,181.4,186.28,184.15,182.01,182.62,184.45,185.06,188.41,187.5,182.32,183.54,182.93,180.49,173.17,176.52,172.26,170.43,165.24,167.68,168.9,175,176.22,172.26,172.26,166.46,158.84,158.84,152.29,149.09,144.21,139.02,130.95,138.41,129.57,143.14,148.32,145.73,147.26,145.88,145.58,139.63,142.68,143.29,148.48,151.22,148.17,149.7,150.15,147.26,149.39,149.39,149.39,156.71,152.74,150.15,151.98,151.98,150.46,151.98,152.74,152.44,152.44,152.44,147.87,147.87,150,148.78,148.78,147.56,146.04,148.02,146.34,145.88,148.78,153.35,152.44,152.29,148.63,148.93,150.15,152.13,153.66,154.57,156.1,156.71,166.16,166.46,169.21,167.38,169.21,168.9,165.55,159.45,152.13,158.84,159.15,159.45,161.28,158.54,156.71,161.28,158.23,162.5,159.76,160.98,160.37,161.28,163.41,167.68,162.8,161.59,160.98,160.67,162.8,164.02,166.77,164.02,165.85,165.24,168.6,166.77,164.94,165.24,169.51,178.66,179.88,179.88,176.52,173.17,174.7,173.48,176.83,175.3,176.22,177.44,179.88,178.96,176.83,176.83,178.05,176.22,168.9,170.43,171.04,171.95,171.95,169.51,168.9,164.63,165.24,165.85,171.95,169.51,172.26,178.96,178.05,180.49,179.88,184.15,185.98,185.98,181.4,180.79,180.49,177.44,178.66,176.22,176.52,177.44,177.44,177.44,177.44,177.44,178.96,179.88,182.62,182.01,182.01,184.15,185.67,185.67,182.93,181.4,182.93,185.67,185.67,183.23,183.54,184.15,182.32,179.88,177.13,172.56,175,179.27,178.35,183.84,183.23,183.54,183.54,186.89,185.98,192.68,202.13,200.3,197.56,196.95,197.26,205.79,206.4,203.05,207.32,207.93,203.35,206.71,211.89,212.5,217.99,222.26,218.6,225.3,222.26,223.78,225,225,225,223.48,222.56,222.56,220.43,225.3,237.2,237.2,239.94,238.72,246.95,246.95,253.05,255.79,250.61,252.74,270.73,277.44,276.22,273.48,273.48,268.29,259.15,265.24,265.85,268.6,264.63,272.56,264.33,260.98,255.18,250,253.05,257.32,257.93,251.52,254.57,253.05,252.13,248.78,248.78,248.78,256.71,258.84,253.66,250.3,251.83,250.61,250,250,260.06,251.52,251.52,254.88,256.1,251.22,250.3,250,248.17,246.65,250,252.44,249.39,252.44,250.91,252.74,249.7,250,249.39,246.95,247.56,248.48,248.78,250.61,248.17,252.74,258.54,260.37,262.2,260.98,258.23,254.88,253.66,256.1,256.1,256.4,255.79,253.96,255.79,251.83,251.22,252.44,254.57,252.74,250.3,249.09,248.48,249.09,251.83,251.83,250.91,249.7,253.66,247.56,243.9,239.33,244.21,242.68,242.68,242.68,242.38,244.21,242.99,243.6,243.29,242.68,244.21,245.43,245.73,246.34,252.44,250.61,249.7,249.7,247.26,246.95,246.95,245.43,246.65,249.39,246.65,245.43,243.6,243.9,244.21,247.56,248.78,249.7,246.95,246.04,244.21,243.9,245.12,247.56,246.34,243.6,242.07,242.99,243.29,242.38,245.73,243.29,240.85,240.85,239.33,242.99,241.77,240.24,239.33,241.46,240.85,239.33,241.77,248.17,252.74,250.3,248.48,248.48,244.51,239.33,234.76,226.83,226.83,226.22,225.3,222.87,221.65,223.48,230.49,230.79,227.44,226.52,227.44,233.84,234.15,231.71,233.54,235.67,232.01,232.62,229.57,229.57,232.62,233.54,234.76,232.01,235.37,235.37,235.37,235.37,235.98,235.67,236.89,232.62,225.91,225.91,223.17,223.17,220.12,217.38,218.29,217.99,217.99,210.37,209.76,211.59,213.72,214.02,215.24,214.33,214.02,214.63,214.02,216.77,213.72,215.55,212.8,213.11,217.99,214.63,215.24,214.02,215.24,214.94,214.02,213.11,215.24,217.68,217.38,215.55,214.02,217.07,228.35,229.57,228.05,224.7,220.43,220.43,217.38,226.83,231.1,230.49,232.62,235.98,235.98,238.41,234.45,234.15,234.76,236.59,237.2,237.8,235.06,238.11,242.07,243.6,245.43,244.51,244.82,240.24,238.72,238.72,238.72,239.94,235.98,234.45,238.72,237.8,240.55,240.55,237.5,235.67,236.28,234.76,232.62,233.23,230.49,228.96,225.61,225.61,217.38,223.48,223.48,223.48,223.48,223.48,225.61,222.56,222.56,222.56,229.88,228.35,224.7,224.7,228.05,228.66,226.52,226.52,226.52,226.52,217.99,219.21,219.21,219.21,218.6,222.26,222.26,213.72,211.89,211.89,211.89,213.41,214.02,214.02,214.63,214.63,215.55,213.11,214.33,214.94,212.8,212.8,212.5,214.02,213.11,212.2,210.67,211.28,210.98,208.84,207.32,206.71,207.01,204.27,209.45,205.79,203.05,203.35,205.18,205.49,206.4,204.27,202.13,201.52,198.17,197.56,205.49,205.18,205.79,207.01,207.01,202.74,202.74,200.3,200.3,197.87,202.74,202.13,206.1,207.62,205.79,207.32,207.01,202.74,202.44,200.91,202.74,206.4,205.49,205.49,203.35,203.66,203.66,199.7,199.09,198.78,194.51,189.33,188.72,185.06,185.67,182.32,178.96,178.35,175.61,175,178.05,179.27,181.1,176.83,173.78,171.34,174.09,174.39,171.95,177.44,178.96,179.27,177.13,176.83,175.3,182.93,188.72,185.67,184.45,188.41,186.89,186.28,188.11,188.41,188.72,187.2,186.89,188.11,186.89,187.5,187.5,185.37,182.93,180.18,182.62,183.54,183.54,185.98,184.15,187.5,185.67,182.93,180.18,179.88,182.01,182.93,178.66,179.27,182.01,178.05,175.3,174.09,174.09,170.73,169.51,169.51,169.51,177.13,173.17,170.73,171.34,171.95,170.12,168.6,165.85,166.16,164.33,165.24,161.28,160.37,161.89,161.89,168.29,170.73,171.65,171.34,171.34,168.9,170.12,168.29,171.65,172.56,172.26,170.12,169.21,170.43,175.3,175.91,181.1,181.4,174.7,181.1,182.93,181.71,180.49,181.1,183.54,188.41,189.02,184.15,191.77,188.72,190.24,191.16,187.2,188.41,187.2,184.76,185.98,187.2,185.98,183.23,184.76,189.63,190.85,184.15,183.84,180.49,179.57,180.49,184.15,181.4,182.01,184.45,180.79,181.4,181.4,178.66,176.83,180.18,177.13,176.52,177.13,172.56,168.6,168.6,169.21,168.9,176.22,177.44,179.88,185.06,184.15,184.45,184.45,185.37,186.28,185.98,184.15,187.5,188.41,188.41,188.41,192.99,194.51,196.95,192.99,187.2,185.98,193.6,193.6,187.8,189.02,192.38,192.99,191.77,191.77,192.68,189.63,194.21,190.85,191.16,189.33,186.28,189.02,186.89,184.45,184.76,184.76,185.37,184.45,187.5,185.06,183.84,183.23,181.4,182.93,179.88,182.32,182.62,186.89,183.54,183.84,186.28,189.94,192.07,189.33,191.77,191.16,192.68,195.12,192.38,193.9,194.82,189.94,198.17,200.3,200.91,201.22,201.52,198.48,199.09,200,199.7,199.09,200.3,198.78,193.9,195.43,196.95,199.7,199.7,200.3,199.39,198.48,198.48,200.91,199.09,196.95,195.73,195.43,196.65,199.39,198.17,201.83,208.54,208.84,208.54,208.84,209.76,214.33,214.33,220.43,217.68,216.16,220.12,218.6,218.6,216.46,216.16,219.51,216.46,219.51,219.21,217.99,218.9,217.07,217.68,214.94,217.38,218.29,220.73,221.34,221.65,220.73,220.12,222.56,222.56,219.51,218.29,213.11,211.89,217.99,219.21,219.21,223.78,223.48,219.51,218.6,216.46,214.33,214.63,213.41,212.8,218.6,215.24,212.8,216.77,213.11,209.76,208.23,208.84,206.1,210.06,207.32,205.79,205.18,205.18,204.27,203.35,202.13,203.05,203.05,204.57,207.93,204.57,203.66,203.66,204.57,203.96,216.46,217.07,215.55,213.41,214.63,214.33,215.85,214.94,216.16,218.6,219.51,214.02,212.8,212.2,210.06,209.76,211.59,209.15,208.54,208.54,208.54,208.54,208.54,205.79,203.35,201.22,201.22,202.44,207.93,210.06,207.32,205.18,211.59,214.94,211.89,209.76,208.54,208.84,207.32,203.35,205.18,205.18,203.96,209.15,212.5,212.2,216.16,216.16,213.11,214.33,214.94,214.63,215.85,220.12,221.95,221.04,221.65,221.95,221.95,220.73,218.6,217.38,221.65,221.65,221.95,219.51,221.34,217.07,218.6,217.99,221.34,222.56,224.09,221.95,222.87,223.48,222.26,223.78,228.05,228.66,231.4,231.4,233.54,237.8,239.33,239.33,242.68,234.76,233.54,233.54,233.23,227.74,224.39,223.17,222.87,225.3,221.34,216.46,218.6,227.74,228.96,229.27,225.61,225.91,223.78,226.83,226.52,221.65,224.39,229.27,226.52,226.83,228.66,225.91,225.91,225.91,229.27,225.61,223.17,221.95,225,223.48,222.56,222.87,222.26,221.95,222.26,223.17,223.78,223.78,228.35,224.7,222.26,220.12,223.48,220.73,223.48,225.91,226.52,220.43,221.95,221.95,234.45,241.77,240.55,238.41,243.6,243.29,246.34,251.22,250,259.15,256.4,260.06,257.62,257.62,254.88,254.88,256.4,255.18,250.61,243.9,240.55,242.68,236.59,232.01,230.18,239.63,232.62,233.84,233.84,236.28,236.28,237.8,236.59,236.59,247.87,247.87,242.99,241.46,239.02,238.72,238.72,238.41,235.98,240.55,239.02,236.89,238.72,231.4,235.37,236.59,229.27,224.09,224.09,230.79,229.57,235.98,235.98,235.67,230.79,229.27,233.23,239.63,242.68,238.11,243.29,247.56,248.78,243.9,245.73,246.34,247.87,248.78,248.48,249.39,249.39,249.39,257.93,265.55,266.46,267.68,267.68,267.07,257.32,264.33,267.38,264.33,264.94,257.32,253.05,255.79,250,245.12,246.65,247.56,246.95,255.79,253.35,242.68,217.68,221.04,227.74,223.78,227.74,230.18,232.01,235.37,235.37,244.51,238.72,240.55,238.72,238.72,236.89,232.01,231.1,232.93,225.61,226.52,226.83,221.04,213.41,210.37,210.06,205.79,201.83,197.87,202.13,196.34,196.34,196.34,196.34,192.38,192.07,190.85,192.68,189.63,197.26,195.73,187.5,187.5,186.89,186.89,184.76,185.98,183.84,183.84,179.57,180.79,180.79,185.98,181.4,182.01,180.49,179.88,175.91,180.18,172.56,170.43,177.13,181.71,180.18,180.49,177.74,178.96,175.61,174.7,174.7,173.78,167.68,161.59,154.27,152.13,163.11,172.87,171.65,168.6,171.95,170.73,176.52,177.74,171.65,169.21,165.24,163.41,163.41,161.89,163.72,164.94,162.8,164.63,164.63,170.43,171.04,169.51,165.24,167.38,161.89,161.59,163.11,165.85,165.85,163.41,163.72,162.2,162.2,162.8,165.85,170.43,168.9,174.7,171.04,168.6,164.94,164.33,163.72,165.55,163.72,162.8,163.11,165.55,163.72,163.72,163.72,163.72,163.72,163.72,159.76,155.49,160.67,161.28,164.63,163.72,169.51,169.82,170.12,170.12,170.73,170.73,173.48,178.96,178.05,177.44,174.7,174.39,172.56,171.65,166.16,166.16,166.16,164.63,165.55,163.72,163.72,163.41,167.38,166.77,166.77,175.61,175.61,178.35,183.54,188.11,184.45,182.32,187.2,188.41,183.54,176.22,179.27,179.27,175.61,171.04,162.2,163.11,161.59,171.95,168.29,171.34,172.56,166.77,167.99,168.6,168.9,167.68,169.82,169.82,169.82,170.12,170.12,169.21,169.21,165.55,165.55,165.55,166.46,166.46,167.07,175.61,173.48,175,174.7,173.17,170.12,170.43,169.82,166.77,165.24,166.77,164.33,170.43,171.04,171.34,173.17,173.17,176.22,180.18,180.18,182.32,180.49,182.62,181.4,177.74,174.39,177.13,182.32,180.49,181.4,176.83,184.45,186.89,183.54,185.37,182.32,183.54,185.37,194.51,192.99,188.11,187.2,184.15,185.98,190.85,190.55,194.21,197.26,203.35,204.57,206.71,201.22,202.44,201.22,200.91,214.63,215.24,221.34,217.68,210.06,212.5,213.11,209.76,214.94,218.9,216.46,216.77,219.21,218.29,218.29,213.41,213.41,214.94,215.24,217.68,217.99,214.33,215.24,212.2,212.5,206.1,210.67,212.8,213.72,211.89,213.72,217.99,221.34,223.78,229.88,233.23,242.07,238.41,244.82,244.82,254.57,258.23,260.37,262.5,253.96,256.71,255.79,262.2,273.63,273.63,273.63,273.63,273.63,273.63,287.8,284.45,279.27,289.63,297.87,298.48,299.09,297.26,300.61,294.21,301.22,310.98,303.35,306.4,317.38,327.74,338.72,319.82,306.71,302.44,298.48,306.71,315.55,314.33,313.41,296.34,306.71,298.17,294.21,306.71,289.02,294.82,302.74,313.41,315.55,306.4,307.32,315.24,318.6,320.43,330.49,333.84,330.49,329.27,327.13,332.01,319.51,313.41,328.96,328.05,324.09,336.89,339.94,338.72,338.72,356.71,364.33,365.55,365.55,391.77,421.04,423.48,429.88,423.17,423.78,423.17,419.51,427.74,438.72,453.96,455.18,442.68,455.79,464.33,463.72,463.72,486.28,495.12,489.94,489.33,458.54,510.67,515.55,485.67,483.54,507.32,505.49,511.59,544.51,552.44,552.44,552.44,552.44,579.27,579.57,588.41,609.76,620.43,664.63,660.06,660.06,594.82,525,584.15,573.78,528.96,572.87,579.27,572.87,559.45,575.3,591.16,635.67,611.28,607.93,567.99,578.35,576.22,549.09,549.09,537.5,509.76,578.2,543.9,567.68,588.72,599.09,641.77,621.95,628.05,612.8,629.57,643.29,663.11,658.54,653.96,667.68,663.11,684.45,669.21,684.45,676.83,689.02,672.26,672.26,708.84,708.84,810.98,827.74,818.6,870.43,850.61,865.85,902.44,824.7,856.71,839.94,841.46,913.11,891.77,891.77,911.59,935.98,913.11,966.46,1064.02,1099.09,1099.09,1071.65,1003.05,900.91,981.71,922.26,911.59,983.23,1027.44,1045.73,1056.4,1105.18,1079.27,1077.74,945.12,1038.11,1092.99,1035.06,984.76,1018.29,958.84,871.95,943.6,969.51,902.44,846.04,847.56,868.9,775.91,801.83,852.13,777.44,777.44,743.9,789.63,794.21,823.17,760.67,774.39,670.73,635.67,631.1,800.3,730.18,731.71,750,702.74,704.27,701.22,730.18,778.96,817.07,836.89,836.89,818.6,754.57,826.22,858.23,783.54,783.54,797.26,814.02],"어플라이드 머티어리얼즈":[null,100,99.8,99.3,100.8,99.9,99.9,99.77,99.53,99.13,96.04,98.47,97.77,97.94,100.33,100,100.83,101.13,101.73,100.8,98.7,97.67,98.64,98.97,98.44,100.33,99.57,98.54,99.63,99.47,99,97.77,95.31,95.31,92.71,93.41,92.51,93.24,94.24,94.44,94.61,97,96.04,96.01,96.04,95.37,96.77,96.17,95.14,94.08,93.91,97.6,98.2,96.94,93.78,95.91,96.47,98.54,99.9,102.26,102.3,104.33,105.39,106.09,106.09,106.09,105.96,107.02,107.15,100.17,104.63,104.93,105.19,108.19,108.85,107.65,106.49,106.59,106.96,110.02,108.19,107.95,108.52,108.42,109.85,109.48,109.48,110.92,109.48,108.69,107.39,107.39,106.29,107.29,106.82,106.62,109.08,110.25,111.38,110.85,112.45,112.45,110.82,112.11,112.31,112.61,112.31,113.24,114.54,113.08,116.61,114.28,113.98,116.57,116.27,117.5,117.07,118.27,118.47,117.84,117.54,118,117.24,118.1,117.07,118.7,118.7,121.73,121.5,120.33,120.8,121.23,120.53,122.63,121.43,122.7,122.66,123.03,123.76,124.39,126.86,127.92,127.35,129.52,129.95,130.72,131.68,128.39,129.18,129.28,129.68,129.32,129.18,129.35,129.42,129.45,129.42,129.78,127.72,128.39,129.55,129.32,127.12,125.69,124.86,124.86,126.52,126.62,130.62,132.75,132.41,134.58,135.74,135.47,137.54,135.14,138.77,138.8,138.27,138.5,139.2,138.24,139.9,142.66,144.69,144.56,147.49,149.98,142.3,146.12,146.69,148.85,149.45,148.52,149.82,151.41,151.41,151.61,152.68,153.08,155.74,155.47,154.98,157.27,157.84,148.89,147.55,149.25,146.36,143.63,143.46,147.39,144.29,145.16,144.23,146.72,143.93,139.4,142.06,137.9,137.47,136.47,136.47,140.17,140.13,144.89,147.12,151.08,150.68,150.75,153.48,153.58,155.14,157,157.24,155.77,155.67,154.41,157.9,153.21,150.58,147.45,146.76,142.2,142.1,142.5,146.29,146.09,145.79,139.87,143.36,145.69,146.02,147.95,143.49,147.42,144.13,147.92,146.49,145.49,144.13,145.19,146.49,151.31,150.15,150.08,150.08,148.02,148.85,150.48,147.59,151.68,151.91,153.48,156.57,156.87,159.9,160.6,157.34,156.91,158.97,154.18,152.81,162.53,168.45,173.34,173.31,172.51,171.71,171.15,174.38,175.34,175.01,177.14,177.4,179.5,183.16,183.46,184.16,184.13,186.66,187.59,187.62,184.03,186.12,188.65,186.02,187.79,185.39,187.22,188.19,187.45,187.92,189.42,184.63,187.55,189.78,187.75,185.59,192.48,187.99,191.75,195.67,191.95,191.95,192.71,189.48,190.78,176.07,175.61,172.75,165.62,166.66,169.75,174.04,171.15,171.78,167.95,168.92,170.75,174.84,177.7,176.24,177.34,172.68,173.24,173.24,169.88,171.98,172.11,170.12,176.51,179.63,180.67,181.7,186.09,182.56,177.37,177.04,177.87,177.87,181.36,190.82,191.01,191.01,191.21,192.31,189.28,185.56,190.08,184.13,177.64,178.47,177.3,168.65,160.77,167.22,162.03,152.25,160,164.73,164.89,172.91,179.67,183.13,183.13,188.55,186.79,186.59,189.72,195.71,191.81,191.65,189.92,193.11,191.78,199.63,197.74,197.57,205.02,202.9,198.64,200.43,200.6,197.8,194.68,197.1,202.26,196.21,184.29,194.58,184.49,179.9,185.06,185.06,176.01,179.63,184.89,180.67,174.18,176.44,182.36,182.86,187.79,186.59,189.25,192.55,182.13,170.35,170.02,166.99,162.13,163.53,168.02,164.39,165.29,169.42,168.15,168.75,174.91,175.01,177.87,180.13,184.79,182.5,183.89,180,183.59,179.57,164.76,166.39,167.22,167.52,168.95,169.22,169.22,173.11,171.68,168.99,173.84,174.01,176.07,174.81,170.55,170.22,166.02,169.25,169.65,165.36,164.09,160.8,161.56,161.66,163.03,159.6,155.44,155.31,150.58,150.72,153.71,152.01,149.08,149.08,151.21,153.51,154.81,155.54,150.42,152.01,153.51,154.11,157.4,160.67,155.31,155.61,154.51,152.78,152.95,156.97,160.73,159.43,161.83,159.63,160.1,162.53,164.66,165.16,166.99,163.59,160.17,160.57,161,158.1,157.84,145.66,144.86,145.62,143.06,142.4,142.2,145.59,144.43,143.43,143.56,143.16,143.16,141.83,141.43,134.01,132.61,131.78,130.38,127.75,129.42,130.12,128.79,130.42,129.92,131.08,131.88,130.12,128.39,127.32,127.62,128.62,127.59,129.45,129.52,126.09,123.93,121.76,118.87,114.58,109.12,112.11,111.25,115.67,116.34,112.88,114.11,111.58,111.55,105.86,108.62,107.69,103.56,107.89,109.42,117.64,117.37,114.21,116.04,117.3,116.27,114.08,108.55,111.45,111.75,116.54,117.8,114.54,119.03,117.1,117.1,116.64,119.83,119.8,123.49,121.6,124.06,127.59,117.9,117.9,115.44,111.95,113.71,113.21,113.81,112.18,108.65,108.72,110.75,104.93,102.83,100.87,96.47,96.47,101.96,104.99,107.75,108.95,111.41,104.96,112.15,114.14,109.52,114.14,115.67,115.74,112.68,112.31,111.95,114.94,118.84,118.84,114.61,114.18,125.86,130.42,128.79,127.12,131.78,130.05,130.82,129.45,130.18,134.04,132.85,132.38,132.78,135.41,135.94,135.47,130.12,130.12,130.78,129.78,129.22,131.21,131.98,131.71,129.05,127.59,128.32,130.05,129.55,126.69,125.02,125.59,128.15,128.82,128.45,129.55,134.41,133.11,134.34,131.68,137.54,132.65,131.11,131.88,129.55,128.15,131.98,136.87,136.41,141.2,141.83,143.23,142.83,139.8,140.33,141.33,143.06,142.13,145.49,146.06,146.26,146.26,145.72,145.86,147.95,147.92,148.62,147.22,146.66,144.36,145.42,146.29,143.46,139.93,138.37,136.24,135.77,130.08,133.14,138.1,138.64,142.1,134.28,137.34,134.74,132.91,131.45,131.45,129.82,131.01,132.28,128.75,129.05,134.51,135.07,137.7,138.14,143.56,145.59,138.1,138.6,137.2,134.78,140.8,141.53,143.79,142.96,140.87,139.7,145.02,148.72,149.45,152.01,148.62,148.65,148.65,146.36,144.59,146.32,148.82,150.68,154.78,154.01,153.11,153.81,160.3,159.1,168.82,169.82,173.51,169.12,168.85,168.62,168.82,164.29,161.3,158.24,151.28,154.18,155.34,159.27,156.91,154.61,159.93,155.44,156.94,155.17,156.74,155.51,155.84,156.51,150.15,151.78,151.45,152.75,157.44,159.8,159.8,158.44,164.76,167.55,166.72,168.59,167.02,171.58,170.55,170.88,169.45,170.38,173.34,171.98,169.58,172.25,170.25,172.81,173.54,164.49,166.06,166.46,164.59,165.19,169.32,168.55,164.09,169.18,169.75,172.21,172.85,176.07,171.58,173.51,171.98,175.17,172.98,168.15,183.26,185.42,189.52,184.76,183.73,180.57,184.56,185.49,185.96,185.76,186.16,186.46,188.32,187.75,190.08,189.55,206.52,207.49,202.8,198.5,187.82,186.16,193.94,191.58,193.98,193.98,192.68,188.69,184.16,186.66,185.82,188.35,188.35,188.42,196.47,200.87,199.23,199.53,202.3,200.93,201.9,205.69,203.26,204.66,204.66,204.03,203.56,202.76,203.13,206.99,203.69,199.3,205.06,204.93,206.22,204.56,205.69,207.49,206.09,210.35,209.15,209.15,210.32,212.61,212.61,206.32,196.51,200.3,199.07,200.5,192.98,198.74,209.68,212.31,210.28,205.36,209.38,214.48,217.54,224.19,222.46,222.46,216.84,224.33,220.97,213.88,203.26,195.87,199.03,189.68,193.41,200.2,193.14,201.4,196.77,192.31,173.28,186.92,174.68,150.12,169.35,134.88,149.28,130.38,133.74,126.42,133.68,150.22,148.85,163.73,149.92,157.4,152.48,144.09,143.89,140.7,153.58,158.27,171.25,165.02,165.02,165.99,174.61,167.62,173.81,177.04,168.49,160.83,173.41,169.38,172.18,169.82,167.79,180.83,165.32,156.04,158.34,162.56,168.05,170.55,179.07,179.73,174.14,171.35,181.13,173.18,180.9,184.59,189.28,183.09,181,181,183.49,187.69,181.93,186.96,185.32,185.66,192.38,193.44,200.3,199.33,198.97,199.2,184.39,188.19,189.85,194.81,199.67,200.93,202.83,203.89,202.46,199.57,199.6,194.28,196.54,201.16,198.6,203,203,211.18,206.92,208.89,211.28,208.29,204.69,208.12,206.66,207.45,207.32,212.08,212.35,213.71,211.75,201.73,209.68,207.32,210.48,214.38,214.08,216.34,215.81,215.87,211.68,211.55,217.1,214.51,221.3,216.54,225.02,222.76,221.06,219.2,212.28,207.22,212.11,213.14,212.18,206.42,209.88,204.99,205.96,216.57,204.53,202.86,202.86,185.12,183.69,183.43,183.03,187.89,190.35,187.92,187.49,186.86,190.75,192.65,190.52,192.31,193.78,197.54,198.5,197.84,201.83,193.71,201.66,201,203.39,208.32,210.62,215.24,215.27,212.91,211.35,209.65,206.49,207.19,206.69,205.32,202.83,198.04,195.77,190.75,198,197.1,200.77,205.76,215.84,232.78,234.71,237.27,230.92,236.81,232.28,242.3,247.85,247.49,251.95,257.07,255.31,267.89,276.04,270.02,270.02,275.07,274.48,280.43,283.83,286.52,295.64,296.64,298.67,292.25,292.48,293.84,294.51,294.41,294.68,291.18,286.49,287.55,284.99,279.63,283.96,283.96,282.43,280.43,289.45,287.19,289.08,298.17,302.26,314.68,318,325.99,332.81,326.29,352.08,343.23,343.23,363.46,358.87,359.3,353.84,359.8,351.18,328.05,336.61,321.73,336.81,344.73,332.35,343.56,335.14,353.38,350.68,352.35,376.04,388.35,388.35,393.84,385.06,377.47,397.54,383.46,386.49,408.69,379.13,393.31,406.82,391.01,384.16,360.2,377.54,351.68,380.1,374.98,389.98,380.33,382.3,394.34,399,380.3,382.23,397.1,387.29,403,398.4,428.09,418.34,421.83,444.59,470.95,470.95,476.04,464.36,463.03,463.73,462.26,449.25,449.58,446.39,447.29,445.02,435.57,427.92,449.42,438.44,448.79,456.91,455.17,451.55,450.55,441.63,442.1,428.35,433.58,438.37,442.43,414.94,411.15,382.3,399.07,415.41,411.21,405.36,415.31,433.64,428.15,447.85,457.57,455.57,458.64,459.67,459.67,459.93,462.6,453.84,465.39,462.46,452.11,448.09,456.44,455.31,462.66,461.36,455.84,456.97,436.71,442.76,444.06,450.92,460.1,453.21,469.18,472.28,473.88,459.07,459.77,459.77,455.17,448.82,441.03,448.92,455.24,453.54,451.41,443.26,426.56,428.02,439.17,459.23,456.51,460.67,460.83,448.92,456.61,457.57,465.66,472.58,473.08,475.07,473.44,474.71,472.55,459.43,448.65,430.02,432.28,438.24,428.62,423.86,429.95,423.29,437.57,437.4,442,440.9,454.41,452.75,449.68,444.13,447.42,452.01,452.01,454.21,444.46,449.25,455.37,464.03,466.36,469.98,479.5,468.55,451.01,449.85,459.57,469.58,472.28,475.01,442.23,426.86,428.39,429.72,416.64,426.19,421.03,425.56,420.03,424.29,421.83,426.66,439.5,437.9,443.53,447.92,445.86,443.73,452.35,451.78,439.27,439.8,452.65,454.74,464.26,469.92,475.04,499.6,510.12,509.02,520.1,500.5,512.15,521.86,520.03,525.32,519.07,528.25,499.27,491.01,495.57,495.87,495.87,476.84,503.23,489.82,504.73,487.49,485.29,490.45,522.1,523.43,507.99,508.25,489.52,491.61,511.35,488.19,486.36,482.56,503.89,506.89,517.44,517.44,541.5,531.25,535.71,525.72,523.66,532.21,526.99,511.61,520.27,501.86,497.8,507.32,530.95,523.06,555.74,555.74,507.02,476.11,463.06,449.45,463.53,442.56,451.18,433.11,440.77,459.83,461.26,468.42,454.28,451.15,453.01,461.73,479.87,465.12,440.9,438.8,465.36,469.08,454.14,443.76,443.76,433.48,425.49,443.99,451.65,446.59,431.31,443.19,434.74,418.44,396.74,413.14,428.02,415.87,411.45,399.77,414.01,434.21,439.23,449.72,446.59,450.85,437.34,461.2,456.11,458.1,470.68,451.91,438.6,423.99,430.75,405.02,397.1,407.32,399.2,386.82,381.23,388.89,377.24,377.24,382.26,389.55,392.31,384.99,375.37,380.93,362.46,362.1,381.46,367.22,375.94,378.7,395.37,377.6,374.38,351.91,356.67,345.82,355.27,372.25,367.65,388.82,370.52,368.52,354.28,365.82,354.71,361.16,382.93,397.6,397.6,390.32,380.9,390.45,382.56,382.7,384.93,374.24,356.87,339.03,320.53,321.53,324.19,298.14,298.94,298.94,316.71,312.61,310.42,323.99,324.83,316.21,305.96,302.76,287.09,287.09,286.19,288.05,302,303.46,294.91,295.27,296.44,305.06,314.38,309.95,326.89,340.2,345.56,338.34,336.11,329.15,344.29,349.95,352.68,354.08,349.38,362.76,369.58,364.79,358.84,331.65,349.58,351.18,367.32,365.32,361.03,352.75,360.3,348.19,335.47,339.2,337.7,349.42,328.79,321.26,314.54,313.04,305.52,303.63,303.63,300.47,305.96,312.11,321.16,320.47,300.8,301.63,295.91,295.74,298.57,293.24,289.82,283,280.5,276.01,280.03,286.19,280.93,272.65,287.02,297.54,296.91,293.24,274.88,263.53,253.91,252.95,264.29,248.99,247.62,250.35,257.1,261.76,274.28,282.66,291.28,293.31,287.99,298.57,293.81,298.8,292.05,287.19,305.16,316.27,324.33,314.08,348.72,367.82,358.1,367.59,346.82,347.59,348.42,349.88,356.21,358.3,358.3,352.15,344.33,343.59,364.73,356.11,355.11,354.18,348.45,353.11,361.43,357.2,363.96,372.28,364.86,347.95,348.52,346.06,344.43,352.41,324.79,323.53,323.53,317.27,313.58,323.26,324.06,324.06,321.9,330.48,325.86,346.99,354.38,359.53,366.26,366.72,365.96,365.96,364.09,365.06,353.28,364.89,379.9,376.01,379.2,384.63,374.38,360.07,371.01,396.04,413.51,399.27,391.65,401.06,385.86,386.29,381.93,387.79,394.14,397.54,383.99,384.16,384.16,370.32,367.42,375.74,370.42,372.95,386.52,390.22,394.18,395.87,394.48,387.25,394.84,389.48,380.67,385.49,400.47,394.28,408.75,407.99,412.78,400.67,395.54,408.59,397.77,395.57,387.35,398.84,406.36,408.75,407.05,399.73,390.42,380.87,380.87,387.69,387.29,376.57,377.6,375.71,372.01,370.28,367.19,380.67,377.57,378.07,368.09,367.09,371.65,376.14,375.87,373.24,377.01,374.21,386.22,385.19,378.84,384.06,384.23,386.32,403.03,402.4,418.3,432.35,422.46,421.13,414.28,405.09,434.18,452.78,452.78,454.48,443.59,448.69,448.02,445.02,445.72,449.28,453.24,452.98,465.92,471.85,469.78,466.26,462.33,462.33,460.97,454.81,462.3,452.81,465.22,487.69,479.3,479.97,481,484.09,484.09,473.41,467.15,464.46,467.75,457.77,462.2,474.71,475.01,484.19,480.9,471.81,446.06,453.91,460.4,466.09,462.63,486.32,505.59,504.46,507.92,490.28,491.88,484.73,500.43,492.55,483.06,481.23,462,472.18,466.16,460.07,457.87,474.74,495.07,492.01,492.51,474.28,480.4,483.93,499.1,502.33,508.35,512.45,512.45,511.18,509.75,493.28,490.95,488.22,479.1,481.13,481.1,460.07,466.79,458.27,455.81,449.88,453.14,454.54,446.19,449.45,459.97,460.73,464.26,454.98,463.56,463.49,466.86,466.39,470.55,473.14,482.53,469.68,469.22,474.94,470.72,447.35,446.32,446.69,448.92,432.98,435.41,436.94,436.04,440.43,450.22,460.93,465.06,467.09,471.68,479.97,476.44,501.43,498.3,512.75,517.04,515.17,494.48,507.72,496.67,497.44,497.44,500.3,501.86,492.71,497.04,498.44,504.46,493.41,486.36,481.53,493.81,491.58,516.27,523.19,522.43,538.24,538.94,533.64,540.2,522.2,537.07,539.27,539.27,546.69,546.46,542.83,539.33,513.71,503.99,496.87,495.84,504.36,502.6,498.54,505.66,503.33,503.33,511.68,510.38,533.58,558.87,560.07,555.91,579.5,574.48,555.41,560.67,553.21,546.76,555.64,559.67,569.35,561.4,568.72,578.67,618.44,617.44,600.03,619.6,624.49,664.13,664.13,629.42,633.38,664.66,656.11,677.37,675.07,657.37,670.95,699.67,697.14,690.15,706.06,707.52,684.06,670.12,682,667.42,668.05,661.06,667.99,670.02,682.4,701.5,699.67,693.71,687.75,692.18,686.29,686.29,694.48,685.89,690.12,676.84,691.68,695.64,700.2,696.34,708.75,691.71,684.46,697.1,665.19,646.66,631.51,630.48,643.06,652.45,657.24,676.81,683.06,661.06,645.56,658.6,679.17,695.04,689.92,690.05,686.62,697.94,687.62,698.24,723.76,712.25,705.76,731.95,731.45,725.96,725.29,735.07,735.07,736.51,728.95,720.6,715.74,712.85,706.22,743.33,737.94,737.87,759.27,765.29,790.85,790.52,788.79,808.19,824.73,824.73,798.64,783.39,764.86,779.6,772.61,773.81,785.32,790.05,801.53,809.68,809.68,807.29,819.6,836.84,848.49,802.86,809.98,817.14,818.1,732.35,724.29,699.7,743.66,730.95,687.29,673.28,687.09,684.09,654.71,706.16,653.24,605.02,605.29,610.02,594.04,634.11,636.21,642.56,668.22,670.98,704.93,691.85,701.96,686.06,695.91,666.22,674.44,653.01,651.48,641.9,642.2,656.44,656.44,610.22,606.92,599.8,581.53,590.85,592.51,618.77,609.68,627.19,624.23,627.59,619.43,654.61,639.47,645.72,654.84,656.61,697.54,681.93,672.38,656.24,669.38,664.19,672.11,665.99,668.49,682.4,678.74,682.4,711.78,635.67,614.28,609.78,620.17,613.84,608.99,607.99,611.48,620.7,616.77,632.68,616.64,604.26,610.25,605.06,620.57,624.03,645.89,639.03,627.49,621,608.29,618.97,562,568.15,563.43,567.35,584.86,581.96,580.87,576.37,570.12,570.12,581.4,609.88,609.52,602.86,572.48,575.77,571.91,559.63,569.48,562.66,563.56,563.76,566.86,550.58,537.24,544.39,557.27,560.3,560.3,557.57,555.17,544.56,541.2,545.32,565.92,590.62,591.75,588.99,588.99,571.21,568.59,577.87,593.61,620.57,639.1,639.1,641.83,650.62,634.61,621.46,580.93,575.21,583.29,604.73,600.17,595.01,594.21,601.23,608.32,599,611.18,609.65,601.96,613.21,563.06,563.06,572.38,579.23,585.72,572.31,560.97,550.88,560.77,521.26,526.02,506.26,508.72,516.87,504.29,518.07,499.13,489.15,496.04,499,518,517.34,510.85,514.01,513.74,506.22,515.64,511.28,501.43,491.45,482.73,482.93,484.73,491.68,450.95,422.46,442.1,429.15,498.27,460.03,482.33,480.97,484.03,459.87,457.44,457.44,451.11,460.23,477.8,499.73,504.33,501.8,497.67,501.53,495.71,516.14,514.51,509.25,518.5,519.13,517.84,559.03,575.81,579.5,581.53,550.98,552.21,551.51,539.87,534.18,524.16,524.16,538.54,537.74,530.72,521.63,523.36,538.24,538.87,546.39,554.88,565.02,578.27,575.01,582.36,567.69,587.52,579.33,575.17,575.17,563.93,572.25,599.6,609.22,610.72,609.68,609.22,611.51,632.31,635.77,635.77,634.88,648.89,650.22,659,658.67,655.91,663.19,648.29,640.67,633.74,640.97,622.76,622.33,626.02,617.94,633.18,626.99,630.25,599.2,598.97,608.39,596.17,592.81,609.48,615.21,613.58,627.12,632.38,626.42,538.3,544.19,539.83,535.64,531.91,540.73,539.07,547.45,547.05,549.98,534.98,534.98,524.36,519.97,526.59,541.6,539.27,544.09,543.83,566.22,558.4,568.82,577.5,592.78,631.48,632.61,667.29,668.45,670.35,664.23,678.6,682.03,681.33,724.59,744.06,723.89,745.12,704.03,723.83,733.11,698.67,730.38,726.09,757.34,757.8,748.72,759.17,752.08,733.98,760.3,761.23,769.82,757.54,784.53,773.88,775.71,791.05,766.02,801.63,777.14,765.62,782.3,760.97,767.82,742.86,752.11,761.1,749.15,782.46,732.88,745.46,768.42,806.86,831.85,831.85,839.43,847.75,882.96,893.94,896.64,891.85,892.38,888.99,915.64,898.87,862.6,869.45,861.36,826.19,843.59,853.28,861.93,865.99,867.82,867.82,871.55,875.37,865.12,855.21,894.74,946.16,985.06,972.38,937.24,1002.26,1022.43,1014.54,1004.63,1061.83,1088.22,1088.22,1059,1082.33,1060.87,1072.81,1063.09,1107.19,1120.63,1135.91,1072.61,1092.85,1060.47,990.35,1011.61,1073.24,1100.07,1095.07,1131.05,1092.81,1181.06,1181.06,1195.11,1228.95,1230.72,1249.18,1243.09,1257.67,1314.31,1250.32,1238.94,1238.54,1169.12,1190.55,1153.18,1080.67,1127.92,1151.02,1168.29,1122.36,1136.54,1152.01,1172.91,1162.96,1188.72,1188.22,1203.96,1244.56,1229.08,1126.62,1122.03,1075.27,1137.4,1177.37,1159.63,1159.63,1173.44,1179.07,1283.59,1323.83,1329.42,1316.91,1316.61,1312.01,1297.5,1320.93,1303.23,1312.25,1342.7,1344.13,1387.82,1347.29,1268.25,1273.18,1312.78,1294.78,1302.43,1367.12,1426.36,1366.52,1449.05,1476.27,1434.94,1452.95,1466.09,1452.98,1376.27,1354.11,1420.47,1422.16,1438.14,1438.14,1513.78,1491.68,1496.44,1497.7,1524.69,1630.78,1666.46,1669.55,1507.52,1637.84,1661.26,1653.94,1839.07,1887.69,1949.35,1890.95,1973.11,2053.61,2053.61,2130.38,1949.68,1959.97,2222.96,2085.99,2311.61,2405.99,2166.09,2006.79,2006.79,1972.68,1845.26,1898.5,1958.94,2004.99,1914.78,1982.36,1928.22,1866.66,1762.6,1749.42,1878.7,1843.33,1872.88,1784.53,1720.1,1585.56,1452.41,1669.78,1689.42,1724.49,1819.03,1777.84,1755.34,1794.14,1737.5,1749.12,1824.13,1778.84,1687.79,1781.4,1711.58,1651.15,1651.28,1638.34,1611.28,1597.47,1596.54,1596.54],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1868.42]},"symbols":{"EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","브로드컴":"AVGO","삼성전자":"005930.KS","어플라이드 머티어리얼즈":"AMAT","팔란티어 테크":"PLTR"},"missing":[]}
};
