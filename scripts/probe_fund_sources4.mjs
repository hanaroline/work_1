#!/usr/bin/env node
/**
 * 펀드 원천 탐색 4차 — 조회를 눌러 진짜 호출을 잡는다.
 *
 *   node scripts/probe_fund_sources4.mjs
 *   -> tools/discovery/fund_probe4.{json,md}
 *
 * 3차에서 크게 전진했다. 엔드포인트는 진짜다.
 *
 *   POST https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/
 *   → <pfmResponseBasc>proframe application name [FS-COM] [COMFundUnityInfoSO]
 *      is not found.</pfmResponseBasc>
 *
 * 형식이 맞으니 응답이 온 것이고, **이름만 틀렸다.** 게다가 이 오류는 어느
 * 쪽이 틀렸는지까지 말해 준다 — 이름을 맞히면 바로 알 수 있다는 뜻이다.
 *
 * 레이아웃 xml 을 직접 받으면 오류 페이지가 온다(1580B). 브라우저는 받아
 * 냈으므로 세션 쿠키나 postfix 가 필요한 것으로 보인다. 두 갈래로 간다.
 *
 *   갈래 1. 화면을 열고 **조회를 눌러** 나가는 POST 본문을 통째로 잡는다.
 *           이게 정답지다. 이름도 필드도 다 들어 있다.
 *   갈래 2. index.jsp 로 세션을 받은 뒤 레이아웃 xml 을 다시 받아 읽는다.
 *
 * 갈래 1이 되면 2는 덤이다. 눌러야 할 버튼을 못 찾을 수 있으니, 화면의
 * 버튼·입력칸을 통째로 찍어 남긴다 — 다음 차수에서 사람이 보고 고른다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT_JSON = 'tools/discovery/fund_probe4.json';
const OUT_MD = 'tools/discovery/fund_probe4.md';

const BASE = 'https://dis.kofia.or.kr';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const out = { at: new Date().toISOString(), screens: [], layouts: [], replay: [] };

// 펀드 화면 몇 개. 자산구성(=보유종목)이 제일 중요하다.
const SCREENS = [
  ['펀드 자산구성', '/wq/fundann/DISFundAssetStst.xml'],
  ['펀드 통합정보', '/wq/fundann/DISFundUnityInfo.xml'],
  ['펀드 기준가', '/wq/fundann/DISFundStndPrcStst.xml'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA });

for (const [label, path] of SCREENS) {
  const page = await ctx.newPage();
  const posts = [];
  page.on('request', (req) => {
    if (req.method() !== 'POST') return;
    if (!/XMLSERVICES|proframe/i.test(req.url())) return;
    posts.push({ url: req.url(), body: (req.postData() || '').slice(0, 4000) });
  });
  const bodies = [];
  page.on('response', async (res) => {
    if (!/XMLSERVICES|proframe/i.test(res.url())) return;
    try { bodies.push({ status: res.status(), body: (await res.text()).slice(0, 4000) }); } catch { /* 못 읽는 응답 */ }
  });

  const screen = { label, path };
  try {
    await page.goto(`${BASE}/websquare/index.jsp?w2xPath=${path}`,
      { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(5000);

    // 화면에 무엇이 있는지 통째로 남긴다. 눌러야 할 것을 못 찾았을 때
    // 다음 차수에서 사람이 보고 고를 수 있어야 한다.
    screen.controls = await page.evaluate(() => {
      const pick = (sel) => [...document.querySelectorAll(sel)].slice(0, 40).map((e) => ({
        tag: e.tagName.toLowerCase(),
        id: e.id || null,
        type: e.getAttribute('type') || null,
        text: (e.innerText || e.value || e.getAttribute('title') || '').trim().slice(0, 40),
      })).filter((e) => e.id || e.text);
      return {
        buttons: pick('button, input[type=button], input[type=submit], a[role=button]'),
        inputs: pick('input[type=text], input:not([type]), select'),
      };
    }).catch(() => null);

    // 조회·검색으로 보이는 것을 눌러 본다.
    const clicked = [];
    for (const label2 of ['조회', '검색', 'search']) {
      const btn = page.locator(`text=${label2}`).first();
      if (await btn.count().catch(() => 0)) {
        try {
          await btn.click({ timeout: 4000 });
          clicked.push(label2);
          await page.waitForTimeout(4000);
          break;
        } catch (e) { /* 안 눌리면 다음 후보 */ }
      }
    }
    // id 에 srch/select 가 들어간 버튼도 시도한다.
    if (!clicked.length) {
      const ids = (screen.controls?.buttons || [])
        .filter((b) => b.id && /srch|search|select|inqr|조회/i.test(b.id)).slice(0, 3);
      for (const b of ids) {
        try {
          await page.locator('#' + CSS.escape(b.id)).click({ timeout: 4000 });
          clicked.push('#' + b.id);
          await page.waitForTimeout(4000);
          break;
        } catch { /* 다음 */ }
      }
    }
    screen.clicked = clicked;
    screen.text = (await page.evaluate(() => document.body?.innerText || '').catch(() => '')).slice(0, 1200);
  } catch (e) {
    screen.error = String(e.message || e).slice(0, 200);
  }
  screen.posts = posts;
  screen.responses = bodies;

  console.log(`\n── ${label}`);
  console.log(`   누른 것: ${screen.clicked?.join(', ') || '(없음)'}${screen.error ? ' · ' + screen.error : ''}`);
  console.log(`   버튼 ${screen.controls?.buttons?.length ?? 0}개 · 입력 ${screen.controls?.inputs?.length ?? 0}개`);
  console.log(`   POST ${posts.length}건 · 응답 ${bodies.length}건`);
  for (const p of posts.slice(0, 3)) {
    const svc = (p.body.match(/<pfmSvcName>([^<]*)</) || [])[1];
    const app = (p.body.match(/<pfmAppName>([^<]*)</) || [])[1];
    console.log(`     → app=${app} svc=${svc}`);
  }
  out.screens.push(screen);
  await page.close();
}

// ── 갈래 2. 세션을 쥐고 레이아웃 xml 을 다시 받아 본다 ────────────────────
console.log('\n=== 레이아웃 재시도 (브라우저 세션으로) ===');
for (const [label, path] of SCREENS) {
  const row = { label, path };
  try {
    const page = await ctx.newPage();
    const res = await page.goto(`${BASE}${path}?postfix=${Date.now()}.${Math.random()}`,
      { waitUntil: 'domcontentloaded', timeout: 20000 });
    const text = await page.content();
    row.status = res?.status();
    row.bytes = text.length;
    row.isLayout = /w2:|websquare|submission/i.test(text);
    if (row.isLayout) {
      row.services = [...new Set(text.match(/[A-Z][A-Za-z0-9]*(?:SO)\b/g) || [])];
      row.dtos = [...new Set(text.match(/[A-Z][A-Za-z0-9]*(?:Input|Output)DTO\b/g) || [])];
      row.apps = [...new Set(text.match(/FS-[A-Z0-9]+/g) || [])];
    }
    row.sample = text.slice(0, 800);
    await page.close();
  } catch (e) { row.error = String(e.message || e).slice(0, 140); }
  console.log(`  ${path} — ${row.error || row.status + ' ' + row.bytes + 'B' + (row.isLayout ? ' (레이아웃)' : ' (오류페이지)')}`);
  if (row.services?.length) console.log(`     서비스: ${row.services.slice(0, 8).join(', ')}`);
  if (row.apps?.length) console.log(`     앱: ${row.apps.join(', ')}`);
  out.layouts.push(row);
}

await browser.close();

// ── 잡은 POST 를 브라우저 없이 재현 ───────────────────────────────────────
console.log('\n=== 재현 (브라우저 없이) ===');
const caught = [];
for (const s of out.screens) for (const p of s.posts) caught.push({ from: s.label, ...p });
if (!caught.length) console.log('  잡힌 POST 가 없다 — 다음 차수에서 버튼을 지정해야 한다.');
for (const c of caught.slice(0, 6)) {
  const row = { from: c.from, url: c.url };
  row.app = (c.body.match(/<pfmAppName>([^<]*)</) || [])[1];
  row.svc = (c.body.match(/<pfmSvcName>([^<]*)</) || [])[1];
  try {
    const res = await fetch(c.url, {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/xml; charset=UTF-8',
                 Referer: `${BASE}/websquare/index.jsp` },
      body: c.body, signal: AbortSignal.timeout(20000),
    });
    row.status = res.status;
    const buf = Buffer.from(await res.arrayBuffer());
    const utf8 = buf.toString('utf8');
    const euckr = new TextDecoder('euc-kr', { fatal: false }).decode(buf);
    const ko = (s) => (s.match(/[가-힣]/g) || []).length;
    const text = ko(euckr) > ko(utf8) ? euckr : utf8;
    row.bytes = buf.length;
    row.isError = /MODULE ERROR|not found|오류/i.test(text);
    row.sample = text.slice(0, 1500);
    row.ok = res.ok && !row.isError && buf.length > 1000;
  } catch (e) { row.error = String(e.message || e).slice(0, 140); }
  console.log(`${row.ok ? '✓' : '✗'} app=${row.app} svc=${row.svc} — ${row.error || row.status + ' ' + row.bytes + 'B' + (row.isError ? ' (오류)' : '')}`);
  out.replay.push(row);
}

// ── 기록 ──────────────────────────────────────────────────────────────────
await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 펀드 원천 탐색 4차 — 조회를 눌러 잡은 호출', '', `조사 시각: ${out.at}`, '',
  '3차에서 엔드포인트가 진짜임을 확인했다. 오류가 이름만 틀렸다고 알려 준다.',
  '', '```', 'proframe application name [FS-COM] [COMFundUnityInfoSO] is not found.', '```', '',
  '그래서 화면에서 조회를 눌러 실제로 나가는 POST 를 잡았다.', ''];
for (const s of out.screens) {
  md.push(`## ${s.label} (\`${s.path}\`)`, '');
  md.push(`- 누른 것: ${s.clicked?.join(', ') || '(없음)'}${s.error ? ` — ${s.error}` : ''}`);
  md.push(`- 잡은 POST: ${s.posts.length}건`, '');
  if (s.controls) {
    md.push('버튼:', '', '```',
      (s.controls.buttons || []).map((b) => `${b.id || '-'} : ${b.text}`).join('\n') || '(없음)', '```', '');
    md.push('입력칸:', '', '```',
      (s.controls.inputs || []).map((b) => `${b.id || '-'} : ${b.text}`).join('\n') || '(없음)', '```', '');
  }
  for (const p of s.posts.slice(0, 2)) {
    md.push('보낸 본문:', '', '```xml', p.body.slice(0, 1500), '```', '');
  }
  for (const r of s.responses.slice(0, 2)) {
    md.push(`응답 (${r.status}):`, '', '```xml', r.body.slice(0, 1500), '```', '');
  }
}
md.push('## 레이아웃 재시도', '', '| 화면 | 결과 | 서비스 | 앱 |', '|---|---|---|---|');
for (const l of out.layouts) {
  md.push(`| ${l.label} | ${l.error || l.status + ' ' + l.bytes + 'B' + (l.isLayout ? ' 레이아웃' : ' 오류')} | ` +
    `${(l.services || []).slice(0, 6).join(', ') || '–'} | ${(l.apps || []).join(', ') || '–'} |`);
}
md.push('', '## 재현', '', '| 앱 | 서비스 | 결과 |', '|---|---|---|');
for (const r of out.replay) {
  md.push(`| ${r.app || '–'} | ${r.svc || '–'} | ${r.error ? '✗ ' + r.error : (r.ok ? '✓ ' : '△ ') + r.status + ' ' + r.bytes + 'B'} |`);
}
md.push('', '## 재현 응답 맛보기', '');
for (const r of out.replay) {
  if (!r.sample) continue;
  md.push(`### ${r.svc}`, '', '```xml', r.sample.slice(0, 1200), '```', '');
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[probe4] ${OUT_MD} · ${OUT_JSON} 기록`);
