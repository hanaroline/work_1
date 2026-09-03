#!/usr/bin/env node
/**
 * 채권 종목 상세 — 표면금리·이자지급유형·이자지급주기·신용등급
 *
 *   node scripts/probe_bond_detail.mjs
 *
 * ★ 목록 화면이 종목 상세 링크를 스스로 들고 있었다 —
 *     <a href="/hks/hks4036/v01.do?itemCode=KR103502GA34">국고채권 01500-5003(20-2)</a>
 *   /hks/hks4036/p02.do 는 같은 기본정보에 「본 채권투자의 위험요인」 과
 *   「금융상품 위험도 분류표」 가 붙은 설명 화면이다.
 *
 * 앞 판에서 표를 전부 찍었더니 위험도 분류표(182칸)가 로그를 밀어내
 * 정작 봐야 할 기본정보가 잘렸다. 이번에는 「머리글 → 값」 짝만 짧게 찍는다.
 *
 * 저장소에 아무것도 쓰지 않는다.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';
const LIST = '/hks/hks4036/r01.do';
/* 국고채권(표면 1.500% — 검산용) · 국민주택1종(담당자가 고른 종목) · 회사채 하나 */
const CODES = ['KR103502GA34', 'KR101501DFB4', 'KR60054939A8'];

async function get(path) {
  const r = await fetch(BASE + path, {
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

/* 우리가 찾는 머리글만 — 위험도 분류표까지 끌고 오면 로그가 밀린다 */
const KEYS = ['종목명', '발행일', '만기일', '표면금리', '발행통화', '매매금리', '잔존만기',
  '이자지급 유형', '이자지급유형', '이자지급 주기', '이자지급주기', '세전 투자수익률',
  '이자지급주기별 이자율', '신용등급', '국내신용등급', 'Moody', 'S＆P', 'S&P', 'Fitch',
  '이자지급 특이사항', '보증', '매매수수료', '최소'];

/** 기본정보 표에서 머리글↔값 짝을 뽑는다 */
function pairs(html) {
  const out = [];
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  tables.forEach((tb) => {
    const cells = [...tb.matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((m) => ({ h: m[1].toLowerCase() === 'th', v: strip(m[2]) }));
    /* 위험도 분류표는 칸이 100개를 넘는다 — 기본정보 표만 본다 */
    if (!cells.length || cells.length > 60) return;
    const txt = cells.map((c) => c.v).join(' ');
    if (!/표면금리|이자지급|종목명/.test(txt)) return;
    cells.forEach((c, i) => {
      if (!c.h) return;
      if (!KEYS.some((k) => c.v.indexOf(k) >= 0)) return;
      /* 값은 바로 다음 td — 표가 th,td,th,td 로 이어진다 */
      for (let j = i + 1; j < cells.length; j++) {
        if (cells[j].h) break;
        out.push([c.v, cells[j].v]);
        break;
      }
    });
  });
  return out;
}

console.log('목록 화면의 상세 링크 개수');
const list = await get(LIST);
const links = [...list.text.matchAll(/href="(\/hks\/hks4036\/v01\.do\?itemCode=([A-Z]{2}[\dA-Z]{10}))"/g)];
console.log('  ' + links.length + '개 / 종목 100개');

for (const code of CODES) {
  for (const page of ['v01', 'p02']) {
    const u = '/hks/hks4036/' + page + '.do?itemCode=' + code;
    console.log('\n' + '─'.repeat(66) + '\n' + u);
    try {
      const r = await get(u);
      const body = strip(r.text);
      const nulls = (body.match(/\bnull\b/g) || []).length;
      console.log('  HTTP ' + r.status + ' · ' + r.len + '바이트 · null ' + nulls + '개'
        + (nulls > 3 ? '  ★ 값이 안 들어왔다' : ''));
      const p = pairs(r.text);
      if (!p.length) { console.log('  기본정보 표를 못 찾음'); continue; }
      p.forEach(([k, v]) => console.log('    ' + k.padEnd(16) + ' = ' + (v || '(빈칸)').slice(0, 70)));
      /* 위험요인 문구가 있으면 첫 문장만 — 있는지 없는지만 확인한다 */
      const j = body.search(/본\s*채권투자의\s*위험요인|채권투자의\s*기본위험/);
      if (j >= 0) console.log('  [위험요인] ' + body.slice(j, j + 260));
    } catch (e) {
      console.log('  실패 ' + e.message);
    }
  }
}

console.log('\n탐색 끝.');
