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
/**
 * 채권의 종류 — 종목명으로 가른다.
 * 헷갈리는 것은 담지 않는다. 「회사채」 라고 잘못 말하면 그 자체로 부정확한
 * 설명이 되므로, 확실한 것만 담고 나머지는 확인필요로 남긴다.
 *   ㆍ앞 판에서 국가철도공단채권·한국도로공사채권을 회사채로 담고 있었다.
 *     법률로 세운 공사·공단이 발행하는 것은 특수채다.
 *   ㆍ금융지주회사채는 회사채로도 금융채로도 분류되므로 담지 않는다.
 */
const SPECIAL = /국가철도공단|한국수자원공사|한국가스공사|토지주택|증권금융|한국도로공사|한국전력공사|한국석유공사|한국철도공사|예금보험공사|한국장학재단|중소벤처기업진흥|한국주택금융공사/;
function kindOf(name) {
  const t = String(name);
  if (/국고채권|국민주택|재정증권|외국환평형/.test(t)) return '국채';
  if (/도시철도공채|지역개발채권/.test(t)) return '지방채';
  if (/통화안정/.test(t)) return '통안채';
  if (SPECIAL.test(t)) return '특수채';
  if (/은행/.test(t)) return '금융채';
  if (/카드|캐피탈|할부금융/.test(t)) return '기타금융채(여전채)';
  if (/금융지주|지주회사/.test(t)) return null;   /* 분류가 갈린다 — 창구가 확인 */
  return '회사채';
}
/* 지역개발채권·도시철도공채의 발행 주체는 지방자치단체다 —
   종목명 앞머리(전북·경북…)를 정식 명칭으로 편다. */
const LOCAL = {
  서울: '서울특별시', 부산: '부산광역시', 대구: '대구광역시', 인천: '인천광역시',
  광주: '광주광역시', 대전: '대전광역시', 울산: '울산광역시', 세종: '세종특별자치시',
  경기: '경기도', 강원: '강원특별자치도', 충북: '충청북도', 충남: '충청남도',
  전북: '전북특별자치도', 전남: '전라남도', 경북: '경상북도', 경남: '경상남도',
  제주: '제주특별자치도'
};
/**
 * 발행사 — 종목명과 「별도로」 말해야 인정되는 항목이다.
 * 앞 판은 종목명 앞머리를 그대로 담아 「발행사: 서울도시철도공채증권」 처럼
 * 종목명을 되풀이했다. 발행 주체 이름이 되도록 고친다.
 */
function issuerOf(name, kind) {
  const t = String(name);
  if (kind === '국채') return '대한민국 정부';
  if (kind === '지방채') {
    const m = /^([가-힣]{2})(?:도시철도공채|지역개발채권)/.exec(t);
    if (m && LOCAL[m[1]]) return LOCAL[m[1]];
    return null;
  }
  /* 앞머리에서 채권을 뜻하는 꼬리말을 떼어 발행 주체만 남긴다 */
  const m = /^([가-힣A-Za-z()·&\-]+?)(?=\s*\d|\s*\(|$)/.exec(t);
  if (!m) return null;
  let s = m[1]
    .replace(/고속도로건설채권$/, '')
    .replace(/조건부\(?[가-힣]?\)?$/, '')
    .replace(/채권증권$|채권$|공채증권$|공사채$/, '')
    .trim();
  if (!s || s.length < 2) return null;
  /* 줄여 적힌 공기업은 정식 이름으로 (종목명 되풀이가 되지 않게) */
  if (/^토지주택$/.test(s)) s = '한국토지주택공사';
  if (/^증권금융$/.test(s)) s = '한국증권금융';
  return s;
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

/* ── 종목 상세 (표면금리·이자지급유형·이자지급주기·신용등급) ──────────
   목록 화면이 종목마다 상세 링크를 들고 있다 —
     <a href="/hks/hks4036/v01.do?itemCode=KR60054939A8">POSCO 310-3</a>
   이 화면은 서버가 값을 채워 내려준다 (p02.do 는 자바스크립트로 채우는
   껍데기라 전부 null 로 온다 — 쓰지 않는다).

   표면금리 하나가 화면의 확인필요 15건을 막고 있었다 — 금리변동 손익 예시
   13건과 예시 투자금액·회당 이자금액 2건은 앱이 표면금리로 계산해 주는 값이다.

   표의 칸 자리에 기대지 않고 「이름 뒤의 값」 을 읽는다. 화면 서식이 조금
   바뀌어도 버티고, 못 읽으면 담지 않아 확인필요로 남는다. */
const DETAIL = !process.argv.includes('--no-detail');
/** 이름 바로 뒤에서 값을 읽는다 (없으면 null — 짐작하지 않는다) */
function after(body, labels, re, span) {
  for (const label of labels) {
    let from = 0, i;
    while ((i = body.indexOf(label, from)) >= 0) {
      const seg = body.slice(i + label.length, i + label.length + (span || 40));
      const m = re.exec(seg);
      if (m) return m[1];
      from = i + label.length;
    }
  }
  return null;
}
async function detailOf(code, dump) {
  const html = await get('/hks/hks4036/v01.do?itemCode=' + code);
  const body = strip(html);
  if (dump) {
    /* --debug 로 한 종목의 본문을 그대로 본다 — 화면이 어떤 이름으로 값을
       적어 놓았는지는 짐작할 것이 아니라 봐야 하는 것이다. */
    const s = body.search(/채권\s*(?:기본)?정보|상품\s*정보|종목\s*정보|표면금리/);
    console.log('\n[debug] ' + code + ' 본문\n' + body.slice(Math.max(0, s - 200), s + 1100) + '\n');
  }
  const d = {};
  const cp = after(body, ['표면금리'], /^[\s:]*([\d]+\.?[\d]*)\s*%?/);
  if (cp != null && isFinite(+cp)) d.coupon = +cp;
  /* 이자지급유형·주기는 화면이 무슨 이름으로 적어 놓았는지 확정하지 못했다.
     쓰일 만한 이름을 모두 걸어 보고, 그래도 못 찾으면 본문 전체에서 찾는다.
     다만 본문 전체에서 찾을 때는 「단 한 가지만 나올 때」 만 담는다 —
     두 가지가 섞여 나오면 어느 것이 이 종목인지 알 수 없다. */
  const PT_LABELS = ['이자지급 유형', '이자지급유형', '이자지급방법', '이자지급 방법',
    '이자지급방식', '이자지급 방식', '이자유형', '이자 유형', '원리금지급방법', '채권유형'];
  let pt = after(body, PT_LABELS, /(이표채|복리채|할인채|단리채)/, 60);
  if (!pt) {
    const kinds = [...new Set((body.match(/이표채|복리채|할인채|단리채/g) || []))];
    if (kinds.length === 1) pt = kinds[0];
  }
  if (pt) d.payType = pt;
  const PC_LABELS = ['이자지급 주기', '이자지급주기', '이자지급 간격', '이자주기',
    '이자 주기', '이자지급월', '이자지급 월'];
  let pc = after(body, PC_LABELS, /^[\s:]*([\d]+)\s*(?:개월|월)/, 30);
  /* 이름 없이 「이표채 3개월」 처럼 유형 뒤에 붙는 경우 */
  if (!pc && pt) {
    const m = new RegExp(pt + '[^가-힣\\d]{0,12}(\\d+)\\s*(?:개월|월)').exec(body);
    if (m) pc = m[1];
  }
  /* 만기에 한 번 주는 채권은 주기가 없다 — 이것은 빈칸이 아니라 답이다 */
  if (!pc && /복리채|할인채/.test(pt || '')) d.payAtMaturity = true;
  if (pc) d.payCycle = +pc;
  const pr = after(body, ['이자지급주기별 이자율'], /약?\s*([\d]+\.?[\d]*)\s*%/, 40);
  if (pr != null && isFinite(+pr)) d.payRate = +pr;
  /* 신용등급 — Moody's·S&P·Fitch·국내 네 칸이 이어 온다. 값이 하나만 채워진
     경우(국내채권은 보통 국내등급만 있다)에만 담는다. 넷 중 어느 것인지
     헷갈릴 값을 등급이라고 단정하지 않는다. */
  const cr = after(body, ['국내신용등급', '국내 신용등급', '신용등급', '평가등급'],
    /^[\s:]*((?:[A-D][A-Za-z]{0,2}[+-]?(?:\s|$)){1,4})/, 40);
  if (cr) {
    const toks = cr.trim().split(/\s+/).filter(Boolean);
    if (toks.length === 1) d.credit = toks[0];
    else d.creditRaw = toks.join(' ');
  }
  /* 매매수수료·최소 매수금액 — 화면이 적어 놓았을 때만. 「없음」 도 반드시
     고지해야 하는 값이라 그대로 담는다. 느슨하게 긁으면 엉뚱한 문장이
     값으로 들어가므로 형태를 좁게 잡는다. */
  const fee = after(body, ['매매수수료', '매매 수수료'], /^[\s:]*(없음|무료|[\d.]+\s*%)/, 30);
  if (fee) d.fee = fee;
  const min = after(body, ['최소 매수금액', '최소매수금액', '최소 매수', '최소투자금액'],
    /^[\s:]*([\d,]+\s*원)/, 30);
  if (min) d.minAmt = min;
  return d;
}
if (DETAIL) {
  console.log('종목 상세 받는 중… (' + krw.length + '종목)');
  const CONC = 6;
  let ok = 0, fail = 0;
  for (let i = 0; i < krw.length; i += CONC) {
    const batch = krw.slice(i, i + CONC);
    await Promise.all(batch.map(async (it) => {
      try {
        const d = await detailOf(it.code, DEBUG && i === 0 && it === batch[0]);
        Object.keys(d).forEach((k) => { it[k] = d[k]; });
        if (d.coupon != null) ok++;
      } catch (e) { fail++; }
    }));
  }
  const n = (k) => krw.filter((x) => x[k] != null).length;
  console.log('  표면금리 ' + n('coupon') + '/' + krw.length
    + ' · 이자지급유형 ' + n('payType')
    + ' · 이자지급주기 ' + n('payCycle')
    + ' · 주기별이자율 ' + n('payRate')
    + ' · 신용등급 ' + n('credit')
    + (n('creditRaw') ? ' (여러 등급 ' + n('creditRaw') + ')' : '')
    + ' · 매매수수료 ' + n('fee') + ' · 최소금액 ' + n('minAmt')
    + (fail ? ' · 못 받은 종목 ' + fail : ''));
  krw.slice(0, 5).forEach((x) => console.log('     ' + x.name + ' — 표면 ' + (x.coupon != null ? x.coupon + '%' : '?')
    + ' · ' + (x.payType || '?') + ' · ' + (x.payCycle != null ? x.payCycle + '개월' : '?')
    + ' · ' + (x.credit || x.creditRaw || '?')));
}

/* ── 장외채권 화면의 유의사항 원문 ────────────────────
   창구가 손으로 넣던 「보증 여부」 「중도매도 가능 여부」 의 근거 문구가
   목록 화면 아래에 그대로 적혀 있다. 내가 문장을 짓지 않고 회사 문장을
   그대로 옮긴다 — 규정 문구는 우리가 고쳐 쓸 것이 아니다. */
console.log('장외채권 화면 유의사항 뽑는 중…');
const NOTICE_KEY = /무보증사채|중도\s*매도|예금자보호|콜옵션|원금손실|원리금\s*상환/;
const notice = [...new Set(
  strip(krwHtml)
    .split(/(?<=[.다])\s+/)
    .map((s) => s.trim())
    /* 문장 앞에 화면 껍데기가 붙어 온다 —
       「스크롤을 아래로 내려주세요 [처리시간 : 22:17:49] 채권/RP > RP매매 > 수시형RP매수 -->
        무보증사채는 …」
       문장 부호가 없어 앞에서 끊기지 않으므로 껍데기를 걷어낸다. */
    .map((s) => s.replace(/^[\s\S]*-->\s*/, ''))
    .map((s) => s.replace(/^\s*\[[^\]]*\]\s*/, ''))
    .map((s) => s.replace(/^(?:[^\s>]+\s*>\s*)+/, '').trim())
    .filter((s) => s.length >= 20 && s.length <= 320)
    .filter((s) => NOTICE_KEY.test(s))
    /* 화면 스크립트가 섞여 들어오는 것을 걷어낸다 */
    .filter((s) => !/function|var\s|\$\(|window\.|\{|\}|스크롤|처리시간/.test(s))
)];
console.log('  유의사항 문장 ' + notice.length + '개');
notice.forEach((s) => console.log('     · ' + s));

/* ── 금융상품 위험도 분류표 ────────────────────────────
   /hks/hks4036/p02.do 는 종목값은 자바스크립트로 채우는 껍데기라 못 쓰지만,
   「본 채권투자의 위험요인」 과 「금융상품 위험도 분류표」 는 서버가 그려 준다.
   분류표는 상품군 × 위험등급 1~6 이고, 맨 아랫줄이 등급별 투자자구분
   (성장형·성장추구형·위험중립형·안정추구형·안정형)이다.
   창구가 손으로 넣던 「위험등급의 의미·유의사항」 과 「위험등급 분류 근거」 가
   여기서 나온다. 종목마다 다르지 않으므로 한 번만 받는다.
   표를 손대지 않고 칸 그대로 담는다 — 문구를 우리가 고쳐 쓰지 않는다. */
console.log('위험도 분류표·위험요인 받는 중…');
let riskTable = [];
let riskFactors = [];
try {
  const pHtml = await get('/hks/hks4036/p02.do');
  const pBody = strip(pHtml);
  /* 분류표 — 칸이 많은 표가 그것이다 */
  const cand = [...pHtml.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0])
    .filter((tb) => /위험등급|매우높은|투자자구분/.test(strip(tb)));
  cand.forEach((tb) => {
    [...tb.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]).forEach((tr) => {
      const cells = [...tr.matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => strip(m[2]));
      if (cells.filter(Boolean).length >= 2) riskTable.push(cells);
    });
  });
  console.log('  분류표 ' + riskTable.length + '줄');
  /* 위험요인 — 「본 채권투자의 위험요인」 아래 번호 문장들.
     이 화면은 원화·외화를 함께 다루므로 「가. 채권투자의 기본위험」 「나. 환율변동
     위험」 「다. 투자대상 국가…」 로 나뉘어 있다. 문단을 갈라 담지 않으면
     원화채권 시트에 환율변동 위험이 섞여 나온다. */
  const i = pBody.search(/본\s*채권투자의\s*위험요인/);
  if (i >= 0) {
    const blk = pBody.slice(i, i + 4000);
    /* 문단 머리는 「가. 채권투자의 기본위험」 「나. 환율변동 위험」 처럼
       한글 한 자 + 점 + 「…위험」 꼴이다.
       한글 한 자 + 점만 보고 자르면 「…있습니다.」 의 「다.」 가 문단 머리로
       잡힌다 — 앞 판에서 문단이 13개로 쪼개진 이유가 이것이다.
       머리말이 「위험」 으로 끝날 것을 요구해 그것을 막는다. */
    /* 「위험」 으로 끝날 것을 요구해도 아직 모자랐다 — 「있습니다.」 의 「다.」 를
       머리표로 보고 그 뒤의 진짜 머리말(「나. 환율변동 위험」)을 통째로
       삼켰다. 머리표 앞이 한글이면 문장 끝이므로 제외한다. */
    const HEAD = /(?<![가-힣])([가-마])\.\s*([가-힣][^①]{2,45}?위험)(?=\s|$)/g;
    const heads = [];
    let hm;
    while ((hm = HEAD.exec(blk))) heads.push({ at: hm.index, end: hm.index + hm[0].length, head: hm[2].trim() });
    /* 머리말을 못 찾으면 한 덩어리로 담는다 (문단을 짐작해 나누지 않는다) */
    const segs = heads.length
      ? heads.map((x, k) => ({ head: x.head, text: blk.slice(x.end, k + 1 < heads.length ? heads[k + 1].at : blk.length) }))
      : [{ head: '', text: blk }];
    segs.forEach((sec) => {
      const items = sec.text.split(/(?=[①②③④⑤⑥⑦⑧⑨])/)
        .map((s) => s.trim())
        .filter((s) => /^[①②③④⑤⑥⑦⑧⑨]/.test(s) && s.length > 25 && s.length < 600);
      if (items.length) riskFactors.push({ head: sec.head, items: items });
    });
  }
  console.log('  위험요인 문단 ' + riskFactors.length + '개');
  riskFactors.forEach((g) => console.log('     [' + g.head + '] ' + g.items.length + '문장 — ' + g.items[0].slice(0, 70)));
} catch (e) {
  console.log('  못 받음 — ' + e.message);
}

/* ── 외화채권 유형 ─────────────────────────────────── */
console.log('외화채권 유형 안내 받는 중…');
const fxHtml = await get(LIST_FX);
const fxTypes = [];
[...fxHtml.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]).forEach((tb) => {
  const th = [...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => strip(m[1])).filter(Boolean);
  if (!/통화|국가/.test(th.join(' ')) || !/국제\s*신용등급/.test(th.join(' '))) return;
  const byCountry = /^국가/.test(th[0] || '');
  /* 이 표는 칸 자리로 읽을 수 없다 —
       ㆍ통화·과세 칸이 여러 줄을 아우른다(rowspan) → 뒷줄에는 그 칸이 없다
       ㆍ줄 끝에 「외화채권 매매」 같은 단추 칸이 붙는다
     자리로 세면(왼쪽이든 오른쪽이든) 줄마다 다르게 밀린다. 그래서 칸의 내용을
     보고 무슨 값인지 정한다. 자리가 아니라 내용이 값을 말해 준다. */
  const IS = {
    ccy: (s) => /^[A-Z]{3}$/.test(s),
    term: (s) => /(?:\d+\s*년|영구채|만기)/.test(s) && !/과세|소득|판매|중개/.test(s),
    credit: (s) => /^(?:[A-C]{1,3}[+-]?(?:\s*~\s*[A-C]{1,3}[+-]?)?|.*상이.*|.*등급.*)$/.test(s) && s.length < 30,
    deal: (s) => /판매|중개/.test(s) && s.length < 30,
    tax: (s) => /과세|비과세|소득세|원천/.test(s),
    button: (s) => /^(?:외화채권\s*매매|매매하기|상담|신청|자세히|바로가기)$/.test(s)
  };
  let ccy = null, country = null, tax = null;
  [...tb.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]).filter((r) => /<td/i.test(r)).forEach((r) => {
    const td = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]))
      .filter((x) => x !== '' && !IS.button(x));
    if (td.length < 3) return;
    const rest = [];
    let rCcy = null, rTerm = null, rCredit = null, rDeal = null, rTax = null;
    td.forEach((s) => {
      if (!rCcy && IS.ccy(s)) { rCcy = s; return; }
      if (!rDeal && IS.deal(s)) { rDeal = s; return; }
      if (!rTax && IS.tax(s)) { rTax = s; return; }
      if (!rTerm && IS.term(s)) { rTerm = s; return; }
      if (!rCredit && IS.credit(s)) { rCredit = s; return; }
      rest.push(s);
    });
    /* 남은 칸이 종류(와 국가별 표에서는 국가)다 */
    if (byCountry && rest.length >= 2) country = rest.shift();
    const kind = rest.shift();
    /* 아우른 칸은 앞줄 값을 이어 쓴다 */
    if (rCcy) ccy = rCcy;
    if (rTax) tax = rTax;
    const o = {
      country: byCountry ? country : null,
      ccy: rCcy || ccy, kind: kind, deal: rDeal,
      credit: rCredit, tax: rTax || tax, term: rTerm
    };
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
  ' * BOND_CATALOG.riskTable[][] = 금융상품 위험도 분류표 (상품군 × 위험등급 1~6,\n' +
  ' *   맨 아랫줄이 등급별 투자자구분). 칸을 손대지 않고 그대로 담는다.\n' +
  ' * BOND_CATALOG.riskFactors[] = 「본 채권투자의 위험요인」 문장 원문.\n' +
  ' *\n' +
  ' * BOND_CATALOG.notice[] = 장외채권 화면에 적힌 유의사항 문장 원문.\n' +
  ' *   「보증 여부」 「중도매도 가능 여부」 를 이 문장으로 채운다 — 규정 문구는\n' +
  ' *   우리가 고쳐 쓸 것이 아니라 회사 문장을 그대로 읽어야 한다.\n' +
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
    notice: notice,
    riskTable: riskTable,
    riskFactors: riskFactors,
    docs: docs
  }) + ';\n';
await mkdir('data', { recursive: true });
await writeFile('data/bond-catalog.js', body);
console.log('\ndata/bond-catalog.js 기록 — 원화 ' + krw.length + '종목 · 외화 유형 ' + fxTypes.length + '개');
console.log('  크기 ' + (Buffer.byteLength(body) / 1024).toFixed(0) + 'KB');
