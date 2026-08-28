/**
 * ETF 수집기 공용 부품 — 네트워크·동시성·저장.
 *
 * 국내 1,163종목 + 해외 185종목을 하나씩 물어봐야 한다. 한 번에 다 던지면
 * 상대가 막고, 하나씩 던지면 몇십 분이 걸린다. 그 사이를 잡는 것이 여기 있는
 * mapLimit 과 재시도다.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 재시도가 붙은 JSON GET.
 *
 * 한 종목이 실패했다고 수집 전체를 죽이지 않는다. 실패한 종목은 그냥 빠지고,
 * 호출한 쪽이 몇 개가 빠졌는지 센다. 그래야 "오늘 수집이 반쪽이었다"를
 * 사람이 알 수 있다.
 */
export async function getJson(url, { headers = {}, tries = 3, timeoutMs = 15000 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json,text/plain,*/*',
                   'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8', ...headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      // 429/5xx 는 잠깐 기다리면 풀리는 경우가 많다. 지수적으로 물러선다.
      if (attempt < tries) await sleep(400 * 2 ** (attempt - 1));
    }
  }
  throw lastErr;
}

/**
 * 인코딩을 지정해 읽는 JSON GET.
 *
 * finance.naver.com 계열은 EUC-KR 로 내려온다. 그냥 res.json() 으로 읽으면
 * 한글이 통째로 깨진다 — "TIGER 미국S&P500" 이 "TIGER \ufffd\ufffd\ufffd\ufffdS&P500" 이 된다.
 * ASCII 만 있는 이름은 멀쩡해 보여서 한참 뒤에야 눈에 띈다.
 * (이 저장소의 scripts/fetch_market.py 도 같은 이유로 cp949 로 읽는다.)
 */
export async function getJsonIn(url, encoding, { headers = {}, tries = 3, timeoutMs = 15000 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json,text/plain,*/*',
                   'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8', ...headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      return JSON.parse(new TextDecoder(encoding, { fatal: false }).decode(buf));
    } catch (err) {
      lastErr = err;
      if (attempt < tries) await sleep(400 * 2 ** (attempt - 1));
    }
  }
  throw lastErr;
}

/**
 * 동시 실행 개수를 묶은 map.
 *
 * @param {Array}    items
 * @param {number}   limit    동시 실행 개수
 * @param {Function} fn       async (item, index) => result
 * @param {Function} onTick   진행 상황 보고 (선택)
 */
export async function mapLimit(items, limit, fn, onTick) {
  const out = new Array(items.length);
  let next = 0;
  let done = 0;

  async function worker() {
    for (;;) {
      const i = next;
      next += 1;
      if (i >= items.length) return;
      try {
        out[i] = { ok: true, value: await fn(items[i], i) };
      } catch (err) {
        out[i] = { ok: false, error: `${err.name}: ${err.message}` };
      }
      done += 1;
      if (onTick && done % 50 === 0) onTick(done, items.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  if (onTick) onTick(done, items.length);
  return out;
}

/** "25조 5,797억" / "8,983억" / "-669억" 같은 표기를 숫자(원)로 바꾼다. */
export function parseKoreanAmount(text) {
  if (text == null) return null;
  const s = String(text).replace(/,/g, '').trim();
  if (!s || s === '-') return null;
  const sign = s.startsWith('-') ? -1 : 1;
  const body = s.replace(/^[-+]/, '');
  let total = 0;
  let matched = false;
  const jo = body.match(/([\d.]+)\s*조/);
  const eok = body.match(/([\d.]+)\s*억/);
  const man = body.match(/([\d.]+)\s*만/);
  if (jo) { total += parseFloat(jo[1]) * 1e12; matched = true; }
  if (eok) { total += parseFloat(eok[1]) * 1e8; matched = true; }
  if (man) { total += parseFloat(man[1]) * 1e4; matched = true; }
  if (!matched) {
    const plain = parseFloat(body);
    if (!Number.isFinite(plain)) return null;
    return sign * plain;
  }
  return sign * total;
}

/** "33.66%" -> 33.66 */
export function parsePercent(text) {
  if (text == null) return null;
  const n = parseFloat(String(text).replace(/[%,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** 숫자로 만들되, 못 만들면 null. 빈 문자열이 0 으로 둔갑하는 것을 막는다. */
export function num(v) {
  if (v == null || v === '' || v === '-') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** [{periodTypeCode, value}] -> {D1: .., W1: ..} */
export function periodMap(list) {
  const out = {};
  for (const row of list || []) {
    const k = row.periodTypeCode || row.period;
    if (k) out[k] = num(row.value);
  }
  return Object.keys(out).length ? out : null;
}

/** [{detailTypeCode, weight}] -> {IT: 64.55, ...} — 0 인 칸은 버린다(자리만 먹는다). */
export function weightMap(list) {
  const out = {};
  for (const row of list || []) {
    const w = num(row.weight);
    if (row.detailTypeCode && w) out[row.detailTypeCode] = w;
  }
  return Object.keys(out).length ? out : null;
}

// ─────────────────── 기간수익률 계산 (국내·해외 공용) ───────────────────
/**
 * 일봉으로 기간수익률을 계산한다. **국내와 해외가 같은 계산기를 쓴다.**
 *
 * 수익률 계열이 시장마다 다르면 랭킹이 다른 개념을 견주게 된다. 그래서 총수익률은
 * 두 시장 모두 야후 일봉으로 여기서 계산한다.
 *   close    -> 가격수익률 (분배금 제외)
 *   adjclose -> 총수익률   (분배금 재투자) = 업계 표준
 *
 * 기준일에서 정확히 N개월 전 봉이 없을 수 있으므로(휴장) **그 날짜 이하의
 * 마지막 봉**을 쓴다. 구간이 데이터 범위를 벗어나면 아예 값을 내지 않는다 —
 * 상장 초기 종목의 1년 수익률이 상장일 대비가 되어 엉뚱하게 커지는 것을 막는다.
 */
/**
 * 총수익률 지수를 배당으로 직접 만든다.
 *
 * 야후의 수정종가(adjclose)를 믿으면 안 된다. 미국 종목에는 분배금이 반영돼
 * 있지만 **국내 종목에는 반영되지 않는다** — 검산에서 국내 128종목의
 * (adjclose 수익률 − close 수익률)이 분배율의 -0.11 배로 나왔다. 즉 국내는
 * adjclose 가 close 와 사실상 같다.
 *
 * 그래서 배당 이벤트(events=div)로 직접 지수를 만든다. 배당락일 봉에서
 * 분배금을 그날 종가에 재투자한 것으로 보고 이어 붙인다.
 *
 *   TR[0] = close[0]
 *   TR[i] = TR[i-1] × (close[i] + div[i]) / close[i-1]
 *
 * 이 방식은 시장을 가리지 않으므로 국내와 해외가 같은 뜻의 값을 갖는다.
 * 배당 자료가 아예 없으면 adjclose 로 물러선다(미국은 그쪽도 맞다).
 *
 * ── 주식분할 (2026-08 추가) ────────────────────────────────────────────────
 * 야후의 close 는 **분할이 반영되지 않은 원가격**이다. 분할이 있으면 그날
 * 종가에 계단이 생기고, 그 계단이 그대로 수익률이 된다. MAXIS S&P500(2558.T)
 * 의 3개월 수익률이 -89.75% 로 찍힌 것이 이것이었다 — S&P500 을 담은 ETF 가
 * 석 달에 90% 빠질 수는 없다.
 *
 * 그래서 분할 이벤트로 과거 봉을 오늘 기준에 맞춰 되돌린다. 어떤 봉의
 * **그 뒤에 일어난** 분할들의 (분모/분자) 를 모두 곱한다. 10:1 분할이면
 * 그 전 가격에 0.1 을 곱해야 오늘과 같은 자로 잰 것이 된다.
 * 분배금도 분할 전에 나온 것은 같은 배율로 되돌린다.
 *
 * ── 못 믿을 분배금 (2026-08 추가) ─────────────────────────────────────────
 * HANARO Fn전기&수소차(381560) 의 총수익률이 6개월 +1837% 로 찍혔다.
 * 시장가수익률은 +16.79% 로 멀쩡했으니 깨진 것은 재투자 지수뿐이었고,
 * 원인은 주가의 15.6 배짜리 분배금 레코드 한 건이었다.
 *
 * 지수는 곱으로 이어지므로 이런 레코드 하나가 그 뒤 구간을 통째로 오염시킨다.
 * 그래서 **주가 대비 30% 를 넘는 분배금은 쓰지 않는다.** ETF 분배금이 한 번에
 * 주가의 30% 를 넘는 일은 청산이 아니면 없다. 버린 레코드는 anomalies 로
 * 남겨 감사에서 보이게 한다.
 *
 * 그리고 마지막에 한 번 더 본다 — 총수익률과 시장가수익률의 격차가 분배금으로
 * 설명될 수 있는 크기를 넘으면 그 구간은 아예 값을 내지 않는다.
 * **틀린 숫자를 내보내느니 빈칸이 낫다.** 빈칸은 모른다는 뜻이지만 틀린
 * 숫자는 거짓말이다.
 *
 * 다만 이 한도를 **연율로 걸면 안 된다.** 국내 ETF 는 연 1회 분배가 많아
 * 4월에 한 해치를 한 번에 준다. 그 격차를 연율로 환산하면 1개월 구간에서
 * 연 56% 가 되지만, 실제로는 분배율 3.5% 짜리가 제 몫을 한 번에 준 것뿐이다
 * (TIGER 증권에서 확인). 연율 잣대를 쓰면 이런 정상값을 통째로 버리게 된다.
 *
 * 그래서 **누적**으로 본다. 구간이 길수록 분배금이 쌓일 여지를 준다.
 */
const DIV_MAX_RATIO = 0.30;      // 한 번의 분배금이 주가에서 차지할 수 있는 몫
// 한 구간에서 분배금이 만들 수 있는 격차의 상한(누적).
// 어느 구간이든 100% + 해마다 100%. 넉넉하게 잡은 것은 이 관문의 목적이
// "30% 가 맞나" 를 따지는 게 아니라 1,555% 같은 붕괴를 막는 것이기 때문이다.
const trCap = (spanYears) => 1.0 + Math.max(0, spanYears) * 1.0;

export function computeReturns(timestamps, closes, adjcloses, dividends, splits) {
  if (!timestamps?.length) return null;
  const anomalies = [];
  const dayOf = (sec) => new Date(sec * 1000).toISOString().slice(0, 10);

  // 분할을 날짜순으로 모은다. 분자/분모가 없으면 splitRatio 문자열("10:1")을 푼다.
  const splitList = [];
  for (const s of Object.values(splits || {})) {
    let num = Number(s?.numerator), den = Number(s?.denominator);
    if (!Number.isFinite(num) || !Number.isFinite(den)) {
      const m = String(s?.splitRatio || '').match(/^\s*([\d.]+)\s*[:/]\s*([\d.]+)\s*$/);
      if (m) { num = Number(m[1]); den = Number(m[2]); }
    }
    const at = Number(s?.date);
    if (!Number.isFinite(num) || !Number.isFinite(den) || num <= 0 || den <= 0 || !Number.isFinite(at)) continue;
    splitList.push({ day: dayOf(at), factor: den / num });
  }
  splitList.sort((a, b) => (a.day < b.day ? -1 : 1));

  /** 이 날짜의 가격을 오늘 기준으로 되돌리는 배율 = 그 뒤 분할들의 곱. */
  const adjustFor = (day) => {
    let f = 1;
    for (const s of splitList) if (s.day > day) f *= s.factor;
    return f;
  };

  // 배당을 날짜(UTC)로 묶어 둔다. 이벤트 타임스탬프는 봉 시각과 정확히
  // 같지 않을 수 있으므로 날짜로 맞춘다. 분할 전 배당은 같이 되돌린다.
  const divByDay = new Map();
  for (const d of Object.values(dividends || {})) {
    const amt = Number(d?.amount);
    const at = Number(d?.date);
    if (!Number.isFinite(amt) || !Number.isFinite(at) || amt <= 0) continue;
    const key = dayOf(at);
    divByDay.set(key, (divByDay.get(key) || 0) + amt * adjustFor(key));
  }

  const rows = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const c = closes?.[i];
    if (c == null || !Number.isFinite(c) || c <= 0) continue;
    const day = dayOf(timestamps[i]);
    const f = adjustFor(day);
    // adjclose 는 야후가 이미 분할까지 반영해 준다. 없을 때만 우리가 되돌린다.
    const a = adjcloses?.[i] != null ? adjcloses[i] : c * f;
    rows.push({ t: timestamps[i] * 1000, day, c: c * f, a, div: divByDay.get(day) || 0 });
  }
  if (rows.length < 2) return null;

  // 주가 대비 너무 큰 분배금은 레코드가 잘못된 것으로 보고 버린다.
  // 하나가 남으면 그 뒤 구간이 통째로 오염된다.
  for (const r of rows) {
    if (r.div > 0 && r.div / r.c > DIV_MAX_RATIO) {
      anomalies.push({ day: r.day, div: +r.div.toFixed(2), close: +r.c.toFixed(2),
                       ratio: +(r.div / r.c).toFixed(3), action: 'dropped' });
      r.div = 0;
    }
  }

  // ── 설명되지 않는 종가 계단 ──────────────────────────────────────────────
  // 분할 이벤트가 **하나도 없는데** 종가가 하루 만에 10배로 뛰거나 1/10 로
  // 떨어지는 종목이 있다. 되짚기에서 7종목을 확인했다.
  //
  //   2558.T MAXIS S&P500   2026-06-05 ×0.1 → 06-08 ×0.098 → 06-09 ×10.06
  //   1306.T NEXT FUNDS TOPIX  2026-03-30 ×0.098 → 04-01 ×10.48
  //   0197X0·252710·0193L0     2026-07-31 ×0.4 ~ ×0.56
  //
  // 이것이 야후가 이벤트로 적지 않은 액면분할인지, 그냥 깨진 봉인지는
  // 여기서 알 수 없다. 알 수 없으면 값을 내지 않는다 — 2558.T 의 3개월
  // 수익률이 -89.75% 로 나간 것이 이 계단이었다. S&P500 을 담은 ETF 가
  // 석 달에 90% 빠졌다는 말을 화면에 실을 수는 없다.
  //
  // 그래서 계단을 건너뛰는 구간은 통째로 빼고, 왜 뺐는지 남긴다.
  const breaks = [];
  for (let i = 1; i < rows.length; i += 1) {
    const j = rows[i].c / rows[i - 1].c;
    // 국내 가격제한폭이 ±30% 다. 2배 레버리지를 감안해도 하루 -40%/+70% 는
    // 가격이 아니라 자료가 바뀐 것으로 본다.
    if (j < 0.6 || j > 1.7) {
      breaks.push(rows[i].t);
      anomalies.push({ day: rows[i].day, from: +rows[i - 1].c.toFixed(2),
                       to: +rows[i].c.toFixed(2), ratio: +j.toFixed(3), action: 'break' });
    }
  }

  // 배당을 재투자한 지수를 만든다. 배당 자료가 없으면 adjclose 를 쓴다.
  const paid = rows.reduce((n, r) => n + (r.div > 0 ? 1 : 0), 0);
  const method = paid > 0 ? 'dividends' : 'adjclose';
  if (paid > 0) {
    let idx = rows[0].c;
    rows[0].a = idx;
    for (let i = 1; i < rows.length; i += 1) {
      idx *= (rows[i].c + rows[i].div) / rows[i - 1].c;
      rows[i].a = idx;
    }
  }

  const last = rows[rows.length - 1];
  const first = rows[0];
  const end = new Date(last.t);
  const back = (fn) => { const d = new Date(last.t); fn(d); return d.getTime(); };

  const PERIODS = {
    D1: back((d) => d.setDate(d.getDate() - 1)),
    W1: back((d) => d.setDate(d.getDate() - 7)),
    M1: back((d) => d.setMonth(d.getMonth() - 1)),
    M3: back((d) => d.setMonth(d.getMonth() - 3)),
    M6: back((d) => d.setMonth(d.getMonth() - 6)),
    YTD: new Date(Date.UTC(end.getUTCFullYear(), 0, 1)).getTime(),
    Y1: back((d) => d.setFullYear(d.getFullYear() - 1)),
    Y3: back((d) => d.setFullYear(d.getFullYear() - 3)),
    Y5: back((d) => d.setFullYear(d.getFullYear() - 5)),
  };
  // 3년·5년은 연율로 환산한다. 국내(네이버)가 연율로 주므로 기준을 맞춘다.
  const ANNUALIZE = { Y3: 3, Y5: 5 };
  // 구간이 몇 해치인지. 내포 분배율을 연율로 되돌려 한도와 견주는 데만 쓴다.
  const PERIOD_YEARS = {
    D1: 1 / 252, W1: 1 / 52, M1: 1 / 12, M3: 0.25, M6: 0.5, Y1: 1, Y3: 3, Y5: 5,
    YTD: Math.max((last.t - PERIODS.YTD) / (365.25 * 864e5), 1 / 252),
  };

  const price = {};
  const tr = {};
  for (const [key, cutoff] of Object.entries(PERIODS)) {
    if (cutoff < first.t) continue;
    let base = null;
    for (const row of rows) { if (row.t <= cutoff) base = row; else break; }
    if (!base || base === last) continue;
    // 계단을 건너뛰는 구간은 값을 내지 않는다. 계단 앞뒤의 가격은 같은
    // 자로 잰 것이 아니라서 나누어도 수익률이 아니다.
    if (breaks.some((b) => b > base.t && b <= last.t)) {
      anomalies.push({ period: key, action: 'period-dropped', reason: 'break' });
      continue;
    }
    const years = ANNUALIZE[key];
    const pct = (a, b) => {
      const r = a / b;
      if (!Number.isFinite(r) || r <= 0) return null;
      return +(((years ? r ** (1 / years) : r) - 1) * 100).toFixed(2);
    };
    const p = pct(last.c, base.c);
    let t = pct(last.a, base.a);
    // 마지막 관문 — 총수익률은 시장가수익률에 분배금만 얹은 것이다.
    // 그 차이가 내포하는 연 분배율이 한도를 넘으면 계산이 깨진 것이므로
    // 값을 내지 않는다. 틀린 숫자를 내보내느니 빈칸이 낫다.
    if (t != null && p != null) {
      const denom = 1 + p / 100;
      if (denom > 0) {
        const span = PERIOD_YEARS[key] ?? 1;
        // Y3·Y5 는 연율로 저장하므로 누적으로 되돌려 견준다.
        const ratio = years ? ((1 + t / 100) / denom) ** years : (1 + t / 100) / denom;
        const implied = ratio - 1;
        if (!Number.isFinite(implied) || implied > trCap(span)) {
          anomalies.push({ period: key, price: p, tr: t,
                           impliedCum: Number.isFinite(implied) ? +(implied * 100).toFixed(1) : null,
                           cap: +(trCap(span) * 100).toFixed(0),
                           action: 'tr-dropped' });
          t = null;
        }
      }
    }
    if (p != null) price[key] = p;
    if (t != null) tr[key] = t;
  }
  return { price: Object.keys(price).length ? price : null,
           tr: Object.keys(tr).length ? tr : null,
           method,                       // 'dividends' | 'adjclose'
           divCount: paid,
           anomalies: anomalies.length ? anomalies : null,
           asOf: new Date(last.t).toISOString().slice(0, 10) };
}

/**
 * 야후 일봉으로 한 종목의 기간수익률을 받는다. chart 는 crumb 없이 열려 있다.
 * events=div,split 을 반드시 붙인다 — 총수익률을 배당으로 직접 만들고,
 * close 는 분할이 반영되지 않은 원가격이라 분할도 같이 받아야 한다.
 * (div 만 받던 동안 분할이 있는 종목의 수익률이 통째로 틀렸다.)
 */
export async function fetchYahooReturns(symbol, { headers = {}, range = '5y' } = {}) {
  const json = await getJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?range=${range}&interval=1d&events=div,split`, { headers });
  const r = json?.chart?.result?.[0];
  if (!r) return null;
  return computeReturns(r.timestamp, r.indicators?.quote?.[0]?.close,
                        r.indicators?.adjclose?.[0]?.adjclose,
                        r.events?.dividends, r.events?.splits);
}

/** 브라우저가 <script> 로 읽을 수 있게 전역 하나를 정의하는 파일로 쓴다. */
export async function writeDataFile(path, globalName, value, banner) {
  await mkdir(dirname(path), { recursive: true });
  const head = banner ? `/* ${banner} */\n` : '';
  await writeFile(path, `${head}window.${globalName} = ${JSON.stringify(value)};\n`);
  const kb = (await readFile(path)).length / 1024;
  console.log(`[write] ${path} — ${kb.toFixed(0)} KB`);
  return kb;
}

/**
 * 수집 결과가 쓸 만한지 본다.
 *
 * 반쪽짜리 결과로 어제 데이터를 덮어쓰는 것이 제일 나쁘다. 화면은 멀쩡해
 * 보이는데 내용이 비어 있기 때문이다. 그래서 기준 미달이면 **파일을 건드리지
 * 않고** 종료한다 — ELS 수집기가 쓰는 방식과 같다.
 */
export function assertEnough(label, got, total, minRatio = 0.7) {
  const ratio = total ? got / total : 0;
  console.log(`[${label}] ${got}/${total} (${(ratio * 100).toFixed(1)}%)`);
  if (ratio < minRatio) {
    throw new Error(
      `${label}: 수집률 ${(ratio * 100).toFixed(1)}% 로 기준(${minRatio * 100}%) 미달 — ` +
      '기존 데이터를 지키기 위해 파일을 쓰지 않는다');
  }
}
