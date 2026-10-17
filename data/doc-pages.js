/**
 * 교부 문서(간이투자설명서 및 투자설명서)의 쪽 지도 — scripts/build_doc_pages.mjs 생성물.
 *
 * 창구가 고객 앞에서 짚을 쪽이다. 제목이 정확히 한 쪽에서만 잡힌 자리만 담겨 있고,
 * 여러 쪽에 걸리거나 못 찾은 자리는 **비어 있다** — 틀린 쪽을 짚게 하느니 비운다.
 */
(function (g) {
  g.DOC_PAGES = {
 "updatedAt": "2026-10-17T01:38:05.515Z",
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
  "KR6MD00091V8": {
   "name": "미래에셋증권(ELS)38202e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091V8.pdf",
   "pages": 83,
   "briefUntil": 24,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 14,
    "payoffChart": 16,
    "lossCase": 17,
    "sim": 19,
    "midRedeem": 21,
    "caution": 22,
    "prospectus": 25,
    "riskFactors": 64,
    "offering": 29,
    "fundUse": 78
   }
  },
  "KR6MD00091P0": {
   "name": "미래에셋증권(ELS)38197",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091P0.pdf",
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
    "riskFactors": 57,
    "offering": 26,
    "fundUse": 70
   }
  },
  "KR6MD00091N5": {
   "name": "미래에셋증권(ELS)38196",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091N5.pdf",
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
    "riskFactors": 57,
    "offering": 26,
    "fundUse": 70
   }
  },
  "KR6MD00091T2": {
   "name": "미래에셋증권(ELS)38201e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091T2.pdf",
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
    "offering": 26,
    "fundUse": 71
   }
  },
  "KR6MD00091S4": {
   "name": "미래에셋증권(ELS)38200e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091S4.pdf",
   "pages": 75,
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
    "riskFactors": 57,
    "offering": 26,
    "fundUse": 70
   }
  },
  "KR6MD00091M7": {
   "name": "미래에셋증권(ELS)38195",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091M7.pdf",
   "pages": 74,
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
    "riskFactors": 57,
    "offering": 26,
    "fundUse": 69
   }
  },
  "KR6MD00091R6": {
   "name": "미래에셋증권(ELS)38199e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091R6.pdf",
   "pages": 75,
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
    "riskFactors": 57,
    "offering": 26,
    "fundUse": 70
   }
  },
  "KR6MD00091L9": {
   "name": "미래에셋증권(ELS)38194",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091L9.pdf",
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
    "riskFactors": 57,
    "offering": 26,
    "fundUse": 70
   }
  },
  "KR6MD00091K1": {
   "name": "미래에셋증권(ELS)38193",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091K1.pdf",
   "pages": 75,
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
    "offering": 26,
    "fundUse": 70
   }
  },
  "KR6MD00091Q8": {
   "name": "미래에셋증권(ELS)38198e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091Q8.pdf",
   "pages": 75,
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
    "offering": 26,
    "fundUse": 70
   }
  },
  "KR6MD00091J3": {
   "name": "미래에셋증권(ELS)38192",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091J3.pdf",
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
    "offering": 26,
    "fundUse": 71
   }
  },
  "KR6MD00091H7": {
   "name": "미래에셋증권(ELS)38191",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091H7.pdf",
   "pages": 75,
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
    "offering": 26,
    "fundUse": 70
   }
  },
  "KR6MD00091G9": {
   "name": "미래에셋증권(ELS)38190",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091G9.pdf",
   "pages": 71,
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
    "riskFactors": 57,
    "offering": 26,
    "fundUse": 66
   }
  },
  "KR6MD00091W6": {
   "name": "미래에셋증권(ELB)4106",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00091W6.pdf",
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
  },
  "KR6MD00092S2": {
   "name": "미래에셋증권(ELS)38223",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00092S2.pdf",
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
    "riskFactors": 57,
    "offering": 26,
    "fundUse": 71
   }
  },
  "KR6MD00092Q6": {
   "name": "미래에셋증권(ELS)38222",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD00092Q6.pdf",
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
    "offering": 26,
    "fundUse": 71
   }
  }
 }
};
}(typeof window !== 'undefined' ? window : this));
