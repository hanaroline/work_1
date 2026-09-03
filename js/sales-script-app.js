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
  var LS_MKT = 'ss_market_v1';      /* 펀드 완전판매자료 (증시전망) — 그 달의 자료 하나 */

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
    /**
     * IRP 는 「편입 펀드」 를 설명하는 시트다. 상품 목록도 펀드 카탈로그를 그대로 쓴다.
     * 그런데 여기서 fund 만 보고 있어서, IRP 시트에서는 카탈로그·판독 결과가 하나도
     * 붙지 않았다 — 펀드 시트에서 채워지는 투자대상·투자전략·계약기간·주요위험·
     * 환매수수료·기준가 적용일이 IRP 에서는 전부 확인필요로 남았다.
     */
    if (cat === 'fund' || cat === 'irp') return fundCollectedDoc();
    /* 채권은 설명서가 종목마다 따로 있지 않다 — 회사가 내려 주는 장외채권 목록이
       설명서 구실을 한다 (표준코드·발행일·만기일·위험등급·매매단가·세후수익률). */
    if (cat === 'bondKrw') {
      var b = bondCatByCode(pid);
      return b ? bondCatDoc(b) : null;
    }
    if (cat === 'bondFx') {
      var x = bondFxByCode(pid);
      return x ? bondFxDoc(x) : null;
    }
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
  /* ----------------------------------------------------------
     공모펀드 카탈로그 (data/fund-catalog.js · 3,192건)
     금융투자협회 전자공시와 대조된 수집분이다. 명칭·운용사·유형·위험등급·클래스별
     총보수·1년 수익률·동종유형 평균·매입환매 기준일·투자목적과 투자설명서 PDF 주소가
     들어 있다. ELS 가 회차로 붙는 것처럼 펀드는 표준코드로 붙는다.
     ---------------------------------------------------------- */
  function fundCat() {
    var C = window.FUND_CATALOG;
    if (!C || !C.items) return null;
    /**
     * 운용사·유형·지역·위험등급명·투자목적은 파일에 번호로 담겨 있다 —
     * 같은 문구를 3,192번 반복하면 그것만 1.3MB 라 pool 에 한 번만 담는다.
     * 여기서 한 번에 되살려 두면 아래 코드는 예전처럼 문자열만 본다.
     */
    if (C.pool && !C.hydrated) {
      var keys = C.pooled || [];
      C.items.forEach(function (x) {
        keys.forEach(function (k) {
          if (typeof x[k] === 'number') x[k] = C.pool[x[k]];
        });
      });
      C.hydrated = true;
    }
    return C;
  }
  var FUND_BY_CODE = null;
  function fundCatByCode(code) {
    var C = fundCat();
    if (!C || !code) return null;
    if (!FUND_BY_CODE) {
      FUND_BY_CODE = {};
      C.items.forEach(function (x) { FUND_BY_CODE[x.code] = x; });
    }
    return FUND_BY_CODE[code] || null;
  }
  /** 명칭으로 찾는다 — 공백·괄호를 지운 뒤 부분일치 */
  function fundCatByName(name) {
    var C = fundCat();
    if (!C || !name) return null;
    var norm = function (x) { return String(x).replace(/[\s()\[\]·\-]/g, ''); };
    var t = norm(name), hit = null;
    for (var i = 0; i < C.items.length; i++) {
      var k = norm(C.items[i].name);
      if (k === t) return C.items[i];
      if (!hit && (k.indexOf(t) >= 0 || t.indexOf(k) >= 0)) hit = C.items[i];
    }
    return hit;
  }
  /** 투자설명서 PDF 주소를 되살린다 (카탈로그는 일련번호만 담는다) */
  function fundDocUrl(it, kind) {
    var C = fundCat();
    var key = kind === 'G' ? it.docG : it.docT;
    if (!C || !C.docBase || !key) return null;
    return C.docBase + it.code + '/' + it.code + '_' + kind + '_' + key + '.pdf';
  }
  /** 카탈로그 항목 -> 상품 목록에 쓰는 형태 */
  function fundCatProduct(it) {
    return {
      id: it.code, name: it.name, mgr: it.mgr || '', fundType: it.fundType || '',
      riskGrade: it.riskGrade || null, riskLabel: it.riskLabel || '',
      overseas: it.region !== 'domestic', fromCatalog: true
    };
  }
  /**
   * 카탈로그 항목 -> 등록된 투자설명서 형태.
   * 원천에 없는 값은 담지 않아 화면에서 「확인필요」로 남는다.
   */
  function fundCatDoc(it) {
    var f = {};
    var put = function (k, v) { if (v != null && v !== '') f[k] = v; };
    put('name', it.name);
    put('mgr', it.mgr);
    put('fundType', it.fundType);
    put('riskGrade', it.riskGrade != null ? String(it.riskGrade) : null);
    put('riskLabel', it.riskLabel);
    put('targets', it.objective);
    /* 모자형·재간접형은 합성 총보수·비용이 인정 기준인데 수집분에는 총보수만 있다.
       낮은 값을 말하게 되므로 카탈로그에서 채우지 않는다(빌더가 이미 비워 둔다). */
    put('clsAExp', it.clsAExp != null ? String(it.clsAExp) : null);
    put('clsCExp', it.clsCExp != null ? String(it.clsCExp) : null);
    put('ret1y', it.ret1y != null ? it.ret1y.toFixed(2) + '%' : null);
    put('retPeer', it.peerRet1y != null ? it.peerRet1y.toFixed(2) + '%' : null);
    /* terms 는 [기준시각, 매입前, 매입後, 환매前, 환매後, 지급前, 지급後] (D+N) 이다.
       기준시각 "5:00" 은 오후 5시, D+N 은 제(N+1)영업일이다
       (검산: 피델리티글로벌테크놀로지 D+2 -> 투자설명서 「제3영업일」) */
    var t = it.terms;
    if (t && t.length) {
      if (t[0]) {
        var hm = String(t[0]).split(':');
        put('buyCut', '오후 ' + (+hm[0]) + '시' + (+hm[1] ? ' ' + (+hm[1]) + '분' : ''));
      }
      var biz = function (n) { return n == null ? null : '제' + (n + 1) + '영업일'; };
      put('buyBefore', biz(t[1]));
      put('buyAfter', biz(t[2]));
      put('redBefore', biz(t[3]));
      put('redAfter', biz(t[4]));
      put('redPay', biz(t[5]));
    }
    put('docDate', it.docAt ? D.fmt.kdate(it.docAt) || it.docAt : null);
    /**
     * 투자설명서에만 있는 항목(보수·수수료, 환매수수료, 계약기간, 투자전략, 주요 투자위험,
     * VaR, 유동성위험, 환헤지)을 미리 판독해 둔 결과에서 채운다.
     * 브라우저는 다른 도메인의 PDF 를 앱이 직접 읽지 못하고, 이 도구는 인터넷이 없는
     * 업무용PC 에서 쓴다 — 그래서 ELS 와 같이 판독은 러너에서 미리 해 둔다.
     */
    var FP = window.FUND_PROSPECTUS;
    var ex = (FP && FP.items && FP.items[it.code]) || null;
    if (ex) {
      /* 값은 pool 에 한 번만 담고 항목은 번호로 가리킨다 (문구가 펀드마다 겹친다) */
      var pl = FP.pool;
      Object.keys(ex).forEach(function (k) {
        var v = ex[k];
        put(k, (pl && typeof v === 'number') ? pl[v] : v);
      });
    }
    return {
      source: 'COLLECT',
      docName: it.name + ' (공모펀드 수집분)',
      docUrl: fundDocUrl(it, 'T') || fundDocUrl(it, 'G') || '',
      registeredAt: (fundCat() || {}).updatedAt || '',
      fields: f, schedule: [], matBarrier: null, knockIn: '', rawText: '',
      collected: true, catalogCode: it.code
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
    if (!p) return null;
    /* 표준코드로 붙는 카탈로그가 먼저다 — 명칭 부분일치보다 정확하다 */
    var c = fundCatByCode(p.id) || fundCatByName(p.name);
    if (c) return fundCatDoc(c);
    var hit = fundCollectedByName(p.name);
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
  /* ----------------------------------------------------------
     펀드 완전판매자료 (증시전망)
     ------------------------------------------------------------
     투자설명서가 아니라 지점에 내려오는 월간 자료다. 상품마다 다른 값이 아니라
     그 달의 자료 하나가 모든 펀드에 쓰이므로, 상품별(DOCS)이 아니라 한 번만
     등록해 두고 모든 펀드에서 함께 쓴다. 자료가 바뀌면 다시 올리면 된다.
     ---------------------------------------------------------- */
  var MKT = {};
  function loadMkt() {
    try {
      var o = JSON.parse(localStorage.getItem(LS_MKT) || '{}');
      MKT = (o && typeof o === 'object') ? o : {};
    } catch (e) { MKT = {}; }
  }
  function saveMkt() {
    try { localStorage.setItem(LS_MKT, JSON.stringify(MKT)); } catch (e) { /* 저장 불가 환경 */ }
  }
  /**
   * 자료의 상품표에서 지금 고른 펀드의 행을 찾는다.
   * 자료의 펀드명은 클래스까지 붙어 있고(「… 종류 A」 「…ClassA」) 카탈로그 명칭과
   * 띄어쓰기도 다르다. 그래서 공백·괄호·클래스 꼬리를 지운 뒤 서로 품고 있는지 본다.
   */
  function mktKey(s) {
    return String(s || '')
      /* 클래스 꼬리를 뗀다 — 자료는 「종류 A」 「ClassA」 「(A)」 「A 형」 을 섞어 쓴다.
         (H)·(UH)·(모)·(USD)·_운용 은 클래스가 아니라 상품 구분이라 남긴다. */
      .replace(/\s*(?:종류|클래스|Class)\s*[A-Za-z0-9-]*\s*형?\s*$/i, '')
      .replace(/\s*[([]\s*(?!H\b|UH\b|USD|모|운용)[A-Za-z][A-Za-z0-9-]{0,3}\s*[)\]]\s*$/, '')
      .replace(/\s*[A-Za-z][A-Za-z0-9-]{0,3}\s*형\s*$/, '')
      /* 법적 형태 — 자료는 「…테크놀로지자(주식-재간접)」 로 줄여 쓰고
         카탈로그는 「…테크놀로지증권자투자신탁(주식-재간접형)」 로 다 쓴다 */
      .replace(/증권|투자신탁|투자회사/g, '')
      .replace(/[자모](?=\s*[([]|\s*$)/g, '')
      .replace(/[\s()[\]·ㆍ\-_]/g, '')
      .replace(/형$/, '');
  }
  function mktRow() {
    var rows = MKT.rows;
    if (!rows || !rows.length) return null;
    var want = mktKey(valueOf('name'));
    if (want.length < 4) return null;
    for (var i = 0; i < rows.length; i++) {
      var k = mktKey(rows[i].name);
      if (k && (k === want || k.indexOf(want) >= 0 || want.indexOf(k) >= 0)) return rows[i];
    }
    return null;
  }
  /**
   * 「직전월 이후 발간」 인지 본다 — 평가에서 최신자료로 인정되는 기준이다.
   * (예: 2026.9 조사 → 2026.8.1 이후 발간 자료만 인정)
   */
  function mktFresh() {
    var m = String(MKT.mktAsOf || '').match(/(\d{4})\s*년\s*(\d{1,2})\s*월/);
    if (!m) return null;
    var now = new Date();
    var cur = now.getFullYear() * 12 + now.getMonth();          /* 0-based 월 */
    var doc = (+m[1]) * 12 + (+m[2]) - 1;
    return cur - doc <= 1;      /* 이번 달 또는 지난 달이면 최신 */
  }
  /* 자료에서 읽은 결과 (등록 전 확인용) */
  var MKT_READ = null;
  var MKT_DEFS = [
    { id: 'mktAsOf', label: '자료 기준월', ph: '예) 2026년 9월', hint: '평가에서는 직전월 이후 발간 자료만 최신자료로 인정합니다' },
    { id: 'mktBaseDate', label: '수익률·보수 기준일', ph: '예) 2026년 8월 25일', hint: '표의 「기준일」 — 수치를 말할 때 함께 밝히면 좋습니다' },
    /**
     * 증시전망 요약은 비워 두는 것이 낫다. 자료의 「글로벌 시황」 은 미국·한국·중국·
     * 채권을 각각 한 단락으로 적어 두고, 화면은 고른 펀드에 맞는 단락을 골라 읽는다.
     * 여기에 적으면 그것이 모든 펀드에 그대로 쓰이므로, 고칠 때만 쓴다.
     */
    { id: 'mktView', label: '증시전망 요약 (비워 두면 펀드에 맞는 단락을 자동으로 고릅니다)', rows: 4, ph: '자동 선택을 쓰지 않고 직접 적으려면 여기에', hint: '창구에서 그대로 읽는 문장입니다' },
    { id: 'mktProfileMap', label: '투자자 성향별 적합 위험등급', rows: 1, ph: '예) 성장형,성장추구형,위험중립형,안정추구형,안정형|1,2,3,4,5,6', hint: '자료의 매핑 표 — 성향과 등급이 맞는지 확인하는 데 씁니다' }
  ];
  var COMMON_DEFS = [
    { id: 'riskNote1', label: '1등급 매우높은위험 — 유의사항', hint: 'ELS/DLS 는 투자설명서 「목표시장」 원문 문구가 우선 적용됩니다. 이 값은 투자설명서가 없을 때 쓰는 기본값(위험선호형)입니다' },
    { id: 'riskNote2', label: '2등급 높은위험 — 유의사항', hint: '평가표 탁월사례에서 확인된 문구가 기본값으로 들어가 있습니다' },
    { id: 'riskNote3', label: '3등급 다소높은위험 — 유의사항', hint: '위험선호형(1·2·3등급) 기본 문구 — 사내 핵심(요약)설명서 문구가 있으면 덮어쓰세요' },
    { id: 'riskNote4', label: '4등급 보통위험 — 유의사항', hint: '위험중립형(4등급) 기본 문구 — 사내 핵심(요약)설명서 문구가 있으면 덮어쓰세요' },
    { id: 'riskNote5', label: '5등급 낮은위험 — 유의사항', hint: '채권 평가표 탁월사례에서 확인된 문구가 기본값으로 들어가 있습니다' },
    { id: 'riskNote6', label: '6등급 매우낮은위험 — 유의사항', hint: '위험회피형(5·6등급) 중 안정형 기본 문구 — 사내 핵심(요약)설명서 문구가 있으면 덮어쓰세요' },
    { id: 'riskGradeBasis', only: 'bond', label: '위험등급 분류 근거 (채권)', hint: '예) 국내 신용평가사 회사채 신용등급 AA-~AAA 를 5등급 낮은위험으로 분류' },
    /**
     * 개인형 IRP 계좌 조건 — 상품이 아니라 계좌의 조건이라 어느 펀드를 고르든 같다.
     * 한 번 등록하면 모든 IRP 상담에서 그대로 쓰인다.
     */
    { id: 'irpFeeKinds', only: 'irp', label: 'IRP 수수료 종류', hint: '예) 운용관리수수료 · 자산관리수수료 — 개인형IRP 설명서 「수수료」 항목' },
    { id: 'irpFeeTotal', only: 'irp', label: 'IRP 총수수료율', hint: '예) 연 0.00% (당사 개인형IRP 수수료 면제) — 사내 기준으로 채우십시오' },
    { id: 'irpFeeMethod', only: 'irp', label: 'IRP 수수료 부과방식', hint: '예) 매 분기말 적립금 평균잔액에 요율을 적용하여 후취' },
    { id: 'irpProducts', only: 'irp', label: 'IRP 운용 가능한 상품', hint: '예) 원리금보장형 예금·ELB, 펀드, ETF, 리츠 등 — 구체적 유형까지 말해야 인정' },
    { id: 'irpDefaultOpt', only: 'irp', label: 'IRP 디폴트옵션 상품', hint: '당사가 승인받은 사전지정운용방법 상품 — 퇴직연금 디폴트옵션 안내장 기준' },
    /* 세법으로 정해진 값 — 기본값이 들어가 있고, 세법이 바뀌면 여기서 덮어쓴다 */
    { id: 'irpTaxLimit', only: 'irp', label: 'IRP 세액공제 한도 (세법 변경 시 수정)', hint: '기본값: 연금저축 합산 연 900만원 (연금저축만 납입 시 600만원 한도)' },
    { id: 'irpTaxRate', only: 'irp', label: 'IRP 세액공제율 (세법 변경 시 수정)', hint: '기본값: 총급여 5,500만원 이하 16.5% / 초과 13.2% (지방소득세 포함)' },
    { id: 'irpTaxRateOut', only: 'irp', label: 'IRP 법정사유 중도인출 세율 (세법 변경 시 수정)', hint: '기본값: 연금소득세 3.3~5.5% (지방소득세 포함, 분리과세)' },
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
  var FUND_LIST_CACHE = {};
  /**
   * 펀드·IRP 목록은 수집한 공모펀드 카탈로그 전체를 쓴다 (국내 1,511 · 해외 1,681).
   * ELS 가 청약 중인 회차를 전부 보여 주는 것과 같아야 한다 — 예전에는 두 글자 이상
   * 검색해야 나왔고, 검색하지 않으면 예시 상품 넷만 보였다.
   * 내장 예시는 카탈로그가 없을 때의 대비로만 남긴다 (예시 값은 상담에 쓸 수 없다).
   */
  function fundList(cat, overseas) {
    var key = cat + '|' + overseas;
    if (FUND_LIST_CACHE[key]) return FUND_LIST_CACHE[key];
    var C = fundCat();
    if (!C) return null;
    var out = [];
    for (var i = 0; i < C.items.length; i++) {
      var it = C.items[i];
      if (cat === 'fund' && (it.region !== 'domestic') !== !!overseas) continue;
      out.push(fundCatProduct(it));
    }
    /* 가나다순 — 목록이 천 단위라 순서가 예측 가능해야 눈으로 찾을 수 있다 */
    out.sort(function (a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0); });
    FUND_LIST_CACHE[key] = out;
    return out;
  }
  /* ----------------------------------------------------------
     장외채권 카탈로그 (data/bond-catalog.js)
     ------------------------------------------------------------
     미래에셋증권 장외채권 화면에서 매일 받아 둔 판매 종목이다. 종목마다
     표준코드(ISIN)·종목명·종류·발행사·위험등급·발행일·만기일과, 그날의
     매수금리·은행환산수익률·세후투자수익률·매매단가가 들어 있다.
     펀드가 표준코드로 붙는 것처럼 채권도 표준코드로 붙는다.
     ---------------------------------------------------------- */
  function bondCat() {
    var C = window.BOND_CATALOG;
    return (C && C.krw) ? C : null;
  }
  /**
   * 장외채권 화면에 적힌 유의사항 원문에서 필요한 문장을 골라 낸다.
   * 낱말을 우리가 짓지 않고 회사 문장을 그대로 쓴다 — 규정 문구는
   * 고쳐 쓰면 그 자체로 미설명·부정확 설명이 된다.
   */
  var BOND_NOTICE = null;
  function bondNotice() {
    if (BOND_NOTICE) return BOND_NOTICE;
    var C = bondCat(), list = (C && C.notice) || [];
    var pick = function (re) {
      for (var i = 0; i < list.length; i++) if (re.test(list[i])) return list[i];
      return '';
    };
    BOND_NOTICE = {
      all: list,
      sell: pick(/중도\s*매도/),
      unsecured: pick(/무보증사채/),
      noDeposit: pick(/예금자보호/),
      call: pick(/콜옵션/)
    };
    /* 중도매도 문장은 「가능하다」 는 말 없이 가격만 설명한다 — 앞머리를 붙여
       평가 항목(중도매도 가능 여부)의 답이 되게 한다. 뒷문장은 원문 그대로다. */
    if (BOND_NOTICE.sell) BOND_NOTICE.sell = '중도매도 가능 — ' + BOND_NOTICE.sell;
    return BOND_NOTICE;
  }
  var BOND_BY_CODE = null;
  function bondCatByCode(code) {
    var C = bondCat();
    if (!C || !code) return null;
    if (!BOND_BY_CODE) {
      BOND_BY_CODE = {};
      C.krw.forEach(function (x) { BOND_BY_CODE[x.code] = x; });
    }
    return BOND_BY_CODE[code] || null;
  }
  /** 카탈로그 항목 -> 상품 목록에 쓰는 형태 */
  function bondCatProduct(it) {
    return {
      id: it.code, name: it.name,
      kind: it.kind || '', issuer: it.issuer || '',
      riskGrade: it.riskGrade || null, riskLabel: it.riskLabel || '',
      fromCatalog: true
    };
  }
  /**
   * 카탈로그 항목 -> 등록된 설명서 형태.
   * 세후 투자수익률은 회사가 계산해 내려 준 값이라 앱이 다시 계산하지 않는다.
   * 원천에 없는 값(민평금리·민평단가·발행회사 재무정보·신용등급)은 담지 않아
   * 화면에서 「확인필요」로 남는다.
   */
  function bondCatDoc(it) {
    var f = {};
    var put = function (k, v) { if (v != null && v !== '') f[k] = v; };
    put('name', it.name);
    put('kind', it.kind);
    put('issuer', it.issuer);
    put('riskGrade', it.riskGrade != null ? String(it.riskGrade) : null);
    put('riskLabel', it.riskLabel);
    put('issueDate', it.issueDate ? (D.fmt.kdate(it.issueDate) || it.issueDate) : null);
    put('matDate', it.matDate ? (D.fmt.kdate(it.matDate) || it.matDate) : null);
    /* 표면금리는 「연」 을 붙여 말해야 인정된다 — 값에 붙여 둔다.
       종목명에 금리가 박힌 국고채만 읽어낼 수 있고(01500 → 연 1.500%),
       나머지는 원천에 없어 확인필요로 남는다. */
    put('coupon', it.coupon != null ? '연 ' + it.coupon.toFixed(3) + '%' : null);
    /* 종목 상세 화면에서 받은 값 — 이자지급유형·주기·신용등급 */
    put('payType', it.payType);
    /* 복리채·할인채는 만기에 한 번 주므로 주기가 없다 — 빈칸이 아니라 답이다.
       확인필요로 남겨 두면 창구가 없는 값을 찾아 헤맨다. */
    put('payCycle', it.payCycle != null ? it.payCycle + '개월'
      : (it.payAtMaturity ? '해당 없음 (만기에 원리금을 한 번에 지급)' : null));
    put('payRate', it.payRate != null ? '연 ' + it.payRate + '%' : null);
    if (it.credit) put('credit', it.credit);
    put('fee', it.fee);
    put('minAmt', it.minAmt);
    /* 매매단가와 세후수익률 — 창구가 손으로 넣던 값이다 */
    put('tradePrice', it.tradePrice != null ? it.tradePrice.toLocaleString() + '원' : null);
    put('ytm', it.ytmNetPct != null ? '연 ' + it.ytmNetPct + '% (세후, 회사 제시)' : null);
    /* 국채는 국가가 원리금을 상환한다 — 국채법상 정해진 사실이다.
       신용등급은 담지 않는다. 국고채·국민주택채권에는 신용평가사 등급이
       따로 없어, 「AAA(국가)」 같은 표기는 내가 지어낸 값이 된다. */
    if (it.kind === '국채') put('guarantee', '대한민국 정부가 원리금을 상환하는 국채');
    /* 중도매도는 장외채권 전체에 걸리는 조건이다 — 회사 화면의 문장을
       그대로 옮긴다. 문장을 우리가 짓지 않는다.
       「무보증사채는 …」 문구는 채우지 않는다. 그 문장은 조건문이라
       이 종목이 무보증사채라고 말해 주지 않는다 — 종목별 보증 여부는
       설명서를 봐야 하므로 확인필요로 남기고, 원문만 옆에 띄운다. */
    var N = bondNotice();
    if (N.sell) put('sellable', N.sell);
    return {
      source: 'COLLECT',
      docName: it.name + ' (장외채권 수집분)',
      docUrl: (bondCat() || {}).listUrl || '',
      registeredAt: (bondCat() || {}).updatedAt || '',
      fields: f, schedule: [], matBarrier: null, knockIn: '', rawText: '',
      collected: true, bondCode: it.code
    };
  }
  /** 상품 목록 — 잔존만기가 짧은 것부터 (창구에서 그렇게 찾는다) */
  var BOND_LIST_CACHE = null;
  function bondList() {
    var C = bondCat();
    if (!C) return null;
    if (BOND_LIST_CACHE) return BOND_LIST_CACHE;
    BOND_LIST_CACHE = C.krw.slice()
      .sort(function (a, b) { return String(a.matDate || '').localeCompare(String(b.matDate || '')); })
      .map(bondCatProduct);
    return BOND_LIST_CACHE;
  }

  /* 외화채권은 개별 종목 시세가 로그인 뒤에 있어 목록을 받을 수 없다.
     대신 회사가 공개한 「유형」 표(통화·매매방식·국제신용등급·과세·잔존만기)를
     상품 목록으로 쓴다 — 유형을 고르면 발행통화·종류·국제신용등급·과세가 채워진다.
     종목명·표면금리·발행일·만기일은 창구가 넣어야 한다. */
  var BOND_FX_CACHE = null;
  function bondFxList() {
    var C = bondCat();
    if (!C || !C.fxTypes || !C.fxTypes.length) return null;
    if (BOND_FX_CACHE) return BOND_FX_CACHE;
    BOND_FX_CACHE = C.fxTypes.map(function (t, i) {
      return {
        id: 'fx' + (i + 1),
        name: (t.ccy || t.country || '') + ' ' + (t.kind || ''),
        kind: t.kind || '', ccy: t.ccy || '', fxType: t, fromCatalog: true
      };
    });
    return BOND_FX_CACHE;
  }
  function bondFxByCode(code) {
    var l = bondFxList();
    if (!l) return null;
    for (var i = 0; i < l.length; i++) if (l[i].id === code) return l[i];
    return null;
  }
  function bondFxDoc(it) {
    var t = it.fxType || {}, f = {};
    var put = function (k, v) { if (v != null && v !== '') f[k] = v; };
    put('kind', t.kind);
    put('ccy', t.ccy);
    put('credit', t.credit);
    put('tax', t.tax);
    return {
      source: 'COLLECT',
      docName: '외화채권 유형 안내 — ' + it.name,
      docUrl: (bondCat() || {}).fxUrl || '',
      registeredAt: (bondCat() || {}).updatedAt || '',
      fields: f, schedule: [], matBarrier: null, knockIn: '', rawText: '',
      collected: true, fxType: t
    };
  }

  function catalog() {
    var sh = sheet();
    var mine = CUSTOM[sh.cat] || [];
    if (sh.cat === 'fund' || sh.cat === 'irp') {
      var fl = fundList(sh.cat, sh.overseas);
      if (fl) return mine.concat(fl);
    }
    if (sh.cat === 'bondKrw') {
      var bl = bondList();
      if (bl) return mine.concat(bl);
    }
    if (sh.cat === 'bondFx') {
      var xl = bondFxList();
      if (xl) return mine.concat(xl);
    }
    var list = mine.concat(D.catalog[sh.cat] || []);
    if (sh.cat !== 'fund') return list;
    var want = !!sh.overseas;
    var f = list.filter(function (p) { return !!p.overseas === want; });
    return f.length ? f : list;
  }
  function product() {
    var l = catalog();
    for (var i = 0; i < l.length; i++) if (l[i].id === ST.productId) return l[i];
    /* 검색으로 고른 카탈로그 펀드는 기본 목록에 없다 */
    var sh = sheet();
    if (sh.cat === 'fund' || sh.cat === 'irp') {
      var c = fundCatByCode(ST.productId);
      if (c) return fundCatProduct(c);
    }
    if (sh.cat === 'bondKrw') {
      var b = bondCatByCode(ST.productId);
      if (b) return bondCatProduct(b);
    }
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

  /* ----------------------------------------------------------
     영업일 달력
     「이해를 돕기 위한 추가 설명 — 달력 활용」 항목은 오늘을 기준으로 기준가 적용일과
     환매대금 지급일의 실제 날짜를 말해야 한다. 주말과 날짜가 고정된 공휴일은 반영하지만
     설·추석·대체공휴일은 해마다 달라 담지 않았다 — 연휴가 끼는 주에는 달력으로 확인해야
     한다(해당 항목 tips 에 적어 두었다).
     ---------------------------------------------------------- */
  var KR_FIXED_HOLIDAY = ['01-01', '03-01', '05-05', '06-06', '08-15', '10-03', '10-09', '12-25'];
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  function isBizDay(d) {
    var w = d.getDay();
    if (w === 0 || w === 6) return false;
    var md = ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    return KR_FIXED_HOLIDAY.indexOf(md) < 0;
  }
  /** 기준일로부터 n 영업일 뒤 */
  function bizDaysAfter(from, n) {
    var d = new Date(from.getTime()), left = n;
    while (left > 0) { d.setDate(d.getDate() + 1); if (isBizDay(d)) left--; }
    return d;
  }
  function kDateDow(d) {
    return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일(' + DOW[d.getDay()] + ')';
  }
  /** '제3영업일' → 3 */
  function bizNo(v) {
    var m = String(v == null ? '' : v).match(/(\d+)\s*영업일/);
    return m ? Number(m[1]) : null;
  }
  /** 「제N영업일」 항목을 오늘 기준 실제 날짜로 (제N영업일 = 청구일 + (N-1) 영업일) */
  function bizDateOf(fieldId) {
    var n = bizNo(valueOf(fieldId));
    if (!n || n < 1) return undefined;
    return kDateDow(bizDaysAfter(new Date(), n - 1));
  }

  /**
   * 조사를 앞말 종성에 맞춰 고른다 — 「반도체를 / 미국 반도체을」 처럼 틀리면
   * 창구에서 읽을 때 바로 들킨다. 한글 음절은 (코드−0xAC00)%28 이 0 이면 종성이 없다.
   */
  function josa(word, withJong, withoutJong) {
    var s = String(word || '').replace(/[\s)\]]+$/, '');
    var c = s.charCodeAt(s.length - 1);
    if (!(c >= 0xAC00 && c <= 0xD7A3)) return withoutJong;   /* 한글이 아니면 기본형 */
    return ((c - 0xAC00) % 28) ? withJong : withoutJong;
  }
  /**
   * 서술 문단의 첫 문장만. 「(1) 당해 투자신탁의 투자전략 및 기본방침」 같은
   * 번호·소제목 조각을 떼고, 문장 하나로 끊어 준다 (잘린 문장을 읽히지 않는다).
   */
  function firstClause(v) {
    var s = String(v || '')
      .replace(/^\s*(?:\(\d+\)|\d+\s*[.)]|[가-힣]\s*\.)\s*/, '')
      .replace(/^(?:당해|이)?\s*(?:투자신탁|집합투자기구|펀드)의?\s*(?:투자|운용)\s*전략(?:\s*및\s*기본방침)?\s*/, '')
      /* 주어는 앞 문장에서 이미 밝혔다 — 「…펀드로 이 투자신탁은」 처럼 겹치지 않게 뗀다 */
      .replace(/^이\s*(?:투자신탁|집합투자기구|펀드)은?는?\s*/, '')
      .replace(/\s+/g, ' ').trim();
    if (!s) return null;
    var m = /^(.{15,180}?[.。])\s/.exec(s + ' ');
    var out = m ? m[1] : s.slice(0, 150);
    return out.length >= 15 ? out : null;
  }
  /**
   * 종결형 문장을 뒤에 말을 이을 수 있는 꼴로 바꾼다 —
   * 「…에 투자합니다.」 -> 「…에 투자하며,」
   * 바꿀 수 있는 꼴이 아니면 null 을 낸다. 억지로 이으면 읽을 수 없는 문장이 되므로,
   * 그때는 이 조각을 아예 쓰지 않는 것이 낫다.
   */
  function connective(v) {
    if (!v) return null;
    var s = String(v).trim().replace(/[.。]\s*$/, '');
    var MAP = [[/있습니다$/, '있으며'], [/없습니다$/, '없으며'], [/됩니다$/, '되며'],
      [/입니다$/, '이며'], [/합니다$/, '하며'], [/습니다$/, '으며']];
    for (var i = 0; i < MAP.length; i++) {
      if (MAP[i][0].test(s)) return s.replace(MAP[i][0], MAP[i][1]) + ',';
    }
    return null;
  }
  /** 「연 3.75%」 「3,750원」 처럼 적힌 값에서 숫자만 뽑는다 */
  function numOf(v) {
    if (v == null || v === '') return null;
    var n = parseFloat(String(v).replace(/,/g, '').replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : null;
  }
  /* ----------------------------------------------------------
     금리변동에 따른 채권 손익 예시
     ------------------------------------------------------------
     채권가격은 표면금리·잔존만기·시장금리만 있으면 정확히 계산된다 —
       가격 = Σ (표면금리/m) / (1+y/m)^k  +  액면 / (1+y/m)^(연수×m)
     m 은 연간 이자지급 횟수(이자지급주기에서 낸다), 액면은 10,000원으로 둔다.

     기준 시장금리는 민평금리가 있으면 그것을, 없으면 표면금리를 쓴다.
     표면금리를 쓰면 기준가격이 액면가와 같아져 설명이 오히려 또렷해진다
     (「표면금리와 시장금리가 같으면 액면가, 금리가 오르면 가격이 내린다」).
     ---------------------------------------------------------- */
  var BOND_FACE = 10000;
  function bondPrice(couponPct, yieldPct, years, m) {
    var c = BOND_FACE * (couponPct / 100) / m;   /* 회당 이자 */
    var i = (yieldPct / 100) / m;                /* 회당 할인율 */
    var n = Math.max(1, Math.round(years * m));
    var pv = 0;
    for (var k = 1; k <= n; k++) pv += c / Math.pow(1 + i, k);
    return pv + BOND_FACE / Math.pow(1 + i, n);
  }
  function bondRateExample() {
    if (sheet().cat !== 'bondKrw' && sheet().cat !== 'bondFx') return null;
    var cp = numOf(valueOf('coupon'));
    if (cp == null) return null;
    /* 잔존만기 — 만기일이 있으면 오늘까지로 재고, 없으면 예시를 만들지 않는다 */
    var md = String(valueOf('matDate') || '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
    if (!md) return null;
    var years = (new Date(+md[1], +md[2] - 1, +md[3]) - new Date()) / (365.25 * 24 * 3600 * 1000);
    if (!(years > 0.1)) return null;
    /* 이자지급주기 「3개월」 → 연 4회. 없으면 연 2회(국고채 관행)로 둔다 */
    var pc = numOf(valueOf('payCycle'));
    var m = (pc && pc >= 1 && pc <= 12) ? Math.round(12 / pc) : 2;
    var base = numOf(valueOf('mpRate'));
    if (base == null) base = cp;
    var STEP = 0.5;
    var p0 = bondPrice(cp, base, years, m);
    var pUp = bondPrice(cp, base + STEP, years, m);
    var pDn = bondPrice(cp, base - STEP, years, m);
    var won = function (x) { return Math.round(x).toLocaleString() + '원'; };
    var pnl = function (x) { return (x >= 0 ? '+' : '−') + Math.abs(Math.round(x)).toLocaleString() + '원'; };
    var pct = function (x) { return (x >= 0 ? '+' : '−') + Math.abs(Math.round(x / p0 * 10000) / 100) + '%'; };
    var yr = Math.round(years * 10) / 10;
    return {
      exMat: yr + '년', exCoupon: '표면금리 연 ' + cp + '%',
      exBase: '연 ' + (Math.round(base * 100) / 100) + '%', exPrice: won(p0),
      exStep: STEP + '%p',
      exUp: '연 ' + (Math.round((base + STEP) * 100) / 100) + '%',
      exUpPrice: won(pUp), exUpPnl: pnl(pUp - p0), exUpPct: pct(pUp - p0),
      exDown: '연 ' + (Math.round((base - STEP) * 100) / 100) + '%',
      exDownPrice: won(pDn), exDownPnl: pnl(pDn - p0), exDownPct: pct(pDn - p0)
    };
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
      /**
       * 클래스 설명 — 이 펀드가 실제로 발행하는 클래스에 맞춰 말한다.
       *
       * 표본을 판독해 보니 「A클래스 선취판매수수료」 가 비는 가장 큰 이유는 규칙이
       * 못 읽어서가 아니라 A클래스가 없어서였다. 연금저축·퇴직연금 전용 펀드는
       * C 계열만 발행한다 (수집분 3,192건 중 A클래스 발행은 1,659건). 없는 클래스의
       * 수수료를 빈칸으로 남기면 창구에서 찾을 수 없는 값을 찾게 된다.
       */
      case 'clsIssued': {
        var dc = doc();
        var it0 = fundCatByCode((dc && dc.catalogCode) || ST.productId || '');
        /* 카탈로그로 고르지 않고 직접 등록한 상품이면 명칭으로 찾아 본다 */
        if (!it0) it0 = fundCatByName(rawValue('name') || '');
        var cl = it0 && it0.cls;
        return cl ? String(cl).split(',').join(' · ') : undefined;
      }
      case 'clsExpNote': {
        var ae = rawValue('clsAExp'), ce = rawValue('clsCExp');
        var cls0 = derived('clsIssued');
        var hasA = cls0 == null ? null : /(?:^|·)\s*A\s*(?:·|$)/.test(' ' + cls0 + ' ');
        var hasC = cls0 == null ? null : /(?:^|·)\s*C1?\s*(?:·|$)/.test(' ' + cls0 + ' ');
        if (ae && ce) return '이 펀드는 A클래스 총보수가 연 ' + ae + '%, C클래스 총보수가 연 ' + ce + '% 입니다.';
        if (ae && hasC === false) return '이 펀드는 A클래스 총보수가 연 ' + ae + '% 이며, C클래스는 발행하지 않습니다.';
        if (ce && hasA === false) {
          return '이 펀드는 선취판매수수료를 받는 A클래스를 발행하지 않고 C 계열만 있으며, ' +
            'C클래스 총보수는 연 ' + ce + '% 입니다.';
        }
        if (ae) return '이 펀드의 A클래스 총보수는 연 ' + ae + '% 입니다.';
        if (ce) return '이 펀드의 C클래스 총보수는 연 ' + ce + '% 입니다.';
        if (cls0) {
          return '이 펀드가 발행하는 클래스는 ' + cls0 + ' 이며, 클래스별 총보수는 ' +
            '투자설명서 「보수 및 수수료에 관한 사항」 에서 확인해 말씀드립니다.';
        }
        return undefined;
      }
      case 'clsFeeNote': {
        var ca = valueOf('clsA'), ae2 = rawValue('clsAExp');
        var cls1 = derived('clsIssued');
        var hasA2 = cls1 == null ? null : /(?:^|·)\s*A\s*(?:·|$)/.test(' ' + cls1 + ' ');
        if (hasA2 === false) {
          return '이 펀드는 매입·환매 시점에 일시 징구되는 선취판매수수료를 받는 A클래스를 ' +
            '발행하지 않습니다. 발행 클래스는 ' + cls1 + ' 이며, 판매수수료 대신 총보수가 ' +
            '매일 펀드 재산에서 차감됩니다.';
        }
        if (ca && ae2) return 'A클래스는 매입 시 ' + ca + ' 를 선취 판매수수료로 징수하며, 해당 펀드의 총보수는 연 ' + ae2 + '% 입니다.';
        if (ca) return 'A클래스는 매입 시 ' + ca + ' 를 선취 판매수수료로 징수합니다.';
        return undefined;
      }
      /**
       * 증시전망 — 등록해 둔 펀드 완전판매자료에서 온다 (투자설명서에는 없다).
       * 자료는 그 달에 하나이므로 모든 펀드에서 같은 값을 쓴다.
       */
      case 'mktAsOf': return MKT.mktAsOf || undefined;
      /**
       * 증시전망 — 자료의 「글로벌 시황」 은 미국·한국·중국·채권을 각각 한 단락으로
       * 적어 둔다. 평가는 「지수별·업종별·국가별·유형별 중 1가지 이상」 을 요구하므로,
       * 고른 펀드에 맞는 단락을 골라 읽는 것이 정확하고 짧다.
       * (중국주식 펀드에 미국 단락을 읽으면 「증시에 부합하는 추천」 이 되지 않는다.)
       */
      case 'mktView': {
        if (MKT.mktView) return MKT.mktView;          /* 사람이 적어 둔 것이 먼저다 */
        var ol = MKT.outlook;
        if (!ol || !ol.length) return undefined;
        var hay2 = [valueOf('name'), valueOf('fundType'), valueOf('targets'),
          valueOf('strategy'), derived('fxCountry')].join(' ');
        /* 채권형이면 채권 단락, 아니면 이름·유형에 나오는 나라의 단락 */
        var want = [];
        if (/채권/.test(String(valueOf('fundType') || '')) && !/혼합/.test(String(valueOf('fundType') || ''))) want.push('채권');
        [['미국', /미국|북미|US\b|S&P|나스닥/i], ['중국', /중국|차이나|China/i],
          ['한국', /국내|한국|코리아|Korea/i], ['일본', /일본|재팬|Japan/i],
          ['유럽', /유럽|Europe/i], ['인도', /인도|India/i],
          ['신흥국', /신흥국|이머징|Emerging/i]].forEach(function (r) {
          if (r[1].test(hay2)) want.push(r[0]);
        });
        var hits = [];
        want.forEach(function (w) {
          ol.forEach(function (o) { if (o.who === w && hits.indexOf(o) < 0) hits.push(o); });
        });
        /* 글로벌·해외 펀드는 미국 단락이 기준이 된다 — 자료가 그렇게 쓰여 있다 */
        if (!hits.length && /글로벌|해외|전세계/.test(hay2)) {
          ol.forEach(function (o) { if (o.who === '미국' || o.who === '글로벌') hits.push(o); });
        }
        /* 그래도 못 고르면 자료를 통째로 읽는다 (요건은 「1가지 이상」 이다) */
        if (!hits.length) hits = ol.slice(0, 2);
        return hits.slice(0, 2).map(function (o) { return o.text; }).join('\n');
      }
      /**
       * 수익률·보수·표준편차 — 자료의 상품표에 이 펀드 행이 있으면 그것을 쓴다.
       *
       * 이 값을 카탈로그 수집분보다 앞세우는 이유가 있다. 자료는 사내 공식 자료이고
       * A Class 기준이며(A·C 없으면 C-P), 동종유형이 제로인 소유형으로 잡혀 있어
       * 평가에서 인정하는 「동종유형」 정의와 맞는다. 재간접·자펀드는 합성총보수를
       * 설명해야 하는데 그 값도 표에 있다.
       */
      case 'ret1y': {
        var r1 = mktRow();
        return r1 ? r1.ret1y + '%' : undefined;
      }
      case 'retPeer': {
        var r2 = mktRow();
        return r2 ? r2.ret1yPeer + '%' : undefined;
      }
      case 'clsAExp': {
        var r3 = mktRow();
        if (!r3) return undefined;
        /* 재간접·모자형은 합성총보수가 인정 기준이다 — 자료 주석도 그렇게 적고 있다 */
        var ind = /재간접|모자형|피투자/.test(String(valueOf('name') || ''));
        return (ind && r3.feeSynth != null) ? r3.feeSynth : r3.fee;
      }
      case 'sd1y': { var r4 = mktRow(); return r4 ? r4.sd1y + '%' : undefined; }
      case 'sdPeer': { var r5 = mktRow(); return r5 ? r5.sd1yPeer + '%' : undefined; }
      case 'peerKind': { var r6 = mktRow(); return r6 ? r6.peerKind : undefined; }
      /**
       * 동종유형 대비 비교 문장.
       *
       * 문장이 「… 대비 {{retGap}} 높은 수준입니다」 로 굳어 있었다. 동종유형보다
       * 낮은 펀드에도 「높은 수준」 을 읽히면 사실과 반대되는 말을 하게 된다 —
       * 실제 자료를 보면 동종유형에 못 미치는 펀드가 적지 않다(피델리티글로벌
       * 테크놀로지 1Y 16.6% vs 동종유형 41.7%). 그래서 부호를 보고 말을 고른다.
       *
       * 평가는 「수익률·위험·비용 등 양적 특성을 수치로 비교」 를 본다. 자료에
       * 표준편차와 총보수도 있으므로 함께 말해 준다 — 수익률이 낮은 펀드라면
       * 위험이나 비용이 추천 근거가 된다.
       */
      case 'retCompare': {
        var a = valueOf('ret1y'), b2 = valueOf('retPeer');
        var na = numOf(a), nb = numOf(b2);
        if (na == null || nb == null) return undefined;
        var d = Math.round((na - nb) * 100) / 100;
        var word = d > 0 ? '높은' : (d < 0 ? '낮은' : '같은');
        var v = '이 펀드의 최근 1년 수익률은 ' + a + ' 로, 동종유형 평균 ' + b2 + ' 대비 '
          + (d === 0 ? '같은 수준입니다.' : Math.abs(d) + '%p ' + word + ' 수준입니다.');
        /* 위험·비용도 자료에 있으면 함께 비교한다 */
        var rr = mktRow();
        if (rr) {
          var pk = rr.peerKind ? '(동종유형: ' + rr.peerKind + ')' : '';
          v += '\n같은 자료로 위험과 비용도 비교해 보면, 수익률 변동성을 나타내는 표준편차는 '
            + rr.sd1y + '% 로 동종유형 ' + rr.sd1yPeer + '% 대비 '
            + (numOf(rr.sd1y) > numOf(rr.sd1yPeer) ? '높고' : (numOf(rr.sd1y) < numOf(rr.sd1yPeer) ? '낮고' : '같고'))
            + ', 총보수는 연 ' + rr.fee + '% 로 동종유형 ' + rr.feePeer + '% 대비 '
            + (numOf(rr.fee) > numOf(rr.feePeer) ? '높습니다' : (numOf(rr.fee) < numOf(rr.feePeer) ? '낮습니다' : '같습니다'))
            + '. ' + pk;
          if (/재간접|모자형|피투자/.test(String(valueOf('name') || '')) && rr.feeSynth != null) {
            v += '\n이 펀드는 재간접·모자형이므로 피투자 집합투자기구의 보수까지 포함한 합성 총보수 연 '
              + rr.feeSynth + '% 를 함께 부담하시게 됩니다.';
          }
          if (rr.recommended) v += '\n(이 펀드는 이번 자료의 추천상품입니다)';
        }
        return v;
      }
      /**
       * 투자대상을 짧게 — 문장이 「{{name}} 은 {{targetsShort}} 에 투자하는 펀드로」 다.
       * 투자목적 문장을 그대로 넣으면 「…에 투자합니다. 에 투자하는 펀드로」 가 되어
       * 읽을 수 없다. 펀드유형은 카탈로그가 거의 다 갖고 있고 이 자리에 딱 맞는
       * 굵기라, 유형을 말로 옮긴다 (짐작이 아니라 유형 표기를 바꿔 적는 것이다).
       */
      case 'targetsShort': {
        var ft2 = String(valueOf('fundType') || '');
        var MAPT = [[/국내주식/, '국내 주식'], [/해외주식/, '해외 주식'],
          [/국내채권/, '국내 채권'], [/해외채권/, '해외 채권'],
          [/국내혼합/, '국내 주식과 채권'], [/해외혼합/, '해외 주식과 채권'],
          [/MMF|단기금융/i, '단기금융상품'],
          [/국내대체/, '국내 부동산·특별자산 등 대체자산'], [/해외대체/, '해외 부동산·특별자산 등 대체자산']];
        for (var mi = 0; mi < MAPT.length; mi++) {
          if (MAPT[mi][0].test(ft2)) return MAPT[mi][1];
        }
        /* 「기타형」 처럼 유형만으로는 알 수 없으면 투자대상 문장의 첫 조각을 쓴다 */
        var tg = String(valueOf('targets') || '');
        var mt = /([가-힣A-Za-z·ㆍ\s]{2,24}?)(?:을|를)\s*(?:법[^,.]{0,60}?)?(?:규정하는\s*)?주된?\s*투자\s*대상\s*자산/.exec(tg);
        if (mt) return mt[1].replace(/^(?:이\s*)?(?:투자신탁|집합투자기구|펀드)은?\s*/, '').trim() || undefined;
        return undefined;
      }
      /**
       * 증시전망과 연결되는 운용전략·투자업종·투자종목.
       *
       * 평가 기준은 「증시에 부합하는 펀드 추천 이유」 — 전망과 펀드를 이어서 말해야
       * 인정된다. 그래서 자료에 나온 업종·테마·지역 낱말과, 이 펀드의 투자전략·
       * 투자목적에 나오는 낱말이 겹치는 것을 찾는다. 두 자료에 실제로 함께 나오는
       * 말이라야 「연결」 이라고 할 수 있다 — 없는 연결을 만들어내지 않는다.
       * 겹치는 것이 없으면 비워 두어, 자료를 보고 직접 이어 말하도록 남긴다.
       */
      case 'mktLink': {
        var src2 = valueOf('mktView');
        if (!src2) return undefined;
        /**
         * 「전망과 연결되는 운용전략·투자업종」.
         *
         * 낱말이 글자까지 같아야 한다고 보면 놓치는 연결이 있다 — 자료는 「미국의 AI
         * 투자사이클」 을 말하고, 같은 자료가 이 펀드를 「정보기술섹터」 로 분류한다.
         * AI 와 정보기술은 같은 업종군이므로 이것은 실제 연결이다. 그래서 업종군으로
         * 잇고, 자료에 있는 낱말을 그대로 대어 말한다 (없는 연결은 만들지 않는다).
         */
        var GROUP = [
          ['정보기술', ['AI', '인공지능', '반도체', '테크놀로지', '테크', '기술', '데이터센터', '로봇', '통신', '전력설비', '전력']],
          ['헬스케어', ['헬스케어', '바이오', '제약']],
          ['금융', ['금융', '은행', '보험']],
          ['소비·유통', ['소비', '유통']],
          ['산업재', ['자동차', '조선', '방산', '우주항공', '기계', '철강', '화학', '건설']],
          ['에너지·원자재', ['에너지', '원자재', '원자력', '구리']],
          ['부동산', ['부동산', '리츠']],
          ['배당', ['고배당', '배당']],
          ['채권', ['채권', '국채', '단기채', '크레딧', '듀레이션', '금리']]
        ];
        var REG = [['미국', /미국|북미|US\b|S&P|나스닥/i], ['중국', /중국|차이나|China/i],
          ['한국', /국내|한국|코리아|Korea/i], ['일본', /일본|재팬|Japan/i],
          ['유럽', /유럽|Europe/i], ['인도', /인도|India/i],
          ['신흥국', /신흥국|이머징|Emerging/i], ['글로벌', /글로벌|전\s*세계|Global/i]];
        var mrow = mktRow();
        /* 펀드 쪽 정보 — 자료가 붙인 소유형까지 포함한다 */
        var mine = [valueOf('name'), valueOf('fundType'), valueOf('targets'),
          valueOf('strategy'), mrow ? mrow.peerKind : ''].join(' ');
        /* 자료의 시황 단락에서, 이 펀드와 같은 업종군에 드는 낱말을 찾는다 */
        var words = [], group = null;
        for (var gi = 0; gi < GROUP.length; gi++) {
          var fam = GROUP[gi][1];
          var inMine = fam.some(function (w) { return mine.indexOf(w) >= 0; })
            || mine.indexOf(GROUP[gi][0]) >= 0;
          if (!inMine) continue;
          var inDoc = fam.filter(function (w) { return String(src2).indexOf(w) >= 0; });
          if (inDoc.length) { words = inDoc.slice(0, 2); group = GROUP[gi][0]; break; }
        }
        /* 지역도 자료와 펀드가 함께 말하는 것만 */
        var reg = null;
        for (var ri = 0; ri < REG.length; ri++) {
          if (REG[ri][1].test(String(src2)) && REG[ri][1].test(mine)) { reg = REG[ri][0]; break; }
        }
        if (!reg && /미국은/.test(String(src2)) && /글로벌|해외|전세계/.test(mine)) reg = '미국';
        if (!words.length && !reg) return undefined;
        var what = (reg ? reg + '의 ' : '') + (words.length ? words.join('·') : '증시');
        var tail = '자료가 ' + what + josa(what, '을', '를') + ' 전망의 중심에 두고 있어 같은 방향의 펀드';
        var lead = [];
        if (mrow && mrow.peerKind) {
          lead.push('이번 자료가 ' + mrow.peerKind + josa(mrow.peerKind, '으로', '로') + ' 분류한 펀드이며');
        }
        if (mrow && mrow.recommended) lead.push('자료의 추천상품이고');
        var st1 = connective(firstClause(valueOf('strategy')));
        if (st1) lead.push(st1);
        return lead.length ? lead.join(' ') + ' ' + tail : tail;
      }
      /**
       * 이자지급주기별 이자율 — 표면금리를 연간 지급 횟수로 나눈 값이다.
       * 예) 표면금리 연 4.25% · 6개월 지급 → 회당 2.125%
       */
      case 'payRate': {
        if (rawValue('payRate')) return undefined;
        var cr = numOf(valueOf('coupon'));
        if (cr == null) return undefined;
        var pr = numOf(valueOf('payCycle'));
        if (!pr || pr < 1 || pr > 12) return undefined;
        var mr = Math.round(12 / pr);
        return '회당 ' + (Math.round(cr / mr * 10000) / 10000) + '% (연 ' + cr + '% ÷ 연 ' + mr + '회)';
      }
      /**
       * 세후 투자수익률 — 매매단가·표면금리·잔존만기가 있으면 정확히 풀린다.
       * 개인이 보유한 채권은 이자소득만 과세(15.4%)되고 매매차익·상환차익은
       * 과세되지 않으므로, 이자만 세후로 깎아 만기수익률을 구한다.
       * 매매단가를 넣기 전에는 낼 수 없으니 비워 둔다 (짐작하지 않는다).
       */
      case 'ytm': {
        if (rawValue('ytm')) return undefined;
        var cy = numOf(valueOf('coupon'));
        var py = numOf(valueOf('tradePrice'));
        if (cy == null || py == null || py <= 0) return undefined;
        var my = String(valueOf('matDate') || '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
        if (!my) return undefined;
        var yy = (new Date(+my[1], +my[2] - 1, +my[3]) - new Date()) / (365.25 * 24 * 3600 * 1000);
        if (!(yy > 0.05)) return undefined;
        var pcy = numOf(valueOf('payCycle'));
        var mm = (pcy && pcy >= 1 && pcy <= 12) ? Math.round(12 / pcy) : 2;
        var net = cy * (1 - 0.154);                 /* 이자소득세 15.4% (지방세 포함) */
        /* 값을 좁혀 가며 찾는다 — 세후 이자로 계산한 가격이 매매단가와 같아지는 수익률 */
        var lo = -0.5, hi = 50, mid = 0;
        for (var it2 = 0; it2 < 80; it2++) {
          mid = (lo + hi) / 2;
          if (bondPrice(net, mid, yy, mm) > py) lo = mid; else hi = mid;
        }
        return '연 ' + (Math.round(mid * 100) / 100) + '% (세후, 매매단가 기준)';
      }
      /**
       * 이표채 이자 예시 — 1,000만원을 넣으면 회당 얼마를 받는지.
       * 표면금리와 이자지급주기만 있으면 나오는 곱셈이라 받아쓸 값이 아니다.
       * (세전 금액이다 — 문장 뒤에 과세 설명이 따로 붙는다.)
       */
      case 'invAmt': case 'cpnAmt': {
        var cq = numOf(valueOf('coupon'));
        if (cq == null) return undefined;
        if (id === 'invAmt') return '1,000만원';
        var pq = numOf(valueOf('payCycle'));
        var mq = (pq && pq >= 1 && pq <= 12) ? Math.round(12 / pq) : 2;
        var each = 10000000 * (cq / 100) / mq;
        return Math.round(each).toLocaleString() + '원(세전)';
      }
      /**
       * 매매단가차이 — 이름 그대로 민평단가 − 매매단가다. 뺄셈이라 받아쓸 값이 아니다.
       * 평가 기준이 「비율 = 차이/매매단가」 까지 보므로 비율도 함께 낸다.
       */
      case 'priceDiff': {
        var mp = numOf(valueOf('mpPrice')), tp = numOf(valueOf('tradePrice'));
        if (mp == null || tp == null || !tp) return undefined;
        var dv = mp - tp;
        return (dv >= 0 ? '+' : '−') + Math.abs(Math.round(dv * 100) / 100).toLocaleString()
          + '원 (매매단가 대비 ' + (dv >= 0 ? '+' : '−') + Math.abs(Math.round(dv / tp * 10000) / 100) + '%)';
      }
      /**
       * 금리변동 손익 예시 — 이 채권의 표면금리·잔존만기로 직접 계산한다.
       *
       * 왜 계산하나. 평가 기준은 「금리변동에 따른 손익을 쉽게 파악할 수 있는 도표를
       * 활용해 설명」 하는 것인데, 항목이 13개나 받아쓰기로 비어 있어 창구에서
       * 자료를 뒤져 옮겨 적어야 했다. 채권가격은 표면금리·잔존만기·시장금리만 있으면
       * 정확히 계산되는 값이라 지어내는 것이 아니다.
       *
       * 기준금리는 민평금리가 있으면 그것을, 없으면 표면금리를 쓴다
       * (표면금리 = 시장금리면 가격이 액면가라, 설명이 오히려 또렷해진다).
       * 변동폭은 0.5%p 로 둔다 — 장·단기 민감도 차이를 보여 주기에 충분하다.
       */
      case 'exMat': case 'exCoupon': case 'exBase': case 'exPrice': case 'exStep':
      case 'exUp': case 'exUpPrice': case 'exUpPnl': case 'exUpPct':
      case 'exDown': case 'exDownPrice': case 'exDownPnl': case 'exDownPct': {
        var bx = bondRateExample();
        return bx ? bx[id] : undefined;
      }
      /**
       * 개인형 IRP 제도 기준값 — 상품이 아니라 법령으로 정해진 값이다.
       * 상품을 고를 때마다 다시 입력할 이유가 없어 기본값으로 둔다.
       * 세액공제 한도·공제율은 세법 개정에 따라 바뀌므로 여기서 채우지 않는다 —
       * 시트가 「반드시 개인형IRP 설명서로 확인」 하도록 받아쓰기로 남겨 둔 항목이다.
       */
      case 'limitYear':
        return rawValue('limitYear') ? undefined : '연간 1,800만원';
      case 'riskLimit':
        return rawValue('riskLimit') ? undefined : '적립금의 70%';
      /**
       * 세액공제·세율 — 소득세법으로 정해진 값이다. 상품마다 다르지 않고 상담마다
       * 바뀌지도 않으므로 기본값으로 채운다. 세법이 바뀌면 「전 상품 공용 문구」 에서
       * 한 번 덮어쓰면 모든 IRP 상담에 반영된다 (그래서 COMMON 을 먼저 본다).
       *
       * 앞서는 「세법이 바뀔 수 있다」 는 이유로 비워 두었는데, 그것은 값을 비워 둘
       * 이유가 아니라 값에 확인 안내를 달 이유였다. 매 상담마다 창구에서 세법을
       * 찾게 만드는 쪽이 더 위험하다.
       */
      case 'taxLimit':
        return rawValue('taxLimit') || COMMON.irpTaxLimit
          || '연간 900만원 (연금계좌 합산) — ISA 만기전환금액이 있는 경우 최대 연간 1,200만원 한도';
      case 'taxRate':
        return rawValue('taxRate') || COMMON.irpTaxRate
          || '종합소득과세표준 4,500만원 이하(근로소득만 있는 경우 총급여 5,500만원 이하)는 16.5%, 초과는 13.2%';
      case 'taxRateOut':
        return rawValue('taxRateOut') || COMMON.irpTaxRateOut
          /* 문장이 「… 가 적용되며」 로 이어진다 — 명사로 끝내야 읽힌다 */
          || '과세대상소득은 연금소득세 3.3~5.5% 분리과세(만 70세 미만 5.5% · 만 80세 미만 4.4% · '
          + '만 80세 이상 3.3%), 이연퇴직소득은 이연퇴직소득세의 70%';
      /**
       * 가입유형별 증빙서류 — 유형을 확인하지 않고 전부 읽으면 평가에서 미인정이다.
       * 유형별 목록은 이 항목의 안내문에 이미 있으므로, 고른 유형에 맞는 것만 낸다.
       */
      /**
       * IRP 계좌의 사내 고정값 — 수수료·운용상품·디폴트옵션.
       *
       * 이것들은 상품마다 다른 값이 아니다. 미래에셋증권 개인형IRP 계좌의 조건이라
       * 어느 펀드를 고르든 같다. 그런데 상품 항목(FIELDS.irp)에 들어 있어서 펀드를
       * 바꿀 때마다 확인필요로 다시 떴다 — IRP 확인필요가 유난히 많아 보인 이유다.
       * 「전 상품 공용 문구」 에 한 번 등록하면 모든 IRP 상담에서 그대로 쓰인다.
       */
      case 'feeKinds':
        return rawValue('feeKinds') || COMMON.irpFeeKinds
          || 'IRP 계좌에는 운용관리수수료와 자산관리수수료가 각각 부과되며, 디폴트옵션으로 1년 이상 '
          + '운용 중인 금액에는 운용손익수수료가 더해집니다 (안정형 디폴트옵션 상품은 제외).';
      case 'feeTotal':
        return rawValue('feeTotal') || COMMON.irpFeeTotal
          || '총수수료율은 연 0.3% 입니다 (대면 개설·고객납입액 1억원 미만 기준 — 운용관리 0.2% + '
          + '자산관리 0.1%). 납입액이 1억원 이상 3억원 미만이면 0.28%, 3억원 이상이면 0.25% 이며, '
          + '온라인으로 개설하시고 전자매체로 직접 운용·거래하시면 면제됩니다.';
      case 'feeMethod':
        return rawValue('feeMethod') || COMMON.irpFeeMethod
          || '대상기간 중 적립금의 일별 평가금액을 기준으로 수수료율을 적용해 부과합니다. '
          + '운용관리수수료는 체차식, 자산관리수수료는 단일률로 계산되며, 적립금을 펀드로 운용하시면 '
          + '그 운용금액에 대해 펀드 보수가 별도로 부과됩니다.';
      case 'products':
        return rawValue('products') || COMMON.irpProducts
          || '증권회사 ELB·은행 정기예금 등 원리금보장상품과 펀드 등 실적배당형 상품';
      /**
       * 디폴트옵션 — 설명서는 유형(안정형·안정투자형·중립투자형·적극투자형)까지만
       * 밝히고 상품명은 「퇴직연금 디폴트옵션 안내장」 을 보라고 한다. 그래서 유형까지
       * 채우고 상품명은 안내장에서 확인해 말하도록 남긴다 — 없는 상품명을 만들지 않는다.
       */
      case 'defaultOpt':
        return rawValue('defaultOpt') || COMMON.irpDefaultOpt
          || '안정형·안정투자형·중립투자형·적극투자형 네 가지 유형으로 승인받은 포트폴리오 '
          + '(구체적 상품명은 교부드린 「퇴직연금 디폴트옵션 안내장」 에서 함께 확인해 드리겠습니다)';
      case 'proof': {
        if (rawValue('proof')) return undefined;
        var jt = String(valueOf('joinType') || '');
        if (!jt) return undefined;
        /* 문장이 「… 중 하나를 택하시어 제출하시면」 으로 이어지므로 「중 택1」 을 붙이면 겹친다 */
        if (/자영업/.test(jt)) return '사업자등록증 · 사업소득원천징수영수증 · 소득금액증명원';
        if (/미설정|1년\s*미만|15시간/.test(jt)) {
          return '재직증명서 · 건강보험자격득실확인서 · 근로소득원천징수영수증 · 단체재직증명서';
        }
        if (/퇴직금제도|재직|직역연금/.test(jt)) {
          return '재직증명서 · 건강보험자격득실확인서 · 근로소득원천징수영수증';
        }
        return undefined;
      }
      /**
       * IRP 편입 펀드의 총보수 — 창구에서 가입하는 것은 퇴직연금 클래스다.
       * A·C 클래스 보수를 말하면 고객이 실제로 부담하지 않는 비용을 말하게 된다.
       * 그래서 퇴직연금 클래스(C-P·CP·S-P) 보수를 먼저 쓰고, 어느 클래스 기준인지
       * 함께 말한다 (clsExpClass).
       */
      case 'clsExp': case 'clsExpClass': {
        var dcp = doc();
        var itp = fundCatByCode((dcp && dcp.catalogCode) || ST.productId || '')
          || fundCatByName(rawValue('name') || '');
        var pick = null, who = null;
        if (itp && itp.clsPExp != null) { pick = itp.clsPExp; who = '퇴직연금 클래스'; }
        else if (rawValue('clsExp')) { pick = rawValue('clsExp'); who = '투자설명서 기재 기준'; }
        else if (rawValue('clsCExp')) { pick = rawValue('clsCExp'); who = 'C클래스'; }
        else if (rawValue('clsAExp')) { pick = rawValue('clsAExp'); who = 'A클래스'; }
        if (pick == null) return undefined;
        return id === 'clsExp' ? String(pick) : who;
      }
      /* 계산기 설명 — 선취수수료가 없는 펀드에는 뺄셈 자체가 없다 */
      case 'feeCalcNote': {
        var fr = derived('feeRate');
        if (fr) {
          return '판매수수료는 ' + fr + ' 로, 만약 고객님께서 ' + derived('exAmt') + ' 을 납입하신다면 ' +
            '그 ' + fr + ' 인 ' + derived('feeCut') + ' 을 제외한 ' + derived('netAmt') + ' 만 투자되는 상품입니다.';
        }
        var cls2 = derived('clsIssued');
        var hasA3 = cls2 == null ? null : /(?:^|·)\s*A\s*(?:·|$)/.test(' ' + cls2 + ' ');
        var cav = String(valueOf('clsA') || '');
        if (hasA3 === false || /없음|해당\s*없/.test(cav)) {
          return '이 펀드는 선취판매수수료가 없어 납입하신 금액이 전액 투자되고, ' +
            '대신 총보수가 매일 펀드 재산에서 차감됩니다.';
        }
        return undefined;
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
      /* 달력 설명 — 오늘과, 오늘을 기준으로 계산한 기준가 적용일·지급일 */
      case 'todayLabel':
        return kDateDow(new Date());
      case 'redBeforeDate': return bizDateOf('redBefore');
      case 'redAfterDate': return bizDateOf('redAfter');
      case 'redPayDate': return bizDateOf('redPay');
      /**
       * 약칭 — 명칭에서 법적 형태(증권·자투자신탁·유형 괄호)를 떼어낸 부분이다.
       * 스크립트가 "'{{name}}' 인데요, '{{shortName}}' 은 … 을 의미합니다" 로 읽는다.
       */
      case 'shortName': {
        var nm = String(rawValue('name') || '');
        if (!nm) return undefined;
        /**
         * 꼬리표가 운용사마다 다르게 겹쳐 붙는다 — 괄호와 대괄호, 모/운 같은 모자형 표시,
         * H·UH 같은 환헤지 표시, 그리고 " 1" · "제1호" 같은 시리즈 번호가 순서 없이 온다.
         *   AKP턴어라운드증권투자신탁 1(주식)모
         *   삼성퇴직연금리서치다이나믹40증권자투자신탁 1[채권혼합]
         *   피델리티글로벌테크놀로지증권자투자신탁UH(주식-재간접형)
         * 그래서 한 번에 지우지 않고, 더 지울 것이 없을 때까지 뒤에서부터 떼어낸다.
         */
        var sn = nm;
        for (var sk = 0; sk < 8; sk++) {
          var was = sn;
          sn = sn
            .replace(/\s*[(\[][^)\]]*[)\]]\s*$/, '')                    /* (주식) [채권혼합] */
            /* 증권자투자신탁 · 특별자산투자신탁3 — 뒤에 붙은 숫자는 시리즈 번호다 */
            .replace(/\s*(?:증권)?\s*모?자?투자(?:신탁|회사)\s*\d*\s*$/, '')
            .replace(/\s*_?\s*(?:운용|종류|모|운|UH|H|P)\s*$/, '')       /* 모자형·환헤지·클래스 표시 */
            /* 시리즈 번호만 뗀다 — 붙어 있는 숫자는 이름의 일부다
               (TDF2065 의 2065, 아세안40 의 40 을 떼면 다른 상품이 된다) */
            .replace(/\s+\d+\s*$/, '')
            .replace(/\s*제\s*\d+\s*호\s*$/, '')
            .replace(/\s*증권\s*$/, '')
            .trim();
          if (sn === was) break;
        }
        /* 떼어낼 꼬리표가 없는 이름(MMF 처럼)은 그 자체가 약칭이다 */
        return (sn && sn.length >= 2) ? sn : nm;
      }
      /**
       * 명칭에 담긴 뜻 — 설명서에서 읽은 운용사·유형·투자대상을 그대로 이어 붙인다.
       * 없는 말을 만들지 않고, 근거는 필수입력 탭에서 항목별로 확인할 수 있다.
       */
      case 'nameMeaning': {
        var mg = rawValue('mgr'), ft = rawValue('fundType');
        var rg = derived('fxCountry');
        if (!mg && !ft && !rg) return undefined;
        /* 유형 표기에서 자산 종류만 남긴다 — 개방형·추가형·모자형·종류형은 계약기간 항목에서 따로 읽는다 */
        var core = String(ft || '').split(/\s*[,\/]\s*/)
          .filter(function (x) { return /증권|주식|채권|혼합|재간접|파생|부동산|특별자산|단기금융|MMF/.test(x); })
          .join(' · ');
        /* 조사는 「에서」 로 붙인다 — 이/가 는 앞말 종성에 따라 갈려 잘못 붙기 쉽다 */
        var v = (mg ? mg + ' 에서 운용하는 ' : '') + (core ? core + ' 펀드' : '펀드');
        if (rg) v += '로, ' + rg + ' 자산에 투자하는 상품';
        /* 문장이 "… 을 의미합니다" 로 끝나므로 여기서 「뜻」 을 붙이면 겹친다 */
        return v;
      }
      /**
       * 주요 투자대상 국가·지역 — 설명서의 투자대상·투자전략 문장에 나오는 지역 표현만 옮긴다.
       * 문장에 지역이 안 나오면 비워 둔다 (짐작해서 채우지 않는다).
       */
      case 'fxCountry': {
        var hay = [rawValue('targets'), rawValue('strategy'), rawValue('name')].join(' ');
        var REGION = [[/전\s*세계|글로벌|Global/i, '전세계(글로벌)'], [/미국|US\b|U\.S\./i, '미국'],
          [/중국|China/i, '중국'], [/일본|Japan/i, '일본'], [/유럽|Europe/i, '유럽'],
          [/인도|India/i, '인도'], [/베트남|Vietnam/i, '베트남'],
          [/신흥국|이머징|Emerging/i, '신흥국'], [/아시아|Asia/i, '아시아'], [/국내|한국|Korea/i, '국내']];
        var hit = [];
        REGION.forEach(function (r) { if (r[0].test(hay) && hit.indexOf(r[1]) < 0) hit.push(r[1]); });
        if (!hit.length) return undefined;
        /* 「전세계」 가 잡히면 그것이 답이다 — 뒤에 붙는 개별 지역은 예시일 뿐이라 나열하면 오해를 준다 */
        if (hit[0] === '전세계(글로벌)') return '전세계(글로벌)';
        return hit.slice(0, 2).join(' · ');
      }
      /**
       * VaR 설명 문장 — 값이 있을 때와 없을 때 할 말이 다르다.
       * 설정 후 3년이 안 된 펀드는 실측 최대손실예상액이 아예 없고 투자대상 자산의
       * 위험수준으로 등급을 매긴다. 그런 펀드에 "VaR값 ○○% 의 의미는…" 을 읽히면
       * 없는 수치를 말하게 되므로 문장째로 갈라 낸다.
       */
      case 'varMeaning': {
        var vp = rawValue('varPct');
        if (vp) {
          var vn = String(vp).replace(/%$/, '');
          return 'VaR는 포트폴리오 손실 위험 측정을 위해 이용되는 위험 측정수단으로, ' +
            'VaR값 ' + vn + '%의 의미는 과거 3년 동안 일간수익률을 고려할 때 1년 동안 최대 ' +
            vn + '%의 손실이 발생할 수 있음을 의미합니다.';
        }
        var vb = rawValue('varBasis');
        if (vb && /아니|않|미경과|미달/.test(String(vb))) {
          return '이 펀드는 설정 후 3년이 경과하지 않아 실측 VaR(최대손실예상액) 값이 없으며, ' +
            '투자대상 자산의 위험수준을 기준으로 위험등급을 분류하였습니다. ' +
            '(투자설명서 원문: ' + String(vb).replace(/\s+/g, ' ').trim() + ')';
        }
        return undefined;
      }
      /**
       * 환헤지 여부 — 설명서에서 못 읽었으면 명칭의 표시로 낸다.
       * 해외펀드 1,681건 중 755건이 이름에 (H)·(UH)·환노출을 달고 있고, 그것이
       * 곧 환헤지 여부다 (UH = Unhedged). 짐작이 아니라 명칭이 말하는 그대로다.
       */
      case 'fxHedge': {
        if (rawValue('fxHedge')) return undefined;   /* 설명서에서 읽은 값이 먼저다 */
        var fnm = String(rawValue('name') || '');
        if (!fnm) return undefined;
        if (/\(\s*UH\s*\)|\[\s*UH\s*\]|UH(?=[[(])|언헤지|환노출/i.test(fnm)) {
          return '환헤지를 실시하지 않습니다 (명칭의 UH·환노출 표시)';
        }
        if (/\(\s*H\s*\)|\[\s*H\s*\]|H(?=[[(])|환헤지/.test(fnm)) {
          return '환헤지를 실시합니다 (명칭의 H·환헤지 표시 — 외화표시 투자자산의 환위험 헤지)';
        }
        return undefined;
      }
      /**
       * 환율변동위험 문장의 환헤지 부분 — 여부에 따라 문장이 갈린다.
       * 헤지를 안 하는 펀드에 "목표 환헤지 비율은 ○○ 범위 내에서 헤지할 계획" 을
       * 읽히면 사실과 반대되는 말을 하게 된다. 그래서 한 문장으로 묶어 낸다.
       * 목표 비율이 설명서에 없으면 비율을 만들어내지 않고 여부까지만 말한다.
       */
      case 'fxHedgeNote': {
        var fh = String(valueOf('fxHedge') || '');
        var fs2 = rawValue('fxHedgeSize');
        if (!fh) return undefined;
        if (/않|미실시/.test(fh)) {
          return '이 투자신탁은 ' + fh + ' — 목표 환헤지 비율은 0% 이며, 투자한 해외자산은 ' +
            '환율 변동에 그대로 노출됩니다.';
        }
        if (fs2) {
          return '이 투자신탁은 ' + fh + ' 목표 환헤지 비율은 ' + fs2 +
            ' 범위 내에서 환율변동위험을 헤지할 계획이며, 기타 다른 통화로 투자된 해외투자분은 ' +
            '환율변동위험에 노출됩니다.';
        }
        return '이 투자신탁은 ' + fh + ' 다만 목표 환헤지 비율은 투자설명서에 수치로 정해져 ' +
          '있지 않으므로, 헤지 대상과 크기는 간이투자설명서의 「환헤지」 항목에서 확인해 ' +
          '말씀드립니다. 헤지하지 않은 해외투자분은 환율변동위험에 노출됩니다.';
      }
      /**
       * 계열운용사 여부 — 판매회사(미래에셋증권) 기준이므로 운용사명으로 판정된다.
       * 카탈로그로 고른 펀드는 추출 규칙을 안 타므로 여기서 낸다.
       */
      case 'affiliate': {
        var mgv = rawValue('mgr');
        if (!mgv) return undefined;
        return /미래에셋/.test(String(mgv))
          ? '계열 운용사 (' + mgv + ') — 계열사 상품이므로 고지 및 유사 비계열 펀드 1개 동반 추천 필요'
          : '비계열 운용사 (' + mgv + ')';
      }
      case 'peerFund': case 'peerRet1y': {
        /* affiliate 는 이제 파생값이다 — rawValue 로 보면 늘 비어 있다 */
        var af = String(valueOf('affiliate') || '');
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

  /** 항목 정의에 ctx 가 붙었는지 — 고객 단위로 담아야 하는 값이다 */
  function isCtxField(id) {
    var defs = fieldDefs();
    for (var i = 0; i < defs.length; i++) if (defs[i].id === id) return !!defs[i].ctx;
    return false;
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
      todayLabel: '오늘 날짜·요일', redBeforeDate: '기준가 적용일 날짜 (기준시각 前)',
      redAfterDate: '기준가 적용일 날짜 (기준시각 後)', redPayDate: '환매대금 지급일 날짜',
      nameMeaning: '명칭에 담긴 뜻',
      /* 아래 문장 항목들은 펀드 항목표에만 등록돼 있어, IRP 시트에서는 내부 id 가
         그대로 떴다 (varMeaning · feeCalcNote). 시트와 무관한 여기에도 둔다. */
      varMeaning: 'VaR 설명 문장', varBasis: '위험등급 산정 근거',
      feeCalcNote: '선취수수료 계산 예시 문장', clsExpNote: '클래스별 총보수 문장',
      clsFeeNote: '선취판매수수료 문장', clsIssued: '발행 클래스',
      fxHedgeNote: '환헤지 설명 문장', retCompare: '동종유형 대비 비교 문장',
      clsExp: '펀드 총보수 (연)', clsExpClass: '총보수 기준 클래스',
      taxLimit: '세액공제 한도(연금저축 합산 기준)', taxRate: '세액공제율',
      taxRateOut: '법정사유 중도인출 시 세율',
      /* 펀드 완전판매자료(증시전망)에서 오는 값 — 투자설명서에는 없다 */
      mktAsOf: '자료 기준월', mktView: '증시전망 요약',
      mktLink: '증시전망과 연결되는 운용전략·투자업종·투자종목',
      targetsShort: '투자대상 (짧게)',
      /* 금리변동 손익 예시 — 이 채권의 표면금리·잔존만기로 계산한 값이다 */
      exMat: '예시 잔존만기', exCoupon: '예시 표면금리', exBase: '기준 시장금리',
      exPrice: '기준 채권가격', exStep: '금리 변동폭',
      exUp: '상승 후 시장금리', exUpPrice: '상승 시 채권가격', exUpPnl: '상승 시 손익', exUpPct: '상승 시 변동률',
      exDown: '하락 후 시장금리', exDownPrice: '하락 시 채권가격', exDownPnl: '하락 시 손익', exDownPct: '하락 시 변동률',
      priceDiff: '매매단가차이 (민평단가−매매단가)',
      invAmt: '예시 투자금액', cpnAmt: '회당 이자금액 (세전)',
      clsExpClass: '총보수 기준 클래스',
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

  /**
   * 남은 항목을 「어디서 오는 값인지」 로 나눈다.
   *
   * 왜 나누나. 예전에는 남은 것을 뭉쳐서 "투자설명서 원문에서 채워야 하는 값" 이라고
   * 안내했는데, 실제로 남는 것 중에는 투자설명서에 아예 없는 것이 섞여 있다 —
   * 투자자성향·현재투자자금성향은 상담하며 파악하는 값이고, 증시전망은 지점 자료에
   * 있다. 창구에서 있지도 않은 항목을 투자설명서에서 찾게 만들면 시간만 버린다.
   */
  /* 협회 공시·운용보고서·지점 증시전망 자료에 있는 값 — 투자설명서에는 없다 */
  var MISS_REF = ['retPeer', 'peerRet1y'];
  /**
   * 한 번만 등록하면 되는 값 — 상품이 아니라 회사·계좌의 조건이다.
   * 이것을 「투자설명서에서 확인」 으로 안내하면 창구에서 상품 설명서를 뒤지게 된다.
   */
  var MISS_ONCE = ['feeKinds', 'feeTotal', 'feeMethod', 'products', 'defaultOpt',
    'riskGradeBasis', 'taxLimit', 'taxRate', 'taxRateOut'];
  function missGroup(m) {
    /* 라벨이 먼저다 — 증시전망·자료 기준월은 받아쓰기 표시라 항목 id 가 없다 */
    if (/증시\s*전망|자료\s*기준월|동종유형\s*평균|협회\s*공시/.test(m.label)) return 'ref';
    if (MISS_REF.indexOf(m.key) >= 0) return 'ref';
    if (MISS_ONCE.indexOf(m.key) >= 0) return 'once';
    if (/고객|대리인|투자자성향|투자자금\s*성향|추천\s*상품명/.test(m.label)) return 'ask';
    if (m.kind === 'inline') return 'doc';           /* 그 밖의 받아쓰기는 설명서 원문 */
    /* 항목 정의의 묶음을 쓴다 — 「고객」 묶음은 상담하며 파악하는 값이다 */
    var defs = fieldDefs();
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === m.key) return defs[i].group === '고객' ? 'ask' : 'doc';
    }
    return 'doc';
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
    var shx = sheet();
    var cat = shx.cat, docs = DOCS[cat] || {};
    var P = window.ELS_PROSPECTUS;
    /** 담당자 등록분 또는 자동수집분이 있으면 등록된 것으로 표시한다 */
    var hasDoc = function (p) {
      if (docs[p.id]) return true;
      if (cat === 'fund' || cat === 'irp') {
        return !!(fundCatByCode(p.id) || fundCatByName(p.name) || fundCollectedByName(p.name));
      }
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
      /* 어디서 오는 값인지 나눠 보여 준다 — 투자설명서에 없는 것을 거기서 찾게 하지 않는다 */
      var GRP = [
        ['doc', '투자설명서에서 확인', '투자설명서 원문에서 채워야 하는 값입니다.'],
        ['ask', '상담 중 파악·입력', '고객에게 확인하거나 상담 중 옮겨 적는 값입니다 — 투자설명서에는 없습니다.'],
        ['ref', '지점 자료에서 확인', '증시전망·협회 공시 등 별도 자료에 있는 값입니다 — 투자설명서에는 없습니다.'],
        ['once', '한 번만 등록 (이후 모든 상담에서 재사용)', '상품이 아니라 회사·계좌의 조건입니다. 「투자설명서 자동조회」 탭 맨 아래 「전 상품 공용 문구」 에 한 번 등록해 두면 다시 묻지 않습니다.']
      ];
      var chip = function (m) {
        return '<span class="v miss" data-kind="' + m.kind + '" data-key="' + esc(m.key) + '">' + esc(m.label) + '</span>';
      };
      var parts = [];
      GRP.forEach(function (g) {
        var list = miss.filter(function (m) { return missGroup(m) === g[0]; });
        if (!list.length) return;
        parts.push('<div style="margin-top:6px"><b>' + g[1] + ' ' + list.length + '건</b> <span style="color:var(--muted2)">— ' + g[2] + '</span><br>'
          + list.slice(0, 12).map(chip).join(' ')
          + (list.length > 12 ? ' <span style="color:var(--muted2)">외 ' + (list.length - 12) + '건</span>' : '') + '</div>');
      });
      h.push('<div class="banner"><b>확인필요 ' + miss.length + '건</b> — 빨간 표시를 클릭하면 바로 입력됩니다.'
        + parts.join('') + '</div>');
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

  /**
   * 펀드 완전판매자료 (증시전망) 등록 칸.
   * 투자설명서와 따로 두는 이유 — 이것은 상품 자료가 아니라 그 달의 지점 자료다.
   * 한 번 올려 두면 모든 펀드에서 함께 쓰이고, 다음 달 자료가 오면 다시 올린다.
   */
  /**
   * 장외채권 화면의 유의사항 원문을 그대로 띄운다.
   * 「보증 여부」 같은 항목은 이 문장이 조건문이라 그대로 답이 되지 않는다 —
   * 자동으로 채우지 않고 원문을 옆에 두어 창구가 설명서와 대조하게 한다.
   */
  function bondNoticeCard() {
    var C = bondCat();
    if (!C) return '';
    var sh = sheet();
    var N = bondNotice();
    var h = [];
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 6px">장외채권 화면 유의사항 (회사 원문)</h3>');
    h.push('<div class="hint" style="margin-bottom:12px">회사 장외채권 화면에 적힌 문장을 <b>고치지 않고</b> 옮겨 온 것입니다. '
      + '「중도매도 가능 여부」 는 이 문장으로 자동 채워집니다. '
      + '<b>보증 여부</b>는 「무보증사채는 …」 이 조건문이어서 이 종목이 무보증인지 말해 주지 않으므로 자동으로 채우지 않습니다 — '
      + '종목 설명서에서 확인해 입력하십시오.</div>');
    h.push('<div class="card"><div class="card-b">');
    h.push('<div class="hint" style="margin:0 0 8px">받은 날짜 ' + esc(String(C.updatedAt || '').slice(0, 10))
      + ' · 원천 <a href="' + esc(C.listUrl || '') + '" target="_blank" rel="noreferrer">장외채권 목록 화면</a>'
      + ' · 원화 ' + (C.krwCount || (C.krw || []).length) + '종목</div>');
    if (!N.all.length) {
      h.push('<div class="warnbox">유의사항 문장을 받지 못했습니다. 화면 서식이 바뀌었을 수 있습니다.</div>');
    } else {
      h.push('<ul style="margin:0;padding-left:20px;line-height:1.7">');
      N.all.forEach(function (s) { h.push('<li>' + esc(s) + '</li>'); });
      h.push('</ul>');
    }
    h.push('</div></div>');

    /* 본 채권투자의 위험요인 — 회사 화면 원문.
       원천 화면이 원화·외화를 함께 다루므로 문단이 갈려 있다. 원화채권
       시트에 환율변동 위험을 늘어놓으면 창구가 엉뚱한 것을 읽는다. */
    var rf = C.riskFactors || [];
    var isFx = sh.cat === 'bondFx';
    var show = rf.filter(function (g) {
      if (isFx) return true;
      return !/환율|외화|투자대상\s*국가/.test(g.head || '');
    });
    if (show.length) {
      h.push('<h3 style="font-size:18px;font-weight:700;margin:22px 0 6px">본 채권투자의 위험요인 (회사 원문)</h3>');
      h.push('<div class="hint" style="margin-bottom:12px">「투자에 따른 위험」 을 설명할 때 이 문장을 그대로 읽으십시오. 종목과 무관하게 같은 문구입니다.'
        + (isFx ? '' : ' 환율변동·투자대상 국가 위험은 외화채권 항목이므로 여기서는 빼 두었습니다.') + '</div>');
      h.push('<div class="card"><div class="card-b">');
      show.forEach(function (g) {
        if (g.head) h.push('<div style="font-weight:600;margin:10px 0 4px">' + esc(g.head) + '</div>');
        h.push('<ul style="margin:0;padding-left:20px;line-height:1.7">');
        (g.items || []).forEach(function (s) { h.push('<li>' + esc(s) + '</li>'); });
        h.push('</ul>');
      });
      h.push('</div></div>');
    }

    /* 금융상품 위험도 분류표 —
       ★ 이 표는 「1등급(초고위험)~5등급(초저위험)」 5단계다. 그런데 장외채권
       목록 화면과 개인형 IRP 핵심(요약)설명서는 6단계(1등급 매우높은위험 ~
       6등급 매우낮은위험)를 쓴다. 등급 번호가 서로 맞지 않으므로 이 표로
       「위험등급의 의미」 를 자동완성하지 않는다 — 자동완성하면 창구가
       6등급 종목을 두고 「5등급 초저위험」 이라고 읽게 된다. 원문만 띄운다. */
    var rt = C.riskTable || [];
    if (rt.length) {
      h.push('<h3 style="font-size:18px;font-weight:700;margin:22px 0 6px">금융상품 위험도 분류표 (회사 원문)</h3>');
      h.push('<div class="warnbox" style="margin-bottom:12px"><b>등급 단계가 다릅니다 — 그대로 읽지 마십시오.</b><br>'
        + '이 표는 <b>1등급(초고위험)~5등급(초저위험) 5단계</b>입니다. 반면 장외채권 목록 화면과 핵심(요약)설명서는 '
        + '<b>1등급(매우높은위험)~6등급(매우낮은위험) 6단계</b>를 씁니다. 현재 선택 상품은 '
        + '<b>' + esc(valueOf('riskLabel') || '—') + ' ' + esc(valueOf('riskGrade') || '—') + '등급</b>(6단계 기준)입니다.<br>'
        + '그래서 「위험등급의 의미·유의사항」 을 이 표로 자동완성하지 않았습니다. '
        + '등급별 문구는 <b>사내 핵심(요약)설명서</b>에서 확인해 위 「전 상품 공용 문구」 에 한 번 등록하십시오.</div>');
      h.push('<div class="card"><div class="card-b" style="overflow-x:auto">');
      h.push('<table style="border-collapse:collapse;font-size:13px;min-width:640px">');
      rt.forEach(function (row, i) {
        var cells = row.filter(function (c) { return c !== ''; });
        if (!cells.length) return;
        h.push('<tr>');
        cells.forEach(function (c) {
          h.push('<t' + (i <= 1 ? 'h' : 'd') + ' style="border:1px solid var(--line);padding:4px 7px;text-align:left;vertical-align:top">'
            + esc(c) + '</t' + (i <= 1 ? 'h' : 'd') + '>');
        });
        h.push('</tr>');
      });
      h.push('</table></div></div>');
    }
    return h.join('');
  }

  function marketCard() {
    var h = [];
    var mp = MKT_READ;
    var fresh = mktFresh();
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 6px">펀드 완전판매자료 (증시전망)</h3>');
    h.push('<div class="hint" style="margin-bottom:12px">증시전망은 투자설명서에 없고 <b>지점에 내려오는 월간 자료</b>에 있습니다. '
      + '여기 한 번 올려 두면 <b>모든 펀드</b>의 「증시 현황 및 전망 설명」 항목에 그대로 쓰입니다. '
      + '평가에서는 <b>직전월 이후 발간</b> 자료만 최신자료로 인정합니다.</div>');
    h.push('<div class="card"><div class="card-b">');
    if (MKT.mktAsOf || MKT.mktView) {
      h.push('<div class="note" style="margin:0 0 12px;border-left-color:var(--' + (fresh === false ? 'warn' : 'ok') + ')">'
        + '<b>등록된 자료</b> — ' + esc(MKT.docName || '(파일명 없음)')
        + (MKT.mktAsOf ? ' · 기준 ' + esc(MKT.mktAsOf) : '')
        + (MKT.registeredAt ? ' · 등록 ' + esc(String(MKT.registeredAt).slice(0, 10)) : '')
        + (fresh === false ? '<br><b style="color:var(--warn)">직전월 이후 자료가 아닙니다 — 이대로 쓰면 최신자료로 인정되지 않습니다.</b>' : '')
        + '</div>');
    }
    if (!PROS.pdfAvailable()) {
      h.push('<div class="warnbox">PDF 판독 모듈을 불러오지 못했습니다. 아래 붙여넣기를 사용하십시오.</div>');
    } else {
      h.push('<input type="file" id="mktFile" accept="application/pdf" style="margin-bottom:10px">');
      h.push('<div class="hint">완전판매자료·증시전망 보고서 PDF를 올리면 기준월·전망 요약·업종을 읽어 옵니다. 외부 네트워크 없이 동작합니다.</div>');
      h.push('<div id="mktStat" class="note" style="margin:10px 0 0;display:none"></div>');
    }
    h.push('<div class="hint" style="margin:12px 0 6px">PDF 판독이 안 되면 자료 내용을 붙여넣고 「붙여넣은 내용에서 추출」 을 누르십시오.</div>');
    h.push('<textarea id="mktText" rows="5" placeholder="완전판매자료·증시전망 보고서 내용을 붙여넣으세요"></textarea>');
    h.push('<button class="tbtn primary" id="btnMktExtract" style="margin-top:8px">붙여넣은 내용에서 추출</button>');
    /* 판독 결과 — 창구에서 눈으로 확인하고 고칠 수 있어야 한다 (자료 서식이 지점마다 다르다) */
    if (mp) {
      var rd = mp.read;
      h.push('<div class="note" style="margin:12px 0 0;border-left-color:var(--' + (mp.count ? 'ok' : 'warn') + ')">'
        + '<b>판독 ' + (mp.count ? '완료' : '실패') + ' — ' + esc(mp.name) + '</b>'
        + (mp.pages ? ' · ' + mp.pages + '페이지' : '')
        + '<br>기준월 ' + (rd.asOf ? esc(rd.asOf) : '—')
        + ' · 기준일 ' + (rd.baseDate ? esc(rd.baseDate) : '—')
        + ' · 시황 ' + rd.outlook.length + '단락'
        + (rd.outlook.length ? ' (' + rd.outlook.map(function (o) { return esc(o.who || '?'); }).join('·') + ')' : '')
        + ' · 상품표 ' + rd.rows.length + '개'
        + ' · 성향↔등급 ' + (rd.profileMap ? '읽음' : '—')
        + (mp.count ? '' : '<br>자료 서식이 예상과 달라 항목을 못 찾았습니다. 아래 칸에 직접 적어 두셔도 됩니다.')
        + '</div>');
    }
    /* 지금 고른 펀드가 자료의 상품표에 있는지 — 있으면 그 수치가 스크립트에 들어간다 */
    if (MKT.rows && MKT.rows.length) {
      var mr = mktRow();
      h.push(mr
        ? '<div class="note" style="margin:10px 0 0;border-left-color:var(--ok)">'
          + '<b>이 펀드를 자료에서 찾았습니다</b> — ' + esc(mr.name)
          + (mr.recommended ? ' <span class="src man">추천상품</span>' : '')
          + '<br>1년 수익률 ' + esc(mr.ret1y) + '% (동종유형 ' + esc(mr.ret1yPeer) + '%)'
          + ' · 표준편차 ' + esc(mr.sd1y) + '% (동종유형 ' + esc(mr.sd1yPeer) + '%)'
          + ' · 총보수 ' + esc(mr.fee) + '% (동종유형 ' + esc(mr.feePeer) + '%)'
          + ' · 합성총보수 ' + esc(mr.feeSynth) + '%'
          + (mr.peerKind ? '<br>제로인 소유형 ' + esc(mr.peerKind) : '')
          + '<br><span style="color:var(--muted2)">이 수치가 카탈로그 수집분보다 앞서 스크립트에 들어갑니다 (사내 자료·A Class 기준).</span></div>'
        : '<div class="note" style="margin:10px 0 0">이 펀드는 자료의 상품표(' + MKT.rows.length + '개)에 없습니다 — '
          + '수익률·보수는 수집분과 투자설명서에서 채웁니다. 증시전망은 그대로 쓰입니다.</div>');
    }
    h.push('<div class="pgrid" style="margin-top:12px">');
    MKT_DEFS.forEach(function (f) {
      var got = mp && mp.map[f.id];
      var v = MKT[f.id];
      if (got != null && (v == null || v === '')) v = got;   /* 판독분을 미리 채워 둔다 */
      var empty = (v == null || v === '');
      h.push('<div class="pf' + (empty ? ' miss' : '') + '">');
      h.push('<div class="k"><span>' + esc(f.label) + '</span><span class="src ' + (empty ? 'no' : (got != null ? 'auto' : 'man')) + '">'
        + (empty ? '미입력' : (got != null && got === v ? '자료 판독' : '입력')) + '</span></div>');
      h.push('<textarea class="mInp" data-k="' + esc(f.id) + '" rows="' + (f.rows || 1) + '" placeholder="' + esc(f.ph || '') + '">' + esc(v == null ? '' : v) + '</textarea>');
      if (f.hint) h.push('<div class="h">' + esc(f.hint) + '</div>');
      h.push('</div>');
    });
    h.push('</div>');
    h.push('<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'
      + '<button class="tbtn primary" id="btnMktSave">이 자료로 등록</button>'
      + (MKT.mktAsOf || MKT.mktView ? '<button class="tbtn" id="btnMktClear">등록 해제</button>' : '') + '</div>');
    h.push('</div></div>');
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
    /**
     * 수집분에 이 펀드의 투자설명서 주소가 있으면 링크를 먼저 보여 준다.
     * 브라우저 보안 때문에 파일을 앱이 직접 받아올 수는 없다(다른 도메인이다).
     * 그래서 「열어서 내려받은 뒤 아래에 올리기」 가 가장 빠른 길이다.
     */
    if (sh.cat === 'fund' || sh.cat === 'irp') {
      var fc = fundCatByCode(p.id) || fundCatByName(p.name);
      var pu = fc && (fundDocUrl(fc, 'T') || fundDocUrl(fc, 'G'));
      if (pu) {
        h.push('<div class="note" style="margin:0 0 12px;border-left-color:var(--ok)"><b>이 펀드의 투자설명서 주소를 수집해 두었습니다.</b><br>'
          + '<a href="' + esc(pu) + '" target="_blank" rel="noopener">투자설명서 PDF 열기</a>'
          + (fundDocUrl(fc, 'G') ? ' · <a href="' + esc(fundDocUrl(fc, 'G')) + '" target="_blank" rel="noopener">간이투자설명서 PDF 열기</a>' : '')
          + (fc.docAt ? ' · 접수 ' + esc(fc.docAt) : '')
          + '<br>내려받아 아래에 올리면 보수·수수료 표까지 읽어 채웁니다. '
          + '(다른 도메인이라 브라우저가 앱의 직접 조회를 막습니다)</div>');
      }
    }
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

    /* 펀드 완전판매자료 (증시전망) — 펀드·IRP 에서만 쓴다 */
    if (sh.cat === 'fund' || sh.cat === 'irp') h.push(marketCard());

    /* 채권 — 회사 장외채권 화면의 유의사항 원문 */
    if (sh.cat === 'bondKrw' || sh.cat === 'bondFx') h.push(bondNoticeCard());

    /* 전 상품 공용 문구 */
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 6px">전 상품 공용 문구</h3>');
    h.push('<div class="hint" style="margin-bottom:12px">위험등급별 유의사항처럼 <b>상품이 아니라 판매회사 핵심(요약)설명서</b>에서 오는 문구입니다. '
      + '등급별로 한 번만 등록해 두면 모든 상품·모든 평가표에서 그대로 쓰입니다. 현재 상품 위험등급은 <b>'
      + esc(valueOf('riskGrade') || '—') + '등급</b> 이므로 그 항목이 스크립트에 들어갑니다.</div>');
    h.push('<div class="pgrid">');
    /* 시트에 쓰이는 것만 보여 준다 — IRP 계좌 조건을 펀드 화면에 늘어놓을 이유가 없다 */
    var cc = sheet().cat;
    COMMON_DEFS.filter(function (f) {
      if (!f.only) return true;
      if (f.only === 'irp') return cc === 'irp';
      if (f.only === 'bond') return cc === 'bondKrw' || cc === 'bondFx';
      return true;
    }).forEach(function (f) {
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
        /**
         * 고객 항목(투자자성향·가입유형 등)은 상품이 아니라 고객의 값이다.
         * 상품별 저장(man)에 넣으면 추천 펀드를 바꿀 때마다 다시 물어야 한다 —
         * 항목 정의에 ctx 가 붙은 것은 고객 단위(ST.ctx)로 담는다.
         */
        if (kind !== 'field') { ST.inline[key] = v; }
        else if (isCtxField(key)) { ST.ctx[key] = v; }
        else { setManual(key, v); }
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

    /* ---- 펀드 완전판매자료 (증시전망) ---- */
    /** 자료 본문을 판독해 화면에 미리 채운다 (등록은 「이 자료로 등록」 을 눌러야 된다) */
    function mktRead(text, name, pages) {
      var r = PROS.readMarket(text);
      /* 화면 칸에 미리 채울 값 (사람이 고칠 수 있어야 한다) */
      var map = {};
      if (r.asOf) map.mktAsOf = r.asOf;
      if (r.baseDate) map.mktBaseDate = r.baseDate;
      if (r.profileMap) map.mktProfileMap = r.profileMap;
      var n = (r.asOf ? 1 : 0) + (r.baseDate ? 1 : 0) + (r.profileMap ? 1 : 0)
        + r.outlook.length + r.rows.length;
      MKT_READ = { name: name, pages: pages || 0, map: map, read: r, count: n };
      renderAll();
    }
    var mf = $('#mktFile');
    if (mf) {
      mf.onchange = function () {
        var file = mf.files && mf.files[0];
        if (!file) return;
        var stat = $('#mktStat');
        stat.style.display = '';
        stat.textContent = '자료 판독 중… (' + file.name + ')';
        PROS.pdfToText(file, function (n, total) {
          stat.textContent = '자료 판독 중… ' + n + ' / ' + total + ' 페이지 (' + file.name + ')';
        }).then(function (r) {
          mktRead(r.text, file.name, r.pages);
        }).catch(function (e) {
          stat.className = 'warnbox';
          stat.textContent = '자료 판독 실패 (' + file.name + ') : ' + (e && e.message ? e.message : e)
            + ' — 아래 붙여넣기 칸을 사용하십시오.';
        });
      };
    }
    var mex = $('#btnMktExtract');
    if (mex) {
      mex.onclick = function () {
        var t = ($('#mktText') || {}).value || '';
        if (t.trim().length < 30) { alert('자료 내용을 붙여넣은 뒤 눌러 주십시오.'); return; }
        mktRead(t, '붙여넣은 내용', 0);
      };
    }
    /* 칸을 고치면 곧바로 담아 둔다 — 등록 버튼을 눌러야 저장된다 */
    Array.prototype.forEach.call(document.querySelectorAll('.mInp'), function (i) {
      i.onchange = function () { MKT[i.dataset.k] = i.value.trim(); };
    });
    var msv = $('#btnMktSave');
    if (msv) {
      msv.onclick = function () {
        /* 화면의 칸 값을 그대로 담는다 (판독분을 사람이 고친 것이 최종이다) */
        Array.prototype.forEach.call(document.querySelectorAll('.mInp'), function (i) {
          MKT[i.dataset.k] = i.value.trim();
        });
        if (!MKT.mktAsOf && !MKT.mktView && !(MKT_READ && MKT_READ.read.outlook.length)) {
          alert('기준월 또는 증시전망 요약 중 하나는 채워야 합니다.'); return;
        }
        if (MKT_READ) {
          MKT.docName = MKT_READ.name; MKT.pages = MKT_READ.pages;
          /* 시황 단락과 상품표는 화면 칸으로 고칠 값이 아니라 판독분을 그대로 담는다 */
          MKT.outlook = MKT_READ.read.outlook;
          MKT.rows = MKT_READ.read.rows;
        }
        MKT.registeredAt = new Date().toISOString();
        saveMkt();
        if (mktFresh() === false) {
          alert('등록했습니다.\n\n다만 자료 기준월(' + MKT.mktAsOf + ')이 직전월 이후가 아닙니다.\n'
            + '평가에서는 직전월 이후 발간 자료만 최신자료로 인정하므로, 최신 자료로 바꾸는 것이 안전합니다.');
        }
        renderAll();
      };
    }
    var mcl = $('#btnMktClear');
    if (mcl) {
      mcl.onclick = function () {
        if (!confirm('등록된 증시전망 자료를 지웁니다. 계속하시겠습니까?')) return;
        MKT = {}; MKT_READ = null; saveMkt(); renderAll();
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
        /**
         * 고객 항목(투자자성향·가입유형 등)은 상품이 아니라 고객의 값이다.
         * 상품별 저장(man)에 넣으면 추천 펀드를 바꿀 때마다 다시 물어야 한다 —
         * 항목 정의에 ctx 가 붙은 것은 고객 단위(ST.ctx)로 담는다.
         */
        if (kind !== 'field') { ST.inline[key] = v; }
        else if (isCtxField(key)) { ST.ctx[key] = v; }
        else { setManual(key, v); }
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
    /* 시간이 0 이면 초기화할 것이 없다 — 그때는 버튼을 감춰 둔다 */
    var rb = $('#btnTimerReset');
    if (rb) rb.hidden = !(ST.timer.running || ST.timer.acc > 0);
  }
  /** 타이머를 00:00 으로 되돌린다 (입력값·체크는 건드리지 않는다) */
  function timerReset() {
    /* 한참 재던 시간을 잘못 눌러 날리지 않도록, 1분을 넘겼으면 한 번 묻는다 */
    var ms = ST.timer.acc + (ST.timer.running ? Date.now() - ST.timer.base : 0);
    if (ms >= 60000 && !confirm('상담시간을 00:00 으로 되돌립니다.\n(입력값·체크는 그대로 남습니다)\n계속하시겠습니까?')) return;
    ST.timer = { running: false, base: 0, acc: 0 };
    var bt = $('#btnTimer');
    if (bt) bt.textContent = '상담 시작';
    tick();
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
    loadMkt();
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
    $('#btnTimerReset').onclick = timerReset;
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
