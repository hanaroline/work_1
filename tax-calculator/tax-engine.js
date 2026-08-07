/* ============================================================================
 * 부동산 세금 계산 엔진 — 2026.8.3. 세제개편안 반영
 * ----------------------------------------------------------------------------
 * 근거 : 재정경제부 「2026년 세제개편안」(2026.8.3. 발표) 상세본
 *        - 종합부동산세 : 2027년 납세의무 성립분부터 단계 적용
 *        - 양도소득세   : 2028년 이후 양도분부터 본격 적용
 *        - 취득세/재산세: 이번 개편 대상 아님(행정안전부 소관 지방세) → 현행 기준
 *
 * 주의 : 정부안(국회 심의 전)이므로 확정 법률이 아님.
 * ==========================================================================*/
(function (global) {
  'use strict';

  var EOK = 100000000; // 1억원

  /* ---------- 공통 유틸 ---------- */

  // 누진 구간표 적용 : brackets = [[상한, 세율], ...]
  function applyBrackets(base, brackets) {
    if (base <= 0) return 0;
    var tax = 0, prev = 0;
    for (var i = 0; i < brackets.length; i++) {
      var cap = brackets[i][0], rate = brackets[i][1];
      if (base <= prev) break;
      var slice = Math.min(base, cap) - prev;
      if (slice > 0) tax += slice * rate;
      prev = cap;
    }
    return tax;
  }

  // 한계세율(해당 과세표준이 속한 구간의 세율)
  function marginalRate(base, brackets) {
    for (var i = 0; i < brackets.length; i++) {
      if (base <= brackets[i][0]) return brackets[i][1];
    }
    return brackets[brackets.length - 1][1];
  }

  function round(n) { return Math.round(n); }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  /* ==========================================================================
   * 1. 취득세 (지방세 · 이번 개편 미포함 → 현행 지방세법 기준)
   * ========================================================================*/

  // 주택 유상취득 취득세 본세율
  // housesAfter : 취득 후 세대 보유 주택 수, adjusted : 취득 주택의 조정대상지역 여부
  function acqBaseRate(price, housesAfter, adjusted, tempTwo, isCorp) {
    if (isCorp) return { rate: 0.12, kind: 'heavy12' };
    // 일시적 2주택은 1주택 세율 적용
    var n = tempTwo && housesAfter === 2 ? 1 : housesAfter;

    if (adjusted) {
      if (n >= 3) return { rate: 0.12, kind: 'heavy12' };
      if (n === 2) return { rate: 0.08, kind: 'heavy8' };
    } else {
      if (n >= 4) return { rate: 0.12, kind: 'heavy12' };
      if (n === 3) return { rate: 0.08, kind: 'heavy8' };
    }
    // 표준세율 (1주택 / 비조정 2주택)
    if (price <= 6 * EOK) return { rate: 0.01, kind: 'standard' };
    if (price <= 9 * EOK) {
      // (취득가액 × 2/3억 − 3) % , 소수점 다섯째 자리 반올림
      var pct = (price / EOK) * 2 / 3 - 3;
      var r = Math.round((pct / 100) * 100000) / 100000;
      return { rate: clamp(r, 0.01, 0.03), kind: 'standard' };
    }
    return { rate: 0.03, kind: 'standard' };
  }

  /**
   * 취득세 계산
   * @param {number} price      취득가액(주택 전체)
   * @param {number} housesAfter 취득 후 세대 주택 수
   * @param {boolean} adjusted  조정대상지역 여부
   * @param {boolean} tempTwo   일시적 2주택 여부
   * @param {boolean} over85    전용면적 85㎡ 초과 여부
   * @param {number} share      본인 지분율 (0~1)
   * @param {boolean} firstTime 생애최초 취득 감면 적용
   * @param {boolean} isCorp    법인 취득
   */
  function acquisitionTax(o) {
    var price = o.price || 0;
    if (price <= 0) return null;

    var br = acqBaseRate(price, o.housesAfter, o.adjusted, o.tempTwo, o.isCorp);

    // 지방교육세 : 표준세율 구간 = 취득세율 × 1/2 × 20% / 중과 구간 = (4%−2%) × 20% = 0.4%
    var eduRate = br.kind === 'standard' ? br.rate * 0.1 : 0.004;

    // 농어촌특별세 : 전용 85㎡ 이하 비과세
    var farmRate = 0;
    if (o.over85) {
      farmRate = br.kind === 'standard' ? 0.002 : (br.kind === 'heavy8' ? 0.006 : 0.010);
    }

    var main = price * br.rate;
    var relief = 0;
    // 생애최초 주택 구입 감면 : 취득가액 12억원 이하, 최대 200만원
    if (o.firstTime && price <= 12 * EOK && br.kind === 'standard') {
      relief = Math.min(main, 2000000);
    }
    var mainNet = main - relief;
    var edu = price * eduRate;
    var farm = price * farmRate;
    var total = mainNet + edu + farm;

    var share = o.share == null ? 1 : o.share;

    return {
      rateKind: br.kind,
      baseRate: br.rate,
      eduRate: eduRate,
      farmRate: farmRate,
      main: round(main),
      relief: round(relief),
      mainNet: round(mainNet),
      edu: round(edu),
      farm: round(farm),
      total: round(total),
      myShare: round(total * share),
      effectiveRate: total / price
    };
  }

  /* ==========================================================================
   * 2. 재산세 (지방세 · 이번 개편 미포함 → 현행 기준)
   * ========================================================================*/

  // 재산세 공정시장가액비율 : 1세대 1주택 특례 43~45%, 그 외 60%
  function propFairRatio(gongsi, isOneHouse) {
    if (!isOneHouse) return 0.60;
    if (gongsi <= 3 * EOK) return 0.43;
    if (gongsi <= 6 * EOK) return 0.44;
    return 0.45;
  }

  // 주택분 재산세 본세 (표준세율 / 1세대1주택 공시 9억 이하 특례세율)
  function propMain(base, special) {
    if (base <= 0) return 0;
    if (special) {
      if (base <= 60000000) return base * 0.0005;
      if (base <= 150000000) return 30000 + (base - 60000000) * 0.001;
      if (base <= 300000000) return 90000 + (base - 150000000) * 0.002;
      return 390000 + (base - 300000000) * 0.0035;
    }
    if (base <= 60000000) return base * 0.001;
    if (base <= 150000000) return 60000 + (base - 60000000) * 0.0015;
    if (base <= 300000000) return 195000 + (base - 150000000) * 0.0025;
    return 570000 + (base - 300000000) * 0.004;
  }

  // 주택 재산세 세부담상한율 (지방세법 §122) — 공시가격 구간별
  // 주택분은 과세표준상한제 도입에 따라 2028년까지 병행 적용 후 2029년 폐지 예정
  function propBurdenCapRate(gongsi) {
    if (gongsi <= 3 * EOK) return 1.05;
    if (gongsi <= 6 * EOK) return 1.10;
    return 1.30;
  }

  /**
   * 재산세 계산 (주택 1채 기준, 주택 전체로 산출 후 지분 안분)
   *
   * 상한 장치 2종을 모두 반영합니다.
   *  ① 과세표준상한제 (지방세법 §110의2, 2024년 시행)
   *     과세표준상한액 = 직전연도 과세표준 상당액 × (1 + 과표상한율 5%)
   *     - 직전연도 과세표준 상당액 = 직전연도 공시가격 × 당해연도 공정시장가액비율
   *     - 과세표준 = min(공시가격 × 공정시장가액비율, 과세표준상한액)
   *  ② 세부담상한제 (지방세법 §122) — 전년 재산세액 대비 105/110/130%
   *     과표상한제와 2028년까지 병행 적용, 2029년 폐지 예정
   *
   * @param {number}  gongsi      공시가격(주택 전체)
   * @param {boolean} isOneHouse  1세대 1주택 여부
   * @param {number}  share       본인 지분율
   * @param {boolean} urban       도시지역분 과세 여부
   * @param {number}  prevGongsi  직전연도 공시가격 (0/미입력 시 과표상한제 미적용)
   * @param {number}  capRate     과표상한율 (기본 0.05)
   * @param {number}  prevMain    직전연도 재산세 본세(주택 전체) (0/미입력 시 세부담상한 미적용)
   * @param {number}  year        기준연도 (세부담상한 폐지 시점 판정)
   * @param {boolean} noBaseCap   과세표준상한제 미적용
   * @param {boolean} noBurdenCap 세부담상한제 미적용
   */
  function propertyTax(o) {
    var gongsi = o.gongsi || 0;
    if (gongsi <= 0) return null;

    var fair = propFairRatio(gongsi, o.isOneHouse);
    var rawBase = gongsi * fair;

    // ── ① 과세표준상한제 ────────────────────────────────────────
    var capRate = o.capRate == null ? 0.05 : o.capRate;
    var baseCapAmt = null, baseCapped = false;
    var base = rawBase;
    if (!o.noBaseCap && o.prevGongsi > 0) {
      // 직전연도 공시가격 × 당해연도 공정시장가액비율 × (1 + 과표상한율)
      baseCapAmt = o.prevGongsi * fair * (1 + capRate);
      if (baseCapAmt < rawBase) { base = baseCapAmt; baseCapped = true; }
    }

    // 1세대 1주택 + 공시가격 9억원 이하 → 세율 0.05%p 인하 특례
    var special = !!o.isOneHouse && gongsi <= 9 * EOK;
    var mainRaw = propMain(base, special);

    // ── ② 세부담상한제 (2028년까지) ─────────────────────────────
    var year = o.year || 2026;
    var burdenCapRate = propBurdenCapRate(gongsi);
    var burdenCapAmt = null, burdenCapped = false;
    var main = mainRaw;
    var burdenCapAvailable = year <= 2028 && !o.noBurdenCap;
    if (burdenCapAvailable && o.prevMain > 0) {
      burdenCapAmt = o.prevMain * burdenCapRate;
      if (burdenCapAmt < mainRaw) { main = burdenCapAmt; burdenCapped = true; }
    }

    var urban = o.urban === false ? 0 : base * 0.0014;
    var edu = main * 0.2;
    var total = main + urban + edu;
    var share = o.share == null ? 1 : o.share;

    return {
      fairRatio: fair,
      rawTaxBase: round(rawBase),
      taxBase: round(base),
      baseCapAmt: baseCapAmt == null ? null : round(baseCapAmt),
      baseCapped: baseCapped,
      capRate: capRate,
      special: special,
      mainBeforeCap: round(mainRaw),
      burdenCapRate: burdenCapRate,
      burdenCapAmt: burdenCapAmt == null ? null : round(burdenCapAmt),
      burdenCapped: burdenCapped,
      burdenCapAvailable: burdenCapAvailable,
      main: round(main),
      urban: round(urban),
      edu: round(edu),
      total: round(total),
      myShare: round(total * share),
      mainRaw: main
    };
  }

  /* ---------- 지역자원시설세 (소방분) — 재산세 고지서 병기 ---------- */
  // 과세표준 = 건축물(주택 건물분) 시가표준액 상당액
  var FIRE_BRACKETS = [
    [6000000, 0.0004, 0],
    [13000000, 0.0005, 2400],
    [26000000, 0.0006, 5900],
    [39000000, 0.0008, 13700],
    [64000000, 0.0010, 24100],
    [Infinity, 0.0012, 49100]
  ];

  function fireFacilityTax(base) {
    if (!base || base <= 0) return 0;
    var prev = 0;
    for (var i = 0; i < FIRE_BRACKETS.length; i++) {
      var cap = FIRE_BRACKETS[i][0], rate = FIRE_BRACKETS[i][1], flat = FIRE_BRACKETS[i][2];
      if (base <= cap) return round(flat + (base - prev) * rate);
      prev = cap;
    }
    return 0;
  }

  /* ==========================================================================
   * 3. 종합부동산세 (2027년부터 개편 적용)
   * ========================================================================*/

  var NT_BRACKETS = {
    // 2026년 현행 : 2주택 이하
    cur_low: [[3 * EOK, 0.005], [6 * EOK, 0.007], [12 * EOK, 0.010], [25 * EOK, 0.013],
              [50 * EOK, 0.015], [94 * EOK, 0.020], [Infinity, 0.027]],
    // 2026년 현행 : 3주택 이상
    cur_high: [[3 * EOK, 0.005], [6 * EOK, 0.007], [12 * EOK, 0.010], [25 * EOK, 0.020],
               [50 * EOK, 0.030], [94 * EOK, 0.040], [Infinity, 0.050]],
    // 2027년 : 2주택 이하
    y27_low: [[3 * EOK, 0.005], [6 * EOK, 0.007], [12 * EOK, 0.013], [25 * EOK, 0.015],
              [50 * EOK, 0.020], [94 * EOK, 0.027], [Infinity, 0.035]],
    // 2027년 : 3주택 이상
    y27_high: [[3 * EOK, 0.005], [6 * EOK, 0.007], [12 * EOK, 0.013], [25 * EOK, 0.020],
               [50 * EOK, 0.030], [94 * EOK, 0.040], [Infinity, 0.050]],
    // 2028년 이후 : 주택 수 무관 단일 세율표
    single: [[3 * EOK, 0.005], [6 * EOK, 0.007], [12 * EOK, 0.013], [25 * EOK, 0.020],
             [50 * EOK, 0.030], [94 * EOK, 0.040], [Infinity, 0.050]]
  };

  function ntBrackets(year, houseCount) {
    if (year >= 2028) return { key: 'single', b: NT_BRACKETS.single };
    if (year === 2027) {
      return houseCount >= 3 ? { key: 'y27_high', b: NT_BRACKETS.y27_high }
                             : { key: 'y27_low', b: NT_BRACKETS.y27_low };
    }
    return houseCount >= 3 ? { key: 'cur_high', b: NT_BRACKETS.cur_high }
                           : { key: 'cur_low', b: NT_BRACKETS.cur_low };
  }

  // 종부세 공정시장가액비율
  function ntFairRatio(year, isOne1H, houseCount, adjusted) {
    if (year <= 2026) return 0.60;
    if (year === 2027) return 0.70;
    // 2028년 이후 : 1세대 1주택자는 70% 유지, 그 외 3주택 이상·조정지역 보유자는 80%
    if (isOne1H) return 0.70;
    if (houseCount >= 3 || adjusted) return 0.80;
    return 0.70;
  }

  // 기본공제
  function ntBasicDeduction(year, isOne1H, resides, residedValue, ownedValue) {
    if (year <= 2026) return isOne1H ? 12 * EOK : 9 * EOK;
    if (isOne1H) return resides ? 14 * EOK : 9 * EOK;
    // 그 외 개인 : 4억 + 5억 × (거주주택 공시가격 ÷ 보유주택 공시가격 합계)
    var ratio = ownedValue > 0 ? clamp(residedValue / ownedValue, 0, 1) : 0;
    return 4 * EOK + 5 * EOK * ratio;
  }

  // 세액공제율 (1세대 1주택자만)
  function ntCreditRate(year, age, holdY, liveY) {
    var ageRate = 0;
    if (age >= 70) ageRate = 0.40;
    else if (age >= 65) ageRate = 0.30;
    else if (age >= 60) ageRate = 0.20;

    function tier(y, a, b, c) { // 5~10년 a / 10~15년 b / 15년~ c
      if (y >= 15) return c;
      if (y >= 10) return b;
      if (y >= 5) return a;
      return 0;
    }

    var periodRate;
    if (year <= 2026) {
      periodRate = tier(holdY, 0.20, 0.40, 0.50);            // 보유기간 공제
    } else if (year === 2027) {
      periodRate = Math.max(tier(holdY, 0.10, 0.20, 0.25),   // 경과규정 : 보유공제
                            tier(liveY, 0.20, 0.40, 0.50));  //            거주공제 중 높은 쪽
    } else {
      periodRate = tier(liveY, 0.20, 0.40, 0.50);            // 거주기간 공제만
    }
    return {
      age: ageRate,
      period: periodRate,
      total: Math.min(0.80, ageRate + periodRate)
    };
  }

  // 세액공제 금액한도
  function ntCreditCap(year) {
    if (year <= 2026) return Infinity;
    if (year === 2027) return 8000000;
    return 6000000;
  }

  /**
   * 종합부동산세 계산 (인별)
   * @param {number} year
   * @param {Array}  houses      [{gongsi, resided, adjusted}] — 주택 전체 공시가격 기준
   * @param {number} share       본인 지분율 (모든 주택 동일 가정)
   * @param {boolean} isOne1H    1세대 1주택자 여부 (단독명의 1주택 또는 공동명의 1주택자 특례)
   * @param {boolean} wholeUnit  판정단위가 주택 전체인지(특례) 여부
   * @param {number} age, holdY, liveY
   * @param {boolean} reform     2026.8.3. 개편안 반영 여부.
   *                             false면 연도와 무관하게 현행 법령(2026년 기준)으로 계산 →
   *                             동일 연도·동일 공시가격에서 개편 효과만 분리 비교 가능
   */
  function comprehensiveTax(o) {
    var year = o.year;
    // 개편안 미반영 시 규칙연도를 2026년(현행)으로 고정
    var reform = o.reform !== false;
    var ry = reform ? year : 2026;
    var houses = (o.houses || []).filter(function (h) { return h.gongsi > 0; });
    if (!houses.length) return null;

    var share = o.wholeUnit ? 1 : (o.share == null ? 1 : o.share);
    var houseCount = houses.length;

    var ownedWhole = 0, residedWhole = 0, adjustedAny = false;
    houses.forEach(function (h) {
      ownedWhole += h.gongsi;
      if (h.resided) residedWhole += h.gongsi;
      if (h.adjusted) adjustedAny = true;
    });

    var owned = ownedWhole * share;      // 판정 대상 공시가격 (인별 지분 또는 주택 전체)
    var resided = residedWhole * share;
    var resides = residedWhole > 0;

    // ── 과세대상 문턱 (2027년 신설) ──────────────────────────────
    var threshold = null, blockedByThreshold = false;
    if (ry >= 2027) {
      threshold = o.isOne1H ? 14 * EOK : 9 * EOK;
      if (owned <= threshold) blockedByThreshold = true;
    }

    var basic = ntBasicDeduction(ry, o.isOne1H, resides, resided, owned);
    var fair = ntFairRatio(ry, o.isOne1H, houseCount, adjustedAny);
    var taxBase = blockedByThreshold ? 0 : Math.max(0, owned - basic) * fair;

    var brk = ntBrackets(ry, houseCount);
    var gross = applyBrackets(taxBase, brk.b);

    // ── 재산세 중복분 공제 (종부령 §4의2) ────────────────────────
    var propMainTotal = 0, propFair = null;
    houses.forEach(function (h) {
      var pr = propertyTax({ gongsi: h.gongsi, isOneHouse: houseCount === 1, share: 1, urban: false });
      propMainTotal += pr.mainRaw;
      propFair = pr.fairRatio;
    });
    propMainTotal *= share;

    var propDeduct = 0;
    if (taxBase > 0 && propMainTotal > 0 && !o.skipPropDeduct) {
      var specialR = houseCount === 1 && ownedWhole <= 9 * EOK;
      var A = propMain(taxBase * propFair, specialR);
      var B = propMain(owned * propFair, specialR);
      if (B > 0) propDeduct = Math.min(propMainTotal, propMainTotal * (A / B));
    }

    var afterProp = Math.max(0, gross - propDeduct);

    // ── 세액공제 (1세대 1주택자 한정) ────────────────────────────
    var credit = { age: 0, period: 0, total: 0 };
    var creditAmt = 0, creditCapped = false;
    if (o.isOne1H) {
      credit = ntCreditRate(ry, o.age || 0, o.holdY || 0, o.liveY || 0);
      var raw = afterProp * credit.total;
      var cap = ntCreditCap(ry);
      creditAmt = Math.min(raw, cap);
      creditCapped = raw > cap;
    }

    var netBeforeCap = Math.max(0, afterProp - creditAmt);

    // ── 세부담상한 (종부법 §10 : 150% → 개편안 200%) ─────────────
    // 직전연도 「총세액상당액」(재산세 + 종부세) 대비 당해연도 보유세 총액을 제한.
    // 종부세만 조정하며, 재산세는 이미 확정된 금액이므로 상한선에서 차감한다.
    var capLimit = ry >= 2027 ? 2.0 : 1.5;
    var capApplied = false, net = netBeforeCap, capCeiling = null;
    if (o.prevYearTotal > 0 && !o.noBurdenCap) {
      capCeiling = o.prevYearTotal * capLimit;
      var thisYearTotal = netBeforeCap + propMainTotal;
      if (thisYearTotal > capCeiling) {
        net = Math.max(0, capCeiling - propMainTotal);
        capApplied = true;
      }
    }

    var farm = net * 0.2; // 농어촌특별세

    return {
      year: year,
      taxable: !blockedByThreshold && taxBase > 0,
      blockedByThreshold: blockedByThreshold,
      threshold: threshold,
      ownedValue: round(owned),
      residedValue: round(resided),
      residedRatio: owned > 0 ? resided / owned : 0,
      basicDeduction: round(basic),
      fairRatio: fair,
      taxBase: round(taxBase),
      bracketKey: brk.key,
      marginal: marginalRate(taxBase, brk.b),
      gross: round(gross),
      propDeduct: round(propDeduct),
      afterProp: round(afterProp),
      creditRate: credit,
      creditAmt: round(creditAmt),
      creditCap: ntCreditCap(ry),
      creditCapped: creditCapped,
      capLimit: capLimit,
      capApplied: capApplied,
      capCeiling: capCeiling == null ? null : round(capCeiling),
      netBeforeCap: round(netBeforeCap),
      propTaxRef: round(propMainTotal),
      reform: reform,
      ruleYear: ry,
      net: round(net),
      farm: round(farm),
      total: round(net + farm)
    };
  }

  /* ==========================================================================
   * 4. 양도소득세 (2028년 이후 양도분부터 개편 적용)
   * ========================================================================*/

  var CG_RATES = [
    [14000000, 0.06, 0],
    [50000000, 0.15, 1260000],
    [88000000, 0.24, 5760000],
    [150000000, 0.35, 15440000],
    [300000000, 0.38, 19940000],
    [500000000, 0.40, 25940000],
    [1000000000, 0.42, 35940000],
    [Infinity, 0.45, 65940000]
  ];

  function cgRateRow(base) {
    for (var i = 0; i < CG_RATES.length; i++) {
      if (base <= CG_RATES[i][0]) return CG_RATES[i];
    }
    return CG_RATES[CG_RATES.length - 1];
  }

  // 조정대상지역 다주택자 중과 가산세율 (한시 완화 반영)
  function heavySurcharge(year, houseCount) {
    if (houseCount < 2) return 0;
    var two = houseCount === 2;
    if (year <= 2025) return two ? 0.20 : 0.30;
    if (year <= 2027) return two ? 0.05 : 0.10;   // 2026 양도분 + 2027년
    if (year === 2028) return two ? 0.10 : 0.15;
    return two ? 0.20 : 0.30;                      // 2029년 이후 복귀
  }

  /**
   * 장기보유특별공제 / 장기거주 소득공제 공제율
   */
  function ltDeductionRate(year, opt) {
    if (opt.heavyTaxed) return { rate: 0, kind: 'excluded', live: 0, hold: 0 };

    var premium = opt.houseCount === 1 && opt.holdY >= 3 && opt.liveY >= 2;

    if (premium) {
      if (year <= 2027) {
        var h1 = Math.min(opt.holdY, 10) * 0.04, l1 = Math.min(opt.liveY, 10) * 0.04;
        return { rate: Math.min(0.80, h1 + l1), kind: 'premium', hold: h1, live: l1 };
      }
      if (year === 2028) {
        var h2 = Math.min(Math.min(opt.holdY, 10) * 0.02, 0.20);
        var l2 = Math.min(Math.min(opt.liveY, 10) * 0.06, 0.60);
        return { rate: Math.min(0.80, h2 + l2), kind: 'premium', hold: h2, live: l2 };
      }
      var l3 = Math.min(Math.min(opt.liveY, 10) * 0.08, 0.80);
      return { rate: l3, kind: 'premium', hold: 0, live: l3 };
    }

    // 일반공제 (우대요건 미충족 1주택 · 비조정 다주택 등)
    if (year <= 2027) {
      var g1 = Math.min(Math.min(opt.holdY, 15) * 0.02, 0.30);
      return { rate: g1, kind: 'general', hold: g1, live: 0 };
    }
    if (year === 2028) {
      var gh = Math.min(Math.min(opt.holdY, 15) * 0.01, 0.15);
      var gl = opt.liveY >= 2 ? Math.min(Math.min(opt.liveY, 15) * 0.02, 0.30) : 0;
      return gl >= gh ? { rate: gl, kind: 'general', hold: 0, live: gl }
                      : { rate: gh, kind: 'general', hold: gh, live: 0 };
    }
    var gl2 = opt.liveY >= 2 ? Math.min(Math.min(opt.liveY, 15) * 0.02, 0.30) : 0;
    return { rate: gl2, kind: 'general', hold: 0, live: gl2 };
  }

  // 장기거주 소득공제 금액한도 (인별 / 물건별)
  function ltDeductionCap(year) {
    if (year <= 2027) return Infinity;
    if (year === 2028) return 20 * EOK;
    return 10 * EOK;
  }

  /**
   * 양도소득세 계산 (1인 기준)
   * @param {number} year        양도연도
   * @param {number} salePrice   양도가액(주택 전체)
   * @param {number} buyPrice    취득가액(주택 전체)
   * @param {number} expenses    필요경비(주택 전체)
   * @param {number} share       본인 지분율
   * @param {number} houseCount  세대 주택 수
   * @param {number} holdY, liveY
   * @param {boolean} exempt     1세대 1주택 비과세 적용
   * @param {boolean} heavyTaxed 조정대상지역 중과대상 주택
   * @param {boolean} seniorRelief 고령 1주택자 지방이주 감면
   */
  function capitalGainsTax(o) {
    var sale = o.salePrice || 0, buy = o.buyPrice || 0, exp = o.expenses || 0;
    if (sale <= 0) return null;

    var share = o.share == null ? 1 : o.share;
    var gainWhole = sale - buy - exp;

    // 개편안 미반영 시 규칙연도를 2025년(현행)으로 고정 :
    //  장특공제 보유4%+거주4%(최대80%) · 공제한도 없음 · 기본공제 250만원 ·
    //  다주택 중과 +20/+30%p 원칙세율
    var reform = o.reform !== false;
    var ry = reform ? o.year : 2025;

    // 1세대 1주택 비과세 : 양도가액 12억원 초과분만 과세
    var taxableRatio = 1;
    if (o.exempt && o.houseCount === 1) {
      taxableRatio = sale > 12 * EOK ? (sale - 12 * EOK) / sale : 0;
    }
    var taxableGainWhole = Math.max(0, gainWhole) * taxableRatio;
    var taxableGain = taxableGainWhole * share;

    // 장기보유특별공제 / 장기거주 소득공제
    var lt = ltDeductionRate(ry, {
      houseCount: o.houseCount, holdY: o.holdY || 0, liveY: o.liveY || 0,
      heavyTaxed: !!o.heavyTaxed
    });
    var ltRaw = taxableGain * lt.rate;

    // 공제한도 : 인별 한도 / 물건별 한도(지분 안분) 중 작은 값
    var capBase = ltDeductionCap(ry);
    var capPerson = capBase;
    var capItem = capBase === Infinity ? Infinity : capBase * share;
    var ltCap = Math.min(capPerson, capItem);
    var ltAmt = Math.min(ltRaw, ltCap);
    var ltCapped = ltRaw > ltCap;

    var income = Math.max(0, taxableGain - ltAmt);

    // 기본공제 : 연 250만원 → 장기거주 1주택 특례 2,500만원 (2027년 이후)
    var basicDed = 2500000, basicSpecial = false;
    if (ry >= 2027 && o.houseCount === 1 && (o.liveY || 0) >= 10 &&
        sale <= 30 * EOK && !o.nonResident) {
      basicDed = 25000000;
      basicSpecial = true;
    }
    var taxBase = Math.max(0, income - basicDed);

    // 세율
    var row = cgRateRow(taxBase);
    var sur = o.heavyTaxed ? heavySurcharge(ry, o.houseCount) : 0;
    var calcNormal = taxBase * (row[1] + sur) - row[2];

    // 단기양도 세율 (주택 : 1년 미만 70%, 1~2년 60%) 과 비교하여 큰 세액
    var shortRate = 0;
    if ((o.holdY || 0) < 1) shortRate = 0.70;
    else if ((o.holdY || 0) < 2) shortRate = 0.60;
    var calcShort = taxBase * shortRate;

    var calc = Math.max(0, Math.max(calcNormal, calcShort));
    var usedShort = calcShort > calcNormal && shortRate > 0;

    // 고령 1주택자 지방 이주 감면 (조특법 §71의3)
    var relief = 0;
    if (o.seniorRelief && reform && (o.year === 2027 || o.year === 2028)) {
      var rRate = o.year === 2027 ? 0.5 : 0.3;
      var rCap = (o.year === 2027 ? 5 * EOK : 3 * EOK) * share;
      relief = Math.min(calc * rRate, rCap);
    }

    var afterRelief = Math.max(0, calc - relief);
    var local = afterRelief * 0.1; // 지방소득세

    return {
      year: o.year,
      reform: reform,
      ruleYear: ry,
      gainWhole: round(gainWhole),
      taxableRatio: taxableRatio,
      taxableGain: round(taxableGain),
      ltRate: lt.rate,
      ltKind: lt.kind,
      ltHold: lt.hold,
      ltLive: lt.live,
      ltRaw: round(ltRaw),
      ltAmt: round(ltAmt),
      ltCap: ltCap,
      ltCapped: ltCapped,
      income: round(income),
      basicDed: basicDed,
      basicSpecial: basicSpecial,
      taxBase: round(taxBase),
      rate: row[1],
      surcharge: sur,
      progressive: row[2],
      usedShort: usedShort,
      shortRate: shortRate,
      calc: round(calc),
      relief: round(relief),
      local: round(local),
      total: round(afterRelief + local),
      effectiveRate: taxableGain > 0 ? (afterRelief + local) / taxableGain : 0
    };
  }

  /* ==========================================================================
   * export
   * ========================================================================*/
  global.TaxEngine = {
    EOK: EOK,
    acquisitionTax: acquisitionTax,
    propertyTax: propertyTax,
    propBurdenCapRate: propBurdenCapRate,
    fireFacilityTax: fireFacilityTax,
    FIRE_BRACKETS: FIRE_BRACKETS,
    comprehensiveTax: comprehensiveTax,
    capitalGainsTax: capitalGainsTax,
    ltDeductionRate: ltDeductionRate,
    ntCreditRate: ntCreditRate,
    heavySurcharge: heavySurcharge,
    NT_BRACKETS: NT_BRACKETS,
    CG_RATES: CG_RATES
  };
})(this);
