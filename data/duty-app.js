/**
 * 완전판매 스크립트 — 화면 동작
 *
 *   목록 만들기(ELS 데이터 + 펀드 데이터 + 첨부로 등록한 상품)
 *   → 상품 선택 → DutyText 로 설명의무 문안 생성 → 화면에 출력
 *   → 투자설명서 첨부 시 DutyExtract 로 판독해 같은 문안을 설명서 값으로 다시 채움
 *
 * 등록한 상품은 이 브라우저(localStorage)에만 남는다. 다른 PC 로 옮길 때는
 * JSON 으로 내보내고 가져온다. 서버로 나가는 통신은 없다.
 */
(function () {
  'use strict';

  var LS_PRODUCTS = 'duty-registered-v1';
  var LS_LANG = 'duty-lang';

  var state = {
    filter: 'all',
    q: '',
    selectedId: null,
    doc: null,          // { name, kind, fields, keys, length }
    registered: []
  };

  /* ---------- 유틸 ---------- */

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function pair(ko, en) {
    return '<span data-ko>' + ko + '</span><span data-en>' + (en === undefined ? ko : en) + '</span>';
  }

  var SRC_LABEL = {
    data: { cls: 'b-data', ko: '상품데이터', en: 'product data' },
    doc: { cls: 'b-doc', ko: '투자설명서', en: 'prospectus' },
    calc: { cls: 'b-calc', ko: '계산', en: 'derived' },
    law: { cls: 'b-law', ko: '법령', en: 'statute' },
    none: { cls: 'b-none', ko: '확인필요', en: 'check' }
  };

  function srcBadge(src) {
    var s = SRC_LABEL[src] || SRC_LABEL.law;
    return '<span class="badge ' + s.cls + '">' + pair(s.ko, s.en) + '</span>';
  }

  function $(id) { return document.getElementById(id); }

  /* ---------- 목록 만들기 ---------- */

  function loadRegistered() {
    try {
      var raw = localStorage.getItem(LS_PRODUCTS);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveRegistered() {
    try { localStorage.setItem(LS_PRODUCTS, JSON.stringify(state.registered)); } catch (e) {}
  }

  function elsRecords() {
    var d = window.ELS_DATA;
    if (!d || !Array.isArray(d.products)) return [];
    var sample = d.source !== 'live';
    return d.products.map(function (p, i) {
      return {
        id: 'els-' + (p.code || i),
        kind: 'ELS',
        region: null,
        name: p.name || p.code || 'ELS',
        code: p.code || '',
        sample: sample,
        imported: false,
        raw: p
      };
    });
  }

  function fundRecords() {
    var d = window.FUND_DATA;
    if (!d || !Array.isArray(d.products)) return [];
    var sample = d.source !== 'live';
    return d.products.map(function (p, i) {
      return {
        id: 'fund-' + (p.code || i),
        kind: 'FUND',
        region: p.region === 'overseas' ? 'overseas' : 'domestic',
        name: p.name || p.code || 'FUND',
        code: p.code || '',
        sample: sample,
        imported: false,
        raw: p
      };
    });
  }

  function registeredRecords() {
    return state.registered.map(function (p, i) {
      return {
        id: 'reg-' + (p.code || i) + '-' + i,
        kind: p.kind === 'ELS' ? 'ELS' : 'FUND',
        region: p.region === 'overseas' ? 'overseas' : (p.kind === 'ELS' ? null : 'domestic'),
        name: p.name || '(이름 없음)',
        code: p.code || '',
        sample: false,
        imported: true,
        raw: p
      };
    });
  }

  function catalog() {
    return elsRecords().concat(fundRecords(), registeredRecords());
  }

  function matches(rec) {
    if (state.filter === 'els' && rec.kind !== 'ELS') return false;
    if (state.filter === 'kr' && !(rec.kind === 'FUND' && rec.region === 'domestic')) return false;
    if (state.filter === 'ov' && !(rec.kind === 'FUND' && rec.region === 'overseas')) return false;
    if (state.filter === 'imported' && !rec.imported) return false;
    if (!state.q) return true;
    var hay = [rec.name, rec.code, (rec.raw.underlyings || []).join(' '), rec.raw.assetType, rec.raw.manager, rec.raw.invests]
      .filter(Boolean).join(' ').toLowerCase();
    return hay.indexOf(state.q.toLowerCase()) >= 0;
  }

  /* ---------- 목록 렌더 ---------- */

  function typeCell(rec) {
    if (rec.kind === 'ELS') {
      return pair((rec.raw.type || 'ELS') + (rec.raw.shape ? ' · ' + esc(rec.raw.shape) : ''),
                  (rec.raw.type || 'ELS'));
    }
    var region = rec.region === 'overseas' ? { ko: '해외', en: 'Overseas' } : { ko: '국내', en: 'Domestic' };
    var type = rec.raw.assetType || '';
    var typeEn = { '주식형': 'Equity', '채권형': 'Bond', '혼합형': 'Balanced', '재간접': 'Fund of funds', 'MMF': 'MMF' }[type] || type;
    return pair(region.ko + (type ? ' · ' + esc(type) : ''),
                region.en + (typeEn ? ' · ' + esc(typeEn) : ''));
  }

  function figuresCell(rec) {
    var p = rec.raw;
    if (rec.kind === 'ELS') {
      var bits = [];
      if ((p.underlyings || []).length) bits.push(esc(p.underlyings.join(', ')));
      if (p.couponRate !== null && p.couponRate !== undefined) bits.push('연 ' + DutyText.pct(p.couponRate, 2));
      if (Array.isArray(p.schedule) && p.schedule.length) {
        bits.push(p.schedule.map(function (s) { return s.barrier; }).join('-'));
      }
      bits.push(p.knockIn === null || p.knockIn === undefined ? 'KI 없음' : 'KI ' + DutyText.pct(p.knockIn, 0));
      return esc(bits.join(' · '));
    }
    var f = [];
    if (p.totalExpense !== null && p.totalExpense !== undefined) f.push('총보수 ' + DutyText.pct(p.totalExpense, 2));
    if (p.feeFront) f.push('선취 ' + DutyText.pct(p.feeFront, 2));
    if (p.hedge) f.push(p.hedge === 'H' ? '환헤지' : '환노출');
    if (p.redemptionPayout) f.push(esc(p.redemptionPayout));
    return f.length ? esc(f.join(' · ')) : '—';
  }

  function renderList() {
    var rows = catalog().filter(matches);
    var host = $('list');
    if (!rows.length) {
      host.innerHTML = '<tr><td colspan="4" class="empty">' +
        pair('조건에 맞는 상품이 없습니다.', 'No products match.') + '</td></tr>';
      return;
    }
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var badges = '';
      if (r.sample) badges += ' <span class="badge b-sample">' + pair('예시', 'sample') + '</span>';
      if (r.imported) badges += ' <span class="badge b-import">' + pair('첨부등록', 'attached') + '</span>';
      html += '<tr data-id="' + esc(r.id) + '" tabindex="0"' +
        (r.id === state.selectedId ? ' aria-selected="true"' : '') + '>' +
        '<td><span class="pname">' + esc(r.name) + '</span>' + badges +
        (r.code ? '<span class="pmeta">' + esc(r.code) + '</span>' : '') + '</td>' +
        '<td>' + typeCell(r) + '</td>' +
        '<td class="num">' + (r.raw.riskGrade ? esc(r.raw.riskGrade) + pair('등급', '') : '—') + '</td>' +
        '<td>' + figuresCell(r) + '</td>' +
        '</tr>';
    }
    host.innerHTML = html;
  }

  function updateCatalogNote() {
    var e = window.ELS_DATA || {}, f = window.FUND_DATA || {};
    var nEls = (e.products || []).length, nFund = (f.products || []).length;
    var when = e.updatedAt ? String(e.updatedAt).slice(0, 10) : null;

    var ko = ['ELS ' + nEls + (e.source === 'live' ? '' : ' (예시)'),
              '펀드 ' + nFund + (f.source === 'live' ? '' : ' (예시)')];
    var en = ['ELS ' + nEls + (e.source === 'live' ? '' : ' (sample)'),
              'funds ' + nFund + (f.source === 'live' ? '' : ' (sample)')];
    if (state.registered.length) {
      ko.push('첨부등록 ' + state.registered.length);
      en.push('attached ' + state.registered.length);
    }
    $('catalog-note').innerHTML = pair(
      ko.join(' · ') + (when ? ' · ELS 수집 ' + when : ''),
      en.join(' · ') + (when ? ' · ELS collected ' + when : '')
    );
  }

  /* ---------- 결과 렌더 ---------- */

  function selectedRecord() {
    var all = catalog();
    for (var i = 0; i < all.length; i++) if (all[i].id === state.selectedId) return all[i];
    return null;
  }

  function renderSummary(summary) {
    var html = '<div class="rows">';
    for (var i = 0; i < summary.length; i++) {
      var s = summary[i];
      html += '<div class="row' + (s.src === 'none' ? ' miss' : '') + '">' +
        '<div class="rl">' + pair(s.label.ko, s.label.en) + '</div>' +
        '<div class="rv">' + pair(s.value.ko, s.value.en) +
        (s.conflict ? ' <span class="badge b-conflict">' + pair('불일치', 'conflict') + '</span>' : '') +
        (s.excerpt ? '<span class="excerpt">' + esc(s.excerpt) + '</span>' : '') +
        '</div>' +
        '<div class="rs">' + srcBadge(s.src) + '</div>' +
        '</div>';
    }
    return html + '</div>';
  }

  function renderSections(sections) {
    var html = '';
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      html += '<div class="block">' +
        '<h3 class="block-title"><span class="idx">' + sec.no + '</span>' + pair(sec.title.ko, sec.title.en) + '</h3>' +
        '<div class="rows">';
      for (var j = 0; j < sec.lines.length; j++) {
        var l = sec.lines[j];
        html += '<div class="row' + (l.src === 'none' ? ' miss' : '') + '">' +
          '<div class="rv">' + pair(l.ko, l.en) +
          (l.conflict ? ' <span class="badge b-conflict">' + pair('불일치', 'conflict') + '</span>' : '') +
          (l.note ? '<span class="rnote">' + pair(l.note.ko, l.note.en) + '</span>' : '') +
          (l.excerpt ? '<span class="excerpt">' + esc(l.excerpt) + '</span>' : '') +
          '</div>' +
          '<div class="rs">' + srcBadge(l.src) + '</div>' +
          '</div>';
      }
      html += '</div></div>';
    }
    return html;
  }

  function renderChecklist(list) {
    var html = '<div class="check" id="check">' +
      '<div class="check-head"><h4>' + pair('고객 이해 확인', 'Confirmation of understanding') + '</h4>' +
      '<span class="count"><span class="done">0</span> / ' + list.length + '</span></div>';
    for (var i = 0; i < list.length; i++) {
      html += '<label><input type="checkbox"><span>' + pair(list[i].ko, list[i].en) + '</span></label>';
    }
    html += '<div class="sign">' +
      '<span>' + pair('설명일자', 'Date') + '</span>' +
      '<span>' + pair('설명 담당자', 'Explained by') + '</span>' +
      '<span>' + pair('고객 확인(서명)', 'Client signature') + '</span>' +
      '</div></div>';
    return html;
  }

  function renderOutput() {
    var host = $('out');
    var rec = selectedRecord();
    if (!rec) {
      host.innerHTML = '<div class="info"><span class="lbl">' + pair('안내', 'Note') + '</span>' +
        pair('위 목록에서 상품을 고르시면 설명의무 내용이 자동으로 작성됩니다.',
             'Choose a product above and the duty-of-explanation text is generated here.') + '</div>';
      return;
    }

    var docFields = state.doc ? state.doc.fields : null;
    var built = window.DutyText.build(rec, docFields);
    var missing = 0, conflicts = 0;
    built.sections.forEach(function (s) {
      s.lines.forEach(function (l) { if (l.src === 'none') missing++; if (l.conflict) conflicts++; });
    });
    built.summary.forEach(function (s) { if (s.conflict) conflicts++; });

    var html = '';

    html += '<div class="selected-bar">' +
      '<span class="t">' + esc(rec.name) + '</span>' +
      '<span class="s">' + esc(rec.code || '') +
      (rec.sample ? ' · <span class="badge b-sample">' + pair('예시 데이터', 'sample data') + '</span>' : '') +
      (rec.imported ? ' · <span class="badge b-import">' + pair('첨부로 등록한 상품', 'registered from a document') + '</span>' : '') +
      (state.doc ? ' · ' + pair('첨부: ' + esc(state.doc.name), 'attached: ' + esc(state.doc.name)) : '') +
      '</span></div>';

    if (rec.sample) {
      html += '<div class="warn"><span class="lbl">' + pair('예시 데이터', 'Sample data') + '</span>' +
        pair('이 상품은 실재하는 상품이 아니라 화면 확인용 예시입니다. 고객 응대에 쓰지 마십시오.',
             'This is a placeholder, not a real product. Do not use it with a client.') + '</div>';
    }
    if (conflicts) {
      html += '<div class="warn"><span class="lbl">' + pair('불일치 ' + conflicts + '건', conflicts + ' conflict(s)') + '</span>' +
        pair('상품 데이터와 첨부 설명서의 값이 다른 항목이 있습니다. 설명서를 기준으로 확인한 뒤 안내하십시오.',
             'Some values differ between the product data and the attached document. Verify against the document first.') + '</div>';
    }
    if (missing) {
      html += '<div class="info"><span class="lbl">' + pair('확인필요 ' + missing + '건', missing + ' to check') + '</span>' +
        pair('값이 없어 문장을 만들지 못한 항목이 있습니다. 투자설명서를 첨부하시거나, 해당 항목을 설명서 값으로 직접 안내하십시오.',
             'Some items have no value and no sentence was generated. Attach the prospectus or quote those figures directly.') + '</div>';
    }

    html += '<div class="block"><h3 class="block-title"><span class="idx">00</span>' +
      pair('핵심 수치 요약', 'Key figures') + '</h3>' + renderSummary(built.summary) + '</div>';
    html += renderSections(built.sections);
    html += renderChecklist(built.checklist);

    html += '<div class="actions">' +
      '<button type="button" class="btn solid" id="print"><span data-ko>확인서로 인쇄</span><span data-en>Print as a record</span></button>' +
      '<button type="button" class="btn" id="copy"><span data-ko>스크립트 복사</span><span data-en>Copy script</span></button>' +
      '<button type="button" class="btn" id="reset-check"><span data-ko>체크 지우기</span><span data-en>Clear checks</span></button>' +
      '</div>';

    host.innerHTML = html;
    host.dataset.plain = plainScript(rec, built);
  }

  /** 클립보드로 나가는 텍스트본 (한국어) */
  function plainScript(rec, built) {
    var out = [];
    out.push('[설명의무 스크립트] ' + rec.name + (rec.code ? ' (' + rec.code + ')' : ''));
    out.push('');
    out.push('■ 핵심 수치');
    built.summary.forEach(function (s) {
      out.push(' - ' + s.label.ko + ': ' + stripTags(s.value.ko) + ' [' + (SRC_LABEL[s.src] || {}).ko + ']' + (s.conflict ? ' (불일치)' : ''));
    });
    built.sections.forEach(function (sec) {
      out.push('');
      out.push('■ ' + sec.no + ' ' + sec.title.ko);
      sec.lines.forEach(function (l) {
        out.push(' - ' + stripTags(l.ko) + ' [' + (SRC_LABEL[l.src] || {}).ko + ']' + (l.conflict ? ' (불일치)' : ''));
      });
    });
    out.push('');
    out.push('■ 고객 이해 확인');
    built.checklist.forEach(function (c, i) { out.push(' ' + (i + 1) + '. □ ' + c.ko); });
    out.push('');
    out.push('설명일자:            설명 담당자:            고객 확인(서명):');
    return out.join('\n');
  }

  function stripTags(s) { return String(s).replace(/<[^>]*>/g, ''); }

  /* ---------- 첨부 판독 ---------- */

  var DOC_LABELS = {
    productName: ['상품명', 'Product name'],
    code: ['표준코드', 'Code'],
    manager: ['운용사·발행사', 'Manager / issuer'],
    issuer: ['발행회사', 'Issuer'],
    risk: ['위험등급', 'Risk grade'],
    totalExpense: ['총보수(%)', 'Total expenses'],
    feeFront: ['선취판매수수료(%)', 'Front-end load'],
    feeBack: ['후취판매수수료(%)', 'Back-end load'],
    otherCost: ['기타비용(%)', 'Other costs'],
    redemptionFee: ['환매수수료', 'Redemption fee'],
    redemptionPricing: ['환매 기준가', 'Redemption pricing'],
    redemptionPayout: ['환매 지급', 'Redemption payment'],
    invests: ['투자대상', 'Invests in'],
    benchmark: ['비교지수', 'Benchmark'],
    hedge: ['환헤지', 'Hedging'],
    underlyings: ['기초자산', 'Underlyings'],
    knockIn: ['낙인(%)', 'Knock-in'],
    barriers: ['배리어', 'Barriers'],
    couponRate: ['제시수익률(%)', 'Yield'],
    maturityMonths: ['만기(개월)', 'Maturity (months)'],
    maxLoss: ['최대손실', 'Maximum loss'],
    highComplexity: ['고난도 여부', 'Highly complex'],
    tax: ['과세', 'Tax'],
    docDate: ['문서 기준일', 'Document date']
  };

  function fieldText(key, hit) {
    var v = hit.value;
    if (key === 'risk') return v.grade + '등급' + (v.label ? ' (' + v.label + ')' : '') + (v.mismatch ? ' — 문서 안에서 등급 숫자와 문구가 다릅니다' : '');
    if (key === 'highComplexity') return '해당';
    if (Array.isArray(v)) return v.join('-');
    return String(v);
  }

  function renderDocFound() {
    var host = $('doc-found');
    if (!state.doc) { host.hidden = true; host.innerHTML = ''; return; }
    var f = state.doc.fields;
    var keys = Object.keys(f);
    if (!keys.length) {
      host.hidden = false;
      host.innerHTML = '<div class="empty" style="padding:16px">' +
        pair('설명서에서 알아볼 수 있는 항목을 찾지 못했습니다. 스캔 이미지 PDF 이거나 형식이 다를 수 있습니다.',
             'No recognizable items were found — the file may be a scanned image or an unusual format.') + '</div>';
      return;
    }
    var html = '<table><thead><tr>' +
      '<th>' + pair('판독한 항목', 'Item') + '</th>' +
      '<th>' + pair('값', 'Value') + '</th>' +
      '<th>' + pair('문서에 적힌 문장', 'Sentence in the document') + '</th>' +
      '</tr></thead><tbody>';
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], lab = DOC_LABELS[k] || [k, k];
      html += '<tr><td><b>' + pair(lab[0], lab[1]) + '</b></td>' +
        '<td>' + esc(fieldText(k, f[k])) + '</td>' +
        '<td><span class="excerpt">' + esc(f[k].excerpt || '') + '</span></td></tr>';
    }
    host.innerHTML = html + '</tbody></table>';
    host.hidden = false;
  }

  function setDocStatus(html, cls) {
    $('doc-status').innerHTML = cls ? '<span class="' + cls + '">' + html + '</span>' : html;
  }

  async function handleFile(file) {
    if (!file) return;
    setDocStatus(pair('읽는 중… ' + esc(file.name), 'Reading… ' + esc(file.name)));
    try {
      var read = await window.DutyExtract.readFile(file, function (n, total) {
        setDocStatus(pair('읽는 중… ' + n + ' / ' + total + ' 쪽', 'Reading… page ' + n + ' of ' + total));
      });
      if (!read.text || read.text.replace(/\s/g, '').length < 50) {
        state.doc = null;
        setDocStatus(pair('텍스트를 거의 뽑아내지 못했습니다. 스캔 이미지 PDF 는 글자를 읽을 수 없습니다.',
                          'Almost no text could be extracted — a scanned-image PDF has no readable text.'), 'bad');
        renderDocFound(); renderOutput(); updateDocButtons();
        return;
      }
      var parsed = window.DutyExtract.fromText(read.text);
      state.doc = { name: file.name, kind: read.kind, fields: parsed.fields, keys: parsed.keys, length: parsed.length };
      setDocStatus(pair(
        '<b>' + esc(file.name) + '</b> 판독 완료 — ' + parsed.keys.length + '개 항목을 찾았습니다. 아래 문장이 설명서 값으로 다시 작성되었습니다.',
        '<b>' + esc(file.name) + '</b> parsed — ' + parsed.keys.length + ' item(s) found. The text below has been rebuilt from the document.'
      ), 'ok');
    } catch (err) {
      state.doc = null;
      setDocStatus(pair('읽지 못했습니다 — ' + esc(err.message || err), 'Could not read the file — ' + esc(err.message || err)), 'bad');
    }
    renderDocFound();
    renderOutput();
    updateDocButtons();
  }

  function updateDocButtons() {
    $('clear-doc').disabled = !state.doc;
    $('register-doc').disabled = !state.doc;
  }

  /** 첨부한 설명서만으로 새 상품을 만들어 목록에 넣는다 */
  function registerFromDoc() {
    if (!state.doc) return;
    var f = state.doc.fields;
    var isEls = !!(f.underlyings || f.barriers || f.knockIn) ||
      /ELS|ELB|DLS|DLB|파생결합/.test((f.productName && f.productName.value) || '');
    var name = (f.productName && f.productName.value) || state.doc.name.replace(/\.[^.]+$/, '');
    var rec = {
      kind: isEls ? 'ELS' : 'FUND',
      name: name,
      code: (f.code && f.code.value) || '',
      riskGrade: f.risk ? f.risk.value.grade : null,
      riskLabel: f.risk ? f.risk.value.label : null,
      highComplexity: !!f.highComplexity,
      registeredAt: new Date().toISOString().slice(0, 10),
      docName: state.doc.name
    };
    if (isEls) {
      rec.type = /ELB/.test(name) ? 'ELB' : 'ELS';
      rec.shape = null;
      rec.underlyings = [];
      rec.couponRate = f.couponRate ? f.couponRate.value : null;
      rec.rateBasis = 'annual';
      rec.maturityMonths = f.maturityMonths ? f.maturityMonths.value : null;
      rec.knockIn = f.knockIn ? f.knockIn.value : null;
      rec.principalProtection = /ELB/.test(name) ? 100 : 0;
      rec.maxLossRate = /ELB/.test(name) ? 0 : -100;
      rec.schedule = f.barriers ? f.barriers.value.map(function (b, i) {
        var total = f.maturityMonths ? f.maturityMonths.value : null;
        return { months: total ? Math.round(total * (i + 1) / f.barriers.value.length) : (i + 1), barrier: b };
      }) : [];
      rec.offerStart = null; rec.offerEnd = null;
    } else {
      rec.region = /해외|글로벌|월드|아시아|미국|중국|유럽|신흥|글로발|Global|World/i.test(name) ? 'overseas' : 'domestic';
      rec.assetType = /채권/.test(name) ? '채권형' : (/혼합/.test(name) ? '혼합형' : (/주식/.test(name) ? '주식형' : null));
      rec.manager = f.manager ? f.manager.value : null;
      rec.invests = f.invests ? f.invests.value : null;
      rec.benchmark = f.benchmark ? f.benchmark.value : null;
      rec.hedge = f.hedge ? f.hedge.value : null;
      rec.totalExpense = f.totalExpense ? f.totalExpense.value : null;
      rec.feeFront = f.feeFront ? f.feeFront.value : undefined;
      rec.otherCost = f.otherCost ? f.otherCost.value : null;
      rec.redemptionFee = f.redemptionFee ? f.redemptionFee.value : undefined;
      rec.redemptionPricing = f.redemptionPricing ? f.redemptionPricing.value : null;
      rec.redemptionPayout = f.redemptionPayout ? f.redemptionPayout.value : null;
      rec.expenseBreakdown = null;
      rec.derivatives = false;
    }
    state.registered.push(rec);
    saveRegistered();
    updateCatalogNote();
    renderList();
    var recs = registeredRecords();
    state.selectedId = recs[recs.length - 1].id;
    renderList();
    renderOutput();
    setDocStatus(pair('<b>' + esc(name) + '</b> 을(를) 목록에 등록했습니다. 이 브라우저에만 저장됩니다.',
                      '<b>' + esc(name) + '</b> added to the list — stored in this browser only.'), 'ok');
  }

  /* ---------- 내보내기 / 가져오기 ---------- */

  function download(filename, text) {
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function importJson(file) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var arr = JSON.parse(String(fr.result));
        if (!Array.isArray(arr)) throw new Error('배열이 아닙니다.');
        var clean = arr.filter(function (x) { return x && typeof x === 'object' && x.name; });
        state.registered = state.registered.concat(clean);
        saveRegistered();
        updateCatalogNote();
        renderList();
        setDocStatus(pair(clean.length + '개 상품을 가져왔습니다.', 'Imported ' + clean.length + ' product(s).'), 'ok');
      } catch (e) {
        setDocStatus(pair('가져오지 못했습니다 — ' + esc(e.message), 'Import failed — ' + esc(e.message)), 'bad');
      }
    };
    fr.readAsText(file, 'utf-8');
  }

  /* ---------- 이벤트 ---------- */

  function bind() {
    $('q').addEventListener('input', function () { state.q = this.value.trim(); renderList(); });

    var chips = document.querySelectorAll('.chips button');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function () {
        for (var j = 0; j < chips.length; j++) chips[j].setAttribute('aria-pressed', String(chips[j] === this));
        state.filter = this.dataset.filter;
        renderList();
      });
    }

    $('list').addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-id]');
      if (!tr) return;
      state.selectedId = tr.dataset.id;
      renderList();
      renderOutput();
      document.getElementById('h-out').scrollIntoView({ block: 'start' });
    });
    $('list').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var tr = e.target.closest('tr[data-id]');
      if (!tr) return;
      e.preventDefault();
      state.selectedId = tr.dataset.id;
      renderList();
      renderOutput();
    });

    $('pick-file').addEventListener('click', function () { $('file').click(); });
    $('file').addEventListener('change', function () { handleFile(this.files[0]); this.value = ''; });
    $('clear-doc').addEventListener('click', function () {
      state.doc = null; setDocStatus(''); renderDocFound(); renderOutput(); updateDocButtons();
    });
    $('register-doc').addEventListener('click', registerFromDoc);

    var drop = $('drop');
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    $('export-json').addEventListener('click', function () {
      if (!state.registered.length) {
        setDocStatus(pair('내보낼 등록 상품이 없습니다.', 'No registered products to export.'), 'bad');
        return;
      }
      download('duty-products.json', JSON.stringify(state.registered, null, 2));
    });
    $('import-json').addEventListener('click', function () { $('json-file').click(); });
    $('json-file').addEventListener('change', function () { if (this.files[0]) importJson(this.files[0]); this.value = ''; });

    // 결과 영역(동적 생성)의 버튼과 체크박스
    $('out').addEventListener('click', function (e) {
      if (e.target.closest('#print')) { window.print(); return; }
      if (e.target.closest('#reset-check')) {
        var boxes = $('out').querySelectorAll('input[type="checkbox"]');
        for (var i = 0; i < boxes.length; i++) boxes[i].checked = false;
        refreshCount();
        return;
      }
      var copyBtn = e.target.closest('#copy');
      if (copyBtn) {
        var text = $('out').dataset.plain || '';
        var done = function () {
          var ko = copyBtn.querySelector('[data-ko]'), en = copyBtn.querySelector('[data-en]');
          var a = ko.textContent, b = en.textContent;
          ko.textContent = '복사되었습니다'; en.textContent = 'Copied';
          setTimeout(function () { ko.textContent = a; en.textContent = b; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      }
    });
    $('out').addEventListener('change', refreshCount);
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  function refreshCount() {
    var box = document.getElementById('check');
    if (!box) return;
    var boxes = box.querySelectorAll('input[type="checkbox"]');
    var done = 0;
    for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) done++;
    box.querySelector('.done').textContent = String(done);
  }

  /* ---------- 한/영 ---------- */

  function initLang() {
    var root = document.documentElement;
    var buttons = document.querySelectorAll('.lang-toggle button');
    function setLang(lang) {
      root.setAttribute('lang', lang);
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('aria-checked', String(buttons[i].dataset.lang === lang));
      }
      try { localStorage.setItem(LS_LANG, lang); } catch (e) {}
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () { setLang(this.dataset.lang); });
    }
    var saved;
    try { saved = localStorage.getItem(LS_LANG); } catch (e) {}
    if (saved === 'en' || saved === 'ko') setLang(saved);
  }

  /* ---------- 시작 ---------- */

  function start() {
    state.registered = loadRegistered();
    updateCatalogNote();
    renderList();
    renderOutput();
    updateDocButtons();
    bind();
    initLang();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
