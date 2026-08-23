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
 * 가정
 *  - 로그정규, 드리프트는 E[S_T] = S_0 이 되게 잡는다(-σ²/2). 어느 기초자산이 오른다·
 *    내린다고 보지 않는다는 뜻이다. drift 인자로 연 기대수익률을 넣어 민감도를 볼 수 있다.
 *  - 관찰은 거래일 기준 연 252일, 낙인은 매 거래일 종가로 판정한다(공시와 같은 기준).
 *  - 조기상환 수익률은 backtest 와 같은 규칙: totalRate × (경과월 / 만기월).
 *  - 난수는 고정 시드라 같은 입력이면 같은 결과가 나온다(문서 숫자가 빌드마다 흔들리면 안 된다).
 */

const DAYS = 252;

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
 * p     : fromProspectus() 결과 (underlyings, maturityMonths, schedule[{months,barrier}], knockIn, totalRate, principalProtection)
 * vols  : [{asset, vol}]  연 변동성 %
 * pairs : [{pair, rho}]
 * opts  : { paths, seed, drift }  drift = 연 기대수익률(소수). 기본 0 = 오른다고도 내린다고도 보지 않음
 */
export function montecarlo(p, vols, pairs, opts = {}) {
  const paths = opts.paths ?? 40000;
  const drift = opts.drift ?? 0;
  const rand = rng(opts.seed ?? 20260823);

  const U = p.underlyings, n = U.length;
  const volOf = new Map((vols || []).map((v) => [v.asset, v.vol]));
  if (U.some((u) => !volOf.has(u))) return null;                 // 변동성이 없으면 돌리지 않는다
  const sig = U.map((u) => volOf.get(u) / 100);
  const L = cholesky(corrMatrix(U, pairs));

  const mat = p.maturityMonths;
  const steps = Math.max(1, Math.round(mat / 12 * DAYS));
  const dt = (mat / 12) / steps;
  const sq = Math.sqrt(dt);
  const mu = sig.map((s) => (drift - s * s / 2) * dt);           // 로그 드리프트

  // 관찰일 -> 스텝 인덱스 (마지막은 반드시 만기)
  const sch = p.schedule;
  const obs = sch.map((s, k) => (k === sch.length - 1 ? steps : Math.min(steps, Math.max(1, Math.round(s.months / 12 * DAYS)))));

  const ki = p.knockIn, protect = p.principalProtection >= 100, full = p.totalRate;
  const byStep = new Array(sch.length).fill(0);
  let loss = 0, kiHit = 0, retSum = 0, annSum = 0, worst = Infinity;
  let lossSum = 0;                                               // 손실난 경로의 손실률 합 (조건부 평균손실)

  const lx = new Float64Array(n);                                 // 로그 가격 (기준가 = 0)
  const z = new Float64Array(n), g = new Float64Array(n);
  let spare = null;
  const normal = () => {
    if (spare !== null) { const v = spare; spare = null; return v; }
    let u1 = rand(); if (u1 < 1e-12) u1 = 1e-12;
    const r = Math.sqrt(-2 * Math.log(u1)), th = 2 * Math.PI * rand();
    spare = r * Math.sin(th);
    return r * Math.cos(th);
  };

  for (let path = 0; path < paths; path++) {
    lx.fill(0);
    let hit = false, done = null, o = 0;

    for (let t = 1; t <= steps && !done; t++) {
      for (let a = 0; a < n; a++) g[a] = normal();
      for (let a = 0; a < n; a++) {                               // 상관 부여
        let s = 0;
        for (let b = 0; b <= a; b++) s += L[a][b] * g[b];
        z[a] = s;
      }
      let wp = Infinity;
      for (let a = 0; a < n; a++) {
        lx[a] += mu[a] + sig[a] * sq * z[a];
        const v = Math.exp(lx[a]) * 100;
        if (v < wp) wp = v;
      }
      if (ki != null && !hit && wp < ki) hit = true;              // 매 거래일 종가로 낙인 판정

      while (o < obs.length && obs[o] === t) {
        const last = o === sch.length - 1;
        if (wp >= sch[o].barrier) {
          done = { ret: full * (sch[o].months / mat), step: o };
        } else if (last) {
          if (protect) done = { ret: 0, step: o };
          else if (ki != null && !hit) done = { ret: full, step: o };
          else done = { ret: wp - 100, step: o, lost: true };
        }
        o++;
        if (done) break;
      }
    }
    if (!done) continue;

    const months = sch[done.step].months;
    retSum += done.ret;
    annSum += done.ret * 12 / months;
    byStep[done.step]++;
    if (hit) kiHit++;
    if (done.ret < 0) { loss++; lossSum += done.ret; }
    if (done.ret < worst) worst = done.ret;
  }

  return {
    paths,
    lossRate: loss / paths * 100,
    kiRate: kiHit / paths * 100,
    firstRate: byStep[0] / paths * 100,
    avgRet: retSum / paths,
    avgAnn: annSum / paths,
    worst: worst === Infinity ? 0 : worst,
    avgLoss: loss ? lossSum / loss : 0,                           // 손실이 났을 때 평균 얼마나 잃었나
    byStep: byStep.map((c) => c / paths * 100),
  };
}
