#!/usr/bin/env node
/**
 * 채권 종목 상세 — 표면금리·이자지급유형·이자지급주기·신용등급·위험요인
 *
 *   node scripts/probe_bond_detail.mjs
 *
 * ★ 앞선 탐색에서 찾았다 — 목록 화면이 종목 상세 링크를 스스로 들고 있었다.
 *     <a href="/hks/hks4036/v01.do?itemCode=KR103502GA34">국고채권 01500-5003(20-2)</a>
 *   그리고 /hks/hks4036/p02.do 가 「채권 기본정보 + 본 채권투자의 위험요인」 을
 *   담은 설명 화면이다. 파라미터 이름이 itemCode 인 것을 몰라 값이 null 로 왔었다.
 *
 *   기본정보 표에 창구가 손으로 넣던 것이 다 있다 —
 *     종목명 · 발행일 · 만기일 · 표면금리 · 발행통화 · 매매금리 · 잔존만기 ·
 *     이자지급 유형 · 이자지급 주기 · 세전 투자수익률 · 이자지급주기별 이자율 ·
 *     신용등급(Moody's · S&P · Fitch · 국내신용등급) · 이자지급 특이사항
 *
 * 이 탐색이 하는 일 — 두 화면을 표 단위로 그대로 찍어 수집기가 무엇을 어떻게
 * 읽어야 하는지 확정한다. 답을 아는 종목(국고채권 01500 = 연 1.500%)으로
 * 검산한다.
 *
 * 저장소에 아무것도 쓰지 않는다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';
const LIST = '/hks/hks4036/r01.do';
/* 국고채권(표면 1.500% — 검산용) · 국민주택1종(담당자가 고른 종목) · 회사채 하나 */
const CODES = ['KR103502GA34', 'KR101501DFB4', 'KR60054939A8'];

async function get(path) {
  const url = path.startsWith('http') ? path : BASE + path;
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', Referer: BASE + LIST },
    signal: AbortSignal.timeout(30000)
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get('content-type') || '';
  const head = buf.slice(0, 4000).toString('latin1');
  const m = /charset\s*=\s*["']?\s*([\w-]+)/i.exec(ct) || /charset\s*=\s*["']?\s*([\w-]+)/i.exec(head);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  let text;
  try { text = new TextDecoder(/euc-kr|ks_c_5601|ksc5601|cp949/.test(cs) ? 'euc-kr' : cs).decode(buf); }
  catch { text = buf.toString('utf8'); }
  return { status: r.status, len: buf.length, text };
}
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();

/** 표를 머리글↔값 짝으로 본다. 채권 기본정보 표는 th 와 td 가 번갈아 온다. */
function dumpTables(html, tag) {
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  console.log('   표 ' + tables.length + '개');
  tables.forEach((tb, i) => {
    const cells = [...tb.matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((m) => ({ t: m[1].toLowerCase(), v: strip(m[2]) }));
    if (!cells.length) return;
    const txt = cells.map((c) => c.v).join(' ');
    if (!/표면|이자지급|신용등급|종목명|만기/.test(txt)) return;
    console.log('\n   ── 표' + (i + 1) + ' (' + cells.length + '칸)');
    cells.forEach((c, k) => console.log('      ' + (c.t === 'th' ? '[머리]' : '     ') + ' ' + k + ': ' + c.v.slice(0, 90)));
  });
}

/* 목록에서 상세 링크가 정말 종목마다 있는지 먼저 센다 */
console.log('='.repeat(72));
console.log('목록 화면의 상세 링크');
console.log('='.repeat(72));
const list = await get(LIST);
const links = [...list.text.matchAll(/href="(\/hks\/hks4036\/v01\.do\?itemCode=([A-Z]{2}[\dA-Z]{10}))"/g)];
console.log('상세 링크 ' + links.length + '개 (종목 100개 기준)');
links.slice(0, 3).forEach((m) => console.log('   ' + m[1]));

for (const code of CODES) {
  for (const page of ['v01', 'p02']) {
    const u = '/hks/hks4036/' + page + '.do?itemCode=' + code;
    console.log('\n' + '='.repeat(72));
    console.log(u);
    console.log('='.repeat(72));
    try {
      const r = await get(u);
      console.log('HTTP ' + r.status + ' · ' + r.len + '바이트');
      if (r.status !== 200) continue;
      const body = strip(r.text);
      /* 값이 실제로 들어왔는지 — null 이면 파라미터가 틀린 것이다 */
      const nulls = (body.match(/null/g) || []).length;
      console.log('본문에 null ' + nulls + '개' + (nulls > 3 ? '  ★ 값이 안 들어왔다' : ''));
      const i = body.indexOf('채권 기본정보');
      if (i >= 0) console.log('\n   [기본정보 구간] ' + body.slice(i, i + 700));
      const j = body.search(/위험\s*요인/);
      if (j >= 0) console.log('\n   [위험요인 구간] ' + body.slice(j, j + 900));
      dumpTables(r.text, page);
    } catch (e) {
      console.log('실패 ' + e.message);
    }
  }
}

console.log('\n탐색 끝.');
