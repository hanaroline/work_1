/**
 * 완전판매 스크립트 자동완성 시스템 — 앱 로직
 *
 * 동작 흐름
 *   ① 상품군 · 시나리오 선택 + 고령 / 비고령 선택 → 평가표 확정
 *   ② 상품 선택 → 투자설명서 항목 자동 조회 (내장·수집 데이터)
 *   ③ 조회가 안 되면 : 사내 API / 투자설명서 PDF 업로드 / JSON / 필수입력 직접입력
 *   ④ 상담 조건(투자자성향 · 현재 투자자금성향 · 신규투자자 등) 입력
 *   ⑤ 평가표 순서대로 스크립트 자동 완성 — 못 채운 값은 빨간 '확인필요'
 *   ⑥ 읽기 모드로 항목별로 읽으며 Check Point 체크 → 예상 점수 실시간 산출
 *
 * 상품별 입력값은 ST.pman[productId] 에 상품 단위로 저장된다.
 */
(function () {
  'use strict';

  var D = window.SS_DATA, SHEETS = window.SS_SHEETS, BASE_SHEETS = window.SS_BASE_SHEETS;
  var PROS = window.SS_PROS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var LS = 'ss_state_v1';
  var LS_PROD = 'ss_products_v1';   /* 담당자가 등록·저장한 상품 */
  var LS_DOCS = 'ss_docs_v1';       /* 상품별로 등록된 투자설명서 */
  var LS_TXT = 'ss_commontexts_v1'; /* 전 상품 공용 문구 (핵심요약설명서 표준 문구 등) */

  /* ---------------- 상태 ---------------- */
  var ST = {
    baseSheet: 'fundFit',
    senior: true,             /* 고령투자자 여부 — 평가표 선택 차원 */
    productId: null,
    pman: {},     /* productId -> { fieldId: 값 } — 상품별 입력/수정값 */
    inline: {},   /* «라벨» -> 사용자가 입력한 값 */
    checks: {},   /* 'sheet|itemId' -> [bool,...] */
    tab: 'script',
    ctx: {
      consumerType: '일반금융소비자',
      custProfile: '',
      custProfileMeaning: '',
      cashPurpose: '', cashPrincipal: '', cashLoss: '', cashHorizon: '',
      newInvestor: false, watchOverride: null
    },
    timer: { running: false, base: 0, acc: 0 },
    pros: null   /* 최근 투자설명서 조회 결과 { cat, productId, src, name, pages, found:[], text } */
  };

  /* 담당자가 등록·저장한 상품 (localStorage) */
  var CUSTOM = { fund: [], els: [], bondKrw: [], bondFx: [], irp: [] };
  function loadCustom() {
    try {
      var o = JSON.parse(localStorage.getItem(LS_PROD) || '{}');
      Object.keys(CUSTOM).forEach(function (k) { if (Array.isArray(o[k])) CUSTOM[k] = o[k]; });
    } catch (e) { /* 손상된 저장값 무시 */ }
  }
  function saveCustom() {
    try { localStorage.setItem(LS_PROD, JSON.stringify(CUSTOM)); } catch (e) { /* 저장 불가 환경 */ }
  }

  /* ---------------- 등록된 투자설명서 ----------------
     DOCS[상품군][상품id] = {
       source        'PDF' | 'TEXT' | 'MANUAL' | 'API'
       docName       설명서 파일명·명칭
       registeredAt  등록 시각
       fields        { 필드id: 값 }          — 스크립트에 그대로 주입된다
       schedule      [{seq,months,barrier,payRate,annRate}]  — ELS·DLS 차수별 상환조건
       matBarrier    만기 배리어 %
       knockIn       KI 배리어 (없으면 '' )
       rawText       추출 원문 (PDF·텍스트 등록 시)
     }
     ---------------------------------------------------- */
  var DOCS = {};
  function loadDocs() {
    try {
      var o = JSON.parse(localStorage.getItem(LS_DOCS) || '{}');
      if (o && typeof o === 'object') DOCS = o;
    } catch (e) { DOCS = {}; }
  }
  function saveDocs() {
    try { localStorage.setItem(LS_DOCS, JSON.stringify(DOCS)); } catch (e) { /* 저장 불가 환경 */ }
  }
  /**
   * 현재 선택 상품에 등록된 투자설명서.
   * 담당자가 등록한 것이 없으면, 수집기(scripts/collect_els_prospectus.mjs)가
   * 만든 data/els-prospectus.js 의 결과를 등록된 설명서로 간주한다.
   */
  function doc() {
    var cat = sheet().cat, pid = ST.productId;
    var mine = (DOCS[cat] && DOCS[cat][pid]) || null;
    if (mine) return mine;
    if (cat === 'fund') return fundCollectedDoc();
    if (cat !== 'els') return null;
    var P = window.ELS_PROSPECTUS;
    if (!P || !P.byRound) return null;
    /* 공시 원문에는 ISIN 이 없어 회차 번호가 유일한 연결키다.
       상품코드 인덱스를 먼저 보고, 없으면 상품명에서 회차를 뽑는다. */
    var no = P.codeToRound && P.codeToRound[pid];
    if (no == null) {
      var p0 = product();
      no = p0 && (String(p0.name).match(/(\d{4,6})/) || [])[1];
    }
    var col = no != null ? P.byRound[no] : null;
    if (!col) return null;
    var ki = col.fields && col.fields.knockIn;
    return {
      source: 'COLLECT',
      docName: col.name ? col.name + ' 투자설명서' : '자동수집',
      docUrl: col.docUrl || '',
      registeredAt: col.collectedAt || (window.ELS_PROSPECTUS.updatedAt || ''),
      fields: col.fields || {},
      schedule: col.schedule || [],
      matBarrier: col.matBarrier != null ? col.matBarrier : null,
      /* 손익구조 문구는 원금지급형·월지급식 여부에 따라 완전히 달라진다 — 반드시 실어 보낸다 */
      instrument: col.instrument || null,
      principalProtected: !!col.principalProtected,
      monthlyIncome: col.monthlyIncome || null,
      knockIn: ki && !/없음|노낙인|해당 없음/.test(String(ki)) ? String(ki).replace(/[^0-9.]/g, '') : '',
      rawText: '',
      collected: true
    };
  }
  /**
   * 펀드 자동수집분 — data/fund-prospectus.js 는 펀드 명칭 키다.
   * 명칭 표기가 조금씩 달라 공백·괄호를 지운 뒤 부분일치로 찾는다.
   */
  function fundCollectedByName(name) {
    var F = window.FUND_PROSPECTUS;
    if (!F || !F.items || !name) return null;
    var norm = function (x) { return String(x).replace(/[\s()\[\]·\-]/g, ''); };
    var target = norm(name);
    var keys = Object.keys(F.items);
    var hit = null;
    for (var i = 0; i < keys.length; i++) {
      var k = norm(keys[i]);
      if (k === target) return F.items[keys[i]];
      if (!hit && (k.indexOf(target) >= 0 || target.indexOf(k) >= 0)) hit = F.items[keys[i]];
    }
    return hit;
  }
  function fundCollectedDoc() {
    var p = product();
    var hit = p ? fundCollectedByName(p.name) : null;
    if (!hit) return null;
    return {
      source: 'COLLECT',
      docName: (hit.fields && hit.fields.name) || hit.key,
      docUrl: hit.docUrl || '',
      /* F 는 fundCollectedByName 안의 지역변수였다 — 여기서 쓰면 ReferenceError 로 죽는다 */
      registeredAt: hit.collectedAt || (window.FUND_PROSPECTUS && window.FUND_PROSPECTUS.updatedAt) || '',
      fields: hit.fields || {},
      schedule: [], matBarrier: null, knockIn: '', rawText: '',
      collected: true
    };
  }

  function setDoc(d) {
    var cat = sheet().cat, pid = ST.productId;
    if (!pid) return;
    if (!DOCS[cat]) DOCS[cat] = {};
    if (d) DOCS[cat][pid] = d; else delete DOCS[cat][pid];
    saveDocs();
  }
  /** 등록된 설명서에서 만든 ELS 손익구조 문구 (캐시 없이 매번 계산 — 표가 작다) */
  function elsTexts() {
    var d = doc();
    if (!d || sheet().cat !== 'els') return null;
    if (!d.schedule || !d.schedule.length) return null;
    return PROS.buildElsTexts({
      schedule: d.schedule, knockIn: d.knockIn, matBarrier: d.matBarrier,
      /* 원금지급형(파생결합사채)은 손실조건 문구가 완전히 달라진다 — 반드시 넘긴다 */
      principalProtected: d.principalProtected,
      monthlyNote: d.fields && d.fields.monthlyNote
    });
  }

  function sheetKey() { return ST.baseSheet + (ST.senior ? '_senior' : '_general'); }

  /* ---------------- 전 상품 공용 문구 ----------------
     위험등급별 유의사항처럼 상품이 아니라 '판매회사 핵심(요약)설명서' 에서 오는
     문구다. 상품마다 다시 입력할 필요가 없으므로 등급별로 한 번만 등록해 두고
     모든 상품에서 재사용한다.
     seed 값은 업로드된 평가표의 「탁월사례」 원문에서 확인된 것만 넣는다.
     ---------------------------------------------------- */
  /**
   * 등급별 기본 문구.
   *   riskNote2 / riskNote5 는 업로드된 평가표 「탁월사례」 원문에서 확인된 문구다.
   *   나머지 등급은 ELS/DLS 투자설명서의 「목표시장 분석표」 가 밝히는 위험추구성향 구분
   *   (위험선호형=1·2·3등급 / 위험중립형=4등급 / 위험회피형=5·6등급) 에 맞춰 같은 성향
   *   그룹의 문구를 기본값으로 둔 것이다. 사내 핵심(요약)설명서 문구가 따로 있으면
   *   「공통문구」 탭에서 덮어쓰십시오.
   *   ELS/DLS 는 투자설명서가 등록되면 회차별 원문 문구가 이 기본값보다 우선한다.
   */
  var RISK_APPETITE_TEXT = {
    like: '위험선호도가 높은 투자자를 위한 상품으로서, 시장평균 수익률을 훨씬 넘어서는 높은 수준의 투자수익을 추구하며, 이를 위해 자산가치 변동에 따른 손실위험을 적극 수용할 수 있는 투자자에게 적합한 상품입니다.',
    neutral: '투자에는 그에 상응하는 투자위험이 있음을 인식하고 있으며, 예금·적금보다 높은 수익을 기대할 수 있다면 일정 수준의 손실위험을 감수할 수 있는 투자자에게 적합한 상품입니다.',
    avoid: '투자원금의 손실위험은 최소화하고, 이자소득이나 배당소득 수준의 안정적인 투자를 목표로 하는 투자자에게 적합한 상품입니다.',
    avoidHard: '예금 또는 적금 수준의 수익률을 기대하며, 투자원금에 손실이 발생하는 것을 원하지 않는 투자자에게 적합한 상품입니다.'
  };
  var COMMON_SEED = {
    riskNote1: RISK_APPETITE_TEXT.like,
    riskNote2: RISK_APPETITE_TEXT.like,
    riskNote3: RISK_APPETITE_TEXT.like,
    riskNote4: RISK_APPETITE_TEXT.neutral,
    riskNote5: RISK_APPETITE_TEXT.avoid,
    riskNote6: RISK_APPETITE_TEXT.avoidHard,
    withdrawRight: '불가'
  };
  var COMMON = {};
  function loadCommon() {
    try {
      var o = JSON.parse(localStorage.getItem(LS_TXT) || '{}');
      COMMON = Object.assign({}, COMMON_SEED, (o && typeof o === 'object') ? o : {});
    } catch (e) { COMMON = Object.assign({}, COMMON_SEED); }
  }
  function saveCommon() {
    try { localStorage.setItem(LS_TXT, JSON.stringify(COMMON)); } catch (e) { /* 저장 불가 환경 */ }
  }
  var COMMON_DEFS = [
    { id: 'riskNote1', label: '1등급 매우높은위험 — 유의사항', hint: 'ELS/DLS 는 투자설명서 「목표시장」 원문 문구가 우선 적용됩니다. 이 값은 투자설명서가 없을 때 쓰는 기본값(위험선호형)입니다' },
    { id: 'riskNote2', label: '2등급 높은위험 — 유의사항', hint: '평가표 탁월사례에서 확인된 문구가 기본값으로 들어가 있습니다' },
    { id: 'riskNote3', label: '3등급 다소높은위험 — 유의사항', hint: '위험선호형(1·2·3등급) 기본 문구 — 사내 핵심(요약)설명서 문구가 있으면 덮어쓰세요' },
    { id: 'riskNote4', label: '4등급 보통위험 — 유의사항', hint: '위험중립형(4등급) 기본 문구 — 사내 핵심(요약)설명서 문구가 있으면 덮어쓰세요' },
    { id: 'riskNote5', label: '5등급 낮은위험 — 유의사항', hint: '채권 평가표 탁월사례에서 확인된 문구가 기본값으로 들어가 있습니다' },
    { id: 'riskNote6', label: '6등급 매우낮은위험 — 유의사항', hint: '위험회피형(5·6등급) 중 안정형 기본 문구 — 사내 핵심(요약)설명서 문구가 있으면 덮어쓰세요' },
    { id: 'riskGradeBasis', label: '위험등급 분류 근거 (채권)', hint: '예) 국내 신용평가사 회사채 신용등급 AA-~AAA 를 5등급 낮은위험으로 분류' },
    { id: 'withdrawRight', label: '청약철회권 대상여부', hint: '평가표 탁월사례는 모두 「불가」 — 상품별 판단이 다르면 수정하세요' }
  ];

  /** 조회 결과는 조회 당시의 상품군·상품에만 유효하다 */
  function pros() {
    var r = ST.pros;
    if (!r) return null;
    if (r.cat !== sheet().cat || r.productId !== ST.productId) return null;
    return r;
  }

  var PROFILES = {
    '공격투자형': '투자원금의 보전보다는 위험을 감내하더라도 높은 수준의 투자수익 실현을 추구하는 타입입니다. 따라서 투자자금 대부분을 주식·주식형 펀드 또는 파생상품 등 위험자산에 투자하는 고객 유형입니다.',
    '적극투자형': '투자원금의 보전보다는 투자수익을 추구하는 타입입니다. 따라서 투자자금의 상당 부분을 주식·주식형 펀드 등 위험자산에 투자하는 고객 유형입니다.',
    '성장추구형': '투자원금을 보전하는 것보다는 투자수익을 추구하는 타입입니다. 따라서 투자자금의 상당 부분을 주식·주식형 펀드 등에 투자하는 고객 유형입니다.',
    '위험중립형': '투자에 상응하는 투자위험이 있음을 충분히 인식하고 있으며, 예·적금보다 높은 수익을 기대할 수 있다면 일정 수준의 손실위험을 감수할 수 있는 고객 유형입니다.',
    '안정추구형': '투자원금의 손실위험은 최소화하고 이자소득이나 배당소득 수준의 안정적인 투자를 목표로 하는 타입입니다. 다만 수익을 위해 단기적인 손실을 수용할 수 있는 고객 유형입니다.',
    '안정형': '예금 또는 적금 수준의 수익률을 기대하며, 투자원금에 손실이 발생하는 것을 원하지 않는 고객 유형입니다.'
  };
  var CASH_OPTS = {
    cashPurpose: ['원금보존', '이자·배당수익 추구', '시장수익률 수준 추구', '적극적 수익 추구'],
    cashPrincipal: ['원금 반드시 보존', '원금 대부분 보존', '일부 손실 감수 가능', '원금보존 추구하지 않음'],
    cashLoss: ['손실 감내 불가', '10% 이내', '20% 이내', '20% 초과 감내 가능'],
    cashHorizon: ['6개월 이내', '6개월~1년', '1년~3년', '3년 이상']
  };

  /* ---------------- 저장 / 복원 ---------------- */
  function save() {
    try {
      localStorage.setItem(LS, JSON.stringify({
        baseSheet: ST.baseSheet, senior: ST.senior, productId: ST.productId,
        pman: ST.pman, inline: ST.inline, checks: ST.checks, ctx: ST.ctx
      }));
    } catch (e) { /* 사생활 보호 모드 등에서 저장 실패 — 무시 */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o.baseSheet && BASE_SHEETS[o.baseSheet]) ST.baseSheet = o.baseSheet;
      if (typeof o.senior === 'boolean') ST.senior = o.senior;
      if (o.productId) ST.productId = o.productId;
      ['pman', 'inline', 'checks'].forEach(function (k) { if (o[k]) ST[k] = o[k]; });
      /* 구버전(상품 구분 없는 manual) 저장값 이관 */
      if (o.manual && o.productId) {
        ST.pman[o.productId] = Object.assign({}, o.manual, ST.pman[o.productId] || {});
      }
      if (o.ctx) Object.keys(o.ctx).forEach(function (k) { ST.ctx[k] = o.ctx[k]; });
    } catch (e) { /* 손상된 저장값 — 초기값 사용 */ }
  }

  /* ---------------- 유틸 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function sheet() { return SHEETS[sheetKey()]; }
  /**
   * 평가표에 맞는 상품만 노출한다. 담당자가 등록한 상품이 앞에 온다.
   * 펀드 평가표는 국내/해외가 별도 표(해외는 투자위험이 일반+해외로 분리)이므로
   * 해외투자 펀드는 해외 평가표에서만, 국내 펀드는 국내 평가표에서만 선택되게 한다.
   */
  function catalog() {
    var sh = sheet();
    var list = (CUSTOM[sh.cat] || []).concat(D.catalog[sh.cat] || []);
    if (sh.cat !== 'fund') return list;
    var want = !!sh.overseas;
    var f = list.filter(function (p) { return !!p.overseas === want; });
    return f.length ? f : list;
  }
  function product() {
    var l = catalog();
    for (var i = 0; i < l.length; i++) if (l[i].id === ST.productId) return l[i];
    return null;
  }
  function fieldDefs() {
    return D.FIELDS.common.concat(D.FIELDS[sheet().cat] || []);
  }

  /* ---------------- 필드값 해석 ---------------- */
  var DATE_KEYS = /Date$|^offerEnd$|^fixDate$/;

  /** 현재 선택 상품의 입력값 사전 */
  function man() {
    var pid = ST.productId || '_';
    if (!ST.pman[pid]) ST.pman[pid] = {};
    return ST.pman[pid];
  }
  function isManual(id) {
    var m = man();
    return Object.prototype.hasOwnProperty.call(m, id) && m[id] !== '';
  }
  function setManual(id, v) {
    var m = man();
    if (v === '' || v == null) delete m[id]; else m[id] = v;
  }

  function rawValue(id) {
    if (isManual(id)) return man()[id];
    if (Object.prototype.hasOwnProperty.call(ST.ctx, id)) {
      var c = ST.ctx[id];
      return (c === '' || c == null) ? null : c;
    }
    /* 등록된 투자설명서가 상품 기본데이터보다 우선한다 */
    var d = doc();
    if (d && d.fields && d.fields[id] != null && d.fields[id] !== '') return d.fields[id];
    var p = product();
    if (p && p[id] != null && p[id] !== '') {
      var v = p[id];
      if (DATE_KEYS.test(id) && typeof v === 'string') return D.fmt.kdate(v) || v;
      return v;
    }
    return null;
  }

  /** 스크립트 전용 파생값 (평가표·시나리오·고객조건에서 계산) */
  function derived(id) {
    var sh = sheet(), p = product(), ctx = ST.ctx;
    switch (id) {
      case 'consumerType':
        return ctx.consumerType || null;
      case 'recordReason': {
        var r = [];
        if (sh.senior) r.push('고령투자자');
        if (sh.scenario === 'unfit') r.push('부적합 투자자');
        if (sh.cat === 'els' && p && /해당 \(/.test(String(p.highDiff || ''))) r.push('고난도 금융투자상품 가입 고객');
        return r.length ? r.join(' 또는 ') : '금융투자상품을 가입하고자 하는 고객';
      }
      case 'unfitRecordAdd':
        return sh.scenario === 'unfit' ? '이거나 부적합 투자자의 경우' : '';
      case 'docLabel':
        return sh.cat === 'bondFx' ? '외화채권설명서' : (sh.cat === 'bondKrw' ? '장외채권설명서' : null);
      case 'docExtra':
        return sh.cat === 'bondKrw' ? '국내채권 장외거래 투자권유 추가 설명자료' : '외화채권 관련 추가 설명자료';
      case 'tradeLabel':
        return sh.cat === 'bondFx' ? '외화채권' : '장외채권';
      /**
       * 위험등급별 유의사항.
       * 등록된 투자설명서에 이 회차의 문구가 있으면 그것이 우선이다 — ELS/DLS 투자설명서의
       * 「목표시장 설정 및 설정 근거」 표에서 뽑은 원문 근거라, 사내 공용 문구보다 이 상품에
       * 정확하다. 투자설명서가 없거나 그 항목이 비어 있을 때만 등급별 공용 문구로 내려간다.
       */
      case 'riskGradeNote': {
        var dn = doc();
        if (dn && dn.fields && dn.fields.riskGradeNote) return undefined; /* rawValue 가 읽는다 */
        var g = rawValue('riskGrade');
        var t2 = g ? COMMON['riskNote' + String(g).replace(/[^0-9]/g, '')] : null;
        return (t2 == null || t2 === '') ? undefined : t2;
      }
      case 'riskGradeBasis':
        return COMMON.riskGradeBasis || undefined;
      /**
       * 선취판매수수료 계산 예시 — 「이해를 돕기 위한 추가 설명」 가점 항목(+3점).
       * 선취수수료율만 알면 산술로 확정되는 값이라 직원이 계산기를 두드릴 필요가 없다.
       * 기준 금액은 투자설명서가 예시로 쓰는 1,000만원에 맞춘다.
       */
      case 'feeRate': case 'exAmt': case 'feeCut': case 'netAmt': {
        var fa = String(valueOf('clsA') || '');
        var pm = fa.match(/(\d+(?:\.\d+)?)\s*%/);
        if (!pm) return undefined;
        var rate = Number(pm[1]), base = 10000000;
        var cut = Math.round(base * rate / 100);
        /* 문장이 "그 «율» 인 «금액»" 으로 이어지므로 율만 담는다 (납입금액의 … 은 앞 문장에 있다) */
        if (id === 'feeRate') return pm[1] + '%';
        if (id === 'exAmt') return '1,000만원';
        if (id === 'feeCut') return (cut / 10000).toLocaleString() + '만원';
        return ((base - cut) / 10000).toLocaleString() + '만원';
      }
      /* 초과수익률 = 최근 1년 수익률 − 동종유형 평균 수익률 (뺄셈이라 받아쓸 값이 아니다) */
      case 'retGap': {
        var n1 = parseFloat(String(valueOf('ret1y') || '').replace(/[^0-9.\-]/g, ''));
        var n2 = parseFloat(String(valueOf('retPeer') || '').replace(/[^0-9.\-]/g, ''));
        if (!isFinite(n1) || !isFinite(n2)) return undefined;
        return (Math.round((n1 - n2) * 100) / 100) + '%p';
      }
      /**
       * 유사 비계열 펀드 동반 추천은 「계열사 상품을 권유할 때」의 의무다.
       * 비계열 운용사 상품이면 해당 사항이 없으므로 빨간 확인필요로 남길 값이 아니다.
       */
      case 'peerFund': case 'peerRet1y': {
        var af = String(rawValue('affiliate') || '');
        if (!/비계열/.test(af)) return undefined;
        return id === 'peerFund'
          ? '해당 없음 (비계열 운용사 상품이므로 유사 비계열 펀드 동반 추천 의무 없음)'
          : '해당 없음';
      }
      case 'withdrawRight':
        return COMMON.withdrawRight || undefined;
      /* 등록된 투자설명서의 차수별 상환조건 표로 손익구조 문구를 생성한다 */
      case 'earlyTable': case 'matCond': case 'coupon':
      case 'knockIn': case 'earlyCycle': case 'matTerm': case 'payoffExample': {
        var t = elsTexts();
        if (!t) return undefined;
        var v = t[id];
        return (v == null || v === '') ? undefined : v;
      }
      default:
        return undefined;
    }
  }

  function valueOf(id) {
    var d = derived(id);
    if (d !== undefined) {
      /* 파생값도 사용자가 덮어쓸 수 있게 한다 */
      if (isManual(id)) return man()[id];
      return d === '' ? '' : d;
    }
    return rawValue(id);
  }

  function labelOf(id) {
    var defs = fieldDefs();
    for (var i = 0; i < defs.length; i++) if (defs[i].id === id) return defs[i].label;
    return {
      consumerType: '일반/전문금융소비자', recordReason: '녹취 대상 사유', unfitRecordAdd: '부적합 문구',
      docLabel: '설명서 명칭', docExtra: '추가 설명자료', tradeLabel: '거래 유형',
      payoffExample: '상환 예시 (차수별 표에서 자동 생성)', earlyTable: '자동조기상환 조건·수익률',
      matCond: '만기상환 조건·수익률', riskGradeNote: '위험등급 유의사항',
      /* 공통문구 탭에서 한 번만 등록하는 값들 — 상품별 FIELDS 에는 없다.
         라벨이 없으면 확인필요 목록에 'riskGradeBasis' 처럼 내부 id 가 그대로 뜬다. */
      riskGradeBasis: '위험등급 분류 근거 (공통 문구)',
      ytm: '세후 투자수익률',
      monthlyNote: '월수익지급 조건·지급률 (월지급식)',
      feeRate: '선취판매수수료율', exAmt: '예시 투자금액', feeCut: '선취수수료 차감금액',
      netAmt: '실제 투자금액', retGap: '초과수익률(%p)', peerRet1y: '비계열 펀드 1년 수익률',
      withdrawRight: '청약철회권 대상여부'
    }[id] || id;
  }

  /* ---------------- 템플릿 렌더링 ---------------- */
  var missCache = [];

  /**
   * {{fieldId}} → 값 스팬 (없으면 빨간 확인필요)
   * «라벨»      → 투자설명서 원문에서 직접 옮겨야 하는 값
   */
  function tpl(text) {
    var out = esc(text);
    out = out.replace(/\{\{(\w+)\}\}/g, function (_, id) {
      var v = valueOf(id);
      if (v === '' && derived(id) !== undefined) return ''; /* 시나리오상 비어야 하는 문구 */
      if (v == null || v === '') {
        missCache.push({ kind: 'field', key: id, label: labelOf(id) });
        return '<span class="v miss" data-kind="field" data-key="' + esc(id) + '">' + esc(labelOf(id)) + '</span>';
      }
      return '<span class="v" data-kind="field" data-key="' + esc(id) + '">' + esc(v) + '</span>';
    });
    out = out.replace(/«([^«»]{1,80})»/g, function (_, label) {
      var v = ST.inline[label];
      if (v == null || v === '') {
        missCache.push({ kind: 'inline', key: label, label: label });
        return '<span class="v miss" data-kind="inline" data-key="' + esc(label) + '">' + esc(label) + '</span>';
      }
      return '<span class="v" data-kind="inline" data-key="' + esc(label) + '">' + esc(v) + '</span>';
    });
    return out;
  }

  /* ---------------- 항목 적용 여부 · 점수 ---------------- */
  /** 고난도 금융투자상품은 고령투자자에게 '투자 유의상품' 으로 지정된다 */
  function isWatchProduct() {
    if (ST.ctx.watchOverride !== null && ST.ctx.watchOverride !== undefined) return !!ST.ctx.watchOverride;
    var sh = sheet(), p = product();
    return !!(sh.senior && sh.cat === 'els' && p && /해당 \(/.test(String(p.highDiff || '')));
  }
  function applicable(item) {
    var sh = sheet(), p = product(), ctx = ST.ctx;
    switch (item.only) {
      case 'elderly': return !!sh.senior;
      case 'overseas': return !!(sh.overseas || (p && p.overseas));
      /* 적합성보고서 대상 : (성향에 적합한) 고령투자자 또는 신규투자자 */
      case 'suitReport': return !!(sh.senior || ctx.newInvestor);
      case 'watch': return isWatchProduct();
      default: return true;
    }
  }
  function ckey(item) { return sheetKey() + '|' + item.id; }
  function checksOf(item) {
    var k = ckey(item), n = item.cps.length;
    if (!ST.checks[k] || ST.checks[k].length !== n) ST.checks[k] = new Array(n).fill(false);
    return ST.checks[k];
  }
  function scoreOf(item) {
    if (!applicable(item)) return 0;
    var c = checksOf(item).filter(Boolean).length;
    var s = item.score;
    return s[Math.min(c, s.length - 1)];
  }
  function itemsOf() { return sheet().items; }

  function totals() {
    var sh = sheet(), base = 0, plus = 0, minus = 0, baseMax = 0, plusMax = 0, done = 0, all = 0;
    var bySec = {};
    itemsOf().forEach(function (x) {
      var app = applicable(x), sc = scoreOf(x);
      if (app) {
        all += x.cps.length;
        done += checksOf(x).filter(Boolean).length;
      }
      if (x.plus) { plus += sc; plusMax += x.max; }
      else if (x.max < 0) { minus += sc; }
      else {
        base += sc; baseMax += x.max;
        bySec[x.sec] = bySec[x.sec] || { got: 0, max: 0 };
        bySec[x.sec].got += sc; bySec[x.sec].max += x.max;
      }
    });
    return { base: base, plus: plus, minus: minus, baseMax: baseMax, plusMax: plusMax, total: base + plus + minus, bySec: bySec, done: done, all: all };
  }

  /** 스크립트에 남아있는 '확인필요' 목록 (중복 제거) */
  function missing() {
    missCache = [];
    itemsOf().forEach(function (x) {
      if (!applicable(x)) return;
      (x.script || []).forEach(function (s) { tpl(s.x); });
    });
    var seen = {}, out = [];
    missCache.forEach(function (m) {
      var k = m.kind + '|' + m.key;
      if (seen[k]) return; seen[k] = 1; out.push(m);
    });
    return out;
  }

  /* ============================================================
     사이드바
     ============================================================ */
  function renderSide() {
    var sh = sheet(), p = product(), ctx = ST.ctx;
    var h = [];

    h.push('<div class="fgroup"><div class="flabel"><span class="req">1</span> 상품군 · 시나리오</div>');
    h.push('<select id="selSheet">');
    Object.keys(BASE_SHEETS).forEach(function (k) {
      h.push('<option value="' + k + '"' + (k === ST.baseSheet ? ' selected' : '') + '>' + esc(BASE_SHEETS[k].label) + '</option>');
    });
    h.push('</select><div class="hint">' + esc(sh.note) + '</div></div>');

    /* 고령 / 비고령 — 평가표가 갈리는 축이므로 별도 선택으로 노출한다 */
    h.push('<div class="fgroup"><div class="flabel"><span class="req">2</span> 고령 / 비고령</div><div class="seg" id="segSenior">');
    h.push('<button data-v="1" aria-pressed="' + (ST.senior === true) + '">고령투자자</button>');
    h.push('<button data-v="0" aria-pressed="' + (ST.senior === false) + '">비고령투자자</button>');
    h.push('</div>');
    h.push('<div class="hint"><span class="src ' + (sh.provenance === 'exact' ? 'auto' : 'man') + '">'
      + (sh.provenance === 'exact' ? '원표' : '보완') + '</span> ' + esc(sh.provenanceNote) + '</div>');
    h.push('<div class="hint">현재 적용 : <b>' + esc(sh.label) + '</b> · ' + sh.items.length + '항목</div></div>');

    /* 상품 선택 */
    h.push('<div class="fgroup"><div class="flabel"><span class="req">3</span> 상품 선택 <span style="font-weight:400;color:var(--muted2)">(투자설명서 자동조회)</span></div>');
    h.push('<input type="text" id="pq" placeholder="상품명 · 코드 · 기초자산 검색" value="">');
    h.push('<select id="selProduct" size="8" style="margin-top:6px"></select>');
    h.push('<div style="display:flex;gap:6px;margin-top:6px"><button class="tbtn" id="btnNewProduct" style="flex:1">새 상품 등록</button>'
      + '<button class="tbtn" id="btnDelProduct" style="flex:1"' + (p && p.custom ? '' : ' disabled') + '>등록상품 삭제</button></div>');
    h.push('<div class="hint">\u25CF 투자설명서 등록됨 · \u25CB 미등록</div>');
    if (sh.cat === 'els') {
      var live = D.elsSource === 'live';
      h.push('<div class="hint">ELS/DLS 목록 <span class="badge ' + (live ? 'live' : 'sample') + '">' + (live ? '자동수집' : '내장 시드') + '</span> · ' + catalog().length + '건'
        + (D.elsMeta && D.elsMeta.updatedAt ? '<br>기준 ' + esc(String(D.elsMeta.updatedAt).slice(0, 10)) : '') + '</div>');
    } else {
      h.push('<div class="hint">내장 데이터는 <b>예시</b>입니다. 상담 전 투자설명서 원문 값으로 교체하세요.</div>');
    }
    h.push('</div>');

    /* 상담 조건 */
    h.push('<div class="rule"></div><div class="flabel" style="margin-bottom:12px"><span class="req">4</span> 상담 조건</div>');

    h.push('<div class="fgroup"><div class="flabel">투자자성향 진단 결과</div><select id="selProfile"><option value="">— 선택 —</option>');
    Object.keys(PROFILES).forEach(function (k) {
      h.push('<option value="' + k + '"' + (ctx.custProfile === k ? ' selected' : '') + '>' + k + '</option>');
    });
    h.push('</select><div class="hint">선택하면 성향의 의미 설명문이 자동 입력됩니다 (수정 가능).</div></div>');

    h.push('<div class="fgroup"><div class="flabel">일반 / 전문금융소비자</div><div class="seg" id="segConsumer">');
    ['일반금융소비자', '전문금융소비자'].forEach(function (v) {
      h.push('<button data-v="' + v + '" aria-pressed="' + (ctx.consumerType === v) + '">' + v + '</button>');
    });
    h.push('</div></div>');

    h.push('<div class="fgroup"><div class="flabel">현재 투자자금성향 (4항목)</div>');
    [['cashPurpose', '투자목적'], ['cashPrincipal', '원금보존태도'], ['cashLoss', '손실감내수준'], ['cashHorizon', '투자예정기간']].forEach(function (pair) {
      h.push('<div style="margin-bottom:6px"><div style="font-size:12px;color:var(--muted);margin-bottom:2px">' + pair[1] + '</div>');
      h.push('<select class="cashSel" data-k="' + pair[0] + '"><option value="">— 선택 —</option>');
      CASH_OPTS[pair[0]].forEach(function (o) {
        h.push('<option value="' + esc(o) + '"' + (ctx[pair[0]] === o ? ' selected' : '') + '>' + esc(o) + '</option>');
      });
      h.push('</select></div>');
    });
    h.push('</div>');

    h.push('<div class="fgroup"><div class="flabel">고객 구분</div>');
    h.push('<label class="chk"><input type="checkbox" class="ctxChk" data-k="newInvestor"' + (ctx.newInvestor ? ' checked' : '') + '><span>신규투자자</span></label>');
    h.push('<div class="hint" style="margin:2px 0 8px">신규투자자면 비고령이라도 적합성보고서 발급·교부가 평가 대상입니다.</div>');
    h.push('<div style="font-size:12px;color:var(--muted);margin-bottom:2px">투자권유 유의상품 해당</div>');
    h.push('<div class="seg" id="segWatch">');
    [['', '자동판정'], ['1', '해당'], ['0', '미해당']].forEach(function (o) {
      var cur = ctx.watchOverride === null || ctx.watchOverride === undefined ? '' : (ctx.watchOverride ? '1' : '0');
      h.push('<button data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>');
    });
    h.push('</div>');
    h.push('<div class="hint">자동판정 : 고령 + 고난도 파생결합증권이면 「투자 유의상품」으로 지정되어 관리직 직원 사전확인이 평가에 포함됩니다. 현재 판정 <b>'
      + (isWatchProduct() ? '해당' : '미해당') + '</b></div></div>');

    h.push('<div class="rule"></div>');
    h.push('<button class="tbtn" id="btnResetChecks" style="width:100%;margin-bottom:8px">체크 초기화</button>');
    h.push('<button class="tbtn" id="btnResetAll" style="width:100%">전체 초기화</button>');
    h.push('<div class="sidenote">이 화면의 스크립트는 <b>미스터리쇼핑 평가표</b>를 코드화한 것입니다. 숫자·일자·요율 등은 반드시 <b>해당 상품의 투자설명서 원문</b>과 대조하십시오. 부정확한 설명은 부당권유행위(최대 −18점)로 감점됩니다.</div>');

    $('#side').innerHTML = h.join('');
    fillProducts('');
    bindSide();
  }

  /** 새 상품 등록 — 명칭만 받고, 나머지는 필수입력 탭에서 채운다 */
  function newProduct() {
    var sh = sheet();
    var nm = prompt('새로 등록할 ' + sh.groupLabel.split(' · ')[0] + ' 상품의 명칭을 입력하세요.\n(나머지 항목은 「필수입력」 탭 또는 투자설명서 조회로 채웁니다)', '');
    if (nm == null) return;
    nm = nm.trim();
    if (!nm) return;
    var id = 'U' + Date.now().toString(36).toUpperCase();
    var p = { id: id, name: nm, custom: true, sample: false };
    if (sh.cat === 'fund') p.overseas = !!sh.overseas;
    CUSTOM[sh.cat] = CUSTOM[sh.cat] || [];
    CUSTOM[sh.cat].unshift(p);
    saveCustom();
    ST.productId = id;
    ST.tab = 'reg';
    save(); renderAll();
  }

  function fillProducts(q) {
    var sel = $('#selProduct');
    if (!sel) return;
    q = (q || '').trim().toLowerCase();
    var list = catalog().filter(function (p) {
      if (!q) return true;
      return [p.name, p.id, p.issuer, p.mgr, p.under, p.kind, p.credit].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    var cat = sheet().cat, docs = DOCS[cat] || {};
    var P = window.ELS_PROSPECTUS;
    /** 담당자 등록분 또는 자동수집분이 있으면 등록된 것으로 표시한다 */
    var hasDoc = function (p) {
      if (docs[p.id]) return true;
      if (cat === 'fund') return !!fundCollectedByName(p.name);
      if (cat !== 'els' || !P || !P.byRound) return false;
      var no = (P.codeToRound && P.codeToRound[p.id]) != null
        ? P.codeToRound[p.id]
        : (String(p.name).match(/(\d{4,6})/) || [])[1];
      return !!(no != null && P.byRound[no]);
    };
    sel.innerHTML = list.map(function (p) {
      var tail = p.riskGrade ? ' · ' + p.riskGrade + '등급' : '';
      var mark = hasDoc(p) ? '\u25CF ' : '\u25CB ';   /* 설명서 등록 여부 */
      return '<option value="' + esc(p.id) + '"' + (p.id === ST.productId ? ' selected' : '') + '>' + mark + esc(p.name) + tail + '</option>';
    }).join('') || '<option disabled>검색 결과 없음</option>';
  }

  function bindSide() {
    function afterSheetChange() {
      ST.pros = null;
      var l = catalog();
      if (!l.some(function (p) { return p.id === ST.productId; })) ST.productId = l.length ? l[0].id : null;
      save(); renderAll();
    }
    $('#selSheet').onchange = function () { ST.baseSheet = this.value; afterSheetChange(); };
    Array.prototype.forEach.call(document.querySelectorAll('#segSenior button'), function (b) {
      b.onclick = function () { ST.senior = b.dataset.v === '1'; afterSheetChange(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#segWatch button'), function (b) {
      b.onclick = function () {
        ST.ctx.watchOverride = b.dataset.v === '' ? null : b.dataset.v === '1';
        save(); renderAll();
      };
    });
    $('#btnNewProduct').onclick = newProduct;
    $('#btnDelProduct').onclick = function () {
      var p = product();
      if (!p || !p.custom) return;
      if (!confirm('등록상품 「' + p.name + '」 을 삭제합니다. 계속하시겠습니까?')) return;
      var cat = sheet().cat;
      CUSTOM[cat] = CUSTOM[cat].filter(function (x) { return x.id !== p.id; });
      saveCustom();
      if (DOCS[cat]) { delete DOCS[cat][p.id]; saveDocs(); }
      delete ST.pman[p.id];
      var l = catalog();
      ST.productId = l.length ? l[0].id : null;
      save(); renderAll();
    };
    $('#pq').oninput = function () { fillProducts(this.value); };
    $('#selProduct').onchange = function () { ST.productId = this.value; ST.pros = null; save(); renderAll(); };
    $('#selProfile').onchange = function () {
      ST.ctx.custProfile = this.value;
      if (this.value && !isManual('custProfileMeaning')) ST.ctx.custProfileMeaning = PROFILES[this.value] || '';
      save(); renderAll();
    };
    Array.prototype.forEach.call(document.querySelectorAll('#segConsumer button'), function (b) {
      b.onclick = function () { ST.ctx.consumerType = b.dataset.v; save(); renderAll(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.cashSel'), function (s) {
      s.onchange = function () { ST.ctx[s.dataset.k] = s.value; save(); renderAll(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.ctxChk'), function (c) {
      c.onchange = function () { ST.ctx[c.dataset.k] = c.checked; save(); renderAll(); };
    });
    $('#btnResetChecks').onclick = function () {
      var pref = sheetKey() + '|';
      Object.keys(ST.checks).forEach(function (k) { if (k.indexOf(pref) === 0) delete ST.checks[k]; });
      save(); renderAll();
    };
    $('#btnResetAll').onclick = function () {
      if (!confirm('입력값 · 체크 · 확인필요 값을 모두 초기화합니다. 계속하시겠습니까?')) return;
      ST.pman = {}; ST.inline = {}; ST.checks = {}; DOCS = {}; saveDocs();
      ST.ctx = { consumerType: '일반금융소비자', custProfile: '', custProfileMeaning: '', cashPurpose: '', cashPrincipal: '', cashLoss: '', cashHorizon: '', newInvestor: false, watchOverride: null };
      ST.pros = null;
      save(); renderAll();
    };
  }

  /* ============================================================
     탭
     ============================================================ */
  function renderTabs() {
    var t = totals(), miss = missing(), rq = reqStatus();
    var defs = [
      ['script', '스크립트', itemsOf().length + '항목'],
      ['reg', '투자설명서 등록', doc() ? '등록됨 · ' + docCoverage().pct + '%' : '미등록'],
      ['req', '필수입력', rq.missing ? rq.missing + '건 미입력' : '완료'],
      ['check', '체크리스트 · 셀프채점', t.done + '/' + t.all],
      ['rule', '평가기준 요약', miss.length ? '확인필요 ' + miss.length : '']
    ];
    $('#tabs').innerHTML = defs.map(function (d) {
      return '<button data-t="' + d[0] + '" aria-selected="' + (ST.tab === d[0]) + '">' + d[1] +
        (d[2] ? '<span class="cnt">' + esc(d[2]) + '</span>' : '') + '</button>';
    }).join('');
    Array.prototype.forEach.call(document.querySelectorAll('#tabs button'), function (b) {
      b.onclick = function () { ST.tab = b.dataset.t; renderView(); renderTabs(); };
    });
  }

  /* ============================================================
     뷰
     ============================================================ */
  function renderView() {
    var v = $('#view');
    if (!product()) {
      v.innerHTML = '<div class="empty"><h3>상품을 선택하세요</h3><p>좌측에서 평가표와 상품을 선택하면 투자설명서가 자동 조회되고 스크립트가 완성됩니다.</p></div>';
      return;
    }
    if (ST.tab === 'script') v.innerHTML = viewScript();
    else if (ST.tab === 'reg') v.innerHTML = viewRegister();
    else if (ST.tab === 'req') v.innerHTML = viewRequired();
    else if (ST.tab === 'check') v.innerHTML = viewCheck();
    else v.innerHTML = viewRule();
    bindView();
  }

  function headBanner() {
    var sh = sheet(), p = product(), miss = missing();
    var h = [];
    h.push('<div class="banner blue"><b>' + esc(sh.label) + '</b> · 선택 상품 <b>' + esc(p.name) + '</b>'
      + (p.riskGrade ? ' (' + esc(p.riskLabel) + ' ' + p.riskGrade + '등급)' : '')
      + '<br>기본배점 ' + Object.keys(sh.secTotals).map(function (k) { return k + ' ' + sh.secTotals[k]; }).join(' + ') + ' = 100점 · 가점 최대 +3점 (총 103점)</div>');
    if (miss.length) {
      h.push('<div class="banner"><b>확인필요 ' + miss.length + '건</b> — 투자설명서 원문에서 채워야 하는 값이 남아 있습니다. 빨간 표시를 클릭하면 바로 입력됩니다.<br>'
        + miss.slice(0, 12).map(function (m) { return '<span class="v miss" data-kind="' + m.kind + '" data-key="' + esc(m.key) + '">' + esc(m.label) + '</span>'; }).join(' ')
        + (miss.length > 12 ? ' <span style="color:var(--muted2)">외 ' + (miss.length - 12) + '건</span>' : '') + '</div>');
    } else {
      h.push('<div class="banner" style="border-color:var(--ok);border-left-color:var(--ok);background:#f3f9f4"><b style="color:var(--ok)">확인필요 항목 없음</b> — 스크립트를 그대로 읽을 수 있습니다. 단, 수치는 투자설명서와 최종 대조하십시오.</div>');
    }
    if (p.sample) {
      h.push('<div class="banner"><b>예시 데이터</b> — 이 상품의 내장 값은 화면 확인용 예시입니다. 실제 상담에서는 <b>투자설명서 자동조회</b> 탭에서 원문 값으로 수정하십시오.</div>');
    }
    return h.join('');
  }

  function itemCard(item, idx, open) {
    var app = applicable(item);
    var cls = item.plus ? 'plus' : (item.max < 0 ? 'minus' : '');
    var sc = scoreOf(item), chk = checksOf(item);
    var h = [];
    h.push('<div class="card" data-item="' + esc(item.id) + '">');
    h.push('<div class="card-h" data-toggle="1">');
    h.push('<span class="no ' + cls + '">' + (idx + 1) + '</span>');
    h.push('<span class="ttl">' + esc(item.title) + '</span>');
    h.push('<span class="tag sec">' + esc(item.sec) + '</span>');
    h.push('<span class="pts ' + cls + '">' + (item.max > 0 && !item.plus ? item.max + '점' : (item.plus ? '+' + item.max : item.max + '점')) + '</span>');
    if (!app) h.push('<span class="tag" style="background:var(--gray-hl)">미해당</span>');
    if (item.derived) h.push('<span class="tag" style="background:#fff3e0;color:var(--orange-dk)" title="제공된 평가표에 없어 고령 시나리오로 보완한 항목">보완</span>');
    h.push('<span class="caret">' + (open ? '▲' : '▼') + '</span>');
    h.push('</div>');
    h.push('<div class="card-b"' + (open ? '' : ' hidden') + '>');
    if (!app) {
      h.push('<div class="note">현재 상담 조건에서는 평가 대상이 아닙니다. (좌측 「고객 구분」 체크에 따라 활성화)</div>');
    }
    if (item.crit) h.push('<div class="warnbox">★ ' + esc(item.crit) + '</div>');
    (item.script || []).forEach(function (s) {
      var c = s.t === 'say' ? 'say' : (s.t === 'act' ? 'act' : (s.t === 'warn' ? 'warnbox' : 'note'));
      var pre = s.t === 'act' ? '[행동] ' : (s.t === 'note' ? '※ ' : (s.t === 'warn' ? '⚠ ' : ''));
      h.push('<div class="' + c + '">' + (pre ? esc(pre) : '') + tpl(s.x) + '</div>');
    });
    /* Check Points */
    h.push('<div class="cps"><h4 style="display:flex;align-items:center;gap:8px">◐ Check Points'
      + (app ? '<button class="tbtn cpAll" data-item="' + esc(item.id) + '" style="padding:3px 9px;font-size:12px;margin-left:auto">모두 체크 / 해제</button>' : '') + '</h4>');
    item.cps.forEach(function (cp, i) {
      h.push('<label class="' + (chk[i] ? 'done' : '') + '"><input type="checkbox" class="cpChk" data-item="' + esc(item.id) + '" data-i="' + i + '"' + (chk[i] ? ' checked' : '') + (app ? '' : ' disabled') + '><span>' + esc(cp) + '</span></label>');
    });
    h.push('<div class="scorebar"><span>이행 ' + chk.filter(Boolean).length + '/' + item.cps.length + '</span><span>→ 예상점수 <b>' + (sc > 0 ? '+' : '') + sc + '</b>점</span></div>');
    if (item.bands) h.push('<div class="bands">평가기준 · ' + item.bands + '</div>');
    if (item.zero) h.push('<div class="bands" style="color:var(--err)">' + esc(item.zero) + '</div>');
    h.push('</div>');
    if (item.tips && item.tips.length) {
      h.push('<div class="note"><b>진행 유의점</b><br>· ' + item.tips.map(esc).join('<br>· ') + '</div>');
    }
    h.push('</div></div>');
    return h.join('');
  }

  function viewScript() {
    var h = [headBanner()];
    var lastSec = null;
    itemsOf().forEach(function (item, i) {
      if (item.sec !== lastSec) {
        lastSec = item.sec;
        h.push('<div class="rule"></div><h2 style="font-size:22px;font-weight:700;color:var(--ink);margin:0 0 14px">' + esc(item.sec) + '</h2>');
      }
      h.push(itemCard(item, i, true));
    });
    h.push('<div class="foot">완전판매 스크립트 자동완성 시스템 · 평가표 ' + esc(sheet().label) + '<br>스크립트 문구는 평가표의 「탁월사례」를 기준으로 구성했으며, 상품별 수치는 투자설명서 원문 대조가 필요합니다.</div>');
    return h.join('');
  }

  /* ============================================================
     필수입력 — 투자설명서를 끌어올 수 없을 때의 입력 경로
     ============================================================ */

  /** 현재 평가표 스크립트에 실제로 쓰이는 필드만 필수로 본다 */
  function usedFieldIds() {
    var set = {};
    itemsOf().forEach(function (x) {
      if (!applicable(x)) return;
      (x.script || []).forEach(function (s) {
        var re = /\{\{(\w+)\}\}/g, m;
        while ((m = re.exec(s.x))) set[m[1]] = 1;
      });
    });
    return set;
  }

  function reqFields() {
    var used = usedFieldIds(), p = product(), sh = sheet();
    return fieldDefs().filter(function (f) {
      if (f.ov && !(sh.overseas || (p && p.overseas))) return false;
      return !!used[f.id];
    });
  }

  function reqStatus() {
    var fs = reqFields(), missing = 0, filled = 0;
    /* 투자설명서에서 오는 항목과 상담에서 확인하는 고객 항목을 나눠 센다.
       자동완성률에 고객 성향·자금성향을 섞으면 설명서 등록 효과가 흐려진다. */
    var docTotal = 0, docFilled = 0, custTotal = 0, custMissing = 0;
    fs.forEach(function (f) {
      var v = valueOf(f.id);
      var empty = (v == null || v === '');
      if (empty) missing++; else filled++;
      if (f.ctx) { custTotal++; if (empty) custMissing++; }
      else { docTotal++; if (!empty) docFilled++; }
    });
    var inl = collectInlineLabels();
    var inlMissing = inl.filter(function (l) { return !ST.inline[l]; }).length;
    /* 진행률은 필드 + 원문 직접입력을 합쳐서 센다 (분모·분자가 어긋나면 혼란) */
    return {
      total: fs.length + inl.length,
      filled: filled + (inl.length - inlMissing),
      missing: missing + inlMissing,
      fieldTotal: fs.length, fieldMissing: missing,
      inlineTotal: inl.length, inlineMissing: inlMissing,
      docTotal: docTotal + inl.length, docFilled: docFilled + (inl.length - inlMissing),
      custTotal: custTotal, custMissing: custMissing
    };
  }

  function viewRequired() {
    var p = product(), sh = sheet(), rq = reqStatus();
    var used = usedFieldIds();
    var fs = reqFields();
    var extra = fieldDefs().filter(function (f) {
      if (f.ov && !(sh.overseas || (p && p.overseas))) return false;
      return !used[f.id];
    });

    var h = [headBanner()];
    h.push('<div class="summary">');
    h.push('<div class="stat"><div class="l">필수 입력 진행</div><div class="v2 ' + (rq.missing ? 'o' : 'g') + '">' + rq.filled
      + '<span style="font-size:18px;color:var(--muted2)">/' + rq.total + '</span></div>'
      + '<div class="bar"><i style="width:' + (rq.total ? Math.round(rq.filled / rq.total * 100) : 100) + '%"></i></div>'
      + '<div class="s">스크립트에서 실제로 읽는 항목만 집계 (필드 ' + rq.fieldTotal + ' + 원문 ' + rq.inlineTotal + ')</div></div>');
    h.push('<div class="stat"><div class="l">미입력</div><div class="v2 ' + (rq.missing ? 'r' : 'g') + '">' + rq.missing + '</div>'
      + '<div class="s">필드 ' + rq.fieldMissing + '건 + 원문 직접입력 ' + rq.inlineMissing + '건</div></div>');
    h.push('<div class="stat"><div class="l">상품 프로필</div><div class="v2 b" style="font-size:20px;padding-top:8px">'
      + (p.custom ? '담당자 등록' : (p.sample ? '예시 데이터' : '수집 데이터')) + '</div>'
      + '<div class="s">입력값은 상품별로 저장됩니다</div></div>');
    h.push('</div>');

    h.push('<div class="banner"><b>투자설명서를 끌어올 수 없을 때 이 화면에서 직접 입력합니다.</b><br>'
      + '입력값은 <b>상품별로</b> 브라우저에 저장되어 다음 상담 때 그대로 재사용됩니다. '
      + '아래 「상품 프로필 내보내기」로 JSON을 저장해 두면 다른 단말·다른 담당자에게 그대로 전달할 수 있습니다.</div>');

    h.push('<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">');
    h.push('<button class="tbtn primary" id="btnFillNext">미입력 항목으로 이동</button>');
    h.push('<button class="tbtn" id="btnExportProfile">상품 프로필 내보내기 (JSON)</button>');
    h.push('<button class="tbtn" id="btnImportProfile">상품 프로필 가져오기</button>');
    h.push('<button class="tbtn" id="btnClearProfile">이 상품 입력값 지우기</button>');
    h.push('</div>');

    h.push(fieldGrid('필수 입력 항목 — 스크립트에서 읽는 값', fs, true));

    /* «» 원문 직접입력 */
    var inl = collectInlineLabels();
    if (inl.length) {
      h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;color:var(--ink);margin:0 0 6px">투자설명서 원문 직접 입력 항목</h3>');
      h.push('<div class="hint" style="margin-bottom:12px">자동 조회로 확정할 수 없어 반드시 투자설명서 원문에서 옮겨 적어야 하는 값입니다. (미입력 '
        + rq.inlineMissing + ' / 전체 ' + inl.length + ')</div><div class="pgrid">');
      inl.forEach(function (lb) {
        var v = ST.inline[lb], empty = (v == null || v === '');
        h.push('<div class="pf' + (empty ? ' miss' : '') + '"><div class="k"><span>' + esc(lb) + '</span><span class="src ' + (empty ? 'no' : 'man') + '">'
          + (empty ? '미입력' : '입력') + '</span></div>');
        h.push('<input type="text" class="iInp" data-k="' + esc(lb) + '" value="' + esc(v == null ? '' : v) + '" placeholder="투자설명서 원문 값"></div>');
      });
      h.push('</div>');
    }

    if (extra.length) h.push(fieldGrid('참고 항목 — 현재 평가표 스크립트에서는 읽지 않음', extra, false));
    return h.join('');
  }

  function fieldGrid(title, list, req) {
    if (!list.length) return '';
    var groups = {};
    list.forEach(function (f) { (groups[f.group] = groups[f.group] || []).push(f); });
    var h = ['<div class="rule"></div><h3 style="font-size:18px;font-weight:700;color:var(--ink);margin:0 0 12px">' + esc(title) + '</h3>'];
    Object.keys(groups).forEach(function (g) {
      h.push('<div style="font-size:13px;font-weight:700;color:var(--blue);margin:14px 0 8px">' + esc(g) + '</div><div class="pgrid">');
      groups[g].forEach(function (f) {
        var v = valueOf(f.id);
        var state = (v == null || v === '') ? 'no' : (isManual(f.id) ? 'man' : 'auto');
        h.push('<div class="pf' + (state === 'no' && req ? ' miss' : '') + '" data-field="' + esc(f.id) + '">');
        h.push('<div class="k"><span>' + esc(f.label) + (req ? ' <span style="color:var(--orange)">*</span>' : '') + '</span><span class="src ' + state + '">'
          + (state === 'no' ? '미입력' : (state === 'man' ? '입력' : '자동')) + '</span></div>');
        h.push('<input type="text" class="fInp" data-k="' + esc(f.id) + '" value="' + esc(v == null ? '' : v) + '" placeholder="투자설명서에서 확인 후 입력">');
        if (f.hint) h.push('<div class="h">' + esc(f.hint) + '</div>');
        h.push('</div>');
      });
      h.push('</div>');
    });
    return h.join('');
  }

  /* ============================================================
     투자설명서 등록
     ------------------------------------------------------------
     설명서를 한 번 등록하면 그 상품의 모든 스크립트 항목이 자동완성된다.
     등록 방법 : PDF 업로드 / 텍스트 붙여넣기 / 항목 직접 등록 / 사내 API / JSON
     ============================================================ */

  /** 등록으로 채워진 항목 비율 */
  function docCoverage() {
    var rq = reqStatus();
    return {
      filled: rq.docFilled, total: rq.docTotal,
      pct: rq.docTotal ? Math.round(rq.docFilled / rq.docTotal * 100) : 100,
      custMissing: rq.custMissing, custTotal: rq.custTotal
    };
  }

  function docStatusCard() {
    var d = doc(), cov = docCoverage(), p = product();
    var h = [];
    var SRC = { PDF: '투자설명서 PDF', TEXT: '텍스트 붙여넣기', MANUAL: '항목 직접 등록', API: '사내 상품 API', JSON: 'JSON 가져오기', COLLECT: '자동수집 (data/els-prospectus.js)' };
    h.push('<div class="summary">');
    h.push('<div class="stat"><div class="l">투자설명서 등록 상태</div><div class="v2 ' + (d ? 'g' : 'r') + '" style="font-size:24px;padding-top:6px">'
      + (d ? '등록됨' : '미등록') + '</div><div class="s">' + (d ? esc(SRC[d.source] || d.source) + ' · ' + esc(String(d.registeredAt).slice(0, 16).replace('T', ' ')) : '아래에서 등록하세요') + '</div></div>');
    h.push('<div class="stat"><div class="l">자동완성률</div><div class="v2 ' + (cov.pct >= 100 ? 'g' : (cov.pct >= 70 ? 'o' : 'r')) + '">' + cov.pct + '<span style="font-size:18px">%</span></div>'
      + '<div class="bar"><i style="width:' + cov.pct + '%"></i></div><div class="s">설명서 항목 ' + cov.filled + ' / ' + cov.total + '</div></div>');
    h.push('<div class="stat"><div class="l">고객 상담정보</div><div class="v2 ' + (cov.custMissing ? 'o' : 'g') + '">'
      + (cov.custTotal - cov.custMissing) + '<span style="font-size:18px;color:var(--muted2)">/' + cov.custTotal + '</span></div>'
      + '<div class="s">설명서와 무관 · 좌측 상담 조건에서 입력</div></div>');
    if (d && d.docName) {
      h.push('<div class="stat"><div class="l">등록 문서</div><div class="v2 b" style="font-size:15px;padding-top:10px;line-height:1.4;word-break:break-all">'
        + esc(d.docName) + '</div></div>');
    }
    h.push('</div>');
    if (d) {
      h.push('<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">');
      h.push('<button class="tbtn" id="btnDocExport">등록 설명서 내보내기</button>');
      if (!d.collected) h.push('<button class="tbtn" id="btnDocDelete">등록 해제</button>');
      if (d.docUrl) h.push('<a class="tbtn" href="' + esc(d.docUrl) + '" target="_blank" rel="noopener" style="text-decoration:none">설명서 원문 열기</a>');
      h.push('</div>');
      if (d.collected) {
        h.push('<div class="note">이 내용은 <b>자동수집분</b>입니다. 아래에서 PDF·텍스트·직접 입력으로 등록하면 그 값이 자동수집분을 대체합니다.</div>');
      }
    }
    return h.join('');
  }

  /** ELS·DLS 차수별 상환조건 표 입력기 */
  function scheduleEditor() {
    if (sheet().cat !== 'els') return '';
    var d = doc() || {};
    var rows = PROS.normalizeSchedule(d.schedule || []);
    var t = elsTexts();
    var h = [];
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 6px">차수별 상환조건 표</h3>');
    h.push('<div class="hint" style="margin-bottom:12px">투자설명서의 상환조건 표를 그대로 옮기면 「자동조기상환의 조건과 수익률」·「만기상환 조건과 수익률」 스크립트가 빠짐없이 자동 생성됩니다. '
      + '경과개월은 <b>차수 × 조기상환주기</b> 규칙이 성립할 때만 자동으로 채워집니다.</div>');
    h.push('<div class="tscroll"><table><thead><tr><th style="width:60px">차수</th><th style="width:110px">경과개월</th><th style="width:120px">배리어 %</th>'
      + '<th style="width:130px">지급률 %<div style="font-weight:400;font-size:11px">액면금액 대비</div></th><th style="width:120px">연 수익률 %</th><th style="width:70px"></th></tr></thead><tbody>');
    rows.forEach(function (r, i) {
      h.push('<tr>');
      h.push('<td class="n" style="font-weight:700">' + (r.seq || i + 1) + '차</td>');
      ['months', 'barrier', 'payRate', 'annRate'].forEach(function (k) {
        var v = r[k];
        h.push('<td><input type="number" step="any" class="schInp" data-i="' + i + '" data-k="' + k + '" value="' + (v == null ? '' : esc(v))
          + '" style="width:100%;border:1px solid var(--hair);padding:5px 6px;font-variant-numeric:tabular-nums"></td>');
      });
      h.push('<td><button class="tbtn schDel" data-i="' + i + '" style="padding:3px 8px;font-size:12px">삭제</button></td>');
      h.push('</tr>');
    });
    h.push('</tbody></table></div>');
    h.push('<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">');
    h.push('<button class="tbtn" id="btnSchAdd">차수 추가</button>');
    h.push('<button class="tbtn" id="btnSchAuto">투자설명서 원문에서 표 자동 인식</button>');
    h.push('</div>');
    h.push('<div class="pgrid" style="margin-bottom:12px">');
    h.push('<div class="pf"><div class="k"><span>만기 배리어 %</span></div><input type="number" step="any" id="docMatBarrier" value="' + (d.matBarrier == null ? '' : esc(d.matBarrier)) + '" placeholder="예) 70"></div>');
    h.push('<div class="pf"><div class="k"><span>KI (원금손실발생조건) 배리어 %</span></div><input type="text" id="docKnockIn" value="' + (d.knockIn == null ? '' : esc(d.knockIn)) + '" placeholder="예) 40 · 노낙인이면 비워 두세요"></div>');
    h.push('</div>');
    if (t) {
      h.push('<div class="note"><b>생성된 스크립트 미리보기</b> (' + t.filled + '/' + t.total + ' 항목 채움)\n\n'
        + esc(t.earlyTable) + '\n\n' + esc(t.matCond) + '</div>');
    } else {
      h.push('<div class="warnbox">표가 비어 있어 손익구조 스크립트가 「확인필요」 로 남습니다. 차수를 추가해 입력하십시오.</div>');
    }
    return h.join('');
  }

  function viewRegister() {
    var p = product(), sh = sheet(), cfg = PROS.apiConfig(), d = doc();
    var h = [headBanner()];
    h.push(docStatusCard());

    h.push('<div class="banner blue"><b>투자설명서를 등록하면 이 상품의 모든 스크립트 항목이 자동완성됩니다.</b><br>'
      + '아래 다섯 가지 방법 중 가능한 것을 쓰면 됩니다. 등록 내용은 <b>상품별로</b> 저장되어 다음 상담에서도 그대로 쓰입니다.</div>');

    /* ① PDF */
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 10px">① 투자설명서 PDF 업로드</h3>');
    h.push('<div class="card"><div class="card-b">');
    if (!PROS.pdfAvailable()) {
      h.push('<div class="warnbox">PDF 판독 모듈(vendor/pdf.min.js)을 불러오지 못했습니다. ②~③ 방법을 사용하십시오.</div>');
    } else {
      h.push('<input type="file" id="pdfFile" accept="application/pdf" style="margin-bottom:10px">');
      h.push('<div class="hint">투자설명서 · 간이투자설명서 · 핵심(요약)설명서 PDF를 올리면 항목과 차수별 상환표를 자동 추출합니다. 외부 네트워크 없이 동작합니다.</div>');
      h.push('<div id="pdfStat" class="note" style="margin:10px 0 0;display:none"></div>');
      /**
       * 판독이 끝나면 화면을 다시 그리므로 파일 선택창은 「선택된 파일 없음」 으로 돌아간다.
       * 결과는 이 페이지 맨 아래에 붙어 있어 스크롤하지 않으면 보이지 않는다 — 그래서
       * 「첨부해도 인식을 못한다」 로 보였다. 판독 결과를 업로드 칸 바로 밑에 요약해 둔다.
       */
      var pr = pros();
      if (pr && /PDF/.test(pr.src)) {
        var n = pr.found.length + (pr.schedule ? pr.schedule.length : 0);
        h.push(n
          ? '<div class="note" style="margin:10px 0 0;border-left-color:var(--ok)"><b>판독 완료 — ' + esc(pr.name) + '</b> · '
            + (pr.pages ? pr.pages + '페이지 · ' : '') + '인식 항목 ' + pr.found.length + '건'
            + (pr.schedule && pr.schedule.length ? ' · 차수별 표 ' + pr.schedule.length + '행' : '')
            + '<br><button class="tbtn primary" id="btnGoResult" style="margin-top:8px">추출 결과 확인하고 등록하기</button></div>'
          : '<div class="warnbox" style="margin:10px 0 0"><b>판독은 됐지만 자동으로 인식된 항목이 없습니다 — ' + esc(pr.name) + '</b>'
            + (pr.pages ? ' (' + pr.pages + '페이지, 글자 ' + (pr.text ? pr.text.length : 0) + '자)' : '')
            + '<br>' + ((pr.text || '').length < 200
              ? '글자가 거의 안 나왔습니다. 스캔(이미지) PDF 로 보입니다 — ② 텍스트 붙여넣기나 ③ 직접 등록을 쓰십시오.'
              : '설명서 서식이 예상과 달라 항목을 못 찾았습니다. 아래 「추출된 원문 텍스트 보기」 로 판독 결과를 확인하고 ② 또는 ③ 으로 진행하십시오.')
            + '</div>');
      }
    }
    h.push('</div></div>');

    /* ② 텍스트 */
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 10px">② 텍스트 붙여넣기</h3>');
    h.push('<div class="card"><div class="card-b">');
    h.push('<div class="hint" style="margin-bottom:8px">PDF 판독이 안 되거나 사내 화면(MAPIS 등)에서 복사한 경우 사용합니다. 투자설명서 내용을 붙여넣고 「추출」을 누르십시오.</div>');
    h.push('<textarea id="docText" rows="8" placeholder="투자설명서 내용을 붙여넣으세요">' + esc(d && d.source === 'TEXT' && d.rawText ? d.rawText.slice(0, 40000) : '') + '</textarea>');
    h.push('<button class="tbtn primary" id="btnTextExtract" style="margin-top:8px">붙여넣은 내용에서 추출</button>');
    h.push('</div></div>');

    /* ③ 직접 등록 */
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 10px">③ 항목 직접 등록</h3>');
    h.push('<div class="card"><div class="card-b">');
    h.push('<div class="hint">「필수입력」 탭에서 항목별로 직접 입력하면 그 값이 곧 등록 내용이 됩니다. '
      + (sh.cat === 'els' ? 'ELS·DLS 는 아래 차수별 상환조건 표까지 채워야 손익구조 스크립트가 완성됩니다.' : '') + '</div>');
    h.push('<button class="tbtn" id="btnGoReq" style="margin-top:8px">필수입력 탭으로 이동</button>');
    h.push('</div></div>');

    /* ④ 사내 API */
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 10px">④ 사내 상품 API</h3>');
    h.push('<div class="card"><div class="card-b"><div class="pgrid">');
    h.push('<div class="pf"><div class="k"><span>엔드포인트 (GET)</span></div><input type="text" id="apiBase" value="' + esc(cfg.base || '') + '" placeholder="https://내부호스트/api/product"><div class="h">호출 형태 : {엔드포인트}?cat=' + esc(sh.cat) + '&amp;code={상품코드}</div></div>');
    h.push('<div class="pf"><div class="k"><span>인증 헤더 이름 (선택)</span></div><input type="text" id="apiHeader" value="' + esc(cfg.header || '') + '" placeholder="Authorization"></div>');
    h.push('<div class="pf"><div class="k"><span>인증 헤더 값 (선택)</span></div><input type="text" id="apiHeaderValue" value="' + esc(cfg.headerValue || '') + '" placeholder="Bearer ..."><div class="h">이 브라우저에만 저장됩니다</div></div>');
    h.push('<div class="pf"><div class="k"><span>조회할 상품코드</span></div><input type="text" id="apiCode" value="' + esc(p.id || '') + '"></div>');
    h.push('</div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="tbtn" id="btnApiSave">설정 저장</button>'
      + '<button class="tbtn primary" id="btnApiFetch"' + (cfg.base ? '' : ' disabled') + '>API로 조회</button></div>');
    if (!cfg.base) h.push('<div class="note" style="margin:12px 0 0">엔드포인트가 설정되지 않았습니다. 응답은 <code>{"fields":{"필드id":"값"}}</code> 또는 필드가 평면으로 담긴 JSON을 받습니다. 사내 응답 형태가 다르면 <code>js/sales-script-prospectus.js</code> 의 <code>mapResponse</code> 만 고치면 됩니다.</div>');
    h.push('</div></div>');

    /* ⑤ JSON */
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 10px">⑤ JSON 가져오기 / 내보내기</h3>');
    h.push('<div class="card"><div class="card-b"><div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '<button class="tbtn" id="btnExportProfile2">상품 프로필 내보내기</button>'
      + '<button class="tbtn" id="btnImportProfile2">상품 프로필 가져오기</button></div>'
      + '<div class="hint" style="margin-top:8px">등록된 설명서 내용과 차수별 표까지 함께 담깁니다. 같은 상품을 여러 지점에서 쓸 때 한 번만 등록해 공유하면 됩니다.</div></div></div>');

    /* 전 상품 공용 문구 */
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 6px">전 상품 공용 문구</h3>');
    h.push('<div class="hint" style="margin-bottom:12px">위험등급별 유의사항처럼 <b>상품이 아니라 판매회사 핵심(요약)설명서</b>에서 오는 문구입니다. '
      + '등급별로 한 번만 등록해 두면 모든 상품·모든 평가표에서 그대로 쓰입니다. 현재 상품 위험등급은 <b>'
      + esc(valueOf('riskGrade') || '—') + '등급</b> 이므로 그 항목이 스크립트에 들어갑니다.</div>');
    h.push('<div class="pgrid">');
    COMMON_DEFS.forEach(function (f) {
      var v = COMMON[f.id];
      var empty = (v == null || v === '');
      var cur = String(valueOf('riskGrade') || '');
      var active = f.id === 'riskNote' + cur;
      h.push('<div class="pf' + (empty && active ? ' miss' : '') + '"' + (active ? ' style="border-color:var(--orange)"' : '') + '>');
      h.push('<div class="k"><span>' + esc(f.label) + (active ? ' <span class="src man">현재 적용</span>' : '') + '</span>'
        + '<span class="src ' + (empty ? 'no' : 'man') + '">' + (empty ? '미입력' : '입력') + '</span></div>');
      h.push('<textarea class="cInp" data-k="' + esc(f.id) + '" rows="' + (f.id.indexOf('riskNote') === 0 ? 3 : 1) + '" placeholder="핵심(요약)설명서 문구">' + esc(v == null ? '' : v) + '</textarea>');
      if (f.hint) h.push('<div class="h">' + esc(f.hint) + '</div>');
      h.push('</div>');
    });
    h.push('</div>');

    /* ELS 차수별 표 */
    h.push(scheduleEditor());

    /* 추출 결과 검토 */
    h.push(extractionResult());
    return h.join('');
  }

  /** PDF·텍스트·API 추출 결과 검토 표 */
  function extractionResult() {
    var r = pros();
    if (!r) return '';
    var h = ['<div class="rule" id="extractResult"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 10px">추출 결과 — ' + esc(r.name) + '</h3>'];
    h.push('<div class="hint" style="margin-bottom:12px">출처 ' + esc(r.src) + (r.pages ? ' · ' + r.pages + '페이지' : '')
      + ' · 항목 ' + r.found.length + '건' + (r.schedule && r.schedule.length ? ' · 차수별 표 ' + r.schedule.length + '행' : '') + '</div>');
    if (r.linked) {
      var lc = r.found.filter(function (f) { return f.collected; }).length;
      h.push('<div class="note" style="margin-bottom:12px;border-left-color:var(--ok)"><b>제' + esc(r.linked.no)
        + '회 — 이미 수집해 둔 DART 공시와 연결되었습니다.</b><br>'
        + '첨부하신 설명서에서 읽은 값이 우선이고, 비어 있던 ' + lc + '건은 일괄신고추가서류 원문에서 채웠습니다'
        + (r.schedule && r.schedule.length ? ' (차수별 상환조건 ' + r.schedule.length + '행 포함)' : '') + '. '
        + (r.linked.rec.docUrl ? '<a href="' + esc(r.linked.rec.docUrl) + '" target="_blank" rel="noopener">공시 원문 보기</a>' : '')
        + '</div>');
    }
    if (!r.found.length && !(r.schedule && r.schedule.length)) {
      h.push('<div class="warnbox">자동으로 인식된 항목이 없습니다. 설명서 서식이 예상과 달라 텍스트 패턴이 맞지 않는 경우입니다. '
        + '③ 항목 직접 등록으로 진행하십시오.</div>');
    } else {
      h.push('<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'
        + '<button class="tbtn primary" id="btnRegisterAll">전체 등록 (모든 항목 자동완성)</button>'
        + '<button class="tbtn" id="btnClearPros">추출 결과 지우기</button></div>');
      if (r.schedule && r.schedule.length) {
        h.push('<div class="note"><b>인식된 차수별 상환조건 ' + r.schedule.length + '행</b> — 「전체 등록」 시 위 표에 반영됩니다.\n'
          + r.schedule.map(function (x) {
            return '  ' + x.seq + '차 : 경과 ' + (x.months == null ? '—' : x.months + '개월')
              + ' / 배리어 ' + (x.barrier == null ? '—' : x.barrier + '%')
              + ' / 지급률 ' + (x.payRate == null ? '—' : x.payRate + '%')
              + ' / 연 ' + (x.annRate == null ? '—' : x.annRate + '%');
          }).join('\n') + '</div>');
      }
      if (r.found.length) {
        h.push('<div class="tscroll"><table><thead><tr><th style="width:180px">항목</th><th style="width:170px">추출값</th><th>근거 문구</th><th style="width:96px">등록</th></tr></thead><tbody>');
        r.found.forEach(function (f, i) {
          var cur = valueOf(f.id);
          var same = String(cur == null ? '' : cur) === f.value;
          h.push('<tr><td style="font-weight:500">' + esc(labelOf(f.id) || f.label) + '<div style="font-size:11px;color:var(--muted2)">' + esc(f.id) + '</div></td>');
          h.push('<td style="font-weight:700">' + esc(f.value) + (f.fallback ? '<div style="font-size:11px;color:var(--warn)">보조 패턴</div>' : '') + '</td>');
          h.push('<td style="font-size:12px;color:var(--muted)">' + esc(f.evidence) + '</td>');
          h.push('<td>' + (same ? '<span class="src auto">등록됨</span>' : '<button class="tbtn applyOne" data-i="' + i + '" style="padding:4px 10px;font-size:12px">등록</button>') + '</td></tr>');
        });
        h.push('</tbody></table></div>');
      }
      h.push('<div class="warnbox">추출값은 <b>참고</b>입니다. 등록 전에 근거 문구가 해당 항목을 가리키는지 확인하십시오. 잘못된 값을 읽으면 부당권유행위(최대 −18점) 감점 사유가 됩니다.</div>');
    }
    if (r.text) {
      h.push('<details style="margin-top:14px"><summary style="cursor:pointer;font-size:14px;font-weight:600;color:var(--blue)">추출된 원문 텍스트 보기 (' + r.text.length.toLocaleString() + '자)</summary>'
        + '<pre style="max-height:340px;overflow:auto;font-size:12px;background:var(--subtle);border:1px solid var(--hair);padding:12px;white-space:pre-wrap;margin-top:8px">' + esc(r.text.slice(0, 20000)) + '</pre></details>');
    }
    return h.join('');
  }


  function collectInlineLabels() {
    var set = {}, out = [];
    itemsOf().forEach(function (x) {
      if (!applicable(x)) return;
      (x.script || []).forEach(function (s) {
        var re = /«([^«»]{1,80})»/g, m;
        while ((m = re.exec(s.x))) { if (!set[m[1]]) { set[m[1]] = 1; out.push(m[1]); } }
      });
    });
    return out;
  }

  /* ---------------- 체크리스트 · 셀프채점 ---------------- */
  function viewCheck() {
    var t = totals(), sh = sheet();
    var h = [headBanner()];
    h.push('<div class="summary">');
    h.push('<div class="stat"><div class="l">예상 총점</div><div class="v2 ' + (t.total >= 95 ? 'g' : (t.total >= 85 ? 'o' : 'r')) + '">' + t.total + '</div><div class="s">100점 만점 (가점 포함 최대 103)</div><div class="bar"><i style="width:' + Math.max(0, Math.min(100, t.total)) + '%"></i></div></div>');
    h.push('<div class="stat"><div class="l">기본배점</div><div class="v2 b">' + t.base + '<span style="font-size:18px;color:var(--muted2)">/' + t.baseMax + '</span></div><div class="s">적합성원칙 + 설명의무</div></div>');
    h.push('<div class="stat"><div class="l">가점</div><div class="v2 g">+' + t.plus + '<span style="font-size:18px;color:var(--muted2)">/' + t.plusMax + '</span></div><div class="s">녹취 · 판매후확인콜 등</div></div>');
    h.push('<div class="stat"><div class="l">감점</div><div class="v2 r">' + t.minus + '</div><div class="s">부당권유 · 상담지연 등</div></div>');
    h.push('<div class="stat"><div class="l">Check Point 이행</div><div class="v2">' + t.done + '<span style="font-size:18px;color:var(--muted2)">/' + t.all + '</span></div><div class="bar"><i style="width:' + (t.all ? Math.round(t.done / t.all * 100) : 0) + '%"></i></div></div>');
    h.push('</div>');

    h.push('<div class="tscroll"><table><thead><tr><th style="width:44px">#</th><th>평가 항목</th><th style="width:110px">구분</th><th style="width:74px">배점</th><th style="width:74px">이행</th><th style="width:80px">예상점수</th></tr></thead><tbody>');
    itemsOf().forEach(function (x, i) {
      var app = applicable(x), sc = scoreOf(x), c = checksOf(x).filter(Boolean).length;
      var full = app && sc === (x.max > 0 ? x.max : 0);
      h.push('<tr' + (app ? '' : ' style="opacity:.45"') + '>');
      h.push('<td class="n">' + (i + 1) + '</td>');
      h.push('<td><a href="#" class="jump" data-item="' + esc(x.id) + '" style="color:var(--ink);text-decoration:none;font-weight:500">' + esc(x.title) + '</a></td>');
      h.push('<td style="font-size:12px;color:var(--muted)">' + esc(x.sec) + '</td>');
      h.push('<td class="n">' + (x.plus ? '+' + x.max : x.max) + '</td>');
      h.push('<td class="n">' + (app ? c + '/' + x.cps.length : '—') + '</td>');
      h.push('<td class="n' + (full ? ' hl' : '') + '" style="color:' + (sc < 0 ? 'var(--err)' : (full ? 'var(--ink)' : 'var(--orange-dk)')) + ';font-weight:700">' + (app ? (sc > 0 ? '+' : '') + sc : '—') + '</td>');
      h.push('</tr>');
    });
    h.push('<tr><td class="hl" colspan="3">합계</td><td class="hl n">100</td><td class="hl n">' + t.done + '/' + t.all + '</td><td class="hl n">' + t.total + '</td></tr>');
    h.push('</tbody></table></div>');

    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 12px">섹션별 배점 달성</h3>');
    h.push('<div class="tscroll"><table><thead><tr><th>구분</th><th style="width:110px">원표 배점</th><th style="width:110px">예상 획득</th><th style="width:90px">달성률</th></tr></thead><tbody>');
    Object.keys(sh.secTotals).forEach(function (k) {
      var got = (t.bySec[k] || { got: 0 }).got, max = sh.secTotals[k];
      h.push('<tr><td>' + esc(k) + '</td><td class="n">' + max + '</td><td class="n">' + got + '</td><td class="n">' + (max ? Math.round(got / max * 100) : 0) + '%</td></tr>');
    });
    h.push('</tbody></table></div>');
    return h.join('');
  }

  /* ---------------- 평가기준 요약 ---------------- */
  function viewRule() {
    var sh = sheet();
    var h = [headBanner()];
    h.push('<div class="tscroll"><table><thead><tr><th style="width:44px">#</th><th>평가 항목</th><th>세부 평가 기준 (Check Points)</th><th style="width:74px">배점</th></tr></thead><tbody>');
    itemsOf().forEach(function (x, i) {
      h.push('<tr><td class="n">' + (i + 1) + '</td><td style="font-weight:500">' + esc(x.title) + '<div style="font-size:12px;color:var(--muted2);margin-top:3px">' + esc(x.sec) + '</div></td>');
      h.push('<td style="font-size:13px">' + x.cps.map(function (c, j) { return '<div>' + '①②③④⑤⑥⑦⑧⑨⑩'.charAt(j) + ' ' + esc(c) + '</div>'; }).join('')
        + (x.bands ? '<div class="bands" style="margin-top:6px">' + x.bands + '</div>' : '') + '</td>');
      h.push('<td class="n" style="font-weight:700">' + (x.plus ? '+' + x.max : x.max) + '</td></tr>');
    });
    h.push('</tbody></table></div>');
    h.push('<div class="foot">배점 합계 : 기본 100점 + 가점 최대 3점 = 총 103점 · '
      + Object.keys(sh.secTotals).map(function (k) { return k + ' ' + sh.secTotals[k] + '점'; }).join(' / ') + '</div>');
    return h.join('');
  }

  /* ---------------- 이벤트 바인딩 ---------------- */
  function bindView() {
    /* 카드 접기/펼치기 */
    Array.prototype.forEach.call(document.querySelectorAll('[data-toggle]'), function (hd) {
      hd.onclick = function (ev) {
        if (ev.target.closest('input,label,a')) return;
        var b = hd.nextElementSibling;
        b.hidden = !b.hidden;
        hd.querySelector('.caret').textContent = b.hidden ? '▼' : '▲';
      };
    });
    /* Check Point — 전체 재렌더 없이 해당 카드만 갱신한다
       (상담 중 체크할 때 스크롤 위치와 펼침 상태가 유지되어야 한다) */
    Array.prototype.forEach.call(document.querySelectorAll('.cpChk'), function (c) {
      c.onchange = function () {
        var item = findItem(c.dataset.item);
        if (!item) return;
        checksOf(item)[+c.dataset.i] = c.checked;
        save();
        c.closest('label').classList.toggle('done', c.checked);
        updateScorebar(c.closest('.card'), item);
        renderTabs();
        if (ST.tab === 'check') renderView();
      };
    });
    /* 항목별 일괄 체크 */
    Array.prototype.forEach.call(document.querySelectorAll('.cpAll'), function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        var item = findItem(b.dataset.item);
        if (!item) return;
        var card = b.closest('.card');
        var arr = checksOf(item);
        var target = arr.some(function (v) { return !v; });
        for (var i = 0; i < arr.length; i++) arr[i] = target;
        save();
        Array.prototype.forEach.call(card.querySelectorAll('.cpChk'), function (c) {
          c.checked = target;
          c.closest('label').classList.toggle('done', target);
        });
        updateScorebar(card, item);
        renderTabs();
      };
    });
    /* 확인필요 · 값 클릭 → 인라인 입력 */
    Array.prototype.forEach.call(document.querySelectorAll('.v'), function (s) {
      s.onclick = function () {
        var kind = s.dataset.kind, key = s.dataset.key;
        var cur = kind === 'field' ? (valueOf(key) || '') : (ST.inline[key] || '');
        var label = kind === 'field' ? labelOf(key) : key;
        var v = prompt('[' + label + ']\n투자설명서 원문 값을 입력하세요.', cur);
        if (v == null) return;
        if (kind === 'field') setManual(key, v); else ST.inline[key] = v;
        save(); renderAll();
      };
    });
    /* 자동조회 패널 입력 */
    Array.prototype.forEach.call(document.querySelectorAll('.fInp'), function (i) {
      i.onchange = function () { setManual(i.dataset.k, i.value); save(); renderTabs(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.iInp'), function (i) {
      i.onchange = function () { ST.inline[i.dataset.k] = i.value; save(); renderTabs(); };
    });
    bindLookup();
    bindRegister();
    bindRequired();
    /* 체크리스트 → 스크립트 점프 */
    Array.prototype.forEach.call(document.querySelectorAll('.jump'), function (a) {
      a.onclick = function (ev) {
        ev.preventDefault();
        var id = a.dataset.item;
        ST.tab = 'script'; renderView(); renderTabs();
        var el = document.querySelector('[data-item="' + id + '"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    });
  }
  /* ---------------- 투자설명서 등록 · 필수입력 이벤트 ---------------- */

  /** 등록 레코드를 만들거나 갱신한다 */
  function upsertDoc(patch) {
    var d = doc() || { source: 'MANUAL', docName: '', registeredAt: '', fields: {}, schedule: [], matBarrier: null, knockIn: '' };
    Object.keys(patch || {}).forEach(function (k) {
      if (k === 'fields') {
        d.fields = Object.assign({}, d.fields, patch.fields);
      } else {
        d[k] = patch[k];
      }
    });
    d.registeredAt = new Date().toISOString();
    setDoc(d);
    return d;
  }

  /** 추출 항목 하나를 등록한다 (등록 레코드에 반영 — 직접 수정값이 있으면 그것이 우선) */
  function applyFound(f) {
    var patch = {};
    patch[f.id] = f.value;
    upsertDoc({ fields: patch });
    /* 직접 수정한 값이 남아 있으면 등록값이 가려지므로 정리한다 */
    if (isManual(f.id)) setManual(f.id, '');
  }

  /** 추출 결과 전체를 등록 (모든 항목 자동완성) */
  function registerAll() {
    var r = pros();
    if (!r) return;
    var fields = {};
    r.found.forEach(function (f) {
      fields[f.id] = f.value;
      if (isManual(f.id)) setManual(f.id, '');
    });
    var patch = {
      source: r.src === '사내 상품 API' ? 'API' : (r.src === '텍스트 붙여넣기' ? 'TEXT' : 'PDF'),
      docName: r.name, fields: fields
    };
    if (r.text) patch.rawText = r.text;
    if (r.schedule && r.schedule.length) patch.schedule = r.schedule;
    /* KI·만기 배리어는 추출 항목에서 끌어온다 */
    var ki = fields.knockIn;
    if (ki != null && !/없음|노낙인|해당 없음/.test(String(ki))) patch.knockIn = String(ki).replace(/[^0-9.]/g, '');
    /**
     * 수집분과 연결된 회차면 손익구조 문구에 필요한 값까지 함께 싣는다.
     * (만기 배리어·원금지급형 여부·월지급 조건이 없으면 만기상환 문구를 못 만든다)
     */
    if (r.linked && r.linked.rec) {
      var lr = r.linked.rec;
      if (lr.matBarrier != null) patch.matBarrier = lr.matBarrier;
      if (lr.instrument) patch.instrument = lr.instrument;
      patch.principalProtected = !!lr.principalProtected;
      if (lr.monthlyIncome) patch.monthlyIncome = lr.monthlyIncome;
      if (patch.knockIn == null && lr.knockIn) patch.knockIn = String(lr.knockIn);
      patch.docUrl = lr.docUrl || '';
      patch.linkedRound = lr.no;
    }
    upsertDoc(patch);
    save(); renderAll();
  }

  /**
   * 첨부한 ELS·DLS 설명서가 이미 수집해 둔 DART 공시의 회차인지 찾는다.
   *
   * 간이투자설명서 PDF 를 그대로 긁으면 표가 여러 줄로 쪼개져 있어 차수별 상환조건까지는
   * 못 읽는다. 그런데 같은 회차를 DART 일괄신고추가서류에서 이미 파싱해 두었다 —
   * 원문이 더 정확하고 차수표·낙인·공정가액이 다 들어 있다. 회차가 맞으면 그것을 붙인다.
   * (상품 목록에 없는 임의 상품으로 등록해도 연결된다 — 회차는 문서와 파일명에 있다)
   */
  function linkCollected(text, fileName) {
    var P = window.ELS_PROSPECTUS;
    if (!P || !P.byRound) return null;
    var hay = String(text || '') + '\n' + String(fileName || '');
    var no = null;
    /* ① 상품코드(ISIN) — 파일명이 코드인 경우가 많다 */
    var im = hay.match(/\bKR[0-9A-Z]{10}\b/);
    if (im && P.codeToRound && P.codeToRound[im[0]] != null) no = String(P.codeToRound[im[0]]);
    /* ② 회차 번호 */
    if (!no) {
      var m = hay.match(/제\s*(\d{3,6})\s*회/);
      if (m && P.byRound[m[1]]) no = m[1];
    }
    return no && P.byRound[no] ? { no: no, rec: P.byRound[no] } : null;
  }

  /** 텍스트에서 추출 (PDF·붙여넣기 공통) */
  function runExtract(text, srcLabel, name, pages) {
    var cat = sheet().cat;
    var found = PROS.extract(text, cat);
    var schedule = cat === 'els' ? PROS.parseSchedule(text) : [];
    var linked = cat === 'els' ? linkCollected(text, name) : null;

    if (linked) {
      /* 첨부본에서 읽은 값이 우선이고, 비어 있는 항목만 수집분으로 채운다 */
      var have = {};
      found.forEach(function (f) { have[f.id] = 1; });
      var lf = linked.rec.fields || {};
      Object.keys(lf).forEach(function (k) {
        if (have[k] || lf[k] == null || lf[k] === '') return;
        found.push({
          id: k, label: labelOf(k), value: lf[k], collected: true,
          evidence: 'DART 일괄신고추가서류 제' + linked.no + '회 수집분'
            + (linked.rec.docDate ? ' (' + linked.rec.docDate + ' 공시)' : '')
        });
      });
      /* 차수별 상환조건은 간이설명서 PDF 에서 못 읽는 경우가 많다 */
      if ((!schedule || !schedule.length) && linked.rec.schedule && linked.rec.schedule.length) {
        schedule = linked.rec.schedule.slice();
      }
    }

    ST.pros = {
      cat: cat, productId: ST.productId, src: srcLabel, name: name,
      pages: pages || 0, found: found, schedule: schedule, text: text,
      linked: linked
    };
  }

  function bindRegister() {
    var goReq = $('#btnGoReq');
    if (goReq) goReq.onclick = function () { ST.tab = 'req'; renderView(); renderTabs(); };

    var tx = $('#btnTextExtract');
    if (tx) {
      tx.onclick = function () {
        var t = $('#docText').value;
        if (!t || t.trim().length < 20) { alert('투자설명서 내용을 붙여넣으세요.'); return; }
        runExtract(t, '텍스트 붙여넣기', '붙여넣은 텍스트', 0);
        renderAll();
      };
    }

    var reg = $('#btnRegisterAll');
    if (reg) reg.onclick = registerAll;

    var del = $('#btnDocDelete');
    if (del) {
      del.onclick = function () {
        if (!confirm('이 상품에 등록된 투자설명서를 해제합니다. 계속하시겠습니까?')) return;
        setDoc(null); ST.pros = null; renderAll();
      };
    }
    var dex = $('#btnDocExport');
    if (dex) dex.onclick = exportProfile;

    /* 차수별 표 */
    Array.prototype.forEach.call(document.querySelectorAll('.schInp'), function (i) {
      i.onchange = function () {
        var d = doc() || {};
        var rows = (d.schedule || []).slice();
        var idx = +i.dataset.i;
        while (rows.length <= idx) rows.push({ seq: rows.length + 1 });
        rows[idx] = Object.assign({}, rows[idx]);
        rows[idx][i.dataset.k] = i.value === '' ? null : Number(i.value);
        upsertDoc({ schedule: rows });
        save(); renderView(); renderTabs();
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.schDel'), function (b) {
      b.onclick = function () {
        var d = doc() || {};
        var rows = (d.schedule || []).slice();
        rows.splice(+b.dataset.i, 1);
        rows.forEach(function (r, n) { r.seq = n + 1; });
        upsertDoc({ schedule: rows });
        save(); renderView(); renderTabs();
      };
    });
    var add = $('#btnSchAdd');
    if (add) {
      add.onclick = function () {
        var d = doc() || {};
        var rows = (d.schedule || []).slice();
        var prev = rows[rows.length - 1] || {};
        rows.push({ seq: rows.length + 1, months: null, barrier: prev.barrier != null ? prev.barrier : null, payRate: null, annRate: prev.annRate != null ? prev.annRate : null });
        upsertDoc({ schedule: rows });
        save(); renderView(); renderTabs();
      };
    }
    var auto = $('#btnSchAuto');
    if (auto) {
      auto.onclick = function () {
        var d = doc();
        var text = (pros() && pros().text) || (d && d.rawText) || '';
        if (!text) { alert('먼저 PDF를 업로드하거나 텍스트를 붙여넣으십시오.'); return; }
        var rows = PROS.parseSchedule(text);
        if (!rows.length) { alert('원문에서 차수별 표를 인식하지 못했습니다. 표를 직접 입력하십시오.'); return; }
        upsertDoc({ schedule: rows });
        save(); renderAll();
      };
    }
    Array.prototype.forEach.call(document.querySelectorAll('.cInp'), function (i) {
      i.onchange = function () {
        COMMON[i.dataset.k] = i.value.trim();
        saveCommon(); renderView(); renderTabs();
      };
    });
    ['docMatBarrier', 'docKnockIn'].forEach(function (id) {
      var el = $('#' + id);
      if (!el) return;
      el.onchange = function () {
        var patch = {};
        patch[id === 'docMatBarrier' ? 'matBarrier' : 'knockIn'] = el.value === '' ? null : el.value;
        upsertDoc(patch);
        save(); renderView(); renderTabs();
      };
    });
  }

  function bindLookup() {
    var save1 = $('#btnApiSave');
    if (save1) {
      save1.onclick = function () {
        PROS.setApiConfig({
          base: $('#apiBase').value.trim(),
          header: $('#apiHeader').value.trim(),
          headerValue: $('#apiHeaderValue').value.trim()
        });
        renderView(); renderTabs();
      };
    }
    var fetchBtn = $('#btnApiFetch');
    if (fetchBtn) {
      fetchBtn.onclick = function () {
        var code = $('#apiCode').value.trim();
        if (!code) { alert('상품코드를 입력하세요.'); return; }
        fetchBtn.disabled = true; fetchBtn.textContent = '조회 중…';
        PROS.fetchFromApi(sheet().cat, code).then(function (found) {
          ST.pros = { cat: sheet().cat, productId: ST.productId, src: '사내 상품 API', name: code, pages: 0, found: found, schedule: [], text: '' };
          save(); renderAll();
        }).catch(function (e) {
          alert('조회 실패 : ' + e.message);
          fetchBtn.disabled = false; fetchBtn.textContent = 'API로 조회';
        });
      };
    }

    var goRes = $('#btnGoResult');
    if (goRes) {
      goRes.onclick = function () {
        var el = $('#extractResult');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    }

    var fi = $('#pdfFile');
    if (fi) {
      fi.onchange = function () {
        var file = fi.files && fi.files[0];
        if (!file) return;
        var stat = $('#pdfStat');
        stat.style.display = '';
        stat.textContent = 'PDF 판독 중… (' + file.name + ')';
        PROS.pdfToText(file, function (n, total) {
          stat.textContent = 'PDF 판독 중… ' + n + ' / ' + total + ' 페이지 (' + file.name + ')';
        }).then(function (r) {
          runExtract(r.text, '투자설명서 PDF', file.name, r.pages);
          renderAll();
          /* 결과는 페이지 아래쪽에 붙는다 — 곧바로 데려간다 */
          var el = $('#extractResult');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }).catch(function (e) {
          /* 실패는 반드시 눈에 보여야 한다. 화면을 다시 그리지 않으므로 이 노드는 살아 있다 */
          stat.className = 'warnbox';
          stat.textContent = 'PDF 판독 실패 (' + file.name + ') : ' + (e && e.message ? e.message : e)
            + ' — ② 텍스트 붙여넣기 또는 ③ 항목 직접 등록으로 진행하십시오.';
        });
      };
    }

    Array.prototype.forEach.call(document.querySelectorAll('.applyOne'), function (b) {
      b.onclick = function () {
        applyFound(pros().found[+b.dataset.i]);
        save(); renderView(); renderTabs();
      };
    });
    var clr = $('#btnClearPros');
    if (clr) clr.onclick = function () { ST.pros = null; renderAll(); };

    ['#btnExportProfile', '#btnExportProfile2'].forEach(function (sel) {
      var b = $(sel);
      if (b) b.onclick = exportProfile;
    });
    ['#btnImportProfile', '#btnImportProfile2'].forEach(function (sel) {
      var b = $(sel);
      if (b) b.onclick = importProfile;
    });
  }

  function bindRequired() {
    var nx = $('#btnFillNext');
    if (nx) {
      nx.onclick = function () {
        var el = document.querySelector('.pf.miss input');
        if (!el) { alert('미입력 항목이 없습니다.'); return; }
        el.closest('.pf').scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      };
    }
    var cl = $('#btnClearProfile');
    if (cl) {
      cl.onclick = function () {
        var p = product();
        if (!p) return;
        if (!confirm('「' + p.name + '」 에 입력한 값을 모두 지웁니다. 계속하시겠습니까?')) return;
        delete ST.pman[p.id];
        save(); renderAll();
      };
    }
  }

  /** 상품 기본정보 + 담당자 입력값을 하나의 JSON 으로 내보낸다 */
  function exportProfile() {
    var p = product(), sh = sheet();
    if (!p) return;
    var payload = {
      _type: 'ss-product-profile', _version: 2,
      cat: sh.cat, exportedAt: new Date().toISOString(),
      product: JSON.parse(JSON.stringify(Object.assign({}, p, { raw: undefined }))),
      doc: doc() ? JSON.parse(JSON.stringify(doc())) : null,
      values: Object.assign({}, ST.pman[p.id] || {}),
      inline: Object.assign({}, ST.inline)
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'product-' + sh.cat + '-' + String(p.id).replace(/[^\w\-]/g, '') + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function importProfile() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var o;
        try { o = JSON.parse(fr.result); } catch (e) { alert('JSON 형식이 올바르지 않습니다.'); return; }
        if (o._type !== 'ss-product-profile') { alert('상품 프로필 JSON 이 아닙니다.'); return; }
        var cat = o.cat || sheet().cat;
        if (cat !== sheet().cat && !confirm('상품군이 다릅니다 (' + cat + ').\n현재 평가표(' + sheet().cat + ')로 가져오시겠습니까?')) return;
        var p = o.product || {};
        if (!p.id) p.id = 'U' + Date.now().toString(36).toUpperCase();
        p.custom = true; p.sample = false;
        CUSTOM[sheet().cat] = (CUSTOM[sheet().cat] || []).filter(function (x) { return x.id !== p.id; });
        CUSTOM[sheet().cat].unshift(p);
        saveCustom();
        ST.productId = p.id;
        if (o.doc) { if (!DOCS[sheet().cat]) DOCS[sheet().cat] = {}; DOCS[sheet().cat][p.id] = o.doc; saveDocs(); }
        if (o.values) ST.pman[p.id] = Object.assign({}, o.values);
        if (o.inline) Object.keys(o.inline).forEach(function (k) { if (!ST.inline[k]) ST.inline[k] = o.inline[k]; });
        save(); renderAll();
        alert('「' + (p.name || p.id) + '」 프로필을 가져왔습니다.');
      };
      fr.readAsText(f);
    };
    inp.click();
  }

  /** 카드 안의 이행 카운트 · 예상점수만 다시 쓴다 */
  function updateScorebar(card, item) {
    if (!card) return;
    var bar = card.querySelector('.scorebar');
    if (!bar) return;
    var n = checksOf(item).filter(Boolean).length, sc = scoreOf(item);
    bar.innerHTML = '<span>이행 ' + n + '/' + item.cps.length + '</span><span>→ 예상점수 <b>' + (sc > 0 ? '+' : '') + sc + '</b>점</span>';
  }

  function findItem(id) {
    var l = itemsOf();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }

  /* ============================================================
     읽기 모드 (프롬프터)
     ============================================================ */
  var PR = { on: false, i: 0 };
  function prList() { return itemsOf().filter(applicable); }

  function prRender() {
    var l = prList();
    if (!l.length) return;
    PR.i = Math.max(0, Math.min(PR.i, l.length - 1));
    var item = l[PR.i], chk = checksOf(item), sc = scoreOf(item);
    var cls = item.plus ? 'plus' : (item.max < 0 ? 'minus' : '');
    var h = [];
    h.push('<div class="pr-h"><span class="no ' + cls + '" style="width:34px;height:34px;font-size:16px">' + (PR.i + 1) + '</span>');
    h.push('<span class="ttl">' + esc(item.title) + '</span>');
    h.push('<span class="tag sec">' + esc(item.sec) + '</span>');
    h.push('<span class="pts ' + cls + '">' + (item.plus ? '+' + item.max : item.max + '점') + '</span></div>');
    if (item.crit) h.push('<div class="warnbox">★ ' + esc(item.crit) + '</div>');
    (item.script || []).forEach(function (s) {
      var c = s.t === 'say' ? 'say' : (s.t === 'act' ? 'act' : (s.t === 'warn' ? 'warnbox' : 'note'));
      var pre = s.t === 'act' ? '[행동] ' : (s.t === 'note' ? '※ ' : (s.t === 'warn' ? '⚠ ' : ''));
      h.push('<div class="' + c + '">' + (pre ? esc(pre) : '') + tpl(s.x) + '</div>');
    });
    h.push('<div class="cps"><h4>◐ Check Points — 말한 항목을 체크하세요</h4>');
    item.cps.forEach(function (cp, i) {
      h.push('<label class="' + (chk[i] ? 'done' : '') + '"><input type="checkbox" class="prChk" data-i="' + i + '"' + (chk[i] ? ' checked' : '') + '><span>' + esc(cp) + '</span></label>');
    });
    h.push('<div class="scorebar"><span>이행 ' + chk.filter(Boolean).length + '/' + item.cps.length + '</span><span>→ 예상점수 <b>' + (sc > 0 ? '+' : '') + sc + '</b>점</span></div>');
    if (item.bands) h.push('<div class="bands">평가기준 · ' + item.bands + '</div>');
    h.push('</div>');
    if (item.tips && item.tips.length) h.push('<div class="note"><b>진행 유의점</b><br>· ' + item.tips.map(esc).join('<br>· ') + '</div>');

    $('#prBody').innerHTML = h.join('');
    $('#prBody').scrollTop = 0;
    $('#prPos').textContent = (PR.i + 1) + ' / ' + l.length;
    $('#prBar').style.width = ((PR.i + 1) / l.length * 100) + '%';
    $('#prPrev').disabled = PR.i === 0;
    $('#prNext').disabled = PR.i === l.length - 1;

    /* 읽기 모드에서도 부분 갱신 — 체크할 때 스크롤이 튀지 않아야 한다 */
    Array.prototype.forEach.call(document.querySelectorAll('.prChk'), function (c) {
      c.onchange = function () {
        checksOf(item)[+c.dataset.i] = c.checked;
        save();
        c.closest('label').classList.toggle('done', c.checked);
        updateScorebar($('#prBody'), item);
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#prBody .v'), function (s) {
      s.onclick = function () {
        var kind = s.dataset.kind, key = s.dataset.key;
        var label = kind === 'field' ? labelOf(key) : key;
        var cur = kind === 'field' ? (valueOf(key) || '') : (ST.inline[key] || '');
        var v = prompt('[' + label + ']\n투자설명서 원문 값을 입력하세요.', cur);
        if (v == null) return;
        if (kind === 'field') setManual(key, v); else ST.inline[key] = v;
        save(); prRender();
      };
    });
  }

  function prOpen() {
    if (!product()) { alert('먼저 상품을 선택하세요.'); return; }
    var miss = missing();
    if (miss.length && !confirm('확인필요 항목이 ' + miss.length + '건 남아 있습니다.\n그대로 읽으면 부정확한 설명으로 감점될 수 있습니다.\n\n계속 진행하시겠습니까?')) return;
    PR.on = true; PR.i = 0;
    $('#prompter').classList.add('on');
    document.body.style.overflow = 'hidden';
    prRender();
  }
  function prClose() {
    PR.on = false;
    $('#prompter').classList.remove('on');
    document.body.style.overflow = '';
    renderAll();
  }

  /* ============================================================
     타이머
     ============================================================ */
  function limitMin() { return ST.baseSheet === 'irp' ? 50 : 70; }
  function tick() {
    var ms = ST.timer.acc + (ST.timer.running ? Date.now() - ST.timer.base : 0);
    var s = Math.floor(ms / 1000);
    var txt = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    var lim = limitMin() * 60;
    var cls = 'timer' + (s > lim ? ' over' : (s > lim * 0.85 ? ' warn' : ''));
    ['#timer', '#timer2'].forEach(function (sel) {
      var el = $(sel);
      if (el) { el.textContent = txt; el.className = cls; el.title = '상담시간 기준 ' + limitMin() + '분'; }
    });
  }

  /* ============================================================
     초기화
     ============================================================ */
  function renderAll() {
    renderSide(); renderTabs(); renderView(); tick();
  }

  function init() {
    loadCustom();
    loadDocs();
    loadCommon();
    load();
    if (!ST.productId) {
      var l = catalog();
      ST.productId = l.length ? l[0].id : null;
    }
    renderAll();

    $('#btnPrompter').onclick = prOpen;
    $('#btnExitPr').onclick = prClose;
    $('#prPrev').onclick = function () { PR.i--; prRender(); };
    $('#prNext').onclick = function () { PR.i++; prRender(); };
    $('#btnPrint').onclick = function () { ST.tab = 'script'; renderView(); renderTabs(); setTimeout(function () { window.print(); }, 60); };
    $('#btnTimer').onclick = function () {
      if (ST.timer.running) {
        ST.timer.acc += Date.now() - ST.timer.base; ST.timer.running = false;
        this.textContent = '계속';
      } else {
        ST.timer.base = Date.now(); ST.timer.running = true;
        this.textContent = '일시정지';
      }
      tick();
    };
    setInterval(tick, 1000);

    document.addEventListener('keydown', function (e) {
      if (!PR.on) return;
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); if (PR.i < prList().length - 1) { PR.i++; prRender(); } }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (PR.i > 0) { PR.i--; prRender(); } }
      else if (e.key === 'Escape') prClose();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
