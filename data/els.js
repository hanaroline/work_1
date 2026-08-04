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
  "updatedAt": "2026-08-04T03:50:53.509Z",
  "source": "live",
  "sourceNote": "미래에셋증권 홈페이지 ELS/DLS 캘린더 (청약 진행중)",
  "sourceNoteEn": "Mirae Asset Securities ELS/DLS calendar — currently on offer",
  "products": [
    {
      "code": "KR6MD0008RD8",
      "name": "미래에셋증권(ELS)37993",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponAnnual": 53,
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
      "riskGrade": null,
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
      "code": "KR6MD0008RJ5",
      "name": "미래에셋증권(ELS)37998e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponAnnual": 50.4,
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
      "riskGrade": null,
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
      "code": "KR6MD0008RL1",
      "name": "미래에셋증권(ELS)38000e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "KOSPI200"
      ],
      "couponAnnual": 44.6,
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
      "riskGrade": null,
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
      "code": "KR6MD0008RC0",
      "name": "미래에셋증권(ELS)37992",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponAnnual": 42.3,
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
      "riskGrade": null,
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
      "code": "KR6MD0008RK3",
      "name": "미래에셋증권(ELS)37999e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponAnnual": 40.6,
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
      "riskGrade": null,
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
      "couponAnnual": 40.5,
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
      "riskGrade": null,
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
      "couponAnnual": 34.41,
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
      "riskGrade": null,
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
      "couponAnnual": 33,
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
      "riskGrade": null,
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
      "couponAnnual": 24.2,
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
      "riskGrade": null,
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
      "couponAnnual": 24.2,
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
      "riskGrade": null,
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
      "couponAnnual": 23.5,
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
      "riskGrade": null,
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
      "couponAnnual": 22.2,
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
      "riskGrade": null,
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
      "couponAnnual": 20.5,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 36,
          "barrier": 75
        }
      ],
      "knockIn": null,
      "principalProtection": 0,
      "riskGrade": null,
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
      "couponAnnual": 20.3,
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
      "riskGrade": null,
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
      "couponAnnual": 20,
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
      "riskGrade": null,
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
      "code": "KR6MD0008R47",
      "name": "미래에셋증권(ELS)37984",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponAnnual": 19,
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
      "riskGrade": null,
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
      "code": "KR6MD0008R39",
      "name": "미래에셋증권(ELS)37983",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponAnnual": 17.3,
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
      "riskGrade": null,
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
      "couponAnnual": 13.5,
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
      "riskGrade": null,
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
      "couponAnnual": 13,
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
      "riskGrade": null,
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
      "couponAnnual": 10.71,
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
      "riskGrade": null,
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
      "code": "KR6MD0008S79",
      "name": "미래에셋증권(ELS)38017",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponAnnual": 52,
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
      "riskGrade": null,
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
      "code": "KR6MD0008SB0",
      "name": "미래에셋증권(ELS)38021e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponAnnual": 50,
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
      "riskGrade": null,
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
      "code": "KR6MD0008SA2",
      "name": "미래에셋증권(ELS)38020e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponAnnual": 46,
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
      "riskGrade": null,
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
      "couponAnnual": 42.5,
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
      "riskGrade": null,
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
      "couponAnnual": 42.4,
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
      "riskGrade": null,
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
      "couponAnnual": 37.41,
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
      "riskGrade": null,
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
      "couponAnnual": 33.5,
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
      "riskGrade": null,
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
      "couponAnnual": 27,
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
      "riskGrade": null,
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
      "couponAnnual": 23,
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
      "riskGrade": null,
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
      "couponAnnual": 22,
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
      "riskGrade": null,
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
      "couponAnnual": 21.4,
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
      "riskGrade": null,
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
      "couponAnnual": 21,
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
      "riskGrade": null,
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
      "couponAnnual": 20,
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
      "riskGrade": null,
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
      "code": "KR6MD0008S04",
      "name": "미래에셋증권(ELS)38010",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponAnnual": 19,
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
      "riskGrade": null,
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
      "code": "KR6MD0008RZ1",
      "name": "미래에셋증권(ELS)38009",
      "type": "ELS",
      "shape": "리자드",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponAnnual": 18.4,
      "maturityMonths": 36,
      "schedule": [
        {
          "months": 18,
          "barrier": 80
        },
        {
          "months": 36,
          "barrier": 75
        }
      ],
      "knockIn": null,
      "principalProtection": 0,
      "riskGrade": null,
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
      "couponAnnual": 13,
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
      "riskGrade": null,
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
      "couponAnnual": 8.79,
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
      "riskGrade": null,
      "riskCode": "15",
      "status": "진행중",
      "offerStart": "2026-08-03",
      "offerEnd": "2026-08-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-70-70-70-70-70-70-70-70-70(월지급배리어:65), KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    }
  ]
};
