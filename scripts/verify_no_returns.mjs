#!/usr/bin/env node
/**
 * 수익률이 한 칸도 없는 7종목 — 원천에 직접 물어 까닭을 가른다.
 *
 *   node scripts/verify_no_returns.mjs
 *   -> tools/discovery/verify_no_returns.md · .json
 *
 * 감사에 수익률-없음 규칙을 넣고 나서 7종목이 드러났다.
 *
 *   310970 TIGER MSCI Korea TR     310960 TIGER 200TR
 *   475720 RISE 200위클리커버드콜   301400 PLUS 코스닥150
 *   0238P0 TIGER 미국S&P500미국채혼합50
 *   265690 ACE 러시아MSCI(합성)     SPLG  SPDR Portfolio S&P 500
 *
 * 국내 6종목은 네이버가 준 **기준가 수익률은 있다**(9칸). 없는 것은 시장가·
 * 총수익률뿐이고, 그 둘은 국내·해외 모두 **야후 일봉**에서 만든다. SPLG 도
 * 야후다. 그러니 일곱 모두 야후 쪽에서 갈린 것이다.
 *
 * 갈라야 할 것이 셋이다.
 *   (가) 야후에 그 심볼이 없다 — chart.error 가 오거나 result 가 비어 있다.
 *        그러면 심볼을 잘못 만들고 있는 것이다(우리는 무조건 `.KS` 를 붙인다).
 *   (나) 심볼은 있는데 값이 있는 봉이 2개 미만이다 — computeReturns 가
 *        rows.length < 2 에서 null 을 낸다. 상장 직후면 정상이다.
 *   (다) 봉은 넉넉한데도 계산기가 null 을 낸다 — 그러면 계산기를 봐야 한다.
 *
 * 그래서 응답을 있는 그대로 적고, 같은 자료로 computeReturns 를 돌려 본다.
 * 국내 종목은 `.KQ`(코스닥)·접미사 없음도 함께 물어 본다 — 접미사를 잘못
 * 붙이고 있다면 다른 쪽에서 값이 나온다.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { UA, computeReturns } from './etf_lib.mjs';

const TARGETS = [
  { code: '310970', name: 'TIGER MSCI Korea TR', market: 'KR' },
  { code: '310960', name: 'TIGER 200TR', market: 'KR' },
  { code: '475720', name: 'RISE 200위클리커버드콜', market: 'KR' },
  { code: '0238P0', name: 'TIGER 미국S&P500미국채혼합50', market: 'KR' },
  { code: '265690', name: 'ACE 러시아MSCI(합성)', market: 'KR' },
  { code: '301400', name: 'PLUS 코스닥150', market: 'KR' },
  { code: 'SPLG', name: 'SPDR Portfolio S&P 500 ETF', market: 'US' },
  // 대조군 — 같은 방식으로 값이 잘 나오는 종목. 프로브 자체가 고장 났을 때
  // 일곱 개가 전부 실패로 보이는 것을 막는다.
  { code: '069500', name: 'KODEX 200 (대조군)', market: 'KR' },
  { code: 'SPY', name: 'SPY (대조군)', market: 'US' },
];

/** 수집기가 쓰는 것과 **같은** URL·헤더로 부른다. 다르게 부르면 딴 것을 잰다. */
async function chart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
              `?range=5y&interval=1d&events=div,split`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json,text/plain,*/*',
                 Referer: 'https://finance.yahoo.com/' },
      signal: AbortSignal.timeout(20000),
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* HTML 오류쪽 */ }
    const r = json?.chart?.result?.[0];
    const err = json?.chart?.error;
    const ts = r?.timestamp || [];
    const cl = r?.indicators?.quote?.[0]?.close || [];
    const filled = cl.filter((v) => v != null && Number.isFinite(Number(v))).length;
    const day = (s) => new Date(Number(s) * 1000).toISOString().slice(0, 10);
    return {
      status: res.status,
      error: err ? `${err.code}: ${err.description}` : null,
      hasResult: !!r,
      bars: ts.length,
      filledCloses: filled,
      first: ts.length ? day(ts[0]) : null,
      last: ts.length ? day(ts[ts.length - 1]) : null,
      instrumentType: r?.meta?.instrumentType ?? null,
      metaSymbol: r?.meta?.symbol ?? null,
      firstTradeDate: Number.isFinite(Number(r?.meta?.firstTradeDate))
        ? day(r.meta.firstTradeDate) : null,
      currency: r?.meta?.currency ?? null,
      // 같은 자료로 계산기를 돌려 본다. 응답이 멀쩡한데 계산기가 null 을
      // 내면 원천이 아니라 우리 쪽 문제다.
      computed: (() => {
        if (!r) return null;
        const out = computeReturns(ts, cl, r?.indicators?.adjclose?.[0]?.adjclose,
                                   r?.events?.dividends, r?.events?.splits);
        if (!out) return { ok: false };
        return { ok: true,
                 priceKeys: out.price ? Object.keys(out.price).length : 0,
                 trKeys: out.tr ? Object.keys(out.tr).length : 0,
                 asOf: out.asOf ?? null };
      })(),
      bodyHead: json ? null : text.slice(0, 120),
    };
  } catch (err) {
    return { status: null, error: String(err && err.message || err), hasResult: false,
             bars: 0, filledCloses: 0, computed: null };
  }
}

const lines = [];
const say = (s = '') => { lines.push(s); console.log(s); };

say('# 수익률이 없는 7종목 — 원천 되짚기');
say('');
say(`실행 시각: ${new Date().toISOString()}`);
say('');
say('국내 6종목은 네이버 기준가 수익률은 있고 **시장가·총수익률만** 없다.');
say('그 둘은 국내·해외 모두 야후 일봉에서 만들므로, 일곱 다 야후 쪽에서 갈린다.');
say('');

const rows = [];
for (const t of TARGETS) {
  const variants = t.market === 'KR'
    ? [`${t.code}.KS`, `${t.code}.KQ`, t.code]
    : [t.code];
  const got = {};
  for (const v of variants) got[v] = await chart(v);
  rows.push({ ...t, variants, got });
}

say('## 수집기가 쓰는 심볼로 물었을 때');
say('');
say('| 종목 | 심볼 | HTTP | 오류 | 봉 | 값 있는 봉 | 첫 봉 | 마지막 봉 | 계산기 |');
say('|---|---|---:|---|---:|---:|---|---|---|');
for (const r of rows) {
  const sym = r.variants[0];
  const g = r.got[sym];
  const comp = !g.computed ? '—'
    : g.computed.ok ? `price ${g.computed.priceKeys}칸 · tr ${g.computed.trKeys}칸`
    : '**null**';
  say(`| ${r.code} ${r.name} | \`${sym}\` | ${g.status ?? '—'} | ${g.error || '—'} | ` +
      `${g.bars} | ${g.filledCloses} | ${g.first || '—'} | ${g.last || '—'} | ${comp} |`);
}

say('');
say('## 국내 종목 — 접미사를 바꿔 물었을 때');
say('');
say('우리는 국내 코드에 무조건 `.KS` 를 붙인다. 그것이 틀렸다면 다른 쪽에서 값이 나온다.');
say('');
say('⚠ **봉 수만 보면 안 된다.** `.KQ` 쪽이 봉을 잔뜩 주더라도 그것이 같은');
say('상품이어야 쓸 수 있다. 그래서 종목 종류(instrumentType)를 같이 적는다 —');
say('`ETF` 가 아니면 상장 ETF 가 아니라 **다른 상품**이다.');
say('');
say('| 종목 | `.KS` | `.KQ` | 접미사 없음 |');
say('|---|---|---|---|');
for (const r of rows.filter((x) => x.market === 'KR')) {
  const cell = (v) => {
    const g = r.got[v];
    if (!g) return '—';
    if (g.error) return `✗ ${g.error.split(':')[0]}`;
    return `${g.filledCloses}봉 · ${g.instrumentType || '종류미상'}` +
           (g.currency ? '' : ' · 통화없음');
  };
  say(`| ${r.code} ${r.name} | ${cell(`${r.code}.KS`)} | ${cell(`${r.code}.KQ`)} | ${cell(r.code)} |`);
}

say('');
say('## 판정');
say('');
for (const r of rows) {
  if (/대조군/.test(r.name)) continue;
  const g = r.got[r.variants[0]];
  // 같은 **상품**으로 값이 나오는 다른 심볼만 대안으로 친다. 종류가 ETF 가
  // 아니면 상장 ETF 가 아니라 그 뒤의 펀드 같은 딴 상품이고, 그 값을 시장가
  // 수익률로 쓰면 기준가(nav)를 시장가라고 부르는 꼴이 된다.
  const alt = r.variants.slice(1).find((v) => r.got[v] && !r.got[v].error
                                           && r.got[v].filledCloses >= 2
                                           && r.got[v].instrumentType === 'ETF');
  const wrongKind = r.variants.slice(1).find((v) => r.got[v] && !r.got[v].error
                                                && r.got[v].filledCloses >= 2
                                                && r.got[v].instrumentType !== 'ETF');
  const altNote = alt ? `. \`${alt}\` 로는 ${r.got[alt].filledCloses}봉이 온다 → **심볼을 잘못 만들고 있다**`
    : wrongKind ? `. \`${wrongKind}\` 가 ${r.got[wrongKind].filledCloses}봉을 주지만 종류가 ` +
                  `\`${r.got[wrongKind].instrumentType}\` 라 **상장 ETF 가 아니다** — 쓸 수 없다`
    : '';
  if (g.error || !g.hasResult) {
    say(`- **${r.code} ${r.name}** — 야후에 이 심볼이 없다 (\`${g.error || 'result 없음'}\`)` +
        (altNote || '. 다른 접미사로도 안 온다 → 야후가 이 종목을 아예 안 싣는다'));
  } else if (g.filledCloses < 2) {
    const born = g.firstTradeDate && g.firstTradeDate !== '1970-01-01' ? g.firstTradeDate : null;
    const fresh = born && (Date.now() - Date.parse(born)) < 30 * 864e5;
    say(`- **${r.code} ${r.name}** — 심볼은 맞는데(종류 \`${g.instrumentType}\`) 값이 있는 봉이 ` +
        `${g.filledCloses}개뿐이다` + (born ? ` (원천이 말하는 첫 거래일 ${born})` : ' (첫 거래일 미상)') +
        (fresh ? ' → **갓 상장해 이력이 없다**. 며칠 지나면 저절로 채워진다'
               : g.last && Date.now() - Date.parse(g.last) > 180 * 864e5
                 ? ` → 마지막 봉이 ${g.last} 다. **거래가 멈춘 종목**이라 그 뒤 자료가 없다`
                 : ' → **원천에 일봉 이력이 없다**. 심볼도 종류도 맞으므로 우리가 고칠 것이 아니라 ' +
                   '원천의 빈 구멍이다') + altNote);
  } else if (g.computed && !g.computed.ok) {
    say(`- **${r.code} ${r.name}** — 봉이 ${g.filledCloses}개나 있는데 계산기가 null 을 냈다 ` +
        '→ **우리 쪽 문제다**');
  } else if (g.computed && g.computed.ok) {
    say(`- **${r.code} ${r.name}** — 지금 물으니 값이 나온다 ` +
        `(price ${g.computed.priceKeys}칸, 기준일 ${g.computed.asOf}) → 수집 때만 실패했다(일시적)`);
  }
}

await mkdir('tools/discovery', { recursive: true });
await writeFile('tools/discovery/verify_no_returns.md', lines.join('\n') + '\n');
await writeFile('tools/discovery/verify_no_returns.json',
  JSON.stringify({ at: new Date().toISOString(), rows }, null, 1));
console.log('\n[verify] tools/discovery/verify_no_returns.md 기록');
