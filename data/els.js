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
  "updatedAt": "2026-11-03T23:42:43.621Z",
  "checkedAt": "2026-11-03T23:42:43.621Z",
  "checkedCount": 36,
  "source": "live",
  "sourceNote": "미래에셋증권 홈페이지 ELS/DLS 캘린더 (청약 진행중)",
  "sourceNoteEn": "Mirae Asset Securities ELS/DLS calendar — currently on offer",
  "products": [
    {
      "code": "KR6MD00093E0",
      "name": "미래에셋증권(ELS)38241e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 23.1,
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
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093A8",
      "name": "미래에셋증권(ELS)38237e",
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
      "knockIn": 40,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009364",
      "name": "미래에셋증권(ELS)38233",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 18.5,
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
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093B6",
      "name": "미래에셋증권(ELS)38238e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "팔란티어 테크",
        "AMD"
      ],
      "couponRate": 17,
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
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093D2",
      "name": "미래에셋증권(ELS)38240e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "테슬라"
      ],
      "couponRate": 15.1,
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
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009356",
      "name": "미래에셋증권(ELS)38232",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "SK하이닉스"
      ],
      "couponRate": 13.8,
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
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009398",
      "name": "미래에셋증권(ELS)38236e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200",
        "삼성전자"
      ],
      "couponRate": 12.9,
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
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009349",
      "name": "미래에셋증권(ELS)38231",
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
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-70-70-65, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009380",
      "name": "미래에셋증권(ELS)38235e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "HSCEI",
        "KOSPI200",
        "S&P500"
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
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093C4",
      "name": "미래에셋증권(ELS)38239e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 12,
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
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 25, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009323",
      "name": "미래에셋증권(ELS)38229",
      "type": "ELS",
      "shape": "월지급식",
      "underlyings": [
        "Nikkei225",
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
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65(월지급배리어:60), KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009331",
      "name": "미래에셋증권(ELS)38230",
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
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009315",
      "name": "미래에셋증권(ELS)38228",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
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
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009307",
      "name": "미래에셋증권(ELS)38227",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "KOSPI200"
      ],
      "couponRate": 9.8,
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
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009372",
      "name": "미래에셋증권(ELS)38234e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "S&P500"
      ],
      "couponRate": 9.6,
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
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092Z7",
      "name": "미래에셋증권(ELS)38226",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "KOSPI200"
      ],
      "couponRate": 9.1,
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
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00092Y0",
      "name": "미래에셋증권(ELS)38225",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
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
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093F7",
      "name": "미래에셋증권(ELB)4113",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 6,
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
      "status": "청약 마지막날",
      "offerStart": "2026-10-26",
      "offerEnd": "2026-11-04",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85(월지급배리어:70), 원금지급형, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009406",
      "name": "미래에셋증권(ELS)38253e",
      "type": "ELS",
      "shape": "주식지급형 스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "팔란티어 테크"
      ],
      "couponRate": 22,
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 30, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009448",
      "name": "미래에셋증권(ELS)38257e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "AMD"
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009430",
      "name": "미래에셋증권(ELS)38256e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "팔란티어 테크",
        "테슬라"
      ],
      "couponRate": 19,
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093X0",
      "name": "미래에셋증권(ELS)38250",
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
      "knockIn": 35,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093Z5",
      "name": "미래에셋증권(ELS)38252e",
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009422",
      "name": "미래에셋증권(ELS)38255e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "마이크론 테크놀로지",
        "테슬라"
      ],
      "couponRate": 17,
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-80-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009414",
      "name": "미래에셋증권(ELS)38254e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "어플라이드 머티어리얼즈",
        "AMD"
      ],
      "couponRate": 16,
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "75-75-75-75-70-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093W2",
      "name": "미래에셋증권(ELS)38249",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
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
      "knockIn": 45,
      "principalProtection": 0,
      "riskGrade": 1,
      "riskLabel": "매우높은위험",
      "riskCode": "11",
      "status": "진행중",
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093V4",
      "name": "미래에셋증권(ELS)38248",
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "70-70-70-70-70-65, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093T8",
      "name": "미래에셋증권(ELS)38247",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "EuroStoxx50",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 11.8,
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00094G3",
      "name": "미래에셋증권(ELS)38263",
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
      "offerStart": "2026-11-04",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-85-80-75-70, KI 50, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093S0",
      "name": "미래에셋증권(ELS)38246",
      "type": "ELS",
      "shape": "스텝다운",
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-80-80-75-70, KI 40, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093R2",
      "name": "미래에셋증권(ELS)38245",
      "type": "ELS",
      "shape": "스텝다운 노낙인",
      "underlyings": [
        "Nikkei225",
        "EuroStoxx50",
        "KOSPI200"
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "80-75-75-70-65-60, KI -, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093Y8",
      "name": "미래에셋증권(ELS)38251e",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "HSCEI",
        "S&P500"
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093Q4",
      "name": "미래에셋증권(ELS)38244",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "Nikkei225",
        "KOSPI200",
        "S&P500"
      ],
      "couponRate": 9.5,
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 35, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093P6",
      "name": "미래에셋증권(ELS)38243",
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "90-85-80-75-70-65, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD00093N1",
      "name": "미래에셋증권(ELS)38242",
      "type": "ELS",
      "shape": "스텝다운",
      "underlyings": [
        "KOSPI200"
      ],
      "couponRate": 8.7,
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-80-75-70, KI 45, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    },
    {
      "code": "KR6MD0009455",
      "name": "미래에셋증권(ELB)4115",
      "type": "ELB",
      "shape": "하이파이브 월지급식",
      "underlyings": [
        "삼성전자",
        "SK하이닉스"
      ],
      "couponRate": 6,
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
      "offerStart": "2026-11-02",
      "offerEnd": "2026-11-12",
      "issueDate": null,
      "minAmount": null,
      "structureDesc": "85-85-85-85-85-85(월지급배리어:70), 원금지급형, 원화",
      "url": "https://securities.miraeasset.com/hks/hks4022/n01.do"
    }
  ],
  "history": {"updatedAt":"2026-11-03T23:42:45.186Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827,20260828,20260831,20260901,20260902,20260903,20260904,20260907,20260908,20260909,20260910,20260911,20260914,20260915,20260916,20260917,20260918,20260921,20260922,20260923,20260924,20260925,20260928,20260929,20260930,20261001,20261002,20261005,20261006,20261007,20261008,20261009,20261012,20261013,20261014,20261015,20261016,20261019,20261020,20261021,20261022,20261023,20261026,20261027,20261028,20261029,20261030,20261102,20261103],"series":{"AMD":[null,null,100,106.1,106.71,105.79,96.04,101.98,103.51,106.25,116.92,128.96,132.77,136.28,132.47,134.15,134.15,133.69,134.6,136.13,135.82,127.9,130.03,132.32,144.05,145.73,157.62,157.62,162.8,160.67,160.82,165.55,162.5,166.92,175.46,174.85,176.83,176.52,176.52,183.99,176.07,176.68,172.87,172.87,174.24,174.24,171.34,172.56,175.15,174.39,170.73,164.02,161.28,161.28,149.7,150.61,148.93,148.63,151.07,159.15,157.77,160.37,162.65,161.74,158.08,183.84,187.2,186.59,207.77,202.59,206.71,204.57,207.01,205.64,202.13,202.74,197.71,200.15,200.15,213.41,217.68,218.29,215.24,231.71,220.43,228.05,211.89,198.63,198.78,198.93,201.52,203.2,212.04,217.68,214.94,213.11,208.08,205.64,219.51,210.67,214.94,210.21,208.84,208.84,208.69,208.99,214.18,221.8,223.17,215.85,216.01,202.29,206.1,199.7,199.7,194.51,187.65,187.65,194.97,197.41,195.73,199.85,198.17,200.15,205.64,204.42,207.62,202.74,207.62,157.32,158.38,153.96,155.34,153.05,155.18,164.48,168.75,171.65,174.09,194.36,170.73,171.95,173.93,168.29,166.01,166.01,167.38,167.68,167.68,169.51,170.58,166.62,166.16,171.34,183.38,188.72,196.65,187.2,184.3,182.32,179.42,175.3,174.39,181.86,192.68,213.11,219.21,216.01,214.63,204.27,201.68,192.07,190.24,185.21,185.21,201.07,198.48,203.66,210.52,211.74,217.84,206.25,212.2,210.37,205.49,206.55,210.37,211.59,215.85,215.09,225,215.24,212.65,207.47,208.99,203.81,201.83,200,204.73,199.85,195.58,184.76,186.43,194.51,198.48,192.53,188.11,188.57,183.69,185.52,190.24,190.55,189.48,186.43,185.21,193.14,198.17,201.07,201.07,196.95,196.04,192.53,186.74,191.31,187.5,186.28,186.89,190.85,199.39,200,209.45,204.42,202.74,192.23,189.79,194.21,194.21,194.36,193.75,204.57,202.9,203.35,201.68,205.34,208.84,211.59,216.46,216.77,217.38,215.85,214.48,212.65,210.52,214.94,217.23,187.96,183.08,180.49,166.01,167.53,164.63,165.4,169.51,181.86,183.69,178.51,169.51,171.65,169.05,169.51,168.75,171.49,173.48,172.87,173.78,173.32,173.32,173.48,176.07,170.27,165.09,166.01,163.57,152.9,151.07,152.44,153.05,151.52,154.88,150.91,154.12,154.42,156.86,167.38,166.92,167.38,166.01,160.67,160.67,159.45,160.52,160.82,156.71,167.38,176.07,184.76,181.1,187.2,180.18,182.32,185.06,183.23,183.23,181.55,185.67,190.09,191.92,192.84,197.26,193.75,189.18,197.41,203.05,196.19,209.45,201.98,189.79,176.37,177.59,176.83,171.04,172.41,178.05,179.57,185.98,185.82,180.18,180.18,183.23,178.66,180.49,183.99,189.33,191.01,184.6,181.4,180.03,181.55,179.27,186.59,182.47,178.35,175.61,177.44,173.17,174.7,174.85,174.24,169.36,171.65,166.31,162.04,159.15,152.44,149.54,153.2,153.2,145.27,145.58,148.93,152.74,146.49,145.27,152.13,149.7,153.66,151.37,153.81,160.37,157.93,154.12,152.29,153.05,153.81,148.02,168.29,169.36,165.85,169.66,167.23,166.62,171.95,176.68,176.98,182.16,184.91,182.16,186.43,189.79,195.43,195.43,198.17,198.02,197.87,199.7,204.42,206.4,206.4,203.66,210.67,209.3,219.51,226.37,226.37,238.87,226.98,232.47,239.79,241.62,248.78,247.71,249.09,260.82,254.42,251.83,238.57,240.85,230.34,236.28,228.2,233.38,228.51,231.1,228.66,228.66,236.28,249.39,253.2,252.29,248.02,252.44,248.02,252.74,257.16,256.86,254.73,251.52,253.96,246.8,244.66,279.73,288.72,296.04,279.42,281.71,286.43,281.86,296.19,298.17,298.48,291.16,290.55,300.76,305.18,300.3,294.66,301.37,304.57,310.98,318.6,339.79,365.55,385.06,381.86,384.15,379.42,383.69,383.69,427.74,434.6,424.39,417.38,455.64,458.84,491.01,464.63,498.78,494.36,486.74,475.76,475.3,472.87,497.1,496.49,490.7,496.8,470.88,478.96,442.38,433.38,423.48,416.92,403.35,415.24,381.1,385.67,401.52,400.3,429.57,416.16,405.79,360.67,381.55,382.47,347.41,293.75,268.75,256.86,262.2,277.59,308.23,308.38,303.35,315.24,332.93,323.17,320.58,290.09,298.93,317.23,327.59,314.94,291.31,292.84,285.52,285.52,295.43,306.1,320.88,325.3,326.68,324.7,361.43,321.95,321.95,324.7,296.65,304.73,304.57,312.2,302.74,303.35,287.04,297.26,276.83,273.48,258.08,253.81,253.81,272.87,266.62,271.65,281.4,287.04,259.91,289.63,313.57,316.31,307.77,300.91,308.99,308.38,310.67,300.76,308.69,316.62,316.62,301.22,301.83,317.84,334.3,307.62,293.45,351.98,372.1,373.63,367.84,355.34,354.57,345.58,351.37,350,347.87,348.32,352.59,360.98,360.98,365.09,365.09,364.63,371.34,376.68,369.05,357.93,358.69,360.98,356.25,358.23,341.62,336.59,335.52,350,358.08,356.4,347.87,355.03,354.42,396.34,391.77,425.15,401.98,395.88,391.62,379.42,382.01,389.02,401.83,407.77,442.38,443.45,441.77,434.91,415.24,424.24,423.63,424.54,416.62,425.76,419.05,421.95,421.95,429.57,426.37,433.84,421.65,425,422.1,421.19,408.69,431.25,430.18,417.99,406.4,412.96,414.79,426.22,400,416.46,420.43,426.98,419.21,406.71,416.92,417.84,401.83,403.05,403.05,442.84,428.2,427.29,417.84,420.43,450.76,449.7,485.06,494.05,506.55,494.05,490.55,478.51,462.8,445.12,464.18,464.94,457.47,443.6,446.04,439.94,456.1,468.6,462.96,475.61,476.22,475.46,475.46,480.18,488.41,505.34,515.09,503.96,506.25,524.24,516.01,512.2,503.05,495.58,500.76,510.52,519.97,513.26,518.6,510.37,516.31,464.18,455.18,448.78,426.68,439.94,444.97,517.07,521.19,494.36,489.48,460.98,452.29,475.3,479.88,468.29,483.23,486.28,450.3,461.59,460.37,469.21,479.42,479.42,479.42,471.04,471.8,480.18,465.85,464.94,460.82,453.66,460.52,467.84,469.97,472.41,463.72,461.74,458.08,467.07,450,450.3,449.24,437.8,441.92,438.41,431.55,437.2,442.23,441.01,430.34,433.84,432.62,453.51,465.4,468.29,469.66,474.7,472.1,488.26,480.34,478.05,483.54,498.63,513.57,503.51,505.03,517.23,531.86,553.2,551.07,547.71,553.05,553.2,553.51,559.6,571.95,584.6,587.8,607.93,629.42,624.7,602.44,596.8,606.55,594.36,600.76,600.76,596.8,590.4,592.99,605.03,603.96,604.12,593.45,601.22,601.68,649.24,627.29,645.58,651.98,644.82,652.9,673.02,692.99,709.45,709.45,710.82,703.96,693.9,699.09,748.48,740.85,737.65,735.52,729.12,746.49,734.3,743.14,734.91,740.09,758.69,776.37,776.37,778.2,783.99,788.26,767.53,750.91,770.27,724.24,743.6,716.46,732.01,753.81,759.76,751.83,758.08,796.65,820.12,821.49,831.25,843.14,843.14,867.23,897.87,873.02,812.2,748.78,725.15,723.93,670.88,693.29,723.48,712.65,763.87,733.38,740.7,659.6,691.77,696.65,594.66,669.21,590.09,638.41,596.34,607.01,603.81,634.76,704.57,680.34,724.09,710.06,729.57,693.29,665.55,678.2,649.24,724.39,725,743.75,737.5,737.5,776.52,837.35,838.26,868.14,862.8,868.45,806.71,852.44,852.13,856.4,861.13,846.19,817.99,798.63,760.37,801.22,795.58,795.12,791.92,810.82,849.7,819.51,795.43,830.95,826.22,832.16,845.58,859.6,833.08,841.01,841.01,810.82,803.96,788.72,820.12,817.53,816.16,803.81,802.29,809.45,807.47,859.6,875.61,805.34,815.55,833.54,830.18,831.55,823.78,826.68,834.76,823.02,798.63,791.62,763.72,766.46,801.98,801.52,797.87,797.87,814.02,806.86,814.48,872.87,851.83,816.92,834.15,843.6,837.2,839.02,875.91,868.9,941.92,908.08,1057.93,1051.37,1030.64,1159.91,1192.07,1180.34,1183.99,1296.34,1300.46,1321.8,1293.45,1253.66,1171.95,1259.3,1247.56,1239.33,1256.4,1244.82,1236.13,1261.74,1277.59,1266.46,1316.31,1311.28,1277.44,1304.12,1384.45,1405.18,1375.3,1258.23,1250.15,1250.15,1199.54,1248.63,1203.96,1163.72,1187.5,1203.2,1168.6,1166.92,1142.23,1188.11,1184.45,1139.18,1155.79,1189.94,1211.59,1246.49,1249.85,1293.6,1246.95,1313.26,1287.8,1321.49,1318.75,1266.77,1284.91,1300,1283.69,1267.23,1267.84,1250,1243.29,1207.32,1210.67,1249.39,1253.51,1202.44,1164.63,1189.33,1147.71,1138.72,1167.38,1240.09,1265.24,1309.15,1267.07,1188.87,1239.02,1247.56,1241.31,1276.37,1270.73,1258.23,1303.96,1290.24,1300.46,1296.8,1321.8,1321.8,1329.12,1412.5,1412.04,1428.96,1407.16,1433.54,1433.99,1416.46,1369.36,1397.26,1397.1,1444.82,1480.49,1476.37,1476.22,1462.2,1421.19,1420.12,1395.58,1399.54,1399.54,1396.34,1381.4,1406.86,1398.02,1407.01,1414.18,1376.98,1450.61,1441.77,1482.47,1453.66,1399.09,1383.99,1344.66,1344.66,1363.57,1352.9,1395.27,1414.48,1434.91,1443.75,1354.27,1334.15,1305.49,1336.28,1354.57,1339.79,1339.02,1339.94,1394.36,1385.82,1407.77,1412.5,1429.42,1429.42,1394.21,1371.04,1351.22,1365.55,1301.37,1291.77,1325.3,1256.4,1288.26,1316.92,1282.47,1232.62,1185.21,1196.95,1127.44,1197.1,1181.71,1238.26,1235.52,1257.62,1261.43,1259.6,1190.85,1205.18,1224.09,1194.82,1165.85,1161.89,1180.03,1175.91,1158.54,1196.65,1236.13,1236.13,1241.31,1241.46,1253.05,1270.58,1261.59,1197.87,1222.41,1197.41,1265.4,1252.29,1236.43,1208.38,1244.05,1205.18,1261.59,1301.98,1298.93,1280.79,1279.12,1244.21,1197.41,1198.32,1186.43,1187.35,1201.37,1158.38,1171.19,1137.8,1114.18,1137.04,1137.96,1134.76,1162.04,1189.94,1176.37,1180.49,1186.89,1194.21,1195.43,1220.73,1220.73,1231.86,1249.54,1223.78,1243.6,1240.09,1233.08,1218.9,1243.29,1239.48,1243.14,1226.68,1221.19,1289.02,1290.4,1258.99,1274.09,1277.74,1312.5,1305.18,1327.44,1364.63,1431.86,1422.41,1443.6,1443.6,1440.09,1380.18,1367.99,1385.67,1384.3,1375.91,1357.47,1325.15,1309.3,1319.82,1327.9,1362.96,1390.4,1404.73,1399.7,1387.65,1492.84,1569.36,1618.75,1655.95,1715.85,1810.52,1712.65,1678.51,1639.94,1623.17,1641.46,1623.48,1685.21,1638.41,1639.63,1576.83,1580.79,1595.27,1658.08,1641.01,1650.91,1635.21,1698.17,1696.95,1687.8,1676.68,1664.63,1675.61,1675.61,1663.87,1618.45,1618.14,1603.66,1597.56,1611.74,1609.76,1619.21,1583.54,1548.02,1567.38,1591.16,1618.14,1612.8,1648.78,1547.56,1529.73,1568.6,1561.74,1529.57,1551.98,1579.88,1622.71,1601.52,1595.73,1601.22,1664.02,1707.16,1709.15,1774.85,1773.32,1774.24,1819.05,1826.52,1865.24,1873.93,1864.02,1846.95,1832.77,1908.99,1945.58,1989.79,2096.04,2078.35,2289.02,2270.12,2132.16,2225.76,2254.42,2233.08,2323.93,2307.01,2363.11,2369.05,2325,2285.37,2405.49,2405.49,2359.91,2468.14,2414.18,2273.02,2296.95,2195.27,2119.82,2208.08,2214.02,2105.18,2112.04,2039.63,2067.07,2233.23,2113.41,2099.85,2070.12,2198.93,2193.29,2227.74,2227.74,2353.05,2334.6,2260.06,2212.65,2193.6,2290.24,2201.52,2075.46,2076.68,2012.2,2012.2,2093.14,2095.58,2023.48,2086.59,2086.59,2011.13,1955.34,1858.08,1811.13,1776.37,1694.05,1687.65,1564.02,1604.27,1741.62,1780.18,1871.34,1830.49,1884.15,1885.21,1954.73,2025.15,1917.23,1725.3,1741.92,1851.68,1794.05,1712.96,1735.21,1735.21,1762.96,1673.17,1777.59,1845.43,1880.18,1735.21,1803.05,1707.01,1652.59,1569.36,1608.69,1692.84,1622.87,1589.79,1558.69,1666.62,1758.69,1702.59,1729.57,1767.07,1749.7,1736.59,1837.35,1824.24,1832.93,1878.51,1817.38,1666.77,1649.24,1684.91,1628.35,1580.34,1581.1,1539.63,1484.3,1449.7,1489.94,1418.6,1418.6,1431.25,1477.59,1433.23,1369.66,1343.6,1382.47,1298.17,1294.36,1366.46,1303.66,1369.51,1389.18,1515.55,1430.95,1453.35,1316.46,1352.59,1340.24,1327.13,1450,1436.59,1562.04,1467.68,1473.63,1425.3,1449.24,1389.63,1412.35,1505.34,1558.84,1558.84,1552.74,1542.99,1655.34,1620.43,1610.52,1604.88,1553.35,1506.1,1445.43,1326.07,1326.07,1361.28,1250.76,1243.45,1243.45,1277.29,1276.68,1256.55,1327.44,1313.41,1231.4,1188.87,1165.7,1123.02,1123.02,1146.34,1148.63,1208.84,1209.6,1173.02,1164.02,1181.71,1198.17,1236.43,1241.31,1309.15,1363.26,1388.57,1342.99,1334.45,1299.54,1369.21,1397.41,1440.09,1475.3,1513.57,1495.27,1583.99,1559.6,1525.46,1456.4,1509.91,1495.73,1537.04,1539.79,1527.44,1498.02,1531.1,1462.65,1415.24,1409.91,1413.57,1481.4,1389.94,1348.93,1325.3,1293.75,1255.03,1223.17,1223.17,1200,1213.57,1261.89,1302.59,1290.24,1174.24,1180.64,1168.6,1166.31,1170.27,1147.1,1135.37,1059.45,1035.98,1010.67,1023.93,1042.07,977.74,965.85,1007.77,1035.06,1035.67,1034.3,890.85,881.25,878.51,881.86,898.48,852.74,883.54,882.93,872.41,880.64,896.65,894.82,937.04,910.52,893.29,945.27,915.55,909.45,893.75,916.31,948.02,961.59,973.32,913.41,1043.75,1103.2,1120.88,1164.18,1108.23,1126.52,1121.49,1104.57,1147.1,1164.63,1164.63,1145.43,1115.7,1118.75,1183.38,1181.1,1142.99,1122.26,1071.19,1069.21,1074.24,1045.58,1077.29,1092.23,1050.76,1014.18,997.1,984.6,991.62,1031.71,973.48,983.54,983.54,964.48,953.81,988.11,987.35,987.35,975.91,985.67,950.15,975,1025,1037.35,1052.74,1079.27,1082.32,1082.32,1091.31,1075.15,1032.16,1068.14,1166.62,1138.72,1141.92,1145.73,1149.39,1104.42,1145.58,1290.24,1346.19,1312.35,1275.61,1309.6,1291.01,1268.45,1242.07,1267.23,1310.21,1298.48,1220.73,1196.65,1196.65,1170.27,1167.84,1215.7,1190.4,1200.76,1197.87,1193.45,1226.22,1242.68,1237.2,1251.68,1301.37,1280.95,1260.21,1250.15,1333.08,1367.07,1472.56,1491.46,1475.76,1462.35,1487.5,1528.66,1493.14,1472.71,1441.46,1464.79,1492.07,1494.05,1471.95,1461.43,1410.98,1409.6,1409.6,1455.49,1433.38,1407.47,1403.81,1398.63,1369.97,1368.6,1371.04,1373.63,1348.02,1334.91,1277.44,1310.06,1332.93,1362.35,1367.23,1370.58,1244.21,1320.27,1369.51,1448.78,1449.09,1478.96,1480.18,1452.13,1484.76,1546.95,1581.55,1645.27,1613.11,1646.34,1648.17,1650.46,1834.6,1936.43,1936.43,1909.6,1801.98,1821.19,1796.65,1797.71,1893.75,1796.19,1845.27,1904.27,1969.36,1898.32,1941.01,1893.9,1830.49,1830.49,1812.96,1708.99,1687.5,1676.98,1638.87,1682.77,1679.42,1695.73,1736.43,1765.55,1765.55,1737.04,1729.88,1725.15,1731.4,1696.95,1746.65,1767.07,1767.38,1803.66,1797.71,1774.85,1680.64,1691.31,1686.13,1722.56,1678.2,1693.6,1721.95,1743.9,1792.68,1666.92,1724.85,1765.55,1780.64,1726.07,1683.99,1680.34,1639.79,1707.01,1697.41,1633.99,1592.07,1607.47,1649.7,1610.67,1668.14,1551.83,1558.69,1564.18,1614.63,1624.85,1611.59,1668.45,1668.45,1688.72,1665.85,1624.85,1617.23,1605.49,1605.34,1641.92,1625.46,1547.1,1560.52,1548.93,1529.57,1465.09,1466.46,1484.45,1462.8,1494.97,1566.46,1567.38,1574.24,1525.61,1586.43,1568.75,1634.76,1630.64,1661.74,1651.07,1658.38,1601.98,1622.87,1602.74,1557.47,1560.98,1551.98,1524.54,1549.85,1464.33,1427.9,1469.97,1466.16,1501.52,1646.95,1643.75,1711.13,1703.51,1729.42,1731.55,1730.03,1807.77,1780.34,1827.44,1798.78,1826.68,1838.72,1852.59,1816.46,1867.53,1867.53,1864.48,1869.66,1859.91,1887.96,1846.95,1850.46,1807.47,1804.57,1780.79,1956.86,1965.24,2048.93,2097.71,2106.55,2103.66,2121.19,2117.38,2136.43,2065.09,2132.77,2128.05,2128.05,2186.13,2226.68,2267.68,2247.1,2112.5,2062.81,2073.32,2112.5,2228.35,2275.3,2264.33,2256.4,2234.15,2234.15,2419.82,2441.62,2479.73,2655.95,2563.72,2567.38,2717.84,2748.93,2701.98,2710.82,2622.87,2556.25,2598.78,2708.23,2655.95,2559.15,2605.79,2581.55,2629.27,2620.58,2614.94,2724.09,2694.51,2650.46,2650.46,2525.76,2504.42,2772.26,2690.85,2683.08,2713.41,2691.16,2934.91,3089.02,3130.49,3126.98,3210.82,3222.26,3161.43,3024.24,3090.85,2969.36,2851.52,2912.5,2906.25,2765.55,2739.79,2723.78,2738.57,2723.02,2711.43,2737.65,2751.37,2751.37,2794.82,2724.09,2755.64,2527.9,2597.87,2589.94,2603.35,2547.87,2599.09,2489.02,2443.9,2491.77,2347.87,2364.02,2235.37,2265.85,2321.19,2313.11,2343.9,2399.39,2442.07,2414.33,2199.24,2228.05,2295.73,2374.7,2354.12,2341.77,2323.02,2315.85,2295.12,2334.76,2433.99,2478.96,2507.16,2535.52,2510.06,2523.17,2445.58,2535.98,2535.98,2616.01,2517.38,2541.92,2544.21,2493.14,2438.87,2533.08,2542.38,2558.99,2444.21,2423.17,2442.68,2437.5,2433.38,2414.63,2357.16,2357.16,2466.16,2457.77,2442.84,2442.84,2401.52,2430.95,2472.71,2403.81,2504.73,2498.48,2498.48,2620.43,2723.93,2699.7,2804.27,2773.48,2768.45,2741.31,2706.55,2430.34,2374.54,2310.67,2376.07,2347.56,2204.73,2108.54,2133.99,2130.34,2110.37,2202.44,2020.43,2019.82,2055.18,1984.45,1961.43,2078.05,2046.8,2084.91,2151.37,2145.58,2246.34,2264.63,2367.07,2384.15,2405.64,2312.5,2362.5,2286.43,2294.21,2231.1,2217.84,2264.63,2264.63,2087.5,2147.41,2125.61,2048.02,2105.95,2177.44,2284.45,2298.32,2321.8,2318.29,2299.09,2260.52,2389.33,2377.29,2389.48,2413.41,2469.82,2553.2,2505.34,2501.22,2435.21,2435.67,2482.47,2605.18,2606.25,2634.15,2607.01,2502.74,2559.3,2519.36,2387.8,2380.03,2381.86,2377.59,2407.01,2348.93,2330.95,2339.02,2381.55,2437.8,2534.3,2265.24,2196.19,2162.5,2144.97,2159.45,2211.89,2283.84,2255.34,2246.19,2189.48,2123.48,2116.46,2056.4,2117.84,2124.85,2097.56,2095.88,2108.99,2151.37,2099.39,2076.83,2076.83,2091.16,2165.55,2164.33,2194.97,2154.88,2112.65,1994.97,1947.26,1983.99,1990.85,1934.6,1931.25,1905.79,1850.76,1812.2,1817.23,1899.39,1925.15,1925.15,1906.4,1908.38,1866.46,1841.31,1838.87,1911.13,1974.85,1941.01,1857.32,1857.32,1768.9,1788.41,1769.66,1828.66,1805.49,1851.52,1851.52,1864.02,1886.43,1875.61,1872.56,1753.2,1740.4,1788.87,1811.89,1767.53,1741.92,1821.65,1707.47,1679.27,1639.63,1684.15,1693.6,1703.05,1704.42,1724.09,1724.09,1742.07,1748.32,1740.4,1689.63,1648.02,1584.76,1596.65,1516.92,1522.26,1497.41,1535.82,1549.85,1506.86,1529.12,1473.02,1475,1536.43,1495.58,1539.18,1594.36,1577.9,1619.36,1633.23,1622.56,1735.52,1750.15,1679.73,1625.76,1573.48,1566.16,1566.77,1569.51,1429.88,1307.32,1275,1192.23,1476.22,1352.13,1423.78,1440.55,1452.59,1345.88,1333.84,1333.84,1304.27,1314.94,1377.9,1440.09,1473.32,1469.36,1464.33,1483.99,1473.32,1506.1,1533.38,1503.35,1529.88,1550.3,1567.68,1648.17,1714.33,1794.51,1752.9,1786.13,1749.09,1730.34,1708.23,1687.65,1681.55,1681.55,1746.34,1720.43,1723.02,1687.96,1747.41,1788.26,1807.62,1763.57,1771.19,1855.64,1878.66,1846.65,1806.4,1770.73,1926.68,1937.5,1932.77,1932.77,1954.88,1975.3,2110.21,2185.98,2190.24,2192.23,2163.11,2074.85,2111.59,2102.29,2102.29,2054.88,2100.91,2109.91,2197.56,2232.01,2229.27,2372.1,2440.24,2445.27,2393.14,2393.29,2358.54,2418.45,2471.34,2537.65,2647.26,2704.88,2736.43,2687.65,2617.38,2694.82,2657.16,2486.59,2628.05,2633.54,2626.22,2666.92,2811.28,2758.38,2705.95,2685.06,2538.87,2518.29,2495.58,2557.32,2490.24,2539.94,2547.71,2569.82,2479.12,2479.12,2474.39,2471.49,2466.31,2303.96,2308.08,2375.31,2432.01,2373.02,2417.23,2456.71,2446.04,2426.22,2407.32,2399.24,2435.82,2452.74,2452.44,2458.38,2430.79,2459.76,2466.31,2500.15,2587.35,2510.21,3105.34,3224.24,3590.85,3550.15,3275.91,3299.09,3324.54,3637.2,3575.61,3553.05,3667.07,3628.51,3509.6,3582.16,3855.49,3958.38,3933.08,4029.42,3884.76,3904.27,3958.08,3811.74,3907.47,3623.48,3560.06,3719.21,3620.73,3946.49,3779.88,3762.35,3666.46,3510.52,3407.77,3140.55,3106.4,3278.2,3142.23,3265.85,3265.85,3316.01,3350,3281.1,3317.07,3292.38,3322.71,3370.58,3378.35,3375.3,3375.46,3213.11,3164.33,3188.57,3019.97,3064.94,3253.51,3276.68,3275.91,3278.05,3278.05,3277.29,3286.74,3282.62,3264.63,3406.55,3370.12,3267.53,3201.52,3120.12,3097.1,3166.01,3368.45,3408.54,3474.39,3533.99,3533.99,3535.37,3807.93,3867.84,3958.54,3830.95,3841.92,3852.74,3844.21,3608.69,3754.12,3690.7,3051.68,2934.45,3177.44,3292.68,3255.64,3255.79,3139.33,3160.37,3160.37,3095.73,3050.61,3100.15,3051.07,2996.95,3259.76,3214.33,3104.88,3051.98,3027.74,2910.82,3080.34,3040.4,2933.38,3089.63,3098.02,3122.41,3014.33,2948.02,2996.65,2992.53,3040.55,3129.12,3069.05,3089.63,3130.64,3357.77,3106.25,3079.12,2988.41,3101.07,3204.42,3315.55,3315.55,3356.4,3376.98,3533.84,3607.32,3735.37,3762.65,3888.26,3934.76,4241.77,4243.75,4191.31,4336.74,4625.91,4654.42,5301.98,5101.07,4926.98,5138.87,5403.81,5496.04,5206.4,5415.55,6423.63,6226.52,6938.87,6993.75,6833.69,6791.16,6855.18,6464.94,6417.53,6311.74,6822.87,6853.51,7126.68,7126.68,7681.25,7553.96,7897.71,7867.38,7776.37,7950.3,8270.12,7975.61,7109.45,7474.54,7248.63,6896.34,7445.88,7798.32,8342.38,7733.08,7812.19,8191.62,8191.62,8408.99,7924.54,7922.87,8118.45,7950.91,8223.93,8855.34,8245.12,7893.6,7893.6,8415.4,7867.53,7887.35,8334.15,8504.42,8146.19,8355.64,8066.16,7636.28,7557.32,7676.37,8299.24,8419.66,8226.98,7956.56,7544.97,6930.18,6548.17,7399.24,7258.38,7387.81,7905.18,7348.32,7458.54,7368.29,7157.93,7230.49,7361.74,7362.96,7841.31,7713.41,7383.99,7110.06,7156.4,7214.18,6962.65,7304.57,7331.25,7266.31,7097.26,7175.61,7006.25,6967.38,6953.66,7280.03,7280.03,7709.45,7943.6,7676.83,7867.84,7521.49,7685.98,7812.5,8309.3,8533.84,9382.93,9508.69,9369.05,9592.38,9613.26,9266.31,9261.74,9325.61,9386.13,9663.26,9630.34,9899.69,9845.43,9461.59,9269.82,9058.54,9230.64,8701.52,8570.58,8060.21,8201.98,8151.52,8425.61,7742.84,7877.9,8098.78,8540.55,8817.68,8634.45,7695.12,7116.46,7376.52],"EuroStoxx50":[null,100,99.36,101.2,101.68,102.78,102.46,101.9,102.23,102.56,101.78,102.3,101.59,102,102.38,101.97,102.26,102.52,101.46,102.18,102.63,101.93,101.4,102.67,104.28,105.68,107.14,107.53,107.59,108.85,108.01,109.29,109.61,109.56,110.29,110,109.96,110.11,110.11,110.26,110.27,110.03,110.66,110.66,111.49,111.57,111.53,111.69,111.28,111.19,111.25,110.53,111.8,110.8,110.48,110.78,110.66,110.96,110.07,110.36,111.86,111.62,111.09,109.73,108.65,109.6,109.42,110.08,108.91,108.82,108.9,110.23,110,111.16,111.28,111.78,111.35,111.28,111.4,112.3,112.3,112.12,111.12,111.29,111.64,114.01,113.83,114.46,113.92,113.84,113.99,114.68,114.89,114.86,114.32,114.66,115.69,115.97,115.6,115.34,115.04,116.1,115.83,115.59,116.53,116.88,117.09,117.74,116.8,117.09,116.78,117.36,117.57,117.05,116.7,116.65,115.97,115.97,115.97,114.67,115.05,115.69,115.7,120.31,120.5,120.35,119.84,119.71,119.71,120.34,120.61,122.01,123.05,122.49,122.72,122.61,121.86,122.33,122.48,122.48,120.56,119.8,120.63,120.28,120.9,120.62,120.62,120.36,120.36,119.77,119.54,119.96,120.79,120.79,119.53,119.35,119.86,120.6,119.18,119.65,119.29,118.56,119.18,120.38,119.75,119.53,119.58,119.18,119.78,119,118.91,116.74,115.75,117.43,117.02,116.98,116.43,116.49,116.97,116.51,118.22,118.64,118.58,118.26,116.99,117.72,117.69,116.08,116.13,116.82,117.41,117.48,116.62,116,116,116.34,116.58,117.96,117.9,118.23,116.65,115.47,114.56,116.05,116.43,117.19,116.43,115.89,115.14,116.21,115.64,115.85,115.64,115.05,113.95,114.47,115.07,115.82,115.37,115.05,115.48,115.95,115.95,117.55,118.13,118.49,118.6,118.23,118.61,118.76,118.57,119.04,119.1,118.98,118.93,119.56,119.85,120.9,121.16,121.26,120.9,121.53,121.18,121.42,121.03,121.32,121.26,121.22,121.28,121.33,121.73,121.14,121.24,121.37,121.43,120.78,122.32,122.83,123.16,123.56,124.35,124.06,124.1,123.84,123.05,122.92,121.49,120.86,120.21,119.6,119.24,119.89,119.3,119.77,120.37,119.81,120.13,120.44,119.86,120.51,120.73,120.06,118.63,120.27,120.08,119.78,120.17,120.78,120.47,121.08,120.46,119.6,119.74,121.39,120.47,119.48,120.09,119.5,119.5,119.5,119.39,118.52,117.84,117.84,118.04,120.02,121.33,121.62,121.84,121.4,120.91,121.49,121.47,121.81,121.5,121.77,122.72,123.27,123.5,122.52,122.08,122.66,122.52,121.3,121.38,120.31,118.49,116.99,114.17,116.18,113.58,111.85,113.28,112.36,113.33,113.99,115.25,114.61,115.52,115.36,115.42,115.74,116.47,116.3,115.65,114.32,111.81,112.84,112.93,113.58,114.79,115.03,115.34,114.25,114.04,114.82,115.6,114.17,114.75,114.38,112.6,110.92,110.27,111.55,112.03,113.05,113.05,113.05,112.56,112.34,115.35,114.62,114.84,115.65,115.01,115.82,115.96,115.72,116.96,117.4,117.26,117.51,118.15,118.07,117.23,117.91,118.34,118.93,118.93,119.52,118.69,119.41,119.87,119.65,120.05,120.05,119.91,119.92,119.87,119.82,120.81,120.19,120.19,120.64,119.11,118.44,118.22,117.12,115.29,115.73,114.57,116.14,116.68,116.25,116.39,116.35,115.93,117.04,116.89,117.02,118.62,117.88,116.59,115.53,115.68,114.46,115.74,113.31,113.29,114.25,113.18,114.2,113.41,114.56,114.75,115.72,115.97,116.38,116.81,115.1,115.87,116.18,115.99,116.28,117.21,116.75,116.36,116.16,117.15,116.65,118.02,118.62,118.12,118.56,118.56,116.67,117.11,117.15,117.85,117.49,117.51,115.23,114.67,114.66,112.97,113.59,113.43,114.13,114.74,115.02,114.99,115.27,116.23,115.94,116.23,115.39,114.1,114.18,112.98,111.51,110.84,110.76,111.29,111.37,111.88,112.11,112.48,112.53,112.95,113.29,114.45,115.38,114.69,115.01,115.46,116.02,114.32,114.82,113.97,114.53,113.51,112.51,111.31,111.71,109.87,107.93,107.43,107.97,109.55,109.07,108.01,107.98,107.28,105.63,105.27,106.42,105.43,106.1,105.84,107.53,107.76,108.1,108.2,107.87,109.17,108.88,108.61,107.42,108.45,107.8,107.29,106.97,106.28,104.8,106.07,105.15,105.51,106.7,106.49,106.55,106.75,106.71,108.12,107.26,105.95,102.44,102.86,101.46,102.75,104.52,104.66,104.01,103.03,102.24,102.62,100.89,100.91,100.91,100.91,100.91,98.78,100.44,100.44,100.44,99.37,102.3,102.02,102.74,103.25,103.44,103.25,102.75,103.18,103.49,103.22,105.43,105.1,104.69,104.66,105.14,106.38,105.51,106.05,106.33,106.25,106.65,106.45,108.12,108.05,105.96,105.45,106.46,107.31,107.7,107.03,109,109.12,108.94,109.62,109.76,109.99,110.31,110.62,110.4,110.92,111.39,111.56,111.9,111.81,111.28,110.43,111.13,111.11,111.77,112.39,113.88,113.94,114.65,113.41,113.25,111.17,111,111.64,111.72,111.66,112.72,113.85,114.2,115.54,115.75,115.94,115.62,114.92,115.17,115.53,115.95,116.04,116.47,116.96,117.68,117.68,117.68,117.84,117.8,117.44,117.72,117.77,118.2,118.2,117.33,117.79,116.46,114.38,114.92,112.69,113.03,111.68,113.15,113.87,115.64,115.21,113.33,113.89,113.9,111.9,112.69,113.13,112.62,110.91,110.91,110.32,110.99,112.11,112.32,112.27,113.62,113.62,114.38,113.89,114.02,113.64,113.78,116.12,116.18,116.63,116.59,116.21,115.84,115.79,115.77,116.82,117.63,117.98,119.07,119.19,118.65,118.51,118.03,117.76,117.6,117.63,117.78,118.43,117.76,117.13,117.04,117.37,118.81,118.81,118.05,118.53,118.5,116.46,116.59,116.59,113.54,111.35,110.7,111.32,113.52,112.12,111.87,112.9,110.6,110.4,111.96,113.31,112.67,114.17,113.46,112.13,112.62,113.35,113.18,114.72,115.24,115.44,115.04,116.05,117.19,117.55,117.54,117.67,118.27,119.01,119.39,118.33,118.42,118.65,119.48,120.11,118.95,118.78,118.15,118.79,119.25,120.04,118.32,114.79,114.93,115.91,116.74,115.45,116.43,117.5,120.06,119.6,121.02,121.04,120.69,120.38,121.07,121.23,121.3,121.79,121.9,121.93,121.81,121.75,121.22,121.87,123.26,123.64,124.05,124.66,124.42,124.33,124.84,124.42,124.06,124.82,124.6,124.32,123.89,123.75,124.01,124.69,124.62,124.87,124.58,124.55,121.97,121.44,123.09,122.69,124.18,123.5,123.48,124.01,124.65,125.48,126.88,125.96,125.74,125.75,127.01,127.01,127.01,127.01,127.01,127.2,126.06,126.06,126.06,126.9,126.2,126.43,126.87,127.66,127.44,127.11,126.95,126.75,126.93,128.07,127.76,127.43,126.78,125.67,127.1,123.69,125.08,125.66,124.12,122.45,123.13,125.52,127.05,127.98,127.75,127.57,128.66,129.63,129.37,129.17,129.59,129.02,129.99,128.57,127.81,122.68,120.15,120.32,116.22,111.97,112.29,113.4,115.04,113.12,108.7,99.52,97.87,97.72,85.6,86.97,82.41,85.1,80.24,82.53,85.71,83.59,91.31,94.17,95.77,91.77,93.01,93.72,90.14,90.42,89.56,94.03,96.1,95.89,97.29,97.29,97.29,98.13,94.44,94.58,97.14,97.85,93.87,95.34,95.93,94.47,96.93,98.61,100.76,98.47,98.47,94.72,96.72,95.64,96.88,97.8,96.98,97,94.52,92.83,93.18,97.93,97.62,98.95,98.95,97.71,99.93,100.87,102.61,104.07,102.58,102.58,106.24,109.96,109.69,113.82,113.21,111.68,110.77,105.75,106.06,105.48,109.05,109.88,109.3,109.94,109.02,110.94,107.49,108.25,107.76,108.69,108.76,108.57,111.66,110.79,112.66,111.71,110.51,109.67,110.85,112.66,111.7,113.61,113.18,113.19,113.95,114.52,113.36,113.39,111.35,111.08,111.1,110.99,107.89,106.75,109.24,109.44,109.92,108.98,109.39,109.63,112.06,113.11,112.42,111.15,111.18,110.63,111.57,110.11,109.63,112.05,111.98,112.89,112.02,111.5,110.06,110.23,112.25,111.12,109.66,111.45,109.88,111.82,111.41,111.51,111.55,112.07,112.29,111.54,110.43,106.3,106.41,106.95,106.26,105.5,108.4,108.1,107.4,107.42,107.31,108.3,108.74,108.74,109.49,110.08,110.92,110.28,110.08,107.37,109.15,109.05,108.55,106.97,106.66,107.58,104.43,103.27,99.67,99.55,99.49,101.55,104.21,106.31,108.14,107.75,114.61,115.78,116.61,115.29,115.42,116.57,116.65,117.11,116.09,116.62,116.46,117.98,118.11,118.07,118.64,117.46,118.56,118.42,118.28,119.03,118.72,118.58,118.68,118.46,117.23,117.84,118.43,119.15,119.75,119.25,115.98,117.62,119.03,119.03,119.03,120.24,120.44,120.11,120.11,119.87,119.32,121.44,121.82,122.58,121.76,121.48,121.63,122.46,121.05,121.16,120.92,121.88,121.69,121.15,119.49,120.83,118.93,119.63,117.08,118.74,120.75,121.4,122.49,122.95,123.27,123.13,122.7,123.48,124.29,125.58,125.32,124.43,123.8,124.89,124.43,124.07,124.63,123.94,122.3,124.66,124.69,124.86,124.6,123.41,126.56,127.33,128.47,129.33,128.92,128.8,129.51,129.47,130.07,129.04,128.93,128.7,128.89,128.89,130.04,130.58,132.04,131.81,132.7,132.7,132.7,133.53,133.07,133.78,133.81,133.24,133.41,133.72,134.3,135.63,135.19,132.52,133.73,135.02,134.97,135.22,134.92,135.03,134.42,133.67,134.53,131.99,134.62,134.5,135.67,135.31,132.71,132.75,132.75,135.11,134.75,134.7,132.39,134.52,135.39,135.39,135.73,135.59,135.84,136.9,135.85,136.94,137.5,137.19,137.53,137.81,137.75,137.78,137.75,138.78,138.98,139.35,139.63,139.84,137.33,138.3,138.66,137.08,138.64,138.58,137.55,138.14,136.68,137.18,137.36,137.46,136.29,137.16,134.24,136.81,137.66,137.7,137.87,136.42,135.73,132.12,133.05,135.42,136.51,138.19,137.97,136.7,137.99,138.45,137.53,138.44,138.49,139.4,139.94,140.39,140.48,140.84,141.46,142.13,142.25,141.33,141.13,140.89,138.72,139.48,140.46,140.51,140.61,140.23,140.94,141.21,141.13,142.17,142.33,141.31,142.8,142.09,140.48,140.48,140.25,140.9,140.97,139.43,140.23,138.92,135.99,137.8,139.57,141.08,139.85,140.09,136.5,137.22,136.14,135.71,134.4,136.72,134.95,137.83,136.99,136.96,136.37,137.32,139.54,140.67,139.61,140.13,140.31,139.76,140.87,140.86,142.05,141.95,142.39,142.95,143.95,144.48,144.93,145.73,146.73,146.38,146.11,146.25,146.56,146.98,147.51,148.02,148,147.43,146.51,145.91,144.07,143.81,144.38,137.53,138.2,136.64,140.55,138.15,137.22,139.13,143.81,142.36,141.53,141.22,140.68,139.38,139.89,141.31,139.95,138.12,140.41,141.82,143.46,143.46,144.21,145.01,144.1,144.82,144.82,145.68,146.89,147.71,145.45,144.81,142.58,143.99,145.16,145.15,143.68,144.68,143.19,143.54,144.6,142.24,136.35,137.15,140.06,140.74,139.13,140.39,142.07,141.99,139.26,137.43,138.58,138.87,141.39,141.15,139.74,136.69,139.36,139.14,138.33,137.02,134.04,134.03,133.63,128.78,133.54,131.97,126.65,128.49,125.84,119.59,118.12,117.88,126.65,122.8,123.99,125.82,125.71,130.81,130.67,131.24,130.55,132.04,130.12,129.93,130.07,130.73,134.6,133.15,131.24,131.79,132.88,131.76,128.63,127.86,129.76,129.13,128.85,128.74,129.43,129.43,129.43,128.83,131.05,132.1,129.14,126.37,125.15,125.6,127.02,127.89,125.52,126.49,125.27,124.32,122.05,118.61,119.55,122.68,121.52,124.55,123.94,125.83,124.12,122.19,122.99,124.72,122.67,123.66,123.66,128.09,129.2,127.43,126.44,127.63,127.25,127.25,128.02,127.42,125.26,121.04,117.79,116.87,118.79,115.28,115.64,116.69,117.51,116.52,115.56,118.82,119.01,119.36,118.19,116.19,115.97,116.11,112.99,115.08,117.32,117.93,116.75,117.27,116.16,114.23,116.94,118.11,120.65,120.57,120.95,120.95,121.21,120.24,121.33,122.83,124.71,124.71,123.92,125.53,126.27,125.29,126.36,124.95,126.09,126.35,127.02,127.45,127.97,126.32,127.04,125.45,123.03,122.84,123.34,123.58,121.19,120.08,119.79,118.29,116.25,119.2,117.37,117.71,117.78,118.12,120.06,122.63,120.61,119.98,119.11,117.72,117.69,116.6,117.43,115.26,112.62,112.41,111.94,112.17,110.28,111.59,112.4,117.18,115.95,115.47,113.52,112.89,112.34,112.04,113.08,113.73,115.74,116.49,116.74,117.47,116.92,118.64,120.58,121.25,121.22,121.51,121.66,122.79,121.81,120.84,124.04,124.73,125.75,125.38,129.36,130.1,130.74,131.67,130.58,130.43,131.99,131.47,132.16,132.72,133.24,133.26,132.35,132.32,133.34,134,133.78,133.06,132.48,131.86,131.87,132.59,131.89,134.08,133.69,129,127.93,128.17,127.88,130.22,128.58,128.37,128.37,128.9,128.09,129.48,127.58,127.58,130.56,133.65,133.16,135.12,136.83,136.45,137.88,138.78,139.59,139.8,140.38,140.39,137.69,138.55,139.59,139.67,139.5,140.37,140.51,139.86,140.02,140.29,142.63,143.2,141.43,141.56,141.56,142.93,141.18,142.64,142.55,143.94,144.52,143.77,143.64,142.94,142.69,143.2,140.54,142.86,142.54,141.78,142.61,144.44,145.07,143.9,144.22,144.14,142.24,137.77,140.56,135.7,138.46,136.71,138.54,140.63,141.1,141.49,138.91,140.06,140.18,142.3,144.12,145.12,144.98,145.13,144.56,144.93,144.93,144.93,145.73,145.76,146.74,147.66,146.88,147.77,147.76,147.47,148.26,148.03,147.23,146.22,146.56,146.61,146.61,144.44,144.95,144.18,145.97,146.25,145.39,144.84,144.94,145.21,145.16,145.13,145.39,145.39,147.82,147.49,146.04,143.39,143.59,145.87,145.87,144.33,141.85,143.19,145.4,144.38,144.45,144.34,144.53,144.27,145.17,146.21,147.17,146.8,147.8,146.71,146.06,145.38,144.76,143.66,143.96,144.79,146.12,146.45,147.94,147.91,147.67,146.32,142.02,142.48,143.15,144.16,146.64,147.7,147.98,146.52,146.96,146.71,147.09,147.69,147.4,147.68,146.16,149.57,150.21,150.37,150.37,145.84,144.77,145.72,145.87,144.24,145.19,147.44,145.33,145.63,144.23,144.08,142.18,141.68,142.08,143.28,143.49,142.33,142.47,144.4,145.5,145.13,144.51,144.03,143.93,143.57,142.53,141.96,142.5,143.08,142.67,142.04,143.93,144.44,142.79,142.68,143.8,141.67,141.49,140.15,138.87,138.95,139.96,140.4,139.15,137.74,137.88,137.88,139.38,138.31,141.42,141.28,141.19,139.1,139.56,139.64,138.08,137.56,135.35,135.93,136.72,136.99,136.18,135,135.47,136.58,137.61,140.23,140.4,139.86,139.68,140.52,142.23,141.16,142.33,144.33,145.13,144.69,145.98,146.04,145.68,146.36,146.67,147.04,146.44,146.23,146.98,147.38,148.6,148.48,149.75,150.77,150.46,152.12,152.69,152.57,152.35,152.65,153,152.05,152.53,152.47,152.17,152.06,152.06,152.06,152.29,151.82,152.07,152.07,149.59,150.46,150.11,150.85,150.23,150.29,149.4,150.67,149.81,149.54,148.08,149.76,149.62,150.68,150.19,153.49,154.1,155.89,156.02,156.81,156.33,156,156.53,156.56,157.76,157.35,158.43,158.6,159.62,157.7,158.37,159.52,160.27,160.18,160.09,160.6,163.29,163.87,163.59,164.31,164.24,164.04,164.62,165.22,164.56,165.31,167.29,166.84,165.81,167.59,168.17,167.92,167.68,167.57,168.42,168.16,169.91,169.2,169.64,170.31,170.9,170.96,170.96,170.96,169.57,170.48,170.53,168.65,169.7,167.85,168.18,167.03,166.64,167.63,165.36,165.26,166.02,165.4,166.03,168.43,167.81,166.1,168.38,167.52,165.5,165.5,164.47,165.51,166.71,168.69,169.44,169.44,171.01,170.81,170.85,171.55,170.59,170.31,170.31,169.73,169,169.42,169.34,170.14,169.17,166.91,167.55,167.6,168.27,166.58,169.35,170.48,169.88,168.71,166.98,169.31,165.98,162.74,164.13,165.31,164.3,166.39,165.04,166.5,166,165.33,164.88,164.59,165.8,165,167,167.73,167.46,167.14,164.91,166.77,167.35,169.6,167.58,166.4,164.5,163.78,162.34,164.7,165.35,163.51,161.81,163.53,161.94,162.81,163.88,163.88,156,153.75,153.87,156.99,157.01,157.23,157.12,157.89,158.99,161.69,162.79,163.83,163.36,164.29,164.29,165.1,164.68,164.75,165.23,167.02,166.74,167.25,165.21,163.05,161.94,159.34,160.71,159.65,160.2,161.9,162.91,162.36,163.47,162.61,166.25,163.83,164.3,166.16,165.36,169.25,170.42,168.17,166.61,166.92,165.51,166.64,167.13,166.44,167.57,167.16,168.28,169.53,166.36,165.08,166.38,167.69,166.18,166.11,165.55,165.98,166.24,167.14,166.47,164.31,162.36,164.04,163.18,163.79,161.45,163.17,161.52,163.24,159.57,159.42,162.55,161.25,161.1,159.79,159.06,159.94,161.06,161.42,160.15,159.18,160.04,161.57,163,164.07,165.43,166.52,167.41,167.66,166.53,166.79,166.99,167.07,166.37,166.22,166.72,164.08,163.52,163.21,163.21,163.21,163.21,164.75,163.76,163.76,163.76,163.83,167.7,168.55,168.03,168.75,167.39,166.61,167.5,169.24,171.75,173.14,173.68,173.73,175.07,175.47,175.53,174.49,174.73,175.91,177.64,177.8,175.48,177.05,177.27,180.15,179.1,180.2,181.3,181.79,184.98,184.75,185.63,186.11,183.66,183.66,184.12,183.41,183.22,185.91,184.05,183.74,186.34,181.18,184.6,185.66,183.91,181.17,178.57,180.24,179.2,181.75,183.14,184.46,185.22,183.32,182.41,182.14,184.13,182,180.97,179.3,176.51,178.92,178.37,171.96,164.06,156.6,160.54,155.44,162.06,161,165.17,167.16,167.03,165.98,165.98,165.98,166.86,171.47,172.02,173.34,173.89,173.6,173.54,173.54,177.74,177.67,177.01,175.89,177.87,178.57,181.35,182.15,181.72,182.01,182.53,182.52,183.44,183.44,182.43,179.13,181.45,182.12,180.88,180.88,180.48,180.11,180.79,181.78,181.96,182.62,182.62,182.12,181.37,180.29,177.92,179.57,177.86,177.13,174.78,176.01,175.62,178.14,176.63,176.36,179.1,178.35,177.65,178.87,179.69,177.87,179.64,180.66,183.14,182.89,181.05,180.62,180.06,178.18,180.84,180.23,179.69,177.92,179.73,180.1,180,179.51,180.91,181.38,178.91,178.91,176.3,176.55,177.01,179.32,179.85,179.31,179.45,181.21,182.77,183.24,182.77,184.41,184.04,183.7,184.57,183.08,181.06,181.37,181.49,179.98,180.5,177.94,179.08,179.81,178.85,180.35,180.56,180.31,181.16,181.29,182.96,180.67,180.59,183.51,183.57,183.02,184.04,183.78,183.11,184.96,185.2,185.98,187.7,189.87,190.07,189.3,188.79,190,189.19,186.02,187.26,186.72,188.5,190.08,188.58,191.05,191.25,189.65,190.63,190.84,192.07,191.84,191.89,191.67,190.42,191,190.36,190.66,188.71,187.21,190.5,192.56,194.63,193.13,191.48,189.71,186.14,186.38,187.32,185.48,185.93,187.45,190.2,190.12,190.62,190.6,191.23,191.51,192.3,192.5,192.55,192.31,191.97,193.51,192.39,193.46,192.29,191.08,193.1,193.72,193.16,193.35,193.35,193.35,193.35,193.43,194.93,194.93,194.93,199.22,199.49,199.21,198.57,201.7,202.33,202.79,201.95,203.17,202.77,199.29,198.15,197.84,200.31,200.04,200.36,201.6,199.54,198.15,200.03,202.04,201.63,200.79,199.28,201.73,203.77,203.37,202.98,202.16,201.29,201.07,202.52,205.26,203.79,206.2,205.61,205.7,207.61,207.22,206.44,201.34,194.11,197.44,194.48,192.36,191.2,196.31,194.88,193.34,192.25,193.01,194.02,192.93,188.8,185.01,187.47,187.7,189.99,187.19,185.16,186.37,187.31,192.79,191.45,191.45,191.45,189.45,198.87,198.3,199.3,198.59,201.26,199.78,199.54,203.72,201.2,199.44,198.63,198.24,197.86,197.09,196.27,195.61,197.8,197.8,193.83,197.4,202.7,200.86,198.81,198.27,195.34,197.11,197.11,195.99,196.7,196.78,200.98,200.45,202.44,202.44,203.94,204.16,203.64,203.48,202.96,205.41,203.58,205.26,203.87,203.88,203.46,202.12,203.7,208.09,209.5,210.44,211.87,212.65,211.64,212.25,209.54,209,210.78,209.23,209.57,212.82,211.28,213.91,215.66,215.17,212.54,208.67,211.34,210.86,210.9,211.21,210.71,211.32,209.55,209.43,211.39,212.44,208.85,211.23,211.27,211.52,210.15,213.37,213.82,216.13,218.15,217.82,218.68,219.4,219.8,220.32,219.74,220.13,219.93,219.62,217.53,216.73,215.98,217.33,216.85,217.11,217.61,216.07,218.12,215.91,214.19,213.96,214.65,215,215.37,215.68,212.26,210.83,212.72,210.54,209.74,210.75,212.64,209.73,212.48,212.7,211.87,210.95,211.97,211.92,212.55,210.83,207.68,209.8,209.93,210.94,207.85,206.05,207.61,208.55,207.4,208.19,207.44,208.65,206.65,205.87,208.76,204.71,204.08,205.69,207.32,207.43,208.75,206.2,207.7,207.7],"HSCEI":[null,100,100.1,101.33,101.88,98.91,100.67,99.49,98.53,99.12,98.74,98.36,98.6,99.61,101.79,101.94,102.08,103.25,104.15,103.84,103.76,104.33,103.16,102.42,103.03,103.67,104.37,104.07,102.29,102.51,102.36,99.97,99.88,98.9,97.91,98.41,97.03,96.83,96.83,96.83,98.09,98.22,99.08,99.08,99.76,99.57,101.23,101.36,101.27,101.92,102.66,102.54,103.22,101.94,102.32,103.38,103.27,102.46,102.58,102.92,102.75,103.93,103.4,103.4,103.4,102.9,102.26,102.12,103.78,103.84,104.99,106.26,106.78,108.18,108.15,110.06,110.26,109.26,110.16,109.77,111.13,110.96,109.88,108.95,108.61,108.5,108.07,106.99,107.27,107.89,108.42,106.47,106.19,108.19,108.79,108.34,111.02,110.88,111.62,112.26,110.28,110.6,110.5,109.28,109.95,110.08,109.21,108.35,108.78,108.78,109.32,108.38,108.35,108.14,107.21,107.66,107.62,107.62,107.62,105.92,105.29,106.06,105.99,106.6,108.33,108.81,108.22,107.78,107.78,107.29,107.29,106.39,104.69,105.28,106.82,107.86,108.18,108.44,110.21,110.04,109.5,108.32,108.28,109.41,109.63,109.59,111.49,111.58,111.99,111.99,111.82,112,112.49,111.76,111.86,111.91,112.32,111.71,110.59,111.01,110.89,109.11,109.52,110.96,110.4,109.61,109.71,110,111.06,110.72,109.77,110.02,109.31,109.81,108.69,109.48,109.12,108.12,107.73,109.85,110.92,112.61,113.14,113.72,113.43,114.54,114.39,113.76,114.12,113.72,114.23,114.51,113.44,114.19,116.26,116.59,116.03,116.04,116.58,116.85,115.61,113.71,111.51,112.92,113.25,114.09,113.91,112.78,113.39,115.53,115.53,116.55,119.05,119.62,119.13,119.96,119.12,119.02,117.94,118.03,117.37,117.05,117.59,118.34,118.56,117.98,117.08,116.72,118.08,117.33,117.84,118.1,117.16,115.09,115.68,116.39,114.69,115.06,115.06,119.23,120.2,120.2,120.85,120.07,120.43,120.35,121.29,121.49,122.37,122,122.57,119.78,121.9,121.19,120.29,121.21,120.72,122.8,121.95,121.36,122.72,122.32,122.36,121.54,122.82,122.09,123.86,123.87,123.23,122.35,120.36,121.64,122.43,121.69,125.23,126.12,123.78,125.59,124.15,123.45,122.84,121.03,120.75,121.47,121.12,117.72,117.6,119.06,120.56,119.31,121.49,121.62,119.87,120.39,121.72,121.34,122.3,122.9,122.9,122.9,122.52,123.22,123.49,127.28,127.49,128.7,128.79,129.04,129.25,129.61,129.67,131.5,131.52,134.86,135.72,138.1,139,139.26,142.27,143.65,141.2,144.74,144.06,141.21,143.03,141.68,142.78,142.16,133.8,131.13,130.57,125.52,125.5,126.6,129.31,132.2,132.2,132.2,130.74,133.8,132.13,134.31,135.35,133.37,130.58,131.08,128.71,126.47,129.84,128.46,130.09,131.1,133.91,134.43,133.77,134.15,133.65,133.52,132.86,132.06,131.06,127.91,128.64,129.74,126.57,126.54,126.54,126.54,128,125.05,125.05,126.21,127.33,129.97,129.98,129.6,129.31,126.64,125.51,126.41,129.08,127.13,126.56,129.14,127.55,126.02,127.26,130.05,130.05,128.6,126.75,125.4,126.2,128.08,128.51,129.02,130.2,132.3,131.2,131.2,129.49,130.3,130.24,130.24,127.51,128.17,127.06,127.77,126.12,124.12,126.33,126.77,129.19,129.29,129.55,130.86,128.3,128.37,128.73,126.93,126.04,125.19,125.19,121.21,121.34,119.85,119.59,118.21,117.26,114.73,114.62,116.78,116.78,114.66,112.98,111.88,112.03,113.57,114.16,112.41,113.4,113.34,112.89,111.7,111.56,110.98,112.66,113.18,115.73,116.79,116.23,116.51,116.5,116.27,115.72,113.2,112.78,112.87,114.6,114.97,116.22,115.41,113.55,113.31,111.11,110.52,110.88,112.13,113.24,114.43,114.05,113.69,116.53,117.04,116.89,115.67,114.7,114.04,114.86,112.27,111.56,111.36,110.04,108.98,107.98,110.77,111.53,110.34,111.34,113.28,113.82,116.3,114.19,114.19,115.86,115.37,116.2,116.2,113.42,113.75,111.24,111.06,109.61,109.9,110.13,106.44,108.62,106.99,107.55,107.55,106.91,107.81,110.64,107.94,107.85,107.32,106.08,105.6,105.45,106.92,108.41,112.72,111.21,112.13,112.23,112.88,110.01,110.11,110.51,109.74,111.32,111.62,112.12,110.38,110.59,110.17,109.56,110.96,110.9,112.16,111.63,112.02,114.77,115.03,113.45,110.53,109.36,108.34,108.05,109.86,111.34,109.25,109.17,107.89,107.53,106.42,106.53,106.13,106.13,106.13,105.37,105.38,106.78,103.71,103.73,105.78,106.77,106.87,109.24,109.62,110.26,108.55,110.76,111.32,110.86,112.18,112.98,111.93,112.12,112.75,114.68,114.77,114.61,114.92,116.39,116.68,116.39,116.39,116.39,116.39,115.55,116.19,116.48,118.11,117.81,115.35,117.58,117.24,118.43,119.24,120.52,122.66,121.75,120.83,119.88,121.36,122.08,122.15,122.25,120.86,117.66,118.93,120.93,120.29,120.73,121.37,123.13,123.25,122.6,121.75,121.47,118.46,118.45,119.23,119.12,120.01,121.89,121.77,123.45,123.31,123.31,124.38,124.6,124.07,122.53,122.97,122.67,124.67,124.96,124.12,124.12,124.12,123.72,123.01,121.3,121.4,122.74,121.73,121.73,121.88,122.07,118.47,118.76,117.04,114.38,115.28,115.28,113.52,113.94,114.02,112.73,112.14,112.16,111.84,109.69,110.16,109.71,109.86,109.58,110.21,109.55,110,109.06,109.1,108.99,108.99,111.02,112,110.68,110.45,109.89,109.98,110.82,113.53,115.19,115.18,115.51,113.29,113.54,114.92,114.76,114.76,115.81,115.19,115.1,114.9,113.11,112.32,112.87,113.73,113.78,114.31,114.59,114.41,113.74,115.05,113.59,114,114.52,115.27,114.46,113.7,114.09,112.58,112.02,109.14,106.32,105.59,105.39,105.9,105.4,105.44,103.85,104.05,104.44,105.09,106.61,106.86,107.33,106.76,107.52,105.61,105.42,105.26,105.39,106.34,106.55,105.84,108.5,109.51,110,109.86,109.72,111.42,111.71,112.72,112.09,110.76,110.51,109.53,109.42,108.5,108.32,107.24,107.7,107.03,107.58,107.58,107.39,107.79,107.02,107.02,107.59,107.25,107.77,110.24,110.82,110.74,111.08,111.67,111.16,111.19,111.02,110.23,111.08,110.38,111.47,111.23,110.52,111.09,112.03,114.04,114.72,114.54,115.33,114.77,111.93,112.75,110.94,109.97,109.94,111.33,112.81,112,110.21,110.8,112.1,111.97,112,111.39,108.65,109.3,109.22,108.14,108.86,109.76,109.77,109.63,110.76,111.95,114.3,113.68,115.64,116.27,115.86,116.33,116.56,116.39,116.39,116.39,118.06,118.39,117.78,119.39,118.68,117.75,118.11,116.85,118.98,118.83,120.19,119.76,119.13,119.47,120.44,119.51,115.69,117.85,115.51,115.76,115.76,115.76,111.99,108.89,108,108.29,110.05,110.67,113.52,112.9,112.36,113.99,114.79,114.27,114.57,115.56,113.95,115.04,115.1,113.8,111.46,111.58,110.75,111.72,108.65,110.58,110.58,110.97,113.14,110.28,105.3,107.08,106.21,102.57,101.77,97.32,97.2,92.81,90.27,96.17,92.3,96.86,100.5,99.64,100.24,99.16,101.19,99.19,100.47,100.1,101.8,103.85,102.11,103.47,103.47,103.47,103.85,102.56,102.01,103.51,103.61,101.4,101.98,102.34,101.84,104.15,105.29,105.89,105.89,105.89,101.23,102.28,103.44,102.98,104.07,105.36,103.69,103.73,102.16,102.03,102.58,104.23,104.39,103.88,99.42,99.83,101.19,100.9,100.73,100.83,103.71,104.16,105.12,105.12,106.16,105.56,106.74,106.98,104.88,103.7,101.83,104.07,104.51,104.58,105.19,104.19,105.39,104.79,104.79,103.91,102.91,102.92,102.92,106.06,108.03,113.13,111.79,113.35,113.71,111.17,111.54,109.74,109.58,106.88,107.61,108.58,110.16,108.03,108.89,106.32,106.26,107.06,107.41,106.49,105.88,105.81,107.61,108.17,107.6,106.13,105.36,107.08,107.74,108.04,108.27,109.53,109.95,108.77,107.11,107.7,109.02,108.54,108.63,107.59,107.39,105.37,105.6,105.47,104.83,104.24,102.98,103.67,102.6,102.13,102.85,103.42,103.66,103.84,102.64,103.39,101.67,101,100.81,98.83,98.11,98.96,97.89,99.11,99.11,99.11,99.64,100.57,101.55,101.5,101.43,104.18,104.18,104.63,102.96,104.57,105.23,105.34,106.28,106.36,106.79,106.79,105.5,105.08,104.99,102.93,104.79,106.22,106.51,110.51,110.71,112.14,111.65,111.17,111.57,111.21,111.57,111.27,112.21,111.32,111.3,112.49,111.92,111.35,112.86,113.8,111.23,112.42,111.51,111.65,112.05,110.45,109.78,110.61,109.85,110.24,110.14,109.68,110.33,111.22,110.56,109.7,109.51,110.55,110,110,108.75,110.2,112.45,113.25,113.09,113.63,114.95,113.87,115.54,116.64,118.3,117.96,119.16,119.39,120.89,123.75,126.02,125.39,123.15,126.14,123.34,122.88,119.53,118.21,120.8,122.43,122.88,121.95,121.93,121.92,122.37,124.55,125.3,125.3,125.3,126.94,128.97,126.99,127.68,125.43,125.6,121.38,123.58,118.62,120.79,119.82,123.04,119.44,119.09,116.17,115.73,116.64,119.6,117.83,117.53,119.48,119.79,120.97,119,119.24,117.18,114.41,113.31,115.65,115.41,116.23,115.71,118.3,118.3,118.3,118.3,116.75,117.16,115.77,114.69,114.43,116,115.02,116.3,116.99,116.91,114.83,115.37,116.72,115.81,115.83,116.16,116.54,114.17,112.98,113.54,113.08,113.44,112.83,112.33,110.01,111.33,109.05,109.73,110.78,112.36,112.36,112.24,112.87,112.23,113.82,114.49,114.41,113.83,114.84,115.91,115.5,114.18,113.96,113.35,113.16,112.9,113.02,113.38,113.38,112.52,111.4,111.68,112.28,111.24,110.42,112.57,112.61,114.73,114.57,113.45,112.46,112.46,109.85,108.35,108.31,107.04,103.59,104.25,104.89,106.66,106.15,107.3,107.08,105.03,104.03,103.68,105.53,103.77,98.66,93.65,95.67,99.3,97.38,98.47,98.3,99.34,98.04,97.8,98.23,100.18,100.7,99.83,98.9,97.71,95.53,96.5,94.03,92.2,92.97,95.96,95.72,94.26,94.47,94.87,96.85,97.78,98.52,97.99,98.83,99.85,99.66,96.85,99,97.44,95.78,94.25,92.87,94.29,91.1,91.12,91.12,92.11,90.75,90.53,91.97,92.39,92.03,92.03,89.87,89.81,88.72,91.89,92.55,94.91,93.33,93.33,93.33,94.56,94.61,96.35,97.83,97.8,98.68,98.31,97.65,95.91,95.47,94.51,93.85,93.48,93.41,94.42,93.03,92.74,92.87,93.98,95.43,96.12,95.82,97.3,96.95,95.3,94.61,94.18,93.1,92.75,92.91,90.45,89.63,88.26,88.87,89.71,89.17,87.27,89.93,89.88,91.31,90.47,90.18,88.79,87.99,88.06,86.67,84.82,85.86,86.43,86.53,86.5,86.5,86.42,85.41,85.39,86.86,86.36,86.27,84.54,85.1,86.81,88.22,88.26,90.83,90.72,90.22,89.26,89.11,89.03,92.4,92.67,91.31,89.68,89.77,87.44,86.59,88.06,88.06,88.06,88.06,90.53,90.59,89.78,92,92.7,92.64,90.89,89.94,91.53,91.87,90.04,89.18,87.23,87.72,84.7,84.28,84.62,84.93,83.4,83.32,81.07,78.18,76.33,75.82,76.52,74.46,69.14,64.58,72.66,78.12,77.69,76.4,79.5,80.52,79.39,76.82,78,79.23,80.25,79.37,79.49,81.95,81.95,80.24,79.05,79,76.02,76.61,77.14,77.89,77.89,77.89,75.59,74.86,73.43,73.53,70.5,71.16,71.57,72.97,76.97,76.97,76.64,75.28,75.07,71.82,71.82,70.22,71.4,69.55,71.79,71.99,74.63,74.77,72.76,75.1,74.06,72.59,72.75,72.53,74.69,76.51,78.22,77.47,76.65,76.65,79.1,78.76,80.99,80.22,80.25,77.42,77.34,78.6,76.56,77.7,78.04,79.62,77.36,78.71,80.46,82.44,83.25,81.15,80.86,80.86,80.65,80.6,79.58,79.51,79.64,77.21,75.85,75.36,75.15,73.38,75.61,74.85,75.71,74.87,74.95,74.64,75.78,74.79,74.69,72.62,72.52,70.68,71.05,72.56,72.79,71.94,71.66,70.07,71.96,72.32,71.87,70.95,71.24,70.66,70.87,70.61,70.12,69.24,72.23,72.99,72.48,72.14,72.4,71.1,70.37,69.37,69.14,68.69,67.88,69.9,69.9,69.95,68.24,68.65,67.71,66.85,67.55,66.1,65.34,64.48,64.73,64.86,62.84,62.35,62.37,61.77,61.77,65.65,65.23,64.07,62.02,60.43,60.03,58.65,59.37,59.41,60.71,59.04,58.13,58.19,53.94,54.63,55.03,55.29,53.04,52.08,54.94,56.48,54.53,57.82,59.44,59.09,58.37,57.13,61.88,63.06,66.12,65.66,64.76,64.6,63.3,62.24,62.7,63.2,62.97,61.93,65.77,67.23,67.34,67.17,70.73,70.16,67.84,70.31,72.08,69.9,70.18,70.69,69.52,69.97,69.65,68.26,68.55,70.83,70.06,70.06,70.06,71.43,70.61,70.71,70.71,72.07,74.52,75.64,75.34,76.84,76.6,77.1,77.11,77.95,77.52,77.14,77.42,77.12,78.92,78.92,78.92,78.92,81.28,81.98,79.06,78.31,79.73,79.16,77.91,75.82,76.27,75.82,77.13,75.15,75.35,74.99,74.02,74.77,73.73,74.5,73.03,72.06,72.35,70.7,70.35,69.41,72.92,72.32,73.19,73.16,72.9,70.95,70.13,67.98,69.5,67.91,69.18,68.37,69.77,68.23,69.08,70.03,72.1,71.66,70.12,70.97,72.55,73.01,73.5,73.2,72.51,72.51,72.71,72.71,72.71,73.3,72.42,72.51,72.92,74.42,73.85,72.65,72.72,71.34,71.01,69.62,70.18,70.4,70.68,70.68,70.45,69.49,70.86,71.69,72.74,71.03,70.48,70.61,70.28,71.5,71.6,69.99,70.82,69.54,70.59,69.64,68.32,66.8,66.8,65.93,66.27,65,64.86,67.8,68.17,68.34,68.98,68.97,69.49,69.45,69.8,69.36,71.43,72.06,71.47,70.18,68.61,68.61,67.44,67.2,68.6,68.77,67.78,67.76,69.51,69.75,68.44,66.11,65.37,65.76,66.4,67.26,69.01,69.17,69.17,67.5,67.31,67.12,67.65,66.14,69.65,69.07,70.35,71.8,72.76,72.29,70.34,70.16,71,71.02,69.48,69.75,69.91,68.98,67.75,67.14,66.16,66.36,64.83,63.6,64.31,64.51,66.1,65.13,65.87,67.36,67.04,66.78,66.78,68.9,67.46,67.54,66.6,66.6,66.43,66.02,65.76,66.18,66.54,65.49,65.76,65.19,64.32,66.05,64.65,63.6,64.01,63.18,64.84,64.84,62.74,62.04,62.1,63.01,63.26,63.83,64.68,66.1,64.5,63.8,64.25,64.08,62.48,61.92,61.92,61.16,61.74,61.8,63.06,62.86,61.82,61.8,62.34,63.83,65.2,64.2,63.7,63.6,62.23,63.16,62.9,65.43,64.51,63.01,64.37,64.09,64.07,65.08,63.71,63.54,62.83,61.37,61.78,60.76,60.15,59.16,59.73,59.23,59.04,58.35,59.21,58.54,58.78,60.12,59.42,58.98,59.19,59.27,57.89,57.89,57.89,59.1,60.8,60.84,59.82,59.36,59.58,59.13,57.8,57.47,57.17,57.95,57.81,57.44,56.35,54.13,54.55,54.07,52.75,54.22,56.45,57.67,56.53,57.04,55.64,54.78,55.09,55.04,55.02,57.73,57.18,56.53,55.97,55.97,55.97,56.81,57.07,58.63,57.85,58.21,59.51,60.73,60.8,60.36,61.24,59.99,59.88,60.42,60.25,58.67,59.83,59.21,59.66,60.63,62.75,62.57,62.3,61.38,61.68,60.96,61.21,62.28,60.72,60.69,61.44,60.41,61.28,61.28,61.28,62.86,61.96,61.96,61.84,61.9,62.17,63.46,63.32,62.01,61.76,60.58,60.64,61.21,60.61,61.5,62.8,64.33,64.55,66.12,66.26,66.16,66.16,67.89,69.05,69.31,68.83,68.09,69.19,70.86,71.31,71.1,71.1,72.47,73.14,73.45,71.94,71.9,70.68,69.66,70.53,70.51,69.16,68.16,67.42,68.89,69.12,69,69.13,68.66,68.66,68.05,67.07,67.73,67.23,67.22,67.16,69.48,69.14,67.92,67.93,68.18,68.31,66.7,66.78,66.78,67.23,68.08,68.24,67.31,66.28,66.18,65.93,67.2,68.89,67.72,66.62,66.42,66.51,65.02,65.96,65.33,64.78,63.45,63.39,64.13,63.14,64.41,64.19,63.01,61.98,61.72,62.57,62.66,63.47,63.59,63.8,63.54,63.65,64.99,65.66,65.34,64.77,65.64,65.59,66.22,66.51,65.66,65.88,66.77,65.51,65.42,64.69,64.39,64.39,63.31,63.56,63.09,63.46,64.03,64.23,65.13,65.13,66.5,67.3,67.38,70.81,71.35,74.74,76.99,79.2,79.2,84.81,83.47,86.02,87.86,78.92,77.68,80.37,80.37,79.94,76.75,76.65,75.72,78.8,77.42,77.65,78.87,77.61,77.89,77.95,78.23,76.85,76.61,77.44,77.7,79.69,77.66,79.59,78.69,77.57,75.16,75.2,73.54,73.61,74.43,74.69,74.78,74.19,72.63,72.37,72.26,74.11,73.03,73.26,73.92,74.58,74.72,73.97,75.26,77.63,77.05,76.45,77.62,75.79,75.22,74.94,75.73,75.43,75.34,76.08,77.03,77.03,77.03,77.04,76.78,76.88,74.78,75.5,75.25,74.35,73.73,73.6,72.75,72.18,73.69,73.95,74.87,74.97,76.31,77.21,75.69,75.56,77.12,77.86,77.85,77.85,77.85,77.85,77.87,80.61,79.8,81.1,82.09,83.81,82.71,84.98,84.4,87.87,87.78,89.38,89.25,87.77,91.4,90.9,89.63,92.73,92.12,88.77,88.8,88.25,91.02,94.26,94.01,92.02,92.34,91.56,91.13,93.63,94.16,96.79,96.64,94.39,92.2,93.34,90.87,91.27,91.52,90.77,89.82,90.04,89.98,88.8,88.8,76.59,78.37,79.47,80.87,82.28,84.01,84.19,82.04,83.29,83.29,83.29,83.85,85.6,84.97,85.22,85.22,85.09,85.17,85.17,86.81,86.81,87.13,86.93,87.54,87.63,90.27,88.44,90.62,89.75,89.31,89.23,90.58,91.34,90.25,90.53,88.99,89.33,89.05,90.27,88.93,88.16,89.85,90.45,91.59,91.01,92.6,92.46,93.5,92.07,91.28,92.07,91.7,90.64,88.7,89.93,90.67,92.39,93.43,92.85,92.41,91.52,91.52,92.02,91.21,90.8,90.79,91.84,90.67,91.42,91.62,92.1,93.62,93.45,93.37,94.77,95.34,95.71,97.46,97.63,96.5,96.78,96.46,95.32,93.68,92.85,93.79,94.4,94.21,94.72,93.81,93.74,94.04,96.5,96.28,95.33,95.27,94.98,95.06,94.65,95.76,97.53,96.48,95.13,94.04,94.37,96.2,96.06,95.44,94.25,95.52,96.2,97.47,98.38,97.66,98.77,98.97,98.99,101.21,99.73,99.9,98.83,97.98,99.59,99.6,98.11,99.71,100.77,100.77,102.56,101.86,100.96,100.96,100.44,100.51,98.7,97.26,95.75,97.56,97.65,95.04,97.37,98.11,97.28,98.09,98.75,99.84,98.88,98.88,98.57,96.69,97.65,96.74,96.64,98.67,97.74,99.59,99.78,100.6,101.23,99.11,98.38,96.76,96.51,96.43,94.07,95.75,96.59,96.63,96.66,96.29,96.74,96.84,95.22,96.04,97.01,95.8,94.25,94.44,94.22,95.75,94.05,92.36,93.27,93.25,93.87,94.28,94.01,94.02,94.02,94.02,93.77,94.82,94.01,96.7,96.48,97.49,96.38,95.33,95.43,97.24,97.93,98.24,97.73,97.25,96.33,95.92,96.21,96.12,96.61,96.47,97.5,100.32,100.74,98.26,95.76,95.48,95.43,95.9,95.25,96.69,97.48,97.74,96.76,95.26,95.66,95.66,95.66,95.66,94.49,97,95,95.28,92.96,93.43,91.77,90.79,89.47,89.13,90.99,90.5,91.86,91.8,91.75,91.45,92.98,93.09,93.18,91.71,90.42,87.62,89.64,90.52,88.48,89.16,88.58,88.32,89.69,89.19,89.19,89.19,89.19,91.51,90.82,91.28,90.72,91.45,91.95,93.92,93.28,93.85,94.32,92.83,92.1,92.55,92.35,91.17,92.87,91.56,91.56,92.54,92.07,92.82,94.07,93.75,93.7,93.68,93.61,93.43,91.66,90.68,91.12,90.75,89.38,90.18,90.18,90.45,89.25,88.21,88.86,89.73,92.42,90.66,89.66,88.98,87.97,87.79,87.73,86.66,88.32,88.33,86.9,85.89,84.12,84.12,83.47,81.83,81.89,80.24,78.68,80.21,79.71,79.71,80.28,81.2,82.39,81.95,85.26,84.34,84.78,85.07,85.46,86.31,87.73,85.81,88.4,88.17,87.02,88.09,87.23,88.22,88.97,90.95,91.17,90.83,91.25,90.43,90.74,89.63,89.98,90.93,89.94,89.08,88.87,87.96,89.01,89.15,89.34,90.15,91.06,89.34,89.07,90,89.54,89.54,89.78,89.25,89.12,88.43,90.22,88.9,88.56,88.26,87.27,86.97,87.37,86.53,86.55,86.22,86.75,87.95,88.19,87.26,87.18,86.12,86.66,86.26,86.69,86.69,84.69,84.92,85.73,85.24,84.48,85.93,86.15,86.21,86.3,85.46,85.72,85.72,84.69,83.77,81.09,81.8,82.28,81.91,82.17,81.79,82.92,83.38,83.38],"KOSPI200":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100],"Nikkei225":[100,100,98.66,100.25,100.21,94.85,101.22,101.4,103.14,103.11,104.25,104.25,104.86,105.67,106,106,107,107.27,107.13,106.84,106.85,108.04,107.54,106.65,107.15,107.95,109.52,110.87,111.79,112.35,112.37,112.48,113.23,113.17,113.77,113.48,113.38,113.38,113.2,113.24,113.23,111.73,111.55,111.55,111.55,114.35,113.93,113.54,113.54,112.65,113.01,111.67,112.56,111.44,109.8,110.27,111.31,111.69,110.25,109.65,111.22,113.23,113.61,113.04,111.13,111.75,110.39,110.41,110.75,110.37,110.93,110.35,113.1,113.57,112.28,113.44,112.91,112.26,112.35,113.11,113.1,113.05,112.54,111.51,111.58,113.18,114.18,113.62,113.1,112.89,112.37,112.75,114.41,114.58,114.44,114.26,114.33,113.93,113.93,113.55,111.13,111.38,112.42,110.8,112.07,112.16,111.26,110.36,110.79,109.78,110.08,108.53,108.93,109.71,109.41,108.28,107.54,107.01,107.12,107.49,107.57,107.56,108.67,110.16,111.35,112.58,112.36,112.03,112.7,113.49,113.49,113.49,113.49,116.11,115.81,116.14,116.5,116.04,115.96,116.25,115.64,114.12,114.33,114.84,114.47,115.22,115.63,114.89,114.87,114.84,114.68,115.91,117.76,117.72,116.61,116.63,116.19,116.8,116.19,116.13,116.04,115.74,116.39,117.12,118.07,117.53,117.37,117.5,117.62,118.04,117.48,118.01,116.92,117.05,116.91,117.2,116.69,116.31,117.19,117.86,117.3,117.3,117.42,117.42,116.72,116.84,117.57,117.3,116.58,116.46,117.02,117.19,116.49,116.29,116.64,117.19,116.89,116.44,117.05,116.7,115.2,115.15,115.15,114.02,115.28,115.14,114.99,113.63,113.18,113.13,113.42,112.95,113.53,113.51,113,113.84,114.66,114.92,113.85,113.14,112.98,113.2,112.49,114.07,115.42,115.94,115.6,116.19,116.19,118.47,118.53,118.75,118.45,119.04,118.65,118.28,118.84,118.8,119.06,120.31,120.38,120.39,120.75,120.75,121.53,121.87,122.29,123.46,124.05,124.52,124.68,125.18,125.23,126.62,127.26,126.69,126.88,128.44,128.46,128.46,130.85,131.54,131.54,131.59,133.87,133.73,133.46,132.37,130.62,130.61,128.56,130.44,130.71,129.92,130.83,131.45,131.45,131.61,131.29,131.23,131.88,132.63,133.17,132.52,132.03,129.43,131.3,133.13,133.87,133.45,132.82,132.45,131.62,133.66,133.46,133.6,133.45,133.66,133.88,133.6,133.71,132.97,132.86,132.86,132.86,137.19,138.4,138.4,139.19,138.83,138.38,138.05,138.4,139.79,139.3,138.69,138.95,138.99,140.79,139.72,138.14,137.92,137.9,135.93,134.8,137.07,135.83,132.38,126.12,126.32,127.76,124.79,124.79,123.99,123.46,125.27,126.76,129.27,127.96,128.22,126.86,127.77,129.29,130.67,128.79,126.79,123.62,122.8,125,124.03,124.71,125.3,127.37,128.21,127.09,127.25,126.51,125.37,124.78,124.78,126.01,120.33,121.19,124.41,122.74,123.49,125.21,124.83,124.26,124.42,126.33,125.87,126.52,127.19,126.57,126.41,127.1,127.43,127.51,129.32,129.51,129.34,128.91,130.02,129.65,130.26,131.13,131.13,131.36,131.15,131.15,131.15,131.12,131.36,130.78,131.3,132.82,133.45,133.17,132.58,133.29,133.82,134.24,134,132.42,130.95,131.03,131.2,130.49,128.5,129.57,129.39,131.17,131.54,132.05,133.2,132.45,133.09,133.52,134.03,132.71,133.37,132.37,130.02,131.64,132.44,131.41,130.37,130.39,129.98,129.97,130.17,127.3,127.14,126.74,125.75,127.16,128.7,129.54,128,129.49,131.88,131.88,132.46,133.03,132.86,132.47,130.71,131.37,131.98,131.82,132.55,131.57,131.63,132.75,131.39,131.46,131.36,132.26,132.15,131.89,130.13,127.56,130.47,129.59,129.52,129.97,129.56,129.68,130.51,130.79,131.91,133.06,133.14,133.34,133.47,133.44,132.52,132.46,131.78,131.24,130.19,130.57,132.27,131.92,133.19,134.78,134.78,136.69,138.16,138.17,139.31,139.31,139.72,140.26,138.88,140.77,141.5,141.65,140.71,139.92,138.8,138.8,136.97,137.18,131.84,132.45,129.98,131.6,133.3,132.24,131.5,131.98,128.46,128.93,124.13,123.64,123.43,125.23,127.93,126.57,129.82,127.81,129.26,128.9,131.24,129.86,129.97,127.29,127.5,127.25,126.53,127.35,125.96,125.52,126.33,126.33,127.3,128.12,129.43,129.93,130.44,131.75,128.6,127.92,125.49,126.52,123.84,123.42,126.08,127.32,124.75,125.52,123.23,122.49,119.01,117.69,117.69,111.8,112.79,117.18,116.81,116.81,116.81,116.81,114.17,116.95,117.91,119.21,117.68,118.82,118.82,119.96,119.31,119.07,120.61,120.92,120.36,120.19,120.08,121.24,120.51,120.6,119.97,121.24,121.32,121.88,121.65,121.82,121.11,118.67,118.67,121.77,123.4,123.37,121.98,124.2,124.32,125.08,125.27,125.04,125.64,125.18,125.81,124.81,126.08,127.36,126.8,126.04,125.22,122.71,123.29,125.5,124.25,124.23,125.19,125.97,125.87,126.11,126.11,126.22,122.42,125.06,124.77,122.76,123.76,125.53,125.51,126.72,126.79,127.27,127,127.24,126.57,126.71,127.64,129.38,129.69,130.02,128.92,129.57,129.67,129.91,129.56,130.19,129.9,129.9,129.9,129.9,129.9,129.9,129.9,127.95,126.08,124.91,124.57,123.67,122.95,123.66,122.93,124.02,124.32,124.15,124.21,123.44,123.24,123.62,124.08,122.58,122.22,120.23,119.12,119.11,121.25,121.24,121.89,123.34,123.75,123.32,122.75,123.24,123.28,122.4,124.51,125.26,124.07,124.23,123.69,123.06,124.53,124.17,126.82,126.96,126.28,126.66,126.91,125.68,125.86,125.67,126.31,126.56,126.56,125.68,125.3,122.83,125.28,124.99,126.18,126.7,126.97,126.4,126.16,126.7,125.6,125.72,123.07,120.93,120.14,119.74,120.19,120.72,120.72,119.38,120.55,119.09,119.17,120.01,120.67,120.33,120.39,120.87,118.25,119.38,119.52,119.41,120.83,120.34,120.37,120.51,123.06,123.72,124.42,124.85,126.05,126.99,128.33,128.33,128.4,128.17,128.65,128.86,128.86,128.97,128.51,128.68,127.69,126.97,127.72,127.1,124.55,124.95,124.75,125.99,125.22,125.78,127.22,127.22,129.6,131.15,131.03,131.27,131.6,131.6,132.04,132.78,133.06,133.46,134.08,133.32,133.8,133.36,133.36,135.7,136,136.16,136.52,136.17,137.27,136.1,135.06,136,136.66,135.94,135.1,134.46,134.89,135.94,136.41,136.79,136.62,135.95,137.32,136.45,135.02,135.98,136.3,136.74,136.62,136.52,136.71,140.2,139.79,140.45,139.68,139.28,139,139.02,139.08,138.8,139.63,139.12,138.06,138.06,138.06,138.06,135.43,137.59,135.43,138.55,139.19,139.19,140.21,139.58,139.68,140.31,140.55,139.28,140.25,138.87,139.06,136.24,135.49,136.44,134.1,135.43,134.07,134.72,136.1,139.33,139.06,138.23,138.23,139.26,139.06,138.24,137.28,135.36,136.57,137.03,136.49,136.49,131.93,130.88,128.09,123.39,124.57,123.04,123.14,124.48,121.1,114.96,115.95,113.31,108.32,101.73,99.23,99.28,97.62,96.6,96.6,98.56,105.59,114.08,108.93,113.16,111.38,110.4,105.43,103.99,104,108.41,110.6,112.95,112.9,113.8,111.14,114.61,114.1,112.58,116.12,114.79,112.52,111.69,113.39,112.42,115.46,115.39,115.39,117.85,114.5,114.5,114.5,114.5,114.82,117.77,119,118.86,118.28,116.22,116.94,117.5,119.25,120.2,119.95,118.99,121.05,124.14,125.01,127.91,127.68,128.76,130.29,131.98,132.46,133.44,135.27,134.76,134.96,131.15,130.18,125.66,131.79,131.05,130.47,131.19,130.95,131.6,131.51,129.91,131.38,128.37,130.08,129.11,129.25,130.18,132.56,131.98,130.95,131.48,130.09,132.97,131.82,133.91,132.89,132.46,132.58,133.55,132.78,132.78,132.78,132.57,132.23,130.71,130.37,126.7,129.53,131.74,131.4,130.83,130.32,130.32,132.77,133.32,135.69,135.92,134.8,134.53,134.88,133.53,133.77,134.15,135.96,135.93,135.45,133.55,135.05,135.04,135.67,136.95,135.43,134.76,135.83,134.42,135.6,136.6,137.49,136.89,137.01,136.09,136.33,136.33,136.33,136.25,134.74,135.42,137.22,137.38,135.31,135.31,134.41,136.05,136.76,136.7,138.01,137.85,137.49,137.74,137.89,137.19,136.63,138.15,137.54,137.96,137,137.25,137.12,137.07,136.67,136.17,134.1,135.96,135.96,138.29,140.68,141.96,144.97,145.35,147.94,148.94,148.15,151.2,151.82,150.15,149.61,148.98,148.98,152.71,153.47,154.87,155.5,154.27,156.34,156.41,156.46,156.12,154.93,154.46,156.51,156.15,155.55,156.01,155.75,156.16,156.45,156.19,155.91,154.29,154.8,155.64,155.57,156.72,160.89,160.17,160.17,159.08,158.5,157.9,160.44,164.22,164.22,164.37,166.08,167.49,166.44,164.82,167.11,166.47,167.83,167.1,168.21,166.6,167.12,164.56,161.45,163.94,165.52,167.18,165.41,167.96,171.51,172.2,172.53,172.53,172.28,175.57,177.81,176.79,176.46,175.19,175.99,175.99,173.17,176.07,169.05,173.12,171.63,172.51,168.84,168.46,167.75,169.41,169.46,170.48,173.44,173.72,174.62,174.58,176.35,173.87,170.26,169.22,165.78,167.67,170.28,171.49,171.77,170.29,171.52,174.23,175.6,173.31,173.51,173.39,173.73,172.39,173.63,172.87,173,173.24,173.25,169.83,166.38,170.35,169.37,169.98,169.2,169.56,169.56,168.15,168.15,168.15,168.15,171.18,171.34,172.27,166.96,164.27,160.19,163.9,162.39,165.79,163.67,163.98,165.27,165.54,166.64,167.16,166.62,170.12,168.43,168.16,168.93,169.59,168.91,169.36,169.03,168.44,169.01,168.95,170.19,171.82,170.95,169.35,169.04,163.48,168.57,168.52,168.52,169.63,169.53,168.15,168.03,167.54,167.98,166.9,167.17,165.55,164.1,163.06,166.73,167.6,166.96,165.04,163.43,161.38,159.84,160.77,160.77,160.77,162.44,163.24,160.97,162.14,159.23,162.13,161.32,160.98,161.82,162.36,162.36,162.76,163.82,163.5,163.28,160.63,160.05,160.99,159.22,157.65,160.46,161.85,161.81,161.91,161.32,162.18,163.93,166.04,166.58,170,173.1,174.59,176.14,175.13,177.31,177.69,178.99,178.07,176.97,178,178,174.15,172.98,172.98,176.54,176.48,176.16,172.42,171.89,167.91,166.01,162.37,160.66,161.53,163.7,166.32,164.76,164.23,166.63,169.65,169.4,170.51,170.74,167.55,168.11,166.92,169.87,169.82,168.2,168.62,173.02,172.29,172.29,173.88,172.82,172.21,170.91,169.87,170.87,172.81,173.78,173.96,173.26,172.74,173.6,173.77,173.77,171.01,172.16,167.8,165.07,162.37,163.04,161.97,163.58,162.99,166.07,168.43,167.65,165.97,167.15,165.94,166.09,169.63,166.6,163.05,166.43,166.69,168.07,167.98,167.36,169.65,168.7,168.03,168.03,168.03,171.01,171.19,166.26,166.2,166.2,164.71,167.88,166.27,164.14,165.36,164.91,160.3,162.09,160.62,161.01,158.34,157.64,152.73,155.93,157.59,158.03,160.69,158.98,160.14,159.03,159.24,160.96,161.64,161.64,158.04,156.79,160.26,158.93,158.29,157.05,154.36,154.36,151.57,154.52,154.81,156.67,154.03,155.11,151.65,147.2,144.68,144.25,149.93,146.85,147.7,147.93,150.35,155.55,156.57,156.57,158.88,163.65,164.06,164.29,163.08,164.88,163.57,162.37,161.46,161.87,162.17,159.62,156.92,157.49,156.53,153.69,156.66,158.58,158.12,156.41,157.49,158.85,160.8,158.19,155.19,155.82,154,156.69,156.69,156.52,156.52,156.52,156.52,157.6,153.6,152.71,152.99,150.27,154.23,154.93,155.59,157.06,154.09,156.05,157.58,156.11,155.69,155.27,156.3,159.73,159.21,160.25,159.99,162.02,162.92,163.08,164.78,164.85,162.39,157.5,155.41,153.64,154.26,151.52,150.4,153.18,152.61,152.74,154.61,156.82,157.86,156.43,154.03,151.36,152.64,154.21,152.37,154.6,154.76,156.48,153.7,154.53,155.49,156.34,156.34,157.35,161.55,162.26,162.91,161.66,161.4,161.75,162.33,162.25,163.37,161.05,161.9,163.02,164.44,164.87,163.41,162.36,162.36,166.6,168.5,168.48,170.55,168.91,168.84,168.05,166.05,165.24,166.21,167.15,162.7,164.55,163.95,161.44,161.37,161.19,161.23,160.09,163.79,164.66,166.58,167,162.35,162.69,160.89,160.89,161.59,159.4,158.47,158.47,154.26,155.08,152.75,154.2,151.37,153,157.53,158.28,159.39,158.25,158.25,154.08,154.05,153.12,158.1,156.27,158.49,159.08,157.62,156.94,157.43,159.04,160.1,159.59,158.19,161,161.54,161.45,161.45,158.74,160.65,162.66,161.76,160.18,164.95,163.2,163.35,163.58,163.01,162.83,163.09,164.09,164.09,165.65,165.06,164.36,163.57,163.23,164.73,162.12,162.36,162.75,161.58,160.93,162.83,162.49,163.15,164.32,163.71,160.65,158.96,155.05,154,154.7,153.11,154.11,154.35,153.73,152.29,152.29,152.29,152.29,150.09,150.69,151.59,151.59,152.76,154.34,154.36,152.44,150.7,152.55,156.36,154.1,154.97,157.03,159.32,159.88,159.69,159.81,160.1,159.48,159.6,159.92,160.55,161.62,161.58,161.11,160.99,161.49,160.07,161.09,160.5,161.64,160.57,160.68,160.34,158.18,158.18,160.22,160.05,160.18,160.59,160.49,162.99,164.8,165.22,166,167.05,164.25,162.44,158.87,158.91,157.64,159.52,157.26,157.26,160.3,160.02,159.82,160.36,160.6,162.73,162.14,163.65,164.51,165.09,162.32,160.33,160.6,161.27,162.96,163.89,164.33,166.29,166.42,167.26,166.95,167.25,166.71,166.88,167.03,165.84,166.08,168.41,169.97,170.17,170.17,170.17,170.17,168.95,170.66,169.96,169.99,171.51,172.9,174.17,175.63,178.43,179.8,181.43,180.67,179.07,179.76,180.43,182.28,182.83,180.27,181.78,183.98,188.02,189.71,186.25,184.66,188.3,189.29,192.7,195.52,195.43,196.71,194.75,194.86,195.95,194.14,191.32,190.83,189.9,193.72,193.96,193.7,196.99,195.06,194.57,191.27,189.02,187.86,187.94,186.43,189.2,189.04,189.04,189.64,191.99,189.62,188.53,190.85,190.74,190.66,191.96,191.19,193.6,195.37,190.89,187.69,187.88,188.24,188.96,187.95,189.52,189.52,187.11,188.15,185.39,184.57,183.55,184.22,185.92,186.82,188.43,184.56,187.75,188.08,188.7,190.37,190.9,192.24,192.81,194,192.54,190.3,189.49,191.29,190.88,193.57,195.7,195.7,194.01,192.73,190.09,189.1,190.72,188.59,188.93,186.01,185.92,185.35,182.31,178.16,181.36,180.89,180.89,185.28,186.39,189.64,188.6,184.77,186.99,187,183.43,182.43,180.92,181.28,182.49,178.6,180.87,179.15,180.1,184.43,186.46,186.46,190.89,188.34,187.73,190.53,190.07,190.17,190.82,195.62,195.07,196.01,194.86,194.66,195.23,195.23,196.24,195.2,194.98,194.47,195.43,195.11,193.94,191.28,195.19,191.76,188.55,191.38,191.68,192.16,190.76,192.42,191.19,193.87,196.54,193.41,193.58,194.07,194.38,196.57,195.74,195.3,195.3,195.3,194.27,194.79,194.79,197.05,201.01,204.56,207.63,209.53,207.88,207.05,206.98,209.89,213.29,213.12,211.42,211.48,208.65,210.26,210.48,211.77,210.17,211.02,212.17,211.04,210.8,215.14,215.34,215.34,221.56,220.04,222.69,224.62,224.52,223.89,223.3,228.18,228.18,228.97,229.01,228.82,228.58,232.92,234.08,234.01,233.97,231.1,231.63,226.56,226.43,225.83,226.48,225.9,231.93,233.47,233.47,238.2,238.63,235.86,235.77,237.9,234.43,235.6,232.3,232.5,230.25,232.12,227.56,229.63,232.12,231,230.19,230.66,228.97,224.52,221.55,222.24,216.34,218.5,219.16,224.46,219.6,221.39,221.39,224.14,223.37,223.15,223.15,223.15,226.65,222.95,222.2,223.11,222.82,223.85,224.02,227.14,226.37,228.02,227.3,225.37,228.21,225.54,227.03,226.76,225.02,222.09,224.62,227.16,226.66,224.63,225.88,225.76,227.83,228.4,226.89,225.98,226.53,222.37,224.59,225.1,225.47,225.25,226.47,228.62,231.5,229.6,231.01,231.29,233.88,236.83,238.78,238.77,238,242.67,244.14,246.42,240.39,240.39,240.89,239.85,234.18,233.82,231.1,231.08,228.51,221.01,219.83,224.51,224.84,228.2,222.51,209.57,183.6,202.37,204.79,203.28,204.41,204.41,211.46,212.68,214.34,222.14,218.2,222.14,221.49,223,223.9,222.42,223.46,223.94,223.89,225.55,225.86,225.78,216.21,213.94,212.38,211.36,211.03,207.88,214.96,213.5,213.5,211.29,212.32,216.84,220.16,220.16,221.43,221.02,227.17,232.45,221.3,225.58,220.66,224.99,225.48,229.55,227.24,229.23,229.83,231.14,231.14,232.92,228.66,227.09,227.5,227.34,224.18,222.38,222.61,221.27,225.31,227.05,229.23,228.08,222.09,222.09,224.54,230.41,229.83,230.53,230.72,229.8,225.98,224.9,225.52,223.06,224.19,223.83,221.93,223.43,226.33,224.35,222.56,223.81,222.99,224.77,229.06,229.22,229.92,228.14,228.55,229.75,229.78,232.56,230.35,230.28,229.74,228.09,226.52,225.87,228.55,227.82,228.37,230.92,235.09,232.83,232.83,232.83,232.83,229.4,233.93,233.33,231.14,228.72,228.72,224.54,224.37,225.11,224.41,227.04,227.77,231.38,233.2,233.05,230.91,227.71,230.03,230.61,230.95,224.81,226.43,226.63,228,226.37,226.45,226.45,227.4,230.3,228.48,228.63,229.19,228.57,225.73,226.31,226.31,223.16,222.6,223.27,216.84,220.52,217.87,218.38,220.05,215.28,216.1,214.73,214.88,214.71,216.25,218.25,220.87,220.32,220.32,219.89,219.49,220.49,221.93,220.61,216.64,207.87,207.91,208.5,202.72,197.15,181.72,192.67,185.09,201.98,196.01,198.33,199.99,197.96,200.63,202.69,200.06,199.72,203.5,204.49,208.38,209.17,209.17,210.37,212.74,214.95,214.95,214.95,214.65,215.52,218.87,219.7,222.84,222.52,220.35,220.34,218.85,219.03,217.68,215.85,216.87,219.04,220.16,220.15,224.3,221.57,218.68,218.54,220.3,219.17,220.26,222.29,223.01,224.23,222.78,220.81,223.59,224.9,226.94,224.62,224.13,223.84,226.39,227.27,231.02,234.32,236.29,233.36,232.06,232.2,232.34,231.04,231.63,232.4,231.38,230.93,230.29,231.57,231.48,232.87,232.39,232.39,232.13,240.28,244.1,241.94,239.27,237.38,237.27,239.69,238.11,235.14,236.65,238.08,239.63,244.07,244.07,249.31,252.56,248.91,253.16,255.12,254.14,250.3,248.68,248.81,249.83,247.42,248.15,249.95,249.31,246.22,246.93,244.76,248.5,251.06,254.71,253.63,255.84,258.96,261.27,261.27,262.05,261.4,264.4,262.89,265.51,265.51,266.3,267.03,264.7,262.88,262.23,260,262.26,267.12,279.81,279.85,278.59,283.52,280.65,280.65,273.41,278.22,281.75,277.69,287.05,287.81,287.77,283.88,287.72,294.8,293.09,299.44,299.54,305.88,305.88,300.54,293.04,296.96,293.42,297.13,296.73,298.01,299.29,294,293.7,284.24,283.27,290.78,283.79,283.79,283.98,289.23,292.78,293.29,287.74,287.74,291.02,297.81,294.68,295.2,295.63,295.32,292.67,296.69,292.79,288.21,288.96,285.98,288.93,294.15,294.22,293.81,294.19,296.19,294.88,293.79,293.79,293.79,302.5,306.5,303.26,298.33,303.13,303.13,312.52,317.14,315.8,314.78,312.72,309.26,308,313.33,314.26,308.64,311.26,311.41,311.51,311.2,307.3,319.36,316.86,314.09,316.63,328.95,336.46,336.46,336.39,332.32,331.53,330.13,333.5,335.39,331.64,331.64,334.53,341.9,342.89,343.46,338.83,328.45,316.58,322.61,324.61,307.73,316.6,321.13,317.79,314.1,313.7,313.4,322.38,311.49,311.49,300.65,304.95,313.69,312.84,311.49,302.81,298.01,313.63,306.18,310.03,311.73,311.82,328.62,326.21,332.22,329.76,337.78,339.28,347.36,341.27,343.31,346.37,347.75,345.15,348.51,353.3,349.69,349.69,345.99,347.33,347.33,347.33,347.33,366.71,366,364.28,366.17,369.26,365.66,358.39,354.93,353.38,349.03,360,369.65,380.27,379.32,379.34,377.56,387.11,390.64,389.47,399.2,393.77,388.62,373.66,381.78,374.56,374.78,385.3,404.55,405.05,407.96,414.68,415.82,422.27,407.29,403.71,422.34,404.8,405.42,408.89,411.3,401.13,407.03,407,398.36,389.96,395.36,400.11,392.44,395.36,401.24,390.06,374.34,374.34,386.54,385.86,387.65,377.08,378.95,363.97,358.54,361.07,375.62,372.08,373.26,386.94,383.34,382.89,390.85,390.85,394.08,398.66,401.02,403.98,393.71,381.25,386.45,385.28,382.43,384.35,386.71,385.95,387.55,387,386.44,375.41,374.76,379.47,387.52,380.92,380.18,380.93,373.58,370.55,370.5,373.06,374.31,379.46,379.46,379.46,379.46,382.35,387.31,384.47,382.16,389.58,402.44,398.66,408.22,412.52,408.74,402.94,402.87,402.87,395.56,395.36,376,381.24,378.86,373.95,377.14,367.14,365.88,362.95,369.24,373.24,377.36,369.37,368.15,368.15],"S&P500":[null,null,100,102.22,102.61,103.74,103.95,103.8,103.79,104.57,104.4,104.89,104.64,105.42,105.65,105.73,105.73,106.15,105.59,105.73,105.45,105.08,105.12,105.73,106.09,107.49,107.72,108.36,108.24,108.95,108.06,108.48,108.29,108.51,108.9,108.63,108.43,108.57,108.57,108.81,107.9,107.87,107.37,107.37,108.28,108.9,108.82,109.2,108.81,108.81,109.12,108.88,109.09,109.09,108.76,108.95,108.56,108.93,108.63,109.35,110.22,110.14,110.05,109.39,109.29,109.32,109.38,110.18,109.95,109.97,110.05,110.68,111.07,111.66,112.1,112.66,112.57,112.76,112.76,113.44,113.31,113.36,113.53,113.65,113.35,114.9,114.23,114.29,113.91,113.58,113.32,113.41,113.78,113.83,113.44,114.39,114.21,114.05,113.83,112.41,112.63,112.51,112.41,112.3,113.11,113.23,113.57,113.31,113.12,113.19,112.84,113.06,112.97,113.04,112.88,112.46,111.69,111.69,112.65,112.33,112.13,112.98,112.64,113.86,114.55,114.5,114.56,114.34,114.54,114.67,114.53,114.6,115.06,115.07,114.95,115.08,114.83,114.66,115.21,115.13,113.04,113.45,114.22,114.81,115.02,115.31,115.82,115.86,115.86,115.72,115.66,116.54,116.97,116.83,116.5,116.69,116.72,116.62,116.51,117.03,116.92,116.65,116.69,117.66,116.87,116.81,116.75,116.93,116.97,116.03,117.05,116.04,116.22,116.49,116.49,116.66,115.57,116.31,116.41,116.32,117.17,117.39,117.94,117.93,118,118.64,118.62,118.58,118.45,118.8,118.83,118.71,118.56,118.47,118.76,118.82,118.56,118.78,118.98,118.69,118.65,116.93,117.08,118.26,118.2,118.36,116.54,116.32,116.46,117.62,117.21,116.97,117.16,117.22,117.32,117.86,118.53,118.77,118.77,117.87,118.24,118.22,118.04,119.32,119.72,119.82,119.68,119.9,120.08,120.21,120.29,119.92,120,119.73,119.74,120.23,120.38,120.82,121.29,121.55,121.7,122.39,122.26,122.04,122.32,122.54,122.34,122.44,122.66,122.74,122.83,122.87,123.5,123.01,123.21,122.63,122.79,123.78,123.39,123.5,123.7,123.72,124.11,124.26,124.24,124.42,123.95,123.84,123.96,123.68,122.99,124,123.68,123.83,124.64,124.55,124.55,124.81,124.76,125.99,125.94,126.97,126.71,126.58,126.11,126.09,126.46,127.16,127.57,127.76,127.7,127.18,128.33,129.01,128.6,128.49,128.75,128.69,128.69,128.55,128.65,128.89,128.22,129.28,130.11,130.64,131.55,131.77,131.94,131.8,132.73,133.62,133.62,133.15,134.4,134.19,134.77,135.86,136.16,136.08,136.16,137.78,136.85,135.36,135.42,135.34,132.46,127.04,129.25,128.61,123.78,125.63,127.38,127.71,129.42,130.98,131.03,131.03,130.27,129.55,129.68,131.75,133.3,131.61,130.15,128.41,129.07,130.49,130.83,130.77,131.35,133.64,133.47,132.62,131.86,131.76,131.98,130.1,130.3,130.06,126.78,124.13,127.5,125.29,124.93,126.65,126.65,123.82,125.38,126.83,127.7,124.9,125.32,127.42,126.71,127.76,127.39,128.42,129.79,129.9,129.16,128.05,128.06,126.35,126.58,127.9,128.04,126.99,127.32,126.4,126.12,127.73,128.17,128.14,129.38,130.59,130.81,130.93,130.03,130.56,130.45,130.11,131.07,130.66,131.08,130.82,130.51,130.51,129,130.64,129.74,131.15,131.73,131.83,132.95,132.86,133.28,133.42,133.65,133.11,133.44,133.31,133.02,132.49,132.71,131.87,132.12,130.3,130.59,129.47,130.27,130.37,130.77,130.12,130.12,131.24,132.35,133.52,133.99,133.04,134.2,134.34,134.21,134.74,135.03,134.5,134.37,134.62,135.26,136.49,136.08,135.18,134.41,135.06,134.92,135.59,136.22,136.7,137.08,137.05,136.85,135.88,135.33,136.2,135.16,136.23,136.69,137.02,137.3,137.25,137.01,137.86,138.92,138.96,139.75,139.13,139.15,139.15,138.92,138.53,138.02,137.72,137.98,138.5,138.55,139.28,139.32,138.54,139.28,139.46,140.55,140.5,140.01,139.82,139.36,139.75,139.75,140.26,140.2,140.3,139.15,138.38,138.33,138.13,133.59,130.85,132.7,131.92,134.76,134.72,132.78,132.74,132.17,131.44,127.38,129.75,127.5,126.67,128.65,130.05,131.42,130.59,131.32,132.14,134.95,134.61,133.37,130.74,130.55,129.56,130.93,131.22,129.04,126.7,127.08,127.08,126.25,128.21,128.63,131.59,131.3,132.37,133.82,129.49,129.49,129.29,126.28,126.5,126.45,127.14,127.11,124.69,122.1,122.11,120.23,118.33,115.9,112.75,112.75,118.34,119.36,119.21,120.22,120.37,117.39,121.43,122.28,123.46,123.97,124.53,124.51,123.86,125.18,125.46,126.41,128.08,128.08,126.27,126.55,126.72,127.8,126.79,126.61,128.58,129.68,129.8,130.68,131.29,131,129.78,129.86,129.96,131.63,132.03,131.68,133.11,133.11,133.31,133.55,133.08,133.93,134.09,133.99,133.92,133.54,134.46,133.94,133.78,132.91,131.83,131.55,133.48,133.87,134.8,134.69,135.36,135.86,135.84,135.44,136.91,134.32,134.2,135.17,134.54,135.02,135.93,137.5,137.51,137.8,138.09,138.73,138.87,138.03,138.51,138.52,139.43,139.34,139.42,139.1,139.32,139.32,139.46,140.69,140.38,140.33,140.99,141.14,141.27,140.21,139.92,141.27,140.63,138.31,138.09,137.67,138.18,134.85,135.93,136.72,137.94,137.14,136.21,137.37,136.98,135.35,135.53,135.53,134.4,133.47,133.75,131.98,131.62,134.44,135.54,136.37,137.8,138.44,138.39,138.11,138.68,138.45,138.58,139.93,140.35,141.68,141.5,141.25,139.91,139.74,140.27,141.08,142.16,142.58,143.67,143.67,143.41,142.72,142.9,143.54,143.87,144.53,144.56,144.07,143.13,143.64,142.75,143.15,144.13,144.81,144.05,145.11,144.88,144.5,142.93,141.65,140.61,136.43,138.2,138.31,140.9,139.97,138.25,140.34,136.23,136.56,138.53,140.21,139.1,140.25,140.18,136.54,138.04,137.6,138.5,140.26,140.35,140.35,139.38,140.89,142.72,142.85,142.84,142.88,143.92,144.33,144.23,143.77,144.15,144.2,144.2,143.49,143.48,142.27,143.15,142.8,142.04,142.76,141.01,138.48,139.59,141.57,140.94,138.74,140.01,140.91,142.45,142.25,143.67,143.38,143.77,143.21,144.19,143.68,144.09,144.37,144.95,145.76,145.64,146.12,145.67,147.08,147.63,147.45,147.55,147.96,148.34,148.05,148.28,148.38,148.51,149.65,149.72,149.64,149.07,148.84,149.16,150.28,150.61,151.24,151.24,150.63,149.33,148.34,149.28,149.5,150.87,150.39,150.23,150.66,151.96,151.97,153.05,153.11,153.04,153.72,154.48,154.62,154.59,154.59,155.38,155.38,154.48,154.94,156.24,155.14,155.68,155.25,156.01,157.05,156.6,157.69,157.45,157.75,159.07,159.68,159.68,159.26,159.3,159.48,158.04,155.56,157.12,156.98,157.48,154.69,155.81,158.14,159.92,160.46,159.59,160.76,161.03,162.07,161.81,162.1,162.1,161.63,162.39,161.77,160.07,154.71,150.02,149.45,142.85,141.68,148.2,144.03,150.11,145.02,142.55,131.72,138.22,131.47,118.97,130.01,114.43,121.29,115.01,115.55,110.54,107.3,117.37,118.72,126.13,121.88,125.97,123.95,118.48,121.18,119.35,127.74,127.54,131.88,133.79,133.79,132.44,136.49,133.48,134.26,137.86,135.39,131.24,134.25,134.18,136.04,138.04,137.32,140.97,139.67,135.75,136.33,137.56,136.6,138.17,140.51,140.52,137.64,135.24,136.8,137.34,141.66,140.18,142.51,141.4,141.74,141.74,143.48,145.61,145.3,146,146.55,147.75,149.77,149.26,153.17,155.02,153.81,152.99,143.97,145.85,147.07,149.85,149.32,149.4,148.56,149.52,150.17,146.29,147.89,144.31,146.43,148.68,149.43,150.11,150.11,152.49,150.84,152.02,151.16,152.75,151.32,153.35,154.74,154.21,154.65,155.95,156.21,157.11,155.17,154.21,155.35,154.35,156.27,155.68,156.87,158,158.57,159.59,160.62,160.72,161.16,159.88,162.11,161.78,161.75,162.19,162.57,161.85,162.36,162.92,164.56,165.15,166.83,167.11,168.24,167.87,169.13,171.73,165.7,164.35,164.35,159.79,163.01,160.14,160.22,162.27,163.11,162.36,160.99,159.19,157.35,159.01,155.23,155.7,158.19,160.73,159.96,161.28,162.13,160.58,163.47,161.18,163.99,165.3,166.75,169.49,168.42,167.31,167.05,167.07,164.35,165.12,164.76,165.62,166.19,163.1,162.61,156.87,158.74,156.82,158.75,161.58,165.14,168.35,168.3,170.27,170.03,171.34,169.63,171.93,173.94,173.1,171.1,171.78,170.61,171.57,174.35,174.07,174.07,174.49,173.68,175.64,175.96,175.85,177.4,177.06,177.55,176.14,175.91,175.69,174.92,177.18,177.5,178.52,177.89,177.2,176.83,176.96,177.59,177.59,179.14,178.74,178.98,180.13,177.47,178.73,179.75,182.42,183.42,182.22,182.3,182.71,182.02,180.72,180.72,182.19,184.73,184.78,184.23,184.89,184.62,179.88,181.63,178.13,180.98,183.5,183.69,185.68,186.4,187.78,187.57,187.51,187.82,188.7,188.7,188.6,188.54,187.7,187.36,185.91,186.14,188.25,183.65,182.77,187.12,185.61,183.18,180.73,184.25,183.26,185.86,186.98,188.92,189.11,190.34,190.04,190.59,187.78,187.66,188.98,187.54,186.51,187.49,190.61,190.44,189.84,190.53,192.78,192.78,195.57,195.38,195.66,196.49,198.01,197.97,198.62,197.81,200,200.72,199.66,198.3,200.15,198.3,200.47,200.83,200.78,200.61,201.97,200.52,201.07,199.73,199.87,201.5,202.98,200.87,199.12,194.85,197.23,200.17,199.66,197.96,197.38,199.46,199.3,201.28,200.85,201.23,201.46,201.62,201.62,201.52,201.81,201.08,202.85,202.69,202.73,202.36,203.3,203.7,204.07,203.66,202.56,202.47,199.81,202.61,203.65,203.43,204.61,205.29,205.77,205.82,206.1,207.17,208.73,208.73,208.31,209,207.22,209.55,210.28,209.54,209.78,209.1,207.52,204.23,207.32,209.03,209.45,211.58,212.08,211.08,211.04,211.93,210.79,210.4,212.12,211.14,212.41,212.76,212.56,212.78,213.05,213.93,214.27,214.84,213.32,211.03,211.29,213.01,214.83,215.15,215.63,214.37,216.26,217.19,216.9,216.96,217.58,217.51,217.51,216.77,216.48,215.49,213.82,214.31,213.08,214.88,214.55,212.6,208.99,208.82,210.8,213.36,213.67,213.08,208.74,209.07,206.58,208.95,206.24,208.41,209.26,211,210.6,209.15,208.65,209.28,212.85,214.44,215.16,216.75,217.54,218.2,217.96,219,219.4,218.29,220.43,220.86,221.26,222.07,223.51,224.44,225.28,225.48,224.69,222.84,222.97,224.58,224.58,225.44,224.86,225.62,225.3,224.58,224.95,225.47,225.47,220.35,223.26,219.02,216.43,219.51,217.65,220.2,224.76,225.46,223.84,225.98,223.91,222.24,225.87,223.9,221.59,219.07,222.97,225.24,226.64,226.64,229.77,229.54,229.86,229.18,228.57,230.03,229.89,225.43,225.21,224.3,223.98,226.03,226.66,223.44,223.62,223.62,219.51,217.38,214.98,210.91,211.5,208.92,208.61,207.49,212.54,216.55,218.04,220.1,214.73,215.83,215.04,216.84,219.99,216,211.91,211.09,214.42,214.61,210.07,208.56,208.56,206.45,202.64,205.68,210.28,209.76,206.52,210.37,209.26,207.6,201.47,200.02,205.16,204.28,201.63,200.13,204.42,208.99,211.57,214.04,213.95,216.37,213.71,216.78,217.87,219.43,222.12,220.72,217.27,218.01,219.77,217.01,214.9,215.82,215.25,211.61,210.89,213.25,210.66,210.66,210.61,214,213.86,210.71,204.86,206.03,200.23,200.65,205.62,198.16,199.28,200.25,206.23,198.87,197.75,191.41,191.88,188.72,188.48,192.98,192.21,196.09,188.17,187.07,187.1,190.57,189.02,190.81,194.6,199.42,199.42,198.17,196.68,200.31,197.04,197.65,199.54,197.38,192.68,187.08,179.82,179.14,181.76,175.85,176.24,176.24,180.55,180.31,182.03,187.6,187.04,183.27,183.14,181.54,183.45,183.45,183.74,184.4,187.16,187,184.85,183.14,182.32,181.78,185.27,183.72,188.79,189.91,191.78,189.99,190.24,188.04,192.96,195.3,198.08,197.52,196.2,199.27,199.12,198.79,198.55,197.7,201.91,201.77,205.27,206.08,206.47,204.97,205.44,202.79,198.45,198,198.58,201.38,194.6,193.3,191.17,189.67,190.24,188.2,188.2,187.43,190.86,192.13,195.06,197.12,188.6,189.24,187.1,185.76,187.03,184.92,181.76,180.22,177.12,175.29,174.91,178.36,174.59,171.96,176.41,181.8,181.44,179.58,174.55,173.24,172.11,171.55,176,171.84,176.39,178.4,177.21,175.8,179.97,182.11,185.07,183.71,182.59,187.09,185.69,184.93,180.31,178.4,180.83,182.56,183.59,179.77,189.74,191.49,189.78,191.43,189.85,189.27,190.17,189.43,192,193.14,193.14,193.08,190.1,189.8,195.67,195.5,195.27,191.77,189.01,188.66,190.08,188.68,191.38,192.77,191.61,186.83,184.75,183.09,183.28,186,183.31,184.39,184.39,183.64,181.43,184.6,184.13,184.13,183.4,184.78,182.63,186.8,186.65,187.96,190.37,191.02,191.79,191.79,191.4,188.42,186.98,190.52,192.78,192.64,192.61,194.73,195.21,192.68,195.5,197.55,200.45,198.38,197.16,199.69,197.48,195.74,196.17,198.41,198.36,198.91,196.17,195.62,195.62,191.7,191.4,192.42,190.39,190.98,190.4,189.5,190.94,194.02,194.15,191.18,191.45,187.91,185.19,184.91,187.96,186.65,189.93,187.83,189.51,191.97,188.81,189.37,190.44,190.75,190.45,193.16,194.27,197.07,197.8,196.65,196.16,196.87,196.87,197.06,197.05,196.24,198.84,198.43,199.09,199.26,199.24,198.05,198.23,198.4,195.27,194.52,198.32,199.96,199.88,197.56,196.18,194.77,198.36,198.45,197.55,198.43,198.09,197.78,198.37,197.1,199.44,201.33,201.04,201.07,198.81,197.36,199.08,201.68,201.68,201.69,200.45,202.43,205.37,204.96,205.44,204.66,205.93,206.16,208.08,209.53,209.7,212.25,211.47,211.47,210.47,209.37,210.14,208.54,207.6,209.98,209.9,210.84,213.43,213.68,213.68,213.26,211.57,210.96,211.47,212.9,214.47,216.29,216.07,216.9,218.45,218.96,217.48,217.55,218.43,219.04,219.01,217.6,219.75,220.08,219.49,216.45,215.9,214.76,216.69,215.78,214.26,214.31,214.08,215.32,212.83,211.22,209.59,209.56,211,210.42,212.74,209.88,211.29,212.61,215.7,216.52,216.18,216.57,216.57,215.66,214.15,213.47,213.77,215.21,213.98,214.25,216.05,213.43,213.58,213.12,211.12,207.66,207.18,208.01,204.95,204.99,206.2,205.64,205.66,202.83,204.48,204.21,206.62,207.93,209.01,209.91,208.6,207.55,209.75,209.73,206.92,205.16,202.58,202.24,203.71,200.79,198.41,197.46,199.83,201.12,203.24,207.07,209.02,209.38,209.98,210.19,208.49,211.74,211.57,215.6,215.95,216.2,216.48,218.08,217.64,218.52,218.52,218.65,218.23,218.44,218.23,219.06,220.35,219.16,219.03,218.17,219.91,220.81,221.68,222.7,225.74,226.34,226.32,227.35,228.68,225.32,227.64,228.02,228.02,228.99,229.31,229.4,228.75,227.45,225.63,224.86,225.27,228.45,228.11,229.4,229.25,229.42,229.42,228.56,227.28,229.28,232.11,232.61,233.29,233.48,234.71,234.56,236.33,236.19,232.39,235.29,237.8,237.04,237.59,239.55,239.69,241.06,240.83,237.54,239.82,241.21,240.05,240.05,238.61,238.91,243.96,244.05,243.12,243.54,243.13,244.4,246.36,246.07,243.56,244.81,247.33,245.72,245.44,248.19,247.72,247,245.4,246.95,248.35,250.56,251.37,251.02,250.25,249.55,251.7,251.99,251.99,251.48,249.66,249.93,246.85,249.59,249.49,249.85,247.49,249.33,245.71,242.75,242.25,240.85,240.32,238.22,240.3,243.17,243.22,242.11,244.58,245.36,241.5,240.67,242.87,245.92,248.46,248.79,248.79,250.05,250.47,250.41,251.62,254.57,254.04,254.33,254.56,255.2,254.51,252.63,254.4,254.4,254.46,252.59,251.08,253.1,253.38,253.76,256.77,256.71,256.43,257.09,257.79,259.98,260.59,260.49,262.48,263.14,263.14,262.48,262.07,261.27,262.29,262.71,262.94,261.87,262.57,264.2,265.54,265.54,266.99,267.26,267.46,270.19,267.82,269.3,270.06,271.78,268,265.9,264.01,266.86,266.44,260.27,258.93,261.8,262.02,260.72,264.84,261.21,256.41,248.72,251.3,249.35,255.1,256.29,256.3,260.62,261.62,265.84,266.37,268.96,268.42,269.56,267.15,270.22,269.37,269.8,268.19,268.18,270.88,270.88,265.15,264.73,263.93,259.37,262.38,263.55,266.36,268.36,269.81,270.15,270.22,269.44,274.01,273.48,274.25,274.94,274.43,275.53,275.19,276.35,273.78,273.82,273.35,275.81,273.16,275.81,277.77,277.2,278.87,281.02,278.89,280.19,280.14,281.25,280.74,280.61,278.03,278.63,278.54,279.28,279.73,278.81,273.62,274.74,273.97,277.33,284.34,286.45,287.53,287.81,286.98,287.04,285.31,281.54,282.64,283.76,283.77,285.29,286.27,287.14,288.78,287.68,287.68,289.3,290.01,290.14,291.89,291.35,292.07,290.28,289.42,291.78,290.2,290.2,291.3,290.17,281.61,281.37,284.43,286.5,289.67,289.67,289.55,286.35,283.28,282.07,281.44,284.99,286.56,283.38,283.82,283.82,279.45,279.89,280.21,285.34,284.74,287.58,287.58,290.11,291.89,293.44,292.6,288.33,290.99,289.63,291.16,289.69,287.48,289.56,290.69,291.75,288.99,290.93,291.03,290.24,293.26,293.24,293.24,293.96,294.66,293.38,288.37,286.94,285.6,285.64,281.11,285.56,280.54,277.11,280.2,275.21,276.72,269.26,267.22,268.53,264.8,270.43,272.16,269.27,272.17,271.58,271.8,276.6,277.03,273.94,273.04,267.65,269.13,270.15,271.97,258.8,243.34,242.77,238.96,261.7,252.64,257.21,259.26,258.81,253.01,253.35,253.35,247.37,253.59,257.81,263.04,264.98,265.14,266.68,267.08,268.76,272.72,270.98,268.89,270.06,271.63,271.44,280.27,282.3,282.59,283.76,285.75,286,284.89,280.29,280.17,278.29,278.29,283.98,282.4,283.53,283.51,284.67,286.32,286.35,284.83,287.76,288.03,289.61,288.81,289.92,286.64,289.33,286.92,286.83,286.83,286.2,288.95,292.17,292.16,294.51,296.04,297.57,297.24,298.65,301.14,301.14,298.77,298.56,300.37,301.2,300.2,300.62,299.44,300.39,302.01,301.98,302.4,302.59,304.96,305.17,306.38,306.44,305.53,305.15,304.02,299.16,303.57,302.09,304.29,304.05,306.42,305.65,309.12,310.12,310.21,309.32,309.29,307.47,306.73,305.5,310.14,308.81,310.09,310.83,311.81,309.82,309.82,307.67,309.24,311.82,310.84,311.49,312.33,313.26,315.92,315.77,317.25,316.84,316.54,318.05,319.61,321.02,319.25,318.34,316.75,318.62,319.45,320.76,321.85,322.05,322.07,323.25,322.01,323.89,323,314.24,319.14,318.64,319.93,317.91,319.59,323,323.01,321.29,323.16,325.71,329.72,330.47,330.46,327.18,328.04,328.6,324.75,325.93,322.29,322.7,327.67,328.35,328.55,323.11,322.95,319.99,317.35,318.54,313.58,316.66,321.56,324.47,326.72,326.72,328.47,326.72,327.52,328.5,328.85,329.49,328.34,328.05,330.27,330.95,327.43,326.9,326.12,322.34,324.9,327.77,329.88,331.38,332.44,332.44,332.34,331.18,330.73,328.29,328.92,331,333.06,331.91,331.94,334.09,334.61,333.96,332.18,333.04,332.83,332.83,325.96,329.74,331.55,331.66,333.32,334.68,334.65,334.22,332.78,334.57,331.76,330.08,326.03,332.46,334.02,332.91,332.9,327.68,327.85,327.85,328.18,330.01,329.08,331.36,327.92,330.43,333.12,331.33,329.89,330.03,326.91,329.44,327.58,323.23,325.92,325.22,324.95,320,318.06,321.29,322.09,317.7,316.83,312.03,315.61,314.43,316.13,310.63,305.43,304.23,313.09,315.34,315.69,315.69,317.09,317.33,325.29,327.29,326.92,330.25,334.14,336.8,337.68,341.75,340.94,338.77,342.32,340.9,343.62,344.04,342.36,342.22,345.73,346.74,345.33,348.13,353.21,351.87,354.83,355.5,354.93,357.01,359.74,355.29,355.03,352.66,356.47,357.08,358.41,358.41,360.6,360.66,362.73,363.52,364.48,364.95,362.26,363.72,354.11,355.16,354.25,348.51,354.61,356.39,362.28,360.23,355.85,359.71,359.71,358.38,353.23,352.88,352.85,352.68,356.82,359.65,358.88,358.88,358.88,361.48,359.87,358.85,361.77,363.3,360.42,361.77,363.15,361.3,357.65,356.96,360.12,359.63,355.28,355.46,355.52,356.27,350.86,356.69,359.19,364.5,371.02,370.4,369.75,372.04,371.82,370.63,371.6,374.02,373.39,371.43,368.88,369.66,366.45,368.04,367.01,368.18,368.11,370.76,369.84,368.61,365.99,367.67,371.56,370.16,370.16,368,366.22,364.08,367.21,365.44,363.79,362.17,366.29,366.9,372.38,372.37,369.56,369.47,371.35,368.49,367.87,366.95,367.66,370.36,372.82,374.98,374.15,372.41,374.62,374.42,374.33,370.18,371.39,367.33,368.83,369.88,372.01,367.52,365.61,368.16,370.36,371.38,370.25,363.52,361.67,362.99],"SK하이닉스":[null,100,100.12,100.85,100.85,96.35,99.64,96.84,96.48,96.48,99.27,101.82,102.07,99.03,103.77,104.62,103.65,103.52,103.52,103.04,104.25,107.41,107.9,107.9,109.84,109.96,112.39,110.57,110.09,109.23,111.42,110.81,112.76,109.72,109.72,109.36,110.57,112.52,110.94,110.94,110.21,108.63,108.63,111.3,114.82,113,114.09,116.65,120.41,120.9,125.39,122.96,122.24,119.81,119.81,118.71,120.53,119.44,123.45,125.39,125.64,129.53,129.53,129.53,130.5,131.23,128.31,130.5,130.5,129.53,132.69,128.07,121.51,123.21,117.74,116.4,120.53,122.48,121.26,123.69,122.96,121.99,115.43,111.79,113.49,113.49,115.92,114.46,119.93,118.59,116.65,116.65,119.56,123.94,122.24,118.59,119.44,113.61,115.67,115.55,118.23,117.74,120.29,123.21,123.45,124.67,123.69,122.72,125.88,123.94,122.24,120.05,121.02,119.08,118.71,119.08,120.9,121.02,119.56,121.99,121.14,124.91,126.37,127.34,127.34,130.5,130.26,131.23,131.23,134.63,134.63,135.84,135.84,138.27,138.27,135.12,137.06,134.39,135.12,134.39,132.93,135.36,131.71,136.09,133.9,135.6,135.6,138.76,140.7,139.49,138.52,137.06,138.76,136.33,136.33,137.3,137.79,141.68,139.73,142.89,144.11,147.27,147.02,152.61,155.53,157.47,157.96,157.96,164.03,168.17,163.3,166.46,163.79,161.12,159.9,165.25,165.49,161.85,163.55,167.68,167.44,171.57,172.78,173.03,172.05,172.54,173.27,173.03,177.4,171.08,162.33,166.22,156.99,160.39,159.17,165.25,159.17,155.53,155.77,161.12,156.01,156.5,149.21,158.2,158.2,160.63,161.36,162.82,163.3,165.74,165.25,165.49,166.22,165.01,164.28,166.46,166.71,166.95,165.49,169.87,174.24,173.51,176.43,179.34,181.53,183.96,186.63,187.61,193.68,192.47,196.11,201.94,201.94,209.72,209.72,200.24,202.19,201.46,201.46,201.46,201.46,201.46,201.46,201.46,215.55,216.52,215.07,209.23,204.62,202.92,196.6,191.98,197.33,205.83,198.78,198.54,191.25,190.52,193.92,199.76,207.29,202.67,205.1,202.92,200.24,202.19,200.24,199.27,200,202.67,199.27,200.49,201.7,199.51,206.56,210.94,205.83,206.8,201.94,200.73,200.24,186.63,188.09,192.22,189.31,188.34,184.69,191.25,191.25,189.06,186.63,184.69,183.96,187.61,194.9,194.9,187.12,186.39,186.39,179.83,182.5,185.91,185.91,186.15,188.82,187.36,192.71,190.04,186.88,177.16,176.43,180.8,176.67,180.8,180.07,182.75,178.13,172.78,173.27,175.94,184.2,183.48,182.99,177.64,178.61,180.8,175.46,170.6,170.6,172.78,179.59,178.37,181.04,188.82,188.58,188.58,188.58,185.91,183.48,186.88,184.45,187.85,188.34,191.25,186.63,186.63,188.09,190.28,200.24,200.97,202.92,202.43,206.32,218.71,220.41,217.74,218.23,218.47,217.74,214.82,215.31,201.94,204.13,197.81,195.14,195.14,197.57,197.57,198.78,195.38,201.46,195.14,195.87,195.38,197.33,204.13,204.62,204.13,201.22,205.59,213.61,205.1,205.1,199.51,200.24,210.21,211.66,205.35,205.35,201.94,201.46,201.7,201.7,202.92,202.67,208.51,209.23,207.53,205.59,211.42,210.69,213.61,216.52,216.52,231.59,229.89,231.35,229.65,230.38,230.86,226.97,222.11,218.23,221.14,221.14,220.9,214.82,216.77,214.82,214.82,209.72,211.42,204.13,204.37,213.37,215.07,217.5,206.08,204.86,207.05,202.92,208.26,203.4,209.23,206.56,209.48,207.29,212.88,212.15,210.94,208.02,215.8,217.01,215.31,217.01,219.44,213.61,198.54,203.16,195.63,201.94,209.23,208.75,209.72,208.02,202.19,202.43,192.95,196.11,193.92,189.55,182.5,183.23,184.45,184.45,181.53,181.04,181.53,190.52,193.92,197.08,198.78,202.92,200.24,201.22,200.97,201.7,195.87,197.33,194.41,191.49,184.45,185.91,186.15,182.5,181.04,188.82,187.61,189.55,191.49,192.22,186.39,186.39,186.39,186.39,182.26,177.64,179.1,174.24,174.24,170.11,170.84,173.03,173.03,170.84,167.68,175.94,170.84,169.38,171.08,166.95,172.05,170.11,167.92,162.09,157.23,162.82,162.33,165.74,165.74,165.98,176.43,171.32,170.35,172.05,177.16,177.16,181.04,174.73,171.08,174.48,170.35,169.62,164.03,165.49,168.41,168.41,172.3,172.05,174.73,173.75,169.14,171.32,167.68,165.74,160.39,162.33,159.17,157.72,160.87,159.17,150.18,151.15,148.48,146.54,142.41,145.81,146.78,146.78,146.05,149.7,147.02,147.02,147.27,140.22,141.68,142.65,143.86,154.56,158.69,158.2,150.91,155.53,157.47,157.72,156.99,162.82,161.85,162.33,171.32,181.29,174.48,178.37,184.45,179.59,184.45,184.45,184.45,184.45,186.39,178.61,180.07,184.45,185.18,188.09,179.34,181.53,179.1,183.96,186.39,186.39,183.23,182.75,179.1,170.11,170.11,170.35,169.38,165.49,165.49,162.09,161.85,164.52,162.33,163.55,165.49,164.76,165.25,171.32,184.45,184.93,177.16,176.67,178.37,175.7,180.32,186.15,185.66,194.17,190.52,191.98,189.31,189.06,191.01,190.52,189.79,193.68,195.38,194.9,192.47,198.78,195.63,196.84,190.77,194.9,191.01,194.41,191.98,191.98,196.11,195.38,195.38,194.17,195.14,184.69,180.8,178.61,181.29,181.04,174.73,174,172.3,170.84,167.44,165.25,164.28,162.58,160.15,160.63,160.15,158.69,161.85,158.2,158.2,158.2,158.93,162.33,163.3,159.66,154.31,153.34,154.8,154.07,163.3,163.55,160.15,162.58,162.09,167.44,170.6,168.89,170.11,173.51,167.92,170.6,166.22,163.79,169.62,177.16,183.48,181.53,185.18,184.93,181.29,181.53,186.63,190.52,191.49,188.58,192.47,193.92,187.12,191.74,186.88,188.82,184.93,183.23,174.97,178.13,175.7,178.13,181.04,181.04,186.88,186.88,185.66,182.5,185.66,184.2,179.34,180.8,174.48,177.4,178.13,178.13,188.09,188.58,187.12,194.41,201.7,199.03,204.86,201.94,200.73,200.73,200.73,193.2,192.95,194.9,200.97,199.76,201.22,202.67,199.03,202.43,197.81,199.76,199.27,193.2,193.2,195.14,195.14,196.6,196.6,191.98,194.41,195.63,197.33,200.24,196.84,188.09,188.34,192.22,188.82,194.41,201.46,201.46,201.7,198.06,199.27,201.94,205.83,206.8,202.92,203.16,200,197.57,202.19,202.67,202.67,207.05,207.78,207.29,200.97,196.6,198.54,198.54,200,200.97,201.22,196.6,195.63,191.25,188.82,191.49,195.87,196.11,196.11,195.87,202.67,213.61,215.31,225.52,226,227.46,230.86,229.89,227.95,227.95,230.38,233.29,228.68,228.68,230.13,229.65,229.16,228.43,236.7,240.58,240.34,244.23,244.23,238.64,241.07,240.58,242.77,241.31,245.44,239.85,239.85,239.85,234.02,237.91,228.43,227.22,230.13,235.97,237.42,244.23,241.31,240.1,242.53,243.01,247.87,253.95,255.16,247.87,251.52,252.73,250.3,241.8,238.15,229.89,225.52,213.61,223.82,225.52,229.16,230.62,225.03,225.03,216.52,207.78,201.22,200.49,195.87,195.38,177.64,167.68,181.77,168.65,191.25,205.35,196.11,202.43,203.4,202.43,190.52,194.41,193.44,201.94,208.51,205.35,206.56,204.37,197.81,200,200,197.57,204.37,199.27,197.57,203.89,200.73,197.81,200.73,202.67,203.4,203.4,203.4,196.84,196.84,200.24,200.24,206.56,205.35,208.26,203.16,195.87,199.03,197.08,200.97,204.37,202.67,197.57,197.81,199.03,197.81,203.89,198.06,203.16,202.43,215.55,213.12,219.68,221.14,218.23,220.66,215.07,207.05,199.27,207.53,210.94,209.48,207.53,206.32,204.37,208.99,204.86,205.59,203.16,206.8,207.29,205.1,207.53,208.99,206.08,203.4,201.7,201.22,201.7,201.46,201.7,200.97,201.46,199.76,204.37,202.19,200.24,203.4,201.22,201.94,202.19,207.29,201.22,198.78,198.3,196.11,197.08,195.87,197.81,197.57,196.84,196.11,194.9,194.9,189.79,182.26,174.48,181.04,183.48,187.12,191.49,192.22,189.06,182.5,182.75,183.48,191.25,191.25,190.52,192.95,187.85,186.15,190.52,194.41,199.03,198.06,199.76,203.4,205.35,197.57,203.16,204.86,201.46,200.49,204.13,204.13,204.13,204.13,202.19,201.7,202.67,201.46,201.46,207.78,214.34,210.21,211.66,207.29,210.69,207.05,203.65,202.43,203.89,202.19,200.73,201.46,198.54,194.17,193.44,197.81,202.19,209.23,209.72,208.99,210.21,211.42,214.09,217.98,238.15,238.4,238.15,238.64,235.24,243.01,239.61,236.21,241.56,240.1,236.94,244.23,264.88,270.96,279.47,286.76,279.47,292.83,283.11,280.68,284.33,285.54,285.54,290.4,287.97,281.9,273.39,281.9,286.76,286.76,280.68,281.9,287.97,287.97,306.2,317.13,318.35,326.85,335.36,323.21,313.49,323.21,317.13,309.84,315.92,317.13,317.13,319.56,312.27,328.07,313.49,312.27,298.91,297.69,303.77,315.92,315.92,303.77,309.84,303.77,304.98,306.2,306.2,306.2,320.78,321.99,315.92,306.2,323.21,331.71,336.57,330.5,360.87,343.86,343.86,351.15,357.23,345.08,340.22,329.28,331.71,323.21,332.93,340.22,331.71,341.43,340.22,345.08,335.36,335.36,328.07,324.42,323.21,328.07,320.78,326.85,321.99,341.43,342.65,347.51,347.51,348.72,349.94,340.22,334.14,339,332.93,334.14,334.14,335.36,336.57,321.99,323.21,321.99,319.56,328.07,315.92,315.92,311.06,319.56,320.78,320.78,313.49,314.7,315.92,298.91,290.4,285.54,287.97,285.54,294.05,294.05,297.69,297.69,290.4,298.91,298.91,304.98,303.77,308.63,312.27,306.2,313.49,312.27,312.27,309.84,297.69,298.91,311.06,308.63,312.27,314.7,307.41,302.55,296.48,296.48,301.34,306.2,312.27,306.2,303.77,309.84,302.55,297.69,298.91,303.77,300.12,295.26,290.4,291.62,298.91,300.12,300.12,295.26,289.19,287.97,284.33,290.4,287.97,284.33,281.9,277.04,277.04,273.39,281.9,291.62,294.05,291.62,286.76,281.9,273.39,256.38,244.23,246.66,246.66,246.66,252.73,249.09,249.09,250.3,255.16,251.52,252.73,251.52,251.52,258.81,262.45,258.81,260.02,257.59,253.95,257.59,250.3,255.16,258.81,261.24,261.24,252.73,260.02,260.02,260.02,260.02,256.38,252.73,253.95,251.52,243.01,250.3,243.01,243.01,237.91,234.51,232.56,228.43,228.43,222.36,223.57,227.95,239.13,235.97,237.42,237.91,234.02,239.37,243.01,247.87,246.66,258.81,250.3,258.81,261.24,256.38,257.59,260.02,261.24,264.88,263.67,261.24,258.81,269.74,272.17,268.53,267.31,270.96,290.4,289.19,290.4,285.54,280.68,281.9,277.04,283.11,291.62,286.76,287.97,295.26,291.62,300.12,292.83,295.26,294.05,300.12,301.34,296.48,292.83,302.55,308.63,309.84,311.06,306.2,309.84,308.63,318.35,318.35,318.35,312.27,304.98,303.77,308.63,302.55,311.06,312.27,314.7,312.27,308.63,307.41,308.63,303.77,289.19,289.19,286.76,286.76,275.82,292.83,292.83,292.83,292.83,301.34,302.55,298.91,298.91,298.91,314.7,320.78,321.99,308.63,317.13,323.21,319.56,319.56,319.56,319.56,297.69,298.91,298.91,298.91,303.77,313.49,313.49,290.4,286.76,286.76,286.76,286.76,281.9,281.9,281.9,281.9,301.34,301.34,300.12,300.12,292.83,286.76,286.76,291.62,294.05,286.76,281.9,284.33,283.11,274.61,275.82,272.17,270.96,269.74,274.61,267.31,262.45,264.88,273.39,273.39,274.61,268.53,262.45,269.74,263.67,266.1,273.39,268.53,267.31,266.1,266.1,261.24,261.24,267.31,268.53,264.88,273.39,268.53,273.39,275.82,269.74,273.39,274.61,263.67,262.45,250.3,257.59,260.02,262.45,262.45,260.02,260.02,260.02,252.73,257.59,256.38,251.52,240.58,240.83,237.91,236.7,234.26,229.65,231.35,224.06,219.2,222.6,230.86,231.59,228.43,221.14,212.64,216.52,224.79,223.82,228.19,230.38,227.7,226.73,228.43,228.43,239.85,245.44,243.01,247.87,249.09,243.01,243.01,244.23,243.01,241.56,237.91,235.97,234.51,236.94,236.94,239.37,234.02,231.11,223.09,226.73,226.73,226.73,234.99,235.97,232.56,234.26,231.35,227.46,226.49,228.68,231.11,224.79,226.49,231.35,224.54,222.84,221.39,223.09,219.68,219.68,219.68,219.68,230.38,226,223.57,221.63,218.71,213.85,213.85,208.99,202.92,200.49,199.27,197.33,196.35,201.94,201.94,209.48,218.23,218.47,221.63,221.63,219.2,228.43,230.62,232.08,231.35,232.81,225.76,219.2,219.93,223.09,227.22,228.19,218.71,202.67,200.97,203.89,205.35,200.97,205.35,210.21,213.12,216.77,216.52,227.22,220.9,222.6,222.36,213.12,214.82,209.72,207.05,207.05,211.18,206.8,201.94,203.4,206.56,205.83,199.03,196.84,196.84,191.74,191.49,198.06,197.08,200,198.78,194.9,190.52,191.98,190.28,189.55,192.47,189.06,187.12,187.12,184.69,182.26,182.26,183.96,183.72,196.84,197.81,201.94,208.99,210.21,212.15,210.94,208.26,208.51,208.99,206.8,207.78,212.88,212.88,212.88,222.11,222.11,222.36,220.41,215.07,222.11,222.11,224.06,216.52,220.66,230.62,230.62,227.22,220.17,226.97,222.84,225.76,223.57,224.79,221.63,216.52,225.27,221.14,218.71,217.25,217.25,214.09,212.15,217.98,216.04,210.94,208.02,202.43,204.86,197.08,192.22,191.98,204.13,203.4,203.16,211.18,215.07,212.15,207.78,214.82,211.18,215.8,215.31,211.91,205.35,205.59,203.65,216.52,220.41,223.09,219.44,215.55,217.01,215.07,212.88,214.34,213.12,216.52,211.91,207.78,212.39,215.8,217.5,217.5,219.2,218.23,215.55,215.55,215.55,212.15,211.18,209.72,211.91,209.96,219.68,223.33,227.46,236.45,238.64,237.91,237.42,251.52,265.37,265.37,268.04,263.91,268.04,268.04,264.16,264.16,262.45,266.59,280.44,278.98,290.4,288.7,289.19,288.94,278.98,282.14,279.71,277.04,276.06,275.82,274.61,277.76,282.38,279.95,285.78,286.51,283.6,276.55,271.69,268.04,275.58,280.44,277.28,286.76,284.81,286.27,285.54,284.08,279.71,277.04,275.58,274.61,301.34,311.06,299.88,304.01,290.4,291.62,291.86,296.23,288.21,287.97,287.97,280.19,279.22,279.22,281.41,278.98,284.81,282.87,283.11,281.9,293.8,283.11,281.65,288.21,290.16,295.99,291.62,289.67,290.16,287.24,287.97,276.31,281.65,283.6,287.97,296.96,297.45,289.19,289.67,286.76,283.11,285.05,284.33,279.47,278.74,278.74,278.74,278.74,278.74,280.44,292.1,292.59,292.59,290.4,289.67,301.82,303.04,301.58,315.92,315.92,305.47,306.68,301.34,308.14,309.84,291.62,289.43,289.43,282.62,292.35,304.5,305.71,323.21,316.89,310.09,311.06,317.13,320.29,315.92,325.88,321.51,315.67,319.32,320.78,319.08,316.16,311.06,317.62,319.32,316.89,325.39,322.24,318.59,305.95,305.22,305.22,309.84,313.24,318.35,318.83,332.2,340.22,340.22,335.84,341.43,341.43,341.68,341.68,342.41,341.19,343.86,343.86,346.05,332.44,331.47,334.14,330.5,333.9,324.42,330.5,325.88,325.88,321.02,318.35,330.98,343.38,346.54,342.16,343.86,333.9,330.5,328.07,332.69,327.34,322.48,327.83,321.51,335.36,335.36,347.02,347.02,347.02,364.52,361.36,361.85,356.74,367.68,363.55,362.09,380.32,392.22,393.2,373.75,383.96,379.59,379.59,404.62,402.92,395.87,400.73,417.74,404.86,402.67,397.57,393.44,391.74,399.27,389.31,380.32,413.12,412.64,411.66,429.16,440.34,433.05,444.71,450.79,452.73,435.48,456.87,444.23,440.34,444.47,444.47,457.84,455.41,457.35,435.24,434.26,443.01,421.14,417.01,415.55,436.94,414.58,432.08,427.46,423.33,423.33,421.87,420.9,420.9,436.45,432.56,426.25,437.18,446.66,450.3,450.3,469.02,461.48,461.97,466.59,480.44,486.03,482.62,489.67,492.1,492.1,475.58,459.78,471.93,469.74,470.72,470.72,504.25,505.47,516.4,522.48,539.49,537.06,541.92,569.87,567.44,577.16,568.65,541.92,546.78,575.94,574.73,574.73,572.3,563.79,573.51,558.93,573.51,567.44,579.59,580.8,585.66,566.22,558.93,566.22,535.84,516.4,509.11,498.18,498.18,506.68,461.73,466.1,475.33,459.05,472.9,469.74,420.9,379.34,397.81,411.42,397.08,416.77,430.13,442.04,453.71,453.71,485.3,471.2,485.3,468.04,464.4,450.79,436.45,425.27,435.72,412.39,422.11,422.84,408.99,376.18,387.36,380.07,381.53,377.89,382.02,410.21,395.63,395.63,395.63,395.63,371.32,381.77,393.68,397.33,401.7,439.61,446.66,424.3,424.3,410.94,410.94,423.09,449.33,432.56,432.56,453.71,452,452,468.77,458.57,476.31,455.16,463.91,456.38,476.31,481.65,488.46,476.31,462.45,473.88,452.73,442.77,471.45,469.5,475.82,475.82,487.24,468.04,451.52,444.47,420.41,433.05,417.25,414.58,414.58,410.21,429.4,430.13,430.38,408.99,391.49,388.58,385.91,400.73,408.26,420.41,406.08,410.45,414.09,417.5,427.95,426.49,435.72,447.14,445.93,425.27,409.48,412.15,409.48,409.48,413.37,424.06,422.6,422.6,416.04,442.04,485.54,473.88,473.15,498.18,494.53,472.17,473.88,481.65,510.33,521.26,515.19,529.77,548,533.41,537.06,537.06,537.06,537.06,537.06,484.08,463.91,464.4,483.11,494.53,493.32,481.41,485.3,483.35,506.68,510.33,515.19,510.33,530.98,515.19,509.11,498.18,487.24,493.32,484.08,462.21,462.21,452.25,469.26,467.56,467.56,456.62,456.38,483.35,485.3,496.96,500.61,493.32,499.39,510.33,523.69,513.97,505.47,520.05,503.04,484.33,463.43,478.74,480.92,472.9,442.77,400.49,411.91,400.97,445.2,439.37,437.91,438.88,422.84,425.27,425.27,429.16,422.36,439.85,433.29,448.12,442.28,439.37,431.35,431.35,452,452,452,463.67,462.45,461.97,473.88,482.38,500.61,487.24,496.96,484.57,490.89,487.24,478.49,486.03,493.32,492.1,505.47,515.19,496.96,504.25,504.25,528.55,545.57,545.57,556.5,560.15,583.23,572.3,572.3,602.67,605.1,599.03,597.81,624.54,630.62,676.79,695.02,712.03,690.16,709.6,693.8,678.01,676.79,657.35,658.57,685.3,682.87,721.75,715.67,729.04,725.39,719.32,654.92,653.71,662.21,652.49,653.71,654.92,646.42,636.7,637.91,640.34,664.64,626.97,626.97,640.34,628.19,636.7,623.33,648.85,653.71,675.58,671.93,671.93,650.06,639.13,620.9,595.38,609.96,630.62,635.48,631.83,652.49,653.71,622.11,633.05,637.91,645.2,664.64,673.15,699.88,738.76,746.05,798.3,804.37,845.69,810.45,863.91,863.91,852.98,877.28,868.77,866.34,817.74,848.12,844.47,874.85,961.12,961.12,961.12,961.12,961.12,961.12,1040.1,1008.51,1000,1026.73,1099.64,1131.23,1179.83,1164.03,1170.11,1162.82,1239.37,1300.12,1266.1,1356.01,1380.32,1358.44,1506.68,1424.06,1407.05,1441.07,1409.48,1472.66,1504.25,1499.39,1487.24,1360.87,1472.66,1385.18,1365.74,1387.61,1266.1,1263.67,1261.24,1273.39,1321.99,1287.97,1307.41,1356.01,1341.43,1317.13,1321.99,1402.19,1375.46,1426.49,1373.03,1387.61,1346.29,1287.97,1339,1341.43,1329.28,1409.48,1419.2,1428.92,1428.92,1455.65,1555.29,1582.02,1582.02,1645.2,1691.37,1764.28,1803.16,1837.18,1808.02,1820.17,1793.44,1803.16,1820.17,1837.18,1856.62,1805.59,1798.3,1834.75,1863.91,1788.58,1944.11,2043.74,2092.35,2208.99,2017.01,2204.13,2187.12,2046.17,2038.88,2155.53,2128.8,2089.91,2157.96,2138.52,2138.52,2138.52,2138.52,2172.54,2306.2,2311.06,2442.28,2473.88,2670.72,2578.37,2578.37,2281.9,2063.18,2286.76,2245.44,2031.59,2279.47,2320.78,2260.02,2211.42,2366.95,2357.23,2566.22,2461.73,2447.14,2267.31,2396.11,2417.98,2267.31,2267.31,2121.51,1961.12,2179.83,2017.01,2128.8,2153.1,2226,2510.33,2425.27,2495.75,2527.34,2680.44,2760.63,2806.8,2741.19,2833.54,2974.48,2972.05,2976.91,2969.62,3139.73,3159.17,3142.16,3125.15,3125.15,3516.4,3516.4,3890.64,4019.44,4097.21,4568.65,4459.3,4801.94,4787.36,4420.41,4471.45,4240.58,4240.58,4714.46,4716.89,4716.89,4986.63,5450.79,5562.58,5669.5,5742.41,5735.12,5735.12,5584.45,5030.38,4643.99,5382.75,4976.91,5105.71,5224.79,5560.15,5788.58,6126.37,6524.91,6716.89,7093.56,6208.99,6369.38,7088.7,6495.75,6386.39,6439.85,6221.14,5314.7,5893.07,5693.8,5348.72,5044.96,5312.27,5297.69,4483.6,4648.85,5059.54,4476.31,4476.31,4286.76,4461.73,4447.14,4663.43,4274.61,4413.12,3766.71,3404.62,3212.64,4174.97,3808.02,3832.32,4053.46,3633.05,3455.65,3450.79,3462.94,3654.92,3871.2,3997.57,3997.57,4038.88,3645.2,4109.36,4204.13,4060.75,4077.76,4102.07,4204.13,4017.01,4068.04,4114.22,3919.81,3878.49,4002.43,4332.93,4357.23,4510.33,4503.04,4403.4,4123.94,4106.93,4274.61,4240.58,4512.76,4539.49,4471.45,4524.91,4524.91,4524.91,4296.48,4289.19,4315.92,4454.43,4473.88,4473.88,4308.63,4187.12,4085.05,4085.05,3900.36,3506.68,3448.36,3066.83,3091.13,3103.28,2972.05,3144.59,2972.05,3103.28,3098.42,3258.81,3613.61,3708.38,3445.93,3577.16,3397.33],"마이크론 테크놀로지":[null,null,100,104.2,104.38,103.12,101.86,105.94,106.18,108.51,109.35,114.99,115.17,116.85,118.35,119.36,119.36,120.68,119.84,116.43,117.09,110.79,112.65,111.57,114.27,122.54,123.86,122.9,120.02,120.68,120.02,121.64,121.52,122,123.8,123.38,139.03,139.45,139.45,139.69,136.57,133.51,131.41,131.41,135.19,134.05,132.55,132.13,133.93,134.77,136.63,133.75,132.97,132.97,130.34,133.81,130.16,131.65,131.24,136.99,141.25,141.01,143.71,144.96,144.54,148.38,148.62,147.48,145.92,147.48,145.14,146.58,144.18,143.29,138.61,138.01,137.77,139.99,139.99,142.51,142.39,140.77,139.33,142.45,140.53,147.18,148.08,153.3,154.14,153.72,152.16,150.78,150.96,154.08,153.36,156.59,156.12,154.68,157.13,153,156.24,158.69,170.44,172.42,172,170.86,173.68,173.26,171.7,171.4,169.42,171.58,170.98,165.71,162.95,160.01,160.31,160.31,162.65,162.71,163.43,167.63,163.79,159.29,161.81,160.61,165.65,165.89,169.6,166.49,167.87,166.61,169.06,168.23,172.72,175.78,174.04,173.44,172.84,173.98,161.87,164.75,166.79,168.23,169.6,173.8,176.44,178.42,178.42,184.05,184.47,184.41,187.11,187.11,189.27,194.84,194.54,183.45,187.05,189.09,186.21,183.21,179.02,187.05,184.83,191.91,191.19,190.23,194.84,189.81,193.29,188.67,179.02,174.7,174.7,182.91,180.46,181.06,182.85,188.07,188.55,186.63,190.59,190.17,191.25,190.77,191.85,191.91,189.87,179.26,178.72,181.29,175.54,168.59,169.9,171.64,166.85,167.39,171.4,172.9,171.34,164.81,167.93,175.3,177.94,183.99,177.58,182.13,177.22,182.55,182.55,181.18,181.59,186.33,188.73,189.51,191.67,195.44,195.44,192.27,193.35,196.58,194.54,200.48,205.58,207.37,207.31,207.73,212.41,215.53,215.65,215.29,216.25,209.05,204.92,222.36,227.58,235.79,239.87,242.03,237.17,236.03,237.83,245.56,251.68,249.46,243.29,242.21,248.74,242.15,249.7,247.66,248.8,249.16,249.4,246.16,243.41,244.9,249.7,265.65,266.07,265.83,262.05,259.29,263.49,264.33,260.79,268.47,273.38,274.58,271.94,276.86,276.74,285.61,296.16,294.6,294.6,297.84,288.07,287.35,262.23,254.14,251.74,239.21,247.06,249.28,258.99,259.05,257.85,250.96,252.1,253.24,254.2,262.05,263.67,274.28,266.31,264.51,264.51,253.3,254.68,250.66,246.52,261.81,269.66,281.06,274.58,273.08,257.61,259.65,256.71,256.65,256.65,257.31,265.35,263.73,256.29,257.07,263.49,258.27,257.85,261.81,259.53,249.82,262.11,254.74,244.72,236.21,263.07,251.86,239.81,242.27,252.94,255.58,260.49,260.79,265.05,265.05,269.18,267.03,265.29,278.96,287.65,291.25,292.63,285.49,294.42,311.93,322.18,323.56,331.06,327.28,355.94,356.29,358.39,352.76,363.19,360.55,366.61,366.13,353.24,325,333.09,314.15,308.69,312.59,312.59,300.12,309.05,320.08,298.8,290.53,287.53,302.64,302.64,315.29,313.13,309.65,313.31,323.8,308.27,303.48,293.88,282.43,285.37,300.6,284.89,275.66,280.52,275.12,279.5,285.25,290.65,291.19,305.82,315.71,310.67,317.75,323.8,338.73,327.94,320.08,332.61,353.9,359.53,368.65,367.81,367.81,375.42,375.12,345.26,352.16,354.32,356.18,356.23,357.49,368.05,368.05,363.01,360.01,354.8,349.1,350.42,355.22,353.42,356.35,342.33,318.71,327.28,313.31,318.59,314.39,326.62,308.63,308.63,316.79,319.12,325.6,334.17,324.82,332.43,337.83,336.63,341.49,344.42,337.05,329.86,325.48,318.76,320.08,322.3,323.5,317.81,316.49,313.49,320.14,316.61,315.77,317.99,320.08,313.31,307.97,307.79,303.48,284.71,282.37,282.43,288.19,299.4,301.2,297.96,303.96,312.17,313.79,310.73,316.31,314.87,314.87,311.33,297,267.69,268.94,269.18,261.39,250.24,261.51,265.59,261.27,271.76,270.14,276.14,268.23,270.74,267.63,265.89,269.72,271.16,270.68,274.34,270.68,264.75,261.27,258.21,253.42,249.46,251.62,254.62,253.84,259.05,253.9,247.6,242.51,238.37,231.89,212.41,220.5,212.23,207.79,215.89,226.14,240.53,241.73,239.33,238.61,245.38,242.45,234.47,224.46,226.92,228,239.27,236.45,220.8,216.55,218.11,218.11,218.23,219.24,221.82,232.07,227.28,231.18,239.99,221.1,221.1,225.84,211.69,208.63,211.09,216.01,209.95,205.04,203.12,204.5,188.31,187.53,181.77,173.98,173.98,185.19,191.43,189.27,190.23,196.34,185.85,196.04,203.84,202.28,212.47,215.29,215.89,207.85,203.78,201.32,203.12,214.39,214.39,203.06,205.28,219.36,233.57,228.3,224.16,229.26,229.14,237.41,236.63,236.03,248.92,236.09,231.29,231.29,242.21,249.88,253.18,251.74,251.74,251.56,253.06,248.98,255.22,256.29,257.55,247.72,245.08,249.28,246.16,239.75,227.4,226.8,231.71,233.99,235.31,232.79,230.28,237.05,237.47,242.03,240.59,263.73,249.52,243.11,241.73,235.19,235.85,247.78,253.3,254.44,263.19,257.13,259.71,257.19,250.12,252.82,253.48,251.86,250.72,256.35,258.69,260.19,260.19,260.19,256.41,257.97,256.29,252.4,252.46,252.16,251.2,255.16,259.77,252.58,241.37,238.31,235.43,233.45,224.1,230.88,230.28,223.68,216.19,207.55,213.67,208.21,202.76,203.84,203.84,197.48,199.58,199.76,195.5,195.98,206.77,199.88,200.66,203.78,209.47,208.87,197.6,200.12,195.8,194.42,205.58,203.48,204.74,199.34,198.98,195.92,222.06,228.24,231.35,240.47,237.41,237.35,237.35,236.33,242.27,247.9,257.19,260.67,266.85,266.19,258.15,260.01,267.81,272.9,282.91,281.47,287.71,286.39,284.71,280.7,284.53,269.12,261.39,264.27,251.44,255.52,250.3,255.58,248.92,252.58,264.81,252.04,253.24,261.09,269.84,265.17,264.81,268.47,257.55,260.37,254.44,258.69,267.81,271.4,271.4,269.72,280.64,293.94,293.59,294.54,296.1,302.64,302.4,302.76,300.66,304.8,302.64,298.68,294.72,297.36,290.83,296.58,291.37,259.05,256.89,253.6,251.68,260.55,267.09,264.75,255.64,257.07,259.47,270.38,268.94,278.54,270.74,272.78,260.61,271.1,267.75,267.75,282.37,287.95,291.91,288.43,287.05,285.07,290.05,297.3,291.85,285.85,290.17,282.91,277.34,281.18,277.58,280.58,286.03,286.69,279.26,273.2,273.08,275,284.89,280.1,288.73,288.73,284.83,278.12,271.16,277.58,279.5,287.35,278.48,284.53,295.32,305.58,306.95,317.39,317.75,317.99,326.92,330.1,332.13,332.25,332.25,330.4,323.92,319,322.42,332.07,326.92,321.16,349.34,344.84,343.59,339.75,344.42,344.84,336.75,345.8,345.68,345.68,353.54,354.74,354.92,346.28,332.19,338.55,331.53,329.92,318.29,322.42,332.73,340.35,351.8,341.01,343.71,343.23,355.34,355.7,350.72,350.72,346.22,359.65,353.72,341.67,329.8,312.35,313.97,303.24,315.11,327.28,310.55,331.47,322.06,308.57,275.6,286.93,262.11,232.67,257.73,206.65,224.1,207.97,217.57,216.49,229.32,259.41,254.8,268.53,260.67,266.91,252.16,239.15,246.34,247.12,278,279.02,289.51,276.56,276.56,276.8,285.49,278.36,272.96,273.98,260.19,248.26,263.25,262.41,264.75,271.46,271.64,298.74,287.11,270.14,266.55,272.24,276.26,279.32,289.27,288.97,273.92,260.97,274.16,266.25,275.3,270.5,279.62,271.1,269.42,269.42,274.58,296.46,278.6,287.23,277.82,280.7,293.29,307.07,322.06,321.94,318.65,314.57,290.89,291.91,295.2,305.88,305.52,302.64,304.74,306.65,298.8,289.51,294.9,290.71,294.66,308.87,297.96,298.74,298.74,305.28,294.3,298.02,299.64,303.96,296.52,298.02,302.82,300.36,296.58,307.01,308.87,309.65,315.59,299.88,309.29,300.3,302.1,304.2,300.12,302.1,307.55,306.06,291.97,292.27,294.66,286.33,290.65,276.62,273.38,271.1,266.19,264.09,257.73,255.76,262.35,270.38,269.54,267.51,273.92,272.84,274.34,286.75,277.76,278.66,278.66,269.96,270.68,269,276.32,293.94,294.06,301.02,305.64,304.2,294.66,297.96,298.86,296.58,294.6,298.08,304.02,281.53,287.29,279.08,285.37,283.69,290.23,299.16,299.1,303.84,310.85,309.53,311.39,309.41,315.53,320.92,319.6,326.02,316.85,312.59,311.51,299.76,302.64,301.8,298.02,306.24,311.51,327.22,330.7,335.49,332.19,337.89,337.23,347.3,370.86,371.64,364.15,370.68,368.11,384.77,383.39,380.28,380.28,385.07,384.23,402.16,414.33,419.06,439.69,435.31,438.79,428.12,427.34,422.84,428.9,438.55,437.59,433.21,428.42,428.48,422.3,419.36,423.14,423.14,423.62,420.92,431.18,450.72,443.94,463.19,462.29,474.28,464.15,471.64,476.38,479.08,487.41,483.93,483.93,512.59,500.6,509.65,493.29,487.29,476.68,450.18,469.96,469.24,482.19,489.33,474.28,487.11,486.21,503.66,499.52,493.71,518.47,527.64,527.64,526.02,515.89,530.82,545.32,517.27,528.96,554.68,528.3,548.74,568.11,546.1,534.23,505.58,533.15,509.89,535.37,512.05,535.43,526.2,532.67,548.14,568.11,538.49,542.63,547.24,511.99,497.6,504.14,527.52,519.12,518.82,528.84,554.02,554.02,562.05,560.49,563.31,571.28,571.34,573.08,552.46,543.59,541.19,543.53,530.04,524.46,536.51,507.85,515.77,526.62,536.33,515.77,527.94,516.01,509.71,506.06,510.49,508.39,515.47,484.71,483.69,460.43,462.77,477.82,481.95,472.9,479.2,486.39,483.93,497,486.99,493.05,503.18,504.44,504.44,504.5,505.64,491.79,502.16,503.84,482.79,471.58,475.3,475.66,482.55,492.69,482.55,483.45,461.33,462.05,465.59,473.74,483.09,491.79,499.88,497.18,509.47,480.28,481.59,481.59,486.09,468.94,462.29,472.06,476.98,470.32,470.56,461.15,449.7,447.12,451.98,462.77,452.82,455.28,457.43,444.96,452.94,462.11,465.11,465.47,484.77,491.49,488.55,491.61,480.88,455.1,449.82,421.16,425.18,425.24,424.34,423.38,421.34,421.04,430.1,431.53,443.88,436.27,443.65,438.61,441.85,441.97,443.59,442.51,442.51,441.49,433.27,436.87,440.65,445.74,440.59,442.57,447.42,445.44,433.87,432.49,443.47,443.88,443.94,450.72,438.25,429.5,425.54,425.6,423.38,422.66,419.3,422.9,420.38,414.99,400,397.96,406.47,405.76,403.24,405.1,409.29,411.51,404.74,412.23,413.31,409.11,417.15,414.27,423.86,424.22,427.16,433.09,437.17,447,453.18,440.11,446.94,463.43,460.31,460.49,452.4,461.75,497.78,502.76,512.05,516.85,516.85,500.12,516.43,503.6,510.49,496.88,489.33,494.3,514.57,515.71,509.17,512.83,505.7,499.34,513.55,495.74,497.6,491.79,543.65,541.61,566.07,566.07,566.13,557.19,576.56,562.89,558.45,574.04,577.58,565.95,573.44,566.25,562.89,564.75,570.2,573.26,583.69,583.69,556.77,539.57,510.01,491.19,497.3,483.93,491.43,471.94,475.24,493.23,488.31,506.65,491.43,486.63,484.83,504.32,528.3,545.68,538.13,538.73,575.54,575.9,561.93,544.36,544.36,542.99,523.44,532.55,540.17,532.73,517.15,559.35,534.65,491.07,453.84,462.59,476.26,453.96,436.57,416.07,438.31,477.64,482.73,476.08,469.72,474.34,453.54,468.88,468.23,478.78,491.91,474.58,466.97,456.71,465.65,447.3,442.33,439.33,432.49,431.83,431.41,433.93,420.44,420.44,426.56,436.03,438.85,425.18,416.13,420.38,402.16,398.5,420.74,408.81,423.26,427.22,441.37,427.4,421.76,407.25,413.13,401.44,405.94,431.18,422.48,446.52,425.96,416.07,413.07,417.21,399.4,406.89,423.26,439.57,439.57,442.69,440.95,451.86,419.3,422.36,424.22,411.27,395.8,375.42,352.76,351.92,354.44,329.8,334.23,334.23,340.53,337.77,337.05,350.36,352.4,346.88,335.85,331.41,321.64,321.64,340.11,343.94,352.82,354.56,346.58,354.8,352.88,355.82,368.88,362.41,374.1,379.5,381.53,367.45,360.61,357.67,371.04,372.12,370.86,374.94,374.52,385.19,388.79,374.46,368.41,354.62,368.11,373.62,389.93,387.89,382.85,369.42,377.58,362.77,349.58,346.88,349.58,366.91,345.5,341.79,337.53,338.91,343.59,337.71,337.71,331.12,329.74,332.07,344.36,347.36,321.46,318.41,315.89,316.85,312.35,304.56,300.36,297.72,300.36,293.05,303.24,305.76,299.82,300.36,310.07,323.5,328.12,327.46,317.21,308.03,322,316.25,328.9,316.07,320.74,315.05,317.93,321.94,336.03,337.17,334.95,332.43,313.01,323.98,324.34,328.9,320.44,320.62,336.69,339.09,344.66,335.55,361.33,374.82,370.38,378.3,352.94,352.16,351.2,342.69,351.44,353.3,353.3,350.18,334.23,330.46,345.62,332.67,327.82,323.98,321.82,322.66,330.94,328.96,331.83,331.18,327.28,311.99,312.17,310.07,303.84,306.89,296.34,300.96,300.96,299.88,294.48,303.66,299.64,299.64,301.98,324.94,328,340.35,337.89,342.99,348.08,343.35,341.31,341.31,340.83,338.79,337.89,350.48,370.62,367.27,368.94,376.5,382.91,369.96,361.51,375.3,378.72,374.16,359.59,372.48,361.21,360.79,358.63,360.43,372.12,370.74,360.01,353.78,353.78,345.32,341.61,352.22,348.8,347.12,346.64,343.76,338.31,340.41,340.71,333.09,341.07,333.33,329.32,323.14,325.36,324.52,339.15,339.69,345.56,351.5,348.74,367.75,366.67,358.45,355.4,380.94,378.24,361.75,357.37,343.35,341.85,351.08,351.08,379.32,381.12,371.46,377.7,375.48,374.94,371.28,363.61,368.47,366.49,356.77,348.56,365.83,371.1,385.85,373.8,371.1,365.17,362.77,367.09,364.93,365.29,359.65,369.36,365.23,387.53,382.07,389.21,405.1,408.69,397.06,395.74,398.86,417.33,443.23,443.23,429.8,408.87,414.21,414.69,406.29,404.92,402.04,391.61,392.27,404.38,406.89,414.39,412.59,405.64,405.64,401.08,394.48,397.18,391.37,392.39,400.42,402.1,385.67,378.36,383.09,383.09,372.06,367.09,363.61,374.58,381.29,382.43,386.87,384.17,390.65,389.33,389.45,387.83,393.59,392.57,393.76,403.96,426.08,426.86,428,424.22,408.69,414.75,419.12,415.95,405.58,399.88,392.33,385.91,409.35,391.67,385.01,381.06,381.24,383.45,380.16,390.83,381.83,382.01,391.55,399.76,408.21,419.3,422,422,421.4,422.12,418.88,420.74,419.84,421.52,424.76,430.4,418.94,422.66,423.92,417.75,407.07,412.95,411.15,407.31,408.93,390.89,407.85,407.43,406.65,408.33,413.97,419.42,416.55,414.09,420.92,418.17,414.93,414.15,413.67,414.51,404.86,403,400.96,408.09,398.68,386.87,393.59,396.1,400.9,416.07,422.3,435.13,437.17,436.45,433.33,441.07,451.8,448.32,462.65,462.47,459.65,464.99,471.34,459.89,462.23,462.23,460.85,464.69,456.35,459.77,456.35,455.22,445.38,441.79,438.43,441.55,449.4,466.37,468.59,478.36,492.75,488.07,488.97,492.63,471.76,512.47,518.53,518.53,521.94,519.54,515.59,511.63,493.65,493.17,495.86,500.3,509.29,499.58,493.88,499.94,493.94,493.94,507.25,499.28,508.51,524.64,535.01,524.76,528.06,534.77,527.88,533.99,516.55,514.09,513.25,518.47,521.46,507.19,510.61,508.87,512.95,513.79,488.79,490.59,489.39,476.62,476.62,483.87,488.55,515.05,515.59,536.33,550.66,537.83,543.23,570.44,574.16,566.37,572.9,593.41,585.25,566.61,584.05,564.51,548.14,559.05,562.23,563.55,577.04,658.57,660.73,702.22,712.23,714.93,706.77,706.77,745.2,735.91,767.45,743.94,740.89,737.11,735.19,732.61,764.45,734.53,727.64,730.04,697.42,671.04,640.11,654.2,674.22,670.14,668.94,688.49,685.61,677.22,657.67,673.44,687.65,720.2,714.69,715.35,706.29,726.86,737.41,748.26,766.25,766.73,751.14,773.38,764.39,757.07,757.01,776.32,776.32,795.38,788.85,757.13,749.4,768.41,759.23,801.62,779.8,785.01,808.27,809.77,843.82,858.15,847.48,886.27,919.96,919.96,864.45,836.57,833.39,846.04,853.48,792.75,788.55,788.49,794.9,820.26,820.26,788.97,783.51,786.21,817.69,780.76,800.66,784.59,764.33,716.43,704.14,685.01,691.13,684.95,661.15,644.18,655.94,646.58,614.87,658.39,608.57,555.76,542.09,533.57,520.38,551.98,558.03,567.39,584.17,601.98,641.19,647.42,651.26,647.42,649.46,625.06,616.61,592.99,586.69,568.71,572.96,576.98,576.98,531.06,535.31,535.91,517.87,517.21,520.68,543.47,522.84,546.88,522.66,531.95,523.68,535.07,544.96,560.97,563.55,574.16,658.75,644.48,621.76,601.38,598.62,610.43,613.01,616.97,614.75,609.71,633.63,641.01,649.52,625.42,654.92,671.76,666.37,653.96,646.4,629.8,640.59,646.94,637.83,648.56,623.98,597.42,597.9,609.89,632.43,670.44,679.92,670.86,651.38,624.1,599.04,594.6,577.58,584.59,585.91,589.75,616.07,615.35,626.38,610.31,588.73,588.73,587.23,590.83,598.56,618.71,604.74,606.53,616.43,588.13,611.87,588.97,614.51,649.04,651.08,622.9,522.12,540.29,537.89,535.25,535.25,538.49,531.35,511.45,504.56,523.56,538.79,595.08,610.97,595.98,595.98,595.56,569.9,583.69,618.65,615.11,633.99,633.99,655.76,654.86,628.54,618.65,546.22,529.08,533.63,554.56,547,539.09,543.53,561.15,566.79,553.36,575.12,564.03,549.64,573.5,596.64,596.64,640.23,625.66,618.59,592.57,572,558.87,585.79,550.48,561.33,542.81,546.76,565.59,535.19,557.31,522.06,533.87,573.38,568.82,604.26,618.17,609.83,611.87,617.51,567.87,581.18,564.63,552.34,546.52,530.22,520.92,531.83,531.18,445.68,388.01,409.89,392.93,466.85,419.96,416.97,425.78,425.9,415.65,412.47,412.47,400.12,420.92,437.23,464.15,478.3,470.98,460.91,461.33,466.25,483.93,482.13,482.67,495.32,510.49,514.75,553.3,581.12,571.46,572.24,587.53,591.43,588.13,574.58,568.53,559.77,559.77,577.82,576.62,580.34,566.31,588.61,613.01,619,637.23,650.84,665.17,684.29,695.62,696.52,693.05,718.47,721.46,730.34,730.34,741.01,731.89,766.85,762.89,755.4,747.96,738.91,724.76,729.86,733.15,733.15,718.94,745.92,732.85,738.07,746.58,711.09,720.08,698.02,679.02,685.79,678.84,654.8,658.45,669.84,667.03,666.97,671.22,687.89,654.32,628.78,646.1,653.84,652.16,670.68,712.77,741.73,765.89,745.02,751.14,724.64,740.71,731.71,702.7,694.18,705.52,697.96,698.44,705.94,731.41,713.49,713.49,710.31,711.75,744.66,787.59,788.13,810.79,839.33,902.7,942.63,945.86,952.16,959.17,1012.53,975.6,986.93,997.66,969.48,940.23,942.87,982.61,1003.12,1092.03,1101.62,1126.08,1144.84,1113.25,1178.3,1153.06,1088.73,1155.7,1121.46,1150.72,1214.21,1213.31,1239.63,1212.77,1189.87,1239.27,1313.07,1319.54,1330.4,1358.69,1342.99,1341.55,1407.07,1307.13,1423.86,1428.84,1426.38,1518.59,1445.5,1468.23,1420.56,1479.8,1450.54,1369.9,1354.44,1207.25,1243.23,1342.51,1346.1,1380.46,1380.46,1417.75,1441.61,1435.79,1403.84,1358.81,1422.18,1480.34,1513.31,1581,1549.52,1445.68,1423.86,1393.94,1352.04,1490.11,1594.24,1658.21,1656.29,1718.7,1718.7,1707.37,1764.81,1754.38,1711.09,1891.01,1871.4,2058.93,2035.67,1960.55,2068.88,2073.56,2027.16,1998.5,2018.17,2174.76,2174.76,2188.25,2332.79,2383.57,2395.98,2332.67,2459.47,2609.59,2612.65,2487.29,2624.7,2514.63,2274.58,2295.5,2366.25,2299.16,2237.71,2460.07,2481.83,2467.99,2467.99,2396.76,2523.68,2502.1,2566.97,2523.8,2506.06,2571.94,2491.37,2472.24,2474.04,2276.26,2402.7,2380.4,2220.02,2334.05,2416.73,2510.13,2430.16,2554.74,2648.68,2767.93,2768.17,2663.49,2535.37,2424.16,2371.28,2290.71,2131.06,2141.61,1929.26,2025.42,2205.34,2195.68,2195.68,2264.75,2263.67,2438.43,2527.04,2521.52,2557.31,2791.73,2735.19,2741.19,2728.24,2688.37,2694.12,2922.54,2888.01,2977.94,3144.84,3023.32,3108.27,3100.48,3250.66,3455.94,3838.13,3996.34,3876.68,4477.28,4768.17,4595.8,4817.93,4652.34,4344.48,4085.97,4189.09,4388.43,4568.94,4502.4,4502.4,5370.98,5566.01,5536.69,5821.34,6208.03,6379.5,6472.24,5971.22,5179.92,5691.13,5610.85,5347,5970.44,5884.95,6522.72,6119.66,6254.14,6798.5,6798.5,7262.47,6305.58,6286.03,7275.54,6788.55,6866.19,6920.2,6188.73,5848.68,5848.68,5903.78,5625.78,5688.25,5945.08,5871.1,5617.51,5894,5421.34,5115.11,5089.63,5188.61,5820.26,5752.28,5936.51,5521.28,5396.88,4919.24,4430.46,5243.76,4934.23,4973.02,5351.74,5354.86,5284.59,5261.21,5161.87,5206.95,5463.37,5694.42,5825.3,6065.65,5640.05,5618.17,5841.31,5796.04,5458.21,5593.35,5625.9,5607.85,5592.69,5747.78,5596.16,5731.89,5744.36,6094.66,6094.66,5996.76,6161.69,5859.77,5846.88,5539.75,5561.15,5554.86,5860.31,6089.93,6258.75,6571.7,6426.14,6478,6488.49,6318.82,6385.37,6385.55,6579.08,6444.18,6378.66,6268.35,6522.78,6210.07,6169.06,5929.5,5714.57,5480.4,5582.97,5268.83,5425.06,5372.12,5477.64,5134.83,5261.09,5417.87,5568.11,5894.66,5601.14,5304.2,4997.54,5126.5],"삼성전자":[null,100,100.68,101.49,101.73,98.76,102.04,98.89,96.1,95.24,96.41,97.03,98.14,98.58,101.49,102.04,102.1,102.1,103.77,103.77,108.04,108.23,106.87,106.31,108.17,109.65,110.77,110.15,108.42,109.28,109.96,108.85,110.95,111.08,112.13,111.7,111.94,110.27,111.26,111.32,110.64,111.51,111.51,111.7,112.87,111.88,110.02,112,115.16,115.22,118.44,120.05,115.9,113.43,114.36,114.29,115.97,115.1,117.76,118.07,121.91,123.45,123.45,123.45,122.09,121.04,121.78,122.09,122.4,120.11,118.81,118.81,118.69,117.45,116.27,116.71,117.64,117.14,119.62,120.48,121.6,121.23,118.25,117.76,118.94,118.94,122.9,122.59,124.01,124.38,124.38,124.38,124.32,125.62,127.97,128.09,129.46,131.19,129.64,131.68,131.37,129.33,128.4,127.48,128.34,129.27,129.89,127.48,128.22,130.2,130.38,129.46,128.71,129.76,128.71,129.64,131.25,130.01,128.59,128.4,126.55,124.63,126.11,127.6,132.12,132.43,135.64,138.06,138.06,138.92,138.92,140.84,140.84,145.48,145.48,141.09,140.78,141.77,142.64,143.5,143.38,142.14,138.37,139.54,138.99,138.86,141.34,142.57,141.15,138.12,138.3,138.24,142.2,142.14,142.14,140.16,139.73,142.64,140.41,140.47,140.35,141.34,141.03,144.06,148.95,146.91,148.39,147.34,149.38,149.44,147.59,148.33,147.09,146.1,145.42,147.22,148.7,148.08,150.56,151.61,154.33,156.44,156.19,156.68,157.3,156.99,158.42,158.04,157.36,154.7,154.21,154.08,147.77,149.13,150.37,151.61,147.83,147.59,147.22,147.65,143.19,142.02,138.06,139.23,139.23,142.95,145.54,145.11,144.93,145.42,146.91,147.03,145.48,142.64,142.57,142.95,143.32,143.81,142.45,144.68,145.42,148.89,151.86,154.08,153.47,153.53,155.63,155.94,162.38,161.26,161.57,163.37,163.37,165.9,165.9,159.9,158.6,158.66,158.66,158.66,158.66,158.66,158.66,158.66,163.37,169.06,169.55,167.08,166.83,169.55,169.43,163.92,166.58,168.01,167.2,166.77,162.13,164.23,167.2,170.42,177.04,176.55,174.44,174.44,173.58,175.62,174.32,174.5,174.44,173.02,171.23,172.59,172.71,170.79,171.04,173.14,171.1,171.6,162.87,164.85,162.75,157.18,157.3,158.85,158.6,154.76,156.99,160.89,160.21,161.2,158.79,157.98,156.62,158.42,159.53,159.53,152.04,153.77,153.77,149.13,152.72,157.67,157.67,157.86,159.72,158.04,161.26,160.95,155.94,151.11,149.26,149.13,150.19,154.7,153.53,154.39,152.6,149.26,152.1,152.66,155.51,157.12,158.48,154.08,154.39,154.15,147.59,148.27,146.72,141.71,142.33,138.3,141.46,147.09,151.61,151.61,151.61,149.69,146.66,146.29,144.68,146.1,146.6,146.6,145.61,145.61,142.39,139.85,145.48,150.43,152.23,153.9,153.9,159.84,160.15,159.47,158.23,156.99,158.42,157.98,160.21,153.84,155.57,154.64,150.68,151.73,152.29,150.19,148.89,145.17,150.8,149.75,152.23,151.24,151.18,151.61,154.08,155.75,154.64,158.91,163.3,159.72,160.58,156.13,155.94,161.32,163.99,163.99,163.99,163.99,163.99,160.58,160.58,162.75,157.49,159.65,158.73,155.01,152.23,154.24,152.85,153.16,154.7,154.7,160.27,159.03,163.06,161.82,158.73,153.16,156.87,158.73,158.11,158.73,158.73,156.56,153.62,154.39,152.85,152.85,149.13,147.43,144.18,145.42,145.42,145.58,146.19,144.34,145.42,148.36,144.8,144.34,140.93,142.79,143.1,142.17,138.92,141.09,143.25,142.33,140.78,143.87,142.48,141.86,144.03,145.11,146.81,143.87,142.79,142.79,145.11,145.11,143.87,143.1,144.03,140.93,141.55,141.71,144.49,144.8,145.11,140.47,139.39,139.7,139.7,136.91,136.45,135.67,138.61,142.64,142.95,142.79,143.25,144.03,144.8,147.43,149.91,146.81,147.43,144.18,142.64,138.92,140.78,139.39,137.84,136.29,141.86,139.7,140.78,142.79,146.19,146.66,146.66,146.66,146.66,146.97,143.72,143.41,141.4,141.4,138.3,138.3,139.08,139.08,140.16,133.35,136.14,135.52,134.9,136.6,136.29,135.83,134.75,133.2,131.65,126.86,126.86,128.09,131.03,131.19,130.41,136.6,135.52,135.37,136.14,136.29,137.07,139.85,137.69,136.45,136.91,136.14,135.06,132.43,130.26,131.34,131.19,131.81,133.2,133.51,133.51,129.49,133.82,130.41,128.25,125.31,126.7,124.38,124.54,125.15,123.76,120.51,121.13,120.36,120.98,119.59,119.59,120.05,120.05,118.66,118.35,119.74,119.74,119.89,116.34,115.87,119.89,117.88,122.52,123.14,125.31,123.92,127.17,128.25,129.8,130.88,132.27,130.41,129.95,133.2,138.46,139.39,140.78,143.56,142.79,143.41,143.41,143.41,143.41,142.95,138.61,139.23,142.48,142.95,146.97,142.48,142.95,142.17,145.11,145.27,145.88,146.5,144.65,144.65,139.54,139.54,138.77,136.91,136.14,137.53,135.52,135.06,138.15,135.67,135.67,136.76,135.21,135.83,136.29,141.86,144.03,140.78,140.01,140.32,138.77,138.15,139.39,141.55,144.18,145.27,144.96,144.34,144.34,144.49,143.1,144.96,145.58,146.19,145.58,141.09,140.16,140.32,139.85,138.46,138.15,138.77,142.79,141.86,141.86,142.02,140.16,140.16,138.77,136.91,131.34,132.74,131.96,131.96,131.65,128.56,127.48,129.95,133.51,134.59,135.67,132.12,131.96,131.65,129.33,131.65,131.5,135.52,134.44,135.83,135.83,136.76,138.61,138.77,138,135.37,136.14,135.83,137.22,140.32,140.78,141.4,140.78,141.09,141.4,143.87,145.42,144.18,143.1,140.47,142.33,141.24,137.38,139.54,140.93,142.95,143.25,143.72,144.96,142.48,142.64,144.8,146.04,146.35,143.56,146.04,145.88,142.64,144.03,140.32,139.85,139.08,135.98,134.59,133.66,131.96,133.51,135.21,133.04,135.21,135.21,135.83,134.9,137.53,137.69,136.29,135.98,134.9,136.29,136.6,134.28,136.14,135.52,133.82,136.45,141.4,143.25,145.11,145.42,145.88,145.88,145.88,145.73,145.11,147.59,152.07,152.23,152.54,153.16,151.3,152.23,149.75,151.76,151.14,147.28,147.28,148.51,147.74,151.3,151.3,150.22,152.07,154.7,155.01,156.87,156.25,154.39,155.63,158.42,158.42,156.87,157.49,158.73,158.11,155.94,155.94,158.42,161.82,163.06,164.91,163.68,161.2,159.65,162.75,162.44,163.37,166.15,165.53,165.53,160.89,157.8,159.65,160.27,160.27,161.51,158.73,155.63,155.94,154.39,153,153.16,155.94,158.42,159.34,160.58,164.91,169.25,169.25,175.43,174.2,173.27,173.27,171.72,170.17,170.17,171.41,174.81,172.65,172.65,170.79,171.72,171.72,172.65,175.74,181.31,184.1,185.64,185.64,182.55,187.81,189.67,193.07,189.98,192.76,188.12,188.12,188.12,181.93,182.86,176.98,174.5,176.98,182.24,184.1,189.05,186.88,184.72,185.33,187.19,187.81,191.21,190.28,185.02,186.26,185.64,183.17,175.74,179.15,174.81,172.96,167.7,170.17,171.41,177.6,178.84,174.81,174.81,168.94,161.2,161.2,154.55,151.3,146.35,141.09,132.89,140.47,131.5,145.27,150.53,147.9,149.44,148.05,147.74,141.71,144.8,145.42,150.68,153.47,150.37,151.92,152.38,149.44,151.61,151.61,151.61,159.03,155.01,152.38,154.24,154.24,152.69,154.24,155.01,154.7,154.7,154.7,150.06,150.06,152.23,150.99,150.99,149.75,148.21,150.22,148.51,148.05,150.99,155.63,154.7,154.55,150.84,151.14,152.38,154.39,155.94,156.87,158.42,159.03,168.63,168.94,171.72,169.86,171.72,171.41,168.01,161.82,154.39,161.2,161.51,161.82,163.68,160.89,159.03,163.68,160.58,164.91,162.13,163.37,162.75,163.68,165.84,170.17,165.22,163.99,163.37,163.06,165.22,166.46,169.25,166.46,168.32,167.7,171.1,169.25,167.39,167.7,172.03,181.31,182.55,182.55,179.15,175.74,177.29,176.05,179.46,177.91,178.84,180.07,182.55,181.62,179.46,179.46,180.69,178.84,171.41,172.96,173.58,174.5,174.5,172.03,171.41,167.08,167.7,168.32,174.5,172.03,174.81,181.62,180.69,183.17,182.55,186.88,188.74,188.74,184.1,183.48,183.17,180.07,181.31,178.84,179.15,180.07,180.07,180.07,180.07,180.07,181.62,182.55,185.33,184.72,184.72,186.88,188.43,188.43,185.64,184.1,185.64,188.43,188.43,185.95,186.26,186.88,185.02,182.55,179.76,175.12,177.6,181.93,181,186.57,185.95,186.26,186.26,189.67,188.74,195.54,205.14,203.28,200.5,199.88,200.19,208.85,209.47,206.06,210.4,211.01,206.37,209.78,215.04,215.66,221.23,225.56,221.84,228.65,225.56,227.1,228.34,228.34,228.34,226.79,225.87,225.87,223.7,228.65,240.72,240.72,243.5,242.26,250.62,250.62,256.81,259.59,254.33,256.5,274.75,281.56,280.32,277.54,277.54,272.28,263,269.18,269.8,272.59,268.56,276.61,268.25,264.85,258.97,253.71,256.81,261.14,261.76,255.26,258.35,256.81,255.88,252.48,252.48,252.48,260.52,262.69,257.43,254.02,255.57,254.33,253.71,253.71,263.92,255.26,255.26,258.66,259.9,254.95,254.02,253.71,251.86,250.31,253.71,256.19,253.09,256.19,254.64,256.5,253.4,253.71,253.09,250.62,251.24,252.17,252.48,254.33,251.86,256.5,262.38,264.23,266.09,264.85,262.07,258.66,257.43,259.9,259.9,260.21,259.59,257.74,259.59,255.57,254.95,256.19,258.35,256.5,254.02,252.78,252.17,252.78,255.57,255.57,254.64,253.4,257.43,251.24,247.52,242.88,247.83,246.29,246.29,246.29,245.98,247.83,246.6,247.22,246.91,246.29,247.83,249.07,249.38,250,256.19,254.33,253.4,253.4,250.93,250.62,250.62,249.07,250.31,253.09,250.31,249.07,247.22,247.52,247.83,251.24,252.48,253.4,250.62,249.69,247.83,247.52,248.76,251.24,250,247.22,245.67,246.6,246.91,245.98,249.38,246.91,244.43,244.43,242.88,246.6,245.36,243.81,242.88,245.05,244.43,242.88,245.36,251.86,256.5,254.02,252.17,252.17,248.14,242.88,238.24,230.2,230.2,229.58,228.65,226.18,224.94,226.79,233.91,234.22,230.82,229.89,230.82,237.31,237.62,235.15,237,239.17,235.46,236.08,232.98,232.98,236.08,237,238.24,235.46,238.86,238.86,238.86,238.86,239.48,239.17,240.41,236.08,229.27,229.27,226.49,226.49,223.39,220.61,221.53,221.23,221.23,213.49,212.87,214.73,216.89,217.2,218.44,217.51,217.2,217.82,217.2,219.99,216.89,218.75,215.97,216.27,221.23,217.82,218.44,217.2,218.44,218.13,217.2,216.27,218.44,220.92,220.61,218.75,217.2,220.3,231.75,232.98,231.44,228.03,223.7,223.7,220.61,230.2,234.53,233.91,236.08,239.48,239.48,241.96,237.93,237.62,238.24,240.1,240.72,241.34,238.55,241.65,245.67,247.22,249.07,248.14,248.45,243.81,242.26,242.26,242.26,243.5,239.48,237.93,242.26,241.34,244.12,244.12,241.03,239.17,239.79,238.24,236.08,236.7,233.91,232.36,228.96,228.96,220.61,226.79,226.79,226.79,226.79,226.79,228.96,225.87,225.87,225.87,233.29,231.75,228.03,228.03,231.44,232.05,229.89,229.89,229.89,229.89,221.23,222.46,222.46,222.46,221.84,225.56,225.56,216.89,215.04,215.04,215.04,216.58,217.2,217.2,217.82,217.82,218.75,216.27,217.51,218.13,215.97,215.97,215.66,217.2,216.27,215.35,213.8,214.42,214.11,211.94,210.4,209.78,210.09,207.3,212.56,208.85,206.06,206.37,208.23,208.54,209.47,207.3,205.14,204.52,201.11,200.5,208.54,208.23,208.85,210.09,210.09,205.75,205.75,203.28,203.28,200.8,205.75,205.14,209.16,210.71,208.85,210.4,210.09,205.75,205.45,203.9,205.75,209.47,208.54,208.54,206.37,206.68,206.68,202.66,202.04,201.73,197.4,192.14,191.52,187.81,188.43,185.02,181.62,181,178.22,177.6,180.69,181.93,183.79,179.46,176.36,173.89,176.67,176.98,174.5,180.07,181.62,181.93,179.76,179.46,177.91,185.64,191.52,188.43,187.19,191.21,189.67,189.05,190.9,191.21,191.52,189.98,189.67,190.9,189.67,190.28,190.28,188.12,185.64,182.86,185.33,186.26,186.26,188.74,186.88,190.28,188.43,185.64,182.86,182.55,184.72,185.64,181.31,181.93,184.72,180.69,177.91,176.67,176.67,173.27,172.03,172.03,172.03,179.76,175.74,173.27,173.89,174.5,172.65,171.1,168.32,168.63,166.77,167.7,163.68,162.75,164.29,164.29,170.79,173.27,174.2,173.89,173.89,171.41,172.65,170.79,174.2,175.12,174.81,172.65,171.72,172.96,177.91,178.53,183.79,184.1,177.29,183.79,185.64,184.41,183.17,183.79,186.26,191.21,191.83,186.88,194.62,191.52,193.07,194,189.98,191.21,189.98,187.5,188.74,189.98,188.74,185.95,187.5,192.45,193.69,186.88,186.57,183.17,182.24,183.17,186.88,184.1,184.72,187.19,183.48,184.1,184.1,181.31,179.46,182.86,179.76,179.15,179.76,175.12,171.1,171.1,171.72,171.41,178.84,180.07,182.55,187.81,186.88,187.19,187.19,188.12,189.05,188.74,186.88,190.28,191.21,191.21,191.21,195.85,197.4,199.88,195.85,189.98,188.74,196.47,196.47,190.59,191.83,195.24,195.85,194.62,194.62,195.54,192.45,197.09,193.69,194,192.14,189.05,191.83,189.67,187.19,187.5,187.5,188.12,187.19,190.28,187.81,186.57,185.95,184.1,185.64,182.55,185.02,185.33,189.67,186.26,186.57,189.05,192.76,194.93,192.14,194.62,194,195.54,198.02,195.24,196.78,197.71,192.76,201.11,203.28,203.9,204.21,204.52,201.42,202.04,202.97,202.66,202.04,203.28,201.73,196.78,198.33,199.88,202.66,202.66,203.28,202.35,201.42,201.42,203.9,202.04,199.88,198.64,198.33,199.57,202.35,201.11,204.83,211.63,211.94,211.63,211.94,212.87,217.51,217.51,223.7,220.92,219.37,223.39,221.84,221.84,219.68,219.37,222.77,219.68,222.77,222.46,221.23,222.15,220.3,220.92,218.13,220.61,221.53,224.01,224.63,224.94,224.01,223.39,225.87,225.87,222.77,221.53,216.27,215.04,221.23,222.46,222.46,227.1,226.79,222.77,221.84,219.68,217.51,217.82,216.58,215.97,221.84,218.44,215.97,219.99,216.27,212.87,211.32,211.94,209.16,213.18,210.4,208.85,208.23,208.23,207.3,206.37,205.14,206.06,206.06,207.61,211.01,207.61,206.68,206.68,207.61,206.99,219.68,220.3,218.75,216.58,217.82,217.51,219.06,218.13,219.37,221.84,222.77,217.2,215.97,215.35,213.18,212.87,214.73,212.25,211.63,211.63,211.63,211.63,211.63,208.85,206.37,204.21,204.21,205.45,211.01,213.18,210.4,208.23,214.73,218.13,215.04,212.87,211.63,211.94,210.4,206.37,208.23,208.23,206.99,212.25,215.66,215.35,219.37,219.37,216.27,217.51,218.13,217.82,219.06,223.39,225.25,224.32,224.94,225.25,225.25,224.01,221.84,220.61,224.94,224.94,225.25,222.77,224.63,220.3,221.84,221.23,224.63,225.87,227.41,225.25,226.18,226.79,225.56,227.1,231.44,232.05,234.84,234.84,237,241.34,242.88,242.88,246.29,238.24,237,237,236.7,231.13,227.72,226.49,226.18,228.65,224.63,219.68,221.84,231.13,232.36,232.67,228.96,229.27,227.1,230.2,229.89,224.94,227.72,232.67,229.89,230.2,232.05,229.27,229.27,229.27,232.67,228.96,226.49,225.25,228.34,226.79,225.87,226.18,225.56,225.25,225.56,226.49,227.1,227.1,231.75,228.03,225.56,223.39,226.79,224.01,226.79,229.27,229.89,223.7,225.25,225.25,237.93,245.36,244.12,241.96,247.22,246.91,250,254.95,253.71,263,260.21,263.92,261.45,261.45,258.66,258.66,260.21,258.97,254.33,247.52,244.12,246.29,240.1,235.46,233.6,243.19,236.08,237.31,237.31,239.79,239.79,241.34,240.1,240.1,251.55,251.55,246.6,245.05,242.57,242.26,242.26,241.96,239.48,244.12,242.57,240.41,242.26,234.84,238.86,240.1,232.67,227.41,227.41,234.22,232.98,239.48,239.48,239.17,234.22,232.67,236.7,243.19,246.29,241.65,246.91,251.24,252.48,247.52,249.38,250,251.55,252.48,252.17,253.09,253.09,253.09,261.76,269.49,270.42,271.66,271.66,271.04,261.14,268.25,271.35,268.25,268.87,261.14,256.81,259.59,253.71,248.76,250.31,251.24,250.62,259.59,257.12,246.29,220.92,224.32,231.13,227.1,231.13,233.6,235.46,238.86,238.86,248.14,242.26,244.12,242.26,242.26,240.41,235.46,234.53,236.39,228.96,229.89,230.2,224.32,216.58,213.49,213.18,208.85,204.83,200.8,205.14,199.26,199.26,199.26,199.26,195.24,194.93,193.69,195.54,192.45,200.19,198.64,190.28,190.28,189.67,189.67,187.5,188.74,186.57,186.57,182.24,183.48,183.48,188.74,184.1,184.72,183.17,182.55,178.53,182.86,175.12,172.96,179.76,184.41,182.86,183.17,180.38,181.62,178.22,177.29,177.29,176.36,170.17,163.99,156.56,154.39,165.53,175.43,174.2,171.1,174.5,173.27,179.15,180.38,174.2,171.72,167.7,165.84,165.84,164.29,166.15,167.39,165.22,167.08,167.08,172.96,173.58,172.03,167.7,169.86,164.29,163.99,165.53,168.32,168.32,165.84,166.15,164.6,164.6,165.22,168.32,172.96,171.41,177.29,173.58,171.1,167.39,166.77,166.15,168.01,166.15,165.22,165.53,168.01,166.15,166.15,166.15,166.15,166.15,166.15,162.13,157.8,163.06,163.68,167.08,166.15,172.03,172.34,172.65,172.65,173.27,173.27,176.05,181.62,180.69,180.07,177.29,176.98,175.12,174.2,168.63,168.63,168.63,167.08,168.01,166.15,166.15,165.84,169.86,169.25,169.25,178.22,178.22,181,186.26,190.9,187.19,185.02,189.98,191.21,186.26,178.84,181.93,181.93,178.22,173.58,164.6,165.53,163.99,174.5,170.79,173.89,175.12,169.25,170.48,171.1,171.41,170.17,172.34,172.34,172.34,172.65,172.65,171.72,171.72,168.01,168.01,168.01,168.94,168.94,169.55,178.22,176.05,177.6,177.29,175.74,172.65,172.96,172.34,169.25,167.7,169.25,166.77,172.96,173.58,173.89,175.74,175.74,178.84,182.86,182.86,185.02,183.17,185.33,184.1,180.38,176.98,179.76,185.02,183.17,184.1,179.46,187.19,189.67,186.26,188.12,185.02,186.26,188.12,197.4,195.85,190.9,189.98,186.88,188.74,193.69,193.38,197.09,200.19,206.37,207.61,209.78,204.21,205.45,204.21,203.9,217.82,218.44,224.63,220.92,213.18,215.66,216.27,212.87,218.13,222.15,219.68,219.99,222.46,221.53,221.53,216.58,216.58,218.13,218.44,220.92,221.23,217.51,218.44,215.35,215.66,209.16,213.8,215.97,216.89,215.04,216.89,221.23,224.63,227.1,233.29,236.7,245.67,241.96,248.45,248.45,258.35,262.07,264.23,266.4,257.74,260.52,259.59,266.09,277.69,277.69,277.69,277.69,277.69,277.69,292.08,288.68,283.42,293.94,302.29,302.91,303.53,301.67,305.07,298.58,305.69,315.59,307.86,310.95,322.09,332.61,343.75,324.57,311.26,306.93,302.91,311.26,320.24,319,318.07,300.74,311.26,302.6,298.58,311.26,293.32,299.2,307.24,318.07,320.24,310.95,311.88,319.93,323.33,325.19,335.4,338.8,335.4,334.16,331.99,336.94,324.26,318.07,333.85,332.92,328.9,341.89,344.99,343.75,343.75,362,369.74,370.98,370.98,397.59,427.29,429.76,436.26,429.46,430.07,429.46,425.74,434.1,445.24,460.71,461.94,449.26,462.56,471.23,470.61,470.61,493.5,502.48,497.22,496.6,465.35,518.25,523.21,492.88,490.72,514.85,513,519.18,552.6,560.64,560.64,560.64,560.64,587.87,588.18,597.15,618.81,629.64,674.5,669.86,669.86,603.65,532.8,592.82,582.3,536.82,581.37,587.87,581.37,567.76,583.85,599.94,645.11,620.36,616.96,576.42,586.94,584.78,557.24,557.24,545.48,517.33,586.79,551.98,576.11,597.46,607.98,651.3,631.19,637.38,621.91,638.92,652.85,672.96,668.32,663.68,677.6,672.96,694.62,679.15,694.62,686.88,699.26,682.24,682.24,719.37,719.37,823.02,840.04,830.75,883.35,863.24,878.71,915.84,836.94,869.43,852.41,853.96,926.67,905.01,905.01,925.12,949.88,926.67,980.82,1079.83,1115.41,1115.41,1087.56,1017.95,914.29,996.29,935.95,925.12,997.83,1042.7,1061.26,1072.09,1121.6,1095.3,1093.75,959.16,1053.53,1109.22,1050.43,999.38,1033.42,973.08,884.9,957.61,983.91,915.84,858.6,860.15,881.81,787.44,813.74,864.79,788.99,788.99,754.95,801.36,806,835.4,771.97,785.89,680.69,645.11,640.47,812.19,741.03,742.57,761.14,713.18,714.73,711.63,741.03,790.53,829.21,849.32,849.32,830.75,765.78,838.49,870.98,795.17,795.17,809.1,823.02,795.17,804.46,807.55,775.06,773.51,790.53,835.4,833.85,833.85,832.3,802.91,770.42,768.87,784.34,781.25,807.55,847.77,855.51,883.35,883.35,883.35,835.4,843.13,830.75,853.96,853.96,853.96,841.58,830.75,810.64,810.64,775.06,717.82,717.82,649.75,666.77,674.5,654.39,691.52,663.68,666.77,659.03,686.88,748.76,717.82,696.16,708.54,679.15],"어플라이드 머티어리얼즈":[null,null,100,103.93,104.57,103.22,99.86,102.13,102.73,104.93,106.38,108.89,108.93,111.09,112.23,112.97,112.97,112.97,112.83,113.96,114.1,106.66,111.41,111.73,112.01,115.2,115.91,114.64,113.39,113.5,113.89,117.15,115.2,114.95,115.56,115.45,116.97,116.58,116.58,118.11,116.58,115.73,114.35,114.35,113.18,114.25,113.75,113.54,116.16,117.4,118.6,118.04,119.74,119.74,118,119.38,119.6,119.91,119.6,120.59,121.97,120.41,124.17,121.69,121.37,124.13,123.81,125.12,124.66,125.94,126.15,125.48,125.16,125.66,124.84,125.76,124.66,126.4,126.4,129.62,129.38,128.14,128.63,129.09,128.35,130.58,129.31,130.65,130.62,131.01,131.79,132.46,135.08,136.22,135.61,137.92,138.38,139.19,140.22,136.71,137.56,137.67,138.09,137.7,137.56,137.74,137.81,137.85,137.81,138.2,136,136.71,137.95,137.7,135.36,133.84,132.96,132.96,134.73,134.83,139.09,141.35,141,143.3,144.54,144.26,146.46,143.91,147.77,147.8,147.24,147.48,148.23,147.2,148.97,151.91,154.08,153.93,157.05,159.71,151.52,155.6,156.2,158.5,159.14,158.15,159.53,161.23,161.23,161.45,162.58,163,165.84,165.56,165.02,167.47,168.07,158.54,157.12,158.93,155.85,152.94,152.76,156.95,153.65,154.57,153.58,156.24,153.26,148.44,151.28,146.85,146.39,145.32,145.32,149.26,149.22,154.29,156.66,160.88,160.45,160.52,163.43,163.54,165.2,167.19,167.43,165.88,165.77,164.42,168.14,163.15,160.35,157.02,156.27,151.42,151.31,151.74,155.78,155.56,155.24,148.94,152.66,155.14,155.49,157.55,152.8,156.98,153.47,157.51,155.99,154.93,153.47,154.61,155.99,161.13,159.89,159.82,159.82,157.62,158.5,160.24,157.16,161.52,161.76,163.43,166.73,167.04,170.27,171.01,167.54,167.08,169.28,164.17,162.72,173.07,179.38,184.59,184.55,183.7,182.85,182.25,185.68,186.71,186.36,188.63,188.91,191.14,195.04,195.36,196.1,196.07,198.76,199.75,199.79,195.96,198.19,200.89,198.09,199.96,197.41,199.36,200.39,199.61,200.11,201.7,196.6,199.72,202.09,199.93,197.63,204.96,200.18,204.18,208.36,204.39,204.39,205.21,201.77,203.15,187.49,187,183.95,176.36,177.46,180.76,185.33,182.25,182.92,178.84,179.87,181.82,186.18,189.23,187.67,188.84,183.88,184.48,184.48,180.9,183.13,183.27,181.15,187.95,191.28,192.38,193.48,198.16,194.4,188.87,188.52,189.4,189.4,193.13,203.19,203.4,203.4,203.61,204.78,201.56,197.59,202.41,196.07,189.16,190.04,188.8,179.59,171.19,178.07,172.54,162.12,170.38,175.41,175.58,184.12,191.32,195,195,200.78,198.9,198.69,202.02,208.4,204.25,204.08,202.23,205.63,204.22,212.58,210.56,210.38,218.32,216.05,211.52,213.43,213.61,210.63,207.3,209.89,215.38,208.93,196.24,207.19,196.46,191.57,197.06,197.06,187.42,191.28,196.88,192.38,185.47,187.88,194.19,194.72,199.96,198.69,201.52,205.03,193.94,181.4,181.04,177.82,172.64,174.13,178.92,175.05,176.01,180.4,179.06,179.7,186.25,186.36,189.4,191.81,196.78,194.33,195.82,191.67,195.5,191.21,175.44,177.18,178.07,178.38,179.91,180.19,180.19,184.34,182.81,179.94,185.12,185.29,187.49,186.14,181.61,181.25,176.79,180.23,180.65,176.08,174.73,171.23,172.04,172.15,173.6,169.95,165.52,165.38,160.35,160.49,163.68,161.87,158.75,158.75,161.02,163.47,164.85,165.63,160.17,161.87,163.47,164.1,167.61,171.08,165.38,165.7,164.53,162.69,162.86,167.15,171.16,169.77,172.32,169.99,170.48,173.07,175.34,175.87,177.82,174.2,170.55,170.98,171.44,168.36,168.07,155.1,154.25,155.07,152.34,151.63,151.42,155.03,153.79,152.73,152.87,152.45,152.45,151.03,150.6,142.7,141.21,140.33,138.84,136.04,137.81,138.55,137.14,138.87,138.34,139.58,140.43,138.55,136.71,135.58,135.9,136.96,135.86,137.85,137.92,134.27,131.96,129.66,126.58,122.01,116.19,119.38,118.46,123.18,123.88,120.2,121.51,118.82,118.78,112.72,115.66,114.67,110.28,114.88,116.51,125.27,124.98,121.62,123.56,124.91,123.81,121.47,115.59,118.67,118.99,124.1,125.44,121.97,126.75,124.7,124.7,124.2,127.6,127.57,131.5,129.48,132.1,135.86,125.55,125.55,122.93,119.21,121.08,120.55,121.19,119.45,115.7,115.77,117.93,111.73,109.5,107.41,102.73,102.73,108.58,111.8,114.74,116.02,118.64,111.76,119.42,121.55,116.62,121.55,123.18,123.25,119.99,119.6,119.21,122.4,126.54,126.54,122.04,121.58,134.02,138.87,137.14,135.36,140.33,138.48,139.3,137.85,138.63,142.74,141.46,140.96,141.39,144.19,144.76,144.26,138.55,138.55,139.26,138.2,137.6,139.72,140.54,140.26,137.42,135.86,136.64,138.48,137.95,134.9,133.13,133.73,136.46,137.17,136.78,137.95,143.13,141.74,143.05,140.22,146.46,141.25,139.62,140.43,137.95,136.46,140.54,145.75,145.25,150.35,151.03,152.52,152.09,148.87,149.43,150.5,152.34,151.35,154.93,155.53,155.74,155.74,155.17,155.32,157.55,157.51,158.26,156.77,156.17,153.72,154.85,155.78,152.76,149.01,147.34,145.07,144.58,138.52,141.78,147.06,147.63,151.31,142.98,146.24,143.48,141.53,139.97,139.97,138.24,139.51,140.86,137.1,137.42,143.23,143.83,146.63,147.09,152.87,155.03,147.06,147.59,146.1,143.52,149.93,150.71,153.12,152.23,150,148.76,154.43,158.36,159.14,161.87,158.26,158.29,158.29,155.85,153.97,155.81,158.47,160.45,164.81,164,163.04,163.78,170.69,169.42,179.77,180.83,184.76,180.09,179.8,179.55,179.77,174.95,171.76,168.5,161.09,164.17,165.41,169.6,167.08,164.64,170.3,165.52,167.12,165.24,166.9,165.59,165.95,166.65,159.89,161.62,161.27,162.65,167.65,170.16,170.16,168.71,175.44,178.42,177.53,179.52,177.85,182.71,181.61,181.96,180.44,181.43,184.59,183.13,180.58,183.42,181.29,184.02,184.8,175.16,176.82,177.25,175.27,175.9,180.3,179.48,174.73,180.16,180.76,183.38,184.05,187.49,182.71,184.76,183.13,186.53,184.2,179.06,195.15,197.45,201.81,196.74,195.64,192.27,196.53,197.52,198.02,197.8,198.23,198.55,200.53,199.93,202.41,201.84,219.91,220.94,215.95,211.37,200,198.23,206.52,204,206.56,206.56,205.17,200.92,196.1,198.76,197.87,200.57,200.57,200.64,209.21,213.89,212.15,212.47,215.41,213.96,214.99,219.03,216.44,217.93,217.93,217.26,216.76,215.91,216.3,220.41,216.9,212.23,218.36,218.21,219.6,217.82,219.03,220.94,219.45,223.99,222.71,222.71,223.95,226.4,226.4,219.7,209.25,213.29,211.98,213.5,205.49,211.62,223.28,226.08,223.92,218.67,222.96,228.38,231.64,238.73,236.89,236.89,230.9,238.87,235.29,227.75,216.44,208.58,211.94,201.98,205.95,213.18,205.67,214.46,209.53,204.78,184.51,199.04,186,159.85,180.33,143.62,158.97,138.84,142.42,134.62,142.35,159.96,158.5,174.34,159.64,167.61,162.37,153.44,153.22,149.82,163.54,168.53,182.35,175.73,175.73,176.75,185.93,178.49,185.08,188.52,179.41,171.26,184.66,180.37,183.35,180.83,178.67,192.56,176.05,166.16,168.6,173.1,178.95,181.61,190.68,191.39,185.44,182.46,192.88,184.41,192.63,196.56,201.56,194.97,192.74,192.74,195.39,199.86,193.73,199.08,197.34,197.7,204.85,205.99,213.29,212.26,211.87,212.12,196.35,200.39,202.16,207.44,212.62,213.96,215.98,217.12,215.59,212.51,212.54,206.87,209.28,214.21,211.48,216.16,216.16,224.88,220.34,222.43,224.98,221.79,217.97,221.62,220.06,220.91,220.77,225.83,226.12,227.57,225.48,214.81,223.28,220.77,224.13,228.28,227.96,230.37,229.8,229.87,225.41,225.27,231.18,228.42,235.65,230.58,239.62,237.21,235.4,233.42,226.05,220.66,225.87,226.97,225.94,219.81,223.49,218.28,219.31,230.62,217.79,216.02,216.02,197.13,195.61,195.32,194.9,200.07,202.69,200.11,199.65,198.97,203.12,205.14,202.87,204.78,206.34,210.35,211.37,210.67,214.92,206.27,214.74,214.03,216.58,221.83,224.27,229.2,229.23,226.72,225.05,223.25,219.88,220.62,220.09,218.64,215.98,210.88,208.47,203.12,210.84,209.89,213.78,219.1,229.84,247.87,249.93,252.66,245.89,252.16,247.34,258.01,263.93,263.54,268.28,273.74,271.86,285.26,293.94,287.53,287.53,292.91,292.28,298.62,302.23,305.1,314.81,315.88,318.04,311.2,311.45,312.9,313.61,313.5,313.78,310.06,305.07,306.2,303.47,297.77,302.37,302.37,300.74,298.62,308.22,305.81,307.83,317.51,321.86,335.08,338.63,347.13,354.39,347.45,374.91,365.49,365.49,387.03,382.14,382.6,376.79,383.13,373.95,349.33,358.43,342.59,358.65,367.08,353.9,365.84,356.87,376.29,373.42,375.19,400.43,413.54,413.54,419.38,410.03,401.95,423.32,408.33,411.55,435.19,403.72,418.82,433.2,416.37,409.07,383.56,402.02,374.49,404.75,399.29,415.27,405,407.09,419.91,424.88,404.96,407.02,422.86,412.4,429.13,424.24,455.85,445.46,449.18,473.42,501.49,501.49,506.91,494.47,493.05,493.8,492.24,478.38,478.74,475.34,476.29,473.88,463.82,455.67,478.56,466.87,477.89,486.53,484.69,480.83,479.77,470.27,470.77,456.13,461.69,466.8,471.12,441.85,437.81,407.09,424.95,442.35,437.88,431.64,442.24,461.76,455.92,476.9,487.24,485.12,488.38,489.48,489.48,489.76,492.59,483.27,495.57,492.45,481.43,477.14,486.04,484.83,492.66,491.28,485.4,486.61,465.02,471.47,472.86,480.16,489.94,482.6,499.61,502.91,504.61,488.84,489.58,489.58,484.69,477.92,469.63,478.03,484.76,482.96,480.69,472.01,454.22,455.78,467.65,489.01,486.11,490.54,490.72,478.03,486.22,487.24,495.85,503.22,503.76,505.88,504.15,505.49,503.19,489.23,477.75,457.9,460.31,466.65,456.41,451.35,457.83,450.74,465.95,465.77,470.66,469.49,483.88,482.1,478.84,472.93,476.44,481.33,481.33,483.66,473.28,478.38,484.9,494.12,496.6,500.46,510.6,498.94,480.26,479.02,489.37,500.04,502.91,505.81,470.91,454.54,456.17,457.58,443.66,453.83,448.33,453.15,447.27,451.81,449.18,454.32,468,466.3,472.29,476.97,474.77,472.5,481.68,481.08,467.75,468.32,482,484.23,494.37,500.39,505.85,532,543.2,542.03,553.83,532.96,545.36,555.71,553.76,559.39,552.73,562.51,531.64,522.86,527.71,528.03,528.03,507.76,535.86,521.58,537.46,519.1,516.76,522.25,555.95,557.37,540.93,541.21,521.26,523.49,544.51,519.84,517.9,513.86,536.57,539.76,550.99,550.99,576.61,565.7,570.45,559.82,557.62,566.73,561.16,544.79,554,534.41,530.09,540.22,565.38,556.98,591.78,591.78,539.9,506.98,493.09,478.6,493.59,471.26,480.44,461.2,469.35,489.65,491.18,498.8,483.73,480.4,482.39,491.67,510.99,495.29,469.49,467.26,495.54,499.5,483.59,472.54,472.54,461.59,453.08,472.79,480.94,475.55,459.28,471.93,462.93,445.57,422.47,439.94,455.78,442.84,438.13,425.69,440.86,462.37,467.72,478.88,475.55,480.09,465.7,491.11,485.68,487.81,501.2,481.22,467.04,451.49,458.68,431.29,422.86,433.73,425.09,411.91,405.95,414.1,401.7,401.7,407.05,414.81,417.75,409.96,399.72,405.63,385.97,385.58,406.2,391.03,400.32,403.26,421.01,402.09,398.65,374.73,379.8,368.25,378.31,396.39,391.5,414.03,394.54,392.42,377.25,389.55,377.71,384.59,407.76,423.39,423.39,415.63,405.6,415.77,407.37,407.51,409.89,398.51,380.01,361.02,341.32,342.38,345.22,317.47,318.32,318.32,337.24,332.88,330.55,345,345.89,336.71,325.8,322.4,305.71,305.71,304.75,306.73,321.58,323.14,314.03,314.42,315.66,324.84,334.76,330.05,348.09,362.26,367.97,360.28,357.9,350.5,366.62,372.64,375.55,377.04,372.04,386.29,393.55,388.45,382.1,353.15,372.25,373.95,391.14,389.01,384.44,375.62,383.66,370.77,357.23,361.2,359.6,372.08,350.11,342.1,334.94,333.35,325.34,323.32,323.32,319.95,325.8,332.35,341.99,341.25,320.3,321.19,315.1,314.92,317.93,312.26,308.61,301.35,298.69,293.91,298.19,304.75,299.15,290.33,305.63,316.83,316.16,312.26,292.7,280.62,270.38,269.35,281.43,265.13,263.68,266.58,273.78,278.74,292.06,300.99,310.17,312.33,306.66,317.93,312.86,318.18,310.99,305.81,324.95,336.78,345.36,334.44,371.33,391.67,381.33,391.42,369.31,370.13,371.01,372.57,379.31,381.54,381.54,374.98,366.65,365.88,388.38,379.2,378.14,377.14,371.05,376.01,384.87,380.37,387.56,396.42,388.52,370.52,371.12,368.5,366.76,375.27,345.85,344.51,344.51,337.85,333.91,344.22,345.07,345.07,342.77,351.91,346.99,369.49,377.36,382.85,390.01,390.5,389.69,389.69,387.7,388.73,376.19,388.55,404.54,400.39,403.79,409.57,398.65,383.42,395.07,421.72,440.33,425.16,417.04,427.07,410.88,411.34,406.7,412.93,419.7,423.32,408.89,409.07,409.07,394.33,391.25,400.11,394.44,397.13,411.59,415.52,419.74,421.55,420.06,412.37,420.45,414.74,405.35,410.49,426.44,419.84,435.26,434.44,439.55,426.65,421.19,435.08,423.56,421.23,412.47,424.7,432.71,435.26,433.45,425.66,415.73,405.56,405.56,412.83,412.4,400.99,402.09,400.07,396.14,394.29,391,405.35,402.06,402.59,391.96,390.89,395.75,400.53,400.25,397.45,401.45,398.48,411.27,410.17,403.4,408.97,409.14,411.37,429.16,428.49,445.43,460.38,449.86,448.44,441.14,431.36,462.33,482.14,482.14,483.95,472.36,477.78,477.07,473.88,474.63,478.42,482.64,482.35,496.14,502.45,500.25,496.49,492.31,492.31,490.86,484.3,492.27,482.18,495.39,519.31,510.38,511.09,512.19,515.49,515.49,504.11,497.45,494.58,498.09,487.46,492.17,505.49,505.81,515.59,512.08,502.41,474.98,483.35,490.26,496.31,492.63,517.86,538.38,537.17,540.86,522.08,523.78,516.16,532.88,524.49,514.39,512.44,491.96,502.8,496.39,489.9,487.56,505.53,527.18,523.92,524.45,505.03,511.55,515.31,531.47,534.9,541.32,545.68,545.68,544.33,542.81,525.27,522.79,519.88,510.17,512.33,512.3,489.9,497.06,487.99,485.37,479.06,482.53,484.02,475.12,478.6,489.79,490.61,494.37,484.48,493.62,493.55,497.13,496.63,501.06,503.83,513.82,500.14,499.65,505.74,501.24,476.36,475.27,475.66,478.03,461.06,463.64,465.27,464.32,468.99,479.41,490.82,495.22,497.38,502.27,511.09,507.34,533.95,530.62,546,550.57,548.58,526.54,540.64,528.88,529.7,529.7,532.74,534.41,524.66,529.27,530.76,537.17,525.41,517.9,512.76,525.83,523.46,549.75,557.12,556.31,573.14,573.88,568.25,575.23,556.06,571.9,574.24,574.24,582.14,581.89,578.03,574.31,547.02,536.68,529.09,527.99,537.07,535.19,530.86,538.45,535.97,535.97,544.86,543.48,568.18,595.11,596.39,591.96,617.08,611.73,591.42,597.02,589.09,582.21,591.67,595.96,606.27,597.8,605.6,616.19,658.54,657.48,638.94,659.78,664.99,707.19,707.19,670.23,674.45,707.76,698.65,721.3,718.85,700,714.46,745.04,742.35,734.9,751.84,753.4,728.42,713.57,726.22,710.7,711.37,703.93,711.3,713.47,726.65,746.99,745.04,738.7,732.35,737.07,730.79,730.79,739.51,730.37,734.87,720.73,736.53,740.75,745.61,741.5,754.71,736.57,728.84,742.31,708.33,688.59,672.47,671.37,684.76,694.76,699.86,720.69,727.36,703.93,687.42,701.31,723.21,740.11,734.66,734.8,731.15,743.2,732.21,743.52,770.69,758.43,751.52,779.41,778.88,773.03,772.32,782.74,782.74,784.27,776.22,767.33,762.15,759.07,752.02,791.53,785.79,785.72,808.5,814.92,842.13,841.78,839.94,860.6,878.21,878.21,850.43,834.2,814.46,830.16,822.71,823.99,836.25,841.28,853.51,862.19,862.19,859.64,872.75,891.11,903.51,854.93,862.51,870.13,871.16,779.84,771.26,745.07,791.89,778.35,731.86,716.94,731.64,728.46,697.17,751.95,695.61,644.26,644.54,649.57,632.57,675.23,677.46,684.23,711.55,714.49,750.64,736.71,747.48,730.55,741.03,709.43,718.18,695.36,693.73,683.52,683.84,699.01,699.01,649.79,646.28,638.7,619.24,629.16,630.94,658.89,649.22,667.86,664.71,668.28,659.6,697.06,680.94,687.6,697.31,699.18,742.77,726.15,715.98,698.8,712.79,707.26,715.7,709.18,711.84,726.65,722.75,726.65,757.94,676.9,654.11,649.33,660.38,653.65,648.48,647.41,651.13,660.95,656.77,673.71,656.63,643.44,649.82,644.29,660.81,664.49,687.77,680.47,668.18,661.27,647.73,659.11,598.44,605,599.96,604.15,622.79,619.7,618.53,613.75,607.09,607.09,619.1,649.43,649.04,641.96,609.6,613.11,609,595.92,606.41,599.15,600.11,600.32,603.61,586.29,572.08,579.7,593.41,596.63,596.63,593.73,591.18,579.87,576.29,580.69,602.62,628.92,630.12,627.18,627.18,608.26,605.46,615.34,632.1,660.81,680.55,680.55,683.45,692.81,675.76,661.76,618.6,612.51,621.12,643.94,639.09,633.59,632.74,640.22,647.77,637.85,650.82,649.18,641,652.98,599.57,599.57,609.5,616.8,623.71,609.43,597.34,586.61,597.13,555.07,560.13,539.09,541.71,550.39,537,551.67,531.5,520.87,528.21,531.36,551.59,550.89,543.98,547.34,547.06,539.05,549.08,544.44,533.95,523.32,514.03,514.25,516.16,523.56,480.19,449.86,470.77,456.98,530.58,489.87,513.61,512.15,515.41,489.69,487.1,487.1,480.37,490.08,508.79,532.14,537.03,534.34,529.94,534.05,527.85,549.61,547.87,542.27,552.13,552.8,551.42,595.29,613.15,617.08,619.24,586.71,588.02,587.28,574.88,568.82,558.15,558.15,573.46,572.61,565.13,555.46,557.3,573.14,573.81,581.82,590.86,601.67,615.77,612.3,620.13,604.5,625.62,616.9,612.47,612.47,600.5,609.36,638.48,648.72,650.32,649.22,648.72,651.17,673.32,677,677,676.05,690.96,692.38,701.74,701.38,698.44,706.2,690.33,682.21,674.84,682.53,663.15,662.69,666.62,658.01,674.24,667.65,671.12,638.06,637.81,647.84,634.83,631.25,649.01,655.1,653.37,667.79,673.39,667.04,573.21,579.48,574.84,570.38,566.41,575.8,574.03,582.96,582.53,585.65,569.67,569.67,558.36,553.69,560.74,576.72,574.24,579.38,579.09,602.94,594.61,605.71,614.95,631.22,672.43,673.64,710.56,711.8,713.82,707.3,722.61,726.26,725.51,771.58,792.31,770.84,793.44,749.68,770.77,780.65,743.98,777.75,773.18,806.45,806.95,797.27,808.4,800.85,781.57,809.6,810.6,819.74,806.66,835.4,824.06,826.01,842.35,815.7,853.61,827.53,815.27,833.03,810.31,817.61,791.03,800.89,810.45,797.73,833.2,780.4,793.8,818.25,859.18,885.79,885.79,893.87,902.73,940.22,951.91,954.78,949.68,950.25,946.63,975.02,957.16,918.53,925.83,917.22,879.77,898.3,908.61,917.82,922.15,924.1,924.1,928.07,932.14,921.23,910.67,952.76,1007.51,1048.94,1035.44,998.02,1067.26,1088.73,1080.33,1069.77,1130.69,1158.79,1158.79,1127.68,1152.52,1129.66,1142.38,1132.03,1178.99,1193.3,1209.57,1142.17,1163.71,1129.23,1054.57,1077.21,1142.84,1171.4,1166.09,1204.39,1163.68,1257.65,1257.65,1272.61,1308.65,1310.52,1330.19,1323.71,1339.23,1399.54,1331.4,1319.28,1318.85,1244.93,1267.75,1227.96,1150.74,1201.06,1225.66,1244.05,1195.15,1210.24,1226.72,1248.97,1238.38,1265.8,1265.27,1282.03,1325.27,1308.79,1199.68,1194.79,1145,1211.16,1253.72,1234.83,1234.83,1249.54,1255.53,1366.83,1409.67,1415.63,1402.3,1401.98,1397.09,1381.64,1406.59,1387.74,1397.34,1429.77,1431.29,1477.82,1434.66,1350.5,1355.74,1397.91,1378.74,1386.89,1455.78,1518.85,1455.14,1543.02,1572.01,1527.99,1547.17,1561.16,1547.2,1465.52,1441.92,1512.58,1514.39,1531.4,1531.4,1611.94,1588.41,1593.48,1594.83,1623.56,1736.53,1774.52,1777.82,1605.28,1744.05,1768.99,1761.2,1958.33,2010.1,2075.76,2013.57,2101.06,2186.78,2186.78,2268.53,2076.12,2087.07,2367.12,2221.26,2461.52,2562.01,2306.56,2136.92,2136.92,2100.6,1964.92,2021.62,2085.97,2135.01,2038.94,2110.91,2053.26,1987.7,1876.9,1862.86,2000.53,1962.86,1994.33,1900.25,1831.64,1688.38,1546.6,1778.07,1798.97,1836.32,1937,1893.13,1869.17,1910.49,1850.18,1862.54,1942.42,1894.19,1797.24,1896.92,1822.57,1758.22,1758.36,1744.58,1715.77,1701.06,1700.07,1709.28,1635.97,1624.34,1565.73,1553.72,1544.68,1611.3,1611.3,1675.37,1661.41,1608.82,1617.61,1503.22,1492.45,1471.93,1479.09,1575.37,1645.07,1674.2,1681.01,1680.55,1718.64,1724.88,1814.35,1812.12,1875.62,1913.68,1921.62,1879.06,1844.97,1805.71,1796.7,1763.04,1645.07,1582.67,1523.78,1450.35,1463.89,1435.08,1449.11,1330.9,1336.78,1373.46,1403.01,1474.13,1494.19,1382.32,1327.18,1353.37],"테슬라":[null,null,100,101.39,102.3,99.74,97.27,98.95,95.22,96.44,96.52,99,97.09,96.83,100.32,101.35,101.35,103.2,102.92,99.48,99.39,95.44,95.23,98.03,97.53,101.36,100.91,100.85,100.98,103.98,104.27,103.68,106.26,106.39,109.57,108.99,109.39,111.95,111.95,115.2,115.31,112.66,112.14,112.14,113.87,119.12,118.99,120.18,121.37,120.63,120.56,120.48,124.76,124.76,123.63,125.08,127.92,128.43,130.63,133.61,133.54,132.51,132.74,131.52,132.21,130.79,132.01,131.89,135.27,135.12,137.53,141.27,141.28,147.25,147.45,146.81,141.14,142.86,142.86,145.57,143.53,134.34,134.87,129.21,131.19,131.2,131.44,132.02,131.83,130.45,129.55,128.52,127.88,129.18,135.39,134.2,137.52,137.23,137.45,131.55,133.82,133.7,138.1,141.8,145.6,145.56,145.84,146.04,156.65,159.37,154.81,156.75,158.76,163.93,162,155.77,159.53,159.53,158.19,157.56,160.33,158.75,160.37,161.64,164.67,162.77,161.96,164.81,169.41,167.34,163.21,155.05,161.81,161.2,168.59,170.67,169.55,170.45,165.76,166.36,160.64,164.28,163.11,162.86,159.46,162.79,166.26,170.62,170.62,175.85,178.95,178.62,178.34,182.26,185.16,188.73,194.16,187.51,188.4,197.29,199.76,196.97,194.9,194.06,195.34,197.52,200.78,201.22,198.1,190.16,194.82,189.31,189.76,185.04,185.04,171.65,162.06,164.37,165.85,171.71,172.92,169.72,172.01,167.7,172.25,170.69,173.13,172.33,179.74,178.21,180.44,175.51,175.83,169.75,167.7,171.02,182.14,187.3,186.38,191.66,190.77,186.5,187.8,190.91,190.14,190.44,184.68,182.34,177.3,179.13,185.12,185.21,182.65,181.39,182.28,185.34,186.77,186.5,186.5,183.45,180.8,183.99,180.21,190.85,190.36,192.19,198.17,199.31,202.04,196.84,196.22,192.32,184.24,181.04,181.18,178.93,178.21,179,179.22,182.69,186.3,186.47,187.28,179.96,186.6,186.08,186.65,186.59,183.98,186.69,188.73,184.62,181.1,176.86,177.03,170.99,171.16,168.38,167.97,173.98,168.49,157.04,160.63,158.89,160.61,159.73,159,159,165.51,162,163.36,163.99,165.33,162.02,166.78,164.04,164.04,165.59,166.25,166.64,161.39,162.07,160.86,160.16,159.37,164.39,163.33,165.37,172.6,178.96,177.91,177.31,180.23,177.83,173.75,172.64,174.04,170.65,170.65,166.5,163.54,165.49,163.39,168.2,166.48,165.1,166.13,176.54,175.11,175.69,177.35,176.44,176.44,178.45,182.18,180.82,183.68,184.49,185.13,181.51,177.18,179.92,183.42,181.48,185.93,183.28,180.39,174.82,175.26,181.05,165.42,162.9,165.69,169.85,169.14,175.31,176.05,176.05,175.68,174.91,181.66,184.74,187.56,184.19,180.03,173.66,175.86,174.93,172.23,174.38,172.7,171.69,181.31,179.39,171.41,170.86,168.63,164.55,162.97,166.11,162.21,158.24,159.62,146.51,135.27,139.66,139.66,132.49,140.39,150.58,160.43,157.06,152,159.9,157.92,154.32,157.61,152.82,150.97,153.94,157.47,152.31,148.7,148.75,147.3,149.81,154.32,154.23,157.39,158.03,149.27,154.33,158.88,158.46,161.03,160.07,157.99,153.22,149.13,150.34,149.32,145.27,149.29,144.32,146.45,145.81,146.33,146.33,148.91,153.09,149.42,153.14,155.72,152.78,167.66,165.87,166.7,174.28,179.88,180.93,187.72,187.96,194.6,185.01,190.08,182.36,175.08,174.75,179.47,180.78,183.63,179.97,175.83,163.13,163.13,162.24,162.1,167.14,169.22,167.38,166.2,167.33,162.73,169.34,169.95,168.05,164.56,159.11,156.08,162.02,160.92,155.95,152.27,156.45,157.87,183.43,182.71,179.47,199.19,194.34,184.95,186.55,187.03,182.43,177.73,176.03,160.32,161.86,168.92,168.79,167.98,169.41,167.54,163.65,160.06,159.08,158.3,158.3,151.63,147.32,147.43,138.14,149.82,146.64,152.47,151.9,154.91,154.72,149.54,156.92,156.55,156.96,157.26,157.95,162.46,161.38,138.94,163.05,157.97,154.7,147.9,137.46,131.49,137.91,134.8,132.36,135.8,136.22,145.15,142.62,138.49,136.44,136.94,154.36,151.4,165.23,173.65,175.72,173.12,177.02,180.67,181.79,179.16,178.98,182.7,184.4,183.94,173.85,177.76,180.52,182.85,185.93,185.49,182.35,177.47,177.47,170.99,181.57,180.48,182.55,179.04,183.92,188.12,188.76,188.76,190.52,187.85,191.62,192.46,192.38,197.73,191.91,182.84,176.86,174.73,165.5,167.81,155.01,155.01,171.12,165.9,175.2,174.64,162.74,157.62,166.71,175.78,175.98,177.65,181.03,182.23,175.48,180.75,181.6,182.26,158.62,158.62,156.86,150.92,152.98,155.88,155.53,156.1,162.03,161.11,163.84,164.19,168.63,166.47,161.37,160.47,164.17,163.63,161.72,159.41,161.57,161.57,160.39,158.77,152.83,154.65,156.79,156.31,165.17,167.86,154.7,149.75,145.12,144.96,145.15,149.11,152.67,148.7,151.64,152.16,144.54,141.42,140.36,143.58,143.8,138.82,136.66,140.52,144.22,146.21,146.86,151.75,150.02,153.13,140.52,144.29,143.37,142.9,144.87,140.86,140.48,139.79,143.45,142.33,143.4,143.4,137.88,138.49,135.74,129.95,123.39,126.72,125.26,122.8,128.1,133.83,133.99,129.65,128.48,126.98,125.69,119.13,121.91,121.72,119.82,110.74,107.77,107.62,101.14,102.59,100.04,100.04,99.02,99.63,98.77,97.17,93.92,101.6,103.16,108.08,107.32,111.71,113.93,109.81,112.25,112.78,118.09,117.94,118.82,115.25,116.43,117.36,115.32,115.07,116.94,117.26,119.21,117.84,123.27,123.27,122.32,120.88,120.73,125.38,125.21,128.61,133.03,132.44,133.74,133.05,135.48,134.17,136.53,139,120.08,119.67,123.72,127.13,126.79,122.72,122.97,119.82,121.09,122.49,125.05,123.33,120.18,123.32,115.25,113.16,115.42,119.03,118.52,115.88,116.58,110.94,112.83,112.34,113.13,116.35,118.39,118.39,118.08,115.81,120.48,119.36,121.64,123.6,129.67,129.02,128.67,127.42,128.46,127.78,129.41,126.27,126.59,117.13,120.01,127.29,127.06,126.4,128.41,127.59,122.29,121.45,124.75,125.97,128.32,128.43,130.09,134.84,135.33,136.31,137.47,134.84,133.03,134.12,133.65,157.26,172.19,171.97,165.94,165.31,165.26,164.42,166.6,166.47,171.38,176.08,176.92,181.09,183.63,181.63,183.33,184.81,183.66,188.66,184.83,186.2,174.77,176.5,172.61,173.85,173.85,173.14,175.73,176.43,174.76,173.37,176.26,178.17,183.06,185.09,188.75,188.07,200.2,198.88,206.31,212.03,212.84,219.99,223.16,223.16,226.14,225.85,217.62,219.53,225.79,232.48,236.95,246.15,258.26,252.59,250.92,275.43,282.28,272.09,269.46,267.89,267.89,287.15,298.89,300.27,296.4,292.83,297.49,304.89,336.28,341.4,409.32,465.5,385.55,393.03,392.56,404.74,406.37,402.65,421.91,419.83,419.83,450.46,481.43,471.98,472.82,437.55,419.77,408.69,356.32,350.54,390.23,391.22,393.31,380.22,369.16,319.06,338.65,332.82,294.16,286.85,233.56,225.76,189.56,224.41,224.35,227.9,265.01,282.98,277.16,269.92,263.5,274.98,252.71,238.49,251.89,270.91,286.24,288.01,300.69,300.69,341.6,372.53,382.99,391.06,395.62,391.67,360.37,384.19,370.29,380.54,419.16,403.61,420.08,410.31,368.03,399.45,403.13,410.67,409.34,430.01,425.74,424.75,415.07,421.56,419.38,426.97,424.02,427.98,434.3,428.67,428.67,429.72,430.43,422.86,438.18,471.3,462.62,463.35,453.6,464.77,498.49,493.63,537.91,510.52,490.81,519.99,515.39,520.46,526.85,525.24,521.79,525.7,504.22,517.41,503.64,529.68,566.65,587.55,634.27,634.27,719.76,729.36,716.77,731.68,810.58,785.61,795.97,811.3,787.49,787.59,862.2,823.03,835.61,794.01,743.6,807.93,774.82,786.69,780.59,750.82,779.28,780.33,779.29,781.69,762.34,744.42,721.24,815.89,850.65,866.24,963.29,990.29,985.79,1050.5,1075.77,1056.99,1061.79,1129.92,1174.83,1161.52,1307.51,1246.46,1173.83,1067.91,1097.61,1097.61,866.42,961.06,974.34,977.96,1101.02,1180.1,1159.11,1111.01,1160.13,1179.13,1113.11,998.01,1017.5,1068.8,1105.16,1099.57,1125.66,1175.9,1089.13,1116.92,1086.22,1115.92,1117.55,1138.75,1160.53,1171.94,1210.38,1177.79,1153.63,1130.43,1107.11,1108.94,1117.21,1103.67,1102.75,1114.29,1065.33,1077.95,1018.16,1050.88,1112.25,1104.59,1149.48,1128.12,1105.32,1076.72,1094.48,1080.39,1071.84,1070.77,1158.72,1276.87,1310.01,1284.66,1369.25,1457.23,1506.09,1506.09,1536.94,1489.29,1534.32,1492.5,1556.94,1571.79,1683.88,1705.18,1586.06,1645.33,1600.52,1678.82,1661.55,1634.05,1720.98,1823.57,1705.13,1680.15,1694.95,1736.38,1736.38,1741.42,1747.45,1823,1851.57,1914.8,1928.82,1983.57,2141.16,2309.04,2128.44,2228.8,2241.84,2217.15,2167.72,2167.72,2215.97,2231.45,2217.12,2221.45,2311.08,2317.09,2267.42,2192.04,2082.1,2203.53,2290.07,2242.57,2230.24,2236.12,2265.48,2228.85,2111.72,2129.67,2141.37,2141.37,2089.16,2094.22,2065.96,2050.01,1874.74,1833.65,1946.95,1790.04,1772.41,1885.05,1801.11,1713.9,1630.56,1568.93,1477.23,1767.37,1752.89,1835.64,1820.24,1857.53,1776.03,1841.44,1713.79,1718.28,1757.98,1737.41,1653.73,1680.28,1623.4,1603.93,1667.77,1752.55,1736.33,1736.33,1813.21,1814.7,1760.52,1794.19,1776.4,1841.89,2000.21,1921.26,1938.63,1941.07,1875.08,1886.52,1952.46,1888.36,1913.83,1936.92,1849.13,1822,1776.34,1861.46,1797.07,1767.42,1760.44,1741.03,1764.19,1650.5,1619.44,1547.78,1500.03,1547.39,1513.51,1516.24,1478.43,1539.62,1524.14,1591.2,1586.61,1624.5,1655.25,1640.48,1640.48,1637.02,1587.74,1503.04,1571.81,1587.77,1583.73,1571.11,1600.86,1600.26,1620.72,1572.63,1587.09,1617.86,1635.47,1628.96,1636.52,1722.74,1783.74,1762.88,1807.09,1786.21,1783.43,1778.76,1781.33,1781.33,1730.64,1691.46,1712.87,1723.74,1799.17,1754.15,1714.37,1707.07,1690.33,1695.58,1733.05,1719.38,1703.56,1688.13,1725.49,1691.8,1697.58,1777.26,1803.11,1862.06,1862.25,1865.34,1875.08,1834.33,1872.8,1862.9,1857.21,1895.07,1881.74,1800.4,1746.72,1807.8,1767.08,1784.9,1853.22,1858.97,1866.08,1839.74,1867.97,1917.79,1930.42,1926.14,1921.68,1924.77,1924.77,1975.55,1978.04,1980.64,1931.86,1949.52,1953.43,1983.18,1986.22,1992.78,1915.85,1940.02,1972.97,1977.43,2031.88,2076.41,2040.2,2050.04,2034.74,2034.06,2050.61,2048.15,2053.81,2082.31,2061,2077.93,2114.08,2128.15,2147.15,2211.98,2283.03,2267.71,2271.73,2345.72,2386.86,2689.07,2672.2,2723.18,2825.99,2922.96,3171.15,3075.15,3184.98,3227.09,3206.58,3051.37,2685.51,2802.14,2790.49,2711.53,2658.98,2767.45,2857.39,2876.73,2983.47,3035.45,2909.92,2928.21,2928.21,2838.79,2983.29,3003.67,2873.11,2845.82,2663.12,2647.49,2759.63,2804.79,2633.82,2668.53,2535.71,2514.98,2560.85,2432.09,2446.92,2361.3,2462.56,2647.12,2799.64,2799.64,2870.33,2855.98,2849.99,2808.41,2772.83,3148.04,3016.35,2855.06,2793.61,2694.58,2776.34,2792.82,2902.55,2706.65,2754.01,2754.01,2703.9,2612.43,2614.06,2476.65,2440.18,2409.74,2459.62,2175.43,2220.69,2457.81,2443.46,2376.31,2338.21,2422.65,2380.72,2419.19,2445.42,2373.4,2256.51,2297.86,2420.31,2422.83,2299.41,2248.58,2248.58,2155.57,2004.72,2101.1,2124.97,2283.87,2267.97,2308.7,2202.17,2199.54,2111.09,2163.1,2253.8,2199.57,2086.88,2010.84,2104.04,2204.63,2286.94,2375.6,2416.98,2608.05,2621.51,2660.37,2651.76,2864.82,2885.1,2870.46,2827.46,2845.8,3005.48,2863.3,2743.91,2774.09,2690.73,2560.69,2589.6,2682.54,2584.49,2584.49,2635.1,2697.71,2564.02,2646.88,2637.1,2618.65,2299.59,2312.95,2302.45,2284.74,2369.18,2385.73,2499.53,2291.35,2271.33,2065.25,2099.18,1925.9,1910.16,2019.29,1900.63,1998.35,1862.43,1861.41,1741.97,1770.83,1648.19,1728.59,1856.97,1993.15,1993.15,1989.56,1942.62,2033.48,1846.01,1875.63,1880.41,1903.86,1886.86,1828.01,1698.18,1738.74,1834.07,1677.42,1706.23,1706.23,1865.84,1858.36,1850.36,1934.09,1927.9,1831.42,1798.57,1766.95,1788.91,1788.91,1834.59,1824.1,1924.93,1973.89,1844.64,1834.62,1865.87,1875.89,1889.69,1893.47,1932.7,1948.21,2138.75,2142.97,2112.98,2037.63,2163.26,2211.11,2339.03,2340.02,2366.08,2419.68,2429.42,2268.34,2286.08,2230.27,2317.04,2256.22,2361.7,2434.82,2413.12,2392.92,2384.05,2335.22,2282.06,2333.54,2338.61,2330.53,2267.71,2241.97,2185.93,2169.47,2181.68,2126.97,2126.97,2160.11,2233.15,2276.92,2358.94,2396.25,2299.51,2382.01,2390.98,2387.83,2432.86,2430.18,2367.76,2271.65,2167.27,2172.62,2227.17,2265.51,2111.22,2087.92,1908.06,1963.48,1895.54,1874.45,1755.9,1755.04,1704.19,1710.01,1745.28,1613.59,1726.62,1733.23,1747.8,1631.61,1687.97,1662.86,1750.79,1768.26,1771.8,1798.8,1791.09,1793.29,1692.22,1694.82,1633.11,1551.32,1505.82,1397.91,1501.26,1542.58,1503.07,1530.38,1471.35,1441.83,1418.37,1321.39,1337.45,1442.07,1442.07,1439.39,1439.86,1423.41,1532.59,1532.59,1533.85,1436.16,1415.46,1369.96,1365.24,1409.4,1321,1266.92,1234.26,1241.11,1182.54,1179.71,1084.7,1082.89,986.7,969.38,969.38,858.78,887.2,958.91,969.62,969.62,850.91,894.52,868.55,889.96,942.77,935.53,969.93,972.61,963.48,963.48,1035.03,1013.7,1001.02,1050.22,1131.53,1132.64,1136.89,1261.57,1400.35,1311.87,1363.51,1427.98,1481.97,1495.43,1533.06,1549.2,1584.46,1631.93,1549.83,1532.12,1647.12,1686.4,1590.37,1639.72,1639.72,1553.61,1581.08,1590.6,1549.75,1634.37,1619.25,1596.11,1502.68,1556.91,1525.58,1477.57,1432.62,1361.15,1365.24,1373.43,1442.54,1420.42,1449.39,1417.9,1442.46,1555.26,1504.64,1513.07,1498.82,1509.84,1489.22,1526.13,1537.15,1633.03,1533.14,1515.9,1460.33,1456.71,1456.71,1452.38,1470.32,1421.13,1463.32,1456.23,1472.29,1450.8,1421.52,1282.98,1299.43,1279.52,1264.72,1210.25,1260.94,1293.37,1273.85,1261.89,1264.25,1268.89,1338.63,1352.25,1331.47,1326.67,1354.53,1322.26,1309.43,1310.77,1368.55,1392.4,1417.98,1486.7,1462.3,1439.7,1452.06,1520.54,1520.54,1583.44,1605.24,1633.5,1684.27,1712.93,1742.05,1767.71,1848.71,1923.8,1966.55,2036.45,2021.33,2014.33,2050.85,2050.85,2160.34,2042.35,2082.89,2019.84,1897.43,1969.54,2017,2026.92,2060.53,2202.61,2202.61,2223.55,2176.79,2160.19,2122.24,2123.66,2140.98,2187.5,2214.89,2285.74,2309.04,2292.66,2069.43,2046.76,2117.92,2088.16,2080.84,2012.83,2097.29,2105.08,2055.02,2000.24,2041.25,1998.27,1979.3,1965.52,1906.41,1931.2,1910.03,1887.28,1833.75,1775.82,1725.6,1696.24,1820.53,1835.56,1864.45,1810.77,1878.07,1879.88,2024.4,2022.2,2031.49,1928.61,1928.61,2018.97,1983,1979.61,1956.08,2153.49,2105.48,2135.55,2172.86,2159.87,2088.16,2097.76,2066.99,2012.75,1927.58,1944.19,1921.6,1893.1,1939.39,1969.62,1980.48,1940.57,2055.73,2046.99,2050.77,2044,2075.09,2070.14,2037.7,1976.7,1998.74,2006.06,1910.26,1732.6,1668.69,1669.4,1704.35,1672.07,1619.65,1631.77,1553.53,1580.92,1618.86,1720.01,1731.42,1725.99,1748.9,1748.35,1652.87,1689.63,1760.94,1868.78,1911.52,1838.71,1844.3,1854.53,1898.61,1843.59,1843.59,1853.35,1858.31,1942.07,1921.76,1889.8,1879.96,1854.38,1879.09,1884.21,1909.95,1919.4,1887.12,1865.63,1883.58,1976.15,1995.43,1984.26,2024.72,1945.37,2003.31,1987.88,1987.88,2019.91,2057.93,1992.92,1955.92,1955.45,1876.97,1872.87,1869.41,1892.71,1849.5,1841.47,1788.57,1723,1723,1731.03,1696.71,1667.82,1670.26,1643.58,1646.25,1635.94,1437.58,1442.46,1502.91,1508.11,1474.26,1486.62,1479.14,1425.22,1457.02,1476.54,1492.13,1523.69,1480.87,1448.52,1485.44,1577.85,1573.91,1573.91,1525.19,1533.14,1553.92,1511.1,1569.58,1572.18,1590.37,1589.11,1595.09,1480.95,1422.7,1389.64,1406.25,1380.2,1399.32,1397.51,1334.07,1279.12,1287.55,1368.07,1348.55,1382.71,1360.36,1344.69,1358.86,1398.54,1415.54,1383.74,1383.74,1379.25,1311.63,1325.41,1346.9,1298.02,1361.62,1392.32,1352.02,1374.37,1346.43,1271.1,1236.7,1223.63,1180.18,1157.51,1118.15,1138.85,1276.21,1339.58,1324.7,1527.47,1442.7,1416.8,1416.96,1426.24,1454.34,1399.64,1375.31,1353.67,1326.12,1353.04,1397.59,1369.57,1376.26,1396.88,1377.13,1468.83,1417.74,1367.6,1410.89,1410.89,1391.29,1386.89,1407.35,1401.76,1387.67,1375.71,1377.52,1400.66,1397.04,1367.99,1343.36,1395.54,1436.32,1401.21,1475.44,1455.13,1455.13,1429.23,1440.57,1437.19,1474.73,1545.73,1554,1557.62,1651.92,1820.37,1939.47,1939.47,1979.85,1991.03,2064.94,2072.26,1897.28,1953.95,1988.66,2019.52,1956.08,1961.82,1882.87,1979.77,1939.39,1700.17,1733.71,1730.16,1826.98,1752.36,1826.75,1707.02,1634.68,1565.49,1579.35,1509.45,1565.18,1574.31,1554.55,1635.94,1585.17,1685.61,1701.2,1753.15,1740.4,1757.48,1658.22,1734.26,1678.29,1646.8,1619.57,1623.74,1685.37,1685.37,1657.75,1727.09,1811.79,1658.77,1702.38,1780.31,1795.73,1808.96,1812.74,1785.11,1793.69,1788.41,1920.03,1875.39,1967.88,2001.5,2023.14,2001.1,2050.22,2059.43,2031.01,1960.17,1894.36,1968.51,1895.7,1924.59,1897.43,1879.49,1714.42,1725.13,1728.35,1742.21,1738.74,1737.25,1722.69,1715.76,1681.75,2050.38,2118.94,2066.36,2042.82,2027.31,1966.7,1959.86,1911.52,1979.22,2271.17,2337.14,2528.49,2755.04,2585.72,2599.5,2449.46,2524.56,2666.4,2723.55,2692.3,2673.49,2775.19,2665.22,2662.39,2620.36,2620.36,2716.94,2810.85,2766.22,2817.46,2908.45,3063.76,3068.25,3156.41,3343.59,3291.09,3433.8,3644.68,3777.24,3464.5,3433.33,3314.39,3389.48,3638.85,3638.85,3574.7,3397.83,3285.66,3178.84,2985.52,3230.79,3235.59,3104.22,3108.78,3108.78,3107.21,3174.67,3119.96,3370.75,3257.4,3357.21,3357.21,3338.08,3267.55,3246.06,3200.41,3126.18,3133.58,3062.81,3150.82,3184.82,3020.15,3087.3,2976.78,2946.47,2846.5,2760.78,2585.8,2648.85,2801.79,2801.01,2801.01,2787.39,2838.16,2789.67,2659,2601.78,2383.5,2289.04,2219.38,2306.2,2240.63,2141.37,2196.95,2073.76,2067.62,1748.66,1815.02,1952.85,1894.52,1967.73,1873.5,1773.54,1856.58,1859.73,1957.73,2191.36,2268.1,2141.53,2149.95,2074.54,2039.99,2113.19,2225.76,2103.9,1884.68,1836.35,1746.38,2142.63,1986.78,1986.07,1986.38,2000.24,1901.37,1899.95,1899.95,1790.77,1873.19,1973.71,2042.74,2242.99,2250.31,2298.72,2221.03,2208.12,2260.78,2206.08,2167.43,2174.28,2241.97,2347.76,2506.14,2629.64,2736.78,2698.52,2754.88,2692.77,2706.39,2633.97,2684.51,2671.13,2671.13,2856.5,2809.35,2821.39,2727.17,2697.5,2709.93,2613.74,2241.03,2323.21,2429,2566.83,2569.51,2511.89,2560.69,2590.76,2490.16,2535.03,2535.03,2535.89,2744.65,2680.02,2578.32,2564.39,2547.47,2500.47,2367.05,2484.65,2482.29,2482.29,2313.76,2344.22,2329.03,2439.15,2467.81,2494.49,2446.32,2532.04,2514.25,2594.85,2585.72,2614.22,2617.76,2403.18,2487.88,2562.89,2528.34,2511.33,2426.56,2382.16,2434.35,2430.1,2518.18,2536.76,2594.85,2668.69,2682.93,2671.44,2641.53,2602.01,2638.22,2592.18,2549.59,2519.76,2676.4,2728.27,2768.18,2751.89,2723.39,2628.07,2628.07,2592.57,2629.8,2664.75,2761.65,2726.7,2731.19,2737.64,2903.1,3116.66,3227.64,3318.8,3352.17,3281.25,3353.83,3417.9,3352.09,3485.44,3332.73,3466.62,3488.74,3500.63,3616.66,3431.99,3383.42,3567.77,3409.08,3453.16,3428.37,3254.8,3431.2,3378.78,3425.3,3374.92,3458.04,3521.96,3483.94,3455.37,3534.16,3414.04,3561.24,3625.24,3632.79,3464.26,3593.83,3686.79,3497.01,3637.2,3510,3380.98,3504.64,3460.48,3389.48,3164.28,3182.86,3218.83,3158.45,3180.02,3111.07,3078.48,3288.57,3301.32,3357.84,3357.84,3386.1,3385.86,3378.78,3516.53,3577.85,3581.55,3460.17,3504.17,3553.61,3517.71,3612.72,3741.42,3856.11,3678.05,3804.86,3787.78,3847.06,3822.1,3820.84,3820.84,3740.48,3618.07,3577.06,3539.99,3448.28,3555.34,3408.06,3395.86,3430.42,3502.91,3534,3520.15,3457.18,3452.22,3443.8,3443.8,3300.14,3396.1,3537.15,3534.79,3425.69,3391.84,3396.25,3278.97,3387.99,3320.29,3321.47,3195.92,3126.65,3236.07,3284.95,3347.06,3371.14,3282.98,3285.89,3285.89,3232.29,3237.72,3240.79,3241.66,3147.28,3222.45,3285.58,3216.15,3168.37,3174.75,3089.03,3195.37,3192.3,3122.87,3138.22,3142.63,3210.17,3109.34,3079.35,3113.66,3142.87,3091.78,2993.55,2896.41,2997.87,3015.03,3038.02,2929.08,2848.16,2796.6,2926.24,3001.1,2838.4,2838.4,2777.24,2728.67,2701.9,2720.56,2746.77,2774.09,2866.81,3085.25,3061.24,3153.49,3089.58,3041.72,3050.3,2941.75,2962.06,2980.71,2959.85,2934.51,3004.01,3076.35,3089.66,3064.94,3138.62,3241.42,3371.77,3502.83,3411.92,3504.96,3489.45,3323.68,3227.25,3180.97,3284.48,3289.12,3353.35,3353.35,3413.02,3466.31,3480.01,3430.34,3273.61,3335.48,3335.17,3293.84,3077.77,3219.06,3122.48,3003.7,3141.92,3199.23,3236.38,3185.3,3120.12,3152.47,3152.47,3188.37,3003.86,2956,2952.77,2988.9,3241.81,3310.77,3347.76,3097.06,3097.06,3304.23,3171.44,3101.86,3200.17,3209.7,3107.37,3118.55,3105.01,3078.24,2997.8,2909.08,2982.76,2944.03,2516.45,2464.03,2434.04,2420.03,2348.24,2431.12,2449.7,2535.26,2576.75,2531.09,2515.19,2586.43,2604.53,2619.73,2578.01,2676.01,2694.19,2670.81,2651.68,2763.85,2716.7,2856.27,2746.77,2757.01,2722.13,2792.9,2745.2,2896.33,2802.98,2810.22,2962.61,2787.15,2787.15,2897.98,2895.23,2861.78,2876.57,2825.65,2806.83,2818.64,2882.56,2867.36,2954.19,2982.53,2992.13,2974.97,2929.08,2813.68,2777.39,2792.9,2787.39,2917.11,2981.19,2996.54,2973.95,2951.83,3012.44,2975.68,2953.64,2890.11,2852.96,2792.19,2897.2,2941.67,3042.11,2948.52,2929.94,3082.65,3207.34,3181.83,3174.59,3147.12,3178.68,3136.81],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1957.16,1960.95,1961.89,1893.89,1783.79,1921.37,1835.05,1835.05,1792.63,1784.53,1745.89,1760.32,1824.32,1816.42,1835.16,1855.16,1869.89,1927.26,1947.26,2018.84,2027.26,1996.53,1973.47,1968.11,1968.95,2000.42,1986.84,1993.68,2021.79,2043.37,2092.42,2200.53,2200,2196.53,2115.47,2110.53,1958.21,2043.68,2027.37,2123.37,2065.16,2071.05,2093.05,2091.89,2071.68,2067.58,1938,1877.26,1846.32]},"symbols":{"AMD":"AMD","EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","어플라이드 머티어리얼즈":"AMAT","테슬라":"TSLA","팔란티어 테크":"PLTR"},"missing":[]}
};
