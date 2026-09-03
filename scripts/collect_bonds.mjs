#!/usr/bin/env node
/**
 * 장외채권 수집 — data/bond-catalog.js
 *
 *   node scripts/collect_bonds.mjs [--dry]
 *
 * 원천 (탐색으로 확인한 것 — tools/discovery 의 채권 탐색 기록 참조)
 *   ㆍ원화 장외채권 목록  https://securities.miraeasset.com/hks/hks4036/r01.do
 *     서버가 표를 그려 내려준다(EUC-KR). 한 종목이 <tr> 두 줄에 걸쳐 있고,
 *     둘째 줄의 관심상품등록 버튼에 표준코드가 들어 있다 —
 *       insertWishItem('02','KR103502GA34','국고채권 01500-5003(20-2)','20200310','20500310')
 *     이 한 줄이 ISIN·종목명·발행일·만기일을 모두 준다. 표에서는 잔존기간·매수금리·
 *     은행환산수익률(개인)·세후투자수익률·매매단가·세전투자수익률(법인)을 읽는다.
 *   ㆍ외화채권 유형 안내  https://securities.miraeasset.com/hks/hks4054/v03.do
 *     개별 종목은 로그인 화면에 있어 받을 수 없다. 대신 유형별 통화·매매방식·
 *     국제신용등급·세금·잔존만기를 담는다 — 창구가 손으로 넣던 「과세에 관한 사항」
 *     「국제신용등급」 「발행국가」 가 여기 있다.
 *   ㆍ설명서·약관     https://securities.miraeasset.com/hki/hki3031/a00.do
 *
 * ★ 값을 만들어내지 않는다 ★ 표에서 못 읽은 것은 담지 않아 화면에서 「확인필요」로 남는다.
 */
import { writeFile, mkdir } from 'node:fs/promises';

const DRY = process.argv.includes('--dry');
/* --debug : 종류별로 행의 칸을 그대로 찍는다. 머리글에 신용등급이 있는데 국고채
   행에서는 비어 있어, 회사채·지방채 행에서 어느 칸에 오는지 눈으로 봐야 한다. */
const DEBUG = process.argv.includes('--debug');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://securities.miraeasset.com';
const LIST_KRW = '/hks/hks4036/r01.do';
const LIST_FX = '/hks/hks4054/v03.do';
const DOCS = '/hki/hki3031/a00.do';

/** 응답을 문자로 — meta charset 을 보고 정한다 (이 사이트는 EUC-KR 이다) */
async function get(path) {
  const url = path.startsWith('http') ? path : BASE + path;
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', 'Referer': BASE + '/main.do' },
    signal: AbortSignal.timeout(40000)
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const head = buf.slice(0, 4000).toString('latin1');
  const ct = r.headers.get('content-type') || '';
  const m = /charset\s*=\s*["']?\s*([\w-]+)/i.exec(ct) || /charset\s*=\s*["']?\s*([\w-]+)/i.exec(head);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  let text;
  try {
    text = new TextDecoder(/euc-kr|ks_c_5601|ksc5601|cp949/.test(cs) ? 'euc-kr' : cs).decode(buf);
  } catch (e) { text = buf.toString('utf8'); }
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
  return text;
}
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const num = (s) => {
  const v = parseFloat(String(s).replace(/,/g, '').replace(/[^0-9.\-]/g, ''));
  return isFinite(v) ? v : null;
};
const kdate = (s) => {
  const m = /(\d{4})\D?(\d{2})\D?(\d{2})/.exec(String(s));
  return m ? m[1] + '-' + m[2] + '-' + m[3] : null;
};
/**
 * 종목명 앞에 위험등급이 붙어 온다 — 「매우낮은위험 국고채권 01500-5003(20-2)」.
 * 등급 이름과 종목명을 갈라 낸다.
 */
const GRADES = [['매우높은위험', 1], ['높은위험', 2], ['다소높은위험', 3],
  ['보통위험', 4], ['낮은위험', 5], ['매우낮은위험', 6]];
function splitGrade(s) {
  const t = String(s).trim();
  for (const [w, g] of GRADES) {
    /* 「매우낮은위험」 이 「낮은위험」 을 품고 있어 긴 것부터 본다 (배열 순서가 그렇다) */
    if (t.startsWith(w)) return { grade: g, label: w, name: t.slice(w.length).trim() };
  }
  return { grade: null, label: null, name: t };
}
/**
 * 종목명에 표면금리가 들어 있다 — 「국고채권 01500-5003(20-2)」 의 01500 = 연 1.500%.
 * 국고채·지방채는 이 규칙을 따른다. 규칙에 맞지 않으면 담지 않는다.
 */
function couponFromName(name) {
  const m = /\s(\d{5})-\d{4}/.exec(' ' + String(name).replace(/([가-힣])(\d{5}-)/, '$1 $2'));
  if (!m) return null;
  const v = parseInt(m[1], 10) / 1000;
  return (v > 0 && v < 30) ? v : null;
}
/** 채권 종류 — 종목명으로 가른다 (설명서 표기와 같은 말을 쓴다) */
function kindOf(name) {
  const t = String(name);
  if (/국고채권|국민주택|재정증권/.test(t)) return '국채';
  if (/도시철도|지역개발|공채/.test(t)) return '지방채';
  if (/통화안정/.test(t)) return '통안채';
  if (/은행|산금|중금|수출입/.test(t)) return '금융채';
  if (/카드|캐피탈|할부|여신/.test(t)) return '기타금융채(여전채)';
  return '회사채';
}
/** 발행사 — 종목명으로 가른다 */
function issuerOf(name, kind) {
  if (kind === '국채') return '대한민국 정부(기획재정부)';
  const m = /^([가-힣A-Za-z()·]+?)(?:\s|\d)/.exec(String(name));
  return m ? m[1] : null;
}

/* ── 원화 장외채권 ──────────────────────────────────── */
console.log('원화 장외채권 목록 받는 중…');
const krwHtml = await get(LIST_KRW);
/* 종목이 담긴 표를 고른다 — 표준코드가 들어 있는 표다 */
const tables = [...krwHtml.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
const tbl = tables.find((t) => /insertWishItem/.test(t));
if (!tbl) throw new Error('종목 표를 찾지 못했습니다 — 화면 구조가 바뀌었는지 확인하십시오.');
const trs = [...tbl.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]).filter((r) => /<td/i.test(r));
if (DEBUG) {
  const th = [...tbl.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => strip(m[1])).filter(Boolean);
  console.log('\n[debug] 머리글: ' + th.join(' │ '));
  /* 국채·지방채·회사채 각각 한 종목씩 골라 칸을 그대로 찍는다 */
  const want = ['국고채권', '도시철도', ''];
  want.forEach((w) => {
    for (let i = 0; i < trs.length - 1; i++) {
      const a = [...trs[i].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
      if (a.length < 6) continue;
      if (w && a[0].indexOf(w) < 0) continue;
      if (!w && /국고채권|도시철도|지역개발/.test(a[0])) continue;
      const b = [...(trs[i + 1] || '').matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
      console.log('\n[debug] ' + (w || '그 밖의 종목') + ' — 앞줄 ' + a.length + '칸 / 뒷줄 ' + b.length + '칸');
      a.forEach((c, k) => console.log('   A[' + k + '] ' + c.slice(0, 60)));
      b.forEach((c, k) => console.log('   B[' + k + '] ' + c.slice(0, 60)));
      break;
    }
  });
}

const krw = [];
for (let i = 0; i < trs.length; i++) {
  const a = [...trs[i].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
  /* 첫 줄은 종목명으로 시작하고 7칸이다. 둘째 줄에 표준코드가 있다. */
  if (a.length < 6) continue;
  const nxt = trs[i + 1] || '';
  const w = /insertWishItem\('(\d+)','([A-Z]{2}[\dA-Z]{10})','([^']*)','(\d{8})','(\d{8})'/.exec(nxt);
  if (!w) continue;
  const b = [...nxt.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
  const g = splitGrade(a[0]);
  const name = w[3].replace(/\s+/g, ' ').trim() || g.name;
  const kind = kindOf(name);
  const o = {
    code: w[2],                       /* 표준코드(ISIN) */
    name: name,
    kind: kind,
    issuer: issuerOf(name, kind),
    riskGrade: g.grade,
    riskLabel: g.label,
    issueDate: kdate(w[4]),
    matDate: kdate(w[5]),
    /* 잔존기간 년·일 */
    leftY: num(a[1]), leftD: num(a[2]),
    /* 매수금리 = 매매수익률 · 은행환산수익률(개인) · 세후투자수익률 */
    buyRate: num(a[4]),
    bankEq: num(a[5]),
    ytmNetPct: num(a[6]),
    /* 둘째 줄 — 만기일 · 매매단가 · 세전투자수익률(법인) */
    tradePrice: num(b[1]),
    ytmGrossPct: num(b[2]),
    coupon: couponFromName(name)
  };
  /* 값이 비면 담지 않는다 (짐작해서 채우지 않는다) */
  Object.keys(o).forEach((k) => { if (o[k] == null || o[k] === '') delete o[k]; });
  if (o.code && o.name) krw.push(o);
  i++;                                /* 둘째 줄은 이미 썼다 */
}
console.log('  원화채권 ' + krw.length + '종목');

/* ── 외화채권 유형 ─────────────────────────────────── */
console.log('외화채권 유형 안내 받는 중…');
const fxHtml = await get(LIST_FX);
const fxTypes = [];
[...fxHtml.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]).forEach((tb) => {
  const th = [...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => strip(m[1])).filter(Boolean);
  if (!/통화|국가/.test(th.join(' ')) || !/국제\s*신용등급/.test(th.join(' '))) return;
  const byCountry = /^국가/.test(th[0] || '');
  let ccy = null, country = null;
  [...tb.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]).filter((r) => /<td/i.test(r)).forEach((r) => {
    const td = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1])).filter((x) => x !== '');
    if (!td.length) return;
    /* 통화·국가 칸은 여러 줄을 아우르므로(rowspan) 나오면 기억한다 */
    let c = td;
    if (byCountry) { if (td.length >= 6) { country = td[0]; c = td.slice(1); } }
    else if (/^[A-Z]{3}$/.test(td[0])) { ccy = td[0]; c = td.slice(1); }
    if (c.length < 4) return;
    const o = byCountry
      ? { country: country, kind: c[0], deal: c[1], ccy: c[2], credit: c[3], tax: c[4], term: c[5] }
      : { ccy: ccy, kind: c[0], deal: c[1], credit: c[2], tax: c[3], term: c[4] };
    Object.keys(o).forEach((k) => { if (!o[k]) delete o[k]; });
    if (o.kind && o.credit) fxTypes.push(o);
  });
});
console.log('  외화채권 유형 ' + fxTypes.length + '개');

/* ── 설명서·약관 ───────────────────────────────────── */
console.log('설명서·약관 목록 받는 중…');
let docs = [];
try {
  const dHtml = await get(DOCS);
  const seen = {};
  [...dHtml.matchAll(/<a[^>]*(?:href|onclick)="([^"]*)"[^>]*>([\s\S]{0,140}?)<\/a>/gi)].forEach((m) => {
    const t = strip(m[2]);
    if (!t || t.length < 4) return;
    if (!/채권|설명서|약관|유의/.test(t)) return;
    const k = t + '|' + m[1];
    if (seen[k]) return; seen[k] = 1;
    docs.push({ title: t.slice(0, 80), href: m[1].slice(0, 200) });
  });
  console.log('  설명서·약관 링크 ' + docs.length + '개');
  docs.slice(0, 20).forEach((d) => console.log('     [' + d.title + '] ' + d.href));
} catch (e) {
  console.log('  설명서 목록 받기 실패 — ' + e.message);
}

/* ── 결과 ──────────────────────────────────────────── */
console.log('\n원화채권 표본 5종목');
krw.slice(0, 5).forEach((x) => console.log('  ' + x.code + ' · ' + x.name
  + ' · ' + (x.riskLabel || '?') + (x.riskGrade || '') + '등급'
  + ' · ' + x.kind + ' · 표면 ' + (x.coupon != null ? x.coupon + '%' : '?')
  + ' · 발행 ' + x.issueDate + ' 만기 ' + x.matDate
  + ' · 매수금리 ' + x.buyRate + '% · 세후 ' + x.ytmNetPct + '% · 매매단가 ' + x.tradePrice));
console.log('\n외화채권 유형 표본');
fxTypes.slice(0, 6).forEach((x) => console.log('  ' + (x.ccy || x.country) + ' · ' + x.kind
  + ' · ' + x.deal + ' · ' + x.credit + ' · ' + (x.tax || '').slice(0, 40) + ' · ' + x.term));

if (DRY) { console.log('\n--dry 이므로 파일을 쓰지 않았습니다.'); process.exit(0); }

const body =
  '/**\n' +
  ' * 장외채권 카탈로그 — 완전판매 스크립트용\n' +
  ' *\n' +
  ' * 생성 : scripts/collect_bonds.mjs (러너에서 실행)\n' +
  ' * 원천 : 미래에셋증권 장외채권 화면 (/hks/hks4036/r01.do · /hks/hks4054/v03.do)\n' +
  ' *\n' +
  ' * BOND_CATALOG.krw[] = { code(ISIN), name, kind, issuer, riskGrade, riskLabel,\n' +
  ' *   issueDate, matDate, leftY, leftD, buyRate, bankEq, ytmNetPct, tradePrice,\n' +
  ' *   ytmGrossPct, coupon }\n' +
  ' *   ㆍbuyRate      매수금리(%) = 매매수익률\n' +
  ' *   ㆍbankEq       은행환산수익률(개인, %)\n' +
  ' *   ㆍytmNetPct    세후 투자수익률(%) — 회사가 계산해 내려 준 값이다\n' +
  ' *   ㆍytmGrossPct  세전 투자수익률(법인, %)\n' +
  ' *   ㆍcoupon       표면금리 — 종목명의 다섯 자리(01500 = 1.500%)에서 낸다.\n' +
  ' *                  규칙에 맞지 않는 종목명은 담지 않는다.\n' +
  ' *\n' +
  ' * BOND_CATALOG.fxTypes[] = 외화채권 유형별 통화·매매방식·국제신용등급·세금·잔존만기.\n' +
  ' *   개별 종목은 로그인 화면에만 있어 받을 수 없다 — 유형 정보로 「과세에 관한 사항」\n' +
  ' *   「국제신용등급」 「발행국가」 를 채우고, 종목값은 창구에서 넣는다.\n' +
  ' *\n' +
  ' * 원천에 없는 값은 담지 않으므로 화면에서 「확인필요」로 남는다.\n' +
  ' */\n' +
  'window.BOND_CATALOG = ' + JSON.stringify({
    updatedAt: new Date().toISOString(),
    source: '미래에셋증권 장외채권 화면',
    listUrl: BASE + LIST_KRW,
    fxUrl: BASE + LIST_FX,
    docsUrl: BASE + DOCS,
    krwCount: krw.length,
    krw: krw,
    fxTypes: fxTypes,
    docs: docs
  }) + ';\n';
await mkdir('data', { recursive: true });
await writeFile('data/bond-catalog.js', body);
console.log('\ndata/bond-catalog.js 기록 — 원화 ' + krw.length + '종목 · 외화 유형 ' + fxTypes.length + '개');
console.log('  크기 ' + (Buffer.byteLength(body) / 1024).toFixed(0) + 'KB');
