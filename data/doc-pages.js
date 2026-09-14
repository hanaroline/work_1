/**
 * 교부 문서(간이투자설명서 및 투자설명서)의 쪽 지도 — scripts/build_doc_pages.mjs 생성물.
 *
 * 창구가 고객 앞에서 짚을 쪽이다. 제목이 정확히 한 쪽에서만 잡힌 자리만 담겨 있고,
 * 여러 쪽에 걸리거나 못 찾은 자리는 **비어 있다** — 틀린 쪽을 짚게 하느니 비운다.
 */
(function (g) {
  g.DOC_PAGES = {
 "updatedAt": "2026-09-14T05:31:45.725Z",
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
  "KR6MD0008X80": {
   "name": "미래에셋증권(ELS)38108",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X80.pdf",
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
  "KR6MD0008XE4": {
   "name": "미래에셋증권(ELS)38114e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XE4.pdf",
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
  "KR6MD0008XD6": {
   "name": "미래에셋증권(ELS)38113e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XD6.pdf",
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
    "offering": 27,
    "fundUse": 70
   }
  },
  "KR6MD0008X72": {
   "name": "미래에셋증권(ELS)38107",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X72.pdf",
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
  "KR6MD0008X64": {
   "name": "미래에셋증권(ELS)38106",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X64.pdf",
   "pages": 81,
   "briefUntil": 23,
   "at": {
    "docStart": 5,
    "target": 9,
    "payoff": 14,
    "payoffChart": 15,
    "lossCase": 17,
    "sim": 18,
    "midRedeem": 20,
    "caution": 21,
    "prospectus": 24,
    "riskFactors": 62,
    "offering": 29,
    "fundUse": 76
   }
  },
  "KR6MD0008X56": {
   "name": "미래에셋증권(ELS)38105",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X56.pdf",
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
  "KR6MD0008X49": {
   "name": "미래에셋증권(ELS)38104",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X49.pdf",
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
  "KR6MD0008XC8": {
   "name": "미래에셋증권(ELS)38112e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XC8.pdf",
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
  "KR6MD0008X31": {
   "name": "미래에셋증권(ELS)38103",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X31.pdf",
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
  "KR6MD0008XB0": {
   "name": "미래에셋증권(ELS)38111e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XB0.pdf",
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
  "KR6MD0008X23": {
   "name": "미래에셋증권(ELS)38102",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X23.pdf",
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
  "KR6MD0008XA2": {
   "name": "미래에셋증권(ELS)38110e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XA2.pdf",
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
  "KR6MD0008X15": {
   "name": "미래에셋증권(ELS)38101",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X15.pdf",
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
  "KR6MD0008X07": {
   "name": "미래에셋증권(ELS)38100",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X07.pdf",
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
  "KR6MD0008X98": {
   "name": "미래에셋증권(ELS)38109e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008X98.pdf",
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
  "KR6MD0008XF1": {
   "name": "미래에셋증권(ELB)4075",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XF1.pdf",
   "pages": 73,
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
    "fundUse": 68
   }
  },
  "KR6MD0008Y55": {
   "name": "미래에셋증권(ELS)38123",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y55.pdf",
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
  "KR6MD0008YD4": {
   "name": "미래에셋증권(ELS)38131e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008YD4.pdf",
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
  "KR6MD0008YC6": {
   "name": "미래에셋증권(ELS)38130e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008YC6.pdf",
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
  "KR6MD0008YB8": {
   "name": "미래에셋증권(ELS)38129e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008YB8.pdf",
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
  "KR6MD0008Y71": {
   "name": "미래에셋증권(ELS)38125e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y71.pdf",
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
  "KR6MD0008YA0": {
   "name": "미래에셋증권(ELS)38128e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008YA0.pdf",
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
  "KR6MD0008Y97": {
   "name": "미래에셋증권(ELS)38127e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y97.pdf",
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
    "offering": 27,
    "fundUse": 70
   }
  },
  "KR6MD0008Y89": {
   "name": "미래에셋증권(ELS)38126e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y89.pdf",
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
  "KR6MD0008Y48": {
   "name": "미래에셋증권(ELS)38122",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y48.pdf",
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
  "KR6MD0008Y30": {
   "name": "미래에셋증권(ELS)38121",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y30.pdf",
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
  "KR6MD0008Y22": {
   "name": "미래에셋증권(ELS)38120",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y22.pdf",
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
  "KR6MD0008Y14": {
   "name": "미래에셋증권(ELS)38119",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y14.pdf",
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
  "KR6MD0008Y63": {
   "name": "미래에셋증권(ELS)38124e",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y63.pdf",
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
  "KR6MD0008Y06": {
   "name": "미래에셋증권(ELS)38118",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008Y06.pdf",
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
  "KR6MD0008XZ9": {
   "name": "미래에셋증권(ELS)38117",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XZ9.pdf",
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
  "KR6MD0008XY2": {
   "name": "미래에셋증권(ELS)38116",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XY2.pdf",
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
  "KR6MD0008XX4": {
   "name": "미래에셋증권(ELS)38115",
   "url": "https://securities.miraeasset.com/public/editor/elsdls/KR6MD0008XX4.pdf",
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
  }
 }
};
}(typeof window !== 'undefined' ? window : this));
