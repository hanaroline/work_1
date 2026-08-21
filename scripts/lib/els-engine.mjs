/**
 * ELS 롤링 시뮬레이션 엔진 (els.html 의 runBacktest 와 같은 판정)
 *
 * 매 거래일에 같은 상품이 발행되었다고 가정하고 만기까지 돌린다.
 * - 워스트 퍼포머는 종가 기준
 * - 낙인은 관찰기간 중 종가가 한 번이라도 배리어 아래로 내려가면 터치
 * - 평가일은 거래일 수로 근사하지 않고 달력 월로 잡는다
 *   (팔란티어처럼 상장이 늦은 기초자산이 섞이면 근사값과 결과가 크게 벌어진다)
 */

export const addMonths = (ymd, m) => {
  const x = new Date(Date.UTC(Math.floor(ymd / 10000), Math.floor(ymd / 100) % 100 - 1 + m, ymd % 100));
  return x.getUTCFullYear() * 10000 + (x.getUTCMonth() + 1) * 100 + x.getUTCDate();
};

export const idxOnOrAfter = (dates, ymd, from = 0) => {
  let lo = from, hi = dates.length - 1, ans = -1;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (dates[mid] >= ymd) { ans = mid; hi = mid - 1; } else lo = mid + 1; }
  return ans;
};

/** 모든 기초자산에 값이 있는 첫 인덱스 */
export const startIndex = (series, N) => {
  let start = 0;
  for (const arr of series) { let i = 0; while (i < N && arr[i] == null) i++; if (i > start) start = i; }
  return start;
};

const seriesOf = (p, H) => {
  const s = p.underlyings.map((u) => H.series[u]);
  return s.some((x) => !x) ? null : s;
};

/** 발행일마다 만기까지 워스트 퍼포머가 내려간 최저 수준 */
export function drawdown(p, H) {
  const ser = seriesOf(p, H);
  if (!ser) return null;
  const dates = H.dates, N = dates.length, mins = [];
  for (let i = startIndex(ser, N); i < N; i++) {
    if (addMonths(dates[i], p.maturityMonths) > dates[N - 1]) break;
    const end = idxOnOrAfter(dates, addMonths(dates[i], p.maturityMonths), i);
    if (end < 0) break;
    const base = ser.map((s) => s[i]);
    if (base.some((v) => v == null || !(v > 0))) continue;
    let lo = Infinity;
    for (let k = i + 1; k <= end; k++) {
      for (let a = 0; a < ser.length; a++) {
        const v = ser[a][k];
        if (v != null) { const r = v / base[a] * 100; if (r < lo) lo = r; }
      }
    }
    if (lo < Infinity) mins.push(lo);
  }
  if (!mins.length) return null;
  mins.sort((a, b) => a - b);
  return { min: mins[0], p1: mins[Math.floor(mins.length * 0.01)], p5: mins[Math.floor(mins.length * 0.05)], n: mins.length };
}

/**
 * 롤링 백테스트.
 * p = { underlyings, maturityMonths, schedule:[{months,barrier}], knockIn, lizard:{months,barrier,rate},
 *       totalRate, principalProtection }
 */
export function backtest(p, H) {
  const ser = seriesOf(p, H);
  if (!ser) return null;
  const sch = p.schedule || [];
  if (!sch.length) return null;
  const dates = H.dates, N = dates.length, mat = p.maturityMonths, full = p.totalRate;
  let runs = 0, first = 0, loss = 0, annSum = 0, retSum = 0, worst = Infinity, kiCount = 0;
  const byStep = new Array(sch.length).fill(0);
  let lizardCount = 0, matWin = 0;

  for (let i = startIndex(ser, N); i < N; i++) {
    if (addMonths(dates[i], mat) > dates[N - 1]) break;
    const base = ser.map((s) => s[i]);
    if (base.some((v) => v == null || !(v > 0))) continue;

    let scan = i, kiHit = false, done = null;
    for (let k = 0; k < sch.length && !done; k++) {
      const j = idxOnOrAfter(dates, addMonths(dates[i], sch[k].months), scan);
      if (j < 0) break;
      if (p.knockIn != null && !kiHit) {
        for (let x = scan; x <= j && !kiHit; x++) {
          for (let a = 0; a < ser.length; a++) {
            const v = ser[a][x];
            if (v != null && (v / base[a]) * 100 < p.knockIn) { kiHit = true; break; }
          }
        }
      }
      scan = j;

      let wp = Infinity;
      for (let a = 0; a < ser.length; a++) {
        const v = ser[a][j];
        if (v == null) { wp = null; break; }
        wp = Math.min(wp, (v / base[a]) * 100);
      }
      if (wp == null) break;

      const last = k === sch.length - 1;
      if (wp >= sch[k].barrier) {
        done = { months: sch[k].months, ret: full * (sch[k].months / mat), step: k };
      } else if (p.lizard && p.lizard.months === sch[k].months && !lizardBreached(ser, base, i, j, p.lizard.barrier)) {
        done = { months: sch[k].months, ret: p.lizard.rate * (sch[k].months / 12), lizard: true };
      } else if (last) {
        if (p.principalProtection >= 100) done = { months: mat, ret: 0 };
        else if (p.knockIn != null && !kiHit) done = { months: mat, ret: full, matWin: true };
        else done = { months: mat, ret: wp - 100, matLoss: true };
      }
    }
    if (!done) continue;

    runs++;
    retSum += done.ret;
    annSum += done.ret * 12 / done.months;
    if (done.ret < 0) loss++;
    if (done.ret < worst) worst = done.ret;
    if (done.step === 0) first++;
    if (done.step != null) byStep[done.step]++;
    if (done.lizard) lizardCount++;
    if (done.matWin) matWin++;
    if (kiHit) kiCount++;
  }
  if (!runs) return null;
  return {
    runs, firstRate: first / runs * 100, lossRate: loss / runs * 100,
    avgAnn: annSum / runs, avgRet: retSum / runs, worst: worst === Infinity ? 0 : worst,
    kiRate: kiCount / runs * 100, lizardRate: lizardCount / runs * 100,
    matWinRate: matWin / runs * 100, byStep: byStep.map((c) => c / runs * 100),
  };
}

function lizardBreached(ser, base, from, to, barrier) {
  for (let x = from; x <= to; x++) {
    for (let a = 0; a < ser.length; a++) {
      const v = ser[a][x];
      if (v != null && (v / base[a]) * 100 < barrier) return true;
    }
  }
  return false;
}

/** 공시 파서 결과(prospectus_parsed.json 의 item)를 엔진 입력으로 */
export function fromProspectus(it) {
  const months = (d) => {
    if (!d) return null;
    const a = new Date(it.baseDate || it.issueDate), b = new Date(d);
    return Math.round((b - a) / 86400000 / 30.44);
  };
  const schedule = it.schedule.map((s) => ({ months: months(s.date), barrier: s.barrier }));
  const mat = months(it.maturityDate);
  if (!mat || mat <= 0 || schedule.some((s) => !s.months)) return null;
  schedule.push({ months: mat, barrier: it.maturityBarrier });
  return {
    underlyings: it.underlyings,
    maturityMonths: mat,
    schedule,
    knockIn: it.knockIn,
    totalRate: it.annualRate * mat / 12,   // 월지급식은 문서에 한 달치가 적혀 있어 연율로 환산한다
    annualRate: it.annualRate,
    principalProtection: it.principalProtected ? 100 : 0,
    lizard: it.lizard
      ? { months: months(it.schedule.find((s) => s.step === it.lizard.step)?.date), barrier: it.lizard.barrier,
          rate: (it.lizard.payout - 100) * 12 / months(it.schedule.find((s) => s.step === it.lizard.step)?.date) }
      : null,
  };
}
