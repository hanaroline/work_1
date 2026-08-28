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
