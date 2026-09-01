/**
 * 완전판매 스크립트 자동완성 시스템 — 앱 로직
 *
 * 동작 흐름
 *   ① 평가표(상품군 · 시나리오) 선택
 *   ② 상품 선택 → 해당 상품의 투자설명서 항목이 자동 조회되어 vals 에 주입
 *   ③ 상담 조건(투자자성향 · 현재 투자자금성향 · 고령/신규/유의상품 등) 입력
 *   ④ 평가표 순서대로 스크립트 자동 완성 — 자동 조회로 못 채운 값은 빨간 '확인필요'
 *   ⑤ 읽기 모드로 항목별로 읽으며 Check Point 체크 → 예상 점수 실시간 산출
 */
(function () {
  'use strict';

  var D = window.SS_DATA, SHEETS = window.SS_SHEETS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var LS = 'ss_state_v1';

  /* ---------------- 상태 ---------------- */
  var ST = {
    sheet: 'fundFit',
    productId: null,
    manual: {},   /* fieldId -> 사용자가 입력/수정한 값 */
    inline: {},   /* «라벨» -> 사용자가 입력한 값 */
    checks: {},   /* 'sheet|itemId' -> [bool,...] */
    tab: 'script',
    ctx: {
      consumerType: '일반금융소비자',
      custProfile: '',
      custProfileMeaning: '',
      cashPurpose: '', cashPrincipal: '', cashLoss: '', cashHorizon: '',
      elderly: false, newInvestor: false, watch: false
    },
    timer: { running: false, base: 0, acc: 0 }
  };

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
        sheet: ST.sheet, productId: ST.productId, manual: ST.manual,
        inline: ST.inline, checks: ST.checks, ctx: ST.ctx
      }));
    } catch (e) { /* 사생활 보호 모드 등에서 저장 실패 — 무시 */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o.sheet && SHEETS[o.sheet]) ST.sheet = o.sheet;
      if (o.productId) ST.productId = o.productId;
      ['manual', 'inline', 'checks'].forEach(function (k) { if (o[k]) ST[k] = o[k]; });
      if (o.ctx) Object.keys(o.ctx).forEach(function (k) { ST.ctx[k] = o.ctx[k]; });
    } catch (e) { /* 손상된 저장값 — 초기값 사용 */ }
  }

  /* ---------------- 유틸 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function sheet() { return SHEETS[ST.sheet]; }
  /**
   * 평가표에 맞는 상품만 노출한다.
   * 펀드 평가표는 국내/해외가 별도 표(해외는 투자위험이 일반+해외로 분리)이므로
   * 해외투자 펀드는 해외 평가표에서만, 국내 펀드는 국내 평가표에서만 선택되게 한다.
   */
  function catalog() {
    var sh = sheet(), list = D.catalog[sh.cat] || [];
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

  function rawValue(id) {
    if (Object.prototype.hasOwnProperty.call(ST.manual, id) && ST.manual[id] !== '') return ST.manual[id];
    if (Object.prototype.hasOwnProperty.call(ST.ctx, id)) {
      var c = ST.ctx[id];
      return (c === '' || c == null) ? null : c;
    }
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
        if (ctx.elderly) r.push('고령투자자');
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
      default:
        return undefined;
    }
  }

  function valueOf(id) {
    var d = derived(id);
    if (d !== undefined) {
      /* 파생값도 사용자가 덮어쓸 수 있게 한다 */
      if (Object.prototype.hasOwnProperty.call(ST.manual, id) && ST.manual[id] !== '') return ST.manual[id];
      return d === '' ? '' : d;
    }
    return rawValue(id);
  }

  function labelOf(id) {
    var defs = fieldDefs();
    for (var i = 0; i < defs.length; i++) if (defs[i].id === id) return defs[i].label;
    return { consumerType: '일반/전문금융소비자', recordReason: '녹취 대상 사유', unfitRecordAdd: '부적합 문구', docLabel: '설명서 명칭', docExtra: '추가 설명자료', tradeLabel: '거래 유형' }[id] || id;
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
  function applicable(item) {
    var sh = sheet(), p = product(), ctx = ST.ctx;
    switch (item.only) {
      case 'elderly': return !!ctx.elderly;
      case 'overseas': return !!(sh.overseas || (p && p.overseas));
      case 'suitReport': return !!(ctx.elderly || ctx.newInvestor);
      case 'watch': return !!ctx.watch;
      default: return true;
    }
  }
  function ckey(item) { return ST.sheet + '|' + item.id; }
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

    h.push('<div class="fgroup"><div class="flabel"><span class="req">1</span> 평가표 선택</div>');
    h.push('<select id="selSheet">');
    Object.keys(SHEETS).forEach(function (k) {
      h.push('<option value="' + k + '"' + (k === ST.sheet ? ' selected' : '') + '>' + esc(SHEETS[k].label) + '</option>');
    });
    h.push('</select><div class="hint">' + esc(sh.note) + '</div></div>');

    /* 상품 선택 */
    h.push('<div class="fgroup"><div class="flabel"><span class="req">2</span> 상품 선택 <span style="font-weight:400;color:var(--muted2)">(투자설명서 자동조회)</span></div>');
    h.push('<input type="text" id="pq" placeholder="상품명 · 코드 · 기초자산 검색" value="">');
    h.push('<select id="selProduct" size="8" style="margin-top:6px"></select>');
    if (sh.cat === 'els') {
      var live = D.elsSource === 'live';
      h.push('<div class="hint">ELS/DLS 목록 <span class="badge ' + (live ? 'live' : 'sample') + '">' + (live ? '자동수집' : '내장 시드') + '</span> · ' + catalog().length + '건'
        + (D.elsMeta && D.elsMeta.updatedAt ? '<br>기준 ' + esc(String(D.elsMeta.updatedAt).slice(0, 10)) : '') + '</div>');
    } else {
      h.push('<div class="hint">내장 데이터는 <b>예시</b>입니다. 상담 전 투자설명서 원문 값으로 교체하세요.</div>');
    }
    h.push('</div>');

    /* 상담 조건 */
    h.push('<div class="rule"></div><div class="flabel" style="margin-bottom:12px"><span class="req">3</span> 상담 조건</div>');

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
    [['elderly', '고령투자자 (만 65세 이상)'], ['newInvestor', '신규투자자'], ['watch', '투자권유 유의상품 해당']].forEach(function (pair) {
      h.push('<label class="chk"><input type="checkbox" class="ctxChk" data-k="' + pair[0] + '"' + (ctx[pair[0]] ? ' checked' : '') + '><span>' + pair[1] + '</span></label>');
    });
    h.push('<div class="hint">체크에 따라 고령투자자 전담창구·적합성보고서·유의상품 사전확인 항목이 평가에 포함됩니다.</div></div>');

    h.push('<div class="rule"></div>');
    h.push('<button class="tbtn" id="btnResetChecks" style="width:100%;margin-bottom:8px">체크 초기화</button>');
    h.push('<button class="tbtn" id="btnResetAll" style="width:100%">전체 초기화</button>');
    h.push('<div class="sidenote">이 화면의 스크립트는 <b>미스터리쇼핑 평가표</b>를 코드화한 것입니다. 숫자·일자·요율 등은 반드시 <b>해당 상품의 투자설명서 원문</b>과 대조하십시오. 부정확한 설명은 부당권유행위(최대 −18점)로 감점됩니다.</div>');

    $('#side').innerHTML = h.join('');
    fillProducts('');
    bindSide();
  }

  function fillProducts(q) {
    var sel = $('#selProduct');
    if (!sel) return;
    q = (q || '').trim().toLowerCase();
    var list = catalog().filter(function (p) {
      if (!q) return true;
      return [p.name, p.id, p.issuer, p.mgr, p.under, p.kind, p.credit].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    sel.innerHTML = list.map(function (p) {
      var tail = p.riskGrade ? ' · ' + p.riskGrade + '등급' : '';
      return '<option value="' + esc(p.id) + '"' + (p.id === ST.productId ? ' selected' : '') + '>' + esc(p.name) + tail + '</option>';
    }).join('') || '<option disabled>검색 결과 없음</option>';
  }

  function bindSide() {
    $('#selSheet').onchange = function () {
      ST.sheet = this.value;
      var l = catalog();
      if (!l.some(function (p) { return p.id === ST.productId; })) ST.productId = l.length ? l[0].id : null;
      save(); renderAll();
    };
    $('#pq').oninput = function () { fillProducts(this.value); };
    $('#selProduct').onchange = function () { ST.productId = this.value; save(); renderAll(); };
    $('#selProfile').onchange = function () {
      ST.ctx.custProfile = this.value;
      if (this.value && !ST.manual.custProfileMeaning) ST.ctx.custProfileMeaning = PROFILES[this.value] || '';
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
      Object.keys(ST.checks).forEach(function (k) { if (k.indexOf(ST.sheet + '|') === 0) delete ST.checks[k]; });
      save(); renderAll();
    };
    $('#btnResetAll').onclick = function () {
      if (!confirm('입력값 · 체크 · 확인필요 값을 모두 초기화합니다. 계속하시겠습니까?')) return;
      ST.manual = {}; ST.inline = {}; ST.checks = {};
      ST.ctx = { consumerType: '일반금융소비자', custProfile: '', custProfileMeaning: '', cashPurpose: '', cashPrincipal: '', cashLoss: '', cashHorizon: '', elderly: false, newInvestor: false, watch: false };
      save(); renderAll();
    };
  }

  /* ============================================================
     탭
     ============================================================ */
  function renderTabs() {
    var t = totals(), miss = missing();
    var defs = [
      ['script', '스크립트', itemsOf().length + '항목'],
      ['pros', '투자설명서 자동조회', miss.length ? miss.length + '건 확인필요' : '완료'],
      ['check', '체크리스트 · 셀프채점', t.done + '/' + t.all],
      ['rule', '평가기준 요약', '']
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
    else if (ST.tab === 'pros') v.innerHTML = viewProspectus();
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

  /* ---------------- 투자설명서 자동조회 ---------------- */
  function viewProspectus() {
    var p = product(), defs = fieldDefs(), miss = missing();
    var groups = {};
    defs.forEach(function (f) {
      if (f.ov && !(sheet().overseas || p.overseas)) return;
      (groups[f.group] = groups[f.group] || []).push(f);
    });
    var h = [headBanner()];
    h.push('<div class="banner blue"><b>자동조회 결과</b> — 상품 선택 시 아래 값이 자동으로 채워지고 스크립트에 주입됩니다. '
      + '<span class="src auto">자동</span> 은 상품 데이터에서 조회된 값, <span class="src man">입력</span> 은 담당자가 채운 값, <span class="src no">미확인</span> 은 투자설명서에서 채워야 하는 값입니다.</div>');

    Object.keys(groups).forEach(function (g) {
      h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;color:var(--ink);margin:0 0 12px">' + esc(g) + '</h3><div class="pgrid">');
      groups[g].forEach(function (f) {
        var v = valueOf(f.id);
        var manual = Object.prototype.hasOwnProperty.call(ST.manual, f.id) && ST.manual[f.id] !== '';
        var state = (v == null || v === '') ? 'no' : (manual ? 'man' : 'auto');
        h.push('<div class="pf' + (state === 'no' ? ' miss' : '') + '">');
        h.push('<div class="k"><span>' + esc(f.label) + (f.req ? ' <span style="color:var(--orange)">*</span>' : '') + '</span><span class="src ' + state + '">' + (state === 'no' ? '미확인' : (state === 'man' ? '입력' : '자동')) + '</span></div>');
        h.push('<input type="text" class="fInp" data-k="' + esc(f.id) + '" value="' + esc(v == null ? '' : v) + '" placeholder="투자설명서에서 확인 후 입력">');
        if (f.hint) h.push('<div class="h">' + esc(f.hint) + '</div>');
        h.push('</div>');
      });
      h.push('</div>');
    });

    var inlines = miss.filter(function (m) { return m.kind === 'inline'; });
    var allInline = collectInlineLabels();
    h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;color:var(--ink);margin:0 0 6px">투자설명서 원문 직접 입력 항목</h3>');
    h.push('<div class="hint" style="margin-bottom:12px">자동 조회로 확정할 수 없어 반드시 투자설명서 원문에서 옮겨 적어야 하는 값입니다. (미입력 ' + inlines.length + ' / 전체 ' + allInline.length + ')</div>');
    h.push('<div class="pgrid">');
    allInline.forEach(function (lb) {
      var v = ST.inline[lb];
      var empty = (v == null || v === '');
      h.push('<div class="pf' + (empty ? ' miss' : '') + '"><div class="k"><span>' + esc(lb) + '</span><span class="src ' + (empty ? 'no' : 'man') + '">' + (empty ? '미확인' : '입력') + '</span></div>');
      h.push('<input type="text" class="iInp" data-k="' + esc(lb) + '" value="' + esc(v == null ? '' : v) + '" placeholder="투자설명서 원문 값"></div>');
    });
    h.push('</div>');

    if (p.raw || p._structure || p._collectedCoupon) {
      h.push('<div class="rule"></div><h3 style="font-size:18px;font-weight:700;margin:0 0 12px">수집 원본 참고값</h3>');
      h.push('<div class="note">아래는 자동수집 데이터의 원본입니다. <b>그대로 읽지 말고</b> 투자설명서와 대조해 위 항목을 채우십시오.<br>'
        + (p._structure ? '구조 : ' + esc(p._structure) + '<br>' : '')
        + (p._collectedCoupon ? '수집 제시수익률 : ' + esc(p._collectedCoupon) + '<br>' : '')
        + (p.offerEnd ? '청약마감 : ' + esc(p.offerEnd) : '') + '</div>');
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
        if (kind === 'field') ST.manual[key] = v; else ST.inline[key] = v;
        save(); renderAll();
      };
    });
    /* 자동조회 패널 입력 */
    Array.prototype.forEach.call(document.querySelectorAll('.fInp'), function (i) {
      i.onchange = function () { ST.manual[i.dataset.k] = i.value; save(); renderTabs(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.iInp'), function (i) {
      i.onchange = function () { ST.inline[i.dataset.k] = i.value; save(); renderTabs(); };
    });
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
        if (kind === 'field') ST.manual[key] = v; else ST.inline[key] = v;
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
  function limitMin() { return ST.sheet === 'irp' ? 50 : 70; }
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
