#!/usr/bin/env node
/**
 * 재검증 — 화면에 실린 숫자를 1차 출처(금투협 전자공시)와 맞춰 본다.
 *
 *   node scripts/probe_fund_verify_kofia.mjs
 *   -> tools/discovery/fund_verify_kofia.md / .json
 *
 * ── 왜 이걸 도는가 ──────────────────────────────────────────────────────────
 *
 * `scripts/audit_fund_data.mjs` 는 오류 0 으로 통과한다. 그런데 그 감사는
 * **바깥에 안 붙는다.** `data/fund.js` 안에서 서로 어긋나는 것만 잡는다.
 * 안이 서로 맞는다는 것과 바깥이 맞는다는 것은 다른 말이다. 수집기가 한
 * 자리 밀린 값을 통째로 받아 왔다면 안에서는 완벽하게 일관된다.
 *
 * 그래서 여기서는 **다른 원천**에 같은 것을 묻는다. 금투협 전자공시는
 * 네이버와 계보가 다르고(운용사 → 협회 보고), 표준코드 단위로
 * 기준가·설정원본·순자산·설정일·투자지역·공모여부를 한 응답에 담아 준다.
 *
 * ── 이 탐침이 지켜야 하는 것 두 가지 ────────────────────────────────────────
 *
 * 1) **날짜를 맞춰 놓고 비교하지 않는다.** 우리 자료는 2026-08-27 이고
 *    금투협은 늘 최신 영업일을 준다(→ `fund_kofia_flow.md`: `standardDt`
 *    파라미터를 받기는 하나 무시한다). 하루가 어긋난 값을 "틀렸다" 고
 *    적으면 그게 거짓말이다. 그래서 **양쪽 기준일을 모든 줄에 같이 싣고**,
 *    금투협이 함께 주는 1일 변동폭(`vBefDayFltstdcot`)으로 전영업일 값을
 *    되돌린 것과도 재 본다. 어느 쪽이 대량으로 맞는지는 **자료가 고르게
 *    한다** — 내가 규칙을 먼저 정하지 않는다.
 *
 * 2) **없는 것을 0 이라고 읽지 않는다.** 금투협의 설정원본·순자산 단위는
 *    백만원이다. 설정액이 100만원 미만인 펀드는 0 으로 내려온다. 그 0 은
 *    값이 아니라 반올림으로 사라진 자리다. 비율을 내면 안 된다.
 *
 * ── 제일 날카로운 한 문제 ───────────────────────────────────────────────────
 *
 * 우리 자료에서 `순자산 / 설정액 × 1000 = 기준가` 항등식이 1% 넘게 깨지는
 * 펀드가 35개 있다(최대 13.4%, 30개가 피델리티·AB 재간접형). 우리 자료
 * 안에서는 셋 중 누가 틀렸는지 못 가린다. 그런데 금투협은 **한 응답에
 * 한 기준일로** 셋을 다 준다. 그러니 저쪽에서 항등식이 성립하는지만 보면
 * 갈린다:
 *
 *   저쪽도 깨진다              → 그 펀드의 회계 자체가 그런 것이다(우리 탓 아님)
 *   저쪽은 성립 + 우리 nav/aum 과 일치 → 우리 **기준가**가 튄 것
 *   저쪽은 성립 + 우리 기준가와 일치    → 우리 **설정액이나 순자산**이 튄 것
 *
 * 우리 자료만으로는 못 하는 시험이고, 이게 이 탐침의 존재 이유다.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';

const SRC = 'data/fund.js';
const OUT_MD = 'tools/discovery/fund_verify_kofia.md';
const OUT_JSON = 'tools/discovery/fund_verify_kofia.json';
const POST_URL = 'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/';
const CONCURRENCY = 4;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// 백만원 단위라서 이 밑은 반올림으로 0 이 된다. 0 을 값으로 읽지 않기 위한 선.
const MILLION = 1_000_000;
// 기준가가 "같다" 고 볼 선. 소수 둘째 자리 반올림 + 하루치 잡음을 감안한다.
const PRICE_NEAR = 0.001;   // 0.1%
const AMT_NEAR = 0.01;      // 1%

process.on('unhandledRejection', (e) => {
  console.error('[verify] 중단:', e?.message || e);
  process.exit(1);
});

// ── 대상 ────────────────────────────────────────────────────────────────────
const src = await readFile(SRC, 'utf8');
const DATA = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const funds = DATA.funds || [];
if (!funds.length) throw new Error(`${SRC} 에 펀드가 없다`);
console.log(`[verify] 대상 ${funds.length}개 · 우리 기준일 ${funds[0].tradeDate}`);

// 결산·분배로 기준가가 내려앉은 횟수. 수익률이 벌어졌을 때 계단부터 의심하려고
// 들고 있는다 — 계단을 나눗셈으로 밟으면 -50% 처럼 읽힌다.
const byCodeSteps = new Map(funds.map((f) => [f.code, Array.isArray(f.steps) ? f.steps.length : 0]));

// ── 조회 ────────────────────────────────────────────────────────────────────
function body(fn, code, companyCd = '') {
  return `<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-COM</pfmAppName>
    <pfmSvcName>COMFundUnityBasInfoSO</pfmSvcName>
    <pfmFnName>${fn}</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
    <COMFundUnityInfoInputDTO>
    <standardCd>${code}</standardCd>
    <companyCd>${companyCd}</companyCd>
    <standardDt></standardDt>
</COMFundUnityInfoInputDTO>
</message>`;
}

async function post(fn, code, companyCd = '', tries = 3) {
  let last;
  for (let i = 1; i <= tries; i += 1) {
    try {
      const res = await fetch(POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          Accept: 'application/xml, text/xml, */*',
          'User-Agent': UA,
          Origin: 'https://dis.kofia.or.kr',
          Referer: 'https://dis.kofia.or.kr/websquare/index.jsp',
        },
        body: body(fn, code, companyCd),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      last = e;
      if (i < tries) await new Promise((r) => setTimeout(r, 400 * 2 ** (i - 1)));
    }
  }
  throw last;
}

/** 태그 하나를 읽는다. 없으면 null 이다 — 빈 문자열도 null 로 본다. */
function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  if (!m) return null;
  const v = m[1].trim();
  return v === '' ? null : v;
}
/** 숫자로 읽는다. **없는 것은 null 이다. 0 으로 바꾸지 않는다.** */
function num(xml, name) {
  const v = tag(xml, name);
  if (v == null) return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}
/** 상대오차. 분모가 없거나 0 이면 낼 수 없다 — 0 을 내지 않고 null 을 낸다. */
function rel(a, b) {
  if (a == null || b == null) return null;
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return (a - b) / b;
}

// ── 씨앗으로 계약을 먼저 확인한다 ───────────────────────────────────────────
// 3,196번 헛부르고 나서 "본문이 틀렸다" 를 알 일이 아니다.
{
  const seed = funds.find((f) => f.code === 'KR5105409225') || funds[0];
  const bas = await post('fundBasInfoSrch', seed.code);
  const std = await post('fundStdcotInfoSrch', seed.code, tag(bas, 'companyCd') || '');
  const cot = num(std, 'standardCot');
  console.log(`[verify] 씨앗 ${seed.code} — companyCd=${tag(bas, 'companyCd')} ` +
              `기준가=${cot} 기준일=${tag(std, 'standardDt')} 공모=${tag(bas, 'vPriPubGBNm')}`);
  if (cot == null) {
    throw new Error('씨앗 응답에 기준가가 없다 — 조회 계약이 바뀌었다. 여기서 멈춘다.');
  }
}

// ── 전수 ────────────────────────────────────────────────────────────────────
const rows = [];
const failures = [];
let done = 0;

async function one(f) {
  const bas = await post('fundBasInfoSrch', f.code);
  const companyCd = tag(bas, 'companyCd') || '';
  const std = await post('fundStdcotInfoSrch', f.code, companyCd);

  const kCot = num(std, 'standardCot');
  const kDt = tag(std, 'standardDt');
  const kDay = num(std, 'vBefDayFltstdcot');           // 1일 변동폭(원)
  const kAumM = num(std, 'uOriginalAmt');              // 설정원본, 백만원
  const kNavM = num(std, 'netAsstotAmt');              // 순자산, 백만원
  const kWeek = num(std, 'vBefWeekFltstdcot');         // 1주 변동폭(원)
  const kRet1d = num(std, 'vBeDayFltstdcotRt');        // 1일 등락률(%)
  const kRet1w = num(std, 'vBefWeeFltstdcotRt');       // 1주 등락률(%)

  // 백만원 반올림으로 0 이 된 것은 **값이 아니다.**
  const kAum = kAumM == null ? null : (kAumM === 0 ? null : kAumM * MILLION);
  const kNav = kNavM == null ? null : (kNavM === 0 ? null : kNavM * MILLION);
  const roundedAway = (kAumM === 0 || kNavM === 0);

  const ourAum = Number.isFinite(Number(f.aum)) && f.aum != null ? Number(f.aum) : null;
  const ourNav = Number.isFinite(Number(f.nav)) && f.nav != null ? Number(f.nav) : null;
  const ourCot = Number.isFinite(Number(f.basePrice)) && f.basePrice != null ? Number(f.basePrice) : null;

  // 항등식: 순자산 / 설정원본 × 1000 = 기준가
  const ourImplied = (ourAum && ourNav) ? (ourNav / ourAum) * 1000 : null;
  const kImplied = (kAum && kNav) ? (kNav / kAum) * 1000 : null;

  return {
    code: f.code,
    name: f.name,
    type: f.type,
    ourDt: f.tradeDate || null,
    kDt,

    // 기준가 — 같은 날로 맞춘 것과 하루 되돌린 것을 **둘 다** 싣는다
    ourCot,
    kCot,
    kDay,
    cotRel: rel(ourCot, kCot),
    cotRelLag: (kCot != null && kDay != null) ? rel(ourCot, kCot - kDay) : null,

    // 수익률 — 창이 하루 어긋나 있다. 그래서 "틀림" 판정에 쓰지 않고
    // 크게 벌어진 것만 눈으로 볼 목록을 만드는 데 쓴다.
    ourRet1d: f.ret && f.ret['1d'] != null ? Number(f.ret['1d']) : null,
    kRet1d,
    ourRet1w: f.ret && f.ret['1w'] != null ? Number(f.ret['1w']) : null,
    kRet1w,
    kWeek,

    // 설정원본·순자산
    ourAum,
    kAum,
    aumRel: rel(ourAum, kAum),
    ourNav,
    kNav,
    navRel: rel(ourNav, kNav),
    roundedAway,

    // 항등식 잔차 (우리 / 저쪽)
    ourImplied,
    ourIdentityRel: rel(ourImplied, ourCot),
    kImplied,
    kIdentityRel: rel(kImplied, kCot),

    // 기타 자료
    ourInception: f.inceptionDate || null,
    kInception: tag(bas, 'establishmentDt'),
    ourRegion: f.region || null,
    kRegion: tag(bas, 'vInvestRgnGbNm'),
    kPriPub: tag(bas, 'vPriPubGBNm'),
    ourType: f.type || null,
    kType: tag(bas, 'uFundTypNm'),
    kTer: num(bas, 'ter'),
  };
}

async function worker(list) {
  for (const f of list) {
    try {
      rows.push(await one(f));
    } catch (e) {
      failures.push({ code: f.code, name: f.name, error: String(e.message || e).slice(0, 80) });
    }
    done += 1;
    if (done % 250 === 0) console.log(`[verify] ${done}/${funds.length} · 확보 ${rows.length} · 실패 ${failures.length}`);
    await new Promise((r) => setTimeout(r, 60));
  }
}
const chunks = Array.from({ length: CONCURRENCY }, (_, i) =>
  funds.filter((_, j) => j % CONCURRENCY === i));
await Promise.all(chunks.map(worker));

console.log(`[verify] 확보 ${rows.length}/${funds.length} · 실패 ${failures.length}`);

// ── 집계 ────────────────────────────────────────────────────────────────────
const dts = {};
for (const r of rows) if (r.kDt) dts[r.kDt] = (dts[r.kDt] || 0) + 1;

const near = (v, t) => v != null && Math.abs(v) <= t;
const cotBoth = rows.filter((r) => r.ourCot != null && r.kCot != null);
const cotSame = cotBoth.filter((r) => near(r.cotRel, PRICE_NEAR)).length;
const cotLag = cotBoth.filter((r) => near(r.cotRelLag, PRICE_NEAR)).length;
const cotNeither = cotBoth.filter((r) => !near(r.cotRel, PRICE_NEAR) && !near(r.cotRelLag, PRICE_NEAR));

// 금액은 백만원으로 반올림돼 내려온다. 그러니 **반올림 폭(±50만원) 안이면
// 어긋난 것이 아니다.** 이걸 빼먹으면 설정액이 몇십만원인 펀드가 전부
// "50% 틀림" 으로 잡힌다 — 자료가 아니라 내 규칙이 틀린 것이 된다.
const HALF = MILLION / 2;
const amtSame = (ours, theirs, r) =>
  near(r, AMT_NEAR) || (ours != null && theirs != null && Math.abs(ours - theirs) <= HALF);

const aumBoth = rows.filter((r) => r.ourAum != null && r.kAum != null);
const aumSame = aumBoth.filter((r) => amtSame(r.ourAum, r.kAum, r.aumRel)).length;
const navBoth = rows.filter((r) => r.ourNav != null && r.kNav != null);
const navSame = navBoth.filter((r) => amtSame(r.ourNav, r.kNav, r.navRel)).length;

// 항등식이 우리 쪽에서 1% 넘게 깨지는 펀드 — 저쪽에서는 어떤가
const BREAK = 0.01;
const breakers = rows.filter((r) => r.ourIdentityRel != null && Math.abs(r.ourIdentityRel) > BREAK);
const verdictOf = (r) => {
  if (r.kIdentityRel == null) return '금투협 값 없음 — 판정 못 함';
  if (Math.abs(r.kIdentityRel) > BREAK) return '저쪽도 깨진다 — 펀드 회계 자체';
  // 저쪽은 성립한다. 그러면 우리 셋 중 누가 튄 것인가.
  const vsOurRatio = rel(r.kImplied, r.ourImplied);
  const vsOurCot = rel(r.kImplied, r.ourCot);
  if (near(vsOurRatio, PRICE_NEAR) && !near(vsOurCot, PRICE_NEAR)) return '우리 기준가가 튄 것';
  if (near(vsOurCot, PRICE_NEAR) && !near(vsOurRatio, PRICE_NEAR)) return '우리 설정액/순자산이 튄 것';
  if (near(vsOurRatio, PRICE_NEAR) && near(vsOurCot, PRICE_NEAR)) return '셋이 다 근접 — 재판정 필요';
  return '둘 다 안 맞는다 — 별도 확인';
};
for (const r of breakers) r.verdict = verdictOf(r);

// 수익률 — 창이 하루 어긋나 있으므로 이건 합격/불합격 판정이 아니다.
// 6일이 겹치는 1주 등락률이 크게 벌어진 것만 골라 눈으로 볼 목록을 만든다.
const RET_WIDE = 3; // %p
const retBoth = rows.filter((r) => r.ourRet1w != null && r.kRet1w != null);
const retWide = retBoth.filter((r) => Math.abs(r.ourRet1w - r.kRet1w) > RET_WIDE);

const regionMap = { 국내: 'domestic', 해외: 'overseas', 혼합: 'mixed' };
const regionBoth = rows.filter((r) => r.ourRegion && r.kRegion);
const regionDiff = regionBoth.filter((r) => regionMap[r.kRegion] !== r.ourRegion);

const incBoth = rows.filter((r) => r.ourInception && /^\d{8}$/.test(r.kInception || ''));
const incDiff = incBoth.filter((r) => r.ourInception.replace(/-/g, '') !== r.kInception);

const priPub = {};
for (const r of rows) if (r.kPriPub) priPub[r.kPriPub] = (priPub[r.kPriPub] || 0) + 1;
const notPublic = rows.filter((r) => r.kPriPub && r.kPriPub !== '공모');

const tinyAum = rows.filter((r) => r.ourAum != null && r.ourAum < MILLION);
const roundedRows = rows.filter((r) => r.roundedAway);

// ── 보고서 ──────────────────────────────────────────────────────────────────
const pct = (v) => (v == null ? '—' : `${(v * 100).toFixed(3)}%`);
const won = (v) => (v == null ? '—' : v.toLocaleString('ko-KR'));
const table = (list, head, line, cap = 40) => [
  `| ${head.join(' | ')} |`,
  `|${head.map(() => '---').join('|')}|`,
  ...list.slice(0, cap).map(line),
  list.length > cap ? `\n_${list.length}건 중 ${cap}건만 적었다. 전부는 JSON 에 있다._` : '',
].join('\n');

const md = [
  '# 재검증 — 화면의 숫자를 금투협 전자공시와 맞춰 본다',
  '',
  `받은 때: ${new Date().toISOString()}`,
  '',
  `- 우리 자료: \`${SRC}\` · 수집 ${DATA.updatedAt} · 기준일 **${funds[0].tradeDate}** · ${funds.length}개`,
  `- 저쪽: 금융투자협회 전자공시 \`dis.kofia.or.kr\` (\`fundBasInfoSrch\` + \`fundStdcotInfoSrch\`)`,
  `- 응답 확보 **${rows.length}/${funds.length}** · 실패 ${failures.length}`,
  `- 저쪽 기준일 분포: ${Object.entries(dts).map(([k, v]) => `${k} ${v}건`).join(' · ') || '_없음_'}`,
  '',
  '> **날짜가 다르다는 것을 먼저 적어 둔다.** 금투협은 `standardDt` 를 받아도',
  '> 늘 최신 영업일을 준다. 그러므로 아래의 어긋남 중 상당수는 "틀린 값" 이',
  '> 아니라 "다른 날" 이다. 그래서 기준가는 같은 날 비교와 1일 변동폭으로',
  '> 하루 되돌린 비교를 **둘 다** 싣는다.',
  '',
  '## 1. 기준가',
  '',
  `- 양쪽 다 있는 것 **${cotBoth.length}건**`,
  `- 그대로 비교해서 0.1% 안 : **${cotSame}건** (${(cotSame / (cotBoth.length || 1) * 100).toFixed(1)}%)`,
  `- 1일 변동폭으로 하루 되돌려 0.1% 안 : **${cotLag}건** (${(cotLag / (cotBoth.length || 1) * 100).toFixed(1)}%)`,
  `- 둘 다 아닌 것 : **${cotNeither.length}건**`,
  '',
  '어느 쪽 수가 큰지가 곧 "우리 기준일이 저쪽보다 하루 이르다" 의 증거다.',
  '규칙을 내가 정하지 않고 자료가 고르게 한 자리다.',
  '',
  cotNeither.length ? table(cotNeither.sort((a, b) => Math.abs(b.cotRel) - Math.abs(a.cotRel)),
    ['표준코드', '이름', '우리', '금투협', '1일변동', '그대로', '하루되돌림'],
    (r) => `| ${r.code} | ${r.name.slice(0, 26)} | ${r.ourCot} | ${r.kCot} | ${r.kDay ?? '—'} | ${pct(r.cotRel)} | ${pct(r.cotRelLag)} |`)
    : '_둘 중 하나로 다 설명된다._',
  '',
  '## 2. 설정액(설정원본)·순자산',
  '',
  '금투협 단위는 **백만원**이다. 100만원 미만은 0 으로 내려온다 —',
  '**그 0 은 값이 아니라 반올림으로 사라진 자리다.** 비율을 내지 않는다.',
  '',
  `- 설정액 양쪽 다 있는 것 ${aumBoth.length}건 중 맞는 것 **${aumSame}건**`,
  `- 순자산 양쪽 다 있는 것 ${navBoth.length}건 중 맞는 것 **${navSame}건**`,
  `- 금투협 쪽이 0(반올림으로 사라짐)인 것 ${roundedRows.length}건 · 우리 설정액 100만원 미만 ${tinyAum.length}건`,
  '',
  '"맞는 것" 은 1% 안이거나 **반올림 폭(±50만원) 안**인 것이다. 뒤엣것을',
  '안 빼면 설정액이 몇십만원인 펀드가 전부 "50% 틀림" 으로 잡힌다 —',
  '그건 자료가 아니라 감사 규칙이 틀린 것이다.',
  '',
  table(aumBoth.filter((r) => !amtSame(r.ourAum, r.kAum, r.aumRel)).sort((a, b) => Math.abs(b.aumRel) - Math.abs(a.aumRel)),
    ['표준코드', '이름', '우리 설정액', '금투협', '차이', '순자산 차이'],
    (r) => `| ${r.code} | ${r.name.slice(0, 24)} | ${won(r.ourAum)} | ${won(r.kAum)} | ${pct(r.aumRel)} | ${pct(r.navRel)} |`),
  '',
  '## 3. 항등식이 깨지던 펀드 — 저쪽에서는 어떤가',
  '',
  '우리 자료에서 `순자산 / 설정액 × 1000 = 기준가` 가 1% 넘게 깨지는 것이',
  `**${breakers.length}건**이다. 금투협은 셋을 **한 응답 한 기준일**로 주므로`,
  '저쪽에서 항등식이 성립하는지만 보면 누가 튄 것인지 갈린다.',
  '',
  (() => {
    const c = {};
    for (const r of breakers) c[r.verdict] = (c[r.verdict] || 0) + 1;
    return Object.entries(c).map(([k, v]) => `- ${k} — **${v}건**`).join('\n') || '_해당 없음_';
  })(),
  '',
  table(breakers.sort((a, b) => Math.abs(b.ourIdentityRel) - Math.abs(a.ourIdentityRel)),
    ['표준코드', '이름', '우리 잔차', '금투협 잔차', '우리 함의가', '금투협 함의가', '금투협 기준가', '판정'],
    (r) => `| ${r.code} | ${r.name.slice(0, 22)} | ${pct(r.ourIdentityRel)} | ${pct(r.kIdentityRel)} | ` +
           `${r.ourImplied?.toFixed(2) ?? '—'} | ${r.kImplied?.toFixed(2) ?? '—'} | ${r.kCot ?? '—'} | ${r.verdict} |`, 60),
  '',
  '## 4. 수익률 — 여기서 할 수 있는 것과 못 하는 것',
  '',
  '금투협이 한 응답에 같이 주는 수익률은 **1일·1주 등락률 둘뿐**이다.',
  '1개월 이상은 이 조회로 안 나온다. 그러니 화면의 11개 구간 중 9개는',
  '**이 탐침으로 확인되지 않는다.** 확인 못 한 것을 확인한 것처럼 적지 않는다.',
  '',
  '게다가 창이 하루씩 어긋나 있다(우리 1일 = 08-27치, 저쪽 1일 = 최신 영업일치).',
  '1일은 아예 겹치는 날이 없으므로 비교하지 않는다. 1주는 7일 중 6일이',
  '겹치므로 **크게 벌어진 것만** 눈으로 볼 목록으로 뽑는다. 여기 오른 것이',
  '곧 오류라는 뜻이 아니다 — 봐야 할 것이라는 뜻이다.',
  '',
  `- 1주 등락률 양쪽 다 있는 것 ${retBoth.length}건 · ${RET_WIDE}%p 넘게 벌어진 것 **${retWide.length}건**`,
  '',
  retWide.length
    ? table(retWide.sort((a, b) => Math.abs(b.ourRet1w - b.kRet1w) - Math.abs(a.ourRet1w - a.kRet1w)),
      ['표준코드', '이름', '우리 1주', '금투협 1주', '차이(%p)', '결산계단'],
      (r) => `| ${r.code} | ${r.name.slice(0, 26)} | ${r.ourRet1w} | ${r.kRet1w} | ` +
             `${(r.ourRet1w - r.kRet1w).toFixed(2)} | ${byCodeSteps.get(r.code) ?? 0} |`, 40)
    : '_없다._',
  '',
  '## 5. 기타 자료',
  '',
  `- **공모 여부**(\`vPriPubGBNm\`): ${Object.entries(priPub).map(([k, v]) => `${k} ${v}건`).join(' · ') || '_못 받음_'}`,
  notPublic.length
    ? `  - 공모가 아닌 것 **${notPublic.length}건**. 화면 제목이 "공모펀드" 이므로 이건 그냥 넘길 것이 아니다.\n` +
      notPublic.slice(0, 30).map((r) => `    - ${r.code} ${r.name.slice(0, 30)} — ${r.kPriPub}`).join('\n')
    : '  - 공모가 아닌 것은 없다.',
  '',
  `- **투자지역**: 양쪽 다 있는 것 ${regionBoth.length}건 중 다른 것 **${regionDiff.length}건**`,
  regionDiff.length
    ? table(regionDiff, ['표준코드', '이름', '우리', '금투협'],
      (r) => `| ${r.code} | ${r.name.slice(0, 30)} | ${r.ourRegion} | ${r.kRegion} |`, 30)
    : '',
  '',
  `- **설정일**: 양쪽 다 있는 것 ${incBoth.length}건 중 다른 것 **${incDiff.length}건**`,
  incDiff.length
    ? table(incDiff, ['표준코드', '이름', '우리', '금투협'],
      (r) => `| ${r.code} | ${r.name.slice(0, 30)} | ${r.ourInception} | ${r.kInception} |`, 30)
    : '',
  '',
  '- **유형명**은 세는 것으로 끝낸다. 양쪽 분류 체계가 다르므로 어긋남이',
  '  곧 오류가 아니다. 우리 화면은 원천의 유형명을 그대로 쓴다.',
  '',
  '## 6. 못 받은 것',
  '',
  failures.length
    ? `**${failures.length}건**. 못 받은 것은 못 받은 것이지 "틀렸다" 도 "맞다" 도 아니다.\n\n` +
      failures.slice(0, 40).map((f) => `- ${f.code} ${f.name?.slice(0, 30)} — ${f.error}`).join('\n')
    : '_없다._',
  '',
].join('\n');

await mkdir('tools/discovery', { recursive: true });
await writeFile(OUT_MD, md, 'utf8');
await writeFile(OUT_JSON, JSON.stringify({
  at: new Date().toISOString(),
  ourUpdatedAt: DATA.updatedAt,
  ourTradeDate: funds[0].tradeDate,
  counts: {
    target: funds.length, got: rows.length, failed: failures.length,
    cotBoth: cotBoth.length, cotSame, cotLag, cotNeither: cotNeither.length,
    aumBoth: aumBoth.length, aumSame, navBoth: navBoth.length, navSame,
    breakers: breakers.length, regionDiff: regionDiff.length, incDiff: incDiff.length,
    roundedAway: roundedRows.length, tinyAum: tinyAum.length,
  },
  kofiaDates: dts,
  priPub,
  notPublic: notPublic.map((r) => ({ code: r.code, name: r.name, kPriPub: r.kPriPub })),
  breakers,
  // 3,196줄을 통째로 싣지 않는다. 저장소에 25MB짜리 자료가 이미 있고
  // 여기에 3MB를 매번 더 얹을 이유가 없다. **걸린 줄만** 싣는다 —
  // 안 걸린 줄의 근거는 위의 집계 수치다.
  flagged: {
    기준가_둘다아님: cotNeither,
    설정액_어긋남: aumBoth.filter((r) => !amtSame(r.ourAum, r.kAum, r.aumRel)),
    순자산_어긋남: navBoth.filter((r) => !amtSame(r.ourNav, r.kNav, r.navRel)),
    투자지역_다름: regionDiff,
    설정일_다름: incDiff,
    '1주수익률_벌어짐': retWide,
  },
  failures,
}, null, 1), 'utf8');

console.log(`[verify] ${OUT_MD} · ${OUT_JSON}`);
console.log(`[verify] 기준가 그대로 ${cotSame} / 하루되돌림 ${cotLag} / 둘 다 아님 ${cotNeither.length} (모수 ${cotBoth.length})`);
console.log(`[verify] 항등식 파손 ${breakers.length}건 판정 완료`);
