# ETF 자료 전수 감사

감사 시각: 2026-08-28T22:15:55.829Z
자료 기준: 2026-08-28T14:34:30.507Z
대상: 1348 종목

**오류 7252건 · 경고 1744건 · 참고 106건**
**오류가 있는 종목 794 / 1348**

이 감사는 바깥 자료에 붙지 않는다. `data/etf.js` 안에서 서로 어긋나는 것만
잡는다 — 안에서 앞뒤가 안 맞는 숫자는 바깥을 볼 것도 없이 틀린 것이다.

## 규칙별

| 심각도 | 규칙 | 건수 | 종목수 |
|---|---|---:|---:|
| error | 보유비중-범위밖 | 5953 | 731 |
| error | 보유비중-영 | 668 | 668 |
| error | 자산비중-비정상 | 269 | 269 |
| error | 국가비중-비정상 | 103 | 103 |
| error | 섹터비중-비정상 | 89 | 89 |
| error | 보유비중-합초과 | 67 | 67 |
| error | top10Weight-불일치 | 64 | 64 |
| error | tr-내포분배율-과다 | 29 | 22 |
| error | 보유종목-정렬어긋남 | 4 | 4 |
| error | 시총-설정액-괴리 | 1 | 1 |
| warn | price-nav-괴리 | 885 | 562 |
| warn | holdingCount-불일치 | 262 | 262 |
| warn | D1-등락률-불일치 | 148 | 148 |
| warn | 섹터비중-합이상 | 131 | 131 |
| warn | 국가비중-합이상 | 127 | 127 |
| warn | 자산비중-합이상 | 96 | 96 |
| warn | 추적오차-범위밖 | 62 | 62 |
| warn | 총보수-영 | 24 | 24 |
| warn | 수익률-범위밖 | 10 | 4 |
| warn | 유입-기간역전 | 2 | 2 |
| warn | 설정액-과소 | 1 | 1 |
| warn | 괴리율-과다 | 1 | 1 |
| info | 보유종목-없음 | 52 | 52 |
| info | 설정액-없음 | 28 | 28 |
| info | 총보수-없음 | 26 | 26 |

## 오류 상세

| 종목 | 규칙 | 내용 |
|---|---|---|
| 360750 TIGER 미국S&P500 | 보유비중-영 | 비중 합이 0 |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | NVIDIA CORP: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | APPLE INC: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | AMAZON.COM INC: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | MICROSOFT CORP: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | AT&T INC: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | BANK OF AMERICA CORP: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | ALPHABET INC-CL A: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | PFIZER INC: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | INTEL CORP: undefined |
| 360750 TIGER 미국S&P500 | 보유비중-범위밖 | BROADCOM INC: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-영 | 비중 합이 0 |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | NVIDIA CORP: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | APPLE INC: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | INTEL CORP: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | WALMART INC: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | NETFLIX INC: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | CISCO SYSTEMS INC: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | AMAZON.COM INC: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | COMCAST CORP-CLASS A: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | MICROSOFT CORP: undefined |
| 133690 TIGER 미국나스닥100 | 보유비중-범위밖 | WARNER BROS DISCOVERY INC: undefined |
| 102110 TIGER 200 | 섹터비중-비정상 | {"IT":64.98,"INDUSTRIALS":14.03,"FINANCIALS":7.44,"CONSUMER_DISCRETIONARY":4.54,"COMMUNICATION":2.39,"MATERIALS":1.94,"H |
| 102110 TIGER 200 | 자산비중-비정상 | {"EQUITY":99.54,"CASH":-0.52} |
| 379800 KODEX 미국S&P500 | 보유비중-영 | 비중 합이 0 |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | NVIDIA Corp: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | APPLE Inc: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | Amazon.com Inc: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | MICROSOFT: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | AT&T INC: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | BANK OF AMERICA CORP: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | ALPHABET INC-CL A: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | PFIZER INC: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | INTEL Corp: undefined |
| 379800 KODEX 미국S&P500 | 보유비중-범위밖 | BROADCOM LTD: undefined |
| 379800 KODEX 미국S&P500 | 섹터비중-비정상 | {"IT":36.83,"FINANCIALS":12.09,"COMMUNICATION":9.37,"HEALTHCARE":9.2,"CONSUMER_DISCRETIONARY":8.9,"INDUSTRIALS":8.09,"CO |
| 379800 KODEX 미국S&P500 | 자산비중-비정상 | {"EQUITY":97.72,"CASH":-0.21} |
| 379800 KODEX 미국S&P500 | 국가비중-비정상 | {"US":95.1,"MISC":2.62,"KR":-0.21} |
| 379810 KODEX 미국나스닥100 | 보유비중-영 | 비중 합이 0 |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | NVIDIA Corp: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | APPLE Inc: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | INTEL Corp: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | WAL-MART STORES INC: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | NETFLIX: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | CISCO SYSTEMS INC: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | Amazon.com Inc: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | COMCAST CORP: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | MICROSOFT: undefined |
| 379810 KODEX 미국나스닥100 | 보유비중-범위밖 | WARNER BROS DISCOVERY INC: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-영 | 비중 합이 0 |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP): undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_10: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_2: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_3: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_4: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_5: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_6: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_7: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_8: undefined |
| 488770 KODEX 머니마켓액티브 | 보유비중-범위밖 | 가온전선(CP)_9: undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-영 | 비중 합이 0 |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | KODEX 머니마켓액티브: undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | KODEX 26-12 금융채(AA-이상)액티브: undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | 스왑(하나금융투자): undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | 스왑(삼성증권): undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | 스왑(유안타증권): undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | 스왑(한국투자증권): undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | 스왑(메리츠증권): undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | 스왑(미래에셋증권): undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | 스왑(대신증권): undefined |
| 459580 KODEX CD금리액티브(합성) | 보유비중-범위밖 | 스왑(키움증권): undefined |
| 498400 KODEX 200타겟위클리커버드콜 | 자산비중-비정상 | {"EQUITY":98.68,"CASH":0.33,"DERIVATIVES":-0.14} |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-영 | 비중 합이 0 |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | NVIDIA CORP: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | INTEL CORP: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | BROADCOM INC: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | GLOBALFOUNDRIES INC: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | KLA CORP: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | MICROCHIP TECHNOLOGY INC: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | MARVELL TECHNOLOGY INC: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | QUALCOMM INC: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | ON SEMICONDUCTOR: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 보유비중-범위밖 | TEXAS INSTRUMENTS INC: undefined |
| 381180 TIGER 미국필라델피아반도체나스닥 | 섹터비중-비정상 | {"IT":99.87,"UNCLASSIFIED":-0.01} |
| 381180 TIGER 미국필라델피아반도체나스닥 | 자산비중-비정상 | {"EQUITY":99.87,"CASH":-0.01} |
| 381180 TIGER 미국필라델피아반도체나스닥 | 국가비중-비정상 | {"US":92.54,"MISC":7.33,"KR":-0.01} |
| 458730 TIGER 미국배당다우존스 | 보유비중-영 | 비중 합이 0 |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | FORD MOTOR CO: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | COMCAST CORP-CLASS A: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | VERIZON COMMUNICATIONS INC: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | BRISTOL-MYERS SQUIBB CO: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | COCA-COLA CO/THE: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | ABBOTT LABORATORIES: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | ALTRIA GROUP INC: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | SLB LTD: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | MERCK & CO. INC.: undefined |
| 458730 TIGER 미국배당다우존스 | 보유비중-범위밖 | CONOCOPHILLIPS: undefined |
| 411060 ACE KRX금현물 | 보유비중-범위밖 | 원화현금: -0.03 |
| 411060 ACE KRX금현물 | 보유비중-범위밖 | 금 현물 99.99_1Kg: undefined |
| 411060 ACE KRX금현물 | 보유종목-정렬어긋남 | 2번째(금 현물 99.99_1Kg) 가 앞보다 크다 |
| 411060 ACE KRX금현물 | top10Weight-불일치 | 저장 0% vs 재계산 99.97% |
| 411060 ACE KRX금현물 | 자산비중-비정상 | {"OTHERS":100.03,"CASH":-0.03} |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-영 | 비중 합이 0 |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | SK하이닉스: undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 삼성전자: undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 국고02125-2706(17-3): undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 국고02375-2703(22-1): undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 국고02625-2703(25-1): undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 국고03250-2706(24-4): undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 통안02550-2701-01: undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 통안02620-2704-02: undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 통안02900-2705-01: undefined |
| 0162Z0 RISE 삼성전자SK하이닉스채권혼합50 | 보유비중-범위밖 | 원화현금: undefined |
| 360200 ACE 미국S&P500 | 보유비중-영 | 비중 합이 0 |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | NVIDIA Corp: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | APPLE Inc: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | Amazon.com Inc: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | MICROSOFT: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | AT&T INC: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | BANK OF AMERICA CORP: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | ALPHABET INC-CL A: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | PFIZER INC: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | ALPHABET INC-CL C: undefined |
| 360200 ACE 미국S&P500 | 보유비중-범위밖 | BROADCOM LTD: undefined |
| 360200 ACE 미국S&P500 | 섹터비중-비정상 | {"IT":36.92,"FINANCIALS":12.17,"COMMUNICATION":9.44,"HEALTHCARE":9.25,"CONSUMER_DISCRETIONARY":8.88,"INDUSTRIALS":8.12," |
| 360200 ACE 미국S&P500 | 자산비중-비정상 | {"EQUITY":98.08,"CASH":-0.52} |
| 360200 ACE 미국S&P500 | 국가비중-비정상 | {"US":95.41,"MISC":2.67,"KR":-0.52} |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-영 | 비중 합이 0 |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | NVIDIA CORP: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | APPLE INC: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | ALPHABET INC-CL A: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | AMAZON.COM INC: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | MICROSOFT CORP: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | BROADCOM INC: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | TESLA INC: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | META PLATFORMS INC-CLASS A: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | ADVANCED MICRO DEVICES: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 보유비중-범위밖 | MICRON TECHNOLOGY INC: undefined |
| 381170 TIGER 미국테크TOP10 INDXX | 섹터비중-비정상 | {"IT":64.59,"COMMUNICATION":21.7,"CONSUMER_DISCRETIONARY":13.84,"UNCLASSIFIED":-0.17} |
| 381170 TIGER 미국테크TOP10 INDXX | 자산비중-비정상 | {"EQUITY":100.13,"CASH":-0.17} |
| 381170 TIGER 미국테크TOP10 INDXX | 국가비중-비정상 | {"US":100.13,"KR":-0.17} |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-영 | 비중 합이 0 |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 스왑(한국투자증권): undefined |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 스왑(하나금융투자): undefined |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 스왑(현대차증권): undefined |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 스왑(유안타증권): undefined |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 스왑(한화투자증권): undefined |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 스왑(삼성증권): undefined |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 스왑(메리츠증권): undefined |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 원화현금: undefined |
| 423160 KODEX KOFR금리액티브(합성) | 보유비중-범위밖 | 설정현금액: undefined |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-영 | 비중 합이 0 |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-범위밖 | CD금리투자KIS TRS 19: undefined |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-범위밖 | CD금리투자KIS TRS 15: undefined |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-범위밖 | KIS CD Total Return Index TRS 250926-04: undefined |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-범위밖 | CD금리투자KIS TRS 20: undefined |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-범위밖 | CD금리투자KIS TRS 3: undefined |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-범위밖 | KIS CD Total Return Index TRS 230407-01: undefined |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-범위밖 | 원화현금: undefined |
| 357870 TIGER CD금리투자KIS(합성) | 보유비중-범위밖 | 설정현금액: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-영 | 비중 합이 0 |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | NVIDIA Corp: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | APPLE Inc: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | INTEL Corp: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | WAL-MART STORES INC: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | NETFLIX: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | CISCO SYSTEMS INC: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | Amazon.com Inc: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | COMCAST CORP: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | MICROSOFT: undefined |
| 367380 ACE 미국나스닥100 | 보유비중-범위밖 | WARNER BROS DISCOVERY INC: undefined |
| 367380 ACE 미국나스닥100 | 섹터비중-비정상 | {"IT":58.41,"COMMUNICATION":13.66,"CONSUMER_DISCRETIONARY":11.08,"CONSUMER_STAPLES":6.3,"HEALTHCARE":4.01,"INDUSTRIALS": |
| 367380 ACE 미국나스닥100 | 자산비중-비정상 | {"EQUITY":99.81,"OTHERS":0.17,"CASH":-0.53} |
| 367380 ACE 미국나스닥100 | 국가비중-비정상 | {"US":96.3,"MISC":3.68,"KR":-0.53} |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-영 | 비중 합이 0 |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 경기주택도시공사25-02-94: undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 경기지역개발23-02: undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 경기지역개발23-03: undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 경북지역개발25-07: undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 광주도시공사24-4: undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 광주지방채13: undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 교보증권11-2: undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 국가철도공단채권393: undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 국고00000-5609(26-8): undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 보유비중-범위밖 | 국고01125-3909(19-6): undefined |
| 273130 KODEX 종합채권(AA-이상)액티브 | 자산비중-비정상 | {"BOND":104.12,"DERIVATIVES":-5.81,"CASH":-5.92} |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-영 | 비중 합이 0 |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 넥스트레벨제일차 20260629-92-1(단): undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 농업금융채권(은행)2026-01이1Y-C(변동): undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 농업금융채권(은행)2026-03이1Y-B(K변동): undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 뉴스타그린켐제일차 20260630-91-1(단): undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 뉴스타그린켐제일차 20260730-92-1(단): undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 뉴스프린트제일차 20260826-92-1: undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 뉴스프린트제일차 20260826-92-10: undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 뉴스프린트제일차 20260826-92-11: undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 뉴스프린트제일차 20260826-92-12: undefined |
| 0043B0 TIGER 머니마켓액티브 | 보유비중-범위밖 | 뉴스프린트제일차 20260826-92-13: undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-영 | 비중 합이 0 |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260327-174-12: undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260327-174-13: undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260327-174-14: undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260327-174-15: undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260327-174-16: undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260327-174-17: undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260722-51-2(단): undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260728-49-5(단): undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 고려아연 20260826-61-3(단): undefined |
| 455890 RISE 머니마켓액티브 | 보유비중-범위밖 | 광주은행2025-11이(변)1갑-14: undefined |
| 472150 TIGER 배당커버드콜액티브 | tr-내포분배율-과다 | M1: 총수익률 10.42% vs 시장가 7.99% → 내포분배율 연 30.61% (공시 분배율 21.36%) |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-영 | 비중 합이 0 |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 스왑(하나금융투자): undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 스왑(메리츠증권): undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 하나증권3827: undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 하나증권3830: undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 하나증권3832: undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 하나증권3834: undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 하나증권3817: undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 하나증권3819: undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 하나증권3822: undefined |
| 481050 KODEX CD1년금리플러스액티브(합성) | 보유비중-범위밖 | 교보증권532: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-영 | 비중 합이 0 |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | TIGER 미국나스닥100: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | NVIDIA CORP: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | APPLE INC: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | INTEL CORP: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | WALMART INC: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | NETFLIX INC: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | CISCO SYSTEMS INC: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | AMAZON.COM INC: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | COMCAST CORP-CLASS A: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 보유비중-범위밖 | MICROSOFT CORP: undefined |
| 486290 TIGER 미국나스닥100타겟데일리커버드콜 | 자산비중-비정상 | {"EQUITY":93.99,"CASH":5.31,"DERIVATIVES":5.3,"OTHERS":0.15,"BOND":-0.05} |
| 426030 TIME 미국나스닥100액티브 | 보유비중-영 | 비중 합이 0 |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | NVIDIA CORP: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | INTEL CORP: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | ROBINHOOD MARKETS INC - A: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | APPLIED OPTOELECTRONICS INC: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | SK HYNIX INC-ADR: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | COREWEAVE INC-CL A: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | STRATEGY INC: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | COINBASE GLOBAL INC -CLASS A: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | AMAZON.COM INC: undefined |
| 426030 TIME 미국나스닥100액티브 | 보유비중-범위밖 | NEBIUS GROUP NV: undefined |
| 449170 TIGER KOFR금리액티브(합성) | 보유비중-영 | 비중 합이 0 |
| 449170 TIGER KOFR금리액티브(합성) | 보유비중-범위밖 | KOFR Index TRS 230614-03: undefined |
| 449170 TIGER KOFR금리액티브(합성) | 보유비중-범위밖 | KOFR금리액티브 TRS 14: undefined |
| 449170 TIGER KOFR금리액티브(합성) | 보유비중-범위밖 | KOFR Index TRS 230922-06: undefined |
| 449170 TIGER KOFR금리액티브(합성) | 보유비중-범위밖 | 원화현금: undefined |
| 449170 TIGER KOFR금리액티브(합성) | 보유비중-범위밖 | 설정현금액: undefined |
| 0193T0 KODEX SK하이닉스단일종목레버리지 | 보유비중-범위밖 | 2026-09 SK하이닉스개별선물: undefined |
| 0193T0 KODEX SK하이닉스단일종목레버리지 | top10Weight-불일치 | 저장 89.58% vs 재계산 100.00% |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-영 | 비중 합이 0 |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | 삼성전기: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | TIME 차이나AI테크액티브: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | MURATA MANUFACTURING CO LTD: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | MINIMAX GROUP INC: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | INTEL CORP: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | FUJIKURA LTD: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | ALIBABA GROUP HOLDING-SP ADR: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | SK HYNIX INC-ADR: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | KIOXIA HOLDINGS CORP: undefined |
| 456600 TIME 글로벌AI인공지능액티브 | 보유비중-범위밖 | APPLIED OPTOELECTRONICS INC: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-영 | 비중 합이 0 |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | KODEX 200: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | 삼성전자: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | SK하이닉스: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | SK스퀘어: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | 삼성전기: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | 현대차: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | KB금융: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | 신한지주: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | 한화에어로스페이스: undefined |
| 284430 KODEX 200미국채혼합50 | 보유비중-범위밖 | 두산에너빌리티: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-영 | 비중 합이 0 |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 10년국채 F 202609: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 경기주택도시공사23-02-56: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 경기주택도시공사25-06-107: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 경기주택도시공사25-10-119: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 경기주택도시공사26-05-137: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 경기주택도시공사26-05-138: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 경기주택도시공사26-07-143: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 경남 서울영업부 20251016-365-1: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 경남 서울영업부 20251202-365-1: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 보유비중-범위밖 | 국가철도공단채권255: undefined |
| 385540 RISE 종합채권(A-이상)액티브 | 자산비중-비정상 | {"BOND":120.67,"DERIVATIVES":-1.32,"CASH":-22.17} |
| 214980 KODEX 단기채권PLUS | 보유비중-영 | 비중 합이 0 |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 국민은행4508이표일(03)1.5-22: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 국민은행4509이표일(03)1-18: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 국민은행4601할인일1-15: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 국민은행4601할인일1-19: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 농금채(중앙회)2024-2이3Y-A: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 농금채(중앙회)2025-12이1Y-B: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 부산은행2025-12이1.5A-09: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 부산은행2026-01이1.5A-14: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 부산은행2026-01할11M-27: undefined |
| 214980 KODEX 단기채권PLUS | 보유비중-범위밖 | 부산은행2026-02이1A-06: undefined |
| 441640 KODEX 미국배당커버드콜액티브 | 보유비중-영 | 비중 합이 0 |
| 441640 KODEX 미국배당커버드콜액티브 | 보유비중-범위밖 | AMPLIFY CWP ENHANCED DIVIDEND: undefined |
| 441640 KODEX 미국배당커버드콜액티브 | 보유비중-범위밖 | VANGUARD S&P 500 ETF: undefined |
| 441640 KODEX 미국배당커버드콜액티브 | 보유비중-범위밖 | WAL-MART STORES INC: undefined |