#!/usr/bin/env node
/**
 * 펀드 원천 탐색 6차 — 펀드다모아 통합공시에 보유종목이 있는가.
 *
 *   node scripts/probe_fund_sources6.mjs
 *   -> tools/discovery/fund_probe6.{json,md}
 *
 * 5차에서 두 가지가 풀렸다.
 *
 *   1. 앱 이름이 **FS-DIS2** 다. 내가 쓰던 FS-COM 이 오류의 원인이었다.
 *      실제로 오간 서비스: DISMenuSO · DISComConnLogSO · DISSmallSizeFundSO ·
 *      COMDetCdMngInqSO(FS-COM).
 *   2. 사이트 경로 147개를 확보했다. 펀드 화면만 60여 개다.
 *
 * 남은 관문은 하나. **펀드별 보유종목(자산구성)을 주는 화면이 있는가.**
 * 147개 목록에 "자산구성" 으로 보이는 이름이 없다. 다만 펀드다모아 쪽
 * DISFundAnnFundUnit(펀드 단위 통합공시)이 이름 그대로라면 한 펀드의 공시를
 * 통째로 모아 줄 자리다. 거기 있으면 있는 것이고, 없으면 금투협에는 없다.
 *
 * 5차의 실수도 고친다. 그때 누른 "검색" 은 화면의 조회 버튼이 아니라 사이트
 * 전역 검색이었을 수 있다. 그래서 이번에는
 *
 *   - 버튼을 **id 와 글자까지 전부 찍어 남기고**
 *   - 본문 영역 안의 조회/검색 버튼만 골라 누르고
 *   - 누른 뒤 나간 POST 를 **본문까지 통째로** 저장한다
 *
 * 무엇을 눌렀는지 기록에 남지 않으면 다음 사람이 또 같은 자리를 판다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_probe6.json';
const OUT_MD = 'tools/discovery/fund_probe6.md';
const BASE = 'https://dis.kofia.or.kr';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// 보유종목이 있을 만한 곳부터. 앞의 둘이 이번 탐색의 목적이다.
const SCREENS = [
  ['펀드다모아 펀드단위 통합공시', '/wq/damoa/DISFundAnnFundUnit.xml'],
  ['펀드다모아 펀드검색', '/wq/damoa/DISMYFundSch.xml'],
  ['펀드 비교검색', '/wq/fundann/DISFundCmprSrch.xml'],
  ['펀드 표준코드', '/wq/etcann/DISFundStandardCD.xml'],
  ['기준가 수익률', '/wq/fundann/DISFundStdPrcRate.xml'],
  ['유형별 펀드', '/wq/fundann/DISFundByType.xml'],
];

// 응답에 이것이 있으면 보유종목이다. 없으면 없는 것이다.
const HOLDING_WORDS = /자산구성|보유종목|주식종목|편입종목|종목명|투자비중|보유비중/;

const out = { at: new Date().toISOString(), screens: [] };

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA });

// 홈을 먼저 열어 세션을 받는다. 바로 화면으로 들어가면 튕긴다.
const home = await ctx.newPage();
await home.goto(`${BASE}/websquare/index.jsp?w2xPath=/wq/main/main.xml`,
  { waitUntil: 'domcontentloaded', timeout: 40000 });
await home.waitForTimeout(3000);
console.log(`세션 확보 — ${await home.title().catch(() => '–')}\n`);

for (const [label, path] of SCREENS) {
  const page = await ctx.newPage();
  const posts = [];
  const responses = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && /XMLSERVICES|proframe/i.test(r.url())) {
      posts.push({ url: r.url(), body: (r.postData() || '').slice(0, 6000) });
    }
  });
  page.on('response', async (r) => {
    if (!/XMLSERVICES|proframe/i.test(r.url())) return;
    try {
      const buf = Buffer.from(await r.body());
      const utf8 = buf.toString('utf8');
      const euckr = new TextDecoder('euc-kr', { fatal: false }).decode(buf);
      const ko = (s) => (s.match(/[가-힣]/g) || []).length;
      const text = ko(euckr) > ko(utf8) ? euckr : utf8;
      responses.push({ status: r.status(), bytes: buf.length, body: text.slice(0, 6000) });
    } catch { /* 본문 못 읽는 응답도 있다 */ }
  });

  const screen = { label, path };
  try {
    await page.goto(`${BASE}/websquare/index.jsp?w2xPath=${path}`,
      { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(5000);

    // 화면에 무엇이 있는지 통째로 남긴다. 무엇을 눌렀는지가 기록에 남아야
    // 다음 사람이 같은 자리를 다시 파지 않는다.
    screen.controls = await page.evaluate(() => {
      const all = [...document.querySelectorAll(
        'button, input[type=button], input[type=submit], a[role=button], a.btn, .w2trigger')];
      return all.slice(0, 60).map((e) => {
        const r = e.getBoundingClientRect();
        return {
          id: e.id || null,
          text: (e.innerText || e.value || e.getAttribute('title') || '').trim().slice(0, 30),
          top: Math.round(r.top),
          visible: r.width > 0 && r.height > 0,
        };
      }).filter((e) => e.id || e.text);
    });

    // 조회 버튼을 고른다. 사이트 전역 검색(맨 위)을 피하려고 화면 위쪽
    // 100px 안의 것은 제외한다 — 5차에서 그걸 눌렀을 수 있다.
    const cands = screen.controls.filter((b) =>
      b.visible && b.top > 100 && /조회|검색|search|srch|inqr/i.test((b.id || '') + ' ' + b.text));
    screen.candidates = cands;

    const before = posts.length;
    for (const c of cands.slice(0, 3)) {
      try {
        const sel = c.id ? `#${CSS.escape(c.id)}` : `text=${c.text}`;
        await page.locator(sel).first().click({ timeout: 5000 });
        screen.clicked = { id: c.id, text: c.text, top: c.top };
        await page.waitForTimeout(6000);
        if (posts.length > before) break;   // 뭔가 나갔으면 성공
      } catch { /* 다음 후보 */ }
    }

    screen.text = (await page.evaluate(() => document.body?.innerText || '')).slice(0, 2000);
    // 화면 글에 보유종목 낌새가 있는지도 본다.
    screen.textHasHolding = HOLDING_WORDS.test(screen.text);
  } catch (e) {
    screen.error = String(e.message || e).slice(0, 200);
  }
  screen.posts = posts;
  screen.responses = responses;

  // 응답 안에 보유종목이 있는가 — 이번 탐색의 목적이다.
  screen.holdingHit = responses.filter((r) => HOLDING_WORDS.test(r.body));
  const svcs = [...new Set(posts.map((p) =>
    ((p.body.match(/<pfmAppName>([^<]*)</) || [])[1] || '?') + '/' +
    ((p.body.match(/<pfmSvcName>([^<]*)</) || [])[1] || '?')))];

  console.log(`── ${label}  (${path})`);
  console.log(`   버튼 ${screen.controls?.length ?? 0}개 · 조회후보 ${screen.candidates?.length ?? 0}개 · ` +
              `누름: ${screen.clicked ? (screen.clicked.id || screen.clicked.text) : '(없음)'}`);
  console.log(`   POST ${posts.length}건 · 응답 ${responses.length}건`);
  console.log(`   서비스: ${svcs.join(', ') || '–'}`);
  console.log(`   ★ 보유종목 낌새 — 화면글 ${screen.textHasHolding ? '있음' : '없음'} · 응답 ${screen.holdingHit.length}건\n`);

  out.screens.push(screen);
  await page.close();
}

await browser.close();

// ── 판정 ──────────────────────────────────────────────────────────────────
const anyHolding = out.screens.some((s) => s.holdingHit.length > 0);
const anyData = out.screens.some((s) => s.responses.some((r) => r.bytes > 3000));
out.verdict = anyHolding
  ? '보유종목으로 보이는 응답이 있다. 필드를 확인하고 수집기로 넘어갈 수 있다.'
  : (anyData
    ? '자료는 오는데 보유종목은 없다. 금투협 전자공시에는 펀드별 편입종목이 없는 것으로 보인다.'
    : '아직 자료가 안 온다. 조회 버튼을 못 눌렀을 수 있다 — 아래 버튼 목록을 봐야 한다.');
console.log(`판정: ${out.verdict}`);

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 펀드 원천 탐색 6차 — 보유종목이 있는가', '', `조사 시각: ${out.at}`, '',
  '5차에서 앱 이름이 **FS-DIS2** 임을 확인했고(FS-COM 이 오류 원인이었다),',
  '사이트 경로 147개를 확보했다. 남은 관문은 하나다 — 펀드별 보유종목을 주는',
  '화면이 있는가.', '',
  `**판정: ${out.verdict}**`, '',
  '| 화면 | 버튼 | 조회후보 | 누른 것 | POST | 응답 | 보유종목 |',
  '|---|---:|---:|---|---:|---:|:-:|'];
for (const s of out.screens) {
  md.push(`| ${s.label} | ${s.controls?.length ?? '–'} | ${s.candidates?.length ?? '–'} | ` +
    `${s.clicked ? (s.clicked.id || s.clicked.text) : '–'} | ${s.posts.length} | ${s.responses.length} | ` +
    `${s.holdingHit.length ? '○ ' + s.holdingHit.length : '·'} |`);
}
md.push('');
for (const s of out.screens) {
  md.push(`## ${s.label}`, '', `\`${s.path}\`${s.error ? ` — ${s.error}` : ''}`, '');
  if (s.controls?.length) {
    md.push('버튼 (id : 글자 : 위치):', '', '```',
      s.controls.map((b) => `${b.id || '-'} : ${b.text} : y=${b.top}${b.visible ? '' : ' (안보임)'}`).join('\n'),
      '```', '');
  }
  for (const p of s.posts.slice(0, 3)) {
    md.push('보낸 본문:', '', '```xml', p.body.slice(0, 2000), '```', '');
  }
  for (const r of s.responses.slice(0, 3)) {
    md.push(`응답 (${r.status} · ${r.bytes}B):`, '', '```xml', r.body.slice(0, 2500), '```', '');
  }
  if (s.text) md.push('화면 글:', '', '```', s.text.slice(0, 900), '```', '');
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[probe6] ${OUT_MD} · ${OUT_JSON} 기록`);
