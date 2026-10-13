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
  "updatedAt": "2026-10-13T04:08:06.931Z",
  "checkedAt": "2026-10-13T04:08:06.931Z",
  "checkedCount": 34,
  "source": "live",
  "sourceNote": "미래에셋증권 홈페이지 ELS/DLS 캘린더 (청약 진행중)",
  "sourceNoteEn": "Mirae Asset Securities ELS/DLS calendar — currently on offer",
  "products": [
    {
      "code": "KR6MD00090W8",
      "name": "미래에셋증권(ELS)38184e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 23,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009109",
      "name": "미래에셋증권(ELS)38188e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "AMD"
      ],
      "couponRate": 22.3,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090Z1",
      "name": "미래에셋증권(ELS)38187e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 21,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 3,
          "barrier": 80
        },
        {
          "months": 6,
          "barrier": 80
        },
        {
          "months": 9,
          "barrier": 80
        },
        {
          "months": 12,
          "barrier": 80
        },
        {
          "months": 15,
          "barrier": 80
        },
        {
          "months": 18,
          "barrier": 80
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
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 75
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
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-80-80-80-80-75-75-70-65, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090Y4",
      "name": "미래에셋증권(ELS)38186e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "팔란티어 테크",
        "테슬라"
      ],
      "couponRate": 20.2,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090X6",
      "name": "미래에셋증권(ELS)38185e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "어플라이드 머티어리얼즈",
        "AMD"
      ],
      "couponRate": 18.7,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090R8",
      "name": "미래에셋증권(ELS)38180",
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090Q0",
      "name": "미래에셋증권(ELS)38179",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 16.4,
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
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090P2",
      "name": "미래에셋증권(ELS)38178",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 16.2,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090V0",
      "name": "미래에셋증권(ELS)38183e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 13.1,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090N7",
      "name": "미래에셋증권(ELS)38177",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 12.7,
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
      "knockIn": 20,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 20, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090M9",
      "name": "미래에셋증권(ELS)38176",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 12.5,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090L1",
      "name": "미래에셋증권(ELS)38175",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "HSCEI",
        "KOSPI200",
        "S&P500"
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
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090K3",
      "name": "미래에셋증권(ELS)38174",
      "type": "ELS",
      "shape": "월지급식",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 11.4,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65(월지급배리어:60), KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090H9",
      "name": "미래에셋증권(ELS)38172",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
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
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090J5",
      "name": "미래에셋증권(ELS)38173",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-90-90-85-80-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090T4",
      "name": "미래에셋증권(ELS)38182e",
      "type": "ELS",
      "shape": "스텝다운 노낙인",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
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
          "barrier": 80
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
          "barrier": 60
        }
      ],
      "knockIn": null,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-75-70-60, KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090G1",
      "name": "미래에셋증권(ELS)38171",
      "type": "ELS",
      "shape": "스텝다운 노낙인",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 10.4,
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
          "barrier": 75
        },
        {
          "months": 30,
          "barrier": 70
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-75-70-60, KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090F3",
      "name": "미래에셋증권(ELS)38170",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "KOSPI200"
      ],
      "couponRate": 9.6,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00090S6",
      "name": "미래에셋증권(ELS)38181e",
      "type": "ELS",
      "shape": "리자드",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "KOSPI200"
      ],
      "couponRate": 9,
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
          "lizard": 60,
          "lizardRate": 9
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-80(60)-75-70-65-60, KI -, 원화, 리자드 조건 충족 시 연 9%",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009117",
      "name": "미래에셋증권(ELB)4099",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 7.62,
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
      "offerStart": "2026-10-02",
      "offerEnd": "2026-10-14",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-80-80(월지급배리어:75), KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
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
    }
  ],
  "history": {"updatedAt":"2026-10-13T04:08:07.971Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20160919,20160920,20160921,20160922,20160923,20160926,20160927,20160928,20160929,20160930,20161003,20161004,20161005,20161006,20161007,20161010,20161011,20161012,20161013,20161014,20161017,20161018,20161019,20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827,20260828,20260831,20260901,20260902,20260903,20260904,20260907,20260908,20260909,20260910,20260911,20260914,20260915,20260916,20260917,20260918,20260921,20260922,20260923,20260924,20260925,20260928,20260929,20260930,20261001,20261002,20261005,20261006,20261007,20261008,20261009,20261012,20261013],"series":{"AMD":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,104.01,102.77,103.7,104.31,107.24,100.46,108.01,115.56,112.33,109.55,110.94,111.4,109.24,104.16,103.24,101.08,107.24,107.86,106.93,97.07,103.08,104.62,107.4,118.18,130.35,134.21,137.75,133.9,135.59,135.59,135.13,136.06,137.6,137.29,129.28,131.43,133.74,145.61,147.3,159.32,159.32,164.56,162.4,162.56,167.33,164.25,168.72,177.35,176.73,178.74,178.43,178.43,185.98,177.97,178.58,174.73,174.73,176.12,176.12,173.19,174.42,177.04,176.27,172.57,165.79,163.02,163.02,151.31,152.23,150.54,150.23,152.7,160.86,159.48,162.1,164.41,163.48,159.78,185.82,189.21,188.6,210.02,204.78,208.94,206.78,209.24,207.86,204.31,204.93,199.85,202.31,202.31,215.72,220.03,220.65,217.57,234.21,222.8,230.51,214.18,200.77,200.92,201.08,203.7,205.39,214.33,220.03,217.26,215.41,210.32,207.86,221.88,212.94,217.26,212.48,211.09,211.09,210.94,211.25,216.49,224.19,225.58,218.18,218.34,204.47,208.32,201.85,201.85,196.61,189.68,189.68,197.07,199.54,197.84,202,200.31,202.31,207.86,206.63,209.86,204.93,209.86,159.01,160.09,155.62,157.01,154.7,156.86,166.26,170.57,173.5,175.96,196.46,172.57,173.81,175.81,170.11,167.8,167.8,169.18,169.49,169.49,171.34,172.42,168.41,167.95,173.19,185.36,190.76,198.77,189.21,186.29,184.28,181.36,177.2,176.27,183.82,194.76,215.41,221.57,218.34,216.95,206.47,203.85,194.14,192.3,187.21,187.21,203.24,200.62,205.86,212.79,214.02,220.18,208.47,214.48,212.63,207.7,208.78,212.63,213.87,218.18,217.41,227.43,217.57,214.95,209.71,211.25,206.01,204.01,202.16,206.93,202,197.69,186.75,188.44,196.61,200.62,194.61,190.14,190.6,185.67,187.52,192.3,192.6,191.53,188.44,187.21,195.22,200.31,203.24,203.24,199.08,198.15,194.61,188.75,193.37,189.52,188.29,188.91,192.91,201.54,202.16,211.71,206.63,204.93,194.3,191.83,196.3,196.3,196.46,195.84,206.78,205.08,205.55,203.85,207.55,211.09,213.87,218.8,219.11,219.72,218.18,216.8,214.95,212.79,217.26,219.57,189.98,185.05,182.43,167.8,169.34,166.41,167.18,171.34,183.82,185.67,180.43,171.34,173.5,170.88,171.34,170.57,173.34,175.35,174.73,175.65,175.19,175.19,175.35,177.97,172.11,166.87,167.8,165.33,154.55,152.7,154.08,154.7,153.16,156.55,152.54,155.78,156.09,158.55,169.18,168.72,169.18,167.8,162.4,162.4,161.17,162.25,162.56,158.4,169.18,177.97,186.75,183.05,189.21,182.13,184.28,187.06,185.21,185.21,183.51,187.67,192.14,193.99,194.92,199.38,195.84,191.22,199.54,205.24,198.31,211.71,204.16,191.83,178.27,179.51,178.74,172.88,174.27,179.97,181.51,187.98,187.83,182.13,182.13,185.21,180.59,182.43,185.98,191.37,193.07,186.59,183.36,181.97,183.51,181.2,188.6,184.44,180.28,177.5,179.35,175.04,176.58,176.73,176.12,171.19,173.5,168.1,163.79,160.86,154.08,151.16,154.85,154.85,146.84,147.15,150.54,154.39,148.07,146.84,153.78,151.31,155.32,153,155.47,162.1,159.63,155.78,153.93,154.7,155.47,149.61,170.11,171.19,167.64,171.49,169.03,168.41,173.81,178.58,178.89,184.13,186.9,184.13,188.44,191.83,197.53,197.53,200.31,200.15,200,201.85,206.63,208.63,208.63,205.86,212.94,211.56,221.88,228.81,228.81,241.45,229.43,234.98,242.37,244.22,251.46,250.39,251.77,263.64,257.16,254.55,241.14,243.45,232.82,238.83,230.66,235.9,230.97,233.59,231.12,231.12,238.83,252.08,255.93,255.01,250.69,255.16,250.69,255.47,259.94,259.63,257.47,254.24,256.7,249.46,247.3,282.74,291.83,299.23,282.43,284.75,289.52,284.9,299.38,301.39,301.69,294.3,293.68,304.01,308.47,303.54,297.84,304.62,307.86,314.33,322.03,343.45,369.49,389.21,385.98,388.29,383.51,387.83,387.83,432.36,439.29,428.97,421.88,460.55,463.79,496.3,469.65,504.16,499.69,491.99,480.89,480.43,477.97,502.47,501.85,495.99,502.16,475.96,484.13,447.15,438.06,428.04,421.42,407.7,419.72,385.21,389.83,405.86,404.62,434.21,420.65,410.17,364.56,385.67,386.59,351.16,296.92,271.65,259.63,265.02,280.59,311.56,311.71,306.63,318.64,336.52,326.66,324.04,293.22,302.16,320.65,331.12,318.34,294.45,295.99,288.6,288.6,298.61,309.4,324.35,328.81,330.2,328.2,365.33,325.42,325.42,328.2,299.85,308.01,307.86,315.56,306.01,306.63,290.14,300.46,279.82,276.43,260.86,256.55,256.55,275.81,269.49,274.58,284.44,290.14,262.71,292.76,316.95,319.72,311.09,304.16,312.33,311.71,314.02,304.01,312.02,320.03,320.03,304.47,305.08,321.26,337.9,310.94,296.61,355.78,376.12,377.66,371.8,359.17,358.4,349.31,355.16,353.78,351.62,352.08,356.39,364.87,364.87,369.03,369.03,368.57,375.35,380.74,373.04,361.79,362.56,364.87,360.09,362.1,345.3,340.22,339.14,353.78,361.94,360.25,351.62,358.86,358.24,400.62,395.99,429.74,406.32,400.15,395.84,383.51,386.13,393.22,406.16,412.17,447.15,448.23,446.53,439.6,419.72,428.81,428.2,429.12,421.11,430.35,423.57,426.5,426.5,434.21,430.97,438.52,426.19,429.58,426.66,425.73,413.1,435.9,434.82,422.5,410.79,417.41,419.26,430.82,404.31,420.96,424.96,431.59,423.73,411.09,421.42,422.34,406.16,407.4,407.4,447.61,432.82,431.9,422.34,424.96,455.62,454.55,490.29,499.38,512.02,499.38,495.84,483.67,467.8,449.92,469.18,469.95,462.4,448.38,450.85,444.68,461.02,473.65,467.95,480.74,481.36,480.59,480.59,485.36,493.68,510.79,520.65,509.4,511.71,529.89,521.57,517.72,508.47,500.92,506.16,516.02,525.58,518.8,524.19,515.87,521.88,469.18,460.09,453.62,431.28,444.68,449.77,522.65,526.81,499.69,494.76,465.95,457.16,480.43,485.05,473.34,488.44,491.53,455.16,466.56,465.33,474.27,484.59,484.59,484.59,476.12,476.89,485.36,470.88,469.95,465.79,458.55,465.49,472.88,475.04,477.5,468.72,466.72,463.02,472.11,454.85,455.16,454.08,442.53,446.69,443.14,436.21,441.91,447,445.76,434.98,438.52,437.29,458.4,470.42,473.34,474.73,479.82,477.2,493.53,485.52,483.2,488.75,504.01,519.11,508.94,510.48,522.8,537.6,559.17,557.01,553.62,559.01,559.17,559.48,565.64,578.12,590.91,594.14,614.48,636.21,631.43,608.94,603.24,613.1,600.77,607.24,607.24,603.24,596.76,599.38,611.56,610.48,610.63,599.85,607.7,608.17,656.24,634.05,652.54,659.01,651.77,659.94,680.28,700.46,717.1,717.1,718.49,711.56,701.39,706.63,756.55,748.84,745.61,743.45,736.98,754.55,742.22,751.16,742.84,748.07,766.87,784.75,784.75,786.59,792.45,796.76,775.81,759.01,778.58,732.05,751.62,724.19,739.91,761.94,767.95,759.94,766.26,805.24,828.97,830.35,840.22,852.23,852.23,876.58,907.55,882.43,820.96,756.86,732.97,731.74,678.12,700.77,731.28,720.34,772.11,741.29,748.69,666.72,699.23,704.16,601.08,676.43,596.46,645.3,602.77,613.56,610.32,641.6,712.17,687.67,731.9,717.72,737.44,700.77,672.73,685.52,656.24,732.2,732.82,751.77,745.45,745.45,784.9,846.38,847.3,877.5,872.11,877.81,815.41,861.63,861.33,865.64,870.42,855.32,826.81,807.24,768.57,809.86,804.16,803.7,800.46,819.57,858.86,828.35,804.01,839.91,835.13,841.14,854.7,868.88,842.06,850.08,850.08,819.57,812.63,797.23,828.97,826.35,824.96,812.48,810.94,818.18,816.18,868.88,885.05,814.02,824.35,842.53,839.14,840.52,832.67,835.59,843.76,831.9,807.24,800.15,771.96,774.73,810.63,810.17,806.47,806.47,822.8,815.56,823.27,882.28,861.02,825.73,843.14,852.7,846.22,848.07,885.36,878.27,952.08,917.87,1069.34,1062.71,1041.76,1172.42,1204.93,1193.07,1196.76,1310.32,1314.48,1336.06,1307.4,1267.18,1184.59,1272.88,1261.02,1252.7,1269.95,1258.24,1249.46,1275.35,1291.37,1280.12,1330.51,1325.42,1291.22,1318.18,1399.38,1420.34,1390.14,1271.8,1263.64,1263.64,1212.48,1262.1,1216.95,1176.27,1200.31,1216.18,1181.2,1179.51,1154.55,1200.92,1197.23,1151.46,1168.26,1202.77,1224.65,1259.94,1263.33,1307.55,1260.4,1327.43,1301.7,1335.75,1332.97,1280.43,1298.77,1314.02,1297.53,1280.89,1281.51,1263.48,1256.7,1220.34,1223.73,1262.87,1267.03,1215.41,1177.2,1202.16,1160.09,1151,1179.97,1253.47,1278.89,1323.27,1280.74,1201.69,1252.39,1261.02,1254.7,1290.14,1284.44,1271.8,1318.03,1304.16,1314.48,1310.79,1336.06,1336.06,1343.45,1427.74,1427.27,1444.38,1422.34,1449,1449.46,1431.74,1384.13,1412.33,1412.17,1460.4,1496.46,1492.3,1492.14,1477.97,1436.52,1435.44,1410.63,1414.64,1414.64,1411.4,1396.3,1422.03,1413.1,1422.19,1429.43,1391.83,1466.26,1457.32,1498.46,1469.34,1414.18,1398.92,1359.17,1359.17,1378.27,1367.49,1410.32,1429.74,1450.39,1459.32,1368.88,1348.54,1319.57,1350.69,1369.18,1354.24,1353.47,1354.39,1409.4,1400.77,1422.96,1427.74,1444.84,1444.84,1409.25,1385.82,1365.79,1380.28,1315.41,1305.7,1339.6,1269.95,1302.16,1331.12,1296.3,1245.92,1198,1209.86,1139.6,1210.02,1194.45,1251.62,1248.84,1271.19,1275.04,1273.19,1203.7,1218.18,1237.29,1207.7,1178.43,1174.42,1192.76,1188.6,1171.03,1209.55,1249.46,1249.46,1254.7,1254.85,1266.56,1284.28,1275.19,1210.79,1235.59,1210.32,1279.04,1265.79,1249.77,1221.42,1257.47,1218.18,1275.19,1316.02,1312.94,1294.61,1292.91,1257.63,1210.32,1211.25,1199.23,1200.15,1214.33,1170.88,1183.82,1150.08,1126.19,1149.31,1150.23,1147,1174.58,1202.77,1189.06,1193.22,1199.69,1207.09,1208.32,1233.9,1233.9,1245.15,1263.02,1236.98,1257.01,1253.47,1246.38,1232.05,1256.7,1252.85,1256.55,1239.91,1234.36,1302.93,1304.31,1272.57,1287.83,1291.53,1326.66,1319.26,1341.76,1379.35,1447.3,1437.75,1459.17,1459.17,1455.62,1395.07,1382.74,1400.62,1399.23,1390.76,1372.11,1339.45,1323.42,1334.05,1342.22,1377.66,1405.39,1419.88,1414.79,1402.62,1508.94,1586.29,1636.21,1673.81,1734.36,1830.05,1731.12,1696.61,1657.63,1640.68,1659.17,1640.99,1703.39,1656.09,1657.32,1593.84,1597.84,1612.48,1675.96,1658.71,1668.72,1652.85,1716.49,1715.25,1706.01,1694.76,1682.59,1693.68,1693.68,1681.82,1635.9,1635.59,1620.96,1614.79,1629.12,1627.12,1636.67,1600.62,1564.72,1584.28,1608.32,1635.59,1630.2,1666.56,1564.25,1546.22,1585.52,1578.58,1546.07,1568.72,1596.92,1640.22,1618.8,1612.94,1618.49,1681.97,1725.58,1727.58,1793.99,1792.45,1793.37,1838.67,1846.23,1885.36,1894.14,1884.13,1866.87,1852.54,1929.58,1966.56,2011.25,2118.64,2100.77,2313.71,2294.61,2155.16,2249.77,2278.74,2257.17,2349,2331.9,2388.6,2394.61,2350.08,2310.02,2431.43,2431.43,2385.36,2494.76,2440.22,2297.53,2321.73,2218.95,2142.68,2231.9,2237.9,2127.89,2134.82,2061.63,2089.37,2257.32,2136.21,2122.5,2092.45,2222.65,2216.95,2251.77,2251.77,2378.43,2359.78,2284.44,2236.52,2217.26,2314.95,2225.27,2097.84,2099.08,2033.9,2033.9,2115.72,2118.18,2045.3,2109.09,2109.09,2032.82,1976.43,1878.12,1830.66,1795.53,1712.33,1705.86,1580.89,1621.57,1760.4,1799.38,1891.53,1850.23,1904.47,1905.55,1975.81,2047,1937.9,1743.91,1760.71,1871.65,1813.41,1731.43,1753.93,1753.93,1781.97,1691.22,1796.76,1865.33,1900.46,1753.93,1822.5,1725.42,1670.42,1586.29,1626.04,1711.09,1640.37,1606.93,1575.5,1684.59,1777.66,1720.96,1748.23,1786.13,1768.57,1755.32,1857.16,1843.91,1852.7,1898.77,1836.98,1684.75,1667.03,1703.08,1645.92,1597.38,1598.15,1556.24,1500.31,1465.33,1506.01,1433.9,1433.9,1446.69,1493.53,1448.69,1384.44,1358.09,1397.38,1312.17,1308.32,1381.2,1317.72,1384.28,1404.16,1531.9,1446.38,1469.03,1330.66,1367.18,1354.7,1341.45,1465.64,1452.08,1578.89,1483.51,1489.52,1440.68,1464.87,1404.62,1427.58,1521.57,1575.65,1575.65,1569.49,1559.63,1673.19,1637.9,1627.89,1622.19,1570.11,1522.34,1461.02,1340.37,1340.37,1375.96,1264.25,1256.86,1256.86,1291.06,1290.45,1270.11,1341.76,1327.58,1244.68,1201.69,1178.27,1135.13,1135.13,1158.71,1161.02,1221.88,1222.65,1185.67,1176.58,1194.45,1211.09,1249.77,1254.7,1323.27,1377.97,1403.54,1357.47,1348.84,1313.56,1383.98,1412.48,1455.62,1491.22,1529.89,1511.4,1601.08,1576.43,1541.91,1472.11,1526.19,1511.86,1553.62,1556.39,1543.91,1514.18,1547.61,1478.43,1430.51,1425.12,1428.81,1497.38,1404.93,1363.48,1339.6,1307.7,1268.57,1236.36,1236.36,1212.94,1226.66,1275.5,1316.64,1304.16,1186.9,1193.37,1181.2,1178.89,1182.9,1159.48,1147.61,1070.88,1047.15,1021.57,1034.98,1053.31,988.29,976.27,1018.64,1046.23,1046.84,1045.45,900.46,890.76,887.98,891.37,908.17,861.94,893.07,892.45,881.82,890.14,906.32,904.47,947.15,920.34,902.93,955.47,925.42,919.26,903.39,926.19,958.24,971.96,983.82,923.27,1055.01,1115.1,1132.97,1176.73,1120.18,1138.67,1133.59,1116.49,1159.48,1177.2,1177.2,1157.78,1127.74,1130.82,1196.15,1193.84,1155.32,1134.36,1082.74,1080.74,1085.82,1056.86,1088.91,1104.01,1062.1,1025.12,1007.86,995.22,1002.31,1042.84,983.98,994.14,994.14,974.88,964.1,998.77,998,998,986.44,996.3,960.4,985.52,1036.06,1048.54,1064.1,1090.91,1093.99,1093.99,1103.08,1086.75,1043.3,1079.66,1179.2,1151,1154.24,1158.09,1161.79,1116.33,1157.94,1304.16,1360.71,1326.5,1289.37,1323.73,1304.93,1282.13,1255.47,1280.89,1324.35,1312.48,1233.9,1209.55,1209.55,1182.9,1180.43,1228.81,1203.24,1213.71,1210.79,1206.32,1239.45,1256.09,1250.54,1265.18,1315.41,1294.76,1273.81,1263.64,1347.46,1381.82,1488.44,1507.55,1491.68,1478.12,1503.54,1545.15,1509.24,1488.6,1457.01,1480.59,1508.17,1510.17,1487.83,1477.2,1426.19,1424.81,1424.81,1471.19,1448.84,1422.65,1418.95,1413.71,1384.75,1383.36,1385.82,1388.44,1362.56,1349.31,1291.22,1324.19,1347.3,1377.04,1381.97,1385.36,1257.63,1334.51,1384.28,1464.41,1464.71,1494.92,1496.15,1467.8,1500.77,1563.64,1598.61,1663.02,1630.51,1664.1,1665.95,1668.26,1854.39,1957.32,1957.32,1930.2,1821.42,1840.83,1816.02,1817.1,1914.18,1815.56,1865.18,1924.81,1990.6,1918.8,1961.94,1914.33,1850.23,1850.23,1832.51,1727.43,1705.7,1695.07,1656.55,1700.92,1697.53,1714.02,1755.16,1784.59,1784.59,1755.78,1748.54,1743.76,1750.08,1715.25,1765.49,1786.13,1786.44,1823.11,1817.1,1793.99,1698.77,1709.55,1704.31,1741.14,1696.3,1711.86,1740.52,1762.71,1812.02,1684.9,1743.45,1784.59,1799.85,1744.68,1702.16,1698.46,1657.47,1725.42,1715.72,1651.62,1609.25,1624.81,1667.49,1628.04,1686.13,1568.57,1575.5,1581.05,1632.05,1642.37,1628.97,1686.44,1686.44,1706.93,1683.82,1642.37,1634.67,1622.8,1622.65,1659.63,1642.99,1563.79,1577.35,1565.64,1546.07,1480.89,1482.28,1500.46,1478.58,1511.09,1583.36,1584.28,1591.22,1542.06,1603.54,1585.67,1652.39,1648.23,1679.66,1668.88,1676.27,1619.26,1640.37,1620.03,1574.27,1577.81,1568.72,1540.99,1566.56,1480.12,1443.3,1485.82,1481.97,1517.72,1664.72,1661.48,1729.58,1721.88,1748.07,1750.23,1748.69,1827.27,1799.54,1847.15,1818.18,1846.38,1858.55,1872.57,1836.06,1887.67,1887.67,1884.59,1889.83,1879.97,1908.32,1866.87,1870.42,1826.96,1824.04,1800,1977.97,1986.44,2071.03,2120.34,2129.28,2126.35,2144.07,2140.22,2159.48,2087.37,2155.78,2151,2151,2209.71,2250.69,2292.14,2271.34,2135.29,2085.05,2095.69,2135.29,2252.39,2299.85,2288.75,2280.74,2258.24,2258.24,2445.92,2467.95,2506.47,2684.59,2591.37,2595.07,2747.15,2778.58,2731.12,2740.06,2651.16,2583.82,2626.81,2737.44,2684.59,2586.75,2633.9,2609.4,2657.63,2648.84,2643.14,2753.47,2723.57,2679.04,2679.04,2553,2531.43,2802.16,2719.88,2712.02,2742.68,2720.18,2966.56,3122.34,3164.25,3160.71,3245.45,3257.01,3195.53,3056.86,3124.19,3001.39,2882.28,2943.91,2937.6,2795.38,2769.34,2753.16,2768.1,2752.39,2740.68,2767.18,2781.05,2781.05,2824.96,2753.47,2785.36,2555.16,2625.89,2617.87,2631.43,2575.35,2627.12,2515.87,2470.26,2518.64,2373.19,2389.52,2259.48,2290.29,2346.23,2338.06,2369.18,2425.27,2468.41,2440.37,2222.96,2252.08,2320.49,2400.31,2379.51,2367.03,2348.07,2340.83,2319.88,2359.94,2460.25,2505.7,2534.21,2562.87,2537.13,2550.39,2471.96,2563.33,2563.33,2644.22,2544.53,2569.34,2571.65,2520.03,2465.18,2560.4,2569.8,2586.59,2470.57,2449.31,2469.03,2463.79,2459.63,2440.68,2382.59,2382.59,2492.76,2484.28,2469.18,2469.18,2427.43,2457.16,2499.38,2429.74,2531.74,2525.42,2525.42,2648.69,2753.31,2728.81,2834.51,2803.39,2798.31,2770.88,2735.75,2456.55,2400.15,2335.59,2401.69,2372.88,2228.51,2131.28,2157.01,2153.31,2133.13,2226.19,2042.22,2041.6,2077.35,2005.86,1982.59,2100.46,2068.88,2107.4,2174.58,2168.72,2270.57,2289.06,2392.6,2409.86,2431.59,2337.44,2387.98,2311.09,2318.95,2255.16,2241.76,2289.06,2289.06,2110.02,2170.57,2148.54,2070.11,2128.66,2200.92,2309.09,2323.11,2346.84,2343.3,2323.88,2284.9,2415.1,2402.93,2415.25,2439.45,2496.46,2580.74,2532.36,2528.2,2461.48,2461.94,2509.25,2633.28,2634.36,2662.56,2635.13,2529.74,2586.9,2546.53,2413.56,2405.7,2407.55,2403.24,2432.97,2374.27,2356.09,2364.25,2407.24,2464.1,2561.63,2289.68,2219.88,2185.82,2168.1,2182.74,2235.75,2308.47,2279.66,2270.42,2213.1,2146.38,2139.29,2078.58,2140.68,2147.77,2120.19,2118.49,2131.74,2174.58,2122.03,2099.23,2099.23,2113.71,2188.91,2187.67,2218.64,2178.12,2135.44,2016.49,1968.26,2005.39,2012.33,1955.47,1952.08,1926.35,1870.72,1831.74,1836.83,1919.88,1945.92,1945.92,1926.96,1928.97,1886.59,1861.17,1858.71,1931.74,1996.15,1961.94,1877.35,1877.35,1787.98,1807.7,1788.75,1848.38,1824.96,1871.49,1871.49,1884.13,1906.78,1895.84,1892.76,1772.11,1759.17,1808.17,1831.43,1786.59,1760.71,1841.29,1725.89,1697.38,1657.32,1702.31,1711.86,1721.42,1722.8,1742.68,1742.68,1760.86,1767.18,1759.17,1707.86,1665.79,1601.85,1613.87,1533.28,1538.67,1513.56,1552.39,1566.56,1523.11,1545.61,1488.91,1490.91,1553,1511.71,1555.78,1611.56,1594.92,1636.83,1650.85,1640.06,1754.24,1769.03,1697.84,1643.3,1590.45,1583.05,1583.67,1586.44,1445.3,1321.42,1288.75,1205.08,1492.14,1366.72,1439.14,1456.09,1468.26,1360.4,1348.23,1348.23,1318.34,1329.12,1392.76,1455.62,1489.21,1485.21,1480.12,1500,1489.21,1522.34,1549.92,1519.57,1546.38,1567.03,1584.59,1665.95,1732.82,1813.87,1771.8,1805.39,1767.95,1749,1726.66,1705.86,1699.69,1699.69,1765.18,1738.98,1741.6,1706.16,1766.26,1807.55,1827.12,1782.59,1790.29,1875.65,1898.92,1866.56,1825.89,1789.83,1947.46,1958.4,1953.62,1953.62,1975.96,1996.61,2132.97,2209.55,2213.87,2215.87,2186.44,2097.23,2134.36,2124.96,2124.96,2077.04,2123.57,2132.67,2221.26,2256.09,2253.31,2397.69,2466.56,2471.65,2418.95,2419.11,2383.98,2444.53,2498,2565.02,2675.81,2734.05,2765.95,2716.64,2645.61,2723.88,2685.82,2513.41,2656.39,2661.94,2654.55,2695.69,2841.6,2788.14,2735.13,2714.02,2566.26,2545.45,2522.5,2584.9,2517.1,2567.33,2575.19,2597.53,2505.86,2505.86,2501.08,2498.15,2492.91,2328.81,2332.97,2400.92,2458.24,2398.61,2443.3,2483.21,2472.42,2452.39,2433.28,2425.12,2462.1,2479.2,2478.89,2484.9,2457.01,2486.29,2492.91,2527.12,2615.25,2537.29,3138.83,3259.01,3629.58,3588.44,3311.25,3334.67,3360.4,3676.43,3614.18,3591.37,3706.63,3667.64,3547.46,3620.8,3897.07,4001.08,3975.5,4072.88,3926.66,3946.38,4000.77,3852.85,3949.61,3662.56,3598.46,3759.32,3659.78,3989.06,3820.65,3802.93,3706.01,3548.38,3444.53,3174.42,3139.91,3313.56,3176.12,3301.08,3301.08,3351.77,3386.13,3316.49,3352.85,3327.89,3358.55,3406.93,3414.79,3411.71,3411.86,3247.77,3198.46,3222.96,3052.54,3098,3288.6,3312.02,3311.25,3313.41,3313.41,3312.64,3322.19,3318.03,3299.85,3443.3,3406.47,3302.77,3236.06,3153.78,3130.51,3200.15,3404.78,3445.3,3511.86,3572.11,3572.11,3573.5,3849,3909.55,4001.23,3872.27,3883.36,3894.3,3885.67,3647.61,3794.61,3730.51,3084.59,2966.1,3211.71,3328.2,3290.76,3290.91,3173.19,3194.45,3194.45,3129.12,3083.51,3133.59,3083.98,3029.28,3294.92,3249,3138.37,3084.9,3060.4,2942.22,3113.56,3073.19,2965.02,3122.96,3131.43,3156.09,3046.84,2979.82,3028.97,3024.81,3073.34,3162.87,3102.16,3122.96,3164.41,3393.99,3139.75,3112.33,3020.65,3134.51,3238.98,3351.31,3351.31,3392.6,3413.41,3571.96,3646.23,3775.65,3803.24,3930.2,3977.2,4287.52,4289.52,4236.52,4383.51,4675.81,4704.62,5359.17,5156.09,4980.12,5194.3,5462.1,5555.32,5262.56,5473.96,6492.91,6293.68,7013.71,7069.18,6907.4,6864.41,6929.12,6534.67,6486.75,6379.82,6896.46,6927.43,7203.54,7203.54,7764.1,7635.44,7982.9,7952.23,7860.25,8036.06,8359.32,8061.63,7186.13,7555.16,7326.81,6970.72,7526.19,7882.43,8432.36,7816.49,7896.46,8279.97,8279.97,8499.69,8010.02,8008.32,8206.01,8036.67,8312.63,8950.85,8334.05,7978.74,7978.74,8506.16,7952.39,7972.42,8424.04,8596.15,8234.05,8445.76,8153.16,7718.64,7638.83,7759.17,8388.75,8510.48,8315.72,8042.37,7626.35,7004.93,6618.8,7479.05,7336.67,7467.49,7990.45,7427.58,7538.98,7447.77,7235.13,7308.47,7441.14,7442.37,7925.89,7796.61,7463.64,7186.75,7233.59,7291.99,7037.75,7383.36,7410.32,7344.68,7173.81,7253,7081.82,7042.53,7028.66,7358.55,7358.55,7792.6,8029.28,7759.63,7952.7,7602.62,7768.88,7896.76,8398.92,8625.89,9484.13,9611.25,9470.11,9695.84,9716.95,9366.26,9361.63,9426.19,9487.37,9767.49,9734.21,10006.47,9951.62,9563.64,9369.8,9156.24,9156.24],"EuroStoxx50":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,98.9,100.57,100.02,101.3,101.59,102.28,102.31,102.85,102.64,102.43,102.56,102.37,101.57,100.5,99.07,98.85,98.22,100.04,100.51,101.6,101.28,100.73,101.06,101.39,100.61,101.12,100.43,100.83,101.21,100.8,101.08,101.34,100.29,101.01,101.45,100.76,100.24,101.49,103.08,104.46,105.91,106.3,106.35,107.6,106.77,108.04,108.35,108.31,109.02,108.73,108.69,108.84,108.84,108.99,109,108.77,109.39,109.39,110.21,110.29,110.25,110.41,110,109.91,109.97,109.26,110.52,109.52,109.21,109.51,109.38,109.69,108.81,109.09,110.58,110.34,109.82,108.47,107.4,108.34,108.16,108.81,107.66,107.57,107.65,108.97,108.74,109.88,110,110.49,110.07,110,110.12,111.01,111.01,110.84,109.84,110.02,110.36,112.7,112.52,113.14,112.61,112.54,112.69,113.36,113.57,113.55,113.01,113.34,114.36,114.64,114.28,114.02,113.72,114.77,114.5,114.27,115.19,115.53,115.74,116.39,115.46,115.75,115.44,116.01,116.22,115.7,115.36,115.31,114.64,114.64,114.64,113.36,113.73,114.36,114.37,118.93,119.12,118.97,118.46,118.34,118.34,118.96,119.22,120.61,121.63,121.08,121.31,121.2,120.46,120.93,121.07,121.07,119.18,118.42,119.25,118.9,119.51,119.23,119.23,118.98,118.98,118.39,118.17,118.58,119.41,119.41,118.16,117.98,118.48,119.22,117.82,118.28,117.92,117.2,117.81,119,118.37,118.16,118.21,117.81,118.41,117.63,117.54,115.4,114.42,116.08,115.67,115.64,115.09,115.15,115.63,115.17,116.86,117.28,117.22,116.9,115.65,116.36,116.34,114.75,114.8,115.48,116.06,116.13,115.28,114.67,114.67,115,115.24,116.6,116.55,116.87,115.31,114.15,113.24,114.71,115.09,115.84,115.09,114.56,113.81,114.88,114.32,114.52,114.31,113.73,112.64,113.15,113.74,114.49,114.04,113.72,114.15,114.62,114.62,116.2,116.77,117.12,117.24,116.87,117.24,117.39,117.2,117.67,117.73,117.61,117.56,118.19,118.47,119.51,119.77,119.87,119.51,120.13,119.79,120.03,119.64,119.93,119.86,119.83,119.89,119.94,120.33,119.75,119.85,119.97,120.04,119.4,120.92,121.42,121.75,122.14,122.92,122.63,122.67,122.42,121.63,121.51,120.1,119.47,118.83,118.23,117.88,118.51,117.93,118.4,118.99,118.44,118.75,119.06,118.48,119.13,119.34,118.68,117.27,118.89,118.7,118.4,118.79,119.4,119.09,119.69,119.07,118.22,118.37,119.99,119.09,118.11,118.71,118.13,118.13,118.13,118.02,117.16,116.49,116.49,116.68,118.65,119.93,120.23,120.44,120.01,119.52,120.1,120.07,120.41,120.1,120.37,121.31,121.85,122.08,121.12,120.68,121.26,121.11,119.9,119.99,118.93,117.13,115.65,112.86,114.84,112.28,110.57,111.98,111.07,112.03,112.69,113.92,113.29,114.2,114.03,114.09,114.41,115.13,114.96,114.33,113,110.53,111.55,111.63,112.28,113.47,113.71,114.01,112.94,112.73,113.5,114.27,112.86,113.43,113.07,111.31,109.64,109,110.27,110.75,111.75,111.75,111.75,111.27,111.05,114.03,113.3,113.52,114.32,113.69,114.49,114.63,114.4,115.62,116.05,115.91,116.16,116.79,116.72,115.88,116.56,116.98,117.57,117.57,118.14,117.32,118.04,118.49,118.28,118.67,118.67,118.53,118.54,118.49,118.44,119.42,118.81,118.81,119.26,117.75,117.08,116.87,115.78,113.97,114.4,113.25,114.81,115.34,114.92,115.05,115.02,114.6,115.7,115.54,115.68,117.26,116.52,115.25,114.2,114.35,113.15,114.41,112.01,111.99,112.94,111.88,112.88,112.11,113.24,113.43,114.39,114.64,115.04,115.47,113.77,114.54,114.84,114.66,114.94,115.86,115.41,115.03,114.83,115.8,115.31,116.66,117.26,116.76,117.2,117.2,115.33,115.77,115.8,116.5,116.14,116.16,113.9,113.35,113.34,111.67,112.28,112.13,112.82,113.42,113.7,113.67,113.94,114.89,114.61,114.9,114.06,112.79,112.86,111.68,110.23,109.57,109.49,110.01,110.09,110.59,110.83,111.19,111.24,111.65,111.99,113.13,114.06,113.38,113.69,114.13,114.69,113,113.5,112.66,113.21,112.2,111.22,110.03,110.43,108.61,106.69,106.2,106.73,108.29,107.81,106.77,106.74,106.05,104.42,104.07,105.2,104.22,104.88,104.62,106.3,106.52,106.86,106.96,106.63,107.92,107.63,107.36,106.19,107.21,106.56,106.06,105.74,105.06,103.59,104.85,103.94,104.29,105.47,105.27,105.33,105.52,105.49,106.88,106.02,104.73,101.26,101.68,100.3,101.57,103.32,103.46,102.81,101.85,101.07,101.44,99.74,99.75,99.75,99.75,99.75,97.65,99.29,99.29,99.29,98.23,101.12,100.85,101.56,102.07,102.25,102.06,101.57,102,102.3,102.04,104.22,103.89,103.48,103.46,103.93,105.16,104.3,104.83,105.11,105.03,105.42,105.23,106.88,106.81,104.74,104.24,105.24,106.07,106.46,105.81,107.75,107.87,107.69,108.36,108.5,108.73,109.04,109.35,109.13,109.65,110.11,110.28,110.61,110.53,110,109.16,109.85,109.84,110.49,111.1,112.57,112.63,113.33,112.11,111.95,109.9,109.72,110.36,110.44,110.38,111.43,112.54,112.89,114.21,114.42,114.61,114.3,113.6,113.85,114.21,114.62,114.71,115.14,115.61,116.33,116.33,116.33,116.48,116.44,116.09,116.37,116.42,116.84,116.84,115.99,116.44,115.12,113.07,113.6,111.39,111.74,110.4,111.85,112.56,114.31,113.88,112.03,112.58,112.59,110.61,111.39,111.84,111.33,109.63,109.63,109.06,109.71,110.82,111.03,110.98,112.31,112.31,113.07,112.59,112.71,112.34,112.47,114.79,114.85,115.29,115.26,114.88,114.51,114.46,114.44,115.48,116.28,116.62,117.71,117.82,117.29,117.15,116.68,116.41,116.25,116.28,116.43,117.07,116.41,115.78,115.7,116.02,117.45,117.45,116.69,117.17,117.14,115.12,115.25,115.25,112.24,110.07,109.43,110.04,112.21,110.83,110.59,111.61,109.33,109.13,110.67,112.01,111.38,112.86,112.16,110.84,111.33,112.05,111.88,113.41,113.92,114.11,113.72,114.72,115.85,116.2,116.19,116.32,116.91,117.65,118.02,116.97,117.06,117.29,118.11,118.73,117.58,117.42,116.79,117.43,117.88,118.66,116.96,113.47,113.61,114.58,115.4,114.12,115.1,116.15,118.68,118.23,119.63,119.65,119.3,119,119.68,119.84,119.91,120.39,120.5,120.53,120.41,120.35,119.83,120.47,121.85,122.22,122.63,123.23,122.99,122.9,123.41,122.99,122.63,123.39,123.17,122.89,122.47,122.33,122.58,123.26,123.19,123.43,123.15,123.12,120.57,120.05,121.67,121.28,122.75,122.08,122.07,122.59,123.22,124.04,125.42,124.51,124.3,124.31,125.55,125.55,125.55,125.55,125.55,125.74,124.62,124.62,124.62,125.44,124.75,124.97,125.42,126.19,125.98,125.65,125.49,125.3,125.47,126.6,126.3,125.97,125.32,124.23,125.64,122.27,123.64,124.21,122.7,121.04,121.72,124.08,125.59,126.51,126.28,126.1,127.19,128.14,127.88,127.69,128.1,127.54,128.5,127.09,126.34,121.27,118.77,118.94,114.89,110.69,111,112.1,113.71,111.82,107.45,98.37,96.74,96.59,84.61,85.97,81.46,84.12,79.32,81.58,84.72,82.63,90.26,93.09,94.67,90.71,91.94,92.65,89.1,89.38,88.53,92.95,95,94.79,96.17,96.17,96.17,97,93.36,93.49,96.02,96.72,92.8,94.24,94.83,93.39,95.81,97.47,99.6,97.34,97.34,93.63,95.61,94.54,95.76,96.68,95.87,95.88,93.43,91.76,92.11,96.8,96.49,97.82,97.82,96.59,98.78,99.71,101.43,102.87,101.4,101.4,105.02,108.7,108.43,112.51,111.91,110.39,109.5,104.54,104.84,104.27,107.8,108.62,108.04,108.68,107.77,109.67,106.25,107.01,106.52,107.45,107.51,107.33,110.37,109.52,111.37,110.42,109.24,108.42,109.58,111.37,110.42,112.31,111.88,111.89,112.64,113.21,112.06,112.09,110.07,109.8,109.82,109.71,106.65,105.53,107.99,108.19,108.66,107.72,108.13,108.37,110.77,111.81,111.13,109.87,109.9,109.36,110.29,108.84,108.37,110.76,110.69,111.59,110.74,110.22,108.79,108.96,110.96,109.85,108.4,110.17,108.62,110.53,110.13,110.23,110.26,110.78,111,110.26,109.16,105.08,105.19,105.72,105.04,104.29,107.15,106.86,106.17,106.19,106.08,107.05,107.49,107.49,108.24,108.81,109.64,109.01,108.82,106.14,107.89,107.8,107.31,105.74,105.43,106.34,103.23,102.08,98.52,98.4,98.34,100.38,103.01,105.09,106.9,106.52,113.29,114.45,115.27,113.97,114.1,115.23,115.31,115.76,114.76,115.28,115.13,116.62,116.75,116.72,117.28,116.11,117.19,117.06,116.92,117.66,117.36,117.22,117.32,117.1,115.88,116.49,117.07,117.78,118.38,117.88,114.65,116.27,117.66,117.66,117.66,118.86,119.06,118.74,118.74,118.5,117.95,120.05,120.42,121.18,120.37,120.08,120.23,121.05,119.66,119.77,119.53,120.48,120.29,119.76,118.12,119.44,117.56,118.25,115.74,117.38,119.36,120,121.08,121.53,121.86,121.71,121.29,122.06,122.86,124.14,123.88,123,122.37,123.45,123,122.64,123.2,122.51,120.89,123.22,123.26,123.43,123.17,121.99,125.11,125.86,126.99,127.85,127.44,127.32,128.02,127.98,128.57,127.56,127.45,127.23,127.41,127.41,128.55,129.08,130.52,130.29,131.18,131.18,131.18,131.99,131.54,132.24,132.27,131.71,131.88,132.19,132.76,134.07,133.64,131,132.19,133.47,133.42,133.67,133.37,133.48,132.87,132.14,132.99,130.48,133.07,132.96,134.12,133.75,131.18,131.23,131.23,133.56,133.2,133.15,130.87,132.97,133.83,133.83,134.18,134.03,134.28,135.32,134.29,135.36,135.92,135.61,135.95,136.22,136.17,136.2,136.17,137.19,137.39,137.75,138.02,138.23,135.75,136.71,137.07,135.5,137.05,136.99,135.97,136.55,135.12,135.6,135.78,135.88,134.73,135.59,132.7,135.24,136.08,136.12,136.29,134.85,134.17,130.6,131.53,133.86,134.94,136.6,136.39,135.13,136.4,136.86,135.95,136.85,136.9,137.79,138.33,138.78,138.87,139.22,139.84,140.5,140.61,139.71,139.51,139.27,137.12,137.88,138.84,138.9,139,138.62,139.33,139.59,139.51,140.53,140.69,139.69,141.16,140.46,138.87,138.87,138.64,139.28,139.35,137.83,138.62,137.33,134.43,136.22,137.97,139.46,138.25,138.48,134.93,135.64,134.58,134.15,132.86,135.15,133.4,136.25,135.41,135.39,134.81,135.75,137.93,139.06,138.01,138.52,138.7,138.15,139.25,139.24,140.42,140.32,140.75,141.31,142.3,142.83,143.27,144.06,145.05,144.7,144.43,144.57,144.88,145.29,145.82,146.32,146.3,145.73,144.83,144.24,142.41,142.16,142.73,135.96,136.62,135.07,138.93,136.57,135.64,137.54,142.16,140.73,139.9,139.6,139.06,137.78,138.29,139.69,138.34,136.54,138.79,140.19,141.82,141.82,142.55,143.35,142.45,143.15,143.15,144.01,145.2,146.01,143.78,143.14,140.94,142.34,143.5,143.48,142.03,143.02,141.55,141.9,142.94,140.61,134.78,135.58,138.45,139.13,137.53,138.78,140.44,140.36,137.67,135.86,136.99,137.27,139.76,139.53,138.14,135.12,137.75,137.54,136.74,135.45,132.5,132.49,132.09,127.3,132,130.46,125.19,127.01,124.39,118.22,116.76,116.53,125.2,121.39,122.56,124.37,124.27,129.31,129.16,129.73,129.05,130.52,128.63,128.44,128.58,129.22,133.05,131.62,129.74,130.27,131.35,130.25,127.15,126.4,128.27,127.65,127.37,127.26,127.95,127.95,127.95,127.35,129.55,130.58,127.66,124.92,123.71,124.16,125.56,126.42,124.08,125.04,123.83,122.89,120.65,117.25,118.18,121.27,120.13,123.12,122.52,124.38,122.7,120.79,121.58,123.28,121.26,122.24,122.24,126.62,127.71,125.97,124.98,126.17,125.79,125.79,126.55,125.96,123.82,119.65,116.44,115.53,117.43,113.96,114.31,115.35,116.16,115.18,114.24,117.46,117.65,117.99,116.83,114.85,114.64,114.77,111.7,113.76,115.97,116.57,115.41,115.92,114.82,112.92,115.6,116.75,119.26,119.19,119.56,119.56,119.82,118.86,119.94,121.42,123.27,123.27,122.49,124.09,124.82,123.85,124.91,123.52,124.64,124.9,125.56,125.98,126.5,124.87,125.58,124.01,121.62,121.43,121.92,122.16,119.8,118.7,118.41,116.93,114.92,117.83,116.02,116.36,116.42,116.77,118.68,121.23,119.22,118.6,117.74,116.37,116.34,115.26,116.08,113.93,111.32,111.12,110.66,110.88,109.01,110.31,111.11,115.84,114.62,114.14,112.21,111.6,111.05,110.75,111.78,112.42,114.42,115.15,115.4,116.12,115.58,117.28,119.2,119.86,119.83,120.11,120.26,121.38,120.41,119.45,122.62,123.3,124.31,123.94,127.88,128.61,129.24,130.15,129.08,128.94,130.48,129.96,130.65,131.2,131.71,131.73,130.83,130.8,131.8,132.46,132.24,131.53,130.96,130.35,130.36,131.07,130.38,132.54,132.15,127.52,126.46,126.7,126.41,128.73,127.1,126.89,126.89,127.42,126.62,127.99,126.12,126.12,129.06,132.11,131.63,133.57,135.26,134.89,136.29,137.19,137.99,138.2,138.77,138.77,136.11,136.96,137.99,138.06,137.9,138.76,138.9,138.25,138.41,138.68,140.99,141.55,139.81,139.94,139.93,141.29,139.56,141,140.91,142.29,142.86,142.12,141.99,141.3,141.05,141.56,138.92,141.22,140.9,140.15,140.98,142.78,143.41,142.25,142.57,142.49,140.61,136.19,138.94,134.14,136.87,135.14,136.95,139.01,139.48,139.86,137.32,138.45,138.57,140.67,142.47,143.45,143.32,143.46,142.9,143.26,143.26,143.26,144.06,144.08,145.05,145.97,145.2,146.07,146.06,145.77,146.56,146.33,145.54,144.54,144.88,144.92,144.92,142.78,143.29,142.52,144.29,144.57,143.72,143.18,143.27,143.55,143.5,143.47,143.72,143.72,146.12,145.8,144.36,141.75,141.94,144.2,144.2,142.67,140.23,141.54,143.73,142.73,142.79,142.68,142.87,142.61,143.5,144.53,145.48,145.12,146.1,145.02,144.38,143.71,143.1,142.01,142.3,143.13,144.44,144.77,146.24,146.21,145.98,144.64,140.39,140.84,141.5,142.5,144.96,146,146.28,144.84,145.27,145.02,145.4,145.99,145.71,145.99,144.48,147.85,148.49,148.65,148.65,144.16,143.1,144.04,144.2,142.58,143.53,145.74,143.66,143.96,142.57,142.43,140.55,140.06,140.45,141.63,141.84,140.7,140.83,142.74,143.83,143.46,142.85,142.37,142.28,141.93,140.9,140.33,140.86,141.43,141.03,140.41,142.28,142.79,141.15,141.05,142.15,140.04,139.86,138.54,137.27,137.36,138.35,138.78,137.55,136.16,136.3,136.3,137.78,136.72,139.8,139.65,139.57,137.5,137.96,138.04,136.5,135.98,133.8,134.37,135.15,135.42,134.62,133.45,133.92,135.01,136.03,138.62,138.78,138.25,138.08,138.91,140.6,139.54,140.7,142.68,143.47,143.03,144.31,144.36,144.01,144.68,144.99,145.35,144.76,144.55,145.3,145.69,146.89,146.77,148.03,149.04,148.73,150.37,150.94,150.82,150.6,150.9,151.24,150.3,150.78,150.72,150.43,150.31,150.31,150.31,150.54,150.08,150.32,150.32,147.88,148.74,148.39,149.12,148.51,148.57,147.68,148.94,148.09,147.82,146.38,148.04,147.9,148.95,148.47,151.73,152.33,154.1,154.23,155.01,154.53,154.21,154.74,154.76,155.94,155.55,156.61,156.78,157.79,155.89,156.55,157.68,158.43,158.35,158.25,158.75,161.41,161.99,161.71,162.42,162.36,162.16,162.73,163.33,162.67,163.41,165.36,164.93,163.91,165.66,166.24,165.99,165.76,165.65,166.49,166.23,167.96,167.26,167.69,168.36,168.94,168.99,168.99,168.99,167.62,168.52,168.57,166.71,167.75,165.92,166.25,165.11,164.73,165.71,163.46,163.37,164.11,163.5,164.12,166.49,165.89,164.19,166.45,165.59,163.6,163.6,162.59,163.61,164.79,166.76,167.49,167.49,169.05,168.85,168.89,169.58,168.63,168.35,168.35,167.78,167.06,167.47,167.4,168.19,167.23,165,165.63,165.68,166.34,164.67,167.41,168.52,167.93,166.77,165.06,167.37,164.08,160.87,162.25,163.41,162.41,164.48,163.14,164.59,164.09,163.43,162.98,162.7,163.89,163.11,165.08,165.81,165.54,165.22,163.02,164.85,165.43,167.65,165.66,164.49,162.61,161.9,160.48,162.81,163.46,161.63,159.95,161.65,160.08,160.94,162,162,154.21,151.98,152.1,155.19,155.21,155.43,155.31,156.08,157.17,159.83,160.92,161.95,161.49,162.41,162.4,163.2,162.79,162.86,163.33,165.1,164.82,165.33,163.31,161.17,160.08,157.51,158.86,157.82,158.36,160.04,161.04,160.49,161.59,160.75,164.34,161.95,162.42,164.25,163.46,167.31,168.46,166.24,164.7,165,163.61,164.72,165.21,164.53,165.64,165.24,166.35,167.59,164.45,163.19,164.47,165.77,164.27,164.2,163.65,164.08,164.33,165.22,164.56,162.42,160.49,162.16,161.3,161.91,159.59,161.3,159.66,161.37,157.73,157.59,160.69,159.4,159.25,157.95,157.24,158.1,159.21,159.57,158.31,157.35,158.2,159.72,161.13,162.18,163.53,164.61,165.48,165.74,164.62,164.87,165.08,165.16,164.46,164.31,164.8,162.2,161.64,161.33,161.33,161.33,161.33,162.86,161.88,161.88,161.88,161.95,165.78,166.61,166.1,166.82,165.47,164.7,165.57,167.3,169.78,171.15,171.69,171.74,173.06,173.45,173.51,172.49,172.73,173.89,175.6,175.76,173.47,175.02,175.23,178.08,177.04,178.13,179.22,179.71,182.86,182.62,183.5,183.97,181.55,181.55,182.01,181.31,181.11,183.77,181.93,181.63,184.2,179.1,182.48,183.52,181.79,179.09,176.52,178.17,177.14,179.66,181.03,182.35,183.09,181.21,180.31,180.04,182.02,179.91,178.89,177.24,174.48,176.87,176.33,169.99,162.18,154.8,158.7,153.66,160.2,159.15,163.28,165.24,165.11,164.07,164.07,164.07,164.94,169.5,170.04,171.35,171.89,171.6,171.55,171.55,175.7,175.63,174.98,173.87,175.83,176.52,179.27,180.06,179.63,179.92,180.43,180.42,181.34,181.33,180.33,177.07,179.36,180.03,178.8,178.8,178.41,178.04,178.71,179.69,179.87,180.52,180.52,180.03,179.29,178.22,175.88,177.51,175.82,175.09,172.77,173.99,173.6,176.1,174.6,174.33,177.05,176.3,175.61,176.82,177.63,175.82,177.58,178.59,181.04,180.79,178.97,178.55,178,176.13,178.76,178.16,177.62,175.88,177.67,178.03,177.93,177.44,178.83,179.29,176.86,176.86,174.28,174.52,174.97,177.26,177.78,177.25,177.39,179.13,180.67,181.14,180.67,182.29,181.92,181.59,182.45,180.98,178.98,179.29,179.41,177.91,178.43,175.9,177.03,177.75,176.8,178.28,178.48,178.24,179.08,179.21,180.86,178.6,178.51,181.4,181.46,180.92,181.93,181.67,181.01,182.83,183.07,183.84,185.54,187.69,187.89,187.12,186.62,187.82,187.02,183.89,185.11,184.57,186.34,187.9,186.41,188.86,189.05,187.47,188.44,188.65,189.86,189.64,189.69,189.47,188.23,188.8,188.17,188.47,186.54,185.06,188.31,190.35,192.4,190.92,189.29,187.53,184,184.24,185.17,183.35,183.8,185.3,188.02,187.94,188.43,188.41,189.03,189.31,190.09,190.29,190.34,190.1,189.76,191.29,190.18,191.24,190.09,188.88,190.88,191.5,190.95,191.13,191.13,191.13,191.13,191.21,192.69,192.69,192.69,196.93,197.2,196.93,196.29,199.38,200.01,200.46,199.63,200.83,200.45,197,195.88,195.57,198.01,197.74,198.06,199.29,197.25,195.87,197.73,199.72,199.31,198.48,197,199.41,201.43,201.03,200.65,199.84,198.98,198.76,200.19,202.9,201.45,203.83,203.25,203.34,205.23,204.84,204.07,199.03,191.88,195.17,192.25,190.15,189,194.05,192.64,191.12,190.04,190.79,191.79,190.72,186.63,182.89,185.31,185.55,187.81,185.04,183.04,184.23,185.16,190.58,189.26,189.26,189.26,187.27,196.59,196.02,197.01,196.31,198.95,197.48,197.25,201.38,198.89,197.15,196.35,195.97,195.59,194.82,194.02,193.37,195.53,195.53,191.61,195.13,200.37,198.56,196.52,195.99,193.1,194.85,194.85,193.74,194.45,194.52,198.67,198.15,200.11,200.11,201.6,201.81,201.3,201.15,200.63,203.05,201.25,202.9,201.53,201.54,201.12,199.8,201.36,205.7,207.09,208.02,209.44,210.21,209.21,209.82,207.13,206.6,208.36,206.83,207.17,210.37,208.86,211.45,213.19,212.7,210.1,206.28,208.92,208.44,208.48,208.78,208.3,208.89,207.14,207.03,208.96,210,206.45,208.81,208.85,209.09,207.74,210.92,211.37,213.64,215.65,215.32,216.17,216.88,217.27,217.79,217.22,217.6,217.4,217.1,215.03,214.24,213.5,214.83,214.36,214.61,215.12,213.59,215.61,213.43,211.73,211.51,212.19,212.53,212.9,213.2,209.82,208.41,210.27,208.12,207.33,208.33,210.2,207.32,210.04,210.26,209.43,208.53,209.53,209.48,210.11,208.41,205.3,207.39,207.52,208.52,205.46,203.68,205.23,206.16,206.16],"HSCEI":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,101.1,100.47,102.35,101.52,102,102,103.75,103.59,102.13,101.18,100.19,100.66,102.2,100.24,99.84,99.94,101.17,101.72,98.76,100.52,99.33,98.38,98.96,98.59,98.21,98.45,99.45,101.63,101.78,101.92,103.09,103.99,103.68,103.59,104.16,102.99,102.26,102.86,103.5,104.21,103.91,102.13,102.35,102.2,99.81,99.72,98.74,97.75,98.26,96.88,96.68,96.68,96.68,97.93,98.06,98.93,98.93,99.61,99.41,101.07,101.2,101.11,101.76,102.5,102.38,103.06,101.78,102.16,103.22,103.11,102.3,102.42,102.76,102.58,103.76,103.23,103.23,103.23,102.74,102.1,101.96,103.62,103.68,104.83,106.09,106.62,108.01,107.98,109.89,110.09,109.09,109.99,109.6,110.96,110.79,109.71,108.78,108.44,108.33,107.9,106.82,107.1,107.72,108.25,106.31,106.03,108.02,108.62,108.17,110.84,110.71,111.45,112.08,110.11,110.43,110.33,109.11,109.78,109.9,109.04,108.18,108.61,108.61,109.14,108.21,108.18,107.97,107.05,107.49,107.45,107.45,107.45,105.76,105.13,105.89,105.82,106.43,108.16,108.64,108.05,107.61,107.61,107.13,107.13,106.22,104.52,105.11,106.66,107.69,108.01,108.27,110.04,109.86,109.33,108.16,108.11,109.24,109.46,109.41,111.32,111.4,111.82,111.82,111.65,111.83,112.32,111.58,111.68,111.74,112.14,111.53,110.41,110.83,110.72,108.94,109.35,110.78,110.23,109.44,109.54,109.83,110.89,110.54,109.6,109.85,109.14,109.64,108.52,109.31,108.94,107.95,107.56,109.68,110.75,112.43,112.96,113.54,113.25,114.36,114.22,113.59,113.94,113.54,114.05,114.33,113.26,114.02,116.08,116.41,115.85,115.86,116.4,116.67,115.43,113.53,111.33,112.75,113.07,113.91,113.74,112.6,113.21,115.35,115.35,116.36,118.86,119.43,118.95,119.77,118.94,118.83,117.75,117.85,117.18,116.87,117.4,118.16,118.38,117.8,116.89,116.54,117.89,117.15,117.65,117.92,116.98,114.91,115.5,116.2,114.51,114.88,114.88,119.04,120.01,120.01,120.66,119.89,120.24,120.16,121.1,121.3,122.18,121.81,122.38,119.59,121.71,121,120.1,121.02,120.53,122.6,121.76,121.17,122.53,122.13,122.17,121.35,122.63,121.89,123.67,123.68,123.04,122.16,120.17,121.45,122.24,121.5,125.03,125.92,123.59,125.39,123.96,123.26,122.65,120.84,120.56,121.28,120.93,117.54,117.42,118.88,120.37,119.12,121.3,121.43,119.68,120.2,121.53,121.15,122.11,122.7,122.7,122.7,122.33,123.03,123.3,127.08,127.29,128.5,128.59,128.83,129.05,129.4,129.47,131.3,131.31,134.65,135.51,137.89,138.78,139.04,142.05,143.43,140.97,144.51,143.83,140.99,142.8,141.46,142.56,141.94,133.59,130.92,130.36,125.32,125.31,126.41,129.11,132,132,132,130.54,133.59,131.92,134.1,135.14,133.17,130.38,130.87,128.5,126.27,129.64,128.26,129.88,130.9,133.7,134.22,133.57,133.94,133.44,133.31,132.65,131.85,130.86,127.71,128.44,129.53,126.37,126.34,126.34,126.34,127.8,124.86,124.86,126.02,127.13,129.77,129.78,129.4,129.11,126.44,125.31,126.21,128.88,126.93,126.36,128.94,127.35,125.82,127.06,129.85,129.85,128.4,126.56,125.21,126,127.88,128.31,128.82,129.99,132.09,131,130.99,129.29,130.1,130.04,130.04,127.31,127.96,126.86,127.57,125.93,123.93,126.13,126.57,128.99,129.09,129.34,130.65,128.1,128.17,128.53,126.73,125.84,124.99,124.99,121.02,121.15,119.67,119.41,118.03,117.08,114.56,114.44,116.6,116.6,114.48,112.8,111.7,111.85,113.39,113.98,112.23,113.23,113.16,112.71,111.53,111.39,110.81,112.49,113,115.55,116.61,116.05,116.33,116.32,116.09,115.54,113.02,112.6,112.69,114.42,114.79,116.04,115.23,113.37,113.14,110.93,110.35,110.71,111.96,113.07,114.25,113.88,113.51,116.35,116.86,116.7,115.49,114.52,113.86,114.68,112.1,111.39,111.19,109.86,108.81,107.81,110.59,111.35,110.16,111.16,113.11,113.64,116.11,114.01,114.01,115.68,115.19,116.02,116.02,113.24,113.58,111.06,110.88,109.44,109.73,109.96,106.27,108.45,106.82,107.39,107.39,106.74,107.64,110.46,107.77,107.68,107.16,105.92,105.43,105.29,106.76,108.24,112.54,111.04,111.96,112.05,112.71,109.84,109.93,110.34,109.56,111.15,111.45,111.95,110.21,110.42,110,109.39,110.79,110.72,111.98,111.46,111.84,114.59,114.85,113.27,110.36,109.19,108.17,107.88,109.69,111.16,109.08,109,107.73,107.36,106.25,106.36,105.96,105.96,105.96,105.2,105.22,106.61,103.55,103.57,105.61,106.6,106.71,109.07,109.45,110.09,108.38,110.59,111.15,110.69,112.01,112.81,111.76,111.94,112.57,114.5,114.59,114.43,114.74,116.2,116.5,116.21,116.21,116.21,116.21,115.37,116.01,116.3,117.92,117.62,115.17,117.4,117.06,118.24,119.05,120.33,122.47,121.56,120.64,119.7,121.17,121.89,121.96,122.06,120.67,117.48,118.74,120.74,120.1,120.54,121.18,122.93,123.06,122.41,121.56,121.28,118.27,118.27,119.04,118.93,119.83,121.7,121.58,123.25,123.12,123.12,124.18,124.41,123.87,122.34,122.78,122.48,124.47,124.77,123.92,123.92,123.92,123.53,122.82,121.11,121.21,122.55,121.54,121.54,121.69,121.88,118.29,118.58,116.85,114.2,115.1,115.1,113.34,113.77,113.84,112.55,111.97,111.98,111.66,109.52,109.99,109.54,109.68,109.41,110.04,109.37,109.83,108.89,108.93,108.82,108.82,110.85,111.83,110.51,110.27,109.72,109.81,110.64,113.35,115.01,115,115.33,113.12,113.36,114.74,114.58,114.58,115.63,115.01,114.92,114.72,112.93,112.15,112.69,113.55,113.6,114.13,114.41,114.23,113.56,114.87,113.41,113.83,114.34,115.09,114.28,113.52,113.92,112.41,111.84,108.97,106.16,105.43,105.23,105.74,105.23,105.28,103.68,103.89,104.28,104.92,106.45,106.7,107.16,106.59,107.35,105.44,105.26,105.1,105.22,106.17,106.39,105.67,108.33,109.34,109.83,109.69,109.55,111.25,111.54,112.54,111.91,110.59,110.34,109.36,109.25,108.33,108.15,107.08,107.53,106.86,107.41,107.41,107.22,107.62,106.85,106.85,107.42,107.08,107.6,110.06,110.65,110.56,110.9,111.49,110.98,111.02,110.85,110.05,110.91,110.21,111.3,111.06,110.34,110.91,111.85,113.86,114.54,114.36,115.15,114.59,111.76,112.58,110.76,109.8,109.77,111.16,112.63,111.82,110.04,110.63,111.92,111.8,111.83,111.21,108.48,109.13,109.05,107.97,108.69,109.59,109.59,109.46,110.59,111.77,114.12,113.5,115.46,116.09,115.68,116.15,116.38,116.21,116.21,116.21,117.88,118.2,117.6,119.2,118.5,117.57,117.92,116.67,118.79,118.64,120.01,119.57,118.94,119.29,120.25,119.32,115.51,117.67,115.32,115.58,115.58,115.58,111.81,108.72,107.83,108.12,109.88,110.5,113.35,112.72,112.19,113.81,114.61,114.09,114.39,115.38,113.78,114.87,114.92,113.63,111.28,111.4,110.58,111.54,108.48,110.41,110.41,110.79,112.96,110.11,105.13,106.91,106.04,102.41,101.61,97.16,97.04,92.67,90.13,96.02,92.15,96.71,100.34,99.48,100.08,99,101.03,99.03,100.31,99.94,101.64,103.69,101.95,103.31,103.31,103.31,103.69,102.4,101.85,103.35,103.45,101.24,101.83,102.18,101.68,103.99,105.13,105.73,105.73,105.73,101.08,102.12,103.27,102.82,103.91,105.2,103.53,103.57,102,101.87,102.42,104.07,104.22,103.72,99.26,99.67,101.04,100.74,100.58,100.68,103.55,104,104.96,104.96,106,105.39,106.57,106.81,104.71,103.53,101.67,103.9,104.35,104.42,105.03,104.02,105.23,104.63,104.63,103.75,102.75,102.76,102.76,105.9,107.86,112.95,111.62,113.18,113.53,111,111.36,109.57,109.41,106.71,107.44,108.41,109.99,107.86,108.72,106.15,106.09,106.9,107.24,106.32,105.72,105.65,107.44,108,107.43,105.97,105.2,106.91,107.57,107.87,108.1,109.36,109.78,108.6,106.94,107.53,108.85,108.37,108.46,107.42,107.22,105.21,105.44,105.31,104.67,104.08,102.82,103.51,102.44,101.97,102.69,103.26,103.5,103.67,102.48,103.22,101.51,100.84,100.65,98.68,97.95,98.81,97.73,98.95,98.95,98.95,99.49,100.42,101.39,101.34,101.27,104.02,104.02,104.46,102.79,104.4,105.07,105.18,106.12,106.2,106.62,106.62,105.33,104.91,104.83,102.77,104.63,106.05,106.34,110.34,110.54,111.96,111.48,111,111.4,111.04,111.39,111.09,112.04,111.15,111.12,112.32,111.75,111.17,112.68,113.62,111.05,112.24,111.34,111.47,111.88,110.28,109.61,110.44,109.68,110.06,109.96,109.51,110.16,111.04,110.39,109.53,109.34,110.38,109.83,109.83,108.58,110.03,112.28,113.07,112.91,113.45,114.77,113.69,115.36,116.45,118.12,117.77,118.98,119.2,120.7,123.56,125.82,125.19,122.96,125.94,123.15,122.69,119.35,118.03,120.61,122.24,122.69,121.76,121.74,121.72,122.17,124.36,125.1,125.1,125.1,126.74,128.77,126.79,127.48,125.24,125.41,121.2,123.38,118.43,120.61,119.63,122.84,119.26,118.9,115.98,115.55,116.46,119.41,117.65,117.35,119.3,119.6,120.78,118.82,119.06,117,114.23,113.14,115.47,115.23,116.05,115.53,118.12,118.12,118.12,118.12,116.57,116.98,115.59,114.51,114.25,115.82,114.84,116.12,116.81,116.73,114.65,115.19,116.54,115.63,115.65,115.98,116.35,113.99,112.81,113.36,112.9,113.26,112.66,112.15,109.84,111.16,108.88,109.56,110.6,112.19,112.19,112.07,112.7,112.05,113.64,114.31,114.23,113.65,114.66,115.73,115.32,114,113.78,113.18,112.98,112.72,112.84,113.21,113.21,112.34,111.23,111.51,112.1,111.07,110.24,112.39,112.43,114.55,114.39,113.27,112.28,112.28,109.67,108.19,108.14,106.88,103.43,104.09,104.73,106.49,105.98,107.13,106.91,104.86,103.87,103.52,105.37,103.6,98.51,93.5,95.52,99.15,97.22,98.31,98.14,99.18,97.89,97.65,98.07,100.02,100.54,99.67,98.75,97.56,95.38,96.35,93.88,92.06,92.83,95.81,95.57,94.11,94.32,94.72,96.7,97.63,98.36,97.84,98.68,99.7,99.5,96.7,98.84,97.28,95.63,94.1,92.72,94.14,90.96,90.98,90.98,91.96,90.61,90.39,91.82,92.25,91.89,91.89,89.73,89.67,88.58,91.75,92.41,94.76,93.18,93.18,93.18,94.41,94.47,96.2,97.68,97.65,98.53,98.16,97.5,95.76,95.32,94.37,93.71,93.33,93.26,94.27,92.88,92.6,92.73,93.83,95.28,95.97,95.67,97.15,96.8,95.15,94.46,94.03,92.95,92.61,92.76,90.3,89.49,88.12,88.73,89.57,89.03,87.13,89.79,89.74,91.16,90.33,90.04,88.65,87.85,87.92,86.53,84.69,85.73,86.29,86.39,86.36,86.36,86.29,85.28,85.25,86.73,86.23,86.14,84.4,84.96,86.67,88.09,88.12,90.69,90.58,90.08,89.12,88.97,88.89,92.26,92.53,91.17,89.54,89.63,87.31,86.45,87.92,87.92,87.92,87.92,90.39,90.45,89.64,91.85,92.56,92.5,90.75,89.8,91.39,91.73,89.9,89.04,87.09,87.58,84.56,84.15,84.49,84.8,83.27,83.19,80.94,78.05,76.21,75.7,76.4,74.35,69.03,64.48,72.54,78,77.57,76.28,79.38,80.4,79.27,76.7,77.88,79.11,80.13,79.25,79.36,81.83,81.83,80.12,78.93,78.87,75.9,76.49,77.02,77.77,77.77,77.77,75.47,74.74,73.31,73.42,70.39,71.05,71.46,72.85,76.85,76.85,76.52,75.16,74.95,71.7,71.7,70.11,71.28,69.44,71.68,71.88,74.52,74.65,72.65,74.98,73.95,72.48,72.64,72.42,74.58,76.4,78.1,77.35,76.53,76.53,78.97,78.64,80.86,80.09,80.13,77.29,77.22,78.48,76.44,77.58,77.92,79.5,77.24,78.58,80.33,82.31,83.12,81.02,80.73,80.73,80.53,80.47,79.46,79.38,79.52,77.09,75.73,75.24,75.03,73.27,75.49,74.73,75.59,74.76,74.83,74.52,75.66,74.67,74.58,72.5,72.41,70.57,70.94,72.44,72.68,71.83,71.55,69.96,71.85,72.21,71.76,70.84,71.13,70.55,70.76,70.5,70.01,69.14,72.12,72.88,72.36,72.03,72.29,70.99,70.26,69.26,69.03,68.58,67.78,69.79,69.79,69.84,68.13,68.54,67.61,66.74,67.45,65.99,65.24,64.38,64.63,64.76,62.74,62.25,62.27,61.67,61.67,65.54,65.13,63.96,61.92,60.33,59.94,58.55,59.28,59.32,60.61,58.94,58.04,58.1,53.85,54.55,54.94,55.21,52.95,52,54.86,56.39,54.44,57.73,59.35,58.99,58.28,57.04,61.78,62.97,66.01,65.56,64.66,64.5,63.2,62.14,62.6,63.1,62.87,61.84,65.67,67.12,67.23,67.06,70.62,70.05,67.74,70.2,71.96,69.79,70.07,70.57,69.41,69.86,69.55,68.15,68.45,70.72,69.95,69.95,69.95,71.32,70.5,70.6,70.6,71.96,74.4,75.52,75.22,76.72,76.48,76.98,76.99,77.83,77.4,77.02,77.3,77,78.8,78.8,78.8,78.8,81.15,81.85,78.93,78.18,79.61,79.03,77.78,75.7,76.15,75.7,77.01,75.04,75.23,74.87,73.9,74.66,73.62,74.38,72.92,71.95,72.23,70.59,70.24,69.3,72.81,72.2,73.07,73.05,72.78,70.84,70.02,67.87,69.39,67.8,69.07,68.26,69.66,68.12,68.97,69.92,71.99,71.55,70.01,70.86,72.43,72.89,73.38,73.08,72.4,72.4,72.59,72.59,72.59,73.19,72.3,72.4,72.81,74.3,73.74,72.54,72.61,71.23,70.9,69.51,70.07,70.29,70.57,70.57,70.34,69.38,70.75,71.58,72.63,70.92,70.37,70.5,70.17,71.39,71.49,69.88,70.71,69.43,70.48,69.53,68.21,66.69,66.69,65.82,66.17,64.9,64.75,67.69,68.06,68.23,68.88,68.87,69.38,69.35,69.69,69.25,71.31,71.95,71.36,70.08,68.5,68.5,67.33,67.1,68.49,68.67,67.67,67.65,69.4,69.64,68.34,66.01,65.27,65.66,66.29,67.16,68.91,69.06,69.06,67.39,67.2,67.01,67.55,66.03,69.54,68.96,70.24,71.69,72.65,72.18,70.23,70.05,70.89,70.91,69.37,69.64,69.8,68.87,67.64,67.04,66.05,66.26,64.73,63.5,64.21,64.41,66,65.02,65.77,67.25,66.93,66.68,66.68,68.8,67.36,67.43,66.49,66.49,66.32,65.92,65.66,66.08,66.44,65.39,65.66,65.09,64.22,65.94,64.55,63.5,63.91,63.08,64.74,64.74,62.64,61.94,62,62.91,63.16,63.73,64.58,65.99,64.4,63.7,64.15,63.98,62.38,61.83,61.83,61.07,61.64,61.7,62.96,62.76,61.72,61.7,62.24,63.73,65.1,64.1,63.6,63.5,62.13,63.06,62.81,65.33,64.41,62.91,64.27,63.99,63.97,64.98,63.61,63.44,62.73,61.27,61.68,60.67,60.05,59.07,59.64,59.13,58.95,58.26,59.12,58.45,58.69,60.02,59.33,58.89,59.1,59.18,57.8,57.8,57.8,59.01,60.7,60.74,59.73,59.27,59.49,59.04,57.71,57.38,57.08,57.86,57.72,57.35,56.26,54.05,54.46,53.99,52.67,54.13,56.37,57.58,56.44,56.95,55.55,54.69,55,54.95,54.94,57.64,57.09,56.44,55.88,55.88,55.88,56.72,56.98,58.53,57.75,58.12,59.42,60.64,60.71,60.27,61.15,59.9,59.79,60.32,60.16,58.57,59.74,59.11,59.56,60.53,62.65,62.47,62.2,61.29,61.58,60.86,61.11,62.18,60.63,60.6,61.34,60.32,61.19,61.19,61.19,62.77,61.86,61.86,61.74,61.8,62.08,63.36,63.22,61.91,61.67,60.48,60.54,61.11,60.51,61.4,62.7,64.23,64.45,66.02,66.16,66.06,66.06,67.78,68.94,69.21,68.72,67.99,69.08,70.75,71.2,70.99,70.99,72.35,73.02,73.34,71.82,71.79,70.57,69.55,70.42,70.4,69.05,68.05,67.31,68.78,69.02,68.89,69.02,68.55,68.55,67.94,66.96,67.62,67.12,67.11,67.05,69.37,69.03,67.81,67.82,68.07,68.2,66.59,66.67,66.67,67.13,67.98,68.14,67.2,66.18,66.08,65.82,67.09,68.79,67.62,66.51,66.31,66.41,64.92,65.85,65.23,64.68,63.35,63.29,64.03,63.04,64.31,64.09,62.91,61.88,61.63,62.48,62.56,63.37,63.49,63.7,63.44,63.55,64.88,65.56,65.24,64.67,65.54,65.49,66.11,66.4,65.56,65.78,66.67,65.41,65.32,64.59,64.29,64.29,63.21,63.46,63,63.36,63.93,64.13,65.03,65.03,66.4,67.2,67.28,70.7,71.24,74.62,76.87,79.08,79.08,84.67,83.33,85.89,87.72,78.8,77.56,80.24,80.24,79.82,76.63,76.53,75.6,78.68,77.29,77.53,78.74,77.49,77.77,77.83,78.11,76.73,76.49,77.32,77.58,79.57,77.54,79.47,78.57,77.45,75.05,75.09,73.43,73.5,74.31,74.57,74.67,74.08,72.52,72.26,72.15,74,72.91,73.15,73.8,74.47,74.6,73.86,75.15,77.51,76.93,76.33,77.5,75.67,75.11,74.82,75.61,75.31,75.22,75.96,76.91,76.91,76.91,76.92,76.66,76.76,74.66,75.39,75.14,74.23,73.61,73.49,72.64,72.06,73.58,73.83,74.75,74.85,76.19,77.09,75.57,75.44,77,77.74,77.73,77.73,77.73,77.73,77.75,80.49,79.67,80.98,81.96,83.68,82.58,84.85,84.27,87.73,87.65,89.24,89.11,87.63,91.26,90.76,89.49,92.59,91.97,88.63,88.66,88.11,90.88,94.12,93.86,91.87,92.19,91.42,90.98,93.48,94.01,96.64,96.49,94.24,92.06,93.2,90.73,91.13,91.37,90.62,89.68,89.9,89.84,88.66,88.66,76.48,78.24,79.35,80.75,82.15,83.88,84.06,81.91,83.16,83.16,83.16,83.72,85.46,84.84,85.09,85.08,84.95,85.04,85.04,86.67,86.67,86.99,86.79,87.4,87.49,90.13,88.31,90.48,89.61,89.17,89.09,90.44,91.2,90.11,90.39,88.85,89.19,88.91,90.13,88.79,88.02,89.71,90.31,91.45,90.87,92.45,92.32,93.35,91.92,91.14,91.93,91.55,90.5,88.57,89.79,90.53,92.25,93.29,92.7,92.27,91.38,91.38,91.87,91.07,90.65,90.65,91.7,90.53,91.28,91.48,91.95,93.47,93.31,93.22,94.63,95.19,95.56,97.31,97.48,96.35,96.63,96.3,95.17,93.54,92.71,93.65,94.25,94.06,94.58,93.67,93.59,93.89,96.35,96.13,95.18,95.12,94.83,94.91,94.5,95.61,97.38,96.33,94.98,93.89,94.22,96.05,95.91,95.29,94.11,95.37,96.05,97.32,98.22,97.51,98.61,98.82,98.84,101.05,99.58,99.74,98.67,97.83,99.43,99.45,97.96,99.55,100.62,100.62,102.4,101.7,100.81,100.81,100.28,100.35,98.54,97.11,95.6,97.41,97.5,94.89,97.22,97.96,97.12,97.94,98.6,99.69,98.73,98.73,98.42,96.54,97.49,96.59,96.49,98.52,97.59,99.44,99.63,100.44,101.08,98.96,98.23,96.61,96.36,96.28,93.92,95.6,96.44,96.48,96.5,96.14,96.59,96.69,95.07,95.89,96.86,95.65,94.1,94.29,94.08,95.6,93.9,92.22,93.12,93.1,93.73,94.13,93.86,93.87,93.87,93.87,93.63,94.67,93.86,96.55,96.33,97.34,96.23,95.18,95.28,97.09,97.77,98.09,97.58,97.09,96.18,95.77,96.06,95.97,96.46,96.32,97.35,100.16,100.59,98.11,95.61,95.33,95.28,95.75,95.1,96.54,97.32,97.59,96.61,95.11,95.51,95.51,95.51,95.51,94.34,96.85,94.85,95.13,92.81,93.29,91.63,90.65,89.33,88.99,90.85,90.36,91.72,91.66,91.6,91.31,92.83,92.94,93.04,91.57,90.28,87.48,89.5,90.37,88.34,89.02,88.44,88.18,89.55,89.05,89.05,89.05,89.05,91.37,90.68,91.14,90.58,91.31,91.8,93.77,93.14,93.71,94.17,92.68,91.95,92.41,92.2,91.03,92.72,91.42,91.42,92.39,91.93,92.67,93.92,93.6,93.55,93.53,93.47,93.28,91.51,90.53,90.98,90.61,89.24,90.04,90.04,90.31,89.11,88.08,88.72,89.59,92.27,90.52,89.52,88.84,87.83,87.66,87.59,86.52,88.18,88.19,86.77,85.76,83.99,83.99,83.34,81.7,81.76,80.11,78.56,80.08,79.59,79.59,80.16,81.08,82.26,81.82,85.13,84.21,84.65,84.93,85.32,86.18,87.59,85.68,88.26,88.04,86.88,87.95,87.09,88.09,88.83,90.8,91.03,90.68,91.11,90.29,90.6,89.49,89.84,90.79,89.8,88.94,88.73,87.83,88.87,89.01,89.2,90.01,90.92,89.2,88.93,89.86,89.4,89.4,89.64,89.11,88.98,88.29,90.08,88.76,88.42,88.12,87.13,86.83,87.24,86.4,86.41,86.08,86.61,87.81,88.06,87.12,87.04,85.98,86.52,86.12,86.56,86.56,84.56,84.78,85.6,85.11,84.35,85.8,86.01,85.54],"KOSPI200":[100,100.46,101.02,101.74,101.75,101.4,102.22,101.69,102.53,101.4,101.4,102.07,101.99,102.84,102.41,102.51,100.87,100.89,100,100.46,100.89,101.59,101.69,101.76,101.31,102.19,101.83,100.63,101.08,101.02,100.79,100.81,99.57,99.59,99.46,100.26,100.52,98.32,100.54,99.24,98.46,98.14,98.58,98.63,98.54,98.26,99.39,99.89,99.25,99.34,99.62,99.6,100.13,100.22,99.59,99.3,100.67,100.95,103.18,102.75,102.67,103.03,103.18,102.96,103.4,103.15,103.41,103.22,103.17,103.02,103.02,103.37,102.27,102.39,102.39,102.39,103.56,103.62,103.17,103.65,103.86,103.86,105.6,106.31,105.51,104.81,105.29,105.18,105.42,104.96,105.19,105.27,105.6,106.52,106.52,106.52,105.58,106.16,105.73,105.88,106.13,105.92,105.43,105.42,105.8,105.86,105.5,105.86,105.91,105.87,106.22,107.16,107.45,107.47,106.48,105.92,106.35,106.35,107.37,106.24,106.49,107.06,107.23,106.97,107.23,108.46,109.44,109.44,110.31,111,110.56,111.78,111.3,111.37,111.18,110.41,110.76,111,110.92,110.52,110.9,110.63,110.56,110.06,109.88,109.17,108.49,108.77,109.92,109.92,109.52,109.57,108.88,109.38,110.29,111.04,112.4,112.94,113.16,113.11,113.11,114.07,114.07,115.18,115.18,118.09,118.09,116.64,118.04,117.45,117.7,118.01,117.88,117.54,117.39,118.39,118.68,118.82,120.2,120.88,120.71,119.95,119.98,119.73,121.23,121.03,121.03,120.38,120.6,121.84,120.6,121.3,121.27,120.78,120.82,121.53,121.81,121.1,121.87,122.18,122.83,122.92,122.41,123.09,122.77,123.02,122.26,122.78,122.82,122.34,122.66,123.49,123.49,124.58,124.98,125.44,125.49,125.59,126.26,126.72,126.81,126.08,125.81,126.22,123.71,123.89,124.85,125.11,122.98,123.44,123.64,123.42,121.89,121.44,119.21,120.08,120.08,120.96,121.69,121.45,121.35,121.82,121.97,122.37,122.56,121.9,121.55,121.94,121.4,121.21,121.21,119.74,119.4,120.89,121.07,122.01,122.25,122.08,123.07,123.53,125.6,125.43,125.42,125.33,125.33,124.6,123.77,123.59,123.6,124.55,124.55,124.55,124.55,124.55,124.55,124.55,127,128.43,129.21,128.91,129.1,129.37,129.33,128.57,129.52,129.74,129.55,129.69,128.77,129.65,130.11,131.36,133.41,132.92,133.43,132.87,132.62,133.03,132.77,132.3,131.66,131.38,130.81,131.67,131.6,131.11,131.34,132.12,131.73,132.1,129.77,130.35,130.22,128.09,127.9,129.47,129.8,127.8,127.43,127.86,128.02,127.62,128.45,127.89,128.47,128.62,128.68,128.68,125.91,126.5,126.5,125.58,126.12,127.89,127.89,128.38,128.83,127.82,129.55,130.46,130.06,129.02,128.25,128.67,128.93,129.96,129.64,129.61,129.77,128.49,130.32,130.32,131.56,132.08,133.13,131.3,131.29,131.28,128.78,127.31,125.24,122.27,122.72,120.04,121.34,122.42,123.81,123.81,123.81,124.68,123.2,123.84,122.94,124.76,124.97,124.77,123.21,123.21,121.43,119.95,122.26,122.53,123.96,125.1,126.29,127.19,126.8,127.1,127.15,126.16,126.72,126.65,127.33,123.03,124.01,124.58,122.79,123.59,123.9,123.66,123.41,121.51,123.28,122.71,123.44,123.63,123.24,123.35,123.99,124.12,123.91,125.48,126.07,125.19,125.19,124.39,123.65,125.26,126.33,127.42,127.42,127.02,126.24,124.74,124.74,124.39,123.82,124.96,125.43,125.12,124.03,124.43,123.77,124.2,124.54,124.54,125.35,125.03,125.25,125.62,124.52,121.79,122.44,123.35,123.99,124.35,124.35,125.1,124.04,124.92,124.77,124.77,122.55,121.58,120.25,118.67,119.73,118.54,119.6,119.47,119.23,119.03,117.46,118.01,115.36,115.52,115.09,114.85,115.43,116.25,116.64,115.95,115.94,117.61,117.11,116.91,116.75,116.53,116.94,116,116.37,116.11,116.94,117.27,117.08,117.14,117.63,115.6,116.41,116.27,117.03,117.04,117.12,115.64,114.15,114.63,114.63,113.51,113.64,113.66,114.96,115.39,115.89,116.39,116.89,117.05,117.37,117.37,118.17,117.15,117.67,116.16,115.89,115.33,115.66,115.17,115.13,115.16,117.08,116.26,116.61,116.82,117.76,118.46,118.46,118.46,118.46,119.16,118.34,118.21,116.78,116.78,114.91,114.71,114.17,114.17,113.36,108.36,110.02,109.16,109.05,110.29,109.27,109.73,110.03,107.33,106.86,105.04,103.45,102.47,103.36,103.97,103.55,107.34,106.36,106.95,106.51,107.16,106.85,106.95,106.21,105.89,106.93,106.98,107.24,106.16,105.65,105.45,104.88,106.25,107.15,107.69,107.97,106.86,108.76,107.62,106.92,105.22,105.65,104.5,104.24,105.73,106.1,104.58,104.88,104.43,105.27,104.28,104.38,104.14,104.14,102.78,102.61,103.17,103.17,101.69,100.72,101.56,103.01,102.25,104.6,104.58,105.2,104.36,106.3,106.81,107.07,107.86,107.9,107.4,107.85,108.93,110.92,110.91,111.45,112.87,112.59,112.55,112.55,112.55,112.55,112.49,110.85,111.09,111.72,112.22,113.68,111.83,112.59,112.2,113.57,113.58,113.71,113.81,113.37,113.72,111.76,111.76,111.26,110.44,110.21,109.82,108.23,108.32,109.37,108.69,108.94,110.22,110.24,110.2,110.24,111.2,111.5,109.26,109.32,109.2,108.33,108.88,110.39,110.94,112.49,112.69,112.9,112.78,112.91,113.39,113.19,113.56,113.96,114.45,114.33,112.56,112.59,112.58,112.81,111.72,111.38,110.79,112.94,112.2,112.2,112.68,111.71,111.71,110.78,110.33,106.72,107.14,105.82,105.77,106.19,104.75,104.1,104.34,104.8,105.01,104.9,104.13,104.12,104.24,102.93,103.94,103.92,105.6,105.41,105.54,105.54,105.65,107.16,107.59,107.41,106.77,106.52,106.36,106.86,108.42,108.7,108.49,108.53,108.41,108.51,109.38,109.28,109.19,108.68,107.26,108.12,108.04,105.76,105.43,105.84,107.03,107.38,107.37,107.92,106.91,106.59,108.12,108.12,108.66,107.6,107.53,107.21,105.44,105.92,104.89,104.65,103.57,101.28,99.8,99.24,99.4,100.36,100.56,99.57,100.37,100.37,99.99,100.46,101.62,101.75,100.93,100.86,99.31,99.83,100.63,100.15,102,102.03,101.7,103.06,104.14,104.57,105.3,105.84,106.66,106.66,106.66,107.12,106.99,107.53,108.27,108.86,108.95,109.47,108.07,108.25,106.85,107.73,108.07,105.76,105.76,105.3,105.41,106.86,106.86,105.86,106.84,107.99,108.04,108.82,108.52,107.44,107.82,109.25,108.78,108.97,109.11,109.39,109.3,108.5,108.62,109.65,111.27,111.99,112.05,111.99,111.5,110.6,111.7,110.77,111.81,113.14,113.09,112.72,111.14,109.59,110.04,111.13,110.99,111.39,110.75,109,109.26,108.77,107.96,107.63,108.91,109.49,109.99,110.38,112.28,114.25,114.11,115.94,115.87,115.9,116.3,116.12,115.35,115.35,115.8,116.25,115.69,115.69,114.34,114.5,113.59,114.69,113.98,115.94,116.98,118.19,118.75,118.04,119.24,119.44,120.34,118.97,120.54,119.06,119.06,119.06,115.3,115.77,113.56,112.05,112.26,114.47,115,118.4,117.44,116.66,117.86,118.75,118.51,119.33,119.23,117.25,117.49,116.82,115.16,110.67,111.94,110.24,109.12,105.55,106.47,106.94,109.53,110.81,108.34,103.62,104.23,101.21,97.52,94.77,91.75,89.35,85,78.48,84.15,79.5,86.77,91.71,90.32,92.07,91.54,93.26,89.14,91.3,91.25,94.83,96.43,95.26,96.72,97.66,95.85,97.45,97.45,97.31,100.43,99.3,98.22,99.19,99.93,98.56,100.36,100.97,101.66,101.66,101.66,98.69,98.69,100.42,100.21,101.06,100.4,99.78,100.76,99.89,99.94,100.59,103.1,103.46,103.86,102.24,103.48,105.27,105.4,105.66,105.67,107.58,108.72,112.59,112.81,114.45,114.51,114.72,114.95,113.66,110.97,105.52,111.29,111.46,111.02,111.59,110.83,111.03,112.91,110.16,111.6,109.49,110.3,110.37,111.79,112.59,114.45,112.93,112.62,113.12,112.26,114.14,114.06,115.1,113.91,114.82,114.52,116.24,115.8,115.14,114.46,115.59,118.19,118.64,118.87,117.88,117.93,119.34,120.76,122.6,123.09,124.75,126.42,127.07,127.33,125.72,125.72,123.2,123.47,118.77,120.57,121.82,123.49,123.73,122.62,122.96,120.95,122.01,122.67,124.61,122.88,123.53,124.99,123.57,124.65,124.62,126.4,127.34,126.93,125.23,125.38,124.4,121.62,121.94,119.12,119.55,120.91,121.86,121.86,121.86,121.86,123.46,123.83,124.98,125.02,125.02,125.68,125.85,124.67,123.62,122.8,123.1,123.94,124.35,123.57,123.97,123.47,122.79,123.33,122.06,118.77,120.49,122.9,123.59,126.61,126.85,128.31,128.43,130.4,129.85,131.15,134.14,133.84,133.88,133.96,134.14,137.23,137.94,137.16,138.67,138.91,136.28,138.78,141.24,142.43,144.78,145.65,143.13,146.29,145.46,146.59,146.32,146.06,146.71,146.5,146.32,146.57,144.3,146.23,149.32,149.32,149.62,150.15,153.31,153.31,157.48,159.9,158.34,161.78,169.42,169.78,168.5,169.49,169.28,165.57,161.66,165.93,166.98,169.44,168.21,172.21,168.05,166.85,163.98,159.32,163.61,165.81,167.45,164.73,166.7,164.99,164.58,165.26,165.26,165.26,168.16,169.04,167.05,164.39,165.77,164.17,163.75,160.34,166.39,161.43,161.43,163.35,165.51,163.1,162.25,160.81,159.8,158.89,161.86,163.88,163.11,164.34,163.04,164.24,162.61,162.5,160.95,160.32,160.88,162.6,162.27,164.06,163.45,165.17,166.87,167.31,167.72,168.04,168.1,167.09,167.06,168.98,169.62,170.39,170.29,170.11,171.15,168.06,168.3,168.46,170.27,170.18,168.35,167.87,166.33,165.54,166.81,166.81,167,168.77,171.56,168.85,166.13,163.85,165.47,164.72,166.62,166.62,166.06,166.22,165.62,167.11,166.79,166.58,167.74,168.51,169.46,169.4,170.86,170.21,170.62,170.47,168.61,169.08,170.43,170.61,170.96,172.08,171.2,171.31,169.91,171.08,171.99,172.64,173.43,173.27,172.31,172.82,171.83,171.7,172.35,173.08,172.08,170.37,168.49,169.84,171.19,170.74,172,171.24,169.29,168.77,167.76,169.88,169.95,168.34,168.64,169,169.14,166.94,168.07,169.33,171.72,171.2,170.63,169.99,168.77,167.27,166.34,163.85,163.85,161.98,162.79,159.48,157.83,159.33,162.44,163.02,161.61,161.56,162.05,165.32,165.37,163.78,165.09,165.55,164.53,163.25,160.39,160.95,161.34,162.39,162.58,161.15,161.85,161.85,161.85,161.85,161.64,161.4,161.84,159.97,157.56,158.04,155.47,155.47,152.8,150.41,152.85,152.57,152.57,149.92,151.26,153.42,154.84,154.38,155.72,155.06,154.84,154.9,155.56,157.16,155.74,155.12,152.98,153.51,155.48,153.38,154.19,153.53,153.42,153.73,152.1,152,153.74,155.3,155.19,153.37,152.58,153.79,157.16,156.12,155.71,154.35,151.64,150.29,146.99,150.88,153.44,154.36,154.71,156.07,156.45,157.97,156.72,156.45,155.72,155.81,156.61,157.11,154.13,155.14,155.98,156.8,157.73,156.98,158,156.23,155.24,155.24,155.24,155.71,153.74,152.1,153.92,152.61,153.18,155.42,154.77,152.58,151.15,150.05,148.94,149.8,148.1,146.22,142.71,142.1,137.27,140.98,140.98,140.98,140.98,142.4,144.27,142.92,143.14,145.18,146.33,145.16,142.94,141.94,144.65,145.53,145.14,145.04,143.15,143.52,139.82,141.16,142.38,142.38,142,144.55,142.44,139.03,137.59,137.59,140.99,139.92,139.65,138.24,140.23,142.35,142.69,141.29,142.43,143.68,143.1,142.58,142.58,143.26,143.54,143.98,143.03,143.72,143.64,142.17,140.09,140.2,140.11,138.75,141.38,140.74,139.35,139.26,140.73,140.79,141.39,139.97,137.43,138.1,136.34,137.9,139.83,139.42,139.14,139.35,139.35,137.44,137.44,135.34,135.25,133.08,136.06,135.45,136.86,137.18,135.17,137.55,137.97,135.5,136.1,135.57,137.06,138.81,139.62,139.62,138.03,138.62,138.62,136.13,136.34,136.5,134.64,129.91,129.26,126.89,126.91,126.05,123.83,124.59,121.32,120.29,122.9,124.52,125.67,123.21,120.98,119.73,119.72,121.7,119.04,121.42,122.14,121.41,120.12,120.74,120.25,121.26,124,123.62,124.45,125.89,124.97,125.37,125.87,125.92,126.66,127.32,127.19,126.66,127.52,128.17,128.97,128.87,129.21,127.73,129.93,130.22,130.22,130.66,129.92,129.48,128.69,127.11,125.5,125.96,127.45,127.56,124.58,125.82,127.18,124.06,123.23,123.05,123.27,121.36,121.73,121.73,121.73,125.45,123.16,122.33,121.57,120.7,121.11,119.98,118.79,117.25,114.11,114.28,111.52,111.31,110.8,110.8,113.52,113.83,114.7,114.37,114.37,112.22,113.06,111.28,113.95,114.04,115.62,114.71,113.66,113.64,114.78,114.83,115.72,117.68,116.2,117.98,119.67,119.67,118.8,119.85,121.24,122.87,124.14,122.53,127.24,126.62,126.93,126.79,124.74,124.88,123.92,122.88,123.7,124.96,124.47,122.95,124.28,126.41,126.81,124.06,123.62,122.14,121.4,121.39,122.72,121.94,121.91,123.35,121.19,121.09,120.81,119.74,119.41,121.09,118.96,119.04,119.8,117,114.64,114.64,114.12,114.04,116.56,117.3,118.75,121.96,121.91,122.23,122.36,123.57,124.46,123.56,122.83,123.58,124.28,124.28,124.28,126.32,128.21,129.16,127.07,124.94,126.49,127.57,128.33,125.56,126.24,128.24,127.95,127.47,126.71,127.39,125.23,127.63,126.33,126.72,126.63,124.42,125.8,124.81,123.63,123.97,123.97,124.55,124.59,126.39,125.94,124.2,123.67,122.34,123.35,120.34,121.73,121.45,122.9,121.88,122.22,123.7,124.35,123.77,123.2,124.59,124.84,125.25,126.82,126.17,126.71,127.42,125.16,127.34,128.53,130.3,130.78,131.17,131.41,131.5,131.34,131.44,131,130.33,129.45,127.78,127.58,128.02,128.56,128.56,129.6,128.59,128.45,128.45,129.52,129.26,128.4,128.1,127.44,127.78,128.11,128.62,129.89,131.62,132.43,132.75,132.51,132.06,132.76,132.76,134.49,133.55,133.14,134.95,135.43,135.43,135.16,134.98,136.57,135.69,136.41,135.73,135.15,135.93,135.13,134.91,133.67,134.34,133.28,134.04,134.02,133.27,132.47,133.09,135.11,134.52,133.52,132.4,130.58,130.29,132.72,133.68,134.34,136.62,136.16,135.23,135.12,134.55,134.84,135.6,135.83,134.12,135.77,135.48,136.11,138.23,135.39,134.5,134.39,133.77,133.09,134.53,134.08,133.49,132.45,132.45,130.46,130.05,129.33,129.5,129.84,129.62,131.46,130.06,130.95,131.44,131.9,131.83,133.22,134.3,134.01,133.05,132.61,132.48,132.94,132.14,132.32,134.36,135.86,134.16,133.43,133.4,131.15,130.75,130.58,128.74,128.66,128.66,128.66,128.66,128.66,125.8,125.46,125.6,125.6,125.67,127.89,129.5,128.29,127.31,128.91,129.49,127.11,125.22,124.25,125.4,124.64,121.19,121.5,121.67,120.33,121.97,124.11,125.33,131.6,128.89,127.59,128.1,127.5,127.32,128.61,131.52,131.65,130.77,131.62,132.54,132.64,132.68,131.53,131.4,132.92,132.56,133.28,131.85,132.38,131.08,131.32,131.01,132.56,133.08,133.8,132.59,134.42,135.47,135.27,135.45,137.88,137.35,137.5,137.5,138,138.8,140.98,140.98,141.99,138.31,137.07,136.74,136.09,135.4,134.16,134.01,133.19,133.6,131.82,128.43,128.83,131.13,130.99,131.91,131.24,131.45,131.62,133.04,132.9,132.41,134.84,139.18,137.5,136.97,138.72,139.13,139.13,139.13,140.74,138.89,138.31,140.01,142.12,140.56,140.21,140.85,141.21,139.99,138.92,140.51,140.03,140.03,142.2,140.82,140.29,140.52,142.44,141.12,142.21,142.97,144.4,141.53,142.29,140.72,143.08,147.15,146.75,146,147.52,147.32,146.98,147.53,147.39,148.21,145.6,147.92,146.33,146.7,145.82,145.82,145.99,144.63,143.86,140.46,138.93,141.4,138.85,140.55,140.19,143.19,140.4,142.17,143.54,143.79,143.79,143.47,143.18,143.18,146.81,147.32,145.25,146.13,146.1,146.12,146.12,147.52,145.94,147.16,146.32,146.26,146.35,144.17,146.17,146.23,143.72,141.26,141.07,143.93,142.76,144.31,144.31,146.26,144.71,144.81,146.15,147.58,148.07,147.23,148.75,150.83,151.53,149.99,149.01,149.59,150.83,150.54,151.23,151.36,150.12,150.92,153.01,155.74,155.35,155.87,155.79,156.94,154.49,155.1,155.68,154.2,153.19,151.18,149.58,150.3,149.12,146.21,147.36,149.15,147.63,149.84,149.86,143.81,130.69,134.58,137.47,136.53,138.43,140.04,140.6,141.92,141.92,145.36,143.95,145.31,145.01,145.36,144.89,144.26,143.57,143.85,141.81,142.38,142.59,141.3,136.52,136.23,134.83,133.97,133.3,132.18,135.41,135.35,135.35,135.35,135.35,135.19,135.73,136.17,137.68,135.69,140.37,139.38,135.77,135.77,134.18,134.18,134.58,136.79,135.56,135.56,135.95,136.04,137.73,138.25,136.75,136.94,136.03,136.5,134.72,136.36,135.03,135.22,136.76,137.16,135.86,133.63,132.91,135.31,134.47,134.14,134.24,133.78,131.78,128.9,125.56,125.11,126.23,129.34,129.21,129.57,129.76,130.89,132.57,132.16,130.87,130.53,128.17,128.12,130.52,128.61,127.54,126.83,123.55,126.33,127.54,129.58,130.15,129.8,128.09,129.85,126.96,125.36,127.19,127.35,127.35,126.59,125.64,125.16,125.16,125.14,127.59,130.56,130.31,131.91,132.08,131.75,130.08,130.25,130.34,132.21,131.96,131.51,131.71,133.41,131.73,132.61,132.61,132.61,132.61,132.61,131.28,127.81,129.45,130.93,132.53,131.49,131.73,132.58,132.8,134.31,134.98,135.91,136.98,139.62,138.68,138.59,137.79,136.86,137.56,136.44,131.64,131.64,131.54,132.75,134.02,133.27,133.42,131.91,134.25,134.45,134.21,137.12,136.98,138.17,139.21,139.87,139.11,138.26,139.8,137.94,135.06,130.9,133.19,132.42,131.11,129.43,121.92,122.09,119.93,128.02,126.93,128.12,129.22,127.41,128.5,129.31,129.69,129.41,131.51,131.42,132.66,132.75,133.52,133.4,133.4,133.42,133.42,133.42,134.41,134.47,134.48,136.68,136.72,138.54,137.5,138.01,136.48,136.66,137.59,135.79,135.97,138.66,138.34,140.34,142.98,141.62,141.65,141.65,145.67,148.28,148.28,150.83,151.53,153.5,153.83,152.52,155.22,155.63,157.07,157.24,159.62,159.22,164.52,165.21,163.69,162.53,163.27,163.93,163.21,165.77,162.54,162.65,165.88,166.2,168.72,168.58,170.32,171.22,169.79,169.98,169.77,171.13,168.57,169.35,169.35,169.65,170.67,171.64,173.2,172.72,165.68,167.29,169.83,169.61,171.44,170.7,170.63,169.98,172.06,171.93,171.93,169.02,167.83,166.84,167.14,168.75,170.87,169.11,169.46,170.05,169.39,166.71,168.61,169.48,170.25,170.46,171.25,173.78,177.23,178.79,182.23,182.98,186.21,183.91,187.19,186.45,188.36,189.63,189.18,189.28,184.31,187.15,186.68,188.78,194.31,194.31,194.31,194.31,194.31,194.31,199.65,197.64,195.68,201.06,206.53,206.94,210.8,210.8,213.68,211.23,216.6,222.77,220.34,225.07,226.52,228.2,235.9,229.17,222.66,223.83,219.74,226.56,228.96,231.06,231.82,221.88,227.09,219.14,217.64,222.19,212.8,212.98,214.48,220.29,221.86,218.17,218.15,222.79,224.78,224.37,228.73,232.02,230.68,230.58,228.47,231.53,226.24,221.13,225.5,222.76,223.84,229.48,230.24,230.07,230.07,232.38,238.53,238.64,238.64,245.8,255.48,259.7,261.68,261.56,263.16,264.98,268.07,270.06,274.24,277.49,281.16,279.01,281.55,284.45,286.41,283.56,293.44,298.79,301.5,302.61,285.69,306.99,311.26,298.09,294.61,307.54,307.47,310.62,321.46,320.79,320.79,320.79,320.79,330.89,338.51,340.84,349.26,355.94,371.76,367.56,367.56,338.44,298.03,327.34,326.4,305.32,324.11,328.46,325.88,320.14,325.61,331.15,349.93,339.61,339.66,316.96,325.93,330.29,318.55,317.09,307.3,293.22,320.5,305.06,314.39,319.71,323.36,347.66,340.94,346.07,342.92,353.25,360.97,369.34,366.8,368.51,378.95,379.84,384.21,382.73,391.97,393.43,396.4,390.72,390.72,413.37,413.37,444.86,452.83,453.34,477.08,466.04,480.51,489.57,457.76,461.27,445.96,443.24,482.5,482.82,482.82,496.41,511.5,509.03,528.82,551.3,554.18,554.18,543.28,510.78,467.27,509.35,483.25,484.99,508.53,535.68,548.08,558.02,574.66,574.76,581.74,520.5,539.37,572.66,538.14,532.64,539.81,525.88,480.3,511.68,509.25,482.64,456.18,460.65,471.27,424.83,430.13,458.35,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,425.46,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64,411.64],"Nikkei225":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.49,100.75,101.13,101.34,102.75,102.45,102.74,103.52,103.68,103.35,104.01,103.88,103.98,102.15,102.15,100.78,102.4,102.37,96.88,103.4,103.58,105.36,105.33,106.49,106.49,107.11,107.94,108.28,108.28,109.3,109.58,109.44,109.14,109.15,110.37,109.85,108.95,109.46,110.27,111.87,113.25,114.19,114.76,114.78,114.9,115.66,115.6,116.22,115.92,115.82,115.82,115.63,115.67,115.66,114.13,113.95,113.95,113.95,116.81,116.37,115.98,115.98,115.07,115.44,114.07,114.98,113.84,112.16,112.64,113.7,114.09,112.62,112.01,113.61,115.67,116.06,115.47,113.52,114.15,112.76,112.78,113.13,112.74,113.31,112.72,115.53,116.01,114.69,115.88,115.34,114.67,114.77,115.54,115.53,115.48,114.96,113.91,113.98,115.62,116.64,116.07,115.53,115.32,114.78,115.17,116.87,117.05,116.9,116.71,116.79,116.38,116.38,115.99,113.52,113.78,114.83,113.18,114.48,114.57,113.65,112.73,113.17,112.14,112.44,110.87,111.27,112.06,111.77,110.6,109.85,109.31,109.43,109.8,109.88,109.87,111.01,112.53,113.74,114.99,114.77,114.44,115.12,115.93,115.93,115.93,115.93,118.61,118.29,118.63,119,118.54,118.45,118.75,118.13,116.57,116.79,117.31,116.92,117.7,118.12,117.36,117.34,117.31,117.15,118.4,120.29,120.25,119.11,119.14,118.69,119.31,118.69,118.63,118.54,118.23,118.89,119.63,120.6,120.06,119.89,120.02,120.14,120.57,120.01,120.54,119.43,119.56,119.42,119.72,119.2,118.81,119.71,120.4,119.82,119.83,119.94,119.94,119.23,119.35,120.09,119.83,119.09,118.96,119.53,119.71,118.99,118.78,119.15,119.71,119.4,118.95,119.56,119.21,117.67,117.62,117.62,116.47,117.76,117.62,117.46,116.07,115.61,115.56,115.86,115.38,115.97,115.95,115.43,116.29,117.12,117.39,116.3,115.57,115.4,115.63,114.91,116.52,117.9,118.43,118.08,118.69,118.69,121.02,121.08,121.3,121,121.6,121.2,120.82,121.4,121.35,121.62,122.89,122.97,122.98,123.35,123.35,124.14,124.48,124.92,126.12,126.72,127.2,127.36,127.87,127.92,129.35,129.99,129.41,129.6,131.2,131.22,131.22,133.66,134.37,134.37,134.42,136.74,136.6,136.33,135.22,133.42,133.42,131.32,133.25,133.52,132.71,133.64,134.27,134.27,134.44,134.11,134.05,134.71,135.48,136.04,135.37,134.86,132.21,134.12,135.99,136.75,136.32,135.67,135.29,134.45,136.53,136.33,136.47,136.32,136.54,136.75,136.48,136.59,135.83,135.71,135.71,135.71,140.13,141.37,141.37,142.18,141.81,141.35,141.01,141.38,142.79,142.29,141.67,141.93,141.98,143.82,142.72,141.11,140.88,140.87,138.86,137.7,140.01,138.75,135.22,128.83,129.04,130.5,127.47,127.47,126.65,126.11,127.96,129.49,132.04,130.71,130.98,129.58,130.51,132.07,133.48,131.56,129.51,126.27,125.44,127.68,126.7,127.39,127.99,130.1,130.96,129.83,129.98,129.22,128.06,127.46,127.46,128.72,122.91,123.8,127.08,125.38,126.14,127.9,127.51,126.93,127.1,129.04,128.58,129.24,129.93,129.29,129.13,129.83,130.17,130.24,132.1,132.29,132.12,131.68,132.81,132.44,133.06,133.94,133.94,134.18,133.97,133.97,133.97,133.94,134.19,133.59,134.12,135.68,136.32,136.03,135.43,136.15,136.7,137.13,136.88,135.27,133.76,133.84,134.02,133.29,131.26,132.36,132.17,133.99,134.37,134.88,136.06,135.29,135.95,136.39,136.91,135.56,136.23,135.21,132.81,134.46,135.29,134.23,133.17,133.19,132.77,132.77,132.97,130.03,129.87,129.47,128.45,129.89,131.46,132.33,130.75,132.27,134.71,134.71,135.31,135.89,135.71,135.31,133.52,134.2,134.82,134.65,135.4,134.4,134.45,135.6,134.21,134.28,134.18,135.1,134.99,134.72,132.93,130.3,133.28,132.37,132.3,132.77,132.34,132.46,133.31,133.6,134.74,135.92,136,136.21,136.34,136.31,135.37,135.31,134.62,134.06,132.98,133.38,135.12,134.76,136.05,137.68,137.68,139.62,141.12,141.14,142.3,142.3,142.72,143.28,141.86,143.79,144.54,144.69,143.74,142.93,141.79,141.79,139.91,140.13,134.68,135.29,132.77,134.43,136.17,135.08,134.33,134.82,131.22,131.7,126.79,126.29,126.08,127.92,130.68,129.29,132.61,130.55,132.03,131.66,134.06,132.65,132.76,130.02,130.24,129.98,129.25,130.09,128.67,128.22,129.05,129.05,130.03,130.87,132.21,132.72,133.25,134.58,131.37,130.67,128.18,129.24,126.5,126.07,128.79,130.06,127.43,128.21,125.88,125.12,121.57,120.22,120.22,114.2,115.22,119.69,119.32,119.32,119.32,119.32,116.62,119.46,120.45,121.78,120.21,121.37,121.37,122.54,121.87,121.63,123.2,123.52,122.94,122.77,122.66,123.84,123.1,123.19,122.55,123.84,123.93,124.5,124.26,124.44,123.71,121.22,121.22,124.38,126.05,126.02,124.6,126.87,127,127.76,127.96,127.73,128.34,127.87,128.51,127.49,128.78,130.09,129.52,128.75,127.91,125.34,125.94,128.19,126.92,126.9,127.88,128.68,128.57,128.82,128.82,128.93,125.06,127.75,127.45,125.39,126.42,128.23,128.2,129.44,129.51,130.01,129.73,129.98,129.29,129.43,130.38,132.16,132.47,132.81,131.69,132.35,132.45,132.7,132.35,132.99,132.7,132.7,132.7,132.7,132.7,132.7,132.7,130.7,128.78,127.59,127.25,126.33,125.59,126.32,125.57,126.68,126.99,126.82,126.88,126.09,125.89,126.28,126.74,125.21,124.85,122.81,121.68,121.67,123.86,123.84,124.5,125.99,126.41,125.97,125.38,125.89,125.93,125.03,127.18,127.95,126.73,126.9,126.35,125.71,127.21,126.84,129.54,129.69,129,129.38,129.64,128.38,128.56,128.37,129.03,129.28,129.28,128.38,127.99,125.47,127.98,127.68,128.89,129.42,129.7,129.12,128.87,129.42,128.3,128.42,125.71,123.52,122.72,122.31,122.77,123.31,123.31,121.95,123.14,121.65,121.73,122.59,123.27,122.92,122.97,123.47,120.79,121.95,122.09,121.98,123.43,122.93,122.96,123.1,125.7,126.38,127.09,127.53,128.76,129.72,131.08,131.08,131.16,130.92,131.42,131.62,131.62,131.74,131.27,131.44,130.43,129.7,130.47,129.83,127.23,127.64,127.43,128.7,127.91,128.48,129.95,129.95,132.39,133.97,133.85,134.09,134.43,134.43,134.88,135.63,135.92,136.32,136.96,136.18,136.68,136.23,136.23,138.62,138.93,139.08,139.45,139.09,140.22,139.02,137.96,138.92,139.6,138.86,138,137.34,137.79,138.86,139.34,139.72,139.55,138.87,140.27,139.38,137.92,138.9,139.23,139.68,139.56,139.45,139.65,143.21,142.79,143.47,142.69,142.27,141.98,142.01,142.07,141.78,142.63,142.11,141.03,141.03,141.03,141.03,138.34,140.55,138.34,141.53,142.19,142.19,143.23,142.58,142.68,143.32,143.57,142.27,143.26,141.86,142.05,139.16,138.4,139.38,136.98,138.34,136.95,137.62,139.02,142.32,142.05,141.2,141.2,142.25,142.05,141.21,140.23,138.27,139.5,139.97,139.42,139.42,134.76,133.69,130.84,126.04,127.24,125.69,125.79,127.15,123.7,117.43,118.44,115.75,110.64,103.92,101.36,101.41,99.72,98.68,98.68,100.68,107.86,116.53,111.27,115.59,113.78,112.77,107.7,106.23,106.24,110.74,112.97,115.37,115.33,116.24,113.53,117.08,116.55,115,118.62,117.26,114.94,114.09,115.83,114.83,117.94,117.87,117.87,120.39,116.96,116.96,116.96,116.96,117.29,120.3,121.56,121.42,120.82,118.72,119.45,120.03,121.81,122.78,122.52,121.54,123.65,126.81,127.69,130.65,130.43,131.53,133.09,134.81,135.3,136.3,138.18,137.66,137.86,133.97,132.97,128.36,134.62,133.87,133.27,134.01,133.76,134.43,134.34,132.7,134.21,131.12,132.87,131.88,132.02,132.98,135.41,134.82,133.77,134.31,132.89,135.83,134.65,136.79,135.75,135.31,135.43,136.42,135.63,135.63,135.63,135.42,135.07,133.52,133.18,129.42,132.32,134.57,134.22,133.65,133.12,133.12,135.63,136.18,138.6,138.84,137.69,137.42,137.77,136.4,136.64,137.03,138.88,138.85,138.36,136.42,137.95,137.94,138.59,139.89,138.34,137.65,138.75,137.31,138.52,139.54,140.45,139.83,139.95,139.02,139.26,139.26,139.26,139.18,137.64,138.33,140.17,140.33,138.22,138.22,137.29,138.98,139.7,139.64,140.97,140.81,140.45,140.7,140.85,140.14,139.56,141.12,140.5,140.93,139.94,140.19,140.06,140.01,139.61,139.09,136.98,138.88,138.88,141.26,143.7,145.02,148.08,148.48,151.12,152.14,151.34,154.44,155.09,153.38,152.82,152.18,152.18,155.99,156.77,158.2,158.84,157.58,159.69,159.77,159.82,159.48,158.26,157.78,159.88,159.51,158.89,159.37,159.1,159.51,159.81,159.55,159.26,157.6,158.13,158.98,158.91,160.09,164.35,163.61,163.61,162.5,161.91,161.29,163.88,167.75,167.75,167.9,169.64,171.09,170.02,168.37,170.7,170.04,171.43,170.69,171.82,170.18,170.71,168.1,164.92,167.47,169.08,170.78,168.96,171.57,175.2,175.9,176.24,176.24,175.98,179.35,181.63,180.59,180.25,178.95,179.78,179.78,176.89,179.85,172.68,176.84,175.32,176.22,172.47,172.08,171.35,173.05,173.1,174.15,177.16,177.46,178.38,178.33,180.14,177.61,173.92,172.86,169.34,171.27,173.94,175.18,175.46,173.95,175.2,177.98,179.38,177.04,177.24,177.11,177.46,176.1,177.36,176.59,176.72,176.96,176.97,173.48,169.95,174.01,173.01,173.64,172.84,173.21,173.21,171.77,171.77,171.77,171.77,174.86,175.02,175.97,170.55,167.8,163.63,167.43,165.88,169.35,167.19,167.51,168.82,169.1,170.23,170.75,170.2,173.77,172.05,171.78,172.56,173.23,172.54,173,172.67,172.05,172.64,172.58,173.85,175.51,174.62,172.99,172.67,166.99,172.19,172.14,172.14,173.28,173.17,171.77,171.64,171.14,171.59,170.49,170.76,169.11,167.63,166.57,170.31,171.2,170.55,168.59,166.94,164.85,163.28,164.23,164.23,164.23,165.93,166.75,164.43,165.63,162.65,165.62,164.79,164.44,165.3,165.85,165.85,166.26,167.34,167.01,166.79,164.08,163.49,164.45,162.64,161.04,163.91,165.33,165.28,165.39,164.78,165.67,167.46,169.61,170.16,173.65,176.82,178.35,179.93,178.89,181.12,181.51,182.84,181.9,180.77,181.83,181.83,177.89,176.7,176.7,180.33,180.28,179.94,176.13,175.58,171.52,169.57,165.86,164.11,165,167.21,169.89,168.3,167.76,170.21,173.29,173.04,174.17,174.41,171.15,171.72,170.5,173.52,173.47,171.81,172.24,176.74,175.99,175.99,177.62,176.53,175.91,174.59,173.52,174.54,176.52,177.52,177.7,176.99,176.45,177.33,177.5,177.5,174.69,175.86,171.4,168.62,165.86,166.54,165.45,167.1,166.49,169.64,172.05,171.25,169.53,170.74,169.5,169.66,173.28,170.18,166.55,170.01,170.27,171.68,171.59,170.96,173.3,172.33,171.64,171.64,171.64,174.68,174.86,169.83,169.78,169.78,168.25,171.49,169.84,167.66,168.91,168.46,163.75,165.57,164.07,164.47,161.74,161.03,156.01,159.28,160.97,161.43,164.14,162.4,163.58,162.44,162.66,164.42,165.11,165.11,161.44,160.16,163.71,162.35,161.69,160.43,157.68,157.68,154.83,157.84,158.14,160.04,157.34,158.44,154.91,150.36,147.79,147.35,153.15,150.01,150.87,151.1,153.58,158.89,159.93,159.93,162.3,167.16,167.58,167.82,166.59,168.43,167.09,165.86,164.93,165.35,165.66,163.05,160.3,160.88,159.9,157,160.03,161.99,161.52,159.77,160.87,162.26,164.26,161.59,158.52,159.17,157.3,160.05,160.05,159.88,159.88,159.88,159.88,160.98,156.9,156,156.27,153.5,157.55,158.26,158.93,160.43,157.4,159.41,160.97,159.46,159.04,158.61,159.66,163.16,162.63,163.69,163.43,165.5,166.42,166.59,168.32,168.39,165.88,160.89,158.75,156.94,157.57,154.78,153.64,156.47,155.89,156.02,157.93,160.19,161.26,159.8,157.34,154.62,155.92,157.52,155.64,157.92,158.08,159.84,157.01,157.85,158.84,159.7,159.7,160.73,165.02,165.75,166.41,165.13,164.87,165.23,165.82,165.74,166.88,164.51,165.38,166.52,167.97,168.41,166.92,165.85,165.85,170.18,172.12,172.1,174.21,172.54,172.47,171.66,169.62,168.79,169.78,170.75,166.2,168.09,167.47,164.9,164.84,164.65,164.7,163.53,167.31,168.2,170.15,170.59,165.84,166.18,164.35,164.35,165.07,162.83,161.88,161.88,157.57,158.41,156.04,157.52,154.63,156.29,160.91,161.68,162.82,161.65,161.65,157.39,157.37,156.41,161.5,159.62,161.89,162.5,161,160.31,160.81,162.45,163.54,163.02,161.59,164.46,165.01,164.92,164.92,162.15,164.11,166.16,165.23,163.62,168.49,166.7,166.86,167.09,166.51,166.33,166.59,167.61,167.61,169.21,168.61,167.89,167.09,166.74,168.27,165.6,165.85,166.24,165.05,164.39,166.33,165.98,166.65,167.85,167.23,164.1,162.38,158.39,157.31,158.03,156.4,157.42,157.67,157.03,155.56,155.56,155.56,155.56,153.31,153.93,154.84,154.84,156.05,157.66,157.68,155.71,153.94,155.83,159.72,157.42,158.3,160.4,162.74,163.32,163.12,163.24,163.54,162.91,163.03,163.36,164,165.1,165.05,164.58,164.44,164.96,163.51,164.55,163.95,165.11,164.02,164.13,163.78,161.58,161.58,163.66,163.49,163.62,164.04,163.94,166.49,168.34,168.77,169.57,170.64,167.78,165.93,162.28,162.33,161.02,162.95,160.64,160.64,163.74,163.46,163.26,163.8,164.05,166.23,165.63,167.17,168.04,168.64,165.81,163.78,164.05,164.74,166.47,167.42,167.86,169.86,169.99,170.85,170.54,170.84,170.29,170.46,170.62,169.41,169.65,172.03,173.62,173.83,173.83,173.83,173.83,172.59,174.33,173.61,173.64,175.2,176.62,177.91,179.4,182.27,183.66,185.32,184.56,182.92,183.62,184.31,186.2,186.76,184.14,185.69,187.93,192.06,193.79,190.25,188.63,192.35,193.36,196.84,199.73,199.62,200.94,198.94,199.05,200.16,198.31,195.43,194.93,193.98,197.89,198.13,197.86,201.22,199.25,198.75,195.38,193.08,191.9,191.98,190.43,193.27,193.1,193.1,193.71,196.11,193.69,192.58,194.95,194.84,194.75,196.08,195.29,197.76,199.57,194.99,191.72,191.92,192.29,193.02,191.99,193.59,193.59,191.13,192.19,189.38,188.54,187.49,188.18,189.91,190.83,192.48,188.53,191.78,192.12,192.76,194.46,195.01,196.37,196.95,198.17,196.68,194.39,193.56,195.4,194.98,197.73,199.91,199.91,198.18,196.87,194.17,193.17,194.81,192.65,192.99,190.01,189.92,189.34,186.23,181.99,185.26,184.78,184.78,189.26,190.39,193.72,192.65,188.74,191.01,191.02,187.37,186.35,184.8,185.18,186.42,182.43,184.76,183,183.97,188.39,190.47,190.47,194.99,192.39,191.76,194.62,194.16,194.26,194.92,199.83,199.26,200.22,199.04,198.84,199.42,199.42,200.46,199.4,199.16,198.65,199.63,199.3,198.11,195.39,199.39,195.89,192.6,195.49,195.8,196.29,194.86,196.55,195.29,198.04,200.76,197.57,197.74,198.24,198.55,200.79,199.95,199.5,199.5,199.5,198.45,198.98,198.98,201.28,205.33,208.95,212.09,214.03,212.34,211.5,211.43,214.4,217.88,217.7,215.96,216.02,213.13,214.78,215.01,216.32,214.68,215.56,216.73,215.57,215.33,219.76,219.96,219.96,226.32,224.77,227.48,229.44,229.34,228.71,228.1,233.09,233.09,233.89,233.93,233.74,233.49,237.93,239.11,239.04,239,236.07,236.61,231.43,231.29,230.69,231.35,230.76,236.91,238.48,238.48,243.32,243.76,240.93,240.83,243.01,239.46,240.66,237.29,237.5,235.19,237.11,232.45,234.57,237.11,235.97,235.14,235.62,233.89,229.35,226.31,227.01,220.98,223.19,223.87,229.28,224.32,226.15,226.15,228.96,228.17,227.95,227.95,227.95,231.52,227.74,226.98,227.9,227.61,228.66,228.84,232.02,231.23,232.91,232.18,230.22,233.11,230.39,231.9,231.64,229.86,226.86,229.45,232.04,231.53,229.46,230.73,230.62,232.73,233.3,231.76,230.83,231.39,227.15,229.41,229.94,230.31,230.09,231.33,233.53,236.48,234.54,235.98,236.26,238.91,241.92,243.91,243.9,243.12,247.88,249.38,251.72,245.56,245.56,246.06,245,239.21,238.84,236.07,236.04,233.42,225.76,224.56,229.33,229.67,233.11,227.29,214.08,187.54,206.72,209.19,207.65,208.8,208.8,216,217.25,218.95,226.91,222.89,226.91,226.25,227.8,228.71,227.19,228.26,228.75,228.7,230.4,230.72,230.63,220.86,218.53,216.95,215.9,215.56,212.35,219.58,218.08,218.08,215.83,216.88,221.5,224.89,224.89,226.18,225.76,232.06,237.44,226.06,230.42,225.4,229.83,230.33,234.48,232.13,234.16,234.77,236.11,236.11,237.93,233.57,231.97,232.39,232.23,228.99,227.16,227.39,226.02,230.15,231.93,234.15,232.98,226.86,226.86,229.37,235.36,234.77,235.48,235.68,234.74,230.84,229.73,230.37,227.85,229.01,228.64,226.69,228.23,231.19,229.17,227.34,228.62,227.78,229.6,233.98,234.15,234.86,233.04,233.46,234.69,234.72,237.56,235.3,235.23,234.67,232.99,231.39,230.72,233.46,232.72,233.28,235.89,240.14,237.83,237.83,237.83,237.83,234.33,238.96,238.35,236.11,233.63,233.63,229.37,229.19,229.95,229.23,231.92,232.67,236.35,238.22,238.06,235.87,232.6,234.97,235.56,235.91,229.64,231.3,231.49,232.9,231.23,231.31,231.31,232.28,235.25,233.39,233.54,234.11,233.48,230.58,231.17,231.17,227.96,227.39,228.07,221.5,225.26,222.55,223.07,224.78,219.9,220.74,219.34,219.5,219.32,220.89,222.94,225.62,225.06,225.06,224.61,224.2,225.23,226.7,225.35,221.29,212.33,212.38,212.98,207.08,201.38,185.62,196.81,189.06,206.32,200.22,202.59,204.29,202.22,204.94,207.05,204.36,204.01,207.87,208.89,212.86,213.66,213.66,214.89,217.31,219.57,219.57,219.57,219.26,220.15,223.58,224.42,227.63,227.3,225.08,225.07,223.55,223.73,222.36,220.49,221.53,223.75,224.89,224.88,229.12,226.33,223.38,223.24,225.03,223.88,225,227.07,227.8,229.05,227.57,225.55,228.39,229.74,231.81,229.45,228.94,228.65,231.25,232.15,235.98,239.36,241.37,238.38,237.04,237.18,237.33,236,236.61,237.4,236.35,235.9,235.24,236.54,236.45,237.87,237.38,237.38,237.12,245.44,249.35,247.14,244.41,242.48,242.36,244.84,243.23,240.19,241.74,243.2,244.78,249.31,249.31,254.67,257.98,254.25,258.6,260.6,259.6,255.68,254.02,254.16,255.2,252.74,253.49,255.32,254.67,251.51,252.23,250.02,253.84,256.46,260.18,259.08,261.34,264.53,266.89,266.89,267.69,267.02,270.08,268.54,271.21,271.21,272.03,272.77,270.38,268.53,267.87,265.59,267.89,272.86,285.82,285.86,284.57,289.61,286.68,286.68,279.28,284.2,287.81,283.66,293.22,294,293.95,289.98,293.9,301.13,299.38,305.87,305.98,312.45,312.45,307,299.34,303.34,299.72,303.51,303.1,304.42,305.72,300.32,300.01,290.34,289.36,297.03,289.88,289.88,290.08,295.45,299.07,299.59,293.92,293.92,297.27,304.21,301.01,301.55,301.98,301.67,298.96,303.06,299.08,294.4,295.17,292.12,295.14,300.47,300.54,300.13,300.51,302.55,301.22,300.1,300.1,300.1,309,313.09,309.77,304.74,309.64,309.64,319.23,323.96,322.58,321.54,319.44,315.91,314.62,320.07,321.01,315.28,317.95,318.1,318.2,317.89,313.91,326.22,323.67,320.84,323.43,336.01,343.68,343.68,343.62,339.46,338.65,337.22,340.66,342.6,338.77,338.77,341.72,349.24,350.26,350.84,346.11,335.51,323.39,329.54,331.58,314.34,323.4,328.03,324.62,320.85,320.44,320.14,329.31,318.18,318.18,307.11,311.5,320.43,319.56,318.18,309.32,304.42,320.37,312.76,316.7,318.43,318.52,335.68,333.22,339.35,336.84,345.04,346.57,354.82,348.61,350.69,353.81,355.22,352.57,356,360.89,357.2,357.2,353.43,354.79,354.79,354.79,354.79,374.59,373.87,372.11,374.04,377.2,373.51,366.09,362.56,360.97,356.53,367.73,377.6,388.44,387.48,387.5,385.67,395.42,399.03,397.84,407.78,402.23,396.97,381.68,389.98,382.61,382.83,393.58,413.24,413.76,416.72,423.59,424.76,431.34,416.04,412.39,431.41,413.5,414.14,417.68,420.14,409.75,415.78,415.74,406.92,398.34,403.86,408.71,400.87,403.85,409.86,398.44,382.38,382.38,394.84,394.15,395.98,385.18,387.09,371.79,366.24,368.82,383.7,380.08,381.28,395.25,391.57,391.12,399.24,399.24,402.55,407.22,409.64,412.66,402.17,389.44,394.75,393.56,390.65,392.6,395.02,394.25,395.88,395.32,394.74,383.48,382.82,387.62,395.84,389.1,388.35,389.11,381.61,378.51,378.46,381.08,382.35,387.61,387.61,387.61,387.61,390.56,395.63,392.73,390.37,397.95,411.09,407.23,416.99,421.38,417.52,411.6,411.53,411.53,402.45],"S&P500":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.02,99.72,100.33,100.55,100.41,100.4,100.88,100.5,100.32,100.02,99.71,99.7,99.02,98.38,97.94,97.78,99.95,100.33,101.44,101.64,101.5,101.48,102.24,102.08,102.56,102.31,103.08,103.3,103.38,103.38,103.79,103.24,103.38,103.11,102.74,102.79,103.38,103.74,105.1,105.33,105.95,105.83,106.53,105.66,106.07,105.89,106.1,106.48,106.22,106.02,106.15,106.15,106.39,105.5,105.47,104.98,104.98,105.87,106.48,106.4,106.77,106.39,106.39,106.69,106.47,106.66,106.66,106.35,106.53,106.15,106.51,106.22,106.92,107.78,107.7,107.6,106.96,106.86,106.89,106.95,107.73,107.5,107.53,107.6,108.22,108.61,109.18,109.61,110.16,110.07,110.25,110.25,110.92,110.8,110.84,111.01,111.12,110.84,112.35,111.69,111.75,111.38,111.06,110.81,110.89,111.26,111.3,110.92,111.85,111.67,111.52,111.3,109.92,110.12,110.01,109.91,109.8,110.6,110.72,111.04,110.79,110.61,110.67,110.34,110.55,110.46,110.53,110.37,109.96,109.21,109.21,110.15,109.83,109.64,110.47,110.14,111.33,112.01,111.95,112.01,111.8,111.99,112.13,111.98,112.05,112.51,112.51,112.4,112.52,112.28,112.11,112.65,112.57,110.53,110.93,111.68,112.26,112.47,112.75,113.25,113.28,113.28,113.15,113.09,113.95,114.37,114.23,113.92,114.1,114.13,114.03,113.92,114.43,114.32,114.06,114.1,115.05,114.28,114.21,114.16,114.34,114.37,113.45,114.45,113.47,113.64,113.9,113.9,114.07,113,113.72,113.83,113.74,114.57,114.78,115.32,115.31,115.38,116,115.99,115.94,115.82,116.16,116.19,116.08,115.92,115.84,116.12,116.18,115.93,116.14,116.34,116.05,116.01,114.33,114.48,115.63,115.57,115.74,113.95,113.74,113.87,115,114.61,114.37,114.56,114.62,114.71,115.24,115.9,116.13,116.13,115.25,115.61,115.59,115.42,116.67,117.07,117.15,117.03,117.24,117.41,117.54,117.62,117.26,117.33,117.07,117.08,117.56,117.7,118.14,118.6,118.85,119,119.67,119.54,119.33,119.61,119.82,119.62,119.72,119.93,120.01,120.1,120.14,120.76,120.28,120.47,119.91,120.06,121.03,120.65,120.76,120.95,120.97,121.35,121.5,121.48,121.66,121.2,121.09,121.21,120.93,120.26,121.25,120.93,121.08,121.87,121.78,121.78,122.03,121.99,123.19,123.14,124.15,123.9,123.77,123.31,123.29,123.65,124.33,124.73,124.93,124.87,124.36,125.47,126.15,125.74,125.64,125.89,125.83,125.83,125.69,125.79,126.02,125.37,126.41,127.22,127.73,128.63,128.85,129.01,128.87,129.78,130.65,130.65,130.19,131.42,131.21,131.78,132.84,133.13,133.06,133.14,134.72,133.81,132.35,132.41,132.33,129.52,124.21,126.38,125.75,121.03,122.84,124.55,124.87,126.54,128.07,128.12,128.12,127.37,126.67,126.79,128.83,130.34,128.69,127.26,125.56,126.2,127.59,127.93,127.87,128.44,130.67,130.5,129.67,128.93,128.83,129.05,127.21,127.4,127.17,123.97,121.37,124.67,122.51,122.15,123.84,123.84,121.07,122.6,124.02,124.87,122.13,122.54,124.59,123.9,124.92,124.56,125.57,126.91,127.01,126.29,125.21,125.22,123.54,123.77,125.06,125.2,124.17,124.49,123.59,123.31,124.89,125.33,125.29,126.51,127.69,127.91,128.02,127.15,127.66,127.55,127.22,128.16,127.76,128.17,127.91,127.61,127.61,126.13,127.73,126.86,128.23,128.81,128.9,130,129.91,130.31,130.45,130.68,130.16,130.48,130.34,130.07,129.54,129.77,128.94,129.18,127.41,127.69,126.59,127.37,127.47,127.86,127.23,127.23,128.33,129.41,130.56,131.01,130.08,131.22,131.36,131.22,131.75,132.03,131.51,131.38,131.63,132.25,133.46,133.05,132.18,131.42,132.06,131.92,132.57,133.19,133.66,134.04,134,133.81,132.86,132.33,133.17,132.16,133.21,133.65,133.97,134.25,134.2,133.97,134.8,135.83,135.87,136.65,136.04,136.06,136.06,135.83,135.45,134.96,134.66,134.91,135.42,135.47,136.18,136.22,135.46,136.19,136.36,137.43,137.38,136.9,136.72,136.27,136.64,136.64,137.14,137.09,137.18,136.06,135.31,135.26,135.07,130.63,127.94,129.76,128.99,131.76,131.73,129.83,129.79,129.23,128.52,124.55,126.87,124.67,123.85,125.79,127.16,128.5,127.69,128.41,129.21,131.95,131.62,130.41,127.84,127.65,126.68,128.03,128.31,126.17,123.88,124.26,124.26,123.45,125.36,125.77,128.66,128.38,129.43,130.85,126.61,126.61,126.42,123.47,123.69,123.64,124.31,124.29,121.92,119.38,119.4,117.56,115.7,113.32,110.25,110.25,115.72,116.71,116.56,117.55,117.7,114.79,118.73,119.56,120.72,121.21,121.76,121.74,121.1,122.4,122.67,123.61,125.24,125.24,123.46,123.73,123.9,124.96,123.98,123.8,125.72,126.8,126.92,127.78,128.38,128.09,126.89,126.98,127.07,128.71,129.1,128.75,130.15,130.15,130.35,130.58,130.12,130.95,131.12,131.01,130.94,130.57,131.47,130.96,130.81,129.96,128.9,128.63,130.52,130.9,131.81,131.7,132.35,132.84,132.83,132.43,133.87,131.33,131.22,132.16,131.55,132.02,132.91,134.45,134.45,134.74,135.02,135.65,135.79,134.97,135.43,135.44,136.33,136.25,136.32,136.01,136.22,136.22,136.36,137.57,137.27,137.21,137.86,138.01,138.14,137.1,136.81,138.13,137.51,135.24,135.02,134.61,135.12,131.85,132.91,133.69,134.88,134.09,133.18,134.32,133.94,132.34,132.52,132.52,131.41,130.5,130.78,129.05,128.69,131.45,132.52,133.34,134.74,135.37,135.32,135.04,135.6,135.38,135.5,136.82,137.23,138.53,138.35,138.11,136.8,136.63,137.16,137.95,139,139.41,140.48,140.48,140.23,139.55,139.72,140.35,140.67,141.32,141.35,140.87,139.95,140.45,139.58,139.97,140.93,141.59,140.85,141.89,141.66,141.29,139.76,138.5,137.49,133.4,135.13,135.24,137.77,136.86,135.18,137.22,133.2,133.53,135.46,137.1,136.01,137.13,137.06,133.51,134.97,134.54,135.42,137.14,137.23,137.23,136.28,137.76,139.55,139.68,139.67,139.71,140.72,141.13,141.02,140.58,140.94,140.99,141,140.3,140.29,139.11,139.97,139.63,138.88,139.59,137.87,135.41,136.49,138.43,137.81,135.66,136.9,137.78,139.28,139.09,140.47,140.19,140.58,140.03,140.99,140.49,140.89,141.16,141.73,142.53,142.41,142.87,142.44,143.81,144.35,144.18,144.28,144.67,145.04,144.76,144.98,145.09,145.21,146.33,146.4,146.31,145.76,145.53,145.85,146.94,147.27,147.88,147.88,147.29,146.02,145.05,145.96,146.18,147.52,147.05,146.89,147.32,148.58,148.59,149.65,149.7,149.64,150.31,151.05,151.18,151.15,151.15,151.93,151.93,151.05,151.5,152.77,151.69,152.23,151.8,152.54,153.56,153.12,154.19,153.95,154.24,155.53,156.13,156.13,155.72,155.76,155.94,154.53,152.1,153.63,153.5,153.98,151.25,152.35,154.63,156.37,156.89,156.04,157.19,157.45,158.47,158.21,158.5,158.5,158.04,158.78,158.18,156.51,151.27,146.69,146.13,139.68,138.53,144.91,140.83,146.78,141.8,139.38,128.79,135.15,128.55,116.32,127.13,111.89,118.6,112.45,112.98,108.08,104.92,114.76,116.08,123.33,119.18,123.17,121.2,115.85,118.49,116.7,124.91,124.71,128.95,130.82,130.82,129.5,133.46,130.52,131.28,134.79,132.38,128.32,131.27,131.2,133.02,134.98,134.27,137.84,136.57,132.74,133.3,134.51,133.57,135.11,137.38,137.4,134.59,132.24,133.76,134.29,138.52,137.06,139.35,138.26,138.59,138.59,140.29,142.37,142.07,142.75,143.29,144.47,146.44,145.94,149.77,151.57,150.39,149.59,140.78,142.61,143.8,146.53,146,146.09,145.26,146.2,146.83,143.04,144.6,141.1,143.17,145.38,146.11,146.77,146.77,149.1,147.49,148.65,147.81,149.35,147.96,149.94,151.3,150.79,151.21,152.49,152.74,153.62,151.73,150.79,151.9,150.92,152.8,152.22,153.39,154.49,155.05,156.05,157.05,157.15,157.58,156.32,158.51,158.19,158.16,158.59,158.95,158.25,158.75,159.3,160.9,161.48,163.13,163.4,164.5,164.14,165.37,167.91,162.02,160.7,160.7,156.24,159.38,156.58,156.67,158.66,159.49,158.75,157.42,155.66,153.86,155.47,151.79,152.24,154.67,157.16,156.41,157.7,158.53,157.01,159.84,157.6,160.35,161.63,163.05,165.73,164.68,163.59,163.34,163.36,160.7,161.46,161.1,161.94,162.5,159.48,159,153.39,155.22,153.34,155.22,157.99,161.47,164.61,164.57,166.49,166.26,167.53,165.86,168.12,170.07,169.26,167.3,167.96,166.82,167.76,170.47,170.2,170.2,170.61,169.83,171.74,172.05,171.94,173.46,173.12,173.61,172.23,172.01,171.79,171.04,173.25,173.56,174.56,173.94,173.26,172.9,173.03,173.64,173.64,175.16,174.77,175,176.13,173.53,174.76,175.76,178.37,179.35,178.17,178.25,178.65,177.98,176.7,176.7,178.14,180.62,180.68,180.14,180.79,180.52,175.88,177.6,174.17,176.96,179.42,179.61,181.55,182.26,183.61,183.41,183.34,183.65,184.51,184.51,184.41,184.35,183.53,183.19,181.78,182.01,184.07,179.57,178.71,182.96,181.49,179.12,176.71,180.16,179.19,181.73,182.82,184.72,184.91,186.11,185.82,186.36,183.6,183.49,184.78,183.37,182.37,183.33,186.37,186.21,185.63,186.3,188.5,188.5,191.22,191.04,191.32,192.13,193.61,193.57,194.21,193.41,195.56,196.27,195.22,193.9,195.7,193.9,196.02,196.37,196.32,196.16,197.49,196.06,196.6,195.29,195.43,197.02,198.48,196.4,194.7,190.52,192.84,195.72,195.23,193.56,192.99,195.03,194.88,196.81,196.39,196.76,196.99,197.14,197.14,197.04,197.33,196.61,198.35,198.19,198.23,197.86,198.78,199.17,199.53,199.13,198.06,197.97,195.37,198.11,199.12,198.91,200.07,200.73,201.2,201.25,201.52,202.57,204.09,204.09,203.68,204.36,202.61,204.9,205.61,204.88,205.12,204.45,202.91,199.69,202.72,204.39,204.8,206.88,207.37,206.39,206.36,207.22,206.1,205.72,207.41,206.45,207.69,208.04,207.84,208.05,208.31,209.18,209.51,210.06,208.58,206.34,206.6,208.28,210.06,210.37,210.84,209.61,211.45,212.37,212.08,212.14,212.75,212.68,212.68,211.95,211.67,210.7,209.07,209.55,208.34,210.11,209.78,207.87,204.34,204.18,206.12,208.62,208.93,208.35,204.1,204.42,201.99,204.31,201.66,203.78,204.62,206.31,205.92,204.51,204.01,204.63,208.12,209.67,210.38,211.94,212.71,213.35,213.12,214.13,214.52,213.44,215.54,215.96,216.35,217.14,218.54,219.46,220.28,220.47,219.7,217.89,218.01,219.59,219.59,220.44,219.86,220.61,220.3,219.59,219.96,220.46,220.46,215.45,218.3,214.16,211.63,214.63,212.82,215.31,219.77,220.45,218.87,220.96,218.94,217.3,220.86,218.92,216.67,214.2,218.01,220.23,221.6,221.6,224.67,224.44,224.76,224.09,223.5,224.92,224.78,220.42,220.21,219.32,219,221.01,221.63,218.47,218.65,218.65,214.63,212.55,210.21,206.23,206.8,204.28,203.98,202.88,207.82,211.74,213.2,215.21,209.96,211.04,210.26,212.03,215.1,211.21,207.2,206.4,209.66,209.84,205.4,203.93,203.93,201.86,198.14,201.11,205.61,205.1,201.93,205.69,204.61,202.99,197,195.57,200.6,199.74,197.15,195.69,199.88,204.35,206.87,209.29,209.19,211.56,208.96,211.96,213.03,214.56,217.19,215.82,212.44,213.17,214.89,212.19,210.13,211.02,210.47,206.91,206.21,208.51,205.98,205.98,205.94,209.24,209.11,206.03,200.31,201.45,195.78,196.2,201.05,193.76,194.85,195.8,201.64,194.46,193.35,187.16,187.62,184.53,184.29,188.69,187.94,191.74,183.99,182.92,182.94,186.34,184.82,186.57,190.28,194.99,194.99,193.77,192.32,195.86,192.66,193.26,195.1,193,188.4,182.92,175.83,175.16,177.72,171.94,172.32,172.32,176.54,176.31,177.99,183.43,182.88,179.2,179.07,177.5,179.38,179.38,179.66,180.3,183,182.85,180.74,179.07,178.27,177.74,181.15,179.64,184.6,185.69,187.52,185.77,186.01,183.87,188.68,190.97,193.68,193.13,191.84,194.85,194.69,194.38,194.14,193.31,197.43,197.29,200.71,201.5,201.88,200.42,200.87,198.28,194.04,193.61,194.17,196.91,190.27,189,186.92,185.46,186.01,184.02,184.02,183.26,186.62,187.86,190.73,192.75,184.41,185.04,182.94,181.63,182.87,180.81,177.72,176.22,173.18,171.39,171.03,174.39,170.71,168.14,172.49,177.77,177.41,175.59,170.67,169.39,168.29,167.73,172.09,168.02,172.47,174.44,173.27,171.9,175.97,178.07,180.96,179.63,178.53,182.93,181.57,180.82,176.3,174.43,176.81,178.51,179.51,175.78,185.52,187.24,185.56,187.18,185.64,185.06,185.94,185.22,187.74,188.85,188.85,188.79,185.88,185.58,191.33,191.16,190.93,187.51,184.81,184.47,185.86,184.49,187.13,188.49,187.35,182.68,180.65,179.02,179.2,181.87,179.24,180.29,180.29,179.56,177.4,180.5,180.04,180.04,179.32,180.67,178.57,182.65,182.51,183.78,186.14,186.78,187.53,187.53,187.15,184.23,182.83,186.28,188.5,188.36,188.33,190.4,190.88,188.4,191.16,193.16,196,193.97,192.78,195.26,193.1,191.39,191.81,194.01,193.95,194.49,191.81,191.28,191.28,187.44,187.15,188.15,186.16,186.74,186.17,185.29,186.69,189.71,189.84,186.93,187.19,183.74,181.08,180.81,183.78,182.5,185.71,183.66,185.3,187.7,184.61,185.16,186.21,186.52,186.22,188.87,189.95,192.69,193.41,192.29,191.81,192.49,192.49,192.69,192.68,191.88,194.43,194.02,194.66,194.83,194.81,193.66,193.83,193.99,190.93,190.19,193.92,195.52,195.44,193.18,191.82,190.44,193.96,194.05,193.16,194.02,193.69,193.39,193.96,192.72,195.01,196.86,196.57,196.6,194.4,192.97,194.66,197.2,197.2,197.21,196,197.93,200.81,200.41,200.88,200.11,201.35,201.58,203.46,204.87,205.04,207.54,206.78,206.78,205.8,204.72,205.48,203.9,202.99,205.31,205.24,206.16,208.69,208.93,208.93,208.52,206.87,206.28,206.77,208.17,209.71,211.49,211.27,212.08,213.59,214.1,212.65,212.72,213.58,214.18,214.15,212.77,214.87,215.19,214.61,211.64,211.1,209.98,211.88,210.99,209.5,209.55,209.33,210.53,208.1,206.53,204.94,204.91,206.31,205.74,208.01,205.21,206.59,207.89,210.9,211.71,211.37,211.75,211.75,210.87,209.4,208.72,209.02,210.43,209.23,209.49,211.25,208.69,208.84,208.39,206.43,203.04,202.58,203.39,200.4,200.44,201.62,201.08,201.09,198.33,199.94,199.68,202.04,203.31,204.37,205.24,203.96,202.94,205.09,205.07,202.32,200.6,198.08,197.75,199.18,196.33,194,193.07,195.39,196.66,198.72,202.47,204.37,204.73,205.31,205.52,203.86,207.04,206.87,210.81,211.15,211.4,211.67,213.24,212.81,213.67,213.67,213.8,213.38,213.59,213.39,214.19,215.45,214.29,214.17,213.33,215.03,215.91,216.76,217.75,220.73,221.31,221.29,222.3,223.6,220.32,222.59,222.96,222.96,223.9,224.22,224.3,223.67,222.4,220.62,219.86,220.26,223.37,223.04,224.31,224.16,224.32,224.32,223.49,222.23,224.19,226.95,227.45,228.11,228.3,229.5,229.35,231.08,230.94,227.22,230.06,232.52,231.78,232.31,234.23,234.36,235.71,235.49,232.27,234.49,235.86,234.72,234.72,233.31,233.61,238.54,238.63,237.72,238.13,237.73,238.98,240.89,240.6,238.15,239.37,241.84,240.26,239.99,242.68,242.21,241.52,239.95,241.47,242.83,244.99,245.79,245.44,244.69,244.01,246.11,246.39,246.39,245.89,244.11,244.38,241.36,244.04,243.95,244.3,241.99,243.8,240.25,237.36,236.87,235.5,234.98,232.92,234.96,237.77,237.82,236.73,239.15,239.91,236.13,235.32,237.47,240.45,242.94,243.26,243.26,244.5,244.9,244.84,246.03,248.91,248.39,248.68,248.91,249.53,248.86,247.02,248.75,248.75,248.81,246.98,245.5,247.47,247.75,248.12,251.06,251.01,250.73,251.38,252.06,254.2,254.8,254.7,256.65,257.3,257.3,256.65,256.25,255.46,256.47,256.87,257.1,256.05,256.74,258.33,259.64,259.64,261.06,261.32,261.52,264.19,261.87,263.32,264.06,265.75,262.05,260,258.14,260.93,260.52,254.49,253.18,255.99,256.2,254.93,258.95,255.41,250.71,243.2,245.72,243.82,249.43,250.6,250.61,254.83,255.81,259.93,260.45,262.98,262.46,263.57,261.22,264.22,263.39,263.81,262.23,262.22,264.87,264.87,259.26,258.85,258.07,253.61,256.55,257.7,260.45,262.4,263.82,264.15,264.22,263.45,267.93,267.41,268.16,268.83,268.33,269.41,269.08,270.22,267.7,267.73,267.28,269.68,267.1,269.68,271.6,271.04,272.68,274.78,272.69,273.97,273.92,275.01,274.51,274.38,271.85,272.44,272.36,273.08,273.52,272.62,267.54,268.64,267.88,271.17,278.03,280.09,281.14,281.42,280.6,280.67,278.97,275.29,276.36,277.46,277.47,278.95,279.92,280.76,282.37,281.29,281.29,282.87,283.56,283.69,285.41,284.88,285.59,283.83,282.99,285.3,283.76,283.75,284.83,283.73,275.36,275.12,278.11,280.14,283.23,283.23,283.12,279.99,276.99,275.8,275.19,278.66,280.2,277.09,277.52,277.52,273.24,273.67,273.99,279,278.42,281.2,281.2,283.66,285.4,286.92,286.1,281.93,284.53,283.2,284.69,283.25,281.1,283.13,284.24,285.27,282.57,284.47,284.57,283.79,286.75,286.73,286.73,287.43,288.11,286.86,281.97,280.57,279.25,279.29,274.86,279.22,274.31,270.95,273.97,269.09,270.58,263.28,261.29,262.56,258.92,264.42,266.12,263.28,266.13,265.55,265.76,270.45,270.88,267.86,266.97,261.7,263.15,264.15,265.92,253.05,237.93,237.38,233.65,255.89,247.03,251.5,253.5,253.06,247.39,247.72,247.72,241.88,247.95,252.09,257.19,259.09,259.26,260.76,261.15,262.79,266.66,264.96,262.92,264.06,265.59,265.41,274.05,276.03,276.32,277.46,279.4,279.65,278.56,274.07,273.94,272.11,272.11,277.67,276.13,277.23,277.21,278.35,279.96,279.98,278.51,281.37,281.63,283.17,282.4,283.48,280.27,282.91,280.54,280.46,280.46,279.85,282.53,285.68,285.67,287.97,289.47,290.96,290.64,292.02,294.45,294.45,292.14,291.93,293.7,294.5,293.53,293.95,292.78,293.72,295.3,295.27,295.68,295.87,298.18,298.39,299.58,299.63,298.74,298.37,297.27,292.51,296.82,295.38,297.53,297.3,299.62,298.87,302.26,303.23,303.32,302.45,302.41,300.64,299.91,298.71,303.25,301.95,303.2,303.93,304.89,302.94,302.94,300.84,302.37,304.9,303.93,304.57,305.39,306.3,308.9,308.75,310.21,309.81,309.51,310.99,312.51,313.88,312.16,311.27,309.71,311.54,312.36,313.64,314.7,314.9,314.92,316.07,314.86,316.7,315.82,307.26,312.05,311.57,312.82,310.85,312.49,315.83,315.84,314.15,315.98,318.48,322.39,323.13,323.12,319.91,320.75,321.3,317.53,318.69,315.13,315.53,320.39,321.05,321.25,315.94,315.78,312.88,310.3,311.47,306.62,309.63,314.42,317.27,319.46,319.46,321.17,319.46,320.24,321.2,321.55,322.17,321.05,320.77,322.93,323.6,320.15,319.64,318.88,315.18,317.68,320.48,322.55,324.02,325.06,325.06,324.96,323.83,323.38,321,321.61,323.65,325.66,324.54,324.56,326.66,327.18,326.55,324.8,325.64,325.43,325.43,318.72,322.41,324.18,324.29,325.91,327.24,327.22,326.79,325.39,327.14,324.39,322.75,318.79,325.07,326.6,325.52,325.5,320.4,320.56,320.56,320.89,322.68,321.77,324,320.64,323.09,325.72,323.97,322.57,322.69,319.65,322.13,320.31,316.05,318.68,318,317.73,312.89,311,314.15,314.93,310.65,309.79,305.1,308.6,307.44,309.11,303.73,298.65,297.47,306.14,308.33,308.68,308.68,310.04,310.28,318.06,320.02,319.66,322.91,326.72,329.32,330.18,334.16,333.36,331.25,334.71,333.33,335.99,336.4,334.75,334.62,338.05,339.04,337.66,340.4,345.37,344.05,346.95,347.6,347.05,349.08,351.75,347.4,347.15,344.83,348.55,349.15,350.45,350.45,352.59,352.65,354.68,355.45,356.38,356.84,354.21,355.65,346.24,347.27,346.38,340.77,346.74,348.48,354.24,352.22,347.94,351.72,351.72,350.42,345.38,345.04,345.01,344.85,348.9,351.66,350.91,350.91,350.91,353.45,351.87,350.88,353.74,355.23,352.41,353.74,355.09,353.28,349.71,349.03,352.12,351.64,347.39,347.56,347.62,348.35,343.07,348.77,351.21,356.4,362.78,362.17,361.54,363.77,363.56,362.39,363.34,365.71,365.09,363.18,360.68,361.44,358.31,359.87,358.86,360,359.93,362.52,361.62,360.42,357.86,359.5,363.31,361.94,361.94,359.83,358.09,355.99,359.05,357.32,355.71,354.12,358.15,358.75,364.1,364.1,361.35,361.26,363.11,360.31,359.7,358.8,359.5,362.14,364.54,366.65,365.84,364.13,366.3,366.1,366.1],"SK하이닉스":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,101.47,103.3,101.71,97.8,97.8,100,98.05,100.24,104.76,105.01,103.66,100.12,102.56,100.12,100.49,100.61,101.34,101.34,96.83,100.12,97.31,96.95,96.95,99.76,102.32,102.56,99.51,104.27,105.13,104.15,104.03,104.03,103.54,104.76,107.94,108.42,108.42,110.38,110.5,112.94,111.11,110.62,109.77,111.97,111.36,113.31,110.26,110.26,109.89,111.11,113.06,111.48,111.48,110.74,109.16,109.16,111.84,115.38,113.55,114.65,117.22,121,121.49,126.01,123.57,122.83,120.39,120.39,119.29,121.12,120.02,124.05,126.01,126.25,130.16,130.16,130.16,131.14,131.87,128.94,131.14,131.14,130.16,133.33,128.69,122.1,123.81,118.32,116.97,121.12,123.08,121.86,124.3,123.57,122.59,116,112.33,114.04,114.04,116.48,115.02,120.51,119.17,117.22,117.22,120.15,124.54,122.83,119.17,120.02,114.16,116.24,116.12,118.8,118.32,120.88,123.81,124.05,125.27,124.3,123.32,126.5,124.54,122.83,120.63,121.61,119.66,119.29,119.66,121.49,121.61,120.15,122.59,121.73,125.52,126.98,127.96,127.96,131.14,130.89,131.87,131.87,135.29,135.29,136.51,136.51,138.95,138.95,135.78,137.73,135.04,135.78,135.04,133.58,136.02,132.36,136.75,134.55,136.26,136.26,139.44,141.39,140.17,139.19,137.73,139.44,137,137,137.97,138.46,142.37,140.42,143.59,144.81,147.99,147.74,153.36,156.29,158.24,158.73,158.73,164.84,168.99,164.1,167.28,164.59,161.9,160.68,166.06,166.3,162.64,164.35,168.5,168.25,172.41,173.63,173.87,172.89,173.38,174.11,173.87,178.27,171.92,163.13,167.03,157.75,161.17,159.95,166.06,159.95,156.29,156.53,161.9,156.78,157.26,149.94,158.97,158.97,161.42,162.15,163.61,164.1,166.54,166.06,166.3,167.03,165.81,165.08,167.28,167.52,167.77,166.3,170.7,175.09,174.36,177.29,180.22,182.42,184.86,187.55,188.52,194.63,193.41,197.07,202.93,202.93,210.74,210.74,201.22,203.17,202.44,202.44,202.44,202.44,202.44,202.44,202.44,216.61,217.58,216.12,210.26,205.62,203.91,197.56,192.92,198.29,206.84,199.76,199.51,192.19,191.45,194.87,200.73,208.3,203.66,206.11,203.91,201.22,203.17,201.22,200.24,200.98,203.66,200.24,201.47,202.69,200.49,207.57,211.97,206.84,207.81,202.93,201.71,201.22,187.55,189.01,193.16,190.23,189.26,185.59,192.19,192.19,189.99,187.55,185.59,184.86,188.52,195.85,195.85,188.03,187.3,187.3,180.71,183.39,186.81,186.81,187.06,189.74,188.28,193.65,190.96,187.79,178.02,177.29,181.68,177.53,181.68,180.95,183.64,179,173.63,174.11,176.8,185.1,184.37,183.88,178.51,179.49,181.68,176.31,171.43,171.43,173.63,180.46,179.24,181.93,189.74,189.5,189.5,189.5,186.81,184.37,187.79,185.35,188.77,189.26,192.19,187.55,187.55,189.01,191.21,201.22,201.95,203.91,203.42,207.33,219.78,221.49,218.8,219.29,219.54,218.8,215.87,216.36,202.93,205.13,198.78,196.09,196.09,198.53,198.53,199.76,196.34,202.44,196.09,196.83,196.34,198.29,205.13,205.62,205.13,202.2,206.59,214.65,206.11,206.11,200.49,201.22,211.23,212.7,206.35,206.35,202.93,202.44,202.69,202.69,203.91,203.66,209.52,210.26,208.55,206.59,212.45,211.72,214.65,217.58,217.58,232.72,231.01,232.48,230.77,231.5,231.99,228.08,223.2,219.29,222.22,222.22,221.98,215.87,217.83,215.87,215.87,210.74,212.45,205.13,205.37,214.41,216.12,218.56,207.08,205.86,208.06,203.91,209.28,204.4,210.26,207.57,210.5,208.3,213.92,213.19,211.97,209.04,216.85,218.07,216.36,218.07,220.51,214.65,199.51,204.15,196.58,202.93,210.26,209.77,210.74,209.04,203.17,203.42,193.89,197.07,194.87,190.48,183.39,184.13,185.35,185.35,182.42,181.93,182.42,191.45,194.87,198.05,199.76,203.91,201.22,202.2,201.95,202.69,196.83,198.29,195.36,192.43,185.35,186.81,187.06,183.39,181.93,189.74,188.52,190.48,192.43,193.16,187.3,187.3,187.3,187.3,183.15,178.51,179.98,175.09,175.09,170.94,171.67,173.87,173.87,171.67,168.5,176.8,171.67,170.21,171.92,167.77,172.89,170.94,168.74,162.88,158,163.61,163.13,166.54,166.54,166.79,177.29,172.16,171.18,172.89,178.02,178.02,181.93,175.58,171.92,175.34,171.18,170.45,164.84,166.3,169.23,169.23,173.14,172.89,175.58,174.6,169.96,172.16,168.5,166.54,161.17,163.13,159.95,158.49,161.66,159.95,150.92,151.89,149.21,147.25,143.1,146.52,147.5,147.5,146.76,150.43,147.74,147.74,147.99,140.9,142.37,143.35,144.57,155.31,159.46,158.97,151.65,156.29,158.24,158.49,157.75,163.61,162.64,163.13,172.16,182.17,175.34,179.24,185.35,180.46,185.35,185.35,185.35,185.35,187.3,179.49,180.95,185.35,186.08,189.01,180.22,182.42,179.98,184.86,187.3,187.3,184.13,183.64,179.98,170.94,170.94,171.18,170.21,166.3,166.3,162.88,162.64,165.32,163.13,164.35,166.3,165.57,166.06,172.16,185.35,185.84,178.02,177.53,179.24,176.56,181.2,187.06,186.57,195.12,191.45,192.92,190.23,189.99,191.94,191.45,190.72,194.63,196.34,195.85,193.41,199.76,196.58,197.8,191.7,195.85,191.94,195.36,192.92,192.92,197.07,196.34,196.34,195.12,196.09,185.59,181.68,179.49,182.17,181.93,175.58,174.85,173.14,171.67,168.25,166.06,165.08,163.37,160.93,161.42,160.93,159.46,162.64,158.97,158.97,158.97,159.71,163.13,164.1,160.44,155.07,154.09,155.56,154.82,164.1,164.35,160.93,163.37,162.88,168.25,171.43,169.72,170.94,174.36,168.74,171.43,167.03,164.59,170.45,178.02,184.37,182.42,186.08,185.84,182.17,182.42,187.55,191.45,192.43,189.5,193.41,194.87,188.03,192.67,187.79,189.74,185.84,184.13,175.82,179,176.56,179,181.93,181.93,187.79,187.79,186.57,183.39,186.57,185.1,180.22,181.68,175.34,178.27,179,179,189.01,189.5,188.03,195.36,202.69,200,205.86,202.93,201.71,201.71,201.71,194.14,193.89,195.85,201.95,200.73,202.2,203.66,200,203.42,198.78,200.73,200.24,194.14,194.14,196.09,196.09,197.56,197.56,192.92,195.36,196.58,198.29,201.22,197.8,189.01,189.26,193.16,189.74,195.36,202.44,202.44,202.69,199.02,200.24,202.93,206.84,207.81,203.91,204.15,200.98,198.53,203.17,203.66,203.66,208.06,208.79,208.3,201.95,197.56,199.51,199.51,200.98,201.95,202.2,197.56,196.58,192.19,189.74,192.43,196.83,197.07,197.07,196.83,203.66,214.65,216.36,226.62,227.11,228.57,231.99,231.01,229.06,229.06,231.5,234.43,229.79,229.79,231.26,230.77,230.28,229.55,237.85,241.76,241.51,245.42,245.42,239.8,242.25,241.76,243.96,242.49,246.64,241.03,241.03,241.03,235.16,239.07,229.55,228.33,231.26,237.12,238.58,245.42,242.49,241.27,243.71,244.2,249.08,255.19,256.41,249.08,252.75,253.97,251.53,242.98,239.32,231.01,226.62,214.65,224.91,226.62,230.28,231.75,226.13,226.13,217.58,208.79,202.2,201.47,196.83,196.34,178.51,168.5,182.66,169.47,192.19,206.35,197.07,203.42,204.4,203.42,191.45,195.36,194.38,202.93,209.52,206.35,207.57,205.37,198.78,200.98,200.98,198.53,205.37,200.24,198.53,204.88,201.71,198.78,201.71,203.66,204.4,204.4,204.4,197.8,197.8,201.22,201.22,207.57,206.35,209.28,204.15,196.83,200,198.05,201.95,205.37,203.66,198.53,198.78,200,198.78,204.88,199.02,204.15,203.42,216.61,214.16,220.76,222.22,219.29,221.73,216.12,208.06,200.24,208.55,211.97,210.5,208.55,207.33,205.37,210.01,205.86,206.59,204.15,207.81,208.3,206.11,208.55,210.01,207.08,204.4,202.69,202.2,202.69,202.44,202.69,201.95,202.44,200.73,205.37,203.17,201.22,204.4,202.2,202.93,203.17,208.3,202.2,199.76,199.27,197.07,198.05,196.83,198.78,198.53,197.8,197.07,195.85,195.85,190.72,183.15,175.34,181.93,184.37,188.03,192.43,193.16,189.99,183.39,183.64,184.37,192.19,192.19,191.45,193.89,188.77,187.06,191.45,195.36,200,199.02,200.73,204.4,206.35,198.53,204.15,205.86,202.44,201.47,205.13,205.13,205.13,205.13,203.17,202.69,203.66,202.44,202.44,208.79,215.38,211.23,212.7,208.3,211.72,208.06,204.64,203.42,204.88,203.17,201.71,202.44,199.51,195.12,194.38,198.78,203.17,210.26,210.74,210.01,211.23,212.45,215.14,219.05,239.32,239.56,239.32,239.8,236.39,244.2,240.78,237.36,242.74,241.27,238.1,245.42,266.18,272.28,280.83,288.16,280.83,294.26,284.49,282.05,285.71,286.94,286.94,291.82,289.38,283.27,274.73,283.27,288.16,288.16,282.05,283.27,289.38,289.38,307.69,318.68,319.9,328.45,337,324.79,315.02,324.79,318.68,311.36,317.46,318.68,318.68,321.12,313.8,329.67,315.02,313.8,300.37,299.15,305.25,317.46,317.46,305.25,311.36,305.25,306.47,307.69,307.69,307.69,322.34,323.57,317.46,307.69,324.79,333.33,338.22,332.11,362.64,345.54,345.54,352.87,358.97,346.76,341.88,330.89,333.33,324.79,334.55,341.88,333.33,343.1,341.88,346.76,337,337,329.67,326.01,324.79,329.67,322.34,328.45,323.57,343.1,344.32,349.21,349.21,350.43,351.65,341.88,335.78,340.66,334.55,335.78,335.78,337,338.22,323.57,324.79,323.57,321.12,329.67,317.46,317.46,312.58,321.12,322.34,322.34,315.02,316.24,317.46,300.37,291.82,286.94,289.38,286.94,295.48,295.48,299.15,299.15,291.82,300.37,300.37,306.47,305.25,310.13,313.8,307.69,315.02,313.8,313.8,311.36,299.15,300.37,312.58,310.13,313.8,316.24,308.91,304.03,297.92,297.92,302.81,307.69,313.8,307.69,305.25,311.36,304.03,299.15,300.37,305.25,301.59,296.7,291.82,293.04,300.37,301.59,301.59,296.7,290.6,289.38,285.71,291.82,289.38,285.71,283.27,278.39,278.39,274.73,283.27,293.04,295.48,293.04,288.16,283.27,274.73,257.63,245.42,247.86,247.86,247.86,253.97,250.31,250.31,251.53,256.41,252.75,253.97,252.75,252.75,260.07,263.74,260.07,261.29,258.85,255.19,258.85,251.53,256.41,260.07,262.52,262.52,253.97,261.29,261.29,261.29,261.29,257.63,253.97,255.19,252.75,244.2,251.53,244.2,244.2,239.07,235.65,233.7,229.55,229.55,223.44,224.66,229.06,240.29,237.12,238.58,239.07,235.16,240.54,244.2,249.08,247.86,260.07,251.53,260.07,262.52,257.63,258.85,261.29,262.52,266.18,264.96,262.52,260.07,271.06,273.5,269.84,268.62,272.28,291.82,290.6,291.82,286.94,282.05,283.27,278.39,284.49,293.04,288.16,289.38,296.7,293.04,301.59,294.26,296.7,295.48,301.59,302.81,297.92,294.26,304.03,310.13,311.36,312.58,307.69,311.36,310.13,319.9,319.9,319.9,313.8,306.47,305.25,310.13,304.03,312.58,313.8,316.24,313.8,310.13,308.91,310.13,305.25,290.6,290.6,288.16,288.16,277.17,294.26,294.26,294.26,294.26,302.81,304.03,300.37,300.37,300.37,316.24,322.34,323.57,310.13,318.68,324.79,321.12,321.12,321.12,321.12,299.15,300.37,300.37,300.37,305.25,315.02,315.02,291.82,288.16,288.16,288.16,288.16,283.27,283.27,283.27,283.27,302.81,302.81,301.59,301.59,294.26,288.16,288.16,293.04,295.48,288.16,283.27,285.71,284.49,275.95,277.17,273.5,272.28,271.06,275.95,268.62,263.74,266.18,274.73,274.73,275.95,269.84,263.74,271.06,264.96,267.4,274.73,269.84,268.62,267.4,267.4,262.52,262.52,268.62,269.84,266.18,274.73,269.84,274.73,277.17,271.06,274.73,275.95,264.96,263.74,251.53,258.85,261.29,263.74,263.74,261.29,261.29,261.29,253.97,258.85,257.63,252.75,241.76,242,239.07,237.85,235.41,230.77,232.48,225.15,220.27,223.69,231.99,232.72,229.55,222.22,213.68,217.58,225.89,224.91,229.3,231.5,228.82,227.84,229.55,229.55,241.03,246.64,244.2,249.08,250.31,244.2,244.2,245.42,244.2,242.74,239.07,237.12,235.65,238.1,238.1,240.54,235.16,232.23,224.18,227.84,227.84,227.84,236.14,237.12,233.7,235.41,232.48,228.57,227.59,229.79,232.23,225.89,227.59,232.48,225.64,223.93,222.47,224.18,220.76,220.76,220.76,220.76,231.5,227.11,224.66,222.71,219.78,214.9,214.9,210.01,203.91,201.47,200.24,198.29,197.31,202.93,202.93,210.5,219.29,219.54,222.71,222.71,220.27,229.55,231.75,233.21,232.48,233.94,226.86,220.27,221,224.18,228.33,229.3,219.78,203.66,201.95,204.88,206.35,201.95,206.35,211.23,214.16,217.83,217.58,228.33,221.98,223.69,223.44,214.16,215.87,210.74,208.06,208.06,212.21,207.81,202.93,204.4,207.57,206.84,200,197.8,197.8,192.67,192.43,199.02,198.05,200.98,199.76,195.85,191.45,192.92,191.21,190.48,193.41,189.99,188.03,188.03,185.59,183.15,183.15,184.86,184.62,197.8,198.78,202.93,210.01,211.23,213.19,211.97,209.28,209.52,210.01,207.81,208.79,213.92,213.92,213.92,223.2,223.2,223.44,221.49,216.12,223.2,223.2,225.15,217.58,221.73,231.75,231.75,228.33,221.25,228.08,223.93,226.86,224.66,225.89,222.71,217.58,226.37,222.22,219.78,218.32,218.32,215.14,213.19,219.05,217.09,211.97,209.04,203.42,205.86,198.05,193.16,192.92,205.13,204.4,204.15,212.21,216.12,213.19,208.79,215.87,212.21,216.85,216.36,212.94,206.35,206.59,204.64,217.58,221.49,224.18,220.51,216.61,218.07,216.12,213.92,215.38,214.16,217.58,212.94,208.79,213.43,216.85,218.56,218.56,220.27,219.29,216.61,216.61,216.61,213.19,212.21,210.74,212.94,210.99,220.76,224.42,228.57,237.61,239.8,239.07,238.58,252.75,266.67,266.67,269.35,265.2,269.35,269.35,265.45,265.45,263.74,267.89,281.81,280.34,291.82,290.11,290.6,290.35,280.34,283.52,281.07,278.39,277.41,277.17,275.95,279.12,283.76,281.32,287.18,287.91,284.98,277.9,273.02,269.35,276.92,281.81,278.63,288.16,286.2,287.67,286.94,285.47,281.07,278.39,276.92,275.95,302.81,312.58,301.34,305.49,291.82,293.04,293.28,297.68,289.62,289.38,289.38,281.56,280.59,280.59,282.78,280.34,286.2,284.25,284.49,283.27,295.24,284.49,283.03,289.62,291.58,297.44,293.04,291.09,291.58,288.64,289.38,277.66,283.03,284.98,289.38,298.41,298.9,290.6,291.09,288.16,284.49,286.45,285.71,280.83,280.1,280.1,280.1,280.1,280.1,281.81,293.53,294.02,294.02,291.82,291.09,303.3,304.52,303.05,317.46,317.46,306.96,308.18,302.81,309.65,311.36,293.04,290.84,290.84,284,293.77,305.98,307.2,324.79,318.44,311.6,312.58,318.68,321.86,317.46,327.47,323.08,317.22,320.88,322.34,320.63,317.7,312.58,319.17,320.88,318.44,326.98,323.81,320.15,307.45,306.72,306.72,311.36,314.77,319.9,320.39,333.82,341.88,341.88,337.48,343.1,343.1,343.35,343.35,344.08,342.86,345.54,345.54,347.74,334.07,333.09,335.78,332.11,335.53,326.01,332.11,327.47,327.47,322.59,319.9,332.6,345.05,348.23,343.83,345.54,335.53,332.11,329.67,334.31,328.94,324.05,329.43,323.08,337,337,348.72,348.72,348.72,366.3,363.13,363.61,358.49,369.47,365.32,363.86,382.17,394.14,395.12,375.58,385.84,381.44,381.44,406.59,404.88,397.8,402.69,419.78,406.84,404.64,399.51,395.36,393.65,401.22,391.21,382.17,415.14,414.65,413.68,431.26,442.49,435.16,446.89,452.99,454.95,437.61,459.1,446.4,442.49,446.64,446.64,460.07,457.63,459.58,437.36,436.39,445.18,423.2,419.05,417.58,439.07,416.61,434.19,429.55,425.4,425.4,423.93,422.95,422.95,438.58,434.68,428.33,439.32,448.84,452.5,452.5,471.31,463.74,464.22,468.86,482.78,488.4,484.98,492.06,494.51,494.51,477.9,462.03,474.24,472.04,473.02,473.02,506.72,507.94,518.93,525.03,542.12,539.68,544.57,572.65,570.21,579.98,571.43,544.57,549.45,578.75,577.53,577.53,575.09,566.54,576.31,561.66,576.31,570.21,582.42,583.64,588.52,568.99,561.66,568.99,538.46,518.93,511.6,500.61,500.61,509.16,463.98,468.38,477.66,461.29,475.21,472.04,422.95,381.2,399.76,413.43,399.02,418.8,432.23,444.2,455.92,455.92,487.67,473.5,487.67,470.33,466.67,452.99,438.58,427.35,437.85,414.41,424.18,424.91,410.99,378.02,389.26,381.93,383.39,379.73,383.88,412.21,397.56,397.56,397.56,397.56,373.14,383.64,395.6,399.27,403.66,441.76,448.84,426.37,426.37,412.94,412.94,425.15,451.53,434.68,434.68,455.92,454.21,454.21,471.06,460.81,478.63,457.39,466.18,458.61,478.63,484,490.84,478.63,464.71,476.19,454.95,444.93,473.75,471.79,478.14,478.14,489.62,470.33,453.72,446.64,422.47,435.16,419.29,416.61,416.61,412.21,431.5,432.23,432.48,410.99,393.41,390.48,387.79,402.69,410.26,422.47,408.06,412.45,416.12,419.54,430.04,428.57,437.85,449.33,448.11,427.35,411.48,414.16,411.48,411.48,415.38,426.13,424.66,424.66,418.07,444.2,487.91,476.19,475.46,500.61,496.95,474.48,476.19,484,512.82,523.81,517.7,532.36,550.67,536.02,539.68,539.68,539.68,539.68,539.68,486.45,466.18,466.67,485.47,496.95,495.73,483.76,487.67,485.71,509.16,512.82,517.7,512.82,533.58,517.7,511.6,500.61,489.62,495.73,486.45,464.47,464.47,454.46,471.55,469.84,469.84,458.85,458.61,485.71,487.67,499.39,503.05,495.73,501.83,512.82,526.25,516.48,507.94,522.59,505.49,486.69,465.69,481.07,483.27,475.21,444.93,402.44,413.92,402.93,447.37,441.51,440.05,441.03,424.91,427.35,427.35,431.26,424.42,442,435.41,450.31,444.44,441.51,433.46,433.46,454.21,454.21,454.21,465.93,464.71,464.22,476.19,484.74,503.05,489.62,499.39,486.94,493.28,489.62,480.83,488.4,495.73,494.51,507.94,517.7,499.39,506.72,506.72,531.14,548.23,548.23,559.22,562.88,586.08,575.09,575.09,605.62,608.06,601.95,600.73,627.59,633.7,680.1,698.41,715.51,693.53,713.06,697.19,681.32,680.1,660.56,661.78,688.64,686.2,725.27,719.17,732.6,728.94,722.83,658.12,656.9,665.45,655.68,656.9,658.12,649.57,639.8,641.03,643.47,667.89,630.04,630.04,643.47,631.26,639.8,626.37,652.01,656.9,678.88,675.21,675.21,653.24,642.25,623.93,598.29,612.94,633.7,638.58,634.92,655.68,656.9,625.15,636.14,641.03,648.35,667.89,676.43,703.3,742.37,749.69,802.2,808.3,849.82,814.41,868.13,868.13,857.14,881.56,873.02,870.57,821.73,852.26,848.6,879.12,965.81,965.81,965.81,965.81,965.81,965.81,1045.18,1013.43,1004.88,1031.75,1105.01,1136.75,1185.59,1169.72,1175.82,1168.5,1245.42,1306.47,1272.28,1362.64,1387.06,1365.08,1514.04,1431.01,1413.92,1448.11,1416.36,1479.85,1511.6,1506.72,1494.51,1367.52,1479.85,1391.94,1372.41,1394.38,1272.28,1269.84,1267.4,1279.61,1328.45,1294.26,1313.8,1362.64,1347.99,1323.57,1328.45,1409.04,1382.17,1433.46,1379.73,1394.38,1352.87,1294.26,1345.54,1347.99,1335.78,1416.36,1426.13,1435.9,1435.9,1462.76,1562.88,1589.74,1589.74,1653.24,1699.63,1772.89,1811.97,1846.15,1816.85,1829.06,1802.2,1811.97,1829.06,1846.15,1865.69,1814.41,1807.08,1843.71,1873.02,1797.31,1953.6,2053.72,2102.56,2219.78,2026.86,2214.9,2197.8,2056.17,2048.84,2166.06,2139.19,2100.12,2168.5,2148.96,2148.96,2148.96,2148.96,2183.15,2317.46,2322.34,2454.21,2485.96,2683.76,2590.96,2590.96,2293.04,2073.26,2297.92,2256.41,2041.51,2290.6,2332.11,2271.06,2222.22,2378.51,2368.74,2578.75,2473.75,2459.1,2278.39,2407.81,2429.79,2278.39,2278.39,2131.87,1970.7,2190.48,2026.86,2139.19,2163.61,2236.87,2522.59,2437.12,2507.94,2539.68,2693.53,2774.11,2820.51,2754.58,2847.37,2989.01,2986.57,2991.45,2984.13,3155.07,3174.6,3157.51,3140.42,3140.42,3533.58,3533.58,3909.65,4039.07,4117.22,4590.96,4481.07,4825.4,4810.74,4442,4493.28,4261.29,4261.29,4737.48,4739.93,4739.93,5010.99,5477.41,5589.74,5697.19,5770.45,5763.13,5763.13,5611.72,5054.95,4666.67,5409.04,5001.22,5130.65,5250.31,5587.3,5816.85,6156.29,6556.78,6749.69,7128.21,6239.32,6400.49,7123.32,6527.47,6417.58,6471.31,6251.53,5340.66,5921.86,5721.61,5374.85,5069.6,5338.22,5323.57,4505.49,4671.55,5084.25,4498.17,4498.17,4307.69,4483.52,4468.86,4686.2,4295.48,4434.68,3785.1,3421.25,3228.33,4195.36,3826.62,3851.04,4073.26,3650.79,3472.53,3467.64,3479.85,3672.77,3890.11,4017.09,4017.09,4058.61,3663,4129.43,4224.66,4080.59,4097.68,4122.1,4224.66,4036.63,4087.91,4134.31,3938.95,3897.44,4021.98,4354.09,4378.51,4532.36,4525.03,4424.91,4144.08,4126.98,4295.48,4261.29,4534.8,4561.66,4493.28,4547.01,4547.01,4547.01,4317.46,4310.13,4337,4476.19,4495.73,4495.73,4329.67,4207.57,4105.01,4105.01,4105.01,3545.79],"마이크론 테크놀로지":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,101.66,100.83,103.32,102.2,102.08,100.53,101.25,104.09,104.69,104.04,102.08,101.84,100.77,98.99,98.64,98.99,103.15,103.32,102.08,100.83,104.87,105.1,107.42,108.25,113.83,114.01,115.67,117.15,118.16,118.16,119.47,118.64,115.25,115.91,109.67,111.51,110.45,113.12,121.31,122.61,121.66,118.81,119.47,118.81,120.42,120.3,120.77,122.55,122.14,137.63,138.04,138.04,138.28,135.19,132.17,130.09,130.09,133.83,132.7,131.22,130.8,132.58,133.41,135.25,132.4,131.63,131.63,129.02,132.46,128.84,130.33,129.91,135.61,139.82,139.58,142.26,143.5,143.09,146.88,147.12,145.99,144.45,145.99,143.68,145.1,142.73,141.84,137.21,136.62,136.38,138.58,138.58,141.07,140.95,139.35,137.92,141.01,139.11,145.7,146.59,151.75,152.58,152.17,150.62,149.26,149.44,152.52,151.81,155.01,154.54,153.12,155.55,151.45,154.66,157.09,168.72,170.68,170.27,169.14,171.93,171.51,169.97,169.67,167.72,169.85,169.26,164.04,161.31,158.4,158.69,158.69,161.01,161.07,161.78,165.93,162.14,157.69,160.18,158.99,163.98,164.21,167.89,164.81,166.17,164.93,167.36,166.53,170.98,174.01,172.28,171.69,171.1,172.23,160.24,163.09,165.1,166.53,167.89,172.05,174.66,176.62,176.62,182.2,182.61,182.55,185.22,185.22,187.36,192.88,192.58,181.6,185.16,187.18,184.33,181.36,177.21,185.16,182.97,189.97,189.26,188.31,192.88,187.89,191.34,186.77,177.21,172.94,172.94,181.07,178.64,179.23,181.01,186.17,186.65,184.75,188.66,188.25,189.32,188.84,189.91,189.97,187.95,177.45,176.91,179.47,173.77,166.88,168.19,169.91,165.16,165.7,169.67,171.16,169.61,163.15,166.23,173.53,176.14,182.14,175.79,180.3,175.43,180.71,180.71,179.35,179.76,184.45,186.82,187.6,189.73,193.47,193.47,190.33,191.39,194.6,192.58,198.46,203.5,205.28,205.22,205.64,210.27,213.35,213.47,213.12,214.07,206.94,202.85,220.12,225.28,233.41,237.45,239.58,234.78,233.65,235.43,243.09,249.14,246.94,240.83,239.76,246.23,239.7,247.18,245.16,246.29,246.65,246.88,243.68,240.95,242.43,247.18,262.97,263.38,263.15,259.41,256.68,260.83,261.66,258.16,265.76,270.62,271.81,269.2,274.07,273.95,282.73,293.18,291.63,291.63,294.84,285.16,284.45,259.58,251.57,249.2,236.8,244.57,246.77,256.38,256.44,255.25,248.43,249.55,250.68,251.63,259.41,261.01,271.51,263.62,261.84,261.84,250.74,252.11,248.13,244.04,259.17,266.94,278.22,271.81,270.33,255.01,257.03,254.12,254.07,254.07,254.72,262.67,261.07,253.71,254.48,260.83,255.67,255.25,259.17,256.91,247.3,259.47,252.17,242.26,233.83,260.42,249.32,237.39,239.82,250.39,253,257.86,258.16,262.37,262.37,266.47,264.33,262.61,276.14,284.75,288.31,289.67,282.61,291.45,308.78,318.93,320.3,327.72,323.98,352.34,352.7,354.78,349.2,359.53,356.91,362.91,362.43,349.67,321.72,329.73,310.98,305.58,309.44,309.44,297.09,305.93,316.85,295.79,287.6,284.63,299.58,299.58,312.11,309.97,306.53,310.15,320.53,305.16,300.42,290.92,279.58,282.49,297.57,282.02,272.88,277.69,272.34,276.68,282.37,287.72,288.25,302.73,312.52,307.54,314.54,320.53,335.31,324.63,316.85,329.26,350.33,355.91,364.93,364.09,364.09,371.63,371.34,341.78,348.61,350.74,352.58,352.64,353.89,364.33,364.33,359.35,356.38,351.22,345.58,346.88,351.63,349.85,352.76,338.87,315.49,323.98,310.15,315.37,311.22,323.32,305.52,305.52,313.59,315.91,322.31,330.8,321.54,329.08,334.42,333.23,338.04,340.95,333.65,326.53,322.2,315.55,316.85,319.05,320.24,314.6,313.29,310.33,316.91,313.41,312.58,314.78,316.85,310.15,304.87,304.69,300.42,281.84,279.53,279.58,285.28,296.38,298.16,294.96,300.89,309.02,310.62,307.6,313.12,311.69,311.69,308.19,294.01,264.99,266.23,266.47,258.75,247.72,258.87,262.91,258.64,269.02,267.42,273.35,265.52,268.01,264.93,263.2,267,268.43,267.95,271.57,267.95,262.08,258.64,255.61,250.86,246.94,249.08,252.05,251.28,256.44,251.34,245.1,240.06,235.96,229.55,210.27,218.28,210.09,205.7,213.71,223.86,238.1,239.29,236.91,236.2,242.91,240,232.11,222.2,224.63,225.7,236.85,234.07,218.58,214.36,215.91,215.91,216.02,217.03,219.58,229.73,224.99,228.84,237.57,218.87,218.87,223.56,209.55,206.53,208.96,213.83,207.83,202.97,201.07,202.43,186.41,185.64,179.94,172.23,172.23,183.32,189.5,187.36,188.31,194.36,183.98,194.07,201.78,200.24,210.33,213.12,213.71,205.76,201.72,199.29,201.07,212.23,212.23,201.01,203.2,217.15,231.22,225.99,221.9,226.94,226.82,235.01,234.24,233.65,246.41,233.71,228.96,228.96,239.76,247.36,250.62,249.2,249.2,249.02,250.5,246.47,252.64,253.71,254.96,245.22,242.61,246.77,243.68,237.33,225.1,224.51,229.38,231.63,232.94,230.45,227.95,234.66,235.07,239.58,238.16,261.07,247,240.65,239.29,232.82,233.47,245.28,250.74,251.87,260.53,254.54,257.09,254.6,247.6,250.27,250.92,249.32,248.19,253.77,256.08,257.57,257.57,257.57,253.83,255.37,253.71,249.85,249.91,249.61,248.66,252.58,257.15,250.03,238.93,235.91,233.06,231.1,221.84,228.55,227.95,221.42,214.01,205.46,211.51,206.11,200.71,201.78,201.78,195.49,197.57,197.74,193.53,194.01,204.69,197.86,198.64,201.72,207.36,206.77,195.61,198.1,193.83,192.46,203.5,201.42,202.67,197.33,196.97,193.95,219.82,225.93,229.02,238.04,235.01,234.96,234.96,233.95,239.82,245.4,254.6,258.04,264.15,263.5,255.55,257.39,265.1,270.15,280.06,278.64,284.81,283.5,281.84,277.86,281.66,266.41,258.75,261.6,248.9,252.94,247.77,253,246.41,250.03,262.14,249.5,250.68,258.46,267.12,262.49,262.14,265.76,254.96,257.74,251.87,256.08,265.1,268.66,268.66,267,277.8,290.98,290.62,291.57,293.12,299.58,299.35,299.7,297.63,301.72,299.58,295.67,291.75,294.36,287.89,293.59,288.43,256.44,254.3,251.04,249.14,257.92,264.39,262.08,253.06,254.48,256.85,267.66,266.23,275.73,268.01,270.03,257.98,268.37,265.04,265.04,279.53,285.04,288.96,285.52,284.15,282.2,287.12,294.3,288.9,282.97,287.24,280.06,274.54,278.34,274.78,277.74,283.15,283.8,276.44,270.45,270.33,272.23,282.02,277.27,285.82,285.82,281.96,275.31,268.43,274.78,276.68,284.45,275.67,281.66,292.34,302.49,303.86,314.18,314.54,314.78,323.62,326.77,328.78,328.9,328.9,327.06,320.65,315.79,319.17,328.72,323.62,317.92,345.82,341.36,340.12,336.32,340.95,341.36,333.35,342.31,342.2,342.2,349.97,351.16,351.34,342.79,328.84,335.13,328.19,326.59,315.07,319.17,329.38,336.91,348.25,337.57,340.24,339.76,351.75,352.11,347.18,347.18,342.73,356.02,350.15,338.22,326.47,309.2,310.8,300.18,311.93,323.98,307.42,328.13,318.81,305.46,272.82,284.04,259.47,230.33,255.13,204.57,221.84,205.88,215.37,214.3,227,256.8,252.23,265.82,258.04,264.21,249.61,236.74,243.86,244.63,275.19,276.2,286.59,273.77,273.77,274.01,282.61,275.55,270.21,271.22,257.57,245.76,260.59,259.76,262.08,268.72,268.9,295.73,284.21,267.42,263.86,269.5,273.47,276.5,286.35,286.05,271.16,258.34,271.39,263.56,272.52,267.77,276.8,268.37,266.71,266.71,271.81,293.47,275.79,284.33,275.01,277.86,290.33,303.98,318.81,318.69,315.43,311.39,287.95,288.96,292.23,302.79,302.43,299.58,301.66,303.56,295.79,286.59,291.93,287.77,291.69,305.76,294.96,295.73,295.73,302.2,291.34,295.01,296.62,300.89,293.53,295.01,299.76,297.33,293.59,303.92,305.76,306.53,312.4,296.85,306.17,297.27,299.05,301.13,297.09,299.05,304.45,302.97,289.02,289.32,291.69,283.44,287.72,273.83,270.62,268.37,263.5,261.42,255.13,253.18,259.7,267.66,266.82,264.81,271.16,270.09,271.57,283.86,274.96,275.85,275.85,267.24,267.95,266.29,273.53,290.98,291.1,297.98,302.55,301.13,291.69,294.96,295.85,293.59,291.63,295.07,300.95,278.69,284.39,276.26,282.49,280.83,287.3,296.14,296.08,300.77,307.72,306.41,308.25,306.29,312.34,317.69,316.38,322.73,313.65,309.44,308.37,296.74,299.58,298.75,295.01,303.15,308.37,323.92,327.36,332.11,328.84,334.48,333.83,343.8,367.12,367.89,360.47,366.94,364.39,380.89,379.53,376.44,376.44,381.19,380.36,398.1,410.15,414.84,435.25,430.92,434.36,423.8,423.03,418.58,424.57,434.12,433.18,428.84,424.09,424.15,418.04,415.13,418.87,418.87,419.35,416.68,426.82,446.17,439.47,458.52,457.63,469.5,459.47,466.88,471.57,474.24,482.49,479.05,479.05,507.42,495.55,504.51,488.31,482.37,471.87,445.64,465.22,464.51,477.33,484.39,469.5,482.2,481.31,498.58,494.48,488.72,513.23,522.31,522.31,520.71,510.68,525.46,539.82,512.05,523.62,549.08,522.97,543.2,562.37,540.59,528.84,500.47,527.77,504.75,529.97,506.88,530.03,520.89,527.3,542.61,562.37,533.06,537.15,541.72,506.82,492.58,499.05,522.2,513.89,513.59,523.5,548.43,548.43,556.38,554.84,557.63,565.52,565.58,567.3,546.88,538.1,535.73,538.04,524.69,519.17,531.1,502.73,510.56,521.31,530.92,510.56,522.61,510.8,504.57,500.95,505.34,503.26,510.27,479.82,478.81,455.79,458.1,473,477.09,468.13,474.36,481.48,479.05,491.99,482.08,488.07,498.1,499.35,499.35,499.41,500.53,486.82,497.09,498.75,477.92,466.82,470.5,470.86,477.69,487.72,477.69,478.58,456.68,457.39,460.89,468.96,478.22,486.82,494.84,492.17,504.33,475.43,476.74,476.74,481.19,464.21,457.63,467.3,472.17,465.58,465.82,456.5,445.16,442.61,447.42,458.1,448.25,450.68,452.82,440.47,448.37,457.45,460.42,460.77,479.88,486.53,483.62,486.65,476.02,450.5,445.28,416.91,420.89,420.95,420.06,419.11,417.09,416.8,425.76,427.18,439.41,431.87,439.17,434.18,437.39,437.51,439.11,438.04,438.04,437.03,428.9,432.46,436.2,441.25,436.14,438.1,442.91,440.95,429.5,428.13,438.99,439.41,439.47,446.17,433.83,425.16,421.25,421.31,419.11,418.4,415.07,418.64,416.14,410.8,395.96,393.95,402.37,401.66,399.17,401.01,405.16,407.36,400.65,408.07,409.14,404.99,412.94,410.09,419.58,419.94,422.85,428.72,432.76,442.49,448.61,435.67,442.43,458.75,455.67,455.85,447.83,457.09,492.76,497.69,506.88,511.63,511.63,495.07,511.22,498.52,505.34,491.87,484.39,489.32,509.38,510.5,504.04,507.66,500.59,494.3,508.37,490.74,492.58,486.82,538.16,536.14,560.36,560.36,560.42,551.57,570.74,557.21,552.82,568.25,571.75,560.24,567.66,560.53,557.21,559.05,564.45,567.48,577.8,577.8,551.16,534.12,504.87,486.23,492.28,479.05,486.47,467.18,470.45,488.25,483.38,501.54,486.47,481.72,479.94,499.23,522.97,540.18,532.7,533.29,569.73,570.09,556.26,538.87,538.87,537.51,518.16,527.18,534.72,527.36,511.93,553.71,529.26,486.11,449.26,457.92,471.45,449.38,432.17,411.87,433.89,472.82,477.86,471.28,464.99,469.55,448.96,464.15,463.5,473.95,486.94,469.79,462.26,452.11,460.95,442.79,437.86,434.9,428.13,427.48,427.06,429.55,416.2,416.2,422.26,431.63,434.42,420.89,411.93,416.14,398.1,394.48,416.5,404.69,418.99,422.91,436.91,423.09,417.51,403.15,408.96,397.39,401.84,426.82,418.22,442.02,421.66,411.87,408.9,413,395.37,402.79,418.99,435.13,435.13,438.22,436.5,447.3,415.07,418.1,419.94,407.12,391.81,371.63,349.2,348.37,350.86,326.47,330.86,330.86,337.09,334.36,333.65,346.82,348.84,343.38,332.46,328.07,318.4,318.4,336.68,340.47,349.26,350.98,343.09,351.22,349.32,352.23,365.16,358.75,370.33,375.67,377.69,363.74,356.97,354.07,367.3,368.37,367.12,371.16,370.74,381.31,384.87,370.68,364.69,351.04,364.39,369.85,385.99,383.98,378.99,365.7,373.77,359.11,346.05,343.38,346.05,363.2,342.02,338.34,334.12,335.49,340.12,334.3,334.3,327.77,326.41,328.72,340.89,343.86,318.22,315.19,312.7,313.65,309.2,301.48,297.33,294.72,297.33,290.09,300.18,302.67,296.8,297.33,306.94,320.24,324.81,324.15,314.01,304.93,318.75,313.06,325.58,312.88,317.51,311.87,314.72,318.69,332.64,333.77,331.57,329.08,309.85,320.71,321.07,325.58,317.21,317.39,333.29,335.67,341.19,332.17,357.69,371.04,366.65,374.48,349.38,348.61,347.66,339.23,347.89,349.73,349.73,346.65,330.86,327.12,342.14,329.32,324.51,320.71,318.58,319.41,327.6,325.64,328.49,327.83,323.98,308.84,309.02,306.94,300.77,303.8,293.35,297.92,297.92,296.85,291.51,300.59,296.62,296.62,298.93,321.66,324.69,336.91,334.48,339.53,344.57,339.88,337.86,337.86,337.39,335.37,334.48,346.94,366.88,363.56,365.22,372.7,379.05,366.23,357.86,371.51,374.9,370.39,355.96,368.72,357.57,357.15,355.01,356.8,368.37,367,356.38,350.21,350.21,341.84,338.16,348.66,345.28,343.62,343.15,340.3,334.9,336.97,337.27,329.73,337.63,329.97,325.99,319.88,322.08,321.25,335.73,336.26,342.08,347.95,345.22,364.04,362.97,354.84,351.81,377.09,374.42,358.1,353.77,339.88,338.4,347.54,347.54,375.49,377.27,367.72,373.89,371.69,371.16,367.54,359.94,364.75,362.79,353.18,345.04,362.14,367.36,381.96,370.03,367.36,361.48,359.11,363.38,361.25,361.6,356.02,365.64,361.54,383.62,378.22,385.28,401.01,404.57,393.06,391.75,394.84,413.12,438.75,438.75,425.46,404.75,410.03,410.5,402.2,400.83,397.98,387.66,388.31,400.3,402.79,410.21,408.43,401.54,401.54,397.03,390.5,393.18,387.42,388.43,396.38,398.04,381.78,374.54,379.23,379.23,368.31,363.38,359.94,370.8,377.45,378.58,382.97,380.3,386.71,385.4,385.52,383.92,389.61,388.61,389.79,399.88,421.78,422.55,423.68,419.94,404.57,410.56,414.9,411.75,401.48,395.85,388.37,382.02,405.22,387.72,381.13,377.21,377.39,379.58,376.32,386.88,377.98,378.16,387.6,395.73,404.09,415.07,417.74,417.74,417.15,417.86,414.66,416.5,415.61,417.27,420.47,426.05,414.72,418.4,419.64,413.53,402.97,408.78,407,403.2,404.81,386.94,403.74,403.32,402.55,404.21,409.79,415.19,412.34,409.91,416.68,413.95,410.74,409.97,409.5,410.33,400.77,398.93,396.91,403.98,394.66,382.97,389.61,392.11,396.85,411.87,418.04,430.74,432.76,432.05,428.96,436.62,447.24,443.8,457.98,457.8,455.01,460.3,466.59,455.25,457.57,457.57,456.2,460,451.75,455.13,451.75,450.62,440.89,437.33,434.01,437.09,444.87,461.66,463.86,473.53,487.77,483.15,484.04,487.66,467,507.3,513.29,513.29,516.68,514.3,510.39,506.47,488.66,488.19,490.86,495.25,504.15,494.54,488.9,494.9,488.96,488.96,502.14,494.24,503.38,519.35,529.61,519.47,522.73,529.38,522.55,528.61,511.34,508.9,508.07,513.23,516.2,502.08,505.46,503.74,507.77,508.61,483.86,485.64,484.45,471.81,471.81,478.99,483.62,509.85,510.39,530.92,545.1,532.4,537.74,564.69,568.37,560.65,567.12,587.42,579.35,560.89,578.16,558.81,542.61,553.41,556.56,557.86,571.22,651.93,654.07,695.13,705.04,707.72,699.64,699.64,737.69,728.49,759.7,736.44,733.41,729.67,727.77,725.22,756.74,727.12,720.3,722.67,690.39,664.27,633.65,647.6,667.42,663.38,662.2,681.54,678.69,670.39,651.04,666.65,680.71,712.94,707.48,708.13,699.17,719.53,729.97,740.71,758.52,758.99,743.56,765.58,756.68,749.44,749.38,768.49,768.49,787.36,780.89,749.5,741.84,760.65,751.57,793.53,771.93,777.09,800.12,801.6,835.31,849.5,838.93,877.33,910.68,910.68,855.73,828.13,824.99,837.51,844.87,784.75,780.59,780.53,786.88,811.99,811.99,781.01,775.61,778.28,809.44,772.88,792.58,776.68,756.62,709.2,697.03,678.1,684.15,678.04,654.48,637.69,649.32,640.06,608.66,651.75,602.43,550.15,536.62,528.19,515.13,546.41,552.4,561.66,578.28,595.91,634.72,640.89,644.69,640.89,642.91,618.75,610.39,587,580.77,562.97,567.18,571.16,571.16,525.7,529.91,530.5,512.64,511.99,515.43,537.98,517.57,541.36,517.39,526.59,518.4,529.67,539.47,555.31,557.86,568.37,652.11,637.98,615.49,595.31,592.58,604.27,606.82,610.74,608.55,603.56,627.24,634.54,642.97,619.11,648.31,664.99,659.64,647.36,639.88,623.44,634.12,640.42,631.39,642.02,617.69,591.39,591.87,603.74,626.05,663.68,673.06,664.09,644.81,617.8,593,588.61,571.75,578.69,580,583.8,609.85,609.14,620.06,604.15,582.79,582.79,581.31,584.87,592.52,612.46,598.64,600.42,610.21,582.2,605.7,583.03,608.31,642.49,644.51,616.62,516.85,534.84,532.46,529.85,529.85,533.06,525.99,506.29,499.47,518.28,533.35,589.08,604.81,589.97,589.97,589.55,564.15,577.8,612.4,608.9,627.6,627.6,649.14,648.25,622.2,612.4,540.71,523.74,528.25,548.96,541.48,533.65,538.04,555.49,561.07,547.77,569.32,558.34,544.09,567.72,590.62,590.62,633.77,619.35,612.34,586.59,566.23,553.23,579.88,544.93,555.67,537.33,541.25,559.88,529.79,551.69,516.8,528.49,567.6,563.09,598.16,611.93,603.68,605.7,611.28,562.14,575.31,558.93,546.77,541.01,524.87,515.67,526.47,525.82,441.19,384.09,405.76,388.96,462.14,415.73,412.76,421.48,421.6,411.45,408.31,408.31,396.08,416.68,432.82,459.47,473.47,466.23,456.26,456.68,461.54,479.05,477.27,477.8,490.33,505.34,509.55,547.72,575.25,565.7,566.47,581.6,585.46,582.2,568.78,562.79,554.12,554.12,571.99,570.8,574.48,560.59,582.67,606.82,612.76,630.8,644.27,658.46,677.39,688.61,689.5,686.05,711.22,714.18,722.97,722.97,733.53,724.51,759.11,755.19,747.77,740.42,731.45,717.45,722.49,725.76,725.76,711.69,738.4,725.46,730.62,739.05,703.92,712.82,690.98,672.17,678.87,671.99,648.19,651.81,663.09,660.3,660.24,664.45,680.95,647.72,622.43,639.58,647.24,645.58,663.92,705.58,734.24,758.16,737.51,743.56,717.33,733.23,724.33,695.61,687.18,698.4,690.92,691.39,698.81,724.04,706.29,706.29,703.15,704.57,737.15,779.64,780.18,802.61,830.86,893.59,933.12,936.32,942.55,949.5,1002.31,965.76,976.97,987.6,959.7,930.74,933.35,972.7,993,1081.01,1090.5,1114.72,1133.29,1102.02,1166.41,1141.42,1077.74,1144.04,1110.15,1139.11,1201.96,1201.07,1227.12,1200.53,1177.86,1226.77,1299.82,1306.23,1316.97,1344.99,1329.44,1328.01,1392.88,1293.95,1409.5,1414.42,1411.99,1503.26,1430.92,1453.41,1406.23,1464.87,1435.9,1356.08,1340.77,1195.07,1230.68,1328.96,1332.52,1366.53,1366.53,1403.44,1427.06,1421.31,1389.67,1345.1,1407.83,1465.4,1498.04,1565.04,1533.89,1431.1,1409.5,1379.88,1338.4,1475.07,1578.16,1641.48,1639.58,1701.36,1701.36,1690.15,1747,1736.68,1693.83,1871.93,1852.52,2038.16,2015.13,1940.77,2048.01,2052.64,2006.71,1978.34,1997.8,2152.82,2152.82,2166.17,2309.26,2359.53,2371.81,2309.14,2434.66,2583.26,2586.29,2462.2,2598.22,2489.26,2251.63,2272.34,2342.37,2275.96,2215.13,2435.25,2456.8,2443.09,2443.09,2372.58,2498.22,2476.85,2541.07,2498.34,2480.77,2545.99,2466.23,2447.3,2449.08,2253.29,2378.46,2356.38,2197.63,2310.5,2392.34,2484.81,2405.64,2528.96,2621.96,2740,2740.24,2636.62,2509.79,2399.7,2347.36,2267.6,2109.55,2120,1909.79,2004.99,2183.09,2173.53,2173.53,2241.9,2240.83,2413.83,2501.54,2496.08,2531.51,2763.56,2707.6,2713.53,2700.71,2661.25,2666.94,2893.06,2858.87,2947.89,3113.12,2992.82,3076.91,3069.2,3217.86,3421.07,3799.41,3956.02,3837.57,4432.11,4720.06,4549.44,4769.32,4605.4,4300.65,4044.75,4146.82,4344.15,4522.85,4456.97,4456.97,5316.8,5509.85,5480.83,5762.61,6145.4,6315.13,6406.94,5910.98,5127.66,5633.71,5554.24,5293.06,5910.21,5825.58,6456.91,6057.92,6191.04,6729.91,6729.91,7189.2,6241.96,6222.61,7202.14,6720.06,6796.91,6850.39,6126.29,5789.67,5789.67,5844.21,5569.02,5630.86,5885.1,5811.87,5560.83,5834.54,5366.65,5063.5,5038.28,5136.26,5761.54,5694.24,5876.62,5465.58,5342.43,4869.61,4385.76,5190.86,4884.45,4922.85,5297.74,5300.83,5231.28,5208.13,5109.79,5154.42,5408.25,5636.97,5766.53,6004.45,5583.15,5561.48,5782.37,5737.57,5403.15,5536.91,5569.14,5551.28,5536.26,5689.79,5539.7,5674.07,5686.41,6033.18,6033.18,5936.26,6099.53,5800.65,5787.89,5483.86,5505.04,5498.81,5801.19,6028.49,6195.61,6505.4,6361.31,6412.64,6423.03,6255.07,6320.95,6321.13,6512.7,6379.17,6314.3,6205.1,6456.97,6147.42,6106.82,5869.67,5869.67],"삼성전자":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,101.28,102.12,102.06,104.37,104.05,102.06,103.28,102.57,100.64,101.03,103.66,105.27,106.1,105.52,103.79,104.5,105.33,105.59,102.5,105.91,102.63,99.74,98.84,100.06,100.71,101.86,102.31,105.33,105.91,105.97,105.97,107.71,107.71,112.14,112.33,110.92,110.34,112.27,113.81,114.96,114.32,112.52,113.42,114.13,112.97,115.16,115.29,116.38,115.93,116.18,114.45,115.48,115.54,114.84,115.74,115.74,115.93,117.15,116.12,114.19,116.25,119.52,119.59,122.93,124.6,120.3,117.73,118.69,118.63,120.36,119.46,122.22,122.54,126.53,128.13,128.13,128.13,126.72,125.63,126.4,126.72,127.04,124.66,123.31,123.31,123.19,121.9,120.68,121.13,122.09,121.58,124.15,125.05,126.2,125.82,122.74,122.22,123.44,123.44,127.55,127.23,128.71,129.09,129.09,129.09,129.03,130.38,132.82,132.95,134.36,136.16,134.55,136.67,136.35,134.23,133.27,132.31,133.2,134.17,134.81,132.31,133.08,135.13,135.32,134.36,133.59,134.68,133.59,134.55,136.22,134.94,133.46,133.27,131.34,129.35,130.89,132.43,137.12,137.44,140.78,143.29,143.29,144.19,144.19,146.18,146.18,151,151,146.44,146.11,147.14,148.04,148.94,148.81,147.53,143.61,144.83,144.25,144.12,146.69,147.98,146.5,143.35,143.55,143.48,147.59,147.53,147.53,145.47,145.02,148.04,145.73,145.79,145.66,146.69,146.37,149.52,154.59,152.47,154.01,152.92,155.04,155.11,153.18,153.95,152.67,151.64,150.93,152.79,154.34,153.69,156.26,157.35,160.18,162.36,162.11,162.62,163.26,162.94,164.42,164.03,163.33,160.57,160.05,159.92,153.37,154.78,156.07,157.35,153.44,153.18,152.79,153.24,148.62,147.4,143.29,144.51,144.51,148.36,151.06,150.61,150.42,150.93,152.47,152.6,151,148.04,147.98,148.36,148.75,149.26,147.85,150.16,150.93,154.53,157.61,159.92,159.28,159.34,161.53,161.85,168.53,167.37,167.69,169.56,169.56,172.19,172.19,165.96,164.61,164.68,164.68,164.68,164.68,164.68,164.68,164.68,169.56,175.47,175.98,173.41,173.15,175.98,175.85,170.13,172.9,174.37,173.54,173.09,168.27,170.46,173.54,176.88,183.75,183.24,181.05,181.05,180.15,182.27,180.92,181.12,181.05,179.58,177.71,179.13,179.25,177.26,177.52,179.7,177.59,178.1,169.04,171.1,168.91,163.13,163.26,164.87,164.61,160.63,162.94,166.99,166.28,167.31,164.8,163.97,162.56,164.42,165.57,165.57,157.8,159.6,159.6,154.78,158.51,163.65,163.65,163.84,165.77,164.03,167.37,167.05,161.85,156.84,154.91,154.78,155.88,160.57,159.34,160.24,158.38,154.91,157.87,158.45,161.4,163.07,164.48,159.92,160.24,159.99,153.18,153.89,152.28,147.08,147.72,143.55,146.82,152.67,157.35,157.35,157.35,155.36,152.22,151.83,150.16,151.64,152.15,152.15,151.12,151.12,147.78,145.15,151,156.13,158,159.73,159.73,165.9,166.22,165.51,164.23,162.94,164.42,163.97,166.28,159.67,161.46,160.5,156.39,157.48,158.06,155.88,154.53,150.67,156.52,155.43,158,156.97,156.9,157.35,159.92,161.66,160.5,164.93,169.49,165.77,166.67,162.04,161.85,167.44,170.2,170.2,170.2,170.2,170.2,166.67,166.67,168.91,163.46,165.7,164.74,160.89,158,160.08,158.64,158.96,160.57,160.57,166.35,165.06,169.24,167.95,164.74,158.96,162.81,164.74,164.1,164.74,164.74,162.49,159.44,160.24,158.64,158.64,154.78,153.02,149.65,150.93,150.93,151.09,151.73,149.81,150.93,153.98,150.29,149.81,146.27,148.2,148.52,147.56,144.19,146.44,148.68,147.72,146.11,149.33,147.88,147.24,149.49,150.61,152.38,149.33,148.2,148.2,150.61,150.61,149.33,148.52,149.49,146.27,146.92,147.08,149.97,150.29,150.61,145.79,144.67,144.99,144.99,142.1,141.62,140.82,143.87,148.04,148.36,148.2,148.68,149.49,150.29,153.02,155.59,152.38,153.02,149.65,148.04,144.19,146.11,144.67,143.06,141.46,147.24,144.99,146.11,148.2,151.73,152.22,152.22,152.22,152.22,152.54,149.17,148.84,146.76,146.76,143.55,143.55,144.35,144.35,145.47,138.41,141.3,140.66,140.01,141.78,141.46,140.98,139.85,138.25,136.64,131.66,131.66,132.95,136,136.16,135.36,141.78,140.66,140.49,141.3,141.46,142.26,145.15,142.9,141.62,142.1,141.3,140.17,137.44,135.2,136.32,136.16,136.8,138.25,138.57,138.57,134.39,138.89,135.36,133.11,130.06,131.5,129.09,129.25,129.9,128.45,125.08,125.72,124.92,125.56,124.12,124.12,124.6,124.6,123.15,122.83,124.28,124.28,124.44,120.75,120.26,124.44,122.35,127.17,127.81,130.06,128.61,131.98,133.11,134.71,135.84,137.28,135.36,134.87,138.25,143.71,144.67,146.11,149,148.2,148.84,148.84,148.84,148.84,148.36,143.87,144.51,147.88,148.36,152.54,147.88,148.36,147.56,150.61,150.77,151.41,152.06,150.13,150.13,144.83,144.83,144.03,142.1,141.3,142.74,140.66,140.17,143.38,140.82,140.82,141.94,140.33,140.98,141.46,147.24,149.49,146.11,145.31,145.63,144.03,143.38,144.67,146.92,149.65,150.77,150.45,149.81,149.81,149.97,148.52,150.45,151.09,151.73,151.09,146.44,145.47,145.63,145.15,143.71,143.38,144.03,148.2,147.24,147.24,147.4,145.47,145.47,144.03,142.1,136.32,137.76,136.96,136.96,136.64,133.43,132.31,134.87,138.57,139.69,140.82,137.12,136.96,136.64,134.23,136.64,136.48,140.66,139.53,140.98,140.98,141.94,143.87,144.03,143.22,140.49,141.3,140.98,142.42,145.63,146.11,146.76,146.11,146.44,146.76,149.33,150.93,149.65,148.52,145.79,147.72,146.6,142.58,144.83,146.27,148.36,148.68,149.17,150.45,147.88,148.04,150.29,151.57,151.89,149,151.57,151.41,148.04,149.49,145.63,145.15,144.35,141.14,139.69,138.73,136.96,138.57,140.33,138.09,140.33,140.33,140.98,140.01,142.74,142.9,141.46,141.14,140.01,141.46,141.78,139.37,141.3,140.66,138.89,141.62,146.76,148.68,150.61,150.93,151.41,151.41,151.41,151.25,150.61,153.18,157.84,158,158.32,158.96,157.03,158,155.43,157.51,156.87,152.86,152.86,154.14,153.34,157.03,157.03,155.91,157.84,160.57,160.89,162.81,162.17,160.24,161.53,164.42,164.42,162.81,163.46,164.74,164.1,161.85,161.85,164.42,167.95,169.24,171.16,169.88,167.31,165.7,168.91,168.59,169.56,172.45,171.8,171.8,166.99,163.78,165.7,166.35,166.35,167.63,164.74,161.53,161.85,160.24,158.8,158.96,161.85,164.42,165.38,166.67,171.16,175.66,175.66,182.08,180.8,179.83,179.83,178.23,176.62,176.62,177.91,181.44,179.19,179.19,177.26,178.23,178.23,179.19,182.4,188.18,191.07,192.68,192.68,189.47,194.93,196.85,200.39,197.17,200.06,195.25,195.25,195.25,188.82,189.79,183.69,181.12,183.69,189.15,191.07,196.21,193.96,191.71,192.36,194.28,194.93,198.46,197.5,192.04,193.32,192.68,190.11,182.4,185.93,181.44,179.51,174.05,176.62,177.91,184.33,185.61,181.44,181.44,175.34,167.31,167.31,160.4,157.03,151.89,146.44,137.93,145.79,136.48,150.77,156.23,153.5,155.11,153.66,153.34,147.08,150.29,150.93,156.39,159.28,156.07,157.68,158.16,155.11,157.35,157.35,157.35,165.06,160.89,158.16,160.08,160.08,158.48,160.08,160.89,160.57,160.57,160.57,155.75,155.75,158,156.71,156.71,155.43,153.82,155.91,154.14,153.66,156.71,161.53,160.57,160.4,156.55,156.87,158.16,160.24,161.85,162.81,164.42,165.06,175.02,175.34,178.23,176.3,178.23,177.91,174.37,167.95,160.24,167.31,167.63,167.95,169.88,166.99,165.06,169.88,166.67,171.16,168.27,169.56,168.91,169.88,172.13,176.62,171.48,170.2,169.56,169.24,171.48,172.77,175.66,172.77,174.69,174.05,177.59,175.66,173.73,174.05,178.55,188.18,189.47,189.47,185.93,182.4,184.01,182.72,186.26,184.65,185.61,186.9,189.47,188.5,186.26,186.26,187.54,185.61,177.91,179.51,180.15,181.12,181.12,178.55,177.91,173.41,174.05,174.69,181.12,178.55,181.44,188.5,187.54,190.11,189.47,193.96,195.89,195.89,191.07,190.43,190.11,186.9,188.18,185.61,185.93,186.9,186.9,186.9,186.9,186.9,188.5,189.47,192.36,191.71,191.71,193.96,195.57,195.57,192.68,191.07,192.68,195.57,195.57,193,193.32,193.96,192.04,189.47,186.58,181.76,184.33,188.82,187.86,193.64,193,193.32,193.32,196.85,195.89,202.95,212.91,210.98,208.09,207.45,207.77,216.76,217.41,213.87,218.37,219.01,214.19,217.73,223.19,223.83,229.61,234.1,230.25,237.32,234.1,235.71,236.99,236.99,236.99,235.39,234.43,234.43,232.18,237.32,249.84,249.84,252.73,251.45,260.12,260.12,266.54,269.43,263.97,266.22,285.16,292.23,290.94,288.05,288.05,282.59,272.96,279.38,280.03,282.92,278.74,287.09,278.42,274.89,268.79,263.33,266.54,271.03,271.68,264.93,268.14,266.54,265.57,262.04,262.04,262.04,270.39,272.64,267.18,263.65,265.25,263.97,263.33,263.33,273.92,264.93,264.93,268.46,269.75,264.61,263.65,263.33,261.4,259.79,263.33,265.9,262.68,265.9,264.29,266.22,263.01,263.33,262.68,260.12,260.76,261.72,262.04,263.97,261.4,266.22,272.32,274.25,276.17,274.89,272,268.46,267.18,269.75,269.75,270.07,269.43,267.5,269.43,265.25,264.61,265.9,268.14,266.22,263.65,262.36,261.72,262.36,265.25,265.25,264.29,263.01,267.18,260.76,256.9,252.09,257.23,255.62,255.62,255.62,255.3,257.23,255.94,256.58,256.26,255.62,257.23,258.51,258.83,259.47,265.9,263.97,263.01,263.01,260.44,260.12,260.12,258.51,259.79,262.68,259.79,258.51,256.58,256.9,257.23,260.76,262.04,263.01,260.12,259.15,257.23,256.9,258.19,260.76,259.47,256.58,254.98,255.94,256.26,255.3,258.83,256.26,253.69,253.69,252.09,255.94,254.66,253.05,252.09,254.34,253.69,252.09,254.66,261.4,266.22,263.65,261.72,261.72,257.55,252.09,247.27,238.92,238.92,238.28,237.32,234.75,233.46,235.39,242.77,243.1,239.56,238.6,239.56,246.31,246.63,244.06,245.99,248.23,244.38,245.02,241.81,241.81,245.02,245.99,247.27,244.38,247.91,247.91,247.91,247.91,248.55,248.23,249.52,245.02,237.96,237.96,235.07,235.07,231.86,228.97,229.93,229.61,229.61,221.58,220.94,222.86,225.11,225.43,226.72,225.75,225.43,226.08,225.43,228.32,225.11,227.04,224.15,224.47,229.61,226.08,226.72,225.43,226.72,226.4,225.43,224.47,226.72,229.29,228.97,227.04,225.43,228.64,240.53,241.81,240.21,236.67,232.18,232.18,228.97,238.92,243.42,242.77,245.02,248.55,248.55,251.12,246.95,246.63,247.27,249.2,249.84,250.48,247.59,250.8,254.98,256.58,258.51,257.55,257.87,253.05,251.45,251.45,251.45,252.73,248.55,246.95,251.45,250.48,253.37,253.37,250.16,248.23,248.88,247.27,245.02,245.66,242.77,241.17,237.64,237.64,228.97,235.39,235.39,235.39,235.39,235.39,237.64,234.43,234.43,234.43,242.13,240.53,236.67,236.67,240.21,240.85,238.6,238.6,238.6,238.6,229.61,230.89,230.89,230.89,230.25,234.1,234.1,225.11,223.19,223.19,223.19,224.79,225.43,225.43,226.08,226.08,227.04,224.47,225.75,226.4,224.15,224.15,223.83,225.43,224.47,223.51,221.9,222.54,222.22,219.97,218.37,217.73,218.05,215.16,220.62,216.76,213.87,214.19,216.12,216.44,217.41,215.16,212.91,212.27,208.73,208.09,216.44,216.12,216.76,218.05,218.05,213.55,213.55,210.98,210.98,208.41,213.55,212.91,217.08,218.69,216.76,218.37,218.05,213.55,213.23,211.62,213.55,217.41,216.44,216.44,214.19,214.52,214.52,210.34,209.7,209.38,204.88,199.42,198.78,194.93,195.57,192.04,188.5,187.86,184.97,184.33,187.54,188.82,190.75,186.26,183.04,180.48,183.37,183.69,181.12,186.9,188.5,188.82,186.58,186.26,184.65,192.68,198.78,195.57,194.28,198.46,196.85,196.21,198.14,198.46,198.78,197.17,196.85,198.14,196.85,197.5,197.5,195.25,192.68,189.79,192.36,193.32,193.32,195.89,193.96,197.5,195.57,192.68,189.79,189.47,191.71,192.68,188.18,188.82,191.71,187.54,184.65,183.37,183.37,179.83,178.55,178.55,178.55,186.58,182.4,179.83,180.48,181.12,179.19,177.59,174.69,175.02,173.09,174.05,169.88,168.91,170.52,170.52,177.26,179.83,180.8,180.48,180.48,177.91,179.19,177.26,180.8,181.76,181.44,179.19,178.23,179.51,184.65,185.29,190.75,191.07,184.01,190.75,192.68,191.39,190.11,190.75,193.32,198.46,199.1,193.96,201.99,198.78,200.39,201.35,197.17,198.46,197.17,194.61,195.89,197.17,195.89,193,194.61,199.74,201.03,193.96,193.64,190.11,189.15,190.11,193.96,191.07,191.71,194.28,190.43,191.07,191.07,188.18,186.26,189.79,186.58,185.93,186.58,181.76,177.59,177.59,178.23,177.91,185.61,186.9,189.47,194.93,193.96,194.28,194.28,195.25,196.21,195.89,193.96,197.5,198.46,198.46,198.46,203.28,204.88,207.45,203.28,197.17,195.89,203.92,203.92,197.82,199.1,202.63,203.28,201.99,201.99,202.95,199.74,204.56,201.03,201.35,199.42,196.21,199.1,196.85,194.28,194.61,194.61,195.25,194.28,197.5,194.93,193.64,193,191.07,192.68,189.47,192.04,192.36,196.85,193.32,193.64,196.21,200.06,202.31,199.42,201.99,201.35,202.95,205.52,202.63,204.24,205.2,200.06,208.73,210.98,211.62,211.95,212.27,209.06,209.7,210.66,210.34,209.7,210.98,209.38,204.24,205.84,207.45,210.34,210.34,210.98,210.02,209.06,209.06,211.62,209.7,207.45,206.17,205.84,207.13,210.02,208.73,212.59,219.65,219.97,219.65,219.97,220.94,225.75,225.75,232.18,229.29,227.68,231.86,230.25,230.25,228,227.68,231.21,228,231.21,230.89,229.61,230.57,228.64,229.29,226.4,228.97,229.93,232.5,233.14,233.46,232.5,231.86,234.43,234.43,231.21,229.93,224.47,223.19,229.61,230.89,230.89,235.71,235.39,231.21,230.25,228,225.75,226.08,224.79,224.15,230.25,226.72,224.15,228.32,224.47,220.94,219.33,219.97,217.08,221.26,218.37,216.76,216.12,216.12,215.16,214.19,212.91,213.87,213.87,215.48,219.01,215.48,214.52,214.52,215.48,214.84,228,228.64,227.04,224.79,226.08,225.75,227.36,226.4,227.68,230.25,231.21,225.43,224.15,223.51,221.26,220.94,222.86,220.3,219.65,219.65,219.65,219.65,219.65,216.76,214.19,211.95,211.95,213.23,219.01,221.26,218.37,216.12,222.86,226.4,223.19,220.94,219.65,219.97,218.37,214.19,216.12,216.12,214.84,220.3,223.83,223.51,227.68,227.68,224.47,225.75,226.4,226.08,227.36,231.86,233.78,232.82,233.46,233.78,233.78,232.5,230.25,228.97,233.46,233.46,233.78,231.21,233.14,228.64,230.25,229.61,233.14,234.43,236.03,233.78,234.75,235.39,234.1,235.71,240.21,240.85,243.74,243.74,245.99,250.48,252.09,252.09,255.62,247.27,245.99,245.99,245.66,239.88,236.35,235.07,234.75,237.32,233.14,228,230.25,239.88,241.17,241.49,237.64,237.96,235.71,238.92,238.6,233.46,236.35,241.49,238.6,238.92,240.85,237.96,237.96,237.96,241.49,237.64,235.07,233.78,236.99,235.39,234.43,234.75,234.1,233.78,234.1,235.07,235.71,235.71,240.53,236.67,234.1,231.86,235.39,232.5,235.39,237.96,238.6,232.18,233.78,233.78,246.95,254.66,253.37,251.12,256.58,256.26,259.47,264.61,263.33,272.96,270.07,273.92,271.36,271.36,268.46,268.46,270.07,268.79,263.97,256.9,253.37,255.62,249.2,244.38,242.45,252.41,245.02,246.31,246.31,248.88,248.88,250.48,249.2,249.2,261.08,261.08,255.94,254.34,251.77,251.45,251.45,251.12,248.55,253.37,251.77,249.52,251.45,243.74,247.91,249.2,241.49,236.03,236.03,243.1,241.81,248.55,248.55,248.23,243.1,241.49,245.66,252.41,255.62,250.8,256.26,260.76,262.04,256.9,258.83,259.47,261.08,262.04,261.72,262.68,262.68,262.68,271.68,279.7,280.67,281.95,281.95,281.31,271.03,278.42,281.63,278.42,279.06,271.03,266.54,269.43,263.33,258.19,259.79,260.76,260.12,269.43,266.86,255.62,229.29,232.82,239.88,235.71,239.88,242.45,244.38,247.91,247.91,257.55,251.45,253.37,251.45,251.45,249.52,244.38,243.42,245.34,237.64,238.6,238.92,232.82,224.79,221.58,221.26,216.76,212.59,208.41,212.91,206.81,206.81,206.81,206.81,202.63,202.31,201.03,202.95,199.74,207.77,206.17,197.5,197.5,196.85,196.85,194.61,195.89,193.64,193.64,189.15,190.43,190.43,195.89,191.07,191.71,190.11,189.47,185.29,189.79,181.76,179.51,186.58,191.39,189.79,190.11,187.22,188.5,184.97,184.01,184.01,183.04,176.62,170.2,162.49,160.24,171.8,182.08,180.8,177.59,181.12,179.83,185.93,187.22,180.8,178.23,174.05,172.13,172.13,170.52,172.45,173.73,171.48,173.41,173.41,179.51,180.15,178.55,174.05,176.3,170.52,170.2,171.8,174.69,174.69,172.13,172.45,170.84,170.84,171.48,174.69,179.51,177.91,184.01,180.15,177.59,173.73,173.09,172.45,174.37,172.45,171.48,171.8,174.37,172.45,172.45,172.45,172.45,172.45,172.45,168.27,163.78,169.24,169.88,173.41,172.45,178.55,178.87,179.19,179.19,179.83,179.83,182.72,188.5,187.54,186.9,184.01,183.69,181.76,180.8,175.02,175.02,175.02,173.41,174.37,172.45,172.45,172.13,176.3,175.66,175.66,184.97,184.97,187.86,193.32,198.14,194.28,192.04,197.17,198.46,193.32,185.61,188.82,188.82,184.97,180.15,170.84,171.8,170.2,181.12,177.26,180.48,181.76,175.66,176.94,177.59,177.91,176.62,178.87,178.87,178.87,179.19,179.19,178.23,178.23,174.37,174.37,174.37,175.34,175.34,175.98,184.97,182.72,184.33,184.01,182.4,179.19,179.51,178.87,175.66,174.05,175.66,173.09,179.51,180.15,180.48,182.4,182.4,185.61,189.79,189.79,192.04,190.11,192.36,191.07,187.22,183.69,186.58,192.04,190.11,191.07,186.26,194.28,196.85,193.32,195.25,192.04,193.32,195.25,204.88,203.28,198.14,197.17,193.96,195.89,201.03,200.71,204.56,207.77,214.19,215.48,217.73,211.95,213.23,211.95,211.62,226.08,226.72,233.14,229.29,221.26,223.83,224.47,220.94,226.4,230.57,228,228.32,230.89,229.93,229.93,224.79,224.79,226.4,226.72,229.29,229.61,225.75,226.72,223.51,223.83,217.08,221.9,224.15,225.11,223.19,225.11,229.61,233.14,235.71,242.13,245.66,254.98,251.12,257.87,257.87,268.14,272,274.25,276.49,267.5,270.39,269.43,276.17,288.21,288.21,288.21,288.21,288.21,288.21,303.15,299.61,294.16,305.07,313.74,314.39,315.03,313.1,316.63,309.89,317.28,327.55,319.52,322.74,334.3,345.22,356.78,336.87,323.06,318.56,314.39,323.06,332.37,331.09,330.12,312.14,323.06,314.07,309.89,323.06,304.43,310.53,318.88,330.12,332.37,322.74,323.7,332.05,335.58,337.51,348.11,351.64,348.11,346.82,344.57,349.71,336.54,330.12,346.5,345.54,341.36,354.85,358.06,356.78,356.78,375.72,383.75,385.04,385.04,412.65,443.48,446.05,452.79,445.73,446.37,445.73,441.88,450.55,462.11,478.16,479.45,466.28,480.09,489.08,488.44,488.44,512.2,521.52,516.06,515.41,482.98,537.89,543.03,511.56,509.31,534.36,532.43,538.86,573.54,581.89,581.89,581.89,581.89,610.15,610.47,619.78,642.26,653.5,700.06,695.25,695.25,626.53,552.99,615.29,604.37,557.16,603.4,610.15,603.4,589.27,605.97,622.67,669.56,643.87,640.33,598.27,609.18,606.94,578.36,578.36,566.15,536.93,609.02,572.9,597.94,620.1,631.02,675.98,655.11,661.53,645.47,663.13,677.59,698.46,693.64,688.82,703.28,698.46,720.94,704.88,720.94,712.91,725.75,708.09,708.09,746.63,746.63,854.21,871.87,862.24,916.83,895.95,912.01,950.55,868.66,902.38,884.71,886.32,961.79,939.31,939.31,960.18,985.87,961.79,1017.98,1120.75,1157.68,1157.68,1128.77,1056.52,948.94,1034.04,971.42,960.18,1035.65,1082.21,1101.48,1112.72,1164.1,1136.8,1135.2,995.5,1093.45,1151.25,1090.24,1037.25,1072.58,1009.96,918.43,993.9,1021.19,950.55,891.14,892.74,915.22,817.28,844.57,897.56,818.88,818.88,783.56,831.73,836.54,867.05,801.22,815.67,706.49,669.56,664.74,842.97,769.11,770.71,789.98,740.21,741.81,738.6,769.11,820.49,860.63,881.5,881.5,862.24,794.8,870.26,903.98,825.31,825.31,839.76,854.21,825.31,834.94,838.15,804.43,802.83,820.49,867.05,865.45,865.45,863.84,833.33,799.61,798.01,814.07,810.85,838.15,879.9,887.93,916.83,916.83,916.83,867.05,875.08,862.24,886.32,886.32,886.32,873.47,862.24,841.36,841.36,841.36,738.6],"어플라이드 머티어리얼즈":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,100.75,99.78,100.57,101.65,101.87,102.05,104.63,103.59,103.55,103.59,102.87,104.38,103.73,102.62,101.47,101.29,105.28,105.92,104.56,101.15,103.45,104.06,106.28,107.75,110.3,110.34,112.53,113.68,114.43,114.43,114.43,114.29,115.43,115.58,108.04,112.85,113.17,113.46,116.69,117.41,116.12,114.86,114.97,115.36,118.66,116.69,116.44,117.05,116.94,118.49,118.09,118.09,119.63,118.09,117.23,115.83,115.83,114.64,115.72,115.22,115,117.66,118.92,120.14,119.56,121.28,121.28,119.53,120.93,121.14,121.46,121.14,122.15,123.55,121.97,125.77,123.26,122.94,125.74,125.41,126.74,126.27,127.57,127.78,127.1,126.78,127.28,126.45,127.39,126.27,128.03,128.03,131.3,131.05,129.79,130.29,130.76,130.01,132.27,130.98,132.34,132.3,132.7,133.49,134.17,136.83,137.98,137.37,139.7,140.17,140.99,142.03,138.48,139.34,139.45,139.88,139.48,139.34,139.52,139.59,139.63,139.59,139.99,137.76,138.48,139.73,139.48,137.11,135.57,134.67,134.67,136.47,136.58,140.88,143.18,142.82,145.15,146.41,146.12,148.35,145.76,149.68,149.71,149.14,149.39,150.14,149.1,150.9,153.88,156.07,155.92,159.08,161.77,153.48,157.61,158.22,160.55,161.2,160.19,161.59,163.32,163.32,163.53,164.68,165.11,167.98,167.7,167.16,169.63,170.24,160.59,159.15,160.98,157.86,154.92,154.74,158.97,155.64,156.57,155.56,158.26,155.24,150.36,153.23,148.74,148.28,147.2,147.2,151.18,151.15,156.28,158.69,162.96,162.53,162.6,165.54,165.65,167.34,169.35,169.6,168.02,167.91,166.55,170.32,165.25,162.42,159.05,158.29,153.37,153.27,153.7,157.79,157.57,157.25,150.86,154.63,157.14,157.5,159.58,154.77,159.01,155.46,159.55,158,156.93,155.46,156.6,158,163.21,161.95,161.88,161.88,159.66,160.55,162.31,159.19,163.6,163.85,165.54,168.88,169.2,172.47,173.22,169.71,169.24,171.46,166.3,164.82,175.31,181.69,186.97,186.93,186.07,185.21,184.6,188.08,189.12,188.77,191.06,191.35,193.61,197.56,197.88,198.64,198.6,201.33,202.33,202.37,198.49,200.75,203.48,200.65,202.55,199.96,201.94,202.98,202.19,202.69,204.31,199.14,202.3,204.7,202.51,200.18,207.61,202.76,206.82,211.06,207.04,207.04,207.86,204.38,205.78,189.91,189.41,186.32,178.64,179.76,183.09,187.72,184.6,185.28,181.16,182.2,184.17,188.59,191.67,190.09,191.28,186.25,186.86,186.86,183.24,185.5,185.64,183.49,190.38,193.75,194.87,195.98,200.72,196.91,191.31,190.95,191.85,191.85,195.62,205.81,206.03,206.03,206.25,207.43,204.16,200.14,205.03,198.6,191.6,192.5,191.24,181.91,173.4,180.37,174.77,164.21,172.58,177.67,177.85,186.5,193.79,197.52,197.52,203.37,201.47,201.26,204.63,211.09,206.89,206.71,204.85,208.29,206.86,215.33,213.28,213.1,221.14,218.84,214.25,216.19,216.37,213.35,209.98,212.6,218.16,211.63,198.78,209.87,198.99,194.04,199.61,199.61,189.84,193.75,199.43,194.87,187.87,190.31,196.7,197.24,202.55,201.26,204.13,207.68,196.45,183.74,183.38,180.11,174.87,176.38,181.23,177.32,178.28,182.74,181.37,182.02,188.66,188.77,191.85,194.29,199.32,196.84,198.35,194.15,198.03,193.68,177.71,179.47,180.37,180.69,182.23,182.52,182.52,186.72,185.18,182.27,187.51,187.69,189.91,188.55,183.96,183.6,179.07,182.56,182.99,178.36,176.99,173.44,174.26,174.37,175.84,172.15,167.66,167.52,162.42,162.56,165.79,163.96,160.8,160.8,163.1,165.58,166.98,167.77,162.24,163.96,165.58,166.22,169.78,173.3,167.52,167.84,166.65,164.79,164.97,169.31,173.37,171.97,174.55,172.18,172.68,175.31,177.6,178.14,180.11,176.45,172.76,173.19,173.65,170.53,170.24,157.11,156.25,157.07,154.31,153.59,153.37,157.04,155.78,154.7,154.85,154.41,154.41,152.98,152.55,144.54,143.04,142.14,140.63,137.8,139.59,140.34,138.91,140.67,140.13,141.39,142.25,140.34,138.48,137.33,137.65,138.73,137.62,139.63,139.7,136,133.67,131.34,128.21,123.58,117.7,120.93,119.99,124.77,125.48,121.75,123.08,120.35,120.32,114.18,117.16,116.15,111.7,116.37,118.02,126.88,126.6,123.19,125.16,126.53,125.41,123.04,117.09,120.21,120.53,125.7,127.06,123.55,128.39,126.31,126.31,125.81,129.25,129.22,133.2,131.16,133.81,137.62,127.17,127.17,124.52,120.75,122.65,122.11,122.76,121,117.19,117.26,119.45,113.17,110.91,108.79,104.06,104.06,109.98,113.24,116.22,117.52,120.17,113.21,120.96,123.12,118.13,123.12,124.77,124.84,121.54,121.14,120.75,123.98,128.18,128.18,123.62,123.15,135.75,140.67,138.91,137.11,142.14,140.27,141.1,139.63,140.42,144.58,143.29,142.79,143.22,146.05,146.63,146.12,140.34,140.34,141.06,139.99,139.38,141.53,142.35,142.07,139.2,137.62,138.41,140.27,139.73,136.65,134.85,135.46,138.23,138.94,138.55,139.73,144.97,143.58,144.9,142.03,148.35,143.07,141.42,142.25,139.73,138.23,142.35,147.63,147.13,152.3,152.98,154.49,154.06,150.79,151.36,152.44,154.31,153.3,156.93,157.54,157.75,157.75,157.18,157.32,159.58,159.55,160.3,158.79,158.18,155.71,156.86,157.79,154.74,150.93,149.25,146.95,146.45,140.31,143.61,148.96,149.53,153.27,144.83,148.13,145.33,143.36,141.78,141.78,140.02,141.31,142.68,138.87,139.2,145.08,145.69,148.53,148.99,154.85,157.04,148.96,149.5,147.99,145.37,151.87,152.66,155.1,154.2,151.94,150.68,156.42,160.41,161.2,163.96,160.3,160.34,160.34,157.86,155.96,157.82,160.52,162.53,166.94,166.12,165.15,165.9,172.9,171.61,182.09,183.17,187.15,182.41,182.12,181.87,182.09,177.21,173.98,170.67,163.17,166.3,167.55,171.79,169.24,166.76,172.51,167.66,169.27,167.37,169.06,167.73,168.09,168.81,161.95,163.71,163.35,164.75,169.81,172.36,172.36,170.89,177.71,180.73,179.83,181.84,180.15,185.07,183.96,184.31,182.77,183.78,186.97,185.5,182.91,185.79,183.63,186.4,187.19,177.42,179.11,179.54,177.53,178.18,182.63,181.8,176.99,182.48,183.09,185.75,186.43,189.91,185.07,187.15,185.5,188.94,186.58,181.37,197.67,200,204.41,199.28,198.17,194.76,199.07,200.07,200.57,200.36,200.79,201.11,203.12,202.51,205.03,204.45,222.76,223.8,218.74,214.11,202.58,200.79,209.19,206.64,209.22,209.22,207.82,203.52,198.64,201.33,200.43,203.16,203.16,203.23,211.92,216.65,214.9,215.22,218.2,216.73,217.77,221.86,219.24,220.75,220.75,220.06,219.56,218.7,219.1,223.26,219.71,214.97,221.18,221.03,222.43,220.64,221.86,223.8,222.29,226.88,225.59,225.59,226.85,229.33,229.33,222.54,211.95,216.04,214.72,216.26,208.15,214.36,226.17,229,226.81,221.5,225.84,231.34,234.64,241.82,239.95,239.95,233.88,241.96,238.33,230.69,219.24,211.27,214.68,204.59,208.61,215.94,208.33,217.23,212.24,207.43,186.9,201.62,188.41,161.92,182.66,145.48,161.02,140.63,144.26,136.36,144.19,162.02,160.55,176.6,161.7,169.78,164.47,155.42,155.2,151.76,165.65,170.71,184.71,178,178,179.04,188.33,180.8,187.47,190.95,181.73,173.47,187.04,182.7,185.71,183.17,180.98,195.05,178.32,168.31,170.78,175.34,181.26,183.96,193.14,193.86,187.83,184.82,195.37,186.79,195.12,199.1,204.16,197.49,195.23,195.23,197.92,202.44,196.23,201.65,199.89,200.25,207.5,208.65,216.04,215,214.61,214.86,198.89,202.98,204.77,210.12,215.36,216.73,218.77,219.92,218.38,215.25,215.29,209.55,211.99,216.98,214.21,218.95,218.95,227.78,223.19,225.31,227.89,224.66,220.78,224.48,222.9,223.76,223.62,228.75,229.04,230.51,228.39,217.59,226.17,223.62,227.03,231.23,230.9,233.35,232.77,232.84,228.32,228.18,234.17,231.37,238.69,233.56,242.71,240.27,238.44,236.43,228.97,223.51,228.79,229.9,228.86,222.65,226.38,221.11,222.15,233.6,220.6,218.81,218.81,199.68,198.13,197.85,197.42,202.66,205.31,202.69,202.23,201.54,205.74,207.79,205.49,207.43,209.01,213.07,214.11,213.39,217.7,208.94,217.52,216.8,219.38,224.69,227.17,232.16,232.2,229.65,227.96,226.13,222.72,223.47,222.94,221.46,218.77,213.6,211.16,205.74,213.57,212.6,216.55,221.93,232.81,251.08,253.16,255.92,249.07,255.42,250.54,261.34,267.34,266.94,271.75,277.28,275.38,288.94,297.74,291.24,291.24,296.7,296.05,302.48,306.14,309.05,318.88,319.96,322.15,315.22,315.47,316.94,317.66,317.55,317.84,314.07,309.01,310.16,307.39,301.62,306.28,306.28,304.63,302.48,312.2,309.76,311.81,321.61,326.02,339.41,343,351.62,358.97,351.94,379.76,370.21,370.21,392.03,387.08,387.54,381.66,388.08,378.79,353.84,363.07,347.02,363.28,371.82,358.47,370.57,361.49,381.16,378.25,380.04,405.6,418.88,418.88,424.8,415.33,407.14,428.79,413.6,416.87,440.81,408.94,424.23,438.8,421.75,414.36,388.51,407.21,379.33,409.98,404.45,420.64,410.23,412.35,425.34,430.37,410.19,412.28,428.32,417.73,434.67,429.72,461.74,451.22,454.99,479.54,507.97,507.97,513.46,500.86,499.43,500.18,498.6,484.57,484.92,481.48,482.45,480.01,469.81,461.56,484.75,472.9,484.06,492.82,490.95,487.04,485.97,476.35,476.85,462.02,467.66,472.83,477.21,447.56,443.47,412.35,430.44,448.06,443.54,437.22,447.95,467.73,461.81,483.06,493.54,491.39,494.69,495.8,495.8,496.09,498.96,489.52,501.97,498.82,487.65,483.31,492.32,491.1,499.03,497.63,491.67,492.89,471.03,477.57,478.97,486.36,496.27,488.84,506.07,509.4,511.13,495.15,495.91,495.91,490.95,484.1,475.7,484.21,491.03,489.2,486.9,478.1,460.09,461.67,473.69,495.33,492.39,496.88,497.06,484.21,492.5,493.54,502.26,509.73,510.27,512.42,510.66,512.02,509.69,495.55,483.92,463.82,466.26,472.68,462.31,457.18,463.75,456.57,471.97,471.79,476.74,475.56,490.13,488.33,485.03,479.04,482.59,487.54,487.54,489.91,479.4,484.57,491.17,500.5,503.02,506.93,517.19,505.38,486.47,485.21,495.69,506.5,509.4,512.35,476.99,460.41,462.06,463.5,449.39,459.69,454.13,459.01,453.05,457.65,454.99,460.19,474.05,472.33,478.39,483.13,480.9,478.61,487.9,487.29,473.8,474.37,488.23,490.49,500.75,506.86,512.38,538.87,550.22,549.03,560.98,539.84,552.4,562.89,560.91,566.62,559.87,569.78,538.51,529.61,534.53,534.85,534.85,514.32,542.79,528.32,544.4,525.81,523.44,529,563.14,564.57,547.92,548.21,528,530.26,551.54,526.56,524.59,520.5,543.5,546.73,558.11,558.11,584.06,573.01,577.82,567.05,564.82,574.05,568.41,551.83,561.16,541.31,536.93,547.2,572.68,564.18,599.43,599.43,546.88,513.53,499.46,484.78,499.96,477.35,486.65,467.16,475.41,495.98,497.52,505.24,489.99,486.61,488.62,498.03,517.59,501.69,475.56,473.3,501.94,505.96,489.84,478.64,478.64,467.55,458.94,478.89,487.15,481.69,465.22,478.03,468.92,451.33,427.93,445.62,461.67,448.56,443.79,431.19,446.55,468.34,473.76,485.07,481.69,486.29,471.72,497.45,491.96,494.11,507.68,487.44,473.08,457.32,464.61,436.86,428.32,439.34,430.58,417.23,411.2,419.45,406.89,406.89,412.31,420.17,423.15,415.25,404.88,410.88,390.95,390.56,411.45,396.09,405.49,408.47,426.45,407.29,403.8,379.58,384.71,373.01,383.2,401.51,396.55,419.38,399.64,397.49,382.12,394.58,382.59,389.55,413.03,428.86,428.86,421,410.84,421.14,412.63,412.78,415.18,403.66,384.92,365.69,345.73,346.81,349.68,321.57,322.43,322.43,341.6,337.19,334.82,349.46,350.36,341.06,330.01,326.56,309.66,309.66,308.69,310.7,325.74,327.32,318.09,318.49,319.74,329.04,339.09,334.31,352.58,366.94,372.72,364.93,362.53,355.03,371.36,377.46,380.4,381.91,376.85,391.28,398.64,393.47,387.04,357.72,377.06,378.79,396.2,394.04,389.41,380.47,388.62,375.56,361.84,365.87,364.25,376.88,354.63,346.52,339.27,337.65,329.54,327.49,327.49,324.08,330.01,336.65,346.41,345.66,324.44,325.34,319.17,318.99,322.04,316.3,312.6,305.24,302.55,297.7,302.05,308.69,303.02,294.08,309.58,320.93,320.24,316.3,296.48,284.24,273.87,272.83,285.07,268.56,267.09,270.03,277.32,282.34,295.84,304.88,314.18,316.37,310.62,322.04,316.91,322.29,315,309.76,329.15,341.13,349.82,338.77,376.13,396.73,386.25,396.48,374.08,374.91,375.81,377.39,384.21,386.47,386.47,379.83,371.39,370.6,393.4,384.1,383.02,382.02,375.84,380.87,389.84,385.28,392.57,401.54,393.54,375.31,375.92,373.26,371.5,380.11,350.32,348.96,348.96,342.21,338.23,348.67,349.53,349.53,347.2,356.46,351.47,374.26,382.23,387.8,395.05,395.55,394.72,394.72,392.71,393.75,381.05,393.58,409.76,405.56,409.01,414.86,403.8,388.37,400.18,427.17,446.02,430.65,422.43,432.59,416.19,416.65,411.95,418.27,425.13,428.79,414.18,414.36,414.36,399.43,396.3,405.28,399.53,402.26,416.91,420.89,425.16,426.99,425.48,417.7,425.88,420.1,410.59,415.79,431.95,425.27,440.88,440.06,445.23,432.16,426.63,440.7,429.04,426.67,417.8,430.19,438.3,440.88,439.05,431.16,421.11,410.8,410.8,418.16,417.73,406.17,407.29,405.24,401.26,399.39,396.05,410.59,407.25,407.79,397.02,395.94,400.86,405.71,405.42,402.58,406.64,403.63,416.58,415.47,408.61,414.25,414.43,416.69,434.71,434.03,451.18,466.33,455.67,454.24,446.84,436.93,468.31,488.37,488.37,490.2,478.46,483.96,483.24,480.01,480.76,484.6,488.87,488.59,502.55,508.94,506.71,502.91,498.67,498.67,497.2,490.56,498.64,488.41,501.79,526.02,516.98,517.7,518.81,522.15,522.15,510.62,503.88,500.97,504.52,493.75,498.53,512.02,512.35,522.25,518.7,508.9,481.12,489.59,496.59,502.73,498.99,524.55,545.33,544.11,547.85,528.82,530.55,522.83,539.77,531.26,521.03,519.06,498.31,509.3,502.8,496.23,493.86,512.06,533.99,530.69,531.23,511.56,518.16,521.97,538.33,541.82,548.31,552.73,552.73,551.36,549.82,532.05,529.54,526.6,516.76,518.95,518.92,496.23,503.48,494.29,491.64,485.25,488.77,490.27,481.26,484.78,496.12,496.95,500.75,490.74,500,499.93,503.55,503.05,507.54,510.34,520.46,506.6,506.1,512.28,507.72,482.52,481.41,481.8,484.21,467.01,469.63,471.28,470.32,475.05,485.61,497.16,501.62,503.8,508.76,517.7,513.89,540.85,537.47,553.05,557.68,555.67,533.35,547.63,535.71,536.54,536.54,539.63,541.31,531.44,536.11,537.62,544.11,532.2,524.59,519.38,532.63,530.22,556.86,564.32,563.5,580.55,581.3,575.59,582.66,563.24,579.29,581.66,581.66,589.66,589.41,585.5,581.73,554.09,543.61,535.93,534.82,544.01,542.1,537.72,545.41,542.89,542.89,551.9,550.5,575.52,602.8,604.09,599.61,625.05,619.63,599.07,604.74,596.7,589.73,599.32,603.66,614.11,605.53,613.42,624.16,667.05,665.97,647.2,668.31,673.58,716.33,716.33,678.89,683.17,716.91,707.68,730.62,728.14,709.05,723.69,754.67,751.94,744.4,761.56,763.14,737.83,722.79,735.61,719.89,720.57,713.03,720.5,722.68,736.04,756.64,754.67,748.24,741.82,746.59,740.24,740.24,749.07,739.81,744.36,730.04,746.05,750.32,755.24,751.08,764.47,746.09,738.26,751.9,717.48,697.49,681.16,680.04,693.61,703.73,708.9,730.01,736.76,713.03,696.3,710.37,732.56,749.68,744.15,744.29,740.6,752.8,741.67,753.12,780.65,768.23,761.23,789.48,788.94,783.02,782.3,792.86,792.86,794.4,786.25,777.24,772,768.88,761.74,801.76,795.94,795.87,818.95,825.45,853.02,852.66,850.79,871.72,889.55,889.55,861.41,844.97,824.98,840.88,833.35,834.64,847.06,852.15,864.54,873.33,873.33,870.75,884.03,902.62,915.18,865.97,873.65,881.37,882.41,789.91,781.23,754.7,802.12,788.41,741.31,726.2,741.1,737.87,706.17,761.67,704.59,652.58,652.87,657.97,640.74,683.96,686.22,693.07,720.75,723.73,760.34,746.23,757.14,739.99,750.61,718.59,727.46,704.34,702.69,692.35,692.68,708.04,708.04,658.18,654.63,646.95,627.24,637.29,639.09,667.41,657.61,676.49,673.3,676.92,668.13,706.07,689.73,696.48,706.32,708.22,752.37,735.53,725.23,707.82,722,716.4,724.95,718.34,721.03,736.04,732.09,736.04,767.73,685.64,662.56,657.72,668.92,662.1,656.86,655.78,659.55,669.49,665.25,682.41,665.11,651.76,658.22,652.62,669.35,673.08,696.66,689.27,676.81,669.81,656.1,667.62,606.17,612.81,607.72,611.95,630.83,627.71,626.53,621.68,614.93,614.93,627.1,657.82,657.43,650.25,617.48,621.03,616.87,603.63,614.25,606.89,607.86,608.08,611.41,593.86,579.47,587.19,601.08,604.34,604.34,601.4,598.82,587.37,583.74,588.19,610.41,637.04,638.26,635.28,635.28,616.12,613.28,623.3,640.27,669.35,689.34,689.34,692.28,701.76,684.49,670.32,626.6,620.42,629.15,652.26,647.34,641.78,640.92,648.49,656.14,646.09,659.22,657.57,649.28,661.41,607.32,607.32,617.37,624.77,631.77,617.3,605.06,594.19,604.85,562.24,567.37,546.05,548.71,557.5,543.93,558.79,538.37,527.6,535.03,538.23,558.72,558,551,554.41,554.13,546.02,556.17,551.47,540.85,530.08,520.67,520.89,522.83,530.33,486.4,455.67,476.85,462.89,537.44,496.2,520.24,518.77,522.07,496.02,493.4,493.4,486.58,496.41,515.36,539.02,543.97,541.24,536.79,540.95,534.67,556.71,554.95,549.28,559.26,559.94,558.54,602.98,621.07,625.05,627.24,594.29,595.62,594.87,582.3,576.17,565.36,565.36,580.87,580.01,572.43,562.63,564.5,580.55,581.23,589.34,598.49,609.44,623.73,620.21,628.14,612.31,633.7,624.87,620.39,620.39,608.26,617.23,646.73,657.11,658.72,657.61,657.11,659.58,682.02,685.75,685.75,684.78,699.89,701.33,710.8,710.45,707.47,715.33,699.25,691.03,683.56,691.35,671.72,671.25,675.23,666.51,682.95,676.27,679.79,646.3,646.05,656.21,643.04,639.41,657.39,663.57,661.81,676.42,682.09,675.66,580.62,586.97,582.27,577.75,573.73,583.24,581.44,590.49,590.06,593.22,577.03,577.03,565.58,560.84,567.98,584.17,581.66,586.86,586.58,610.73,602.3,613.53,622.9,639.38,681.12,682.34,719.74,721,723.04,716.44,731.95,735.64,734.89,781.55,802.55,780.8,803.7,759.37,780.73,790.74,753.59,787.8,783.17,816.87,817.37,807.57,818.84,811.2,791.67,820.06,821.07,830.33,817.09,846.2,834.71,836.68,853.23,826.24,864.64,838.23,825.81,843.79,820.78,828.18,801.26,811.23,820.93,808.04,843.97,790.49,804.06,828.82,870.28,897.24,897.24,905.42,914.39,952.37,964.21,967.12,961.95,962.53,958.87,987.62,969.53,930.4,937.8,929.07,891.13,909.91,920.35,929.68,934.06,936.04,936.04,940.06,944.19,933.13,922.43,965.08,1020.53,1062.49,1048.82,1010.91,1081.05,1102.8,1094.29,1083.6,1145.3,1173.76,1173.76,1142.25,1167.41,1144.26,1157.14,1146.66,1194.22,1208.72,1225.2,1156.93,1178.75,1143.83,1068.2,1091.13,1157.61,1186.54,1181.16,1219.96,1178.72,1273.91,1273.91,1289.05,1325.56,1327.46,1347.38,1340.81,1356.53,1417.62,1348.6,1336.32,1335.89,1261.02,1284.13,1243.83,1165.61,1216.58,1241.49,1260.12,1210.59,1225.88,1242.57,1265.11,1254.38,1282.16,1281.62,1298.6,1342.39,1325.7,1215.18,1210.23,1159.8,1226.81,1269.92,1250.79,1250.79,1265.69,1271.75,1384.49,1427.89,1433.92,1420.42,1420.1,1415.15,1399.5,1424.77,1405.67,1415.4,1448.24,1449.78,1496.91,1453.19,1367.95,1373.26,1415.97,1396.55,1404.81,1474.59,1538.48,1473.94,1562.96,1592.32,1547.74,1567.16,1581.34,1567.19,1484.46,1460.55,1532.12,1533.96,1551.18,1551.18,1632.77,1608.94,1614.07,1615.43,1644.54,1758.97,1797.45,1800.79,1626.02,1766.58,1791.85,1783.96,1983.63,2036.07,2102.58,2039.59,2128.21,2215.04,2215.04,2297.85,2102.94,2114.03,2397.7,2249.96,2493.32,2595.12,2336.36,2164.54,2164.54,2127.75,1990.31,2047.74,2112.92,2162.6,2065.29,2138.19,2079.79,2013.39,1901.15,1886.93,2026.38,1988.23,2020.1,1924.8,1855.31,1710.19,1566.58,1801.04,1822.22,1860.05,1962.02,1917.59,1893.32,1935.18,1874.08,1886.61,1967.52,1918.66,1820.46,1921.43,1846.12,1780.94,1781.08,1767.12,1737.94,1723.04,1722.04,1731.37,1657.11,1645.33,1585.97,1573.8,1564.64,1632.12,1632.12,1697.02,1682.88,1629.61,1638.51,1522.65,1511.74,1490.95,1498.21,1595.73,1666.33,1695.84,1702.73,1702.26,1740.85,1747.16,1837.8,1835.53,1899.86,1938.41,1946.45,1903.34,1868.81,1829.04,1819.92,1785.82,1785.82],"테슬라":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,98.14,96.86,99.43,101.66,99.43,99.93,101.26,101.05,101,101.88,99.87,98.75,95.28,93.9,93.6,95.17,96.49,97.35,94.92,92.56,94.17,90.62,91.77,91.85,94.22,92.4,92.15,95.47,96.45,96.45,98.21,97.94,94.67,94.59,90.83,90.63,93.29,92.81,96.46,96.03,95.97,96.1,98.96,99.23,98.67,101.12,101.24,104.27,103.73,104.1,106.54,106.54,109.63,109.74,107.21,106.72,106.72,108.36,113.36,113.24,114.37,115.5,114.8,114.73,114.66,118.73,118.73,117.65,119.04,121.73,122.22,124.31,127.15,127.08,126.1,126.32,125.16,125.81,124.47,125.62,125.51,128.73,128.59,130.88,134.44,134.45,140.13,140.32,139.71,134.31,135.95,135.95,138.53,136.59,127.84,128.35,122.97,124.85,124.86,125.09,125.63,125.45,124.15,123.29,122.3,121.7,122.94,128.85,127.71,130.87,130.59,130.8,125.19,127.35,127.24,131.42,134.95,138.56,138.52,138.79,138.98,149.08,151.67,147.32,149.17,151.09,156.01,154.17,148.24,151.82,151.82,150.54,149.95,152.58,151.07,152.62,153.83,156.71,154.9,154.13,156.85,161.22,159.25,155.32,147.55,153.99,153.41,160.44,162.42,161.36,162.21,157.75,158.32,152.87,156.34,155.23,154.99,151.75,154.92,158.23,162.38,162.38,167.35,170.3,169.98,169.72,173.45,176.21,179.61,184.78,178.45,179.29,187.75,190.1,187.45,185.48,184.68,185.9,187.97,191.08,191.5,188.52,180.97,185.4,180.16,180.59,176.1,176.1,163.35,154.23,156.42,157.84,163.41,164.56,161.51,163.69,159.59,163.92,162.44,164.76,164,171.05,169.6,171.72,167.03,167.33,161.54,159.59,162.75,173.34,178.24,177.37,182.39,181.55,177.49,178.72,181.68,180.95,181.24,175.75,173.52,168.73,170.47,176.17,176.25,173.82,172.62,173.47,176.38,177.74,177.49,177.49,174.59,172.06,175.09,171.49,181.63,181.16,182.9,188.59,189.68,192.27,187.33,186.73,183.02,175.33,172.29,172.42,170.28,169.6,170.35,170.56,173.86,177.29,177.45,178.23,171.26,177.58,177.09,177.63,177.57,175.09,177.66,179.61,175.69,172.34,168.31,168.47,162.72,162.89,160.24,159.85,165.57,160.35,149.45,152.86,151.21,152.84,152.01,151.31,151.31,157.51,154.17,155.46,156.06,157.34,154.18,158.71,156.11,156.11,157.59,158.22,158.58,153.59,154.24,153.08,152.42,151.67,156.44,155.43,157.38,164.26,170.31,169.31,168.74,171.52,169.23,165.35,164.29,165.63,162.41,162.41,158.45,155.63,157.49,155.49,160.07,158.43,157.12,158.1,168,166.65,167.2,168.77,167.91,167.91,169.83,173.37,172.08,174.8,175.57,176.18,172.74,168.62,171.22,174.56,172.7,176.94,174.42,171.67,166.37,166.78,172.29,157.43,155.02,157.68,161.64,160.96,166.83,167.54,167.54,167.18,166.45,172.88,175.81,178.5,175.28,171.32,165.27,167.36,166.48,163.9,165.95,164.35,163.39,172.55,170.72,163.12,162.6,160.48,156.59,155.09,158.08,154.36,150.59,151.91,139.42,128.74,132.91,132.91,126.09,133.6,143.3,152.68,149.47,144.66,152.17,150.28,146.86,149.99,145.43,143.67,146.5,149.86,144.95,141.52,141.56,140.18,142.57,146.86,146.77,149.78,150.39,142.05,146.87,151.2,150.8,153.24,152.33,150.35,145.81,141.92,143.07,142.1,138.24,142.07,137.34,139.37,138.76,139.26,139.26,141.71,145.69,142.19,145.74,148.19,145.39,159.56,157.86,158.64,165.85,171.18,172.18,178.65,178.87,185.19,176.06,180.89,173.55,166.62,166.31,170.8,172.04,174.76,171.27,167.33,155.24,155.24,154.39,154.26,159.06,161.04,159.29,158.17,159.24,154.86,161.15,161.73,159.92,156.6,151.42,148.54,154.18,153.14,148.41,144.91,148.89,150.24,174.56,173.88,170.79,189.56,184.95,176.01,177.53,177.99,173.61,169.14,167.52,152.57,154.04,160.76,160.63,159.86,161.22,159.44,155.74,152.32,151.39,150.65,150.65,144.3,140.2,140.31,131.46,142.58,139.55,145.1,144.56,147.42,147.24,142.31,149.33,148.99,149.37,149.66,150.31,154.6,153.58,132.23,155.16,150.33,147.22,140.75,130.82,125.13,131.24,128.29,125.96,129.23,129.64,138.13,135.73,131.8,129.84,130.32,146.89,144.08,157.24,165.25,167.22,164.75,168.46,171.93,173,170.5,170.33,173.87,175.49,175.04,165.44,169.16,171.79,174.01,176.94,176.52,173.54,168.89,168.89,162.72,172.79,171.75,173.73,170.38,175.03,179.03,179.63,179.63,181.31,178.77,182.36,183.16,183.08,188.17,182.64,174,168.31,166.29,157.5,159.69,147.52,147.52,162.85,157.88,166.73,166.2,154.87,150,158.65,167.28,167.47,169.06,172.28,173.42,167,172.01,172.82,173.45,150.95,150.95,149.28,143.62,145.58,148.34,148.01,148.55,154.2,153.33,155.92,156.26,160.48,158.42,153.57,152.72,156.23,155.72,153.9,151.7,153.76,153.76,152.64,151.1,145.44,147.18,149.21,148.75,157.18,159.75,147.22,142.51,138.1,137.95,138.13,141.9,145.29,141.51,144.31,144.81,137.55,134.58,133.57,136.64,136.85,132.11,130.05,133.72,137.25,139.14,139.76,144.42,142.77,145.73,133.73,137.32,136.44,135.99,137.86,134.05,133.69,133.03,136.52,135.45,136.47,136.47,131.22,131.79,129.17,123.67,117.43,120.59,119.2,116.86,121.9,127.36,127.52,123.38,122.27,120.84,119.62,113.37,116.02,115.84,114.03,105.39,102.56,102.42,96.25,97.63,95.2,95.2,94.24,94.82,94,92.47,89.38,96.68,98.18,102.85,102.13,106.31,108.42,104.5,106.83,107.33,112.38,112.24,113.08,109.68,110.8,111.69,109.75,109.5,111.29,111.6,113.45,112.14,117.31,117.31,116.41,115.03,114.89,119.32,119.16,122.39,126.6,126.04,127.28,126.62,128.94,127.69,129.93,132.28,114.27,113.88,117.74,120.98,120.66,116.78,117.03,114.02,115.24,116.57,119.01,117.36,114.37,117.36,109.68,107.69,109.84,113.28,112.79,110.28,110.94,105.57,107.37,106.91,107.67,110.72,112.67,112.67,112.37,110.21,114.65,113.59,115.76,117.63,123.4,122.79,122.45,121.26,122.25,121.6,123.15,120.17,120.47,111.47,114.21,121.13,120.92,120.29,122.2,121.42,116.38,115.58,118.72,119.88,122.12,122.22,123.8,128.33,128.79,129.72,130.83,128.32,126.6,127.64,127.19,149.66,163.87,163.66,157.92,157.32,157.27,156.47,158.54,158.42,163.09,167.57,168.37,172.34,174.76,172.85,174.47,175.87,174.79,179.54,175.9,177.2,166.32,167.97,164.26,165.45,165.45,164.77,167.23,167.9,166.32,164.99,167.74,169.56,174.21,176.14,179.62,178.98,190.52,189.27,196.34,201.78,202.55,209.36,212.37,212.37,215.21,214.93,207.1,208.91,214.87,221.24,225.5,234.25,245.78,240.38,238.79,262.12,268.64,258.94,256.44,254.94,254.94,273.27,284.44,285.76,282.07,278.68,283.11,290.15,320.02,324.9,389.53,443,366.91,374.03,373.59,385.18,386.73,383.19,401.52,399.54,399.54,428.69,458.16,449.17,449.96,416.4,399.48,388.93,339.09,333.59,371.36,372.31,374.3,361.84,351.32,303.64,322.28,316.73,279.94,272.98,222.27,214.84,180.39,213.56,213.51,216.88,252.2,269.3,263.76,256.87,250.76,261.69,240.49,226.96,239.72,257.81,272.4,274.09,286.16,286.16,325.08,354.52,364.48,372.16,376.49,372.73,342.95,365.62,352.39,362.14,398.9,384.1,399.78,390.47,350.24,380.14,383.64,390.82,389.55,409.22,405.16,404.22,395.01,401.18,399.11,406.33,403.52,407.29,413.3,407.95,407.95,408.94,409.62,402.42,417,448.51,440.25,440.95,431.67,442.3,474.39,469.77,511.91,485.84,467.08,494.86,490.48,495.3,501.38,499.85,496.56,500.29,479.85,492.4,479.29,504.07,539.26,559.14,603.61,603.61,684.97,694.1,682.12,696.3,771.4,747.63,757.49,772.08,749.42,749.52,820.52,783.24,795.21,755.63,707.65,768.88,737.36,748.66,742.85,714.52,741.61,742.61,741.62,743.9,725.48,708.43,686.37,776.45,809.53,824.37,916.72,942.41,938.14,999.72,1023.76,1005.89,1010.46,1075.29,1118.03,1105.37,1244.31,1186.2,1117.08,1016.28,1044.55,1044.55,824.54,914.6,927.24,930.68,1047.79,1123.05,1103.08,1057.31,1104.05,1122.13,1059.3,949.76,968.31,1017.13,1051.74,1046.42,1071.24,1119.06,1036.48,1062.92,1033.71,1061.98,1063.52,1083.7,1104.42,1115.29,1151.87,1120.85,1097.86,1075.78,1053.59,1055.33,1063.2,1050.31,1049.44,1060.43,1013.83,1025.84,968.94,1000.07,1058.48,1051.19,1093.91,1073.59,1051.89,1024.67,1041.58,1028.17,1020.03,1019,1102.7,1215.14,1246.68,1222.56,1303.06,1386.79,1433.28,1433.28,1462.64,1417.3,1460.15,1420.35,1481.67,1495.81,1602.48,1622.75,1509.39,1565.8,1523.15,1597.66,1581.23,1555.06,1637.78,1735.42,1622.7,1598.93,1613.01,1652.44,1652.44,1657.24,1662.98,1734.87,1762.06,1822.24,1835.57,1887.68,2037.65,2197.41,2025.54,2121.05,2133.47,2109.97,2062.92,2062.92,2108.84,2123.58,2109.94,2114.06,2199.36,2205.08,2157.81,2086.07,1981.45,2097.01,2179.36,2134.16,2122.43,2128.02,2155.96,2121.1,2009.64,2026.72,2037.85,2037.85,1988.16,1992.98,1966.09,1950.91,1784.11,1745.01,1852.83,1703.51,1686.73,1793.92,1714.04,1631.04,1551.74,1493.08,1405.81,1681.93,1668.15,1746.9,1732.25,1767.73,1690.17,1752.42,1630.94,1635.21,1672.99,1653.42,1573.79,1599.06,1544.92,1526.39,1587.15,1667.82,1652.39,1652.39,1725.55,1726.98,1675.41,1707.45,1690.52,1752.85,1903.52,1828.38,1844.91,1847.23,1784.43,1795.32,1858.07,1797.07,1821.31,1843.29,1759.74,1733.92,1690.47,1771.47,1710.2,1681.98,1675.34,1656.86,1678.91,1570.72,1541.15,1472.96,1427.51,1472.58,1440.35,1442.94,1406.96,1465.19,1450.46,1514.28,1509.91,1545.97,1575.23,1561.18,1561.18,1557.88,1510.99,1430.38,1495.83,1511.01,1507.17,1495.16,1523.47,1522.9,1542.37,1496.6,1510.36,1539.65,1556.41,1550.21,1557.41,1639.46,1697.51,1677.66,1719.74,1699.86,1697.21,1692.77,1695.22,1695.22,1646.97,1609.69,1630.07,1640.41,1712.2,1669.35,1631.49,1624.55,1608.62,1613.61,1649.27,1636.26,1621.2,1606.52,1642.08,1610.02,1615.51,1691.35,1715.94,1772.05,1772.22,1775.17,1784.43,1745.66,1782.26,1772.85,1767.43,1803.46,1790.78,1713.37,1662.28,1720.41,1681.66,1698.61,1763.63,1769.1,1775.87,1750.8,1777.67,1825.09,1837.1,1833.03,1828.78,1831.73,1831.73,1880.04,1882.42,1884.89,1838.47,1855.27,1858.99,1887.31,1890.21,1896.45,1823.24,1846.23,1877.6,1881.84,1933.65,1976.03,1941.57,1950.93,1936.38,1935.73,1951.48,1949.14,1954.53,1981.65,1961.37,1977.48,2011.89,2025.27,2043.35,2105.05,2172.67,2158.09,2161.91,2232.32,2271.47,2559.08,2543.02,2591.54,2689.37,2781.66,3017.85,2926.49,3031.01,3071.09,3051.56,2903.87,2555.68,2666.68,2655.59,2580.45,2530.44,2633.66,2719.26,2737.66,2839.24,2888.71,2769.25,2786.66,2786.66,2701.56,2839.07,2858.47,2734.22,2708.25,2534.38,2519.5,2626.22,2669.2,2506.49,2539.53,2413.13,2393.4,2437.05,2314.52,2328.63,2247.15,2343.51,2519.15,2664.3,2664.3,2731.57,2717.91,2712.22,2672.64,2638.78,2995.86,2870.53,2717.04,2658.56,2564.32,2642.13,2657.81,2762.24,2575.81,2620.88,2620.88,2573.19,2486.14,2487.69,2356.92,2322.21,2293.25,2340.72,2070.27,2113.34,2338.99,2325.33,2261.44,2225.18,2305.53,2265.63,2302.24,2327.21,2258.66,2147.42,2186.78,2303.31,2305.71,2188.25,2139.88,2139.88,2051.36,1907.81,1999.53,2022.25,2173.47,2158.33,2197.09,2095.71,2093.21,2009.04,2058.53,2144.85,2093.24,1985.99,1913.63,2002.32,2098.06,2176.39,2260.76,2300.14,2481.97,2494.78,2531.76,2523.57,2726.33,2745.63,2731.7,2690.77,2708.23,2860.19,2724.88,2611.27,2639.98,2560.65,2436.9,2464.42,2552.86,2459.55,2459.55,2507.72,2567.29,2440.07,2518.93,2509.61,2492.06,2188.42,2201.13,2191.15,2174.29,2254.64,2270.4,2378.7,2180.58,2161.53,1965.42,1997.7,1832.8,1817.82,1921.67,1808.75,1901.74,1772.4,1771.42,1657.76,1685.23,1568.52,1645.03,1767.2,1896.8,1896.8,1893.38,1848.71,1935.18,1756.77,1784.96,1789.5,1811.83,1795.65,1739.64,1616.09,1654.69,1745.41,1596.33,1623.75,1623.75,1775.64,1768.53,1760.91,1840.59,1834.7,1742.88,1711.62,1681.53,1702.43,1702.43,1745.9,1735.92,1831.88,1878.47,1755.47,1745.93,1775.67,1785.21,1798.34,1801.94,1839.27,1854.03,2035.36,2039.38,2010.84,1939.12,2058.68,2104.22,2225.95,2226.9,2251.7,2302.71,2311.98,2158.68,2175.56,2122.45,2205.03,2147.15,2247.53,2317.12,2296.47,2277.24,2268.8,2222.33,2171.74,2220.74,2225.55,2217.86,2158.09,2133.59,2080.25,2064.6,2076.21,2024.15,2024.15,2055.68,2125.2,2166.85,2244.91,2280.41,2188.35,2266.85,2275.39,2272.4,2315.25,2312.7,2253.3,2161.83,2062.5,2067.59,2119.51,2155.99,2009.16,1986.99,1815.82,1868.56,1803.91,1783.83,1671.02,1670.2,1621.8,1627.35,1660.91,1535.58,1643.15,1649.45,1663.3,1552.74,1606.37,1582.48,1666.15,1682.78,1686.15,1711.85,1704.5,1706.6,1610.42,1612.89,1554.16,1476.33,1433.03,1330.33,1428.69,1468.01,1430.41,1456.4,1400.22,1372.13,1349.81,1257.52,1272.8,1372.35,1372.35,1369.81,1370.26,1354.6,1458.5,1458.5,1459.7,1366.73,1347.03,1303.74,1299.24,1341.27,1257.14,1205.68,1174.59,1181.11,1125.37,1122.68,1032.26,1030.54,939,922.52,922.52,817.27,844.31,912.55,922.74,922.74,809.78,851.28,826.56,846.93,897.2,890.31,923.04,925.59,916.9,916.9,984.99,964.69,952.63,999.45,1076.83,1077.88,1081.93,1200.58,1332.65,1248.45,1297.59,1358.94,1410.33,1423.14,1458.95,1474.31,1507.87,1553.04,1474.91,1458.05,1567.49,1604.87,1513.48,1560.45,1560.45,1478.5,1504.64,1513.71,1474.83,1555.36,1540.98,1518.95,1430.03,1481.65,1451.83,1406.14,1363.36,1295.35,1299.24,1307.03,1372.8,1351.75,1379.32,1349.36,1372.73,1480.07,1431.91,1439.92,1426.36,1436.85,1417.22,1452.36,1462.84,1554.09,1459.02,1442.62,1389.73,1386.29,1386.29,1382.17,1399.25,1352.43,1392.58,1385.84,1401.12,1380.67,1352.8,1220.96,1236.62,1217.66,1203.58,1151.74,1199.99,1230.85,1212.27,1200.88,1203.13,1207.55,1273.92,1286.88,1267.1,1262.53,1289.05,1258.34,1246.13,1247.4,1302.39,1325.08,1349.43,1414.83,1391.61,1370.11,1381.87,1447.04,1447.04,1506.89,1527.64,1554.53,1602.85,1630.12,1657.84,1682.26,1759.34,1830.8,1871.48,1938,1923.62,1916.95,1951.71,1951.71,2055.91,1943.62,1982.2,1922.19,1805.71,1874.33,1919.5,1928.94,1960.92,2096.13,2096.13,2116.06,2071.56,2055.76,2019.65,2021,2037.48,2081.75,2107.82,2175.24,2197.41,2181.83,1969.39,1947.81,2015.53,1987.22,1980.25,1915.53,1995.91,2003.32,1955.68,1903.54,1942.57,1901.67,1883.61,1870.51,1814.25,1837.84,1817.69,1796.04,1745.11,1689.97,1642.18,1614.24,1732.52,1746.83,1774.32,1723.23,1787.28,1789,1926.54,1924.44,1933.28,1835.37,1835.37,1921.37,1887.14,1883.91,1861.52,2049.39,2003.7,2032.31,2067.82,2055.46,1987.22,1996.35,1967.06,1915.45,1834.4,1850.2,1828.71,1801.59,1845.64,1874.4,1884.74,1846.76,1956.35,1948.04,1951.63,1945.19,1974.78,1970.06,1939.2,1881.14,1902.12,1909.08,1817.92,1648.85,1588.02,1588.69,1621.95,1591.24,1541.35,1552.89,1478.43,1504.49,1540.6,1636.86,1647.72,1642.55,1664.35,1663.83,1572.96,1607.95,1675.81,1778.44,1819.12,1749.83,1755.14,1764.88,1806.83,1754.47,1754.47,1763.76,1768.48,1848.18,1828.86,1798.44,1789.08,1764.73,1788.25,1793.12,1817.62,1826.61,1795.9,1775.44,1792.52,1880.62,1898.97,1888.33,1926.84,1851.33,1906.46,1891.78,1891.78,1922.27,1958.45,1896.57,1861.37,1860.92,1786.23,1782.34,1779.04,1801.21,1760.09,1752.45,1702.11,1639.71,1639.71,1647.35,1614.69,1587.2,1589.52,1564.12,1566.67,1556.86,1368.08,1372.73,1430.26,1435.2,1402.99,1414.75,1407.64,1356.32,1386.59,1405.16,1420,1450.04,1409.28,1378.5,1413.63,1501.57,1497.83,1497.83,1451.46,1459.02,1478.8,1438.05,1493.71,1496.18,1513.48,1512.29,1517.98,1409.36,1353.93,1322.46,1338.27,1313.47,1331.68,1329.95,1269.58,1217.29,1225.3,1301.94,1283.36,1315.87,1294.6,1279.69,1293.17,1330.93,1347.11,1316.84,1316.84,1312.57,1248.23,1261.34,1281.79,1235.27,1295.8,1325.01,1286.66,1307.93,1281.34,1209.65,1176.91,1164.48,1123.13,1101.55,1064.1,1083.8,1214.52,1274.82,1260.66,1453.63,1372.95,1348.31,1348.46,1357.3,1384.04,1331.98,1308.83,1288.23,1262.01,1287.63,1330.03,1303.36,1309.73,1329.35,1310.55,1397.82,1349.21,1301.49,1342.69,1342.69,1324.04,1319.84,1339.32,1334,1320.59,1309.2,1310.93,1332.95,1329.5,1301.86,1278.42,1328.08,1366.88,1333.47,1404.12,1384.79,1384.79,1360.14,1370.93,1367.71,1403.44,1471.01,1478.88,1482.32,1572.06,1732.37,1845.71,1845.71,1884.14,1894.78,1965.12,1972.08,1805.56,1859.49,1892.53,1921.89,1861.52,1866.98,1791.85,1884.06,1845.64,1617.98,1649.9,1646.52,1738.66,1667.65,1738.44,1624.5,1555.66,1489.81,1503,1436.48,1489.51,1498.2,1479.4,1556.86,1508.54,1604.13,1618.96,1668.4,1656.26,1672.52,1578.06,1650.42,1597.16,1567.19,1541.28,1545.25,1603.9,1603.9,1577.61,1643.6,1724.21,1578.58,1620.08,1694.24,1708.92,1721.51,1725.1,1698.81,1706.98,1701.96,1827.21,1784.73,1872.75,1904.74,1925.34,1904.36,1951.11,1959.87,1932.83,1865.41,1802.79,1873.35,1804.06,1831.55,1805.71,1788.63,1631.54,1641.73,1644.8,1657.99,1654.69,1653.27,1639.41,1632.82,1600.45,1951.26,2016.51,1966.47,1944.07,1929.31,1871.63,1865.11,1819.12,1883.54,2161.38,2224.16,2406.26,2621.85,2460.72,2473.83,2331.05,2402.52,2537.51,2591.89,2562.15,2544.25,2641.03,2536.38,2533.68,2493.68,2493.68,2585.6,2674.97,2632.49,2681.26,2767.85,2915.65,2919.92,3003.82,3181.96,3131.99,3267.8,3468.49,3594.64,3297.02,3267.35,3154.17,3225.63,3462.94,3462.94,3401.89,3233.57,3126.82,3025.17,2841.19,3074.61,3079.18,2954.16,2958.5,2958.5,2957,3021.2,2969.14,3207.8,3099.93,3194.92,3194.92,3176.71,3109.59,3089.14,3045.7,2975.06,2982.1,2914.75,2998.5,3030.86,2874.15,2938.05,2832.88,2804.04,2708.9,2627.32,2460.8,2520.8,2666.35,2665.6,2665.6,2652.64,2700.96,2654.81,2530.46,2476,2268.28,2178.39,2112.09,2194.72,2132.32,2037.85,2090.74,1973.51,1967.66,1664.13,1727.28,1858.44,1802.94,1872.6,1782.94,1687.8,1766.83,1769.83,1863.09,2085.42,2158.46,2038,2046.02,1974.26,1941.37,2011.04,2118.16,2002.2,1793.57,1747.58,1661.96,2039.05,1890.73,1890.06,1890.36,1903.54,1809.45,1808.11,1808.11,1704.21,1782.64,1878.3,1943.99,2134.56,2141.53,2187.6,2113.66,2101.38,2151.49,2099.43,2062.65,2069.17,2133.59,2234.27,2384.99,2502.52,2604.47,2568.07,2621.7,2562.6,2575.56,2506.64,2554.73,2542,2542,2718.41,2673.54,2685,2595.34,2567.09,2578.93,2487.39,2132.69,2210.9,2311.58,2442.74,2445.29,2390.46,2436.9,2465.52,2369.78,2412.48,2412.48,2413.3,2611.97,2550.46,2453.68,2440.42,2424.32,2379.59,2252.62,2364.54,2362.29,2362.29,2201.91,2230.9,2216.44,2321.24,2348.51,2373.9,2328.06,2409.63,2392.7,2469.41,2460.72,2487.84,2491.21,2287.01,2367.61,2439,2406.11,2389.93,2309.25,2267,2316.67,2312.62,2396.45,2414.13,2469.41,2539.68,2553.24,2542.3,2513.83,2476.23,2510.69,2466.86,2426.34,2397.95,2547.02,2596.38,2634.36,2618.86,2591.74,2501.02,2501.02,2467.24,2502.67,2535.93,2628.15,2594.89,2599.16,2605.3,2762.76,2965.99,3071.61,3158.36,3190.12,3122.63,3191.7,3252.67,3190.05,3316.94,3171.62,3299.04,3320.09,3331.4,3441.82,3266.08,3219.86,3395.3,3244.28,3286.23,3262.64,3097.46,3265.33,3215.44,3259.71,3211.77,3290.88,3351.7,3315.52,3288.33,3363.31,3249,3389.08,3449.99,3457.18,3296.79,3420.1,3508.56,3327.96,3461.37,3340.32,3217.54,3335.22,3293.2,3225.63,3011.31,3028.99,3063.22,3005.77,3026.29,2960.67,2929.66,3129.59,3141.73,3195.52,3195.52,3222.41,3222.18,3215.44,3346.53,3404.89,3408.41,3292.9,3334.77,3381.82,3347.66,3438.07,3560.55,3669.7,3500.25,3620.93,3604.67,3661.08,3637.34,3636.14,3636.14,3559.65,3443.17,3404.14,3368.86,3281.59,3383.47,3243.31,3231.7,3264.58,3333.57,3363.16,3349.98,3290.05,3285.33,3277.32,3277.32,3140.61,3231.92,3366.16,3363.91,3260.09,3227.88,3232.07,3120.46,3224.21,3159.78,3160.91,3041.43,2975.5,3079.63,3126.15,3185.25,3208.18,3124.28,3127.05,3127.05,3076.03,3081.2,3084.12,3084.95,2995.13,3066.67,3126.75,3060.68,3015.21,3021.27,2939.7,3040.9,3037.98,2971.91,2986.52,2990.71,3054.98,2959.02,2930.48,2963.14,2990.94,2942.32,2848.83,2756.39,2852.95,2869.28,2891.16,2787.48,2710.47,2661.41,2784.78,2856.02,2701.18,2701.18,2642.98,2596.76,2571.29,2589.04,2613.99,2639.98,2728.23,2936.1,2913.25,3001.05,2940.22,2894.68,2902.84,2799.54,2818.87,2836.62,2816.77,2792.65,2858.79,2927.64,2940.3,2916.77,2986.89,3084.72,3208.77,3333.5,3246.98,3335.52,3320.77,3163,3071.24,3027.19,3125.7,3130.12,3191.25,3191.25,3248.03,3298.74,3311.78,3264.51,3115.36,3174.24,3173.94,3134.61,2928.99,3063.45,2971.53,2858.49,2990.04,3044.57,3079.93,3031.31,2969.29,3000.07,3000.07,3034.23,2858.64,2813.1,2810.03,2844.41,3085.1,3150.72,3185.93,2947.34,2947.34,3144.5,3018.13,2951.91,3045.47,3054.53,2957.15,2967.79,2954.9,2929.43,2852.88,2768.45,2838.57,2801.71,2394.8,2344.91,2316.37,2303.04,2234.72,2313.6,2331.28,2412.7,2452.18,2408.73,2393.6,2461.4,2478.63,2493.08,2453.38,2546.64,2563.95,2541.7,2523.5,2630.24,2585.37,2718.19,2613.99,2623.73,2590.54,2657.89,2612.49,2756.32,2667.47,2674.37,2819.39,2652.42,2652.42,2757.89,2755.27,2723.43,2737.52,2689.05,2671.14,2682.38,2743.21,2728.75,2811.38,2838.34,2847.48,2831.15,2787.48,2677.66,2643.13,2657.89,2652.64,2776.09,2837.07,2851.68,2830.18,2809.13,2866.81,2831.83,2831.83],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1957.16,1960.95,1961.89,1893.89,1783.79,1921.37,1835.05,1835.05,1792.63,1784.53,1745.89,1760.32,1824.32,1816.42,1835.16,1855.16,1869.89,1927.26,1947.26,2018.84,2027.26,1996.53,1973.47,1968.11,1968.95,2000.42,1986.84,1993.68,2021.79,2043.37,2092.42,2200.53,2200,2200]},"symbols":{"AMD":"AMD","EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","어플라이드 머티어리얼즈":"AMAT","테슬라":"TSLA","팔란티어 테크":"PLTR"},"missing":[],"stale":["KOSPI200"]}
};
