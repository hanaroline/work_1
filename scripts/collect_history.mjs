#!/usr/bin/env node
/**
 * 기초자산 과거 시세 수집기 (과거 시뮬레이션용)
 *
 * data/els.js 에 실린 상품들의 기초자산을 훑어 Yahoo Finance 에서 일별 종가를
 * 받아온 뒤, 같은 파일의 `history` 에 합쳐 넣는다. 상품 수집(collect_els.mjs)과
 * 분리해 둔 이유는 시세 수집이 실패해도 상품 데이터는 그대로 두기 위해서다.
 *
 * 저장 형태 — 자산마다 거래일이 달라서 공통 날짜축에 맞춰 채워 넣는다.
 *   history: {
 *     updatedAt: '2026-08-04T...',
 *     dates:  [20160104, 20160105, ...],        // 공통 거래일(합집합)
 *     series: { KOSPI200: [100, 99.8, ...] },   // 첫 유효일 = 100 으로 리베이스
 *     symbols:{ KOSPI200: '^KS200' },
 *     missing: ['심볼을 모르는 기초자산']
 *   }
 * 아직 상장 전이라 값이 없는 구간은 null 이고, 페이지의 과거 시뮬레이션은
 * 해당 자산의 데이터가 시작된 뒤로만 발행일을 잡는다.
 *
 * 사용: node scripts/collect_history.mjs
 */

import { writeFile } from 'node:fs/promises';
import { readData, serializeData } from './collect_els.mjs';

const OUT_DATA = 'data/els.js';
const RANGE = '10y';

/**
 * 홈페이지 기초자산 표기 -> Yahoo 심볼
 * 표기가 늘어나면 여기에 추가한다. 매핑이 없으면 그 자산만 건너뛰고
 * missing 에 남기며, 해당 자산을 쓰는 상품은 과거 시뮬레이션을 표시하지 않는다.
 */
const SYMBOLS = {
  // 지수
  'KOSPI200': '^KS200',
  'KOSPI 200': '^KS200',
  'S&P500': '^GSPC',
  'SPX': '^GSPC',
  'Nikkei225': '^N225',
  'NIKKEI225': '^N225',
  'HSCEI': '^HSCE',
  'EuroStoxx50': '^STOXX50E',
  'EUROSTOXX50': '^STOXX50E',
  'NASDAQ100': '^NDX',
  // 국내 종목
  '삼성전자': '005930.KS',
  'SK하이닉스': '000660.KS',
  'LG에너지솔루션': '373220.KS',
  '현대차': '005380.KS',
  'POSCO홀딩스': '005490.KS',
  'NAVER': '035420.KS',
  '카카오': '035720.KS',
  '셀트리온': '068270.KS',
  // 해외 종목
  '마이크론 테크놀로지': 'MU',
  '팔란티어 테크': 'PLTR',
  '팔란티어 테크놀로지스': 'PLTR',
  '어플라이드 머티어리얼즈': 'AMAT',
  '엔비디아': 'NVDA',
  '테슬라': 'TSLA',
  '애플': 'AAPL',
  '아마존': 'AMZN',
  '알파벳': 'GOOGL',
  '마이크로소프트': 'MSFT',
  '메타 플랫폼스': 'META',
  '브로드컴': 'AVGO',
  'AMD': 'AMD',
  'TSMC': 'TSM',
  'ASML': 'ASML',
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

/** YYYYMMDD 정수 (UTC 기준) */
function ymd(epochSec) {
  const d = new Date(epochSec * 1000);
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

async function fetchSeries(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
              `?range=${RANGE}&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  const ts = r?.timestamp;
  const close = r?.indicators?.quote?.[0]?.close;
  if (!Array.isArray(ts) || !Array.isArray(close)) throw new Error('시계열이 비어 있음');

  const out = new Map();
  for (let i = 0; i < ts.length; i++) {
    if (close[i] == null || !Number.isFinite(close[i])) continue;
    out.set(ymd(ts[i]), close[i]);   // 같은 날짜가 겹치면 뒤엣것으로 덮어씀
  }
  if (!out.size) throw new Error('유효한 종가가 없음');
  return out;
}

async function main() {
  const { header, data } = await readData(OUT_DATA);

  const names = [...new Set(data.products.flatMap((p) => p.underlyings || []))].sort();
  console.log(`기초자산 ${names.length}종: ${names.join(', ')}`);

  const raw = new Map();       // 이름 -> Map(YYYYMMDD -> 종가)
  const symbols = {};
  const missing = [];
  for (const name of names) {
    const sym = SYMBOLS[name];
    if (!sym) { missing.push(name); console.log(`  ${name}: 심볼 매핑 없음 — 건너뜀`); continue; }
    try {
      const s = await fetchSeries(sym);
      raw.set(name, s);
      symbols[name] = sym;
      const ks = [...s.keys()];
      console.log(`  ${name} (${sym}): ${s.size}일, ${ks[0]} ~ ${ks[ks.length - 1]}`);
    } catch (e) {
      missing.push(name);
      console.log(`  ${name} (${sym}): 실패 — ${e?.message ?? e}`);
    }
  }

  if (!raw.size) {
    console.error('\n시세를 한 종목도 받지 못했습니다. data/els.js 는 그대로 둡니다.');
    process.exit(1);
  }

  // 공통 날짜축 = 받아온 모든 자산의 거래일 합집합
  const dates = [...new Set([...raw.values()].flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);

  // 자산별로 공통축에 맞춰 채우고(직전 종가 유지) 첫 유효일 = 100 으로 리베이스
  const series = {};
  for (const [name, m] of raw) {
    const filled = [];
    let last = null;
    let base = null;
    for (const d of dates) {
      const v = m.get(d);
      if (v != null) last = v;
      if (last == null) { filled.push(null); continue; }   // 상장 전 구간
      if (base == null) base = last;
      filled.push(Math.round((last / base) * 10000) / 100);
    }
    series[name] = filled;
  }

  data.history = {
    updatedAt: new Date().toISOString(),
    range: RANGE,
    source: 'Yahoo Finance (일별 종가)',
    dates,
    series,
    symbols,
    missing,
  };

  await writeFile(OUT_DATA, header + 'window.ELS_DATA = ' + serializeData(data) + ';\n');
  console.log(
    `\n${OUT_DATA} 갱신 완료 — ${Object.keys(series).length}종 / ${dates.length}거래일` +
    (missing.length ? ` (미수집 ${missing.length}종: ${missing.join(', ')})` : '')
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
