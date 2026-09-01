/**
 * ELS 몬테카를로 — 발행사가 이론가를 매길 때 쓴 변동성·상관계수를 그대로 입력으로 쓴다.
 *
 * 왜 필요한가.
 * 발행사의 20년 수익률 모의실험은 과거 실제 경로라 설득력이 크지만, 상품마다 표본
 * 구간이 다르다. 팔란티어처럼 상장이 늦은 기초자산이 섞이면 3년치(721회)뿐이고,
 * 그 3년에 큰 하락이 없었으면 손실확률이 낮게 나온다. 20년(5,100회) 짜리와 그 숫자를
 * 나란히 놓고 "이쪽이 안전하다" 고 말하면 틀린 비교다.
 *
 * 이 엔진은 전 상품을 같은 조건(같은 경로 수·같은 기간·같은 규칙)으로 돌려 그 비교를
 * 가능하게 만든다. 변동성과 상관계수는 지어내지 않고 투자설명서에 적힌 값을 쓴다.
 *
 * 모형이 쓰는 입력 (전부 공시 원문에서 온다)
 *  1. 기초자산별 연 변동성        — 이론가 산출에 쓴 값 (VIX 방법론, 해당 만기 구간)
 *  2. 기초자산 간 상관계수        — 180영업일 역사적 상관
 *  3. 차수별 조기상환 배리어·평가일
 *  4. 낙인 배리어와 판정 기준     — 매 거래일 종가
 *  5. 리자드 조항 (있는 경우)     — "N차까지 X% 미만으로 내려간 적 없으면 상환"
 *  6. 만기 배리어·만기 상환 조건
 *  7. 조건 충족 시 수익률
 *
 * 가정 — 결과를 읽을 때 반드시 함께 봐야 하는 부분
 *  - 로그정규(기하 브라운 운동). 실제 주가보다 급락 꼬리가 얇다. 낙인 확률은
 *    이 때문에 다소 낮게 나올 수 있다.
 *  - 드리프트 0 (E[S_T] = S_0). 어느 기초자산이 오른다·내린다고 보지 않는다.
 *    발행사의 이론가는 위험중립 드리프트(무위험금리 − 배당수익률)를 쓰므로 서로
 *    다른 척도다. drift 인자로 연 기대수익률을 넣어 민감도를 볼 수 있다.
 *  - 관찰은 거래일 기준 연 252일. 낙인·리자드는 매 거래일 종가로 판정한다(공시와 같음).
 *  - 조기상환 수익률은 backtest 와 같은 규칙: totalRate × (경과월 / 만기월).
 *  - 난수는 고정 시드라 같은 입력이면 같은 결과가 나온다.
 *
 * 정확도
 *  - 대조변량(antithetic)을 쓴다. 같은 난수의 부호를 뒤집은 짝을 함께 돌려 분산을
 *    줄인다 — 경로 수를 늘리는 것보다 싸게 같은 정확도를 얻는다.
 *  - 배치 평균으로 표준오차를 함께 낸다. "몇 번 돌리면 충분한가" 를 감이 아니라
 *    수치로 답하기 위해서다. 등급 경계(15%·25%) 근처 상품은 이 값이 커야 할지
 *    말아야 할지를 가른다.
 *  - 낙인도 리자드도 없는 상품은 경로를 매일 그릴 이유가 없다. 관찰일에서 관찰일로
 *    한 번에 건너뛴다 — 근사가 아니라 기하 브라운 운동에서 정확히 같은 분포다.
 */

const DAYS = 252;

/**
 * 모형 판 번호. 계산 결과를 캐시하므로, 규칙이 바뀌면 이 값을 올려서 옛 캐시를 버린다.
 *  1 : 40,000 경로, 대조변량 없음, 리자드 미반영
 *  2 : 대조변량·배치 표준오차·리자드 조항·실제 평가일 격자
 */
export const MC_VERSION = 2;

/** xorshift128+ — Math.random 과 달리 시드를 고정할 수 있다 */
function rng(seed) {
  let s0 = seed >>> 0 || 1, s1 = (seed * 2654435761) >>> 0 || 2;
  let s2 = (seed ^ 0x9e3779b9) >>> 0 || 3, s3 = (seed * 69069 + 1) >>> 0 || 4;
  return () => {
    const t = s1 << 9;
    let r = s0 * 5; r = ((r << 7) | (r >>> 25)) * 9;
    s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t;
    s3 = (s3 << 11) | (s3 >>> 21);
    return ((r >>> 0) % 4294967296) / 4294967296;
  };
}

/** 상관계수 행렬의 촐레스키 분해. 반올림된 값이라 양정치가 깨질 수 있어 조금씩 보정한다. */
function cholesky(C) {
  const n = C.length;
  for (let ridge = 0; ridge <= 1e-3; ridge = ridge ? ridge * 10 : 1e-9) {
    const L = Array.from({ length: n }, () => new Float64Array(n));
    let ok = true;
    for (let i = 0; i < n && ok; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = C[i][j] + (i === j ? ridge : 0);
        for (let k = 0; k < j; k++) sum -= L[i][k] * L[j][k];
        if (i === j) {
          if (sum <= 0) { ok = false; break; }
          L[i][i] = Math.sqrt(sum);
        } else L[i][j] = sum / L[j][j];
      }
    }
    if (ok) return L;
  }
  return Array.from({ length: n }, (_, i) => Float64Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

/** 공시의 상관계수 목록(쌍 이름 문자열)을 기초자산 순서에 맞춘 행렬로 */
export function corrMatrix(underlyings, pairs) {
  const n = underlyings.length;
  const C = Array.from({ length: n }, (_, i) => Float64Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (const { pair, rho } of pairs || []) {
    const names = String(pair).split('·').map((s) => s.trim());
    const a = underlyings.indexOf(names[0]), b = underlyings.indexOf(names[1]);
    if (a >= 0 && b >= 0 && a !== b) { C[a][b] = rho; C[b][a] = rho; }
  }
  return C;
}

/**
 * p     : fromProspectus() 결과
 *         (underlyings, maturityMonths, maturityYears, schedule[{months,years,barrier}],
 *          knockIn, totalRate, principalProtection, lizard{months,barrier,payout})
 * vols  : [{asset, vol}]  연 변동성 %
 * pairs : [{pair, rho}]
 * opts  : { paths, seed, drift, batches }
 */
export function montecarlo(p, vols, pairs, opts = {}) {
  const want = opts.paths ?? 100000;
  const batches = opts.batches ?? 20;
  const drift = opts.drift ?? 0;
  const rand = rng(opts.seed ?? 20260823);

  const U = p.underlyings, n = U.length;
  const volOf = new Map((vols || []).map((v) => [v.asset, v.vol]));
  if (U.some((u) => !volOf.has(u))) return null;                 // 변동성이 없으면 돌리지 않는다
  const sig = U.map((u) => volOf.get(u) / 100);
  const L = cholesky(corrMatrix(U, pairs));

  const sch = p.schedule;
  const mat = p.maturityMonths;
  const matY = p.maturityYears || mat / 12;
  const yearsOf = (s, k) => (k === sch.length - 1 ? matY : (s.years ?? s.months / 12));

  // ── 시간 격자 ────────────────────────────────────────────────────────────
  // 낙인·리자드는 "기간 중 한 번이라도" 를 보므로 매 거래일이 필요하다.
  // 둘 다 없으면 만기·조기상환 평가일의 값만 있으면 되고, 그 사이를 한 걸음에
  // 건너뛰어도 분포가 정확히 같다.
  const daily = p.knockIn != null || p.lizard != null;
  let grid;
  if (daily) {
    const steps = Math.max(1, Math.round(matY * DAYS));
    grid = new Float64Array(steps);
    for (let i = 0; i < steps; i++) grid[i] = matY * (i + 1) / steps;
  } else {
    grid = Float64Array.from(sch.map(yearsOf));
  }
  const gn = grid.length;
  const nearest = (y) => {
    let k = 0;
    while (k < gn - 1 && grid[k] < y - 1e-9) k++;
    return k;
  };
  const obsIdx = sch.map((s, k) => nearest(yearsOf(s, k)));
  obsIdx[obsIdx.length - 1] = gn - 1;                            // 마지막은 반드시 만기
  const lizStep = p.lizard ? sch.findIndex((s) => s.months === p.lizard.months) : -1;

  // 스텝별 로그 드리프트와 확산 계수를 미리 계산한다 (내부 루프에서 sqrt 를 없앤다)
  const muS = Array.from({ length: gn }, () => new Float64Array(n));
  const sdS = Array.from({ length: gn }, () => new Float64Array(n));
  for (let t = 0; t < gn; t++) {
    const dt = grid[t] - (t ? grid[t - 1] : 0);
    const sq = Math.sqrt(dt);
    for (let a = 0; a < n; a++) {
      muS[t][a] = (drift - sig[a] * sig[a] / 2) * dt;
      sdS[t][a] = sig[a] * sq;
    }
  }

  const ki = p.knockIn, protect = p.principalProtection >= 100, full = p.totalRate;
  const lizRet = p.lizard ? (p.lizard.payout != null ? p.lizard.payout - 100 : p.lizard.rate * p.lizard.months / 12) : 0;

  // ── 표본 배치 ────────────────────────────────────────────────────────────
  // 대조변량 짝은 서로 음의 상관이라 같은 배치에 두어야 표준오차가 맞게 나온다.
  const pairsPerBatch = Math.max(1, Math.round(want / 2 / batches));
  const paths = pairsPerBatch * 2 * batches;

  const byStep = new Array(sch.length).fill(0);
  let loss = 0, kiHit = 0, lizHitCnt = 0, retSum = 0, annSum = 0, worst = Infinity, lossSum = 0;
  const batchLoss = new Float64Array(batches);

  const buf = new Float64Array(gn * n);                          // 한 경로분 독립 정규난수
  const lx = new Float64Array(n), z = new Float64Array(n);

  let spare = null;
  const normal = () => {
    if (spare !== null) { const v = spare; spare = null; return v; }
    let u1 = rand(); if (u1 < 1e-12) u1 = 1e-12;
    const r = Math.sqrt(-2 * Math.log(u1)), th = 2 * Math.PI * rand();
    spare = r * Math.sin(th);
    return r * Math.cos(th);
  };

  /** 미리 뽑아 둔 난수 버퍼로 경로 하나를 굴린다. sign = -1 이면 대조 경로. */
  const run = (sign) => {
    lx.fill(0);
    let hit = false, lizBroke = false, done = null, o = 0;

    for (let t = 0; t < gn && !done; t++) {
      const mu = muS[t], sd = sdS[t], base = t * n;
      for (let a = 0; a < n; a++) {
        let s = 0;
        for (let b = 0; b <= a; b++) s += L[a][b] * buf[base + b];
        z[a] = sign * s;
      }
      let wp = Infinity;
      for (let a = 0; a < n; a++) {
        lx[a] += mu[a] + sd[a] * z[a];
        const v = Math.exp(lx[a]) * 100;
        if (v < wp) wp = v;
      }
      if (ki != null && !hit && wp < ki) hit = true;               // 매 거래일 종가로 판정
      if (lizStep >= 0 && !lizBroke && wp < p.lizard.barrier) lizBroke = true;

      while (o < obsIdx.length && obsIdx[o] === t) {
        const last = o === sch.length - 1;
        if (wp >= sch[o].barrier) {
          done = { ret: full * (sch[o].months / mat), step: o };
        } else if (o === lizStep && !lizBroke) {
          // 리자드 — 배리어에는 못 미쳤지만 리자드 관찰선 아래로 내려간 적이 없으면 상환
          done = { ret: lizRet, step: o, liz: true };
        } else if (last) {
          if (protect) done = { ret: 0, step: o };
          else if (ki != null && !hit) done = { ret: full, step: o };
          else done = { ret: wp - 100, step: o, lost: true };
        }
        o++;
        if (done) break;
      }
    }
    if (!done) return 0;

    const months = sch[done.step].months;
    retSum += done.ret;
    annSum += done.ret * 12 / months;
    byStep[done.step]++;
    if (hit) kiHit++;
    if (done.liz) lizHitCnt++;
    if (done.ret < 0) { loss++; lossSum += done.ret; return 1; }
    if (done.ret < worst) worst = done.ret;
    return 0;
  };

  for (let b = 0; b < batches; b++) {
    let bl = 0;
    for (let k = 0; k < pairsPerBatch; k++) {
      for (let i = 0; i < gn * n; i++) buf[i] = normal();
      bl += run(1);
      bl += run(-1);                                              // 대조 경로
    }
    batchLoss[b] = bl / (pairsPerBatch * 2) * 100;
  }

  // 배치 평균의 표준오차 — 대조변량의 음의 상관까지 반영된 값이다
  const bm = batchLoss.reduce((s, v) => s + v, 0) / batches;
  const bv = batchLoss.reduce((s, v) => s + (v - bm) ** 2, 0) / (batches - 1);
  const se = Math.sqrt(bv / batches);

  return {
    paths,
    lossRate: loss / paths * 100,
    se,                                                           // 손실확률의 표준오차 (%p)
    ci95: 1.96 * se,                                              // 95% 신뢰구간 반폭 (%p)
    kiRate: kiHit / paths * 100,
    firstRate: byStep[0] / paths * 100,
    lizardRate: lizStep >= 0 ? lizHitCnt / paths * 100 : null,
    avgRet: retSum / paths,
    avgAnn: annSum / paths,
    worst: worst === Infinity ? 0 : worst,
    avgLoss: loss ? lossSum / loss : 0,                           // 손실이 났을 때 평균 얼마나 잃었나
    byStep: byStep.map((c) => c / paths * 100),                   // 차수별 상환 확률
    daily,
    steps: gn,
  };
}
