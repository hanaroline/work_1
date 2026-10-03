/**
 * 교부 문서(간이투자설명서 및 투자설명서)의 쪽 지도 — scripts/build_doc_pages.mjs 생성물.
 *
 * 창구가 고객 앞에서 짚을 쪽이다. 제목이 정확히 한 쪽에서만 잡힌 자리만 담겨 있고,
 * 여러 쪽에 걸리거나 못 찾은 자리는 **비어 있다** — 틀린 쪽을 짚게 하느니 비운다.
 */
(function (g) {
  g.DOC_PAGES = {
 "updatedAt": "2026-10-03T02:24:42.925Z",
 "source": "securities.miraeasset.com /public/editor/elsdls/<ISIN>.pdf",
 "docLabel": "간이투자설명서 및 투자설명서 (교부본)",
 "anchors": [
  {
   "key": "docStart",
   "zone": "brief",
   "what": "간이투자설명서 첫 쪽 (명칭·위험등급)"
  },
  {
   "key": "target",
   "zone": "brief",
   "what": "목표시장·고난도 해당근거"
  },
  {
   "key": "fixDate",
   "zone": "brief",
   "what": "평가일·최초기준가격"
  },
  {
   "key": "payoff",
   "zone": "brief",
   "what": "손익구조 (차수별 상환조건)"
  },
  {
   "key": "payoffChart",
   "zone": "brief",
   "what": "예상 손익구조 그래프"
  },
  {
   "key": "lossCase",
   "zone": "brief",
   "what": "손실 발생 사례"
  },
  {
   "key": "sim",
   "zone": "brief",
   "what": "수익률 모의실험"
  },
  {
   "key": "midRedeem",
   "zone": "brief",
   "what": "중도상환 가격평가일"
  },
  {
   "key": "caution",
   "zone": "brief",
   "what": "투자자 유의사항"
  },
  {
   "key": "prospectus",
   "zone": "full",
   "what": "투자설명서 본문 시작"
  },
  {
   "key": "riskFactors",
   "zone": "full",
   "what": "투자위험요소"
  },
  {
   "key": "offering",
   "zone": "full",
   "what": "모집·매출 개요"
  },
  {
   "key": "fundUse",
   "zone": "full",
   "what": "자금의 사용목적"
  }
 ],
 "items": {
  "KR6MD0009042": {
   "name": "미래에셋증권(ELS)38165e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009042.pdf",
   "pages": 81,
   "briefUntil": 23,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 15,
    "lossCase": 16,
    "sim": 17,
    "midRedeem": 18,
    "caution": 21,
    "prospectus": 24,
    "offering": 29,
    "fundUse": 76
   }
  },
  "KR6MD0009083": {
   "name": "미래에셋증권(ELS)38169e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009083.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD0009000": {
   "name": "미래에셋증권(ELS)38161",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009000.pdf",
   "pages": 79,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 74
   }
  },
  "KR6MD0009067": {
   "name": "미래에셋증권(ELS)38167e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009067.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD0009075": {
   "name": "미래에셋증권(ELS)38168e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009075.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD0008ZZ4": {
   "name": "미래에셋증권(ELS)38160",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZZ4.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD0009059": {
   "name": "미래에셋증권(ELS)38166e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009059.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD0008ZY7": {
   "name": "미래에셋증권(ELS)38159",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZY7.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD0009034": {
   "name": "미래에셋증권(ELS)38164e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009034.pdf",
   "pages": 79,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 74
   }
  },
  "KR6MD0008ZX9": {
   "name": "미래에셋증권(ELS)38158",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZX9.pdf",
   "pages": 81,
   "briefUntil": 23,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 15,
    "lossCase": 16,
    "sim": 17,
    "midRedeem": 18,
    "caution": 21,
    "prospectus": 24,
    "offering": 29,
    "fundUse": 76
   }
  },
  "KR6MD0008ZW1": {
   "name": "미래에셋증권(ELS)38157",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZW1.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD0009026": {
   "name": "미래에셋증권(ELS)38163e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009026.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD0008ZV3": {
   "name": "미래에셋증권(ELS)38156",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZV3.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD0008ZT7": {
   "name": "미래에셋증권(ELS)38155",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZT7.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD0008ZS9": {
   "name": "미래에셋증권(ELS)38154",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZS9.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD0008ZR1": {
   "name": "미래에셋증권(ELS)38153",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZR1.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD0008ZQ3": {
   "name": "미래에셋증권(ELS)38152",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008ZQ3.pdf",
   "pages": 72,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 67
   }
  },
  "KR6MD0009018": {
   "name": "미래에셋증권(ELS)38162e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009018.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD00090W8": {
   "name": "미래에셋증권(ELS)38184e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090W8.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD0009109": {
   "name": "미래에셋증권(ELS)38188e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009109.pdf",
   "pages": 80,
   "briefUntil": 23,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 15,
    "lossCase": 16,
    "sim": 17,
    "midRedeem": 19,
    "caution": 21,
    "prospectus": 24,
    "offering": 29,
    "fundUse": 75
   }
  },
  "KR6MD00090Z1": {
   "name": "미래에셋증권(ELS)38187e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090Z1.pdf",
   "pages": 81,
   "briefUntil": 23,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 15,
    "lossCase": 16,
    "sim": 17,
    "midRedeem": 19,
    "caution": 21,
    "prospectus": 24,
    "riskFactors": 63,
    "offering": 29,
    "fundUse": 76
   }
  },
  "KR6MD00090Y4": {
   "name": "미래에셋증권(ELS)38186e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090Y4.pdf",
   "pages": 80,
   "briefUntil": 23,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 15,
    "lossCase": 16,
    "sim": 17,
    "midRedeem": 19,
    "caution": 21,
    "prospectus": 24,
    "riskFactors": 62,
    "offering": 29,
    "fundUse": 75
   }
  },
  "KR6MD00090X6": {
   "name": "미래에셋증권(ELS)38185e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090X6.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090R8": {
   "name": "미래에셋증권(ELS)38180",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090R8.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090Q0": {
   "name": "미래에셋증권(ELS)38179",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090Q0.pdf",
   "pages": 75,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 70
   }
  },
  "KR6MD00090P2": {
   "name": "미래에셋증권(ELS)38178",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090P2.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090V0": {
   "name": "미래에셋증권(ELS)38183e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090V0.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090N7": {
   "name": "미래에셋증권(ELS)38177",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090N7.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090M9": {
   "name": "미래에셋증권(ELS)38176",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090M9.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090L1": {
   "name": "미래에셋증권(ELS)38175",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090L1.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD00090K3": {
   "name": "미래에셋증권(ELS)38174",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090K3.pdf",
   "pages": 81,
   "briefUntil": 23,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 14,
    "payoffChart": 15,
    "lossCase": 17,
    "sim": 18,
    "midRedeem": 20,
    "caution": 21,
    "prospectus": 24,
    "riskFactors": 63,
    "offering": 29,
    "fundUse": 76
   }
  },
  "KR6MD00090H9": {
   "name": "미래에셋증권(ELS)38172",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090H9.pdf",
   "pages": 77,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 72
   }
  },
  "KR6MD00090J5": {
   "name": "미래에셋증권(ELS)38173",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090J5.pdf",
   "pages": 72,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 13,
    "payoffChart": 14,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 67
   }
  },
  "KR6MD00090T4": {
   "name": "미래에셋증권(ELS)38182e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090T4.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090G1": {
   "name": "미래에셋증권(ELS)38171",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090G1.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 58,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090F3": {
   "name": "미래에셋증권(ELS)38170",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090F3.pdf",
   "pages": 76,
   "briefUntil": 21,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "payoffChart": 14,
    "lossCase": 15,
    "sim": 16,
    "midRedeem": 18,
    "caution": 19,
    "prospectus": 22,
    "riskFactors": 59,
    "offering": 27,
    "fundUse": 71
   }
  },
  "KR6MD00090S6": {
   "name": "미래에셋증권(ELS)38181e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00090S6.pdf",
   "pages": 77,
   "briefUntil": 22,
   "at": {
    "docStart": 5,
    "target": 9,
    "fixDate": 12,
    "payoff": 13,
    "sim": 17,
    "midRedeem": 19,
    "caution": 20,
    "prospectus": 23,
    "riskFactors": 60,
    "offering": 28,
    "fundUse": 72
   }
  },
  "KR6MD0009117": {
   "name": "미래에셋증권(ELB)4099",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0009117.pdf",
   "pages": 72,
   "briefUntil": 19,
   "at": {
    "payoff": 11,
    "payoffChart": 12,
    "sim": 14,
    "midRedeem": 16,
    "caution": 17,
    "prospectus": 20,
    "riskFactors": 54,
    "offering": 24,
    "fundUse": 67
   }
  }
 }
};
}(typeof window !== 'undefined' ? window : this));
