/**
 * 완전판매 스크립트 자동완성 — 상품 데이터 · 투자설명서 필드 정의
 *
 * sales-script.html 이 읽는다.
 *
 * ── 데이터 성격 ──────────────────────────────────────────────
 * PRODUCTS.els  : data/els.js (매일 자동수집, 미래에셋증권 ELS/DLS 캘린더) 를
 *                 우선 사용하고, 로드 실패 시 아래 SEED_ELS 로 폴백한다.
 * 그 외 (fund / bondKrw / bondFx / irp) : 화면 동작 확인용 예시 데이터.
 *                 실제 상담 전 반드시 투자설명서 원문 값으로 교체해야 한다.
 *                 (상단 '상품 데이터 관리' 에서 JSON 가져오기/직접등록 가능)
 *
 * 투자설명서에서 자동으로 못 채우는 값은 null 로 두면 스크립트에
 * 빨간 '확인필요' 로 표시되어 담당자가 채우도록 강제된다.
 */
(function (g) {
  'use strict';

  /* ==========================================================
     1. 투자설명서 필드 정의 (카테고리별)
     - id      : 스크립트 템플릿에서 {{id}} 로 참조
     - label   : 화면 표기
     - group   : 자동조회 패널 묶음
     - hint    : 어느 서류 어디에서 확인하는 값인지
     - fmt     : 표시 포맷터
     ========================================================== */
  var pct = function (v) { return v == null || v === '' ? null : (typeof v === 'number' ? v.toFixed(2) : String(v)) + '%'; };
  var pctA = function (v) { return v == null || v === '' ? null : '연 ' + (typeof v === 'number' ? v.toFixed(2) : String(v)) + '%'; };
  var kdate = function (v) {
    if (!v) return null;
    var m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? m[1] + '년 ' + (+m[2]) + '월 ' + (+m[3]) + '일' : String(v);
  };

  var FIELDS = {
    /* ---------------- 공통(고객·상담 컨텍스트) ---------------- */
    common: [
      { id: 'custProfile', label: '투자자성향', group: '고객', hint: '투자자정보 확인서 진단 결과', ctx: true },
      { id: 'custProfileMeaning', label: '투자자성향의 의미', group: '고객', hint: '진단서상 성향 설명문 — 성향명만 말하면 미인정', ctx: true },
      { id: 'cashPurpose', label: '현재 투자자금 — 투자목적', group: '고객', hint: '현재 투자자금성향 확인서', ctx: true },
      { id: 'cashPrincipal', label: '현재 투자자금 — 원금보존태도', group: '고객', hint: '현재 투자자금성향 확인서', ctx: true },
      { id: 'cashLoss', label: '현재 투자자금 — 손실감내수준', group: '고객', hint: '현재 투자자금성향 확인서', ctx: true },
      { id: 'cashHorizon', label: '현재 투자자금 — 투자예정기간', group: '고객', hint: '현재 투자자금성향 확인서', ctx: true }
    ],

    /* ---------------- 펀드 ---------------- */
    fund: [
      { id: 'name', label: '펀드 명칭 (Full-name)', group: '상품개요', hint: '운용사명 + 펀드명 + 유형까지 전부. 줄여 말하면 미설명 처리', req: true },
      { id: 'mgr', label: '자산운용사', group: '상품개요', hint: '명칭에 포함돼 있어도 별도로 한 번 더 언급해야 인정', req: true },
      { id: 'affiliate', label: '계열운용사 여부', group: '상품개요', hint: '미래에셋자산운용 등 계열이면 고지 + 유사 비계열 펀드 1개 동반 추천 필수' },
      { id: 'riskGrade', label: '위험등급 (숫자)', group: '상품개요', hint: '총 6등급 중 O등급 형태로 설명', req: true },
      { id: 'riskLabel', label: '위험등급 (명칭)', group: '상품개요', hint: '매우높은위험 / 높은위험 / 다소높은위험 / 보통위험 / 낮은위험 / 매우낮은위험', req: true },
      { id: 'fundType', label: '펀드 유형', group: '상품개요', hint: '국내주식형 / 해외주식형 / 채권혼합형 등' },
      { id: 'targets', label: '투자대상 자산 (2가지 + 비율)', group: '운용', hint: '(간이)투자설명서 「투자대상 및 투자전략」', req: true },
      { id: 'strategy', label: '투자전략', group: '운용', hint: '어떻게 투자하는지. 모자형·재간접이면 모(피투자)펀드 전략까지 설명해야 인정', req: true },
      { id: 'term', label: '계약기간', group: '운용', hint: '개방형이면 "환매 가능한 개방형", 폐쇄형이면 계약기간 연수까지', req: true },
      { id: 'risk1', label: '투자위험 핵심사항 ①', group: '위험', hint: '투자설명서 「주요 투자위험」 — 종류만 말하고 내용 없으면 미인정', req: true },
      { id: 'risk2', label: '투자위험 핵심사항 ②', group: '위험', hint: '원금손실·자기책임원칙과 중복되는 내용은 미인정', req: true },
      { id: 'clsA', label: 'A클래스 선취판매수수료', group: '비용', hint: '(간이)투자설명서 보수·수수료 표' },
      { id: 'clsAExp', label: 'A클래스 총보수 (연)', group: '비용', hint: '총보수 / 총보수·비용 / 합성총보수·비용 중 1가지. 모자형·재간접은 합성총보수·비용', req: true },
      { id: 'clsCExp', label: 'C클래스 총보수 (연)', group: '비용', hint: '클래스 비교 설명에 사용' },
      { id: 'redeemFee', label: '환매수수료', group: '비용', hint: '없으면 "없음" 이라고 고지해야 인정', req: true },
      { id: 'buyCut', label: '매입 기준시각', group: '매입·환매', hint: '15시 30분 또는 17시', req: true },
      { id: 'buyBefore', label: '기준시각 前 매입 기준가 적용일', group: '매입·환매', hint: '예) 2영업일', req: true },
      { id: 'buyAfter', label: '기준시각 後 매입 기준가 적용일', group: '매입·환매', hint: '예) 3영업일', req: true },
      { id: 'redeemable', label: '환매·중도해지 가능 여부', group: '매입·환매', hint: '불가하면 불가하다고 고지', req: true },
      { id: 'redBefore', label: '기준시각 前 환매 기준가 적용일', group: '매입·환매', hint: '예) 2영업일', req: true },
      { id: 'redAfter', label: '기준시각 後 환매 기준가 적용일', group: '매입·환매', hint: '예) 3영업일', req: true },
      { id: 'redPay', label: '환매대금 지급일', group: '매입·환매', hint: '예) 4영업일', req: true },
      { id: 'ret1y', label: '최근 1년 수익률', group: '추천근거', hint: '직전월 이후 발간된 객관적 자료의 수치만 인정' },
      { id: 'retPeer', label: '동종유형 평균 수익률', group: '추천근거', hint: '펀드유형 + 위험등급이 모두 일치해야 동일유형' },
      { id: 'peerFund', label: '유사 비계열 펀드 (계열사 상품 추천 시)', group: '추천근거', hint: '투자대상 자산유형·위험등급이 일치해야 유사펀드로 인정' },
      { id: 'varPct', label: 'VaR 값', group: '위험등급 근거', hint: '판매회사가 정한 위험등급의 산정 근거' },
      { id: 'liqRisk', label: '유동성위험 단계', group: '위험등급 근거', hint: '중도환매불가 / 중도환매시 비용발생 / 중도환매 허용' },
      /* 해외펀드 전용 */
      { id: 'fxHedge', label: '환헤지 여부·대상통화', group: '해외투자', hint: '해외펀드 전용. 예) 미달러(USD) 환헤지 실행', ov: true },
      { id: 'fxHedgeSize', label: '목표 환헤지 비율', group: '해외투자', hint: '해외투자분 순자산가치(NAV) 대비. 설명서에 없으면 여부만 설명', ov: true },
      /* 위 두 항목을 한 문장으로 묶은 것 — 헤지를 안 하는 펀드에 「목표 비율 범위 내에서
         헤지할 계획」 을 읽히면 사실과 반대되는 말이 되므로 문장째로 갈라 낸다 */
      { id: 'fxHedgeNote', label: '환헤지 설명 문장 (여부 + 크기)', group: '해외투자', hint: '환헤지 여부·목표 비율에서 자동으로 만든다', ov: true },
      { id: 'fxCountry', label: '주요 투자대상 국가·지역', group: '해외투자', hint: '해외펀드 전용', ov: true },
      /* 문서 */
      { id: 'docDate', label: '투자설명서 증권신고서 효력발생일', group: '교부서류', hint: '가장 최신본인지 반드시 확인', req: true },
      { id: 'shortName', label: '약칭 (부연설명용)', group: '교부서류', hint: '펀드명 풀어서 설명할 때 사용' }
    ],

    /* ---------------- ELS / DLS ---------------- */
    els: [
      { id: 'name', label: '상품 명칭', group: '상품개요', hint: '발행사명(약칭 가능) + 발행회차는 반드시 언급', req: true },
      { id: 'issuer', label: '발행사', group: '상품개요', hint: '예) 미래에셋증권', req: true },
      { id: 'round', label: '발행회차', group: '상품개요', hint: '예) 제38062회', req: true },
      { id: 'kind', label: '상품 종류', group: '상품개요', hint: 'ELS / DLS / ELB / DLB', req: true },
      { id: 'shape', label: '수익구조 형태', group: '상품개요', hint: '스텝다운 / 리자드 / 노낙인 등' },
      { id: 'highDiff', label: '고난도 금융투자상품 해당 여부', group: '상품개요', hint: '해당 시 우선 안내사항·녹취·숙려 필수', req: true },
      { id: 'riskGrade', label: '위험등급 (숫자)', group: '상품개요', hint: '1~6등급', req: true },
      { id: 'riskLabel', label: '위험등급 (명칭)', group: '상품개요', hint: '', req: true },
      { id: 'riskReason', label: '해당 위험등급으로 정해진 이유', group: '상품개요', hint: '예) 최대 원금손실가능금액 20% 초과형', req: true },
      { id: 'under', label: '기초자산', group: '기초자산·손익구조', hint: '전 종목/지수 나열', req: true },
      { id: 'underVol', label: '기초자산별 변동성', group: '기초자산·손익구조', hint: '구체적 수치(%)로 안내해야 인정', req: true },
      { id: 'issueDate', label: '발행일', group: '기초자산·손익구조', hint: '', req: true },
      { id: 'matDate', label: '만기일', group: '기초자산·손익구조', hint: '', req: true },
      { id: 'matTerm', label: '만기 (기간)', group: '기초자산·손익구조', hint: '예) 3년', req: true },
      { id: 'earlyCycle', label: '조기상환 주기', group: '기초자산·손익구조', hint: '예) 6개월', req: true },
      { id: 'fixMethod', label: '최초기준가격 평가방법', group: '기초자산·손익구조', hint: '예) 최초기준가격평가일의 각 기초자산 종가', req: true },
      { id: 'fixDate', label: '최초기준가격 평가일', group: '기초자산·손익구조', hint: '', req: true },
      { id: 'earlyTable', label: '자동조기상환 조건·수익률 (전 차수)', group: '기초자산·손익구조', hint: '모든 차수의 조건과 수익률을 빠짐없이 설명해야 인정', req: true },
      { id: 'matCond', label: '만기상환 조건·수익률', group: '기초자산·손익구조', hint: '이익조건 / 손실조건 모두', req: true },
      { id: 'knockIn', label: 'KI (원금손실발생조건) 배리어', group: '기초자산·손익구조', hint: '노낙인이면 "없음"' },
      { id: 'coupon', label: '제시수익률', group: '기초자산·손익구조', hint: '조기상환 수익률과 만기상환 수익률은 별도 언급해야 인정', req: true },
      { id: 'lossExample', label: '손실 발생 상황 및 손실 추정액', group: '위험', hint: '만기평가일 기초자산 지수/가격 수준을 들어 구체적으로', req: true },
      { id: 'maxLoss', label: '최대 손실 가능성', group: '위험', hint: '적합성보고서 직원 기재사항', req: true },
      { id: 'midPeriod', label: '중도상환 신청가능기간', group: '중도상환', hint: '', req: true },
      { id: 'midPriceDate', label: '중도상환 가격평가일', group: '중도상환', hint: '기초자산 소재지(아시아/비아시아)에 맞게 설명', req: true },
      { id: 'midAmt6', label: '발행 후 6개월 이내 중도상환금액', group: '중도상환', hint: '공정가액의 O% 이상 (소수점 첫째자리까지)', req: true },
      { id: 'midAmtAfter', label: '6개월 경과 후 중도상환금액', group: '중도상환', hint: '공정가액의 O% 이상', req: true },
      { id: 'subUnit', label: '청약단위', group: '청약', hint: '' },
      { id: 'offerEnd', label: '청약 마감일', group: '청약', hint: '' },
      { id: 'watchProduct', label: '투자권유 유의상품 해당 여부', group: '청약', hint: '해당 시 관리직 직원(고객지원팀장·지점장) 사전확인 필수' },
      { id: 'coolNote', label: '숙려기간 · 가입의사확인 실제 일정', group: '청약', hint: '투자설명서상 숙려기간과 가입의사확인 기한. 숙려제도 대상 청약종료일은 일반 청약종료일보다 앞선다' },
      { id: 'fairValueNote', label: '공정가액 (액면 대비)', group: '청약', hint: '발생 가능한 불이익·중도상환 설명의 근거. 발행 직후 중도상환 시에도 손실이 나는 이유' },
      { id: 'docDate', label: '투자설명서 기준일', group: '교부서류', hint: '간이투자설명서 교부는 미인정 — 정식 투자설명서 필요', req: true }
    ],

    /* ---------------- 원화채권 ---------------- */
    bondKrw: [
      { id: 'name', label: '종목명 (Full-name)', group: '상품개요', hint: '예) POSCO306-3 — 줄여 말하면 미설명 처리', req: true },
      { id: 'issuer', label: '채권 발행사', group: '상품개요', hint: '종목명과 별도로 언급해야 인정 (국채는 "국채"만 언급해도 인정)', req: true },
      { id: 'kind', label: '채권의 종류', group: '상품개요', hint: '국채 / 회사채 / 금융채 / 여전채 등', req: true },
      { id: 'riskGrade', label: '위험등급 (숫자)', group: '상품개요', hint: '1~6등급', req: true },
      { id: 'riskLabel', label: '위험등급 (명칭)', group: '상품개요', hint: '', req: true },
      { id: 'riskMeaning', label: '위험등급의 의미·유의사항', group: '상품개요', hint: '적합한 투자자 유형까지 설명해야 인정', req: true },
      { id: 'issueDate', label: '발행일', group: '조건', hint: '년·월·일 모두 설명', req: true },
      { id: 'matDate', label: '만기일', group: '조건', hint: '년·월·일 모두 설명', req: true },
      { id: 'coupon', label: '발행(표면)이자율', group: '조건', hint: "'연' 을 반드시 붙여 설명", req: true },
      { id: 'payType', label: '이자지급유형', group: '조건', hint: '이표채 / 할인채 / 복리채', req: true },
      { id: 'payCycle', label: '이자지급주기', group: '조건', hint: '이표채인 경우만. 예) 3개월', req: true },
      { id: 'ytm', label: '세후 투자수익률', group: '조건', hint: '추천이유 설명에 사용' },
      { id: 'fee', label: '매매수수료', group: '조건', hint: '없으면 "없음" 을 반드시 고지. 중개물이면 중개보수 설명', req: true },
      { id: 'credit', label: '신용등급', group: '신용', hint: '평가사 신용등급', req: true },
      { id: 'creditMeaning', label: '신용등급의 의미', group: '신용', hint: '장외채권 설명서 「3. 채권 신용등급의 정의」 — 위험등급 의미와 같아도 별도 언급 필요', req: true },
      { id: 'guarantee', label: '보증 여부', group: '신용', hint: '예) 무보증 사채 — 제3자 보증·물적담보 없이 발행회사 신용으로 발행', req: true },
      { id: 'fin1', label: '발행회사 주요 재무정보 ①', group: '발행회사', hint: '당기순이익·매출액·영업이익·부채비율 등 수치 1개 이상 (국채는 GDP성장률·외환보유고 등)', req: true },
      { id: 'fin2', label: '발행회사 주요 재무정보 ②', group: '발행회사', hint: '신용평가서상 평정 논거 문구는 미인정 — 반드시 수치', },
      { id: 'sellable', label: '중도매도 가능 여부', group: '위험', hint: '설명서 표기 기준으로 설명', req: true },
      { id: 'mpRate', label: '민평금리 (전영업일)', group: '거래가격', hint: '국내채권 장외거래 투자권유 추가 설명자료', },
      { id: 'mpPrice', label: '민평단가', group: '거래가격', hint: '' },
      { id: 'tradePrice', label: '매매단가', group: '거래가격', hint: '' },
      { id: 'priceDiff', label: '매매단가차이 (민평단가−매매단가)', group: '거래가격', hint: '비율 = 차이/매매단가' },
      { id: 'minAmt', label: '최소 매수금액', group: '거래가격', hint: '' },
      { id: 'docDate', label: '설명서 기준일', group: '교부서류', hint: '핵심요약설명서 · 장외채권설명서 · 장외거래 추가 설명자료', req: true }
    ],

    /* ---------------- 외화채권 ---------------- */
    bondFx: [
      { id: 'name', label: '종목명 (Full-name)', group: '상품개요', hint: '예) T 0 1/4 10/31/25, BNTNF 10 01/01/27', req: true },
      { id: 'issuer', label: '채권 발행사(국)', group: '상품개요', hint: '"OO국채" 라고 하면 발행국가+종류 모두 설명한 것으로 인정', req: true },
      { id: 'kind', label: '채권의 종류', group: '상품개요', hint: '국채 / 회사채 / 금융채 등', req: true },
      { id: 'ccy', label: '발행통화', group: '상품개요', hint: '예) USD', req: true },
      { id: 'riskGrade', label: '위험등급 (숫자)', group: '상품개요', hint: '', req: true },
      { id: 'riskLabel', label: '위험등급 (명칭)', group: '상품개요', hint: '', req: true },
      { id: 'riskMeaning', label: '위험등급의 의미·유의사항', group: '상품개요', hint: '적합한 투자자 유형까지', req: true },
      { id: 'coupon', label: '표면금리', group: '조건', hint: "'연' 을 반드시 붙여 설명", req: true },
      { id: 'issueDate', label: '발행일', group: '조건', hint: '', req: true },
      { id: 'matDate', label: '만기일', group: '조건', hint: '', req: true },
      { id: 'payType', label: '이자지급유형', group: '조건', hint: '이표채 / 할인채 / 복리채', req: true },
      { id: 'payCycle', label: '이자지급주기', group: '조건', hint: '이표채인 경우만', req: true },
      { id: 'payNote', label: '이자지급 특이사항', group: '조건', hint: '없으면 안내 생략 가능' },
      { id: 'payRate', label: '이자지급주기별 이자율', group: '조건', hint: '', req: true },
      { id: 'credit', label: '국제신용등급', group: '신용', hint: 'S&P / Moody\'s / Fitch 중 1개만 설명해도 인정', req: true },
      { id: 'creditMeaning', label: '신용등급의 의미', group: '신용', hint: '설명서상 신용등급의 정의', req: true },
      { id: 'guarantee', label: '보증 여부', group: '신용', hint: '예) 무보증 채권', req: true },
      { id: 'fee', label: '매매수수료', group: '조건', hint: '없으면 "없음" 을 반드시 고지', req: true },
      { id: 'country', label: '투자대상 국가·지역', group: '국가·시장', hint: '외국 국채 증권 설명 항목', req: true },
      { id: 'countryEco', label: '투자대상 국가의 경제·시장상황 특징', group: '국가·시장', hint: '', req: true },
      { id: 'tax', label: '과세에 관한 사항', group: '국가·시장', hint: '현지 이자소득세·양도소득세, 국내 원리금 취득일 기준환율 적용', req: true },
      { id: 'infoSrc', label: '발행국가·국채증권 정보 확인 방법', group: '국가·시장', hint: '예) 해당국 재무부 홈페이지, 당사 채권 상품 페이지', req: true },
      { id: 'settle', label: '중도매도·만기상환 시 원리금 지급', group: '국가·시장', hint: '현지 지급일 이후 국내 취득일까지 통상 2영업일 이상 추가 소요', req: true },
      { id: 'sellable', label: '중도매도 가능 여부', group: '위험', hint: '', req: true },
      { id: 'calcNote', label: '원리금 계산방법', group: '위험', hint: '일수계산법·단복리 구분에 따라 국내채권과 상이할 수 있음' },
      { id: 'minAmt', label: '최소 매수금액', group: '거래', hint: '' },
      { id: 'docDate', label: '설명서 기준일', group: '교부서류', hint: '', req: true }
    ],

    /* ---------------- 개인형 IRP ---------------- */
    irp: [
      { id: 'joinType', label: '고객 가입유형', group: 'IRP 계좌', hint: '자영업자 / 퇴직급여제도 미설정 근로자 / 퇴직금제도 재직근로자 · 직역연금 가입자 등', req: true },
      { id: 'proof', label: '가입유형별 증빙서류', group: 'IRP 계좌', hint: '유형 확인 없이 전부 읽으면 미인정', req: true },
      { id: 'limitYear', label: '연간 개인부담금 납입한도', group: 'IRP 계좌', hint: '1,800만원', req: true },
      { id: 'feeKinds', label: '수수료 종류', group: 'IRP 계좌', hint: '운용관리·자산관리 수수료 등', req: true },
      { id: 'feeTotal', label: '총수수료율', group: 'IRP 계좌', hint: '', req: true },
      { id: 'feeMethod', label: '수수료 부과방식', group: 'IRP 계좌', hint: '', req: true },
      { id: 'products', label: '운용 가능한 상품 (구체적 유형)', group: 'IRP 계좌', hint: '예) 원리금보장형 예금·ELB, 펀드, ETF 등', req: true },
      { id: 'riskLimit', label: '실적배당(원금비보장) 상품 운용비율 제한', group: 'IRP 계좌', hint: '적립금의 70% 한도', req: true },
      { id: 'defaultOpt', label: '디폴트옵션(사전지정운용방법) 상품', group: 'IRP 계좌', hint: '퇴직연금 디폴트옵션 안내장', req: true },
      /* 편입 펀드 */
      { id: 'name', label: '편입 펀드 명칭 (Full-name)', group: '편입 펀드', hint: '', req: true },
      { id: 'mgr', label: '자산운용사', group: '편입 펀드', hint: '', req: true },
      { id: 'riskGrade', label: '위험등급 (숫자)', group: '편입 펀드', hint: '', req: true },
      { id: 'riskLabel', label: '위험등급 (명칭)', group: '편입 펀드', hint: '', req: true },
      { id: 'targets', label: '투자대상 자산', group: '편입 펀드', hint: '', req: true },
      { id: 'strategy', label: '투자전략', group: '편입 펀드', hint: '', req: true },
      { id: 'term', label: '계약기간', group: '편입 펀드', hint: '', req: true },
      { id: 'risk1', label: '투자위험 핵심사항 ①', group: '편입 펀드', hint: '', req: true },
      { id: 'risk2', label: '투자위험 핵심사항 ②', group: '편입 펀드', hint: '', req: true },
      { id: 'clsExp', label: '펀드 총보수 (연)', group: '편입 펀드', hint: 'IRP 계좌 수수료와 별도 부담임을 반드시 설명', req: true },
      { id: 'redeemFee', label: '환매수수료', group: '편입 펀드', hint: '', req: true },
      { id: 'redBefore', label: '기준시각 前 환매 기준가 적용일', group: '편입 펀드', hint: '', req: true },
      { id: 'redAfter', label: '기준시각 後 환매 기준가 적용일', group: '편입 펀드', hint: '', req: true },
      { id: 'redPay', label: '환매대금 지급일', group: '편입 펀드', hint: '', req: true },
      { id: 'docDate', label: '설명서 기준일', group: '교부서류', hint: '', req: true }
    ]
  };

  /* ==========================================================
     2. 상품 카탈로그
     ========================================================== */

  /* ---- 펀드 (예시 데이터 · 실제 투자설명서 값으로 교체 필요) ---- */
  var FUNDS = [
    {
      id: 'F001', sample: true, overseas: false,
      name: '한국밸류 10년투자 증권투자신탁1호(주식)',
      shortName: '한국밸류 10년투자',
      mgr: '한국투자밸류자산운용', affiliate: '비계열',
      riskGrade: 2, riskLabel: '높은위험', fundType: '국내주식형',
      targets: '국내 주식 70% 이상, 채권 30% 이하',
      strategy: '집합투자기구 재산의 70% 이상을 가치투자 운용철학에 따라 국내 주식에 장기 투자하며, 저평가된 종목 및 성장잠재력이 있는 종목에 집중 투자하여 장기적인 자본증식을 추구',
      term: '환매가 가능한 개방형',
      risk1: '주식가격변동위험 — 주로 주식에 투자하므로 투자대상종목의 주식가격 변동에 따른 손실위험에 노출',
      risk2: '시장위험 — 국내금융시장의 주가·이자율 등 거시경제지표 변화, 예상치 못한 정치·경제상황 및 정부조치·세제 변경이 신탁재산 운용에 영향',
      clsA: '납입금액의 1% 이내', clsAExp: 1.50, clsCExp: 2.05, redeemFee: '없음',
      buyCut: '15시 30분', buyBefore: '2영업일', buyAfter: '3영업일',
      redeemable: '환매 및 중도해지가 가능한 상품',
      redBefore: '2영업일', redAfter: '3영업일', redPay: '4영업일',
      ret1y: null, retPeer: null, peerFund: null,
      varPct: 50, liqRisk: '중도환매 허용',
      docDate: null
    },
    {
      id: 'F002', sample: true, overseas: true,
      name: '미래에셋 글로벌그로스 증권자투자신탁1호(주식-재간접형)',
      shortName: '미래에셋 글로벌그로스',
      mgr: '미래에셋자산운용', affiliate: '계열',
      riskGrade: 2, riskLabel: '높은위험', fundType: '해외주식형(재간접)',
      targets: '해외 주식형 집합투자증권 60% 이상, 유동성자산 등 40% 이하',
      strategy: '모투자신탁 및 피투자펀드를 통해 글로벌 성장주에 분산 투자하여 장기 자본이득을 추구 (모펀드·피투자펀드의 투자대상 2가지 및 투자전략까지 반드시 설명)',
      term: '환매가 가능한 개방형',
      risk1: '주식가격변동위험 — 피투자펀드가 편입한 해외 주식의 가격변동에 따른 손실위험',
      risk2: '재간접투자위험 — 피투자펀드의 운용성과·환매제한이 본 투자신탁의 수익률과 환매에 직접 영향',
      clsA: '납입금액의 1% 이내', clsAExp: 1.68, clsCExp: 2.23, redeemFee: '없음',
      buyCut: '17시', buyBefore: '3영업일', buyAfter: '4영업일',
      redeemable: '환매 및 중도해지가 가능한 상품',
      redBefore: '3영업일', redAfter: '4영업일', redPay: '8영업일',
      ret1y: null, retPeer: null, peerFund: null,
      varPct: 50, liqRisk: '중도환매 허용',
      fxHedge: '기준가격 표시통화인 미국 달러화(USD)에 대한 환헤지를 실행',
      fxHedgeSize: '해외투자분 순자산가치(NAV)의 70% 이상 ~ 110% 이하',
      fxCountry: '미국을 중심으로 한 선진국 및 일부 신흥국',
      docDate: null
    },
    {
      id: 'F003', sample: true, overseas: false,
      name: '미래에셋 코어테크 증권자투자신탁1호(주식)',
      shortName: '미래에셋 코어테크',
      mgr: '미래에셋자산운용', affiliate: '계열',
      riskGrade: 1, riskLabel: '매우높은위험', fundType: '국내주식형',
      targets: '국내 주식 80% 이상, 유동성자산 20% 이하',
      strategy: '반도체·AI 등 기술 성장산업 내 핵심 종목에 집중 투자하여 초과수익을 추구',
      term: '환매가 가능한 개방형',
      risk1: '주식가격변동위험 — 특정 업종 집중투자에 따른 가격 급변 손실위험',
      risk2: '집중투자위험 — 소수 종목·업종 편중으로 분산효과가 제한되어 손실이 확대될 수 있음',
      clsA: '납입금액의 1% 이내', clsAExp: 1.42, clsCExp: 1.98, redeemFee: '없음',
      buyCut: '15시 30분', buyBefore: '2영업일', buyAfter: '3영업일',
      redeemable: '환매 및 중도해지가 가능한 상품',
      redBefore: '2영업일', redAfter: '3영업일', redPay: '4영업일',
      ret1y: null, retPeer: null, peerFund: null,
      varPct: 50, liqRisk: '중도환매 허용',
      docDate: null
    },
    {
      id: 'F004', sample: true, overseas: false,
      name: '흥국 智 단기채 증권투자신탁(채권)',
      shortName: '흥국 지 단기채',
      mgr: '흥국자산운용', affiliate: '비계열',
      riskGrade: 5, riskLabel: '낮은위험', fundType: '국내채권형',
      targets: '국내 국공채·우량 회사채 등 채무증권 60% 이상, 유동성자산 40% 이하',
      strategy: '잔존만기 1년 내외의 단기 채권에 투자하여 금리변동 위험을 줄이면서 이자수익을 추구',
      term: '환매가 가능한 개방형',
      risk1: '이자율변동위험 — 시장금리 상승 시 보유 채권의 평가손실이 발생',
      risk2: '신용위험 — 편입 채권 발행기업의 신용등급 하락·부도 시 원리금 회수가 지연되거나 손실 발생',
      clsA: '납입금액의 0.3% 이내', clsAExp: 0.32, clsCExp: 0.48, redeemFee: '없음',
      buyCut: '17시', buyBefore: '2영업일', buyAfter: '3영업일',
      redeemable: '환매 및 중도해지가 가능한 상품',
      redBefore: '2영업일', redAfter: '3영업일', redPay: '3영업일',
      ret1y: null, retPeer: null, peerFund: null,
      varPct: 50, liqRisk: '중도환매 허용',
      docDate: null
    }
  ];

  /* ---- 원화채권 (예시) ---- */
  var BOND_KRW = [
    {
      id: 'BK001', sample: true,
      name: '국고채권 03750-3512(25-9)', issuer: '대한민국 정부(기획재정부)', kind: '국채',
      riskGrade: 5, riskLabel: '낮은위험',
      riskMeaning: '투자원금의 손실위험은 최소화하고, 이자소득이나 배당소득 수준의 안정적인 투자를 목표로 하는 투자자에게 적합한 상품',
      issueDate: '2025-12-10', matDate: '2035-12-10',
      coupon: 3.75, payType: '이표채', payCycle: '6개월', ytm: null, fee: '없음',
      credit: 'AAA(국가)', creditMeaning: '원리금 지급능력이 최고 수준이며 예측 가능한 장래의 환경변화에 영향을 받지 않을 만큼 안정적임을 의미',
      guarantee: '대한민국 정부가 원리금을 상환하는 국채',
      fin1: null, fin2: null, sellable: '중도매도 가능 (단, 당사 상황에 따라 종목별로 변동될 수 있음)',
      mpRate: null, mpPrice: null, tradePrice: null, priceDiff: null, minAmt: '1만원', docDate: null
    },
    {
      id: 'BK002', sample: true,
      name: 'POSCO306-3', issuer: '주식회사 포스코', kind: '회사채(무보증 사채)',
      riskGrade: 5, riskLabel: '낮은위험',
      riskMeaning: '투자원금의 손실위험은 최소화하고, 이자소득이나 배당소득 수준의 안정적인 투자를 목표로 하는 투자자에게 적합한 상품',
      issueDate: '2024-03-15', matDate: '2029-03-15',
      coupon: 3.92, payType: '이표채', payCycle: '3개월', ytm: null, fee: '없음',
      credit: 'AA(한국신용평가)', creditMeaning: '원리금 지급능력이 매우 우수하지만 AAA 등급에 비해 다소 열등한 요소가 있음을 의미',
      guarantee: '무보증 사채 — 제3자의 보증이나 물적담보의 제공 없이 순수히 발행회사의 신용으로 발행',
      fin1: null, fin2: null, sellable: '중도매도 가능 (단, 당사 상황에 따라 종목별로 변동될 수 있음)',
      mpRate: null, mpPrice: null, tradePrice: null, priceDiff: null, minAmt: '1만원', docDate: null
    },
    {
      id: 'BK003', sample: true,
      name: '현대캐피탈1234-2', issuer: '현대캐피탈 주식회사', kind: '금융채(여신전문금융회사채)',
      riskGrade: 4, riskLabel: '보통위험',
      riskMeaning: '투자원금의 일부 손실을 감수하더라도 시장 평균 수준의 수익을 추구하는 투자자에게 적합한 상품',
      issueDate: '2025-05-20', matDate: '2028-05-20',
      coupon: 4.18, payType: '이표채', payCycle: '3개월', ytm: null, fee: '없음',
      credit: 'AA-(NICE신용평가)', creditMeaning: '원리금 지급능력이 우수하지만 상위 등급에 비해 장래 환경변화에 다소 영향을 받을 가능성이 있음을 의미',
      guarantee: '무보증 사채 — 발행회사의 신용으로 발행',
      fin1: null, fin2: null, sellable: '중도매도 가능 (단, 당사 상황에 따라 종목별로 변동될 수 있음)',
      mpRate: null, mpPrice: null, tradePrice: null, priceDiff: null, minAmt: '1만원', docDate: null
    }
  ];

  /* ---- 외화채권 (예시) ---- */
  var BOND_FX = [
    {
      id: 'BF001', sample: true,
      name: 'T 4 1/4 11/15/34', issuer: '미국 재무부(U.S. Treasury)', kind: '국채', ccy: 'USD',
      riskGrade: 5, riskLabel: '낮은위험',
      riskMeaning: '투자원금의 손실위험은 최소화하고 이자소득 수준의 안정적인 투자를 목표로 하는 투자자에게 적합한 상품',
      coupon: 4.25, issueDate: '2024-11-15', matDate: '2034-11-15',
      payType: '이표채', payCycle: '6개월', payNote: null, payRate: null,
      credit: 'AA+(S&P) / Aaa(Moody\'s)',
      creditMeaning: '원리금 지급능력이 매우 우수한 최상위권 등급으로, 장래 환경변화에 영향을 받을 가능성이 낮음을 의미',
      guarantee: '무보증 채권 (미국 정부의 신용으로 발행)', fee: '없음',
      country: '미국', countryEco: null, tax: null, infoSrc: null, settle: null,
      sellable: '중도매도 가능 (유동성 부족 시 적정가격 이하 매도 위험 존재)',
      calcNote: '채권별 일수계산법(Actual/Actual 등) 및 단·복리 구분에 따라 국내채권과 상이할 수 있음',
      minAmt: null, docDate: null
    },
    {
      id: 'BF002', sample: true,
      name: 'BNTNF 10 01/01/29', issuer: '브라질 재무부(Tesouro Nacional)', kind: '국채', ccy: 'BRL',
      riskGrade: 3, riskLabel: '다소높은위험',
      riskMeaning: '투자원금의 손실위험을 감수하더라도 시장 평균을 상회하는 수익을 추구하는 투자자에게 적합한 상품',
      coupon: 10.00, issueDate: '2023-01-01', matDate: '2029-01-01',
      payType: '이표채', payCycle: '6개월', payNote: null, payRate: null,
      credit: 'BB(S&P)',
      creditMeaning: '원리금 지급능력에 당면 문제는 없으나 장래의 안정성 면에서는 투기적 요소가 내포되어 있음을 의미',
      guarantee: '무보증 채권 (브라질 연방정부의 신용으로 발행)', fee: '없음',
      country: '브라질', countryEco: null, tax: null, infoSrc: null, settle: null,
      sellable: '중도매도 가능 (유동성 부족 시 적정가격 이하 매도 위험 존재)',
      calcNote: '채권별 일수계산법 및 단·복리 구분에 따라 국내채권과 상이할 수 있음',
      minAmt: null, docDate: null
    }
  ];

  /* ---- 개인형 IRP (예시) ---- */
  var IRPS = [
    {
      id: 'IRP001', sample: true,
      name: '미래에셋 코어테크 증권자투자신탁1호(주식)', mgr: '미래에셋자산운용',
      riskGrade: 1, riskLabel: '매우높은위험',
      targets: '국내 주식 80% 이상, 유동성자산 20% 이하',
      strategy: '반도체·AI 등 기술 성장산업 내 핵심 종목에 집중 투자하여 초과수익을 추구',
      term: '환매가 가능한 개방형',
      risk1: '주식가격변동위험 — 특정 업종 집중투자에 따른 가격 급변 손실위험',
      risk2: '집중투자위험 — 소수 종목·업종 편중으로 분산효과가 제한되어 손실이 확대될 수 있음',
      clsExp: 1.42, redeemFee: '없음', redBefore: '2영업일', redAfter: '3영업일', redPay: '4영업일',
      joinType: null, proof: null, limitYear: '연간 1,800만원',
      feeKinds: null, feeTotal: null, feeMethod: null,
      products: null, riskLimit: '적립금의 70% 한도', defaultOpt: null, docDate: null
    },
    {
      id: 'IRP002', sample: true,
      name: '흥국 智 단기채 증권투자신탁(채권)', mgr: '흥국자산운용',
      riskGrade: 5, riskLabel: '낮은위험',
      targets: '국내 국공채·우량 회사채 등 채무증권 60% 이상, 유동성자산 40% 이하',
      strategy: '잔존만기 1년 내외의 단기 채권에 투자하여 금리변동 위험을 줄이면서 이자수익을 추구',
      term: '환매가 가능한 개방형',
      risk1: '이자율변동위험 — 시장금리 상승 시 보유 채권의 평가손실이 발생',
      risk2: '신용위험 — 편입 채권 발행기업의 신용등급 하락·부도 시 손실 발생',
      clsExp: 0.32, redeemFee: '없음', redBefore: '2영업일', redAfter: '3영업일', redPay: '3영업일',
      joinType: null, proof: null, limitYear: '연간 1,800만원',
      feeKinds: null, feeTotal: null, feeMethod: null,
      products: null, riskLimit: '적립금의 70% 한도', defaultOpt: null, docDate: null
    }
  ];

  /* ==========================================================
     3. ELS/DLS — data/els.js 우선, 실패 시 SEED_ELS 폴백
     ========================================================== */
  var SEED_ELS = [{"code":"KR6MD0008VJ7","name":"미래에셋증권(ELS)38062e","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":29,"rateBasis":"annual","maturityMonths":12,"schedule":[[3,75],[6,75],[9,75],[12,70]],"knockIn":40,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"1년 만기, 75-75-75-70, KI 40, 원화"},{"code":"KR6MD0008VF5","name":"미래에셋증권(ELS)38059","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":40,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,85],[6,85],[9,85],[12,85],[15,85],[18,85],[21,85],[24,85],[27,85],[30,80],[33,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"<달러청약 상품> 85-85-85-85-85-85-85-85-85-80-75-70, KI 35"},{"code":"KR6MD0008VE8","name":"미래에셋증권(ELS)38058","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":35,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,85],[6,85],[9,85],[12,85],[15,85],[18,85],[21,85],[24,85],[27,85],[30,80],[33,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"85-85-85-85-85-85-85-85-85-80-75-70, KI 35, 원화"},{"code":"KR6MD0008VD0","name":"미래에셋증권(ELS)38057","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":33,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,65]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"<달러청약 상품> 75-75-75-75-70-65, KI 35"},{"code":"KR6MD0008VC2","name":"미래에셋증권(ELS)38056","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":30,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,65]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"75-75-75-75-70-65, KI 35, 원화"},{"code":"KR6MD0008VK5","name":"미래에셋증권(ELS)38063e","type":"ELS","shape":"주식지급형 스텝다운","underlyings":["마이크론 테크놀로지","어플라이드 머티어리얼즈"],"couponRate":29.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"75-75-75-75-70-70, KI 35, 원화"},{"code":"KR6MD0008VM1","name":"미래에셋증권(ELS)38065e","type":"ELS","shape":"스텝다운","underlyings":["마이크론 테크놀로지","KOSPI200"],"couponRate":29,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,80],[12,80],[18,80],[24,80],[30,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"80-80-80-80-75-70, KI 35, 원화"},{"code":"KR6MD0008VB4","name":"미래에셋증권(ELS)38055","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":28,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,65]],"knockIn":30,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"75-75-75-75-70-65, KI 30, 원화"},{"code":"KR6MD0008VL3","name":"미래에셋증권(ELS)38064e","type":"ELS","shape":"스텝다운","underlyings":["마이크론 테크놀로지","브로드컴"],"couponRate":27.1,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,80],[12,80],[18,75],[24,75],[30,70],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"80-80-75-75-70-70 , KI 35, 원화"},{"code":"KR6MD0008VH1","name":"미래에셋증권(ELS)38061e","type":"ELS","shape":"스텝다운","underlyings":["KOSPI200","SK하이닉스"],"couponRate":24,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,75],[6,75],[9,75],[12,75],[15,75],[18,75],[21,75],[24,75],[27,70],[30,70],[33,70],[36,65]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"75-75-75-75-75-75-75-75-70-70-70-65, KI 35, 원화"},{"code":"KR6MD0008VG3","name":"미래에셋증권(ELS)38060e","type":"ELS","shape":"스텝다운","underlyings":["Nikkei225","KOSPI200","S&P500"],"couponRate":15.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":40,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"85-85-85-80-75-70, KI 40, 원화"},{"code":"KR6MD0008VA6","name":"미래에셋증권(ELS)38054","type":"ELS","shape":"스텝다운","underlyings":["EuroStoxx50","KOSPI200","S&P500"],"couponRate":13.2,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"85-85-85-80-75-70, KI 35, 원화"},{"code":"KR6MD0008V90","name":"미래에셋증권(ELS)38053","type":"ELS","shape":"스텝다운","underlyings":["Nikkei225","HSCEI","KOSPI200"],"couponRate":12,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":30,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"85-85-85-80-75-70, KI 30, 원화"},{"code":"KR6MD0008V82","name":"미래에셋증권(ELS)38052","type":"ELS","shape":"스텝다운","underlyings":["KOSPI200"],"couponRate":11.9,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,90],[6,90],[9,90],[12,90],[15,85],[18,85],[21,85],[24,85],[27,80],[30,80],[33,80],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"90-90-90-90-85-85-85-85-80-80-80-70, KI 35, 원화"},{"code":"KR6MD0008V74","name":"미래에셋증권(ELS)38051","type":"ELS","shape":"스텝다운","underlyings":["KOSPI200"],"couponRate":11.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"85-85-85-80-75-70, KI 35, 원화"},{"code":"KR6MD0008V66","name":"미래에셋증권(ELS)38050","type":"ELS","shape":"스텝다운","underlyings":["Nikkei225","HSCEI","S&P500"],"couponRate":11,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,90],[12,85],[18,80],[24,75],[30,70],[36,65]],"knockIn":45,"principalProtection":0,"riskGrade":2,"riskLabel":"높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"90-85-80-75-70-65, KI 45, 원화"},{"code":"KR6MD0008V58","name":"미래에셋증권(ELS)38049","type":"ELS","shape":"스텝다운","underlyings":["KOSPI200"],"couponRate":10.2,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"75-75-75-75-75-70, KI 35, 원화"},{"code":"KR6MD0008V41","name":"미래에셋증권(ELS)38048","type":"ELS","shape":"리자드","underlyings":["EuroStoxx50","KOSPI200","S&P500"],"couponRate":10,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,80],[18,75],[24,70],[30,65],[36,60]],"knockIn":null,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"85-80(45)-75-70-65-60, KI -, 원화, 리자드 조건 충족 시 연 10%"},{"code":"KR6MD0008VN9","name":"미래에셋증권(ELB)4058","type":"ELB","shape":"하이파이브 월지급식","underlyings":["KOSPI200","SK하이닉스"],"couponRate":6,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,70],[6,70],[9,70],[12,70],[15,70],[18,70],[21,70],[24,70],[27,70],[30,70],[33,70],[36,70]],"knockIn":null,"principalProtection":100,"riskGrade":5,"riskLabel":"낮은위험","offerStart":"2026-08-26","offerEnd":"2026-09-02","structureDesc":"70-70-70-70-70-70-70-70-70-70-70-70(월지급배리어:65), KI -, 원화"},{"code":"KR6MD0008W99","name":"미래에셋증권(ELS)38081","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":40,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,85],[6,85],[9,85],[12,85],[15,85],[18,85],[21,85],[24,85],[27,85],[30,80],[33,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"<달러청약 상품> 85-85-85-85-85-85-85-85-85-80-75-70, KI 35"},{"code":"KR6MD0008W81","name":"미래에셋증권(ELS)38080","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":36.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"85-85-85-80-75-70, KI 35, 원화"},{"code":"KR6MD0008WD8","name":"미래에셋증권(ELS)38085e","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":32.3,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,85],[6,85],[9,85],[12,85],[15,85],[18,85],[21,85],[24,85],[27,85],[30,80],[33,75],[36,70]],"knockIn":30,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"85-85-85-85-85-85-85-85-85-80-75-70, KI 30, 원화"},{"code":"KR6MD0008W73","name":"미래에셋증권(ELS)38079","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":30,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,65]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"75-75-75-75-70-65, KI 35, 원화"},{"code":"KR6MD0008WH9","name":"미래에셋증권(ELS)38089e","type":"ELS","shape":"스텝다운","underlyings":["마이크론 테크놀로지","테슬라"],"couponRate":29.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"75-75-75-75-70-70, KI 35, 원화"},{"code":"KR6MD0008W65","name":"미래에셋증권(ELS)38078","type":"ELS","shape":"스텝다운","underlyings":["KOSPI200","삼성전자"],"couponRate":29,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,90],[6,90],[9,90],[12,90],[15,85],[18,85],[21,85],[24,85],[27,80],[30,80],[33,80],[36,70]],"knockIn":30,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"90-90-90-90-85-85-85-85-80-80-80-70, KI 30, 원화"},{"code":"KR6MD0008WC0","name":"미래에셋증권(ELS)38084e","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":27,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":25,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"85-85-85-80-75-70, KI 25, 원화"},{"code":"KR6MD0008W57","name":"미래에셋증권(ELS)38077","type":"ELS","shape":"스텝다운","underlyings":["KOSPI200","삼성전자"],"couponRate":25.1,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,80],[12,80],[18,80],[24,80],[30,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"80-80-80-80-75-70, KI 35, 원화"},{"code":"KR6MD0008WG1","name":"미래에셋증권(ELS)38088e","type":"ELS","shape":"스텝다운","underlyings":["마이크론 테크놀로지","브로드컴"],"couponRate":24.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,80],[12,80],[18,75],[24,75],[30,70],[36,70]],"knockIn":30,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"80-80-75-75-70-70 , KI 30, 원화"},{"code":"KR6MD0008WB2","name":"미래에셋증권(ELS)38083e","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":24,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,65]],"knockIn":25,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"75-75-75-75-70-65, KI 25, 원화"},{"code":"KR6MD0008WF3","name":"미래에셋증권(ELS)38087e","type":"ELS","shape":"스텝다운","underlyings":["마이크론 테크놀로지","팔란티어 테크"],"couponRate":23,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,70]],"knockIn":25,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"75-75-75-75-70-70, KI 25, 원화"},{"code":"KR6MD0008W40","name":"미래에셋증권(ELS)38076","type":"ELS","shape":"스텝다운","underlyings":["삼성전자","SK하이닉스"],"couponRate":21,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":20,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"85-85-85-80-75-70, KI 20, 원화"},{"code":"KR6MD0008WA4","name":"미래에셋증권(ELS)38082e","type":"ELS","shape":"스텝다운","underlyings":["Nikkei225","HSCEI","KOSPI200"],"couponRate":18,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":45,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"85-85-85-80-75-70, KI 45, 원화"},{"code":"KR6MD0008W32","name":"미래에셋증권(ELS)38075","type":"ELS","shape":"스텝다운","underlyings":["Nikkei225","EuroStoxx50","KOSPI200"],"couponRate":16,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":40,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"85-85-85-80-75-70, KI 40, 원화"},{"code":"KR6MD0008WE6","name":"미래에셋증권(ELS)38086e","type":"ELS","shape":"스텝다운","underlyings":["팔란티어 테크","테슬라"],"couponRate":16,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,75],[12,75],[18,75],[24,75],[30,70],[36,70]],"knockIn":25,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"75-75-75-75-70-70, KI 25, 원화"},{"code":"KR6MD0008W24","name":"미래에셋증권(ELS)38074","type":"ELS","shape":"스텝다운 노낙인","underlyings":["EuroStoxx50","KOSPI200","S&P500"],"couponRate":14.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,80],[12,75],[18,75],[24,70],[30,65],[36,60]],"knockIn":null,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"80-75-75-70-65-60, KI -, 원화"},{"code":"KR6MD0008W16","name":"미래에셋증권(ELS)38073","type":"ELS","shape":"스텝다운","underlyings":["KOSPI200"],"couponRate":12,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,90],[12,90],[18,90],[24,85],[30,80],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"90-90-90-85-80-70, KI 35, 원화"},{"code":"KR6MD0008W08","name":"미래에셋증권(ELS)38072","type":"ELS","shape":"스텝다운","underlyings":["KOSPI200"],"couponRate":11.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,85],[12,85],[18,85],[24,80],[30,75],[36,70]],"knockIn":35,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"85-85-85-80-75-70, KI 35, 원화"},{"code":"KR6MD0008VZ3","name":"미래에셋증권(ELS)38071","type":"ELS","shape":"리자드","underlyings":["Nikkei225","KOSPI200","S&P500"],"couponRate":10.5,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,80],[12,75],[18,75],[24,70],[30,65],[36,60]],"knockIn":null,"principalProtection":0,"riskGrade":1,"riskLabel":"매우높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"80-75(40)-75-70-65-60, KI -, 원화, 리자드 조건 충족 시 연 10.5%"},{"code":"KR6MD0008VY6","name":"미래에셋증권(ELS)38070","type":"ELS","shape":"스텝다운","underlyings":["Nikkei225","EuroStoxx50","S&P500"],"couponRate":10,"rateBasis":"annual","maturityMonths":36,"schedule":[[6,90],[12,90],[18,85],[24,80],[30,75],[36,70]],"knockIn":45,"principalProtection":0,"riskGrade":2,"riskLabel":"높은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"90-90-85-80-75-70, KI 45, 원화"},{"code":"KR6MD0008WJ5","name":"미래에셋증권(ELB)4063","type":"ELB","shape":"하이파이브 월지급식","underlyings":["KOSPI200","SK하이닉스"],"couponRate":7.02,"rateBasis":"annual","maturityMonths":36,"schedule":[[3,75],[6,75],[9,75],[12,75],[15,75],[18,75],[21,75],[24,75],[27,75],[30,75],[33,75],[36,75]],"knockIn":null,"principalProtection":100,"riskGrade":5,"riskLabel":"낮은위험","offerStart":"2026-08-31","offerEnd":"2026-09-09","structureDesc":"75-75-75-75-75-75-75-75-75-75-75-75(월지급배리어:70), KI -, 원화"}];

  function addMonths(iso, m) {
    if (!iso) return null;
    var d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d)) return null;
    d.setUTCMonth(d.getUTCMonth() + m);
    return d.toISOString().slice(0, 10);
  }
  function addDays(iso, n) {
    if (!iso) return null;
    var d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d)) return null;
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }

  /** els.js / SEED_ELS 의 raw 레코드를 스크립트 필드로 정규화 */
  function normalizeEls(p) {
    var sch = (p.schedule || []).map(function (s) {
      return Array.isArray(s) ? { months: s[0], barrier: s[1] } : s;
    });
    var round = (String(p.name || '').match(/(\d{4,6})/) || [])[1] || null;
    var issue = p.issueDate || (p.offerEnd ? addDays(p.offerEnd, 1) : null);
    var mat = issue && p.maturityMonths ? addMonths(issue, p.maturityMonths) : null;
    var cycle = sch.length > 1 ? (sch[1].months - sch[0].months) : (sch.length ? sch[0].months : null);
    var isELB = /ELB|DLB/.test(p.type || '');
    var coupon = p.couponRate;

    /* 자동조기상환 조건·수익률 표
       배리어(관찰조건)와 차수 일정은 수집 데이터를 그대로 사용한다.
       ★ 차수별 '액면금액 대비 지급률' 은 절대 계산하지 않는다 ★
         제시수익률의 표기기준(연율/누적)이 상품마다 달라 자동 계산하면
         '금융상품의 내용을 사실과 다르게 알리는 행위'(부당권유 최대 -18점)
         가 될 수 있다. 반드시 투자설명서 원문에서 옮겨 적도록 «» 마커로 남긴다. */
    var rows = sch.map(function (s, i) {
      return '  · ' + (i + 1) + '차 자동조기상환평가일(' + s.months + '개월) : 모든 기초자산의 자동조기상환평가가격이 각 최초기준가격의 '
        + s.barrier + '% 이상인 경우 → 액면금액의 «' + (i + 1) + '차 지급률(%)»(연 «' + (i + 1) + '차 연수익률(%)»)을 지급';
    }).join('\n');

    var last = sch.length ? sch[sch.length - 1] : null;
    var matCond = null;
    if (last) {
      matCond = '[이익조건] 자동조기상환이 발생하지 않을 경우, 만기평가일에 모든 기초자산의 만기평가가격이 각 최초기준가격의 '
        + last.barrier + '% 이상인 경우 액면금액의 «만기 지급률(%)»(연 «만기 연수익률(%)»)의 세전수익률을 지급합니다.';
      if (p.knockIn) {
        matCond += '\n위 조건을 만족하지 못하더라도, 모든 기초자산 중 어느 하나도 종가기준으로 각 최초기준가격의 ' + p.knockIn +
          '% 미만으로 하락한 적이 없는 경우 액면금액의 «KI 미터치 지급률(%)»(연 «KI 미터치 연수익률(%)»)의 세전수익률을 지급합니다.' +
          '\n[손실조건] 모든 기초자산 중 어느 하나라도 종가기준으로 각 최초기준가격의 ' + p.knockIn +
          '% 미만으로 하락한 적이 있는 경우, 모든 기초자산 중 하락률이 큰 기초자산의 하락률만큼 원금손실이 발생합니다.';
      } else {
        matCond += '\n[손실조건] 위 조건을 만족하지 못하는 경우, 모든 기초자산 중 하락률이 큰 기초자산의 하락률만큼 원금손실이 발생합니다.';
      }
    }

    return {
      id: p.code, sample: false, raw: p,
      name: (p.name || '') + (p.shape ? ' [' + p.shape + ']' : ''),
      issuer: '미래에셋증권',
      round: round ? '제' + round + '회' : null,
      kind: p.type || null,
      shape: p.shape || null,
      highDiff: isELB ? '해당 없음 (원금보장형)' : '해당 (고난도 금융투자상품)',
      riskGrade: p.riskGrade, riskLabel: p.riskLabel,
      riskReason: (p.principalProtection === 0 || p.principalProtection == null)
        ? '최대 원금손실가능금액 20% 초과형' : '원금 ' + p.principalProtection + '% 보장형',
      under: (p.underlyings || []).join(', ') || null,
      underVol: null,
      issueDate: issue, matDate: mat,
      matTerm: p.maturityMonths ? (p.maturityMonths % 12 === 0 ? (p.maturityMonths / 12) + '년' : p.maturityMonths + '개월') : null,
      earlyCycle: cycle ? cycle + '개월' : null,
      fixMethod: '최초기준가격평가일의 각 기초자산 종가',
      fixDate: issue,
      earlyTable: rows || null,
      matCond: matCond,
      knockIn: p.knockIn ? p.knockIn + '%' : '없음 (노낙인)',
      /* 제시수익률은 표기기준(연율/누적)이 상품마다 달라 자동 확정하지 않는다.
         수집값은 _collectedCoupon 으로 참고 표시만 하고, 스크립트에 읽히는
         값은 담당자가 투자설명서에서 확인해 입력한다. */
      coupon: null,
      _collectedCoupon: coupon != null ? coupon + '% (' + (p.rateBasis === 'annual' ? '수집기준: 연율' : '수집기준: ' + (p.rateBasis || '미상')) + ')' : null,
      lossExample: null,
      maxLoss: (p.maxLossRate != null ? Math.abs(p.maxLossRate) + '%' : '100%'),
      midPeriod: '발행일 익영업일부터 중도상환 신청불가능일(최종관찰일 이전 4영업일부터 최종관찰일까지, 자동조기상환평가일·만기평가일·수익지급평가일과 그 직전 영업일)을 제외한 모든 영업일',
      midPriceDate: null,
      midAmt6: '공정가액(기준가)의 90% 이상',
      midAmtAfter: '공정가액(기준가)의 95% 이상',
      subUnit: null,
      offerEnd: p.offerEnd || null,
      watchProduct: null,
      docDate: null,
      _structure: p.structureDesc || null,
      _status: p.status || null
    };
  }

  function loadEls() {
    var src = 'seed', raw = SEED_ELS, meta = null;
    if (g.ELS_DATA && g.ELS_DATA.products && g.ELS_DATA.products.length) {
      raw = g.ELS_DATA.products; src = g.ELS_DATA.source || 'live'; meta = g.ELS_DATA;
    }
    return { src: src, meta: meta, list: raw.map(normalizeEls) };
  }

  /* ==========================================================
     4. 내보내기
     ========================================================== */
  var els = loadEls();

  g.SS_DATA = {
    FIELDS: FIELDS,
    fmt: { pct: pct, pctA: pctA, kdate: kdate },
    catalog: {
      fund: FUNDS,
      els: els.list,
      bondKrw: BOND_KRW,
      bondFx: BOND_FX,
      irp: IRPS
    },
    elsSource: els.src,
    elsMeta: els.meta
  };
})(window);
