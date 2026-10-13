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
  "updatedAt": "2026-10-13T23:41:56.375Z",
  "checkedAt": "2026-10-13T23:41:56.375Z",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
      "status": "청약 마지막날",
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
  "history": {"updatedAt":"2026-10-13T23:41:58.388Z","range":"10y","source":"Yahoo Finance (일별 종가)","dates":[20161013,20161014,20161017,20161018,20161019,20161020,20161021,20161024,20161025,20161026,20161027,20161028,20161031,20161101,20161102,20161103,20161104,20161107,20161108,20161109,20161110,20161111,20161114,20161115,20161116,20161117,20161118,20161121,20161122,20161123,20161124,20161125,20161128,20161129,20161130,20161201,20161202,20161205,20161206,20161207,20161208,20161209,20161212,20161213,20161214,20161215,20161216,20161219,20161220,20161221,20161222,20161223,20161226,20161227,20161228,20161229,20161230,20170102,20170103,20170104,20170105,20170106,20170109,20170110,20170111,20170112,20170113,20170116,20170117,20170118,20170119,20170120,20170123,20170124,20170125,20170126,20170127,20170130,20170131,20170201,20170202,20170203,20170206,20170207,20170208,20170209,20170210,20170213,20170214,20170215,20170216,20170217,20170220,20170221,20170222,20170223,20170224,20170227,20170228,20170301,20170302,20170303,20170306,20170307,20170308,20170309,20170310,20170313,20170314,20170315,20170316,20170317,20170320,20170321,20170322,20170323,20170324,20170327,20170328,20170329,20170330,20170331,20170403,20170404,20170405,20170406,20170407,20170410,20170411,20170412,20170413,20170414,20170417,20170418,20170419,20170420,20170421,20170424,20170425,20170426,20170427,20170428,20170501,20170502,20170503,20170504,20170505,20170508,20170509,20170510,20170511,20170512,20170515,20170516,20170517,20170518,20170519,20170522,20170523,20170524,20170525,20170526,20170529,20170530,20170531,20170601,20170602,20170605,20170606,20170607,20170608,20170609,20170612,20170613,20170614,20170615,20170616,20170619,20170620,20170621,20170622,20170623,20170626,20170627,20170628,20170629,20170630,20170703,20170704,20170705,20170706,20170707,20170710,20170711,20170712,20170713,20170714,20170717,20170718,20170719,20170720,20170721,20170724,20170725,20170726,20170727,20170728,20170731,20170801,20170802,20170803,20170804,20170807,20170808,20170809,20170810,20170811,20170814,20170815,20170816,20170817,20170818,20170821,20170822,20170823,20170824,20170825,20170828,20170829,20170830,20170831,20170901,20170904,20170905,20170906,20170907,20170908,20170911,20170912,20170913,20170914,20170915,20170918,20170919,20170920,20170921,20170922,20170925,20170926,20170927,20170928,20170929,20171002,20171003,20171004,20171005,20171006,20171009,20171010,20171011,20171012,20171013,20171016,20171017,20171018,20171019,20171020,20171023,20171024,20171025,20171026,20171027,20171030,20171031,20171101,20171102,20171103,20171106,20171107,20171108,20171109,20171110,20171113,20171114,20171115,20171116,20171117,20171120,20171121,20171122,20171123,20171124,20171127,20171128,20171129,20171130,20171201,20171204,20171205,20171206,20171207,20171208,20171211,20171212,20171213,20171214,20171215,20171218,20171219,20171220,20171221,20171222,20171225,20171226,20171227,20171228,20171229,20180102,20180103,20180104,20180105,20180108,20180109,20180110,20180111,20180112,20180115,20180116,20180117,20180118,20180119,20180122,20180123,20180124,20180125,20180126,20180129,20180130,20180131,20180201,20180202,20180205,20180206,20180207,20180208,20180209,20180212,20180213,20180214,20180215,20180216,20180219,20180220,20180221,20180222,20180223,20180226,20180227,20180228,20180301,20180302,20180305,20180306,20180307,20180308,20180309,20180312,20180313,20180314,20180315,20180316,20180319,20180320,20180321,20180322,20180323,20180326,20180327,20180328,20180329,20180330,20180402,20180403,20180404,20180405,20180406,20180409,20180410,20180411,20180412,20180413,20180416,20180417,20180418,20180419,20180420,20180423,20180424,20180425,20180426,20180427,20180430,20180501,20180502,20180503,20180504,20180507,20180508,20180509,20180510,20180511,20180514,20180515,20180516,20180517,20180518,20180521,20180522,20180523,20180524,20180525,20180528,20180529,20180530,20180531,20180601,20180604,20180605,20180606,20180607,20180608,20180611,20180612,20180613,20180614,20180615,20180618,20180619,20180620,20180621,20180622,20180625,20180626,20180627,20180628,20180629,20180702,20180703,20180704,20180705,20180706,20180709,20180710,20180711,20180712,20180713,20180716,20180717,20180718,20180719,20180720,20180723,20180724,20180725,20180726,20180727,20180730,20180731,20180801,20180802,20180803,20180806,20180807,20180808,20180809,20180810,20180813,20180814,20180815,20180816,20180817,20180820,20180821,20180822,20180823,20180824,20180827,20180828,20180829,20180830,20180831,20180903,20180904,20180905,20180906,20180907,20180910,20180911,20180912,20180913,20180914,20180917,20180918,20180919,20180920,20180921,20180924,20180925,20180926,20180927,20180928,20181001,20181002,20181003,20181004,20181005,20181008,20181009,20181010,20181011,20181012,20181015,20181016,20181017,20181018,20181019,20181022,20181023,20181024,20181025,20181026,20181029,20181030,20181031,20181101,20181102,20181105,20181106,20181107,20181108,20181109,20181112,20181113,20181114,20181115,20181116,20181119,20181120,20181121,20181122,20181123,20181126,20181127,20181128,20181129,20181130,20181203,20181204,20181205,20181206,20181207,20181210,20181211,20181212,20181213,20181214,20181217,20181218,20181219,20181220,20181221,20181224,20181225,20181226,20181227,20181228,20181231,20190102,20190103,20190104,20190107,20190108,20190109,20190110,20190111,20190114,20190115,20190116,20190117,20190118,20190121,20190122,20190123,20190124,20190125,20190128,20190129,20190130,20190131,20190201,20190204,20190205,20190206,20190207,20190208,20190211,20190212,20190213,20190214,20190215,20190218,20190219,20190220,20190221,20190222,20190225,20190226,20190227,20190228,20190301,20190304,20190305,20190306,20190307,20190308,20190311,20190312,20190313,20190314,20190315,20190318,20190319,20190320,20190321,20190322,20190325,20190326,20190327,20190328,20190329,20190401,20190402,20190403,20190404,20190405,20190408,20190409,20190410,20190411,20190412,20190415,20190416,20190417,20190418,20190419,20190422,20190423,20190424,20190425,20190426,20190429,20190430,20190501,20190502,20190503,20190506,20190507,20190508,20190509,20190510,20190513,20190514,20190515,20190516,20190517,20190520,20190521,20190522,20190523,20190524,20190527,20190528,20190529,20190530,20190531,20190603,20190604,20190605,20190606,20190607,20190610,20190611,20190612,20190613,20190614,20190617,20190618,20190619,20190620,20190621,20190624,20190625,20190626,20190627,20190628,20190701,20190702,20190703,20190704,20190705,20190708,20190709,20190710,20190711,20190712,20190715,20190716,20190717,20190718,20190719,20190722,20190723,20190724,20190725,20190726,20190729,20190730,20190731,20190801,20190802,20190805,20190806,20190807,20190808,20190809,20190812,20190813,20190814,20190815,20190816,20190819,20190820,20190821,20190822,20190823,20190826,20190827,20190828,20190829,20190830,20190902,20190903,20190904,20190905,20190906,20190909,20190910,20190911,20190912,20190913,20190916,20190917,20190918,20190919,20190920,20190923,20190924,20190925,20190926,20190927,20190930,20191001,20191002,20191003,20191004,20191007,20191008,20191009,20191010,20191011,20191014,20191015,20191016,20191017,20191018,20191021,20191022,20191023,20191024,20191025,20191028,20191029,20191030,20191031,20191101,20191104,20191105,20191106,20191107,20191108,20191111,20191112,20191113,20191114,20191115,20191118,20191119,20191120,20191121,20191122,20191125,20191126,20191127,20191128,20191129,20191202,20191203,20191204,20191205,20191206,20191209,20191210,20191211,20191212,20191213,20191216,20191217,20191218,20191219,20191220,20191223,20191224,20191225,20191226,20191227,20191230,20191231,20200102,20200103,20200106,20200107,20200108,20200109,20200110,20200113,20200114,20200115,20200116,20200117,20200120,20200121,20200122,20200123,20200124,20200127,20200128,20200129,20200130,20200131,20200203,20200204,20200205,20200206,20200207,20200210,20200211,20200212,20200213,20200214,20200217,20200218,20200219,20200220,20200221,20200224,20200225,20200226,20200227,20200228,20200302,20200303,20200304,20200305,20200306,20200309,20200310,20200311,20200312,20200313,20200316,20200317,20200318,20200319,20200320,20200323,20200324,20200325,20200326,20200327,20200330,20200331,20200401,20200402,20200403,20200406,20200407,20200408,20200409,20200410,20200413,20200414,20200415,20200416,20200417,20200420,20200421,20200422,20200423,20200424,20200427,20200428,20200429,20200430,20200501,20200504,20200505,20200506,20200507,20200508,20200511,20200512,20200513,20200514,20200515,20200518,20200519,20200520,20200521,20200522,20200525,20200526,20200527,20200528,20200529,20200601,20200602,20200603,20200604,20200605,20200608,20200609,20200610,20200611,20200612,20200615,20200616,20200617,20200618,20200619,20200622,20200623,20200624,20200625,20200626,20200629,20200630,20200701,20200702,20200703,20200706,20200707,20200708,20200709,20200710,20200713,20200714,20200715,20200716,20200717,20200720,20200721,20200722,20200723,20200724,20200727,20200728,20200729,20200730,20200731,20200803,20200804,20200805,20200806,20200807,20200810,20200811,20200812,20200813,20200814,20200817,20200818,20200819,20200820,20200821,20200824,20200825,20200826,20200827,20200828,20200831,20200901,20200902,20200903,20200904,20200907,20200908,20200909,20200910,20200911,20200914,20200915,20200916,20200917,20200918,20200921,20200922,20200923,20200924,20200925,20200928,20200929,20200930,20201001,20201002,20201005,20201006,20201007,20201008,20201009,20201012,20201013,20201014,20201015,20201016,20201019,20201020,20201021,20201022,20201023,20201026,20201027,20201028,20201029,20201030,20201102,20201103,20201104,20201105,20201106,20201109,20201110,20201111,20201112,20201113,20201116,20201117,20201118,20201119,20201120,20201123,20201124,20201125,20201126,20201127,20201130,20201201,20201202,20201203,20201204,20201207,20201208,20201209,20201210,20201211,20201214,20201215,20201216,20201217,20201218,20201221,20201222,20201223,20201224,20201225,20201228,20201229,20201230,20201231,20210104,20210105,20210106,20210107,20210108,20210111,20210112,20210113,20210114,20210115,20210118,20210119,20210120,20210121,20210122,20210125,20210126,20210127,20210128,20210129,20210201,20210202,20210203,20210204,20210205,20210208,20210209,20210210,20210211,20210212,20210215,20210216,20210217,20210218,20210219,20210222,20210223,20210224,20210225,20210226,20210301,20210302,20210303,20210304,20210305,20210308,20210309,20210310,20210311,20210312,20210315,20210316,20210317,20210318,20210319,20210322,20210323,20210324,20210325,20210326,20210329,20210330,20210331,20210401,20210402,20210405,20210406,20210407,20210408,20210409,20210412,20210413,20210414,20210415,20210416,20210419,20210420,20210421,20210422,20210423,20210426,20210427,20210428,20210429,20210430,20210503,20210504,20210505,20210506,20210507,20210510,20210511,20210512,20210513,20210514,20210517,20210518,20210519,20210520,20210521,20210524,20210525,20210526,20210527,20210528,20210531,20210601,20210602,20210603,20210604,20210607,20210608,20210609,20210610,20210611,20210614,20210615,20210616,20210617,20210618,20210621,20210622,20210623,20210624,20210625,20210628,20210629,20210630,20210701,20210702,20210705,20210706,20210707,20210708,20210709,20210712,20210713,20210714,20210715,20210716,20210719,20210720,20210721,20210722,20210723,20210726,20210727,20210728,20210729,20210730,20210802,20210803,20210804,20210805,20210806,20210809,20210810,20210811,20210812,20210813,20210816,20210817,20210818,20210819,20210820,20210823,20210824,20210825,20210826,20210827,20210830,20210831,20210901,20210902,20210903,20210906,20210907,20210908,20210909,20210910,20210913,20210914,20210915,20210916,20210917,20210920,20210921,20210922,20210923,20210924,20210927,20210928,20210929,20210930,20211001,20211004,20211005,20211006,20211007,20211008,20211011,20211012,20211013,20211014,20211015,20211018,20211019,20211020,20211021,20211022,20211025,20211026,20211027,20211028,20211029,20211101,20211102,20211103,20211104,20211105,20211108,20211109,20211110,20211111,20211112,20211115,20211116,20211117,20211118,20211119,20211122,20211123,20211124,20211125,20211126,20211129,20211130,20211201,20211202,20211203,20211206,20211207,20211208,20211209,20211210,20211213,20211214,20211215,20211216,20211217,20211220,20211221,20211222,20211223,20211224,20211227,20211228,20211229,20211230,20211231,20220103,20220104,20220105,20220106,20220107,20220110,20220111,20220112,20220113,20220114,20220117,20220118,20220119,20220120,20220121,20220124,20220125,20220126,20220127,20220128,20220131,20220201,20220202,20220203,20220204,20220207,20220208,20220209,20220210,20220211,20220214,20220215,20220216,20220217,20220218,20220221,20220222,20220223,20220224,20220225,20220228,20220301,20220302,20220303,20220304,20220307,20220308,20220309,20220310,20220311,20220314,20220315,20220316,20220317,20220318,20220321,20220322,20220323,20220324,20220325,20220328,20220329,20220330,20220331,20220401,20220404,20220405,20220406,20220407,20220408,20220411,20220412,20220413,20220414,20220415,20220418,20220419,20220420,20220421,20220422,20220425,20220426,20220427,20220428,20220429,20220502,20220503,20220504,20220505,20220506,20220509,20220510,20220511,20220512,20220513,20220516,20220517,20220518,20220519,20220520,20220523,20220524,20220525,20220526,20220527,20220530,20220531,20220601,20220602,20220603,20220606,20220607,20220608,20220609,20220610,20220613,20220614,20220615,20220616,20220617,20220620,20220621,20220622,20220623,20220624,20220627,20220628,20220629,20220630,20220701,20220704,20220705,20220706,20220707,20220708,20220711,20220712,20220713,20220714,20220715,20220718,20220719,20220720,20220721,20220722,20220725,20220726,20220727,20220728,20220729,20220801,20220802,20220803,20220804,20220805,20220808,20220809,20220810,20220811,20220812,20220815,20220816,20220817,20220818,20220819,20220822,20220823,20220824,20220825,20220826,20220829,20220830,20220831,20220901,20220902,20220905,20220906,20220907,20220908,20220909,20220912,20220913,20220914,20220915,20220916,20220919,20220920,20220921,20220922,20220923,20220926,20220927,20220928,20220929,20220930,20221003,20221004,20221005,20221006,20221007,20221010,20221011,20221012,20221013,20221014,20221017,20221018,20221019,20221020,20221021,20221024,20221025,20221026,20221027,20221028,20221031,20221101,20221102,20221103,20221104,20221107,20221108,20221109,20221110,20221111,20221114,20221115,20221116,20221117,20221118,20221121,20221122,20221123,20221124,20221125,20221128,20221129,20221130,20221201,20221202,20221205,20221206,20221207,20221208,20221209,20221212,20221213,20221214,20221215,20221216,20221219,20221220,20221221,20221222,20221223,20221226,20221227,20221228,20221229,20221230,20230102,20230103,20230104,20230105,20230106,20230109,20230110,20230111,20230112,20230113,20230116,20230117,20230118,20230119,20230120,20230123,20230124,20230125,20230126,20230127,20230130,20230131,20230201,20230202,20230203,20230206,20230207,20230208,20230209,20230210,20230213,20230214,20230215,20230216,20230217,20230220,20230221,20230222,20230223,20230224,20230227,20230228,20230301,20230302,20230303,20230306,20230307,20230308,20230309,20230310,20230313,20230314,20230315,20230316,20230317,20230320,20230321,20230322,20230323,20230324,20230327,20230328,20230329,20230330,20230331,20230403,20230404,20230405,20230406,20230407,20230410,20230411,20230412,20230413,20230414,20230417,20230418,20230419,20230420,20230421,20230424,20230425,20230426,20230427,20230428,20230501,20230502,20230503,20230504,20230505,20230508,20230509,20230510,20230511,20230512,20230515,20230516,20230517,20230518,20230519,20230522,20230523,20230524,20230525,20230526,20230529,20230530,20230531,20230601,20230602,20230605,20230606,20230607,20230608,20230609,20230612,20230613,20230614,20230615,20230616,20230619,20230620,20230621,20230622,20230623,20230626,20230627,20230628,20230629,20230630,20230703,20230704,20230705,20230706,20230707,20230710,20230711,20230712,20230713,20230714,20230717,20230718,20230719,20230720,20230721,20230724,20230725,20230726,20230727,20230728,20230731,20230801,20230802,20230803,20230804,20230807,20230808,20230809,20230810,20230811,20230814,20230815,20230816,20230817,20230818,20230821,20230822,20230823,20230824,20230825,20230828,20230829,20230830,20230831,20230901,20230904,20230905,20230906,20230907,20230908,20230911,20230912,20230913,20230914,20230915,20230918,20230919,20230920,20230921,20230922,20230925,20230926,20230927,20230928,20230929,20231002,20231003,20231004,20231005,20231006,20231009,20231010,20231011,20231012,20231013,20231016,20231017,20231018,20231019,20231020,20231023,20231024,20231025,20231026,20231027,20231030,20231031,20231101,20231102,20231103,20231106,20231107,20231108,20231109,20231110,20231113,20231114,20231115,20231116,20231117,20231120,20231121,20231122,20231123,20231124,20231127,20231128,20231129,20231130,20231201,20231204,20231205,20231206,20231207,20231208,20231211,20231212,20231213,20231214,20231215,20231218,20231219,20231220,20231221,20231222,20231225,20231226,20231227,20231228,20231229,20240102,20240103,20240104,20240105,20240108,20240109,20240110,20240111,20240112,20240115,20240116,20240117,20240118,20240119,20240122,20240123,20240124,20240125,20240126,20240129,20240130,20240131,20240201,20240202,20240205,20240206,20240207,20240208,20240209,20240212,20240213,20240214,20240215,20240216,20240219,20240220,20240221,20240222,20240223,20240226,20240227,20240228,20240229,20240301,20240304,20240305,20240306,20240307,20240308,20240311,20240312,20240313,20240314,20240315,20240318,20240319,20240320,20240321,20240322,20240325,20240326,20240327,20240328,20240329,20240401,20240402,20240403,20240404,20240405,20240408,20240409,20240410,20240411,20240412,20240415,20240416,20240417,20240418,20240419,20240422,20240423,20240424,20240425,20240426,20240429,20240430,20240501,20240502,20240503,20240506,20240507,20240508,20240509,20240510,20240513,20240514,20240515,20240516,20240517,20240520,20240521,20240522,20240523,20240524,20240527,20240528,20240529,20240530,20240531,20240603,20240604,20240605,20240606,20240607,20240610,20240611,20240612,20240613,20240614,20240617,20240618,20240619,20240620,20240621,20240624,20240625,20240626,20240627,20240628,20240701,20240702,20240703,20240704,20240705,20240708,20240709,20240710,20240711,20240712,20240715,20240716,20240717,20240718,20240719,20240722,20240723,20240724,20240725,20240726,20240729,20240730,20240731,20240801,20240802,20240805,20240806,20240807,20240808,20240809,20240812,20240813,20240814,20240815,20240816,20240819,20240820,20240821,20240822,20240823,20240826,20240827,20240828,20240829,20240830,20240902,20240903,20240904,20240905,20240906,20240909,20240910,20240911,20240912,20240913,20240916,20240917,20240918,20240919,20240920,20240923,20240924,20240925,20240926,20240927,20240930,20241001,20241002,20241003,20241004,20241007,20241008,20241009,20241010,20241011,20241014,20241015,20241016,20241017,20241018,20241021,20241022,20241023,20241024,20241025,20241028,20241029,20241030,20241031,20241101,20241104,20241105,20241106,20241107,20241108,20241111,20241112,20241113,20241114,20241115,20241118,20241119,20241120,20241121,20241122,20241125,20241126,20241127,20241128,20241129,20241202,20241203,20241204,20241205,20241206,20241209,20241210,20241211,20241212,20241213,20241216,20241217,20241218,20241219,20241220,20241223,20241224,20241225,20241226,20241227,20241230,20241231,20250102,20250103,20250106,20250107,20250108,20250109,20250110,20250113,20250114,20250115,20250116,20250117,20250120,20250121,20250122,20250123,20250124,20250127,20250128,20250129,20250130,20250131,20250203,20250204,20250205,20250206,20250207,20250210,20250211,20250212,20250213,20250214,20250217,20250218,20250219,20250220,20250221,20250224,20250225,20250226,20250227,20250228,20250303,20250304,20250305,20250306,20250307,20250310,20250311,20250312,20250313,20250314,20250317,20250318,20250319,20250320,20250321,20250324,20250325,20250326,20250327,20250328,20250331,20250401,20250402,20250403,20250404,20250407,20250408,20250409,20250410,20250411,20250414,20250415,20250416,20250417,20250418,20250421,20250422,20250423,20250424,20250425,20250428,20250429,20250430,20250501,20250502,20250505,20250506,20250507,20250508,20250509,20250512,20250513,20250514,20250515,20250516,20250519,20250520,20250521,20250522,20250523,20250526,20250527,20250528,20250529,20250530,20250602,20250603,20250604,20250605,20250606,20250609,20250610,20250611,20250612,20250613,20250616,20250617,20250618,20250619,20250620,20250623,20250624,20250625,20250626,20250627,20250630,20250701,20250702,20250703,20250704,20250707,20250708,20250709,20250710,20250711,20250714,20250715,20250716,20250717,20250718,20250721,20250722,20250723,20250724,20250725,20250728,20250729,20250730,20250731,20250801,20250804,20250805,20250806,20250807,20250808,20250811,20250812,20250813,20250814,20250815,20250818,20250819,20250820,20250821,20250822,20250825,20250826,20250827,20250828,20250829,20250901,20250902,20250903,20250904,20250905,20250908,20250909,20250910,20250911,20250912,20250915,20250916,20250917,20250918,20250919,20250922,20250923,20250924,20250925,20250926,20250929,20250930,20251001,20251002,20251003,20251006,20251007,20251008,20251009,20251010,20251013,20251014,20251015,20251016,20251017,20251020,20251021,20251022,20251023,20251024,20251027,20251028,20251029,20251030,20251031,20251103,20251104,20251105,20251106,20251107,20251110,20251111,20251112,20251113,20251114,20251117,20251118,20251119,20251120,20251121,20251124,20251125,20251126,20251127,20251128,20251201,20251202,20251203,20251204,20251205,20251208,20251209,20251210,20251211,20251212,20251215,20251216,20251217,20251218,20251219,20251222,20251223,20251224,20251225,20251226,20251229,20251230,20251231,20260102,20260105,20260106,20260107,20260108,20260109,20260112,20260113,20260114,20260115,20260116,20260119,20260120,20260121,20260122,20260123,20260126,20260127,20260128,20260129,20260130,20260202,20260203,20260204,20260205,20260206,20260209,20260210,20260211,20260212,20260213,20260216,20260217,20260218,20260219,20260220,20260223,20260224,20260225,20260226,20260227,20260302,20260303,20260304,20260305,20260306,20260309,20260310,20260311,20260312,20260313,20260316,20260317,20260318,20260319,20260320,20260323,20260324,20260325,20260326,20260327,20260330,20260331,20260401,20260402,20260403,20260406,20260407,20260408,20260409,20260410,20260413,20260414,20260415,20260416,20260417,20260420,20260421,20260422,20260423,20260424,20260427,20260428,20260429,20260430,20260501,20260504,20260505,20260506,20260507,20260508,20260511,20260512,20260513,20260514,20260515,20260518,20260519,20260520,20260521,20260522,20260525,20260526,20260527,20260528,20260529,20260601,20260602,20260603,20260604,20260605,20260608,20260609,20260610,20260611,20260612,20260615,20260616,20260617,20260618,20260619,20260622,20260623,20260624,20260625,20260626,20260629,20260630,20260701,20260702,20260703,20260706,20260707,20260708,20260709,20260710,20260713,20260714,20260715,20260716,20260717,20260720,20260721,20260722,20260723,20260724,20260727,20260728,20260729,20260730,20260731,20260803,20260804,20260805,20260806,20260807,20260810,20260811,20260812,20260813,20260814,20260817,20260818,20260819,20260820,20260821,20260824,20260825,20260826,20260827,20260828,20260831,20260901,20260902,20260903,20260904,20260907,20260908,20260909,20260910,20260911,20260914,20260915,20260916,20260917,20260918,20260921,20260922,20260923,20260924,20260925,20260928,20260929,20260930,20261001,20261002,20261005,20261006,20261007,20261008,20261009,20261012,20261013],"series":{"AMD":[null,100,98.81,99.7,100.3,103.11,96.59,103.85,111.11,108,105.33,106.67,107.11,105.04,100.15,99.26,97.19,103.11,103.7,102.81,93.33,99.11,100.59,103.26,113.63,125.33,129.04,132.44,128.74,130.37,130.37,129.93,130.81,132.3,132,124.3,126.37,128.59,140,141.63,153.19,153.19,158.22,156.15,156.3,160.89,157.93,162.22,170.52,169.93,171.85,171.56,171.56,178.81,171.11,171.7,168,168,169.33,169.33,166.52,167.7,170.22,169.48,165.93,159.41,156.74,156.74,145.48,146.37,144.74,144.44,146.81,154.67,153.33,155.85,158.07,157.19,153.63,178.67,181.93,181.33,201.93,196.89,200.89,198.81,201.19,199.85,196.44,197.04,192.15,194.52,194.52,207.41,211.56,212.15,209.19,225.19,214.22,221.63,205.93,193.04,193.19,193.33,195.85,197.48,206.07,211.56,208.89,207.11,202.22,199.85,213.33,204.74,208.89,204.3,202.96,202.96,202.81,203.11,208.15,215.56,216.89,209.78,209.93,196.59,200.3,194.07,194.07,189.04,182.37,182.37,189.48,191.85,190.22,194.22,192.59,194.52,199.85,198.67,201.78,197.04,201.78,152.89,153.93,149.63,150.96,148.74,150.81,159.85,164,166.81,169.19,188.89,165.93,167.11,169.04,163.56,161.33,161.33,162.67,162.96,162.96,164.74,165.78,161.93,161.48,166.52,178.22,183.41,191.11,181.93,179.11,177.19,174.37,170.37,169.48,176.74,187.26,207.11,213.04,209.93,208.59,198.52,196,186.67,184.89,180,180,195.41,192.89,197.93,204.59,205.78,211.7,200.44,206.22,204.44,199.7,200.74,204.44,205.63,209.78,209.04,218.67,209.19,206.67,201.63,203.11,198.07,196.15,194.37,198.96,194.22,190.07,179.56,181.19,189.04,192.89,187.11,182.81,183.26,178.52,180.3,184.89,185.19,184.15,181.19,180,187.7,192.59,195.41,195.41,191.41,190.52,187.11,181.48,185.93,182.22,181.04,181.63,185.48,193.78,194.37,203.56,198.67,197.04,186.81,184.44,188.74,188.74,188.89,188.3,198.81,197.19,197.63,196,199.56,202.96,205.63,210.37,210.67,211.26,209.78,208.44,206.67,204.59,208.89,211.11,182.67,177.93,175.41,161.33,162.81,160,160.74,164.74,176.74,178.52,173.48,164.74,166.81,164.3,164.74,164,166.67,168.59,168,168.89,168.44,168.44,168.59,171.11,165.48,160.44,161.33,158.96,148.59,146.81,148.15,148.74,147.26,150.52,146.67,149.78,150.07,152.44,162.67,162.22,162.67,161.33,156.15,156.15,154.96,156,156.3,152.3,162.67,171.11,179.56,176,181.93,175.11,177.19,179.85,178.07,178.07,176.44,180.44,184.74,186.52,187.41,191.7,188.3,183.85,191.85,197.33,190.67,203.56,196.3,184.44,171.41,172.59,171.85,166.22,167.56,173.04,174.52,180.74,180.59,175.11,175.11,178.07,173.63,175.41,178.81,184,185.63,179.41,176.3,174.96,176.44,174.22,181.33,177.33,173.33,170.67,172.44,168.3,169.78,169.93,169.33,164.59,166.81,161.63,157.48,154.67,148.15,145.33,148.89,148.89,141.19,141.48,144.74,148.44,142.37,141.19,147.85,145.48,149.33,147.11,149.48,155.85,153.48,149.78,148,148.74,149.48,143.85,163.56,164.59,161.19,164.89,162.52,161.93,167.11,171.7,172,177.04,179.7,177.04,181.19,184.44,189.93,189.93,192.59,192.44,192.3,194.07,198.67,200.59,200.59,197.93,204.74,203.41,213.33,220,220,232.15,220.59,225.93,233.04,234.81,241.78,240.74,242.07,253.48,247.26,244.74,231.85,234.07,223.85,229.63,221.78,226.81,222.07,224.59,222.22,222.22,229.63,242.37,246.07,245.19,241.04,245.33,241.04,245.63,249.93,249.63,247.56,244.44,246.81,239.85,237.78,271.85,280.59,287.7,271.56,273.78,278.37,273.93,287.85,289.78,290.07,282.96,282.37,292.3,296.59,291.85,286.37,292.89,296,302.22,309.63,330.22,355.26,374.22,371.11,373.33,368.74,372.89,372.89,415.7,422.37,412.44,405.63,442.81,445.93,477.19,451.56,484.74,480.44,473.04,462.37,461.93,459.56,483.11,482.52,476.89,482.81,457.63,465.48,429.93,421.19,411.56,405.19,392,403.56,370.37,374.81,390.22,389.04,417.48,404.44,394.37,350.52,370.81,371.7,337.63,285.48,261.19,249.63,254.81,269.78,299.56,299.7,294.81,306.37,323.56,314.07,311.56,281.93,290.52,308.3,318.37,306.07,283.11,284.59,277.48,277.48,287.11,297.48,311.85,316.15,317.48,315.56,351.26,312.89,312.89,315.56,288.3,296.15,296,303.41,294.22,294.81,278.96,288.89,269.04,265.78,250.81,246.67,246.67,265.19,259.11,264,273.48,278.96,252.59,281.48,304.74,307.41,299.11,292.44,300.3,299.7,301.93,292.3,300,307.7,307.7,292.74,293.33,308.89,324.89,298.96,285.19,342.07,361.63,363.11,357.48,345.33,344.59,335.85,341.48,340.15,338.07,338.52,342.67,350.81,350.81,354.81,354.81,354.37,360.89,366.07,358.67,347.85,348.59,350.81,346.22,348.15,332,327.11,326.07,340.15,348,346.37,338.07,345.04,344.44,385.19,380.74,413.19,390.67,384.74,380.59,368.74,371.26,378.07,390.52,396.3,429.93,430.96,429.33,422.67,403.56,412.3,411.7,412.59,404.89,413.78,407.26,410.07,410.07,417.48,414.37,421.63,409.78,413.04,410.22,409.33,397.19,419.11,418.07,406.22,394.96,401.33,403.11,414.22,388.74,404.74,408.59,414.96,407.41,395.26,405.19,406.07,390.52,391.7,391.7,430.37,416.15,415.26,406.07,408.59,438.07,437.04,471.41,480.15,492.3,480.15,476.74,465.04,449.78,432.59,451.11,451.85,444.59,431.11,433.48,427.56,443.26,455.41,449.93,462.22,462.81,462.07,462.07,466.67,474.67,491.11,500.59,489.78,492,509.48,501.48,497.78,488.89,481.63,486.67,496.15,505.33,498.81,504,496,501.78,451.11,442.37,436.15,414.67,427.56,432.44,502.52,506.52,480.44,475.7,448,439.56,461.93,466.37,455.11,469.63,472.59,437.63,448.59,447.41,456,465.93,465.93,465.93,457.78,458.52,466.67,452.74,451.85,447.85,440.89,447.56,454.67,456.74,459.11,450.67,448.74,445.19,453.93,437.33,437.63,436.59,425.48,429.48,426.07,419.41,424.89,429.78,428.59,418.22,421.63,420.44,440.74,452.3,455.11,456.44,461.33,458.81,474.52,466.81,464.59,469.93,484.59,499.11,489.33,490.81,502.67,516.89,537.63,535.56,532.3,537.48,537.63,537.93,543.85,555.85,568.15,571.26,590.81,611.7,607.11,585.48,580,589.48,577.63,583.85,583.85,580,573.78,576.3,588,586.96,587.11,576.74,584.3,584.74,630.96,609.63,627.41,633.63,626.67,634.52,654.07,673.48,689.48,689.48,690.81,684.15,674.37,679.41,727.41,720,716.89,714.81,708.59,725.48,713.63,722.22,714.22,719.26,737.33,754.52,754.52,756.3,761.93,766.07,745.93,729.78,748.59,703.85,722.67,696.3,711.41,732.59,738.37,730.67,736.74,774.22,797.04,798.37,807.85,819.41,819.41,842.81,872.59,848.44,789.33,727.7,704.74,703.56,652,673.78,703.11,692.59,742.37,712.74,719.85,641.04,672.3,677.04,577.93,650.37,573.48,620.44,579.56,589.93,586.81,616.89,684.74,661.19,703.7,690.07,709.04,673.78,646.81,659.11,630.96,704,704.59,722.81,716.74,716.74,754.67,813.78,814.67,843.7,838.52,844,784,828.44,828.15,832.3,836.89,822.37,794.96,776.15,738.96,778.67,773.19,772.74,769.63,788,825.78,796.44,773.04,807.56,802.96,808.74,821.78,835.41,809.63,817.33,817.33,788,781.33,766.52,797.04,794.52,793.19,781.19,779.7,786.67,784.74,835.41,850.96,782.67,792.59,810.07,806.81,808.15,800.59,803.41,811.26,799.85,776.15,769.33,742.22,744.89,779.41,778.96,775.41,775.41,791.11,784.15,791.56,848.3,827.85,793.93,810.67,819.85,813.63,815.41,851.26,844.44,915.41,882.52,1028.15,1021.78,1001.63,1127.26,1158.52,1147.11,1150.67,1259.85,1263.85,1284.59,1257.04,1218.37,1138.96,1223.85,1212.44,1204.44,1221.04,1209.78,1201.33,1226.22,1241.63,1230.81,1279.26,1274.37,1241.48,1267.41,1345.48,1365.63,1336.59,1222.81,1214.96,1214.96,1165.78,1213.48,1170.07,1130.96,1154.07,1169.33,1135.7,1134.07,1110.07,1154.67,1151.11,1107.11,1123.26,1156.44,1177.48,1211.41,1214.67,1257.19,1211.85,1276.3,1251.56,1284.3,1281.63,1231.11,1248.74,1263.41,1247.56,1231.56,1232.15,1214.81,1208.3,1173.33,1176.59,1214.22,1218.22,1168.59,1131.85,1155.85,1115.41,1106.67,1134.52,1205.19,1229.63,1272.3,1231.41,1155.41,1204.15,1212.44,1206.37,1240.44,1234.96,1222.81,1267.26,1253.93,1263.85,1260.3,1284.59,1284.59,1291.7,1372.74,1372.3,1388.74,1367.56,1393.19,1393.63,1376.59,1330.81,1357.93,1357.78,1404.15,1438.81,1434.81,1434.67,1421.04,1381.19,1380.15,1356.3,1360.15,1360.15,1357.04,1342.52,1367.26,1358.67,1367.41,1374.37,1338.22,1409.78,1401.19,1440.74,1412.74,1359.7,1345.04,1306.81,1306.81,1325.19,1314.81,1356,1374.67,1394.52,1403.11,1316.15,1296.59,1268.74,1298.67,1316.44,1302.07,1301.33,1302.22,1355.11,1346.81,1368.15,1372.74,1389.19,1389.19,1354.96,1332.44,1313.19,1327.11,1264.74,1255.41,1288,1221.04,1252,1279.85,1246.37,1197.93,1151.85,1163.26,1095.7,1163.41,1148.44,1203.41,1200.74,1222.22,1225.93,1224.15,1157.33,1171.26,1189.63,1161.19,1133.04,1129.19,1146.81,1142.81,1125.93,1162.96,1201.33,1201.33,1206.37,1206.52,1217.78,1234.81,1226.07,1164.15,1188,1163.7,1229.78,1217.04,1201.63,1174.37,1209.04,1171.26,1226.07,1265.33,1262.37,1244.74,1243.11,1209.19,1163.7,1164.59,1153.04,1153.93,1167.56,1125.78,1138.22,1105.78,1082.81,1105.04,1105.93,1102.81,1129.33,1156.44,1143.26,1147.26,1153.48,1160.59,1161.78,1186.37,1186.37,1197.19,1214.37,1189.33,1208.59,1205.19,1198.37,1184.59,1208.3,1204.59,1208.15,1192.15,1186.81,1252.74,1254.07,1223.56,1238.22,1241.78,1275.56,1268.44,1290.07,1326.22,1391.56,1382.37,1402.96,1402.96,1399.56,1341.33,1329.48,1346.67,1345.33,1337.19,1319.26,1287.85,1272.44,1282.67,1290.52,1324.59,1351.26,1365.19,1360.3,1348.59,1450.81,1525.19,1573.19,1609.33,1667.56,1759.56,1664.44,1631.26,1593.78,1577.48,1595.26,1577.78,1637.78,1592.3,1593.48,1532.44,1536.3,1550.37,1611.41,1594.81,1604.44,1589.19,1650.37,1649.19,1640.3,1629.48,1617.78,1628.44,1628.44,1617.04,1572.89,1572.59,1558.52,1552.59,1566.37,1564.44,1573.63,1538.96,1504.44,1523.26,1546.37,1572.59,1567.41,1602.37,1504,1486.67,1524.44,1517.78,1486.52,1508.3,1535.41,1577.04,1556.44,1550.81,1556.15,1617.19,1659.11,1661.04,1724.89,1723.41,1724.3,1767.85,1775.11,1812.74,1821.19,1811.56,1794.96,1781.19,1855.26,1890.81,1933.78,2037.04,2019.85,2224.59,2206.22,2072.15,2163.11,2190.96,2170.22,2258.52,2242.07,2296.59,2302.37,2259.56,2221.04,2337.78,2337.78,2293.48,2398.67,2346.22,2209.04,2232.3,2133.48,2060.15,2145.93,2151.7,2045.93,2052.59,1982.22,2008.89,2170.37,2053.93,2040.74,2011.85,2137.04,2131.56,2165.04,2165.04,2286.81,2268.89,2196.44,2150.37,2131.85,2225.78,2139.56,2017.04,2018.22,1955.56,1955.56,2034.22,2036.59,1966.52,2027.85,2027.85,1954.52,1900.3,1805.78,1760.15,1726.37,1646.37,1640.15,1520,1559.11,1692.59,1730.07,1818.67,1778.96,1831.11,1832.15,1899.7,1968.15,1863.26,1676.74,1692.89,1799.56,1743.56,1664.74,1686.37,1686.37,1713.33,1626.07,1727.56,1793.48,1827.26,1686.37,1752.3,1658.96,1606.07,1525.19,1563.41,1645.19,1577.19,1545.04,1514.81,1619.7,1709.19,1654.67,1680.89,1717.33,1700.44,1687.7,1785.63,1772.89,1781.33,1825.63,1766.22,1619.85,1602.81,1637.48,1582.52,1535.85,1536.59,1496.3,1442.52,1408.89,1448,1378.67,1378.67,1390.96,1436,1392.89,1331.11,1305.78,1343.56,1261.63,1257.93,1328,1266.96,1330.96,1350.07,1472.89,1390.67,1412.44,1279.41,1314.52,1302.52,1289.78,1409.19,1396.15,1518.07,1426.37,1432.15,1385.19,1408.44,1350.52,1372.59,1462.96,1514.96,1514.96,1509.04,1499.56,1608.74,1574.81,1565.19,1559.7,1509.63,1463.7,1404.74,1288.74,1288.74,1322.96,1215.56,1208.44,1208.44,1241.33,1240.74,1221.19,1290.07,1276.44,1196.74,1155.41,1132.89,1091.41,1091.41,1114.07,1116.3,1174.81,1175.56,1140,1131.26,1148.44,1164.44,1201.63,1206.37,1272.3,1324.89,1349.48,1305.19,1296.89,1262.96,1330.67,1358.07,1399.56,1433.78,1470.96,1453.19,1539.41,1515.7,1482.52,1415.41,1467.41,1453.63,1493.78,1496.44,1484.44,1455.85,1488,1421.48,1375.41,1370.22,1373.78,1439.7,1350.81,1310.96,1288,1257.33,1219.7,1188.74,1188.74,1166.22,1179.41,1226.37,1265.93,1253.93,1141.19,1147.41,1135.7,1133.48,1137.33,1114.81,1103.41,1029.63,1006.81,982.22,995.11,1012.74,950.22,938.67,979.41,1005.93,1006.52,1005.19,865.78,856.44,853.78,857.04,873.19,828.74,858.67,858.07,847.85,855.85,871.41,869.63,910.67,884.89,868.15,918.67,889.78,883.85,868.59,890.52,921.33,934.52,945.93,887.7,1014.37,1072.15,1089.33,1131.41,1077.04,1094.81,1089.93,1073.48,1114.81,1131.85,1131.85,1113.19,1084.3,1087.26,1150.07,1147.85,1110.81,1090.67,1041.04,1039.11,1044,1016.15,1046.96,1061.48,1021.19,985.63,969.04,956.89,963.7,1002.67,946.07,955.85,955.85,937.33,926.96,960.3,959.56,959.56,948.44,957.93,923.41,947.56,996.15,1008.15,1023.11,1048.89,1051.85,1051.85,1060.59,1044.89,1003.11,1038.07,1133.78,1106.67,1109.78,1113.48,1117.04,1073.33,1113.33,1253.93,1308.3,1275.41,1239.7,1272.74,1254.67,1232.74,1207.11,1231.56,1273.33,1261.93,1186.37,1162.96,1162.96,1137.33,1134.96,1181.48,1156.89,1166.96,1164.15,1159.85,1191.7,1207.7,1202.37,1216.44,1264.74,1244.89,1224.74,1214.96,1295.56,1328.59,1431.11,1449.48,1434.22,1421.19,1445.63,1485.63,1451.11,1431.26,1400.89,1423.56,1450.07,1452,1430.52,1420.3,1371.26,1369.93,1369.93,1414.52,1393.04,1367.85,1364.3,1359.26,1331.41,1330.07,1332.44,1334.96,1310.07,1297.33,1241.48,1273.19,1295.41,1324,1328.74,1332,1209.19,1283.11,1330.96,1408,1408.3,1437.33,1438.52,1411.26,1442.96,1503.41,1537.04,1598.96,1567.7,1600,1601.78,1604,1782.96,1881.93,1881.93,1855.85,1751.26,1769.93,1746.07,1747.11,1840.44,1745.63,1793.33,1850.67,1913.93,1844.89,1886.37,1840.59,1778.96,1778.96,1761.93,1660.89,1640,1629.78,1592.74,1635.41,1632.15,1648,1687.56,1715.85,1715.85,1688.15,1681.19,1676.59,1682.67,1649.19,1697.48,1717.33,1717.63,1752.89,1747.11,1724.89,1633.33,1643.7,1638.67,1674.07,1630.96,1645.93,1673.48,1694.81,1742.22,1620,1676.3,1715.85,1730.52,1677.48,1636.59,1633.04,1593.63,1658.96,1649.63,1588,1547.26,1562.22,1603.26,1565.33,1621.19,1508.15,1514.81,1520.15,1569.19,1579.11,1566.22,1621.48,1621.48,1641.19,1618.96,1579.11,1571.7,1560.3,1560.15,1595.7,1579.7,1503.56,1516.59,1505.33,1486.52,1423.85,1425.19,1442.67,1421.63,1452.89,1522.37,1523.26,1529.93,1482.67,1541.78,1524.59,1588.74,1584.74,1614.96,1604.59,1611.7,1556.89,1577.19,1557.63,1513.63,1517.04,1508.3,1481.63,1506.22,1423.11,1387.7,1428.59,1424.89,1459.26,1600.59,1597.48,1662.96,1655.56,1680.74,1682.81,1681.33,1756.89,1730.22,1776,1748.15,1775.26,1786.96,1800.44,1765.33,1814.96,1814.96,1812,1817.04,1807.56,1834.81,1794.96,1798.37,1756.59,1753.78,1730.67,1901.78,1909.93,1991.26,2038.67,2047.26,2044.44,2061.48,2057.78,2076.3,2006.96,2072.74,2068.15,2068.15,2124.59,2164,2203.85,2183.85,2053.04,2004.74,2014.96,2053.04,2165.63,2211.26,2200.59,2192.89,2171.26,2171.26,2351.7,2372.89,2409.93,2581.19,2491.56,2495.11,2641.33,2671.56,2625.93,2634.52,2549.04,2484.3,2525.63,2632,2581.19,2487.11,2532.44,2508.89,2555.26,2546.81,2541.33,2647.41,2618.67,2575.85,2575.85,2454.67,2433.93,2694.22,2615.11,2607.56,2637.04,2615.41,2852.3,3002.07,3042.37,3038.96,3120.44,3131.56,3072.44,2939.11,3003.85,2885.78,2771.26,2830.52,2824.44,2687.7,2662.67,2647.11,2661.48,2646.37,2635.11,2660.59,2673.93,2673.93,2716.15,2647.41,2678.07,2456.74,2524.74,2517.04,2530.07,2476.15,2525.93,2418.96,2375.11,2421.63,2281.78,2297.48,2172.44,2202.07,2255.85,2248,2277.93,2331.85,2373.33,2346.37,2137.33,2165.33,2231.11,2307.85,2287.85,2275.85,2257.63,2250.67,2230.52,2269.04,2365.48,2409.19,2436.59,2464.15,2439.41,2452.15,2376.74,2464.59,2464.59,2542.37,2446.52,2470.37,2472.59,2422.96,2370.22,2461.78,2470.81,2486.96,2375.41,2354.96,2373.93,2368.89,2364.89,2346.67,2290.81,2290.81,2396.74,2388.59,2374.07,2374.07,2333.93,2362.52,2403.11,2336.15,2434.22,2428.15,2428.15,2546.67,2647.26,2623.7,2725.33,2695.41,2690.52,2664.15,2630.37,2361.93,2307.7,2245.63,2309.19,2281.48,2142.67,2049.19,2073.93,2070.37,2050.96,2140.44,1963.56,1962.96,1997.33,1928.59,1906.22,2019.56,1989.19,2026.22,2090.81,2085.19,2183.11,2200.89,2300.44,2317.04,2337.93,2247.41,2296,2222.07,2229.63,2168.3,2155.41,2200.89,2200.89,2028.74,2086.96,2065.78,1990.37,2046.67,2116.15,2220.15,2233.63,2256.44,2253.04,2234.37,2196.89,2322.07,2310.37,2322.22,2345.48,2400.3,2481.33,2434.81,2430.81,2366.67,2367.11,2412.59,2531.85,2532.89,2560,2533.63,2432.3,2487.26,2448.44,2320.59,2313.04,2314.81,2310.67,2339.26,2282.81,2265.33,2273.19,2314.52,2369.19,2462.96,2201.48,2134.37,2101.63,2084.59,2098.67,2149.63,2219.56,2191.85,2182.96,2127.85,2063.7,2056.89,1998.52,2058.22,2065.04,2038.52,2036.89,2049.63,2090.81,2040.3,2018.37,2018.37,2032.3,2104.59,2103.41,2133.19,2094.22,2053.19,1938.81,1892.44,1928.15,1934.81,1880.15,1876.89,1852.15,1798.67,1761.19,1766.07,1845.93,1870.96,1870.96,1852.74,1854.67,1813.93,1789.48,1787.11,1857.33,1919.26,1886.37,1805.04,1805.04,1719.11,1738.07,1719.85,1777.19,1754.67,1799.41,1799.41,1811.56,1833.33,1822.81,1819.85,1703.85,1691.41,1738.52,1760.89,1717.78,1692.89,1770.37,1659.41,1632,1593.48,1636.74,1645.93,1655.11,1656.44,1675.56,1675.56,1693.04,1699.11,1691.41,1642.07,1601.63,1540.15,1551.7,1474.22,1479.41,1455.26,1492.59,1506.22,1464.44,1486.07,1431.56,1433.48,1493.19,1453.48,1495.85,1549.48,1533.48,1573.78,1587.26,1576.89,1686.67,1700.89,1632.44,1580,1529.19,1522.07,1522.67,1525.33,1389.63,1270.52,1239.11,1158.67,1434.67,1314.07,1383.7,1400,1411.7,1308,1296.3,1296.3,1267.56,1277.93,1339.11,1399.56,1431.85,1428,1423.11,1442.22,1431.85,1463.7,1490.22,1461.04,1486.81,1506.67,1523.56,1601.78,1666.07,1744,1703.56,1735.85,1699.85,1681.63,1660.15,1640.15,1634.22,1634.22,1697.19,1672,1674.52,1640.44,1698.22,1737.93,1756.74,1713.93,1721.33,1803.41,1825.78,1794.67,1755.56,1720.89,1872.44,1882.96,1878.37,1878.37,1899.85,1919.7,2050.81,2124.44,2128.59,2130.52,2102.22,2016.44,2052.15,2043.11,2043.11,1997.04,2041.78,2050.52,2135.7,2169.19,2166.52,2305.33,2371.56,2376.44,2325.78,2325.93,2292.15,2350.37,2401.78,2466.22,2572.74,2628.74,2659.41,2612,2543.7,2618.96,2582.37,2416.59,2554.07,2559.41,2552.3,2591.85,2732.15,2680.74,2629.78,2609.48,2467.41,2447.41,2425.33,2485.33,2420.15,2468.44,2476,2497.48,2409.33,2409.33,2404.74,2401.93,2396.89,2239.11,2243.11,2308.44,2363.56,2306.22,2349.19,2387.56,2377.19,2357.93,2339.56,2331.7,2367.26,2383.7,2383.41,2389.19,2362.37,2390.52,2396.89,2429.78,2514.52,2439.56,3017.93,3133.48,3489.78,3450.22,3183.7,3206.22,3230.96,3534.81,3474.96,3453.04,3563.85,3526.37,3410.81,3481.33,3746.96,3846.96,3822.37,3916,3775.41,3794.37,3846.67,3704.44,3797.48,3521.48,3459.85,3614.52,3518.81,3835.41,3673.48,3656.44,3563.26,3411.7,3311.85,3052.15,3018.96,3185.93,3053.78,3173.93,3173.93,3222.67,3255.7,3188.74,3223.7,3199.7,3229.19,3275.7,3283.26,3280.3,3280.44,3122.67,3075.26,3098.81,2934.96,2978.67,3161.93,3184.44,3183.7,3185.78,3185.78,3185.04,3194.22,3190.22,3172.74,3310.67,3275.26,3175.56,3111.41,3032.3,3009.93,3076.89,3273.63,3312.59,3376.59,3434.52,3434.52,3435.85,3700.74,3758.96,3847.11,3723.11,3733.78,3744.3,3736,3507.11,3648.44,3586.81,2965.78,2851.85,3088,3200,3164,3164.15,3050.96,3071.41,3071.41,3008.59,2964.74,3012.89,2965.19,2912.59,3168,3123.85,3017.48,2966.07,2942.52,2828.89,2993.63,2954.81,2850.81,3002.67,3010.81,3034.52,2929.48,2865.04,2912.3,2908.3,2954.96,3041.04,2982.67,3002.67,3042.52,3263.26,3018.81,2992.44,2904.3,3013.78,3114.22,3222.22,3222.22,3261.93,3281.93,3434.37,3505.78,3630.22,3656.74,3778.81,3824,4122.37,4124.3,4073.33,4214.67,4495.7,4523.41,5152.74,4957.48,4788.3,4994.22,5251.7,5341.33,5059.85,5263.11,6242.82,6051.26,6743.56,6796.89,6641.33,6600,6662.22,6282.96,6236.89,6134.07,6630.81,6660.59,6926.07,6926.07,7465.04,7341.33,7675.41,7645.93,7557.48,7726.52,8037.33,7751.11,6909.33,7264.15,7044.59,6702.22,7236.3,7578.81,8107.56,7515.41,7592.3,7961.04,7961.04,8172.3,7701.48,7699.85,7889.93,7727.11,7992.44,8606.07,8013.04,7671.41,7671.41,8178.52,7646.07,7665.33,8099.56,8265.04,7916.89,8120.44,7839.11,7421.33,7344.59,7460.3,8065.63,8182.67,7995.41,7732.59,7332.59,6735.11,6363.85,7190.96,7054.07,7179.85,7682.67,7141.48,7248.59,7160.89,6956.44,7026.96,7154.52,7155.7,7620.59,7496.3,7176.15,6909.93,6954.96,7011.11,6766.67,7098.96,7124.89,7061.78,6897.48,6973.63,6809.04,6771.26,6757.93,7075.11,7075.11,7492.44,7720,7460.74,7646.37,7309.78,7469.63,7592.59,8075.41,8293.63,9118.82,9241.04,9105.33,9322.37,9342.67,9005.48,9001.04,9063.11,9121.93,9391.26,9359.26,9621.04,9568.3,9195.26,9008.89,8803.56,8970.82],"EuroStoxx50":[100,101.69,101.13,102.42,102.72,103.41,103.45,103.99,103.78,103.56,103.7,103.5,102.7,101.62,100.17,99.95,99.31,101.15,101.63,102.73,102.41,101.85,102.18,102.51,101.73,102.24,101.54,101.95,102.33,101.92,102.2,102.47,101.4,102.13,102.57,101.88,101.35,102.61,104.23,105.62,107.08,107.48,107.53,108.8,107.96,109.23,109.55,109.51,110.23,109.94,109.9,110.05,110.05,110.2,110.21,109.97,110.6,110.6,111.43,111.51,111.48,111.63,111.22,111.13,111.19,110.48,111.74,110.74,110.42,110.72,110.6,110.9,110.02,110.3,111.8,111.57,111.03,109.67,108.59,109.54,109.36,110.02,108.85,108.76,108.84,110.18,109.94,111.1,111.22,111.72,111.29,111.22,111.34,112.24,112.24,112.06,111.06,111.24,111.58,113.95,113.77,114.4,113.86,113.78,113.94,114.62,114.83,114.8,114.27,114.6,115.63,115.91,115.54,115.28,114.98,116.04,115.77,115.53,116.47,116.81,117.03,117.68,116.74,117.03,116.72,117.29,117.5,116.99,116.64,116.59,115.91,115.91,115.91,114.61,114.99,115.63,115.64,120.25,120.44,120.29,119.77,119.65,119.65,120.27,120.54,121.94,122.98,122.42,122.66,122.54,121.8,122.27,122.41,122.41,120.5,119.74,120.57,120.22,120.84,120.56,120.56,120.3,120.3,119.7,119.48,119.9,120.73,120.73,119.47,119.29,119.79,120.54,119.12,119.59,119.23,118.5,119.12,120.32,119.68,119.47,119.52,119.11,119.72,118.93,118.85,116.68,115.69,117.37,116.96,116.92,116.37,116.43,116.91,116.45,118.16,118.58,118.52,118.2,116.93,117.65,117.63,116.02,116.07,116.76,117.35,117.41,116.56,115.94,115.94,116.28,116.52,117.89,117.84,118.17,116.58,115.41,114.5,115.99,116.37,117.13,116.37,115.83,115.08,116.15,115.58,115.79,115.58,114.99,113.89,114.41,115.01,115.76,115.31,114.99,115.42,115.89,115.89,117.48,118.07,118.42,118.54,118.17,118.54,118.69,118.5,118.98,119.04,118.92,118.87,119.5,119.78,120.83,121.1,121.2,120.84,121.46,121.12,121.36,120.97,121.26,121.19,121.16,121.22,121.27,121.67,121.08,121.18,121.3,121.37,120.72,122.26,122.76,123.1,123.49,124.28,123.99,124.03,123.78,122.98,122.86,121.43,120.8,120.15,119.54,119.18,119.82,119.24,119.71,120.31,119.75,120.07,120.38,119.8,120.45,120.67,120,118.57,120.21,120.02,119.72,120.1,120.72,120.41,121.02,120.39,119.54,119.68,121.32,120.41,119.42,120.02,119.44,119.44,119.44,119.33,118.46,117.78,117.78,117.98,119.96,121.26,121.56,121.78,121.34,120.85,121.43,121.4,121.75,121.44,121.71,122.66,123.2,123.44,122.46,122.02,122.6,122.45,121.23,121.32,120.25,118.43,116.93,114.11,116.12,113.52,111.8,113.22,112.3,113.27,113.94,115.19,114.55,115.46,115.3,115.36,115.68,116.41,116.23,115.59,114.26,111.75,112.78,112.87,113.52,114.73,114.97,115.28,114.2,113.98,114.76,115.54,114.11,114.69,114.32,112.54,110.86,110.21,111.49,111.97,112.99,112.99,112.99,112.5,112.28,115.29,114.56,114.78,115.59,114.95,115.76,115.9,115.66,116.9,117.34,117.2,117.45,118.08,118.01,117.17,117.85,118.28,118.87,118.87,119.45,118.62,119.35,119.8,119.59,119.99,119.99,119.85,119.86,119.81,119.76,120.74,120.12,120.12,120.58,119.05,118.38,118.16,117.06,115.23,115.67,114.51,116.08,116.62,116.19,116.33,116.29,115.87,116.98,116.82,116.96,118.56,117.81,116.52,115.47,115.62,114.4,115.68,113.25,113.23,114.19,113.13,114.14,113.35,114.5,114.69,115.66,115.91,116.32,116.75,115.04,115.81,116.12,115.93,116.22,117.14,116.69,116.3,116.1,117.08,116.58,117.96,118.56,118.06,118.5,118.5,116.61,117.05,117.08,117.79,117.43,117.45,115.17,114.61,114.6,112.91,113.53,113.37,114.07,114.68,114.96,114.93,115.21,116.17,115.88,116.17,115.33,114.05,114.12,112.92,111.45,110.79,110.7,111.23,111.31,111.82,112.05,112.42,112.47,112.89,113.23,114.39,115.32,114.64,114.95,115.4,115.96,114.26,114.76,113.91,114.47,113.45,112.45,111.25,111.66,109.81,107.87,107.37,107.91,109.49,109.01,107.95,107.93,107.23,105.58,105.22,106.36,105.37,106.05,105.78,107.48,107.7,108.05,108.15,107.81,109.11,108.83,108.55,107.36,108.4,107.74,107.24,106.91,106.23,104.74,106.01,105.1,105.45,106.64,106.43,106.5,106.69,106.66,108.07,107.2,105.89,102.38,102.81,101.41,102.7,104.47,104.61,103.95,102.98,102.19,102.57,100.84,100.86,100.86,100.86,100.86,98.73,100.39,100.39,100.39,99.31,102.25,101.97,102.69,103.2,103.38,103.19,102.69,103.13,103.43,103.17,105.37,105.04,104.63,104.61,105.08,106.33,105.45,106,106.28,106.2,106.59,106.39,108.07,107.99,105.91,105.4,106.41,107.25,107.64,106.98,108.95,109.07,108.89,109.56,109.7,109.93,110.25,110.56,110.34,110.86,111.33,111.5,111.84,111.75,111.22,110.37,111.07,111.06,111.71,112.34,113.82,113.88,114.59,113.36,113.19,111.12,110.94,111.58,111.66,111.6,112.66,113.79,114.14,115.48,115.69,115.88,115.56,114.86,115.11,115.47,115.89,115.98,116.41,116.9,117.62,117.62,117.62,117.77,117.73,117.37,117.66,117.71,118.14,118.14,117.27,117.73,116.4,114.32,114.86,112.63,112.97,111.62,113.09,113.81,115.58,115.15,113.27,113.83,113.84,111.84,112.63,113.08,112.57,110.85,110.85,110.27,110.93,112.05,112.27,112.21,113.56,113.56,114.32,113.83,113.96,113.58,113.72,116.06,116.12,116.57,116.53,116.15,115.78,115.73,115.71,116.76,117.56,117.91,119.01,119.13,118.59,118.44,117.97,117.7,117.54,117.57,117.72,118.36,117.7,117.07,116.98,117.31,118.75,118.75,117.99,118.47,118.44,116.4,116.53,116.53,113.48,111.29,110.64,111.26,113.46,112.06,111.82,112.84,110.54,110.34,111.9,113.25,112.61,114.11,113.4,112.07,112.56,113.29,113.12,114.67,115.18,115.38,114.98,115.99,117.13,117.48,117.48,117.61,118.21,118.95,119.33,118.27,118.36,118.59,119.42,120.05,118.89,118.72,118.08,118.73,119.19,119.98,118.26,114.73,114.87,115.85,116.68,115.39,116.37,117.44,120,119.54,120.96,120.98,120.62,120.31,121.01,121.17,121.24,121.73,121.84,121.87,121.75,121.69,121.16,121.8,123.2,123.58,123.99,124.59,124.36,124.26,124.78,124.35,123.99,124.76,124.53,124.25,123.83,123.68,123.94,124.63,124.55,124.8,124.52,124.49,121.9,121.38,123.02,122.62,124.11,123.43,123.42,123.95,124.58,125.41,126.81,125.89,125.68,125.68,126.94,126.94,126.94,126.94,126.94,127.13,126,126,126,126.83,126.13,126.36,126.81,127.59,127.38,127.05,126.89,126.69,126.86,128.01,127.7,127.36,126.71,125.61,127.03,123.62,125.01,125.59,124.06,122.38,123.07,125.45,126.98,127.91,127.68,127.5,128.6,129.56,129.3,129.11,129.52,128.96,129.92,128.5,127.74,122.62,120.08,120.26,116.16,111.91,112.23,113.34,114.98,113.06,108.64,99.46,97.81,97.66,85.55,86.92,82.36,85.06,80.19,82.49,85.66,83.55,91.26,94.12,95.72,91.72,92.96,93.68,90.09,90.37,89.51,93.98,96.05,95.84,97.24,97.24,97.24,98.07,94.39,94.53,97.08,97.8,93.83,95.29,95.88,94.42,96.88,98.56,100.71,98.42,98.42,94.67,96.67,95.59,96.83,97.75,96.93,96.95,94.47,92.78,93.13,97.88,97.56,98.9,98.9,97.66,99.88,100.81,102.56,104.01,102.53,102.53,106.18,109.9,109.63,113.76,113.15,111.62,110.71,105.7,106.01,105.42,109,109.82,109.24,109.88,108.96,110.88,107.43,108.2,107.7,108.64,108.71,108.52,111.6,110.73,112.6,111.65,110.46,109.62,110.8,112.6,111.64,113.55,113.12,113.13,113.89,114.46,113.3,113.33,111.29,111.02,111.04,110.93,107.84,106.7,109.18,109.39,109.86,108.92,109.33,109.57,112,113.05,112.36,111.09,111.12,110.57,111.52,110.05,109.57,111.99,111.92,112.83,111.97,111.45,110,110.17,112.19,111.06,109.6,111.4,109.83,111.76,111.35,111.45,111.49,112.01,112.23,111.48,110.37,106.25,106.36,106.89,106.2,105.45,108.34,108.04,107.35,107.36,107.26,108.24,108.68,108.69,109.44,110.02,110.86,110.22,110.02,107.32,109.09,108.99,108.5,106.91,106.6,107.52,104.38,103.21,99.61,99.5,99.43,101.5,104.16,106.25,108.08,107.7,114.55,115.72,116.55,115.23,115.36,116.51,116.59,117.05,116.03,116.56,116.4,117.91,118.05,118.01,118.58,117.39,118.49,118.36,118.22,118.97,118.66,118.52,118.62,118.4,117.17,117.78,118.37,119.09,119.69,119.18,115.92,117.56,118.97,118.97,118.97,120.18,120.38,120.05,120.05,119.81,119.25,121.38,121.76,122.52,121.7,121.41,121.56,122.4,120.99,121.1,120.85,121.81,121.62,121.09,119.43,120.77,118.87,119.56,117.02,118.68,120.69,121.33,122.42,122.88,123.21,123.06,122.63,123.42,124.22,125.52,125.26,124.36,123.73,124.82,124.36,124,124.57,123.87,122.23,124.59,124.63,124.8,124.53,123.34,126.49,127.26,128.4,129.26,128.85,128.73,129.44,129.4,130,128.97,128.87,128.64,128.82,128.82,129.97,130.51,131.97,131.74,132.64,132.64,132.64,133.46,133,133.71,133.74,133.17,133.34,133.65,134.23,135.56,135.12,132.45,133.66,134.95,134.9,135.15,134.85,134.96,134.35,133.6,134.46,131.92,134.55,134.43,135.6,135.24,132.64,132.68,132.68,135.04,134.68,134.63,132.33,134.45,135.32,135.32,135.66,135.52,135.77,136.82,135.78,136.86,137.43,137.12,137.46,137.73,137.68,137.71,137.68,138.71,138.91,139.28,139.55,139.77,137.25,138.23,138.59,137,138.57,138.51,137.47,138.07,136.61,137.1,137.29,137.39,136.22,137.09,134.17,136.74,137.59,137.63,137.8,136.35,135.65,132.05,132.98,135.35,136.44,138.12,137.9,136.63,137.92,138.38,137.45,138.37,138.42,139.32,139.87,140.32,140.41,140.77,141.39,142.06,142.17,141.26,141.05,140.82,138.64,139.41,140.38,140.44,140.54,140.16,140.87,141.13,141.05,142.09,142.25,141.24,142.73,142.02,140.41,140.41,140.18,140.82,140.89,139.36,140.16,138.85,135.92,137.73,139.5,141,139.78,140.01,136.43,137.15,136.07,135.64,134.33,136.65,134.88,137.76,136.92,136.89,136.3,137.25,139.46,140.6,139.54,140.06,140.24,139.69,140.8,140.78,141.98,141.88,142.31,142.87,143.88,144.41,144.86,145.66,146.65,146.3,146.04,146.18,146.49,146.9,147.43,147.95,147.92,147.35,146.43,145.84,143.99,143.74,144.31,137.46,138.13,136.57,140.47,138.08,137.15,139.06,143.74,142.29,141.45,141.15,140.6,139.31,139.82,141.24,139.88,138.05,140.33,141.75,143.39,143.39,144.13,144.94,144.03,144.74,144.74,145.61,146.81,147.63,145.37,144.73,142.5,143.92,145.09,145.07,143.6,144.61,143.12,143.47,144.52,142.17,136.28,137.08,139.98,140.67,139.05,140.32,142,141.92,139.19,137.36,138.5,138.8,141.31,141.08,139.67,136.62,139.28,139.06,138.26,136.95,133.97,133.96,133.56,128.71,133.47,131.91,126.58,128.42,125.77,119.53,118.06,117.82,126.59,122.73,123.92,125.75,125.65,130.74,130.6,131.17,130.48,131.97,130.06,129.86,130.01,130.66,134.53,133.08,131.18,131.72,132.81,131.69,128.56,127.8,129.69,129.06,128.79,128.67,129.37,129.37,129.37,128.76,130.98,132.03,129.07,126.3,125.09,125.53,126.96,127.83,125.46,126.42,125.21,124.25,121.99,118.55,119.49,122.62,121.46,124.48,123.88,125.76,124.06,122.13,122.92,124.65,122.61,123.6,123.6,128.03,129.13,127.37,126.37,127.57,127.18,127.18,127.96,127.36,125.19,120.98,117.73,116.81,118.73,115.22,115.58,116.63,117.44,116.46,115.5,118.76,118.95,119.3,118.13,116.13,115.91,116.05,112.93,115.02,117.26,117.87,116.69,117.21,116.1,114.17,116.88,118.04,120.58,120.51,120.89,120.89,121.15,120.18,121.27,122.76,124.64,124.64,123.85,125.46,126.2,125.22,126.29,124.88,126.03,126.29,126.95,127.38,127.9,126.25,126.97,125.39,122.96,122.77,123.27,123.51,121.13,120.02,119.73,118.23,116.19,119.14,117.31,117.65,117.72,118.06,120,122.57,120.54,119.92,119.05,117.66,117.63,116.54,117.37,115.2,112.56,112.35,111.89,112.11,110.22,111.53,112.34,117.12,115.89,115.41,113.46,112.83,112.28,111.98,113.02,113.67,115.68,116.43,116.68,117.41,116.86,118.58,120.52,121.19,121.16,121.44,121.6,122.72,121.75,120.78,123.98,124.66,125.69,125.31,129.29,130.03,130.67,131.6,130.51,130.37,131.93,131.4,132.1,132.65,133.17,133.19,132.28,132.25,133.27,133.93,133.71,132.99,132.41,131.79,131.81,132.52,131.82,134.01,133.62,128.93,127.86,128.11,127.81,130.15,128.51,128.3,128.3,128.83,128.03,129.41,127.51,127.51,130.5,133.58,133.09,135.05,136.76,136.38,137.81,138.71,139.52,139.73,140.31,140.31,137.62,138.48,139.52,139.6,139.43,140.3,140.44,139.78,139.95,140.21,142.56,143.12,141.36,141.49,141.48,142.86,141.11,142.56,142.48,143.86,144.44,143.69,143.57,142.87,142.62,143.13,140.46,142.79,142.46,141.7,142.54,144.36,145,143.83,144.15,144.07,142.17,137.7,140.48,135.63,138.38,136.64,138.47,140.56,141.03,141.41,138.84,139.99,140.11,142.23,144.05,145.04,144.91,145.05,144.48,144.85,144.85,144.85,145.65,145.68,146.66,147.59,146.81,147.69,147.68,147.39,148.19,147.96,147.15,146.14,146.49,146.53,146.53,144.36,144.88,144.1,145.89,146.17,145.31,144.76,144.86,145.14,145.09,145.06,145.32,145.32,147.74,147.41,145.96,143.32,143.52,145.8,145.8,144.25,141.78,143.11,145.33,144.31,144.38,144.26,144.46,144.19,145.09,146.13,147.09,146.72,147.72,146.63,145.99,145.3,144.69,143.58,143.88,144.71,146.04,146.37,147.87,147.83,147.59,146.24,141.95,142.4,143.07,144.08,146.57,147.62,147.9,146.44,146.88,146.63,147.01,147.61,147.33,147.6,146.09,149.49,150.13,150.29,150.29,145.76,144.69,145.64,145.8,144.16,145.12,147.36,145.25,145.55,144.15,144.01,142.11,141.61,142.01,143.2,143.42,142.26,142.39,144.32,145.43,145.05,144.44,143.95,143.86,143.5,142.46,141.88,142.42,143,142.6,141.96,143.86,144.37,142.72,142.61,143.73,141.6,141.42,140.08,138.79,138.88,139.88,140.32,139.08,137.67,137.81,137.81,139.31,138.24,141.35,141.2,141.12,139.03,139.49,139.57,138.01,137.49,135.28,135.86,136.65,136.92,136.11,134.93,135.4,136.51,137.53,140.15,140.32,139.78,139.61,140.45,142.16,141.09,142.26,144.26,145.06,144.62,145.91,145.96,145.61,146.28,146.6,146.96,146.36,146.15,146.91,147.31,148.52,148.4,149.67,150.7,150.38,152.04,152.61,152.49,152.27,152.57,152.92,151.97,152.45,152.4,152.09,151.98,151.98,151.98,152.21,151.74,151.99,151.99,149.51,150.38,150.03,150.77,150.15,150.22,149.32,150.59,149.74,149.46,148,149.68,149.54,150.6,150.11,153.41,154.02,155.81,155.94,156.73,156.25,155.92,156.45,156.48,157.67,157.27,158.34,158.51,159.54,157.62,158.29,159.43,160.19,160.1,160.01,160.51,163.2,163.78,163.5,164.22,164.16,163.96,164.53,165.14,164.47,165.22,167.2,166.76,165.73,167.5,168.08,167.83,167.6,167.49,168.33,168.08,169.82,169.11,169.55,170.22,170.81,170.87,170.87,170.87,169.48,170.39,170.44,168.56,169.61,167.76,168.09,166.94,166.55,167.54,165.27,165.18,165.93,165.31,165.94,168.34,167.72,166.01,168.3,167.43,165.42,165.42,164.39,165.43,166.62,168.61,169.35,169.35,170.92,170.72,170.76,171.46,170.5,170.22,170.22,169.64,168.91,169.33,169.26,170.05,169.09,166.83,167.47,167.52,168.18,166.5,169.26,170.39,169.79,168.62,166.89,169.22,165.9,162.66,164.05,165.22,164.21,166.31,164.95,166.42,165.91,165.24,164.79,164.5,165.71,164.92,166.92,167.64,167.37,167.05,164.83,166.68,167.26,169.51,167.5,166.31,164.42,163.7,162.26,164.62,165.27,163.42,161.72,163.44,161.86,162.72,163.79,163.79,155.92,153.67,153.79,156.91,156.93,157.15,157.04,157.81,158.91,161.6,162.7,163.74,163.28,164.21,164.2,165.01,164.59,164.66,165.14,166.93,166.65,167.16,165.12,162.96,161.85,159.26,160.63,159.57,160.12,161.82,162.82,162.27,163.39,162.53,166.16,163.75,164.22,166.07,165.27,169.16,170.33,168.08,166.52,166.83,165.42,166.55,167.05,166.35,167.48,167.07,168.2,169.44,166.27,165,166.29,167.6,166.09,166.02,165.46,165.9,166.15,167.05,166.38,164.22,162.27,163.96,163.09,163.71,161.36,163.09,161.44,163.16,159.48,159.34,162.47,161.17,161.02,159.7,158.98,159.86,160.98,161.34,160.06,159.1,159.95,161.49,162.91,163.98,165.34,166.44,167.32,167.58,166.44,166.7,166.91,166.99,166.28,166.13,166.63,164,163.44,163.12,163.12,163.12,163.12,164.67,163.67,163.67,163.67,163.74,167.62,168.46,167.94,168.67,167.3,166.53,167.41,169.15,171.66,173.05,173.59,173.64,174.98,175.38,175.44,174.4,174.64,175.82,177.55,177.71,175.39,176.96,177.18,180.05,179,180.11,181.2,181.7,184.89,184.65,185.54,186.01,183.57,183.56,184.03,183.32,183.12,185.81,183.95,183.65,186.24,181.08,184.51,185.56,183.81,181.07,178.48,180.15,179.1,181.65,183.04,184.37,185.12,183.22,182.31,182.04,184.03,181.9,180.87,179.2,176.41,178.83,178.28,171.87,163.97,156.52,160.46,155.36,161.98,160.91,165.09,167.07,166.94,165.89,165.89,165.89,166.77,171.38,171.93,173.25,173.8,173.51,173.45,173.45,177.65,177.58,176.92,175.8,177.78,178.48,181.25,182.06,181.63,181.92,182.44,182.43,183.35,183.34,182.33,179.03,181.35,182.03,180.78,180.78,180.39,180.02,180.69,181.68,181.86,182.52,182.52,182.03,181.28,180.19,177.83,179.48,177.77,177.04,174.69,175.92,175.52,178.05,176.54,176.27,179.01,178.26,177.56,178.78,179.6,177.77,179.55,180.57,183.04,182.8,180.95,180.53,179.97,178.08,180.74,180.14,179.59,177.83,179.64,180,179.9,179.41,180.81,181.28,178.82,178.82,176.21,176.45,176.91,179.23,179.75,179.22,179.36,181.12,182.68,183.14,182.67,184.31,183.94,183.6,184.48,182.99,180.96,181.28,181.4,179.89,180.4,177.85,178.99,179.72,178.76,180.26,180.46,180.22,181.07,181.2,182.87,180.58,180.49,183.42,183.47,182.92,183.94,183.68,183.02,184.86,185.1,185.88,187.6,189.77,189.97,189.2,188.69,189.9,189.09,185.92,187.16,186.62,188.4,189.98,188.48,190.95,191.15,189.55,190.53,190.74,191.97,191.74,191.79,191.57,190.32,190.9,190.26,190.56,188.61,187.11,190.4,192.46,194.53,193.03,191.38,189.61,186.04,186.28,187.22,185.38,185.84,187.36,190.1,190.02,190.52,190.5,191.13,191.41,192.2,192.4,192.45,192.21,191.87,193.41,192.29,193.36,192.19,190.98,193,193.62,193.06,193.25,193.25,193.25,193.25,193.33,194.83,194.83,194.83,199.11,199.39,199.11,198.46,201.59,202.23,202.68,201.85,203.06,202.67,199.18,198.05,197.74,200.2,199.94,200.26,201.5,199.43,198.05,199.92,201.93,201.52,200.69,199.18,201.62,203.66,203.26,202.88,202.06,201.18,200.97,202.41,205.15,203.68,206.09,205.51,205.6,207.5,207.11,206.33,201.24,194.01,197.34,194.38,192.26,191.1,196.2,194.78,193.24,192.15,192.91,193.92,192.83,188.7,184.91,187.37,187.6,189.89,187.09,185.07,186.28,187.22,192.69,191.35,191.35,191.35,189.35,198.77,198.19,199.19,198.49,201.16,199.67,199.44,203.62,201.09,199.33,198.53,198.14,197.76,196.98,196.17,195.51,197.7,197.7,193.73,197.3,202.59,200.76,198.7,198.16,195.24,197.01,197.01,195.89,196.6,196.68,200.87,200.34,202.33,202.33,203.83,204.05,203.53,203.38,202.85,205.3,203.48,205.15,203.76,203.77,203.35,202.01,203.59,207.98,209.39,210.33,211.76,212.54,211.53,212.14,209.43,208.89,210.67,209.12,209.46,212.71,211.17,213.79,215.55,215.06,212.43,208.57,211.23,210.75,210.79,211.1,210.6,211.21,209.44,209.32,211.28,212.33,208.74,211.12,211.16,211.41,210.04,213.25,213.71,216.01,218.04,217.71,218.57,219.29,219.68,220.21,219.63,220.01,219.82,219.51,217.41,216.62,215.86,217.21,216.74,216.99,217.5,215.95,218,215.8,214.08,213.85,214.54,214.89,215.26,215.57,212.15,210.72,212.61,210.43,209.63,210.64,212.53,209.62,212.37,212.59,211.76,210.84,211.86,211.8,212.44,210.72,207.58,209.69,209.82,210.83,207.74,205.94,207.51,208.44,208.44],"HSCEI":[100,101.1,100.47,102.35,101.52,102,102,103.75,103.59,102.13,101.18,100.19,100.66,102.2,100.24,99.84,99.94,101.17,101.72,98.76,100.52,99.33,98.38,98.96,98.59,98.21,98.45,99.45,101.63,101.78,101.92,103.09,103.99,103.68,103.59,104.16,102.99,102.26,102.86,103.5,104.21,103.91,102.13,102.35,102.2,99.81,99.72,98.74,97.75,98.26,96.88,96.68,96.68,96.68,97.93,98.06,98.93,98.93,99.61,99.41,101.07,101.2,101.11,101.76,102.5,102.38,103.06,101.78,102.16,103.22,103.11,102.3,102.42,102.76,102.58,103.76,103.23,103.23,103.23,102.74,102.1,101.96,103.62,103.68,104.83,106.09,106.62,108.01,107.98,109.89,110.09,109.09,109.99,109.6,110.96,110.79,109.71,108.78,108.44,108.33,107.9,106.82,107.1,107.72,108.25,106.31,106.03,108.02,108.62,108.17,110.84,110.71,111.45,112.08,110.11,110.43,110.33,109.11,109.78,109.9,109.04,108.18,108.61,108.61,109.14,108.21,108.18,107.97,107.05,107.49,107.45,107.45,107.45,105.76,105.13,105.89,105.82,106.43,108.16,108.64,108.05,107.61,107.61,107.13,107.13,106.22,104.52,105.11,106.66,107.69,108.01,108.27,110.04,109.86,109.33,108.16,108.11,109.24,109.46,109.41,111.32,111.4,111.82,111.82,111.65,111.83,112.32,111.58,111.68,111.74,112.14,111.53,110.41,110.83,110.72,108.94,109.35,110.78,110.23,109.44,109.54,109.83,110.89,110.54,109.6,109.85,109.14,109.64,108.52,109.31,108.94,107.95,107.56,109.68,110.75,112.43,112.96,113.54,113.25,114.36,114.22,113.59,113.94,113.54,114.05,114.33,113.26,114.02,116.08,116.41,115.85,115.86,116.4,116.67,115.43,113.53,111.33,112.75,113.07,113.91,113.74,112.6,113.21,115.35,115.35,116.36,118.86,119.43,118.95,119.77,118.94,118.83,117.75,117.85,117.18,116.87,117.4,118.16,118.38,117.8,116.89,116.54,117.89,117.15,117.65,117.92,116.98,114.91,115.5,116.2,114.51,114.88,114.88,119.04,120.01,120.01,120.66,119.89,120.24,120.16,121.1,121.3,122.18,121.81,122.38,119.59,121.71,121,120.1,121.02,120.53,122.6,121.76,121.17,122.53,122.13,122.17,121.35,122.63,121.89,123.67,123.68,123.04,122.16,120.17,121.45,122.24,121.5,125.03,125.92,123.59,125.39,123.96,123.26,122.65,120.84,120.56,121.28,120.93,117.54,117.42,118.88,120.37,119.12,121.3,121.43,119.68,120.2,121.53,121.15,122.11,122.7,122.7,122.7,122.33,123.03,123.3,127.08,127.29,128.5,128.59,128.83,129.05,129.4,129.47,131.3,131.31,134.65,135.51,137.89,138.78,139.04,142.05,143.43,140.97,144.51,143.83,140.99,142.8,141.46,142.56,141.94,133.59,130.92,130.36,125.32,125.31,126.41,129.11,132,132,132,130.54,133.59,131.92,134.1,135.14,133.17,130.38,130.87,128.5,126.27,129.64,128.26,129.88,130.9,133.7,134.22,133.57,133.94,133.44,133.31,132.65,131.85,130.86,127.71,128.44,129.53,126.37,126.34,126.34,126.34,127.8,124.86,124.86,126.02,127.13,129.77,129.78,129.4,129.11,126.44,125.31,126.21,128.88,126.93,126.36,128.94,127.35,125.82,127.06,129.85,129.85,128.4,126.56,125.21,126,127.88,128.31,128.82,129.99,132.09,131,130.99,129.29,130.1,130.04,130.04,127.31,127.96,126.86,127.57,125.93,123.93,126.13,126.57,128.99,129.09,129.34,130.65,128.1,128.17,128.53,126.73,125.84,124.99,124.99,121.02,121.15,119.67,119.41,118.03,117.08,114.56,114.44,116.6,116.6,114.48,112.8,111.7,111.85,113.39,113.98,112.23,113.23,113.16,112.71,111.53,111.39,110.81,112.49,113,115.55,116.61,116.05,116.33,116.32,116.09,115.54,113.02,112.6,112.69,114.42,114.79,116.04,115.23,113.37,113.14,110.93,110.35,110.71,111.96,113.07,114.25,113.88,113.51,116.35,116.86,116.7,115.49,114.52,113.86,114.68,112.1,111.39,111.19,109.86,108.81,107.81,110.59,111.35,110.16,111.16,113.11,113.64,116.11,114.01,114.01,115.68,115.19,116.02,116.02,113.24,113.58,111.06,110.88,109.44,109.73,109.96,106.27,108.45,106.82,107.39,107.39,106.74,107.64,110.46,107.77,107.68,107.16,105.92,105.43,105.29,106.76,108.24,112.54,111.04,111.96,112.05,112.71,109.84,109.93,110.34,109.56,111.15,111.45,111.95,110.21,110.42,110,109.39,110.79,110.72,111.98,111.46,111.84,114.59,114.85,113.27,110.36,109.19,108.17,107.88,109.69,111.16,109.08,109,107.73,107.36,106.25,106.36,105.96,105.96,105.96,105.2,105.22,106.61,103.55,103.57,105.61,106.6,106.71,109.07,109.45,110.09,108.38,110.59,111.15,110.69,112.01,112.81,111.76,111.94,112.57,114.5,114.59,114.43,114.74,116.2,116.5,116.21,116.21,116.21,116.21,115.37,116.01,116.3,117.92,117.62,115.17,117.4,117.06,118.24,119.05,120.33,122.47,121.56,120.64,119.7,121.17,121.89,121.96,122.06,120.67,117.48,118.74,120.74,120.1,120.54,121.18,122.93,123.06,122.41,121.56,121.28,118.27,118.27,119.04,118.93,119.83,121.7,121.58,123.25,123.12,123.12,124.18,124.41,123.87,122.34,122.78,122.48,124.47,124.77,123.92,123.92,123.92,123.53,122.82,121.11,121.21,122.55,121.54,121.54,121.69,121.88,118.29,118.58,116.85,114.2,115.1,115.1,113.34,113.77,113.84,112.55,111.97,111.98,111.66,109.52,109.99,109.54,109.68,109.41,110.04,109.37,109.83,108.89,108.93,108.82,108.82,110.85,111.83,110.51,110.27,109.72,109.81,110.64,113.35,115.01,115,115.33,113.12,113.36,114.74,114.58,114.58,115.63,115.01,114.92,114.72,112.93,112.15,112.69,113.55,113.6,114.13,114.41,114.23,113.56,114.87,113.41,113.83,114.34,115.09,114.28,113.52,113.92,112.41,111.84,108.97,106.16,105.43,105.23,105.74,105.23,105.28,103.68,103.89,104.28,104.92,106.45,106.7,107.16,106.59,107.35,105.44,105.26,105.1,105.22,106.17,106.39,105.67,108.33,109.34,109.83,109.69,109.55,111.25,111.54,112.54,111.91,110.59,110.34,109.36,109.25,108.33,108.15,107.08,107.53,106.86,107.41,107.41,107.22,107.62,106.85,106.85,107.42,107.08,107.6,110.06,110.65,110.56,110.9,111.49,110.98,111.02,110.85,110.05,110.91,110.21,111.3,111.06,110.34,110.91,111.85,113.86,114.54,114.36,115.15,114.59,111.76,112.58,110.76,109.8,109.77,111.16,112.63,111.82,110.04,110.63,111.92,111.8,111.83,111.21,108.48,109.13,109.05,107.97,108.69,109.59,109.59,109.46,110.59,111.77,114.12,113.5,115.46,116.09,115.68,116.15,116.38,116.21,116.21,116.21,117.88,118.2,117.6,119.2,118.5,117.57,117.92,116.67,118.79,118.64,120.01,119.57,118.94,119.29,120.25,119.32,115.51,117.67,115.32,115.58,115.58,115.58,111.81,108.72,107.83,108.12,109.88,110.5,113.35,112.72,112.19,113.81,114.61,114.09,114.39,115.38,113.78,114.87,114.92,113.63,111.28,111.4,110.58,111.54,108.48,110.41,110.41,110.79,112.96,110.11,105.13,106.91,106.04,102.41,101.61,97.16,97.04,92.67,90.13,96.02,92.15,96.71,100.34,99.48,100.08,99,101.03,99.03,100.31,99.94,101.64,103.69,101.95,103.31,103.31,103.31,103.69,102.4,101.85,103.35,103.45,101.24,101.83,102.18,101.68,103.99,105.13,105.73,105.73,105.73,101.08,102.12,103.27,102.82,103.91,105.2,103.53,103.57,102,101.87,102.42,104.07,104.22,103.72,99.26,99.67,101.04,100.74,100.58,100.68,103.55,104,104.96,104.96,106,105.39,106.57,106.81,104.71,103.53,101.67,103.9,104.35,104.42,105.03,104.02,105.23,104.63,104.63,103.75,102.75,102.76,102.76,105.9,107.86,112.95,111.62,113.18,113.53,111,111.36,109.57,109.41,106.71,107.44,108.41,109.99,107.86,108.72,106.15,106.09,106.9,107.24,106.32,105.72,105.65,107.44,108,107.43,105.97,105.2,106.91,107.57,107.87,108.1,109.36,109.78,108.6,106.94,107.53,108.85,108.37,108.46,107.42,107.22,105.21,105.44,105.31,104.67,104.08,102.82,103.51,102.44,101.97,102.69,103.26,103.5,103.67,102.48,103.22,101.51,100.84,100.65,98.68,97.95,98.81,97.73,98.95,98.95,98.95,99.49,100.42,101.39,101.34,101.27,104.02,104.02,104.46,102.79,104.4,105.07,105.18,106.12,106.2,106.62,106.62,105.33,104.91,104.83,102.77,104.63,106.05,106.34,110.34,110.54,111.96,111.48,111,111.4,111.04,111.39,111.09,112.04,111.15,111.12,112.32,111.75,111.17,112.68,113.62,111.05,112.24,111.34,111.47,111.88,110.28,109.61,110.44,109.68,110.06,109.96,109.51,110.16,111.04,110.39,109.53,109.34,110.38,109.83,109.83,108.58,110.03,112.28,113.07,112.91,113.45,114.77,113.69,115.36,116.45,118.12,117.77,118.98,119.2,120.7,123.56,125.82,125.19,122.96,125.94,123.15,122.69,119.35,118.03,120.61,122.24,122.69,121.76,121.74,121.72,122.17,124.36,125.1,125.1,125.1,126.74,128.77,126.79,127.48,125.24,125.41,121.2,123.38,118.43,120.61,119.63,122.84,119.26,118.9,115.98,115.55,116.46,119.41,117.65,117.35,119.3,119.6,120.78,118.82,119.06,117,114.23,113.14,115.47,115.23,116.05,115.53,118.12,118.12,118.12,118.12,116.57,116.98,115.59,114.51,114.25,115.82,114.84,116.12,116.81,116.73,114.65,115.19,116.54,115.63,115.65,115.98,116.35,113.99,112.81,113.36,112.9,113.26,112.66,112.15,109.84,111.16,108.88,109.56,110.6,112.19,112.19,112.07,112.7,112.05,113.64,114.31,114.23,113.65,114.66,115.73,115.32,114,113.78,113.18,112.98,112.72,112.84,113.21,113.21,112.34,111.23,111.51,112.1,111.07,110.24,112.39,112.43,114.55,114.39,113.27,112.28,112.28,109.67,108.19,108.14,106.88,103.43,104.09,104.73,106.49,105.98,107.13,106.91,104.86,103.87,103.52,105.37,103.6,98.51,93.5,95.52,99.15,97.22,98.31,98.14,99.18,97.89,97.65,98.07,100.02,100.54,99.67,98.75,97.56,95.38,96.35,93.88,92.06,92.83,95.81,95.57,94.11,94.32,94.72,96.7,97.63,98.36,97.84,98.68,99.7,99.5,96.7,98.84,97.28,95.63,94.1,92.72,94.14,90.96,90.98,90.98,91.96,90.61,90.39,91.82,92.25,91.89,91.89,89.73,89.67,88.58,91.75,92.41,94.76,93.18,93.18,93.18,94.41,94.47,96.2,97.68,97.65,98.53,98.16,97.5,95.76,95.32,94.37,93.71,93.33,93.26,94.27,92.88,92.6,92.73,93.83,95.28,95.97,95.67,97.15,96.8,95.15,94.46,94.03,92.95,92.61,92.76,90.3,89.49,88.12,88.73,89.57,89.03,87.13,89.79,89.74,91.16,90.33,90.04,88.65,87.85,87.92,86.53,84.69,85.73,86.29,86.39,86.36,86.36,86.29,85.28,85.25,86.73,86.23,86.14,84.4,84.96,86.67,88.09,88.12,90.69,90.58,90.08,89.12,88.97,88.89,92.26,92.53,91.17,89.54,89.63,87.31,86.45,87.92,87.92,87.92,87.92,90.39,90.45,89.64,91.85,92.56,92.5,90.75,89.8,91.39,91.73,89.9,89.04,87.09,87.58,84.56,84.15,84.49,84.8,83.27,83.19,80.94,78.05,76.21,75.7,76.4,74.35,69.03,64.48,72.54,78,77.57,76.28,79.38,80.4,79.27,76.7,77.88,79.11,80.13,79.25,79.36,81.83,81.83,80.12,78.93,78.87,75.9,76.49,77.02,77.77,77.77,77.77,75.47,74.74,73.31,73.42,70.39,71.05,71.46,72.85,76.85,76.85,76.52,75.16,74.95,71.7,71.7,70.11,71.28,69.44,71.68,71.88,74.52,74.65,72.65,74.98,73.95,72.48,72.64,72.42,74.58,76.4,78.1,77.35,76.53,76.53,78.97,78.64,80.86,80.09,80.13,77.29,77.22,78.48,76.44,77.58,77.92,79.5,77.24,78.58,80.33,82.31,83.12,81.02,80.73,80.73,80.53,80.47,79.46,79.38,79.52,77.09,75.73,75.24,75.03,73.27,75.49,74.73,75.59,74.76,74.83,74.52,75.66,74.67,74.58,72.5,72.41,70.57,70.94,72.44,72.68,71.83,71.55,69.96,71.85,72.21,71.76,70.84,71.13,70.55,70.76,70.5,70.01,69.14,72.12,72.88,72.36,72.03,72.29,70.99,70.26,69.26,69.03,68.58,67.78,69.79,69.79,69.84,68.13,68.54,67.61,66.74,67.45,65.99,65.24,64.38,64.63,64.76,62.74,62.25,62.27,61.67,61.67,65.54,65.13,63.96,61.92,60.33,59.94,58.55,59.28,59.32,60.61,58.94,58.04,58.1,53.85,54.55,54.94,55.21,52.95,52,54.86,56.39,54.44,57.73,59.35,58.99,58.28,57.04,61.78,62.97,66.01,65.56,64.66,64.5,63.2,62.14,62.6,63.1,62.87,61.84,65.67,67.12,67.23,67.06,70.62,70.05,67.74,70.2,71.96,69.79,70.07,70.57,69.41,69.86,69.55,68.15,68.45,70.72,69.95,69.95,69.95,71.32,70.5,70.6,70.6,71.96,74.4,75.52,75.22,76.72,76.48,76.98,76.99,77.83,77.4,77.02,77.3,77,78.8,78.8,78.8,78.8,81.15,81.85,78.93,78.18,79.61,79.03,77.78,75.7,76.15,75.7,77.01,75.04,75.23,74.87,73.9,74.66,73.62,74.38,72.92,71.95,72.23,70.59,70.24,69.3,72.81,72.2,73.07,73.05,72.78,70.84,70.02,67.87,69.39,67.8,69.07,68.26,69.66,68.12,68.97,69.92,71.99,71.55,70.01,70.86,72.43,72.89,73.38,73.08,72.4,72.4,72.59,72.59,72.59,73.19,72.3,72.4,72.81,74.3,73.74,72.54,72.61,71.23,70.9,69.51,70.07,70.29,70.57,70.57,70.34,69.38,70.75,71.58,72.63,70.92,70.37,70.5,70.17,71.39,71.49,69.88,70.71,69.43,70.48,69.53,68.21,66.69,66.69,65.82,66.17,64.9,64.75,67.69,68.06,68.23,68.88,68.87,69.38,69.35,69.69,69.25,71.31,71.95,71.36,70.08,68.5,68.5,67.33,67.1,68.49,68.67,67.67,67.65,69.4,69.64,68.34,66.01,65.27,65.66,66.29,67.16,68.91,69.06,69.06,67.39,67.2,67.01,67.55,66.03,69.54,68.96,70.24,71.69,72.65,72.18,70.23,70.05,70.89,70.91,69.37,69.64,69.8,68.87,67.64,67.04,66.05,66.26,64.73,63.5,64.21,64.41,66,65.02,65.77,67.25,66.93,66.68,66.68,68.8,67.36,67.43,66.49,66.49,66.32,65.92,65.66,66.08,66.44,65.39,65.66,65.09,64.22,65.94,64.55,63.5,63.91,63.08,64.74,64.74,62.64,61.94,62,62.91,63.16,63.73,64.58,65.99,64.4,63.7,64.15,63.98,62.38,61.83,61.83,61.07,61.64,61.7,62.96,62.76,61.72,61.7,62.24,63.73,65.1,64.1,63.6,63.5,62.13,63.06,62.81,65.33,64.41,62.91,64.27,63.99,63.97,64.98,63.61,63.44,62.73,61.27,61.68,60.67,60.05,59.07,59.64,59.13,58.95,58.26,59.12,58.45,58.69,60.02,59.33,58.89,59.1,59.18,57.8,57.8,57.8,59.01,60.7,60.74,59.73,59.27,59.49,59.04,57.71,57.38,57.08,57.86,57.72,57.35,56.26,54.05,54.46,53.99,52.67,54.13,56.37,57.58,56.44,56.95,55.55,54.69,55,54.95,54.94,57.64,57.09,56.44,55.88,55.88,55.88,56.72,56.98,58.53,57.75,58.12,59.42,60.64,60.71,60.27,61.15,59.9,59.79,60.32,60.16,58.57,59.74,59.11,59.56,60.53,62.65,62.47,62.2,61.29,61.58,60.86,61.11,62.18,60.63,60.6,61.34,60.32,61.19,61.19,61.19,62.77,61.86,61.86,61.74,61.8,62.08,63.36,63.22,61.91,61.67,60.48,60.54,61.11,60.51,61.4,62.7,64.23,64.45,66.02,66.16,66.06,66.06,67.78,68.94,69.21,68.72,67.99,69.08,70.75,71.2,70.99,70.99,72.35,73.02,73.34,71.82,71.79,70.57,69.55,70.42,70.4,69.05,68.05,67.31,68.78,69.02,68.89,69.02,68.55,68.55,67.94,66.96,67.62,67.12,67.11,67.05,69.37,69.03,67.81,67.82,68.07,68.2,66.59,66.67,66.67,67.13,67.98,68.14,67.2,66.18,66.08,65.82,67.09,68.79,67.62,66.51,66.31,66.41,64.92,65.85,65.23,64.68,63.35,63.29,64.03,63.04,64.31,64.09,62.91,61.88,61.63,62.48,62.56,63.37,63.49,63.7,63.44,63.55,64.88,65.56,65.24,64.67,65.54,65.49,66.11,66.4,65.56,65.78,66.67,65.41,65.32,64.59,64.29,64.29,63.21,63.46,63,63.36,63.93,64.13,65.03,65.03,66.4,67.2,67.28,70.7,71.24,74.62,76.87,79.08,79.08,84.67,83.33,85.89,87.72,78.8,77.56,80.24,80.24,79.82,76.63,76.53,75.6,78.68,77.29,77.53,78.74,77.49,77.77,77.83,78.11,76.73,76.49,77.32,77.58,79.57,77.54,79.47,78.57,77.45,75.05,75.09,73.43,73.5,74.31,74.57,74.67,74.08,72.52,72.26,72.15,74,72.91,73.15,73.8,74.47,74.6,73.86,75.15,77.51,76.93,76.33,77.5,75.67,75.11,74.82,75.61,75.31,75.22,75.96,76.91,76.91,76.91,76.92,76.66,76.76,74.66,75.39,75.14,74.23,73.61,73.49,72.64,72.06,73.58,73.83,74.75,74.85,76.19,77.09,75.57,75.44,77,77.74,77.73,77.73,77.73,77.73,77.75,80.49,79.67,80.98,81.96,83.68,82.58,84.85,84.27,87.73,87.65,89.24,89.11,87.63,91.26,90.76,89.49,92.59,91.97,88.63,88.66,88.11,90.88,94.12,93.86,91.87,92.19,91.42,90.98,93.48,94.01,96.64,96.49,94.24,92.06,93.2,90.73,91.13,91.37,90.62,89.68,89.9,89.84,88.66,88.66,76.48,78.24,79.35,80.75,82.15,83.88,84.06,81.91,83.16,83.16,83.16,83.72,85.46,84.84,85.09,85.08,84.95,85.04,85.04,86.67,86.67,86.99,86.79,87.4,87.49,90.13,88.31,90.48,89.61,89.17,89.09,90.44,91.2,90.11,90.39,88.85,89.19,88.91,90.13,88.79,88.02,89.71,90.31,91.45,90.87,92.45,92.32,93.35,91.92,91.14,91.93,91.55,90.5,88.57,89.79,90.53,92.25,93.29,92.7,92.27,91.38,91.38,91.87,91.07,90.65,90.65,91.7,90.53,91.28,91.48,91.95,93.47,93.31,93.22,94.63,95.19,95.56,97.31,97.48,96.35,96.63,96.3,95.17,93.54,92.71,93.65,94.25,94.06,94.58,93.67,93.59,93.89,96.35,96.13,95.18,95.12,94.83,94.91,94.5,95.61,97.38,96.33,94.98,93.89,94.22,96.05,95.91,95.29,94.11,95.37,96.05,97.32,98.22,97.51,98.61,98.82,98.84,101.05,99.58,99.74,98.67,97.83,99.43,99.45,97.96,99.55,100.62,100.62,102.4,101.7,100.81,100.81,100.28,100.35,98.54,97.11,95.6,97.41,97.5,94.89,97.22,97.96,97.12,97.94,98.6,99.69,98.73,98.73,98.42,96.54,97.49,96.59,96.49,98.52,97.59,99.44,99.63,100.44,101.08,98.96,98.23,96.61,96.36,96.28,93.92,95.6,96.44,96.48,96.5,96.14,96.59,96.69,95.07,95.89,96.86,95.65,94.1,94.29,94.08,95.6,93.9,92.22,93.12,93.1,93.73,94.13,93.86,93.87,93.87,93.87,93.63,94.67,93.86,96.55,96.33,97.34,96.23,95.18,95.28,97.09,97.77,98.09,97.58,97.09,96.18,95.77,96.06,95.97,96.46,96.32,97.35,100.16,100.59,98.11,95.61,95.33,95.28,95.75,95.1,96.54,97.32,97.59,96.61,95.11,95.51,95.51,95.51,95.51,94.34,96.85,94.85,95.13,92.81,93.29,91.63,90.65,89.33,88.99,90.85,90.36,91.72,91.66,91.6,91.31,92.83,92.94,93.04,91.57,90.28,87.48,89.5,90.37,88.34,89.02,88.44,88.18,89.55,89.05,89.05,89.05,89.05,91.37,90.68,91.14,90.58,91.31,91.8,93.77,93.14,93.71,94.17,92.68,91.95,92.41,92.2,91.03,92.72,91.42,91.42,92.39,91.93,92.67,93.92,93.6,93.55,93.53,93.47,93.28,91.51,90.53,90.98,90.61,89.24,90.04,90.04,90.31,89.11,88.08,88.72,89.59,92.27,90.52,89.52,88.84,87.83,87.66,87.59,86.52,88.18,88.19,86.77,85.76,83.99,83.99,83.34,81.7,81.76,80.11,78.56,80.08,79.59,79.59,80.16,81.08,82.26,81.82,85.13,84.21,84.65,84.93,85.32,86.18,87.59,85.68,88.26,88.04,86.88,87.95,87.09,88.09,88.83,90.8,91.03,90.68,91.11,90.29,90.6,89.49,89.84,90.79,89.8,88.94,88.73,87.83,88.87,89.01,89.2,90.01,90.92,89.2,88.93,89.86,89.4,89.4,89.64,89.11,88.98,88.29,90.08,88.76,88.42,88.12,87.13,86.83,87.24,86.4,86.41,86.08,86.61,87.81,88.06,87.12,87.04,85.98,86.52,86.12,86.56,86.56,84.56,84.78,85.6,85.11,84.35,85.8,86.01,86.01],"KOSPI200":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100],"Nikkei225":[100,100.49,100.75,101.13,101.34,102.75,102.45,102.74,103.52,103.68,103.35,104.01,103.88,103.98,102.15,102.15,100.78,102.4,102.37,96.88,103.4,103.58,105.36,105.33,106.49,106.49,107.11,107.94,108.28,108.28,109.3,109.58,109.44,109.14,109.15,110.37,109.85,108.95,109.46,110.27,111.87,113.25,114.19,114.76,114.78,114.9,115.66,115.6,116.22,115.92,115.82,115.82,115.63,115.67,115.66,114.13,113.95,113.95,113.95,116.81,116.37,115.98,115.98,115.07,115.44,114.07,114.98,113.84,112.16,112.64,113.7,114.09,112.62,112.01,113.61,115.67,116.06,115.47,113.52,114.15,112.76,112.78,113.13,112.74,113.31,112.72,115.53,116.01,114.69,115.88,115.34,114.67,114.77,115.54,115.53,115.48,114.96,113.91,113.98,115.62,116.64,116.07,115.53,115.32,114.78,115.17,116.87,117.05,116.9,116.71,116.79,116.38,116.38,115.99,113.52,113.78,114.83,113.18,114.48,114.57,113.65,112.73,113.17,112.14,112.44,110.87,111.27,112.06,111.77,110.6,109.85,109.31,109.43,109.8,109.88,109.87,111.01,112.53,113.74,114.99,114.77,114.44,115.12,115.93,115.93,115.93,115.93,118.61,118.29,118.63,119,118.54,118.45,118.75,118.13,116.57,116.79,117.31,116.92,117.7,118.12,117.36,117.34,117.31,117.15,118.4,120.29,120.25,119.11,119.14,118.69,119.31,118.69,118.63,118.54,118.23,118.89,119.63,120.6,120.06,119.89,120.02,120.14,120.57,120.01,120.54,119.43,119.56,119.42,119.72,119.2,118.81,119.71,120.4,119.82,119.83,119.94,119.94,119.23,119.35,120.09,119.83,119.09,118.96,119.53,119.71,118.99,118.78,119.15,119.71,119.4,118.95,119.56,119.21,117.67,117.62,117.62,116.47,117.76,117.62,117.46,116.07,115.61,115.56,115.86,115.38,115.97,115.95,115.43,116.29,117.12,117.39,116.3,115.57,115.4,115.63,114.91,116.52,117.9,118.43,118.08,118.69,118.69,121.02,121.08,121.3,121,121.6,121.2,120.82,121.4,121.35,121.62,122.89,122.97,122.98,123.35,123.35,124.14,124.48,124.92,126.12,126.72,127.2,127.36,127.87,127.92,129.35,129.99,129.41,129.6,131.2,131.22,131.22,133.66,134.37,134.37,134.42,136.74,136.6,136.33,135.22,133.42,133.42,131.32,133.25,133.52,132.71,133.64,134.27,134.27,134.44,134.11,134.05,134.71,135.48,136.04,135.37,134.86,132.21,134.12,135.99,136.75,136.32,135.67,135.29,134.45,136.53,136.33,136.47,136.32,136.54,136.75,136.48,136.59,135.83,135.71,135.71,135.71,140.13,141.37,141.37,142.18,141.81,141.35,141.01,141.38,142.79,142.29,141.67,141.93,141.98,143.82,142.72,141.11,140.88,140.87,138.86,137.7,140.01,138.75,135.22,128.83,129.04,130.5,127.47,127.47,126.65,126.11,127.96,129.49,132.04,130.71,130.98,129.58,130.51,132.07,133.48,131.56,129.51,126.27,125.44,127.68,126.7,127.39,127.99,130.1,130.96,129.83,129.98,129.22,128.06,127.46,127.46,128.72,122.91,123.8,127.08,125.38,126.14,127.9,127.51,126.93,127.1,129.04,128.58,129.24,129.93,129.29,129.13,129.83,130.17,130.24,132.1,132.29,132.12,131.68,132.81,132.44,133.06,133.94,133.94,134.18,133.97,133.97,133.97,133.94,134.19,133.59,134.12,135.68,136.32,136.03,135.43,136.15,136.7,137.13,136.88,135.27,133.76,133.84,134.02,133.29,131.26,132.36,132.17,133.99,134.37,134.88,136.06,135.29,135.95,136.39,136.91,135.56,136.23,135.21,132.81,134.46,135.29,134.23,133.17,133.19,132.77,132.77,132.97,130.03,129.87,129.47,128.45,129.89,131.46,132.33,130.75,132.27,134.71,134.71,135.31,135.89,135.71,135.31,133.52,134.2,134.82,134.65,135.4,134.4,134.45,135.6,134.21,134.28,134.18,135.1,134.99,134.72,132.93,130.3,133.28,132.37,132.3,132.77,132.34,132.46,133.31,133.6,134.74,135.92,136,136.21,136.34,136.31,135.37,135.31,134.62,134.06,132.98,133.38,135.12,134.76,136.05,137.68,137.68,139.62,141.12,141.14,142.3,142.3,142.72,143.28,141.86,143.79,144.54,144.69,143.74,142.93,141.79,141.79,139.91,140.13,134.68,135.29,132.77,134.43,136.17,135.08,134.33,134.82,131.22,131.7,126.79,126.29,126.08,127.92,130.68,129.29,132.61,130.55,132.03,131.66,134.06,132.65,132.76,130.02,130.24,129.98,129.25,130.09,128.67,128.22,129.05,129.05,130.03,130.87,132.21,132.72,133.25,134.58,131.37,130.67,128.18,129.24,126.5,126.07,128.79,130.06,127.43,128.21,125.88,125.12,121.57,120.22,120.22,114.2,115.22,119.69,119.32,119.32,119.32,119.32,116.62,119.46,120.45,121.78,120.21,121.37,121.37,122.54,121.87,121.63,123.2,123.52,122.94,122.77,122.66,123.84,123.1,123.19,122.55,123.84,123.93,124.5,124.26,124.44,123.71,121.22,121.22,124.38,126.05,126.02,124.6,126.87,127,127.76,127.96,127.73,128.34,127.87,128.51,127.49,128.78,130.09,129.52,128.75,127.91,125.34,125.94,128.19,126.92,126.9,127.88,128.68,128.57,128.82,128.82,128.93,125.06,127.75,127.45,125.39,126.42,128.23,128.2,129.44,129.51,130.01,129.73,129.98,129.29,129.43,130.38,132.16,132.47,132.81,131.69,132.35,132.45,132.7,132.35,132.99,132.7,132.7,132.7,132.7,132.7,132.7,132.7,130.7,128.78,127.59,127.25,126.33,125.59,126.32,125.57,126.68,126.99,126.82,126.88,126.09,125.89,126.28,126.74,125.21,124.85,122.81,121.68,121.67,123.86,123.84,124.5,125.99,126.41,125.97,125.38,125.89,125.93,125.03,127.18,127.95,126.73,126.9,126.35,125.71,127.21,126.84,129.54,129.69,129,129.38,129.64,128.38,128.56,128.37,129.03,129.28,129.28,128.38,127.99,125.47,127.98,127.68,128.89,129.42,129.7,129.12,128.87,129.42,128.3,128.42,125.71,123.52,122.72,122.31,122.77,123.31,123.31,121.95,123.14,121.65,121.73,122.59,123.27,122.92,122.97,123.47,120.79,121.95,122.09,121.98,123.43,122.93,122.96,123.1,125.7,126.38,127.09,127.53,128.76,129.72,131.08,131.08,131.16,130.92,131.42,131.62,131.62,131.74,131.27,131.44,130.43,129.7,130.47,129.83,127.23,127.64,127.43,128.7,127.91,128.48,129.95,129.95,132.39,133.97,133.85,134.09,134.43,134.43,134.88,135.63,135.92,136.32,136.96,136.18,136.68,136.23,136.23,138.62,138.93,139.08,139.45,139.09,140.22,139.02,137.96,138.92,139.6,138.86,138,137.34,137.79,138.86,139.34,139.72,139.55,138.87,140.27,139.38,137.92,138.9,139.23,139.68,139.56,139.45,139.65,143.21,142.79,143.47,142.69,142.27,141.98,142.01,142.07,141.78,142.63,142.11,141.03,141.03,141.03,141.03,138.34,140.55,138.34,141.53,142.19,142.19,143.23,142.58,142.68,143.32,143.57,142.27,143.26,141.86,142.05,139.16,138.4,139.38,136.98,138.34,136.95,137.62,139.02,142.32,142.05,141.2,141.2,142.25,142.05,141.21,140.23,138.27,139.5,139.97,139.42,139.42,134.76,133.69,130.84,126.04,127.24,125.69,125.79,127.15,123.7,117.43,118.44,115.75,110.64,103.92,101.36,101.41,99.72,98.68,98.68,100.68,107.86,116.53,111.27,115.59,113.78,112.77,107.7,106.23,106.24,110.74,112.97,115.37,115.33,116.24,113.53,117.08,116.55,115,118.62,117.26,114.94,114.09,115.83,114.83,117.94,117.87,117.87,120.39,116.96,116.96,116.96,116.96,117.29,120.3,121.56,121.42,120.82,118.72,119.45,120.03,121.81,122.78,122.52,121.54,123.65,126.81,127.69,130.65,130.43,131.53,133.09,134.81,135.3,136.3,138.18,137.66,137.86,133.97,132.97,128.36,134.62,133.87,133.27,134.01,133.76,134.43,134.34,132.7,134.21,131.12,132.87,131.88,132.02,132.98,135.41,134.82,133.77,134.31,132.89,135.83,134.65,136.79,135.75,135.31,135.43,136.42,135.63,135.63,135.63,135.42,135.07,133.52,133.18,129.42,132.32,134.57,134.22,133.65,133.12,133.12,135.63,136.18,138.6,138.84,137.69,137.42,137.77,136.4,136.64,137.03,138.88,138.85,138.36,136.42,137.95,137.94,138.59,139.89,138.34,137.65,138.75,137.31,138.52,139.54,140.45,139.83,139.95,139.02,139.26,139.26,139.26,139.18,137.64,138.33,140.17,140.33,138.22,138.22,137.29,138.98,139.7,139.64,140.97,140.81,140.45,140.7,140.85,140.14,139.56,141.12,140.5,140.93,139.94,140.19,140.06,140.01,139.61,139.09,136.98,138.88,138.88,141.26,143.7,145.02,148.08,148.48,151.12,152.14,151.34,154.44,155.09,153.38,152.82,152.18,152.18,155.99,156.77,158.2,158.84,157.58,159.69,159.77,159.82,159.48,158.26,157.78,159.88,159.51,158.89,159.37,159.1,159.51,159.81,159.55,159.26,157.6,158.13,158.98,158.91,160.09,164.35,163.61,163.61,162.5,161.91,161.29,163.88,167.75,167.75,167.9,169.64,171.09,170.02,168.37,170.7,170.04,171.43,170.69,171.82,170.18,170.71,168.1,164.92,167.47,169.08,170.78,168.96,171.57,175.2,175.9,176.24,176.24,175.98,179.35,181.63,180.59,180.25,178.95,179.78,179.78,176.89,179.85,172.68,176.84,175.32,176.22,172.47,172.08,171.35,173.05,173.1,174.15,177.16,177.46,178.38,178.33,180.14,177.61,173.92,172.86,169.34,171.27,173.94,175.18,175.46,173.95,175.2,177.98,179.38,177.04,177.24,177.11,177.46,176.1,177.36,176.59,176.72,176.96,176.97,173.48,169.95,174.01,173.01,173.64,172.84,173.21,173.21,171.77,171.77,171.77,171.77,174.86,175.02,175.97,170.55,167.8,163.63,167.43,165.88,169.35,167.19,167.51,168.82,169.1,170.23,170.75,170.2,173.77,172.05,171.78,172.56,173.23,172.54,173,172.67,172.05,172.64,172.58,173.85,175.51,174.62,172.99,172.67,166.99,172.19,172.14,172.14,173.28,173.17,171.77,171.64,171.14,171.59,170.49,170.76,169.11,167.63,166.57,170.31,171.2,170.55,168.59,166.94,164.85,163.28,164.23,164.23,164.23,165.93,166.75,164.43,165.63,162.65,165.62,164.79,164.44,165.3,165.85,165.85,166.26,167.34,167.01,166.79,164.08,163.49,164.45,162.64,161.04,163.91,165.33,165.28,165.39,164.78,165.67,167.46,169.61,170.16,173.65,176.82,178.35,179.93,178.89,181.12,181.51,182.84,181.9,180.77,181.83,181.83,177.89,176.7,176.7,180.33,180.28,179.94,176.13,175.58,171.52,169.57,165.86,164.11,165,167.21,169.89,168.3,167.76,170.21,173.29,173.04,174.17,174.41,171.15,171.72,170.5,173.52,173.47,171.81,172.24,176.74,175.99,175.99,177.62,176.53,175.91,174.59,173.52,174.54,176.52,177.52,177.7,176.99,176.45,177.33,177.5,177.5,174.69,175.86,171.4,168.62,165.86,166.54,165.45,167.1,166.49,169.64,172.05,171.25,169.53,170.74,169.5,169.66,173.28,170.18,166.55,170.01,170.27,171.68,171.59,170.96,173.3,172.33,171.64,171.64,171.64,174.68,174.86,169.83,169.78,169.78,168.25,171.49,169.84,167.66,168.91,168.46,163.75,165.57,164.07,164.47,161.74,161.03,156.01,159.28,160.97,161.43,164.14,162.4,163.58,162.44,162.66,164.42,165.11,165.11,161.44,160.16,163.71,162.35,161.69,160.43,157.68,157.68,154.83,157.84,158.14,160.04,157.34,158.44,154.91,150.36,147.79,147.35,153.15,150.01,150.87,151.1,153.58,158.89,159.93,159.93,162.3,167.16,167.58,167.82,166.59,168.43,167.09,165.86,164.93,165.35,165.66,163.05,160.3,160.88,159.9,157,160.03,161.99,161.52,159.77,160.87,162.26,164.26,161.59,158.52,159.17,157.3,160.05,160.05,159.88,159.88,159.88,159.88,160.98,156.9,156,156.27,153.5,157.55,158.26,158.93,160.43,157.4,159.41,160.97,159.46,159.04,158.61,159.66,163.16,162.63,163.69,163.43,165.5,166.42,166.59,168.32,168.39,165.88,160.89,158.75,156.94,157.57,154.78,153.64,156.47,155.89,156.02,157.93,160.19,161.26,159.8,157.34,154.62,155.92,157.52,155.64,157.92,158.08,159.84,157.01,157.85,158.84,159.7,159.7,160.73,165.02,165.75,166.41,165.13,164.87,165.23,165.82,165.74,166.88,164.51,165.38,166.52,167.97,168.41,166.92,165.85,165.85,170.18,172.12,172.1,174.21,172.54,172.47,171.66,169.62,168.79,169.78,170.75,166.2,168.09,167.47,164.9,164.84,164.65,164.7,163.53,167.31,168.2,170.15,170.59,165.84,166.18,164.35,164.35,165.07,162.83,161.88,161.88,157.57,158.41,156.04,157.52,154.63,156.29,160.91,161.68,162.82,161.65,161.65,157.39,157.37,156.41,161.5,159.62,161.89,162.5,161,160.31,160.81,162.45,163.54,163.02,161.59,164.46,165.01,164.92,164.92,162.15,164.11,166.16,165.23,163.62,168.49,166.7,166.86,167.09,166.51,166.33,166.59,167.61,167.61,169.21,168.61,167.89,167.09,166.74,168.27,165.6,165.85,166.24,165.05,164.39,166.33,165.98,166.65,167.85,167.23,164.1,162.38,158.39,157.31,158.03,156.4,157.42,157.67,157.03,155.56,155.56,155.56,155.56,153.31,153.93,154.84,154.84,156.05,157.66,157.68,155.71,153.94,155.83,159.72,157.42,158.3,160.4,162.74,163.32,163.12,163.24,163.54,162.91,163.03,163.36,164,165.1,165.05,164.58,164.44,164.96,163.51,164.55,163.95,165.11,164.02,164.13,163.78,161.58,161.58,163.66,163.49,163.62,164.04,163.94,166.49,168.34,168.77,169.57,170.64,167.78,165.93,162.28,162.33,161.02,162.95,160.64,160.64,163.74,163.46,163.26,163.8,164.05,166.23,165.63,167.17,168.04,168.64,165.81,163.78,164.05,164.74,166.47,167.42,167.86,169.86,169.99,170.85,170.54,170.84,170.29,170.46,170.62,169.41,169.65,172.03,173.62,173.83,173.83,173.83,173.83,172.59,174.33,173.61,173.64,175.2,176.62,177.91,179.4,182.27,183.66,185.32,184.56,182.92,183.62,184.31,186.2,186.76,184.14,185.69,187.93,192.06,193.79,190.25,188.63,192.35,193.36,196.84,199.73,199.62,200.94,198.94,199.05,200.16,198.31,195.43,194.93,193.98,197.89,198.13,197.86,201.22,199.25,198.75,195.38,193.08,191.9,191.98,190.43,193.27,193.1,193.1,193.71,196.11,193.69,192.58,194.95,194.84,194.75,196.08,195.29,197.76,199.57,194.99,191.72,191.92,192.29,193.02,191.99,193.59,193.59,191.13,192.19,189.38,188.54,187.49,188.18,189.91,190.83,192.48,188.53,191.78,192.12,192.76,194.46,195.01,196.37,196.95,198.17,196.68,194.39,193.56,195.4,194.98,197.73,199.91,199.91,198.18,196.87,194.17,193.17,194.81,192.65,192.99,190.01,189.92,189.34,186.23,181.99,185.26,184.78,184.78,189.26,190.39,193.72,192.65,188.74,191.01,191.02,187.37,186.35,184.8,185.18,186.42,182.43,184.76,183,183.97,188.39,190.47,190.47,194.99,192.39,191.76,194.62,194.16,194.26,194.92,199.83,199.26,200.22,199.04,198.84,199.42,199.42,200.46,199.4,199.16,198.65,199.63,199.3,198.11,195.39,199.39,195.89,192.6,195.49,195.8,196.29,194.86,196.55,195.29,198.04,200.76,197.57,197.74,198.24,198.55,200.79,199.95,199.5,199.5,199.5,198.45,198.98,198.98,201.28,205.33,208.95,212.09,214.03,212.34,211.5,211.43,214.4,217.88,217.7,215.96,216.02,213.13,214.78,215.01,216.32,214.68,215.56,216.73,215.57,215.33,219.76,219.96,219.96,226.32,224.77,227.48,229.44,229.34,228.71,228.1,233.09,233.09,233.89,233.93,233.74,233.49,237.93,239.11,239.04,239,236.07,236.61,231.43,231.29,230.69,231.35,230.76,236.91,238.48,238.48,243.32,243.76,240.93,240.83,243.01,239.46,240.66,237.29,237.5,235.19,237.11,232.45,234.57,237.11,235.97,235.14,235.62,233.89,229.35,226.31,227.01,220.98,223.19,223.87,229.28,224.32,226.15,226.15,228.96,228.17,227.95,227.95,227.95,231.52,227.74,226.98,227.9,227.61,228.66,228.84,232.02,231.23,232.91,232.18,230.22,233.11,230.39,231.9,231.64,229.86,226.86,229.45,232.04,231.53,229.46,230.73,230.62,232.73,233.3,231.76,230.83,231.39,227.15,229.41,229.94,230.31,230.09,231.33,233.53,236.48,234.54,235.98,236.26,238.91,241.92,243.91,243.9,243.12,247.88,249.38,251.72,245.56,245.56,246.06,245,239.21,238.84,236.07,236.04,233.42,225.76,224.56,229.33,229.67,233.11,227.29,214.08,187.54,206.72,209.19,207.65,208.8,208.8,216,217.25,218.95,226.91,222.89,226.91,226.25,227.8,228.71,227.19,228.26,228.75,228.7,230.4,230.72,230.63,220.86,218.53,216.95,215.9,215.56,212.35,219.58,218.08,218.08,215.83,216.88,221.5,224.89,224.89,226.18,225.76,232.06,237.44,226.06,230.42,225.4,229.83,230.33,234.48,232.13,234.16,234.77,236.11,236.11,237.93,233.57,231.97,232.39,232.23,228.99,227.16,227.39,226.02,230.15,231.93,234.15,232.98,226.86,226.86,229.37,235.36,234.77,235.48,235.68,234.74,230.84,229.73,230.37,227.85,229.01,228.64,226.69,228.23,231.19,229.17,227.34,228.62,227.78,229.6,233.98,234.15,234.86,233.04,233.46,234.69,234.72,237.56,235.3,235.23,234.67,232.99,231.39,230.72,233.46,232.72,233.28,235.89,240.14,237.83,237.83,237.83,237.83,234.33,238.96,238.35,236.11,233.63,233.63,229.37,229.19,229.95,229.23,231.92,232.67,236.35,238.22,238.06,235.87,232.6,234.97,235.56,235.91,229.64,231.3,231.49,232.9,231.23,231.31,231.31,232.28,235.25,233.39,233.54,234.11,233.48,230.58,231.17,231.17,227.96,227.39,228.07,221.5,225.26,222.55,223.07,224.78,219.9,220.74,219.34,219.5,219.32,220.89,222.94,225.62,225.06,225.06,224.61,224.2,225.23,226.7,225.35,221.29,212.33,212.38,212.98,207.08,201.38,185.62,196.81,189.06,206.32,200.22,202.59,204.29,202.22,204.94,207.05,204.36,204.01,207.87,208.89,212.86,213.66,213.66,214.89,217.31,219.57,219.57,219.57,219.26,220.15,223.58,224.42,227.63,227.3,225.08,225.07,223.55,223.73,222.36,220.49,221.53,223.75,224.89,224.88,229.12,226.33,223.38,223.24,225.03,223.88,225,227.07,227.8,229.05,227.57,225.55,228.39,229.74,231.81,229.45,228.94,228.65,231.25,232.15,235.98,239.36,241.37,238.38,237.04,237.18,237.33,236,236.61,237.4,236.35,235.9,235.24,236.54,236.45,237.87,237.38,237.38,237.12,245.44,249.35,247.14,244.41,242.48,242.36,244.84,243.23,240.19,241.74,243.2,244.78,249.31,249.31,254.67,257.98,254.25,258.6,260.6,259.6,255.68,254.02,254.16,255.2,252.74,253.49,255.32,254.67,251.51,252.23,250.02,253.84,256.46,260.18,259.08,261.34,264.53,266.89,266.89,267.69,267.02,270.08,268.54,271.21,271.21,272.03,272.77,270.38,268.53,267.87,265.59,267.89,272.86,285.82,285.86,284.57,289.61,286.68,286.68,279.28,284.2,287.81,283.66,293.22,294,293.95,289.98,293.9,301.13,299.38,305.87,305.98,312.45,312.45,307,299.34,303.34,299.72,303.51,303.1,304.42,305.72,300.32,300.01,290.34,289.36,297.03,289.88,289.88,290.08,295.45,299.07,299.59,293.92,293.92,297.27,304.21,301.01,301.55,301.98,301.67,298.96,303.06,299.08,294.4,295.17,292.12,295.14,300.47,300.54,300.13,300.51,302.55,301.22,300.1,300.1,300.1,309,313.09,309.77,304.74,309.64,309.64,319.23,323.96,322.58,321.54,319.44,315.91,314.62,320.07,321.01,315.28,317.95,318.1,318.2,317.89,313.91,326.22,323.67,320.84,323.43,336.01,343.68,343.68,343.62,339.46,338.65,337.22,340.66,342.6,338.77,338.77,341.72,349.24,350.26,350.84,346.11,335.51,323.39,329.54,331.58,314.34,323.4,328.03,324.62,320.85,320.44,320.14,329.31,318.18,318.18,307.11,311.5,320.43,319.56,318.18,309.32,304.42,320.37,312.76,316.7,318.43,318.52,335.68,333.22,339.35,336.84,345.04,346.57,354.82,348.61,350.69,353.81,355.22,352.57,356,360.89,357.2,357.2,353.43,354.79,354.79,354.79,354.79,374.59,373.87,372.11,374.04,377.2,373.51,366.09,362.56,360.97,356.53,367.73,377.6,388.44,387.48,387.5,385.67,395.42,399.03,397.84,407.78,402.23,396.97,381.68,389.98,382.61,382.83,393.58,413.24,413.76,416.72,423.59,424.76,431.34,416.04,412.39,431.41,413.5,414.14,417.68,420.14,409.75,415.78,415.74,406.92,398.34,403.86,408.71,400.87,403.85,409.86,398.44,382.38,382.38,394.84,394.15,395.98,385.18,387.09,371.79,366.24,368.82,383.7,380.08,381.28,395.25,391.57,391.12,399.24,399.24,402.55,407.22,409.64,412.66,402.17,389.44,394.75,393.56,390.65,392.6,395.02,394.25,395.88,395.32,394.74,383.48,382.82,387.62,395.84,389.1,388.35,389.11,381.61,378.51,378.46,381.08,382.35,387.61,387.61,387.61,387.61,390.56,395.63,392.73,390.37,397.95,411.09,407.23,416.99,421.38,417.52,411.6,411.53,411.53,411.53],"S&P500":[null,100,99.7,100.31,100.53,100.39,100.38,100.86,100.48,100.3,100,99.69,99.68,99,98.36,97.92,97.76,99.93,100.31,101.42,101.62,101.48,101.46,102.22,102.06,102.54,102.29,103.06,103.28,103.36,103.36,103.77,103.22,103.36,103.09,102.72,102.76,103.36,103.72,105.08,105.31,105.93,105.81,106.5,105.64,106.05,105.86,106.07,106.46,106.2,106,106.13,106.13,106.37,105.48,105.45,104.96,104.96,105.85,106.46,106.38,106.75,106.37,106.37,106.67,106.44,106.64,106.64,106.32,106.51,106.13,106.49,106.2,106.9,107.75,107.67,107.58,106.93,106.84,106.87,106.93,107.71,107.48,107.51,107.58,108.2,108.59,109.15,109.59,110.14,110.04,110.23,110.23,110.9,110.78,110.82,110.99,111.1,110.81,112.33,111.67,111.73,111.36,111.04,110.78,110.87,111.23,111.27,110.9,111.83,111.65,111.5,111.27,109.89,110.1,109.99,109.89,109.78,110.58,110.7,111.02,110.77,110.59,110.65,110.31,110.53,110.43,110.51,110.35,109.94,109.19,109.19,110.13,109.81,109.62,110.45,110.11,111.31,111.98,111.93,111.99,111.78,111.97,112.1,111.96,112.03,112.49,112.49,112.37,112.5,112.26,112.09,112.63,112.55,110.5,110.91,111.66,112.24,112.44,112.72,113.23,113.26,113.26,113.12,113.07,113.93,114.35,114.21,113.89,114.07,114.1,114.01,113.9,114.41,114.3,114.04,114.07,115.02,114.25,114.19,114.14,114.31,114.35,113.43,114.43,113.44,113.62,113.88,113.88,114.04,112.98,113.7,113.8,113.72,114.55,114.76,115.3,115.29,115.36,115.98,115.96,115.92,115.8,116.13,116.17,116.05,115.9,115.81,116.1,116.16,115.9,116.12,116.31,116.03,115.99,114.31,114.46,115.61,115.55,115.71,113.93,113.72,113.85,114.98,114.58,114.35,114.54,114.59,114.69,115.22,115.88,116.11,116.11,115.23,115.59,115.57,115.4,116.65,117.04,117.13,117,117.22,117.39,117.52,117.59,117.24,117.31,117.05,117.06,117.54,117.68,118.11,118.57,118.83,118.98,119.65,119.52,119.3,119.58,119.8,119.59,119.7,119.91,119.99,120.08,120.12,120.73,120.25,120.45,119.89,120.04,121.01,120.62,120.74,120.93,120.95,121.33,121.48,121.46,121.63,121.17,121.07,121.18,120.9,120.24,121.22,120.9,121.06,121.85,121.76,121.76,122.01,121.96,123.16,123.12,124.13,123.87,123.74,123.28,123.27,123.63,124.31,124.71,124.9,124.84,124.33,125.45,126.12,125.71,125.61,125.86,125.8,125.8,125.67,125.77,126,125.35,126.39,127.2,127.71,128.61,128.82,128.99,128.84,129.75,130.63,130.63,130.17,131.39,131.18,131.75,132.82,133.11,133.03,133.11,134.69,133.78,132.32,132.39,132.3,129.5,124.19,126.36,125.72,121,122.81,124.52,124.85,126.52,128.05,128.09,128.09,127.35,126.65,126.77,128.8,130.32,128.66,127.23,125.54,126.17,127.57,127.9,127.84,128.41,130.64,130.48,129.65,128.9,128.8,129.02,127.19,127.38,127.14,123.94,121.34,124.64,122.49,122.13,123.81,123.81,121.05,122.57,123.99,124.84,122.1,122.51,124.56,123.87,124.9,124.53,125.54,126.88,126.99,126.26,125.18,125.19,123.52,123.74,125.03,125.17,124.15,124.46,123.57,123.29,124.87,125.3,125.27,126.48,127.67,127.88,128,127.12,127.64,127.53,127.19,128.13,127.73,128.14,127.88,127.58,127.58,126.11,127.71,126.83,128.21,128.78,128.87,129.98,129.88,130.29,130.43,130.66,130.13,130.45,130.32,130.04,129.52,129.74,128.92,129.16,127.38,127.66,126.57,127.35,127.44,127.84,127.2,127.2,128.3,129.39,130.53,130.98,130.05,131.19,131.33,131.2,131.72,132,131.48,131.36,131.6,132.23,133.43,133.03,132.15,131.39,132.04,131.9,132.55,133.16,133.63,134.01,133.98,133.78,132.83,132.3,133.15,132.13,133.18,133.62,133.95,134.22,134.17,133.94,134.77,135.81,135.84,136.62,136.01,136.03,136.03,135.81,135.43,134.93,134.63,134.89,135.39,135.44,136.16,136.19,135.43,136.16,136.33,137.4,137.35,136.87,136.69,136.24,136.62,136.62,137.11,137.06,137.16,136.04,135.28,135.23,135.04,130.6,127.91,129.73,128.96,131.74,131.7,129.81,129.76,129.2,128.49,124.53,126.84,124.65,123.83,125.77,127.13,128.48,127.66,128.38,129.18,131.92,131.59,130.38,127.81,127.62,126.66,128,128.28,126.15,123.86,124.24,124.24,123.42,125.34,125.75,128.64,128.36,129.4,130.82,126.59,126.59,126.39,123.45,123.66,123.62,124.29,124.26,121.89,119.36,119.37,117.53,115.68,113.3,110.23,110.23,115.69,116.68,116.54,117.53,117.68,114.76,118.7,119.54,120.7,121.19,121.74,121.72,121.08,122.38,122.65,123.58,125.21,125.21,123.44,123.71,123.88,124.93,123.95,123.77,125.7,126.78,126.89,127.75,128.35,128.07,126.87,126.95,127.04,128.68,129.07,128.73,130.13,130.13,130.32,130.55,130.09,130.93,131.09,130.99,130.91,130.54,131.44,130.93,130.79,129.93,128.88,128.6,130.49,130.87,131.78,131.67,132.33,132.82,132.8,132.41,133.84,131.31,131.19,132.14,131.52,132,132.88,134.42,134.42,134.71,134.99,135.62,135.76,134.94,135.41,135.41,136.31,136.22,136.29,135.98,136.2,136.2,136.33,137.54,137.24,137.19,137.83,137.98,138.11,137.07,136.78,138.1,137.48,135.21,135,134.59,135.09,131.83,132.88,133.66,134.85,134.06,133.16,134.29,133.91,132.31,132.49,132.49,131.38,130.48,130.75,129.02,128.67,131.43,132.5,133.31,134.71,135.34,135.29,135.01,135.57,135.35,135.48,136.79,137.2,138.5,138.33,138.09,136.77,136.61,137.13,137.92,138.98,139.38,140.45,140.45,140.2,139.52,139.69,140.32,140.64,141.29,141.32,140.84,139.92,140.42,139.55,139.95,140.9,141.57,140.82,141.86,141.63,141.27,139.73,138.47,137.46,133.37,135.11,135.21,137.75,136.83,135.15,137.19,133.18,133.5,135.43,137.07,135.98,137.11,137.04,133.48,134.95,134.51,135.39,137.11,137.2,137.2,136.25,137.73,139.52,139.65,139.64,139.68,140.69,141.1,140.99,140.55,140.92,140.96,140.97,140.28,140.26,139.08,139.94,139.6,138.86,139.56,137.85,135.38,136.46,138.4,137.78,135.63,136.87,137.75,139.25,139.06,140.45,140.16,140.55,140,140.96,140.46,140.86,141.13,141.71,142.5,142.38,142.84,142.41,143.79,144.32,144.15,144.25,144.64,145.01,144.73,144.95,145.06,145.18,146.3,146.37,146.28,145.73,145.5,145.82,146.91,147.24,147.85,147.85,147.26,145.99,145.02,145.93,146.15,147.49,147.02,146.86,147.29,148.55,148.56,149.62,149.67,149.61,150.28,151.02,151.15,151.12,151.12,151.9,151.9,151.02,151.47,152.74,151.66,152.19,151.77,152.51,153.53,153.09,154.16,153.92,154.21,155.5,156.1,156.1,155.69,155.73,155.91,154.5,152.07,153.6,153.47,153.95,151.22,152.32,154.6,156.34,156.86,156.01,157.16,157.42,158.44,158.18,158.47,158.47,158.01,158.75,158.15,156.48,151.24,146.66,146.1,139.65,138.5,144.88,140.81,146.75,141.77,139.35,128.77,135.13,128.52,116.3,127.1,111.87,118.58,112.43,112.96,108.06,104.9,114.74,116.06,123.3,119.15,123.14,121.17,115.82,118.47,116.67,124.88,124.68,128.93,130.79,130.79,129.47,133.43,130.49,131.25,134.77,132.36,128.3,131.24,131.17,132.99,134.95,134.24,137.81,136.54,132.71,133.28,134.48,133.54,135.08,137.36,137.38,134.56,132.21,133.73,134.26,138.49,137.04,139.32,138.23,138.56,138.56,140.26,142.34,142.04,142.73,143.26,144.44,146.41,145.92,149.74,151.54,150.36,149.56,140.75,142.59,143.77,146.5,145.97,146.06,145.23,146.17,146.8,143.01,144.58,141.07,143.14,145.35,146.08,146.74,146.74,149.07,147.46,148.62,147.78,149.32,147.93,149.91,151.27,150.75,151.18,152.46,152.71,153.59,151.7,150.76,151.87,150.89,152.76,152.19,153.36,154.46,155.02,156.02,157.02,157.12,157.55,156.29,158.48,158.16,158.13,158.56,158.92,158.22,158.72,159.27,160.87,161.45,163.09,163.37,164.47,164.1,165.34,167.88,161.98,160.67,160.67,156.21,159.35,156.55,156.63,158.63,159.46,158.72,157.39,155.63,153.83,155.44,151.76,152.21,154.64,157.13,156.38,157.67,158.5,156.98,159.8,157.57,160.31,161.6,163.02,165.69,164.65,163.56,163.31,163.33,160.66,161.42,161.07,161.91,162.47,159.45,158.96,153.35,155.19,153.3,155.19,157.96,161.44,164.58,164.53,166.46,166.22,167.5,165.82,168.08,170.04,169.22,167.27,167.93,166.79,167.73,170.44,170.17,170.17,170.58,169.79,171.71,172.01,171.91,173.42,173.09,173.57,172.19,171.97,171.75,171,173.21,173.52,174.52,173.91,173.23,172.87,173,173.61,173.61,175.12,174.73,174.97,176.09,173.5,174.73,175.72,178.33,179.31,178.14,178.21,178.62,177.95,176.67,176.67,178.1,180.59,180.64,180.1,180.75,180.48,175.85,177.56,174.13,176.93,179.39,179.57,181.52,182.23,183.57,183.37,183.31,183.61,184.48,184.48,184.37,184.31,183.5,183.16,181.74,181.97,184.04,179.53,178.68,182.93,181.45,179.08,176.68,180.12,179.16,181.69,182.79,184.69,184.87,186.07,185.78,186.32,183.57,183.46,184.75,183.34,182.33,183.29,186.34,186.18,185.59,186.26,188.46,188.46,191.18,191,191.28,192.09,193.57,193.53,194.17,193.38,195.52,196.23,195.19,193.86,195.66,193.86,195.98,196.33,196.29,196.12,197.45,196.02,196.56,195.25,195.39,196.98,198.44,196.37,194.66,190.49,192.81,195.68,195.19,193.52,192.95,194.99,194.84,196.77,196.35,196.72,196.95,197.1,197.1,197,197.29,196.57,198.31,198.15,198.19,197.82,198.74,199.13,199.49,199.09,198.02,197.93,195.33,198.07,199.08,198.87,200.02,200.69,201.16,201.21,201.48,202.53,204.05,204.05,203.64,204.32,202.57,204.86,205.56,204.84,205.08,204.41,202.87,199.65,202.68,204.35,204.76,206.84,207.33,206.35,206.31,207.18,206.06,205.68,207.37,206.41,207.65,208,207.8,208.01,208.27,209.14,209.47,210.02,208.54,206.3,206.56,208.24,210.01,210.33,210.79,209.57,211.41,212.32,212.04,212.1,212.7,212.63,212.63,211.91,211.63,210.66,209.03,209.51,208.3,210.07,209.74,207.83,204.3,204.14,206.08,208.58,208.89,208.31,204.06,204.38,201.95,204.27,201.62,203.74,204.58,206.27,205.88,204.46,203.97,204.59,208.08,209.63,210.34,211.89,212.67,213.31,213.08,214.09,214.48,213.4,215.49,215.91,216.3,217.1,218.5,219.41,220.23,220.43,219.66,217.85,217.97,219.54,219.54,220.39,219.82,220.56,220.25,219.55,219.91,220.42,220.42,215.41,218.25,214.11,211.58,214.59,212.77,215.27,219.73,220.41,218.82,220.91,218.89,217.26,220.81,218.88,216.63,214.16,217.97,220.19,221.56,221.56,224.62,224.4,224.71,224.04,223.45,224.88,224.73,220.38,220.16,219.27,218.96,220.96,221.58,218.43,218.61,218.61,214.59,212.51,210.16,206.19,206.76,204.24,203.94,202.84,207.78,211.7,213.15,215.16,209.91,211,210.22,211.98,215.06,211.16,207.16,206.36,209.62,209.8,205.36,203.89,203.89,201.82,198.1,201.07,205.56,205.06,201.89,205.65,204.57,202.95,196.96,195.53,200.56,199.7,197.11,195.65,199.84,204.31,206.83,209.24,209.15,211.52,208.92,211.92,212.99,214.51,217.14,215.78,212.4,213.12,214.85,212.15,210.09,210.98,210.42,206.87,206.16,208.47,205.94,205.94,205.89,209.2,209.07,205.99,200.27,201.41,195.74,196.16,201.01,193.72,194.82,195.76,201.6,194.42,193.31,187.12,187.58,184.49,184.25,188.65,187.91,191.7,183.95,182.88,182.91,186.3,184.79,186.53,190.24,194.95,194.95,193.73,192.28,195.82,192.62,193.22,195.06,192.96,188.37,182.88,175.79,175.13,177.69,171.91,172.29,172.29,176.5,176.27,177.95,183.39,182.85,179.16,179.04,177.47,179.34,179.34,179.63,180.27,182.97,182.81,180.71,179.04,178.24,177.7,181.12,179.6,184.56,185.65,187.48,185.73,185.98,183.83,188.64,190.93,193.64,193.09,191.81,194.81,194.65,194.34,194.1,193.27,197.39,197.25,200.67,201.46,201.84,200.38,200.83,198.24,194,193.57,194.13,196.87,190.23,188.97,186.88,185.42,185.98,183.98,183.98,183.23,186.59,187.82,190.69,192.71,184.38,185,182.91,181.59,182.84,180.78,177.68,176.18,173.15,171.36,171,174.36,170.68,168.1,172.45,177.73,177.37,175.55,170.64,169.36,168.25,167.7,172.06,167.98,172.43,174.4,173.24,171.86,175.94,178.03,180.93,179.59,178.5,182.89,181.53,180.78,176.26,174.4,176.77,178.47,179.47,175.74,185.49,187.2,185.53,187.14,185.6,185.03,185.91,185.18,187.7,188.81,188.81,188.76,185.84,185.54,191.29,191.12,190.89,187.48,184.78,184.43,185.82,184.45,187.09,188.45,187.31,182.64,180.61,178.98,179.17,181.83,179.2,180.26,180.26,179.53,177.37,180.46,180.01,180.01,179.29,180.64,178.53,182.61,182.47,183.75,186.11,186.74,187.49,187.49,187.11,184.2,182.79,186.25,188.46,188.33,188.29,190.36,190.84,188.36,191.12,193.12,195.96,193.93,192.74,195.22,193.06,191.35,191.77,193.97,193.91,194.45,191.77,191.24,191.24,187.41,187.11,188.11,186.13,186.7,186.13,185.25,186.66,189.67,189.8,186.89,187.16,183.7,181.04,180.77,183.75,182.46,185.67,183.62,185.26,187.67,184.58,185.13,186.17,186.48,186.18,188.83,189.91,192.66,193.37,192.25,191.77,192.45,192.45,192.65,192.64,191.84,194.39,193.98,194.63,194.79,194.78,193.62,193.79,193.96,190.89,190.16,193.88,195.48,195.4,193.14,191.79,190.4,193.92,194.01,193.12,193.98,193.65,193.35,193.92,192.68,194.97,196.82,196.53,196.56,194.36,192.93,194.62,197.16,197.16,197.17,195.96,197.89,200.77,200.37,200.84,200.07,201.31,201.54,203.42,204.83,205,207.5,206.73,206.73,205.75,204.68,205.44,203.86,202.95,205.27,205.2,206.12,208.65,208.89,208.89,208.48,206.83,206.23,206.73,208.12,209.67,211.44,211.23,212.04,213.55,214.05,212.61,212.68,213.53,214.14,214.1,212.73,214.83,215.14,214.57,211.6,211.06,209.94,211.84,210.94,209.46,209.51,209.29,210.49,208.06,206.49,204.89,204.86,206.27,205.7,207.97,205.17,206.55,207.85,210.86,211.67,211.33,211.71,211.71,210.82,209.35,208.68,208.98,210.38,209.19,209.45,211.21,208.64,208.79,208.34,206.39,203,202.54,203.35,200.35,200.4,201.58,201.04,201.05,198.29,199.9,199.64,201.99,203.27,204.33,205.2,203.92,202.9,205.05,205.03,202.28,200.56,198.04,197.71,199.14,196.29,193.96,193.03,195.35,196.62,198.68,202.43,204.33,204.69,205.27,205.48,203.82,207,206.83,210.77,211.11,211.36,211.63,213.19,212.76,213.63,213.63,213.75,213.34,213.55,213.34,214.15,215.41,214.24,214.12,213.29,214.99,215.87,216.71,217.71,220.68,221.27,221.25,222.25,223.55,220.27,222.54,222.91,222.91,223.85,224.17,224.26,223.62,222.36,220.57,219.82,220.22,223.33,223,224.26,224.11,224.28,224.28,223.44,222.19,224.14,226.9,227.4,228.07,228.25,229.45,229.3,231.03,230.9,227.18,230.02,232.47,231.73,232.27,234.18,234.32,235.66,235.44,232.22,234.44,235.81,234.67,234.67,233.27,233.56,238.49,238.58,237.67,238.08,237.68,238.93,240.84,240.55,238.1,239.33,241.79,240.21,239.94,242.63,242.16,241.47,239.9,241.42,242.78,244.94,245.74,245.39,244.64,243.96,246.06,246.34,246.34,245.84,244.06,244.33,241.32,243.99,243.9,244.25,241.95,243.75,240.2,237.31,236.82,235.46,234.94,232.88,234.91,237.72,237.77,236.68,239.1,239.86,236.09,235.28,237.42,240.4,242.89,243.21,243.21,244.45,244.85,244.79,245.98,248.86,248.34,248.63,248.86,249.48,248.81,246.97,248.7,248.7,248.76,246.93,245.45,247.42,247.7,248.07,251.01,250.96,250.68,251.33,252.01,254.15,254.75,254.65,256.6,257.25,257.25,256.6,256.2,255.41,256.42,256.82,257.05,256,256.69,258.28,259.59,259.59,261.01,261.27,261.46,264.13,261.82,263.26,264.01,265.69,261.99,259.95,258.09,260.87,260.47,254.44,253.13,255.94,256.15,254.88,258.9,255.36,250.66,243.15,245.67,243.77,249.38,250.55,250.56,254.78,255.76,259.88,260.4,262.93,262.41,263.52,261.17,264.17,263.33,263.75,262.18,262.17,264.81,264.81,259.21,258.8,258.02,253.56,256.5,257.65,260.39,262.34,263.76,264.09,264.16,263.4,267.87,267.35,268.1,268.78,268.28,269.36,269.02,270.16,267.64,267.68,267.23,269.63,267.04,269.63,271.55,270.98,272.62,274.73,272.64,273.91,273.86,274.95,274.45,274.32,271.8,272.38,272.3,273.02,273.46,272.56,267.49,268.58,267.83,271.11,277.97,280.04,281.09,281.36,280.55,280.61,278.91,275.23,276.31,277.4,277.41,278.89,279.86,280.7,282.31,281.24,281.24,282.81,283.51,283.64,285.35,284.82,285.53,283.77,282.93,285.24,283.7,283.69,284.77,283.67,275.3,275.06,278.05,280.08,283.17,283.17,283.06,279.93,276.93,275.75,275.13,278.6,280.14,277.03,277.46,277.46,273.19,273.62,273.93,278.95,278.36,281.14,281.14,283.61,285.35,286.86,286.04,281.87,284.47,283.14,284.63,283.2,281.04,283.07,284.18,285.21,282.52,284.41,284.51,283.73,286.69,286.67,286.67,287.37,288.05,286.81,281.91,280.51,279.2,279.24,274.81,279.16,274.25,270.9,273.92,269.04,270.52,263.23,261.23,262.51,258.86,264.37,266.07,263.23,266.07,265.49,265.71,270.4,270.83,267.8,266.92,261.65,263.1,264.09,265.87,253,237.89,237.33,233.61,255.83,246.98,251.45,253.45,253.01,247.34,247.67,247.67,241.83,247.9,252.04,257.14,259.04,259.2,260.71,261.09,262.74,266.61,264.91,262.87,264.01,265.54,265.35,273.99,275.98,276.26,277.4,279.35,279.59,278.51,274.01,273.89,272.05,272.05,277.62,276.07,277.18,277.16,278.29,279.91,279.93,278.45,281.31,281.57,283.12,282.34,283.42,280.22,282.85,280.49,280.4,280.4,279.79,282.48,285.62,285.62,287.91,289.41,290.91,290.58,291.96,294.39,294.39,292.08,291.87,293.64,294.45,293.47,293.89,292.72,293.66,295.24,295.21,295.62,295.81,298.12,298.33,299.52,299.57,298.68,298.31,297.21,292.46,296.77,295.32,297.47,297.24,299.56,298.8,302.2,303.17,303.26,302.38,302.35,300.58,299.85,298.65,303.19,301.89,303.14,303.87,304.83,302.87,302.87,300.78,302.31,304.84,303.87,304.51,305.33,306.24,308.84,308.69,310.14,309.74,309.44,310.92,312.44,313.82,312.09,311.21,309.65,311.48,312.3,313.57,314.64,314.83,314.85,316,314.8,316.63,315.76,307.2,311.99,311.5,312.76,310.79,312.43,315.76,315.77,314.09,315.92,318.41,322.33,323.06,323.05,319.85,320.69,321.24,317.47,318.63,315.07,315.46,320.32,320.99,321.19,315.87,315.71,312.82,310.24,311.4,306.56,309.57,314.35,317.2,319.39,319.39,321.1,319.39,320.18,321.13,321.48,322.1,320.98,320.7,322.87,323.54,320.09,319.58,318.81,315.12,317.62,320.42,322.48,323.95,324.99,324.99,324.89,323.76,323.31,320.94,321.54,323.59,325.59,324.47,324.5,326.6,327.11,326.48,324.74,325.58,325.37,325.37,318.66,322.35,324.12,324.22,325.85,327.18,327.15,326.73,325.32,327.07,324.33,322.68,318.73,325.01,326.53,325.45,325.44,320.34,320.5,320.5,320.83,322.61,321.7,323.94,320.57,323.03,325.65,323.91,322.5,322.63,319.58,322.06,320.24,315.99,318.61,317.93,317.67,312.83,310.94,314.09,314.87,310.58,309.73,305.04,308.54,307.38,309.05,303.67,298.59,297.41,306.08,308.27,308.61,308.61,309.98,310.22,318,319.96,319.59,322.85,326.65,329.26,330.11,334.09,333.3,331.18,334.64,333.26,335.92,336.33,334.69,334.55,337.98,338.97,337.59,340.33,345.3,343.98,346.88,347.53,346.98,349.01,351.68,347.33,347.08,344.76,348.48,349.08,350.38,350.38,352.52,352.58,354.6,355.37,356.31,356.77,354.14,355.57,346.17,347.2,346.31,340.7,346.67,348.41,354.17,352.15,347.87,351.65,351.65,350.35,345.31,344.97,344.94,344.78,348.83,351.59,350.83,350.83,350.83,353.38,351.8,350.81,353.67,355.16,352.34,353.66,355.02,353.2,349.64,348.96,352.05,351.57,347.32,347.49,347.55,348.28,343,348.7,351.14,356.33,362.71,362.1,361.46,363.7,363.49,362.32,363.27,365.64,365.02,363.11,360.61,361.37,358.24,359.8,358.79,359.93,359.86,362.45,361.55,360.35,357.78,359.43,363.23,361.87,361.87,359.76,358.01,355.92,358.98,357.25,355.64,354.05,358.08,358.68,364.03,364.03,361.28,361.19,363.03,360.23,359.63,358.73,359.42,362.06,364.46,366.57,365.77,364.06,366.23,366.03,365.94],"SK하이닉스":[100,101.47,103.3,101.71,97.8,97.8,100,98.05,100.24,104.76,105.01,103.66,100.12,102.56,100.12,100.49,100.61,101.34,101.34,96.83,100.12,97.31,96.95,96.95,99.76,102.32,102.56,99.51,104.27,105.13,104.15,104.03,104.03,103.54,104.76,107.94,108.42,108.42,110.38,110.5,112.94,111.11,110.62,109.77,111.97,111.36,113.31,110.26,110.26,109.89,111.11,113.06,111.48,111.48,110.74,109.16,109.16,111.84,115.38,113.55,114.65,117.22,121,121.49,126.01,123.57,122.83,120.39,120.39,119.29,121.12,120.02,124.05,126.01,126.25,130.16,130.16,130.16,131.14,131.87,128.94,131.14,131.14,130.16,133.33,128.69,122.1,123.81,118.32,116.97,121.12,123.08,121.86,124.3,123.57,122.59,116,112.33,114.04,114.04,116.48,115.02,120.51,119.17,117.22,117.22,120.15,124.54,122.83,119.17,120.02,114.16,116.24,116.12,118.8,118.32,120.88,123.81,124.05,125.27,124.3,123.32,126.5,124.54,122.83,120.63,121.61,119.66,119.29,119.66,121.49,121.61,120.15,122.59,121.73,125.52,126.98,127.96,127.96,131.14,130.89,131.87,131.87,135.29,135.29,136.51,136.51,138.95,138.95,135.78,137.73,135.04,135.78,135.04,133.58,136.02,132.36,136.75,134.55,136.26,136.26,139.44,141.39,140.17,139.19,137.73,139.44,137,137,137.97,138.46,142.37,140.42,143.59,144.81,147.99,147.74,153.36,156.29,158.24,158.73,158.73,164.84,168.99,164.1,167.28,164.59,161.9,160.68,166.06,166.3,162.64,164.35,168.5,168.25,172.41,173.63,173.87,172.89,173.38,174.11,173.87,178.27,171.92,163.13,167.03,157.75,161.17,159.95,166.06,159.95,156.29,156.53,161.9,156.78,157.26,149.94,158.97,158.97,161.42,162.15,163.61,164.1,166.54,166.06,166.3,167.03,165.81,165.08,167.28,167.52,167.77,166.3,170.7,175.09,174.36,177.29,180.22,182.42,184.86,187.55,188.52,194.63,193.41,197.07,202.93,202.93,210.74,210.74,201.22,203.17,202.44,202.44,202.44,202.44,202.44,202.44,202.44,216.61,217.58,216.12,210.26,205.62,203.91,197.56,192.92,198.29,206.84,199.76,199.51,192.19,191.45,194.87,200.73,208.3,203.66,206.11,203.91,201.22,203.17,201.22,200.24,200.98,203.66,200.24,201.47,202.69,200.49,207.57,211.97,206.84,207.81,202.93,201.71,201.22,187.55,189.01,193.16,190.23,189.26,185.59,192.19,192.19,189.99,187.55,185.59,184.86,188.52,195.85,195.85,188.03,187.3,187.3,180.71,183.39,186.81,186.81,187.06,189.74,188.28,193.65,190.96,187.79,178.02,177.29,181.68,177.53,181.68,180.95,183.64,179,173.63,174.11,176.8,185.1,184.37,183.88,178.51,179.49,181.68,176.31,171.43,171.43,173.63,180.46,179.24,181.93,189.74,189.5,189.5,189.5,186.81,184.37,187.79,185.35,188.77,189.26,192.19,187.55,187.55,189.01,191.21,201.22,201.95,203.91,203.42,207.33,219.78,221.49,218.8,219.29,219.54,218.8,215.87,216.36,202.93,205.13,198.78,196.09,196.09,198.53,198.53,199.76,196.34,202.44,196.09,196.83,196.34,198.29,205.13,205.62,205.13,202.2,206.59,214.65,206.11,206.11,200.49,201.22,211.23,212.7,206.35,206.35,202.93,202.44,202.69,202.69,203.91,203.66,209.52,210.26,208.55,206.59,212.45,211.72,214.65,217.58,217.58,232.72,231.01,232.48,230.77,231.5,231.99,228.08,223.2,219.29,222.22,222.22,221.98,215.87,217.83,215.87,215.87,210.74,212.45,205.13,205.37,214.41,216.12,218.56,207.08,205.86,208.06,203.91,209.28,204.4,210.26,207.57,210.5,208.3,213.92,213.19,211.97,209.04,216.85,218.07,216.36,218.07,220.51,214.65,199.51,204.15,196.58,202.93,210.26,209.77,210.74,209.04,203.17,203.42,193.89,197.07,194.87,190.48,183.39,184.13,185.35,185.35,182.42,181.93,182.42,191.45,194.87,198.05,199.76,203.91,201.22,202.2,201.95,202.69,196.83,198.29,195.36,192.43,185.35,186.81,187.06,183.39,181.93,189.74,188.52,190.48,192.43,193.16,187.3,187.3,187.3,187.3,183.15,178.51,179.98,175.09,175.09,170.94,171.67,173.87,173.87,171.67,168.5,176.8,171.67,170.21,171.92,167.77,172.89,170.94,168.74,162.88,158,163.61,163.13,166.54,166.54,166.79,177.29,172.16,171.18,172.89,178.02,178.02,181.93,175.58,171.92,175.34,171.18,170.45,164.84,166.3,169.23,169.23,173.14,172.89,175.58,174.6,169.96,172.16,168.5,166.54,161.17,163.13,159.95,158.49,161.66,159.95,150.92,151.89,149.21,147.25,143.1,146.52,147.5,147.5,146.76,150.43,147.74,147.74,147.99,140.9,142.37,143.35,144.57,155.31,159.46,158.97,151.65,156.29,158.24,158.49,157.75,163.61,162.64,163.13,172.16,182.17,175.34,179.24,185.35,180.46,185.35,185.35,185.35,185.35,187.3,179.49,180.95,185.35,186.08,189.01,180.22,182.42,179.98,184.86,187.3,187.3,184.13,183.64,179.98,170.94,170.94,171.18,170.21,166.3,166.3,162.88,162.64,165.32,163.13,164.35,166.3,165.57,166.06,172.16,185.35,185.84,178.02,177.53,179.24,176.56,181.2,187.06,186.57,195.12,191.45,192.92,190.23,189.99,191.94,191.45,190.72,194.63,196.34,195.85,193.41,199.76,196.58,197.8,191.7,195.85,191.94,195.36,192.92,192.92,197.07,196.34,196.34,195.12,196.09,185.59,181.68,179.49,182.17,181.93,175.58,174.85,173.14,171.67,168.25,166.06,165.08,163.37,160.93,161.42,160.93,159.46,162.64,158.97,158.97,158.97,159.71,163.13,164.1,160.44,155.07,154.09,155.56,154.82,164.1,164.35,160.93,163.37,162.88,168.25,171.43,169.72,170.94,174.36,168.74,171.43,167.03,164.59,170.45,178.02,184.37,182.42,186.08,185.84,182.17,182.42,187.55,191.45,192.43,189.5,193.41,194.87,188.03,192.67,187.79,189.74,185.84,184.13,175.82,179,176.56,179,181.93,181.93,187.79,187.79,186.57,183.39,186.57,185.1,180.22,181.68,175.34,178.27,179,179,189.01,189.5,188.03,195.36,202.69,200,205.86,202.93,201.71,201.71,201.71,194.14,193.89,195.85,201.95,200.73,202.2,203.66,200,203.42,198.78,200.73,200.24,194.14,194.14,196.09,196.09,197.56,197.56,192.92,195.36,196.58,198.29,201.22,197.8,189.01,189.26,193.16,189.74,195.36,202.44,202.44,202.69,199.02,200.24,202.93,206.84,207.81,203.91,204.15,200.98,198.53,203.17,203.66,203.66,208.06,208.79,208.3,201.95,197.56,199.51,199.51,200.98,201.95,202.2,197.56,196.58,192.19,189.74,192.43,196.83,197.07,197.07,196.83,203.66,214.65,216.36,226.62,227.11,228.57,231.99,231.01,229.06,229.06,231.5,234.43,229.79,229.79,231.26,230.77,230.28,229.55,237.85,241.76,241.51,245.42,245.42,239.8,242.25,241.76,243.96,242.49,246.64,241.03,241.03,241.03,235.16,239.07,229.55,228.33,231.26,237.12,238.58,245.42,242.49,241.27,243.71,244.2,249.08,255.19,256.41,249.08,252.75,253.97,251.53,242.98,239.32,231.01,226.62,214.65,224.91,226.62,230.28,231.75,226.13,226.13,217.58,208.79,202.2,201.47,196.83,196.34,178.51,168.5,182.66,169.47,192.19,206.35,197.07,203.42,204.4,203.42,191.45,195.36,194.38,202.93,209.52,206.35,207.57,205.37,198.78,200.98,200.98,198.53,205.37,200.24,198.53,204.88,201.71,198.78,201.71,203.66,204.4,204.4,204.4,197.8,197.8,201.22,201.22,207.57,206.35,209.28,204.15,196.83,200,198.05,201.95,205.37,203.66,198.53,198.78,200,198.78,204.88,199.02,204.15,203.42,216.61,214.16,220.76,222.22,219.29,221.73,216.12,208.06,200.24,208.55,211.97,210.5,208.55,207.33,205.37,210.01,205.86,206.59,204.15,207.81,208.3,206.11,208.55,210.01,207.08,204.4,202.69,202.2,202.69,202.44,202.69,201.95,202.44,200.73,205.37,203.17,201.22,204.4,202.2,202.93,203.17,208.3,202.2,199.76,199.27,197.07,198.05,196.83,198.78,198.53,197.8,197.07,195.85,195.85,190.72,183.15,175.34,181.93,184.37,188.03,192.43,193.16,189.99,183.39,183.64,184.37,192.19,192.19,191.45,193.89,188.77,187.06,191.45,195.36,200,199.02,200.73,204.4,206.35,198.53,204.15,205.86,202.44,201.47,205.13,205.13,205.13,205.13,203.17,202.69,203.66,202.44,202.44,208.79,215.38,211.23,212.7,208.3,211.72,208.06,204.64,203.42,204.88,203.17,201.71,202.44,199.51,195.12,194.38,198.78,203.17,210.26,210.74,210.01,211.23,212.45,215.14,219.05,239.32,239.56,239.32,239.8,236.39,244.2,240.78,237.36,242.74,241.27,238.1,245.42,266.18,272.28,280.83,288.16,280.83,294.26,284.49,282.05,285.71,286.94,286.94,291.82,289.38,283.27,274.73,283.27,288.16,288.16,282.05,283.27,289.38,289.38,307.69,318.68,319.9,328.45,337,324.79,315.02,324.79,318.68,311.36,317.46,318.68,318.68,321.12,313.8,329.67,315.02,313.8,300.37,299.15,305.25,317.46,317.46,305.25,311.36,305.25,306.47,307.69,307.69,307.69,322.34,323.57,317.46,307.69,324.79,333.33,338.22,332.11,362.64,345.54,345.54,352.87,358.97,346.76,341.88,330.89,333.33,324.79,334.55,341.88,333.33,343.1,341.88,346.76,337,337,329.67,326.01,324.79,329.67,322.34,328.45,323.57,343.1,344.32,349.21,349.21,350.43,351.65,341.88,335.78,340.66,334.55,335.78,335.78,337,338.22,323.57,324.79,323.57,321.12,329.67,317.46,317.46,312.58,321.12,322.34,322.34,315.02,316.24,317.46,300.37,291.82,286.94,289.38,286.94,295.48,295.48,299.15,299.15,291.82,300.37,300.37,306.47,305.25,310.13,313.8,307.69,315.02,313.8,313.8,311.36,299.15,300.37,312.58,310.13,313.8,316.24,308.91,304.03,297.92,297.92,302.81,307.69,313.8,307.69,305.25,311.36,304.03,299.15,300.37,305.25,301.59,296.7,291.82,293.04,300.37,301.59,301.59,296.7,290.6,289.38,285.71,291.82,289.38,285.71,283.27,278.39,278.39,274.73,283.27,293.04,295.48,293.04,288.16,283.27,274.73,257.63,245.42,247.86,247.86,247.86,253.97,250.31,250.31,251.53,256.41,252.75,253.97,252.75,252.75,260.07,263.74,260.07,261.29,258.85,255.19,258.85,251.53,256.41,260.07,262.52,262.52,253.97,261.29,261.29,261.29,261.29,257.63,253.97,255.19,252.75,244.2,251.53,244.2,244.2,239.07,235.65,233.7,229.55,229.55,223.44,224.66,229.06,240.29,237.12,238.58,239.07,235.16,240.54,244.2,249.08,247.86,260.07,251.53,260.07,262.52,257.63,258.85,261.29,262.52,266.18,264.96,262.52,260.07,271.06,273.5,269.84,268.62,272.28,291.82,290.6,291.82,286.94,282.05,283.27,278.39,284.49,293.04,288.16,289.38,296.7,293.04,301.59,294.26,296.7,295.48,301.59,302.81,297.92,294.26,304.03,310.13,311.36,312.58,307.69,311.36,310.13,319.9,319.9,319.9,313.8,306.47,305.25,310.13,304.03,312.58,313.8,316.24,313.8,310.13,308.91,310.13,305.25,290.6,290.6,288.16,288.16,277.17,294.26,294.26,294.26,294.26,302.81,304.03,300.37,300.37,300.37,316.24,322.34,323.57,310.13,318.68,324.79,321.12,321.12,321.12,321.12,299.15,300.37,300.37,300.37,305.25,315.02,315.02,291.82,288.16,288.16,288.16,288.16,283.27,283.27,283.27,283.27,302.81,302.81,301.59,301.59,294.26,288.16,288.16,293.04,295.48,288.16,283.27,285.71,284.49,275.95,277.17,273.5,272.28,271.06,275.95,268.62,263.74,266.18,274.73,274.73,275.95,269.84,263.74,271.06,264.96,267.4,274.73,269.84,268.62,267.4,267.4,262.52,262.52,268.62,269.84,266.18,274.73,269.84,274.73,277.17,271.06,274.73,275.95,264.96,263.74,251.53,258.85,261.29,263.74,263.74,261.29,261.29,261.29,253.97,258.85,257.63,252.75,241.76,242,239.07,237.85,235.41,230.77,232.48,225.15,220.27,223.69,231.99,232.72,229.55,222.22,213.68,217.58,225.89,224.91,229.3,231.5,228.82,227.84,229.55,229.55,241.03,246.64,244.2,249.08,250.31,244.2,244.2,245.42,244.2,242.74,239.07,237.12,235.65,238.1,238.1,240.54,235.16,232.23,224.18,227.84,227.84,227.84,236.14,237.12,233.7,235.41,232.48,228.57,227.59,229.79,232.23,225.89,227.59,232.48,225.64,223.93,222.47,224.18,220.76,220.76,220.76,220.76,231.5,227.11,224.66,222.71,219.78,214.9,214.9,210.01,203.91,201.47,200.24,198.29,197.31,202.93,202.93,210.5,219.29,219.54,222.71,222.71,220.27,229.55,231.75,233.21,232.48,233.94,226.86,220.27,221,224.18,228.33,229.3,219.78,203.66,201.95,204.88,206.35,201.95,206.35,211.23,214.16,217.83,217.58,228.33,221.98,223.69,223.44,214.16,215.87,210.74,208.06,208.06,212.21,207.81,202.93,204.4,207.57,206.84,200,197.8,197.8,192.67,192.43,199.02,198.05,200.98,199.76,195.85,191.45,192.92,191.21,190.48,193.41,189.99,188.03,188.03,185.59,183.15,183.15,184.86,184.62,197.8,198.78,202.93,210.01,211.23,213.19,211.97,209.28,209.52,210.01,207.81,208.79,213.92,213.92,213.92,223.2,223.2,223.44,221.49,216.12,223.2,223.2,225.15,217.58,221.73,231.75,231.75,228.33,221.25,228.08,223.93,226.86,224.66,225.89,222.71,217.58,226.37,222.22,219.78,218.32,218.32,215.14,213.19,219.05,217.09,211.97,209.04,203.42,205.86,198.05,193.16,192.92,205.13,204.4,204.15,212.21,216.12,213.19,208.79,215.87,212.21,216.85,216.36,212.94,206.35,206.59,204.64,217.58,221.49,224.18,220.51,216.61,218.07,216.12,213.92,215.38,214.16,217.58,212.94,208.79,213.43,216.85,218.56,218.56,220.27,219.29,216.61,216.61,216.61,213.19,212.21,210.74,212.94,210.99,220.76,224.42,228.57,237.61,239.8,239.07,238.58,252.75,266.67,266.67,269.35,265.2,269.35,269.35,265.45,265.45,263.74,267.89,281.81,280.34,291.82,290.11,290.6,290.35,280.34,283.52,281.07,278.39,277.41,277.17,275.95,279.12,283.76,281.32,287.18,287.91,284.98,277.9,273.02,269.35,276.92,281.81,278.63,288.16,286.2,287.67,286.94,285.47,281.07,278.39,276.92,275.95,302.81,312.58,301.34,305.49,291.82,293.04,293.28,297.68,289.62,289.38,289.38,281.56,280.59,280.59,282.78,280.34,286.2,284.25,284.49,283.27,295.24,284.49,283.03,289.62,291.58,297.44,293.04,291.09,291.58,288.64,289.38,277.66,283.03,284.98,289.38,298.41,298.9,290.6,291.09,288.16,284.49,286.45,285.71,280.83,280.1,280.1,280.1,280.1,280.1,281.81,293.53,294.02,294.02,291.82,291.09,303.3,304.52,303.05,317.46,317.46,306.96,308.18,302.81,309.65,311.36,293.04,290.84,290.84,284,293.77,305.98,307.2,324.79,318.44,311.6,312.58,318.68,321.86,317.46,327.47,323.08,317.22,320.88,322.34,320.63,317.7,312.58,319.17,320.88,318.44,326.98,323.81,320.15,307.45,306.72,306.72,311.36,314.77,319.9,320.39,333.82,341.88,341.88,337.48,343.1,343.1,343.35,343.35,344.08,342.86,345.54,345.54,347.74,334.07,333.09,335.78,332.11,335.53,326.01,332.11,327.47,327.47,322.59,319.9,332.6,345.05,348.23,343.83,345.54,335.53,332.11,329.67,334.31,328.94,324.05,329.43,323.08,337,337,348.72,348.72,348.72,366.3,363.13,363.61,358.49,369.47,365.32,363.86,382.17,394.14,395.12,375.58,385.84,381.44,381.44,406.59,404.88,397.8,402.69,419.78,406.84,404.64,399.51,395.36,393.65,401.22,391.21,382.17,415.14,414.65,413.68,431.26,442.49,435.16,446.89,452.99,454.95,437.61,459.1,446.4,442.49,446.64,446.64,460.07,457.63,459.58,437.36,436.39,445.18,423.2,419.05,417.58,439.07,416.61,434.19,429.55,425.4,425.4,423.93,422.95,422.95,438.58,434.68,428.33,439.32,448.84,452.5,452.5,471.31,463.74,464.22,468.86,482.78,488.4,484.98,492.06,494.51,494.51,477.9,462.03,474.24,472.04,473.02,473.02,506.72,507.94,518.93,525.03,542.12,539.68,544.57,572.65,570.21,579.98,571.43,544.57,549.45,578.75,577.53,577.53,575.09,566.54,576.31,561.66,576.31,570.21,582.42,583.64,588.52,568.99,561.66,568.99,538.46,518.93,511.6,500.61,500.61,509.16,463.98,468.38,477.66,461.29,475.21,472.04,422.95,381.2,399.76,413.43,399.02,418.8,432.23,444.2,455.92,455.92,487.67,473.5,487.67,470.33,466.67,452.99,438.58,427.35,437.85,414.41,424.18,424.91,410.99,378.02,389.26,381.93,383.39,379.73,383.88,412.21,397.56,397.56,397.56,397.56,373.14,383.64,395.6,399.27,403.66,441.76,448.84,426.37,426.37,412.94,412.94,425.15,451.53,434.68,434.68,455.92,454.21,454.21,471.06,460.81,478.63,457.39,466.18,458.61,478.63,484,490.84,478.63,464.71,476.19,454.95,444.93,473.75,471.79,478.14,478.14,489.62,470.33,453.72,446.64,422.47,435.16,419.29,416.61,416.61,412.21,431.5,432.23,432.48,410.99,393.41,390.48,387.79,402.69,410.26,422.47,408.06,412.45,416.12,419.54,430.04,428.57,437.85,449.33,448.11,427.35,411.48,414.16,411.48,411.48,415.38,426.13,424.66,424.66,418.07,444.2,487.91,476.19,475.46,500.61,496.95,474.48,476.19,484,512.82,523.81,517.7,532.36,550.67,536.02,539.68,539.68,539.68,539.68,539.68,486.45,466.18,466.67,485.47,496.95,495.73,483.76,487.67,485.71,509.16,512.82,517.7,512.82,533.58,517.7,511.6,500.61,489.62,495.73,486.45,464.47,464.47,454.46,471.55,469.84,469.84,458.85,458.61,485.71,487.67,499.39,503.05,495.73,501.83,512.82,526.25,516.48,507.94,522.59,505.49,486.69,465.69,481.07,483.27,475.21,444.93,402.44,413.92,402.93,447.37,441.51,440.05,441.03,424.91,427.35,427.35,431.26,424.42,442,435.41,450.31,444.44,441.51,433.46,433.46,454.21,454.21,454.21,465.93,464.71,464.22,476.19,484.74,503.05,489.62,499.39,486.94,493.28,489.62,480.83,488.4,495.73,494.51,507.94,517.7,499.39,506.72,506.72,531.14,548.23,548.23,559.22,562.88,586.08,575.09,575.09,605.62,608.06,601.95,600.73,627.59,633.7,680.1,698.41,715.51,693.53,713.06,697.19,681.32,680.1,660.56,661.78,688.64,686.2,725.27,719.17,732.6,728.94,722.83,658.12,656.9,665.45,655.68,656.9,658.12,649.57,639.8,641.03,643.47,667.89,630.04,630.04,643.47,631.26,639.8,626.37,652.01,656.9,678.88,675.21,675.21,653.24,642.25,623.93,598.29,612.94,633.7,638.58,634.92,655.68,656.9,625.15,636.14,641.03,648.35,667.89,676.43,703.3,742.37,749.69,802.2,808.3,849.82,814.41,868.13,868.13,857.14,881.56,873.02,870.57,821.73,852.26,848.6,879.12,965.81,965.81,965.81,965.81,965.81,965.81,1045.18,1013.43,1004.88,1031.75,1105.01,1136.75,1185.59,1169.72,1175.82,1168.5,1245.42,1306.47,1272.28,1362.64,1387.06,1365.08,1514.04,1431.01,1413.92,1448.11,1416.36,1479.85,1511.6,1506.72,1494.51,1367.52,1479.85,1391.94,1372.41,1394.38,1272.28,1269.84,1267.4,1279.61,1328.45,1294.26,1313.8,1362.64,1347.99,1323.57,1328.45,1409.04,1382.17,1433.46,1379.73,1394.38,1352.87,1294.26,1345.54,1347.99,1335.78,1416.36,1426.13,1435.9,1435.9,1462.76,1562.88,1589.74,1589.74,1653.24,1699.63,1772.89,1811.97,1846.15,1816.85,1829.06,1802.2,1811.97,1829.06,1846.15,1865.69,1814.41,1807.08,1843.71,1873.02,1797.31,1953.6,2053.72,2102.56,2219.78,2026.86,2214.9,2197.8,2056.17,2048.84,2166.06,2139.19,2100.12,2168.5,2148.96,2148.96,2148.96,2148.96,2183.15,2317.46,2322.34,2454.21,2485.96,2683.76,2590.96,2590.96,2293.04,2073.26,2297.92,2256.41,2041.51,2290.6,2332.11,2271.06,2222.22,2378.51,2368.74,2578.75,2473.75,2459.1,2278.39,2407.81,2429.79,2278.39,2278.39,2131.87,1970.7,2190.48,2026.86,2139.19,2163.61,2236.87,2522.59,2437.12,2507.94,2539.68,2693.53,2774.11,2820.51,2754.58,2847.37,2989.01,2986.57,2991.45,2984.13,3155.07,3174.6,3157.51,3140.42,3140.42,3533.58,3533.58,3909.65,4039.07,4117.22,4590.96,4481.07,4825.4,4810.74,4442,4493.28,4261.29,4261.29,4737.48,4739.93,4739.93,5010.99,5477.41,5589.74,5697.19,5770.45,5763.13,5763.13,5611.72,5054.95,4666.67,5409.04,5001.22,5130.65,5250.31,5587.3,5816.85,6156.29,6556.78,6749.69,7128.21,6239.32,6400.49,7123.32,6527.47,6417.58,6471.31,6251.53,5340.66,5921.86,5721.61,5374.85,5069.6,5338.22,5323.57,4505.49,4671.55,5084.25,4498.17,4498.17,4307.69,4483.52,4468.86,4686.2,4295.48,4434.68,3785.1,3421.25,3228.33,4195.36,3826.62,3851.04,4073.26,3650.79,3472.53,3467.64,3479.85,3672.77,3890.11,4017.09,4017.09,4058.61,3663,4129.43,4224.66,4080.59,4097.68,4122.1,4224.66,4036.63,4087.91,4134.31,3938.95,3897.44,4021.98,4354.09,4378.51,4532.36,4525.03,4424.91,4144.08,4126.98,4295.48,4261.29,4534.8,4561.66,4493.28,4547.01,4547.01,4547.01,4317.46,4310.13,4337,4476.19,4495.73,4495.73,4329.67,4207.57,4105.01,4105.01,3919.41,3523.81],"마이크론 테크놀로지":[null,100,99.18,101.63,100.53,100.41,98.89,99.59,102.39,102.98,102.34,100.41,100.18,99.12,97.37,97.02,97.37,101.46,101.63,100.41,99.18,103.15,103.39,105.66,106.48,111.97,112.14,113.78,115.24,116.23,116.23,117.51,116.7,113.37,114.01,107.88,109.69,108.64,111.27,119.32,120.61,119.67,116.87,117.51,116.87,118.45,118.33,118.8,120.55,120.14,135.38,135.79,135.79,136.02,132.98,130.01,127.96,127.96,131.64,130.53,129.07,128.66,130.41,131.23,133.04,130.24,129.48,129.48,126.91,130.3,126.74,128.2,127.79,133.39,137.54,137.3,139.93,141.16,140.75,144.48,144.72,143.61,142.09,143.61,141.33,142.73,140.4,139.52,134.97,134.38,134.15,136.31,136.31,138.76,138.65,137.07,135.67,138.7,136.84,143.32,144.19,149.27,150.09,149.68,148.16,146.82,146.99,150.03,149.33,152.48,152.01,150.61,153.01,148.98,152.13,154.52,165.97,167.89,167.48,166.37,169.12,168.71,167.19,166.9,164.97,167.08,166.49,161.35,158.67,155.81,156.1,156.1,158.38,158.44,159.14,163.22,159.49,155.11,157.56,156.39,161.3,161.53,165.15,162.11,163.46,162.23,164.62,163.81,168.18,171.16,169.47,168.89,168.3,169.41,157.62,160.42,162.41,163.81,165.15,169.24,171.8,173.73,173.73,179.22,179.63,179.57,182.19,182.19,184.3,189.73,189.43,178.63,182.14,184.12,181.32,178.4,174.31,182.14,179.98,186.87,186.16,185.23,189.73,184.82,188.21,183.71,174.31,170.11,170.11,178.11,175.72,176.3,178.05,183.13,183.6,181.73,185.58,185.17,186.22,185.76,186.81,186.87,184.88,174.55,174.02,176.53,170.93,164.16,165.44,167.13,162.46,162.99,166.9,168.36,166.84,160.48,163.51,170.69,173.26,179.16,172.91,177.35,172.56,177.76,177.76,176.42,176.82,181.44,183.77,184.53,186.63,190.31,190.31,187.22,188.27,191.42,189.43,195.21,200.18,201.93,201.87,202.28,206.83,209.87,209.98,209.63,210.57,203.56,199.53,216.52,221.6,229.6,233.57,235.67,230.94,229.83,231.58,239.11,245.07,242.91,236.89,235.84,242.21,235.79,243.14,241.16,242.27,242.62,242.85,239.7,237.01,238.47,243.14,258.67,259.08,258.84,255.17,252.48,256.57,257.38,253.94,261.41,266.2,267.37,264.8,269.59,269.47,278.11,288.38,286.87,286.87,290.02,280.5,279.8,255.34,247.46,245.13,232.92,240.57,242.73,252.19,252.25,251.08,244.37,245.48,246.58,247.52,255.17,256.74,267.08,259.31,257.56,257.56,246.64,247.99,244.07,240.05,254.93,262.58,273.67,267.37,265.91,250.85,252.83,249.97,249.91,249.91,250.55,258.38,256.8,249.56,250.32,256.57,251.49,251.08,254.93,252.71,243.26,255.22,248.04,238.3,230.01,256.16,245.24,233.51,235.9,246.29,248.86,253.65,253.94,258.09,258.09,262.11,260.01,258.32,271.63,280.09,283.6,284.94,277.99,286.69,303.74,313.72,315.06,322.36,318.68,346.58,346.94,348.98,343.49,353.65,351.08,356.98,356.51,343.96,316.46,324.34,305.9,300.58,304.38,304.38,292.24,300.93,311.68,290.95,282.9,279.98,294.69,294.69,307.01,304.9,301.52,305.08,315.29,300.18,295.5,286.16,275.01,277.88,292.7,277.41,268.42,273.15,267.89,272.15,277.76,283.01,283.54,297.78,307.41,302.51,309.4,315.29,329.83,319.32,311.68,323.88,344.6,350.09,358.96,358.14,358.14,365.56,365.27,336.19,342.91,345.01,346.82,346.88,348.1,358.38,358.38,353.47,350.55,345.48,339.93,341.21,345.88,344.13,346.99,333.33,310.33,318.68,305.08,310.22,306.13,318.04,300.53,300.53,308.46,310.74,317.05,325.39,316.29,323.7,328.96,327.79,332.52,335.38,328.2,321.19,316.93,310.39,311.68,313.84,315,309.46,308.17,305.25,311.73,308.29,307.47,309.63,311.68,305.08,299.88,299.71,295.5,277.23,274.96,275.01,280.62,291.54,293.29,290.13,295.97,303.97,305.55,302.57,308,306.6,306.6,303.15,289.2,260.65,261.88,262.11,254.52,243.67,254.64,258.61,254.41,264.62,263.05,268.89,261.18,263.63,260.6,258.9,262.64,264.04,263.57,267.13,263.57,257.79,254.41,251.43,246.76,242.91,245.01,247.93,247.17,252.25,247.23,241.1,236.14,232.11,225.8,206.83,214.71,206.66,202.34,210.22,220.2,234.21,235.38,233.04,232.34,238.94,236.08,228.31,218.56,220.96,222.01,232.98,230.24,215,210.86,212.38,212.38,212.49,213.49,216,225.98,221.31,225.1,233.68,215.29,215.29,219.91,206.13,203.15,205.55,210.33,204.44,199.65,197.78,199.12,183.36,182.6,177,169.41,169.41,180.33,186.4,184.3,185.23,191.19,180.97,190.89,198.48,196.96,206.89,209.63,210.22,202.39,198.42,196.03,197.78,208.76,208.76,197.72,199.88,213.6,227.44,222.3,218.27,223.23,223.12,231.17,230.41,229.83,242.38,229.89,225.22,225.22,235.84,243.32,246.53,245.13,245.13,244.95,246.41,242.44,248.51,249.56,250.79,241.21,238.65,242.73,239.7,233.45,221.42,220.84,225.63,227.85,229.13,226.68,224.23,230.82,231.23,235.67,234.27,256.8,242.97,236.72,235.38,229.01,229.66,241.27,246.64,247.75,256.28,250.38,252.89,250.44,243.55,246.18,246.82,245.24,244.13,249.62,251.9,253.36,253.36,253.36,249.68,251.2,249.56,245.77,245.83,245.53,244.6,248.45,252.95,245.94,235.03,232.05,229.25,227.32,218.21,224.81,224.23,217.81,210.51,202.1,208.06,202.74,197.43,198.48,198.48,192.29,194.34,194.51,190.37,190.83,201.34,194.63,195.39,198.42,203.97,203.39,192.41,194.86,190.66,189.32,200.18,198.13,199.36,194.1,193.75,190.78,216.23,222.24,225.28,234.15,231.17,231.12,231.12,230.12,235.9,241.39,250.44,253.82,259.84,259.19,251.37,253.18,260.77,265.73,275.48,274.08,280.15,278.87,277.23,273.32,277.06,262.05,254.52,257.33,244.83,248.8,243.72,248.86,242.38,245.94,257.85,245.42,246.58,254.23,262.76,258.2,257.85,261.41,250.79,253.53,247.75,251.9,260.77,264.27,264.27,262.64,273.26,286.22,285.87,286.81,288.32,294.69,294.45,294.8,292.76,296.79,294.69,290.83,286.98,289.55,283.19,288.79,283.71,252.25,250.15,246.94,245.07,253.71,260.07,257.79,248.92,250.32,252.66,263.28,261.88,271.22,263.63,265.62,253.77,263.98,260.71,260.71,274.96,280.39,284.24,280.85,279.51,277.58,282.43,289.49,284.18,278.34,282.55,275.48,270.05,273.79,270.29,273.2,278.52,279.16,271.92,266.02,265.91,267.78,277.41,272.74,281.14,281.14,277.35,270.81,264.04,270.29,272.15,279.8,271.16,277.06,287.57,297.55,298.89,309.05,309.4,309.63,318.33,321.42,323.41,323.53,323.53,321.72,315.41,310.62,313.95,323.35,318.33,312.73,340.16,335.79,334.56,330.82,335.38,335.79,327.9,336.72,336.6,336.6,344.25,345.42,345.59,337.19,323.47,329.66,322.83,321.25,309.92,313.95,323.99,331.41,342.56,332.05,334.68,334.21,346,346.35,341.51,341.51,337.13,350.2,344.43,332.69,321.13,304.14,305.72,295.27,306.83,318.68,302.39,322.77,313.6,300.47,268.36,279.39,255.22,226.56,250.96,201.23,218.21,202.51,211.85,210.8,223.29,252.6,248.1,261.47,253.82,259.89,245.53,232.87,239.87,240.63,270.69,271.69,281.9,269.29,269.29,269.53,277.99,271.04,265.79,266.78,253.36,241.74,256.33,255.52,257.79,264.33,264.51,290.89,279.57,263.05,259.54,265.09,269,271.98,281.67,281.38,266.73,254.12,266.96,259.25,268.07,263.4,272.27,263.98,262.35,262.35,267.37,288.67,271.28,279.68,270.52,273.32,285.58,299.01,313.6,313.49,310.27,306.3,283.25,284.24,287.45,297.84,297.49,294.69,296.73,298.6,290.95,281.9,287.16,283.07,286.92,300.76,290.13,290.89,290.89,297.26,286.57,290.19,291.77,295.97,288.73,290.19,294.86,292.47,288.79,298.95,300.76,301.52,307.3,292,301.17,292.41,294.16,296.21,292.24,294.16,299.47,298.02,284.3,284.59,286.92,278.81,283.01,269.35,266.2,263.98,259.19,257.15,250.96,249.04,255.46,263.28,262.46,260.48,266.73,265.67,267.13,279.22,270.46,271.34,271.34,262.87,263.57,261.94,269.06,286.22,286.34,293.11,297.61,296.21,286.92,290.13,291.01,288.79,286.87,290.25,296.03,274.14,279.74,271.75,277.88,276.24,282.6,291.3,291.24,295.86,302.69,301.4,303.21,301.28,307.24,312.49,311.21,317.45,308.52,304.38,303.33,291.89,294.69,293.87,290.19,298.19,303.33,318.62,322.01,326.68,323.47,329.01,328.37,338.18,361.12,361.88,354.58,360.95,358.44,374.66,373.32,370.29,370.29,374.96,374.14,391.59,403.44,408.06,428.14,423.88,427.26,416.87,416.11,411.73,417.63,427.03,426.09,421.83,417.16,417.22,411.21,408.35,412.03,412.03,412.49,409.87,419.85,438.88,432.28,451.02,450.15,461.82,451.96,459.25,463.86,466.49,474.61,471.22,471.22,499.12,487.45,496.26,480.33,474.49,464.16,438.35,457.62,456.92,469.53,476.47,461.82,474.31,473.44,490.43,486.4,480.74,504.85,513.78,513.78,512.2,502.34,516.87,531,503.68,515.06,540.11,514.42,534.33,553.18,531.76,520.2,492.29,519.15,496.5,521.31,498.6,521.37,512.38,518.68,533.74,553.18,524.34,528.37,532.87,498.54,484.53,490.89,513.66,505.49,505.2,514.94,539.46,539.46,547.29,545.77,548.51,556.28,556.33,558.03,537.95,529.31,526.97,529.25,516.11,510.68,522.42,494.51,502.22,512.78,522.24,502.22,514.07,502.45,496.32,492.76,497.08,495.04,501.93,471.98,470.99,448.34,450.61,465.27,469.29,460.48,466.61,473.61,471.22,483.95,474.2,480.09,489.96,491.19,491.19,491.24,492.35,478.87,488.97,490.6,470.11,459.19,462.81,463.16,469.88,479.74,469.88,470.75,449.21,449.91,453.36,461.3,470.4,478.87,486.75,484.12,496.09,467.66,468.94,468.94,473.32,456.63,450.15,459.66,464.45,457.97,458.2,449.04,437.89,435.38,440.11,450.61,440.92,443.32,445.42,433.27,441.04,449.97,452.89,453.24,472.04,478.58,475.72,478.69,468.24,443.14,438,410.1,414.01,414.07,413.19,412.26,410.27,409.98,418.8,420.2,432.22,424.81,431.99,427.09,430.24,430.36,431.93,430.88,430.88,429.89,421.89,425.39,429.07,434.03,429.01,430.94,435.67,433.74,422.48,421.13,431.82,432.22,432.28,438.88,426.74,418.21,414.36,414.42,412.26,411.56,408.29,411.79,409.34,404.09,389.49,387.51,395.8,395.1,392.64,394.45,398.54,400.7,394.1,401.4,402.45,398.37,406.19,403.39,412.73,413.08,415.94,421.72,425.69,435.26,441.27,428.55,435.2,451.26,448.22,448.39,440.51,449.62,484.71,489.55,498.6,503.27,503.27,486.98,502.86,490.37,497.08,483.83,476.47,481.32,501.05,502.16,495.8,499.36,492.41,486.22,500.06,482.72,484.53,478.87,529.36,527.38,551.2,551.2,551.26,542.56,561.41,548.1,543.78,558.96,562.41,551.08,558.38,551.37,548.1,549.91,555.22,558.2,568.36,568.36,542.15,525.39,496.61,478.28,484.24,471.22,478.52,459.54,462.76,480.27,475.48,493.35,478.52,473.85,472.1,491.07,514.42,531.35,523.99,524.58,560.42,560.77,547.17,530.06,530.06,528.72,509.69,518.56,525.98,518.74,503.56,544.66,520.61,478.17,441.91,450.44,463.75,442.03,425.1,405.14,426.8,465.09,470.05,463.57,457.38,461.88,441.62,456.57,455.93,466.2,478.98,462.11,454.7,444.72,453.42,435.55,430.71,427.79,421.13,420.49,420.08,422.53,409.4,409.4,415.35,424.58,427.32,414.01,405.2,409.34,391.59,388.03,409.69,398.07,412.14,416,429.77,416.17,410.68,396.56,402.28,390.89,395.27,419.85,411.38,434.79,414.77,405.14,402.22,406.25,388.91,396.21,412.14,428.02,428.02,431.06,429.36,439.99,408.29,411.27,413.08,400.47,385.41,365.56,343.49,342.67,345.13,321.13,325.45,325.45,331.58,328.9,328.2,341.16,343.14,337.77,327.03,322.71,313.19,313.19,331.17,334.91,343.55,345.24,337.48,345.48,343.61,346.47,359.19,352.89,364.27,369.53,371.51,357.79,351.14,348.28,361.3,362.35,361.12,365.09,364.68,375.07,378.58,364.62,358.73,345.3,358.44,363.81,379.68,377.7,372.8,359.72,367.66,353.24,340.4,337.77,340.4,357.27,336.43,332.81,328.66,330.01,334.56,328.84,328.84,322.42,321.07,323.35,335.32,338.24,313.02,310.04,307.59,308.52,304.14,296.56,292.47,289.9,292.47,285.35,295.27,297.72,291.94,292.47,301.93,315,319.5,318.86,308.87,299.94,313.54,307.94,320.26,307.76,312.32,306.77,309.57,313.49,327.2,328.31,326.15,323.7,304.79,315.47,315.82,320.26,312.03,312.2,327.85,330.18,335.61,326.74,351.84,364.97,360.65,368.36,343.67,342.91,341.97,333.68,342.21,344.02,344.02,340.98,325.45,321.77,336.54,323.93,319.21,315.47,313.37,314.19,322.24,320.32,323.12,322.48,318.68,303.79,303.97,301.93,295.86,298.83,288.56,293.05,293.05,292,286.75,295.68,291.77,291.77,294.05,316.4,319.38,331.41,329.01,333.98,338.94,334.33,332.34,332.34,331.87,329.89,329.01,341.27,360.89,357.62,359.25,366.61,372.85,360.25,352.01,365.44,368.77,364.33,350.15,362.7,351.72,351.31,349.21,350.96,362.35,361,350.55,344.48,344.48,336.25,332.63,342.97,339.64,338,337.54,334.73,329.42,331.47,331.76,324.34,332.11,324.58,320.67,314.65,316.81,316,330.24,330.76,336.49,342.27,339.58,358.09,357.03,349.04,346.06,370.93,368.3,352.25,347.99,334.33,332.87,341.86,341.86,369.35,371.1,361.7,367.78,365.62,365.09,361.53,354.06,358.79,356.86,347.4,339.4,356.22,361.35,375.72,363.98,361.35,355.58,353.24,357.44,355.34,355.69,350.2,359.66,355.63,377.35,372.04,378.98,394.45,397.96,386.63,385.35,388.38,406.36,431.58,431.58,418.51,398.13,403.33,403.79,395.62,394.28,391.48,381.32,381.96,393.75,396.21,403.5,401.75,394.98,394.98,390.54,384.12,386.75,381.09,382.08,389.9,391.54,375.54,368.42,373.03,373.03,362.29,357.44,354.06,364.74,371.28,372.39,376.71,374.08,380.39,379.1,379.22,377.64,383.25,382.25,383.42,393.35,414.89,415.65,416.75,413.08,397.96,403.85,408.11,405.02,394.92,389.38,382.02,375.77,398.6,381.38,374.9,371.04,371.22,373.38,370.17,380.56,371.8,371.98,381.26,389.26,397.49,408.29,410.92,410.92,410.33,411.03,407.88,409.69,408.81,410.45,413.6,419.09,407.94,411.56,412.78,406.77,396.38,402.1,400.35,396.61,398.19,380.62,397.14,396.73,395.97,397.61,403.09,408.41,405.6,403.21,409.87,407.18,404.03,403.27,402.8,403.62,394.22,392.41,390.43,397.37,388.21,376.71,383.25,385.7,390.37,405.14,411.21,423.7,425.69,424.99,421.95,429.48,439.93,436.54,450.5,450.32,447.58,452.77,458.96,447.81,450.09,450.09,448.74,452.48,444.37,447.69,444.37,443.26,433.68,430.18,426.91,429.95,437.59,454.12,456.28,465.79,479.8,475.25,476.12,479.68,459.37,499.01,504.9,504.9,508.23,505.9,502.04,498.19,480.68,480.21,482.84,487.16,495.91,486.46,480.91,486.81,480.97,480.97,493.93,486.16,495.15,510.86,520.96,510.97,514.19,520.72,514.01,519.96,502.98,500.58,499.77,504.85,507.76,493.87,497.2,495.5,499.47,500.29,475.95,477.7,476.53,464.1,464.1,471.16,475.72,501.52,502.04,522.24,536.19,523.7,528.96,555.46,559.08,551.49,557.85,577.82,569.88,551.72,568.71,549.68,533.74,544.37,547.46,548.74,561.88,641.27,643.37,683.77,693.52,696.15,688.21,688.21,725.63,716.58,747.29,724.4,721.42,717.75,715.88,713.37,744.37,715.24,708.52,710.86,679.1,653.42,623.29,637.01,656.51,652.54,651.37,670.4,667.6,659.43,640.4,655.75,669.59,701.28,695.91,696.56,687.74,707.76,718.04,728.6,746.12,746.58,731.41,753.06,744.31,737.19,737.13,755.93,755.93,774.49,768.13,737.24,729.71,748.22,739.29,780.56,759.31,764.39,787.04,788.5,821.66,835.61,825.22,862.99,895.8,895.8,841.74,814.59,811.5,823.82,831.06,771.92,767.83,767.78,774.02,798.72,798.72,768.24,762.93,765.56,796.21,760.25,779.63,763.98,744.25,697.61,685.64,667.02,672.97,666.96,643.78,627.26,638.7,629.6,598.72,641.1,592.59,541.16,527.85,519.56,506.71,537.48,543.37,552.48,568.83,586.16,624.34,630.41,634.15,630.41,632.4,608.64,600.41,577.41,571.28,553.77,557.91,561.82,561.82,517.1,521.25,521.83,504.26,503.62,507.01,529.19,509.11,532.52,508.93,517.98,509.92,521.02,530.65,546.23,548.74,559.08,641.45,627.55,605.43,585.58,582.9,594.4,596.91,600.76,598.6,593.7,616.99,624.17,632.46,608.99,637.71,654.12,648.86,636.78,629.42,613.25,623.76,629.95,621.07,631.52,607.59,581.73,582.2,593.87,615.82,652.83,662.05,653.24,634.27,607.71,583.3,578.98,562.41,569.24,570.52,574.26,599.88,599.18,609.92,594.28,573.26,573.26,571.8,575.31,582.84,602.45,588.85,590.6,600.23,572.68,595.8,573.5,598.37,631.99,633.98,606.54,508.41,526.09,523.76,521.19,521.19,524.34,517.4,498.02,491.3,509.81,524.64,579.45,594.92,580.33,580.33,579.92,554.93,568.36,602.39,598.95,617.34,617.34,638.53,637.65,612.03,602.39,531.87,515.18,519.61,539.99,532.63,524.93,529.25,546.41,551.9,538.82,560.01,549.21,535.2,558.44,580.97,580.97,623.41,609.22,602.34,577,556.98,544.19,570.4,536.02,546.58,528.55,532.4,550.73,521.13,542.67,508.35,519.85,558.32,553.88,588.38,601.93,593.81,595.8,601.28,552.95,565.91,549.8,537.83,532.17,516.29,507.24,517.86,517.22,433.98,377.82,399.12,382.6,454.58,408.93,406.01,414.59,414.71,404.73,401.63,401.63,389.61,409.87,425.74,451.96,465.73,458.61,448.8,449.21,454,471.22,469.47,469.99,482.31,497.08,501.23,538.76,565.85,556.45,557.21,572.1,575.89,572.68,559.49,553.59,545.07,545.07,562.64,561.47,565.09,551.43,573.15,596.91,602.74,620.49,633.74,647.69,666.32,677.35,678.23,674.84,699.59,702.51,711.15,711.15,721.54,712.67,746.7,742.85,735.55,728.31,719.5,705.72,710.68,713.89,713.89,700.06,726.33,713.6,718.68,726.97,692.41,701.17,679.68,661.18,667.78,661,637.59,641.16,652.25,649.5,649.45,653.59,669.82,637.13,612.26,629.13,636.66,635.03,653.06,694.05,722.24,745.77,725.45,731.41,705.6,721.25,712.49,684.24,675.95,686.98,679.63,680.09,687.39,712.2,694.75,694.75,691.65,693.05,725.1,766.9,767.43,789.49,817.28,878.98,917.86,921.02,927.15,933.98,985.93,949.97,961,971.45,944.02,915.53,918.1,956.8,976.77,1063.34,1072.68,1096.5,1114.77,1084,1147.34,1122.77,1060.13,1125.34,1092,1120.49,1182.31,1181.44,1207.06,1180.91,1158.61,1206.71,1278.58,1284.88,1295.45,1323,1307.71,1306.3,1370.11,1272.8,1386.46,1391.3,1388.91,1478.69,1407.53,1429.66,1383.25,1440.92,1412.43,1333.92,1318.86,1175.54,1210.57,1307.24,1310.74,1344.19,1344.19,1380.5,1403.74,1398.07,1366.96,1323.12,1384.82,1441.45,1473.56,1539.46,1508.81,1407.71,1386.46,1357.33,1316.52,1450.96,1552.36,1614.65,1612.78,1673.56,1673.56,1662.52,1718.45,1708.29,1666.14,1841.33,1822.24,2004.85,1982.2,1909.05,2014.54,2019.09,1973.91,1946,1965.15,2117.63,2117.63,2130.76,2271.51,2320.96,2333.04,2271.4,2394.86,2541.04,2544.02,2421.95,2555.75,2448.57,2214.83,2235.2,2304.09,2238.76,2178.93,2395.45,2416.64,2403.15,2403.15,2333.8,2457.38,2436.37,2499.53,2457.5,2440.22,2504.38,2425.92,2407.3,2409.05,2216.46,2339.58,2317.86,2161.7,2272.74,2353.24,2444.19,2366.32,2487.62,2579.1,2695.21,2695.45,2593.52,2468.77,2360.48,2308.99,2230.53,2075.07,2085.35,1878.58,1972.21,2147.4,2138,2138,2205.25,2204.2,2374.37,2460.65,2455.28,2490.13,2718.39,2663.34,2669.18,2656.57,2617.75,2623.35,2845.77,2812.14,2899.71,3062.23,2943.9,3026.62,3019.03,3165.27,3365.15,3737.3,3891.36,3774.84,4359.66,4642.91,4475.07,4691.36,4530.12,4230.36,3978.63,4079.04,4273.15,4448.92,4384.12,4384.12,5229.89,5419.79,5391.24,5668.42,6044.95,6211.91,6302.22,5814.36,5043.84,5541.62,5463.46,5206.54,5813.6,5730.36,6351.37,5958.9,6089.84,6619.91,6619.91,7071.69,6139.93,6120.9,7084.41,6610.22,6685.81,6738.41,6026.15,5695.04,5695.04,5748.69,5477.99,5538.82,5788.91,5716.87,5469.94,5739.17,5278.93,4980.74,4955.93,5052.31,5667.37,5601.17,5780.56,5376.24,5255.11,4790.02,4314.07,5106.01,4804.61,4842.38,5211.15,5214.19,5145.77,5123,5026.27,5070.17,5319.85,5544.83,5672.27,5906.31,5491.89,5470.58,5687.86,5643.78,5314.83,5446.41,5478.11,5460.54,5445.77,5596.79,5449.15,5581.32,5593.46,5934.56,5934.56,5839.23,5999.83,5705.84,5693.29,5394.22,5415.06,5408.93,5706.36,5929.95,6094.34,6399.07,6257.33,6307.82,6318.04,6152.83,6217.63,6217.81,6406.25,6274.9,6211.09,6103.68,6351.43,6046.94,6007.01,5773.73,5564.45],"삼성전자":[100,101.28,102.12,102.06,104.37,104.05,102.06,103.28,102.57,100.64,101.03,103.66,105.27,106.1,105.52,103.79,104.5,105.33,105.59,102.5,105.91,102.63,99.74,98.84,100.06,100.71,101.86,102.31,105.33,105.91,105.97,105.97,107.71,107.71,112.14,112.33,110.92,110.34,112.27,113.81,114.96,114.32,112.52,113.42,114.13,112.97,115.16,115.29,116.38,115.93,116.18,114.45,115.48,115.54,114.84,115.74,115.74,115.93,117.15,116.12,114.19,116.25,119.52,119.59,122.93,124.6,120.3,117.73,118.69,118.63,120.36,119.46,122.22,122.54,126.53,128.13,128.13,128.13,126.72,125.63,126.4,126.72,127.04,124.66,123.31,123.31,123.19,121.9,120.68,121.13,122.09,121.58,124.15,125.05,126.2,125.82,122.74,122.22,123.44,123.44,127.55,127.23,128.71,129.09,129.09,129.09,129.03,130.38,132.82,132.95,134.36,136.16,134.55,136.67,136.35,134.23,133.27,132.31,133.2,134.17,134.81,132.31,133.08,135.13,135.32,134.36,133.59,134.68,133.59,134.55,136.22,134.94,133.46,133.27,131.34,129.35,130.89,132.43,137.12,137.44,140.78,143.29,143.29,144.19,144.19,146.18,146.18,151,151,146.44,146.11,147.14,148.04,148.94,148.81,147.53,143.61,144.83,144.25,144.12,146.69,147.98,146.5,143.35,143.55,143.48,147.59,147.53,147.53,145.47,145.02,148.04,145.73,145.79,145.66,146.69,146.37,149.52,154.59,152.47,154.01,152.92,155.04,155.11,153.18,153.95,152.67,151.64,150.93,152.79,154.34,153.69,156.26,157.35,160.18,162.36,162.11,162.62,163.26,162.94,164.42,164.03,163.33,160.57,160.05,159.92,153.37,154.78,156.07,157.35,153.44,153.18,152.79,153.24,148.62,147.4,143.29,144.51,144.51,148.36,151.06,150.61,150.42,150.93,152.47,152.6,151,148.04,147.98,148.36,148.75,149.26,147.85,150.16,150.93,154.53,157.61,159.92,159.28,159.34,161.53,161.85,168.53,167.37,167.69,169.56,169.56,172.19,172.19,165.96,164.61,164.68,164.68,164.68,164.68,164.68,164.68,164.68,169.56,175.47,175.98,173.41,173.15,175.98,175.85,170.13,172.9,174.37,173.54,173.09,168.27,170.46,173.54,176.88,183.75,183.24,181.05,181.05,180.15,182.27,180.92,181.12,181.05,179.58,177.71,179.13,179.25,177.26,177.52,179.7,177.59,178.1,169.04,171.1,168.91,163.13,163.26,164.87,164.61,160.63,162.94,166.99,166.28,167.31,164.8,163.97,162.56,164.42,165.57,165.57,157.8,159.6,159.6,154.78,158.51,163.65,163.65,163.84,165.77,164.03,167.37,167.05,161.85,156.84,154.91,154.78,155.88,160.57,159.34,160.24,158.38,154.91,157.87,158.45,161.4,163.07,164.48,159.92,160.24,159.99,153.18,153.89,152.28,147.08,147.72,143.55,146.82,152.67,157.35,157.35,157.35,155.36,152.22,151.83,150.16,151.64,152.15,152.15,151.12,151.12,147.78,145.15,151,156.13,158,159.73,159.73,165.9,166.22,165.51,164.23,162.94,164.42,163.97,166.28,159.67,161.46,160.5,156.39,157.48,158.06,155.88,154.53,150.67,156.52,155.43,158,156.97,156.9,157.35,159.92,161.66,160.5,164.93,169.49,165.77,166.67,162.04,161.85,167.44,170.2,170.2,170.2,170.2,170.2,166.67,166.67,168.91,163.46,165.7,164.74,160.89,158,160.08,158.64,158.96,160.57,160.57,166.35,165.06,169.24,167.95,164.74,158.96,162.81,164.74,164.1,164.74,164.74,162.49,159.44,160.24,158.64,158.64,154.78,153.02,149.65,150.93,150.93,151.09,151.73,149.81,150.93,153.98,150.29,149.81,146.27,148.2,148.52,147.56,144.19,146.44,148.68,147.72,146.11,149.33,147.88,147.24,149.49,150.61,152.38,149.33,148.2,148.2,150.61,150.61,149.33,148.52,149.49,146.27,146.92,147.08,149.97,150.29,150.61,145.79,144.67,144.99,144.99,142.1,141.62,140.82,143.87,148.04,148.36,148.2,148.68,149.49,150.29,153.02,155.59,152.38,153.02,149.65,148.04,144.19,146.11,144.67,143.06,141.46,147.24,144.99,146.11,148.2,151.73,152.22,152.22,152.22,152.22,152.54,149.17,148.84,146.76,146.76,143.55,143.55,144.35,144.35,145.47,138.41,141.3,140.66,140.01,141.78,141.46,140.98,139.85,138.25,136.64,131.66,131.66,132.95,136,136.16,135.36,141.78,140.66,140.49,141.3,141.46,142.26,145.15,142.9,141.62,142.1,141.3,140.17,137.44,135.2,136.32,136.16,136.8,138.25,138.57,138.57,134.39,138.89,135.36,133.11,130.06,131.5,129.09,129.25,129.9,128.45,125.08,125.72,124.92,125.56,124.12,124.12,124.6,124.6,123.15,122.83,124.28,124.28,124.44,120.75,120.26,124.44,122.35,127.17,127.81,130.06,128.61,131.98,133.11,134.71,135.84,137.28,135.36,134.87,138.25,143.71,144.67,146.11,149,148.2,148.84,148.84,148.84,148.84,148.36,143.87,144.51,147.88,148.36,152.54,147.88,148.36,147.56,150.61,150.77,151.41,152.06,150.13,150.13,144.83,144.83,144.03,142.1,141.3,142.74,140.66,140.17,143.38,140.82,140.82,141.94,140.33,140.98,141.46,147.24,149.49,146.11,145.31,145.63,144.03,143.38,144.67,146.92,149.65,150.77,150.45,149.81,149.81,149.97,148.52,150.45,151.09,151.73,151.09,146.44,145.47,145.63,145.15,143.71,143.38,144.03,148.2,147.24,147.24,147.4,145.47,145.47,144.03,142.1,136.32,137.76,136.96,136.96,136.64,133.43,132.31,134.87,138.57,139.69,140.82,137.12,136.96,136.64,134.23,136.64,136.48,140.66,139.53,140.98,140.98,141.94,143.87,144.03,143.22,140.49,141.3,140.98,142.42,145.63,146.11,146.76,146.11,146.44,146.76,149.33,150.93,149.65,148.52,145.79,147.72,146.6,142.58,144.83,146.27,148.36,148.68,149.17,150.45,147.88,148.04,150.29,151.57,151.89,149,151.57,151.41,148.04,149.49,145.63,145.15,144.35,141.14,139.69,138.73,136.96,138.57,140.33,138.09,140.33,140.33,140.98,140.01,142.74,142.9,141.46,141.14,140.01,141.46,141.78,139.37,141.3,140.66,138.89,141.62,146.76,148.68,150.61,150.93,151.41,151.41,151.41,151.25,150.61,153.18,157.84,158,158.32,158.96,157.03,158,155.43,157.51,156.87,152.86,152.86,154.14,153.34,157.03,157.03,155.91,157.84,160.57,160.89,162.81,162.17,160.24,161.53,164.42,164.42,162.81,163.46,164.74,164.1,161.85,161.85,164.42,167.95,169.24,171.16,169.88,167.31,165.7,168.91,168.59,169.56,172.45,171.8,171.8,166.99,163.78,165.7,166.35,166.35,167.63,164.74,161.53,161.85,160.24,158.8,158.96,161.85,164.42,165.38,166.67,171.16,175.66,175.66,182.08,180.8,179.83,179.83,178.23,176.62,176.62,177.91,181.44,179.19,179.19,177.26,178.23,178.23,179.19,182.4,188.18,191.07,192.68,192.68,189.47,194.93,196.85,200.39,197.17,200.06,195.25,195.25,195.25,188.82,189.79,183.69,181.12,183.69,189.15,191.07,196.21,193.96,191.71,192.36,194.28,194.93,198.46,197.5,192.04,193.32,192.68,190.11,182.4,185.93,181.44,179.51,174.05,176.62,177.91,184.33,185.61,181.44,181.44,175.34,167.31,167.31,160.4,157.03,151.89,146.44,137.93,145.79,136.48,150.77,156.23,153.5,155.11,153.66,153.34,147.08,150.29,150.93,156.39,159.28,156.07,157.68,158.16,155.11,157.35,157.35,157.35,165.06,160.89,158.16,160.08,160.08,158.48,160.08,160.89,160.57,160.57,160.57,155.75,155.75,158,156.71,156.71,155.43,153.82,155.91,154.14,153.66,156.71,161.53,160.57,160.4,156.55,156.87,158.16,160.24,161.85,162.81,164.42,165.06,175.02,175.34,178.23,176.3,178.23,177.91,174.37,167.95,160.24,167.31,167.63,167.95,169.88,166.99,165.06,169.88,166.67,171.16,168.27,169.56,168.91,169.88,172.13,176.62,171.48,170.2,169.56,169.24,171.48,172.77,175.66,172.77,174.69,174.05,177.59,175.66,173.73,174.05,178.55,188.18,189.47,189.47,185.93,182.4,184.01,182.72,186.26,184.65,185.61,186.9,189.47,188.5,186.26,186.26,187.54,185.61,177.91,179.51,180.15,181.12,181.12,178.55,177.91,173.41,174.05,174.69,181.12,178.55,181.44,188.5,187.54,190.11,189.47,193.96,195.89,195.89,191.07,190.43,190.11,186.9,188.18,185.61,185.93,186.9,186.9,186.9,186.9,186.9,188.5,189.47,192.36,191.71,191.71,193.96,195.57,195.57,192.68,191.07,192.68,195.57,195.57,193,193.32,193.96,192.04,189.47,186.58,181.76,184.33,188.82,187.86,193.64,193,193.32,193.32,196.85,195.89,202.95,212.91,210.98,208.09,207.45,207.77,216.76,217.41,213.87,218.37,219.01,214.19,217.73,223.19,223.83,229.61,234.1,230.25,237.32,234.1,235.71,236.99,236.99,236.99,235.39,234.43,234.43,232.18,237.32,249.84,249.84,252.73,251.45,260.12,260.12,266.54,269.43,263.97,266.22,285.16,292.23,290.94,288.05,288.05,282.59,272.96,279.38,280.03,282.92,278.74,287.09,278.42,274.89,268.79,263.33,266.54,271.03,271.68,264.93,268.14,266.54,265.57,262.04,262.04,262.04,270.39,272.64,267.18,263.65,265.25,263.97,263.33,263.33,273.92,264.93,264.93,268.46,269.75,264.61,263.65,263.33,261.4,259.79,263.33,265.9,262.68,265.9,264.29,266.22,263.01,263.33,262.68,260.12,260.76,261.72,262.04,263.97,261.4,266.22,272.32,274.25,276.17,274.89,272,268.46,267.18,269.75,269.75,270.07,269.43,267.5,269.43,265.25,264.61,265.9,268.14,266.22,263.65,262.36,261.72,262.36,265.25,265.25,264.29,263.01,267.18,260.76,256.9,252.09,257.23,255.62,255.62,255.62,255.3,257.23,255.94,256.58,256.26,255.62,257.23,258.51,258.83,259.47,265.9,263.97,263.01,263.01,260.44,260.12,260.12,258.51,259.79,262.68,259.79,258.51,256.58,256.9,257.23,260.76,262.04,263.01,260.12,259.15,257.23,256.9,258.19,260.76,259.47,256.58,254.98,255.94,256.26,255.3,258.83,256.26,253.69,253.69,252.09,255.94,254.66,253.05,252.09,254.34,253.69,252.09,254.66,261.4,266.22,263.65,261.72,261.72,257.55,252.09,247.27,238.92,238.92,238.28,237.32,234.75,233.46,235.39,242.77,243.1,239.56,238.6,239.56,246.31,246.63,244.06,245.99,248.23,244.38,245.02,241.81,241.81,245.02,245.99,247.27,244.38,247.91,247.91,247.91,247.91,248.55,248.23,249.52,245.02,237.96,237.96,235.07,235.07,231.86,228.97,229.93,229.61,229.61,221.58,220.94,222.86,225.11,225.43,226.72,225.75,225.43,226.08,225.43,228.32,225.11,227.04,224.15,224.47,229.61,226.08,226.72,225.43,226.72,226.4,225.43,224.47,226.72,229.29,228.97,227.04,225.43,228.64,240.53,241.81,240.21,236.67,232.18,232.18,228.97,238.92,243.42,242.77,245.02,248.55,248.55,251.12,246.95,246.63,247.27,249.2,249.84,250.48,247.59,250.8,254.98,256.58,258.51,257.55,257.87,253.05,251.45,251.45,251.45,252.73,248.55,246.95,251.45,250.48,253.37,253.37,250.16,248.23,248.88,247.27,245.02,245.66,242.77,241.17,237.64,237.64,228.97,235.39,235.39,235.39,235.39,235.39,237.64,234.43,234.43,234.43,242.13,240.53,236.67,236.67,240.21,240.85,238.6,238.6,238.6,238.6,229.61,230.89,230.89,230.89,230.25,234.1,234.1,225.11,223.19,223.19,223.19,224.79,225.43,225.43,226.08,226.08,227.04,224.47,225.75,226.4,224.15,224.15,223.83,225.43,224.47,223.51,221.9,222.54,222.22,219.97,218.37,217.73,218.05,215.16,220.62,216.76,213.87,214.19,216.12,216.44,217.41,215.16,212.91,212.27,208.73,208.09,216.44,216.12,216.76,218.05,218.05,213.55,213.55,210.98,210.98,208.41,213.55,212.91,217.08,218.69,216.76,218.37,218.05,213.55,213.23,211.62,213.55,217.41,216.44,216.44,214.19,214.52,214.52,210.34,209.7,209.38,204.88,199.42,198.78,194.93,195.57,192.04,188.5,187.86,184.97,184.33,187.54,188.82,190.75,186.26,183.04,180.48,183.37,183.69,181.12,186.9,188.5,188.82,186.58,186.26,184.65,192.68,198.78,195.57,194.28,198.46,196.85,196.21,198.14,198.46,198.78,197.17,196.85,198.14,196.85,197.5,197.5,195.25,192.68,189.79,192.36,193.32,193.32,195.89,193.96,197.5,195.57,192.68,189.79,189.47,191.71,192.68,188.18,188.82,191.71,187.54,184.65,183.37,183.37,179.83,178.55,178.55,178.55,186.58,182.4,179.83,180.48,181.12,179.19,177.59,174.69,175.02,173.09,174.05,169.88,168.91,170.52,170.52,177.26,179.83,180.8,180.48,180.48,177.91,179.19,177.26,180.8,181.76,181.44,179.19,178.23,179.51,184.65,185.29,190.75,191.07,184.01,190.75,192.68,191.39,190.11,190.75,193.32,198.46,199.1,193.96,201.99,198.78,200.39,201.35,197.17,198.46,197.17,194.61,195.89,197.17,195.89,193,194.61,199.74,201.03,193.96,193.64,190.11,189.15,190.11,193.96,191.07,191.71,194.28,190.43,191.07,191.07,188.18,186.26,189.79,186.58,185.93,186.58,181.76,177.59,177.59,178.23,177.91,185.61,186.9,189.47,194.93,193.96,194.28,194.28,195.25,196.21,195.89,193.96,197.5,198.46,198.46,198.46,203.28,204.88,207.45,203.28,197.17,195.89,203.92,203.92,197.82,199.1,202.63,203.28,201.99,201.99,202.95,199.74,204.56,201.03,201.35,199.42,196.21,199.1,196.85,194.28,194.61,194.61,195.25,194.28,197.5,194.93,193.64,193,191.07,192.68,189.47,192.04,192.36,196.85,193.32,193.64,196.21,200.06,202.31,199.42,201.99,201.35,202.95,205.52,202.63,204.24,205.2,200.06,208.73,210.98,211.62,211.95,212.27,209.06,209.7,210.66,210.34,209.7,210.98,209.38,204.24,205.84,207.45,210.34,210.34,210.98,210.02,209.06,209.06,211.62,209.7,207.45,206.17,205.84,207.13,210.02,208.73,212.59,219.65,219.97,219.65,219.97,220.94,225.75,225.75,232.18,229.29,227.68,231.86,230.25,230.25,228,227.68,231.21,228,231.21,230.89,229.61,230.57,228.64,229.29,226.4,228.97,229.93,232.5,233.14,233.46,232.5,231.86,234.43,234.43,231.21,229.93,224.47,223.19,229.61,230.89,230.89,235.71,235.39,231.21,230.25,228,225.75,226.08,224.79,224.15,230.25,226.72,224.15,228.32,224.47,220.94,219.33,219.97,217.08,221.26,218.37,216.76,216.12,216.12,215.16,214.19,212.91,213.87,213.87,215.48,219.01,215.48,214.52,214.52,215.48,214.84,228,228.64,227.04,224.79,226.08,225.75,227.36,226.4,227.68,230.25,231.21,225.43,224.15,223.51,221.26,220.94,222.86,220.3,219.65,219.65,219.65,219.65,219.65,216.76,214.19,211.95,211.95,213.23,219.01,221.26,218.37,216.12,222.86,226.4,223.19,220.94,219.65,219.97,218.37,214.19,216.12,216.12,214.84,220.3,223.83,223.51,227.68,227.68,224.47,225.75,226.4,226.08,227.36,231.86,233.78,232.82,233.46,233.78,233.78,232.5,230.25,228.97,233.46,233.46,233.78,231.21,233.14,228.64,230.25,229.61,233.14,234.43,236.03,233.78,234.75,235.39,234.1,235.71,240.21,240.85,243.74,243.74,245.99,250.48,252.09,252.09,255.62,247.27,245.99,245.99,245.66,239.88,236.35,235.07,234.75,237.32,233.14,228,230.25,239.88,241.17,241.49,237.64,237.96,235.71,238.92,238.6,233.46,236.35,241.49,238.6,238.92,240.85,237.96,237.96,237.96,241.49,237.64,235.07,233.78,236.99,235.39,234.43,234.75,234.1,233.78,234.1,235.07,235.71,235.71,240.53,236.67,234.1,231.86,235.39,232.5,235.39,237.96,238.6,232.18,233.78,233.78,246.95,254.66,253.37,251.12,256.58,256.26,259.47,264.61,263.33,272.96,270.07,273.92,271.36,271.36,268.46,268.46,270.07,268.79,263.97,256.9,253.37,255.62,249.2,244.38,242.45,252.41,245.02,246.31,246.31,248.88,248.88,250.48,249.2,249.2,261.08,261.08,255.94,254.34,251.77,251.45,251.45,251.12,248.55,253.37,251.77,249.52,251.45,243.74,247.91,249.2,241.49,236.03,236.03,243.1,241.81,248.55,248.55,248.23,243.1,241.49,245.66,252.41,255.62,250.8,256.26,260.76,262.04,256.9,258.83,259.47,261.08,262.04,261.72,262.68,262.68,262.68,271.68,279.7,280.67,281.95,281.95,281.31,271.03,278.42,281.63,278.42,279.06,271.03,266.54,269.43,263.33,258.19,259.79,260.76,260.12,269.43,266.86,255.62,229.29,232.82,239.88,235.71,239.88,242.45,244.38,247.91,247.91,257.55,251.45,253.37,251.45,251.45,249.52,244.38,243.42,245.34,237.64,238.6,238.92,232.82,224.79,221.58,221.26,216.76,212.59,208.41,212.91,206.81,206.81,206.81,206.81,202.63,202.31,201.03,202.95,199.74,207.77,206.17,197.5,197.5,196.85,196.85,194.61,195.89,193.64,193.64,189.15,190.43,190.43,195.89,191.07,191.71,190.11,189.47,185.29,189.79,181.76,179.51,186.58,191.39,189.79,190.11,187.22,188.5,184.97,184.01,184.01,183.04,176.62,170.2,162.49,160.24,171.8,182.08,180.8,177.59,181.12,179.83,185.93,187.22,180.8,178.23,174.05,172.13,172.13,170.52,172.45,173.73,171.48,173.41,173.41,179.51,180.15,178.55,174.05,176.3,170.52,170.2,171.8,174.69,174.69,172.13,172.45,170.84,170.84,171.48,174.69,179.51,177.91,184.01,180.15,177.59,173.73,173.09,172.45,174.37,172.45,171.48,171.8,174.37,172.45,172.45,172.45,172.45,172.45,172.45,168.27,163.78,169.24,169.88,173.41,172.45,178.55,178.87,179.19,179.19,179.83,179.83,182.72,188.5,187.54,186.9,184.01,183.69,181.76,180.8,175.02,175.02,175.02,173.41,174.37,172.45,172.45,172.13,176.3,175.66,175.66,184.97,184.97,187.86,193.32,198.14,194.28,192.04,197.17,198.46,193.32,185.61,188.82,188.82,184.97,180.15,170.84,171.8,170.2,181.12,177.26,180.48,181.76,175.66,176.94,177.59,177.91,176.62,178.87,178.87,178.87,179.19,179.19,178.23,178.23,174.37,174.37,174.37,175.34,175.34,175.98,184.97,182.72,184.33,184.01,182.4,179.19,179.51,178.87,175.66,174.05,175.66,173.09,179.51,180.15,180.48,182.4,182.4,185.61,189.79,189.79,192.04,190.11,192.36,191.07,187.22,183.69,186.58,192.04,190.11,191.07,186.26,194.28,196.85,193.32,195.25,192.04,193.32,195.25,204.88,203.28,198.14,197.17,193.96,195.89,201.03,200.71,204.56,207.77,214.19,215.48,217.73,211.95,213.23,211.95,211.62,226.08,226.72,233.14,229.29,221.26,223.83,224.47,220.94,226.4,230.57,228,228.32,230.89,229.93,229.93,224.79,224.79,226.4,226.72,229.29,229.61,225.75,226.72,223.51,223.83,217.08,221.9,224.15,225.11,223.19,225.11,229.61,233.14,235.71,242.13,245.66,254.98,251.12,257.87,257.87,268.14,272,274.25,276.49,267.5,270.39,269.43,276.17,288.21,288.21,288.21,288.21,288.21,288.21,303.15,299.61,294.16,305.07,313.74,314.39,315.03,313.1,316.63,309.89,317.28,327.55,319.52,322.74,334.3,345.22,356.78,336.87,323.06,318.56,314.39,323.06,332.37,331.09,330.12,312.14,323.06,314.07,309.89,323.06,304.43,310.53,318.88,330.12,332.37,322.74,323.7,332.05,335.58,337.51,348.11,351.64,348.11,346.82,344.57,349.71,336.54,330.12,346.5,345.54,341.36,354.85,358.06,356.78,356.78,375.72,383.75,385.04,385.04,412.65,443.48,446.05,452.79,445.73,446.37,445.73,441.88,450.55,462.11,478.16,479.45,466.28,480.09,489.08,488.44,488.44,512.2,521.52,516.06,515.41,482.98,537.89,543.03,511.56,509.31,534.36,532.43,538.86,573.54,581.89,581.89,581.89,581.89,610.15,610.47,619.78,642.26,653.5,700.06,695.25,695.25,626.53,552.99,615.29,604.37,557.16,603.4,610.15,603.4,589.27,605.97,622.67,669.56,643.87,640.33,598.27,609.18,606.94,578.36,578.36,566.15,536.93,609.02,572.9,597.94,620.1,631.02,675.98,655.11,661.53,645.47,663.13,677.59,698.46,693.64,688.82,703.28,698.46,720.94,704.88,720.94,712.91,725.75,708.09,708.09,746.63,746.63,854.21,871.87,862.24,916.83,895.95,912.01,950.55,868.66,902.38,884.71,886.32,961.79,939.31,939.31,960.18,985.87,961.79,1017.98,1120.75,1157.68,1157.68,1128.77,1056.52,948.94,1034.04,971.42,960.18,1035.65,1082.21,1101.48,1112.72,1164.1,1136.8,1135.2,995.5,1093.45,1151.25,1090.24,1037.25,1072.58,1009.96,918.43,993.9,1021.19,950.55,891.14,892.74,915.22,817.28,844.57,897.56,818.88,818.88,783.56,831.73,836.54,867.05,801.22,815.67,706.49,669.56,664.74,842.97,769.11,770.71,789.98,740.21,741.81,738.6,769.11,820.49,860.63,881.5,881.5,862.24,794.8,870.26,903.98,825.31,825.31,839.76,854.21,825.31,834.94,838.15,804.43,802.83,820.49,867.05,865.45,865.45,863.84,833.33,799.61,798.01,814.07,810.85,838.15,879.9,887.93,916.83,916.83,916.83,867.05,875.08,862.24,886.32,886.32,886.32,873.47,862.24,841.36,841.36,804.43,745.02],"어플라이드 머티어리얼즈":[null,100,99.04,99.82,100.89,101.1,101.28,103.85,102.81,102.78,102.81,102.1,103.6,102.96,101.85,100.71,100.53,104.49,105.13,103.78,100.39,102.67,103.28,105.49,106.95,109.48,109.51,111.69,112.83,113.57,113.57,113.57,113.43,114.57,114.71,107.23,112.01,112.33,112.61,115.82,116.53,115.25,114,114.11,114.5,117.78,115.82,115.57,116.17,116.07,117.6,117.21,117.21,118.74,117.21,116.35,114.96,114.96,113.79,114.86,114.36,114.14,116.78,118.03,119.24,118.67,120.38,120.38,118.63,120.02,120.24,120.56,120.24,121.23,122.62,121.05,124.83,122.34,122.02,124.8,124.47,125.79,125.33,126.61,126.83,126.15,125.83,126.33,125.51,126.43,125.33,127.08,127.08,130.32,130.07,128.82,129.32,129.78,129.03,131.28,130,131.35,131.31,131.71,132.49,133.17,135.8,136.94,136.34,138.65,139.12,139.94,140.97,137.44,138.3,138.4,138.83,138.44,138.3,138.48,138.55,138.58,138.55,138.94,136.73,137.44,138.69,138.44,136.09,134.56,133.67,133.67,135.45,135.55,139.83,142.11,141.75,144.07,145.32,145.03,147.24,144.67,148.56,148.59,148.02,148.27,149.02,147.99,149.77,152.73,154.9,154.76,157.89,160.56,152.33,156.43,157.04,159.35,159.99,159,160.38,162.09,162.09,162.31,163.45,163.88,166.73,166.44,165.91,168.36,168.97,159.39,157.96,159.78,156.68,153.76,153.58,157.78,154.47,155.4,154.4,157.07,154.08,149.23,152.08,147.63,147.17,146.1,146.1,150.05,150.02,155.11,157.5,161.74,161.31,161.38,164.3,164.41,166.08,168.08,168.33,166.76,166.65,165.3,169.04,164.02,161.2,157.86,157.11,152.23,152.12,152.55,156.61,156.39,156.07,149.73,153.47,155.97,156.32,158.39,153.62,157.82,154.29,158.35,156.82,155.75,154.29,155.43,156.82,161.99,160.74,160.67,160.67,158.46,159.35,161.1,158,162.38,162.63,164.3,167.62,167.94,171.18,171.93,168.44,167.97,170.18,165.05,163.59,173.99,180.33,185.57,185.54,184.68,183.83,183.22,186.68,187.71,187.35,189.63,189.92,192.16,196.08,196.4,197.15,197.11,199.82,200.82,200.86,197.01,199.25,201.96,199.15,201.03,198.47,200.43,201.46,200.68,201.18,202.78,197.65,200.78,203.17,201,198.68,206.06,201.25,205.27,209.48,205.49,205.49,206.31,202.85,204.24,188.49,187.99,184.93,177.31,178.41,181.72,186.32,183.22,183.9,179.8,180.83,182.79,187.17,190.24,188.67,189.85,184.86,185.46,185.46,181.87,184.11,184.25,182.12,188.96,192.3,193.41,194.51,199.22,195.44,189.88,189.53,190.42,190.42,194.16,204.28,204.49,204.49,204.7,205.88,202.64,198.65,203.49,197.11,190.17,191.06,189.81,180.55,172.11,179.02,173.46,162.99,171.29,176.34,176.52,185.11,192.34,196.05,196.05,201.85,199.96,199.75,203.1,209.51,205.34,205.17,203.31,206.73,205.31,213.72,211.69,211.51,219.49,217.21,212.65,214.57,214.75,211.76,208.41,211.01,216.53,210.05,197.29,208.3,197.51,192.59,198.11,198.11,188.42,192.3,197.93,193.41,186.46,188.88,195.23,195.76,201.03,199.75,202.6,206.13,194.98,182.37,182.01,178.77,173.57,175.06,179.87,175.99,176.95,181.37,180.01,180.66,187.25,187.35,190.42,192.84,197.83,195.37,196.86,192.7,196.54,192.23,176.38,178.13,179.02,179.34,180.87,181.15,181.15,185.32,183.79,180.9,186.11,186.28,188.49,187.14,182.58,182.22,177.73,181.19,181.62,177.02,175.67,172.14,172.96,173.07,174.53,170.86,166.41,166.26,161.2,161.35,164.55,162.74,159.6,159.6,161.88,164.34,165.73,166.51,161.03,162.74,164.34,164.98,168.51,172,166.26,166.58,165.41,163.56,163.73,168.04,172.07,170.68,173.25,170.89,171.39,173.99,176.27,176.81,178.77,175.13,171.46,171.89,172.35,169.26,168.97,155.93,155.08,155.9,153.15,152.44,152.23,155.86,154.61,153.54,153.69,153.26,153.26,151.83,151.41,143.46,141.97,141.08,139.58,136.77,138.55,139.29,137.87,139.62,139.08,140.33,141.18,139.29,137.44,136.3,136.62,137.69,136.59,138.58,138.65,134.98,132.67,130.35,127.25,122.66,116.82,120.02,119.1,123.83,124.55,120.84,122.16,119.45,119.42,113.32,116.28,115.28,110.87,115.5,117.14,125.94,125.65,122.27,124.23,125.58,124.47,122.12,116.21,119.31,119.63,124.76,126.11,122.62,127.43,125.37,125.37,124.87,128.29,128.25,132.21,130.17,132.81,136.59,126.22,126.22,123.58,119.84,121.73,121.2,121.84,120.09,116.32,116.39,118.56,112.33,110.08,107.98,103.28,103.28,109.16,112.4,115.35,116.64,119.27,112.36,120.06,122.19,117.24,122.19,123.83,123.9,120.63,120.24,119.84,123.05,127.22,127.22,122.69,122.23,134.73,139.62,137.87,136.09,141.08,139.22,140.04,138.58,139.37,143.5,142.22,141.72,142.14,144.96,145.53,145.03,139.29,139.29,140.01,138.94,138.33,140.47,141.29,141,138.15,136.59,137.37,139.22,138.69,135.63,133.84,134.45,137.19,137.91,137.51,138.69,143.89,142.5,143.82,140.97,147.24,142,140.36,141.18,138.69,137.19,141.29,146.53,146.03,151.16,151.83,153.33,152.9,149.66,150.23,151.3,153.15,152.16,155.75,156.36,156.57,156.57,156,156.15,158.39,158.35,159.1,157.61,157,154.54,155.68,156.61,153.58,149.8,148.13,145.85,145.35,139.26,142.54,147.84,148.41,152.12,143.75,147.03,144.25,142.29,140.72,140.72,138.97,140.26,141.61,137.83,138.15,144,144.6,147.42,147.88,153.69,155.86,147.84,148.38,146.88,144.28,150.73,151.51,153.94,153.05,150.8,149.55,155.25,159.21,159.99,162.74,159.1,159.14,159.14,156.68,154.79,156.64,159.32,161.31,165.69,164.87,163.91,164.66,171.61,170.32,180.73,181.8,185.75,181.05,180.76,180.51,180.73,175.88,172.68,169.4,161.95,165.05,166.3,170.5,167.97,165.51,171.21,166.41,168.01,166.12,167.79,166.48,166.83,167.55,160.74,162.49,162.13,163.52,168.54,171.07,171.07,169.61,176.38,179.37,178.48,180.48,178.8,183.68,182.58,182.94,181.4,182.4,185.57,184.11,181.55,184.4,182.26,185,185.79,176.1,177.77,178.2,176.2,176.84,181.26,180.44,175.67,181.12,181.72,184.36,185.04,188.49,183.68,185.75,184.11,187.53,185.18,180.01,196.19,198.5,202.89,197.79,196.69,193.3,197.58,198.57,199.07,198.86,199.29,199.61,201.6,201,203.49,202.92,221.09,222.12,217.1,212.5,201.07,199.29,207.62,205.09,207.66,207.66,206.27,202,197.15,199.82,198.93,201.64,201.64,201.71,210.33,215.03,213.29,213.61,216.57,215.11,216.14,220.2,217.6,219.1,219.1,218.42,217.92,217.06,217.46,221.59,218.06,213.36,219.52,219.38,220.77,218.99,220.2,222.12,220.63,225.19,223.9,223.9,225.15,227.61,227.61,220.88,210.37,214.43,213.11,214.64,206.59,212.75,224.47,227.29,225.12,219.84,224.15,229.6,232.88,240.01,238.15,238.15,232.13,240.15,236.55,228.96,217.6,209.69,213.07,203.06,207.05,214.32,206.77,215.6,210.65,205.88,185.5,200.11,187,160.71,181.3,144.39,159.81,139.58,143.18,135.34,143.11,160.81,159.35,175.28,160.49,168.51,163.23,154.26,154.04,150.62,164.41,169.43,183.33,176.67,176.67,177.7,186.93,179.44,186.07,189.53,180.37,172.18,185.64,181.33,184.32,181.8,179.62,193.59,176.99,167.05,169.5,174.03,179.91,182.58,191.7,192.41,186.43,183.43,193.91,185.39,193.66,197.61,202.64,196.01,193.77,193.77,196.44,200.93,194.76,200.14,198.4,198.75,205.95,207.09,214.43,213.4,213,213.25,197.4,201.46,203.24,208.55,213.75,215.11,217.14,218.28,216.74,213.64,213.68,207.98,210.4,215.35,212.61,217.31,217.31,226.08,221.52,223.62,226.18,222.98,219.13,222.8,221.23,222.09,221.95,227.04,227.32,228.79,226.68,215.96,224.47,221.95,225.33,229.5,229.18,231.6,231.03,231.1,226.61,226.47,232.42,229.64,236.91,231.81,240.9,238.48,236.66,234.66,227.25,221.84,227.08,228.18,227.15,220.98,224.69,219.45,220.48,231.85,218.95,217.17,217.17,198.18,196.65,196.37,195.94,201.14,203.78,201.18,200.71,200.04,204.2,206.23,203.95,205.88,207.45,211.47,212.5,211.79,216.07,207.37,215.89,215.18,217.74,223.01,225.47,230.42,230.46,227.93,226.26,224.44,221.05,221.8,221.27,219.81,217.14,212.01,209.58,204.2,211.97,211.01,214.93,220.27,231.07,249.2,251.26,254.01,247.2,253.51,248.66,259.39,265.34,264.94,269.72,275.2,273.32,286.78,295.51,289.06,289.06,294.48,293.84,300.21,303.85,306.73,316.49,317.56,319.74,312.86,313.11,314.57,315.28,315.18,315.46,311.72,306.7,307.84,305.09,299.36,303.99,303.99,302.35,300.21,309.87,307.45,309.48,319.2,323.58,336.87,340.43,348.98,356.29,349.31,376.91,367.44,367.44,389.1,384.18,384.65,378.8,385.18,375.95,351.19,360.35,344.42,360.56,369.04,355.79,367.79,358.78,378.3,375.42,377.2,402.57,415.75,415.75,421.62,412.22,404.1,425.58,410.51,413.75,437.51,405.88,421.05,435.52,418.6,411.26,385.61,404.17,376.49,406.91,401.43,417.49,407.16,409.26,422.16,427.15,407.13,409.19,425.12,414.61,431.42,426.51,458.28,447.84,451.59,475.95,504.17,504.17,509.62,497.11,495.69,496.44,494.87,480.94,481.3,477.88,478.84,476.42,466.3,458.1,481.12,469.36,480.44,489.13,487.28,483.4,482.33,472.78,473.28,458.57,464.16,469.29,473.64,444.21,440.15,409.26,427.22,444.71,440.22,433.95,444.6,464.23,458.35,479.44,489.85,487.71,490.99,492.09,492.09,492.38,495.23,485.86,498.22,495.08,484,479.69,488.64,487.42,495.3,493.91,487.99,489.21,467.51,473.99,475.38,482.72,492.55,485.18,502.28,505.59,507.3,491.45,492.2,492.2,487.28,480.48,472.14,480.58,487.35,485.54,483.26,474.53,456.64,458.21,470.15,491.63,488.71,493.16,493.34,480.58,488.81,489.85,498.5,505.91,506.45,508.59,506.84,508.19,505.88,491.84,480.3,460.35,462.77,469.15,458.85,453.76,460.28,453.15,468.44,468.26,473.17,472,486.46,484.68,481.4,475.45,478.98,483.9,483.9,486.25,475.81,480.94,487.5,496.76,499.25,503.14,513.32,501.6,482.83,481.58,491.98,502.71,505.59,508.51,473.42,456.96,458.6,460.03,446.03,456.25,450.73,455.58,449.66,454.22,451.59,456.75,470.5,468.79,474.81,479.52,477.31,475.03,484.25,483.65,470.25,470.82,484.57,486.82,497.01,503.06,508.55,534.84,546.1,544.92,556.79,535.8,548.27,558.67,556.72,562.38,555.68,565.51,534.49,525.65,530.53,530.85,530.85,510.47,538.72,524.37,540.33,521.87,519.52,525.04,558.92,560.35,543.82,544.1,524.05,526.29,547.42,522.62,520.66,516.6,539.44,542.64,553.94,553.94,579.69,568.72,573.49,562.81,560.6,569.75,564.16,547.7,556.96,537.26,532.92,543.11,568.4,559.96,594.94,594.94,542.79,509.69,495.72,481.15,496.22,473.78,483.01,463.66,471.86,492.27,493.8,501.46,486.32,482.97,484.97,494.3,513.72,497.93,472,469.75,498.18,502.17,486.18,475.06,475.06,464.05,455.5,475.31,483.51,478.09,461.74,474.46,465.41,447.95,424.72,442.29,458.21,445.21,440.47,427.97,443.21,464.84,470.22,481.44,478.09,482.65,468.19,493.73,488.28,490.42,503.88,483.79,469.54,453.9,461.13,433.59,425.12,436.05,427.36,414.11,408.12,416.32,403.85,403.85,409.23,417.03,419.99,412.15,401.85,407.8,388.03,387.64,408.37,393.12,402.46,405.42,423.26,404.24,400.78,376.74,381.83,370.22,380.33,398.5,393.59,416.25,396.65,394.51,379.27,391.63,379.73,386.64,409.94,425.65,425.65,417.85,407.77,417.99,409.55,409.69,412.08,400.64,382.04,362.95,343.14,344.21,347.06,319.17,320.02,320.02,339.05,334.66,332.31,346.85,347.74,338.51,327.54,324.12,307.34,307.34,306.38,308.37,323.3,324.87,315.71,316.1,317.35,326.58,336.55,331.81,349.95,364.2,369.93,362.2,359.81,352.37,368.58,374.63,377.56,379.05,374.03,388.35,395.65,390.52,384.15,355.04,374.24,375.95,393.23,391.09,386.5,377.63,385.71,372.75,359.14,363.13,361.52,374.06,351.98,343.93,336.73,335.13,327.08,325.04,325.04,321.66,327.54,334.13,343.82,343.07,322.02,322.91,316.78,316.6,319.63,313.93,310.26,302.96,300.29,295.48,299.79,306.38,300.75,291.88,307.27,318.53,317.85,313.93,294.26,282.12,271.82,270.79,282.94,266.55,265.09,268.01,275.24,280.23,293.62,302.6,311.83,314,308.3,319.63,314.54,319.88,312.65,307.45,326.68,338.58,347.2,336.23,373.32,393.77,383.36,393.52,371.29,372.11,373,374.56,381.33,383.58,383.58,376.99,368.61,367.83,390.45,381.23,380.16,379.16,373.03,378.02,386.93,382.4,389.63,398.54,390.59,372.5,373.1,370.47,368.72,377.27,347.7,346.35,346.35,339.65,335.7,346.06,346.92,346.92,344.6,353.79,348.84,371.46,379.37,384.89,392.09,392.59,391.77,391.77,389.78,390.81,378.2,390.63,406.7,402.53,405.95,411.76,400.78,385.46,397.19,423.98,442.68,427.43,419.27,429.36,413.07,413.54,408.87,415.14,421.95,425.58,411.08,411.26,411.26,396.44,393.34,402.24,396.54,399.25,413.79,417.74,421.98,423.8,422.3,414.57,422.69,416.96,407.52,412.68,428.71,422.09,437.58,436.77,441.9,428.93,423.44,437.41,425.83,423.48,414.68,426.97,435.02,437.58,435.77,427.93,417.96,407.73,407.73,415.03,414.61,403.14,404.24,402.21,398.25,396.4,393.09,407.52,404.2,404.74,394.05,392.98,397.86,402.67,402.39,399.57,403.6,400.61,413.47,412.36,405.56,411.15,411.33,413.57,431.46,430.78,447.81,462.84,452.26,450.84,443.5,433.67,464.8,484.72,484.72,486.53,474.88,480.33,479.62,476.42,477.16,480.98,485.22,484.93,498.79,505.13,502.92,499.15,494.94,494.94,493.48,486.89,494.91,484.75,498.04,522.09,513.11,513.82,514.93,518.24,518.24,506.8,500.11,497.22,500.75,490.06,494.8,508.19,508.51,518.35,514.82,505.09,477.52,485.93,492.87,498.97,495.26,520.63,541.25,540.04,543.75,524.87,526.58,518.92,535.73,527.29,517.14,515.18,494.58,505.49,499.04,492.52,490.17,508.23,530,526.72,527.25,507.73,514.29,518.06,534.31,537.76,544.21,548.59,548.59,547.24,545.71,528.07,525.58,522.66,512.9,515.07,515.03,492.52,499.72,490.59,487.96,481.62,485.11,486.6,477.66,481.15,492.41,493.23,497.01,487.07,496.26,496.19,499.79,499.29,503.74,506.52,516.57,502.81,502.32,508.44,503.92,478.91,477.81,478.2,480.58,463.52,466.12,467.76,466.8,471.5,481.97,493.44,497.86,500.04,504.95,513.82,510.05,536.8,533.45,548.91,553.51,551.51,529.36,543.53,531.71,532.53,532.53,535.59,537.26,527.47,532.1,533.59,540.04,528.22,520.66,515.5,528.64,526.26,552.69,560.1,559.28,576.2,576.95,571.29,578.3,559.03,574.96,577.31,577.31,585.25,585,581.12,577.38,549.95,539.54,531.92,530.82,539.94,538.05,533.7,541.33,538.83,538.83,547.77,546.38,571.21,598.29,599.57,595.12,620.38,615,594.58,600.21,592.23,585.32,594.83,599.14,609.51,601,608.84,619.49,662.06,660.99,642.36,663.31,668.54,710.97,710.97,673.82,678.05,711.54,702.39,725.15,722.69,703.74,718.28,749.02,746.31,738.83,755.86,757.43,732.31,717.39,730.1,714.5,715.18,707.7,715.11,717.28,730.53,750.98,749.02,742.64,736.27,741,734.7,734.7,743.46,734.27,738.8,724.58,740.47,744.71,749.59,745.46,758.75,740.51,732.74,746.28,712.11,692.27,676.06,674.96,688.42,698.47,703.6,724.55,731.24,707.7,691.09,705.06,727.08,744.07,738.58,738.72,735.06,747.17,736.12,747.49,774.81,762.49,755.54,783.58,783.04,777.16,776.45,786.93,786.93,788.46,780.37,771.43,766.23,763.13,756.04,795.76,789.99,789.92,812.83,819.27,846.63,846.28,844.42,865.19,882.9,882.9,854.97,838.65,818.81,834.59,827.11,828.39,840.72,845.78,858.07,866.8,866.8,864.23,877.41,895.87,908.34,859.49,867.12,874.78,875.81,784,775.38,749.06,796.12,782.51,735.77,720.77,735.55,732.35,700.89,755.97,699.32,647.7,647.99,653.05,635.95,678.84,681.08,687.89,715.35,718.31,754.65,740.65,751.48,734.45,744.99,713.22,722.02,699.07,697.44,687.17,687.5,702.74,702.74,653.26,649.73,642.11,622.55,632.53,634.31,662.42,652.69,671.43,668.26,671.86,663.13,700.78,684.57,691.27,701.03,702.92,746.74,730.03,719.81,702.53,716.6,711.04,719.52,712.97,715.64,730.53,726.61,730.53,761.99,680.51,657.61,652.8,663.91,657.14,651.94,650.87,654.61,664.48,660.28,677.31,660.14,646.88,653.3,647.74,664.34,668.04,691.45,684.11,671.75,664.8,651.19,662.63,601.64,608.23,603.17,607.37,626.11,623.01,621.84,617.03,610.33,610.33,622.41,652.9,652.51,645.39,612.86,616.39,612.26,599.11,609.65,602.35,603.31,603.53,606.84,589.42,575.13,582.79,596.58,599.82,599.82,596.9,594.34,582.97,579.37,583.79,605.84,632.28,633.49,630.53,630.53,611.51,608.69,618.63,635.48,664.34,684.18,684.18,687.1,696.51,679.37,665.3,621.91,615.78,624.44,647.38,642.5,636.98,636.12,643.64,651.23,641.25,654.29,652.65,644.42,656.47,602.78,602.78,612.75,620.09,627.04,612.68,600.53,589.74,600.32,558.03,563.13,541.97,544.6,553.33,539.86,554.61,534.34,523.66,531.03,534.2,554.54,553.83,546.88,550.27,549.98,541.93,552.01,547.35,536.8,526.11,516.78,516.99,518.92,526.36,482.76,452.26,473.28,459.42,533.42,492.48,516.35,514.89,518.17,492.3,489.7,489.7,482.94,492.7,511.51,534.98,539.9,537.19,532.78,536.91,530.67,552.55,550.8,545.17,555.08,555.75,554.36,598.47,616.42,620.38,622.55,589.85,591.16,590.42,577.95,571.86,561.13,561.13,576.52,575.67,568.15,558.43,560.28,576.2,576.88,584.93,594.01,604.88,619.06,615.57,623.44,607.73,628.96,620.2,615.75,615.75,603.71,612.61,641.9,652.19,653.79,652.69,652.19,654.65,676.91,680.62,680.62,679.66,694.66,696.08,705.49,705.13,702.17,709.98,694.01,685.86,678.45,686.18,666.69,666.23,670.18,661.52,677.84,671.21,674.71,641.47,641.22,651.3,638.23,634.63,652.48,658.6,656.86,671.36,676.99,670.61,576.27,582.58,577.91,573.42,569.43,578.87,577.09,586.07,585.64,588.78,572.71,572.71,561.35,556.64,563.73,579.8,577.31,582.47,582.19,606.16,597.79,608.94,618.24,634.59,676.02,677.24,714.36,715.6,717.63,711.08,726.47,730.14,729.39,775.7,796.54,774.96,797.68,753.69,774.88,784.82,747.95,781.9,777.31,810.76,811.26,801.53,812.72,805.13,785.75,813.93,814.93,824.12,810.97,839.86,828.46,830.42,846.85,820.06,858.18,831.96,819.63,837.48,814.64,821.98,795.26,805.17,814.78,802,837.66,784.57,798.04,822.62,863.77,890.52,890.52,898.65,907.55,945.24,957,959.89,954.76,955.33,951.69,980.23,962.27,923.44,930.78,922.12,884.47,903.1,913.47,922.73,927.08,929.03,929.03,933.02,937.12,926.15,915.53,957.86,1012.9,1054.54,1040.97,1003.35,1072.96,1094.55,1086.11,1075.49,1136.73,1164.98,1164.98,1133.7,1158.67,1135.7,1148.49,1138.08,1185.29,1199.68,1216.03,1148.27,1169.93,1135.27,1060.21,1082.97,1148.95,1177.66,1172.32,1210.83,1169.9,1264.37,1264.37,1279.41,1315.64,1317.53,1337.3,1330.78,1346.38,1407.02,1338.51,1326.33,1325.9,1251.59,1274.53,1234.52,1156.89,1207.48,1232.21,1250.69,1201.53,1216.71,1233.27,1255.65,1244.99,1272.57,1272.03,1288.88,1332.35,1315.78,1206.09,1201.18,1151.12,1217.63,1260.42,1241.43,1241.43,1256.22,1262.24,1374.14,1417.21,1423.19,1409.8,1409.48,1404.56,1389.03,1414.11,1395.15,1404.81,1437.41,1438.94,1485.71,1442.32,1357.71,1362.99,1405.38,1386.11,1394.3,1463.56,1526.97,1462.91,1551.26,1580.41,1536.16,1555.43,1569.5,1555.47,1473.35,1449.63,1520.66,1522.48,1539.58,1539.58,1620.56,1596.9,1602,1603.35,1632.24,1745.81,1784,1787.32,1613.86,1753.37,1778.45,1770.61,1968.79,2020.84,2086.85,2024.33,2112.29,2198.47,2198.47,2280.66,2087.21,2098.22,2379.76,2233.13,2474.67,2575.7,2318.88,2148.34,2148.34,2111.83,1975.42,2032.42,2097.11,2146.42,2049.84,2122.19,2064.23,1998.33,1886.93,1872.82,2011.22,1973.35,2004.99,1910.4,1841.43,1697.4,1554.86,1787.57,1808.59,1846.13,1947.35,1903.24,1879.16,1920.7,1860.06,1872.5,1952.8,1904.31,1806.84,1907.05,1832.31,1767.62,1767.76,1753.9,1724.94,1710.15,1709.16,1718.42,1644.71,1633.02,1574.1,1562.02,1552.94,1619.91,1619.91,1684.32,1670.29,1617.42,1626.26,1511.26,1500.43,1479.8,1487,1583.79,1653.87,1683.15,1689.99,1689.53,1727.82,1734.09,1824.05,1821.8,1885.64,1923.9,1931.88,1889.1,1854.83,1815.35,1806.31,1772.46,1653.87],"테슬라":[null,100,98.7,101.32,103.59,101.32,101.82,103.18,102.97,102.92,103.82,101.76,100.62,97.09,95.68,95.37,96.97,98.32,99.2,96.72,94.32,95.95,92.34,93.52,93.6,96.01,94.15,93.9,97.28,98.29,98.29,100.07,99.8,96.47,96.38,92.56,92.35,95.06,94.58,98.29,97.85,97.8,97.92,100.83,101.11,100.54,103.04,103.17,106.25,105.69,106.08,108.56,108.56,111.71,111.82,109.25,108.74,108.74,110.42,115.51,115.39,116.54,117.69,116.98,116.9,116.83,120.99,120.99,119.88,121.3,124.04,124.54,126.67,129.57,129.49,128.5,128.72,127.54,128.2,126.83,128.01,127.9,131.17,131.03,133.37,136.99,137.01,142.79,142.99,142.36,136.86,138.53,138.53,141.16,139.18,130.27,130.78,125.3,127.21,127.23,127.46,128.02,127.84,126.5,125.63,124.62,124.01,125.27,131.29,130.14,133.35,133.07,133.29,127.57,129.77,129.65,133.92,137.51,141.19,141.15,141.43,141.62,151.91,154.55,150.12,152,153.96,158.97,157.1,151.06,154.7,154.7,153.4,152.79,155.47,153.94,155.51,156.75,159.68,157.84,157.06,159.82,164.28,162.28,158.27,150.35,156.91,156.32,163.48,165.5,164.42,165.29,160.74,161.32,155.77,159.31,158.18,157.93,154.63,157.86,161.23,165.46,165.46,170.53,173.53,173.21,172.94,176.74,179.56,183.02,188.29,181.83,182.69,191.31,193.71,191,189,188.18,189.43,191.54,194.7,195.13,192.1,184.4,188.92,183.58,184.02,179.44,179.44,166.45,157.16,159.39,160.83,166.52,167.69,164.58,166.8,162.62,167.03,165.52,167.89,167.12,174.3,172.82,174.98,170.2,170.51,164.61,162.62,165.84,176.63,181.62,180.74,185.85,184.99,180.86,182.11,185.13,184.38,184.68,179.09,176.82,171.93,173.71,179.52,179.6,177.12,175.9,176.76,179.73,181.11,180.86,180.86,177.9,175.32,178.42,174.75,185.07,184.6,186.37,192.17,193.28,195.92,190.88,190.28,186.49,178.66,175.56,175.69,173.51,172.82,173.58,173.8,177.16,180.66,180.82,181.61,174.52,180.95,180.45,181,180.94,178.41,181.03,183.02,179.03,175.61,171.5,171.67,165.81,165.98,163.28,162.88,168.71,163.39,152.29,155.76,154.08,155.74,154.9,154.19,154.19,160.5,157.09,158.41,159.02,160.32,157.11,161.73,159.08,159.08,160.58,161.22,161.59,156.5,157.17,155.99,155.31,154.55,159.41,158.38,160.36,167.38,173.54,172.53,171.95,174.77,172.44,168.49,167.41,168.78,165.49,165.49,161.46,158.59,160.48,158.44,163.11,161.44,160.1,161.1,171.19,169.81,170.37,171.98,171.1,171.1,173.05,176.66,175.34,178.12,178.9,179.53,176.02,171.82,174.47,177.87,175.98,180.3,177.73,174.93,169.52,169.95,175.56,160.41,157.97,160.67,164.7,164.02,170,170.72,170.72,170.36,169.61,176.16,179.15,181.88,178.61,174.58,168.4,170.54,169.64,167.01,169.1,167.47,166.49,175.82,173.96,166.22,165.69,163.53,159.56,158.03,161.08,157.29,153.45,154.79,142.07,131.18,135.43,135.43,128.48,136.14,146.02,155.57,152.31,147.4,155.06,153.14,149.65,152.84,148.19,146.4,149.28,152.7,147.7,144.2,144.25,142.84,145.28,149.65,149.56,152.62,153.25,144.75,149.66,154.07,153.67,156.15,155.22,153.2,148.58,144.61,145.78,144.8,140.87,144.77,139.95,142.01,141.39,141.9,141.9,144.4,148.45,144.89,148.5,151.01,148.15,162.59,160.85,161.65,169,174.43,175.45,182.04,182.27,188.71,179.41,184.33,176.84,169.78,169.46,174.04,175.31,178.07,174.52,170.51,158.19,158.19,157.33,157.19,162.08,164.1,162.31,161.17,162.27,157.8,164.21,164.8,162.96,159.57,154.29,151.36,157.11,156.05,151.23,147.66,151.72,153.09,177.87,177.18,174.03,193.16,188.46,179.35,180.9,181.37,176.91,172.35,170.7,155.46,156.96,163.81,163.68,162.89,164.28,162.47,158.7,155.21,154.27,153.51,153.51,147.04,142.86,142.97,133.96,145.29,142.2,147.85,147.3,150.22,150.04,145.01,152.17,151.81,152.21,152.5,153.17,157.54,156.49,134.74,158.11,153.18,150.02,143.42,133.3,127.5,133.73,130.72,128.35,131.69,132.1,140.75,138.3,134.3,132.31,132.79,149.68,146.81,160.23,168.39,170.4,167.88,171.66,175.2,176.28,173.73,173.56,177.17,178.82,178.37,168.58,172.37,175.05,177.31,180.3,179.87,176.83,172.1,172.1,165.81,176.07,175.01,177.02,173.61,178.35,182.43,183.04,183.04,184.75,182.16,185.82,186.64,186.56,191.74,186.1,177.3,171.51,169.44,160.49,162.72,150.32,150.32,165.94,160.87,169.9,169.36,157.81,152.85,161.67,170.45,170.65,172.27,175.55,176.71,170.17,175.27,176.1,176.74,153.81,153.81,152.11,146.35,148.34,151.16,150.82,151.37,157.13,156.24,158.88,159.22,163.53,161.43,156.49,155.62,159.2,158.67,156.82,154.58,156.67,156.67,155.53,153.97,148.2,149.97,152.04,151.57,160.16,162.78,150.01,145.21,140.73,140.57,140.75,144.59,148.04,144.2,147.05,147.55,140.16,137.14,136.11,139.23,139.44,134.61,132.52,136.26,139.86,141.78,142.42,147.16,145.48,148.5,136.27,139.92,139.03,138.57,140.48,136.59,136.23,135.56,139.11,138.02,139.06,139.06,133.71,134.29,131.63,126.01,119.66,122.88,121.46,119.08,124.22,129.78,129.94,125.72,124.59,123.14,121.89,115.52,118.22,118.03,116.19,107.39,104.5,104.36,98.08,99.48,97.01,97.01,96.03,96.62,95.78,94.22,91.07,98.52,100.04,104.8,104.07,108.33,110.48,106.49,108.85,109.37,114.51,114.37,115.23,111.76,112.9,113.81,111.83,111.58,113.4,113.71,115.6,114.27,119.54,119.54,118.62,117.22,117.07,121.58,121.42,124.72,129,128.43,129.69,129.02,131.38,130.11,132.4,134.79,116.44,116.04,119.98,123.28,122.95,119,119.25,116.19,117.42,118.78,121.27,119.59,116.54,119.59,111.76,109.73,111.92,115.43,114.94,112.38,113.05,107.58,109.41,108.94,109.71,112.82,114.81,114.81,114.5,112.3,116.83,115.74,117.95,119.86,125.74,125.12,124.78,123.56,124.57,123.91,125.49,122.45,122.76,113.59,116.38,123.43,123.22,122.57,124.52,123.72,118.58,117.77,120.97,122.16,124.44,124.54,126.15,130.76,131.24,132.18,133.31,130.76,129,130.06,129.6,152.5,166.98,166.77,160.92,160.3,160.26,159.44,161.55,161.43,166.19,170.75,171.56,175.61,178.07,176.13,177.78,179.21,178.1,182.95,179.24,180.57,169.48,171.16,167.38,168.59,168.59,167.9,170.41,171.09,169.47,168.12,170.93,172.78,177.52,179.48,183.03,182.38,194.14,192.86,200.07,205.61,206.4,213.33,216.4,216.4,219.3,219.01,211.03,212.88,218.95,225.44,229.78,238.7,250.44,244.94,243.32,267.09,273.74,263.85,261.3,259.78,259.78,278.46,289.84,291.18,287.43,283.97,288.48,295.65,326.1,331.06,396.93,451.41,373.87,381.13,380.68,392.49,394.07,390.46,409.14,407.12,407.12,436.82,466.86,457.69,458.5,424.3,407.06,396.32,345.53,339.93,378.41,379.38,381.41,368.7,357.99,309.4,328.4,322.75,285.25,278.16,226.49,218.92,183.82,217.62,217.56,221,256.98,274.41,268.77,261.75,255.52,266.65,245.06,231.27,244.27,262.7,277.57,279.29,291.59,291.59,331.26,361.25,371.4,379.22,383.64,379.81,349.46,372.56,359.08,369.01,406.47,391.39,407.36,397.88,356.89,387.35,390.93,398.24,396.95,416.99,412.85,411.89,402.5,408.8,406.68,414.04,411.18,415.02,421.15,415.69,415.69,416.71,417.4,410.06,424.91,457.03,448.61,449.32,439.87,450.69,483.4,478.69,521.63,495.06,475.95,504.25,499.79,504.7,510.9,509.34,505.99,509.79,488.96,501.75,488.39,513.64,549.49,569.76,615.06,615.06,697.97,707.27,695.07,709.52,786.04,761.82,771.87,786.73,763.65,763.75,836.09,798.11,810.3,769.97,721.08,783.47,751.36,762.87,756.95,728.09,755.69,756.7,755.7,758.02,739.25,721.88,699.4,791.19,824.89,840.01,934.12,960.3,955.95,1018.69,1043.19,1024.99,1029.64,1095.7,1139.25,1126.35,1267.93,1208.72,1138.29,1035.57,1064.37,1064.37,840.19,931.96,944.84,948.35,1067.68,1144.37,1124.01,1077.38,1125.01,1143.43,1079.41,967.79,986.69,1036.44,1071.7,1066.28,1091.57,1140.3,1056.15,1083.1,1053.33,1082.13,1083.71,1104.27,1125.39,1136.46,1173.73,1142.13,1118.7,1096.2,1073.58,1075.37,1083.38,1070.25,1069.36,1080.56,1033.08,1045.32,987.33,1019.06,1078.57,1071.14,1114.68,1093.96,1071.85,1044.12,1061.35,1047.68,1039.39,1038.34,1123.63,1238.21,1270.34,1245.76,1327.79,1413.11,1460.49,1460.49,1490.41,1444.2,1487.86,1447.31,1509.8,1524.2,1632.89,1653.55,1538.04,1595.52,1552.06,1627.98,1611.24,1584.58,1668.87,1768.36,1653.5,1629.28,1643.63,1683.81,1683.81,1688.69,1694.54,1767.8,1795.51,1856.83,1870.41,1923.52,2076.33,2239.12,2063.99,2161.31,2173.96,2150.02,2102.08,2102.08,2148.87,2163.88,2149.99,2154.19,2241.11,2246.93,2198.77,2125.67,2019.06,2136.81,2220.73,2174.67,2162.71,2168.41,2196.89,2161.37,2047.78,2065.19,2076.54,2076.54,2025.9,2030.81,2003.41,1987.94,1817.97,1778.13,1888,1735.84,1718.74,1827.97,1746.58,1662,1581.19,1521.42,1432.5,1713.86,1699.81,1780.06,1765.13,1801.28,1722.25,1785.69,1661.9,1666.25,1704.75,1684.8,1603.66,1629.41,1574.25,1555.37,1617.27,1699.48,1683.76,1683.76,1758.31,1759.76,1707.22,1739.86,1722.61,1786.12,1939.65,1863.09,1879.93,1882.3,1818.3,1829.4,1893.34,1831.18,1855.89,1878.28,1793.14,1766.83,1722.56,1805.1,1742.66,1713.91,1707.14,1688.31,1710.78,1600.53,1570.4,1500.92,1454.61,1500.53,1467.69,1470.33,1433.67,1493,1477.99,1543.03,1538.57,1575.31,1605.13,1590.81,1590.81,1587.45,1539.67,1457.53,1524.22,1539.69,1535.77,1523.54,1552.39,1551.8,1571.65,1525.01,1539.03,1568.88,1585.95,1579.64,1586.97,1670.58,1729.73,1709.51,1752.38,1732.13,1729.43,1724.9,1727.39,1727.39,1678.24,1640.25,1661.01,1671.54,1744.69,1701.03,1662.46,1655.39,1639.15,1644.24,1680.58,1667.32,1651.98,1637.02,1673.25,1640.58,1646.18,1723.45,1748.51,1805.68,1805.86,1808.86,1818.3,1778.79,1816.09,1806.5,1800.98,1837.69,1824.77,1745.89,1693.83,1753.07,1713.58,1730.85,1797.11,1802.68,1809.58,1784.03,1811.41,1859.73,1871.97,1867.82,1863.49,1866.5,1866.5,1915.73,1918.15,1920.67,1873.37,1890.49,1894.28,1923.13,1926.09,1932.45,1857.84,1881.28,1913.24,1917.56,1970.36,2013.54,1978.42,1987.97,1973.13,1972.47,1988.52,1986.13,1991.63,2019.26,1998.6,2015.01,2050.07,2063.71,2082.13,2145.01,2213.91,2199.05,2202.94,2274.69,2314.59,2607.65,2591.29,2640.73,2740.42,2834.46,3075.14,2982.04,3088.54,3129.38,3109.49,2958.98,2604.19,2717.29,2705.99,2629.43,2578.47,2683.65,2770.88,2789.63,2893.14,2943.54,2821.82,2839.55,2839.55,2752.84,2892.96,2912.73,2786.12,2759.66,2582.49,2567.32,2676.07,2719.86,2554.07,2587.73,2458.93,2438.83,2483.31,2358.45,2372.83,2289.81,2388,2566.97,2714.87,2714.87,2783.42,2769.5,2763.7,2723.37,2688.87,3052.72,2925.02,2768.61,2709.02,2613,2692.28,2708.26,2814.67,2624.7,2670.63,2670.63,2622.03,2533.33,2534.91,2401.66,2366.29,2336.78,2385.15,2109.56,2153.45,2383.39,2369.47,2304.36,2267.42,2349.3,2308.64,2345.94,2371.38,2301.54,2188.18,2228.28,2347.03,2349.47,2229.78,2180.5,2180.5,2090.3,1944.02,2037.48,2060.63,2214.72,2199.3,2238.79,2135.49,2132.94,2047.17,2097.6,2185.56,2132.97,2023.69,1949.95,2040.33,2137.88,2217.7,2303.67,2343.8,2529.08,2542.14,2579.82,2571.47,2778.08,2797.75,2783.55,2741.85,2759.63,2914.48,2776.6,2660.83,2690.09,2609.26,2483.16,2511.2,2601.32,2506.23,2506.23,2555.32,2616.02,2486.39,2566.74,2557.25,2539.36,2229.96,2242.91,2232.74,2215.56,2297.44,2313.5,2423.85,2221.97,2202.56,2002.72,2035.62,1867.59,1852.32,1958.14,1843.09,1937.84,1806.04,1805.05,1689.23,1717.22,1598.29,1676.25,1800.75,1932.8,1932.8,1929.32,1883.8,1971.91,1790.11,1818.84,1823.47,1846.22,1829.73,1772.66,1646.76,1686.1,1778.54,1626.63,1654.57,1654.57,1809.35,1802.1,1794.34,1875.53,1869.52,1775.97,1744.11,1713.45,1734.75,1734.75,1779.04,1768.87,1866.65,1914.13,1788.79,1779.07,1809.37,1819.09,1832.48,1836.14,1874.18,1889.22,2073.99,2078.09,2049,1975.93,2097.76,2144.17,2268.21,2269.17,2294.44,2346.42,2355.86,2199.66,2216.86,2162.74,2246.88,2187.9,2290.19,2361.1,2340.06,2320.47,2311.87,2264.52,2212.97,2262.89,2267.8,2259.96,2199.05,2174.09,2119.74,2103.79,2115.62,2062.57,2062.57,2094.7,2165.54,2207.98,2287.52,2323.7,2229.89,2309.88,2318.58,2315.53,2359.19,2356.6,2296.07,2202.86,2101.65,2106.84,2159.74,2196.91,2047.3,2024.71,1850.29,1904.03,1838.15,1817.69,1702.74,1701.9,1652.59,1658.24,1692.43,1564.73,1674.34,1680.75,1694.88,1582.21,1636.86,1612.51,1697.78,1714.72,1718.16,1744.34,1736.86,1739,1640.99,1643.5,1583.66,1504.35,1460.23,1355.58,1455.8,1495.88,1457.56,1484.05,1426.8,1398.17,1375.43,1281.39,1296.96,1398.4,1398.4,1395.81,1396.26,1380.31,1486.18,1486.18,1487.41,1392.68,1372.6,1328.48,1323.9,1366.72,1281,1228.56,1196.89,1203.53,1146.74,1143.99,1051.85,1050.1,956.82,940.03,940.03,832.78,860.34,929.88,940.26,940.26,825.15,867.44,842.25,863.01,914.23,907.21,940.56,943.16,934.3,934.3,1003.69,983,970.71,1018.42,1097.27,1098.34,1102.46,1223.37,1357.95,1272.15,1322.22,1384.74,1437.1,1450.16,1486.64,1502.29,1536.49,1582.51,1502.9,1485.73,1597.25,1635.34,1542.21,1590.07,1590.07,1506.56,1533.2,1542.44,1502.82,1584.88,1570.23,1547.78,1457.18,1509.77,1479.39,1432.83,1389.24,1319.93,1323.9,1331.84,1398.86,1377.41,1405.5,1374.97,1398.78,1508.17,1459.09,1467.25,1453.44,1464.12,1444.12,1479.92,1490.61,1583.58,1486.72,1470,1416.11,1412.6,1412.6,1408.4,1425.81,1378.1,1419.01,1412.14,1427.71,1406.87,1378.48,1244.14,1260.09,1240.78,1226.43,1173.6,1222.76,1254.21,1235.28,1223.68,1225.97,1230.47,1298.1,1311.31,1291.16,1286.5,1313.52,1282.22,1269.78,1271.08,1327.11,1350.24,1375.04,1441.68,1418.02,1396.11,1408.1,1474.51,1474.51,1535.49,1556.64,1584.04,1633.28,1661.06,1689.3,1714.19,1792.73,1865.55,1907,1974.78,1960.13,1953.34,1988.75,1988.75,2094.93,1980.51,2019.82,1958.68,1839.98,1909.9,1955.93,1965.55,1998.14,2135.92,2135.92,2156.23,2110.88,2094.78,2057.99,2059.36,2076.15,2121.27,2147.83,2216.53,2239.12,2223.25,2006.77,1984.78,2053.79,2024.94,2017.84,1951.89,2033.79,2041.35,1992.8,1939.67,1979.44,1937.76,1919.37,1906.01,1848.68,1872.73,1852.2,1830.14,1778.23,1722.05,1673.35,1644.88,1765.41,1779.99,1808,1755.94,1821.2,1822.96,1963.11,1960.97,1969.98,1870.21,1870.21,1957.84,1922.96,1919.67,1896.85,2088.29,2041.73,2070.89,2107.07,2094.47,2024.94,2034.25,2004.4,1951.81,1869.22,1885.32,1863.42,1835.78,1880.67,1909.98,1920.51,1881.81,1993.49,1985.01,1988.68,1982.11,2012.26,2007.45,1976.01,1916.85,1938.22,1945.32,1852.42,1680.14,1618.16,1618.85,1652.74,1621.44,1570.61,1582.36,1506.49,1533.05,1569.84,1667.93,1679,1673.73,1695.94,1695.41,1602.82,1638.47,1707.62,1812.2,1853.65,1783.04,1788.46,1798.38,1841.13,1787.77,1787.77,1797.24,1802.05,1883.26,1863.57,1832.58,1823.04,1798.23,1822.2,1827.16,1852.12,1861.28,1829.98,1809.14,1826.55,1916.31,1935.02,1924.18,1963.41,1886.47,1942.65,1927.69,1927.69,1958.76,1995.62,1932.57,1896.7,1896.24,1820.14,1816.17,1812.81,1835.4,1793.5,1785.71,1734.42,1670.83,1670.83,1678.62,1645.34,1617.32,1619.69,1593.81,1596.41,1586.41,1394.05,1398.78,1457.41,1462.44,1429.62,1441.61,1434.35,1382.07,1412.91,1431.84,1446.95,1477.56,1436.03,1404.66,1440.46,1530.07,1526.26,1526.26,1479.01,1486.72,1506.87,1465.35,1522.06,1524.58,1542.21,1540.99,1546.79,1436.11,1379.62,1347.56,1363.67,1338.41,1356.95,1355.2,1293.67,1240.39,1248.56,1326.65,1307.72,1340.85,1319.17,1303.98,1317.72,1356.19,1372.68,1341.84,1341.84,1337.49,1271.92,1285.28,1306.12,1258.71,1320.39,1350.16,1311.08,1332.76,1305.66,1232.61,1199.25,1186.58,1144.45,1122.46,1084.3,1104.37,1237.57,1299.02,1284.59,1481.22,1399.01,1373.9,1374.05,1383.06,1410.31,1357.26,1333.67,1312.68,1285.97,1312.07,1355.27,1328.1,1334.59,1354.59,1335.43,1424.36,1374.82,1326.19,1368.17,1368.17,1349.17,1344.89,1364.74,1359.32,1345.66,1334.05,1335.81,1358.25,1354.74,1326.57,1302.68,1353.29,1392.83,1358.79,1430.77,1411.07,1411.07,1385.96,1396.95,1393.67,1430.08,1498.93,1506.95,1510.46,1601.9,1765.25,1880.74,1880.74,1919.9,1930.74,2002.42,2009.52,1839.83,1894.79,1928.45,1958.37,1896.85,1902.42,1825.86,1919.83,1880.67,1648.69,1681.21,1677.78,1771.67,1699.3,1771.44,1655.34,1585.19,1518.09,1531.53,1463.74,1517.79,1526.64,1507.48,1586.41,1537.17,1634.57,1649.69,1700.07,1687.7,1704.26,1608.01,1681.75,1627.47,1596.94,1570.53,1574.58,1634.34,1634.34,1607.55,1674.8,1756.93,1608.54,1650.83,1726.4,1741.36,1754.19,1757.85,1731.06,1739.38,1734.26,1861.89,1818.61,1908.3,1940.89,1961.88,1940.51,1988.14,1997.07,1969.52,1900.82,1837.01,1908.91,1838.3,1866.32,1839.98,1822.58,1662.51,1672.89,1676.02,1689.46,1686.1,1684.65,1670.53,1663.81,1630.83,1988.3,2054.78,2003.79,1980.97,1965.93,1907.15,1900.51,1853.65,1919.29,2202.41,2266.37,2451.94,2671.62,2507.43,2520.79,2375.3,2448.12,2585.67,2641.09,2610.78,2592.54,2691.16,2584.52,2581.78,2541.02,2541.02,2634.68,2725.74,2682.46,2732.15,2820.39,2970.99,2975.34,3060.84,3242.35,3191.44,3329.83,3534.32,3662.87,3359.6,3329.37,3214.03,3286.86,3528.68,3528.68,3466.46,3294.95,3186.17,3082.59,2895.12,3132.97,3137.63,3010.23,3014.66,3014.66,3013.13,3078.55,3025.49,3268.69,3158.77,3255.56,3255.56,3237.01,3168.62,3147.78,3103.51,3031.52,3038.7,2970.08,3055.42,3088.39,2928.71,2993.82,2886.65,2857.26,2760.32,2677.19,2507.51,2568.65,2716.96,2716.2,2716.2,2702.99,2752.23,2705.21,2578.49,2523,2311.33,2219.73,2152.18,2236.37,2172.79,2076.54,2130.43,2010.97,2005.01,1695.72,1760.06,1893.72,1837.16,1908.15,1816.78,1719.84,1800.37,1803.42,1898.45,2125.01,2199.43,2076.69,2084.86,2011.73,1978.22,2049.21,2158.36,2040.2,1827.62,1780.75,1693.5,2077.76,1926.62,1925.93,1926.24,1939.67,1843.8,1842.43,1842.43,1736.55,1816.47,1913.95,1980.89,2175.08,2182.18,2229.12,2153.78,2141.26,2192.33,2139.28,2101.8,2108.44,2174.09,2276.68,2430.26,2550.02,2653.91,2616.81,2671.47,2611.24,2624.45,2554.22,2603.23,2590.25,2590.25,2770.01,2724.29,2735.97,2644.6,2615.82,2627.88,2534.6,2173.17,2252.86,2355.45,2489.11,2491.71,2435.83,2483.16,2512.31,2414.76,2458.27,2458.27,2459.11,2661.54,2598.88,2500.25,2486.74,2470.33,2424.76,2295.38,2409.42,2407.13,2407.13,2243.7,2273.24,2258.51,2365.3,2393.08,2418.96,2372.25,2455.37,2438.12,2516.28,2507.43,2535.06,2538.5,2330.42,2412.55,2485.29,2451.78,2435.3,2353.09,2310.04,2360.64,2356.52,2441.94,2459.95,2516.28,2587.88,2601.7,2590.56,2561.55,2523.23,2558.34,2513.69,2472.39,2443.46,2595.36,2645.67,2684.37,2668.57,2640.93,2548.5,2548.5,2514.07,2550.18,2584.07,2678.03,2644.14,2648.49,2654.75,2815.2,3022.29,3129.92,3218.31,3250.67,3181.9,3252.28,3314.41,3250.6,3379.9,3231.82,3361.66,3383.11,3394.64,3507.15,3328.07,3280.98,3459.75,3305.86,3348.61,3324.56,3156.25,3327.31,3276.47,3321.59,3272.73,3353.34,3415.32,3378.45,3350.75,3427.15,3310.67,3453.41,3515.47,3522.8,3359.37,3485.01,3575.16,3391.13,3527.07,3403.72,3278.61,3398.53,3355.71,3286.86,3068.47,3086.48,3121.37,3062.82,3083.74,3016.87,2985.27,3189,3201.36,3256.17,3256.17,3283.57,3283.34,3276.47,3410.06,3469.52,3473.11,3355.4,3398.07,3446.01,3411.2,3503.33,3628.14,3739.35,3566.69,3689.66,3673.1,3730.57,3706.38,3705.15,3705.15,3627.22,3508.52,3468.75,3432.8,3343.88,3447.69,3304.87,3293.04,3326.55,3396.85,3427,3413.57,3352.5,3347.69,3339.52,3339.52,3200.22,3293.27,3430.05,3427.76,3321.97,3289.15,3293.42,3179.69,3285.41,3219.76,3220.9,3099.16,3031.98,3138.08,3185.49,3245.71,3269.07,3183.58,3186.4,3186.4,3134.42,3139.69,3142.66,3143.5,3051.98,3124.88,3186.1,3118.77,3072.44,3078.62,2995.5,3098.62,3095.64,3028.32,3043.2,3047.48,3112.97,3015.19,2986.11,3019.39,3047.71,2998.17,2902.91,2808.71,2907.1,2923.74,2946.03,2840.39,2761.92,2711.92,2837.64,2910.23,2752.46,2752.46,2693.15,2646.05,2620.1,2638.19,2663.6,2690.09,2780.01,2991.83,2968.55,3058.01,2996.03,2949.62,2957.94,2852.68,2872.37,2890.46,2870.24,2845.66,2913.06,2983.21,2996.11,2972.14,3043.59,3143.28,3269.68,3396.77,3308.61,3398.83,3383.8,3223.04,3129.54,3084.65,3185.03,3189.53,3251.82,3251.82,3309.68,3361.36,3374.64,3326.47,3174.49,3234.49,3234.19,3194.11,2984.58,3121.6,3027.94,2912.75,3046.79,3102.36,3138.39,3088.85,3025.65,3057.02,3057.02,3091.83,2912.91,2866.5,2863.37,2898.4,3143.66,3210.52,3246.4,3003.28,3003.28,3204.19,3075.42,3007.94,3103.28,3112.51,3013.28,3024.12,3010.99,2985.04,2907.03,2821,2892.45,2854.89,2440.26,2389.42,2360.34,2346.75,2277.14,2357.51,2375.53,2458.5,2498.73,2454.46,2439.04,2508.12,2525.67,2540.4,2499.95,2594.98,2612.61,2589.94,2571.4,2680.17,2634.45,2769.78,2663.6,2673.53,2639.71,2708.34,2662.08,2808.64,2718.11,2725.13,2872.91,2702.76,2702.76,2810.24,2807.57,2775.13,2789.48,2740.09,2721.85,2733.3,2795.28,2780.55,2864.74,2892.22,2901.53,2884.89,2840.39,2728.49,2693.3,2708.34,2702.99,2828.79,2890.92,2905.81,2883.9,2862.45,2921.23,2885.58,2864.21],"팔란티어 테크":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,100,99.58,96.84,95.05,104.21,105.26,105.26,104.74,104.11,99.68,98.32,104.32,102.21,100.74,97.58,96.84,101.89,99.89,104.74,115.26,114.21,113.16,106.63,110.95,110.53,112.84,125.05,145.58,154.42,147.37,168,153.47,166.32,167.68,187.89,188.42,199.79,191.05,221.47,250.74,305.79,305.79,291.16,285.37,270.21,236.95,252.95,251.05,304.63,300.95,280.32,284.63,286.32,286.74,278.21,272.84,286.63,273.37,300.11,295.16,302,292.11,292.11,269.79,259.58,264.21,247.89,246,258.95,247.79,263.16,265.26,272.95,275.58,268.42,262.32,269.89,269.89,280.21,277.26,273.47,342.95,381.37,372.32,410.53,375.37,370.32,357.47,326.53,334.32,337.37,358.42,379.47,401.79,375.79,348.53,335.89,335.89,293.05,285.05,264.95,305.26,294.74,281.58,277.79,252.21,251.58,261.16,257.68,248.32,260.32,252.11,237.05,255.37,260.53,281.37,283.37,282,269.58,265.37,252.42,256,254.95,244.84,230.32,237.68,237.68,228.74,232,245.16,242.84,242.84,246.74,244.95,241.05,246.42,253.05,245.68,267.58,249.47,243.68,236.53,230.95,229.26,238.21,240.63,246.42,253.79,251.37,251.05,246,242.53,234.74,227.79,222.63,211.47,207.89,194.42,212.74,198.84,193.37,211.37,215.37,223.58,217.58,216.95,218.42,223.37,226.11,232.84,238.95,241.58,241.58,242.74,257.37,248.74,252.95,257.47,256.63,254.42,254.11,259.68,263.16,256.95,261.05,267.89,267.05,267.58,267.37,276.53,279.26,281.89,288.21,280.32,277.47,260.21,257.26,257.26,259.79,240.95,242.95,245.16,241.58,236.32,226.95,226,224.95,226.74,233.47,237.05,232.32,229.58,232.95,228.21,237.47,233.47,228.53,232.63,234.11,234.74,237.05,229.68,241.37,241.26,235.26,262,262.11,257.89,252.32,266.11,254.32,252.74,261.26,264.21,256.32,261.79,270.63,271.16,277.26,275.79,279.05,280.42,280.42,281.05,269.26,275.05,276.63,271.89,276.42,285.05,301.37,302.21,279.47,280.21,288.74,302.84,300.63,289.16,266.74,258.11,253.05,256.11,243.89,244.32,248.21,249.79,247.37,247.68,249.37,254,256.32,252.63,255.37,259.89,254.95,260.84,257.16,267.47,268.63,263.79,269.89,272.42,279.58,272.84,274.95,278.63,273.68,281.58,255.26,237.05,242,240.32,246.42,243.47,236.74,226.32,225.37,217.37,216.74,222.21,222.21,221.37,221.79,217.37,204,207.26,199.79,197.89,204.84,208.63,202.21,199.37,193.68,196.21,198.53,193.05,200.63,189.05,198.95,198.74,199.26,199.26,199.37,195.47,191.26,196.74,191.68,195.05,191.26,178.53,176.21,174.32,173.68,177.79,176,168.53,168.53,168.53,157.58,153.26,153.89,142.42,141.05,137.47,134.21,129.26,133.79,144.32,149.47,140.21,131.05,136.21,136.63,138.42,146,142.74,138.21,139.58,149.16,147.05,123.89,116,116,110.32,109.79,124.53,120.74,124.74,128.21,126.95,119.37,115.37,116.95,116.21,122.63,124.95,119.89,110.53,113.37,124.11,129.68,134.95,132.53,139.68,138.74,140.95,136.53,141.26,149.47,146.11,144.53,145.58,154,146.21,136.84,135.16,133.68,133.26,131.16,135.79,130.74,130.74,127.89,135.89,134.63,129.79,125.89,127.47,117.05,111.16,115.26,109.47,113.05,111.05,115.58,106.53,99.79,78.53,76.74,70.63,77.26,87.79,84.63,88,84.32,87.47,85.05,84.32,79.47,83.79,88,93.16,93.16,91.37,89.05,97.89,94.11,94.53,96.11,96.63,91.37,86.95,80.42,82.32,85.47,80.74,86.74,86.74,91.68,94.84,99.58,107.26,101.26,98,97.16,95.47,97.58,97.58,106,103.16,107.16,107.05,100.63,99.89,97.68,93.68,95.16,95.05,98.32,106.42,110.42,103.58,101.89,98.95,105.47,106.63,108.95,110.21,114.95,117.89,119.16,120.53,103.37,97.37,100.95,99.16,104.32,104.32,102.53,99.26,96.32,89.58,84.95,84.32,85.26,88.63,83.58,82.21,82,81.26,78.84,77.89,77.89,76.63,77.79,79.26,82,84.32,78.74,80.32,84.32,81.89,82.74,80.21,80.95,77.58,77.89,79.26,80.32,83.58,85.05,85.58,86.74,89.05,88.63,89.16,85.79,84.84,84.63,84.95,85.05,79.26,83.58,85.89,83.26,84.63,87.26,87.05,91.16,90.21,90.53,90.95,92.53,91.05,86.53,85.05,83.47,73.89,75.89,73.47,80.42,88.53,85.26,87.79,84.84,80.21,77.79,75.68,76,77.58,77.58,76.63,75.37,74.53,78.95,82.74,80.63,75.68,73.58,74.42,74.95,74.84,76.74,78.95,77.37,73.79,72.63,66.84,66.42,68.42,66.53,66.21,66.21,63.16,63.89,67.37,67.58,67.58,67.26,69.26,66.53,67.37,68.42,70.53,73.47,73.79,73.26,73.26,74.42,72.63,70.84,73.89,77.68,73.89,76,76.21,79.47,77.58,81.89,86.32,94.63,88.53,87.47,87.68,86.53,83.68,79.05,80.11,97.05,106.42,102.21,96.84,96.84,89.16,88,86,85.16,84.53,82.53,80.95,83.89,87.68,87.16,87.16,85.58,80.95,77.37,82.84,83.05,83.16,84,82.95,85.05,88.95,86.42,87.68,86.32,84.63,84.21,86.53,85.79,88.95,88.21,87.89,84,85.16,85.16,88.32,90.63,87.68,90.32,92.74,92.63,91.89,89.37,85.79,86.11,85.26,81.47,81.47,82.32,81.58,81.89,79.89,79.58,77.68,78,81.47,100.53,104.63,104,100,100.21,99.68,107.89,123.58,123.26,124.63,133.05,128.74,135.16,143.68,143.68,154.84,154.84,153.05,152.84,160.42,162.74,154.63,159.89,158.11,164.74,168.42,167.47,174.74,171.58,171.58,166.21,154.11,147.89,147.68,146.74,153.79,160.84,160,161.37,163.37,163.37,165.26,159.26,161.47,171.58,173.58,174.63,176.21,172.63,183.16,190.32,190,180.32,172.95,171.79,174.21,172.95,170,187.47,208.84,210.42,199.68,196.95,191.58,189.37,179.37,160.53,162.21,162.21,165.47,161.79,162.63,148.95,151.58,152.63,154.42,161.05,148.84,152.95,154.11,162.11,171.89,157.68,159.79,159.79,160.11,161.05,160.11,159.26,166.21,164.11,164.21,166.63,161.37,162.74,159.47,155.16,147.37,148.74,149.68,146.95,156.32,166,168.42,167.16,156.84,165.58,166.42,174.84,185.37,187.37,188.63,188.84,182.74,182.74,187.79,181.05,179.58,169.58,170.53,175.16,164.11,160.95,158.63,154.63,155.79,157.05,189.16,198.84,195.16,197.89,194.63,192.32,207.05,207.47,209.89,210,208.11,215.68,224.63,208.42,207.26,207.26,202.11,200.84,207.47,208.84,211.05,213.37,193.68,192.63,180.32,181.26,187.05,187.05,184.21,188.11,191.68,191.58,187.79,188.95,181.58,185.16,183.26,183.26,186.11,183.89,184.84,180.74,174.53,169.37,171.05,168.21,175.47,172.53,176.74,175.58,176.42,176.42,174,172.53,172.63,176.63,185.26,182.42,176.32,173.26,172.11,179.89,176.21,169.37,171.89,179.16,176,230.21,248.42,258,256.63,263.68,252.74,265.16,267.47,257.26,257.26,246.32,239.37,248.32,241.79,248,258.21,257.05,264,262.42,253.05,250.63,275.37,278.53,274.11,266.84,260,263.16,257.16,247.26,252.63,250.53,258.63,257.79,254.53,258,262,258,242.21,242.21,240.63,239.16,238.95,236.63,241.68,242.11,240.11,236,240.42,238.63,230.53,230.32,224.32,222.42,215.47,220.74,227.79,227.26,228.53,237.05,240.32,231.26,232.84,237.37,245.58,265.37,225.26,226.95,222.53,216.84,220.42,225.68,228.11,227.89,229.05,227.58,223.58,222.84,218.11,221.16,221.16,221.58,220.42,228.74,228.21,224.42,232.63,241.68,250.42,245.37,243.47,251.05,250.21,244.95,248.11,263.37,271.79,271.79,269.05,250.95,254.32,258.53,253.68,265.47,266.63,272.42,271.89,272.11,272.11,286.63,291.58,288.32,299.16,290.95,295.47,301.79,301.79,297.05,301.47,300.84,299.58,303.26,280,280.32,286.11,285.05,277.58,283.05,274.53,260.42,253.58,279.89,277.05,308.21,315.89,309.26,319.89,326.32,328.63,337.68,342.11,340.21,342.53,336,334.53,324.74,324.63,319.58,326.32,331.37,331.37,321.16,322,317.47,319.26,364.21,365.89,366.84,367.47,374.63,382.21,383.68,382.95,387.68,391.58,399.47,388.42,390.74,390.53,387.79,391.58,383.79,394.63,413.05,421.16,409.37,436.32,454,458.11,458,456.84,446.63,441.37,442.11,452.32,449.47,452,448.32,458.53,472.21,473.37,472.95,459.89,437.47,441.26,435.89,538.21,584.53,588.21,614.63,634.11,630,638.95,622.95,692.32,644.84,662.95,653.89,645.89,677.37,680.53,692,695.26,695.26,706.11,698.84,746.95,735.26,756.53,803.58,762.74,746.21,763.26,770.53,800.74,797.37,783.05,752.74,781.16,847.89,849.37,867.16,867.16,864.63,832.42,812.42,796.11,791.47,840.95,799.16,736.74,718.21,718.21,708,684,693.79,717.26,728.84,755.47,755.47,769.16,809.16,831.37,831.37,794.11,844.53,839.58,854.95,868.32,881.47,1092.95,1066.95,1171.37,1166.84,1227.89,1185.47,1235.68,1241.16,1254.32,1254.32,1311.79,1179.58,1118.63,1066.84,954.53,924.63,940.11,892.32,893.89,878.11,888.42,948.74,846.95,893.79,804,821.58,880.53,838.11,907.79,919.47,883.05,906.32,919.89,957.47,1018.42,1015.79,971.37,948.32,903.68,888.42,891.37,920.53,880,779.05,819.37,813.89,968.53,932.53,932.11,974.95,1035.79,975.89,987.16,987.16,955.79,989.37,1061.26,1134.53,1187.16,1206.84,1221.89,1246.74,1223.16,1308.21,1302.84,1145.89,1162.95,1254.21,1234.74,1246.95,1348.42,1370.32,1348.63,1363.37,1329.79,1322,1269.26,1287.26,1298,1298,1298.84,1302.74,1287.58,1387.16,1389.89,1401.79,1368.53,1262.21,1344.42,1390.11,1398,1435.68,1423.05,1446.32,1488.53,1454.74,1473.26,1473.26,1445.26,1472.84,1507.68,1504.21,1518.42,1376.21,1434.95,1375.58,1390.74,1414.32,1414.32,1464.42,1470.63,1506.63,1500,1495.79,1570,1564,1588.53,1620.95,1616,1597.79,1569.16,1627.68,1630.11,1671.58,1661.89,1644.63,1669.58,1666.84,1623.89,1691.16,1823.89,1889.89,1917.89,1968,1922.95,1968.11,1940.74,1905.47,1864.95,1831.89,1660.53,1642.21,1644,1670.95,1654.42,1693.37,1649.68,1664.42,1649.58,1649.58,1653.58,1630.53,1643.58,1611.68,1643.16,1709.05,1755.16,1730.11,1804.53,1802.21,1792.21,1771.89,1862.84,1919.89,1887.68,1921.58,1890.11,1885.47,1869.16,1882.74,1920.21,1946.84,1968.95,1821.79,1889.79,1917.58,1932.21,1952.32,1846.74,1865.37,1892,1890.74,1874.95,1875.26,1911.47,1910.63,1847.26,1899.79,1943.47,1991.37,1995.79,2092.74,2047.89,2110.21,2180.84,2007.79,1977.89,1842.63,1872.95,2038,2010.11,1938.63,1812,1831.68,1802.63,1761.37,1741.26,1639.42,1630,1707.89,1721.58,1744.95,1744.95,1773.16,1763.05,1796.74,1853.47,1872.84,1913.26,1910.42,1914.11,1978,1974.11,1932.32,1928.95,1976.32,1866.21,1954.63,2035.58,2041.89,2043.47,2043.89,2043.89,1986.42,1938.74,1903.58,1871.05,1766.95,1832,1891.68,1912.42,1861.68,1868.32,1888.53,1883.79,1877.89,1863.89,1799.58,1799.58,1774,1740.32,1746.32,1785.26,1762.84,1744.21,1656.32,1598.53,1543.05,1555.37,1661.89,1468.84,1368.53,1430.53,1504.32,1468.53,1428.21,1359.26,1383.26,1383.26,1400.21,1425.05,1419.89,1423.58,1374.74,1356.21,1412.53,1430.95,1444.11,1528.11,1549.68,1612.53,1607.05,1654.32,1646.63,1590.95,1595.79,1615.79,1588.95,1607.58,1632.42,1608.11,1638.74,1586.11,1693.05,1629.26,1631.16,1553.26,1505.89,1447.89,1539.79,1542,1562.74,1562.74,1557.16,1579.68,1481.68,1373.58,1348,1393.37,1428.42,1496.32,1502.74,1540.95,1535.68,1536.53,1606.53,1490.21,1506.21,1506.32,1486.11,1452.32,1464.32,1516.53,1537.16,1430.63,1408.32,1442.63,1450.53,1440.95,1431.58,1368.95,1407.68,1410.42,1422.53,1423.79,1443.68,1446.47,1440.84,1440.84,1437.89,1394.84,1508.84,1647.79,1691.05,1601.79,1496.84,1491.58,1426.63,1436.53,1390.21,1370.63,1379.79,1347.26,1418,1402.63,1375.05,1352.32,1352.32,1257.89,1228.42,1194.74,1129.16,1188.74,1217.89,1228.11,1323.47,1361.05,1361.05,1395.16,1414.42,1391.79,1358.32,1334.63,1368.84,1407.58,1408,1415.16,1393.47,1419.47,1396.42,1311.26,1298.63,1293.89,1384.53,1300.32,1294.74,1286.95,1295.37,1322.63,1712.21,1667.68,1641.26,1810.63,1844.53,1841.47,1800.42,1884.32,1832,1816.32,1805.68,1844.11,1831.16,1894.11,1851.47,1818.21,1868.42,1957.16,1960.95,1961.89,1893.89,1783.79,1921.37,1835.05,1835.05,1792.63,1784.53,1745.89,1760.32,1824.32,1816.42,1835.16,1855.16,1869.89,1927.26,1947.26,2018.84,2027.26,1996.53,1973.47,1968.11,1968.95,2000.42,1986.84,1993.68,2021.79,2043.37,2092.42,2200.53,2200,2196.53]},"symbols":{"AMD":"AMD","EuroStoxx50":"^STOXX50E","HSCEI":"^HSCE","KOSPI200":"^KS200","Nikkei225":"^N225","S&P500":"^GSPC","SK하이닉스":"000660.KS","마이크론 테크놀로지":"MU","삼성전자":"005930.KS","어플라이드 머티어리얼즈":"AMAT","테슬라":"TSLA","팔란티어 테크":"PLTR"},"missing":[]}
};
