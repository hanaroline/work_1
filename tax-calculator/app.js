/* ============================================================================
 * 부동산 세금 계산기 — UI 레이어
 * 계산 로직은 tax-engine.js, 이 파일은 상태 관리 / 렌더링 / 한영 전환만 담당
 * ==========================================================================*/
(function () {
  'use strict';

  var TE = window.TaxEngine;
  var EOK = TE.EOK;
  var LANG = 'ko';

  try { LANG = localStorage.getItem('mas-tax-lang') || 'ko'; } catch (e) { LANG = 'ko'; }

  /* ---------- i18n helpers ---------- */
  function L(ko, en) { return LANG === 'en' ? en : ko; }

  function applyStaticLang() {
    document.documentElement.lang = LANG;
    var nodes = document.querySelectorAll('[data-ko]');
    for (var i = 0; i < nodes.length; i++) {
      var t = nodes[i].getAttribute(LANG === 'en' ? 'data-en' : 'data-ko');
      if (t != null) nodes[i].textContent = t;
    }
    var btns = document.querySelectorAll('.lang-toggle button');
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute('aria-checked', btns[j].dataset.lang === LANG ? 'true' : 'false');
    }
    document.title = L('부동산 세금 계산기 · 2026년 세제개편안',
                       'Real Estate Tax Calculator · 2026 Tax Reform');
  }

  /* ---------- 숫자 포맷 ---------- */
  function comma(n) { return Math.round(n).toLocaleString('en-US'); }

  function won(n) {
    if (!isFinite(n)) return '—';
    return LANG === 'en' ? 'KRW ' + comma(n) : comma(n) + '원';
  }

  // 큰 금액 : 한국어는 억원, 영문은 bn/m
  function big(n) {
    if (!isFinite(n)) return '—';
    if (LANG === 'en') {
      if (Math.abs(n) >= 1e9) return 'KRW ' + (n / 1e9).toFixed(2) + 'bn';
      if (Math.abs(n) >= 1e6) return 'KRW ' + (n / 1e6).toFixed(1) + 'm';
      return 'KRW ' + comma(n);
    }
    if (Math.abs(n) >= EOK) return (n / EOK).toFixed(2) + '억원';
    if (Math.abs(n) >= 10000) return comma(n / 10000) + '만원';
    return comma(n) + '원';
  }

  // 세액 표시 : 원 단위 + 억/만원 병기
  function money(n) {
    if (!isFinite(n)) return '—';
    if (n === 0) return L('0원', 'KRW 0');
    return won(n);
  }

  function pct(x, d) { return (x * 100).toFixed(d == null ? 1 : d) + '%'; }
  function pctI(x) { return Math.round(x * 1000) / 10 + '%'; }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  /* ---------- 상태 읽기 ---------- */
  var seg = { year: 2026, houses: 1, title: 'sole', reform: 'on' };

  function num(id) { var v = parseFloat(document.getElementById(id).value); return isNaN(v) ? 0 : v; }
  function chk(id) { return document.getElementById(id).checked; }

  function readState() {
    var houseCount = seg.houses;
    var joint = seg.title === 'joint';
    var share = joint ? Math.min(0.99, Math.max(0.01, num('share') / 100)) : 1;
    var livesIn = parseInt(document.getElementById('livesIn').value, 10);

    var gs = [num('g1'), num('g2'), num('g3')].map(function (v) { return v * EOK; });
    var houses = [];
    for (var i = 0; i < houseCount; i++) {
      if (gs[i] > 0) houses.push({ gongsi: gs[i], resided: livesIn === (i + 1), adjusted: chk('adjusted') });
    }

    return {
      year: seg.year,
      houseCount: houseCount,
      joint: joint,
      share: share,
      houses: houses,
      livesIn: livesIn,
      resides: livesIn > 0 && livesIn <= houseCount,
      adjusted: chk('adjusted'),
      jointSpecial: chk('jointSpecial'),
      area: num('area'),
      over85: num('area') > 85,
      age: num('age'),
      holdY: num('holdY'),
      liveY: num('liveY'),
      nonResident: chk('nonResident'),
      buyPrice: num('buyPrice') * EOK,
      tempTwo: chk('tempTwo'),
      firstTime: chk('firstTime'),
      isCorp: chk('isCorp'),
      salePrice: num('salePrice') * EOK,
      expenses: num('expenses') * EOK,
      exempt: chk('exempt'),
      heavyTaxed: chk('heavyTaxed'),
      seniorRelief: chk('seniorRelief'),
      urban: chk('urban'),
      usePropDeduct: chk('propDeduct'),
      reform: seg.reform !== 'off',
      prevTotal: num('prevTotal') * 10000,
      prevGongsi: num('prevGongsi') * EOK,
      capBaseRate: Math.min(0.05, Math.max(0, num('capBaseRate') / 100)),
      prevPropMain: num('prevPropMain') * 10000,
      fireTax: num('fireTax') * 10000,
      noBaseCap: chk('noBaseCap'),
      noBurdenCap: chk('noBurdenCap')
    };
  }

  /* ---------- 계산 오케스트레이션 ---------- */

  function calcAcq(s) {
    return TE.acquisitionTax({
      price: s.buyPrice, housesAfter: s.houseCount, adjusted: s.adjusted,
      tempTwo: s.tempTwo, over85: s.over85, share: s.share,
      firstTime: s.firstTime, isCorp: s.isCorp
    });
  }

  // 재산세 : 보유 주택 전체 합산
  function calcProp(s) {
    var rows = [], totalWhole = 0, totalMine = 0;
    s.houses.forEach(function (h, i) {
      // 상한 판정용 직전연도 값은 주택 1(대상 물건)에만 적용한다.
      // 2·3주택의 직전연도 공시가격·재산세는 별도 입력받지 않으므로 상한 미적용.
      var isTarget = i === 0;
      var r = TE.propertyTax({
        gongsi: h.gongsi, isOneHouse: s.houseCount === 1, share: s.share, urban: s.urban,
        year: s.year,
        prevGongsi: isTarget ? s.prevGongsi : 0,
        capRate: s.capBaseRate,
        prevMain: isTarget ? s.prevPropMain : 0,
        noBaseCap: s.noBaseCap,
        noBurdenCap: s.noBurdenCap
      });
      r.idx = i + 1; r.gongsi = h.gongsi; r.capEligible = isTarget;
      rows.push(r);
      totalWhole += r.total; totalMine += r.myShare;
    });
    return {
      rows: rows,
      totalWhole: totalWhole,
      totalMine: totalMine,
      fireTax: s.fireTax,
      fireTaxMine: Math.round(s.fireTax * s.share)
    };
  }

  // 종부세 : 명의 구조에 따라 인별 / 세대 합계 산출
  function cret(s, opt) {
    opt = opt || {};
    var mode = opt.mode || (s.joint && s.houseCount === 1 && s.jointSpecial ? 'special' : 'individual');
    var year = opt.year || s.year;
    var base = {
      year: year, houses: s.houses, age: s.age, holdY: s.holdY, liveY: s.liveY,
      prevYearTotal: s.prevTotal, skipPropDeduct: !s.usePropDeduct,
      noBurdenCap: s.noBurdenCap,
      reform: opt.reform != null ? opt.reform : s.reform
    };

    if (!s.joint) {
      var r = TE.comprehensiveTax(Object.assign({}, base,
        { share: 1, isOne1H: s.houseCount === 1, wholeUnit: false }));
      return { mode: 'sole', mine: r, spouse: null, household: r ? r.total : 0, detail: r };
    }
    if (mode === 'special' && s.houseCount === 1) {
      var rs = TE.comprehensiveTax(Object.assign({}, base,
        { share: s.share, isOne1H: true, wholeUnit: true }));
      return { mode: 'special', mine: rs, spouse: null, household: rs ? rs.total : 0, detail: rs };
    }
    var a = TE.comprehensiveTax(Object.assign({}, base, { share: s.share, isOne1H: false, wholeUnit: false }));
    var b = TE.comprehensiveTax(Object.assign({}, base, { share: 1 - s.share, isOne1H: false, wholeUnit: false }));
    return {
      mode: 'individual', mine: a, spouse: b,
      household: (a ? a.total : 0) + (b ? b.total : 0), detail: a
    };
  }

  // 양도세 : 인별 계산 후 세대 합산
  function cgt(s, opt) {
    opt = opt || {};
    var year = opt.year || s.year;
    var base = {
      year: year, salePrice: s.salePrice, buyPrice: s.buyPrice, expenses: s.expenses,
      houseCount: s.houseCount, holdY: s.holdY, liveY: s.liveY,
      exempt: s.exempt, heavyTaxed: s.heavyTaxed,
      seniorRelief: s.seniorRelief, nonResident: s.nonResident,
      reform: opt.reform != null ? opt.reform : s.reform
    };
    var shareA = opt.share != null ? opt.share : s.share;
    var a = TE.capitalGainsTax(Object.assign({}, base, { share: shareA }));
    var b = shareA < 1 ? TE.capitalGainsTax(Object.assign({}, base, { share: 1 - shareA })) : null;
    return { mine: a, spouse: b, household: (a ? a.total : 0) + (b ? b.total : 0) };
  }

  /* ---------- 렌더 유틸 ---------- */
  // opts.prose : 서술형 표 — 숫자 우측정렬·nowrap 대신 좌측정렬·자동 줄바꿈
  function tbl(head, rows, opts) {
    opts = opts || {};
    var numCls = opts.prose ? '' : ' class="num"';
    var h = '<div class="tbl-wrap"><table class="dt' + (opts.prose ? ' prose' : '') + '"><thead><tr>';
    head.forEach(function (c, i) { h += '<th' + (i ? numCls : '') + '>' + c + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      var rc = r.cls ? ' class="' + r.cls + '"' : '';
      h += '<tr' + rc + '>';
      r.c.forEach(function (c, i) { h += '<td' + (i ? numCls : '') + '>' + c + '</td>'; });
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  function sect(title, lede, body) {
    return '<div class="block"><div class="section-rule"></div>' +
      '<h2 class="section-title">' + title + '</h2>' +
      (lede ? '<p class="section-lede">' + lede + '</p>' : '') + body + '</div>';
  }

  function stat(k, v, d, cls) {
    return '<div class="stat"><div class="k">' + k + '</div>' +
      '<div class="v ' + (cls || '') + '">' + v + '</div>' +
      (d ? '<div class="d">' + d + '</div>' : '') + '</div>';
  }

  function bars(items) {
    var max = 0;
    items.forEach(function (it) { if (it.v > max) max = it.v; });
    if (max <= 0) max = 1;
    return items.map(function (it) {
      return '<div class="bar-row"><div>' + it.k + '</div>' +
        '<div class="bar-track"><div class="bar-fill' + (it.blue ? ' blue' : '') +
        '" style="width:' + Math.max(1.5, (it.v / max) * 100) + '%"></div></div>' +
        '<div class="bar-val">' + big(it.v) + '</div></div>';
    }).join('');
  }

  var YEARS = [2026, 2027, 2028, 2029];

  /* ==========================================================================
   * 탭 렌더러
   * ========================================================================*/

  function renderSummary(s) {
    var acq = calcAcq(s), prop = calcProp(s), ct = cret(s), cg = cgt(s);
    var holdMine = prop.totalMine + (ct.mine ? ct.mine.total : 0);
    var holdHouse = prop.totalWhole + ct.household;

    var h = '';

    h += '<div class="stat-grid">' +
      stat(L('취득세 (1회)', 'Acquisition tax (one-off)'),
           acq ? big(acq.myShare) : '—',
           acq ? L('본인 지분 기준 · 실효세율 ', 'my share · effective ') + pct(acq.effectiveRate, 2) : '',
           'orange') +
      stat(L('연간 보유세 (본인)', 'Annual holding tax (mine)'),
           big(holdMine),
           L('재산세 ', 'Property ') + big(prop.totalMine) + ' + ' +
           L('종부세 ', 'CRET ') + big(ct.mine ? ct.mine.total : 0),
           holdMine === 0 ? '' : 'blue') +
      stat(L('양도소득세 (세대)', 'Capital gains tax (household)'),
           big(cg.household),
           L('지방소득세 포함 · ', 'incl. local income tax · ') + s.year + L('년 양도', ' disposal'),
           'orange') +
      '</div>';

    // 조건 요약
    var cond = [];
    cond.push('<span class="pill on">' + s.year + L('년 기준', '')+ '</span>');
    cond.push('<span class="pill">' + (s.houseCount === 3 ? L('3주택 이상', '3+ houses')
      : s.houseCount + L('주택', ' house(s)')) + '</span>');
    cond.push('<span class="pill">' + (s.joint ? L('공동명의 ', 'Joint ') + Math.round(s.share * 100) + '%'
      : L('단독명의', 'Sole title')) + '</span>');
    cond.push('<span class="pill' + (s.resides ? ' blue' : ' gray') + '">' +
      (s.resides ? L('실거주', 'Resident') : L('비거주', 'Non-resident')) + '</span>');
    if (s.adjusted) cond.push('<span class="pill">' + L('조정대상지역', 'Regulated area') + '</span>');
    if (s.joint && s.houseCount === 1 && s.jointSpecial)
      cond.push('<span class="pill">' + L('공동명의 1주택자 특례', 'Joint single-house election') + '</span>');
    h += '<p style="margin:0 0 19px;display:flex;gap:6px;flex-wrap:wrap;">' + cond.join('') + '</p>';

    // 연도별 보유세 · 양도세
    var rows = YEARS.map(function (y) {
      var c = cret(s, { year: y });
      var g = cgt(s, { year: y });
      var pt = prop.totalWhole;
      return {
        y: y, cretH: c.household, prop: pt, hold: pt + c.household, cgt: g.household,
        cls: y === s.year ? 'total' : ''
      };
    });
    var b0 = rows[0];
    h += sect(L('연도별 세금 지도', 'Year-by-year tax map'),
      L('동일 조건에서 기준연도만 바꿔 계산한 결과입니다. 재산세는 이번 개편 대상이 아니므로 공시가격이 불변이면 변하지 않습니다.',
        'Same conditions, year varied. Property tax is outside this reform and stays flat if assessed values are unchanged.'),
      tbl([L('구분', 'Year'), L('재산세 (세대)', 'Property (household)'), L('종부세 (세대)', 'CRET (household)'),
           L('보유세 합계', 'Holding total'), L('2026년 대비', 'vs 2026'), L('양도세 (세대)', 'CGT (household)')],
        rows.map(function (r) {
          var diff = r.hold - b0.hold;
          return { cls: r.cls, c: [
            '<strong>' + r.y + '</strong>' + (r.y === s.year ? ' <span class="pill on">' + L('선택', 'selected') + '</span>' : ''),
            money(r.prop), money(r.cretH), '<strong>' + money(r.hold) + '</strong>',
            diff === 0 ? '—' : (diff > 0 ? '+' : '') + big(diff),
            money(r.cgt)
          ] };
        })));

    h += '<h3 style="font-size:19px;margin:19px 0 12px;">' +
      L('연간 보유세 (재산세 + 종부세, 세대 기준)', 'Annual holding tax (property + CRET, household)') + '</h3>';
    h += bars(rows.map(function (r) { return { k: r.y + L('년', ''), v: r.hold }; }));

    h += '<h3 style="font-size:19px;margin:28px 0 12px;">' +
      L('양도세 (세대 합계)', 'Capital gains tax (household)') + '</h3>';
    h += bars(rows.map(function (r) { return { k: r.y + L('년', ''), v: r.cgt, blue: true }; }));

    // 인사이트
    var ins = [];
    var cgt26 = rows[0].cgt, cgt29 = rows[3].cgt;
    if (cgt29 > cgt26) {
      ins.push(L('양도 시점을 2026년에서 2029년으로 미루면 양도세가 <strong>' + big(cgt29 - cgt26) +
                 '</strong> 늘어납니다 (+' + Math.round((cgt29 / Math.max(1, cgt26) - 1) * 100) + '%). 장기보유특별공제가 거주기간 기준으로 전환되기 때문입니다.',
                 'Deferring disposal from 2026 to 2029 raises CGT by <strong>' + big(cgt29 - cgt26) +
                 '</strong> (+' + Math.round((cgt29 / Math.max(1, cgt26) - 1) * 100) + '%), as the long-term deduction shifts to a residence basis.'));
    }
    if (!s.resides && s.houseCount === 1) {
      var alt = Object.assign({}, s);
      alt.houses = s.houses.map(function (hh, i) { return { gongsi: hh.gongsi, resided: i === 0, adjusted: hh.adjusted }; });
      alt.resides = true; alt.liveY = Math.max(s.liveY, s.holdY);
      var altC = cret(alt), altG = cgt(alt);
      var savedHold = ct.household - altC.household, savedCgt = cg.household - altG.household;
      if (savedHold > 0 || savedCgt > 0) {
        ins.push(L('같은 주택에 실제로 거주할 경우 보유세는 연 <strong>' + big(Math.max(0, savedHold)) +
                   '</strong>, 양도세는 <strong>' + big(Math.max(0, savedCgt)) + '</strong> 줄어듭니다 (거주기간 ' +
                   Math.max(s.liveY, s.holdY) + '년 가정).',
                   'Actually residing in the property would cut holding tax by <strong>' + big(Math.max(0, savedHold)) +
                   '</strong> a year and CGT by <strong>' + big(Math.max(0, savedCgt)) + '</strong> (assuming ' +
                   Math.max(s.liveY, s.holdY) + ' years of residence).'));
      }
    }
    if (s.joint && s.houseCount === 1) {
      var soleS = Object.assign({}, s, { joint: false, share: 1 });
      var soleC = cret(soleS), soleG = cgt(soleS, { share: 1 });
      var dH = soleC.household - ct.household, dG = soleG.household - cg.household;
      if (Math.abs(dH) > 1000 || Math.abs(dG) > 1000) {
        ins.push(L('단독명의였다면 보유세 <strong>' + big(soleC.household) + '</strong>, 양도세 <strong>' +
                   big(soleG.household) + '</strong>입니다. 공동명의로 보유세 ' + (dH >= 0 ? big(dH) + ' 절감' : big(-dH) + ' 증가') +
                   ', 양도세 ' + (dG >= 0 ? big(dG) + ' 절감' : big(-dG) + ' 증가') + ' 효과가 있습니다.',
                   'Under sole title the figures would be <strong>' + big(soleC.household) + '</strong> holding tax and <strong>' +
                   big(soleG.household) + '</strong> CGT — joint title ' + (dH >= 0 ? 'saves ' + big(dH) : 'adds ' + big(-dH)) +
                   ' and ' + (dG >= 0 ? 'saves ' + big(dG) : 'adds ' + big(-dG)) + ' respectively.'));
      }
    }
    if (ins.length) {
      h += '<div class="note"><strong>' + L('상담 포인트', 'Advisory points') + '</strong><ul>' +
        ins.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>';
    }

    h += '<div class="callout"><h3>' + L('세 줄 요약', 'Three-line summary') + '</h3><p>' +
      L('① 취득세 · 재산세는 이번 개편 대상이 아닙니다. ② 종부세는 2027년부터 거주 여부와 주택 가액이 세액을 결정합니다. ③ 양도세는 2028~2029년에 걸쳐 「보유」가 아닌 「거주」가 공제를 결정하도록 바뀝니다.',
        '① Acquisition and property tax are untouched by this reform. ② From 2027 CRET is driven by residency and house value. ③ Through 2028–29 the capital gains deduction shifts from holding period to residence period.') +
      '</p></div>';

    return h;
  }

  function renderAcq(s) {
    var a = calcAcq(s);
    if (!a) return sect(L('취득세', 'Acquisition tax'), '', '<div class="note">' +
      L('취득가액을 입력하면 계산됩니다.', 'Enter an acquisition price to calculate.') + '</div>');

    var kindLabel = {
      standard: L('표준세율 (1~3%)', 'Standard rate (1–3%)'),
      heavy8: L('중과세율 8%', 'Heavy rate 8%'),
      heavy12: L('중과세율 12%', 'Heavy rate 12%')
    }[a.rateKind];

    var reason;
    if (s.isCorp) reason = L('법인 취득 → 12% 중과', 'Corporate acquisition → 12%');
    else if (a.rateKind === 'standard')
      reason = s.tempTwo && s.houseCount === 2
        ? L('일시적 2주택 → 1주택 세율 적용', 'Temporary two-house → single-house rate')
        : L('1주택' + (s.adjusted ? '' : ' 또는 비조정지역 2주택'), 'Single house' + (s.adjusted ? '' : ' or 2 houses outside regulated area'));
    else reason = s.adjusted
      ? L('조정대상지역 ' + s.houseCount + '주택', s.houseCount + ' houses in a regulated area')
      : L('비조정지역 ' + s.houseCount + '주택', s.houseCount + ' houses outside regulated areas');

    var rows = [
      { c: [L('취득가액 (주택 전체)', 'Acquisition price (whole)'), '', big(s.buyPrice)] },
      { c: [L('취득세 본세', 'Acquisition tax'), pct(a.baseRate, 2), won(a.main)] }
    ];
    if (a.relief > 0) rows.push({ cls: 'sub', c: [L('생애최초 감면', 'First-time buyer relief'), '—', '−' + won(a.relief)] });
    rows.push({ c: [L('지방교육세', 'Local education tax'), pct(a.eduRate, 2), won(a.edu)] });
    rows.push({ c: [L('농어촌특별세', 'Rural development surtax') +
      (s.over85 ? '' : ' <span class="pill">' + L('85㎡ 이하 비과세', 'exempt ≤85㎡') + '</span>'),
      pct(a.farmRate, 2), won(a.farm)] });
    rows.push({ cls: 'total', c: [L('합계 (주택 전체)', 'Total (whole house)'), pct(a.effectiveRate, 2), won(a.total)] });
    if (s.joint) rows.push({ cls: 'total', c: [L('본인 부담 (지분 ', 'My share (') + Math.round(s.share * 100) + '%)', '—', won(a.myShare)] });

    var h = '<div class="stat-grid">' +
      stat(L('취득세 합계', 'Total acquisition tax'), big(a.total), kindLabel, 'orange') +
      stat(L('실효세율', 'Effective rate'), pct(a.effectiveRate, 2), reason, 'blue') +
      stat(L('본인 부담', 'My share'), big(a.myShare),
           s.joint ? L('지분 ', 'share ') + Math.round(s.share * 100) + '%' : L('단독명의', 'sole title')) +
      '</div>';

    h += sect(L('취득세 산출 내역', 'Acquisition tax breakdown'),
      L('지방세법 기준 · 이번 세제개편안에 포함되지 않은 세목입니다.',
        'Under the Local Tax Act — this tax is not part of the reform bill.'),
      tbl([L('항목', 'Item'), L('세율', 'Rate'), L('세액', 'Amount')], rows));

    h += '<div class="note warn"><strong>' + L('공동명의 주의', 'Note on joint title') + '</strong> ' +
      L('취득세는 주택 전체 취득가액으로 세율을 판정한 뒤 지분별로 안분합니다. 공동명의로 나눈다고 세율 구간이 낮아지지 않습니다.',
        'The rate is determined on the whole acquisition price and then apportioned by share — splitting title does not lower the rate band.') +
      '</div>';

    // 주택 수 시나리오
    var sc = [1, 2, 3].map(function (n) {
      var r = TE.acquisitionTax({ price: s.buyPrice, housesAfter: n, adjusted: s.adjusted,
        tempTwo: false, over85: s.over85, share: 1, firstTime: s.firstTime, isCorp: false });
      return { cls: n === s.houseCount ? 'total' : '', c: [
        (n === 3 ? L('3주택 이상', '3+ houses') : n + L('주택', ' house(s)')),
        pct(r.baseRate, 2), pct(r.effectiveRate, 2), won(r.total)] };
    });
    h += sect(L('취득 후 주택 수별 비교', 'By number of houses after acquisition'),
      L('조정대상지역 ' + (s.adjusted ? '기준' : '아님') + ' · 동일 취득가액 기준',
        (s.adjusted ? 'Regulated area' : 'Non-regulated area') + ' · same acquisition price'),
      tbl([L('취득 후 주택 수', 'Houses after acquisition'), L('본세율', 'Base rate'),
           L('실효세율', 'Effective'), L('총 부담세액', 'Total')], sc));

    return h;
  }

  function renderProp(s) {
    var p = calcProp(s);
    if (!p.rows.length) return sect(L('재산세', 'Property tax'), '',
      '<div class="note">' + L('공시가격을 입력하면 계산됩니다.', 'Enter an assessed value to calculate.') + '</div>');

    var h = '<div class="stat-grid">' +
      stat(L('재산세 합계 (세대)', 'Property tax (household)'), big(p.totalWhole + p.fireTax),
           p.fireTax > 0 ? L('본세 + 도시지역분 + 지방교육세 + 지역자원시설세', 'Base + urban + education + facility tax')
                         : L('본세 + 도시지역분 + 지방교육세', 'Base + urban portion + education tax'), 'orange') +
      stat(L('본인 부담', 'My share'), big(p.totalMine + p.fireTaxMine),
           s.joint ? L('지분 ', 'share ') + Math.round(s.share * 100) + '%' : L('단독명의', 'sole title'), 'blue') +
      stat(L('공정시장가액비율', 'Fair market ratio'), pct(p.rows[0].fairRatio, 0),
           s.houseCount === 1 ? L('1세대 1주택 특례 43~45%', 'Single-house election 43–45%')
                              : L('1주택 외 60%', '60% for non-single-house')) +
      '</div>';

    var rows = [];
    p.rows.forEach(function (r) {
      rows.push({ c: ['<strong>' + L('주택 ', 'House ') + r.idx + '</strong> · ' + L('공시가격', 'assessed') +
        ' ' + big(r.gongsi), '', ''] });
      // ① 과세표준상한제
      if (r.baseCapped) {
        rows.push({ cls: 'sub', c: [L('공시가격 × ', 'Assessed × ') + pct(r.fairRatio, 0) +
          L(' (상한 적용 전)', ' (before cap)'), '', '<span class="strike">' + won(r.rawTaxBase) + '</span>'] });
        rows.push({ cls: 'sub', c: [L('과세표준상한액 = 직전연도 과세표준 상당액 × ', 'Base cap = prior-year equivalent × ') +
          pct(1 + r.capRate, 0) + ' <span class="pill warn">' + L('상한 적용', 'cap applied') + '</span>', '', won(r.baseCapAmt)] });
        rows.push({ cls: 'sub', c: ['<strong>' + L('과세표준 (둘 중 작은 값)', 'Tax base (lower of the two)') + '</strong>', '', '<strong>' + won(r.taxBase) + '</strong>'] });
      } else {
        rows.push({ cls: 'sub', c: [L('과세표준 = 공시가격 × ', 'Tax base = assessed × ') + pct(r.fairRatio, 0), '', won(r.taxBase)] });
      }
      // ② 세부담상한제
      if (r.burdenCapped) {
        rows.push({ cls: 'sub', c: [L('재산세 본세 (상한 적용 전)', 'Property tax (before cap)') +
          (r.special ? ' <span class="pill">' + L('1주택 특례세율', 'single-house reduced rate') + '</span>' : ''),
          '', '<span class="strike">' + won(r.mainBeforeCap) + '</span>'] });
        rows.push({ cls: 'sub', c: [L('세부담상한 = 직전연도 본세 × ', 'Burden cap = prior-year tax × ') +
          pct(r.burdenCapRate, 0) + ' <span class="pill warn">' + L('상한 적용', 'cap applied') + '</span>',
          '', '<strong>' + won(r.main) + '</strong>'] });
      } else {
        rows.push({ cls: 'sub', c: [L('재산세 본세', 'Property tax') +
          (r.special ? ' <span class="pill">' + L('1주택 특례세율', 'single-house reduced rate') + '</span>' : ''), '', won(r.main)] });
      }
      if (r.urban > 0) rows.push({ cls: 'sub', c: [L('도시지역분 (과세표준 × 0.14%)', 'Urban portion (base × 0.14%)'), '', won(r.urban)] });
      rows.push({ cls: 'sub', c: [L('지방교육세 (본세 × 20%)', 'Local education tax (20% of base)'), '', won(r.edu)] });
      rows.push({ c: [L('주택 ', 'House ') + r.idx + L(' 합계', ' total'), '', '<strong>' + won(r.total) + '</strong>'] });
    });
    if (p.fireTax > 0) {
      rows.push({ c: [L('지역자원시설세 (소방분, 입력값)', 'Regional resource facility tax (as entered)'), '', won(p.fireTax)] });
    }
    rows.push({ cls: 'total', c: [L('세대 합계', 'Household total'), '', won(p.totalWhole + p.fireTax)] });
    if (s.joint) rows.push({ cls: 'total', c: [L('본인 부담 (지분 ', 'My share (') + Math.round(s.share * 100) + '%)', '', won(p.totalMine + p.fireTaxMine)] });

    var h2 = sect(L('재산세 산출 내역', 'Property tax breakdown'),
      L('지방세법 기준 · 이번 세제개편안에 포함되지 않은 세목입니다. 공시가격이 오르지 않으면 세액도 변하지 않습니다.',
        'Under the Local Tax Act — outside this reform. Unchanged assessed values mean unchanged tax.'),
      tbl([L('항목', 'Item'), '', L('금액', 'Amount')], rows));

    var note = '<div class="note"><strong>' + L('개편안과의 관계', 'Relation to the reform') + '</strong><ul>' +
      '<li>' + L('재산세 공정시장가액비율(1주택 43~45%, 그 외 60%)과 세율은 이번 개편 대상이 아닙니다.',
                 'The property tax fair-market ratio (43–45% for single-house, 60% otherwise) and rates are untouched.') + '</li>' +
      '<li>' + L('1세대 1주택은 거주 여부와 무관하게 공정시장가액비율 특례를 적용받습니다. 종부세와 다른 점입니다.',
                 'The single-house ratio election applies regardless of residency — unlike CRET.') + '</li>' +
      '<li>' + L('공동명의라도 주택 전체를 기준으로 과세표준과 세액을 산출한 뒤 지분별로 안분 고지하므로, 누진 완화 효과가 없습니다.',
                 'Even under joint title the base and tax are computed on the whole house then apportioned — no progressive-rate benefit.') + '</li>' +
      '</ul></div>';

    return h + h2 + note;
  }

  function renderCret(s) {
    var c = cret(s);
    var r = c.detail;
    if (!r) return sect(L('종합부동산세', 'CRET'), '',
      '<div class="note">' + L('공시가격을 입력하면 계산됩니다.', 'Enter an assessed value to calculate.') + '</div>');

    var unitLabel = c.mode === 'special'
      ? L('주택 전체 (공동명의 1주택자 특례)', 'Whole house (joint single-house election)')
      : (s.joint ? L('인별 지분 ', 'Individual share ') + Math.round(s.share * 100) + '%' : L('인별 (단독명의)', 'Individual (sole title)'));

    var h = '<div class="stat-grid">' +
      stat(L('종부세 (세대 합계)', 'CRET (household)'), big(c.household),
           L('농어촌특별세 포함', 'incl. rural surtax'), c.household === 0 ? '' : 'orange') +
      stat(L('과세표준', 'Tax base'), big(r.taxBase),
           L('판정단위 : ', 'Unit: ') + unitLabel, 'blue') +
      stat(L('기본공제', 'Basic deduction'), big(r.basicDeduction),
           s.year >= 2027 && s.houseCount > 1
             ? L('4억 + 5억 × 거주비중 ', '400m + 500m × residence ratio ') + pct(r.residedRatio, 1)
             : (s.resides ? L('거주 1주택', 'Resident single house') : L('비거주 · 1주택 외', 'Non-resident / non-single'))) +
      '</div>';

    if (r.blockedByThreshold) {
      h += '<div class="note" style="background:#EAF4EC;border-left:3px solid ' +
        'var(--success);border-radius:0 4px 4px 0;"><strong>' +
        L('과세대상 문턱 미달 → 종부세 0원', 'Below the taxable threshold → CRET is zero') + '</strong><br>' +
        L('판정 대상 공시가격 ' + big(r.ownedValue) + '이(가) 문턱 ' + big(r.threshold) + ' 이하이므로 납세의무가 발생하지 않습니다.',
          'The assessed value tested (' + big(r.ownedValue) + ') is at or below the ' + big(r.threshold) +
          ' threshold, so no liability arises.') + '</div>';
    }

    // 5단계 계산
    var rows = [
      { c: ['<strong>STEP 1</strong> ' + L('공시가격 합산 (판정단위)', 'Aggregate assessed value (per unit)'), '', won(r.ownedValue)] }
    ];
    if (s.year >= 2027) {
      rows.push({ cls: 'sub', c: [L('과세대상 문턱 (', 'Taxable threshold (') +
        (s.houseCount === 1 && (!s.joint || c.mode === 'special') ? L('1세대 1주택자 14억', 'single-house 1.4bn') : L('그 외 9억', 'others 900m')) + ')',
        '', (r.blockedByThreshold ? '<span style="color:var(--success)">' + L('미달 → 과세 제외', 'below → not taxable') + '</span>' : L('초과 → 과세', 'exceeded → taxable'))] });
    }
    rows.push({ c: ['<strong>STEP 2</strong> ' + L('− 기본공제', '− Basic deduction'), '', '−' + won(r.basicDeduction)] });
    rows.push({ c: ['<strong>STEP 3</strong> ' + L('× 공정시장가액비율', '× Fair market ratio'), pct(r.fairRatio, 0), won(r.taxBase)] });
    rows.push({ c: ['<strong>STEP 4</strong> ' + L('× 세율 (누진)', '× Progressive rate'),
      L('한계 ', 'marginal ') + pct(r.marginal, 1), won(r.gross)] });
    if (r.propDeduct > 0) rows.push({ cls: 'sub', c: [L('− 재산세 중복분 공제', '− Overlapping property tax'), '', '−' + won(r.propDeduct)] });
    rows.push({ c: ['<strong>STEP 5</strong> ' + L('− 세액공제', '− Tax credits'),
      (s.houseCount === 1 && (!s.joint || c.mode === 'special'))
        ? L('연령 ', 'age ') + pct(r.creditRate.age, 0) + ' + ' + L('기간 ', 'period ') + pct(r.creditRate.period, 0) +
          ' = ' + pct(r.creditRate.total, 0)
        : L('적용 불가', 'not available'),
      '−' + won(r.creditAmt)] });
    if (r.creditCapped) rows.push({ cls: 'sub', c: [L('세액공제 금액한도 적용', 'Credit amount cap applied'),
      big(r.creditCap), '<span style="color:var(--error)">' + L('한도 초과분 소멸', 'excess forfeited') + '</span>'] });
    if (r.capApplied) rows.push({ cls: 'sub', c: [L('세부담상한 적용 (', 'Tax burden cap (') + pct(r.capLimit, 0) + ')', '', L('상한 적용됨', 'cap applied')] });
    rows.push({ c: [L('종합부동산세', 'CRET'), '', '<strong>' + won(r.net) + '</strong>'] });
    rows.push({ cls: 'sub', c: [L('농어촌특별세 (종부세 × 20%)', 'Rural surtax (20% of CRET)'), '', won(r.farm)] });
    rows.push({ cls: 'total', c: [L('납부세액 (1인)', 'Payable (per person)'), '', won(r.total)] });
    if (c.spouse) rows.push({ cls: 'total', c: [L('배우자 (지분 ', 'Spouse (share ') + Math.round((1 - s.share) * 100) + '%)', '', won(c.spouse.total)] });
    if (c.spouse) rows.push({ cls: 'total', c: [L('세대 합계', 'Household total'), '', won(c.household)] });

    h += sect(L('종부세 계산 5단계', 'CRET five-step calculation'),
      s.year >= 2027
        ? L(s.year + '년 개편안 기준 — 다섯 단계 전부가 바뀝니다.', 'Under the ' + s.year + ' reform — all five steps change.')
        : L('2026년 현행 기준입니다.', 'Current 2026 rules.'),
      tbl([L('단계', 'Step'), L('적용값', 'Applied'), L('금액', 'Amount')], rows));

    // 개별과세 vs 특례
    if (s.joint && s.houseCount === 1) {
      var ind = cret(s, { mode: 'individual' }), spe = cret(s, { mode: 'special' });
      var better = ind.household <= spe.household ? 'ind' : 'spe';
      h += sect(L('개별과세 vs 공동명의 1주택자 특례', 'Individual taxation vs joint single-house election'),
        L('부부 공동명의는 매년 9월 16~30일 특례 신청 여부를 다시 판단해야 합니다. 유불리는 한 방향이 아닙니다.',
          'Joint owners must re-elect between 16–30 September each year — neither option dominates.'),
        tbl([L('비교 항목', 'Item'), L('개별과세 (원칙)', 'Individual (default)'), L('공동명의 1주택자 특례', 'Joint single-house election')], [
          { c: [L('판정 단위', 'Assessment unit'), L('인별 지분', 'Individual share'), L('주택 전체', 'Whole house')] },
          { c: [L('과세대상 문턱', 'Threshold'), s.year >= 2027 ? L('인별 9억원', '900m per person') : '—',
                 s.year >= 2027 ? L('전체 14억원', '1.4bn whole') : '—'] },
          { c: [L('기본공제', 'Basic deduction'),
                 big(ind.mine ? ind.mine.basicDeduction : 0) + L(' × 2인', ' × 2'),
                 big(spe.mine ? spe.mine.basicDeduction : 0)] },
          { c: [L('고령 · 장기거주 세액공제', 'Age / long-residence credit'),
                 L('적용 불가', 'Not available'), L('적용 가능', 'Available')] },
          { cls: 'total', c: [L('세대 합계 세액', 'Household tax'),
                 money(ind.household) + (better === 'ind' ? ' <span class="pill on">' + L('유리', 'better') + '</span>' : ''),
                 money(spe.household) + (better === 'spe' ? ' <span class="pill on">' + L('유리', 'better') + '</span>' : '')] }
        ]));
    }

    // 단독 vs 공동
    if (s.houseCount === 1) {
      var soleC = cret(Object.assign({}, s, { joint: false, share: 1 }));
      var jointC = cret(Object.assign({}, s, { joint: true, share: 0.5, jointSpecial: false }));
      h += sect(L('명의 구조별 비교', 'By title structure'),
        L('동일 물건 · 동일 조건에서 명의만 달리한 결과입니다.', 'Same property and conditions, title structure varied.'),
        tbl([L('명의', 'Title'), L('판정 공시가격', 'Assessed value tested'), L('기본공제', 'Basic deduction'), L('세대 종부세', 'Household CRET')], [
          { cls: !s.joint ? 'total' : '', c: [L('단독명의', 'Sole title'),
              big(soleC.detail ? soleC.detail.ownedValue : 0), big(soleC.detail ? soleC.detail.basicDeduction : 0), money(soleC.household)] },
          { cls: s.joint ? 'total' : '', c: [L('부부 공동명의 50:50 (개별과세)', 'Joint 50:50 (individual)'),
              big(jointC.mine ? jointC.mine.ownedValue : 0) + L(' (1인)', ' (each)'),
              big(jointC.mine ? jointC.mine.basicDeduction : 0) + L(' (1인)', ' (each)'), money(jointC.household)] }
        ]) +
        (s.year >= 2027 ? '<div class="note"><strong>' + L('과세 개시선', 'Threshold at which CRET starts') + '</strong> ' +
          L('단독명의 비거주 1주택은 공시가격 14억원 초과부터, 부부 공동명의(개별과세)는 인별 9억원 = 주택 공시가격 18억원 초과부터 종부세가 시작됩니다. 공동명의는 과세 개시선을 4억원 밀어냅니다.',
            'For a sole-title non-resident single house CRET starts above 1.4bn; for a 50:50 joint pair it starts above 900m each — i.e. 1.8bn for the house. Joint title pushes the starting line out by 400m.') +
          '</div>' : ''));
    }

    // 연도별
    var yrows = YEARS.map(function (y) {
      var cc = cret(s, { year: y });
      var d = cc.detail;
      return { cls: y === s.year ? 'total' : '', c: [
        '<strong>' + y + '</strong>', d ? big(d.basicDeduction) : '—', d ? pct(d.fairRatio, 0) : '—',
        d ? big(d.taxBase) : '—', money(cc.household)] };
    });
    h += sect(L('연도별 종부세 추이', 'CRET by year'),
      L('공시가격 불변 가정 · 세대 합계 기준', 'Assumes unchanged assessed values · household total'),
      tbl([L('연도', 'Year'), L('기본공제', 'Basic deduction'), L('공정비율', 'Fair ratio'),
           L('과세표준', 'Tax base'), L('종부세 (세대)', 'CRET (household)')], yrows));

    return h;
  }

  function renderCgt(s) {
    var g = cgt(s), r = g.mine;
    if (!r) return sect(L('양도소득세', 'Capital gains tax'), '',
      '<div class="note">' + L('양도가액을 입력하면 계산됩니다.', 'Enter a sale price to calculate.') + '</div>');

    var ltLabel = { premium: L('1세대 1주택 우대공제', 'Single-house preferential deduction'),
                    general: L('일반공제', 'General deduction'),
                    excluded: L('공제 배제 (조정지역 중과대상)', 'Excluded — heavy-taxed in regulated area') }[r.ltKind];

    var h = '<div class="stat-grid">' +
      stat(L('양도세 (세대 합계)', 'CGT (household)'), big(g.household),
           L('지방소득세 10% 포함', 'incl. 10% local income tax'), 'orange') +
      stat(L('장기보유 · 장기거주 공제율', 'Long-term deduction rate'), pct(r.ltRate, 0), ltLabel, 'blue') +
      stat(L('실효세율', 'Effective rate'), pct(r.effectiveRate, 1),
           L('과세대상 양도차익 대비', 'against taxable gain')) +
      '</div>';

    var rows = [
      { c: [L('양도가액', 'Sale price'), '', won(s.salePrice)] },
      { cls: 'sub', c: [L('− 취득가액', '− Acquisition price'), '', '−' + won(s.buyPrice)] },
      { cls: 'sub', c: [L('− 필요경비', '− Necessary expenses'), '', '−' + won(s.expenses)] },
      { c: [L('= 양도차익 (주택 전체)', '= Gain (whole house)'), '', won(r.gainWhole)] }
    ];
    if (r.taxableRatio < 1) rows.push({ cls: 'sub', c: [
      L('1세대 1주택 비과세 — 12억 초과분만 과세', 'Single-house exemption — only gain above 1.2bn'),
      pct(r.taxableRatio, 1), ''] });
    rows.push({ c: [L('과세대상 양도차익 (1인)', 'Taxable gain (per person)'),
      s.joint ? L('지분 ', 'share ') + Math.round(s.share * 100) + '%' : '', won(r.taxableGain)] });
    rows.push({ c: [L('− 장기보유특별공제', '− Long-term deduction'),
      pct(r.ltRate, 0) + (r.ltLive > 0 ? ' (' + L('거주 ', 'residence ') + pct(r.ltLive, 0) +
      (r.ltHold > 0 ? ' + ' + L('보유 ', 'holding ') + pct(r.ltHold, 0) : '') + ')' : ''),
      '−' + won(r.ltAmt)] });
    if (r.ltCapped) rows.push({ cls: 'sub', c: [L('공제 금액한도 적용', 'Deduction cap applied'),
      big(r.ltCap), '<span style="color:var(--error)">−' + won(r.ltRaw - r.ltAmt) + L(' 공제 손실', ' forfeited') + '</span>'] });
    rows.push({ c: [L('= 양도소득금액', '= Capital gain income'), '', won(r.income)] });
    rows.push({ c: [L('− 기본공제', '− Basic deduction') +
      (r.basicSpecial ? ' <span class="pill on">' + L('장기거주 1주택 2,500만원', 'long-residence 25m') + '</span>' : ''),
      '', '−' + won(r.basicDed)] });
    rows.push({ c: [L('= 과세표준', '= Tax base'), '', won(r.taxBase)] });
    rows.push({ c: [L('× 세율', '× Rate'),
      pct(r.rate, 0) + (r.surcharge > 0 ? ' + ' + pct(r.surcharge, 0) + L('p 중과', 'p heavy') : '') +
      (r.usedShort ? ' → ' + L('단기 ', 'short-term ') + pct(r.shortRate, 0) : ''),
      won(r.calc + r.relief)] });
    if (r.relief > 0) rows.push({ cls: 'sub', c: [L('− 고령 1주택자 지방 이주 감면', '− Senior relocation relief'), '', '−' + won(r.relief)] });
    rows.push({ c: [L('산출세액', 'Calculated tax'), '', won(r.calc)] });
    rows.push({ cls: 'sub', c: [L('+ 지방소득세 (10%)', '+ Local income tax (10%)'), '', won(r.local)] });
    rows.push({ cls: 'total', c: [L('납부세액 (1인)', 'Payable (per person)'), '', won(r.total)] });
    if (g.spouse) {
      rows.push({ cls: 'total', c: [L('배우자 (지분 ', 'Spouse (share ') + Math.round((1 - s.share) * 100) + '%)', '', won(g.spouse.total)] });
      rows.push({ cls: 'total', c: [L('세대 합계', 'Household total'), '', won(g.household)] });
    }

    h += sect(L('양도소득세 산출 내역', 'Capital gains tax breakdown'),
      L(s.year + '년 양도분 기준', 'For disposal in ' + s.year),
      tbl([L('항목', 'Item'), L('적용', 'Applied'), L('금액', 'Amount')], rows));

    // 연도별
    var yrows = YEARS.map(function (y) {
      var gg = cgt(s, { year: y }), m = gg.mine;
      var d = gg.household - cgt(s, { year: 2026 }).household;
      return { cls: y === s.year ? 'total' : '', c: [
        '<strong>' + y + '</strong>', pct(m.ltRate, 0), won(m.ltAmt), won(m.taxBase),
        money(gg.household), d === 0 ? '—' : (d > 0 ? '+' : '') + big(d)] };
    });
    h += sect(L('양도 시점별 비교', 'By year of disposal'),
      L('같은 물건을 언제 파느냐로 세액이 갈립니다. 공제율은 1인 기준입니다.',
        'Timing drives the outcome. Deduction rate is shown per person.'),
      tbl([L('양도연도', 'Year'), L('공제율', 'Deduction rate'), L('공제액 (1인)', 'Deduction (each)'),
           L('과세표준 (1인)', 'Tax base (each)'), L('양도세 (세대)', 'CGT (household)'), L('2026년 대비', 'vs 2026')], yrows));

    // 거주기간 시나리오
    var lrows = [0, 2, 5, 10].map(function (ly) {
      var alt = Object.assign({}, s, { liveY: ly, holdY: Math.max(s.holdY, ly) });
      var gg = cgt(alt);
      return { cls: ly === s.liveY ? 'total' : '', c: [
        ly + L('년 거주', ' yrs residence'), pct(gg.mine.ltRate, 0),
        won(gg.mine.basicDed), money(gg.household)] };
    });
    h += sect(L('거주기간별 비교', 'By years of residence'),
      L('보유기간 ' + s.holdY + '년 이상 · ' + s.year + '년 양도 기준. 「몇 년 살았는가」가 세액을 결정합니다.',
        'Holding period ≥' + s.holdY + ' yrs, disposal in ' + s.year + '. Years lived drives the tax.'),
      tbl([L('거주기간', 'Residence'), L('공제율', 'Deduction rate'), L('기본공제', 'Basic deduction'),
           L('양도세 (세대)', 'CGT (household)')], lrows));

    // 단독 vs 공동
    var soleG = cgt(s, { share: 1 });
    var jointG = cgt(s, { share: 0.5 });
    h += sect(L('명의 구조별 비교', 'By title structure'),
      L('공동명의는 기본공제를 각각 적용받고 누진세율 구간이 낮아지지만, 장기거주 소득공제의 물건별 한도는 지분율대로 안분됩니다.',
        'Joint title doubles the basic deduction and lowers the progressive band, but the per-property deduction cap is apportioned by share.'),
      tbl([L('명의', 'Title'), L('공제액 (합계)', 'Deduction (total)'), L('기본공제 (합계)', 'Basic deduction (total)'),
           L('적용 세율', 'Rate'), L('양도세 (세대)', 'CGT (household)')], [
        { cls: !s.joint ? 'total' : '', c: [L('단독명의', 'Sole title'), won(soleG.mine.ltAmt),
            won(soleG.mine.basicDed), pct(soleG.mine.rate, 0), money(soleG.household)] },
        { cls: s.joint ? 'total' : '', c: [L('부부 공동명의 50:50', 'Joint 50:50'),
            won(jointG.mine.ltAmt * 2), won(jointG.mine.basicDed * 2), pct(jointG.mine.rate, 0), money(jointG.household)] }
      ]));

    if (s.year >= 2028) {
      h += '<div class="note warn"><strong>' + L('공제한도 신설', 'New deduction cap') + '</strong> ' +
        L('장기거주 소득공제에 인별 · 물건별 금액한도가 생깁니다 (2028년 각 20억원 → 2029년 이후 각 10억원). 물건별 한도는 지분 비율대로 안분되므로, 부부 50:50이면 1인당 ' +
          (s.year === 2028 ? '10억원' : '5억원') + '입니다.',
          'The long-residence deduction gains per-person and per-property caps (20bn each in 2028, 10bn from 2029). The per-property cap is apportioned by share — ' +
          (s.year === 2028 ? '1bn' : '500m') + ' each for a 50:50 couple.') + '</div>';
    }

    return h;
  }

  function renderBasis(s) {
    var h = '';

    h += sect(L('시행 로드맵', 'Implementation roadmap'),
      L('종부세는 2027년부터, 양도세는 2028~2029년에 걸쳐 단계 시행됩니다.',
        'CRET changes land in 2027; capital gains changes phase in over 2028–29.'),
      tbl([L('연도', 'Year'), L('종합부동산세', 'CRET'), L('양도소득세', 'Capital gains tax')], [
        { c: ['2026', L('현행 유지 (기본공제 12억/9억, 공정비율 60%)', 'Current rules (1.2bn/900m, 60%)'),
              L('다주택 중과 한시 완화 소급 적용 (2주택 +5%p, 3주택 +10%p)', 'Heavy-tax relief applied retroactively (+5%p / +10%p)')] },
        { c: ['2027', L('전면 개편 — 문턱 신설, 기본공제 14억/9억, 공정비율 70%, 과표 6~12억 1.3%, 세액공제 한도 800만원, 세부담상한 200%',
                        'Full reform — new threshold, 1.4bn/900m deductions, 70% ratio, 1.3% on the 600m–1.2bn band, 8m credit cap, 200% burden cap'),
              L('장기거주 1주택 기본공제 2,500만원 · 고령 1주택자 지방이주 감면 50%', 'Long-residence basic deduction 25m · senior relocation relief 50%')] },
        { c: ['2028', L('단일 세율표(0.5~5.0%) · 3주택·조정지역 공정비율 80% · 세액공제 한도 600만원',
                        'Single rate table (0.5–5.0%) · 80% ratio for 3+ houses and regulated areas · 6m credit cap'),
              L('장기거주 소득공제 전환 (거주 6% + 보유 2%) · 공제한도 20억원 신설', 'Shift to long-residence deduction (6% + 2%) · 2bn cap introduced')] },
        { c: ['2029', L('변동 없음 (2028년 체계 유지)', 'Unchanged from 2028'),
              L('보유공제 완전 폐지 → 거주 연 8%(최대 80%)만 · 공제한도 10억원으로 축소',
                'Holding-period deduction abolished → residence only at 8%/yr (max 80%) · cap cut to 1bn')] }
      ], { prose: true }));

    var bk = TE.NT_BRACKETS;
    var labels = [L('3억원 이하', '≤300m'), L('3억 ~ 6억원', '300–600m'), L('6억 ~ 12억원', '600m–1.2bn'),
                  L('12억 ~ 25억원', '1.2–2.5bn'), L('25억 ~ 50억원', '2.5–5bn'),
                  L('50억 ~ 94억원', '5–9.4bn'), L('94억원 초과', '>9.4bn')];
    h += sect(L('종부세 세율표', 'CRET rate table'),
      L('2028년부터 주택 수 구분이 사라지고 단일 세율표만 남습니다.',
        'From 2028 the house-count split disappears and a single table applies.'),
      tbl([L('과세표준', 'Tax base'), L('현행 2주택 이하', 'Current ≤2'), L('현행 3주택 이상', 'Current 3+'),
           L('2027년 2주택 이하', '2027 ≤2'), L('2027년 3주택 이상', '2027 3+'), L('2028년 이후 단일', '2028+ single')],
        labels.map(function (lab, i) {
          return { cls: i === 2 ? 'total' : '', c: [lab, pct(bk.cur_low[i][1], 1), pct(bk.cur_high[i][1], 1),
            pct(bk.y27_low[i][1], 1), pct(bk.y27_high[i][1], 1), pct(bk.single[i][1], 1)] };
        })));

    h += sect(L('양도세 장기보유특별공제 로드맵', 'Long-term deduction roadmap'),
      L('1세대 1주택 우대공제는 3년 이상 보유 + 2년 이상 거주 요건을 충족해야 적용됩니다.',
        'The single-house preferential deduction requires ≥3 years holding and ≥2 years residence.'),
      tbl([L('구분', 'Item'), L('~2027년 양도', 'through 2027'), L('2028년 양도', '2028'), L('2029년 이후', '2029+')], [
        { c: [L('1주택 거주기간 공제', 'Single-house residence'), L('연 4% (최대 40%)', '4%/yr (max 40%)'),
              L('연 6% (최대 60%)', '6%/yr (max 60%)'), L('연 8% (최대 80%)', '8%/yr (max 80%)')] },
        { c: [L('1주택 보유기간 공제', 'Single-house holding'), L('연 4% (최대 40%)', '4%/yr (max 40%)'),
              L('연 2% (최대 20%)', '2%/yr (max 20%)'), L('폐지', 'Abolished')] },
        { c: [L('다주택 보유기간 공제', 'Multi-house holding'), L('연 2% (최대 30%)', '2%/yr (max 30%)'),
              L('연 1% (최대 15%)', '1%/yr (max 15%)'), L('폐지', 'Abolished')] },
        { c: [L('다주택 거주기간 공제', 'Multi-house residence'), L('없음', 'None'),
              L('연 2% (최대 30%)', '2%/yr (max 30%)'), L('연 2% (최대 30%)', '2%/yr (max 30%)')] },
        { cls: 'total', c: [L('공제 금액한도', 'Deduction cap'), L('없음', 'None'),
              L('인별 · 물건별 각 20억원', '2bn per person and per property'),
              L('인별 · 물건별 각 10억원', '1bn per person and per property')] }
      ]));

    h += sect(L('다주택자 조정대상지역 중과세율', 'Heavy tax surcharge in regulated areas'),
      L('보유세 정상화에 따른 매도 기회를 주기 위해 2026~2028년 한시 완화됩니다.',
        'Temporarily relaxed for 2026–28 to open a disposal window.'),
      tbl([L('구분', 'Item'), L('현행', 'Current'), L('2026 ~ 2027년', '2026–27'), L('2028년', '2028'), L('2029년 이후', '2029+')], [
        { c: [L('1세대 2주택', 'Two houses'), '+20%p', '+5%p', '+10%p', '+20%p'] },
        { c: [L('1세대 3주택 이상', 'Three or more'), '+30%p', '+10%p', '+15%p', '+30%p'] }
      ]));

    // ── 상한 장치 3종 비교 ──────────────────────────────────────
    h += sect(L('상한 장치 3종 — 무엇을 제한하는가', 'Three cap mechanisms — what each limits'),
      L('세 상한은 제한 대상이 서로 다르므로 중복 적용됩니다. 재산세는 ①과 ②를 차례로 거치고, 종부세는 ③이 마지막에 걸립니다.',
        'The three caps limit different things and stack. Property tax passes through ① then ②; CRET is capped last by ③.'),
      tbl([L('구분', 'Cap'), L('제한 대상', 'What it limits'), L('상한 수준', 'Level'),
           L('근거 · 시행', 'Basis / status')], [
        { c: [L('① 과세표준상한제', '① Tax base cap'),
              L('재산세 <strong>과세표준</strong>', 'Property tax <strong>base</strong>'),
              L('직전연도 과세표준 상당액 × (1 + 5%)', 'Prior-year equivalent base × (1 + 5%)'),
              L('지방세법 §110의2 · 2024년 시행', 'Local Tax Act §110-2 · since 2024')] },
        { c: [L('② 재산세 세부담상한', '② Property tax burden cap'),
              L('재산세 <strong>세액</strong>', 'Property tax <strong>amount</strong>'),
              L('공시가 3억↓ 105% / 3~6억 110% / 6억↑ 130%', '≤300m 105% / ≤600m 110% / >600m 130%'),
              L('지방세법 §122 · 2028년까지 병행, 2029년 폐지 예정', 'Local Tax Act §122 · runs to 2028, ends 2029')] },
        { c: [L('③ 종부세 세부담상한', '③ CRET burden cap'),
              L('보유세 <strong>총액</strong>(재산세 + 종부세)', '<strong>Total</strong> holding tax'),
              L('현행 150% → <strong>개편안 200%</strong>', 'Now 150% → <strong>reform 200%</strong>'),
              L('종부세법 §10 · 2027년 상향', 'CRET Act §10 · raised in 2027')] }
      ], { prose: true }));

    h += '<div class="note warn"><strong>' + L('개편의 방향에 주의', 'Note on direction') + '</strong> ' +
      L('①②는 납세자를 보호하는 장치이고, ③은 이번 개편으로 <strong>느슨해집니다</strong>. 150%에서 200%로 올라가면 공시가격·공정비율·세율이 동시에 오르는 2027~2028년에 상한이 방파제 역할을 하지 못하고 그대로 부과될 수 있습니다.',
        'Caps ① and ② protect the taxpayer, but ③ is <strong>loosened</strong> by this reform. Raising it from 150% to 200% means it may no longer act as a buffer in 2027–2028, when assessed values, fair-market ratios and rates all rise together.') +
      '</div>';

    // ── 지역자원시설세 세율표 ───────────────────────────────────
    var fireRows = [
      ['600만원 이하', '≤ 6m', '0.04%', '—'],
      ['600만 ~ 1,300만원', '6m – 13m', '0.05%', '2,400원'],
      ['1,300만 ~ 2,600만원', '13m – 26m', '0.06%', '5,900원'],
      ['2,600만 ~ 3,900만원', '26m – 39m', '0.08%', '13,700원'],
      ['3,900만 ~ 6,400만원', '39m – 64m', '0.10%', '24,100원'],
      ['6,400만원 초과', '> 64m', '0.12%', '49,100원']
    ].map(function (r) { return { c: [L(r[0], r[1]), r[2], r[3]] }; });

    h += sect(L('지역자원시설세 (소방분) 세율표', 'Regional resource facility tax (fire) rates'),
      L('재산세 고지서에 병기되어 함께 징수됩니다. 과세표준은 건축물(주택 건물분) 시가표준액 기준이며, 공시가격만으로는 건물분을 분리할 수 없어 이 계산기는 자동 산출하지 않습니다.',
        'Billed and collected alongside property tax. Its base is the building-only standard value, which cannot be derived from the assessed value alone, so this calculator does not compute it automatically.'),
      tbl([L('과세표준', 'Tax base'), L('세율', 'Rate'), L('누진 기초금액', 'Base amount')], fireRows));

    h += sect(L('이번 개편에서 빠진 세목', 'Taxes outside this reform'),
      L('고객은 “부동산 세금이 다 오른다”고 이해하기 쉽지만, 실제로는 국세만 바뀌고 지방세는 그대로입니다.',
        'Clients often assume everything rises — in fact only national taxes change; local taxes are untouched.'),
      tbl([L('세목', 'Tax'), L('소관', 'Authority'), L('개편 포함', 'In scope'), L('본 계산기 적용 기준', 'Basis used here')], [
        { c: [L('종합부동산세', 'CRET'), L('재정경제부 (국세)', 'MOEF (national)'),
              L('포함 — 전면 개편', 'Yes — full reform'), L('2026 현행 / 2027~ 개편안', '2026 current / 2027+ reform')] },
        { c: [L('양도소득세', 'Capital gains tax'), L('재정경제부 (국세)', 'MOEF (national)'),
              L('포함 — 전면 개편', 'Yes — full reform'), L('연도별 개편 일정 반영', 'Phased reform schedule')] },
        { c: [L('재산세', 'Property tax'), L('행정안전부 (지방세)', 'MOIS (local)'),
              L('미포함', 'No'), L('현행 지방세법', 'Current Local Tax Act')] },
        { c: [L('취득세', 'Acquisition tax'), L('행정안전부 (지방세)', 'MOIS (local)'),
              L('미포함', 'No'), L('현행 지방세법', 'Current Local Tax Act')] },
        { c: [L('공시가격', 'Assessed value'), L('국토교통부', 'MOLIT'),
              L('미포함', 'No'), L('사용자 입력값 · 불변 가정', 'User input, held constant')] }
      ], { prose: true }));

    h += '<div class="note alert"><strong>' + L('계산 방법에 관한 고지', 'Note on methodology') + '</strong><ul>' +
      '<li>' + L('종부세는 산출세액에서 재산세 중복분을 먼저 공제한 뒤 세액공제를 적용하는 법정 순서로 계산합니다. 세미나 자료의 일부 예시는 재산세 중복공제를 생략하고 있어 수만 원 단위 차이가 날 수 있으며, 좌측 「계산 옵션」에서 끌 수 있습니다.',
                 'CRET is computed in the statutory order — overlapping property tax is deducted before tax credits. Some seminar examples omit that step, causing small differences; it can be switched off under Calculation Options.') + '</li>' +
      '<li>' + L('세미나 자료 p.42(2주택 2027년 시나리오)와 p.49(2028·2029년 양도세)의 일부 수치는 자료가 함께 제시한 과세표준과 세율로 재계산하면 맞지 않습니다. 본 계산기는 자료의 결과값이 아니라 자료가 명시한 세율 · 공제 규정을 그대로 적용합니다.',
                 'Some figures on p.42 (two-house 2027 scenarios) and p.49 (2028–29 CGT) of the seminar deck do not reconcile with the tax base and rates the deck itself states. This calculator applies the stated rules rather than reproducing those results.') + '</li>' +
      '<li>' + L('공동명의 지분율은 보유 중인 모든 주택에 동일하게 적용되는 것으로 가정합니다. 주택별로 명의 구조가 다르면 개별 검토가 필요합니다.',
                 'The ownership share is assumed identical across all houses held. Mixed structures need individual review.') + '</li>' +
      '<li>' + L('세부담상한(150% → 200%)은 직전연도 보유세 합계를 입력한 경우에만 판정합니다.',
                 'The tax burden cap (150% → 200%) is tested only when a prior-year holding tax total is entered.') + '</li>' +
      '<li>' + L('상생임대주택, 등록임대주택, 재개발 · 재건축 공사기간, 부득이한 사유에 따른 거주기간 인정 특례는 반영되어 있지 않습니다. 해당되는 경우 거주기간 입력값에 직접 가산하십시오.',
                 'Special residence-period recognitions (co-prosperity leases, registered rentals, redevelopment construction periods, unavoidable causes) are not modelled — add them to the residence-period input where applicable.') + '</li>' +
      '</ul></div>';

    return h;
  }

  /* ---------- 렌더 컨트롤러 ---------- */
  var RENDER = { summary: renderSummary, acq: renderAcq, prop: renderProp,
                 cret: renderCret, cgt: renderCgt, basis: renderBasis };

  function renderAll() {
    var s = readState();
    Object.keys(RENDER).forEach(function (k) {
      var el = document.getElementById('tab-' + k);
      if (el) el.innerHTML = RENDER[k](s);
    });
    // 연도 힌트
    var hints = {
      2026: L('현행 기준. 종부세·양도세 개편 전 상태입니다.', 'Current rules, before the CRET and CGT reforms.'),
      2027: L('종부세 개편 원년 — 문턱 신설, 기본공제 14억/9억, 공정비율 70%.', 'First reform year for CRET — new threshold, 1.4bn/900m deductions, 70% ratio.'),
      2028: L('양도세 개편 원년 — 장기거주 소득공제 전환, 단일 세율표 적용.', 'First reform year for CGT — long-residence deduction, single CRET rate table.'),
      2029: L('보유공제 완전 폐지 — 거주하지 않은 주택은 장특공제 0%.', 'Holding-period deduction abolished — non-resident houses get 0%.')
    };
    document.getElementById('yearHint').textContent = hints[s.year];

    // 개편안 적용 힌트
    document.getElementById('reformHint').textContent = s.reform
      ? L('선택한 연도의 개편안 규정을 적용합니다. 취득세·재산세는 개편 대상이 아니므로 어느 쪽을 골라도 동일합니다.',
          'Applies the reform rules for the selected year. Acquisition and property tax are outside the reform, so both settings give the same result.')
      : L('연도와 무관하게 현행 법령으로 계산합니다. 같은 연도·같은 공시가격에서 「개편안 반영」과 비교하면 개편 효과만 분리해 볼 수 있습니다.',
          'Calculates under current law regardless of year. Compare with "Reform applied" at the same year and value to isolate the reform effect.');

    // 세부담상한 폐지 연도 안내
    document.getElementById('prevPropHint').textContent = s.year >= 2029
      ? L('2029년은 주택분 재산세 세부담상한이 폐지될 예정이므로 이 값은 반영되지 않습니다.',
          'The housing property-tax burden cap is scheduled to end in 2029, so this value is not applied.')
      : L('주택 전체 기준 본세(도시지역분·지방교육세 제외). 공시가격 구간별 105/110/130%로 제한하며 2029년 폐지 예정입니다.',
          'Whole-house main tax only. Capped at 105/110/130% by value band; scheduled to end in 2029.');

    document.getElementById('prevTotalHint').textContent =
      L('인별 기준 「재산세 + 종부세」 합계. 당해연도 보유세 총액을 이 금액의 ' +
        (s.reform && s.year >= 2027 ? '200%' : '150%') + '로 제한합니다.',
        'Per-person property tax + CRET. Caps this year\'s total holding tax at ' +
        (s.reform && s.year >= 2027 ? '200%' : '150%') + ' of it.');
  }

  /* ---------- 조건부 입력 표시 ---------- */
  function syncVisibility() {
    var joint = seg.title === 'joint';
    document.getElementById('wrapShare').classList.toggle('hidden', !joint);
    document.getElementById('wrapSpecial').classList.toggle('hidden', !(joint && seg.houses === 1));
    document.getElementById('wrapG2').classList.toggle('hidden', seg.houses < 2);
    document.getElementById('wrapG3').classList.toggle('hidden', seg.houses < 3);

    var sel = document.getElementById('livesIn');
    sel.querySelectorAll('.opt2').forEach(function (o) { o.hidden = seg.houses < 2; });
    sel.querySelectorAll('.opt3').forEach(function (o) { o.hidden = seg.houses < 3; });
    if (parseInt(sel.value, 10) > seg.houses) sel.value = '1';
  }

  /* ---------- 이벤트 ---------- */
  function bindSeg(id, key, cast) {
    var el = document.getElementById(id);
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      seg[key] = cast ? cast(b.dataset.v) : b.dataset.v;
      syncVisibility(); renderAll();
    });
  }

  function init() {
    applyStaticLang();
    bindSeg('segYear', 'year', function (v) { return parseInt(v, 10); });
    bindSeg('segHouses', 'houses', function (v) { return parseInt(v, 10); });
    bindSeg('segTitle', 'title', null);
    bindSeg('segReform', 'reform', null);

    document.getElementById('inputs').addEventListener('input', renderAll);
    document.getElementById('inputs').addEventListener('change', renderAll);

    document.querySelector('.lang-toggle').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      LANG = b.dataset.lang;
      try { localStorage.setItem('mas-tax-lang', LANG); } catch (err) {}
      applyStaticLang(); renderAll();
    });

    document.querySelector('.tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      document.querySelectorAll('.tabs button').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      b.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.tabpanel').forEach(function (p) { p.classList.add('hidden'); });
      document.getElementById('tab-' + b.dataset.tab).classList.remove('hidden');
    });

    document.getElementById('btnPrint').addEventListener('click', function () { window.print(); });
    document.getElementById('btnReset').addEventListener('click', function () {
      document.getElementById('inputs').reset();
      seg = { year: 2026, houses: 1, title: 'sole', reform: 'on' };
      ['segYear', 'segHouses', 'segTitle', 'segReform'].forEach(function (id) {
        var el = document.getElementById(id);
        el.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); });
      });
      syncVisibility(); renderAll();
    });

    syncVisibility();
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
