#!/usr/bin/env node
/**
 * 펀드 원천 탐색 3차 — 금투협 화면의 호출 정의를 읽는다.
 *
 *   node scripts/probe_fund_sources3.mjs
 *   -> tools/discovery/fund_probe3.{json,md}
 *
 * 2차에서 확인된 것:
 *   - 네이버 펀드는 없어졌다(/fund/ → main.naver).
 *   - 금투협 전자공시는 열린다. 다만 화면을 열기만 해서는 데이터 호출이 안
 *     잡힌다 — 조회를 눌러야 나간다.
 *   - 제로인은 reCAPTCHA 를 건다.
 *
 * WebSquare 는 화면을 .xml 레이아웃으로 내려받아 그린다. **그 안에 서비스
 * 이름과 보낼 필드가 그대로 적혀 있다.** 버튼을 눌러 가며 알아내는 것보다
 * 이걸 읽는 편이 빠르고 확실하다.
 *
 * 그래서:
 *   1. gnb.xml 에서 펀드 관련 화면 경로를 긁는다
 *   2. 각 레이아웃 xml 을 받아 submission·서비스명·DTO 를 뽑는다
 *   3. 뽑은 것으로 실제 호출을 만들어 던져 본다
 *
 * 3번까지 돼야 원천이다. 정의만 있고 안 불리면 소용없다.
 */

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_JSON = 'tools/discovery/fund_probe3.json';
const OUT_MD = 'tools/discovery/fund_probe3.md';

const BASE = 'https://dis.kofia.or.kr';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const out = { at: new Date().toISOString(), pages: [], services: [], calls: [] };

async function get(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: BASE + '/' },
    signal: AbortSignal.timeout(20000),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const utf8 = buf.toString('utf8');
  const euckr = new TextDecoder('euc-kr', { fatal: false }).decode(buf);
  const ko = (s) => (s.match(/[가-힣]/g) || []).length;
  return { status: res.status, text: ko(euckr) > ko(utf8) ? euckr : utf8, bytes: buf.length };
}

// ── 1. 화면 목록 ──────────────────────────────────────────────────────────
console.log('=== 1. 펀드 화면 경로 긁기 ===');
const menuPaths = new Set();
for (const menu of ['/wq/com/gnb.xml', '/wq/com/gnbTop.xml', '/wq/com/quick.xml', '/wq/main/main.xml']) {
  try {
    const r = await get(BASE + menu);
    const found = r.text.match(/\/wq\/[A-Za-z0-9_/]+\.xml/g) || [];
    found.forEach((f) => menuPaths.add(f));
    console.log(`  ${menu} — ${r.status} ${r.bytes}B · 경로 ${found.length}개`);
  } catch (e) { console.log(`  ${menu} — 실패 ${String(e.message || e).slice(0, 60)}`); }
}
// 알고 있는 펀드 화면도 넣어 둔다. 메뉴에서 안 긁혀도 열릴 수 있다.
['/wq/fundann/DISFundAssetStst.xml', '/wq/fundann/DISFundFeeStstCom.xml',
 '/wq/fundann/DISFundStndPrcStst.xml', '/wq/fundann/DISFundAnnList.xml',
 '/wq/fundann/DISFundUnityInfo.xml'].forEach((p) => menuPaths.add(p));

const fundPages = [...menuPaths].filter((p) => /fund|Fund/.test(p));
console.log(`  펀드 관련 화면 ${fundPages.length}개`);

// ── 2. 레이아웃에서 호출 정의 뽑기 ────────────────────────────────────────
console.log('\n=== 2. 레이아웃에서 호출 정의 뽑기 ===');
const svcNames = new Set();
const dtoNames = new Set();
const actions = new Set();

for (const path of fundPages.slice(0, 24)) {
  const page = { path };
  try {
    const r = await get(BASE + path);
    page.status = r.status; page.bytes = r.bytes;
    if (r.status === 200 && r.bytes > 500) {
      // WebSquare submission: action 이 실제 엔드포인트다.
      (r.text.match(/action="([^"]+)"/g) || []).forEach((m) => {
        const a = m.slice(8, -1);
        if (/XMLSERVICES|proframe|\.do|\.jsp/i.test(a)) actions.add(a);
      });
      // 서비스명·DTO 는 XML 본문 안에 문자열로 박혀 있다.
      (r.text.match(/[A-Z][A-Za-z0-9]*(?:SO|SVC)\b/g) || []).forEach((n) => svcNames.add(n));
      (r.text.match(/[A-Z][A-Za-z0-9]*(?:Input|Output)DTO\b/g) || []).forEach((n) => dtoNames.add(n));
      page.title = (r.text.match(/<w2:title[^>]*>([^<]*)</) || [])[1] || null;
      page.sample = r.text.slice(0, 400);
    }
  } catch (e) { page.error = String(e.message || e).slice(0, 100); }
  console.log(`  ${path} — ${page.error || page.status + ' ' + page.bytes + 'B'}`);
  out.pages.push(page);
}
out.services = [...svcNames];
out.dtos = [...dtoNames];
out.actions = [...actions];
console.log(`\n  서비스명 ${svcNames.size}개: ${[...svcNames].slice(0, 12).join(', ')}`);
console.log(`  DTO ${dtoNames.size}개: ${[...dtoNames].slice(0, 12).join(', ')}`);
console.log(`  엔드포인트 ${actions.size}개: ${[...actions].slice(0, 6).join(', ')}`);

// ── 3. 실제로 불러 본다 ───────────────────────────────────────────────────
console.log('\n=== 3. 호출 시도 ===');

/** 금투협 XMLSERVICES 한 번. 서비스명·DTO·본문을 받아 XML 을 만든다. */
async function callSvc(svc, dto, inner = '', app = 'FS-COM') {
  const body = '<?xml version="1.0" encoding="utf-8"?>' +
    '<message><proframeHeader>' +
    `<pfmAppName>${app}</pfmAppName><pfmSvcName>${svc}</pfmSvcName><pfmFnName>select</pfmFnName>` +
    '</proframeHeader><systemHeader></systemHeader>' +
    `<${dto}>${inner}</${dto}></message>`;
  const row = { svc, dto, app };
  try {
    const res = await fetch(BASE + '/proframeWeb/XMLSERVICES/', {
      method: 'POST',
      headers: {
        'User-Agent': UA, 'Content-Type': 'application/xml; charset=UTF-8',
        Referer: BASE + '/websquare/index.jsp',
      },
      body, signal: AbortSignal.timeout(20000),
    });
    row.status = res.status;
    const buf = Buffer.from(await res.arrayBuffer());
    const utf8 = buf.toString('utf8');
    const euckr = new TextDecoder('euc-kr', { fatal: false }).decode(buf);
    const ko = (s) => (s.match(/[가-힣]/g) || []).length;
    const text = ko(euckr) > ko(utf8) ? euckr : utf8;
    row.bytes = buf.length;
    row.sample = text.slice(0, 1200);
    // 오류 응답인지, 진짜 자료인지 가른다.
    row.looksError = /errorCode|error|오류|처리중 장애/i.test(text) && buf.length < 2000;
    row.rows = (text.match(/<\w*(?:List|Item|Row)\b/g) || []).length;
    row.hasFundName = /펀드|Fund/.test(text);
  } catch (e) { row.error = String(e.message || e).slice(0, 120); }
  const mark = row.error ? '✗' : (row.bytes > 2000 && !row.looksError ? '✓' : '△');
  console.log(`${mark} ${svc} / ${dto} — ${row.error || row.status + ' ' + row.bytes + 'B' + (row.looksError ? ' (오류응답)' : '')}`);
  out.calls.push(row);
  return row;
}

// 레이아웃에서 뽑은 조합을 우선 시도한다.
const svcList = [...svcNames].filter((n) => /Fund|COM/i.test(n)).slice(0, 10);
const dtoList = [...dtoNames].filter((n) => /Input/.test(n)).slice(0, 10);
for (const svc of svcList) {
  const dto = dtoList.find((d) => d.replace(/InputDTO$/, '') === svc.replace(/SO$/, '')) || dtoList[0];
  if (!dto) break;
  await callSvc(svc, dto);
}

// 뽑히지 않았을 때를 대비한 알려진 조합.
if (!svcList.length) {
  console.log('  (레이아웃에서 서비스명을 못 뽑았다 — 알려진 조합으로 시도)');
  await callSvc('COMFundUnityInfoSO', 'COMFundUnityInfoInputDTO');
  await callSvc('COMFundPriceModSO', 'COMFundPriceModInputDTO');
}

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(out, null, 2));

const md = ['# 펀드 원천 탐색 3차 — 금투협 호출 정의', '', `조사 시각: ${out.at}`, '',
  'WebSquare 는 화면을 .xml 로 내려받아 그린다. 그 안에 서비스 이름과 보낼',
  '필드가 적혀 있으므로, 버튼을 눌러 가며 알아내는 것보다 이걸 읽는 편이 빠르다.', '',
  `- 펀드 관련 화면: ${fundPages.length}개`,
  `- 뽑은 서비스명: ${out.services.length}개`,
  `- 뽑은 DTO: ${(out.dtos || []).length}개`,
  `- 뽑은 엔드포인트: ${out.actions.length}개`, '',
  '## 화면', '', '| 경로 | 상태 | 크기 |', '|---|---|---:|'];
for (const p of out.pages) md.push(`| \`${p.path}\` | ${p.error || p.status} | ${p.bytes ?? '–'} |`);
md.push('', '## 뽑은 이름', '', '```',
  '서비스: ' + out.services.join(', '), '', 'DTO: ' + (out.dtos || []).join(', '),
  '', '엔드포인트: ' + out.actions.join(', '), '```', '',
  '## 호출 결과', '', '| 서비스 | DTO | 결과 | 행 흔적 |', '|---|---|---|---:|');
for (const c of out.calls) {
  md.push(`| ${c.svc} | ${c.dto} | ${c.error ? '✗ ' + c.error : c.status + ' ' + c.bytes + 'B' + (c.looksError ? ' (오류)' : '')} | ${c.rows ?? '–'} |`);
}
md.push('', '## 응답 맛보기', '');
for (const c of out.calls) {
  if (!c.sample) continue;
  md.push(`### ${c.svc}`, '', '```xml', c.sample.slice(0, 900), '```', '');
}
await writeFile(OUT_MD, md.join('\n'));
console.log(`\n[probe3] ${OUT_MD} · ${OUT_JSON} 기록`);
