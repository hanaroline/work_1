/**
 * 완전판매 스크립트 — 설명의무 문안 생성기
 *
 * 상품 한 건(+ 첨부한 투자설명서에서 읽어낸 값)을 받아, 창구에서 **그대로 읽어 드릴 수
 * 있는 문장**으로 설명의무 내용을 만든다. 금융소비자보호법 제19조가 요구하는 항목
 * (상품의 내용 / 위험 / 위험등급 / 수수료 / 해제·해지 / 그 밖의 보호 사항) 순서를 따른다.
 *
 * 규칙
 *   - 문장에 들어가는 값은 전부 출처가 있다: data(상품 데이터) · doc(첨부 설명서)
 *     · calc(데이터로 계산) · law(법령 고정) · none(값 없음 → 확인 요청 문장).
 *   - 값이 없으면 문장을 지어내지 않고 "설명서에서 확인해 안내" 문장으로 남긴다.
 *   - 설명서 값과 상품 데이터가 다르면 그 줄에 불일치 표시를 단다.
 *
 * window.DutyText.build(record, docFields) -> { summary, sections, checklist, flags }
 */
(function () {
  'use strict';

  /* ---------- 값 다루기 ---------- */

  function num(n, digits) {
    if (n === null || n === undefined || !Number.isFinite(Number(n))) return null;
    var v = Number(n);
    if (digits === undefined) digits = (Math.abs(v) < 10 && v % 1 !== 0) ? 2 : (v % 1 === 0 ? 0 : 2);
    return v.toFixed(digits).replace(/\.?0+$/, function (s) { return s.indexOf('.') === 0 ? '' : s; });
  }

  function pct(n, digits) { var s = num(n, digits); return s === null ? null : s + '%'; }

  /** 문장 안에 끼워 넣을 값 — 끝에 붙은 마침표를 뗀다 (마침표가 겹쳐 찍히지 않게). */
  function noDot(s) { return String(s === null || s === undefined ? '' : s).replace(/[\s.。]+$/, ''); }

  /**
   * 상품 데이터 값과 첨부 설명서 값을 합친다.
   * 설명서 값이 있으면 그쪽을 쓰고, 데이터와 다르면 conflict 를 남긴다.
   *
   * conflict 는 **수치·등급처럼 딱 떨어지는 값(eq 를 준 항목)** 에만 붙인다.
   * 상품명이나 문장은 설명서 표현과 데이터 표기가 늘 조금씩 달라서,
   * 거기까지 불일치로 세면 정작 봐야 할 숫자 불일치가 묻힌다.
   */
  function merge(dataVal, docHit, eq) {
    if (docHit && docHit.value !== null && docHit.value !== undefined) {
      var conflict = false;
      if (eq && dataVal !== null && dataVal !== undefined) conflict = !eq(dataVal, docHit.value);
      return { v: docHit.value, src: 'doc', excerpt: docHit.excerpt, conflict: conflict, other: dataVal };
    }
    if (dataVal !== null && dataVal !== undefined && dataVal !== '') {
      return { v: dataVal, src: 'data', excerpt: null, conflict: false };
    }
    return { v: null, src: 'none', excerpt: null, conflict: false };
  }

  function L(ko, en, src, extra) {
    var line = { ko: ko, en: en, src: src || 'law' };
    if (extra) {
      if (extra.excerpt) line.excerpt = extra.excerpt;
      if (extra.conflict) line.conflict = extra.conflict;
      if (extra.note) line.note = extra.note;
    }
    return line;
  }

  /** 값이 없을 때 쓰는 문장 */
  function ASK(koItem, enItem) {
    return L(
      koItem + '은(는) 이 화면에 값이 없습니다. <b>투자설명서에 적힌 값으로 직접 안내</b>하십시오.',
      enItem + ' is not available here — <b>quote the figure printed in the prospectus.</b>',
      'none'
    );
  }

  /* ---------- ELS ---------- */

  function elsScript(p, doc) {
    var d = doc || {};
    var lines1 = [], lines2 = [], lines3 = [], lines4 = [], lines5 = [], lines6 = [];
    var summary = [];
    var flags = {};

    var name = merge(p.name, d.productName);
    var code = merge(p.code, d.code);
    var months = merge(p.maturityMonths, d.maturityMonths, function (a, b) { return Number(a) === Number(b); });
    var ki = merge(p.knockIn, d.knockIn, function (a, b) { return Number(a) === Number(b); });
    var rate = merge(p.couponRate, d.couponRate, function (a, b) { return Math.abs(a - b) < 0.005; });
    var riskGrade = merge(p.riskGrade, d.risk ? { value: d.risk.value.grade, excerpt: d.risk.excerpt } : null,
      function (a, b) { return Number(a) === Number(b); });
    var riskLabel = p.riskLabel || (d.risk && d.risk.value.label) || null;

    var sched = Array.isArray(p.schedule) ? p.schedule : [];
    var barriersData = sched.length ? sched.map(function (s) { return s.barrier; }) : null;
    var barriers = merge(barriersData, d.barriers, function (a, b) { return a.join('-') === b.join('-'); });
    var barrierSeq = barriers.v ? barriers.v.join('-') : null;
    var lastBarrier = barriers.v ? barriers.v[barriers.v.length - 1] : null;
    var cycle = sched.length > 1 ? (sched[1].months - sched[0].months) : (sched.length === 1 ? sched[0].months : null);
    var lizard = sched.filter(function (s) { return s.lizard; })[0] || null;

    var protectedFull = Number(p.principalProtection) === 100;
    var totalRate = (rate.v !== null && months.v) ? Number(rate.v) * Number(months.v) / 12 : null;
    var years = months.v ? Number(months.v) / 12 : null;

    // 고난도 여부: 원금 20% 초과 손실 가능 + 구조 복잡 → 데이터로는 추정만 한다
    var highComplex = d.highComplexity ? true : (!protectedFull && Math.abs(Number(p.maxLossRate || 0)) > 20);
    flags.highComplexity = highComplex;
    flags.highComplexityFromDoc = !!d.highComplexity;

    /* 요약 */
    summary.push({ label: { ko: '상품명 · 코드', en: 'Product / code' },
      value: { ko: (name.v || '—') + (code.v ? ' (' + code.v + ')' : ''), en: (name.v || '—') + (code.v ? ' (' + code.v + ')' : '') },
      src: name.src, conflict: name.conflict || code.conflict });
    summary.push({ label: { ko: '기초자산', en: 'Underlyings' },
      value: { ko: (p.underlyings || []).join(' / ') || '—', en: (p.underlyings || []).join(' / ') || '—' },
      src: (p.underlyings || []).length ? 'data' : 'none' });
    summary.push({ label: { ko: '제시수익률(세전)', en: 'Headline yield (pre-tax)' },
      value: {
        ko: rate.v === null ? '—' : '연 ' + pct(rate.v, 2) + (totalRate !== null ? ' · 만기 보유 시 총 ' + pct(totalRate, 2) : ''),
        en: rate.v === null ? '—' : pct(rate.v, 2) + ' p.a.' + (totalRate !== null ? ' · ' + pct(totalRate, 2) + ' if held to maturity' : '')
      }, src: rate.src, conflict: rate.conflict, excerpt: rate.excerpt });
    summary.push({ label: { ko: '만기 · 평가주기', en: 'Maturity / valuation' },
      value: {
        ko: months.v ? months.v + '개월' + (years ? ' (' + num(years) + '년)' : '') + (cycle ? ' · ' + cycle + '개월마다 평가' : '') : '—',
        en: months.v ? months.v + ' months' + (cycle ? ' · valued every ' + cycle + ' months' : '') : '—'
      }, src: months.src, conflict: months.conflict });
    summary.push({ label: { ko: '조기상환 배리어', en: 'Barriers' },
      value: { ko: barrierSeq ? barrierSeq + ' (%)' : '—', en: barrierSeq ? barrierSeq + ' (%)' : '—' },
      src: barriers.src, conflict: barriers.conflict, excerpt: barriers.excerpt });
    summary.push({ label: { ko: '낙인(KI)', en: 'Knock-in' },
      value: { ko: ki.v === null ? '없음(노낙인)' : pct(ki.v), en: ki.v === null ? 'none' : pct(ki.v) },
      src: ki.v === null ? (p.knockIn === null ? 'data' : 'none') : ki.src, conflict: ki.conflict, excerpt: ki.excerpt });
    summary.push({ label: { ko: '원금지급률', en: 'Principal protection' },
      value: { ko: pct(p.principalProtection, 0) || '—', en: pct(p.principalProtection, 0) || '—' }, src: 'data' });
    summary.push({ label: { ko: '최대손실률', en: 'Maximum loss' },
      value: { ko: p.maxLossRate === null || p.maxLossRate === undefined ? '—' : pct(p.maxLossRate, 0), en: p.maxLossRate === null ? '—' : pct(p.maxLossRate, 0) },
      src: p.maxLossRate === null || p.maxLossRate === undefined ? 'none' : 'data' });
    summary.push({ label: { ko: '위험등급', en: 'Risk grade' },
      value: { ko: riskGrade.v ? riskGrade.v + '등급' + (riskLabel ? ' (' + riskLabel + ')' : '') : '—',
               en: riskGrade.v ? 'Grade ' + riskGrade.v : '—' },
      src: riskGrade.src, conflict: riskGrade.conflict, excerpt: riskGrade.excerpt });
    summary.push({ label: { ko: '청약기간', en: 'Subscription period' },
      value: { ko: p.offerStart && p.offerEnd ? p.offerStart + ' ~ ' + p.offerEnd : '—',
               en: p.offerStart && p.offerEnd ? p.offerStart + ' – ' + p.offerEnd : '—' },
      src: p.offerStart ? 'data' : 'none' });

    /* 01 상품의 내용 */
    lines1.push(L(
      '이 상품은 <b>' + (name.v || '(상품명 미확인)') + '</b>' + (code.v ? '(종목코드 ' + code.v + ')' : '') +
      '이며, ' + (p.type || 'ELS') + ' ' + (p.shape || '') + ' 구조의 파생결합증권입니다. 예금이나 채권이 아니라 <b>발행 증권사가 지급 의무를 지는 증권</b>입니다.',
      'This product is <b>' + (name.v || '(name not identified)') + '</b>' + (code.v ? ' (' + code.v + ')' : '') +
      ', a ' + (p.shape || '') + ' ' + (p.type || 'ELS') + ' derivative-linked security. It is not a deposit or a bond — <b>the issuing securities firm bears the payment obligation.</b>',
      name.src, { excerpt: name.excerpt, conflict: name.conflict }
    ));

    var uls = p.underlyings || [];
    if (uls.length) {
      lines1.push(L(
        '기초자산은 <b>' + uls.join(', ') + '</b>' + (uls.length > 1 ? ' 총 ' + uls.length + '개' : '') + '입니다.' +
        (uls.length > 1 ? ' 손익은 이 가운데 <b>가장 많이 떨어진 자산 하나</b>를 기준으로 정해집니다. 나머지가 아무리 올라도 판정에는 쓰이지 않습니다.' : ''),
        'The underlying' + (uls.length > 1 ? 's are <b>' + uls.join(', ') + '</b>. The outcome is judged on the <b>worst performer</b> alone — gains in the others do not count.' : ' is <b>' + uls[0] + '</b>.'),
        'data'
      ));
    } else {
      lines1.push(ASK('기초자산', 'The underlying asset'));
    }

    if (months.v) {
      lines1.push(L(
        '만기는 <b>' + months.v + '개월' + (years ? '(' + num(years) + '년)' : '') + '</b>이고' +
        (cycle ? ', <b>' + cycle + '개월마다</b> 조기상환 여부를 평가합니다' : '') +
        (barrierSeq ? '. 회차별 조기상환 배리어는 <b>' + barrierSeq + '(%)</b>로, 평가일 종가가 최초기준가격 대비 그 비율 이상이면 그 회차에 약정 수익과 함께 상환됩니다' : '') + '.',
        'Maturity is <b>' + months.v + ' months</b>' + (cycle ? ', valued every <b>' + cycle + ' months</b>' : '') +
        (barrierSeq ? '. The barriers are <b>' + barrierSeq + '(%)</b> of the initial reference price; meeting one redeems the note with the agreed return' : '') + '.',
        months.src, { excerpt: months.excerpt || barriers.excerpt, conflict: months.conflict || barriers.conflict }
      ));
    } else {
      lines1.push(ASK('만기와 조기상환 평가주기', 'Maturity and the valuation cycle'));
    }

    if (lizard) {
      lines1.push(L(
        '이 상품은 리자드 조건이 있습니다. ' + lizard.months + '개월 차 평가에서 배리어 ' + pct(lizard.barrier, 0) +
        '를 못 채우더라도 <b>' + pct(lizard.lizard, 0) + ' 이상</b>이면' +
        (lizard.lizardRate ? ' 연 ' + pct(lizard.lizardRate, 2) + '로' : '') + ' 상환됩니다.',
        'A lizard condition applies: at month ' + lizard.months + ', failing the ' + pct(lizard.barrier, 0) +
        ' barrier still redeems if the underlying is <b>at or above ' + pct(lizard.lizard, 0) + '</b>' +
        (lizard.lizardRate ? ' at ' + pct(lizard.lizardRate, 2) + ' p.a.' : '') + '.',
        'data'
      ));
    }

    if (rate.v !== null) {
      lines1.push(L(
        '조건을 채웠을 때 적용되는 수익률은 <b>세전 연 ' + pct(rate.v, 2) + '</b>입니다' +
        (totalRate !== null ? ', 만기까지 보유해 마지막 회차에 상환되면 <b>총 ' + pct(totalRate, 2) + '</b>입니다' : '') +
        '. 이 수익률이 <b>받으실 수 있는 최대치</b>이며, 기초자산이 아무리 많이 올라도 그 이상은 받지 못합니다.',
        'If the conditions are met the return is <b>' + pct(rate.v, 2) + ' p.a. before tax</b>' +
        (totalRate !== null ? ', or <b>' + pct(totalRate, 2) + ' in total</b> if held to the final date' : '') +
        '. That is the <b>maximum</b> — however far the underlying rises, the payout does not exceed it.',
        rate.src, { excerpt: rate.excerpt, conflict: rate.conflict }
      ));
      // 만기 총 수익률은 어디서 읽어온 값이 아니라 이 화면이 곱한 값이다.
      // 위 문장이 '투자설명서' 배지를 달고 있어도 이 숫자만큼은 계산이라고 밝혀 둔다.
      if (totalRate !== null) {
        lines1.push(L(
          '(만기 총 수익률 ' + pct(totalRate, 2) + '는 연 ' + pct(rate.v, 2) + ' × ' + months.v + '개월 ÷ 12로 계산한 값입니다. 설명서 표기값과 다르면 설명서가 우선합니다.)',
          '(The ' + pct(totalRate, 2) + ' total is ' + pct(rate.v, 2) + ' × ' + months.v + ' ÷ 12. Where the prospectus states a different figure, the prospectus prevails.)',
          'calc'
        ));
      }
    } else {
      lines1.push(ASK('제시수익률', 'The headline yield'));
    }

    if (protectedFull) {
      lines1.push(L(
        '이 상품은 <b>원금지급형(ELB)</b>입니다. 만기까지 보유하시면 조건을 못 채우더라도 원금 100%는 지급됩니다. 다만 <b>수익이 0%일 수 있고</b>, 중도상환하시면 원금 손실이 날 수 있습니다.',
        'This is a <b>principal-protected note (ELB)</b>: held to maturity, 100% of principal is repaid even if the conditions fail. But <b>the return may be 0%</b>, and exiting early can still lose principal.',
        'data'
      ));
    } else {
      lines1.push(L(
        '이 상품은 <b>원금이 보장되지 않습니다.</b> 원금지급률은 ' + (pct(p.principalProtection, 0) || '0%') + '입니다.',
        'This product is <b>not principal-protected</b>; the guaranteed portion is ' + (pct(p.principalProtection, 0) || '0%') + '.',
        'data'
      ));
    }

    lines1.push(L(
      '기초자산을 직접 사시는 것이 아니므로 <b>배당이나 의결권은 없습니다.</b>',
      'You do not own the underlying, so there are <b>no dividends and no voting rights.</b>',
      'law'
    ));

    /* 02 위험 */
    if (!protectedFull) {
      lines2.push(L(
        '최대손실률은 <b>' + (pct(p.maxLossRate, 0) || '-100%') + '</b>입니다. 최악의 경우 <span class="em">투자원금 전부를 잃을 수 있습니다.</span>',
        'The maximum loss is <b>' + (pct(p.maxLossRate, 0) || '-100%') + '</b>. In the worst case <span class="em">the entire principal can be lost.</span>',
        p.maxLossRate === null || p.maxLossRate === undefined ? 'none' : 'data'
      ));

      if (ki.v !== null && lastBarrier !== null) {
        lines2.push(L(
          '손실이 나는 경우는 이렇습니다 — 만기 전에 기초자산 중 하나라도 최초기준가격의 <b>' + pct(ki.v, 0) + ' 아래로 한 번이라도 내려간 적이 있고</b>, 만기 평가에서도 <b>' + pct(lastBarrier, 0) + ' 이상을 회복하지 못하면</b> 그 하락률만큼 손실이 확정됩니다. 예를 들어 만기에 40% 떨어져 있으면 원금의 40%를 잃습니다.',
          'A loss arises when the underlying <b>falls below ' + pct(ki.v, 0) + '</b> of its initial price at any time and <b>fails to recover to ' + pct(lastBarrier, 0) + '</b> at maturity: the loss then equals the fall. A 40% fall means losing 40% of principal.',
          ki.src === 'doc' || barriers.src === 'doc' ? 'doc' : 'data',
          { excerpt: ki.excerpt || barriers.excerpt, conflict: ki.conflict || barriers.conflict }
        ));
      } else if (ki.v === null && lastBarrier !== null) {
        lines2.push(L(
          '이 상품은 <b>낙인이 없습니다.</b> 중간에 아무리 떨어져도 보지 않고, <b>만기 평가일 종가만</b> 봅니다. 만기에 최초기준가격의 <b>' + pct(lastBarrier, 0) + '을 밑돌면</b> 그 하락률만큼 손실이 확정됩니다.',
          'There is <b>no knock-in</b>: only the closing price on the final valuation date matters. If it is below <b>' + pct(lastBarrier, 0) + '</b> of the initial price, the loss equals the fall.',
          'data'
        ));
      } else {
        lines2.push(ASK('손실이 발생하는 조건(낙인·만기 배리어)', 'The loss condition (knock-in and final barrier)'));
      }
    } else {
      lines2.push(L(
        '만기까지 보유하면 원금은 지급되지만, <b>수익은 조건부</b>입니다. 조건을 못 채우면 수익이 0%일 수 있습니다.',
        'Principal is repaid at maturity, but <b>the return is conditional</b> and may be 0%.',
        'data'
      ));
    }

    lines2.push(L(
      '<b>발행사 신용위험</b>이 있습니다. 조건을 모두 충족하더라도 발행 증권사가 지급 불능 상태가 되면 원리금을 받지 못할 수 있습니다. 이 상품은 <b>예금자보호 대상이 아닙니다.</b>',
      'There is <b>issuer credit risk</b>: even if every condition is met, payment may fail if the issuer becomes insolvent. The product is <b>not covered by depositor protection.</b>',
      'law'
    ));
    lines2.push(L(
      '만기 전에 돈을 찾으시면 <b>중도상환</b>이 되는데, 그때는 그 시점의 공정가액에서 중도상환 수수료를 뺀 금액만 받습니다. <b>원금을 크게 밑돌 수 있습니다.</b>',
      'Exiting before maturity pays fair value minus an early-redemption fee, which <b>can be far below the amount invested.</b>',
      'law'
    ));
    lines2.push(L(
      '거래소에 상장된 상품이 아니어서 원하시는 시점에 시장가로 파실 수 없습니다(<b>유동성 위험</b>).',
      'The note is not exchange-traded, so it cannot be sold at a market price on demand (<b>liquidity risk</b>).',
      'law'
    ));
    if (uls.length > 1) {
      lines2.push(L(
        '기초자산이 ' + uls.length + '개이므로, <b>하나만 크게 떨어져도</b> 나머지와 무관하게 손실 판정이 납니다. 기초자산 수가 많을수록 손실 확률이 올라갑니다.',
        'With ' + uls.length + ' underlyings, <b>one large fall is enough</b> to trigger a loss regardless of the others. More underlyings means a higher chance of loss.',
        'data'
      ));
    }

    /* 03 위험등급 */
    if (riskGrade.v) {
      lines3.push(L(
        '이 상품의 위험등급은 <b>' + riskGrade.v + '등급' + (riskLabel ? '(' + riskLabel + ')' : '') + '</b>입니다. 위험등급은 1등급이 가장 위험하고 6등급이 가장 안전한 6단계이며, 이 상품은 그중 ' + riskGrade.v + '번째입니다.',
        'The risk grade is <b>' + riskGrade.v + '</b> on a scale where 1 is the riskiest and 6 the safest.',
        riskGrade.src, { excerpt: riskGrade.excerpt, conflict: riskGrade.conflict }
      ));
      if (riskGrade.conflict) {
        lines3.push(L(
          '<b>확인 필요</b> — 상품 데이터의 위험등급(' + riskGrade.other + '등급)과 첨부한 설명서의 등급(' + riskGrade.v + '등급)이 다릅니다. 설명서 표기를 기준으로 정정한 뒤 안내하십시오.',
          '<b>Check</b> — the product data says grade ' + riskGrade.other + ' but the attached document says ' + riskGrade.v + '. Use the document and correct the record.',
          'none'
        ));
      }
    } else {
      lines3.push(ASK('위험등급', 'The risk grade'));
    }
    lines3.push(L(
      '고객님의 투자성향 진단 결과보다 이 상품의 위험등급이 높으면 <b>부적합</b>합니다. 그 경우 권유해 드릴 수 없고, 그래도 청약하시려면 부적합 사실을 확인하는 절차를 거쳐야 합니다.',
      'If this grade is riskier than your assessed profile the product is <b>unsuitable</b>: it cannot be recommended, and subscribing anyway requires the unsuitability confirmation process.',
      'law'
    ));

    /* 04 수수료·비용·세금 */
    lines4.push(L(
      '판매와 관련한 비용은 제시된 조건에 반영되어 있습니다. 다만 <b>중도상환 수수료</b>는 별도로 부과됩니다.',
      'Distribution costs are embedded in the quoted terms; an <b>early-redemption fee</b> is charged separately.',
      'law'
    ));
    lines4.push(ASK('중도상환 수수료율', 'The early-redemption fee rate'));
    lines4.push(L(
      '수익이 나면 <b>배당소득</b>으로 분류되어 <b>15.4%</b>(소득세 14% + 지방소득세 1.4%)가 원천징수되고, 금융소득종합과세 대상에 포함됩니다.',
      'Gains are taxed as <b>dividend income</b> at <b>15.4%</b> (14% income tax + 1.4% local tax) and count toward aggregate financial-income taxation.',
      'law'
    ));

    /* 05 계약의 해제·해지 */
    if (p.offerStart && p.offerEnd) {
      lines5.push(L(
        '청약기간은 <b>' + p.offerStart + ' ~ ' + p.offerEnd + '</b>입니다. 이 기간 안에는 청약을 철회하고 청약금을 돌려받으실 수 있습니다.',
        'The subscription period is <b>' + p.offerStart + ' – ' + p.offerEnd + '</b>; within it you may withdraw and have your money returned.',
        'data'
      ));
    } else {
      lines5.push(ASK('청약기간', 'The subscription period'));
    }
    if (highComplex) {
      lines5.push(L(
        '이 상품은 <b>고난도금융투자상품</b>' + (flags.highComplexityFromDoc ? '입니다(설명서 표기 확인).' : '에 해당할 수 있습니다(원금의 20%를 넘는 손실이 가능한 구조).') +
        ' 해당한다면 계약서류를 받으신 날 또는 계약을 맺은 날부터 <b>7일 이내에 청약을 철회</b>하실 수 있습니다.',
        'This is' + (flags.highComplexityFromDoc ? '' : ' likely') + ' a <b>highly complex financial investment product</b>, which carries a <b>7-day right of withdrawal</b> from receipt of the contract documents.',
        flags.highComplexityFromDoc ? 'doc' : 'calc',
        { excerpt: d.highComplexity ? d.highComplexity.excerpt : null,
          note: flags.highComplexityFromDoc ? null : { ko: '해당 여부는 상품 설명서 표기로 최종 확인하십시오.', en: 'Confirm the classification against the product document.' } }
      ));
    }
    lines5.push(L(
      '발행된 뒤에는 해지가 아니라 <b>중도상환 신청</b>만 가능하고, 신청할 수 있는 날과 지급일은 상품마다 정해져 있습니다.',
      'After issuance there is no termination — only an <b>early-redemption request</b> on the dates fixed for this product.',
      'law'
    ));
    lines5.push(L(
      '판매 과정에서 설명의무 등을 위반한 계약은 <b>위법계약해지권</b>을 행사하실 수 있습니다 — 계약일로부터 5년 이내이면서, 위반 사실을 아신 날로부터 1년 이내입니다.',
      'Where sales rules were breached you may exercise the <b>right to terminate an unlawful contract</b> — within 5 years of the contract and 1 year of learning of the breach.',
      'law'
    ));

    /* 06 서류·절차 */
    lines6.push(L(
      '<b>교부</b> — 투자설명서' + (highComplex ? ', 핵심설명서' : '') + ', 상품 요약 설명 자료, 청약서 사본을 드립니다.',
      '<b>Documents</b> — the prospectus' + (highComplex ? ', the key-information document' : '') + ', the product summary and a copy of the subscription form.',
      'law'
    ));
    if (highComplex) {
      lines6.push(L(
        '<b>녹취</b> — 고난도금융투자상품을 일반투자자에게 판매하므로 설명 과정을 녹취합니다. 65세 이상 고령투자자·부적합투자자에게 파생결합증권을 판매할 때도 녹취 대상입니다.',
        '<b>Recording</b> — selling a highly complex product to a retail client requires recording the sales process, as does selling derivative-linked securities to clients aged 65+ or where the product is unsuitable.',
        'law'
      ));
      lines6.push(L(
        '<b>숙려기간</b> — <b>2영업일 이상</b> 숙려기간을 드리고, 그 기간이 끝난 뒤 청약을 확정하실 의사를 다시 확인합니다. 숙려기간 중에는 언제든 철회하실 수 있습니다.',
        '<b>Cooling-off</b> — you are given <b>at least 2 business days</b>, after which we confirm again that you wish to proceed. You may withdraw freely during that period.',
        'law'
      ));
    }
    lines6.push(L(
      '<b>이해 확인</b> — 설명을 들으시고 이해하셨다는 사실을 서명·기명날인 또는 녹취로 남깁니다. 이 확인까지 마쳐야 설명의무를 이행한 것이 됩니다.',
      '<b>Confirmation</b> — your understanding is recorded by signature, seal or voice recording. The duty is discharged only once that is done.',
      'law'
    ));
    lines6.push(L(
      '<b>고령투자자</b> — 만 65세 이상이시면 지정인 연락처 확인 등 고령투자자 보호 절차를 함께 진행합니다.',
      '<b>Clients aged 65+</b> — additional protections apply, including confirming a designated contact person.',
      'law'
    ));

    /* 체크리스트 */
    var checklist = [];
    if (!protectedFull) {
      checklist.push({ ko: '원금 전액을 잃을 수 있다는 점을 이해하셨습니까?', en: 'Do you understand you could lose your entire principal?' });
    } else {
      checklist.push({ ko: '만기까지 보유해야 원금이 지급되고, 수익은 0%일 수 있다는 점을 이해하셨습니까?', en: 'Do you understand principal is repaid only at maturity and the return may be 0%?' });
    }
    if (barrierSeq) {
      checklist.push({ ko: '조기상환 배리어가 ' + barrierSeq + '(%)라는 점을 확인하셨습니까?', en: 'Have you confirmed the barriers are ' + barrierSeq + '(%)?' });
    }
    if (ki.v !== null) {
      checklist.push({ ko: '기초자산이 한 번이라도 ' + pct(ki.v, 0) + ' 아래로 내려가면 손실 위험이 생긴다는 점을 이해하셨습니까?', en: 'Do you understand a fall below ' + pct(ki.v, 0) + ' at any time creates loss risk?' });
    } else if (lastBarrier !== null) {
      checklist.push({ ko: '낙인은 없지만 만기에 ' + pct(lastBarrier, 0) + ' 미만이면 손실이 난다는 점을 이해하셨습니까?', en: 'Do you understand that with no knock-in, a final level below ' + pct(lastBarrier, 0) + ' still means a loss?' });
    }
    if (rate.v !== null) {
      checklist.push({ ko: '연 ' + pct(rate.v, 2) + '가 최대 수익이며 그 이상은 없다는 점을 이해하셨습니까?', en: 'Do you understand ' + pct(rate.v, 2) + ' p.a. is the maximum return?' });
    }
    if (uls.length > 1) {
      checklist.push({ ko: '손익이 ' + uls.join(', ') + ' 중 가장 많이 떨어진 자산으로 정해진다는 점을 이해하셨습니까?', en: 'Do you understand the outcome follows the worst performer among ' + uls.join(', ') + '?' });
    }
    checklist.push({ ko: '만기 전에 찾으면 원금보다 크게 적은 금액을 받을 수 있다는 점을 이해하셨습니까?', en: 'Do you understand exiting early can return far less than you invested?' });
    checklist.push({ ko: '발행 증권사가 지급 불능이 되면 조건을 채워도 못 받을 수 있다는 점을 이해하셨습니까?', en: 'Do you understand issuer insolvency can prevent payment?' });
    checklist.push({ ko: '예금자보호 대상이 아니라는 점을 이해하셨습니까?', en: 'Do you understand this is not covered by depositor protection?' });
    if (riskGrade.v) {
      checklist.push({ ko: '위험등급 ' + riskGrade.v + '등급이 고객님 투자성향에 맞는지 확인하셨습니까?', en: 'Have you confirmed risk grade ' + riskGrade.v + ' matches your profile?' });
    }
    if (highComplex) {
      checklist.push({ ko: '녹취와 2영업일 숙려기간 절차에 대해 안내받으셨습니까?', en: 'Have the recording and 2-business-day cooling-off procedures been explained?' });
    }
    checklist.push({ ko: '투자설명서' + (highComplex ? '와 핵심설명서' : '') + '를 교부받으셨습니까?', en: 'Have you received the prospectus' + (highComplex ? ' and key-information document' : '') + '?' });

    return {
      summary: summary,
      sections: [
        { no: '01', title: { ko: '상품의 내용', en: 'Product content' }, lines: lines1 },
        { no: '02', title: { ko: '투자에 따르는 위험', en: 'Investment risks' }, lines: lines2 },
        { no: '03', title: { ko: '위험등급과 그 의미', en: 'Risk grade' }, lines: lines3 },
        { no: '04', title: { ko: '수수료 · 비용 · 세금', en: 'Fees and tax' }, lines: lines4 },
        { no: '05', title: { ko: '계약의 해제 · 해지', en: 'Cancellation and termination' }, lines: lines5 },
        { no: '06', title: { ko: '교부 서류 · 판매 절차', en: 'Documents and procedure' }, lines: lines6 }
      ],
      checklist: checklist,
      flags: flags
    };
  }

  /* ---------- 펀드 ---------- */

  function fundScript(p, doc) {
    var d = doc || {};
    var overseas = p.region === 'overseas';
    var lines1 = [], lines2 = [], lines3 = [], lines4 = [], lines5 = [], lines6 = [];
    var summary = [];
    var flags = {};

    var name = merge(p.name, d.productName);
    var manager = merge(p.manager, d.manager);
    var riskGrade = merge(p.riskGrade, d.risk ? { value: d.risk.value.grade, excerpt: d.risk.excerpt } : null,
      function (a, b) { return Number(a) === Number(b); });
    var riskLabel = p.riskLabel || (d.risk && d.risk.value.label) || null;
    var totalExpense = merge(p.totalExpense, d.totalExpense, function (a, b) { return Math.abs(a - b) < 0.005; });
    var feeFront = merge(p.feeFront, d.feeFront, function (a, b) { return Math.abs(a - b) < 0.005; });
    var redemptionFee = merge(p.redemptionFee, d.redemptionFee);
    var pricing = merge(p.redemptionPricing, d.redemptionPricing);
    var payout = merge(p.redemptionPayout, d.redemptionPayout);
    var invests = merge(p.invests, d.invests);
    var benchmark = merge(p.benchmark, d.benchmark);
    var hedge = merge(p.hedge, d.hedge, function (a, b) { return String(a) === String(b); });
    var highComplex = d.highComplexity ? true : !!p.highComplexity;
    flags.highComplexity = highComplex;
    flags.highComplexityFromDoc = !!d.highComplexity;

    // 보수 내역은 상품 데이터에만 있는 값이다. 총보수 숫자를 설명서에서 읽어온 경우
    // 내역까지 같은 줄에 붙이면 '투자설명서' 배지 아래 데이터 값이 섞여 출처가 흐려진다.
    var breakdown = (totalExpense.src === 'data' && p.expenseBreakdown && Object.keys(p.expenseBreakdown).length)
      ? Object.keys(p.expenseBreakdown).map(function (k) { return k + ' ' + pct(p.expenseBreakdown[k], 2); }).join(' · ')
      : null;

    summary.push({ label: { ko: '펀드명', en: 'Fund' }, value: { ko: name.v || '—', en: name.v || '—' }, src: name.src, conflict: name.conflict, excerpt: name.excerpt });
    summary.push({ label: { ko: '운용사', en: 'Manager' }, value: { ko: manager.v || '—', en: manager.v || '—' }, src: manager.src, excerpt: manager.excerpt });
    var typeEn = { '주식형': 'Equity', '채권형': 'Bond', '혼합형': 'Balanced', '재간접': 'Fund of funds', 'MMF': 'MMF' }[p.assetType] || p.assetType || '—';
    summary.push({ label: { ko: '구분', en: 'Category' },
      value: { ko: (overseas ? '해외' : '국내') + ' · ' + (p.assetType || '—') + (hedge.v ? ' · ' + (hedge.v === 'H' ? '환헤지형' : '환노출형') : ''),
               en: (overseas ? 'Overseas' : 'Domestic') + ' · ' + typeEn + (hedge.v ? ' · ' + (hedge.v === 'H' ? 'hedged' : 'unhedged') : '') },
      src: 'data' });
    summary.push({ label: { ko: '주요 투자대상', en: 'Invests in' }, value: { ko: invests.v || '—', en: invests.v || '—' }, src: invests.src, excerpt: invests.excerpt });
    summary.push({ label: { ko: '위험등급', en: 'Risk grade' },
      value: { ko: riskGrade.v ? riskGrade.v + '등급' + (riskLabel ? ' (' + riskLabel + ')' : '') : '—', en: riskGrade.v ? 'Grade ' + riskGrade.v : '—' },
      src: riskGrade.src, conflict: riskGrade.conflict, excerpt: riskGrade.excerpt });
    summary.push({ label: { ko: '총보수(연)', en: 'Total expenses (p.a.)' },
      value: { ko: totalExpense.v === null ? '—' : pct(totalExpense.v, 2) + (breakdown ? ' (' + breakdown + ')' : ''), en: totalExpense.v === null ? '—' : pct(totalExpense.v, 2) },
      src: totalExpense.src, conflict: totalExpense.conflict, excerpt: totalExpense.excerpt });
    summary.push({ label: { ko: '선취판매수수료', en: 'Front-end load' },
      value: { ko: feeFront.v === null ? (p.feeFront === null ? '없음' : '—') : pct(feeFront.v, 2), en: feeFront.v === null ? (p.feeFront === null ? 'none' : '—') : pct(feeFront.v, 2) },
      src: feeFront.v === null && p.feeFront === null ? 'data' : feeFront.src, conflict: feeFront.conflict, excerpt: feeFront.excerpt });
    summary.push({ label: { ko: '환매수수료', en: 'Redemption fee' },
      value: { ko: redemptionFee.v || (p.redemptionFee === null ? '없음' : '—'), en: redemptionFee.v || (p.redemptionFee === null ? 'none' : '—') },
      src: redemptionFee.v === null && p.redemptionFee === null ? 'data' : redemptionFee.src, conflict: redemptionFee.conflict, excerpt: redemptionFee.excerpt });
    // 설명서가 기준가와 지급일을 한 문장에 적어 두면 같은 문장이 두 번 잡힌다 — 한 번만 쓴다
    var payoutExtra = (payout.v && payout.v !== pricing.v) ? payout.v : null;
    summary.push({ label: { ko: '환매 기준가 · 지급', en: 'Redemption pricing / payment' },
      value: { ko: (pricing.v || '—') + (payoutExtra ? ' · ' + payoutExtra : ''), en: (pricing.v || '—') + (payoutExtra ? ' · ' + payoutExtra : '') },
      src: pricing.src === 'none' && payout.src === 'none' ? 'none' : (pricing.src === 'doc' || payout.src === 'doc' ? 'doc' : 'data'),
      excerpt: pricing.excerpt || payout.excerpt });

    /* 01 상품의 내용 */
    lines1.push(L(
      '이 상품은 <b>' + (name.v || '(펀드명 미확인)') + '</b>' + (manager.v ? ', 운용사는 <b>' + noDot(manager.v) + '</b>' : '') +
      '입니다. 여러 투자자의 자금을 모아 운용사가 굴리고 그 결과를 좌수만큼 나누는 <b>실적배당 상품</b>이며, 확정금리가 아닙니다.',
      'This is <b>' + (name.v || '(fund name not identified)') + '</b>' + (manager.v ? ', managed by <b>' + noDot(manager.v) + '</b>' : '') +
      '. It is a <b>performance-based</b> pooled fund, not a fixed-rate product.',
      name.src, { excerpt: name.excerpt, conflict: name.conflict }
    ));
    lines1.push(L(
      '운용은 운용사가, 판매와 설명은 저희가, 자산 보관은 신탁업자가 나누어 맡습니다. <b>판매사인 저희가 수익을 보장하지 않습니다.</b>',
      'Management, distribution and custody are separated. <b>We, as distributor, do not guarantee any return.</b>',
      'law'
    ));
    if (invests.v) {
      lines1.push(L(
        '이 펀드가 투자하는 대상은 <b>' + noDot(invests.v) + '</b>입니다' + (benchmark.v ? '. 비교지수는 <b>' + noDot(benchmark.v) + '</b>입니다' : '') + '.',
        'It invests in <b>' + noDot(invests.v) + '</b>' + (benchmark.v ? ', benchmarked to <b>' + noDot(benchmark.v) + '</b>' : '') + '.',
        invests.src, { excerpt: invests.excerpt, conflict: invests.conflict }
      ));
    } else {
      lines1.push(ASK('주요 투자대상', 'The fund’s main investments'));
    }
    if (overseas) {
      if (hedge.v === 'H') {
        lines1.push(L(
          '이 클래스는 <b>환헤지형</b>입니다. 환율 변동을 줄이려고 헤지를 하지만, <b>헤지 비용이 수익률을 깎고</b> 양국 금리차에 따라 그 비용이 커질 수 있으며, 헤지한 비율만큼만 방어됩니다.',
          'This is the <b>currency-hedged</b> class. Hedging reduces FX swings but <b>costs return</b>, grows more expensive with the interest-rate gap, and only protects the hedged portion.',
          hedge.src, { excerpt: hedge.excerpt, conflict: hedge.conflict }
        ));
      } else if (hedge.v === 'UH') {
        lines1.push(L(
          '이 클래스는 <b>환노출형(언헤지)</b>입니다. 환율 변동이 그대로 손익에 반영됩니다.',
          'This is the <b>unhedged</b> class: currency moves flow straight into your return.',
          hedge.src, { excerpt: hedge.excerpt, conflict: hedge.conflict }
        ));
      } else {
        lines1.push(ASK('환헤지 여부(환헤지형 / 환노출형)', 'Whether the class is hedged or unhedged'));
      }
    }
    lines1.push(L(
      '기준가격은 매 영업일 산출되고, 매수·환매는 신청하신 시점의 기준가가 아니라 <b>펀드가 정해 둔 적용 기준가</b>로 체결됩니다.',
      'The NAV is struck each business day, and orders execute at the fund’s <b>designated pricing date</b>, not the NAV at the time of the request.',
      'law'
    ));
    lines1.push(L(
      '<b>과거 수익률은 미래 수익률을 보장하지 않습니다.</b>',
      '<b>Past performance does not guarantee future returns.</b>',
      'law'
    ));

    /* 02 위험 */
    lines2.push(L(
      '<span class="em">원금 손실이 가능하고, 손실은 전부 투자자에게 귀속됩니다.</span> 이 상품은 <b>예금자보호 대상이 아닙니다.</b>',
      '<span class="em">Principal may be lost and the loss falls entirely on you.</span> The fund is <b>not covered by depositor protection.</b>',
      'law'
    ));
    lines2.push(L(
      '<b>시장위험</b> — 편입된 자산의 가격이 떨어지면 기준가격이 하락합니다. <b>신용위험</b> — 편입 채권 발행자가 부도나거나 신용등급이 떨어지면 손실이 납니다. <b>유동성위험</b> — 대량 환매나 시장 경색 때는 환매가 연기되거나 일부만 지급될 수 있습니다.',
      '<b>Market risk</b> — the NAV falls with the holdings. <b>Credit risk</b> — issuer default or downgrade causes losses. <b>Liquidity risk</b> — heavy redemptions or market stress can defer or partially pay a redemption.',
      'law'
    ));
    if (overseas) {
      lines2.push(L(
        '<b>환율변동 위험</b> — 현지에서 수익이 나도 원화가 강세면 원화 기준으로는 손실이 날 수 있습니다.' +
        (hedge.v === 'H' ? ' 환헤지형이라도 <b>헤지 비용과 잔여 환위험</b>은 남습니다.' : ''),
        '<b>Currency risk</b> — a local gain can still be a won loss.' + (hedge.v === 'H' ? ' Even hedged, <b>hedging costs and residual exposure</b> remain.' : ''),
        'law'
      ));
      lines2.push(L(
        '<b>국가 · 정치 · 제도 위험</b> — 투자 대상국의 규제나 과세제도가 바뀌거나 자본 통제·송금 제한이 생길 수 있습니다. 신흥국일수록 큽니다. 또 현지 휴장과 결제 주기 때문에 <b>기준가 반영과 환매가 국내펀드보다 느립니다.</b>',
        '<b>Country and regulatory risk</b> — rule, tax or capital-control changes, greater in emerging markets. Local holidays and settlement cycles also make <b>NAV updates and redemption slower than a domestic fund.</b>',
        'law'
      ));
    }
    if (p.derivatives) {
      lines2.push(L(
        '이 펀드는 <b>파생상품을 활용</b>합니다. 기초자산 변동폭보다 큰 손실이 날 수 있고, 권유 없이 가입하시더라도 <b>적정성 원칙</b>에 따라 적정 여부를 확인해 드려야 합니다.',
        'The fund <b>uses derivatives</b>: losses can exceed the move in the underlying, and the <b>appropriateness rule</b> applies even without a recommendation.',
        'data'
      ));
    }
    lines2.push(L(
      '<b>운용 위험</b> — 같은 유형이라도 운용사의 판단에 따라 성과가 달라집니다.',
      '<b>Manager risk</b> — results differ by the manager’s decisions even within the same category.',
      'law'
    ));

    /* 03 위험등급 */
    if (riskGrade.v) {
      lines3.push(L(
        '이 펀드의 위험등급은 <b>' + riskGrade.v + '등급' + (riskLabel ? '(' + riskLabel + ')' : '') + '</b>입니다. 1등급이 가장 위험하고 6등급이 가장 안전한 6단계 중 ' + riskGrade.v + '번째입니다.',
        'The risk grade is <b>' + riskGrade.v + '</b> on a 1 (riskiest) to 6 (safest) scale.',
        riskGrade.src, { excerpt: riskGrade.excerpt, conflict: riskGrade.conflict }
      ));
      if (riskGrade.conflict) {
        lines3.push(L(
          '<b>확인 필요</b> — 상품 데이터(' + riskGrade.other + '등급)와 첨부 설명서(' + riskGrade.v + '등급)의 위험등급이 다릅니다. 설명서를 기준으로 정정하십시오.',
          '<b>Check</b> — product data says grade ' + riskGrade.other + ', the attached document says ' + riskGrade.v + '. Use the document.',
          'none'
        ));
      }
    } else {
      lines3.push(ASK('위험등급', 'The risk grade'));
    }
    lines3.push(L(
      '고객님 투자성향보다 위험등급이 높으면 <b>부적합</b>합니다. 권유해 드릴 수 없고, 그래도 가입하시려면 부적합 확인 절차를 거칩니다.',
      'A grade riskier than your profile is <b>unsuitable</b>: it cannot be recommended, and subscribing anyway requires the confirmation process.',
      'law'
    ));

    /* 04 수수료·비용·세금 */
    if (feeFront.v !== null) {
      lines4.push(L('가입하실 때 <b>선취판매수수료 ' + pct(feeFront.v, 2) + '</b>를 떼고 나머지 금액이 투자됩니다.',
        'A <b>front-end load of ' + pct(feeFront.v, 2) + '</b> is deducted at purchase.',
        feeFront.src, { excerpt: feeFront.excerpt, conflict: feeFront.conflict }));
    } else if (p.feeFront === null) {
      lines4.push(L('이 클래스는 선취판매수수료가 없습니다. 대신 보수가 매년 차감됩니다.',
        'This class has no front-end load; fees are taken annually instead.', 'data'));
    } else {
      lines4.push(ASK('선취판매수수료', 'The front-end load'));
    }
    if (totalExpense.v !== null) {
      lines4.push(L(
        '보유하시는 동안 <b>총보수 연 ' + pct(totalExpense.v, 2) + '</b>' + (breakdown ? '(' + breakdown + ')' : '') +
        '가 <b>매일 순자산에서 차감되어 기준가격에 이미 반영</b>됩니다. 따로 청구되지 않을 뿐, 수익률을 그만큼 깎는 비용입니다.' +
        (p.otherCost && totalExpense.src === 'data' ? ' 여기에 기타비용 연 ' + pct(p.otherCost, 2) + '가 더해집니다.' : ''),
        'While held, <b>total expenses of ' + pct(totalExpense.v, 2) + ' p.a.</b> are <b>deducted daily from net assets and already reflected in the NAV</b> — not billed separately, but they reduce your return.' +
        (p.otherCost && totalExpense.src === 'data' ? ' Other costs of ' + pct(p.otherCost, 2) + ' p.a. are added.' : ''),
        totalExpense.src, { excerpt: totalExpense.excerpt, conflict: totalExpense.conflict }
      ));
    } else {
      lines4.push(ASK('총보수', 'The total expense ratio'));
    }
    if (redemptionFee.v) {
      lines4.push(L('<b>환매수수료</b> — ' + noDot(redemptionFee.v) + '. 이 기간 안에 환매하시면 이익의 일부를 돌려받지 못합니다.',
        '<b>Redemption fee</b> — ' + noDot(redemptionFee.v) + '.',
        redemptionFee.src, { excerpt: redemptionFee.excerpt, conflict: redemptionFee.conflict }));
    } else if (p.redemptionFee === null) {
      lines4.push(L('환매수수료는 없습니다.', 'There is no redemption fee.', 'data'));
    } else {
      lines4.push(ASK('환매수수료', 'The redemption fee'));
    }
    lines4.push(L(
      overseas
        ? '세금은 <b>이익 전액이 배당소득</b>으로 <b>15.4%</b> 과세되고 금융소득종합과세 대상입니다. 국내펀드와 달리 <b>주식 매매차익과 환차익도 과세</b>됩니다. 해외주식을 직접 사실 때(양도소득 분리과세)와 계산 방식이 달라, 어느 쪽이 유리한지는 소득 상황에 따라 다릅니다.'
        : '세금은 분배금과 환매 이익이 <b>배당소득</b>으로 <b>15.4%</b> 과세됩니다. 다만 <b>국내 상장주식의 매매·평가차익은 과세되지 않습니다.</b>',
      overseas
        ? 'The <b>entire gain is taxed as dividend income at 15.4%</b> and counts toward aggregate financial-income taxation; unlike a domestic fund, <b>equity and FX gains are taxable</b>. Direct overseas share investment is taxed differently, and which is better depends on your circumstances.'
        : 'Distributions and redemption gains are taxed as <b>dividend income at 15.4%</b>, but <b>gains on listed Korean equities are exempt.</b>',
      'law'
    ));

    /* 05 환매·해지 */
    if (pricing.v || payout.v) {
      lines5.push(L(
        '환매는 <b>' + noDot(pricing.v || payout.v) + '</b>' + (payoutExtra ? ' <b>' + noDot(payoutExtra) + '</b>' : '') +
        ' — 신청하신 날 바로 나오지 않습니다.',
        'Redemption: <b>' + noDot(pricing.v || payout.v) + '</b>' + (payoutExtra ? ' <b>' + noDot(payoutExtra) + '</b>' : '') +
        ' — it is not same-day money.',
        pricing.src === 'doc' || payout.src === 'doc' ? 'doc' : 'data',
        { excerpt: pricing.excerpt || payout.excerpt, conflict: pricing.conflict || payout.conflict }
      ));
    } else {
      lines5.push(ASK('환매 기준가 적용일과 지급일', 'The redemption pricing and payment dates'));
    }
    lines5.push(L(
      '환매를 신청하신 뒤에는 <b>취소가 어렵고</b>, 신청 시점에는 받으실 금액이 확정되지 않습니다.' +
      (overseas ? ' 기준가 적용일과 지급일 사이의 <b>환율 변동은 고객님이 부담</b>하십니다.' : ''),
      'A redemption request is <b>difficult to cancel</b> and the amount is not fixed when it is made.' +
      (overseas ? ' <b>You bear the currency move</b> between pricing and payment.' : ''),
      'law'
    ));
    lines5.push(L(
      '집합투자규약에 정한 사유' + (overseas ? '(현지 시장 폐쇄·자본 통제 등)' : '') + '가 생기면 <b>환매가 연기</b>될 수 있습니다.',
      'Redemption may be <b>deferred</b> where the fund rules provide for it' + (overseas ? ' (market closures, capital controls)' : '') + '.',
      'law'
    ));
    if (highComplex) {
      lines5.push(L(
        '이 펀드는 <b>고난도금융투자상품</b>이므로 계약서류를 받으신 날 또는 계약일부터 <b>7일 이내 청약철회</b>가 가능합니다.',
        'As a <b>highly complex product</b>, it carries a <b>7-day right of withdrawal</b>.',
        flags.highComplexityFromDoc ? 'doc' : 'data',
        { excerpt: d.highComplexity ? d.highComplexity.excerpt : null }
      ));
    } else {
      lines5.push(L(
        '일반 펀드는 청약철회권 대상이 아닙니다. 고난도금융투자상품에 해당하는 펀드만 7일 이내 철회가 됩니다.',
        'Ordinary funds carry no right of withdrawal; only highly complex funds have the 7-day right.',
        'law'
      ));
    }
    lines5.push(L(
      '판매규제를 위반한 계약은 <b>위법계약해지권</b>을 행사하실 수 있습니다 — 계약일로부터 5년 이내이면서 위반 사실을 아신 날로부터 1년 이내입니다.',
      'Where sales rules were breached, the <b>right to terminate an unlawful contract</b> applies — within 5 years of the contract and 1 year of learning of the breach.',
      'law'
    ));

    /* 06 서류·절차 */
    lines6.push(L(
      '<b>교부</b> — 간이투자설명서를 반드시 드리고, 요청하시면 투자설명서와 집합투자규약도 드립니다. 가입 후에는 <b>자산운용보고서가 분기마다</b> 제공되고 중요 사항이 바뀌면 수시로 공시됩니다.',
      '<b>Documents</b> — the simplified prospectus is mandatory; the full prospectus and fund rules on request. After purchase, an <b>asset-management report every quarter</b> and disclosures of material changes.',
      'law'
    ));
    lines6.push(L(
      '<b>적합성 · 적정성</b> — 권유해 드릴 때는 투자성향에 맞는 펀드만 권유합니다. 권유 없이 파생형·고난도 펀드에 가입하시는 경우에도 적정하지 않으면 그 사실을 알려 드리고 확인을 받습니다.',
      '<b>Suitability and appropriateness</b> — recommendations must match your profile, and even without a recommendation an inappropriate derivative or complex fund must be flagged and confirmed.',
      'law'
    ));
    if (highComplex) {
      lines6.push(L(
        '<b>녹취 · 숙려</b> — 고난도금융투자상품이므로 판매 과정을 녹취하고 <b>2영업일 이상 숙려기간</b>을 드립니다.',
        '<b>Recording and cooling-off</b> — as a highly complex product, the sale is recorded and <b>at least 2 business days</b> are given.',
        'law'
      ));
    }
    lines6.push(L(
      '<b>이해 확인</b> — 설명을 이해하셨다는 사실을 서명·기명날인 또는 녹취로 남깁니다. <b>고령투자자</b>(만 65세 이상)이시면 지정인 연락처 확인 등 보호 절차를 함께 진행합니다.',
      '<b>Confirmation</b> — understanding is recorded by signature, seal or recording. For <b>clients aged 65+</b>, the additional protections apply.',
      'law'
    ));

    /* 체크리스트 */
    var checklist = [
      { ko: '원금이 보장되지 않는 실적배당 상품이고 예금자보호 대상이 아니라는 점을 이해하셨습니까?', en: 'Do you understand this is performance-based, with no principal guarantee and no depositor protection?' }
    ];
    if (invests.v) checklist.push({ ko: '이 펀드가 ' + noDot(invests.v) + '에 투자한다는 점을 확인하셨습니까?', en: 'Have you confirmed the fund invests in ' + noDot(invests.v) + '?' });
    if (riskGrade.v) checklist.push({ ko: '위험등급 ' + riskGrade.v + '등급이 고객님 투자성향에 맞는지 확인하셨습니까?', en: 'Have you confirmed risk grade ' + riskGrade.v + ' matches your profile?' });
    if (totalExpense.v !== null) checklist.push({ ko: '총보수 연 ' + pct(totalExpense.v, 2) + '가 매일 기준가에서 차감된다는 점을 이해하셨습니까?', en: 'Do you understand ' + pct(totalExpense.v, 2) + ' p.a. is deducted from the NAV daily?' });
    if (feeFront.v !== null) checklist.push({ ko: '선취판매수수료 ' + pct(feeFront.v, 2) + '를 확인하셨습니까?', en: 'Have you confirmed the ' + pct(feeFront.v, 2) + ' front-end load?' });
    if (redemptionFee.v) checklist.push({ ko: '환매수수료(' + redemptionFee.v + ')를 확인하셨습니까?', en: 'Have you confirmed the redemption fee (' + redemptionFee.v + ')?' });
    if (pricing.v || payout.v) {
      checklist.push({ ko: '환매 신청 후 ' + [pricing.v, payout.v].filter(Boolean).join(', ') + '이라는 점을 확인하셨습니까?',
        en: 'Have you confirmed the redemption timeline (' + [pricing.v, payout.v].filter(Boolean).join(', ') + ')?' });
    }
    if (overseas) {
      checklist.push({ ko: '환율이 불리하게 움직이면 현지 수익에도 원화 손실이 날 수 있다는 점을 이해하셨습니까?', en: 'Do you understand an adverse FX move can turn a local gain into a won loss?' });
      checklist.push({ ko: '가입하시는 클래스가 ' + (hedge.v === 'H' ? '환헤지형' : hedge.v === 'UH' ? '환노출형' : '환헤지형인지 환노출형인지') + '이라는 점을 확인하셨습니까?',
        en: 'Have you confirmed whether your class is hedged or unhedged?' });
      checklist.push({ ko: '이익 전액이 배당소득으로 과세되어 해외주식 직접투자와 세금 계산이 다르다는 점을 이해하셨습니까?', en: 'Do you understand the whole gain is taxed as dividend income, unlike direct share investment?' });
    }
    checklist.push({ ko: '과거 수익률이 미래를 보장하지 않는다는 점을 이해하셨습니까?', en: 'Do you understand past performance does not guarantee future returns?' });
    checklist.push({ ko: '간이투자설명서를 교부받으셨습니까?', en: 'Have you received the simplified prospectus?' });

    return {
      summary: summary,
      sections: [
        { no: '01', title: { ko: '상품의 내용', en: 'Product content' }, lines: lines1 },
        { no: '02', title: { ko: '투자에 따르는 위험', en: 'Investment risks' }, lines: lines2 },
        { no: '03', title: { ko: '위험등급과 그 의미', en: 'Risk grade' }, lines: lines3 },
        { no: '04', title: { ko: '수수료 · 비용 · 세금', en: 'Fees and tax' }, lines: lines4 },
        { no: '05', title: { ko: '환매 · 계약의 해지', en: 'Redemption and termination' }, lines: lines5 },
        { no: '06', title: { ko: '교부 서류 · 판매 절차', en: 'Documents and procedure' }, lines: lines6 }
      ],
      checklist: checklist,
      flags: flags
    };
  }

  function build(record, docFields) {
    if (!record) return null;
    return record.kind === 'ELS' ? elsScript(record.raw, docFields) : fundScript(record.raw, docFields);
  }

  window.DutyText = { build: build, pct: pct, num: num };
})();
