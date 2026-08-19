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
  "updatedAt": "2026-08-04T06:36:21.116Z",
  "source": "live",
  "sourceNote": "미래에셋증권 홈페이지 ELS/DLS 캘린더 (청약 진행중)",
  "sourceNoteEn": "Mirae Asset Securities ELS/DLS calendar — currently on offer",
  "products": [
    {
      "code": "KR6MD0008RJ5",
      "name": "미래에셋증권(ELS)37998e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 50.4,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 12,
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
          "barrier": 65
        }
      ],
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-65, KI 40, 원화, 1년만기",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RC0",
      "name": "미래에셋증권(ELS)37992",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 42.3,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 12,
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
          "barrier": 65
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-65, KI 35, 원화, 1년만기",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008R47",
      "name": "미래에셋증권(ELS)37984",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 19,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 12,
      "schedule": [
        {
          "months": 3,
          "barrier": 85
        },
        {
          "months": 6,
          "barrier": 80
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
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-80-75-70, KI 35, 원화, 1년만기",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RD8",
      "name": "미래에셋증권(ELS)37993",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 53,
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
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RL1",
      "name": "미래에셋증권(ELS)38000e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "KOSPI200"
      ],
      "couponRate": 44.6,
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
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RK3",
      "name": "미래에셋증권(ELS)37999e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 40.6,
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
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RH9",
      "name": "미래에셋증권(ELS)37997e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 40.5,
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
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-75-75-75-75-70-70-70-65, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RB2",
      "name": "미래에셋증권(ELS)37991",
      "type": "ELS",
      "shape": "월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 34.41,
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
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70(월지급배리어:50), KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RA4",
      "name": "미래에셋증권(ELS)37990",
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
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-75-75-75-75-70-70-70-65, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008R96",
      "name": "미래에셋증권(ELS)37989",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 24.2,
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RG1",
      "name": "미래에셋증권(ELS)37996e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 24.2,
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008R88",
      "name": "미래에셋증권(ELS)37988",
      "type": "ELS",
      "shape": "스텝다운 노낙인",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 23.5,
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75-75-70-65-60, KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RF3",
      "name": "미래에셋증권(ELS)37995e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 22.2,
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
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 30,
      "principalProtection": 0,
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-80-80-80-80-75-75-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008R70",
      "name": "미래에셋증권(ELS)37987",
      "type": "ELS",
      "shape": "리자드",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
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
          "barrier": 75,
          "lizard": 45,
          "lizardRate": 20.5
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75(45)-75-70-65-60, KI -, 원화, 리자드 조건 충족 시 연 20.5%",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008R62",
      "name": "미래에셋증권(ELS)37986",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 20.3,
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008R54",
      "name": "미래에셋증권(ELS)37985",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 20,
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
          "barrier": 75
        },
        {
          "months": 36,
          "barrier": 70
        }
      ],
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-80-80-80-80-75-75-75-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008R39",
      "name": "미래에셋증권(ELS)37983",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 17.3,
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RE6",
      "name": "미래에셋증권(ELS)37994e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "S&P500"
      ],
      "couponRate": 13.5,
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
      "knockIn": 50,
      "principalProtection": 0,
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70, KI 50, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008R21",
      "name": "미래에셋증권(ELS)37982",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "S&P500"
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
          "barrier": 90
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-90-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RM9",
      "name": "미래에셋증권(ELB)4039",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 10.71,
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
      "offerStart": "2026-07-27",
      "offerEnd": "2026-08-05",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-70-70-70-70-70-70-70-70-70(월지급배리어:70), KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008SB0",
      "name": "미래에셋증권(ELS)38021e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 50,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 12,
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
          "barrier": 65
        }
      ],
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-65, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S79",
      "name": "미래에셋증권(ELS)38017",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 52,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 18,
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
          "barrier": 80
        },
        {
          "months": 15,
          "barrier": 75
        },
        {
          "months": 18,
          "barrier": 70
        }
      ],
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S04",
      "name": "미래에셋증권(ELS)38010",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 19,
      "rateBasis": "annual",
      "maxLossRate": -100,
      "maturityMonths": 12,
      "schedule": [
        {
          "months": 3,
          "barrier": 85
        },
        {
          "months": 6,
          "barrier": 80
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008SA2",
      "name": "미래에셋증권(ELS)38020e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 46,
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
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008SD6",
      "name": "미래에셋증권(ELS)38023e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "KOSPI200"
      ],
      "couponRate": 42.5,
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
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008SC8",
      "name": "미래에셋증권(ELS)38022e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "어플라이드 머티어리얼즈"
      ],
      "couponRate": 42.4,
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
      "knockIn": 25,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70 , KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S61",
      "name": "미래에셋증권(ELS)38016",
      "type": "ELS",
      "shape": "월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 37.41,
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
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70(월지급배리어:50), KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S53",
      "name": "미래에셋증권(ELS)38015",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 33.5,
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
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-65, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S46",
      "name": "미래에셋증권(ELS)38014",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 27,
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
      "knockIn": 20,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-75-75-75-75-70-70-70-65, KI 20, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S38",
      "name": "미래에셋증권(ELS)38013",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S95",
      "name": "미래에셋증권(ELS)38019e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 22,
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S20",
      "name": "미래에셋증권(ELS)38012",
      "type": "ELS",
      "shape": "스텝다운 노낙인",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 21.4,
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75-75-70-65-60, KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S87",
      "name": "미래에셋증권(ELS)38018e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008S12",
      "name": "미래에셋증권(ELS)38011",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 20,
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85-85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RZ1",
      "name": "미래에셋증권(ELS)38009",
      "type": "ELS",
      "shape": "리자드",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 18.4,
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
          "barrier": 75,
          "lizard": 40,
          "lizardRate": 18.4
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
      "riskGrade": 2,
      "riskLabel": "높은위험",
      "riskCode": "12",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75(40)-75-70-65-60, KI -, 원화, 리자드 조건 충족 시 연 18.4%",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008RY4",
      "name": "미래에셋증권(ELS)38008",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "S&P500"
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
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0008SE4",
      "name": "미래에셋증권(ELB)4041",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 8.79,
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
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-70-70-70-70-70-70-70-70-70(월지급배리어:65), KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    }
  ],
  "history": {"updatedAt":"2026-08-19T23:21:27.152Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20160819,20160822,20160823,20160824,20160825,20160826,20160829,20160830,20160831,20160901,20160902,20160905,20160906,20160907,20160908,20160909,20160912,20160913,20160914,20160915,20160916,20160919,20160920,20160921,20160922,20160923,20160926,20160927,20160928,20160929,20160930,20161003,20161004,20161005,20161006,20161007,20161010,20161011,20161012,20161013,20161014,20161017,20161018,20161019,20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819],"series":{"EuroStoxx50":[100,99.74,100.86,101.36,100.66,101.42,101.02,102.11,101.85,101.66,103.76,103.69,103.44,104.16,103.89,102.86,101.51,100.22,99.89,100.19,98.89,100,99.89,100.47,102.81,102.16,100.26,100.09,100.77,100.79,101.15,101.02,102.07,101.96,101.8,101.09,102.28,101.77,101.34,100.23,101.92,101.37,102.65,102.96,103.65,103.69,104.23,104.02,103.8,103.94,103.74,102.93,101.85,100.4,100.18,99.54,101.38,101.86,102.97,102.64,102.08,102.41,102.75,101.96,102.48,101.77,102.18,102.56,102.15,102.44,102.7,101.64,102.37,102.81,102.12,101.58,102.85,104.47,105.86,107.33,107.73,107.78,109.05,108.2,109.49,109.81,109.76,110.48,110.19,110.15,110.3,110.3,110.46,110.46,110.23,110.86,110.86,111.68,111.77,111.73,111.89,111.48,111.39,111.45,110.73,112,110.99,110.67,110.98,110.85,111.16,110.27,110.56,112.06,111.82,111.29,109.92,108.84,109.79,109.62,110.27,109.1,109.01,109.09,110.43,110.2,111.35,111.48,111.98,111.55,111.48,111.6,112.5,112.5,112.32,111.32,111.49,111.84,114.22,114.03,114.66,114.13,114.05,114.2,114.88,115.1,115.07,114.53,114.86,115.89,116.18,115.81,115.55,115.24,116.31,116.03,115.8,116.74,117.08,117.3,117.95,117,117.3,116.99,117.57,117.78,117.26,116.91,116.86,116.17,116.17,116.17,114.88,115.25,115.9,115.9,120.52,120.72,120.57,120.05,119.92,119.92,120.55,120.82,122.22,123.27,122.7,122.94,122.83,122.08,122.55,122.7,122.7,120.77,120.01,120.85,120.49,121.12,120.83,120.83,120.58,120.58,119.98,119.76,120.17,121.01,121.01,119.74,119.56,120.07,120.82,119.4,119.87,119.51,118.77,119.39,120.6,119.96,119.75,119.8,119.39,120,119.21,119.12,116.95,115.96,117.64,117.22,117.19,116.64,116.7,117.18,116.72,118.43,118.85,118.79,118.47,117.2,117.93,117.9,116.29,116.34,117.03,117.62,117.69,116.83,116.21,116.21,116.55,116.78,118.17,118.11,118.44,116.85,115.68,114.76,116.25,116.63,117.4,116.64,116.1,115.34,116.42,115.85,116.05,115.85,115.26,114.15,114.67,115.27,116.03,115.57,115.25,115.69,116.15,116.15,117.75,118.34,118.7,118.81,118.44,118.82,118.97,118.78,119.25,119.31,119.19,119.14,119.78,120.06,121.11,121.38,121.48,121.11,121.74,121.4,121.64,121.24,121.53,121.47,121.44,121.5,121.55,121.95,121.36,121.46,121.58,121.65,121,122.54,123.05,123.38,123.78,124.57,124.28,124.32,124.06,123.27,123.14,121.71,121.08,120.43,119.82,119.46,120.1,119.52,119.99,120.59,120.03,120.34,120.65,120.07,120.73,120.95,120.27,118.84,120.48,120.29,119.99,120.38,121,120.69,121.3,120.67,119.81,119.96,121.6,120.69,119.69,120.3,119.72,119.72,119.72,119.61,118.74,118.05,118.05,118.25,120.24,121.54,121.84,122.06,121.62,121.13,121.71,121.68,122.03,121.72,121.99,122.94,123.48,123.72,122.74,122.3,122.88,122.74,121.51,121.6,120.52,118.7,117.2,114.38,116.38,113.78,112.05,113.48,112.56,113.53,114.2,115.45,114.81,115.73,115.56,115.63,115.94,116.68,116.5,115.86,114.52,112.01,113.04,113.13,113.78,114.99,115.24,115.54,114.46,114.24,115.02,115.81,114.37,114.95,114.58,112.8,111.11,110.46,111.75,112.23,113.25,113.25,113.25,112.76,112.54,115.56,114.82,115.05,115.85,115.21,116.03,116.16,115.93,117.17,117.61,117.47,117.72,118.36,118.28,117.44,118.12,118.55,119.15,119.15,119.73,118.9,119.62,120.08,119.87,120.27,120.27,120.12,120.13,120.08,120.03,121.02,120.4,120.4,120.86,119.33,118.65,118.43,117.33,115.5,115.94,114.77,116.35,116.89,116.46,116.6,116.56,116.14,117.25,117.09,117.23,118.83,118.09,116.79,115.74,115.88,114.67,115.95,113.51,113.49,114.45,113.39,114.4,113.61,114.76,114.95,115.93,116.18,116.58,117.02,115.3,116.08,116.39,116.2,116.48,117.41,116.96,116.57,116.37,117.35,116.85,118.23,118.83,118.33,118.78,118.78,116.88,117.32,117.35,118.06,117.7,117.72,115.43,114.87,114.87,113.17,113.79,113.64,114.33,114.94,115.23,115.2,115.47,116.43,116.15,116.44,115.59,114.31,114.38,113.18,111.7,111.04,110.95,111.49,111.57,112.07,112.31,112.68,112.73,113.15,113.49,114.65,115.59,114.9,115.21,115.66,116.22,114.52,115.02,114.18,114.73,113.71,112.71,111.51,111.91,110.06,108.12,107.62,108.16,109.74,109.26,108.2,108.17,107.48,105.82,105.46,106.61,105.62,106.29,106.03,107.73,107.95,108.29,108.39,108.06,109.36,109.08,108.8,107.61,108.65,107.99,107.48,107.16,106.47,104.98,106.26,105.34,105.69,106.89,106.68,106.74,106.94,106.9,108.31,107.45,106.13,102.62,103.04,101.64,102.94,104.71,104.85,104.19,103.22,102.42,102.8,101.07,101.09,101.09,101.09,101.09,98.96,100.62,100.62,100.62,99.54,102.48,102.2,102.92,103.44,103.62,103.43,102.93,103.36,103.67,103.41,105.62,105.29,104.87,104.85,105.33,106.57,105.7,106.24,106.52,106.44,106.84,106.64,108.32,108.24,106.15,105.64,106.65,107.5,107.89,107.23,109.2,109.32,109.14,109.81,109.96,110.19,110.51,110.82,110.6,111.12,111.59,111.76,112.09,112.01,111.48,110.63,111.33,111.31,111.97,112.59,114.08,114.14,114.85,113.62,113.45,111.37,111.19,111.84,111.92,111.86,112.92,114.05,114.4,115.75,115.96,116.15,115.83,115.13,115.38,115.74,116.16,116.25,116.68,117.17,117.89,117.89,117.89,118.05,118.01,117.64,117.93,117.98,118.41,118.41,117.54,118,116.67,114.59,115.13,112.89,113.24,111.88,113.35,114.07,115.85,115.41,113.53,114.09,114.1,112.09,112.89,113.34,112.82,111.1,111.1,110.52,111.19,112.31,112.52,112.47,113.82,113.82,114.58,114.1,114.23,113.85,113.98,116.33,116.39,116.84,116.8,116.42,116.04,115.99,115.98,117.03,117.84,118.19,119.29,119.4,118.86,118.72,118.25,117.97,117.81,117.84,117.99,118.64,117.97,117.34,117.25,117.58,119.02,119.02,118.26,118.74,118.71,116.66,116.8,116.8,113.74,111.55,110.9,111.52,113.72,112.32,112.07,113.1,110.8,110.6,112.16,113.51,112.87,114.38,113.66,112.33,112.82,113.55,113.38,114.93,115.45,115.64,115.25,116.26,117.4,117.75,117.75,117.88,118.48,119.23,119.6,118.54,118.63,118.86,119.69,120.32,119.16,119,118.36,119,119.46,120.26,118.53,115,115.13,116.12,116.95,115.65,116.64,117.71,120.27,119.81,121.24,121.26,120.9,120.59,121.29,121.45,121.52,122.01,122.12,122.15,122.03,121.97,121.43,122.09,123.48,123.86,124.28,124.88,124.64,124.55,125.07,124.64,124.28,125.05,124.82,124.54,124.11,123.97,124.23,124.91,124.84,125.09,124.81,124.78,122.18,121.66,123.31,122.91,124.4,123.72,123.7,124.23,124.87,125.7,127.11,126.18,125.97,125.97,127.23,127.24,127.24,127.24,127.24,127.43,126.29,126.29,126.29,127.13,126.42,126.65,127.1,127.88,127.67,127.34,127.18,126.98,127.15,128.3,127.99,127.66,127.01,125.9,127.32,123.91,125.3,125.88,124.34,122.66,123.35,125.74,127.28,128.21,127.97,127.79,128.89,129.86,129.6,129.4,129.82,129.25,130.22,128.8,128.04,122.9,120.36,120.53,116.43,112.17,112.49,113.6,115.24,113.32,108.89,99.69,98.04,97.89,85.75,87.12,82.55,85.25,80.38,82.68,85.86,83.74,91.47,94.34,95.94,91.93,93.17,93.89,90.3,90.58,89.72,94.2,96.28,96.06,97.46,97.46,97.46,98.3,94.61,94.75,97.31,98.02,94.04,95.51,96.1,94.64,97.1,98.78,100.94,98.64,98.64,94.89,96.89,95.81,97.05,97.98,97.15,97.17,94.69,92.99,93.35,98.1,97.79,99.13,99.13,97.89,100.11,101.05,102.79,104.25,102.76,102.76,106.43,110.15,109.89,114.02,113.41,111.88,110.97,105.94,106.25,105.67,109.25,110.08,109.49,110.14,109.21,111.14,107.68,108.45,107.95,108.89,108.96,108.77,111.86,110.99,112.86,111.9,110.71,109.87,111.05,112.86,111.9,113.81,113.38,113.39,114.15,114.73,113.56,113.6,111.55,111.27,111.3,111.18,108.09,106.94,109.44,109.64,110.11,109.17,109.58,109.82,112.26,113.31,112.62,111.35,111.38,110.83,111.77,110.3,109.82,112.25,112.18,113.09,112.22,111.7,110.25,110.42,112.45,111.32,109.85,111.65,110.08,112.02,111.61,111.71,111.74,112.27,112.49,111.74,110.63,106.49,106.6,107.14,106.45,105.69,108.59,108.29,107.59,107.61,107.5,108.49,108.93,108.94,109.69,110.27,111.12,110.48,110.28,107.56,109.34,109.24,108.75,107.16,106.85,107.77,104.62,103.45,99.84,99.72,99.66,101.73,104.4,106.5,108.33,107.95,114.81,115.98,116.81,115.5,115.63,116.78,116.85,117.32,116.3,116.83,116.67,118.19,118.32,118.29,118.85,117.67,118.77,118.63,118.49,119.24,118.93,118.79,118.89,118.67,117.44,118.05,118.64,119.37,119.97,119.46,116.19,117.83,119.24,119.24,119.24,120.46,120.66,120.33,120.33,120.09,119.53,121.66,122.04,122.8,121.98,121.69,121.84,122.68,121.27,121.38,121.13,122.1,121.9,121.37,119.71,121.04,119.14,119.84,117.29,118.96,120.96,121.61,122.7,123.16,123.49,123.35,122.92,123.7,124.51,125.81,125.54,124.65,124.02,125.11,124.65,124.29,124.86,124.16,122.51,124.88,124.91,125.09,124.82,123.63,126.79,127.55,128.69,129.56,129.15,129.03,129.74,129.7,130.3,129.27,129.16,128.93,129.12,129.12,130.27,130.82,132.28,132.04,132.94,132.94,132.94,133.77,133.31,134.01,134.05,133.48,133.65,133.96,134.54,135.87,135.43,132.76,133.97,135.26,135.21,135.46,135.16,135.27,134.66,133.91,134.77,132.23,134.86,134.74,135.92,135.55,132.94,132.99,132.99,135.35,134.99,134.94,132.63,134.76,135.63,135.63,135.98,135.83,136.08,137.14,136.09,137.18,137.74,137.43,137.77,138.05,138,138.02,138,139.03,139.23,139.6,139.87,140.09,137.57,138.55,138.91,137.32,138.89,138.83,137.79,138.38,136.93,137.42,137.6,137.71,136.54,137.41,134.48,137.06,137.91,137.95,138.11,136.66,135.97,132.35,133.29,135.66,136.75,138.44,138.22,136.95,138.23,138.7,137.77,138.69,138.74,139.64,140.19,140.64,140.73,141.09,141.71,142.39,142.5,141.58,141.38,141.14,138.96,139.73,140.71,140.76,140.86,140.48,141.2,141.46,141.38,142.42,142.58,141.57,143.05,142.34,140.73,140.73,140.5,141.15,141.22,139.68,140.48,139.17,136.23,138.05,139.82,141.33,140.1,140.34,136.74,137.46,136.38,135.95,134.64,136.97,135.19,138.07,137.23,137.21,136.62,137.57,139.78,140.92,139.86,140.38,140.56,140.01,141.12,141.11,142.31,142.2,142.64,143.2,144.21,144.74,145.19,145.99,146.99,146.64,146.37,146.51,146.82,147.24,147.77,148.29,148.27,147.69,146.77,146.17,144.32,144.07,144.64,137.78,138.45,136.89,140.8,138.4,137.46,139.38,144.07,142.61,141.78,141.47,140.93,139.63,140.14,141.56,140.2,138.37,140.66,142.07,143.72,143.72,144.46,145.27,144.36,145.07,145.07,145.94,147.15,147.97,145.7,145.07,142.83,144.25,145.42,145.4,143.93,144.94,143.45,143.8,144.86,142.5,136.59,137.4,140.31,140.99,139.37,140.64,142.32,142.24,139.51,137.68,138.82,139.12,141.64,141.4,139.99,136.93,139.6,139.38,138.58,137.26,134.28,134.27,133.87,129.01,133.77,132.21,126.87,128.72,126.06,119.8,118.33,118.09,126.88,123.02,124.21,126.04,125.94,131.05,130.9,131.47,130.78,132.27,130.36,130.16,130.31,130.96,134.84,133.39,131.48,132.02,133.12,131.99,128.86,128.09,129.99,129.36,129.08,128.97,129.66,129.66,129.66,129.06,131.29,132.34,129.37,126.59,125.37,125.82,127.25,128.12,125.75,126.72,125.5,124.54,122.27,118.82,119.76,122.9,121.74,124.77,124.16,126.05,124.34,122.41,123.21,124.94,122.89,123.88,123.88,128.32,129.43,127.66,126.66,127.86,127.47,127.47,128.25,127.65,125.48,121.26,118,117.08,119.01,115.49,115.84,116.9,117.71,116.73,115.77,119.03,119.23,119.58,118.4,116.4,116.18,116.31,113.19,115.28,117.53,118.14,116.96,117.48,116.37,114.43,117.15,118.32,120.86,120.79,121.17,121.17,121.43,120.46,121.55,123.04,124.93,124.93,124.14,125.75,126.49,125.51,126.58,125.17,126.32,126.58,127.24,127.67,128.2,126.54,127.26,125.68,123.25,123.06,123.56,123.8,121.41,120.29,120,118.5,116.46,119.41,117.58,117.92,117.99,118.33,120.28,122.85,120.82,120.19,119.32,117.93,117.9,116.81,117.64,115.46,112.82,112.61,112.14,112.37,110.47,111.79,112.6,117.39,116.16,115.67,113.72,113.09,112.54,112.24,113.28,113.93,115.95,116.7,116.95,117.68,117.13,118.85,120.8,121.46,121.44,121.72,121.88,123,122.03,121.06,124.26,124.95,125.98,125.6,129.59,130.33,130.97,131.9,130.81,130.67,132.23,131.71,132.4,132.96,133.48,133.5,132.59,132.55,133.57,134.24,134.02,133.3,132.71,132.1,132.11,132.83,132.13,134.32,133.93,129.23,128.16,128.4,128.11,130.45,128.81,128.6,128.6,129.13,128.32,129.71,127.81,127.81,130.8,133.88,133.4,135.36,137.07,136.7,138.12,139.03,139.84,140.05,140.64,140.64,137.94,138.8,139.84,139.92,139.75,140.62,140.76,140.11,140.27,140.54,142.89,143.45,141.68,141.81,141.81,143.19,141.43,142.89,142.81,144.2,144.78,144.02,143.9,143.2,142.94,143.46,140.79,143.12,142.79,142.03,142.87,144.69,145.33,144.16,144.48,144.4,142.49,138.01,140.81,135.94,138.7,136.95,138.79,140.88,141.36,141.74,139.16,140.31,140.43,142.55,144.38,145.38,145.24,145.39,144.81,145.19,145.19,145.19,145.99,146.02,147,147.93,147.15,148.03,148.02,147.73,148.53,148.3,147.49,146.48,146.82,146.87,146.87,144.7,145.21,144.43,146.23,146.51,145.65,145.1,145.2,145.47,145.42,145.39,145.65,145.65,148.08,147.75,146.3,143.65,143.85,146.13,146.13,144.59,142.11,143.44,145.66,144.64,144.71,144.6,144.79,144.52,145.42,146.47,147.43,147.06,148.06,146.97,146.32,145.64,145.02,143.91,144.21,145.05,146.38,146.71,148.21,148.18,147.93,146.58,142.28,142.73,143.4,144.42,146.91,147.96,148.24,146.78,147.22,146.97,147.35,147.95,147.67,147.94,146.42,149.84,150.48,150.64,150.64,146.1,145.02,145.98,146.13,144.49,145.45,147.7,145.59,145.89,144.48,144.34,142.44,141.94,142.34,143.53,143.75,142.59,142.72,144.66,145.76,145.38,144.77,144.28,144.19,143.83,142.79,142.21,142.75,143.33,142.92,142.29,144.19,144.7,143.05,142.94,144.06,141.92,141.74,140.4,139.11,139.2,140.2,140.65,139.4,137.98,138.13,138.12,139.63,138.55,141.68,141.53,141.44,139.35,139.81,139.89,138.33,137.81,135.59,136.17,136.96,137.23,136.43,135.25,135.72,136.82,137.85,140.48,140.65,140.11,139.93,140.78,142.48,141.41,142.58,144.59,145.39,144.95,146.24,146.3,145.94,146.62,146.93,147.3,146.7,146.49,147.25,147.65,148.86,148.74,150.02,151.04,150.72,152.39,152.96,152.84,152.62,152.93,153.27,152.32,152.8,152.75,152.44,152.33,152.33,152.33,152.56,152.09,152.34,152.34,149.86,150.73,150.38,151.12,150.5,150.56,149.66,150.93,150.08,149.8,148.34,150.03,149.88,150.94,150.46,153.77,154.38,156.17,156.3,157.09,156.61,156.28,156.81,156.84,158.04,157.63,158.71,158.88,159.91,157.98,158.66,159.8,160.56,160.47,160.38,160.88,163.58,164.16,163.88,164.6,164.54,164.33,164.91,165.52,164.85,165.61,167.58,167.14,166.11,167.89,168.47,168.22,167.98,167.87,168.72,168.46,170.21,169.5,169.94,170.61,171.21,171.26,171.26,171.26,169.87,170.79,170.84,168.95,170,168.15,168.48,167.33,166.94,167.93,165.66,165.56,166.32,165.69,166.32,168.73,168.11,166.4,168.68,167.82,165.8,165.8,164.77,165.81,167,168.99,169.74,169.74,171.32,171.11,171.16,171.85,170.89,170.61,170.61,170.04,169.3,169.72,169.65,170.45,169.47,167.21,167.85,167.9,168.57,166.88,169.65,170.78,170.18,169.01,167.28,169.61,166.28,163.03,164.42,165.6,164.59,166.69,165.33,166.8,166.3,165.62,165.17,164.88,166.09,165.3,167.3,168.03,167.76,167.44,165.21,167.07,167.65,169.9,167.88,166.69,164.8,164.08,162.63,165,165.65,163.8,162.09,163.82,162.23,163.1,164.17,164.17,156.28,154.02,154.14,157.27,157.29,157.51,157.4,158.17,159.27,161.98,163.08,164.12,163.65,164.59,164.58,165.39,164.97,165.04,165.52,167.32,167.04,167.54,165.51,163.34,162.22,159.63,161,159.94,160.49,162.19,163.2,162.65,163.76,162.9,166.54,164.12,164.6,166.46,165.65,169.55,170.72,168.47,166.91,167.22,165.8,166.93,167.43,166.73,167.87,167.45,168.58,169.83,166.66,165.38,166.68,167.99,166.47,166.41,165.84,166.28,166.53,167.44,166.77,164.6,162.65,164.33,163.47,164.08,161.74,163.46,161.81,163.53,159.85,159.7,162.84,161.54,161.39,160.07,159.35,160.23,161.35,161.71,160.43,159.46,160.32,161.86,163.29,164.36,165.72,166.82,167.7,167.96,166.83,167.08,167.29,167.37,166.67,166.52,167.01,164.38,163.81,163.5,163.5,163.5,163.5,165.05,164.05,164.05,164.05,164.12,168,168.85,168.33,169.06,167.69,166.91,167.79,169.54,172.05,173.45,173.99,174.04,175.39,175.78,175.84,174.8,175.05,176.22,177.96,178.12,175.79,177.37,177.59,180.47,179.42,180.52,181.62,182.12,185.31,185.08,185.97,186.44,183.99,183.98,184.45,183.74,183.54,186.24,184.37,184.07,186.67,181.5,184.93,185.99,184.23,181.49,178.89,180.56,179.52,182.07,183.46,184.79,185.55,183.64,182.73,182.46,184.46,182.32,181.29,179.62,176.82,179.24,178.69,172.27,164.35,156.88,160.83,155.72,162.35,161.28,165.47,167.46,167.32,166.27,166.27,166.27,167.15,171.78,172.33,173.64,174.2,173.91,173.85,173.85,178.06,177.99,177.33,176.21,178.19,178.89,181.67,182.47,182.04,182.34,182.86,182.85,183.77,183.76,182.75,179.45,181.77,182.45,181.2,181.2,180.8,180.43,181.11,182.1,182.28,182.94,182.94,182.45,181.7,180.61,178.24,179.89,178.18,177.44,175.09,176.32,175.93,178.46,176.94,176.67,179.42,178.67,177.97,179.19,180.01,178.18,179.96,180.98,183.47,183.22,181.37,180.95,180.38,178.49,181.16,180.55,180.01,178.24,180.05,180.42,180.32,179.83,181.23,181.7,179.23,179.23,176.62,176.86,177.32,179.64,180.17,179.63,179.77,181.53,183.1,183.57,183.1,184.73,184.36,184.02,184.9,183.41,181.38,181.69,181.82,180.3,180.82,178.26,179.4,180.13,179.17,180.68,180.88,180.63,181.48,181.62,183.29,181,180.91,183.84,183.9,183.35,184.37,184.1,183.44,185.29,185.53,186.31,188.03,190.21,190.41,189.63,189.13,190.34,189.53,186.35,187.59,187.05,188.84,190.42,188.92,191.39,191.59,189.99,190.97,191.18,192.41,192.18,192.23,192.01,190.76,191.34,190.69,191,189.04,187.54,190.84,192.9,194.98,193.48,191.83,190.05,186.47,186.71,187.65,185.81,186.26,187.79,190.54,190.46,190.96,190.94,191.57,191.85,192.64,192.84,192.9,192.65,192.31,193.85,192.73,193.81,192.64,191.42,193.44,194.07,193.51,193.7,193.7,193.7,193.7,193.78,195.28,195.28,195.28,199.57,199.84,199.57,198.92,202.06,202.69,203.15,202.31,203.53,203.13,199.64,198.51,198.2,200.67,200.4,200.72,201.96,199.89,198.5,200.38,202.4,201.99,201.15,199.64,202.09,204.13,203.73,203.34,202.52,201.65,201.43,202.88,205.63,204.15,206.57,205.98,206.07,207.98,207.59,206.81,201.7,194.45,197.79,194.83,192.71,191.54,196.66,195.23,193.68,192.6,193.35,194.37,193.28,189.13,185.34,187.8,188.04,190.33,187.52,185.49,186.71,187.65,193.14,191.8,191.8,191.8,189.79,199.22,198.65,199.65,198.94,201.62,200.13,199.89,204.09,201.56,199.79,198.98,198.6,198.22,197.44,196.62,195.96,198.15,198.15,194.18,197.75,203.06,201.22,199.16,198.62,195.69,197.46,197.46,196.34,197.06,197.13,201.34,200.81,202.8,202.8,204.3,204.52,204,203.85,203.32,205.78,203.95,205.62,204.23,204.24,203.82,202.48,204.06,208.46,209.87,210.82,212.25,213.03,212.02,212.63,209.91,209.38,211.16,209.61,209.95,213.2,211.66,214.29,216.05,215.55,212.92,209.05,211.72,211.24,211.27,211.58,211.09,211.7,209.92,209.8,211.77,212.82,209.22,211.61,211.65,211.9,210.53,213.75,214.2,216.51,218.54,218.21,219.07,219.79,220.19,220.71,220.13,220.52,220.32,220.01,217.92,217.92],"HSCEI":[100,99.96,99.8,98.97,99.05,99.42,98.87,99.91,99.33,100,100.84,102.34,103.46,103.79,104.19,104.7,100.5,99.63,99.34,99.89,99.89,101.47,101.51,102.53,102.99,101.98,100.24,101.46,101.18,101.96,99.75,100.8,101.57,102.13,103.55,103.31,103.31,102.06,100.7,98.86,99.95,99.32,101.19,100.36,100.83,100.83,102.57,102.41,100.96,100.03,99.05,99.51,101.04,99.1,98.71,98.81,100.02,100.56,97.63,99.37,98.2,97.26,97.83,97.46,97.09,97.33,98.32,100.47,100.62,100.76,101.92,102.8,102.5,102.41,102.98,101.82,101.1,101.69,102.33,103.03,102.73,100.97,101.18,101.04,98.68,98.59,97.62,96.64,97.14,95.77,95.58,95.58,95.58,96.82,96.95,97.8,97.8,98.47,98.28,99.92,100.05,99.96,100.6,101.33,101.22,101.89,100.62,101,102.05,101.94,101.14,101.26,101.59,101.42,102.58,102.06,102.06,102.06,101.57,100.94,100.8,102.44,102.5,103.63,104.88,105.4,106.78,106.75,108.64,108.84,107.85,108.74,108.35,109.7,109.53,108.46,107.54,107.2,107.1,106.67,105.6,105.88,106.49,107.02,105.1,104.82,106.79,107.38,106.94,109.58,109.45,110.18,110.81,108.86,109.17,109.07,107.87,108.53,108.65,107.8,106.95,107.37,107.37,107.9,106.98,106.95,106.74,105.83,106.27,106.23,106.23,106.23,104.55,103.93,104.68,104.62,105.22,106.93,107.41,106.82,106.39,106.39,105.91,105.91,105.02,103.33,103.92,105.44,106.47,106.78,107.04,108.79,108.61,108.09,106.92,106.88,108,108.21,108.17,110.05,110.13,110.55,110.55,110.38,110.55,111.04,110.32,110.41,110.47,110.87,110.26,109.16,109.57,109.46,107.7,108.11,109.52,108.98,108.2,108.29,108.58,109.62,109.28,108.35,108.6,107.9,108.39,107.29,108.06,107.7,106.72,106.33,108.43,109.49,111.15,111.68,112.25,111.96,113.06,112.92,112.29,112.65,112.25,112.76,113.03,111.97,112.72,114.76,115.09,114.53,114.54,115.08,115.34,114.12,112.24,110.06,111.46,111.78,112.61,112.44,111.32,111.92,114.04,114.04,115.04,117.51,118.07,117.59,118.41,117.59,117.48,116.41,116.5,115.85,115.54,116.07,116.81,117.03,116.46,115.56,115.21,116.55,115.82,116.32,116.57,115.64,113.6,114.18,114.88,113.2,113.57,113.57,117.69,118.64,118.64,119.29,118.52,118.87,118.79,119.72,119.92,120.79,120.43,120.98,118.23,120.32,119.62,118.73,119.64,119.15,121.21,120.37,119.8,121.14,120.74,120.78,119.97,121.23,120.51,122.26,122.27,121.64,120.77,118.81,120.07,120.85,120.11,123.61,124.49,122.18,123.96,122.55,121.85,121.26,119.46,119.19,119.9,119.56,116.2,116.08,117.52,119,117.76,119.92,120.05,118.32,118.83,120.15,119.78,120.72,121.31,121.31,121.31,120.94,121.63,121.89,125.64,125.85,127.04,127.12,127.37,127.58,127.93,128,129.8,129.82,133.12,133.96,136.32,137.2,137.46,140.44,141.79,139.37,142.87,142.2,139.38,141.18,139.85,140.94,140.32,132.07,129.43,128.88,123.9,123.88,124.97,127.64,130.49,130.49,130.49,129.05,132.07,130.42,132.57,133.6,131.65,128.9,129.38,127.04,124.83,128.16,126.8,128.41,129.41,132.18,132.69,132.05,132.41,131.93,131.8,131.14,130.35,129.37,126.25,126.98,128.06,124.93,124.9,124.9,124.9,126.34,123.44,123.44,124.58,125.68,128.29,128.3,127.93,127.64,125,123.88,124.77,127.42,125.48,124.92,127.47,125.9,124.39,125.61,128.37,128.37,126.93,125.12,123.78,124.57,126.43,126.85,127.36,128.51,130.59,129.51,129.5,127.82,128.62,128.56,128.56,125.86,126.51,125.42,126.12,124.49,122.52,124.69,125.13,127.52,127.62,127.87,129.16,126.65,126.71,127.07,125.29,124.41,123.57,123.57,119.64,119.77,118.31,118.05,116.68,115.75,113.25,113.14,115.27,115.27,113.18,111.52,110.43,110.58,112.1,112.69,110.95,111.94,111.87,111.43,110.26,110.12,109.55,111.21,111.71,114.24,115.28,114.73,115,114.99,114.77,114.23,111.73,111.32,111.41,113.12,113.48,114.72,113.92,112.08,111.85,109.67,109.09,109.45,110.68,111.78,112.95,112.58,112.22,115.02,115.53,115.37,114.17,113.21,112.57,113.37,110.82,110.12,109.92,108.61,107.57,106.59,109.34,110.09,108.91,109.9,111.82,112.35,114.79,112.71,112.71,114.36,113.87,114.7,114.7,111.95,112.28,109.8,109.62,108.19,108.48,108.71,105.06,107.21,105.6,106.16,106.16,105.52,106.41,109.21,106.55,106.46,105.94,104.71,104.23,104.09,105.54,107.01,111.26,109.77,110.69,110.78,111.42,108.59,108.68,109.08,108.32,109.88,110.18,110.68,108.95,109.16,108.75,108.14,109.53,109.46,110.71,110.19,110.57,113.28,113.55,111.98,109.1,107.95,106.94,106.65,108.44,109.9,107.84,107.76,106.5,106.14,105.04,105.15,104.75,104.75,104.75,104.01,104.02,105.4,102.37,102.39,104.41,105.39,105.49,107.83,108.21,108.84,107.14,109.33,109.88,109.43,110.73,111.52,110.49,110.67,111.29,113.19,113.29,113.13,113.44,114.88,115.18,114.89,114.89,114.89,114.89,114.06,114.69,114.97,116.58,116.28,113.86,116.06,115.73,116.9,117.69,118.96,121.08,120.17,119.27,118.33,119.79,120.5,120.57,120.67,119.3,116.14,117.39,119.36,118.73,119.17,119.8,121.53,121.66,121.02,120.17,119.9,116.93,116.92,117.69,117.58,118.46,120.31,120.2,121.85,121.72,121.72,122.77,122.99,122.46,120.94,121.38,121.09,123.06,123.35,122.51,122.51,122.51,122.12,121.42,119.74,119.83,121.15,120.15,120.15,120.31,120.5,116.94,117.23,115.52,112.9,113.79,113.79,112.05,112.47,112.55,111.27,110.69,110.71,110.39,108.28,108.74,108.29,108.44,108.16,108.79,108.13,108.58,107.65,107.69,107.58,107.58,109.58,110.56,109.25,109.02,108.47,108.56,109.38,112.06,113.7,113.69,114.02,111.83,112.07,113.44,113.28,113.28,114.31,113.7,113.61,113.42,111.65,110.87,111.41,112.26,112.31,112.83,113.11,112.93,112.27,113.57,112.12,112.53,113.04,113.78,112.98,112.23,112.62,111.13,110.57,107.73,104.95,104.23,104.03,104.53,104.04,104.08,102.5,102.71,103.09,103.73,105.24,105.48,105.95,105.38,106.13,104.24,104.06,103.9,104.02,104.97,105.18,104.47,107.1,108.1,108.58,108.44,108.3,109.98,110.27,111.26,110.64,109.33,109.08,108.11,108.01,107.1,106.92,105.86,106.31,105.65,106.19,106.19,106,106.4,105.63,105.63,106.2,105.86,106.37,108.81,109.39,109.31,109.64,110.22,109.72,109.76,109.58,108.8,109.65,108.95,110.03,109.79,109.09,109.65,110.58,112.57,113.24,113.06,113.84,113.28,110.49,111.29,109.5,108.55,108.52,109.89,111.35,110.55,108.79,109.37,110.65,110.53,110.56,109.95,107.24,107.89,107.8,106.74,107.45,108.34,108.35,108.21,109.33,110.5,112.82,112.21,114.15,114.77,114.36,114.82,115.06,114.88,114.88,114.88,116.53,116.86,116.26,117.85,117.15,116.23,116.58,115.34,117.44,117.29,118.64,118.21,117.59,117.93,118.88,117.96,114.2,116.33,114.01,114.26,114.26,114.26,110.54,107.48,106.6,106.89,108.63,109.24,112.06,111.44,110.91,112.52,113.31,112.8,113.09,114.07,112.48,113.56,113.61,112.33,110.02,110.14,109.32,110.27,107.25,109.15,109.15,109.53,111.68,108.86,103.94,105.7,104.83,101.24,100.46,96.06,95.94,91.61,89.11,94.93,91.11,95.61,99.2,98.35,98.95,97.88,99.88,97.91,99.17,98.8,100.48,102.51,100.79,102.13,102.13,102.13,102.51,101.23,100.69,102.18,102.27,100.09,100.67,101.02,100.52,102.8,103.93,104.53,104.53,104.53,99.93,100.96,102.1,101.65,102.73,104,102.35,102.39,100.84,100.71,101.25,102.89,103.04,102.54,98.13,98.54,99.89,99.6,99.43,99.53,102.37,102.81,103.76,103.77,104.79,104.19,105.36,105.59,103.52,102.36,100.52,102.72,103.16,103.23,103.84,102.84,104.03,103.44,103.44,102.57,101.58,101.59,101.59,104.69,106.63,111.67,110.35,111.89,112.24,109.73,110.09,108.32,108.17,105.49,106.22,107.17,108.74,106.63,107.49,104.94,104.89,105.68,106.02,105.11,104.52,104.45,106.22,106.77,106.21,104.76,104,105.7,106.35,106.65,106.87,108.12,108.53,107.36,105.72,106.31,107.61,107.14,107.23,106.2,106,104.01,104.24,104.11,103.48,102.89,101.65,102.33,101.27,100.81,101.52,102.09,102.32,102.49,101.31,102.05,100.36,99.69,99.51,97.55,96.84,97.68,96.62,97.83,97.83,97.83,98.35,99.27,100.24,100.19,100.12,102.84,102.84,103.27,101.63,103.21,103.87,103.98,104.91,104.99,105.41,105.41,104.13,103.72,103.64,101.6,103.44,104.84,105.13,109.08,109.28,110.69,110.21,109.74,110.13,109.78,110.13,109.83,110.76,109.88,109.86,111.04,110.48,109.91,111.4,112.33,109.79,110.97,110.07,110.2,110.6,109.03,108.36,109.18,108.43,108.81,108.71,108.26,108.91,109.78,109.13,108.28,108.1,109.12,108.58,108.58,107.34,108.78,111,111.79,111.63,112.16,113.47,112.39,114.05,115.13,116.78,116.43,117.62,117.85,119.32,122.15,124.39,123.77,121.56,124.51,121.75,121.29,117.99,116.68,119.24,120.85,121.3,120.38,120.35,120.34,120.78,122.94,123.68,123.68,123.68,125.3,127.3,125.35,126.03,123.81,123.98,119.82,121.98,117.08,119.23,118.27,121.45,117.9,117.55,114.66,114.23,115.13,118.05,116.31,116.01,117.94,118.24,119.41,117.47,117.7,115.67,112.93,111.85,114.16,113.92,114.73,114.22,116.77,116.77,116.77,116.77,115.24,115.65,114.27,113.21,112.95,114.5,113.53,114.8,115.48,115.4,113.35,113.88,115.22,114.32,114.34,114.66,115.03,112.69,111.52,112.07,111.61,111.97,111.38,110.88,108.59,109.89,107.64,108.32,109.34,110.91,110.91,110.79,111.41,110.78,112.35,113.01,112.93,112.36,113.36,114.41,114.01,112.71,112.49,111.89,111.69,111.44,111.56,111.92,111.92,111.06,109.96,110.24,110.83,109.8,108.99,111.12,111.15,113.24,113.09,111.98,111.01,111.01,108.43,106.95,106.91,105.66,102.25,102.91,103.53,105.28,104.78,105.91,105.69,103.67,102.69,102.34,104.17,102.42,97.39,92.44,94.43,98.02,96.12,97.19,97.02,98.05,96.78,96.54,96.96,98.89,99.4,98.54,97.62,96.45,94.29,95.26,92.82,91.01,91.77,94.72,94.48,93.04,93.25,93.65,95.6,96.51,97.24,96.73,97.55,98.56,98.37,95.6,97.72,96.18,94.54,93.03,91.67,93.07,89.93,89.95,89.95,90.92,89.58,89.36,90.78,91.2,90.84,90.84,88.71,88.65,87.58,90.7,91.35,93.68,92.12,92.12,92.12,93.34,93.39,95.11,96.57,96.54,97.4,97.04,96.39,94.67,94.24,93.29,92.64,92.27,92.2,93.2,91.82,91.54,91.67,92.76,94.19,94.88,94.58,96.04,95.7,94.06,93.38,92.96,91.9,91.55,91.71,89.28,88.47,87.12,87.72,88.55,88.02,86.14,88.77,88.72,90.13,89.3,89.02,87.64,86.85,86.92,85.55,83.72,84.75,85.31,85.41,85.38,85.38,85.3,84.31,84.28,85.74,85.24,85.16,83.44,84,85.69,87.08,87.12,89.66,89.55,89.06,88.11,87.95,87.88,91.21,91.48,90.13,88.52,88.61,86.31,85.47,86.92,86.92,86.92,86.92,89.36,89.42,88.62,90.81,91.5,91.45,89.72,88.78,90.35,90.69,88.88,88.03,86.1,86.58,83.6,83.19,83.53,83.83,82.32,82.24,80.02,77.16,75.35,74.84,75.53,73.5,68.24,63.75,71.72,77.11,76.68,75.41,78.48,79.48,78.37,75.83,76.99,78.21,79.21,78.34,78.46,80.9,80.9,79.21,78.03,77.97,75.04,75.62,76.15,76.88,76.88,76.88,74.62,73.89,72.48,72.58,69.59,70.24,70.64,72.02,75.98,75.98,75.65,74.3,74.1,70.89,70.89,69.31,70.47,68.65,70.86,71.06,73.67,73.8,71.82,74.13,73.1,71.65,71.81,71.59,73.73,75.53,77.21,76.47,75.66,75.66,78.07,77.74,79.94,79.18,79.22,76.41,76.34,77.58,75.57,76.7,77.03,78.59,76.36,77.69,79.42,81.37,82.17,80.1,79.81,79.81,79.61,79.56,78.55,78.48,78.61,76.21,74.86,74.39,74.18,72.43,74.63,73.88,74.73,73.91,73.98,73.67,74.8,73.82,73.73,71.68,71.59,69.77,70.13,71.62,71.85,71.01,70.73,69.17,71.03,71.39,70.94,70.04,70.32,69.75,69.95,69.7,69.21,68.35,71.3,72.05,71.54,71.21,71.47,70.18,69.46,68.47,68.25,67.8,67,69,69,69.05,67.36,67.76,66.84,65.98,66.68,65.24,64.5,63.65,63.89,64.03,62.03,61.55,61.57,60.97,60.97,64.8,64.39,63.24,61.22,59.64,59.26,57.89,58.6,58.64,59.92,58.27,57.38,57.44,53.24,53.93,54.31,54.58,52.35,51.41,54.23,55.75,53.82,57.07,58.67,58.32,57.62,56.39,61.08,62.25,65.26,64.81,63.92,63.77,62.48,61.43,61.89,62.38,62.16,61.13,64.92,66.36,66.47,66.3,69.81,69.26,66.97,69.4,71.14,69,69.28,69.77,68.62,69.07,68.75,67.38,67.67,69.92,69.15,69.15,69.15,70.5,69.7,69.8,69.8,71.14,73.55,74.66,74.37,75.85,75.61,76.11,76.12,76.94,76.52,76.14,76.42,76.13,77.9,77.9,77.9,77.9,80.23,80.92,78.03,77.29,78.7,78.14,76.9,74.84,75.29,74.84,76.14,74.18,74.37,74.02,73.06,73.81,72.78,73.54,72.09,71.13,71.41,69.78,69.44,68.51,71.98,71.38,72.24,72.22,71.96,70.03,69.22,67.1,68.6,67.03,68.29,67.48,68.87,67.35,68.18,69.12,71.17,70.73,69.21,70.06,71.61,72.06,72.55,72.25,71.57,71.57,71.77,71.77,71.77,72.35,71.48,71.57,71.98,73.45,72.9,71.71,71.78,70.42,70.09,68.72,69.27,69.49,69.77,69.77,69.54,68.59,69.94,70.76,71.8,70.11,69.57,69.7,69.37,70.58,70.68,69.09,69.91,68.64,69.68,68.74,67.44,65.93,65.93,65.07,65.41,64.16,64.02,66.92,67.29,67.45,68.09,68.08,68.59,68.56,68.9,68.46,70.5,71.13,70.54,69.28,67.73,67.73,66.57,66.33,67.71,67.89,66.9,66.88,68.61,68.85,67.56,65.26,64.53,64.91,65.54,66.39,68.12,68.28,68.28,66.62,66.44,66.25,66.78,65.28,68.75,68.18,69.44,70.88,71.82,71.36,69.43,69.25,70.09,70.1,68.58,68.84,69,68.09,66.87,66.27,65.3,65.5,63.99,62.78,63.48,63.68,65.25,64.28,65.02,66.49,66.17,65.92,65.92,68.01,66.59,66.66,65.74,65.74,65.57,65.17,64.91,65.32,65.68,64.64,64.91,64.35,63.49,65.19,63.82,62.78,63.19,62.36,64,64,61.93,61.24,61.29,62.19,62.44,63.01,63.84,65.24,63.67,62.98,63.42,63.25,61.67,61.12,61.12,60.37,60.94,61,62.24,62.05,61.02,61,61.53,63,64.35,63.37,62.88,62.77,61.43,62.35,62.09,64.59,63.67,62.19,63.54,63.26,63.24,64.24,62.89,62.72,62.01,60.57,60.98,59.98,59.37,58.4,58.96,58.46,58.28,57.59,58.45,57.78,58.02,59.34,58.65,58.22,58.43,58.5,57.14,57.14,57.14,58.33,60.01,60.05,59.05,58.6,58.81,58.37,57.06,56.73,56.43,57.2,57.07,56.7,55.62,53.43,53.84,53.37,52.07,53.52,55.73,56.93,55.8,56.31,54.92,54.07,54.38,54.33,54.31,56.98,56.44,55.8,55.24,55.24,55.24,56.07,56.33,57.87,57.1,57.46,58.74,59.95,60.01,59.58,60.45,59.22,59.11,59.64,59.47,57.91,59.06,58.44,58.89,59.85,61.93,61.76,61.49,60.59,60.88,60.17,60.42,61.47,59.94,59.91,60.64,59.63,60.49,60.49,60.49,62.05,61.16,61.16,61.04,61.1,61.37,62.64,62.5,61.21,60.97,59.79,59.85,60.42,59.82,60.7,61.99,63.5,63.71,65.27,65.4,65.31,65.31,67.01,68.16,68.42,67.94,67.21,68.3,69.94,70.39,70.18,70.18,71.53,72.19,72.51,71.01,70.97,69.77,68.76,69.62,69.6,68.26,67.28,66.55,68,68.23,68.11,68.24,67.77,67.77,67.17,66.2,66.85,66.36,66.35,66.29,68.58,68.25,67.04,67.05,67.3,67.43,65.83,65.91,65.91,66.36,67.2,67.36,66.44,65.42,65.33,65.07,66.33,68,66.85,65.75,65.56,65.65,64.18,65.1,64.49,63.94,62.63,62.57,63.3,62.32,63.58,63.36,62.2,61.18,60.93,61.76,61.85,62.65,62.77,62.97,62.72,62.83,64.15,64.81,64.5,63.94,64.79,64.74,65.36,65.65,64.81,65.03,65.91,64.66,64.58,63.85,63.56,63.56,62.49,62.73,62.28,62.64,63.2,63.4,64.29,64.29,65.64,66.43,66.51,69.9,70.43,73.77,75.99,78.18,78.18,83.71,82.39,84.91,86.72,77.9,76.68,79.33,79.33,78.91,75.76,75.66,74.74,77.78,76.42,76.65,77.85,76.61,76.88,76.94,77.22,75.85,75.62,76.44,76.7,78.66,76.65,78.56,77.67,76.57,74.19,74.23,72.59,72.66,73.46,73.73,73.82,73.23,71.69,71.44,71.32,73.16,72.08,72.31,72.96,73.62,73.75,73.02,74.29,76.62,76.06,75.47,76.62,74.81,74.25,73.97,74.75,74.45,74.37,75.1,76.03,76.03,76.03,76.05,75.79,75.89,73.81,74.53,74.28,73.39,72.77,72.65,71.81,71.24,72.74,72.99,73.9,74,75.32,76.21,74.71,74.58,76.12,76.85,76.85,76.85,76.85,76.85,76.87,79.57,78.76,80.06,81.03,82.73,81.64,83.88,83.31,86.73,86.65,88.23,88.1,86.64,90.22,89.72,88.48,91.53,90.93,87.63,87.65,87.11,89.84,93.05,92.79,90.83,91.14,90.38,89.95,92.42,92.94,95.54,95.39,93.17,91.01,92.14,89.69,90.09,90.33,89.59,88.66,88.87,88.81,87.65,87.65,75.6,77.35,78.45,79.83,81.21,82.92,83.1,80.98,82.21,82.21,82.21,82.77,84.49,83.87,84.12,84.11,83.99,84.07,84.07,85.68,85.68,86,85.8,86.41,86.49,89.1,87.3,89.45,88.59,88.15,88.07,89.41,90.16,89.08,89.36,87.84,88.17,87.9,89.11,87.78,87.02,88.69,89.28,90.41,89.84,91.4,91.27,92.29,90.88,90.1,90.88,90.51,89.47,87.56,88.77,89.5,91.2,92.22,91.65,91.22,90.34,90.34,90.83,90.03,89.62,89.61,90.66,89.5,90.24,90.44,90.91,92.41,92.25,92.16,93.55,94.11,94.48,96.2,96.37,95.26,95.53,95.21,94.09,92.47,91.65,92.58,93.18,92.99,93.5,92.6,92.52,92.82,95.25,95.03,94.1,94.04,93.75,93.83,93.43,94.52,96.27,95.24,93.9,92.83,93.15,94.96,94.82,94.21,93.03,94.29,94.96,96.21,97.11,96.4,97.49,97.7,97.71,99.9,98.44,98.61,97.55,96.71,98.3,98.31,96.85,98.42,99.47,99.47,101.23,100.54,99.66,99.66,99.14,99.21,97.42,96.01,94.51,96.3,96.39,93.81,96.11,96.84,96.02,96.82,97.48,98.55,97.6,97.6,97.3,95.44,96.38,95.49,95.39,97.4,96.48,98.3,98.49,99.3,99.93,97.83,97.11,95.51,95.26,95.18,92.85,94.52,95.34,95.38,95.41,95.04,95.49,95.59,93.99,94.8,95.75,94.56,93.03,93.22,93.01,94.52,92.83,91.17,92.06,92.04,92.66,93.06,92.79,92.81,92.81,92.81,92.56,93.6,92.79,95.45,95.24,96.23,95.13,94.1,94.19,95.98,96.66,96.97,96.47,95.99,95.09,94.68,94.97,94.88,95.36,95.22,96.24,99.02,99.44,96.99,94.52,94.24,94.19,94.66,94.02,95.44,96.22,96.48,95.51,94.03,94.42,94.42,94.42,94.42,93.27,95.74,93.77,94.05,91.76,92.23,90.59,89.62,88.32,87.98,89.82,89.33,90.67,90.61,90.56,90.27,91.78,91.89,91.98,90.52,89.26,86.48,88.48,89.35,87.34,88,87.43,87.18,88.53,88.04,88.04,88.04,88.04,90.33,89.65,90.1,89.55,90.27,90.76,92.7,92.08,92.64,93.1,91.63,90.91,91.35,91.15,89.99,91.67,90.38,90.38,91.34,90.88,91.62,92.85,92.54,92.48,92.47,92.4,92.22,90.47,89.5,89.94,89.58,88.23,89.01,89.01,89.29,88.1,87.07,87.71,88.57,91.22,89.49,88.5,87.83,86.83,86.66,86.6,85.54,87.18,87.19,85.78,84.78,83.03,83.03,82.39,80.77,80.83,79.2,77.67,79.17,78.68,78.68,79.25,80.15,81.33,80.89,84.16,83.25,83.69,83.97,84.35,85.2,86.59,84.7,87.26,87.03,85.89,86.95,86.1,87.08,87.82,89.77,89.99,89.65,90.07,89.26,89.56,88.47,88.81,89.75,88.78,87.93,87.72,86.83,87.86,88,88],"KOSPI200":[100,99.45,99.9,99.46,99.45,99.05,99.15,99.54,99.3,98.97,99.15,100.37,100.87,100.63,100.84,99.47,96.85,97.32,97.32,97.32,97.32,98.16,98.61,99.16,99.86,99.88,99.53,100.34,99.81,100.64,99.54,99.54,100.19,100.12,100.94,100.53,100.63,99.02,99.04,98.16,98.61,99.03,99.73,99.81,99.89,99.45,100.31,99.95,98.77,99.22,99.17,98.93,98.96,97.73,97.76,97.63,98.42,98.67,96.51,98.69,97.41,96.64,96.33,96.76,96.82,96.72,96.45,97.56,98.06,97.43,97.51,97.78,97.77,98.29,98.37,97.75,97.47,98.82,99.09,101.28,100.86,100.78,101.14,101.28,101.07,101.5,101.25,101.51,101.32,101.27,101.13,101.13,101.47,100.39,100.51,100.51,100.51,101.65,101.71,101.27,101.74,101.95,101.95,103.66,104.35,103.56,102.88,103.36,103.24,103.48,103.03,103.26,103.33,103.66,104.56,104.56,104.56,103.63,104.2,103.79,103.93,104.17,103.97,103.49,103.48,103.85,103.91,103.56,103.91,103.96,103.92,104.27,105.19,105.47,105.49,104.52,103.97,104.4,104.4,105.4,104.28,104.53,105.09,105.26,105,105.26,106.46,107.42,107.42,108.28,108.96,108.53,109.72,109.25,109.32,109.13,108.38,108.72,108.96,108.88,108.49,108.86,108.59,108.52,108.03,107.85,107.16,106.49,106.77,107.9,107.9,107.5,107.55,106.88,107.37,108.26,109,110.33,110.86,111.08,111.02,111.02,111.97,111.97,113.06,113.06,115.91,115.91,114.5,115.87,115.29,115.53,115.84,115.71,115.38,115.23,116.21,116.49,116.63,117.99,118.66,118.49,117.74,117.77,117.53,119,118.8,118.8,118.16,118.38,119.59,118.38,119.07,119.04,118.56,118.59,119.3,119.57,118.88,119.63,119.94,120.57,120.65,120.16,120.82,120.51,120.76,120.01,120.52,120.56,120.09,120.4,121.22,121.22,122.29,122.68,123.13,123.18,123.28,123.94,124.39,124.48,123.76,123.49,123.9,121.43,121.61,122.56,122.81,120.72,121.17,121.37,121.15,119.65,119.2,117.02,117.87,117.87,118.74,119.46,119.21,119.12,119.58,119.72,120.12,120.3,119.65,119.31,119.7,119.17,118.98,118.98,117.54,117.2,118.66,118.84,119.77,120,119.83,120.81,121.26,123.29,123.12,123.11,123.02,123.02,122.31,121.49,121.31,121.32,122.26,122.26,122.26,122.26,122.26,122.26,122.26,124.66,126.07,126.84,126.54,126.72,126.99,126.95,126.2,127.14,127.35,127.16,127.3,126.4,127.27,127.71,128.95,130.95,130.48,130.98,130.43,130.18,130.58,130.33,129.87,129.24,128.97,128.4,129.25,129.18,128.69,128.92,129.69,129.31,129.67,127.38,127.95,127.83,125.73,125.55,127.09,127.42,125.45,125.09,125.51,125.67,125.27,126.09,125.53,126.11,126.25,126.31,126.31,123.59,124.17,124.17,123.27,123.8,125.53,125.53,126.02,126.46,125.47,127.17,128.06,127.66,126.64,125.89,126.3,126.56,127.57,127.25,127.23,127.38,126.12,127.93,127.92,129.14,129.65,130.68,128.88,128.87,128.86,126.41,124.97,122.93,120.02,120.46,117.84,119.11,120.17,121.54,121.54,121.54,122.39,120.93,121.56,120.67,122.47,122.67,122.47,120.94,120.94,119.2,117.74,120.01,120.28,121.68,122.8,123.97,124.85,124.47,124.76,124.81,123.84,124.39,124.32,124.98,120.77,121.72,122.29,120.53,121.31,121.62,121.38,121.14,119.27,121.01,120.46,121.17,121.36,120.97,121.08,121.71,121.83,121.63,123.17,123.75,122.88,122.88,122.1,121.38,122.96,124.01,125.08,125.08,124.68,123.91,122.44,122.44,122.1,121.54,122.66,123.12,122.82,121.74,122.14,121.49,121.91,122.25,122.25,123.05,122.73,122.95,123.31,122.23,119.55,120.19,121.08,121.71,122.06,122.06,122.8,121.76,122.63,122.48,122.48,120.3,119.34,118.04,116.49,117.52,116.36,117.4,117.27,117.04,116.84,115.3,115.84,113.24,113.4,112.98,112.73,113.31,114.11,114.5,113.82,113.81,115.45,114.95,114.76,114.6,114.38,114.79,113.87,114.23,113.98,114.79,115.11,114.92,114.98,115.46,113.48,114.27,114.13,114.88,114.88,114.97,113.51,112.05,112.52,112.52,111.42,111.55,111.57,112.85,113.26,113.76,114.24,114.74,114.89,115.22,115.22,116,115,115.51,114.02,113.76,113.21,113.53,113.05,113.01,113.04,114.92,114.13,114.46,114.67,115.6,116.28,116.28,116.28,116.28,116.97,116.17,116.03,114.63,114.63,112.79,112.6,112.07,112.07,111.27,106.36,107.99,107.15,107.04,108.26,107.26,107.71,108.01,105.35,104.9,103.1,101.55,100.58,101.46,102.06,101.65,105.36,104.4,104.98,104.55,105.19,104.89,104.98,104.26,103.94,104.97,105.01,105.26,104.21,103.7,103.51,102.95,104.29,105.18,105.71,105.98,104.89,106.76,105.64,104.95,103.28,103.71,102.57,102.32,103.78,104.14,102.65,102.95,102.51,103.33,102.37,102.46,102.23,102.23,100.89,100.73,101.27,101.27,99.82,98.87,99.69,101.11,100.37,102.67,102.65,103.26,102.44,104.34,104.85,105.1,105.87,105.92,105.42,105.87,106.93,108.88,108.87,109.4,110.8,110.51,110.48,110.48,110.48,110.48,110.42,108.81,109.05,109.66,110.16,111.59,109.78,110.52,110.14,111.48,111.49,111.62,111.72,111.29,111.62,109.71,109.71,109.21,108.41,108.18,107.8,106.24,106.33,107.36,106.69,106.94,108.19,108.21,108.17,108.21,109.16,109.45,107.25,107.31,107.19,106.34,106.88,108.36,108.9,110.42,110.62,110.82,110.7,110.83,111.3,111.11,111.47,111.86,112.34,112.23,110.49,110.51,110.51,110.74,109.67,109.33,108.76,110.86,110.14,110.14,110.6,109.66,109.66,108.74,108.3,104.76,105.17,103.88,103.82,104.23,102.82,102.19,102.42,102.87,103.08,102.97,102.22,102.21,102.32,101.04,102.03,102.01,103.66,103.47,103.6,103.6,103.7,105.18,105.61,105.43,104.81,104.56,104.41,104.9,106.42,106.7,106.49,106.53,106.41,106.51,107.37,107.27,107.18,106.68,105.29,106.13,106.05,103.81,103.49,103.89,105.06,105.41,105.39,105.94,104.94,104.63,106.13,106.13,106.66,105.62,105.55,105.24,103.5,103.97,102.96,102.72,101.66,99.42,97.96,97.41,97.57,98.52,98.71,97.73,98.52,98.52,98.15,98.62,99.75,99.88,99.07,99,97.49,97.99,98.78,98.31,100.12,100.15,99.83,101.16,102.22,102.64,103.37,103.89,104.7,104.7,104.7,105.15,105.02,105.55,106.27,106.86,106.94,107.45,106.08,106.26,104.89,105.74,106.08,103.81,103.81,103.36,103.47,104.9,104.9,103.91,104.87,106.01,106.05,106.82,106.53,105.46,105.84,107.24,106.78,106.96,107.11,107.38,107.29,106.5,106.62,107.63,109.22,109.93,109.98,109.93,109.45,108.57,109.65,108.73,109.76,111.06,111.01,110.65,109.09,107.57,108.02,109.08,108.95,109.34,108.71,106.99,107.25,106.76,105.98,105.65,106.91,107.48,107.97,108.35,110.21,112.15,112.01,113.8,113.73,113.77,114.16,113.99,113.22,113.22,113.67,114.11,113.56,113.56,112.24,112.39,111.5,112.58,111.88,113.81,114.83,116.02,116.56,115.87,117.04,117.24,118.13,116.78,118.32,116.87,116.87,116.87,113.17,113.64,111.47,109.99,110.19,112.37,112.88,116.22,115.28,114.52,115.69,116.56,116.33,117.13,117.04,115.1,115.32,114.67,113.04,108.63,109.88,108.21,107.11,103.61,104.52,104.98,107.51,108.77,106.34,101.71,102.31,99.35,95.72,93.03,90.06,87.71,83.43,77.03,82.6,78.04,85.18,90.03,88.65,90.37,89.86,91.55,87.5,89.62,89.57,93.09,94.66,93.51,94.94,95.87,94.09,95.66,95.66,95.52,98.58,97.47,96.41,97.37,98.09,96.75,98.51,99.11,99.79,99.79,99.79,96.87,96.87,98.57,98.36,99.2,98.55,97.94,98.9,98.05,98.11,98.74,101.2,101.56,101.95,100.36,101.57,103.33,103.46,103.71,103.72,105.61,106.72,110.52,110.73,112.34,112.4,112.61,112.84,111.57,108.93,103.58,109.24,109.41,108.98,109.54,108.79,108.99,110.83,108.13,109.54,107.48,108.27,108.34,109.73,110.51,112.34,110.85,110.55,111.04,110.19,112.04,111.96,112.98,111.81,112.71,112.42,114.1,113.67,113.02,112.36,113.46,116.02,116.45,116.68,115.71,115.76,117.14,118.54,120.34,120.83,122.45,124.09,124.74,124.99,123.41,123.41,120.93,121.2,116.58,118.35,119.58,121.22,121.45,120.37,120.7,118.73,119.76,120.41,122.32,120.62,121.25,122.69,121.29,122.36,122.33,124.08,125,124.59,122.93,123.08,122.11,119.38,119.7,116.93,117.35,118.69,119.62,119.62,119.62,119.62,121.19,121.55,122.68,122.72,122.72,123.37,123.54,122.37,121.35,120.54,120.84,121.66,122.06,121.29,121.69,121.2,120.53,121.06,119.81,116.59,118.27,120.63,121.32,124.28,124.51,125.95,126.07,128,127.46,128.74,131.67,131.37,131.42,131.49,131.67,134.7,135.41,134.64,136.12,136.35,133.77,136.22,138.64,139.8,142.11,142.97,140.5,143.6,142.78,143.89,143.63,143.37,144.01,143.8,143.63,143.87,141.65,143.54,146.58,146.58,146.87,147.38,150.49,150.49,154.58,156.96,155.43,158.8,166.31,166.66,165.4,166.37,166.16,162.52,158.68,162.88,163.91,166.33,165.11,169.04,164.96,163.78,160.96,156.39,160.6,162.75,164.37,161.7,163.63,161.95,161.55,162.22,162.22,162.22,165.07,165.93,163.98,161.37,162.72,161.15,160.74,157.39,163.33,158.46,158.46,160.35,162.46,160.1,159.26,157.85,156.86,155.97,158.89,160.86,160.11,161.32,160.04,161.22,159.62,159.51,157.99,157.37,157.92,159.61,159.28,161.05,160.44,162.13,163.8,164.23,164.63,164.95,165.01,164.02,163.99,165.87,166.5,167.25,167.16,166.98,168,164.97,165.21,165.36,167.13,167.05,165.25,164.78,163.27,162.5,163.74,163.74,163.93,165.67,168.4,165.75,163.08,160.84,162.42,161.69,163.55,163.55,163.01,163.16,162.58,164.04,163.72,163.52,164.66,165.41,166.35,166.28,167.72,167.08,167.48,167.34,165.51,165.97,167.3,167.47,167.82,168.91,168.05,168.16,166.79,167.93,168.82,169.46,170.24,170.08,169.14,169.64,168.67,168.54,169.18,169.89,168.92,167.24,165.39,166.72,168.04,167.6,168.84,168.09,166.18,165.66,164.68,166.76,166.82,165.24,165.53,165.89,166.02,163.87,164.98,166.21,168.56,168.05,167.49,166.86,165.67,164.19,163.28,160.83,160.83,159,159.79,156.54,154.93,156.4,159.45,160.02,158.64,158.58,159.07,162.28,162.33,160.77,162.05,162.5,161.51,160.25,157.44,157.99,158.37,159.4,159.59,158.19,158.87,158.87,158.87,158.87,158.67,158.43,158.87,157.02,154.66,155.13,152.61,152.61,149.99,147.64,150.04,149.76,149.76,147.16,148.48,150.6,151.99,151.54,152.85,152.21,151.99,152.05,152.7,154.27,152.88,152.26,150.17,150.69,152.62,150.56,151.35,150.71,150.6,150.9,149.31,149.2,150.91,152.45,152.33,150.54,149.77,150.96,154.27,153.25,152.85,151.51,148.85,147.52,144.28,148.1,150.62,151.52,151.86,153.2,153.57,155.06,153.84,153.57,152.85,152.95,153.73,154.22,151.29,152.29,153.11,153.91,154.83,154.09,155.09,153.36,152.38,152.38,152.38,152.85,150.91,149.3,151.09,149.8,150.36,152.56,151.92,149.77,148.37,147.28,146.2,147.04,145.38,143.53,140.09,139.48,134.75,138.38,138.38,138.38,138.38,139.78,141.61,140.29,140.51,142.51,143.64,142.49,140.31,139.33,141.98,142.85,142.47,142.37,140.52,140.88,137.25,138.56,139.76,139.76,139.39,141.89,139.82,136.47,135.06,135.06,138.39,137.35,137.08,135.7,137.65,139.73,140.06,138.69,139.8,141.03,140.47,139.96,139.96,140.62,140.9,141.33,140.4,141.07,141,139.55,137.51,137.62,137.53,136.19,138.78,138.15,136.78,136.7,138.14,138.2,138.78,137.4,134.9,135.56,133.83,135.36,137.26,136.85,136.58,136.79,136.79,134.91,134.91,132.85,132.76,130.64,133.56,132.95,134.34,134.66,132.68,135.02,135.43,133.01,133.6,133.08,134.54,136.26,137.05,137.05,135.49,136.07,136.07,133.62,133.84,133.99,132.16,127.52,126.88,124.55,124.57,123.73,121.55,122.3,119.09,118.08,120.63,122.23,123.36,120.94,118.75,117.52,117.52,119.46,116.85,119.18,119.89,119.17,117.91,118.52,118.04,119.03,121.72,121.34,122.16,123.58,122.67,123.06,123.55,123.6,124.33,124.98,124.85,124.33,125.17,125.81,126.6,126.5,126.84,125.38,127.53,127.82,127.82,128.25,127.53,127.1,126.32,124.77,123.19,123.65,125.1,125.21,122.29,123.5,124.84,121.78,120.96,120.79,121,119.12,119.49,119.49,119.49,123.14,120.89,120.08,119.33,118.48,118.88,117.77,116.61,115.1,112.01,112.18,109.47,109.26,108.76,108.76,111.43,111.74,112.59,112.26,112.26,110.16,110.98,109.23,111.86,111.94,113.49,112.6,111.57,111.55,112.67,112.71,113.59,115.51,114.06,115.81,117.47,117.46,116.61,117.64,119.01,120.61,121.86,120.27,124.89,124.29,124.59,124.46,122.44,122.59,121.64,120.62,121.42,122.66,122.18,120.69,121.99,124.09,124.48,121.78,121.35,119.89,119.17,119.15,120.46,119.7,119.66,121.08,118.96,118.86,118.59,117.53,117.22,118.86,116.77,116.85,117.6,114.84,112.53,112.53,112.02,111.94,114.41,115.15,116.56,119.71,119.67,119.98,120.11,121.29,122.17,121.28,120.57,121.31,121.99,121.99,121.99,123.99,125.85,126.78,124.73,122.64,124.16,125.22,125.97,123.25,123.91,125.88,125.59,125.13,124.38,125.04,122.92,125.29,124,124.39,124.3,122.13,123.48,122.52,121.36,121.69,121.69,122.25,122.29,124.06,123.62,121.91,121.4,120.09,121.08,118.13,119.49,119.21,120.63,119.64,119.97,121.42,122.06,121.5,120.94,122.29,122.54,122.95,124.48,123.85,124.38,125.08,122.86,125,126.17,127.9,128.37,128.76,128.99,129.08,128.92,129.02,128.59,127.93,127.06,125.43,125.23,125.67,126.2,126.2,127.21,126.22,126.09,126.09,127.14,126.88,126.04,125.74,125.1,125.42,125.75,126.26,127.5,129.2,129.99,130.31,130.07,129.63,130.31,130.31,132.01,131.09,130.69,132.46,132.94,132.94,132.68,132.49,134.06,133.2,133.9,133.23,132.66,133.43,132.64,132.43,131.21,131.86,130.83,131.58,131.56,130.82,130.04,130.64,132.62,132.05,131.06,129.96,128.17,127.89,130.28,131.22,131.87,134.11,133.65,132.74,132.63,132.08,132.36,133.1,133.33,131.65,133.27,132.99,133.6,135.68,132.9,132.03,131.91,131.31,130.64,132.05,131.61,131.04,130.01,130.01,128.06,127.65,126.96,127.12,127.45,127.24,129.04,127.66,128.54,129.02,129.48,129.4,130.77,131.83,131.54,130.6,130.17,130.04,130.5,129.71,129.88,131.89,133.36,131.69,130.98,130.95,128.74,128.35,128.18,126.37,126.29,126.29,126.29,126.29,126.29,123.49,123.15,123.29,123.29,123.36,125.53,127.12,125.93,124.97,126.54,127.11,124.77,122.91,121.96,123.09,122.34,118.96,119.27,119.43,118.12,119.72,121.83,123.02,129.17,126.52,125.25,125.75,125.15,124.98,126.24,129.1,129.23,128.36,129.2,130.11,130.2,130.24,129.11,128.98,130.47,130.12,130.82,129.42,129.94,128.67,128.9,128.6,130.12,130.63,131.34,130.15,131.95,132.97,132.78,132.96,135.34,134.83,134.97,134.97,135.46,136.25,138.39,138.39,139.38,135.76,134.55,134.22,133.59,132.9,131.69,131.54,130.74,131.14,129.39,126.06,126.46,128.72,128.58,129.49,128.83,129.03,129.19,130.6,130.46,129.98,132.36,136.62,134.97,134.45,136.17,136.57,136.57,136.57,138.15,136.34,135.76,137.43,139.5,137.97,137.63,138.26,138.61,137.42,136.36,137.92,137.45,137.45,139.59,138.23,137.71,137.93,139.82,138.52,139.59,140.34,141.74,138.93,139.67,138.13,140.45,144.44,144.05,143.31,144.81,144.61,144.27,144.82,144.68,145.48,142.92,145.2,143.64,144,143.13,143.13,143.31,141.97,141.22,137.88,136.38,138.8,136.29,137.96,137.61,140.55,137.81,139.56,140.89,141.15,141.15,140.83,140.55,140.55,144.11,144.61,142.58,143.45,143.41,143.43,143.43,144.81,143.25,144.45,143.63,143.57,143.65,141.51,143.48,143.54,141.08,138.66,138.47,141.28,140.14,141.65,141.65,143.57,142.05,142.14,143.46,144.86,145.35,144.52,146.02,148.06,148.74,147.23,146.27,146.84,148.06,147.77,148.45,148.57,147.36,148.14,150.19,152.87,152.49,153,152.92,154.05,151.64,152.24,152.81,151.36,150.37,148.4,146.83,147.53,146.38,143.52,144.65,146.4,144.91,147.08,147.1,141.16,128.28,132.1,134.95,134.02,135.88,137.47,138.01,139.31,139.31,142.68,141.3,142.64,142.34,142.68,142.22,141.6,140.93,141.2,139.2,139.76,139.97,138.7,134.01,133.72,132.35,131.5,130.84,129.75,132.92,132.86,132.86,132.86,132.86,132.7,133.24,133.67,135.15,133.19,137.79,136.82,133.27,133.27,131.71,131.71,132.1,134.27,133.07,133.07,133.45,133.54,135.2,135.71,134.24,134.42,133.53,133.99,132.24,133.86,132.54,132.73,134.24,134.63,133.36,131.17,130.46,132.82,132,131.67,131.77,131.32,129.36,126.53,123.25,122.81,123.91,126.96,126.84,127.19,127.37,128.48,130.13,129.73,128.46,128.13,125.81,125.76,128.12,126.25,125.2,124.5,121.28,124.01,125.19,127.19,127.76,127.42,125.73,127.46,124.62,123.05,124.85,125.01,125.01,124.26,123.33,122.86,122.86,122.84,125.25,128.15,127.91,129.48,129.65,129.32,127.69,127.85,127.94,129.78,129.53,129.09,129.28,130.95,129.31,130.17,130.17,130.17,130.17,130.17,128.86,125.46,127.07,128.52,130.09,129.07,129.31,130.14,130.36,131.84,132.5,133.41,134.46,137.05,136.13,136.04,135.26,134.35,135.03,133.92,129.22,129.22,129.12,130.3,131.55,130.82,130.96,129.48,131.78,131.98,131.74,134.6,134.46,135.63,136.65,137.3,136.55,135.72,137.23,135.4,132.58,128.49,130.74,129.99,128.69,127.05,119.68,119.85,117.72,125.66,124.6,125.76,126.85,125.06,126.14,126.93,127.3,127.03,129.09,129,130.22,130.3,131.07,130.94,130.94,130.96,130.96,130.96,131.94,132,132.01,134.17,134.2,135.99,134.97,135.47,133.97,134.15,135.06,133.29,133.47,136.11,135.79,137.76,140.35,139.02,139.04,139.04,142.99,145.56,145.56,148.05,148.75,150.68,151,149.72,152.37,152.76,154.18,154.35,156.68,156.3,161.49,162.17,160.68,159.54,160.27,160.91,160.2,162.72,159.55,159.66,162.83,163.14,165.61,165.48,167.18,168.07,166.67,166.86,166.65,167.98,165.47,166.24,166.23,166.52,167.52,168.48,170.01,169.55,162.63,164.21,166.71,166.48,168.29,167.56,167.49,166.85,168.9,168.76,168.76,165.91,164.75,163.77,164.06,165.64,167.73,165.99,166.34,166.92,166.27,163.64,165.51,166.37,167.12,167.33,168.1,170.58,173.97,175.5,178.88,179.62,182.79,180.52,183.75,183.01,184.89,186.15,185.7,185.79,180.92,183.7,183.24,185.31,190.73,190.73,190.73,190.73,190.73,190.73,195.98,194,192.08,197.36,202.73,203.13,206.92,206.92,209.75,207.34,212.61,218.67,216.29,220.92,222.35,224,231.56,224.96,218.56,219.71,215.69,222.39,224.75,226.81,227.55,217.8,222.91,215.1,213.64,218.1,208.88,209.06,210.53,216.23,217.77,214.16,214.14,218.69,220.65,220.24,224.52,227.75,226.43,226.34,224.27,227.27,222.08,217.06,221.35,218.66,219.72,225.26,226,225.83,225.83,228.1,234.14,234.25,234.25,241.28,250.78,254.92,256.86,256.75,258.32,260.1,263.14,265.09,269.2,272.39,275.99,273.87,276.37,279.21,281.14,278.34,288.04,293.29,295.95,297.04,280.44,301.34,305.53,292.61,289.19,301.88,301.81,304.9,315.54,314.89,314.89,314.89,314.89,324.81,332.29,334.57,342.84,349.39,364.92,360.79,360.79,332.21,292.55,321.32,320.4,299.71,318.15,322.41,319.88,314.25,319.62,325.06,343.49,333.36,333.41,311.13,319.94,324.21,312.69,311.26,301.64,287.82,314.6,299.44,308.6,313.83,317.41,341.26,334.67,339.7,336.61,346.75,354.32,362.55,360.05,361.73,371.97,372.85,377.14,375.69,384.76,386.19,389.11,383.53,383.53,405.76,405.76,436.67,444.49,445,468.3,457.46,471.67,480.56,449.34,452.78,437.75,435.08,473.62,473.94,473.94,487.27,502.09,499.66,519.08,541.15,543.98,543.98,533.29,501.38,458.67,499.98,474.36,476.07,499.18,525.83,538,547.75,564.08,564.18,571.04,510.92,529.44,562.12,528.23,522.84,529.87,516.2,471.46,502.26,499.88,473.76,447.78,452.17,462.6,417.02,422.22,449.92,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63,417.63],"Nikkei225":[100,100.32,99.71,100.31,100.06,98.88,101.16,101.09,102.06,102.3,102.3,102.97,103.24,102.82,102.5,102.54,100.77,101.11,100.41,99.15,99.84,99.84,99.68,101.58,101.58,101.26,99.99,100.83,99.51,100.89,99.42,100.32,101.15,101.65,102.14,101.9,101.9,102.89,101.78,101.38,101.88,102.14,102.53,102.74,104.17,103.86,104.16,104.95,105.11,104.78,105.44,105.31,105.42,103.56,103.56,102.17,103.82,103.78,98.22,104.83,105.01,106.81,106.78,107.96,107.96,108.59,109.43,109.77,109.77,110.8,111.09,110.95,110.64,110.65,111.89,111.36,110.45,110.97,111.79,113.42,114.81,115.77,116.35,116.37,116.49,117.26,117.2,117.82,117.52,117.42,117.42,117.23,117.27,117.26,115.71,115.52,115.52,115.52,118.42,117.98,117.58,117.58,116.65,117.04,115.65,116.57,115.41,113.71,114.19,115.27,115.67,114.17,113.55,115.18,117.26,117.66,117.06,115.08,115.73,114.32,114.34,114.69,114.29,114.88,114.27,117.12,117.61,116.28,117.48,116.93,116.25,116.35,117.14,117.13,117.08,116.55,115.48,115.55,117.21,118.25,117.67,117.12,116.91,116.37,116.76,118.49,118.66,118.52,118.32,118.4,117.99,117.99,117.59,115.08,115.35,116.42,114.75,116.06,116.15,115.21,114.28,114.73,113.69,113.99,112.4,112.81,113.61,113.31,112.13,111.37,110.82,110.94,111.32,111.4,111.39,112.54,114.08,115.31,116.58,116.35,116.02,116.71,117.53,117.53,117.53,117.53,120.25,119.93,120.27,120.64,120.17,120.09,120.39,119.76,118.18,118.4,118.93,118.54,119.32,119.75,118.98,118.96,118.93,118.76,120.03,121.95,121.91,120.75,120.78,120.33,120.96,120.32,120.26,120.17,119.86,120.53,121.29,122.27,121.72,121.54,121.68,121.8,122.24,121.66,122.21,121.08,121.21,121.07,121.37,120.84,120.45,121.37,122.06,121.47,121.48,121.59,121.59,120.88,121,121.75,121.48,120.73,120.61,121.18,121.36,120.63,120.42,120.79,121.36,121.05,120.59,121.21,120.85,119.3,119.24,119.24,118.08,119.39,119.24,119.08,117.68,117.21,117.15,117.46,116.97,117.57,117.55,117.02,117.89,118.74,119.01,117.9,117.16,117,117.23,116.49,118.13,119.53,120.07,119.71,120.33,120.33,122.69,122.75,122.98,122.67,123.28,122.87,122.49,123.07,123.03,123.3,124.59,124.66,124.68,125.05,125.05,125.85,126.2,126.65,127.86,128.46,128.95,129.11,129.63,129.69,131.13,131.79,131.2,131.39,133.02,133.03,133.03,135.5,136.22,136.22,136.28,138.63,138.49,138.21,137.08,135.27,135.26,133.14,135.09,135.36,134.55,135.48,136.13,136.13,136.29,135.96,135.9,136.57,137.35,137.91,137.24,136.73,134.03,135.97,137.87,138.64,138.2,137.55,137.16,136.31,138.41,138.21,138.35,138.2,138.42,138.64,138.36,138.47,137.7,137.59,137.59,137.59,142.07,143.33,143.33,144.15,143.77,143.3,142.96,143.33,144.76,144.26,143.62,143.89,143.94,145.8,144.69,143.05,142.83,142.81,140.77,139.6,141.95,140.67,137.09,130.61,130.82,132.3,129.23,129.23,128.4,127.85,129.73,131.27,133.87,132.51,132.79,131.37,132.32,133.89,135.32,133.38,131.3,128.02,127.17,129.45,128.45,129.14,129.76,131.9,132.77,131.62,131.78,131.01,129.83,129.22,129.22,130.5,124.61,125.51,128.84,127.11,127.88,129.67,129.27,128.69,128.85,130.82,130.35,131.02,131.72,131.07,130.91,131.63,131.97,132.04,133.92,134.12,133.94,133.5,134.64,134.27,134.9,135.79,135.79,136.03,135.82,135.82,135.82,135.79,136.04,135.44,135.97,137.55,138.2,137.91,137.3,138.03,138.59,139.02,138.77,137.13,135.61,135.69,135.87,135.13,133.08,134.18,134,135.84,136.22,136.75,137.94,137.16,137.82,138.27,138.8,137.43,138.11,137.08,134.65,136.32,137.15,136.09,135.01,135.03,134.61,134.6,134.8,131.83,131.67,131.25,130.23,131.68,133.28,134.15,132.55,134.1,136.57,136.57,137.18,137.76,137.59,137.18,135.36,136.05,136.68,136.51,137.27,136.26,136.31,137.48,136.06,136.14,136.03,136.97,136.86,136.58,134.77,132.1,135.12,134.2,134.12,134.6,134.17,134.29,135.16,135.45,136.6,137.8,137.88,138.09,138.22,138.19,137.24,137.18,136.47,135.91,134.82,135.22,136.98,136.62,137.93,139.58,139.58,141.55,143.07,143.09,144.27,144.27,144.69,145.26,143.82,145.78,146.54,146.69,145.72,144.9,143.74,143.74,141.84,142.07,136.54,137.16,134.6,136.28,138.05,136.94,136.18,136.68,133.03,133.52,128.54,128.04,127.83,129.68,132.48,131.08,134.44,132.35,133.86,133.48,135.91,134.48,134.6,131.82,132.04,131.78,131.03,131.88,130.44,129.99,130.83,130.83,131.83,132.68,134.03,134.55,135.09,136.44,133.18,132.48,129.95,131.02,128.25,127.81,130.56,131.85,129.19,129.98,127.62,126.85,123.25,121.88,121.88,115.77,116.81,121.35,120.97,120.97,120.97,120.97,118.23,121.11,122.11,123.46,121.87,123.05,123.05,124.23,123.55,123.31,124.9,125.22,124.64,124.46,124.35,125.55,124.8,124.89,124.24,125.55,125.64,126.22,125.98,126.16,125.42,122.89,122.89,126.1,127.79,127.76,126.32,128.62,128.75,129.53,129.73,129.49,130.11,129.64,130.28,129.25,130.56,131.89,131.31,130.53,129.68,127.07,127.68,129.96,128.67,128.65,129.65,130.45,130.35,130.6,130.6,130.71,126.78,129.51,129.21,127.12,128.16,130,129.97,131.23,131.3,131.8,131.52,131.77,131.08,131.22,132.18,133.99,134.3,134.64,133.51,134.18,134.28,134.53,134.17,134.82,134.53,134.53,134.53,134.53,134.53,134.53,134.53,132.5,130.56,129.35,129,128.08,127.33,128.06,127.3,128.43,128.74,128.57,128.63,127.83,127.63,128.02,128.49,126.94,126.57,124.51,123.36,123.35,125.57,125.55,126.22,127.73,128.15,127.7,127.11,127.63,127.67,126.76,128.94,129.72,128.48,128.65,128.09,127.44,128.96,128.59,131.33,131.48,130.78,131.17,131.43,130.15,130.34,130.14,130.81,131.07,131.07,130.16,129.76,127.2,129.74,129.44,130.67,131.21,131.49,130.9,130.65,131.21,130.07,130.19,127.45,125.23,124.41,124,124.46,125.02,125.02,123.63,124.84,123.33,123.41,124.28,124.97,124.61,124.67,125.17,122.45,123.63,123.77,123.66,125.13,124.62,124.65,124.8,127.44,128.13,128.84,129.29,130.53,131.51,132.89,132.89,132.97,132.73,133.23,133.44,133.44,133.56,133.09,133.26,132.23,131.49,132.27,131.63,128.99,129.4,129.19,130.47,129.68,130.26,131.75,131.75,134.22,135.82,135.7,135.94,136.28,136.28,136.74,137.5,137.8,138.21,138.85,138.06,138.57,138.11,138.11,140.53,140.84,141,141.38,141.01,142.15,140.94,139.86,140.84,141.53,140.78,139.91,139.24,139.69,140.78,141.26,141.65,141.48,140.78,142.21,141.3,139.83,140.82,141.15,141.61,141.49,141.38,141.58,145.19,144.76,145.45,144.66,144.23,143.94,143.97,144.03,143.74,144.6,144.07,142.98,142.98,142.98,142.98,140.25,142.49,140.25,143.48,144.15,144.15,145.2,144.55,144.65,145.3,145.56,144.23,145.24,143.82,144.01,141.08,140.31,141.3,138.87,140.25,138.84,139.52,140.94,144.29,144.01,143.15,143.15,144.21,144.01,143.16,142.17,140.18,141.43,141.9,141.35,141.35,136.62,135.54,132.65,127.78,129,127.42,127.53,128.91,125.41,119.06,120.07,117.35,112.17,105.35,102.76,102.81,101.09,100.04,100.04,102.07,109.35,118.14,112.81,117.19,115.35,114.33,109.18,107.69,107.7,112.27,114.53,116.97,116.92,117.85,115.09,118.69,118.16,116.59,120.26,118.88,116.53,115.67,117.43,116.42,119.57,119.49,119.49,122.05,118.58,118.58,118.58,118.58,118.91,121.96,123.24,123.09,122.49,120.36,121.1,121.68,123.5,124.47,124.21,123.22,125.36,128.56,129.45,132.46,132.23,133.34,134.93,136.67,137.17,138.18,140.08,139.56,139.76,135.82,134.81,130.13,136.48,135.72,135.11,135.86,135.61,136.28,136.19,134.53,136.06,132.93,134.71,133.7,133.85,134.82,137.28,136.68,135.62,136.16,134.72,137.71,136.51,138.68,137.62,137.17,137.3,138.31,137.51,137.51,137.51,137.29,136.94,135.36,135.01,131.21,134.14,136.43,136.08,135.49,134.96,134.96,137.5,138.06,140.52,140.76,139.59,139.32,139.68,138.29,138.53,138.92,140.8,140.77,140.27,138.3,139.85,139.84,140.5,141.82,140.25,139.55,140.66,139.2,140.43,141.46,142.39,141.76,141.88,140.94,141.19,141.19,141.19,141.1,139.54,140.24,142.1,142.27,140.13,140.13,139.19,140.89,141.63,141.56,142.92,142.75,142.38,142.64,142.8,142.07,141.49,143.06,142.43,142.87,141.87,142.13,142,141.94,141.54,141.01,138.87,140.79,140.79,143.21,145.69,147.02,150.13,150.52,153.21,154.24,153.43,156.58,157.23,155.5,154.93,154.28,154.28,158.14,158.93,160.39,161.04,159.76,161.9,161.98,162.03,161.68,160.45,159.96,162.08,161.71,161.08,161.57,161.3,161.72,162.01,161.75,161.46,159.78,160.31,161.18,161.11,162.3,166.62,165.87,165.87,164.74,164.14,163.52,166.15,170.07,170.07,170.22,171.99,173.45,172.36,170.69,173.06,172.39,173.8,173.04,174.2,172.53,173.07,170.42,167.19,169.78,171.42,173.13,171.29,173.94,177.62,178.33,178.67,178.67,178.41,181.82,184.14,183.08,182.74,181.42,182.26,182.26,179.33,182.33,175.07,179.28,177.74,178.65,174.85,174.45,173.72,175.44,175.49,176.55,179.61,179.91,180.84,180.8,182.62,180.06,176.32,175.25,171.68,173.64,176.34,177.59,177.89,176.35,177.62,180.43,181.85,179.48,179.69,179.56,179.91,178.53,179.81,179.02,179.16,179.4,179.41,175.88,172.3,176.41,175.4,176.03,175.22,175.6,175.6,174.14,174.14,174.14,174.14,177.27,177.43,178.4,172.91,170.12,165.89,169.74,168.17,171.69,169.5,169.82,171.15,171.43,172.58,173.11,172.55,176.17,174.43,174.15,174.95,175.62,174.92,175.39,175.05,174.43,175.02,174.96,176.25,177.94,177.03,175.38,175.05,169.29,174.57,174.51,174.52,175.67,175.56,174.14,174.01,173.5,173.96,172.84,173.11,171.44,169.94,168.87,172.67,173.57,172.9,170.91,169.25,167.13,165.53,166.5,166.5,166.5,168.22,169.05,166.7,167.91,164.9,167.9,167.06,166.71,167.58,168.14,168.14,168.55,169.65,169.32,169.09,166.35,165.75,166.72,164.88,163.26,166.17,167.61,167.56,167.67,167.06,167.95,169.77,171.95,172.51,176.05,179.26,180.81,182.41,181.36,183.62,184.02,185.36,184.41,183.27,184.34,184.34,180.35,179.14,179.14,182.82,182.77,182.43,178.56,178.01,173.89,171.92,168.15,166.38,167.28,169.52,172.24,170.62,170.07,172.56,175.69,175.42,176.57,176.82,173.51,174.09,172.86,175.91,175.86,174.18,174.62,179.18,178.42,178.42,180.07,178.97,178.34,177,175.92,176.95,178.96,179.97,180.15,179.43,178.89,179.78,179.95,179.95,177.1,178.29,173.77,170.94,168.15,168.84,167.74,169.41,168.79,171.98,174.43,173.61,171.87,173.1,171.84,172.01,175.67,172.53,168.85,172.36,172.62,174.05,173.96,173.32,175.69,174.71,174.01,174.01,174.01,177.09,177.28,172.18,172.12,172.12,170.57,173.85,172.18,169.98,171.24,170.78,166.01,167.85,166.34,166.74,163.98,163.25,158.17,161.47,163.2,163.66,166.41,164.64,165.84,164.69,164.9,166.69,167.39,167.39,163.66,162.37,165.97,164.59,163.92,162.64,159.86,159.86,156.96,160.02,160.32,162.24,159.51,160.63,157.05,152.43,149.83,149.39,155.27,152.08,152.96,153.19,155.7,161.09,162.14,162.14,164.54,169.47,169.89,170.13,168.89,170.75,169.39,168.15,167.21,167.63,167.95,165.3,162.51,163.1,162.1,159.16,162.24,164.22,163.75,161.97,163.09,164.5,166.53,163.82,160.71,161.37,159.48,162.26,162.26,162.09,162.09,162.09,162.09,163.2,159.07,158.15,158.43,155.62,159.72,160.45,161.13,162.65,159.57,161.61,163.19,161.66,161.24,160.79,161.86,165.42,164.87,165.95,165.68,167.79,168.72,168.89,170.64,170.72,168.17,163.11,160.95,159.11,159.75,156.92,155.76,158.63,158.04,158.17,160.11,162.41,163.48,162,159.51,156.75,158.07,159.7,157.79,160.1,160.27,162.05,159.17,160.03,161.03,161.9,161.9,162.95,167.29,168.04,168.71,167.41,167.14,167.51,168.11,168.03,169.19,166.78,167.67,168.82,170.29,170.73,169.23,168.14,168.14,172.53,174.5,174.48,176.62,174.92,174.85,174.03,171.96,171.12,172.12,173.1,168.5,170.41,169.78,167.18,167.12,166.93,166.97,165.78,169.62,170.52,172.5,172.94,168.13,168.48,166.61,166.61,167.34,165.08,164.11,164.11,159.75,160.6,158.19,159.69,156.76,158.44,163.14,163.91,165.06,163.88,163.88,159.56,159.54,158.57,163.73,161.83,164.13,164.74,163.23,162.52,163.03,164.7,165.79,165.27,163.82,166.73,167.29,167.19,167.19,164.39,166.37,168.45,167.51,165.88,170.82,169.01,169.17,169.4,168.81,168.62,168.89,169.93,169.93,171.54,170.94,170.21,169.4,169.04,170.59,167.88,168.14,168.54,167.33,166.65,168.63,168.27,168.95,170.17,169.54,166.37,164.62,160.57,159.48,160.21,158.56,159.59,159.85,159.2,157.71,157.71,157.71,157.71,155.43,156.06,156.98,156.98,158.2,159.83,159.86,157.86,156.07,157.98,161.92,159.59,160.48,162.62,164.99,165.57,165.38,165.5,165.8,165.16,165.28,165.61,166.26,167.38,167.33,166.85,166.71,167.24,165.77,166.83,166.22,167.39,166.28,166.4,166.04,163.81,163.81,165.92,165.75,165.88,166.31,166.2,168.79,170.66,171.1,171.91,172.99,170.1,168.22,164.53,164.57,163.25,165.2,162.85,162.85,166,165.72,165.51,166.07,166.32,168.52,167.92,169.48,170.36,170.96,168.1,166.04,166.32,167.01,168.76,169.73,170.18,172.21,172.34,173.21,172.89,173.2,172.64,172.81,172.97,171.74,171.99,174.4,176.02,176.23,176.23,176.23,176.23,174.97,176.74,176.01,176.04,177.62,179.06,180.37,181.88,184.78,186.2,187.88,187.1,185.44,186.16,186.85,188.77,189.34,186.68,188.25,190.53,194.72,196.47,192.88,191.23,195,196.03,199.56,202.48,202.38,203.71,201.68,201.8,202.92,201.05,198.13,197.63,196.66,200.62,200.86,200.59,204,202,201.49,198.07,195.75,194.55,194.63,193.06,195.94,195.77,195.77,196.39,198.82,196.37,195.24,197.64,197.53,197.44,198.79,197.99,200.49,202.33,197.68,194.36,194.57,194.94,195.68,194.64,196.26,196.26,193.76,194.85,191.99,191.14,190.08,190.78,192.54,193.46,195.14,191.13,194.43,194.77,195.42,197.15,197.7,199.08,199.67,200.9,199.39,197.07,196.23,198.09,197.67,200.46,202.67,202.67,200.91,199.59,196.85,195.83,197.5,195.31,195.65,192.63,192.54,191.95,188.8,184.5,187.81,187.33,187.33,191.87,193.02,196.39,195.31,191.34,193.65,193.66,189.96,188.93,187.36,187.74,188.99,184.95,187.31,185.53,186.51,190.99,193.1,193.1,197.68,195.05,194.41,197.31,196.84,196.94,197.61,202.59,202.01,202.98,201.79,201.59,202.18,202.18,203.23,202.15,201.91,201.39,202.39,202.05,200.84,198.09,202.14,198.59,195.26,198.19,198.5,199,197.55,199.27,197.99,200.77,203.53,200.3,200.47,200.98,201.29,203.56,202.71,202.25,202.25,202.25,201.19,201.73,201.73,204.06,208.16,211.84,215.02,216.98,215.28,214.42,214.35,217.36,220.88,220.71,218.95,219.01,216.07,217.74,217.98,219.31,217.65,218.53,219.72,218.55,218.3,222.8,223,223,229.45,227.87,230.62,232.61,232.51,231.86,231.25,236.31,236.31,237.12,237.16,236.97,236.71,241.21,242.41,242.34,242.3,239.33,239.87,234.62,234.49,233.87,234.54,233.94,240.18,241.77,241.77,246.68,247.12,244.26,244.16,246.36,242.77,243.99,240.56,240.78,238.44,240.38,235.66,237.81,240.38,239.23,238.38,238.87,237.12,232.51,229.43,230.15,224.03,226.27,226.96,232.45,227.42,229.27,229.27,232.12,231.32,231.09,231.09,231.09,234.71,230.89,230.11,231.05,230.75,231.82,232,235.23,234.42,236.13,235.39,233.39,236.33,233.57,235.1,234.83,233.03,229.99,232.61,235.24,234.73,232.63,233.92,233.8,235.94,236.52,234.96,234.02,234.59,230.28,232.58,233.11,233.49,233.27,234.53,236.76,239.74,237.77,239.23,239.52,242.2,245.26,247.27,247.27,246.47,251.3,252.83,255.19,248.95,248.95,249.46,248.39,242.52,242.14,239.33,239.3,236.64,228.88,227.66,232.5,232.84,236.32,230.43,217.03,190.13,209.57,212.08,210.51,211.68,211.68,218.98,220.25,221.97,230.04,225.97,230.05,229.37,230.94,231.87,230.33,231.41,231.91,231.86,233.58,233.9,233.81,223.91,221.55,219.94,218.88,218.54,215.28,222.61,221.09,221.09,218.81,219.88,224.56,228,228,229.31,228.88,235.26,240.72,229.18,233.61,228.51,233,233.51,237.72,235.33,237.39,238.01,239.37,239.37,241.21,236.8,235.17,235.6,235.43,232.16,230.3,230.53,229.15,233.32,235.13,237.39,236.2,229.99,229.99,232.54,238.61,238.01,238.73,238.93,237.98,234.03,232.9,233.55,231,232.17,231.79,229.82,231.38,234.38,232.34,230.48,231.77,230.92,232.77,237.21,237.38,238.1,236.26,236.68,237.93,237.96,240.84,238.55,238.47,237.91,236.2,234.58,233.91,236.68,235.93,236.5,239.14,243.45,241.12,241.12,241.12,241.12,237.56,242.26,241.64,239.37,236.86,236.86,232.53,232.35,233.13,232.39,235.12,235.88,239.61,241.5,241.34,239.13,235.81,238.22,238.82,239.17,232.81,234.49,234.69,236.11,234.42,234.51,234.51,235.49,238.5,236.61,236.76,237.34,236.7,233.76,234.36,234.36,231.1,230.53,231.21,224.56,228.37,225.62,226.15,227.88,222.94,223.79,222.37,222.53,222.35,223.94,226.02,228.73,228.17,228.17,227.71,227.3,228.34,229.83,228.46,224.35,215.27,215.31,215.92,209.94,204.16,188.18,199.52,191.67,209.17,202.99,205.38,207.11,205.01,207.77,209.9,207.18,206.82,210.74,211.77,215.8,216.61,216.61,217.85,220.31,222.6,222.6,222.6,222.29,223.19,226.66,227.52,230.77,230.44,228.19,228.18,226.64,226.82,225.43,223.54,224.59,226.83,228,227.99,232.28,229.45,226.47,226.32,228.14,226.97,228.1,230.2,230.94,232.21,230.71,228.66,231.55,232.91,235.01,232.62,232.1,231.81,234.44,235.36,239.24,242.66,244.7,241.67,240.32,240.46,240.61,239.26,239.87,240.67,239.62,239.15,238.49,239.81,239.72,241.16,240.66,240.66,240.39,248.83,252.79,250.55,247.79,245.83,245.71,248.22,246.59,243.51,245.07,246.56,248.15,252.76,252.76,258.18,261.54,257.76,262.17,264.2,263.19,259.21,257.53,257.67,258.72,256.22,256.98,258.85,258.18,254.98,255.72,253.47,257.35,260,263.78,262.66,264.95,268.18,270.57,270.57,271.38,270.71,273.81,272.25,274.96,274.96,275.78,276.53,274.12,272.24,271.56,269.26,271.59,276.62,289.77,289.81,288.5,293.61,290.64,290.64,283.14,288.13,291.78,287.58,297.27,298.06,298.01,293.98,297.96,305.29,303.52,310.09,310.2,316.76,316.76,311.24,303.47,307.53,303.86,307.7,307.29,308.62,309.94,304.47,304.15,294.35,293.35,301.13,293.89,293.89,294.09,299.53,303.2,303.73,297.98,297.98,301.37,308.41,305.16,305.71,306.15,305.83,303.09,307.25,303.21,298.46,299.24,296.16,299.21,304.62,304.69,304.27,304.66,306.73,305.38,304.24,304.24,304.24,313.27,317.41,314.05,308.94,313.92,313.92,323.64,328.43,327.03,325.98,323.85,320.27,318.96,324.49,325.44,319.63,322.34,322.49,322.59,322.27,318.24,330.72,328.14,325.27,327.9,340.65,348.43,348.43,348.36,344.15,343.33,341.88,345.37,347.33,343.44,343.44,346.44,354.07,355.1,355.68,350.89,340.14,327.85,334.09,336.16,318.68,327.87,332.56,329.1,325.28,324.86,324.56,333.86,322.57,322.57,311.35,315.8,324.85,323.97,322.58,313.59,308.62,324.79,317.08,321.07,322.82,322.92,340.32,337.82,344.04,341.49,349.8,351.35,359.72,353.42,355.53,358.7,360.13,357.43,360.91,365.88,362.13,362.13,358.31,359.69,359.69,359.69,359.69,379.76,379.03,377.24,379.2,382.41,378.67,371.15,367.56,365.96,361.45,372.81,382.81,393.8,392.82,392.84,390.99,400.88,404.54,403.33,413.41,407.78,402.45,386.95,395.37,387.89,388.12,399.01,418.94,419.47,422.48,429.43,430.62,437.29,421.79,418.08,437.37,419.2,419.85,423.44,425.94,415.41,421.52,421.48,412.53,403.84,409.43,414.35,406.4,409.43,415.52,403.94,387.66,387.66,400.3,399.59,401.45,390.5,392.43,376.92,371.3,373.92,388.99,385.32,386.55,400.71,396.98,396.52,404.76,404.76,408.1,412.85,415.29,418.35,407.72,407.72],"S&P500":[null,100,100.2,99.67,99.53,99.38,99.9,99.7,99.46,99.46,99.88,99.88,100.18,100.16,99.94,97.49,98.92,97.45,97.39,98.38,98.01,98.01,98.04,99.11,99.75,99.18,98.33,98.96,99.48,98.56,99.34,99.02,98.53,98.95,99,98.68,99.13,97.9,98.01,97.71,97.72,97.43,98.03,98.24,98.11,98.1,98.57,98.19,98.02,97.73,97.42,97.41,96.75,96.12,95.69,95.53,97.66,98.03,99.11,99.31,99.17,99.16,99.9,99.74,100.21,99.97,100.71,100.93,101.01,101.01,101.41,100.87,101.01,100.74,100.39,100.43,101.01,101.36,102.69,102.91,103.52,103.41,104.08,103.24,103.64,103.46,103.66,104.04,103.78,103.59,103.72,103.72,103.95,103.08,103.05,102.57,102.57,103.44,104.04,103.96,104.32,103.95,103.95,104.25,104.02,104.22,104.22,103.91,104.09,103.71,104.06,103.78,104.46,105.3,105.22,105.13,104.5,104.41,104.44,104.5,105.26,105.04,105.06,105.13,105.74,106.11,106.67,107.1,107.63,107.54,107.72,107.72,108.37,108.26,108.3,108.46,108.57,108.29,109.77,109.13,109.19,108.83,108.51,108.26,108.35,108.7,108.74,108.38,109.28,109.11,108.96,108.74,107.39,107.6,107.48,107.39,107.28,108.06,108.18,108.5,108.25,108.07,108.13,107.8,108.01,107.92,108,107.84,107.44,106.7,106.7,107.62,107.31,107.13,107.94,107.61,108.77,109.44,109.38,109.44,109.23,109.42,109.55,109.41,109.48,109.93,109.93,109.82,109.94,109.7,109.54,110.06,109.99,107.99,108.39,109.12,109.68,109.89,110.16,110.65,110.68,110.68,110.55,110.5,111.34,111.75,111.61,111.3,111.48,111.51,111.41,111.31,111.81,111.7,111.45,111.48,112.41,111.66,111.59,111.54,111.71,111.75,110.85,111.82,110.86,111.03,111.29,111.29,111.45,110.41,111.11,111.22,111.13,111.94,112.15,112.67,112.67,112.74,113.34,113.32,113.28,113.16,113.49,113.52,113.41,113.26,113.18,113.46,113.51,113.26,113.48,113.67,113.39,113.35,111.71,111.85,112.98,112.92,113.08,111.33,111.13,111.26,112.36,111.98,111.74,111.93,111.99,112.08,112.6,113.24,113.47,113.47,112.61,112.96,112.94,112.77,114,114.38,114.47,114.34,114.55,114.72,114.84,114.92,114.57,114.64,114.39,114.4,114.86,115,115.43,115.87,116.12,116.27,116.93,116.8,116.59,116.86,117.07,116.87,116.98,117.18,117.26,117.35,117.39,117.99,117.52,117.71,117.16,117.31,118.25,117.88,117.99,118.18,118.2,118.56,118.72,118.69,118.86,118.42,118.31,118.43,118.15,117.5,118.46,118.15,118.3,119.08,118.99,118.99,119.23,119.19,120.36,120.32,121.3,121.06,120.93,120.48,120.46,120.82,121.48,121.87,122.06,122,121.5,122.6,123.25,122.85,122.75,123,122.94,122.94,122.81,122.91,123.13,122.49,123.51,124.3,124.8,125.68,125.89,126.05,125.91,126.8,127.65,127.65,127.2,128.4,128.19,128.76,129.8,130.08,130,130.08,131.62,130.74,129.31,129.38,129.29,126.55,121.36,123.48,122.86,118.25,120.02,121.69,122.01,123.64,125.13,125.18,125.18,124.45,123.76,123.88,125.87,127.35,125.73,124.34,122.68,123.3,124.66,124.99,124.93,125.49,127.67,127.51,126.7,125.97,125.87,126.09,124.3,124.48,124.25,121.12,118.58,121.8,119.7,119.35,120.99,120.99,118.29,119.78,121.17,122,119.33,119.72,121.73,121.05,122.05,121.7,122.69,124,124.1,123.39,122.34,122.34,120.71,120.93,122.19,122.32,121.32,121.63,120.76,120.48,122.03,122.45,122.42,123.6,124.76,124.97,125.08,124.23,124.73,124.63,124.3,125.22,124.82,125.23,124.98,124.68,124.68,123.24,124.8,123.94,125.29,125.85,125.94,127.02,126.93,127.32,127.46,127.68,127.17,127.48,127.35,127.08,126.57,126.79,125.98,126.22,124.49,124.76,123.69,124.45,124.55,124.93,124.31,124.31,125.38,126.44,127.56,128,127.09,128.21,128.35,128.21,128.72,129,128.49,128.37,128.6,129.22,130.4,130,129.15,128.4,129.03,128.9,129.53,130.13,130.59,130.96,130.93,130.74,129.81,129.29,130.12,129.13,130.15,130.58,130.9,131.17,131.12,130.9,131.71,132.72,132.75,133.51,132.92,132.94,132.94,132.72,132.34,131.86,131.57,131.82,132.31,132.36,133.06,133.09,132.35,133.06,133.23,134.28,134.23,133.75,133.58,133.14,133.51,133.51,133.99,133.94,134.04,132.94,132.21,132.15,131.97,127.63,125,126.78,126.03,128.74,128.71,126.85,126.81,126.26,125.57,121.69,123.96,121.81,121.01,122.91,124.24,125.55,124.76,125.46,126.24,128.92,128.6,127.41,124.9,124.72,123.78,125.09,125.37,123.28,121.04,121.41,121.41,120.61,122.49,122.89,125.71,125.44,126.46,127.84,123.71,123.71,123.52,120.64,120.85,120.81,121.46,121.44,119.12,116.64,116.66,114.86,113.05,110.72,107.72,107.72,113.06,114.03,113.89,114.85,115,112.15,116,116.82,117.95,118.43,118.97,118.95,118.33,119.59,119.86,120.77,122.36,122.36,120.63,120.89,121.06,122.09,121.13,120.95,122.84,123.89,124,124.84,125.43,125.15,123.98,124.06,124.15,125.75,126.13,125.8,127.17,127.17,127.36,127.58,127.13,127.95,128.11,128.01,127.94,127.57,128.45,127.96,127.81,126.98,125.95,125.68,127.52,127.9,128.79,128.67,129.31,129.79,129.78,129.4,130.8,128.32,128.21,129.13,128.53,128.99,129.86,131.36,131.37,131.65,131.92,132.53,132.67,131.87,132.33,132.33,133.21,133.12,133.19,132.89,133.1,133.1,133.23,134.41,134.12,134.07,134.69,134.84,134.97,133.95,133.67,134.96,134.35,132.14,131.92,131.53,132.01,128.83,129.86,130.62,131.78,131.01,130.13,131.23,130.86,129.3,129.48,129.48,128.39,127.51,127.77,126.09,125.74,128.43,129.48,130.28,131.65,132.26,132.21,131.94,132.48,132.27,132.39,133.68,134.08,135.35,135.18,134.94,133.66,133.5,134.01,134.78,135.81,136.21,137.26,137.26,137.01,136.35,136.51,137.13,137.44,138.08,138.1,137.63,136.73,137.22,136.38,136.76,137.7,138.34,137.62,138.63,138.41,138.05,136.55,135.32,134.34,130.33,132.03,132.13,134.61,133.72,132.07,134.07,130.15,130.47,132.35,133.95,132.89,133.99,133.92,130.44,131.88,131.45,132.31,133.99,134.08,134.08,133.15,134.6,136.35,136.47,136.46,136.5,137.49,137.89,137.79,137.35,137.71,137.76,137.76,137.08,137.07,135.92,136.76,136.42,135.7,136.38,134.71,132.3,133.35,135.25,134.64,132.55,133.76,134.61,136.09,135.9,137.25,136.98,137.35,136.82,137.76,137.26,137.66,137.92,138.48,139.25,139.14,139.59,139.17,140.51,141.03,140.87,140.97,141.35,141.71,141.43,141.66,141.76,141.88,142.97,143.04,142.95,142.42,142.19,142.5,143.57,143.89,144.49,144.49,143.91,142.67,141.72,142.61,142.83,144.13,143.68,143.52,143.94,145.17,145.18,146.22,146.27,146.21,146.86,147.58,147.71,147.68,147.68,148.44,148.45,147.59,148.02,149.26,148.21,148.73,148.31,149.04,150.03,149.61,150.65,150.42,150.7,151.96,152.55,152.55,152.15,152.19,152.36,150.99,148.61,150.1,149.97,150.44,147.78,148.85,151.08,152.78,153.29,152.46,153.58,153.84,154.83,154.58,154.87,154.87,154.41,155.14,154.55,152.92,147.8,143.32,142.78,136.48,135.35,141.58,137.6,143.41,138.55,136.18,125.84,132.05,125.6,113.65,124.21,109.32,115.88,109.87,110.39,105.6,102.51,112.13,113.42,120.5,116.44,120.34,118.42,113.19,115.77,114.02,122.04,121.84,125.99,127.82,127.82,126.53,130.4,127.52,128.26,131.7,129.35,125.38,128.25,128.18,129.97,131.88,131.19,134.68,133.44,129.69,130.24,131.42,130.5,132,134.23,134.25,131.5,129.2,130.69,131.2,135.34,133.92,136.15,135.09,135.41,135.41,137.07,139.1,138.81,139.48,140,141.15,143.08,142.6,146.33,148.1,146.94,146.16,137.54,139.34,140.5,143.16,142.65,142.73,141.93,142.85,143.46,139.75,141.29,137.86,139.89,142.04,142.76,143.4,143.4,145.68,144.11,145.23,144.41,145.93,144.56,146.5,147.83,147.32,147.74,148.99,149.24,150.09,148.25,147.33,148.42,147.46,149.29,148.73,149.87,150.95,151.49,152.47,153.45,153.54,153.96,152.74,154.87,154.56,154.53,154.95,155.31,154.62,155.11,155.64,157.21,157.77,159.38,159.65,160.72,160.37,161.58,164.06,158.3,157.01,157.01,152.65,155.73,152.99,153.07,155.02,155.83,155.11,153.81,152.09,150.33,151.91,148.3,148.75,151.12,153.56,152.82,154.08,154.89,153.41,156.17,153.99,156.67,157.92,159.31,161.92,160.9,159.84,159.59,159.61,157.01,157.75,157.4,158.23,158.77,155.82,155.35,149.87,151.66,149.82,151.66,154.36,157.76,160.84,160.79,162.67,162.44,163.69,162.05,164.26,166.17,165.37,163.46,164.11,162.99,163.91,166.56,166.3,166.3,166.69,165.93,167.8,168.1,167.99,169.48,169.15,169.62,168.27,168.06,167.85,167.11,169.27,169.57,170.55,169.95,169.29,168.94,169.06,169.66,169.66,171.14,170.76,170.99,172.09,169.55,170.75,171.73,174.27,175.23,174.08,174.16,174.55,173.9,172.65,172.65,174.05,176.48,176.53,176,176.64,176.37,171.85,173.52,170.17,172.9,175.31,175.48,177.39,178.08,179.4,179.2,179.14,179.43,180.28,180.28,180.18,180.12,179.32,178.99,177.61,177.83,179.85,175.45,174.61,178.77,177.32,175,172.66,176.02,175.08,177.56,178.63,180.49,180.67,181.84,181.56,182.08,179.39,179.28,180.54,179.16,178.19,179.12,182.1,181.94,181.37,182.02,184.17,184.17,186.83,186.65,186.93,187.72,189.17,189.13,189.75,188.98,191.07,191.76,190.74,189.45,191.21,189.45,191.52,191.86,191.82,191.66,192.95,191.56,192.09,190.81,190.94,192.5,193.92,191.9,190.23,186.15,188.42,191.23,190.75,189.12,188.56,190.55,190.41,192.29,191.88,192.24,192.47,192.62,192.62,192.52,192.8,192.1,193.8,193.64,193.68,193.32,194.22,194.6,194.95,194.56,193.51,193.43,190.89,193.56,194.56,194.34,195.47,196.12,196.58,196.63,196.89,197.92,199.41,199.41,199,199.67,197.96,200.2,200.89,200.18,200.41,199.76,198.25,195.11,198.07,199.7,200.1,202.13,202.61,201.66,201.62,202.47,201.37,201,202.65,201.71,202.92,203.26,203.07,203.27,203.53,204.38,204.71,205.24,203.79,201.6,201.86,203.5,205.23,205.54,206,204.8,206.6,207.49,207.21,207.28,207.87,207.8,207.8,207.09,206.82,205.86,204.27,204.74,203.56,205.29,204.97,203.1,199.65,199.49,201.39,203.83,204.13,203.57,199.42,199.73,197.35,199.62,197.03,199.1,199.92,201.58,201.19,199.81,199.33,199.93,203.34,204.86,205.55,207.07,207.83,208.45,208.23,209.22,209.6,208.54,210.59,211,211.38,212.16,213.53,214.42,215.22,215.41,214.66,212.89,213.01,214.55,214.55,215.38,214.82,215.54,215.24,214.55,214.91,215.4,215.4,210.51,213.29,209.24,206.77,209.7,207.93,210.37,214.73,215.39,213.84,215.89,213.91,212.32,215.79,213.9,211.7,209.29,213.01,215.18,216.52,216.52,219.51,219.29,219.6,218.94,218.37,219.76,219.62,215.36,215.15,214.28,213.97,215.93,216.54,213.46,213.63,213.63,209.71,207.67,205.38,201.5,202.05,199.6,199.3,198.22,203.05,206.88,208.3,210.27,205.14,206.2,205.43,207.16,210.17,206.36,202.44,201.67,204.85,205.03,200.69,199.25,199.25,197.23,193.6,196.49,200.89,200.4,197.3,200.97,199.92,198.33,192.48,191.09,196,195.15,192.62,191.2,195.29,199.66,202.13,204.48,204.39,206.7,204.17,207.1,208.15,209.63,212.2,210.87,207.57,208.27,209.96,207.32,205.31,206.18,205.64,202.16,201.47,203.73,201.25,201.25,201.21,204.44,204.31,201.3,195.72,196.83,191.29,191.69,196.44,189.31,190.38,191.3,197.02,189.99,188.92,182.86,183.31,180.29,180.06,184.36,183.63,187.34,179.77,178.72,178.75,182.06,180.58,182.29,185.91,190.51,190.51,189.32,187.9,191.37,188.24,188.83,190.63,188.57,184.08,178.72,171.79,171.15,173.64,168,168.37,168.37,172.49,172.26,173.91,179.22,178.69,175.09,174.96,173.43,175.26,175.26,175.54,176.17,178.8,178.65,176.59,174.96,174.18,173.66,176.99,175.51,180.36,181.43,183.22,181.51,181.75,179.65,184.35,186.58,189.23,188.7,187.44,190.37,190.23,189.92,189.68,188.88,192.9,192.76,196.1,196.88,197.25,195.82,196.26,193.73,189.59,189.16,189.71,192.39,185.91,184.67,182.63,181.2,181.75,179.79,179.79,179.06,182.34,183.55,186.35,188.32,180.18,180.79,178.74,177.46,178.68,176.66,173.64,172.18,169.21,167.46,167.1,170.39,166.79,164.28,168.53,173.69,173.34,171.56,166.75,165.51,164.43,163.89,168.14,164.16,168.51,170.43,169.3,167.95,171.94,173.98,176.81,175.5,174.44,178.73,177.4,176.67,172.25,170.43,172.75,174.41,175.39,171.74,181.27,182.94,181.31,182.89,181.38,180.82,181.68,180.97,183.43,184.51,184.51,184.46,181.61,181.32,186.93,186.77,186.55,183.21,180.57,180.24,181.59,180.26,182.83,184.16,183.05,178.49,176.5,174.91,175.09,177.69,175.13,176.15,176.15,175.44,173.33,176.36,175.91,175.91,175.21,176.53,174.47,178.46,178.32,179.56,181.87,182.49,183.22,183.22,182.85,180,178.63,182.01,184.17,184.04,184.01,186.03,186.5,184.08,186.77,188.73,191.5,189.52,188.35,190.78,188.66,187,187.41,189.55,189.5,190.03,187.41,186.89,186.89,183.14,182.85,183.83,181.89,182.45,181.9,181.04,182.41,185.36,185.48,182.64,182.9,179.52,176.92,176.66,179.57,178.31,181.44,179.45,181.05,183.4,180.38,180.91,181.94,182.23,181.95,184.54,185.59,188.27,188.97,187.87,187.41,188.08,188.08,188.26,188.26,187.48,189.96,189.57,190.2,190.36,190.34,189.21,189.38,189.54,186.55,185.83,189.47,191.03,190.96,188.74,187.42,186.07,189.51,189.59,188.72,189.57,189.25,188.95,189.51,188.3,190.54,192.34,192.06,192.09,189.93,188.54,190.2,192.68,192.68,192.68,191.5,193.39,196.2,195.81,196.27,195.52,196.73,196.96,198.79,200.17,200.33,202.77,202.03,202.03,201.07,200.02,200.76,199.22,198.33,200.6,200.53,201.43,203.9,204.14,204.14,203.74,202.12,201.54,202.03,203.39,204.9,206.63,206.42,207.22,208.69,209.18,207.77,207.84,208.68,209.26,209.23,207.89,209.94,210.25,209.69,206.79,206.26,205.17,207.02,206.14,204.69,204.74,204.53,205.7,203.33,201.79,200.23,200.2,201.58,201.02,203.24,200.51,201.85,203.12,206.06,206.85,206.52,206.89,206.89,206.03,204.59,203.93,204.22,205.6,204.43,204.68,206.41,203.9,204.04,203.6,201.69,198.38,197.93,198.72,195.8,195.84,197,196.46,196.48,193.78,195.35,195.09,197.4,198.64,199.68,200.53,199.28,198.28,200.38,200.36,197.68,196,193.53,193.21,194.61,191.82,189.55,188.64,190.91,192.14,194.16,197.82,199.68,200.03,200.6,200.8,199.18,202.29,202.12,205.98,206.3,206.55,206.81,208.34,207.92,208.77,208.77,208.89,208.48,208.69,208.49,209.28,210.51,209.37,209.25,208.43,210.09,210.95,211.78,212.76,215.66,216.23,216.21,217.19,218.47,215.26,217.48,217.84,217.84,218.76,219.07,219.15,218.53,217.3,215.56,214.82,215.21,218.25,217.92,219.16,219.01,219.18,219.18,218.36,217.13,219.04,221.74,222.23,222.88,223.06,224.23,224.09,225.78,225.64,222.01,224.78,227.18,226.46,226.98,228.85,228.98,230.3,230.08,226.93,229.11,230.44,229.34,229.34,227.96,228.25,233.07,233.15,232.27,232.66,232.28,233.49,235.36,235.08,232.68,233.88,236.29,234.75,234.48,237.11,236.65,235.97,234.44,235.93,237.26,239.37,240.15,239.81,239.08,238.41,240.47,240.73,240.73,240.25,238.51,238.77,235.82,238.44,238.35,238.7,236.44,238.2,234.73,231.91,231.44,230.1,229.59,227.58,229.57,232.31,232.36,231.3,233.66,234.4,230.72,229.92,232.02,234.94,237.36,237.68,237.68,238.89,239.28,239.22,240.38,243.2,242.69,242.98,243.2,243.81,243.15,241.35,243.04,243.04,243.1,241.31,239.87,241.79,242.06,242.43,245.3,245.25,244.98,245.61,246.28,248.37,248.95,248.85,250.76,251.39,251.39,250.76,250.37,249.6,250.58,250.98,251.2,250.18,250.85,252.4,253.68,253.68,255.07,255.33,255.52,258.12,255.86,257.27,258,259.65,256.03,254.03,252.22,254.94,254.54,248.65,247.37,250.11,250.32,249.08,253.01,249.55,244.96,237.62,240.08,238.22,243.71,244.85,244.86,248.98,249.94,253.97,254.47,256.95,256.44,257.53,255.22,258.16,257.34,257.75,256.21,256.2,258.79,258.79,253.31,252.91,252.14,247.79,250.66,251.78,254.47,256.38,257.76,258.09,258.15,257.41,261.78,261.27,262,262.66,262.17,263.23,262.9,264.01,261.55,261.59,261.15,263.49,260.97,263.49,265.37,264.82,266.42,268.48,266.43,267.68,267.63,268.7,268.21,268.08,265.62,266.18,266.11,266.81,267.24,266.36,261.4,262.47,261.73,264.94,271.65,273.66,274.69,274.96,274.16,274.23,272.57,268.97,270.02,271.09,271.1,272.55,273.49,274.32,275.89,274.84,274.84,276.38,277.06,277.18,278.86,278.34,279.03,277.32,276.5,278.75,277.24,277.24,278.29,277.22,269.04,268.81,271.73,273.71,276.73,276.73,276.62,273.56,270.63,269.47,268.87,272.26,273.77,270.73,271.15,271.15,266.97,267.39,267.7,272.6,272.03,274.74,274.74,277.15,278.85,280.34,279.53,275.46,278,276.7,278.16,276.75,274.65,276.63,277.71,278.73,276.09,277.94,278.03,277.28,280.17,280.15,280.15,280.83,281.5,280.28,275.5,274.13,272.85,272.88,268.55,272.81,268.01,264.73,267.69,262.92,264.37,257.24,255.29,256.54,252.97,258.35,260.01,257.24,260.02,259.45,259.67,264.25,264.66,261.71,260.85,255.7,257.11,258.09,259.82,247.25,232.47,231.93,228.29,250.01,241.36,245.73,247.68,247.25,241.71,242.03,242.03,236.33,242.26,246.3,251.29,253.14,253.31,254.78,255.15,256.76,260.54,258.88,256.89,258,259.5,259.31,267.76,269.7,269.97,271.09,272.99,273.23,272.17,267.78,267.66,265.86,265.86,271.3,269.79,270.87,270.85,271.96,273.54,273.56,272.12,274.91,275.17,276.67,275.92,276.97,273.84,276.41,274.1,274.02,274.02,273.42,276.05,279.12,279.12,281.36,282.83,284.29,283.97,285.32,287.7,287.7,285.43,285.23,286.96,287.75,286.8,287.2,286.06,286.98,288.52,288.49,288.9,289.08,291.34,291.54,292.7,292.75,291.89,291.52,290.45,285.8,290.01,288.6,290.71,290.47,292.74,292.01,295.32,296.27,296.36,295.5,295.47,293.74,293.03,291.86,296.29,295.02,296.24,296.95,297.89,295.98,295.98,293.93,295.43,297.9,296.96,297.58,298.38,299.27,301.81,301.67,303.09,302.7,302.4,303.85,305.33,306.68,304.99,304.13,302.6,304.39,305.19,306.44,307.48,307.67,307.69,308.81,307.64,309.43,308.58,300.21,304.89,304.42,305.64,303.72,305.32,308.58,308.59,306.94,308.73,311.17,314.99,315.71,315.7,312.57,313.39,313.93,310.25,311.38,307.9,308.29,313.04,313.68,313.88,308.69,308.53,305.7,303.18,304.32,299.58,302.52,307.2,309.99,312.13,312.13,313.8,312.13,312.89,313.83,314.17,314.77,313.68,313.41,315.52,316.18,312.81,312.31,311.56,307.95,310.39,313.13,315.15,316.58,317.6,317.6,317.5,316.39,315.96,313.63,314.23,316.22,318.18,317.09,317.11,319.17,319.67,319.05,317.35,318.17,317.96,317.96,311.41,315.01,316.74,316.85,318.43,319.73,319.71,319.29,317.92,319.63,316.95,315.34,311.48,317.61,319.1,318.05,318.03,313.05,313.21,313.21,313.53,315.27,314.38,316.57,313.28,315.68,318.24,316.54,315.16,315.29,312.31,314.73,312.96,308.8,311.37,310.7,310.44,305.71,303.86,306.94,307.7,303.52,302.68,298.1,301.52,300.39,302.02,296.76,291.8,290.64,299.11,301.26,301.59,301.59,302.93,303.16,310.76,312.68,312.32,315.5,319.22,321.76,322.6,326.49,325.71,323.65,327.03,325.68,328.28,328.68,327.07,326.94,330.29,331.26,329.91,332.59,337.44,336.16,338.99,339.63,339.08,341.07,343.68,339.43,339.18,336.91,340.55,341.13,342.41,342.41,344.5,344.55,346.54,347.29,348.2,348.65,346.08,347.48,338.29,339.3,338.43,332.94,338.78,340.48,346.11,344.14,339.96,343.65,343.65,342.37,337.46,337.12,337.09,336.93,340.89,343.59,342.85,342.85,342.85,345.34,343.8,342.83,345.62,347.07,344.32,345.62,346.94,345.17,341.68,341.02,344.04,343.57,339.42,339.59,339.64,340.36,335.2,340.76,343.15,348.23,354.46,353.86,353.24,355.42,355.22,354.08,355.01,357.32,356.71,354.85,352.41,353.15],"SK하이닉스":[100,101.69,100.56,100.99,100.85,102.4,102.4,102.54,102.97,101.98,103.53,105.93,107.34,107.06,109.32,110.03,104.52,106.78,106.78,106.78,106.78,110.73,110.88,110.59,111.3,111.16,111.58,116.24,116.38,113.56,113.56,113.56,118.08,120.34,120.2,119.21,116.67,116.67,116.53,115.68,117.37,119.49,117.66,113.14,113.14,115.68,113.42,115.96,121.19,121.47,119.92,115.82,118.64,115.82,116.24,116.38,117.23,117.23,112.01,115.82,112.57,112.15,112.15,115.4,118.36,118.64,115.11,120.62,121.61,120.48,120.34,120.34,119.77,121.19,124.86,125.42,125.42,127.68,127.82,130.65,128.53,127.97,126.98,129.52,128.81,131.07,127.54,127.54,127.12,128.53,130.79,128.95,128.95,128.11,126.27,126.27,129.38,133.47,131.36,132.63,135.59,139.97,140.54,145.76,142.94,142.09,139.27,139.27,137.99,140.11,138.84,143.5,145.76,146.05,150.56,150.56,150.56,151.69,152.54,149.15,151.69,151.69,150.56,154.24,148.87,141.24,143.22,136.86,135.31,140.11,142.37,140.96,143.79,142.94,141.81,134.18,129.94,131.92,131.92,134.75,133.05,139.41,137.85,135.59,135.59,138.98,144.07,142.09,137.85,138.84,132.06,134.46,134.32,137.43,136.86,139.83,143.22,143.5,144.92,143.79,142.66,146.33,144.07,142.09,139.55,140.68,138.42,137.99,138.42,140.54,140.68,138.98,141.81,140.82,145.2,146.89,148.02,148.02,151.69,151.41,152.54,152.54,156.5,156.5,157.91,157.91,160.73,160.73,157.06,159.32,156.21,157.06,156.21,154.52,157.34,153.11,158.19,155.65,157.63,157.63,161.3,163.56,162.15,161.02,159.32,161.3,158.47,158.47,159.6,160.17,164.69,162.43,166.1,167.51,171.19,170.9,177.4,180.79,183.05,183.62,183.62,190.68,195.48,189.83,193.5,190.4,187.29,185.88,192.09,192.37,188.14,190.11,194.92,194.63,199.44,200.85,201.13,200,200.56,201.41,201.13,206.21,198.87,188.7,193.22,182.49,186.44,185.03,192.09,185.03,180.79,181.07,187.29,181.36,181.92,173.45,183.9,183.9,186.72,187.57,189.27,189.83,192.66,192.09,192.37,193.22,191.81,190.96,193.5,193.79,194.07,192.37,197.46,202.54,201.69,205.08,208.47,211.02,213.84,216.95,218.08,225.14,223.73,227.97,234.75,234.75,243.79,243.79,232.77,235.03,234.18,234.18,234.18,234.18,234.18,234.18,234.18,250.56,251.69,250,243.22,237.85,235.88,228.53,223.16,229.38,239.27,231.07,230.79,222.32,221.47,225.42,232.2,240.96,235.59,238.42,235.88,232.77,235.03,232.77,231.64,232.49,235.59,231.64,233.05,234.46,231.92,240.11,245.2,239.27,240.4,234.75,233.33,232.77,216.95,218.64,223.45,220.06,218.93,214.69,222.32,222.32,219.77,216.95,214.69,213.84,218.08,226.55,226.55,217.51,216.67,216.67,209.04,212.15,216.1,216.1,216.38,219.49,217.8,224.01,220.9,217.23,205.93,205.08,210.17,205.37,210.17,209.32,212.43,207.06,200.85,201.41,204.52,214.12,213.28,212.71,206.5,207.63,210.17,203.95,198.31,198.31,200.85,208.76,207.34,210.45,219.49,219.21,219.21,219.21,216.1,213.28,217.23,214.41,218.36,218.93,222.32,216.95,216.95,218.64,221.19,232.77,233.62,235.88,235.31,239.83,254.24,256.21,253.11,253.67,253.95,253.11,249.72,250.28,234.75,237.29,229.94,226.84,226.84,229.66,229.66,231.07,227.12,234.18,226.84,227.68,227.12,229.38,237.29,237.85,237.29,233.9,238.98,248.31,238.42,238.42,231.92,232.77,244.35,246.05,238.7,238.7,234.75,234.18,234.46,234.46,235.88,235.59,242.37,243.22,241.24,238.98,245.76,244.92,248.31,251.69,251.69,269.21,267.23,268.93,266.95,267.8,268.36,263.84,258.19,253.67,257.06,257.06,256.78,249.72,251.98,249.72,249.72,243.79,245.76,237.29,237.57,248.02,250,252.82,239.55,238.14,240.68,235.88,242.09,236.44,243.22,240.11,243.5,240.96,247.46,246.61,245.2,241.81,250.85,252.26,250.28,252.26,255.08,248.31,230.79,236.16,227.4,234.75,243.22,242.66,243.79,241.81,235.03,235.31,224.29,227.97,225.42,220.34,212.15,212.99,214.41,214.41,211.02,210.45,211.02,221.47,225.42,229.1,231.07,235.88,232.77,233.9,233.62,234.46,227.68,229.38,225.99,222.6,214.41,216.1,216.38,212.15,210.45,219.49,218.08,220.34,222.6,223.45,216.67,216.67,216.67,216.67,211.86,206.5,208.19,202.54,202.54,197.74,198.59,201.13,201.13,198.59,194.92,204.52,198.59,196.89,198.87,194.07,200,197.74,195.2,188.42,182.77,189.27,188.7,192.66,192.66,192.94,205.08,199.15,198.02,200,205.93,205.93,210.45,203.11,198.87,202.82,198.02,197.18,190.68,192.37,195.76,195.76,200.28,200,203.11,201.98,196.61,199.15,194.92,192.66,186.44,188.7,185.03,183.33,187.01,185.03,174.58,175.71,172.6,170.34,165.54,169.49,170.62,170.62,169.77,174.01,170.9,170.9,171.19,162.99,164.69,165.82,167.23,179.66,184.46,183.9,175.42,180.79,183.05,183.33,182.49,189.27,188.14,188.7,199.15,210.73,202.82,207.34,214.41,208.76,214.41,214.41,214.41,214.41,216.67,207.63,209.32,214.41,215.25,218.64,208.47,211.02,208.19,213.84,216.67,216.67,212.99,212.43,208.19,197.74,197.74,198.02,196.89,192.37,192.37,188.42,188.14,191.24,188.7,190.11,192.37,191.53,192.09,199.15,214.41,214.97,205.93,205.37,207.34,204.24,209.6,216.38,215.82,225.71,221.47,223.16,220.06,219.77,222.03,221.47,220.62,225.14,227.12,226.55,223.73,231.07,227.4,228.81,221.75,226.55,222.03,225.99,223.16,223.16,227.97,227.12,227.12,225.71,226.84,214.69,210.17,207.63,210.73,210.45,203.11,202.26,200.28,198.59,194.63,192.09,190.96,188.98,186.16,186.72,186.16,184.46,188.14,183.9,183.9,183.9,184.75,188.7,189.83,185.59,179.38,178.25,179.94,179.1,189.83,190.11,186.16,188.98,188.42,194.63,198.31,196.33,197.74,201.69,195.2,198.31,193.22,190.4,197.18,205.93,213.28,211.02,215.25,214.97,210.73,211.02,216.95,221.47,222.6,219.21,223.73,225.42,217.51,222.88,217.23,219.49,214.97,212.99,203.39,207.06,204.24,207.06,210.45,210.45,217.23,217.23,215.82,212.15,215.82,214.12,208.47,210.17,202.82,206.21,207.06,207.06,218.64,219.21,217.51,225.99,234.46,231.36,238.14,234.75,233.33,233.33,233.33,224.58,224.29,226.55,233.62,232.2,233.9,235.59,231.36,235.31,229.94,232.2,231.64,224.58,224.58,226.84,226.84,228.53,228.53,223.16,225.99,227.4,229.38,232.77,228.81,218.64,218.93,223.45,219.49,225.99,234.18,234.18,234.46,230.23,231.64,234.75,239.27,240.4,235.88,236.16,232.49,229.66,235.03,235.59,235.59,240.68,241.53,240.96,233.62,228.53,230.79,230.79,232.49,233.62,233.9,228.53,227.4,222.32,219.49,222.6,227.68,227.97,227.97,227.68,235.59,248.31,250.28,262.15,262.71,264.41,268.36,267.23,264.97,264.97,267.8,271.19,265.82,265.82,267.51,266.95,266.38,265.54,275.14,279.66,279.38,283.9,283.9,277.4,280.23,279.66,282.2,280.51,285.31,278.81,278.81,278.81,272.03,276.55,265.54,264.12,267.51,274.29,275.99,283.9,280.51,279.1,281.92,282.49,288.14,295.2,296.61,288.14,292.37,293.79,290.96,281.07,276.84,267.23,262.15,248.31,260.17,262.15,266.38,268.08,261.58,261.58,251.69,241.53,233.9,233.05,227.68,227.12,206.5,194.92,211.3,196.05,222.32,238.7,227.97,235.31,236.44,235.31,221.47,225.99,224.86,234.75,242.37,238.7,240.11,237.57,229.94,232.49,232.49,229.66,237.57,231.64,229.66,237.01,233.33,229.94,233.33,235.59,236.44,236.44,236.44,228.81,228.81,232.77,232.77,240.11,238.7,242.09,236.16,227.68,231.36,229.1,233.62,237.57,235.59,229.66,229.94,231.36,229.94,237.01,230.23,236.16,235.31,250.56,247.74,255.37,257.06,253.67,256.5,250,240.68,231.64,241.24,245.2,243.5,241.24,239.83,237.57,242.94,238.14,238.98,236.16,240.4,240.96,238.42,241.24,242.94,239.55,236.44,234.46,233.9,234.46,234.18,234.46,233.62,234.18,232.2,237.57,235.03,232.77,236.44,233.9,234.75,235.03,240.96,233.9,231.07,230.51,227.97,229.1,227.68,229.94,229.66,228.81,227.97,226.55,226.55,220.62,211.86,202.82,210.45,213.28,217.51,222.6,223.45,219.77,212.15,212.43,213.28,222.32,222.32,221.47,224.29,218.36,216.38,221.47,225.99,231.36,230.23,232.2,236.44,238.7,229.66,236.16,238.14,234.18,233.05,237.29,237.29,237.29,237.29,235.03,234.46,235.59,234.18,234.18,241.53,249.15,244.35,246.05,240.96,244.92,240.68,236.72,235.31,237.01,235.03,233.33,234.18,230.79,225.71,224.86,229.94,235.03,243.22,243.79,242.94,244.35,245.76,248.87,253.39,276.84,277.12,276.84,277.4,273.45,282.49,278.53,274.58,280.79,279.1,275.42,283.9,307.91,314.97,324.86,333.33,324.86,340.4,329.1,326.27,330.51,331.92,331.92,337.57,334.75,327.68,317.8,327.68,333.33,333.33,326.27,327.68,334.75,334.75,355.93,368.64,370.06,379.94,389.83,375.71,364.41,375.71,368.64,360.17,367.23,368.64,368.64,371.47,362.99,381.36,364.41,362.99,347.46,346.05,353.11,367.23,367.23,353.11,360.17,353.11,354.52,355.93,355.93,355.93,372.88,374.29,367.23,355.93,375.71,385.59,391.24,384.18,419.49,399.72,399.72,408.19,415.25,401.13,395.48,382.77,385.59,375.71,387.01,395.48,385.59,396.89,395.48,401.13,389.83,389.83,381.36,377.12,375.71,381.36,372.88,379.94,374.29,396.89,398.31,403.95,403.95,405.37,406.78,395.48,388.42,394.07,387.01,388.42,388.42,389.83,391.24,374.29,375.71,374.29,371.47,381.36,367.23,367.23,361.58,371.47,372.88,372.88,364.41,365.82,367.23,347.46,337.57,331.92,334.75,331.92,341.81,341.81,346.05,346.05,337.57,347.46,347.46,354.52,353.11,358.76,362.99,355.93,364.41,362.99,362.99,360.17,346.05,347.46,361.58,358.76,362.99,365.82,357.34,351.69,344.63,344.63,350.28,355.93,362.99,355.93,353.11,360.17,351.69,346.05,347.46,353.11,348.87,343.22,337.57,338.98,347.46,348.87,348.87,343.22,336.16,334.75,330.51,337.57,334.75,330.51,327.68,322.03,322.03,317.8,327.68,338.98,341.81,338.98,333.33,327.68,317.8,298.02,283.9,286.72,286.72,286.72,293.79,289.55,289.55,290.96,296.61,292.37,293.79,292.37,292.37,300.85,305.08,300.85,302.26,299.44,295.2,299.44,290.96,296.61,300.85,303.67,303.67,293.79,302.26,302.26,302.26,302.26,298.02,293.79,295.2,292.37,282.49,290.96,282.49,282.49,276.55,272.6,270.34,265.54,265.54,258.47,259.89,264.97,277.97,274.29,275.99,276.55,272.03,278.25,282.49,288.14,286.72,300.85,290.96,300.85,303.67,298.02,299.44,302.26,303.67,307.91,306.5,303.67,300.85,313.56,316.38,312.15,310.73,314.97,337.57,336.16,337.57,331.92,326.27,327.68,322.03,329.1,338.98,333.33,334.75,343.22,338.98,348.87,340.4,343.22,341.81,348.87,350.28,344.63,340.4,351.69,358.76,360.17,361.58,355.93,360.17,358.76,370.06,370.06,370.06,362.99,354.52,353.11,358.76,351.69,361.58,362.99,365.82,362.99,358.76,357.34,358.76,353.11,336.16,336.16,333.33,333.33,320.62,340.4,340.4,340.4,340.4,350.28,351.69,347.46,347.46,347.46,365.82,372.88,374.29,358.76,368.64,375.71,371.47,371.47,371.47,371.47,346.05,347.46,347.46,347.46,353.11,364.41,364.41,337.57,333.33,333.33,333.33,333.33,327.68,327.68,327.68,327.68,350.28,350.28,348.87,348.87,340.4,333.33,333.33,338.98,341.81,333.33,327.68,330.51,329.1,319.21,320.62,316.38,314.97,313.56,319.21,310.73,305.08,307.91,317.8,317.8,319.21,312.15,305.08,313.56,306.5,309.32,317.8,312.15,310.73,309.32,309.32,303.67,303.67,310.73,312.15,307.91,317.8,312.15,317.8,320.62,313.56,317.8,319.21,306.5,305.08,290.96,299.44,302.26,305.08,305.08,302.26,302.26,302.26,293.79,299.44,298.02,292.37,279.66,279.94,276.55,275.14,272.32,266.95,268.93,260.45,254.8,258.76,268.36,269.21,265.54,257.06,247.18,251.69,261.3,260.17,265.25,267.8,264.69,263.56,265.54,265.54,278.81,285.31,282.49,288.14,289.55,282.49,282.49,283.9,282.49,280.79,276.55,274.29,272.6,275.42,275.42,278.25,272.03,268.64,259.32,263.56,263.56,263.56,273.16,274.29,270.34,272.32,268.93,264.41,263.28,265.82,268.64,261.3,263.28,268.93,261.02,259.04,257.34,259.32,255.37,255.37,255.37,255.37,267.8,262.71,259.89,257.63,254.24,248.59,248.59,242.94,235.88,233.05,231.64,229.38,228.25,234.75,234.75,243.5,253.67,253.95,257.63,257.63,254.8,265.54,268.08,269.77,268.93,270.62,262.43,254.8,255.65,259.32,264.12,265.25,254.24,235.59,233.62,237.01,238.7,233.62,238.7,244.35,247.74,251.98,251.69,264.12,256.78,258.76,258.47,247.74,249.72,243.79,240.68,240.68,245.48,240.4,234.75,236.44,240.11,239.27,231.36,228.81,228.81,222.88,222.6,230.23,229.1,232.49,231.07,226.55,221.47,223.16,221.19,220.34,223.73,219.77,217.51,217.51,214.69,211.86,211.86,213.84,213.56,228.81,229.94,234.75,242.94,244.35,246.61,245.2,242.09,242.37,242.94,240.4,241.53,247.46,247.46,247.46,258.19,258.19,258.47,256.21,250,258.19,258.19,260.45,251.69,256.5,268.08,268.08,264.12,255.93,263.84,259.04,262.43,259.89,261.3,257.63,251.69,261.86,257.06,254.24,252.54,252.54,248.87,246.61,253.39,251.13,245.2,241.81,235.31,238.14,229.1,223.45,223.16,237.29,236.44,236.16,245.48,250,246.61,241.53,249.72,245.48,250.85,250.28,246.33,238.7,238.98,236.72,251.69,256.21,259.32,255.08,250.56,252.26,250,247.46,249.15,247.74,251.69,246.33,241.53,246.89,250.85,252.82,252.82,254.8,253.67,250.56,250.56,250.56,246.61,245.48,243.79,246.33,244.07,255.37,259.6,264.41,274.86,277.4,276.55,275.99,292.37,308.47,308.47,311.58,306.78,311.58,311.58,307.06,307.06,305.08,309.89,325.99,324.29,337.57,335.59,336.16,335.88,324.29,327.97,325.14,322.03,320.9,320.62,319.21,322.88,328.25,325.42,332.2,333.05,329.66,321.47,315.82,311.58,320.34,325.99,322.32,333.33,331.07,332.77,331.92,330.23,325.14,322.03,320.34,319.21,350.28,361.58,348.59,353.39,337.57,338.98,339.27,344.35,335.03,334.75,334.75,325.71,324.58,324.58,327.12,324.29,331.07,328.81,329.1,327.68,341.53,329.1,327.4,335.03,337.29,344.07,338.98,336.72,337.29,333.9,334.75,321.19,327.4,329.66,334.75,345.2,345.76,336.16,336.72,333.33,329.1,331.36,330.51,324.86,324.01,324.01,324.01,324.01,324.01,325.99,339.55,340.11,340.11,337.57,336.72,350.85,352.26,350.56,367.23,367.23,355.08,356.5,350.28,358.19,360.17,338.98,336.44,336.44,328.53,339.83,353.95,355.37,375.71,368.36,360.45,361.58,368.64,372.32,367.23,378.81,373.73,366.95,371.19,372.88,370.9,367.51,361.58,369.21,371.19,368.36,378.25,374.58,370.34,355.65,354.8,354.8,360.17,364.12,370.06,370.62,386.16,395.48,395.48,390.4,396.89,396.89,397.18,397.18,398.02,396.61,399.72,399.72,402.26,386.44,385.31,388.42,384.18,388.14,377.12,384.18,378.81,378.81,373.16,370.06,384.75,399.15,402.82,397.74,399.72,388.14,384.18,381.36,386.72,380.51,374.86,381.07,373.73,389.83,389.83,403.39,403.39,403.39,423.73,420.06,420.62,414.69,427.4,422.6,420.9,442.09,455.93,457.06,434.46,446.33,441.24,441.24,470.34,468.36,460.17,465.82,485.59,470.62,468.08,462.15,457.34,455.37,464.12,452.54,442.09,480.23,479.66,478.53,498.87,511.86,503.39,516.95,524.01,526.27,506.21,531.07,516.38,511.86,516.67,516.67,532.2,529.38,531.64,505.93,504.8,514.97,489.55,484.75,483.05,507.91,481.92,502.26,496.89,492.09,492.09,490.4,489.27,489.27,507.34,502.82,495.48,508.19,519.21,523.45,523.45,545.2,536.44,537.01,542.37,558.47,564.97,561.02,569.21,572.03,572.03,552.82,534.46,548.59,546.05,547.18,547.18,586.16,587.57,600.28,607.34,627.12,624.29,629.94,662.43,659.6,670.9,661.02,629.94,635.59,669.49,668.08,668.08,665.25,655.37,666.67,649.72,666.67,659.6,673.73,675.14,680.79,658.19,649.72,658.19,622.88,600.28,591.81,579.1,579.1,588.98,536.72,541.81,552.54,533.62,549.72,546.05,489.27,440.96,462.43,478.25,461.58,484.46,500,513.84,527.4,527.4,564.12,547.74,564.12,544.07,539.83,524.01,507.34,494.35,506.5,479.38,490.68,491.53,475.42,437.29,450.28,441.81,443.5,439.27,444.07,476.84,459.89,459.89,459.89,459.89,431.64,443.79,457.63,461.86,466.95,511.02,519.21,493.22,493.22,477.68,477.68,491.81,522.32,502.82,502.82,527.4,525.42,525.42,544.92,533.05,553.67,529.1,539.27,530.51,553.67,559.89,567.8,553.67,537.57,550.85,526.27,514.69,548.02,545.76,553.11,553.11,566.38,544.07,524.86,516.67,488.7,503.39,485.03,481.92,481.92,476.84,499.15,500,500.28,475.42,455.08,451.69,448.59,465.82,474.58,488.7,472.03,477.12,481.36,485.31,497.46,495.76,506.5,519.77,518.36,494.35,475.99,479.1,475.99,475.99,480.51,492.94,491.24,491.24,483.62,513.84,564.41,550.85,550,579.1,574.86,548.87,550.85,559.89,593.22,605.93,598.87,615.82,637.01,620.06,624.29,624.29,624.29,624.29,624.29,562.71,539.27,539.83,561.58,574.86,573.45,559.6,564.12,561.86,588.98,593.22,598.87,593.22,617.23,598.87,591.81,579.1,566.38,573.45,562.71,537.29,537.29,525.71,545.48,543.5,543.5,530.79,530.51,561.86,564.12,577.68,581.92,573.45,580.51,593.22,608.76,597.46,587.57,604.52,584.75,562.99,538.7,556.5,559.04,549.72,514.69,465.54,478.81,466.1,517.51,510.73,509.04,510.17,491.53,494.35,494.35,498.87,490.96,511.3,503.67,520.9,514.12,510.73,501.41,501.41,525.42,525.42,525.42,538.98,537.57,537.01,550.85,560.73,581.92,566.38,577.68,563.28,570.62,566.38,556.21,564.97,573.45,572.03,587.57,598.87,577.68,586.16,586.16,614.41,634.18,634.18,646.89,651.13,677.97,665.25,665.25,700.56,703.39,696.33,694.92,725.99,733.05,786.72,807.91,827.68,802.26,824.86,806.5,788.14,786.72,764.12,765.54,796.61,793.79,838.98,831.92,847.46,843.22,836.16,761.3,759.89,769.77,758.47,759.89,761.3,751.41,740.11,741.53,744.35,772.6,728.81,728.81,744.35,730.23,740.11,724.58,754.24,759.89,785.31,781.07,781.07,755.65,742.94,721.75,692.09,709.04,733.05,738.7,734.46,758.47,759.89,723.16,735.88,741.53,750,772.6,782.49,813.56,858.76,867.23,927.97,935.03,983.05,942.09,1004.24,1004.24,991.53,1019.77,1009.89,1007.06,950.56,985.88,981.64,1016.95,1117.23,1117.23,1117.23,1117.23,1117.23,1117.23,1209.04,1172.32,1162.43,1193.5,1278.25,1314.97,1371.47,1353.11,1360.17,1351.69,1440.68,1511.3,1471.75,1576.27,1604.52,1579.1,1751.41,1655.37,1635.59,1675.14,1638.42,1711.86,1748.59,1742.94,1728.81,1581.92,1711.86,1610.17,1587.57,1612.99,1471.75,1468.93,1466.1,1480.23,1536.72,1497.18,1519.77,1576.27,1559.32,1531.07,1536.72,1629.94,1598.87,1658.19,1596.05,1612.99,1564.97,1497.18,1556.5,1559.32,1545.2,1638.42,1649.72,1661.02,1661.02,1692.09,1807.91,1838.98,1838.98,1912.43,1966.1,2050.85,2096.05,2135.59,2101.69,2115.82,2084.75,2096.05,2115.82,2135.59,2158.19,2098.87,2090.4,2132.77,2166.67,2079.1,2259.89,2375.71,2432.2,2567.8,2344.63,2562.15,2542.37,2378.53,2370.06,2505.65,2474.58,2429.38,2508.47,2485.88,2485.88,2485.88,2485.88,2525.42,2680.79,2686.44,2838.98,2875.71,3104.52,2997.18,2997.18,2652.54,2398.31,2658.19,2610.17,2361.58,2649.72,2697.74,2627.12,2570.62,2751.41,2740.11,2983.05,2861.58,2844.63,2635.59,2785.31,2810.73,2635.59,2635.59,2466.1,2279.66,2533.9,2344.63,2474.58,2502.82,2587.57,2918.08,2819.21,2901.13,2937.85,3115.82,3209.04,3262.71,3186.44,3293.79,3457.63,3454.8,3460.45,3451.98,3649.72,3672.32,3652.54,3632.77,3632.77,4087.57,4087.57,4522.6,4672.32,4762.71,5310.73,5183.62,5581.92,5564.97,5138.42,5197.74,4929.38,4929.38,5480.23,5483.05,5483.05,5796.61,6336.16,6466.1,6590.4,6675.14,6666.67,6666.67,6491.53,5847.46,5398.31,6257.06,5785.31,5935.03,6073.45,6463.28,6728.81,7121.47,7584.75,7807.91,8245.76,7217.51,7403.95,8240.11,7550.85,7423.73,7485.88,7231.64,6177.97,6850.28,6618.64,6217.51,5864.41,6175.14,6158.19,5211.86,5403.95,5881.36,5203.39,5203.39,4983.05,5186.44,5169.49,5420.9,4968.93,5129.94,4378.53,3957.63,3734.46,4853.11,4426.55,4454.8,4711.86,4223.16,4016.95,4011.3,4025.42,4248.59,4500,4646.89,4646.89,4694.92,4237.29],"마이크론 테크놀로지":[null,100,99.94,95.8,100.06,101.98,104.45,103.4,101.85,102.78,103.15,103.15,105.06,105.99,107.78,103.83,105.93,103.46,104.57,107.78,107.97,104.69,104.51,109.08,108.65,107.97,107.23,111.18,107.72,108.34,109.82,109.51,109.94,109.33,109.51,108.77,108.09,104.14,103.64,104.08,105.81,104.94,107.54,106.36,106.24,104.63,105.37,108.34,108.96,108.28,106.24,105.99,104.88,103.03,102.66,103.03,107.35,107.54,106.24,104.94,109.14,109.39,111.8,112.66,118.47,118.65,120.38,121.93,122.98,122.98,124.34,123.47,119.95,120.63,114.14,116.06,114.95,117.73,126.25,127.61,126.62,123.66,124.34,123.66,125.32,125.2,125.69,127.55,127.12,143.24,143.67,143.67,143.92,140.7,137.55,135.39,135.39,139.28,138.11,136.57,136.13,137.99,138.85,140.77,137.8,137,137,134.28,137.86,134.1,135.64,135.21,141.14,145.52,145.27,148.05,149.35,148.92,152.87,153.12,151.95,150.34,151.95,149.54,151.02,148.55,147.62,142.8,142.19,141.94,144.22,144.22,146.82,146.7,145.03,143.55,146.76,144.78,151.64,152.56,157.94,158.8,158.37,156.76,155.34,155.53,158.74,158,161.33,160.84,159.36,161.89,157.63,160.96,163.5,175.6,177.64,177.21,176.03,178.94,178.51,176.9,176.59,174.55,176.78,176.16,170.72,167.88,164.85,165.16,165.16,167.57,167.63,168.38,172.7,168.75,164.11,166.71,165.47,170.66,170.91,174.74,171.53,172.95,171.65,174.18,173.32,177.95,181.1,179.31,178.69,178.07,179.25,166.77,169.73,171.83,173.32,174.74,179.06,181.78,183.82,183.82,189.62,190.06,189.99,192.77,192.77,195,200.74,200.43,189.01,192.71,194.81,191.85,188.76,184.43,192.71,190.43,197.71,196.97,195.99,200.74,195.55,199.14,194.38,184.43,179.99,179.99,188.45,185.92,186.53,188.39,193.76,194.26,192.28,196.36,195.92,197.04,196.54,197.65,197.71,195.61,184.68,184.13,186.78,180.85,173.69,175.05,176.84,171.9,172.45,176.59,178.13,176.53,169.8,173.01,180.61,183.32,189.56,182.95,187.65,182.58,188.08,188.08,186.66,187.09,191.97,194.44,195.24,197.47,201.36,201.36,198.09,199.2,202.53,200.43,206.55,211.8,213.65,213.59,214.02,218.84,222.05,222.17,221.8,222.79,215.38,211.12,229.09,234.47,242.93,247.13,249.35,244.35,243.17,245.03,253,259.3,257.01,250.65,249.54,256.27,249.47,257.26,255.16,256.33,256.7,256.95,253.61,250.77,252.32,257.26,273.69,274.12,273.87,269.98,267.14,271.46,272.33,268.68,276.59,281.66,282.89,280.17,285.24,285.11,294.26,305.13,303.52,303.52,306.86,296.79,296.05,270.17,261.83,259.36,246.45,254.54,256.83,266.83,266.89,265.66,258.55,259.73,260.9,261.89,269.98,271.65,282.58,274.37,272.51,272.51,260.96,262.38,258.25,253.98,269.73,277.83,289.56,282.89,281.35,265.41,267.51,264.48,264.42,264.42,265.1,273.38,271.71,264.05,264.85,271.46,266.09,265.66,269.73,267.39,257.38,270.04,262.45,252.13,243.36,271.03,259.48,247.07,249.6,260.59,263.31,268.38,268.68,273.07,273.07,277.33,275.11,273.32,287.4,296.36,300.06,301.48,294.13,303.34,321.37,331.93,333.35,341.07,337.18,366.71,367.08,369.24,363.43,374.18,371.46,377.7,377.21,363.93,334.84,343.17,323.66,318.04,322.05,322.05,309.2,318.41,329.77,307.84,299.32,296.23,311.8,311.8,324.83,322.61,319.02,322.79,333.6,317.6,312.66,302.78,290.98,294.01,309.7,293.51,284,289.01,283.45,287.96,293.89,299.44,300,315.07,325.26,320.07,327.36,333.6,348.98,337.86,329.77,342.68,364.61,370.41,379.8,378.94,378.94,386.78,386.47,355.71,362.82,365.04,366.95,367.02,368.31,379.18,379.18,374,370.91,365.53,359.67,361.03,365.97,364.11,367.14,352.69,328.35,337.18,322.79,328.23,323.9,336.5,317.97,317.97,326.37,328.78,335.45,344.29,334.65,342.5,348.05,346.82,351.82,354.85,347.25,339.84,335.33,328.41,329.77,332.06,333.29,327.42,326.07,322.98,329.83,326.19,325.32,327.61,329.77,322.79,317.29,317.11,312.66,293.33,290.92,290.98,296.91,308.46,310.32,306.98,313.16,321.62,323.29,320.14,325.88,324.4,324.4,320.75,305.99,275.79,277.08,277.33,269.3,257.81,269.43,273.63,269.18,279.99,278.32,284.5,276.34,278.94,275.73,273.93,277.89,279.37,278.88,282.64,278.88,272.76,269.18,266.03,261.09,257.01,259.23,262.32,261.52,266.89,261.58,255.1,249.85,245.58,238.91,218.84,227.18,218.65,214.08,222.42,232.98,247.81,249.04,246.57,245.83,252.81,249.78,241.57,231.25,233.79,234.9,246.51,243.61,227.49,223.1,224.71,224.71,224.83,225.88,228.54,239.1,234.16,238.17,247.25,227.79,227.79,232.67,218.1,214.95,217.48,222.54,216.31,211.24,209.26,210.69,194.01,193.21,187.28,179.25,179.25,190.8,197.22,195,195.99,202.29,191.48,201.98,210.01,208.4,218.9,221.8,222.42,214.14,209.94,207.41,209.26,220.88,220.88,209.2,211.49,226,240.64,235.21,230.95,236.2,236.07,244.6,243.79,243.17,256.45,243.24,238.3,238.3,249.54,257.44,260.84,259.36,259.36,259.17,260.72,256.52,262.94,264.05,265.35,255.22,252.5,256.83,253.61,247,234.28,233.66,238.73,241.07,242.43,239.84,237.25,244.22,244.66,249.35,247.87,271.71,257.07,250.46,249.04,242.31,242.99,255.28,260.96,262.14,271.16,264.92,267.57,264.98,257.69,260.47,261.15,259.48,258.31,264.11,266.52,268.07,268.07,268.07,264.18,265.78,264.05,260.04,260.1,259.79,258.8,262.88,267.63,260.22,248.67,245.52,242.56,240.52,230.88,237.86,237.25,230.45,222.73,213.84,220.14,214.52,208.89,210.01,210.01,203.46,205.62,205.81,201.42,201.91,213.03,205.93,206.73,209.94,215.81,215.19,203.58,206.18,201.73,200.31,211.8,209.64,210.93,205.37,205,201.85,228.78,235.15,238.36,247.75,244.6,244.53,244.53,243.48,249.6,255.4,264.98,268.56,274.92,274.24,265.97,267.88,275.91,281.16,291.48,289.99,296.42,295.06,293.33,289.19,293.14,277.27,269.3,272.27,259.05,263.25,257.88,263.31,256.45,260.22,272.82,259.67,260.9,268.99,278.01,273.19,272.82,276.59,265.35,268.25,262.14,266.52,275.91,279.62,279.62,277.89,289.13,302.84,302.47,303.46,305.06,311.8,311.55,311.92,309.76,314.02,311.8,307.72,303.64,306.36,299.63,305.56,300.19,266.89,264.67,261.27,259.3,268.44,275.17,272.76,263.37,264.85,267.33,278.57,277.08,286.97,278.94,281.04,268.5,279.31,275.85,275.85,290.92,296.66,300.74,297.16,295.74,293.7,298.83,306.3,300.68,294.5,298.95,291.48,285.73,289.68,285.98,289.07,294.69,295.37,287.71,281.47,281.35,283.32,293.51,288.57,297.47,297.47,293.45,286.53,279.37,285.98,287.96,296.05,286.91,293.14,304.26,314.82,316.24,326.99,327.36,327.61,336.81,340.09,342.19,342.31,342.31,340.4,333.72,328.66,332.18,342.12,336.81,330.88,359.91,355.28,353.98,350.03,354.85,355.28,346.94,356.27,356.15,356.15,364.24,365.47,365.66,356.76,342.25,348.8,341.57,339.9,327.92,332.18,342.8,350.65,362.45,351.33,354.11,353.61,366.09,366.46,361.33,361.33,356.7,370.54,364.42,352.01,339.78,321.8,323.47,312.42,324.64,337.18,319.95,341.51,331.81,317.91,283.94,295.61,270.04,239.72,265.53,212.91,230.88,214.27,224.15,223.04,236.26,267.26,262.51,276.65,268.56,274.98,259.79,246.39,253.8,254.6,286.41,287.46,298.27,284.93,284.93,285.18,294.13,286.78,281.22,282.27,268.07,255.78,271.22,270.35,272.76,279.68,279.86,307.78,295.8,278.32,274.61,280.48,284.62,287.77,298.02,297.71,282.21,268.87,282.46,274.31,283.63,278.69,288.08,279.31,277.58,277.58,282.89,305.44,287.03,295.92,286.23,289.19,302.16,316.37,331.81,331.69,328.29,324.09,299.69,300.74,304.14,315.13,314.76,311.8,313.96,315.94,307.84,298.27,303.83,299.51,303.58,318.22,306.98,307.78,307.78,314.52,303.21,307.04,308.71,313.16,305.5,307.04,311.98,309.45,305.56,316.31,318.22,319.02,325.14,308.96,318.65,309.39,311.24,313.4,309.2,311.24,316.86,315.32,300.8,301.11,303.58,295,299.44,284.99,281.66,279.31,274.24,272.08,265.53,263.5,270.29,278.57,277.7,275.6,282.21,281.1,282.64,295.43,286.16,287.09,287.09,278.13,278.88,277.15,284.68,302.84,302.96,310.13,314.89,313.4,303.58,306.98,307.91,305.56,303.52,307.1,313.22,290.06,295.99,287.52,294.01,292.28,299.01,308.21,308.15,313.03,320.26,318.9,320.82,318.78,325.08,330.64,329.28,335.89,326.44,322.05,320.94,308.83,311.8,310.93,307.04,315.5,320.94,337.12,340.7,345.65,342.25,348.12,347.44,357.81,382.09,382.89,375.17,381.9,379.25,396.42,395,391.79,391.79,396.73,395.86,414.33,426.87,431.75,453,448.49,452.07,441.07,440.27,435.64,441.88,451.82,450.83,446.32,441.38,441.45,435.08,432.06,435.95,435.95,436.44,433.66,444.22,464.36,457.38,477.21,476.28,488.63,478.2,485.92,490.8,493.58,502.16,498.58,498.58,528.1,515.75,525.08,508.21,502.04,491.11,463.8,484.19,483.45,496.79,504.14,488.63,501.85,500.93,518.9,514.64,508.65,534.16,543.61,543.61,541.94,531.5,546.88,561.83,532.92,544.97,571.46,544.29,565.35,585.3,562.63,550.4,520.88,549.29,525.32,551.58,527.55,551.64,542.12,548.8,564.73,585.3,554.79,559.05,563.8,527.49,512.66,519.39,543.48,534.84,534.53,544.84,570.78,570.78,579.06,577.46,580.36,588.57,588.63,590.43,569.18,560.04,557.57,559.98,546.08,540.33,552.75,523.22,531.38,542.56,552.56,531.38,543.92,531.62,525.14,521.37,525.94,523.78,531.07,499.38,498.33,474.37,476.78,492.28,496.54,487.21,493.7,501.11,498.58,512.04,501.73,507.97,518.41,519.7,519.7,519.77,520.94,506.67,517.36,519.09,497.41,485.86,489.68,490.06,497.16,507.6,497.16,498.09,475.29,476.03,479.68,488.08,497.71,506.67,515.01,512.23,524.89,494.81,496.17,496.17,500.8,483.14,476.28,486.35,491.41,484.56,484.81,475.11,463.31,460.65,465.66,476.78,466.52,469.05,471.28,458.43,466.65,476.1,479.18,479.56,499.44,506.36,503.34,506.49,495.43,468.87,463.43,433.91,438.05,438.11,437.18,436.2,434.1,433.79,443.11,444.6,457.32,449.47,457.07,451.88,455.22,455.34,457.01,455.9,455.9,454.85,446.39,450.09,453.98,459.23,453.92,455.96,460.96,458.93,447,445.58,456.89,457.32,457.38,464.36,451.51,442.5,438.42,438.48,436.2,435.45,432,435.7,433.11,427.55,412.11,410.01,418.78,418.04,415.44,417.36,421.68,423.97,416.99,424.71,425.82,421.49,429.77,426.81,436.69,437.06,440.09,446.2,450.4,460.53,466.89,453.43,460.47,477.46,474.24,474.43,466.09,475.73,512.85,517.97,527.55,532.49,532.49,515.26,532.06,518.84,525.94,511.92,504.14,509.26,530.14,531.32,524.58,528.35,521,514.45,529.09,510.75,512.66,506.67,560.1,558,583.2,583.2,583.26,574.06,594.01,579.93,575.36,591.41,595.06,583.08,590.8,583.38,579.93,581.84,587.46,590.61,601.36,601.36,573.63,555.9,525.45,506.05,512.35,498.58,506.3,486.23,489.62,508.15,503.09,521.99,506.3,501.36,499.51,519.58,544.29,562.2,554.42,555.03,592.96,593.33,578.94,560.84,560.84,559.42,539.28,548.67,556.52,548.86,532.8,576.28,550.83,505.93,467.57,476.59,490.67,467.7,449.78,428.66,451.58,492.09,497.34,490.49,483.94,488.7,467.26,483.08,482.4,493.27,506.79,488.94,481.1,470.54,479.74,460.84,455.71,452.63,445.58,444.9,444.47,447.07,433.17,433.17,439.47,449.23,452.13,438.05,428.72,433.11,414.33,410.56,433.48,421.19,436.07,440.15,454.73,440.33,434.53,419.58,425.63,413.59,418.22,444.22,435.27,460.04,438.85,428.66,425.57,429.83,411.49,419.21,436.07,452.87,452.87,456.08,454.29,465.53,432,435.15,437.06,423.72,407.78,386.78,363.43,362.57,365.16,339.78,344.35,344.35,350.83,347.99,347.25,360.96,363.06,357.38,346.02,341.45,331.38,331.38,350.4,354.35,363.5,365.29,357.07,365.53,363.56,366.58,380.05,373.38,385.42,390.98,393.08,378.57,371.53,368.5,382.27,383.38,382.09,386.29,385.86,396.85,400.56,385.79,379.56,365.35,379.25,384.93,401.73,399.63,394.44,380.61,389.01,373.75,360.16,357.38,360.16,378.01,355.96,352.13,347.75,349.17,353.98,347.93,347.93,341.14,339.72,342.12,354.79,357.88,331.19,328.04,325.45,326.44,321.8,313.77,309.45,306.73,309.45,301.91,312.42,315.01,308.89,309.45,319.46,333.29,338.05,337.37,326.81,317.36,331.75,325.82,338.85,325.63,330.45,324.58,327.55,331.69,346.2,347.37,345.09,342.5,322.48,333.79,334.16,338.85,330.14,330.33,346.88,349.35,355.1,345.71,372.27,386.16,381.59,389.75,363.62,362.82,361.83,353.06,362.08,363.99,363.99,360.78,344.35,340.46,356.08,342.74,337.74,333.79,331.56,332.43,340.95,338.91,341.88,341.2,337.18,321.43,321.62,319.46,313.03,316.18,305.31,310.07,310.07,308.96,303.4,312.85,308.71,308.71,311.12,334.77,337.92,350.65,348.12,353.37,358.62,353.74,351.64,351.64,351.14,349.04,348.12,361.09,381.84,378.38,380.11,387.89,394.5,381.16,372.45,386.66,390.18,385.48,370.48,383.76,372.14,371.71,369.49,371.34,383.38,381.96,370.91,364.48,364.48,355.78,351.95,362.88,359.36,357.63,357.13,354.17,348.55,350.71,351.02,343.17,351.39,343.42,339.28,332.92,335.21,334.34,349.41,349.97,356.02,362.14,359.3,378.88,377.76,369.3,366.15,392.46,389.68,372.7,368.19,353.74,352.19,361.7,361.7,390.8,392.65,382.71,389.13,386.84,386.29,382.52,374.61,379.62,377.58,367.57,359.11,376.9,382.33,397.53,385.11,382.33,376.22,373.75,378.2,375.97,376.34,370.54,380.54,376.28,399.26,393.64,400.99,417.36,421.06,409.08,407.72,410.93,429.96,456.64,456.64,442.8,421.25,426.74,427.24,418.59,417.17,414.21,403.46,404.14,416.62,419.21,426.93,425.08,417.91,417.91,413.22,406.42,409.2,403.21,404.26,412.54,414.27,397.34,389.81,394.69,394.69,383.32,378.2,374.61,385.92,392.84,394.01,398.58,395.8,402.47,401.11,401.24,399.57,405.5,404.45,405.68,416.18,438.97,439.78,440.95,437.06,421.06,427.3,431.81,428.54,417.85,411.98,404.2,397.59,421.74,403.52,396.66,392.59,392.77,395.06,391.66,402.66,393.39,393.58,403.4,411.86,420.57,432,434.77,434.77,434.16,434.9,431.56,433.48,432.55,434.28,437.62,443.42,431.62,435.45,436.75,430.39,419.39,425.45,423.59,419.64,421.31,402.72,420.2,419.77,418.96,420.69,426.5,432.12,429.15,426.62,433.66,430.82,427.49,426.68,426.19,427.05,417.11,415.19,413.09,420.44,410.75,398.58,405.5,408.09,413.03,428.66,435.08,448.3,450.4,449.66,446.45,454.42,465.47,461.89,476.65,476.47,473.56,479.06,485.61,473.81,476.22,476.22,474.8,478.75,470.17,473.69,470.17,468.99,458.86,455.16,451.7,454.91,463,480.48,482.77,492.84,507.66,502.84,503.77,507.54,486.04,527.98,534.22,534.22,537.74,535.27,531.19,527.12,508.59,508.09,510.87,515.44,524.71,514.7,508.83,515.07,508.89,508.89,522.61,514.39,523.9,540.52,551.2,540.64,544.04,550.96,543.85,550.15,532.18,529.65,528.78,534.16,537.25,522.54,526.07,524.27,528.47,529.34,503.58,505.44,504.2,491.04,491.04,498.52,503.34,530.64,531.19,552.56,567.33,554.11,559.67,587.71,591.54,583.51,590.24,611.37,602.96,583.76,601.73,581.59,564.73,575.97,579.25,580.61,594.5,678.51,680.73,723.47,733.79,736.57,728.17,728.17,767.76,758.18,790.67,766.46,763.31,759.42,757.44,754.79,787.58,756.76,749.66,752.13,718.53,691.35,659.48,674,694.63,690.43,689.19,709.33,706.36,697.71,677.58,693.82,708.46,742,736.32,737,727.67,748.86,759.73,770.91,789.44,789.93,773.87,796.79,787.52,779.99,779.93,799.81,799.81,819.46,812.72,780.05,772.08,791.66,782.21,825.88,803.4,808.77,832.74,834.28,869.36,884.13,873.13,913.09,947.81,947.81,890.61,861.89,858.62,871.65,879.31,816.74,812.42,812.35,818.96,845.09,845.09,812.85,807.23,810.01,842.43,804.39,824.89,808.34,787.46,738.11,725.45,705.74,712.04,705.68,681.16,663.68,675.79,666.15,633.48,678.32,626.99,572.58,558.49,549.72,536.13,568.68,574.92,584.56,601.85,620.2,660.59,667.02,670.97,667.02,669.12,643.98,635.27,610.93,604.45,585.92,590.3,594.44,594.44,547.13,551.51,552.13,533.54,532.86,536.44,559.91,538.67,563.43,538.48,548.05,539.53,551.27,561.46,577.95,580.61,591.54,678.69,663.99,640.58,619.58,616.74,628.91,631.56,635.64,633.35,628.17,652.81,660.41,669.18,644.35,674.74,692.09,686.53,673.75,665.97,648.86,659.98,666.52,657.13,668.19,642.87,615.5,616,628.35,651.58,690.74,700.49,691.17,671.09,642.99,617.17,612.6,595.06,602.29,603.64,607.6,634.71,633.97,645.34,628.78,606.55,606.55,605,608.71,616.68,637.43,623.04,624.89,635.08,605.93,630.39,606.79,633.11,668.68,670.78,641.75,537.92,556.64,554.17,551.45,551.45,554.79,547.44,526.93,519.83,539.41,555.1,613.09,629.46,614.02,614.02,613.59,587.15,601.36,637.37,633.72,653.18,653.18,675.6,674.68,647.56,637.37,562.75,545.09,549.78,571.34,563.56,555.4,559.98,578.13,583.94,570.11,592.53,581.1,566.28,590.86,614.7,614.7,659.6,644.6,637.31,610.5,589.31,575.79,603.52,567.14,578.32,559.23,563.31,582.71,551.39,574.18,537.86,550.03,590.73,586.04,622.54,636.87,628.29,630.39,636.2,585.05,598.76,581.72,569.05,563.06,546.26,536.69,547.93,547.25,459.17,399.75,422.3,404.82,480.98,432.67,429.59,438.67,438.79,428.23,424.95,424.95,412.23,433.66,450.46,478.2,492.77,485.24,474.86,475.29,480.36,498.58,496.73,497.28,510.32,525.94,530.33,570.04,598.7,588.76,589.56,605.31,609.33,605.93,591.97,585.73,576.71,576.71,595.31,594.07,597.9,583.45,606.42,631.56,637.74,656.52,670.54,685.3,705,716.68,717.6,714.02,740.21,743.3,752.44,752.44,763.43,754.05,790.06,785.98,778.26,770.6,761.27,746.7,751.95,755.34,755.34,740.7,768.5,755.03,760.41,769.18,732.61,741.88,719.15,699.57,706.55,699.38,674.61,678.38,690.12,687.21,687.15,691.54,708.71,674.12,647.81,665.66,673.63,671.9,690.98,734.34,764.18,789.07,767.57,773.87,746.57,763.13,753.86,723.97,715.19,726.87,719.09,719.58,727.3,753.55,735.08,735.08,731.81,733.29,767.2,811.43,811.98,835.33,864.73,930.02,971.15,974.49,980.98,988.2,1043.17,1005.13,1016.8,1027.86,998.83,968.68,971.4,1012.35,1033.48,1125.08,1134.96,1160.16,1179.49,1146.94,1213.96,1187.96,1121.68,1190.67,1155.4,1185.55,1250.96,1250.03,1277.15,1249.47,1225.88,1276.78,1352.81,1359.48,1370.66,1399.81,1383.63,1382.15,1449.66,1346.7,1466.95,1472.08,1469.55,1564.55,1489.25,1512.66,1463.56,1524.58,1494.44,1411.36,1395.43,1243.79,1280.85,1383.14,1386.84,1422.24,1422.24,1460.65,1485.24,1479.25,1446.32,1399.94,1465.23,1525.14,1559.11,1628.84,1596.42,1489.44,1466.95,1436.13,1392.96,1535.21,1642.5,1708.4,1706.42,1770.72,1770.72,1759.05,1818.22,1807.47,1762.88,1948.24,1928.04,2121.25,2097.28,2019.89,2131.5,2136.32,2088.51,2058.99,2079.25,2240.58,2240.58,2254.48,2403.4,2455.71,2468.5,2403.27,2533.91,2688.57,2691.72,2562.57,2704.14,2590.73,2343.42,2364.98,2437.86,2368.75,2305.44,2534.53,2556.95,2542.68,2542.68,2469.3,2600.06,2577.83,2644.66,2600.19,2581.9,2649.78,2566.77,2547.07,2548.92,2345.15,2475.42,2452.44,2287.21,2404.69,2489.87,2586.1,2503.71,2632.06,2728.84,2851.7,2851.95,2744.1,2612.11,2497.53,2443.05,2360.04,2195.55,2206.42,1987.65,2086.72,2272.08,2262.14,2262.14,2333.29,2332.18,2512.23,2603.52,2597.84,2634.71,2876.22,2817.97,2824.15,2810.81,2769.73,2775.66,3010.99,2975.42,3068.07,3240.02,3114.82,3202.35,3194.32,3349.04,3560.53,3954.29,4117.29,3994.01,4612.79,4912.48,4734.9,4963.74,4793.14,4475.97,4209.64,4315.87,4521.25,4707.23,4638.67,4638.67,5533.54,5734.47,5704.26,5997.53,6395.92,6572.58,6668.13,6151.95,5336.69,5863.37,5780.67,5508.83,6151.14,6063.06,6720.14,6304.88,6443.42,7004.26,7004.26,7482.27,6496.42,6476.28,7495.74,6994.01,7074,7129.65,6376.03,6025.69,6025.69,6082.46,5796.05,5860.41,6125.02,6048.8,5787.52,6072.39,5585.42,5269.92,5243.67,5345.65,5996.42,5926.37,6116.18,5688.39,5560.22,5068.13,4564.55,5402.47,5083.57,5123.53,5513.71,5516.92,5444.53,5420.44,5318.1,5364.55,5628.72,5866.77,6001.61,6249.23,5810.75,5788.17],"삼성전자":[100,99.4,100.72,98.69,97.85,96.24,97.91,98.21,96.72,94.75,95.34,95.88,98.09,96.78,97.85,94.03,87.46,91.16,91.16,91.16,91.16,93.01,94.63,95.04,96.6,93.79,93.61,93.67,93.55,95.52,95.4,95.4,96.36,96.66,100.96,101.85,100.3,92.24,91.64,92.96,94.15,94.93,94.87,97.01,96.72,94.87,96,95.34,93.55,93.91,96.36,97.85,98.63,98.09,96.48,97.13,97.91,98.15,95.28,98.45,95.4,92.72,91.88,93.01,93.61,94.69,95.1,97.91,98.45,98.51,98.51,100.12,100.12,104.24,104.42,103.1,102.57,104.36,105.79,106.87,106.27,104.6,105.43,106.09,105.01,107.04,107.16,108.18,107.76,108,106.39,107.34,107.4,106.75,107.58,107.58,107.76,108.9,107.94,106.15,108.06,111.1,111.16,114.27,115.82,111.82,109.43,110.33,110.27,111.88,111.04,113.61,113.91,117.61,119.1,119.1,119.1,117.79,116.78,117.49,117.79,118.09,115.88,114.63,114.63,114.51,113.31,112.18,112.6,113.49,113.01,115.4,116.24,117.31,116.96,114.09,113.61,114.75,114.75,118.57,118.27,119.64,120,120,120,119.94,121.19,123.46,123.58,124.9,126.57,125.07,127.04,126.75,124.78,123.88,122.99,123.82,124.72,125.31,122.99,123.7,125.61,125.79,124.9,124.18,125.19,124.18,125.07,126.63,125.43,124.06,123.88,122.09,120.24,121.67,123.1,127.46,127.76,130.87,133.19,133.19,134.03,134.03,135.88,135.88,140.36,140.36,136.12,135.82,136.78,137.61,138.45,138.33,137.13,133.49,134.63,134.09,133.97,136.36,137.55,136.18,133.25,133.43,133.37,137.19,137.13,137.13,135.22,134.81,137.61,135.46,135.52,135.4,136.36,136.06,138.99,143.7,141.73,143.16,142.15,144.12,144.18,142.39,143.1,141.91,140.96,140.3,142.03,143.46,142.87,145.25,146.27,148.9,150.93,150.69,151.16,151.76,151.46,152.84,152.48,151.82,149.25,148.78,148.66,142.57,143.88,145.07,146.27,142.63,142.39,142.03,142.45,138.15,137.01,133.19,134.33,134.33,137.91,140.42,140,139.82,140.3,141.73,141.85,140.36,137.61,137.55,137.91,138.27,138.75,137.43,139.58,140.3,143.64,146.51,148.66,148.06,148.12,150.15,150.45,156.66,155.58,155.88,157.61,157.61,160.06,160.06,154.27,153.01,153.07,153.07,153.07,153.07,153.07,153.07,153.07,157.61,163.1,163.58,161.19,160.96,163.58,163.46,158.15,160.72,162.09,161.31,160.9,156.42,158.45,161.31,164.42,170.81,170.33,168.3,168.3,167.46,169.43,168.18,168.36,168.3,166.93,165.19,166.51,166.63,164.78,165.01,167.04,165.07,165.55,157.13,159.04,157.01,151.64,151.76,153.25,153.01,149.31,151.46,155.22,154.57,155.52,153.19,152.42,151.1,152.84,153.91,153.91,146.69,148.36,148.36,143.88,147.34,152.12,152.12,152.3,154.09,152.48,155.58,155.28,150.45,145.79,144,143.88,144.9,149.25,148.12,148.96,147.22,144,146.75,147.28,150.03,151.58,152.9,148.66,148.96,148.72,142.39,143.04,141.55,136.72,137.31,133.43,136.48,141.91,146.27,146.27,146.27,144.42,141.49,141.13,139.58,140.96,141.43,141.43,140.48,140.48,137.37,134.93,140.36,145.13,146.87,148.48,148.48,154.21,154.51,153.85,152.66,151.46,152.84,152.42,154.57,148.42,150.09,149.19,145.37,146.39,146.93,144.9,143.64,140.06,145.49,144.48,146.87,145.91,145.85,146.27,148.66,150.27,149.19,153.31,157.55,154.09,154.93,150.63,150.45,155.64,158.21,158.21,158.21,158.21,158.21,154.93,154.93,157.01,151.94,154.03,153.13,149.55,146.87,148.81,147.46,147.76,149.25,149.25,154.63,153.43,157.31,156.12,153.13,147.76,151.34,153.13,152.54,153.13,153.13,151.04,148.21,148.96,147.46,147.46,143.88,142.24,139.1,140.3,140.3,140.45,141.04,139.25,140.3,143.13,139.7,139.25,135.97,137.76,138.06,137.16,134.03,136.12,138.21,137.31,135.82,138.81,137.46,136.87,138.96,140,141.64,138.81,137.76,137.76,140,140,138.81,138.06,138.96,135.97,136.57,136.72,139.4,139.7,140,135.52,134.48,134.78,134.78,132.09,131.64,130.9,133.73,137.61,137.91,137.76,138.21,138.96,139.7,142.24,144.63,141.64,142.24,139.1,137.61,134.03,135.82,134.48,132.99,131.49,136.87,134.78,135.82,137.76,141.04,141.49,141.49,141.49,141.49,141.79,138.66,138.36,136.42,136.42,133.43,133.43,134.18,134.18,135.22,128.66,131.34,130.75,130.15,131.79,131.49,131.04,130,128.51,127.01,122.39,122.39,123.58,126.42,126.57,125.82,131.79,130.75,130.6,131.34,131.49,132.24,134.93,132.84,131.64,132.09,131.34,130.3,127.76,125.67,126.72,126.57,127.16,128.51,128.81,128.81,124.93,129.1,125.82,123.73,120.9,122.24,120,120.15,120.75,119.4,116.27,116.87,116.12,116.72,115.37,115.37,115.82,115.82,114.48,114.18,115.52,115.52,115.67,112.24,111.79,115.67,113.73,118.21,118.81,120.9,119.55,122.69,123.73,125.22,126.27,127.61,125.82,125.37,128.51,133.58,134.48,135.82,138.51,137.76,138.36,138.36,138.36,138.36,137.91,133.73,134.33,137.46,137.91,141.79,137.46,137.91,137.16,140,140.15,140.75,141.34,139.55,139.55,134.63,134.63,133.88,132.09,131.34,132.69,130.75,130.3,133.28,130.9,130.9,131.94,130.45,131.04,131.49,136.87,138.96,135.82,135.07,135.37,133.88,133.28,134.48,136.57,139.1,140.15,139.85,139.25,139.25,139.4,138.06,139.85,140.45,141.04,140.45,136.12,135.22,135.37,134.93,133.58,133.28,133.88,137.76,136.87,136.87,137.01,135.22,135.22,133.88,132.09,126.72,128.06,127.31,127.31,127.01,124.03,122.99,125.37,128.81,129.85,130.9,127.46,127.31,127.01,124.78,127.01,126.87,130.75,129.7,131.04,131.04,131.94,133.73,133.88,133.13,130.6,131.34,131.04,132.39,135.37,135.82,136.42,135.82,136.12,136.42,138.81,140.3,139.1,138.06,135.52,137.31,136.27,132.54,134.63,135.97,137.91,138.21,138.66,139.85,137.46,137.61,139.7,140.9,141.19,138.51,140.9,140.75,137.61,138.96,135.37,134.93,134.18,131.19,129.85,128.96,127.31,128.81,130.45,128.36,130.45,130.45,131.04,130.15,132.69,132.84,131.49,131.19,130.15,131.49,131.79,129.55,131.34,130.75,129.1,131.64,136.42,138.21,140,140.3,140.75,140.75,140.75,140.6,140,142.39,146.72,146.87,147.16,147.76,145.97,146.87,144.48,146.42,145.82,142.09,142.09,143.28,142.54,145.97,145.97,144.93,146.72,149.25,149.55,151.34,150.75,148.96,150.15,152.84,152.84,151.34,151.94,153.13,152.54,150.45,150.45,152.84,156.12,157.31,159.1,157.91,155.52,154.03,157.01,156.72,157.61,160.3,159.7,159.7,155.22,152.24,154.03,154.63,154.63,155.82,153.13,150.15,150.45,148.96,147.61,147.76,150.45,152.84,153.73,154.93,159.1,163.28,163.28,169.25,168.06,167.16,167.16,165.67,164.18,164.18,165.37,168.66,166.57,166.57,164.78,165.67,165.67,166.57,169.55,174.93,177.61,179.1,179.1,176.12,181.19,182.99,186.27,183.28,185.97,181.49,181.49,181.49,175.52,176.42,170.75,168.36,170.75,175.82,177.61,182.39,180.3,178.21,178.81,180.6,181.19,184.48,183.58,178.51,179.7,179.1,176.72,169.55,172.84,168.66,166.87,161.79,164.18,165.37,171.34,172.54,168.66,168.66,162.99,155.52,155.52,149.1,145.97,141.19,136.12,128.21,135.52,126.87,140.15,145.22,142.69,144.18,142.84,142.54,136.72,139.7,140.3,145.37,148.06,145.07,146.57,147.01,144.18,146.27,146.27,146.27,153.43,149.55,147.01,148.81,148.81,147.31,148.81,149.55,149.25,149.25,149.25,144.78,144.78,146.87,145.67,145.67,144.48,142.99,144.93,143.28,142.84,145.67,150.15,149.25,149.1,145.52,145.82,147.01,148.96,150.45,151.34,152.84,153.43,162.69,162.99,165.67,163.88,165.67,165.37,162.09,156.12,148.96,155.52,155.82,156.12,157.91,155.22,153.43,157.91,154.93,159.1,156.42,157.61,157.01,157.91,160,164.18,159.4,158.21,157.61,157.31,159.4,160.6,163.28,160.6,162.39,161.79,165.07,163.28,161.49,161.79,165.97,174.93,176.12,176.12,172.84,169.55,171.04,169.85,173.13,171.64,172.54,173.73,176.12,175.22,173.13,173.13,174.33,172.54,165.37,166.87,167.46,168.36,168.36,165.97,165.37,161.19,161.79,162.39,168.36,165.97,168.66,175.22,174.33,176.72,176.12,180.3,182.09,182.09,177.61,177.01,176.72,173.73,174.93,172.54,172.84,173.73,173.73,173.73,173.73,173.73,175.22,176.12,178.81,178.21,178.21,180.3,181.79,181.79,179.1,177.61,179.1,181.79,181.79,179.4,179.7,180.3,178.51,176.12,173.43,168.96,171.34,175.52,174.63,180,179.4,179.7,179.7,182.99,182.09,188.66,197.91,196.12,193.43,192.84,193.13,201.49,202.09,198.81,202.99,203.58,199.1,202.39,207.46,208.06,213.43,217.61,214.03,220.6,217.61,219.1,220.3,220.3,220.3,218.81,217.91,217.91,215.82,220.6,232.24,232.24,234.93,233.73,241.79,241.79,247.76,250.45,245.37,247.46,265.07,271.64,270.45,267.76,267.76,262.69,253.73,259.7,260.3,262.99,259.1,266.87,258.81,255.52,249.85,244.78,247.76,251.94,252.54,246.27,249.25,247.76,246.87,243.58,243.58,243.58,251.34,253.43,248.36,245.07,246.57,245.37,244.78,244.78,254.63,246.27,246.27,249.55,250.75,245.97,245.07,244.78,242.99,241.49,244.78,247.16,244.18,247.16,245.67,247.46,244.48,244.78,244.18,241.79,242.39,243.28,243.58,245.37,242.99,247.46,253.13,254.93,256.72,255.52,252.84,249.55,248.36,250.75,250.75,251.04,250.45,248.66,250.45,246.57,245.97,247.16,249.25,247.46,245.07,243.88,243.28,243.88,246.57,246.57,245.67,244.48,248.36,242.39,238.81,234.33,239.1,237.61,237.61,237.61,237.31,239.1,237.91,238.51,238.21,237.61,239.1,240.3,240.6,241.19,247.16,245.37,244.48,244.48,242.09,241.79,241.79,240.3,241.49,244.18,241.49,240.3,238.51,238.81,239.1,242.39,243.58,244.48,241.79,240.9,239.1,238.81,240,242.39,241.19,238.51,237.01,237.91,238.21,237.31,240.6,238.21,235.82,235.82,234.33,237.91,236.72,235.22,234.33,236.42,235.82,234.33,236.72,242.99,247.46,245.07,243.28,243.28,239.4,234.33,229.85,222.09,222.09,221.49,220.6,218.21,217.01,218.81,225.67,225.97,222.69,221.79,222.69,228.96,229.25,226.87,228.66,230.75,227.16,227.76,224.78,224.78,227.76,228.66,229.85,227.16,230.45,230.45,230.45,230.45,231.04,230.75,231.94,227.76,221.19,221.19,218.51,218.51,215.52,212.84,213.73,213.43,213.43,205.97,205.37,207.16,209.25,209.55,210.75,209.85,209.55,210.15,209.55,212.24,209.25,211.04,208.36,208.66,213.43,210.15,210.75,209.55,210.75,210.45,209.55,208.66,210.75,213.13,212.84,211.04,209.55,212.54,223.58,224.78,223.28,220,215.82,215.82,212.84,222.09,226.27,225.67,227.76,231.04,231.04,233.43,229.55,229.25,229.85,231.64,232.24,232.84,230.15,233.13,237.01,238.51,240.3,239.4,239.7,235.22,233.73,233.73,233.73,234.93,231.04,229.55,233.73,232.84,235.52,235.52,232.54,230.75,231.34,229.85,227.76,228.36,225.67,224.18,220.9,220.9,212.84,218.81,218.81,218.81,218.81,218.81,220.9,217.91,217.91,217.91,225.07,223.58,220,220,223.28,223.88,221.79,221.79,221.79,221.79,213.43,214.63,214.63,214.63,214.03,217.61,217.61,209.25,207.46,207.46,207.46,208.96,209.55,209.55,210.15,210.15,211.04,208.66,209.85,210.45,208.36,208.36,208.06,209.55,208.66,207.76,206.27,206.87,206.57,204.48,202.99,202.39,202.69,200,205.07,201.49,198.81,199.1,200.9,201.19,202.09,200,197.91,197.31,194.03,193.43,201.19,200.9,201.49,202.69,202.69,198.51,198.51,196.12,196.12,193.73,198.51,197.91,201.79,203.28,201.49,202.99,202.69,198.51,198.21,196.72,198.51,202.09,201.19,201.19,199.1,199.4,199.4,195.52,194.93,194.63,190.45,185.37,184.78,181.19,181.79,178.51,175.22,174.63,171.94,171.34,174.33,175.52,177.31,173.13,170.15,167.76,170.45,170.75,168.36,173.73,175.22,175.52,173.43,173.13,171.64,179.1,184.78,181.79,180.6,184.48,182.99,182.39,184.18,184.48,184.78,183.28,182.99,184.18,182.99,183.58,183.58,181.49,179.1,176.42,178.81,179.7,179.7,182.09,180.3,183.58,181.79,179.1,176.42,176.12,178.21,179.1,174.93,175.52,178.21,174.33,171.64,170.45,170.45,167.16,165.97,165.97,165.97,173.43,169.55,167.16,167.76,168.36,166.57,165.07,162.39,162.69,160.9,161.79,157.91,157.01,158.51,158.51,164.78,167.16,168.06,167.76,167.76,165.37,166.57,164.78,168.06,168.96,168.66,166.57,165.67,166.87,171.64,172.24,177.31,177.61,171.04,177.31,179.1,177.91,176.72,177.31,179.7,184.48,185.07,180.3,187.76,184.78,186.27,187.16,183.28,184.48,183.28,180.9,182.09,183.28,182.09,179.4,180.9,185.67,186.87,180.3,180,176.72,175.82,176.72,180.3,177.61,178.21,180.6,177.01,177.61,177.61,174.93,173.13,176.42,173.43,172.84,173.43,168.96,165.07,165.07,165.67,165.37,172.54,173.73,176.12,181.19,180.3,180.6,180.6,181.49,182.39,182.09,180.3,183.58,184.48,184.48,184.48,188.96,190.45,192.84,188.96,183.28,182.09,189.55,189.55,183.88,185.07,188.36,188.96,187.76,187.76,188.66,185.67,190.15,186.87,187.16,185.37,182.39,185.07,182.99,180.6,180.9,180.9,181.49,180.6,183.58,181.19,180,179.4,177.61,179.1,176.12,178.51,178.81,182.99,179.7,180,182.39,185.97,188.06,185.37,187.76,187.16,188.66,191.04,188.36,189.85,190.75,185.97,194.03,196.12,196.72,197.01,197.31,194.33,194.93,195.82,195.52,194.93,196.12,194.63,189.85,191.34,192.84,195.52,195.52,196.12,195.22,194.33,194.33,196.72,194.93,192.84,191.64,191.34,192.54,195.22,194.03,197.61,204.18,204.48,204.18,204.48,205.37,209.85,209.85,215.82,213.13,211.64,215.52,214.03,214.03,211.94,211.64,214.93,211.94,214.93,214.63,213.43,214.33,212.54,213.13,210.45,212.84,213.73,216.12,216.72,217.01,216.12,215.52,217.91,217.91,214.93,213.73,208.66,207.46,213.43,214.63,214.63,219.1,218.81,214.93,214.03,211.94,209.85,210.15,208.96,208.36,214.03,210.75,208.36,212.24,208.66,205.37,203.88,204.48,201.79,205.67,202.99,201.49,200.9,200.9,200,199.1,197.91,198.81,198.81,200.3,203.58,200.3,199.4,199.4,200.3,199.7,211.94,212.54,211.04,208.96,210.15,209.85,211.34,210.45,211.64,214.03,214.93,209.55,208.36,207.76,205.67,205.37,207.16,204.78,204.18,204.18,204.18,204.18,204.18,201.49,199.1,197.01,197.01,198.21,203.58,205.67,202.99,200.9,207.16,210.45,207.46,205.37,204.18,204.48,202.99,199.1,200.9,200.9,199.7,204.78,208.06,207.76,211.64,211.64,208.66,209.85,210.45,210.15,211.34,215.52,217.31,216.42,217.01,217.31,217.31,216.12,214.03,212.84,217.01,217.01,217.31,214.93,216.72,212.54,214.03,213.43,216.72,217.91,219.4,217.31,218.21,218.81,217.61,219.1,223.28,223.88,226.57,226.57,228.66,232.84,234.33,234.33,237.61,229.85,228.66,228.66,228.36,222.99,219.7,218.51,218.21,220.6,216.72,211.94,214.03,222.99,224.18,224.48,220.9,221.19,219.1,222.09,221.79,217.01,219.7,224.48,221.79,222.09,223.88,221.19,221.19,221.19,224.48,220.9,218.51,217.31,220.3,218.81,217.91,218.21,217.61,217.31,217.61,218.51,219.1,219.1,223.58,220,217.61,215.52,218.81,216.12,218.81,221.19,221.79,215.82,217.31,217.31,229.55,236.72,235.52,233.43,238.51,238.21,241.19,245.97,244.78,253.73,251.04,254.63,252.24,252.24,249.55,249.55,251.04,249.85,245.37,238.81,235.52,237.61,231.64,227.16,225.37,234.63,227.76,228.96,228.96,231.34,231.34,232.84,231.64,231.64,242.69,242.69,237.91,236.42,234.03,233.73,233.73,233.43,231.04,235.52,234.03,231.94,233.73,226.57,230.45,231.64,224.48,219.4,219.4,225.97,224.78,231.04,231.04,230.75,225.97,224.48,228.36,234.63,237.61,233.13,238.21,242.39,243.58,238.81,240.6,241.19,242.69,243.58,243.28,244.18,244.18,244.18,252.54,260,260.9,262.09,262.09,261.49,251.94,258.81,261.79,258.81,259.4,251.94,247.76,250.45,244.78,240,241.49,242.39,241.79,250.45,248.06,237.61,213.13,216.42,222.99,219.1,222.99,225.37,227.16,230.45,230.45,239.4,233.73,235.52,233.73,233.73,231.94,227.16,226.27,228.06,220.9,221.79,222.09,216.42,208.96,205.97,205.67,201.49,197.61,193.73,197.91,192.24,192.24,192.24,192.24,188.36,188.06,186.87,188.66,185.67,193.13,191.64,183.58,183.58,182.99,182.99,180.9,182.09,180,180,175.82,177.01,177.01,182.09,177.61,178.21,176.72,176.12,172.24,176.42,168.96,166.87,173.43,177.91,176.42,176.72,174.03,175.22,171.94,171.04,171.04,170.15,164.18,158.21,151.04,148.96,159.7,169.25,168.06,165.07,168.36,167.16,172.84,174.03,168.06,165.67,161.79,160,160,158.51,160.3,161.49,159.4,161.19,161.19,166.87,167.46,165.97,161.79,163.88,158.51,158.21,159.7,162.39,162.39,160,160.3,158.81,158.81,159.4,162.39,166.87,165.37,171.04,167.46,165.07,161.49,160.9,160.3,162.09,160.3,159.4,159.7,162.09,160.3,160.3,160.3,160.3,160.3,160.3,156.42,152.24,157.31,157.91,161.19,160.3,165.97,166.27,166.57,166.57,167.16,167.16,169.85,175.22,174.33,173.73,171.04,170.75,168.96,168.06,162.69,162.69,162.69,161.19,162.09,160.3,160.3,160,163.88,163.28,163.28,171.94,171.94,174.63,179.7,184.18,180.6,178.51,183.28,184.48,179.7,172.54,175.52,175.52,171.94,167.46,158.81,159.7,158.21,168.36,164.78,167.76,168.96,163.28,164.48,165.07,165.37,164.18,166.27,166.27,166.27,166.57,166.57,165.67,165.67,162.09,162.09,162.09,162.99,162.99,163.58,171.94,169.85,171.34,171.04,169.55,166.57,166.87,166.27,163.28,161.79,163.28,160.9,166.87,167.46,167.76,169.55,169.55,172.54,176.42,176.42,178.51,176.72,178.81,177.61,174.03,170.75,173.43,178.51,176.72,177.61,173.13,180.6,182.99,179.7,181.49,178.51,179.7,181.49,190.45,188.96,184.18,183.28,180.3,182.09,186.87,186.57,190.15,193.13,199.1,200.3,202.39,197.01,198.21,197.01,196.72,210.15,210.75,216.72,213.13,205.67,208.06,208.66,205.37,210.45,214.33,211.94,212.24,214.63,213.73,213.73,208.96,208.96,210.45,210.75,213.13,213.43,209.85,210.75,207.76,208.06,201.79,206.27,208.36,209.25,207.46,209.25,213.43,216.72,219.1,225.07,228.36,237.01,233.43,239.7,239.7,249.25,252.84,254.93,257.01,248.66,251.34,250.45,256.72,267.91,267.91,267.91,267.91,267.91,267.91,281.79,278.51,273.43,283.58,291.64,292.24,292.84,291.04,294.33,288.06,294.93,304.48,297.01,300,310.75,320.9,331.64,313.13,300.3,296.12,292.24,300.3,308.96,307.76,306.87,290.15,300.3,291.94,288.06,300.3,282.99,288.66,296.42,306.87,308.96,300,300.9,308.66,311.94,313.73,323.58,326.87,323.58,322.39,320.3,325.07,312.84,306.87,322.09,321.19,317.31,329.85,332.84,331.64,331.64,349.25,356.72,357.91,357.91,383.58,412.24,414.63,420.9,414.33,414.93,414.33,410.75,418.81,429.55,444.48,445.67,433.43,446.27,454.63,454.03,454.03,476.12,484.78,479.7,479.1,448.96,500,504.78,475.52,473.43,496.72,494.93,500.9,533.13,540.9,540.9,540.9,540.9,567.16,567.46,576.12,597.01,607.46,650.75,646.27,646.27,582.39,514.03,571.94,561.79,517.91,560.9,567.16,560.9,547.76,563.28,578.81,622.39,598.51,595.22,556.12,566.27,564.18,537.61,537.61,526.27,499.1,566.12,532.54,555.82,576.42,586.57,628.36,608.96,614.93,600,616.42,629.85,649.25,644.78,640.3,653.73,649.25,670.15,655.22,670.15,662.69,674.63,658.21,658.21,694.03,694.03,794.03,810.45,801.49,852.24,832.84,847.76,883.58,807.46,838.81,822.39,823.88,894.03,873.13,873.13,892.54,916.42,894.03,946.27,1041.79,1076.12,1076.12,1049.25,982.09,882.09,961.19,902.99,892.54,962.69,1005.97,1023.88,1034.33,1082.09,1056.72,1055.22,925.37,1016.42,1070.15,1013.43,964.18,997.01,938.81,853.73,923.88,949.25,883.58,828.36,829.85,850.75,759.7,785.07,834.33,761.19,761.19,728.36,773.13,777.61,805.97,744.78,758.21,656.72,622.39,617.91,783.58,714.93,716.42,734.33,688.06,689.55,686.57,714.93,762.69,800,819.4,819.4,801.49,738.81],"어플라이드 머티어리얼즈":[null,100,102.74,101.89,101.72,102.81,103.09,102.88,102.37,103.91,102.98,102.98,102.85,102.61,102.2,99.01,101.51,100.79,100.96,103.43,103.09,103.95,104.25,104.87,103.91,101.75,100.69,101.68,102.02,101.48,103.43,102.64,101.58,102.71,102.54,102.06,100.79,98.25,98.25,95.57,96.3,95.37,96.12,97.15,97.36,97.53,100,99.01,98.97,99.01,98.32,99.76,99.14,98.08,96.98,96.81,100.62,101.23,99.93,96.67,98.87,99.45,101.58,102.98,105.42,105.45,107.55,108.64,109.37,109.37,109.37,109.23,110.33,110.46,103.26,107.86,108.16,108.44,111.53,112.21,110.98,109.78,109.88,110.26,113.41,111.53,111.29,111.87,111.77,113.24,112.86,112.86,114.34,112.86,112.04,110.7,110.7,109.57,110.6,110.12,109.91,112.45,113.65,114.82,114.27,115.92,115.92,114.24,115.57,115.78,116.09,115.78,116.74,118.08,116.57,120.21,117.8,117.5,120.17,119.86,121.13,120.69,121.92,122.13,121.48,121.17,121.65,120.86,121.75,120.69,122.37,122.37,125.49,125.25,124.05,124.53,124.97,124.25,126.42,125.18,126.48,126.45,126.83,127.58,128.23,130.77,131.87,131.29,133.52,133.96,134.75,135.75,132.35,133.17,133.28,133.69,133.31,133.17,133.34,133.41,133.45,133.41,133.79,131.66,132.35,133.55,133.31,131.05,129.57,128.71,128.71,130.43,130.53,134.65,136.84,136.5,138.73,139.93,139.66,141.78,139.31,143.05,143.09,142.54,142.78,143.5,142.5,144.22,147.07,149.16,149.02,152.04,154.61,146.69,150.63,151.22,153.45,154.07,153.1,154.44,156.09,156.09,156.3,157.39,157.8,160.55,160.27,159.76,162.13,162.71,153.48,152.11,153.86,150.87,148.06,147.89,151.94,148.75,149.64,148.68,151.25,148.37,143.7,146.45,142.16,141.72,140.69,140.69,144.49,144.46,149.37,151.66,155.75,155.33,155.4,158.22,158.32,159.93,161.85,162.09,160.58,160.48,159.18,162.78,157.94,155.23,152.01,151.29,146.59,146.48,146.9,150.81,150.6,150.29,144.19,147.79,150.19,150.53,152.52,147.92,151.97,148.58,152.49,151.01,149.98,148.58,149.67,151.01,155.99,154.79,154.72,154.72,152.59,153.45,155.13,152.14,156.36,156.6,158.22,161.41,161.72,164.84,165.56,162.2,161.75,163.88,158.94,157.53,167.55,173.65,178.7,178.66,177.84,177.02,176.43,179.76,180.75,180.41,182.61,182.88,185.04,188.82,189.13,189.85,189.81,192.42,193.38,193.41,189.71,191.87,194.48,191.77,193.58,191.11,193,194,193.24,193.72,195.27,190.33,193.34,195.64,193.55,191.32,198.42,193.79,197.67,201.72,197.87,197.87,198.66,195.33,196.67,181.51,181.03,178.08,170.74,171.8,174.99,179.42,176.43,177.08,173.14,174.13,176.02,180.24,183.19,181.68,182.81,178.01,178.59,178.59,175.13,177.29,177.43,175.37,181.96,185.18,186.24,187.31,191.84,188.2,182.85,182.5,183.36,183.36,186.96,196.71,196.91,196.91,197.12,198.25,195.13,191.29,195.95,189.81,183.12,183.98,182.78,173.86,165.73,172.38,167.03,156.95,164.94,169.81,169.98,178.25,185.21,188.78,188.78,194.37,192.56,192.35,195.57,201.75,197.74,197.56,195.78,199.07,197.7,205.8,203.84,203.67,211.36,209.16,204.77,206.62,206.79,203.91,200.69,203.19,208.51,202.26,189.98,200.58,190.19,185.45,190.77,190.77,181.44,185.18,190.6,186.24,179.55,181.89,187.99,188.51,193.58,192.35,195.09,198.49,187.75,175.61,175.27,172.14,167.14,168.58,173.21,169.47,170.39,174.65,173.34,173.96,180.31,180.41,183.36,185.69,190.5,188.13,189.57,185.56,189.26,185.11,169.85,171.53,172.38,172.69,174.17,174.44,174.44,178.46,176.98,174.2,179.21,179.38,181.51,180.21,175.81,175.47,171.15,174.48,174.89,170.46,169.16,165.76,166.55,166.66,168.06,164.53,160.24,160.1,155.23,155.37,158.46,156.71,153.69,153.69,155.88,158.25,159.59,160.34,155.06,156.71,158.25,158.87,162.26,165.63,160.1,160.41,159.28,157.5,157.67,161.82,165.69,164.36,166.83,164.56,165.04,167.55,169.74,170.26,172.14,168.64,165.11,165.52,165.97,162.98,162.71,150.15,149.33,150.12,147.48,146.79,146.59,150.09,148.89,147.86,147.99,147.58,147.58,146.21,145.8,138.15,136.71,135.85,134.41,131.7,133.41,134.13,132.76,134.44,133.93,135.13,135.95,134.13,132.35,131.25,131.56,132.59,131.53,133.45,133.52,129.98,127.75,125.52,122.54,118.11,112.49,115.57,114.68,119.25,119.93,116.36,117.63,115.03,114.99,109.13,111.97,111.01,106.76,111.22,112.8,121.27,120.99,117.74,119.62,120.93,119.86,117.6,111.9,114.89,115.2,120.14,121.44,118.08,122.71,120.72,120.72,120.24,123.53,123.5,127.31,125.35,127.89,131.53,121.54,121.54,119.01,115.4,117.22,116.71,117.32,115.64,112.01,112.08,114.17,108.16,106,103.98,99.45,99.45,105.11,108.23,111.08,112.32,114.85,108.2,115.61,117.67,112.9,117.67,119.25,119.31,116.16,115.78,115.4,118.49,122.5,122.5,118.15,117.7,129.74,134.44,132.76,131.05,135.85,134.07,134.85,133.45,134.2,138.18,136.95,136.47,136.88,139.59,140.14,139.66,134.13,134.13,134.82,133.79,133.21,135.27,136.05,135.78,133.04,131.53,132.28,134.07,133.55,130.6,128.89,129.47,132.11,132.8,132.42,133.55,138.56,137.22,138.49,135.75,141.78,136.74,135.16,135.95,133.55,132.11,136.05,141.1,140.62,145.56,146.21,147.65,147.24,144.12,144.67,145.69,147.48,146.52,149.98,150.57,150.77,150.77,150.22,150.36,152.52,152.49,153.21,151.77,151.18,148.82,149.91,150.81,147.89,144.25,142.64,140.45,139.97,134.1,137.26,142.37,142.92,146.48,138.42,141.58,138.9,137.02,135.51,135.51,133.83,135.06,136.36,132.73,133.04,138.66,139.25,141.96,142.4,147.99,150.09,142.37,142.88,141.44,138.94,145.15,145.9,148.23,147.38,145.21,144.01,149.5,153.31,154.07,156.71,153.21,153.24,153.24,150.87,149.06,150.84,153.41,155.33,159.55,158.77,157.84,158.56,165.25,164.01,174.03,175.06,178.87,174.34,174.07,173.83,174.03,169.37,166.28,163.12,155.95,158.94,160.14,164.19,161.75,159.38,164.87,160.24,161.78,159.97,161.58,160.31,160.65,161.34,154.79,156.47,156.12,157.46,162.3,164.73,164.73,163.33,169.85,172.73,171.87,173.79,172.18,176.88,175.81,176.16,174.68,175.64,178.7,177.29,174.82,177.56,175.51,178.15,178.9,169.57,171.18,171.6,169.67,170.29,174.55,173.76,169.16,174.41,174.99,177.53,178.18,181.51,176.88,178.87,177.29,180.58,178.32,173.34,188.92,191.15,195.37,190.46,189.4,186.14,190.26,191.22,191.7,191.49,191.9,192.21,194.13,193.55,195.95,195.4,212.9,213.89,209.06,204.63,193.62,191.9,199.93,197.5,199.97,199.97,198.63,194.51,189.85,192.42,191.56,194.17,194.17,194.24,202.54,207.07,205.39,205.69,208.54,207.14,208.13,212.04,209.54,210.98,210.98,210.33,209.85,209.02,209.4,213.38,209.98,205.45,211.39,211.25,212.59,210.87,212.04,213.89,212.45,216.84,215.61,215.61,216.81,219.18,219.18,212.69,202.57,206.48,205.21,206.69,198.94,204.87,216.16,218.87,216.78,211.7,215.85,221.1,224.25,231.11,229.33,229.33,223.53,231.25,227.79,220.48,209.54,201.92,205.18,195.54,199.38,206.38,199.11,207.62,202.85,198.25,178.63,192.69,180.07,154.75,174.58,139.04,153.89,134.41,137.87,130.33,137.8,154.85,153.45,168.78,154.55,162.26,157.19,148.54,148.34,145.04,158.32,163.16,176.54,170.12,170.12,171.11,180,172.8,179.18,182.5,173.69,165.8,178.77,174.61,177.5,175.06,172.97,186.42,170.43,160.86,163.22,167.58,173.24,175.81,184.6,185.28,179.52,176.64,186.72,178.52,186.48,190.29,195.13,188.75,186.59,186.59,189.16,193.48,187.55,192.73,191.05,191.39,198.32,199.42,206.48,205.49,205.11,205.35,190.09,194,195.71,200.82,205.83,207.14,209.09,210.19,208.71,205.73,205.76,200.27,202.61,207.38,204.73,209.26,209.26,217.7,213.31,215.33,217.8,214.72,211.01,214.55,213.04,213.86,213.72,218.63,218.9,220.31,218.28,207.96,216.16,213.72,216.98,220.99,220.69,223.02,222.47,222.54,218.22,218.08,223.81,221.13,228.13,223.22,231.97,229.64,227.89,225.97,218.83,213.62,218.66,219.73,218.73,212.8,216.36,211.32,212.32,223.26,210.84,209.13,209.13,190.84,189.37,189.09,188.68,193.69,196.23,193.72,193.28,192.62,196.64,198.59,196.4,198.25,199.76,203.64,204.63,203.95,208.06,199.69,207.89,207.2,209.67,214.75,217.12,221.89,221.92,219.49,217.87,216.12,212.86,213.58,213.07,211.66,209.09,204.15,201.82,196.64,204.12,203.19,206.96,212.11,222.5,239.97,241.96,244.6,238.04,244.12,239.45,249.78,255.51,255.13,259.73,265.01,263.19,276.16,284.56,278.35,278.35,283.57,282.95,289.09,292.59,295.37,304.77,305.8,307.89,301.27,301.51,302.92,303.6,303.5,303.77,300.17,295.33,296.43,293.79,288.27,292.73,292.73,291.15,289.09,298.39,296.05,298.01,307.38,311.6,324.39,327.82,336.05,343.09,336.36,362.95,353.83,353.83,374.68,369.95,370.39,364.77,370.91,362.02,338.18,347,331.66,347.2,355.37,342.61,354.17,345.49,364.29,361.51,363.22,387.65,400.34,400.34,406,396.95,389.13,409.81,395.3,398.42,421.3,390.84,405.45,419.38,403.09,396.02,371.32,389.19,362.54,391.84,386.55,402.02,392.08,394.1,406.52,411.32,392.04,394.03,409.37,399.25,415.44,410.7,441.3,431.25,434.85,458.32,485.49,485.49,490.74,478.7,477.32,478.04,476.54,463.12,463.46,460.17,461.1,458.76,449.02,441.13,463.29,451.97,462.64,471.01,469.23,465.49,464.46,455.27,455.75,441.58,446.96,451.9,456.09,427.75,423.84,394.1,411.39,428.23,423.91,417.87,428.13,447.03,441.37,461.68,471.7,469.64,472.8,473.86,473.86,474.13,476.88,467.86,479.76,476.74,466.07,461.92,470.53,469.37,476.95,475.61,469.91,471.08,450.19,456.43,457.77,464.84,474.31,467.2,483.67,486.86,488.51,473.24,473.96,473.96,469.23,462.68,454.65,462.78,469.3,467.55,465.35,456.95,439.73,441.23,452.73,473.41,470.6,474.89,475.06,462.78,470.7,471.7,480.03,487.17,487.68,489.74,488.06,489.37,487.14,473.62,462.5,443.29,445.63,451.77,441.85,436.95,443.22,436.36,451.08,450.91,455.64,454.51,468.44,466.72,463.57,457.84,461.23,465.97,465.97,468.23,458.18,463.12,469.43,478.35,480.75,484.49,494.31,483.02,464.94,463.74,473.76,484.08,486.86,489.67,455.88,440.03,441.61,442.98,429.5,439.35,434.03,438.7,433,437.39,434.85,439.83,453.07,451.42,457.22,461.75,459.62,457.43,466.31,465.73,452.83,453.38,466.62,468.78,478.59,484.43,489.71,515.03,525.87,524.73,536.16,515.95,527.96,537.98,536.09,541.54,535.09,544.56,514.68,506.17,510.87,511.18,511.18,491.56,518.77,504.94,520.31,502.54,500.27,505.59,538.22,539.59,523.67,523.95,504.63,506.79,527.14,503.26,501.37,497.46,519.45,522.54,533.41,533.41,558.22,547.65,552.25,541.96,539.83,548.64,543.26,527.41,536.33,517.36,513.17,522.98,547.34,539.21,572.9,572.9,522.68,490.81,477.36,463.33,477.84,456.23,465.11,446.48,454.37,474.03,475.51,482.88,468.3,465.08,467,475.99,494.68,479.49,454.51,452.35,479.73,483.57,468.16,457.46,457.46,446.86,438.63,457.7,465.59,460.38,444.63,456.88,448.16,431.36,408.99,425.9,441.23,428.71,424.15,412.11,426.79,447.62,452.8,463.6,460.38,464.77,450.84,475.44,470.19,472.25,485.21,465.87,452.14,437.08,444.05,417.53,409.37,419.9,411.53,398.77,393,400.89,388.89,388.89,394.07,401.58,404.43,396.88,386.96,392.69,373.65,373.28,393.24,378.56,387.55,390.39,407.58,389.26,385.93,362.78,367.68,356.5,366.24,383.74,379.01,400.82,381.96,379.9,365.21,377.12,365.66,372.32,394.75,409.88,409.88,402.37,392.66,402.5,394.37,394.51,396.81,385.8,367.89,349.5,330.43,331.46,334.2,307.34,308.16,308.16,326.48,322.26,320,334,334.85,325.97,315.4,312.11,295.95,295.95,295.03,296.95,311.32,312.83,304.01,304.39,305.59,314.48,324.08,319.52,336.98,350.7,356.23,348.78,346.48,339.31,354.92,360.75,363.57,365.01,360.17,373.96,380.99,376.05,369.91,341.89,360.38,362.02,378.66,376.6,372.18,363.64,371.42,358.94,345.83,349.67,348.13,360.21,338.94,331.18,324.25,322.71,314.96,313,313,309.74,315.4,321.75,331.08,330.36,310.09,310.94,305.04,304.87,307.79,302.3,298.76,291.73,289.16,284.53,288.68,295.03,289.61,281.06,295.88,306.72,306.07,302.3,283.36,271.66,261.75,260.75,272.45,256.67,255.27,258.08,265.04,269.85,282.74,291.39,300.27,302.37,296.88,307.79,302.88,308.03,301.06,296.05,314.58,326.04,334.34,323.77,359.49,379.18,369.16,378.94,357.53,358.32,359.18,360.69,367.2,369.37,369.37,363.02,354.96,354.2,375.99,367.1,366.07,365.11,359.21,364.01,372.59,368.23,375.2,383.77,376.12,358.7,359.28,356.74,355.06,363.29,334.82,333.52,333.52,327.07,323.26,333.24,334.07,334.07,331.84,340.69,335.92,357.7,365.32,370.63,377.56,378.04,377.26,377.26,375.33,376.33,364.19,376.16,391.63,387.62,390.91,396.5,385.93,371.18,382.47,408.27,426.28,411.6,403.74,413.45,397.77,398.22,393.72,399.76,406.31,409.81,395.85,396.02,396.02,381.75,378.77,387.34,381.85,384.46,398.46,402.26,406.35,408.1,406.66,399.21,407.03,401.51,392.42,397.39,412.83,406.45,421.37,420.58,425.52,413.04,407.75,421.2,410.05,407.79,399.31,411.15,418.9,421.37,419.62,412.08,402.47,392.62,392.62,399.66,399.25,388.2,389.26,387.31,383.5,381.72,378.52,392.42,389.23,389.74,379.45,378.42,383.12,387.75,387.48,384.77,388.64,385.76,398.15,397.08,390.53,395.92,396.09,398.25,415.47,414.82,431.22,445.69,435.51,434.13,427.07,417.6,447.58,466.76,466.76,468.51,457.29,462.54,461.85,458.76,459.49,463.16,467.24,466.96,480.31,486.42,484.29,480.65,476.6,476.6,475.2,468.85,476.57,466.79,479.59,502.74,494.1,494.79,495.85,499.04,499.04,488.03,481.58,478.8,482.2,471.9,476.47,489.37,489.67,499.14,495.75,486.38,459.83,467.92,474.61,480.48,476.91,501.34,521.2,520.03,523.6,505.42,507.07,499.69,515.88,507.75,497.98,496.09,476.26,486.76,480.55,474.27,472.01,489.4,510.36,507.2,507.72,488.92,495.23,498.87,514.51,517.84,524.05,528.27,528.27,526.96,525.49,508.51,506.11,503.29,493.89,495.99,495.95,474.27,481.2,472.42,469.88,463.77,467.14,468.58,459.97,463.33,474.17,474.96,478.59,469.02,477.87,477.8,481.27,480.79,485.08,487.75,497.43,484.19,483.7,489.61,485.25,461.17,460.1,460.48,462.78,446.35,448.85,450.43,449.5,454.03,464.12,475.16,479.42,481.51,486.24,494.79,491.15,516.91,513.69,528.58,533,531.08,509.74,523.4,512.01,512.8,512.8,515.75,517.36,507.92,512.38,513.83,520.03,508.64,501.37,496.4,509.06,506.76,532.21,539.35,538.56,554.85,555.57,550.12,556.88,538.32,553.65,555.92,555.92,563.57,563.33,559.59,555.99,529.57,519.55,512.21,511.15,519.93,518.11,513.93,521.27,518.87,518.87,527.48,526.14,550.05,576.12,577.36,573.07,597.39,592.21,572.56,577.98,570.29,563.64,572.8,576.95,586.93,578.73,586.28,596.54,637.53,636.5,618.56,638.73,643.77,684.63,684.63,648.85,652.93,685.18,676.36,698.28,695.92,677.67,691.66,721.27,718.66,711.46,727.86,729.37,705.18,690.81,703.05,688.03,688.68,681.48,688.61,690.7,703.46,723.16,721.27,715.13,708.99,713.55,707.48,707.48,715.92,707.07,711.42,697.74,713.04,717.12,721.82,717.84,730.63,713.07,705.59,718.63,685.73,666.62,651.01,649.95,662.92,672.59,677.53,697.7,704.15,681.48,665.49,678.94,700.14,716.5,711.22,711.36,707.82,719.49,708.85,719.79,746.11,734.24,727.55,754.55,754.03,748.37,747.68,757.77,757.77,759.25,751.46,742.85,737.84,734.85,728.03,766.28,760.72,760.65,782.71,788.92,815.27,814.92,813.14,833.14,850.19,850.19,823.29,807.58,788.47,803.67,796.47,797.7,809.57,814.44,826.28,834.68,834.68,832.21,844.91,862.68,874.68,827.65,834.99,842.37,843.36,754.96,746.66,721.3,766.62,753.52,708.51,694.07,708.3,705.21,674.92,727.96,673.41,623.7,623.98,628.85,612.38,653.69,655.85,662.4,688.85,691.7,726.69,713.21,723.64,707.24,717.39,686.79,695.27,673.17,671.6,661.72,662.02,676.71,676.71,629.06,625.66,618.32,599.49,609.09,610.81,637.87,628.51,646.55,643.5,646.96,638.56,674.82,659.21,665.66,675.06,676.88,719.07,702.98,693.14,676.5,690.05,684.7,692.86,686.55,689.13,703.46,699.69,703.46,733.76,655.3,633.24,628.61,639.31,632.8,627.79,626.76,630.36,639.86,635.81,652.21,635.68,622.92,629.09,623.74,639.73,643.29,665.83,658.77,646.86,640.17,627.07,638.08,579.35,585.69,580.82,584.87,602.92,599.93,598.8,594.17,587.72,587.72,599.35,628.71,628.34,621.48,590.15,593.55,589.57,576.91,587.07,580.03,580.96,581.17,584.36,567.58,553.83,561.2,574.48,577.6,577.6,574.79,572.32,561.37,557.91,562.16,583.4,608.85,610.02,607.17,607.17,588.85,586.14,595.71,611.94,639.73,658.83,658.83,661.65,670.7,654.2,640.65,598.87,592.97,601.3,623.4,618.7,613.38,612.56,619.79,627.1,617.5,630.05,628.47,620.55,632.14,580.45,580.45,590.05,597.12,603.81,589.98,578.28,567.89,578.08,537.36,542.26,521.89,524.43,532.83,519.86,534.07,514.55,504.25,511.36,514.41,534,533.31,526.62,529.88,529.61,521.85,531.56,527.07,516.91,506.62,497.63,497.84,499.69,506.86,464.87,435.51,455.75,442.4,513.65,474.24,497.22,495.81,498.97,474.07,471.56,471.56,465.04,474.44,492.56,515.16,519.9,517.29,513.04,517.02,511.01,532.08,530.39,524.97,534.51,535.16,533.83,576.3,593.58,597.39,599.49,567.99,569.26,568.54,556.54,550.67,540.34,540.34,555.16,554.34,547.1,537.74,539.52,554.85,555.51,563.26,572.01,582.47,596.12,592.76,600.34,585.21,605.66,597.22,592.93,592.93,581.34,589.91,618.11,628.03,629.57,628.51,628.03,630.39,651.84,655.4,655.4,654.48,668.92,670.29,679.35,679.01,676.16,683.67,668.3,660.45,653.31,660.75,641.99,641.54,645.35,637.02,652.73,646.35,649.71,617.7,617.46,627.17,614.58,611.11,628.3,634.2,632.52,646.48,651.9,645.76,554.92,560.99,556.5,552.18,548.34,557.43,555.71,564.36,563.95,566.96,551.49,551.49,540.55,536.02,542.85,558.32,555.92,560.89,560.62,583.7,575.64,586.38,595.33,611.08,650.98,652.14,687.89,689.09,691.05,684.73,699.55,703.09,702.37,746.96,767.03,746.24,768.13,725.76,746.17,755.75,720.24,752.93,748.51,780.72,781.2,771.84,782.61,775.3,756.64,783.77,784.73,793.58,780.93,808.75,797.77,799.66,815.47,789.67,826.38,801.13,789.26,806.45,784.46,791.53,765.8,775.33,784.6,772.28,806.62,755.51,768.47,792.14,831.77,857.53,857.53,865.35,873.93,910.22,921.54,924.32,919.38,919.93,916.43,943.91,926.62,889.23,896.29,887.96,851.7,869.64,879.62,888.54,892.73,894.61,894.61,898.46,902.4,891.84,881.61,922.37,975.37,1015.47,1002.4,966.18,1033.21,1054,1045.87,1035.64,1094.61,1121.82,1121.82,1091.7,1115.75,1093.62,1105.93,1095.92,1141.37,1155.23,1170.98,1105.73,1126.59,1093.21,1020.93,1042.85,1106.38,1134.03,1128.89,1165.97,1126.55,1217.53,1217.53,1232.01,1266.9,1268.71,1287.75,1281.48,1296.5,1354.89,1288.92,1277.19,1276.78,1205.21,1227.31,1188.78,1114.03,1162.74,1186.55,1204.36,1157.02,1171.63,1187.58,1209.13,1198.87,1225.42,1224.91,1241.13,1282.98,1267.03,1161.41,1156.67,1108.47,1172.52,1213.72,1195.44,1195.44,1209.67,1215.47,1323.22,1364.7,1370.46,1357.56,1357.26,1352.52,1337.56,1361.72,1343.46,1352.76,1384.15,1385.63,1430.67,1388.89,1307.41,1312.49,1353.31,1334.75,1342.64,1409.33,1470.39,1408.71,1493.79,1521.85,1479.25,1497.8,1511.36,1497.84,1418.77,1395.92,1464.32,1466.07,1482.54,1482.54,1560.51,1537.74,1542.64,1543.95,1571.77,1681.13,1717.91,1721.1,1554.07,1688.4,1712.56,1705.01,1895.85,1945.97,2009.54,1949.33,2034.03,2117.02,2117.02,2196.16,2009.88,2020.48,2291.6,2150.39,2382.98,2480.27,2232.97,2068.75,2068.75,2033.58,1902.23,1957.12,2019.42,2066.9,1973.89,2043.57,1987.75,1924.29,1817.02,1803.43,1936.71,1900.24,1930.7,1839.62,1773.21,1634.51,1497.26,1721.34,1741.58,1777.74,1875.2,1832.73,1809.54,1849.54,1791.15,1803.12,1880.45,1833.76,1739.9,1836.4,1764.43,1702.13],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11]},"symbols":{"EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","어플라이드 머티어리얼즈":"AMAT","팔란티어 테크":"PLTR"},"missing":[]},
  "checkedAt": "2026-08-19T23:21:25.533Z",
  "checkedCount": 0
};
