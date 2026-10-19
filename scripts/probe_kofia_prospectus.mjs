#!/usr/bin/env node
/**
 * 탐침 — 금투협 투자설명서 목록 조회(srchFile) 계약이 아직 살아 있는가.
 *
 *   node scripts/probe_kofia_prospectus.mjs [--codes K55223EU5794,K55210EU5575]
 *   -> tools/discovery/kofia_prospectus_probe.{md,json}
 *
 * 수집기(collect_fund_prospectus_kofia.mjs)가 씨앗 종목에서 「파일 0건」으로
 * 멈출 때 돌린다. 수집기는 조회 오류를 삼켜 0건으로 보이게 하므로, 여기서는
 * 원인을 세 갈래로 가른다.
 *
 *   1. 날것 POST — 수집기와 같은 본문을 종목 × uGb(T·G·Y)로 보내고 상태·
 *      응답 머리·뜯은 행 수를 그대로 적는다. HTTP 오류인지, 빈 응답인지,
 *      태그가 바뀐 것인지 여기서 갈린다.
 *   2. 브라우저 관찰 — 전자공시 펀드 팝업을 실제로 열어 화면이 보내는
 *      XMLSERVICES POST 본문과 응답을 잡는다. 서비스명·DTO 가 바뀌었으면
 *      여기에 새 이름이 보인다.
 *   3. 같은 출처 POST — 팝업 안에서 수집기 본문을 fetch 로 보낸다. 쿠키·
 *      세션이 있어야만 답하는 쪽으로 바뀌었는지 1 과 견주어 본다.
 *
 * 대조 종목을 반드시 함께 본다. 씨앗 하나가 0건이면 계약이 바뀐 것인지
 * 그 종목에 원래 공시가 없는 것인지 가를 수 없다 — 10/05 에 실제로 받았던
 * 종목(data/fund-prospectus-kofia.js 의 refs)이 대조다.
 *
 * 이 세션 컨테이너에서는 금투협에 못 붙는다(CONNECT 403). GitHub Actions 에서 돈다.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const DIS = 'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const UGBS = ['T', 'G', 'Y'];

const argOf = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

const out = { at: new Date().toISOString(), codes: [], raw: [], browser: [], inPage: [], verdict: [] };
const say = (s) => { console.log(s); };

/* ── 대상: 씨앗(수집기의 targets[0]) + 10/05 에 받았던 대조 ─────── */
const cg = {};
new Function('window', await readFile('data/fund-catalog.js', 'utf8'))(cg);
const C = cg.FUND_CATALOG;
const seedCode = (C.items.find((x) => !x.docT && !x.docG) || {}).code;

const kg = {};
new Function('window', await readFile('data/fund-prospectus-kofia.js', 'utf8'))(kg);
const controls = Object.keys((kg.FUND_PROSPECTUS_KOFIA || {}).refs || {}).slice(0, 2);

const given = String(argOf('--codes', '')).split(',').map((s) => s.trim()).filter(Boolean);
const codes = given.length ? given : [seedCode, ...controls].filter(Boolean);
out.codes = codes.map((c) => ({ code: c, role: c === seedCode ? '씨앗' : controls.includes(c) ? '대조(10/05 받음)' : '지목' }));
say('대상: ' + out.codes.map((c) => `${c.code}(${c.role})`).join(', '));

/* ── 1. 날것 POST ──────────────────────────────────────────────── */
function listBody(code, uGb) {
  return '<?xml version="1.0" encoding="utf-8"?>' +
    '<message><proframeHeader><pfmAppName>FS-COM</pfmAppName>' +
    '<pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName><pfmFnName>srchFile</pfmFnName>' +
    '</proframeHeader><systemHeader></systemHeader>' +
    '<COMFundInfoFileListDTO><standardCd>' + code + '</standardCd>' +
    '<uGb>' + uGb + '</uGb></COMFundInfoFileListDTO></message>';
}
const listCount = (xml) => (String(xml).match(/<list>/g) || []).length;

say('\n[1] 날것 POST');
for (const code of codes) {
  for (const u of UGBS) {
    const rec = { code, uGb: u };
    try {
      const r = await fetch(DIS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          Accept: 'application/xml, text/xml, */*',
          'User-Agent': UA,
          Origin: 'https://dis.kofia.or.kr',
          Referer: 'https://dis.kofia.or.kr/websquare/index.jsp'
        },
        body: listBody(code, u),
        signal: AbortSignal.timeout(20000)
      });
      const t = await r.text();
      Object.assign(rec, {
        status: r.status, type: r.headers.get('content-type'), len: t.length,
        lists: listCount(t), head: t.slice(0, 1500)
      });
    } catch (e) {
      const c = e && e.cause;
      rec.error = String(e && e.message || e) + (c ? ` (${c.code || ''} ${String(c.message || c).slice(0, 160)})` : '');
    }
    out.raw.push(rec);
    say(`  ${code} uGb=${u} → ` + (rec.error ? '오류 ' + rec.error
      : `HTTP ${rec.status} · ${rec.type} · ${rec.len}B · <list> ${rec.lists}건`));
    if (!rec.error && !rec.lists) say('    머리: ' + JSON.stringify(rec.head.slice(0, 500)));
  }
}

/* ── 2·3. 브라우저 관찰 + 같은 출처 POST ──────────────────────── */
say('\n[2] 팝업을 열어 화면이 보내는 POST 를 잡는다');
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: 'ko-KR' });
for (const code of codes.slice(0, 2)) {
  const page = await ctx.newPage();
  const captured = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().includes('/proframeWeb/XMLSERVICES/')) {
      captured.push({ body: r.postData() || '', status: null, res: null });
    }
  });
  page.on('response', async (r) => {
    if (r.request().method() !== 'POST' || !r.url().includes('/proframeWeb/XMLSERVICES/')) return;
    const hit = captured.find((c) => c.body === (r.request().postData() || '') && c.status == null);
    if (hit) { hit.status = r.status(); try { hit.res = await r.text(); } catch { hit.res = null; } }
  });
  let gotoErr = null;
  try {
    await page.goto(
      'https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/com/popup/DISComFundSmryInfo.xml' +
      `&companyCd=&standardCd=${encodeURIComponent(code)}&standardDt=&grntGb=`,
      { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(10000);
  } catch (e) { gotoErr = String(e.message || e).slice(0, 300); }

  const svc = (b) => {
    const g = (t) => (b.match(new RegExp('<' + t + '>([^<]*)</' + t + '>')) || [])[1] || '';
    return `${g('pfmAppName')}/${g('pfmSvcName')}.${g('pfmFnName')}`;
  };
  const rows = captured.map((c) => ({
    svc: svc(c.body), status: c.status, body: c.body.slice(0, 3000),
    resLen: c.res ? c.res.length : null, lists: c.res ? listCount(c.res) : null,
    res: c.res ? c.res.slice(0, 3000) : null
  }));
  out.browser.push({ code, gotoErr, title: await page.title().catch(() => null), posts: rows });
  say(`  ${code}: POST ${rows.length}건` + (gotoErr ? ` · 열기 오류 ${gotoErr}` : ''));
  rows.forEach((r) => say(`    ${r.svc} → ${r.status} · ${r.resLen}B · <list> ${r.lists}`));
  const file = rows.filter((r) => /File/i.test(r.svc));
  file.forEach((r) => say('    파일 조회 본문: ' + JSON.stringify(r.body.slice(0, 800))));

  say(`\n[3] ${code}: 같은 출처에서 수집기 본문을 보낸다`);
  for (const u of UGBS) {
    const rec = await page.evaluate(async ({ url, body }) => {
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/xml; charset=UTF-8' }, body });
        const t = await r.text();
        return { status: r.status, len: t.length, head: t.slice(0, 1500), lists: (t.match(/<list>/g) || []).length };
      } catch (e) { return { error: String(e) }; }
    }, { url: DIS, body: listBody(code, u) }).catch((e) => ({ error: String(e).slice(0, 300) }));
    out.inPage.push({ code, uGb: u, ...rec });
    say(`  uGb=${u} → ` + (rec.error ? '오류 ' + rec.error : `HTTP ${rec.status} · ${rec.len}B · <list> ${rec.lists}건`));
  }
  await page.close();
}
await ctx.close(); await browser.close();

/* ── 판정 ──────────────────────────────────────────────────────── */
const hits = (code, arr) => arr.filter((r) => r.code === code && r.lists > 0).length;
for (const { code, role } of out.codes) {
  const raw = hits(code, out.raw), inp = hits(code, out.inPage);
  const errs = out.raw.filter((r) => r.code === code && (r.error || r.status !== 200)).length;
  out.verdict.push(`${code}(${role}): 날것 POST 에 목록이 있는 uGb ${raw}/3 · 같은 출처 ${inp}/${out.inPage.some((r) => r.code === code) ? 3 : '-'} · 오류·비200 ${errs}`);
}
say('\n판정');
out.verdict.forEach((v) => say('  ' + v));

await mkdir('tools/discovery', { recursive: true });
await writeFile('tools/discovery/kofia_prospectus_probe.json', JSON.stringify(out, null, 2) + '\n');
const md = ['# 금투협 투자설명서 목록 조회 탐침', '', `시각: ${out.at}`, '',
  '## 판정', '', ...out.verdict.map((v) => '- ' + v), '',
  '## 1. 날것 POST', '', '| 종목 | uGb | 결과 |', '|---|---|---|',
  ...out.raw.map((r) => `| ${r.code} | ${r.uGb} | ${r.error ? '오류 ' + r.error : `HTTP ${r.status} · ${r.len}B · list ${r.lists}`} |`), '',
  '## 2. 팝업이 보낸 POST', '',
  ...out.browser.flatMap((b) => [`### ${b.code}${b.gotoErr ? ' (열기 오류: ' + b.gotoErr + ')' : ''}`, '',
    ...b.posts.map((p) => `- \`${p.svc}\` → ${p.status} · ${p.resLen}B · list ${p.lists}`), '']),
  '## 3. 같은 출처 POST', '', '| 종목 | uGb | 결과 |', '|---|---|---|',
  ...out.inPage.map((r) => `| ${r.code} | ${r.uGb} | ${r.error ? '오류 ' + r.error : `HTTP ${r.status} · ${r.len}B · list ${r.lists}`} |`), ''];
await writeFile('tools/discovery/kofia_prospectus_probe.md', md.join('\n'));
say('\n-> tools/discovery/kofia_prospectus_probe.{md,json}');
