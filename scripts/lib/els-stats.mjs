/**
 * 통계 헬퍼 — 순위상관, 유의확률, 짝 세기, 단순회귀
 *
 * 표본이 열일곱이라 정규성을 가정할 수 없다. 그래서 피어슨이 아니라
 * 스피어만 순위상관을 쓰고, 유의확률도 함께 낸다. 상관계수만 적고
 * 유의성을 빼면 "0.7 이나 나왔다" 는 식으로 읽히는데, n=6 짜리 부분집합에서는
 * 0.7 도 우연으로 나온다.
 */

export const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

export function pearson(x, y) {
  const mx = mean(x), my = mean(y);
  let n = 0, dx = 0, dy = 0;
  for (let i = 0; i < x.length; i++) {
    n += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  return dx && dy ? n / Math.sqrt(dx * dy) : NaN;
}

/** 동점은 평균 순위를 준다 (변동성처럼 같은 값이 여럿인 열이 있다) */
export function rank(a) {
  const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
  const r = new Array(a.length);
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}

// ── t 분포 양측 유의확률 (불완전베타 연속분수) ────────────────────────────────
function betacf(a, b, x) {
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-12) break;
  }
  return h;
}

function gammaln(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, t = x + 5.5;
  t -= (x + 0.5) * Math.log(t);
  let s = 1.000000000190015;
  for (let j = 0; j < 6; j++) s += c[j] / ++y;
  return -t + Math.log(2.5066282746310005 * s / x);
}

function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b)
    + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2)
    ? bt * betacf(a, b, x) / a
    : 1 - bt * betacf(b, a, 1 - x) / b;
}

/** 상관계수 r 과 표본 수 n 에 대한 양측 p */
export function pValue(r, n) {
  if (!Number.isFinite(r) || n < 3) return NaN;
  if (Math.abs(r) >= 1) return 0;
  const df = n - 2, t = r * Math.sqrt(df / (1 - r * r));
  return betai(df / 2, 0.5, df / (df + t * t));
}

/** 스피어만 순위상관 + 유의확률 */
export function spearman(x, y) {
  const n = x.length;
  const r = pearson(rank(x), rank(y));
  return { r, p: pValue(r, n), n, sig: pValue(r, n) < 0.05 };
}

/** 단순회귀 y = a + bx */
export function regress(x, y) {
  const mx = mean(x), my = mean(y);
  let num = 0, den = 0;
  for (let i = 0; i < x.length; i++) {
    num += (x[i] - mx) * (y[i] - my);
    den += (x[i] - mx) ** 2;
  }
  const b = den ? num / den : NaN;
  const r = pearson(x, y);
  return { slope: b, intercept: my - b * mx, r2: r * r, n: x.length };
}

/**
 * 짝 단위로 "x 가 큰 쪽이 y 도 큰가" 를 센다.
 * 상관계수보다 상담에서 설명하기 쉽다 — "136 짝 중 102 짝이 그랬습니다".
 * tie 는 y 차이가 tol 보다 작아 사실상 같다고 볼 짝이다.
 */
export function pairAgreement(list, xf, yf, tol = 0.3) {
  let ok = 0, bad = 0, tie = 0;
  const flipped = [];
  for (let a = 0; a < list.length; a++) {
    for (let b = a + 1; b < list.length; b++) {
      const [hi, lo] = xf(list[a]) >= xf(list[b]) ? [list[a], list[b]] : [list[b], list[a]];
      if (xf(hi) === xf(lo)) { tie++; continue; }
      const d = yf(hi) - yf(lo);
      if (d > tol) ok++;
      else if (d < -tol) { bad++; flipped.push({ hi, lo, d }); }
      else tie++;
    }
  }
  const n = ok + bad + tie;
  return { n, ok, bad, tie, pct: n ? ok / n * 100 : NaN, flipped: flipped.sort((p, q) => p.d - q.d) };
}
