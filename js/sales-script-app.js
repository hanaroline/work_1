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

  /**
   * 진행 모드 — 'full'(기본) | 'expl'(상품설명의무 전용).
   * sales-script-expl.html 이 window.SS_MODE='expl' 로 켠다.
   *
   * 왜 화면을 따로 두나. 적합성원칙은 상담을 해 나가며 채워지는 부분이라
   * (투자자성향 진단 → 현재 투자자금성향 파악 → 적합/부적합 판정 → 추천),
   * 상품설명의무만 쓰려는 창구에는 그 입력칸이 전부 군더더기다. 이 모드는
   * 적합성원칙에 딸린 것(시나리오·투자자성향·현재 투자자금성향·추천상품)을
   * 통째로 걷어내고, 대신 상품 목록을 상품군 하나로 합쳐 놓는다 —
   * 상품을 고르면 평가표가 상품을 따라오고, 그 자리에서 스크립트가 완성된다.
   */
  var EXPL = window.SS_MODE === 'expl';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var LS = window.SS_MODE === 'expl' ? 'ss_state_expl_v1' : 'ss_state_v1';
  /**
   * 상담 상태를 어디에 담나.
   *
   * 설명의무 화면은 고객 한 사람을 앞에 두고 쓰는 화면이다. 여기 담기는 값
   * (투자자성향·현재 투자자금성향·고령여부·신규투자자)은 **그 고객의 값**이라,
   * localStorage 에 남기면 다음 고객 상담을 앞 고객의 답으로 시작하게 된다.
   * file:// 로 열면 내려받은 파일들이 저장소를 함께 쓰므로, 새로 받은 파일을
   * 열어도 지난 값이 그대로 떠 있었다 — 실제로 그 일이 났다.
   *
   * 그래서 이 화면은 sessionStorage 에 담는다. 새로고침에는 살아남고,
   * 창을 닫거나 새 탭에서 열면 처음부터다. 등록해 둔 상품·투자설명서·공용 문구는
   * 고객의 값이 아니라 지점의 자산이므로 종전대로 localStorage 에 남는다.
   */
  var STORE = (function () {
    try {
      var s = window.SS_MODE === 'expl' ? window.sessionStorage : window.localStorage;
      s.getItem(LS);   /* 접근 자체가 막힌 환경을 여기서 걸러 낸다 */
      return s;
    } catch (e) { return null; }
  })();
  var LS_PROD = 'ss_products_v1';   /* 담당자가 등록·저장한 상품 */
  var LS_DOCS = 'ss_docs_v1';       /* 상품별로 등록된 투자설명서 */
  var LS_TXT = 'ss_commontexts_v1'; /* 전 상품 공용 문구 (핵심요약설명서 표준 문구 등) */
  var LS_MKT = 'ss_market_v1';      /* 펀드 완전판매자료 (증시전망) — 그 달의 자료 하나 */

  /* ---------------- 상태 ---------------- */
  var ST = {
    baseSheet: 'fundFit',
    senior: true,             /* 고령투자자 여부 — 평가표 선택 차원 */
    /**
     * 설명의무 화면에서 「사람이 실제로 고른 것」 인지 표시한다.
     *
     * baseSheet·senior 에는 화면이 깨지지 않도록 기본값이 들어 있지만,
     * 상품군·적합여부·고령여부는 **고객마다 달라지는 판단**이라 기본값이 있으면
     * 안 된다. 고르지 않은 채로 시작해 놓고 기본값으로 스크립트를 뽑으면,
     * 창구는 자기가 고른 적 없는 조건으로 읽게 된다.
     */
    pick: { cat: false, scen: false, senior: false },
    productId: null,
    pman: {},     /* productId -> { fieldId: 값 } — 상품별 입력/수정값 */
    inline: {},   /* «라벨» -> 사용자가 입력한 값 */
    checks: {},   /* 'sheet|itemId' -> [bool,...] */
    /* 부적합 시나리오에서 「성향에 적합해 먼저 권유하는 상품」 — cat -> productId
       ('__none' 은 적합한 상품이 없다고 안내하는 경우다) */
    rec: {},
    /**
     * 진행 파트 — 'all' | 'suit'(적합성원칙) | 'expl'(상품설명의무).
     *
     * 적합성원칙은 상담을 해 나가면서 단계별로 값이 채워진다 (투자자성향 진단,
     * 현재 투자자금성향 파악, 부적합이면 추천·재지목…). 그래서 상담 前에는
     * 절대 다 채울 수 없다. 그런데 상품설명의무는 상품만 고르면 그 자리에서
     * 다 채워진다.
     * 한 덩어리로 두면, 이미 다 채워진 상품설명의무까지 「확인필요 10건」 을
     * 안은 채로 읽기모드에 들어가게 된다. 그래서 파트를 갈라 따로 진행한다.
     */
    part: EXPL ? 'expl' : 'all',
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
   * 담당자가 등록해 둔 투자설명서 목록.
   * 자동수집분(카탈로그·판독 결과)은 여기 담기지 않는다 — doc() 이 없을 때만 붙여 쓴다.
   * 그래서 이 목록을 비워도 자동수집분은 그대로 다시 조회된다.
   */
  function docEntries() {
    var out = [];
    Object.keys(DOCS).forEach(function (cat) {
      Object.keys(DOCS[cat] || {}).forEach(function (pid) {
        var d = DOCS[cat][pid] || {};
        out.push({ cat: cat, pid: pid, name: d.docName || pid, source: d.source || '' });
      });
    });
    return out;
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
  /* 판독분에 섞여 든 잘못된 보수·수수료 값을 거르는 잣대 (판독기와 같은 기준) */
  function feeRateLikeApp(v) {
    var t = String(v == null ? '' : v).trim();
    if (!t) return false;
    if (/없음|면제|해당\s*없|미징구|징구하지\s*않/.test(t) && t.length <= 30) return true;
    return /\d+(?:\.\d+)?\s*%/.test(t) && t.length <= 40;
  }
  function rateNumLikeApp(v) {
    var t = String(v == null ? '' : v).trim();
    return /^\d+(?:\.\d+)?\s*%?$/.test(t) && parseFloat(t) <= 20;
  }
  /**
   * 발행 클래스 목록에 A 계열이 있는가 — 선취판매수수료를 말할 수 있는 펀드인가.
   *
   * 목록은 원천마다 제각각으로 들어온다: "C,C-e,S-P" · "A,Ae" · "-A" ·
   * "A-E(수수료선취-온라인" · 화면 표시용으로 「 · 」 로 이어 붙인 것까지.
   * A 로 시작하는 토큰이 하나라도 있으면 A 계열이다 (A · A1 · Ae · A-e · A-E 모두
   * 선취형이고, 뒤의 e 는 온라인 전용이라는 뜻일 뿐이다). 앞에 붙은 기호는 떼고 본다.
   * 「A 뒤에 바로 구분자」 로만 보면 "Ae" 와 "-A" 를 A 없음으로 잘못 읽는다.
   */
  function clsHas(cls, letter) {
    var re = new RegExp('^[^0-9A-Za-z가-힣]*' + letter, 'i');
    return String(cls == null ? '' : cls).split(/[,·]/).some(function (t) {
      return re.test(t.trim());
    });
  }
  function clsHasA(cls) { return clsHas(cls, 'A'); }

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
    var exSrc = ex ? '판매회사 수집분' : null;
    /**
     * 두 번째 원천 — 금융투자협회 전자공시.
     *
     * 판매회사 원천(카탈로그)에 설명서 주소가 없는 종목이 3,194개 중 175개다
     * (목표전환형·사모투자재간접·지수연계가 대부분이고 대개 최근 설정분).
     * 그 종목은 설명서에서만 나오는 항목이 통째로 「확인필요」로 남았다.
     * 금투협은 공모펀드 투자설명서를 법정 공시하므로 그 빈자리를 메운다.
     *
     * 순서는 판매회사 수집분이 먼저다 — 항목 추출률이 더 높고, 두 원천이 같은
     * 종목을 가질 때 값이 갈리면 창구가 어느 쪽을 읽는지 알 수 없게 된다.
     * 금투협은 「없을 때만」 쓴다.
     */
    if (!ex) {
      var FK = window.FUND_PROSPECTUS_KOFIA;
      var kx = (FK && FK.items && FK.items[it.code]) || null;
      if (kx) { ex = kx; FP = FK; exSrc = '금융투자협회 전자공시'; }
    }
    if (ex) {
      /* 값은 pool 에 한 번만 담고 항목은 번호로 가리킨다 (문구가 펀드마다 겹친다) */
      var pl = FP.pool;
      /**
       * A클래스를 발행하지 않는 펀드에 A클래스 수수료가 붙어 있으면 그것은 오독이다.
       *
       * 연금저축·퇴직연금 전용 펀드는 C 계열만 발행하는데(카탈로그 cls = "C"),
       * 판독분에 「납입금액의 5%」 같은 값이 clsA 로 들어온 것이 있다. 본문의 다른
       * 5% 를 집어 온 것이다. 그러면 같은 화면에서 「선취판매수수료를 받는 A클래스를
       * 발행하지 않습니다」(clsFeeNote) 와 「판매수수료는 5% 로 …」(feeCalcNote) 가
       * 나란히 읽히게 된다 — 창구가 고객 앞에서 서로 어긋나는 말을 하게 되는 것이다.
       * 발행 클래스가 그렇게 말하고 있으면 A클래스 값은 담지 않는다.
       */
      var clsStr = String(it.cls || '');
      var noAcls = !!clsStr && !clsHasA(clsStr);
      /**
       * 「중도환매 시 비용발생 (환매수수료 부과)」 가 근거 없이 붙어 있는 것을 걷어낸다.
       *
       * 앞 판의 판독기는 환매수수료 「없음」 을 못 읽으면 그것을 곧바로 「부과」 라고
       * 단정했다. PDF 에서 「없 음」 처럼 글자 사이가 벌어지면 못 읽는데, 판독분
       * 3,014건 중 255건이 「부과」 로 담겼고 그중 222건은 환매수수료 값이 아예 없다 —
       * 부과된다고 말할 근거가 없다는 뜻이다. 그대로 두면 원문에 「없음」 이라고 쓰인
       * 펀드를 두고 창구가 고객에게 환매수수료가 붙는다고 말하게 된다.
       * 판독기는 고쳤지만 이미 담긴 결과가 그대로이므로 여기서 중립 문구로 되돌린다.
       * (환매수수료 자체는 확인필요로 남아 창구가 설명서를 보고 채운다)
       */
      var liqIdx = ex.liqRisk;
      var liqTxt = liqIdx === undefined ? '' : String((pl && typeof liqIdx === 'number') ? pl[liqIdx] : liqIdx);
      var liqUnfounded = /환매수수료\s*부과/.test(liqTxt) && ex.redeemFee === undefined;
      Object.keys(ex).forEach(function (k) {
        var v = ex[k];
        v = (pl && typeof v === 'number') ? pl[v] : v;
        if (k === 'liqRisk' && liqUnfounded) v = '중도환매 허용 (개방형)';
        /**
         * 보수·수수료 값이 값처럼 생겼는지 여기서 한 번 더 본다.
         *
         * 이미 담긴 판독분에는 표의 클래스 칸을 값으로 집어 온 것이 섞여 있다
         * (선취수수료 3,014건 중 137건이 「A」·「A-e」·설명 문장, 총보수는 77건).
         * 그대로 쓰면 화면은 「등록됨」 인데 계산 문장은 만들어지지 않아, 창구가
         * 무엇이 잘못됐는지 알 수 없다. 값이 아니면 아예 담지 않아 「확인필요」 로 남긴다.
         * 판독 규칙 자체도 고쳤으므로 다음 수집분부터는 이 거르기에 걸릴 것이 없다.
         */
        if (k === 'clsA' && !feeRateLikeApp(v)) return;
        if ((k === 'clsAExp' || k === 'clsCExp') && !rateNumLikeApp(v)) return;
        if (noAcls && (k === 'clsA' || k === 'clsAExp')) return;
        put(k, v);
      });
    }
    return {
      source: 'COLLECT',
      docName: it.name + ' (공모펀드 수집분)',
      docUrl: fundDocUrl(it, 'T') || fundDocUrl(it, 'G') || '',
      registeredAt: (fundCat() || {}).updatedAt || '',
      fields: f, schedule: [], matBarrier: null, knockIn: '', rawText: '',
      collected: true, catalogCode: it.code,
      /**
       * 설명서 원문을 실제로 판독했는지. 카탈로그만으로도 이 doc 이 만들어지므로
       * 이것을 남기지 않으면 화면이 원문 없이도 「등록됨」 이라고 말한다 —
       * 창구는 등록됐다는데 확인필요가 열 몇 건인 것을 보고 고장으로 여긴다.
       */
      prosRead: !!ex,
      prosSrc: exSrc,
      docMissing: !(it.docT || it.docG)
    };
  }

  /**
   * 카탈로그에 투자설명서 주소가 없는 종목 수. 화면이 「이 펀드만 그런 것이 아니다」 를
   * 사실로 말할 수 있게 세어 둔다 — 숫자를 글에 박아 두면 다음 수집 때 바로 틀린 수가 된다.
   */
  var _noDocCount = null;
  function fundNoDocCount() {
    if (_noDocCount != null) return _noDocCount;
    var F = fundCat();
    var items = (F && F.items) || [];
    var n = 0;
    for (var i = 0; i < items.length; i++) if (!items[i].docT && !items[i].docG) n++;
    _noDocCount = { miss: n, total: items.length };
    return _noDocCount;
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

  /* ==========================================================
     투자자 유형 및 금융투자상품 위험도 분류표
     ----------------------------------------------------------
     원천 : 미래에셋증권 「투자자 유형 및 금융투자상품 위험도 분류표」 (2025.11.24)
            담당자가 준 사내 배포본 1/2 쪽

     이 표가 세 가지를 확정해 준다 —
       ① 사내 투자자구분은 5가지다 (성장형·성장추구형·위험중립형·안정추구형·안정형).
          앞 판은 공격투자형·적극투자형을 쓰고 있었는데 사내 명칭이 아니다.
       ② 위험등급은 6단계다 (1등급 매우높은위험 ~ 6등급 매우낮은위험).
          회사 홈페이지 채권 설명 화면(p02)에 실린 5단계 표는 옛 판이다.
       ③ 상품군별 위험등급 분류 근거 — 창구가 손으로 넣던 값이다.

     ★ 문구를 우리가 짓지 않는다. 표의 칸을 그대로 옮긴다.
     ========================================================== */
  var RISK_TABLE = {
    asOf: '2025-11-24',
    source: '미래에셋증권 「투자자 유형 및 금융투자상품 위험도 분류표」 (2025.11.24)',
    grades: [
      { n: 1, label: '매우높은위험' }, { n: 2, label: '높은위험' }, { n: 3, label: '다소높은위험' },
      { n: 4, label: '보통위험' }, { n: 5, label: '낮은위험' }, { n: 6, label: '매우낮은위험' }
    ],
    /* 표 맨 아랫줄 「투자자구분」 — 그 성향이 가입할 수 있는 등급이다.
       grades 의 첫 값이 그 성향이 가입할 수 있는 가장 위험한 등급이다. */
    profiles: [
      { name: '성장형', grades: [1, 2, 3, 4, 5, 6] },
      { name: '성장추구형', grades: [2, 3, 4, 5, 6] },
      { name: '위험중립형', grades: [4, 5, 6] },
      { name: '안정추구형', grades: [5, 6] },
      { name: '안정형', grades: [6] }
    ],
    /* 상품군 × 등급 — 표의 칸 그대로 */
    rows: [
      { key: '채권 (국내)', note: 1, cats: ['bondKrw'], cells: {
        1: '회사채(BB+ 이하)', 2: '회사채(BBB-)', 3: '회사채(BBB0 ~ BBB+)',
        4: '회사채(A- ~ A+)', 5: '회사채(AA- ~ AAA)', 6: '국고채, 통안채, 지방채, 특수채' } },
      { key: '채권 (해외 · S&P·피치)', note: 1, cats: ['bondFx'], cells: {
        1: 'B+ 이하', 2: 'BB- ~ BB+', 3: 'BBB- ~ BBB+', 4: 'A- ~ A+', 5: 'AA- 이상' } },
      { key: '채권 (해외 · 무디스)', note: 1, cats: ['bondFx'], cells: {
        1: 'B1 이하', 2: 'Ba3 ~ Ba1', 3: 'Baa3 ~ Baa1', 4: 'A3 ~ A1', 5: 'Aa3 이상' } },
      { key: 'CP / 단기사채', cats: [], cells: {
        1: 'B 이하', 2: 'A3-', 3: 'A30 ~ A3+', 4: 'A2- ~ A2+', 5: 'A1' } },
      { key: '조건부자본증권 (신종 Tier1)', note: 2, cats: [], cells: {
        1: '그 외', 2: '정부결손보전은행' } },
      { key: '조건부자본증권 (후순위 Tier2)', note: 2, cats: [], cells: {
        1: '그 외', 2: '시스템적 중요은행, 시스템적 중요은행지주', 3: '정부결손보전은행' } },
      { key: 'ELS · DLS', note: 3, cats: ['els'], cells: {
        2: '최대원금손실 가능금액 20% 초과형', 3: '원금의 80% 이상 지급형',
        4: '원금의 90% 이상 지급형', 5: '원금의 95% 이상 지급형' } },
      { key: '파생결합사채 (ELB · DLB)', cats: [], span: '발행 금융회사의 신용등급에 대응하는 채권의 위험등급 준용' },
      { key: '집합투자기구 (펀드)', note: 7, cats: ['fund', 'irp'], span: '운용사 표기 — 1등급(매우높은위험) ~ 6등급(매우낮은위험)' },
      { key: 'ETF (국내)', note: 6, cats: [], span: '운용사 표기 — 1등급(매우높은위험) ~ 6등급(매우낮은위험)' },
      { key: 'ETF (해외)', note: 6, cats: [], cells: { 1: '1등급' } },
      { key: '신탁', note: 8, cats: [], span: '편입 가능 투자대상 자산의 최고 위험등급' },
      { key: '주식', cats: [], cells: {
        1: '비상장주식, 해외주식, 신용거래, 투자주의·경고·위험·관리종목', 2: '주식' } },
      { key: 'ELW', cats: [], cells: { 1: 'ELW' } },
      { key: 'ETN', note: 5, cats: [], cells: { 1: '일반 ETN', 2: '손실제한 ETN', 4: 'CD+α금리 ETN' } },
      { key: '장내파생상품', cats: [], cells: { 1: '국내/해외 선물옵션' } },
      { key: '장외파생상품', cats: [], cells: { 1: '장외파생상품' } },
      { key: '당사 발행어음', note: 11, cats: [], cells: { 4: '외화발행어음', 5: '원화발행어음 / 발행어음형 CMA' } },
      { key: '당사 RP', note: 11, cats: [], cells: { 5: '외화 RP', 6: '원화 RP / RP형 CMA' } },
      { key: '예금 · 타사 RP · MMDA · 원리금보장형', note: 12, cats: [], span: '발행 금융회사의 신용등급에 대응하는 채권의 위험등급 준용' },
      { key: 'DC·IRP·ISA 편입 예금 · 현금성자산', cats: [], note: 13, cells: { 6: '예금 등 예금자보호 대상상품, 현금성자산' } }
    ],
    /* 2/2 쪽 [공통사항] */
    common: [
      '외화상품은 환헤지가 되지 않으면 상기 분류표에서 위험도 단계 상향 조정함 (예외: 외화 RP, 외화 발행어음)'
        + ' — 1단계 상향 통화: USD, EUR, GBP, JPY / 상기 상향 이외의 통화는 2단계 상향 조정함',
      '신용등급은 다수의 적격 신용평가사의 신용등급이 존재할 경우, 가장 높은 등급을 제외한 나머지 등급 중 좋은 등급(Second Best)을 사용',
      '고난도 금융투자상품의 경우 상기 표 등급과 관계없이 개별 검토하여 2등급 이상으로 결정함'
    ],
    /* 2/2 쪽 [주석사항] — 표의 주N) 과 번호가 맞는다 */
    notes: {
      1: '보증채는 보증기관과 발행기관의 신용등급 중 가장 높은 신용등급을 기준으로 위험도를 산정함. '
        + 'KP물은 발행사의 국내 신용등급에 대응하는 국내채권의 위험등급을 기준으로 산정함',
      2: '정부결손보전은행: 산업은행, 중소기업은행, 수출입은행 / '
        + '시스템적 중요은행, 시스템적 중요은행지주회사: 금융위원회에서 지정한 기관에 한함',
      3: '다음 어느 하나에 해당하는 경우 각 1개 등급 상향 — '
        + '① 기초자산의 수가 3개를 초과하는 경우 '
        + '② 기초자산의 종류가 부동산·특별자산 등 기초자산에 연계되어 상품구조에 대한 투자자의 이해가능성이 낮은 경우 '
        + '③ 기초자산 가격이 과거 10년간 기초자산의 일간수익률의 연환산 표준편차가 25%를 초과하는 경우 '
        + '④ 원금손실조건: 낙인 배리어가 60% 이상인 경우 또는 노낙인형 상품일 때 만기배리어 요건이 70% 이상인 경우 '
        + '(※ NO KI(노낙인) 상품은 마지막 배리어를 기준으로 위험등급을 부여함) '
        + '⑤ 레버리지 여부 (손실발생구간의 손실배수가 기초자산 변동률의 1배를 초과하는 경우) '
        + '⑥ 발행사의 신용위험도가 A- 미만인 경우',
      4: '발행사의 신용위험도가 A- 미만인 경우 1개 등급 상향',
      5: '손실제한 ETN은 레버리지가 아닌 원금부분보장형 ETN에 한함',
      6: '해외상장 ETF는 운용사의 위험등급 분류기준이 부재하고, 펀드평가사·제도권에서도 위험등급을 제공하고 있지 않으며, '
        + '환위험에 노출되므로 일괄 1등급으로 적용함',
      7: '집합투자증권의 경우 운용사 표기 위험등급이 없을 경우 재무적 자료에 근거하여 개별 검토하여 2등급 이상으로 결정함',
      8: '타사에서 발행한 RP, 발행어음 등을 편입할 경우 발행 금융회사의 신용등급에 대응하는 채권의 위험등급 준용',
      9: '랩 위험등급은 편입 자산별 금액가중치를 보정한 값으로 산정. '
        + '(ETF/펀드/주식/CMA) 랩 이외의 랩 상품은 기타랩으로 보고 기타랩의 위험등급을 산정',
      10: '당사 자문계약의 경우 편입 자산별 금액가중치를 보정한 값으로 산정. '
        + '외부자문사 상품은 해당 외부자문사가 선정한 위험등급을 준용함',
      11: '당사 신용등급이 A+ 이하로 조정될 경우 등급 상향',
      12: '퇴직연금 DB 원리금보장형은 예금자보호 기준등급 준용',
      13: '예금자보호대상 상품: 예금, 원리금보장형, 종금사 발행어음 등'
    },
    /* 공통사항 ① 을 계산에 쓰기 위한 값 */
    fxStep: { one: ['USD', 'EUR', 'GBP', 'JPY'], other: 2, except: ['외화 RP', '외화 발행어음'] }
  };
  /** 등급 숫자 -> 명칭 */
  function gradeLabel(n) {
    for (var i = 0; i < RISK_TABLE.grades.length; i++) {
      if (RISK_TABLE.grades[i].n === +n) return RISK_TABLE.grades[i].label;
    }
    return '';
  }
  /** 그 성향이 가입할 수 있는 등급 목록 */
  function profileGrades(name) {
    for (var i = 0; i < RISK_TABLE.profiles.length; i++) {
      if (RISK_TABLE.profiles[i].name === String(name || '').trim()) return RISK_TABLE.profiles[i].grades;
    }
    return null;
  }
  /**
   * 국제신용등급 -> 분류표상 「채권(해외)」 등급.
   * S&P·피치 표기와 무디스 표기를 모두 본다. 표에 없는 표기(「채권별로 상이」
   * 같은 것)는 null 을 준다 — 짐작해서 등급을 매기지 않는다.
   */
  function fxBaseGrade(credit) {
    var t = String(credit || '').toUpperCase().replace(/\s/g, '');
    if (!t) return null;
    /* 무디스 표기가 먼저다 — Aa3 를 A 로 잘못 읽지 않도록 */
    if (/^AAA|^AA[123]/.test(t)) return 5;          /* Aaa · Aa1~Aa3 이상 */
    if (/^A[123]$/.test(t)) return 4;               /* A1 ~ A3 */
    if (/^BAA[123]/i.test(t)) return 3;             /* Baa1 ~ Baa3 */
    if (/^BA[123]/i.test(t)) return 2;              /* Ba1 ~ Ba3 */
    if (/^B[123]/.test(t)) return 1;                /* B1 이하 */
    /* S&P · 피치 표기 */
    if (/^AA[+-]?$|^AAA$/.test(t)) return 5;        /* AA- 이상 */
    if (/^A[+-]?$/.test(t)) return 4;               /* A- ~ A+ */
    if (/^BBB[+-]?$|^BBB0$/.test(t)) return 3;      /* BBB- ~ BBB+ */
    if (/^BB[+-]?$|^BB0$/.test(t)) return 2;        /* BB- ~ BB+ */
    if (/^B[+-]?$|^CCC|^CC|^C$|^D$/.test(t)) return 1;
    return null;
  }
  /**
   * 외화채권의 위험등급 — 공통사항 ① 을 적용한다.
   * 「외화상품은 환헤지가 되지 않으면 상기 분류표에서 위험도 단계 상향 조정함
   *  (예외: 외화 RP, 외화 발행어음) — 1단계 상향 통화: USD, EUR, GBP, JPY /
   *  상기 상향 이외의 통화는 2단계 상향 조정함」
   * 외화채권은 예외가 아니고, 회사 설명 문구도 「환헤지거래는 수행하지
   * 않습니다」 라고 적고 있으므로 상향이 적용된다.
   * 계산 과정을 함께 돌려주어 화면에서 눈으로 검산할 수 있게 한다.
   */
  function fxRiskGrade(credit, ccy) {
    var base = fxBaseGrade(credit);
    if (base == null) return null;
    var cc = String(ccy || '').toUpperCase().trim();
    if (!cc) return null;
    var step = RISK_TABLE.fxStep.one.indexOf(cc) >= 0 ? 1 : RISK_TABLE.fxStep.other;
    var g = Math.max(1, base - step);       /* 숫자가 작을수록 위험하다 */
    return {
      base: base, step: step, grade: g, ccy: cc, credit: String(credit),
      why: '국제신용등급 ' + credit + ' → 분류표 「채권(해외)」 ' + base + '등급('
        + gradeLabel(base) + '), 환헤지를 하지 않는 ' + cc + ' 상품이므로 '
        + step + '단계 상향 → ' + g + '등급(' + gradeLabel(g) + ')'
    };
  }

  /** 그 등급을 가입할 수 있는 성향 이름들 (위험한 성향부터) */
  function gradeProfiles(n) {
    return RISK_TABLE.profiles.filter(function (p) { return p.grades.indexOf(+n) >= 0; })
      .map(function (p) { return p.name; });
  }

  /**
   * 투자자성향 — 사내 명칭은 5가지다 (위험도 분류표 2025.11.24 맨 아랫줄).
   * 앞 판은 공격투자형·적극투자형을 쓰고 있었는데 사내 명칭이 아니다.
   * 성향명을 잘못 말하면 그 자체로 부정확한 설명이 된다.
   *
   * 설명문 원천 : 사내 전산 「[ 투자자성향 결과별 안내사항 ]」 화면
   *              (투자자성향 / 투자자 성향별 결과 안내사항 두 칸 표) — 담당자 제공
   *
   * ★ 표의 칸을 그대로 옮긴다. 앞 판은 이 화면을 보지 못한 채 넷을 적어 두었는데
   *   셋이 원문과 달랐다 —
   *     위험중립형  「일정 수준의 손실위험을 감수」 → 원문은 「손실을 감수」,
   *                 원문의 「상당히 높은 수익」 에서 「상당히」 가 빠져 있었다.
   *     안정추구형  「이자소득이나 배당소득 수준의」 는 원문에 없는 말이었고,
   *                 「자산 중 일부를 변동성 있는 상품에 투자할 의향이 있는」 이 빠져 있었다.
   *     성장추구형  뜻은 같았으나 「주식, 주식형펀드」 를 「주식·주식형 펀드」 로 바꿔 적었다.
   *   설명문은 「성향명만 말하면 미인정」 인 배점 항목이라 원문과 달라지면 안 된다.
   *
   * 문장이 「성장형 고객은 …」 으로 성향명을 이미 품고 있으므로, 스크립트에서는
   * 앞에 성향명을 덧붙이지 않고 이 문장만 읽는다 (c_diagDoc 참조).
   *
   * 원문의 「예.적금」·「타입 입니다」 는 화면에 그렇게 적혀 있다. 우리 오타가 아니니
   * 고치지 말 것 — 원문과 대조할 때 어긋난다.
   */
  var PROFILES = {
    '성장형': '성장형 고객은 시장평균수익률을 훨씬 넘어서는 높은 수준의 투자 수익을 추구하며, 이를 위해 자산가치의 변동에 따른 손실위험을 적극 수용하여 투자자금의 대부분을 주식, 주식형펀드 또는 파생상품 등에 투자하는 고객 유형입니다.',
    '성장추구형': '성장추구형 고객은 투자원금을 보전하는 것 보다는 투자수익을 추구하는 타입입니다. 따라서, 투자자금의 상당 부분을 주식, 주식형펀드 등에 투자하는 고객 유형입니다.',
    '위험중립형': '위험중립형 고객은 투자수익에는 그에 상응하는 투자위험이 있음을 충분히 인식하고 있는 타입으로, 예.적금보다 상당히 높은 수익을 기대할 수 있다면 손실을 감수할 수 있는 고객 유형입니다.',
    '안정추구형': '안정추구형 고객은 투자원금의 손실위험은 최소화하고 안정적인 투자 수익을 목표로 하는 타입 입니다. 다만, 수익을 위해 단기적인 손실을 수용할 수 있으며, 자산 중 일부를 변동성 있는 상품에 투자할 의향이 있는 고객 유형입니다.',
    '안정형': '안정형 고객은 예금 또는 적금 수준의 수익률을 기대하며, 투자원금에 손실이 발생하는 것을 원하지 않는 고객 유형입니다.'
  };
  /**
   * 지난 판이 쓰던 설명문 — 사내 원문 화면을 보기 전에 적어 둔 것이다.
   * 이미 저장된 화면에서 이 문장을 원문으로 갈아 주기 위해서만 쓴다.
   * 여기서 지우면 그 화면들이 옛 문장을 그대로 읽게 되므로 지우지 말 것.
   */
  var SUPERSEDED = {
    '투자원금을 보전하는 것보다는 투자수익을 추구하는 타입입니다. 따라서 투자자금의 상당 부분을 주식·주식형 펀드 등에 투자하는 고객 유형입니다.': 1,
    '투자에 상응하는 투자위험이 있음을 충분히 인식하고 있으며, 예·적금보다 높은 수익을 기대할 수 있다면 일정 수준의 손실위험을 감수할 수 있는 고객 유형입니다.': 1,
    '투자원금의 손실위험은 최소화하고 이자소득이나 배당소득 수준의 안정적인 투자를 목표로 하는 타입입니다. 다만 수익을 위해 단기적인 손실을 수용할 수 있는 고객 유형입니다.': 1,
    '예금 또는 적금 수준의 수익률을 기대하며, 투자원금에 손실이 발생하는 것을 원하지 않는 고객 유형입니다.': 1
  };

  /**
   * 그 성향의 설명문 — 사내 문장이 있으면 그것, 없으면 창구가 적어 둔 것.
   *
   * 성장형은 사내 문장을 확보하지 못해 PROFILES 가 비어 있다. 창구가 진단서에서
   * 한 번 옮겨 적으면 ST.ctx.profMeanings 에 그 성향의 것으로 남고, 다음에 같은
   * 성향을 고르면 다시 나온다 — 상품을 바꿔도, 다음 상담에도 그대로다.
   */
  function meaningFor(profile) {
    if (!profile) return '';
    if (PROFILES[profile]) return PROFILES[profile];
    var mine = ST.ctx && ST.ctx.profMeanings;
    return (mine && mine[profile]) || '';
  }

  /**
   * 현재 투자자금성향 확인서의 보기 — 사내 서식 문항 그대로.
   *
   * 손실감내수준은 원금보존태도의 하위 문항이다(2-1). 원금보존태도에서
   * 「손실위험이 있더라도 투자수익을 추구함」 을 고른 경우에만 답할 수 있다.
   */
  var CASH_OPTS = {
    cashPurpose: ['여유자금(투자자금)', '사업자금', '교육자금', '노후자금'],
    cashPrincipal: ['손실위험이 있더라도 투자수익을 추구함', '투자원금은 보존되어야 함'],
    cashLoss: ['전액손실 가능', '70% 손실 가능', '50% 손실 가능', '20% 손실 가능', '10% 손실 가능'],
    cashHorizon: ['상품만기일까지 보유', '3년 초과', '1년~3년', '1년 미만']
  };
  var CASH_FIELDS = [
    ['cashPurpose', '투자목적'], ['cashPrincipal', '원금보존태도'],
    ['cashLoss', '손실감내수준'], ['cashHorizon', '투자예정기간']
  ];
  /** 손실감내수준은 원금보존태도에서 「손실위험이 있더라도…」 를 고른 경우에만 답한다 */
  function cashLossOpen() { return ST.ctx.cashPrincipal === CASH_OPTS.cashPrincipal[0]; }

  /**
   * 적합성보고서 발급 대상 판정에 쓰는 현재 투자자금성향 적합 요건.
   * 네 항목을 **모두** 만족해야 적합하고, 하나라도 어긋나면 부적합이다.
   */
  var CASH_FIT = {
    cashPurpose: { ok: function (v) { return v !== '노후자금'; }, rule: '노후자금이 아니어야 적합' },
    cashPrincipal: { ok: function (v) { return v === CASH_OPTS.cashPrincipal[0]; }, rule: '「손실위험이 있더라도 투자수익을 추구함」 이어야 적합' },
    cashLoss: { ok: function (v) { return v === '전액손실 가능'; }, rule: '「전액손실 가능」 이어야 적합' },
    cashHorizon: { ok: function (v) { return v !== '1년 미만'; }, rule: '1년 미만이 아니어야 적합' }
  };
  /**
   * @returns {{rows:Array, complete:boolean, fit:boolean, badCount:number}}
   *   rows  항목별 { key, label, value, state: 'ok'|'bad'|'empty', rule }
   *   complete  네 항목을 다 골랐는가 (원금보존태도가 「보존되어야 함」 이면
   *             손실감내수준은 답할 수 없으므로 그것으로 판정을 끝낸다)
   */
  function cashFit() {
    var ctx = ST.ctx, rows = [], bad = 0, empty = 0;
    CASH_FIELDS.forEach(function (f) {
      var key = f[0], v = ctx[key] || '';
      if (key === 'cashLoss' && !cashLossOpen()) {
        /* 답할 수 없는 문항이다. 원금보존태도가 이미 부적합이라 판정에는 영향이 없다. */
        rows.push({ key: key, label: f[1], value: '(답변 대상 아님)', state: 'skip', rule: CASH_FIT[key].rule });
        return;
      }
      if (!v) { empty++; rows.push({ key: key, label: f[1], value: '', state: 'empty', rule: CASH_FIT[key].rule }); return; }
      var ok = CASH_FIT[key].ok(v);
      if (!ok) bad++;
      rows.push({ key: key, label: f[1], value: v, state: ok ? 'ok' : 'bad', rule: CASH_FIT[key].rule });
    });
    return { rows: rows, complete: empty === 0, fit: empty === 0 && bad === 0, badCount: bad };
  }

  /* ---------------- 저장 / 복원 ---------------- */
  function save() {
    try {
      if (!STORE) return;
      STORE.setItem(LS, JSON.stringify({
        baseSheet: ST.baseSheet, senior: ST.senior, productId: ST.productId,
        pman: ST.pman, inline: ST.inline, checks: ST.checks, ctx: ST.ctx, rec: ST.rec, part: ST.part,
        pick: ST.pick
      }));
    } catch (e) { /* 사생활 보호 모드 등에서 저장 실패 — 무시 */ }
  }
  function load() {
    try {
      if (!STORE) return;
      var raw = STORE.getItem(LS);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o.baseSheet && BASE_SHEETS[o.baseSheet]) ST.baseSheet = o.baseSheet;
      if (typeof o.senior === 'boolean') ST.senior = o.senior;
      if (o.productId) ST.productId = o.productId;
      ['pman', 'inline', 'checks', 'rec'].forEach(function (k) { if (o[k]) ST[k] = o[k]; });
      if (o.pick) ST.pick = { cat: !!o.pick.cat, scen: !!o.pick.scen, senior: !!o.pick.senior };
      if (!EXPL && o.part && PARTS[o.part]) ST.part = o.part;
      /* 구버전(상품 구분 없는 manual) 저장값 이관 */
      if (o.manual && o.productId) {
        ST.pman[o.productId] = Object.assign({}, o.manual, ST.pman[o.productId] || {});
      }
      if (o.ctx) Object.keys(o.ctx).forEach(function (k) { ST.ctx[k] = o.ctx[k]; });
      /*
       * 성향은 저장돼 있는데 의미가 비어 있는 경우를 메운다.
       *
       * 앞 판은 의미를 성향 드롭다운의 onchange 에서만 채웠다. 그래서 성향을 고른
       * 뒤 저장된 화면을 다시 열면 onchange 가 돌지 않아 의미가 빈 채로 남고,
       * 「확인필요」 에 그대로 떴다. 사내 문장이 생긴 뒤에도 이미 성향을 골라 둔
       * 창구에는 채워지지 않는다 — 열 때 한 번 메운다.
       */
      if (ST.ctx.custProfile && !ST.ctx.custProfileMeaning) {
        ST.ctx.custProfileMeaning = meaningFor(ST.ctx.custProfile);
      }
      /*
       * 지난 판이 저장해 둔 설명문이 원문과 다른 것이면 원문으로 갈아 준다.
       *
       * 사내 「투자자성향 결과별 안내사항」 화면을 보기 전에 적어 둔 문장 중 셋이
       * 원문과 달랐다(위험중립형·안정추구형은 뜻까지 어긋났다). 이미 그 문장이
       * 저장된 화면은 비어 있지 않으므로 위의 메우기로는 고쳐지지 않는다.
       * 그 문장을 그대로 들고 있는 경우에만 갈아 준다 — 창구가 손으로 고쳐 둔
       * 것은 건드리지 않는다.
       */
      if (ST.ctx.custProfileMeaning && SUPERSEDED[ST.ctx.custProfileMeaning]) {
        ST.ctx.custProfileMeaning = meaningFor(ST.ctx.custProfile);
      }
      if (ST.ctx.profMeanings) {
        Object.keys(ST.ctx.profMeanings).forEach(function (k) {
          if (SUPERSEDED[ST.ctx.profMeanings[k]]) delete ST.ctx.profMeanings[k];
        });
      }
      sanitizeCtx();
    } catch (e) { /* 손상된 저장값 — 초기값 사용 */ }
  }

  /**
   * 저장된 상담값 중 **지금 보기 목록에 없는 값**을 버린다.
   *
   * 현재 투자자금성향 보기를 사내 서식으로 갈아 끼우면서, 예전 값
   * (「원금보존 추구하지 않음」 같은 것)이 저장된 화면에서는 드롭다운이
   * 「— 선택 —」 으로 보이는데 판정과 문장은 옛 값을 쓰고 있었다.
   * 화면에 없는 값이 뒤에서 도는 것은 그 자체로 사고다.
   */
  function sanitizeCtx() {
    Object.keys(CASH_OPTS).forEach(function (k) {
      var v = ST.ctx[k];
      if (v && CASH_OPTS[k].indexOf(v) < 0) ST.ctx[k] = '';
    });
    if (ST.ctx.custProfile && !PROFILES[ST.ctx.custProfile]) {
      ST.ctx.custProfile = '';
      ST.ctx.custProfileMeaning = '';
    }
    if (!cashLossOpen()) ST.ctx.cashLoss = '';
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
    var key = cat + '|' + overseas + '|' + (EXPL ? 'all' : 'split');
    if (FUND_LIST_CACHE[key]) return FUND_LIST_CACHE[key];
    var C = fundCat();
    if (!C) return null;
    var out = [];
    for (var i = 0; i < C.items.length; i++) {
      var it = C.items[i];
      /* 전체 화면은 평가표(국내/해외)에 맞는 것만 보여 준다.
         설명의무 전용 화면은 평가표를 상품이 정하므로 국내·해외를 합쳐 전부 보여 준다. */
      if (!EXPL && cat === 'fund' && (it.region !== 'domestic') !== !!overseas) continue;
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
      var fg = fxRiskGrade(t.credit, t.ccy);
      return {
        id: 'fx' + (i + 1),
        name: (t.ccy || t.country || '') + ' ' + (t.kind || ''),
        kind: t.kind || '', ccy: t.ccy || '', fxType: t, fromCatalog: true,
        riskGrade: fg ? fg.grade : null, riskLabel: fg ? gradeLabel(fg.grade) : ''
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
    /* 위험등급 — 국제신용등급과 통화로 분류표대로 낸다 (환헤지 미실시 상향 포함).
       「채권별로 상이」 처럼 등급을 낼 수 없는 유형은 담지 않아 확인필요로 남는다. */
    var fg = fxRiskGrade(t.credit, t.ccy);
    if (fg) {
      put('riskGrade', String(fg.grade));
      put('riskLabel', gradeLabel(fg.grade));
    }
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
    /**
     * 직접등록분과 자동조회분을 이어 붙인다.
     * 안내장에서 등록한 종목은 표준코드가 자동조회 종목과 같을 수 있다 —
     * 그대로 이으면 같은 종목이 목록에 두 번 나온다. 직접등록분을 남기고
     * 자동조회분에서 걷어낸다 (담당자가 올린 자료가 더 최신이다).
     */
    var join = function (auto) {
      var have = {};
      mine.forEach(function (p) { have[p.id] = 1; });
      return mine.concat(auto.filter(function (p) { return !have[p.id]; }));
    };
    if (sh.cat === 'fund' || sh.cat === 'irp') {
      var fl = fundList(sh.cat, sh.overseas);
      if (fl) return join(fl);
    }
    if (sh.cat === 'bondKrw') {
      var bl = bondList();
      if (bl) return join(bl);
    }
    if (sh.cat === 'bondFx') {
      var xl = bondFxList();
      if (xl) return join(xl);
    }
    var list = join(D.catalog[sh.cat] || []);
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

  /* ==========================================================
     부적합 시나리오의 「추천 상품」
     ----------------------------------------------------------
     부적합 시나리오는 고객이 자기 성향보다 위험한 상품을 지목하는 상담이다.
     평가표는 그 앞 단계에서 「성향에 적합한 상품」 을 먼저 권유하도록 요구한다.
     그러니 이 시트에서는 상품이 둘이다 —
       ㆍ선택 상품  = 고객이 지목한 부적합 상품 (설명 단계에서 설명한다)
       ㆍ추천 상품  = 성향에 적합해서 우리가 먼저 권유하는 상품
     앞 판은 이것을 가르지 않아 추천 단계 스크립트가 부적합 상품을 「적합한
     상품」 이라고 권유하는 문장을 만들었다. 읽으면 그 자체로 감점이다.

     추천 상품의 값은 선택 상품과 똑같은 규칙으로 풀어야 한다(수익률·동종유형
     비교·증시전망 연결까지). 그래서 규칙을 베끼지 않고, 값을 읽는 동안만
     선택 상품을 추천 상품으로 바꿔 끼운다.
     ========================================================== */
  /**
   * 고른 성향이 가입할 수 있는 가장 위험한 등급 (숫자가 작을수록 위험).
   * 사내 위험도 분류표(2025.11.24)의 「투자자구분」 줄을 그대로 쓴다.
   */
  function profileMinGrade(profile) {
    var g = profileGrades(profile);
    return (g && g.length) ? g[0] : null;
  }
  /** 지금 고른 성향에 이 등급이 적합한가 (모르면 null) */
  function gradeFits(profile, grade) {
    var g = profileGrades(profile), n = numOf(grade);
    if (!g || n == null) return null;
    return g.indexOf(n) >= 0;
  }

  /**
   * 스크립트 한 줄을 지금 보여 줄지.
   *   when: 'rec'     추천 상품을 「고른」 경우에만
   *   when: 'recNone' 「적합한 상품 없음」 을 고른 경우에만
   * 아무것도 고르지 않았으면 둘 다 보여 준다 — 절차 전체를 보고 고르게 한다.
   * (없음 을 골랐는데 「적합 상품 추천」 문장이 남아 있으면 그 칸들이 전부
   *  빨간 확인필요로 떠서, 채울 수 없는 값을 찾아 헤매게 된다)
   */
  function lineOn(s) {
    if (!s || !s.when) return true;
    /**
     * 고난도 금융투자상품에만 하는 말 / 아닌 상품에만 하는 말.
     *
     * 원금지급형 ELB(파생결합사채)를 골라도 「이 상품은 고난도 금융투자상품으로서
     * 원금손실 위험이 높으면서도…」 와 스텝다운형 손실사례(만기상환 손실률
     * 57.17%·62.5%)가 그대로 나왔다. 원금이 지급되는 상품에 그것을 읽으면
     * 사실과 다르게 알리는 것이다 (부당권유 — 감점 항목이기도 하다).
     * 평가표도 「비고난도는 ③ 제외」 라고 적고 있고 화면도 해당 여부를 이미
     * 알고 있었는데(highDiff), 문구가 그 갈림을 타지 않고 있었다.
     */
    if (s.when === 'highDiff' || s.when === 'lowDiff') {
      var hd = String(valueOf('highDiff') || '');
      /* 값을 못 읽었으면 감추지 않는다 — 해야 할 말을 빠뜨리는 쪽이 더 위험하다 */
      if (!hd) return true;
      var isHigh = /^해당(?!\s*없음)/.test(hd);
      return s.when === 'highDiff' ? isHigh : !isHigh;
    }
    var chosen = recId();
    if (!chosen) return true;
    if (s.when === 'rec') return chosen !== '__none';
    if (s.when === 'recNone') return chosen === '__none';
    return true;
  }

  var IN_REC = false;
  function recId() {
    var sh = sheet();
    if (sh.scenario !== 'unfit') return null;
    return (ST.rec && ST.rec[sh.cat]) || null;
  }
  /** ELS 는 「적합한 상품이 없음」 이 정답인 경우가 있다 — 그것도 골라 둘 수 있다 */
  function recNone() {
    var sh = sheet();
    if (sh.scenario !== 'unfit') return false;
    return (ST.rec && ST.rec[sh.cat]) === '__none';
  }
  function recProduct() {
    var id = recId();
    if (!id || id === '__none') return null;
    var l = catalog();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    var sh = sheet();
    if (sh.cat === 'fund' || sh.cat === 'irp') {
      var c = fundCatByCode(id);
      if (c) return fundCatProduct(c);
    }
    return null;
  }
  /** 값을 읽는 동안만 선택 상품을 추천 상품으로 바꿔 끼운다 */
  function recValue(fieldId) {
    var id = recId();
    if (!id || id === '__none' || IN_REC) return undefined;
    var oldId = ST.productId, oldPros = ST.pros;
    IN_REC = true; ST.productId = id; ST.pros = null;
    try {
      var v = valueOf(fieldId);
      return (v === '' || v == null) ? undefined : v;
    } finally {
      IN_REC = false; ST.productId = oldId; ST.pros = oldPros;
    }
  }

  /** 스크립트 전용 파생값 (평가표·시나리오·고객조건에서 계산) */
  function derived(id) {
    /* 추천 상품 값 — rec 로 시작하는 것은 추천 상품에서 읽는다 */
    if (id.length > 3 && id.slice(0, 3) === 'rec' && id.charAt(3) === id.charAt(3).toUpperCase()) {
      if (id === 'recNone') return recNone() ? '해당' : (recId() ? '해당 없음' : undefined);
      var f = id.charAt(3).toLowerCase() + id.slice(4);
      return recValue(f);
    }
    return derived0(id);
  }
  function derived0(id) {
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
      /**
       * 위험등급 분류 근거.
       * 담당자가 공용 문구에 넣어 둔 것이 먼저다. 없으면 사내 위험도 분류표
       * (2025.11.24)의 해당 상품군·등급 칸을 그대로 옮긴다 — 우리가 짓지 않는다.
       */
      case 'riskGradeBasis': {
        if (COMMON.riskGradeBasis) return COMMON.riskGradeBasis;
        var db = doc();
        if (db && db.fields && db.fields.riskGradeBasis) return undefined;
        var gb = numOf(rawValue('riskGrade'));
        if (gb == null) return undefined;
        var rows = RISK_TABLE.rows.filter(function (r) { return (r.cats || []).indexOf(sh.cat) >= 0; });
        if (!rows.length) return undefined;
        /* 시트 문장이 「{{riskGradeBasis}} 에 따라 …」 이므로 값이 이름꼴로 끝나야 한다 */
        var parts = [];
        rows.forEach(function (r) {
          if (r.span) { parts.push(r.key + ' 의 위험등급을 「' + r.span + '」 으로 정하는 기준'); return; }
          var c = r.cells && r.cells[gb];
          if (c) parts.push(r.key + ' 중 ' + c + ' 를 ' + gb + '등급(' + gradeLabel(gb) + ')으로 분류하는 기준');
        });
        if (!parts.length) return undefined;
        var out = '당사 「투자자 유형 및 금융투자상품 위험도 분류표」 상 ' + parts.join(', ');
        /* 공통사항 ① — 외화상품은 환헤지가 되지 않으면 단계를 상향한다.
           그 상향까지 말해야 이 상품의 등급이 왜 그 숫자인지가 설명된다. */
        if (sh.cat === 'bondFx') {
          var pf = product();
          var fx = pf && pf.fxType ? fxRiskGrade(pf.fxType.credit, pf.fxType.ccy) : null;
          if (fx && fx.grade === gb) {
            out = '당사 「투자자 유형 및 금융투자상품 위험도 분류표」 상 채권(해외) 중 국제신용등급 '
              + fx.credit + ' 를 ' + fx.base + '등급(' + gradeLabel(fx.base) + ')으로 분류하고, '
              + '환헤지를 하지 않는 ' + fx.ccy + ' 상품은 ' + fx.step + '단계 상향하는 기준';
          }
        }
        /* 공통사항 ③ — 고난도 금융투자상품은 표와 관계없이 2등급 이상으로 결정한다 */
        var hd = valueOf('highDiff');
        if (hd && /해당 \(/.test(String(hd))) {
          out += ' (다만 고난도 금융투자상품은 상기 표 등급과 관계없이 개별 검토하여 2등급 이상으로 결정합니다)';
        }
        return out;
      }
      /**
       * 위험등급의 의미·유의사항.
       * 평가는 「적합한 투자자 유형까지 설명해야 인정」 한다. 등급별 유의사항
       * 원문(핵심요약설명서)이 공용 문구에 등록돼 있으면 그것이 먼저다.
       * 없으면 분류표에서 확정되는 것 — 6단계 분류와 그 등급에 적합한 투자자
       * 유형 — 만 말한다. 분류표에 없는 유의사항 문장은 지어내지 않는다.
       */
      case 'riskMeaning': {
        /* 투자설명서 원문에 이 상품의 문구가 있으면 그것이 먼저다 —
           rawValue 가 읽도록 비켜 준다 (derived 가 rawValue 를 앞지른다) */
        var dm = doc();
        if (dm && dm.fields && dm.fields.riskMeaning) return undefined;
        if (COMMON['riskNote' + String(rawValue('riskGrade') || '').replace(/[^0-9]/g, '')]) {
          return COMMON['riskNote' + String(rawValue('riskGrade') || '').replace(/[^0-9]/g, '')];
        }
        var gm = numOf(rawValue('riskGrade'));
        if (gm == null) return undefined;
        var profs = gradeProfiles(gm);
        if (!profs.length) return undefined;
        return '당사는 투자위험등급을 1등급(매우높은위험)부터 6등급(매우낮은위험)까지 6단계로 분류하고 있으며, '
          + '이 상품의 ' + gm + '등급(' + gradeLabel(gm) + ')은 투자자성향이 '
          + profs.join(' · ') + '인 고객에게 적합한 등급입니다';
      }
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
        var hasA = cls0 == null ? null : clsHasA(cls0);
        var hasC = cls0 == null ? null : clsHas(cls0, 'C');
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
        var hasA2 = cls1 == null ? null : clsHasA(cls1);
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
        var cls2 = derived('clsIssued');
        var hasA3 = cls2 == null ? null : clsHasA(cls2);
        var cav = String(valueOf('clsA') || '');
        /* 발행 클래스가 먼저다 — 뒤 문장(clsFeeNote)도 그 순서로 말한다.
           수수료율이 어쩌다 채워져 있어도 A클래스가 없는 펀드에서 그 율을 읽으면
           앞뒤 문장이 서로 어긋난다. */
        if (hasA3 === false || /없음|해당\s*없/.test(cav)) {
          return '이 펀드는 선취판매수수료가 없어 납입하신 금액이 전액 투자되고, ' +
            '대신 총보수가 매일 펀드 재산에서 차감됩니다.';
        }
        var fr = derived('feeRate');
        if (fr) {
          return '판매수수료는 ' + fr + ' 로, 만약 고객님께서 ' + derived('exAmt') + ' 을 납입하신다면 ' +
            '그 ' + fr + ' 인 ' + derived('feeCut') + ' 을 제외한 ' + derived('netAmt') + ' 만 투자되는 상품입니다.';
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
  /**
   * 그 항목을 무엇으로 채우는지 한 줄 설명.
   *
   * 항목 정의에 hint 가 있으면 그것을 쓰고, 만들어지는 값(파생)처럼 정의에 없는 것은
   * 여기서 적어 준다. 이름만으로는 무엇을 넣어야 하는지 모르는 것이 있다 —
   * 「선취수수료 계산 예시 문장」 을 보고 계산 문장을 손으로 쓰면 뺄셈을 창구가 하게
   * 되는데, 이 도구는 그 뺄셈을 없애려고 만든 것이다.
   */
  var MISS_HINT = {
    /**
     * 이 둘은 손으로 쓰는 값이 아니다 — clsA(선취판매수수료율) 하나를 넣으면 만들어진다.
     * 그래서 보통은 MISS_VIA 가 확인필요 표시를 clsA 로 바꿔 놓아 여기까지 오지 않는다.
     * clsA 를 「없음」 으로 적었는데도 문장이 안 만들어지는 예외를 위해 남겨 둔다.
     */
    feeCalcNote: '「A클래스 선취판매수수료」 를 넣으면 납입금액·차감액·실투자금액까지 저절로 계산됩니다 — 계산 문장을 손으로 쓰지 마십시오.',
    clsFeeNote: '「A클래스 선취판매수수료」 와 발행 클래스로 저절로 만들어지는 문장입니다 — 문장을 손으로 쓰지 마십시오.',
    /**
     * 선취판매수수료율은 카탈로그에 없고 투자설명서에만 있는 값이다.
     * 미리 판독해 둔 3,014건 중 2,020건만 읽혔다 — A클래스를 발행하지 않는 549건은
     * 「A클래스 없음」 으로 문장이 만들어지고, 남는 445건이 이 안내를 보게 된다.
     * (설명서 PDF 주소는 확인필요 안내상자 아래에 링크로 따로 붙인다 — 여기는 툴팁이라
     *  글자만 들어간다.)
     */
    clsA: '(간이)투자설명서 「보수 및 수수료에 관한 사항」 표의 A클래스 선취판매수수료입니다. '
      + '예) 납입금액의 1.0% 이내 · 없음. 넣으면 선취판매수수료 문장과 계산 예시 문장이 함께 만들어집니다.',
    /*
     * 환매수수료는 대부분의 공모펀드가 「없음」 이지만, 미리 판독해 둔 3,014건 중
     * 234건은 그 「없음」 을 못 읽어 비어 있다 (PDF 에서 글자를 뽑으면 「없 음」 처럼
     * 사이가 벌어지는 일이 잦다). 없다는 것을 확인했으면 「없음」 이라고 적어야 한다 —
     * 비워 두면 창구가 고지 자체를 빠뜨린 것이 되고, 평가에서는 미고지로 잡힌다.
     */
    redeemFee: '투자설명서 「보수 및 수수료에 관한 사항」 의 환매수수료입니다. '
      + '대부분 「없음」 이며, 있으면 기간 조건까지 함께 적으십시오 (예: 90일 미만 환매 시 이익금의 70%). '
      + '없다는 것도 말해야 고지로 인정됩니다.',
    clsExp: 'IRP 는 퇴직연금 클래스(C-P·CP·S-P) 총보수로 말해야 합니다 — A·C 클래스 보수를 말하면 고객이 부담하지 않는 비용을 말하게 됩니다.',
    clsExpClass: '위 총보수가 어느 클래스 기준인지 함께 말해야 인정됩니다.',
    proof: window.SS_MODE === 'expl'
      ? '고객 가입유형에 따른 증빙서류입니다 — 빨간 표시를 눌러 적으십시오.'
      : '왼쪽 「4 상담 조건」 에서 고객 가입유형을 고르면 그 유형의 증빙서류 목록이 채워집니다.',
    mpRate: '금융투자협회 채권정보센터의 전영업일 민간채권평가회사 평균 금리입니다 — 투자설명서에는 없습니다.',
    mpPrice: '금융투자협회 채권정보센터의 민평단가입니다 — 투자설명서에는 없습니다.',
    priceDiff: '민평단가에서 매매단가를 뺀 값입니다. 민평단가를 넣으면 계산됩니다.',
    fin1: '발행회사 재무제표(전자공시 DART)에서 확인하십시오 — 투자설명서에는 없습니다.',
    fin2: '발행회사 재무제표(전자공시 DART)에서 확인하십시오 — 투자설명서에는 없습니다.',
    creditMeaning: '신용평가사의 등급 정의표에서 그 등급의 뜻을 옮겨 적으십시오.',
    fee: '채권 매매 화면·약관의 수수료 조건입니다. 없으면 「없음」 을 고지해야 인정되고, 중개물이면 중개보수를 말해야 합니다.',
    credit: '장외채권 종목 상세 화면의 신용등급입니다. 위험등급(1~6등급)과 다른 값이니 옮겨 적지 마십시오.',
    guarantee: '보증사채인지 무보증사채인지는 종목별로 다릅니다 — 설명서에서 확인하십시오. 화면에 띄운 회사 문구는 조건문이라 이 종목이 무보증이라고 말해 주지 않습니다.'
  };
  /**
   * 「… 문장」 항목은 창구가 타자를 칠 값이 아니다 — 근거가 되는 값 하나를 넣으면
   * 문장도 계산도 저절로 만들어진다. 그런데 그 문장이 비었을 때 문장 이름으로
   * 확인필요를 띄우면, 눌러 봐야 「선취수수료 계산 예시 문장」 을 손으로 쓰라는
   * 입력창이 뜬다. 그러면 이 도구가 없애려던 계산과 작문을 창구가 도로 하게 된다.
   *
   * 그래서 문장 대신 「그 문장을 만드는 값」 을 확인필요로 세운다. 값이 이미 있는데도
   * 문장이 안 만들어지는 예외라면 원래 항목 그대로 둔다 (그 경우는 문장 쪽이 문제다).
   *
   * 실제로 걸리는 것은 선취판매수수료다 — 미리 판독해 둔 3,014건 중 445건이 A클래스를
   * 발행하면서 수수료율만 못 읽혔고, 그 펀드를 고르면 문장 두 개가 한꺼번에 빨개졌다.
   */
  var MISS_VIA = { feeCalcNote: 'clsA', clsFeeNote: 'clsA' };
  function missVia(id) {
    var src = MISS_VIA[id];
    if (!src) return id;
    var v = valueOf(src);
    return (v == null || v === '') ? src : id;
  }
  function hintOf(id) {
    if (MISS_HINT[id]) {
      /* 상품에 따라 달라지는 안내는 함수로 둘 수 있다 */
      return typeof MISS_HINT[id] === 'function' ? MISS_HINT[id]() : MISS_HINT[id];
    }
    var defs = fieldDefs();
    for (var i = 0; i < defs.length; i++) if (defs[i].id === id) return defs[i].hint || '';
    return '';
  }
  function labelOf(id) {
    var defs = fieldDefs();
    for (var i = 0; i < defs.length; i++) if (defs[i].id === id) return defs[i].label;
    /* 추천 상품 값은 선택 상품과 같은 이름을 쓰되 「추천」 을 붙인다 —
       확인필요 목록에서 둘이 섞이면 어느 상품을 채우라는 것인지 알 수 없다. */
    if (id.length > 3 && id.slice(0, 3) === 'rec' && id.charAt(3) === id.charAt(3).toUpperCase()) {
      var base = id.charAt(3).toLowerCase() + id.slice(4);
      return '추천 상품 — ' + labelOf(base);
    }
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
        /* 문장 항목은 그 문장을 만드는 값으로 바꿔 세운다 (MISS_VIA) */
        var mk = missVia(id);
        missCache.push({ kind: 'field', key: mk, label: labelOf(mk) });
        return '<span class="v miss" data-kind="field" data-key="' + esc(mk) + '">' + esc(labelOf(mk)) + '</span>';
      }
      return '<span class="v" data-kind="field" data-key="' + esc(id) + '">' + esc(v) + '</span>';
    });
    out = out.replace(/«([^«»]{1,80})»/g, function (_, label) {
      var v = ST.inline[label];
      /* 「고객이 방금 말한 부적합 상품명」 은 이 시나리오의 선택 상품이 바로 그것이다.
         비워 두면 상담 도중에 멈추고 타자를 쳐야 했다. 선택 상품명을 채워 두고,
         고객이 다르게 말했으면 눌러 고치게 한다. (평가는 「고객에게 직접 재확인」
         하는 행위를 보는 것이므로, 화면에 글자가 있느냐와는 무관하다) */
      if ((v == null || v === '') && /부적합\s*상품명/.test(label) && sheet().scenario === 'unfit') {
        var nm = valueOf('name');
        if (nm) v = nm;
      }
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
      /**
       * 적합성보고서 발급 대상 :
       *   (투자자성향 및 현재 투자자금성향이 적합한) 고령투자자 또는 신규투자자
       *
       * 현재 투자자금성향은 네 항목을 모두 만족해야 적합하다 (CASH_FIT).
       * 아직 다 고르지 않았으면 판정할 수 없으므로 대상으로 두고, 화면이 무엇을
       * 더 골라야 하는지 말한다 — 판정 전에 항목을 지워 버리면 창구는 이 항목이
       * 있었다는 사실조차 모른다.
       */
      case 'suitReport': {
        if (!(sh.senior || ctx.newInvestor)) return false;
        if (gradeFits(ctx.custProfile, valueOf('riskGrade')) === false) return false;
        var cf = cashFit();
        return cf.complete ? cf.fit : true;
      }
      case 'watch': return isWatchProduct();
      default: return true;
    }
  }
  /**
   * 왜 「미해당」 인지, 무엇을 켜면 살아나는지 그 자리에서 말해 준다.
   *
   * 앞 판은 어느 항목이든 「좌측 「고객 구분」 체크에 따라 활성화」 라고만 적었다.
   * 설명의무 전용 화면에는 그런 칸이 아예 없어서, 창구는 없는 칸을 찾다가
   * 「스크립트가 안 나온다」 고 여기게 된다. 항목이 무엇을 조건으로 삼는지에 따라
   * 이 화면에서 실제로 누를 곳을 가리킨다.
   */
  function whyNotApplicable(item) {
    var where2 = EXPL ? '왼쪽 「2 고령 / 비고령」' : '좌측 「2 고령 / 비고령」';
    switch (item.only) {
      case 'suitReport': {
        var head = '<b>지금 상담 조건에서는 적합성보고서 발급 대상이 아닙니다</b> — 대상은 '
          + '<b>(투자자성향 및 현재 투자자금성향이 적합한) 고령투자자 또는 신규투자자</b>입니다.<br>';
        if (!(sheet().senior || ST.ctx.newInvestor)) {
          return head + '지금은 비고령이면서 신규투자자도 아닙니다 — 대상 고객이면 ' + where2
            + ' 를 <b>고령투자자</b> 로 바꾸거나, '
            + (EXPL ? '「2-1 적합성보고서에 들어가는 값」' : '좌측 「4 상담 조건 · 고객 구분」')
            + ' 의 <b>신규투자자</b> 를 켜십시오.';
        }
        if (gradeFits(ST.ctx.custProfile, valueOf('riskGrade')) === false) {
          return head + '고른 상품의 위험등급이 <b>' + esc(ST.ctx.custProfile) + '</b> 성향에 맞지 않습니다 — '
            + '투자자성향이 적합해야 발급 대상입니다.';
        }
        var cf2 = cashFit();
        var bad = cf2.rows.filter(function (r) { return r.state === 'bad'; });
        if (bad.length) {
          return head + '현재 투자자금성향이 <b>적합하지 않습니다</b> — 네 항목을 모두 만족해야 하는데 '
            + bad.map(function (r) {
              return '<b>' + esc(r.label) + '</b>(' + esc(r.value) + ' — ' + esc(r.rule) + ')';
            }).join(', ') + ' 가 어긋납니다.';
        }
        return head + '현재 투자자금성향 요건을 확인하십시오.';
      }
      case 'elderly':
        return '<b>고령투자자 상담에서만 평가하는 항목입니다</b> — ' + where2 + ' 를 고령투자자로 바꾸면 활성화됩니다.';
      case 'overseas':
        return '<b>해외 상품 상담에서만 평가하는 항목입니다</b> — 해외 상품을 고르면 활성화됩니다.';
      case 'watch':
        return '<b>투자권유 유의상품일 때만 평가하는 항목입니다</b>'
          + (EXPL ? ' — 고령 + 고난도 파생결합증권이면 자동으로 지정됩니다.' : ' — 좌측 「고객 구분」 에서 지정합니다.');
      default:
        return '<b>지금 상담 조건에서는 평가 대상이 아닙니다.</b>';
    }
  }
  function ckey(item) { return sheetKey() + '|' + item.id; }
  /** 지금 평가표에서 체크되어 있는 Check Point 수 — 「체크 해제」 단추에 적는다 */
  function checkedCount() {
    var pref = sheetKey() + '|', n = 0;
    Object.keys(ST.checks).forEach(function (k) {
      if (k.indexOf(pref) !== 0) return;
      (ST.checks[k] || []).forEach(function (v) { if (v) n++; });
    });
    return n;
  }
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
  /**
   * 진행 파트.
   *   all  — 상담 전체 (지금까지의 방식)
   *   suit — 적합성원칙만. 상담하며 단계별로 채워지는 부분
   *   expl — 상품설명의무만. 상품만 고르면 그 자리에서 다 채워지는 부분
   * 파트를 고르면 스크립트·확인필요·읽기모드·인쇄가 그 파트만 다룬다.
   * 점수(103점)는 평가표 전체가 기준이므로 파트와 무관하게 전체로 센다.
   */
  /**
   * 구분(sec)은 평가표마다 이름이 다르다 —
   *   적합성원칙 / 상품설명의무 / IRP설명의무 / 펀드설명의무 / 기타
   * 「기타」 는 전부 상담 내내 걸리는 감점 항목이다 (부당권유행위 금지,
   * 상담 지연·거부, 온라인 가입 유도, 고객 권익보호, 설명내용 확인·서명,
   * 퇴직급여보장법 금지행위, 상담시간, 가입목적에 맞지 않은 권유).
   * 어느 한 파트의 것이 아니므로 두 파트 모두에 넣는다 — 파트를 좁혀 본다고
   * 감점 항목을 놓치게 하지 않는다.
   */
  var PARTS = {
    all: {
      label: '전체', match: null,
      hint: '적합성원칙 + 상품설명의무를 이어서 진행합니다.'
    },
    suit: {
      label: '① 적합성원칙',
      match: function (sec) { return sec === '적합성원칙' || sec === '기타'; },
      hint: '상담하며 단계별로 채워지는 부분입니다 — 투자자성향 진단, 현재 투자자금성향 파악, '
        + '적합한 상품 권유, (부적합이면) 부적합 안내. 상담 전에는 다 채울 수 없는 값들입니다.'
    },
    expl: {
      label: '② 상품설명의무',
      match: function (sec) { return /설명의무/.test(sec) || sec === '기타'; },
      hint: '상품만 고르면 그 자리에서 채워지는 부분입니다 — 적합성원칙이 끝나지 않아도 '
        + '먼저 읽거나 인쇄할 수 있습니다. (IRP 는 IRP설명의무 + 펀드설명의무가 함께 들어갑니다)'
    }
  };
  /**
   * 상품설명의무 전용 화면의 상품군 — 적합/부적합 시나리오를 노출하지 않는다.
   * 시나리오는 적합성원칙의 축이고, 설명의무 항목은 두 평가표가 사실상 같다.
   * 대표 평가표 하나씩만 잡아 두고, 펀드는 고른 상품이 해외면 해외표로 바꾼다.
   */
  var EXPL_CATS = [
    { cat: 'fund', base: 'fundFit', label: '펀드' },
    { cat: 'els', base: 'elsFit', label: 'ELS · DLS' },
    { cat: 'bondKrw', base: 'bondKrw', label: '원화채권' },
    { cat: 'bondFx', base: 'bondFx', label: '외화채권' },
    { cat: 'irp', base: 'irp', label: 'IRP' }
  ];
  /** 고른 상품에 맞는 평가표로 맞춘다 — 해외펀드를 고르면 해외 평가표로 간다 */
  function syncSheetToProduct() {
    if (!EXPL || sheet().cat !== 'fund') return false;
    var it = fundCatByCode(ST.productId);
    var overseas;
    if (it) overseas = it.region !== 'domestic';
    else {
      var l = catalog(), hit = null;
      for (var i = 0; i < l.length; i++) if (l[i].id === ST.productId) { hit = l[i]; break; }
      overseas = !!(hit && hit.overseas);
    }
    var want = overseas ? 'fundOverseasUnfit' : 'fundFit';
    if (ST.baseSheet === want) return false;
    ST.baseSheet = want;
    return true;
  }
  function partKey() { if (EXPL) return 'expl'; return PARTS[ST.part] ? ST.part : 'all'; }
  /** 평가표의 모든 항목 (점수·항목 찾기에 쓴다 — 파트와 무관하다) */
  function itemsAll() { return sheet().items; }
  /**
   * 적합성보고서 항목 (only:'suitReport').
   *
   * 한 번 이 화면에서 통째로 뺐다가 되살린 자리다. 뺀 이유는 그 문안이 쓰는 값
   * (투자자성향·현재 투자자금성향)을 채울 칸이 없어 늘 「확인필요」 로 남아서였다.
   * 그러나 평가표를 다시 대조해 보니 이것은 적합성원칙이 아니라 **상품설명의무**다 —
   *
   *   ELS 적합   : 설명의무에 적합성보고서 발급·내용 안내(−5) + 교부(−5) 가 있고,
   *                내용 안내 문안이 투자자성향과 현재 투자자금성향 셋을 말하게 되어 있다
   *   ELS 부적합 : 평가표에 이 두 항목 자체가 없다 (그래서 성향을 말할 일도 없다)
   *   펀드·채권·IRP : 적합/부적합 사이에 설명의무 항목·문안 차이가 없다
   *
   * 그래서 항목을 빼는 대신, **ELS 적합일 때만** 그 네 값을 고르는 칸을 낸다.
   */
  function needsSuitValues() {
    return EXPL && sheet().scenario === 'fit'
      && itemsOf().some(function (x) { return x.only === 'suitReport'; });
  }
  /** ELS 만 적합/부적합에 따라 설명의무가 달라진다 — 그 상품군에서만 시나리오를 묻는다 */
  function scenarioMatters() { return sheet().cat === 'els'; }
  /**
   * ELS 적합을 고르면 「신규투자자」 를 기본으로 켠다.
   *
   * 미스터리쇼핑은 대부분 신규투자자로 들어온다. 적합성보고서 발급 대상이
   * (적합한) 고령 또는 신규투자자라, 비고령 고객에서 이것이 꺼져 있으면
   * 적합성보고서 2항목이 통째로 「미해당」 이 되어 스크립트에서 빠진다 —
   * 정작 평가에서 보는 항목이 빠진 채로 상담을 진행하게 된다.
   *
   * 사람이 한 번이라도 이 칸을 건드렸으면 그 뜻을 존중해 다시 켜지 않는다.
   */
  function applyElsDefaults() {
    if (!EXPL) return;
    if (ST.ctx.newInvestorTouched) return;
    var sh = SHEETS[sheetKey()];
    if (!sh || sh.cat !== 'els' || sh.scenario !== 'fit') return;
    if (!ST.pick.cat || !ST.pick.scen) return;
    ST.ctx.newInvestor = true;
  }
  /** 상품군을 골랐는가 (설명의무 화면에서만 따진다) */
  function pickedCat() { return !EXPL || ST.pick.cat; }
  /** 적합/부적합을 골랐는가 — ELS 가 아니면 물을 것이 없다 */
  function pickedScen() { return !EXPL || !scenarioMatters() || ST.pick.scen; }
  /** 고령/비고령을 골랐는가 */
  function pickedSenior() { return !EXPL || ST.pick.senior; }
  /** 스크립트를 뽑을 조건이 다 갖춰졌는가 */
  function pickedAll() { return pickedCat() && pickedScen() && pickedSenior(); }
  /** 지금 파트의 항목만 (화면·확인필요·읽기모드·인쇄) */
  function itemsOf() {
    var m = PARTS[partKey()].match;
    if (!m) return sheet().items;
    return sheet().items.filter(function (x) { return m(x.sec); });
  }

  function totals() {
    var sh = sheet(), base = 0, plus = 0, minus = 0, baseMax = 0, plusMax = 0, done = 0, all = 0;
    var bySec = {};
    /* 점수는 평가표 전체가 기준이다 (기본 100 + 가점 3). 파트를 골라 보고
       있어도 만점이 달라지지 않는다 — 전체로 센다.
       다만 상품설명의무 전용 화면은 적합성원칙을 아예 다루지 않으므로,
       거기서는 설명의무 항목만으로 만점을 다시 잡는다 (그래야 진행률이 뜻을 가진다). */
    (EXPL ? itemsOf() : itemsAll()).forEach(function (x) {
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
  var MISS_REF = ['retPeer', 'peerRet1y',
    /*
     * 채권에서 투자설명서에 없는 값들. 앞 판은 이것들을 「투자설명서에서 확인」 으로
     * 안내했다. 원화채권 확인필요 10건 중 일곱이 여기 해당했으니, 창구는 설명서에
     * 없는 값을 설명서에서 찾다가 시간을 버렸다. 어디에 있는지 적어 준다 —
     *
     *   mpRate·mpPrice·priceDiff  금융투자협회 채권정보센터의 민평 값 (매일 바뀐다)
     *   fin1·fin2                 발행회사 재무제표 (전자공시 DART)
     *   creditMeaning             신용평가사의 등급 정의표
     *   fee                       채권 매매 화면·약관의 수수료 조건.
     *                             회사 조건이라 종목마다 다르지 않은 것이 보통이지만,
     *                             평가표가 「중개물이면 중개보수를 설명」 이라고 하므로
     *                             공용 문구로 한 번만 등록하는 값으로 단정하지 않는다.
     */
    'mpRate', 'mpPrice', 'priceDiff', 'fin1', 'fin2', 'creditMeaning', 'fee'];
  /**
   * 한 번만 등록하면 되는 값 — 상품이 아니라 회사·계좌의 조건이다.
   * 이것을 「투자설명서에서 확인」 으로 안내하면 창구에서 상품 설명서를 뒤지게 된다.
   */
  var MISS_ONCE = ['feeKinds', 'feeTotal', 'feeMethod', 'products', 'defaultOpt',
    'riskGradeBasis', 'taxLimit', 'taxRate', 'taxRateOut'];
  /**
   * 상담 중 고른 값에서 저절로 만들어지는 값 — 설명서에 있는 것이 아니다.
   *
   * proof(가입유형별 증빙서류)는 왼쪽에서 「고객 가입유형」 을 고르면 그 유형의
   * 서류 목록이 채워진다. 앞 판은 이것을 「투자설명서에서 확인」 으로 안내해,
   * 창구가 펀드 투자설명서에서 증빙서류 목록을 찾게 만들고 있었다.
   */
  var MISS_ASK = ['proof'];
  function missGroup(m) {
    /* 추천 상품 값은 설명서에서 찾을 것이 아니다 — 왼쪽에서 상품을 고르면 채워진다 */
    if (m.kind === 'field' && m.key.length > 3 && m.key.slice(0, 3) === 'rec'
      && m.key.charAt(3) === m.key.charAt(3).toUpperCase()) return 'rec';
    /* 라벨이 먼저다 — 증시전망·자료 기준월은 받아쓰기 표시라 항목 id 가 없다 */
    if (/증시\s*전망|자료\s*기준월|동종유형\s*평균|협회\s*공시/.test(m.label)) return 'ref';
    if (MISS_REF.indexOf(m.key) >= 0) return 'ref';
    if (MISS_ONCE.indexOf(m.key) >= 0) return 'once';
    if (MISS_ASK.indexOf(m.key) >= 0) return 'ask';
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
      (x.script || []).forEach(function (s) { if (lineOn(s)) tpl(s.x); });
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
  /** 현재 투자자금성향 4문항. 손실감내수준(2-1)은 원금보존태도의 답에 따라 열린다. */
  function cashSelects(ctx) {
    var h = [], open = cashLossOpen();
    CASH_FIELDS.forEach(function (pair) {
      var key = pair[0], sub = key === 'cashLoss';
      var off = sub && !open;
      h.push('<div style="margin-bottom:6px"><div style="font-size:12px;color:var(--' + (off ? 'muted2' : 'muted') + ');margin-bottom:2px">'
        + (sub ? '↳ ' : '') + pair[1] + (sub ? ' <span style="color:var(--muted2)">(원금보존태도에서 「손실위험이 있더라도…」 를 고른 경우)</span>' : '') + '</div>');
      h.push('<select class="cashSel" data-k="' + key + '"' + (off ? ' disabled' : '') + '><option value="">— 선택 —</option>');
      CASH_OPTS[key].forEach(function (o) {
        h.push('<option value="' + esc(o) + '"' + (ctx[key] === o ? ' selected' : '') + '>' + esc(o) + '</option>');
      });
      h.push('</select></div>');
    });
    return h.join('');
  }

  /** 적합성보고서 발급 요건 — 네 항목을 모두 만족해야 적합하다. 지금 상태를 항목별로 적는다. */
  function cashFitTable() {
    var cf = cashFit();
    var mark = { ok: '<span style="color:var(--ok);font-weight:700">✓</span>',
      bad: '<span style="color:var(--err);font-weight:700">✗</span>',
      empty: '<span style="color:var(--muted2)">·</span>',
      skip: '<span style="color:var(--muted2)">—</span>' };
    var h = ['<div class="note" style="margin-top:10px;padding:10px 12px">'];
    h.push('<div style="font-weight:700;color:var(--ink);margin-bottom:6px">현재 투자자금성향 적합 요건 '
      + '<span style="font-weight:400;color:var(--muted2)">— 네 항목을 모두 만족해야 적합</span></div>');
    cf.rows.forEach(function (r) {
      h.push('<div style="line-height:1.7">' + mark[r.state] + ' <b>' + esc(r.label) + '</b> '
        + (r.state === 'empty' ? '<span style="color:var(--muted2)">미선택</span>'
          : '<span style="color:var(--' + (r.state === 'bad' ? 'err' : 'muted') + ')">' + esc(r.value) + '</span>')
        + '<br><span style="color:var(--muted2);font-size:11.5px;padding-left:14px">' + esc(r.rule) + '</span></div>');
    });
    h.push('<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--hair-soft);font-weight:700;color:var(--'
      + (!cf.complete ? 'muted' : (cf.fit ? 'ok' : 'err')) + ')">'
      + (!cf.complete ? '판정 전 — 남은 문항을 고르십시오'
        : (cf.fit ? '적합 — 발급 대상 요건을 채웠습니다' : '부적합 — 적합성보고서 발급 대상이 아닙니다'))
      + '</div>');
    return h.join('') + '</div>';
  }

  /**
   * 「체크 해제」 · 「전체 초기화」.
   *
   * 앞 판은 단추 이름만 있고 무엇을 지우는지 적지 않았다. 체크된 것이 없을 때
   * 눌러도 아무 일이 없으니 「작동하지 않는다」 로 보였고, 전체 초기화가
   * **등록해 둔 투자설명서까지** 지운다는 것도 눌러 보기 전에는 알 수 없었다.
   * 지금 몇 개가 지워지는지 단추에 적고, 각각 무엇을 건드리는지 아래 한 줄로 밝힌다.
   */
  function resetButtons() { return '<div id="resetBox">' + resetButtonsInner() + '</div>'; }
  /**
   * 체크 상태는 카드에서 바로 바뀐다(전체 재렌더를 하지 않는다 — 스크롤과 펼침을
   * 지켜야 하므로). 그래서 이 단추도 그때마다 같이 갈아 끼워야 한다.
   * 안 그러면 체크를 해 놓고도 단추가 「체크된 것이 없습니다」 인 채로 꺼져 있다.
   */
  function refreshResetBox() {
    var box = $('#resetBox');
    if (!box) return;
    box.innerHTML = resetButtonsInner();
    bindResetButtons();
  }
  function resetButtonsInner() {
    var n = checkedCount();
    var h = ['<div class="rule"></div>'];
    h.push('<button class="tbtn" id="btnResetChecks" style="width:100%;margin-bottom:6px"' + (n ? '' : ' disabled') + '>'
      + 'Check Point 체크 해제' + (n ? ' (' + n + '개)' : '') + '</button>');
    h.push('<div class="hint" style="margin:0 0 12px">'
      + (n ? '지금 평가표에 체크된 <b>' + n + '개</b>를 해제합니다. ' : '지금 평가표에는 <b>체크된 것이 없습니다.</b> ')
      + '입력값 · 등록한 설명서 · 고른 조건은 <b>그대로</b> 둡니다.</div>');
    var docs = docEntries();
    h.push('<button class="tbtn" id="btnResetDocs" style="width:100%;margin-bottom:6px"' + (docs.length ? '' : ' disabled') + '>'
      + '등록한 투자설명서 삭제' + (docs.length ? ' (' + docs.length + '건)' : '') + '</button>');
    h.push('<div class="hint" style="margin:0 0 12px">'
      + (docs.length
        ? '직접 등록한 설명서 <b>' + docs.length + '건</b>만 지웁니다. '
        : '직접 등록한 설명서가 <b>없습니다.</b> ')
      + '<b>자동수집분</b>(펀드 카탈로그·판독 결과, ELS·채권)은 지워지지 않고 그대로 다시 조회됩니다. '
      + '체크 · 입력값 · 고른 조건도 건드리지 않습니다.</div>');
    h.push('<button class="tbtn" id="btnResetAll" style="width:100%">전체 초기화</button>');
    h.push('<div class="hint" style="margin-top:6px">고른 조건(상품군·적합여부·고령여부) · 선택 상품 · '
      + '<b>모든 평가표의 체크</b> · 직접 입력값 · <b>등록한 투자설명서</b>까지 지웁니다. '
      + '직접 등록한 상품 목록과 성향별 설명문은 남습니다.</div>');
    return h.join('');
  }

  function renderSide() {
    var sh = sheet(), p = product(), ctx = ST.ctx;
    var h = [];

    if (EXPL) {
      /* 시나리오(적합/부적합)는 적합성원칙의 축이라 여기서는 묻지 않는다 */
      h.push('<div class="fgroup"><div class="flabel"><span class="req">1</span> 상품군</div><div class="seg" id="segCat">');
      EXPL_CATS.forEach(function (c) {
        h.push('<button data-v="' + c.base + '" aria-pressed="' + (ST.pick.cat && sh.cat === c.cat) + '">' + esc(c.label) + '</button>');
      });
      h.push('</div><div class="hint">펀드는 <b>국내·해외를 가리지 않고 전부</b> 목록에 나옵니다. '
        + '고른 펀드가 해외면 해외 평가표로 자동으로 바뀝니다.</div></div>');

      /* 적합 / 부적합 — ELS 에서만 묻는다.
         펀드·채권·IRP 는 적합/부적합 평가표의 설명의무 항목과 문안이 같아,
         물어 봐야 화면이 달라지지 않는다. 안 쓰는 선택지를 두면 창구가
         「무엇이 달라지나」 를 매번 다시 생각하게 된다. */
      if (scenarioMatters()) {
        h.push('<div class="fgroup"><div class="flabel"><span class="req">1-1</span> 적합 / 부적합</div><div class="seg" id="segScenario">');
        [['elsFit', '적합'], ['elsUnfit', '부적합']].forEach(function (o) {
          h.push('<button data-v="' + o[0] + '" aria-pressed="' + (ST.pick.scen && ST.baseSheet === o[0]) + '">' + o[1] + '</button>');
        });
        h.push('</div><div class="hint">ELS 는 <b>적합일 때만</b> 설명의무에 적합성보고서(발급·내용 안내 −5, 교부 −5)가 들어갑니다. '
          + '부적합이면 그 두 항목이 평가표에 없어 투자자성향을 말할 일도 없습니다. '
          + '<span style="color:var(--muted2)">(펀드·채권·IRP 는 적합/부적합에 따라 설명의무가 달라지지 않아 묻지 않습니다)</span></div></div>');
      }
    } else {
      h.push('<div class="fgroup"><div class="flabel"><span class="req">1</span> 상품군 · 시나리오</div>');
      h.push('<select id="selSheet">');
      Object.keys(BASE_SHEETS).forEach(function (k) {
        h.push('<option value="' + k + '"' + (k === ST.baseSheet ? ' selected' : '') + '>' + esc(BASE_SHEETS[k].label) + '</option>');
      });
      h.push('</select><div class="hint">' + esc(sh.note) + '</div></div>');
    }

    /* 고령 / 비고령 — 평가표가 갈리는 축이므로 별도 선택으로 노출한다 */
    h.push('<div class="fgroup"><div class="flabel"><span class="req">2</span> 고령 / 비고령</div><div class="seg" id="segSenior">');
    h.push('<button data-v="1" aria-pressed="' + (pickedSenior() && ST.senior === true) + '">고령투자자</button>');
    h.push('<button data-v="0" aria-pressed="' + (pickedSenior() && ST.senior === false) + '">비고령투자자</button>');
    h.push('</div>');
    h.push('<div class="hint"><span class="src ' + (sh.provenance === 'exact' ? 'auto' : 'man') + '">'
      + (sh.provenance === 'exact' ? '원표' : '보완') + '</span> ' + esc(sh.provenanceNote) + '</div>');
    h.push(pickedAll()
      ? '<div class="hint">현재 적용 : <b>' + esc(sh.label) + '</b> · ' + sh.items.length + '항목</div></div>'
      : '<div class="hint" style="color:var(--warn)">위 항목을 모두 고르면 평가표가 정해집니다.</div></div>');

    /* 진행 파트 — 적합성원칙과 상품설명의무를 갈라 진행한다.
       설명의무 전용 화면은 고를 것이 없으므로 이 칸 자체를 내지 않는다. */
    var pk = partKey();
    if (!EXPL) {
    h.push('<div class="fgroup"><div class="flabel"><span class="req">2-1</span> 진행 파트</div>');
    h.push('<div class="seg" id="segPart">');
    ['all', 'suit', 'expl'].forEach(function (k) {
      h.push('<button data-v="' + k + '" aria-pressed="' + (pk === k) + '">' + esc(PARTS[k].label) + '</button>');
    });
    h.push('</div>');
    h.push('<div class="hint">' + esc(PARTS[pk].hint) + '</div>');
    if (pk !== 'all') {
      var nOf = itemsOf().length, nAll = itemsAll().length;
      h.push('<div class="hint">이 파트 <b>' + nOf + '항목</b> / 평가표 전체 ' + nAll + '항목 · '
        + '스크립트·확인필요·읽기모드·인쇄가 <b>이 파트만</b> 다룹니다. '
        + '점수는 평가표 전체(103점) 기준 그대로입니다.</div>');
    }
    h.push('</div>');
    }

    /* 앞 단계를 고르기 전에는 상품 목록과 상담값 칸을 내지 않는다 —
       고른 적 없는 조건으로 만들어진 목록·문장을 보여 주면 안 된다. */
    if (!pickedAll()) {
      h.push('<div class="rule"></div><div class="sidenote">상품군' + (scenarioMatters() && ST.pick.cat ? ' · 적합/부적합' : '')
        + ' · 고령/비고령을 고르면 <b>상품 목록</b>이 열립니다.</div>');
      h.push(resetButtons());
      $('#side').innerHTML = h.join('');
      bindSide();
      return;
    }

    /* 적합성보고서에 들어가는 값 — ELS 적합에서만.
       설명의무 문안(투자권유 사유)이 이 넷을 그대로 읽게 되어 있다. */
    if (needsSuitValues()) {
      /* 판정은 항목의 적용 규칙 그대로 쓴다 — 화면과 스크립트가 서로 다른 말을 하면 안 된다 */
      var suitItem = itemsOf().filter(function (x) { return x.only === 'suitReport'; })[0];
      var suitApp = suitItem ? applicable(suitItem) : false;
      h.push('<div class="rule"></div><div class="fgroup"><div class="flabel">'
        + '<span class="req">2-1</span> 적합성보고서에 들어가는 값</div>');
      h.push('<div class="hint" style="margin-bottom:10px">설명의무 항목 「적합성보고서 발급 및 내용 안내」 의 '
        + '<b>투자권유 사유</b> 문안이 이 값들을 그대로 읽습니다 — 고르면 스크립트에 바로 들어갑니다.</div>');

      var nvAuto = ctx.newInvestor && !ctx.newInvestorTouched;
      h.push('<label class="chk"><input type="checkbox" class="ctxChk" data-k="newInvestor"'
        + (ctx.newInvestor ? ' checked' : '') + '><span>신규투자자'
        + (nvAuto ? ' <span class="badge" style="margin-left:4px">기본 켜짐</span>' : '') + '</span></label>');
      if (nvAuto) {
        h.push('<div class="hint" style="margin:2px 0 0">미스터리쇼핑은 대부분 신규투자자로 들어오므로 '
          + '<b>ELS 적합</b>에서는 켜 둔 채로 시작합니다 — 해당 없으면 끄십시오. 한 번 끄면 자동으로 다시 켜지지 않습니다.</div>');
      }
      h.push('<div class="hint" style="margin:2px 0 10px' + (suitApp ? '' : ';color:var(--warn)') + '">'
        + '적합성보고서 발급 대상은 <b>(투자자성향 및 현재 투자자금성향이 적합한) 고령투자자 또는 신규투자자</b>입니다. '
        + '현재 판정 <b style="color:var(--' + (suitApp ? 'ok' : 'warn') + ')">' + (suitApp ? '대상' : '미대상') + '</b>'
        + (suitApp ? '' : ' — 비고령이면서 신규투자자가 아니어서 적합성보고서 <b>2항목이 스크립트·읽기 모드에서 빠집니다</b>. '
            + '대상 고객이면 위 「고령 / 비고령」 을 바꾸거나 <b>신규투자자</b> 를 켜십시오.') + '</div>');

      h.push('<div style="margin-bottom:8px"><div style="font-size:12px;color:var(--muted);margin-bottom:2px">투자자성향</div>');
      h.push('<select id="selProfile"><option value="">— 선택 —</option>');
      Object.keys(PROFILES).forEach(function (k) {
        h.push('<option value="' + k + '"' + (ctx.custProfile === k ? ' selected' : '') + '>' + k + '</option>');
      });
      h.push('</select></div>');

      h.push('<div style="font-size:12px;color:var(--muted);margin:0 0 4px">현재 투자자금성향 <span style="color:var(--muted2)">(4항목)</span></div>');
      h.push(cashSelects(ctx));
      h.push('<div class="hint">고른 값이 그대로 투자권유 사유 문장에 들어갑니다.</div>');
      h.push(cashFitTable());
      h.push('</div>');
    }

    /* 상품 선택 */
    h.push('<div class="fgroup"><div class="flabel"><span class="req">3</span> 상품 선택 <span style="font-weight:400;color:var(--muted2)">(투자설명서 자동조회)</span></div>');
    if (!EXPL && sh.scenario === 'unfit' && profileGrades(ctx.custProfile)) {
      h.push('<label style="display:flex;gap:6px;align-items:center;margin:0 0 6px;font-size:13px;cursor:pointer">'
        + '<input type="checkbox" id="prodUnfitOnly"' + (ctx.prodUnfitOnly !== false ? ' checked' : '') + '>'
        + '<span>성향에 <b>부적합한 등급만</b> 보기 (고객이 지목하는 상품)</span></label>');
    }
    h.push('<div class="hint" id="prodCount" style="margin:0 0 6px"></div>');
    h.push('<div id="gradeBar"></div>');
    h.push('<input type="text" id="pq" placeholder="상품명 · 코드 · 기초자산 검색" value="">');
    h.push('<div class="listbox" id="prodBox"><select id="selProduct" size="8"></select></div>');
    h.push('<div class="scrollnav" id="prodNav" hidden><button type="button" data-d="-1" title="왼쪽으로">◀</button>'
      + '<span class="sp">이름이 길면 옆으로 밀어 보십시오 · Shift+휠 · 마우스를 올리면 전체 이름</span>'
      + '<button type="button" data-d="1" title="오른쪽으로">▶</button></div>');
    h.push('<div style="display:flex;gap:6px;margin-top:6px"><button class="tbtn" id="btnNewProduct" style="flex:1">새 상품 등록</button>'
      + '<button class="tbtn" id="btnDelProduct" style="flex:1"' + (p && p.custom ? '' : ' disabled') + '>등록상품 삭제</button></div>');
    h.push('<div class="hint">\u25CF 투자설명서 등록됨 · \u25CB 미등록</div>');
    /* 삭제 규칙을 눈에 보이게 적어 둔다 — 버튼이 왜 꺼져 있는지 알 수 있어야 한다 */
    h.push('<div class="hint">「등록상품 삭제」 는 <b>직접등록\u00b7안내장</b> 상품만 지울 수 있습니다. '
      + '자동조회 상품은 지워지지 않습니다 (다음 갱신에 다시 생기므로).'
      + (p ? (p.custom ? ' 지금 고른 상품은 <b>직접등록</b>이라 지울 수 있습니다.' : ' 지금 고른 상품은 <b>자동조회</b>라 버튼이 꺼져 있습니다.') : '')
      + '</div>');
    if (sh.cat === 'els') {
      var live = D.elsSource === 'live';
      h.push('<div class="hint">ELS/DLS 목록 <span class="badge ' + (live ? 'live' : 'sample') + '">' + (live ? '자동수집' : '내장 시드') + '</span> · ' + catalog().length + '건'
        + (D.elsMeta && D.elsMeta.updatedAt ? '<br>기준 ' + esc(String(D.elsMeta.updatedAt).slice(0, 10)) : '') + '</div>');
    } else {
      h.push('<div class="hint">내장 데이터는 <b>예시</b>입니다. 상담 전 투자설명서 원문 값으로 교체하세요.</div>');
    }
    h.push('</div>');

    /* 추천 상품 — 부적합 시나리오에서만.
       평가표는 부적합 안내 「전」 단계에서 성향에 적합한 상품을 먼저 권유하도록
       요구한다. 그때 권유하는 상품은 고객이 지목한 부적합 상품과 다른 상품이다. */
    if (sh.scenario === 'unfit' && !EXPL) {
      var rid = (ST.rec && ST.rec[sh.cat]) || '';
      var rp = recProduct();
      h.push('<div class="rule"></div><div class="fgroup"><div class="flabel">'
        + '<span class="req" style="background:var(--ok)">3-1</span> 추천 상품 '
        + '<span style="font-weight:400;color:var(--muted2)">(성향에 <b>적합</b>해서 먼저 권유하는 상품)</span></div>');
      h.push('<div class="hint" style="margin-bottom:8px">부적합 시나리오는 상품이 <b>둘</b>입니다 — '
        + '위 「상품 선택」 은 <b>고객이 지목한 부적합 상품</b>(설명 단계에서 설명), '
        + '여기는 <b>먼저 권유하는 적합 상품</b>(추천 단계에서 권유)입니다. '
        + '고르지 않으면 추천 단계 스크립트가 「확인필요」로 남습니다.</div>');
      h.push('<label style="display:flex;gap:6px;align-items:center;margin:0 0 6px;font-size:13px;cursor:pointer">'
        + '<input type="checkbox" id="recFitOnly"' + (ST.ctx.recFitOnly !== false ? ' checked' : '')
        + (profileGrades(ctx.custProfile) ? '' : ' disabled') + '>'
        + '<span>성향에 <b>적합한 등급만</b> 보기</span></label>');
      h.push('<div class="hint" id="recCount" style="margin:0 0 6px"></div>');
      h.push('<div id="recGradeBar"></div>');
      h.push('<input type="text" id="rq" placeholder="추천할 상품명 · 코드 검색" value="">');
      h.push('<div class="listbox" id="recBox"><select id="selRec" size="6"></select></div>');
      h.push('<div class="scrollnav" id="recNav" hidden><button type="button" data-d="-1" title="왼쪽으로">◀</button>'
        + '<span class="sp">이름이 길면 옆으로 밀어 보십시오 · Shift+휠</span>'
        + '<button type="button" data-d="1" title="오른쪽으로">▶</button></div>');
      h.push('<div style="display:flex;gap:6px;margin-top:6px">');
      if (sh.cat === 'els') {
        h.push('<button class="tbtn' + (rid === '__none' ? ' primary' : '') + '" id="btnRecNone" style="flex:1">적합한 상품 없음</button>');
      }
      h.push('<button class="tbtn" id="btnRecClear" style="flex:1">선택 해제</button></div>');
      if (rid === '__none') {
        h.push('<div class="note" style="margin-top:8px;border-left-color:var(--ok)"><b>적합한 상품 없음</b> 으로 안내합니다 — '
          + '추천 단계 스크립트가 「투자성향에 적합한 상품이 금일 발행되지 않았습니다」 안내로 바뀝니다.</div>');
      } else if (rp) {
        h.push('<div class="note" style="margin-top:8px;border-left-color:var(--ok)"><b>추천 상품</b> — ' + esc(rp.name)
          + (rp.riskGrade ? ' · ' + esc(rp.riskLabel || '') + ' ' + rp.riskGrade + '등급' : '') + '</div>');
        /* 추천 상품이 고객 성향에 정말 적합한지 표로 확인해 준다 */
        var fit = gradeFits(ctx.custProfile, rp.riskGrade);
        if (fit === false) {
          h.push('<div class="warnbox" style="margin-top:8px">이 상품은 <b>' + esc(rp.riskGrade) + '등급('
            + esc(gradeLabel(rp.riskGrade)) + ')</b> 으로, <b>' + esc(ctx.custProfile) + '</b> 성향이 가입할 수 있는 등급('
            + esc((profileGrades(ctx.custProfile) || []).join('·')) + '등급) 이 아닙니다.<br>'
            + '적합한 상품이 아니므로 추천 단계에 쓰면 <b>0점</b>입니다. 다른 상품을 고르십시오.</div>');
        } else if (fit === true) {
          h.push('<div class="hint" style="margin-top:6px;color:var(--ok)">위험도 분류표상 <b>' + esc(ctx.custProfile)
            + '</b> 성향에 적합한 등급입니다.</div>');
        } else if (!ctx.custProfile) {
          h.push('<div class="hint" style="margin-top:6px">투자자성향을 먼저 고르면 이 상품이 적합한 등급인지 함께 확인해 드립니다.</div>');
        }
      } else if (rid) {
        h.push('<div class="warnbox" style="margin-top:8px">고른 추천 상품을 목록에서 찾지 못했습니다. 다시 골라 주십시오.</div>');
      }
      h.push('</div>');
    }

    /* 상담 조건 — 투자자성향·현재 투자자금성향·고객구분은 모두 적합성원칙의 입력값이다.
       설명의무 전용 화면에서는 쓰이지 않으므로 칸을 내지 않는다. */
    if (!EXPL) {
    h.push('<div class="rule"></div><div class="flabel" style="margin-bottom:12px"><span class="req">4</span> 상담 조건</div>');

    h.push('<div class="fgroup"><div class="flabel">투자자성향 진단 결과</div><select id="selProfile"><option value="">— 선택 —</option>');
    Object.keys(PROFILES).forEach(function (k) {
      h.push('<option value="' + k + '"' + (ctx.custProfile === k ? ' selected' : '') + '>' + k + '</option>');
    });
    h.push('</select>');
    /*
     * 성향의 의미를 여기서 바로 고치게 한다.
     *
     * 앞 판은 이 값을 화면 위 「확인필요」 의 빨간 표시로만 넣을 수 있었다. 그런데
     * 그 입구는 상품별 저장통(ST.pman[상품])에 쓴다 — 상품마다 따로 저장되므로
     * 다음 상품을 고르면 다시 확인필요로 떴다. 성향의 의미는 상품이 아니라 고객의
     * 값이고, 성향이 같으면 회사가 쓰는 문장도 같다.
     *
     * 그래서 상담 조건(ST.ctx)에 두고 성향 바로 아래에서 고치게 한다. 여기 적으면
     * 상품을 바꿔도, 다음 상담에도 그대로 남는다.
     *
     * 다섯 성향 모두 사내 「투자자성향 결과별 안내사항」 화면의 문장이 들어 있어
     * 자동으로 채워진다. 그래도 칸을 열어 두는 것은 (가) 회사가 문구를 고쳤을 때
     * 창구가 그 자리에서 바로잡을 수 있어야 하고, (나) 성향이 늘어나 문장이 없는
     * 경우 왜 안 채워지는지 화면이 말해 주어야 하기 때문이다.
     */
    var pmNeed = ctx.custProfile && !PROFILES[ctx.custProfile];
    h.push('<div style="margin-top:6px"><div style="font-size:12px;color:var(--muted);margin-bottom:2px">성향의 의미'
      + ' <span style="color:var(--muted2)">— 성향명만 말하면 미인정 항목입니다</span></div>');
    h.push('<textarea id="profMeaning" rows="4" placeholder="「투자자성향 결과별 안내사항」 화면의 문장을 그대로 옮겨 적으십시오">'
      + esc(ctx.custProfileMeaning || '') + '</textarea>');
    h.push('<div class="hint"' + (pmNeed ? ' style="color:var(--warn)"' : '') + '>'
      + (!ctx.custProfile
        ? '성향을 고르면 사내 「투자자성향 결과별 안내사항」 문장이 자동 입력됩니다 (수정 가능).'
        : pmNeed
          ? '<b>' + esc(ctx.custProfile) + '</b> 은 사내 설명문을 확보하지 못해 자동 입력되지 않습니다 — '
            + '「투자자성향 결과별 안내사항」 화면의 문장을 한 번 옮겨 적으면 이후 상담에도 그대로 쓰입니다. '
            + '(짓지 않고 비워 둔 것입니다 — 회사가 쓰지 않는 문장을 읽으면 그 자체로 부정확한 설명이 됩니다.)'
          : '사내 「투자자성향 결과별 안내사항」 원문입니다 — 그대로 읽으십시오. '
            + '회사가 문구를 고쳤으면 여기서 바로잡으면 되고, 상품을 바꿔도 그대로 쓰입니다.')
      + '</div></div>');
    h.push('</div>');

    h.push('<div class="fgroup"><div class="flabel">일반 / 전문금융소비자</div><div class="seg" id="segConsumer">');
    ['일반금융소비자', '전문금융소비자'].forEach(function (v) {
      h.push('<button data-v="' + v + '" aria-pressed="' + (ctx.consumerType === v) + '">' + v + '</button>');
    });
    h.push('</div></div>');

    h.push('<div class="fgroup"><div class="flabel">현재 투자자금성향 (4항목)</div>');
    h.push(cashSelects(ctx));
    h.push(cashFitTable());
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

    }

    h.push(resetButtons());
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
    var shq = sheet();
    var okG = profileGrades(ST.ctx.custProfile);
    /* 부적합 시나리오의 「선택 상품」 은 고객이 지목한 부적합 상품이다 —
       성향보다 위험한 등급만 걸러 볼 수 있게 한다 (기본 켜짐).
       단 설명의무 전용 화면에서는 걸러내지 않는다. 적합성 판정과 부적합확인서는
       적합성원칙 단계에서 이미 끝났고, 여기서는 고객이 고른 그 상품을 설명할 뿐이다.
       성향값은 적합성보고서 문안에 쓰려고 받아 둔 것이지 목록을 거르라고 받은 것이 아니다 —
       거르면 「성장형은 모든 등급을 가입할 수 있어 부적합한 상품이 없습니다」 가 되어
       목록이 통째로 비어 버린다. */
    var unfitOnly = !EXPL && shq.scenario === 'unfit' && !!okG && ST.ctx.prodUnfitOnly !== false;
    var all0 = catalog().filter(function (p) {
      if (!q) return true;
      return [p.name, p.id, p.issuer, p.mgr, p.under, p.kind, p.credit].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    var list = !unfitOnly ? all0 : all0.filter(function (p) {
      var g = numOf(p.riskGrade);
      return g == null ? true : okG.indexOf(g) < 0;
    });
    /* 등급으로 좁혀 보기 — 창구가 「4등급 펀드 뭐 있지」 하고 찾는 방식이다 */
    var gb = gradeBar(list, ST.ctx.gradePick || '', null);
    var gbox = $('#gradeBar');
    if (gbox) {
      gbox.innerHTML = gb.html;
      bindGradeBar('#gradeBar', function (g) {
        ST.ctx.gradePick = g; save(); fillProducts(($('#pq') || {}).value || '');
      });
    }
    var beforeGrade = list.length;
    list = byGrade(list, ST.ctx.gradePick || '');
    var pc = $('#prodCount');
    if (pc) {
      var head = unfitOnly
        ? '<b>' + esc(ST.ctx.custProfile) + '</b> 성향에 <b>부적합한</b> 등급만 <b>' + beforeGrade.toLocaleString()
          + '건</b> <span style="color:var(--muted2)">/ 전체 ' + all0.length.toLocaleString() + '건</span>'
        : '전체 <b>' + all0.length.toLocaleString() + '건</b>';
      if (ST.ctx.gradePick) head += ' · <b>' + esc(ST.ctx.gradePick) + (ST.ctx.gradePick === '?' ? '' : '등급')
        + '</b> ' + list.length.toLocaleString() + '건';
      /* 부적합 시나리오인데 부적합 상품이 없을 수 있다 — 왜인지 적어 준다 */
      if (unfitOnly && beforeGrade === 0) {
        head += '<br><b style="color:var(--warn)">' + esc(ST.ctx.custProfile) + ' 성향은 '
          + (okG || []).join('·') + '등급을 모두 가입할 수 있어 <b>부적합한 상품이 없습니다</b> — '
          + '부적합 상담 시나리오가 성립하지 않습니다. <b>적합</b> 평가표로 바꾸십시오.</b>';
      }
      pc.innerHTML = head;
    }
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
      /* 자동조회분과 직접등록분을 눈으로 갈라 보게 한다 — 지울 수 있는 것은
         직접등록분뿐이다. 자동조회분을 지우면 다음 갱신에 다시 생겨 혼란스럽다. */
      if (p.custom) tail += p.fromNotice ? ' \u00b7 안내장' : ' \u00b7 직접등록';
      /* 이름이 길어 잘리므로 전체 이름을 툴팁으로도 둔다 (옆으로 굴리지 않아도 되게) */
      return '<option value="' + esc(p.id) + '"' + (p.id === ST.productId ? ' selected' : '')
        + ' title="' + esc(p.name + tail) + '">' + mark + esc(p.name) + tail + '</option>';
    }).join('') || '<option disabled>검색 결과 없음</option>';
    bindScrollNav('#prodBox', '#prodNav');
  }

  /**
   * 등급 단추 줄 — 「전체 · 1 · 2 · … · 6」.
   * 건수를 함께 적어, 고를 수 있는 등급이 어디에 몇 건인지 보이게 한다.
   * 건수가 0인 등급은 눌리지 않는다.
   */
  function gradeBar(items, cur, onPick) {
    var cnt = {};
    items.forEach(function (p) {
      var g = numOf(p.riskGrade);
      var k = g == null ? '?' : String(g);
      cnt[k] = (cnt[k] || 0) + 1;
    });
    var h = ['<div class="seg gradeSeg" style="flex-wrap:wrap;margin:0 0 6px">'];
    h.push('<button data-g="" aria-pressed="' + (!cur) + '">전체 ' + items.length.toLocaleString() + '</button>');
    RISK_TABLE.grades.forEach(function (x) {
      var n = cnt[String(x.n)] || 0;
      h.push('<button data-g="' + x.n + '" aria-pressed="' + (String(cur) === String(x.n)) + '"'
        + (n ? '' : ' disabled') + ' title="' + esc(x.label) + '">' + x.n + '등급 ' + n + '</button>');
    });
    if (cnt['?']) {
      h.push('<button data-g="?" aria-pressed="' + (cur === '?') + '" title="위험등급을 모르는 상품">등급없음 ' + cnt['?'] + '</button>');
    }
    h.push('</div>');
    return { html: h.join(''), pick: onPick };
  }
  /** 등급 단추에 손을 붙인다 (목록을 다시 그릴 때마다 부른다) */
  function bindGradeBar(sel, fn) {
    var box = $(sel);
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
      b.onclick = function () { fn(b.dataset.g || ''); };
    });
  }
  /**
   * 목록을 옆으로 미는 단추. 스크롤바가 겹침(overlay) 방식인 브라우저에서는
   * 스크롤바가 있는지도 모르고 지나치므로, 눈에 보이는 단추를 함께 둔다.
   * 목록이 넘치지 않으면 감춘다.
   */
  function bindScrollNav(boxSel, navSel) {
    var box = $(boxSel), nav = $(navSel);
    if (!box || !nav) return;
    var over = box.scrollWidth > box.clientWidth + 2;
    nav.hidden = !over;
    if (!over) return;
    var upd = function () {
      var bs = nav.querySelectorAll('button');
      bs[0].disabled = box.scrollLeft <= 0;
      bs[1].disabled = box.scrollLeft >= box.scrollWidth - box.clientWidth - 1;
    };
    Array.prototype.forEach.call(nav.querySelectorAll('button'), function (b) {
      b.onclick = function () {
        box.scrollLeft += (+b.dataset.d) * Math.max(120, Math.round(box.clientWidth * 0.6));
        setTimeout(upd, 30);
      };
    });
    box.onscroll = upd;
    upd();
  }

  /** 등급으로 거른다 ('' 는 전체, '?' 는 등급 없는 것) */
  function byGrade(list, g) {
    if (!g) return list;
    return list.filter(function (p) {
      var n = numOf(p.riskGrade);
      return g === '?' ? n == null : String(n) === String(g);
    });
  }

  /**
   * 추천 상품 목록.
   *   ㆍ고객이 지목한 부적합 상품은 뺀다 (같은 것을 추천할 수 없다)
   *   ㆍ★ 성향에 적합한 등급만 보여 준다 —
   *     앞 판은 걸러 주지 않아, 위험중립형(4·5·6등급) 상담에서 목록 첫 줄에
   *     2등급·1등급 펀드가 떴다. 그것을 추천 상품으로 고르면 「적합한 상품
   *     추천」 항목이 0점이고 부적합 상담 절차가 처음부터 무너진다.
   *     체크를 풀면 전체를 볼 수 있지만, 고르면 경고가 뜬다.
   */
  function fillRec(q) {
    var sel = $('#selRec');
    if (!sel) return;
    q = (q || '').trim().toLowerCase();
    var cur = (ST.rec && ST.rec[sheet().cat]) || '';
    var okGrades = profileGrades(ST.ctx.custProfile);
    var fitOnly = ST.ctx.recFitOnly !== false && !!okGrades;
    var all = catalog().filter(function (p) {
      if (p.id === ST.productId) return false;
      if (!q) return true;
      return [p.name, p.id, p.issuer, p.mgr, p.under, p.kind].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    var list = !fitOnly ? all : all.filter(function (p) {
      /* 등급을 모르는 상품은 남긴다 — 걸러 버리면 고를 수 없다 */
      var g = numOf(p.riskGrade);
      return g == null ? true : okGrades.indexOf(g) >= 0;
    });
    var rgb = gradeBar(list, ST.ctx.recGradePick || '', null);
    var rbox = $('#recGradeBar');
    if (rbox) {
      rbox.innerHTML = rgb.html;
      bindGradeBar('#recGradeBar', function (g) {
        ST.ctx.recGradePick = g; save(); fillRec(($('#rq') || {}).value || '');
      });
    }
    var beforeG = list.length;
    list = byGrade(list, ST.ctx.recGradePick || '');
    var note = $('#recCount');
    if (note) {
      var txt = fitOnly
        ? '<b>' + esc(ST.ctx.custProfile) + '</b> 성향에 적합한 등급(' + okGrades.join('·') + '등급) <b>'
          + beforeG.toLocaleString() + '건</b> <span style="color:var(--muted2)">/ 전체 ' + all.length.toLocaleString() + '건</span>'
        : (okGrades
          ? '<b style="color:var(--warn)">전체 ' + all.length.toLocaleString() + '건을 보고 있습니다</b> — '
            + esc(ST.ctx.custProfile) + ' 성향에 적합한 등급은 ' + okGrades.join('·') + '등급입니다.'
          : '투자자성향을 고르면 적합한 등급만 걸러 보여 드립니다. <b>' + all.length.toLocaleString() + '건</b>');
      if (ST.ctx.recGradePick) txt += ' · <b>' + esc(ST.ctx.recGradePick)
        + (ST.ctx.recGradePick === '?' ? '' : '등급') + '</b> ' + list.length.toLocaleString() + '건';
      /* 적합한 상품이 하나도 없을 수 있다 — 그때가 「적합한 상품 없음」 을 누를 자리다 */
      if (fitOnly && beforeG === 0) {
        txt += '<br><b style="color:var(--warn)">' + esc(ST.ctx.custProfile) + ' 성향에 적합한 등급('
          + okGrades.join('·') + '등급) 상품이 <b>지금 목록에 없습니다</b>'
          + (sheet().cat === 'els'
            ? ' — 아래 <b>「적합한 상품 없음」</b> 을 누르면 그렇게 안내하는 스크립트로 바뀝니다 (정확히 안내하면 우수 인정).'
            : ' — 검색어를 지우거나 체크를 풀어 다시 찾아보십시오.') + '</b>';
      }
      note.innerHTML = txt;
    }
    /**
     * 목록을 자르지 않는다.
     *
     * 앞 판은 검색 없이 200건까지만 그렸다(무거워진다는 이유였다). 그런데 펀드는
     * 국내 1,513건·해외 1,681건이라 이름 앞머리 200건만 뜨고 나머지는 검색해야만
     * 나왔다 — 창구에서 보면 「자동조회가 안 되고 샘플 몇 개만 있는」 것이다.
     * 부적합 상담은 성향에 적합한 상품을 먼저 권유하는 데서 시작하는데, 정작 그
     * 권유할 상품을 목록에서 고를 수가 없었다.
     *
     * 무겁다는 이유도 사실과 맞지 않았다. 바로 위 「상품 선택」(fillProducts)은
     * 같은 화면에서 1,513건을 상한 없이 그리고 있다. 둘을 같게 맞춘다.
     */
    sel.innerHTML = '<option value=""' + (cur ? '' : ' selected') + '>— 고르지 않음 —</option>'
      + list.map(function (p) {
        var tail = p.riskGrade ? ' \u00b7 ' + (p.riskLabel || '') + ' ' + p.riskGrade + '등급' : '';
        return '<option value="' + esc(p.id) + '"' + (p.id === cur ? ' selected' : '')
          + ' title="' + esc(p.name + tail) + '">' + esc(p.name) + tail + '</option>';
      }).join('');
    bindScrollNav('#recBox', '#recNav');
  }

  function bindSide() {
    function afterSheetChange() {
      ST.pros = null;
      applyElsDefaults();
      var l = catalog();
      if (!l.some(function (p) { return p.id === ST.productId; })) ST.productId = l.length ? l[0].id : null;
      save(); renderAll();
    }
    var selSheet = $('#selSheet');
    if (selSheet) selSheet.onchange = function () { ST.baseSheet = this.value; afterSheetChange(); };
    Array.prototype.forEach.call(document.querySelectorAll('#segCat button'), function (b) {
      b.onclick = function () {
        /* 이미 그 상품군이면 그대로 둔다 — ELS 에서 부적합을 골라 둔 것을
           상품군 단추를 다시 눌렀다고 적합으로 되돌리면 안 된다 */
        var want = b.dataset.v;
        var cur = BASE_SHEETS[ST.baseSheet], next = BASE_SHEETS[want];
        var same = cur && next && cur.cat === next.cat && ST.pick.cat;
        ST.pick.cat = true;
        if (same) { save(); renderAll(); return; }
        /* 상품군이 바뀌면 그 상품군의 적합/부적합은 다시 골라야 한다 */
        ST.pick.scen = false;
        ST.baseSheet = want; ST.ctx.gradePick = ''; afterSheetChange();
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#segScenario button'), function (b) {
      b.onclick = function () { ST.pick.scen = true; ST.baseSheet = b.dataset.v; afterSheetChange(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#segPart button'), function (b) {
      b.onclick = function () {
        ST.part = b.dataset.v;
        /* 파트를 바꾸면 읽던 자리가 달라진다 — 읽기모드는 처음부터 */
        PR.i = 0;
        save(); renderAll();
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#segSenior button'), function (b) {
      b.onclick = function () { ST.pick.senior = true; ST.senior = b.dataset.v === '1'; afterSheetChange(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#segWatch button'), function (b) {
      b.onclick = function () {
        ST.ctx.watchOverride = b.dataset.v === '' ? null : b.dataset.v === '1';
        save(); renderAll();
      };
    });
    /* 단계 게이트 상태에서는 상품 칸이 아직 없다 — 있는 것만 붙인다.
       (하나라도 없는 것에 걸면 여기서 멈춰 본문·탭이 아예 그려지지 않는다) */
    var btnNew = $('#btnNewProduct');
    if (btnNew) btnNew.onclick = newProduct;
    var btnDel = $('#btnDelProduct');
    if (btnDel) btnDel.onclick = function () {
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
    var pu = $('#prodUnfitOnly');
    if (pu) pu.onchange = function () { ST.ctx.prodUnfitOnly = pu.checked; save(); renderAll(); };
    var pq = $('#pq');
    if (pq) pq.oninput = function () { fillProducts(this.value); };
    /* 추천 상품 (부적합 시나리오) */
    if ($('#selRec')) {
      fillRec('');
      $('#rq').oninput = function () { fillRec(this.value); };
      $('#selRec').onchange = function () {
        ST.rec[sheet().cat] = this.value || null;
        save(); renderAll();
      };
      var rf = $('#recFitOnly');
      if (rf) rf.onchange = function () { ST.ctx.recFitOnly = rf.checked; save(); fillRec(($('#rq') || {}).value || ''); };
      var rn = $('#btnRecNone');
      if (rn) rn.onclick = function () { ST.rec[sheet().cat] = '__none'; save(); renderAll(); };
      $('#btnRecClear').onclick = function () { delete ST.rec[sheet().cat]; save(); renderAll(); };
    }
    var selProd = $('#selProduct');
    if (selProd) selProd.onchange = function () {
      ST.productId = this.value; ST.pros = null;
      /* 상품이 평가표를 정한다 — 해외펀드를 고르면 해외 평가표로 따라간다 */
      syncSheetToProduct();
      save(); renderAll();
    };
    /* 아래는 적합성원칙 입력칸이다 — 설명의무 전용 화면에는 없으므로 하나씩 확인하고 붙인다.
       (여기서 return 해 버리면 그 아래 「체크 초기화 · 전체 초기화」 까지 죽는다) */
    var selProfile = $('#selProfile');
    if (selProfile) selProfile.onchange = function () {
      ST.ctx.custProfile = this.value;
      ST.ctx.custProfileMeaning = meaningFor(this.value);
      save(); renderAll();
    };
    /*
     * 손으로 적은 설명문은 그 성향의 것으로 적어 둔다. 성향을 바꿔도 앞 성향의
     * 문장이 남지 않고, 그 성향으로 돌아오면 적어 둔 것이 다시 나온다.
     * 사이드바까지 다시 그리면 입력 중인 칸이 날아가므로 본문과 탭만 다시 그린다.
     */
    var pm = $('#profMeaning');
    if (pm) pm.oninput = function () {
      var v = this.value.trim();
      ST.ctx.custProfileMeaning = v;
      if (ST.ctx.custProfile) {
        if (!ST.ctx.profMeanings) ST.ctx.profMeanings = {};
        if (v && v !== PROFILES[ST.ctx.custProfile]) ST.ctx.profMeanings[ST.ctx.custProfile] = v;
        else delete ST.ctx.profMeanings[ST.ctx.custProfile];
      }
      save(); renderTabs(); renderView();
    };
    Array.prototype.forEach.call(document.querySelectorAll('#segConsumer button'), function (b) {
      b.onclick = function () { ST.ctx.consumerType = b.dataset.v; save(); renderAll(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.cashSel'), function (s) {
      s.onchange = function () {
        ST.ctx[s.dataset.k] = s.value;
        /* 손실감내수준은 원금보존태도의 하위 문항이다 — 답할 수 없게 되면 답을 지운다.
           남겨 두면 화면에는 안 보이는 값이 문장과 판정에 그대로 쓰인다. */
        if (s.dataset.k === 'cashPrincipal' && !cashLossOpen()) ST.ctx.cashLoss = '';
        save(); renderAll();
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.ctxChk'), function (c) {
      c.onchange = function () {
        ST.ctx[c.dataset.k] = c.checked;
        /* 사람이 정한 값은 자동 기본값이 덮지 않는다 */
        if (c.dataset.k === 'newInvestor') ST.ctx.newInvestorTouched = true;
        save(); renderAll();
      };
    });
    bindResetButtons();
  }

  function bindResetButtons() {
    var btnRC = $('#btnResetChecks');
    if (btnRC) btnRC.onclick = function () {
      var n = checkedCount();
      if (!n) return;
      var pref = sheetKey() + '|';
      Object.keys(ST.checks).forEach(function (k) { if (k.indexOf(pref) === 0) delete ST.checks[k]; });
      save(); renderAll();
      /* 눌렀는데 화면이 그대로면 안 눌린 줄 안다 — 지운 개수를 잠깐 보여 준다.
         (카드가 접혀 있으면 체크가 지워진 것이 눈에 안 띈다) */
      var again = $('#btnResetChecks');
      if (again) {
        var keep = again.textContent;
        again.textContent = '체크 ' + n + '개를 해제했습니다';
        setTimeout(function () { var el = $('#btnResetChecks'); if (el) el.textContent = keep; }, 1600);
      }
    };
    var btnRD = $('#btnResetDocs');
    if (btnRD) btnRD.onclick = function () {
      var docs = docEntries();
      if (!docs.length) return;
      var list = docs.slice(0, 5).map(function (d) { return '  · ' + d.name; }).join('\n')
        + (docs.length > 5 ? '\n  · 외 ' + (docs.length - 5) + '건' : '');
      if (!confirm('직접 등록한 투자설명서 ' + docs.length + '건을 지웁니다.\n\n' + list
        + '\n\n자동수집분(펀드 카탈로그·판독 결과, ELS·채권)은 지워지지 않고 그대로 다시 조회됩니다.\n'
        + '체크 · 입력값 · 고른 조건은 그대로 둡니다.\n\n계속하시겠습니까?')) return;
      DOCS = {}; saveDocs();
      ST.pros = null;
      save(); renderAll();
      var again = $('#btnResetDocs');
      if (again) {
        var keep = again.textContent;
        again.textContent = '설명서 ' + docs.length + '건을 지웠습니다';
        setTimeout(function () { var el = $('#btnResetDocs'); if (el) el.textContent = keep; }, 1600);
      }
    };
    var btnRA = $('#btnResetAll');
    if (btnRA) btnRA.onclick = function () {
      if (!confirm(
        '전체 초기화 — 아래를 지웁니다.\n'
        + '  · 고른 조건 (상품군 · 적합/부적합 · 고령/비고령)\n'
        + '  · 선택한 상품\n'
        + '  · 모든 평가표의 Check Point 체크\n'
        + '  · 직접 입력한 값 (확인필요에 적은 값 포함)\n'
        + '  · 상담 조건 (투자자성향 · 현재 투자자금성향 · 신규투자자)\n'
        + '  · 등록한 투자설명서\n\n'
        + '남는 것 : 직접 등록한 상품 목록, 성향별 설명문\n\n'
        + '계속하시겠습니까?')) return;
      ST.pman = {}; ST.inline = {}; ST.checks = {}; DOCS = {}; saveDocs();
      ST.pick = { cat: false, scen: false, senior: false };
      ST.productId = null;
      /* 성향별 설명문은 고객의 값이 아니라 회사가 쓰는 문장이다 — 초기화해도 남긴다 */
      var keepMeanings = ST.ctx.profMeanings;
      ST.ctx = { consumerType: '일반금융소비자', custProfile: '', custProfileMeaning: '', cashPurpose: '', cashPrincipal: '', cashLoss: '', cashHorizon: '', newInvestor: false, watchOverride: null };
      if (keepMeanings) ST.ctx.profMeanings = keepMeanings;
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
    if (EXPL && !pickedAll()) {
      var step = function (done, label, detail) {
        return '<div style="line-height:1.9">'
          + (done ? '<span style="color:var(--ok);font-weight:700">✓</span>' : '<span style="color:var(--muted2)">·</span>')
          + ' <b>' + label + '</b> <span style="color:var(--muted2)">— ' + detail + '</span></div>';
      };
      v.innerHTML = '<div class="empty" style="text-align:left;max-width:620px;margin:40px auto">'
        + '<h3 style="text-align:center">먼저 상담 조건을 고르십시오</h3>'
        + '<p style="text-align:center;color:var(--muted2);margin-bottom:22px">고른 조건에 따라 평가표가 정해지고, 상품 목록이 열립니다.</p>'
        + step(ST.pick.cat, '① 상품군', '펀드 · ELS·DLS · 원화채권 · 외화채권 · IRP')
        + (ST.pick.cat && scenarioMatters()
          ? step(ST.pick.scen, '② 적합 / 부적합', 'ELS 는 적합일 때만 설명의무에 적합성보고서가 들어갑니다')
          : '')
        + step(ST.pick.senior, (ST.pick.cat && scenarioMatters() ? '③' : '②') + ' 고령 / 비고령', '평가표가 갈리는 축입니다')
        + '<p style="margin-top:22px;color:var(--muted2)">기본값을 두지 않았습니다 — 고객마다 달라지는 판단이라, '
        + '고른 적 없는 조건으로 스크립트가 만들어지면 안 되기 때문입니다.</p>'
        + '</div>';
      return;
    }
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
    var tt = totals();
    h.push('<div class="banner blue"><b>' + esc(sh.label) + '</b> · 선택 상품 <b>' + esc(p.name) + '</b>'
      + (p.riskGrade ? ' (' + esc(p.riskLabel) + ' ' + p.riskGrade + '등급)' : '')
      + (EXPL
        /* 이 화면은 설명의무만 다룬다 — 만점도 설명의무 배점으로 다시 잡아 적는다.
           적합성원칙 배점을 함께 적으면 창구가 여기서 100점을 받는 줄로 읽는다. */
        ? '<br><b>상품설명의무</b> 배점 ' + tt.baseMax + '점 · 가점 최대 +' + tt.plusMax + '점 '
          + '<span style="color:var(--muted2)">(평가표 ' + esc(sh.label) + ' 중 설명의무 ' + itemsOf().length
          + '항목 · 전체 ' + itemsAll().length + '항목 중)</span>'
          + '<br><span style="color:var(--muted2)">적합성원칙은 이 화면에서 다루지 않습니다 — 전체 진행은 완전판매 스크립트 전체판에서 하십시오.'
          + (needsSuitValues()
            ? ' 다만 ELS 적합은 <b>설명의무 안에 적합성보고서(발급·교부)</b>가 있어, 그 문안이 쓰는 투자자성향과 현재 투자자금성향은 왼쪽에서 고릅니다.'
            : '')
          + '</span>'
        : '<br>기본배점 ' + Object.keys(sh.secTotals).map(function (k) { return k + ' ' + sh.secTotals[k]; }).join(' + ') + ' = 100점 · 가점 최대 +3점 (총 103점)'
          + (partKey() !== 'all'
            ? '<br><b>진행 파트 · ' + esc(PARTS[partKey()].label) + '</b> — 아래 스크립트·확인필요·읽기모드·인쇄가 이 파트만 다룹니다 '
              + '<span style="color:var(--muted2)">(' + itemsOf().length + '항목 / 전체 ' + itemsAll().length + '항목)</span>'
            : ''))
      + '</div>');

    /* 조건 때문에 빠지는 항목 — 스크립트에는 「미해당」 으로 남지만 읽기 모드와
       셀프채점에서는 빠진다. 그것을 모르면 「스크립트가 왜 없지」 가 된다.
       (적합성보고서가 대표적이다 — 비고령·비신규 고객이면 대상이 아니다) */
    var na = itemsOf().filter(function (x) { return !applicable(x); });
    if (na.length) {
      h.push('<div class="banner"><b>지금 상담 조건에서 빠지는 항목 ' + na.length + '건</b> — '
        + na.map(function (x) { return esc(x.title); }).join(' · ')
        + '<br><span style="color:var(--muted2)">아래 카드에 「미해당」 으로 표시되고 <b>읽기 모드·셀프채점에서는 빠집니다</b>. '
        + '카드를 열면 무엇을 켜야 살아나는지 적혀 있습니다.</span></div>');
    }

    /* 파트별 준비 상태 — 「상품 자료에서 채울 값」 과 「상담 중 파악할 값」 을 갈라 센다.
       상품설명의무는 상품만 고르면 채워지는 부분이라, 상품 쪽이 0건이면 적합성원칙이
       끝나지 않았어도 바로 읽거나 인쇄할 수 있다. 그것을 한 줄로 알려 준다. */
    if (partKey() !== 'all') {
      var byG = { doc: 0, ref: 0, once: 0, ask: 0, rec: 0 };
      miss.forEach(function (m) { var g = missGroup(m); if (byG[g] != null) byG[g]++; else byG.doc++; });
      var needSelf = byG.doc + byG.ref + byG.once + byG.rec;   /* 미리 채워 둘 수 있는 값 */
      var ready = needSelf === 0;
      h.push('<div class="banner" style="border-color:var(--' + (ready ? 'ok' : 'warn')
        + ');border-left-color:var(--' + (ready ? 'ok' : 'warn') + ')' + (ready ? ';background:#f3f9f4' : '') + '">'
        + '<b style="color:var(--' + (ready ? 'ok' : 'warn') + ')">' + (ready ? '이 파트는 지금 진행할 수 있습니다' : '먼저 채워야 할 값이 있습니다')
        + '</b> — 미리 채울 수 있는 값 <b>' + needSelf + '건</b>'
        + (byG.ask ? ' · 상담 중 고객에게 확인할 값 <b>' + byG.ask + '건</b>' : '')
        + '<br><span style="color:var(--muted2)">'
        + (ready
          ? '남은 값은 상담하며 고객에게 확인해 채우는 것뿐입니다. 「읽기 모드」 나 「인쇄 / PDF」 로 바로 진행하십시오.'
          : '「투자설명서 자동조회」 탭에서 상품 자료를 등록하거나, 빨간 표시를 눌러 채우십시오.')
        + '</span></div>');
    }

    /* 부적합 상담 진행 순서 — 지금 어디까지 갖춰졌는지 보여 준다.
       담당자가 「프로세스가 그렇게 되지 않는 것 같다」 고 했다. 절차는 맞게
       들어 있었지만, 무엇을 어디서 고르는지가 화면에 드러나지 않아 순서가
       보이지 않았다. 네 단계를 세우고 각 단계의 지금 상태를 적는다. */
    if (sh.scenario === 'unfit' && !EXPL) {
      var okG2 = profileGrades(ST.ctx.custProfile);
      var rp2 = recProduct();
      var rn2 = recNone();
      var selG = numOf(valueOf('riskGrade'));
      var mark = function (ok) {
        return ok === true ? '<span style="color:var(--ok);font-weight:700">✓</span>'
          : (ok === false ? '<span style="color:var(--err);font-weight:700">✗</span>' : '<span style="color:var(--muted2)">·</span>');
      };
      var st1 = ST.ctx.custProfile ? true : false;
      var st2 = rn2 ? true : (rp2 ? (gradeFits(ST.ctx.custProfile, rp2.riskGrade) !== false) : false);
      var st3 = (selG != null && okG2) ? (okG2.indexOf(selG) < 0) : (p ? null : false);
      var kindWord = sh.cat === 'els' ? 'ELS' : (sh.cat === 'fund' ? '펀드' : '상품');
      h.push('<div class="banner"><b>부적합 상담 진행 순서</b> — 상품이 <b>둘</b>입니다. 아래 순서로 고르십시오.'
        + '<div style="margin-top:8px;line-height:1.85">'
        + mark(st1) + ' <b>①</b> 투자자성향 진단 — '
        + (ST.ctx.custProfile
          ? '<b>' + esc(ST.ctx.custProfile) + '</b> (가입 가능 ' + (okG2 ? okG2.join('·') + '등급' : '—') + ')'
          : (EXPL ? '빨간 표시를 눌러 성향을 적으십시오' : '왼쪽 「4 상담 조건」 에서 성향을 고르십시오'))
        + '<br>' + mark(st2) + ' <b>②</b> 성향에 <b>적합한</b> ' + kindWord + ' 추천 — '
        + (rn2 ? '「적합한 상품 없음」 으로 안내'
          : (rp2
            ? '<b>' + esc(rp2.name) + '</b>' + (rp2.riskGrade ? ' (' + esc(rp2.riskLabel || '') + ' ' + rp2.riskGrade + '등급)' : '')
              + (gradeFits(ST.ctx.custProfile, rp2.riskGrade) === false
                ? ' <b style="color:var(--err)">— 이 상품은 부적합 등급입니다. 다시 고르십시오</b>' : '')
            : '왼쪽 「3-1 추천 상품」 에서 고르십시오' + (okG2 ? ' (' + okG2.join('·') + '등급)' : '')))
        + '<br>' + mark(st3) + ' <b>③</b> 고객이 <b>더 위험한</b> ' + kindWord + ' 지목 — '
        + (p
          ? '<b>' + esc(p.name) + '</b>' + (selG != null ? ' (' + esc(valueOf('riskLabel') || '') + ' ' + selG + '등급)' : '')
            + (st3 === false ? ' <b style="color:var(--err)">— 이 상품은 성향에 적합합니다. 부적합 상담이 아닙니다</b>' : '')
          : '왼쪽 「3 상품 선택」 에서 고르십시오')
        + '<br>' + mark(null) + ' <b>④</b> 부적합확인서 징구 후 <b>③의 ' + kindWord + '</b>'
        + josa(kindWord, '을', '를') + ' 설명 — '
        + '아래 「[감점] 부적합 안내 ①·②」 → 「상품설명의무」 항목이 그 순서입니다'
        + '</div></div>');
    }

    /* 선택 상품이 고객 성향에 적합한지 — 시나리오와 맞는지까지 본다.
       위험도 분류표(2025.11.24)의 「투자자구분」 줄로 판정한다.
       적합 시나리오에서 부적합 상품을 고르고 있으면 스크립트 자체가 어긋난다. */
    var selFit = gradeFits(ST.ctx.custProfile, valueOf('riskGrade'));
    if (selFit !== null) {
      var okList = (profileGrades(ST.ctx.custProfile) || []).join('·');
      var gN = numOf(valueOf('riskGrade'));
      if (sh.scenario === 'unfit' && selFit === true && !EXPL) {
        /* 설명의무 화면에서는 이 경고를 내지 않는다 — 부적합확인서까지 마친 뒤
           고객이 지목한 상품을 설명하는 자리라, 등급이 성향에 맞는지는 따질 일이 아니다. */
        h.push('<div class="banner"><b>시나리오가 맞지 않습니다</b> — 지금 고른 상품은 '
          + gN + '등급(' + esc(gradeLabel(gN)) + ')으로 <b>' + esc(ST.ctx.custProfile)
          + '</b> 성향에 <b>적합한</b> 상품입니다(가입 가능 ' + esc(okList) + '등급). '
          + '부적합 평가표는 고객이 성향보다 위험한 상품을 지목하는 상담입니다 — '
          + '더 위험한 등급의 상품을 고르거나 <b>적합</b>'
          + (EXPL ? '으로 바꾸십시오 (왼쪽 「1-1 적합 / 부적합」).' : ' 평가표로 바꾸십시오.') + '</div>');
      } else if (sh.scenario !== 'unfit' && selFit === false) {
        h.push('<div class="banner"><b>시나리오가 맞지 않습니다</b> — 지금 고른 상품은 '
          + gN + '등급(' + esc(gradeLabel(gN)) + ')으로 <b>' + esc(ST.ctx.custProfile)
          + '</b> 성향이 가입할 수 있는 등급(' + esc(okList) + '등급)이 아닙니다. '
          + '적합 평가표에서 부적합 상품을 권유하면 <b>적합성원칙 위반</b>입니다 — '
          + '적합한 상품을 고르거나 <b>부적합</b>'
          + (EXPL ? '으로 바꾸십시오 (왼쪽 「1-1 적합 / 부적합」).' : ' 평가표로 바꾸십시오.') + '</div>');
      } else {
        h.push('<div class="banner" style="border-color:var(--ok);border-left-color:var(--ok);background:#f3f9f4">'
          + '<b style="color:var(--ok)">성향·등급 확인</b> — ' + esc(ST.ctx.custProfile) + ' 성향의 가입 가능 등급은 '
          + esc(okList) + '등급이고, 이 상품은 ' + gN + '등급(' + esc(gradeLabel(gN)) + ')으로 '
          + (selFit ? '<b>적합</b>' : '<b>부적합</b>') + '합니다 — ' + esc(sh.label) + ' 시나리오와 맞습니다. '
          + '<span style="color:var(--muted2)">(당사 위험도 분류표 ' + esc(RISK_TABLE.asOf) + ' 기준)</span></div>');
      }
    }
    if (miss.length) {
      /* 어디서 오는 값인지 나눠 보여 준다 — 투자설명서에 없는 것을 거기서 찾게 하지 않는다 */
      var GRP = [
        ['rec', '추천 상품을 고르면 채워짐', '부적합 시나리오의 「적합한 상품 추천」 단계에 쓰이는 값입니다. 왼쪽 「3-1 추천 상품」 에서 성향에 적합한 상품을 고르면 한꺼번에 채워집니다 — 설명서를 뒤질 값이 아닙니다.'],
        ['doc', '투자설명서에서 확인', '투자설명서 원문에서 채워야 하는 값입니다.'],
        ['ask', '상담 중 파악·입력', EXPL
          ? '고객에게 확인하거나 상담 중 옮겨 적는 값입니다 — 투자설명서에는 없습니다. 빨간 표시를 누르면 그 자리에서 적을 수 있고, 적은 값은 상품을 바꿔도 남습니다.'
          : '고객에게 확인하거나 상담 중 옮겨 적는 값입니다 — 투자설명서에는 없습니다. 왼쪽 「4 상담 조건」 에서 투자자성향·투자자금성향·가입유형을 고르면 성향의 의미와 가입유형별 증빙서류까지 함께 채워집니다.'],
        ['ref', '별도 자료에서 확인', '투자설명서에는 없는 값입니다. 증시전망은 지점 자료, 민평금리·민평단가는 금융투자협회 채권정보센터, 발행회사 재무정보는 전자공시(DART), 신용등급의 의미는 신용평가사 등급 정의표, 매매수수료는 채권 매매 화면·약관에 있습니다.'],
        ['once', '한 번만 등록 (이후 모든 상담에서 재사용)', '상품이 아니라 회사·계좌의 조건입니다. 「투자설명서 자동조회」 탭 맨 아래 「전 상품 공용 문구」 에 한 번 등록해 두면 다시 묻지 않습니다.']
      ];
      /*
       * 항목 이름만으로는 무엇을 넣어야 하는지 모르는 것이 있다 —
       * 「선취수수료 계산 예시 문장」 은 계산 문장을 손으로 쓰라는 말이 아니고,
       * A클래스 선취판매수수료율을 넣으면 뺄셈까지 저절로 만들어지는 항목이다.
       * 항목 정의의 hint 를 칩에 달아 마우스를 올리면 보이게 한다.
       */
      var chip = function (m) {
        var hint = hintOf(m.key);
        return '<span class="v miss" data-kind="' + m.kind + '" data-key="' + esc(m.key) + '"'
          + (hint ? ' title="' + esc(hint) + '"' : '') + '>' + esc(m.label) + '</span>';
      };
      var parts = [];
      GRP.forEach(function (g) {
        var list = miss.filter(function (m) { return missGroup(m) === g[0]; });
        if (!list.length) return;
        /*
         * 앞 판은 묶음마다 12개까지만 칩을 그리고 나머지를 「외 N건」 으로 접었다.
         * 그런데 이 칩이 값을 넣는 입구다 — 접힌 것은 어느 항목인지도 알 수 없고
         * 클릭할 수도 없었다. 외화채권은 설명서 묶음이 14건이라 2건이 그렇게 가려져
         * 있었다. 다 그린다. 40건은 한 상품에서 남는 최대치(외화채권 20건)의 두 배다.
         */
        parts.push('<div style="margin-top:6px"><b>' + g[1] + ' ' + list.length + '건</b> <span style="color:var(--muted2)">— ' + g[2] + '</span><br>'
          + list.slice(0, 40).map(chip).join(' ')
          + (list.length > 40 ? ' <span style="color:var(--muted2)">외 ' + (list.length - 40) + '건</span>' : '') + '</div>');
      });
      /*
       * 설명서에서 찾을 값이 남았으면, 그 설명서를 여기서 바로 연다.
       * 「투자설명서에서 확인」 이라고만 적어 두면 창구는 그 PDF 를 스스로 찾아야 하는데,
       * 카탈로그가 종목마다 설명서 주소를 갖고 있다 (docT·docG). 인터넷이 없는 PC 에서는
       * 링크가 열리지 않지만, 열리는 PC 에서는 내려받아 「투자설명서 등록」 탭에 올리면
       * 이 묶음이 한꺼번에 채워진다.
       */
      if (miss.some(function (m) { return missGroup(m) === 'doc'; })) {
        var fcm = product() && (fundCatByCode(product().id) || fundCatByName(product().name));
        var urlm = fcm && (fundDocUrl(fcm, 'T') || fundDocUrl(fcm, 'G'));
        if (urlm) {
          parts.push('<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--line)">'
            + '이 상품의 투자설명서 주소를 수집해 두었습니다 — '
            + '<a href="' + esc(urlm) + '" target="_blank" rel="noopener"><b>투자설명서 PDF 열기</b></a> '
            + '<span style="color:var(--muted2)">(내려받아 「투자설명서 등록」 탭에 올리면 위 값들이 한꺼번에 채워집니다. '
            + '인터넷이 막힌 PC 에서는 열리지 않습니다)</span></div>');
        }
      }
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
    if (!app) h.push('<div class="warnbox">' + whyNotApplicable(item) + '</div>');
    if (item.crit) h.push('<div class="warnbox">★ ' + esc(item.crit) + '</div>');
    (item.script || []).forEach(function (s) {
      if (!lineOn(s)) return;
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
        if (!lineOn(s)) return;
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
    /* 자동수집분의 출처는 상품군마다 다르다 — 펀드에 「els-prospectus.js」 라고
       적어 두면 창구가 엉뚱한 파일을 찾는다 */
    var COLLECT_SRC = {
      els: '자동수집 (data/els-prospectus.js)',
      fund: '자동수집 (data/fund-catalog.js · fund-prospectus.js)',
      irp: '자동수집 (data/fund-catalog.js · fund-prospectus.js)',
      bond: '자동수집 (data/bond-catalog.js)',
      bondfx: '자동수집 (data/bond-catalog.js)'
    };
    var SRC = {
      PDF: '투자설명서 PDF', TEXT: '텍스트 붙여넣기', MANUAL: '항목 직접 등록',
      API: '사내 상품 API', JSON: 'JSON 가져오기',
      COLLECT: COLLECT_SRC[sheet().cat] || '자동수집'
    };
    /**
     * 원문을 판독하지 못한 자동수집분을 「등록됨」 이라고 말하지 않는다.
     * 카탈로그(명칭·운용사·등급·수익률·거래기준)만으로도 이 카드가 채워지므로,
     * 설명서 원문이 없는 펀드도 여태 「등록됨」 으로 보였다. 창구는 등록됐다는데
     * 확인필요가 열 몇 건인 것을 보고 고장으로 여긴다 — 사실대로 갈라 적는다.
     */
    var prosGap = !!(d && d.collected && d.prosRead === false);
    var stateLabel = !d ? '미등록' : (prosGap ? '원문 미판독' : '등록됨');
    var stateColor = !d ? 'r' : (prosGap ? 'o' : 'g');
    var stateSub = !d ? '아래에서 등록하세요'
      : esc(SRC[d.source] || d.source) + ' · ' + esc(String(d.registeredAt).slice(0, 16).replace('T', ' '))
        + (prosGap ? '<br><b style="color:var(--warn)">카탈로그 값만 있음 · 설명서 원문 없음</b>' : '')
        /* 설명서를 어느 원천에서 읽었는지 밝힌다 — 창구가 원문을 찾아갈 곳이 다르다 */
        + (!prosGap && d.prosSrc ? '<br>설명서 판독: ' + esc(d.prosSrc) : '');
    h.push('<div class="summary">');
    h.push('<div class="stat"><div class="l">투자설명서 등록 상태</div><div class="v2 ' + stateColor + '" style="font-size:24px;padding-top:6px">'
      + stateLabel + '</div><div class="s">' + stateSub + '</div></div>');
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
      if (prosGap) {
        /* 왜 비어 있는지, 이 펀드만 그런 것인지, 무엇을 하면 되는지를 한자리에서 말한다 */
        var nd = fundNoDocCount();
        h.push('<div class="note" style="border-left-color:var(--warn)">'
          + '<b>확인필요가 많은 까닭 — 이 펀드는 투자설명서 원문을 판독하지 못했습니다.</b><br>'
          + (d.docMissing
            ? '공모펀드 카탈로그(원천)에 이 펀드의 <b>투자설명서 주소가 없습니다</b>. '
              + '새로 설정된 펀드와 목표전환형에서 흔하며, 지금 카탈로그 '
              + nd.total.toLocaleString() + '종목 중 <b>' + nd.miss.toLocaleString() + '종목</b>이 그렇습니다.'
            : '설명서 주소는 있으나 원문을 <b>판독하지 못했습니다</b> (원문 PDF 가 깨진 경우입니다).')
          + '<br>그래서 설명서에만 있는 항목 — 보수·수수료, 환매수수료, 계약기간, 투자전략, '
          + '주요 투자위험, VaR, 유동성위험, 환헤지 — 이 「확인필요」로 남습니다. '
          + '명칭·운용사·위험등급·수익률·거래기준은 카탈로그에서 이미 채워져 있습니다.<br>'
          + '<b>아래에서 투자설명서 PDF 를 올리면</b> 그 자리에서 채워지고, 등록분은 상품별로 저장되어 '
          + '다음 상담에도 그대로 쓰입니다.</div>');
      } else if (d.collected) {
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
  /* ==========================================================
     상품판매 안내장 (엑셀·CSV) 읽기
     ----------------------------------------------------------
     채권은 펀드·ELS 와 달리 종목별 투자설명서가 따로 공시되지 않는다.
     대신 지점에 「상품판매 안내장」 엑셀이 내려오고, 거기에 여러 종목의
     값이 한 장에 담겨 있다. 그것을 올리면 종목마다 손으로 넣던 값이
     한 번에 채워진다.

     머리글 이름은 지점·시기마다 조금씩 다르므로 자리(열 번호)가 아니라
     머리글 낱말로 찾는다. 못 찾은 열은 담지 않아 확인필요로 남는다.
     ========================================================== */
  var NOTICE_COLS = [
    { id: 'name', re: /종목\s*명|상품\s*명|채권\s*명|종목$/ },
    { id: '_code', re: /표준\s*코드|ISIN|종목\s*코드|단축\s*코드/i },
    { id: 'kind', re: /채권\s*종류|채권\s*구분|^종류$|상품\s*종류/ },
    { id: 'issuer', re: /발행\s*(?:사|기관|회사|인|국)/ },
    { id: 'credit', re: /신용\s*등급/ },
    { id: '_risk', re: /위험\s*등급/ },
    { id: 'issueDate', re: /발행\s*일/ },
    { id: 'matDate', re: /만기\s*일|만기$/ },
    { id: 'coupon', re: /표면\s*(?:금리|이자율)|쿠폰|이표율/ },
    { id: 'payType', re: /이자\s*지급\s*(?:유형|방법|방식)|이자\s*유형/ },
    { id: 'payCycle', re: /이자\s*지급\s*주기|이자\s*주기/ },
    { id: 'payRate', re: /주기별\s*이자율/ },
    { id: 'tradePrice', re: /매매\s*단가|매도\s*단가|^단가/ },
    { id: 'ytm', re: /세후[^가-힣]{0,4}(?:투자)?\s*수익률/ },
    { id: 'mpRate', re: /민평\s*금리/ },
    { id: 'mpPrice', re: /민평\s*단가/ },
    { id: 'fee', re: /매매\s*수수료|^수수료/ },
    { id: 'minAmt', re: /최소\s*(?:매수|투자)?\s*금액|최소\s*매수/ },
    { id: 'guarantee', re: /보증/ },
    { id: 'sellable', re: /중도\s*매도/ },
    { id: 'ccy', re: /발행\s*통화|^통화/ },
    { id: 'country', re: /투자\s*대상\s*국가|^국가/ },
    { id: 'tax', re: /과세|세금/ }
  ];
  /** 머리글 줄을 찾는다 — 우리가 아는 낱말이 가장 많이 걸리는 줄 */
  function noticeHeaderRow(rows) {
    var best = -1, bestN = 0;
    rows.slice(0, 12).forEach(function (r, i) {
      var n = 0;
      (r || []).forEach(function (c) {
        if (NOTICE_COLS.some(function (d) { return d.re.test(String(c || '')); })) n++;
      });
      if (n > bestN) { bestN = n; best = i; }
    });
    return bestN >= 3 ? best : -1;
  }
  function noticeMap(header) {
    var map = {};
    (header || []).forEach(function (c, i) {
      var t = String(c || '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      for (var k = 0; k < NOTICE_COLS.length; k++) {
        var d = NOTICE_COLS[k];
        if (map[d.id] != null) continue;          /* 먼저 나온 열을 쓴다 */
        if (d.re.test(t)) { map[d.id] = i; break; }
      }
    });
    return map;
  }
  function numText(v) {
    var s = String(v == null ? '' : v).replace(/,/g, '').trim();
    return /^-?\d+(\.\d+)?$/.test(s) ? +s : null;
  }
  function dateText(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return '';
    var n = numText(s);
    if (n != null) {
      var d = PROS.excelSerialDate ? PROS.excelSerialDate(n) : null;
      if (d) return D.fmt.kdate(d) || d;
    }
    var m = /(\d{4})\D?(\d{1,2})\D?(\d{1,2})/.exec(s);
    return m ? m[1] + '년 ' + (+m[2]) + '월 ' + (+m[3]) + '일' : s;
  }
  /**
   * 안내장 한 줄 -> 상품 + 설명서 필드.
   * 값을 만들어내지 않는다 — 빈 칸은 담지 않아 확인필요로 남는다.
   */
  function noticeRow(row, map, cat) {
    var get = function (id) {
      var i = map[id];
      return i == null ? '' : String(row[i] == null ? '' : row[i]).trim();
    };
    var name = get('name');
    if (!name || /합계|소계|비고|참고/.test(name)) return null;
    var f = {};
    var put = function (k, v) { if (v != null && v !== '' && v !== '-') f[k] = v; };
    put('name', name);
    put('kind', get('kind'));
    put('issuer', get('issuer'));
    put('credit', get('credit'));
    put('issueDate', dateText(get('issueDate')));
    put('matDate', dateText(get('matDate')));
    var cp = numText(get('coupon'));
    put('coupon', cp != null ? '연 ' + cp + '%' : get('coupon'));
    put('payType', get('payType'));
    var pc = numText(get('payCycle'));
    put('payCycle', pc != null ? pc + '개월' : get('payCycle'));
    var pr = numText(get('payRate'));
    put('payRate', pr != null ? '연 ' + pr + '%' : get('payRate'));
    var tp = numText(get('tradePrice'));
    put('tradePrice', tp != null ? tp.toLocaleString() + '원' : get('tradePrice'));
    var ym = numText(get('ytm'));
    put('ytm', ym != null ? '연 ' + ym + '% (세후)' : get('ytm'));
    var mr = numText(get('mpRate'));
    put('mpRate', mr != null ? '연 ' + mr + '%' : get('mpRate'));
    var mp = numText(get('mpPrice'));
    put('mpPrice', mp != null ? mp.toLocaleString() + '원' : get('mpPrice'));
    put('fee', get('fee'));
    put('minAmt', get('minAmt'));
    put('guarantee', get('guarantee'));
    put('sellable', get('sellable'));
    put('ccy', get('ccy'));
    put('country', get('country'));
    put('tax', get('tax'));
    /* 위험등급 — 「5등급 낮은위험」 처럼 숫자와 명칭이 한 칸에 들어 있다 */
    var rk = get('_risk');
    if (rk) {
      var g = /(\d)\s*등급/.exec(rk);
      if (g) f.riskGrade = g[1];
      var lb = rk.replace(/\d\s*등급/, '').replace(/[()]/g, '').trim();
      if (lb) f.riskLabel = lb;
      else if (!g && /위험/.test(rk)) f.riskLabel = rk;
    }
    var code = get('_code');
    return {
      id: (code && /^[A-Z]{2}[\dA-Z]{10}$/.test(code) ? code : 'N' + Math.random().toString(36).slice(2, 9).toUpperCase()),
      code: code,
      name: name,
      kind: f.kind || '',
      issuer: f.issuer || '',
      riskGrade: f.riskGrade ? +f.riskGrade : null,
      riskLabel: f.riskLabel || '',
      fields: f
    };
  }
  /** 읽은 표 -> 등록할 상품 목록 */
  function noticeParse(res, cat) {
    var out = { sheets: [], rows: [], header: null, map: null, sheetName: '' };
    (res.sheets || []).forEach(function (s) {
      var hi = noticeHeaderRow(s.rows);
      if (hi < 0) return;
      var map = noticeMap(s.rows[hi]);
      if (map.name == null) return;
      var rows = [];
      s.rows.slice(hi + 1).forEach(function (r) {
        var o = noticeRow(r, map, cat);
        if (o) rows.push(o);
      });
      if (rows.length) out.sheets.push({ name: s.name, header: s.rows[hi], map: map, rows: rows });
    });
    if (out.sheets.length) {
      out.rows = out.sheets[0].rows;
      out.header = out.sheets[0].header;
      out.map = out.sheets[0].map;
      out.sheetName = out.sheets[0].name;
      /* 여러 장이면 모두 합친다 — 안내장은 통화·종류별로 장을 나누기도 한다 */
      for (var i = 1; i < out.sheets.length; i++) out.rows = out.rows.concat(out.sheets[i].rows);
    }
    return out;
  }

  /* 읽어 둔 안내장 — 저장하지 않는다 (상담마다 새 자료를 올린다) */
  var NOTICE = null;

  /** 상품판매 안내장 올리기 카드 */
  function noticeCard() {
    var sh = sheet();
    var h = [];
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 6px">상품판매 안내장 올리기 (엑셀 · CSV)</h3>');
    h.push('<div class="hint" style="margin-bottom:12px">지점에 내려오는 <b>상품판매 안내장</b>을 그대로 올리면, 안내장에 실린 <b>여러 종목</b>을 한 번에 상품 목록에 등록합니다. '
      + '머리글 이름은 자리가 아니라 <b>낱말</b>로 찾으므로 열 순서가 달라도 됩니다 — 종목명·표준코드·채권종류·발행사·신용등급·위험등급·발행일·만기일·표면금리·이자지급유형·이자지급주기·매매단가·세후수익률·민평금리·민평단가·매매수수료·최소금액·보증·중도매도'
      + (sh.cat === 'bondFx' ? '·발행통화·투자대상국가·과세' : '') + ' 를 알아봅니다. '
      + '못 찾은 열은 채우지 않아 「확인필요」로 남습니다.</div>');
    h.push('<div class="card"><div class="card-b">');
    h.push('<input type="file" id="ntFile" accept=".xlsx,.xlsm,.csv,.tsv,.txt" style="margin-bottom:8px">');
    h.push('<div class="hint">.xlsx · .csv · .tsv 를 읽습니다. 옛 형식(.xls)은 엑셀에서 「다른 이름으로 저장 → .xlsx 또는 CSV」 로 바꿔 올리십시오. 외부 네트워크 없이 동작합니다.</div>');
    h.push('<div class="hint" style="margin:12px 0 6px">엑셀을 올릴 수 없으면 표를 그대로 복사해 붙여넣으십시오 (탭·쉼표 모두 됩니다).</div>');
    h.push('<textarea id="ntText" rows="4" placeholder="안내장 표를 복사해 붙여넣으세요 (머리글 줄 포함)"></textarea>');
    h.push('<button class="tbtn primary" id="btnNtExtract" style="margin-top:8px">붙여넣은 표에서 읽기</button>');
    h.push('<div id="ntStat" class="note" style="margin:10px 0 0;display:none"></div>');

    if (NOTICE && NOTICE.rows.length) {
      var known = Object.keys(NOTICE.map || {}).filter(function (k) { return k.charAt(0) !== '_'; });
      h.push('<div class="note" style="margin:12px 0 0;border-left-color:var(--ok)"><b>읽음 — ' + esc(NOTICE.name || '') + '</b>'
        + (NOTICE.sheetName ? ' · 시트 「' + esc(NOTICE.sheetName) + '」' : '')
        + ' · 종목 ' + NOTICE.rows.length + '개 · 알아본 열 ' + (known.length + (NOTICE.map._risk != null ? 1 : 0) + (NOTICE.map._code != null ? 1 : 0)) + '개</div>');
      h.push('<div class="hint" style="margin:10px 0 6px">알아본 머리글 — ' + esc((NOTICE.header || []).filter(function (c, i) {
        return Object.keys(NOTICE.map).some(function (k) { return NOTICE.map[k] === i; });
      }).join(' · ')) + '</div>');
      /* 미리보기 — 창구가 눈으로 확인하고 등록한다 */
      h.push('<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:13px;min-width:520px">');
      h.push('<tr><th style="border:1px solid var(--line);padding:4px 7px;text-align:left">종목명</th>'
        + '<th style="border:1px solid var(--line);padding:4px 7px">위험등급</th>'
        + '<th style="border:1px solid var(--line);padding:4px 7px">표면금리</th>'
        + '<th style="border:1px solid var(--line);padding:4px 7px">만기일</th>'
        + '<th style="border:1px solid var(--line);padding:4px 7px">채운 항목</th></tr>');
      NOTICE.rows.slice(0, 12).forEach(function (r) {
        h.push('<tr><td style="border:1px solid var(--line);padding:4px 7px">' + esc(r.name) + '</td>'
          + '<td style="border:1px solid var(--line);padding:4px 7px;text-align:center">' + esc(r.riskLabel || '') + (r.riskGrade ? ' ' + r.riskGrade + '등급' : '') + '</td>'
          + '<td style="border:1px solid var(--line);padding:4px 7px;text-align:right">' + esc(r.fields.coupon || '—') + '</td>'
          + '<td style="border:1px solid var(--line);padding:4px 7px">' + esc(r.fields.matDate || '—') + '</td>'
          + '<td style="border:1px solid var(--line);padding:4px 7px;text-align:center">' + Object.keys(r.fields).length + '</td></tr>');
      });
      h.push('</table></div>');
      if (NOTICE.rows.length > 12) h.push('<div class="hint" style="margin-top:6px">… 외 ' + (NOTICE.rows.length - 12) + '개</div>');
      h.push('<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'
        + '<button class="tbtn primary" id="btnNtRegister">' + NOTICE.rows.length + '개 종목 등록</button>'
        + '<button class="tbtn" id="btnNtClear">읽은 자료 비우기</button></div>');
      h.push('<div class="hint" style="margin-top:8px">등록한 종목은 <b>직접등록</b> 상품이므로 나중에 「등록상품 삭제」로 지울 수 있습니다. 자동조회 종목은 지워지지 않습니다.</div>');
    }
    h.push('</div></div>');
    return h.join('');
  }

  /** 읽은 안내장을 상품 목록에 등록한다 */
  function noticeRegister() {
    if (!NOTICE || !NOTICE.rows.length) return;
    var cat = sheet().cat;
    CUSTOM[cat] = CUSTOM[cat] || [];
    if (!DOCS[cat]) DOCS[cat] = {};
    var added = 0, replaced = 0;
    NOTICE.rows.forEach(function (r) {
      var p = {
        id: r.id, name: r.name, custom: true, sample: false,
        kind: r.kind, issuer: r.issuer,
        riskGrade: r.riskGrade, riskLabel: r.riskLabel,
        fromNotice: true
      };
      var was = CUSTOM[cat].some(function (x) { return x.id === p.id; });
      CUSTOM[cat] = CUSTOM[cat].filter(function (x) { return x.id !== p.id; });
      CUSTOM[cat].unshift(p);
      if (was) replaced++; else added++;
      DOCS[cat][p.id] = {
        source: 'NOTICE',
        docName: (NOTICE.name || '상품판매 안내장') + ' — ' + r.name,
        docUrl: '',
        registeredAt: new Date().toISOString(),
        fields: r.fields, schedule: [], matBarrier: null, knockIn: '', rawText: '',
        notice: true
      };
    });
    saveCustom(); saveDocs();
    ST.productId = NOTICE.rows[0].id;
    var n = NOTICE.rows.length;
    NOTICE = null;
    save(); renderAll();
    alert('안내장에서 ' + n + '개 종목을 등록했습니다.\n(새로 추가 ' + added + '개 · 기존 갱신 ' + replaced + '개)\n\n상품 선택 목록 맨 위에서 고르십시오.');
  }

  /**
   * 투자자 유형 및 금융투자상품 위험도 분류표 — 사내 배포본을 그대로 보여 준다.
   * 창구가 「위험등급의 의미」 「분류 근거」 를 말할 때 근거로 삼는 표다.
   * 지금 고른 상품군·등급 칸을 짚어 준다.
   */
  function riskTableCard() {
    var sh = sheet();
    var g = numOf(valueOf('riskGrade'));
    var prof = ST.ctx.custProfile;
    var h = [];
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 6px">투자자 유형 및 금융투자상품 위험도 분류표</h3>');
    h.push('<div class="hint" style="margin-bottom:12px">출처 <b>' + esc(RISK_TABLE.source) + '</b>. '
      + '「위험등급의 의미·유의사항」 과 「위험등급 분류 근거」 를 이 표에서 채웁니다 — 등급별 유의사항 <b>원문</b>이 '
      + '핵심(요약)설명서에 있으면 아래 「전 상품 공용 문구」 에 등록하십시오. 그것이 우선합니다.</div>');
    h.push('<div class="card"><div class="card-b" style="overflow-x:auto">');
    h.push('<table style="border-collapse:collapse;font-size:12.5px;min-width:820px">');
    h.push('<tr><th style="border:1px solid var(--line);padding:4px 7px;text-align:left;background:var(--gray-hl)">상품위험 구분</th>');
    RISK_TABLE.grades.forEach(function (x) {
      var on = (g === x.n);
      h.push('<th style="border:1px solid var(--line);padding:4px 7px;background:'
        + (on ? 'var(--orange-lt,#fff3e0)' : 'var(--gray-hl)') + '">' + x.label + '<br>(' + x.n + '등급)</th>');
    });
    h.push('</tr>');
    RISK_TABLE.rows.forEach(function (r) {
      var mine = (r.cats || []).indexOf(sh.cat) >= 0;
      var bg = mine ? 'background:#eef6ff' : '';
      h.push('<tr><td style="border:1px solid var(--line);padding:4px 7px;font-weight:' + (mine ? '700' : '400') + ';' + bg + '">'
        + esc(r.key) + (r.note ? '<sup>주' + r.note + ')</sup>' : '') + (mine ? ' ◀' : '') + '</td>');
      if (r.span) {
        h.push('<td colspan="6" style="border:1px solid var(--line);padding:4px 7px;text-align:center;' + bg + '">' + esc(r.span) + '</td>');
      } else {
        RISK_TABLE.grades.forEach(function (x) {
          var c = (r.cells || {})[x.n] || '';
          var hit = mine && g === x.n && c;
          h.push('<td style="border:1px solid var(--line);padding:4px 7px;'
            + (hit ? 'background:#fff3e0;font-weight:700;' : bg) + '">' + esc(c) + '</td>');
        });
      }
      h.push('</tr>');
    });
    /* 맨 아랫줄 — 투자자구분 */
    h.push('<tr><td style="border:1px solid var(--line);padding:4px 7px;font-weight:700;background:var(--gray-hl)">투자자구분</td>');
    RISK_TABLE.grades.forEach(function (x) {
      var owner = RISK_TABLE.profiles.filter(function (pp) { return pp.grades[0] === x.n; })
        .map(function (pp) { return pp.name; }).join(' / ');
      var canBuy = prof ? (profileGrades(prof) || []).indexOf(x.n) >= 0 : false;
      h.push('<td style="border:1px solid var(--line);padding:4px 7px;text-align:center;'
        + (canBuy ? 'background:#f3f9f4;' : '') + '">' + esc(owner) + '</td>');
    });
    h.push('</tr></table>');
    h.push('<div class="hint" style="margin-top:8px">파란 줄 ◀ 이 지금 평가표의 상품군, 주황 칸이 지금 상품의 등급입니다.'
      + (prof ? ' 초록 칸은 <b>' + esc(prof) + '</b> 성향이 가입할 수 있는 등급입니다.' : ' 투자자성향을 고르면 가입 가능 등급도 함께 표시합니다.') + '</div>');
    h.push('<div class="hint">투자자구분 줄은 각 성향이 가입할 수 있는 <b>가장 위험한</b> 등급에 이름을 적은 것입니다 — '
      + RISK_TABLE.profiles.map(function (pp) { return esc(pp.name) + ' → ' + pp.grades.join('·') + '등급'; }).join(' · ') + '.</div>');

    /* 외화채권 — 환헤지 미실시 상향을 계산해 보여 준다 (공통사항 ①) */
    if (sh.cat === 'bondFx') {
      var pfx = product();
      var fg = pfx && pfx.fxType ? fxRiskGrade(pfx.fxType.credit, pfx.fxType.ccy) : null;
      if (fg) {
        h.push('<div class="note" style="margin-top:12px;border-left-color:var(--ok)"><b>이 유형의 위험등급 계산</b><br>'
          + esc(fg.why) + '<br><span style="color:var(--muted2)">공통사항 ① — 외화상품은 환헤지가 되지 않으면 위험도 단계를 상향합니다. '
          + '외화채권은 예외(외화 RP·외화 발행어음)가 아니고, 회사 설명 문구도 「환위험을 감소시키기 위한 환헤지거래는 수행하지 않습니다」 라고 적고 있습니다.</span></div>');
      } else if (pfx && pfx.fxType) {
        h.push('<div class="note" style="margin-top:12px"><b>이 유형은 위험등급을 계산할 수 없습니다</b> — '
          + '국제신용등급이 「' + esc(pfx.fxType.credit || '—') + '」 여서 분류표의 등급 구간에 맞출 수 없습니다. '
          + '종목 설명서의 신용등급을 확인해 「필수입력」 탭에서 등급을 넣으십시오.</div>');
      }
    }

    /* 공통사항 */
    h.push('<div class="rule" style="margin:16px 0 10px"></div><b>공통사항</b>');
    h.push('<ul style="margin:6px 0 0;padding-left:20px;line-height:1.7">');
    RISK_TABLE.common.forEach(function (x) { h.push('<li>' + esc(x) + '</li>'); });
    h.push('</ul>');

    /* 주석사항 — 지금 상품군에 걸린 것을 먼저 보여 준다 */
    var mineNotes = RISK_TABLE.rows.filter(function (r) { return (r.cats || []).indexOf(sh.cat) >= 0 && r.note; })
      .map(function (r) { return r.note; });
    var uniq = [];
    mineNotes.forEach(function (n) { if (uniq.indexOf(n) < 0) uniq.push(n); });
    if (uniq.length) {
      h.push('<div class="rule" style="margin:16px 0 10px"></div><b>이 상품군에 걸린 주석</b>');
      h.push('<ul style="margin:6px 0 0;padding-left:20px;line-height:1.7">');
      uniq.forEach(function (n) { h.push('<li><b>주' + n + ')</b> ' + esc(RISK_TABLE.notes[n]) + '</li>'); });
      h.push('</ul>');
    }
    h.push('<div class="rule" style="margin:16px 0 10px"></div>'
      + '<details><summary style="cursor:pointer;font-weight:700">주석사항 전체 (' + Object.keys(RISK_TABLE.notes).length + '개)</summary>'
      + '<ul style="margin:8px 0 0;padding-left:20px;line-height:1.7">'
      + Object.keys(RISK_TABLE.notes).map(function (n) {
        return '<li><b>주' + n + ')</b> ' + esc(RISK_TABLE.notes[n]) + '</li>';
      }).join('') + '</ul></details>');
    h.push('</div></div>');
    return h.join('');
  }

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

    /* 홈페이지 채권 설명 화면(p02)의 「금융상품 위험도 분류표」는 화면에 띄우지
       않는다 — 「1등급(초고위험)~5등급(초저위험)」 5단계 옛 판이라, 6단계를 쓰는
       사내 배포본과 등급 번호가 어긋난다. 위 riskTableCard() 가 사내 배포본
       (2025.11.24)을 그대로 보여 준다. 수집분은 카탈로그에 남겨 둔다. */
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
    /* 등록 상태를 맨 위에 크게 적는다 — 등록해 두면 새 달 자료를 올릴 때까지
       모든 펀드에 계속 쓰인다는 것을 화면에서 알 수 있어야 한다. */
    if (MKT.mktAsOf || MKT.mktView || MKT.docName) {
      h.push('<div class="banner" style="margin:0 0 12px;border-color:var(--' + (fresh === false ? 'warn' : 'ok')
        + ');border-left-color:var(--' + (fresh === false ? 'warn' : 'ok') + ')'
        + (fresh === false ? '' : ';background:#f3f9f4') + '">'
        + '<b style="color:var(--' + (fresh === false ? 'warn' : 'ok') + ')">등록됨 — 모든 펀드에 계속 쓰입니다</b><br>'
        + esc(MKT.docName || '(파일명 없음)')
        + (MKT.mktAsOf ? ' · 기준 <b>' + esc(MKT.mktAsOf) + '</b>' : '')
        + (MKT.registeredAt ? ' · 등록 ' + esc(String(MKT.registeredAt).slice(0, 10)) : '')
        + (MKT.rows && MKT.rows.length ? ' · 상품표 ' + MKT.rows.length + '개' : '')
        + (MKT.outlook && MKT.outlook.length ? ' · 시황 ' + MKT.outlook.length + '단락' : '')
        + '<br><span style="color:var(--muted2)">다음 달 자료를 올려 다시 등록할 때까지 이 자료를 씁니다. 지금 다시 올릴 필요가 없습니다.</span>'
        + (fresh === false ? '<br><b style="color:var(--warn)">직전월 이후 자료가 아닙니다 — 이대로 쓰면 최신자료로 인정되지 않습니다. 이번 달 자료를 올리십시오.</b>' : '')
        + '</div>');
    } else {
      h.push('<div class="banner"><b>아직 등록된 자료가 없습니다</b><br>'
        + '아래에서 이번 달 완전판매자료를 <b>한 번</b> 올리면 등록되어, 다음 달 자료를 올릴 때까지 '
        + '<b>모든 펀드</b>의 「증시 현황 및 전망 설명」 항목에 계속 쓰입니다.</div>');
    }
    if (!PROS.pdfAvailable()) {
      h.push('<div class="warnbox">PDF 판독 모듈을 불러오지 못했습니다. 아래 붙여넣기를 사용하십시오.</div>');
    } else {
      h.push('<input type="file" id="mktFile" accept="application/pdf,.pdf,.xlsx,.xlsm,.csv,.tsv,.txt" style="margin-bottom:10px">');
      h.push('<div class="hint">완전판매자료·증시전망 보고서를 올리면 기준월·전망 요약·업종·상품표를 읽어 옵니다. '
        + '<b>PDF · 엑셀(.xlsx) · CSV</b> 를 받습니다 — 지점에 엑셀로 내려오는 자료도 그대로 올리십시오. 외부 네트워크 없이 동작합니다.</div>');
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
      h.push('<div class="drop" id="pdfDrop">');
      h.push('<input type="file" id="pdfFile" accept="application/pdf" style="margin-bottom:10px">');
      h.push('<div class="hint">투자설명서 · 간이투자설명서 · 핵심(요약)설명서 PDF를 올리면 항목과 차수별 상환표를 자동 추출합니다. 외부 네트워크 없이 동작합니다.</div>');
      h.push('<div class="dropmsg">이 상자 <b>어디에나</b> PDF 파일을 끌어다 놓아도 됩니다.</div>');
      h.push('</div>');
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
      + '<div class="hint" style="margin-top:8px">등록된 설명서 내용과 차수별 표까지 함께 담깁니다. 같은 상품을 여러 지점에서 쓸 때 한 번만 등록해 공유하면 됩니다.</div>'
      + '<div class="rule" style="margin:14px 0 10px"></div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '<button class="tbtn" id="btnExportBundle">지점 설정 내보내기</button>'
      + '<button class="tbtn" id="btnImportBundle">지점 설정 가져오기</button></div>'
      + '<div class="hint" style="margin-top:8px">등록해 둔 <b>증시전망 자료 · 전 상품 공용 문구 · 직접등록 상품 · 등록 설명서 · 상담 조건</b>을 '
      + '한 파일로 담습니다. 이 파일들은 <b>브라우저에 저장</b>되어 파일 이름·폴더가 바뀌어도 남지만, '
      + '<b>다른 PC·다른 브라우저·시크릿창</b>에서는 없습니다. 그때 이 파일로 한 번에 되살리십시오.</div></div></div>');

    /* 펀드 완전판매자료 (증시전망) — 펀드·IRP 에서만 쓴다 */
    if (sh.cat === 'fund' || sh.cat === 'irp') h.push(marketCard());

    /* 채권 — 회사 장외채권 화면의 유의사항 원문 */
    /* 채권 — 상품판매 안내장 올리기 + 회사 원문 */
    if (sh.cat === 'bondKrw' || sh.cat === 'bondFx') {
      h.push(noticeCard());
      h.push(bondNoticeCard());
    }

    /* 위험도 분류표 — 상품군을 가리지 않고 쓰인다 (등급의 의미·분류 근거의 출처) */
    h.push(riskTableCard());

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
        if (!lineOn(s)) return;
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
        refreshResetBox();
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
        refreshResetBox();
      };
    });
    /* 확인필요 · 값 클릭 → 인라인 입력 */
    Array.prototype.forEach.call(document.querySelectorAll('.v'), function (s) {
      s.onclick = function () {
        var kind = s.dataset.kind, key = s.dataset.key;
        var cur = kind === 'field' ? (valueOf(key) || '') : (ST.inline[key] || '');
        var label = kind === 'field' ? labelOf(key) : key;
        /* 고객 항목(투자자성향·현재 투자자금성향 등)은 투자설명서에 없는 값이다 —
           「설명서 원문 값을 입력하라」 고 안내하면 창구가 설명서를 뒤지게 된다. */
        var where = (kind === 'field' && isCtxField(key))
          ? '상담 중 고객에게 확인해 적는 값입니다 (투자설명서에는 없습니다).'
          : '투자설명서 원문 값을 입력하세요.';
        var v = prompt('[' + label + ']\n' + where, cur);
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

    /** 파일 하나를 판독한다 — 파일 선택과 끌어다 놓기가 같은 길을 탄다 */
    function readPdfFile(file) {
        if (!file) return;
        if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
          var bad = $('#pdfStat');
          if (bad) {
            bad.style.display = '';
            bad.className = 'warnbox';
            bad.textContent = 'PDF 파일이 아닙니다 (' + file.name + ') — ② 텍스트 붙여넣기를 쓰십시오.';
          }
          return;
        }
        var stat = $('#pdfStat');
        stat.className = 'note';
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
    }

    var fi = $('#pdfFile');
    if (fi) fi.onchange = function () { readPdfFile(fi.files && fi.files[0]); };

    /* 블록 전체를 받는 자리로 만든다 — 작은 파일 칸에만 떨어뜨릴 수 있으면
       넓은 설명 문구 위에 놓는 사람은 「업로드가 안 된다」 고 여긴다. */
    var pdrop = $('#pdfDrop');
    if (pdrop) {
      var over = function (on) { return function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        pdrop.classList.toggle('over', on);
      }; };
      pdrop.addEventListener('dragenter', over(true));
      pdrop.addEventListener('dragover', over(true));
      pdrop.addEventListener('dragleave', over(false));
      pdrop.addEventListener('drop', function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        pdrop.classList.remove('over');
        var dt = ev.dataTransfer;
        readPdfFile(dt && dt.files && dt.files[0]);
      });
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
      /**
       * 판독이 되면 곧바로 등록한다.
       * 앞 판은 「올리기」 와 「이 자료로 등록」 이 두 단계여서, 올리고도 등록을
       * 안 누른 채 상담에 들어가면 증시전망 항목이 전부 확인필요로 남았다.
       * 담당자가 실제로 그 함정에 빠졌다. 판독이 된 경우에만 자동 등록하고
       * (판독 실패분을 등록해 두면 더 헷갈린다), 「등록 해제」 로 되돌린다.
       */
      if (r.asOf || r.outlook.length || r.rows.length) {
        Object.keys(map).forEach(function (k) { if (!MKT[k]) MKT[k] = map[k]; });
        if (r.outlook.length && !MKT.mktView) {
          /* 요약을 비워 두면 펀드에 맞는 단락을 자동으로 고른다 — 그대로 둔다 */
        }
        MKT.docName = name;
        MKT.registeredAt = new Date().toISOString();
        MKT.rows = r.rows;
        MKT.outlook = r.outlook;
        saveMkt();
      }
      renderAll();
    }
    var mf = $('#mktFile');
    if (mf) {
      mf.onchange = function () {
        var file = mf.files && mf.files[0];
        if (!file) return;
        var stat = $('#mktStat');
        stat.style.display = '';
        stat.className = 'note';
        stat.textContent = '자료 판독 중… (' + file.name + ')';
        /* 완전판매자료가 엑셀·CSV 로 내려오는 지점도 있다 — 표를 줄글로 펴서
           같은 판독 규칙에 넣는다. PDF 는 그대로 판독한다. */
        if (/\.(xlsx|xlsm|csv|tsv|txt)$/i.test(file.name || '')) {
          PROS.readTable(file, function (err, res) {
            if (err) {
              stat.className = 'warnbox';
              stat.textContent = '자료 읽기 실패 (' + file.name + ') : ' + err.message
                + ' — 아래 붙여넣기 칸을 사용하십시오.';
              return;
            }
            var lines = [];
            (res.sheets || []).forEach(function (s) {
              lines.push(s.name);
              (s.rows || []).forEach(function (r) { lines.push(r.join('\t')); });
            });
            mktRead(lines.join('\n'), file.name, 0);
          });
          return;
        }
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

    /* ── 상품판매 안내장 (채권) ── */
    function ntShow(err, res, name) {
      var stat = $('#ntStat');
      if (stat) { stat.style.display = ''; stat.className = 'note'; }
      if (err) {
        if (stat) { stat.className = 'warnbox'; stat.textContent = '안내장 읽기 실패 : ' + err.message; }
        return;
      }
      var p = noticeParse(res, sheet().cat);
      if (!p.rows.length) {
        if (stat) {
          stat.className = 'warnbox';
          stat.textContent = '표는 읽었지만 종목 줄을 찾지 못했습니다. 머리글 줄(종목명·발행일·만기일 등)이 들어 있는지 확인하십시오.'
            + ' 읽은 시트 ' + ((res.sheets || []).length) + '개.';
        }
        return;
      }
      p.name = name;
      NOTICE = p;
      renderAll();
    }
    var ntf = $('#ntFile');
    if (ntf) {
      ntf.onchange = function () {
        var file = ntf.files && ntf.files[0];
        if (!file) return;
        var stat = $('#ntStat');
        if (stat) { stat.style.display = ''; stat.className = 'note'; stat.textContent = '안내장 읽는 중… (' + file.name + ')'; }
        PROS.readTable(file, function (err, res) { ntShow(err, res, file.name); });
      };
    }
    var nte = $('#btnNtExtract');
    if (nte) {
      nte.onclick = function () {
        var t = ($('#ntText') || {}).value || '';
        if (t.trim().length < 20) { alert('안내장 표를 붙여넣은 뒤 눌러 주십시오.'); return; }
        var rows = PROS.tableRowsFromText(t);
        ntShow(null, { kind: 'paste', sheets: [{ name: '붙여넣은 표', rows: rows }] }, '붙여넣은 표');
      };
    }
    var ntr = $('#btnNtRegister');
    if (ntr) ntr.onclick = noticeRegister;
    var ntc = $('#btnNtClear');
    if (ntc) ntc.onclick = function () { NOTICE = null; renderAll(); };
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
    var eb = $('#btnExportBundle');
    if (eb) eb.onclick = exportBundle;
    var ib = $('#btnImportBundle');
    if (ib) ib.onclick = importBundle;
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

  /**
   * 지점 설정 내보내기 / 가져오기.
   *
   * 등록해 둔 것들(증시전망 자료 · 전 상품 공용 문구 · 직접등록 상품 · 등록한
   * 설명서)은 이 브라우저에 저장된다. 파일 이름이나 폴더가 바뀌어도 남지만,
   * 다른 PC·다른 브라우저·시크릿창에서는 없다. 그때 처음부터 다시 만들지
   * 않도록 한 파일로 내보내고 가져온다.
   */
  function bundleOut() {
    return {
      _type: 'ss-branch-settings',
      _at: new Date().toISOString(),
      market: MKT,          /* 완전판매자료 (증시전망) */
      common: COMMON,       /* 전 상품 공용 문구 */
      custom: CUSTOM,       /* 직접등록·안내장 상품 */
      docs: DOCS,           /* 상품별로 등록한 설명서 */
      ctx: ST.ctx           /* 상담 조건 (성향·자금성향 등) */
    };
  }
  function exportBundle() {
    var o = bundleOut();
    var blob = new Blob([JSON.stringify(o, null, 1)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    /* 파일 이름은 아스키로 — 「가져오기」 가 .json 만 걸러 보여 주므로 확장자가 붙어야 한다.
       띄우지 않고 클릭하면 브라우저가 이름을 무시하는 경우가 있어 붙였다 뗀다. */
    a.download = 'ss-branch-settings-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function importBundle() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var o;
        try { o = JSON.parse(fr.result); } catch (e) { alert('JSON 형식이 올바르지 않습니다.'); return; }
        if (o._type !== 'ss-branch-settings') { alert('지점 설정 파일이 아닙니다.'); return; }
        if (!confirm('지점 설정을 가져옵니다.\n\n지금 이 브라우저에 등록된 증시전망 자료·공용 문구·직접등록 상품이 '
          + '가져온 값으로 바뀝니다. 계속하시겠습니까?')) return;
        var got = [];
        if (o.market) { MKT = o.market; saveMkt(); got.push('증시전망 자료'); }
        if (o.common) { Object.keys(o.common).forEach(function (k) { COMMON[k] = o.common[k]; }); saveCommon(); got.push('공용 문구'); }
        if (o.custom) {
          Object.keys(o.custom).forEach(function (k) { if (Array.isArray(o.custom[k])) CUSTOM[k] = o.custom[k]; });
          saveCustom();
          got.push('직접등록 상품 ' + Object.keys(CUSTOM).reduce(function (a, k) { return a + CUSTOM[k].length; }, 0) + '개');
        }
        if (o.docs) { DOCS = o.docs; saveDocs(); got.push('등록 설명서'); }
        if (o.ctx) { Object.keys(o.ctx).forEach(function (k) { ST.ctx[k] = o.ctx[k]; }); }
        save(); renderAll();
        alert('가져왔습니다 — ' + got.join(' · '));
      };
      fr.readAsText(f);
    };
    inp.click();
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
    /* 카드 접기·인라인 입력에서 부른다 — 파트를 좁혀 보고 있어도 찾을 수 있어야 한다 */
    var l = itemsAll();
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
      if (!lineOn(s)) return;
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
    if (miss.length) {
      var g2 = { doc: 0, ref: 0, once: 0, ask: 0, rec: 0 };
      miss.forEach(function (m) { var k = missGroup(m); if (g2[k] != null) g2[k]++; else g2.doc++; });
      var self2 = g2.doc + g2.ref + g2.once + g2.rec;
      var msg = self2 === 0
        ? '[' + PARTS[partKey()].label + '] 남은 ' + miss.length + '건은 모두 <상담 중 고객에게 확인하며 채우는 값>입니다.\n'
          + '상품 자료에서 채울 값은 없습니다.\n\n진행하시겠습니까?'
        : '[' + PARTS[partKey()].label + '] 확인필요 ' + miss.length + '건 — 그중 ' + self2
          + '건은 미리 채울 수 있는 값입니다.\n그대로 읽으면 부정확한 설명으로 감점될 수 있습니다.\n\n계속 진행하시겠습니까?';
      if (!confirm(msg)) return;
    }
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
    applyElsDefaults();
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
