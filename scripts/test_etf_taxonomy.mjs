#!/usr/bin/env node
/**
 * 분류 사전 회귀 테스트 — 네트워크 없이 돈다.
 *
 *   node scripts/test_etf_taxonomy.mjs
 *
 * 규칙 기반 분류는 사전을 고칠 때마다 다른 데가 틀어진다. 실제로 겪은 것:
 *   - 'US' 를 미국 키워드로 넣었더니 "PLUS 고배당주" 가 미국 ETF 가 됐다.
 *   - 'IT' 를 인터넷 키워드로 넣었더니 "...Equity ETF" 에 IT 테마가 붙었다.
 *   - '금' 을 원자재 키워드로 넣었더니 "TIGER 금융" 이 원자재가 됐다.
 *
 * 그래서 한 번 고친 칸은 여기 사례로 박아 둔다. 사전을 고쳤는데 이 파일이
 * 빨간불이면, 고친 게 다른 데를 망가뜨린 것이다.
 *
 * 기대값에 적은 항목만 본다. region 만 적었으면 region 만 검사한다.
 * themes 는 "이것들이 들어 있어야 한다", notThemes 는 "이건 없어야 한다".
 */

import { classify } from './etf_taxonomy.mjs';

const CASES = [
  // ── 국내: 기본
  { name: 'KODEX 200', listedIn: 'KR', indexName: '코스피 200',
    expect: { manager: '삼성자산운용', region: 'korea', assetClass: 'equity', index: 'KOSPI 200' } },
  { name: 'TIGER 200', listedIn: 'KR', indexName: '코스피 200',
    expect: { manager: '미래에셋자산운용', region: 'korea', index: 'KOSPI 200' } },
  { name: 'RISE 코스닥150', listedIn: 'KR',
    expect: { manager: 'KB자산운용', region: 'korea', index: 'KOSDAQ 150' } },
  { name: 'ACE 국고채10년', listedIn: 'KR',
    expect: { manager: '한국투자신탁운용', region: 'korea', assetClass: 'bond' } },
  { name: 'SOL 미국배당다우존스', listedIn: 'KR',
    expect: { manager: '신한자산운용', region: 'us', themes: ['dividend'] } },

  // ── 국내: 해외 투자
  { name: 'TIGER 미국나스닥100', listedIn: 'KR',
    expect: { region: 'us', index: 'NASDAQ 100', assetClass: 'equity' } },
  { name: 'KODEX 미국S&P500', listedIn: 'KR',
    expect: { region: 'us', index: 'S&P 500' } },
  { name: 'TIGER 차이나항셍테크', listedIn: 'KR',
    expect: { region: 'china', index: 'Hang Seng Tech' } },
  { name: 'KODEX 일본TOPIX', listedIn: 'KR',
    expect: { region: 'japan', index: 'TOPIX' } },
  { name: 'TIGER 인도니프티50', listedIn: 'KR',
    expect: { region: 'india', index: 'NIFTY 50' } },
  { name: 'ACE 베트남VN30', listedIn: 'KR',
    expect: { region: 'vietnam' } },

  // ── 여기서부터가 실제로 틀렸던 칸들 ──────────────────────────

  // 'US' 가 PLUS 안에 박혀 미국으로 갔던 사례
  { name: 'PLUS 고배당주', listedIn: 'KR',
    expect: { manager: '한화자산운용', region: 'korea', themes: ['dividend'] } },
  { name: 'PLUS 200', listedIn: 'KR',
    expect: { region: 'korea' } },

  // '금' 한 글자가 금융·은행을 원자재로 끌고 갔던 사례
  { name: 'TIGER 은행고배당플러스TOP10', listedIn: 'KR',
    expect: { region: 'korea', assetClass: 'equity', themes: ['finance', 'dividend'],
              notThemes: ['gold'] } },
  { name: 'KODEX 금융', listedIn: 'KR',
    expect: { assetClass: 'equity', themes: ['finance'], notThemes: ['gold'] } },
  { name: 'TIGER 골드선물(H)', listedIn: 'KR',
    expect: { assetClass: 'commodity', themes: ['gold'], flags: ['hedged'] } },
  { name: 'ACE KRX금현물', listedIn: 'KR',
    expect: { assetClass: 'commodity', themes: ['gold'] } },
  { name: 'KODEX 머니마켓액티브', listedIn: 'KR',
    expect: { assetClass: 'money', flags: ['active'], notThemes: ['gold'] } },

  // 'IT' 가 EQUITY 안에 박혀 인터넷 테마가 붙던 사례
  { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', listedIn: 'US',
    family: 'Charles Schwab',
    expect: { manager: 'Schwab', region: 'us', themes: ['dividend'],
              notThemes: ['internet'] } },

  // 'AI' 두 글자가 다른 단어에 섞이던 사례
  { ticker: 'JETS', name: 'US Global Jets ETF', listedIn: 'US', family: 'US Global Investors',
    expect: { notThemes: ['ai'] } },
  { name: 'TIGER 글로벌AI인프라액티브', listedIn: 'KR',
    expect: { region: 'global', themes: ['ai', 'infra'], flags: ['active'] } },

  // ── 플래그
  { name: 'KODEX 레버리지', listedIn: 'KR',
    expect: { flags: ['leverage'] } },
  { name: 'TIGER 200선물인버스2X', listedIn: 'KR',
    expect: { region: 'korea', index: 'KOSPI 200', flags: ['leverage', 'inverse'] } },
  { name: 'KODEX 미국S&P500커버드콜액티브(H)', listedIn: 'KR',
    expect: { region: 'us', index: 'S&P 500', flags: ['covered', 'hedged', 'active'] } },
  { name: 'TIGER 미국나스닥100커버드콜(합성)', listedIn: 'KR',
    expect: { flags: ['covered', 'synthetic'] } },

  // ── 테마
  { name: 'RISE 미국반도체NYSE', listedIn: 'KR',
    expect: { region: 'us', themes: ['semiconductor'] } },
  { name: 'TIGER 2차전지테마', listedIn: 'KR',
    expect: { themes: ['battery'] } },
  { name: 'SOL 조선TOP3플러스', listedIn: 'KR',
    expect: { themes: ['ship'] } },
  { name: 'PLUS K방산', listedIn: 'KR',
    expect: { themes: ['defense'] } },
  { name: 'HANARO 원자력iSelect', listedIn: 'KR',
    expect: { themes: ['nuclear'] } },
  { name: 'TIGER 헬스케어', listedIn: 'KR',
    expect: { themes: ['bio'] } },
  { name: 'KODEX 자동차', listedIn: 'KR',
    expect: { themes: ['auto'] } },
  { name: 'TIGER 글로벌자율주행&전기차SOLACTIVE', listedIn: 'KR',
    expect: { themes: ['ev'], notThemes: ['auto'] } },
  { name: 'KODEX 한국부동산리츠인프라', listedIn: 'KR',
    expect: { assetClass: 'reit', themes: ['infra'] } },
  { name: 'KODEX 비트코인선물액티브(H)', listedIn: 'KR',
    expect: { assetClass: 'crypto', flags: ['hedged', 'active'] } },

  // ── 해외 상장
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', listedIn: 'US',
    family: 'State Street Investment Management',
    expect: { manager: 'State Street (SPDR)', region: 'us', index: 'S&P 500' } },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', listedIn: 'US', family: 'Invesco',
    expect: { manager: 'Invesco', region: 'us' } },
  { ticker: 'SMH', name: 'VanEck Semiconductor ETF', listedIn: 'US', family: 'VanEck',
    expect: { manager: 'VanEck', themes: ['semiconductor'] } },
  { ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', listedIn: 'US',
    family: 'BlackRock',
    expect: { manager: 'BlackRock (iShares)', assetClass: 'bond' } },
  { ticker: '2800', name: 'Tracker Fund of Hong Kong', listedIn: 'HK',
    family: 'Hang Seng Investment Management Ltd',
    expect: { region: 'china' } },
  { ticker: '1306', name: 'NEXT FUNDS TOPIX ETF', listedIn: 'JP',
    family: 'Nomura Asset Management Co Ltd',
    expect: { manager: 'Nomura', region: 'japan', index: 'TOPIX' } },
  { ticker: '510300', name: 'ChinaAMC CSI 300 Index ETF', listedIn: 'SS',
    family: 'China Asset Management',
    expect: { region: 'china', index: 'CSI 300' } },
  { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', listedIn: 'US',
    family: 'Vanguard',
    expect: { manager: 'Vanguard', region: 'emerging' } },
  { ticker: 'GLD', name: 'SPDR Gold Shares', listedIn: 'US', family: 'State Street',
    expect: { assetClass: 'commodity', themes: ['gold'] } },
  { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', listedIn: 'US',
    family: 'J.P. Morgan',
    expect: { manager: 'J.P. Morgan', flags: ['covered'], notThemes: ['internet'] } },
];

let failed = 0;
let checks = 0;

for (const c of CASES) {
  const got = classify(c);
  const problems = [];

  for (const [key, want] of Object.entries(c.expect)) {
    checks += 1;
    if (key === 'themes' || key === 'flags') {
      const missing = want.filter((w) => !got[key].includes(w));
      if (missing.length) problems.push(`${key} 에 ${missing.join(',')} 없음 (실제: ${got[key].join(',') || '없음'})`);
    } else if (key === 'notThemes') {
      const wrong = want.filter((w) => got.themes.includes(w));
      if (wrong.length) problems.push(`themes 에 ${wrong.join(',')} 가 잘못 붙음`);
    } else if (got[key] !== want) {
      problems.push(`${key}: ${want} 이어야 하는데 ${got[key]}`);
    }
  }

  if (problems.length) {
    failed += 1;
    console.log(`✗ ${c.name}`);
    for (const p of problems) console.log(`    ${p}`);
  }
}

console.log(`\n${CASES.length - failed}/${CASES.length} 통과 (검사 ${checks}건)`);
process.exit(failed ? 1 : 0);
