// ETF 편입종목 화면 — 수집·빌드가 같이 쓰는 것.
//
// 여기 있는 셈(빈 값 판정, 억 단위 글자 풀기, 총수익률)은 브라우저 없이
// scripts/etfh_test.mjs 가 시험한다. 고칠 때는 시험부터 돌린다.

export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 숫자 ────────────────────────────────────────────────
// **빈 값인지 먼저 보고, 그다음 숫자인지 본다.** Number('') 와 Number(null) 은 0 이고
// 0 은 숫자라서 isFinite 검사를 통과한다. 원천이 오늘 칸을 미리 만들어 두고 종가를
// 비워 두면 그 0 이 종가로 들어가 수익률이 -100% 가 된다.
export function num(x) {
  if (x === null || x === undefined) return null;
  if (typeof x === 'number') return Number.isFinite(x) ? x : null;
  if (typeof x === 'object') return num(x.raw);
  const s = String(x).trim().replace(/,/g, '').replace(/%$/, '').trim();
  if (s === '' || s === '-' || s === '--' || /^n\/?a$/i.test(s) || s === 'null') return null;
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return null;
  return Number(s);
}

// "1조 8,838억" · "-1,259억" · "41.4억" · "-1.47억" · "5,000만" · "0" → 억원 단위 수
export function eokFromKorean(x) {
  if (x === null || x === undefined) return null;
  let s = String(x).replace(/\s+/g, '').replace(/,/g, '').replace(/원$/, '');
  if (s === '' || s === '-') return null;
  let sign = 1;
  if (s[0] === '-') { sign = -1; s = s.slice(1); } else if (s[0] === '+') s = s.slice(1);
  const m = s.match(/^(?:(\d+(?:\.\d+)?)조)?(?:(\d+(?:\.\d+)?)억)?(?:(\d+(?:\.\d+)?)만)?$/);
  if (!m || (m[1] === undefined && m[2] === undefined && m[3] === undefined)) {
    const n = num(s);
    return n === null ? null : sign * n; // 단위 없는 수는 이미 억원으로 본다(목록의 marketSum)
  }
  const jo = m[1] ? Number(m[1]) : 0, eok = m[2] ? Number(m[2]) : 0, man = m[3] ? Number(m[3]) : 0;
  return sign * (jo * 10000 + eok + man / 10000);
}

// ── 날짜 ────────────────────────────────────────────────
export const ymd = (d) => d.toISOString().slice(0, 10);
export function parseYmd(s) { return new Date(`${s}T00:00:00Z`); }
export function addDays(s, n) { const d = parseYmd(s); d.setUTCDate(d.getUTCDate() + n); return ymd(d); }
export function addMonths(s, n) {
  const d = parseYmd(s);
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return ymd(new Date(Date.UTC(y, m, Math.min(day, last))));
}

// ── 총수익률 ────────────────────────────────────────────
// 시장가(종가)와 분배금을 짝지어 같은 식 하나로 센다 — 국내·해외 다르지 않다.
//   분배락일 t 의 하루 수익 = (종가_t + 분배금_t) / 종가_{t-1}
// 분배락일이 거래일이 아니면(휴장) 그 다음 거래일에 붙인다.
//
// bars: [{d:'YYYY-MM-DD', c:number}] 날짜 오름차순, 종가가 빈 봉은 넣지 않는다(cleanBars).
// divs: [{d:'YYYY-MM-DD', a:number}]
export function cleanBars(rows) {
  const out = [];
  const seen = new Set();
  for (const r of rows) {
    if (!r || !r.d) continue;
    const c = num(r.c);
    if (c === null || c <= 0) continue; // 빈 칸·0·음수는 종가가 아니다
    if (seen.has(r.d)) continue;
    seen.add(r.d);
    out.push({ d: r.d, c });
  }
  out.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  return out;
}

export function trIndex(bars, divs = []) {
  const ds = [...divs].filter((x) => x && num(x.a) !== null && num(x.a) > 0).sort((a, b) => (a.d < b.d ? -1 : 1));
  const idx = new Array(bars.length);
  let j = 0;
  // 첫 봉 이전의 분배금은 버린다
  while (j < ds.length && ds[j].d <= bars[0]?.d) j++;
  if (bars.length) idx[0] = 1;
  for (let i = 1; i < bars.length; i++) {
    let D = 0;
    while (j < ds.length && ds[j].d <= bars[i].d) { D += num(ds[j].a); j++; }
    idx[i] = idx[i - 1] * (bars[i].c + D) / bars[i - 1].c;
  }
  return idx;
}

export const PERIODS = ['D1', 'W1', 'M1', 'M3', 'M6', 'YTD', 'Y1', 'Y3', 'Y5', 'Y10'];
export const ANNUAL = { Y3: 3, Y5: 5, Y10: 10 };

export function targetDate(base, p) {
  switch (p) {
    case 'W1': return addDays(base, -7);
    case 'M1': return addMonths(base, -1);
    case 'M3': return addMonths(base, -3);
    case 'M6': return addMonths(base, -6);
    case 'YTD': return `${Number(base.slice(0, 4)) - 1}-12-31`;
    case 'Y1': return addMonths(base, -12);
    case 'Y3': return addMonths(base, -36);
    case 'Y5': return addMonths(base, -60);
    case 'Y10': return addMonths(base, -120);
    default: return null;
  }
}

// 기준일(마지막 봉)에서 기간별 총수익률(%).
// 시작 봉 = 목표일 이전(같은 날 포함) 마지막 봉. 목표일보다 이력이 짧으면 비운다.
// 시작 봉이 목표일에서 10일 넘게 떨어져 있으면(자료 구멍·거래 정지) 비운다.
// 3·5·10년은 기하평균 연율: (끝/시작)^(1/년수) − 1.
export function periodReturns(bars, idx) {
  const out = {};
  if (!bars.length) return { base: null, r: out };
  const n = bars.length, base = bars[n - 1].d;
  for (const p of PERIODS) {
    let si = -1;
    if (p === 'D1') si = n - 2;
    else {
      const t = targetDate(base, p);
      // 이분 탐색: d <= t 인 마지막 봉
      let lo = 0, hi = n - 1;
      while (lo <= hi) { const mid = (lo + hi) >> 1; if (bars[mid].d <= t) { si = mid; lo = mid + 1; } else hi = mid - 1; }
      if (si >= 0 && (parseYmd(t) - parseYmd(bars[si].d)) / 864e5 > 10) si = -1;
    }
    if (si < 0 || si >= n - 1) { out[p] = null; continue; }
    const ratio = idx[n - 1] / idx[si];
    if (!Number.isFinite(ratio) || ratio <= 0) { out[p] = null; continue; }
    const v = ANNUAL[p] ? Math.pow(ratio, 1 / ANNUAL[p]) - 1 : ratio - 1;
    out[p] = { v: Math.round(v * 1e6) / 1e4, from: bars[si].d };
  }
  return { base, r: out };
}

// ── HTTP ────────────────────────────────────────────────
export async function get(url, { tries = 3, headers = {}, method = 'GET', body, decode = 'utf8', timeout = 25000 } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { method, body, headers: { 'User-Agent': UA, Accept: '*/*', 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8', ...headers }, signal: AbortSignal.timeout(timeout) });
      if (res.status === 429 || res.status >= 500) { last = new Error(`HTTP ${res.status}`); await sleep(2000 * (i + 1) ** 2); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      const text = decode === 'euc-kr' ? new TextDecoder('euc-kr').decode(buf) : buf.toString('utf8');
      return { status: res.status, text, headers: res.headers };
    } catch (e) { last = e; await sleep(1500 * (i + 1)); }
  }
  throw last;
}
export async function getJson(url, opt) {
  const r = await get(url, opt);
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
  return JSON.parse(r.text);
}

// 동시에 k 개씩 돈다
export async function pool(items, k, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: k }, async () => {
    while (i < items.length) { const my = i++; try { out[my] = await fn(items[my], my); } catch (e) { out[my] = { error: String(e?.message || e) }; } }
  }));
  return out;
}

// 편입종목이 같은 종목인지 가르는 열쇠 — 코드가 있으면 코드, 없으면 이름(소문자)
export function holdingKey(h) {
  const code = (h.code || '').trim();
  if (code) return `c:${code.toUpperCase()}`;
  return `n:${(h.name || '').trim().toLowerCase().replace(/\s+/g, ' ')}`;
}
