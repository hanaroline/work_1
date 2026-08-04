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
  updatedAt: null,          // ISO 8601. null 이면 페이지에서 "미수집" 으로 표기
  source: 'sample',         // 'live' | 'sample'
  sourceNote: '미래에셋증권 홈페이지 자동 수집 전 기본값 (구조 이해용 대표 예시)',
  sourceNoteEn: 'Default sample used before automatic collection runs (illustrative structures only)',
  products: [
    {
      code: 'SAMPLE-31234',
      name: '미래에셋증권 ELS 제31234회 (스텝다운 조기상환형)',
      type: 'ELS',
      shape: 'stepdown',
      underlyings: ['KOSPI200', 'S&P500', 'EuroStoxx50'],
      couponAnnual: 8.4,
      maturityMonths: 36,
      // 조기상환 평가일별 배리어(기초자산 최초기준가격 대비 %)
      schedule: [
        { months: 6, barrier: 90 },
        { months: 12, barrier: 90 },
        { months: 18, barrier: 85 },
        { months: 24, barrier: 85 },
        { months: 30, barrier: 80 },
        { months: 36, barrier: 75 },
      ],
      knockIn: 50,           // 낙인 배리어 %. null 이면 노낙인
      principalProtection: 0, // 원금지급률 %. 0 = 원금비보장
      riskGrade: 2,           // 1(매우높은위험) ~ 6
      offerStart: null,
      offerEnd: null,
      issueDate: null,
      minAmount: 1000000,
      url: null,
    },
    {
      code: 'SAMPLE-31235',
      name: '미래에셋증권 ELS 제31235회 (노낙인 스텝다운형)',
      type: 'ELS',
      shape: 'stepdown',
      underlyings: ['S&P500', 'EuroStoxx50'],
      couponAnnual: 6.2,
      maturityMonths: 36,
      schedule: [
        { months: 6, barrier: 95 },
        { months: 12, barrier: 90 },
        { months: 18, barrier: 90 },
        { months: 24, barrier: 85 },
        { months: 30, barrier: 85 },
        { months: 36, barrier: 70 },
      ],
      knockIn: null,
      principalProtection: 0,
      riskGrade: 3,
      offerStart: null,
      offerEnd: null,
      issueDate: null,
      minAmount: 1000000,
      url: null,
    },
    {
      code: 'SAMPLE-31236',
      name: '미래에셋증권 ELB 제31236회 (원금지급형)',
      type: 'ELB',
      shape: 'participation',
      underlyings: ['KOSPI200'],
      couponAnnual: 4.1,
      maturityMonths: 12,
      schedule: [{ months: 12, barrier: 100 }],
      knockIn: null,
      principalProtection: 100,
      riskGrade: 5,
      offerStart: null,
      offerEnd: null,
      issueDate: null,
      minAmount: 1000000,
      url: null,
    },
  ],
};
