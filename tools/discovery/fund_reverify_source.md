# 재검증 L2 — 저장한 값이 원천과 같은가

검증 시각: 2026-08-29T05:01:17.368Z
자료 기준: 2026-08-29T04:58:09.150Z
표본: 400 / 3196개

**표본 400개 중 오류 96건**

`audit_fund_data.mjs` 는 `data/fund.js` 안에서 서로 어긋나는 것만 잡습니다. 그건 순환이라,
"원천을 옮겨 적은 것이 맞는가" 는 확인되지 않습니다. 여기서는 원천을 **다시 받아** 맞대 봅니다.

파생값은 수집기 함수를 부르지 않고 **두 번째 구현으로 처음부터 다시** 만들었습니다 —
같은 함수가 같은 답을 내는 것은 결정성일 뿐 정확성이 아니기 때문입니다.

## 목록

| 항목 | 수 |
|---|---:|
| 원천 목록 | 3196 |
| 저장된 자료 | 3196 |
| 원천에 있는데 저장에 없음 | 0 |
| 저장에 있는데 원천에 없음 | 0 |

## 필드별 일치

| 필드 | 일치 | 검사 | 비율 |
|---|---:|---:|---:|
| region | 304 | 400 | 76.0% |
| name | 400 | 400 | 100.0% |
| type | 400 | 400 | 100.0% |
| company | 400 | 400 | 100.0% |
| inceptionDate | 400 | 400 | 100.0% |
| benchmarkName | 400 | 400 | 100.0% |
| riskGrade | 400 | 400 | 100.0% |
| tradeDate | 400 | 400 | 100.0% |
| basePrice | 400 | 400 | 100.0% |
| changePrice | 400 | 400 | 100.0% |
| changeRate | 400 | 400 | 100.0% |
| aum | 400 | 400 | 100.0% |
| nav | 400 | 400 | 100.0% |
| aumDropped표시 | 400 | 400 | 100.0% |
| assetClass | 400 | 400 | 100.0% |
| metrics.standardDeviation | 400 | 400 | 100.0% |
| metrics.trackingError | 400 | 400 | 100.0% |
| metrics.sharpe | 400 | 400 | 100.0% |
| metrics.informationRatio | 400 | 400 | 100.0% |
| metrics.jensenAlpha | 400 | 400 | 100.0% |
| metrics.beta | 400 | 400 | 100.0% |
| retSrc | 400 | 400 | 100.0% |
| ret(화면) | 400 | 400 | 100.0% |
| retBenchmark | 400 | 400 | 100.0% |
| holdings.개수 | 400 | 400 | 100.0% |
| classes.개수 | 400 | 400 | 100.0% |
| classes.보수 | 400 | 400 | 100.0% |
| feeMin | 400 | 400 | 100.0% |
| feeMax | 400 | 400 | 100.0% |
| holdings.종목·비중 | 215 | 215 | 100.0% |
| holdingCount | 215 | 215 | 100.0% |
| totalWeight | 215 | 215 | 100.0% |
| top10Weight | 215 | 215 | 100.0% |

**오류 96건 · 경고 0건**

## 오류

| 표준코드 | 펀드 | 규칙 | 내용 |
|---|---|---|---|
| K55229DC7722 | 카디안변액보험코리아글로벌지수연계증권투자신탁3[주 | region-불일치 | 유형 "국내대체" → 기대 domestic vs 저장 mixed |
| KR5219803883 | 신한애그리컬쳐인덱스플러스자투자신탁 1[채권-파생 | region-불일치 | 유형 "해외대체" → 기대 overseas vs 저장 mixed |
| K55105EF9863 | 삼성EMP리얼리턴맥스증권자투자신탁H[주식-재간접 | region-불일치 | 유형 "해외주식형" → 기대 overseas vs 저장 mixed |
| K55240EI0717 | BNK든든한적격TDF2050증권투자신탁(주식혼합 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55307EH0072 | 유리빠른환매미국고배당40증권투자신탁[채권혼합-재 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 domestic |
| K55105BS3666 | 삼성글로벌타겟인컴40증권자투자신탁H[채권혼합-재 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55229BC9225 | 카디안유러피언리더스20증권자투자신탁(H)[채권혼 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 domestic |
| KR5102AX4622 | 하나행복knowhow글로벌주식증권자투자신탁[주식 | region-불일치 | 유형 "해외주식형" → 기대 overseas vs 저장 mixed |
| KR5107397683 | 우리큰만족신종MMF3 | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5219391517 | 신한BEST신종법인용MMFGS-2(종류) | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5105409225 | 삼성MMF법인 1 | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| K55105EN7800 | 삼성글로벌CoreAI목표전환형증권투자신탁3[채권 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 domestic |
| KR5102162421 | 하나개인용MMF2 | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5213260551 | 한화스마트법인MMF 1 | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5105391605 | 삼성신종MMF 151 | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| K55216BZ7680 | DB클린법인MMF 4운용 | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5222367322 | 브이스타국공채법인MMF 1 | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| K55214DH9308 | 유진챔피언HITMMF(국공채) | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5225A65746 | 미래에셋법인전용MMF 1(국공채) | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5107160222 | 우리위비개인MMF 1(국공채) | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5225189764 | 미래에셋국공채전용MMF A1(국공채) | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5101368797 | 한국투자신종법인용MMF 3(국공채) | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5205458734 | 미래에셋국공채MMF투자신탁 1[국공채] | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| KR5221325578 | 키움프런티어개인용MMF 1[국공채] | region-불일치 | 유형 "MMF" → 기대 null vs 저장 domestic |
| K55365ER6944 | KCGI피델리티미국AI테크목표전환형증권투자신탁[ | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 domestic |
| KR5223A65048 | KB연금국내외채권증권전환형자투자신탁(채권)(운용 | region-불일치 | 유형 "해외채권형" → 기대 overseas vs 저장 mixed |
| K55235BC0929 | 피델리티월드Big440증권자투자신탁(채권혼합-재 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| KR5230873113 | 키움슈로더BIC(브라질인도중국)퇴직연금밸런스드4 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55236EU0980 | 한국밸류기업가치포커스3증권투자신탁2(사모투자재간 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 domestic |
| K55236ER8939 | 한국밸류K-파워2증권투자신탁2(사모투자재간접형) | region-불일치 | 유형 "기타형" → 기대 null vs 저장 domestic |
| K55105ED3934 | 삼성EMP리얼리턴맥스증권자투자신탁UH[주식-재간 | region-불일치 | 유형 "해외주식형" → 기대 overseas vs 저장 mixed |
| K55223C44381 | KB온국민평생소득40증권자투자신탁(채권혼합-재간 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55235EO4692 | 피델리티글로벌테크놀로지50증권자투자신탁(채권혼합 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| KR5301991323 | 미래에셋목돈관리목표전환형증권자투자신탁 5(채권) | region-불일치 | 유형 "국내채권형" → 기대 domestic vs 저장 mixed |
| K55301BG3787 | 미래에셋하나1Q퇴직연금증권자투자신탁 1(채권혼합 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55301B75225 | 미래에셋베스트솔루션70증권자투자신탁 1 (주식혼 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| KR5301AU7304 | 미래에셋연금인사이트플러스증권자투자신탁 1(주식혼 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55234B27856 | IBK퇴직연금포춘중국고배당40증권자투자신탁[채권 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| KR5225862790 | 미래에셋퇴직플랜러시아인덱스40증권자투자신탁(채권 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| KR5301AS9825 | 미래에셋ETF로자산배분적격TDF2030증권자투자 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| KR5105683449 | 삼성퇴직연금일본리더스40증권자투자신탁 1[채권혼 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55209DE4580 | 신영적격TDF2040증권투자신탁(주식혼합-재간접 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55223DV8442 | KB다이나믹TDF증권자투자신탁(채권혼합-재간접형 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55210B57713 | 신한퇴직연금POP펀드셀렉션20증권자투자신탁[채권 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55364BF5605 | 에셋플러스글로벌리치투게더30증권자투자신탁 1[채 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55105DS4860 | 삼성OCIO솔루션안정형증권투자신탁[혼합-재간접형 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55210B57861 | 신한연금저축POP펀드셀렉션20증권자투자신탁[채권 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55213C50322 | 한화LIFEPLUSTDF2020증권자투자신탁(채 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| KR5210957761 | 신한퇴직연금차이나40증권자투자신탁(H)[채권혼합 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55301BM1536 | 미래에셋ETF로자산배분적격TDF2045증권자투자 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| K55232CI3630 | NH-Amundi하나로적격TDF2030증권투자신 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| KR5105785640 | 삼성퇴직연금GREATCHINA40증권자투자신탁  | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55102EH6415 | 하나미국대표지수40빨리드림증권투자신탁[채권혼합- | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| KR5223290788 | KB퇴직연금브릭스40 증권자투자신탁(채권혼합)( | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55234DF3192 | IBK로우코스트적격TDF2055증권자투자신탁[주 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55216EA3016 | DB자동으로변하는적격TDF2030증권자투자신탁[ | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| K55101EE3424 | 한국투자베트남주식35증권자투자신탁(채권혼합)(모 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55213C50959 | 한화LIFEPLUS적격TDF2030증권자투자신탁 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55101BK7313 | 한국투자적격TDF알아서2030증권투자신탁(주식혼 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55101BK7438 | 한국투자적격TDF알아서2035증권투자신탁(주식혼 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55301BB7544 | 미래에셋하나1Q연금증권자투자신탁 1(주식혼합-재 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55101BK6885 | 한국투자적격TDF알아서2040증권투자신탁(주식혼 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55363AZ8086 | 트러스톤아시아장기성장주40증권자투자신탁[채권혼합 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55105CT3664 | 삼성퇴직연금OCIO솔루션밸런스증권투자신탁[채권혼 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55216EA5508 | DB자동으로변하는적격TDF2040증권자투자신탁[ | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| K55101DR6894 | 한국투자적격TDF알아서2060증권자투자신탁H(주 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| KR5210268987 | 신한퇴직연금러브40증권자투자신탁[채권혼합](종류 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55107ER9628 | 우리다같이적격TDF2060증권투자신탁(혼합-재간 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| KR5301AY5650 | 미래에셋펀드솔루션40증권전환형자투자신탁 1(채권 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55105DS5073 | 삼성OCIO솔루션성장형증권투자신탁[혼합-재간접형 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55301DI5275 | 미래에셋OCIO-DB표준형증권자투자신탁(채권혼합 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55213EA1195 | 한화LIFEPLUS적격TDF2060증권자투자신탁 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55216EA5706 | DB자동으로변하는적격TDF2060증권자투자신탁[ | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| K55301D50976 | 미래에셋전략배분적격TDF2050혼합자산자투자신탁 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| KR5301727958 | 미래에셋퇴직플랜아시아퍼시픽증권자투자신탁 1(채권 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| KR5301653881 | 미래에셋퇴직플랜아시아퍼시픽40증권자투자신탁 1( | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55210ET3334 | 신한빠른대응적격TDF2040증권자투자신탁(UH) | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55224EQ2283 | 흥국적격TDF2060증권자투자신탁2(UH)[주식 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55234E01343 | IBK그랑프리법인용미국달러화MMF 1(USD) | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55301DW6176 | 미래에셋법인용달러MMF(USD) | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| KR5301519629 | 미래에셋라이프사이클4050연금증권전환형자투자신탁 | region-불일치 | 유형 "국내혼합형" → 기대 domestic vs 저장 mixed |
| K55223ER5831 | KB온국민적격TDF2040증권자투자신탁(주식혼합 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| K55303EN4930 | 마이다스기본적격TDF2040혼합자산자투자신탁(운 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| K55206C95867 | 키움키워드림적격TDF2035증권투자신탁 1[주식 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| KR5225562341 | 미래에셋코친디아포커스7증권자투자신탁2(주식) | region-불일치 | 유형 "해외주식형" → 기대 overseas vs 저장 mixed |
| K55206EO6676 | 키움키워드림다이나믹적격TDF2050증권자투자신탁 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55365DA4931 | KCGI프리덤적격TDF2040증권자투자신탁[주식 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55365DA4840 | KCGI프리덤적격TDF2050증권자투자신탁[주식 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| KR5301643080 | 미래에셋라이프사이클3040증권전환형자투자신탁 1 | region-불일치 | 유형 "국내혼합형" → 기대 domestic vs 저장 mixed |
| K55305CY9456 | 유경글로벌오퍼튜니티증권자투자신탁(주식) | region-불일치 | 유형 "해외주식형" → 기대 overseas vs 저장 mixed |
| KR5232564157 | NH-Amundi코리아차이나올스타증권자투자신탁  | region-불일치 | 유형 "해외주식형" → 기대 overseas vs 저장 mixed |
| K55368EN7232 | iM에셋타이거포커스증권투자신탁(사모투자재간접형) | region-불일치 | 유형 "기타형" → 기대 null vs 저장 mixed |
| K55206EP5214 | 키움키워드림다이나믹적격TDF2060증권자투자신탁 | region-불일치 | 유형 "기타형" → 기대 null vs 저장 overseas |
| K55216EP7853 | DB타이거드래곤바이오헬스케어목표전환형증권투자신탁 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| K55216EE3590 | DB인모스트글로벌주도업종EMP증권자투자신탁[혼합 | region-불일치 | 유형 "해외혼합형" → 기대 overseas vs 저장 mixed |
| KR5301551051 | 미래에셋퇴직플랜G증권자투자신탁 1(주식) | region-불일치 | 유형 "국내주식형" → 기대 domestic vs 저장 mixed |

## 이 검증이 증명하지 못하는 것

**원천(네이버 Npay 증권) 자체가 맞는지는 여기서 알 수 없습니다.** 네이버는 데이터 벤더
페이지이므로 **2차 출처**입니다. 1차 출처는 금융투자협회 전자공시와 운용사 공시이며,
그 대조는 `reverify_fund_kofia.mjs` 에서 따로 시도합니다.
